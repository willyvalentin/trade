import "server-only";

import { createHash } from "node:crypto";

import {
  parseRecommendationLearningBaselineSource,
  type RecommendationLearningBaselineSource,
} from "@/lib/recommendation-learning-baseline-source";
import { buildRecommendationLearningBaselineSegmentation } from "@/lib/recommendation-learning-baseline-segments";
import { buildRecommendationLearningEvaluationPlans } from "@/lib/recommendation-learning-evaluation-plan";
import {
  type RecommendationLearningBaselineFreeze,
  type RecommendationLearningBaselineFreezeInput,
} from "@/lib/recommendation-learning-baseline-freeze-store";
import { recommendationEvaluationCharterMatchesPolicySegment } from "@/lib/recommendation-evaluation-charter";
import { readRecommendationLearningBaselineSource } from "@/lib/server/application-data-access";
import { readRecommendationEvaluationCharters } from "@/lib/server/recommendation-evaluation-charter-persistence";
import {
  freezeRecommendationLearningBaseline,
  readRecommendationLearningBaselineFreeze,
} from "@/lib/server/recommendation-learning-baseline-freeze-persistence";

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

function baselineInput({
  ownerUserId,
  segmentKey,
  source,
  evaluationCharterFingerprint,
}: {
  ownerUserId: string;
  segmentKey: string;
  source: RecommendationLearningBaselineSource;
  evaluationCharterFingerprint: string;
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
    evaluation_charter_fingerprint: evaluationCharterFingerprint,
  });

  return {
    baseline_fingerprint: createHash("sha256")
      .update(fingerprintPayload, "utf8")
      .digest("hex"),
    owner_user_id: ownerUserId,
    segment_key: plan.segment_key,
    decision_record_fingerprints: decisionRecordFingerprints,
    evaluation_plan: plan,
    evaluation_charter_fingerprint: evaluationCharterFingerprint,
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

  const source = parseRecommendationLearningBaselineSource(sourceResult.data);
  if (!source) {
    return {
      status: "unavailable",
      freeze: null,
      safe_blocker: "recommendation_learning_baseline_source_malformed",
    };
  }

  const segmentation = buildRecommendationLearningBaselineSegmentation({
    scanRuns: source.scanRuns,
    snapshots: source.snapshots,
    outcomes: source.outcomes,
  });
  const plan = buildRecommendationLearningEvaluationPlans({
    segmentation,
    scanRuns: source.scanRuns,
    snapshots: source.snapshots,
    outcomes: source.outcomes,
  }).plans.find((candidate) => candidate.segment_key === segmentKey);
  if (!plan || plan.status !== "ready_for_explicit_freeze" || !plan.metrics) {
    return {
      status: "not_ready",
      freeze: null,
      safe_blocker: "recommendation_learning_baseline_not_ready_for_explicit_freeze",
    };
  }

  const charters = await readRecommendationEvaluationCharters(ownerUserId);
  if (charters.status === "unavailable") {
    return {
      status: "unavailable",
      freeze: null,
      safe_blocker: charters.safe_blocker,
    };
  }
  const charter = charters.charters.find((candidate) =>
    recommendationEvaluationCharterMatchesPolicySegment({
      charter: candidate,
      segmentKey: plan.segment_key,
      policy: plan.policy_attribution,
    })
  );
  if (!charter) {
    return {
      status: "not_ready",
      freeze: null,
      safe_blocker: "recommendation_evaluation_charter_not_recorded_or_mismatched",
    };
  }

  const input = baselineInput({
    ownerUserId,
    segmentKey,
    source,
    evaluationCharterFingerprint: charter.charter_fingerprint,
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
