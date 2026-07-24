import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  appendDevMockBrokerResult,
  clearDevMockBrokerResults,
  DEV_MOCK_BROKER_RESULT_STORAGE_KEY,
  getDevMockBrokerResultsForIntent,
  getDevMockBrokerResultsForPosition,
  getDevMockBrokerResultsForRecommendation,
  getDevMockBrokerResultsForRequest,
  MAX_STORED_DEV_MOCK_BROKER_RESULTS,
  readDevMockBrokerResultStoreResult,
} from "../../lib/dev-mock-broker-result-store";
import {
  appendExecutionAuditEvent,
  appendExecutionAuditEvents,
  buildExecutionAuditEventFromLifecycleEvent,
  clearExecutionAuditEvents,
  createExecutionAuditEvent,
  EXECUTION_EVENT_LOG_STORAGE_KEY,
  getExecutionAuditEventsForIntent,
  getExecutionAuditEventsForPosition,
  getExecutionAuditEventsForRecommendation,
  MAX_EXECUTION_AUDIT_EVENTS,
  readExecutionEventLog,
} from "../../lib/execution-event-log";
import {
  appendExecutionRecord,
  appendExecutionRecords,
  clearExecutionRecords,
  EXECUTION_RECORD_STORE_KEY,
  getExecutionRecordsForIntent,
  getExecutionRecordsForPosition,
  getExecutionRecordsForRecommendation,
  MAX_STORED_EXECUTION_RECORDS,
  readExecutionRecordStoreResult,
  type StoredExecutionRecord,
} from "../../lib/execution-record-store";
import { DEFAULT_EXECUTION_MODE, EXECUTION_MODE_STORAGE_KEY } from "../../lib/execution";
import {
  TRADE_MANAGEMENT_EVENTS_STORAGE_KEY,
  TRADE_MOCK_BROKER_LATEST_FILL_STORAGE_KEY,
} from "../../lib/persistence/local-storage-keys";
import { readLatestMockBrokerFillRaw } from "../../lib/persistence/dev-diagnostics-local-storage";
import {
  readTradeManagementEvents,
  type ExecutionTimelineEventType,
} from "../../lib/execution-timeline";
import type { DevMockBrokerExecutionResult } from "../../lib/mock-broker-execution-result";

const root = process.cwd();
const eventLogPath = join(root, "lib/execution-event-log.ts");
const recordStorePath = join(root, "lib/execution-record-store.ts");
const devMockStorePath = join(root, "lib/dev-mock-broker-result-store.ts");
const timelinePath = join(root, "lib/execution-timeline.ts");
const settingsPath = join(root, "app/settings/page.tsx");
const modalHelperPath = join(root, "lib/execution-modal-state-helpers.ts");
const lifecycleAdapterPath = join(root, "lib/execution-lifecycle-ui-state-adapter.ts");
const tradeAppPath = join(root, "app/trade-app.tsx");
const handoffPreviewModalPath = join(
  root,
  "components/execution/execution-handoff-preview-modal.tsx",
);
const executionAuditLogViewerPath = join(
  root,
  "components/execution/execution-audit-log-viewer.tsx",
);
const executionLocalRecordsViewerPath = join(
  root,
  "components/execution/execution-local-records-viewer.tsx",
);
const devMockBrokerResultsPanelPath = join(
  root,
  "components/execution/execution-dev-mock-broker-results-panel.tsx",
);
const localPersistenceViewersHookPath = join(
  root,
  "hooks/execution/useExecutionLocalPersistenceViewers.ts",
);

const storageBackedModules = [
  eventLogPath,
  recordStorePath,
  devMockStorePath,
  timelinePath,
];

const clientBoundaryModules = [
  eventLogPath,
  recordStorePath,
  devMockStorePath,
  modalHelperPath,
  lifecycleAdapterPath,
];

const forbiddenStorageModuleFragments = [
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

const forbiddenModalHelperFragments = [
  "EXECUTION_EVENT_LOG_STORAGE_KEY",
  "EXECUTION_RECORD_STORE_KEY",
  "DEV_MOCK_BROKER_RESULT_STORAGE_KEY",
  "appendExecutionAudit",
  "appendExecutionRecord",
  "appendDevMockBrokerResult",
  "localStorage",
  "sessionStorage",
];

function read(path: string) {
  return readFileSync(path, "utf8");
}

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.has(key) ? this.values.get(key) ?? null : null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, String(value));
  }
}

function installWindowWithStorage(storage: Storage = new MemoryStorage()) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: { localStorage: storage },
  });

  return storage;
}

function uninstallWindow() {
  Reflect.deleteProperty(globalThis, "window");
}

function setStoredJson(storage: Storage, key: string, value: unknown) {
  storage.setItem(key, JSON.stringify(value));
}

function createAuditEvent(index = 1) {
  return createExecutionAuditEvent({
    eventId: `event-${index}`,
    type: "agent_progress_stub",
    createdAt: `2026-06-27T08:${String(index % 60).padStart(2, "0")}:00.000Z`,
    lifecycleId: "lifecycle-baseline",
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
    message: "Local baseline event.",
    metadata: {
      debug_only: true,
      service_role_used: false,
    },
  });
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
    instrumentName: "Ture Baseline",
    quantity: 10 + index,
    requestedPrice: 100 + index,
    executedPrice: 101 + index,
    orderId: `order-${index}`,
    brokerTimestamp: `2026-06-27T09:${String(index % 60).padStart(2, "0")}:30.000Z`,
    brokerStatus: "submitted",
    intent: { intent_id: `intent-${index}` },
    brokerResult: { orderId: `order-${index}` },
    captureStatus: "captured",
    reason: "Baseline local execution record.",
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
    message: "Baseline mock broker result.",
    rawPayload: {
      action: "buy",
      ticker: "TURE",
      quantity: String(10 + index),
      requestedPrice: String(100 + index),
      executedPrice: String(101 + index),
      account: "ISK baseline",
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
      status: "submitted",
      requestId: `request-${index % 2}`,
      intentId: `intent-${index % 2}`,
      positionId: `position-${index % 3}`,
      recommendationId: `rec-${index % 4}`,
      message: "Baseline mock broker result.",
    },
    warnings: [],
    errors: [],
  };
}

test.describe("execution event log/localStorage baseline", () => {
  test.beforeEach(() => {
    installWindowWithStorage();
  });

  test.afterEach(() => {
    uninstallWindow();
  });

  test("locks execution event log missing key, append, read, order, lookups, malformed JSON, and clear behavior", () => {
    const storage = installWindowWithStorage();

    expect(readExecutionEventLog()).toEqual({
      events: [],
      discardedCount: 0,
      storageAvailable: true,
      error: null,
    });

    expect(appendExecutionAuditEvent(createAuditEvent(1))).toBe(true);
    expect(appendExecutionAuditEvents([createAuditEvent(2), createAuditEvent(3)])).toBe(true);
    expect(appendExecutionAuditEvents([{ ...createAuditEvent(4), eventId: "" }])).toBe(false);

    const readResult = readExecutionEventLog();
    expect(readResult).toMatchObject({
      discardedCount: 0,
      storageAvailable: true,
      error: null,
    });
    expect(readResult.events.map((event) => event.eventId)).toEqual([
      "event-1",
      "event-2",
      "event-3",
    ]);
    expect(readResult.events[0]).toMatchObject({
      type: "agent_progress_stub",
      broker: "avanza",
      metadata: {
        debug_only: true,
        service_role_used: false,
      },
    });
    expect(getExecutionAuditEventsForIntent("intent-1").map((event) => event.eventId)).toEqual([
      "event-1",
      "event-3",
    ]);
    expect(getExecutionAuditEventsForRecommendation("rec-2").map((event) => event.eventId)).toEqual([
      "event-2",
    ]);
    expect(getExecutionAuditEventsForPosition("position-3").map((event) => event.eventId)).toEqual([
      "event-3",
    ]);

    setStoredJson(storage, EXECUTION_EVENT_LOG_STORAGE_KEY, [
      createAuditEvent(5),
      { eventId: "bad-event", type: "unsupported", createdAt: "2026-06-27T08:00:00.000Z" },
      null,
    ]);
    const filtered = readExecutionEventLog();
    expect(filtered.events.map((event) => event.eventId)).toEqual(["event-5"]);
    expect(filtered.discardedCount).toBe(2);

    storage.setItem(EXECUTION_EVENT_LOG_STORAGE_KEY, "{");
    const malformed = readExecutionEventLog();
    expect(malformed.events).toEqual([]);
    expect(malformed.storageAvailable).toBe(true);
    expect(malformed.error).toContain("Expected");

    expect(clearExecutionAuditEvents()).toBe(true);
    expect(storage.getItem(EXECUTION_EVENT_LOG_STORAGE_KEY)).toBe("[]");
    expect(readExecutionEventLog().events).toEqual([]);
  });

  test("locks execution event log max-size bounding and lifecycle-event mapping", () => {
    const storage = installWindowWithStorage();
    const events = Array.from({ length: MAX_EXECUTION_AUDIT_EVENTS + 2 }, (_, index) =>
      createAuditEvent(index + 1),
    );

    expect(appendExecutionAuditEvents(events)).toBe(true);

    const stored = JSON.parse(storage.getItem(EXECUTION_EVENT_LOG_STORAGE_KEY) ?? "[]") as Array<{
      eventId: string;
    }>;
    expect(stored).toHaveLength(MAX_EXECUTION_AUDIT_EVENTS);
    expect(stored[0].eventId).toBe("event-3");
    expect(stored.at(-1)?.eventId).toBe(`event-${MAX_EXECUTION_AUDIT_EVENTS + 2}`);

    const lifecycleAuditEvent = buildExecutionAuditEventFromLifecycleEvent(
      {
        eventId: "lifecycle-event-1",
        type: "wait_for_manual_confirmation",
        createdAt: "2026-06-27T11:00:00.000Z",
        fromState: "broker_order_preparing",
        toState: "waiting_for_manual_confirmation",
        intentId: "intent-lifecycle",
        handoffVersion: "avanza_execution_handoff_v2",
        message: "Waiting for human confirmation.",
        metadata: { handoff_status: "ready", debug_only: true },
      },
      {
        lifecycleId: "lifecycle-1",
        currentState: "waiting_for_manual_confirmation",
        createdAt: "2026-06-27T10:55:00.000Z",
        updatedAt: "2026-06-27T11:00:00.000Z",
        intentId: "intent-lifecycle",
        recommendationId: "rec-lifecycle",
        positionId: "position-lifecycle",
        mode: "semi_automatic",
        action: "buy",
        triggerType: "entry_recommendation_ready",
        events: [],
      },
    );

    expect(lifecycleAuditEvent).toMatchObject({
      eventId: "lifecycle-event-1",
      type: "waiting_for_manual_confirmation",
      lifecycleId: "lifecycle-1",
      intentId: "intent-lifecycle",
      recommendationId: "rec-lifecycle",
      positionId: "position-lifecycle",
      broker: "avanza",
      handoffStatus: "ready",
    });
  });

  test("locks execution record store missing key, append, read, filtering, malformed JSON, clear, and bounding behavior", () => {
    const storage = installWindowWithStorage();

    expect(readExecutionRecordStoreResult()).toEqual({
      records: [],
      discardedCount: 0,
      storageAvailable: true,
      error: null,
    });

    expect(appendExecutionRecord(createStoredRecord(1))).toBe(true);
    expect(appendExecutionRecords([createStoredRecord(2), createStoredRecord(3)])).toBe(true);
    expect(appendExecutionRecords([{ ...createStoredRecord(4), recordId: "" }])).toBe(false);

    expect(readExecutionRecordStoreResult().records.map((record) => record.recordId)).toEqual([
      "record-1",
      "record-2",
      "record-3",
    ]);
    expect(getExecutionRecordsForIntent("intent-1").map((record) => record.recordId)).toEqual([
      "record-1",
      "record-3",
    ]);
    expect(getExecutionRecordsForRecommendation("rec-2").map((record) => record.recordId)).toEqual([
      "record-2",
    ]);
    expect(getExecutionRecordsForPosition("position-3").map((record) => record.recordId)).toEqual([
      "record-3",
    ]);

    setStoredJson(storage, EXECUTION_RECORD_STORE_KEY, [
      createStoredRecord(5),
      { recordId: "bad-record", broker: "avanza", createdAt: "bad-date" },
      null,
    ]);
    const filtered = readExecutionRecordStoreResult();
    expect(filtered.records.map((record) => record.recordId)).toEqual(["record-5"]);
    expect(filtered.discardedCount).toBe(2);

    storage.setItem(EXECUTION_RECORD_STORE_KEY, "{");
    const malformed = readExecutionRecordStoreResult();
    expect(malformed.records).toEqual([]);
    expect(malformed.storageAvailable).toBe(true);
    expect(malformed.error).toContain("Expected");

    expect(appendExecutionRecords(
      Array.from({ length: MAX_STORED_EXECUTION_RECORDS + 1 }, (_, index) =>
        createStoredRecord(index + 1),
      ),
    )).toBe(true);
    const stored = JSON.parse(storage.getItem(EXECUTION_RECORD_STORE_KEY) ?? "[]") as Array<{
      recordId: string;
    }>;
    expect(stored).toHaveLength(MAX_STORED_EXECUTION_RECORDS);
    expect(stored[0].recordId).toBe("record-2");

    expect(clearExecutionRecords()).toBe(true);
    expect(storage.getItem(EXECUTION_RECORD_STORE_KEY)).toBe("[]");
  });

  test("locks dev mock broker result store append, read, filtering, malformed JSON, remove-clear, and bounding behavior", () => {
    const storage = installWindowWithStorage();

    expect(readDevMockBrokerResultStoreResult()).toEqual({
      results: [],
      discardedCount: 0,
      storageAvailable: true,
      error: null,
    });

    expect(appendDevMockBrokerResult(createDevMockResult(1))).toBe(true);
    expect(appendDevMockBrokerResult(createDevMockResult(2))).toBe(true);
    expect(appendDevMockBrokerResult({ ...createDevMockResult(3), source: "bad" as "mock_broker" })).toBe(false);

    expect(readDevMockBrokerResultStoreResult().results.map((result) => result.orderId)).toEqual([
      "mock-order-1",
      "mock-order-2",
    ]);
    expect(getDevMockBrokerResultsForRequest("request-1").map((result) => result.orderId)).toEqual([
      "mock-order-1",
    ]);
    expect(getDevMockBrokerResultsForIntent("intent-0").map((result) => result.orderId)).toEqual([
      "mock-order-2",
    ]);
    expect(getDevMockBrokerResultsForPosition("position-2").map((result) => result.orderId)).toEqual([
      "mock-order-2",
    ]);
    expect(getDevMockBrokerResultsForRecommendation("rec-1").map((result) => result.orderId)).toEqual([
      "mock-order-1",
    ]);

    setStoredJson(storage, DEV_MOCK_BROKER_RESULT_STORAGE_KEY, [
      createDevMockResult(4),
      { source: "mock_broker", isMock: false, createdAt: "2026-06-27T10:00:00.000Z" },
    ]);
    const filtered = readDevMockBrokerResultStoreResult();
    expect(filtered.results.map((result) => result.orderId)).toEqual(["mock-order-4"]);
    expect(filtered.discardedCount).toBe(1);

    storage.setItem(DEV_MOCK_BROKER_RESULT_STORAGE_KEY, "{");
    const malformed = readDevMockBrokerResultStoreResult();
    expect(malformed.results).toEqual([]);
    expect(malformed.error).toContain("Expected");

    expect(appendDevMockBrokerResult(createDevMockResult(1))).toBe(true);
    expect(appendDevMockBrokerResult(
      createDevMockResult(MAX_STORED_DEV_MOCK_BROKER_RESULTS + 1),
    )).toBe(true);
    expect(appendDevMockBrokerResult(
      createDevMockResult(MAX_STORED_DEV_MOCK_BROKER_RESULTS + 2),
    )).toBe(true);
    const bounded = Array.from({ length: MAX_STORED_DEV_MOCK_BROKER_RESULTS + 1 }, (_, index) =>
      createDevMockResult(index + 1),
    );
    storage.setItem(DEV_MOCK_BROKER_RESULT_STORAGE_KEY, "[]");
    expect(
      bounded.every((result) => appendDevMockBrokerResult(result)),
    ).toBe(true);
    const stored = JSON.parse(storage.getItem(DEV_MOCK_BROKER_RESULT_STORAGE_KEY) ?? "[]") as Array<{
      orderId: string;
    }>;
    expect(stored).toHaveLength(MAX_STORED_DEV_MOCK_BROKER_RESULTS);
    expect(stored[0].orderId).toBe("mock-order-2");

    expect(clearDevMockBrokerResults()).toBe(true);
    expect(storage.getItem(DEV_MOCK_BROKER_RESULT_STORAGE_KEY)).toBeNull();
  });

  test("locks unavailable browser/localStorage handling for all dedicated stores", () => {
    uninstallWindow();

    expect(readExecutionEventLog()).toEqual({
      events: [],
      discardedCount: 0,
      storageAvailable: false,
      error: null,
    });
    expect(appendExecutionAuditEvent(createAuditEvent(1))).toBe(false);
    expect(clearExecutionAuditEvents()).toBe(false);

    expect(readExecutionRecordStoreResult()).toEqual({
      records: [],
      discardedCount: 0,
      storageAvailable: false,
      error: null,
    });
    expect(appendExecutionRecord(createStoredRecord(1))).toBe(false);
    expect(clearExecutionRecords()).toBe(false);

    expect(readDevMockBrokerResultStoreResult()).toEqual({
      results: [],
      discardedCount: 0,
      storageAvailable: false,
      error: null,
    });
    expect(appendDevMockBrokerResult(createDevMockResult(1))).toBe(false);
    expect(clearDevMockBrokerResults()).toBe(false);
  });

  test("locks inventoried adjacent localStorage readers without extracting inline app/settings behavior", () => {
    const storage = installWindowWithStorage();

    expect(readTradeManagementEvents()).toEqual([]);
    setStoredJson(storage, TRADE_MANAGEMENT_EVENTS_STORAGE_KEY, [
      {
        type: "execution_payload_generated" satisfies ExecutionTimelineEventType,
        payload_id: "payload-baseline",
        timestamp: "2026-06-27T12:00:00.000Z",
      },
    ]);
    expect(readTradeManagementEvents()).toEqual([
      {
        type: "execution_payload_generated",
        payload_id: "payload-baseline",
        timestamp: "2026-06-27T12:00:00.000Z",
      },
    ]);
    storage.setItem(TRADE_MANAGEMENT_EVENTS_STORAGE_KEY, "{");
    expect(readTradeManagementEvents()).toEqual([]);

    expect(storage.getItem(EXECUTION_MODE_STORAGE_KEY)).toBeNull();
    expect(DEFAULT_EXECUTION_MODE).toBe("semi_automatic");

    expect(readLatestMockBrokerFillRaw()).toBeNull();
    storage.setItem(TRADE_MOCK_BROKER_LATEST_FILL_STORAGE_KEY, "mock fill");
    expect(readLatestMockBrokerFillRaw()).toBe("mock fill");
  });

  test("locks client-safe/local-only boundary for storage modules and existing modal helper wiring", () => {
    for (const path of storageBackedModules) {
      const source = read(path);

      for (const fragment of forbiddenStorageModuleFragments) {
        expect(source, `${path} must not contain ${fragment}`).not.toContain(fragment);
      }
    }

    for (const path of clientBoundaryModules) {
      const source = read(path);

      expect(source).not.toContain("public.execution_record_audit_events");
      expect(source).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    }

    const settingsSource = read(settingsPath);
    const hookSource = read(localPersistenceViewersHookPath);
    expect(settingsSource).toContain("useExecutionLocalPersistenceViewers");
    expect(hookSource).toContain("readExecutionEventLog");
    expect(hookSource).toContain("clearExecutionAuditEvents");
    expect(hookSource).toContain("readExecutionRecordStoreResult");
    expect(hookSource).toContain("clearExecutionRecords");
    expect(hookSource).toContain("readDevMockBrokerResultStoreResult");
    expect(hookSource).toContain("clearDevMockBrokerResults");
    expect(settingsSource).toContain(
      'from "@/components/execution/execution-audit-log-viewer"',
    );
    expect(settingsSource).toContain(
      'from "@/components/execution/execution-local-records-viewer"',
    );
    expect(settingsSource).toContain("<ExecutionAuditLogViewer");
    expect(settingsSource).toContain("<ExecutionLocalRecordsViewer");
    expect(settingsSource).toContain("onRefresh={refreshExecutionEventLog}");
    expect(settingsSource).toContain("onClear={clearExecutionEventLog}");
    expect(settingsSource).toContain("onRefresh={refreshExecutionRecords}");
    expect(settingsSource).toContain("onClear={clearLocalExecutionRecords}");
    expect(settingsSource).not.toContain("function ExecutionEventLogPanel");
    expect(settingsSource).not.toContain("function ExecutionRecordsPanel");
    expect(settingsSource).not.toContain("function DevMockBrokerResultsPanel");
    expect(settingsSource).toContain(
      'from "@/components/execution/execution-dev-mock-broker-results-panel"',
    );
    expect(read(devMockBrokerResultsPanelPath)).toContain(
      "export function DevMockBrokerResultsPanel",
    );

    const executionAuditLogViewerSource = read(executionAuditLogViewerPath);
    expect(executionAuditLogViewerSource).toContain(
      "export function ExecutionAuditLogViewer",
    );
    expect(executionAuditLogViewerSource).toContain("Execution Event Log");
    expect(executionAuditLogViewerSource).toContain(
      "Local browser audit data for execution handoff diagnostics.",
    );
    expect(executionAuditLogViewerSource).toContain(
      "clear removes only execution audit events.",
    );
    expect(executionAuditLogViewerSource).toContain("onClick={onRefresh}");
    expect(executionAuditLogViewerSource).toContain("onClick={onClear}");
    expect(executionAuditLogViewerSource).not.toContain("localStorage");
    expect(executionAuditLogViewerSource).not.toContain("appendExecutionAudit");
    expect(executionAuditLogViewerSource).not.toContain(
      "clearExecutionAuditEvents",
    );

    const executionLocalRecordsViewerSource = read(executionLocalRecordsViewerPath);
    expect(executionLocalRecordsViewerSource).toContain(
      "export function ExecutionLocalRecordsViewer",
    );
    expect(executionLocalRecordsViewerSource).toContain("Execution Records");
    expect(executionLocalRecordsViewerSource).toContain(
      "Stub/dev records are not proof of",
    );
    expect(executionLocalRecordsViewerSource).toContain(
      "clear removes only the",
    );
    expect(executionLocalRecordsViewerSource).toContain("onClick={onRefresh}");
    expect(executionLocalRecordsViewerSource).toContain("onClick={onClear}");
    expect(executionLocalRecordsViewerSource).not.toContain("localStorage");
    expect(executionLocalRecordsViewerSource).not.toContain(
      "appendExecutionRecord",
    );
    expect(executionLocalRecordsViewerSource).not.toContain(
      "clearExecutionRecords",
    );

    const modalHelperSource = read(modalHelperPath);
    for (const fragment of forbiddenModalHelperFragments) {
      expect(modalHelperSource).not.toContain(fragment);
    }

    const handoffPreviewModalSource = read(handoffPreviewModalPath);
    expect(handoffPreviewModalSource).toContain("appendExecutionAuditEvents");
    expect(handoffPreviewModalSource).toContain("appendExecutionRecord");
    const tradeAppSource = read(tradeAppPath);
    expect(tradeAppSource).toContain("TRADE_MANAGEMENT_EVENTS_STORAGE_KEY");
  });
});
