import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DEV_MOCK_BROKER_RESULT_STORAGE_KEY,
  MAX_STORED_DEV_MOCK_BROKER_RESULTS,
} from "../../lib/dev-mock-broker-result-store";
import {
  EXECUTION_EVENT_LOG_STORAGE_KEY,
  MAX_EXECUTION_AUDIT_EVENTS,
  type ExecutionAuditEvent,
} from "../../lib/execution-event-log";
import {
  EXECUTION_RECORD_STORE_KEY,
  MAX_STORED_EXECUTION_RECORDS,
  type StoredExecutionRecord,
} from "../../lib/execution-record-store";
import {
  appendDevMockBrokerResultEntries,
  appendDevMockBrokerResultEntry,
  appendExecutionEventLogEntries,
  appendExecutionEventLogEntry,
  appendExecutionRecordEntries,
  appendExecutionRecordEntry,
  clearDevMockBrokerResultEntries,
  clearExecutionEventLogEntries,
  clearExecutionLocalStorageKey,
  clearExecutionRecordEntries,
  createMemoryExecutionStorage,
  readDevMockBrokerResultEntries,
  readExecutionEventLogEntries,
  readExecutionLocalJsonArray,
  readExecutionRecordEntries,
  writeDevMockBrokerResultEntries,
  writeExecutionLocalJsonArray,
  writeExecutionRecordEntries,
} from "../../lib/execution-local-storage-helpers";
import type { DevMockBrokerExecutionResult } from "../../lib/mock-broker-execution-result";

const root = process.cwd();
const helperPath = join(root, "lib/execution-local-storage-helpers.ts");
const eventLogPath = join(root, "lib/execution-event-log.ts");
const recordStorePath = join(root, "lib/execution-record-store.ts");
const devMockStorePath = join(root, "lib/dev-mock-broker-result-store.ts");

const forbiddenClientSafeFragments = [
  "server-only",
  "execution-record-audit-writer",
  "execution-lifecycle-transition-service",
  "transitionExecutionLifecycleOnServer",
  "transitionExecutionLifecycleAndAppendAuditEvent",
  "SUPABASE_SERVICE_ROLE",
  "process.env",
  "createClient",
  "supabase",
  "fetch(",
  ".insert(",
  ".update(",
  ".delete(",
  ".upsert(",
  ".select(",
];

function read(path: string) {
  return readFileSync(path, "utf8");
}

function setStoredJson(
  storage: ReturnType<typeof createMemoryExecutionStorage>,
  key: string,
  value: unknown,
) {
  storage.setItem(key, JSON.stringify(value));
}

function createAuditEvent(index = 1): ExecutionAuditEvent {
  return {
    eventId: `event-${index}`,
    type: "agent_progress_stub",
    createdAt: `2026-06-27T08:${String(index % 60).padStart(2, "0")}:00.000Z`,
    lifecycleId: "lifecycle-helper-baseline",
    intentId: `intent-${index % 2}`,
    recommendationId: `rec-${index % 3}`,
    positionId: `position-${index % 4}`,
    ticker: "TURE",
    action: "buy",
    mode: "semi_automatic",
    triggerType: "entry_recommendation_ready",
    broker: "avanza",
    handoffVersion: "avanza_execution_handoff_v2",
    handoffStatus: "ready",
    message: "Local helper event.",
    metadata: {
      debug_only: true,
      service_role_used: false,
    },
  };
}

function createStoredRecord(index = 1): StoredExecutionRecord {
  return {
    recordId: `record-${index}`,
    createdAt: `2026-06-27T09:${String(index % 60).padStart(2, "0")}:00.000Z`,
    broker: "avanza",
    mode: "semi_automatic",
    action: "buy",
    intentId: `intent-${index % 2}`,
    recommendationId: `rec-${index % 3}`,
    positionId: `position-${index % 4}`,
    ticker: "TURE",
    instrumentName: "Ture Helper",
    quantity: 10 + index,
    requestedPrice: 100 + index,
    executedPrice: 101 + index,
    orderId: `order-${index}`,
    brokerTimestamp: `2026-06-27T09:${String(index % 60).padStart(2, "0")}:30.000Z`,
    brokerStatus: "submitted",
    intent: { intent_id: `intent-${index}` },
    brokerResult: { orderId: `order-${index}` },
    captureStatus: "captured",
    reason: "Helper local execution record.",
  };
}

function createDevMockResult(index = 1): DevMockBrokerExecutionResult {
  return {
    source: "mock_broker",
    isMock: true,
    createdAt: `2026-06-27T10:${String(index % 60).padStart(2, "0")}:00.000Z`,
    status: "submitted",
    ticker: "TURE",
    action: "buy",
    quantity: 10 + index,
    requestedPrice: 100 + index,
    executedPrice: 101 + index,
    orderId: `mock-order-${index}`,
    requestId: `request-${index % 2}`,
    intentId: `intent-${index % 2}`,
    positionId: `position-${index % 3}`,
    recommendationId: `rec-${index % 4}`,
    message: "Helper mock broker result.",
    rawPayload: {
      status: "submitted",
      ticker: "TURE",
      action: "buy",
      quantity: String(10 + index),
      requestedPrice: String(100 + index),
      executedPrice: String(101 + index),
      account: "ISK helper",
      amountExcludingFees: String((100 + index) * (10 + index)),
      courtage: "1",
      fxFee: "0",
      preliminaryFxRate: "10.50",
      validUntil: "2026-06-27",
      totalAmount: String((101 + index) * (10 + index)),
      priceCurrency: "USD",
      instrumentMarket: "US",
      instrumentCurrency: "USD",
      instrumentType: "stock",
      orderMode: "dry_run",
      reviewButtonLabel: "Review",
      confirmButtonLabel: "Confirm",
      cancelButtonLabel: "Cancel",
      orderId: `mock-order-${index}`,
      requestId: `request-${index % 2}`,
      intentId: `intent-${index % 2}`,
      positionId: `position-${index % 3}`,
      recommendationId: `rec-${index % 4}`,
      message: "Helper mock broker result.",
    },
    warnings: [],
    errors: [],
  };
}

test.describe("execution local storage helpers", () => {
  test("preserves generic JSON array missing, malformed, unavailable, write, clear, and bound behavior", () => {
    const storage = createMemoryExecutionStorage();
    const normalizeNumber = (value: unknown) =>
      typeof value === "number" && Number.isFinite(value) ? value : null;

    expect(readExecutionLocalJsonArray(storage, "numbers", normalizeNumber, "bad")).toEqual({
      items: [],
      discardedCount: 0,
      storageAvailable: true,
      error: null,
    });

    setStoredJson(storage, "numbers", [1, "bad", 2, null]);
    expect(readExecutionLocalJsonArray(storage, "numbers", normalizeNumber, "bad")).toEqual({
      items: [1, 2],
      discardedCount: 2,
      storageAvailable: true,
      error: null,
    });

    storage.setItem("numbers", "{");
    const malformed = readExecutionLocalJsonArray(
      storage,
      "numbers",
      normalizeNumber,
      "Malformed numbers.",
    );
    expect(malformed.items).toEqual([]);
    expect(malformed.storageAvailable).toBe(true);
    expect(malformed.error).toContain("Expected");

    expect(writeExecutionLocalJsonArray(storage, "numbers", [1, 2, 3], 2)).toBe(true);
    expect(storage.snapshot().numbers).toBe("[2,3]");
    expect(clearExecutionLocalStorageKey(storage, "numbers")).toBe(true);
    expect(storage.snapshot().numbers).toBe("[]");
    expect(clearExecutionLocalStorageKey(storage, "numbers", "remove")).toBe(true);
    expect(storage.snapshot()).not.toHaveProperty("numbers");

    expect(readExecutionLocalJsonArray(null, "numbers", normalizeNumber, "bad")).toEqual({
      items: [],
      discardedCount: 0,
      storageAvailable: false,
      error: null,
    });
    expect(writeExecutionLocalJsonArray(null, "numbers", [1], 1)).toBe(false);
    expect(clearExecutionLocalStorageKey(null, "numbers")).toBe(false);
  });

  test("preserves execution event log append, read, ordering, malformed, clear, and max-size behavior", () => {
    const storage = createMemoryExecutionStorage();

    expect(readExecutionEventLogEntries(storage)).toEqual({
      events: [],
      discardedCount: 0,
      storageAvailable: true,
      error: null,
    });

    expect(appendExecutionEventLogEntry(storage, createAuditEvent(1))).toBe(true);
    expect(appendExecutionEventLogEntries(storage, [
      createAuditEvent(2),
      createAuditEvent(3),
    ])).toBe(true);
    expect(appendExecutionEventLogEntries(storage, [
      { ...createAuditEvent(4), eventId: "" },
    ])).toBe(false);

    expect(readExecutionEventLogEntries(storage).events.map((event) => event.eventId)).toEqual([
      "event-1",
      "event-2",
      "event-3",
    ]);

    setStoredJson(storage, EXECUTION_EVENT_LOG_STORAGE_KEY, [
      createAuditEvent(5),
      { eventId: "bad-event", type: "unsupported", createdAt: "2026-06-27T08:00:00.000Z" },
      null,
    ]);
    const filtered = readExecutionEventLogEntries(storage);
    expect(filtered.events.map((event) => event.eventId)).toEqual(["event-5"]);
    expect(filtered.discardedCount).toBe(2);

    storage.setItem(EXECUTION_EVENT_LOG_STORAGE_KEY, "{");
    expect(readExecutionEventLogEntries(storage).error).toContain("Expected");

    expect(appendExecutionEventLogEntries(
      storage,
      Array.from({ length: MAX_EXECUTION_AUDIT_EVENTS + 2 }, (_, index) =>
        createAuditEvent(index + 1),
      ),
    )).toBe(true);
    const stored = JSON.parse(
      storage.snapshot()[EXECUTION_EVENT_LOG_STORAGE_KEY] ?? "[]",
    ) as Array<{ eventId: string }>;
    expect(stored).toHaveLength(MAX_EXECUTION_AUDIT_EVENTS);
    expect(stored[0].eventId).toBe("event-3");

    expect(clearExecutionEventLogEntries(storage)).toBe(true);
    expect(storage.snapshot()[EXECUTION_EVENT_LOG_STORAGE_KEY]).toBe("[]");
    expect(readExecutionEventLogEntries(null).storageAvailable).toBe(false);
  });

  test("preserves execution record write, append, read, malformed, clear, and max-size behavior", () => {
    const storage = createMemoryExecutionStorage();

    expect(writeExecutionRecordEntries(storage, [createStoredRecord(1)])).toBe(true);
    expect(appendExecutionRecordEntries(storage, [
      createStoredRecord(2),
      createStoredRecord(3),
    ])).toBe(true);
    expect(appendExecutionRecordEntry(storage, {
      ...createStoredRecord(4),
      recordId: "",
    })).toBe(false);

    expect(readExecutionRecordEntries(storage).records.map((record) => record.recordId)).toEqual([
      "record-1",
      "record-2",
      "record-3",
    ]);

    setStoredJson(storage, EXECUTION_RECORD_STORE_KEY, [
      createStoredRecord(5),
      { recordId: "bad-record", broker: "avanza", createdAt: "bad-date" },
      null,
    ]);
    const filtered = readExecutionRecordEntries(storage);
    expect(filtered.records.map((record) => record.recordId)).toEqual(["record-5"]);
    expect(filtered.discardedCount).toBe(2);

    storage.setItem(EXECUTION_RECORD_STORE_KEY, "{");
    expect(readExecutionRecordEntries(storage).error).toContain("Expected");

    expect(appendExecutionRecordEntries(
      storage,
      Array.from({ length: MAX_STORED_EXECUTION_RECORDS + 1 }, (_, index) =>
        createStoredRecord(index + 1),
      ),
    )).toBe(true);
    const stored = JSON.parse(
      storage.snapshot()[EXECUTION_RECORD_STORE_KEY] ?? "[]",
    ) as Array<{ recordId: string }>;
    expect(stored).toHaveLength(MAX_STORED_EXECUTION_RECORDS);
    expect(stored[0].recordId).toBe("record-2");

    expect(clearExecutionRecordEntries(storage)).toBe(true);
    expect(storage.snapshot()[EXECUTION_RECORD_STORE_KEY]).toBe("[]");
    expect(readExecutionRecordEntries(null).storageAvailable).toBe(false);
  });

  test("preserves dev mock broker result write, append, read, malformed, remove-clear, and max-size behavior", () => {
    const storage = createMemoryExecutionStorage();

    expect(writeDevMockBrokerResultEntries(storage, [createDevMockResult(1)])).toBe(true);
    expect(appendDevMockBrokerResultEntry(storage, createDevMockResult(2))).toBe(true);
    expect(appendDevMockBrokerResultEntry(storage, {
      ...createDevMockResult(3),
      source: "bad" as "mock_broker",
    })).toBe(false);

    expect(readDevMockBrokerResultEntries(storage).results.map((result) => result.orderId)).toEqual([
      "mock-order-1",
      "mock-order-2",
    ]);

    setStoredJson(storage, DEV_MOCK_BROKER_RESULT_STORAGE_KEY, [
      createDevMockResult(4),
      { source: "mock_broker", isMock: false, createdAt: "2026-06-27T10:00:00.000Z" },
    ]);
    const filtered = readDevMockBrokerResultEntries(storage);
    expect(filtered.results.map((result) => result.orderId)).toEqual(["mock-order-4"]);
    expect(filtered.discardedCount).toBe(1);

    storage.setItem(DEV_MOCK_BROKER_RESULT_STORAGE_KEY, "{");
    expect(readDevMockBrokerResultEntries(storage).error).toContain("Expected");

    expect(appendDevMockBrokerResultEntries(
      storage,
      Array.from({ length: MAX_STORED_DEV_MOCK_BROKER_RESULTS + 1 }, (_, index) =>
        createDevMockResult(index + 1),
      ),
    )).toBe(true);
    const stored = JSON.parse(
      storage.snapshot()[DEV_MOCK_BROKER_RESULT_STORAGE_KEY] ?? "[]",
    ) as Array<{ orderId: string }>;
    expect(stored).toHaveLength(MAX_STORED_DEV_MOCK_BROKER_RESULTS);
    expect(stored[0].orderId).toBe("mock-order-2");

    expect(clearDevMockBrokerResultEntries(storage)).toBe(true);
    expect(storage.snapshot()).not.toHaveProperty(DEV_MOCK_BROKER_RESULT_STORAGE_KEY);
    expect(readDevMockBrokerResultEntries(null).storageAvailable).toBe(false);
  });

  test("preserves key names and remains deterministic for equivalent storage inputs", () => {
    const first = createMemoryExecutionStorage();
    const second = createMemoryExecutionStorage();
    const events = [createAuditEvent(1), createAuditEvent(2)];

    expect(EXECUTION_EVENT_LOG_STORAGE_KEY).toBe("ture_execution_event_log_v1");
    expect(EXECUTION_RECORD_STORE_KEY).toBe("ture_execution_records_v1");
    expect(DEV_MOCK_BROKER_RESULT_STORAGE_KEY).toBe("ture_dev_mock_broker_results_v1");

    expect(appendExecutionEventLogEntries(first, events)).toBe(true);
    expect(appendExecutionEventLogEntries(second, events)).toBe(true);
    expect(first.snapshot()).toEqual(second.snapshot());
    expect(readExecutionEventLogEntries(first)).toEqual(readExecutionEventLogEntries(second));
  });

  test("keeps helpers client-safe, local-only, and outside server audit writer boundaries", () => {
    const source = read(helperPath);

    expect(source).toContain("ExecutionLocalStorageLike");
    expect(source).toContain("getBrowserExecutionLocalStorage");
    expect(source).toContain("createMemoryExecutionStorage");

    for (const fragment of forbiddenClientSafeFragments) {
      expect(source).not.toContain(fragment);
    }

    expect(source).not.toContain("/api/execution/audit/writer");
    expect(source).not.toContain("public.execution_record_audit_events");
    expect(source).not.toContain("automatic mode");
    expect(source).not.toContain("AvanzaExecution");
  });

  test("wires all dedicated execution local storage modules through helpers", () => {
    const eventLogSource = read(eventLogPath);
    const recordStoreSource = read(recordStorePath);
    const devMockStoreSource = read(devMockStorePath);

    expect(eventLogSource).toContain("@/lib/execution-local-storage-helpers");
    expect(eventLogSource).toContain("readExecutionEventLogEntries");
    expect(eventLogSource).toContain("appendExecutionEventLogEntries");
    expect(eventLogSource).toContain("clearExecutionEventLogEntries");
    expect(eventLogSource).toContain("getBrowserExecutionLocalStorage");

    expect(recordStoreSource).toContain("@/lib/execution-local-storage-helpers");
    expect(recordStoreSource).toContain("readExecutionRecordEntries");
    expect(recordStoreSource).toContain("appendExecutionRecordEntries");
    expect(recordStoreSource).toContain("clearExecutionRecordEntries");
    expect(recordStoreSource).toContain("getBrowserExecutionLocalStorage");

    expect(devMockStoreSource).toContain("@/lib/execution-local-storage-helpers");
    expect(devMockStoreSource).toContain("readDevMockBrokerResultEntries");
    expect(devMockStoreSource).toContain("appendDevMockBrokerResultEntries");
    expect(devMockStoreSource).toContain("clearDevMockBrokerResultEntries");
    expect(devMockStoreSource).toContain("getBrowserExecutionLocalStorage");
  });
});
