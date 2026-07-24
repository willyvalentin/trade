import type {
  ReplayWithSignalPackageDirection,
  ReplayWithSignalPackageOutcomeStatus,
} from "@/lib/replay-with-signal-package-result-model";

export const ACTION_335_LEARNING_DATASET_CONTRACT_REFERENCE =
  "docs/action-335-learning-outcome-dataset-design.md" as const;
export const ACTION_336_INTELLIGENCE_CONTEXT_CONTRACT_REFERENCE =
  "docs/action-336-intelligence-context-schema-draft.md" as const;
export const ACTION_352_LEARNING_DATASET_LINKAGE_REFERENCE =
  "docs/action-352-snapshot-to-learning-dataset-mapper-plan.md" as const;
export const LEARNING_DATASET_STATIC_FIXTURE_SCHEMA_VERSION =
  "learning_dataset_static_fixture_v1" as const;

export type LearningDatasetMissingState =
  | "present"
  | "explicit_null"
  | "unavailable"
  | "unknown";

export type LearningDatasetContextValue = Readonly<{
  state: LearningDatasetMissingState;
  value: string | number | boolean | null;
}>;

export type LearningDatasetIdentity = Readonly<{
  dataset_row_id: string;
  learning_row_key: string;
  recommendation_snapshot_id: string;
  recommendation_id: string | null;
  candidate_id: string;
  context_snapshot_id: string;
  evaluated_outcome_id: string | null;
  batch_fingerprint: string;
  scan_run_id: string;
  ticker: string;
  trading_day: string;
  trading_window: "morning" | "midday" | "power_hour" | "unknown";
  source_type: "visible" | "research_only";
}>;

export type LearningDatasetTradePlan = Readonly<{
  direction: ReplayWithSignalPackageDirection;
  entry: number;
  stop: number;
  target: number;
  planned_risk: number;
  planned_reward: number;
  planned_r_multiple: number;
  invalidation_logic: string;
}>;

export type LearningDatasetContext = Readonly<{
  context_snapshot_id: string;
  recommendation_snapshot_id: string;
  recommendation_id: string | null;
  captured_at: string;
  available_at_snapshot_time: true;
  market: Readonly<{
    completeness: "complete" | "partial" | "unavailable";
    spy_direction: LearningDatasetContextValue;
    qqq_direction: LearningDatasetContextValue;
    iwm_direction: LearningDatasetContextValue;
    market_regime: LearningDatasetContextValue;
    volatility_regime: LearningDatasetContextValue;
  }>;
  sector_industry: Readonly<{
    sector: LearningDatasetContextValue;
    industry: LearningDatasetContextValue;
    sector_relative_strength: LearningDatasetContextValue;
  }>;
  relative_strength: Readonly<{
    stock_vs_spy: LearningDatasetContextValue;
    stock_vs_sector: LearningDatasetContextValue;
    intraday_label: LearningDatasetContextValue;
  }>;
  news_catalyst: Readonly<{
    availability: "present" | "absent" | "unavailable";
    catalyst_detected: LearningDatasetContextValue;
    catalyst_type: LearningDatasetContextValue;
    catalyst_timestamp: string | null;
    headline_summary: string | null;
  }>;
  calendar_event: Readonly<{
    availability: "present" | "absent" | "unavailable";
    event_type: LearningDatasetContextValue;
    event_risk_label: LearningDatasetContextValue;
  }>;
}>;

export type LearningDatasetProvenance = Readonly<{
  state: "complete" | "partial" | "unavailable";
  provider: string | null;
  source_timestamp: string | null;
  interval: string | null;
  adjusted_or_unadjusted: "adjusted" | "unadjusted" | "unknown";
  source_confidence: number | null;
  audit_readback_status: "verified" | "partial" | "unavailable";
  missing_data_flags: readonly string[];
  completeness_score: number;
}>;

export type LearningDatasetOutcome = Readonly<{
  availability: "complete" | "incomplete" | "not_yet_available";
  evaluated_outcome_id: string | null;
  recommendation_snapshot_id: string;
  recommendation_id: string | null;
  outcome_window: "15m" | "30m" | "60m";
  outcome_status: ReplayWithSignalPackageOutcomeStatus | "not_yet_available";
  evaluated_at: string | null;
  entry_touched: boolean | null;
  target_hit: boolean | null;
  stop_hit: boolean | null;
  no_entry_triggered: boolean | null;
  open_at_window_end: boolean | null;
  gross_r_multiple: number | null;
  max_favorable_excursion_r: number | null;
  max_adverse_excursion_r: number | null;
}>;

export type Action335LearningDatasetRow = Readonly<{
  schema_version: typeof LEARNING_DATASET_STATIC_FIXTURE_SCHEMA_VERSION;
  fixture_family_tags: readonly string[];
  identity: LearningDatasetIdentity;
  snapshot_time_inputs: Readonly<{
    recommendation_created_at: string;
    snapshot_captured_at: string;
    enrichment_version: string;
  }>;
  trade_plan: LearningDatasetTradePlan;
  setup_and_confidence: Readonly<{
    setup_family: string;
    setup_variant: string;
    numeric_confidence: number;
    confidence_label: "low" | "medium" | "high" | "unknown";
    tier: "strong" | "valid" | "experimental" | "unknown";
  }>;
  quality_gates: Readonly<{
    sanitizer_passed: boolean;
    risk_geometry_valid: boolean;
    snapshot_completeness: "complete" | "partial" | "low";
    rejection_reason: string | null;
  }>;
  context: LearningDatasetContext;
  data_provenance: LearningDatasetProvenance;
  outcome_fields: LearningDatasetOutcome;
  derived_learning_fields: Readonly<{
    setup_success_label: "success" | "failure" | "incomplete" | "pending";
    confidence_bucket: "low" | "medium" | "high" | "unknown";
    recommendation_should_have_been_filtered: boolean | null;
  }>;
  anti_leakage_status: "passed";
  learning_eligibility_status: "full" | "limited" | "pending";
  missing_context_reasons: readonly string[];
  fixture_expected_status: "valid" | "valid_with_gaps" | "pending_outcome";
  completeness_score: number;
}>;

export type LearningDatasetMalformedFixtureCase = Readonly<{
  case_id: string;
  reason:
    | "missing_required_identity"
    | "conflicting_identity_linkage"
    | "invalid_recommendation_context_relationship"
    | "invalid_temporal_ordering"
    | "context_after_prohibited_boundary"
    | "outcome_leaked_into_snapshot_fields"
    | "outcome_before_recommendation"
    | "unsupported_categorical_value"
    | "malformed_provenance"
    | "non_finite_numeric_metric"
    | "invalid_completeness_bounds"
    | "duplicate_row_identity"
    | "unstable_timestamp_attempt"
    | "random_identity_attempt";
  expected_validation_status: "invalid";
  raw_fixture: Record<string, unknown>;
}>;

export type LearningDatasetStaticFixtureValidationResult = Readonly<{
  ok: boolean;
  errors: readonly string[];
}>;

const PRESENT_TRUE: LearningDatasetContextValue = { state: "present", value: true };
const PRESENT_FALSE: LearningDatasetContextValue = { state: "present", value: false };
const UNKNOWN: LearningDatasetContextValue = { state: "unknown", value: "unknown" };
const UNAVAILABLE: LearningDatasetContextValue = { state: "unavailable", value: null };
const EXPLICIT_NULL: LearningDatasetContextValue = { state: "explicit_null", value: null };

const COMPLETE_ROW: Action335LearningDatasetRow = {
  schema_version: LEARNING_DATASET_STATIC_FIXTURE_SCHEMA_VERSION,
  fixture_family_tags: ["complete_valid_learning_row", "valid_identity_linkage"],
  identity: {
    dataset_row_id: "learning_row:v1:001:complete",
    learning_row_key: "snapshot:v1:001|60m|outcome:v1:001",
    recommendation_snapshot_id: "snapshot:v1:001",
    recommendation_id: "recommendation:v1:001",
    candidate_id: "candidate:v1:001",
    context_snapshot_id: "context:v1:001",
    evaluated_outcome_id: "outcome:v1:001",
    batch_fingerprint: "rec_batch_fixture_001",
    scan_run_id: "rec_scan_run_fixture_001",
    ticker: "AAPL",
    trading_day: "2026-07-08",
    trading_window: "morning",
    source_type: "visible",
  },
  snapshot_time_inputs: {
    recommendation_created_at: "2026-07-08T13:45:00.000Z",
    snapshot_captured_at: "2026-07-08T13:45:00.000Z",
    enrichment_version: "static:v1",
  },
  trade_plan: {
    direction: "long",
    entry: 210,
    stop: 207,
    target: 216,
    planned_risk: 3,
    planned_reward: 6,
    planned_r_multiple: 2,
    invalidation_logic: "close below 207",
  },
  setup_and_confidence: {
    setup_family: "momentum_continuation",
    setup_variant: "opening_drive",
    numeric_confidence: 0.78,
    confidence_label: "high",
    tier: "strong",
  },
  quality_gates: {
    sanitizer_passed: true,
    risk_geometry_valid: true,
    snapshot_completeness: "complete",
    rejection_reason: null,
  },
  context: {
    context_snapshot_id: "context:v1:001",
    recommendation_snapshot_id: "snapshot:v1:001",
    recommendation_id: "recommendation:v1:001",
    captured_at: "2026-07-08T13:44:30.000Z",
    available_at_snapshot_time: true,
    market: {
      completeness: "complete",
      spy_direction: { state: "present", value: "up" },
      qqq_direction: { state: "present", value: "up" },
      iwm_direction: { state: "present", value: "neutral" },
      market_regime: { state: "present", value: "bullish" },
      volatility_regime: { state: "present", value: "normal" },
    },
    sector_industry: {
      sector: { state: "present", value: "technology" },
      industry: { state: "present", value: "consumer_electronics" },
      sector_relative_strength: { state: "present", value: "positive" },
    },
    relative_strength: {
      stock_vs_spy: { state: "present", value: 0.64 },
      stock_vs_sector: { state: "present", value: 0.41 },
      intraday_label: { state: "present", value: "strong" },
    },
    news_catalyst: {
      availability: "absent",
      catalyst_detected: PRESENT_FALSE,
      catalyst_type: EXPLICIT_NULL,
      catalyst_timestamp: null,
      headline_summary: null,
    },
    calendar_event: {
      availability: "absent",
      event_type: EXPLICIT_NULL,
      event_risk_label: { state: "present", value: "none" },
    },
  },
  data_provenance: {
    state: "complete",
    provider: "static_fixture_provider",
    source_timestamp: "2026-07-08T13:44:00.000Z",
    interval: "5min",
    adjusted_or_unadjusted: "unadjusted",
    source_confidence: 1,
    audit_readback_status: "verified",
    missing_data_flags: [],
    completeness_score: 1,
  },
  outcome_fields: {
    availability: "complete",
    evaluated_outcome_id: "outcome:v1:001",
    recommendation_snapshot_id: "snapshot:v1:001",
    recommendation_id: "recommendation:v1:001",
    outcome_window: "60m",
    outcome_status: "target_hit",
    evaluated_at: "2026-07-08T14:45:00.000Z",
    entry_touched: true,
    target_hit: true,
    stop_hit: false,
    no_entry_triggered: false,
    open_at_window_end: false,
    gross_r_multiple: 2,
    max_favorable_excursion_r: 2.18,
    max_adverse_excursion_r: -0.16,
  },
  derived_learning_fields: {
    setup_success_label: "success",
    confidence_bucket: "high",
    recommendation_should_have_been_filtered: false,
  },
  anti_leakage_status: "passed",
  learning_eligibility_status: "full",
  missing_context_reasons: [],
  fixture_expected_status: "valid",
  completeness_score: 1,
};

function linkedIdentity(index: string, ticker: string): LearningDatasetIdentity {
  return {
    ...COMPLETE_ROW.identity,
    dataset_row_id: `learning_row:v1:${index}`,
    learning_row_key: `snapshot:v1:${index}|60m|outcome:v1:${index}`,
    recommendation_snapshot_id: `snapshot:v1:${index}`,
    recommendation_id: `recommendation:v1:${index}`,
    candidate_id: `candidate:v1:${index}`,
    context_snapshot_id: `context:v1:${index}`,
    evaluated_outcome_id: `outcome:v1:${index}`,
    batch_fingerprint: `rec_batch_fixture_${index}`,
    scan_run_id: `rec_scan_run_fixture_${index}`,
    ticker,
  };
}

function linkedContext(
  identity: LearningDatasetIdentity,
  overrides: Partial<LearningDatasetContext> = {},
): LearningDatasetContext {
  return {
    ...COMPLETE_ROW.context,
    context_snapshot_id: identity.context_snapshot_id,
    recommendation_snapshot_id: identity.recommendation_snapshot_id,
    recommendation_id: identity.recommendation_id,
    ...overrides,
  };
}

function linkedOutcome(
  identity: LearningDatasetIdentity,
  overrides: Partial<LearningDatasetOutcome> = {},
): LearningDatasetOutcome {
  return {
    ...COMPLETE_ROW.outcome_fields,
    evaluated_outcome_id: identity.evaluated_outcome_id,
    recommendation_snapshot_id: identity.recommendation_snapshot_id,
    recommendation_id: identity.recommendation_id,
    ...overrides,
  };
}

const RICH_IDENTITY = linkedIdentity("002:rich_context", "MSFT");
const MISSING_OPTIONAL_IDENTITY = linkedIdentity("003:missing_optional", "NVDA");
const PARTIAL_MARKET_IDENTITY = linkedIdentity("004:partial_market", "AMD");
const ABSENT_NEWS_IDENTITY = linkedIdentity("005:absent_news", "META");
const ABSENT_EVENT_IDENTITY = linkedIdentity("006:absent_event", "GOOGL");
const INCOMPLETE_OUTCOME_IDENTITY = linkedIdentity("007:incomplete_outcome", "TSLA");
const NO_OUTCOME_IDENTITY = linkedIdentity("008:no_outcome_yet", "PLTR");
const UNKNOWN_IDENTITY = linkedIdentity("009:unknown_categorical", "BAC");
const UNAVAILABLE_IDENTITY = linkedIdentity("010:unavailable_source", "DIS");
const PARTIAL_PROVENANCE_IDENTITY = linkedIdentity("011:partial_provenance", "CAT");
const LOW_COMPLETENESS_IDENTITY = linkedIdentity("012:low_completeness", "SMCI");
const EXPLICIT_NULL_IDENTITY = linkedIdentity("013:explicit_null", "INTC");

export const learningDatasetStaticFixtures: readonly Action335LearningDatasetRow[] = [
  COMPLETE_ROW,
  {
    ...COMPLETE_ROW,
    fixture_family_tags: ["complete_rich_intelligence_context", "valid_identity_linkage"],
    identity: RICH_IDENTITY,
    context: linkedContext(RICH_IDENTITY, {
      news_catalyst: {
        availability: "present",
        catalyst_detected: PRESENT_TRUE,
        catalyst_type: { state: "present", value: "product_announcement" },
        catalyst_timestamp: "2026-07-08T13:30:00.000Z",
        headline_summary: "Static pre-snapshot product announcement context.",
      },
      calendar_event: {
        availability: "present",
        event_type: { state: "present", value: "macro_release" },
        event_risk_label: { state: "present", value: "moderate" },
      },
    }),
    outcome_fields: linkedOutcome(RICH_IDENTITY),
  },
  {
    ...COMPLETE_ROW,
    fixture_family_tags: ["missing_optional_context", "valid_with_explicit_gaps"],
    identity: MISSING_OPTIONAL_IDENTITY,
    context: linkedContext(MISSING_OPTIONAL_IDENTITY, {
      sector_industry: {
        sector: { state: "present", value: "technology" },
        industry: UNAVAILABLE,
        sector_relative_strength: UNAVAILABLE,
      },
    }),
    outcome_fields: linkedOutcome(MISSING_OPTIONAL_IDENTITY),
    learning_eligibility_status: "limited",
    missing_context_reasons: ["industry_unavailable", "sector_relative_strength_unavailable"],
    fixture_expected_status: "valid_with_gaps",
    completeness_score: 0.82,
  },
  {
    ...COMPLETE_ROW,
    fixture_family_tags: ["partial_market_context"],
    identity: PARTIAL_MARKET_IDENTITY,
    context: linkedContext(PARTIAL_MARKET_IDENTITY, {
      market: {
        ...COMPLETE_ROW.context.market,
        completeness: "partial",
        iwm_direction: UNAVAILABLE,
        volatility_regime: UNKNOWN,
      },
    }),
    outcome_fields: linkedOutcome(PARTIAL_MARKET_IDENTITY),
    learning_eligibility_status: "limited",
    missing_context_reasons: ["iwm_direction_unavailable", "volatility_regime_unknown"],
    fixture_expected_status: "valid_with_gaps",
    completeness_score: 0.78,
  },
  {
    ...COMPLETE_ROW,
    fixture_family_tags: ["absent_news_context"],
    identity: ABSENT_NEWS_IDENTITY,
    context: linkedContext(ABSENT_NEWS_IDENTITY),
    outcome_fields: linkedOutcome(ABSENT_NEWS_IDENTITY),
  },
  {
    ...COMPLETE_ROW,
    fixture_family_tags: ["absent_event_context"],
    identity: ABSENT_EVENT_IDENTITY,
    context: linkedContext(ABSENT_EVENT_IDENTITY),
    outcome_fields: linkedOutcome(ABSENT_EVENT_IDENTITY),
  },
  {
    ...COMPLETE_ROW,
    fixture_family_tags: ["incomplete_outcome"],
    identity: INCOMPLETE_OUTCOME_IDENTITY,
    context: linkedContext(INCOMPLETE_OUTCOME_IDENTITY),
    outcome_fields: linkedOutcome(INCOMPLETE_OUTCOME_IDENTITY, {
      availability: "incomplete",
      outcome_status: "open_at_window_end",
      target_hit: null,
      stop_hit: null,
      gross_r_multiple: null,
      max_favorable_excursion_r: 0.42,
      max_adverse_excursion_r: null,
    }),
    derived_learning_fields: {
      setup_success_label: "incomplete",
      confidence_bucket: "high",
      recommendation_should_have_been_filtered: null,
    },
    learning_eligibility_status: "limited",
    missing_context_reasons: ["outcome_metrics_incomplete"],
    fixture_expected_status: "valid_with_gaps",
    completeness_score: 0.8,
  },
  {
    ...COMPLETE_ROW,
    fixture_family_tags: ["no_outcome_yet_state"],
    identity: { ...NO_OUTCOME_IDENTITY, evaluated_outcome_id: null },
    context: linkedContext(NO_OUTCOME_IDENTITY),
    outcome_fields: linkedOutcome(NO_OUTCOME_IDENTITY, {
      availability: "not_yet_available",
      evaluated_outcome_id: null,
      outcome_status: "not_yet_available",
      evaluated_at: null,
      entry_touched: null,
      target_hit: null,
      stop_hit: null,
      no_entry_triggered: null,
      open_at_window_end: null,
      gross_r_multiple: null,
      max_favorable_excursion_r: null,
      max_adverse_excursion_r: null,
    }),
    derived_learning_fields: {
      setup_success_label: "pending",
      confidence_bucket: "high",
      recommendation_should_have_been_filtered: null,
    },
    learning_eligibility_status: "pending",
    missing_context_reasons: ["outcome_not_yet_available"],
    fixture_expected_status: "pending_outcome",
    completeness_score: 0.74,
  },
  {
    ...COMPLETE_ROW,
    fixture_family_tags: ["unknown_categorical_value"],
    identity: { ...UNKNOWN_IDENTITY, trading_window: "unknown" },
    setup_and_confidence: {
      ...COMPLETE_ROW.setup_and_confidence,
      setup_family: "unknown",
      confidence_label: "unknown",
      tier: "unknown",
    },
    context: linkedContext(UNKNOWN_IDENTITY, {
      market: { ...COMPLETE_ROW.context.market, market_regime: UNKNOWN },
    }),
    outcome_fields: linkedOutcome(UNKNOWN_IDENTITY),
    derived_learning_fields: {
      ...COMPLETE_ROW.derived_learning_fields,
      confidence_bucket: "unknown",
    },
    learning_eligibility_status: "limited",
    missing_context_reasons: ["setup_family_unknown", "market_regime_unknown"],
    fixture_expected_status: "valid_with_gaps",
    completeness_score: 0.7,
  },
  {
    ...COMPLETE_ROW,
    fixture_family_tags: ["unavailable_source"],
    identity: UNAVAILABLE_IDENTITY,
    context: linkedContext(UNAVAILABLE_IDENTITY),
    data_provenance: {
      state: "unavailable",
      provider: null,
      source_timestamp: null,
      interval: null,
      adjusted_or_unadjusted: "unknown",
      source_confidence: null,
      audit_readback_status: "unavailable",
      missing_data_flags: ["provider_unavailable", "source_timestamp_unavailable"],
      completeness_score: 0,
    },
    outcome_fields: linkedOutcome(UNAVAILABLE_IDENTITY),
    learning_eligibility_status: "limited",
    missing_context_reasons: ["provenance_unavailable"],
    fixture_expected_status: "valid_with_gaps",
    completeness_score: 0.58,
  },
  {
    ...COMPLETE_ROW,
    fixture_family_tags: ["partial_provenance"],
    identity: PARTIAL_PROVENANCE_IDENTITY,
    context: linkedContext(PARTIAL_PROVENANCE_IDENTITY),
    data_provenance: {
      ...COMPLETE_ROW.data_provenance,
      state: "partial",
      source_confidence: 0.62,
      audit_readback_status: "partial",
      missing_data_flags: ["provider_request_id_unavailable"],
      completeness_score: 0.68,
    },
    outcome_fields: linkedOutcome(PARTIAL_PROVENANCE_IDENTITY),
    learning_eligibility_status: "limited",
    missing_context_reasons: ["provenance_partial"],
    fixture_expected_status: "valid_with_gaps",
    completeness_score: 0.76,
  },
  {
    ...COMPLETE_ROW,
    fixture_family_tags: ["low_provenance_completeness"],
    identity: LOW_COMPLETENESS_IDENTITY,
    context: linkedContext(LOW_COMPLETENESS_IDENTITY),
    quality_gates: { ...COMPLETE_ROW.quality_gates, snapshot_completeness: "low" },
    data_provenance: {
      ...COMPLETE_ROW.data_provenance,
      state: "partial",
      provider: null,
      source_confidence: 0.2,
      audit_readback_status: "partial",
      missing_data_flags: ["provider_missing", "audit_reference_missing"],
      completeness_score: 0.2,
    },
    outcome_fields: linkedOutcome(LOW_COMPLETENESS_IDENTITY),
    learning_eligibility_status: "limited",
    missing_context_reasons: ["provenance_low_completeness"],
    fixture_expected_status: "valid_with_gaps",
    completeness_score: 0.51,
  },
  {
    ...COMPLETE_ROW,
    fixture_family_tags: ["explicit_null_semantics"],
    identity: EXPLICIT_NULL_IDENTITY,
    context: linkedContext(EXPLICIT_NULL_IDENTITY, {
      sector_industry: {
        sector: { state: "present", value: "technology" },
        industry: EXPLICIT_NULL,
        sector_relative_strength: UNKNOWN,
      },
      news_catalyst: {
        availability: "unavailable",
        catalyst_detected: UNAVAILABLE,
        catalyst_type: EXPLICIT_NULL,
        catalyst_timestamp: null,
        headline_summary: null,
      },
    }),
    outcome_fields: linkedOutcome(EXPLICIT_NULL_IDENTITY),
    learning_eligibility_status: "limited",
    missing_context_reasons: ["industry_explicit_null", "news_source_unavailable"],
    fixture_expected_status: "valid_with_gaps",
    completeness_score: 0.69,
  },
] as const;

const malformedLearningDatasetStaticFixtureCases: readonly LearningDatasetMalformedFixtureCase[] = [
  { case_id: "malformed:001", reason: "missing_required_identity", expected_validation_status: "invalid", raw_fixture: { identity: { dataset_row_id: "" } } },
  { case_id: "malformed:002", reason: "conflicting_identity_linkage", expected_validation_status: "invalid", raw_fixture: { identity: { recommendation_snapshot_id: "snapshot:a" }, outcome_fields: { recommendation_snapshot_id: "snapshot:b" } } },
  { case_id: "malformed:003", reason: "invalid_recommendation_context_relationship", expected_validation_status: "invalid", raw_fixture: { identity: { recommendation_id: "recommendation:a" }, context: { recommendation_id: "recommendation:b" } } },
  { case_id: "malformed:004", reason: "invalid_temporal_ordering", expected_validation_status: "invalid", raw_fixture: { snapshot_time_inputs: { recommendation_created_at: "2026-07-08T13:45:00.000Z", snapshot_captured_at: "2026-07-08T13:44:59.000Z" } } },
  { case_id: "malformed:005", reason: "context_after_prohibited_boundary", expected_validation_status: "invalid", raw_fixture: { context: { captured_at: "2026-07-08T13:45:01.000Z" }, snapshot_time_inputs: { recommendation_created_at: "2026-07-08T13:45:00.000Z" } } },
  { case_id: "malformed:006", reason: "outcome_leaked_into_snapshot_fields", expected_validation_status: "invalid", raw_fixture: { snapshot_time_inputs: { target_hit: true } } },
  { case_id: "malformed:007", reason: "outcome_before_recommendation", expected_validation_status: "invalid", raw_fixture: { recommendation_created_at: "2026-07-08T13:45:00.000Z", evaluated_at: "2026-07-08T13:44:00.000Z" } },
  { case_id: "malformed:008", reason: "unsupported_categorical_value", expected_validation_status: "invalid", raw_fixture: { identity: { trading_window: "overnight_magic" } } },
  { case_id: "malformed:009", reason: "malformed_provenance", expected_validation_status: "invalid", raw_fixture: { data_provenance: { state: "complete", provider: null, source_timestamp: null } } },
  { case_id: "malformed:010", reason: "non_finite_numeric_metric", expected_validation_status: "invalid", raw_fixture: { trade_plan: { entry: Number.POSITIVE_INFINITY } } },
  { case_id: "malformed:011", reason: "invalid_completeness_bounds", expected_validation_status: "invalid", raw_fixture: { completeness_score: 1.1 } },
  { case_id: "malformed:012", reason: "duplicate_row_identity", expected_validation_status: "invalid", raw_fixture: { dataset_row_ids: ["learning_row:v1:001", "learning_row:v1:001"] } },
  { case_id: "malformed:013", reason: "unstable_timestamp_attempt", expected_validation_status: "invalid", raw_fixture: { recommendation_created_at_expression: "wall_clock_now" } },
  { case_id: "malformed:014", reason: "random_identity_attempt", expected_validation_status: "invalid", raw_fixture: { dataset_row_id_expression: "generated_random_uuid" } },
] as const;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getLearningDatasetStaticFixtures(): Action335LearningDatasetRow[] {
  return clone(learningDatasetStaticFixtures) as Action335LearningDatasetRow[];
}

export function getLearningDatasetStaticFixtureById(
  datasetRowId: string,
): Action335LearningDatasetRow | null {
  const fixture = learningDatasetStaticFixtures.find(
    (item) => item.identity.dataset_row_id === datasetRowId,
  );
  return fixture ? clone(fixture) : null;
}

export function getMalformedLearningDatasetStaticFixtureCases(): LearningDatasetMalformedFixtureCase[] {
  return clone(malformedLearningDatasetStaticFixtureCases) as LearningDatasetMalformedFixtureCase[];
}

export function serializeLearningDatasetStaticFixtures(): string {
  return JSON.stringify(learningDatasetStaticFixtures);
}

const SNAPSHOT_OUTCOME_KEYS = [
  "outcome_status",
  "target_hit",
  "stop_hit",
  "gross_r_multiple",
  "max_favorable_excursion_r",
  "max_adverse_excursion_r",
] as const;

function allNumbersFinite(value: unknown): boolean {
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(allNumbersFinite);
  if (value && typeof value === "object") {
    return Object.values(value).every(allNumbersFinite);
  }
  return true;
}

function contextValues(value: unknown): LearningDatasetContextValue[] {
  if (!value || typeof value !== "object") return [];
  if ("state" in value && "value" in value) {
    return [value as LearningDatasetContextValue];
  }
  return Object.values(value).flatMap(contextValues);
}

export function validateLearningDatasetStaticFixtureSet(): LearningDatasetStaticFixtureValidationResult {
  const errors: string[] = [];
  const ids = new Set<string>();
  let previousId = "";

  for (const row of learningDatasetStaticFixtures) {
    const id = row.identity.dataset_row_id;
    if (!id || !row.identity.learning_row_key || !row.identity.recommendation_snapshot_id) {
      errors.push(`${id || "missing"}:missing_identity`);
    }
    if (ids.has(id)) errors.push(`${id}:duplicate_identity`);
    ids.add(id);
    if (previousId && previousId.localeCompare(id) >= 0) errors.push(`${id}:unstable_ordering`);
    previousId = id;

    if (row.context.context_snapshot_id !== row.identity.context_snapshot_id) errors.push(`${id}:context_id_mismatch`);
    if (row.context.recommendation_snapshot_id !== row.identity.recommendation_snapshot_id) errors.push(`${id}:context_snapshot_link_mismatch`);
    if (row.context.recommendation_id !== row.identity.recommendation_id) errors.push(`${id}:context_recommendation_link_mismatch`);
    if (row.outcome_fields.recommendation_snapshot_id !== row.identity.recommendation_snapshot_id) errors.push(`${id}:outcome_snapshot_link_mismatch`);
    if (row.outcome_fields.recommendation_id !== row.identity.recommendation_id) errors.push(`${id}:outcome_recommendation_link_mismatch`);
    if (row.outcome_fields.evaluated_outcome_id !== row.identity.evaluated_outcome_id) errors.push(`${id}:outcome_id_mismatch`);

    const created = Date.parse(row.snapshot_time_inputs.recommendation_created_at);
    const snapshot = Date.parse(row.snapshot_time_inputs.snapshot_captured_at);
    const context = Date.parse(row.context.captured_at);
    const outcome = row.outcome_fields.evaluated_at ? Date.parse(row.outcome_fields.evaluated_at) : null;
    if (![created, snapshot, context].every(Number.isFinite)) errors.push(`${id}:invalid_timestamp`);
    if (snapshot < created) errors.push(`${id}:snapshot_before_recommendation`);
    if (context > created) errors.push(`${id}:context_after_recommendation`);
    if (outcome !== null && (!Number.isFinite(outcome) || outcome < created)) errors.push(`${id}:outcome_before_recommendation`);

    const snapshotSerialization = JSON.stringify(row.snapshot_time_inputs);
    if (SNAPSHOT_OUTCOME_KEYS.some((key) => snapshotSerialization.includes(key))) errors.push(`${id}:snapshot_outcome_leakage`);
    if (!allNumbersFinite(row)) errors.push(`${id}:non_finite_numeric_value`);
    if (row.completeness_score < 0 || row.completeness_score > 1) errors.push(`${id}:invalid_completeness`);
    if (row.data_provenance.completeness_score < 0 || row.data_provenance.completeness_score > 1) errors.push(`${id}:invalid_provenance_completeness`);
    if (row.data_provenance.source_confidence !== null && (row.data_provenance.source_confidence < 0 || row.data_provenance.source_confidence > 1)) errors.push(`${id}:invalid_source_confidence`);
    if (row.data_provenance.state === "complete" && (!row.data_provenance.provider || !row.data_provenance.source_timestamp)) errors.push(`${id}:malformed_complete_provenance`);

    for (const item of contextValues(row.context)) {
      if ((item.state === "explicit_null" || item.state === "unavailable") && item.value !== null) errors.push(`${id}:invalid_null_or_unavailable_semantics`);
      if (item.state === "unknown" && item.value !== "unknown") errors.push(`${id}:invalid_unknown_semantics`);
      if (item.state === "present" && item.value === null) errors.push(`${id}:invalid_present_semantics`);
    }

    if (row.outcome_fields.availability === "not_yet_available") {
      if (row.outcome_fields.evaluated_at !== null || row.outcome_fields.evaluated_outcome_id !== null || row.outcome_fields.outcome_status !== "not_yet_available") errors.push(`${id}:invalid_pending_outcome_semantics`);
    }
    if (row.anti_leakage_status !== "passed") errors.push(`${id}:anti_leakage_not_passed`);
  }

  return { ok: errors.length === 0, errors };
}
