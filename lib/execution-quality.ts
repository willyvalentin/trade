import type { BrokerExecutionMetadata } from "@/lib/broker-execution-metadata";
import { normalizeSetupType, type SetupType } from "@/lib/setup-types";

export type ExecutionQualityRating =
  | "excellent"
  | "good"
  | "acceptable"
  | "poor"
  | "unknown";

export type SlippageDirection = "better" | "worse" | "flat" | "unknown";

export type ExecutionQualityMetrics = {
  planned_entry_price: number | null;
  actual_fill_price: number | null;
  slippage_amount_usd: number | null;
  slippage_percent: number | null;
  slippage_bps: number | null;
  slippage_direction: SlippageDirection;
  planned_shares: number | null;
  actual_shares: number | null;
  share_fill_ratio: number | null;
  is_partial_fill: boolean;
  planned_position_value: number | null;
  actual_position_value: number | null;
  position_value_difference: number | null;
  planned_max_loss_at_stop: number | null;
  actual_max_loss_at_stop: number | null;
  max_loss_difference: number | null;
  estimated_total_trading_cost: number | null;
  estimated_net_r: number | null;
  estimated_break_even_price: number | null;
  broker_order_status: string | null;
  setup_type: SetupType | "UNKNOWN";
  quality_rating: ExecutionQualityRating;
  warnings: string[];
};

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function round(value: number | null, decimals: number) {
  return value === null ? null : Number(value.toFixed(decimals));
}

function getSlippageDirection(value: number | null): SlippageDirection {
  if (value === null) return "unknown";
  if (Math.abs(value) < 0.000001) return "flat";
  return value < 0 ? "better" : "worse";
}

function getQualityRating({
  slippagePercent,
  shareFillRatio,
  isPartialFill,
}: {
  slippagePercent: number | null;
  shareFillRatio: number | null;
  isPartialFill: boolean;
}): ExecutionQualityRating {
  if (slippagePercent === null) {
    return "unknown";
  }

  if (shareFillRatio !== null && shareFillRatio < 0.5) {
    return "poor";
  }

  // v1 thresholds for long trades:
  // <= 0% means the fill was at or better than plan.
  // <= 0.05% is a small worse-than-plan fill.
  // <= 0.15% is tolerable but worth reviewing.
  if (slippagePercent <= 0 && !isPartialFill) {
    return "excellent";
  }

  if (slippagePercent <= 0.05 && !isPartialFill) {
    return "good";
  }

  if (slippagePercent <= 0.15) {
    return "acceptable";
  }

  return "poor";
}

export function calculateExecutionQuality(
  metadata: BrokerExecutionMetadata | null,
): ExecutionQualityMetrics {
  const warnings: string[] = [];
  const plannedEntry = finiteNumber(metadata?.planned_entry_price);
  const actualFill = finiteNumber(metadata?.actual_fill_price);
  const plannedShares = finiteNumber(metadata?.planned_shares);
  const actualShares = finiteNumber(metadata?.actual_shares);
  const plannedPositionValue = finiteNumber(metadata?.planned_position_value);
  const actualPositionValue = finiteNumber(metadata?.actual_position_value);
  const plannedMaxLoss = finiteNumber(metadata?.planned_max_loss_at_stop);
  const actualMaxLoss = finiteNumber(metadata?.actual_max_loss_at_stop);
  const brokerOrderStatus = metadata?.broker_order_status ?? null;

  if (!metadata) {
    warnings.push("Execution metadata missing.");
  }

  if (plannedEntry === null || actualFill === null) {
    warnings.push("Planned entry or actual fill price is missing.");
  }

  if (plannedShares === null || plannedShares <= 0) {
    warnings.push("Planned shares are missing.");
  }

  if (actualShares === null || actualShares <= 0) {
    warnings.push("Actual shares are missing.");
  }

  const slippageAmount =
    plannedEntry !== null && actualFill !== null ? actualFill - plannedEntry : null;
  const slippagePercent =
    slippageAmount !== null && plannedEntry !== null && plannedEntry > 0
      ? (slippageAmount / plannedEntry) * 100
      : null;
  const shareFillRatio =
    actualShares !== null && plannedShares !== null && plannedShares > 0
      ? actualShares / plannedShares
      : null;
  const isPartialFill =
    brokerOrderStatus === "partially_filled" ||
    (shareFillRatio !== null && shareFillRatio < 1);

  return {
    planned_entry_price: plannedEntry,
    actual_fill_price: actualFill,
    slippage_amount_usd: round(slippageAmount, 4),
    slippage_percent: round(slippagePercent, 4),
    slippage_bps: round(slippagePercent === null ? null : slippagePercent * 100, 2),
    slippage_direction: getSlippageDirection(slippageAmount),
    planned_shares: plannedShares,
    actual_shares: actualShares,
    share_fill_ratio: round(shareFillRatio, 4),
    is_partial_fill: isPartialFill,
    planned_position_value: plannedPositionValue,
    actual_position_value: actualPositionValue,
    position_value_difference:
      plannedPositionValue !== null && actualPositionValue !== null
        ? round(actualPositionValue - plannedPositionValue, 2)
        : null,
    planned_max_loss_at_stop: plannedMaxLoss,
    actual_max_loss_at_stop: actualMaxLoss,
    max_loss_difference:
      plannedMaxLoss !== null && actualMaxLoss !== null
        ? round(actualMaxLoss - plannedMaxLoss, 2)
        : null,
    estimated_total_trading_cost:
      metadata?.broker_cost_estimate?.total_estimated_trading_cost ?? null,
    estimated_net_r: metadata?.broker_cost_estimate?.estimated_net_r ?? null,
    estimated_break_even_price:
      metadata?.broker_cost_estimate?.estimated_break_even_price ?? null,
    broker_order_status: brokerOrderStatus,
    setup_type: normalizeSetupType(metadata?.setup_type),
    quality_rating: getQualityRating({
      slippagePercent,
      shareFillRatio,
      isPartialFill,
    }),
    warnings: Array.from(new Set(warnings)),
  };
}

export function getExecutionQualityLabel(value: ExecutionQualityRating) {
  if (value === "excellent") return "Excellent";
  if (value === "good") return "Good";
  if (value === "acceptable") return "Acceptable";
  if (value === "poor") return "Poor";
  return "Unknown";
}

export function getSlippageDirectionLabel(value: SlippageDirection) {
  if (value === "better") return "Better than planned";
  if (value === "worse") return "Worse than planned";
  if (value === "flat") return "Flat";
  return "Unknown";
}
