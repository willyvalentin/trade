import type { AgentDryRunResult } from "@/lib/agent-dry-run";
import type { AgentReadinessResult } from "@/lib/agent-readiness";
import {
  evaluateAgentHardStopContract,
  type AgentHardStopContract,
  type AgentHardStopEvaluation,
  type AgentHardStopId,
} from "@/lib/agent-hard-stop-contract";
import type { TradeExecutionPayload } from "@/lib/execution-payload";
import type { HandoffIntegrityResult } from "@/lib/handoff-integrity";

export type AgentHandoffTask = "prepare_order_form_only";
export type AgentHandoffBroker = "AVANZA";
export type AgentHandoffBrokerExecutionMode = "prepare_only";
export type AgentHandoffStatus = "ready" | "warning" | "blocked";
export type AgentHandoffStopBefore =
  | "final_broker_confirmation"
  | "buy_sell_submit_button";
export type AgentHandoffHardStopStatus = "passed" | "warning" | "failed";
export type AgentHandoffHardStopSeverity = "info" | "warning" | "critical";

export type AgentHandoffForbiddenAction =
  | "submit_order"
  | "click_buy"
  | "click_sell"
  | "confirm_order"
  | "modify_broker_account"
  | "change_order_after_user_review"
  | "override_hard_stop"
  | "use_expired_payload"
  | "infer_missing_required_fields"
  | "handle_credentials"
  | "bypass_human_confirmation";

export type AgentHandoffAllowedAction =
  | "read_execution_payload"
  | "open_broker_order_form"
  | "fill_order_form_fields"
  | "pause_for_user_review"
  | "report_preparation_status"
  | "stop_on_warning_or_unknown_state";

export type AgentHandoffRequiredHumanAction =
  | "review_broker_order_form"
  | "confirm_ticker_matches"
  | "confirm_side_matches"
  | "confirm_quantity_matches"
  | "confirm_price_matches"
  | "manually_click_final_buy_or_sell"
  | "record_actual_broker_fill_in_trade_app";

export type AgentHandoffFormFields = {
  ticker_symbol: string | null;
  company_name: string | null;
  side: "buy" | null;
  quantity: number | null;
  estimated_entry_price: number | null;
  order_type: "limit" | null;
  limit_price: number | null;
  stop_loss_reference: number | null;
  take_profit_reference: number | null;
  currency: "USD" | null;
  time_in_force: "day" | null;
  broker_note_reference: string | null;
};

export type AgentHandoffReviewFields = {
  payload_id: string | null;
  payload_fingerprint: string | null;
  handoff_session_id: string | null;
  expires_at: string | null;
  manual_final_confirmation_required: boolean;
  do_not_submit_order: boolean;
};

export type AgentHandoffHardStopRule = {
  id: AgentHardStopId;
  label: string;
  status: AgentHandoffHardStopStatus;
  severity: AgentHandoffHardStopSeverity;
  message: string;
  blocks_agent: boolean;
};

export type AgentHandoffCommand = {
  command_id: string;
  command_version: "1.0";
  created_at: string;
  expires_at: string | null;
  handoff_session_id: string | null;
  payload_id: string | null;
  payload_fingerprint: string | null;
  broker: AgentHandoffBroker;
  broker_execution_mode: AgentHandoffBrokerExecutionMode;
  task: AgentHandoffTask;
  status: AgentHandoffStatus;
  instrument: {
    ticker_symbol: string | null;
    company_name: string | null;
    market: string | null;
    currency: "USD" | null;
  };
  order_intent: {
    side: "buy" | null;
    direction: "long" | null;
    quantity: number | null;
    order_type: "limit" | null;
    estimated_entry_price: number | null;
    limit_price: number | null;
    stop_loss_reference: number | null;
    take_profit_reference: number | null;
  };
  form_fields: AgentHandoffFormFields;
  review_fields: AgentHandoffReviewFields;
  hard_stop_rules: AgentHandoffHardStopRule[];
  forbidden_actions: AgentHandoffForbiddenAction[];
  required_human_actions: AgentHandoffRequiredHumanAction[];
  allowed_agent_actions: AgentHandoffAllowedAction[];
  stop_before: AgentHandoffStopBefore[];
  safety_attestations: {
    prepare_only: true;
    no_broker_automation: true;
    no_order_submission: true;
    no_credential_handling: true;
    human_final_confirmation_required: true;
    stop_on_warning_or_unknown_state: true;
  };
  source_context: {
    recommendation_id: string | null;
    execution_payload_version: string | null;
    validation_status: string | null;
    intraday_confirmation: string | null;
    handoff_status: string | null;
    agent_readiness_status: string | null;
    agent_readiness_score: number | null;
    dry_run_status: string | null;
    handoff_integrity_status: string | null;
    generated_from: string | null;
  };
};

export type AgentHandoffCommandMetadataSnapshot = {
  command_id: string;
  command_version: AgentHandoffCommand["command_version"];
  status: AgentHandoffStatus;
  task: AgentHandoffTask;
  broker: AgentHandoffBroker;
  broker_execution_mode: AgentHandoffBrokerExecutionMode;
  stop_before: AgentHandoffStopBefore[];
  hard_stop_failed_count: number;
  hard_stop_warning_count: number;
  generated_at: string;
  expires_at: string | null;
};

export type BuildAgentHandoffCommandInput = {
  payload?: TradeExecutionPayload | null;
  companyName?: string | null;
  agentReadiness?: AgentReadinessResult | null;
  dryRunResult?: AgentDryRunResult | null;
  handoffIntegrity?: HandoffIntegrityResult | null;
  validationStatus?: string | null;
  intradayConfirmation?: string | null;
  hardStopContract?: AgentHardStopContract | null;
  now?: Date;
  createdAt?: string;
};

const forbiddenActions: AgentHandoffForbiddenAction[] = [
  "submit_order",
  "click_buy",
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

const allowedAgentActions: AgentHandoffAllowedAction[] = [
  "read_execution_payload",
  "open_broker_order_form",
  "fill_order_form_fields",
  "pause_for_user_review",
  "report_preparation_status",
  "stop_on_warning_or_unknown_state",
];

const requiredHumanActions: AgentHandoffRequiredHumanAction[] = [
  "review_broker_order_form",
  "confirm_ticker_matches",
  "confirm_side_matches",
  "confirm_quantity_matches",
  "confirm_price_matches",
  "manually_click_final_buy_or_sell",
  "record_actual_broker_fill_in_trade_app",
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

function mapContractStatus(
  status: AgentHardStopEvaluation["status"],
): AgentHandoffHardStopStatus {
  if (status === "failed") {
    return "failed";
  }

  if (status === "warning" || status === "unknown") {
    return "warning";
  }

  return "passed";
}

function toCommandHardStopRule(
  contractRule: AgentHardStopEvaluation,
): AgentHandoffHardStopRule {
  const status = mapContractStatus(contractRule.status);

  return {
    id: contractRule.id,
    label: contractRule.label,
    status,
    severity:
      contractRule.status === "unknown" ? "warning" : contractRule.severity,
    message: contractRule.message,
    blocks_agent:
      contractRule.blocks_agent &&
      (contractRule.status === "failed" || contractRule.status === "unknown"),
  };
}

export function buildAgentHandoffCommand({
  payload,
  companyName,
  agentReadiness,
  dryRunResult,
  handoffIntegrity,
  validationStatus,
  intradayConfirmation,
  hardStopContract,
  now = new Date(),
  createdAt,
}: BuildAgentHandoffCommandInput): AgentHandoffCommand {
  const created_at = createdAt ?? now.toISOString();
  const broker: AgentHandoffBroker = "AVANZA";
  const broker_execution_mode: AgentHandoffBrokerExecutionMode = "prepare_only";
  const task: AgentHandoffTask = "prepare_order_form_only";
  const stop_before: AgentHandoffStopBefore[] = [
    "final_broker_confirmation",
    "buy_sell_submit_button",
  ];
  const side = payload?.direction === "long" ? "buy" : null;
  const quantity = positiveNumber(payload?.shares);
  const estimatedEntryPrice = positiveNumber(payload?.entry_price);
  const limitPrice = positiveNumber(payload?.limit_price);
  const stopLoss = positiveNumber(payload?.stop_loss);
  const targetPrice = positiveNumber(payload?.target_price);
  const expiresAt = nullableString(payload?.expires_at);

  const form_fields: AgentHandoffFormFields = {
    ticker_symbol:
      payload?.ticker && payload.ticker !== "UNKNOWN" ? payload.ticker : null,
    company_name: nullableString(companyName),
    side,
    quantity,
    estimated_entry_price: estimatedEntryPrice,
    order_type: payload?.order_type === "limit" ? "limit" : null,
    limit_price: limitPrice,
    stop_loss_reference: stopLoss,
    take_profit_reference: targetPrice,
    currency: payload?.market === "US" ? "USD" : null,
    time_in_force: payload?.time_in_force === "day" ? "day" : null,
    broker_note_reference: payload?.payload_id
      ? `Trade payload ${payload.payload_id}`
      : null,
  };

  const review_fields: AgentHandoffReviewFields = {
    payload_id: nullableString(payload?.payload_id),
    payload_fingerprint: nullableString(payload?.payload_fingerprint),
    handoff_session_id: nullableString(payload?.handoff_session_id),
    expires_at: expiresAt,
    manual_final_confirmation_required:
      payload?.requires_manual_confirmation === true &&
      payload?.human_final_confirmation_required === true,
    do_not_submit_order: payload?.do_not_submit_order === true,
  };

  const contract =
    hardStopContract ??
    evaluateAgentHardStopContract({
      payload,
      agentReadiness,
      dryRunResult,
      handoffIntegrity,
      validationStatus,
      intradayConfirmation,
      brokerExecutionMode: broker_execution_mode,
      now,
    });
  const hard_stop_rules = contract.rules.map(toCommandHardStopRule);
  const status: AgentHandoffStatus =
    contract.overall_status === "blocked"
      ? "blocked"
      : contract.overall_status === "warning"
        ? "warning"
        : "ready";

  return {
    command_id: `agent_command_${sanitizeIdPart(
      review_fields.handoff_session_id,
    )}_${sanitizeIdPart(review_fields.payload_id)}_${sanitizeIdPart(
      review_fields.payload_fingerprint,
    )}`,
    command_version: "1.0",
    created_at,
    expires_at: expiresAt,
    handoff_session_id: review_fields.handoff_session_id,
    payload_id: review_fields.payload_id,
    payload_fingerprint: review_fields.payload_fingerprint,
    broker,
    broker_execution_mode,
    task,
    status,
    instrument: {
      ticker_symbol: form_fields.ticker_symbol,
      company_name: form_fields.company_name,
      market: payload?.market ?? null,
      currency: form_fields.currency,
    },
    order_intent: {
      side,
      direction: payload?.direction === "long" ? "long" : null,
      quantity,
      order_type: form_fields.order_type,
      estimated_entry_price: estimatedEntryPrice,
      limit_price: limitPrice,
      stop_loss_reference: stopLoss,
      take_profit_reference: targetPrice,
    },
    form_fields,
    review_fields,
    hard_stop_rules,
    forbidden_actions: forbiddenActions,
    required_human_actions: requiredHumanActions,
    allowed_agent_actions: allowedAgentActions,
    stop_before,
    safety_attestations: {
      prepare_only: true,
      no_broker_automation: true,
      no_order_submission: true,
      no_credential_handling: true,
      human_final_confirmation_required: true,
      stop_on_warning_or_unknown_state: true,
    },
    source_context: {
      recommendation_id: payload?.recommendation_id ?? null,
      execution_payload_version: payload?.payload_version ?? null,
      validation_status: validationStatus ?? payload?.validation_status ?? null,
      intraday_confirmation:
        intradayConfirmation ?? payload?.intraday_confirmation ?? null,
      handoff_status: payload?.handoff_status ?? null,
      agent_readiness_status: agentReadiness?.status ?? null,
      agent_readiness_score: agentReadiness?.score ?? null,
      dry_run_status: dryRunResult?.status ?? null,
      handoff_integrity_status: handoffIntegrity?.status ?? null,
      generated_from: payload?.generated_from ?? null,
    },
  };
}

export function toAgentHandoffCommandMetadataSnapshot(
  command: AgentHandoffCommand,
): AgentHandoffCommandMetadataSnapshot {
  return {
    command_id: command.command_id,
    command_version: command.command_version,
    status: command.status,
    task: command.task,
    broker: command.broker,
    broker_execution_mode: command.broker_execution_mode,
    stop_before: command.stop_before,
    hard_stop_failed_count: command.hard_stop_rules.filter(
      (rule) => rule.status === "failed",
    ).length,
    hard_stop_warning_count: command.hard_stop_rules.filter(
      (rule) => rule.status === "warning",
    ).length,
    generated_at: command.created_at,
    expires_at: command.expires_at,
  };
}
