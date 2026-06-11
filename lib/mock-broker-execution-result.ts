import {
  normalizeMockOrderConfirmationStatus,
  type MockOrderConfirmationParseResult,
  type MockOrderConfirmationPayload,
  type MockOrderConfirmationStatus,
} from "@/lib/mock-order-confirmation-contract";

export type DevMockBrokerExecutionStatus =
  | "submitted"
  | "filled"
  | "partially_filled"
  | "rejected"
  | "cancelled"
  | "unknown";

export type DevMockBrokerExecutionResult = {
  source: "mock_broker";
  isMock: true;
  createdAt: string;
  status: DevMockBrokerExecutionStatus;
  ticker: string;
  action: string;
  quantity?: number;
  requestedPrice?: number;
  executedPrice?: number;
  orderId?: string;
  requestId?: string;
  intentId?: string;
  positionId?: string;
  recommendationId?: string;
  message?: string;
  rawPayload: MockOrderConfirmationPayload;
  warnings: string[];
  errors: string[];
};

export type DevMockBrokerExecutionResultValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export type DevMockBrokerExecutionResultBuildOptions = {
  createdAt?: string | null;
  requireTicker?: boolean;
  requireQuantity?: boolean;
};

const supportedDevMockStatuses: DevMockBrokerExecutionStatus[] = [
  "submitted",
  "filled",
  "partially_filled",
  "rejected",
  "cancelled",
  "unknown",
];

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function normalizeCreatedAt(value: string | null | undefined): string {
  return value && Number.isFinite(Date.parse(value))
    ? value
    : new Date().toISOString();
}

function readOptionalNumber(
  value: string,
  fieldName: string,
  warnings: string[],
): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value.replace(/,/g, "."));

  if (!Number.isFinite(parsed)) {
    warnings.push(`${fieldName} could not be parsed as a number.`);
    return undefined;
  }

  return parsed;
}

export function normalizeDevMockBrokerExecutionStatus(
  status: MockOrderConfirmationStatus | string | null | undefined,
): DevMockBrokerExecutionStatus {
  const normalized = normalizeMockOrderConfirmationStatus(status);

  return supportedDevMockStatuses.includes(normalized)
    ? normalized
    : "unknown";
}

export function buildDevMockBrokerExecutionResultFromConfirmationPayload(
  payload: MockOrderConfirmationPayload,
  options: DevMockBrokerExecutionResultBuildOptions = {},
): DevMockBrokerExecutionResult {
  const warnings: string[] = [];
  const quantity = readOptionalNumber(payload.quantity, "Quantity", warnings);
  const requestedPrice = readOptionalNumber(
    payload.requestedPrice,
    "Requested price",
    warnings,
  );
  const executedPrice = readOptionalNumber(
    payload.executedPrice,
    "Executed price",
    warnings,
  );
  const result: DevMockBrokerExecutionResult = {
    source: "mock_broker",
    isMock: true,
    createdAt: normalizeCreatedAt(options.createdAt),
    status: normalizeDevMockBrokerExecutionStatus(payload.status),
    ticker: payload.ticker.trim(),
    action: payload.action.trim(),
    ...(typeof quantity === "number" ? { quantity } : {}),
    ...(typeof requestedPrice === "number" ? { requestedPrice } : {}),
    ...(typeof executedPrice === "number" ? { executedPrice } : {}),
    ...(optionalString(payload.orderId) ? { orderId: payload.orderId.trim() } : {}),
    ...(optionalString(payload.requestId)
      ? { requestId: payload.requestId.trim() }
      : {}),
    ...(optionalString(payload.intentId) ? { intentId: payload.intentId.trim() } : {}),
    ...(optionalString(payload.positionId)
      ? { positionId: payload.positionId.trim() }
      : {}),
    ...(optionalString(payload.recommendationId)
      ? { recommendationId: payload.recommendationId.trim() }
      : {}),
    ...(optionalString(payload.message) ? { message: payload.message.trim() } : {}),
    rawPayload: payload,
    warnings,
    errors: [],
  };
  const validation = validateDevMockBrokerExecutionResult(result, options);

  return {
    ...result,
    warnings: [...result.warnings, ...validation.warnings],
    errors: validation.errors,
  };
}

export function buildDevMockBrokerExecutionResultFromParseResult(
  parseResult: MockOrderConfirmationParseResult,
  options: DevMockBrokerExecutionResultBuildOptions = {},
): DevMockBrokerExecutionResult {
  if (!parseResult.ok) {
    return {
      source: "mock_broker",
      isMock: true,
      createdAt: normalizeCreatedAt(options.createdAt ?? parseResult.parsedAt),
      status: "unknown",
      ticker: parseResult.payload.ticker.trim(),
      action: parseResult.payload.action.trim(),
      rawPayload: parseResult.payload,
      warnings: parseResult.warnings,
      errors:
        parseResult.errors.length > 0
          ? parseResult.errors
          : ["Mock confirmation parse result was not ok."],
    };
  }

  return buildDevMockBrokerExecutionResultFromConfirmationPayload(
    parseResult.payload,
    {
      ...options,
      createdAt: options.createdAt ?? parseResult.parsedAt,
    },
  );
}

export function validateDevMockBrokerExecutionResult(
  result: Partial<DevMockBrokerExecutionResult> | null | undefined,
  options: Pick<
    DevMockBrokerExecutionResultBuildOptions,
    "requireTicker" | "requireQuantity"
  > = {},
): DevMockBrokerExecutionResultValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!result || typeof result !== "object") {
    return {
      ok: false,
      errors: ["Dev mock broker execution result is missing."],
      warnings,
    };
  }

  if (result.source !== "mock_broker") {
    errors.push("Dev mock broker execution result source must be mock_broker.");
  }

  if (result.isMock !== true) {
    errors.push("Dev mock broker execution result isMock must be true.");
  }

  if (!supportedDevMockStatuses.includes(result.status as DevMockBrokerExecutionStatus)) {
    errors.push("Dev mock broker execution result status is unsupported.");
  }

  if (!result.createdAt || !Number.isFinite(Date.parse(result.createdAt))) {
    errors.push("Dev mock broker execution result createdAt must be valid.");
  }

  if (options.requireTicker && !optionalString(result.ticker)) {
    errors.push("Dev mock broker execution result ticker is required.");
  } else if (!optionalString(result.ticker)) {
    warnings.push("Dev mock broker execution result ticker is missing.");
  }

  if (
    optionalString(result.action) &&
    result.action !== "buy" &&
    result.action !== "sell"
  ) {
    errors.push("Dev mock broker execution result action must be buy or sell when present.");
  }

  if (options.requireQuantity && typeof result.quantity !== "number") {
    errors.push("Dev mock broker execution result quantity is required.");
  }

  if (
    typeof result.quantity === "number" &&
    (!Number.isFinite(result.quantity) || result.quantity <= 0)
  ) {
    errors.push("Dev mock broker execution result quantity must be greater than 0 when present.");
  }

  if (
    typeof result.requestedPrice === "number" &&
    !Number.isFinite(result.requestedPrice)
  ) {
    errors.push("Dev mock broker execution result requestedPrice must be finite when present.");
  }

  if (
    typeof result.executedPrice === "number" &&
    !Number.isFinite(result.executedPrice)
  ) {
    errors.push("Dev mock broker execution result executedPrice must be finite when present.");
  }

  if (!result.rawPayload || typeof result.rawPayload !== "object") {
    errors.push("Dev mock broker execution result rawPayload is required.");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}
