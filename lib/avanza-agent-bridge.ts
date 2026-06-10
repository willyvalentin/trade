import {
  buildAvanzaAgentProgressEvent,
  buildAvanzaAgentResult,
  validateAvanzaAgentRequest,
  type AvanzaAgentProgressEvent,
  type AvanzaAgentRequest,
  type AvanzaAgentResult,
} from "@/lib/avanza-agent-adapter";

export type AvanzaAgentBridgeTransport =
  | "none"
  | "echo"
  | "local_process"
  | "browser_extension"
  | "websocket"
  | "http"
  | "native_messaging";

export type AvanzaAgentBridgeStatus =
  | "unavailable"
  | "available"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export type AvanzaAgentBridgeMessageType =
  | "request"
  | "progress"
  | "result"
  | "error"
  | "heartbeat"
  | "cancel";

export type AvanzaAgentBridgeEnvelopeVersion = "avanza_agent_bridge_v1";

export type AvanzaAgentBridgeEnvelope = {
  envelopeId: string;
  createdAt: string;
  version: AvanzaAgentBridgeEnvelopeVersion;
  type: AvanzaAgentBridgeMessageType;
  requestId?: string;
  transport: AvanzaAgentBridgeTransport;
  payload: unknown;
  metadata?: Record<string, unknown>;
};

export type AvanzaAgentBridgeCapabilities = {
  transport: AvanzaAgentBridgeTransport;
  supportsProgressEvents: boolean;
  supportsCancellation: boolean;
  supportsAutomaticSubmit: boolean;
  supportsManualConfirmationWait: boolean;
  supportsBrokerResultReturn: boolean;
  supportsRealBrokerAutomation: boolean;
  maxConcurrentRuns: number;
  version?: string;
};

export type AvanzaAgentBridgeHealth = {
  status: AvanzaAgentBridgeStatus;
  transport: AvanzaAgentBridgeTransport;
  checkedAt: string;
  message: string;
  capabilities?: AvanzaAgentBridgeCapabilities;
};

export type AvanzaAgentBridgeProgressCallback = (
  event: AvanzaAgentProgressEvent,
) => void | Promise<void>;

export type AvanzaAgentBridgeSendOptions = {
  onProgress?: AvanzaAgentBridgeProgressCallback;
  signal?: AbortSignal;
  metadata?: Record<string, unknown>;
};

export type AvanzaAgentBridge = {
  bridgeId: string;
  name: string;
  transport: AvanzaAgentBridgeTransport;
  supportsRealBrokerAutomation: boolean;
  getHealth: () => Promise<AvanzaAgentBridgeHealth>;
  sendRequest: (
    request: AvanzaAgentRequest,
    options?: AvanzaAgentBridgeSendOptions,
  ) => Promise<AvanzaAgentResult>;
  cancelRequest?: (requestId: string) => Promise<boolean>;
};

export type BuildAvanzaAgentBridgeEnvelopeOptions = {
  envelopeId?: string | null;
  createdAt?: string | null;
  requestId?: string | null;
  transport?: AvanzaAgentBridgeTransport | null;
  metadata?: Record<string, unknown> | null;
};

export type AvanzaAgentBridgeEnvelopeValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export type CreateNoopAvanzaAgentBridgeOptions = {
  bridgeId?: string | null;
  name?: string | null;
  version?: string | null;
  createdAt?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type CreateEchoAvanzaAgentBridgeOptions = CreateNoopAvanzaAgentBridgeOptions;

const bridgeTransportDisplayLabels: Record<AvanzaAgentBridgeTransport, string> = {
  none: "No bridge",
  echo: "Echo bridge - Dev only",
  local_process: "Local process",
  browser_extension: "Browser extension",
  websocket: "WebSocket",
  http: "HTTP",
  native_messaging: "Native messaging",
};

const bridgeStatusDisplayLabels: Record<AvanzaAgentBridgeStatus, string> = {
  unavailable: "Unavailable",
  available: "Available",
  connecting: "Connecting",
  connected: "Connected",
  disconnected: "Disconnected",
  error: "Error",
};

const supportedTransports: readonly AvanzaAgentBridgeTransport[] = [
  "none",
  "echo",
  "local_process",
  "browser_extension",
  "websocket",
  "http",
  "native_messaging",
];

const supportedStatuses: readonly AvanzaAgentBridgeStatus[] = [
  "unavailable",
  "available",
  "connecting",
  "connected",
  "disconnected",
  "error",
];

const supportedMessageTypes: readonly AvanzaAgentBridgeMessageType[] = [
  "request",
  "progress",
  "result",
  "error",
  "heartbeat",
  "cancel",
];

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeTimestamp(value: string | null | undefined): string {
  const timestamp = optionalString(value);

  return timestamp && Number.isFinite(Date.parse(timestamp))
    ? timestamp
    : new Date().toISOString();
}

function sanitizeIdPart(value: string | null | undefined): string {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function createBridgeId(prefix: string, createdAt: string, random = Math.random()) {
  const suffix = Math.floor(Math.abs(random) * 0xffffff)
    .toString(36)
    .padStart(4, "0")
    .slice(0, 6);

  return [prefix, sanitizeIdPart(createdAt), suffix].join("_");
}

function normalizeMetadata(
  metadata: Record<string, unknown> | null | undefined,
): Record<string, unknown> | undefined {
  return metadata ? { ...metadata } : undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSupportedTransport(
  transport: unknown,
): transport is AvanzaAgentBridgeTransport {
  return supportedTransports.includes(transport as AvanzaAgentBridgeTransport);
}

function isSupportedStatus(status: unknown): status is AvanzaAgentBridgeStatus {
  return supportedStatuses.includes(status as AvanzaAgentBridgeStatus);
}

function isSupportedMessageType(
  type: unknown,
): type is AvanzaAgentBridgeMessageType {
  return supportedMessageTypes.includes(type as AvanzaAgentBridgeMessageType);
}

function inferRequestIdFromPayload(payload: unknown): string | null {
  if (!isObject(payload)) {
    return null;
  }

  return optionalString(payload.requestId);
}

function getRequestId(request: Partial<AvanzaAgentRequest> | null | undefined) {
  return optionalString(request?.requestId) ?? "unknown_request";
}

function buildNoopCapabilities(
  version: string,
): AvanzaAgentBridgeCapabilities {
  return {
    transport: "none",
    supportsProgressEvents: false,
    supportsCancellation: false,
    supportsAutomaticSubmit: false,
    supportsManualConfirmationWait: false,
    supportsBrokerResultReturn: false,
    supportsRealBrokerAutomation: false,
    maxConcurrentRuns: 0,
    version,
  };
}

function buildEchoCapabilities(version: string): AvanzaAgentBridgeCapabilities {
  return {
    transport: "echo",
    supportsProgressEvents: true,
    supportsCancellation: true,
    supportsAutomaticSubmit: false,
    supportsManualConfirmationWait: true,
    supportsBrokerResultReturn: false,
    supportsRealBrokerAutomation: false,
    maxConcurrentRuns: 1,
    version,
  };
}

function buildSafeFailedBridgeResult(
  request: Partial<AvanzaAgentRequest> | null | undefined,
  progressEvents: readonly AvanzaAgentProgressEvent[],
  error: string,
): AvanzaAgentResult {
  return buildAvanzaAgentResult({
    requestId: getRequestId(request),
    status: "failed",
    progressEvents,
    error,
    rawSummary:
      "No external Avanza agent bridge is connected. No broker page was opened, no transport message was sent, and no order was submitted.",
  });
}

async function emitBridgeProgressEvent(
  event: AvanzaAgentProgressEvent,
  progressEvents: AvanzaAgentProgressEvent[],
  onProgress: AvanzaAgentBridgeProgressCallback | undefined,
) {
  progressEvents.push(event);

  if (onProgress) {
    await onProgress(event);
  }
}

export function buildAvanzaAgentBridgeEnvelope(
  type: AvanzaAgentBridgeMessageType,
  payload: unknown,
  options: BuildAvanzaAgentBridgeEnvelopeOptions = {},
): AvanzaAgentBridgeEnvelope {
  const createdAt = normalizeTimestamp(options.createdAt);
  const requestId =
    optionalString(options.requestId) ?? inferRequestIdFromPayload(payload);
  const metadata = normalizeMetadata(options.metadata);

  return {
    envelopeId:
      optionalString(options.envelopeId) ??
      createBridgeId(`avanza_agent_bridge_${type}`, createdAt),
    createdAt,
    version: "avanza_agent_bridge_v1",
    type,
    ...(requestId ? { requestId } : {}),
    transport: options.transport ?? "none",
    payload,
    ...(metadata ? { metadata } : {}),
  };
}

export function validateAvanzaAgentBridgeEnvelope(
  envelope: Partial<AvanzaAgentBridgeEnvelope> | null | undefined,
): AvanzaAgentBridgeEnvelopeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!envelope || !isObject(envelope)) {
    return {
      ok: false,
      errors: ["Avanza agent bridge envelope is missing."],
      warnings,
    };
  }

  if (!optionalString(envelope.envelopeId)) {
    errors.push("Avanza agent bridge envelope id is missing.");
  }

  if (envelope.version !== "avanza_agent_bridge_v1") {
    errors.push("Avanza agent bridge envelope version must be avanza_agent_bridge_v1.");
  }

  const createdAt = optionalString(envelope.createdAt);

  if (!createdAt) {
    errors.push("Avanza agent bridge envelope createdAt is missing.");
  } else if (!Number.isFinite(Date.parse(createdAt))) {
    errors.push("Avanza agent bridge envelope createdAt must be a valid timestamp.");
  }

  if (!isSupportedMessageType(envelope.type)) {
    errors.push("Avanza agent bridge envelope type is unsupported.");
  }

  if (!isSupportedTransport(envelope.transport)) {
    errors.push("Avanza agent bridge envelope transport is unsupported.");
  }

  if (typeof envelope.payload === "undefined" || envelope.payload === null) {
    errors.push("Avanza agent bridge envelope payload is missing.");
  }

  if (envelope.transport === "none") {
    warnings.push("Envelope uses no transport and will not be sent to an external agent.");
  }

  if (envelope.type === "request") {
    const validation = validateAvanzaAgentRequest(
      isObject(envelope.payload) ? envelope.payload : null,
    );

    if (!validation.ok) {
      errors.push(
        ...validation.errors.map(
          (error) => `Request payload is invalid: ${error}`,
        ),
      );
    }

    warnings.push(
      ...validation.warnings.map(
        (warning) => `Request payload warning: ${warning}`,
      ),
    );
  }

  if (envelope.type === "progress" && isObject(envelope.payload)) {
    if (!optionalString(envelope.payload.requestId)) {
      errors.push("Progress payload requestId is missing.");
    }

    if (!optionalString(envelope.payload.type)) {
      errors.push("Progress payload type is missing.");
    }
  }

  if (envelope.type === "result" && isObject(envelope.payload)) {
    if (!optionalString(envelope.payload.requestId)) {
      errors.push("Result payload requestId is missing.");
    }

    if (!optionalString(envelope.payload.status)) {
      errors.push("Result payload status is missing.");
    }
  }

  if (envelope.type === "cancel") {
    const payloadRequestId = inferRequestIdFromPayload(envelope.payload);

    if (!optionalString(envelope.requestId) && !payloadRequestId) {
      errors.push("Cancel envelope requestId is missing.");
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

export function createNoopAvanzaAgentBridge(
  options: CreateNoopAvanzaAgentBridgeOptions = {},
): AvanzaAgentBridge {
  const createdAt = normalizeTimestamp(options.createdAt);
  const bridgeId =
    optionalString(options.bridgeId) ?? createBridgeId("avanza_agent_bridge", createdAt);
  const name = optionalString(options.name) ?? "No-op Avanza Agent Bridge";
  const version = optionalString(options.version) ?? "avanza_agent_bridge_noop_v1";
  const capabilities = buildNoopCapabilities(version);
  const baseMetadata = normalizeMetadata(options.metadata);

  return {
    bridgeId,
    name,
    transport: "none",
    supportsRealBrokerAutomation: false,
    getHealth: async () => ({
      status: "unavailable",
      transport: "none",
      checkedAt: new Date().toISOString(),
      message: "No external Avanza agent bridge is connected.",
      capabilities,
    }),
    sendRequest: async (request, sendOptions = {}) => {
      const progressEvents: AvanzaAgentProgressEvent[] = [];
      const validation = validateAvanzaAgentRequest(request);
      const metadata = {
        ...(baseMetadata ?? {}),
        ...(normalizeMetadata(sendOptions.metadata) ?? {}),
        bridge_id: bridgeId,
        bridge_transport: "none",
        no_external_agent_bridge_connected: true,
        no_browser_automation: true,
        no_broker_order_prepared: true,
        no_broker_order_submitted: true,
      };

      try {
        if (sendOptions.signal?.aborted) {
          return buildSafeFailedBridgeResult(
            request,
            progressEvents,
            "No-op Avanza agent bridge request was cancelled before send. No broker action occurred.",
          );
        }

        const failedEvent = buildAvanzaAgentProgressEvent({
          requestId: getRequestId(request),
          type: "agent_failed",
          message:
            "No-op Avanza agent bridge is unavailable. No external agent is connected and no broker action occurred.",
          metadata: {
            ...metadata,
            validation_ok: validation.ok,
            validation_error_count: validation.errors.length,
            validation_warning_count: validation.warnings.length,
          },
        });

        await emitBridgeProgressEvent(
          failedEvent,
          progressEvents,
          sendOptions.onProgress,
        );

        if (!validation.ok) {
          return buildSafeFailedBridgeResult(
            request,
            progressEvents,
            `Invalid Avanza agent request: ${validation.errors.join(" ")}`,
          );
        }

        return buildSafeFailedBridgeResult(
          request,
          progressEvents,
          "No external Avanza agent bridge is connected. No request was sent, Avanza was not opened, and no broker order was created.",
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No-op Avanza agent bridge failed unexpectedly.";

        return buildSafeFailedBridgeResult(
          request,
          progressEvents,
          `No-op Avanza agent bridge stopped safely: ${message}`,
        );
      }
    },
    cancelRequest: async () => false,
  };
}

export function createEchoAvanzaAgentBridge(
  options: CreateEchoAvanzaAgentBridgeOptions = {},
): AvanzaAgentBridge {
  const createdAt = normalizeTimestamp(options.createdAt);
  const bridgeId =
    optionalString(options.bridgeId) ??
    createBridgeId("avanza_agent_bridge_echo", createdAt);
  const name = optionalString(options.name) ?? "Echo Avanza Agent Bridge";
  const version = optionalString(options.version) ?? "avanza_agent_bridge_echo_v1";
  const capabilities = buildEchoCapabilities(version);
  const baseMetadata = normalizeMetadata(options.metadata);

  async function emitEchoEvent(
    request: AvanzaAgentRequest,
    type: AvanzaAgentProgressEvent["type"],
    message: string,
    progressEvents: AvanzaAgentProgressEvent[],
    sendOptions: AvanzaAgentBridgeSendOptions,
    metadata: Record<string, unknown>,
  ) {
    const event = buildAvanzaAgentProgressEvent({
      requestId: getRequestId(request),
      type,
      message,
      metadata,
    });

    await emitBridgeProgressEvent(event, progressEvents, sendOptions.onProgress);
  }

  return {
    bridgeId,
    name,
    transport: "echo",
    supportsRealBrokerAutomation: false,
    getHealth: async () => ({
      status: "available",
      transport: "echo",
      checkedAt: new Date().toISOString(),
      message:
        "Echo bridge is available for local diagnostics only. No broker connection exists.",
      capabilities,
    }),
    sendRequest: async (request, sendOptions = {}) => {
      const progressEvents: AvanzaAgentProgressEvent[] = [];
      const validation = validateAvanzaAgentRequest(request);
      const metadata = {
        ...(baseMetadata ?? {}),
        ...(normalizeMetadata(sendOptions.metadata) ?? {}),
        bridge_id: bridgeId,
        bridge_transport: "echo",
        echo_bridge: true,
        local_diagnostics_only: true,
        broker_connected: false,
        no_external_transport: true,
        no_browser_automation: true,
        no_broker_order_prepared: true,
        no_broker_order_submitted: true,
        no_broker_result_created: true,
      };

      try {
        if (sendOptions.signal?.aborted) {
          await emitEchoEvent(
            request,
            "agent_cancelled",
            "Echo bridge request was cancelled before the local protocol test. No broker action occurred.",
            progressEvents,
            sendOptions,
            metadata,
          );

          return buildAvanzaAgentResult({
            requestId: getRequestId(request),
            status: "cancelled",
            progressEvents,
            error:
              "Echo bridge request was cancelled. No Avanza session was opened and no broker result was created.",
            rawSummary:
              "Echo bridge cancelled protocol test. No Avanza session was opened and no broker result was created.",
          });
        }

        await emitEchoEvent(
          request,
          "agent_started",
          "Echo bridge started a local protocol test. No Avanza session will open.",
          progressEvents,
          sendOptions,
          {
            ...metadata,
            validation_ok: validation.ok,
            validation_error_count: validation.errors.length,
            validation_warning_count: validation.warnings.length,
          },
        );

        if (!validation.ok) {
          await emitEchoEvent(
            request,
            "agent_failed",
            "Echo bridge stopped because the Avanza agent request was invalid. No broker action occurred.",
            progressEvents,
            sendOptions,
            metadata,
          );

          return buildAvanzaAgentResult({
            requestId: getRequestId(request),
            status: "failed",
            progressEvents,
            error: `Invalid Avanza agent request: ${validation.errors.join(" ")}`,
            rawSummary:
              "Echo bridge rejected invalid request. No Avanza session was opened and no broker result was created.",
          });
        }

        if (sendOptions.signal?.aborted) {
          await emitEchoEvent(
            request,
            "agent_cancelled",
            "Echo bridge request was cancelled after start. No broker action occurred.",
            progressEvents,
            sendOptions,
            metadata,
          );

          return buildAvanzaAgentResult({
            requestId: getRequestId(request),
            status: "cancelled",
            progressEvents,
            error:
              "Echo bridge request was cancelled. No Avanza session was opened and no broker result was created.",
            rawSummary:
              "Echo bridge cancelled protocol test. No Avanza session was opened and no broker result was created.",
          });
        }

        await emitEchoEvent(
          request,
          "broker_session_check_started",
          "Echo bridge simulated a broker session check for protocol diagnostics only.",
          progressEvents,
          sendOptions,
          metadata,
        );
        await emitEchoEvent(
          request,
          "broker_session_ready",
          "Echo bridge marked the protocol session ready without connecting to Avanza.",
          progressEvents,
          sendOptions,
          metadata,
        );
        await emitEchoEvent(
          request,
          "order_review_ready",
          "Echo bridge reached protocol review-ready state. No order form was opened, filled, prepared, or submitted.",
          progressEvents,
          sendOptions,
          metadata,
        );

        return buildAvanzaAgentResult({
          requestId: getRequestId(request),
          status: "unknown",
          progressEvents,
          rawSummary:
            "Echo bridge completed protocol test. No Avanza session was opened and no broker result was created.",
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Echo bridge failed unexpectedly.";

        return buildAvanzaAgentResult({
          requestId: getRequestId(request),
          status: "failed",
          progressEvents,
          error: `Echo bridge stopped safely: ${message}`,
          rawSummary:
            "Echo bridge stopped safely. No Avanza session was opened and no broker result was created.",
        });
      }
    },
    cancelRequest: async () => true,
  };
}

export function isRealAvanzaAgentBridge(bridge: AvanzaAgentBridge): boolean {
  return bridge.supportsRealBrokerAutomation === true;
}

export function getAvanzaAgentBridgeTransportDisplayLabel(
  transport: AvanzaAgentBridgeTransport,
): string {
  return bridgeTransportDisplayLabels[transport];
}

export function getAvanzaAgentBridgeStatusDisplayLabel(
  status: AvanzaAgentBridgeStatus,
): string {
  return bridgeStatusDisplayLabels[status];
}

export function isSupportedAvanzaAgentBridgeStatus(
  status: unknown,
): status is AvanzaAgentBridgeStatus {
  return isSupportedStatus(status);
}

export function isSupportedAvanzaAgentBridgeTransport(
  transport: unknown,
): transport is AvanzaAgentBridgeTransport {
  return isSupportedTransport(transport);
}
