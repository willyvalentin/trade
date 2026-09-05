import "server-only";

export const TURE_SETUP_ANALYST_CANONICAL_OUTCOME_PROJECTION_VERSION =
  "ture_setup_analyst_canonical_outcome_projection_v1" as const;

export type TureSetupAnalystCanonicalOutcomeProjectionAuthority = Readonly<{
  mode: "server_only_canonical_outcome_projection";
  may_read_repository: false;
  may_invoke_model: false;
  may_invoke_context_tools: false;
  may_perform_io: false;
  may_persist_projection: false;
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

export const TURE_SETUP_ANALYST_CANONICAL_OUTCOME_PROJECTION_AUTHORITY: TureSetupAnalystCanonicalOutcomeProjectionAuthority =
  Object.freeze({
    mode: "server_only_canonical_outcome_projection",
    may_read_repository: false,
    may_invoke_model: false,
    may_invoke_context_tools: false,
    may_perform_io: false,
    may_persist_projection: false,
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

export type ProjectTureSetupAnalystCanonicalOutcomeInput = Readonly<{
  canonical_evaluation: unknown;
}>;

export type TureSetupAnalystCanonicalOutcomeProjection = Readonly<{
  projection_version: typeof TURE_SETUP_ANALYST_CANONICAL_OUTCOME_PROJECTION_VERSION;
  mode: "server_only_canonical_outcome_projection";
  projection_status: "source_only_projected";
  evidence: Readonly<{
    canonical_identity: string;
    sample_type:
      | "visible"
      | "research_only"
      | "shadow"
      | "historical_synthetic"
      | "rejected_candidate"
      | "no_trade";
    cohort:
      | "visible_recommendation_quality"
      | "research_only_recommendation_quality"
      | "shadow_recommendation_quality"
      | "historical_synthetic_recommendation_quality"
      | "rejected_candidate_counterfactual"
      | "no_trade_counterfactual";
    decision_day: string;
    primary_horizon: "60m";
    terminal_outcome:
      | "target_before_stop"
      | "stop_before_target"
      | "no_entry"
      | "neither";
    realized_r: number;
    confidence_probability: number;
    versions: Readonly<{
      engine: string;
      scoring: string;
      ranking: string;
      evaluator: string;
      provider: string;
    }>;
  }>;
  offline_evaluation_disposition: "not_admitted";
  authority: TureSetupAnalystCanonicalOutcomeProjectionAuthority;
}>;

type PlainRecord = Record<string, unknown>;

const inputKeys = ["canonical_evaluation"] as const;
const versionKeys = ["engine", "evaluator", "provider", "ranking", "scoring"] as const;
const allowedSampleTypes = [
  "visible",
  "research_only",
  "shadow",
  "historical_synthetic",
  "rejected_candidate",
  "no_trade",
] as const;
const allowedCohorts = [
  "visible_recommendation_quality",
  "research_only_recommendation_quality",
  "shadow_recommendation_quality",
  "historical_synthetic_recommendation_quality",
  "rejected_candidate_counterfactual",
  "no_trade_counterfactual",
] as const;
const cohortBySampleType = Object.freeze({
  visible: "visible_recommendation_quality",
  research_only: "research_only_recommendation_quality",
  shadow: "shadow_recommendation_quality",
  historical_synthetic: "historical_synthetic_recommendation_quality",
  rejected_candidate: "rejected_candidate_counterfactual",
  no_trade: "no_trade_counterfactual",
} as const);
const terminalOutcomes = [
  "target_before_stop",
  "stop_before_target",
  "no_entry",
  "neither",
] as const;

function hasExactOwnDataKeys(
  value: unknown,
  keys: readonly string[],
): value is PlainRecord {
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

function hasOwnData(value: unknown, key: string): value is PlainRecord {
  if (!value || typeof value !== "object") return false;

  try {
    if (Object.getPrototypeOf(value) !== Object.prototype) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return Boolean(
      descriptor &&
        descriptor.enumerable &&
        Object.prototype.hasOwnProperty.call(descriptor, "value"),
    );
  } catch {
    return false;
  }
}

function ownData(value: PlainRecord, key: string): unknown {
  return Object.getOwnPropertyDescriptor(value, key)?.value;
}

function hasText(value: unknown, maximumLength = 200): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maximumLength
  );
}

function isIsoDay(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().startsWith(value);
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

function includes<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === "string" && values.includes(value as T);
}

type CanonicalOutcomeSummary = Readonly<{
  canonical_identity: string;
  sample_type: (typeof allowedSampleTypes)[number];
  cohort: (typeof allowedCohorts)[number];
  decision_day: string;
  primary_horizon: "60m";
  terminal_outcome: (typeof terminalOutcomes)[number];
  realized_r: number;
  confidence_probability: number;
  versions: Readonly<{
    engine: string;
    scoring: string;
    ranking: string;
    evaluator: string;
    provider: string;
  }>;
}>;

function readCanonicalOutcome(value: unknown): CanonicalOutcomeSummary | null {
  // The caller must provide a frozen read-model snapshot. This adapter owns no
  // repository access and intentionally does not invoke a query or loader.
  if (!Object.isFrozen(value) || !value || typeof value !== "object") return null;

  const requiredKeys = [
    "canonical_identity",
    "cohort",
    "cohort_quality_eligible",
    "confidence_probability_semantics",
    "decision_day",
    "eligibility_status",
    "numeric_confidence",
    "parity_verified",
    "primary_horizon",
    "r_result",
    "read_model_version",
    "reason_codes",
    "reproducible",
    "sample_type",
    "terminal_outcome",
    "versions",
  ];
  if (!requiredKeys.every((key) => hasOwnData(value, key))) return null;

  const record = value as PlainRecord;
  const canonicalIdentity = ownData(record, "canonical_identity");
  const sampleType = ownData(record, "sample_type");
  const cohort = ownData(record, "cohort");
  const decisionDay = ownData(record, "decision_day");
  const primaryHorizon = ownData(record, "primary_horizon");
  const terminalOutcome = ownData(record, "terminal_outcome");
  const realizedR = ownData(record, "r_result");
  const numericConfidence = ownData(record, "numeric_confidence");
  const versions = ownData(record, "versions");

  if (
    ownData(record, "read_model_version") !==
      "canonical_evaluation_quality_read_model_v1" ||
    !hasText(canonicalIdentity) ||
    !includes(allowedSampleTypes, sampleType) ||
    !includes(allowedCohorts, cohort) ||
    cohortBySampleType[sampleType] !== cohort ||
    !isIsoDay(decisionDay) ||
    primaryHorizon !== "60m" ||
    !includes(terminalOutcomes, terminalOutcome) ||
    !isFiniteBoundedNumber(realizedR, -100, 100) ||
    !isFiniteBoundedNumber(numericConfidence, 0, 1) ||
    ownData(record, "confidence_probability_semantics") !== "probability_0_1" ||
    ownData(record, "parity_verified") !== true ||
    ownData(record, "reproducible") !== true ||
    ownData(record, "cohort_quality_eligible") !== true ||
    ownData(record, "eligibility_status") !== "eligible" ||
    !Object.isFrozen(ownData(record, "reason_codes")) ||
    !Array.isArray(ownData(record, "reason_codes")) ||
    (ownData(record, "reason_codes") as readonly unknown[]).length !== 0 ||
    !Object.isFrozen(versions) ||
    !hasExactOwnDataKeys(versions, versionKeys)
  ) {
    return null;
  }

  const versionRecord = versions as PlainRecord;
  const engine = ownData(versionRecord, "engine");
  const scoring = ownData(versionRecord, "scoring");
  const ranking = ownData(versionRecord, "ranking");
  const evaluator = ownData(versionRecord, "evaluator");
  const provider = ownData(versionRecord, "provider");
  if (
    !hasText(engine) ||
    !hasText(scoring) ||
    !hasText(ranking) ||
    !hasText(evaluator) ||
    !hasText(provider)
  ) {
    return null;
  }

  return Object.freeze({
    canonical_identity: canonicalIdentity,
    sample_type: sampleType,
    cohort,
    decision_day: decisionDay,
    primary_horizon: "60m" as const,
    terminal_outcome: terminalOutcome,
    realized_r: realizedR,
    confidence_probability: numericConfidence,
    versions: Object.freeze({ engine, scoring, ranking, evaluator, provider }),
  });
}

export function projectTureSetupAnalystCanonicalOutcome(
  input: ProjectTureSetupAnalystCanonicalOutcomeInput,
): TureSetupAnalystCanonicalOutcomeProjection {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError("Invalid Ture Setup Analyst canonical outcome projection input.");
  }

  const canonicalOutcome = readCanonicalOutcome(ownData(input, "canonical_evaluation"));
  if (!canonicalOutcome) {
    throw new TypeError("Invalid Ture Setup Analyst canonical outcome projection input.");
  }

  return Object.freeze({
    projection_version: TURE_SETUP_ANALYST_CANONICAL_OUTCOME_PROJECTION_VERSION,
    mode: "server_only_canonical_outcome_projection",
    projection_status: "source_only_projected",
    evidence: Object.freeze({
      ...canonicalOutcome,
      versions: Object.freeze({ ...canonicalOutcome.versions }),
    }),
    offline_evaluation_disposition: "not_admitted",
    authority: TURE_SETUP_ANALYST_CANONICAL_OUTCOME_PROJECTION_AUTHORITY,
  });
}
