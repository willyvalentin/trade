import type { TradeExecutionPayload } from "@/lib/execution-payload";
import type { TradeExitExecutionPayload } from "@/lib/exit-execution-payload";

export type BrokerFillCaptureSide = "BUY" | "SELL";

export type BrokerFillCaptureAllowedAction =
  | "read_broker_confirmation_page_after_manual_confirmation"
  | "extract_broker_fill_fields"
  | "extract_broker_exit_fields"
  | "return_to_ture"
  | "fill_ture_broker_fill_confirmation_fields"
  | "fill_ture_broker_exit_confirmation_fields"
  | "stop_for_human_review_on_mismatch_or_uncertainty";

export type BrokerFillCaptureForbiddenAction =
  | "click_avanza_buy"
  | "click_avanza_sell"
  | "submit_broker_order"
  | "modify_order_quantity_without_user_approval"
  | "modify_order_price_without_user_approval"
  | "handle_credentials"
  | "bypass_hard_stops"
  | "guess_missing_broker_values"
  | "create_ture_trade_when_required_fields_are_missing"
  | "close_ture_trade_when_required_fields_are_missing";

export type BrokerFillCaptureField = {
  field_id: string;
  label: string;
  ture_field: string;
  broker_source_hint: string;
  required: boolean;
  value_type: "status" | "number" | "boolean" | "text" | "timestamp";
  expected_value?: string | number | boolean;
  notes: string[];
};

export type BrokerFillCaptureValidationRule = {
  rule_id: string;
  label: string;
  description: string;
  severity: "warning" | "critical";
  applies_to: BrokerFillCaptureSide[];
};

export type BrokerFillCaptureHardStop = {
  hard_stop_id: string;
  label: string;
  description: string;
  severity: "critical";
  applies_to: BrokerFillCaptureSide[];
  blocks_agent_capture: true;
  remediation: string;
};

export type BrokerFillCaptureAgentSpec = {
  spec_id: string;
  spec_version: "1.0";
  spec_kind: "broker_fill_capture_agent_spec";
  created_at: string;
  side: BrokerFillCaptureSide;
  broker: "AVANZA";
  mode: "post_manual_confirmation_recordkeeping_only";
  source: "add_trade_modal" | "close_trade_modal";
  handoff_session_id: string;
  source_payload_id: string;
  source_payload_fingerprint: string;
  expected_instrument: {
    ticker: string;
    company_name: string | null;
  };
  expected_order: {
    side: BrokerFillCaptureSide;
    planned_quantity: number | null;
    planned_price_reference: number | null;
    currency: "USD";
  };
  capture_target:
    | "ture_broker_fill_confirmation"
    | "ture_broker_exit_confirmation";
  required_fields: BrokerFillCaptureField[];
  optional_fields: BrokerFillCaptureField[];
  validation_rules: BrokerFillCaptureValidationRule[];
  hard_stops: BrokerFillCaptureHardStop[];
  allowed_agent_actions: BrokerFillCaptureAllowedAction[];
  forbidden_agent_actions: BrokerFillCaptureForbiddenAction[];
  required_human_actions: string[];
  safety_attestations: {
    broker_order_must_already_be_manually_confirmed: true;
    final_avanza_buy_sell_confirmation_is_human_only: true;
    no_order_submission_allowed: true;
    no_broker_automation_allowed_by_this_spec: true;
    no_credentials_handling_allowed: true;
  };
  agent_instructions: string[];
};

type BuildBuyBrokerFillCaptureAgentSpecInput = {
  payload: TradeExecutionPayload;
  companyName?: string | null;
  createdAt?: string;
};

type BuildSellBrokerFillCaptureAgentSpecInput = {
  payload: TradeExitExecutionPayload;
  createdAt?: string;
};

const forbiddenAgentActions: BrokerFillCaptureForbiddenAction[] = [
  "click_avanza_buy",
  "click_avanza_sell",
  "submit_broker_order",
  "modify_order_quantity_without_user_approval",
  "modify_order_price_without_user_approval",
  "handle_credentials",
  "bypass_hard_stops",
  "guess_missing_broker_values",
  "create_ture_trade_when_required_fields_are_missing",
  "close_ture_trade_when_required_fields_are_missing",
];

const buyAllowedAgentActions: BrokerFillCaptureAllowedAction[] = [
  "read_broker_confirmation_page_after_manual_confirmation",
  "extract_broker_fill_fields",
  "return_to_ture",
  "fill_ture_broker_fill_confirmation_fields",
  "stop_for_human_review_on_mismatch_or_uncertainty",
];

const sellAllowedAgentActions: BrokerFillCaptureAllowedAction[] = [
  "read_broker_confirmation_page_after_manual_confirmation",
  "extract_broker_exit_fields",
  "return_to_ture",
  "fill_ture_broker_exit_confirmation_fields",
  "stop_for_human_review_on_mismatch_or_uncertainty",
];

function nullableString(value: string | null | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function finitePositiveNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function safeIdPart(value: string | null | undefined) {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function buildSpecId({
  side,
  payloadId,
  createdAt,
}: {
  side: BrokerFillCaptureSide;
  payloadId: string;
  createdAt: string;
}) {
  return `broker_${side.toLowerCase()}_fill_capture_spec_${safeIdPart(
    payloadId,
  )}_${safeIdPart(createdAt)}`;
}

function requiredConfirmationFields(side: BrokerFillCaptureSide) {
  if (side === "BUY") {
    return [
      {
        field_id: "manual_avanza_buy_confirmation",
        label: "Manual Avanza KÖP confirmation",
        ture_field: "manualBrokerConfirmed",
        broker_source_hint:
          "Human must confirm they manually clicked final KÖP in Avanza.",
        required: true,
        value_type: "boolean" as const,
        expected_value: true,
        notes: ["Agent must not click KÖP."],
      },
      {
        field_id: "broker_order_matches_ture_trade_plan",
        label: "Broker order matches Ture trade plan",
        ture_field: "brokerPlanMatches",
        broker_source_hint:
          "Compare broker confirmation details against the Ture buy payload.",
        required: true,
        value_type: "boolean" as const,
        expected_value: true,
        notes: ["Stop for human review on any mismatch."],
      },
    ];
  }

  return [
    {
      field_id: "manual_avanza_sell_confirmation",
      label: "Manual Avanza SÄLJ confirmation",
      ture_field: "userManuallyConfirmedSell",
      broker_source_hint:
        "Human must confirm they manually clicked final SÄLJ in Avanza.",
      required: true,
      value_type: "boolean" as const,
      expected_value: true,
      notes: ["Agent must not click SÄLJ."],
    },
    {
      field_id: "broker_order_matches_ture_position",
      label: "Broker order matches Ture position",
      ture_field: "brokerOrderMatchesTradePlan",
      broker_source_hint:
        "Compare broker confirmation details against the Ture live position.",
      required: true,
      value_type: "boolean" as const,
      expected_value: true,
      notes: ["Stop for human review on any mismatch."],
    },
  ];
}

function validationRules(): BrokerFillCaptureValidationRule[] {
  return [
    {
      rule_id: "status_must_be_filled_or_partially_filled",
      label: "Filled status required",
      description:
        "Broker status must indicate filled or partially filled before Ture recordkeeping continues.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
    },
    {
      rule_id: "price_must_be_positive",
      label: "Positive price required",
      description: "Actual fill or exit price must be a positive number.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
    },
    {
      rule_id: "shares_must_be_positive",
      label: "Positive shares required",
      description: "Actual filled or sold shares must be a positive number.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
    },
    {
      rule_id: "buy_shares_review_if_above_plan",
      label: "Buy quantity above plan requires review",
      description:
        "Actual buy shares should not exceed planned quantity unless a human explicitly reviews the difference.",
      severity: "warning",
      applies_to: ["BUY"],
    },
    {
      rule_id: "sell_shares_must_not_exceed_open_position",
      label: "Sell quantity cannot exceed open position",
      description:
        "Actual sold shares must not exceed the current Ture live position size.",
      severity: "critical",
      applies_to: ["SELL"],
    },
    {
      rule_id: "ticker_side_broker_must_match",
      label: "Ticker, side, and broker must match",
      description:
        "Broker confirmation must match expected ticker, BUY/SELL side, and AVANZA broker.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
    },
    {
      rule_id: "manual_confirmation_required",
      label: "Manual broker confirmation required",
      description:
        "Human final Avanza confirmation and broker plan match confirmation are required.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
    },
  ];
}

function hardStops(): BrokerFillCaptureHardStop[] {
  return [
    {
      hard_stop_id: "missing_broker_confirmation",
      label: "Missing broker confirmation",
      description: "No broker confirmation screen or fill confirmation is available.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_agent_capture: true,
      remediation: "Ask the user to review the broker confirmation manually.",
    },
    {
      hard_stop_id: "missing_broker_status",
      label: "Missing broker status",
      description: "Broker fill or exit status is missing.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_agent_capture: true,
      remediation: "Stop and ask for the actual broker order status.",
    },
    {
      hard_stop_id: "broker_status_not_filled",
      label: "Broker status is not filled",
      description:
        "Broker status is cancelled, rejected, submitted but not filled, or otherwise not filled.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_agent_capture: true,
      remediation: "Do not create or close the Ture trade until Avanza reports a fill.",
    },
    {
      hard_stop_id: "missing_or_invalid_price",
      label: "Missing or invalid price",
      description: "Actual broker fill or exit price is missing or not positive.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_agent_capture: true,
      remediation: "Stop and ask the user for the actual broker price.",
    },
    {
      hard_stop_id: "missing_or_invalid_shares",
      label: "Missing or invalid shares",
      description: "Actual filled or sold shares are missing or not positive.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_agent_capture: true,
      remediation: "Stop and ask the user for the actual broker share quantity.",
    },
    {
      hard_stop_id: "ticker_mismatch",
      label: "Ticker mismatch",
      description: "Broker instrument does not match the expected Ture ticker.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_agent_capture: true,
      remediation: "Stop for human review before entering Ture recordkeeping data.",
    },
    {
      hard_stop_id: "side_mismatch",
      label: "Side mismatch",
      description: "Broker side does not match expected BUY or SELL side.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_agent_capture: true,
      remediation: "Stop for human review before entering Ture recordkeeping data.",
    },
    {
      hard_stop_id: "broker_mismatch",
      label: "Broker mismatch",
      description: "Broker is not AVANZA.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_agent_capture: true,
      remediation: "Stop because this spec only covers Avanza recordkeeping.",
    },
    {
      hard_stop_id: "sell_quantity_exceeds_open_position",
      label: "Sell quantity exceeds open position",
      description: "Actual sold shares exceed the Ture live position size.",
      severity: "critical",
      applies_to: ["SELL"],
      blocks_agent_capture: true,
      remediation: "Stop and ask the user to resolve the position mismatch.",
    },
    {
      hard_stop_id: "manual_avanza_confirmation_missing",
      label: "Manual Avanza confirmation missing",
      description: "The user has not manually confirmed final KÖP/SÄLJ in Avanza.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_agent_capture: true,
      remediation: "Do not proceed until the user confirms the final broker action.",
    },
    {
      hard_stop_id: "unsafe_to_continue",
      label: "Unsafe to continue",
      description: "Any security, account, mismatch, or unknown state makes capture unsafe.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_agent_capture: true,
      remediation: "Stop immediately and request human review.",
    },
    {
      hard_stop_id: "unknown_broker_confirmation_ui_state",
      label: "Unknown broker confirmation UI state",
      description: "Broker confirmation UI is unfamiliar, ambiguous, or cannot be verified.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_agent_capture: true,
      remediation: "Stop and ask the user to capture the fields manually.",
    },
  ];
}

function safetyAttestations(): BrokerFillCaptureAgentSpec["safety_attestations"] {
  return {
    broker_order_must_already_be_manually_confirmed: true,
    final_avanza_buy_sell_confirmation_is_human_only: true,
    no_order_submission_allowed: true,
    no_broker_automation_allowed_by_this_spec: true,
    no_credentials_handling_allowed: true,
  };
}

export function buildBuyBrokerFillCaptureAgentSpec({
  payload,
  companyName,
  createdAt,
}: BuildBuyBrokerFillCaptureAgentSpecInput): BrokerFillCaptureAgentSpec {
  const specCreatedAt = createdAt ?? payload.created_at;
  const requiredFields: BrokerFillCaptureField[] = [
    {
      field_id: "broker_status",
      label: "Broker status",
      ture_field: "brokerOrderStatus",
      broker_source_hint: "Avanza order status after manual KÖP confirmation.",
      required: true,
      value_type: "status",
      notes: ["Allowed values are filled or partially_filled."],
    },
    {
      field_id: "actual_fill_price",
      label: "Actual fill price",
      ture_field: "actualFillPriceInput",
      broker_source_hint: "Actual Avanza average fill price.",
      required: true,
      value_type: "number",
      notes: ["Must be greater than zero."],
    },
    {
      field_id: "actual_filled_shares",
      label: "Actual filled shares",
      ture_field: "actualSharesInput",
      broker_source_hint: "Actual Avanza filled share quantity.",
      required: true,
      value_type: "number",
      expected_value: finitePositiveNumber(payload.shares) ?? undefined,
      notes: ["Must be greater than zero."],
    },
    {
      field_id: "broker_reference_note",
      label: "Broker reference / note",
      ture_field: "brokerReferenceNote",
      broker_source_hint: "Avanza order reference, note, or fill detail if available.",
      required: true,
      value_type: "text",
      notes: ["Use a short note if no broker reference is visible."],
    },
    ...requiredConfirmationFields("BUY"),
  ];

  return {
    spec_id: buildSpecId({
      side: "BUY",
      payloadId: payload.payload_id,
      createdAt: specCreatedAt,
    }),
    spec_version: "1.0",
    spec_kind: "broker_fill_capture_agent_spec",
    created_at: specCreatedAt,
    side: "BUY",
    broker: "AVANZA",
    mode: "post_manual_confirmation_recordkeeping_only",
    source: "add_trade_modal",
    handoff_session_id: payload.handoff_session_id,
    source_payload_id: payload.payload_id,
    source_payload_fingerprint: payload.payload_fingerprint,
    expected_instrument: {
      ticker: payload.ticker,
      company_name: nullableString(companyName),
    },
    expected_order: {
      side: "BUY",
      planned_quantity: finitePositiveNumber(payload.shares),
      planned_price_reference: finitePositiveNumber(payload.limit_price),
      currency: "USD",
    },
    capture_target: "ture_broker_fill_confirmation",
    required_fields: requiredFields,
    optional_fields: [
      {
        field_id: "commission",
        label: "Commission / courtage",
        ture_field: "previewCommissionInput",
        broker_source_hint: "Avanza commission or courtage if visible.",
        required: false,
        value_type: "number",
        notes: ["Optional recordkeeping field."],
      },
      {
        field_id: "fx_fee",
        label: "FX fee",
        ture_field: "previewFxFeeInput",
        broker_source_hint: "Avanza FX fee if visible.",
        required: false,
        value_type: "number",
        notes: ["Optional recordkeeping field."],
      },
      {
        field_id: "broker_timestamp",
        label: "Broker timestamp",
        ture_field: "brokerConfirmedAt",
        broker_source_hint: "Broker-reported fill time if visible.",
        required: false,
        value_type: "timestamp",
        notes: ["Use Ture timestamp if broker timestamp is unavailable."],
      },
      {
        field_id: "settlement_currency_info",
        label: "Settlement / currency info",
        ture_field: "screenshotReferenceNote",
        broker_source_hint: "Settlement, currency, or account note if visible.",
        required: false,
        value_type: "text",
        notes: ["Optional context only."],
      },
    ],
    validation_rules: validationRules(),
    hard_stops: hardStops(),
    allowed_agent_actions: buyAllowedAgentActions,
    forbidden_agent_actions: forbiddenAgentActions,
    required_human_actions: [
      "Manually review Avanza buy confirmation.",
      "Manually click final KÖP in Avanza.",
      "Confirm broker order matches the Ture trade plan.",
      "Review captured Ture broker fill fields before creating the Live Day Trade.",
    ],
    safety_attestations: safetyAttestations(),
    agent_instructions: [
      "This spec is for post-KÖP Ture recordkeeping only.",
      "The user must already have manually clicked final KÖP in Avanza.",
      "Extract actual broker fill details and fill the Ture Broker Fill Confirmation fields.",
      "Do not click KÖP, submit orders, handle credentials, or guess missing values.",
      "Stop for human review on any mismatch, missing value, or unknown broker UI state.",
    ],
  };
}

export function buildSellBrokerFillCaptureAgentSpec({
  payload,
  createdAt,
}: BuildSellBrokerFillCaptureAgentSpecInput): BrokerFillCaptureAgentSpec {
  const specCreatedAt = createdAt ?? payload.created_at;
  const requiredFields: BrokerFillCaptureField[] = [
    {
      field_id: "exit_status",
      label: "Exit status",
      ture_field: "exitStatus",
      broker_source_hint: "Avanza order status after manual SÄLJ confirmation.",
      required: true,
      value_type: "status",
      notes: ["Allowed values are filled or partially_filled."],
    },
    {
      field_id: "actual_exit_price",
      label: "Actual exit price",
      ture_field: "exitPrice",
      broker_source_hint: "Actual Avanza average exit price.",
      required: true,
      value_type: "number",
      notes: ["Must be greater than zero."],
    },
    {
      field_id: "actual_sold_shares",
      label: "Actual sold shares",
      ture_field: "actualSoldShares",
      broker_source_hint: "Actual Avanza sold share quantity.",
      required: true,
      value_type: "number",
      expected_value:
        finitePositiveNumber(payload.order_intent.quantity_to_sell) ?? undefined,
      notes: ["Must be greater than zero and not exceed open position size."],
    },
    {
      field_id: "broker_reference_note",
      label: "Broker reference / note",
      ture_field: "brokerReferenceNote",
      broker_source_hint: "Avanza order reference, note, or exit fill detail.",
      required: true,
      value_type: "text",
      notes: ["Use a short note if no broker reference is visible."],
    },
    ...requiredConfirmationFields("SELL"),
  ];

  return {
    spec_id: buildSpecId({
      side: "SELL",
      payloadId: payload.payload_id,
      createdAt: specCreatedAt,
    }),
    spec_version: "1.0",
    spec_kind: "broker_fill_capture_agent_spec",
    created_at: specCreatedAt,
    side: "SELL",
    broker: "AVANZA",
    mode: "post_manual_confirmation_recordkeeping_only",
    source: "close_trade_modal",
    handoff_session_id: payload.handoff_session_id,
    source_payload_id: payload.payload_id,
    source_payload_fingerprint: payload.payload_fingerprint,
    expected_instrument: {
      ticker: payload.exit_context.ticker,
      company_name: payload.exit_context.company_name,
    },
    expected_order: {
      side: "SELL",
      planned_quantity: finitePositiveNumber(payload.order_intent.quantity_to_sell),
      planned_price_reference: finitePositiveNumber(
        payload.order_intent.price_reference,
      ),
      currency: payload.order_intent.currency,
    },
    capture_target: "ture_broker_exit_confirmation",
    required_fields: requiredFields,
    optional_fields: [
      {
        field_id: "exit_commission",
        label: "Exit commission / courtage",
        ture_field: "exitCommission",
        broker_source_hint: "Avanza exit commission or courtage if visible.",
        required: false,
        value_type: "number",
        notes: ["Optional recordkeeping field."],
      },
      {
        field_id: "exit_fx_fee",
        label: "Exit FX fee",
        ture_field: "exitFxFee",
        broker_source_hint: "Avanza exit FX fee if visible.",
        required: false,
        value_type: "number",
        notes: ["Optional recordkeeping field."],
      },
      {
        field_id: "broker_timestamp",
        label: "Broker timestamp",
        ture_field: "broker_confirmed_at",
        broker_source_hint: "Broker-reported exit fill time if visible.",
        required: false,
        value_type: "timestamp",
        notes: ["Use Ture timestamp if broker timestamp is unavailable."],
      },
      {
        field_id: "settlement_currency_info",
        label: "Settlement / currency info",
        ture_field: "brokerReferenceNote",
        broker_source_hint: "Settlement, currency, or account note if visible.",
        required: false,
        value_type: "text",
        notes: ["Optional context only."],
      },
    ],
    validation_rules: validationRules(),
    hard_stops: hardStops(),
    allowed_agent_actions: sellAllowedAgentActions,
    forbidden_agent_actions: forbiddenAgentActions,
    required_human_actions: [
      "Manually review Avanza sell confirmation.",
      "Manually click final SÄLJ in Avanza.",
      "Confirm broker order matches the Ture live position.",
      "Review captured Ture broker exit fields before closing the trade in Ture.",
    ],
    safety_attestations: safetyAttestations(),
    agent_instructions: [
      "This spec is for post-SÄLJ Ture recordkeeping only.",
      "The user must already have manually clicked final SÄLJ in Avanza.",
      "Extract actual broker exit details and fill the Ture Broker Exit Confirmation fields.",
      "Do not click SÄLJ, submit orders, handle credentials, or guess missing values.",
      "Stop for human review on any mismatch, missing value, or unknown broker UI state.",
    ],
  };
}

export function brokerFillCaptureAgentSpecJson(
  spec: BrokerFillCaptureAgentSpec,
) {
  return JSON.stringify(spec, null, 2);
}
