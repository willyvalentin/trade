import "server-only";

import {
  buildRecommendationEvaluationCharterInput,
  type RecommendationEvaluationCharter,
} from "@/lib/recommendation-evaluation-charter";
import { buildRecommendationLearningBaselineSegmentation } from "@/lib/recommendation-learning-baseline-segments";
import { parseRecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { readRecommendationLearningBaselineSource } from "@/lib/server/application-data-access";
import {
  readRecommendationEvaluationCharters,
  recordRecommendationEvaluationCharter,
} from "@/lib/server/recommendation-evaluation-charter-persistence";

export type RecordCurrentRecommendationEvaluationCharterResult =
  | {
      status: "recorded" | "already_recorded";
      charter: RecommendationEvaluationCharter;
      safe_blocker: null;
    }
  | {
      status: "not_ready" | "unavailable" | "different_charter_already_recorded";
      charter: null;
      safe_blocker: string;
    };

export async function recordCurrentRecommendationEvaluationCharter({
  ownerUserId,
  segmentKey,
  charter,
}: {
  ownerUserId: string;
  segmentKey: string;
  charter: unknown;
}): Promise<RecordCurrentRecommendationEvaluationCharterResult> {
  if (typeof segmentKey !== "string" || segmentKey.length < 1 || segmentKey.length > 16_384) {
    return {
      status: "not_ready",
      charter: null,
      safe_blocker: "recommendation_evaluation_charter_segment_invalid",
    };
  }
  const sourceResult = await readRecommendationLearningBaselineSource(ownerUserId);
  if (sourceResult.status !== "available") {
    return {
      status: "unavailable",
      charter: null,
      safe_blocker: "recommendation_learning_baseline_source_unavailable",
    };
  }
  const source = parseRecommendationLearningBaselineSource(sourceResult.data);
  if (!source) {
    return {
      status: "unavailable",
      charter: null,
      safe_blocker: "recommendation_learning_baseline_source_malformed",
    };
  }
  const segment = buildRecommendationLearningBaselineSegmentation({
    scanRuns: source.scanRuns,
    snapshots: source.snapshots,
    outcomes: source.outcomes,
  }).segments.find((candidate) => candidate.segment_key === segmentKey);
  if (!segment) {
    return {
      status: "not_ready",
      charter: null,
      safe_blocker: "recommendation_evaluation_charter_segment_not_available",
    };
  }
  const input = buildRecommendationEvaluationCharterInput({
    ownerUserId,
    segmentKey,
    policy: segment.policy_attribution,
    charter,
  });
  if (!input) {
    return {
      status: "not_ready",
      charter: null,
      safe_blocker: "recommendation_evaluation_charter_definition_invalid",
    };
  }
  return recordRecommendationEvaluationCharter(input);
}

export function readCurrentRecommendationEvaluationCharters(ownerUserId: string) {
  return readRecommendationEvaluationCharters(ownerUserId);
}
