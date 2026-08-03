import {
  parseDatabentoExplicitNanosecondInstantV1,
} from "./databento-explicit-nanosecond-instant-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1,
  marketContextDiagnosticContextSha256V1,
  stableMarketContextDiagnosticContextJsonV1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_RESULT_V2,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FINALIZATION_POLICY_V2,
  type MarketContextDiagnosticContextSnapshotV2,
} from "./diagnostic-context-feature-snapshot-v2";
import {
  MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_REGISTRY_V1,
} from "./diagnostic-context-trusted-source-registry-v1";

export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1 =
  "market_context_diagnostic_context_outcome_join_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_HANDOFF_V1 =
  "market_context_diagnostic_context_snapshot_handoff_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_BUNDLE_HANDOFF_V1 =
  "market_context_diagnostic_outcome_bundle_handoff_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1 =
  "market_context_diagnostic_context_outcome_authority_registry_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_V1 =
  "market_context_diagnostic_context_outcome_authority_v1" as const;

export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_TAXONOMY_V1 = [
  "joined",
  "insufficient_context",
  "incomplete_outcome",
  "conflicting",
  "not_point_in_time_safe",
  "unmappable",
] as const;

export type MarketContextDiagnosticContextOutcomeTaxonomyV1 =
  (typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_TAXONOMY_V1)[number];

export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_BOUNDARY_V1 = {
  diagnostic_only: true,
  shadow_only: true,
  official_ohlcv: false,
  canonical_performance_eligible: false,
  automatic_model_input_allowed: false,
  automatic_training_allowed: false,
  automatic_promotion_allowed: false,
  causal_claimed: false,
  live_ranking_effect: false,
} as const;

export type MarketContextDiagnosticContextOutcomeJoinRequestV1 = {
  contract_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1;
  external_join_id: string;
  context_snapshot_identity: string;
  outcome_identity: string;
  decision_reference: {
    external_decision_id: string;
    decision_unix_ns: string;
    instrument_id: string;
    opportunity_set_identity: string;
  };
};

export type MarketContextDiagnosticContextSnapshotHandoffV1 = {
  handoff_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_HANDOFF_V1;
  snapshot_identity: string;
  snapshot: MarketContextDiagnosticContextSnapshotV2;
  snapshot_verifier: {
    contract: string;
    version: string;
    evidence_digest: string;
  };
  handoff_digest: string;
};

export type MarketContextDiagnosticOutcomeBundleHandoffV1 = {
  handoff_version: typeof MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_BUNDLE_HANDOFF_V1;
  outcome_identity: string;
  decision_identity: {
    external_decision_id: string;
    decision_unix_ns: string;
    instrument_id: string;
  };
  opportunity_set: {
    identity: string;
    completeness: "complete" | "partial";
    membership: Array<{
      instrument_id: string;
      ordinal: number;
    }>;
    membership_digest: string;
  };
  versions: {
    baseline: string;
    candidate: string;
    evaluator: string;
  };
  outcome_window: {
    definition: string;
    start_timestamp: string;
    end_timestamp: string;
  };
  outcome_completion: {
    status: "completed" | "pending";
    completion_timestamp: string | null;
    evidence_digest: string;
  };
  evaluation: {
    capture_timestamp: string;
    evaluator_run_digest: string;
  };
  definitions: {
    target: string;
    stop: string;
    diagnostic_horizon: string;
  };
  cost_slippage: {
    status: "declared" | "not_available";
    cost_model_version: string | null;
    slippage_model_version: string | null;
    provenance_digest: string;
  };
  lineage: {
    provider_source: string;
    provider_version: string;
    evaluator_lineage_digest: string;
    outcome_lineage_digest: string;
  };
  membership: {
    period: string;
    cohort: string;
    dataset: string;
  };
  later_observed_outcome: {
    label: string;
    value: string | null;
    unit: string | null;
  };
  bundle_digest: string;
};

export type MarketContextDiagnosticContextOutcomeAuthorityRegistryV1 = {
  registry_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1;
  registry_identity: string;
  context_authority: {
    registry_identity: string;
    registry_version: typeof MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_REGISTRY_V1;
    registry_digest: string;
    verifier_version: string;
  };
  outcome_authority: {
    outcome_contract_version: typeof MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_BUNDLE_HANDOFF_V1;
    verifier_version: string;
    evaluator_version: string;
    evaluator_lineage_digest: string;
    authority_digest: string;
  };
  context_handoff_digests: Record<string, string>;
  outcome_bundle_digests: Record<string, string>;
  registry_digest: string;
};

export type MarketContextDiagnosticContextOutcomeAuthorityAnchorV1 = {
  registry_identity: string;
  registry_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1;
  registry_digest: string;
};

export type MarketContextDiagnosticContextOutcomeAuthorityV1 = {
  authority_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_V1;
  expected_registry_anchor: MarketContextDiagnosticContextOutcomeAuthorityAnchorV1;
  read_registry: () => unknown;
  read_context_handoff: (snapshotIdentity: string) =>
    | { status: "resolved"; handoff: unknown }
    | { status: "not_found" };
  read_outcome_bundle: (outcomeIdentity: string) =>
    | { status: "resolved"; bundle: unknown }
    | { status: "not_found" };
};

export type MarketContextDiagnosticContextOutcomeJoinDependenciesV1 = {
  enabled: boolean;
  kill_switch: boolean;
  authority?: MarketContextDiagnosticContextOutcomeAuthorityV1;
};

type JsonRecord = Record<string, unknown>;

export type MarketContextDiagnosticContextOutcomeJoinResultV1 = {
  contract_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1;
  taxonomy: MarketContextDiagnosticContextOutcomeTaxonomyV1;
  request_identity: {
    external_join_id: string;
    context_snapshot_identity: string;
    outcome_identity: string;
    request_digest: string;
  };
  authority_binding: {
    authority_version:
      | typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_V1
      | null;
    registry_identity: string | null;
    registry_version:
      | typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1
      | null;
    registry_digest: string | null;
    verification_status:
      | "verified"
      | "not_read_default_off"
      | "not_read_kill_switch"
      | "missing"
      | "lookup_failed"
      | "invalid"
      | "mismatch";
  };
  predictor_projection: null | {
    canonical_decision_identity: string;
    decision_unix_ns: string;
    instrument_id: string;
    opportunity_set_identity: string;
    opportunity_set_membership_digest: string;
    context_snapshot_identity: string;
    context_snapshot_digest: string;
    context_registry_identity: string;
    context_registry_version: string;
    context_registry_digest: string;
    finalized_bucket_authority:
      typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FINALIZATION_POLICY_V2;
    latest_finalized_bucket_unix_ns: string;
    observed_decision_time_context: unknown;
    normalized_dataset_digest: string;
    replay_dataset_digest: string;
    calendar_digest: string;
    predictor_digest: string;
  };
  label_projection: null | {
    outcome_identity: string;
    outcome_window_definition: string;
    outcome_interval_start_unix_ns: string;
    outcome_interval_end_unix_ns: string;
    outcome_completion_unix_ns: string;
    evaluation_capture_unix_ns: string;
    later_observed_outcome: MarketContextDiagnosticOutcomeBundleHandoffV1["later_observed_outcome"];
    evaluator_version: string;
    evaluator_lineage_digest: string;
    outcome_lineage_digest: string;
    target_definition: string;
    stop_definition: string;
    diagnostic_horizon_definition: string;
    cost_slippage: MarketContextDiagnosticOutcomeBundleHandoffV1["cost_slippage"];
    provider_source_lineage: {
      provider_source: string;
      provider_version: string;
    };
    period: string;
    cohort: string;
    dataset_membership: string;
    label_digest: string;
  };
  diagnostic_association: null | {
    join_identity_digest: string;
    predictor_digest: string;
    label_digest: string;
    association_digest: string;
    performance_publication_allowed: false;
    probability_mapping_allowed: false;
  };
  research_hypothesis: {
    namespace: "diagnostic_association_only";
    statement: "context_and_later_outcome_may_be_compared_without_causal_claim";
    tested: false;
  };
  reason_codes: string[];
  boundary: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_BOUNDARY_V1;
  result_digest: string;
};

const FORBIDDEN_CALLER_CLAIMS = new Set([
  "complete",
  "canonical",
  "verified",
  "trusted",
  "point_in_time_safe",
  "out_of_sample",
  "profitable",
  "causal",
  "performance_eligible",
  "model_input_allowed",
  "training_allowed",
  "promotion_allowed",
  "live_ranking_effect",
]);

function record(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function exactKeys(
  value: unknown,
  expected: readonly string[],
  path: string,
  reasons: string[],
) {
  const candidate = record(value);
  if (!candidate) {
    reasons.push(`closed_schema_not_object:${path}`);
    return null;
  }
  const expectedSet = new Set(expected);
  for (const key of Object.keys(candidate)) {
    if (!expectedSet.has(key)) {
      reasons.push(`closed_schema_unknown_field:${path}.${key}`);
    }
  }
  for (const key of expected) {
    if (!(key in candidate)) {
      reasons.push(`closed_schema_missing_field:${path}.${key}`);
    }
  }
  return candidate;
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function isUnixNs(value: unknown): value is string {
  return typeof value === "string" && /^(0|[1-9]\d*)$/.test(value);
}

function recursiveCallerClaimReasons(value: unknown) {
  const reasons: string[] = [];
  const seen = new Set<object>();
  function visit(candidate: unknown, path: string) {
    if (candidate === null || typeof candidate !== "object") return;
    if (seen.has(candidate)) {
      reasons.push(`caller_input_cycle_rejected:${path}`);
      return;
    }
    seen.add(candidate);
    if (Array.isArray(candidate)) {
      candidate.forEach((child, index) => visit(child, `${path}[${index}]`));
    } else {
      for (const [key, child] of Object.entries(candidate as JsonRecord)) {
        if (FORBIDDEN_CALLER_CLAIMS.has(key)) {
          reasons.push(`caller_authority_claim_forbidden:${path}.${key}`);
        }
        visit(child, `${path}.${key}`);
      }
    }
    seen.delete(candidate);
  }
  visit(value, "$");
  return reasons;
}

function validateRequest(value: unknown) {
  const reasons = recursiveCallerClaimReasons(value);
  const input = exactKeys(
    value,
    [
      "contract_version",
      "external_join_id",
      "context_snapshot_identity",
      "outcome_identity",
      "decision_reference",
    ],
    "$",
    reasons,
  );
  if (!input) return [...new Set(reasons)].sort();
  if (
    input.contract_version !==
    MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1
  ) {
    reasons.push("join_contract_version_mismatch");
  }
  for (const field of [
    "external_join_id",
    "context_snapshot_identity",
    "outcome_identity",
  ] as const) {
    if (typeof input[field] !== "string" || input[field].length === 0) {
      reasons.push(`request_identity_invalid:${field}`);
    }
  }
  const decision = exactKeys(
    input.decision_reference,
    [
      "external_decision_id",
      "decision_unix_ns",
      "instrument_id",
      "opportunity_set_identity",
    ],
    "$.decision_reference",
    reasons,
  );
  if (decision) {
    for (const field of [
      "external_decision_id",
      "instrument_id",
      "opportunity_set_identity",
    ] as const) {
      if (
        typeof decision[field] !== "string" ||
        decision[field].length === 0
      ) {
        reasons.push(`decision_reference_invalid:${field}`);
      }
    }
    if (!isUnixNs(decision.decision_unix_ns)) {
      reasons.push("decision_reference_invalid:decision_unix_ns");
    }
  }
  return [...new Set(reasons)].sort();
}

function stableEqual(left: unknown, right: unknown) {
  return (
    stableMarketContextDiagnosticContextJsonV1(left) ===
    stableMarketContextDiagnosticContextJsonV1(right)
  );
}

function digestWithout<T extends JsonRecord>(value: T, excluded: string) {
  return marketContextDiagnosticContextSha256V1(
    Object.fromEntries(
      Object.entries(value).filter(([key]) => key !== excluded),
    ),
  );
}

function canonicalInstantOrOriginal(value: unknown, field: string) {
  const parsed = parseDatabentoExplicitNanosecondInstantV1(value, field);
  return parsed.ok ? parsed.unix_nanoseconds : value;
}

export function marketContextDiagnosticOutcomeBundleDigestV1(
  value: Omit<MarketContextDiagnosticOutcomeBundleHandoffV1, "bundle_digest">,
) {
  return marketContextDiagnosticContextSha256V1({
    ...value,
    outcome_window: {
      ...value.outcome_window,
      start_timestamp: canonicalInstantOrOriginal(
        value.outcome_window.start_timestamp,
        "outcome_window.start_timestamp",
      ),
      end_timestamp: canonicalInstantOrOriginal(
        value.outcome_window.end_timestamp,
        "outcome_window.end_timestamp",
      ),
    },
    outcome_completion: {
      ...value.outcome_completion,
      completion_timestamp:
        value.outcome_completion.completion_timestamp === null
          ? null
          : canonicalInstantOrOriginal(
              value.outcome_completion.completion_timestamp,
              "outcome_completion.completion_timestamp",
            ),
    },
    evaluation: {
      ...value.evaluation,
      capture_timestamp: canonicalInstantOrOriginal(
        value.evaluation.capture_timestamp,
        "evaluation.capture_timestamp",
      ),
    },
  });
}

export function createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1(
  input: Omit<
    MarketContextDiagnosticContextOutcomeAuthorityRegistryV1,
    "registry_version" | "registry_digest"
  >,
): MarketContextDiagnosticContextOutcomeAuthorityRegistryV1 {
  const material = {
    registry_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1,
    registry_identity: input.registry_identity,
    context_authority: structuredClone(input.context_authority),
    outcome_authority: structuredClone(input.outcome_authority),
    context_handoff_digests: Object.fromEntries(
      Object.entries(input.context_handoff_digests).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
    outcome_bundle_digests: Object.fromEntries(
      Object.entries(input.outcome_bundle_digests).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
  };
  return {
    ...material,
    registry_digest:
      marketContextDiagnosticContextSha256V1(material),
  };
}

function validateDigestMap(value: unknown) {
  const candidate = record(value);
  return (
    candidate !== null &&
    Object.keys(candidate).length > 0 &&
    Object.entries(candidate).every(
      ([key, digest]) => key.length > 0 && isSha256(digest),
    )
  );
}

export function validateMarketContextDiagnosticContextOutcomeAuthorityRegistryV1(
  value: unknown,
): value is MarketContextDiagnosticContextOutcomeAuthorityRegistryV1 {
  const reasons: string[] = [];
  const registry = exactKeys(
    value,
    [
      "registry_version",
      "registry_identity",
      "context_authority",
      "outcome_authority",
      "context_handoff_digests",
      "outcome_bundle_digests",
      "registry_digest",
    ],
    "$",
    reasons,
  );
  if (!registry || reasons.length > 0) return false;
  const context = exactKeys(
    registry.context_authority,
    [
      "registry_identity",
      "registry_version",
      "registry_digest",
      "verifier_version",
    ],
    "$.context_authority",
    reasons,
  );
  const outcome = exactKeys(
    registry.outcome_authority,
    [
      "outcome_contract_version",
      "verifier_version",
      "evaluator_version",
      "evaluator_lineage_digest",
      "authority_digest",
    ],
    "$.outcome_authority",
    reasons,
  );
  if (!context || !outcome || reasons.length > 0) return false;
  const candidate =
    value as MarketContextDiagnosticContextOutcomeAuthorityRegistryV1;
  return (
    candidate.registry_version ===
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1 &&
    typeof candidate.registry_identity === "string" &&
    candidate.registry_identity.length > 0 &&
    context.registry_version ===
      MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_REGISTRY_V1 &&
    typeof context.registry_identity === "string" &&
    typeof context.verifier_version === "string" &&
    isSha256(context.registry_digest) &&
    outcome.outcome_contract_version ===
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_BUNDLE_HANDOFF_V1 &&
    typeof outcome.verifier_version === "string" &&
    typeof outcome.evaluator_version === "string" &&
    isSha256(outcome.evaluator_lineage_digest) &&
    isSha256(outcome.authority_digest) &&
    validateDigestMap(candidate.context_handoff_digests) &&
    validateDigestMap(candidate.outcome_bundle_digests) &&
    isSha256(candidate.registry_digest) &&
    digestWithout(candidate as unknown as JsonRecord, "registry_digest") ===
      candidate.registry_digest
  );
}

function validateContextHandoff(
  value: unknown,
  expectedDigest: string,
  registry: MarketContextDiagnosticContextOutcomeAuthorityRegistryV1,
) {
  const reasons: string[] = [];
  const handoff = exactKeys(
    value,
    [
      "handoff_version",
      "snapshot_identity",
      "snapshot",
      "snapshot_verifier",
      "handoff_digest",
    ],
    "$",
    reasons,
  );
  if (!handoff) return { handoff: null, reasons };
  const verifier = exactKeys(
    handoff.snapshot_verifier,
    ["contract", "version", "evidence_digest"],
    "$.snapshot_verifier",
    reasons,
  );
  const snapshot = record(handoff.snapshot);
  if (
    handoff.handoff_version !==
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_HANDOFF_V1 ||
    typeof handoff.snapshot_identity !== "string" ||
    !isSha256(handoff.handoff_digest) ||
    handoff.handoff_digest !== expectedDigest ||
    digestWithout(handoff, "handoff_digest") !== handoff.handoff_digest
  ) {
    reasons.push("context_handoff_digest_or_version_mismatch");
  }
  if (
    !verifier ||
    verifier.contract !== MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2 ||
    verifier.version !== registry.context_authority.verifier_version ||
    !isSha256(verifier.evidence_digest)
  ) {
    reasons.push("context_snapshot_verifier_mismatch");
  }
  if (!snapshot) {
    reasons.push("context_snapshot_missing");
  } else {
    const snapshotDigest = snapshot.feature_snapshot_digest;
    if (
      snapshot.contract_version !==
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2 ||
      snapshot.result_version !==
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_RESULT_V2 ||
      !isSha256(snapshotDigest) ||
      digestWithout(snapshot, "feature_snapshot_digest") !== snapshotDigest ||
      !stableEqual(
        snapshot.boundary,
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1,
      )
    ) {
      reasons.push("context_snapshot_content_or_boundary_mismatch");
    }
    const binding = record(record(snapshot.identities)?.trusted_source_registry);
    if (
      !binding ||
      binding.verification_status !== "verified" ||
      binding.registry_identity !==
        registry.context_authority.registry_identity ||
      binding.registry_version !==
        registry.context_authority.registry_version ||
      binding.registry_digest !== registry.context_authority.registry_digest
    ) {
      reasons.push("context_snapshot_registry_authority_mismatch");
    }
  }
  return {
    handoff:
      reasons.length === 0
        ? (value as MarketContextDiagnosticContextSnapshotHandoffV1)
        : null,
    reasons: [...new Set(reasons)].sort(),
  };
}

function validateMembership(
  value: unknown,
  reasons: string[],
) {
  const opportunity = exactKeys(
    value,
    ["identity", "completeness", "membership", "membership_digest"],
    "$.opportunity_set",
    reasons,
  );
  if (!opportunity) return;
  if (
    typeof opportunity.identity !== "string" ||
    !["complete", "partial"].includes(String(opportunity.completeness)) ||
    !Array.isArray(opportunity.membership) ||
    !isSha256(opportunity.membership_digest)
  ) {
    reasons.push("opportunity_set_structure_invalid");
    return;
  }
  const members: Array<{ instrument_id: string; ordinal: number }> = [];
  opportunity.membership.forEach((item, index) => {
    const member = exactKeys(
      item,
      ["instrument_id", "ordinal"],
      `$.opportunity_set.membership.${index}`,
      reasons,
    );
    if (
      !member ||
      typeof member.instrument_id !== "string" ||
      !Number.isSafeInteger(member.ordinal) ||
      Number(member.ordinal) < 0
    ) {
      reasons.push(`opportunity_member_invalid:${index}`);
      return;
    }
    members.push({
      instrument_id: member.instrument_id,
      ordinal: Number(member.ordinal),
    });
  });
  const canonical = [...members].sort(
    (left, right) =>
      left.ordinal - right.ordinal ||
      left.instrument_id.localeCompare(right.instrument_id),
  );
  if (
    new Set(canonical.map((member) => member.instrument_id)).size !==
      canonical.length ||
    new Set(canonical.map((member) => member.ordinal)).size !== canonical.length
  ) {
    reasons.push("opportunity_membership_duplicate_or_collision");
  }
  if (
    marketContextDiagnosticContextSha256V1(canonical) !==
    opportunity.membership_digest
  ) {
    reasons.push("opportunity_membership_digest_mismatch");
  }
}

function validateOutcomeBundle(
  value: unknown,
  expectedDigest: string,
  registry: MarketContextDiagnosticContextOutcomeAuthorityRegistryV1,
) {
  const reasons: string[] = [];
  const bundle = exactKeys(
    value,
    [
      "handoff_version",
      "outcome_identity",
      "decision_identity",
      "opportunity_set",
      "versions",
      "outcome_window",
      "outcome_completion",
      "evaluation",
      "definitions",
      "cost_slippage",
      "lineage",
      "membership",
      "later_observed_outcome",
      "bundle_digest",
    ],
    "$",
    reasons,
  );
  if (!bundle) return { bundle: null, reasons };
  if (
    bundle.handoff_version !==
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_BUNDLE_HANDOFF_V1 ||
    typeof bundle.outcome_identity !== "string" ||
    !isSha256(bundle.bundle_digest) ||
    bundle.bundle_digest !== expectedDigest ||
    marketContextDiagnosticOutcomeBundleDigestV1(
      Object.fromEntries(
        Object.entries(bundle).filter(([key]) => key !== "bundle_digest"),
      ) as Omit<
        MarketContextDiagnosticOutcomeBundleHandoffV1,
        "bundle_digest"
      >,
    ) !== bundle.bundle_digest
  ) {
    reasons.push("outcome_bundle_digest_or_version_mismatch");
  }
  const decision = exactKeys(
    bundle.decision_identity,
    ["external_decision_id", "decision_unix_ns", "instrument_id"],
    "$.decision_identity",
    reasons,
  );
  const versions = exactKeys(
    bundle.versions,
    ["baseline", "candidate", "evaluator"],
    "$.versions",
    reasons,
  );
  const window = exactKeys(
    bundle.outcome_window,
    ["definition", "start_timestamp", "end_timestamp"],
    "$.outcome_window",
    reasons,
  );
  const completion = exactKeys(
    bundle.outcome_completion,
    ["status", "completion_timestamp", "evidence_digest"],
    "$.outcome_completion",
    reasons,
  );
  const evaluation = exactKeys(
    bundle.evaluation,
    ["capture_timestamp", "evaluator_run_digest"],
    "$.evaluation",
    reasons,
  );
  const definitions = exactKeys(
    bundle.definitions,
    ["target", "stop", "diagnostic_horizon"],
    "$.definitions",
    reasons,
  );
  const cost = exactKeys(
    bundle.cost_slippage,
    [
      "status",
      "cost_model_version",
      "slippage_model_version",
      "provenance_digest",
    ],
    "$.cost_slippage",
    reasons,
  );
  const lineage = exactKeys(
    bundle.lineage,
    [
      "provider_source",
      "provider_version",
      "evaluator_lineage_digest",
      "outcome_lineage_digest",
    ],
    "$.lineage",
    reasons,
  );
  const membership = exactKeys(
    bundle.membership,
    ["period", "cohort", "dataset"],
    "$.membership",
    reasons,
  );
  const outcome = exactKeys(
    bundle.later_observed_outcome,
    ["label", "value", "unit"],
    "$.later_observed_outcome",
    reasons,
  );
  validateMembership(bundle.opportunity_set, reasons);
  if (
    !decision ||
    typeof decision.external_decision_id !== "string" ||
    !isUnixNs(decision.decision_unix_ns) ||
    typeof decision.instrument_id !== "string"
  ) {
    reasons.push("outcome_decision_identity_invalid");
  }
  if (
    !versions ||
    typeof versions.baseline !== "string" ||
    typeof versions.candidate !== "string" ||
    versions.evaluator !== registry.outcome_authority.evaluator_version
  ) {
    reasons.push("outcome_evaluator_version_mismatch");
  }
  if (
    !window ||
    typeof window.definition !== "string" ||
    typeof window.start_timestamp !== "string" ||
    typeof window.end_timestamp !== "string"
  ) {
    reasons.push("outcome_window_invalid");
  }
  if (
    !completion ||
    !["completed", "pending"].includes(String(completion.status)) ||
    !isSha256(completion.evidence_digest)
  ) {
    reasons.push("outcome_completion_evidence_invalid");
  }
  if (
    !evaluation ||
    typeof evaluation.capture_timestamp !== "string" ||
    !isSha256(evaluation.evaluator_run_digest)
  ) {
    reasons.push("outcome_evaluation_invalid");
  }
  if (
    !definitions ||
    !Object.values(definitions).every(
      (item) => typeof item === "string" && item.length > 0,
    )
  ) {
    reasons.push("outcome_definitions_invalid");
  }
  if (
    !cost ||
    !["declared", "not_available"].includes(String(cost.status)) ||
    !isSha256(cost.provenance_digest) ||
    (cost.status === "declared" &&
      (typeof cost.cost_model_version !== "string" ||
        typeof cost.slippage_model_version !== "string"))
  ) {
    reasons.push("cost_slippage_provenance_invalid");
  }
  if (
    !lineage ||
    typeof lineage.provider_source !== "string" ||
    typeof lineage.provider_version !== "string" ||
    !isSha256(lineage.evaluator_lineage_digest) ||
    !isSha256(lineage.outcome_lineage_digest)
  ) {
    reasons.push("outcome_provider_or_evaluator_lineage_invalid");
  } else if (
    lineage.evaluator_lineage_digest !==
    registry.outcome_authority.evaluator_lineage_digest
  ) {
    reasons.push("outcome_evaluator_lineage_mismatch");
  }
  if (
    !membership ||
    !Object.values(membership).every(
      (item) => typeof item === "string" && item.length > 0,
    ) ||
    !outcome ||
    typeof outcome.label !== "string" ||
    !(
      outcome.value === null ||
      typeof outcome.value === "string"
    ) ||
    !(outcome.unit === null || typeof outcome.unit === "string")
  ) {
    reasons.push("outcome_membership_or_label_invalid");
  }
  return {
    bundle:
      reasons.length === 0
        ? (value as MarketContextDiagnosticOutcomeBundleHandoffV1)
        : null,
    reasons: [...new Set(reasons)].sort(),
  };
}

function safeRequestIdentity(value: unknown, unreadReason?: string) {
  if (unreadReason) {
    return {
      external_join_id: unreadReason,
      context_snapshot_identity: unreadReason,
      outcome_identity: unreadReason,
      request_digest:
        marketContextDiagnosticContextSha256V1({ unread: unreadReason }),
    };
  }
  try {
    const candidate = record(value);
    return {
      external_join_id:
        typeof candidate?.external_join_id === "string"
          ? candidate.external_join_id
          : "invalid",
      context_snapshot_identity:
        typeof candidate?.context_snapshot_identity === "string"
          ? candidate.context_snapshot_identity
          : "invalid",
      outcome_identity:
        typeof candidate?.outcome_identity === "string"
          ? candidate.outcome_identity
          : "invalid",
      request_digest: marketContextDiagnosticContextSha256V1(value),
    };
  } catch {
    return {
      external_join_id: "invalid",
      context_snapshot_identity: "invalid",
      outcome_identity: "invalid",
      request_digest:
        marketContextDiagnosticContextSha256V1({
          unreadable: true,
        }),
    };
  }
}

function authorityBinding(
  anchor: MarketContextDiagnosticContextOutcomeAuthorityAnchorV1 | null,
  status: MarketContextDiagnosticContextOutcomeJoinResultV1["authority_binding"]["verification_status"],
) {
  return {
    authority_version:
      anchor === null
        ? null
        : MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_V1,
    registry_identity: anchor?.registry_identity ?? null,
    registry_version: anchor?.registry_version ?? null,
    registry_digest: anchor?.registry_digest ?? null,
    verification_status: status,
  };
}

function result(
  requestIdentity: MarketContextDiagnosticContextOutcomeJoinResultV1["request_identity"],
  taxonomy: MarketContextDiagnosticContextOutcomeTaxonomyV1,
  reasons: string[],
  binding: MarketContextDiagnosticContextOutcomeJoinResultV1["authority_binding"],
  projections?: {
    predictor: NonNullable<MarketContextDiagnosticContextOutcomeJoinResultV1["predictor_projection"]>;
    label: NonNullable<MarketContextDiagnosticContextOutcomeJoinResultV1["label_projection"]>;
    association: NonNullable<MarketContextDiagnosticContextOutcomeJoinResultV1["diagnostic_association"]>;
  },
): MarketContextDiagnosticContextOutcomeJoinResultV1 {
  const material = {
    contract_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1,
    taxonomy,
    request_identity: requestIdentity,
    authority_binding: binding,
    predictor_projection: projections?.predictor ?? null,
    label_projection: projections?.label ?? null,
    diagnostic_association: projections?.association ?? null,
    research_hypothesis: {
      namespace: "diagnostic_association_only" as const,
      statement:
        "context_and_later_outcome_may_be_compared_without_causal_claim" as const,
      tested: false as const,
    },
    reason_codes: [...new Set(reasons)].sort(),
    boundary: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_BOUNDARY_V1,
  };
  return {
    ...material,
    result_digest:
      marketContextDiagnosticContextSha256V1(material),
  };
}

function parseExplicitInstant(
  value: unknown,
  field: string,
  reasons: string[],
) {
  const parsed = parseDatabentoExplicitNanosecondInstantV1(value, field);
  if (!parsed.ok) {
    reasons.push(`explicit_instant_invalid:${field}`);
    return null;
  }
  return BigInt(parsed.unix_nanoseconds);
}

function contextTemporalReasons(
  snapshot: MarketContextDiagnosticContextSnapshotV2,
) {
  const reasons: string[] = [];
  if (!isUnixNs(snapshot.decision_unix_ns)) {
    return ["context_decision_unix_ns_invalid"];
  }
  const decisionNs = BigInt(snapshot.decision_unix_ns);
  const latest = snapshot.point_in_time.latest_finalized_bucket_unix_ns;
  if (!isUnixNs(latest)) {
    reasons.push("context_latest_finalized_bucket_missing");
  } else if (BigInt(latest) > decisionNs) {
    reasons.push("context_latest_finalized_bucket_after_decision");
  } else {
    const watermark =
      snapshot.identities.policy_bundle.provisional_watermark_ns;
    if (
      !isUnixNs(watermark) ||
      BigInt(latest) + BigInt(watermark) !== decisionNs
    ) {
      reasons.push("context_finalized_bucket_watermark_binding_mismatch");
    }
  }
  if (
    snapshot.point_in_time.finalization_policy_version !==
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FINALIZATION_POLICY_V2 ||
    snapshot.point_in_time.provider_timestamp_after_decision_count !== 0 ||
    snapshot.point_in_time.future_input_points_passed_to_core !== 0 ||
    snapshot.point_in_time.record_finalization_violation_count !== 0 ||
    snapshot.point_in_time.candle_bucket_end_after_finalized_boundary_count !==
      0 ||
    snapshot.point_in_time.finalization_timestamp_after_decision_count !== 0 ||
    snapshot.point_in_time.current_full_day_aggregation_used !== false ||
    snapshot.point_in_time.pending_buckets_counted_as_missing !== false
  ) {
    reasons.push("context_point_in_time_or_finalization_counter_invalid");
  }
  const timestamps = snapshot.context?.provider_context_timestamps ?? [];
  timestamps.forEach((item, index) => {
    const provider = record(item);
    for (const key of ["source_timestamp", "received_timestamp"]) {
      if (provider?.[key] === undefined) continue;
      const parsed = parseExplicitInstant(
        provider[key],
        `context.provider_context_timestamps.${index}.${key}`,
        reasons,
      );
      if (parsed !== null && parsed > decisionNs) {
        reasons.push(`context_provider_timestamp_after_decision:${index}.${key}`);
      }
    }
  });
  return [...new Set(reasons)].sort();
}

function classifyContext(
  snapshot: MarketContextDiagnosticContextSnapshotV2,
) {
  if (snapshot.taxonomy === "insufficient_data") {
    return {
      taxonomy: "insufficient_context" as const,
      reasons: ["context_snapshot_insufficient"],
    };
  }
  if (snapshot.taxonomy === "conflicting") {
    return {
      taxonomy: "conflicting" as const,
      reasons: ["context_snapshot_conflicting"],
    };
  }
  if (snapshot.taxonomy === "not_point_in_time_safe") {
    return {
      taxonomy: "not_point_in_time_safe" as const,
      reasons: ["context_snapshot_not_point_in_time_safe"],
    };
  }
  if (snapshot.taxonomy !== "mapped" || snapshot.context === null) {
    return {
      taxonomy: "insufficient_context" as const,
      reasons: ["context_snapshot_not_mapped"],
    };
  }
  return null;
}

export function createMarketContextDiagnosticContextOutcomeJoinV1(
  value: unknown,
  dependencies: MarketContextDiagnosticContextOutcomeJoinDependenciesV1,
): MarketContextDiagnosticContextOutcomeJoinResultV1 {
  if (!dependencies.enabled) {
    return result(
      safeRequestIdentity(undefined, "unread_default_off"),
      "insufficient_context",
      ["join_default_off"],
      authorityBinding(null, "not_read_default_off"),
    );
  }
  if (dependencies.kill_switch) {
    return result(
      safeRequestIdentity(undefined, "unread_kill_switch"),
      "conflicting",
      ["join_kill_switch_active"],
      authorityBinding(null, "not_read_kill_switch"),
    );
  }

  let validation: string[];
  try {
    validation = validateRequest(value);
  } catch {
    validation = ["caller_request_unreadable"];
  }
  const requestIdentity = safeRequestIdentity(value);
  if (validation.length > 0) {
    return result(
      requestIdentity,
      validation.some((reason) =>
        reason.startsWith("decision_reference_invalid:decision_unix_ns"),
      )
        ? "not_point_in_time_safe"
        : "conflicting",
      validation,
      authorityBinding(null, "invalid"),
    );
  }
  const request = value as MarketContextDiagnosticContextOutcomeJoinRequestV1;
  const authority = dependencies.authority;
  if (
    !authority ||
    authority.authority_version !==
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_V1
  ) {
    return result(
      requestIdentity,
      "conflicting",
      ["external_join_authority_missing_or_invalid"],
      authorityBinding(null, "missing"),
    );
  }
  const anchor = authority.expected_registry_anchor;
  let registryValue: unknown;
  try {
    registryValue = structuredClone(authority.read_registry());
  } catch {
    return result(
      requestIdentity,
      "conflicting",
      ["external_join_registry_lookup_failed"],
      authorityBinding(anchor, "lookup_failed"),
    );
  }
  if (
    !validateMarketContextDiagnosticContextOutcomeAuthorityRegistryV1(
      registryValue,
    )
  ) {
    return result(
      requestIdentity,
      "conflicting",
      ["external_join_registry_invalid"],
      authorityBinding(anchor, "invalid"),
    );
  }
  const registry = registryValue;
  if (
    anchor.registry_identity !== registry.registry_identity ||
    anchor.registry_version !== registry.registry_version ||
    anchor.registry_digest !== registry.registry_digest
  ) {
    return result(
      requestIdentity,
      "conflicting",
      ["external_join_registry_anchor_mismatch"],
      authorityBinding(anchor, "mismatch"),
    );
  }
  const verifiedBinding = authorityBinding(anchor, "verified");
  const expectedContextDigest =
    registry.context_handoff_digests[request.context_snapshot_identity];
  if (!expectedContextDigest) {
    return result(
      requestIdentity,
      "insufficient_context",
      ["context_snapshot_reference_not_registered"],
      verifiedBinding,
    );
  }
  const expectedOutcomeDigest =
    registry.outcome_bundle_digests[request.outcome_identity];
  if (!expectedOutcomeDigest) {
    return result(
      requestIdentity,
      "unmappable",
      ["outcome_reference_not_registered"],
      verifiedBinding,
    );
  }

  let contextResolution;
  try {
    contextResolution = structuredClone(
      authority.read_context_handoff(request.context_snapshot_identity),
    );
  } catch {
    return result(
      requestIdentity,
      "conflicting",
      ["context_handoff_lookup_failed"],
      verifiedBinding,
    );
  }
  if (contextResolution.status !== "resolved") {
    return result(
      requestIdentity,
      "insufficient_context",
      ["context_handoff_not_found"],
      verifiedBinding,
    );
  }
  const contextValidation = validateContextHandoff(
    contextResolution.handoff,
    expectedContextDigest,
    registry,
  );
  if (!contextValidation.handoff) {
    return result(
      requestIdentity,
      "conflicting",
      contextValidation.reasons,
      verifiedBinding,
    );
  }
  const handoff = contextValidation.handoff;
  const contextClassification = classifyContext(handoff.snapshot);
  if (contextClassification) {
    return result(
      requestIdentity,
      contextClassification.taxonomy,
      contextClassification.reasons,
      verifiedBinding,
    );
  }
  const contextTemporal = contextTemporalReasons(handoff.snapshot);
  if (contextTemporal.length > 0) {
    return result(
      requestIdentity,
      "not_point_in_time_safe",
      contextTemporal,
      verifiedBinding,
    );
  }

  let outcomeResolution;
  try {
    outcomeResolution = structuredClone(
      authority.read_outcome_bundle(request.outcome_identity),
    );
  } catch {
    return result(
      requestIdentity,
      "conflicting",
      ["outcome_bundle_lookup_failed"],
      verifiedBinding,
    );
  }
  if (outcomeResolution.status !== "resolved") {
    return result(
      requestIdentity,
      "unmappable",
      ["outcome_bundle_not_found"],
      verifiedBinding,
    );
  }
  const outcomeValidation = validateOutcomeBundle(
    outcomeResolution.bundle,
    expectedOutcomeDigest,
    registry,
  );
  if (!outcomeValidation.bundle) {
    return result(
      requestIdentity,
      "conflicting",
      outcomeValidation.reasons,
      verifiedBinding,
    );
  }
  const bundle = outcomeValidation.bundle;
  const snapshot = handoff.snapshot;
  const opportunity = bundle.opportunity_set;

  const identityReasons: string[] = [];
  if (
    request.decision_reference.external_decision_id !==
      snapshot.decision_identity.external_decision_id ||
    request.decision_reference.external_decision_id !==
      bundle.decision_identity.external_decision_id ||
    request.decision_reference.decision_unix_ns !== snapshot.decision_unix_ns ||
    request.decision_reference.decision_unix_ns !==
      bundle.decision_identity.decision_unix_ns
  ) {
    identityReasons.push("decision_identity_or_timestamp_mismatch");
  }
  if (
    request.decision_reference.instrument_id !==
      bundle.decision_identity.instrument_id ||
    (snapshot.decision_identity.symbol_identity !== null &&
      snapshot.decision_identity.symbol_identity !==
        request.decision_reference.instrument_id)
  ) {
    identityReasons.push("instrument_identity_mismatch");
  }
  if (
    request.decision_reference.opportunity_set_identity !==
      opportunity.identity ||
    snapshot.decision_identity.opportunity_set_identity !== opportunity.identity
  ) {
    identityReasons.push("opportunity_set_identity_mismatch");
  }
  if (opportunity.completeness !== "complete") {
    identityReasons.push("opportunity_set_membership_incomplete");
  }
  if (
    !opportunity.membership.some(
      (member) =>
        member.instrument_id === request.decision_reference.instrument_id,
    )
  ) {
    identityReasons.push("instrument_missing_from_opportunity_set");
  }
  if (identityReasons.length > 0) {
    return result(
      requestIdentity,
      "conflicting",
      identityReasons,
      verifiedBinding,
    );
  }

  if (bundle.outcome_completion.status !== "completed") {
    return result(
      requestIdentity,
      "incomplete_outcome",
      ["outcome_window_not_completed"],
      verifiedBinding,
    );
  }
  const temporalReasons: string[] = [];
  const decisionNs = BigInt(request.decision_reference.decision_unix_ns);
  const startNs = parseExplicitInstant(
    bundle.outcome_window.start_timestamp,
    "outcome_window.start_timestamp",
    temporalReasons,
  );
  const endNs = parseExplicitInstant(
    bundle.outcome_window.end_timestamp,
    "outcome_window.end_timestamp",
    temporalReasons,
  );
  const completionNs = parseExplicitInstant(
    bundle.outcome_completion.completion_timestamp,
    "outcome_completion.completion_timestamp",
    temporalReasons,
  );
  const captureNs = parseExplicitInstant(
    bundle.evaluation.capture_timestamp,
    "evaluation.capture_timestamp",
    temporalReasons,
  );
  if (
    startNs !== null &&
    endNs !== null &&
    completionNs !== null &&
    captureNs !== null &&
    !(
      decisionNs < startNs &&
      startNs <= endNs &&
      endNs <= completionNs &&
      completionNs <= captureNs
    )
  ) {
    temporalReasons.push("outcome_temporal_separation_invalid");
  }
  if (temporalReasons.length > 0) {
    return result(
      requestIdentity,
      "not_point_in_time_safe",
      temporalReasons,
      verifiedBinding,
    );
  }

  const latestFinalized =
    snapshot.point_in_time.latest_finalized_bucket_unix_ns;
  if (
    !isUnixNs(latestFinalized) ||
    startNs === null ||
    endNs === null ||
    completionNs === null ||
    captureNs === null
  ) {
    return result(
      requestIdentity,
      "not_point_in_time_safe",
      ["temporal_projection_unavailable"],
      verifiedBinding,
    );
  }
  const predictorMaterial = {
    canonical_decision_identity:
      snapshot.decision_identity.external_decision_id,
    decision_unix_ns: snapshot.decision_unix_ns,
    instrument_id: request.decision_reference.instrument_id,
    opportunity_set_identity: opportunity.identity,
    opportunity_set_membership_digest: opportunity.membership_digest,
    context_snapshot_identity: handoff.snapshot_identity,
    context_snapshot_digest: snapshot.feature_snapshot_digest,
    context_registry_identity:
      registry.context_authority.registry_identity,
    context_registry_version:
      registry.context_authority.registry_version,
    context_registry_digest: registry.context_authority.registry_digest,
    finalized_bucket_authority:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FINALIZATION_POLICY_V2,
    latest_finalized_bucket_unix_ns: latestFinalized,
    observed_decision_time_context: structuredClone(snapshot.context),
    normalized_dataset_digest:
      snapshot.identities.normalized_dataset.dataset_digest,
    replay_dataset_digest: snapshot.identities.replay.dataset_digest,
    calendar_digest: snapshot.identities.calendar.digest,
  };
  const predictor = {
    ...predictorMaterial,
    predictor_digest:
      marketContextDiagnosticContextSha256V1(predictorMaterial),
  };
  const labelMaterial = {
    outcome_identity: bundle.outcome_identity,
    outcome_window_definition: bundle.outcome_window.definition,
    outcome_interval_start_unix_ns: startNs.toString(),
    outcome_interval_end_unix_ns: endNs.toString(),
    outcome_completion_unix_ns: completionNs.toString(),
    evaluation_capture_unix_ns: captureNs.toString(),
    later_observed_outcome: structuredClone(bundle.later_observed_outcome),
    evaluator_version: bundle.versions.evaluator,
    evaluator_lineage_digest: bundle.lineage.evaluator_lineage_digest,
    outcome_lineage_digest: bundle.lineage.outcome_lineage_digest,
    target_definition: bundle.definitions.target,
    stop_definition: bundle.definitions.stop,
    diagnostic_horizon_definition:
      bundle.definitions.diagnostic_horizon,
    cost_slippage: structuredClone(bundle.cost_slippage),
    provider_source_lineage: {
      provider_source: bundle.lineage.provider_source,
      provider_version: bundle.lineage.provider_version,
    },
    period: bundle.membership.period,
    cohort: bundle.membership.cohort,
    dataset_membership: bundle.membership.dataset,
  };
  const label = {
    ...labelMaterial,
    label_digest:
      marketContextDiagnosticContextSha256V1(labelMaterial),
  };
  const joinIdentityMaterial = {
    join_contract_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1,
    external_join_id: request.external_join_id,
    canonical_decision_identity: predictor.canonical_decision_identity,
    decision_unix_ns: predictor.decision_unix_ns,
    instrument_id: predictor.instrument_id,
    opportunity_set_identity: predictor.opportunity_set_identity,
    opportunity_set_membership_digest:
      predictor.opportunity_set_membership_digest,
    context_snapshot_identity: predictor.context_snapshot_identity,
    context_snapshot_digest: predictor.context_snapshot_digest,
    context_registry_identity: predictor.context_registry_identity,
    context_registry_version: predictor.context_registry_version,
    context_registry_digest: predictor.context_registry_digest,
    baseline_version: bundle.versions.baseline,
    candidate_version: bundle.versions.candidate,
    evaluator_version: bundle.versions.evaluator,
    outcome_identity: bundle.outcome_identity,
    outcome_window_definition: label.outcome_window_definition,
    outcome_completion_unix_ns: label.outcome_completion_unix_ns,
    target_definition: label.target_definition,
    stop_definition: label.stop_definition,
    diagnostic_horizon_definition: label.diagnostic_horizon_definition,
    cost_slippage_provenance_digest:
      label.cost_slippage.provenance_digest,
    provider_source_lineage: label.provider_source_lineage,
    period: label.period,
    cohort: label.cohort,
    dataset_membership: label.dataset_membership,
  };
  const joinIdentityDigest =
    marketContextDiagnosticContextSha256V1(joinIdentityMaterial);
  const associationMaterial = {
    join_identity_digest: joinIdentityDigest,
    predictor_digest: predictor.predictor_digest,
    label_digest: label.label_digest,
  };
  const association = {
    ...associationMaterial,
    association_digest:
      marketContextDiagnosticContextSha256V1(associationMaterial),
    performance_publication_allowed: false as const,
    probability_mapping_allowed: false as const,
  };
  return result(
    requestIdentity,
    "joined",
    ["diagnostic_context_outcome_association_joined"],
    verifiedBinding,
    { predictor, label, association },
  );
}

export function createMarketContextDiagnosticContextOutcomeJoinBatchV1(
  values: unknown[],
  dependencies: MarketContextDiagnosticContextOutcomeJoinDependenciesV1,
) {
  if (!dependencies.enabled || dependencies.kill_switch) {
    return [
      createMarketContextDiagnosticContextOutcomeJoinV1(
        undefined,
        dependencies,
      ),
    ];
  }
  const groups = new Map<string, Array<{ value: unknown; digest: string }>>();
  for (const value of values) {
    const identity = safeRequestIdentity(value);
    const items = groups.get(identity.external_join_id) ?? [];
    items.push({ value, digest: identity.request_digest });
    groups.set(identity.external_join_id, items);
  }
  const results: MarketContextDiagnosticContextOutcomeJoinResultV1[] = [];
  for (const [identity, items] of groups) {
    if (items.length === 1) {
      results.push(
        createMarketContextDiagnosticContextOutcomeJoinV1(
          items[0]?.value,
          dependencies,
        ),
      );
      continue;
    }
    const collision =
      new Set(items.map((item) => item.digest)).size > 1;
    for (const item of items) {
      results.push(
        result(
          safeRequestIdentity(item.value),
          "conflicting",
          [
            collision
              ? "join_identity_collision"
              : "duplicate_join_identity",
          ],
          authorityBinding(
            dependencies.authority?.expected_registry_anchor ?? null,
            "invalid",
          ),
        ),
      );
    }
    if (identity === "invalid") {
      continue;
    }
  }
  return results.sort(
    (left, right) =>
      left.request_identity.external_join_id.localeCompare(
        right.request_identity.external_join_id,
      ) ||
      left.request_identity.request_digest.localeCompare(
        right.request_identity.request_digest,
      ),
  );
}

export function verifyMarketContextDiagnosticContextOutcomeJoinV1(
  candidate: MarketContextDiagnosticContextOutcomeJoinResultV1,
  request: unknown,
  dependencies: MarketContextDiagnosticContextOutcomeJoinDependenciesV1,
) {
  return stableEqual(
    candidate,
    createMarketContextDiagnosticContextOutcomeJoinV1(request, dependencies),
  );
}
