export const continuousIntelligenceShadowCanaryClaimContractVersion =
  "continuous_intelligence_shadow_canary_daily_claim_v1" as const;
export const continuousIntelligenceShadowCanaryClaimTableName =
  "continuous_intelligence_shadow_canary_daily_claims" as const;
export const continuousIntelligenceShadowCanaryClaimRpcName =
  "claim_continuous_intelligence_shadow_canary" as const;
export const continuousIntelligenceShadowCanaryBeginAttemptRpcName =
  "begin_continuous_intelligence_shadow_canary_attempt" as const;
export const continuousIntelligenceShadowCanaryFinalizeAttemptRpcName =
  "finalize_continuous_intelligence_shadow_canary_attempt" as const;

export type ContinuousIntelligenceShadowCanaryClaimStatus =
  | "claimed"
  | "attempted"
  | "completed"
  | "failed";

export type ContinuousIntelligenceShadowCanaryClaimInput = {
  claim_id: string;
  execution_id: string;
  request_fingerprint: string;
  utc_day: string;
  estimated_credits: 1;
};

export type ContinuousIntelligenceShadowCanaryClaimRow =
  ContinuousIntelligenceShadowCanaryClaimInput & {
    contract_version: typeof continuousIntelligenceShadowCanaryClaimContractVersion;
    status: ContinuousIntelligenceShadowCanaryClaimStatus;
    provider_attempted: boolean;
    source_receipt_id: string | null;
    created_at: string;
    finalized_at: string | null;
  };

export type ContinuousIntelligenceShadowCanaryClaimResult =
  | {
      status: "claimed" | "already_claimed";
      claimed: true;
      idempotent: boolean;
      claim_id: string;
      claim_status: ContinuousIntelligenceShadowCanaryClaimStatus;
      safe_blocker: null;
    }
  | {
      status: "daily_run_limit_reached" | "daily_credit_limit_reached" | "daily_usage_unavailable";
      claimed: false;
      idempotent: false;
      claim_id: string | null;
      claim_status: null;
      safe_blocker: "daily_run_limit_reached" | "daily_credit_limit_reached" | "daily_usage_unavailable";
    };

export type ContinuousIntelligenceShadowCanaryBeginAttemptResult =
  | {
      status: "attempt_started";
      provider_execution_allowed: true;
      claim_id: string;
      claim_status: "attempted";
      safe_blocker: null;
    }
  | {
      status: "attempt_in_progress" | "already_completed" | "already_failed";
      provider_execution_allowed: false;
      claim_id: string;
      claim_status: "attempted" | "completed" | "failed";
      safe_blocker: "attempt_in_progress" | "already_completed" | "already_failed";
    }
  | {
      status: "daily_usage_unavailable";
      provider_execution_allowed: false;
      claim_id: null;
      claim_status: null;
      safe_blocker: "daily_usage_unavailable";
    };

export type ContinuousIntelligenceShadowCanaryLifecycleIdentity = {
  claim_id: string;
  execution_id: string;
  request_fingerprint: string;
  expected_contract_version: typeof continuousIntelligenceShadowCanaryClaimContractVersion;
  utc_day: string;
  source_receipt_id: string;
};

export type ContinuousIntelligenceShadowCanaryFinalizeAttemptResult =
  | {
      status: "finalized" | "already_completed" | "already_failed";
      finalization_proven: true;
      claim_id: string;
      claim_status: "completed" | "failed";
      provider_attempted: boolean;
      safe_blocker: null;
    }
  | {
      status: "invalid_transition" | "daily_usage_unavailable";
      finalization_proven: false;
      claim_id: string | null;
      claim_status: null;
      provider_attempted: null;
      safe_blocker: "invalid_transition" | "daily_usage_unavailable";
    };

export type ContinuousIntelligenceShadowCanaryClaimDatabase = {
  claim: (input: ContinuousIntelligenceShadowCanaryClaimInput) => Promise<{
    data: {
      claimed: boolean;
      idempotent: boolean;
      claim_id: string | null;
      claim_status: ContinuousIntelligenceShadowCanaryClaimStatus | null;
      blocker: "daily_run_limit_reached" | "daily_credit_limit_reached" | null;
    } | null;
    error: { code?: string } | null;
  }>;
  beginAttempt: (input: {
    claim_id: string;
    execution_id: string;
    request_fingerprint: string;
    expected_contract_version: typeof continuousIntelligenceShadowCanaryClaimContractVersion;
  }) => Promise<{
    data: {
      attempt_status: "attempt_started" | "attempt_in_progress" | "already_completed" | "already_failed" | "daily_usage_unavailable";
      claim_id: string | null;
      claim_status: ContinuousIntelligenceShadowCanaryClaimStatus | null;
    } | null;
    error: { code?: string } | null;
  }>;
  finalize: (input: {
    claim_id: string;
    execution_id: string;
    request_fingerprint: string;
    expected_contract_version: typeof continuousIntelligenceShadowCanaryClaimContractVersion;
    status: "completed" | "failed";
    provider_attempted: boolean;
    source_receipt_id: string | null;
    finalized_at: string;
  }) => Promise<{
    data: {
      finalization_status: "finalized" | "already_completed" | "already_failed" | "invalid_transition" | "daily_usage_unavailable";
      claim_id: string | null;
      claim_status: ContinuousIntelligenceShadowCanaryClaimStatus | null;
      provider_attempted: boolean | null;
    } | null;
    error: { code?: string } | null;
  }>;
};

function isUtcDay(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00.000Z`));
}

function bounded(value: string, maximum: number) {
  return value.length > 0 && value.length <= maximum;
}

export function buildContinuousIntelligenceShadowCanaryExecutionId(input: {
  utc_day: string;
  request_fingerprint: string;
}) {
  let hash = 2166136261;
  const value = `${input.utc_day}|${input.request_fingerprint}`;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `canary_execution_${input.utc_day.replaceAll("-", "")}_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function createContinuousIntelligenceShadowCanaryClaimStore(
  database: ContinuousIntelligenceShadowCanaryClaimDatabase | null,
) {
  return {
    async claim(input: ContinuousIntelligenceShadowCanaryClaimInput): Promise<ContinuousIntelligenceShadowCanaryClaimResult> {
      if (
        !database ||
        input.estimated_credits !== 1 ||
        !isUtcDay(input.utc_day) ||
        !bounded(input.claim_id, 128) ||
        !bounded(input.execution_id, 128) ||
        !bounded(input.request_fingerprint, 240)
      ) {
        return { status: "daily_usage_unavailable", claimed: false, idempotent: false, claim_id: null, claim_status: null, safe_blocker: "daily_usage_unavailable" };
      }
      try {
        const result = await database.claim(input);
        if (result.error || !result.data) {
          return { status: "daily_usage_unavailable", claimed: false, idempotent: false, claim_id: null, claim_status: null, safe_blocker: "daily_usage_unavailable" };
        }
        if (result.data.claimed && result.data.claim_id && result.data.claim_status) {
          return {
            status: result.data.idempotent ? "already_claimed" : "claimed",
            claimed: true,
            idempotent: result.data.idempotent,
            claim_id: result.data.claim_id,
            claim_status: result.data.claim_status,
            safe_blocker: null,
          };
        }
        const blocker = result.data.blocker;
        if (blocker === "daily_run_limit_reached" || blocker === "daily_credit_limit_reached") {
          return { status: blocker, claimed: false, idempotent: false, claim_id: null, claim_status: null, safe_blocker: blocker };
        }
      } catch {
        // Fail closed when a durable claim cannot be proven.
      }
      return { status: "daily_usage_unavailable", claimed: false, idempotent: false, claim_id: null, claim_status: null, safe_blocker: "daily_usage_unavailable" };
    },
    async beginAttempt(input: {
      claim_id: string;
      execution_id: string;
      request_fingerprint: string;
      expected_contract_version: typeof continuousIntelligenceShadowCanaryClaimContractVersion;
    }): Promise<ContinuousIntelligenceShadowCanaryBeginAttemptResult> {
      const unavailable = (): ContinuousIntelligenceShadowCanaryBeginAttemptResult => ({
        status: "daily_usage_unavailable",
        provider_execution_allowed: false,
        claim_id: null,
        claim_status: null,
        safe_blocker: "daily_usage_unavailable",
      });
      if (
        !database ||
        input.expected_contract_version !== continuousIntelligenceShadowCanaryClaimContractVersion ||
        !bounded(input.claim_id, 128) ||
        !bounded(input.execution_id, 128) ||
        !bounded(input.request_fingerprint, 240)
      ) return unavailable();
      try {
        const result = await database.beginAttempt(input);
        if (result.error || !result.data) return unavailable();
        const { attempt_status: status, claim_id: claimId, claim_status: claimStatus } = result.data;
        if (status === "attempt_started" && claimId && claimStatus === "attempted") {
          return { status, provider_execution_allowed: true, claim_id: claimId, claim_status: claimStatus, safe_blocker: null };
        }
        if (
          claimId &&
          ((status === "attempt_in_progress" && claimStatus === "attempted") ||
            (status === "already_completed" && claimStatus === "completed") ||
            (status === "already_failed" && claimStatus === "failed"))
        ) {
          return { status, provider_execution_allowed: false, claim_id: claimId, claim_status: claimStatus, safe_blocker: status };
        }
      } catch {
        // A provider attempt requires a proven single-winner transition.
      }
      return unavailable();
    },
    async finalize(input: {
      claim_id: string;
      execution_id: string;
      request_fingerprint: string;
      expected_contract_version: typeof continuousIntelligenceShadowCanaryClaimContractVersion;
      status: "completed" | "failed";
      provider_attempted: boolean;
      source_receipt_id: string | null;
      finalized_at: string;
    }): Promise<ContinuousIntelligenceShadowCanaryFinalizeAttemptResult> {
      const unavailable = (): ContinuousIntelligenceShadowCanaryFinalizeAttemptResult => ({ status: "daily_usage_unavailable", finalization_proven: false, claim_id: null, claim_status: null, provider_attempted: null, safe_blocker: "daily_usage_unavailable" });
      if (
        !database ||
        input.expected_contract_version !== continuousIntelligenceShadowCanaryClaimContractVersion ||
        !bounded(input.claim_id, 128) ||
        !bounded(input.execution_id, 128) ||
        !bounded(input.request_fingerprint, 240) ||
        (input.source_receipt_id !== null && !bounded(input.source_receipt_id, 128)) ||
        !Number.isFinite(Date.parse(input.finalized_at)) ||
        (input.status !== "completed" && input.status !== "failed")
      ) return unavailable();
      try {
        const result = await database.finalize(input);
        if (result.error || !result.data) return unavailable();
        const { finalization_status: status, claim_id: claimId, claim_status: claimStatus, provider_attempted: providerAttempted } = result.data;
        if (
          claimId &&
          typeof providerAttempted === "boolean" &&
          ((status === "finalized" && (claimStatus === "completed" || claimStatus === "failed")) ||
            (status === "already_completed" && claimStatus === "completed") ||
            (status === "already_failed" && claimStatus === "failed"))
        ) {
          return { status, finalization_proven: true, claim_id: claimId, claim_status: claimStatus, provider_attempted: providerAttempted, safe_blocker: null };
        }
        if (status === "invalid_transition") {
          return { status, finalization_proven: false, claim_id: claimId, claim_status: null, provider_attempted: null, safe_blocker: status };
        }
      } catch {
        // Terminal state requires a proven exact-identity transition.
      }
      return unavailable();
    },
  };
}
