import { normalizeSetupType, type SetupType } from "@/lib/setup-types";

export type TradeExitExecutionPayload = {
  payload_version: "1.0";
  payload_kind: "exit_execution";
  payload_id: string;
  payload_fingerprint: string;
  handoff_session_id: string;
  created_at: string;
  expires_at: string;
  stale_after_seconds: number;
  source: "close_trade_modal";
  broker_hint: "AVANZA";
  broker_execution_mode: "prepare_only";
  human_final_confirmation_required: true;
  do_not_submit_order: true;
  order_intent: {
    side: "SELL";
    action: "close_position" | "partial_close";
    quantity_to_sell: number | null;
    order_type: "market_reference" | "limit_reference";
    price_reference: number | null;
    time_in_force: "day";
    currency: "USD";
  };
  exit_context: {
    position_id: string;
    ticker: string;
    company_name: string | null;
    recommendation_id: string | null;
    setup_type: SetupType | "UNKNOWN";
    close_reason: string | null;
    exit_reason: string | null;
    rule_action: string | null;
    app_recommended_action: string | null;
    user_requested_close: true;
    close_requested_at: string;
  };
  position_snapshot: {
    entry_price: number | null;
    current_price: number | null;
    position_size: number | null;
    remaining_shares: number | null;
    opened_at: string | null;
    time_in_trade_seconds: number | null;
    direction: "Long" | "Short" | string | null;
    stop_price: number | null;
    target_price: number | null;
  };
  risk_snapshot: {
    unrealized_pnl: number | null;
    unrealized_pnl_percent: number | null;
    current_r: number | null;
    planned_max_loss: number | null;
    target_distance: number | null;
    stop_distance: number | null;
  };
  safety: {
    prepare_only: true;
    manual_final_confirmation_required: true;
    do_not_submit_order: true;
    stop_before: "final_broker_confirmation";
    allowed_agent_actions: TradeExitAllowedAgentAction[];
    forbidden_actions: TradeExitForbiddenAction[];
    required_human_actions: TradeExitRequiredHumanAction[];
  };
  agent_instructions: string[];
  safety_warnings: string[];
};

export type TradeExitForbiddenAction =
  | "submit_order"
  | "click_sell"
  | "confirm_order"
  | "modify_broker_account"
  | "change_order_after_user_review"
  | "override_hard_stop"
  | "use_expired_payload"
  | "infer_missing_required_fields"
  | "handle_credentials"
  | "bypass_human_confirmation";

export type TradeExitAllowedAgentAction =
  | "read_exit_execution_payload"
  | "open_broker_sell_order_form"
  | "fill_sell_order_form_fields"
  | "pause_for_user_review"
  | "report_preparation_status"
  | "stop_on_warning_or_unknown_state";

export type TradeExitRequiredHumanAction =
  | "review_broker_sell_order_form"
  | "confirm_ticker_matches"
  | "confirm_quantity_matches"
  | "confirm_price_matches"
  | "manually_click_final_sell"
  | "record_actual_broker_exit_fill_in_trade_app";

export type BuildTradeExitExecutionPayloadInput = {
  positionId: string;
  ticker: string;
  companyName?: string | null;
  recommendationId?: string | null;
  setupType?: unknown;
  direction?: string | null;
  entryPrice?: number | null;
  currentPrice?: number | null;
  positionSize?: number | null;
  remainingShares?: number | null;
  openedAt?: string | null;
  stopPrice?: number | null;
  targetPrice?: number | null;
  closeReason?: string | null;
  exitReason?: string | null;
  ruleAction?: string | null;
  appRecommendedAction?: string | null;
  unrealizedPnl?: number | null;
  unrealizedPnlPercent?: number | null;
  currentR?: number | null;
  createdAt?: string;
  now?: Date;
  staleAfterSeconds?: number;
  handoffSessionId?: string | null;
};

const defaultStaleAfterSeconds = 180;

const forbiddenActions: TradeExitForbiddenAction[] = [
  "submit_order",
  "click_sell",
  "confirm_order",
  "modify_broker_account",
  "change_order_after_user_review",
  "override_hard_stop",
  "use_expired_payload",
  "infer_missing_required_fields",
  "handle_credentials",
  "bypass_human_confirmation",
];

const allowedAgentActions: TradeExitAllowedAgentAction[] = [
  "read_exit_execution_payload",
  "open_broker_sell_order_form",
  "fill_sell_order_form_fields",
  "pause_for_user_review",
  "report_preparation_status",
  "stop_on_warning_or_unknown_state",
];

const requiredHumanActions: TradeExitRequiredHumanAction[] = [
  "review_broker_sell_order_form",
  "confirm_ticker_matches",
  "confirm_quantity_matches",
  "confirm_price_matches",
  "manually_click_final_sell",
  "record_actual_broker_exit_fill_in_trade_app",
];

function finiteNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function positiveNumber(value: number | null | undefined) {
  const parsed = finiteNumber(value);

  return parsed !== null && parsed > 0 ? parsed : null;
}

function roundMoney(value: number | null) {
  return value === null ? null : Number(value.toFixed(2));
}

function roundMetric(value: number | null) {
  return value === null ? null : Number(value.toFixed(4));
}

function nullableString(value: string | null | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function sanitizePayloadIdPart(value: string | null | undefined) {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value) ?? "null";
}

function fingerprintPayload(value: unknown) {
  try {
    const text = stableStringify(value);
    let hash = 2166136261;

    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return `fp_${(hash >>> 0).toString(16).padStart(8, "0")}`;
  } catch {
    return "fp_unavailable";
  }
}

function secondsInTrade(openedAt: string | null | undefined, now: Date) {
  if (!openedAt) {
    return null;
  }

  const openedAtTime = new Date(openedAt).getTime();

  if (!Number.isFinite(openedAtTime)) {
    return null;
  }

  return Math.max(0, Math.floor((now.getTime() - openedAtTime) / 1000));
}

export function buildTradeExitExecutionPayload(
  input: BuildTradeExitExecutionPayloadInput,
): TradeExitExecutionPayload {
  const now = input.now ?? new Date();
  const createdAt = input.createdAt ?? now.toISOString();
  const createdAtTime = new Date(createdAt).getTime();
  const validCreatedAtTime = Number.isFinite(createdAtTime)
    ? createdAtTime
    : now.getTime();
  const staleAfterSeconds =
    positiveNumber(input.staleAfterSeconds) ?? defaultStaleAfterSeconds;
  const expiresAt = new Date(
    validCreatedAtTime + staleAfterSeconds * 1000,
  ).toISOString();
  const positionId = nullableString(input.positionId) ?? "unknown_position";
  const ticker = sanitizePayloadIdPart(input.ticker).toUpperCase();
  const entryPrice = roundMoney(positiveNumber(input.entryPrice));
  const currentPrice = roundMoney(positiveNumber(input.currentPrice));
  const positionSize = positiveNumber(input.positionSize);
  const remainingShares = positiveNumber(input.remainingShares) ?? positionSize;
  const quantityToSell =
    remainingShares === null ? null : Math.floor(remainingShares);
  const stopPrice = roundMoney(positiveNumber(input.stopPrice));
  const targetPrice = roundMoney(positiveNumber(input.targetPrice));
  const priceReference = currentPrice ?? entryPrice;
  const setupType = normalizeSetupType(input.setupType);
  const handoffSessionId =
    nullableString(input.handoffSessionId) ??
    `exit_handoff_${sanitizePayloadIdPart(positionId)}_${sanitizePayloadIdPart(
      createdAt,
    )}`;
  const payloadId = `exit_execution_${sanitizePayloadIdPart(
    positionId,
  )}_${ticker}_${sanitizePayloadIdPart(createdAt)}`;
  const direction = nullableString(input.direction);
  const targetDistance =
    targetPrice !== null && priceReference !== null
      ? roundMoney(targetPrice - priceReference)
      : null;
  const stopDistance =
    stopPrice !== null && priceReference !== null
      ? roundMoney(priceReference - stopPrice)
      : null;
  const plannedMaxLoss =
    entryPrice !== null &&
    stopPrice !== null &&
    quantityToSell !== null &&
    entryPrice > stopPrice
      ? roundMoney((entryPrice - stopPrice) * quantityToSell)
      : null;
  const safetyWarnings: string[] = [];

  if (!positionId || positionId === "unknown_position") {
    safetyWarnings.push("Position id is missing.");
  }

  if (!ticker || ticker === "UNKNOWN") {
    safetyWarnings.push("Ticker is missing.");
  }

  if (quantityToSell === null || quantityToSell <= 0) {
    safetyWarnings.push("Quantity to sell is missing or not positive.");
  }

  if (priceReference === null) {
    safetyWarnings.push("Price reference is unavailable.");
  }

  if (now.getTime() > new Date(expiresAt).getTime()) {
    safetyWarnings.push("Sell execution payload is expired.");
  }

  const payloadWithoutFingerprint: TradeExitExecutionPayload = {
    payload_version: "1.0",
    payload_kind: "exit_execution",
    payload_id: payloadId,
    payload_fingerprint: "",
    handoff_session_id: handoffSessionId,
    created_at: createdAt,
    expires_at: expiresAt,
    stale_after_seconds: staleAfterSeconds,
    source: "close_trade_modal",
    broker_hint: "AVANZA",
    broker_execution_mode: "prepare_only",
    human_final_confirmation_required: true,
    do_not_submit_order: true,
    order_intent: {
      side: "SELL",
      action: "close_position",
      quantity_to_sell: quantityToSell,
      order_type: "market_reference",
      price_reference: priceReference,
      time_in_force: "day",
      currency: "USD",
    },
    exit_context: {
      position_id: positionId,
      ticker,
      company_name: nullableString(input.companyName),
      recommendation_id: nullableString(input.recommendationId),
      setup_type: setupType,
      close_reason: nullableString(input.closeReason),
      exit_reason: nullableString(input.exitReason),
      rule_action: nullableString(input.ruleAction),
      app_recommended_action: nullableString(input.appRecommendedAction),
      user_requested_close: true,
      close_requested_at: createdAt,
    },
    position_snapshot: {
      entry_price: entryPrice,
      current_price: currentPrice,
      position_size: positionSize,
      remaining_shares: remainingShares,
      opened_at: nullableString(input.openedAt),
      time_in_trade_seconds: secondsInTrade(input.openedAt, now),
      direction,
      stop_price: stopPrice,
      target_price: targetPrice,
    },
    risk_snapshot: {
      unrealized_pnl: roundMoney(finiteNumber(input.unrealizedPnl)),
      unrealized_pnl_percent: roundMetric(finiteNumber(input.unrealizedPnlPercent)),
      current_r: roundMetric(finiteNumber(input.currentR)),
      planned_max_loss: plannedMaxLoss,
      target_distance: targetDistance,
      stop_distance: stopDistance,
    },
    safety: {
      prepare_only: true,
      manual_final_confirmation_required: true,
      do_not_submit_order: true,
      stop_before: "final_broker_confirmation",
      allowed_agent_actions: allowedAgentActions,
      forbidden_actions: forbiddenActions,
      required_human_actions: requiredHumanActions,
    },
    agent_instructions: [
      "Read the sell execution payload.",
      "Prepare the Avanza sell order form only.",
      "Stop before final broker confirmation.",
      "Do not click SÄLJ or submit any order.",
      "Report preparation status and wait for human review.",
    ],
    safety_warnings: Array.from(new Set(safetyWarnings)),
  };

  return {
    ...payloadWithoutFingerprint,
    payload_fingerprint: fingerprintPayload({
      payload_kind: payloadWithoutFingerprint.payload_kind,
      position_id: payloadWithoutFingerprint.exit_context.position_id,
      ticker: payloadWithoutFingerprint.exit_context.ticker,
      side: payloadWithoutFingerprint.order_intent.side,
      quantity_to_sell: payloadWithoutFingerprint.order_intent.quantity_to_sell,
      price_reference: payloadWithoutFingerprint.order_intent.price_reference,
      handoff_session_id: payloadWithoutFingerprint.handoff_session_id,
      expires_at: payloadWithoutFingerprint.expires_at,
      broker_execution_mode: payloadWithoutFingerprint.broker_execution_mode,
      human_final_confirmation_required:
        payloadWithoutFingerprint.human_final_confirmation_required,
      do_not_submit_order: payloadWithoutFingerprint.do_not_submit_order,
    }),
  };
}

export function tradeExitExecutionPayloadJson(
  payload: TradeExitExecutionPayload,
) {
  return JSON.stringify(payload, null, 2);
}

export function getExitPayloadSecondsUntilExpiry(
  payload: TradeExitExecutionPayload,
  now: Date,
) {
  const expiresAt = new Date(payload.expires_at).getTime();

  if (!Number.isFinite(expiresAt)) {
    return 0;
  }

  return Math.max(0, Math.ceil((expiresAt - now.getTime()) / 1000));
}
