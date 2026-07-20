import type { RecommendationOutcome } from "./recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "./recommendation-snapshot";
import { buildConfidenceProjectionObservationPreview } from "./confidence-calibration-recommendation-advisory-projection-observation";
import {
  classifyConfidenceProjectionOutcomeCompletion,
  confidenceProjectionObservationContractVersion,
  isConfidenceProjectionObservationContract,
} from "./confidence-projection-observation-contract";

export type ConfidenceProjectionComparisonResult =
  | "improved"
  | "worsened"
  | "neutral"
  | "insufficient_data";

export type ConfidenceProjectionDeltaDirection =
  | "raised"
  | "lowered"
  | "unchanged"
  | "unknown";

export type ConfidenceProjectionSampleQuality =
  | "insufficient_sample"
  | "early_directional_signal"
  | "usable_observation_sample"
  | "strong_observation_sample";

export type ConfidenceProjectionReviewMode =
  | "recommendation_level"
  | "horizon_level";

export type ConfidenceProjectionInsufficiencyReason =
  | "missing_snapshot_match"
  | "missing_outcome_match"
  | "missing_original_confidence"
  | "missing_projected_confidence"
  | "missing_completed_outcome"
  | "unsupported_outcome_status"
  | "missing_stable_identity"
  | "missing_recommendation_id"
  | "missing_snapshot_fingerprint"
  | "ambiguous_join"
  | "invalid_confidence"
  | "missing_required_setup_metadata"
  | "projection_not_derivable"
  | "outcome_metadata_conflict"
  | "missing_official_evaluation_metadata"
  | "unknown_outcome_horizon";

export type ConfidenceProjectionInsufficiencyCategory =
  | "join_related"
  | "projection_related"
  | "outcome_related"
  | "metadata_related";

export type ConfidenceProjectionJoinSource =
  | "snapshot_fingerprint"
  | "snapshot_id"
  | "recommendation_id"
  | "unique_composite_fallback"
  | "missing"
  | "ambiguous";

export type ConfidenceProjectionConfidenceSource =
  | "stored_projection"
  | "deterministically_recomputed_projection"
  | "unavailable";

export type ConfidenceProjectionOriginalConfidenceSource =
  | "snapshot_field"
  | "snapshot_payload"
  | "contract_v1"
  | "unavailable";

export type ConfidenceProjectionIdentitySource =
  | "recommendation_id"
  | "snapshot_fingerprint"
  | "snapshot_id"
  | "unavailable";

export type ConfidenceProjectionOptionalMetadataGap =
  | "missing_setup_type"
  | "missing_recommendation_tier"
  | "missing_trading_window"
  | "missing_explanation_category"
  | "missing_trade_plan_metadata";

export type ConfidenceProjectionOutcomeObservation = {
  stable_identity_key: string | null;
  stable_identity_source: ConfidenceProjectionIdentitySource;
  recommendation_id: string | null;
  snapshot_fingerprint: string | null;
  snapshot_id: string | null;
  ticker: string;
  timestamp: string | null;
  window: string;
  tier: string;
  setup_type: string;
  horizon: string;
  original_confidence: number | null;
  original_confidence_source: ConfidenceProjectionOriginalConfidenceSource;
  projected_confidence: number | null;
  projected_confidence_source: ConfidenceProjectionConfidenceSource;
  confidence_delta: number | null;
  delta_direction: ConfidenceProjectionDeltaDirection;
  explanation_category: string;
  calibration_status: string | null;
  join_source: ConfidenceProjectionJoinSource;
  snapshot_contract_version: string | null;
  outcome_contract_version: string | null;
  outcome_status: string;
  outcome_success_score: 0 | 100 | null;
  target_reached: boolean | null;
  stop_reached: boolean | null;
  realized_r: number | null;
  original_error: number | null;
  projected_error: number | null;
  error_improvement: number | null;
  comparison: ConfidenceProjectionComparisonResult;
  completeness: "complete" | "insufficient_data";
  insufficient_reasons: ConfidenceProjectionInsufficiencyReason[];
  optional_metadata_gaps: ConfidenceProjectionOptionalMetadataGap[];
};

export type ConfidenceProjectionReviewGroup = {
  key: string;
  label: string;
  observed_count: number;
  complete_count: number;
  improved_count: number;
  worsened_count: number;
  neutral_count: number;
  improved_rate: number | null;
  mean_original_error: number | null;
  mean_projected_error: number | null;
  net_error_improvement: number | null;
};

export type ConfidenceProjectionCalibrationMetrics = {
  observed_count: number;
  complete_count: number;
  insufficient_count: number;
  improved_count: number;
  worsened_count: number;
  neutral_count: number;
  improved_rate: number | null;
  worsened_rate: number | null;
  neutral_rate: number | null;
  mean_original_error: number | null;
  mean_projected_error: number | null;
  net_error_improvement: number | null;
  average_delta: number | null;
  raised_count: number;
  lowered_count: number;
  unchanged_count: number;
  overestimated_count: number;
  underestimated_count: number;
  sample_quality: ConfidenceProjectionSampleQuality;
  confidence_bands: ConfidenceProjectionReviewGroup[];
  tiers: ConfidenceProjectionReviewGroup[];
  windows: ConfidenceProjectionReviewGroup[];
  setup_types: ConfidenceProjectionReviewGroup[];
  explanation_categories: ConfidenceProjectionReviewGroup[];
};

export type ConfidenceProjectionSubgroupType =
  | "confidence_band"
  | "recommendation_tier"
  | "trading_window"
  | "projection_delta_direction"
  | "projection_explanation_category"
  | "setup_type";

export type ConfidenceProjectionSignalConfidence =
  | "insufficient"
  | "weak_directional_signal"
  | "early_usable_signal"
  | "meaningful_signal";

export type ConfidenceProjectionCalibrationSignal = {
  status: "selected" | "insufficient";
  subgroup_type: ConfidenceProjectionSubgroupType | "none";
  subgroup_key: string;
  subgroup_label: string;
  sample_count: number;
  net_error_improvement: number | null;
  mean_original_error: number | null;
  mean_projected_error: number | null;
  improved_count: number;
  worsened_count: number;
  neutral_count: number;
  direction: "helps" | "hurts" | "neutral" | "insufficient";
  confidence_in_conclusion: ConfidenceProjectionSignalConfidence;
  recommended_next_experiment: string;
  rejection_reason: string | null;
};

export type ConfidenceProjectionCalibrationSignalReview = {
  minimum_subgroup_observations: number;
  threshold_interpretation: {
    insufficient: string;
    weak_directional_signal: string;
    early_usable_signal: string;
    meaningful_signal: string;
  };
  strongest_positive_subgroup: ConfidenceProjectionCalibrationSignal;
  strongest_negative_subgroup: ConfidenceProjectionCalibrationSignal;
  selected_signal: ConfidenceProjectionCalibrationSignal;
  recommended_calibration_adjustment_candidate: string;
};

export type ConfidenceProjectionInsufficiencyReasonSummary = {
  reason: ConfidenceProjectionInsufficiencyReason;
  category: ConfidenceProjectionInsufficiencyCategory;
  count: number;
  rate: number | null;
};

export type ConfidenceProjectionObservationCompleteness = {
  eligible_observations: number;
  complete_observations: number;
  insufficient_observations: number;
  completeness_rate: number | null;
  projection_derivable_count: number;
  projection_derivable_rate: number | null;
  successful_join_count: number;
  successful_join_rate: number | null;
  completed_outcome_count: number;
  completed_outcome_rate: number | null;
  reason_counts: ConfidenceProjectionInsufficiencyReasonSummary[];
  category_counts: Array<{
    category: ConfidenceProjectionInsufficiencyCategory;
    count: number;
    rate: number | null;
  }>;
  most_common_blocker: ConfidenceProjectionInsufficiencyReasonSummary | null;
  second_most_common_blocker: ConfidenceProjectionInsufficiencyReasonSummary | null;
  future_contract_coverage: {
    contract_version: typeof confidenceProjectionObservationContractVersion;
    migration_required: false;
    snapshot_contract_count: number;
    outcome_contract_count: number;
    contract_join_ready_count: number;
    expected_future_completeness:
      | "complete_when_outcome_evaluated"
      | "still_blocked";
    fields_captured_at_snapshot_time: string[];
    fields_captured_at_outcome_time: string[];
    join_identifiers_retained: string[];
  };
};

export type ConfidenceProjectionRecommendationObservationCompleteness = {
  complete_recommendations: number;
  identities_with_explicit_horizons: number;
  missing_identity_count: number;
  missing_confidence_count: number;
  missing_projection_count: number;
  optional_metadata_gap_count: number;
  unrecoverable_observations: number;
  recovered_by_identity_normalization: number;
  recovered_by_confidence_lookup: number;
  recovered_by_deterministic_projection_recomputation: number;
  optional_metadata_gaps: Record<ConfidenceProjectionOptionalMetadataGap, number>;
  core_requirements: string[];
  optional_metadata_fields: string[];
  copy: {
    summary: string;
    optional_metadata_policy: string;
  };
};

export type ConfidenceProjectionHorizonSequenceStatus =
  | "stable_horizon_sequence"
  | "evolving_valid_horizon_sequence"
  | "conflicting_horizon_sequence"
  | "insufficient_horizon_sequence";

export type ConfidenceProjectionRecommendationLevelDeduplication = {
  review_mode: "recommendation_level";
  selection_policy: "longest_complete_supported_horizon";
  supported_horizon_priority: ["60m", "30m", "15m"];
  identity_fields: {
    primary: "recommendation_id";
    fallback: ["snapshot_fingerprint", "snapshot_id"];
    horizon_excluded_from_primary_identity: true;
  };
  unique_recommendation_identities: number;
  identities_with_one_horizon: number;
  identities_with_multiple_horizons: number;
  identities_deduplicated: number;
  identities_blocked_by_horizon_conflict: number;
  selected_15m_count: number;
  selected_30m_count: number;
  selected_60m_count: number;
  deduplicated_outcome_row_count: number;
  excluded_horizon_observation_count: number;
  blocked_horizon_observation_count: number;
  stable_horizon_sequence_count: number;
  evolving_valid_horizon_sequence_count: number;
  conflicting_horizon_sequence_count: number;
  insufficient_horizon_sequence_count: number;
  selected_horizon_breakdown: Record<string, number>;
  conflict_reasons: Record<string, number>;
  copy: {
    primary_calibration: string;
    selection_policy: string;
    conflict_policy: string;
  };
};

export type ConfidenceProjectionHorizonLevelDiagnostics = ConfidenceProjectionCalibrationMetrics & {
  review_mode: "horizon_level";
  horizon_groups: ConfidenceProjectionReviewGroup[];
  copy: {
    diagnostic_only: string;
  };
};

export type ConfidenceProjectionOutcomeReview = {
  status: "ready" | "no_observations";
  review_mode: ConfidenceProjectionReviewMode;
  observed_count: number;
  complete_count: number;
  insufficient_count: number;
  improved_count: number;
  worsened_count: number;
  neutral_count: number;
  improved_rate: number | null;
  worsened_rate: number | null;
  neutral_rate: number | null;
  mean_original_error: number | null;
  mean_projected_error: number | null;
  net_error_improvement: number | null;
  average_delta: number | null;
  raised_count: number;
  lowered_count: number;
  unchanged_count: number;
  overestimated_count: number;
  underestimated_count: number;
  sample_quality: ConfidenceProjectionSampleQuality;
  confidence_bands: ConfidenceProjectionReviewGroup[];
  tiers: ConfidenceProjectionReviewGroup[];
  windows: ConfidenceProjectionReviewGroup[];
  setup_types: ConfidenceProjectionReviewGroup[];
  explanation_categories: ConfidenceProjectionReviewGroup[];
  recommendation_level: ConfidenceProjectionCalibrationMetrics;
  horizon_level: ConfidenceProjectionHorizonLevelDiagnostics;
  recommendation_level_deduplication: ConfidenceProjectionRecommendationLevelDeduplication;
  first_observed_calibration_signal: ConfidenceProjectionCalibrationSignalReview;
  observation_completeness: ConfidenceProjectionObservationCompleteness;
  recommendation_observation_completeness: ConfidenceProjectionRecommendationObservationCompleteness;
  outcome_metadata_resolution: ConfidenceProjectionOutcomeMetadataResolutionSummary;
  observations: ConfidenceProjectionOutcomeObservation[];
  copy: {
    data_source: string;
    formula: string;
    sample_quality: string;
    observation_only: string;
  };
  no_effects: {
    ranking_affected: false;
    scanner_affected: false;
    publication_affected: false;
    execution_affected: false;
    add_trade_affected: false;
    risk_affected: false;
    sizing_affected: false;
    provider_called: false;
    supabase_write_executed: false;
    persistence_created: false;
    learning_write_executed: false;
  };
};

type SnapshotIndexes = {
  byRecommendationId: Map<string, RecommendationSnapshot[]>;
  bySnapshotFingerprint: Map<string, RecommendationSnapshot[]>;
  bySnapshotId: Map<string, RecommendationSnapshot[]>;
  byCompositeKey: Map<string, RecommendationSnapshot[]>;
};

type BuildInput = {
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  previewEnabled: boolean;
};

const confidenceBandDefinitions = [
  { key: "0-49", label: "0-49", min: 0, max: 49 },
  { key: "50-59", label: "50-59", min: 50, max: 59 },
  { key: "60-69", label: "60-69", min: 60, max: 69 },
  { key: "70-79", label: "70-79", min: 70, max: 79 },
  { key: "80-89", label: "80-89", min: 80, max: 89 },
  { key: "90-100", label: "90-100", min: 90, max: 100 },
];

const minimumSignalObservations = 5;
const recommendationLevelHorizonPriority = ["60m", "30m", "15m"] as const;
const supportedRecommendationLevelHorizons = new Set<string>(
  recommendationLevelHorizonPriority,
);

const signalGroupTypePriority: ConfidenceProjectionSubgroupType[] = [
  "confidence_band",
  "recommendation_tier",
  "trading_window",
  "projection_delta_direction",
  "projection_explanation_category",
  "setup_type",
];

const insufficiencyReasons: ConfidenceProjectionInsufficiencyReason[] = [
  "missing_snapshot_match",
  "missing_outcome_match",
  "missing_original_confidence",
  "missing_projected_confidence",
  "missing_completed_outcome",
  "unsupported_outcome_status",
  "missing_stable_identity",
  "missing_recommendation_id",
  "missing_snapshot_fingerprint",
  "ambiguous_join",
  "invalid_confidence",
  "missing_required_setup_metadata",
  "projection_not_derivable",
  "outcome_metadata_conflict",
  "missing_official_evaluation_metadata",
  "unknown_outcome_horizon",
];

const insufficiencyCategories: ConfidenceProjectionInsufficiencyCategory[] = [
  "join_related",
  "projection_related",
  "outcome_related",
  "metadata_related",
];

const reasonCategory: Record<
  ConfidenceProjectionInsufficiencyReason,
  ConfidenceProjectionInsufficiencyCategory
> = {
  missing_snapshot_match: "join_related",
  missing_outcome_match: "join_related",
  missing_original_confidence: "metadata_related",
  missing_projected_confidence: "projection_related",
  missing_completed_outcome: "outcome_related",
  unsupported_outcome_status: "outcome_related",
  missing_stable_identity: "join_related",
  missing_recommendation_id: "join_related",
  missing_snapshot_fingerprint: "join_related",
  ambiguous_join: "join_related",
  invalid_confidence: "metadata_related",
  missing_required_setup_metadata: "metadata_related",
  projection_not_derivable: "projection_related",
  outcome_metadata_conflict: "outcome_related",
  missing_official_evaluation_metadata: "outcome_related",
  unknown_outcome_horizon: "outcome_related",
};

export type ConfidenceProjectionOutcomeMetadataSource =
  | "top_level"
  | "payload_json"
  | "contract_v1"
  | "unavailable";

export type ConfidenceProjectionOutcomeMetadataResolution = {
  source: string | null;
  source_read_from: ConfidenceProjectionOutcomeMetadataSource;
  data_completeness: string | null;
  data_completeness_read_from: ConfidenceProjectionOutcomeMetadataSource;
  conflict_reasons: string[];
  unavailable_reasons: string[];
};

export type ConfidenceProjectionOutcomeMetadataResolutionSummary = {
  source_from_top_level: number;
  source_from_payload_json: number;
  source_from_contract_v1: number;
  source_unavailable: number;
  data_completeness_from_top_level: number;
  data_completeness_from_payload_json: number;
  data_completeness_from_contract_v1: number;
  data_completeness_unavailable: number;
  metadata_conflicts: number;
  entry_not_triggered_completed_from_normalized_metadata: number;
};

type OutcomeMetadataInput = Pick<RecommendationOutcome, "payload_json"> &
  Partial<Pick<RecommendationOutcome, "source" | "data_completeness">>;

function objectValue(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function observationContractFromPayload(payload: Record<string, unknown> | null) {
  const contract = objectValue(payload?.confidence_projection_observation_contract);
  return isConfidenceProjectionObservationContract(contract) ? contract : null;
}

function objectFromContract(
  contract: Record<string, unknown> | null,
  key: string,
) {
  return objectValue(contract?.[key]);
}

function identityFromContract(contract: Record<string, unknown> | null) {
  return objectFromContract(contract, "identity");
}

function textValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizedMetadataText(value: unknown) {
  return textValue(value)?.toLowerCase() ?? null;
}

function clampConfidence(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

function confidenceFromPayloadWithSource(
  payload: Record<string, unknown> | null,
): {
  value: number | null;
  source: ConfidenceProjectionOriginalConfidenceSource;
} {
  if (!payload) return { value: null, source: "unavailable" };
  const contract = observationContractFromPayload(payload);
  const snapshotTimeConfidence = objectFromContract(
    contract,
    "snapshot_time_confidence",
  );
  const recommendation = objectValue(payload.recommendation);
  const metadata = objectValue(payload.metadata);
  const confidenceMetadata = objectValue(payload.confidence_metadata);
  const contractConfidence = numberValue(snapshotTimeConfidence?.original_confidence);
  if (contractConfidence !== null) {
    return { value: contractConfidence, source: "contract_v1" };
  }

  const payloadConfidence =
    numberValue(snapshotTimeConfidence?.original_confidence) ??
    numberValue(payload.confidence_score) ??
    numberValue(payload.confidence) ??
    numberValue(payload.score) ??
    numberValue(recommendation?.confidence_score) ??
    numberValue(recommendation?.confidence) ??
    numberValue(metadata?.confidence_score) ??
    numberValue(confidenceMetadata?.score) ??
    null;

  return payloadConfidence === null
    ? { value: null, source: "unavailable" }
    : { value: payloadConfidence, source: "snapshot_payload" };
}

function confidenceFromSnapshotWithSource(
  snapshot: RecommendationSnapshot | null,
): {
  value: number | null;
  source: ConfidenceProjectionOriginalConfidenceSource;
} {
  const directValue =
    numberValue(snapshot?.confidence) ?? numberValue(snapshot?.score);
  if (directValue !== null) {
    return { value: clampConfidence(directValue), source: "snapshot_field" };
  }

  const payloadResult = confidenceFromPayloadWithSource(snapshot?.payload_json ?? null);
  return {
    value: payloadResult.value === null ? null : clampConfidence(payloadResult.value),
    source: payloadResult.source,
  };
}

function storedProjectedConfidenceFromPayload(
  payload: Record<string, unknown> | null,
) {
  if (!payload) return null;
  const contract = observationContractFromPayload(payload);
  const snapshotTimeConfidence = objectFromContract(
    contract,
    "snapshot_time_confidence",
  );
  const projection = objectValue(payload.confidence_projection);
  const preview = objectValue(payload.confidence_projection_preview);
  const advisory = objectValue(payload.confidence_calibration_advisory);

  return (
    numberValue(snapshotTimeConfidence?.projected_confidence) ??
    numberValue(payload.projected_confidence) ??
    numberValue(payload.ai_projected_confidence) ??
    numberValue(projection?.projected_confidence) ??
    numberValue(projection?.proposed_preview_confidence) ??
    numberValue(preview?.projected_confidence) ??
    numberValue(preview?.proposed_preview_confidence) ??
    numberValue(advisory?.projected_confidence) ??
    null
  );
}

function setupTypeFromSnapshot(snapshot: RecommendationSnapshot | null) {
  const payload = snapshot?.payload_json ?? null;
  const contract = observationContractFromPayload(payload);
  const setupMetadata = objectFromContract(contract, "setup_metadata");
  const recommendation = objectValue(payload?.recommendation);
  const metadata = objectValue(payload?.metadata);

  return (
    textValue(setupMetadata?.setup_type) ??
    textValue(payload?.setup_type) ??
    textValue(recommendation?.setup_type) ??
    textValue(metadata?.setup_type) ??
    textValue(snapshot?.type) ??
    "unknown"
  );
}

function tierFromSnapshot(snapshot: RecommendationSnapshot | null) {
  const payload = snapshot?.payload_json ?? null;
  const contract = observationContractFromPayload(payload);
  const setupMetadata = objectFromContract(contract, "setup_metadata");
  const recommendation = objectValue(payload?.recommendation);
  const metadata = objectValue(payload?.metadata);

  return (
    textValue(setupMetadata?.recommendation_tier) ??
    textValue(payload?.recommendation_tier) ??
    textValue(payload?.tier) ??
    textValue(recommendation?.tier) ??
    textValue(metadata?.tier) ??
    textValue(snapshot?.rating) ??
    textValue(snapshot?.label) ??
    "unknown"
  ).toLowerCase();
}

function windowFrom(
  outcome: RecommendationOutcome,
  snapshot: RecommendationSnapshot | null,
) {
  const outcomePayload = objectValue(outcome.payload_json);
  const snapshotPayload = snapshot?.payload_json ?? null;
  const snapshotContract = observationContractFromPayload(snapshotPayload);
  const outcomeContract = observationContractFromPayload(outcomePayload);
  const snapshotSetupMetadata = objectFromContract(
    snapshotContract,
    "setup_metadata",
  );
  const outcomeSetupMetadata = objectFromContract(outcomeContract, "setup_metadata");

  return (
    textValue(snapshotSetupMetadata?.trading_window) ??
    textValue(snapshot?.window) ??
    textValue(snapshotPayload?.scan_window) ??
    textValue(snapshotPayload?.source_window) ??
    textValue(outcomeSetupMetadata?.trading_window) ??
    textValue(outcomePayload?.scan_window) ??
    textValue(outcomePayload?.source_window) ??
    "unknown"
  ).replace(/\s+/g, "_");
}

function explanationCategory(setupType: string) {
  const normalized = setupType.toLowerCase();
  if (normalized.includes("breakout")) return "breakout_continuation";
  if (normalized.includes("continuation") || normalized.includes("vwap")) {
    return "momentum_continuation";
  }
  if (normalized.includes("reversal") || normalized.includes("reclaim")) {
    return "reversal_or_reclaim";
  }
  return "unknown";
}

function calibrationStatusFromSnapshotContract(
  snapshot: RecommendationSnapshot | null,
) {
  const contract = observationContractFromPayload(snapshot?.payload_json ?? null);
  const snapshotTimeConfidence = objectFromContract(
    contract,
    "snapshot_time_confidence",
  );
  return textValue(snapshotTimeConfidence?.calibration_status);
}

function outcomeSemanticsFromPayload(payload: Record<string, unknown> | null) {
  const contract = observationContractFromPayload(payload);
  return objectFromContract(contract, "outcome_semantics");
}

function metadataCandidate(
  value: unknown,
  source: ConfidenceProjectionOutcomeMetadataSource,
) {
  const normalized = normalizedMetadataText(value);
  return normalized === null ? null : { value: normalized, source };
}

function resolveMetadataField(
  label: "source" | "data_completeness",
  candidates: Array<{
    value: string;
    source: ConfidenceProjectionOutcomeMetadataSource;
  } | null>,
) {
  const present = candidates.filter(
    (
      candidate,
    ): candidate is {
      value: string;
      source: ConfidenceProjectionOutcomeMetadataSource;
    } => candidate !== null,
  );
  const selected = present[0] ?? null;
  const conflict = selected
    ? present.find((candidate) => candidate.value !== selected.value)
    : null;

  return {
    value: selected?.value ?? null,
    source: (selected?.source ?? "unavailable") as ConfidenceProjectionOutcomeMetadataSource,
    conflict_reason: conflict
      ? `${label}_conflict:${selected.source}=${selected.value};${conflict.source}=${conflict.value}`
      : null,
    unavailable_reason: selected === null ? `${label}_unavailable` : null,
  };
}

export function normalizeConfidenceProjectionOutcomeMetadata(
  outcome: OutcomeMetadataInput,
): ConfidenceProjectionOutcomeMetadataResolution {
  const payload = objectValue(outcome.payload_json);
  const semantics = outcomeSemanticsFromPayload(payload);
  const sourceResolution = resolveMetadataField("source", [
    metadataCandidate(outcome.source, "top_level"),
    metadataCandidate(payload?.source, "payload_json"),
    metadataCandidate(semantics?.source, "contract_v1"),
  ]);
  const dataCompletenessResolution = resolveMetadataField("data_completeness", [
    metadataCandidate(outcome.data_completeness, "top_level"),
    metadataCandidate(payload?.data_completeness, "payload_json"),
    metadataCandidate(semantics?.data_completeness, "contract_v1"),
  ]);
  const conflictReasons = [
    sourceResolution.conflict_reason,
    dataCompletenessResolution.conflict_reason,
  ].filter((reason): reason is string => reason !== null);
  const unavailableReasons = [
    sourceResolution.unavailable_reason,
    dataCompletenessResolution.unavailable_reason,
  ].filter((reason): reason is string => reason !== null);

  return {
    source: sourceResolution.value,
    source_read_from: sourceResolution.source,
    data_completeness: dataCompletenessResolution.value,
    data_completeness_read_from: dataCompletenessResolution.source,
    conflict_reasons: conflictReasons,
    unavailable_reasons: unavailableReasons,
  };
}

function normalizedText(value: unknown) {
  return textValue(typeof value === "string" ? value : String(value ?? ""))
    ?.toLowerCase()
    .replace(/\s+/g, "_") ?? null;
}

function normalizedNumber(value: unknown) {
  const parsed = numberValue(value);
  return parsed === null ? null : parsed.toFixed(4);
}

function compositeKeyFromParts(parts: Array<string | null>) {
  return parts.every((part) => part !== null) ? parts.join("|") : null;
}

function snapshotCompositeKey(snapshot: RecommendationSnapshot) {
  return compositeKeyFromParts([
    normalizedText(snapshot.ticker),
    normalizedText(snapshot.recommended_at),
    normalizedText(snapshot.window),
    normalizedText(snapshot.side),
    normalizedNumber(snapshot.entry),
    normalizedNumber(snapshot.stop),
    normalizedNumber(snapshot.target),
  ]);
}

function outcomeCompositeKey(outcome: RecommendationOutcome) {
  const payload = objectValue(outcome.payload_json);
  return compositeKeyFromParts([
    normalizedText(outcome.ticker),
    normalizedText(outcome.recommended_at),
    normalizedText(payload?.scan_window ?? payload?.source_window ?? payload?.window),
    normalizedText(outcome.side),
    normalizedNumber(outcome.entry),
    normalizedNumber(outcome.stop),
    normalizedNumber(outcome.target),
  ]);
}

export function mapOutcomeToBinaryConfidenceScore(
  outcome: Pick<
    RecommendationOutcome,
    | "status"
    | "horizon"
    | "target_hit"
    | "stop_hit"
    | "first_terminal_event"
    | "eod_r"
    | "current_r"
    | "payload_json"
  > &
    Partial<Pick<RecommendationOutcome, "source" | "data_completeness">>,
): 0 | 100 | null {
  const metadata = normalizeConfidenceProjectionOutcomeMetadata(outcome);
  const status = outcome.status;

  if (
    metadata.conflict_reasons.length > 0 ||
    outcome.horizon === "unknown" ||
    metadata.source === null ||
    metadata.data_completeness === null
  ) {
    return null;
  }

  if (
    (status === "entry_not_triggered" || status === "neither_hit") &&
    !(
      (metadata.data_completeness === "complete" ||
        metadata.data_completeness === "partial") &&
      metadata.source !== "snapshot_only"
    )
  ) {
    return null;
  }

  return classifyConfidenceProjectionOutcomeCompletion({
    ...outcome,
    source: metadata.source,
    data_completeness: metadata.data_completeness,
    best_r: null,
  }).binary_success_score;
}

export function compareConfidenceProjectionCalibration(input: {
  originalConfidence: number | null;
  projectedConfidence: number | null;
  outcomeScore: 0 | 100 | null;
}) {
  if (
    input.originalConfidence === null ||
    input.projectedConfidence === null ||
    input.outcomeScore === null
  ) {
    return {
      original_error: null,
      projected_error: null,
      error_improvement: null,
      comparison: "insufficient_data" as const,
    };
  }

  const originalError = Math.abs(input.originalConfidence - input.outcomeScore);
  const projectedError = Math.abs(input.projectedConfidence - input.outcomeScore);
  const improvement = originalError - projectedError;
  const comparison: ConfidenceProjectionComparisonResult =
    improvement > 0 ? "improved" : improvement < 0 ? "worsened" : "neutral";

  return {
    original_error: originalError,
    projected_error: projectedError,
    error_improvement: improvement,
    comparison,
  };
}

function buildSnapshotIndexes(snapshots: RecommendationSnapshot[]): SnapshotIndexes {
  const byRecommendationId = new Map<string, RecommendationSnapshot[]>();
  const bySnapshotFingerprint = new Map<string, RecommendationSnapshot[]>();
  const bySnapshotId = new Map<string, RecommendationSnapshot[]>();
  const byCompositeKey = new Map<string, RecommendationSnapshot[]>();
  const add = (
    map: Map<string, RecommendationSnapshot[]>,
    key: string | null | undefined,
    snapshot: RecommendationSnapshot,
  ) => {
    if (!key) return;
    const existing = map.get(key) ?? [];
    existing.push(snapshot);
    map.set(key, existing);
  };

  for (const snapshot of snapshots) {
    add(byRecommendationId, snapshot.recommendation_id, snapshot);
    add(bySnapshotFingerprint, snapshot.snapshot_fingerprint, snapshot);
    add(bySnapshotId, snapshot.id, snapshot);
    add(byCompositeKey, snapshotCompositeKey(snapshot), snapshot);
  }

  return {
    byRecommendationId,
    bySnapshotFingerprint,
    bySnapshotId,
    byCompositeKey,
  };
}

function uniqueSnapshotMatch(
  candidates: RecommendationSnapshot[] | undefined,
  source: ConfidenceProjectionJoinSource,
): {
  snapshot: RecommendationSnapshot | null;
  source: ConfidenceProjectionJoinSource;
  reasons: ConfidenceProjectionInsufficiencyReason[];
} | null {
  if (!candidates || candidates.length === 0) return null;
  if (candidates.length === 1) {
    return { snapshot: candidates[0], source, reasons: [] };
  }
  return { snapshot: null, source: "ambiguous", reasons: ["ambiguous_join"] };
}

function snapshotForOutcome(outcome: RecommendationOutcome, indexes: SnapshotIndexes) {
  if (outcome.snapshot_fingerprint) {
    const match = uniqueSnapshotMatch(
      indexes.bySnapshotFingerprint.get(outcome.snapshot_fingerprint),
      "snapshot_fingerprint",
    );
    if (match) return match;
  }
  if (outcome.snapshot_id) {
    const match = uniqueSnapshotMatch(
      indexes.bySnapshotId.get(outcome.snapshot_id),
      "snapshot_id",
    );
    if (match) return match;
  }
  if (outcome.recommendation_id) {
    const match = uniqueSnapshotMatch(
      indexes.byRecommendationId.get(outcome.recommendation_id),
      "recommendation_id",
    );
    if (match) return match;
  }

  const compositeKey = outcomeCompositeKey(outcome);
  if (compositeKey) {
    const match = uniqueSnapshotMatch(
      indexes.byCompositeKey.get(compositeKey),
      "unique_composite_fallback",
    );
    if (match) return match;
  }

  return {
    snapshot: null,
    source: "missing" as const,
    reasons: ["missing_snapshot_match" as const],
  };
}

function dedupeOutcomes(outcomes: RecommendationOutcome[]) {
  const byKey = new Map<string, RecommendationOutcome>();

  for (const outcome of outcomes) {
    const key = [
      outcome.recommendation_id ?? "no_recommendation",
      outcome.snapshot_fingerprint ?? outcome.snapshot_id ?? outcome.id,
      outcome.horizon,
    ].join("|");
    const current = byKey.get(key);
    if (!current || outcome.evaluated_at > current.evaluated_at) {
      byKey.set(key, outcome);
    }
  }

  return Array.from(byKey.values());
}

function deltaDirection(delta: number | null): ConfidenceProjectionDeltaDirection {
  if (delta === null) return "unknown";
  if (delta > 0) return "raised";
  if (delta < 0) return "lowered";
  return "unchanged";
}

function realizedR(outcome: RecommendationOutcome) {
  return (
    numberValue(outcome.eod_r) ??
    numberValue(outcome.current_r) ??
    numberValue(outcome.best_r) ??
    null
  );
}

function addReason(
  reasons: ConfidenceProjectionInsufficiencyReason[],
  reason: ConfidenceProjectionInsufficiencyReason,
) {
  if (!reasons.includes(reason)) reasons.push(reason);
}

function isUnknownMetadataValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized.length === 0 || normalized === "unknown";
}

function hasTradePlanMetadata(snapshot: RecommendationSnapshot | null) {
  const payload = snapshot?.payload_json ?? null;
  const contract = observationContractFromPayload(payload);
  const tradePlan = objectFromContract(contract, "trade_plan");

  return (
    numberValue(snapshot?.entry) !== null ||
    numberValue(snapshot?.stop) !== null ||
    numberValue(snapshot?.target) !== null ||
    numberValue(tradePlan?.entry) !== null ||
    numberValue(tradePlan?.stop) !== null ||
    numberValue(tradePlan?.target) !== null
  );
}

function optionalMetadataGaps({
  setupType,
  tier,
  window,
  explanationCategoryValue,
  snapshot,
}: {
  setupType: string;
  tier: string;
  window: string;
  explanationCategoryValue: string;
  snapshot: RecommendationSnapshot | null;
}) {
  const gaps: ConfidenceProjectionOptionalMetadataGap[] = [];
  if (isUnknownMetadataValue(setupType)) gaps.push("missing_setup_type");
  if (isUnknownMetadataValue(tier)) gaps.push("missing_recommendation_tier");
  if (isUnknownMetadataValue(window)) gaps.push("missing_trading_window");
  if (isUnknownMetadataValue(explanationCategoryValue)) {
    gaps.push("missing_explanation_category");
  }
  if (!hasTradePlanMetadata(snapshot)) gaps.push("missing_trade_plan_metadata");
  return gaps;
}

function resolveObservationIdentity(
  outcome: RecommendationOutcome,
  snapshot: RecommendationSnapshot | null,
): {
  recommendation_id: string | null;
  snapshot_fingerprint: string | null;
  snapshot_id: string | null;
  stable_identity_key: string | null;
  stable_identity_source: ConfidenceProjectionIdentitySource;
} {
  const snapshotContract = observationContractFromPayload(
    snapshot?.payload_json ?? null,
  );
  const outcomeContract = observationContractFromPayload(outcome.payload_json);
  const snapshotIdentity = identityFromContract(snapshotContract);
  const outcomeIdentity = identityFromContract(outcomeContract);
  const recommendationId =
    textValue(outcome.recommendation_id) ??
    textValue(snapshot?.recommendation_id) ??
    textValue(outcomeIdentity?.recommendation_id) ??
    textValue(snapshotIdentity?.recommendation_id);
  const snapshotFingerprint =
    textValue(outcome.snapshot_fingerprint) ??
    textValue(snapshot?.snapshot_fingerprint) ??
    textValue(outcomeIdentity?.snapshot_fingerprint) ??
    textValue(snapshotIdentity?.snapshot_fingerprint);
  const snapshotId =
    textValue(outcome.snapshot_id) ??
    textValue(snapshot?.id) ??
    textValue(outcomeIdentity?.snapshot_id) ??
    textValue(snapshotIdentity?.snapshot_id);

  if (recommendationId) {
    return {
      recommendation_id: recommendationId,
      snapshot_fingerprint: snapshotFingerprint,
      snapshot_id: snapshotId,
      stable_identity_key: `recommendation_id:${recommendationId}`,
      stable_identity_source: "recommendation_id",
    };
  }
  if (snapshotFingerprint) {
    return {
      recommendation_id: recommendationId,
      snapshot_fingerprint: snapshotFingerprint,
      snapshot_id: snapshotId,
      stable_identity_key: `snapshot_fingerprint:${snapshotFingerprint}`,
      stable_identity_source: "snapshot_fingerprint",
    };
  }
  if (snapshotId) {
    return {
      recommendation_id: recommendationId,
      snapshot_fingerprint: snapshotFingerprint,
      snapshot_id: snapshotId,
      stable_identity_key: `snapshot_id:${snapshotId}`,
      stable_identity_source: "snapshot_id",
    };
  }

  return {
    recommendation_id: null,
    snapshot_fingerprint: null,
    snapshot_id: null,
    stable_identity_key: null,
    stable_identity_source: "unavailable",
  };
}

function unsupportedOutcomeStatus(outcome: RecommendationOutcome) {
  const metadata = normalizeConfidenceProjectionOutcomeMetadata(outcome);
  if (
    metadata.conflict_reasons.length > 0 ||
    metadata.source === null ||
    metadata.data_completeness === null ||
    outcome.horizon === "unknown"
  ) {
    return true;
  }
  const completion = classifyConfidenceProjectionOutcomeCompletion({
    ...outcome,
    source: metadata.source,
    data_completeness: metadata.data_completeness,
  });
  return completion.classification === "incomplete" ||
    completion.classification === "unsupported";
}

function observationForOutcome(
  outcome: RecommendationOutcome,
  join: ReturnType<typeof snapshotForOutcome>,
  previewEnabled: boolean,
): ConfidenceProjectionOutcomeObservation {
  const snapshot = join.snapshot;
  const snapshotContract = observationContractFromPayload(
    snapshot?.payload_json ?? null,
  );
  const outcomeContract = observationContractFromPayload(outcome.payload_json);
  const identity = resolveObservationIdentity(outcome, snapshot);
  const originalConfidenceResult = confidenceFromSnapshotWithSource(snapshot);
  const originalConfidence = originalConfidenceResult.value;
  const setupType = setupTypeFromSnapshot(snapshot);
  const tier = tierFromSnapshot(snapshot);
  const window = windowFrom(outcome, snapshot);
  const explanationCategoryValue = explanationCategory(setupType);
  const metadataGaps = optionalMetadataGaps({
    setupType,
    tier,
    window,
    explanationCategoryValue,
    snapshot,
  });
  const storedProjectedConfidence = storedProjectedConfidenceFromPayload(
    snapshot?.payload_json ?? null,
  );
  const preview =
    snapshot === null
      ? null
      : buildConfidenceProjectionObservationPreview({
          previewEnabled,
          confidenceScore: originalConfidence,
          direction: snapshot.side,
          setupType,
          ticker: snapshot.ticker,
        });
  const recomputedProjectedConfidence =
    preview?.proposed_preview_confidence_basis_points === null ||
    preview?.proposed_preview_confidence_basis_points === undefined
      ? null
      : preview.proposed_preview_confidence_basis_points / 100;
  const projectedConfidence =
    storedProjectedConfidence ?? recomputedProjectedConfidence;
  const projectedConfidenceSource: ConfidenceProjectionConfidenceSource =
    storedProjectedConfidence !== null
      ? "stored_projection"
      : recomputedProjectedConfidence !== null
        ? "deterministically_recomputed_projection"
        : "unavailable";
  const delta =
    originalConfidence !== null && projectedConfidence !== null
      ? projectedConfidence - originalConfidence
      : null;
  const outcomeScore = mapOutcomeToBinaryConfidenceScore(outcome);
  const outcomeMetadata = normalizeConfidenceProjectionOutcomeMetadata(outcome);
  const comparison = compareConfidenceProjectionCalibration({
    originalConfidence,
    projectedConfidence,
    outcomeScore,
  });
  const insufficientReasons: ConfidenceProjectionInsufficiencyReason[] = [
    ...join.reasons,
  ];

  if (!outcome) addReason(insufficientReasons, "missing_outcome_match");
  if (identity.stable_identity_key === null) {
    addReason(insufficientReasons, "missing_stable_identity");
  }
  if (snapshot === null) addReason(insufficientReasons, "missing_snapshot_match");
  if (originalConfidence === null) {
    addReason(insufficientReasons, "missing_original_confidence");
  }
  if (
    originalConfidence !== null &&
    (originalConfidence < 0 || originalConfidence > 100)
  ) {
    addReason(insufficientReasons, "invalid_confidence");
  }
  if (projectedConfidence === null) {
    addReason(insufficientReasons, "missing_projected_confidence");
    addReason(insufficientReasons, "projection_not_derivable");
  }
  if (outcomeScore === null) {
    addReason(insufficientReasons, "missing_completed_outcome");
  }
  if (unsupportedOutcomeStatus(outcome)) {
    addReason(insufficientReasons, "unsupported_outcome_status");
  }
  if (outcome.horizon === "unknown") {
    addReason(insufficientReasons, "unknown_outcome_horizon");
  }
  if (outcomeMetadata.conflict_reasons.length > 0) {
    addReason(insufficientReasons, "outcome_metadata_conflict");
  }
  if (
    outcomeMetadata.source === null ||
    outcomeMetadata.data_completeness === null
  ) {
    addReason(insufficientReasons, "missing_official_evaluation_metadata");
  }

  return {
    stable_identity_key: identity.stable_identity_key,
    stable_identity_source: identity.stable_identity_source,
    recommendation_id: identity.recommendation_id,
    snapshot_fingerprint: identity.snapshot_fingerprint,
    snapshot_id: identity.snapshot_id,
    ticker: snapshot?.ticker ?? outcome.ticker ?? "unknown",
    timestamp: snapshot?.recommended_at ?? outcome.recommended_at,
    window,
    tier,
    setup_type: setupType,
    horizon: outcome.horizon,
    original_confidence: originalConfidence,
    original_confidence_source: originalConfidenceResult.source,
    projected_confidence: projectedConfidence,
    projected_confidence_source: projectedConfidenceSource,
    confidence_delta: delta,
    delta_direction: deltaDirection(delta),
    explanation_category: explanationCategoryValue,
    calibration_status:
      calibrationStatusFromSnapshotContract(snapshot) ??
      preview?.calibration_status ??
      null,
    join_source: join.source,
    snapshot_contract_version:
      typeof snapshotContract?.version === "string" ? snapshotContract.version : null,
    outcome_contract_version:
      typeof outcomeContract?.version === "string" ? outcomeContract.version : null,
    outcome_status: outcome.status,
    outcome_success_score: outcomeScore,
    target_reached: outcome.target_hit,
    stop_reached: outcome.stop_hit,
    realized_r: realizedR(outcome),
    original_error: comparison.original_error,
    projected_error: comparison.projected_error,
    error_improvement: comparison.error_improvement,
    comparison: comparison.comparison,
    completeness: insufficientReasons.length === 0 ? "complete" : "insufficient_data",
    insufficient_reasons: insufficientReasons,
    optional_metadata_gaps: metadataGaps,
  };
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function rate(count: number, total: number) {
  return total > 0 ? (count / total) * 100 : null;
}

function summarizeGroup(
  key: string,
  label: string,
  observations: ConfidenceProjectionOutcomeObservation[],
): ConfidenceProjectionReviewGroup {
  const complete = observations.filter((item) => item.completeness === "complete");
  const improvedCount = complete.filter((item) => item.comparison === "improved").length;
  const worsenedCount = complete.filter((item) => item.comparison === "worsened").length;
  const neutralCount = complete.filter((item) => item.comparison === "neutral").length;

  return {
    key,
    label,
    observed_count: observations.length,
    complete_count: complete.length,
    improved_count: improvedCount,
    worsened_count: worsenedCount,
    neutral_count: neutralCount,
    improved_rate: rate(improvedCount, complete.length),
    mean_original_error: average(
      complete
        .map((item) => item.original_error)
        .filter((value): value is number => value !== null),
    ),
    mean_projected_error: average(
      complete
        .map((item) => item.projected_error)
        .filter((value): value is number => value !== null),
    ),
    net_error_improvement: average(
      complete
        .map((item) => item.error_improvement)
        .filter((value): value is number => value !== null),
    ),
  };
}

function confidenceBandFor(value: number | null) {
  if (value === null) return null;
  return confidenceBandDefinitions.find(
    (band) => value >= band.min && value <= band.max,
  );
}

function summarizeDynamicGroups(
  observations: ConfidenceProjectionOutcomeObservation[],
  getter: (observation: ConfidenceProjectionOutcomeObservation) => string,
) {
  const keys = Array.from(new Set(observations.map(getter))).sort();
  return keys.map((key) =>
    summarizeGroup(key, key.replace(/_/g, " "), observations.filter((item) => getter(item) === key)),
  );
}

function summarizeCalibrationMetrics(
  observations: ConfidenceProjectionOutcomeObservation[],
): ConfidenceProjectionCalibrationMetrics {
  const complete = observations.filter((item) => item.completeness === "complete");
  const improvedCount = complete.filter((item) => item.comparison === "improved").length;
  const worsenedCount = complete.filter((item) => item.comparison === "worsened").length;
  const neutralCount = complete.filter((item) => item.comparison === "neutral").length;
  const deltas = complete
    .map((item) => item.confidence_delta)
    .filter((value): value is number => value !== null);

  return {
    observed_count: observations.length,
    complete_count: complete.length,
    insufficient_count: observations.length - complete.length,
    improved_count: improvedCount,
    worsened_count: worsenedCount,
    neutral_count: neutralCount,
    improved_rate: rate(improvedCount, complete.length),
    worsened_rate: rate(worsenedCount, complete.length),
    neutral_rate: rate(neutralCount, complete.length),
    mean_original_error: average(
      complete
        .map((item) => item.original_error)
        .filter((value): value is number => value !== null),
    ),
    mean_projected_error: average(
      complete
        .map((item) => item.projected_error)
        .filter((value): value is number => value !== null),
    ),
    net_error_improvement: average(
      complete
        .map((item) => item.error_improvement)
        .filter((value): value is number => value !== null),
    ),
    average_delta: average(deltas),
    raised_count: complete.filter((item) => item.delta_direction === "raised").length,
    lowered_count: complete.filter((item) => item.delta_direction === "lowered").length,
    unchanged_count: complete.filter((item) => item.delta_direction === "unchanged").length,
    overestimated_count: complete.filter(
      (item) =>
        item.projected_confidence !== null &&
        item.outcome_success_score !== null &&
        item.projected_confidence > item.outcome_success_score,
    ).length,
    underestimated_count: complete.filter(
      (item) =>
        item.projected_confidence !== null &&
        item.outcome_success_score !== null &&
        item.projected_confidence < item.outcome_success_score,
    ).length,
    sample_quality: sampleQuality(complete.length),
    confidence_bands: confidenceBandDefinitions.map((band) =>
      summarizeGroup(
        band.key,
        band.label,
        observations.filter(
          (item) => confidenceBandFor(item.original_confidence)?.key === band.key,
        ),
      ),
    ),
    tiers: summarizeDynamicGroups(observations, (item) => item.tier || "unknown"),
    windows: summarizeDynamicGroups(observations, (item) => item.window || "unknown"),
    setup_types: summarizeDynamicGroups(
      observations,
      (item) => item.setup_type || "unknown",
    ),
    explanation_categories: summarizeDynamicGroups(
      observations,
      (item) => item.explanation_category || "unknown",
    ),
  };
}

function sampleQuality(completeCount: number): ConfidenceProjectionSampleQuality {
  if (completeCount >= 100) return "strong_observation_sample";
  if (completeCount >= 30) return "usable_observation_sample";
  if (completeCount >= 10) return "early_directional_signal";
  return "insufficient_sample";
}

function recommendationLevelIdentity(
  observation: ConfidenceProjectionOutcomeObservation,
) {
  return (
    observation.stable_identity_key ??
    `unresolved:${observation.join_source}:${observation.ticker}:${observation.timestamp ?? "missing_timestamp"}:${observation.horizon}`
  );
}

function horizonPriorityIndex(horizon: string) {
  const index = recommendationLevelHorizonPriority.indexOf(
    horizon as (typeof recommendationLevelHorizonPriority)[number],
  );
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

function isSupportedRecommendationHorizon(
  observation: ConfidenceProjectionOutcomeObservation,
) {
  return supportedRecommendationLevelHorizons.has(observation.horizon);
}

function terminalCategory(observation: ConfidenceProjectionOutcomeObservation) {
  if (
    observation.target_reached === true ||
    observation.outcome_status === "target_hit" ||
    observation.outcome_status === "target_before_stop"
  ) {
    return "target" as const;
  }
  if (
    observation.stop_reached === true ||
    observation.outcome_status === "stop_hit" ||
    observation.outcome_status === "stop_before_target"
  ) {
    return "stop" as const;
  }
  if (
    observation.outcome_status === "entry_not_triggered" ||
    observation.outcome_status === "neither_hit"
  ) {
    return "non_terminal_failure" as const;
  }
  return "other" as const;
}

function horizonSequenceStatus(
  completeSupported: ConfidenceProjectionOutcomeObservation[],
): {
  status: ConfidenceProjectionHorizonSequenceStatus;
  conflictReasons: string[];
} {
  if (completeSupported.length === 0) {
    return {
      status: "insufficient_horizon_sequence",
      conflictReasons: ["no_complete_supported_horizon"],
    };
  }

  const categories = new Set(completeSupported.map(terminalCategory));
  const statuses = new Set(completeSupported.map((item) => item.outcome_status));
  const confidencePairs = new Set(
    completeSupported.map(
      (item) => `${item.original_confidence ?? "missing"}:${item.projected_confidence ?? "missing"}`,
    ),
  );
  const conflictReasons: string[] = [];

  if (categories.has("target") && categories.has("stop")) {
    conflictReasons.push("target_stop_conflict");
  }
  if (confidencePairs.size > 1) {
    conflictReasons.push("confidence_differs_across_horizons");
  }

  if (conflictReasons.length > 0) {
    return {
      status: "conflicting_horizon_sequence",
      conflictReasons,
    };
  }

  if (statuses.size === 1) {
    return {
      status: "stable_horizon_sequence",
      conflictReasons: [],
    };
  }

  return {
    status: "evolving_valid_horizon_sequence",
    conflictReasons: [],
  };
}

function representativeInsufficientObservation(
  observations: ConfidenceProjectionOutcomeObservation[],
) {
  return [...observations].sort((first, second) => {
    const firstHorizon = horizonPriorityIndex(first.horizon);
    const secondHorizon = horizonPriorityIndex(second.horizon);
    return (
      firstHorizon - secondHorizon ||
      (second.timestamp ?? "").localeCompare(first.timestamp ?? "") ||
      first.horizon.localeCompare(second.horizon)
    );
  })[0];
}

function buildRecommendationLevelSelection(
  horizonObservations: ConfidenceProjectionOutcomeObservation[],
): {
  observations: ConfidenceProjectionOutcomeObservation[];
  diagnostics: ConfidenceProjectionRecommendationLevelDeduplication;
} {
  const byIdentity = new Map<string, ConfidenceProjectionOutcomeObservation[]>();
  for (const observation of horizonObservations) {
    const key = recommendationLevelIdentity(observation);
    byIdentity.set(key, [...(byIdentity.get(key) ?? []), observation]);
  }

  const selected: ConfidenceProjectionOutcomeObservation[] = [];
  const selectedHorizonBreakdown: Record<string, number> = {};
  const conflictReasons: Record<string, number> = {};
  let identitiesWithOneHorizon = 0;
  let identitiesWithMultipleHorizons = 0;
  let identitiesDeduplicated = 0;
  let identitiesBlockedByHorizonConflict = 0;
  let excludedHorizonObservationCount = 0;
  let blockedHorizonObservationCount = 0;
  let stableHorizonSequenceCount = 0;
  let evolvingValidHorizonSequenceCount = 0;
  let conflictingHorizonSequenceCount = 0;
  let insufficientHorizonSequenceCount = 0;

  for (const observations of byIdentity.values()) {
    const uniqueHorizons = new Set(observations.map((item) => item.horizon));
    if (uniqueHorizons.size <= 1) {
      identitiesWithOneHorizon += 1;
    } else {
      identitiesWithMultipleHorizons += 1;
    }

    const completeSupported = observations
      .filter(
        (item) =>
          item.completeness === "complete" &&
          isSupportedRecommendationHorizon(item),
      )
      .sort(
        (first, second) =>
          horizonPriorityIndex(first.horizon) - horizonPriorityIndex(second.horizon),
      );
    const sequence = horizonSequenceStatus(completeSupported);
    if (sequence.status === "stable_horizon_sequence") {
      stableHorizonSequenceCount += 1;
    }
    if (sequence.status === "evolving_valid_horizon_sequence") {
      evolvingValidHorizonSequenceCount += 1;
    }
    if (sequence.status === "conflicting_horizon_sequence") {
      conflictingHorizonSequenceCount += 1;
      identitiesBlockedByHorizonConflict += 1;
      blockedHorizonObservationCount += observations.length;
      for (const reason of sequence.conflictReasons) {
        conflictReasons[reason] = (conflictReasons[reason] ?? 0) + 1;
      }
      continue;
    }
    if (sequence.status === "insufficient_horizon_sequence") {
      insufficientHorizonSequenceCount += 1;
    }

    const chosen =
      completeSupported[0] ?? representativeInsufficientObservation(observations);
    if (!chosen) continue;
    selected.push(chosen);
    selectedHorizonBreakdown[chosen.horizon] =
      (selectedHorizonBreakdown[chosen.horizon] ?? 0) + 1;
    excludedHorizonObservationCount += Math.max(0, observations.length - 1);
    if (observations.length > 1) identitiesDeduplicated += 1;
  }

  return {
    observations: selected,
    diagnostics: {
      review_mode: "recommendation_level",
      selection_policy: "longest_complete_supported_horizon",
      supported_horizon_priority: ["60m", "30m", "15m"],
      identity_fields: {
        primary: "recommendation_id",
        fallback: ["snapshot_fingerprint", "snapshot_id"],
        horizon_excluded_from_primary_identity: true,
      },
      unique_recommendation_identities: byIdentity.size,
      identities_with_one_horizon: identitiesWithOneHorizon,
      identities_with_multiple_horizons: identitiesWithMultipleHorizons,
      identities_deduplicated: identitiesDeduplicated,
      identities_blocked_by_horizon_conflict: identitiesBlockedByHorizonConflict,
      selected_15m_count: selectedHorizonBreakdown["15m"] ?? 0,
      selected_30m_count: selectedHorizonBreakdown["30m"] ?? 0,
      selected_60m_count: selectedHorizonBreakdown["60m"] ?? 0,
      deduplicated_outcome_row_count: horizonObservations.length - selected.length,
      excluded_horizon_observation_count: excludedHorizonObservationCount,
      blocked_horizon_observation_count: blockedHorizonObservationCount,
      stable_horizon_sequence_count: stableHorizonSequenceCount,
      evolving_valid_horizon_sequence_count: evolvingValidHorizonSequenceCount,
      conflicting_horizon_sequence_count: conflictingHorizonSequenceCount,
      insufficient_horizon_sequence_count: insufficientHorizonSequenceCount,
      selected_horizon_breakdown: selectedHorizonBreakdown,
      conflict_reasons: conflictReasons,
      copy: {
        primary_calibration:
          "Primary calibration counts each recommendation/snapshot identity once, because original and projected confidence are produced once per recommendation.",
        selection_policy:
          "Select the longest complete supported horizon in priority order: 60m, then 30m, then 15m. Do not average horizons.",
        conflict_policy:
          "Block recommendation-level selection when complete horizons contain target/stop conflicts or confidence differs across horizons.",
      },
    },
  };
}

function signalConfidence(
  completeCount: number,
): ConfidenceProjectionSignalConfidence {
  if (completeCount >= 30) return "meaningful_signal";
  if (completeCount >= 10) return "early_usable_signal";
  if (completeCount >= 5) return "weak_directional_signal";
  return "insufficient";
}

function emptyCalibrationSignal(
  recommendedNextExperiment = "Continue collecting completed projection observations before changing calibration.",
): ConfidenceProjectionCalibrationSignal {
  return {
    status: "insufficient",
    subgroup_type: "none",
    subgroup_key: "none",
    subgroup_label: "No sufficient subgroup",
    sample_count: 0,
    net_error_improvement: null,
    mean_original_error: null,
    mean_projected_error: null,
    improved_count: 0,
    worsened_count: 0,
    neutral_count: 0,
    direction: "insufficient",
    confidence_in_conclusion: "insufficient",
    recommended_next_experiment: recommendedNextExperiment,
    rejection_reason: `No subgroup reached the ${minimumSignalObservations}-observation minimum.`,
  };
}

function signalFromGroup(
  subgroupType: ConfidenceProjectionSubgroupType,
  group: ConfidenceProjectionReviewGroup,
): ConfidenceProjectionCalibrationSignal {
  const net = group.net_error_improvement;
  const direction =
    net === null
      ? "insufficient"
      : net > 0
        ? "helps"
        : net < 0
          ? "hurts"
          : "neutral";
  const confidence = signalConfidence(group.complete_count);
  const status =
    group.complete_count >= minimumSignalObservations && net !== null
      ? "selected"
      : "insufficient";

  return {
    status,
    subgroup_type: subgroupType,
    subgroup_key: group.key,
    subgroup_label: group.label,
    sample_count: group.complete_count,
    net_error_improvement: net,
    mean_original_error: group.mean_original_error,
    mean_projected_error: group.mean_projected_error,
    improved_count: group.improved_count,
    worsened_count: group.worsened_count,
    neutral_count: group.neutral_count,
    direction,
    confidence_in_conclusion: confidence,
    recommended_next_experiment:
      direction === "hurts"
        ? `Reduce or neutralize projection adjustments for ${group.label} and observe the next completed sample.`
        : direction === "helps"
          ? `Preserve projection for ${group.label} and test whether a slightly stronger adjustment remains observation-only positive.`
          : `Keep ${group.label} unchanged until a directional signal appears.`,
    rejection_reason:
      status === "selected"
        ? null
        : `Subgroup has ${group.complete_count} complete observations; minimum is ${minimumSignalObservations}.`,
  };
}

function signalSortPriority(signal: ConfidenceProjectionCalibrationSignal) {
  const typeIndex = signalGroupTypePriority.indexOf(
    signal.subgroup_type as ConfidenceProjectionSubgroupType,
  );
  return typeIndex === -1 ? signalGroupTypePriority.length : typeIndex;
}

function sortPositiveSignals(
  first: ConfidenceProjectionCalibrationSignal,
  second: ConfidenceProjectionCalibrationSignal,
) {
  return (
    (second.net_error_improvement ?? Number.NEGATIVE_INFINITY) -
      (first.net_error_improvement ?? Number.NEGATIVE_INFINITY) ||
    second.sample_count - first.sample_count ||
    signalSortPriority(first) - signalSortPriority(second) ||
    first.subgroup_key.localeCompare(second.subgroup_key)
  );
}

function sortNegativeSignals(
  first: ConfidenceProjectionCalibrationSignal,
  second: ConfidenceProjectionCalibrationSignal,
) {
  return (
    (first.net_error_improvement ?? Number.POSITIVE_INFINITY) -
      (second.net_error_improvement ?? Number.POSITIVE_INFINITY) ||
    second.sample_count - first.sample_count ||
    signalSortPriority(first) - signalSortPriority(second) ||
    first.subgroup_key.localeCompare(second.subgroup_key)
  );
}

function groupsBy(
  observations: ConfidenceProjectionOutcomeObservation[],
  subgroupType: ConfidenceProjectionSubgroupType,
  getter: (observation: ConfidenceProjectionOutcomeObservation) => string,
) {
  const keys = Array.from(new Set(observations.map(getter))).sort();
  return keys.map((key) =>
    signalFromGroup(
      subgroupType,
      summarizeGroup(
        key,
        key.replace(/_/g, " "),
        observations.filter((item) => getter(item) === key),
      ),
    ),
  );
}

function signalCandidates(observations: ConfidenceProjectionOutcomeObservation[]) {
  return [
    ...confidenceBandDefinitions.map((band) =>
      signalFromGroup(
        "confidence_band",
        summarizeGroup(
          band.key,
          band.label,
          observations.filter(
            (item) => confidenceBandFor(item.original_confidence)?.key === band.key,
          ),
        ),
      ),
    ),
    ...groupsBy(observations, "recommendation_tier", (item) => item.tier || "unknown"),
    ...groupsBy(observations, "trading_window", (item) => item.window || "unknown"),
    ...groupsBy(
      observations,
      "projection_delta_direction",
      (item) => item.delta_direction || "unknown",
    ),
    ...groupsBy(
      observations,
      "projection_explanation_category",
      (item) => item.explanation_category || "unknown",
    ),
    ...groupsBy(observations, "setup_type", (item) => item.setup_type || "unknown"),
  ];
}

function recommendationCandidateFor(
  positive: ConfidenceProjectionCalibrationSignal,
  negative: ConfidenceProjectionCalibrationSignal,
) {
  const positiveNet = positive.net_error_improvement ?? 0;
  const negativeNetMagnitude = Math.abs(negative.net_error_improvement ?? 0);

  if (positive.status !== "selected" && negative.status !== "selected") {
    return "preserve current behavior because evidence is insufficient";
  }

  if (
    negative.status === "selected" &&
    (positive.status !== "selected" || negativeNetMagnitude >= positiveNet)
  ) {
    return `reduce or neutralize projection adjustments for ${negative.subgroup_label}`;
  }

  return `preserve and observe stronger upward projection for ${positive.subgroup_label}`;
}

function selectedSignalFor(
  positive: ConfidenceProjectionCalibrationSignal,
  negative: ConfidenceProjectionCalibrationSignal,
) {
  const positiveNet = positive.net_error_improvement ?? 0;
  const negativeNetMagnitude = Math.abs(negative.net_error_improvement ?? 0);

  if (positive.status !== "selected" && negative.status !== "selected") {
    return emptyCalibrationSignal();
  }

  if (
    negative.status === "selected" &&
    (positive.status !== "selected" || negativeNetMagnitude >= positiveNet)
  ) {
    return negative;
  }

  return positive;
}

export function buildFirstCalibrationSignalReview(
  observations: ConfidenceProjectionOutcomeObservation[],
): ConfidenceProjectionCalibrationSignalReview {
  const sufficient = signalCandidates(observations).filter(
    (signal) =>
      signal.status === "selected" &&
      signal.sample_count >= minimumSignalObservations &&
      signal.net_error_improvement !== null,
  );
  const positive =
    sufficient
      .filter((signal) => (signal.net_error_improvement ?? 0) > 0)
      .sort(sortPositiveSignals)[0] ?? emptyCalibrationSignal();
  const negative =
    sufficient
      .filter((signal) => (signal.net_error_improvement ?? 0) < 0)
      .sort(sortNegativeSignals)[0] ?? emptyCalibrationSignal();
  const selected = selectedSignalFor(positive, negative);

  return {
    minimum_subgroup_observations: minimumSignalObservations,
    threshold_interpretation: {
      insufficient: "fewer than 5 subgroup observations",
      weak_directional_signal: "5-9 subgroup observations",
      early_usable_signal: "10-29 subgroup observations",
      meaningful_signal: "30+ subgroup observations",
    },
    strongest_positive_subgroup: positive,
    strongest_negative_subgroup: negative,
    selected_signal: selected,
    recommended_calibration_adjustment_candidate:
      recommendationCandidateFor(positive, negative),
  };
}

function buildObservationCompleteness(
  observations: ConfidenceProjectionOutcomeObservation[],
): ConfidenceProjectionObservationCompleteness {
  const insufficient = observations.filter(
    (item) => item.completeness === "insufficient_data",
  );
  const complete = observations.length - insufficient.length;
  const reasonCounts = insufficiencyReasons
    .map((reason) => {
      const count = insufficient.filter((item) =>
        item.insufficient_reasons.includes(reason),
      ).length;
      return {
        reason,
        category: reasonCategory[reason],
        count,
        rate: rate(count, insufficient.length),
      };
    })
    .sort(
      (first, second) =>
        second.count - first.count || first.reason.localeCompare(second.reason),
    );
  const categoryCounts = insufficiencyCategories.map((category) => {
    const count = insufficient.filter((item) =>
      item.insufficient_reasons.some(
        (reason) => reasonCategory[reason] === category,
      ),
    ).length;
    return { category, count, rate: rate(count, insufficient.length) };
  });
  const nonZeroReasons = reasonCounts.filter((item) => item.count > 0);
  const projectionDerivableCount = observations.filter(
    (item) => item.projected_confidence_source !== "unavailable",
  ).length;
  const successfulJoinCount = observations.filter(
    (item) =>
      item.join_source !== "missing" &&
      item.join_source !== "ambiguous" &&
      !item.insufficient_reasons.includes("missing_snapshot_match") &&
      !item.insufficient_reasons.includes("ambiguous_join"),
  ).length;
  const completedOutcomeCount = observations.filter(
    (item) =>
      item.outcome_success_score !== null &&
      !item.insufficient_reasons.includes("missing_completed_outcome") &&
      !item.insufficient_reasons.includes("unsupported_outcome_status"),
  ).length;
  const snapshotContractCount = observations.filter(
    (item) =>
      item.snapshot_contract_version === confidenceProjectionObservationContractVersion,
  ).length;
  const outcomeContractCount = observations.filter(
    (item) =>
      item.outcome_contract_version === confidenceProjectionObservationContractVersion,
  ).length;
  const contractJoinReadyCount = observations.filter(
    (item) =>
      item.snapshot_contract_version === confidenceProjectionObservationContractVersion &&
      item.outcome_contract_version === confidenceProjectionObservationContractVersion &&
      item.recommendation_id !== null &&
      item.snapshot_id !== null &&
      item.snapshot_fingerprint !== null,
  ).length;

  return {
    eligible_observations: observations.length,
    complete_observations: complete,
    insufficient_observations: insufficient.length,
    completeness_rate: rate(complete, observations.length),
    projection_derivable_count: projectionDerivableCount,
    projection_derivable_rate: rate(projectionDerivableCount, observations.length),
    successful_join_count: successfulJoinCount,
    successful_join_rate: rate(successfulJoinCount, observations.length),
    completed_outcome_count: completedOutcomeCount,
    completed_outcome_rate: rate(completedOutcomeCount, observations.length),
    reason_counts: reasonCounts,
    category_counts: categoryCounts,
    most_common_blocker: nonZeroReasons[0] ?? null,
    second_most_common_blocker: nonZeroReasons[1] ?? null,
    future_contract_coverage: {
      contract_version: confidenceProjectionObservationContractVersion,
      migration_required: false,
      snapshot_contract_count: snapshotContractCount,
      outcome_contract_count: outcomeContractCount,
      contract_join_ready_count: contractJoinReadyCount,
      expected_future_completeness: "complete_when_outcome_evaluated",
      fields_captured_at_snapshot_time: [
        "recommendation_id",
        "snapshot_id",
        "snapshot_fingerprint",
        "original_confidence",
        "projected_confidence",
        "projection_delta",
        "projection_source",
        "calibration_status",
        "explanation_category",
        "ticker",
        "side",
        "recommended_at",
        "trading_window",
        "recommendation_tier",
        "setup_type",
        "entry",
        "stop",
        "target",
        "risk_per_share",
        "reward_per_share",
        "planned_risk_reward",
      ],
      fields_captured_at_outcome_time: [
        "evaluation_status",
        "completed_outcome_classification",
        "binary_success_score",
        "target_reached",
        "stop_reached",
        "realized_r",
        "evaluated_at",
        "horizon",
        "data_completeness",
      ],
      join_identifiers_retained: [
        "snapshot_fingerprint",
        "snapshot_id",
        "recommendation_id",
      ],
    },
  };
}

function buildRecommendationObservationCompleteness(
  observations: ConfidenceProjectionOutcomeObservation[],
): ConfidenceProjectionRecommendationObservationCompleteness {
  const completeRecommendations = observations.filter(
    (item) => item.completeness === "complete",
  ).length;
  const optionalMetadataGaps: Record<
    ConfidenceProjectionOptionalMetadataGap,
    number
  > = {
    missing_setup_type: 0,
    missing_recommendation_tier: 0,
    missing_trading_window: 0,
    missing_explanation_category: 0,
    missing_trade_plan_metadata: 0,
  };
  let optionalMetadataGapCount = 0;

  for (const observation of observations) {
    if (observation.optional_metadata_gaps.length > 0) {
      optionalMetadataGapCount += 1;
    }
    for (const gap of observation.optional_metadata_gaps) {
      optionalMetadataGaps[gap] += 1;
    }
  }

  return {
    complete_recommendations: completeRecommendations,
    identities_with_explicit_horizons: observations.filter(
      (item) =>
        item.stable_identity_key !== null &&
        supportedRecommendationLevelHorizons.has(item.horizon),
    ).length,
    missing_identity_count: observations.filter(
      (item) => item.stable_identity_key === null,
    ).length,
    missing_confidence_count: observations.filter(
      (item) =>
        item.original_confidence === null ||
        item.insufficient_reasons.includes("missing_original_confidence") ||
        item.insufficient_reasons.includes("invalid_confidence"),
    ).length,
    missing_projection_count: observations.filter(
      (item) => item.projected_confidence_source === "unavailable",
    ).length,
    optional_metadata_gap_count: optionalMetadataGapCount,
    unrecoverable_observations: observations.filter(
      (item) => item.completeness === "insufficient_data",
    ).length,
    recovered_by_identity_normalization: observations.filter(
      (item) =>
        item.completeness === "complete" &&
        item.recommendation_id === null &&
        (item.stable_identity_source === "snapshot_fingerprint" ||
          item.stable_identity_source === "snapshot_id"),
    ).length,
    recovered_by_confidence_lookup: observations.filter(
      (item) =>
        item.completeness === "complete" &&
        (item.original_confidence_source === "snapshot_payload" ||
          item.original_confidence_source === "contract_v1"),
    ).length,
    recovered_by_deterministic_projection_recomputation: observations.filter(
      (item) =>
        item.completeness === "complete" &&
        item.projected_confidence_source ===
          "deterministically_recomputed_projection",
    ).length,
    optional_metadata_gaps: optionalMetadataGaps,
    core_requirements: [
      "stable recommendation or snapshot identity",
      "original snapshot-time confidence",
      "snapshot-time projected confidence or deterministic projection inputs",
      "complete official binary outcome",
      "explicit supported horizon",
    ],
    optional_metadata_fields: [
      "setup type",
      "recommendation tier",
      "trading window",
      "projection explanation category",
      "trade-plan metadata",
    ],
    copy: {
      summary:
        "Recommendation-level calibration only requires stable identity, confidence, projection, explicit horizon, and official completed outcome evidence.",
      optional_metadata_policy:
        "Missing setup, tier, window, explanation, or trade-plan metadata is retained as an optional subgroup gap and labeled unknown; it does not block core calibration.",
    },
  };
}

function buildOutcomeMetadataResolutionSummary(
  outcomes: RecommendationOutcome[],
): ConfidenceProjectionOutcomeMetadataResolutionSummary {
  const summary: ConfidenceProjectionOutcomeMetadataResolutionSummary = {
    source_from_top_level: 0,
    source_from_payload_json: 0,
    source_from_contract_v1: 0,
    source_unavailable: 0,
    data_completeness_from_top_level: 0,
    data_completeness_from_payload_json: 0,
    data_completeness_from_contract_v1: 0,
    data_completeness_unavailable: 0,
    metadata_conflicts: 0,
    entry_not_triggered_completed_from_normalized_metadata: 0,
  };

  for (const outcome of outcomes) {
    const metadata = normalizeConfidenceProjectionOutcomeMetadata(outcome);
    if (metadata.source_read_from === "top_level") summary.source_from_top_level += 1;
    if (metadata.source_read_from === "payload_json") summary.source_from_payload_json += 1;
    if (metadata.source_read_from === "contract_v1") summary.source_from_contract_v1 += 1;
    if (metadata.source_read_from === "unavailable") summary.source_unavailable += 1;
    if (metadata.data_completeness_read_from === "top_level") {
      summary.data_completeness_from_top_level += 1;
    }
    if (metadata.data_completeness_read_from === "payload_json") {
      summary.data_completeness_from_payload_json += 1;
    }
    if (metadata.data_completeness_read_from === "contract_v1") {
      summary.data_completeness_from_contract_v1 += 1;
    }
    if (metadata.data_completeness_read_from === "unavailable") {
      summary.data_completeness_unavailable += 1;
    }
    if (metadata.conflict_reasons.length > 0) summary.metadata_conflicts += 1;
    if (
      outcome.status === "entry_not_triggered" &&
      mapOutcomeToBinaryConfidenceScore(outcome) === 0 &&
      (metadata.source_read_from === "payload_json" ||
        metadata.data_completeness_read_from === "payload_json" ||
        metadata.source_read_from === "contract_v1" ||
        metadata.data_completeness_read_from === "contract_v1")
    ) {
      summary.entry_not_triggered_completed_from_normalized_metadata += 1;
    }
  }

  return summary;
}

export function buildConfidenceProjectionOutcomeReview(
  input: BuildInput,
): ConfidenceProjectionOutcomeReview {
  const indexes = buildSnapshotIndexes(input.snapshots);
  const dedupedOutcomes = dedupeOutcomes(input.outcomes);
  const horizonObservations = dedupedOutcomes.map((outcome) =>
    observationForOutcome(
      outcome,
      snapshotForOutcome(outcome, indexes),
      input.previewEnabled,
    ),
  );
  const recommendationLevelSelection =
    buildRecommendationLevelSelection(horizonObservations);
  const observations = recommendationLevelSelection.observations;
  const recommendationLevel = summarizeCalibrationMetrics(observations);
  const horizonLevelMetrics = summarizeCalibrationMetrics(horizonObservations);
  const horizonLevel: ConfidenceProjectionHorizonLevelDiagnostics = {
    ...horizonLevelMetrics,
    review_mode: "horizon_level",
    horizon_groups: summarizeDynamicGroups(
      horizonObservations,
      (item) => item.horizon || "unknown",
    ),
    copy: {
      diagnostic_only:
        "Diagnostic horizon-level calibration keeps every complete 15m, 30m, and 60m row separate. It is not the primary recommendation-level calibration result.",
    },
  };
  const firstObservedCalibrationSignal =
    buildFirstCalibrationSignalReview(observations);
  const observationCompleteness = buildObservationCompleteness(observations);
  const recommendationObservationCompleteness =
    buildRecommendationObservationCompleteness(observations);
  const outcomeMetadataResolution = buildOutcomeMetadataResolutionSummary(
    dedupedOutcomes,
  );

  return {
    status: horizonObservations.length > 0 ? "ready" : "no_observations",
    review_mode: "recommendation_level",
    observed_count: recommendationLevel.observed_count,
    complete_count: recommendationLevel.complete_count,
    insufficient_count: recommendationLevel.insufficient_count,
    improved_count: recommendationLevel.improved_count,
    worsened_count: recommendationLevel.worsened_count,
    neutral_count: recommendationLevel.neutral_count,
    improved_rate: recommendationLevel.improved_rate,
    worsened_rate: recommendationLevel.worsened_rate,
    neutral_rate: recommendationLevel.neutral_rate,
    mean_original_error: recommendationLevel.mean_original_error,
    mean_projected_error: recommendationLevel.mean_projected_error,
    net_error_improvement: recommendationLevel.net_error_improvement,
    average_delta: recommendationLevel.average_delta,
    raised_count: recommendationLevel.raised_count,
    lowered_count: recommendationLevel.lowered_count,
    unchanged_count: recommendationLevel.unchanged_count,
    overestimated_count: recommendationLevel.overestimated_count,
    underestimated_count: recommendationLevel.underestimated_count,
    sample_quality: recommendationLevel.sample_quality,
    confidence_bands: recommendationLevel.confidence_bands,
    tiers: recommendationLevel.tiers,
    windows: recommendationLevel.windows,
    setup_types: recommendationLevel.setup_types,
    explanation_categories: recommendationLevel.explanation_categories,
    recommendation_level: recommendationLevel,
    horizon_level: horizonLevel,
    recommendation_level_deduplication: recommendationLevelSelection.diagnostics,
    first_observed_calibration_signal: firstObservedCalibrationSignal,
    observation_completeness: observationCompleteness,
    recommendation_observation_completeness: recommendationObservationCompleteness,
    outcome_metadata_resolution: outcomeMetadataResolution,
    observations,
    copy: {
      data_source:
        "Existing recommendation snapshots joined to recommendation_outcomes by snapshot fingerprint, snapshot id, or recommendation id.",
      formula:
        "Binary completed outcome score maps successful outcomes to 100 and unsuccessful outcomes to 0; error improvement = abs(original - outcome) - abs(projected - outcome).",
      sample_quality:
        "Sample quality is insufficient under 10 complete observations, early at 10-29, usable at 30-99, and strong at 100+.",
      observation_only:
        "Read-only review only. Projection does not update ranking, scanner, publication, execution, Add Trade, risk, sizing, providers, learning writes, or persistence.",
    },
    no_effects: {
      ranking_affected: false,
      scanner_affected: false,
      publication_affected: false,
      execution_affected: false,
      add_trade_affected: false,
      risk_affected: false,
      sizing_affected: false,
      provider_called: false,
      supabase_write_executed: false,
      persistence_created: false,
      learning_write_executed: false,
    },
  };
}

export function confidenceProjectionOutcomeReviewJson(
  review: ConfidenceProjectionOutcomeReview,
) {
  return JSON.stringify(review, null, 2);
}
