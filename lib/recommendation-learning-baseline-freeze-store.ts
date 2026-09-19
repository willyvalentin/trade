import type { RecommendationLearningEvaluationPlan } from "@/lib/recommendation-learning-evaluation-plan";

export const recommendationLearningBaselineFreezeContractVersion =
  "recommendation_learning_baseline_freeze_v1" as const;
export const recommendationLearningBaselineFreezeRpcName =
  "freeze_recommendation_learning_baseline_with_charter" as const;
export const recommendationLearningBaselineFreezeReadRpcName =
  "read_recommendation_learning_baseline_with_charter" as const;

export type RecommendationLearningBaselineFreeze = {
  baseline_id: string;
  baseline_fingerprint: string;
  owner_user_id: string;
  segment_key: string;
  decision_record_fingerprints: string[];
  evaluation_plan: RecommendationLearningEvaluationPlan;
  evaluation_charter_fingerprint: string;
  frozen_at: string;
};

export type RecommendationLearningBaselineFreezeInput = {
  baseline_fingerprint: string;
  owner_user_id: string;
  segment_key: string;
  decision_record_fingerprints: string[];
  evaluation_plan: RecommendationLearningEvaluationPlan;
  evaluation_charter_fingerprint: string;
};

type FreezeRow = {
  freeze_status: string;
  baseline_id: string | null;
  baseline_fingerprint: string | null;
  owner_user_id: string | null;
  segment_key: string | null;
  decision_record_fingerprints: string[] | null;
  evaluation_plan: unknown;
  evaluation_charter_fingerprint: string | null;
  frozen_at: string | null;
  idempotent: boolean;
  blocker: string | null;
};

type ReadRow = {
  readback_status: string;
  baseline_id: string | null;
  baseline_fingerprint: string | null;
  owner_user_id: string | null;
  segment_key: string | null;
  decision_record_fingerprints: string[] | null;
  evaluation_plan: unknown;
  evaluation_charter_fingerprint: string | null;
  frozen_at: string | null;
  blocker: string | null;
};

export type RecommendationLearningBaselineFreezeDatabase = {
  freeze: (input: RecommendationLearningBaselineFreezeInput) => Promise<{
    data: FreezeRow | null;
    error: { code?: string } | null;
  }>;
  read: (ownerUserId: string) => Promise<{
    data: ReadRow | null;
    error: { code?: string } | null;
  }>;
};

export type RecommendationLearningBaselineFreezeResult =
  | {
      status: "frozen" | "already_frozen";
      freeze: RecommendationLearningBaselineFreeze;
      safe_blocker: null;
    }
  | {
      status: "unavailable" | "different_baseline_already_frozen";
      freeze: null;
      safe_blocker: string;
    };

export type RecommendationLearningBaselineFreezeReadResult =
  | {
      status: "available";
      freeze: RecommendationLearningBaselineFreeze;
      safe_blocker: null;
    }
  | {
      status: "not_found" | "unavailable";
      freeze: null;
      safe_blocker: string;
    };

function validUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validIso(value: unknown): value is string {
  return typeof value === "string" &&
    value.length > 0 &&
    Number.isFinite(Date.parse(value));
}

function validFingerprint(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function validSegmentKey(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 16_384;
}

function validDecisionFingerprints(value: unknown): value is string[] {
  return Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 10_000 &&
    value.every((fingerprint) =>
      typeof fingerprint === "string" &&
      fingerprint.length > 0 &&
      fingerprint.length <= 240,
    ) &&
    new Set(value).size === value.length;
}

function validEvaluationPlan(
  value: unknown,
  expectedSegmentKey?: string,
): value is RecommendationLearningEvaluationPlan {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const plan = value as Partial<RecommendationLearningEvaluationPlan>;

  return plan.contract_version === "recommendation_learning_evaluation_plan_v1" &&
    plan.status === "ready_for_explicit_freeze" &&
    validSegmentKey(plan.segment_key) &&
    (!expectedSegmentKey || plan.segment_key === expectedSegmentKey) &&
    Boolean(plan.decision_records) &&
    Array.isArray(plan.decision_records?.scan_run_fingerprints) &&
    validDecisionFingerprints(plan.decision_records.scan_run_fingerprints) &&
    plan.decision_records.count === plan.decision_records.scan_run_fingerprints.length &&
    plan.metrics !== null;
}

function freezeFromRow(
  row: FreezeRow | ReadRow,
  input?: RecommendationLearningBaselineFreezeInput,
): RecommendationLearningBaselineFreeze | null {
  if (
    !validUuid(row.baseline_id) ||
    !validFingerprint(row.baseline_fingerprint) ||
    !validUuid(row.owner_user_id) ||
    !validSegmentKey(row.segment_key) ||
    !validDecisionFingerprints(row.decision_record_fingerprints) ||
    !validEvaluationPlan(row.evaluation_plan, row.segment_key) ||
    !validFingerprint(row.evaluation_charter_fingerprint) ||
    !validIso(row.frozen_at)
  ) {
    return null;
  }

  const freeze: RecommendationLearningBaselineFreeze = {
    baseline_id: row.baseline_id,
    baseline_fingerprint: row.baseline_fingerprint,
    owner_user_id: row.owner_user_id,
    segment_key: row.segment_key,
    decision_record_fingerprints: row.decision_record_fingerprints,
    evaluation_plan: row.evaluation_plan,
    evaluation_charter_fingerprint: row.evaluation_charter_fingerprint,
    frozen_at: row.frozen_at,
  };

  if (!input) return freeze;
  return freeze.baseline_fingerprint === input.baseline_fingerprint &&
    freeze.owner_user_id === input.owner_user_id &&
    freeze.segment_key === input.segment_key &&
    JSON.stringify(freeze.decision_record_fingerprints) ===
      JSON.stringify(input.decision_record_fingerprints) &&
    JSON.stringify(freeze.evaluation_plan) === JSON.stringify(input.evaluation_plan) &&
    freeze.evaluation_charter_fingerprint === input.evaluation_charter_fingerprint
    ? freeze
    : null;
}

function validInput(
  input: RecommendationLearningBaselineFreezeInput,
): boolean {
  return validFingerprint(input.baseline_fingerprint) &&
    validFingerprint(input.evaluation_charter_fingerprint) &&
    validUuid(input.owner_user_id) &&
    validSegmentKey(input.segment_key) &&
    validDecisionFingerprints(input.decision_record_fingerprints) &&
    validEvaluationPlan(input.evaluation_plan, input.segment_key) &&
    input.evaluation_plan.decision_records.count ===
      input.decision_record_fingerprints.length &&
    JSON.stringify(input.evaluation_plan.decision_records.scan_run_fingerprints) ===
      JSON.stringify(input.decision_record_fingerprints);
}

function unavailableFreeze(
  status: "unavailable" | "different_baseline_already_frozen" = "unavailable",
  safeBlocker = "recommendation_learning_baseline_freeze_unavailable",
): RecommendationLearningBaselineFreezeResult {
  return { status, freeze: null, safe_blocker: safeBlocker };
}

function unavailableRead(
  status: "not_found" | "unavailable" = "unavailable",
  safeBlocker = "recommendation_learning_baseline_freeze_unavailable",
): RecommendationLearningBaselineFreezeReadResult {
  return { status, freeze: null, safe_blocker: safeBlocker };
}

/**
 * A narrow persistence boundary for an explicit IF-4 baseline-freeze decision.
 * It neither evaluates prices nor chooses a policy. The caller must provide a
 * server-recomputed, ready evaluation plan and the database must return the
 * same immutable receipt before the freeze is accepted.
 */
export function createRecommendationLearningBaselineFreezeStore(
  database: RecommendationLearningBaselineFreezeDatabase | null,
) {
  return {
    async freeze(
      input: RecommendationLearningBaselineFreezeInput,
    ): Promise<RecommendationLearningBaselineFreezeResult> {
      if (!database || !validInput(input)) return unavailableFreeze();

      try {
        const result = await database.freeze(input);
        if (!result.data || result.error) return unavailableFreeze();
        if (result.data.freeze_status === "different_baseline_already_frozen") {
          return unavailableFreeze(
            "different_baseline_already_frozen",
            "different_recommendation_learning_baseline_already_frozen",
          );
        }
        const freeze = freezeFromRow(result.data, input);
        if (!freeze) return unavailableFreeze();

        if (
          result.data.freeze_status === "baseline_frozen" &&
          result.data.idempotent === false
        ) {
          return { status: "frozen", freeze, safe_blocker: null };
        }
        if (
          result.data.freeze_status === "baseline_already_frozen" &&
          result.data.idempotent === true
        ) {
          return { status: "already_frozen", freeze, safe_blocker: null };
        }
      } catch {
        // No caller may infer a freeze from an ambiguous durable receipt.
      }

      return unavailableFreeze();
    },

    async read(
      ownerUserId: string,
    ): Promise<RecommendationLearningBaselineFreezeReadResult> {
      if (!database || !validUuid(ownerUserId)) return unavailableRead();

      try {
        const result = await database.read(ownerUserId);
        if (!result.data || result.error) return unavailableRead();
        if (result.data.readback_status === "not_found") {
          return unavailableRead(
            "not_found",
            "recommendation_learning_baseline_freeze_not_found",
          );
        }
        const freeze = freezeFromRow(result.data);
        if (result.data.readback_status === "available" && freeze) {
          return { status: "available", freeze, safe_blocker: null };
        }
      } catch {
        // Readback cannot be substituted with local state.
      }

      return unavailableRead();
    },
  };
}
