import type {
  AvanzaExecutionHandoffStatus,
  AvanzaExecutionHandoffVersion,
} from "@/lib/avanza-execution-handoff";
import type {
  BrokerExecutionStatus,
  ExecutionAction,
  ExecutionMode,
  ExecutionTriggerType,
} from "@/lib/execution";
import type {
  ExecutionLifecycleEvent,
  ExecutionLifecycleEventType,
  ExecutionLifecycleSnapshot,
} from "@/lib/execution-state-machine";
import {
  appendExecutionEventLogEntries,
  clearExecutionEventLogEntries,
  getBrowserExecutionLocalStorage,
  readExecutionEventLogEntries,
} from "@/lib/execution-local-storage-helpers";

export type ExecutionAuditEventType =
  | "intent_created"
  | "candidate_selected"
  | "handoff_created"
  | "broker_preparation_started"
  | "waiting_for_manual_confirmation"
  | "broker_order_submitting"
  | "broker_result_captured"
  | "execution_completed"
  | "execution_failed"
  | "execution_cancelled"
  | "execution_unknown"
  | "stub_prepare_clicked"
  | "agent_progress_stub"
  | "localhost_bridge_run_stub"
  | "localhost_mock_agent_run_stub"
  | "dev_mock_broker_capture_stub"
  | "localhost_bridge_cancel_stub";

export type ExecutionAuditEvent = {
  eventId: string;
  type: ExecutionAuditEventType;
  createdAt: string;
  lifecycleId?: string;
  intentId?: string;
  recommendationId?: string;
  positionId?: string;
  ticker?: string;
  action?: ExecutionAction;
  mode?: ExecutionMode;
  triggerType?: ExecutionTriggerType;
  broker?: "avanza";
  handoffVersion?: AvanzaExecutionHandoffVersion | string;
  handoffStatus?: AvanzaExecutionHandoffStatus;
  brokerStatus?: BrokerExecutionStatus;
  message?: string;
  metadata?: Record<string, unknown>;
};

export type ExecutionAuditEventInput = {
  type: ExecutionAuditEventType;
  eventId?: string | null;
  createdAt?: string | null;
  lifecycleId?: string | null;
  intentId?: string | null;
  recommendationId?: string | null;
  positionId?: string | null;
  ticker?: string | null;
  action?: ExecutionAction | null;
  mode?: ExecutionMode | null;
  triggerType?: ExecutionTriggerType | null;
  broker?: "avanza" | null;
  handoffVersion?: AvanzaExecutionHandoffVersion | string | null;
  handoffStatus?: AvanzaExecutionHandoffStatus | null;
  brokerStatus?: BrokerExecutionStatus | null;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ExecutionEventLogReadResult = {
  events: ExecutionAuditEvent[];
  discardedCount: number;
  storageAvailable: boolean;
  error: string | null;
};

export const EXECUTION_EVENT_LOG_STORAGE_KEY = "ture_execution_event_log_v1";
export const MAX_EXECUTION_AUDIT_EVENTS = 1000;

const handoffStatuses: AvanzaExecutionHandoffStatus[] = [
  "ready",
  "blocked",
  "invalid_intent",
];

const lifecycleAuditTypeMap: Record<
  ExecutionLifecycleEventType,
  ExecutionAuditEventType
> = {
  create_intent: "intent_created",
  select_candidate: "candidate_selected",
  create_handoff: "handoff_created",
  start_broker_preparation: "broker_preparation_started",
  wait_for_manual_confirmation: "waiting_for_manual_confirmation",
  submit_broker_order: "broker_order_submitting",
  capture_broker_result: "broker_result_captured",
  complete_execution: "execution_completed",
  fail_execution: "execution_failed",
  cancel_execution: "execution_cancelled",
  mark_unknown: "execution_unknown",
};

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
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

function createExecutionAuditEventId(
  type: ExecutionAuditEventType,
  createdAt: string,
  random = Math.random(),
): string {
  const suffix = Math.floor(Math.abs(random) * 0xffffff)
    .toString(36)
    .padStart(4, "0")
    .slice(0, 6);

  return [
    "execution_audit",
    sanitizeIdPart(createdAt),
    sanitizeIdPart(type),
    suffix,
  ].join("_");
}

function optionalMetadata(
  value: unknown,
): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : undefined;
}

function isAvanzaExecutionHandoffStatus(
  value: unknown,
): value is AvanzaExecutionHandoffStatus {
  return (
    typeof value === "string" &&
    handoffStatuses.includes(value as AvanzaExecutionHandoffStatus)
  );
}

function getMetadataHandoffStatus(
  metadata: Record<string, unknown> | undefined,
): AvanzaExecutionHandoffStatus | undefined {
  const value = metadata?.handoff_status;

  return isAvanzaExecutionHandoffStatus(value) ? value : undefined;
}

function readExecutionAuditEventLog(): ExecutionEventLogReadResult {
  return readExecutionEventLogEntries(getBrowserExecutionLocalStorage());
}

export function createExecutionAuditEvent(
  input: ExecutionAuditEventInput,
): ExecutionAuditEvent {
  const createdAt = normalizeTimestamp(input.createdAt);

  return {
    eventId:
      optionalString(input.eventId) ??
      createExecutionAuditEventId(input.type, createdAt),
    type: input.type,
    createdAt,
    ...(optionalString(input.lifecycleId)
      ? { lifecycleId: optionalString(input.lifecycleId) }
      : {}),
    ...(optionalString(input.intentId)
      ? { intentId: optionalString(input.intentId) }
      : {}),
    ...(optionalString(input.recommendationId)
      ? { recommendationId: optionalString(input.recommendationId) }
      : {}),
    ...(optionalString(input.positionId)
      ? { positionId: optionalString(input.positionId) }
      : {}),
    ...(optionalString(input.ticker)
      ? { ticker: optionalString(input.ticker) }
      : {}),
    ...(input.action ? { action: input.action } : {}),
    ...(input.mode ? { mode: input.mode } : {}),
    ...(input.triggerType ? { triggerType: input.triggerType } : {}),
    ...(input.broker === "avanza" ? { broker: "avanza" } : {}),
    ...(optionalString(input.handoffVersion)
      ? { handoffVersion: optionalString(input.handoffVersion) }
      : {}),
    ...(input.handoffStatus ? { handoffStatus: input.handoffStatus } : {}),
    ...(input.brokerStatus ? { brokerStatus: input.brokerStatus } : {}),
    ...(optionalString(input.message)
      ? { message: optionalString(input.message) }
      : {}),
    ...(input.metadata ? { metadata: { ...input.metadata } } : {}),
  };
}

export function readExecutionAuditEvents(): ExecutionAuditEvent[] {
  return readExecutionAuditEventLog().events;
}

export function readExecutionEventLog(): ExecutionEventLogReadResult {
  return readExecutionAuditEventLog();
}

export function appendExecutionAuditEvent(
  event: ExecutionAuditEvent,
): boolean {
  return appendExecutionAuditEvents([event]);
}

export function appendExecutionAuditEvents(
  events: readonly ExecutionAuditEvent[],
): boolean {
  return appendExecutionEventLogEntries(getBrowserExecutionLocalStorage(), events);
}

export function clearExecutionAuditEvents(): boolean {
  return clearExecutionEventLogEntries(getBrowserExecutionLocalStorage());
}

export function getExecutionAuditEventsForIntent(intentId: string) {
  const normalizedIntentId = optionalString(intentId);

  if (!normalizedIntentId) {
    return [];
  }

  return readExecutionAuditEvents().filter(
    (event) => event.intentId === normalizedIntentId,
  );
}

export function getExecutionAuditEventsForPosition(positionId: string) {
  const normalizedPositionId = optionalString(positionId);

  if (!normalizedPositionId) {
    return [];
  }

  return readExecutionAuditEvents().filter(
    (event) => event.positionId === normalizedPositionId,
  );
}

export function getExecutionAuditEventsForRecommendation(
  recommendationId: string,
) {
  const normalizedRecommendationId = optionalString(recommendationId);

  if (!normalizedRecommendationId) {
    return [];
  }

  return readExecutionAuditEvents().filter(
    (event) => event.recommendationId === normalizedRecommendationId,
  );
}

export function buildExecutionAuditEventFromLifecycleEvent(
  lifecycleEvent: ExecutionLifecycleEvent,
  snapshot: ExecutionLifecycleSnapshot,
): ExecutionAuditEvent {
  const metadata = optionalMetadata(lifecycleEvent.metadata);

  return createExecutionAuditEvent({
    type: lifecycleAuditTypeMap[lifecycleEvent.type],
    eventId: lifecycleEvent.eventId,
    createdAt: lifecycleEvent.createdAt,
    lifecycleId: snapshot.lifecycleId,
    intentId: lifecycleEvent.intentId ?? snapshot.intentId,
    recommendationId: snapshot.recommendationId,
    positionId: snapshot.positionId,
    action: snapshot.action,
    mode: snapshot.mode,
    triggerType: snapshot.triggerType,
    broker: "avanza",
    handoffVersion: lifecycleEvent.handoffVersion,
    handoffStatus: getMetadataHandoffStatus(metadata),
    brokerStatus: lifecycleEvent.brokerStatus,
    message: lifecycleEvent.message,
    metadata,
  });
}
