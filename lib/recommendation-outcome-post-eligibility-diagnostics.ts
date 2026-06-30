import type {
  RecommendationOutcomeEvaluationCandidate,
} from "@/lib/recommendation-outcome-evaluation-runner";

export type OutcomePostEligibilityDiagnostics = {
  pre_filter_eligible_snapshot_count: number;
  final_evaluation_eligible_snapshot_count: number;
  post_eligibility_block_reasons: Record<string, number>;
  candle_request_planning_block_reasons: Record<string, number>;
};

function increment(reasons: Record<string, number>, reason: string, count = 1) {
  reasons[reason] = (reasons[reason] ?? 0) + count;
}

function lowerText(candidate: RecommendationOutcomeEvaluationCandidate) {
  return [candidate.error, ...candidate.warnings]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

function blockReasonForCandidate(
  candidate: RecommendationOutcomeEvaluationCandidate,
) {
  const text = lowerText(candidate);

  if (
    candidate.status === "skipped" &&
    (text.includes("completed status") ||
      text.includes("already has retained candles") ||
      candidate.outcome_status !== null)
  ) {
    return "already_has_equal_or_better_outcome";
  }

  if (candidate.status === "pending_provider_budget") {
    return "provider_budget_blocked";
  }

  if (candidate.status === "missing_snapshot_fields") {
    if (text.includes("side")) return "missing_side";
    return "missing_entry_stop_target";
  }

  if (text.includes("horizon has not elapsed")) {
    return "not_old_enough_for_horizon";
  }

  if (candidate.status === "provider_error") {
    return "market_data_unavailable";
  }

  if (
    candidate.status === "missing_candles" ||
    candidate.status === "pending_candles"
  ) {
    return "missing_reference_price";
  }

  return candidate.status === "skipped"
    ? "already_has_equal_or_better_outcome"
    : "unknown_post_eligibility_blocker";
}

function shouldCountAsFinalEvaluationCandidate(
  candidate: RecommendationOutcomeEvaluationCandidate,
) {
  return candidate.status !== "skipped";
}

function shouldCountAsCandlePlanningBlock(
  candidate: RecommendationOutcomeEvaluationCandidate,
) {
  return (
    candidate.candle_request === null ||
    candidate.status === "pending_provider_budget" ||
    candidate.status === "missing_snapshot_fields"
  );
}

export function buildOutcomePostEligibilityDiagnostics({
  candidates,
  candleRequestsPlanned,
  preFilterEligibleSnapshotCount,
}: {
  candidates: RecommendationOutcomeEvaluationCandidate[];
  candleRequestsPlanned: number;
  preFilterEligibleSnapshotCount: number;
}): OutcomePostEligibilityDiagnostics {
  const postEligibilityBlockReasons: Record<string, number> = {};
  const candleRequestPlanningBlockReasons: Record<string, number> = {};
  const finalEligibleFingerprints = new Set<string>();

  for (const candidate of candidates) {
    const reason = blockReasonForCandidate(candidate);

    if (!shouldCountAsFinalEvaluationCandidate(candidate)) {
      increment(postEligibilityBlockReasons, reason);
    } else if (
      candidate.status === "pending_provider_budget" ||
      candidate.status === "missing_snapshot_fields"
    ) {
      increment(postEligibilityBlockReasons, reason);
    }

    if (shouldCountAsCandlePlanningBlock(candidate)) {
      increment(candleRequestPlanningBlockReasons, reason);
    }

    if (
      shouldCountAsFinalEvaluationCandidate(candidate) &&
      candidate.snapshot_fingerprint
    ) {
      finalEligibleFingerprints.add(candidate.snapshot_fingerprint);
    }
  }

  if (
    preFilterEligibleSnapshotCount > 0 &&
    finalEligibleFingerprints.size === 0 &&
    Object.keys(postEligibilityBlockReasons).length === 0
  ) {
    increment(
      postEligibilityBlockReasons,
      "unknown_post_eligibility_blocker",
      preFilterEligibleSnapshotCount,
    );
  }

  if (
    preFilterEligibleSnapshotCount > 0 &&
    candleRequestsPlanned === 0 &&
    Object.keys(candleRequestPlanningBlockReasons).length === 0
  ) {
    increment(
      candleRequestPlanningBlockReasons,
      "candle_request_planning_failed",
      preFilterEligibleSnapshotCount,
    );
  }

  return {
    pre_filter_eligible_snapshot_count: preFilterEligibleSnapshotCount,
    final_evaluation_eligible_snapshot_count: finalEligibleFingerprints.size,
    post_eligibility_block_reasons: postEligibilityBlockReasons,
    candle_request_planning_block_reasons: candleRequestPlanningBlockReasons,
  };
}
