import type { RecommendationBatch } from "@/lib/recommendation-batch-memory";
import type {
  RecommendationOutcome,
  RecommendationOutcomeStatus,
} from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import {
  buildSetupLabel,
  buildSetupLabelingSummary,
  type SetupLabelingSummary,
  type TureSetupFamily,
  type TureSetupLabel,
} from "@/lib/setup-labeling";
import {
  buildSectorIndustryLabel,
  type TureIndustry,
  type TureSector,
  type TureTickerSectorProfile,
} from "@/lib/sector-industry-mapping";
import {
  buildTickerProfiles,
  buildTickerProfileSummary,
  type TureTickerProfile,
  type TureTickerProfileSummary,
} from "@/lib/ticker-profile";
import {
  buildMarketRegimeLabel,
  type TureMarketRegimeLabel,
  type TureMarketRegimeSummary,
} from "@/lib/market-regime-labeling";
import {
  buildConfidenceCalibrationSummary,
  type TureConfidenceCalibrationSummary,
} from "@/lib/confidence-calibration";
import {
  buildModelGovernanceSummary,
  type TureModelGovernanceSummary,
} from "@/lib/model-change-governance";
import {
  buildIntelligenceOverview,
  type TureIntelligenceOverview,
} from "@/lib/intelligence-overview";
import {
  buildTradeQualityDecomposition,
  buildTradeQualityDecompositionSummary,
  type TureTradeQualityDecomposition,
  type TureTradeQualityDecompositionSummary,
} from "@/lib/trade-quality-decomposition";

export type DailyLearningReviewVisibility =
  | "visible"
  | "research_only"
  | "unknown_visibility";

export type DailyLearningReviewVisibilityDetectionSource =
  | "recommendation_metadata"
  | "snapshot_payload"
  | "outcome_payload"
  | "learning_acceleration_flag"
  | "inferred_research_only"
  | "unknown";

export type DailyLearningReviewVisibilityUnknownExample = {
  ticker: string;
  snapshot_fingerprint: string | null;
  batch_fingerprint: string | null;
  available_metadata_keys: string[];
  reason: string;
};

export type DailyLearningReviewVisibilityDiagnostics = {
  source_counts: Record<DailyLearningReviewVisibilityDetectionSource, number>;
  unknown_examples: DailyLearningReviewVisibilityUnknownExample[];
};

export type DailyLearningReviewSnapshotJoinSource =
  | "snapshot_fingerprint_exact"
  | "snapshot_id_exact"
  | "recommendation_id"
  | "normalized_snapshot_fingerprint"
  | "batch_ticker"
  | "scan_run_ticker"
  | "outcome_payload_only"
  | "missing";

export type DailyLearningReviewSnapshotJoinMissingExample = {
  ticker: string;
  outcome_id: string | null;
  snapshot_fingerprint: string | null;
  snapshot_id: string | null;
  recommendation_id_present: boolean;
  batch_fingerprint: string | null;
  scan_run_fingerprint: string | null;
  outcome_payload_keys: string[];
  reason: string;
};

export type DailyLearningReviewSnapshotJoinDiagnostics = {
  outcomes_with_snapshot_join: number;
  outcomes_without_snapshot_join: number;
  join_source_counts: Record<DailyLearningReviewSnapshotJoinSource, number>;
  missing_join_examples: DailyLearningReviewSnapshotJoinMissingExample[];
};

export type DailyLearningReviewMetadataReadbackExample = {
  outcome_id: string | null;
  ticker: string;
  batch_fingerprint: string | null;
  snapshot_fingerprint: string | null;
  recommendation_id_present: boolean;
  matched_snapshot: boolean;
  matched_recommendation_row: boolean;
  visibility_decision: DailyLearningReviewVisibility;
  visibility_decision_source: DailyLearningReviewVisibilityDetectionSource;
  confidence_decision: number | null;
  confidence_decision_source: string;
  top_level_metadata_keys: string[];
  nested_payload_keys: string[];
  snapshot_metadata_keys: string[];
  outcome_payload_keys: string[];
};

export type DailyLearningReviewMetadataReadbackDiagnostics = {
  outcomes_inspected: number;
  matched_snapshots: number;
  matched_recommendation_rows: number;
  visibility_source_mix: Record<DailyLearningReviewVisibilityDetectionSource, number>;
  confidence_source_mix: Record<string, number>;
  snapshot_join_source_mix: Record<DailyLearningReviewSnapshotJoinSource, number>;
  inspection_examples: DailyLearningReviewMetadataReadbackExample[];
};

export type DailyLearningReviewConfidence = "low" | "medium" | "high";

export type DailyLearningReviewAdjustmentCandidate =
  | "target_too_far"
  | "stop_too_tight"
  | "weak_follow_through"
  | "research_outperforming_visible"
  | "visible_outperforming_research"
  | "entry_not_triggering"
  | "poor_power_hour_follow_through"
  | "insufficient_sample_size";

export type DailyLearningReviewMetricSummary = {
  outcome_count: number;
  entry_triggered_count: number;
  entry_triggered_rate: number | null;
  target_hit_count: number;
  target_hit_rate: number | null;
  stop_hit_count: number;
  stop_hit_rate: number | null;
  neither_hit_count: number;
  neither_hit_rate: number | null;
  entry_not_triggered_count: number;
  entry_not_triggered_rate: number | null;
  average_best_r: number | null;
  average_worst_r: number | null;
  average_terminal_r: number | null;
};

export type DailyLearningReviewTickerSummary = {
  ticker: string;
  outcome_count: number;
  average_best_r: number | null;
  average_worst_r: number | null;
};

export type DailyLearningReviewGroupSummary = DailyLearningReviewMetricSummary & {
  group_type:
    | "setup_family"
    | "setup_type"
    | "entry_type"
    | "entry_trigger_semantics"
    | "window"
    | "tier";
  key: string;
};

export type DailyLearningReviewSetupFamilySummary =
  DailyLearningReviewMetricSummary & {
    setup_family: TureSetupFamily;
    unique_snapshot_count: number;
    visible_count: number;
    research_only_count: number;
    unknown_visibility_count: number;
    sample_confidence: DailyLearningReviewConfidence;
    advisory_only: true;
  };

export type DailyLearningReviewDimensionSummary =
  DailyLearningReviewMetricSummary & {
    key: string;
    unique_snapshot_count: number;
    visible_count: number;
    research_only_count: number;
    unknown_visibility_count: number;
    sample_confidence: DailyLearningReviewConfidence;
    top_setup_families: Array<{ setup_family: TureSetupFamily; count: number }>;
  };

export type DailyLearningReviewTierSummary = Omit<
  DailyLearningReviewDimensionSummary,
  "top_setup_families"
>;

export type DailyLearningReviewSectorGroupSummary =
  DailyLearningReviewMetricSummary & {
    sector_group: TureSector;
    sector: TureSector;
    unique_snapshot_count: number;
    visible_count: number;
    research_only_count: number;
    unknown_visibility_count: number;
    setup_family_mix: Partial<Record<TureSetupFamily, number>>;
    ticker_mix: Record<string, number>;
    sample_confidence: DailyLearningReviewConfidence;
    advisory_only: true;
  };

export type DailyLearningReviewIndustrySummary =
  DailyLearningReviewMetricSummary & {
    industry: TureIndustry;
    unique_snapshot_count: number;
    visible_count: number;
    research_only_count: number;
    unknown_visibility_count: number;
    setup_family_mix: Partial<Record<TureSetupFamily, number>>;
    ticker_mix: Record<string, number>;
    sector_group_mix: Partial<Record<TureSector, number>>;
    sample_confidence: DailyLearningReviewConfidence;
    advisory_only: true;
  };

export type DailyLearningReviewSectorTickerSummary = {
  sector_group: TureSector;
  outcome_count: number;
  average_best_r: number | null;
  average_worst_r: number | null;
  sample_confidence: DailyLearningReviewConfidence;
};

export type SectorIndustryMappingSummary = {
  advisory_mode: true;
  current_batch_mapped_count: number;
  current_batch_total_count: number;
  unknown_ticker_mapping_count: number;
  sector_mix: Partial<Record<TureSector, number>>;
  industry_mix: Partial<Record<TureIndustry, number>>;
  visible_sector_mix: Partial<Record<TureSector, number>>;
  research_only_sector_mix: Partial<Record<TureSector, number>>;
  low_confidence_mapping_count: number;
  top_sector_mapping_gaps: Record<string, number>;
};

export type DailyLearningReviewMarketRegimeSummary = {
  advisory_mode: true;
  latest_regime_label: TureMarketRegimeSummary;
  latest_evaluated_batch_regime_label: TureMarketRegimeLabel;
  latest_evaluated_batch_regime_confidence: TureMarketRegimeSummary["regime_confidence"];
  outcomes_by_regime: Partial<Record<TureMarketRegimeLabel, number>>;
  setup_family_mix_by_regime: Partial<
    Record<TureMarketRegimeLabel, Partial<Record<TureSetupFamily, number>>>
  >;
  sector_mix_by_regime: Partial<Record<TureMarketRegimeLabel, Partial<Record<TureSector, number>>>>;
  ticker_profile_status_mix_by_regime: Partial<Record<TureMarketRegimeLabel, Record<string, number>>>;
  engine_adjustment_candidates_by_regime: Partial<
    Record<TureMarketRegimeLabel, DailyLearningReviewAdjustmentCandidate[]>
  >;
  sample_confidence: TureMarketRegimeSummary["sample_confidence"];
};

export type DailyLearningReviewTradeQualityRow = {
  ticker: string;
  snapshot_identity: string;
  batch_fingerprint: string | null;
  setup_family: TureSetupFamily;
  sector_group: TureSector;
  market_regime_label: TureMarketRegimeLabel;
  decomposition: TureTradeQualityDecomposition;
  current_batch: boolean;
  advisory_only: true;
};

export type DailyLearningReviewEngineAdjustment = {
  candidate: DailyLearningReviewAdjustmentCandidate;
  confidence: DailyLearningReviewConfidence;
  reason: string;
};

export type DailyLearningReviewSummary = {
  summary_version: "1.0";
  summary_kind: "daily_learning_review";
  generated_at: string;
  trading_day: string | null;
  latest_evaluated_batch_fingerprint: string | null;
  latest_evaluated_batch_outcome_count: number;
  scan_windows: string[];
  evaluated_outcome_count: number;
  visible_evaluated_count: number;
  research_only_evaluated_count: number;
  unknown_visibility_evaluated_count: number;
  latest_batch_visible_evaluated_count: number;
  latest_batch_research_only_evaluated_count: number;
  latest_batch_unknown_visibility_evaluated_count: number;
  visible_unique_snapshot_count: number;
  research_only_unique_snapshot_count: number;
  unknown_visibility_unique_snapshot_count: number;
  metrics: DailyLearningReviewMetricSummary;
  visible_metrics: DailyLearningReviewMetricSummary;
  research_only_metrics: DailyLearningReviewMetricSummary;
  visible_vs_research_only_comparison: {
    visible_outcome_count: number;
    research_only_outcome_count: number;
    visible_average_best_r: number | null;
    research_only_average_best_r: number | null;
    visible_average_worst_r: number | null;
    research_only_average_worst_r: number | null;
    average_best_r_delta_research_minus_visible: number | null;
    average_worst_r_delta_research_minus_visible: number | null;
    summary: string;
  };
  top_positive_tickers_by_avg_best_r: DailyLearningReviewTickerSummary[];
  weakest_tickers_by_avg_worst_r: DailyLearningReviewTickerSummary[];
  setup_family_breakdowns: DailyLearningReviewSetupFamilySummary[];
  ticker_breakdowns: DailyLearningReviewDimensionSummary[];
  window_breakdowns: DailyLearningReviewDimensionSummary[];
  tier_breakdowns: DailyLearningReviewTierSummary[];
  sector_group_breakdowns: DailyLearningReviewSectorGroupSummary[];
  industry_breakdowns: DailyLearningReviewIndustrySummary[];
  top_sectors_by_avg_best_r: DailyLearningReviewSectorTickerSummary[];
  weakest_sectors_by_avg_worst_r: DailyLearningReviewSectorTickerSummary[];
  group_breakdowns: DailyLearningReviewGroupSummary[];
  setup_labeling: SetupLabelingSummary;
  sector_industry_mapping: SectorIndustryMappingSummary;
  ticker_profiles: TureTickerProfile[];
  ticker_profile_summary: TureTickerProfileSummary;
  market_regime: DailyLearningReviewMarketRegimeSummary;
  trade_quality_decompositions: DailyLearningReviewTradeQualityRow[];
  trade_quality_summary: TureTradeQualityDecompositionSummary;
  confidence_calibration: TureConfidenceCalibrationSummary;
  model_governance: TureModelGovernanceSummary;
  intelligence_overview: TureIntelligenceOverview;
  visibility_diagnostics: DailyLearningReviewVisibilityDiagnostics;
  snapshot_join_diagnostics: DailyLearningReviewSnapshotJoinDiagnostics;
  metadata_readback_diagnostics: DailyLearningReviewMetadataReadbackDiagnostics;
  engine_adjustment_candidates: DailyLearningReviewEngineAdjustment[];
  sample_size_label: DailyLearningReviewConfidence;
  duplicate_outcome_rows_ignored_count: number;
};

export type DailyLearningReviewInput = {
  trading_day?: string | null;
  latest_batch_fingerprint?: string | null;
  batches?: RecommendationBatch[];
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  now?: Date | string | null;
};

type ReviewOutcome = {
  outcome: RecommendationOutcome;
  snapshot: RecommendationSnapshot | null;
  snapshot_join_source: DailyLearningReviewSnapshotJoinSource;
  matched_recommendation_row: boolean;
  batch_fingerprint: string | null;
  visibility: DailyLearningReviewVisibility;
  visibility_source: DailyLearningReviewVisibilityDetectionSource;
  snapshot_identity: string;
  ticker: string;
  window: string;
  tier: string;
  setup_type: string;
  entry_type: string;
  entry_trigger_semantics: string;
  setup_label: TureSetupLabel;
  sector_profile: TureTickerSectorProfile;
};

const evaluatedStatuses = new Set<RecommendationOutcomeStatus>([
  "entry_not_triggered",
  "entry_triggered",
  "target_hit",
  "stop_hit",
  "target_before_stop",
  "stop_before_target",
  "neither_hit",
  "expired",
]);

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function finiteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toDate(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }
  return null;
}

function getNewYorkDate(value: Date | string | null | undefined) {
  const date = toDate(value);
  if (!date) return null;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 ? ticker : "UNKNOWN";
}

function normalizeJoinKey(value: unknown) {
  const text = textOrNull(typeof value === "string" ? value : null);
  if (!text) return null;

  const normalized = text.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return normalized.length > 0 ? normalized : null;
}

function rate(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : null;
}

function average(values: Array<number | null | undefined>) {
  const finiteValues = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );

  return finiteValues.length === 0
    ? null
    : finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length;
}

function numberDelta(first: number | null, second: number | null) {
  return first !== null && second !== null ? first - second : null;
}

function payloadBatchFingerprint(
  payload: Record<string, unknown> | null | undefined,
) {
  for (const item of nestedPayloads(payload ?? null)) {
    const batch =
      textOrNull(item.batch_fingerprint) ??
      textOrNull(item.recommendation_batch_fingerprint) ??
      textOrNull(item.batchFingerprint) ??
      textOrNull(item.research_batch_fingerprint) ??
      null;
    if (batch) return batch;
  }

  return null;
}

function payloadScanRunFingerprint(
  payload: Record<string, unknown> | null | undefined,
) {
  for (const item of nestedPayloads(payload ?? null)) {
    const scanRun =
      textOrNull(item.scan_run_fingerprint) ??
      textOrNull(item.scan_run_id) ??
      textOrNull(item.run_fingerprint) ??
      textOrNull(item.runFingerprint) ??
      null;
    if (scanRun) return scanRun;
  }

  return null;
}

function snapshotBatchFingerprint(snapshot: RecommendationSnapshot | null) {
  if (!snapshot) return null;

  return payloadBatchFingerprint(snapshot.payload_json);
}

function snapshotScanRunFingerprint(snapshot: RecommendationSnapshot | null) {
  if (!snapshot) return null;

  return (
    textOrNull(snapshot.scan_run_id) ??
    payloadScanRunFingerprint(snapshot.payload_json) ??
    null
  );
}

function outcomeBatchFingerprint(
  outcome: RecommendationOutcome,
  snapshot: RecommendationSnapshot | null,
) {
  return (
    snapshotBatchFingerprint(snapshot) ??
    payloadBatchFingerprint(objectValue(outcome.payload_json)) ??
    null
  );
}

function outcomeScanRunFingerprint(
  outcome: RecommendationOutcome,
  snapshot: RecommendationSnapshot | null,
) {
  return (
    snapshotScanRunFingerprint(snapshot) ??
    payloadScanRunFingerprint(objectValue(outcome.payload_json)) ??
    null
  );
}

function indexKey(first: string | null, second: string | null) {
  const firstKey = normalizeJoinKey(first);
  const secondKey = normalizeJoinKey(second);
  return firstKey && secondKey ? `${firstKey}:${secondKey}` : null;
}

function payloadFlag(payload: Record<string, unknown> | null, key: string) {
  return payload?.[key] === true;
}

function metadataKeys(payloads: Array<Record<string, unknown> | null>) {
  const keys = new Set<string>();

  for (const payload of payloads) {
    for (const item of nestedPayloads(payload)) {
      for (const key of Object.keys(item)) {
        keys.add(key);
      }
    }
  }

  return Array.from(keys).sort().slice(0, 30);
}

function nestedPayloads(
  payload: Record<string, unknown> | null,
  depth = 0,
): Record<string, unknown>[] {
  if (!payload || depth > 3) return [];

  return [
    payload,
    ...Object.values(payload).flatMap((value) => {
      if (Array.isArray(value)) {
        return value.flatMap((item) =>
          objectValue(item) ? nestedPayloads(objectValue(item), depth + 1) : [],
        );
      }
      const nested = objectValue(value);
      return nested ? nestedPayloads(nested, depth + 1) : [];
    }),
  ];
}

function visibilityFromOutcomePayload(
  payload: Record<string, unknown> | null,
): { visibility: DailyLearningReviewVisibility; source: DailyLearningReviewVisibilityDetectionSource } | null {
  const payloads = nestedPayloads(payload);

  for (const item of payloads) {
    const visibilityStatus = textOrNull(item.visibility_status)?.toLowerCase();
    const visibility = textOrNull(item.visibility)?.toLowerCase();
    const sourceMode = textOrNull(item.source_mode)?.toLowerCase();
    const dataMode = textOrNull(item.data_mode)?.toLowerCase();
    const learningScope = textOrNull(item.learning_scope)?.toLowerCase();
    const learningMode = textOrNull(item.learning_acceleration_mode)?.toLowerCase();
    const hasLearningResearchMetadata =
      learningScope === "research_only" ||
      learningMode === "research_only" ||
      payloadFlag(item, "learning_acceleration_sample") ||
      payloadFlag(item, "research_only") ||
      payloadFlag(item, "is_research_only");

    if (
      visibilityStatus === "research_only" ||
      visibility === "research_only" ||
      sourceMode === "research_only" ||
      dataMode === "research_only" ||
      learningScope === "research_only" ||
      learningMode === "research_only" ||
      payloadFlag(item, "learning_acceleration_sample") ||
      payloadFlag(item, "research_only") ||
      payloadFlag(item, "is_research_only") ||
      ((payloadFlag(item, "not_live_signal") ||
        payloadFlag(item, "not_live_trade_signal")) &&
        hasLearningResearchMetadata)
    ) {
      return {
        visibility: "research_only",
        source: payloadFlag(item, "learning_acceleration_sample")
          ? "learning_acceleration_flag"
          : "outcome_payload",
      };
    }
  }

  for (const item of payloads) {
    const visibilityStatus = textOrNull(item.visibility_status)?.toLowerCase();
    const visibility = textOrNull(item.visibility)?.toLowerCase();

    if (
      visibilityStatus === "visible" ||
      visibility === "visible" ||
      item.is_visible === true ||
      item.visible_in_primary_recommendations === true
    ) {
      return { visibility: "visible", source: "outcome_payload" };
    }
  }

  return null;
}

function researchOnlyPayloadSource(payload: Record<string, unknown> | null) {
  for (const item of nestedPayloads(payload)) {
    const visibilityStatus = textOrNull(item.visibility_status)?.toLowerCase();
    const visibility = textOrNull(item.visibility)?.toLowerCase();
    const sourceMode = textOrNull(item.source_mode)?.toLowerCase();
    const dataMode = textOrNull(item.data_mode)?.toLowerCase();
    const learningScope = textOrNull(item.learning_scope)?.toLowerCase();
    const learningMode = textOrNull(item.learning_acceleration_mode)?.toLowerCase();
    const hasLearningResearchMetadata =
      learningScope === "research_only" ||
      learningMode === "research_only" ||
      payloadFlag(item, "learning_acceleration_sample") ||
      payloadFlag(item, "research_only") ||
      payloadFlag(item, "is_research_only");

    if (
      visibilityStatus === "research_only" ||
      visibility === "research_only" ||
      sourceMode === "research_only" ||
      dataMode === "research_only" ||
      learningScope === "research_only" ||
      learningMode === "research_only" ||
      payloadFlag(item, "learning_acceleration_sample") ||
      payloadFlag(item, "research_only") ||
      payloadFlag(item, "is_research_only") ||
      ((payloadFlag(item, "not_live_signal") ||
        payloadFlag(item, "not_live_trade_signal")) &&
        hasLearningResearchMetadata)
    ) {
      return payloadFlag(item, "learning_acceleration_sample")
        ? "learning_acceleration_flag"
        : "snapshot_payload";
    }
  }

  return null;
}

function isHiddenOrArchivedSnapshot(snapshot: RecommendationSnapshot) {
  const payload = snapshot.payload_json;
  const visibilityStatus = textOrNull(payload.visibility_status);

  return (
    snapshot.is_visible === false ||
    snapshot.status === "hidden" ||
    snapshot.status === "expired" ||
    snapshot.status === "invalid" ||
    visibilityStatus === "hidden" ||
    visibilityStatus === "archived" ||
    visibilityStatus === "retained" ||
    payload.archived === true ||
    payload.retained_readback === true
  );
}

function visiblePayloadSource(payload: Record<string, unknown> | null) {
  for (const item of nestedPayloads(payload)) {
    const visibilityStatus = textOrNull(item.visibility_status)?.toLowerCase();
    const visibility = textOrNull(item.visibility)?.toLowerCase();
    const sourceMode = textOrNull(item.source_mode)?.toLowerCase();
    const dataMode = textOrNull(item.data_mode)?.toLowerCase();

    if (
      visibilityStatus === "visible" ||
      visibilityStatus === "published" ||
      visibilityStatus === "live" ||
      visibilityStatus === "card" ||
      visibility === "visible" ||
      visibility === "published" ||
      visibility === "live" ||
      visibility === "card" ||
      sourceMode === "official" ||
      dataMode === "supabase" ||
      item.is_visible === true ||
      item.visible_in_primary_recommendations === true
    ) {
      return true;
    }
  }

  return false;
}

function visibilityFor(
  outcome: RecommendationOutcome,
  snapshot: RecommendationSnapshot | null,
): {
  visibility: DailyLearningReviewVisibility;
  source: DailyLearningReviewVisibilityDetectionSource;
} {
  const outcomePayload = objectValue(outcome.payload_json);

  if (snapshot) {
    if (snapshot.source_mode === "research_only" || snapshot.data_mode === "research_only") {
      return { visibility: "research_only", source: "recommendation_metadata" };
    }

    const snapshotSource = researchOnlyPayloadSource(snapshot.payload_json);
    if (snapshotSource) {
      return { visibility: "research_only", source: snapshotSource };
    }

    if (
      visiblePayloadSource(snapshot.payload_json) ||
      (!isHiddenOrArchivedSnapshot(snapshot) && textOrNull(snapshot.recommendation_id))
    ) {
      return { visibility: "visible", source: "recommendation_metadata" };
    }
  }

  const outcomeVisibility = visibilityFromOutcomePayload(outcomePayload);
  if (outcomeVisibility) return outcomeVisibility;

  if (snapshot && !isHiddenOrArchivedSnapshot(snapshot)) {
    return { visibility: "visible", source: "recommendation_metadata" };
  }

  if (
    !snapshot &&
    (outcome.recommendation_id === null || outcome.recommendation_id === undefined) &&
    visibilityFromOutcomePayload(outcomePayload)?.visibility === "research_only"
  ) {
    return { visibility: "research_only", source: "inferred_research_only" };
  }

  if (!snapshot && textOrNull(outcome.recommendation_id) !== null) {
    return { visibility: "visible", source: "recommendation_metadata" };
  }

  return { visibility: "unknown_visibility", source: "unknown" };
}

function tierFromPayload(payload: Record<string, unknown> | null) {
  const target = objectValue(payload?.day_trade_window_recommendation_target);
  const recommendation = objectValue(payload?.recommendation);
  const contract = objectValue(payload?.openai_reality_contract);
  const metadata = objectValue(payload?.metadata);
  const tier = textOrNull(
    target?.tier ??
      target?.recommendation_tier ??
      recommendation?.tier ??
      recommendation?.recommendation_tier ??
      contract?.tier ??
      contract?.recommendation_tier ??
      metadata?.tier ??
      metadata?.recommendation_tier ??
      payload?.tier,
  )?.toLowerCase();

  if (tier === "strong" || tier === "valid" || tier === "experimental") {
    return tier;
  }

  return "unknown";
}

function tierFromSnapshotAndPayload(
  snapshot: RecommendationSnapshot | null,
  ...payloads: Array<Record<string, unknown> | null>
) {
  for (const payload of payloads) {
    const payloadTier = tierFromPayload(payload);
    if (payloadTier !== "unknown") return payloadTier;
  }

  const rowTier = textOrNull(snapshot?.rating ?? snapshot?.label)?.toLowerCase();
  if (rowTier === "strong" || rowTier === "valid" || rowTier === "experimental") {
    return rowTier;
  }

  return "unknown";
}

function setupTypeFromPayload(payload: Record<string, unknown> | null) {
  const recommendation = objectValue(payload?.recommendation);
  const metadata = objectValue(payload?.metadata);

  return (
    textOrNull(payload?.setup_type) ??
    textOrNull(recommendation?.setup_type) ??
    textOrNull(metadata?.setup_type) ??
    "unknown"
  );
}

function entryTypeFromPayload(payload: Record<string, unknown> | null) {
  const entryType = objectValue(payload?.entry_type_metadata);
  const recommendation = objectValue(payload?.recommendation);
  const metadata = objectValue(payload?.metadata);

  return (
    textOrNull(entryType?.entry_type) ??
    textOrNull(payload?.entry_type) ??
    textOrNull(recommendation?.entry_type) ??
    textOrNull(metadata?.entry_type) ??
    "unknown"
  );
}

function triggerSemanticsFromPayload(payload: Record<string, unknown> | null) {
  const entryType = objectValue(payload?.entry_type_metadata);
  const trigger = objectValue(payload?.entry_type_aware_trigger);

  return (
    textOrNull(trigger?.trigger_semantics) ??
    textOrNull(entryType?.trigger_semantics) ??
    textOrNull(payload?.entry_trigger_semantics) ??
    "unknown"
  );
}

function windowFrom(
  outcome: RecommendationOutcome,
  snapshot: RecommendationSnapshot | null,
) {
  const outcomePayload = objectValue(outcome.payload_json);
  const snapshotPayload = snapshot?.payload_json ?? null;

  return (
    textOrNull(snapshot?.window) ??
    textOrNull(snapshotPayload?.source_window) ??
    textOrNull(snapshotPayload?.scan_window) ??
    textOrNull(outcomePayload?.source_window) ??
    textOrNull(outcomePayload?.scan_window) ??
    "unknown_window"
  );
}

function normalizeWindow(value: string) {
  const text = value.trim().toLowerCase();
  if (text === "morning" || text === "midday" || text === "power_hour") {
    return text;
  }
  if (text === "power hour") return "power_hour";
  return "unknown_window";
}

function snapshotIdentity(item: ReviewOutcome) {
  return item.snapshot_identity;
}

function uniqueSnapshotCount(items: ReviewOutcome[]) {
  return new Set(items.map(snapshotIdentity)).size;
}

function visibilitySplit(items: ReviewOutcome[]) {
  return {
    visible_count: items.filter((item) => item.visibility === "visible").length,
    research_only_count: items.filter(
      (item) => item.visibility === "research_only",
    ).length,
    unknown_visibility_count: items.filter(
      (item) => item.visibility === "unknown_visibility",
    ).length,
  };
}

function topSetupFamilies(items: ReviewOutcome[]) {
  const counts = new Map<TureSetupFamily, number>();

  for (const item of items) {
    counts.set(
      item.setup_label.setup_family,
      (counts.get(item.setup_label.setup_family) ?? 0) + 1,
    );
  }

  return Array.from(counts.entries())
    .map(([setup_family, count]) => ({ setup_family, count }))
    .sort((first, second) => second.count - first.count)
    .slice(0, 3);
}

function incrementRecord<T extends string>(
  record: Partial<Record<T, number>>,
  key: T,
  amount = 1,
) {
  record[key] = (record[key] ?? 0) + amount;
}

function setupFamilyMix(items: ReviewOutcome[]) {
  const mix: Partial<Record<TureSetupFamily, number>> = {};

  for (const item of items) {
    incrementRecord(mix, item.setup_label.setup_family);
  }

  return mix;
}

function tickerMix(items: ReviewOutcome[]) {
  const mix: Record<string, number> = {};

  for (const item of items) {
    mix[item.ticker] = (mix[item.ticker] ?? 0) + 1;
  }

  return mix;
}

function sectorMix(items: ReviewOutcome[]) {
  const mix: Partial<Record<TureSector, number>> = {};

  for (const item of items) {
    incrementRecord(mix, item.sector_profile.sector_group);
  }

  return mix;
}

function industryMix(items: ReviewOutcome[]) {
  const mix: Partial<Record<TureIndustry, number>> = {};

  for (const item of items) {
    incrementRecord(mix, item.sector_profile.industry);
  }

  return mix;
}

function mappingGapCounts(items: ReviewOutcome[]) {
  const counts: Record<string, number> = {};

  for (const item of items) {
    for (const reason of item.sector_profile.reason_codes) {
      if (reason === "unknown_ticker_sector_mapping") {
        counts[reason] = (counts[reason] ?? 0) + 1;
      }
    }
  }

  return counts;
}

function terminalR(outcome: RecommendationOutcome) {
  const payload = objectValue(outcome.payload_json);

  return (
    finiteNumber(outcome.eod_r) ??
    finiteNumber(outcome.current_r) ??
    finiteNumber(payload?.terminal_r) ??
    finiteNumber(payload?.realized_r) ??
    null
  );
}

function targetHit(outcome: RecommendationOutcome) {
  return (
    outcome.target_hit === true ||
    outcome.status === "target_hit" ||
    outcome.status === "target_before_stop"
  );
}

function stopHit(outcome: RecommendationOutcome) {
  return (
    outcome.stop_hit === true ||
    outcome.status === "stop_hit" ||
    outcome.status === "stop_before_target"
  );
}

function entryNotTriggered(outcome: RecommendationOutcome) {
  return outcome.entry_triggered === false || outcome.status === "entry_not_triggered";
}

function completenessRank(outcome: RecommendationOutcome) {
  return outcome.data_completeness === "complete"
    ? 3
    : outcome.data_completeness === "partial"
      ? 2
      : outcome.data_completeness === "none"
        ? 1
        : 0;
}

function statusRank(outcome: RecommendationOutcome) {
  return evaluatedStatuses.has(outcome.status)
    ? 3
    : outcome.status === "incomplete" || outcome.status === "unknown"
      ? 1
      : 0;
}

function timestampMs(value: string | null | undefined) {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.getTime() : 0;
}

function isBetterOutcome(
  candidate: RecommendationOutcome,
  current: RecommendationOutcome,
) {
  const candidateRank = completenessRank(candidate) * 10 + statusRank(candidate);
  const currentRank = completenessRank(current) * 10 + statusRank(current);

  if (candidateRank !== currentRank) return candidateRank > currentRank;

  return (
    Math.max(
      timestampMs(candidate.updated_at),
      timestampMs(candidate.evaluated_at),
      timestampMs(candidate.created_at),
    ) >
    Math.max(
      timestampMs(current.updated_at),
      timestampMs(current.evaluated_at),
      timestampMs(current.created_at),
    )
  );
}

function dedupeReviewOutcomes(outcomes: RecommendationOutcome[]) {
  let duplicateCount = 0;
  const byKey = new Map<string, RecommendationOutcome>();

  for (const outcome of outcomes) {
    const identity =
      textOrNull(outcome.snapshot_fingerprint) ??
      textOrNull(outcome.recommendation_id) ??
      normalizeTicker(outcome.ticker);
    const key = `${identity}:${outcome.horizon ?? "unknown"}`;
    const current = byKey.get(key);

    if (!current) {
      byKey.set(key, outcome);
      continue;
    }

    duplicateCount += 1;
    if (isBetterOutcome(outcome, current)) {
      byKey.set(key, outcome);
    }
  }

  return {
    outcomes: Array.from(byKey.values()),
    duplicateCount,
  };
}

function sampleConfidence(outcomeCount: number): DailyLearningReviewConfidence {
  if (outcomeCount >= 100) return "high";
  if (outcomeCount >= 30) return "medium";
  return "low";
}

function metricsFor(items: ReviewOutcome[]): DailyLearningReviewMetricSummary {
  const outcomeCount = items.length;
  const entryTriggeredCount = items.filter(
    (item) => item.outcome.entry_triggered === true,
  ).length;
  const targetHitCount = items.filter((item) => targetHit(item.outcome)).length;
  const stopHitCount = items.filter((item) => stopHit(item.outcome)).length;
  const entryNotTriggeredCount = items.filter((item) =>
    entryNotTriggered(item.outcome),
  ).length;
  const neitherHitCount = items.filter(
    (item) =>
      !targetHit(item.outcome) &&
      !stopHit(item.outcome) &&
      !entryNotTriggered(item.outcome),
  ).length;

  return {
    outcome_count: outcomeCount,
    entry_triggered_count: entryTriggeredCount,
    entry_triggered_rate: rate(entryTriggeredCount, outcomeCount),
    target_hit_count: targetHitCount,
    target_hit_rate: rate(targetHitCount, outcomeCount),
    stop_hit_count: stopHitCount,
    stop_hit_rate: rate(stopHitCount, outcomeCount),
    neither_hit_count: neitherHitCount,
    neither_hit_rate: rate(neitherHitCount, outcomeCount),
    entry_not_triggered_count: entryNotTriggeredCount,
    entry_not_triggered_rate: rate(entryNotTriggeredCount, outcomeCount),
    average_best_r: average(items.map((item) => item.outcome.best_r)),
    average_worst_r: average(items.map((item) => item.outcome.worst_r)),
    average_terminal_r: average(items.map((item) => terminalR(item.outcome))),
  };
}

function tickerSummaries(
  items: ReviewOutcome[],
  sortBy: "best" | "worst",
): DailyLearningReviewTickerSummary[] {
  const groups = new Map<string, ReviewOutcome[]>();

  for (const item of items) {
    const current = groups.get(item.ticker) ?? [];
    current.push(item);
    groups.set(item.ticker, current);
  }

  return Array.from(groups.entries())
    .map(([ticker, group]) => ({
      ticker,
      outcome_count: group.length,
      average_best_r: average(group.map((item) => item.outcome.best_r)),
      average_worst_r: average(group.map((item) => item.outcome.worst_r)),
    }))
    .filter((item) =>
      sortBy === "best"
        ? item.average_best_r !== null
        : item.average_worst_r !== null,
    )
    .sort((first, second) =>
      sortBy === "best"
        ? (second.average_best_r ?? Number.NEGATIVE_INFINITY) -
          (first.average_best_r ?? Number.NEGATIVE_INFINITY)
        : (first.average_worst_r ?? Number.POSITIVE_INFINITY) -
          (second.average_worst_r ?? Number.POSITIVE_INFINITY),
    )
    .slice(0, 5);
}

function groupSummary(
  items: ReviewOutcome[],
  groupType: DailyLearningReviewGroupSummary["group_type"],
  keySelector: (item: ReviewOutcome) => string,
) {
  const groups = new Map<string, ReviewOutcome[]>();

  for (const item of items) {
    const key = textOrNull(keySelector(item)) ?? "unknown";
    const current = groups.get(key) ?? [];
    current.push(item);
    groups.set(key, current);
  }

  return Array.from(groups.entries())
    .map(([key, group]) => ({
      group_type: groupType,
      key,
      ...metricsFor(group),
    }))
    .sort((first, second) => second.outcome_count - first.outcome_count);
}

function setupFamilyBreakdowns(
  items: ReviewOutcome[],
): DailyLearningReviewSetupFamilySummary[] {
  const groups = new Map<TureSetupFamily, ReviewOutcome[]>();

  for (const item of items) {
    const family = item.setup_label.setup_family;
    const current = groups.get(family) ?? [];
    current.push(item);
    groups.set(family, current);
  }

  return Array.from(groups.entries())
    .map(([setupFamily, group]) => {
      const split = visibilitySplit(group);

      return {
        setup_family: setupFamily,
        unique_snapshot_count: uniqueSnapshotCount(group),
        ...split,
        sample_confidence: sampleConfidence(group.length),
        advisory_only: true as const,
        ...metricsFor(group),
      };
    })
    .sort((first, second) => second.outcome_count - first.outcome_count);
}

function dimensionBreakdowns(
  items: ReviewOutcome[],
  keySelector: (item: ReviewOutcome) => string,
): DailyLearningReviewDimensionSummary[] {
  const groups = new Map<string, ReviewOutcome[]>();

  for (const item of items) {
    const key = textOrNull(keySelector(item)) ?? "unknown";
    const current = groups.get(key) ?? [];
    current.push(item);
    groups.set(key, current);
  }

  return Array.from(groups.entries())
    .map(([key, group]) => {
      const split = visibilitySplit(group);

      return {
        key,
        unique_snapshot_count: uniqueSnapshotCount(group),
        ...split,
        sample_confidence: sampleConfidence(group.length),
        top_setup_families: topSetupFamilies(group),
        ...metricsFor(group),
      };
    })
    .sort((first, second) => second.outcome_count - first.outcome_count);
}

function tierBreakdowns(
  items: ReviewOutcome[],
): DailyLearningReviewTierSummary[] {
  return dimensionBreakdowns(items, (item) => item.tier).map(
    (item) => ({
      key: item.key,
      unique_snapshot_count: item.unique_snapshot_count,
      visible_count: item.visible_count,
      research_only_count: item.research_only_count,
      unknown_visibility_count: item.unknown_visibility_count,
      sample_confidence: item.sample_confidence,
      outcome_count: item.outcome_count,
      entry_triggered_count: item.entry_triggered_count,
      entry_triggered_rate: item.entry_triggered_rate,
      target_hit_count: item.target_hit_count,
      target_hit_rate: item.target_hit_rate,
      stop_hit_count: item.stop_hit_count,
      stop_hit_rate: item.stop_hit_rate,
      neither_hit_count: item.neither_hit_count,
      neither_hit_rate: item.neither_hit_rate,
      entry_not_triggered_count: item.entry_not_triggered_count,
      entry_not_triggered_rate: item.entry_not_triggered_rate,
      average_best_r: item.average_best_r,
      average_worst_r: item.average_worst_r,
      average_terminal_r: item.average_terminal_r,
    }),
  );
}

function sectorGroupBreakdowns(
  items: ReviewOutcome[],
): DailyLearningReviewSectorGroupSummary[] {
  const groups = new Map<TureSector, ReviewOutcome[]>();

  for (const item of items) {
    const sectorGroup = item.sector_profile.sector_group;
    const current = groups.get(sectorGroup) ?? [];
    current.push(item);
    groups.set(sectorGroup, current);
  }

  return Array.from(groups.entries())
    .map(([sectorGroup, group]) => {
      const split = visibilitySplit(group);

      return {
        sector_group: sectorGroup,
        sector: sectorGroup,
        unique_snapshot_count: uniqueSnapshotCount(group),
        ...split,
        setup_family_mix: setupFamilyMix(group),
        ticker_mix: tickerMix(group),
        sample_confidence: sampleConfidence(group.length),
        advisory_only: true as const,
        ...metricsFor(group),
      };
    })
    .sort((first, second) => second.outcome_count - first.outcome_count);
}

function industryBreakdowns(
  items: ReviewOutcome[],
): DailyLearningReviewIndustrySummary[] {
  const groups = new Map<TureIndustry, ReviewOutcome[]>();

  for (const item of items) {
    const industry = item.sector_profile.industry;
    const current = groups.get(industry) ?? [];
    current.push(item);
    groups.set(industry, current);
  }

  return Array.from(groups.entries())
    .map(([industry, group]) => {
      const split = visibilitySplit(group);

      return {
        industry,
        unique_snapshot_count: uniqueSnapshotCount(group),
        ...split,
        setup_family_mix: setupFamilyMix(group),
        ticker_mix: tickerMix(group),
        sector_group_mix: sectorMix(group),
        sample_confidence: sampleConfidence(group.length),
        advisory_only: true as const,
        ...metricsFor(group),
      };
    })
    .sort((first, second) => second.outcome_count - first.outcome_count);
}

function sectorTickerSummaries(
  items: ReviewOutcome[],
  sortBy: "best" | "worst",
): DailyLearningReviewSectorTickerSummary[] {
  const groups = new Map<TureSector, ReviewOutcome[]>();

  for (const item of items) {
    const key = item.sector_profile.sector_group;
    const current = groups.get(key) ?? [];
    current.push(item);
    groups.set(key, current);
  }

  return Array.from(groups.entries())
    .map(([sectorGroup, group]) => ({
      sector_group: sectorGroup,
      outcome_count: group.length,
      average_best_r: average(group.map((item) => item.outcome.best_r)),
      average_worst_r: average(group.map((item) => item.outcome.worst_r)),
      sample_confidence: sampleConfidence(group.length),
    }))
    .filter((item) =>
      sortBy === "best"
        ? item.average_best_r !== null
        : item.average_worst_r !== null,
    )
    .sort((first, second) =>
      sortBy === "best"
        ? (second.average_best_r ?? Number.NEGATIVE_INFINITY) -
          (first.average_best_r ?? Number.NEGATIVE_INFINITY)
        : (first.average_worst_r ?? Number.POSITIVE_INFINITY) -
          (second.average_worst_r ?? Number.POSITIVE_INFINITY),
    )
    .slice(0, 5);
}

function buildSectorIndustryMappingSummary(input: {
  dayRows: ReviewOutcome[];
  latestBatchRows: ReviewOutcome[];
}): SectorIndustryMappingSummary {
  const currentBatchMappedCount = input.latestBatchRows.filter(
    (item) => item.sector_profile.mapping_source !== "unknown",
  ).length;

  return {
    advisory_mode: true,
    current_batch_mapped_count: currentBatchMappedCount,
    current_batch_total_count: input.latestBatchRows.length,
    unknown_ticker_mapping_count: input.dayRows.filter(
      (item) => item.sector_profile.mapping_source === "unknown",
    ).length,
    sector_mix: sectorMix(input.dayRows),
    industry_mix: industryMix(input.dayRows),
    visible_sector_mix: sectorMix(
      input.dayRows.filter((item) => item.visibility === "visible"),
    ),
    research_only_sector_mix: sectorMix(
      input.dayRows.filter((item) => item.visibility === "research_only"),
    ),
    low_confidence_mapping_count: input.dayRows.filter(
      (item) => item.sector_profile.mapping_confidence === "low",
    ).length,
    top_sector_mapping_gaps: mappingGapCounts(input.dayRows),
  };
}

function tickerProfileOutcomes(items: ReviewOutcome[]) {
  return items.map((item) => ({
    ticker: item.ticker,
    snapshot_identity: item.snapshot_identity,
    visibility: item.visibility,
    entry_triggered: item.outcome.entry_triggered,
    entry_not_triggered: entryNotTriggered(item.outcome),
    target_hit: targetHit(item.outcome),
    stop_hit: stopHit(item.outcome),
    best_r: item.outcome.best_r,
    worst_r: item.outcome.worst_r,
    terminal_r: terminalR(item.outcome),
    setup_family: item.setup_label.setup_family,
    window: item.window,
    tier: item.tier,
  }));
}

function safeJsonSignal(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function marketRegimeTextSignals(items: ReviewOutcome[]) {
  return items.flatMap((item) => {
    const snapshotPayload = item.snapshot?.payload_json ?? null;
    const outcomePayload = objectValue(item.outcome.payload_json);

    return [
      item.window,
      item.tier,
      item.setup_label.setup_family,
      item.sector_profile.sector_group,
      item.snapshot?.reason,
      item.snapshot?.rationale,
      item.snapshot?.catalyst,
      item.snapshot?.primary_risk,
      ...item.outcome.warnings,
      ...item.outcome.blockers,
      safeJsonSignal(snapshotPayload),
      safeJsonSignal(outcomePayload),
    ].filter((value): value is string => textOrNull(value) !== null);
  });
}

function explicitRegimeFromRows(items: ReviewOutcome[]) {
  for (const item of items) {
    const payloads = [
      ...(item.snapshot?.payload_json ? nestedPayloads(item.snapshot.payload_json) : []),
      ...nestedPayloads(objectValue(item.outcome.payload_json)),
    ];

    for (const payload of payloads) {
      const regime =
        textOrNull(payload.regime) ??
        textOrNull(payload.market_regime) ??
        textOrNull(payload.marketRegime);

      if (regime) return regime;
    }
  }

  return null;
}

function countByTier(items: ReviewOutcome[], tier: string) {
  return items.filter((item) => item.tier === tier).length;
}

function tickerProfileStatusMix(profiles: TureTickerProfile[]) {
  const mix: Record<string, number> = {};

  for (const profile of profiles) {
    mix[profile.ticker_status] = (mix[profile.ticker_status] ?? 0) + 1;
  }

  return mix;
}

function buildDailyMarketRegimeSummary(input: {
  rows: ReviewOutcome[];
  latestRows: ReviewOutcome[];
  tickerProfiles: TureTickerProfile[];
  engineAdjustments: DailyLearningReviewEngineAdjustment[];
}): DailyLearningReviewMarketRegimeSummary {
  const sourceRows = input.latestRows.length > 0 ? input.latestRows : input.rows;
  const label = buildMarketRegimeLabel({
    explicit_regime: explicitRegimeFromRows(sourceRows),
    text_signals: marketRegimeTextSignals(sourceRows),
    sector_mix: sectorMix(sourceRows),
    setup_family_mix: setupFamilyMix(sourceRows),
    ticker_profile_status_mix: tickerProfileStatusMix(input.tickerProfiles),
    strong_candidate_count: countByTier(sourceRows, "strong"),
    valid_candidate_count: countByTier(sourceRows, "valid"),
    experimental_candidate_count: countByTier(sourceRows, "experimental"),
    no_trade_candidate_count: sourceRows.filter((item) =>
      item.outcome.status === "expired" || item.outcome.status === "unknown",
    ).length,
    outcome_count: sourceRows.length,
  });
  const regime = label.regime_label;

  return {
    advisory_mode: true,
    latest_regime_label: label,
    latest_evaluated_batch_regime_label: regime,
    latest_evaluated_batch_regime_confidence: label.regime_confidence,
    outcomes_by_regime: { [regime]: sourceRows.length },
    setup_family_mix_by_regime: { [regime]: setupFamilyMix(sourceRows) },
    sector_mix_by_regime: { [regime]: sectorMix(sourceRows) },
    ticker_profile_status_mix_by_regime: {
      [regime]: tickerProfileStatusMix(input.tickerProfiles),
    },
    engine_adjustment_candidates_by_regime: {
      [regime]: input.engineAdjustments.map((item) => item.candidate),
    },
    sample_confidence: label.sample_confidence,
  };
}

function firstNestedText(
  payloads: Array<Record<string, unknown> | null>,
  keys: string[],
) {
  for (const payload of payloads) {
    for (const item of nestedPayloads(payload)) {
      for (const key of keys) {
        const value = textOrNull(item[key]);
        if (value) return value;
      }
    }
  }

  return null;
}

function firstNestedNumber(
  payloads: Array<Record<string, unknown> | null>,
  keys: string[],
) {
  for (const payload of payloads) {
    for (const item of nestedPayloads(payload)) {
      for (const key of keys) {
        const value = finiteNumber(item[key]);
        if (value !== null) return value;
      }
    }
  }

  return null;
}

function firstNestedBoolean(
  payloads: Array<Record<string, unknown> | null>,
  keys: string[],
) {
  for (const payload of payloads) {
    for (const item of nestedPayloads(payload)) {
      for (const key of keys) {
        if (typeof item[key] === "boolean") return item[key] as boolean;
      }
    }
  }

  return null;
}

function qualityTextContext(item: ReviewOutcome) {
  const snapshotPayload = item.snapshot?.payload_json ?? null;
  const outcomePayload = objectValue(item.outcome.payload_json);

  return [
    item.setup_type,
    item.entry_type,
    item.entry_trigger_semantics,
    item.snapshot?.reason,
    item.snapshot?.rationale,
    item.snapshot?.catalyst,
    item.snapshot?.primary_risk,
    item.snapshot?.market_data_snapshot,
    ...item.outcome.warnings,
    ...item.outcome.blockers,
    safeJsonSignal(snapshotPayload),
    safeJsonSignal(outcomePayload),
  ]
    .filter((value): value is string => textOrNull(value) !== null)
    .join(" ");
}

function metadataGapFlags(payloads: Array<Record<string, unknown> | null>) {
  const flags = new Set<string>();

  for (const payload of payloads) {
    for (const item of nestedPayloads(payload)) {
      for (const [key, value] of Object.entries(item)) {
        if (
          value === true &&
          (key.startsWith("missing_") ||
            key.endsWith("_missing") ||
            key.includes("metadata_gap"))
        ) {
          flags.add(key);
        }
      }
    }
  }

  return Array.from(flags);
}

function tierConfidenceFallback(tier: string) {
  if (tier === "strong") return 85;
  if (tier === "valid") return 75;
  if (tier === "experimental") return 65;
  return null;
}

function parseConfidenceValue(value: unknown) {
  let parsed: number | null = null;

  if (typeof value === "number" && Number.isFinite(value)) {
    parsed = value;
  } else if (typeof value === "string" && value.trim().length > 0) {
    const text = value.trim();
    const percent = text.endsWith("%");
    const numeric = Number(text.replace(/%$/, "").trim());
    if (Number.isFinite(numeric)) {
      parsed = percent ? numeric : numeric;
    }
  }

  if (parsed === null) return null;
  if (parsed >= 0 && parsed <= 1) return parsed * 100;
  if (parsed >= 0 && parsed <= 100) return parsed;
  return null;
}

const confidenceMetadataKeys = new Set([
  "confidence",
  "confidence_score",
  "confidencescore",
  "confidence_percent",
  "confidencepercentage",
  "confidence_pct",
  "recommendation_confidence",
  "recommendationconfidence",
  "quality_confidence",
  "qualityconfidence",
  "card_confidence",
  "cardconfidence",
]);

const confidenceScoreFallbackKeys = new Set([
  "score",
  "ranking_score",
  "rankingscore",
  "tier_score",
  "tierscore",
]);

function normalizedMetadataKey(key: string) {
  return key.replace(/[-\s]+/g, "_").toLowerCase();
}

function confidenceSourceForPayload(
  payload: Record<string, unknown>,
  defaultSource: string,
) {
  const keys = Object.keys(payload).map((key) => key.toLowerCase());
  return keys.some((key) => key.includes("candidate"))
    ? "candidate_metadata"
    : defaultSource;
}

function findConfidenceInPayloads(
  payloads: Array<{
    payload: Record<string, unknown> | null;
    source: string;
  }>,
  keys: Set<string>,
) {
  for (const { payload, source } of payloads) {
    for (const item of nestedPayloads(payload)) {
      for (const [key, value] of Object.entries(item)) {
        if (!keys.has(normalizedMetadataKey(key))) continue;
        const parsed = parseConfidenceValue(value);
        if (parsed !== null) {
          return {
            confidence: Math.max(0, Math.min(100, parsed)),
            source: confidenceSourceForPayload(item, source),
          };
        }
      }
    }
  }

  return null;
}

function confidenceForReviewOutcome(item: ReviewOutcome) {
  const snapshotPayload = item.snapshot?.payload_json ?? null;
  const outcomePayload = objectValue(item.outcome.payload_json);
  const payloads = [
    { payload: snapshotPayload, source: "snapshot_payload" },
    { payload: outcomePayload, source: "outcome_payload" },
  ];
  const qualityPayload = objectValue(item.snapshot?.quality_json);
  const directConfidence =
    parseConfidenceValue(item.snapshot?.confidence) ??
    parseConfidenceValue(qualityPayload?.confidence);

  if (directConfidence !== null) {
    return {
      confidence: Math.max(0, Math.min(100, directConfidence)),
      source: "recommendation_metadata" as const,
      source_category: "numeric" as const,
      metadata_keys: metadataKeys([snapshotPayload, outcomePayload]),
    };
  }

  const explicit = findConfidenceInPayloads(payloads, confidenceMetadataKeys);

  if (explicit !== null) {
    return {
      confidence: explicit.confidence,
      source: explicit.source,
      source_category: "numeric" as const,
      metadata_keys: metadataKeys([snapshotPayload, outcomePayload]),
    };
  }

  const scoreFallback =
    parseConfidenceValue(item.snapshot?.score) ??
    findConfidenceInPayloads(payloads, confidenceScoreFallbackKeys)?.confidence ??
    null;

  if (scoreFallback !== null) {
    return {
      confidence: Math.max(0, Math.min(100, scoreFallback)),
      source: "recommendation_metadata" as const,
      source_category: "numeric" as const,
      metadata_keys: metadataKeys([snapshotPayload, outcomePayload]),
    };
  }

  const fallback = tierConfidenceFallback(item.tier);
  if (fallback !== null) {
    return {
      confidence: fallback,
      source: "tier_fallback" as const,
      source_category: "tier_fallback" as const,
      metadata_keys: metadataKeys([snapshotPayload, outcomePayload]),
    };
  }

  return {
    confidence: null,
    source: "unknown" as const,
    source_category: "unknown" as const,
    metadata_keys: metadataKeys([snapshotPayload, outcomePayload]),
  };
}

function confidenceCalibrationRows(input: {
  rows: ReviewOutcome[];
  tradeQualityRows: DailyLearningReviewTradeQualityRow[];
  marketRegime: DailyLearningReviewMarketRegimeSummary;
}) {
  const qualityBySnapshot = new Map(
    input.tradeQualityRows.map((item) => [
      item.snapshot_identity,
      item.decomposition.overall_quality_label,
    ]),
  );

  return input.rows.map((item) => {
    const confidence = confidenceForReviewOutcome(item);

    return {
      snapshot_identity: item.snapshot_identity,
      confidence: confidence.confidence,
      confidence_source: confidence.source,
      confidence_source_category: confidence.source_category,
      confidence_metadata_keys: confidence.metadata_keys,
      visibility: item.visibility,
      entry_triggered: item.outcome.entry_triggered,
      entry_not_triggered: entryNotTriggered(item.outcome),
      target_hit: targetHit(item.outcome),
      stop_hit: stopHit(item.outcome),
      best_r: item.outcome.best_r,
      worst_r: item.outcome.worst_r,
      terminal_r: terminalR(item.outcome),
      setup_family: item.setup_label.setup_family,
      sector: item.sector_profile.sector_group,
      ticker: item.ticker,
      regime:
        explicitRegimeFromRows([item]) ??
        input.marketRegime.latest_regime_label.regime_label,
      quality_label: qualityBySnapshot.get(item.snapshot_identity) ?? "unknown",
    };
  });
}

function tradeQualityRows(input: {
  rows: ReviewOutcome[];
  latestRows: ReviewOutcome[];
  tickerProfiles: TureTickerProfile[];
  marketRegime: DailyLearningReviewMarketRegimeSummary;
}): DailyLearningReviewTradeQualityRow[] {
  const latestIdentities = new Set(
    input.latestRows.map((item) => item.snapshot_identity),
  );
  const tickerProfilesByTicker = new Map(
    input.tickerProfiles.map((profile) => [profile.ticker, profile]),
  );
  const regime = input.marketRegime.latest_regime_label;

  return input.rows.map((item) => {
    const snapshotPayload = item.snapshot?.payload_json ?? null;
    const outcomePayload = objectValue(item.outcome.payload_json);
    const payloads = [snapshotPayload, outcomePayload];
    const tickerProfile = tickerProfilesByTicker.get(item.ticker) ?? null;
    const textContext = qualityTextContext(item);
    const decomposition = buildTradeQualityDecomposition({
      ticker: item.ticker,
      snapshot_identity: item.snapshot_identity,
      side: item.outcome.side ?? item.snapshot?.side ?? null,
      visibility: item.visibility,
      tier: item.tier,
      confidence: finiteNumber(item.snapshot?.confidence),
      setup_family: item.setup_label.setup_family,
      setup_confidence: item.setup_label.setup_confidence,
      entry_type: item.entry_type,
      entry_trigger_semantics: item.entry_trigger_semantics,
      entry_triggered: item.outcome.entry_triggered,
      entry_not_triggered: entryNotTriggered(item.outcome),
      entry: finiteNumber(item.outcome.entry) ?? finiteNumber(item.snapshot?.entry),
      entry_low: finiteNumber(item.snapshot?.entry_low),
      entry_high: finiteNumber(item.snapshot?.entry_high),
      stop: finiteNumber(item.outcome.stop) ?? finiteNumber(item.snapshot?.stop),
      target: finiteNumber(item.outcome.target) ?? finiteNumber(item.snapshot?.target),
      planned_risk_reward:
        finiteNumber(item.snapshot?.planned_risk_reward) ??
        firstNestedNumber(payloads, ["planned_risk_reward", "risk_reward_ratio"]),
      plan_freshness_classification: firstNestedText(payloads, [
        "classification",
        "plan_freshness_classification",
        "freshness_status",
      ]),
      volume_context: textContext,
      trend_context: textContext,
      sector_group: item.sector_profile.sector_group,
      sector_mapping_source: item.sector_profile.mapping_source,
      ticker_status: tickerProfile?.ticker_status ?? null,
      ticker_confidence: tickerProfile?.ticker_confidence ?? null,
      ticker_caution_flags: tickerProfile?.caution_flags ?? [],
      market_regime_label: regime.regime_label,
      market_regime_confidence: regime.regime_confidence,
      market_regime_caution_flags: regime.caution_flags,
      provider: item.outcome.provider ?? firstNestedText(payloads, ["provider"]),
      source: item.outcome.source ?? firstNestedText(payloads, ["source"]),
      data_timestamp: firstNestedText(payloads, [
        "data_timestamp",
        "provider_timestamp",
        "reference_timestamp",
      ]),
      reference_timestamp: firstNestedText(payloads, ["reference_timestamp"]),
      reference_price_present:
        firstNestedBoolean(payloads, ["reference_price_present"]) ??
        (firstNestedNumber(payloads, [
          "reference_price",
          "entry_type_reference_price",
          "first_candle_close",
        ]) !== null
          ? true
          : null),
      metadata_gap_flags: metadataGapFlags(payloads),
    });

    return {
      ticker: item.ticker,
      snapshot_identity: item.snapshot_identity,
      batch_fingerprint: item.batch_fingerprint,
      setup_family: item.setup_label.setup_family,
      sector_group: item.sector_profile.sector_group,
      market_regime_label: regime.regime_label,
      decomposition,
      advisory_only: true,
      current_batch: latestIdentities.has(item.snapshot_identity),
    };
  });
}

function comparisonSummary(input: {
  visible: DailyLearningReviewMetricSummary;
  research: DailyLearningReviewMetricSummary;
}) {
  const bestDelta = numberDelta(
    input.research.average_best_r,
    input.visible.average_best_r,
  );
  const worstDelta = numberDelta(
    input.research.average_worst_r,
    input.visible.average_worst_r,
  );
  let summary = "Not enough visible/research-only overlap yet.";

  if (
    input.visible.outcome_count > 0 &&
    input.research.outcome_count > 0 &&
    bestDelta !== null
  ) {
    if (bestDelta >= 0.25) {
      summary = "Research-only samples are showing stronger average best R.";
    } else if (bestDelta <= -0.25) {
      summary = "Visible recommendations are outperforming research-only samples.";
    } else {
      summary = "Visible and research-only samples are broadly similar so far.";
    }
  }

  return {
    visible_outcome_count: input.visible.outcome_count,
    research_only_outcome_count: input.research.outcome_count,
    visible_average_best_r: input.visible.average_best_r,
    research_only_average_best_r: input.research.average_best_r,
    visible_average_worst_r: input.visible.average_worst_r,
    research_only_average_worst_r: input.research.average_worst_r,
    average_best_r_delta_research_minus_visible: bestDelta,
    average_worst_r_delta_research_minus_visible: worstDelta,
    summary,
  };
}

function addAdjustment(
  adjustments: DailyLearningReviewEngineAdjustment[],
  candidate: DailyLearningReviewAdjustmentCandidate,
  confidence: DailyLearningReviewConfidence,
  reason: string,
) {
  if (adjustments.some((item) => item.candidate === candidate)) return;
  adjustments.push({ candidate, confidence, reason });
}

function engineAdjustments(input: {
  items: ReviewOutcome[];
  metrics: DailyLearningReviewMetricSummary;
  visibleMetrics: DailyLearningReviewMetricSummary;
  researchMetrics: DailyLearningReviewMetricSummary;
  confidence: DailyLearningReviewConfidence;
}) {
  const adjustments: DailyLearningReviewEngineAdjustment[] = [];

  if (input.metrics.outcome_count < 30) {
    addAdjustment(
      adjustments,
      "insufficient_sample_size",
      input.confidence,
      "Fewer than 30 evaluated outcomes; keep collecting before changing scoring.",
    );
  }

  if (
    (input.metrics.average_best_r ?? 0) >= 0.5 &&
    (input.metrics.target_hit_rate ?? 0) < 20
  ) {
    addAdjustment(
      adjustments,
      "target_too_far",
      input.confidence,
      "Average favorable movement is meaningful but target hit rate is still low.",
    );
  }

  if ((input.metrics.stop_hit_rate ?? 0) >= 35) {
    addAdjustment(
      adjustments,
      "stop_too_tight",
      input.confidence,
      "Stop hits are a large share of evaluated outcomes.",
    );
  }

  if (
    (input.metrics.entry_triggered_rate ?? 0) >= 50 &&
    (input.metrics.target_hit_rate ?? 0) < 15 &&
    (input.metrics.average_best_r ?? 0) < 0.25
  ) {
    addAdjustment(
      adjustments,
      "weak_follow_through",
      input.confidence,
      "Entries are triggering but average follow-through is weak.",
    );
  }

  if ((input.metrics.entry_not_triggered_rate ?? 0) >= 40) {
    addAdjustment(
      adjustments,
      "entry_not_triggering",
      input.confidence,
      "A high share of plans never triggered entry.",
    );
  }

  const powerHourItems = input.items.filter((item) => item.window === "power_hour");
  const powerHourMetrics = metricsFor(powerHourItems);

  if (
    powerHourMetrics.outcome_count >= 3 &&
    (powerHourMetrics.average_best_r ?? 0) < 0.25 &&
    (powerHourMetrics.target_hit_rate ?? 0) < 20
  ) {
    addAdjustment(
      adjustments,
      "poor_power_hour_follow_through",
      input.confidence,
      "Power Hour samples are not showing useful follow-through yet.",
    );
  }

  const bestDelta = numberDelta(
    input.researchMetrics.average_best_r,
    input.visibleMetrics.average_best_r,
  );

  if (
    bestDelta !== null &&
    input.researchMetrics.outcome_count >= 3 &&
    input.visibleMetrics.outcome_count >= 3
  ) {
    if (bestDelta >= 0.25) {
      addAdjustment(
        adjustments,
        "research_outperforming_visible",
        input.confidence,
        "Research-only samples have higher average best R than visible recommendations.",
      );
    } else if (bestDelta <= -0.25) {
      addAdjustment(
        adjustments,
        "visible_outperforming_research",
        input.confidence,
        "Visible recommendations have higher average best R than research-only samples.",
      );
    }
  }

  return adjustments;
}

function resolveLatestBatchFingerprint(input: DailyLearningReviewInput) {
  if (textOrNull(input.latest_batch_fingerprint)) {
    return textOrNull(input.latest_batch_fingerprint);
  }

  const latestBatch = [...(input.batches ?? [])]
    .filter((batch) => textOrNull(batch.batch_fingerprint) !== null)
    .sort(
      (first, second) =>
        timestampMs(second.published_at ?? second.observed_at) -
        timestampMs(first.published_at ?? first.observed_at),
    )[0];

  return latestBatch?.batch_fingerprint ?? null;
}

type SnapshotJoinIndexes = {
  bySnapshotFingerprint: Map<string, RecommendationSnapshot>;
  bySnapshotId: Map<string, RecommendationSnapshot>;
  byRecommendationId: Map<string, RecommendationSnapshot>;
  byNormalizedSnapshotFingerprint: Map<string, RecommendationSnapshot>;
  byBatchTicker: Map<string, RecommendationSnapshot[]>;
  byScanRunTicker: Map<string, RecommendationSnapshot[]>;
};

function addSnapshotToListIndex(
  index: Map<string, RecommendationSnapshot[]>,
  key: string | null,
  snapshot: RecommendationSnapshot,
) {
  if (!key) return;
  const existing = index.get(key) ?? [];
  existing.push(snapshot);
  index.set(key, existing);
}

function buildSnapshotJoinIndexes(
  snapshots: RecommendationSnapshot[],
): SnapshotJoinIndexes {
  const indexes: SnapshotJoinIndexes = {
    bySnapshotFingerprint: new Map(),
    bySnapshotId: new Map(),
    byRecommendationId: new Map(),
    byNormalizedSnapshotFingerprint: new Map(),
    byBatchTicker: new Map(),
    byScanRunTicker: new Map(),
  };

  for (const snapshot of snapshots) {
    indexes.bySnapshotFingerprint.set(snapshot.snapshot_fingerprint, snapshot);
    indexes.bySnapshotId.set(snapshot.id, snapshot);

    if (snapshot.recommendation_id !== null) {
      indexes.byRecommendationId.set(snapshot.recommendation_id, snapshot);
    }

    const normalizedFingerprint = normalizeJoinKey(snapshot.snapshot_fingerprint);
    if (normalizedFingerprint) {
      indexes.byNormalizedSnapshotFingerprint.set(normalizedFingerprint, snapshot);
    }

    const normalizedId = normalizeJoinKey(snapshot.id);
    if (normalizedId) {
      indexes.byNormalizedSnapshotFingerprint.set(normalizedId, snapshot);
    }

    const ticker = normalizeTicker(snapshot.ticker);
    addSnapshotToListIndex(
      indexes.byBatchTicker,
      indexKey(snapshotBatchFingerprint(snapshot), ticker),
      snapshot,
    );
    addSnapshotToListIndex(
      indexes.byScanRunTicker,
      indexKey(snapshotScanRunFingerprint(snapshot), ticker),
      snapshot,
    );
  }

  return indexes;
}

function snapshotIsResearchOnly(snapshot: RecommendationSnapshot) {
  return (
    snapshot.source_mode === "research_only" ||
    snapshot.data_mode === "research_only" ||
    researchOnlyPayloadSource(snapshot.payload_json) !== null
  );
}

function chooseFallbackSnapshot(
  candidates: RecommendationSnapshot[] | undefined,
  outcome: RecommendationOutcome,
) {
  if (!candidates || candidates.length === 0) return null;

  const outcomeFingerprint = textOrNull(outcome.snapshot_fingerprint);
  const normalizedOutcomeFingerprint = normalizeJoinKey(outcomeFingerprint);
  const outcomeLooksResearch =
    outcome.recommendation_id === null ||
    (outcomeFingerprint?.toLowerCase().includes("research") ?? false) ||
    visibilityFromOutcomePayload(objectValue(outcome.payload_json))?.visibility ===
      "research_only";

  const scored = candidates.map((snapshot, index) => {
    let score = 0;
    const normalizedSnapshotFingerprint = normalizeJoinKey(
      snapshot.snapshot_fingerprint,
    );

    if (
      normalizedOutcomeFingerprint &&
      normalizedSnapshotFingerprint === normalizedOutcomeFingerprint
    ) {
      score += 100;
    }

    if (outcome.recommendation_id && snapshot.recommendation_id === outcome.recommendation_id) {
      score += 50;
    }

    if (outcomeLooksResearch === snapshotIsResearchOnly(snapshot)) {
      score += 20;
    }

    if (!isHiddenOrArchivedSnapshot(snapshot)) {
      score += 5;
    }

    return { snapshot, score, index };
  });

  scored.sort((first, second) => second.score - first.score || first.index - second.index);
  return scored[0]?.snapshot ?? null;
}

function outcomeHasUsablePayloadOnlyMetadata(outcome: RecommendationOutcome) {
  const payload = objectValue(outcome.payload_json);
  if (!payload) return false;

  return (
    visibilityFromOutcomePayload(payload) !== null ||
    findConfidenceInPayloads([{ payload, source: "outcome_payload" }], confidenceMetadataKeys) !==
      null ||
    tierFromPayload(payload) !== "unknown"
  );
}

function resolveSnapshotJoin(
  outcome: RecommendationOutcome,
  indexes: SnapshotJoinIndexes,
): {
  snapshot: RecommendationSnapshot | null;
  source: DailyLearningReviewSnapshotJoinSource;
} {
  const snapshotFingerprint = textOrNull(outcome.snapshot_fingerprint);
  if (snapshotFingerprint) {
    const exact = indexes.bySnapshotFingerprint.get(snapshotFingerprint);
    if (exact) return { snapshot: exact, source: "snapshot_fingerprint_exact" };
  }

  const snapshotId = textOrNull(outcome.snapshot_id);
  if (snapshotId) {
    const exact = indexes.bySnapshotId.get(snapshotId);
    if (exact) return { snapshot: exact, source: "snapshot_id_exact" };
  }

  const recommendationId = textOrNull(outcome.recommendation_id);
  if (recommendationId) {
    const exact = indexes.byRecommendationId.get(recommendationId);
    if (exact) return { snapshot: exact, source: "recommendation_id" };
  }

  const normalizedFingerprint =
    normalizeJoinKey(snapshotFingerprint) ?? normalizeJoinKey(snapshotId);
  if (normalizedFingerprint) {
    const normalized = indexes.byNormalizedSnapshotFingerprint.get(
      normalizedFingerprint,
    );
    if (normalized) {
      return { snapshot: normalized, source: "normalized_snapshot_fingerprint" };
    }
  }

  const ticker = normalizeTicker(outcome.ticker);
  if (ticker !== "UNKNOWN") {
    const batchTickerKey = indexKey(
      payloadBatchFingerprint(objectValue(outcome.payload_json)),
      ticker,
    );
    const batchTickerSnapshot = chooseFallbackSnapshot(
      batchTickerKey ? indexes.byBatchTicker.get(batchTickerKey) : undefined,
      outcome,
    );
    if (batchTickerSnapshot) {
      return { snapshot: batchTickerSnapshot, source: "batch_ticker" };
    }

    const scanRunTickerKey = indexKey(
      payloadScanRunFingerprint(objectValue(outcome.payload_json)),
      ticker,
    );
    const scanRunTickerSnapshot = chooseFallbackSnapshot(
      scanRunTickerKey
        ? indexes.byScanRunTicker.get(scanRunTickerKey)
        : undefined,
      outcome,
    );
    if (scanRunTickerSnapshot) {
      return { snapshot: scanRunTickerSnapshot, source: "scan_run_ticker" };
    }
  }

  if (outcomeHasUsablePayloadOnlyMetadata(outcome)) {
    return { snapshot: null, source: "outcome_payload_only" };
  }

  return { snapshot: null, source: "missing" };
}

function reviewRows(input: DailyLearningReviewInput) {
  const snapshotJoinIndexes = buildSnapshotJoinIndexes(input.snapshots);
  const deduped = dedupeReviewOutcomes(input.outcomes);

  return {
    duplicateCount: deduped.duplicateCount,
    rows: deduped.outcomes
      .filter((outcome) => evaluatedStatuses.has(outcome.status))
      .map((outcome): ReviewOutcome => {
        const snapshotJoin = resolveSnapshotJoin(outcome, snapshotJoinIndexes);
        const snapshot = snapshotJoin.snapshot;
        const outcomePayload = objectValue(outcome.payload_json);
        const snapshotPayload = snapshot?.payload_json ?? null;
        const visibilityResolution = visibilityFor(outcome, snapshot);
        const visibility = visibilityResolution.visibility;
        const window = normalizeWindow(windowFrom(outcome, snapshot));
        const tier = tierFromSnapshotAndPayload(
          snapshot,
          snapshotPayload,
          outcomePayload,
        );
        const setupType = setupTypeFromPayload(snapshotPayload ?? outcomePayload);
        const entryType = entryTypeFromPayload(snapshotPayload ?? outcomePayload);
        const entryTriggerSemantics = triggerSemanticsFromPayload(
          snapshotPayload ?? outcomePayload,
        );
        const setupLabel = buildSetupLabel({
          ticker: outcome.ticker ?? snapshot?.ticker ?? null,
          window,
          tier,
          visibility,
          setup_type: setupType,
          entry_type: entryType,
          entry_trigger_semantics: entryTriggerSemantics,
          reason_text: [
            snapshot?.reason,
            snapshot?.rationale,
            snapshot?.catalyst,
            snapshot?.primary_risk,
            outcome.warnings.join(" "),
          ]
            .filter((value): value is string => textOrNull(value) !== null)
            .join(" "),
          payloads: [snapshotPayload, outcomePayload],
        });
        const ticker = normalizeTicker(outcome.ticker ?? snapshot?.ticker ?? null);
        const sectorProfile = buildSectorIndustryLabel({ ticker });

        return {
          outcome,
          snapshot,
          snapshot_join_source: snapshotJoin.source,
          matched_recommendation_row:
            textOrNull(outcome.recommendation_id) !== null &&
            snapshot?.recommendation_id === outcome.recommendation_id,
          batch_fingerprint: outcomeBatchFingerprint(outcome, snapshot),
          visibility,
          visibility_source: visibilityResolution.source,
          snapshot_identity:
            textOrNull(outcome.snapshot_fingerprint) ??
            textOrNull(snapshot?.snapshot_fingerprint) ??
            textOrNull(outcome.recommendation_id) ??
            textOrNull(snapshot?.recommendation_id) ??
            `${normalizeTicker(outcome.ticker ?? snapshot?.ticker ?? null)}:${outcome.horizon}`,
          ticker,
          window,
          tier,
          setup_type: setupType,
          entry_type: entryType,
          entry_trigger_semantics: entryTriggerSemantics,
          setup_label: setupLabel,
          sector_profile: sectorProfile,
        };
      }),
  };
}

function visibilityDiagnostics(
  items: ReviewOutcome[],
): DailyLearningReviewVisibilityDiagnostics {
  const sourceCounts: Record<DailyLearningReviewVisibilityDetectionSource, number> = {
    recommendation_metadata: 0,
    snapshot_payload: 0,
    outcome_payload: 0,
    learning_acceleration_flag: 0,
    inferred_research_only: 0,
    unknown: 0,
  };

  for (const item of items) {
    sourceCounts[item.visibility_source] =
      (sourceCounts[item.visibility_source] ?? 0) + 1;
  }

  return {
    source_counts: sourceCounts,
    unknown_examples: items
      .filter((item) => item.visibility === "unknown_visibility")
      .slice(0, 8)
      .map((item) => ({
        ticker: item.ticker,
        snapshot_fingerprint:
          item.snapshot?.snapshot_fingerprint ??
          item.outcome.snapshot_fingerprint ??
          null,
        batch_fingerprint: item.batch_fingerprint,
        available_metadata_keys: metadataKeys([
          item.snapshot?.payload_json ?? null,
          objectValue(item.outcome.payload_json),
        ]),
        reason: "no_explicit_visibility_or_research_metadata",
      })),
  };
}

function initialSnapshotJoinSourceCounts(): Record<
  DailyLearningReviewSnapshotJoinSource,
  number
> {
  return {
    snapshot_fingerprint_exact: 0,
    snapshot_id_exact: 0,
    recommendation_id: 0,
    normalized_snapshot_fingerprint: 0,
    batch_ticker: 0,
    scan_run_ticker: 0,
    outcome_payload_only: 0,
    missing: 0,
  };
}

function snapshotJoinDiagnostics(
  items: ReviewOutcome[],
): DailyLearningReviewSnapshotJoinDiagnostics {
  const joinSourceCounts = initialSnapshotJoinSourceCounts();

  for (const item of items) {
    joinSourceCounts[item.snapshot_join_source] =
      (joinSourceCounts[item.snapshot_join_source] ?? 0) + 1;
  }

  return {
    outcomes_with_snapshot_join: items.filter((item) => item.snapshot !== null)
      .length,
    outcomes_without_snapshot_join: items.filter((item) => item.snapshot === null)
      .length,
    join_source_counts: joinSourceCounts,
    missing_join_examples: items
      .filter((item) => item.snapshot_join_source === "missing")
      .slice(0, 8)
      .map((item) => ({
        ticker: item.ticker,
        outcome_id: textOrNull(item.outcome.id),
        snapshot_fingerprint: item.outcome.snapshot_fingerprint,
        snapshot_id: item.outcome.snapshot_id,
        recommendation_id_present: textOrNull(item.outcome.recommendation_id) !== null,
        batch_fingerprint: outcomeBatchFingerprint(item.outcome, null),
        scan_run_fingerprint: outcomeScanRunFingerprint(item.outcome, null),
        outcome_payload_keys: metadataKeys([objectValue(item.outcome.payload_json)]),
        reason: "no_snapshot_or_recommendation_metadata_join",
      })),
  };
}

function visibilitySourceCounts(
  items: ReviewOutcome[],
): Record<DailyLearningReviewVisibilityDetectionSource, number> {
  return visibilityDiagnostics(items).source_counts;
}

function confidenceSourceCounts(items: ReviewOutcome[]) {
  const counts: Record<string, number> = {};

  for (const item of items) {
    const confidence = confidenceForReviewOutcome(item);
    counts[confidence.source] = (counts[confidence.source] ?? 0) + 1;
  }

  return counts;
}

function topLevelSnapshotKeys(snapshot: RecommendationSnapshot | null) {
  if (!snapshot) return [];

  return Object.entries(snapshot)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key]) => key)
    .sort()
    .slice(0, 30);
}

function metadataReadbackDiagnostics(
  items: ReviewOutcome[],
): DailyLearningReviewMetadataReadbackDiagnostics {
  const snapshotJoin = snapshotJoinDiagnostics(items);

  return {
    outcomes_inspected: items.length,
    matched_snapshots: snapshotJoin.outcomes_with_snapshot_join,
    matched_recommendation_rows: items.filter(
      (item) => item.matched_recommendation_row,
    ).length,
    visibility_source_mix: visibilitySourceCounts(items),
    confidence_source_mix: confidenceSourceCounts(items),
    snapshot_join_source_mix: snapshotJoin.join_source_counts,
    inspection_examples: items.slice(0, 8).map((item) => {
      const confidence = confidenceForReviewOutcome(item);
      const outcomePayload = objectValue(item.outcome.payload_json);

      return {
        outcome_id: textOrNull(item.outcome.id),
        ticker: item.ticker,
        batch_fingerprint: item.batch_fingerprint,
        snapshot_fingerprint:
          item.snapshot?.snapshot_fingerprint ??
          item.outcome.snapshot_fingerprint ??
          null,
        recommendation_id_present:
          textOrNull(item.outcome.recommendation_id) !== null ||
          textOrNull(item.snapshot?.recommendation_id) !== null,
        matched_snapshot: item.snapshot !== null,
        matched_recommendation_row: item.matched_recommendation_row,
        visibility_decision: item.visibility,
        visibility_decision_source: item.visibility_source,
        confidence_decision: confidence.confidence,
        confidence_decision_source: confidence.source,
        top_level_metadata_keys: topLevelSnapshotKeys(item.snapshot),
        nested_payload_keys: metadataKeys([
          item.snapshot?.payload_json ?? null,
          outcomePayload,
        ]),
        snapshot_metadata_keys: metadataKeys([item.snapshot?.payload_json ?? null]),
        outcome_payload_keys: metadataKeys([outcomePayload]),
      };
    }),
  };
}

export function buildDailyLearningReviewSummary(
  input: DailyLearningReviewInput,
): DailyLearningReviewSummary {
  const now = toDate(input.now) ?? new Date();
  const tradingDay = input.trading_day ?? getNewYorkDate(now);
  const latestBatchFingerprint = resolveLatestBatchFingerprint(input);
  const review = reviewRows(input);
  const dayRows =
    tradingDay === null
      ? review.rows
      : review.rows.filter(
          (item) =>
            getNewYorkDate(item.outcome.evaluated_at ?? item.outcome.updated_at) ===
            tradingDay,
        );
  const latestBatchRows =
    latestBatchFingerprint === null
      ? []
      : review.rows.filter(
          (item) => item.batch_fingerprint === latestBatchFingerprint,
        );
  const visibleRows = dayRows.filter((item) => item.visibility === "visible");
  const researchRows = dayRows.filter(
    (item) => item.visibility === "research_only",
  );
  const unknownVisibilityRows = dayRows.filter(
    (item) => item.visibility === "unknown_visibility",
  );
  const visibilityDiagnosticSummary = visibilityDiagnostics(dayRows);
  const snapshotJoinDiagnosticSummary = snapshotJoinDiagnostics(dayRows);
  const metadataReadbackDiagnosticSummary = metadataReadbackDiagnostics(dayRows);
  const metrics = metricsFor(dayRows);
  const visibleMetrics = metricsFor(visibleRows);
  const researchMetrics = metricsFor(researchRows);
  const confidence = sampleConfidence(metrics.outcome_count);
  const sectorIndustryMapping = buildSectorIndustryMappingSummary({
    dayRows,
    latestBatchRows,
  });
  const tickerProfiles = buildTickerProfiles({
    outcomes: tickerProfileOutcomes(dayRows),
  });
  const tickerProfileSummary = buildTickerProfileSummary(tickerProfiles);
  const engineAdjustmentCandidates = engineAdjustments({
    items: dayRows,
    metrics,
    visibleMetrics,
    researchMetrics,
    confidence,
  });
  const marketRegime = buildDailyMarketRegimeSummary({
    rows: dayRows,
    latestRows: latestBatchRows,
    tickerProfiles,
    engineAdjustments: engineAdjustmentCandidates,
  });
  const tradeQualityDecompositions = tradeQualityRows({
    rows: dayRows,
    latestRows: latestBatchRows,
    tickerProfiles,
    marketRegime,
  });
  const tradeQualitySummary = buildTradeQualityDecompositionSummary(
    tradeQualityDecompositions.map((row) => ({
      decomposition: row.decomposition,
      setup_family: row.setup_family,
      sector_group: row.sector_group,
      ticker: row.ticker,
      market_regime_label: row.market_regime_label,
      current_batch: row.current_batch,
    })),
  );
  const confidenceCalibration = buildConfidenceCalibrationSummary(
    confidenceCalibrationRows({
      rows: dayRows,
      tradeQualityRows: tradeQualityDecompositions,
      marketRegime,
    }),
  );
  const modelGovernance = buildModelGovernanceSummary();
  const setupLabelingSummary = buildSetupLabelingSummary({
    labels: dayRows.map((item) => ({
      visibility: item.visibility,
      label: item.setup_label,
    })),
    currentBatchLabels: latestBatchRows.map((item) => ({
      visibility: item.visibility,
      label: item.setup_label,
    })),
  });
  const intelligenceOverview = buildIntelligenceOverview({
    latest_batch_fingerprint: latestBatchFingerprint,
    latest_evaluated_batch_fingerprint: latestBatchFingerprint,
    outcome_count: metrics.outcome_count,
    unique_snapshot_count: uniqueSnapshotCount(dayRows),
    setup_labeling: setupLabelingSummary,
    sector_industry_mapping: sectorIndustryMapping,
    sector_group_breakdowns: sectorGroupBreakdowns(dayRows),
    ticker_profile_summary: tickerProfileSummary,
    market_regime: marketRegime,
    trade_quality_summary: tradeQualitySummary,
    confidence_calibration: confidenceCalibration,
    model_governance: modelGovernance,
    engine_adjustment_candidates: engineAdjustmentCandidates,
  });

  return {
    summary_version: "1.0",
    summary_kind: "daily_learning_review",
    generated_at: now.toISOString(),
    trading_day: tradingDay,
    latest_evaluated_batch_fingerprint: latestBatchFingerprint,
    latest_evaluated_batch_outcome_count: latestBatchRows.length,
    scan_windows: Array.from(new Set(dayRows.map((item) => item.window))).sort(),
    evaluated_outcome_count: metrics.outcome_count,
    visible_evaluated_count: visibleRows.length,
    research_only_evaluated_count: researchRows.length,
    unknown_visibility_evaluated_count: unknownVisibilityRows.length,
    latest_batch_visible_evaluated_count: latestBatchRows.filter(
      (item) => item.visibility === "visible",
    ).length,
    latest_batch_research_only_evaluated_count: latestBatchRows.filter(
      (item) => item.visibility === "research_only",
    ).length,
    latest_batch_unknown_visibility_evaluated_count: latestBatchRows.filter(
      (item) => item.visibility === "unknown_visibility",
    ).length,
    visible_unique_snapshot_count: uniqueSnapshotCount(visibleRows),
    research_only_unique_snapshot_count: uniqueSnapshotCount(researchRows),
    unknown_visibility_unique_snapshot_count:
      uniqueSnapshotCount(unknownVisibilityRows),
    metrics,
    visible_metrics: visibleMetrics,
    research_only_metrics: researchMetrics,
    visible_vs_research_only_comparison: comparisonSummary({
      visible: visibleMetrics,
      research: researchMetrics,
    }),
    top_positive_tickers_by_avg_best_r: tickerSummaries(dayRows, "best"),
    weakest_tickers_by_avg_worst_r: tickerSummaries(dayRows, "worst"),
    setup_family_breakdowns: setupFamilyBreakdowns(dayRows),
    ticker_breakdowns: dimensionBreakdowns(dayRows, (item) => item.ticker),
    window_breakdowns: dimensionBreakdowns(dayRows, (item) => item.window),
    tier_breakdowns: tierBreakdowns(dayRows),
    sector_group_breakdowns: sectorGroupBreakdowns(dayRows),
    industry_breakdowns: industryBreakdowns(dayRows),
    top_sectors_by_avg_best_r: sectorTickerSummaries(dayRows, "best"),
    weakest_sectors_by_avg_worst_r: sectorTickerSummaries(dayRows, "worst"),
    group_breakdowns: [
      ...groupSummary(
        dayRows,
        "setup_family",
        (item) => item.setup_label.setup_family,
      ),
      ...groupSummary(dayRows, "setup_type", (item) => item.setup_type),
      ...groupSummary(dayRows, "entry_type", (item) => item.entry_type),
      ...groupSummary(
        dayRows,
        "entry_trigger_semantics",
        (item) => item.entry_trigger_semantics,
      ),
      ...groupSummary(dayRows, "window", (item) => item.window),
      ...groupSummary(dayRows, "tier", (item) => item.tier),
    ],
    setup_labeling: setupLabelingSummary,
    sector_industry_mapping: sectorIndustryMapping,
    ticker_profiles: tickerProfiles,
    ticker_profile_summary: tickerProfileSummary,
    market_regime: marketRegime,
    trade_quality_decompositions: tradeQualityDecompositions,
    trade_quality_summary: tradeQualitySummary,
    confidence_calibration: confidenceCalibration,
    model_governance: modelGovernance,
    intelligence_overview: intelligenceOverview,
    visibility_diagnostics: visibilityDiagnosticSummary,
    snapshot_join_diagnostics: snapshotJoinDiagnosticSummary,
    metadata_readback_diagnostics: metadataReadbackDiagnosticSummary,
    engine_adjustment_candidates: engineAdjustmentCandidates,
    sample_size_label: confidence,
    duplicate_outcome_rows_ignored_count: review.duplicateCount,
  };
}

export function dailyLearningReviewSummaryJson(
  summary: DailyLearningReviewSummary,
) {
  return JSON.stringify(summary, null, 2);
}
