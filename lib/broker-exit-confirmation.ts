import type { SellHardStopOverallStatus } from "@/lib/sell-hard-stop-contract";
import type { SellFormMappingPreview } from "@/lib/sell-form-mapping-preview";

export type BrokerExitStatus =
  | "filled"
  | "partially_filled"
  | "submitted_not_filled"
  | "cancelled_or_rejected";

export type BrokerExitConfirmation = {
  broker: "AVANZA";
  exit_status: BrokerExitStatus;
  actual_exit_price: number | null;
  actual_sold_shares: number | null;
  broker_reference_note: string | null;
  broker_confirmed_at: string;
  exit_commission: number | null;
  exit_fx_fee: number | null;
  exit_total_cost: number | null;
  user_manually_confirmed_sell: boolean;
  broker_order_matches_trade_plan: boolean;
  sell_payload_id: string | null;
  sell_payload_fingerprint: string | null;
  sell_handoff_session_id: string | null;
  sell_command_id: string | null;
  sell_hard_stop_status: SellHardStopOverallStatus | null;
  sell_form_mapping_status: SellFormMappingPreview["overall_status"] | null;
};

export type BrokerExitConfirmationValidation = {
  can_close_trade: boolean;
  message: string;
  warnings: string[];
};

export type BuildBrokerExitConfirmationInput = {
  exitStatus?: BrokerExitStatus | string | null;
  actualExitPrice?: number | string | null;
  actualSoldShares?: number | string | null;
  brokerReferenceNote?: string | null;
  brokerConfirmedAt?: string | null;
  exitCommission?: number | string | null;
  exitFxFee?: number | string | null;
  userManuallyConfirmedSell?: boolean | null;
  brokerOrderMatchesTradePlan?: boolean | null;
  sellPayloadId?: string | null;
  sellPayloadFingerprint?: string | null;
  sellHandoffSessionId?: string | null;
  sellCommandId?: string | null;
  sellHardStopStatus?: SellHardStopOverallStatus | null;
  sellFormMappingStatus?: SellFormMappingPreview["overall_status"] | null;
};

function finitePositiveNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  return null;
}

function finiteNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizeBrokerExitStatus(value: unknown): BrokerExitStatus {
  if (
    value === "filled" ||
    value === "partially_filled" ||
    value === "submitted_not_filled" ||
    value === "cancelled_or_rejected"
  ) {
    return value;
  }

  return "submitted_not_filled";
}

export function brokerExitStatusLabel(value: BrokerExitStatus) {
  if (value === "partially_filled") return "Partially filled";
  if (value === "submitted_not_filled") return "Submitted, not filled";
  if (value === "cancelled_or_rejected") return "Cancelled / rejected";
  return "Filled";
}

export function buildBrokerExitConfirmation({
  exitStatus,
  actualExitPrice,
  actualSoldShares,
  brokerReferenceNote,
  brokerConfirmedAt,
  exitCommission,
  exitFxFee,
  userManuallyConfirmedSell,
  brokerOrderMatchesTradePlan,
  sellPayloadId,
  sellPayloadFingerprint,
  sellHandoffSessionId,
  sellCommandId,
  sellHardStopStatus,
  sellFormMappingStatus,
}: BuildBrokerExitConfirmationInput): BrokerExitConfirmation {
  const commission = finiteNumber(exitCommission);
  const fxFee = finiteNumber(exitFxFee);
  const exitTotalCost =
    commission !== null || fxFee !== null ? (commission ?? 0) + (fxFee ?? 0) : null;

  return {
    broker: "AVANZA",
    exit_status: normalizeBrokerExitStatus(exitStatus),
    actual_exit_price: finitePositiveNumber(actualExitPrice),
    actual_sold_shares: finitePositiveNumber(actualSoldShares),
    broker_reference_note: nullableString(brokerReferenceNote),
    broker_confirmed_at: brokerConfirmedAt ?? new Date().toISOString(),
    exit_commission: commission,
    exit_fx_fee: fxFee,
    exit_total_cost: exitTotalCost,
    user_manually_confirmed_sell: userManuallyConfirmedSell === true,
    broker_order_matches_trade_plan: brokerOrderMatchesTradePlan === true,
    sell_payload_id: nullableString(sellPayloadId),
    sell_payload_fingerprint: nullableString(sellPayloadFingerprint),
    sell_handoff_session_id: nullableString(sellHandoffSessionId),
    sell_command_id: nullableString(sellCommandId),
    sell_hard_stop_status: sellHardStopStatus ?? null,
    sell_form_mapping_status: sellFormMappingStatus ?? null,
  };
}

export function validateBrokerExitConfirmation(
  confirmation: BrokerExitConfirmation,
  openPositionSize: number | null,
): BrokerExitConfirmationValidation {
  const warnings: string[] = [];

  if (confirmation.exit_status === "submitted_not_filled") {
    return {
      can_close_trade: false,
      message:
        "The order was submitted but not filled. Do not close the trade in Trade until Avanza reports a fill.",
      warnings,
    };
  }

  if (confirmation.exit_status === "cancelled_or_rejected") {
    return {
      can_close_trade: false,
      message:
        "The broker order was cancelled/rejected. The position should remain live unless you submit and confirm a new exit order.",
      warnings,
    };
  }

  if (confirmation.actual_exit_price === null) {
    return {
      can_close_trade: false,
      message: "Actual exit price must be greater than zero.",
      warnings,
    };
  }

  if (confirmation.actual_sold_shares === null) {
    return {
      can_close_trade: false,
      message: "Actual sold shares must be greater than zero.",
      warnings,
    };
  }

  if (
    openPositionSize !== null &&
    confirmation.actual_sold_shares > openPositionSize
  ) {
    return {
      can_close_trade: false,
      message: "Actual sold shares cannot exceed the current Trade position size.",
      warnings,
    };
  }

  if (!confirmation.user_manually_confirmed_sell) {
    return {
      can_close_trade: false,
      message: "Confirm that you manually clicked SÄLJ in Avanza before closing.",
      warnings,
    };
  }

  if (!confirmation.broker_order_matches_trade_plan) {
    return {
      can_close_trade: false,
      message: "Confirm that the broker order matches this Trade position.",
      warnings,
    };
  }

  if (confirmation.exit_status === "partially_filled") {
    warnings.push(
      "Partial fills are allowed in this version, but verify remaining shares manually.",
    );
  }

  return {
    can_close_trade: true,
    message: "",
    warnings,
  };
}

export function parseBrokerExitConfirmation(
  value: unknown,
): BrokerExitConfirmation | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;

  return buildBrokerExitConfirmation({
    exitStatus: typeof raw.exit_status === "string" ? raw.exit_status : null,
    actualExitPrice: finiteNumber(raw.actual_exit_price),
    actualSoldShares: finiteNumber(raw.actual_sold_shares),
    brokerReferenceNote: nullableString(raw.broker_reference_note),
    brokerConfirmedAt: nullableString(raw.broker_confirmed_at),
    exitCommission: finiteNumber(raw.exit_commission),
    exitFxFee: finiteNumber(raw.exit_fx_fee),
    userManuallyConfirmedSell: raw.user_manually_confirmed_sell === true,
    brokerOrderMatchesTradePlan: raw.broker_order_matches_trade_plan === true,
    sellPayloadId: nullableString(raw.sell_payload_id),
    sellPayloadFingerprint: nullableString(raw.sell_payload_fingerprint),
    sellHandoffSessionId: nullableString(raw.sell_handoff_session_id),
    sellCommandId: nullableString(raw.sell_command_id),
    sellHardStopStatus:
      raw.sell_hard_stop_status === "ready" ||
      raw.sell_hard_stop_status === "warning" ||
      raw.sell_hard_stop_status === "blocked"
        ? raw.sell_hard_stop_status
        : null,
    sellFormMappingStatus:
      raw.sell_form_mapping_status === "ready" ||
      raw.sell_form_mapping_status === "warning" ||
      raw.sell_form_mapping_status === "blocked"
        ? raw.sell_form_mapping_status
        : null,
  });
}
