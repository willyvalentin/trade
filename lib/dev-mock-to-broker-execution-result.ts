import {
  validateBrokerExecutionResult,
  type BrokerExecutionCaptureBrokerResult,
} from "@/lib/broker-execution-capture";
import {
  DEFAULT_EXECUTION_MODE,
  type BrokerExecutionResult,
  type BrokerExecutionStatus,
  type ExecutionAction,
  type ExecutionMode,
} from "@/lib/execution";
import {
  validateDevMockBrokerExecutionResult,
  type DevMockBrokerExecutionResult,
} from "@/lib/mock-broker-execution-result";
import type { StoredExecutionRecord } from "@/lib/execution-record-store";

export type DevMockBrokerConvertedBrokerExecutionResult =
  BrokerExecutionResult &
    BrokerExecutionCaptureBrokerResult & {
      broker: "avanza";
      action: ExecutionAction;
      ticker: string;
      quantity: number;
      requestedPrice?: number;
      executedPrice?: number;
      orderId?: string;
      brokerTimestamp: string;
      rawBrokerSummary: string;
      metadata: {
        source: "dev_mock_broker_result";
        isMockConversion: true;
        originalSource: "mock_broker";
        originalCreatedAt: string;
        mode: ExecutionMode;
        requestId?: string;
        intentId?: string;
        positionId?: string;
        recommendationId?: string;
        duplicateKey?: string;
      };
    };

export type DevMockBrokerToBrokerExecutionResultConversion = {
  ok: boolean;
  brokerResult?: DevMockBrokerConvertedBrokerExecutionResult;
  errors: string[];
  warnings: string[];
  convertedAt: string;
  source: "dev_mock_broker_result";
  isMockConversion: true;
};

export type DevMockBrokerToBrokerExecutionResultOptions = {
  convertedAt?: string | null;
  mode?: ExecutionMode | null;
  instrumentName?: string | null;
  orderType?: string | null;
};

const devMockConversionWarning =
  "Mock result converted to avanza-shaped BrokerExecutionResult for dev testing only.";
const rawBrokerSummary =
  "DEV MOCK CONVERSION - not a real Avanza confirmation.";

function normalizeConvertedAt(value: string | null | undefined): string {
  return value && Number.isFinite(Date.parse(value))
    ? value
    : new Date().toISOString();
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function duplicatePart(value: unknown): string {
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "unknown";
  }

  if (typeof value !== "string" || !value.trim()) {
    return "unknown";
  }

  return value.trim().toLowerCase().replace(/[^a-z0-9_.:-]+/g, "_");
}

function metadataString(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
): string | undefined {
  const value = metadata?.[key];

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function normalizeMode(value: ExecutionMode | null | undefined): ExecutionMode {
  return value === "automatic" || value === "semi_automatic"
    ? value
    : DEFAULT_EXECUTION_MODE;
}

function normalizeStatus(status: DevMockBrokerExecutionResult["status"]) {
  return status === "submitted" ||
    status === "filled" ||
    status === "partially_filled" ||
    status === "rejected" ||
    status === "cancelled"
    ? status
    : "unknown";
}

function statusTimestamp(
  status: BrokerExecutionStatus,
  createdAt: string,
  target: "submitted" | "filled",
) {
  if (target === "submitted") {
    return status === "submitted" ||
      status === "filled" ||
      status === "partially_filled"
      ? createdAt
      : null;
  }

  return status === "filled" || status === "partially_filled" ? createdAt : null;
}

export function buildDevMockCaptureDuplicateKey(
  mockResult: Pick<
    DevMockBrokerExecutionResult,
    | "action"
    | "intentId"
    | "orderId"
    | "quantity"
    | "requestId"
    | "status"
    | "ticker"
  > | null | undefined,
): string | null {
  if (!mockResult) {
    return null;
  }

  return [
    "dev_mock_broker_result",
    duplicatePart(mockResult.orderId),
    duplicatePart(mockResult.requestId),
    duplicatePart(mockResult.intentId),
    duplicatePart(mockResult.status),
    duplicatePart(mockResult.ticker),
    duplicatePart(mockResult.action),
    duplicatePart(mockResult.quantity),
  ].join("|");
}

export function isDevMockCaptureDuplicateKeyCertain(
  mockResult: Pick<
    DevMockBrokerExecutionResult,
    "intentId" | "orderId" | "requestId"
  > | null | undefined,
) {
  return Boolean(
    optionalString(mockResult?.orderId) ||
      optionalString(mockResult?.requestId) ||
      optionalString(mockResult?.intentId),
  );
}

export function buildDevMockCaptureDuplicateKeyFromRecord(
  record: StoredExecutionRecord | null | undefined,
): string | null {
  if (!record?.brokerResult) {
    return null;
  }

  const brokerResult = record.brokerResult as Record<string, unknown> & {
    metadata?: Record<string, unknown>;
  };
  const metadata = brokerResult.metadata;
  const metadataDuplicateKey = metadataString(metadata, "duplicateKey");

  if (metadataDuplicateKey) {
    return metadataDuplicateKey;
  }

  if (metadataString(metadata, "source") !== "dev_mock_broker_result") {
    return null;
  }

  return [
    "dev_mock_broker_result",
    duplicatePart(record.orderId ?? brokerResult.broker_order_id),
    duplicatePart(metadataString(metadata, "requestId")),
    duplicatePart(record.intentId ?? metadataString(metadata, "intentId")),
    duplicatePart(record.brokerStatus ?? brokerResult.status),
    duplicatePart(record.ticker ?? brokerResult.ticker),
    duplicatePart(record.action ?? brokerResult.action),
    duplicatePart(record.quantity ?? brokerResult.quantity),
  ].join("|");
}

export function findLocalExecutionRecordsForDevMockCapture(
  mockResult: Pick<
    DevMockBrokerExecutionResult,
    | "action"
    | "intentId"
    | "orderId"
    | "quantity"
    | "requestId"
    | "status"
    | "ticker"
  > | null | undefined,
  records: readonly StoredExecutionRecord[],
) {
  const duplicateKey = buildDevMockCaptureDuplicateKey(mockResult);

  if (!duplicateKey) {
    return [];
  }

  return records.filter(
    (record) => buildDevMockCaptureDuplicateKeyFromRecord(record) === duplicateKey,
  );
}

export function hasExistingDevMockCapture(
  mockResult: Parameters<typeof findLocalExecutionRecordsForDevMockCapture>[0],
  records: readonly StoredExecutionRecord[],
) {
  return findLocalExecutionRecordsForDevMockCapture(mockResult, records).length > 0;
}

export function convertDevMockBrokerResultToBrokerExecutionResult(
  mockResult: DevMockBrokerExecutionResult | null | undefined,
  options: DevMockBrokerToBrokerExecutionResultOptions = {},
): DevMockBrokerToBrokerExecutionResultConversion {
  const convertedAt = normalizeConvertedAt(options.convertedAt);
  const warnings = [devMockConversionWarning];
  const mockValidation = validateDevMockBrokerExecutionResult(mockResult, {
    requireQuantity: true,
    requireTicker: true,
  });
  const errors = [...mockValidation.errors];

  warnings.push(...mockValidation.warnings);

  if (!mockResult) {
    return {
      ok: false,
      errors,
      warnings,
      convertedAt,
      source: "dev_mock_broker_result",
      isMockConversion: true,
    };
  }

  if (mockResult.action !== "buy" && mockResult.action !== "sell") {
    errors.push("Dev mock broker result action must be buy or sell.");
  }

  if (typeof mockResult.quantity !== "number" || mockResult.quantity <= 0) {
    errors.push("Dev mock broker result quantity is required for conversion.");
  }

  const status = normalizeStatus(mockResult.status);
  const mode = normalizeMode(options.mode);
  const brokerTimestamp = mockResult.createdAt;
  const notes = [
    rawBrokerSummary,
    devMockConversionWarning,
    "Preview/conversion only; do not persist as a real TureExecutionRecord.",
    ...mockResult.warnings,
  ];

  if (mockResult.errors.length > 0) {
    errors.push(...mockResult.errors);
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
      warnings,
      convertedAt,
      source: "dev_mock_broker_result",
      isMockConversion: true,
    };
  }

  const action = mockResult.action as ExecutionAction;
  const quantity = mockResult.quantity as number;
  const duplicateKey = buildDevMockCaptureDuplicateKey(mockResult);
  const brokerResult: DevMockBrokerConvertedBrokerExecutionResult = {
    broker_hint: "AVANZA",
    status,
    captured_at: convertedAt,
    broker_order_id: mockResult.orderId ?? null,
    submitted_at: statusTimestamp(status, brokerTimestamp, "submitted"),
    filled_at: statusTimestamp(status, brokerTimestamp, "filled"),
    filled_quantity:
      status === "filled" || status === "partially_filled" ? quantity : null,
    average_fill_price:
      status === "filled" || status === "partially_filled"
        ? mockResult.executedPrice ?? null
        : null,
    rejection_reason: status === "rejected" ? mockResult.message ?? null : null,
    cancellation_reason:
      status === "cancelled" ? mockResult.message ?? null : null,
    raw_status: mockResult.status,
    notes,
    broker: "avanza",
    action,
    ticker: mockResult.ticker,
    quantity,
    brokerTimestamp,
    rawBrokerSummary,
    metadata: {
      source: "dev_mock_broker_result",
      isMockConversion: true,
      originalSource: "mock_broker",
      originalCreatedAt: mockResult.createdAt,
      mode,
      ...(mockResult.requestId ? { requestId: mockResult.requestId } : {}),
      ...(mockResult.intentId ? { intentId: mockResult.intentId } : {}),
      ...(mockResult.positionId ? { positionId: mockResult.positionId } : {}),
      ...(mockResult.recommendationId
        ? { recommendationId: mockResult.recommendationId }
        : {}),
      ...(duplicateKey ? { duplicateKey } : {}),
    },
    ...(options.instrumentName
      ? { instrumentName: options.instrumentName.trim() }
      : {}),
    ...(optionalString(options.orderType) ? { orderType: options.orderType } : {}),
    ...(typeof mockResult.requestedPrice === "number"
      ? { requestedPrice: mockResult.requestedPrice }
      : {}),
    ...(typeof mockResult.executedPrice === "number"
      ? { executedPrice: mockResult.executedPrice }
      : {}),
    ...(mockResult.orderId ? { orderId: mockResult.orderId } : {}),
  };
  const brokerResultErrors = validateBrokerExecutionResult(brokerResult);

  return {
    ok: brokerResultErrors.length === 0,
    brokerResult,
    errors: brokerResultErrors,
    warnings,
    convertedAt,
    source: "dev_mock_broker_result",
    isMockConversion: true,
  };
}

export function canConvertDevMockBrokerResult(
  mockResult: DevMockBrokerExecutionResult | null | undefined,
) {
  const conversion = convertDevMockBrokerResultToBrokerExecutionResult(
    mockResult,
  );

  return {
    ok: conversion.ok,
    errors: conversion.errors,
    warnings: conversion.warnings,
  };
}
