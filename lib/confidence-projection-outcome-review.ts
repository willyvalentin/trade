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

export type ConfidenceProjectionInsufficiencyReason =
  | "missing_snapshot_match"
  | "missing_outcome_match"
  | "missing_original_confidence"
  | "missing_projected_confidence"
  | "missing_completed_outcome"
  | "unsupported_outcome_status"
  | "missing_recommendation_id"
  | "missing_snapshot_fingerprint"
  | "ambiguous_join"
  | "invalid_confidence"
  | "missing_required_setup_metadata"
  | "projection_not_derivable";

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

export type ConfidenceProjectionOutcomeObservation = {
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

export type ConfidenceProjectionOutcomeReview = {
  status: "ready" | "no_observations";
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
  explanation_categories: ConfidenceProjectionReviewGroup[];
  first_observed_calibration_signal: ConfidenceProjectionCalibrationSignalReview;
  observation_completeness: ConfidenceProjectionObservationCompleteness;
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
  "missing_recommendation_id",
  "missing_snapshot_fingerprint",
  "ambiguous_join",
  "invalid_confidence",
  "missing_required_setup_metadata",
  "projection_not_derivable",
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
  missing_recommendation_id: "join_related",
  missing_snapshot_fingerprint: "join_related",
  ambiguous_join: "join_related",
  invalid_confidence: "metadata_related",
  missing_required_setup_metadata: "metadata_related",
  projection_not_derivable: "projection_related",
};

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

function clampConfidence(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

function confidenceFromPayload(payload: Record<string, unknown> | null): number | null {
  if (!payload) return null;
  const contract = observationContractFromPayload(payload);
  const snapshotTimeConfidence = objectFromContract(
    contract,
    "snapshot_time_confidence",
  );
  const recommendation = objectValue(payload.recommendation);
  const metadata = objectValue(payload.metadata);
  const confidenceMetadata = objectValue(payload.confidence_metadata);

  return (
    numberValue(snapshotTimeConfidence?.original_confidence) ??
    numberValue(payload.confidence_score) ??
    numberValue(payload.confidence) ??
    numberValue(payload.score) ??
    numberValue(recommendation?.confidence_score) ??
    numberValue(recommendation?.confidence) ??
    numberValue(metadata?.confidence_score) ??
    numberValue(confidenceMetadata?.score) ??
    null
  );
}

function confidenceFromSnapshot(snapshot: RecommendationSnapshot | null) {
  const value =
    numberValue(snapshot?.confidence) ??
    numberValue(snapshot?.score) ??
    confidenceFromPayload(snapshot?.payload_json ?? null);

  return value === null ? null : clampConfidence(value);
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
    | "target_hit"
    | "stop_hit"
    | "first_terminal_event"
    | "eod_r"
    | "current_r"
    | "data_completeness"
    | "source"
  >,
): 0 | 100 | null {
  return classifyConfidenceProjectionOutcomeCompletion({
    ...outcome,
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

function hasRequiredSetupMetadata({
  setupType,
  tier,
  window,
}: {
  setupType: string;
  tier: string;
  window: string;
}) {
  const normalizedSetupType = setupType.trim().toLowerCase();
  const normalizedTier = tier.trim().toLowerCase();
  const normalizedWindow = window.trim().toLowerCase();

  return (
    normalizedSetupType.length > 0 &&
    normalizedSetupType !== "unknown" &&
    normalizedTier.length > 0 &&
    normalizedTier !== "unknown" &&
    normalizedWindow.length > 0 &&
    normalizedWindow !== "unknown"
  );
}

function unsupportedOutcomeStatus(outcome: RecommendationOutcome) {
  const completion = classifyConfidenceProjectionOutcomeCompletion(outcome);
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
  const originalConfidence = confidenceFromSnapshot(snapshot);
  const setupType = setupTypeFromSnapshot(snapshot);
  const tier = tierFromSnapshot(snapshot);
  const window = windowFrom(outcome, snapshot);
  const storedProjectedConfidence = storedProjectedConfidenceFromPayload(
    snapshot?.payload_json ?? null,
  );
  const preview = buildConfidenceProjectionObservationPreview({
    previewEnabled,
    confidenceScore: originalConfidence,
    direction: snapshot?.side ?? outcome.side,
    setupType,
    ticker: snapshot?.ticker ?? outcome.ticker,
  });
  const recomputedProjectedConfidence =
    preview.proposed_preview_confidence_basis_points === null
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
  const comparison = compareConfidenceProjectionCalibration({
    originalConfidence,
    projectedConfidence,
    outcomeScore,
  });
  const insufficientReasons: ConfidenceProjectionInsufficiencyReason[] = [
    ...join.reasons,
  ];

  if (!outcome) addReason(insufficientReasons, "missing_outcome_match");
  if (!outcome.recommendation_id) {
    addReason(insufficientReasons, "missing_recommendation_id");
  }
  if (!outcome.snapshot_fingerprint) {
    addReason(insufficientReasons, "missing_snapshot_fingerprint");
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
  if (!hasRequiredSetupMetadata({ setupType, tier, window })) {
    addReason(insufficientReasons, "missing_required_setup_metadata");
  }

  return {
    recommendation_id: outcome.recommendation_id,
    snapshot_fingerprint: outcome.snapshot_fingerprint,
    snapshot_id: outcome.snapshot_id,
    ticker: snapshot?.ticker ?? outcome.ticker ?? "unknown",
    timestamp: snapshot?.recommended_at ?? outcome.recommended_at,
    window,
    tier,
    setup_type: setupType,
    horizon: outcome.horizon,
    original_confidence: originalConfidence,
    projected_confidence: projectedConfidence,
    projected_confidence_source: projectedConfidenceSource,
    confidence_delta: delta,
    delta_direction: deltaDirection(delta),
    explanation_category: explanationCategory(setupType),
    calibration_status:
      calibrationStatusFromSnapshotContract(snapshot) ??
      preview.calibration_status ??
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

function sampleQuality(completeCount: number): ConfidenceProjectionSampleQuality {
  if (completeCount >= 100) return "strong_observation_sample";
  if (completeCount >= 30) return "usable_observation_sample";
  if (completeCount >= 10) return "early_directional_signal";
  return "insufficient_sample";
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

export function buildConfidenceProjectionOutcomeReview(
  input: BuildInput,
): ConfidenceProjectionOutcomeReview {
  const indexes = buildSnapshotIndexes(input.snapshots);
  const observations = dedupeOutcomes(input.outcomes).map((outcome) =>
    observationForOutcome(
      outcome,
      snapshotForOutcome(outcome, indexes),
      input.previewEnabled,
    ),
  );
  const complete = observations.filter((item) => item.completeness === "complete");
  const improvedCount = complete.filter((item) => item.comparison === "improved").length;
  const worsenedCount = complete.filter((item) => item.comparison === "worsened").length;
  const neutralCount = complete.filter((item) => item.comparison === "neutral").length;
  const deltas = complete
    .map((item) => item.confidence_delta)
    .filter((value): value is number => value !== null);
  const firstObservedCalibrationSignal =
    buildFirstCalibrationSignalReview(observations);
  const observationCompleteness = buildObservationCompleteness(observations);

  return {
    status: observations.length > 0 ? "ready" : "no_observations",
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
    explanation_categories: summarizeDynamicGroups(
      observations,
      (item) => item.explanation_category || "unknown",
    ),
    first_observed_calibration_signal: firstObservedCalibrationSignal,
    observation_completeness: observationCompleteness,
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
