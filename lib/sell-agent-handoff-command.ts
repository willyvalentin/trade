import type { TradeExitExecutionPayload } from "@/lib/exit-execution-payload";
import {
  evaluateSellHardStopContract,
  type SellHardStopContract,
} from "@/lib/sell-hard-stop-contract";

export type SellAgentHandoffStatus = "ready" | "warning" | "blocked";
export type SellAgentHandoffBroker = "AVANZA";
export type SellAgentHandoffBrokerExecutionMode = "prepare_only";
export type SellAgentHandoffTask = "prepare_sell_order_form_only";
export type SellAgentHandoffStopBefore =
  | "final_broker_confirmation"
  | "sell_submit_button";

export type SellAgentHandoffForbiddenAction =
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

export type SellAgentHandoffAllowedAction =
  | "read_exit_execution_payload"
  | "open_broker_sell_order_form"
  | "fill_sell_order_form_fields"
  | "pause_for_user_review"
  | "report_preparation_status"
  | "stop_on_warning_or_unknown_state";

export type SellAgentHandoffRequiredHumanAction =
  | "review_broker_sell_order_form"
  | "confirm_ticker_matches"
  | "confirm_quantity_matches"
  | "confirm_price_matches"
  | "manually_click_final_sell"
  | "record_actual_broker_exit_fill_in_trade_app";

export type SellAgentHandoffFormFields = {
  instrument_search: string | null;
  ticker_symbol: string | null;
  company_name: string | null;
  order_side: "SELL" | null;
  quantity: number | null;
  price_type: "market_reference" | "limit_reference" | "review_required";
  price_reference: number | null;
  limit_price: number | null;
  currency: "USD" | null;
  broker: SellAgentHandoffBroker;
  stop_before_final_confirmation: true;
};

export type SellAgentHandoffReviewFields = {
  payload_id: string | null;
  payload_fingerprint: string | null;
  handoff_session_id: string | null;
  expires_at: string | null;
  entry_price: number | null;
  current_price: number | null;
  unrealized_pnl: number | null;
  current_r: number | null;
  stop_price: number | null;
  target_price: number | null;
  rule_action: string | null;
  app_recommended_action: string | null;
  close_reason: string | null;
  time_in_trade_seconds: number | null;
  manual_final_confirmation_required: boolean;
  do_not_submit_order: boolean;
};

export type SellAgentHandoffCommand = {
  command_id: string;
  command_version: "1.0";
  command_kind: "sell_handoff_command";
  created_at: string;
  expires_at: string | null;
  handoff_session_id: string | null;
  payload_id: string | null;
  payload_fingerprint: string | null;
  broker: SellAgentHandoffBroker;
  broker_execution_mode: SellAgentHandoffBrokerExecutionMode;
  task: SellAgentHandoffTask;
  status: SellAgentHandoffStatus;
  status_reasons: string[];
  warning_reasons: string[];
  instrument: {
    ticker_symbol: string | null;
    company_name: string | null;
    currency: "USD" | null;
  };
  order_intent: {
    side: "SELL" | null;
    action: "close_position" | "partial_close" | null;
    quantity_to_sell: number | null;
    order_type: "market_reference" | "limit_reference" | "review_required";
    price_reference: number | null;
    time_in_force: "day" | null;
  };
  exit_context: {
    position_id: string | null;
    recommendation_id: string | null;
    setup_type: string | null;
    close_reason: string | null;
    exit_reason: string | null;
    rule_action: string | null;
    app_recommended_action: string | null;
    user_requested_close: boolean;
    close_requested_at: string | null;
  };
  form_fields: SellAgentHandoffFormFields;
  review_fields: SellAgentHandoffReviewFields;
  forbidden_actions: SellAgentHandoffForbiddenAction[];
  allowed_agent_actions: SellAgentHandoffAllowedAction[];
  required_human_actions: SellAgentHandoffRequiredHumanAction[];
  stop_before: SellAgentHandoffStopBefore[];
  safety_attestations: {
    prepare_only: true;
    no_broker_automation: true;
    no_order_submission: true;
    no_credential_handling: true;
    human_final_confirmation_required: true;
    stop_on_warning_or_unknown_state: true;
  };
  source_context: {
    payload_kind: string | null;
    payload_version: string | null;
    source: string | null;
    position_id: string | null;
    ticker: string | null;
    generated_from: "close_trade_modal";
  };
};

export type BuildSellAgentHandoffCommandInput = {
  payload?: TradeExitExecutionPayload | null;
  hardStopContract?: SellHardStopContract | null;
  now?: Date;
  createdAt?: string;
};

const forbiddenActions: SellAgentHandoffForbiddenAction[] = [
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

const allowedAgentActions: SellAgentHandoffAllowedAction[] = [
  "read_exit_execution_payload",
  "open_broker_sell_order_form",
  "fill_sell_order_form_fields",
  "pause_for_user_review",
  "report_preparation_status",
  "stop_on_warning_or_unknown_state",
];

const requiredHumanActions: SellAgentHandoffRequiredHumanAction[] = [
  "review_broker_sell_order_form",
  "confirm_ticker_matches",
  "confirm_quantity_matches",
  "confirm_price_matches",
  "manually_click_final_sell",
  "record_actual_broker_exit_fill_in_trade_app",
];

const stopBefore: SellAgentHandoffStopBefore[] = [
  "final_broker_confirmation",
  "sell_submit_button",
];

function positiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function sanitizeIdPart(value: string | null | undefined) {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "missing";
}

function buildInstrumentSearch(payload: TradeExitExecutionPayload | null) {
  const ticker = nullableString(payload?.exit_context.ticker);
  const companyName = nullableString(payload?.exit_context.company_name);

  if (ticker && companyName) {
    return `${ticker} · ${companyName}`;
  }

  return ticker ?? companyName;
}

export function buildSellAgentHandoffCommand({
  payload,
  hardStopContract,
  now = new Date(),
  createdAt,
}: BuildSellAgentHandoffCommandInput): SellAgentHandoffCommand {
  const created_at = createdAt ?? now.toISOString();
  const contract =
    hardStopContract ??
    evaluateSellHardStopContract({
      payload,
      now,
    });
  const blockingReasons = contract.top_blockers.map((rule) => rule.message);
  const warningReasons = contract.top_warnings.map((rule) => rule.message);
  const positionId = nullableString(payload?.exit_context.position_id);
  const ticker = nullableString(payload?.exit_context.ticker);
  const companyName = nullableString(payload?.exit_context.company_name);
  const quantity = positiveNumber(payload?.order_intent.quantity_to_sell);
  const priceReference = positiveNumber(payload?.order_intent.price_reference);
  const manualFinalConfirmationRequired =
    payload?.human_final_confirmation_required === true &&
    payload?.safety.manual_final_confirmation_required === true;
  const doNotSubmitOrder =
    payload?.do_not_submit_order === true &&
    payload?.safety.do_not_submit_order === true;
  const orderType =
    payload?.order_intent.order_type === "market_reference" ||
    payload?.order_intent.order_type === "limit_reference"
      ? payload.order_intent.order_type
      : "review_required";

  const status: SellAgentHandoffStatus = contract.overall_status;
  const expiresAt = nullableString(payload?.expires_at);
  const payloadId = nullableString(payload?.payload_id);
  const payloadFingerprint = nullableString(payload?.payload_fingerprint);
  const handoffSessionId = nullableString(payload?.handoff_session_id);
  const instrumentSearch = buildInstrumentSearch(payload ?? null);
  const form_fields: SellAgentHandoffFormFields = {
    instrument_search: instrumentSearch,
    ticker_symbol: ticker,
    company_name: companyName,
    order_side: payload?.order_intent.side === "SELL" ? "SELL" : null,
    quantity,
    price_type: orderType,
    price_reference: priceReference,
    limit_price: orderType === "limit_reference" ? priceReference : null,
    currency: payload?.order_intent.currency === "USD" ? "USD" : null,
    broker: "AVANZA",
    stop_before_final_confirmation: true,
  };
  const review_fields: SellAgentHandoffReviewFields = {
    payload_id: payloadId,
    payload_fingerprint: payloadFingerprint,
    handoff_session_id: handoffSessionId,
    expires_at: expiresAt,
    entry_price: positiveNumber(payload?.position_snapshot.entry_price),
    current_price: positiveNumber(payload?.position_snapshot.current_price),
    unrealized_pnl:
      typeof payload?.risk_snapshot.unrealized_pnl === "number" &&
      Number.isFinite(payload.risk_snapshot.unrealized_pnl)
        ? payload.risk_snapshot.unrealized_pnl
        : null,
    current_r:
      typeof payload?.risk_snapshot.current_r === "number" &&
      Number.isFinite(payload.risk_snapshot.current_r)
        ? payload.risk_snapshot.current_r
        : null,
    stop_price: positiveNumber(payload?.position_snapshot.stop_price),
    target_price: positiveNumber(payload?.position_snapshot.target_price),
    rule_action: nullableString(payload?.exit_context.rule_action),
    app_recommended_action: nullableString(
      payload?.exit_context.app_recommended_action,
    ),
    close_reason: nullableString(payload?.exit_context.close_reason),
    time_in_trade_seconds:
      typeof payload?.position_snapshot.time_in_trade_seconds === "number" &&
      Number.isFinite(payload.position_snapshot.time_in_trade_seconds)
        ? payload.position_snapshot.time_in_trade_seconds
        : null,
    manual_final_confirmation_required: manualFinalConfirmationRequired,
    do_not_submit_order: doNotSubmitOrder,
  };

  return {
    command_id: `sell_agent_command_${sanitizeIdPart(
      handoffSessionId,
    )}_${sanitizeIdPart(payloadId)}_${sanitizeIdPart(payloadFingerprint)}`,
    command_version: "1.0",
    command_kind: "sell_handoff_command",
    created_at,
    expires_at: expiresAt,
    handoff_session_id: handoffSessionId,
    payload_id: payloadId,
    payload_fingerprint: payloadFingerprint,
    broker: "AVANZA",
    broker_execution_mode: "prepare_only",
    task: "prepare_sell_order_form_only",
    status,
    status_reasons: blockingReasons,
    warning_reasons: warningReasons,
    instrument: {
      ticker_symbol: ticker,
      company_name: companyName,
      currency: form_fields.currency,
    },
    order_intent: {
      side: payload?.order_intent.side === "SELL" ? "SELL" : null,
      action: payload?.order_intent.action ?? null,
      quantity_to_sell: quantity,
      order_type: orderType,
      price_reference: priceReference,
      time_in_force: payload?.order_intent.time_in_force === "day" ? "day" : null,
    },
    exit_context: {
      position_id: positionId,
      recommendation_id: nullableString(payload?.exit_context.recommendation_id),
      setup_type: nullableString(payload?.exit_context.setup_type),
      close_reason: nullableString(payload?.exit_context.close_reason),
      exit_reason: nullableString(payload?.exit_context.exit_reason),
      rule_action: nullableString(payload?.exit_context.rule_action),
      app_recommended_action: nullableString(
        payload?.exit_context.app_recommended_action,
      ),
      user_requested_close: payload?.exit_context.user_requested_close === true,
      close_requested_at: nullableString(payload?.exit_context.close_requested_at),
    },
    form_fields,
    review_fields,
    forbidden_actions: forbiddenActions,
    allowed_agent_actions: allowedAgentActions,
    required_human_actions: requiredHumanActions,
    stop_before: stopBefore,
    safety_attestations: {
      prepare_only: true,
      no_broker_automation: true,
      no_order_submission: true,
      no_credential_handling: true,
      human_final_confirmation_required: true,
      stop_on_warning_or_unknown_state: true,
    },
    source_context: {
      payload_kind: payload?.payload_kind ?? null,
      payload_version: payload?.payload_version ?? null,
      source: payload?.source ?? null,
      position_id: positionId,
      ticker,
      generated_from: "close_trade_modal",
    },
  };
}

export function sellAgentHandoffCommandJson(
  command: SellAgentHandoffCommand,
) {
  return JSON.stringify(command, null, 2);
}
