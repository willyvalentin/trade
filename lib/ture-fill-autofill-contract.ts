import type { BrokerFillCaptureAgentSpec } from "@/lib/broker-fill-capture-agent-spec";
import type { TradeExecutionPayload } from "@/lib/execution-payload";
import type { TradeExitExecutionPayload } from "@/lib/exit-execution-payload";

export type TureFillAutofillSide = "BUY" | "SELL";

export type TureFillAutofillTargetForm =
  | "broker_fill_confirmation"
  | "broker_exit_confirmation";

export type TureFillAutofillAllowedAction =
  | "fill_ture_broker_status_field"
  | "fill_ture_actual_price_field"
  | "fill_ture_actual_shares_field"
  | "fill_ture_broker_reference_note_field"
  | "fill_optional_fee_or_timestamp_fields_if_captured_exactly"
  | "set_manual_confirmation_checkbox_if_user_confirmed_avanza"
  | "set_plan_or_position_match_checkbox_if_verified"
  | "stop_for_human_review_on_mismatch_or_uncertainty";

export type TureFillAutofillForbiddenAction =
  | "click_avanza_buy"
  | "click_avanza_sell"
  | "submit_broker_order"
  | "handle_credentials"
  | "guess_missing_broker_values"
  | "alter_ture_planned_quantity_price_stop_or_target_to_force_match"
  | "bypass_hard_stops"
  | "create_live_day_trade_automatically"
  | "close_trade_automatically"
  | "save_ture_forms_automatically"
  | "mark_confirmation_checkboxes_true_without_evidence";

export type TureFillAutofillReviewRequirement =
  | "human_review_before_ture_save"
  | "confirm_manual_avanza_confirmation_evidence"
  | "confirm_broker_status_is_filled_or_partially_filled"
  | "confirm_ticker_side_broker_match"
  | "confirm_price_and_shares_match_broker_fill"
  | "confirm_no_broker_values_were_guessed"
  | "confirm_capture_confidence_meets_threshold";

export type TureFillAutofillField = {
  field_id: string;
  label: string;
  target_form: TureFillAutofillTargetForm;
  ture_state_key: string;
  source: "captured_broker_data" | "ture_context" | "capture_spec" | "human_confirmation";
  source_path: string;
  required: boolean;
  editable_by_agent: boolean;
  review_only: boolean;
  value_type: "status" | "number" | "boolean" | "text" | "timestamp";
  expected_value?: string | number | boolean;
  validation_rule_ids: string[];
  hard_stop_ids: string[];
  notes: string[];
};

export type TureFillAutofillValidationRule = {
  rule_id: string;
  label: string;
  description: string;
  severity: "warning" | "critical";
  applies_to: TureFillAutofillSide[];
  requires_human_review: boolean;
};

export type TureFillAutofillHardStop = {
  hard_stop_id: string;
  label: string;
  description: string;
  severity: "critical";
  applies_to: TureFillAutofillSide[];
  blocks_autofill: true;
  blocks_save: true;
  remediation: string;
};

export type TureFillAutofillContract = {
  contract_id: string;
  contract_version: "1.0";
  contract_kind: "ture_fill_autofill_contract";
  created_at: string;
  side: TureFillAutofillSide;
  broker: "AVANZA";
  mode: "ture_recordkeeping_autofill_only";
  source: "add_trade_modal" | "close_trade_modal";
  target_form: TureFillAutofillTargetForm;
  handoff_session_id: string;
  source_payload_id: string;
  source_payload_fingerprint: string;
  capture_spec_id: string | null;
  capture_spec_version: string | null;
  confidence_threshold: "medium";
  required_autofill_fields: TureFillAutofillField[];
  optional_autofill_fields: TureFillAutofillField[];
  review_only_context_fields: TureFillAutofillField[];
  validation_rules: TureFillAutofillValidationRule[];
  hard_stops: TureFillAutofillHardStop[];
  allowed_agent_actions: TureFillAutofillAllowedAction[];
  forbidden_agent_actions: TureFillAutofillForbiddenAction[];
  review_requirements: TureFillAutofillReviewRequirement[];
  safety_attestations: {
    avanza_final_buy_sell_is_human_only: true;
    broker_data_must_be_captured_and_verified_first: true;
    no_broker_automation_allowed: true;
    no_credentials_handling_allowed: true;
    no_order_submission_allowed: true;
    no_automatic_ture_save_create_or_close: true;
  };
  agent_instructions: string[];
};

type BuildBuyTureFillAutofillContractInput = {
  payload: TradeExecutionPayload;
  captureSpec?: BrokerFillCaptureAgentSpec | null;
  companyName?: string | null;
  createdAt?: string;
};

type BuildSellTureFillAutofillContractInput = {
  payload: TradeExitExecutionPayload;
  captureSpec?: BrokerFillCaptureAgentSpec | null;
  createdAt?: string;
};

const allowedAgentActions: TureFillAutofillAllowedAction[] = [
  "fill_ture_broker_status_field",
  "fill_ture_actual_price_field",
  "fill_ture_actual_shares_field",
  "fill_ture_broker_reference_note_field",
  "fill_optional_fee_or_timestamp_fields_if_captured_exactly",
  "set_manual_confirmation_checkbox_if_user_confirmed_avanza",
  "set_plan_or_position_match_checkbox_if_verified",
  "stop_for_human_review_on_mismatch_or_uncertainty",
];

const forbiddenAgentActions: TureFillAutofillForbiddenAction[] = [
  "click_avanza_buy",
  "click_avanza_sell",
  "submit_broker_order",
  "handle_credentials",
  "guess_missing_broker_values",
  "alter_ture_planned_quantity_price_stop_or_target_to_force_match",
  "bypass_hard_stops",
  "create_live_day_trade_automatically",
  "close_trade_automatically",
  "save_ture_forms_automatically",
  "mark_confirmation_checkboxes_true_without_evidence",
];

const reviewRequirements: TureFillAutofillReviewRequirement[] = [
  "human_review_before_ture_save",
  "confirm_manual_avanza_confirmation_evidence",
  "confirm_broker_status_is_filled_or_partially_filled",
  "confirm_ticker_side_broker_match",
  "confirm_price_and_shares_match_broker_fill",
  "confirm_no_broker_values_were_guessed",
  "confirm_capture_confidence_meets_threshold",
];

function nullableString(value: string | null | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function finiteNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function positiveNumber(value: number | null | undefined) {
  const parsed = finiteNumber(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

function safeIdPart(value: string | null | undefined) {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function buildContractId({
  side,
  payloadId,
  createdAt,
}: {
  side: TureFillAutofillSide;
  payloadId: string;
  createdAt: string;
}) {
  return `ture_${side.toLowerCase()}_fill_autofill_contract_${safeIdPart(
    payloadId,
  )}_${safeIdPart(createdAt)}`;
}

function validationRules(): TureFillAutofillValidationRule[] {
  return [
    {
      rule_id: "all_required_fields_present",
      label: "All required fields present",
      description:
        "Every required Ture broker fill or exit field must have captured broker data or verified human confirmation.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      requires_human_review: true,
    },
    {
      rule_id: "price_must_be_positive",
      label: "Positive price required",
      description: "Actual fill or exit price must be a positive number.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      requires_human_review: true,
    },
    {
      rule_id: "shares_must_be_positive",
      label: "Positive shares required",
      description: "Actual filled or sold shares must be a positive number.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      requires_human_review: true,
    },
    {
      rule_id: "buy_quantity_tolerance",
      label: "Buy quantity tolerance",
      description:
        "Buy filled shares must be within planned quantity tolerance or require explicit human review.",
      severity: "warning",
      applies_to: ["BUY"],
      requires_human_review: true,
    },
    {
      rule_id: "sell_quantity_not_above_open_position",
      label: "Sell quantity cannot exceed open position",
      description: "Sell sold shares must not exceed the open Ture position size.",
      severity: "critical",
      applies_to: ["SELL"],
      requires_human_review: true,
    },
    {
      rule_id: "instrument_side_broker_match",
      label: "Instrument, side, and broker match",
      description: "Captured broker data must match expected ticker, side, and AVANZA broker.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      requires_human_review: true,
    },
    {
      rule_id: "manual_confirmation_true",
      label: "Manual Avanza confirmation required",
      description: "Manual Avanza KÖP/SÄLJ confirmation must be true before autofill save review.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      requires_human_review: true,
    },
    {
      rule_id: "plan_or_position_match_true",
      label: "Plan or position match required",
      description: "Broker order must be verified against the Ture trade plan or live position.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      requires_human_review: true,
    },
    {
      rule_id: "capture_confidence_threshold",
      label: "Capture confidence threshold",
      description: "Capture confidence below medium requires human review before Ture save.",
      severity: "warning",
      applies_to: ["BUY", "SELL"],
      requires_human_review: true,
    },
    {
      rule_id: "no_guessed_broker_values",
      label: "No guessed broker values",
      description: "Any required broker value that was guessed blocks autofill and save.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      requires_human_review: true,
    },
  ];
}

function hardStops(): TureFillAutofillHardStop[] {
  return [
    {
      hard_stop_id: "missing_captured_broker_data",
      label: "Missing captured broker data",
      description: "Required broker fill or exit data has not been captured.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_autofill: true,
      blocks_save: true,
      remediation: "Capture and verify broker data before filling Ture fields.",
    },
    {
      hard_stop_id: "missing_required_ture_target_field",
      label: "Missing required Ture target field",
      description: "A required Ture broker fill or exit confirmation field is unavailable.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_autofill: true,
      blocks_save: true,
      remediation: "Stop and ask for human review of the Ture form state.",
    },
    {
      hard_stop_id: "invalid_price",
      label: "Invalid price",
      description: "Captured price is missing, zero, negative, or not numeric.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_autofill: true,
      blocks_save: true,
      remediation: "Stop and request the actual broker price.",
    },
    {
      hard_stop_id: "invalid_shares",
      label: "Invalid shares",
      description: "Captured shares are missing, zero, negative, or not numeric.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_autofill: true,
      blocks_save: true,
      remediation: "Stop and request the actual broker share quantity.",
    },
    {
      hard_stop_id: "ticker_mismatch",
      label: "Ticker mismatch",
      description: "Captured broker instrument does not match the expected ticker.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_autofill: true,
      blocks_save: true,
      remediation: "Stop for human review before filling Ture fields.",
    },
    {
      hard_stop_id: "side_mismatch",
      label: "Side mismatch",
      description: "Captured broker side does not match expected BUY or SELL side.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_autofill: true,
      blocks_save: true,
      remediation: "Stop for human review before filling Ture fields.",
    },
    {
      hard_stop_id: "broker_mismatch",
      label: "Broker mismatch",
      description: "Captured broker is not AVANZA.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_autofill: true,
      blocks_save: true,
      remediation: "Stop because this contract only covers Avanza recordkeeping.",
    },
    {
      hard_stop_id: "missing_manual_avanza_confirmation",
      label: "Missing manual Avanza confirmation",
      description: "User manual Avanza KÖP/SÄLJ confirmation evidence is missing.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_autofill: true,
      blocks_save: true,
      remediation: "Do not set confirmation state without user evidence.",
    },
    {
      hard_stop_id: "missing_plan_or_position_match_confirmation",
      label: "Missing plan or position match confirmation",
      description: "Broker data has not been verified against the Ture plan or position.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_autofill: true,
      blocks_save: true,
      remediation: "Stop and ask the user to review the mismatch risk.",
    },
    {
      hard_stop_id: "captured_status_not_filled",
      label: "Captured status is not filled",
      description: "Captured status is not filled or partially filled.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_autofill: true,
      blocks_save: true,
      remediation: "Do not continue until Avanza reports a fill.",
    },
    {
      hard_stop_id: "guessed_broker_value_detected",
      label: "Guessed broker value detected",
      description: "A required broker value appears inferred or guessed.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_autofill: true,
      blocks_save: true,
      remediation: "Stop and request exact broker data.",
    },
    {
      hard_stop_id: "low_confidence_capture",
      label: "Low confidence capture",
      description: "Broker data capture confidence is below threshold.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_autofill: true,
      blocks_save: true,
      remediation: "Stop for human review and manual entry.",
    },
    {
      hard_stop_id: "sell_quantity_exceeds_open_position",
      label: "Sell quantity exceeds open position",
      description: "Captured sold shares exceed Ture open position size.",
      severity: "critical",
      applies_to: ["SELL"],
      blocks_autofill: true,
      blocks_save: true,
      remediation: "Stop and resolve the position size mismatch.",
    },
    {
      hard_stop_id: "unknown_ture_form_state",
      label: "Unknown Ture form state",
      description: "Ture form state is unfamiliar, stale, or cannot be verified.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_autofill: true,
      blocks_save: true,
      remediation: "Stop and ask the user to refresh or fill manually.",
    },
    {
      hard_stop_id: "unsafe_to_continue",
      label: "Unsafe to continue",
      description: "Any security, account, mismatch, or unknown state makes autofill unsafe.",
      severity: "critical",
      applies_to: ["BUY", "SELL"],
      blocks_autofill: true,
      blocks_save: true,
      remediation: "Stop immediately and request human review.",
    },
  ];
}

function safetyAttestations(): TureFillAutofillContract["safety_attestations"] {
  return {
    avanza_final_buy_sell_is_human_only: true,
    broker_data_must_be_captured_and_verified_first: true,
    no_broker_automation_allowed: true,
    no_credentials_handling_allowed: true,
    no_order_submission_allowed: true,
    no_automatic_ture_save_create_or_close: true,
  };
}

function field(input: TureFillAutofillField): TureFillAutofillField {
  return input;
}

export function buildBuyTureFillAutofillContract({
  payload,
  captureSpec,
  companyName,
  createdAt,
}: BuildBuyTureFillAutofillContractInput): TureFillAutofillContract {
  const contractCreatedAt = createdAt ?? payload.created_at;
  const targetForm: TureFillAutofillTargetForm = "broker_fill_confirmation";

  return {
    contract_id: buildContractId({
      side: "BUY",
      payloadId: payload.payload_id,
      createdAt: contractCreatedAt,
    }),
    contract_version: "1.0",
    contract_kind: "ture_fill_autofill_contract",
    created_at: contractCreatedAt,
    side: "BUY",
    broker: "AVANZA",
    mode: "ture_recordkeeping_autofill_only",
    source: "add_trade_modal",
    target_form: targetForm,
    handoff_session_id: payload.handoff_session_id,
    source_payload_id: payload.payload_id,
    source_payload_fingerprint: payload.payload_fingerprint,
    capture_spec_id: captureSpec?.spec_id ?? null,
    capture_spec_version: captureSpec?.spec_version ?? null,
    confidence_threshold: "medium",
    required_autofill_fields: [
      field({
        field_id: "broker_status",
        label: "Broker status",
        target_form: targetForm,
        ture_state_key: "brokerOrderStatus",
        source: "captured_broker_data",
        source_path: "broker_capture.broker_status",
        required: true,
        editable_by_agent: true,
        review_only: false,
        value_type: "status",
        validation_rule_ids: ["all_required_fields_present"],
        hard_stop_ids: ["missing_captured_broker_data", "captured_status_not_filled"],
        notes: ["Must be filled or partially filled."],
      }),
      field({
        field_id: "actual_fill_price",
        label: "Actual fill price",
        target_form: targetForm,
        ture_state_key: "actualFillPriceInput",
        source: "captured_broker_data",
        source_path: "broker_capture.actual_fill_price",
        required: true,
        editable_by_agent: true,
        review_only: false,
        value_type: "number",
        validation_rule_ids: ["price_must_be_positive"],
        hard_stop_ids: ["invalid_price", "guessed_broker_value_detected"],
        notes: ["Use exact broker fill price only."],
      }),
      field({
        field_id: "actual_filled_shares",
        label: "Actual filled shares",
        target_form: targetForm,
        ture_state_key: "actualSharesInput",
        source: "captured_broker_data",
        source_path: "broker_capture.actual_filled_shares",
        required: true,
        editable_by_agent: true,
        review_only: false,
        value_type: "number",
        expected_value: positiveNumber(payload.shares) ?? undefined,
        validation_rule_ids: ["shares_must_be_positive", "buy_quantity_tolerance"],
        hard_stop_ids: ["invalid_shares", "guessed_broker_value_detected"],
        notes: ["Quantity above plan requires explicit human review."],
      }),
      field({
        field_id: "broker_reference_note",
        label: "Broker reference / note",
        target_form: targetForm,
        ture_state_key: "brokerReferenceNote",
        source: "captured_broker_data",
        source_path: "broker_capture.broker_reference_note",
        required: true,
        editable_by_agent: true,
        review_only: false,
        value_type: "text",
        validation_rule_ids: ["all_required_fields_present"],
        hard_stop_ids: ["missing_captured_broker_data"],
        notes: ["Use exact reference or concise fill note."],
      }),
      field({
        field_id: "manual_avanza_buy_confirmation",
        label: "Manual Avanza KÖP confirmation",
        target_form: targetForm,
        ture_state_key: "manualBrokerConfirmed",
        source: "human_confirmation",
        source_path: "human_confirmation.manually_clicked_final_buy",
        required: true,
        editable_by_agent: true,
        review_only: false,
        value_type: "boolean",
        expected_value: true,
        validation_rule_ids: ["manual_confirmation_true"],
        hard_stop_ids: ["missing_manual_avanza_confirmation"],
        notes: ["May be set true only with evidence that user manually clicked KÖP."],
      }),
      field({
        field_id: "broker_order_matches_ture_trade_plan",
        label: "Broker order matches Ture trade plan",
        target_form: targetForm,
        ture_state_key: "brokerPlanMatches",
        source: "captured_broker_data",
        source_path: "broker_capture.plan_match_verification",
        required: true,
        editable_by_agent: true,
        review_only: false,
        value_type: "boolean",
        expected_value: true,
        validation_rule_ids: ["plan_or_position_match_true"],
        hard_stop_ids: ["missing_plan_or_position_match_confirmation"],
        notes: ["May be set true only after ticker, side, price, and shares are verified."],
      }),
    ],
    optional_autofill_fields: [
      field({
        field_id: "commission",
        label: "Commission / courtage",
        target_form: targetForm,
        ture_state_key: "previewCommissionInput",
        source: "captured_broker_data",
        source_path: "broker_capture.commission",
        required: false,
        editable_by_agent: true,
        review_only: false,
        value_type: "number",
        validation_rule_ids: [],
        hard_stop_ids: ["guessed_broker_value_detected"],
        notes: ["Fill only if captured exactly."],
      }),
      field({
        field_id: "fx_fee",
        label: "FX fee",
        target_form: targetForm,
        ture_state_key: "previewFxFeeInput",
        source: "captured_broker_data",
        source_path: "broker_capture.fx_fee",
        required: false,
        editable_by_agent: true,
        review_only: false,
        value_type: "number",
        validation_rule_ids: [],
        hard_stop_ids: ["guessed_broker_value_detected"],
        notes: ["Fill only if captured exactly."],
      }),
      field({
        field_id: "broker_timestamp",
        label: "Broker timestamp",
        target_form: targetForm,
        ture_state_key: "brokerConfirmedAt",
        source: "captured_broker_data",
        source_path: "broker_capture.broker_timestamp",
        required: false,
        editable_by_agent: true,
        review_only: false,
        value_type: "timestamp",
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: ["Optional; Ture may use local confirmation time if unavailable."],
      }),
      field({
        field_id: "settlement_currency_info",
        label: "Settlement / currency info",
        target_form: targetForm,
        ture_state_key: "screenshotReferenceNote",
        source: "captured_broker_data",
        source_path: "broker_capture.settlement_currency_info",
        required: false,
        editable_by_agent: true,
        review_only: false,
        value_type: "text",
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: ["Optional context only."],
      }),
    ],
    review_only_context_fields: [
      field({
        field_id: "expected_ticker",
        label: "Expected ticker",
        target_form: targetForm,
        ture_state_key: "payload.ticker",
        source: "ture_context",
        source_path: "execution_payload.ticker",
        required: true,
        editable_by_agent: false,
        review_only: true,
        value_type: "text",
        expected_value: payload.ticker,
        validation_rule_ids: ["instrument_side_broker_match"],
        hard_stop_ids: ["ticker_mismatch"],
        notes: [nullableString(companyName) ?? "Company name unavailable."],
      }),
      field({
        field_id: "expected_side",
        label: "Expected side",
        target_form: targetForm,
        ture_state_key: "BUY",
        source: "ture_context",
        source_path: "execution_payload.order_intent",
        required: true,
        editable_by_agent: false,
        review_only: true,
        value_type: "text",
        expected_value: "BUY",
        validation_rule_ids: ["instrument_side_broker_match"],
        hard_stop_ids: ["side_mismatch"],
        notes: [],
      }),
      field({
        field_id: "planned_quantity",
        label: "Planned quantity",
        target_form: targetForm,
        ture_state_key: "payload.shares",
        source: "ture_context",
        source_path: "execution_payload.shares",
        required: true,
        editable_by_agent: false,
        review_only: true,
        value_type: "number",
        expected_value: positiveNumber(payload.shares) ?? undefined,
        validation_rule_ids: ["buy_quantity_tolerance"],
        hard_stop_ids: [],
        notes: [],
      }),
      field({
        field_id: "estimated_entry_price",
        label: "Estimated entry price",
        target_form: targetForm,
        ture_state_key: "payload.entry_price",
        source: "ture_context",
        source_path: "execution_payload.entry_price",
        required: true,
        editable_by_agent: false,
        review_only: true,
        value_type: "number",
        expected_value: positiveNumber(payload.entry_price) ?? undefined,
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: [],
      }),
      field({
        field_id: "stop_price",
        label: "Stop price",
        target_form: targetForm,
        ture_state_key: "payload.stop_loss",
        source: "ture_context",
        source_path: "execution_payload.stop_loss",
        required: true,
        editable_by_agent: false,
        review_only: true,
        value_type: "number",
        expected_value: positiveNumber(payload.stop_loss) ?? undefined,
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: [],
      }),
      field({
        field_id: "target_price",
        label: "Target price",
        target_form: targetForm,
        ture_state_key: "payload.target_price",
        source: "ture_context",
        source_path: "execution_payload.target_price",
        required: false,
        editable_by_agent: false,
        review_only: true,
        value_type: "number",
        expected_value: positiveNumber(payload.target_price) ?? undefined,
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: [],
      }),
      field({
        field_id: "risk_reward_context",
        label: "Risk/reward context",
        target_form: targetForm,
        ture_state_key: "payload.estimated_r_multiple",
        source: "ture_context",
        source_path: "execution_payload.estimated_r_multiple",
        required: false,
        editable_by_agent: false,
        review_only: true,
        value_type: "number",
        expected_value: finiteNumber(payload.estimated_r_multiple) ?? undefined,
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: ["Review only; never alter planned risk fields to force a match."],
      }),
      field({
        field_id: "execution_payload_id",
        label: "Execution payload id",
        target_form: targetForm,
        ture_state_key: "payload.payload_id",
        source: "ture_context",
        source_path: "execution_payload.payload_id",
        required: true,
        editable_by_agent: false,
        review_only: true,
        value_type: "text",
        expected_value: payload.payload_id,
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: [`Fingerprint: ${payload.payload_fingerprint}`],
      }),
      field({
        field_id: "broker_fill_capture_spec",
        label: "Broker fill capture spec",
        target_form: targetForm,
        ture_state_key: "captureSpec.spec_id",
        source: "capture_spec",
        source_path: "broker_fill_capture_agent_spec.spec_id",
        required: false,
        editable_by_agent: false,
        review_only: true,
        value_type: "text",
        expected_value: captureSpec?.spec_id,
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: [`Spec version: ${captureSpec?.spec_version ?? "unavailable"}`],
      }),
    ],
    validation_rules: validationRules(),
    hard_stops: hardStops(),
    allowed_agent_actions: allowedAgentActions,
    forbidden_agent_actions: forbiddenAgentActions,
    review_requirements: reviewRequirements,
    safety_attestations: safetyAttestations(),
    agent_instructions: [
      "This contract is for Ture-side broker fill recordkeeping only.",
      "Use only captured and verified broker data after the user manually clicked final KÖP in Avanza.",
      "Fill Ture fields only; do not save, create the Live Day Trade, or click any broker controls.",
      "Stop for human review on mismatches, low confidence, guessed values, or unknown Ture form state.",
    ],
  };
}

export function buildSellTureFillAutofillContract({
  payload,
  captureSpec,
  createdAt,
}: BuildSellTureFillAutofillContractInput): TureFillAutofillContract {
  const contractCreatedAt = createdAt ?? payload.created_at;
  const targetForm: TureFillAutofillTargetForm = "broker_exit_confirmation";

  return {
    contract_id: buildContractId({
      side: "SELL",
      payloadId: payload.payload_id,
      createdAt: contractCreatedAt,
    }),
    contract_version: "1.0",
    contract_kind: "ture_fill_autofill_contract",
    created_at: contractCreatedAt,
    side: "SELL",
    broker: "AVANZA",
    mode: "ture_recordkeeping_autofill_only",
    source: "close_trade_modal",
    target_form: targetForm,
    handoff_session_id: payload.handoff_session_id,
    source_payload_id: payload.payload_id,
    source_payload_fingerprint: payload.payload_fingerprint,
    capture_spec_id: captureSpec?.spec_id ?? null,
    capture_spec_version: captureSpec?.spec_version ?? null,
    confidence_threshold: "medium",
    required_autofill_fields: [
      field({
        field_id: "exit_status",
        label: "Exit status",
        target_form: targetForm,
        ture_state_key: "exitStatus",
        source: "captured_broker_data",
        source_path: "broker_capture.exit_status",
        required: true,
        editable_by_agent: true,
        review_only: false,
        value_type: "status",
        validation_rule_ids: ["all_required_fields_present"],
        hard_stop_ids: ["missing_captured_broker_data", "captured_status_not_filled"],
        notes: ["Must be filled or partially filled."],
      }),
      field({
        field_id: "actual_exit_price",
        label: "Actual exit price",
        target_form: targetForm,
        ture_state_key: "exitPrice",
        source: "captured_broker_data",
        source_path: "broker_capture.actual_exit_price",
        required: true,
        editable_by_agent: true,
        review_only: false,
        value_type: "number",
        validation_rule_ids: ["price_must_be_positive"],
        hard_stop_ids: ["invalid_price", "guessed_broker_value_detected"],
        notes: ["Use exact broker exit price only."],
      }),
      field({
        field_id: "actual_sold_shares",
        label: "Actual sold shares",
        target_form: targetForm,
        ture_state_key: "actualSoldShares",
        source: "captured_broker_data",
        source_path: "broker_capture.actual_sold_shares",
        required: true,
        editable_by_agent: true,
        review_only: false,
        value_type: "number",
        expected_value: positiveNumber(payload.order_intent.quantity_to_sell) ?? undefined,
        validation_rule_ids: [
          "shares_must_be_positive",
          "sell_quantity_not_above_open_position",
        ],
        hard_stop_ids: [
          "invalid_shares",
          "sell_quantity_exceeds_open_position",
          "guessed_broker_value_detected",
        ],
        notes: ["Must not exceed open position size."],
      }),
      field({
        field_id: "broker_reference_note",
        label: "Broker reference / note",
        target_form: targetForm,
        ture_state_key: "brokerReferenceNote",
        source: "captured_broker_data",
        source_path: "broker_capture.broker_reference_note",
        required: true,
        editable_by_agent: true,
        review_only: false,
        value_type: "text",
        validation_rule_ids: ["all_required_fields_present"],
        hard_stop_ids: ["missing_captured_broker_data"],
        notes: ["Use exact reference or concise exit fill note."],
      }),
      field({
        field_id: "manual_avanza_sell_confirmation",
        label: "Manual Avanza SÄLJ confirmation",
        target_form: targetForm,
        ture_state_key: "userManuallyConfirmedSell",
        source: "human_confirmation",
        source_path: "human_confirmation.manually_clicked_final_sell",
        required: true,
        editable_by_agent: true,
        review_only: false,
        value_type: "boolean",
        expected_value: true,
        validation_rule_ids: ["manual_confirmation_true"],
        hard_stop_ids: ["missing_manual_avanza_confirmation"],
        notes: ["May be set true only with evidence that user manually clicked SÄLJ."],
      }),
      field({
        field_id: "broker_order_matches_ture_position",
        label: "Broker order matches Ture position",
        target_form: targetForm,
        ture_state_key: "brokerOrderMatchesTradePlan",
        source: "captured_broker_data",
        source_path: "broker_capture.position_match_verification",
        required: true,
        editable_by_agent: true,
        review_only: false,
        value_type: "boolean",
        expected_value: true,
        validation_rule_ids: ["plan_or_position_match_true"],
        hard_stop_ids: ["missing_plan_or_position_match_confirmation"],
        notes: ["May be set true only after ticker, side, price, and shares are verified."],
      }),
    ],
    optional_autofill_fields: [
      field({
        field_id: "exit_commission",
        label: "Exit commission / courtage",
        target_form: targetForm,
        ture_state_key: "exitCommission",
        source: "captured_broker_data",
        source_path: "broker_capture.exit_commission",
        required: false,
        editable_by_agent: true,
        review_only: false,
        value_type: "number",
        validation_rule_ids: [],
        hard_stop_ids: ["guessed_broker_value_detected"],
        notes: ["Fill only if captured exactly."],
      }),
      field({
        field_id: "exit_fx_fee",
        label: "Exit FX fee",
        target_form: targetForm,
        ture_state_key: "exitFxFee",
        source: "captured_broker_data",
        source_path: "broker_capture.exit_fx_fee",
        required: false,
        editable_by_agent: true,
        review_only: false,
        value_type: "number",
        validation_rule_ids: [],
        hard_stop_ids: ["guessed_broker_value_detected"],
        notes: ["Fill only if captured exactly."],
      }),
      field({
        field_id: "broker_timestamp",
        label: "Broker timestamp",
        target_form: targetForm,
        ture_state_key: "broker_confirmed_at",
        source: "captured_broker_data",
        source_path: "broker_capture.broker_timestamp",
        required: false,
        editable_by_agent: true,
        review_only: false,
        value_type: "timestamp",
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: ["Optional; Ture may use local confirmation time if unavailable."],
      }),
      field({
        field_id: "settlement_currency_info",
        label: "Settlement / currency info",
        target_form: targetForm,
        ture_state_key: "brokerReferenceNote",
        source: "captured_broker_data",
        source_path: "broker_capture.settlement_currency_info",
        required: false,
        editable_by_agent: true,
        review_only: false,
        value_type: "text",
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: ["Optional context only."],
      }),
    ],
    review_only_context_fields: [
      field({
        field_id: "expected_ticker",
        label: "Expected ticker",
        target_form: targetForm,
        ture_state_key: "payload.exit_context.ticker",
        source: "ture_context",
        source_path: "exit_execution_payload.exit_context.ticker",
        required: true,
        editable_by_agent: false,
        review_only: true,
        value_type: "text",
        expected_value: payload.exit_context.ticker,
        validation_rule_ids: ["instrument_side_broker_match"],
        hard_stop_ids: ["ticker_mismatch"],
        notes: [payload.exit_context.company_name ?? "Company name unavailable."],
      }),
      field({
        field_id: "expected_side",
        label: "Expected side",
        target_form: targetForm,
        ture_state_key: "SELL",
        source: "ture_context",
        source_path: "exit_execution_payload.order_intent.side",
        required: true,
        editable_by_agent: false,
        review_only: true,
        value_type: "text",
        expected_value: "SELL",
        validation_rule_ids: ["instrument_side_broker_match"],
        hard_stop_ids: ["side_mismatch"],
        notes: [],
      }),
      field({
        field_id: "open_position_size",
        label: "Open position size",
        target_form: targetForm,
        ture_state_key: "payload.position_snapshot.position_size",
        source: "ture_context",
        source_path: "exit_execution_payload.position_snapshot.position_size",
        required: true,
        editable_by_agent: false,
        review_only: true,
        value_type: "number",
        expected_value: positiveNumber(payload.position_snapshot.position_size) ?? undefined,
        validation_rule_ids: ["sell_quantity_not_above_open_position"],
        hard_stop_ids: ["sell_quantity_exceeds_open_position"],
        notes: [],
      }),
      field({
        field_id: "entry_price",
        label: "Entry price",
        target_form: targetForm,
        ture_state_key: "payload.position_snapshot.entry_price",
        source: "ture_context",
        source_path: "exit_execution_payload.position_snapshot.entry_price",
        required: false,
        editable_by_agent: false,
        review_only: true,
        value_type: "number",
        expected_value: positiveNumber(payload.position_snapshot.entry_price) ?? undefined,
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: [],
      }),
      field({
        field_id: "current_price",
        label: "Current price",
        target_form: targetForm,
        ture_state_key: "payload.position_snapshot.current_price",
        source: "ture_context",
        source_path: "exit_execution_payload.position_snapshot.current_price",
        required: false,
        editable_by_agent: false,
        review_only: true,
        value_type: "number",
        expected_value: positiveNumber(payload.position_snapshot.current_price) ?? undefined,
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: [],
      }),
      field({
        field_id: "unrealized_pnl",
        label: "Unrealized PnL",
        target_form: targetForm,
        ture_state_key: "payload.risk_snapshot.unrealized_pnl",
        source: "ture_context",
        source_path: "exit_execution_payload.risk_snapshot.unrealized_pnl",
        required: false,
        editable_by_agent: false,
        review_only: true,
        value_type: "number",
        expected_value: finiteNumber(payload.risk_snapshot.unrealized_pnl) ?? undefined,
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: [],
      }),
      field({
        field_id: "current_r",
        label: "Current R",
        target_form: targetForm,
        ture_state_key: "payload.risk_snapshot.current_r",
        source: "ture_context",
        source_path: "exit_execution_payload.risk_snapshot.current_r",
        required: false,
        editable_by_agent: false,
        review_only: true,
        value_type: "number",
        expected_value: finiteNumber(payload.risk_snapshot.current_r) ?? undefined,
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: [],
      }),
      field({
        field_id: "stop_price",
        label: "Stop price",
        target_form: targetForm,
        ture_state_key: "payload.position_snapshot.stop_price",
        source: "ture_context",
        source_path: "exit_execution_payload.position_snapshot.stop_price",
        required: false,
        editable_by_agent: false,
        review_only: true,
        value_type: "number",
        expected_value: positiveNumber(payload.position_snapshot.stop_price) ?? undefined,
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: [],
      }),
      field({
        field_id: "target_price",
        label: "Target price",
        target_form: targetForm,
        ture_state_key: "payload.position_snapshot.target_price",
        source: "ture_context",
        source_path: "exit_execution_payload.position_snapshot.target_price",
        required: false,
        editable_by_agent: false,
        review_only: true,
        value_type: "number",
        expected_value: positiveNumber(payload.position_snapshot.target_price) ?? undefined,
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: [],
      }),
      field({
        field_id: "close_reason",
        label: "Close reason",
        target_form: targetForm,
        ture_state_key: "payload.exit_context.close_reason",
        source: "ture_context",
        source_path: "exit_execution_payload.exit_context.close_reason",
        required: false,
        editable_by_agent: false,
        review_only: true,
        value_type: "text",
        expected_value: payload.exit_context.close_reason ?? undefined,
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: [],
      }),
      field({
        field_id: "sell_execution_payload_id",
        label: "Sell execution payload id",
        target_form: targetForm,
        ture_state_key: "payload.payload_id",
        source: "ture_context",
        source_path: "exit_execution_payload.payload_id",
        required: true,
        editable_by_agent: false,
        review_only: true,
        value_type: "text",
        expected_value: payload.payload_id,
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: [`Fingerprint: ${payload.payload_fingerprint}`],
      }),
      field({
        field_id: "broker_exit_capture_spec",
        label: "Broker exit capture spec",
        target_form: targetForm,
        ture_state_key: "captureSpec.spec_id",
        source: "capture_spec",
        source_path: "broker_exit_capture_agent_spec.spec_id",
        required: false,
        editable_by_agent: false,
        review_only: true,
        value_type: "text",
        expected_value: captureSpec?.spec_id,
        validation_rule_ids: [],
        hard_stop_ids: [],
        notes: [`Spec version: ${captureSpec?.spec_version ?? "unavailable"}`],
      }),
    ],
    validation_rules: validationRules(),
    hard_stops: hardStops(),
    allowed_agent_actions: allowedAgentActions,
    forbidden_agent_actions: forbiddenAgentActions,
    review_requirements: reviewRequirements,
    safety_attestations: safetyAttestations(),
    agent_instructions: [
      "This contract is for Ture-side broker exit recordkeeping only.",
      "Use only captured and verified broker data after the user manually clicked final SÄLJ in Avanza.",
      "Fill Ture fields only; do not save, close the trade, or click any broker controls.",
      "Stop for human review on mismatches, low confidence, guessed values, or unknown Ture form state.",
    ],
  };
}

export function tureFillAutofillContractJson(
  contract: TureFillAutofillContract,
) {
  return JSON.stringify(contract, null, 2);
}
