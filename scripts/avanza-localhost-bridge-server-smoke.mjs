#!/usr/bin/env node

import { spawn } from "node:child_process";

const CONTRACT_VERSION = "avanza_localhost_bridge_v1";
const PORT = Number.parseInt(
  process.env.AVANZA_LOCALHOST_BRIDGE_SMOKE_PORT ?? "47832",
  10,
);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const MOCK_ONLY_PORT = PORT + 1;
const MOCK_ONLY_BASE_URL = `http://127.0.0.1:${MOCK_ONLY_PORT}`;
const SKELETON_PORT = PORT + 2;
const SKELETON_BASE_URL = `http://127.0.0.1:${SKELETON_PORT}`;
const SESSION_READY_PORT = PORT + 3;
const SESSION_READY_BASE_URL = `http://127.0.0.1:${SESSION_READY_PORT}`;
const SESSION_LOGIN_PORT = PORT + 4;
const SESSION_LOGIN_BASE_URL = `http://127.0.0.1:${SESSION_LOGIN_PORT}`;
const SESSION_BLOCKED_PORT = PORT + 5;
const SESSION_BLOCKED_BASE_URL = `http://127.0.0.1:${SESSION_BLOCKED_PORT}`;
const SEARCH_EXACT_PORT = PORT + 6;
const SEARCH_EXACT_BASE_URL = `http://127.0.0.1:${SEARCH_EXACT_PORT}`;
const SEARCH_AMBIGUOUS_PORT = PORT + 7;
const SEARCH_AMBIGUOUS_BASE_URL = `http://127.0.0.1:${SEARCH_AMBIGUOUS_PORT}`;
const SEARCH_NO_MATCH_PORT = PORT + 8;
const SEARCH_NO_MATCH_BASE_URL = `http://127.0.0.1:${SEARCH_NO_MATCH_PORT}`;
const SEARCH_BLOCKED_SENSITIVE_PORT = PORT + 9;
const SEARCH_BLOCKED_SENSITIVE_BASE_URL =
  `http://127.0.0.1:${SEARCH_BLOCKED_SENSITIVE_PORT}`;
const SEARCH_BLOCKED_ORDER_FLOW_PORT = PORT + 10;
const SEARCH_BLOCKED_ORDER_FLOW_BASE_URL =
  `http://127.0.0.1:${SEARCH_BLOCKED_ORDER_FLOW_PORT}`;
const INSTRUMENT_VERIFIED_PORT = PORT + 11;
const INSTRUMENT_VERIFIED_BASE_URL =
  `http://127.0.0.1:${INSTRUMENT_VERIFIED_PORT}`;
const INSTRUMENT_REJECTED_TICKER_PORT = PORT + 12;
const INSTRUMENT_REJECTED_TICKER_BASE_URL =
  `http://127.0.0.1:${INSTRUMENT_REJECTED_TICKER_PORT}`;
const INSTRUMENT_AMBIGUOUS_CURRENCY_PORT = PORT + 13;
const INSTRUMENT_AMBIGUOUS_CURRENCY_BASE_URL =
  `http://127.0.0.1:${INSTRUMENT_AMBIGUOUS_CURRENCY_PORT}`;
const INSTRUMENT_BLOCKED_ORDER_FLOW_PORT = PORT + 14;
const INSTRUMENT_BLOCKED_ORDER_FLOW_BASE_URL =
  `http://127.0.0.1:${INSTRUMENT_BLOCKED_ORDER_FLOW_PORT}`;
const INSTRUMENT_PAGE_IDENTIFIED_PORT = PORT + 15;
const INSTRUMENT_PAGE_IDENTIFIED_BASE_URL =
  `http://127.0.0.1:${INSTRUMENT_PAGE_IDENTIFIED_PORT}`;
const INSTRUMENT_PAGE_BUY_SELL_PORT = PORT + 16;
const INSTRUMENT_PAGE_BUY_SELL_BASE_URL =
  `http://127.0.0.1:${INSTRUMENT_PAGE_BUY_SELL_PORT}`;
const INSTRUMENT_PAGE_MISMATCH_PORT = PORT + 17;
const INSTRUMENT_PAGE_MISMATCH_BASE_URL =
  `http://127.0.0.1:${INSTRUMENT_PAGE_MISMATCH_PORT}`;
const INSTRUMENT_PAGE_BLOCKED_ORDER_PORT = PORT + 18;
const INSTRUMENT_PAGE_BLOCKED_ORDER_BASE_URL =
  `http://127.0.0.1:${INSTRUMENT_PAGE_BLOCKED_ORDER_PORT}`;
const INSTRUMENT_PAGE_BLOCKED_CONFIRM_PORT = PORT + 19;
const INSTRUMENT_PAGE_BLOCKED_CONFIRM_BASE_URL =
  `http://127.0.0.1:${INSTRUMENT_PAGE_BLOCKED_CONFIRM_PORT}`;
const INSTRUMENT_PAGE_BLOCKED_SENSITIVE_PORT = PORT + 20;
const INSTRUMENT_PAGE_BLOCKED_SENSITIVE_BASE_URL =
  `http://127.0.0.1:${INSTRUMENT_PAGE_BLOCKED_SENSITIVE_PORT}`;
const ORDER_PAGE_OPEN_BUY_PORT = PORT + 21;
const ORDER_PAGE_OPEN_BUY_BASE_URL =
  `http://127.0.0.1:${ORDER_PAGE_OPEN_BUY_PORT}`;
const ORDER_PAGE_OPEN_SELL_PORT = PORT + 22;
const ORDER_PAGE_OPEN_SELL_BASE_URL =
  `http://127.0.0.1:${ORDER_PAGE_OPEN_SELL_PORT}`;
const ORDER_PAGE_WRONG_ACTION_PORT = PORT + 23;
const ORDER_PAGE_WRONG_ACTION_BASE_URL =
  `http://127.0.0.1:${ORDER_PAGE_WRONG_ACTION_PORT}`;
const ORDER_PAGE_MISMATCH_TICKER_PORT = PORT + 24;
const ORDER_PAGE_MISMATCH_TICKER_BASE_URL =
  `http://127.0.0.1:${ORDER_PAGE_MISMATCH_TICKER_PORT}`;
const ORDER_PAGE_MISMATCH_CURRENCY_PORT = PORT + 25;
const ORDER_PAGE_MISMATCH_CURRENCY_BASE_URL =
  `http://127.0.0.1:${ORDER_PAGE_MISMATCH_CURRENCY_PORT}`;
const ORDER_PAGE_PREFILLED_PORT = PORT + 26;
const ORDER_PAGE_PREFILLED_BASE_URL =
  `http://127.0.0.1:${ORDER_PAGE_PREFILLED_PORT}`;
const ORDER_PAGE_BLOCKED_FINAL_CONFIRM_PORT = PORT + 27;
const ORDER_PAGE_BLOCKED_FINAL_CONFIRM_BASE_URL =
  `http://127.0.0.1:${ORDER_PAGE_BLOCKED_FINAL_CONFIRM_PORT}`;
const ORDER_PAGE_BLOCKED_REVIEW_PORT = PORT + 28;
const ORDER_PAGE_BLOCKED_REVIEW_BASE_URL =
  `http://127.0.0.1:${ORDER_PAGE_BLOCKED_REVIEW_PORT}`;
const ORDER_PAGE_BLOCKED_KEYBOARD_PORT = PORT + 29;
const ORDER_PAGE_BLOCKED_KEYBOARD_BASE_URL =
  `http://127.0.0.1:${ORDER_PAGE_BLOCKED_KEYBOARD_PORT}`;
const ORDER_PAGE_BLOCKED_SENSITIVE_PORT = PORT + 30;
const ORDER_PAGE_BLOCKED_SENSITIVE_BASE_URL =
  `http://127.0.0.1:${ORDER_PAGE_BLOCKED_SENSITIVE_PORT}`;
const ORDER_PAGE_INSTRUMENT_NOT_READY_PORT = PORT + 31;
const ORDER_PAGE_INSTRUMENT_NOT_READY_BASE_URL =
  `http://127.0.0.1:${ORDER_PAGE_INSTRUMENT_NOT_READY_PORT}`;
const ADVANCED_FORM_FILL_BUY_PORT = PORT + 32;
const ADVANCED_FORM_FILL_BUY_BASE_URL =
  `http://127.0.0.1:${ADVANCED_FORM_FILL_BUY_PORT}`;
const ADVANCED_FORM_FILL_SELL_PORT = PORT + 33;
const ADVANCED_FORM_FILL_SELL_BASE_URL =
  `http://127.0.0.1:${ADVANCED_FORM_FILL_SELL_PORT}`;
const ADVANCED_FORM_FILL_QUANTITY_MISMATCH_PORT = PORT + 34;
const ADVANCED_FORM_FILL_QUANTITY_MISMATCH_BASE_URL =
  `http://127.0.0.1:${ADVANCED_FORM_FILL_QUANTITY_MISMATCH_PORT}`;
const ADVANCED_FORM_FILL_PRICE_MISMATCH_PORT = PORT + 35;
const ADVANCED_FORM_FILL_PRICE_MISMATCH_BASE_URL =
  `http://127.0.0.1:${ADVANCED_FORM_FILL_PRICE_MISMATCH_PORT}`;
const ADVANCED_FORM_FILL_VALIDATION_ERROR_PORT = PORT + 36;
const ADVANCED_FORM_FILL_VALIDATION_ERROR_BASE_URL =
  `http://127.0.0.1:${ADVANCED_FORM_FILL_VALIDATION_ERROR_PORT}`;
const ADVANCED_FORM_FILL_STOP_LOSS_PORT = PORT + 37;
const ADVANCED_FORM_FILL_STOP_LOSS_BASE_URL =
  `http://127.0.0.1:${ADVANCED_FORM_FILL_STOP_LOSS_PORT}`;
const ADVANCED_FORM_FILL_REVIEW_PORT = PORT + 38;
const ADVANCED_FORM_FILL_REVIEW_BASE_URL =
  `http://127.0.0.1:${ADVANCED_FORM_FILL_REVIEW_PORT}`;
const ADVANCED_FORM_FILL_FINAL_CONFIRM_PORT = PORT + 39;
const ADVANCED_FORM_FILL_FINAL_CONFIRM_BASE_URL =
  `http://127.0.0.1:${ADVANCED_FORM_FILL_FINAL_CONFIRM_PORT}`;
const ADVANCED_FORM_FILL_KEYBOARD_PORT = PORT + 40;
const ADVANCED_FORM_FILL_KEYBOARD_BASE_URL =
  `http://127.0.0.1:${ADVANCED_FORM_FILL_KEYBOARD_PORT}`;
const REVIEW_CLICK_BUY_PORT = PORT + 41;
const REVIEW_CLICK_BUY_BASE_URL = `http://127.0.0.1:${REVIEW_CLICK_BUY_PORT}`;
const REVIEW_CLICK_SELL_PORT = PORT + 42;
const REVIEW_CLICK_SELL_BASE_URL = `http://127.0.0.1:${REVIEW_CLICK_SELL_PORT}`;
const REVIEW_CLICK_QUANTITY_MISMATCH_PORT = PORT + 43;
const REVIEW_CLICK_QUANTITY_MISMATCH_BASE_URL =
  `http://127.0.0.1:${REVIEW_CLICK_QUANTITY_MISMATCH_PORT}`;
const REVIEW_CLICK_PRICE_MISMATCH_PORT = PORT + 44;
const REVIEW_CLICK_PRICE_MISMATCH_BASE_URL =
  `http://127.0.0.1:${REVIEW_CLICK_PRICE_MISMATCH_PORT}`;
const REVIEW_CLICK_VALIDATION_ERROR_PORT = PORT + 45;
const REVIEW_CLICK_VALIDATION_ERROR_BASE_URL =
  `http://127.0.0.1:${REVIEW_CLICK_VALIDATION_ERROR_PORT}`;
const REVIEW_CLICK_FINAL_VISIBLE_PORT = PORT + 46;
const REVIEW_CLICK_FINAL_VISIBLE_BASE_URL =
  `http://127.0.0.1:${REVIEW_CLICK_FINAL_VISIBLE_PORT}`;
const REVIEW_CLICK_FINAL_CLICK_PORT = PORT + 47;
const REVIEW_CLICK_FINAL_CLICK_BASE_URL =
  `http://127.0.0.1:${REVIEW_CLICK_FINAL_CLICK_PORT}`;
const REVIEW_CLICK_KEYBOARD_PORT = PORT + 48;
const REVIEW_CLICK_KEYBOARD_BASE_URL =
  `http://127.0.0.1:${REVIEW_CLICK_KEYBOARD_PORT}`;
const REVIEW_CLICK_SENSITIVE_PORT = PORT + 49;
const REVIEW_CLICK_SENSITIVE_BASE_URL =
  `http://127.0.0.1:${REVIEW_CLICK_SENSITIVE_PORT}`;
const MANUAL_CONFIRMATION_WAIT_WAITING_PORT = PORT + 50;
const MANUAL_CONFIRMATION_WAIT_WAITING_BASE_URL =
  `http://127.0.0.1:${MANUAL_CONFIRMATION_WAIT_WAITING_PORT}`;
const MANUAL_CONFIRMATION_WAIT_USER_CANCELLED_PORT = PORT + 51;
const MANUAL_CONFIRMATION_WAIT_USER_CANCELLED_BASE_URL =
  `http://127.0.0.1:${MANUAL_CONFIRMATION_WAIT_USER_CANCELLED_PORT}`;
const MANUAL_CONFIRMATION_WAIT_USER_CONFIRMED_PORT = PORT + 52;
const MANUAL_CONFIRMATION_WAIT_USER_CONFIRMED_BASE_URL =
  `http://127.0.0.1:${MANUAL_CONFIRMATION_WAIT_USER_CONFIRMED_PORT}`;
const MANUAL_CONFIRMATION_WAIT_FINAL_CLICK_PORT = PORT + 53;
const MANUAL_CONFIRMATION_WAIT_FINAL_CLICK_BASE_URL =
  `http://127.0.0.1:${MANUAL_CONFIRMATION_WAIT_FINAL_CLICK_PORT}`;
const MANUAL_CONFIRMATION_WAIT_KEYBOARD_PORT = PORT + 54;
const MANUAL_CONFIRMATION_WAIT_KEYBOARD_BASE_URL =
  `http://127.0.0.1:${MANUAL_CONFIRMATION_WAIT_KEYBOARD_PORT}`;
const MANUAL_CONFIRMATION_WAIT_BROKER_RESULT_PORT = PORT + 55;
const MANUAL_CONFIRMATION_WAIT_BROKER_RESULT_BASE_URL =
  `http://127.0.0.1:${MANUAL_CONFIRMATION_WAIT_BROKER_RESULT_PORT}`;
const MANUAL_CONFIRMATION_WAIT_TRADE_MUTATION_PORT = PORT + 56;
const MANUAL_CONFIRMATION_WAIT_TRADE_MUTATION_BASE_URL =
  `http://127.0.0.1:${MANUAL_CONFIRMATION_WAIT_TRADE_MUTATION_PORT}`;
const MANUAL_CONFIRMATION_WAIT_SENSITIVE_PORT = PORT + 57;
const MANUAL_CONFIRMATION_WAIT_SENSITIVE_BASE_URL =
  `http://127.0.0.1:${MANUAL_CONFIRMATION_WAIT_SENSITIVE_PORT}`;
const MANUAL_CONFIRMATION_WAIT_NOT_READY_PORT = PORT + 58;
const MANUAL_CONFIRMATION_WAIT_NOT_READY_BASE_URL =
  `http://127.0.0.1:${MANUAL_CONFIRMATION_WAIT_NOT_READY_PORT}`;
const MANUAL_CONFIRMATION_WAIT_TIMED_OUT_PORT = PORT + 59;
const MANUAL_CONFIRMATION_WAIT_TIMED_OUT_BASE_URL =
  `http://127.0.0.1:${MANUAL_CONFIRMATION_WAIT_TIMED_OUT_PORT}`;
const MANUAL_CONFIRMATION_WAIT_FINAL_VISIBLE_PORT = PORT + 60;
const MANUAL_CONFIRMATION_WAIT_FINAL_VISIBLE_BASE_URL =
  `http://127.0.0.1:${MANUAL_CONFIRMATION_WAIT_FINAL_VISIBLE_PORT}`;
const BROKER_CONFIRMATION_CAPTURE_FILLED_PORT = PORT + 61;
const BROKER_CONFIRMATION_CAPTURE_FILLED_BASE_URL =
  `http://127.0.0.1:${BROKER_CONFIRMATION_CAPTURE_FILLED_PORT}`;
const BROKER_CONFIRMATION_CAPTURE_SELL_PORT = PORT + 62;
const BROKER_CONFIRMATION_CAPTURE_SELL_BASE_URL =
  `http://127.0.0.1:${BROKER_CONFIRMATION_CAPTURE_SELL_PORT}`;
const BROKER_CONFIRMATION_CAPTURE_PARTIAL_PORT = PORT + 63;
const BROKER_CONFIRMATION_CAPTURE_PARTIAL_BASE_URL =
  `http://127.0.0.1:${BROKER_CONFIRMATION_CAPTURE_PARTIAL_PORT}`;
const BROKER_CONFIRMATION_CAPTURE_QUANTITY_MISMATCH_PORT = PORT + 64;
const BROKER_CONFIRMATION_CAPTURE_QUANTITY_MISMATCH_BASE_URL =
  `http://127.0.0.1:${BROKER_CONFIRMATION_CAPTURE_QUANTITY_MISMATCH_PORT}`;
const BROKER_CONFIRMATION_CAPTURE_PRICE_MISMATCH_PORT = PORT + 65;
const BROKER_CONFIRMATION_CAPTURE_PRICE_MISMATCH_BASE_URL =
  `http://127.0.0.1:${BROKER_CONFIRMATION_CAPTURE_PRICE_MISMATCH_PORT}`;
const BROKER_CONFIRMATION_CAPTURE_REJECTED_PORT = PORT + 66;
const BROKER_CONFIRMATION_CAPTURE_REJECTED_BASE_URL =
  `http://127.0.0.1:${BROKER_CONFIRMATION_CAPTURE_REJECTED_PORT}`;
const BROKER_CONFIRMATION_CAPTURE_BROKER_RESULT_PORT = PORT + 67;
const BROKER_CONFIRMATION_CAPTURE_BROKER_RESULT_BASE_URL =
  `http://127.0.0.1:${BROKER_CONFIRMATION_CAPTURE_BROKER_RESULT_PORT}`;
const BROKER_CONFIRMATION_CAPTURE_TRADE_MUTATION_PORT = PORT + 68;
const BROKER_CONFIRMATION_CAPTURE_TRADE_MUTATION_BASE_URL =
  `http://127.0.0.1:${BROKER_CONFIRMATION_CAPTURE_TRADE_MUTATION_PORT}`;
const BROKER_CONFIRMATION_CAPTURE_PAGE_NOT_FOUND_PORT = PORT + 69;
const BROKER_CONFIRMATION_CAPTURE_PAGE_NOT_FOUND_BASE_URL =
  `http://127.0.0.1:${BROKER_CONFIRMATION_CAPTURE_PAGE_NOT_FOUND_PORT}`;
const BROKER_CONFIRMATION_CAPTURE_SENSITIVE_PORT = PORT + 70;
const BROKER_CONFIRMATION_CAPTURE_SENSITIVE_BASE_URL =
  `http://127.0.0.1:${BROKER_CONFIRMATION_CAPTURE_SENSITIVE_PORT}`;
const BROKER_EXECUTION_ELIGIBILITY_FILLED_PORT = PORT + 71;
const BROKER_EXECUTION_ELIGIBILITY_FILLED_BASE_URL =
  `http://127.0.0.1:${BROKER_EXECUTION_ELIGIBILITY_FILLED_PORT}`;
const BROKER_EXECUTION_ELIGIBILITY_PARTIAL_PORT = PORT + 72;
const BROKER_EXECUTION_ELIGIBILITY_PARTIAL_BASE_URL =
  `http://127.0.0.1:${BROKER_EXECUTION_ELIGIBILITY_PARTIAL_PORT}`;
const BROKER_EXECUTION_ELIGIBILITY_PARTIAL_FILL_PORT = PORT + 73;
const BROKER_EXECUTION_ELIGIBILITY_PARTIAL_FILL_BASE_URL =
  `http://127.0.0.1:${BROKER_EXECUTION_ELIGIBILITY_PARTIAL_FILL_PORT}`;
const BROKER_EXECUTION_ELIGIBILITY_MISMATCH_PORT = PORT + 74;
const BROKER_EXECUTION_ELIGIBILITY_MISMATCH_BASE_URL =
  `http://127.0.0.1:${BROKER_EXECUTION_ELIGIBILITY_MISMATCH_PORT}`;
const BROKER_EXECUTION_ELIGIBILITY_MISSING_PRICE_PORT = PORT + 75;
const BROKER_EXECUTION_ELIGIBILITY_MISSING_PRICE_BASE_URL =
  `http://127.0.0.1:${BROKER_EXECUTION_ELIGIBILITY_MISSING_PRICE_PORT}`;
const BROKER_EXECUTION_ELIGIBILITY_SENSITIVE_PORT = PORT + 76;
const BROKER_EXECUTION_ELIGIBILITY_SENSITIVE_BASE_URL =
  `http://127.0.0.1:${BROKER_EXECUTION_ELIGIBILITY_SENSITIVE_PORT}`;
const BROKER_EXECUTION_ELIGIBILITY_BROKER_RESULT_PORT = PORT + 77;
const BROKER_EXECUTION_ELIGIBILITY_BROKER_RESULT_BASE_URL =
  `http://127.0.0.1:${BROKER_EXECUTION_ELIGIBILITY_BROKER_RESULT_PORT}`;
const BROKER_EXECUTION_ELIGIBILITY_TRADE_MUTATION_PORT = PORT + 78;
const BROKER_EXECUTION_ELIGIBILITY_TRADE_MUTATION_BASE_URL =
  `http://127.0.0.1:${BROKER_EXECUTION_ELIGIBILITY_TRADE_MUTATION_PORT}`;
const BROKER_EXECUTION_ELIGIBILITY_DUPLICATE_PORT = PORT + 79;
const BROKER_EXECUTION_ELIGIBILITY_DUPLICATE_BASE_URL =
  `http://127.0.0.1:${BROKER_EXECUTION_ELIGIBILITY_DUPLICATE_PORT}`;
const BROKER_EXECUTION_PREVIEW_FILLED_PORT = PORT + 80;
const BROKER_EXECUTION_PREVIEW_FILLED_BASE_URL =
  `http://127.0.0.1:${BROKER_EXECUTION_PREVIEW_FILLED_PORT}`;
const BROKER_EXECUTION_PREVIEW_MISSING_OPTIONAL_PORT = PORT + 81;
const BROKER_EXECUTION_PREVIEW_MISSING_OPTIONAL_BASE_URL =
  `http://127.0.0.1:${BROKER_EXECUTION_PREVIEW_MISSING_OPTIONAL_PORT}`;
const BROKER_EXECUTION_PREVIEW_PARTIAL_PORT = PORT + 82;
const BROKER_EXECUTION_PREVIEW_PARTIAL_BASE_URL =
  `http://127.0.0.1:${BROKER_EXECUTION_PREVIEW_PARTIAL_PORT}`;
const BROKER_EXECUTION_PREVIEW_MISMATCH_PORT = PORT + 83;
const BROKER_EXECUTION_PREVIEW_MISMATCH_BASE_URL =
  `http://127.0.0.1:${BROKER_EXECUTION_PREVIEW_MISMATCH_PORT}`;
const BROKER_EXECUTION_PREVIEW_SENSITIVE_PORT = PORT + 84;
const BROKER_EXECUTION_PREVIEW_SENSITIVE_BASE_URL =
  `http://127.0.0.1:${BROKER_EXECUTION_PREVIEW_SENSITIVE_PORT}`;
const BROKER_EXECUTION_PREVIEW_DUPLICATE_PORT = PORT + 85;
const BROKER_EXECUTION_PREVIEW_DUPLICATE_BASE_URL =
  `http://127.0.0.1:${BROKER_EXECUTION_PREVIEW_DUPLICATE_PORT}`;
const EXECUTION_RECORD_ELIGIBILITY_FILLED_PORT = PORT + 86;
const EXECUTION_RECORD_ELIGIBILITY_FILLED_BASE_URL =
  `http://127.0.0.1:${EXECUTION_RECORD_ELIGIBILITY_FILLED_PORT}`;
const EXECUTION_RECORD_ELIGIBILITY_PREVIEW_PORT = PORT + 87;
const EXECUTION_RECORD_ELIGIBILITY_PREVIEW_BASE_URL =
  `http://127.0.0.1:${EXECUTION_RECORD_ELIGIBILITY_PREVIEW_PORT}`;
const EXECUTION_RECORD_ELIGIBILITY_MISSING_PRICE_PORT = PORT + 88;
const EXECUTION_RECORD_ELIGIBILITY_MISSING_PRICE_BASE_URL =
  `http://127.0.0.1:${EXECUTION_RECORD_ELIGIBILITY_MISSING_PRICE_PORT}`;
const EXECUTION_RECORD_ELIGIBILITY_NOT_FILLED_PORT = PORT + 89;
const EXECUTION_RECORD_ELIGIBILITY_NOT_FILLED_BASE_URL =
  `http://127.0.0.1:${EXECUTION_RECORD_ELIGIBILITY_NOT_FILLED_PORT}`;
const EXECUTION_RECORD_ELIGIBILITY_SENSITIVE_PORT = PORT + 90;
const EXECUTION_RECORD_ELIGIBILITY_SENSITIVE_BASE_URL =
  `http://127.0.0.1:${EXECUTION_RECORD_ELIGIBILITY_SENSITIVE_PORT}`;
const EXECUTION_RECORD_ELIGIBILITY_SUPABASE_PORT = PORT + 91;
const EXECUTION_RECORD_ELIGIBILITY_SUPABASE_BASE_URL =
  `http://127.0.0.1:${EXECUTION_RECORD_ELIGIBILITY_SUPABASE_PORT}`;
const EXECUTION_RECORD_ELIGIBILITY_TRADE_PORT = PORT + 92;
const EXECUTION_RECORD_ELIGIBILITY_TRADE_BASE_URL =
  `http://127.0.0.1:${EXECUTION_RECORD_ELIGIBILITY_TRADE_PORT}`;
const EXECUTION_RECORD_ELIGIBILITY_DUP_SOURCE_PORT = PORT + 93;
const EXECUTION_RECORD_ELIGIBILITY_DUP_SOURCE_BASE_URL =
  `http://127.0.0.1:${EXECUTION_RECORD_ELIGIBILITY_DUP_SOURCE_PORT}`;
const EXECUTION_RECORD_ELIGIBILITY_DUP_BROKER_PORT = PORT + 94;
const EXECUTION_RECORD_ELIGIBILITY_DUP_BROKER_BASE_URL =
  `http://127.0.0.1:${EXECUTION_RECORD_ELIGIBILITY_DUP_BROKER_PORT}`;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(baseUrl = BASE_URL) {
  const deadline = Date.now() + 6000;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`);

      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      lastError = error;
    }

    await delay(150);
  }

  throw lastError ?? new Error("Timed out waiting for bridge health.");
}

async function requestJson(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.contentType === false
        ? {}
        : { "Content-Type": options.contentType ?? "application/json" }),
      Origin: "http://localhost:3000",
    },
    ...(typeof options.rawBody === "string"
      ? { body: options.rawBody }
      : typeof options.body === "undefined"
        ? {}
        : { body: JSON.stringify(options.body) }),
  });

  return {
    status: response.status,
    body: await response.json(),
  };
}

async function postJson(path, body, baseUrl = BASE_URL) {
  return requestJson(baseUrl, path, {
    method: "POST",
    body,
  });
}

async function postRawJson(path, rawBody, baseUrl = BASE_URL) {
  return requestJson(baseUrl, path, {
    method: "POST",
    rawBody,
  });
}

async function getJson(path, baseUrl = BASE_URL) {
  return requestJson(baseUrl, path, {
    method: "GET",
  });
}

function buildRunPayload() {
  const requestId = "avanza_agent_request_smoke_001";
  const createdAt = new Date().toISOString();
  const intent = {
    intent_version: "1.0",
    intent_id: "execution_intent_smoke_001",
    created_at: createdAt,
    mode: "semi_automatic",
    authority: {
      authority_version: "1.0",
      mode: "semi_automatic",
      can_create_execution_intent: true,
      can_prepare_broker_form: true,
      can_submit_broker_order: false,
      allowFinalSubmit: false,
      requires_human_final_confirmation: true,
      final_confirmation_actor: "human",
      required_safety_checks: [
        "validate_execution_intent",
        "validate_trading_package_freshness",
        "validate_broker_form_matches_intent",
        "validate_account_and_instrument",
        "validate_risk_limits",
        "validate_no_higher_priority_exit_pending",
      ],
      forbidden_agent_actions: [
        "submit_order",
        "click_buy",
        "click_sell",
        "confirm_order",
        "bypass_safety_checks",
        "override_human_confirmation",
        "modify_intent_after_review",
      ],
    },
    action: "sell",
    trigger_type: "manual_exit_requested",
    trigger_priority: 5,
    broker_hint: "AVANZA",
    source: "manual",
    trading_package: {
      package_version: "1.0",
      recommendation_id: null,
      live_position_id: "live_position_smoke_001",
      ticker: "QA.SMOKE",
      market: "US",
      quantity: 12,
      order_type: "limit",
      limit_price: 42.25,
      stop_loss: 39.5,
      target_price: 48.75,
      expires_at: null,
      payload_id: "payload_smoke_001",
      payload_fingerprint: "payload_smoke_fingerprint_001",
    },
    safety_warnings: [],
    broker_result: null,
  };

  return {
    version: CONTRACT_VERSION,
    dryRun: true,
    envelope: {
      envelopeId: "avanza_agent_bridge_request_smoke_001",
      createdAt,
      version: "avanza_agent_bridge_v1",
      type: "request",
      requestId,
      transport: "local_process",
      payload: {
        requestId,
        version: "avanza_agent_request_v1",
        broker: "avanza",
      },
      metadata: {
        smoke_test: true,
      },
    },
    request: {
      requestId,
      createdAt,
      version: "avanza_agent_request_v1",
      broker: "avanza",
      handoff: {
        version: "avanza_execution_handoff_v2",
        createdAt,
        broker: "avanza",
        status: "ready",
        mode: "semi_automatic",
        action: "sell",
        triggerType: "manual_exit_requested",
        intent,
        authority: intent.authority,
        safetyChecks: [
          {
            id: "ticker_exists",
            status: "passed",
            message: "Ticker is present.",
          },
          {
            id: "quantity_positive",
            status: "passed",
            message: "Quantity is positive.",
          },
          {
            id: "action_supported",
            status: "passed",
            message: "Execution action is supported.",
          },
          {
            id: "broker_is_avanza",
            status: "passed",
            message: "Broker is Avanza.",
          },
          {
            id: "authority_exists",
            status: "passed",
            message: "Execution authority is present.",
          },
          {
            id: "mode_authority_aligned",
            status: "passed",
            message: "Execution mode and authority are aligned.",
          },
        ],
        canPrepareOrder: true,
        canSubmitFinalOrder: false,
      },
      mode: "semi_automatic",
      action: "sell",
      authority: intent.authority,
      safetyChecks: [
        {
          id: "ticker_exists",
          status: "passed",
          message: "Ticker is present.",
        },
      ],
      requireManualFinalConfirmation: true,
      allowAutomaticFinalSubmit: false,
      metadata: {
        smoke_test: true,
      },
    },
    metadata: {
      smoke_test: true,
      local_diagnostics_only: true,
    },
  };
}

function buildDryRunPayload(overrides = {}) {
  const createdAt = new Date().toISOString();

  return {
    version: CONTRACT_VERSION,
    requestId: "avanza_dry_run_bridge_smoke_001",
    createdAt,
    dryRunOrderInput: {
      action: "buy",
      instrument: {
        ticker: "QA.DRYRUN",
        name: "QA Dry Run",
        market: "Stockholm",
        currency: "SEK",
        instrumentType: "stock",
      },
      quantity: 3,
      price: 101.25,
      orderMode: "advanced",
      accountPolicy: "require_manual_review",
      stopPolicy: "stop_at_confirmation_modal",
      sourceRecommendationId: "recommendation_dry_run_smoke_001",
      executionIntentId: "execution_intent_dry_run_smoke_001",
      createdAt,
      metadata: {
        allowFinalSubmit: false,
        supportsBrokerSubmission: false,
        supportsFinalConfirmClick: false,
        automaticModeCapable: false,
      },
    },
    capabilityValidationOptions: {
      allowAvanzaDryRun: true,
      allowBrokerSubmission: false,
      allowAutomaticMode: false,
    },
    metadata: {
      smoke_test: true,
      local_diagnostics_only: true,
      no_browser_actions_requested: true,
    },
    ...overrides,
  };
}

function createUnsafeDryRunPayload() {
  const basePayload = buildDryRunPayload();

  return buildDryRunPayload({
    requestId: "avanza_dry_run_bridge_smoke_unsafe_001",
    capabilityValidationOptions: {
      allowAvanzaDryRun: true,
      allowBrokerSubmission: true,
      allowAutomaticMode: true,
    },
    dryRunOrderInput: {
      ...basePayload.dryRunOrderInput,
      metadata: {
        allowFinalSubmit: true,
        supportsBrokerSubmission: true,
        supportsFinalConfirmClick: true,
        automaticModeCapable: true,
      },
    },
  });
}

function buildSearchOnlyPayload(overrides = {}) {
  return {
    version: CONTRACT_VERSION,
    requestId:
      overrides.requestId ?? "avanza_search_only_bridge_smoke_001",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    expectedInstrument:
      "expectedInstrument" in overrides
        ? overrides.expectedInstrument
        : {
            ticker: "QA.SEARCH",
            name: "QA Search Instrument",
            market: "Stockholm",
            currency: "SEK",
            instrumentType: "stock",
          },
    metadata: {
      smoke_test: true,
      local_diagnostics_only: true,
      no_browser_actions_requested: true,
      no_avanza_session: true,
      no_order_page: true,
      no_buy_sell_click: true,
      no_broker_submission: true,
      no_broker_result_created: true,
      no_trade_mutation: true,
      ...(overrides.metadata ?? {}),
    },
  };
}

function buildInstrumentVerificationPayload(overrides = {}) {
  return {
    version: CONTRACT_VERSION,
    requestId:
      overrides.requestId ??
      "avanza_instrument_verification_bridge_smoke_001",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    expectedInstrument:
      "expectedInstrument" in overrides
        ? overrides.expectedInstrument
        : {
            ticker: "QA.VERIFY",
            name: "QA Verify Instrument",
            market: "Stockholm",
            currency: "SEK",
            instrumentType: "stock",
          },
    ...(overrides.searchOnlyResult
      ? { searchOnlyResult: overrides.searchOnlyResult }
      : {}),
    ...(overrides.selectedCandidate
      ? { selectedCandidate: overrides.selectedCandidate }
      : {}),
    metadata: {
      smoke_test: true,
      local_diagnostics_only: true,
      no_browser_actions_requested: true,
      no_avanza_session: true,
      no_order_page: true,
      no_buy_sell_click: true,
      no_form_fill: true,
      no_broker_submission: true,
      no_broker_result_created: true,
      no_trade_mutation: true,
      ...(overrides.metadata ?? {}),
    },
  };
}

function buildInstrumentPagePayload(overrides = {}) {
  return {
    version: CONTRACT_VERSION,
    requestId:
      overrides.requestId ?? "avanza_instrument_page_bridge_smoke_001",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    expectedInstrument:
      "expectedInstrument" in overrides
        ? overrides.expectedInstrument
        : {
            ticker: "QA.PAGE",
            name: "QA Page Instrument",
            market: "Stockholm",
            currency: "SEK",
            instrumentType: "stock",
          },
    ...(overrides.instrumentVerificationResult
      ? { instrumentVerificationResult: overrides.instrumentVerificationResult }
      : {}),
    ...(overrides.pageIdentity ? { pageIdentity: overrides.pageIdentity } : {}),
    metadata: {
      smoke_test: true,
      local_diagnostics_only: true,
      no_browser_actions_requested: true,
      no_avanza_session: true,
      no_order_page: true,
      no_buy_sell_click: true,
      no_form_fill: true,
      no_broker_submission: true,
      no_broker_result_created: true,
      no_trade_mutation: true,
      ...(overrides.metadata ?? {}),
    },
  };
}

function buildOrderPageOpenPayload(overrides = {}) {
  const createdAt = overrides.createdAt ?? new Date().toISOString();
  const dryRunOrderInput =
    "dryRunOrderInput" in overrides
      ? overrides.dryRunOrderInput
      : {
          action: overrides.action ?? "buy",
          instrument: {
            ticker: "QA.ORDER",
            name: "QA Order Instrument",
            market: "Stockholm",
            currency: "SEK",
            instrumentType: "stock",
          },
          quantity: 4,
          price: 88.5,
          orderMode: "advanced",
          accountPolicy: "require_manual_review",
          stopPolicy: "stop_at_confirmation_modal",
          sourceRecommendationId: "recommendation_order_open_smoke_001",
          executionIntentId: "execution_intent_order_open_smoke_001",
          createdAt,
          metadata: {
            allowFinalSubmit: false,
            supportsBrokerSubmission: false,
            supportsFinalConfirmClick: false,
            automaticModeCapable: false,
          },
        };

  return {
    version: CONTRACT_VERSION,
    requestId:
      overrides.requestId ?? "avanza_order_page_open_bridge_smoke_001",
    createdAt,
    dryRunOrderInput,
    ...(overrides.instrumentPageResult
      ? { instrumentPageResult: overrides.instrumentPageResult }
      : {}),
    ...(overrides.orderPageIdentity
      ? { orderPageIdentity: overrides.orderPageIdentity }
      : {}),
    ...(overrides.attemptedAction
      ? { attemptedAction: overrides.attemptedAction }
      : {}),
    metadata: {
      smoke_test: true,
      local_diagnostics_only: true,
      no_browser_actions_requested: true,
      no_avanza_session: true,
      no_form_fill: true,
      no_review_click: true,
      no_final_confirm_click: true,
      no_broker_submission: true,
      no_broker_result_created: true,
      no_trade_mutation: true,
      ...(overrides.metadata ?? {}),
    },
  };
}

function buildAdvancedFormFillPayload(overrides = {}) {
  const baseOrderPagePayload = buildOrderPageOpenPayload({
    requestId: "avanza_advanced_form_fill_order_open_smoke_001",
    action: overrides.action ?? "buy",
  });
  const dryRunOrderInput =
    "dryRunOrderInput" in overrides
      ? overrides.dryRunOrderInput
      : baseOrderPagePayload.dryRunOrderInput;

  return {
    version: CONTRACT_VERSION,
    requestId:
      overrides.requestId ??
      "avanza_advanced_form_fill_bridge_smoke_001",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    dryRunOrderInput,
    ...(overrides.orderPageOpenResult
      ? { orderPageOpenResult: overrides.orderPageOpenResult }
      : {}),
    ...(overrides.formState ? { formState: overrides.formState } : {}),
    metadata: {
      smoke_test: true,
      local_diagnostics_only: true,
      no_browser_actions_requested: true,
      no_avanza_session: true,
      no_avanza_page_touched: true,
      no_real_form_fields_filled: true,
      no_review_click: true,
      no_final_confirm_click: true,
      no_broker_submission: true,
      no_broker_result_created: true,
      no_supabase_write: true,
      no_trade_mutation: true,
      ...(overrides.metadata ?? {}),
    },
  };
}

function buildReviewClickPayload(overrides = {}) {
  const baseAdvancedFormPayload = buildAdvancedFormFillPayload({
    requestId: "avanza_review_click_advanced_form_smoke_001",
    action: overrides.action ?? "buy",
  });
  const dryRunOrderInput =
    "dryRunOrderInput" in overrides
      ? overrides.dryRunOrderInput
      : baseAdvancedFormPayload.dryRunOrderInput;

  return {
    version: CONTRACT_VERSION,
    requestId: overrides.requestId ?? "avanza_review_click_bridge_smoke_001",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    dryRunOrderInput,
    ...(overrides.advancedFormFillResult
      ? { advancedFormFillResult: overrides.advancedFormFillResult }
      : {}),
    ...(overrides.confirmationReadback
      ? { confirmationReadback: overrides.confirmationReadback }
      : {}),
    ...(typeof overrides.reviewClickAttempted === "boolean"
      ? { reviewClickAttempted: overrides.reviewClickAttempted }
      : {}),
    ...(overrides.reviewLabel ? { reviewLabel: overrides.reviewLabel } : {}),
    metadata: {
      smoke_test: true,
      local_diagnostics_only: true,
      no_browser_actions_requested: true,
      no_avanza_session: true,
      no_avanza_page_touched: true,
      no_real_granska_clicked: true,
      no_bekrafta_clicked: true,
      no_final_confirm_click: true,
      no_broker_submission: true,
      no_broker_result_created: true,
      no_supabase_write: true,
      no_trade_mutation: true,
      ...(overrides.metadata ?? {}),
    },
  };
}

function buildManualConfirmationWaitPayload(overrides = {}) {
  return {
    version: CONTRACT_VERSION,
    requestId:
      overrides.requestId ??
      "avanza_manual_confirmation_wait_bridge_smoke_001",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    ...(overrides.reviewClickResult
      ? { reviewClickResult: overrides.reviewClickResult }
      : {}),
    ...(overrides.observation ? { observation: overrides.observation } : {}),
    ...(typeof overrides.timeoutMs === "number"
      ? { timeoutMs: overrides.timeoutMs }
      : {}),
    metadata: {
      smoke_test: true,
      local_diagnostics_only: true,
      no_browser_actions_requested: true,
      no_avanza_session: true,
      no_avanza_page_touched: true,
      no_bekrafta_clicked: true,
      no_final_confirm_click: true,
      no_broker_submission: true,
      no_broker_result_created: true,
      no_supabase_write: true,
      no_trade_mutation: true,
      ...(overrides.metadata ?? {}),
    },
  };
}

function buildBrokerConfirmationCapturePayload(overrides = {}) {
  const baseReviewPayload = buildReviewClickPayload({
    requestId: "avanza_broker_confirmation_capture_review_smoke_001",
    action: overrides.action ?? "buy",
  });
  const dryRunOrderInput =
    "dryRunOrderInput" in overrides
      ? overrides.dryRunOrderInput
      : baseReviewPayload.dryRunOrderInput;

  return {
    version: CONTRACT_VERSION,
    requestId:
      overrides.requestId ??
      "avanza_broker_confirmation_capture_bridge_smoke_001",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    dryRunOrderInput,
    ...(overrides.manualConfirmationWaitResult
      ? { manualConfirmationWaitResult: overrides.manualConfirmationWaitResult }
      : {}),
    ...(overrides.brokerConfirmationReadback
      ? { brokerConfirmationReadback: overrides.brokerConfirmationReadback }
      : {}),
    metadata: {
      smoke_test: true,
      local_diagnostics_only: true,
      no_browser_actions_requested: true,
      no_avanza_session: true,
      no_avanza_page_touched: true,
      no_avanza_urls: true,
      no_avanza_selectors: true,
      no_bekrafta_clicked: true,
      no_final_confirm_click: true,
      no_broker_submission: true,
      no_broker_execution_result_created: true,
      no_execution_record_created: true,
      no_supabase_write: true,
      no_trade_mutation: true,
      sanitized_evidence_only: true,
      ...(overrides.metadata ?? {}),
    },
  };
}

function buildBrokerExecutionEligibilityPayload(overrides = {}) {
  return {
    version: CONTRACT_VERSION,
    requestId:
      overrides.requestId ??
      "avanza_broker_execution_result_eligibility_bridge_smoke_001",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    ...(overrides.captureResult ? { captureResult: overrides.captureResult } : {}),
    ...(overrides.existingFingerprints
      ? { existingFingerprints: overrides.existingFingerprints }
      : {}),
    ...(overrides.options ? { options: overrides.options } : {}),
    metadata: {
      smoke_test: true,
      local_diagnostics_only: true,
      broker_execution_result_eligibility_stub_check: true,
      eligibility_check_only: true,
      no_browser_actions_requested: true,
      no_avanza_session: true,
      no_avanza_page_touched: true,
      no_avanza_urls: true,
      no_avanza_selectors: true,
      no_bekrafta_clicked: true,
      no_final_confirm_click: true,
      no_broker_submission: true,
      no_broker_execution_result_created: true,
      no_execution_record_created: true,
      no_supabase_write: true,
      no_trade_mutation: true,
      ...(overrides.metadata ?? {}),
    },
  };
}

function buildBrokerExecutionPreviewPayload(overrides = {}) {
  return {
    version: CONTRACT_VERSION,
    requestId:
      overrides.requestId ??
      "avanza_broker_execution_result_preview_bridge_smoke_001",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    ...(overrides.captureResult ? { captureResult: overrides.captureResult } : {}),
    ...(overrides.eligibilityResult
      ? { eligibilityResult: overrides.eligibilityResult }
      : {}),
    ...(overrides.existingFingerprints
      ? { existingFingerprints: overrides.existingFingerprints }
      : {}),
    ...(overrides.options ? { options: overrides.options } : {}),
    metadata: {
      smoke_test: true,
      local_diagnostics_only: true,
      broker_execution_result_preview_stub_check: true,
      preview_only: true,
      no_browser_actions_requested: true,
      no_avanza_session: true,
      no_avanza_page_touched: true,
      no_avanza_urls: true,
      no_avanza_selectors: true,
      no_bekrafta_clicked: true,
      no_final_confirm_click: true,
      no_broker_submission: true,
      no_real_broker_execution_result_created: true,
      no_execution_record_created: true,
      no_supabase_write: true,
      no_trade_mutation: true,
      ...(overrides.metadata ?? {}),
    },
  };
}

function buildExecutionRecordEligibilityPayload(overrides = {}) {
  return {
    version: CONTRACT_VERSION,
    requestId:
      overrides.requestId ?? "execution_record_eligibility_bridge_smoke_001",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    ...(overrides.candidate ? { candidate: overrides.candidate } : {}),
    ...(overrides.existingSourceFingerprints
      ? { existingSourceFingerprints: overrides.existingSourceFingerprints }
      : {}),
    ...(overrides.existingBrokerReferences
      ? { existingBrokerReferences: overrides.existingBrokerReferences }
      : {}),
    ...(overrides.options ? { options: overrides.options } : {}),
    metadata: {
      smoke_test: true,
      local_diagnostics_only: true,
      execution_record_eligibility_stub_check: true,
      execution_record_eligibility_check_only: true,
      no_browser_actions_requested: true,
      no_avanza_session: true,
      no_avanza_page_touched: true,
      no_avanza_urls: true,
      no_avanza_selectors: true,
      no_bekrafta_clicked: true,
      no_final_confirm_click: true,
      no_broker_submission: true,
      no_broker_execution_result_created: true,
      no_execution_record_created: true,
      no_supabase_write: true,
      no_trade_mutation: true,
      ...(overrides.metadata ?? {}),
    },
  };
}

function recordMatrixRow(rows, mode, endpoint, expected, actual, safety) {
  rows.push({
    mode,
    endpoint,
    expected,
    actual,
    safety,
    result: "PASS",
  });
}

function printMatrixSummary(rows) {
  console.log("");
  console.log("Localhost bridge smoke test matrix:");
  console.log(
    "mode | endpoint | expected | actual | result | key safety guarantees",
  );
  console.log("--- | --- | --- | --- | --- | ---");

  for (const row of rows) {
    console.log(
      `${row.mode} | ${row.endpoint} | ${row.expected} | ${row.actual} | ${row.result} | ${row.safety}`,
    );
  }

  console.log("");
}

function startBridge({
  port,
  selfCheckMode,
  sessionDetectionMode,
  searchOnlyMode,
  instrumentVerificationMode,
  instrumentPageMode,
  orderPageOpenMode,
  advancedFormFillMode,
  reviewClickMode,
  manualConfirmationWaitMode,
  brokerConfirmationCaptureMode,
  brokerExecutionResultEligibilityMode,
  brokerExecutionResultPreviewMode,
  executionRecordEligibilityMode,
} = {}) {
  const child = spawn(process.execPath, [
    "scripts/avanza-localhost-bridge-server.mjs",
  ], {
    env: {
      ...process.env,
      AVANZA_LOCALHOST_BRIDGE_PORT: String(port),
      ...(selfCheckMode
        ? { AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE: selfCheckMode }
        : {}),
      ...(sessionDetectionMode
        ? {
            AVANZA_LOCALHOST_BRIDGE_SESSION_DETECTION_MODE:
              sessionDetectionMode,
          }
        : {}),
      ...(searchOnlyMode
        ? {
            AVANZA_LOCALHOST_BRIDGE_SEARCH_ONLY_MODE: searchOnlyMode,
          }
        : {}),
      ...(instrumentVerificationMode
        ? {
            AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_VERIFICATION_MODE:
              instrumentVerificationMode,
          }
        : {}),
      ...(instrumentPageMode
        ? {
            AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_PAGE_MODE:
              instrumentPageMode,
          }
        : {}),
      ...(orderPageOpenMode
        ? {
            AVANZA_LOCALHOST_BRIDGE_ORDER_PAGE_OPEN_MODE:
              orderPageOpenMode,
          }
        : {}),
      ...(advancedFormFillMode
        ? {
            AVANZA_LOCALHOST_BRIDGE_ADVANCED_FORM_FILL_MODE:
              advancedFormFillMode,
          }
        : {}),
      ...(reviewClickMode
        ? { AVANZA_LOCALHOST_BRIDGE_REVIEW_CLICK_MODE: reviewClickMode }
        : {}),
      ...(manualConfirmationWaitMode
        ? {
            AVANZA_LOCALHOST_BRIDGE_MANUAL_CONFIRMATION_WAIT_MODE:
              manualConfirmationWaitMode,
          }
        : {}),
      ...(brokerConfirmationCaptureMode
        ? {
            AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE:
              brokerConfirmationCaptureMode,
          }
        : {}),
      ...(brokerExecutionResultEligibilityMode
        ? {
            AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_ELIGIBILITY_MODE:
              brokerExecutionResultEligibilityMode,
          }
        : {}),
      ...(brokerExecutionResultPreviewMode
        ? {
            AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_PREVIEW_MODE:
              brokerExecutionResultPreviewMode,
          }
        : {}),
      ...(executionRecordEligibilityMode
        ? {
            AVANZA_LOCALHOST_BRIDGE_EXECUTION_RECORD_ELIGIBILITY_MODE:
              executionRecordEligibilityMode,
          }
        : {}),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const output = { text: "" };

  child.stdout.on("data", (chunk) => {
    output.text += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    output.text += chunk.toString();
  });

  return { child, output };
}

async function stopBridge(bridge) {
  if (!bridge?.child) {
    return;
  }

  bridge.child.kill("SIGTERM");

  await new Promise((resolve) => {
    bridge.child.once("exit", resolve);
    setTimeout(resolve, 1000);
  });

  if (
    bridge.child.exitCode &&
    bridge.child.exitCode !== 0 &&
    bridge.child.exitCode !== null
  ) {
    console.error(bridge.output.text);
  }
}

function assertNoBrokerResult(body, context) {
  assert(
    typeof body.brokerResult === "undefined",
    `${context} must not include brokerResult.`,
  );
}

function assertNoExecutedDiagnostics(body, context) {
  const diagnostics = body.diagnostics;

  assert(
    diagnostics === null ||
      typeof diagnostics === "undefined" ||
      diagnostics.executedCount === 0,
    `${context} must not report executed browser actions.`,
  );
}

function assertSafeSessionDetectionResponse(body, context) {
  assertNoBrokerResult(body, context);
  assertNoExecutedDiagnostics(body, context);
  assert(
    body.metadata?.no_browser_actions_executed === true,
    `${context} must report no browser actions executed.`,
  );
  assert(
    body.metadata?.no_avanza_page_touched === true,
    `${context} must report no Avanza page was touched.`,
  );
  assert(
    body.metadata?.no_broker_submission === true,
    `${context} must report no broker submission.`,
  );
  assert(
    body.sessionDetection?.metadata?.noBrowserActions === true,
    `${context} sessionDetection must report noBrowserActions.`,
  );
  assert(
    body.sessionDetection?.metadata?.noOrderPreparation === true,
    `${context} sessionDetection must report noOrderPreparation.`,
  );
}

function assertSafeSearchOnlyResponse(body, context) {
  assertNoBrokerResult(body, context);
  assertNoExecutedDiagnostics(body, context);
  assert(
    body.metadata?.no_browser_actions_executed === true,
    `${context} must report no browser actions executed.`,
  );
  assert(
    body.metadata?.no_avanza_page_touched === true,
    `${context} must report no Avanza page was touched.`,
  );
  assert(
    body.metadata?.no_order_page_opened === true,
    `${context} must report no order page was opened.`,
  );
  assert(
    body.metadata?.no_broker_result_created === true,
    `${context} must report no broker result was created.`,
  );
  assert(
    body.searchOnly?.metadata?.searchOnly === true,
    `${context} searchOnly must report searchOnly=true.`,
  );
  assert(
    body.searchOnly?.metadata?.noOrderPage === true,
    `${context} searchOnly must report noOrderPage.`,
  );
  assert(
    body.searchOnly?.metadata?.noBuySellClick === true,
    `${context} searchOnly must report noBuySellClick.`,
  );
  assert(
    body.searchOnly?.metadata?.noBrokerSubmission === true,
    `${context} searchOnly must report noBrokerSubmission.`,
  );
  assert(
    body.searchOnly?.metadata?.noBrokerResult === true,
    `${context} searchOnly must report noBrokerResult.`,
  );
}

function assertSafeInstrumentVerificationResponse(body, context) {
  assertNoBrokerResult(body, context);
  assertNoExecutedDiagnostics(body, context);
  assert(
    body.metadata?.no_browser_actions_executed === true,
    `${context} must report no browser actions executed.`,
  );
  assert(
    body.metadata?.no_avanza_page_touched === true,
    `${context} must report no Avanza page was touched.`,
  );
  assert(
    body.metadata?.no_order_page_opened === true,
    `${context} must report no order page was opened.`,
  );
  assert(
    body.metadata?.no_broker_result_created === true,
    `${context} must report no broker result was created.`,
  );
  assert(
    body.instrumentVerification?.metadata?.instrumentVerificationOnly === true,
    `${context} instrumentVerification must report instrumentVerificationOnly=true.`,
  );
  assert(
    body.instrumentVerification?.metadata?.noOrderPage === true,
    `${context} instrumentVerification must report noOrderPage.`,
  );
  assert(
    body.instrumentVerification?.metadata?.noFormFill === true,
    `${context} instrumentVerification must report noFormFill.`,
  );
  assert(
    body.instrumentVerification?.metadata?.noBrokerSubmission === true,
    `${context} instrumentVerification must report noBrokerSubmission.`,
  );
  assert(
    body.instrumentVerification?.metadata?.noBrokerResult === true,
    `${context} instrumentVerification must report noBrokerResult.`,
  );
}

function assertSafeInstrumentPageResponse(body, context) {
  assertNoBrokerResult(body, context);
  assertNoExecutedDiagnostics(body, context);
  assert(
    body.metadata?.no_browser_actions_executed === true,
    `${context} must report no browser actions executed.`,
  );
  assert(
    body.metadata?.no_avanza_page_touched === true,
    `${context} must report no Avanza page was touched.`,
  );
  assert(
    body.metadata?.no_order_page_opened === true,
    `${context} must report no order page was opened.`,
  );
  assert(
    body.metadata?.no_buy_sell_click === true,
    `${context} must report no buy/sell click.`,
  );
  assert(
    body.metadata?.no_form_fill === true,
    `${context} must report no form fill.`,
  );
  assert(
    body.metadata?.no_broker_result_created === true,
    `${context} must report no broker result was created.`,
  );
  assert(
    body.instrumentPage?.metadata?.instrumentPageIdentityOnly === true,
    `${context} instrumentPage must report instrumentPageIdentityOnly=true.`,
  );
  assert(
    body.instrumentPage?.metadata?.noOrderPage === true,
    `${context} instrumentPage must report noOrderPage.`,
  );
  assert(
    body.instrumentPage?.metadata?.noBuySellClick === true,
    `${context} instrumentPage must report noBuySellClick.`,
  );
  assert(
    body.instrumentPage?.metadata?.noFormFill === true,
    `${context} instrumentPage must report noFormFill.`,
  );
  assert(
    body.instrumentPage?.metadata?.noBrokerSubmission === true,
    `${context} instrumentPage must report noBrokerSubmission.`,
  );
  assert(
    body.instrumentPage?.metadata?.noBrokerResult === true,
    `${context} instrumentPage must report noBrokerResult.`,
  );
}

function assertSafeOrderPageOpenResponse(body, context) {
  assertNoBrokerResult(body, context);
  assertNoExecutedDiagnostics(body, context);
  assert(
    body.metadata?.no_browser_actions_executed === true,
    `${context} must report no browser actions executed.`,
  );
  assert(
    body.metadata?.no_avanza_page_touched === true,
    `${context} must report no Avanza page was touched.`,
  );
  assert(
    body.metadata?.no_form_fill === true,
    `${context} must report no form fill.`,
  );
  assert(
    body.metadata?.no_review_click === true,
    `${context} must report no review click.`,
  );
  assert(
    body.metadata?.no_final_confirm_click === true,
    `${context} must report no final-confirm click.`,
  );
  assert(
    body.metadata?.no_broker_submission === true,
    `${context} must report no broker submission.`,
  );
  assert(
    body.metadata?.no_broker_result_created === true,
    `${context} must report no broker result was created.`,
  );
  assert(
    body.orderPageOpen?.metadata?.orderPageOpenOnly === true,
    `${context} orderPageOpen must report orderPageOpenOnly=true.`,
  );
  assert(
    body.orderPageOpen?.metadata?.noFormFill === true,
    `${context} orderPageOpen must report noFormFill.`,
  );
  assert(
    body.orderPageOpen?.metadata?.noReviewClick === true,
    `${context} orderPageOpen must report noReviewClick.`,
  );
  assert(
    body.orderPageOpen?.metadata?.noFinalConfirmClick === true,
    `${context} orderPageOpen must report noFinalConfirmClick.`,
  );
  assert(
    body.orderPageOpen?.metadata?.noBrokerSubmission === true,
    `${context} orderPageOpen must report noBrokerSubmission.`,
  );
  assert(
    body.orderPageOpen?.metadata?.noBrokerResult === true,
    `${context} orderPageOpen must report noBrokerResult.`,
  );
}

function assertSafeAdvancedFormFillResponse(body, context) {
  assertNoBrokerResult(body, context);
  assertNoExecutedDiagnostics(body, context);
  assert(
    body.metadata?.no_browser_actions_executed === true,
    `${context} must report no browser actions executed.`,
  );
  assert(
    body.metadata?.no_avanza_page_touched === true,
    `${context} must report no Avanza page was touched.`,
  );
  assert(
    body.metadata?.no_real_form_fields_filled === true,
    `${context} must report no real form fields were filled.`,
  );
  assert(
    body.metadata?.no_review_click === true,
    `${context} must report no review click.`,
  );
  assert(
    body.metadata?.no_final_confirm_click === true,
    `${context} must report no final-confirm click.`,
  );
  assert(
    body.metadata?.no_broker_submission === true,
    `${context} must report no broker submission.`,
  );
  assert(
    body.metadata?.no_broker_result_created === true,
    `${context} must report no broker result was created.`,
  );
  assert(
    body.metadata?.no_supabase_write === true,
    `${context} must report no Supabase write.`,
  );
  assert(
    body.metadata?.no_trade_mutation === true,
    `${context} must report no trade mutation.`,
  );
  assert(
    body.advancedFormFill?.metadata?.advancedFormFillOnly === true,
    `${context} advancedFormFill must report advancedFormFillOnly.`,
  );
  assert(
    body.advancedFormFill?.metadata?.noReviewClick === true,
    `${context} advancedFormFill must report noReviewClick.`,
  );
  assert(
    body.advancedFormFill?.metadata?.noFinalConfirmClick === true,
    `${context} advancedFormFill must report noFinalConfirmClick.`,
  );
  assert(
    body.advancedFormFill?.metadata?.noKeyboardSubmit === true,
    `${context} advancedFormFill must report noKeyboardSubmit.`,
  );
  assert(
    body.advancedFormFill?.metadata?.noBrokerSubmission === true,
    `${context} advancedFormFill must report noBrokerSubmission.`,
  );
  assert(
    body.advancedFormFill?.metadata?.noBrokerResult === true,
    `${context} advancedFormFill must report noBrokerResult.`,
  );
  assert(
    body.advancedFormFill?.metadata?.noSupabaseWrite === true,
    `${context} advancedFormFill must report noSupabaseWrite.`,
  );
}

function assertSafeReviewClickResponse(body, context) {
  assertNoBrokerResult(body, context);
  assertNoExecutedDiagnostics(body, context);
  assert(
    body.metadata?.no_browser_actions_executed === true,
    `${context} must report no browser actions executed.`,
  );
  assert(
    body.metadata?.no_avanza_page_touched === true,
    `${context} must report no Avanza page was touched.`,
  );
  assert(
    body.metadata?.no_real_granska_clicked === true,
    `${context} must report no real Granska was clicked.`,
  );
  assert(
    body.metadata?.no_bekrafta_clicked === true,
    `${context} must report no Bekräfta was clicked.`,
  );
  assert(
    body.metadata?.no_final_confirm_click === true,
    `${context} must report no final-confirm click.`,
  );
  assert(
    body.metadata?.no_broker_submission === true,
    `${context} must report no broker submission.`,
  );
  assert(
    body.metadata?.no_broker_result_created === true,
    `${context} must report no broker result was created.`,
  );
  assert(
    body.metadata?.no_supabase_write === true,
    `${context} must report no Supabase write.`,
  );
  assert(
    body.metadata?.no_trade_mutation === true,
    `${context} must report no trade mutation.`,
  );
  assert(
    body.reviewClick?.metadata?.reviewClickReadbackOnly === true,
    `${context} reviewClick must report reviewClickReadbackOnly.`,
  );
  assert(
    body.reviewClick?.metadata?.noFinalConfirmClick === true,
    `${context} reviewClick must report noFinalConfirmClick.`,
  );
  assert(
    body.reviewClick?.metadata?.noKeyboardSubmit === true,
    `${context} reviewClick must report noKeyboardSubmit.`,
  );
  assert(
    body.reviewClick?.metadata?.noBrokerSubmission === true,
    `${context} reviewClick must report noBrokerSubmission.`,
  );
  assert(
    body.reviewClick?.metadata?.noBrokerResult === true,
    `${context} reviewClick must report noBrokerResult.`,
  );
  assert(
    body.reviewClick?.metadata?.noSupabaseWrite === true,
    `${context} reviewClick must report noSupabaseWrite.`,
  );
}

function assertSafeManualConfirmationWaitResponse(body, context) {
  assertNoBrokerResult(body, context);
  assertNoExecutedDiagnostics(body, context);
  assert(
    body.metadata?.no_browser_actions_executed === true,
    `${context} must report no browser actions executed.`,
  );
  assert(
    body.metadata?.no_avanza_page_touched === true,
    `${context} must report no Avanza page was touched.`,
  );
  assert(
    body.metadata?.no_bekrafta_clicked === true,
    `${context} must report no Bekräfta was clicked.`,
  );
  assert(
    body.metadata?.no_broker_result_created === true,
    `${context} must report no broker result was created.`,
  );
  assert(
    body.metadata?.no_supabase_write === true,
    `${context} must report no Supabase write.`,
  );
  assert(
    body.metadata?.no_trade_mutation === true,
    `${context} must report no trade mutation.`,
  );
  assert(
    body.manualConfirmationWait?.metadata?.manualConfirmationWaitOnly === true,
    `${context} manualConfirmationWait must report manualConfirmationWaitOnly.`,
  );
  assert(
    body.manualConfirmationWait?.metadata?.noFinalConfirmClick === true,
    `${context} manualConfirmationWait must report noFinalConfirmClick.`,
  );
  assert(
    body.manualConfirmationWait?.metadata?.noKeyboardSubmit === true,
    `${context} manualConfirmationWait must report noKeyboardSubmit.`,
  );
  assert(
    body.manualConfirmationWait?.metadata?.noBrokerResult === true,
    `${context} manualConfirmationWait must report noBrokerResult.`,
  );
  assert(
    body.manualConfirmationWait?.metadata?.noSupabaseWrite === true,
    `${context} manualConfirmationWait must report noSupabaseWrite.`,
  );
  assert(
    body.manualConfirmationWait?.metadata?.noTradeMutation === true,
    `${context} manualConfirmationWait must report noTradeMutation.`,
  );
}

function assertSafeBrokerConfirmationCaptureResponse(body, context) {
  assertNoBrokerResult(body, context);
  assertNoExecutedDiagnostics(body, context);
  assert(
    typeof body.executionRecord === "undefined",
    `${context} must not include executionRecord.`,
  );
  assert(
    body.metadata?.no_browser_actions_executed === true,
    `${context} must report no browser actions executed.`,
  );
  assert(
    body.metadata?.no_avanza_page_touched === true,
    `${context} must report no Avanza page was touched.`,
  );
  assert(
    body.metadata?.no_bekrafta_clicked === true,
    `${context} must report no Bekräfta was clicked.`,
  );
  assert(
    body.metadata?.no_broker_execution_result_created === true,
    `${context} must report no BrokerExecutionResult was created.`,
  );
  assert(
    body.metadata?.no_execution_record_created === true,
    `${context} must report no execution record was created.`,
  );
  assert(
    body.metadata?.no_supabase_write === true,
    `${context} must report no Supabase write.`,
  );
  assert(
    body.metadata?.no_trade_mutation === true,
    `${context} must report no trade mutation.`,
  );
  assert(
    body.brokerConfirmationCapture?.metadata
      ?.brokerConfirmationCaptureOnly === true,
    `${context} brokerConfirmationCapture must report brokerConfirmationCaptureOnly.`,
  );
  assert(
    body.brokerConfirmationCapture?.metadata?.noBekraftaByAgent === true,
    `${context} brokerConfirmationCapture must report noBekraftaByAgent.`,
  );
  assert(
    body.brokerConfirmationCapture?.metadata?.noBrokerExecutionResult === true,
    `${context} brokerConfirmationCapture must report noBrokerExecutionResult.`,
  );
  assert(
    body.brokerConfirmationCapture?.metadata?.noExecutionRecord === true,
    `${context} brokerConfirmationCapture must report noExecutionRecord.`,
  );
  assert(
    body.brokerConfirmationCapture?.metadata?.noSupabaseWrite === true,
    `${context} brokerConfirmationCapture must report noSupabaseWrite.`,
  );
  assert(
    body.brokerConfirmationCapture?.metadata?.noTradeMutation === true,
    `${context} brokerConfirmationCapture must report noTradeMutation.`,
  );
  assert(
    body.brokerConfirmationCapture?.metadata?.sanitizedEvidenceOnly === true,
    `${context} brokerConfirmationCapture must report sanitizedEvidenceOnly.`,
  );
}

function assertSafeBrokerExecutionEligibilityResponse(body, context) {
  assertNoBrokerResult(body, context);
  assertNoExecutedDiagnostics(body, context);
  assert(
    typeof body.executionRecord === "undefined",
    `${context} must not include executionRecord.`,
  );
  assert(
    body.metadata?.eligibility_check_only === true,
    `${context} must report eligibility check only.`,
  );
  assert(
    body.metadata?.no_browser_actions_executed === true,
    `${context} must report no browser actions executed.`,
  );
  assert(
    body.metadata?.no_avanza_page_touched === true,
    `${context} must report no Avanza page was touched.`,
  );
  assert(
    body.metadata?.no_broker_execution_result_created === true,
    `${context} must report no BrokerExecutionResult was created.`,
  );
  assert(
    body.metadata?.no_execution_record_created === true,
    `${context} must report no execution record was created.`,
  );
  assert(
    body.metadata?.no_supabase_write === true,
    `${context} must report no Supabase write.`,
  );
  assert(
    body.metadata?.no_trade_mutation === true,
    `${context} must report no trade mutation.`,
  );
  assert(
    body.eligibility?.metadata?.eligibilityCheckOnly === true,
    `${context} eligibility must report eligibilityCheckOnly.`,
  );
  assert(
    body.eligibility?.metadata?.noBrokerExecutionResultCreated === true,
    `${context} eligibility must report noBrokerExecutionResultCreated.`,
  );
  assert(
    body.eligibility?.metadata?.noExecutionRecordCreated === true,
    `${context} eligibility must report noExecutionRecordCreated.`,
  );
  assert(
    body.eligibility?.metadata?.noSupabaseWrite === true,
    `${context} eligibility must report noSupabaseWrite.`,
  );
  assert(
    body.eligibility?.metadata?.noTradeMutation === true,
    `${context} eligibility must report noTradeMutation.`,
  );
}

function assertSafeBrokerExecutionPreviewResponse(body, context) {
  assertNoBrokerResult(body, context);
  assertNoExecutedDiagnostics(body, context);
  assert(
    typeof body.executionRecord === "undefined",
    `${context} must not include executionRecord.`,
  );
  assert(
    body.metadata?.preview_only === true,
    `${context} must report preview_only.`,
  );
  assert(
    body.metadata?.no_browser_actions_executed === true,
    `${context} must report no browser actions executed.`,
  );
  assert(
    body.metadata?.no_avanza_page_touched === true,
    `${context} must report no Avanza page was touched.`,
  );
  assert(
    body.metadata?.no_real_broker_execution_result_created === true,
    `${context} must report no real BrokerExecutionResult was created.`,
  );
  assert(
    body.metadata?.no_execution_record_created === true,
    `${context} must report no execution record was created.`,
  );
  assert(
    body.metadata?.no_supabase_write === true,
    `${context} must report no Supabase write.`,
  );
  assert(
    body.metadata?.no_trade_mutation === true,
    `${context} must report no trade mutation.`,
  );
  assert(
    body.brokerExecutionResultPreview?.metadata?.previewOnly === true,
    `${context} preview must report previewOnly.`,
  );
  assert(
    body.brokerExecutionResultPreview?.metadata?.notBrokerExecutionResult === true,
    `${context} preview must report notBrokerExecutionResult.`,
  );
  assert(
    body.brokerExecutionResultPreview?.metadata?.noExecutionRecord === true,
    `${context} preview must report noExecutionRecord.`,
  );
  assert(
    body.brokerExecutionResultPreview?.metadata?.noSupabaseWrite === true,
    `${context} preview must report noSupabaseWrite.`,
  );
  assert(
    body.brokerExecutionResultPreview?.metadata?.noTradeMutation === true,
    `${context} preview must report noTradeMutation.`,
  );

  if (
    body.brokerExecutionResultPreview?.status !== "preview_available" &&
    typeof body.brokerExecutionResultPreview?.preview !== "undefined"
  ) {
    throw new Error(`${context} must not include preview for blocked statuses.`);
  }

  if (body.brokerExecutionResultPreview?.preview) {
    assert(
      body.brokerExecutionResultPreview.preview.metadata?.previewOnly === true,
      `${context} preview shape must report previewOnly.`,
    );
    assert(
      body.brokerExecutionResultPreview.preview.metadata
        ?.notBrokerExecutionResult === true,
      `${context} preview shape must report notBrokerExecutionResult.`,
    );
  }
}

function assertSafeExecutionRecordEligibilityResponse(body, context) {
  assertNoBrokerResult(body, context);
  assertNoExecutedDiagnostics(body, context);
  assert(
    typeof body.brokerExecutionResult === "undefined",
    `${context} must not include brokerExecutionResult.`,
  );
  assert(
    typeof body.executionRecord === "undefined",
    `${context} must not include executionRecord.`,
  );
  assert(
    body.metadata?.execution_record_eligibility_check_only === true,
    `${context} must report execution record eligibility check only.`,
  );
  assert(
    body.metadata?.no_browser_actions_executed === true,
    `${context} must report no browser actions executed.`,
  );
  assert(
    body.metadata?.no_avanza_page_touched === true,
    `${context} must report no Avanza page was touched.`,
  );
  assert(
    body.metadata?.no_broker_execution_result_created === true,
    `${context} must report no BrokerExecutionResult was created.`,
  );
  assert(
    body.metadata?.no_execution_record_created === true,
    `${context} must report no execution record was created.`,
  );
  assert(
    body.metadata?.no_supabase_write === true,
    `${context} must report no Supabase write.`,
  );
  assert(
    body.metadata?.no_trade_mutation === true,
    `${context} must report no trade mutation.`,
  );
  assert(
    body.executionRecordEligibility?.metadata?.eligibilityOnly === true,
    `${context} eligibility must report eligibilityOnly.`,
  );
  assert(
    body.executionRecordEligibility?.metadata?.noExecutionRecordCreated ===
      true,
    `${context} eligibility must report noExecutionRecordCreated.`,
  );
  assert(
    body.executionRecordEligibility?.metadata?.noSupabaseWrite === true,
    `${context} eligibility must report noSupabaseWrite.`,
  );
  assert(
    body.executionRecordEligibility?.metadata?.noTradeMutation === true,
    `${context} eligibility must report noTradeMutation.`,
  );
}

async function assertOrderPageOpenMode({
  matrixRows,
  mode,
  port,
  baseUrl,
  requestId,
  expectedStatus,
  expectedHttpStatus,
  expectedOk,
  safety,
  payloadOverrides = {},
  riskFlag,
}) {
  const bridge = startBridge({
    port,
    orderPageOpenMode: mode,
  });

  try {
    await waitForHealth(baseUrl);

    const response = await postJson(
      "/order-page-open",
      buildOrderPageOpenPayload({
        requestId,
        ...payloadOverrides,
      }),
      baseUrl,
    );

    assert(
      response.status === expectedHttpStatus,
      `${mode} order-page-open should return HTTP ${expectedHttpStatus}.`,
    );
    assert(
      response.body.ok === expectedOk,
      `${mode} order-page-open ok should be ${expectedOk}.`,
    );
    assert(
      response.body.orderPageOpen?.status === expectedStatus,
      `${mode} order-page-open should report ${expectedStatus}.`,
    );

    if (riskFlag) {
      assert(
        response.body.orderPageOpen?.riskFlags?.includes(riskFlag),
        `${mode} order-page-open should include ${riskFlag} risk.`,
      );
    }

    assertSafeOrderPageOpenResponse(
      response.body,
      `${mode} order-page-open response`,
    );
    recordMatrixRow(
      matrixRows,
      mode,
      "/order-page-open",
      expectedStatus,
      `${response.status}/${response.body.orderPageOpen?.status}`,
      safety,
    );
  } finally {
    await stopBridge(bridge);
  }
}

async function assertAdvancedFormFillMode({
  matrixRows,
  mode,
  port,
  baseUrl,
  requestId,
  expectedStatus,
  expectedHttpStatus,
  expectedOk,
  safety,
  payloadOverrides = {},
  riskFlag,
}) {
  const bridge = startBridge({
    port,
    advancedFormFillMode: mode,
  });

  try {
    await waitForHealth(baseUrl);

    const response = await postJson(
      "/advanced-form-fill",
      buildAdvancedFormFillPayload({
        requestId,
        ...payloadOverrides,
      }),
      baseUrl,
    );

    assert(
      response.status === expectedHttpStatus,
      `${mode} advanced-form-fill should return HTTP ${expectedHttpStatus}.`,
    );
    assert(
      response.body.ok === expectedOk,
      `${mode} advanced-form-fill ok should be ${expectedOk}.`,
    );
    assert(
      response.body.advancedFormFill?.status === expectedStatus,
      `${mode} advanced-form-fill should report ${expectedStatus}.`,
    );

    if (riskFlag) {
      assert(
        response.body.advancedFormFill?.riskFlags?.includes(riskFlag),
        `${mode} advanced-form-fill should include ${riskFlag} risk.`,
      );
    }

    assertSafeAdvancedFormFillResponse(
      response.body,
      `${mode} advanced-form-fill response`,
    );
    recordMatrixRow(
      matrixRows,
      mode,
      "/advanced-form-fill",
      expectedStatus,
      `${response.status}/${response.body.advancedFormFill?.status}`,
      safety,
    );
  } finally {
    await stopBridge(bridge);
  }
}

async function assertReviewClickMode({
  matrixRows,
  mode,
  port,
  baseUrl,
  requestId,
  expectedStatus,
  expectedHttpStatus,
  expectedOk,
  safety,
  payloadOverrides = {},
  riskFlag,
}) {
  const bridge = startBridge({
    port,
    reviewClickMode: mode,
  });

  try {
    await waitForHealth(baseUrl);

    const response = await postJson(
      "/review-click",
      buildReviewClickPayload({
        requestId,
        ...payloadOverrides,
      }),
      baseUrl,
    );

    assert(
      response.status === expectedHttpStatus,
      `${mode} review-click should return HTTP ${expectedHttpStatus}.`,
    );
    assert(
      response.body.ok === expectedOk,
      `${mode} review-click ok should be ${expectedOk}.`,
    );
    assert(
      response.body.reviewClick?.status === expectedStatus,
      `${mode} review-click should report ${expectedStatus}.`,
    );

    if (riskFlag) {
      assert(
        response.body.reviewClick?.riskFlags?.includes(riskFlag),
        `${mode} review-click should include ${riskFlag} risk.`,
      );
    }

    assertSafeReviewClickResponse(
      response.body,
      `${mode} review-click response`,
    );
    recordMatrixRow(
      matrixRows,
      mode,
      "/review-click",
      expectedStatus,
      `${response.status}/${response.body.reviewClick?.status}`,
      safety,
    );
  } finally {
    await stopBridge(bridge);
  }
}

async function assertManualConfirmationWaitMode({
  matrixRows,
  mode,
  port,
  baseUrl,
  requestId,
  expectedStatus,
  expectedHttpStatus,
  expectedOk,
  safety,
  payloadOverrides = {},
  riskFlag,
}) {
  const bridge = startBridge({
    port,
    manualConfirmationWaitMode: mode,
  });

  try {
    await waitForHealth(baseUrl);

    const response = await postJson(
      "/manual-confirmation-wait",
      buildManualConfirmationWaitPayload({
        requestId,
        ...payloadOverrides,
      }),
      baseUrl,
    );

    assert(
      response.status === expectedHttpStatus,
      `${mode} manual-confirmation-wait should return HTTP ${expectedHttpStatus}.`,
    );
    assert(
      response.body.ok === expectedOk,
      `${mode} manual-confirmation-wait ok should be ${expectedOk}.`,
    );
    assert(
      response.body.manualConfirmationWait?.status === expectedStatus,
      `${mode} manual-confirmation-wait should report ${expectedStatus}.`,
    );

    if (riskFlag) {
      assert(
        response.body.manualConfirmationWait?.riskFlags?.includes(riskFlag),
        `${mode} manual-confirmation-wait should include ${riskFlag} risk.`,
      );
    }

    assertSafeManualConfirmationWaitResponse(
      response.body,
      `${mode} manual-confirmation-wait response`,
    );
    recordMatrixRow(
      matrixRows,
      mode,
      "/manual-confirmation-wait",
      expectedStatus,
      `${response.status}/${response.body.manualConfirmationWait?.status}`,
      safety,
    );
  } finally {
    await stopBridge(bridge);
  }
}

async function assertBrokerConfirmationCaptureMode({
  matrixRows,
  mode,
  port,
  baseUrl,
  requestId,
  expectedStatus,
  expectedHttpStatus,
  expectedOk,
  safety,
  payloadOverrides = {},
  riskFlag,
}) {
  const bridge = startBridge({
    port,
    brokerConfirmationCaptureMode: mode,
  });

  try {
    await waitForHealth(baseUrl);

    const response = await postJson(
      "/broker-confirmation-capture",
      buildBrokerConfirmationCapturePayload({
        requestId,
        ...payloadOverrides,
      }),
      baseUrl,
    );

    assert(
      response.status === expectedHttpStatus,
      `${mode} broker-confirmation-capture should return HTTP ${expectedHttpStatus}.`,
    );
    assert(
      response.body.ok === expectedOk,
      `${mode} broker-confirmation-capture ok should be ${expectedOk}.`,
    );
    assert(
      response.body.brokerConfirmationCapture?.status === expectedStatus,
      `${mode} broker-confirmation-capture should report ${expectedStatus}.`,
    );

    if (riskFlag) {
      assert(
        response.body.brokerConfirmationCapture?.riskFlags?.includes(riskFlag),
        `${mode} broker-confirmation-capture should include ${riskFlag} risk.`,
      );
    }

    assertSafeBrokerConfirmationCaptureResponse(
      response.body,
      `${mode} broker-confirmation-capture response`,
    );
    recordMatrixRow(
      matrixRows,
      mode,
      "/broker-confirmation-capture",
      `${expectedHttpStatus}/${expectedStatus}`,
      `${response.status}/${response.body.brokerConfirmationCapture?.status}`,
      safety,
    );
  } finally {
    await stopBridge(bridge);
  }
}

async function assertBrokerExecutionEligibilityMode({
  matrixRows,
  mode,
  port,
  baseUrl,
  requestId,
  expectedStatus,
  expectedHttpStatus,
  expectedOk,
  safety,
  expectedReason,
}) {
  const bridge = startBridge({
    port,
    brokerExecutionResultEligibilityMode: mode,
  });

  try {
    await waitForHealth(baseUrl);

    const response = await postJson(
      "/broker-execution-result-eligibility",
      buildBrokerExecutionEligibilityPayload({ requestId }),
      baseUrl,
    );

    assert(
      response.status === expectedHttpStatus,
      `${mode} broker-execution-result-eligibility should return HTTP ${expectedHttpStatus}.`,
    );
    assert(
      response.body.ok === expectedOk,
      `${mode} broker-execution-result-eligibility ok should be ${expectedOk}.`,
    );
    assert(
      response.body.eligibility?.status === expectedStatus,
      `${mode} broker-execution-result-eligibility should report ${expectedStatus}.`,
    );

    if (expectedReason) {
      assert(
        response.body.eligibility?.reasons?.includes(expectedReason),
        `${mode} broker-execution-result-eligibility should include ${expectedReason}.`,
      );
    }

    assertSafeBrokerExecutionEligibilityResponse(
      response.body,
      `${mode} broker-execution-result-eligibility response`,
    );
    recordMatrixRow(
      matrixRows,
      mode,
      "/broker-execution-result-eligibility",
      `${expectedHttpStatus}/${expectedStatus}`,
      `${response.status}/${response.body.eligibility?.status}`,
      safety,
    );
  } finally {
    await stopBridge(bridge);
  }
}

async function assertBrokerExecutionPreviewMode({
  matrixRows,
  mode,
  port,
  baseUrl,
  requestId,
  expectedStatus,
  expectedHttpStatus,
  expectedOk,
  safety,
  expectedWarning,
}) {
  const bridge = startBridge({
    port,
    brokerExecutionResultPreviewMode: mode,
  });

  try {
    await waitForHealth(baseUrl);

    const response = await postJson(
      "/broker-execution-result-preview",
      buildBrokerExecutionPreviewPayload({ requestId }),
      baseUrl,
    );

    assert(
      response.status === expectedHttpStatus,
      `${mode} broker-execution-result-preview should return HTTP ${expectedHttpStatus}.`,
    );
    assert(
      response.body.ok === expectedOk,
      `${mode} broker-execution-result-preview ok should be ${expectedOk}.`,
    );
    assert(
      response.body.brokerExecutionResultPreview?.status === expectedStatus,
      `${mode} broker-execution-result-preview should report ${expectedStatus}.`,
    );

    if (expectedWarning) {
      assert(
        response.body.brokerExecutionResultPreview?.warnings?.includes(
          expectedWarning,
        ),
        `${mode} broker-execution-result-preview should include ${expectedWarning}.`,
      );
    }

    assertSafeBrokerExecutionPreviewResponse(
      response.body,
      `${mode} broker-execution-result-preview response`,
    );
    recordMatrixRow(
      matrixRows,
      mode,
      "/broker-execution-result-preview",
      `${expectedHttpStatus}/${expectedStatus}`,
      `${response.status}/${response.body.brokerExecutionResultPreview?.status}`,
      safety,
    );
  } finally {
    await stopBridge(bridge);
  }
}

async function assertExecutionRecordEligibilityMode({
  matrixRows,
  mode,
  port,
  baseUrl,
  requestId,
  expectedStatus,
  expectedHttpStatus,
  expectedOk,
  safety,
  expectedReason,
}) {
  const bridge = startBridge({
    port,
    executionRecordEligibilityMode: mode,
  });

  try {
    await waitForHealth(baseUrl);

    const response = await postJson(
      "/execution-record-eligibility",
      buildExecutionRecordEligibilityPayload({ requestId }),
      baseUrl,
    );

    assert(
      response.status === expectedHttpStatus,
      `${mode} execution-record-eligibility should return HTTP ${expectedHttpStatus}.`,
    );
    assert(
      response.body.ok === expectedOk,
      `${mode} execution-record-eligibility ok should be ${expectedOk}.`,
    );
    assert(
      response.body.executionRecordEligibility?.status === expectedStatus,
      `${mode} execution-record-eligibility should report ${expectedStatus}.`,
    );

    if (expectedReason) {
      assert(
        response.body.executionRecordEligibility?.reasons?.includes(
          expectedReason,
        ),
        `${mode} execution-record-eligibility should include ${expectedReason}.`,
      );
    }

    assertSafeExecutionRecordEligibilityResponse(
      response.body,
      `${mode} execution-record-eligibility response`,
    );
    recordMatrixRow(
      matrixRows,
      mode,
      "/execution-record-eligibility",
      `${expectedHttpStatus}/${expectedStatus}`,
      `${response.status}/${response.body.executionRecordEligibility?.status}`,
      safety,
    );
  } finally {
    await stopBridge(bridge);
  }
}

async function runSmoke() {
  const matrixRows = [];
  const defaultBridge = startBridge({ port: PORT });
  let mockOnlyBridge = null;
  let skeletonBridge = null;
  let sessionReadyBridge = null;
  let sessionLoginBridge = null;
  let sessionBlockedBridge = null;
  let searchExactBridge = null;
  let searchAmbiguousBridge = null;
  let searchNoMatchBridge = null;
  let searchBlockedSensitiveBridge = null;
  let searchBlockedOrderFlowBridge = null;
  let instrumentVerifiedBridge = null;
  let instrumentRejectedTickerBridge = null;
  let instrumentAmbiguousCurrencyBridge = null;
  let instrumentBlockedOrderFlowBridge = null;
  let instrumentPageIdentifiedBridge = null;
  let instrumentPageBuySellBridge = null;
  let instrumentPageMismatchBridge = null;
  let instrumentPageBlockedOrderBridge = null;
  let instrumentPageBlockedConfirmBridge = null;
  let instrumentPageBlockedSensitiveBridge = null;

  try {
    const health = await waitForHealth();

    assert(health.version === CONTRACT_VERSION, "Health version mismatch.");
    assert(health.bridgeStatus === "available", "Health status mismatch.");
    assert(
      health.capabilities?.supportsRealBrokerAutomation === false,
      "Health must report no real broker automation.",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/health",
      "available",
      `${health.bridgeStatus}`,
      "no real broker automation",
    );

    const selfCheck = await getJson("/self-check");

    assert(
      selfCheck.status === 200,
      "Self-check should return HTTP 200.",
    );
    assert(
      selfCheck.body.ok === true,
      "Self-check response should be contract-ok when the bridge answers.",
    );
    assert(
      selfCheck.body.selfCheck?.ok === false,
      "Default self-check should report no Avanza dry-run runner readiness.",
    );
    assert(
      selfCheck.body.selfCheck?.status === "unavailable",
      "Default self-check should report unavailable runner status.",
    );
    assert(
      selfCheck.body.selfCheck?.capabilityValidation?.canRunAvanzaDryRun ===
        false,
      "Default self-check must not report Avanza dry-run capability.",
    );
    assert(
      selfCheck.body.selfCheck?.capabilityValidation?.canSubmitBrokerOrder ===
        false,
      "Default self-check must not report broker submission capability.",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/self-check",
      "unavailable",
      `${selfCheck.status}/${selfCheck.body.selfCheck?.status}`,
      "no Avanza dry-run capability; no broker submission",
    );

    const defaultSessionDetection = await getJson("/session-detection");

    assert(
      defaultSessionDetection.status === 200,
      "Default session detection should return HTTP 200.",
    );
    assert(
      defaultSessionDetection.body.ok === false,
      "Default session detection should not report ready.",
    );
    assert(
      defaultSessionDetection.body.sessionDetection?.status === "unavailable",
      "Default session detection should report unavailable.",
    );
    assert(
      defaultSessionDetection.body.warnings?.some((warning) =>
        warning.includes("No browser actions were executed"),
      ),
      "Default session detection should warn that no browser actions ran.",
    );
    assert(
      defaultSessionDetection.body.warnings?.some((warning) =>
        warning.includes("No Avanza page was touched"),
      ),
      "Default session detection should warn that no Avanza page was touched.",
    );
    assertSafeSessionDetectionResponse(
      defaultSessionDetection.body,
      "Default session-detection response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/session-detection",
      "unavailable",
      `${defaultSessionDetection.status}/${defaultSessionDetection.body.sessionDetection?.status}`,
      "stub only; no browser actions; no Avanza page touched",
    );

    const defaultSearchOnly = await postJson(
      "/search-only",
      buildSearchOnlyPayload(),
    );

    assert(
      defaultSearchOnly.status === 501,
      "Default search-only should return HTTP 501 while search runner is not implemented.",
    );
    assert(
      defaultSearchOnly.body.ok === false,
      "Default search-only should not report exact-match readiness.",
    );
    assert(
      defaultSearchOnly.body.searchOnly?.status === "search_not_available",
      "Default search-only should report search_not_available.",
    );
    assert(
      defaultSearchOnly.body.warnings?.some((warning) =>
        warning.includes("No browser actions were executed"),
      ),
      "Default search-only should warn that no browser actions ran.",
    );
    assert(
      defaultSearchOnly.body.warnings?.some((warning) =>
        warning.includes("No Avanza page was touched"),
      ),
      "Default search-only should warn that no Avanza page was touched.",
    );
    assert(
      defaultSearchOnly.body.warnings?.some((warning) =>
        warning.includes("No order page was opened"),
      ),
      "Default search-only should warn that no order page was opened.",
    );
    assertSafeSearchOnlyResponse(
      defaultSearchOnly.body,
      "Default search-only response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/search-only",
      "search_not_available",
      `${defaultSearchOnly.status}/${defaultSearchOnly.body.searchOnly?.status}`,
      "stub only; no browser actions; no Avanza page touched; no order page",
    );

    const defaultInstrumentVerification = await postJson(
      "/instrument-verification",
      buildInstrumentVerificationPayload(),
    );

    assert(
      defaultInstrumentVerification.status === 501,
      "Default instrument verification should return HTTP 501 while verification runner is not implemented.",
    );
    assert(
      defaultInstrumentVerification.body.ok === false,
      "Default instrument verification should not report verified readiness.",
    );
    assert(
      defaultInstrumentVerification.body.instrumentVerification?.status ===
        "unavailable",
      "Default instrument verification should report unavailable.",
    );
    assert(
      defaultInstrumentVerification.body.warnings?.some((warning) =>
        warning.includes("No browser actions were executed"),
      ),
      "Default instrument verification should warn that no browser actions ran.",
    );
    assert(
      defaultInstrumentVerification.body.warnings?.some((warning) =>
        warning.includes("No Avanza page was touched"),
      ),
      "Default instrument verification should warn that no Avanza page was touched.",
    );
    assert(
      defaultInstrumentVerification.body.warnings?.some((warning) =>
        warning.includes("No order page was opened"),
      ),
      "Default instrument verification should warn that no order page was opened.",
    );
    assertSafeInstrumentVerificationResponse(
      defaultInstrumentVerification.body,
      "Default instrument verification response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/instrument-verification",
      "unavailable",
      `${defaultInstrumentVerification.status}/${defaultInstrumentVerification.body.instrumentVerification?.status}`,
      "stub only; no browser actions; no Avanza page touched; no order page",
    );

    const defaultInstrumentPage = await postJson(
      "/instrument-page",
      buildInstrumentPagePayload(),
    );

    assert(
      defaultInstrumentPage.status === 501,
      "Default instrument page should return HTTP 501 while page runner is not implemented.",
    );
    assert(
      defaultInstrumentPage.body.ok === false,
      "Default instrument page should not report identified readiness.",
    );
    assert(
      defaultInstrumentPage.body.instrumentPage?.status === "unavailable",
      "Default instrument page should report unavailable.",
    );
    assert(
      defaultInstrumentPage.body.warnings?.some((warning) =>
        warning.includes("No browser actions were executed"),
      ),
      "Default instrument page should warn that no browser actions ran.",
    );
    assert(
      defaultInstrumentPage.body.warnings?.some((warning) =>
        warning.includes("No Avanza page was touched"),
      ),
      "Default instrument page should warn that no Avanza page was touched.",
    );
    assert(
      defaultInstrumentPage.body.warnings?.some((warning) =>
        warning.includes("No order page was opened"),
      ),
      "Default instrument page should warn that no order page was opened.",
    );
    assertSafeInstrumentPageResponse(
      defaultInstrumentPage.body,
      "Default instrument page response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/instrument-page",
      "unavailable",
      `${defaultInstrumentPage.status}/${defaultInstrumentPage.body.instrumentPage?.status}`,
      "stub only; no browser actions; no Avanza page touched; no order page",
    );

    const dryRun = await postJson("/dry-run", buildDryRunPayload());

    assert(
      dryRun.status === 501,
      "Valid dry-run contract request should return HTTP 501 while runner is not implemented.",
    );
    assert(
      dryRun.body.status === "not_implemented",
      "Valid dry-run contract request should report not_implemented.",
    );
    assert(
      dryRun.body.ok === false,
      "Dry-run contract stub should not report executable success.",
    );
    assert(
      dryRun.body.dryRunRequestValidation?.ok === true,
      "Dry-run order input should validate.",
    );
    assert(
      dryRun.body.capabilityValidation?.canRunAvanzaDryRun === true,
      "Dry-run capability should validate as dry_run_only when explicitly allowed.",
    );
    assert(
      dryRun.body.selfCheck?.status === "unavailable",
      "Dry-run endpoint should still report no runner availability.",
    );
    assert(
      dryRun.body.diagnostics === null ||
        typeof dryRun.body.diagnostics === "undefined",
      "Dry-run endpoint must not return executed diagnostics.",
    );
    assert(
      typeof dryRun.body.brokerResult === "undefined",
      "Dry-run endpoint must not include brokerResult.",
    );
    assert(
      dryRun.body.warnings?.some((warning) =>
        warning.includes("No browser actions were executed"),
      ),
      "Dry-run endpoint should warn that no browser actions were executed.",
    );
    assert(
      dryRun.body.warnings?.some((warning) =>
        warning.includes("No broker submission was performed"),
      ),
      "Dry-run endpoint should warn that no broker submission was performed.",
    );
    assertNoBrokerResult(dryRun.body, "Default dry-run response");
    assertNoExecutedDiagnostics(dryRun.body, "Default dry-run response");
    recordMatrixRow(
      matrixRows,
      "default",
      "/dry-run valid",
      "not_implemented",
      `${dryRun.status}/${dryRun.body.status}`,
      "no brokerResult; no executed diagnostics; no browser actions",
    );

    const unsafeDryRun = await postJson(
      "/dry-run",
      createUnsafeDryRunPayload(),
    );

    assert(
      unsafeDryRun.status === 400,
      "Unsafe dry-run request should return HTTP 400.",
    );
    assert(
      unsafeDryRun.body.status === "blocked",
      "Unsafe dry-run request should be blocked.",
    );
    assert(
      Array.isArray(unsafeDryRun.body.errors) &&
        unsafeDryRun.body.errors.length > 0,
      "Unsafe dry-run request should include errors.",
    );
    assert(
      unsafeDryRun.body.capabilityValidation?.canSubmitBrokerOrder === false,
      "Unsafe dry-run response must not allow broker submission.",
    );
    assert(
      typeof unsafeDryRun.body.brokerResult === "undefined",
      "Unsafe dry-run response must not include brokerResult.",
    );
    assertNoExecutedDiagnostics(unsafeDryRun.body, "Unsafe dry-run response");
    recordMatrixRow(
      matrixRows,
      "default",
      "/dry-run unsafe",
      "blocked",
      `${unsafeDryRun.status}/${unsafeDryRun.body.status}`,
      "broker submission/final confirm metadata blocked; no brokerResult",
    );

    const missingDryRunInput = await postJson(
      "/dry-run",
      buildDryRunPayload({
        requestId: "avanza_dry_run_bridge_smoke_missing_input_001",
        dryRunOrderInput: undefined,
      }),
    );

    assert(
      missingDryRunInput.status === 400,
      "Missing dryRunOrderInput should return HTTP 400.",
    );
    assert(
      missingDryRunInput.body.status === "blocked",
      "Missing dryRunOrderInput should be blocked.",
    );
    assertNoBrokerResult(
      missingDryRunInput.body,
      "Missing dryRunOrderInput response",
    );
    assertNoExecutedDiagnostics(
      missingDryRunInput.body,
      "Missing dryRunOrderInput response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/dry-run missing input",
      "blocked",
      `${missingDryRunInput.status}/${missingDryRunInput.body.status}`,
      "malformed contract blocked; no brokerResult; no executed diagnostics",
    );

    const malformedDryRun = await postRawJson(
      "/dry-run",
      "{not-valid-json",
    );

    assert(
      malformedDryRun.status === 400,
      "Malformed dry-run JSON should return HTTP 400.",
    );
    assert(
      malformedDryRun.body.status === "blocked",
      "Malformed dry-run JSON should be blocked.",
    );
    assertNoBrokerResult(malformedDryRun.body, "Malformed dry-run response");
    assertNoExecutedDiagnostics(
      malformedDryRun.body,
      "Malformed dry-run response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/dry-run invalid JSON",
      "blocked",
      `${malformedDryRun.status}/${malformedDryRun.body.status}`,
      "server survived parse failure; no browser actions; no brokerResult",
    );

    const missingSearchExpected = await postJson(
      "/search-only",
      buildSearchOnlyPayload({
        requestId: "avanza_search_only_bridge_smoke_missing_expected_001",
        expectedInstrument: undefined,
      }),
    );

    assert(
      missingSearchExpected.status === 400,
      "Missing search-only expectedInstrument should return HTTP 400.",
    );
    assert(
      missingSearchExpected.body.searchOnly?.status === "failed",
      "Missing search-only expectedInstrument should fail safely.",
    );
    assertSafeSearchOnlyResponse(
      missingSearchExpected.body,
      "Missing search-only expectedInstrument response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/search-only missing input",
      "failed",
      `${missingSearchExpected.status}/${missingSearchExpected.body.searchOnly?.status}`,
      "malformed contract blocked; no browser actions; no brokerResult",
    );

    const malformedSearchOnly = await postRawJson(
      "/search-only",
      "{not-valid-json",
    );

    assert(
      malformedSearchOnly.status === 400,
      "Malformed search-only JSON should return HTTP 400.",
    );
    assert(
      malformedSearchOnly.body.searchOnly?.status === "failed",
      "Malformed search-only JSON should fail safely.",
    );
    assertSafeSearchOnlyResponse(
      malformedSearchOnly.body,
      "Malformed search-only response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/search-only invalid JSON",
      "failed",
      `${malformedSearchOnly.status}/${malformedSearchOnly.body.searchOnly?.status}`,
      "server survived parse failure; no browser actions; no brokerResult",
    );

    const missingInstrumentExpected = await postJson(
      "/instrument-verification",
      buildInstrumentVerificationPayload({
        requestId:
          "avanza_instrument_verification_bridge_smoke_missing_expected_001",
        expectedInstrument: undefined,
      }),
    );

    assert(
      missingInstrumentExpected.status === 400,
      "Missing instrument verification expectedInstrument should return HTTP 400.",
    );
    assert(
      missingInstrumentExpected.body.instrumentVerification?.status === "failed",
      "Missing instrument verification expectedInstrument should fail safely.",
    );
    assertSafeInstrumentVerificationResponse(
      missingInstrumentExpected.body,
      "Missing instrument verification expectedInstrument response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/instrument-verification missing input",
      "failed",
      `${missingInstrumentExpected.status}/${missingInstrumentExpected.body.instrumentVerification?.status}`,
      "malformed contract blocked; no browser actions; no brokerResult",
    );

    const malformedInstrumentVerification = await postRawJson(
      "/instrument-verification",
      "{not-valid-json",
    );

    assert(
      malformedInstrumentVerification.status === 400,
      "Malformed instrument verification JSON should return HTTP 400.",
    );
    assert(
      malformedInstrumentVerification.body.instrumentVerification?.status ===
        "failed",
      "Malformed instrument verification JSON should fail safely.",
    );
    assertSafeInstrumentVerificationResponse(
      malformedInstrumentVerification.body,
      "Malformed instrument verification response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/instrument-verification invalid JSON",
      "failed",
      `${malformedInstrumentVerification.status}/${malformedInstrumentVerification.body.instrumentVerification?.status}`,
      "server survived parse failure; no browser actions; no brokerResult",
    );

    const missingInstrumentPageExpected = await postJson(
      "/instrument-page",
      buildInstrumentPagePayload({
        requestId: "avanza_instrument_page_bridge_smoke_missing_expected_001",
        expectedInstrument: undefined,
      }),
    );

    assert(
      missingInstrumentPageExpected.status === 400,
      "Missing instrument page expectedInstrument should return HTTP 400.",
    );
    assert(
      missingInstrumentPageExpected.body.instrumentPage?.status === "failed",
      "Missing instrument page expectedInstrument should fail safely.",
    );
    assertSafeInstrumentPageResponse(
      missingInstrumentPageExpected.body,
      "Missing instrument page expectedInstrument response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/instrument-page missing input",
      "failed",
      `${missingInstrumentPageExpected.status}/${missingInstrumentPageExpected.body.instrumentPage?.status}`,
      "malformed contract blocked; no browser actions; no brokerResult",
    );

    const malformedInstrumentPage = await postRawJson(
      "/instrument-page",
      "{not-valid-json",
    );

    assert(
      malformedInstrumentPage.status === 400,
      "Malformed instrument page JSON should return HTTP 400.",
    );
    assert(
      malformedInstrumentPage.body.instrumentPage?.status === "failed",
      "Malformed instrument page JSON should fail safely.",
    );
    assertSafeInstrumentPageResponse(
      malformedInstrumentPage.body,
      "Malformed instrument page response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/instrument-page invalid JSON",
      "failed",
      `${malformedInstrumentPage.status}/${malformedInstrumentPage.body.instrumentPage?.status}`,
      "server survived parse failure; no browser actions; no brokerResult",
    );

    const defaultOrderPageOpen = await postJson(
      "/order-page-open",
      buildOrderPageOpenPayload(),
    );

    assert(
      defaultOrderPageOpen.status === 501,
      "Default order-page-open should return HTTP 501 while runner is not implemented.",
    );
    assert(
      defaultOrderPageOpen.body.ok === false,
      "Default order-page-open should not report opened readiness.",
    );
    assert(
      defaultOrderPageOpen.body.orderPageOpen?.status === "unavailable",
      "Default order-page-open should report unavailable.",
    );
    assertSafeOrderPageOpenResponse(
      defaultOrderPageOpen.body,
      "Default order-page-open response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/order-page-open",
      "unavailable",
      `${defaultOrderPageOpen.status}/${defaultOrderPageOpen.body.orderPageOpen?.status}`,
      "stub only; no browser actions; no Avanza page touched; no form fill",
    );

    const missingOrderPageDryRunInput = await postJson(
      "/order-page-open",
      buildOrderPageOpenPayload({
        requestId: "avanza_order_page_open_bridge_smoke_missing_input_001",
        dryRunOrderInput: undefined,
      }),
    );

    assert(
      missingOrderPageDryRunInput.status === 400,
      "Missing order-page-open dryRunOrderInput should return HTTP 400.",
    );
    assert(
      missingOrderPageDryRunInput.body.orderPageOpen?.status === "failed",
      "Missing order-page-open dryRunOrderInput should fail safely.",
    );
    assertSafeOrderPageOpenResponse(
      missingOrderPageDryRunInput.body,
      "Missing order-page-open dryRunOrderInput response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/order-page-open missing input",
      "failed",
      `${missingOrderPageDryRunInput.status}/${missingOrderPageDryRunInput.body.orderPageOpen?.status}`,
      "malformed contract blocked; no browser actions; no brokerResult",
    );

    const malformedOrderPageOpen = await postRawJson(
      "/order-page-open",
      "{not-valid-json",
    );

    assert(
      malformedOrderPageOpen.status === 400,
      "Malformed order-page-open JSON should return HTTP 400.",
    );
    assert(
      malformedOrderPageOpen.body.orderPageOpen?.status === "failed",
      "Malformed order-page-open JSON should fail safely.",
    );
    assertSafeOrderPageOpenResponse(
      malformedOrderPageOpen.body,
      "Malformed order-page-open response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/order-page-open invalid JSON",
      "failed",
      `${malformedOrderPageOpen.status}/${malformedOrderPageOpen.body.orderPageOpen?.status}`,
      "server survived parse failure; no browser actions; no brokerResult",
    );

    const defaultAdvancedFormFill = await postJson(
      "/advanced-form-fill",
      buildAdvancedFormFillPayload(),
    );

    assert(
      defaultAdvancedFormFill.status === 501,
      "Default advanced-form-fill should return HTTP 501 while runner is not implemented.",
    );
    assert(
      defaultAdvancedFormFill.body.ok === false,
      "Default advanced-form-fill should not report filled readiness.",
    );
    assert(
      defaultAdvancedFormFill.body.advancedFormFill?.status === "unavailable",
      "Default advanced-form-fill should report unavailable.",
    );
    assertSafeAdvancedFormFillResponse(
      defaultAdvancedFormFill.body,
      "Default advanced-form-fill response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/advanced-form-fill",
      "unavailable",
      `${defaultAdvancedFormFill.status}/${defaultAdvancedFormFill.body.advancedFormFill?.status}`,
      "stub only; no browser actions; no Avanza page touched; no real form fill",
    );

    const missingAdvancedFormDryRunInput = await postJson(
      "/advanced-form-fill",
      buildAdvancedFormFillPayload({
        requestId: "avanza_advanced_form_fill_bridge_smoke_missing_input_001",
        dryRunOrderInput: undefined,
      }),
    );

    assert(
      missingAdvancedFormDryRunInput.status === 400,
      "Missing advanced-form-fill dryRunOrderInput should return HTTP 400.",
    );
    assert(
      missingAdvancedFormDryRunInput.body.advancedFormFill?.status === "failed",
      "Missing advanced-form-fill dryRunOrderInput should fail safely.",
    );
    assertSafeAdvancedFormFillResponse(
      missingAdvancedFormDryRunInput.body,
      "Missing advanced-form-fill dryRunOrderInput response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/advanced-form-fill missing input",
      "failed",
      `${missingAdvancedFormDryRunInput.status}/${missingAdvancedFormDryRunInput.body.advancedFormFill?.status}`,
      "malformed contract blocked; no browser actions; no brokerResult",
    );

    const malformedAdvancedFormFill = await postRawJson(
      "/advanced-form-fill",
      "{not-valid-json",
    );

    assert(
      malformedAdvancedFormFill.status === 400,
      "Malformed advanced-form-fill JSON should return HTTP 400.",
    );
    assert(
      malformedAdvancedFormFill.body.advancedFormFill?.status === "failed",
      "Malformed advanced-form-fill JSON should fail safely.",
    );
    assertSafeAdvancedFormFillResponse(
      malformedAdvancedFormFill.body,
      "Malformed advanced-form-fill response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/advanced-form-fill invalid JSON",
      "failed",
      `${malformedAdvancedFormFill.status}/${malformedAdvancedFormFill.body.advancedFormFill?.status}`,
      "server survived parse failure; no browser actions; no brokerResult",
    );

    const defaultReviewClick = await postJson(
      "/review-click",
      buildReviewClickPayload(),
    );

    assert(
      defaultReviewClick.status === 501,
      "Default review-click should return HTTP 501 while runner is not implemented.",
    );
    assert(
      defaultReviewClick.body.ok === false,
      "Default review-click should not report confirmation readiness.",
    );
    assert(
      defaultReviewClick.body.reviewClick?.status === "unavailable",
      "Default review-click should report unavailable.",
    );
    assertSafeReviewClickResponse(
      defaultReviewClick.body,
      "Default review-click response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/review-click",
      "unavailable",
      `${defaultReviewClick.status}/${defaultReviewClick.body.reviewClick?.status}`,
      "stub only; no browser actions; no Avanza page touched; no real Granska",
    );

    const missingReviewClickDryRunInput = await postJson(
      "/review-click",
      buildReviewClickPayload({
        requestId: "avanza_review_click_bridge_smoke_missing_input_001",
        dryRunOrderInput: undefined,
      }),
    );

    assert(
      missingReviewClickDryRunInput.status === 400,
      "Missing review-click dryRunOrderInput should return HTTP 400.",
    );
    assert(
      missingReviewClickDryRunInput.body.reviewClick?.status === "failed",
      "Missing review-click dryRunOrderInput should fail safely.",
    );
    assertSafeReviewClickResponse(
      missingReviewClickDryRunInput.body,
      "Missing review-click dryRunOrderInput response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/review-click missing input",
      "failed",
      `${missingReviewClickDryRunInput.status}/${missingReviewClickDryRunInput.body.reviewClick?.status}`,
      "malformed contract blocked; no browser actions; no brokerResult",
    );

    const malformedReviewClick = await postRawJson(
      "/review-click",
      "{not-valid-json",
    );

    assert(
      malformedReviewClick.status === 400,
      "Malformed review-click JSON should return HTTP 400.",
    );
    assert(
      malformedReviewClick.body.reviewClick?.status === "failed",
      "Malformed review-click JSON should fail safely.",
    );
    assertSafeReviewClickResponse(
      malformedReviewClick.body,
      "Malformed review-click response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/review-click invalid JSON",
      "failed",
      `${malformedReviewClick.status}/${malformedReviewClick.body.reviewClick?.status}`,
      "server survived parse failure; no browser actions; no brokerResult",
    );

    const defaultManualConfirmationWait = await postJson(
      "/manual-confirmation-wait",
      buildManualConfirmationWaitPayload(),
    );

    assert(
      defaultManualConfirmationWait.status === 501,
      "Default manual-confirmation-wait should return HTTP 501 while runner is not implemented.",
    );
    assert(
      defaultManualConfirmationWait.body.ok === false,
      "Default manual-confirmation-wait should not report waiting readiness.",
    );
    assert(
      defaultManualConfirmationWait.body.manualConfirmationWait?.status ===
        "unavailable",
      "Default manual-confirmation-wait should report unavailable.",
    );
    assertSafeManualConfirmationWaitResponse(
      defaultManualConfirmationWait.body,
      "Default manual-confirmation-wait response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/manual-confirmation-wait",
      "unavailable",
      `${defaultManualConfirmationWait.status}/${defaultManualConfirmationWait.body.manualConfirmationWait?.status}`,
      "stub only; no browser actions; no Avanza page touched; no Bekräfta",
    );

    const missingManualConfirmationWaitRequestId = await postJson(
      "/manual-confirmation-wait",
      buildManualConfirmationWaitPayload({
        requestId: "",
      }),
    );

    assert(
      missingManualConfirmationWaitRequestId.status === 400,
      "Missing manual-confirmation-wait requestId should return HTTP 400.",
    );
    assert(
      missingManualConfirmationWaitRequestId.body.manualConfirmationWait
        ?.status === "failed",
      "Missing manual-confirmation-wait requestId should fail safely.",
    );
    assertSafeManualConfirmationWaitResponse(
      missingManualConfirmationWaitRequestId.body,
      "Missing manual-confirmation-wait requestId response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/manual-confirmation-wait missing requestId",
      "failed",
      `${missingManualConfirmationWaitRequestId.status}/${missingManualConfirmationWaitRequestId.body.manualConfirmationWait?.status}`,
      "malformed contract blocked; no browser actions; no brokerResult",
    );

    const malformedManualConfirmationWait = await postRawJson(
      "/manual-confirmation-wait",
      "{not-valid-json",
    );

    assert(
      malformedManualConfirmationWait.status === 400,
      "Malformed manual-confirmation-wait JSON should return HTTP 400.",
    );
    assert(
      malformedManualConfirmationWait.body.manualConfirmationWait?.status ===
        "failed",
      "Malformed manual-confirmation-wait JSON should fail safely.",
    );
    assertSafeManualConfirmationWaitResponse(
      malformedManualConfirmationWait.body,
      "Malformed manual-confirmation-wait response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/manual-confirmation-wait invalid JSON",
      "failed",
      `${malformedManualConfirmationWait.status}/${malformedManualConfirmationWait.body.manualConfirmationWait?.status}`,
      "server survived parse failure; no browser actions; no brokerResult",
    );

    const defaultBrokerConfirmationCapture = await postJson(
      "/broker-confirmation-capture",
      buildBrokerConfirmationCapturePayload(),
    );

    assert(
      defaultBrokerConfirmationCapture.status === 501,
      "Default broker-confirmation-capture should return HTTP 501 while runner is not implemented.",
    );
    assert(
      defaultBrokerConfirmationCapture.body.ok === false,
      "Default broker-confirmation-capture should not report captured readiness.",
    );
    assert(
      defaultBrokerConfirmationCapture.body.brokerConfirmationCapture?.status ===
        "unavailable",
      "Default broker-confirmation-capture should report unavailable.",
    );
    assertSafeBrokerConfirmationCaptureResponse(
      defaultBrokerConfirmationCapture.body,
      "Default broker-confirmation-capture response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/broker-confirmation-capture",
      "unavailable",
      `${defaultBrokerConfirmationCapture.status}/${defaultBrokerConfirmationCapture.body.brokerConfirmationCapture?.status}`,
      "stub only; no browser actions; no Avanza page touched; no BrokerExecutionResult",
    );

    const missingBrokerConfirmationCaptureDryRunInput = await postJson(
      "/broker-confirmation-capture",
      buildBrokerConfirmationCapturePayload({
        requestId:
          "avanza_broker_confirmation_capture_bridge_smoke_missing_input_001",
        dryRunOrderInput: undefined,
      }),
    );

    assert(
      missingBrokerConfirmationCaptureDryRunInput.status === 400,
      "Missing broker-confirmation-capture dryRunOrderInput should return HTTP 400.",
    );
    assert(
      missingBrokerConfirmationCaptureDryRunInput.body.brokerConfirmationCapture
        ?.status === "failed",
      "Missing broker-confirmation-capture dryRunOrderInput should fail safely.",
    );
    assertSafeBrokerConfirmationCaptureResponse(
      missingBrokerConfirmationCaptureDryRunInput.body,
      "Missing broker-confirmation-capture dryRunOrderInput response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/broker-confirmation-capture missing input",
      "failed",
      `${missingBrokerConfirmationCaptureDryRunInput.status}/${missingBrokerConfirmationCaptureDryRunInput.body.brokerConfirmationCapture?.status}`,
      "malformed contract blocked; no browser actions; no brokerResult",
    );

    const malformedBrokerConfirmationCapture = await postRawJson(
      "/broker-confirmation-capture",
      "{not-valid-json",
    );

    assert(
      malformedBrokerConfirmationCapture.status === 400,
      "Malformed broker-confirmation-capture JSON should return HTTP 400.",
    );
    assert(
      malformedBrokerConfirmationCapture.body.brokerConfirmationCapture
        ?.status === "failed",
      "Malformed broker-confirmation-capture JSON should fail safely.",
    );
    assertSafeBrokerConfirmationCaptureResponse(
      malformedBrokerConfirmationCapture.body,
      "Malformed broker-confirmation-capture response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/broker-confirmation-capture invalid JSON",
      "failed",
      `${malformedBrokerConfirmationCapture.status}/${malformedBrokerConfirmationCapture.body.brokerConfirmationCapture?.status}`,
      "server survived parse failure; no browser actions; no brokerResult",
    );

    const defaultBrokerExecutionEligibility = await postJson(
      "/broker-execution-result-eligibility",
      buildBrokerExecutionEligibilityPayload(),
    );

    assert(
      defaultBrokerExecutionEligibility.status === 501,
      "Default broker-execution-result-eligibility should return HTTP 501 while conversion is not implemented.",
    );
    assert(
      defaultBrokerExecutionEligibility.body.ok === false,
      "Default broker-execution-result-eligibility should not report eligible.",
    );
    assert(
      defaultBrokerExecutionEligibility.body.eligibility?.status ===
        "not_eligible",
      "Default broker-execution-result-eligibility should report not_eligible.",
    );
    assertSafeBrokerExecutionEligibilityResponse(
      defaultBrokerExecutionEligibility.body,
      "Default broker-execution-result-eligibility response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/broker-execution-result-eligibility",
      "not_eligible",
      `${defaultBrokerExecutionEligibility.status}/${defaultBrokerExecutionEligibility.body.eligibility?.status}`,
      "eligibility check only; no BrokerExecutionResult; no execution record",
    );

    const malformedBrokerExecutionEligibility = await postRawJson(
      "/broker-execution-result-eligibility",
      "{not-valid-json",
    );

    assert(
      malformedBrokerExecutionEligibility.status === 400,
      "Malformed broker-execution-result-eligibility JSON should return HTTP 400.",
    );
    assert(
      malformedBrokerExecutionEligibility.body.eligibility?.status ===
        "failed",
      "Malformed broker-execution-result-eligibility JSON should fail safely.",
    );
    assertSafeBrokerExecutionEligibilityResponse(
      malformedBrokerExecutionEligibility.body,
      "Malformed broker-execution-result-eligibility response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/broker-execution-result-eligibility invalid JSON",
      "failed",
      `${malformedBrokerExecutionEligibility.status}/${malformedBrokerExecutionEligibility.body.eligibility?.status}`,
      "server survived parse failure; no BrokerExecutionResult; no execution record",
    );

    const defaultExecutionRecordEligibility = await postJson(
      "/execution-record-eligibility",
      buildExecutionRecordEligibilityPayload(),
    );

    assert(
      defaultExecutionRecordEligibility.status === 501,
      "Default execution-record-eligibility should return HTTP 501 while record creation is not implemented.",
    );
    assert(
      defaultExecutionRecordEligibility.body.ok === false,
      "Default execution-record-eligibility should not report eligible.",
    );
    assert(
      defaultExecutionRecordEligibility.body.executionRecordEligibility
        ?.status === "not_eligible",
      "Default execution-record-eligibility should report not_eligible.",
    );
    assertSafeExecutionRecordEligibilityResponse(
      defaultExecutionRecordEligibility.body,
      "Default execution-record-eligibility response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/execution-record-eligibility",
      "not_eligible",
      `${defaultExecutionRecordEligibility.status}/${defaultExecutionRecordEligibility.body.executionRecordEligibility?.status}`,
      "eligibility check only; no BrokerExecutionResult; no execution record; no Supabase write",
    );

    const malformedExecutionRecordEligibility = await postRawJson(
      "/execution-record-eligibility",
      "{not-valid-json",
    );

    assert(
      malformedExecutionRecordEligibility.status === 400,
      "Malformed execution-record-eligibility JSON should return HTTP 400.",
    );
    assert(
      malformedExecutionRecordEligibility.body.executionRecordEligibility
        ?.status === "failed",
      "Malformed execution-record-eligibility JSON should fail safely.",
    );
    assertSafeExecutionRecordEligibilityResponse(
      malformedExecutionRecordEligibility.body,
      "Malformed execution-record-eligibility response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/execution-record-eligibility invalid JSON",
      "failed",
      `${malformedExecutionRecordEligibility.status}/${malformedExecutionRecordEligibility.body.executionRecordEligibility?.status}`,
      "server survived parse failure; no BrokerExecutionResult; no execution record",
    );

    const defaultBrokerExecutionPreview = await postJson(
      "/broker-execution-result-preview",
      buildBrokerExecutionPreviewPayload(),
    );

    assert(
      defaultBrokerExecutionPreview.status === 501,
      "Default broker-execution-result-preview should return HTTP 501 while conversion preview is unavailable.",
    );
    assert(
      defaultBrokerExecutionPreview.body.ok === false,
      "Default broker-execution-result-preview should not report preview available.",
    );
    assert(
      defaultBrokerExecutionPreview.body.brokerExecutionResultPreview?.status ===
        "not_eligible",
      "Default broker-execution-result-preview should report not_eligible.",
    );
    assertSafeBrokerExecutionPreviewResponse(
      defaultBrokerExecutionPreview.body,
      "Default broker-execution-result-preview response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/broker-execution-result-preview",
      "not_eligible",
      `${defaultBrokerExecutionPreview.status}/${defaultBrokerExecutionPreview.body.brokerExecutionResultPreview?.status}`,
      "preview only; no real BrokerExecutionResult; no execution record",
    );

    const malformedBrokerExecutionPreview = await postRawJson(
      "/broker-execution-result-preview",
      "{not-valid-json",
    );

    assert(
      malformedBrokerExecutionPreview.status === 400,
      "Malformed broker-execution-result-preview JSON should return HTTP 400.",
    );
    assert(
      malformedBrokerExecutionPreview.body.brokerExecutionResultPreview
        ?.status === "failed",
      "Malformed broker-execution-result-preview JSON should fail safely.",
    );
    assertSafeBrokerExecutionPreviewResponse(
      malformedBrokerExecutionPreview.body,
      "Malformed broker-execution-result-preview response",
    );
    recordMatrixRow(
      matrixRows,
      "default",
      "/broker-execution-result-preview invalid JSON",
      "failed",
      `${malformedBrokerExecutionPreview.status}/${malformedBrokerExecutionPreview.body.brokerExecutionResultPreview?.status}`,
      "server survived parse failure; no real BrokerExecutionResult; no execution record",
    );

    mockOnlyBridge = startBridge({
      port: MOCK_ONLY_PORT,
      selfCheckMode: "mock_only",
    });
    await waitForHealth(MOCK_ONLY_BASE_URL);

    const mockOnlySelfCheck = await getJson("/self-check", MOCK_ONLY_BASE_URL);

    assert(
      mockOnlySelfCheck.status === 200,
      "Mock-only self-check should return HTTP 200.",
    );
    assert(
      mockOnlySelfCheck.body.selfCheck?.status === "available_mock_only",
      "Mock-only self-check should report available_mock_only.",
    );
    assert(
      mockOnlySelfCheck.body.selfCheck?.capabilityValidation
        ?.canRunAvanzaDryRun === false,
      "Mock-only self-check must not report Avanza dry-run capability.",
    );
    assert(
      mockOnlySelfCheck.body.selfCheck?.capabilityValidation
        ?.canSubmitBrokerOrder === false,
      "Mock-only self-check must not report broker submission capability.",
    );
    recordMatrixRow(
      matrixRows,
      "mock_only",
      "/self-check",
      "available_mock_only",
      `${mockOnlySelfCheck.status}/${mockOnlySelfCheck.body.selfCheck?.status}`,
      "mock diagnostics only; not Avanza dry-run capable",
    );

    const mockOnlyDryRun = await postJson(
      "/dry-run",
      buildDryRunPayload({
        requestId: "avanza_dry_run_bridge_smoke_mock_only_001",
      }),
      MOCK_ONLY_BASE_URL,
    );

    assert(
      mockOnlyDryRun.status === 501,
      "Mock-only dry-run should still return HTTP 501.",
    );
    assert(
      mockOnlyDryRun.body.status === "not_implemented",
      "Mock-only dry-run should not run Avanza dry-run.",
    );
    assertNoBrokerResult(mockOnlyDryRun.body, "Mock-only dry-run response");
    assertNoExecutedDiagnostics(
      mockOnlyDryRun.body,
      "Mock-only dry-run response",
    );
    recordMatrixRow(
      matrixRows,
      "mock_only",
      "/dry-run valid",
      "not_implemented",
      `${mockOnlyDryRun.status}/${mockOnlyDryRun.body.status}`,
      "mock-only mode does not run Avanza dry-run; no brokerResult",
    );

    skeletonBridge = startBridge({
      port: SKELETON_PORT,
      selfCheckMode: "dry_run_skeleton",
    });
    await waitForHealth(SKELETON_BASE_URL);

    const skeletonSelfCheck = await getJson("/self-check", SKELETON_BASE_URL);

    assert(
      skeletonSelfCheck.status === 200,
      "Skeleton self-check should return HTTP 200.",
    );
    assert(
      skeletonSelfCheck.body.selfCheck?.status === "available_dry_run_only",
      "Skeleton self-check should report available_dry_run_only.",
    );
    assert(
      skeletonSelfCheck.body.selfCheck?.metadata?.skeletonOnly === true,
      "Skeleton self-check should be marked skeletonOnly.",
    );
    assert(
      skeletonSelfCheck.body.selfCheck?.metadata?.noBrowserControl === true,
      "Skeleton self-check should report no browser control.",
    );
    assert(
      skeletonSelfCheck.body.selfCheck?.capabilityValidation
        ?.canSubmitBrokerOrder === false,
      "Skeleton self-check must not report broker submission capability.",
    );
    assert(
      skeletonSelfCheck.body.capability?.metadata?.skeletonOnly === true,
      "Skeleton self-check response should include skeleton capability metadata.",
    );
    recordMatrixRow(
      matrixRows,
      "dry_run_skeleton",
      "/self-check",
      "available_dry_run_only",
      `${skeletonSelfCheck.status}/${skeletonSelfCheck.body.selfCheck?.status}`,
      "skeleton only; no browser control; no broker submission",
    );

    const skeletonDryRun = await postJson(
      "/dry-run",
      buildDryRunPayload({
        requestId: "avanza_dry_run_bridge_smoke_skeleton_001",
      }),
      SKELETON_BASE_URL,
    );

    assert(
      skeletonDryRun.status === 200,
      "Skeleton dry-run should return HTTP 200 accepted_stub.",
    );
    assert(
      skeletonDryRun.body.status === "accepted_stub",
      "Skeleton dry-run should report accepted_stub.",
    );
    assert(
      skeletonDryRun.body.metadata?.skeletonOnly === true,
      "Skeleton dry-run should be marked skeletonOnly.",
    );
    assert(
      skeletonDryRun.body.metadata?.no_browser_actions_executed === true,
      "Skeleton dry-run should report no browser actions executed.",
    );
    assert(
      skeletonDryRun.body.metadata?.no_broker_submission === true,
      "Skeleton dry-run should report no broker submission.",
    );
    assert(
      skeletonDryRun.body.diagnostics === null ||
        typeof skeletonDryRun.body.diagnostics === "undefined",
      "Skeleton dry-run must not return executed diagnostics.",
    );
    assert(
      typeof skeletonDryRun.body.brokerResult === "undefined",
      "Skeleton dry-run must not include brokerResult.",
    );
    assert(
      skeletonDryRun.body.warnings?.some((warning) =>
        warning.includes("Avanza dry-run runner skeleton only"),
      ),
      "Skeleton dry-run should warn that it is skeleton only.",
    );
    recordMatrixRow(
      matrixRows,
      "dry_run_skeleton",
      "/dry-run valid",
      "accepted_stub",
      `${skeletonDryRun.status}/${skeletonDryRun.body.status}`,
      "accepted by skeleton only; no browser actions; no brokerResult",
    );

    const skeletonUnsafeDryRun = await postJson(
      "/dry-run",
      createUnsafeDryRunPayload(),
      SKELETON_BASE_URL,
    );

    assert(
      skeletonUnsafeDryRun.status === 400,
      "Skeleton unsafe dry-run request should return HTTP 400.",
    );
    assert(
      skeletonUnsafeDryRun.body.status === "blocked",
      "Skeleton unsafe dry-run request should be blocked before skeleton execution.",
    );
    assertNoBrokerResult(
      skeletonUnsafeDryRun.body,
      "Skeleton unsafe dry-run response",
    );
    assertNoExecutedDiagnostics(
      skeletonUnsafeDryRun.body,
      "Skeleton unsafe dry-run response",
    );
    recordMatrixRow(
      matrixRows,
      "dry_run_skeleton",
      "/dry-run unsafe",
      "blocked",
      `${skeletonUnsafeDryRun.status}/${skeletonUnsafeDryRun.body.status}`,
      "unsafe broker/final-confirm metadata blocked before skeleton",
    );

    sessionReadyBridge = startBridge({
      port: SESSION_READY_PORT,
      sessionDetectionMode: "ready_for_search_only",
    });
    await waitForHealth(SESSION_READY_BASE_URL);

    const readySessionDetection = await getJson(
      "/session-detection",
      SESSION_READY_BASE_URL,
    );

    assert(
      readySessionDetection.status === 200,
      "Ready session detection should return HTTP 200.",
    );
    assert(
      readySessionDetection.body.ok === true,
      "Ready session detection should report ok true.",
    );
    assert(
      readySessionDetection.body.sessionDetection?.status ===
        "ready_for_search_only",
      "Ready session detection should report ready_for_search_only.",
    );
    assertSafeSessionDetectionResponse(
      readySessionDetection.body,
      "Ready session-detection response",
    );
    recordMatrixRow(
      matrixRows,
      "session_ready",
      "/session-detection",
      "ready_for_search_only",
      `${readySessionDetection.status}/${readySessionDetection.body.sessionDetection?.status}`,
      "synthetic ready state only; no browser actions; no Avanza page touched",
    );

    sessionLoginBridge = startBridge({
      port: SESSION_LOGIN_PORT,
      sessionDetectionMode: "login_required",
    });
    await waitForHealth(SESSION_LOGIN_BASE_URL);

    const loginSessionDetection = await getJson(
      "/session-detection",
      SESSION_LOGIN_BASE_URL,
    );

    assert(
      loginSessionDetection.status === 200,
      "Login-required session detection should return HTTP 200.",
    );
    assert(
      loginSessionDetection.body.ok === false,
      "Login-required session detection should not report ok.",
    );
    assert(
      loginSessionDetection.body.sessionDetection?.status === "login_required",
      "Login-required session detection should report login_required.",
    );
    assertSafeSessionDetectionResponse(
      loginSessionDetection.body,
      "Login-required session-detection response",
    );
    recordMatrixRow(
      matrixRows,
      "session_login",
      "/session-detection",
      "login_required",
      `${loginSessionDetection.status}/${loginSessionDetection.body.sessionDetection?.status}`,
      "synthetic login-required state only; no browser actions; no Avanza page touched",
    );

    sessionBlockedBridge = startBridge({
      port: SESSION_BLOCKED_PORT,
      sessionDetectionMode: "blocked_sensitive",
    });
    await waitForHealth(SESSION_BLOCKED_BASE_URL);

    const blockedSessionDetection = await getJson(
      "/session-detection",
      SESSION_BLOCKED_BASE_URL,
    );

    assert(
      blockedSessionDetection.status === 200,
      "Blocked-sensitive session detection should return HTTP 200.",
    );
    assert(
      blockedSessionDetection.body.ok === false,
      "Blocked-sensitive session detection should not report ok.",
    );
    assert(
      blockedSessionDetection.body.sessionDetection?.status === "blocked",
      "Blocked-sensitive session detection should report blocked.",
    );
    assert(
      blockedSessionDetection.body.sessionDetection?.errors?.some((error) =>
        error.includes("Sensitive data"),
      ),
      "Blocked-sensitive session detection should include sensitive-data error.",
    );
    assertSafeSessionDetectionResponse(
      blockedSessionDetection.body,
      "Blocked-sensitive session-detection response",
    );
    recordMatrixRow(
      matrixRows,
      "session_blocked",
      "/session-detection",
      "blocked",
      `${blockedSessionDetection.status}/${blockedSessionDetection.body.sessionDetection?.status}`,
      "sensitive-data block; no browser actions; no Avanza page touched",
    );

    searchExactBridge = startBridge({
      port: SEARCH_EXACT_PORT,
      searchOnlyMode: "exact_match",
    });
    await waitForHealth(SEARCH_EXACT_BASE_URL);

    const exactSearchOnly = await postJson(
      "/search-only",
      buildSearchOnlyPayload({
        requestId: "avanza_search_only_bridge_smoke_exact_001",
      }),
      SEARCH_EXACT_BASE_URL,
    );

    assert(
      exactSearchOnly.status === 200,
      "Exact search-only should return HTTP 200.",
    );
    assert(
      exactSearchOnly.body.ok === true,
      "Exact search-only should report ok true.",
    );
    assert(
      exactSearchOnly.body.searchOnly?.status === "exact_match",
      "Exact search-only should report exact_match.",
    );
    assert(
      exactSearchOnly.body.searchOnly?.selectedCandidate?.ticker ===
        "QA.SEARCH",
      "Exact search-only should select the expected synthetic ticker.",
    );
    assertSafeSearchOnlyResponse(
      exactSearchOnly.body,
      "Exact search-only response",
    );
    recordMatrixRow(
      matrixRows,
      "search_exact",
      "/search-only",
      "exact_match",
      `${exactSearchOnly.status}/${exactSearchOnly.body.searchOnly?.status}`,
      "synthetic candidate only; no browser actions; no order page",
    );

    searchAmbiguousBridge = startBridge({
      port: SEARCH_AMBIGUOUS_PORT,
      searchOnlyMode: "ambiguous",
    });
    await waitForHealth(SEARCH_AMBIGUOUS_BASE_URL);

    const ambiguousSearchOnly = await postJson(
      "/search-only",
      buildSearchOnlyPayload({
        requestId: "avanza_search_only_bridge_smoke_ambiguous_001",
      }),
      SEARCH_AMBIGUOUS_BASE_URL,
    );

    assert(
      ambiguousSearchOnly.status === 200,
      "Ambiguous search-only should return HTTP 200.",
    );
    assert(
      ambiguousSearchOnly.body.ok === false,
      "Ambiguous search-only should not report ok.",
    );
    assert(
      ambiguousSearchOnly.body.searchOnly?.status === "ambiguous",
      "Ambiguous search-only should report ambiguous.",
    );
    assert(
      ambiguousSearchOnly.body.searchOnly?.candidates?.some((candidate) =>
        candidate.riskFlags?.includes("duplicate_ticker"),
      ),
      "Ambiguous search-only should include duplicate_ticker risk.",
    );
    assertSafeSearchOnlyResponse(
      ambiguousSearchOnly.body,
      "Ambiguous search-only response",
    );
    recordMatrixRow(
      matrixRows,
      "search_ambiguous",
      "/search-only",
      "ambiguous",
      `${ambiguousSearchOnly.status}/${ambiguousSearchOnly.body.searchOnly?.status}`,
      "synthetic ambiguity only; no browser actions; no order page",
    );

    searchNoMatchBridge = startBridge({
      port: SEARCH_NO_MATCH_PORT,
      searchOnlyMode: "no_match",
    });
    await waitForHealth(SEARCH_NO_MATCH_BASE_URL);

    const noMatchSearchOnly = await postJson(
      "/search-only",
      buildSearchOnlyPayload({
        requestId: "avanza_search_only_bridge_smoke_no_match_001",
      }),
      SEARCH_NO_MATCH_BASE_URL,
    );

    assert(
      noMatchSearchOnly.status === 200,
      "No-match search-only should return HTTP 200.",
    );
    assert(
      noMatchSearchOnly.body.searchOnly?.status === "no_match",
      "No-match search-only should report no_match.",
    );
    assertSafeSearchOnlyResponse(
      noMatchSearchOnly.body,
      "No-match search-only response",
    );
    recordMatrixRow(
      matrixRows,
      "search_no_match",
      "/search-only",
      "no_match",
      `${noMatchSearchOnly.status}/${noMatchSearchOnly.body.searchOnly?.status}`,
      "synthetic no-match only; no browser actions; no order page",
    );

    searchBlockedSensitiveBridge = startBridge({
      port: SEARCH_BLOCKED_SENSITIVE_PORT,
      searchOnlyMode: "blocked_sensitive",
    });
    await waitForHealth(SEARCH_BLOCKED_SENSITIVE_BASE_URL);

    const blockedSensitiveSearchOnly = await postJson(
      "/search-only",
      buildSearchOnlyPayload({
        requestId: "avanza_search_only_bridge_smoke_blocked_sensitive_001",
      }),
      SEARCH_BLOCKED_SENSITIVE_BASE_URL,
    );

    assert(
      blockedSensitiveSearchOnly.status === 400,
      "Blocked-sensitive search-only should return HTTP 400.",
    );
    assert(
      blockedSensitiveSearchOnly.body.searchOnly?.status === "blocked",
      "Blocked-sensitive search-only should report blocked.",
    );
    assert(
      blockedSensitiveSearchOnly.body.searchOnly?.errors?.some((error) =>
        error.includes("Sensitive data"),
      ),
      "Blocked-sensitive search-only should include sensitive-data error.",
    );
    assertSafeSearchOnlyResponse(
      blockedSensitiveSearchOnly.body,
      "Blocked-sensitive search-only response",
    );
    recordMatrixRow(
      matrixRows,
      "search_blocked_sensitive",
      "/search-only",
      "blocked",
      `${blockedSensitiveSearchOnly.status}/${blockedSensitiveSearchOnly.body.searchOnly?.status}`,
      "sensitive-data block; no browser actions; no order page",
    );

    searchBlockedOrderFlowBridge = startBridge({
      port: SEARCH_BLOCKED_ORDER_FLOW_PORT,
      searchOnlyMode: "blocked_order_flow",
    });
    await waitForHealth(SEARCH_BLOCKED_ORDER_FLOW_BASE_URL);

    const blockedOrderFlowSearchOnly = await postJson(
      "/search-only",
      buildSearchOnlyPayload({
        requestId: "avanza_search_only_bridge_smoke_blocked_order_flow_001",
      }),
      SEARCH_BLOCKED_ORDER_FLOW_BASE_URL,
    );

    assert(
      blockedOrderFlowSearchOnly.status === 400,
      "Blocked-order-flow search-only should return HTTP 400.",
    );
    assert(
      blockedOrderFlowSearchOnly.body.searchOnly?.status === "blocked",
      "Blocked-order-flow search-only should report blocked.",
    );
    assert(
      blockedOrderFlowSearchOnly.body.searchOnly?.errors?.some((error) =>
        error.includes("Order flow"),
      ),
      "Blocked-order-flow search-only should include order-flow error.",
    );
    assertSafeSearchOnlyResponse(
      blockedOrderFlowSearchOnly.body,
      "Blocked-order-flow search-only response",
    );
    recordMatrixRow(
      matrixRows,
      "search_blocked_order_flow",
      "/search-only",
      "blocked",
      `${blockedOrderFlowSearchOnly.status}/${blockedOrderFlowSearchOnly.body.searchOnly?.status}`,
      "order-flow block; no browser actions; no order page",
    );

    instrumentVerifiedBridge = startBridge({
      port: INSTRUMENT_VERIFIED_PORT,
      instrumentVerificationMode: "verified",
    });
    await waitForHealth(INSTRUMENT_VERIFIED_BASE_URL);

    const verifiedInstrument = await postJson(
      "/instrument-verification",
      buildInstrumentVerificationPayload({
        requestId: "avanza_instrument_verification_bridge_smoke_verified_001",
      }),
      INSTRUMENT_VERIFIED_BASE_URL,
    );

    assert(
      verifiedInstrument.status === 200,
      "Verified instrument should return HTTP 200.",
    );
    assert(
      verifiedInstrument.body.ok === true,
      "Verified instrument should report ok true.",
    );
    assert(
      verifiedInstrument.body.instrumentVerification?.status === "verified",
      "Verified instrument should report verified.",
    );
    assertSafeInstrumentVerificationResponse(
      verifiedInstrument.body,
      "Verified instrument response",
    );
    recordMatrixRow(
      matrixRows,
      "instrument_verified",
      "/instrument-verification",
      "verified",
      `${verifiedInstrument.status}/${verifiedInstrument.body.instrumentVerification?.status}`,
      "synthetic identity verification only; no browser actions; no order page",
    );

    instrumentRejectedTickerBridge = startBridge({
      port: INSTRUMENT_REJECTED_TICKER_PORT,
      instrumentVerificationMode: "rejected_ticker",
    });
    await waitForHealth(INSTRUMENT_REJECTED_TICKER_BASE_URL);

    const rejectedTickerInstrument = await postJson(
      "/instrument-verification",
      buildInstrumentVerificationPayload({
        requestId:
          "avanza_instrument_verification_bridge_smoke_rejected_ticker_001",
      }),
      INSTRUMENT_REJECTED_TICKER_BASE_URL,
    );

    assert(
      rejectedTickerInstrument.status === 200,
      "Rejected ticker instrument should return HTTP 200.",
    );
    assert(
      rejectedTickerInstrument.body.instrumentVerification?.status === "rejected",
      "Rejected ticker instrument should report rejected.",
    );
    assert(
      rejectedTickerInstrument.body.instrumentVerification?.riskFlags?.includes(
        "ticker_mismatch",
      ),
      "Rejected ticker instrument should include ticker_mismatch risk.",
    );
    assertSafeInstrumentVerificationResponse(
      rejectedTickerInstrument.body,
      "Rejected ticker instrument response",
    );
    recordMatrixRow(
      matrixRows,
      "instrument_rejected_ticker",
      "/instrument-verification",
      "rejected",
      `${rejectedTickerInstrument.status}/${rejectedTickerInstrument.body.instrumentVerification?.status}`,
      "synthetic mismatch only; no browser actions; no order page",
    );

    instrumentAmbiguousCurrencyBridge = startBridge({
      port: INSTRUMENT_AMBIGUOUS_CURRENCY_PORT,
      instrumentVerificationMode: "ambiguous_missing_currency",
    });
    await waitForHealth(INSTRUMENT_AMBIGUOUS_CURRENCY_BASE_URL);

    const ambiguousCurrencyInstrument = await postJson(
      "/instrument-verification",
      buildInstrumentVerificationPayload({
        requestId:
          "avanza_instrument_verification_bridge_smoke_ambiguous_currency_001",
      }),
      INSTRUMENT_AMBIGUOUS_CURRENCY_BASE_URL,
    );

    assert(
      ambiguousCurrencyInstrument.status === 200,
      "Ambiguous currency instrument should return HTTP 200.",
    );
    assert(
      ambiguousCurrencyInstrument.body.instrumentVerification?.status ===
        "ambiguous",
      "Ambiguous currency instrument should report ambiguous.",
    );
    assert(
      ambiguousCurrencyInstrument.body.instrumentVerification?.riskFlags?.includes(
        "missing_currency",
      ),
      "Ambiguous currency instrument should include missing_currency risk.",
    );
    assertSafeInstrumentVerificationResponse(
      ambiguousCurrencyInstrument.body,
      "Ambiguous currency instrument response",
    );
    recordMatrixRow(
      matrixRows,
      "instrument_ambiguous_currency",
      "/instrument-verification",
      "ambiguous",
      `${ambiguousCurrencyInstrument.status}/${ambiguousCurrencyInstrument.body.instrumentVerification?.status}`,
      "synthetic missing currency only; no browser actions; no order page",
    );

    instrumentBlockedOrderFlowBridge = startBridge({
      port: INSTRUMENT_BLOCKED_ORDER_FLOW_PORT,
      instrumentVerificationMode: "blocked_order_flow",
    });
    await waitForHealth(INSTRUMENT_BLOCKED_ORDER_FLOW_BASE_URL);

    const blockedOrderFlowInstrument = await postJson(
      "/instrument-verification",
      buildInstrumentVerificationPayload({
        requestId:
          "avanza_instrument_verification_bridge_smoke_blocked_order_flow_001",
      }),
      INSTRUMENT_BLOCKED_ORDER_FLOW_BASE_URL,
    );

    assert(
      blockedOrderFlowInstrument.status === 400,
      "Blocked-order-flow instrument should return HTTP 400.",
    );
    assert(
      blockedOrderFlowInstrument.body.instrumentVerification?.status ===
        "blocked",
      "Blocked-order-flow instrument should report blocked.",
    );
    assert(
      blockedOrderFlowInstrument.body.instrumentVerification?.errors?.some(
        (error) => error.includes("Order-flow"),
      ),
      "Blocked-order-flow instrument should include order-flow error.",
    );
    assertSafeInstrumentVerificationResponse(
      blockedOrderFlowInstrument.body,
      "Blocked-order-flow instrument response",
    );
    recordMatrixRow(
      matrixRows,
      "instrument_blocked_order_flow",
      "/instrument-verification",
      "blocked",
      `${blockedOrderFlowInstrument.status}/${blockedOrderFlowInstrument.body.instrumentVerification?.status}`,
      "order-flow block; no browser actions; no order page",
    );

    instrumentPageIdentifiedBridge = startBridge({
      port: INSTRUMENT_PAGE_IDENTIFIED_PORT,
      instrumentPageMode: "page_identified",
    });
    await waitForHealth(INSTRUMENT_PAGE_IDENTIFIED_BASE_URL);

    const identifiedInstrumentPage = await postJson(
      "/instrument-page",
      buildInstrumentPagePayload({
        requestId: "avanza_instrument_page_bridge_smoke_identified_001",
      }),
      INSTRUMENT_PAGE_IDENTIFIED_BASE_URL,
    );

    assert(
      identifiedInstrumentPage.status === 200,
      "Identified instrument page should return HTTP 200.",
    );
    assert(
      identifiedInstrumentPage.body.ok === true,
      "Identified instrument page should report ok true.",
    );
    assert(
      identifiedInstrumentPage.body.instrumentPage?.status === "page_identified",
      "Identified instrument page should report page_identified.",
    );
    assertSafeInstrumentPageResponse(
      identifiedInstrumentPage.body,
      "Identified instrument page response",
    );
    recordMatrixRow(
      matrixRows,
      "instrument_page_identified",
      "/instrument-page",
      "page_identified",
      `${identifiedInstrumentPage.status}/${identifiedInstrumentPage.body.instrumentPage?.status}`,
      "synthetic page identity only; no browser actions; no order page",
    );

    instrumentPageBuySellBridge = startBridge({
      port: INSTRUMENT_PAGE_BUY_SELL_PORT,
      instrumentPageMode: "page_identified_with_buy_sell_visible",
    });
    await waitForHealth(INSTRUMENT_PAGE_BUY_SELL_BASE_URL);

    const buySellInstrumentPage = await postJson(
      "/instrument-page",
      buildInstrumentPagePayload({
        requestId: "avanza_instrument_page_bridge_smoke_buy_sell_001",
      }),
      INSTRUMENT_PAGE_BUY_SELL_BASE_URL,
    );

    assert(
      buySellInstrumentPage.status === 200,
      "Buy/sell-visible instrument page should return HTTP 200.",
    );
    assert(
      buySellInstrumentPage.body.instrumentPage?.status === "page_identified",
      "Buy/sell-visible instrument page should remain identified with warnings.",
    );
    assert(
      buySellInstrumentPage.body.instrumentPage?.riskFlags?.includes(
        "prohibited_buy_button_visible",
      ),
      "Buy/sell-visible instrument page should include buy-button risk.",
    );
    assert(
      buySellInstrumentPage.body.instrumentPage?.riskFlags?.includes(
        "prohibited_sell_button_visible",
      ),
      "Buy/sell-visible instrument page should include sell-button risk.",
    );
    assertSafeInstrumentPageResponse(
      buySellInstrumentPage.body,
      "Buy/sell-visible instrument page response",
    );
    recordMatrixRow(
      matrixRows,
      "instrument_page_buy_sell_visible",
      "/instrument-page",
      "page_identified_with_warnings",
      `${buySellInstrumentPage.status}/${buySellInstrumentPage.body.instrumentPage?.status}`,
      "prohibited controls observed as warnings only; no clicks; no order page",
    );

    instrumentPageMismatchBridge = startBridge({
      port: INSTRUMENT_PAGE_MISMATCH_PORT,
      instrumentPageMode: "page_mismatch_ticker",
    });
    await waitForHealth(INSTRUMENT_PAGE_MISMATCH_BASE_URL);

    const mismatchInstrumentPage = await postJson(
      "/instrument-page",
      buildInstrumentPagePayload({
        requestId: "avanza_instrument_page_bridge_smoke_mismatch_001",
      }),
      INSTRUMENT_PAGE_MISMATCH_BASE_URL,
    );

    assert(
      mismatchInstrumentPage.status === 200,
      "Mismatch instrument page should return HTTP 200.",
    );
    assert(
      mismatchInstrumentPage.body.instrumentPage?.status === "page_mismatch",
      "Mismatch instrument page should report page_mismatch.",
    );
    assert(
      mismatchInstrumentPage.body.instrumentPage?.riskFlags?.includes(
        "ticker_mismatch",
      ),
      "Mismatch instrument page should include ticker_mismatch risk.",
    );
    assertSafeInstrumentPageResponse(
      mismatchInstrumentPage.body,
      "Mismatch instrument page response",
    );
    recordMatrixRow(
      matrixRows,
      "instrument_page_mismatch",
      "/instrument-page",
      "page_mismatch",
      `${mismatchInstrumentPage.status}/${mismatchInstrumentPage.body.instrumentPage?.status}`,
      "synthetic mismatch only; no browser actions; no order page",
    );

    instrumentPageBlockedOrderBridge = startBridge({
      port: INSTRUMENT_PAGE_BLOCKED_ORDER_PORT,
      instrumentPageMode: "blocked_order_page",
    });
    await waitForHealth(INSTRUMENT_PAGE_BLOCKED_ORDER_BASE_URL);

    const blockedOrderInstrumentPage = await postJson(
      "/instrument-page",
      buildInstrumentPagePayload({
        requestId: "avanza_instrument_page_bridge_smoke_blocked_order_001",
      }),
      INSTRUMENT_PAGE_BLOCKED_ORDER_BASE_URL,
    );

    assert(
      blockedOrderInstrumentPage.status === 400,
      "Blocked-order instrument page should return HTTP 400.",
    );
    assert(
      blockedOrderInstrumentPage.body.instrumentPage?.status === "blocked",
      "Blocked-order instrument page should report blocked.",
    );
    assert(
      blockedOrderInstrumentPage.body.instrumentPage?.riskFlags?.includes(
        "order_page_detected",
      ),
      "Blocked-order instrument page should include order_page_detected risk.",
    );
    assertSafeInstrumentPageResponse(
      blockedOrderInstrumentPage.body,
      "Blocked-order instrument page response",
    );
    recordMatrixRow(
      matrixRows,
      "instrument_page_blocked_order",
      "/instrument-page",
      "blocked",
      `${blockedOrderInstrumentPage.status}/${blockedOrderInstrumentPage.body.instrumentPage?.status}`,
      "order-page block; no browser actions; no brokerResult",
    );

    instrumentPageBlockedConfirmBridge = startBridge({
      port: INSTRUMENT_PAGE_BLOCKED_CONFIRM_PORT,
      instrumentPageMode: "blocked_final_confirm",
    });
    await waitForHealth(INSTRUMENT_PAGE_BLOCKED_CONFIRM_BASE_URL);

    const blockedConfirmInstrumentPage = await postJson(
      "/instrument-page",
      buildInstrumentPagePayload({
        requestId: "avanza_instrument_page_bridge_smoke_blocked_confirm_001",
      }),
      INSTRUMENT_PAGE_BLOCKED_CONFIRM_BASE_URL,
    );

    assert(
      blockedConfirmInstrumentPage.status === 400,
      "Blocked-final-confirm instrument page should return HTTP 400.",
    );
    assert(
      blockedConfirmInstrumentPage.body.instrumentPage?.status === "blocked",
      "Blocked-final-confirm instrument page should report blocked.",
    );
    assert(
      blockedConfirmInstrumentPage.body.instrumentPage?.riskFlags?.includes(
        "final_confirm_detected",
      ),
      "Blocked-final-confirm instrument page should include final_confirm_detected risk.",
    );
    assertSafeInstrumentPageResponse(
      blockedConfirmInstrumentPage.body,
      "Blocked-final-confirm instrument page response",
    );
    recordMatrixRow(
      matrixRows,
      "instrument_page_blocked_final_confirm",
      "/instrument-page",
      "blocked",
      `${blockedConfirmInstrumentPage.status}/${blockedConfirmInstrumentPage.body.instrumentPage?.status}`,
      "final-confirm block; no browser actions; no brokerResult",
    );

    instrumentPageBlockedSensitiveBridge = startBridge({
      port: INSTRUMENT_PAGE_BLOCKED_SENSITIVE_PORT,
      instrumentPageMode: "blocked_sensitive",
    });
    await waitForHealth(INSTRUMENT_PAGE_BLOCKED_SENSITIVE_BASE_URL);

    const blockedSensitiveInstrumentPage = await postJson(
      "/instrument-page",
      buildInstrumentPagePayload({
        requestId: "avanza_instrument_page_bridge_smoke_blocked_sensitive_001",
      }),
      INSTRUMENT_PAGE_BLOCKED_SENSITIVE_BASE_URL,
    );

    assert(
      blockedSensitiveInstrumentPage.status === 400,
      "Blocked-sensitive instrument page should return HTTP 400.",
    );
    assert(
      blockedSensitiveInstrumentPage.body.instrumentPage?.status === "blocked",
      "Blocked-sensitive instrument page should report blocked.",
    );
    assert(
      blockedSensitiveInstrumentPage.body.instrumentPage?.riskFlags?.includes(
        "sensitive_data_detected",
      ),
      "Blocked-sensitive instrument page should include sensitive_data_detected risk.",
    );
    assertSafeInstrumentPageResponse(
      blockedSensitiveInstrumentPage.body,
      "Blocked-sensitive instrument page response",
    );
    recordMatrixRow(
      matrixRows,
      "instrument_page_blocked_sensitive",
      "/instrument-page",
      "blocked",
      `${blockedSensitiveInstrumentPage.status}/${blockedSensitiveInstrumentPage.body.instrumentPage?.status}`,
      "sensitive-data block; no browser actions; no brokerResult",
    );

    await assertOrderPageOpenMode({
      matrixRows,
      mode: "order_page_opened_buy",
      port: ORDER_PAGE_OPEN_BUY_PORT,
      baseUrl: ORDER_PAGE_OPEN_BUY_BASE_URL,
      requestId: "avanza_order_page_open_bridge_smoke_opened_buy_001",
      expectedStatus: "order_page_opened",
      expectedHttpStatus: 200,
      expectedOk: true,
      safety:
        "synthetic order page identity only; no form fill; no review/final click",
    });

    await assertOrderPageOpenMode({
      matrixRows,
      mode: "order_page_opened_sell",
      port: ORDER_PAGE_OPEN_SELL_PORT,
      baseUrl: ORDER_PAGE_OPEN_SELL_BASE_URL,
      requestId: "avanza_order_page_open_bridge_smoke_opened_sell_001",
      expectedStatus: "order_page_opened",
      expectedHttpStatus: 200,
      expectedOk: true,
      payloadOverrides: { action: "sell" },
      safety:
        "synthetic sell order page identity only; no form fill; no review/final click",
    });

    await assertOrderPageOpenMode({
      matrixRows,
      mode: "wrong_action_opened",
      port: ORDER_PAGE_WRONG_ACTION_PORT,
      baseUrl: ORDER_PAGE_WRONG_ACTION_BASE_URL,
      requestId: "avanza_order_page_open_bridge_smoke_wrong_action_001",
      expectedStatus: "wrong_action_opened",
      expectedHttpStatus: 200,
      expectedOk: false,
      riskFlag: "order_page_wrong_action",
      safety:
        "synthetic wrong-action block; no form fill; no review/final click",
    });

    await assertOrderPageOpenMode({
      matrixRows,
      mode: "order_page_mismatch_ticker",
      port: ORDER_PAGE_MISMATCH_TICKER_PORT,
      baseUrl: ORDER_PAGE_MISMATCH_TICKER_BASE_URL,
      requestId: "avanza_order_page_open_bridge_smoke_mismatch_ticker_001",
      expectedStatus: "order_page_mismatch",
      expectedHttpStatus: 200,
      expectedOk: false,
      riskFlag: "order_page_wrong_instrument",
      safety: "synthetic ticker mismatch; no form fill; no brokerResult",
    });

    await assertOrderPageOpenMode({
      matrixRows,
      mode: "order_page_mismatch_currency",
      port: ORDER_PAGE_MISMATCH_CURRENCY_PORT,
      baseUrl: ORDER_PAGE_MISMATCH_CURRENCY_BASE_URL,
      requestId: "avanza_order_page_open_bridge_smoke_mismatch_currency_001",
      expectedStatus: "order_page_mismatch",
      expectedHttpStatus: 200,
      expectedOk: false,
      riskFlag: "order_page_wrong_instrument",
      safety: "synthetic currency mismatch; no form fill; no brokerResult",
    });

    await assertOrderPageOpenMode({
      matrixRows,
      mode: "prohibited_form_prefilled",
      port: ORDER_PAGE_PREFILLED_PORT,
      baseUrl: ORDER_PAGE_PREFILLED_BASE_URL,
      requestId: "avanza_order_page_open_bridge_smoke_prefilled_001",
      expectedStatus: "prohibited_form_interaction_detected",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "order_form_prefilled",
      safety:
        "prefill hard-stop detected; no review/final click; no brokerResult",
    });

    await assertOrderPageOpenMode({
      matrixRows,
      mode: "blocked_final_confirm",
      port: ORDER_PAGE_BLOCKED_FINAL_CONFIRM_PORT,
      baseUrl: ORDER_PAGE_BLOCKED_FINAL_CONFIRM_BASE_URL,
      requestId: "avanza_order_page_open_bridge_smoke_final_confirm_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "final_confirm_detected",
      safety: "final-confirm guard blocked; no browser actions; no brokerResult",
    });

    await assertOrderPageOpenMode({
      matrixRows,
      mode: "blocked_review_click_attempt",
      port: ORDER_PAGE_BLOCKED_REVIEW_PORT,
      baseUrl: ORDER_PAGE_BLOCKED_REVIEW_BASE_URL,
      requestId: "avanza_order_page_open_bridge_smoke_review_click_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "review_button_clicked_or_attempted",
      safety: "review/Granska attempt blocked; no brokerResult",
    });

    await assertOrderPageOpenMode({
      matrixRows,
      mode: "blocked_keyboard_submit",
      port: ORDER_PAGE_BLOCKED_KEYBOARD_PORT,
      baseUrl: ORDER_PAGE_BLOCKED_KEYBOARD_BASE_URL,
      requestId: "avanza_order_page_open_bridge_smoke_keyboard_submit_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "keyboard_submit_detected",
      safety: "keyboard submit blocked; no brokerResult",
    });

    await assertOrderPageOpenMode({
      matrixRows,
      mode: "blocked_sensitive",
      port: ORDER_PAGE_BLOCKED_SENSITIVE_PORT,
      baseUrl: ORDER_PAGE_BLOCKED_SENSITIVE_BASE_URL,
      requestId: "avanza_order_page_open_bridge_smoke_sensitive_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "sensitive_data_detected",
      safety: "sensitive-data block; no browser actions; no brokerResult",
    });

    await assertOrderPageOpenMode({
      matrixRows,
      mode: "instrument_page_not_ready",
      port: ORDER_PAGE_INSTRUMENT_NOT_READY_PORT,
      baseUrl: ORDER_PAGE_INSTRUMENT_NOT_READY_BASE_URL,
      requestId: "avanza_order_page_open_bridge_smoke_instrument_not_ready_001",
      expectedStatus: "instrument_page_not_ready",
      expectedHttpStatus: 501,
      expectedOk: false,
      riskFlag: "instrument_page_not_identified",
      safety: "instrument-page precondition block; no order page opened",
    });

    await assertAdvancedFormFillMode({
      matrixRows,
      mode: "form_filled_buy",
      port: ADVANCED_FORM_FILL_BUY_PORT,
      baseUrl: ADVANCED_FORM_FILL_BUY_BASE_URL,
      requestId: "avanza_advanced_form_fill_bridge_smoke_buy_001",
      expectedStatus: "form_filled",
      expectedHttpStatus: 200,
      expectedOk: true,
      safety:
        "synthetic buy form-fill result only; no real fields; no review/final click",
    });

    await assertAdvancedFormFillMode({
      matrixRows,
      mode: "form_filled_sell",
      port: ADVANCED_FORM_FILL_SELL_PORT,
      baseUrl: ADVANCED_FORM_FILL_SELL_BASE_URL,
      requestId: "avanza_advanced_form_fill_bridge_smoke_sell_001",
      expectedStatus: "form_filled",
      expectedHttpStatus: 200,
      expectedOk: true,
      payloadOverrides: { action: "sell" },
      safety:
        "synthetic sell form-fill result only; no real fields; no review/final click",
    });

    await assertAdvancedFormFillMode({
      matrixRows,
      mode: "field_mismatch_quantity",
      port: ADVANCED_FORM_FILL_QUANTITY_MISMATCH_PORT,
      baseUrl: ADVANCED_FORM_FILL_QUANTITY_MISMATCH_BASE_URL,
      requestId: "avanza_advanced_form_fill_bridge_smoke_quantity_mismatch_001",
      expectedStatus: "field_mismatch",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "quantity_mismatch",
      safety: "quantity mismatch reported; no real form fill; no brokerResult",
    });

    await assertAdvancedFormFillMode({
      matrixRows,
      mode: "field_mismatch_price",
      port: ADVANCED_FORM_FILL_PRICE_MISMATCH_PORT,
      baseUrl: ADVANCED_FORM_FILL_PRICE_MISMATCH_BASE_URL,
      requestId: "avanza_advanced_form_fill_bridge_smoke_price_mismatch_001",
      expectedStatus: "field_mismatch",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "price_mismatch",
      safety: "price mismatch reported; no real form fill; no brokerResult",
    });

    await assertAdvancedFormFillMode({
      matrixRows,
      mode: "validation_error",
      port: ADVANCED_FORM_FILL_VALIDATION_ERROR_PORT,
      baseUrl: ADVANCED_FORM_FILL_VALIDATION_ERROR_BASE_URL,
      requestId: "avanza_advanced_form_fill_bridge_smoke_validation_error_001",
      expectedStatus: "validation_error",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "validation_error_visible",
      safety: "validation error reported; no review/final click; no brokerResult",
    });

    await assertAdvancedFormFillMode({
      matrixRows,
      mode: "unsupported_order_mode_stop_loss",
      port: ADVANCED_FORM_FILL_STOP_LOSS_PORT,
      baseUrl: ADVANCED_FORM_FILL_STOP_LOSS_BASE_URL,
      requestId: "avanza_advanced_form_fill_bridge_smoke_stop_loss_001",
      expectedStatus: "unsupported_order_mode",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "stop_loss_mode_detected",
      safety: "Stop Loss mode blocked; Advanced-only contract preserved",
    });

    await assertAdvancedFormFillMode({
      matrixRows,
      mode: "prohibited_review_detected",
      port: ADVANCED_FORM_FILL_REVIEW_PORT,
      baseUrl: ADVANCED_FORM_FILL_REVIEW_BASE_URL,
      requestId: "avanza_advanced_form_fill_bridge_smoke_review_001",
      expectedStatus: "prohibited_review_detected",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "review_button_clicked_or_attempted",
      safety: "Granska attempt blocked; no brokerResult",
    });

    await assertAdvancedFormFillMode({
      matrixRows,
      mode: "prohibited_final_confirm_detected",
      port: ADVANCED_FORM_FILL_FINAL_CONFIRM_PORT,
      baseUrl: ADVANCED_FORM_FILL_FINAL_CONFIRM_BASE_URL,
      requestId: "avanza_advanced_form_fill_bridge_smoke_final_confirm_001",
      expectedStatus: "prohibited_final_confirm_detected",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "final_confirm_clicked_or_attempted",
      safety: "Bekräfta guard blocked; no brokerResult",
    });

    await assertAdvancedFormFillMode({
      matrixRows,
      mode: "blocked_keyboard_submit",
      port: ADVANCED_FORM_FILL_KEYBOARD_PORT,
      baseUrl: ADVANCED_FORM_FILL_KEYBOARD_BASE_URL,
      requestId: "avanza_advanced_form_fill_bridge_smoke_keyboard_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "keyboard_submit_detected",
      safety: "keyboard submit blocked; no brokerResult",
    });

    await assertReviewClickMode({
      matrixRows,
      mode: "confirmation_ready_buy",
      port: REVIEW_CLICK_BUY_PORT,
      baseUrl: REVIEW_CLICK_BUY_BASE_URL,
      requestId: "avanza_review_click_bridge_smoke_buy_001",
      expectedStatus: "confirmation_ready",
      expectedHttpStatus: 200,
      expectedOk: true,
      riskFlag: "final_confirm_visible",
      safety:
        "synthetic buy confirmation readback only; no real Granska/Bekräfta",
    });

    await assertReviewClickMode({
      matrixRows,
      mode: "confirmation_ready_sell",
      port: REVIEW_CLICK_SELL_PORT,
      baseUrl: REVIEW_CLICK_SELL_BASE_URL,
      requestId: "avanza_review_click_bridge_smoke_sell_001",
      expectedStatus: "confirmation_ready",
      expectedHttpStatus: 200,
      expectedOk: true,
      payloadOverrides: { action: "sell" },
      riskFlag: "final_confirm_visible",
      safety:
        "synthetic sell confirmation readback only; no real Granska/Bekräfta",
    });

    await assertReviewClickMode({
      matrixRows,
      mode: "confirmation_mismatch_quantity",
      port: REVIEW_CLICK_QUANTITY_MISMATCH_PORT,
      baseUrl: REVIEW_CLICK_QUANTITY_MISMATCH_BASE_URL,
      requestId: "avanza_review_click_bridge_smoke_quantity_mismatch_001",
      expectedStatus: "confirmation_mismatch",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "confirmation_quantity_mismatch",
      safety: "quantity mismatch reported; no brokerResult",
    });

    await assertReviewClickMode({
      matrixRows,
      mode: "confirmation_mismatch_price",
      port: REVIEW_CLICK_PRICE_MISMATCH_PORT,
      baseUrl: REVIEW_CLICK_PRICE_MISMATCH_BASE_URL,
      requestId: "avanza_review_click_bridge_smoke_price_mismatch_001",
      expectedStatus: "confirmation_mismatch",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "confirmation_price_mismatch",
      safety: "price mismatch reported; no brokerResult",
    });

    await assertReviewClickMode({
      matrixRows,
      mode: "validation_error",
      port: REVIEW_CLICK_VALIDATION_ERROR_PORT,
      baseUrl: REVIEW_CLICK_VALIDATION_ERROR_BASE_URL,
      requestId: "avanza_review_click_bridge_smoke_validation_error_001",
      expectedStatus: "validation_error",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "validation_error_visible",
      safety: "validation error reported; no final confirm; no brokerResult",
    });

    await assertReviewClickMode({
      matrixRows,
      mode: "final_confirm_visible_read_only",
      port: REVIEW_CLICK_FINAL_VISIBLE_PORT,
      baseUrl: REVIEW_CLICK_FINAL_VISIBLE_BASE_URL,
      requestId: "avanza_review_click_bridge_smoke_final_visible_001",
      expectedStatus: "confirmation_ready",
      expectedHttpStatus: 200,
      expectedOk: true,
      riskFlag: "final_confirm_visible",
      safety: "Bekräfta visibility is read-only warning; no click occurred",
    });

    await assertReviewClickMode({
      matrixRows,
      mode: "prohibited_final_confirm_detected",
      port: REVIEW_CLICK_FINAL_CLICK_PORT,
      baseUrl: REVIEW_CLICK_FINAL_CLICK_BASE_URL,
      requestId: "avanza_review_click_bridge_smoke_final_click_001",
      expectedStatus: "prohibited_final_confirm_detected",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "final_confirm_clicked_or_attempted",
      safety: "Bekräfta click attempt blocked; no brokerResult",
    });

    await assertReviewClickMode({
      matrixRows,
      mode: "blocked_keyboard_submit",
      port: REVIEW_CLICK_KEYBOARD_PORT,
      baseUrl: REVIEW_CLICK_KEYBOARD_BASE_URL,
      requestId: "avanza_review_click_bridge_smoke_keyboard_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "keyboard_submit_detected",
      safety: "keyboard submit blocked; no brokerResult",
    });

    await assertReviewClickMode({
      matrixRows,
      mode: "blocked_sensitive",
      port: REVIEW_CLICK_SENSITIVE_PORT,
      baseUrl: REVIEW_CLICK_SENSITIVE_BASE_URL,
      requestId: "avanza_review_click_bridge_smoke_sensitive_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "sensitive_data_detected",
      safety: "sensitive data blocked; no brokerResult",
    });

    await assertManualConfirmationWaitMode({
      matrixRows,
      mode: "waiting",
      port: MANUAL_CONFIRMATION_WAIT_WAITING_PORT,
      baseUrl: MANUAL_CONFIRMATION_WAIT_WAITING_BASE_URL,
      requestId: "avanza_manual_confirmation_wait_bridge_smoke_waiting_001",
      expectedStatus: "waiting_for_manual_confirmation",
      expectedHttpStatus: 200,
      expectedOk: true,
      riskFlag: "final_confirm_visible_read_only",
      safety:
        "synthetic manual wait only; final-confirm visible read-only; no Bekräfta",
    });

    await assertManualConfirmationWaitMode({
      matrixRows,
      mode: "user_cancelled",
      port: MANUAL_CONFIRMATION_WAIT_USER_CANCELLED_PORT,
      baseUrl: MANUAL_CONFIRMATION_WAIT_USER_CANCELLED_BASE_URL,
      requestId:
        "avanza_manual_confirmation_wait_bridge_smoke_user_cancelled_001",
      expectedStatus: "user_cancelled",
      expectedHttpStatus: 200,
      expectedOk: false,
      riskFlag: "user_cancelled",
      safety: "manual cancellation reported; no brokerResult; no mutation",
    });

    await assertManualConfirmationWaitMode({
      matrixRows,
      mode: "user_confirmed_unverified",
      port: MANUAL_CONFIRMATION_WAIT_USER_CONFIRMED_PORT,
      baseUrl: MANUAL_CONFIRMATION_WAIT_USER_CONFIRMED_BASE_URL,
      requestId:
        "avanza_manual_confirmation_wait_bridge_smoke_user_confirmed_001",
      expectedStatus: "user_confirmed_unverified",
      expectedHttpStatus: 200,
      expectedOk: false,
      riskFlag: "user_confirmed_unverified",
      safety:
        "human confirmation unverified only; no brokerResult capture; no mutation",
    });

    await assertManualConfirmationWaitMode({
      matrixRows,
      mode: "timed_out",
      port: MANUAL_CONFIRMATION_WAIT_TIMED_OUT_PORT,
      baseUrl: MANUAL_CONFIRMATION_WAIT_TIMED_OUT_BASE_URL,
      requestId: "avanza_manual_confirmation_wait_bridge_smoke_timed_out_001",
      expectedStatus: "timed_out",
      expectedHttpStatus: 200,
      expectedOk: false,
      riskFlag: "timeout_elapsed",
      safety: "manual wait timeout reported; no brokerResult; no mutation",
    });

    await assertManualConfirmationWaitMode({
      matrixRows,
      mode: "final_confirm_visible_read_only",
      port: MANUAL_CONFIRMATION_WAIT_FINAL_VISIBLE_PORT,
      baseUrl: MANUAL_CONFIRMATION_WAIT_FINAL_VISIBLE_BASE_URL,
      requestId:
        "avanza_manual_confirmation_wait_bridge_smoke_final_visible_001",
      expectedStatus: "waiting_for_manual_confirmation",
      expectedHttpStatus: 200,
      expectedOk: true,
      riskFlag: "final_confirm_visible_read_only",
      safety: "Bekräfta visibility read-only; no click; no brokerResult",
    });

    await assertManualConfirmationWaitMode({
      matrixRows,
      mode: "blocked_final_confirm_attempt",
      port: MANUAL_CONFIRMATION_WAIT_FINAL_CLICK_PORT,
      baseUrl: MANUAL_CONFIRMATION_WAIT_FINAL_CLICK_BASE_URL,
      requestId:
        "avanza_manual_confirmation_wait_bridge_smoke_final_click_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "final_confirm_clicked_by_agent_or_attempted",
      safety: "Bekräfta attempt blocked; no brokerResult",
    });

    await assertManualConfirmationWaitMode({
      matrixRows,
      mode: "blocked_keyboard_submit",
      port: MANUAL_CONFIRMATION_WAIT_KEYBOARD_PORT,
      baseUrl: MANUAL_CONFIRMATION_WAIT_KEYBOARD_BASE_URL,
      requestId:
        "avanza_manual_confirmation_wait_bridge_smoke_keyboard_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "keyboard_submit_detected",
      safety: "keyboard submit blocked; no brokerResult",
    });

    await assertManualConfirmationWaitMode({
      matrixRows,
      mode: "blocked_unexpected_broker_result",
      port: MANUAL_CONFIRMATION_WAIT_BROKER_RESULT_PORT,
      baseUrl: MANUAL_CONFIRMATION_WAIT_BROKER_RESULT_BASE_URL,
      requestId:
        "avanza_manual_confirmation_wait_bridge_smoke_broker_result_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "broker_result_detected_unexpectedly",
      safety: "unexpected brokerResult blocked; no capture created",
    });

    await assertManualConfirmationWaitMode({
      matrixRows,
      mode: "blocked_trade_mutation",
      port: MANUAL_CONFIRMATION_WAIT_TRADE_MUTATION_PORT,
      baseUrl: MANUAL_CONFIRMATION_WAIT_TRADE_MUTATION_BASE_URL,
      requestId:
        "avanza_manual_confirmation_wait_bridge_smoke_trade_mutation_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "trade_mutation_detected_unexpectedly",
      safety: "unexpected trade mutation blocked; no local/DB write",
    });

    await assertManualConfirmationWaitMode({
      matrixRows,
      mode: "blocked_sensitive",
      port: MANUAL_CONFIRMATION_WAIT_SENSITIVE_PORT,
      baseUrl: MANUAL_CONFIRMATION_WAIT_SENSITIVE_BASE_URL,
      requestId:
        "avanza_manual_confirmation_wait_bridge_smoke_sensitive_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "sensitive_data_detected",
      safety: "sensitive data blocked; no browser actions; no brokerResult",
    });

    await assertManualConfirmationWaitMode({
      matrixRows,
      mode: "confirmation_not_ready",
      port: MANUAL_CONFIRMATION_WAIT_NOT_READY_PORT,
      baseUrl: MANUAL_CONFIRMATION_WAIT_NOT_READY_BASE_URL,
      requestId:
        "avanza_manual_confirmation_wait_bridge_smoke_not_ready_001",
      expectedStatus: "confirmation_not_ready",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "confirmation_not_ready",
      safety: "review-click precondition blocked; no wait loop; no brokerResult",
    });

    await assertBrokerConfirmationCaptureMode({
      matrixRows,
      mode: "confirmation_captured_filled",
      port: BROKER_CONFIRMATION_CAPTURE_FILLED_PORT,
      baseUrl: BROKER_CONFIRMATION_CAPTURE_FILLED_BASE_URL,
      requestId: "avanza_broker_confirmation_capture_smoke_filled_001",
      expectedStatus: "confirmation_captured",
      expectedHttpStatus: 200,
      expectedOk: true,
      safety:
        "synthetic filled capture only; no BrokerExecutionResult; no execution record",
    });

    await assertBrokerConfirmationCaptureMode({
      matrixRows,
      mode: "confirmation_captured_filled",
      port: BROKER_CONFIRMATION_CAPTURE_SELL_PORT,
      baseUrl: BROKER_CONFIRMATION_CAPTURE_SELL_BASE_URL,
      requestId: "avanza_broker_confirmation_capture_smoke_sell_001",
      expectedStatus: "confirmation_captured",
      expectedHttpStatus: 200,
      expectedOk: true,
      payloadOverrides: { action: "sell" },
      safety:
        "synthetic sell capture only; no BrokerExecutionResult; no execution record",
    });

    await assertBrokerConfirmationCaptureMode({
      matrixRows,
      mode: "confirmation_partial_placed",
      port: BROKER_CONFIRMATION_CAPTURE_PARTIAL_PORT,
      baseUrl: BROKER_CONFIRMATION_CAPTURE_PARTIAL_BASE_URL,
      requestId: "avanza_broker_confirmation_capture_smoke_partial_001",
      expectedStatus: "confirmation_partial",
      expectedHttpStatus: 200,
      expectedOk: false,
      riskFlag: "order_placed_not_filled",
      safety: "placed-not-filled reported; no BrokerExecutionResult",
    });

    await assertBrokerConfirmationCaptureMode({
      matrixRows,
      mode: "confirmation_mismatch_quantity",
      port: BROKER_CONFIRMATION_CAPTURE_QUANTITY_MISMATCH_PORT,
      baseUrl: BROKER_CONFIRMATION_CAPTURE_QUANTITY_MISMATCH_BASE_URL,
      requestId:
        "avanza_broker_confirmation_capture_smoke_quantity_mismatch_001",
      expectedStatus: "confirmation_mismatch",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "quantity_mismatch",
      safety: "quantity mismatch blocked; no BrokerExecutionResult",
    });

    await assertBrokerConfirmationCaptureMode({
      matrixRows,
      mode: "confirmation_mismatch_price",
      port: BROKER_CONFIRMATION_CAPTURE_PRICE_MISMATCH_PORT,
      baseUrl: BROKER_CONFIRMATION_CAPTURE_PRICE_MISMATCH_BASE_URL,
      requestId: "avanza_broker_confirmation_capture_smoke_price_mismatch_001",
      expectedStatus: "confirmation_mismatch",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "price_mismatch",
      safety: "price mismatch blocked; no BrokerExecutionResult",
    });

    await assertBrokerConfirmationCaptureMode({
      matrixRows,
      mode: "confirmation_rejected",
      port: BROKER_CONFIRMATION_CAPTURE_REJECTED_PORT,
      baseUrl: BROKER_CONFIRMATION_CAPTURE_REJECTED_BASE_URL,
      requestId: "avanza_broker_confirmation_capture_smoke_rejected_001",
      expectedStatus: "confirmation_rejected_or_cancelled",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "order_rejected",
      safety: "rejected status reported; no BrokerExecutionResult",
    });

    await assertBrokerConfirmationCaptureMode({
      matrixRows,
      mode: "blocked_broker_result_attempt",
      port: BROKER_CONFIRMATION_CAPTURE_BROKER_RESULT_PORT,
      baseUrl: BROKER_CONFIRMATION_CAPTURE_BROKER_RESULT_BASE_URL,
      requestId: "avanza_broker_confirmation_capture_smoke_broker_result_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "broker_result_creation_attempted",
      safety: "BrokerExecutionResult attempt blocked; no record persisted",
    });

    await assertBrokerConfirmationCaptureMode({
      matrixRows,
      mode: "blocked_trade_mutation_attempt",
      port: BROKER_CONFIRMATION_CAPTURE_TRADE_MUTATION_PORT,
      baseUrl: BROKER_CONFIRMATION_CAPTURE_TRADE_MUTATION_BASE_URL,
      requestId: "avanza_broker_confirmation_capture_smoke_trade_mutation_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "trade_mutation_attempted",
      safety: "trade mutation attempt blocked; no local/DB write",
    });

    await assertBrokerConfirmationCaptureMode({
      matrixRows,
      mode: "confirmation_page_not_found",
      port: BROKER_CONFIRMATION_CAPTURE_PAGE_NOT_FOUND_PORT,
      baseUrl: BROKER_CONFIRMATION_CAPTURE_PAGE_NOT_FOUND_BASE_URL,
      requestId: "avanza_broker_confirmation_capture_smoke_page_missing_001",
      expectedStatus: "confirmation_page_not_found",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "confirmation_page_missing",
      safety: "missing confirmation page blocked; no BrokerExecutionResult",
    });

    await assertBrokerConfirmationCaptureMode({
      matrixRows,
      mode: "blocked_sensitive",
      port: BROKER_CONFIRMATION_CAPTURE_SENSITIVE_PORT,
      baseUrl: BROKER_CONFIRMATION_CAPTURE_SENSITIVE_BASE_URL,
      requestId: "avanza_broker_confirmation_capture_smoke_sensitive_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      riskFlag: "sensitive_data_detected",
      safety: "sensitive data blocked; no browser actions; no brokerResult",
    });

    await assertBrokerExecutionEligibilityMode({
      matrixRows,
      mode: "eligible_filled",
      port: BROKER_EXECUTION_ELIGIBILITY_FILLED_PORT,
      baseUrl: BROKER_EXECUTION_ELIGIBILITY_FILLED_BASE_URL,
      requestId: "avanza_broker_execution_result_eligibility_smoke_filled_001",
      expectedStatus: "eligible",
      expectedHttpStatus: 200,
      expectedOk: true,
      safety: "eligible synthetic filled evidence; no BrokerExecutionResult",
    });

    await assertBrokerExecutionEligibilityMode({
      matrixRows,
      mode: "partial_placed",
      port: BROKER_EXECUTION_ELIGIBILITY_PARTIAL_PORT,
      baseUrl: BROKER_EXECUTION_ELIGIBILITY_PARTIAL_BASE_URL,
      requestId: "avanza_broker_execution_result_eligibility_smoke_placed_001",
      expectedStatus: "partial_only",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "capture_partial",
      safety: "placed evidence separated from filled execution",
    });

    await assertBrokerExecutionEligibilityMode({
      matrixRows,
      mode: "partial_partially_filled",
      port: BROKER_EXECUTION_ELIGIBILITY_PARTIAL_FILL_PORT,
      baseUrl: BROKER_EXECUTION_ELIGIBILITY_PARTIAL_FILL_BASE_URL,
      requestId:
        "avanza_broker_execution_result_eligibility_smoke_partial_fill_001",
      expectedStatus: "partial_only",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "capture_partial",
      safety: "partial fill reported for manual follow-up; no result",
    });

    await assertBrokerExecutionEligibilityMode({
      matrixRows,
      mode: "blocked_mismatch",
      port: BROKER_EXECUTION_ELIGIBILITY_MISMATCH_PORT,
      baseUrl: BROKER_EXECUTION_ELIGIBILITY_MISMATCH_BASE_URL,
      requestId:
        "avanza_broker_execution_result_eligibility_smoke_mismatch_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "capture_mismatch",
      safety: "mismatched capture blocked; no BrokerExecutionResult",
    });

    await assertBrokerExecutionEligibilityMode({
      matrixRows,
      mode: "blocked_missing_price",
      port: BROKER_EXECUTION_ELIGIBILITY_MISSING_PRICE_PORT,
      baseUrl: BROKER_EXECUTION_ELIGIBILITY_MISSING_PRICE_BASE_URL,
      requestId:
        "avanza_broker_execution_result_eligibility_smoke_missing_price_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "missing_price",
      safety: "missing price evidence blocked; no execution record",
    });

    await assertBrokerExecutionEligibilityMode({
      matrixRows,
      mode: "blocked_sensitive",
      port: BROKER_EXECUTION_ELIGIBILITY_SENSITIVE_PORT,
      baseUrl: BROKER_EXECUTION_ELIGIBILITY_SENSITIVE_BASE_URL,
      requestId:
        "avanza_broker_execution_result_eligibility_smoke_sensitive_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "sensitive_data_detected",
      safety: "sensitive evidence blocked; no Supabase write",
    });

    await assertBrokerExecutionEligibilityMode({
      matrixRows,
      mode: "blocked_broker_result_attempt",
      port: BROKER_EXECUTION_ELIGIBILITY_BROKER_RESULT_PORT,
      baseUrl: BROKER_EXECUTION_ELIGIBILITY_BROKER_RESULT_BASE_URL,
      requestId:
        "avanza_broker_execution_result_eligibility_smoke_broker_result_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "broker_result_attempt_detected",
      safety: "broker-result attempt blocked by eligibility gate",
    });

    await assertBrokerExecutionEligibilityMode({
      matrixRows,
      mode: "blocked_trade_mutation_attempt",
      port: BROKER_EXECUTION_ELIGIBILITY_TRADE_MUTATION_PORT,
      baseUrl: BROKER_EXECUTION_ELIGIBILITY_TRADE_MUTATION_BASE_URL,
      requestId:
        "avanza_broker_execution_result_eligibility_smoke_trade_mutation_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "trade_mutation_attempt_detected",
      safety: "trade-mutation attempt blocked by eligibility gate",
    });

    await assertBrokerExecutionEligibilityMode({
      matrixRows,
      mode: "duplicate_risk",
      port: BROKER_EXECUTION_ELIGIBILITY_DUPLICATE_PORT,
      baseUrl: BROKER_EXECUTION_ELIGIBILITY_DUPLICATE_BASE_URL,
      requestId:
        "avanza_broker_execution_result_eligibility_smoke_duplicate_001",
      expectedStatus: "duplicate_risk",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "duplicate_fingerprint_detected",
      safety: "duplicate fingerprint risk reported; no result",
    });

    await assertBrokerExecutionPreviewMode({
      matrixRows,
      mode: "preview_available_filled",
      port: BROKER_EXECUTION_PREVIEW_FILLED_PORT,
      baseUrl: BROKER_EXECUTION_PREVIEW_FILLED_BASE_URL,
      requestId: "avanza_broker_execution_result_preview_smoke_filled_001",
      expectedStatus: "preview_available",
      expectedHttpStatus: 200,
      expectedOk: true,
      safety: "preview-only filled mapping; no real BrokerExecutionResult",
    });

    await assertBrokerExecutionPreviewMode({
      matrixRows,
      mode: "preview_available_missing_optional",
      port: BROKER_EXECUTION_PREVIEW_MISSING_OPTIONAL_PORT,
      baseUrl: BROKER_EXECUTION_PREVIEW_MISSING_OPTIONAL_BASE_URL,
      requestId:
        "avanza_broker_execution_result_preview_smoke_missing_optional_001",
      expectedStatus: "preview_available",
      expectedHttpStatus: 200,
      expectedOk: true,
      expectedWarning: "Broker fees/courtage are missing.",
      safety: "missing optional evidence warns only; no execution record",
    });

    await assertBrokerExecutionPreviewMode({
      matrixRows,
      mode: "partial_only_placed",
      port: BROKER_EXECUTION_PREVIEW_PARTIAL_PORT,
      baseUrl: BROKER_EXECUTION_PREVIEW_PARTIAL_BASE_URL,
      requestId: "avanza_broker_execution_result_preview_smoke_partial_001",
      expectedStatus: "partial_only",
      expectedHttpStatus: 400,
      expectedOk: false,
      safety: "placed evidence separated from filled preview",
    });

    await assertBrokerExecutionPreviewMode({
      matrixRows,
      mode: "blocked_mismatch",
      port: BROKER_EXECUTION_PREVIEW_MISMATCH_PORT,
      baseUrl: BROKER_EXECUTION_PREVIEW_MISMATCH_BASE_URL,
      requestId: "avanza_broker_execution_result_preview_smoke_mismatch_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      safety: "mismatched evidence blocked; no preview shape",
    });

    await assertBrokerExecutionPreviewMode({
      matrixRows,
      mode: "blocked_sensitive",
      port: BROKER_EXECUTION_PREVIEW_SENSITIVE_PORT,
      baseUrl: BROKER_EXECUTION_PREVIEW_SENSITIVE_BASE_URL,
      requestId: "avanza_broker_execution_result_preview_smoke_sensitive_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      safety: "sensitive evidence blocked; no Supabase write",
    });

    await assertBrokerExecutionPreviewMode({
      matrixRows,
      mode: "duplicate_risk",
      port: BROKER_EXECUTION_PREVIEW_DUPLICATE_PORT,
      baseUrl: BROKER_EXECUTION_PREVIEW_DUPLICATE_BASE_URL,
      requestId: "avanza_broker_execution_result_preview_smoke_duplicate_001",
      expectedStatus: "duplicate_risk",
      expectedHttpStatus: 400,
      expectedOk: false,
      safety: "duplicate fingerprint blocks preview",
    });

    await assertExecutionRecordEligibilityMode({
      matrixRows,
      mode: "eligible_filled",
      port: EXECUTION_RECORD_ELIGIBILITY_FILLED_PORT,
      baseUrl: EXECUTION_RECORD_ELIGIBILITY_FILLED_BASE_URL,
      requestId: "execution_record_eligibility_smoke_filled_001",
      expectedStatus: "eligible",
      expectedHttpStatus: 200,
      expectedOk: true,
      safety: "eligible synthetic filled candidate; no execution record",
    });

    await assertExecutionRecordEligibilityMode({
      matrixRows,
      mode: "blocked_preview_only",
      port: EXECUTION_RECORD_ELIGIBILITY_PREVIEW_PORT,
      baseUrl: EXECUTION_RECORD_ELIGIBILITY_PREVIEW_BASE_URL,
      requestId: "execution_record_eligibility_smoke_preview_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "broker_result_preview_only",
      safety: "preview-only candidate blocked; no execution record",
    });

    await assertExecutionRecordEligibilityMode({
      matrixRows,
      mode: "blocked_missing_price",
      port: EXECUTION_RECORD_ELIGIBILITY_MISSING_PRICE_PORT,
      baseUrl: EXECUTION_RECORD_ELIGIBILITY_MISSING_PRICE_BASE_URL,
      requestId: "execution_record_eligibility_smoke_missing_price_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "missing_price",
      safety: "missing price blocked; no local/DB write",
    });

    await assertExecutionRecordEligibilityMode({
      matrixRows,
      mode: "blocked_not_filled",
      port: EXECUTION_RECORD_ELIGIBILITY_NOT_FILLED_PORT,
      baseUrl: EXECUTION_RECORD_ELIGIBILITY_NOT_FILLED_BASE_URL,
      requestId: "execution_record_eligibility_smoke_not_filled_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "broker_result_not_filled",
      safety: "not-filled candidate blocked; no execution record",
    });

    await assertExecutionRecordEligibilityMode({
      matrixRows,
      mode: "blocked_sensitive",
      port: EXECUTION_RECORD_ELIGIBILITY_SENSITIVE_PORT,
      baseUrl: EXECUTION_RECORD_ELIGIBILITY_SENSITIVE_BASE_URL,
      requestId: "execution_record_eligibility_smoke_sensitive_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "sensitive_data_detected",
      safety: "sensitive/raw evidence blocked; no Supabase write",
    });

    await assertExecutionRecordEligibilityMode({
      matrixRows,
      mode: "blocked_supabase_write_attempt",
      port: EXECUTION_RECORD_ELIGIBILITY_SUPABASE_PORT,
      baseUrl: EXECUTION_RECORD_ELIGIBILITY_SUPABASE_BASE_URL,
      requestId: "execution_record_eligibility_smoke_supabase_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "supabase_write_attempted",
      safety: "Supabase-write attempt blocked by eligibility gate",
    });

    await assertExecutionRecordEligibilityMode({
      matrixRows,
      mode: "blocked_trade_mutation_attempt",
      port: EXECUTION_RECORD_ELIGIBILITY_TRADE_PORT,
      baseUrl: EXECUTION_RECORD_ELIGIBILITY_TRADE_BASE_URL,
      requestId: "execution_record_eligibility_smoke_trade_001",
      expectedStatus: "blocked",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "trade_mutation_attempted",
      safety: "trade-mutation attempt blocked by eligibility gate",
    });

    await assertExecutionRecordEligibilityMode({
      matrixRows,
      mode: "duplicate_source_fingerprint",
      port: EXECUTION_RECORD_ELIGIBILITY_DUP_SOURCE_PORT,
      baseUrl: EXECUTION_RECORD_ELIGIBILITY_DUP_SOURCE_BASE_URL,
      requestId: "execution_record_eligibility_smoke_dup_source_001",
      expectedStatus: "duplicate_risk",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "duplicate_source_fingerprint",
      safety: "duplicate source fingerprint reported; no execution record",
    });

    await assertExecutionRecordEligibilityMode({
      matrixRows,
      mode: "duplicate_broker_reference",
      port: EXECUTION_RECORD_ELIGIBILITY_DUP_BROKER_PORT,
      baseUrl: EXECUTION_RECORD_ELIGIBILITY_DUP_BROKER_BASE_URL,
      requestId: "execution_record_eligibility_smoke_dup_broker_001",
      expectedStatus: "duplicate_risk",
      expectedHttpStatus: 400,
      expectedOk: false,
      expectedReason: "duplicate_broker_reference",
      safety: "duplicate broker reference reported; no execution record",
    });

    const run = await postJson("/run", buildRunPayload());

    assert(run.status === 200, "Valid run should return HTTP 200.");
    assert(run.body.accepted === true, "Valid run should be accepted.");
    assert(run.body.result?.status === "unknown", "Run result should be unknown.");
    assert(
      Array.isArray(run.body.result?.progressEvents) &&
        run.body.result.progressEvents.length >= 3,
      "Run result should include echo progress events.",
    );
    assert(
      typeof run.body.result?.brokerResult === "undefined",
      "Run result must not include brokerResult.",
    );
    assert(
      run.body.mockOrderPageAvailable === true,
      "Run should report mock order page metadata available.",
    );
    assert(
      run.body.mockOrderFillPlanValid === true,
      "Run should include a valid mock order fill plan.",
    );
    assert(
      run.body.mockOrderPageUrl?.startsWith("/mock-broker/order?"),
      "Run should include a relative mock order page URL.",
    );
    assert(
      run.body.mockOrderPageUrl.includes("ticker=QA.SMOKE"),
      "Mock order page URL should include the smoke ticker.",
    );
    assert(
      run.body.mockOrderFillPlan?.values?.some(
        (value) => value.fieldKey === "ticker" && value.value === "QA.SMOKE",
      ),
      "Mock order fill plan should include the smoke ticker.",
    );
    assert(
      Array.isArray(run.body.mockOrderFillPlanErrors) &&
        run.body.mockOrderFillPlanErrors.length === 0,
      "Valid mock order fill plan should not include errors.",
    );
    assert(
      run.body.mockAgentRunAttempted === undefined ||
        run.body.mockAgentRunAttempted === false,
      "Default run must not attempt the mock agent runner.",
    );

    const explicitMockAgentRun = await postJson("/run", {
      ...buildRunPayload(),
      enableMockAgentRun: true,
      mockPageBaseUrl: "https://example.com",
    });

    assert(
      explicitMockAgentRun.status === 200,
      "Explicit mock-agent run request should keep valid dry-run HTTP 200.",
    );
    assert(
      explicitMockAgentRun.body.accepted === true,
      "Explicit mock-agent run request should keep valid dry-run accepted.",
    );
    assert(
      explicitMockAgentRun.body.mockAgentRunAttempted === true,
      "Explicit mock-agent run should report attempted.",
    );
    assert(
      explicitMockAgentRun.body.mockAgentRunOk === false,
      "Non-local mockPageBaseUrl should fail the mock-agent run safely.",
    );
    assert(
      Array.isArray(explicitMockAgentRun.body.mockAgentRunErrors) &&
        explicitMockAgentRun.body.mockAgentRunErrors.length > 0,
      "Failed explicit mock-agent run should include errors.",
    );
    assert(
      typeof explicitMockAgentRun.body.result?.brokerResult === "undefined",
      "Explicit mock-agent run must not include brokerResult.",
    );

    const invalidRun = await postJson("/run", {
      version: CONTRACT_VERSION,
      dryRun: false,
    });

    assert(invalidRun.status === 400, "Invalid run should return HTTP 400.");
    assert(invalidRun.body.accepted === false, "Invalid run should not be accepted.");
    assert(
      Array.isArray(invalidRun.body.errors) && invalidRun.body.errors.length > 0,
      "Invalid run should include errors.",
    );

    const cancel = await postJson("/cancel", {
      version: CONTRACT_VERSION,
      requestId: "avanza_agent_request_smoke_001",
      reason: "Smoke test finished.",
    });

    assert(cancel.status === 200, "Cancel should return HTTP 200.");
    assert(cancel.body.cancelled === true, "Cancel should be acknowledged.");

    printMatrixSummary(matrixRows);
    console.log("Localhost bridge stub smoke test passed.");
  } finally {
    await stopBridge(instrumentPageBlockedSensitiveBridge);
    await stopBridge(instrumentPageBlockedConfirmBridge);
    await stopBridge(instrumentPageBlockedOrderBridge);
    await stopBridge(instrumentPageMismatchBridge);
    await stopBridge(instrumentPageBuySellBridge);
    await stopBridge(instrumentPageIdentifiedBridge);
    await stopBridge(instrumentBlockedOrderFlowBridge);
    await stopBridge(instrumentAmbiguousCurrencyBridge);
    await stopBridge(instrumentRejectedTickerBridge);
    await stopBridge(instrumentVerifiedBridge);
    await stopBridge(searchBlockedOrderFlowBridge);
    await stopBridge(searchBlockedSensitiveBridge);
    await stopBridge(searchNoMatchBridge);
    await stopBridge(searchAmbiguousBridge);
    await stopBridge(searchExactBridge);
    await stopBridge(sessionBlockedBridge);
    await stopBridge(sessionLoginBridge);
    await stopBridge(sessionReadyBridge);
    await stopBridge(skeletonBridge);
    await stopBridge(mockOnlyBridge);
    await stopBridge(defaultBridge);
  }
}

runSmoke().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
