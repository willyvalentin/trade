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
  readDevMockBrokerResultStoreResult,
} from "../../lib/dev-mock-broker-result-store";
import type { DevMockBrokerExecutionResult } from "../../lib/mock-broker-execution-result";

const root = process.cwd();
const settingsPath = join(root, "app/settings/page.tsx");
const devMockStorePath = join(root, "lib/dev-mock-broker-result-store.ts");
const localStorageHelperPath = join(root, "lib/execution-local-storage-helpers.ts");
const executionAuditLogViewerPath = join(
  root,
  "components/execution/execution-audit-log-viewer.tsx",
);
const executionLocalRecordsViewerPath = join(
  root,
  "components/execution/execution-local-records-viewer.tsx",
);
const executionSettingsPanelPath = join(
  root,
  "components/execution/execution-settings-panel.tsx",
);
const handoffPreviewModalPath = join(
  root,
  "components/execution/execution-handoff-preview-modal.tsx",
);
const sandboxFixtureCardPath = join(
  root,
  "components/execution/execution-sandbox-fixture-card.tsx",
);
const livePositionExecutionStatusSurfacePath = join(
  root,
  "components/execution/live-position-execution-status-surface.tsx",
);
const livePositionHandoffControlsPath = join(
  root,
  "components/execution/live-position-handoff-controls.tsx",
);
const devMockBrokerResultsPanelPath = join(
  root,
  "components/execution/execution-dev-mock-broker-results-panel.tsx",
);
const localPersistenceViewersHookPath = join(
  root,
  "hooks/execution/useExecutionLocalPersistenceViewers.ts",
);

const forbiddenClientBoundaryFragments = [
  "server-only",
  "execution-record-audit-writer",
  "execution-lifecycle-transition-service",
  "transitionExecutionLifecycleOnServer",
  "transitionExecutionLifecycleAndAppendAuditEvent",
  "SUPABASE_SERVICE_ROLE",
  "SUPABASE_SERVICE_ROLE_KEY",
  "createClient",
  "public.execution_record_audit_events",
  "/api/execution/audit/writer",
  ".insert(",
  ".update(",
  ".delete(",
  ".upsert(",
  ".select(",
];

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
    this.values.set(key, value);
  }

  snapshot() {
    return Object.fromEntries(this.values);
  }
}

function read(path: string) {
  return readFileSync(path, "utf8");
}

function sourceSlice(source: string, startNeedle: string, endNeedle: string) {
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start + startNeedle.length);

  expect(start, `missing ${startNeedle}`).toBeGreaterThanOrEqual(0);
  expect(end, `missing ${endNeedle}`).toBeGreaterThan(start);

  return source.slice(start, end);
}

function compactSource(source: string) {
  return source.replace(/\s+/g, " ");
}

function installWindowWithStorage() {
  const storage = new MemoryStorage();

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: storage,
    },
  });

  return storage;
}

function uninstallWindow() {
  Reflect.deleteProperty(globalThis, "window");
}

function createDevMockResult(
  index: number,
  overrides: Partial<DevMockBrokerExecutionResult> = {},
): DevMockBrokerExecutionResult {
  return {
    source: "mock_broker",
    isMock: true,
    createdAt: `2026-06-27T12:${String(index).padStart(2, "0")}:00.000Z`,
    status: index % 2 === 0 ? "submitted" : "filled",
    ticker: `TURE${index}`,
    action: index % 2 === 0 ? "buy" : "sell",
    quantity: 10 + index,
    requestedPrice: 100 + index,
    executedPrice: 101 + index,
    orderId: `mock-order-${index}`,
    requestId: `request-${index % 2}`,
    intentId: `intent-${index % 2}`,
    positionId: `position-${index % 2}`,
    recommendationId: `recommendation-${index % 2}`,
    message: `Mock broker result ${index}`,
    rawPayload: {
      action: index % 2 === 0 ? "buy" : "sell",
      ticker: `TURE${index}`,
      quantity: String(10 + index),
      requestedPrice: String(100 + index),
      executedPrice: String(101 + index),
      account: "ISK",
      amountExcludingFees: String((101 + index) * (10 + index)),
      courtage: "1",
      fxFee: "0",
      preliminaryFxRate: "10.50",
      validUntil: "2026-06-27",
      totalAmount: String((101 + index) * (10 + index) + 1),
      priceCurrency: "USD",
      instrumentMarket: "NASDAQ",
      instrumentCurrency: "USD",
      instrumentType: "stock",
      orderMode: "mock",
      reviewButtonLabel: "Granska",
      confirmButtonLabel: "Kop",
      cancelButtonLabel: "Avbryt",
      status: index % 2 === 0 ? "submitted" : "filled",
      orderId: `mock-order-${index}`,
      requestId: `request-${index % 2}`,
      intentId: `intent-${index % 2}`,
      positionId: `position-${index % 2}`,
      recommendationId: `recommendation-${index % 2}`,
      message: `Mock broker result ${index}`,
    },
    warnings: index === 2 ? ["fixture warning"] : [],
    errors: [],
    ...overrides,
  };
}

test.afterEach(() => {
  uninstallWindow();
});

test.describe("dev mock broker controls baseline", () => {
  test("keeps the extracted dev mock broker results panel wired with parent-owned callbacks", () => {
    const settingsSource = read(settingsPath);
    const panelSource = read(devMockBrokerResultsPanelPath);
    const hookSource = read(localPersistenceViewersHookPath);

    expect(settingsSource).not.toContain("function DevMockBrokerResultsPanel");
    expect(settingsSource).not.toContain("function DevMockBrokerResultRow");
    expect(settingsSource).toContain(
      'from "@/components/execution/execution-dev-mock-broker-results-panel"',
    );
    expect(settingsSource).toContain("<DevMockBrokerResultsPanel");
    expect(settingsSource).toContain("readResult={devMockBrokerResultStore}");
    expect(settingsSource).toContain("visibleResults={latestDevMockBrokerResults}");
    expect(settingsSource).toContain(
      "latestTimestamp={latestDevMockBrokerResultTimestamp}",
    );
    expect(settingsSource).toContain("executionRecords={executionRecordStore.records}");
    expect(settingsSource).toContain("message={devMockBrokerResultStoreMessage}");
    expect(settingsSource).toContain("onRefresh={refreshDevMockBrokerResults}");
    expect(settingsSource).toContain("onClear={clearLocalDevMockBrokerResults}");
    expect(settingsSource).toContain(
      "onCaptureComplete={refreshAfterDevMockBrokerCapture}",
    );
    expect(settingsSource).toContain("useExecutionLocalPersistenceViewers");
    expect(hookSource).toContain("setDevMockBrokerResultStore(");
    expect(hookSource).toContain("setDevMockBrokerResultStoreMessage(");
    expect(hookSource).toContain("readDevMockBrokerResultsForViewers()");
    expect(hookSource).toContain("clearDevMockBrokerResults()");
    expect(panelSource).toContain("export function DevMockBrokerResultsPanel");
    expect(panelSource).toContain("function DevMockBrokerResultRow");
  });

  test("locks current panel title, labels, empty state, parse state, and local-only copy", () => {
    const panelComponentSource = read(devMockBrokerResultsPanelPath);
    const panelSource = sourceSlice(
      panelComponentSource,
      "export function DevMockBrokerResultsPanel",
      "function DevMockBrokerResultRow",
    );
    const compactPanelSource = compactSource(panelSource);

    expect(panelSource).toContain("Dev Mock Broker Results");
    expect(panelSource).toContain("Refresh");
    expect(panelSource).toContain("Clear dev mock results");
    expect(panelSource).toContain("Total Results");
    expect(panelSource).toContain("Latest Result");
    expect(panelSource).toContain("Storage");
    expect(panelSource).toContain("Local browser");
    expect(panelSource).toContain("Unavailable");
    expect(compactPanelSource).toContain(
      "Local mock results parsed from mock confirmation pages.",
    );
    expect(compactPanelSource).toContain("Not real BrokerExecutionResult.");
    expect(compactPanelSource).toContain("Not broker confirmations.");
    expect(compactPanelSource).toContain(
      "Refresh reads only the dev mock broker result key; clear removes only",
    );
    expect(compactPanelSource).toContain(
      "that mock diagnostics key and does not affect execution records.",
    );
    expect(panelSource).toContain(
      "Dev mock broker results could not be parsed safely:",
    );
    expect(compactPanelSource).toContain(
      "Ignored {readResult.discardedCount} malformed dev mock broker result",
    );
    expect(panelSource).toContain(
      "No local dev mock broker results are stored in this browser yet.",
    );
  });

  test("locks current row summary fields, server stub copy, local capture copy, and preview copy", () => {
    const panelComponentSource = read(devMockBrokerResultsPanelPath);
    const rowSource = sourceSlice(
      panelComponentSource,
      "function DevMockBrokerResultRow",
      "function AuditDetail",
    );
    const compactRowSource = compactSource(rowSource);

    for (const fragment of [
      "Mock result",
      "Not mock",
      "Not BrokerExecutionResult",
      "Dev mock broker result stored without real broker confirmation.",
      'label="Status"',
      'label="Ticker"',
      'label="Action"',
      'label="Quantity"',
      'label="Requested"',
      'label="Executed"',
      'label="Order"',
      'label="Request"',
      'label="Intent"',
      'label="Position"',
      'label="Recommendation"',
      'label="Source"',
      'label="isMock"',
      'label="Errors"',
      'label="Warnings"',
      "Server capture route stub",
      "Dev-only route validation. No Supabase write. No trade update.",
      "Test server capture stub",
      "Route stub validation only. No Supabase write, execution record,",
      "Local capture test",
      "Creates a local TureExecutionRecord from dev mock data only.",
      "Duplicate guard checks localStorage only and is not broker order dedupe.",
      "Capture mock result locally",
      "Captured locally",
      "View in Execution Records diagnostics. No real broker",
      "Dev mock result details",
      "BrokerExecutionResult preview",
      "Preview only - not saved, not real, not TureExecutionRecord.",
    ]) {
      expect(compactRowSource).toContain(fragment);
    }
  });

  test("preserves dev mock broker result store helper behavior used by the panel", () => {
    const storage = installWindowWithStorage();

    expect(readDevMockBrokerResultStoreResult()).toEqual({
      results: [],
      discardedCount: 0,
      storageAvailable: true,
      error: null,
    });

    expect(appendDevMockBrokerResult(createDevMockResult(1))).toBe(true);
    expect(appendDevMockBrokerResult(createDevMockResult(2))).toBe(true);

    const readResult = readDevMockBrokerResultStoreResult();
    expect(readResult.results.map((result) => result.orderId)).toEqual([
      "mock-order-1",
      "mock-order-2",
    ]);
    expect(getDevMockBrokerResultsForRequest("request-1")).toHaveLength(1);
    expect(getDevMockBrokerResultsForIntent("intent-0")).toHaveLength(1);
    expect(getDevMockBrokerResultsForPosition("position-1")).toHaveLength(1);
    expect(getDevMockBrokerResultsForRecommendation("recommendation-0")).toHaveLength(1);

    storage.setItem(DEV_MOCK_BROKER_RESULT_STORAGE_KEY, "{");
    const malformed = readDevMockBrokerResultStoreResult();
    expect(malformed.results).toEqual([]);
    expect(malformed.storageAvailable).toBe(true);
    expect(malformed.error).toContain("Expected");

    expect(clearDevMockBrokerResults()).toBe(true);
    expect(storage.snapshot()).not.toHaveProperty(DEV_MOCK_BROKER_RESULT_STORAGE_KEY);
  });

  test("keeps local capture and server capture stub behavior distinct from live persistence", () => {
    const panelComponentSource = read(devMockBrokerResultsPanelPath);
    const rowSource = sourceSlice(
      panelComponentSource,
      "function DevMockBrokerResultRow",
      "function AuditDetail",
    );

    expect(rowSource).toContain("appendExecutionRecord({");
    expect(rowSource).toContain("appendExecutionAuditEvent(");
    expect(rowSource).toContain('type: "dev_mock_broker_capture_stub"');
    expect(rowSource).toContain("local_diagnostics_only: true");
    expect(rowSource).toContain("no_supabase_write: true");
    expect(rowSource).toContain("no_trade_mutation: true");
    expect(rowSource).toContain("no_history_statistics_update: true");
    expect(rowSource).toContain("postExecutionServerCaptureRequest(captureRequest)");
    expect(rowSource).toContain("no_supabase_write_expected: true");
    expect(rowSource).toContain("no_trade_mutation_expected: true");
    expect(rowSource).toContain("no_execution_record_expected: true");
    expect(rowSource).not.toContain("/api/execution/audit/writer");
    expect(rowSource).not.toContain("public.execution_record_audit_events");
    expect(rowSource).not.toContain("insertExecutionRecordAuditEventWithServiceRole");
  });

  test("keeps the dev mock panel client-safe and free of server audit writer boundaries", () => {
    const panelComponentSource = read(devMockBrokerResultsPanelPath);
    const panelAndRowSource = sourceSlice(
      panelComponentSource,
      "export function DevMockBrokerResultsPanel",
      "function AuditDetail",
    );
    const devMockStoreSource = read(devMockStorePath);
    const localStorageHelperSource = read(localStorageHelperPath);

    for (const fragment of forbiddenClientBoundaryFragments) {
      expect(panelAndRowSource, `panel/row must not contain ${fragment}`).not.toContain(fragment);
      expect(devMockStoreSource, `store must not contain ${fragment}`).not.toContain(fragment);
    }

    expect(devMockStoreSource).toContain("getBrowserExecutionLocalStorage()");
    expect(devMockStoreSource).toContain("readDevMockBrokerResultEntries");
    expect(devMockStoreSource).toContain("appendDevMockBrokerResultEntries");
    expect(devMockStoreSource).toContain("clearDevMockBrokerResultEntries");
    expect(localStorageHelperSource).toContain("DEV_MOCK_BROKER_RESULT_STORAGE_KEY");
    expect(localStorageHelperSource).toContain("readDevMockBrokerResultEntries");
    expect(localStorageHelperSource).toContain("appendDevMockBrokerResultEntry");
    expect(localStorageHelperSource).toContain("clearDevMockBrokerResultEntries");
  });

  test("keeps broker Avanza and automatic-order authority absent from dev mock controls", () => {
    const panelComponentSource = read(devMockBrokerResultsPanelPath);
    const panelAndRowSource = sourceSlice(
      panelComponentSource,
      "export function DevMockBrokerResultsPanel",
      "function AuditDetail",
    );

    expect(panelAndRowSource).toContain("Not real broker execution");
    expect(panelAndRowSource).toContain("No real broker");
    expect(panelAndRowSource).toContain("No Supabase write");
    expect(panelAndRowSource).not.toMatch(
      /allowAutomaticFinalSubmit|supportsAutomaticSubmit|click_buy|click_sell|confirm_order|submit_order|automatic_ready|broker_result_created/i,
    );
    expect(panelAndRowSource).not.toContain("isAutomaticExecutionModeFeatureEnabled");
    expect(panelAndRowSource).not.toContain("createAvanzaAgentBridgeFromConfig");
    expect(panelAndRowSource).not.toContain("isRealAvanzaAgentBridge");
  });

  test("keeps previously extracted execution UI components intact with dev mock controls extracted", () => {
    const settingsSource = read(settingsPath);

    expect(read(executionAuditLogViewerPath)).toContain(
      "export function ExecutionAuditLogViewer",
    );
    expect(read(executionLocalRecordsViewerPath)).toContain(
      "export function ExecutionLocalRecordsViewer",
    );
    expect(read(executionSettingsPanelPath)).toContain(
      "export function ExecutionSettingsPanel",
    );
    expect(read(handoffPreviewModalPath)).toContain(
      "export function ExecutionHandoffPreviewModal",
    );
    expect(read(sandboxFixtureCardPath)).toContain(
      "export function ExecutionSandboxFixtureCard",
    );
    expect(read(livePositionExecutionStatusSurfacePath)).toContain(
      "export function LivePositionExecutionStatusSurface",
    );
    expect(read(livePositionHandoffControlsPath)).toContain(
      "export function LivePositionHandoffControls",
    );
    expect(read(devMockBrokerResultsPanelPath)).toContain(
      "export function DevMockBrokerResultsPanel",
    );
    expect(settingsSource).toContain(
      'from "@/components/execution/execution-dev-mock-broker-results-panel"',
    );
  });
});
