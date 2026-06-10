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

const auditEventTypes: ExecutionAuditEventType[] = [
  "intent_created",
  "candidate_selected",
  "handoff_created",
  "broker_preparation_started",
  "waiting_for_manual_confirmation",
  "broker_order_submitting",
  "broker_result_captured",
  "execution_completed",
  "execution_failed",
  "execution_cancelled",
  "execution_unknown",
  "stub_prepare_clicked",
  "agent_progress_stub",
  "localhost_bridge_run_stub",
  "localhost_bridge_cancel_stub",
];

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

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isExecutionAuditEventType(value: unknown): value is ExecutionAuditEventType {
  return (
    typeof value === "string" &&
    auditEventTypes.includes(value as ExecutionAuditEventType)
  );
}

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

function normalizeExecutionAuditEvent(value: unknown): ExecutionAuditEvent | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<ExecutionAuditEvent>;
  const eventId = optionalString(candidate.eventId);
  const createdAt = optionalString(candidate.createdAt);

  if (
    !eventId ||
    !isExecutionAuditEventType(candidate.type) ||
    !createdAt ||
    !Number.isFinite(Date.parse(createdAt))
  ) {
    return null;
  }

  return {
    eventId,
    type: candidate.type,
    createdAt,
    ...(optionalString(candidate.lifecycleId)
      ? { lifecycleId: optionalString(candidate.lifecycleId) }
      : {}),
    ...(optionalString(candidate.intentId)
      ? { intentId: optionalString(candidate.intentId) }
      : {}),
    ...(optionalString(candidate.recommendationId)
      ? { recommendationId: optionalString(candidate.recommendationId) }
      : {}),
    ...(optionalString(candidate.positionId)
      ? { positionId: optionalString(candidate.positionId) }
      : {}),
    ...(optionalString(candidate.ticker)
      ? { ticker: optionalString(candidate.ticker) }
      : {}),
    ...(candidate.action ? { action: candidate.action } : {}),
    ...(candidate.mode ? { mode: candidate.mode } : {}),
    ...(candidate.triggerType ? { triggerType: candidate.triggerType } : {}),
    ...(candidate.broker === "avanza" ? { broker: "avanza" } : {}),
    ...(optionalString(candidate.handoffVersion)
      ? { handoffVersion: optionalString(candidate.handoffVersion) }
      : {}),
    ...(candidate.handoffStatus ? { handoffStatus: candidate.handoffStatus } : {}),
    ...(candidate.brokerStatus ? { brokerStatus: candidate.brokerStatus } : {}),
    ...(optionalString(candidate.message)
      ? { message: optionalString(candidate.message) }
      : {}),
    ...(optionalMetadata(candidate.metadata)
      ? { metadata: optionalMetadata(candidate.metadata) }
      : {}),
  };
}

function readExecutionAuditEventLog(): ExecutionEventLogReadResult {
  const storage = getStorage();

  if (!storage) {
    return {
      events: [],
      discardedCount: 0,
      storageAvailable: false,
      error: null,
    };
  }

  try {
    const parsed = JSON.parse(
      storage.getItem(EXECUTION_EVENT_LOG_STORAGE_KEY) ?? "[]",
    );
    const rawEvents = Array.isArray(parsed) ? parsed : [];
    const events = rawEvents
      .map(normalizeExecutionAuditEvent)
      .filter((event): event is ExecutionAuditEvent => Boolean(event));

    return {
      events,
      discardedCount: rawEvents.length - events.length,
      storageAvailable: true,
      error: null,
    };
  } catch (error) {
    return {
      events: [],
      discardedCount: 0,
      storageAvailable: true,
      error: error instanceof Error ? error.message : "Malformed event log.",
    };
  }
}

function writeExecutionAuditEvents(events: ExecutionAuditEvent[]): boolean {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(
      EXECUTION_EVENT_LOG_STORAGE_KEY,
      JSON.stringify(events.slice(-MAX_EXECUTION_AUDIT_EVENTS)),
    );
    return true;
  } catch {
    return false;
  }
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
  const currentEvents = readExecutionAuditEvents();
  const validEvents = events
    .map(normalizeExecutionAuditEvent)
    .filter((event): event is ExecutionAuditEvent => Boolean(event));

  if (validEvents.length === 0) {
    return false;
  }

  return writeExecutionAuditEvents([...currentEvents, ...validEvents]);
}

export function clearExecutionAuditEvents(): boolean {
  return writeExecutionAuditEvents([]);
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
