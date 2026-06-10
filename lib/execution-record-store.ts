import type {
  BrokerExecutionCaptureStatus,
  BrokerExecutionCaptureBrokerResult,
  TureExecutionRecord,
} from "@/lib/broker-execution-capture";
import type { BrokerExecutionStatus, ExecutionAction } from "@/lib/execution";

export type StoredExecutionRecord = TureExecutionRecord;

export type ExecutionRecordStoreReadResult = {
  records: StoredExecutionRecord[];
  discardedCount: number;
  storageAvailable: boolean;
  error: string | null;
};

export const EXECUTION_RECORD_STORE_KEY = "ture_execution_records_v1";
export const MAX_STORED_EXECUTION_RECORDS = 1000;

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

function normalizeTimestamp(value: unknown): string | null {
  const timestamp = optionalString(value);

  return timestamp && Number.isFinite(Date.parse(timestamp)) ? timestamp : null;
}

function normalizeAction(value: unknown): ExecutionAction | null {
  return value === "buy" || value === "sell" ? value : null;
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

function readExecutionRecordStore(): ExecutionRecordStoreReadResult {
  const storage = getStorage();

  if (!storage) {
    return {
      records: [],
      discardedCount: 0,
      storageAvailable: false,
      error: null,
    };
  }

  try {
    const parsed = JSON.parse(
      storage.getItem(EXECUTION_RECORD_STORE_KEY) ?? "[]",
    );
    const rawRecords = Array.isArray(parsed) ? parsed : [];
    const records = rawRecords
      .map(normalizeStoredExecutionRecord)
      .filter((record): record is StoredExecutionRecord => Boolean(record));

    return {
      records,
      discardedCount: rawRecords.length - records.length,
      storageAvailable: true,
      error: null,
    };
  } catch (error) {
    return {
      records: [],
      discardedCount: 0,
      storageAvailable: true,
      error:
        error instanceof Error ? error.message : "Malformed execution records.",
    };
  }
}

function writeExecutionRecords(records: StoredExecutionRecord[]): boolean {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(
      EXECUTION_RECORD_STORE_KEY,
      JSON.stringify(records.slice(-MAX_STORED_EXECUTION_RECORDS)),
    );
    return true;
  } catch {
    return false;
  }
}

export function readExecutionRecords(): StoredExecutionRecord[] {
  return readExecutionRecordStore().records;
}

export function readExecutionRecordStoreResult(): ExecutionRecordStoreReadResult {
  return readExecutionRecordStore();
}

export function appendExecutionRecord(record: StoredExecutionRecord): boolean {
  return appendExecutionRecords([record]);
}

export function appendExecutionRecords(
  records: readonly StoredExecutionRecord[],
): boolean {
  const currentRecords = readExecutionRecords();
  const validRecords = records
    .map(normalizeStoredExecutionRecord)
    .filter((record): record is StoredExecutionRecord => Boolean(record));

  if (validRecords.length === 0) {
    return false;
  }

  return writeExecutionRecords([...currentRecords, ...validRecords]);
}

export function clearExecutionRecords(): boolean {
  return writeExecutionRecords([]);
}

export function getExecutionRecordsForIntent(intentId: string) {
  const normalizedIntentId = optionalString(intentId);

  if (!normalizedIntentId) {
    return [];
  }

  return readExecutionRecords().filter(
    (record) => record.intentId === normalizedIntentId,
  );
}

export function getExecutionRecordsForPosition(positionId: string) {
  const normalizedPositionId = optionalString(positionId);

  if (!normalizedPositionId) {
    return [];
  }

  return readExecutionRecords().filter(
    (record) => record.positionId === normalizedPositionId,
  );
}

export function getExecutionRecordsForRecommendation(recommendationId: string) {
  const normalizedRecommendationId = optionalString(recommendationId);

  if (!normalizedRecommendationId) {
    return [];
  }

  return readExecutionRecords().filter(
    (record) => record.recommendationId === normalizedRecommendationId,
  );
}
