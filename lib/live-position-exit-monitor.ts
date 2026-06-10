import {
  DEFAULT_EXECUTION_MODE,
  compareExecutionIntentPriority,
  getExecutionAuthorityForMode,
  getExecutionTriggerPriority,
  validateExecutionIntent,
  type ExecutionIntent,
  type ExecutionMode,
  type ExecutionTriggerType,
} from "@/lib/execution";

export type LivePositionExitStatus =
  | "exit_stop_loss_reached"
  | "exit_target_reached"
  | "monitoring"
  | "invalid_position_id"
  | "invalid_ticker"
  | "invalid_quantity"
  | "invalid_current_price"
  | "invalid_exit_prices"
  | "invalid_target_price"
  | "invalid_stop_loss_price";

export type LivePositionExitMonitorInput = {
  positionId: string | null | undefined;
  recommendationId?: string | null | undefined;
  ticker: string | null | undefined;
  instrumentName?: string | null;
  quantity: number | string | null | undefined;
  currentPrice: number | string | null | undefined;
  targetPrice: number | string | null | undefined;
  stopLossPrice: number | string | null | undefined;
  mode?: ExecutionMode | string | null;
  market?: "US" | string | null;
  createdAt?: string | null;
  intentId?: string | null;
  expiresAt?: string | null;
  payloadId?: string | null;
  payloadFingerprint?: string | null;
};

export type LivePositionExitMonitorResult = {
  should_exit: boolean;
  status: LivePositionExitStatus;
  trigger_type: Extract<
    ExecutionTriggerType,
    "exit_stop_loss_reached" | "exit_target_reached"
  > | null;
  triggerType: LivePositionExitMonitorResult["trigger_type"];
  reason: string;
  warnings: string[];
  normalized: {
    position_id: string | null;
    recommendation_id: string | null;
    ticker: string | null;
    instrument_name: string | null;
    quantity: number | null;
    current_price: number | null;
    target_price: number | null;
    stop_loss_price: number | null;
    mode: ExecutionMode;
    market: "US" | string;
  };
};

export type LivePositionSellExecutionIntent = ExecutionIntent & {
  broker: "avanza";
  triggerType: Extract<
    ExecutionTriggerType,
    "exit_stop_loss_reached" | "exit_target_reached"
  >;
  positionId: string;
  recommendationId: string | null;
  instrumentName: string | null;
  quantity: number;
  orderType: "market";
  intendedPrice: number;
  targetPrice: number | null;
  stopLossPrice: number | null;
  reason: string;
};

function nullableString(value: string | null | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function finiteNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = Number(value.trim().replace(",", "."));

  return Number.isFinite(parsed) ? parsed : null;
}

function positiveNumber(value: number | string | null | undefined) {
  const parsed = finiteNumber(value);

  return parsed !== null && parsed > 0 ? parsed : null;
}

function sanitizeIntentIdPart(value: string | null | undefined) {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function createSellIntentId(
  input: LivePositionExitMonitorInput,
  triggerType: LivePositionSellExecutionIntent["triggerType"],
  createdAt: string,
) {
  const positionId = sanitizeIntentIdPart(input.positionId);
  const timestamp = sanitizeIntentIdPart(createdAt);

  return `sell_intent_${positionId}_${triggerType}_${timestamp}`;
}

function normalizeExecutionMode(value: ExecutionMode | string | null | undefined) {
  return value === "automatic" ? "automatic" : DEFAULT_EXECUTION_MODE;
}

function normalizeInput(input: LivePositionExitMonitorInput) {
  return {
    position_id: nullableString(input.positionId),
    recommendation_id: nullableString(input.recommendationId),
    ticker: nullableString(input.ticker)?.toUpperCase() ?? null,
    instrument_name: nullableString(input.instrumentName),
    quantity: positiveNumber(input.quantity),
    current_price: positiveNumber(input.currentPrice),
    target_price: positiveNumber(input.targetPrice),
    stop_loss_price: positiveNumber(input.stopLossPrice),
    mode: normalizeExecutionMode(input.mode),
    market: nullableString(input.market) ?? "US",
  };
}

function normalizeCreatedAt(value: string | null | undefined) {
  const createdAt = nullableString(value);

  return createdAt && Number.isFinite(Date.parse(createdAt))
    ? createdAt
    : new Date().toISOString();
}

export function evaluateLivePositionExit(
  input: LivePositionExitMonitorInput,
): LivePositionExitMonitorResult {
  const normalized = normalizeInput(input);
  const warnings: string[] = [];

  if (!normalized.position_id) {
    return {
      should_exit: false,
      status: "invalid_position_id",
      trigger_type: null,
      triggerType: null,
      reason: "Live position id is missing or invalid.",
      warnings,
      normalized,
    };
  }

  if (!normalized.ticker) {
    return {
      should_exit: false,
      status: "invalid_ticker",
      trigger_type: null,
      triggerType: null,
      reason: "Live position ticker is missing or invalid.",
      warnings,
      normalized,
    };
  }

  if (normalized.quantity === null) {
    return {
      should_exit: false,
      status: "invalid_quantity",
      trigger_type: null,
      triggerType: null,
      reason: "Live position quantity is missing or not positive.",
      warnings,
      normalized,
    };
  }

  if (normalized.current_price === null) {
    return {
      should_exit: false,
      status: "invalid_current_price",
      trigger_type: null,
      triggerType: null,
      reason: "Current price is missing or not positive, so no exit can be evaluated.",
      warnings,
      normalized,
    };
  }

  if (normalized.target_price === null) {
    warnings.push("Target price is missing or not positive.");
  }

  if (normalized.stop_loss_price === null) {
    warnings.push("Stop loss price is missing or not positive.");
  }

  if (
    normalized.target_price !== null &&
    normalized.stop_loss_price !== null &&
    normalized.target_price <= normalized.stop_loss_price
  ) {
    warnings.push("Target price is at or below stop loss price.");
  }

  const stopLossReached =
    normalized.stop_loss_price !== null &&
    normalized.current_price <= normalized.stop_loss_price;
  const targetReached =
    normalized.target_price !== null &&
    normalized.current_price >= normalized.target_price;

  if (stopLossReached) {
    const triggerType = "exit_stop_loss_reached";

    return {
      should_exit: true,
      status: triggerType,
      trigger_type: triggerType,
      triggerType,
      reason: `Stop loss reached: current price ${normalized.current_price} is at or below stop loss ${normalized.stop_loss_price}.`,
      warnings,
      normalized,
    };
  }

  if (targetReached) {
    const triggerType = "exit_target_reached";

    return {
      should_exit: true,
      status: triggerType,
      trigger_type: triggerType,
      triggerType,
      reason: `Target reached: current price ${normalized.current_price} is at or above target ${normalized.target_price}.`,
      warnings,
      normalized,
    };
  }

  if (normalized.target_price === null && normalized.stop_loss_price === null) {
    return {
      should_exit: false,
      status: "invalid_exit_prices",
      trigger_type: null,
      triggerType: null,
      reason: "Target and stop loss prices are missing or invalid.",
      warnings,
      normalized,
    };
  }

  if (normalized.target_price === null) {
    return {
      should_exit: false,
      status: "invalid_target_price",
      trigger_type: null,
      triggerType: null,
      reason: "Target price is missing or invalid, and stop loss has not been reached.",
      warnings,
      normalized,
    };
  }

  if (normalized.stop_loss_price === null) {
    return {
      should_exit: false,
      status: "invalid_stop_loss_price",
      trigger_type: null,
      triggerType: null,
      reason: "Stop loss price is missing or invalid, and target has not been reached.",
      warnings,
      normalized,
    };
  }

  return {
    should_exit: false,
    status: "monitoring",
    trigger_type: null,
    triggerType: null,
    reason: `No exit: current price ${normalized.current_price} is between stop loss ${normalized.stop_loss_price} and target ${normalized.target_price}.`,
    warnings,
    normalized,
  };
}

export function buildSellExecutionIntentFromLivePosition(
  input: LivePositionExitMonitorInput,
): LivePositionSellExecutionIntent | null {
  const evaluation = evaluateLivePositionExit(input);

  if (!evaluation.should_exit || !evaluation.trigger_type) {
    return null;
  }

  const {
    position_id: positionId,
    recommendation_id: recommendationId,
    ticker,
    instrument_name: instrumentName,
    quantity,
    current_price: currentPrice,
    target_price: targetPrice,
    stop_loss_price: stopLossPrice,
    mode,
    market,
  } = evaluation.normalized;

  if (!positionId || !ticker || quantity === null || currentPrice === null) {
    return null;
  }

  const createdAt = normalizeCreatedAt(input.createdAt);
  const triggerType = evaluation.trigger_type;
  const authority = getExecutionAuthorityForMode(mode);
  const baseIntent: ExecutionIntent = {
    intent_version: "1.0",
    intent_id:
      nullableString(input.intentId) ??
      createSellIntentId(input, triggerType, createdAt),
    created_at: createdAt,
    mode,
    authority,
    action: "sell",
    trigger_type: triggerType,
    trigger_priority: getExecutionTriggerPriority(triggerType),
    broker_hint: "AVANZA",
    source: "live_day_trade_position",
    trading_package: {
      package_version: "1.0",
      recommendation_id: recommendationId,
      live_position_id: positionId,
      ticker,
      market,
      quantity,
      order_type: "market",
      limit_price: null,
      stop_loss: stopLossPrice,
      target_price: targetPrice,
      expires_at: nullableString(input.expiresAt),
      payload_id: nullableString(input.payloadId),
      payload_fingerprint: nullableString(input.payloadFingerprint),
    },
    safety_warnings: evaluation.warnings,
    broker_result: null,
  };
  const validation = validateExecutionIntent(baseIntent);
  const safetyWarnings = [
    ...baseIntent.safety_warnings,
    ...validation.warnings,
    ...validation.errors,
  ];

  return {
    ...baseIntent,
    safety_warnings: safetyWarnings,
    broker: "avanza",
    triggerType,
    positionId,
    recommendationId,
    instrumentName,
    quantity,
    orderType: "market",
    intendedPrice: currentPrice,
    targetPrice,
    stopLossPrice,
    reason: evaluation.reason,
  };
}

export function buildSellExecutionIntentsForLivePositions(
  inputs: LivePositionExitMonitorInput[],
): LivePositionSellExecutionIntent[] {
  return inputs
    .map((input) => buildSellExecutionIntentFromLivePosition(input))
    .filter((intent): intent is LivePositionSellExecutionIntent => intent !== null)
    .sort(compareExecutionIntentPriority);
}
