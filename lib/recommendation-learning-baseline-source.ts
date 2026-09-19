import {
  recommendationOutcomeFromPersistenceRow,
  type RecommendationOutcome,
} from "@/lib/recommendation-outcome-tracker";
import {
  recommendationScanRunFromPersistenceRow,
  type RecommendationScanRun,
} from "@/lib/recommendation-scan-run";
import {
  recommendationSnapshotFromPersistenceRow,
  type RecommendationSnapshot,
} from "@/lib/recommendation-snapshot";

export type RecommendationLearningBaselineSource = {
  scanRuns: RecommendationScanRun[];
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
};

function isDiagnosticPayload(payload: Record<string, unknown>) {
  const activeTrace =
    typeof payload.active_scan_trace === "object" &&
    payload.active_scan_trace !== null &&
    !Array.isArray(payload.active_scan_trace)
      ? (payload.active_scan_trace as Record<string, unknown>)
      : null;

  return payload.diagnostic_mode === true ||
    payload.not_live_trade_signal === true ||
    payload.visible_in_primary_recommendations === false ||
    activeTrace?.diagnostic_mode === true ||
    payload.source_mode === "diagnostic";
}

function rowArray(value: unknown): Record<string, unknown>[] | null {
  if (!Array.isArray(value)) return null;
  const rows = value.filter(
    (row): row is Record<string, unknown> =>
      typeof row === "object" && row !== null && !Array.isArray(row),
  );
  return rows.length === value.length ? rows : null;
}

/**
 * Decodes the complete server-readback population for an IF-4 baseline.
 * A malformed row must never disappear from that population: omitting it could
 * turn a partial outcome sample into an apparently eligible baseline.
 */
export function parseRecommendationLearningBaselineSource(
  data: Record<string, unknown>,
): RecommendationLearningBaselineSource | null {
  const scanRunRows = rowArray(data.recommendation_scan_runs);
  const snapshotRows = rowArray(data.recommendation_snapshots);
  const outcomeRows = rowArray(data.recommendation_outcomes);
  if (!scanRunRows || !snapshotRows || !outcomeRows) return null;

  const decodedScanRuns = scanRunRows
    .map(recommendationScanRunFromPersistenceRow);
  const decodedSnapshots = snapshotRows
    .map(recommendationSnapshotFromPersistenceRow);
  const decodedOutcomes = outcomeRows
    .map(recommendationOutcomeFromPersistenceRow);
  if (
    decodedScanRuns.some((scanRun) => scanRun === null) ||
    decodedSnapshots.some((snapshot) => snapshot === null) ||
    decodedOutcomes.some((outcome) => outcome === null)
  ) {
    return null;
  }

  const scanRuns = (decodedScanRuns as RecommendationScanRun[])
    .filter((scanRun) => !isDiagnosticPayload(scanRun.payload_json));
  const snapshots = (decodedSnapshots as RecommendationSnapshot[])
    .filter(
      (snapshot) =>
        snapshot.source_mode !== "diagnostic" &&
        snapshot.payload_json.diagnostic_mode !== true,
    );
  const outcomes = decodedOutcomes as RecommendationOutcome[];

  return { scanRuns, snapshots, outcomes };
}
