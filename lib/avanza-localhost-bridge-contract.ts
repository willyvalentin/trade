import {
  validateAvanzaAgentRequest,
  type AvanzaAgentProgressEvent,
  type AvanzaAgentRequest,
  type AvanzaAgentResult,
} from "@/lib/avanza-agent-adapter";
import {
  validateMockOrderPageFillPlan,
  type MockOrderPageFillPlan,
} from "@/lib/mock-order-page-agent-contract";
import {
  validateAvanzaAgentBridgeEnvelope,
  type AvanzaAgentBridgeCapabilities,
  type AvanzaAgentBridgeEnvelope,
  type AvanzaAgentBridgeHealth,
  type AvanzaAgentBridgeStatus,
} from "@/lib/avanza-agent-bridge";

export const LOCALHOST_BRIDGE_CONTRACT_VERSION =
  "avanza_localhost_bridge_v1" as const;

export const DEFAULT_LOCALHOST_BRIDGE_PORT = 47831;
export const DEFAULT_LOCALHOST_BRIDGE_BASE_URL = "http://127.0.0.1:47831";

export const LOCALHOST_BRIDGE_ENDPOINT_PATHS = {
  health: "/health",
  run: "/run",
  cancel: "/cancel",
  eventsByRequestId: "/events/:requestId",
  websocketEvents: "/events",
} as const;

export type LocalhostBridgeContractVersion =
  typeof LOCALHOST_BRIDGE_CONTRACT_VERSION;

export type LocalhostBridgeTransport = "http" | "websocket" | "local_process";

export type LocalhostBridgeEventStreamMessageType =
  | "progress"
  | "result"
  | "error"
  | "heartbeat";

export type LocalhostBridgeValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export type LocalhostBridgeHealthResponse = {
  version: LocalhostBridgeContractVersion;
  bridgeName: string;
  bridgeStatus: AvanzaAgentBridgeStatus;
  transport: LocalhostBridgeTransport;
  health: AvanzaAgentBridgeHealth;
  capabilities: AvanzaAgentBridgeCapabilities;
  serverTime: string;
  message: string;
};

export type LocalhostBridgeRunRequest = {
  version: LocalhostBridgeContractVersion;
  envelope: AvanzaAgentBridgeEnvelope;
  request: AvanzaAgentRequest;
  dryRun: true;
  enableMockAgentRun?: boolean;
  mockPageBaseUrl?: string;
  mockAgentHeaded?: boolean;
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeRunResponse = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  accepted: boolean;
  result?: AvanzaAgentResult;
  mockOrderPageUrl?: string;
  mockOrderPageAvailable?: boolean;
  mockOrderPageMessage?: string;
  mockOrderFillPlan?: MockOrderPageFillPlan;
  mockOrderFillPlanValid?: boolean;
  mockOrderFillPlanErrors?: string[];
  mockOrderFillPlanWarnings?: string[];
  mockAgentRunAttempted?: boolean;
  mockAgentRunOk?: boolean;
  mockAgentRunMessage?: string;
  mockAgentRunErrors?: string[];
  mockAgentRunStartedAt?: string;
  mockAgentRunCompletedAt?: string;
  message: string;
  errors?: string[];
  warnings?: string[];
};

export type LocalhostBridgeCancelRequest = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  reason?: string;
};

export type LocalhostBridgeCancelResponse = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  cancelled: boolean;
  message: string;
  errors?: string[];
};

export type LocalhostBridgeEventStreamMessage = {
  version: LocalhostBridgeContractVersion;
  type: LocalhostBridgeEventStreamMessageType;
  requestId?: string;
  progressEvent?: AvanzaAgentProgressEvent;
  result?: AvanzaAgentResult;
  error?: string;
  createdAt: string;
};

export type BuildLocalhostBridgeRunRequestOptions = {
  enableMockAgentRun?: boolean;
  mockPageBaseUrl?: string;
  mockAgentHeaded?: boolean;
  metadata?: Record<string, unknown> | null;
};

const supportedLocalhostBridgeTransports: readonly LocalhostBridgeTransport[] = [
  "http",
  "websocket",
  "local_process",
];

const supportedEventStreamMessageTypes: readonly LocalhostBridgeEventStreamMessageType[] =
  ["progress", "result", "error", "heartbeat"];

const supportedResultStatuses: readonly AvanzaAgentResult["status"][] = [
  "not_started",
  "in_progress",
  "waiting_for_manual_confirmation",
  "submitted",
  "filled",
  "partially_filled",
  "rejected",
  "cancelled",
  "failed",
  "unknown",
];

const supportedBridgeStatuses: readonly AvanzaAgentBridgeStatus[] = [
  "unavailable",
  "available",
  "connecting",
  "connected",
  "disconnected",
  "error",
];

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeMetadata(
  metadata: Record<string, unknown> | null | undefined,
): Record<string, unknown> | undefined {
  return metadata ? { ...metadata } : undefined;
}

function isValidTimestamp(value: unknown): boolean {
  const timestamp = optionalString(value);

  return Boolean(timestamp && Number.isFinite(Date.parse(timestamp)));
}

function isLocalhostUrlString(value: unknown): boolean {
  const text = optionalString(value);

  if (!text) {
    return false;
  }

  try {
    const url = new URL(text);

    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      ["localhost", "127.0.0.1", "::1"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

function isSupportedTransport(
  value: unknown,
): value is LocalhostBridgeTransport {
  return supportedLocalhostBridgeTransports.includes(
    value as LocalhostBridgeTransport,
  );
}

function isSupportedEventStreamMessageType(
  value: unknown,
): value is LocalhostBridgeEventStreamMessageType {
  return supportedEventStreamMessageTypes.includes(
    value as LocalhostBridgeEventStreamMessageType,
  );
}

function isSupportedResultStatus(
  value: unknown,
): value is AvanzaAgentResult["status"] {
  return supportedResultStatuses.includes(value as AvanzaAgentResult["status"]);
}

function isSupportedBridgeStatus(
  value: unknown,
): value is AvanzaAgentBridgeStatus {
  return supportedBridgeStatuses.includes(value as AvanzaAgentBridgeStatus);
}

function createValidationResult(
  errors: string[],
  warnings: string[] = [],
): LocalhostBridgeValidationResult {
  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function validateVersion(
  value: unknown,
  errors: string[],
  subject: string,
) {
  if (value !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `${subject} version must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }
}

function validateResultShape(
  result: unknown,
  subject: string,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(result)) {
    return createValidationResult([`${subject} is missing.`], warnings);
  }

  if (!optionalString(result.requestId)) {
    errors.push(`${subject} requestId is missing.`);
  }

  if (!isValidTimestamp(result.createdAt)) {
    errors.push(`${subject} createdAt must be a valid timestamp.`);
  }

  if (!isSupportedResultStatus(result.status)) {
    errors.push(`${subject} status is unsupported.`);
  }

  if (!Array.isArray(result.progressEvents)) {
    errors.push(`${subject} progressEvents must be an array.`);
  }

  if (typeof result.brokerResult !== "undefined") {
    warnings.push(
      `${subject} includes brokerResult; localhost bridge v1 should keep brokerResult undefined until the mock broker-result phase.`,
    );
  }

  return createValidationResult(errors, warnings);
}

function validateProgressEventShape(
  event: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];

  if (!isObject(event)) {
    return createValidationResult(["Progress event is missing."]);
  }

  if (!optionalString(event.eventId)) {
    errors.push("Progress event id is missing.");
  }

  if (!optionalString(event.requestId)) {
    errors.push("Progress event requestId is missing.");
  }

  if (!isValidTimestamp(event.createdAt)) {
    errors.push("Progress event createdAt must be a valid timestamp.");
  }

  if (!optionalString(event.type)) {
    errors.push("Progress event type is missing.");
  }

  if (!optionalString(event.message)) {
    errors.push("Progress event message is missing.");
  }

  return createValidationResult(errors);
}

function validateMockOrderPageRunMetadata(
  response: Partial<LocalhostBridgeRunResponse>,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (
    typeof response.mockOrderPageUrl !== "undefined" &&
    !optionalString(response.mockOrderPageUrl)
  ) {
    errors.push("Localhost bridge run response mockOrderPageUrl must be non-empty when provided.");
  }

  if (
    typeof response.mockOrderPageUrl === "string" &&
    !response.mockOrderPageUrl.startsWith("/mock-broker/order")
  ) {
    errors.push("Localhost bridge run response mockOrderPageUrl must be a relative mock broker order URL.");
  }

  if (
    typeof response.mockOrderPageAvailable !== "undefined" &&
    typeof response.mockOrderPageAvailable !== "boolean"
  ) {
    errors.push("Localhost bridge run response mockOrderPageAvailable must be boolean when provided.");
  }

  if (
    typeof response.mockOrderPageMessage !== "undefined" &&
    !optionalString(response.mockOrderPageMessage)
  ) {
    errors.push("Localhost bridge run response mockOrderPageMessage must be non-empty when provided.");
  }

  if (
    typeof response.mockOrderFillPlanValid !== "undefined" &&
    typeof response.mockOrderFillPlanValid !== "boolean"
  ) {
    errors.push("Localhost bridge run response mockOrderFillPlanValid must be boolean when provided.");
  }

  if (
    typeof response.mockOrderFillPlanErrors !== "undefined" &&
    !Array.isArray(response.mockOrderFillPlanErrors)
  ) {
    errors.push("Localhost bridge run response mockOrderFillPlanErrors must be an array when provided.");
  }

  if (
    typeof response.mockOrderFillPlanWarnings !== "undefined" &&
    !Array.isArray(response.mockOrderFillPlanWarnings)
  ) {
    errors.push("Localhost bridge run response mockOrderFillPlanWarnings must be an array when provided.");
  }

  if (
    typeof response.mockAgentRunAttempted !== "undefined" &&
    typeof response.mockAgentRunAttempted !== "boolean"
  ) {
    errors.push("Localhost bridge run response mockAgentRunAttempted must be boolean when provided.");
  }

  if (
    typeof response.mockAgentRunOk !== "undefined" &&
    typeof response.mockAgentRunOk !== "boolean"
  ) {
    errors.push("Localhost bridge run response mockAgentRunOk must be boolean when provided.");
  }

  if (
    typeof response.mockAgentRunMessage !== "undefined" &&
    !optionalString(response.mockAgentRunMessage)
  ) {
    errors.push("Localhost bridge run response mockAgentRunMessage must be non-empty when provided.");
  }

  if (
    typeof response.mockAgentRunErrors !== "undefined" &&
    !Array.isArray(response.mockAgentRunErrors)
  ) {
    errors.push("Localhost bridge run response mockAgentRunErrors must be an array when provided.");
  }

  if (
    typeof response.mockAgentRunStartedAt !== "undefined" &&
    !isValidTimestamp(response.mockAgentRunStartedAt)
  ) {
    errors.push("Localhost bridge run response mockAgentRunStartedAt must be a valid timestamp when provided.");
  }

  if (
    typeof response.mockAgentRunCompletedAt !== "undefined" &&
    !isValidTimestamp(response.mockAgentRunCompletedAt)
  ) {
    errors.push("Localhost bridge run response mockAgentRunCompletedAt must be a valid timestamp when provided.");
  }

  if (typeof response.mockOrderFillPlan !== "undefined") {
    const fillPlanValidation = validateMockOrderPageFillPlan(
      response.mockOrderFillPlan,
    );

    if (
      typeof response.mockOrderFillPlanValid === "boolean" &&
      response.mockOrderFillPlanValid !== fillPlanValidation.ok
    ) {
      errors.push("Localhost bridge run response mockOrderFillPlanValid must match fill-plan validation.");
    }

    warnings.push(
      ...fillPlanValidation.warnings.map(
        (warning) => `Mock order fill plan: ${warning}`,
      ),
    );

    if (!fillPlanValidation.ok) {
      warnings.push(
        ...fillPlanValidation.errors.map(
          (error) => `Mock order fill plan: ${error}`,
        ),
      );
    }
  }

  return createValidationResult(errors, warnings);
}

function getEnvelopePayloadRequestId(
  envelope: Partial<AvanzaAgentBridgeEnvelope> | null | undefined,
): string | null {
  return isObject(envelope?.payload)
    ? optionalString(envelope.payload.requestId)
    : null;
}

export function validateLocalhostBridgeHealthResponse(
  response: Partial<LocalhostBridgeHealthResponse> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge health response is missing."],
      warnings,
    );
  }

  validateVersion(response.version, errors, "Localhost bridge health response");

  if (!optionalString(response.bridgeName)) {
    errors.push("Localhost bridge health response bridgeName is missing.");
  }

  if (!isSupportedBridgeStatus(response.bridgeStatus)) {
    errors.push("Localhost bridge health response bridgeStatus is unsupported.");
  }

  if (!isSupportedTransport(response.transport)) {
    errors.push("Localhost bridge health response transport is unsupported.");
  }

  if (!isObject(response.health)) {
    errors.push("Localhost bridge health response health is missing.");
  }

  if (!isObject(response.capabilities)) {
    errors.push("Localhost bridge health response capabilities are missing.");
  }

  if (!isValidTimestamp(response.serverTime)) {
    errors.push("Localhost bridge health response serverTime must be valid.");
  }

  if (!optionalString(response.message)) {
    errors.push("Localhost bridge health response message is missing.");
  }

  if (response.capabilities?.supportsRealBrokerAutomation === true) {
    warnings.push(
      "Localhost bridge health response reports real broker automation; this must stay false for the first stub prototype.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeRunRequest(
  request: Partial<LocalhostBridgeRunRequest> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(
      ["Localhost bridge run request is missing."],
      warnings,
    );
  }

  validateVersion(request.version, errors, "Localhost bridge run request");

  if (request.dryRun !== true) {
    errors.push("Localhost bridge run request dryRun must be true.");
  }

  if (
    typeof request.enableMockAgentRun !== "undefined" &&
    typeof request.enableMockAgentRun !== "boolean"
  ) {
    errors.push("Localhost bridge run request enableMockAgentRun must be boolean when provided.");
  }

  if (
    typeof request.mockAgentHeaded !== "undefined" &&
    typeof request.mockAgentHeaded !== "boolean"
  ) {
    errors.push("Localhost bridge run request mockAgentHeaded must be boolean when provided.");
  }

  if (
    typeof request.mockPageBaseUrl !== "undefined" &&
    !isLocalhostUrlString(request.mockPageBaseUrl)
  ) {
    errors.push("Localhost bridge run request mockPageBaseUrl must be a localhost HTTP(S) URL when provided.");
  }

  if (isObject(request.metadata)) {
    if (
      typeof request.metadata.enableMockAgentRun !== "undefined" &&
      typeof request.metadata.enableMockAgentRun !== "boolean"
    ) {
      errors.push("Localhost bridge run request metadata.enableMockAgentRun must be boolean when provided.");
    }

    if (
      typeof request.metadata.mockAgentHeaded !== "undefined" &&
      typeof request.metadata.mockAgentHeaded !== "boolean"
    ) {
      errors.push("Localhost bridge run request metadata.mockAgentHeaded must be boolean when provided.");
    }

    if (
      typeof request.metadata.mockPageBaseUrl !== "undefined" &&
      !isLocalhostUrlString(request.metadata.mockPageBaseUrl)
    ) {
      errors.push("Localhost bridge run request metadata.mockPageBaseUrl must be a localhost HTTP(S) URL when provided.");
    }
  }

  const envelopeValidation = validateAvanzaAgentBridgeEnvelope(request.envelope);

  if (!envelopeValidation.ok) {
    errors.push(
      ...envelopeValidation.errors.map((error) => `Envelope: ${error}`),
    );
  }

  warnings.push(
    ...envelopeValidation.warnings.map((warning) => `Envelope: ${warning}`),
  );

  if (request.envelope?.type !== "request") {
    errors.push("Localhost bridge run request envelope type must be request.");
  }

  const requestValidation = validateAvanzaAgentRequest(request.request);

  if (!requestValidation.ok) {
    errors.push(
      ...requestValidation.errors.map(
        (error) => `Avanza agent request: ${error}`,
      ),
    );
  }

  warnings.push(
    ...requestValidation.warnings.map(
      (warning) => `Avanza agent request: ${warning}`,
    ),
  );

  const requestId = optionalString(request.request?.requestId);
  const envelopeRequestId = optionalString(request.envelope?.requestId);
  const payloadRequestId = getEnvelopePayloadRequestId(request.envelope);

  if (envelopeRequestId && requestId && envelopeRequestId !== requestId) {
    errors.push("Localhost bridge run request envelope requestId must match request requestId.");
  }

  if (payloadRequestId && requestId && payloadRequestId !== requestId) {
    errors.push("Localhost bridge run request envelope payload requestId must match request requestId.");
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeRunResponse(
  response: Partial<LocalhostBridgeRunResponse> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge run response is missing."],
      warnings,
    );
  }

  validateVersion(response.version, errors, "Localhost bridge run response");

  if (!optionalString(response.requestId)) {
    errors.push("Localhost bridge run response requestId is missing.");
  }

  if (typeof response.accepted !== "boolean") {
    errors.push("Localhost bridge run response accepted must be boolean.");
  }

  if (!optionalString(response.message)) {
    errors.push("Localhost bridge run response message is missing.");
  }

  if (response.result) {
    const resultValidation = validateResultShape(
      response.result,
      "Localhost bridge run response result",
    );

    errors.push(...resultValidation.errors);
    warnings.push(...resultValidation.warnings);

    if (
      optionalString(response.requestId) &&
      optionalString(response.result.requestId) &&
      response.requestId !== response.result.requestId
    ) {
      errors.push("Localhost bridge run response result requestId must match response requestId.");
    }
  }

  if (response.errors && !Array.isArray(response.errors)) {
    errors.push("Localhost bridge run response errors must be an array.");
  }

  if (response.warnings && !Array.isArray(response.warnings)) {
    errors.push("Localhost bridge run response warnings must be an array.");
  }

  const mockOrderMetadataValidation =
    validateMockOrderPageRunMetadata(response);

  errors.push(...mockOrderMetadataValidation.errors);
  warnings.push(...mockOrderMetadataValidation.warnings);

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeCancelRequest(
  request: Partial<LocalhostBridgeCancelRequest> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(["Localhost bridge cancel request is missing."]);
  }

  validateVersion(request.version, errors, "Localhost bridge cancel request");

  if (!optionalString(request.requestId)) {
    errors.push("Localhost bridge cancel request requestId is missing.");
  }

  if (
    typeof request.reason !== "undefined" &&
    request.reason !== null &&
    !optionalString(request.reason)
  ) {
    errors.push("Localhost bridge cancel request reason must be non-empty when provided.");
  }

  return createValidationResult(errors);
}

export function validateLocalhostBridgeCancelResponse(
  response: Partial<LocalhostBridgeCancelResponse> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(["Localhost bridge cancel response is missing."]);
  }

  validateVersion(response.version, errors, "Localhost bridge cancel response");

  if (!optionalString(response.requestId)) {
    errors.push("Localhost bridge cancel response requestId is missing.");
  }

  if (typeof response.cancelled !== "boolean") {
    errors.push("Localhost bridge cancel response cancelled must be boolean.");
  }

  if (!optionalString(response.message)) {
    errors.push("Localhost bridge cancel response message is missing.");
  }

  if (response.errors && !Array.isArray(response.errors)) {
    errors.push("Localhost bridge cancel response errors must be an array.");
  }

  return createValidationResult(errors);
}

export function validateLocalhostBridgeEventStreamMessage(
  message: Partial<LocalhostBridgeEventStreamMessage> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(message)) {
    return createValidationResult(
      ["Localhost bridge event stream message is missing."],
      warnings,
    );
  }

  validateVersion(message.version, errors, "Localhost bridge event stream message");

  if (!isSupportedEventStreamMessageType(message.type)) {
    errors.push("Localhost bridge event stream message type is unsupported.");
  }

  if (!isValidTimestamp(message.createdAt)) {
    errors.push("Localhost bridge event stream message createdAt must be valid.");
  }

  if (message.type !== "heartbeat" && !optionalString(message.requestId)) {
    errors.push("Localhost bridge event stream message requestId is missing.");
  }

  if (message.type === "progress") {
    const progressValidation = validateProgressEventShape(message.progressEvent);

    errors.push(...progressValidation.errors);
  }

  if (message.type === "result") {
    const resultValidation = validateResultShape(
      message.result,
      "Localhost bridge event stream result",
    );

    errors.push(...resultValidation.errors);
    warnings.push(...resultValidation.warnings);
  }

  if (message.type === "error" && !optionalString(message.error)) {
    errors.push("Localhost bridge event stream error message is missing.");
  }

  if (
    message.type === "progress" &&
    optionalString(message.requestId) &&
    optionalString(message.progressEvent?.requestId) &&
    message.requestId !== message.progressEvent?.requestId
  ) {
    errors.push("Localhost bridge event stream progress requestId must match message requestId.");
  }

  if (
    message.type === "result" &&
    optionalString(message.requestId) &&
    optionalString(message.result?.requestId) &&
    message.requestId !== message.result?.requestId
  ) {
    errors.push("Localhost bridge event stream result requestId must match message requestId.");
  }

  return createValidationResult(errors, warnings);
}

export function buildLocalhostBridgeRunRequest(
  envelope: AvanzaAgentBridgeEnvelope,
  request: AvanzaAgentRequest,
  options: BuildLocalhostBridgeRunRequestOptions = {},
): LocalhostBridgeRunRequest {
  if (envelope.type !== "request") {
    throw new Error("Localhost bridge run request requires a request envelope.");
  }

  const envelopeRequestId = optionalString(envelope.requestId);
  const payloadRequestId = getEnvelopePayloadRequestId(envelope);
  const requestId = optionalString(request.requestId);

  if (!requestId) {
    throw new Error("Localhost bridge run request requires request.requestId.");
  }

  if (envelopeRequestId && envelopeRequestId !== requestId) {
    throw new Error("Localhost bridge run request envelope requestId must match request requestId.");
  }

  if (payloadRequestId && payloadRequestId !== requestId) {
    throw new Error("Localhost bridge run request envelope payload requestId must match request requestId.");
  }

  const metadata = normalizeMetadata(options.metadata);

  return {
    version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    envelope,
    request,
    dryRun: true,
    ...(typeof options.enableMockAgentRun === "boolean"
      ? { enableMockAgentRun: options.enableMockAgentRun }
      : {}),
    ...(options.mockPageBaseUrl
      ? { mockPageBaseUrl: options.mockPageBaseUrl }
      : {}),
    ...(typeof options.mockAgentHeaded === "boolean"
      ? { mockAgentHeaded: options.mockAgentHeaded }
      : {}),
    ...(metadata ? { metadata } : {}),
  };
}
