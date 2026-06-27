import type { TureExecutionRecord } from "@/lib/broker-execution-capture";
import {
  appendExecutionRecordEntries,
  clearExecutionRecordEntries,
  getBrowserExecutionLocalStorage,
  readExecutionRecordEntries,
} from "@/lib/execution-local-storage-helpers";

export type StoredExecutionRecord = TureExecutionRecord;

export type ExecutionRecordStoreReadResult = {
  records: StoredExecutionRecord[];
  discardedCount: number;
  storageAvailable: boolean;
  error: string | null;
};

export const EXECUTION_RECORD_STORE_KEY = "ture_execution_records_v1";
export const MAX_STORED_EXECUTION_RECORDS = 1000;

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readExecutionRecordStore(): ExecutionRecordStoreReadResult {
  return readExecutionRecordEntries(getBrowserExecutionLocalStorage());
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
  return appendExecutionRecordEntries(getBrowserExecutionLocalStorage(), records);
}

export function clearExecutionRecords(): boolean {
  return clearExecutionRecordEntries(getBrowserExecutionLocalStorage());
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
