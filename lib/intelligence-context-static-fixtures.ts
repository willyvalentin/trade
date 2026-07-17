import type {
  LearningDatasetContext,
  LearningDatasetContextValue,
  LearningDatasetProvenance,
} from "@/lib/learning-dataset-static-fixtures";

export const ACTION_336_INTELLIGENCE_CONTEXT_CONTRACT_REFERENCE =
  "docs/action-336-intelligence-context-schema-draft.md" as const;
export const ACTION_342_INTELLIGENCE_CONTEXT_FIXTURE_SPEC_REFERENCE =
  "docs/action-342-intelligence-context-static-fixture-spec.md" as const;
export const ACTION_380_LEARNING_DATASET_CONTEXT_TYPE_REFERENCE =
  "lib/learning-dataset-static-fixtures.ts" as const;
export const INTELLIGENCE_CONTEXT_STATIC_FIXTURE_VERSION =
  "intelligence_context_static_fixture_v1" as const;

export type IntelligenceContextFreshness = Readonly<{
  state: "fresh" | "stale" | "unknown" | "unavailable";
  age_minutes_at_recommendation: number | null;
  rationale: string;
}>;

export type IntelligenceContextConflictMetadata = Readonly<{
  state: "none" | "conflicting";
  source_ids: readonly string[];
  details: string | null;
}>;

export type IntelligenceContextExcludedFutureFact = Readonly<{
  domain: "company_news" | "macro_event" | "market_regime" | "relative_strength";
  effective_at: string;
  included_in_snapshot_context: false;
  exclusion_reason: "after_recommendation_boundary" | "post_outcome_only";
}>;

export type Action336IntelligenceContextStaticFixture = Readonly<{
  fixture_id: string;
  fixture_version: typeof INTELLIGENCE_CONTEXT_STATIC_FIXTURE_VERSION;
  fixture_family_tags: readonly string[];
  description: string;
  symbol: string;
  recommendation_linkage: Readonly<{
    recommendation_snapshot_id: string;
    recommendation_id: string | null;
    recommendation_created_at: string;
  }>;
  effective_at: string;
  context: LearningDatasetContext;
  data_provenance: LearningDatasetProvenance;
  freshness: IntelligenceContextFreshness;
  conflict_metadata: IntelligenceContextConflictMetadata;
  excluded_future_context: readonly IntelligenceContextExcludedFutureFact[];
  expected_context_labels: Readonly<{
    market_regime_label: string;
    sector_support_label: "strong" | "weak" | "neutral" | "conflicting" | "unknown";
    industry_support_label: "strong" | "weak" | "neutral" | "unknown";
    peer_group_support_label: "strong" | "weak" | "neutral" | "unknown";
    relative_strength_label: "positive" | "negative" | "conflicting" | "unknown";
    catalyst_support_label: "positive" | "negative" | "neutral" | "none" | "unavailable" | "conflicting";
    calendar_risk_label: "high" | "moderate" | "none" | "unavailable";
    data_provenance_label: "complete" | "partial" | "low_quality" | "stale" | "conflicting" | "unavailable";
    context_completeness_label: "complete" | "partial" | "low";
  }>;
  anti_leakage_status: "passed";
  learning_context_eligibility: "full" | "limited";
  missing_context_reasons: readonly string[];
}>;

export type IntelligenceContextMalformedFixtureCase = Readonly<{
  case_id: string;
  reason:
    | "missing_context_identity"
    | "duplicate_fixture_identity"
    | "invalid_recommendation_linkage"
    | "capture_after_recommendation_boundary"
    | "effective_after_recommendation_without_exclusion"
    | "future_news_leakage"
    | "future_macro_event_leakage"
    | "outcome_data_embedded_in_context"
    | "malformed_provenance"
    | "unsupported_categorical_value"
    | "invalid_freshness_state"
    | "stale_timestamp_marked_fresh"
    | "conflicting_without_metadata"
    | "partial_context_marked_complete"
    | "non_finite_relative_strength_metric"
    | "invalid_confidence_or_source_quality_bounds"
    | "random_id_attempt"
    | "wall_clock_timestamp_attempt";
  expected_validation_status: "invalid";
  raw_fixture: Record<string, unknown>;
}>;

export type IntelligenceContextStaticFixtureValidationResult = Readonly<{
  ok: boolean;
  errors: readonly string[];
}>;

const RECOMMENDATION_AT = "2026-07-08T13:45:00.000Z" as const;
const CAPTURED_AT = "2026-07-08T13:44:30.000Z" as const;
const EFFECTIVE_AT = "2026-07-08T13:44:00.000Z" as const;

const present = (value: string | number | boolean): LearningDatasetContextValue => ({
  state: "present",
  value,
});
const EXPLICIT_NULL: LearningDatasetContextValue = {
  state: "explicit_null",
  value: null,
};
const UNAVAILABLE: LearningDatasetContextValue = {
  state: "unavailable",
  value: null,
};
const UNKNOWN: LearningDatasetContextValue = {
  state: "unknown",
  value: "unknown",
};

const COMPLETE_PROVENANCE: LearningDatasetProvenance = {
  state: "complete",
  provider: "static_context_fixture_provider",
  source_timestamp: EFFECTIVE_AT,
  interval: "5min",
  adjusted_or_unadjusted: "unadjusted",
  source_confidence: 1,
  audit_readback_status: "verified",
  missing_data_flags: [],
  completeness_score: 1,
};

function identity(index: string) {
  return {
    fixture_id: `intelligence_context:v1:${index}`,
    recommendation_snapshot_id: `snapshot:context_fixture:${index}`,
    recommendation_id: `recommendation:context_fixture:${index}`,
    context_snapshot_id: `context:fixture:${index}`,
  };
}

function contextFor(
  ids: ReturnType<typeof identity>,
  overrides: Partial<LearningDatasetContext> = {},
): LearningDatasetContext {
  return {
    context_snapshot_id: ids.context_snapshot_id,
    recommendation_snapshot_id: ids.recommendation_snapshot_id,
    recommendation_id: ids.recommendation_id,
    captured_at: CAPTURED_AT,
    available_at_snapshot_time: true,
    market: {
      completeness: "complete",
      spy_direction: present("up"),
      qqq_direction: present("up"),
      iwm_direction: present("up"),
      market_regime: present("bullish"),
      volatility_regime: present("low"),
    },
    sector_industry: {
      sector: present("technology"),
      industry: present("software"),
      sector_relative_strength: present("strong"),
    },
    relative_strength: {
      stock_vs_spy: present(0.62),
      stock_vs_sector: present(0.41),
      intraday_label: present("positive"),
    },
    news_catalyst: {
      availability: "absent",
      catalyst_detected: present(false),
      catalyst_type: EXPLICIT_NULL,
      catalyst_timestamp: null,
      headline_summary: null,
    },
    calendar_event: {
      availability: "absent",
      event_type: EXPLICIT_NULL,
      event_risk_label: present("none"),
    },
    ...overrides,
  };
}

function labels(
  overrides: Partial<Action336IntelligenceContextStaticFixture["expected_context_labels"]> = {},
): Action336IntelligenceContextStaticFixture["expected_context_labels"] {
  return {
    market_regime_label: "bullish_trend_day",
    sector_support_label: "strong",
    industry_support_label: "strong",
    peer_group_support_label: "strong",
    relative_strength_label: "positive",
    catalyst_support_label: "none",
    calendar_risk_label: "none",
    data_provenance_label: "complete",
    context_completeness_label: "complete",
    ...overrides,
  };
}

function fixture(
  ids: ReturnType<typeof identity>,
  input: Omit<
    Action336IntelligenceContextStaticFixture,
    "fixture_id" | "fixture_version" | "recommendation_linkage"
  >,
): Action336IntelligenceContextStaticFixture {
  return {
    fixture_id: ids.fixture_id,
    fixture_version: INTELLIGENCE_CONTEXT_STATIC_FIXTURE_VERSION,
    recommendation_linkage: {
      recommendation_snapshot_id: ids.recommendation_snapshot_id,
      recommendation_id: ids.recommendation_id,
      recommendation_created_at: RECOMMENDATION_AT,
    },
    ...input,
  };
}

const IDS_001 = identity("001:supportive_bull");
const IDS_002 = identity("002:bearish_risk");
const IDS_003 = identity("003:mixed_conflict");
const IDS_004 = identity("004:partial_market");
const IDS_005 = identity("005:earnings");
const IDS_006 = identity("006:guidance");
const IDS_007 = identity("007:fda");
const IDS_008 = identity("008:sec");
const IDS_009 = identity("009:news_unavailable");
const IDS_010 = identity("010:jobs");
const IDS_011 = identity("011:options_expiration");
const IDS_012 = identity("012:future_event_excluded");
const IDS_013 = identity("013:stale_source");
const IDS_014 = identity("014:missing_semantics");
const IDS_015 = identity("015:isolated_stock_strength");

export const intelligenceContextStaticFixtures: readonly Action336IntelligenceContextStaticFixture[] = [
  fixture(IDS_001, {
    fixture_family_tags: [
      "supportive_bull_regime_sector_strength",
      "bullish_market_regime",
      "trend_day",
      "low_volatility",
      "spy_aligned",
      "qqq_aligned",
      "iwm_aligned",
      "strong_sector",
      "strong_industry",
      "strong_peer_group",
      "positive_relative_strength",
      "no_material_news",
      "no_relevant_macro_event",
      "complete_provenance",
    ],
    description: "Supportive bullish trend context with broad index and peer confirmation.",
    symbol: "AAPL",
    effective_at: EFFECTIVE_AT,
    context: contextFor(IDS_001),
    data_provenance: COMPLETE_PROVENANCE,
    freshness: { state: "fresh", age_minutes_at_recommendation: 1, rationale: "fixed_pre_recommendation_source" },
    conflict_metadata: { state: "none", source_ids: ["static_source:market:001"], details: null },
    excluded_future_context: [],
    expected_context_labels: labels(),
    anti_leakage_status: "passed",
    learning_context_eligibility: "full",
    missing_context_reasons: [],
  }),
  fixture(IDS_002, {
    fixture_family_tags: [
      "bearish_market_regime",
      "trend_day",
      "elevated_volatility",
      "spy_aligned",
      "qqq_aligned",
      "iwm_aligned",
      "weak_sector",
      "weak_industry",
      "weak_peer_group",
      "negative_relative_strength",
      "negative_material_news",
      "sec_event",
      "cpi_event",
      "event_before_recommendation",
    ],
    description: "Bearish high-volatility alignment with negative SEC context before CPI risk.",
    symbol: "BAC",
    effective_at: EFFECTIVE_AT,
    context: contextFor(IDS_002, {
      market: {
        completeness: "complete",
        spy_direction: present("down"),
        qqq_direction: present("down"),
        iwm_direction: present("down"),
        market_regime: present("bearish"),
        volatility_regime: present("elevated"),
      },
      sector_industry: {
        sector: present("financials"),
        industry: present("banks"),
        sector_relative_strength: present("weak"),
      },
      relative_strength: {
        stock_vs_spy: present(-0.58),
        stock_vs_sector: present(-0.37),
        intraday_label: present("negative"),
      },
      news_catalyst: {
        availability: "present",
        catalyst_detected: present(true),
        catalyst_type: present("sec_filing"),
        catalyst_timestamp: "2026-07-08T13:20:00.000Z",
        headline_summary: "Static negative SEC filing context.",
      },
      calendar_event: {
        availability: "present",
        event_type: present("cpi"),
        event_risk_label: present("high"),
      },
    }),
    data_provenance: COMPLETE_PROVENANCE,
    freshness: { state: "fresh", age_minutes_at_recommendation: 25, rationale: "fixed_pre_recommendation_news" },
    conflict_metadata: { state: "none", source_ids: ["static_source:sec:002"], details: null },
    excluded_future_context: [],
    expected_context_labels: labels({
      market_regime_label: "bearish_trend_day_elevated_volatility",
      sector_support_label: "weak",
      industry_support_label: "weak",
      peer_group_support_label: "weak",
      relative_strength_label: "negative",
      catalyst_support_label: "negative",
      calendar_risk_label: "high",
    }),
    anti_leakage_status: "passed",
    learning_context_eligibility: "full",
    missing_context_reasons: [],
  }),
  fixture(IDS_003, {
    fixture_family_tags: [
      "neutral_or_mixed_regime",
      "chop_day",
      "spy_diverging",
      "qqq_diverging",
      "iwm_diverging",
      "conflicting_relative_signals",
      "neutral_news",
      "fomc_event",
      "conflicting_company_event_signals",
      "conflicting_sources",
      "macro_event_chop_day",
    ],
    description: "Mixed index tape with conflicting relative and company-event evidence on FOMC day.",
    symbol: "TSLA",
    effective_at: EFFECTIVE_AT,
    context: contextFor(IDS_003, {
      market: {
        completeness: "complete",
        spy_direction: present("up"),
        qqq_direction: present("down"),
        iwm_direction: present("neutral"),
        market_regime: present("mixed"),
        volatility_regime: present("elevated"),
      },
      sector_industry: {
        sector: present("consumer_discretionary"),
        industry: present("automobiles"),
        sector_relative_strength: present("conflicting"),
      },
      relative_strength: {
        stock_vs_spy: present(0.31),
        stock_vs_sector: present(-0.28),
        intraday_label: present("conflicting"),
      },
      news_catalyst: {
        availability: "present",
        catalyst_detected: present(true),
        catalyst_type: present("neutral_company_update"),
        catalyst_timestamp: "2026-07-08T13:25:00.000Z",
        headline_summary: "Static sources disagree on company-event significance.",
      },
      calendar_event: {
        availability: "present",
        event_type: present("fomc"),
        event_risk_label: present("high"),
      },
    }),
    data_provenance: { ...COMPLETE_PROVENANCE, state: "partial", audit_readback_status: "partial", missing_data_flags: ["source_disagreement"], completeness_score: 0.78 },
    freshness: { state: "fresh", age_minutes_at_recommendation: 20, rationale: "fixed_conflicting_pre_recommendation_sources" },
    conflict_metadata: { state: "conflicting", source_ids: ["static_source:news:003:a", "static_source:news:003:b"], details: "Direction and materiality disagree." },
    excluded_future_context: [],
    expected_context_labels: labels({
      market_regime_label: "mixed_chop_day",
      sector_support_label: "conflicting",
      relative_strength_label: "conflicting",
      catalyst_support_label: "conflicting",
      calendar_risk_label: "high",
      data_provenance_label: "conflicting",
      context_completeness_label: "partial",
    }),
    anti_leakage_status: "passed",
    learning_context_eligibility: "limited",
    missing_context_reasons: ["conflicting_sources"],
  }),
  fixture(IDS_004, {
    fixture_family_tags: ["incomplete_market_regime", "missing_index_context", "partial_provenance", "missing_sector_mapping", "provenance_low_confidence"],
    description: "Partial market and mapping context remains usable with explicit limitations.",
    symbol: "PLTR",
    effective_at: EFFECTIVE_AT,
    context: contextFor(IDS_004, {
      market: {
        completeness: "partial",
        spy_direction: present("up"),
        qqq_direction: UNAVAILABLE,
        iwm_direction: UNAVAILABLE,
        market_regime: UNKNOWN,
        volatility_regime: UNKNOWN,
      },
      sector_industry: {
        sector: UNAVAILABLE,
        industry: UNAVAILABLE,
        sector_relative_strength: UNAVAILABLE,
      },
    }),
    data_provenance: { ...COMPLETE_PROVENANCE, state: "partial", provider: null, source_confidence: 0.45, audit_readback_status: "partial", missing_data_flags: ["qqq_missing", "iwm_missing", "sector_mapping_missing"], completeness_score: 0.52 },
    freshness: { state: "unknown", age_minutes_at_recommendation: null, rationale: "source_timestamp_quality_partial" },
    conflict_metadata: { state: "none", source_ids: ["static_source:partial:004"], details: null },
    excluded_future_context: [],
    expected_context_labels: labels({
      market_regime_label: "unknown",
      sector_support_label: "unknown",
      industry_support_label: "unknown",
      peer_group_support_label: "unknown",
      data_provenance_label: "partial",
      context_completeness_label: "partial",
    }),
    anti_leakage_status: "passed",
    learning_context_eligibility: "limited",
    missing_context_reasons: ["qqq_unavailable", "iwm_unavailable", "sector_mapping_unavailable"],
  }),
  fixture(IDS_005, {
    fixture_family_tags: ["positive_material_news", "earnings_event", "catalyst_fresh_earnings_gap"],
    description: "Fresh positive earnings catalyst available before recommendation.",
    symbol: "NVDA",
    effective_at: "2026-07-08T13:30:00.000Z",
    context: contextFor(IDS_005, {
      news_catalyst: { availability: "present", catalyst_detected: present(true), catalyst_type: present("earnings"), catalyst_timestamp: "2026-07-08T13:30:00.000Z", headline_summary: "Static positive earnings context." },
    }),
    data_provenance: COMPLETE_PROVENANCE,
    freshness: { state: "fresh", age_minutes_at_recommendation: 15, rationale: "earnings_before_recommendation" },
    conflict_metadata: { state: "none", source_ids: ["static_source:earnings:005"], details: null },
    excluded_future_context: [],
    expected_context_labels: labels({ catalyst_support_label: "positive" }),
    anti_leakage_status: "passed",
    learning_context_eligibility: "full",
    missing_context_reasons: [],
  }),
  fixture(IDS_006, {
    fixture_family_tags: ["negative_material_news", "guidance_event"],
    description: "Negative guidance context available before recommendation.",
    symbol: "DIS",
    effective_at: "2026-07-08T13:15:00.000Z",
    context: contextFor(IDS_006, {
      news_catalyst: { availability: "present", catalyst_detected: present(true), catalyst_type: present("guidance"), catalyst_timestamp: "2026-07-08T13:15:00.000Z", headline_summary: "Static negative guidance context." },
    }),
    data_provenance: COMPLETE_PROVENANCE,
    freshness: { state: "fresh", age_minutes_at_recommendation: 30, rationale: "guidance_before_recommendation" },
    conflict_metadata: { state: "none", source_ids: ["static_source:guidance:006"], details: null },
    excluded_future_context: [],
    expected_context_labels: labels({ catalyst_support_label: "negative" }),
    anti_leakage_status: "passed",
    learning_context_eligibility: "full",
    missing_context_reasons: [],
  }),
  fixture(IDS_007, {
    fixture_family_tags: ["positive_material_news", "fda_event"],
    description: "Positive FDA event context available before recommendation.",
    symbol: "LLY",
    effective_at: "2026-07-08T13:10:00.000Z",
    context: contextFor(IDS_007, {
      news_catalyst: { availability: "present", catalyst_detected: present(true), catalyst_type: present("fda"), catalyst_timestamp: "2026-07-08T13:10:00.000Z", headline_summary: "Static positive FDA context." },
    }),
    data_provenance: COMPLETE_PROVENANCE,
    freshness: { state: "fresh", age_minutes_at_recommendation: 35, rationale: "fda_event_before_recommendation" },
    conflict_metadata: { state: "none", source_ids: ["static_source:fda:007"], details: null },
    excluded_future_context: [],
    expected_context_labels: labels({ catalyst_support_label: "positive" }),
    anti_leakage_status: "passed",
    learning_context_eligibility: "full",
    missing_context_reasons: [],
  }),
  fixture(IDS_008, {
    fixture_family_tags: ["negative_material_news", "sec_event"],
    description: "Negative SEC event context available before recommendation.",
    symbol: "MSTR",
    effective_at: "2026-07-08T13:05:00.000Z",
    context: contextFor(IDS_008, {
      news_catalyst: { availability: "present", catalyst_detected: present(true), catalyst_type: present("sec"), catalyst_timestamp: "2026-07-08T13:05:00.000Z", headline_summary: "Static negative SEC context." },
    }),
    data_provenance: COMPLETE_PROVENANCE,
    freshness: { state: "fresh", age_minutes_at_recommendation: 40, rationale: "sec_event_before_recommendation" },
    conflict_metadata: { state: "none", source_ids: ["static_source:sec:008"], details: null },
    excluded_future_context: [],
    expected_context_labels: labels({ catalyst_support_label: "negative" }),
    anti_leakage_status: "passed",
    learning_context_eligibility: "full",
    missing_context_reasons: [],
  }),
  fixture(IDS_009, {
    fixture_family_tags: ["news_unavailable", "missing_news_context", "unavailable_source"],
    description: "Price context is present while news provenance is unavailable.",
    symbol: "DKNG",
    effective_at: EFFECTIVE_AT,
    context: contextFor(IDS_009, {
      news_catalyst: { availability: "unavailable", catalyst_detected: UNAVAILABLE, catalyst_type: UNAVAILABLE, catalyst_timestamp: null, headline_summary: null },
    }),
    data_provenance: { state: "unavailable", provider: null, source_timestamp: null, interval: null, adjusted_or_unadjusted: "unknown", source_confidence: null, audit_readback_status: "unavailable", missing_data_flags: ["news_source_unavailable"], completeness_score: 0 },
    freshness: { state: "unavailable", age_minutes_at_recommendation: null, rationale: "source_unavailable" },
    conflict_metadata: { state: "none", source_ids: [], details: null },
    excluded_future_context: [],
    expected_context_labels: labels({ catalyst_support_label: "unavailable", data_provenance_label: "unavailable", context_completeness_label: "partial" }),
    anti_leakage_status: "passed",
    learning_context_eligibility: "limited",
    missing_context_reasons: ["news_source_unavailable"],
  }),
  fixture(IDS_010, {
    fixture_family_tags: ["jobs_report_event", "event_before_recommendation"],
    description: "Jobs report risk is available before recommendation.",
    symbol: "CAT",
    effective_at: EFFECTIVE_AT,
    context: contextFor(IDS_010, {
      calendar_event: { availability: "present", event_type: present("jobs_report"), event_risk_label: present("high") },
    }),
    data_provenance: COMPLETE_PROVENANCE,
    freshness: { state: "fresh", age_minutes_at_recommendation: 1, rationale: "calendar_snapshot_before_recommendation" },
    conflict_metadata: { state: "none", source_ids: ["static_source:calendar:010"], details: null },
    excluded_future_context: [],
    expected_context_labels: labels({ calendar_risk_label: "high" }),
    anti_leakage_status: "passed",
    learning_context_eligibility: "full",
    missing_context_reasons: [],
  }),
  fixture(IDS_011, {
    fixture_family_tags: ["options_expiration_event", "options_expiration_noise"],
    description: "Options-expiration noise is explicit at recommendation time.",
    symbol: "SPY",
    effective_at: EFFECTIVE_AT,
    context: contextFor(IDS_011, {
      calendar_event: { availability: "present", event_type: present("options_expiration"), event_risk_label: present("moderate") },
    }),
    data_provenance: COMPLETE_PROVENANCE,
    freshness: { state: "fresh", age_minutes_at_recommendation: 1, rationale: "calendar_snapshot_before_recommendation" },
    conflict_metadata: { state: "none", source_ids: ["static_source:calendar:011"], details: null },
    excluded_future_context: [],
    expected_context_labels: labels({ calendar_risk_label: "moderate" }),
    anti_leakage_status: "passed",
    learning_context_eligibility: "full",
    missing_context_reasons: [],
  }),
  fixture(IDS_012, {
    fixture_family_tags: ["other_high_impact_event", "event_after_recommendation_excluded", "anti_leakage_news_after_snapshot"],
    description: "Future company and macro facts are retained only as explicit exclusions.",
    symbol: "META",
    effective_at: EFFECTIVE_AT,
    context: contextFor(IDS_012),
    data_provenance: COMPLETE_PROVENANCE,
    freshness: { state: "fresh", age_minutes_at_recommendation: 1, rationale: "snapshot_context_only" },
    conflict_metadata: { state: "none", source_ids: ["static_source:market:012"], details: null },
    excluded_future_context: [
      { domain: "company_news", effective_at: "2026-07-08T14:00:00.000Z", included_in_snapshot_context: false, exclusion_reason: "after_recommendation_boundary" },
      { domain: "macro_event", effective_at: "2026-07-08T15:00:00.000Z", included_in_snapshot_context: false, exclusion_reason: "after_recommendation_boundary" },
    ],
    expected_context_labels: labels(),
    anti_leakage_status: "passed",
    learning_context_eligibility: "full",
    missing_context_reasons: [],
  }),
  fixture(IDS_013, {
    fixture_family_tags: ["stale_source", "stale_catalyst_risk"],
    description: "Old company context remains explicit and limits learning eligibility.",
    symbol: "INTC",
    effective_at: "2026-07-08T11:45:00.000Z",
    context: contextFor(IDS_013, {
      news_catalyst: { availability: "present", catalyst_detected: present(true), catalyst_type: present("company_update"), catalyst_timestamp: "2026-07-08T11:45:00.000Z", headline_summary: "Static stale company update." },
    }),
    data_provenance: { ...COMPLETE_PROVENANCE, state: "partial", source_timestamp: "2026-07-08T11:45:00.000Z", source_confidence: 0.58, audit_readback_status: "partial", missing_data_flags: ["stale_source"], completeness_score: 0.72 },
    freshness: { state: "stale", age_minutes_at_recommendation: 120, rationale: "fixed_source_age_exceeds_static_freshness_boundary" },
    conflict_metadata: { state: "none", source_ids: ["static_source:news:013"], details: null },
    excluded_future_context: [],
    expected_context_labels: labels({ catalyst_support_label: "neutral", data_provenance_label: "stale", context_completeness_label: "partial" }),
    anti_leakage_status: "passed",
    learning_context_eligibility: "limited",
    missing_context_reasons: ["stale_company_context"],
  }),
  fixture(IDS_014, {
    fixture_family_tags: ["low_quality_provenance", "unknown_category", "explicit_null", "absent_optional_domain"],
    description: "Null, unknown, absent and low-quality states remain distinct.",
    symbol: "SMCI",
    effective_at: EFFECTIVE_AT,
    context: contextFor(IDS_014, {
      market: { ...contextFor(IDS_014).market, market_regime: UNKNOWN },
      sector_industry: { sector: present("technology"), industry: EXPLICIT_NULL, sector_relative_strength: UNKNOWN },
      news_catalyst: { availability: "absent", catalyst_detected: present(false), catalyst_type: EXPLICIT_NULL, catalyst_timestamp: null, headline_summary: null },
      calendar_event: { availability: "unavailable", event_type: UNAVAILABLE, event_risk_label: UNAVAILABLE },
    }),
    data_provenance: { ...COMPLETE_PROVENANCE, state: "partial", provider: null, source_confidence: 0.2, audit_readback_status: "partial", missing_data_flags: ["provider_unknown", "industry_explicit_null"], completeness_score: 0.25 },
    freshness: { state: "unknown", age_minutes_at_recommendation: null, rationale: "source_age_unknown" },
    conflict_metadata: { state: "none", source_ids: ["static_source:partial:014"], details: null },
    excluded_future_context: [],
    expected_context_labels: labels({ market_regime_label: "unknown", sector_support_label: "unknown", industry_support_label: "unknown", peer_group_support_label: "unknown", relative_strength_label: "unknown", calendar_risk_label: "unavailable", data_provenance_label: "low_quality", context_completeness_label: "low" }),
    anti_leakage_status: "passed",
    learning_context_eligibility: "limited",
    missing_context_reasons: ["market_regime_unknown", "industry_explicit_null", "calendar_domain_unavailable"],
  }),
  fixture(IDS_015, {
    fixture_family_tags: ["weak_market_strong_stock_relative_strength", "isolated_stock_spike_no_sector_support", "weak_sector", "weak_industry", "weak_peer_group", "positive_relative_strength"],
    description: "Strong stock-relative move lacks sector, industry and peer confirmation.",
    symbol: "DKNG",
    effective_at: EFFECTIVE_AT,
    context: contextFor(IDS_015, {
      market: { ...contextFor(IDS_015).market, spy_direction: present("down"), qqq_direction: present("down"), iwm_direction: present("down"), market_regime: present("bearish") },
      sector_industry: { sector: present("consumer_discretionary"), industry: present("gaming"), sector_relative_strength: present("weak") },
      relative_strength: { stock_vs_spy: present(0.74), stock_vs_sector: present(0.81), intraday_label: present("positive") },
    }),
    data_provenance: COMPLETE_PROVENANCE,
    freshness: { state: "fresh", age_minutes_at_recommendation: 1, rationale: "fixed_pre_recommendation_source" },
    conflict_metadata: { state: "none", source_ids: ["static_source:market:015"], details: null },
    excluded_future_context: [],
    expected_context_labels: labels({ market_regime_label: "bearish", sector_support_label: "weak", industry_support_label: "weak", peer_group_support_label: "weak", relative_strength_label: "positive" }),
    anti_leakage_status: "passed",
    learning_context_eligibility: "full",
    missing_context_reasons: [],
  }),
] as const;

const malformedIntelligenceContextStaticFixtureCases: readonly IntelligenceContextMalformedFixtureCase[] = [
  { case_id: "malformed_context:001", reason: "missing_context_identity", expected_validation_status: "invalid", raw_fixture: { fixture_id: "" } },
  { case_id: "malformed_context:002", reason: "duplicate_fixture_identity", expected_validation_status: "invalid", raw_fixture: { fixture_ids: ["context:duplicate", "context:duplicate"] } },
  { case_id: "malformed_context:003", reason: "invalid_recommendation_linkage", expected_validation_status: "invalid", raw_fixture: { recommendation_snapshot_id: "snapshot:a", context_snapshot_recommendation_snapshot_id: "snapshot:b" } },
  { case_id: "malformed_context:004", reason: "capture_after_recommendation_boundary", expected_validation_status: "invalid", raw_fixture: { captured_at: "2026-07-08T13:46:00.000Z", recommendation_created_at: RECOMMENDATION_AT } },
  { case_id: "malformed_context:005", reason: "effective_after_recommendation_without_exclusion", expected_validation_status: "invalid", raw_fixture: { effective_at: "2026-07-08T13:46:00.000Z", excluded_future_context: [] } },
  { case_id: "malformed_context:006", reason: "future_news_leakage", expected_validation_status: "invalid", raw_fixture: { catalyst_timestamp: "2026-07-08T14:00:00.000Z", available_at_snapshot_time: true } },
  { case_id: "malformed_context:007", reason: "future_macro_event_leakage", expected_validation_status: "invalid", raw_fixture: { macro_event_at: "2026-07-08T15:00:00.000Z", included_in_snapshot_context: true } },
  { case_id: "malformed_context:008", reason: "outcome_data_embedded_in_context", expected_validation_status: "invalid", raw_fixture: { context: { target_hit: true, gross_r_multiple: 2 } } },
  { case_id: "malformed_context:009", reason: "malformed_provenance", expected_validation_status: "invalid", raw_fixture: { data_provenance: { state: "complete", provider: null, source_timestamp: null } } },
  { case_id: "malformed_context:010", reason: "unsupported_categorical_value", expected_validation_status: "invalid", raw_fixture: { market_regime: "magical" } },
  { case_id: "malformed_context:011", reason: "invalid_freshness_state", expected_validation_status: "invalid", raw_fixture: { freshness: { state: "instantaneous" } } },
  { case_id: "malformed_context:012", reason: "stale_timestamp_marked_fresh", expected_validation_status: "invalid", raw_fixture: { freshness: { state: "fresh", age_minutes_at_recommendation: 180 } } },
  { case_id: "malformed_context:013", reason: "conflicting_without_metadata", expected_validation_status: "invalid", raw_fixture: { relative_strength_label: "conflicting", conflict_metadata: null } },
  { case_id: "malformed_context:014", reason: "partial_context_marked_complete", expected_validation_status: "invalid", raw_fixture: { market: { completeness: "complete", qqq_direction: UNAVAILABLE } } },
  { case_id: "malformed_context:015", reason: "non_finite_relative_strength_metric", expected_validation_status: "invalid", raw_fixture: { stock_vs_spy: Number.NaN } },
  { case_id: "malformed_context:016", reason: "invalid_confidence_or_source_quality_bounds", expected_validation_status: "invalid", raw_fixture: { source_confidence: 1.2 } },
  { case_id: "malformed_context:017", reason: "random_id_attempt", expected_validation_status: "invalid", raw_fixture: { fixture_id_expression: "generated_random_uuid" } },
  { case_id: "malformed_context:018", reason: "wall_clock_timestamp_attempt", expected_validation_status: "invalid", raw_fixture: { captured_at_expression: "wall_clock_now" } },
] as const;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getIntelligenceContextStaticFixtures(): Action336IntelligenceContextStaticFixture[] {
  return clone(intelligenceContextStaticFixtures) as Action336IntelligenceContextStaticFixture[];
}

export function getIntelligenceContextStaticFixtureById(
  fixtureId: string,
): Action336IntelligenceContextStaticFixture | null {
  const found = intelligenceContextStaticFixtures.find((fixtureItem) => fixtureItem.fixture_id === fixtureId);
  return found ? clone(found) : null;
}

export function getIntelligenceContextStaticFixturesByFamily(
  fixtureFamily: string,
): Action336IntelligenceContextStaticFixture[] {
  return clone(
    intelligenceContextStaticFixtures.filter((fixtureItem) =>
      fixtureItem.fixture_family_tags.includes(fixtureFamily),
    ),
  ) as Action336IntelligenceContextStaticFixture[];
}

export function getMalformedIntelligenceContextStaticFixtureCases(): IntelligenceContextMalformedFixtureCase[] {
  return clone(malformedIntelligenceContextStaticFixtureCases) as IntelligenceContextMalformedFixtureCase[];
}

export function serializeIntelligenceContextStaticFixtures(): string {
  return JSON.stringify(intelligenceContextStaticFixtures);
}

const OUTCOME_KEYS = ["target_hit", "stop_hit", "gross_r_multiple", "outcome_status"] as const;

function allNumbersFinite(value: unknown): boolean {
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(allNumbersFinite);
  if (value && typeof value === "object") return Object.values(value).every(allNumbersFinite);
  return true;
}

function contextValues(value: unknown): LearningDatasetContextValue[] {
  if (!value || typeof value !== "object") return [];
  if ("state" in value && "value" in value) return [value as LearningDatasetContextValue];
  return Object.values(value).flatMap(contextValues);
}

export function validateIntelligenceContextStaticFixtureSet(): IntelligenceContextStaticFixtureValidationResult {
  const errors: string[] = [];
  const ids = new Set<string>();
  let previousId = "";

  for (const fixtureItem of intelligenceContextStaticFixtures) {
    const id = fixtureItem.fixture_id;
    if (!id || !fixtureItem.context.context_snapshot_id || !fixtureItem.recommendation_linkage.recommendation_snapshot_id) errors.push(`${id || "missing"}:missing_identity`);
    if (ids.has(id)) errors.push(`${id}:duplicate_identity`);
    ids.add(id);
    if (previousId && previousId.localeCompare(id) >= 0) errors.push(`${id}:unstable_ordering`);
    previousId = id;

    if (fixtureItem.context.recommendation_snapshot_id !== fixtureItem.recommendation_linkage.recommendation_snapshot_id) errors.push(`${id}:recommendation_snapshot_link_mismatch`);
    if (fixtureItem.context.recommendation_id !== fixtureItem.recommendation_linkage.recommendation_id) errors.push(`${id}:recommendation_link_mismatch`);

    const recommendationAt = Date.parse(fixtureItem.recommendation_linkage.recommendation_created_at);
    const capturedAt = Date.parse(fixtureItem.context.captured_at);
    const effectiveAt = Date.parse(fixtureItem.effective_at);
    if (![recommendationAt, capturedAt, effectiveAt].every(Number.isFinite)) errors.push(`${id}:invalid_timestamp`);
    if (capturedAt > recommendationAt) errors.push(`${id}:capture_after_recommendation`);
    if (effectiveAt > recommendationAt) errors.push(`${id}:effective_after_recommendation`);

    const catalystAt = fixtureItem.context.news_catalyst.catalyst_timestamp
      ? Date.parse(fixtureItem.context.news_catalyst.catalyst_timestamp)
      : null;
    if (catalystAt !== null && (!Number.isFinite(catalystAt) || catalystAt > recommendationAt)) errors.push(`${id}:future_news_leakage`);
    for (const excluded of fixtureItem.excluded_future_context) {
      const excludedAt = Date.parse(excluded.effective_at);
      if (!Number.isFinite(excludedAt) || excludedAt <= recommendationAt || excluded.included_in_snapshot_context !== false) errors.push(`${id}:invalid_future_exclusion`);
    }

    const contextSerialization = JSON.stringify(fixtureItem.context);
    if (OUTCOME_KEYS.some((key) => contextSerialization.includes(key))) errors.push(`${id}:outcome_context_leakage`);
    if (!allNumbersFinite(fixtureItem)) errors.push(`${id}:non_finite_numeric_value`);
    const sourceConfidence = fixtureItem.data_provenance.source_confidence;
    if (sourceConfidence !== null && (sourceConfidence < 0 || sourceConfidence > 1)) errors.push(`${id}:invalid_source_confidence`);
    if (fixtureItem.data_provenance.completeness_score < 0 || fixtureItem.data_provenance.completeness_score > 1) errors.push(`${id}:invalid_provenance_completeness`);
    if (fixtureItem.data_provenance.state === "complete" && (!fixtureItem.data_provenance.provider || !fixtureItem.data_provenance.source_timestamp)) errors.push(`${id}:malformed_complete_provenance`);

    if (fixtureItem.freshness.state === "fresh" && (fixtureItem.freshness.age_minutes_at_recommendation === null || fixtureItem.freshness.age_minutes_at_recommendation >= 60)) errors.push(`${id}:freshness_inconsistent`);
    if (fixtureItem.freshness.state === "stale" && (fixtureItem.freshness.age_minutes_at_recommendation === null || fixtureItem.freshness.age_minutes_at_recommendation < 60)) errors.push(`${id}:stale_freshness_inconsistent`);
    if ((fixtureItem.freshness.state === "unknown" || fixtureItem.freshness.state === "unavailable") && fixtureItem.freshness.age_minutes_at_recommendation !== null) errors.push(`${id}:unknown_or_unavailable_freshness_has_age`);
    if (fixtureItem.conflict_metadata.state === "conflicting" && (fixtureItem.conflict_metadata.source_ids.length < 2 || !fixtureItem.conflict_metadata.details)) errors.push(`${id}:missing_conflict_metadata`);
    if ((fixtureItem.expected_context_labels.relative_strength_label === "conflicting" || fixtureItem.expected_context_labels.catalyst_support_label === "conflicting") && fixtureItem.conflict_metadata.state !== "conflicting") errors.push(`${id}:conflicting_label_without_metadata`);

    const marketValues = contextValues(fixtureItem.context.market);
    if (fixtureItem.context.market.completeness === "complete" && marketValues.some((value) => value.state === "unavailable")) errors.push(`${id}:partial_market_marked_complete`);
    for (const value of contextValues(fixtureItem.context)) {
      if ((value.state === "explicit_null" || value.state === "unavailable") && value.value !== null) errors.push(`${id}:invalid_null_or_unavailable_semantics`);
      if (value.state === "unknown" && value.value !== "unknown") errors.push(`${id}:invalid_unknown_semantics`);
      if (value.state === "present" && value.value === null) errors.push(`${id}:invalid_present_semantics`);
    }
    if (fixtureItem.anti_leakage_status !== "passed") errors.push(`${id}:anti_leakage_not_passed`);
  }

  return { ok: errors.length === 0, errors };
}
