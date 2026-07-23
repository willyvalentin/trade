export type ContinuousIntelligenceShadowCanaryHistoricalManualUsageEvidence = {
  claim_id: string;
  attempt_identity: string;
  provider_usage: "confirmed" | "not_reached" | "unknown";
  ledger_contract: "required" | "pre_ledger";
  audit_linkage: "matching" | "missing" | "unknown";
  ledger_linkage: "matching" | "missing" | "identity_collision" | "unknown";
};

export type ContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation =
  | {
      category: "balanced";
      provider_usage_units: number;
      claim_capacity_units: number;
      persisted_ledger_units: number;
      unmatched_claim_ids: [];
      readiness: "ready";
    }
  | {
      category: "verified_legacy_usage_requires_reconciliation";
      provider_usage_units: number;
      claim_capacity_units: number;
      persisted_ledger_units: number;
      unmatched_claim_ids: string[];
      readiness: "blocked";
    }
  | {
      category: "verified_non_usage_claim_excludable";
      provider_usage_units: number;
      claim_capacity_units: number;
      persisted_ledger_units: number;
      unmatched_claim_ids: string[];
      readiness: "blocked";
    }
  | {
      category: "duplicate_attempt_detected";
      provider_usage_units: number;
      claim_capacity_units: number;
      persisted_ledger_units: number;
      unmatched_claim_ids: string[];
      readiness: "blocked";
    }
  | {
      category: "missing_ledger_after_verified_provider_usage";
      provider_usage_units: number;
      claim_capacity_units: number;
      persisted_ledger_units: number;
      unmatched_claim_ids: string[];
      readiness: "blocked";
    }
  | {
      category: "missing_ledger_provider_usage_unknown";
      provider_usage_units: number;
      claim_capacity_units: number;
      persisted_ledger_units: number;
      unmatched_claim_ids: string[];
      readiness: "blocked";
    }
  | {
      category: "audit_ledger_disagreement";
      provider_usage_units: number;
      claim_capacity_units: number;
      persisted_ledger_units: number;
      unmatched_claim_ids: string[];
      readiness: "blocked";
    }
  | {
      category: "historical_state_unavailable" | "historical_state_malformed";
      provider_usage_units: null;
      claim_capacity_units: null;
      persisted_ledger_units: null;
      unmatched_claim_ids: [];
      readiness: "blocked";
    };

function isBoundedIdentity(value: unknown) {
  return typeof value === "string" && /^[A-Za-z0-9_-]+$/.test(value) && value.length > 0 && value.length <= 160;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function unavailable(
  category: "historical_state_unavailable" | "historical_state_malformed",
): ContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation {
  return {
    category,
    provider_usage_units: null,
    claim_capacity_units: null,
    persisted_ledger_units: null,
    unmatched_claim_ids: [],
    readiness: "blocked",
  };
}

function blocked(
  category: Exclude<ContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation["category"], "balanced" | "historical_state_unavailable" | "historical_state_malformed">,
  input: {
    provider_usage_units: number;
    claim_capacity_units: number;
    persisted_ledger_units: number;
    unmatched_claim_ids: string[];
  },
): ContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation {
  return { category, ...input, readiness: "blocked" };
}

/**
 * Classifies already-correlated manual history without changing accounting.
 * A caller must supply only manual claim evidence; scheduled rows are isolated
 * by the scheduled durable-state evaluator before this policy is consulted.
 */
export function evaluateContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation(input: {
  claims: unknown;
  persisted_ledger_units: unknown;
}): ContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation {
  if (!Array.isArray(input.claims) || !isNonNegativeInteger(input.persisted_ledger_units)) {
    return unavailable("historical_state_unavailable");
  }

  const persistedLedgerUnits = input.persisted_ledger_units;
  const claims = input.claims as ContinuousIntelligenceShadowCanaryHistoricalManualUsageEvidence[];
  if (claims.length === 0 || !claims.every((claim) =>
    typeof claim === "object" && claim !== null &&
    isBoundedIdentity(claim.claim_id) &&
    isBoundedIdentity(claim.attempt_identity) &&
    (claim.provider_usage === "confirmed" || claim.provider_usage === "not_reached" || claim.provider_usage === "unknown") &&
    (claim.ledger_contract === "required" || claim.ledger_contract === "pre_ledger") &&
    (claim.audit_linkage === "matching" || claim.audit_linkage === "missing" || claim.audit_linkage === "unknown") &&
    (claim.ledger_linkage === "matching" || claim.ledger_linkage === "missing" || claim.ledger_linkage === "identity_collision" || claim.ledger_linkage === "unknown"),
  )) {
    return unavailable("historical_state_malformed");
  }

  const claimIds = new Set<string>();
  const attemptIds = new Set<string>();
  for (const claim of claims) {
    if (claimIds.has(claim.claim_id) || attemptIds.has(claim.attempt_identity)) {
      return blocked("duplicate_attempt_detected", {
        provider_usage_units: claims.filter((item) => item.provider_usage === "confirmed").length,
        claim_capacity_units: claims.length,
        persisted_ledger_units: persistedLedgerUnits,
        unmatched_claim_ids: claims.filter((item) => item.ledger_linkage !== "matching").map((item) => item.claim_id),
      });
    }
    claimIds.add(claim.claim_id);
    attemptIds.add(claim.attempt_identity);
  }

  const providerUsageUnits = claims.filter((claim) => claim.provider_usage === "confirmed").length;
  const unmatched = claims.filter((claim) => claim.ledger_linkage !== "matching");
  const unmatchedClaimIds = unmatched.map((claim) => claim.claim_id);
  const counts = {
    provider_usage_units: providerUsageUnits,
    claim_capacity_units: claims.length,
    persisted_ledger_units: persistedLedgerUnits,
    unmatched_claim_ids: unmatchedClaimIds,
  };

  if (unmatched.length === 0 && persistedLedgerUnits === providerUsageUnits) {
    return { category: "balanced", ...counts, readiness: "ready", unmatched_claim_ids: [] };
  }
  if (unmatched.some((claim) => claim.provider_usage === "unknown" || claim.ledger_linkage === "unknown")) {
    return blocked("missing_ledger_provider_usage_unknown", counts);
  }
  if (unmatched.some((claim) => claim.provider_usage === "not_reached")) {
    return blocked("verified_non_usage_claim_excludable", counts);
  }
  if (unmatched.some((claim) => claim.audit_linkage !== "matching")) {
    return blocked("audit_ledger_disagreement", counts);
  }
  if (unmatched.some((claim) => claim.ledger_contract === "pre_ledger")) {
    return blocked("verified_legacy_usage_requires_reconciliation", counts);
  }
  return blocked("missing_ledger_after_verified_provider_usage", counts);
}
