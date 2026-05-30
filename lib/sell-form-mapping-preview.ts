import type { TradeExitExecutionPayload } from "@/lib/exit-execution-payload";
import type { SellAgentHandoffCommand } from "@/lib/sell-agent-handoff-command";
import type {
  SellHardStopContract,
  SellHardStopId,
} from "@/lib/sell-hard-stop-contract";

export type SellFormMappingStatus =
  | "ready"
  | "warning"
  | "blocked"
  | "missing"
  | "not_applicable";

export type SellFormMappingConfidence =
  | "high"
  | "medium"
  | "low"
  | "unknown";

export type SellFormMappingSource =
  | "exit_execution_payload"
  | "sell_agent_handoff_command"
  | "sell_hard_stop_contract"
  | "position_snapshot"
  | "risk_snapshot"
  | "derived"
  | "manual_review_required";

export type SellFormFieldMapping = {
  field_id:
    | "instrument_search"
    | "order_side"
    | "quantity"
    | "price_type"
    | "price_reference"
    | "currency"
    | "broker"
    | "stop_before_final_confirmation"
    | "entry_price"
    | "current_price"
    | "unrealized_pnl"
    | "current_r"
    | "stop_price"
    | "target_price"
    | "close_reason"
    | "rule_action"
    | "time_in_trade";
  broker_field_label: string;
  trade_value: string | number | boolean | null;
  display_value: string;
  source: SellFormMappingSource;
  source_path: string;
  required: boolean;
  editable_by_agent: boolean;
  must_match_broker_ui: boolean;
  confidence: SellFormMappingConfidence;
  status: SellFormMappingStatus;
  related_hard_stop_ids: SellHardStopId[];
  notes: string[];
};

export type SellFormMappingPreview = {
  preview_id: string;
  preview_version: "1.0";
  preview_kind: "sell_form_mapping_preview";
  created_at: string;
  expires_at: string | null;
  broker: "AVANZA";
  mode: "simulation_only" | "prepare_only_preview";
  handoff_session_id: string | null;
  payload_id: string | null;
  command_id: string | null;
  hard_stop_contract_status: SellHardStopContract["overall_status"];
  overall_status: "ready" | "warning" | "blocked";
  can_prepare_sell_form: boolean;
  can_continue_to_manual_review: boolean;
  field_mappings: SellFormFieldMapping[];
  blocking_reasons: string[];
  warning_reasons: string[];
  forbidden_actions: SellAgentHandoffCommand["forbidden_actions"];
  required_human_review: SellAgentHandoffCommand["required_human_actions"];
  safety_summary: string[];
  notes: string[];
};

export type BuildSellFormMappingPreviewInput = {
  payload?: TradeExitExecutionPayload | null;
  command: SellAgentHandoffCommand;
  hardStopContract: SellHardStopContract;
  now?: Date;
  createdAt?: string;
};

type FieldDefinition = {
  field_id: SellFormFieldMapping["field_id"];
  broker_field_label: string;
  value: string | number | boolean | null;
  displayValue?: string;
  source: SellFormMappingSource;
  source_path: string;
  required: boolean;
  editable_by_agent: boolean;
  must_match_broker_ui: boolean;
  related_hard_stop_ids: SellHardStopId[];
  notes: string[];
  baseConfidence?: SellFormMappingConfidence;
};

export type SellFormMappingFieldCounts = {
  field_count: number;
  ready_count: number;
  warning_count: number;
  blocked_count: number;
  missing_count: number;
};

const exactSellLabelNote =
  "Exact Avanza sell field label must be verified before real browser-agent use.";

function sanitizeIdPart(value: string | null | undefined) {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "missing";
}

function hasValue(value: unknown) {
  return value !== null && value !== undefined && value !== "";
}

function displayValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value).replaceAll("_", " ");
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

function signedMoneyValue(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${moneyValue(value)}`;
}

function rValue(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}R`;
}

function timeInTradeValue(seconds: number | null | undefined) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) {
    return "—";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function relatedRules(
  contract: SellHardStopContract,
  ids: SellHardStopId[],
) {
  return contract.rules.filter((rule) => ids.includes(rule.id));
}

function fieldStatus(
  definition: FieldDefinition,
  contract: SellHardStopContract,
): SellFormMappingStatus {
  const rules = relatedRules(contract, definition.related_hard_stop_ids);
  const hasMissingHardStop = rules.some(
    (rule) =>
      rule.status === "failed" &&
      (rule.id.startsWith("missing_") ||
        rule.id === "quantity_to_sell_invalid"),
  );
  const hasBlockingHardStop = rules.some(
    (rule) =>
      (rule.status === "failed" || rule.status === "unknown") &&
      rule.blocks_sell_handoff,
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
  status: SellFormMappingStatus,
  contract: SellHardStopContract,
): SellFormMappingConfidence {
  const rules = relatedRules(contract, definition.related_hard_stop_ids);
  const hasFailedRule = rules.some(
    (rule) => rule.status === "failed" || rule.status === "unknown",
  );
  const exactLabelsUnverified = rules.some(
    (rule) =>
      rule.id === "exact_broker_labels_unverified" &&
      rule.status === "warning",
  );

  if (status === "missing" || !hasValue(definition.value)) {
    return "unknown";
  }

  if (hasFailedRule || status === "blocked") {
    return "unknown";
  }

  if (exactLabelsUnverified && definition.must_match_broker_ui) {
    return definition.baseConfidence === "high" ? "medium" : "medium";
  }

  if (definition.baseConfidence) {
    return definition.baseConfidence;
  }

  if (
    definition.source === "exit_execution_payload" ||
    definition.source === "sell_agent_handoff_command" ||
    definition.source === "sell_hard_stop_contract" ||
    definition.source === "position_snapshot" ||
    definition.source === "risk_snapshot"
  ) {
    return "high";
  }

  if (definition.source === "derived") {
    return "medium";
  }

  return "low";
}

function buildField(
  definition: FieldDefinition,
  contract: SellHardStopContract,
): SellFormFieldMapping {
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

export function getSellFormMappingFieldCounts(
  preview: SellFormMappingPreview,
): SellFormMappingFieldCounts {
  return {
    field_count: preview.field_mappings.length,
    ready_count: preview.field_mappings.filter(
      (field) => field.status === "ready",
    ).length,
    warning_count: preview.field_mappings.filter(
      (field) => field.status === "warning",
    ).length,
    blocked_count: preview.field_mappings.filter(
      (field) => field.status === "blocked",
    ).length,
    missing_count: preview.field_mappings.filter(
      (field) => field.status === "missing",
    ).length,
  };
}

export function buildSellFormMappingPreview({
  payload,
  command,
  hardStopContract,
  now = new Date(),
  createdAt,
}: BuildSellFormMappingPreviewInput): SellFormMappingPreview {
  const created_at = createdAt ?? now.toISOString();
  const instrumentDisplay =
    command.form_fields.instrument_search ??
    (command.instrument.ticker_symbol && command.instrument.company_name
      ? `${command.instrument.ticker_symbol} · ${command.instrument.company_name}`
      : command.instrument.ticker_symbol ?? command.instrument.company_name);
  const stopBeforeFinalConfirmation = command.stop_before.includes(
    "final_broker_confirmation",
  );
  const fieldDefinitions: FieldDefinition[] = [
    {
      field_id: "instrument_search",
      broker_field_label: "Instrument / Search",
      value: instrumentDisplay,
      source: "sell_agent_handoff_command",
      source_path: "sell_agent_handoff_command.form_fields.instrument_search",
      required: true,
      editable_by_agent: true,
      must_match_broker_ui: true,
      related_hard_stop_ids: [
        "missing_ticker",
        "missing_company_name",
        "broker_not_avanza",
        "exact_broker_labels_unverified",
      ],
      notes: [
        exactSellLabelNote,
        "Agent must verify the selected instrument matches Trade and Avanza.",
      ],
    },
    {
      field_id: "order_side",
      broker_field_label: "Buy/Sell",
      value: command.order_intent.side === "SELL" ? "Sell" : null,
      source: "sell_agent_handoff_command",
      source_path: "sell_agent_handoff_command.order_intent.side",
      required: true,
      editable_by_agent: true,
      must_match_broker_ui: true,
      related_hard_stop_ids: [
        "order_intent_not_sell",
        "exact_broker_labels_unverified",
      ],
      notes: [exactSellLabelNote, "Only SELL close-position intent is supported."],
      baseConfidence: "high",
    },
    {
      field_id: "quantity",
      broker_field_label: "Antal / Quantity",
      value: command.order_intent.quantity_to_sell,
      source: "sell_agent_handoff_command",
      source_path: "sell_agent_handoff_command.order_intent.quantity_to_sell",
      required: true,
      editable_by_agent: true,
      must_match_broker_ui: true,
      related_hard_stop_ids: [
        "missing_quantity_to_sell",
        "quantity_to_sell_invalid",
        "quantity_exceeds_open_position",
        "exact_broker_labels_unverified",
      ],
      notes: [
        exactSellLabelNote,
        "Position quantity must match the broker account before final confirmation.",
      ],
    },
    {
      field_id: "price_type",
      broker_field_label: "Order Type",
      value: command.order_intent.order_type,
      displayValue: displayValue(command.order_intent.order_type),
      source: "sell_agent_handoff_command",
      source_path: "sell_agent_handoff_command.order_intent.order_type",
      required: false,
      editable_by_agent: true,
      must_match_broker_ui: true,
      related_hard_stop_ids: ["exact_broker_labels_unverified"],
      notes: [
        exactSellLabelNote,
        "Review order type in Avanza before manual SÄLJ confirmation.",
      ],
      baseConfidence:
        command.order_intent.order_type === "review_required" ? "low" : "medium",
    },
    {
      field_id: "price_reference",
      broker_field_label: "Limit Price / Price Reference",
      value: command.order_intent.price_reference,
      displayValue: moneyValue(command.order_intent.price_reference),
      source: "sell_agent_handoff_command",
      source_path: "sell_agent_handoff_command.order_intent.price_reference",
      required: true,
      editable_by_agent: true,
      must_match_broker_ui: true,
      related_hard_stop_ids: [
        "missing_exit_price_reference",
        "missing_current_price",
        "exact_broker_labels_unverified",
      ],
      notes: [
        exactSellLabelNote,
        "Price reference is for prepare-only review; final Avanza price must be manually confirmed.",
      ],
    },
    {
      field_id: "currency",
      broker_field_label: "Currency",
      value: command.instrument.currency ?? payload?.order_intent.currency ?? null,
      source: "exit_execution_payload",
      source_path: "exit_execution_payload.order_intent.currency",
      required: false,
      editable_by_agent: false,
      must_match_broker_ui: true,
      related_hard_stop_ids: ["exact_broker_labels_unverified"],
      notes: ["Currency is derived from the sell payload when available."],
      baseConfidence: command.instrument.currency ? "medium" : "unknown",
    },
    {
      field_id: "broker",
      broker_field_label: "Broker",
      value: command.broker,
      source: "sell_agent_handoff_command",
      source_path: "sell_agent_handoff_command.broker",
      required: true,
      editable_by_agent: false,
      must_match_broker_ui: true,
      related_hard_stop_ids: [
        "broker_not_avanza",
        "broker_mode_not_prepare_only",
      ],
      notes: ["Only AVANZA sell mapping preview is supported."],
      baseConfidence: "high",
    },
    {
      field_id: "stop_before_final_confirmation",
      broker_field_label: "Stop Before Final Confirmation",
      value: stopBeforeFinalConfirmation,
      source: "sell_hard_stop_contract",
      source_path: "sell_agent_handoff_command.stop_before",
      required: true,
      editable_by_agent: false,
      must_match_broker_ui: false,
      related_hard_stop_ids: [
        "missing_submit_guard",
        "missing_human_confirmation_requirement",
        "missing_stop_before_final_confirmation",
        "unknown_broker_ui_state",
        "unsafe_to_continue",
      ],
      notes: [
        "Agent must stop before final Avanza confirmation.",
        "Human must manually click final SÄLJ in Avanza.",
      ],
    },
    {
      field_id: "entry_price",
      broker_field_label: "Entry Price Reference",
      value: command.review_fields.entry_price,
      displayValue: moneyValue(command.review_fields.entry_price),
      source: "position_snapshot",
      source_path: "sell_agent_handoff_command.review_fields.entry_price",
      required: false,
      editable_by_agent: false,
      must_match_broker_ui: false,
      related_hard_stop_ids: [],
      notes: ["Review-only Trade reference for human exit review."],
    },
    {
      field_id: "current_price",
      broker_field_label: "Current Price Reference",
      value: command.review_fields.current_price,
      displayValue: moneyValue(command.review_fields.current_price),
      source: "position_snapshot",
      source_path: "sell_agent_handoff_command.review_fields.current_price",
      required: false,
      editable_by_agent: false,
      must_match_broker_ui: false,
      related_hard_stop_ids: ["missing_current_price"],
      notes: ["Review-only price context from Trade."],
    },
    {
      field_id: "unrealized_pnl",
      broker_field_label: "Unrealized PnL",
      value: command.review_fields.unrealized_pnl,
      displayValue: signedMoneyValue(command.review_fields.unrealized_pnl),
      source: "risk_snapshot",
      source_path: "sell_agent_handoff_command.review_fields.unrealized_pnl",
      required: false,
      editable_by_agent: false,
      must_match_broker_ui: false,
      related_hard_stop_ids: [],
      notes: ["Review-only risk context."],
    },
    {
      field_id: "current_r",
      broker_field_label: "Current R",
      value: command.review_fields.current_r,
      displayValue: rValue(command.review_fields.current_r),
      source: "risk_snapshot",
      source_path: "sell_agent_handoff_command.review_fields.current_r",
      required: false,
      editable_by_agent: false,
      must_match_broker_ui: false,
      related_hard_stop_ids: [],
      notes: ["Review-only risk context."],
    },
    {
      field_id: "stop_price",
      broker_field_label: "Stop Price Reference",
      value: command.review_fields.stop_price,
      displayValue: moneyValue(command.review_fields.stop_price),
      source: "position_snapshot",
      source_path: "sell_agent_handoff_command.review_fields.stop_price",
      required: false,
      editable_by_agent: false,
      must_match_broker_ui: false,
      related_hard_stop_ids: [],
      notes: ["Review-only Trade reference."],
    },
    {
      field_id: "target_price",
      broker_field_label: "Target Price Reference",
      value: command.review_fields.target_price,
      displayValue: moneyValue(command.review_fields.target_price),
      source: "position_snapshot",
      source_path: "sell_agent_handoff_command.review_fields.target_price",
      required: false,
      editable_by_agent: false,
      must_match_broker_ui: false,
      related_hard_stop_ids: [],
      notes: ["Review-only Trade reference."],
    },
    {
      field_id: "close_reason",
      broker_field_label: "Close Reason",
      value:
        command.exit_context.exit_reason ??
        command.exit_context.close_reason ??
        null,
      source: "exit_execution_payload",
      source_path: "exit_execution_payload.exit_context",
      required: false,
      editable_by_agent: false,
      must_match_broker_ui: false,
      related_hard_stop_ids: ["missing_exit_reason"],
      notes: ["Review-only close context for the human reviewer."],
    },
    {
      field_id: "rule_action",
      broker_field_label: "Rule / Recommended Action",
      value:
        command.exit_context.rule_action ??
        command.exit_context.app_recommended_action ??
        null,
      source: "exit_execution_payload",
      source_path: "exit_execution_payload.exit_context.rule_action",
      required: false,
      editable_by_agent: false,
      must_match_broker_ui: false,
      related_hard_stop_ids: [],
      notes: ["Review-only app guidance."],
    },
    {
      field_id: "time_in_trade",
      broker_field_label: "Time In Trade",
      value: command.review_fields.time_in_trade_seconds,
      displayValue: timeInTradeValue(command.review_fields.time_in_trade_seconds),
      source: "position_snapshot",
      source_path: "sell_agent_handoff_command.review_fields.time_in_trade_seconds",
      required: false,
      editable_by_agent: false,
      must_match_broker_ui: false,
      related_hard_stop_ids: [],
      notes: ["Review-only timing context."],
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
    (field) =>
      field.status === "warning" ||
      field.status === "blocked" ||
      field.confidence === "unknown",
  );
  const overall_status: SellFormMappingPreview["overall_status"] =
    hardStopContract.overall_status === "blocked" ||
    blockedOrMissingRequired.length > 0
      ? "blocked"
      : hardStopContract.overall_status === "warning" || warningFields.length > 0
        ? "warning"
        : "ready";
  const can_prepare_sell_form = overall_status !== "blocked";

  return {
    preview_id: `sell_form_mapping_${sanitizeIdPart(
      command.handoff_session_id,
    )}_${sanitizeIdPart(command.payload_id)}_${sanitizeIdPart(command.command_id)}`,
    preview_version: "1.0",
    preview_kind: "sell_form_mapping_preview",
    created_at,
    expires_at: command.expires_at,
    broker: "AVANZA",
    mode: "simulation_only",
    handoff_session_id: command.handoff_session_id,
    payload_id: command.payload_id,
    command_id: command.command_id,
    hard_stop_contract_status: hardStopContract.overall_status,
    overall_status,
    can_prepare_sell_form,
    can_continue_to_manual_review: overall_status !== "blocked",
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
      "This is a simulation-only sell form mapping preview.",
      "No browser is controlled and no order is submitted.",
      "A future agent must stop before final Avanza confirmation.",
      "Human must manually review and confirm final sell order.",
    ],
    notes: [
      "Exact Avanza sell labels must be verified before browser-agent implementation.",
      "Agent must stop on unknown UI state.",
      "Human must manually review and confirm final sell order.",
      "Position quantity must match the broker account before final confirmation.",
    ],
  };
}

export function sellFormMappingPreviewJson(preview: SellFormMappingPreview) {
  return JSON.stringify(preview, null, 2);
}
