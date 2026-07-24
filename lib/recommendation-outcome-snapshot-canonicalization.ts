import { shouldIncludeLearningAccelerationOutcomeSample } from "@/lib/learning-acceleration-mode";
import { resolveRecommendationOutcomeSide } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";

export type OutcomeSnapshotCanonicalizationDiagnostics = {
  unique_snapshot_fingerprints_count: number;
  duplicate_snapshot_rows: number;
  duplicate_snapshot_rows_ignored_count: number;
  hidden_archived_duplicate_rows_ignored_count: number;
  visible_duplicate_rows_ignored_count: number;
  canonical_visible_duplicate_fingerprints_retained_count: number;
  archived_duplicate_rows_blocked_count: number;
  duplicate_snapshot_conflict_count: number;
  duplicate_snapshot_conflict_reasons: Record<string, number>;
};

function finiteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function incrementDiagnosticReason(reasons: Record<string, number>, reason: string) {
  reasons[reason] = (reasons[reason] ?? 0) + 1;
}

function stableDiagnosticJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "undefined";
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableDiagnosticJson).join(",")}]`;
  }

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(
      ([key, entryValue]) =>
        `${JSON.stringify(key)}:${stableDiagnosticJson(entryValue)}`,
    )
    .join(",")}}`;
}

function normalizedTicker(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? null;
}

function duplicateSnapshotConflictReasons(
  first: RecommendationSnapshot,
  next: RecommendationSnapshot,
) {
  const reasons: string[] = [];

  if (normalizedTicker(first.ticker) !== normalizedTicker(next.ticker)) {
    reasons.push("mismatched_ticker");
  }
  if (finiteNumber(first.entry) !== finiteNumber(next.entry)) {
    reasons.push("mismatched_entry");
  }
  if (finiteNumber(first.stop) !== finiteNumber(next.stop)) {
    reasons.push("mismatched_stop");
  }
  if (finiteNumber(first.target) !== finiteNumber(next.target)) {
    reasons.push("mismatched_target");
  }
  if (
    stableDiagnosticJson(first.payload_json) !==
    stableDiagnosticJson(next.payload_json)
  ) {
    reasons.push("conflicting_payload");
  }

  return reasons;
}

function timestampMs(value: string | null | undefined) {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.getTime() : 0;
}

export function isResearchOnlyOutcomeSnapshot(snapshot: RecommendationSnapshot) {
  const payload = snapshot.payload_json;

  return (
    snapshot.source_mode === "research_only" ||
    snapshot.data_mode === "research_only" ||
    payload.visibility_status === "research_only" ||
    payload.learning_acceleration_sample === true ||
    payload.research_only === true ||
    payload.source_mode === "research_only" ||
    payload.learning_scope === "research_only"
  );
}

export function isLearningOnlyOutcomeSnapshot(snapshot: RecommendationSnapshot) {
  const payload = snapshot.payload_json;

  return (
    snapshot.source_mode === "learning_only" ||
    snapshot.data_mode === "learning_only" ||
    snapshot.is_visible === false ||
    snapshot.status === "hidden" ||
    payload.learning_only === true ||
    payload.source_mode === "learning_only" ||
    payload.visible_in_primary_recommendations === false ||
    payload.grow_max_learning_mode === true
  );
}

export function isHiddenArchivedOutcomeSnapshot(snapshot: RecommendationSnapshot) {
  const payload = snapshot.payload_json;
  const visibilityStatus = stringOrNull(payload.visibility_status);

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

export function isVisibleCanonicalOutcomeSnapshot(
  snapshot: RecommendationSnapshot,
) {
  return (
    !isResearchOnlyOutcomeSnapshot(snapshot) &&
    !isLearningOnlyOutcomeSnapshot(snapshot) &&
    !isHiddenArchivedOutcomeSnapshot(snapshot)
  );
}

function structuralCompletenessScore(snapshot: RecommendationSnapshot) {
  let score = 0;

  if (snapshot.ticker) score += 1;
  if (resolveRecommendationOutcomeSide({ snapshot }).side !== "unknown") {
    score += 1;
  }
  if (snapshot.entry !== null) score += 1;
  if (snapshot.stop !== null) score += 1;
  if (snapshot.target !== null) score += 1;
  if (snapshot.recommended_at) score += 1;

  return score;
}

function snapshotPayloadHasBatchMembership(
  snapshot: RecommendationSnapshot,
  batchFingerprint: string | null,
) {
  if (!batchFingerprint) return false;

  const payload = snapshot.payload_json;
  const directValues = [
    payload.batch_fingerprint,
    payload.recommendation_batch_fingerprint,
  ];

  if (
    directValues.some(
      (value) => typeof value === "string" && value.trim() === batchFingerprint,
    )
  ) {
    return true;
  }

  try {
    return JSON.stringify(payload).includes(batchFingerprint);
  } catch {
    return false;
  }
}

function hasSnapshotBatchMembership({
  batchFingerprint,
  batchSnapshotFingerprints,
  scanRunFingerprint,
  snapshot,
}: {
  batchFingerprint: string | null;
  batchSnapshotFingerprints: Set<string>;
  scanRunFingerprint: string | null;
  snapshot: RecommendationSnapshot;
}) {
  return (
    batchFingerprint === null ||
    batchSnapshotFingerprints.has(snapshot.snapshot_fingerprint) ||
    (scanRunFingerprint !== null && snapshot.scan_run_id === scanRunFingerprint) ||
    snapshotPayloadHasBatchMembership(snapshot, batchFingerprint)
  );
}

function canonicalSnapshotPriority({
  batchFingerprint,
  batchSnapshotFingerprints,
  growMaxLearningModeEnabled,
  scanRunFingerprint,
  snapshot,
}: {
  batchFingerprint: string | null;
  batchSnapshotFingerprints: Set<string>;
  growMaxLearningModeEnabled: boolean;
  scanRunFingerprint: string | null;
  snapshot: RecommendationSnapshot;
}) {
  const batchMember = hasSnapshotBatchMembership({
    batchFingerprint,
    batchSnapshotFingerprints,
    scanRunFingerprint,
    snapshot,
  });
  const researchOnly = isResearchOnlyOutcomeSnapshot(snapshot);
  const learningOnly = !researchOnly && isLearningOnlyOutcomeSnapshot(snapshot);
  const visibleCanonical = isVisibleCanonicalOutcomeSnapshot(snapshot);
  const includedLearningSample = shouldIncludeLearningAccelerationOutcomeSample({
    growMaxLearningModeEnabled,
    learningAccelerationEnabled: growMaxLearningModeEnabled,
    researchOnly,
    learningOnly,
  });

  return (
    (batchMember ? 100_000 : 0) +
    (visibleCanonical ? 20_000 : 0) +
    (researchOnly && includedLearningSample ? 15_000 : 0) +
    (learningOnly && includedLearningSample ? 12_000 : 0) +
    (!isHiddenArchivedOutcomeSnapshot(snapshot) ? 5_000 : 0) +
    structuralCompletenessScore(snapshot) * 100 +
    timestampMs(snapshot.updated_at) / 1_000_000_000 +
    timestampMs(snapshot.created_at) / 10_000_000_000
  );
}

function selectCanonicalSnapshotForFingerprint(input: {
  batchFingerprint: string | null;
  batchSnapshotFingerprints: Set<string>;
  growMaxLearningModeEnabled: boolean;
  scanRunFingerprint: string | null;
  snapshots: RecommendationSnapshot[];
}) {
  return input.snapshots
    .slice()
    .sort(
      (first, second) =>
        canonicalSnapshotPriority({
          ...input,
          snapshot: second,
        }) -
        canonicalSnapshotPriority({
          ...input,
          snapshot: first,
        }),
    )[0];
}

export function canonicalizeOutcomeSnapshotsForBatch({
  batchFingerprint,
  batchSnapshotFingerprints,
  growMaxLearningModeEnabled,
  scanRunFingerprint,
  snapshots,
}: {
  batchFingerprint: string | null;
  batchSnapshotFingerprints: Set<string>;
  growMaxLearningModeEnabled: boolean;
  scanRunFingerprint: string | null;
  snapshots: RecommendationSnapshot[];
}) {
  const uniqueFingerprints = new Set<string>();
  const snapshotsByFingerprint = new Map<string, RecommendationSnapshot[]>();
  const snapshotsWithoutFingerprint: RecommendationSnapshot[] = [];
  let duplicateSnapshotRows = 0;
  let hiddenArchivedDuplicateRowsIgnoredCount = 0;
  let visibleDuplicateRowsIgnoredCount = 0;
  let archivedDuplicateRowsBlockedCount = 0;
  let duplicateSnapshotConflictCount = 0;
  const duplicateConflictReasons: Record<string, number> = {};

  for (const snapshot of snapshots) {
    const fingerprint =
      typeof snapshot.snapshot_fingerprint === "string" &&
      snapshot.snapshot_fingerprint.trim().length > 0
        ? snapshot.snapshot_fingerprint
        : null;

    if (!fingerprint) {
      snapshotsWithoutFingerprint.push(snapshot);
      continue;
    }

    uniqueFingerprints.add(fingerprint);
    const existing = snapshotsByFingerprint.get(fingerprint) ?? [];
    existing.push(snapshot);
    snapshotsByFingerprint.set(fingerprint, existing);
  }

  const canonicalSnapshots: RecommendationSnapshot[] = [
    ...snapshotsWithoutFingerprint,
  ];
  const duplicateCanonicalVisibleFingerprints = new Set<string>();

  for (const [fingerprint, group] of snapshotsByFingerprint.entries()) {
    const canonical = selectCanonicalSnapshotForFingerprint({
      batchFingerprint,
      batchSnapshotFingerprints,
      growMaxLearningModeEnabled,
      scanRunFingerprint,
      snapshots: group,
    });

    if (!canonical) continue;

    canonicalSnapshots.push(canonical);

    if (group.length <= 1) continue;

    if (isVisibleCanonicalOutcomeSnapshot(canonical)) {
      duplicateCanonicalVisibleFingerprints.add(fingerprint);
    }

    for (const duplicate of group) {
      if (duplicate === canonical) continue;

      duplicateSnapshotRows += 1;

      if (isHiddenArchivedOutcomeSnapshot(duplicate)) {
        hiddenArchivedDuplicateRowsIgnoredCount += 1;
        archivedDuplicateRowsBlockedCount += 1;
        continue;
      }

      if (isVisibleCanonicalOutcomeSnapshot(duplicate)) {
        visibleDuplicateRowsIgnoredCount += 1;
      }

      const conflictReasons = duplicateSnapshotConflictReasons(
        canonical,
        duplicate,
      );
      if (conflictReasons.length > 0) {
        duplicateSnapshotConflictCount += 1;
        for (const conflictReason of conflictReasons) {
          incrementDiagnosticReason(duplicateConflictReasons, conflictReason);
        }
      }
    }
  }

  return {
    canonicalSnapshots,
    duplicateCanonicalVisibleFingerprints,
    diagnostics: {
      unique_snapshot_fingerprints_count: uniqueFingerprints.size,
      duplicate_snapshot_rows: duplicateSnapshotRows,
      duplicate_snapshot_rows_ignored_count: duplicateSnapshotRows,
      hidden_archived_duplicate_rows_ignored_count:
        hiddenArchivedDuplicateRowsIgnoredCount,
      visible_duplicate_rows_ignored_count: visibleDuplicateRowsIgnoredCount,
      canonical_visible_duplicate_fingerprints_retained_count:
        duplicateCanonicalVisibleFingerprints.size,
      archived_duplicate_rows_blocked_count: archivedDuplicateRowsBlockedCount,
      duplicate_snapshot_conflict_count: duplicateSnapshotConflictCount,
      duplicate_snapshot_conflict_reasons: duplicateConflictReasons,
    } satisfies OutcomeSnapshotCanonicalizationDiagnostics,
  };
}
