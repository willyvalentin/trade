import {
  TURE_SETUP_ANALYST_FIXTURE_EVALUATION_AUTHORITY,
  TURE_SETUP_ANALYST_FIXTURE_EVALUATION_HARNESS_VERSION,
} from "./ture-setup-analyst-fixture-evaluation-harness";

export const TURE_SETUP_ANALYST_PROMOTION_EVIDENCE_REVIEW_VERSION =
  "ture_setup_analyst_promotion_evidence_review_v1" as const;

export type TureSetupAnalystPromotionEvidenceReviewAuthority = Readonly<{
  mode: "promotion_evidence_review_only";
  may_invoke_model: false;
  may_invoke_context_tools: false;
  may_perform_io: false;
  may_persist_review: false;
  may_bind_runtime: false;
  may_promote_model_or_policy: false;
  may_change_canonical_recommendation: false;
  may_change_ranking: false;
  may_change_execution_eligibility: false;
  may_change_position_state: false;
  may_change_risk_settings: false;
  may_place_or_cancel_orders: false;
  may_submit_broker_instructions: false;
}>;

export const TURE_SETUP_ANALYST_PROMOTION_EVIDENCE_REVIEW_AUTHORITY: TureSetupAnalystPromotionEvidenceReviewAuthority =
  Object.freeze({
    mode: "promotion_evidence_review_only",
    may_invoke_model: false,
    may_invoke_context_tools: false,
    may_perform_io: false,
    may_persist_review: false,
    may_bind_runtime: false,
    may_promote_model_or_policy: false,
    may_change_canonical_recommendation: false,
    may_change_ranking: false,
    may_change_execution_eligibility: false,
    may_change_position_state: false,
    may_change_risk_settings: false,
    may_place_or_cancel_orders: false,
    may_submit_broker_instructions: false,
  });

export type ReviewTureSetupAnalystPromotionEvidenceInput = Readonly<{
  fixture_evaluation: unknown;
}>;

export type TureSetupAnalystPromotionEvidenceReview = Readonly<{
  review_version: typeof TURE_SETUP_ANALYST_PROMOTION_EVIDENCE_REVIEW_VERSION;
  mode: "promotion_evidence_review_only";
  review_status: "evidence_incomplete";
  evaluated_fixture_id: string;
  evidence_summary: Readonly<{
    frozen_fixture_evaluations_admitted: 1;
    current_ture_baseline_comparison: "not_admitted";
    multi_fixture_realized_outcome_evidence: "not_admitted";
    measurable_incremental_value: "not_demonstrated";
    human_promotion_decision: "required";
  }>;
  missing_evidence: readonly [
    "current_ture_baseline_comparison",
    "multi_fixture_realized_outcome_evidence",
    "measurable_incremental_value",
    "human_promotion_decision",
  ];
  authority: TureSetupAnalystPromotionEvidenceReviewAuthority;
}>;

const reviewInputKeys = ["fixture_evaluation"] as const;
const fixtureEvaluationKeys = [
  "authority",
  "comparison",
  "evaluation_status",
  "fixture_id",
  "harness_version",
  "mode",
  "realized_outcome",
  "subject",
  "trace_metrics",
] as const;
const comparisonKeys = [
  "agent_assessment",
  "agent_confidence",
  "canonical_decision",
  "decision_agreement",
] as const;
const subjectKeys = ["candidate_id", "recommendation_id"] as const;
const realizedOutcomeKeys = [
  "mae_r",
  "mfe_r",
  "outcome_direction",
  "realized_r",
  "terminal_label",
] as const;
const traceMetricsKeys = [
  "estimated_cost_usd",
  "input_tokens",
  "latency_ms",
  "output_tokens",
  "trace_id",
] as const;

function hasExactOwnDataKeys(
  value: unknown,
  keys: readonly string[],
): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;

  try {
    if (Object.getPrototypeOf(value) !== Object.prototype) return false;
    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.some((key) => typeof key !== "string")) return false;
    if (ownKeys.length !== keys.length) return false;
    if (![...ownKeys].every((key) => keys.includes(key as never))) return false;

    return ownKeys.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return Boolean(
        descriptor &&
          descriptor.enumerable &&
          Object.prototype.hasOwnProperty.call(descriptor, "value"),
      );
    });
  } catch {
    return false;
  }
}

function ownData(value: Record<string, unknown>, key: string): unknown {
  return Object.getOwnPropertyDescriptor(value, key)?.value;
}

function isFrozenExact(
  value: unknown,
  keys: readonly string[],
): value is Record<string, unknown> {
  return Object.isFrozen(value) && hasExactOwnDataKeys(value, keys);
}

function hasText(value: unknown, maximumLength = 200): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maximumLength
  );
}

function isBoundedNumber(
  value: unknown,
  minimum: number,
  maximum: number,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
  );
}

function isBoundedInteger(value: unknown, maximum: number): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= maximum
  );
}

function isAdmittedFixtureEvaluation(value: unknown): value is Record<string, unknown> {
  if (!isFrozenExact(value, fixtureEvaluationKeys)) return false;

  const harnessVersion = ownData(value, "harness_version");
  const mode = ownData(value, "mode");
  const evaluationStatus = ownData(value, "evaluation_status");
  const fixtureId = ownData(value, "fixture_id");
  const authority = ownData(value, "authority");
  const comparison = ownData(value, "comparison");
  const subject = ownData(value, "subject");
  const realizedOutcome = ownData(value, "realized_outcome");
  const traceMetrics = ownData(value, "trace_metrics");

  if (
    harnessVersion !== TURE_SETUP_ANALYST_FIXTURE_EVALUATION_HARNESS_VERSION ||
    mode !== "fixture_only_shadow_evaluation" ||
    evaluationStatus !== "fixture_evaluated" ||
    !hasText(fixtureId) ||
    authority !== TURE_SETUP_ANALYST_FIXTURE_EVALUATION_AUTHORITY ||
    !isFrozenExact(comparison, comparisonKeys) ||
    !isFrozenExact(subject, subjectKeys) ||
    !isFrozenExact(realizedOutcome, realizedOutcomeKeys) ||
    !isFrozenExact(traceMetrics, traceMetricsKeys)
  ) {
    return false;
  }

  const comparisonData = comparison as Record<string, unknown>;
  const subjectData = subject as Record<string, unknown>;
  const outcomeData = realizedOutcome as Record<string, unknown>;
  const metricsData = traceMetrics as Record<string, unknown>;

  return (
    ["trade", "no_trade"].includes(
      ownData(comparisonData, "canonical_decision") as string,
    ) &&
    ["trade", "no_trade", "insufficient_evidence"].includes(
      ownData(comparisonData, "agent_assessment") as string,
    ) &&
    ["match", "different"].includes(
      ownData(comparisonData, "decision_agreement") as string,
    ) &&
    isBoundedNumber(ownData(comparisonData, "agent_confidence"), 0, 1) &&
    hasText(ownData(subjectData, "candidate_id")) &&
    hasText(ownData(subjectData, "recommendation_id")) &&
    ["target", "stop", "expired", "manual_exit"].includes(
      ownData(outcomeData, "terminal_label") as string,
    ) &&
    ["favorable", "flat", "unfavorable"].includes(
      ownData(outcomeData, "outcome_direction") as string,
    ) &&
    isBoundedNumber(ownData(outcomeData, "realized_r"), -100, 100) &&
    isBoundedNumber(ownData(outcomeData, "mfe_r"), 0, 100) &&
    isBoundedNumber(ownData(outcomeData, "mae_r"), 0, 100) &&
    hasText(ownData(metricsData, "trace_id")) &&
    isBoundedInteger(ownData(metricsData, "latency_ms"), 300_000) &&
    isBoundedInteger(ownData(metricsData, "input_tokens"), 1_000_000) &&
    isBoundedInteger(ownData(metricsData, "output_tokens"), 1_000_000) &&
    isBoundedNumber(ownData(metricsData, "estimated_cost_usd"), 0, 1_000)
  );
}

export function reviewTureSetupAnalystPromotionEvidence(
  input: ReviewTureSetupAnalystPromotionEvidenceInput,
): TureSetupAnalystPromotionEvidenceReview {
  if (!hasExactOwnDataKeys(input, reviewInputKeys)) {
    throw new TypeError("Invalid Ture Setup Analyst promotion evidence input.");
  }

  const fixtureEvaluation = ownData(input, "fixture_evaluation");
  if (!isAdmittedFixtureEvaluation(fixtureEvaluation)) {
    throw new TypeError("Invalid Ture Setup Analyst promotion evidence input.");
  }

  const evaluatedFixtureId = ownData(
    fixtureEvaluation,
    "fixture_id",
  ) as string;

  return Object.freeze({
    review_version: TURE_SETUP_ANALYST_PROMOTION_EVIDENCE_REVIEW_VERSION,
    mode: "promotion_evidence_review_only",
    review_status: "evidence_incomplete",
    evaluated_fixture_id: evaluatedFixtureId,
    evidence_summary: Object.freeze({
      frozen_fixture_evaluations_admitted: 1,
      current_ture_baseline_comparison: "not_admitted",
      multi_fixture_realized_outcome_evidence: "not_admitted",
      measurable_incremental_value: "not_demonstrated",
      human_promotion_decision: "required",
    }),
    missing_evidence: Object.freeze([
      "current_ture_baseline_comparison",
      "multi_fixture_realized_outcome_evidence",
      "measurable_incremental_value",
      "human_promotion_decision",
    ]) as TureSetupAnalystPromotionEvidenceReview["missing_evidence"],
    authority: TURE_SETUP_ANALYST_PROMOTION_EVIDENCE_REVIEW_AUTHORITY,
  });
}
