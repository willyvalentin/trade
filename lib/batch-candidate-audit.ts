import type {
  CandidateBuildRejectionReason,
  SelectedCandidateBuildDiagnostic,
  SelectedToBuiltDropOffSummary,
} from "@/lib/recommendation-build-diagnostics";
import {
  normalizeCandidateBuildRejectionReason,
  summarizeSelectedCandidateBuildDiagnostics,
} from "@/lib/recommendation-build-diagnostics";

export type BatchCandidateAuditDropOffReason =
  | "below_publish_threshold"
  | "no_trade_candidate"
  | CandidateBuildRejectionReason
  | "incomplete_price_plan"
  | "missing_ticker"
  | "missing_side"
  | "missing_entry_stop_target"
  | "missing_recommended_at"
  | "persistence_skipped"
  | "persistence_failed"
  | "archived"
  | "hidden_primary_member"
  | "duplicate_snapshot_fingerprint"
  | "strict_batch_filter_excluded"
  | "malformed_snapshot_payload"
  | "missing_batch_fingerprint"
  | "unknown";

export type BatchCandidateAuditLineageItem = {
  scan_run_fingerprint: string | null;
  batch_fingerprint: string | null;
  recommendation_id: string | null;
  snapshot_fingerprint: string | null;
  ticker: string | null;
  candidate_source: string | null;
  universe_source: string | null;
  recommendation_build_path: string | null;
  publish_decision: string | null;
  publish_tier: string | null;
  visibility_status: string | null;
  archive_status: string | null;
  outcome_eligibility_status: string | null;
};

export type BatchCandidateAuditSummary = {
  summary_version: "1.0";
  summary_kind: "batch_candidate_to_snapshot_audit";
  generated_at: string;
  scan_run_fingerprint: string | null;
  batch_fingerprint: string | null;
  raw_candidates_count: number;
  ranked_candidates_count: number;
  selected_candidates_count: number;
  built_recommendations_count: number;
  published_recommendations_count: number;
  persisted_recommendation_rows_count: number;
  persisted_snapshot_rows_count: number;
  unique_snapshot_fingerprints_count: number;
  visible_grid_cards_count: number;
  hidden_archived_count: number;
  outcome_eligible_snapshot_count: number;
  outcome_ineligible_snapshot_count: number;
  expected_snapshot_count_from_scan: number;
  actual_snapshot_count_for_batch: number;
  missing_snapshot_count: number;
  missing_snapshot_reasons: Record<BatchCandidateAuditDropOffReason, number>;
  strict_batch_filter_excluded_count: number;
  drop_off_reasons: Record<BatchCandidateAuditDropOffReason, number>;
  selected_to_built_drop_off: SelectedToBuiltDropOffSummary | null;
  largest_drop_off_stage: string | null;
  largest_drop_off_count: number;
  batch_completeness: "complete" | "partial" | "sparse" | "empty" | "unknown";
  lineage: BatchCandidateAuditLineageItem[];
};

export type BatchCandidateAuditInput = {
  generatedAt?: Date | string | null;
  scanRunFingerprint?: string | null;
  batchFingerprint?: string | null;
  rawCandidatesCount?: number | null;
  rankedCandidatesCount?: number | null;
  selectedCandidatesCount?: number | null;
  builtRecommendationsCount?: number | null;
  publishedRecommendationsCount?: number | null;
  persistedRecommendationRowsCount?: number | null;
  persistedSnapshotRowsCount?: number | null;
  uniqueSnapshotFingerprintsCount?: number | null;
  visibleGridCardsCount?: number | null;
  hiddenArchivedCount?: number | null;
  outcomeEligibleSnapshotCount?: number | null;
  outcomeIneligibleSnapshotCount?: number | null;
  expectedSnapshotCountFromScan?: number | null;
  actualSnapshotCountForBatch?: number | null;
  strictBatchFilterExcludedCount?: number | null;
  incompletePricePlanCount?: number | null;
  missingSnapshotReasons?: Partial<Record<string, number>> | null;
  dropOffReasons?: Partial<Record<string, number>> | null;
  selectedCandidateBuildDiagnostics?: SelectedCandidateBuildDiagnostic[] | null;
  selectedToBuiltDropOff?: SelectedToBuiltDropOffSummary | null;
  lineage?: Partial<BatchCandidateAuditLineageItem>[] | null;
};

const emptyReasons = {
  below_publish_threshold: 0,
  no_trade_candidate: 0,
  built: 0,
  not_selected_by_ranking: 0,
  ranking_selected_but_not_qualified: 0,
  fallback_builder_limit_reached: 0,
  missing_fresh_reference_price: 0,
  scanner_cache_reference_too_old: 0,
  stale_reference_price: 0,
  future_reference_timestamp: 0,
  missing_reference_source: 0,
  missing_reference_timestamp: 0,
  invalid_risk_geometry: 0,
  weak_risk_reward: 0,
  sanitizer_rejected: 0,
  openai_no_trade: 0,
  openai_skipped_deterministic_fallback: 0,
  provider_data_unavailable: 0,
  stale_market_data: 0,
  unknown_build_rejection: 0,
  incomplete_price_plan: 0,
  missing_ticker: 0,
  missing_side: 0,
  missing_entry_stop_target: 0,
  missing_recommended_at: 0,
  persistence_skipped: 0,
  persistence_failed: 0,
  archived: 0,
  hidden_primary_member: 0,
  duplicate_snapshot_fingerprint: 0,
  strict_batch_filter_excluded: 0,
  malformed_snapshot_payload: 0,
  missing_batch_fingerprint: 0,
  unknown: 0,
} satisfies Record<BatchCandidateAuditDropOffReason, number>;

function numberValue(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : 0;
}

function textOrNull(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function normalizeReason(value: string): BatchCandidateAuditDropOffReason {
  const candidateReason = normalizeCandidateBuildRejectionReason(value);
  if (candidateReason !== "unknown_build_rejection" || value === "unknown_build_rejection") {
    return candidateReason;
  }

  if (
    value === "below_publish_threshold" ||
    value === "no_trade_candidate" ||
    value === "incomplete_price_plan" ||
    value === "missing_ticker" ||
    value === "missing_side" ||
    value === "missing_entry_stop_target" ||
    value === "missing_recommended_at" ||
    value === "persistence_skipped" ||
    value === "persistence_failed" ||
    value === "archived" ||
    value === "hidden_primary_member" ||
    value === "duplicate_snapshot_fingerprint" ||
    value === "strict_batch_filter_excluded" ||
    value === "malformed_snapshot_payload" ||
    value === "missing_batch_fingerprint"
  ) {
    return value;
  }

  if (
    value === "missing_entry" ||
    value === "missing_stop" ||
    value === "missing_target"
  ) {
    return "missing_entry_stop_target";
  }

  if (
    value === "missing_snapshot_fingerprint" ||
    value === "diagnostic_dry_run"
  ) {
    return "malformed_snapshot_payload";
  }

  if (value === "missing_batch_membership") {
    return "strict_batch_filter_excluded";
  }

  return "unknown";
}

function mergeReasons(
  target: Record<BatchCandidateAuditDropOffReason, number>,
  source: Partial<Record<string, number>> | null | undefined,
) {
  for (const [key, value] of Object.entries(source ?? {})) {
    const amount = numberValue(value);
    if (amount <= 0) continue;
    const reason = normalizeReason(key);
    target[reason] += amount;
  }
}

function addReason(
  target: Record<BatchCandidateAuditDropOffReason, number>,
  reason: BatchCandidateAuditDropOffReason,
  amount: number,
) {
  if (amount > 0) {
    target[reason] += amount;
  }
}

function getLargestDropOff(stages: Array<[string, number, number]>) {
  let largest: { stage: string | null; count: number } = {
    stage: null,
    count: 0,
  };

  for (const [stage, from, to] of stages) {
    const dropOff = Math.max(0, from - to);
    if (dropOff > largest.count) {
      largest = { stage, count: dropOff };
    }
  }

  return largest;
}

function getBatchCompleteness(input: {
  expected: number;
  actual: number;
  eligible: number;
  missing: number;
}) {
  if (input.expected === 0 && input.actual === 0 && input.eligible === 0) {
    return "empty" as const;
  }

  if (input.expected === 0) {
    return "unknown" as const;
  }

  if (input.missing <= 0 && input.eligible >= input.expected) {
    return "complete" as const;
  }

  if (input.eligible <= Math.max(1, Math.floor(input.expected * 0.25))) {
    return "sparse" as const;
  }

  return "partial" as const;
}

export function buildBatchCandidateAuditSummary(
  input: BatchCandidateAuditInput,
): BatchCandidateAuditSummary {
  const rawCandidates = numberValue(input.rawCandidatesCount);
  const rankedCandidates = numberValue(input.rankedCandidatesCount);
  const selectedCandidates = numberValue(input.selectedCandidatesCount);
  const builtRecommendations = numberValue(input.builtRecommendationsCount);
  const publishedRecommendations = numberValue(input.publishedRecommendationsCount);
  const persistedRecommendationRows = numberValue(
    input.persistedRecommendationRowsCount,
  );
  const persistedSnapshotRows = numberValue(input.persistedSnapshotRowsCount);
  const uniqueSnapshotFingerprints = numberValue(
    input.uniqueSnapshotFingerprintsCount,
  );
  const visibleGridCards = numberValue(input.visibleGridCardsCount);
  const hiddenArchived = numberValue(input.hiddenArchivedCount);
  const outcomeEligible = numberValue(input.outcomeEligibleSnapshotCount);
  const outcomeIneligible = numberValue(input.outcomeIneligibleSnapshotCount);
  const expectedSnapshots =
    numberValue(input.expectedSnapshotCountFromScan) ||
    publishedRecommendations ||
    persistedRecommendationRows ||
    builtRecommendations;
  const actualSnapshots =
    numberValue(input.actualSnapshotCountForBatch) || persistedSnapshotRows;
  const missingSnapshotCount = Math.max(0, expectedSnapshots - actualSnapshots);
  const strictBatchExcluded = numberValue(input.strictBatchFilterExcludedCount);
  const dropOffReasons = { ...emptyReasons };
  const missingSnapshotReasons = { ...emptyReasons };

  mergeReasons(dropOffReasons, input.dropOffReasons);
  mergeReasons(dropOffReasons, input.missingSnapshotReasons);
  mergeReasons(missingSnapshotReasons, input.missingSnapshotReasons);
  const selectedToBuiltDropOff =
    input.selectedToBuiltDropOff ??
    (input.selectedCandidateBuildDiagnostics
      ? summarizeSelectedCandidateBuildDiagnostics(
          input.selectedCandidateBuildDiagnostics,
        )
      : null);
  let explainedSelectedToBuiltDropOff = 0;

  for (const [reason, value] of Object.entries(
    selectedToBuiltDropOff?.rejection_counts ?? {},
  )) {
    const amount = numberValue(value);
    if (amount <= 0) continue;
    const normalized = normalizeReason(reason);
    addReason(dropOffReasons, normalized, amount);
    explainedSelectedToBuiltDropOff += amount;
  }

  addReason(
    dropOffReasons,
    "incomplete_price_plan",
    numberValue(input.incompletePricePlanCount),
  );
  addReason(
    dropOffReasons,
    "below_publish_threshold",
    Math.max(0, rawCandidates - Math.max(rankedCandidates, selectedCandidates)),
  );
  addReason(
    dropOffReasons,
    "below_publish_threshold",
    Math.max(0, rankedCandidates - selectedCandidates),
  );
  addReason(
    dropOffReasons,
    "no_trade_candidate",
    Math.max(
      0,
      selectedCandidates - builtRecommendations - explainedSelectedToBuiltDropOff,
    ),
  );
  addReason(
    dropOffReasons,
    "no_trade_candidate",
    Math.max(0, builtRecommendations - publishedRecommendations),
  );
  addReason(
    dropOffReasons,
    "persistence_failed",
    Math.max(0, publishedRecommendations - persistedRecommendationRows),
  );
  addReason(dropOffReasons, "persistence_failed", missingSnapshotCount);
  addReason(missingSnapshotReasons, "persistence_failed", missingSnapshotCount);
  addReason(
    dropOffReasons,
    "duplicate_snapshot_fingerprint",
    Math.max(0, persistedSnapshotRows - uniqueSnapshotFingerprints),
  );
  addReason(dropOffReasons, "archived", hiddenArchived);
  addReason(
    dropOffReasons,
    "hidden_primary_member",
    Math.max(0, uniqueSnapshotFingerprints - visibleGridCards - hiddenArchived),
  );
  addReason(dropOffReasons, "strict_batch_filter_excluded", strictBatchExcluded);

  const largest = getLargestDropOff([
    ["scanner_candidates_to_ranked", rawCandidates, rankedCandidates],
    ["ranked_to_selected", rankedCandidates, selectedCandidates],
    ["selected_to_built", selectedCandidates, builtRecommendations],
    ["built_to_published", builtRecommendations, publishedRecommendations],
    [
      "published_to_persisted_recommendations",
      publishedRecommendations,
      persistedRecommendationRows,
    ],
    [
      "persisted_recommendations_to_snapshots",
      persistedRecommendationRows,
      actualSnapshots,
    ],
    ["snapshots_to_unique_snapshots", persistedSnapshotRows, uniqueSnapshotFingerprints],
    ["unique_snapshots_to_visible_grid", uniqueSnapshotFingerprints, visibleGridCards],
    ["unique_snapshots_to_outcome_eligible", uniqueSnapshotFingerprints, outcomeEligible],
  ]);

  return {
    summary_version: "1.0",
    summary_kind: "batch_candidate_to_snapshot_audit",
    generated_at:
      input.generatedAt instanceof Date
        ? input.generatedAt.toISOString()
        : typeof input.generatedAt === "string"
          ? textOrNull(input.generatedAt) ?? new Date().toISOString()
          : new Date().toISOString(),
    scan_run_fingerprint: textOrNull(input.scanRunFingerprint),
    batch_fingerprint: textOrNull(input.batchFingerprint),
    raw_candidates_count: rawCandidates,
    ranked_candidates_count: rankedCandidates,
    selected_candidates_count: selectedCandidates,
    built_recommendations_count: builtRecommendations,
    published_recommendations_count: publishedRecommendations,
    persisted_recommendation_rows_count: persistedRecommendationRows,
    persisted_snapshot_rows_count: persistedSnapshotRows,
    unique_snapshot_fingerprints_count: uniqueSnapshotFingerprints,
    visible_grid_cards_count: visibleGridCards,
    hidden_archived_count: hiddenArchived,
    outcome_eligible_snapshot_count: outcomeEligible,
    outcome_ineligible_snapshot_count: outcomeIneligible,
    expected_snapshot_count_from_scan: expectedSnapshots,
    actual_snapshot_count_for_batch: actualSnapshots,
    missing_snapshot_count: missingSnapshotCount,
    missing_snapshot_reasons: missingSnapshotReasons,
    strict_batch_filter_excluded_count: strictBatchExcluded,
    drop_off_reasons: dropOffReasons,
    selected_to_built_drop_off: selectedToBuiltDropOff,
    largest_drop_off_stage: largest.stage,
    largest_drop_off_count: largest.count,
    batch_completeness: getBatchCompleteness({
      expected: expectedSnapshots,
      actual: actualSnapshots,
      eligible: outcomeEligible,
      missing: missingSnapshotCount,
    }),
    lineage: (input.lineage ?? []).map((item) => ({
      scan_run_fingerprint: textOrNull(item.scan_run_fingerprint),
      batch_fingerprint: textOrNull(item.batch_fingerprint),
      recommendation_id: textOrNull(item.recommendation_id),
      snapshot_fingerprint: textOrNull(item.snapshot_fingerprint),
      ticker: textOrNull(item.ticker),
      candidate_source: textOrNull(item.candidate_source),
      universe_source: textOrNull(item.universe_source),
      recommendation_build_path: textOrNull(item.recommendation_build_path),
      publish_decision: textOrNull(item.publish_decision),
      publish_tier: textOrNull(item.publish_tier),
      visibility_status: textOrNull(item.visibility_status),
      archive_status: textOrNull(item.archive_status),
      outcome_eligibility_status: textOrNull(item.outcome_eligibility_status),
    })),
  };
}
