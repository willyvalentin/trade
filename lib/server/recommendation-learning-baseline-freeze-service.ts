import "server-only";

import { createHash } from "node:crypto";

import { buildRecommendationLearningBaselineSegmentation } from "@/lib/recommendation-learning-baseline-segments";
import { buildRecommendationLearningEvaluationPlans } from "@/lib/recommendation-learning-evaluation-plan";
import {
  type RecommendationLearningBaselineFreeze,
  type RecommendationLearningBaselineFreezeInput,
} from "@/lib/recommendation-learning-baseline-freeze-store";
import { recommendationOutcomeFromPersistenceRow, type RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import { recommendationScanRunFromPersistenceRow, type RecommendationScanRun } from "@/lib/recommendation-scan-run";
import { recommendationSnapshotFromPersistenceRow, type RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { readRecommendationLearningBaselineSource } from "@/lib/server/application-data-access";
import {
  freezeRecommendationLearningBaseline,
  readRecommendationLearningBaselineFreeze,
} from "@/lib/server/recommendation-learning-baseline-freeze-persistence";

type BaselineSource = {
  scanRuns: RecommendationScanRun[];
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
};

export type FreezeCurrentRecommendationLearningBaselineResult =
  | {
      status: "frozen" | "already_frozen";
      freeze: RecommendationLearningBaselineFreeze;
      safe_blocker: null;
    }
  | {
      status: "not_ready" | "unavailable" | "different_baseline_already_frozen";
      freeze: null;
      safe_blocker: string;
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

function sourceFromRows(data: Record<string, unknown>): BaselineSource {
  const rowArray = (value: unknown) => Array.isArray(value)
    ? value.filter(
      (row): row is Record<string, unknown> =>
        typeof row === "object" && row !== null && !Array.isArray(row),
    )
    : [];

  const scanRuns = rowArray(data.recommendation_scan_runs)
    .map(recommendationScanRunFromPersistenceRow)
    .filter((scanRun): scanRun is RecommendationScanRun => scanRun !== null)
    .filter((scanRun) => !isDiagnosticPayload(scanRun.payload_json));
  const snapshots = rowArray(data.recommendation_snapshots)
    .map(recommendationSnapshotFromPersistenceRow)
    .filter((snapshot): snapshot is RecommendationSnapshot => snapshot !== null)
    .filter(
      (snapshot) =>
        snapshot.source_mode !== "diagnostic" &&
        snapshot.payload_json.diagnostic_mode !== true,
    );
  const outcomes = rowArray(data.recommendation_outcomes)
    .map(recommendationOutcomeFromPersistenceRow)
    .filter((outcome): outcome is RecommendationOutcome => outcome !== null);

  return { scanRuns, snapshots, outcomes };
}

function baselineInput({
  ownerUserId,
  segmentKey,
  source,
}: {
  ownerUserId: string;
  segmentKey: string;
  source: BaselineSource;
}): RecommendationLearningBaselineFreezeInput | null {
  const segmentation = buildRecommendationLearningBaselineSegmentation({
    scanRuns: source.scanRuns,
    snapshots: source.snapshots,
    outcomes: source.outcomes,
  });
  const plans = buildRecommendationLearningEvaluationPlans({
    segmentation,
    scanRuns: source.scanRuns,
    snapshots: source.snapshots,
    outcomes: source.outcomes,
  });
  const plan = plans.plans.find((candidate) => candidate.segment_key === segmentKey);

  if (!plan || plan.status !== "ready_for_explicit_freeze" || !plan.metrics) {
    return null;
  }

  const decisionRecordFingerprints = [
    ...plan.decision_records.scan_run_fingerprints,
  ];
  const fingerprintPayload = JSON.stringify({
    contract_version: "recommendation_learning_baseline_freeze_v1",
    owner_user_id: ownerUserId,
    segment_key: plan.segment_key,
    decision_record_fingerprints: decisionRecordFingerprints,
    evaluation_plan: plan,
  });

  return {
    baseline_fingerprint: createHash("sha256")
      .update(fingerprintPayload, "utf8")
      .digest("hex"),
    owner_user_id: ownerUserId,
    segment_key: plan.segment_key,
    decision_record_fingerprints: decisionRecordFingerprints,
    evaluation_plan: plan,
  };
}

export async function freezeCurrentRecommendationLearningBaseline({
  ownerUserId,
  segmentKey,
}: {
  ownerUserId: string;
  segmentKey: string;
}): Promise<FreezeCurrentRecommendationLearningBaselineResult> {
  if (typeof segmentKey !== "string" || segmentKey.length < 1 || segmentKey.length > 16_384) {
    return {
      status: "not_ready",
      freeze: null,
      safe_blocker: "recommendation_learning_baseline_segment_invalid",
    };
  }

  const sourceResult = await readRecommendationLearningBaselineSource(ownerUserId);
  if (sourceResult.status !== "available") {
    return {
      status: "unavailable",
      freeze: null,
      safe_blocker: "recommendation_learning_baseline_source_unavailable",
    };
  }

  const input = baselineInput({
    ownerUserId,
    segmentKey,
    source: sourceFromRows(sourceResult.data),
  });
  if (!input) {
    return {
      status: "not_ready",
      freeze: null,
      safe_blocker: "recommendation_learning_baseline_not_ready_for_explicit_freeze",
    };
  }

  return freezeRecommendationLearningBaseline(input);
}

export function readCurrentRecommendationLearningBaseline(ownerUserId: string) {
  return readRecommendationLearningBaselineFreeze(ownerUserId);
}
