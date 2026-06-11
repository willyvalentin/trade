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
    action: textValue(input.action),
    executedPrice: textValue(input.executedPrice),
    intentId: textValue(input.intentId),
    message: textValue(input.message),
    orderId: textValue(input.orderId),
    positionId: textValue(input.positionId),
    quantity: textValue(input.quantity),
    recommendationId: textValue(input.recommendationId),
    requestId: textValue(input.requestId),
    requestedPrice: textValue(input.requestedPrice),
    status: normalizeMockOrderConfirmationStatus(input.status),
    ticker: textValue(input.ticker),
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
