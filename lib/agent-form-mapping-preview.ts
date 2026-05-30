import type { AgentDryRunResult } from "@/lib/agent-dry-run";
import type { AgentHandoffCommand } from "@/lib/agent-handoff-command";
import type {
  AgentHardStopContract,
  AgentHardStopId,
} from "@/lib/agent-hard-stop-contract";
import type { TradeExecutionPayload } from "@/lib/execution-payload";

export type AgentFormMappingStatus =
  | "ready"
  | "warning"
  | "blocked"
  | "missing"
  | "not_applicable";

export type AgentFormMappingConfidence =
  | "high"
  | "medium"
  | "low"
  | "unknown";

export type AgentFormMappingSource =
  | "execution_payload"
  | "agent_handoff_command"
  | "hard_stop_contract"
  | "recommendation"
  | "derived"
  | "manual_review_required";

export type AgentFormFieldMapping = {
  field_id:
    | "instrument_search"
    | "order_side"
    | "quantity"
    | "price_type"
    | "limit_price"
    | "estimated_entry_reference"
    | "stop_loss_reference"
    | "take_profit_reference"
    | "currency"
    | "broker"
    | "stop_before_final_confirmation";
  broker_field_label: string;
  trade_value: string | number | boolean | null;
  display_value: string;
  source: AgentFormMappingSource;
  source_path: string;
  required: boolean;
  editable_by_agent: boolean;
  must_match_broker_ui: boolean;
  confidence: AgentFormMappingConfidence;
  status: AgentFormMappingStatus;
  related_hard_stop_ids: AgentHardStopId[];
  notes: string[];
};

export type AgentFormMappingPreview = {
  preview_id: string;
  preview_version: "1.0";
  created_at: string;
  expires_at: string | null;
  broker: "AVANZA";
  mode: "simulation_only" | "prepare_only_preview";
  handoff_session_id: string | null;
  payload_id: string | null;
  command_id: string | null;
  hard_stop_contract_status: AgentHardStopContract["overall_status"];
  overall_status: "ready" | "warning" | "blocked";
  can_prepare_form: boolean;
  can_continue_to_manual_review: boolean;
  field_mappings: AgentFormFieldMapping[];
  blocking_reasons: string[];
  warning_reasons: string[];
  forbidden_actions: AgentHandoffCommand["forbidden_actions"];
  required_human_review: AgentHandoffCommand["required_human_actions"];
  safety_summary: string[];
  notes: string[];
};

export type AgentFormMappingPreviewMetadataSnapshot = {
  preview_id: string;
  preview_version: AgentFormMappingPreview["preview_version"];
  overall_status: AgentFormMappingPreview["overall_status"];
  can_prepare_form: boolean;
  field_count: number;
  ready_count: number;
  warning_count: number;
  blocked_count: number;
  missing_count: number;
  generated_at: string;
  expires_at: string | null;
};

export type BuildAgentFormMappingPreviewInput = {
  payload?: TradeExecutionPayload | null;
  command: AgentHandoffCommand;
  hardStopContract: AgentHardStopContract;
  recommendation?: {
    ticker?: string | null;
    companyName?: string | null;
  } | null;
  dryRunResult?: AgentDryRunResult | null;
  now?: Date;
  createdAt?: string;
};

type FieldDefinition = {
  field_id: AgentFormFieldMapping["field_id"];
  broker_field_label: string;
  source: AgentFormMappingSource;
  source_path: string;
  required: boolean;
  editable_by_agent: boolean;
  must_match_broker_ui: boolean;
  related_hard_stop_ids: AgentHardStopId[];
  notes: string[];
  value: string | number | boolean | null;
  displayValue?: string;
  baseConfidence?: AgentFormMappingConfidence;
};

function sanitizeIdPart(value: string | null | undefined) {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "missing";
}

function displayValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function moneyValue(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function relatedRules(
  contract: AgentHardStopContract,
  ids: AgentHardStopId[],
) {
  return contract.rules.filter((rule) => ids.includes(rule.id));
}

function hasValue(value: unknown) {
  return value !== null && value !== undefined && value !== "";
}

function fieldStatus(
  definition: FieldDefinition,
  contract: AgentHardStopContract,
): AgentFormMappingStatus {
  const rules = relatedRules(contract, definition.related_hard_stop_ids);
  const hasMissingHardStop = rules.some(
    (rule) =>
      rule.status === "failed" &&
      rule.id.startsWith("missing_") &&
      rule.id !== "missing_submit_guard" &&
      rule.id !== "missing_human_confirmation_requirement",
  );
  const hasBlockingHardStop = rules.some(
    (rule) =>
      (rule.status === "failed" || rule.status === "unknown") &&
      rule.blocks_agent,
  );
  const hasWarning = rules.some(
    (rule) => rule.status === "warning" || rule.status === "unknown",
  );

  if (definition.required && !hasValue(definition.value)) {
    return "missing";
  }

  if (definition.required && hasMissingHardStop) {
    return "missing";
  }

  if (hasBlockingHardStop) {
    return "blocked";
  }

  if (!definition.required && !hasValue(definition.value)) {
    return "not_applicable";
  }

  if (hasWarning) {
    return "warning";
  }

  return "ready";
}

function fieldConfidence(
  definition: FieldDefinition,
  status: AgentFormMappingStatus,
  contract: AgentHardStopContract,
): AgentFormMappingConfidence {
  const rules = relatedRules(contract, definition.related_hard_stop_ids);
  const hasFailedRule = rules.some(
    (rule) => rule.status === "failed" || rule.status === "unknown",
  );

  if (status === "missing" || !hasValue(definition.value)) {
    return "unknown";
  }

  if (hasFailedRule || status === "blocked") {
    return "unknown";
  }

  if (definition.baseConfidence) {
    return definition.baseConfidence;
  }

  if (
    definition.source === "execution_payload" ||
    definition.source === "agent_handoff_command" ||
    definition.source === "hard_stop_contract"
  ) {
    return "high";
  }

  if (definition.source === "recommendation" || definition.source === "derived") {
    return "medium";
  }

  return "low";
}

function buildField(
  definition: FieldDefinition,
  contract: AgentHardStopContract,
): AgentFormFieldMapping {
  const status = fieldStatus(definition, contract);

  return {
    field_id: definition.field_id,
    broker_field_label: definition.broker_field_label,
    trade_value: definition.value,
    display_value: definition.displayValue ?? displayValue(definition.value),
    source: definition.source,
    source_path: definition.source_path,
    required: definition.required,
    editable_by_agent: definition.editable_by_agent,
    must_match_broker_ui: definition.must_match_broker_ui,
    confidence: fieldConfidence(definition, status, contract),
    status,
    related_hard_stop_ids: definition.related_hard_stop_ids,
    notes: definition.notes,
  };
}

export function buildAgentFormMappingPreview({
  payload,
  command,
  hardStopContract,
  recommendation,
  dryRunResult,
  now = new Date(),
  createdAt,
}: BuildAgentFormMappingPreviewInput): AgentFormMappingPreview {
  const created_at = createdAt ?? now.toISOString();
  const ticker = command.instrument.ticker_symbol ?? payload?.ticker ?? null;
  const companyName =
    command.instrument.company_name ??
    recommendation?.companyName?.trim() ??
    null;
  const instrumentDisplay =
    ticker && companyName ? `${ticker} · ${companyName}` : ticker ?? companyName;
  const side = command.order_intent.side;
  const quantity = command.order_intent.quantity;
  const orderType = command.order_intent.order_type;
  const limitPrice = command.order_intent.limit_price;
  const entryPrice = command.order_intent.estimated_entry_price;
  const stopLoss = command.order_intent.stop_loss_reference;
  const targetPrice = command.order_intent.take_profit_reference;
  const currency = command.instrument.currency ?? command.form_fields.currency;
  const stopBeforeFinalConfirmation = command.stop_before.includes(
    "final_broker_confirmation",
  );
  const exactLabelNote =
    "Exact broker UI label must be verified manually before real agent use.";
  const dryRunNote = dryRunResult
    ? `Pre-agent dry run status: ${dryRunResult.status}.`
    : "Pre-agent dry run has not been run.";

  const fieldDefinitions: FieldDefinition[] = [
    {
      field_id: "instrument_search",
      broker_field_label: "Instrument / Search",
      value: instrumentDisplay,
      source: "agent_handoff_command",
      source_path: "agent_handoff_command.instrument",
      required: true,
      editable_by_agent: true,
      must_match_broker_ui: true,
      related_hard_stop_ids: ["missing_ticker", "broker_not_avanza"],
      notes: [exactLabelNote, "Agent must verify the selected instrument matches Trade."],
    },
    {
      field_id: "order_side",
      broker_field_label: "Buy/Sell",
      value: side === "buy" ? "Buy" : null,
      source: "agent_handoff_command",
      source_path: "agent_handoff_command.order_intent.side",
      required: true,
      editable_by_agent: true,
      must_match_broker_ui: true,
      related_hard_stop_ids: ["missing_side", "order_intent_not_prepare_only"],
      notes: [exactLabelNote, "Only buy/long prepare-only handoff is supported."],
    },
    {
      field_id: "quantity",
      broker_field_label: "Antal / Quantity",
      value: quantity,
      source: "agent_handoff_command",
      source_path: "agent_handoff_command.order_intent.quantity",
      required: true,
      editable_by_agent: true,
      must_match_broker_ui: true,
      related_hard_stop_ids: ["missing_quantity"],
      notes: [exactLabelNote],
    },
    {
      field_id: "price_type",
      broker_field_label: "Order Type / Limit",
      value: orderType,
      displayValue: orderType ? orderType.toUpperCase() : "—",
      source: "agent_handoff_command",
      source_path: "agent_handoff_command.order_intent.order_type",
      required: true,
      editable_by_agent: true,
      must_match_broker_ui: true,
      related_hard_stop_ids: ["order_intent_not_prepare_only"],
      notes: [exactLabelNote, "Current payloads use limit order intent."],
      baseConfidence: "medium",
    },
    {
      field_id: "limit_price",
      broker_field_label: "Limit Price",
      value: limitPrice,
      displayValue: moneyValue(limitPrice),
      source: "agent_handoff_command",
      source_path: "agent_handoff_command.order_intent.limit_price",
      required: orderType === "limit",
      editable_by_agent: true,
      must_match_broker_ui: true,
      related_hard_stop_ids: ["missing_entry_price"],
      notes: [exactLabelNote, "Limit price should match the planned entry context."],
      baseConfidence: "medium",
    },
    {
      field_id: "estimated_entry_reference",
      broker_field_label: "Estimated Entry Reference",
      value: entryPrice,
      displayValue: moneyValue(entryPrice),
      source: "agent_handoff_command",
      source_path: "agent_handoff_command.order_intent.estimated_entry_price",
      required: true,
      editable_by_agent: false,
      must_match_broker_ui: false,
      related_hard_stop_ids: ["missing_entry_price"],
      notes: ["Review-only Trade reference for human confirmation."],
    },
    {
      field_id: "stop_loss_reference",
      broker_field_label: "Stop Loss Reference",
      value: stopLoss,
      displayValue: moneyValue(stopLoss),
      source: "agent_handoff_command",
      source_path: "agent_handoff_command.order_intent.stop_loss_reference",
      required: true,
      editable_by_agent: false,
      must_match_broker_ui: false,
      related_hard_stop_ids: ["missing_stop_price"],
      notes: [
        "Review-only unless a future broker workflow explicitly supports stop setup.",
      ],
    },
    {
      field_id: "take_profit_reference",
      broker_field_label: "Take Profit Reference",
      value: targetPrice,
      displayValue: moneyValue(targetPrice),
      source: "agent_handoff_command",
      source_path: "agent_handoff_command.order_intent.take_profit_reference",
      required: true,
      editable_by_agent: false,
      must_match_broker_ui: false,
      related_hard_stop_ids: ["missing_target_price"],
      notes: [
        "Review-only unless a future broker workflow explicitly supports target setup.",
      ],
    },
    {
      field_id: "currency",
      broker_field_label: "Currency",
      value: currency,
      source: "agent_handoff_command",
      source_path: "agent_handoff_command.instrument.currency",
      required: false,
      editable_by_agent: false,
      must_match_broker_ui: true,
      related_hard_stop_ids: ["unknown_required_field"],
      notes: ["Currency is derived from the US market payload when available."],
      baseConfidence: currency ? "medium" : "unknown",
    },
    {
      field_id: "broker",
      broker_field_label: "Broker",
      value: command.broker,
      source: "agent_handoff_command",
      source_path: "agent_handoff_command.broker",
      required: true,
      editable_by_agent: false,
      must_match_broker_ui: true,
      related_hard_stop_ids: ["broker_not_avanza"],
      notes: ["Only AVANZA mapping preview is supported."],
    },
    {
      field_id: "stop_before_final_confirmation",
      broker_field_label: "Stop Before Final Confirmation",
      value: stopBeforeFinalConfirmation,
      source: "hard_stop_contract",
      source_path: "agent_handoff_command.stop_before",
      required: true,
      editable_by_agent: false,
      must_match_broker_ui: false,
      related_hard_stop_ids: [
        "missing_submit_guard",
        "missing_human_confirmation_requirement",
        "unknown_broker_ui_state",
        "unsafe_to_continue",
      ],
      notes: [
        "Agent must stop before final broker confirmation.",
        "Human must manually click final buy or sell in Avanza.",
      ],
    },
  ];

  const field_mappings = fieldDefinitions.map((definition) =>
    buildField(definition, hardStopContract),
  );
  const blockedOrMissingRequired = field_mappings.filter(
    (field) =>
      field.required &&
      (field.status === "blocked" || field.status === "missing"),
  );
  const warningFields = field_mappings.filter(
    (field) => field.status === "warning" || field.confidence === "unknown",
  );
  const overall_status: AgentFormMappingPreview["overall_status"] =
    hardStopContract.overall_status === "blocked" ||
    blockedOrMissingRequired.length > 0
      ? "blocked"
      : hardStopContract.overall_status === "warning" || warningFields.length > 0
        ? "warning"
        : "ready";
  const can_prepare_form =
    hardStopContract.can_prepare_broker_form &&
    blockedOrMissingRequired.length === 0;

  return {
    preview_id: `form_mapping_${sanitizeIdPart(
      command.handoff_session_id,
    )}_${sanitizeIdPart(command.payload_id)}_${sanitizeIdPart(command.command_id)}`,
    preview_version: "1.0",
    created_at,
    expires_at: command.expires_at,
    broker: "AVANZA",
    mode: "simulation_only",
    handoff_session_id: command.handoff_session_id,
    payload_id: command.payload_id,
    command_id: command.command_id,
    hard_stop_contract_status: hardStopContract.overall_status,
    overall_status,
    can_prepare_form,
    can_continue_to_manual_review: can_prepare_form && overall_status !== "blocked",
    field_mappings,
    blocking_reasons: [
      ...hardStopContract.top_blockers.map((rule) => rule.label),
      ...blockedOrMissingRequired.map((field) => field.broker_field_label),
    ].filter((item, index, list) => list.indexOf(item) === index),
    warning_reasons: [
      ...hardStopContract.top_warnings.map((rule) => rule.label),
      ...warningFields.map((field) => field.broker_field_label),
    ].filter((item, index, list) => list.indexOf(item) === index),
    forbidden_actions: command.forbidden_actions,
    required_human_review: command.required_human_actions,
    safety_summary: [
      "This is a simulation-only form mapping preview.",
      "No browser is controlled and no order is submitted.",
      "A future agent must stop before final broker confirmation.",
      dryRunNote,
    ],
    notes: [
      "Exact Avanza labels must be verified before browser-agent implementation.",
      "Agent must stop on unknown UI state.",
      "Human must manually review and confirm final order.",
    ],
  };
}

export function toAgentFormMappingPreviewMetadataSnapshot(
  preview: AgentFormMappingPreview,
): AgentFormMappingPreviewMetadataSnapshot {
  return {
    preview_id: preview.preview_id,
    preview_version: preview.preview_version,
    overall_status: preview.overall_status,
    can_prepare_form: preview.can_prepare_form,
    field_count: preview.field_mappings.length,
    ready_count: preview.field_mappings.filter((field) => field.status === "ready")
      .length,
    warning_count: preview.field_mappings.filter(
      (field) => field.status === "warning",
    ).length,
    blocked_count: preview.field_mappings.filter(
      (field) => field.status === "blocked",
    ).length,
    missing_count: preview.field_mappings.filter(
      (field) => field.status === "missing",
    ).length,
    generated_at: preview.created_at,
    expires_at: preview.expires_at,
  };
}
