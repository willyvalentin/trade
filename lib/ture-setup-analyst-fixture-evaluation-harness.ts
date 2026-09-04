import {
  TURE_SETUP_ANALYST_IN_PROCESS_SHADOW_RUNNER_AUTHORITY,
  TURE_SETUP_ANALYST_IN_PROCESS_SHADOW_RUNNER_VERSION,
} from "./ture-setup-analyst-in-process-shadow-runner";
import { TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION } from "./ture-setup-analyst-read-only-context-tools";
import {
  TURE_SETUP_ANALYST_SHADOW_TRACE_AUTHORITY,
  TURE_SETUP_ANALYST_SHADOW_TRACE_CONTRACT_VERSION,
  TURE_SETUP_ANALYST_SHADOW_TRACE_PRIVACY,
} from "./ture-setup-analyst-shadow-trace-contract";
import {
  TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION,
  tureSetupAnalystReadOnlyToolIds,
  validateTureSetupAnalystShadowAssessment,
  type TureSetupAnalystShadowAssessment,
} from "./ture-setup-analyst-shadow-contract";

export const TURE_SETUP_ANALYST_FIXTURE_EVALUATION_HARNESS_VERSION =
  "ture_setup_analyst_fixture_evaluation_harness_v1" as const;

export const TURE_SETUP_ANALYST_EVALUATION_FIXTURE_VERSION =
  "ture_setup_analyst_evaluation_fixture_v1" as const;

export type TureSetupAnalystFixtureEvaluationAuthority = Readonly<{
  mode: "fixture_only_shadow_evaluation";
  may_invoke_model: false;
  may_invoke_context_tools: false;
  may_perform_io: false;
  may_persist_evaluation: false;
  may_promote_model_or_policy: false;
  may_change_canonical_recommendation: false;
  may_change_ranking: false;
  may_change_execution_eligibility: false;
  may_change_position_state: false;
  may_change_risk_settings: false;
  may_place_or_cancel_orders: false;
  may_submit_broker_instructions: false;
}>;

export const TURE_SETUP_ANALYST_FIXTURE_EVALUATION_AUTHORITY: TureSetupAnalystFixtureEvaluationAuthority =
  Object.freeze({
    mode: "fixture_only_shadow_evaluation",
    may_invoke_model: false,
    may_invoke_context_tools: false,
    may_perform_io: false,
    may_persist_evaluation: false,
    may_promote_model_or_policy: false,
    may_change_canonical_recommendation: false,
    may_change_ranking: false,
    may_change_execution_eligibility: false,
    may_change_position_state: false,
    may_change_risk_settings: false,
    may_place_or_cancel_orders: false,
    may_submit_broker_instructions: false,
  });

export type TureSetupAnalystFrozenEvaluationFixture = Readonly<{
  fixture_version: typeof TURE_SETUP_ANALYST_EVALUATION_FIXTURE_VERSION;
  fixture_id: string;
  frozen_at: string;
  subject: Readonly<{
    candidate_id: string;
    recommendation_id: string;
  }>;
  canonical_decision: "trade" | "no_trade";
  realized_outcome: Readonly<{
    terminal_label: "target" | "stop" | "expired" | "manual_exit";
    realized_r: number;
    mfe_r: number;
    mae_r: number;
  }>;
}>;

export type CreateTureSetupAnalystFrozenEvaluationFixtureInput =
  TureSetupAnalystFrozenEvaluationFixture;

export type EvaluateTureSetupAnalystFrozenFixtureInput = Readonly<{
  accepted_assessment: Readonly<TureSetupAnalystShadowAssessment>;
  shadow_run: unknown;
  fixture: TureSetupAnalystFrozenEvaluationFixture;
}>;

export type TureSetupAnalystFixtureEvaluation = Readonly<{
  harness_version: typeof TURE_SETUP_ANALYST_FIXTURE_EVALUATION_HARNESS_VERSION;
  mode: "fixture_only_shadow_evaluation";
  evaluation_status: "fixture_evaluated";
  fixture_id: string;
  subject: Readonly<{
    candidate_id: string;
    recommendation_id: string;
  }>;
  comparison: Readonly<{
    canonical_decision: "trade" | "no_trade";
    agent_assessment: "trade" | "no_trade" | "insufficient_evidence";
    decision_agreement: "match" | "different";
    agent_confidence: number;
  }>;
  realized_outcome: Readonly<{
    terminal_label: "target" | "stop" | "expired" | "manual_exit";
    outcome_direction: "favorable" | "flat" | "unfavorable";
    realized_r: number;
    mfe_r: number;
    mae_r: number;
  }>;
  trace_metrics: Readonly<{
    trace_id: string;
    latency_ms: number;
    input_tokens: number;
    output_tokens: number;
    estimated_cost_usd: number;
  }>;
  authority: TureSetupAnalystFixtureEvaluationAuthority;
}>;

const fixtureKeys = [
  "canonical_decision",
  "fixture_id",
  "fixture_version",
  "frozen_at",
  "realized_outcome",
  "subject",
] as const;

const fixtureInputKeys = fixtureKeys;
const evaluationInputKeys = ["accepted_assessment", "fixture", "shadow_run"] as const;
const subjectKeys = ["candidate_id", "recommendation_id"] as const;
const realizedOutcomeKeys = ["mae_r", "mfe_r", "realized_r", "terminal_label"] as const;
const shadowRunKeys = ["authority", "mode", "run_status", "runner_version", "trace"] as const;
const traceKeys = [
  "assessment_identity",
  "authority",
  "contract_version",
  "mode",
  "privacy",
  "timing",
  "tool_ids",
  "trace_contract_version",
  "trace_id",
  "usage",
  "versions",
] as const;
const traceIdentityKeys = subjectKeys;
const traceVersionsKeys = [
  "agent_version",
  "model_version",
  "prompt_version",
  "toolset_version",
] as const;
const traceTimingKeys = ["latency_ms"] as const;
const traceUsageKeys = ["estimated_cost_usd", "input_tokens", "output_tokens"] as const;

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

function hasText(value: unknown, maximumLength = 200): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maximumLength
  );
}

function isTimestamp(value: unknown): value is string {
  return hasText(value, 100) && Number.isFinite(Date.parse(value));
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

function isFrozenExact(
  value: unknown,
  keys: readonly string[],
): value is Record<string, unknown> {
  return Object.isFrozen(value) && hasExactOwnDataKeys(value, keys);
}

function readFixture(
  value: unknown,
  requireFrozen: boolean,
): TureSetupAnalystFrozenEvaluationFixture | null {
  if (
    (requireFrozen && !Object.isFrozen(value)) ||
    !hasExactOwnDataKeys(value, fixtureKeys)
  ) {
    return null;
  }

  const fixtureVersion = ownData(value, "fixture_version");
  const fixtureId = ownData(value, "fixture_id");
  const frozenAt = ownData(value, "frozen_at");
  const subject = ownData(value, "subject");
  const canonicalDecision = ownData(value, "canonical_decision");
  const realizedOutcome = ownData(value, "realized_outcome");
  const hasNestedShape = requireFrozen
    ? isFrozenExact(subject, subjectKeys) &&
      isFrozenExact(realizedOutcome, realizedOutcomeKeys)
    : hasExactOwnDataKeys(subject, subjectKeys) &&
      hasExactOwnDataKeys(realizedOutcome, realizedOutcomeKeys);
  if (
    fixtureVersion !== TURE_SETUP_ANALYST_EVALUATION_FIXTURE_VERSION ||
    !hasText(fixtureId) ||
    !isTimestamp(frozenAt) ||
    !hasNestedShape ||
    !["trade", "no_trade"].includes(canonicalDecision as string)
  ) {
    return null;
  }

  const subjectData = subject as Record<string, unknown>;
  const realizedOutcomeData = realizedOutcome as Record<string, unknown>;
  const candidateId = ownData(subjectData, "candidate_id");
  const recommendationId = ownData(subjectData, "recommendation_id");
  const terminalLabel = ownData(realizedOutcomeData, "terminal_label");
  const realizedR = ownData(realizedOutcomeData, "realized_r");
  const mfeR = ownData(realizedOutcomeData, "mfe_r");
  const maeR = ownData(realizedOutcomeData, "mae_r");
  if (
    !hasText(candidateId) ||
    !hasText(recommendationId) ||
    !["target", "stop", "expired", "manual_exit"].includes(terminalLabel as string) ||
    !isBoundedNumber(realizedR, -100, 100) ||
    !isBoundedNumber(mfeR, 0, 100) ||
    !isBoundedNumber(maeR, 0, 100)
  ) {
    return null;
  }

  return Object.freeze({
    fixture_version: TURE_SETUP_ANALYST_EVALUATION_FIXTURE_VERSION,
    fixture_id: fixtureId,
    frozen_at: frozenAt,
    subject: Object.freeze({
      candidate_id: candidateId,
      recommendation_id: recommendationId,
    }),
    canonical_decision: canonicalDecision as "trade" | "no_trade",
    realized_outcome: Object.freeze({
      terminal_label: terminalLabel as "target" | "stop" | "expired" | "manual_exit",
      realized_r: realizedR,
      mfe_r: mfeR,
      mae_r: maeR,
    }),
  });
}

function readAcceptedAssessment(
  value: unknown,
): Readonly<TureSetupAnalystShadowAssessment> | null {
  if (!Object.isFrozen(value)) return null;
  const result = validateTureSetupAnalystShadowAssessment(value);
  return result.valid ? result.assessment : null;
}

function hasCanonicalToolIds(value: unknown): boolean {
  if (!Array.isArray(value) || !Object.isFrozen(value)) return false;

  try {
    if (Object.getPrototypeOf(value) !== Array.prototype) return false;
    const ownKeys = Reflect.ownKeys(value);
    if (
      ownKeys.some((key) => typeof key === "symbol") ||
      ownKeys.length !== value.length + 1 ||
      !ownKeys.includes("length") ||
      value.length > tureSetupAnalystReadOnlyToolIds.length
    ) {
      return false;
    }

    const seen: string[] = [];
    for (let index = 0; index < value.length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      const toolId = descriptor?.value;
      if (
        !descriptor ||
        !descriptor.enumerable ||
        !Object.prototype.hasOwnProperty.call(descriptor, "value") ||
        !tureSetupAnalystReadOnlyToolIds.includes(toolId as never) ||
        seen.includes(toolId as string)
      ) {
        return false;
      }
      seen.push(toolId as string);
    }
    return true;
  } catch {
    return false;
  }
}

function readShadowTraceMetrics(
  value: unknown,
  assessment: Readonly<TureSetupAnalystShadowAssessment>,
): TureSetupAnalystFixtureEvaluation["trace_metrics"] | null {
  if (
    !isFrozenExact(value, shadowRunKeys) ||
    ownData(value, "runner_version") !==
      TURE_SETUP_ANALYST_IN_PROCESS_SHADOW_RUNNER_VERSION ||
    ownData(value, "mode") !== "in_process_shadow_only" ||
    ownData(value, "run_status") !== "shadow_trace_emitted" ||
    ownData(value, "authority") !==
      TURE_SETUP_ANALYST_IN_PROCESS_SHADOW_RUNNER_AUTHORITY
  ) {
    return null;
  }

  const trace = ownData(value, "trace");
  if (
    !isFrozenExact(trace, traceKeys) ||
    ownData(trace, "trace_contract_version") !==
      TURE_SETUP_ANALYST_SHADOW_TRACE_CONTRACT_VERSION ||
    ownData(trace, "contract_version") !== TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION ||
    ownData(trace, "mode") !== "metadata_only_shadow" ||
    ownData(trace, "trace_id") !== assessment.trace_id ||
    ownData(trace, "privacy") !== TURE_SETUP_ANALYST_SHADOW_TRACE_PRIVACY ||
    ownData(trace, "authority") !== TURE_SETUP_ANALYST_SHADOW_TRACE_AUTHORITY ||
    !isFrozenExact(ownData(trace, "assessment_identity"), traceIdentityKeys) ||
    !isFrozenExact(ownData(trace, "versions"), traceVersionsKeys) ||
    !isFrozenExact(ownData(trace, "timing"), traceTimingKeys) ||
    !isFrozenExact(ownData(trace, "usage"), traceUsageKeys) ||
    !hasCanonicalToolIds(ownData(trace, "tool_ids"))
  ) {
    return null;
  }

  const identity = ownData(trace, "assessment_identity") as Record<string, unknown>;
  const versions = ownData(trace, "versions") as Record<string, unknown>;
  const timing = ownData(trace, "timing") as Record<string, unknown>;
  const usage = ownData(trace, "usage") as Record<string, unknown>;
  const traceId = ownData(trace, "trace_id");
  const latencyMs = ownData(timing, "latency_ms");
  const inputTokens = ownData(usage, "input_tokens");
  const outputTokens = ownData(usage, "output_tokens");
  const estimatedCostUsd = ownData(usage, "estimated_cost_usd");
  if (
    ownData(identity, "candidate_id") !== assessment.candidate_id ||
    ownData(identity, "recommendation_id") !== assessment.recommendation_id ||
    ownData(versions, "agent_version") !== assessment.agent_version ||
    ownData(versions, "model_version") !== assessment.model_version ||
    ownData(versions, "prompt_version") !== assessment.prompt_version ||
    ownData(versions, "toolset_version") !==
      TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION ||
    !hasText(traceId) ||
    !isBoundedInteger(latencyMs, 300_000) ||
    !isBoundedInteger(inputTokens, 1_000_000) ||
    !isBoundedInteger(outputTokens, 1_000_000) ||
    !isBoundedNumber(estimatedCostUsd, 0, 1_000)
  ) {
    return null;
  }

  return Object.freeze({
    trace_id: traceId,
    latency_ms: latencyMs,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    estimated_cost_usd: estimatedCostUsd,
  });
}

export function createTureSetupAnalystFrozenEvaluationFixture(
  input: CreateTureSetupAnalystFrozenEvaluationFixtureInput,
): TureSetupAnalystFrozenEvaluationFixture {
  if (!hasExactOwnDataKeys(input, fixtureInputKeys)) {
    throw new TypeError("Invalid Ture Setup Analyst evaluation fixture input.");
  }

  const fixture = readFixture(input, false);
  if (!fixture) {
    throw new TypeError("Invalid Ture Setup Analyst evaluation fixture input.");
  }

  return fixture;
}

export function evaluateTureSetupAnalystFrozenFixture(
  input: EvaluateTureSetupAnalystFrozenFixtureInput,
): TureSetupAnalystFixtureEvaluation {
  if (!hasExactOwnDataKeys(input, evaluationInputKeys)) {
    throw new TypeError("Invalid Ture Setup Analyst fixture evaluation input.");
  }

  const assessment = readAcceptedAssessment(ownData(input, "accepted_assessment"));
  const fixture = readFixture(ownData(input, "fixture"), true);
  if (
    !assessment ||
    !fixture ||
    fixture.subject.candidate_id !== assessment.candidate_id ||
    fixture.subject.recommendation_id !== assessment.recommendation_id
  ) {
    throw new TypeError("Invalid Ture Setup Analyst fixture evaluation input.");
  }

  const traceMetrics = readShadowTraceMetrics(
    ownData(input, "shadow_run"),
    assessment,
  );
  if (!traceMetrics) {
    throw new TypeError("Invalid Ture Setup Analyst fixture evaluation input.");
  }

  const agentAssessment = assessment.trade_or_no_trade_assessment;
  const outcomeDirection =
    fixture.realized_outcome.realized_r > 0
      ? "favorable"
      : fixture.realized_outcome.realized_r < 0
        ? "unfavorable"
        : "flat";

  return Object.freeze({
    harness_version: TURE_SETUP_ANALYST_FIXTURE_EVALUATION_HARNESS_VERSION,
    mode: "fixture_only_shadow_evaluation",
    evaluation_status: "fixture_evaluated",
    fixture_id: fixture.fixture_id,
    subject: Object.freeze({ ...fixture.subject }),
    comparison: Object.freeze({
      canonical_decision: fixture.canonical_decision,
      agent_assessment: agentAssessment,
      decision_agreement:
        agentAssessment === fixture.canonical_decision ? "match" : "different",
      agent_confidence: assessment.confidence_in_assessment,
    }),
    realized_outcome: Object.freeze({
      terminal_label: fixture.realized_outcome.terminal_label,
      outcome_direction: outcomeDirection,
      realized_r: fixture.realized_outcome.realized_r,
      mfe_r: fixture.realized_outcome.mfe_r,
      mae_r: fixture.realized_outcome.mae_r,
    }),
    trace_metrics: traceMetrics,
    authority: TURE_SETUP_ANALYST_FIXTURE_EVALUATION_AUTHORITY,
  });
}
