export type TradePlanQualityStatus =
  | "excellent"
  | "ok"
  | "warning"
  | "blocked"
  | "incomplete";

export type TradePlanQualityGrade = "A" | "B" | "C" | "D" | "F" | "unknown";

export type TradePlanQualityCheck = {
  check_id: string;
  label: string;
  status: "passed" | "warning" | "failed" | "incomplete" | "context";
  message: string;
};

export type TradePlanQualityWarning = {
  warning_id: string;
  message: string;
};

export type TradePlanQualityBlocker = {
  blocker_id: string;
  message: string;
  blocks_create_live_trade: boolean;
};

export type TradePlanQualityAssumption = {
  assumption_id: string;
  message: string;
};

export type TradePlanQualityInput = {
  ticker?: string | null;
  side?: "long" | "short" | null;
  entryPrice?: number | null;
  stopPrice?: number | null;
  targetPrice?: number | null;
  currentPrice?: number | null;
  plannedQuantity?: number | null;
  setupType?: string | null;
  confidenceScore?: number | null;
  marketSessionPhase?: string | null;
  marketSessionRisk?: string | null;
  positionSizingStatus?: string | null;
  positionSizingBlocksCreate?: boolean | null;
  riskControlsStatus?: string | null;
  riskControlsBlocksNewTrade?: boolean | null;
  riskControlsMode?: string | null;
  now?: Date;
};

export type TradePlanQualityResult = {
  result_id: string;
  result_version: "1.0";
  result_kind: "trade_plan_quality";
  evaluated_at: string;
  ticker: string | null;
  side: "long" | "short";
  status: TradePlanQualityStatus;
  grade: TradePlanQualityGrade;
  entry_price: number | null;
  stop_price: number | null;
  target_price: number | null;
  current_price: number | null;
  planned_quantity: number | null;
  setup_type: string | null;
  confidence_score: number | null;
  risk_per_share: number | null;
  reward_per_share: number | null;
  risk_reward_ratio: number | null;
  stop_distance_percent: number | null;
  target_distance_percent: number | null;
  market_session_phase: string | null;
  market_session_risk: string | null;
  blocks_create_live_trade: boolean;
  checks: TradePlanQualityCheck[];
  warnings: TradePlanQualityWarning[];
  blockers: TradePlanQualityBlocker[];
  assumptions: TradePlanQualityAssumption[];
  next_action: string;
};

export function calculateTradePlanRiskReward(input: {
  entryPrice?: number | null;
  stopPrice?: number | null;
  targetPrice?: number | null;
  side?: "long" | "short" | null;
}): {
  risk_per_share: number | null;
  reward_per_share: number | null;
  risk_reward_ratio: number | null;
  stop_distance_percent: number | null;
  target_distance_percent: number | null;
} {
  const side = input.side === "short" ? "short" : "long";
  const entry = finitePositiveNumber(input.entryPrice);
  const stop = finitePositiveNumber(input.stopPrice);
  const target = finitePositiveNumber(input.targetPrice);
  const risk =
    entry !== null && stop !== null
      ? finitePositiveNumber(side === "short" ? stop - entry : entry - stop)
      : null;
  const reward =
    entry !== null && target !== null
      ? finiteNumber(side === "short" ? entry - target : target - entry)
      : null;
  const ratio =
    risk !== null && reward !== null ? finiteNumber(reward / risk) : null;

  return {
    risk_per_share: risk,
    reward_per_share: reward,
    risk_reward_ratio: ratio,
    stop_distance_percent:
      entry !== null && risk !== null ? finiteNumber((risk / entry) * 100) : null,
    target_distance_percent:
      entry !== null && reward !== null
        ? finiteNumber((reward / entry) * 100)
        : null,
  };
}

export function evaluateEntryStopTargetLogic(
  input: TradePlanQualityInput,
): {
  checks: TradePlanQualityCheck[];
  blockers: TradePlanQualityBlocker[];
} {
  const side = input.side === "short" ? "short" : "long";
  const entry = finitePositiveNumber(input.entryPrice);
  const stop = finitePositiveNumber(input.stopPrice);
  const target = finitePositiveNumber(input.targetPrice);
  const checks: TradePlanQualityCheck[] = [];
  const blockers: TradePlanQualityBlocker[] = [];

  addRequiredPriceCheck(checks, blockers, "entry", "Entry", entry);
  addRequiredPriceCheck(checks, blockers, "stop", "Stop", stop);
  addRequiredPriceCheck(checks, blockers, "target", "Target", target);

  if (entry !== null && stop !== null) {
    const valid = side === "short" ? stop > entry : stop < entry;
    checks.push({
      check_id: "entry_stop_relationship",
      label: "Entry / Stop",
      status: valid ? "passed" : "failed",
      message: valid
        ? "Entry and stop relationship is valid."
        : side === "short"
          ? "Stop must be above entry for a short plan."
          : "Stop must be below entry for a long plan.",
    });

    if (!valid) {
      blockers.push(
        blocker(
          "invalid_entry_stop_relationship",
          side === "short"
            ? "Stop must be above entry for a short plan."
            : "Stop must be below entry for a long plan.",
          true,
        ),
      );
    }
  }

  if (entry !== null && target !== null) {
    const valid = side === "short" ? target < entry : target > entry;
    checks.push({
      check_id: "entry_target_relationship",
      label: "Entry / Target",
      status: valid ? "passed" : "failed",
      message: valid
        ? "Entry and target relationship is valid."
        : side === "short"
          ? "Target must be below entry for a short plan."
          : "Target must be above entry for a long plan.",
    });

    if (!valid) {
      blockers.push(
        blocker(
          "invalid_entry_target_relationship",
          side === "short"
            ? "Target must be below entry for a short plan."
            : "Target must be above entry for a long plan.",
          true,
        ),
      );
    }
  }

  return { checks, blockers };
}

export function evaluateRiskRewardQuality(input: {
  riskRewardRatio?: number | null;
  strictMode?: boolean;
}): {
  check: TradePlanQualityCheck;
  warnings: TradePlanQualityWarning[];
  blockers: TradePlanQualityBlocker[];
} {
  const ratio = finiteNumber(input.riskRewardRatio);
  const warnings: TradePlanQualityWarning[] = [];
  const blockers: TradePlanQualityBlocker[] = [];

  // Deterministic v1 tiers:
  // <1.0 poor, 1.0-1.5 weak, 1.5-2.0 acceptable, >=2.0 strong.
  if (ratio === null) {
    return {
      check: {
        check_id: "risk_reward_quality",
        label: "Risk / Reward",
        status: "incomplete",
        message: "Risk/reward cannot be calculated yet.",
      },
      warnings,
      blockers,
    };
  }

  if (ratio < 1) {
    const message = "Risk/reward is below 1.0R.";
    if (input.strictMode) {
      blockers.push(blocker("risk_reward_below_one", message, true));
    } else {
      warnings.push(warning("risk_reward_below_one", message));
    }

    return {
      check: {
        check_id: "risk_reward_quality",
        label: "Risk / Reward",
        status: input.strictMode ? "failed" : "warning",
        message,
      },
      warnings,
      blockers,
    };
  }

  if (ratio < 1.5) {
    const message = "Risk/reward is weak at 1.0-1.5R.";
    warnings.push(warning("risk_reward_weak", message));
    return {
      check: {
        check_id: "risk_reward_quality",
        label: "Risk / Reward",
        status: "warning",
        message,
      },
      warnings,
      blockers,
    };
  }

  if (ratio < 2) {
    return {
      check: {
        check_id: "risk_reward_quality",
        label: "Risk / Reward",
        status: "passed",
        message: "Risk/reward is acceptable at 1.5-2.0R.",
      },
      warnings,
      blockers,
    };
  }

  return {
    check: {
      check_id: "risk_reward_quality",
      label: "Risk / Reward",
      status: "passed",
      message: "Risk/reward is strong at 2.0R or better.",
    },
    warnings,
    blockers,
  };
}

export function evaluateStopDistance(input: {
  stopDistancePercent?: number | null;
}): {
  check: TradePlanQualityCheck;
  warnings: TradePlanQualityWarning[];
} {
  const percent = finiteNumber(input.stopDistancePercent);
  const warnings: TradePlanQualityWarning[] = [];

  // V1 stop-distance thresholds are intentionally simple:
  // <0.15% may be too tight; >5% may be too wide for a day-trade plan.
  if (percent === null) {
    return {
      check: {
        check_id: "stop_distance",
        label: "Stop Distance",
        status: "incomplete",
        message: "Stop distance cannot be calculated yet.",
      },
      warnings,
    };
  }

  if (percent < 0.15) {
    const message = "Stop distance is very tight relative to entry.";
    warnings.push(warning("stop_distance_too_tight", message));
    return {
      check: {
        check_id: "stop_distance",
        label: "Stop Distance",
        status: "warning",
        message,
      },
      warnings,
    };
  }

  if (percent > 5) {
    const message = "Stop distance is wide relative to entry.";
    warnings.push(warning("stop_distance_too_wide", message));
    return {
      check: {
        check_id: "stop_distance",
        label: "Stop Distance",
        status: "warning",
        message,
      },
      warnings,
    };
  }

  return {
    check: {
      check_id: "stop_distance",
      label: "Stop Distance",
      status: "passed",
      message: "Stop distance is within v1 day-trade bounds.",
    },
    warnings,
  };
}

export function evaluateTargetDistance(input: {
  targetDistancePercent?: number | null;
}): {
  check: TradePlanQualityCheck;
  warnings: TradePlanQualityWarning[];
} {
  const percent = finiteNumber(input.targetDistancePercent);
  const warnings: TradePlanQualityWarning[] = [];

  if (percent === null) {
    return {
      check: {
        check_id: "target_distance",
        label: "Target Distance",
        status: "incomplete",
        message: "Target distance cannot be calculated yet.",
      },
      warnings,
    };
  }

  if (percent < 0.3) {
    const message = "Target is very close to entry.";
    warnings.push(warning("target_distance_too_close", message));
    return {
      check: {
        check_id: "target_distance",
        label: "Target Distance",
        status: "warning",
        message,
      },
      warnings,
    };
  }

  return {
    check: {
      check_id: "target_distance",
      label: "Target Distance",
      status: "passed",
      message: "Target distance is usable for v1 plan review.",
    },
    warnings,
  };
}

export function buildTradePlanQualityResult(
  input: TradePlanQualityInput,
): TradePlanQualityResult {
  const now = input.now ?? new Date();
  const side = input.side === "short" ? "short" : "long";
  const ticker = normalizeTicker(input.ticker);
  const strictMode = input.riskControlsMode === "strict";
  const entry = finitePositiveNumber(input.entryPrice);
  const stop = finitePositiveNumber(input.stopPrice);
  const target = finitePositiveNumber(input.targetPrice);
  const current = finitePositiveNumber(input.currentPrice);
  const plannedQuantity = finitePositiveInteger(input.plannedQuantity);
  const confidenceScore = finiteNumber(input.confidenceScore);
  const checks: TradePlanQualityCheck[] = [];
  const warnings: TradePlanQualityWarning[] = [];
  const blockers: TradePlanQualityBlocker[] = [];
  const assumptions: TradePlanQualityAssumption[] = [
    {
      assumption_id: "long_primary_model",
      message:
        side === "long"
          ? "Trade Plan Quality v1 assumes long day-trade price relationships."
          : "Short support is defensive and should be reviewed manually.",
    },
    {
      assumption_id: "read_only_validation",
      message:
        "Trade Plan Quality is read-only and does not mutate payload, order, or recommendation values.",
    },
  ];
  const riskReward = calculateTradePlanRiskReward({
    entryPrice: entry,
    stopPrice: stop,
    targetPrice: target,
    side,
  });
  const entryStopTarget = evaluateEntryStopTargetLogic({
    ...input,
    entryPrice: entry,
    stopPrice: stop,
    targetPrice: target,
    side,
  });
  checks.push(...entryStopTarget.checks);
  blockers.push(...entryStopTarget.blockers);

  const riskRewardQuality = evaluateRiskRewardQuality({
    riskRewardRatio: riskReward.risk_reward_ratio,
    strictMode,
  });
  checks.push(riskRewardQuality.check);
  warnings.push(...riskRewardQuality.warnings);
  blockers.push(...riskRewardQuality.blockers);

  const stopDistance = evaluateStopDistance({
    stopDistancePercent: riskReward.stop_distance_percent,
  });
  checks.push(stopDistance.check);
  warnings.push(...stopDistance.warnings);

  const targetDistance = evaluateTargetDistance({
    targetDistancePercent: riskReward.target_distance_percent,
  });
  checks.push(targetDistance.check);
  warnings.push(...targetDistance.warnings);

  addContextChecks({
    checks,
    warnings,
    input,
    current,
    entry,
    stop,
    target,
    side,
  });

  const blocksCreateLiveTrade = blockers.some(
    (item) => item.blocks_create_live_trade,
  );
  const incomplete = checks.some((check) => check.status === "incomplete");
  const status = getOverallStatus({
    riskRewardRatio: riskReward.risk_reward_ratio,
    incomplete,
    blockers,
    warnings,
  });
  const grade = getGrade(status, riskReward.risk_reward_ratio);

  return {
    result_id: [
      "trade-plan-quality",
      ticker ?? "unknown",
      entry ?? "na",
      stop ?? "na",
      target ?? "na",
      riskReward.risk_reward_ratio ?? "na",
    ].join("-"),
    result_version: "1.0",
    result_kind: "trade_plan_quality",
    evaluated_at: now.toISOString(),
    ticker,
    side,
    status,
    grade,
    entry_price: entry,
    stop_price: stop,
    target_price: target,
    current_price: current,
    planned_quantity: plannedQuantity,
    setup_type: input.setupType?.trim() || null,
    confidence_score: confidenceScore,
    risk_per_share: riskReward.risk_per_share,
    reward_per_share: riskReward.reward_per_share,
    risk_reward_ratio: riskReward.risk_reward_ratio,
    stop_distance_percent: riskReward.stop_distance_percent,
    target_distance_percent: riskReward.target_distance_percent,
    market_session_phase: input.marketSessionPhase ?? null,
    market_session_risk: input.marketSessionRisk ?? null,
    blocks_create_live_trade: blocksCreateLiveTrade,
    checks,
    warnings,
    blockers,
    assumptions,
    next_action: getNextAction({
      status,
      blockers,
      warnings,
      riskRewardRatio: riskReward.risk_reward_ratio,
    }),
  };
}

export function tradePlanQualityResultJson(
  result: TradePlanQualityResult,
): string {
  return JSON.stringify(result, null, 2);
}

function addContextChecks(input: {
  checks: TradePlanQualityCheck[];
  warnings: TradePlanQualityWarning[];
  input: TradePlanQualityInput;
  current: number | null;
  entry: number | null;
  stop: number | null;
  target: number | null;
  side: "long" | "short";
}) {
  const { checks, warnings } = input;

  if (
    input.current !== null &&
    input.target !== null &&
    (input.side === "short"
      ? input.current <= input.target
      : input.current >= input.target)
  ) {
    const message = "Current price is already at or beyond the target area.";
    checks.push({
      check_id: "current_price_vs_target",
      label: "Current / Target",
      status: "warning",
      message,
    });
    warnings.push(warning("current_price_already_at_target", message));
  }

  if (
    input.current !== null &&
    input.stop !== null &&
    (input.side === "short" ? input.current >= input.stop : input.current <= input.stop)
  ) {
    const message = "Current price is already at or beyond the stop area.";
    checks.push({
      check_id: "current_price_vs_stop",
      label: "Current / Stop",
      status: "warning",
      message,
    });
    warnings.push(warning("current_price_already_at_stop", message));
  }

  if (
    input.input.marketSessionRisk === "high" ||
    input.input.marketSessionRisk === "critical"
  ) {
    const message = `Market session risk is ${input.input.marketSessionRisk}.`;
    checks.push({
      check_id: "market_session_context",
      label: "Market Session",
      status: "context",
      message,
    });
    warnings.push(warning("market_session_risk_context", message));
  }

  if (
    input.input.positionSizingStatus === "blocked" ||
    input.input.positionSizingBlocksCreate
  ) {
    const message = "Position sizing has unresolved blockers.";
    checks.push({
      check_id: "position_sizing_context",
      label: "Position Sizing",
      status: "context",
      message,
    });
    warnings.push(warning("position_sizing_blocked_context", message));
  } else if (input.input.positionSizingStatus === "incomplete") {
    const message = "Position sizing is incomplete.";
    checks.push({
      check_id: "position_sizing_context",
      label: "Position Sizing",
      status: "context",
      message,
    });
    warnings.push(warning("position_sizing_incomplete_context", message));
  }

  if (
    input.input.riskControlsStatus === "blocked" ||
    input.input.riskControlsBlocksNewTrade
  ) {
    const message = "Risk controls have unresolved blockers.";
    checks.push({
      check_id: "risk_controls_context",
      label: "Risk Controls",
      status: "context",
      message,
    });
    warnings.push(warning("risk_controls_blocked_context", message));
  }
}

function addRequiredPriceCheck(
  checks: TradePlanQualityCheck[],
  blockers: TradePlanQualityBlocker[],
  key: "entry" | "stop" | "target",
  label: string,
  value: number | null,
) {
  checks.push({
    check_id: `${key}_price_present`,
    label,
    status: value === null ? "incomplete" : "passed",
    message:
      value === null
        ? `${label} price is missing or invalid.`
        : `${label} price is present.`,
  });

  if (value !== null) {
    return;
  }

  blockers.push(
    blocker(`${key}_price_missing`, `${label} price is missing or invalid.`, false),
  );
}

function getOverallStatus(input: {
  riskRewardRatio: number | null;
  incomplete: boolean;
  blockers: TradePlanQualityBlocker[];
  warnings: TradePlanQualityWarning[];
}): TradePlanQualityStatus {
  if (input.blockers.some((blockerItem) => blockerItem.blocks_create_live_trade)) {
    return "blocked";
  }

  if (input.incomplete) {
    return "incomplete";
  }

  if (input.blockers.length > 0) {
    return "blocked";
  }

  if (input.warnings.length > 0) {
    return "warning";
  }

  return input.riskRewardRatio !== null && input.riskRewardRatio >= 2
    ? "excellent"
    : "ok";
}

function getGrade(
  status: TradePlanQualityStatus,
  riskRewardRatio: number | null,
): TradePlanQualityGrade {
  if (status === "incomplete") {
    return "unknown";
  }

  if (status === "blocked") {
    return "F";
  }

  if (riskRewardRatio === null) {
    return "unknown";
  }

  if (riskRewardRatio >= 2) {
    return status === "warning" ? "B" : "A";
  }

  if (riskRewardRatio >= 1.5) {
    return status === "warning" ? "C" : "B";
  }

  if (riskRewardRatio >= 1) {
    return "C";
  }

  return "D";
}

function getNextAction(input: {
  status: TradePlanQualityStatus;
  blockers: TradePlanQualityBlocker[];
  warnings: TradePlanQualityWarning[];
  riskRewardRatio: number | null;
}) {
  if (input.status === "blocked") {
    return (
      input.blockers.find((item) => item.blocks_create_live_trade)?.message ??
      "Fix blocked entry, stop, target, or R/R before creating the trade."
    );
  }

  if (input.status === "incomplete") {
    return "Complete entry, stop, and target before relying on this plan quality result.";
  }

  if (input.riskRewardRatio !== null && input.riskRewardRatio < 1.5) {
    return "Review whether the expected reward justifies the risk.";
  }

  if (input.warnings.length > 0) {
    return "Review plan quality warnings before creating the Live Day Trade.";
  }

  if (input.status === "excellent") {
    return "Plan structure is strong. Continue through broker fill confirmation.";
  }

  return "Plan structure is coherent. Continue through existing safety gates.";
}

function blocker(
  blocker_id: string,
  message: string,
  blocks_create_live_trade: boolean,
): TradePlanQualityBlocker {
  return { blocker_id, message, blocks_create_live_trade };
}

function warning(warning_id: string, message: string): TradePlanQualityWarning {
  return { warning_id, message };
}

function normalizeTicker(value: string | null | undefined): string | null {
  const trimmed = value?.trim().toUpperCase();
  return trimmed ? trimmed : null;
}

function finiteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function finitePositiveNumber(value: unknown): number | null {
  const numberValue = finiteNumber(value);
  return numberValue !== null && numberValue > 0 ? numberValue : null;
}

function finitePositiveInteger(value: unknown): number | null {
  const numberValue = finitePositiveNumber(value);
  return numberValue === null ? null : Math.floor(numberValue);
}
