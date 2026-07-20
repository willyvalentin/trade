export const ACTION_343_PATTERN_INSIGHT_CONTRACT_REFERENCE =
  "docs/action-343-pattern-insight-static-type-spec.md" as const;

export const PATTERN_INSIGHT_STATIC_FIXTURE_SCHEMA_VERSION =
  "pattern_insight_static_fixture_schema_v1" as const;

export const PATTERN_INSIGHT_STATIC_GENERATED_AT_LABEL =
  "static_fixture_generation_2026_07_11" as const;

export type Action343PatternDimension =
  | "setup_family"
  | "confidence_bucket"
  | "trading_window"
  | "market_regime"
  | "sector"
  | "industry"
  | "relative_strength_profile"
  | "catalyst_type"
  | "catalyst_freshness"
  | "volume_liquidity_profile"
  | "risk_reward_profile"
  | "entry_quality_profile"
  | "stop_quality_profile"
  | "target_realism_profile"
  | "data_quality_profile";

export type Action343EffectDirection =
  | "positive"
  | "negative"
  | "neutral"
  | "mixed"
  | "unknown";

export type Action343EvidenceStrength =
  | "insufficient_sample"
  | "weak_signal"
  | "moderate_signal"
  | "strong_signal"
  | "validated_signal";

export type Action343OverfittingRisk = "high" | "medium" | "low" | "unknown";

export type Action343RecommendedActionType =
  | "observe"
  | "investigate"
  | "downgrade_candidate_research"
  | "upgrade_candidate_research"
  | "adjust_confidence_research"
  | "block_until_more_data"
  | "candidate_for_shadow_calibration"
  | "candidate_for_future_experiment";

export type Action343ReviewStatus =
  | "unreviewed"
  | "reviewed_no_action"
  | "research_candidate"
  | "shadow_calibration_candidate"
  | "rejected_overfit_risk"
  | "approved_for_future_experiment";

export type Action343OutcomeSummary = Readonly<{
  target_hit_rate: number;
  stop_hit_rate: number;
  no_entry_rate: number;
  open_at_window_end_rate: number;
  ambiguous_intrabar_rate: number;
  average_gross_r_multiple: number;
  median_gross_r_multiple: number;
  expectancy_r: number;
  max_favorable_excursion_avg_r: number;
  max_adverse_excursion_avg_r: number;
  sample_size: number;
  outcome_quality: "complete" | "partial" | "low" | "unknown";
}>;

export type Action343ConfidenceSummary = Readonly<{
  confidence_bucket: string;
  confidence_bucket_hit_rate: number;
  confidence_bucket_expectancy_r: number;
  overconfidence_gap: number;
  underconfidence_gap: number;
  calibration_stability_score: number;
  confidence_sample_size: number;
  confidence_interpretation: string;
}>;

export type Action343SampleWindow = Readonly<{
  label: string;
  start: string;
  end: string;
  source_dataset_reference: string;
}>;

export type Action343PatternInsightStaticFixture = Readonly<{
  insight_id: string;
  insight_version: typeof PATTERN_INSIGHT_STATIC_FIXTURE_SCHEMA_VERSION;
  generated_from_dataset_version: string;
  generated_at_label: typeof PATTERN_INSIGHT_STATIC_GENERATED_AT_LABEL;
  pattern_dimension: Action343PatternDimension;
  segment_key: string;
  segment_description: string;
  sample_size: number;
  minimum_sample_requirement: number;
  sample_window: Action343SampleWindow;
  setup_family: string;
  trading_window: string;
  market_regime: string;
  sector: string;
  industry: string;
  relative_strength_profile: string;
  catalyst_type: string;
  confidence_bucket: string;
  outcome_summary: Action343OutcomeSummary;
  confidence_summary: Action343ConfidenceSummary;
  effect_direction: Action343EffectDirection;
  evidence_strength: Action343EvidenceStrength;
  stability_score: number;
  overfitting_risk: Action343OverfittingRisk;
  data_quality_notes: readonly string[];
  anti_leakage_status: "passed" | "failed" | "not_applicable";
  recommended_action_type: Action343RecommendedActionType;
  mutation_allowed: false;
  blocked_reason: string | null;
  review_status: Action343ReviewStatus;
}>;

export type PatternInsightMalformedFixtureCase = Readonly<{
  case_id: string;
  reason:
    | "missing_identity"
    | "duplicate_identity"
    | "invalid_pattern_key"
    | "invalid_segment_key"
    | "malformed_source_reference"
    | "non_finite_numeric_metric"
    | "negative_sample_size"
    | "support_count_greater_than_sample_size"
    | "invalid_timestamp_ordering"
    | "invalid_dataset_window"
    | "contradictory_effect_fields"
    | "unsupported_readiness_state"
    | "unsupported_evidence_quality_state"
    | "missing_required_provenance"
    | "unstable_ordering_attempt"
    | "wall_clock_timestamp_attempt"
    | "random_id_attempt";
  expected_validation_status: "invalid";
  raw_fixture: Record<string, unknown>;
}>;

export type PatternInsightStaticFixtureValidationResult = Readonly<{
  ok: boolean;
  errors: readonly string[];
}>;

const DATASET_VERSION = "learning_dataset_fixture:v1" as const;
const WINDOW_START = "2026-04-01T13:45:00.000Z" as const;
const WINDOW_END = "2026-06-30T20:00:00.000Z" as const;

function windowFor(slug: string): Action343SampleWindow {
  return {
    label: `static_fixture_window:${slug}`,
    start: WINDOW_START,
    end: WINDOW_END,
    source_dataset_reference: `${DATASET_VERSION}:${slug}`,
  };
}

function outcomeLiteral(input: Action343OutcomeSummary): Action343OutcomeSummary {
  return input;
}

function confidenceLiteral(input: Action343ConfidenceSummary): Action343ConfidenceSummary {
  return input;
}

function fixture(
  input: Omit<
    Action343PatternInsightStaticFixture,
    "insight_version" | "generated_from_dataset_version" | "generated_at_label"
  >,
): Action343PatternInsightStaticFixture {
  return {
    insight_version: PATTERN_INSIGHT_STATIC_FIXTURE_SCHEMA_VERSION,
    generated_from_dataset_version: DATASET_VERSION,
    generated_at_label: PATTERN_INSIGHT_STATIC_GENERATED_AT_LABEL,
    ...input,
    mutation_allowed: false,
  };
}

export const patternInsightStaticFixtures = [
  fixture({
    insight_id: "pi_insight:v1:001:market_regime:bullish_alignment",
    pattern_dimension: "market_regime",
    segment_key: "market_regime|bullish|setup:opening_momentum",
    segment_description: "Opening momentum is stronger in bullish market regime examples.",
    sample_size: 128,
    minimum_sample_requirement: 100,
    sample_window: windowFor("positive_bullish_market_regime_alignment"),
    setup_family: "opening_momentum",
    trading_window: "morning",
    market_regime: "bullish",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "neutral",
    catalyst_type: "none",
    confidence_bucket: "medium",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.44,
      stop_hit_rate: 0.21,
      no_entry_rate: 0.27,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.39,
      median_gross_r_multiple: 0.31,
      expectancy_r: 0.31,
      max_favorable_excursion_avg_r: 0.86,
      max_adverse_excursion_avg_r: -0.11,
      sample_size: 128,
      outcome_quality: "complete",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium",
      confidence_bucket_hit_rate: 0.44,
      confidence_bucket_expectancy_r: 0.31,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.82,
      confidence_sample_size: 128,
      confidence_interpretation: "bullish regime support",
    }),
    effect_direction: "positive",
    evidence_strength: "strong_signal",
    stability_score: 0.83,
    overfitting_risk: "low",
    data_quality_notes: ["coverage:positive:bullish_market_regime_alignment", "readiness:calibration_candidate"],
    anti_leakage_status: "passed",
    recommended_action_type: "candidate_for_future_experiment",
    mutation_allowed: false,
    blocked_reason: null,
    review_status: "approved_for_future_experiment",
  }),
  fixture({
    insight_id: "pi_insight:v1:002:sector:sector_alignment",
    pattern_dimension: "sector",
    segment_key: "sector|aligned|setup:trend_pullback",
    segment_description: "Trend pullback examples improve when sector context is aligned.",
    sample_size: 94,
    minimum_sample_requirement: 50,
    sample_window: windowFor("positive_sector_alignment"),
    setup_family: "trend_pullback",
    trading_window: "midday",
    market_regime: "neutral",
    sector: "technology",
    industry: "software",
    relative_strength_profile: "neutral",
    catalyst_type: "none",
    confidence_bucket: "medium",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.39,
      stop_hit_rate: 0.22,
      no_entry_rate: 0.31,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.32,
      median_gross_r_multiple: 0.24,
      expectancy_r: 0.24,
      max_favorable_excursion_avg_r: 0.79,
      max_adverse_excursion_avg_r: -0.18,
      sample_size: 94,
      outcome_quality: "complete",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium",
      confidence_bucket_hit_rate: 0.39,
      confidence_bucket_expectancy_r: 0.24,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.64,
      confidence_sample_size: 94,
      confidence_interpretation: "sector alignment support",
    }),
    effect_direction: "positive",
    evidence_strength: "moderate_signal",
    stability_score: 0.71,
    overfitting_risk: "medium",
    data_quality_notes: ["coverage:positive:sector_alignment", "readiness:shadow_eligible"],
    anti_leakage_status: "passed",
    recommended_action_type: "candidate_for_shadow_calibration",
    mutation_allowed: false,
    blocked_reason: null,
    review_status: "shadow_calibration_candidate",
  }),
  fixture({
    insight_id: "pi_insight:v1:003:relative_strength:positive_relative_strength",
    pattern_dimension: "relative_strength_profile",
    segment_key: "relative_strength|positive|setup:breakout_continuation",
    segment_description: "Breakout continuation examples improve with positive relative strength.",
    sample_size: 88,
    minimum_sample_requirement: 50,
    sample_window: windowFor("positive_relative_strength"),
    setup_family: "breakout_continuation",
    trading_window: "morning",
    market_regime: "mixed",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "positive",
    catalyst_type: "none",
    confidence_bucket: "medium_high",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.41,
      stop_hit_rate: 0.23,
      no_entry_rate: 0.28,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.35,
      median_gross_r_multiple: 0.27,
      expectancy_r: 0.27,
      max_favorable_excursion_avg_r: 0.82,
      max_adverse_excursion_avg_r: -0.15,
      sample_size: 88,
      outcome_quality: "complete",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium_high",
      confidence_bucket_hit_rate: 0.41,
      confidence_bucket_expectancy_r: 0.27,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.64,
      confidence_sample_size: 88,
      confidence_interpretation: "relative strength support",
    }),
    effect_direction: "positive",
    evidence_strength: "moderate_signal",
    stability_score: 0.7,
    overfitting_risk: "medium",
    data_quality_notes: ["coverage:positive:positive_relative_strength", "readiness:review_required"],
    anti_leakage_status: "passed",
    recommended_action_type: "investigate",
    mutation_allowed: false,
    blocked_reason: null,
    review_status: "research_candidate",
  }),
  fixture({
    insight_id: "pi_insight:v1:004:catalyst_type:news_catalyst_present",
    pattern_dimension: "catalyst_type",
    segment_key: "catalyst|news_present|setup:gap_follow_through",
    segment_description: "Gap follow-through examples improve when a static news catalyst is present.",
    sample_size: 61,
    minimum_sample_requirement: 50,
    sample_window: windowFor("positive_news_catalyst_present"),
    setup_family: "gap_follow_through",
    trading_window: "morning",
    market_regime: "bullish",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "positive",
    catalyst_type: "news_present",
    confidence_bucket: "medium",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.38,
      stop_hit_rate: 0.25,
      no_entry_rate: 0.29,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.26,
      median_gross_r_multiple: 0.18,
      expectancy_r: 0.18,
      max_favorable_excursion_avg_r: 0.73,
      max_adverse_excursion_avg_r: -0.24,
      sample_size: 61,
      outcome_quality: "partial",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium",
      confidence_bucket_hit_rate: 0.38,
      confidence_bucket_expectancy_r: 0.18,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.64,
      confidence_sample_size: 61,
      confidence_interpretation: "news catalyst support",
    }),
    effect_direction: "positive",
    evidence_strength: "moderate_signal",
    stability_score: 0.62,
    overfitting_risk: "medium",
    data_quality_notes: ["coverage:positive:news_catalyst_present", "readiness:collecting"],
    anti_leakage_status: "passed",
    recommended_action_type: "observe",
    mutation_allowed: false,
    blocked_reason: null,
    review_status: "unreviewed",
  }),
  fixture({
    insight_id: "pi_insight:v1:005:market_regime:trend_day_alignment",
    pattern_dimension: "market_regime",
    segment_key: "market_regime|trend_day|setup:power_hour_momentum",
    segment_description: "Power hour momentum examples improve during trend-day alignment.",
    sample_size: 110,
    minimum_sample_requirement: 100,
    sample_window: windowFor("positive_trend_day_alignment"),
    setup_family: "power_hour_momentum",
    trading_window: "power_hour",
    market_regime: "trend_day",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "positive",
    catalyst_type: "none",
    confidence_bucket: "high",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.42,
      stop_hit_rate: 0.2,
      no_entry_rate: 0.3,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.37,
      median_gross_r_multiple: 0.29,
      expectancy_r: 0.29,
      max_favorable_excursion_avg_r: 0.84,
      max_adverse_excursion_avg_r: -0.13,
      sample_size: 110,
      outcome_quality: "complete",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "high",
      confidence_bucket_hit_rate: 0.42,
      confidence_bucket_expectancy_r: 0.29,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.82,
      confidence_sample_size: 110,
      confidence_interpretation: "trend-day support",
    }),
    effect_direction: "positive",
    evidence_strength: "strong_signal",
    stability_score: 0.8,
    overfitting_risk: "low",
    data_quality_notes: ["coverage:positive:trend_day_alignment", "readiness:calibration_candidate"],
    anti_leakage_status: "passed",
    recommended_action_type: "candidate_for_future_experiment",
    mutation_allowed: false,
    blocked_reason: null,
    review_status: "approved_for_future_experiment",
  }),
  fixture({
    insight_id: "pi_insight:v1:006:market_regime:chop_day_weakness",
    pattern_dimension: "market_regime",
    segment_key: "market_regime|chop_day|setup:breakout_continuation",
    segment_description: "Breakout continuation examples weaken during chop days.",
    sample_size: 82,
    minimum_sample_requirement: 50,
    sample_window: windowFor("negative_chop_day_weakness"),
    setup_family: "breakout_continuation",
    trading_window: "midday",
    market_regime: "chop_day",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "neutral",
    catalyst_type: "none",
    confidence_bucket: "medium",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.19,
      stop_hit_rate: 0.42,
      no_entry_rate: 0.31,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: -0.2,
      median_gross_r_multiple: -0.28,
      expectancy_r: -0.28,
      max_favorable_excursion_avg_r: 0.27,
      max_adverse_excursion_avg_r: -0.7,
      sample_size: 82,
      outcome_quality: "complete",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium",
      confidence_bucket_hit_rate: 0.19,
      confidence_bucket_expectancy_r: -0.28,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.64,
      confidence_sample_size: 82,
      confidence_interpretation: "chop-day weakness",
    }),
    effect_direction: "negative",
    evidence_strength: "moderate_signal",
    stability_score: 0.67,
    overfitting_risk: "medium",
    data_quality_notes: ["coverage:negative:chop_day_weakness", "readiness:review_required"],
    anti_leakage_status: "passed",
    recommended_action_type: "downgrade_candidate_research",
    mutation_allowed: false,
    blocked_reason: null,
    review_status: "research_candidate",
  }),
  fixture({
    insight_id: "pi_insight:v1:007:market_regime:index_divergence",
    pattern_dimension: "market_regime",
    segment_key: "market_regime|index_divergence|setup:opening_momentum",
    segment_description: "Opening momentum examples weaken when index direction diverges.",
    sample_size: 73,
    minimum_sample_requirement: 50,
    sample_window: windowFor("negative_index_divergence"),
    setup_family: "opening_momentum",
    trading_window: "morning",
    market_regime: "index_divergence",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "negative",
    catalyst_type: "none",
    confidence_bucket: "medium",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.21,
      stop_hit_rate: 0.39,
      no_entry_rate: 0.32,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: -0.13,
      median_gross_r_multiple: -0.21,
      expectancy_r: -0.21,
      max_favorable_excursion_avg_r: 0.34,
      max_adverse_excursion_avg_r: -0.63,
      sample_size: 73,
      outcome_quality: "complete",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium",
      confidence_bucket_hit_rate: 0.21,
      confidence_bucket_expectancy_r: -0.21,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.64,
      confidence_sample_size: 73,
      confidence_interpretation: "index divergence weakness",
    }),
    effect_direction: "negative",
    evidence_strength: "moderate_signal",
    stability_score: 0.61,
    overfitting_risk: "medium",
    data_quality_notes: ["coverage:negative:index_divergence", "readiness:review_required"],
    anti_leakage_status: "passed",
    recommended_action_type: "downgrade_candidate_research",
    mutation_allowed: false,
    blocked_reason: null,
    review_status: "research_candidate",
  }),
  fixture({
    insight_id: "pi_insight:v1:008:sector:weak_sector_context",
    pattern_dimension: "sector",
    segment_key: "sector|weak|setup:trend_pullback",
    segment_description: "Trend pullback examples weaken in weak sector context.",
    sample_size: 66,
    minimum_sample_requirement: 50,
    sample_window: windowFor("negative_weak_sector_context"),
    setup_family: "trend_pullback",
    trading_window: "midday",
    market_regime: "neutral",
    sector: "weak_sector",
    industry: "unknown",
    relative_strength_profile: "negative",
    catalyst_type: "none",
    confidence_bucket: "medium",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.22,
      stop_hit_rate: 0.4,
      no_entry_rate: 0.3,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: -0.16,
      median_gross_r_multiple: -0.24,
      expectancy_r: -0.24,
      max_favorable_excursion_avg_r: 0.31,
      max_adverse_excursion_avg_r: -0.66,
      sample_size: 66,
      outcome_quality: "partial",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium",
      confidence_bucket_hit_rate: 0.22,
      confidence_bucket_expectancy_r: -0.24,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.64,
      confidence_sample_size: 66,
      confidence_interpretation: "weak sector context",
    }),
    effect_direction: "negative",
    evidence_strength: "moderate_signal",
    stability_score: 0.58,
    overfitting_risk: "medium",
    data_quality_notes: ["coverage:negative:weak_sector_context", "readiness:collecting"],
    anti_leakage_status: "passed",
    recommended_action_type: "investigate",
    mutation_allowed: false,
    blocked_reason: null,
    review_status: "research_candidate",
  }),
  fixture({
    insight_id: "pi_insight:v1:009:catalyst_type:macro_event_proximity",
    pattern_dimension: "catalyst_type",
    segment_key: "catalyst|macro_event_near|setup:morning_reversal",
    segment_description: "Morning reversal examples weaken near high-impact macro events.",
    sample_size: 55,
    minimum_sample_requirement: 50,
    sample_window: windowFor("negative_macro_event_proximity"),
    setup_family: "morning_reversal",
    trading_window: "morning",
    market_regime: "event_risk",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "mixed",
    catalyst_type: "high_impact_macro_event",
    confidence_bucket: "medium",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.2,
      stop_hit_rate: 0.43,
      no_entry_rate: 0.29,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: -0.23,
      median_gross_r_multiple: -0.31,
      expectancy_r: -0.31,
      max_favorable_excursion_avg_r: 0.24,
      max_adverse_excursion_avg_r: -0.73,
      sample_size: 55,
      outcome_quality: "partial",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium",
      confidence_bucket_hit_rate: 0.2,
      confidence_bucket_expectancy_r: -0.31,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.64,
      confidence_sample_size: 55,
      confidence_interpretation: "macro-event weakness",
    }),
    effect_direction: "negative",
    evidence_strength: "moderate_signal",
    stability_score: 0.54,
    overfitting_risk: "high",
    data_quality_notes: ["coverage:negative:high_impact_macro_event_proximity", "readiness:not_ready"],
    anti_leakage_status: "passed",
    recommended_action_type: "block_until_more_data",
    mutation_allowed: false,
    blocked_reason: "event-window sample needs more review",
    review_status: "reviewed_no_action",
  }),
  fixture({
    insight_id: "pi_insight:v1:010:data_quality_profile:low_freshness_context",
    pattern_dimension: "data_quality_profile",
    segment_key: "data_quality|low_freshness|setup:any",
    segment_description: "Examples weaken when context freshness is low.",
    sample_size: 58,
    minimum_sample_requirement: 50,
    sample_window: windowFor("negative_low_freshness_context"),
    setup_family: "mixed_setups",
    trading_window: "mixed",
    market_regime: "unknown",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "unknown",
    catalyst_type: "unknown",
    confidence_bucket: "unknown",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.18,
      stop_hit_rate: 0.41,
      no_entry_rate: 0.33,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: -0.19,
      median_gross_r_multiple: -0.27,
      expectancy_r: -0.27,
      max_favorable_excursion_avg_r: 0.28,
      max_adverse_excursion_avg_r: -0.69,
      sample_size: 58,
      outcome_quality: "low",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "unknown",
      confidence_bucket_hit_rate: 0.18,
      confidence_bucket_expectancy_r: -0.27,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.64,
      confidence_sample_size: 58,
      confidence_interpretation: "low freshness weakness",
    }),
    effect_direction: "negative",
    evidence_strength: "weak_signal",
    stability_score: 0.42,
    overfitting_risk: "high",
    data_quality_notes: ["coverage:negative:low_freshness_context", "coverage:quality:low_completeness", "readiness:not_ready"],
    anti_leakage_status: "passed",
    recommended_action_type: "block_until_more_data",
    mutation_allowed: false,
    blocked_reason: "low freshness context",
    review_status: "reviewed_no_action",
  }),
  fixture({
    insight_id: "pi_insight:v1:011:setup_family:no_meaningful_difference",
    pattern_dimension: "setup_family",
    segment_key: "setup|range_break|effect:neutral",
    segment_description: "Range break examples show no meaningful static difference.",
    sample_size: 74,
    minimum_sample_requirement: 50,
    sample_window: windowFor("neutral_no_meaningful_difference"),
    setup_family: "range_break",
    trading_window: "mixed",
    market_regime: "mixed",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "neutral",
    catalyst_type: "none",
    confidence_bucket: "medium",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.29,
      stop_hit_rate: 0.29,
      no_entry_rate: 0.34,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.09,
      median_gross_r_multiple: 0.01,
      expectancy_r: 0.01,
      max_favorable_excursion_avg_r: 0.56,
      max_adverse_excursion_avg_r: -0.41,
      sample_size: 74,
      outcome_quality: "complete",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium",
      confidence_bucket_hit_rate: 0.29,
      confidence_bucket_expectancy_r: 0.01,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.64,
      confidence_sample_size: 74,
      confidence_interpretation: "neutral effect",
    }),
    effect_direction: "neutral",
    evidence_strength: "weak_signal",
    stability_score: 0.49,
    overfitting_risk: "medium",
    data_quality_notes: ["coverage:neutral:no_meaningful_difference", "readiness:collecting"],
    anti_leakage_status: "passed",
    recommended_action_type: "observe",
    mutation_allowed: false,
    blocked_reason: null,
    review_status: "reviewed_no_action",
  }),
  fixture({
    insight_id: "pi_insight:v1:012:setup_family:small_sample_promising",
    pattern_dimension: "setup_family",
    segment_key: "setup|opening_momentum|sample:small_promising",
    segment_description: "Opening momentum examples are promising but below sample threshold.",
    sample_size: 19,
    minimum_sample_requirement: 20,
    sample_window: windowFor("weak_small_sample_promising"),
    setup_family: "opening_momentum",
    trading_window: "morning",
    market_regime: "bullish",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "positive",
    catalyst_type: "none",
    confidence_bucket: "medium",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.42,
      stop_hit_rate: 0.24,
      no_entry_rate: 0.26,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.28,
      median_gross_r_multiple: 0.2,
      expectancy_r: 0.2,
      max_favorable_excursion_avg_r: 0.75,
      max_adverse_excursion_avg_r: -0.22,
      sample_size: 19,
      outcome_quality: "partial",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium",
      confidence_bucket_hit_rate: 0.42,
      confidence_bucket_expectancy_r: 0.2,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.38,
      confidence_sample_size: 19,
      confidence_interpretation: "small promising sample",
    }),
    effect_direction: "positive",
    evidence_strength: "insufficient_sample",
    stability_score: 0.28,
    overfitting_risk: "high",
    data_quality_notes: ["coverage:weak:promising_direction_with_small_sample", "coverage:quality:insufficient_sample", "readiness:not_ready"],
    anti_leakage_status: "passed",
    recommended_action_type: "block_until_more_data",
    mutation_allowed: false,
    blocked_reason: "sample size below minimum",
    review_status: "unreviewed",
  }),
  fixture({
    insight_id: "pi_insight:v1:013:setup_family:sufficient_sample_weak_effect",
    pattern_dimension: "setup_family",
    segment_key: "setup|gap_follow_through|effect:weak",
    segment_description: "Gap follow-through examples have sufficient sample with weak effect.",
    sample_size: 51,
    minimum_sample_requirement: 50,
    sample_window: windowFor("weak_sufficient_sample_weak_effect"),
    setup_family: "gap_follow_through",
    trading_window: "morning",
    market_regime: "mixed",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "neutral",
    catalyst_type: "none",
    confidence_bucket: "medium",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.31,
      stop_hit_rate: 0.28,
      no_entry_rate: 0.33,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.12,
      median_gross_r_multiple: 0.04,
      expectancy_r: 0.04,
      max_favorable_excursion_avg_r: 0.59,
      max_adverse_excursion_avg_r: -0.38,
      sample_size: 51,
      outcome_quality: "complete",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium",
      confidence_bucket_hit_rate: 0.31,
      confidence_bucket_expectancy_r: 0.04,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.64,
      confidence_sample_size: 51,
      confidence_interpretation: "sufficient but weak effect",
    }),
    effect_direction: "neutral",
    evidence_strength: "weak_signal",
    stability_score: 0.46,
    overfitting_risk: "medium",
    data_quality_notes: ["coverage:weak:sufficient_sample_with_weak_effect", "readiness:collecting"],
    anti_leakage_status: "passed",
    recommended_action_type: "observe",
    mutation_allowed: false,
    blocked_reason: null,
    review_status: "reviewed_no_action",
  }),
  fixture({
    insight_id: "pi_insight:v1:014:setup_family:conflicting_metrics",
    pattern_dimension: "setup_family",
    segment_key: "setup|trend_pullback|effect:conflicting_metrics",
    segment_description: "Trend pullback examples have conflicting target and adverse excursion metrics.",
    sample_size: 63,
    minimum_sample_requirement: 50,
    sample_window: windowFor("weak_conflicting_metrics"),
    setup_family: "trend_pullback",
    trading_window: "midday",
    market_regime: "mixed",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "mixed",
    catalyst_type: "none",
    confidence_bucket: "medium",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.36,
      stop_hit_rate: 0.35,
      no_entry_rate: 0.21,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.06,
      median_gross_r_multiple: -0.02,
      expectancy_r: -0.02,
      max_favorable_excursion_avg_r: 0.53,
      max_adverse_excursion_avg_r: -0.44,
      sample_size: 63,
      outcome_quality: "partial",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium",
      confidence_bucket_hit_rate: 0.36,
      confidence_bucket_expectancy_r: -0.02,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.64,
      confidence_sample_size: 63,
      confidence_interpretation: "conflicting metrics",
    }),
    effect_direction: "mixed",
    evidence_strength: "weak_signal",
    stability_score: 0.35,
    overfitting_risk: "high",
    data_quality_notes: ["coverage:weak:conflicting_metrics", "coverage:quality:contradictory_evidence", "readiness:review_required"],
    anti_leakage_status: "passed",
    recommended_action_type: "investigate",
    mutation_allowed: false,
    blocked_reason: "conflicting metrics",
    review_status: "research_candidate",
  }),
  fixture({
    insight_id: "pi_insight:v1:015:trading_window:inconsistent_outcomes",
    pattern_dimension: "trading_window",
    segment_key: "window|power_hour|effect:inconsistent",
    segment_description: "Power hour examples are inconsistent across static windows.",
    sample_size: 92,
    minimum_sample_requirement: 50,
    sample_window: windowFor("weak_inconsistent_outcomes_across_windows"),
    setup_family: "mixed_setups",
    trading_window: "power_hour",
    market_regime: "mixed",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "mixed",
    catalyst_type: "none",
    confidence_bucket: "medium",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.33,
      stop_hit_rate: 0.34,
      no_entry_rate: 0.25,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.07,
      median_gross_r_multiple: -0.01,
      expectancy_r: -0.01,
      max_favorable_excursion_avg_r: 0.54,
      max_adverse_excursion_avg_r: -0.43,
      sample_size: 92,
      outcome_quality: "partial",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium",
      confidence_bucket_hit_rate: 0.33,
      confidence_bucket_expectancy_r: -0.01,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.64,
      confidence_sample_size: 92,
      confidence_interpretation: "inconsistent across windows",
    }),
    effect_direction: "mixed",
    evidence_strength: "weak_signal",
    stability_score: 0.31,
    overfitting_risk: "high",
    data_quality_notes: ["coverage:weak:inconsistent_outcomes_across_windows", "readiness:review_required"],
    anti_leakage_status: "passed",
    recommended_action_type: "investigate",
    mutation_allowed: false,
    blocked_reason: "inconsistent windows",
    review_status: "research_candidate",
  }),
  fixture({
    insight_id: "pi_insight:v1:016:data_quality_profile:partial_provenance",
    pattern_dimension: "data_quality_profile",
    segment_key: "data_quality|partial_provenance|setup:mixed",
    segment_description: "Partial provenance examples remain contract-valid but blocked from mutation.",
    sample_size: 44,
    minimum_sample_requirement: 50,
    sample_window: windowFor("quality_partial_provenance"),
    setup_family: "mixed_setups",
    trading_window: "mixed",
    market_regime: "unknown",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "unknown",
    catalyst_type: "unknown",
    confidence_bucket: "unknown",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.3,
      stop_hit_rate: 0.32,
      no_entry_rate: 0.3,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.04,
      median_gross_r_multiple: -0.04,
      expectancy_r: -0.04,
      max_favorable_excursion_avg_r: 0.51,
      max_adverse_excursion_avg_r: -0.46,
      sample_size: 44,
      outcome_quality: "partial",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "unknown",
      confidence_bucket_hit_rate: 0.3,
      confidence_bucket_expectancy_r: -0.04,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.38,
      confidence_sample_size: 44,
      confidence_interpretation: "partial provenance",
    }),
    effect_direction: "unknown",
    evidence_strength: "weak_signal",
    stability_score: 0.29,
    overfitting_risk: "unknown",
    data_quality_notes: ["coverage:quality:partial_provenance", "readiness:collecting"],
    anti_leakage_status: "passed",
    recommended_action_type: "observe",
    mutation_allowed: false,
    blocked_reason: "partial provenance",
    review_status: "unreviewed",
  }),
  fixture({
    insight_id: "pi_insight:v1:017:data_quality_profile:stale_source_dataset",
    pattern_dimension: "data_quality_profile",
    segment_key: "data_quality|stale_source_dataset|setup:mixed",
    segment_description: "Stale source dataset examples are preserved but blocked from calibration.",
    sample_size: 104,
    minimum_sample_requirement: 100,
    sample_window: windowFor("quality_stale_source_dataset"),
    setup_family: "mixed_setups",
    trading_window: "mixed",
    market_regime: "unknown",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "unknown",
    catalyst_type: "unknown",
    confidence_bucket: "unknown",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.34,
      stop_hit_rate: 0.31,
      no_entry_rate: 0.27,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.11,
      median_gross_r_multiple: 0.03,
      expectancy_r: 0.03,
      max_favorable_excursion_avg_r: 0.58,
      max_adverse_excursion_avg_r: -0.39,
      sample_size: 104,
      outcome_quality: "low",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "unknown",
      confidence_bucket_hit_rate: 0.34,
      confidence_bucket_expectancy_r: 0.03,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.82,
      confidence_sample_size: 104,
      confidence_interpretation: "stale source dataset",
    }),
    effect_direction: "unknown",
    evidence_strength: "moderate_signal",
    stability_score: 0.4,
    overfitting_risk: "high",
    data_quality_notes: ["coverage:quality:stale_source_dataset", "readiness:not_ready"],
    anti_leakage_status: "passed",
    recommended_action_type: "block_until_more_data",
    mutation_allowed: false,
    blocked_reason: "stale source dataset",
    review_status: "reviewed_no_action",
  }),
  fixture({
    insight_id: "pi_insight:v1:018:data_quality_profile:unknown_segment_value",
    pattern_dimension: "data_quality_profile",
    segment_key: "data_quality|unknown_segment_value|setup:mixed",
    segment_description: "Unknown segment value examples keep unknown distinct from missing.",
    sample_size: 37,
    minimum_sample_requirement: 50,
    sample_window: windowFor("quality_unknown_segment_value"),
    setup_family: "mixed_setups",
    trading_window: "mixed",
    market_regime: "unknown",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "unknown",
    catalyst_type: "unknown",
    confidence_bucket: "unknown",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.27,
      stop_hit_rate: 0.3,
      no_entry_rate: 0.35,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.03,
      median_gross_r_multiple: -0.05,
      expectancy_r: -0.05,
      max_favorable_excursion_avg_r: 0.5,
      max_adverse_excursion_avg_r: -0.47,
      sample_size: 37,
      outcome_quality: "unknown",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "unknown",
      confidence_bucket_hit_rate: 0.27,
      confidence_bucket_expectancy_r: -0.05,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.38,
      confidence_sample_size: 37,
      confidence_interpretation: "unknown segment value",
    }),
    effect_direction: "unknown",
    evidence_strength: "insufficient_sample",
    stability_score: 0.22,
    overfitting_risk: "unknown",
    data_quality_notes: ["coverage:quality:unknown_segment_value", "readiness:not_ready"],
    anti_leakage_status: "passed",
    recommended_action_type: "block_until_more_data",
    mutation_allowed: false,
    blocked_reason: "unknown segment value",
    review_status: "unreviewed",
  }),
  fixture({
    insight_id: "pi_insight:v1:019:data_quality_profile:missing_optional_context",
    pattern_dimension: "data_quality_profile",
    segment_key: "data_quality|missing_optional_context|setup:mixed",
    segment_description: "Missing optional context examples remain separate from invalid fixtures.",
    sample_size: 52,
    minimum_sample_requirement: 50,
    sample_window: windowFor("quality_missing_optional_context"),
    setup_family: "mixed_setups",
    trading_window: "mixed",
    market_regime: "mixed",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "neutral",
    catalyst_type: "unknown",
    confidence_bucket: "medium",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.28,
      stop_hit_rate: 0.29,
      no_entry_rate: 0.35,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.07,
      median_gross_r_multiple: -0.01,
      expectancy_r: -0.01,
      max_favorable_excursion_avg_r: 0.54,
      max_adverse_excursion_avg_r: -0.43,
      sample_size: 52,
      outcome_quality: "partial",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium",
      confidence_bucket_hit_rate: 0.28,
      confidence_bucket_expectancy_r: -0.01,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.64,
      confidence_sample_size: 52,
      confidence_interpretation: "missing optional context",
    }),
    effect_direction: "neutral",
    evidence_strength: "weak_signal",
    stability_score: 0.44,
    overfitting_risk: "medium",
    data_quality_notes: ["coverage:quality:missing_optional_context", "readiness:collecting"],
    anti_leakage_status: "passed",
    recommended_action_type: "observe",
    mutation_allowed: false,
    blocked_reason: null,
    review_status: "reviewed_no_action",
  }),
  fixture({
    insight_id: "pi_insight:v1:020:setup_family:superseded_insight",
    pattern_dimension: "setup_family",
    segment_key: "setup|opening_momentum|state:superseded",
    segment_description: "Superseded examples remain stable for historical consumer handling.",
    sample_size: 100,
    minimum_sample_requirement: 100,
    sample_window: windowFor("quality_superseded_insight"),
    setup_family: "opening_momentum",
    trading_window: "morning",
    market_regime: "bullish",
    sector: "unknown",
    industry: "unknown",
    relative_strength_profile: "positive",
    catalyst_type: "none",
    confidence_bucket: "medium",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.35,
      stop_hit_rate: 0.27,
      no_entry_rate: 0.3,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.2,
      median_gross_r_multiple: 0.12,
      expectancy_r: 0.12,
      max_favorable_excursion_avg_r: 0.67,
      max_adverse_excursion_avg_r: -0.3,
      sample_size: 100,
      outcome_quality: "complete",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium",
      confidence_bucket_hit_rate: 0.35,
      confidence_bucket_expectancy_r: 0.12,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.82,
      confidence_sample_size: 100,
      confidence_interpretation: "superseded insight",
    }),
    effect_direction: "positive",
    evidence_strength: "moderate_signal",
    stability_score: 0.55,
    overfitting_risk: "medium",
    data_quality_notes: ["coverage:quality:superseded_insight", "superseded_by:pi_insight:v1:001:market_regime:bullish_alignment", "readiness:not_ready"],
    anti_leakage_status: "passed",
    recommended_action_type: "observe",
    mutation_allowed: false,
    blocked_reason: "superseded by newer static fixture",
    review_status: "reviewed_no_action",
  }),
  fixture({
    insight_id: "pi_insight:v1:021:setup_family:readiness_shadow_eligible",
    pattern_dimension: "setup_family",
    segment_key: "setup|trend_pullback|readiness:shadow_eligible",
    segment_description: "Shadow eligible static example for future adapter tests.",
    sample_size: 101,
    minimum_sample_requirement: 100,
    sample_window: windowFor("readiness_shadow_eligible"),
    setup_family: "trend_pullback",
    trading_window: "midday",
    market_regime: "neutral",
    sector: "technology",
    industry: "software",
    relative_strength_profile: "positive",
    catalyst_type: "none",
    confidence_bucket: "medium_high",
    outcome_summary: outcomeLiteral({
      target_hit_rate: 0.4,
      stop_hit_rate: 0.24,
      no_entry_rate: 0.28,
      open_at_window_end_rate: 0.05,
      ambiguous_intrabar_rate: 0.03,
      average_gross_r_multiple: 0.3,
      median_gross_r_multiple: 0.22,
      expectancy_r: 0.22,
      max_favorable_excursion_avg_r: 0.77,
      max_adverse_excursion_avg_r: -0.2,
      sample_size: 101,
      outcome_quality: "complete",
    }),
    confidence_summary: confidenceLiteral({
      confidence_bucket: "medium_high",
      confidence_bucket_hit_rate: 0.4,
      confidence_bucket_expectancy_r: 0.22,
      overconfidence_gap: 0,
      underconfidence_gap: 0,
      calibration_stability_score: 0.82,
      confidence_sample_size: 101,
      confidence_interpretation: "shadow eligible fixture",
    }),
    effect_direction: "positive",
    evidence_strength: "strong_signal",
    stability_score: 0.76,
    overfitting_risk: "low",
    data_quality_notes: ["coverage:readiness:shadow_eligible"],
    anti_leakage_status: "passed",
    recommended_action_type: "candidate_for_shadow_calibration",
    mutation_allowed: false,
    blocked_reason: null,
    review_status: "shadow_calibration_candidate",
  }),
] as const satisfies readonly Action343PatternInsightStaticFixture[];

export const malformedPatternInsightStaticFixtureCases = [
  {
    case_id: "malformed:001:missing_identity",
    reason: "missing_identity",
    expected_validation_status: "invalid",
    raw_fixture: { pattern_dimension: "setup_family" },
  },
  {
    case_id: "malformed:002:duplicate_identity",
    reason: "duplicate_identity",
    expected_validation_status: "invalid",
    raw_fixture: {
      insight_id: "pi_insight:v1:001:market_regime:bullish_alignment",
    },
  },
  {
    case_id: "malformed:003:invalid_pattern_key",
    reason: "invalid_pattern_key",
    expected_validation_status: "invalid",
    raw_fixture: { insight_id: "bad_pattern_key", pattern_dimension: "not_supported" },
  },
  {
    case_id: "malformed:004:invalid_segment_key",
    reason: "invalid_segment_key",
    expected_validation_status: "invalid",
    raw_fixture: { insight_id: "pi_insight:v1:bad", segment_key: "Upper Case Segment" },
  },
  {
    case_id: "malformed:005:malformed_source_reference",
    reason: "malformed_source_reference",
    expected_validation_status: "invalid",
    raw_fixture: { sample_window: { source_dataset_reference: "production_run:unknown" } },
  },
  {
    case_id: "malformed:006:non_finite_numeric_metric",
    reason: "non_finite_numeric_metric",
    expected_validation_status: "invalid",
    raw_fixture: { outcome_summary: { expectancy_r: "NaN" } },
  },
  {
    case_id: "malformed:007:negative_sample_size",
    reason: "negative_sample_size",
    expected_validation_status: "invalid",
    raw_fixture: { sample_size: -1 },
  },
  {
    case_id: "malformed:008:support_count_greater_than_sample_size",
    reason: "support_count_greater_than_sample_size",
    expected_validation_status: "invalid",
    raw_fixture: { sample_size: 10, support_count: 11 },
  },
  {
    case_id: "malformed:009:invalid_timestamp_ordering",
    reason: "invalid_timestamp_ordering",
    expected_validation_status: "invalid",
    raw_fixture: { first_observed_at: WINDOW_END, last_observed_at: WINDOW_START },
  },
  {
    case_id: "malformed:010:invalid_dataset_window",
    reason: "invalid_dataset_window",
    expected_validation_status: "invalid",
    raw_fixture: { sample_window: { start: WINDOW_END, end: WINDOW_START } },
  },
  {
    case_id: "malformed:011:contradictory_effect_fields",
    reason: "contradictory_effect_fields",
    expected_validation_status: "invalid",
    raw_fixture: { effect_direction: "positive", effect_magnitude: "negative" },
  },
  {
    case_id: "malformed:012:unsupported_readiness_state",
    reason: "unsupported_readiness_state",
    expected_validation_status: "invalid",
    raw_fixture: { readiness_state: "mutate_live_confidence" },
  },
  {
    case_id: "malformed:013:unsupported_evidence_quality_state",
    reason: "unsupported_evidence_quality_state",
    expected_validation_status: "invalid",
    raw_fixture: { evidence_quality: "statistically_proven" },
  },
  {
    case_id: "malformed:014:missing_required_provenance",
    reason: "missing_required_provenance",
    expected_validation_status: "invalid",
    raw_fixture: { sample_window: { label: "missing_source_reference" } },
  },
  {
    case_id: "malformed:015:unstable_ordering_attempt",
    reason: "unstable_ordering_attempt",
    expected_validation_status: "invalid",
    raw_fixture: { order_by: "calculated_performance" },
  },
  {
    case_id: "malformed:016:wall_clock_timestamp_attempt",
    reason: "wall_clock_timestamp_attempt",
    expected_validation_status: "invalid",
    raw_fixture: { generated_at_label: "wall_clock_timestamp_attempt" },
  },
  {
    case_id: "malformed:017:random_id_attempt",
    reason: "random_id_attempt",
    expected_validation_status: "invalid",
    raw_fixture: { insight_id: "random_id_attempt" },
  },
] as const satisfies readonly PatternInsightMalformedFixtureCase[];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getPatternInsightStaticFixtures(): Action343PatternInsightStaticFixture[] {
  return patternInsightStaticFixtures.map((fixtureItem) => clone(fixtureItem));
}

export function getPatternInsightStaticFixtureById(
  insightId: string,
): Action343PatternInsightStaticFixture | null {
  for (const fixtureItem of patternInsightStaticFixtures) {
    if (fixtureItem.insight_id === insightId) {
      return clone(fixtureItem);
    }
  }

  return null;
}

export function getMalformedPatternInsightStaticFixtureCases(): PatternInsightMalformedFixtureCase[] {
  return malformedPatternInsightStaticFixtureCases.map((fixtureCase) =>
    clone(fixtureCase),
  );
}

function isFiniteNumber(value: number) {
  return Number.isFinite(value);
}

export function validatePatternInsightStaticFixtureSet(): PatternInsightStaticFixtureValidationResult {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  let previousId = "";

  for (const fixtureItem of patternInsightStaticFixtures) {
    if (fixtureItem.insight_id.length === 0) {
      errors.push("missing_insight_id");
    }
    if (seenIds.has(fixtureItem.insight_id)) {
      errors.push(`duplicate_insight_id:${fixtureItem.insight_id}`);
    }
    if (previousId.length > 0 && fixtureItem.insight_id <= previousId) {
      errors.push(`unstable_order:${fixtureItem.insight_id}`);
    }
    if (fixtureItem.sample_size < 0) {
      errors.push(`negative_sample_size:${fixtureItem.insight_id}`);
    }
    if (fixtureItem.outcome_summary.sample_size !== fixtureItem.sample_size) {
      errors.push(`sample_size_mismatch:${fixtureItem.insight_id}`);
    }
    if (fixtureItem.sample_window.start > fixtureItem.sample_window.end) {
      errors.push(`invalid_sample_window:${fixtureItem.insight_id}`);
    }
    if (!fixtureItem.sample_window.source_dataset_reference.startsWith(DATASET_VERSION)) {
      errors.push(`invalid_source_dataset_reference:${fixtureItem.insight_id}`);
    }
    if (fixtureItem.mutation_allowed !== false) {
      errors.push(`mutation_allowed:${fixtureItem.insight_id}`);
    }

    const numericValues = [
      fixtureItem.outcome_summary.target_hit_rate,
      fixtureItem.outcome_summary.stop_hit_rate,
      fixtureItem.outcome_summary.no_entry_rate,
      fixtureItem.outcome_summary.open_at_window_end_rate,
      fixtureItem.outcome_summary.ambiguous_intrabar_rate,
      fixtureItem.outcome_summary.average_gross_r_multiple,
      fixtureItem.outcome_summary.median_gross_r_multiple,
      fixtureItem.outcome_summary.expectancy_r,
      fixtureItem.outcome_summary.max_favorable_excursion_avg_r,
      fixtureItem.outcome_summary.max_adverse_excursion_avg_r,
      fixtureItem.confidence_summary.confidence_bucket_hit_rate,
      fixtureItem.confidence_summary.confidence_bucket_expectancy_r,
      fixtureItem.confidence_summary.overconfidence_gap,
      fixtureItem.confidence_summary.underconfidence_gap,
      fixtureItem.confidence_summary.calibration_stability_score,
      fixtureItem.confidence_summary.confidence_sample_size,
      fixtureItem.stability_score,
    ];

    for (const numericValue of numericValues) {
      if (!isFiniteNumber(numericValue)) {
        errors.push(`non_finite_metric:${fixtureItem.insight_id}`);
      }
    }

    seenIds.add(fixtureItem.insight_id);
    previousId = fixtureItem.insight_id;
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
