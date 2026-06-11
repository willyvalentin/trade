import {
  validateExecutionIntent,
  type BrokerExecutionResult,
  type BrokerExecutionStatus,
  type ExecutionIntent,
} from "@/lib/execution";
import type {
  BrokerExecutionCaptureStatus,
  TureExecutionRecord,
} from "@/lib/broker-execution-capture";
import type {
  AvanzaAgentRequest,
  AvanzaAgentResult,
} from "@/lib/avanza-agent-adapter";
import type { AvanzaAgentBridgeEnvelope } from "@/lib/avanza-agent-bridge";

export const EXECUTION_SERVER_CAPTURE_CONTRACT_VERSION =
  "execution_server_capture_v1" as const;

export type ExecutionServerCaptureContractVersion =
  typeof EXECUTION_SERVER_CAPTURE_CONTRACT_VERSION;

export type ExecutionServerCaptureSource =
  | "manual"
  | "agent"
  | "bridge"
  | "mock"
  | "import";

export type ExecutionServerCaptureEnvironment =
  | "local_dev"
  | "staging"
  | "production";

export type ExecutionServerCaptureRequest = {
  version: ExecutionServerCaptureContractVersion;
  submittedAt: string;
  environment: ExecutionServerCaptureEnvironment;
  source: ExecutionServerCaptureSource;
  isMock: boolean;
  isDev: boolean;
  idempotencyKey: string;
  intent: ExecutionIntent;
  brokerResult: BrokerExecutionResult;
  agentRequest?: AvanzaAgentRequest;
  agentResult?: AvanzaAgentResult;
  bridgeEnvelope?: AvanzaAgentBridgeEnvelope;
  authoritySnapshot?: unknown;
  safetyChecks?: unknown[];
  metadata?: Record<string, unknown>;
};

export type ExecutionServerCaptureValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  idempotencyKey: string | null;
  normalizedSource: ExecutionServerCaptureSource | null;
  normalizedEnvironment: ExecutionServerCaptureEnvironment | null;
};

export type ExecutionServerCaptureResponseStatus =
  | "accepted"
  | "duplicate"
  | "rejected"
  | "invalid"
  | "stored"
  | "failed";

export type ExecutionServerCaptureResponse = {
  version: ExecutionServerCaptureContractVersion;
  receivedAt: string;
  status: ExecutionServerCaptureResponseStatus;
  idempotencyKey: string | null;
  captureStatus?: BrokerExecutionCaptureStatus;
  record?: TureExecutionRecord;
  errors?: string[];
  warnings?: string[];
  message: string;
};

export type ExecutionServerCaptureIdempotencyInput = {
  intent: ExecutionIntent;
  brokerResult: BrokerExecutionResult;
  source: ExecutionServerCaptureSource;
  environment: ExecutionServerCaptureEnvironment;
  isMock: boolean;
  isDev: boolean;
};

export type BuildExecutionServerCaptureRequestInput = {
  submittedAt?: string | null;
  environment?: ExecutionServerCaptureEnvironment | null;
  source?: ExecutionServerCaptureSource | null;
  isMock?: boolean | null;
  isDev?: boolean | null;
  idempotencyKey?: string | null;
  intent: ExecutionIntent;
  brokerResult: BrokerExecutionResult;
  agentRequest?: AvanzaAgentRequest | null;
  agentResult?: AvanzaAgentResult | null;
  bridgeEnvelope?: AvanzaAgentBridgeEnvelope | null;
  authoritySnapshot?: unknown;
  safetyChecks?: unknown[] | null;
  metadata?: Record<string, unknown> | null;
};

export type ExecutionServerCaptureValidationOptions = {
  allowProductionMock?: boolean;
  trustedServerCapture?: boolean;
};

export type CreateExecutionServerCaptureResponseInput = {
  idempotencyKey?: string | null;
  receivedAt?: string | null;
  captureStatus?: BrokerExecutionCaptureStatus;
  record?: TureExecutionRecord;
  errors?: string[] | null;
  warnings?: string[] | null;
  message?: string | null;
};

const captureSources: ExecutionServerCaptureSource[] = [
  "manual",
  "agent",
  "bridge",
  "mock",
  "import",
];

const captureEnvironments: ExecutionServerCaptureEnvironment[] = [
  "local_dev",
  "staging",
  "production",
];

const brokerExecutionStatuses: BrokerExecutionStatus[] = [
  "submitted",
  "filled",
  "partially_filled",
  "rejected",
  "cancelled",
  "unknown",
];

function normalizeSubmittedAt(value: string | null | undefined) {
  return value && Number.isFinite(Date.parse(value))
    ? value
    : new Date().toISOString();
}

function normalizeStringPart(value: unknown) {
  if (typeof value !== "string") {
    return "none";
  }

  const normalized = value.trim().toLowerCase();

  return normalized
    ? normalized.replace(/[^a-z0-9._:-]+/g, "_").replace(/^_+|_+$/g, "")
    : "none";
}

function normalizeNumberPart(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? String(value)
    : "none";
}

function normalizeSource(
  source: unknown,
): ExecutionServerCaptureSource | null {
  return captureSources.includes(source as ExecutionServerCaptureSource)
    ? (source as ExecutionServerCaptureSource)
    : null;
}

function normalizeEnvironment(
  environment: unknown,
): ExecutionServerCaptureEnvironment | null {
  return captureEnvironments.includes(
    environment as ExecutionServerCaptureEnvironment,
  )
    ? (environment as ExecutionServerCaptureEnvironment)
    : null;
}

function isBrokerExecutionStatus(value: unknown): value is BrokerExecutionStatus {
  return brokerExecutionStatuses.includes(value as BrokerExecutionStatus);
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = Number(value.trim().replace(",", "."));

  return Number.isFinite(parsed) ? parsed : null;
}

function validateBrokerResultShape(
  result: BrokerExecutionResult | null | undefined,
) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!result) {
    return {
      errors: ["Broker execution result is missing."],
      warnings,
    };
  }

  if (result.broker_hint !== "AVANZA") {
    errors.push("Broker execution result broker_hint must be AVANZA.");
  }

  if (!isBrokerExecutionStatus(result.status)) {
    errors.push("Broker execution result status is invalid.");
  }

  if (!result.captured_at || !Number.isFinite(Date.parse(result.captured_at))) {
    errors.push("Broker execution result captured_at is missing or invalid.");
  }

  if (!result.broker_order_id) {
    warnings.push(
      "Broker execution result has no broker_order_id; idempotency must rely on request context.",
    );
  }

  return { errors, warnings };
}

function validateIntentBrokerResultConsistency(
  intent: ExecutionIntent | null | undefined,
  result: BrokerExecutionResult | null | undefined,
) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!intent || !result) {
    return { errors, warnings };
  }

  if (intent.broker_hint !== result.broker_hint) {
    errors.push("Execution intent broker does not match broker result broker.");
  }

  const resultRecord = result as Record<string, unknown>;
  const resultAction = optionalString(resultRecord.action);
  const resultTicker = optionalString(resultRecord.ticker);
  const resultQuantity = finiteNumber(resultRecord.quantity);

  if (
    resultAction &&
    resultAction !== "buy" &&
    resultAction !== "sell"
  ) {
    errors.push("Broker result action must be buy or sell when provided.");
  }

  if (
    resultAction &&
    (resultAction === "buy" || resultAction === "sell") &&
    resultAction !== intent.action
  ) {
    errors.push("Broker result action does not match execution intent action.");
  }

  if (
    resultTicker &&
    resultTicker.toUpperCase() !== intent.trading_package.ticker.toUpperCase()
  ) {
    errors.push("Broker result ticker does not match execution intent ticker.");
  }

  const intendedQuantity = intent.trading_package.quantity;
  if (
    typeof intendedQuantity === "number" &&
    resultQuantity !== null &&
    intendedQuantity !== resultQuantity
  ) {
    errors.push("Broker result quantity does not match execution intent quantity.");
  }

  const filledQuantity = result.filled_quantity;

  if (
    result.status === "filled" &&
    typeof intendedQuantity === "number" &&
    typeof filledQuantity === "number" &&
    intendedQuantity !== filledQuantity
  ) {
    errors.push("Filled quantity does not match the execution intent quantity.");
  }

  if (
    result.status === "partially_filled" &&
    typeof intendedQuantity === "number" &&
    typeof filledQuantity === "number" &&
    filledQuantity > intendedQuantity
  ) {
    errors.push("Partial fill quantity exceeds the execution intent quantity.");
  }

  if (!result.broker_order_id) {
    warnings.push(
      "Broker result cannot be uniquely matched to a broker order without broker_order_id.",
    );
  }

  return { errors, warnings };
}

export function buildExecutionServerCaptureIdempotencyKey(
  input: ExecutionServerCaptureIdempotencyInput,
) {
  const broker = normalizeStringPart(input.brokerResult.broker_hint);
  const brokerOrderId = normalizeStringPart(input.brokerResult.broker_order_id);
  const intentId = normalizeStringPart(input.intent.intent_id);
  const action = normalizeStringPart(input.intent.action);
  const ticker = normalizeStringPart(input.intent.trading_package.ticker);
  const quantity = normalizeNumberPart(input.intent.trading_package.quantity);
  const brokerStatus = normalizeStringPart(input.brokerResult.status);
  const source = normalizeStringPart(input.source);
  const environment = normalizeStringPart(input.environment);
  const mockFlag = input.isMock ? "mock" : "real";
  const devFlag = input.isDev ? "dev" : "nondev";

  if (brokerOrderId !== "none") {
    return [
      EXECUTION_SERVER_CAPTURE_CONTRACT_VERSION,
      environment,
      source,
      mockFlag,
      devFlag,
      broker,
      brokerOrderId,
      intentId,
      action,
      ticker,
      quantity,
      brokerStatus,
    ].join(":");
  }

  return [
    EXECUTION_SERVER_CAPTURE_CONTRACT_VERSION,
    environment,
    source,
    mockFlag,
    devFlag,
    broker,
    intentId,
    action,
    ticker,
    quantity,
    brokerStatus,
  ].join(":");
}

export function buildExecutionServerCaptureRequest(
  input: BuildExecutionServerCaptureRequestInput,
): ExecutionServerCaptureRequest {
  const environment = input.environment ?? "local_dev";
  const source = input.source ?? "manual";
  const isMock = input.isMock ?? source === "mock";
  const isDev = input.isDev ?? environment === "local_dev";
  const idempotencyKey =
    input.idempotencyKey?.trim() ||
    buildExecutionServerCaptureIdempotencyKey({
      intent: input.intent,
      brokerResult: input.brokerResult,
      source,
      environment,
      isMock,
      isDev,
    });

  return {
    version: EXECUTION_SERVER_CAPTURE_CONTRACT_VERSION,
    submittedAt: normalizeSubmittedAt(input.submittedAt),
    environment,
    source,
    isMock,
    isDev,
    idempotencyKey,
    intent: input.intent,
    brokerResult: input.brokerResult,
    ...(input.agentRequest ? { agentRequest: input.agentRequest } : {}),
    ...(input.agentResult ? { agentResult: input.agentResult } : {}),
    ...(input.bridgeEnvelope ? { bridgeEnvelope: input.bridgeEnvelope } : {}),
    ...(input.authoritySnapshot !== undefined
      ? { authoritySnapshot: input.authoritySnapshot }
      : {}),
    ...(input.safetyChecks ? { safetyChecks: input.safetyChecks } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };
}

export function validateExecutionServerCaptureRequest(
  request: Partial<ExecutionServerCaptureRequest> | null | undefined,
  options: ExecutionServerCaptureValidationOptions = {},
): ExecutionServerCaptureValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const normalizedSource = normalizeSource(request?.source);
  const normalizedEnvironment = normalizeEnvironment(request?.environment);
  const idempotencyKey =
    typeof request?.idempotencyKey === "string" && request.idempotencyKey.trim()
      ? request.idempotencyKey.trim()
      : null;

  if (!request) {
    return {
      ok: false,
      errors: ["Execution server capture request is missing."],
      warnings,
      idempotencyKey,
      normalizedSource,
      normalizedEnvironment,
    };
  }

  if (request.version !== EXECUTION_SERVER_CAPTURE_CONTRACT_VERSION) {
    errors.push("Execution server capture request version is invalid.");
  }

  if (
    !request.submittedAt ||
    !Number.isFinite(Date.parse(request.submittedAt))
  ) {
    errors.push("Execution server capture submittedAt is missing or invalid.");
  }

  if (!normalizedSource) {
    errors.push("Execution server capture source is invalid.");
  }

  if (!normalizedEnvironment) {
    errors.push("Execution server capture environment is invalid.");
  }

  if (typeof request.isMock !== "boolean") {
    errors.push("Execution server capture isMock must be explicit.");
  }

  if (typeof request.isDev !== "boolean") {
    errors.push("Execution server capture isDev must be explicit.");
  }

  if (!idempotencyKey) {
    errors.push("Execution server capture idempotencyKey is missing.");
  }

  if (normalizedSource === "mock" && request.isMock !== true) {
    errors.push("Mock capture source must set isMock=true.");
  }

  if (
    normalizedEnvironment === "production" &&
    (request.isMock || request.isDev) &&
    !options.allowProductionMock
  ) {
    errors.push("Production execution capture cannot be mock/dev data.");
  }

  if (
    normalizedEnvironment === "production" &&
    !request.isMock &&
    !request.isDev &&
    !options.trustedServerCapture
  ) {
    warnings.push(
      "Production real captures must be accepted only through a trusted server validation path.",
    );
  }

  if (request.intent) {
    const intentValidation = validateExecutionIntent(request.intent);
    errors.push(...intentValidation.errors);
    warnings.push(...intentValidation.warnings);
  } else {
    errors.push("Execution server capture intent is missing.");
  }

  const brokerResultValidation = validateBrokerResultShape(request.brokerResult);
  errors.push(...brokerResultValidation.errors);
  warnings.push(...brokerResultValidation.warnings);

  const consistency = validateIntentBrokerResultConsistency(
    request.intent,
    request.brokerResult,
  );
  errors.push(...consistency.errors);
  warnings.push(...consistency.warnings);

  if (
    idempotencyKey &&
    normalizedSource &&
    normalizedEnvironment &&
    typeof request.isMock === "boolean" &&
    typeof request.isDev === "boolean" &&
    request.intent &&
    request.brokerResult
  ) {
    const expectedIdempotencyKey = buildExecutionServerCaptureIdempotencyKey({
      intent: request.intent,
      brokerResult: request.brokerResult,
      source: normalizedSource,
      environment: normalizedEnvironment,
      isMock: request.isMock,
      isDev: request.isDev,
    });

    if (idempotencyKey !== expectedIdempotencyKey) {
      errors.push(
        "Execution server capture idempotencyKey does not match the expected deterministic key.",
      );
    }
  }

  if (
    request.agentResult?.brokerResult &&
    request.brokerResult &&
    request.agentResult.brokerResult.broker_order_id !==
      request.brokerResult.broker_order_id
  ) {
    warnings.push(
      "Agent result broker order id differs from the capture broker result order id.",
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    idempotencyKey,
    normalizedSource,
    normalizedEnvironment,
  };
}

export function createRejectedExecutionServerCaptureResponse(
  input: CreateExecutionServerCaptureResponseInput,
): ExecutionServerCaptureResponse {
  const errors = input.errors?.filter(Boolean) ?? [];

  return {
    version: EXECUTION_SERVER_CAPTURE_CONTRACT_VERSION,
    receivedAt: normalizeSubmittedAt(input.receivedAt),
    status: errors.length ? "invalid" : "rejected",
    idempotencyKey: input.idempotencyKey?.trim() || null,
    ...(input.captureStatus ? { captureStatus: input.captureStatus } : {}),
    errors,
    warnings: input.warnings?.filter(Boolean) ?? [],
    message: input.message ?? "Execution server capture request was rejected.",
  };
}

export function createAcceptedExecutionServerCaptureResponse(
  input: CreateExecutionServerCaptureResponseInput,
): ExecutionServerCaptureResponse {
  return {
    version: EXECUTION_SERVER_CAPTURE_CONTRACT_VERSION,
    receivedAt: normalizeSubmittedAt(input.receivedAt),
    status: input.record ? "stored" : "accepted",
    idempotencyKey: input.idempotencyKey?.trim() || null,
    ...(input.captureStatus ? { captureStatus: input.captureStatus } : {}),
    ...(input.record ? { record: input.record } : {}),
    errors: input.errors?.filter(Boolean) ?? [],
    warnings: input.warnings?.filter(Boolean) ?? [],
    message: input.message ?? "Execution server capture request was accepted.",
  };
}
