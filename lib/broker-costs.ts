export type BrokerCostModel = {
  enabled: boolean;
  broker: "AVANZA" | "CUSTOM";
  market: "US";
  account_currency: "SEK";
  trade_currency: "USD";
  commission_mode: "fixed" | "percentage" | "fixed_plus_percentage";
  entry_fixed_commission: number;
  exit_fixed_commission: number;
  commission_percent: number;
  minimum_commission: number;
  fx_fee_percent: number;
  estimated_usd_sek_rate: number | null;
  include_entry_commission: boolean;
  include_estimated_exit_commission: boolean;
  include_fx_fee: boolean;
  notes?: string;
};

export type BrokerCostEstimate = {
  enabled: boolean;
  entry_commission_estimate: number | null;
  exit_commission_estimate: number | null;
  total_commission_estimate: number | null;
  entry_fx_fee_estimate: number | null;
  exit_fx_fee_estimate: number | null;
  total_fx_fee_estimate: number | null;
  total_estimated_trading_cost: number | null;
  planned_position_value: number | null;
  actual_position_value: number | null;
  estimated_gross_reward: number | null;
  estimated_net_reward: number | null;
  estimated_gross_r: number | null;
  estimated_net_r: number | null;
  estimated_break_even_price: number | null;
  currency: "SEK" | "USD" | "MIXED";
  warnings: string[];
};

export type BrokerCostEstimateInput = {
  model: BrokerCostModel | null;
  plannedEntryPrice?: number | null;
  actualFillPrice?: number | null;
  plannedShares?: number | null;
  actualShares?: number | null;
  stopLoss?: number | null;
  targetPrice?: number | null;
};

export const brokerCostModelStorageKey = "trade_broker_cost_model_v1";

export const defaultBrokerCostModel: BrokerCostModel = {
  enabled: false,
  broker: "AVANZA",
  market: "US",
  account_currency: "SEK",
  trade_currency: "USD",
  commission_mode: "fixed_plus_percentage",
  entry_fixed_commission: 1,
  exit_fixed_commission: 1,
  commission_percent: 0,
  minimum_commission: 1,
  fx_fee_percent: 0.25,
  estimated_usd_sek_rate: 10,
  include_entry_commission: true,
  include_estimated_exit_commission: true,
  include_fx_fee: true,
  notes: "Editable estimate. Verify actual fees in Avanza.",
};

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function nonNegativeNumber(value: unknown, fallback: number) {
  const parsed = finiteNumber(value);
  return parsed !== null && parsed >= 0 ? parsed : fallback;
}

function positiveNumber(value: unknown) {
  const parsed = finiteNumber(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

function roundMoney(value: number | null) {
  return value === null ? null : Number(value.toFixed(2));
}

function roundRatio(value: number | null) {
  return value === null ? null : Number(value.toFixed(2));
}

function normalizeBroker(value: unknown): BrokerCostModel["broker"] {
  return value === "CUSTOM" ? "CUSTOM" : "AVANZA";
}

function normalizeCommissionMode(
  value: unknown,
): BrokerCostModel["commission_mode"] {
  if (
    value === "fixed" ||
    value === "percentage" ||
    value === "fixed_plus_percentage"
  ) {
    return value;
  }

  return defaultBrokerCostModel.commission_mode;
}

export function normalizeBrokerCostModel(value: unknown): BrokerCostModel {
  if (!value || typeof value !== "object") {
    return { ...defaultBrokerCostModel };
  }

  const raw = value as Record<string, unknown>;
  const estimatedRate = positiveNumber(raw.estimated_usd_sek_rate);

  return {
    enabled:
      typeof raw.enabled === "boolean"
        ? raw.enabled
        : defaultBrokerCostModel.enabled,
    broker: normalizeBroker(raw.broker),
    market: "US",
    account_currency: "SEK",
    trade_currency: "USD",
    commission_mode: normalizeCommissionMode(raw.commission_mode),
    entry_fixed_commission: nonNegativeNumber(
      raw.entry_fixed_commission,
      defaultBrokerCostModel.entry_fixed_commission,
    ),
    exit_fixed_commission: nonNegativeNumber(
      raw.exit_fixed_commission,
      defaultBrokerCostModel.exit_fixed_commission,
    ),
    commission_percent: nonNegativeNumber(
      raw.commission_percent,
      defaultBrokerCostModel.commission_percent,
    ),
    minimum_commission: nonNegativeNumber(
      raw.minimum_commission,
      defaultBrokerCostModel.minimum_commission,
    ),
    fx_fee_percent: nonNegativeNumber(
      raw.fx_fee_percent,
      defaultBrokerCostModel.fx_fee_percent,
    ),
    estimated_usd_sek_rate: estimatedRate,
    include_entry_commission:
      typeof raw.include_entry_commission === "boolean"
        ? raw.include_entry_commission
        : defaultBrokerCostModel.include_entry_commission,
    include_estimated_exit_commission:
      typeof raw.include_estimated_exit_commission === "boolean"
        ? raw.include_estimated_exit_commission
        : defaultBrokerCostModel.include_estimated_exit_commission,
    include_fx_fee:
      typeof raw.include_fx_fee === "boolean"
        ? raw.include_fx_fee
        : defaultBrokerCostModel.include_fx_fee,
    notes: typeof raw.notes === "string" ? raw.notes : defaultBrokerCostModel.notes,
  };
}

export function readBrokerCostModelFromStorage(): BrokerCostModel {
  if (typeof window === "undefined") {
    return { ...defaultBrokerCostModel };
  }

  try {
    return normalizeBrokerCostModel(
      JSON.parse(window.localStorage.getItem(brokerCostModelStorageKey) ?? "null"),
    );
  } catch {
    return { ...defaultBrokerCostModel };
  }
}

export function writeBrokerCostModelToStorage(model: BrokerCostModel) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      brokerCostModelStorageKey,
      JSON.stringify(normalizeBrokerCostModel(model)),
    );
  } catch {
    // Local settings persistence should never break the Settings page.
  }
}

function calculateCommission(
  model: BrokerCostModel,
  side: "entry" | "exit",
  positionValueSek: number | null,
) {
  if (positionValueSek === null) {
    return null;
  }

  const fixed =
    side === "entry"
      ? model.entry_fixed_commission
      : model.exit_fixed_commission;
  const percentage = positionValueSek * (model.commission_percent / 100);
  const rawCommission =
    model.commission_mode === "fixed"
      ? fixed
      : model.commission_mode === "percentage"
        ? percentage
        : fixed + percentage;

  return roundMoney(Math.max(rawCommission, model.minimum_commission));
}

export function calculateBrokerCostEstimate({
  model,
  plannedEntryPrice,
  actualFillPrice,
  plannedShares,
  actualShares,
  stopLoss,
  targetPrice,
}: BrokerCostEstimateInput): BrokerCostEstimate {
  const warnings: string[] = [];
  const normalizedModel = model ? normalizeBrokerCostModel(model) : null;

  if (!normalizedModel) {
    warnings.push("Broker cost model missing.");
  }

  if (!normalizedModel?.enabled) {
    return {
      enabled: false,
      entry_commission_estimate: null,
      exit_commission_estimate: null,
      total_commission_estimate: null,
      entry_fx_fee_estimate: null,
      exit_fx_fee_estimate: null,
      total_fx_fee_estimate: null,
      total_estimated_trading_cost: null,
      planned_position_value: null,
      actual_position_value: null,
      estimated_gross_reward: null,
      estimated_net_reward: null,
      estimated_gross_r: null,
      estimated_net_r: null,
      estimated_break_even_price: null,
      currency: "SEK",
      warnings: warnings.length
        ? warnings
        : ["Broker cost estimates are disabled in Settings."],
    };
  }

  const fxRate = positiveNumber(normalizedModel.estimated_usd_sek_rate);
  const entryPrice = positiveNumber(actualFillPrice) ?? positiveNumber(plannedEntryPrice);
  const shares = Math.floor(positiveNumber(actualShares) ?? positiveNumber(plannedShares) ?? 0);
  const stop = positiveNumber(stopLoss);
  const target = positiveNumber(targetPrice);
  const plannedPositionUsd =
    positiveNumber(plannedEntryPrice) && positiveNumber(plannedShares)
      ? positiveNumber(plannedEntryPrice)! * Math.floor(positiveNumber(plannedShares)!)
      : null;
  const actualPositionUsd =
    entryPrice !== null && shares > 0 ? entryPrice * shares : null;

  if (fxRate === null) {
    warnings.push("FX rate missing. SEK cost estimate may be unavailable.");
  }

  if (entryPrice === null || shares <= 0) {
    warnings.push("Actual fill price or shares are missing.");
  }

  if (target === null) {
    warnings.push("Target price is missing. Reward estimate unavailable.");
  }

  if (stop === null || entryPrice === null || stop >= entryPrice) {
    warnings.push("Stop loss is missing or not below entry price.");
  }

  const plannedPositionSek =
    plannedPositionUsd !== null && fxRate !== null ? plannedPositionUsd * fxRate : null;
  const actualPositionSek =
    actualPositionUsd !== null && fxRate !== null ? actualPositionUsd * fxRate : null;
  const targetPositionSek =
    target !== null && shares > 0 && fxRate !== null ? target * shares * fxRate : null;

  const entryCommission = normalizedModel.include_entry_commission
    ? calculateCommission(normalizedModel, "entry", actualPositionSek)
    : 0;
  const exitCommission = normalizedModel.include_estimated_exit_commission
    ? calculateCommission(normalizedModel, "exit", targetPositionSek ?? actualPositionSek)
    : 0;
  const totalCommission =
    entryCommission !== null && exitCommission !== null
      ? roundMoney(entryCommission + exitCommission)
      : null;
  const entryFxFee =
    normalizedModel.include_fx_fee && actualPositionSek !== null
      ? roundMoney(actualPositionSek * (normalizedModel.fx_fee_percent / 100))
      : normalizedModel.include_fx_fee
        ? null
        : 0;
  const exitFxFee =
    normalizedModel.include_fx_fee && targetPositionSek !== null
      ? roundMoney(targetPositionSek * (normalizedModel.fx_fee_percent / 100))
      : normalizedModel.include_fx_fee
        ? null
        : 0;
  const totalFxFee =
    entryFxFee !== null && exitFxFee !== null ? roundMoney(entryFxFee + exitFxFee) : null;
  const totalCost =
    totalCommission !== null && totalFxFee !== null
      ? roundMoney(totalCommission + totalFxFee)
      : null;
  const grossReward =
    targetPositionSek !== null && actualPositionSek !== null
      ? roundMoney(targetPositionSek - actualPositionSek)
      : null;
  const netReward =
    grossReward !== null && totalCost !== null ? roundMoney(grossReward - totalCost) : null;
  const grossRisk =
    entryPrice !== null && stop !== null && fxRate !== null && shares > 0
      ? (entryPrice - stop) * shares * fxRate
      : null;
  const grossR =
    grossReward !== null && grossRisk !== null && grossRisk > 0
      ? roundRatio(grossReward / grossRisk)
      : null;
  const netR =
    netReward !== null && grossRisk !== null && grossRisk > 0
      ? roundRatio(netReward / grossRisk)
      : null;
  const breakEven =
    entryPrice !== null && shares > 0 && fxRate !== null && totalCost !== null
      ? roundMoney(entryPrice + totalCost / (shares * fxRate))
      : null;

  return {
    enabled: true,
    entry_commission_estimate: entryCommission,
    exit_commission_estimate: exitCommission,
    total_commission_estimate: totalCommission,
    entry_fx_fee_estimate: entryFxFee,
    exit_fx_fee_estimate: exitFxFee,
    total_fx_fee_estimate: totalFxFee,
    total_estimated_trading_cost: totalCost,
    planned_position_value: roundMoney(plannedPositionSek),
    actual_position_value: roundMoney(actualPositionSek),
    estimated_gross_reward: grossReward,
    estimated_net_reward: netReward,
    estimated_gross_r: grossR,
    estimated_net_r: netR,
    estimated_break_even_price: breakEven,
    currency: fxRate === null ? "MIXED" : "SEK",
    warnings: Array.from(new Set(warnings)),
  };
}
