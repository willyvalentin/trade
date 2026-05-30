import { normalizeSetupType, type SetupType } from "@/lib/setup-types";
import {
  normalizeBrokerCostModel,
  type BrokerCostEstimate,
  type BrokerCostModel,
} from "@/lib/broker-costs";
import type {
  HandoffIntegritySnapshot,
  HandoffIntegrityStatus,
} from "@/lib/handoff-integrity";
import type {
  HandoffQualityRating,
  HandoffQualitySnapshot,
} from "@/lib/handoff-quality";
import type { AgentHandoffCommandMetadataSnapshot } from "@/lib/agent-handoff-command";
import type {
  AgentHardStopContractMetadataSnapshot,
  AgentHardStopId,
} from "@/lib/agent-hard-stop-contract";
import type { AgentFormMappingPreviewMetadataSnapshot } from "@/lib/agent-form-mapping-preview";
import {
  parseBrokerExitConfirmation,
  type BrokerExitConfirmation,
} from "@/lib/broker-exit-confirmation";
import {
  buildPartialPositionState,
  normalizeEntryFill,
  normalizeExitFill,
  type PartialPositionStatus,
  type TradeExitFill,
  type TradeFill,
} from "@/lib/partial-position-accounting";
import {
  normalizeTradePlanningSnapshot,
  type TradePlanningSnapshot,
} from "@/lib/trade-planning-snapshot";

export type BrokerOrderStatus =
  | "filled"
  | "partially_filled"
  | "submitted_not_filled";

export type BrokerExecutionMetadata = {
  schema_version: "1.0";
  broker_hint: "AVANZA";
  broker_order_status: BrokerOrderStatus;
  broker_reference_note: string | null;
  broker_confirmed_at: string;
  planned_entry_price: number | null;
  actual_fill_price: number | null;
  planned_shares: number | null;
  actual_shares: number | null;
  planned_stop_loss: number | null;
  planned_target_price: number | null;
  planned_position_value: number | null;
  actual_position_value: number | null;
  planned_max_loss_at_stop: number | null;
  actual_max_loss_at_stop: number | null;
  execution_payload_id: string | null;
  execution_payload_fingerprint: string | null;
  execution_payload_version: string | null;
  handoff_session_id: string | null;
  recommendation_id: string | null;
  setup_type: SetupType | "UNKNOWN";
  validation_status: string | null;
  created_from: "add_trade_modal";
  manual_confirmation_required: true;
  broker_execution_mode: "manual_final_confirmation";
  broker_cost_model_snapshot: BrokerCostModel | null;
  broker_cost_estimate: BrokerCostEstimate | null;
  estimated_total_trading_cost: number | null;
  estimated_entry_commission: number | null;
  estimated_exit_commission: number | null;
  estimated_fx_fee: number | null;
  estimated_net_r: number | null;
  estimated_break_even_price: number | null;
  broker_order_preview: BrokerOrderPreviewCapture | null;
  handoff_integrity?: HandoffIntegritySnapshot | null;
  handoff_quality?: HandoffQualitySnapshot | null;
  agent_handoff_command?: AgentHandoffCommandMetadataSnapshot | null;
  agent_hard_stop_contract?: AgentHardStopContractMetadataSnapshot | null;
  agent_form_mapping_preview?: AgentFormMappingPreviewMetadataSnapshot | null;
  broker_exit_confirmation?: BrokerExitConfirmation | null;
  entry_fills: TradeFill[];
  exit_fills: TradeExitFill[];
  planned_quantity: number | null;
  actual_entry_shares: number | null;
  remaining_shares: number | null;
  partial_position_status: PartialPositionStatus;
  average_exit_price: number | null;
  realized_pnl_from_exits: number | null;
  trade_planning_snapshot: TradePlanningSnapshot | null;
};

export type BrokerOrderPreviewCapture = {
  captured_at: string;
  preview_commission: number | null;
  preview_fx_fee: number | null;
  preview_total_estimated_cost: number | null;
  buying_power_status: "ok" | "warning" | "insufficient" | "unknown";
  warning_type:
    | "none"
    | "price_warning"
    | "liquidity_warning"
    | "buying_power_warning"
    | "instrument_warning"
    | "other";
  warning_text: string | null;
  screenshot_reference_note: string | null;
  source: "manual_user_entry";
};

export type BrokerPreviewDifference = {
  commission_difference: number | null;
  fx_fee_difference: number | null;
  total_cost_difference: number | null;
};

type BrokerExecutionMetadataInput = {
  brokerOrderStatus?: BrokerOrderStatus | string | null;
  brokerReferenceNote?: string | null;
  brokerConfirmedAt?: string | null;
  plannedEntryPrice?: number | null;
  actualFillPrice?: number | null;
  plannedShares?: number | null;
  actualShares?: number | null;
  plannedStopLoss?: number | null;
  plannedTargetPrice?: number | null;
  plannedPositionValue?: number | null;
  actualPositionValue?: number | null;
  plannedMaxLossAtStop?: number | null;
  actualMaxLossAtStop?: number | null;
  executionPayloadId?: string | null;
  executionPayloadFingerprint?: string | null;
  executionPayloadVersion?: string | null;
  handoffSessionId?: string | null;
  recommendationId?: string | null;
  setupType?: unknown;
  validationStatus?: string | null;
  brokerCostModelSnapshot?: unknown;
  brokerCostEstimate?: unknown;
  brokerOrderPreview?: unknown;
  handoffIntegrity?: unknown;
  handoffQuality?: unknown;
  agentHandoffCommand?: unknown;
  agentHardStopContract?: unknown;
  agentFormMappingPreview?: unknown;
  brokerExitConfirmation?: unknown;
  entryFills?: unknown;
  exitFills?: unknown;
  plannedQuantity?: number | null;
  actualEntryShares?: number | null;
  remainingShares?: number | null;
  partialPositionStatus?: string | null;
  averageExitPrice?: number | null;
  realizedPnlFromExits?: number | null;
  tradePlanningSnapshot?: unknown;
};

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeBrokerOrderStatus(value: unknown): BrokerOrderStatus {
  if (
    value === "filled" ||
    value === "partially_filled" ||
    value === "submitted_not_filled"
  ) {
    return value;
  }

  return "filled";
}

function normalizeBuyingPowerStatus(
  value: unknown,
): BrokerOrderPreviewCapture["buying_power_status"] {
  if (value === "ok" || value === "warning" || value === "insufficient") {
    return value;
  }

  return "unknown";
}

function normalizeWarningType(
  value: unknown,
): BrokerOrderPreviewCapture["warning_type"] {
  if (
    value === "none" ||
    value === "price_warning" ||
    value === "liquidity_warning" ||
    value === "buying_power_warning" ||
    value === "instrument_warning" ||
    value === "other"
  ) {
    return value;
  }

  return "none";
}

export function buildBrokerOrderPreviewCapture(input: {
  capturedAt?: string | null;
  previewCommission?: number | null;
  previewFxFee?: number | null;
  previewTotalEstimatedCost?: number | null;
  buyingPowerStatus?: BrokerOrderPreviewCapture["buying_power_status"] | string;
  warningType?: BrokerOrderPreviewCapture["warning_type"] | string;
  warningText?: string | null;
  screenshotReferenceNote?: string | null;
}): BrokerOrderPreviewCapture | null {
  const previewCommission = finiteNumber(input.previewCommission);
  const previewFxFee = finiteNumber(input.previewFxFee);
  const previewTotalEstimatedCost = finiteNumber(input.previewTotalEstimatedCost);
  const buyingPowerStatus = normalizeBuyingPowerStatus(input.buyingPowerStatus);
  const warningType = normalizeWarningType(input.warningType);
  const warningText = nullableString(input.warningText);
  const screenshotReferenceNote = nullableString(input.screenshotReferenceNote);
  const hasCapture =
    previewCommission !== null ||
    previewFxFee !== null ||
    previewTotalEstimatedCost !== null ||
    buyingPowerStatus !== "unknown" ||
    warningType !== "none" ||
    warningText !== null ||
    screenshotReferenceNote !== null;

  if (!hasCapture) {
    return null;
  }

  return {
    captured_at: input.capturedAt ?? new Date().toISOString(),
    preview_commission: previewCommission,
    preview_fx_fee: previewFxFee,
    preview_total_estimated_cost: previewTotalEstimatedCost,
    buying_power_status: buyingPowerStatus,
    warning_type: warningType,
    warning_text: warningText,
    screenshot_reference_note: screenshotReferenceNote,
    source: "manual_user_entry",
  };
}

function parseBrokerOrderPreviewCapture(
  value: unknown,
): BrokerOrderPreviewCapture | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;

  return buildBrokerOrderPreviewCapture({
    capturedAt: nullableString(raw.captured_at),
    previewCommission: finiteNumber(raw.preview_commission),
    previewFxFee: finiteNumber(raw.preview_fx_fee),
    previewTotalEstimatedCost: finiteNumber(raw.preview_total_estimated_cost),
    buyingPowerStatus:
      typeof raw.buying_power_status === "string"
        ? raw.buying_power_status
        : "unknown",
    warningType:
      typeof raw.warning_type === "string" ? raw.warning_type : "none",
    warningText: nullableString(raw.warning_text),
    screenshotReferenceNote: nullableString(raw.screenshot_reference_note),
  });
}

function parseEntryFills(value: unknown): TradeFill[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const raw = item as Record<string, unknown>;
      return normalizeEntryFill({
        fillId: nullableString(raw.fill_id),
        status: nullableString(raw.status),
        price: finiteNumber(raw.price),
        shares: finiteNumber(raw.shares),
        filledAt: nullableString(raw.filled_at),
        referenceNote: nullableString(raw.reference_note),
        commission: finiteNumber(raw.commission),
        fxFee: finiteNumber(raw.fx_fee),
      });
    })
    .filter((item): item is TradeFill => item !== null);
}

function parseExitFills(value: unknown): TradeExitFill[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const raw = item as Record<string, unknown>;
      return normalizeExitFill({
        fillId: nullableString(raw.fill_id),
        status: nullableString(raw.status),
        price: finiteNumber(raw.price),
        shares: finiteNumber(raw.shares),
        filledAt: nullableString(raw.filled_at),
        referenceNote: nullableString(raw.reference_note),
        commission: finiteNumber(raw.commission),
        fxFee: finiteNumber(raw.fx_fee),
      });
    })
    .filter((item): item is TradeExitFill => item !== null);
}

function parseBrokerCostEstimate(value: unknown): BrokerCostEstimate | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Partial<BrokerCostEstimate>;

  return {
    enabled: raw.enabled === true,
    entry_commission_estimate: finiteNumber(raw.entry_commission_estimate),
    exit_commission_estimate: finiteNumber(raw.exit_commission_estimate),
    total_commission_estimate: finiteNumber(raw.total_commission_estimate),
    entry_fx_fee_estimate: finiteNumber(raw.entry_fx_fee_estimate),
    exit_fx_fee_estimate: finiteNumber(raw.exit_fx_fee_estimate),
    total_fx_fee_estimate: finiteNumber(raw.total_fx_fee_estimate),
    total_estimated_trading_cost: finiteNumber(raw.total_estimated_trading_cost),
    planned_position_value: finiteNumber(raw.planned_position_value),
    actual_position_value: finiteNumber(raw.actual_position_value),
    estimated_gross_reward: finiteNumber(raw.estimated_gross_reward),
    estimated_net_reward: finiteNumber(raw.estimated_net_reward),
    estimated_gross_r: finiteNumber(raw.estimated_gross_r),
    estimated_net_r: finiteNumber(raw.estimated_net_r),
    estimated_break_even_price: finiteNumber(raw.estimated_break_even_price),
    currency:
      raw.currency === "USD" || raw.currency === "MIXED" ? raw.currency : "SEK",
    warnings: Array.isArray(raw.warnings)
      ? raw.warnings.filter((item): item is string => typeof item === "string")
      : [],
  };
}

function parseHandoffIntegritySnapshot(
  value: unknown,
): HandoffIntegritySnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const status =
    raw.status === "passed" || raw.status === "warning" || raw.status === "failed"
      ? (raw.status as HandoffIntegrityStatus)
      : null;
  const score = finiteNumber(raw.score);
  const checkedAt = nullableString(raw.checked_at);

  if (!status || score === null || !checkedAt) {
    return null;
  }

  return {
    status,
    score,
    checked_at: checkedAt,
    issue_codes: Array.isArray(raw.issue_codes)
      ? raw.issue_codes.filter((item): item is string => typeof item === "string")
      : [],
    warning_codes: Array.isArray(raw.warning_codes)
      ? raw.warning_codes.filter((item): item is string => typeof item === "string")
      : [],
    failed_codes: Array.isArray(raw.failed_codes)
      ? raw.failed_codes.filter((item): item is string => typeof item === "string")
      : [],
  };
}

function parseHandoffQualitySnapshot(value: unknown): HandoffQualitySnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const rating =
    raw.rating === "excellent" ||
    raw.rating === "good" ||
    raw.rating === "acceptable" ||
    raw.rating === "poor" ||
    raw.rating === "unknown"
      ? (raw.rating as HandoffQualityRating)
      : null;
  const score = finiteNumber(raw.score);
  const calculatedAt = nullableString(raw.calculated_at);

  if (!rating || score === null || !calculatedAt) {
    return null;
  }

  return {
    rating,
    score,
    calculated_at: calculatedAt,
    factor_codes: Array.isArray(raw.factor_codes)
      ? raw.factor_codes.filter((item): item is string => typeof item === "string")
      : [],
    warning_factor_codes: Array.isArray(raw.warning_factor_codes)
      ? raw.warning_factor_codes.filter(
          (item): item is string => typeof item === "string",
        )
      : [],
    negative_factor_codes: Array.isArray(raw.negative_factor_codes)
      ? raw.negative_factor_codes.filter(
          (item): item is string => typeof item === "string",
        )
      : [],
  };
}

function parseAgentHandoffCommandSnapshot(
  value: unknown,
): AgentHandoffCommandMetadataSnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const commandId = nullableString(raw.command_id);
  const commandVersion = raw.command_version === "1.0" ? raw.command_version : null;
  const status =
    raw.status === "ready" || raw.status === "warning" || raw.status === "blocked"
      ? raw.status
      : null;
  const task = raw.task === "prepare_order_form_only" ? raw.task : null;
  const broker = raw.broker === "AVANZA" ? raw.broker : null;
  const brokerExecutionMode =
    raw.broker_execution_mode === "prepare_only"
      ? raw.broker_execution_mode
      : null;
  const generatedAt = nullableString(raw.generated_at);

  if (
    !commandId ||
    !commandVersion ||
    !status ||
    !task ||
    !broker ||
    !brokerExecutionMode ||
    !generatedAt
  ) {
    return null;
  }

  return {
    command_id: commandId,
    command_version: commandVersion,
    status,
    task,
    broker,
    broker_execution_mode: brokerExecutionMode,
    stop_before: Array.isArray(raw.stop_before)
      ? raw.stop_before.filter(
          (
            item,
          ): item is AgentHandoffCommandMetadataSnapshot["stop_before"][number] =>
            item === "final_broker_confirmation" ||
            item === "buy_sell_submit_button",
        )
      : [],
    hard_stop_failed_count: finiteNumber(raw.hard_stop_failed_count) ?? 0,
    hard_stop_warning_count: finiteNumber(raw.hard_stop_warning_count) ?? 0,
    generated_at: generatedAt,
    expires_at: nullableString(raw.expires_at),
  };
}

function parseAgentHardStopIdList(value: unknown): AgentHardStopId[] {
  const allowed = new Set<AgentHardStopId>([
    "missing_execution_payload",
    "expired_payload",
    "missing_payload_id",
    "missing_payload_fingerprint",
    "missing_handoff_session_id",
    "stale_payload",
    "broker_not_avanza",
    "broker_mode_not_prepare_only",
    "order_intent_not_prepare_only",
    "missing_submit_guard",
    "missing_human_confirmation_requirement",
    "missing_ticker",
    "missing_side",
    "missing_quantity",
    "missing_entry_price",
    "missing_stop_price",
    "missing_target_price",
    "unknown_required_field",
    "agent_readiness_blocked",
    "handoff_integrity_failed",
    "agent_dry_run_failed",
    "credentials_required_or_detected",
    "unknown_broker_ui_state",
    "unsafe_to_continue",
  ]);

  return Array.isArray(value)
    ? value.filter(
        (item): item is AgentHardStopId =>
          typeof item === "string" && allowed.has(item as AgentHardStopId),
      )
    : [];
}

function parseAgentHardStopContractSnapshot(
  value: unknown,
): AgentHardStopContractMetadataSnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const contractVersion = raw.contract_version === "1.0" ? raw.contract_version : null;
  const overallStatus =
    raw.overall_status === "ready" ||
    raw.overall_status === "warning" ||
    raw.overall_status === "blocked"
      ? raw.overall_status
      : null;
  const evaluatedAt = nullableString(raw.evaluated_at);

  if (!contractVersion || !overallStatus || !evaluatedAt) {
    return null;
  }

  return {
    contract_version: contractVersion,
    overall_status: overallStatus,
    failed_count: finiteNumber(raw.failed_count) ?? 0,
    warning_count: finiteNumber(raw.warning_count) ?? 0,
    unknown_count: finiteNumber(raw.unknown_count) ?? 0,
    evaluated_at: evaluatedAt,
    top_blocker_ids: parseAgentHardStopIdList(raw.top_blocker_ids),
    top_warning_ids: parseAgentHardStopIdList(raw.top_warning_ids),
  };
}

function parseAgentFormMappingPreviewSnapshot(
  value: unknown,
): AgentFormMappingPreviewMetadataSnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const previewId = nullableString(raw.preview_id);
  const previewVersion = raw.preview_version === "1.0" ? raw.preview_version : null;
  const overallStatus =
    raw.overall_status === "ready" ||
    raw.overall_status === "warning" ||
    raw.overall_status === "blocked"
      ? raw.overall_status
      : null;
  const generatedAt = nullableString(raw.generated_at);

  if (!previewId || !previewVersion || !overallStatus || !generatedAt) {
    return null;
  }

  return {
    preview_id: previewId,
    preview_version: previewVersion,
    overall_status: overallStatus,
    can_prepare_form: raw.can_prepare_form === true,
    field_count: finiteNumber(raw.field_count) ?? 0,
    ready_count: finiteNumber(raw.ready_count) ?? 0,
    warning_count: finiteNumber(raw.warning_count) ?? 0,
    blocked_count: finiteNumber(raw.blocked_count) ?? 0,
    missing_count: finiteNumber(raw.missing_count) ?? 0,
    generated_at: generatedAt,
    expires_at: nullableString(raw.expires_at),
  };
}

export function brokerOrderStatusLabel(value: BrokerOrderStatus) {
  if (value === "partially_filled") return "Partial Fill";
  if (value === "submitted_not_filled") return "Submitted, Not Filled";
  return "Filled";
}

export function buildBrokerExecutionMetadata(
  input: BrokerExecutionMetadataInput,
): BrokerExecutionMetadata {
  const brokerCostEstimate = parseBrokerCostEstimate(input.brokerCostEstimate);
  const brokerOrderPreview = parseBrokerOrderPreviewCapture(
    input.brokerOrderPreview,
  );
  const handoffIntegrity = parseHandoffIntegritySnapshot(input.handoffIntegrity);
  const handoffQuality = parseHandoffQualitySnapshot(input.handoffQuality);
  const agentHandoffCommand = parseAgentHandoffCommandSnapshot(
    input.agentHandoffCommand,
  );
  const agentHardStopContract = parseAgentHardStopContractSnapshot(
    input.agentHardStopContract,
  );
  const agentFormMappingPreview = parseAgentFormMappingPreviewSnapshot(
    input.agentFormMappingPreview,
  );
  const brokerExitConfirmation = parseBrokerExitConfirmation(
    input.brokerExitConfirmation,
  );
  const tradePlanningSnapshot = normalizeTradePlanningSnapshot(
    input.tradePlanningSnapshot,
  );
  const entryFills = parseEntryFills(input.entryFills);
  const exitFills = parseExitFills(input.exitFills);
  const fallbackEntryFill = normalizeEntryFill({
    status: normalizeBrokerOrderStatus(input.brokerOrderStatus),
    price: finiteNumber(input.actualFillPrice),
    shares: finiteNumber(input.actualShares),
    filledAt: input.brokerConfirmedAt,
    referenceNote: nullableString(input.brokerReferenceNote),
  });
  const derivedEntryFills =
    entryFills.length > 0 ? entryFills : fallbackEntryFill ? [fallbackEntryFill] : [];
  const brokerExitFill =
    brokerExitConfirmation &&
    (brokerExitConfirmation.exit_status === "filled" ||
      brokerExitConfirmation.exit_status === "partially_filled")
      ? normalizeExitFill({
          fillId: brokerExitConfirmation.sell_payload_id
            ? `exit_${brokerExitConfirmation.sell_payload_id}`
            : null,
          status: brokerExitConfirmation.exit_status,
          price: brokerExitConfirmation.actual_exit_price,
          shares: brokerExitConfirmation.actual_sold_shares,
          filledAt: brokerExitConfirmation.broker_confirmed_at,
          referenceNote: brokerExitConfirmation.broker_reference_note,
          commission: brokerExitConfirmation.exit_commission,
          fxFee: brokerExitConfirmation.exit_fx_fee,
        })
      : null;
  const derivedExitFills =
    exitFills.length > 0
      ? exitFills
      : brokerExitFill
        ? [brokerExitFill]
        : [];
  const partialAccounting = buildPartialPositionState({
    entryFills: derivedEntryFills,
    exitFills: derivedExitFills,
    fallbackEntryPrice: finiteNumber(input.actualFillPrice),
    fallbackEntryShares: finiteNumber(input.actualShares),
    plannedShares: finiteNumber(input.plannedShares),
  });
  const partialState = partialAccounting.state;

  return {
    schema_version: "1.0",
    broker_hint: "AVANZA",
    broker_order_status: normalizeBrokerOrderStatus(input.brokerOrderStatus),
    broker_reference_note: nullableString(input.brokerReferenceNote),
    broker_confirmed_at: input.brokerConfirmedAt ?? new Date().toISOString(),
    planned_entry_price: finiteNumber(input.plannedEntryPrice),
    actual_fill_price: finiteNumber(input.actualFillPrice),
    planned_shares: finiteNumber(input.plannedShares),
    actual_shares: finiteNumber(input.actualShares),
    planned_stop_loss: finiteNumber(input.plannedStopLoss),
    planned_target_price: finiteNumber(input.plannedTargetPrice),
    planned_position_value: finiteNumber(input.plannedPositionValue),
    actual_position_value: finiteNumber(input.actualPositionValue),
    planned_max_loss_at_stop: finiteNumber(input.plannedMaxLossAtStop),
    actual_max_loss_at_stop: finiteNumber(input.actualMaxLossAtStop),
    execution_payload_id: nullableString(input.executionPayloadId),
    execution_payload_fingerprint: nullableString(input.executionPayloadFingerprint),
    execution_payload_version: nullableString(input.executionPayloadVersion),
    handoff_session_id: nullableString(input.handoffSessionId),
    recommendation_id: nullableString(input.recommendationId),
    setup_type: normalizeSetupType(input.setupType),
    validation_status: nullableString(input.validationStatus),
    created_from: "add_trade_modal",
    manual_confirmation_required: true,
    broker_execution_mode: "manual_final_confirmation",
    broker_cost_model_snapshot: input.brokerCostModelSnapshot
      ? normalizeBrokerCostModel(input.brokerCostModelSnapshot)
      : null,
    broker_cost_estimate: brokerCostEstimate,
    estimated_total_trading_cost:
      brokerCostEstimate?.total_estimated_trading_cost ?? null,
    estimated_entry_commission:
      brokerCostEstimate?.entry_commission_estimate ?? null,
    estimated_exit_commission: brokerCostEstimate?.exit_commission_estimate ?? null,
    estimated_fx_fee: brokerCostEstimate?.total_fx_fee_estimate ?? null,
    estimated_net_r: brokerCostEstimate?.estimated_net_r ?? null,
    estimated_break_even_price:
      brokerCostEstimate?.estimated_break_even_price ?? null,
    broker_order_preview: brokerOrderPreview,
    handoff_integrity: handoffIntegrity,
    handoff_quality: handoffQuality,
    agent_handoff_command: agentHandoffCommand,
    agent_hard_stop_contract: agentHardStopContract,
    agent_form_mapping_preview: agentFormMappingPreview,
    broker_exit_confirmation: brokerExitConfirmation,
    entry_fills: partialState.entry_fills,
    exit_fills: partialState.exit_fills,
    planned_quantity:
      finiteNumber(input.plannedQuantity) ?? finiteNumber(input.plannedShares),
    actual_entry_shares:
      finiteNumber(input.actualEntryShares) ?? finiteNumber(input.actualShares),
    remaining_shares:
      finiteNumber(input.remainingShares) ?? partialState.remaining_shares,
    partial_position_status:
      input.partialPositionStatus === "fully_open" ||
      input.partialPositionStatus === "partially_closed" ||
      input.partialPositionStatus === "fully_closed" ||
      input.partialPositionStatus === "invalid"
        ? input.partialPositionStatus
        : partialState.status,
    average_exit_price:
      finiteNumber(input.averageExitPrice) ?? partialState.average_exit_price,
    realized_pnl_from_exits:
      finiteNumber(input.realizedPnlFromExits) ??
      partialState.realized_pnl_from_exits,
    trade_planning_snapshot: tradePlanningSnapshot,
  };
}

export function parseBrokerExecutionMetadata(
  value: unknown,
): BrokerExecutionMetadata | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;

  return buildBrokerExecutionMetadata({
    brokerOrderStatus:
      typeof raw.broker_order_status === "string"
        ? raw.broker_order_status
        : null,
    brokerReferenceNote: nullableString(raw.broker_reference_note),
    brokerConfirmedAt: nullableString(raw.broker_confirmed_at),
    plannedEntryPrice: finiteNumber(raw.planned_entry_price),
    actualFillPrice: finiteNumber(raw.actual_fill_price),
    plannedShares: finiteNumber(raw.planned_shares),
    actualShares: finiteNumber(raw.actual_shares),
    plannedStopLoss: finiteNumber(raw.planned_stop_loss),
    plannedTargetPrice: finiteNumber(raw.planned_target_price),
    plannedPositionValue: finiteNumber(raw.planned_position_value),
    actualPositionValue: finiteNumber(raw.actual_position_value),
    plannedMaxLossAtStop: finiteNumber(raw.planned_max_loss_at_stop),
    actualMaxLossAtStop: finiteNumber(raw.actual_max_loss_at_stop),
    executionPayloadId: nullableString(raw.execution_payload_id),
    executionPayloadFingerprint: nullableString(raw.execution_payload_fingerprint),
    executionPayloadVersion: nullableString(raw.execution_payload_version),
    handoffSessionId: nullableString(raw.handoff_session_id),
    recommendationId: nullableString(raw.recommendation_id),
    setupType: raw.setup_type,
    validationStatus: nullableString(raw.validation_status),
    brokerCostModelSnapshot: raw.broker_cost_model_snapshot,
    brokerCostEstimate: raw.broker_cost_estimate,
    brokerOrderPreview: raw.broker_order_preview,
    handoffIntegrity: raw.handoff_integrity,
    handoffQuality: raw.handoff_quality,
    agentHandoffCommand: raw.agent_handoff_command,
    agentHardStopContract: raw.agent_hard_stop_contract,
    agentFormMappingPreview: raw.agent_form_mapping_preview,
    brokerExitConfirmation: raw.broker_exit_confirmation,
    entryFills: raw.entry_fills,
    exitFills: raw.exit_fills,
    plannedQuantity: finiteNumber(raw.planned_quantity),
    actualEntryShares: finiteNumber(raw.actual_entry_shares),
    remainingShares: finiteNumber(raw.remaining_shares),
    partialPositionStatus: nullableString(raw.partial_position_status),
    averageExitPrice: finiteNumber(raw.average_exit_price),
    realizedPnlFromExits: finiteNumber(raw.realized_pnl_from_exits),
    tradePlanningSnapshot: raw.trade_planning_snapshot,
  });
}

export function calculateBrokerPreviewDifference(
  metadata: BrokerExecutionMetadata | null,
): BrokerPreviewDifference {
  const preview = metadata?.broker_order_preview;
  const estimate = metadata?.broker_cost_estimate;

  return {
    commission_difference:
      preview?.preview_commission !== null &&
      preview?.preview_commission !== undefined &&
      estimate?.entry_commission_estimate !== null &&
      estimate?.entry_commission_estimate !== undefined
        ? preview.preview_commission - estimate.entry_commission_estimate
        : null,
    fx_fee_difference:
      preview?.preview_fx_fee !== null &&
      preview?.preview_fx_fee !== undefined &&
      estimate?.entry_fx_fee_estimate !== null &&
      estimate?.entry_fx_fee_estimate !== undefined
        ? preview.preview_fx_fee - estimate.entry_fx_fee_estimate
        : null,
    total_cost_difference:
      preview?.preview_total_estimated_cost !== null &&
      preview?.preview_total_estimated_cost !== undefined &&
      estimate?.total_estimated_trading_cost !== null &&
      estimate?.total_estimated_trading_cost !== undefined
        ? preview.preview_total_estimated_cost -
          estimate.total_estimated_trading_cost
        : null,
  };
}
