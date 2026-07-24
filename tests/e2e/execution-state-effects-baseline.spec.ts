import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  getExecutionAuthorityForMode,
  getExecutionTriggerPriority,
  type ExecutionAction,
  type ExecutionIntent,
  type ExecutionMode,
  type ExecutionTriggerType,
} from "../../lib/execution";
import { buildExecutionLifecycleUiState } from "../../lib/execution-lifecycle-ui-state-adapter";
import {
  applyExecutionCaptureResult,
  applyExecutionPrepareResult,
  buildExecutionModalDebugSummary,
  closeExecutionModalState,
  createClosedExecutionModalState,
  openExecutionModalState,
} from "../../lib/execution-modal-state-helpers";
import { runExecutionOrchestrator } from "../../lib/execution-orchestrator";
import {
  createMemoryExecutionSettingsStorage,
  DEFAULT_EXECUTION_MODE,
  EXECUTION_MODE_STORAGE_KEY,
  readExecutionModePreference,
  writeExecutionModePreference,
} from "../../lib/execution-settings-persistence-helpers";

const root = process.cwd();
const tradeAppPath = join(root, "app/trade-app.tsx");
const settingsPath = join(root, "app/settings/page.tsx");
const modalHelperPath = join(root, "lib/execution-modal-state-helpers.ts");
const localStorageHelperPath = join(root, "lib/execution-local-storage-helpers.ts");
const settingsPersistenceHelperPath = join(
  root,
  "lib/execution-settings-persistence-helpers.ts",
);
const lifecycleAdapterPath = join(root, "lib/execution-lifecycle-ui-state-adapter.ts");
const handoffPreviewModalPath = join(
  root,
  "components/execution/execution-handoff-preview-modal.tsx",
);
const sandboxFixtureCardPath = join(
  root,
  "components/execution/execution-sandbox-fixture-card.tsx",
);
const modalStateHookPath = join(root, "hooks/execution/useExecutionModalState.ts");
const localPersistenceViewersHookPath = join(
  root,
  "hooks/execution/useExecutionLocalPersistenceViewers.ts",
);
const settingsStateHookPath = join(
  root,
  "hooks/execution/useExecutionSettingsState.ts",
);
const livePositionHandoffStateHookPath = join(
  root,
  "hooks/execution/useExecutionLivePositionHandoffState.ts",
);
const auditLogViewerPath = join(
  root,
  "components/execution/execution-audit-log-viewer.tsx",
);
const localRecordsViewerPath = join(
  root,
  "components/execution/execution-local-records-viewer.tsx",
);
const settingsPanelPath = join(
  root,
  "components/execution/execution-settings-panel.tsx",
);
const livePositionStatusSurfacePath = join(
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

const clientSafeFragments = [
  "server-only",
  "execution-record-audit-writer",
  "transitionExecutionLifecycleAndAppendAuditEvent",
  "SUPABASE_SERVICE_ROLE",
  "SUPABASE_SERVICE_ROLE_KEY",
  "public.execution_record_audit_events",
  "/api/execution/audit/writer",
];

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

function createIntent(
  overrides: Partial<ExecutionIntent> & {
    action?: ExecutionAction;
    mode?: ExecutionMode;
    trigger_type?: ExecutionTriggerType;
  } = {},
): ExecutionIntent {
  const mode = overrides.mode ?? "semi_automatic";
  const action = overrides.action ?? "buy";
  const triggerType = overrides.trigger_type ?? "entry_recommendation_ready";

  return {
    intent_version: "1.0",
    intent_id: overrides.intent_id ?? `state-effects-${action}-${mode}`,
    created_at: overrides.created_at ?? "2026-06-27T08:00:00.000Z",
    mode,
    authority: overrides.authority ?? getExecutionAuthorityForMode(mode),
    action,
    trigger_type: triggerType,
    trigger_priority:
      overrides.trigger_priority ?? getExecutionTriggerPriority(triggerType),
    broker_hint: "AVANZA",
    source: overrides.source ?? "recommendation",
    trading_package: {
      package_version: "1.0",
      recommendation_id: action === "buy" ? "rec-state-effects-001" : null,
      live_position_id: action === "sell" ? "position-state-effects-001" : null,
      ticker: "TURE",
      market: "US",
      quantity: 10,
      order_type: "limit",
      limit_price: 123.45,
      stop_loss: action === "sell" ? 110 : null,
      target_price: action === "sell" ? 140 : null,
      expires_at: "2026-06-27T20:00:00.000Z",
      payload_id: "payload-state-effects-001",
      payload_fingerprint: "payload-fingerprint-state-effects-001",
      ...overrides.trading_package,
    },
    safety_warnings: overrides.safety_warnings ?? [],
    broker_result: overrides.broker_result ?? null,
    ...overrides,
  };
}

function createResult({
  action = "buy",
  mode = "semi_automatic",
}: {
  action?: ExecutionAction;
  mode?: ExecutionMode;
} = {}) {
  return runExecutionOrchestrator({
    candidateIntents: [createIntent({ action, mode })],
    createdAt: "2026-06-27T08:00:00.000Z",
  });
}

test.describe("execution state/effects baseline", () => {
  test("locks modal closed, sandbox open, live-position open, close/reset, prepare, and capture state shapes", () => {
    const result = createResult();
    const closed = createClosedExecutionModalState();

    expect(closed).toMatchObject({
      isOpen: false,
      source: null,
      selectedIntent: null,
      selectedHandoff: null,
      localLifecycle: null,
      captureBaseLifecycle: null,
      preparation: { status: "idle", message: "", error: "" },
      capture: {
        status: "idle",
        brokerStatus: "submitted",
        executedPrice: "",
        orderId: "",
        brokerTimestamp: "",
        message: "",
        error: "",
      },
    });

    const sandboxOpened = openExecutionModalState({ result, source: "fixture" });
    const liveOpened = openExecutionModalState({
      result,
      source: "live_position",
    });

    expect(sandboxOpened).toMatchObject({
      isOpen: true,
      source: "fixture",
      selectedIntent: { intent_id: "state-effects-buy-semi_automatic" },
      selectedHandoff: { status: "ready", canPrepareOrder: true },
      localLifecycle: { currentState: "handoff_created" },
    });
    expect(liveOpened).toMatchObject({
      isOpen: true,
      source: "live_position",
      selectedIntent: { intent_id: "state-effects-buy-semi_automatic" },
      selectedHandoff: { status: "ready" },
      localLifecycle: { currentState: "handoff_created" },
    });
    expect(closeExecutionModalState()).toEqual(closed);

    const preparePending = applyExecutionPrepareResult(sandboxOpened, {
      status: "pending",
      message: "Preparing.",
    });
    expect(preparePending.preparation).toEqual({
      status: "pending",
      message: "Preparing.",
      error: "",
    });

    const prepareFailure = applyExecutionPrepareResult(sandboxOpened, {
      status: "failure",
      message: "Preparation failed.",
      error: "No handoff.",
    });
    expect(prepareFailure.preparation).toEqual({
      status: "failure",
      message: "Preparation failed.",
      error: "No handoff.",
    });

    const prepared = applyExecutionPrepareResult(sandboxOpened, {
      status: "success",
      createdAt: "2026-06-27T08:01:00.000Z",
      followUpCreatedAt: "2026-06-27T08:02:00.000Z",
    });
    expect(prepared).toMatchObject({
      preparation: {
        status: "success",
        message: "Preparation reached manual confirmation.",
        error: "",
      },
      localLifecycle: { currentState: "waiting_for_manual_confirmation" },
      captureBaseLifecycle: { currentState: "waiting_for_manual_confirmation" },
    });

    const capturePending = applyExecutionCaptureResult(prepared, {
      status: "pending",
      message: "Capturing.",
    });
    expect(capturePending.capture).toMatchObject({
      status: "pending",
      message: "Capturing.",
      error: "",
    });

    const captureFailure = applyExecutionCaptureResult(prepared, {
      status: "failure",
      message: "Capture failed.",
      error: "No broker result.",
    });
    expect(captureFailure.capture).toMatchObject({
      status: "failure",
      message: "Capture failed.",
      error: "No broker result.",
    });

    const captured = applyExecutionCaptureResult(prepared, {
      status: "success",
      brokerStatus: "filled",
      executedPrice: "124.50",
      orderId: "order-state-effects-001",
      brokerTimestamp: "2026-06-27T08:03:00.000Z",
    });
    expect(captured).toMatchObject({
      capture: {
        status: "success",
        brokerStatus: "filled",
        executedPrice: "124.50",
        orderId: "order-state-effects-001",
        brokerTimestamp: "2026-06-27T08:03:00.000Z",
        message: "Broker result captured locally.",
        error: "",
      },
      localLifecycle: { currentState: "broker_result_captured" },
    });
    expect(buildExecutionModalDebugSummary(captured)).toMatchObject({
      isOpen: true,
      source: "fixture",
      selectedIntentId: "state-effects-buy-semi_automatic",
      selectedHandoffStatus: "ready",
      lifecycleState: "broker_result_captured",
      preparationStatus: "success",
      captureStatus: "success",
    });
  });

  test("locks parent-owned modal open paths and extracted modal helper wiring without moving JSX", () => {
    const appSource = read(tradeAppPath);
    const fixtureSource = read(sandboxFixtureCardPath);
    const hookSource = read(modalStateHookPath);
    const handoffStateHookSource = read(livePositionHandoffStateHookPath);
    const modalSource = read(handoffPreviewModalPath);
    const liveSource = sourceSlice(
      appSource,
      "function ActivePositionCard",
      "function sellAgentCommandTone",
    );

    expect(fixtureSource).toContain("useExecutionModalState");
    expect(fixtureSource).toContain(
      "executionPreviewModal.openFromSandbox(orchestratorResult)",
    );
    expect(fixtureSource).toContain("executionPreviewModal.isOpen &&");
    expect(fixtureSource).toContain(
      "executionPreviewModal.selectedResult?.selectedIntent",
    );
    expect(fixtureSource).toContain("result: executionPreviewModal.selectedResult");
    expect(fixtureSource).toContain(
      "const closeExecutionPreviewModal = executionPreviewModal.close;",
    );
    expect(fixtureSource).not.toContain("setIsExecutionPreviewOpen(true)");

    expect(liveSource).toContain("useExecutionLivePositionHandoffState");
    expect(liveSource).not.toContain("useExecutionModalState");
    expect(liveSource).not.toContain(
      "executionPreviewModal.openFromLivePosition(liveExecutionOrchestratorResult)",
    );
    expect(handoffStateHookSource).toContain("useExecutionModalState()");
    expect(handoffStateHookSource).toContain(
      "executionPreviewModal.openFromLivePosition(liveExecutionOrchestratorResult)",
    );
    expect(liveSource).toContain("executionPreviewModal.isOpen &&");
    expect(liveSource).toContain(
      "executionPreviewModal.selectedResult?.selectedIntent",
    );
    expect(liveSource).toContain("result={executionPreviewModal.selectedResult}");
    expect(liveSource).not.toContain(
      "const closeExecutionPreviewModal = executionPreviewModal.close;",
    );
    expect(handoffStateHookSource).toContain(
      "closeExecutionPreviewModal: executionPreviewModal.close",
    );
    expect(liveSource).toContain("<ExecutionHandoffPreviewModal");
    expect(liveSource).toContain("onClose={closeExecutionPreviewModal}");
    expect(liveSource).not.toContain("setIsExecutionPreviewOpen(true)");
    expect(hookSource).toContain("openExecutionModalState({ result, source })");
    expect(hookSource).toContain("closeExecutionModalState()");
    expect(hookSource).toContain("openFromSandbox");
    expect(hookSource).toContain("openFromLivePosition");

    expect(modalSource).toContain("applyExecutionPrepareResult");
    expect(modalSource).toContain("applyExecutionCaptureResult");
    expect(modalSource).toContain("modalStateForHelper()");
    expect(appSource).not.toContain("function ExecutionHandoffPreviewModal");
  });

  test("locks local persistence viewer state boundaries as hook-owned callbacks", () => {
    const settingsSource = read(settingsPath);
    const hookSource = read(localPersistenceViewersHookPath);
    const auditLogViewerSource = read(auditLogViewerPath);
    const localRecordsViewerSource = read(localRecordsViewerPath);
    const devMockPanelSource = read(devMockBrokerResultsPanelPath);

    expect(settingsSource).toContain("useExecutionLocalPersistenceViewers");
    expect(settingsSource).toContain(
      "const executionLocalPersistenceViewers =",
    );
    expect(settingsSource).toContain("refreshExecutionEventLog");
    expect(settingsSource).toContain("clearExecutionEventLog");
    expect(settingsSource).toContain("refreshExecutionRecords");
    expect(settingsSource).toContain("clearLocalExecutionRecords");
    expect(settingsSource).toContain("refreshDevMockBrokerResults");
    expect(settingsSource).toContain("clearLocalDevMockBrokerResults");
    expect(settingsSource).toContain("refreshAfterDevMockBrokerCapture");

    expect(hookSource).toContain("function refreshExecutionEventLog()");
    expect(hookSource).toContain("setExecutionEventLog(readExecutionEventLogForViewers())");
    expect(hookSource).toContain("function clearExecutionEventLog()");
    expect(hookSource).toContain("clearExecutionAuditEvents()");
    expect(hookSource).toContain("function refreshExecutionRecords()");
    expect(hookSource).toContain("setExecutionRecordStore(readExecutionRecordsForViewers())");
    expect(hookSource).toContain("function clearLocalExecutionRecords()");
    expect(hookSource).toContain("clearExecutionRecords()");
    expect(hookSource).toContain("function refreshDevMockBrokerResults()");
    expect(hookSource).toContain("function clearLocalDevMockBrokerResults()");
    expect(hookSource).toContain("clearDevMockBrokerResults()");
    expect(hookSource).toContain("function refreshAfterDevMockBrokerCapture()");
    expect(hookSource).toContain("setExecutionEventLog(readExecutionEventLogForViewers())");
    expect(hookSource).toContain("setExecutionRecordStore(readExecutionRecordsForViewers())");
    expect(settingsSource).toContain("<ExecutionAuditLogViewer");
    expect(settingsSource).toContain("onRefresh={refreshExecutionEventLog}");
    expect(settingsSource).toContain("onClear={clearExecutionEventLog}");
    expect(settingsSource).toContain("<ExecutionLocalRecordsViewer");
    expect(settingsSource).toContain("onRefresh={refreshExecutionRecords}");
    expect(settingsSource).toContain("onClear={clearLocalExecutionRecords}");
    expect(settingsSource).toContain("onCaptureComplete={refreshAfterDevMockBrokerCapture}");

    expect(auditLogViewerSource).toContain("onRefresh: () => void");
    expect(auditLogViewerSource).toContain("onClear: () => void");
    expect(auditLogViewerSource).toContain("onClick={onRefresh}");
    expect(auditLogViewerSource).toContain("onClick={onClear}");
    expect(auditLogViewerSource).not.toContain("clearExecutionAuditEvents");
    expect(auditLogViewerSource).not.toContain("readExecutionEventLogForSettings");

    expect(localRecordsViewerSource).toContain("onRefresh: () => void");
    expect(localRecordsViewerSource).toContain("onClear: () => void");
    expect(localRecordsViewerSource).toContain("onClick={onRefresh}");
    expect(localRecordsViewerSource).toContain("onClick={onClear}");
    expect(localRecordsViewerSource).not.toContain("clearExecutionRecords");
    expect(localRecordsViewerSource).not.toContain("readExecutionRecordsForSettings");

    expect(devMockPanelSource).toContain("onRefresh: () => void");
    expect(devMockPanelSource).toContain("onClear: () => void");
    expect(devMockPanelSource).toContain("onCaptureComplete: () => void");
    expect(devMockPanelSource).toContain("onClick={onRefresh}");
    expect(devMockPanelSource).toContain("onClick={onClear}");
    expect(devMockPanelSource).toContain("onCaptureComplete()");
  });

  test("locks execution settings persistence defaults, automatic gate, save error, and panel callback boundary", () => {
    const storage = createMemoryExecutionSettingsStorage();
    const settingsSource = read(settingsPath);
    const settingsStateHookSource = read(settingsStateHookPath);
    const panelSource = read(settingsPanelPath);

    expect(EXECUTION_MODE_STORAGE_KEY).toBe("ture_execution_mode");
    expect(DEFAULT_EXECUTION_MODE).toBe("semi_automatic");
    expect(readExecutionModePreference(storage)).toMatchObject({
      mode: "semi_automatic",
      storedValue: null,
      storageAvailable: true,
      error: null,
      automaticEnabled: false,
    });

    expect(writeExecutionModePreference(storage, "automatic")).toMatchObject({
      written: true,
      mode: "automatic",
      storageAvailable: true,
      error: null,
    });
    expect(readExecutionModePreference(storage)).toMatchObject({
      mode: "semi_automatic",
      storedValue: "automatic",
      automaticEnabled: false,
    });
    expect(
      readExecutionModePreference(storage, { automaticEnabled: true }),
    ).toMatchObject({
      mode: "automatic",
      storedValue: "automatic",
      automaticEnabled: true,
    });

    const throwingStorage = {
      getItem() {
        throw new Error("read denied");
      },
      setItem() {
        throw new Error("write denied");
      },
      removeItem() {
        throw new Error("remove denied");
      },
    };
    expect(readExecutionModePreference(throwingStorage)).toMatchObject({
      mode: "semi_automatic",
      storageAvailable: true,
      error: "read denied",
    });
    expect(writeExecutionModePreference(throwingStorage, "semi_automatic")).toMatchObject({
      written: false,
      mode: "semi_automatic",
      storageAvailable: true,
      error: "write denied",
    });

    expect(settingsSource).toContain("useExecutionSettingsState");
    expect(settingsSource).toContain("const executionSettingsState =");
    expect(settingsSource).toContain(
      "onSelectExecutionMode={updateExecutionModePreference}",
    );
    expect(settingsSource).not.toContain("function updateExecutionModePreference");
    expect(settingsStateHookSource).toContain("function updateExecutionModePreference");
    expect(settingsStateHookSource).toContain(
      "if (nextMode === \"automatic\" && !automaticExecutionEnabled)",
    );
    expect(settingsStateHookSource).toContain("Could not save execution mode locally.");
    expect(settingsStateHookSource).toContain(
      "readStoredExecutionModePreference(getBrowserExecutionSettingsStorage()",
    );
    expect(settingsStateHookSource).toContain("writeStoredExecutionModePreference(");
    expect(settingsSource).toContain("<ExecutionSettingsPanel");
    expect(panelSource).toContain("onSelectExecutionMode: (mode: ExecutionMode) => void");
    expect(panelSource).toContain("onClick={() => onSelectExecutionMode(\"semi_automatic\")}");
    expect(panelSource).toContain("onClick={() => onSelectExecutionMode(\"automatic\")}");
    expect(panelSource).toContain("disabled={!automaticExecutionEnabled}");
    expect(panelSource).not.toContain("readExecutionModePreference");
    expect(panelSource).not.toContain("writeExecutionModePreference");
  });

  test("locks live-position status as read-only and handoff controls as callback-driven", () => {
    const appSource = read(tradeAppPath);
    const activePositionSource = sourceSlice(
      appSource,
      "function ActivePositionCard",
      "function sellAgentCommandTone",
    );
    const handoffStateHookSource = read(livePositionHandoffStateHookPath);
    const statusSurfaceSource = read(livePositionStatusSurfacePath);
    const controlsSource = read(livePositionHandoffControlsPath);
    const result = runExecutionOrchestrator({
      livePositions: [
        {
          positionId: "position-state-effects-001",
          recommendationId: "rec-state-effects-001",
          ticker: "TURE",
          instrumentName: "Ture Baseline",
          quantity: 12,
          currentPrice: 126,
          targetPrice: 125,
          stopLossPrice: 100,
          mode: "semi_automatic",
          createdAt: "2026-06-27T13:30:00.000Z",
        },
      ],
      createdAt: "2026-06-27T13:30:00.000Z",
    });
    const uiState = buildExecutionLifecycleUiState({
      source: "orchestrator",
      result,
    });

    expect(uiState).toMatchObject({
      visible: true,
      title: "Sell action ready",
      cta: {
        type: "prepare_avanza_order",
      },
      canPrepareOrder: true,
      canSubmitFinalOrder: false,
    });
    expect(activePositionSource).toContain("<LivePositionExecutionStatusSurface");
    expect(activePositionSource).toContain("status={liveExecutionStatus}");
    expect(activePositionSource).toContain("<LivePositionHandoffControls");
    expect(activePositionSource).toContain("onViewHandoff={openExecutionPreviewModal}");
    expect(activePositionSource).toContain("useExecutionLivePositionHandoffState");
    expect(activePositionSource).not.toContain("runExecutionOrchestrator({");
    expect(handoffStateHookSource).toContain("runExecutionOrchestrator({");
    expect(handoffStateHookSource).toContain(
      "buildExecutionUiStatusFromOrchestratorResult(",
    );
    expect(handoffStateHookSource).toContain("openFromLivePosition");
    expect(activePositionSource).toContain("onClosePosition(position)");
    expect(statusSurfaceSource).toContain("export function LivePositionExecutionStatusSurface");
    expect(statusSurfaceSource).not.toContain("onViewHandoff");
    expect(statusSurfaceSource).not.toContain("onClosePosition");
    expect(statusSurfaceSource).not.toContain("setIsExecutionPreviewOpen");
    expect(controlsSource).toContain("export function LivePositionHandoffControls");
    expect(controlsSource).toContain("onViewHandoff: () => void");
    expect(controlsSource).toContain("event.stopPropagation();");
    expect(controlsSource).toContain("onViewHandoff();");
    expect(controlsSource).not.toContain("setIsExecutionPreviewOpen");
    expect(controlsSource).not.toContain("onClosePosition");
  });

  test("locks client-safe safety boundaries for first state/effects refactor seam", () => {
    const safeSources = [
      ["modal helper", read(modalHelperPath)],
      ["settings persistence helper", read(settingsPersistenceHelperPath)],
      ["local storage helper", read(localStorageHelperPath)],
      ["lifecycle adapter", read(lifecycleAdapterPath)],
      ["handoff preview modal", read(handoffPreviewModalPath)],
      ["sandbox fixture card", read(sandboxFixtureCardPath)],
      ["settings state hook", read(settingsStateHookPath)],
      ["live position handoff state hook", read(livePositionHandoffStateHookPath)],
      ["local persistence viewers hook", read(localPersistenceViewersHookPath)],
      ["audit log viewer", read(auditLogViewerPath)],
      ["local records viewer", read(localRecordsViewerPath)],
      ["settings panel", read(settingsPanelPath)],
      ["live position status surface", read(livePositionStatusSurfacePath)],
      ["live position handoff controls", read(livePositionHandoffControlsPath)],
    ] as const;

    for (const [label, source] of safeSources) {
      for (const fragment of clientSafeFragments) {
        expect(source, `${label} must not contain ${fragment}`).not.toContain(
          fragment,
        );
      }
    }

    const appSource = read(tradeAppPath);
    const activePositionSource = sourceSlice(
      appSource,
      "function ActivePositionCard",
      "function sellAgentCommandTone",
    );
    expect(activePositionSource).not.toContain("/api/execution/audit/writer");
    expect(activePositionSource).not.toContain("execution-record-audit-writer");
    expect(activePositionSource).not.toContain("SUPABASE_SERVICE_ROLE");
    expect(activePositionSource).not.toContain("transitionExecutionLifecycleAndAppendAuditEvent");

    const settingsSource = read(settingsPath);
    expect(settingsSource).not.toContain("/api/execution/audit/writer");
    expect(settingsSource).not.toContain("execution-record-audit-writer");
    expect(settingsSource).not.toContain("SUPABASE_SERVICE_ROLE");
  });
});
