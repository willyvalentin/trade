import type {
  AvanzaExecutionHandoff,
  AvanzaExecutionHandoffVersion,
  ExecutionSafetyCheck,
} from "@/lib/avanza-execution-handoff";
import type {
  BrokerExecutionResult,
  ExecutionAction,
  ExecutionAuthority,
  ExecutionMode,
} from "@/lib/execution";
import type { ExecutionLifecycleEventType } from "@/lib/execution-state-machine";

export type AvanzaAgentRequestVersion = "avanza_agent_request_v1";

export type AvanzaAgentRequest = {
  requestId: string;
  createdAt: string;
  version: AvanzaAgentRequestVersion;
  broker: "avanza";
  handoff: AvanzaExecutionHandoff | null;
  mode: ExecutionMode | null;
  action: ExecutionAction | null;
  authority: ExecutionAuthority | null;
  safetyChecks: ExecutionSafetyCheck[];
  requireManualFinalConfirmation: boolean;
  allowAutomaticFinalSubmit: boolean;
  metadata?: Record<string, unknown>;
};

export type AvanzaAgentProgressEventType =
  | "agent_started"
  | "broker_session_check_started"
  | "broker_session_ready"
  | "broker_session_missing"
  | "instrument_search_started"
  | "instrument_selected"
  | "order_form_opened"
  | "order_form_filled"
  | "order_review_ready"
  | "waiting_for_manual_confirmation"
  | "automatic_submit_started"
  | "broker_confirmation_detected"
  | "broker_result_returned"
  | "agent_failed"
  | "agent_cancelled";

export type AvanzaAgentProgressEvent = {
  eventId: string;
  requestId: string;
  createdAt: string;
  type: AvanzaAgentProgressEventType;
  lifecycleEventType?: ExecutionLifecycleEventType;
  message: string;
  metadata?: Record<string, unknown>;
};

export type AvanzaAgentResultStatus =
  | "not_started"
  | "in_progress"
  | "waiting_for_manual_confirmation"
  | "submitted"
  | "filled"
  | "partially_filled"
  | "rejected"
  | "cancelled"
  | "failed"
  | "unknown";

export type AvanzaAgentResult = {
  requestId: string;
  createdAt: string;
  status: AvanzaAgentResultStatus;
  brokerResult?: BrokerExecutionResult;
  progressEvents: AvanzaAgentProgressEvent[];
  error?: string;
  rawSummary?: string;
};

export type AvanzaAgentAdapterValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export type BuildAvanzaAgentRequestOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type BuildAvanzaAgentProgressEventInput = {
  eventId?: string | null;
  requestId: string;
  createdAt?: string | null;
  type: AvanzaAgentProgressEventType;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type BuildAvanzaAgentResultInput = {
  requestId: string;
  createdAt?: string | null;
  status: AvanzaAgentResultStatus;
  brokerResult?: BrokerExecutionResult | null;
  progressEvents?: readonly AvanzaAgentProgressEvent[] | null;
  error?: string | null;
  rawSummary?: string | null;
};

const progressEventDisplayLabels: Record<AvanzaAgentProgressEventType, string> = {
  agent_started: "Agent started",
  broker_session_check_started: "Broker session check started",
  broker_session_ready: "Broker session ready",
  broker_session_missing: "Broker session missing",
  instrument_search_started: "Instrument search started",
  instrument_selected: "Instrument selected",
  order_form_opened: "Order form opened",
  order_form_filled: "Order form filled",
  order_review_ready: "Order review ready",
  waiting_for_manual_confirmation: "Waiting for manual confirmation",
  automatic_submit_started: "Automatic submit started",
  broker_confirmation_detected: "Broker confirmation detected",
  broker_result_returned: "Broker result returned",
  agent_failed: "Agent failed",
  agent_cancelled: "Agent cancelled",
};

const resultDisplayLabels: Record<AvanzaAgentResultStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  waiting_for_manual_confirmation: "Waiting for manual confirmation",
  submitted: "Submitted",
  filled: "Filled",
  partially_filled: "Partially filled",
  rejected: "Rejected",
  cancelled: "Cancelled",
  failed: "Failed",
  unknown: "Unknown",
};

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

function createAdapterId(
  prefix: string,
  createdAt: string,
  random = Math.random(),
): string {
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

function hasFailedSafetyChecks(checks: readonly ExecutionSafetyCheck[]): boolean {
  return checks.some((check) => check.status === "failed");
}

function isSupportedMode(mode: unknown): mode is ExecutionMode {
  return mode === "semi_automatic" || mode === "automatic";
}

function isSupportedAction(action: unknown): action is ExecutionAction {
  return action === "buy" || action === "sell";
}

function manualFinalConfirmationRequired(
  handoff: AvanzaExecutionHandoff | null | undefined,
): boolean {
  return handoff?.mode === "automatic" ? false : true;
}

function automaticFinalSubmitAllowed(
  handoff: AvanzaExecutionHandoff | null | undefined,
): boolean {
  return handoff?.mode === "automatic" && handoff.canSubmitFinalOrder === true;
}

export function buildAvanzaAgentRequest(
  handoff: AvanzaExecutionHandoff | null | undefined,
  options: BuildAvanzaAgentRequestOptions = {},
): AvanzaAgentRequest {
  const createdAt = normalizeTimestamp(options.createdAt);

  return {
    requestId:
      optionalString(options.requestId) ??
      createAdapterId("avanza_agent_request", createdAt),
    createdAt,
    version: "avanza_agent_request_v1",
    broker: "avanza",
    handoff: handoff ?? null,
    mode: handoff?.mode ?? null,
    action: handoff?.action ?? null,
    authority: handoff?.authority ?? null,
    safetyChecks: handoff?.safetyChecks ? [...handoff.safetyChecks] : [],
    requireManualFinalConfirmation: manualFinalConfirmationRequired(handoff),
    allowAutomaticFinalSubmit: automaticFinalSubmitAllowed(handoff),
    ...(normalizeMetadata(options.metadata)
      ? { metadata: normalizeMetadata(options.metadata) }
      : {}),
  };
}

export function validateAvanzaAgentRequest(
  request: Partial<AvanzaAgentRequest> | null | undefined,
): AvanzaAgentAdapterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const handoff = request?.handoff ?? null;

  if (!optionalString(request?.requestId)) {
    errors.push("Avanza agent request id is missing.");
  }

  if (request?.broker !== "avanza") {
    errors.push("Avanza agent request broker must be avanza.");
  }

  if (request?.version !== "avanza_agent_request_v1") {
    errors.push("Avanza agent request version must be avanza_agent_request_v1.");
  }

  if (!handoff) {
    errors.push("Avanza agent request handoff is missing.");
  } else {
    if (handoff.broker !== "avanza") {
      errors.push("Avanza agent handoff broker must be avanza.");
    }

    if (handoff.status !== "ready") {
      errors.push("Avanza agent handoff must be ready.");
    }

    if (!handoff.canPrepareOrder) {
      errors.push("Avanza agent handoff must allow order preparation.");
    }

    if (hasFailedSafetyChecks(handoff.safetyChecks)) {
      errors.push("Avanza agent handoff safety checks must not include failed checks.");
    }
  }

  if (!isSupportedAction(request?.action)) {
    errors.push("Avanza agent request action must be buy or sell.");
  }

  if (!isSupportedMode(request?.mode)) {
    errors.push("Avanza agent request mode must be semi_automatic or automatic.");
  }

  if (request?.mode === "semi_automatic") {
    if (request.requireManualFinalConfirmation !== true) {
      errors.push("Semi-automatic requests must require manual final confirmation.");
    }

    if (request.allowAutomaticFinalSubmit) {
      errors.push("Semi-automatic requests must not allow automatic final submit.");
    }
  }

  if (request?.mode === "automatic") {
    if (request.requireManualFinalConfirmation) {
      errors.push("Automatic requests must not require manual final confirmation.");
    }

    if (handoff?.canSubmitFinalOrder === true) {
      if (request.allowAutomaticFinalSubmit !== true) {
        errors.push("Automatic requests with ready final submit authority must allow automatic final submit.");
      }
    } else if (request.allowAutomaticFinalSubmit) {
      errors.push("Automatic final submit is allowed only when the handoff can submit final order.");
    }
  }

  if (request?.authority && request.mode && request.authority.mode !== request.mode) {
    errors.push("Avanza agent request authority mode must match request mode.");
  }

  if (handoff?.mode && request?.mode && handoff.mode !== request.mode) {
    errors.push("Avanza agent request mode must match handoff mode.");
  }

  if (handoff?.action && request?.action && handoff.action !== request.action) {
    errors.push("Avanza agent request action must match handoff action.");
  }

  if (request?.handoff?.version !== "avanza_execution_handoff_v2") {
    warnings.push("Avanza agent request should use avanza_execution_handoff_v2.");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

export function mapAvanzaAgentProgressToLifecycleEventType(
  progressType: AvanzaAgentProgressEventType,
): ExecutionLifecycleEventType | null {
  if (progressType === "order_form_opened" || progressType === "order_form_filled") {
    return "start_broker_preparation";
  }

  if (progressType === "waiting_for_manual_confirmation") {
    return "wait_for_manual_confirmation";
  }

  if (progressType === "automatic_submit_started") {
    return "submit_broker_order";
  }

  if (
    progressType === "broker_confirmation_detected" ||
    progressType === "broker_result_returned"
  ) {
    return "capture_broker_result";
  }

  if (progressType === "agent_failed") {
    return "fail_execution";
  }

  if (progressType === "agent_cancelled") {
    return "cancel_execution";
  }

  return null;
}

export function buildAvanzaAgentProgressEvent(
  input: BuildAvanzaAgentProgressEventInput,
): AvanzaAgentProgressEvent {
  const createdAt = normalizeTimestamp(input.createdAt);
  const lifecycleEventType = mapAvanzaAgentProgressToLifecycleEventType(input.type);

  return {
    eventId:
      optionalString(input.eventId) ??
      createAdapterId(`avanza_agent_event_${input.type}`, createdAt),
    requestId: optionalString(input.requestId) ?? "unknown_request",
    createdAt,
    type: input.type,
    ...(lifecycleEventType ? { lifecycleEventType } : {}),
    message:
      optionalString(input.message) ??
      `${progressEventDisplayLabels[input.type]}.`,
    ...(normalizeMetadata(input.metadata)
      ? { metadata: normalizeMetadata(input.metadata) }
      : {}),
  };
}

export function buildAvanzaAgentResult(
  input: BuildAvanzaAgentResultInput,
): AvanzaAgentResult {
  const createdAt = normalizeTimestamp(input.createdAt);
  const error = optionalString(input.error);
  const rawSummary = optionalString(input.rawSummary);

  return {
    requestId: optionalString(input.requestId) ?? "unknown_request",
    createdAt,
    status: input.status,
    ...(input.brokerResult ? { brokerResult: input.brokerResult } : {}),
    progressEvents: [...(input.progressEvents ?? [])],
    ...(error ? { error } : {}),
    ...(rawSummary ? { rawSummary } : {}),
  };
}

export function isTerminalAvanzaAgentResultStatus(
  status: AvanzaAgentResultStatus,
): boolean {
  return (
    status === "filled" ||
    status === "rejected" ||
    status === "cancelled" ||
    status === "failed" ||
    status === "unknown"
  );
}

export function isSuccessfulAvanzaAgentResultStatus(
  status: AvanzaAgentResultStatus,
): boolean {
  return (
    status === "submitted" ||
    status === "filled" ||
    status === "partially_filled"
  );
}

export function getAvanzaAgentResultDisplayLabel(
  status: AvanzaAgentResultStatus,
): string {
  return resultDisplayLabels[status];
}

export function getAvanzaAgentProgressDisplayLabel(
  type: AvanzaAgentProgressEventType,
): string {
  return progressEventDisplayLabels[type];
}

export function getAvanzaAgentHandoffVersion(
  request: AvanzaAgentRequest,
): AvanzaExecutionHandoffVersion | null {
  return request.handoff?.version ?? null;
}
