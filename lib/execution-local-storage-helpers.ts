import type {
  BrokerExecutionCaptureBrokerResult,
  BrokerExecutionCaptureStatus,
  TureExecutionRecord,
} from "@/lib/broker-execution-capture";
import {
  type ExecutionAuditEvent,
  type ExecutionAuditEventType,
} from "@/lib/execution-event-log";
import type { StoredDevMockBrokerExecutionResult } from "@/lib/dev-mock-broker-result-store";
import type { StoredExecutionRecord } from "@/lib/execution-record-store";
import type { BrokerExecutionStatus, ExecutionAction } from "@/lib/execution";
import { validateDevMockBrokerExecutionResult } from "@/lib/mock-broker-execution-result";

const EXECUTION_EVENT_LOG_STORAGE_KEY = "ture_execution_event_log_v1";
const EXECUTION_RECORD_STORE_KEY = "ture_execution_records_v1";
const DEV_MOCK_BROKER_RESULT_STORAGE_KEY = "ture_dev_mock_broker_results_v1";
const MAX_EXECUTION_AUDIT_EVENTS = 1000;
const MAX_STORED_EXECUTION_RECORDS = 1000;
const MAX_STORED_DEV_MOCK_BROKER_RESULTS = 500;

export type ExecutionLocalStorageLike = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export type ExecutionLocalJsonArrayReadResult<T> = {
  items: T[];
  discardedCount: number;
  storageAvailable: boolean;
  error: string | null;
};

export type ExecutionLocalEventLogReadResult = {
  events: ExecutionAuditEvent[];
  discardedCount: number;
  storageAvailable: boolean;
  error: string | null;
};

export type ExecutionLocalRecordStoreReadResult = {
  records: StoredExecutionRecord[];
  discardedCount: number;
  storageAvailable: boolean;
  error: string | null;
};

export type ExecutionLocalDevMockBrokerStoreReadResult = {
  results: StoredDevMockBrokerExecutionResult[];
  discardedCount: number;
  storageAvailable: boolean;
  error: string | null;
};

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
  "localhost_mock_agent_run_stub",
  "dev_mock_broker_capture_stub",
  "localhost_bridge_cancel_stub",
];

const captureStatuses: BrokerExecutionCaptureStatus[] = [
  "captured",
  "invalid_intent",
  "invalid_result",
  "intent_result_mismatch",
  "broker_rejected",
  "broker_cancelled",
  "broker_unknown",
];

const brokerStatuses: BrokerExecutionStatus[] = [
  "submitted",
  "filled",
  "partially_filled",
  "rejected",
  "cancelled",
  "unknown",
];

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalStringValue(value: unknown): string | undefined {
  return optionalString(value) ?? undefined;
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

function normalizeTimestamp(value: unknown): string | null {
  const timestamp = optionalString(value);

  return timestamp && Number.isFinite(Date.parse(timestamp)) ? timestamp : null;
}

function normalizeAction(value: unknown): ExecutionAction | null {
  return value === "buy" || value === "sell" ? value : null;
}

function isExecutionAuditEventType(value: unknown): value is ExecutionAuditEventType {
  return (
    typeof value === "string" &&
    auditEventTypes.includes(value as ExecutionAuditEventType)
  );
}

function normalizeCaptureStatus(
  value: unknown,
): BrokerExecutionCaptureStatus | null {
  return captureStatuses.includes(value as BrokerExecutionCaptureStatus)
    ? (value as BrokerExecutionCaptureStatus)
    : null;
}

function normalizeBrokerStatus(value: unknown): BrokerExecutionStatus | null {
  return brokerStatuses.includes(value as BrokerExecutionStatus)
    ? (value as BrokerExecutionStatus)
    : null;
}

function optionalObject<T extends Record<string, unknown>>(
  value: unknown,
): T | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? ({ ...(value as Record<string, unknown>) } as T)
    : null;
}

function optionalMetadata(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : undefined;
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
    ...(optionalStringValue(candidate.lifecycleId)
      ? { lifecycleId: optionalStringValue(candidate.lifecycleId) }
      : {}),
    ...(optionalStringValue(candidate.intentId)
      ? { intentId: optionalStringValue(candidate.intentId) }
      : {}),
    ...(optionalStringValue(candidate.recommendationId)
      ? { recommendationId: optionalStringValue(candidate.recommendationId) }
      : {}),
    ...(optionalStringValue(candidate.positionId)
      ? { positionId: optionalStringValue(candidate.positionId) }
      : {}),
    ...(optionalStringValue(candidate.ticker)
      ? { ticker: optionalStringValue(candidate.ticker) }
      : {}),
    ...(candidate.action ? { action: candidate.action } : {}),
    ...(candidate.mode ? { mode: candidate.mode } : {}),
    ...(candidate.triggerType ? { triggerType: candidate.triggerType } : {}),
    ...(candidate.broker === "avanza" ? { broker: "avanza" } : {}),
    ...(optionalStringValue(candidate.handoffVersion)
      ? { handoffVersion: optionalStringValue(candidate.handoffVersion) }
      : {}),
    ...(candidate.handoffStatus ? { handoffStatus: candidate.handoffStatus } : {}),
    ...(candidate.brokerStatus ? { brokerStatus: candidate.brokerStatus } : {}),
    ...(optionalStringValue(candidate.message)
      ? { message: optionalStringValue(candidate.message) }
      : {}),
    ...(optionalMetadata(candidate.metadata)
      ? { metadata: optionalMetadata(candidate.metadata) }
      : {}),
  };
}

function normalizeStoredExecutionRecord(
  value: unknown,
): StoredExecutionRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<TureExecutionRecord>;
  const recordId = optionalString(candidate.recordId);
  const createdAt = normalizeTimestamp(candidate.createdAt);
  const captureStatus = normalizeCaptureStatus(candidate.captureStatus);

  if (
    !recordId ||
    !createdAt ||
    candidate.broker !== "avanza" ||
    !captureStatus
  ) {
    return null;
  }

  return {
    recordId,
    createdAt,
    broker: "avanza",
    mode:
      candidate.mode === "semi_automatic" || candidate.mode === "automatic"
        ? candidate.mode
        : null,
    action: normalizeAction(candidate.action),
    intentId: optionalString(candidate.intentId),
    recommendationId: optionalString(candidate.recommendationId),
    positionId: optionalString(candidate.positionId),
    ticker: optionalString(candidate.ticker),
    instrumentName: optionalString(candidate.instrumentName),
    quantity: finiteNumber(candidate.quantity),
    requestedPrice: finiteNumber(candidate.requestedPrice),
    executedPrice: finiteNumber(candidate.executedPrice),
    orderId: optionalString(candidate.orderId),
    brokerTimestamp: normalizeTimestamp(candidate.brokerTimestamp),
    brokerStatus: normalizeBrokerStatus(candidate.brokerStatus),
    intent: optionalObject(candidate.intent),
    brokerResult: optionalObject<BrokerExecutionCaptureBrokerResult>(
      candidate.brokerResult,
    ),
    captureStatus,
    reason:
      optionalString(candidate.reason) ??
      "Local execution record captured without a reason.",
  };
}

function normalizeStoredDevMockBrokerResult(
  value: unknown,
): StoredDevMockBrokerExecutionResult | null {
  const validation = validateDevMockBrokerExecutionResult(
    value as Partial<StoredDevMockBrokerExecutionResult> | null | undefined,
  );

  return validation.ok ? (value as StoredDevMockBrokerExecutionResult) : null;
}

function unavailableReadResult<T>(): ExecutionLocalJsonArrayReadResult<T> {
  return {
    items: [],
    discardedCount: 0,
    storageAvailable: false,
    error: null,
  };
}

export function getBrowserExecutionLocalStorage(): ExecutionLocalStorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readExecutionLocalJsonArray<T>(
  storage: ExecutionLocalStorageLike | null | undefined,
  key: string,
  normalizeItem: (value: unknown) => T | null,
  malformedMessage: string,
): ExecutionLocalJsonArrayReadResult<T> {
  if (!storage) {
    return unavailableReadResult();
  }

  try {
    const parsed = JSON.parse(storage.getItem(key) ?? "[]");
    const rawItems = Array.isArray(parsed) ? parsed : [];
    const items = rawItems
      .map(normalizeItem)
      .filter((item): item is T => Boolean(item));

    return {
      items,
      discardedCount: rawItems.length - items.length,
      storageAvailable: true,
      error: null,
    };
  } catch (error) {
    return {
      items: [],
      discardedCount: 0,
      storageAvailable: true,
      error: error instanceof Error ? error.message : malformedMessage,
    };
  }
}

export function writeExecutionLocalJsonArray<T>(
  storage: ExecutionLocalStorageLike | null | undefined,
  key: string,
  items: readonly T[],
  maxItems: number,
): boolean {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, JSON.stringify(items.slice(-maxItems)));
    return true;
  } catch {
    return false;
  }
}

export function clearExecutionLocalStorageKey(
  storage: ExecutionLocalStorageLike | null | undefined,
  key: string,
  mode: "empty_array" | "remove" = "empty_array",
): boolean {
  if (!storage) {
    return false;
  }

  try {
    if (mode === "remove") {
      storage.removeItem(key);
      return true;
    }

    storage.setItem(key, "[]");
    return true;
  } catch {
    return false;
  }
}

export function readExecutionEventLogEntries(
  storage: ExecutionLocalStorageLike | null | undefined,
): ExecutionLocalEventLogReadResult {
  const result = readExecutionLocalJsonArray(
    storage,
    EXECUTION_EVENT_LOG_STORAGE_KEY,
    normalizeExecutionAuditEvent,
    "Malformed event log.",
  );

  return {
    events: result.items,
    discardedCount: result.discardedCount,
    storageAvailable: result.storageAvailable,
    error: result.error,
  };
}

export function appendExecutionEventLogEntry(
  storage: ExecutionLocalStorageLike | null | undefined,
  event: ExecutionAuditEvent,
): boolean {
  return appendExecutionEventLogEntries(storage, [event]);
}

export function appendExecutionEventLogEntries(
  storage: ExecutionLocalStorageLike | null | undefined,
  events: readonly ExecutionAuditEvent[],
): boolean {
  const currentEvents = readExecutionEventLogEntries(storage).events;
  const validEvents = events
    .map(normalizeExecutionAuditEvent)
    .filter((event): event is ExecutionAuditEvent => Boolean(event));

  if (validEvents.length === 0) {
    return false;
  }

  return writeExecutionLocalJsonArray(
    storage,
    EXECUTION_EVENT_LOG_STORAGE_KEY,
    [...currentEvents, ...validEvents],
    MAX_EXECUTION_AUDIT_EVENTS,
  );
}

export function clearExecutionEventLogEntries(
  storage: ExecutionLocalStorageLike | null | undefined,
): boolean {
  return clearExecutionLocalStorageKey(
    storage,
    EXECUTION_EVENT_LOG_STORAGE_KEY,
    "empty_array",
  );
}

export function readExecutionRecordEntries(
  storage: ExecutionLocalStorageLike | null | undefined,
): ExecutionLocalRecordStoreReadResult {
  const result = readExecutionLocalJsonArray(
    storage,
    EXECUTION_RECORD_STORE_KEY,
    normalizeStoredExecutionRecord,
    "Malformed execution records.",
  );

  return {
    records: result.items,
    discardedCount: result.discardedCount,
    storageAvailable: result.storageAvailable,
    error: result.error,
  };
}

export function writeExecutionRecordEntries(
  storage: ExecutionLocalStorageLike | null | undefined,
  records: readonly StoredExecutionRecord[],
): boolean {
  const validRecords = records
    .map(normalizeStoredExecutionRecord)
    .filter((record): record is StoredExecutionRecord => Boolean(record));

  return writeExecutionLocalJsonArray(
    storage,
    EXECUTION_RECORD_STORE_KEY,
    validRecords,
    MAX_STORED_EXECUTION_RECORDS,
  );
}

export function appendExecutionRecordEntry(
  storage: ExecutionLocalStorageLike | null | undefined,
  record: StoredExecutionRecord,
): boolean {
  return appendExecutionRecordEntries(storage, [record]);
}

export function appendExecutionRecordEntries(
  storage: ExecutionLocalStorageLike | null | undefined,
  records: readonly StoredExecutionRecord[],
): boolean {
  const currentRecords = readExecutionRecordEntries(storage).records;
  const validRecords = records
    .map(normalizeStoredExecutionRecord)
    .filter((record): record is StoredExecutionRecord => Boolean(record));

  if (validRecords.length === 0) {
    return false;
  }

  return writeExecutionRecordEntries(storage, [...currentRecords, ...validRecords]);
}

export function clearExecutionRecordEntries(
  storage: ExecutionLocalStorageLike | null | undefined,
): boolean {
  return clearExecutionLocalStorageKey(
    storage,
    EXECUTION_RECORD_STORE_KEY,
    "empty_array",
  );
}

export function readDevMockBrokerResultEntries(
  storage: ExecutionLocalStorageLike | null | undefined,
): ExecutionLocalDevMockBrokerStoreReadResult {
  const result = readExecutionLocalJsonArray(
    storage,
    DEV_MOCK_BROKER_RESULT_STORAGE_KEY,
    normalizeStoredDevMockBrokerResult,
    "Malformed dev mock broker result store.",
  );

  return {
    results: result.items,
    discardedCount: result.discardedCount,
    storageAvailable: result.storageAvailable,
    error: result.error,
  };
}

export function writeDevMockBrokerResultEntries(
  storage: ExecutionLocalStorageLike | null | undefined,
  results: readonly StoredDevMockBrokerExecutionResult[],
): boolean {
  const validResults = results
    .map(normalizeStoredDevMockBrokerResult)
    .filter(
      (result): result is StoredDevMockBrokerExecutionResult =>
        Boolean(result),
    );

  return writeExecutionLocalJsonArray(
    storage,
    DEV_MOCK_BROKER_RESULT_STORAGE_KEY,
    validResults,
    MAX_STORED_DEV_MOCK_BROKER_RESULTS,
  );
}

export function appendDevMockBrokerResultEntry(
  storage: ExecutionLocalStorageLike | null | undefined,
  result: StoredDevMockBrokerExecutionResult,
): boolean {
  return appendDevMockBrokerResultEntries(storage, [result]);
}

export function appendDevMockBrokerResultEntries(
  storage: ExecutionLocalStorageLike | null | undefined,
  results: readonly StoredDevMockBrokerExecutionResult[],
): boolean {
  const currentResults = readDevMockBrokerResultEntries(storage).results;
  const validResults = results
    .map(normalizeStoredDevMockBrokerResult)
    .filter(
      (result): result is StoredDevMockBrokerExecutionResult =>
        Boolean(result),
    );

  if (validResults.length === 0) {
    return false;
  }

  return writeDevMockBrokerResultEntries(storage, [
    ...currentResults,
    ...validResults,
  ]);
}

export function clearDevMockBrokerResultEntries(
  storage: ExecutionLocalStorageLike | null | undefined,
): boolean {
  return clearExecutionLocalStorageKey(
    storage,
    DEV_MOCK_BROKER_RESULT_STORAGE_KEY,
    "remove",
  );
}

export function createMemoryExecutionStorage(
  initialValues: Record<string, string> = {},
): ExecutionLocalStorageLike & { snapshot: () => Record<string, string> } {
  let values = new Map(Object.entries(initialValues));

  return {
    getItem(key: string) {
      return values.has(key) ? values.get(key) ?? null : null;
    },
    setItem(key: string, value: string) {
      values.set(key, String(value));
    },
    removeItem(key: string) {
      values = new Map([...values.entries()].filter(([itemKey]) => itemKey !== key));
    },
    snapshot() {
      return Object.fromEntries(values.entries());
    },
  };
}
