export type AvanzaOrderTicketSide = "buy" | "sell" | "unknown";

export type AvanzaOrderTicketOrderType =
  | "limit"
  | "market_forbidden"
  | "unknown";

export type AvanzaOrderTicketTimeInForce = "day" | "unknown";

export type AvanzaOrderTicketStatus =
  | "disabled"
  | "incomplete"
  | "ready_for_field_mapping"
  | "field_mapping_ready"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaOrderTicketFieldKey =
  | "side"
  | "ticker"
  | "instrumentName"
  | "quantity"
  | "orderType"
  | "limitPrice"
  | "timeInForce"
  | "accountType"
  | "customerType"
  | "reviewRequired"
  | "finalHumanConfirmation";

export type AvanzaOrderTicketInputPackage = {
  packageId?: string;
  createdAt?: string;
  source?: "recommendation" | "live_position_exit" | "manual_review" | "fixture";
  side?: AvanzaOrderTicketSide;
  ticker?: string;
  instrumentName?: string;
  quantity?: number;
  orderType?: AvanzaOrderTicketOrderType;
  limitPrice?: number;
  stopLoss?: number;
  targetPrice?: number;
  timeInForce?: AvanzaOrderTicketTimeInForce;
  accountType?: string;
  customerType?: string;
  recommendationId?: string;
  positionId?: string;
  confidence?: number;
  reason?: string;
  riskWarnings?: readonly string[];
  now?: string;
  enabled?: boolean;
  forceError?: boolean;
  forceUnknown?: boolean;
};

export type AvanzaOrderTicketField = {
  key: AvanzaOrderTicketFieldKey;
  label: string;
  valueKind: "text" | "number" | "currency" | "enum" | "boolean" | "hidden";
  safeDisplayValue: string;
  valuePresent: boolean;
  required: boolean;
  editableByAgentInFuture: boolean;
  filledByAgentInThisTask: false;
  requiresUserReview: boolean;
  forbidden: boolean;
};

export type AvanzaOrderTicketSafetyFlags = {
  fieldPlanEnabled: boolean;
  canMapFields: boolean;
  canFillFields: false;
  canClickBuy: false;
  canClickSell: false;
  canSubmitOrder: false;
  canUseMarketOrder: false;
  canUseLimitOrder: boolean;
  canPrepareBuy: boolean;
  canPrepareSell: boolean;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaOrderTicketFieldPlan = AvanzaOrderTicketSafetyFlags & {
  fieldPlanId: string;
  createdAt: string;
  status: AvanzaOrderTicketStatus;
  label: string;
  reason: string;
  side: AvanzaOrderTicketSide;
  ticker: string;
  quantity?: number;
  orderType: AvanzaOrderTicketOrderType;
  limitPrice?: number;
  timeInForce: AvanzaOrderTicketTimeInForce;
  fields: AvanzaOrderTicketField[];
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaOrderTicketSafetyFlags;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid|cookie|credential|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret|session|storage|token/i;

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (!text) return undefined;
  if (unsafeTextPattern.test(text)) return undefined;

  return text;
}

function safeStringArray(values: readonly string[] | undefined) {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        const text = safeText(value);

        return text ? [text] : [];
      })
    : [];
}

function positiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function field(
  key: AvanzaOrderTicketFieldKey,
  label: string,
  valueKind: AvanzaOrderTicketField["valueKind"],
  value: string | number | boolean | undefined,
  required: boolean,
  forbidden = false,
): AvanzaOrderTicketField {
  return {
    key,
    label,
    valueKind,
    safeDisplayValue: value === undefined ? "missing" : String(value),
    valuePresent: value !== undefined,
    required,
    editableByAgentInFuture: !forbidden,
    filledByAgentInThisTask: false,
    requiresUserReview: true,
    forbidden,
  };
}

function statusLabel(status: AvanzaOrderTicketStatus) {
  switch (status) {
    case "disabled":
      return "Order ticket field plan disabled";
    case "incomplete":
      return "Order ticket field plan incomplete";
    case "ready_for_field_mapping":
      return "Order ticket field plan ready for field mapping";
    case "field_mapping_ready":
      return "Order ticket field mapping ready";
    case "blocked":
      return "Order ticket field plan blocked";
    case "error":
      return "Order ticket field plan error";
    case "unknown":
      return "Order ticket field plan unknown";
  }
}

function statusReason(status: AvanzaOrderTicketStatus) {
  switch (status) {
    case "disabled":
      return "Order ticket field planning is disabled.";
    case "incomplete":
      return "Order ticket field planning is missing side, ticker, quantity, or limit price.";
    case "ready_for_field_mapping":
      return "Order ticket input is ready for future field mapping review.";
    case "field_mapping_ready":
      return "Limit order fields are mapped for fixture/model-only review.";
    case "blocked":
      return "Order ticket field planning is blocked by safety or validation rules.";
    case "error":
      return "Order ticket field planning returned an error state.";
    case "unknown":
      return "Order ticket field planning state is unknown.";
  }
}

function deriveStatus(
  input: AvanzaOrderTicketInputPackage,
  blockedReasons: readonly string[],
  ticker: string | undefined,
  quantity: number | undefined,
  limitPrice: number | undefined,
): AvanzaOrderTicketStatus {
  if (input.forceError === true) return "error";
  if (input.forceUnknown === true) return "unknown";
  if (input.enabled !== true) return "disabled";
  if (blockedReasons.length > 0) return "blocked";
  if (
    input.side !== "buy" &&
    input.side !== "sell" ||
    !ticker ||
    quantity === undefined ||
    limitPrice === undefined
  ) {
    return "incomplete";
  }

  return "field_mapping_ready";
}

function buildBlockedReasons(
  input: AvanzaOrderTicketInputPackage,
  rawQuantity: unknown,
  rawLimitPrice: unknown,
) {
  const blockedReasons: string[] = [];

  if (input.orderType === "market_forbidden") {
    blockedReasons.push("Market order is forbidden; limit orders only.");
  } else if (input.orderType !== "limit" && input.enabled === true) {
    blockedReasons.push("Limit order type is required.");
  }

  if (
    rawQuantity !== undefined &&
    (typeof rawQuantity !== "number" ||
      !Number.isFinite(rawQuantity) ||
      rawQuantity <= 0)
  ) {
    blockedReasons.push("Quantity must be positive.");
  }

  if (
    rawLimitPrice !== undefined &&
    (typeof rawLimitPrice !== "number" ||
      !Number.isFinite(rawLimitPrice) ||
      rawLimitPrice <= 0)
  ) {
    blockedReasons.push("Limit price must be positive.");
  }

  return blockedReasons;
}

function buildSafetyFlags(
  input: AvanzaOrderTicketInputPackage,
  status: AvanzaOrderTicketStatus,
): AvanzaOrderTicketSafetyFlags {
  const isLimit = input.orderType === "limit";

  return {
    fieldPlanEnabled: input.enabled === true,
    canMapFields:
      status === "ready_for_field_mapping" || status === "field_mapping_ready",
    canFillFields: false,
    canClickBuy: false,
    canClickSell: false,
    canSubmitOrder: false,
    canUseMarketOrder: false,
    canUseLimitOrder: isLimit && status === "field_mapping_ready",
    canPrepareBuy:
      input.side === "buy" &&
      (status === "ready_for_field_mapping" || status === "field_mapping_ready"),
    canPrepareSell:
      input.side === "sell" &&
      (status === "ready_for_field_mapping" || status === "field_mapping_ready"),
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

export function buildAvanzaOrderTicketFieldPlan(
  input: AvanzaOrderTicketInputPackage = {},
): AvanzaOrderTicketFieldPlan {
  const ticker = safeText(input.ticker);
  const instrumentName = safeText(input.instrumentName);
  const accountType = safeText(input.accountType);
  const customerType = safeText(input.customerType);
  const quantity = positiveNumber(input.quantity);
  const limitPrice = positiveNumber(input.limitPrice);
  const orderType = input.orderType ?? "unknown";
  const timeInForce = input.timeInForce ?? "unknown";
  const blockedReasons = buildBlockedReasons(
    input,
    input.quantity,
    input.limitPrice,
  );
  const status = deriveStatus(input, blockedReasons, ticker, quantity, limitPrice);
  const safetyFlags = buildSafetyFlags(input, status);
  const side = input.side ?? "unknown";

  return {
    ...safetyFlags,
    fieldPlanId: safeText(input.packageId) ?? "avanza-order-ticket-field-plan",
    createdAt: safeText(input.now) ?? safeText(input.createdAt) ?? defaultCreatedAt,
    status,
    label: statusLabel(status),
    reason: statusReason(status),
    side,
    ticker: ticker ?? "missing",
    quantity,
    orderType,
    limitPrice,
    timeInForce,
    fields: [
      field("side", "Köp/Sälj", "enum", side === "unknown" ? undefined : side, true),
      field("ticker", "Ticker", "text", ticker, true),
      field("instrumentName", "Instrument", "text", instrumentName, false),
      field("quantity", "Antal", "number", quantity, true),
      field("orderType", "Ordertyp", "enum", orderType, true, orderType !== "limit"),
      field("limitPrice", "Pris", "currency", limitPrice, true),
      field("timeInForce", "Giltighet", "enum", timeInForce, true),
      field("accountType", "Konto", "text", accountType, false),
      field("customerType", "Kundtyp", "text", customerType, false),
      field("reviewRequired", "Kontrollera order", "boolean", true, true),
      field("finalHumanConfirmation", "Final KÖP/SÄLJ", "boolean", true, true),
    ],
    warnings: safeStringArray(input.riskWarnings),
    blockedReasons,
    safetyFlags,
  };
}
