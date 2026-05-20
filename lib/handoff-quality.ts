import type { BrokerExecutionMetadata } from "@/lib/broker-execution-metadata";
import type { ExecutionQualityMetrics } from "@/lib/execution-quality";
import type { ExecutionTimelineEvent } from "@/lib/execution-timeline";
import type { HandoffReplayResult } from "@/lib/handoff-session-replay";

export type HandoffQualityRating =
  | "excellent"
  | "good"
  | "acceptable"
  | "poor"
  | "unknown";

export type HandoffQualityFactorImpact =
  | "positive"
  | "neutral"
  | "warning"
  | "negative";

export type HandoffQualityFactor = {
  code: string;
  label: string;
  impact: HandoffQualityFactorImpact;
  description: string;
  points: number;
};

export type HandoffQualityResult = {
  rating: HandoffQualityRating;
  score: number;
  label: string;
  summary: string;
  factors: HandoffQualityFactor[];
  calculated_at: string;
};

export type HandoffQualitySnapshot = {
  rating: HandoffQualityRating;
  score: number;
  calculated_at: string;
  factor_codes: string[];
  warning_factor_codes: string[];
  negative_factor_codes: string[];
};

export type CalculateHandoffQualityInput = {
  executionMetadata?: BrokerExecutionMetadata | null;
  executionQualityMetrics?: ExecutionQualityMetrics | null;
  handoffReplay?: HandoffReplayResult | null;
  timelineEvents?: ExecutionTimelineEvent[];
  agentReadinessStatus?: string | null;
  agentReadinessScore?: number | null;
  dryRunStatus?: string | null;
  calculatedAt?: string;
};

function factor(
  code: string,
  label: string,
  impact: HandoffQualityFactorImpact,
  description: string,
  points: number,
): HandoffQualityFactor {
  return { code, label, impact, description, points };
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function ratingLabel(value: HandoffQualityRating) {
  if (value === "excellent") return "Excellent";
  if (value === "good") return "Good";
  if (value === "acceptable") return "Acceptable";
  if (value === "poor") return "Poor";
  return "Unknown";
}

function hasTimelineEvent(
  events: ExecutionTimelineEvent[],
  type: ExecutionTimelineEvent["type"],
) {
  return events.some((event) => event.type === type);
}

function getLatestTimelineEvent(
  events: ExecutionTimelineEvent[],
  type: ExecutionTimelineEvent["type"],
) {
  return [...events].reverse().find((event) => event.type === type) ?? null;
}

function materialFillDifference(metadata: BrokerExecutionMetadata) {
  if (
    metadata.planned_entry_price === null ||
    metadata.actual_fill_price === null ||
    metadata.planned_entry_price <= 0
  ) {
    return false;
  }

  return (
    Math.abs(metadata.actual_fill_price - metadata.planned_entry_price) /
      metadata.planned_entry_price >
    0.0015
  );
}

function severePartialFill(metadata: BrokerExecutionMetadata) {
  if (
    metadata.planned_shares === null ||
    metadata.actual_shares === null ||
    metadata.planned_shares <= 0
  ) {
    return false;
  }

  return metadata.actual_shares / metadata.planned_shares < 0.5;
}

export function toHandoffQualitySnapshot(
  result: HandoffQualityResult,
): HandoffQualitySnapshot {
  return {
    rating: result.rating,
    score: result.score,
    calculated_at: result.calculated_at,
    factor_codes: result.factors.map((item) => item.code),
    warning_factor_codes: result.factors
      .filter((item) => item.impact === "warning")
      .map((item) => item.code),
    negative_factor_codes: result.factors
      .filter((item) => item.impact === "negative")
      .map((item) => item.code),
  };
}

export function calculateHandoffQuality({
  executionMetadata,
  executionQualityMetrics,
  handoffReplay,
  timelineEvents = [],
  agentReadinessStatus,
  agentReadinessScore,
  dryRunStatus,
  calculatedAt = new Date().toISOString(),
}: CalculateHandoffQualityInput): HandoffQualityResult {
  if (!executionMetadata) {
    return {
      rating: "unknown",
      score: 0,
      label: "Unknown",
      summary: "Not enough execution metadata exists to score handoff quality.",
      factors: [
        factor(
          "execution_metadata_missing",
          "Execution metadata missing",
          "neutral",
          "No persisted execution metadata exists for this trade.",
          0,
        ),
      ],
      calculated_at: calculatedAt,
    };
  }

  const factors: HandoffQualityFactor[] = [];
  let score = 100;
  let criticalNegative = false;
  const dryRunEvent = getLatestTimelineEvent(
    timelineEvents,
    "agent_dry_run_completed",
  );
  const readinessEvent =
    getLatestTimelineEvent(timelineEvents, "execution_payload_ready_for_agent") ??
    dryRunEvent;
  const effectiveDryRunStatus =
    dryRunStatus ??
    (dryRunEvent?.metadata?.dry_run_passed === true
      ? "dry_run_passed"
      : dryRunEvent?.metadata?.dry_run_passed === false
        ? "dry_run_failed"
        : null);
  const effectiveReadinessStatus =
    agentReadinessStatus ??
    (typeof readinessEvent?.metadata?.agent_readiness_status === "string"
      ? readinessEvent.metadata.agent_readiness_status
      : null);
  const effectiveReadinessScore =
    agentReadinessScore ??
    (typeof readinessEvent?.metadata?.agent_readiness_score === "number"
      ? readinessEvent.metadata.agent_readiness_score
      : null);

  function add(item: HandoffQualityFactor) {
    factors.push(item);
    score += item.points;

    if (
      item.impact === "negative" &&
      (item.points <= -20 ||
        item.code.includes("failed") ||
        item.code.includes("insufficient"))
    ) {
      criticalNegative = true;
    }
  }

  if (executionMetadata.handoff_session_id) {
    add(
      factor(
        "handoff_session_present",
        "Handoff session recorded",
        "positive",
        "A stable handoff session id ties the audit trail together.",
        0,
      ),
    );
  } else {
    add(
      factor(
        "handoff_session_missing",
        "Handoff session missing",
        "warning",
        "Older trades may not have a handoff session id.",
        -15,
      ),
    );
  }

  if (executionMetadata.execution_payload_id) {
    add(
      factor(
        "payload_id_present",
        "Payload id recorded",
        "positive",
        "Execution payload id is available.",
        2,
      ),
    );
  } else {
    add(
      factor(
        "payload_id_missing",
        "Payload id missing",
        "warning",
        "Execution payload id is missing.",
        -10,
      ),
    );
  }

  if (executionMetadata.execution_payload_fingerprint) {
    add(
      factor(
        "payload_fingerprint_present",
        "Payload fingerprint recorded",
        "positive",
        "Payload fingerprint is available for review.",
        2,
      ),
    );
  } else {
    add(
      factor(
        "payload_fingerprint_missing",
        "Payload fingerprint missing",
        "warning",
        "Payload fingerprint is missing.",
        -10,
      ),
    );
  }

  if (executionMetadata.broker_confirmed_at) {
    add(
      factor(
        "manual_confirmation_recorded",
        "Manual confirmation recorded",
        "positive",
        "Broker confirmation timestamp is recorded.",
        3,
      ),
    );
  }

  if (hasTimelineEvent(timelineEvents, "broker_plan_match_checked")) {
    add(
      factor(
        "broker_plan_match_recorded",
        "Broker plan match recorded",
        "positive",
        "The broker order match checkbox was recorded locally.",
        3,
      ),
    );
  }

  if (executionMetadata.handoff_integrity?.status === "passed") {
    add(
      factor(
        "integrity_passed",
        "Integrity passed",
        "positive",
        "Handoff integrity check passed.",
        4,
      ),
    );
  } else if (executionMetadata.handoff_integrity?.status === "warning") {
    add(
      factor(
        "integrity_warning",
        "Integrity warning",
        "warning",
        "Handoff integrity completed with warnings.",
        -10,
      ),
    );
  } else if (executionMetadata.handoff_integrity?.status === "failed") {
    add(
      factor(
        "integrity_failed",
        "Integrity failed",
        "negative",
        "Handoff integrity failed.",
        -35,
      ),
    );
  }

  if (effectiveDryRunStatus === "dry_run_passed") {
    add(
      factor(
        "dry_run_passed",
        "Dry run passed",
        "positive",
        "Pre-agent dry run passed.",
        4,
      ),
    );
  } else if (effectiveDryRunStatus === "dry_run_failed") {
    add(
      factor(
        "dry_run_failed",
        "Dry run failed",
        "negative",
        "Pre-agent dry run failed.",
        -30,
      ),
    );
  } else {
    add(
      factor(
        "dry_run_missing",
        "Dry run missing",
        "warning",
        "No pre-agent dry run was found.",
        -8,
      ),
    );
  }

  if (handoffReplay?.overall_status === "complete") {
    add(
      factor(
        "replay_complete",
        "Replay complete",
        "positive",
        "Handoff replay has all key steps.",
        3,
      ),
    );
  } else if (handoffReplay?.overall_status === "partial") {
    add(
      factor(
        "replay_partial",
        "Replay partial",
        "warning",
        "Some handoff replay steps are missing.",
        -8,
      ),
    );
  } else if (handoffReplay?.overall_status === "failed") {
    add(
      factor(
        "replay_failed",
        "Replay failed",
        "negative",
        "Handoff replay contains a failed step.",
        -25,
      ),
    );
  }

  if (executionMetadata.broker_order_preview) {
    if (executionMetadata.broker_order_preview.warning_type === "none") {
      add(
        factor(
          "broker_preview_clean",
          "Broker preview clean",
          "positive",
          "Broker preview was captured without warnings.",
          3,
        ),
      );
    } else {
      const severeWarning =
        executionMetadata.broker_order_preview.warning_type ===
          "buying_power_warning" ||
        executionMetadata.broker_order_preview.warning_type === "instrument_warning";
      add(
        factor(
          `broker_preview_${executionMetadata.broker_order_preview.warning_type}`,
          "Broker preview warning",
          severeWarning ? "negative" : "warning",
          "Broker preview included a warning.",
          severeWarning ? -20 : -8,
        ),
      );
    }

    if (executionMetadata.broker_order_preview.buying_power_status === "insufficient") {
      add(
        factor(
          "buying_power_insufficient",
          "Buying power insufficient",
          "negative",
          "Broker preview indicated insufficient buying power.",
          -35,
        ),
      );
    } else if (
      executionMetadata.broker_order_preview.buying_power_status === "warning" ||
      executionMetadata.broker_order_preview.buying_power_status === "unknown"
    ) {
      add(
        factor(
          `buying_power_${executionMetadata.broker_order_preview.buying_power_status}`,
          "Buying power needs review",
          "warning",
          "Buying power was warning or unknown.",
          -8,
        ),
      );
    }
  } else {
    add(
      factor(
        "broker_preview_missing",
        "Broker preview missing",
        "warning",
        "No broker preview was captured.",
        -8,
      ),
    );
  }

  if (!executionMetadata.broker_cost_estimate?.enabled) {
    add(
      factor(
        "cost_estimate_missing",
        "Cost estimate missing",
        "warning",
        "Broker cost estimate is missing or disabled.",
        -5,
      ),
    );
  }

  if (executionQualityMetrics?.quality_rating === "excellent") {
    add(
      factor(
        "execution_quality_excellent",
        "Execution quality excellent",
        "positive",
        "Execution quality was rated excellent.",
        3,
      ),
    );
  } else if (executionQualityMetrics?.quality_rating === "good") {
    add(
      factor(
        "execution_quality_good",
        "Execution quality good",
        "positive",
        "Execution quality was rated good.",
        2,
      ),
    );
  } else if (executionQualityMetrics?.quality_rating === "poor") {
    add(
      factor(
        "execution_quality_poor",
        "Execution quality poor",
        "negative",
        "Execution quality was rated poor.",
        -20,
      ),
    );
  }

  if (
    executionQualityMetrics?.slippage_percent !== null &&
    executionQualityMetrics?.slippage_percent !== undefined &&
    executionQualityMetrics.slippage_percent > 0.15
  ) {
    add(
      factor(
        "slippage_worse_than_threshold",
        "Slippage above threshold",
        "warning",
        "Entry slippage was worse than 0.15%.",
        -15,
      ),
    );
  }

  if (executionMetadata.actual_shares !== executionMetadata.planned_shares) {
    add(
      factor(
        "actual_shares_differ",
        "Shares differ from plan",
        "warning",
        "Actual shares differ from planned shares.",
        severePartialFill(executionMetadata) ? -15 : -8,
      ),
    );
  }

  if (materialFillDifference(executionMetadata)) {
    add(
      factor(
        "actual_fill_differs",
        "Actual fill differs",
        "warning",
        "Actual fill differs materially from planned entry.",
        -10,
      ),
    );
  }

  if (executionMetadata.broker_order_status === "partially_filled") {
    add(
      factor(
        "partial_fill",
        "Partial fill",
        "warning",
        "Broker order was partially filled.",
        severePartialFill(executionMetadata) ? -15 : -8,
      ),
    );
  }

  if (effectiveReadinessStatus === "warning") {
    add(
      factor(
        "readiness_warning",
        "Readiness warning",
        "warning",
        `Agent readiness was warning${
          effectiveReadinessScore === null || effectiveReadinessScore === undefined
            ? ""
            : ` (${effectiveReadinessScore}/100)`
        }.`,
        -5,
      ),
    );
  }

  const finalScore = clampScore(score);
  const rating: HandoffQualityRating =
    factors.length <= 1
      ? "unknown"
      : criticalNegative || finalScore < 60
        ? "poor"
        : finalScore >= 90
          ? "excellent"
          : finalScore >= 75
            ? "good"
            : "acceptable";

  return {
    rating,
    score: finalScore,
    label: ratingLabel(rating),
    summary:
      rating === "excellent"
        ? "Handoff quality is excellent with a complete and clean audit trail."
        : rating === "good"
          ? "Handoff quality is good with only minor gaps or warnings."
          : rating === "acceptable"
            ? "Handoff quality is acceptable but has review-worthy gaps."
            : rating === "poor"
              ? "Handoff quality is poor due to failed or material warning factors."
              : "Not enough handoff data exists to score quality.",
    factors,
    calculated_at: calculatedAt,
  };
}
