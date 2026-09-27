import "server-only";

import type { LearningBaselineScanRun } from "@/lib/recommendation-learning-baseline-readiness";
import {
  recommendationOutcomeFromPersistenceRow,
  type RecommendationOutcome,
} from "@/lib/recommendation-outcome-tracker";
import { recommendationScanRunFromPersistenceRow } from "@/lib/recommendation-scan-run";
import {
  recommendationSnapshotFromPersistenceRow,
  type RecommendationSnapshot,
} from "@/lib/recommendation-snapshot";
import { normalizeApplicationOwnerUserId } from "@/lib/application-session-core";
import type { ScannerClockPriorShadowForwardDecisionPlan } from "@/lib/server/scanner-clock-prior-shadow-forward-decision";
import { getServerSupabaseClient } from "@/lib/supabase-server";

const MAXIMUM_WINDOW_SCAN_ROWS = 1_000;
const MAXIMUM_WINDOW_SNAPSHOT_ROWS = 10_000;
const MAXIMUM_WINDOW_OUTCOME_ROWS = 30_000;

export type ScannerClockPriorShadowForwardEvidence = {
  scanRuns: LearningBaselineScanRun[];
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  calibrationScanRuns: LearningBaselineScanRun[];
  calibrationSnapshots: RecommendationSnapshot[];
  calibrationOutcomes: RecommendationOutcome[];
  source_counts: {
    window_scan_rows: number;
    clock_prior_scan_rows: number;
    linked_snapshot_rows: number;
    linked_outcome_rows: number;
    calibration_scan_rows: number;
    calibration_linked_snapshot_rows: number;
    calibration_linked_outcome_rows: number;
  };
};

export type ScannerClockPriorShadowForwardEvidenceReadResult =
  | {
      status: "available";
      evidence: ScannerClockPriorShadowForwardEvidence;
      safe_blocker: null;
    }
  | {
      status: "unavailable" | "failed";
      evidence: null;
      safe_blocker: string;
    };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rows(value: unknown): Record<string, unknown>[] | null {
  if (!Array.isArray(value) || value.some((item) => !record(item))) return null;
  return value as Record<string, unknown>[];
}

function hasClockPriorEvidence(row: Record<string, unknown>) {
  const payload = record(row.payload_json) ? row.payload_json : null;
  return payload !== null && (
    Object.prototype.hasOwnProperty.call(
      payload,
      "scanner_clock_prior_shadow_comparison",
    ) ||
    Object.prototype.hasOwnProperty.call(
      payload,
      "scanner_clock_prior_shadow_attribution",
    )
  );
}

function exactRows({
  data,
  count,
  maximum,
}: {
  data: unknown;
  count: number | null;
  maximum: number;
}) {
  const parsed = rows(data);
  return parsed && typeof count === "number" && count <= maximum &&
      parsed.length === count
    ? parsed
    : null;
}

function failed(
  safeBlocker: string,
): ScannerClockPriorShadowForwardEvidenceReadResult {
  return { status: "failed", evidence: null, safe_blocker: safeBlocker };
}

/**
 * Reads only the owner-bound rows that can belong to one frozen clock-prior
 * forward cohort. Exact counts and hard bounds make truncation fail closed;
 * unrelated scans in the same window are excluded only when they contain no
 * clock-prior comparison or attribution key at all.
 */
export async function readScannerClockPriorShadowForwardEvidence(
  ownerUserId: string,
  plan: ScannerClockPriorShadowForwardDecisionPlan,
): Promise<ScannerClockPriorShadowForwardEvidenceReadResult> {
  const owner = normalizeApplicationOwnerUserId(ownerUserId);
  const { client } = getServerSupabaseClient();
  if (!client || !owner || plan.owner_user_id !== owner) {
    return {
      status: "unavailable",
      evidence: null,
      safe_blocker: "clock_prior_forward_evidence_store_unavailable",
    };
  }

  const startAt = plan.windows.held_out.start_at;
  const endAt = plan.windows.walk_forward.end_at;
  const scanQuery = await client
    .from("recommendation_scan_runs")
    .select("*", { count: "exact" })
    .eq("owner_user_id", owner)
    .gte("observed_at", startAt)
    .lt("observed_at", endAt)
    .order("observed_at", { ascending: true })
    .limit(MAXIMUM_WINDOW_SCAN_ROWS + 1);
  if (scanQuery.error) {
    return failed("clock_prior_forward_scan_evidence_read_failed");
  }
  const scanRows = exactRows({
    data: scanQuery.data,
    count: scanQuery.count,
    maximum: MAXIMUM_WINDOW_SCAN_ROWS,
  });
  if (!scanRows) {
    return failed("clock_prior_forward_scan_evidence_incomplete_or_unbounded");
  }

  const cohortScanRows = scanRows.filter(hasClockPriorEvidence);
  const parsedScanRuns = cohortScanRows.map(recommendationScanRunFromPersistenceRow);
  if (parsedScanRuns.some((scanRun) => scanRun === null)) {
    return failed("clock_prior_forward_scan_evidence_malformed");
  }
  const scanRuns = parsedScanRuns as LearningBaselineScanRun[];
  if (scanRuns.length === 0) {
    return {
      status: "available",
      evidence: {
        scanRuns: [],
        snapshots: [],
        outcomes: [],
        calibrationScanRuns: [],
        calibrationSnapshots: [],
        calibrationOutcomes: [],
        source_counts: {
          window_scan_rows: scanRows.length,
          clock_prior_scan_rows: 0,
          linked_snapshot_rows: 0,
          linked_outcome_rows: 0,
          calibration_scan_rows: 0,
          calibration_linked_snapshot_rows: 0,
          calibration_linked_outcome_rows: 0,
        },
      },
      safe_blocker: null,
    };
  }

  const scanIdentities = new Set(
    scanRuns.flatMap((scanRun) => [scanRun.id, scanRun.run_fingerprint]),
  );
  const snapshotQuery = await client
    .from("recommendation_snapshots")
    .select("*", { count: "exact" })
    .eq("owner_user_id", owner)
    .gte("recommended_at", startAt)
    .lt("recommended_at", endAt)
    .order("recommended_at", { ascending: true })
    .limit(MAXIMUM_WINDOW_SNAPSHOT_ROWS + 1);
  if (snapshotQuery.error) {
    return failed("clock_prior_forward_snapshot_evidence_read_failed");
  }
  const snapshotRows = exactRows({
    data: snapshotQuery.data,
    count: snapshotQuery.count,
    maximum: MAXIMUM_WINDOW_SNAPSHOT_ROWS,
  });
  if (!snapshotRows) {
    return failed(
      "clock_prior_forward_snapshot_evidence_incomplete_or_unbounded",
    );
  }
  const linkedSnapshotRows = snapshotRows.filter((row) =>
    typeof row.scan_run_id === "string" && scanIdentities.has(row.scan_run_id)
  );
  const parsedSnapshots = linkedSnapshotRows.map(
    recommendationSnapshotFromPersistenceRow,
  );
  if (parsedSnapshots.some((snapshot) => snapshot === null)) {
    return failed("clock_prior_forward_snapshot_evidence_malformed");
  }
  const snapshots = parsedSnapshots as RecommendationSnapshot[];

  const snapshotFingerprints = new Set(
    snapshots.map((snapshot) => snapshot.snapshot_fingerprint),
  );
  const outcomeQuery = await client
    .from("recommendation_outcomes")
    .select("*", { count: "exact" })
    .eq("owner_user_id", owner)
    .gte("recommended_at", startAt)
    .lt("recommended_at", endAt)
    .order("recommended_at", { ascending: true })
    .limit(MAXIMUM_WINDOW_OUTCOME_ROWS + 1);
  if (outcomeQuery.error) {
    return failed("clock_prior_forward_outcome_evidence_read_failed");
  }
  const outcomeRows = exactRows({
    data: outcomeQuery.data,
    count: outcomeQuery.count,
    maximum: MAXIMUM_WINDOW_OUTCOME_ROWS,
  });
  if (!outcomeRows) {
    return failed(
      "clock_prior_forward_outcome_evidence_incomplete_or_unbounded",
    );
  }
  const linkedOutcomeRows = outcomeRows.filter((row) =>
    typeof row.snapshot_fingerprint === "string" &&
    snapshotFingerprints.has(row.snapshot_fingerprint)
  );
  const parsedOutcomes = linkedOutcomeRows.map(
    recommendationOutcomeFromPersistenceRow,
  );
  if (parsedOutcomes.some((outcome) => outcome === null)) {
    return failed("clock_prior_forward_outcome_evidence_malformed");
  }

  const calibrationStartAt = new Date(
    Date.parse(startAt) - 30 * 24 * 60 * 60 * 1_000,
  ).toISOString();
  const calibrationScanQuery = await client
    .from("recommendation_scan_runs")
    .select("*", { count: "exact" })
    .eq("owner_user_id", owner)
    .gte("observed_at", calibrationStartAt)
    .lt("observed_at", startAt)
    .order("observed_at", { ascending: true })
    .limit(MAXIMUM_WINDOW_SCAN_ROWS + 1);
  if (calibrationScanQuery.error) {
    return failed("clock_prior_calibration_scan_evidence_read_failed");
  }
  const calibrationScanRows = exactRows({
    data: calibrationScanQuery.data,
    count: calibrationScanQuery.count,
    maximum: MAXIMUM_WINDOW_SCAN_ROWS,
  });
  if (!calibrationScanRows) {
    return failed("clock_prior_calibration_scan_evidence_incomplete_or_unbounded");
  }
  const parsedCalibrationScanRuns = calibrationScanRows
    .filter(hasClockPriorEvidence)
    .map(recommendationScanRunFromPersistenceRow);
  if (parsedCalibrationScanRuns.some((scanRun) => scanRun === null)) {
    return failed("clock_prior_calibration_scan_evidence_malformed");
  }
  const calibrationScanRuns =
    parsedCalibrationScanRuns as LearningBaselineScanRun[];
  const calibrationScanIdentities = new Set(
    calibrationScanRuns.flatMap((scanRun) => [
      scanRun.id,
      scanRun.run_fingerprint,
    ]),
  );
  const calibrationSnapshotQuery = await client
    .from("recommendation_snapshots")
    .select("*", { count: "exact" })
    .eq("owner_user_id", owner)
    .gte("recommended_at", calibrationStartAt)
    .lt("recommended_at", startAt)
    .order("recommended_at", { ascending: true })
    .limit(MAXIMUM_WINDOW_SNAPSHOT_ROWS + 1);
  if (calibrationSnapshotQuery.error) {
    return failed("clock_prior_calibration_snapshot_evidence_read_failed");
  }
  const calibrationSnapshotRows = exactRows({
    data: calibrationSnapshotQuery.data,
    count: calibrationSnapshotQuery.count,
    maximum: MAXIMUM_WINDOW_SNAPSHOT_ROWS,
  });
  if (!calibrationSnapshotRows) {
    return failed(
      "clock_prior_calibration_snapshot_evidence_incomplete_or_unbounded",
    );
  }
  const parsedCalibrationSnapshots = calibrationSnapshotRows
    .filter((row) =>
      typeof row.scan_run_id === "string" &&
      calibrationScanIdentities.has(row.scan_run_id)
    )
    .map(recommendationSnapshotFromPersistenceRow);
  if (parsedCalibrationSnapshots.some((snapshot) => snapshot === null)) {
    return failed("clock_prior_calibration_snapshot_evidence_malformed");
  }
  const calibrationSnapshots =
    parsedCalibrationSnapshots as RecommendationSnapshot[];
  const calibrationSnapshotFingerprints = new Set(
    calibrationSnapshots.map((snapshot) => snapshot.snapshot_fingerprint),
  );
  const calibrationOutcomeQuery = await client
    .from("recommendation_outcomes")
    .select("*", { count: "exact" })
    .eq("owner_user_id", owner)
    .gte("recommended_at", calibrationStartAt)
    .lt("recommended_at", startAt)
    .order("recommended_at", { ascending: true })
    .limit(MAXIMUM_WINDOW_OUTCOME_ROWS + 1);
  if (calibrationOutcomeQuery.error) {
    return failed("clock_prior_calibration_outcome_evidence_read_failed");
  }
  const calibrationOutcomeRows = exactRows({
    data: calibrationOutcomeQuery.data,
    count: calibrationOutcomeQuery.count,
    maximum: MAXIMUM_WINDOW_OUTCOME_ROWS,
  });
  if (!calibrationOutcomeRows) {
    return failed(
      "clock_prior_calibration_outcome_evidence_incomplete_or_unbounded",
    );
  }
  const parsedCalibrationOutcomes = calibrationOutcomeRows
    .filter((row) =>
      typeof row.snapshot_fingerprint === "string" &&
      calibrationSnapshotFingerprints.has(row.snapshot_fingerprint)
    )
    .map(recommendationOutcomeFromPersistenceRow);
  if (parsedCalibrationOutcomes.some((outcome) => outcome === null)) {
    return failed("clock_prior_calibration_outcome_evidence_malformed");
  }

  return {
    status: "available",
    evidence: {
      scanRuns,
      snapshots,
      outcomes: parsedOutcomes as RecommendationOutcome[],
      calibrationScanRuns,
      calibrationSnapshots,
      calibrationOutcomes: parsedCalibrationOutcomes as RecommendationOutcome[],
      source_counts: {
        window_scan_rows: scanRows.length,
        clock_prior_scan_rows: scanRuns.length,
        linked_snapshot_rows: snapshots.length,
        linked_outcome_rows: parsedOutcomes.length,
        calibration_scan_rows: calibrationScanRuns.length,
        calibration_linked_snapshot_rows: calibrationSnapshots.length,
        calibration_linked_outcome_rows: parsedCalibrationOutcomes.length,
      },
    },
    safe_blocker: null,
  };
}
