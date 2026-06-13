export type MockOrderConfirmationStatus =
  | "filled"
  | "submitted"
  | "partially_filled"
  | "rejected"
  | "cancelled"
  | "unknown";

export type MockOrderConfirmationFieldKey =
  | "status"
  | "ticker"
  | "action"
  | "quantity"
  | "requestedPrice"
  | "executedPrice"
  | "account"
  | "amountExcludingFees"
  | "courtage"
  | "fxFee"
  | "preliminaryFxRate"
  | "validUntil"
  | "totalAmount"
  | "priceCurrency"
  | "instrumentMarket"
  | "instrumentCurrency"
  | "instrumentType"
  | "orderMode"
  | "reviewButtonLabel"
  | "confirmButtonLabel"
  | "cancelButtonLabel"
  | "orderId"
  | "requestId"
  | "intentId"
  | "positionId"
  | "recommendationId"
  | "message"
  | "safetyLabel";

export type MockOrderConfirmationFieldSelector = {
  fieldKey: MockOrderConfirmationFieldKey;
  testId: string;
  dataAgentField: string;
  description?: string;
};

export type MockOrderConfirmationPayload = {
  status: MockOrderConfirmationStatus;
  ticker: string;
  action: string;
  quantity: string;
  requestedPrice: string;
  executedPrice: string;
  account: string;
  amountExcludingFees: string;
  courtage: string;
  fxFee: string;
  preliminaryFxRate: string;
  validUntil: string;
  totalAmount: string;
  priceCurrency: string;
  instrumentMarket: string;
  instrumentCurrency: string;
  instrumentType: string;
  orderMode: string;
  reviewButtonLabel: string;
  confirmButtonLabel: string;
  cancelButtonLabel: string;
  orderId: string;
  requestId: string;
  intentId: string;
  positionId: string;
  recommendationId: string;
  message: string;
};

export type MockOrderConfirmationValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export type MockOrderConfirmationParseResult = {
  ok: boolean;
  payload: MockOrderConfirmationPayload;
  errors: string[];
  warnings: string[];
  parsedAt: string;
  validation: MockOrderConfirmationValidationResult;
};

export const MOCK_ORDER_CONFIRMATION_TARGET_PATH =
  "/mock-broker/confirmation" as const;

export const MOCK_ORDER_CONFIRMATION_SELECTORS = {
  status: {
    fieldKey: "status",
    testId: "mock-confirmation-status",
    dataAgentField: "mock-confirmation-status",
    description: "Mock confirmation status.",
  },
  ticker: {
    fieldKey: "ticker",
    testId: "mock-confirmation-ticker",
    dataAgentField: "mock-confirmation-ticker",
    description: "Ticker or symbol.",
  },
  action: {
    fieldKey: "action",
    testId: "mock-confirmation-action",
    dataAgentField: "mock-confirmation-action",
    description: "Buy/sell action.",
  },
  quantity: {
    fieldKey: "quantity",
    testId: "mock-confirmation-quantity",
    dataAgentField: "mock-confirmation-quantity",
    description: "Share quantity.",
  },
  requestedPrice: {
    fieldKey: "requestedPrice",
    testId: "mock-confirmation-requested-price",
    dataAgentField: "mock-confirmation-requested-price",
    description: "Requested or intended price.",
  },
  executedPrice: {
    fieldKey: "executedPrice",
    testId: "mock-confirmation-executed-price",
    dataAgentField: "mock-confirmation-executed-price",
    description: "Mock executed price.",
  },
  account: {
    fieldKey: "account",
    testId: "mock-confirmation-account",
    dataAgentField: "mock-confirmation-account",
    description: "Mock confirmation account readback.",
  },
  amountExcludingFees: {
    fieldKey: "amountExcludingFees",
    testId: "mock-confirmation-amount-excluding-fees",
    dataAgentField: "mock-confirmation-amount-excluding-fees",
    description: "Mock confirmation amount before fees.",
  },
  courtage: {
    fieldKey: "courtage",
    testId: "mock-confirmation-courtage",
    dataAgentField: "mock-confirmation-courtage",
    description: "Mock confirmation courtage/commission readback.",
  },
  fxFee: {
    fieldKey: "fxFee",
    testId: "mock-confirmation-fx-fee",
    dataAgentField: "mock-confirmation-fx-fee",
    description: "Mock confirmation FX fee readback.",
  },
  preliminaryFxRate: {
    fieldKey: "preliminaryFxRate",
    testId: "mock-confirmation-preliminary-fx-rate",
    dataAgentField: "mock-confirmation-preliminary-fx-rate",
    description: "Mock preliminary FX rate readback.",
  },
  validUntil: {
    fieldKey: "validUntil",
    testId: "mock-confirmation-valid-until",
    dataAgentField: "mock-confirmation-valid-until",
    description: "Mock confirmation valid-until date.",
  },
  totalAmount: {
    fieldKey: "totalAmount",
    testId: "mock-confirmation-total-amount",
    dataAgentField: "mock-confirmation-total-amount",
    description: "Mock confirmation total amount including fees.",
  },
  priceCurrency: {
    fieldKey: "priceCurrency",
    testId: "mock-confirmation-price-currency",
    dataAgentField: "mock-confirmation-price-currency",
    description: "Mock confirmation price currency.",
  },
  instrumentMarket: {
    fieldKey: "instrumentMarket",
    testId: "mock-confirmation-instrument-market",
    dataAgentField: "mock-confirmation-instrument-market",
    description: "Mock confirmation instrument market.",
  },
  instrumentCurrency: {
    fieldKey: "instrumentCurrency",
    testId: "mock-confirmation-instrument-currency",
    dataAgentField: "mock-confirmation-instrument-currency",
    description: "Mock confirmation instrument currency.",
  },
  instrumentType: {
    fieldKey: "instrumentType",
    testId: "mock-confirmation-instrument-type",
    dataAgentField: "mock-confirmation-instrument-type",
    description: "Mock confirmation instrument type.",
  },
  orderMode: {
    fieldKey: "orderMode",
    testId: "mock-confirmation-order-mode",
    dataAgentField: "mock-confirmation-order-mode",
    description: "Mock confirmation order mode. Advanced only.",
  },
  reviewButtonLabel: {
    fieldKey: "reviewButtonLabel",
    testId: "mock-confirmation-review-label",
    dataAgentField: "mock-confirmation-review-label",
    description: "Mock confirmation review label readback.",
  },
  confirmButtonLabel: {
    fieldKey: "confirmButtonLabel",
    testId: "mock-confirmation-confirm-label",
    dataAgentField: "mock-confirmation-confirm-label",
    description: "Mock confirmation final confirm label readback.",
  },
  cancelButtonLabel: {
    fieldKey: "cancelButtonLabel",
    testId: "mock-confirmation-cancel-label",
    dataAgentField: "mock-confirmation-cancel-label",
    description: "Mock confirmation cancel label readback.",
  },
  orderId: {
    fieldKey: "orderId",
    testId: "mock-confirmation-order-id",
    dataAgentField: "mock-confirmation-order-id",
    description: "Mock order id.",
  },
  requestId: {
    fieldKey: "requestId",
    testId: "mock-confirmation-request-id",
    dataAgentField: "mock-confirmation-request-id",
    description: "Agent request id.",
  },
  intentId: {
    fieldKey: "intentId",
    testId: "mock-confirmation-intent-id",
    dataAgentField: "mock-confirmation-intent-id",
    description: "Execution intent id.",
  },
  positionId: {
    fieldKey: "positionId",
    testId: "mock-confirmation-position-id",
    dataAgentField: "mock-confirmation-position-id",
    description: "Local live position id.",
  },
  recommendationId: {
    fieldKey: "recommendationId",
    testId: "mock-confirmation-recommendation-id",
    dataAgentField: "mock-confirmation-recommendation-id",
    description: "Local recommendation id.",
  },
  message: {
    fieldKey: "message",
    testId: "mock-confirmation-message",
    dataAgentField: "mock-confirmation-message",
    description: "Mock confirmation message.",
  },
  safetyLabel: {
    fieldKey: "safetyLabel",
    testId: "mock-confirmation-safety-label",
    dataAgentField: "mock-confirmation-safety-label",
    description: "Safety label proving this is local mock UI only.",
  },
} as const satisfies Record<
  MockOrderConfirmationFieldKey,
  MockOrderConfirmationFieldSelector
>;

const supportedStatuses: MockOrderConfirmationStatus[] = [
  "filled",
  "submitted",
  "partially_filled",
  "rejected",
  "cancelled",
  "unknown",
];

const confirmationPayloadFieldKeys: (keyof MockOrderConfirmationPayload)[] = [
  "status",
  "ticker",
  "action",
  "quantity",
  "requestedPrice",
  "executedPrice",
  "account",
  "amountExcludingFees",
  "courtage",
  "fxFee",
  "preliminaryFxRate",
  "validUntil",
  "totalAmount",
  "priceCurrency",
  "instrumentMarket",
  "instrumentCurrency",
  "instrumentType",
  "orderMode",
  "reviewButtonLabel",
  "confirmButtonLabel",
  "cancelButtonLabel",
  "orderId",
  "requestId",
  "intentId",
  "positionId",
  "recommendationId",
  "message",
];

function textValue(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return typeof value === "string" ? value.trim() : "";
}

function hasAdvancedReadbackFields(
  payload: Partial<MockOrderConfirmationPayload>,
) {
  return Boolean(
    textValue(payload.account) ||
      textValue(payload.amountExcludingFees) ||
      textValue(payload.courtage) ||
      textValue(payload.fxFee) ||
      textValue(payload.preliminaryFxRate) ||
      textValue(payload.validUntil) ||
      textValue(payload.totalAmount) ||
      textValue(payload.priceCurrency) ||
      textValue(payload.instrumentMarket) ||
      textValue(payload.instrumentCurrency) ||
      textValue(payload.instrumentType) ||
      textValue(payload.orderMode) ||
      textValue(payload.reviewButtonLabel) ||
      textValue(payload.confirmButtonLabel) ||
      textValue(payload.cancelButtonLabel),
  );
}

export function normalizeMockOrderConfirmationStatus(
  value: unknown,
): MockOrderConfirmationStatus {
  return supportedStatuses.includes(value as MockOrderConfirmationStatus)
    ? (value as MockOrderConfirmationStatus)
    : "unknown";
}

export function parseMockOrderConfirmationFields(
  input: Partial<Record<keyof MockOrderConfirmationPayload, unknown>>,
): MockOrderConfirmationParseResult {
  const payload: MockOrderConfirmationPayload = {
    account: textValue(input.account),
    action: textValue(input.action),
    amountExcludingFees: textValue(input.amountExcludingFees),
    cancelButtonLabel: textValue(input.cancelButtonLabel),
    confirmButtonLabel: textValue(input.confirmButtonLabel),
    courtage: textValue(input.courtage),
    executedPrice: textValue(input.executedPrice),
    fxFee: textValue(input.fxFee),
    instrumentCurrency: textValue(input.instrumentCurrency),
    instrumentMarket: textValue(input.instrumentMarket),
    instrumentType: textValue(input.instrumentType),
    intentId: textValue(input.intentId),
    message: textValue(input.message),
    orderMode: textValue(input.orderMode),
    orderId: textValue(input.orderId),
    preliminaryFxRate: textValue(input.preliminaryFxRate),
    priceCurrency: textValue(input.priceCurrency),
    positionId: textValue(input.positionId),
    quantity: textValue(input.quantity),
    recommendationId: textValue(input.recommendationId),
    requestId: textValue(input.requestId),
    requestedPrice: textValue(input.requestedPrice),
    reviewButtonLabel: textValue(input.reviewButtonLabel),
    status: normalizeMockOrderConfirmationStatus(input.status),
    ticker: textValue(input.ticker),
    totalAmount: textValue(input.totalAmount),
    validUntil: textValue(input.validUntil),
  };
  const validation = validateMockOrderConfirmationPayload(payload);

  return {
    ok: validation.ok,
    payload,
    errors: validation.errors,
    warnings: validation.warnings,
    parsedAt: new Date().toISOString(),
    validation,
  };
}

export function buildMockOrderConfirmationUrl(
  payload: Partial<MockOrderConfirmationPayload>,
): string {
  const parsed = parseMockOrderConfirmationFields(payload);
  const params = new URLSearchParams();

  for (const fieldKey of confirmationPayloadFieldKeys) {
    const value = parsed.payload[fieldKey];

    if (value) {
      params.set(fieldKey, value);
    }
  }

  const queryString = params.toString();

  return queryString
    ? `${MOCK_ORDER_CONFIRMATION_TARGET_PATH}?${queryString}`
    : MOCK_ORDER_CONFIRMATION_TARGET_PATH;
}

export function validateMockOrderConfirmationPayload(
  payload: Partial<MockOrderConfirmationPayload> | null | undefined,
): MockOrderConfirmationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      errors: ["Mock order confirmation payload is missing."],
      warnings,
    };
  }

  if (!supportedStatuses.includes(payload.status as MockOrderConfirmationStatus)) {
    errors.push("Mock confirmation status is unsupported.");
  }

  if (!textValue(payload.ticker)) {
    warnings.push("Mock confirmation ticker is missing.");
  }

  if (!textValue(payload.action)) {
    warnings.push("Mock confirmation action is missing.");
  }

  if (!textValue(payload.quantity)) {
    warnings.push("Mock confirmation quantity is missing.");
  }

  if (textValue(payload.orderMode) && textValue(payload.orderMode) !== "advanced") {
    errors.push("Mock confirmation order mode must be advanced.");
  }

  if (hasAdvancedReadbackFields(payload)) {
    if (!textValue(payload.account)) {
      warnings.push("Mock confirmation account is missing.");
    }

    if (!textValue(payload.confirmButtonLabel)) {
      warnings.push("Mock confirmation confirm label is missing.");
    }

    if (!textValue(payload.cancelButtonLabel)) {
      warnings.push("Mock confirmation cancel label is missing.");
    }
  }

  if (!textValue(payload.requestId)) {
    warnings.push("Mock confirmation request id is missing.");
  }

  if (!textValue(payload.intentId)) {
    warnings.push("Mock confirmation intent id is missing.");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}
