import {
  TURE_SETUP_ANALYST_FIXTURE_EVALUATION_AUTHORITY,
  TURE_SETUP_ANALYST_FIXTURE_EVALUATION_HARNESS_VERSION,
} from "./ture-setup-analyst-fixture-evaluation-harness";

export const TURE_SETUP_ANALYST_MULTI_FIXTURE_BASELINE_COMPARISON_VERSION =
  "ture_setup_analyst_multi_fixture_baseline_comparison_v1" as const;

export const TURE_SETUP_ANALYST_BASELINE_DESCRIPTOR_VERSION =
  "ture_setup_analyst_baseline_descriptor_v1" as const;

export type TureSetupAnalystMultiFixtureBaselineComparisonAuthority = Readonly<{
  mode: "in_memory_multi_fixture_baseline_comparison";
  may_invoke_model: false;
  may_invoke_context_tools: false;
  may_collect_outcome_data: false;
  may_perform_io: false;
  may_persist_comparison: false;
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

export const TURE_SETUP_ANALYST_MULTI_FIXTURE_BASELINE_COMPARISON_AUTHORITY: TureSetupAnalystMultiFixtureBaselineComparisonAuthority =
  Object.freeze({
    mode: "in_memory_multi_fixture_baseline_comparison",
    may_invoke_model: false,
    may_invoke_context_tools: false,
    may_collect_outcome_data: false,
    may_perform_io: false,
    may_persist_comparison: false,
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

export type CompareTureSetupAnalystMultiFixtureBaselineInput = Readonly<{
  baseline: unknown;
  fixture_evaluations: unknown;
}>;

export type TureSetupAnalystMultiFixtureBaselineComparison = Readonly<{
  comparison_version: typeof TURE_SETUP_ANALYST_MULTI_FIXTURE_BASELINE_COMPARISON_VERSION;
  mode: "in_memory_multi_fixture_baseline_comparison";
  comparison_status: "evidence_incomplete";
  baseline: Readonly<{
    descriptor_version: typeof TURE_SETUP_ANALYST_BASELINE_DESCRIPTOR_VERSION;
    baseline_id: "current_ture";
    baseline_version: string;
    decision_source: "fixture_canonical_decision";
  }>;
  evaluated_fixture_count: number;
  summary: Readonly<{
    baseline_trade_count: number;
    analyst_trade_count: number;
    decision_agreement_count: number;
    decision_difference_count: number;
    favorable_outcome_count: number;
    flat_outcome_count: number;
    unfavorable_outcome_count: number;
  }>;
  promotion_disposition: "not_admitted";
  authority: TureSetupAnalystMultiFixtureBaselineComparisonAuthority;
}>;

type BaselineDescriptor = Readonly<{
  baseline_id: "current_ture";
  baseline_version: string;
}>;

type FixtureSummary = Readonly<{
  fixture_id: string;
  canonical_decision: "trade" | "no_trade";
  agent_assessment: "trade" | "no_trade" | "insufficient_evidence";
  outcome_direction: "favorable" | "flat" | "unfavorable";
}>;

const inputKeys = ["baseline", "fixture_evaluations"] as const;
const baselineKeys = ["baseline_id", "baseline_version", "descriptor_version"] as const;
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
const realizedOutcomeKeys = [
  "mae_r",
  "mfe_r",
  "outcome_direction",
  "realized_r",
  "terminal_label",
] as const;
const subjectKeys = ["candidate_id", "recommendation_id"] as const;
const traceMetricKeys = [
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

function isFiniteBoundedNumber(
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

function readBaseline(value: unknown): BaselineDescriptor | null {
  if (!isFrozenExact(value, baselineKeys)) return null;

  const descriptorVersion = ownData(value, "descriptor_version");
  const baselineId = ownData(value, "baseline_id");
  const baselineVersion = ownData(value, "baseline_version");
  if (
    descriptorVersion !== TURE_SETUP_ANALYST_BASELINE_DESCRIPTOR_VERSION ||
    baselineId !== "current_ture" ||
    !hasText(baselineVersion)
  ) {
    return null;
  }

  return Object.freeze({
    baseline_id: "current_ture",
    baseline_version: baselineVersion,
  });
}

function readFixtureEvaluation(value: unknown): FixtureSummary | null {
  if (!isFrozenExact(value, fixtureEvaluationKeys)) return null;

  const harnessVersion = ownData(value, "harness_version");
  const mode = ownData(value, "mode");
  const evaluationStatus = ownData(value, "evaluation_status");
  const authority = ownData(value, "authority");
  const fixtureId = ownData(value, "fixture_id");
  const comparison = ownData(value, "comparison");
  const outcome = ownData(value, "realized_outcome");
  const subject = ownData(value, "subject");
  const traceMetrics = ownData(value, "trace_metrics");

  if (
    harnessVersion !== TURE_SETUP_ANALYST_FIXTURE_EVALUATION_HARNESS_VERSION ||
    mode !== "fixture_only_shadow_evaluation" ||
    evaluationStatus !== "fixture_evaluated" ||
    authority !== TURE_SETUP_ANALYST_FIXTURE_EVALUATION_AUTHORITY ||
    !hasText(fixtureId) ||
    !isFrozenExact(comparison, comparisonKeys) ||
    !isFrozenExact(outcome, realizedOutcomeKeys) ||
    !isFrozenExact(subject, subjectKeys) ||
    !isFrozenExact(traceMetrics, traceMetricKeys)
  ) {
    return null;
  }

  const comparisonData = comparison as Record<string, unknown>;
  const outcomeData = outcome as Record<string, unknown>;
  const subjectData = subject as Record<string, unknown>;
  const traceData = traceMetrics as Record<string, unknown>;
  const canonicalDecision = ownData(comparisonData, "canonical_decision");
  const agentAssessment = ownData(comparisonData, "agent_assessment");
  const decisionAgreement = ownData(comparisonData, "decision_agreement");
  const agentConfidence = ownData(comparisonData, "agent_confidence");
  const outcomeDirection = ownData(outcomeData, "outcome_direction");

  if (
    !["trade", "no_trade"].includes(canonicalDecision as string) ||
    !["trade", "no_trade", "insufficient_evidence"].includes(
      agentAssessment as string,
    ) ||
    !["match", "different"].includes(decisionAgreement as string) ||
    !isFiniteBoundedNumber(agentConfidence, 0, 1) ||
    !["favorable", "flat", "unfavorable"].includes(outcomeDirection as string) ||
    !hasText(ownData(subjectData, "candidate_id")) ||
    !hasText(ownData(subjectData, "recommendation_id")) ||
    !hasText(ownData(traceData, "trace_id")) ||
    !isBoundedInteger(ownData(traceData, "latency_ms"), 300_000) ||
    !isBoundedInteger(ownData(traceData, "input_tokens"), 1_000_000) ||
    !isBoundedInteger(ownData(traceData, "output_tokens"), 1_000_000) ||
    !isFiniteBoundedNumber(ownData(traceData, "estimated_cost_usd"), 0, 1_000)
  ) {
    return null;
  }

  const expectedAgreement =
    canonicalDecision === agentAssessment ? "match" : "different";
  if (decisionAgreement !== expectedAgreement) return null;

  return Object.freeze({
    fixture_id: fixtureId,
    canonical_decision: canonicalDecision as FixtureSummary["canonical_decision"],
    agent_assessment: agentAssessment as FixtureSummary["agent_assessment"],
    outcome_direction: outcomeDirection as FixtureSummary["outcome_direction"],
  });
}

function readFixtureSet(value: unknown): readonly FixtureSummary[] | null {
  try {
    if (
      !Array.isArray(value) ||
      !Object.isFrozen(value) ||
      Object.getPrototypeOf(value) !== Array.prototype
    ) {
      return null;
    }

    const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
    const length = lengthDescriptor?.value;
    if (!isBoundedInteger(length, 1_000) || length < 2) return null;

    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.length !== length + 1) return null;
    if (!ownKeys.includes("length") || ownKeys.some((key) => typeof key === "symbol")) {
      return null;
    }
    if (
      !lengthDescriptor ||
      lengthDescriptor.enumerable ||
      !Object.prototype.hasOwnProperty.call(lengthDescriptor, "value")
    ) {
      return null;
    }

    const seenFixtureIds = new Set<string>();
    const summaries: FixtureSummary[] = [];
    for (let index = 0; index < length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (
        !descriptor ||
        !descriptor.enumerable ||
        !Object.prototype.hasOwnProperty.call(descriptor, "value")
      ) {
        return null;
      }

      const summary = readFixtureEvaluation(descriptor.value);
      if (!summary || seenFixtureIds.has(summary.fixture_id)) return null;
      seenFixtureIds.add(summary.fixture_id);
      summaries.push(summary);
    }

    return Object.freeze(summaries);
  } catch {
    return null;
  }
}

export function compareTureSetupAnalystMultiFixtureBaseline(
  input: CompareTureSetupAnalystMultiFixtureBaselineInput,
): TureSetupAnalystMultiFixtureBaselineComparison {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError("Invalid Ture Setup Analyst multi-fixture baseline input.");
  }

  const baseline = readBaseline(ownData(input, "baseline"));
  const fixtureSet = readFixtureSet(ownData(input, "fixture_evaluations"));
  if (!baseline || !fixtureSet) {
    throw new TypeError("Invalid Ture Setup Analyst multi-fixture baseline input.");
  }

  let baselineTradeCount = 0;
  let analystTradeCount = 0;
  let decisionAgreementCount = 0;
  let favorableOutcomeCount = 0;
  let flatOutcomeCount = 0;
  let unfavorableOutcomeCount = 0;

  for (const fixture of fixtureSet) {
    if (fixture.canonical_decision === "trade") baselineTradeCount += 1;
    if (fixture.agent_assessment === "trade") analystTradeCount += 1;
    if (fixture.canonical_decision === fixture.agent_assessment) {
      decisionAgreementCount += 1;
    }
    if (fixture.outcome_direction === "favorable") favorableOutcomeCount += 1;
    if (fixture.outcome_direction === "flat") flatOutcomeCount += 1;
    if (fixture.outcome_direction === "unfavorable") unfavorableOutcomeCount += 1;
  }

  return Object.freeze({
    comparison_version: TURE_SETUP_ANALYST_MULTI_FIXTURE_BASELINE_COMPARISON_VERSION,
    mode: "in_memory_multi_fixture_baseline_comparison",
    comparison_status: "evidence_incomplete",
    baseline: Object.freeze({
      descriptor_version: TURE_SETUP_ANALYST_BASELINE_DESCRIPTOR_VERSION,
      baseline_id: "current_ture",
      baseline_version: baseline.baseline_version,
      decision_source: "fixture_canonical_decision",
    }),
    evaluated_fixture_count: fixtureSet.length,
    summary: Object.freeze({
      baseline_trade_count: baselineTradeCount,
      analyst_trade_count: analystTradeCount,
      decision_agreement_count: decisionAgreementCount,
      decision_difference_count: fixtureSet.length - decisionAgreementCount,
      favorable_outcome_count: favorableOutcomeCount,
      flat_outcome_count: flatOutcomeCount,
      unfavorable_outcome_count: unfavorableOutcomeCount,
    }),
    promotion_disposition: "not_admitted",
    authority: TURE_SETUP_ANALYST_MULTI_FIXTURE_BASELINE_COMPARISON_AUTHORITY,
  });
}
