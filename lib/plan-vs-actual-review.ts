import type { BrokerExecutionMetadata } from "@/lib/broker-execution-metadata";
import type { TradePlanningSnapshot } from "@/lib/trade-planning-snapshot";

export type PlanVsActualStatus =
  | "followed_plan"
  | "minor_deviation"
  | "major_deviation"
  | "needs_review"
  | "incomplete";

export type PlanVsActualGrade = "A" | "B" | "C" | "D" | "F" | "unknown";

export type PlanVsActualCheck = {
  check_id: string;
  label: string;
  status: "passed" | "warning" | "failed" | "incomplete";
  message: string;
};

export type PlanVsActualDeviation = {
  deviation_id: string;
  severity: "minor" | "major";
  message: string;
};

export type PlanVsActualWarning = {
  warning_id: string;
  message: string;
};

export type PlanVsActualMetric = {
  metric_id: string;
  label: string;
  planned_value: number | string | null;
  actual_value: number | string | null;
  unit: "shares" | "currency" | "percent" | "r_multiple" | "status" | "ratio";
};

export type PlanVsActualReview = {
  review_id: string;
  review_version: "1.0";
  review_kind: "plan_vs_actual_review";
  created_at: string;
  status: PlanVsActualStatus;
  grade: PlanVsActualGrade;
  process_summary: string;
  checks: PlanVsActualCheck[];
  deviations: PlanVsActualDeviation[];
  warnings: PlanVsActualWarning[];
  metrics: PlanVsActualMetric[];
  quantity_deviation_percent: number | null;
  risk_deviation_percent: number | null;
  reward_capture_percent: number | null;
  realized_vs_planned_r: number | null;
  snapshot_id: string | null;
};

export type BuildPlanVsActualReviewInput = {
  ticker?: string | null;
  snapshot?: TradePlanningSnapshot | null;
  executionMetadata?: BrokerExecutionMetadata | null;
  entryPrice?: number | null;
  exitPrice?: number | null;
  shares?: number | null;
  realizedPnl?: number | null;
  realizedR?: number | null;
  closeReason?: string | null;
  isDemo?: boolean;
  now?: Date;
};

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function percentDeviation(planned: number | null, actual: number | null) {
  if (planned === null || actual === null || planned <= 0) {
    return null;
  }

  return ((actual - planned) / planned) * 100;
}

function sumFillShares(
  fills: Array<{ shares?: number | null }> | null | undefined,
) {
  if (!fills || fills.length === 0) {
    return null;
  }

  const total = fills.reduce((sum, fill) => {
    const shares = finiteNumber(fill.shares);
    return shares === null ? sum : sum + shares;
  }, 0);

  return total > 0 ? total : null;
}

export function calculateQuantityDeviation(input: {
  plannedQuantity?: number | null;
  actualEntryShares?: number | null;
}): number | null {
  return percentDeviation(
    finiteNumber(input.plannedQuantity),
    finiteNumber(input.actualEntryShares),
  );
}

export function calculateRiskDeviation(input: {
  plannedRiskAmount?: number | null;
  realizedPnl?: number | null;
}): number | null {
  const plannedRisk = finiteNumber(input.plannedRiskAmount);
  const pnl = finiteNumber(input.realizedPnl);

  if (plannedRisk === null || plannedRisk <= 0 || pnl === null || pnl >= 0) {
    return null;
  }

  return ((Math.abs(pnl) - plannedRisk) / plannedRisk) * 100;
}

export function calculateRewardOutcome(input: {
  plannedRewardAmount?: number | null;
  realizedPnl?: number | null;
}): number | null {
  const plannedReward = finiteNumber(input.plannedRewardAmount);
  const pnl = finiteNumber(input.realizedPnl);

  if (plannedReward === null || plannedReward <= 0 || pnl === null) {
    return null;
  }

  return (pnl / plannedReward) * 100;
}

export function calculateRealizedVsPlannedR(input: {
  plannedRiskRewardRatio?: number | null;
  realizedR?: number | null;
}): number | null {
  const plannedR = finiteNumber(input.plannedRiskRewardRatio);
  const realizedR = finiteNumber(input.realizedR);

  if (plannedR === null || plannedR === 0 || realizedR === null) {
    return null;
  }

  return realizedR / plannedR;
}

function check(
  checkId: string,
  label: string,
  status: PlanVsActualCheck["status"],
  message: string,
): PlanVsActualCheck {
  return { check_id: checkId, label, status, message };
}

function deviation(
  deviationId: string,
  severity: PlanVsActualDeviation["severity"],
  message: string,
): PlanVsActualDeviation {
  return { deviation_id: deviationId, severity, message };
}

function warning(warningId: string, message: string): PlanVsActualWarning {
  return { warning_id: warningId, message };
}

function metric(
  metricId: string,
  label: string,
  plannedValue: PlanVsActualMetric["planned_value"],
  actualValue: PlanVsActualMetric["actual_value"],
  unit: PlanVsActualMetric["unit"],
): PlanVsActualMetric {
  return {
    metric_id: metricId,
    label,
    planned_value: plannedValue,
    actual_value: actualValue,
    unit,
  };
}

export function buildPlanVsActualReview(
  input: BuildPlanVsActualReviewInput,
): PlanVsActualReview {
  const now = input.now ?? new Date();
  const snapshot = input.snapshot ?? input.executionMetadata?.trade_planning_snapshot ?? null;
  const checks: PlanVsActualCheck[] = [];
  const deviations: PlanVsActualDeviation[] = [];
  const warnings: PlanVsActualWarning[] = [];
  const metadata = input.executionMetadata ?? null;
  const realizedPnl =
    finiteNumber(metadata?.realized_pnl_from_exits) ??
    finiteNumber(input.realizedPnl);
  const realizedR = finiteNumber(input.realizedR);

  if (!snapshot) {
    return {
      review_id: `plan-vs-actual-${input.ticker ?? "unknown"}-no-snapshot`,
      review_version: "1.0",
      review_kind: "plan_vs_actual_review",
      created_at: now.toISOString(),
      status: "incomplete",
      grade: "unknown",
      process_summary:
        "No frozen planning snapshot is available, so plan adherence cannot be reviewed.",
      checks: [
        check(
          "planning_snapshot",
          "Planning Snapshot",
          "incomplete",
          "No creation-time planning snapshot was stored for this trade.",
        ),
      ],
      deviations,
      warnings: [
        warning(
          "missing_planning_snapshot",
          "Older trades may not have plan-vs-actual metadata.",
        ),
      ],
      metrics: [],
      quantity_deviation_percent: null,
      risk_deviation_percent: null,
      reward_capture_percent: null,
      realized_vs_planned_r: null,
      snapshot_id: null,
    };
  }

  const actualEntryShares =
    finiteNumber(snapshot.actual_entry_shares) ??
    finiteNumber(metadata?.actual_entry_shares) ??
    finiteNumber(metadata?.actual_shares) ??
    sumFillShares(metadata?.entry_fills) ??
    finiteNumber(input.shares);
  const plannedQuantity =
    finiteNumber(snapshot.planned_quantity) ?? finiteNumber(metadata?.planned_quantity);
  const recommendedQuantity = finiteNumber(snapshot.recommended_quantity);
  const plannedRisk = finiteNumber(snapshot.estimated_risk_amount);
  const plannedReward = finiteNumber(snapshot.estimated_reward_amount);
  const plannedRiskReward = finiteNumber(snapshot.risk_reward_ratio);
  const exitPrice =
    finiteNumber(metadata?.average_exit_price) ?? finiteNumber(input.exitPrice);
  const partialStatus = nullableString(metadata?.partial_position_status);
  const remainingShares = finiteNumber(metadata?.remaining_shares);
  const quantityDeviationPercent = calculateQuantityDeviation({
    plannedQuantity,
    actualEntryShares,
  });
  const riskDeviationPercent = calculateRiskDeviation({
    plannedRiskAmount: plannedRisk,
    realizedPnl,
  });
  const rewardCapturePercent = calculateRewardOutcome({
    plannedRewardAmount: plannedReward,
    realizedPnl,
  });
  const realizedVsPlannedR = calculateRealizedVsPlannedR({
    plannedRiskRewardRatio: plannedRiskReward,
    realizedR,
  });

  checks.push(
    check(
      "snapshot_available",
      "Planning Snapshot",
      "passed",
      "Creation-time planning snapshot is available.",
    ),
  );

  if (actualEntryShares === null || plannedQuantity === null) {
    checks.push(
      check(
        "quantity_available",
        "Quantity",
        "incomplete",
        "Planned or actual entry quantity is missing.",
      ),
    );
    warnings.push(
      warning("missing_quantity_data", "Quantity adherence cannot be fully reviewed."),
    );
  } else if (
    quantityDeviationPercent !== null &&
    Math.abs(quantityDeviationPercent) > 10
  ) {
    checks.push(
      check(
        "quantity_match",
        "Quantity",
        "warning",
        "Actual entry shares materially differ from planned quantity.",
      ),
    );
    deviations.push(
      deviation(
        "quantity_material_deviation",
        "minor",
        "Actual entry shares differ from planned quantity by more than 10%.",
      ),
    );
  } else {
    checks.push(
      check(
        "quantity_match",
        "Quantity",
        "passed",
        "Actual entry shares are close to planned quantity.",
      ),
    );
  }

  if (
    recommendedQuantity !== null &&
    actualEntryShares !== null &&
    actualEntryShares > recommendedQuantity
  ) {
    const severity =
      actualEntryShares > recommendedQuantity * 1.15 ? "major" : "minor";
    checks.push(
      check(
        "recommended_quantity",
        "Recommended Quantity",
        severity === "major" ? "failed" : "warning",
        "Actual entry shares exceeded the recommended quantity.",
      ),
    );
    deviations.push(
      deviation(
        "actual_above_recommended_quantity",
        severity,
        "Actual entry shares were above the position sizing recommendation.",
      ),
    );
  } else if (recommendedQuantity !== null) {
    checks.push(
      check(
        "recommended_quantity",
        "Recommended Quantity",
        "passed",
        "Actual entry shares did not exceed recommended quantity.",
      ),
    );
  }

  if (exitPrice === null || realizedPnl === null) {
    checks.push(
      check(
        "outcome_complete",
        "Outcome Data",
        "incomplete",
        "Exit price or realized PnL is missing.",
      ),
    );
    warnings.push(
      warning("missing_outcome_data", "Final outcome data is incomplete."),
    );
  } else {
    checks.push(
      check(
        "outcome_complete",
        "Outcome Data",
        "passed",
        "Realized outcome data is available.",
      ),
    );
  }

  if (
    riskDeviationPercent !== null &&
    riskDeviationPercent > 10
  ) {
    const severity = riskDeviationPercent > 25 ? "major" : "minor";
    checks.push(
      check(
        "planned_risk_respected",
        "Planned Risk",
        severity === "major" ? "failed" : "warning",
        "Realized loss exceeded planned risk.",
      ),
    );
    deviations.push(
      deviation(
        "realized_loss_exceeded_planned_risk",
        severity,
        "Realized loss was materially larger than the planned risk amount.",
      ),
    );
  } else if (plannedRisk !== null && realizedPnl !== null) {
    checks.push(
      check(
        "planned_risk_respected",
        "Planned Risk",
        "passed",
        "Realized outcome stayed within the planned risk boundary.",
      ),
    );
  }

  if (
    partialStatus === "partially_closed" ||
    (remainingShares !== null && remainingShares > 0)
  ) {
    checks.push(
      check(
        "partial_position",
        "Partial Position",
        "warning",
        "Trade has partial-close state or remaining shares.",
      ),
    );
    deviations.push(
      deviation(
        "partial_close_needs_review",
        "minor",
        "Partial close outcome should be reviewed separately from full-close outcomes.",
      ),
    );
  }

  if (metadata?.broker_exit_confirmation?.user_manually_confirmed_sell === false) {
    checks.push(
      check(
        "manual_sell_confirmation",
        "Manual SÄLJ Confirmation",
        "failed",
        "Manual sell confirmation was not recorded.",
      ),
    );
    deviations.push(
      deviation(
        "missing_manual_sell_confirmation",
        "major",
        "Manual SÄLJ confirmation is missing from exit metadata.",
      ),
    );
  }

  const hasIncomplete = checks.some((item) => item.status === "incomplete");
  const hasMajorDeviation = deviations.some((item) => item.severity === "major");
  const hasMinorDeviation = deviations.some((item) => item.severity === "minor");
  const hasFailed = checks.some((item) => item.status === "failed");
  const status: PlanVsActualStatus = hasIncomplete
    ? "incomplete"
    : hasFailed || hasMajorDeviation
      ? "major_deviation"
      : partialStatus === "partially_closed"
        ? "needs_review"
        : hasMinorDeviation
          ? "minor_deviation"
          : "followed_plan";
  const grade: PlanVsActualGrade =
    status === "followed_plan"
      ? "A"
      : status === "minor_deviation"
        ? "B"
        : status === "needs_review"
          ? "C"
          : status === "major_deviation"
            ? riskDeviationPercent !== null && riskDeviationPercent > 50
              ? "F"
              : "D"
            : "unknown";

  return {
    review_id: [
      "plan-vs-actual",
      snapshot.snapshot_id,
      status,
      deviations.length,
    ].join("-"),
    review_version: "1.0",
    review_kind: "plan_vs_actual_review",
    created_at: now.toISOString(),
    status,
    grade,
    process_summary: getProcessSummary(status),
    checks,
    deviations,
    warnings,
    metrics: [
      metric("quantity", "Quantity", plannedQuantity, actualEntryShares, "shares"),
      metric(
        "recommended_quantity",
        "Recommended Quantity",
        recommendedQuantity,
        actualEntryShares,
        "shares",
      ),
      metric("risk", "Risk", plannedRisk, realizedPnl, "currency"),
      metric("reward", "Reward", plannedReward, realizedPnl, "currency"),
      metric("risk_reward", "Planned R/R", plannedRiskReward, realizedR, "ratio"),
      metric("partial_status", "Partial Status", "fully_closed", partialStatus, "status"),
    ],
    quantity_deviation_percent: quantityDeviationPercent,
    risk_deviation_percent: riskDeviationPercent,
    reward_capture_percent: rewardCapturePercent,
    realized_vs_planned_r: realizedVsPlannedR,
    snapshot_id: snapshot.snapshot_id,
  };
}

function getProcessSummary(status: PlanVsActualStatus) {
  if (status === "followed_plan") {
    return "The available data suggests the trade followed the creation-time plan. A losing trade can still follow the plan if the loss stayed within planned risk.";
  }

  if (status === "minor_deviation") {
    return "The trade mostly followed the plan, with minor sizing, execution, or outcome deviations to review.";
  }

  if (status === "major_deviation") {
    return "The trade shows a major deviation from the creation-time plan or risk boundary.";
  }

  if (status === "needs_review") {
    return "The trade needs human review, usually because partial fills/exits or process metadata require interpretation.";
  }

  return "Plan-vs-actual review is incomplete because required planning or outcome data is missing.";
}

export function planVsActualReviewJson(review: PlanVsActualReview): string {
  return JSON.stringify(review, null, 2);
}
