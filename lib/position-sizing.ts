export type PositionSizingMode =
  | "manual"
  | "fixed_risk_amount"
  | "fixed_risk_percent"
  | "max_affordable"
  | "risk_controls";

export type PositionSizingStatus = "ok" | "warning" | "blocked" | "incomplete";

export type PositionSizingWarning = {
  warning_id: string;
  message: string;
};

export type PositionSizingBlocker = {
  blocker_id: string;
  message: string;
  blocks_create_live_trade: boolean;
};

export type PositionSizingAssumption = {
  assumption_id: string;
  message: string;
};

export type PositionSizingInput = {
  ticker?: string | null;
  side?: "long" | "short" | null;
  entryPrice?: number | null;
  stopPrice?: number | null;
  targetPrice?: number | null;
  plannedQuantity?: number | null;
  accountSize?: number | null;
  maxRiskPerTradeAmount?: number | null;
  maxRiskPerTradePercent?: number | null;
  defaultRiskAmountPerTrade?: number | null;
  defaultRiskPercentPerTrade?: number | null;
  maxPositionValue?: number | null;
  mode?: PositionSizingMode | null;
  riskControlsMode?: "demo" | "real_prep" | "strict" | string | null;
  currency?: string | null;
  now?: Date;
};

export type PositionSizingResult = {
  result_id: string;
  result_version: "1.0";
  result_kind: "position_sizing";
  calculated_at: string;
  ticker: string | null;
  side: "long" | "short";
  mode: PositionSizingMode;
  risk_controls_mode: string | null;
  status: PositionSizingStatus;
  currency: string;
  entry_price: number | null;
  stop_price: number | null;
  target_price: number | null;
  planned_quantity: number | null;
  recommended_quantity: number | null;
  risk_per_share: number | null;
  reward_per_share: number | null;
  risk_reward_ratio: number | null;
  risk_budget_amount: number | null;
  risk_budget_source:
    | "max_risk_per_trade_amount"
    | "max_risk_per_trade_percent"
    | "default_risk_amount_per_trade"
    | "default_risk_percent_per_trade"
    | "manual"
    | "unavailable";
  estimated_position_value: number | null;
  estimated_risk_at_planned_quantity: number | null;
  estimated_reward_at_planned_quantity: number | null;
  max_position_value: number | null;
  planned_quantity_exceeds_recommended: boolean;
  planned_position_value_exceeds_max: boolean;
  blocks_create_live_trade: boolean;
  blockers: PositionSizingBlocker[];
  warnings: PositionSizingWarning[];
  assumptions: PositionSizingAssumption[];
  next_action: string;
};

export function calculateRiskPerShare({
  entryPrice,
  stopPrice,
  side = "long",
}: {
  entryPrice?: number | null;
  stopPrice?: number | null;
  side?: "long" | "short" | null;
}): number | null {
  const entry = finitePositiveNumber(entryPrice);
  const stop = finitePositiveNumber(stopPrice);

  if (entry === null || stop === null) {
    return null;
  }

  const value = side === "short" ? stop - entry : entry - stop;
  return finitePositiveNumber(value);
}

export function calculateRewardPerShare({
  entryPrice,
  targetPrice,
  side = "long",
}: {
  entryPrice?: number | null;
  targetPrice?: number | null;
  side?: "long" | "short" | null;
}): number | null {
  const entry = finitePositiveNumber(entryPrice);
  const target = finitePositiveNumber(targetPrice);

  if (entry === null || target === null) {
    return null;
  }

  const value = side === "short" ? entry - target : target - entry;
  return finiteNumber(value);
}

export function calculateRiskRewardRatio({
  riskPerShare,
  rewardPerShare,
}: {
  riskPerShare?: number | null;
  rewardPerShare?: number | null;
}): number | null {
  const risk = finitePositiveNumber(riskPerShare);
  const reward = finiteNumber(rewardPerShare);

  if (risk === null || reward === null) {
    return null;
  }

  return finiteNumber(reward / risk);
}

export function calculateQuantityForRiskAmount({
  riskAmount,
  riskPerShare,
}: {
  riskAmount?: number | null;
  riskPerShare?: number | null;
}): number | null {
  const budget = finitePositiveNumber(riskAmount);
  const risk = finitePositiveNumber(riskPerShare);

  if (budget === null || risk === null) {
    return null;
  }

  return Math.max(0, Math.floor(budget / risk));
}

export function calculateQuantityForRiskPercent({
  accountSize,
  riskPercent,
  riskPerShare,
}: {
  accountSize?: number | null;
  riskPercent?: number | null;
  riskPerShare?: number | null;
}): number | null {
  const account = finitePositiveNumber(accountSize);
  const percent = finitePositiveNumber(riskPercent);

  if (account === null || percent === null) {
    return null;
  }

  return calculateQuantityForRiskAmount({
    riskAmount: account * (percent / 100),
    riskPerShare,
  });
}

export function calculateEstimatedRiskAmount({
  quantity,
  riskPerShare,
}: {
  quantity?: number | null;
  riskPerShare?: number | null;
}): number | null {
  const shares = finitePositiveInteger(quantity);
  const risk = finitePositiveNumber(riskPerShare);

  if (shares === null || risk === null) {
    return null;
  }

  return finiteNumber(shares * risk);
}

export function calculateEstimatedRewardAmount({
  quantity,
  rewardPerShare,
}: {
  quantity?: number | null;
  rewardPerShare?: number | null;
}): number | null {
  const shares = finitePositiveInteger(quantity);
  const reward = finiteNumber(rewardPerShare);

  if (shares === null || reward === null) {
    return null;
  }

  return finiteNumber(shares * reward);
}

export function buildPositionSizingResult(
  input: PositionSizingInput,
): PositionSizingResult {
  const now = input.now ?? new Date();
  const side = input.side === "short" ? "short" : "long";
  const mode = input.mode ?? "manual";
  const ticker = normalizeTicker(input.ticker);
  const currency = input.currency?.trim() || "USD";
  const entryPrice = finitePositiveNumber(input.entryPrice);
  const stopPrice = finitePositiveNumber(input.stopPrice);
  const targetPrice = finitePositiveNumber(input.targetPrice);
  const plannedQuantity = finitePositiveInteger(input.plannedQuantity);
  const accountSize = finitePositiveNumber(input.accountSize);
  const maxRiskPerTradeAmount = finitePositiveNumber(
    input.maxRiskPerTradeAmount,
  );
  const maxRiskPerTradePercent = finitePositiveNumber(
    input.maxRiskPerTradePercent,
  );
  const defaultRiskAmountPerTrade = finitePositiveNumber(
    input.defaultRiskAmountPerTrade,
  );
  const defaultRiskPercentPerTrade = finitePositiveNumber(
    input.defaultRiskPercentPerTrade,
  );
  const maxPositionValue = finitePositiveNumber(input.maxPositionValue);
  const riskControlsMode = input.riskControlsMode ?? null;
  const strictMode = riskControlsMode === "strict";
  const warnings: PositionSizingWarning[] = [];
  const blockers: PositionSizingBlocker[] = [];
  const assumptions: PositionSizingAssumption[] = [
    {
      assumption_id: "long_day_trade_primary_model",
      message:
        side === "long"
          ? "Sizing assumes a long position: risk/share = entry - stop."
          : "Short sizing is defensive only and assumes risk/share = stop - entry.",
    },
    {
      assumption_id: "read_only_planning",
      message:
        "Position sizing is read-only and does not mutate broker handoff quantity.",
    },
  ];
  const riskPerShare = calculateRiskPerShare({
    entryPrice,
    stopPrice,
    side,
  });
  const rewardPerShare = calculateRewardPerShare({
    entryPrice,
    targetPrice,
    side,
  });
  const riskRewardRatio = calculateRiskRewardRatio({
    riskPerShare,
    rewardPerShare,
  });

  if (entryPrice === null) {
    blockers.push(blocker("missing_entry_price", "Entry price is missing.", false));
  }

  if (stopPrice === null) {
    blockers.push(blocker("missing_stop_price", "Stop price is missing.", false));
  }

  if (targetPrice === null) {
    warnings.push(warning("missing_target_price", "Target price is missing."));
  }

  if (entryPrice !== null && stopPrice !== null && riskPerShare === null) {
    blockers.push(
      blocker(
        "invalid_risk_per_share",
        side === "long"
          ? "Stop price must be below entry for long-position sizing."
          : "Stop price must be above entry for short-position sizing.",
        strictMode,
      ),
    );
  }

  if (rewardPerShare !== null && rewardPerShare <= 0) {
    warnings.push(
      warning(
        "target_not_above_entry",
        side === "long"
          ? "Target is not above entry, so estimated reward is not favorable."
          : "Target is not below entry, so estimated reward is not favorable.",
      ),
    );
  }

  const riskBudget = resolveRiskBudget({
    accountSize,
    maxRiskPerTradeAmount,
    maxRiskPerTradePercent,
    defaultRiskAmountPerTrade,
    defaultRiskPercentPerTrade,
  });
  const recommendedQuantity = calculateQuantityForRiskAmount({
    riskAmount: riskBudget.amount,
    riskPerShare,
  });
  const estimatedPositionValue =
    entryPrice !== null && plannedQuantity !== null
      ? finiteNumber(entryPrice * plannedQuantity)
      : null;
  const estimatedRiskAtPlannedQuantity = calculateEstimatedRiskAmount({
    quantity: plannedQuantity,
    riskPerShare,
  });
  const estimatedRewardAtPlannedQuantity = calculateEstimatedRewardAmount({
    quantity: plannedQuantity,
    rewardPerShare,
  });
  const plannedQuantityExceedsRecommended =
    plannedQuantity !== null &&
    recommendedQuantity !== null &&
    recommendedQuantity > 0 &&
    plannedQuantity > recommendedQuantity;
  const plannedPositionValueExceedsMax =
    estimatedPositionValue !== null &&
    maxPositionValue !== null &&
    estimatedPositionValue > maxPositionValue;

  if (riskBudget.amount === null) {
    warnings.push(
      warning(
        "risk_budget_unavailable",
        "No risk budget is configured. Use manual sizing or set risk controls.",
      ),
    );
  }

  if (recommendedQuantity === 0 && riskBudget.amount !== null && riskPerShare !== null) {
    blockers.push(
      blocker(
        "recommended_quantity_zero",
        "Risk budget is too small for one share at the current entry/stop risk.",
        strictMode,
      ),
    );
  }

  if (plannedQuantity === null) {
    warnings.push(
      warning(
        "planned_quantity_missing",
        "Planned quantity is unavailable. Broker handoff quantity remains unchanged.",
      ),
    );
  }

  if (plannedQuantityExceedsRecommended) {
    const message =
      "Planned quantity exceeds the risk-based recommended quantity.";
    if (strictMode) {
      blockers.push(blocker("planned_quantity_exceeds_limit", message, true));
    } else {
      warnings.push(warning("planned_quantity_exceeds_limit", message));
    }
  }

  if (plannedPositionValueExceedsMax) {
    const message = "Planned position value exceeds the configured maximum.";
    if (strictMode) {
      blockers.push(blocker("planned_position_value_exceeds_max", message, true));
    } else {
      warnings.push(warning("planned_position_value_exceeds_max", message));
    }
  }

  const blocksCreateLiveTrade = blockers.some(
    (item) => item.blocks_create_live_trade,
  );
  const status = getStatus({
    blockers,
    warnings,
    hasRequiredSizingInputs: entryPrice !== null && stopPrice !== null,
    hasRiskBudget: riskBudget.amount !== null,
  });

  return {
    result_id: [
      "position-sizing",
      ticker ?? "unknown",
      entryPrice ?? "na",
      stopPrice ?? "na",
      targetPrice ?? "na",
      plannedQuantity ?? "na",
      riskBudget.amount ?? "manual",
    ].join("-"),
    result_version: "1.0",
    result_kind: "position_sizing",
    calculated_at: now.toISOString(),
    ticker,
    side,
    mode,
    risk_controls_mode: riskControlsMode,
    status,
    currency,
    entry_price: entryPrice,
    stop_price: stopPrice,
    target_price: targetPrice,
    planned_quantity: plannedQuantity,
    recommended_quantity: recommendedQuantity,
    risk_per_share: riskPerShare,
    reward_per_share: rewardPerShare,
    risk_reward_ratio: riskRewardRatio,
    risk_budget_amount: riskBudget.amount,
    risk_budget_source: riskBudget.source,
    estimated_position_value: estimatedPositionValue,
    estimated_risk_at_planned_quantity: estimatedRiskAtPlannedQuantity,
    estimated_reward_at_planned_quantity: estimatedRewardAtPlannedQuantity,
    max_position_value: maxPositionValue,
    planned_quantity_exceeds_recommended: plannedQuantityExceedsRecommended,
    planned_position_value_exceeds_max: plannedPositionValueExceedsMax,
    blocks_create_live_trade: blocksCreateLiveTrade,
    blockers,
    warnings,
    assumptions,
    next_action: getNextAction({
      status,
      blocksCreateLiveTrade,
      plannedQuantityExceedsRecommended,
      riskBudgetSource: riskBudget.source,
    }),
  };
}

export function positionSizingResultJson(result: PositionSizingResult): string {
  return JSON.stringify(result, null, 2);
}

function resolveRiskBudget(input: {
  accountSize: number | null;
  maxRiskPerTradeAmount: number | null;
  maxRiskPerTradePercent: number | null;
  defaultRiskAmountPerTrade: number | null;
  defaultRiskPercentPerTrade: number | null;
}): {
  amount: number | null;
  source: PositionSizingResult["risk_budget_source"];
} {
  if (input.maxRiskPerTradeAmount !== null) {
    return { amount: input.maxRiskPerTradeAmount, source: "max_risk_per_trade_amount" };
  }

  if (input.accountSize !== null && input.maxRiskPerTradePercent !== null) {
    return {
      amount: input.accountSize * (input.maxRiskPerTradePercent / 100),
      source: "max_risk_per_trade_percent",
    };
  }

  if (input.defaultRiskAmountPerTrade !== null) {
    return {
      amount: input.defaultRiskAmountPerTrade,
      source: "default_risk_amount_per_trade",
    };
  }

  if (input.accountSize !== null && input.defaultRiskPercentPerTrade !== null) {
    return {
      amount: input.accountSize * (input.defaultRiskPercentPerTrade / 100),
      source: "default_risk_percent_per_trade",
    };
  }

  return { amount: null, source: "unavailable" };
}

function getStatus(input: {
  blockers: PositionSizingBlocker[];
  warnings: PositionSizingWarning[];
  hasRequiredSizingInputs: boolean;
  hasRiskBudget: boolean;
}): PositionSizingStatus {
  if (input.blockers.some((blockerItem) => blockerItem.blocks_create_live_trade)) {
    return "blocked";
  }

  if (!input.hasRequiredSizingInputs || !input.hasRiskBudget) {
    return "incomplete";
  }

  if (input.blockers.length > 0) {
    return "blocked";
  }

  if (input.warnings.length > 0) {
    return "warning";
  }

  return "ok";
}

function getNextAction(input: {
  status: PositionSizingStatus;
  blocksCreateLiveTrade: boolean;
  plannedQuantityExceedsRecommended: boolean;
  riskBudgetSource: PositionSizingResult["risk_budget_source"];
}): string {
  if (input.blocksCreateLiveTrade) {
    return "Reduce planned quantity or update strict risk controls before creating the trade.";
  }

  if (input.status === "blocked") {
    return "Review entry, stop, and risk settings before using this sizing result.";
  }

  if (input.status === "incomplete") {
    return input.riskBudgetSource === "unavailable"
      ? "Configure a risk budget or continue with manual sizing."
      : "Enter valid entry and stop prices before relying on sizing.";
  }

  if (input.plannedQuantityExceedsRecommended) {
    return "Review the planned quantity against your risk budget.";
  }

  if (input.status === "warning") {
    return "Review sizing warnings before creating the Live Day Trade.";
  }

  return "Sizing is within configured risk controls.";
}

function blocker(
  blocker_id: string,
  message: string,
  blocks_create_live_trade: boolean,
): PositionSizingBlocker {
  return { blocker_id, message, blocks_create_live_trade };
}

function warning(warning_id: string, message: string): PositionSizingWarning {
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
