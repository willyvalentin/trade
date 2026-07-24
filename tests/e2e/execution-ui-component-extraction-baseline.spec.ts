import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  getExecutionAuthorityForMode,
  type ExecutionMode,
} from "../../lib/execution";
import {
  buildExecutionLifecycleModalCopy,
  buildExecutionLifecycleUiState,
} from "../../lib/execution-lifecycle-ui-state-adapter";
import {
  applyExecutionCaptureResult,
  applyExecutionPrepareResult,
  closeExecutionModalState,
  openExecutionModalState,
} from "../../lib/execution-modal-state-helpers";
import { runExecutionOrchestrator } from "../../lib/execution-orchestrator";
import { buildExecutionUiStatusFromOrchestratorResult } from "../../lib/execution-ui-status";

const root = process.cwd();
const tradeAppPath = join(root, "app/trade-app.tsx");
const settingsPath = join(root, "app/settings/page.tsx");
const sandboxFixtureCardPath = join(
  root,
  "components/execution/execution-sandbox-fixture-card.tsx",
);
const handoffPreviewModalPath = join(
  root,
  "components/execution/execution-handoff-preview-modal.tsx",
);
const executionSettingsPanelPath = join(
  root,
  "components/execution/execution-settings-panel.tsx",
);
const executionAuditLogViewerPath = join(
  root,
  "components/execution/execution-audit-log-viewer.tsx",
);
const executionLocalRecordsViewerPath = join(
  root,
  "components/execution/execution-local-records-viewer.tsx",
);
const livePositionExecutionStatusSurfacePath = join(
  root,
  "components/execution/live-position-execution-status-surface.tsx",
);
const livePositionHandoffControlsPath = join(
  root,
  "components/execution/live-position-handoff-controls.tsx",
);
const livePositionHandoffStateHookPath = join(
  root,
  "hooks/execution/useExecutionLivePositionHandoffState.ts",
);
const devMockBrokerResultsPanelPath = join(
  root,
  "components/execution/execution-dev-mock-broker-results-panel.tsx",
);
const modalHelperPath = join(root, "lib/execution-modal-state-helpers.ts");
const modalStateHookPath = join(root, "hooks/execution/useExecutionModalState.ts");
const lifecycleAdapterPath = join(
  root,
  "lib/execution-lifecycle-ui-state-adapter.ts",
);
const localStorageHelperPath = join(
  root,
  "lib/execution-local-storage-helpers.ts",
);
const settingsPersistenceHelperPath = join(
  root,
  "lib/execution-settings-persistence-helpers.ts",
);

const forbiddenClientUiFragments = [
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

function createSandboxFixtureResult(mode: ExecutionMode = "semi_automatic") {
  return runExecutionOrchestrator({
    livePositions: [
      {
        positionId: "dev-fixture-stop-loss-live-position",
        recommendationId: "dev-fixture-stop-loss-recommendation",
        ticker: "TURE-SL",
        instrumentName: "Ture Stop Loss Fixture",
        quantity: 12,
        currentPrice: 98.4,
        targetPrice: 124,
        stopLossPrice: 100,
        mode,
        createdAt: "2026-06-09T13:30:00.000Z",
      },
    ],
    mode,
    createdAt: "2026-06-09T13:30:00.000Z",
  });
}

test.describe("execution UI component extraction baseline", () => {
  test("locks extracted sandbox fixture panel and card rendered copy", () => {
    const appSource = read(tradeAppPath);
    const componentSource = read(sandboxFixtureCardPath);
    const modalSource = read(handoffPreviewModalPath);
    const panelSource = sourceSlice(
      appSource,
      "function ExecutionSandboxFixturePanel",
      "function ActivePositionCard",
    );

    expect(appSource).toContain(
      'from "@/components/execution/execution-sandbox-fixture-card"',
    );
    expect(appSource).toContain(
      'from "@/components/execution/execution-handoff-preview-modal"',
    );
    expect(appSource).not.toContain("function ExecutionSandboxFixtureCard");
    expect(appSource).not.toContain("function ExecutionHandoffPreviewModal");
    expect(componentSource).toContain(
      "export function ExecutionSandboxFixtureCard",
    );
    expect(modalSource).toContain(
      "export function ExecutionHandoffPreviewModal",
    );

    expect(panelSource).toContain('aria-label="Execution sandbox fixtures"');
    expect(panelSource).toContain("DEV FIXTURE");
    expect(panelSource).toContain("Not a real trade");
    expect(panelSource).toContain("Does not write Supabase");
    expect(panelSource).toContain("Execution Sandbox Fixture");
    expect(panelSource).toContain(
      "Local in-memory cards for execution sandbox QA only.",
    );
    expect(panelSource).toContain("cannot create broker orders");
    expect(panelSource).toContain("For Playwright QA only");
    expect(panelSource).toContain("executionSandboxFixturePositions.map");
    expect(panelSource).toContain("<ExecutionSandboxFixtureCard");
    expect(panelSource).toContain("renderHandoffPreviewModal");
    expect(panelSource).toContain("<ExecutionHandoffPreviewModal");

    expect(appSource).toContain('id: "dev-fixture-stop-loss-live-position"');
    expect(appSource).toContain('ticker: "TURE-SL"');
    expect(appSource).toContain('title: "Stop loss reached"');
    expect(appSource).toContain("Long-position fixture where current price is below stop loss.");
    expect(appSource).toContain('id: "dev-fixture-target-live-position"');
    expect(appSource).toContain('ticker: "TURE-TGT"');
    expect(appSource).toContain('title: "Target reached"');
    expect(appSource).toContain("Long-position fixture where current price is above target.");

    expect(componentSource).toContain("{fixture.title}");
    expect(componentSource).toContain("{fixture.ticker} · {fixture.label}");
    expect(componentSource).toContain("{fixture.description}");
    expect(componentSource).toContain("Local only");
    expect(componentSource).toContain("Current");
    expect(componentSource).toContain("Target");
    expect(componentSource).toContain("Stop");
    expect(componentSource).toContain("Quantity");
    expect(componentSource).toContain(
      "This fixture uses the live-position exit monitor",
    );
    expect(componentSource).toContain("orchestrator, UI status adapter");
    expect(componentSource).toContain("UI status adapter");
    expect(componentSource).toContain("handoff preview modal");
    expect(componentSource).toContain("cannot be closed or saved as a trade");
  });

  test("locks sandbox fixture status surface and lifecycle adapter output", () => {
    const result = createSandboxFixtureResult();
    const status = buildExecutionUiStatusFromOrchestratorResult(result);
    const uiState = buildExecutionLifecycleUiState({
      source: "orchestrator",
      result,
    });

    expect(result).toMatchObject({
      status: "handoff_ready",
      selectedIntent: {
        action: "sell",
        mode: "semi_automatic",
        trigger_type: "exit_stop_loss_reached",
        trading_package: {
          live_position_id: "dev-fixture-stop-loss-live-position",
          ticker: "TURE-SL",
          quantity: 12,
          target_price: 124,
          stop_loss: 100,
        },
      },
      handoff: {
        status: "ready",
        canPrepareOrder: true,
        canSubmitFinalOrder: false,
      },
      lifecycle: {
        currentState: "handoff_created",
      },
    });

    expect(status).toMatchObject({
      visible: true,
      severity: "danger",
      badgeTone: "danger",
      label: "STOP LOSS REACHED",
      title: "Sell action required",
      description:
        "Ture detected that the live position reached stop loss and prepared a sell execution handoff.",
      ctaType: "prepare_avanza_order",
      ctaLabel: "Prepare in Avanza",
      action: "sell",
      mode: "semi_automatic",
      triggerType: "exit_stop_loss_reached",
      ticker: "TURE-SL",
      canPrepareOrder: true,
      canSubmitFinalOrder: false,
    });

    expect(uiState).toMatchObject({
      source: "orchestrator",
      visible: true,
      statusLabel: "STOP LOSS REACHED",
      lifecycleLabel: "Avanza handoff created",
      lifecycleState: "handoff_created",
      severity: "danger",
      badgeTone: "danger",
      title: "Sell action required",
      cta: {
        type: "prepare_avanza_order",
        label: "Prepare in Avanza",
        enabled: true,
        disabledReason: null,
      },
      canPrepareOrder: true,
      canSubmitFinalOrder: false,
      readinessHint: "Execution handoff is ready for preparation.",
      manualConfirmationRequired: false,
      terminal: false,
      debugMetadata: {
        source: "orchestrator",
        visible: true,
        statusLabel: "STOP LOSS REACHED",
        lifecycleState: "handoff_created",
        severity: "danger",
        ctaType: "prepare_avanza_order",
        canPrepareOrder: true,
        canSubmitFinalOrder: false,
        manualConfirmationRequired: false,
        terminal: false,
      },
    });

    expect(uiState.summaryRows).toEqual(
      expect.arrayContaining([
        { label: "Status", value: "STOP LOSS REACHED", tone: "danger" },
        { label: "Severity", value: "danger", tone: "danger" },
        { label: "CTA", value: "Prepare in Avanza" },
        { label: "Prepare enabled", value: "yes" },
        { label: "Final submit enabled", value: "no" },
        { label: "Lifecycle", value: "Avanza handoff created", tone: "danger" },
      ]),
    );
  });

  test("locks sandbox modal open and close behavior through existing helpers", () => {
    const result = createSandboxFixtureResult();
    const opened = openExecutionModalState({ result, source: "fixture" });
    const closed = closeExecutionModalState();

    expect(opened).toMatchObject({
      isOpen: true,
      source: "fixture",
      selectedIntent: {
        action: "sell",
        mode: "semi_automatic",
        trigger_type: "exit_stop_loss_reached",
        trading_package: {
          live_position_id: "dev-fixture-stop-loss-live-position",
          ticker: "TURE-SL",
        },
      },
      selectedHandoff: {
        status: "ready",
        canPrepareOrder: true,
        canSubmitFinalOrder: false,
      },
      localLifecycle: {
        currentState: "handoff_created",
      },
      captureBaseLifecycle: null,
      preparation: {
        status: "idle",
        message: "",
        error: "",
      },
      capture: {
        status: "idle",
        brokerStatus: "submitted",
        executedPrice: "",
        orderId: "",
        brokerTimestamp: "",
        message: "",
        error: "",
      },
      agentProgress: {
        selectedType: "agent_started",
        timelineCount: 0,
        message: "",
        error: "",
      },
    });

    expect(closed).toMatchObject({
      isOpen: false,
      source: null,
      selectedIntent: null,
      selectedHandoff: null,
      localLifecycle: null,
      captureBaseLifecycle: null,
    });
  });

  test("locks modal copy and current prepare/capture helper behavior before extraction", () => {
    const result = createSandboxFixtureResult();
    const status = buildExecutionUiStatusFromOrchestratorResult(result);
    const opened = openExecutionModalState({ result, source: "fixture" });
    const modalCopy = buildExecutionLifecycleModalCopy({
      status,
      lifecycle: opened.localLifecycle,
    });

    expect(modalCopy).toEqual({
      statusLabel: "STOP LOSS REACHED",
      statusTitle: "Sell action required",
      statusDescription:
        "Ture detected that the live position reached stop loss and prepared a sell execution handoff.",
      readinessHint: "Execution handoff is ready for preparation.",
    });

    const prepared = applyExecutionPrepareResult(opened, {
      status: "success",
      localLifecycle: result.lifecycle,
      captureBaseLifecycle: result.lifecycle,
      successMessage:
        "Preparation stub baseline message. No real Avanza order was prepared.",
    });

    expect(prepared).toMatchObject({
      isOpen: true,
      source: "fixture",
      localLifecycle: {
        currentState: "handoff_created",
      },
      captureBaseLifecycle: {
        currentState: "handoff_created",
      },
      preparation: {
        status: "success",
        message:
          "Preparation stub baseline message. No real Avanza order was prepared.",
        error: "",
      },
    });

    const prepareFailure = applyExecutionPrepareResult(opened, {
      status: "failure",
      error: "Preparation remains blocked in baseline.",
    });

    expect(prepareFailure).toMatchObject({
      preparation: {
        status: "failure",
        message: "",
        error: "Preparation remains blocked in baseline.",
      },
    });

    const captured = applyExecutionCaptureResult(prepared, {
      status: "success",
      localLifecycle: result.lifecycle,
      captureBaseLifecycle: null,
      brokerStatus: "submitted",
      executedPrice: "98.40",
      orderId: "LOCAL-DEV-STUB",
      brokerTimestamp: "2026-06-09T13:31:00.000Z",
      successMessage:
        "Dev broker result captured locally. This is not a real Avanza confirmation.",
    });

    expect(captured).toMatchObject({
      captureBaseLifecycle: null,
      capture: {
        status: "success",
        brokerStatus: "submitted",
        executedPrice: "98.40",
        orderId: "LOCAL-DEV-STUB",
        brokerTimestamp: "2026-06-09T13:31:00.000Z",
        message:
          "Dev broker result captured locally. This is not a real Avanza confirmation.",
        error: "",
      },
    });

    const captureFailure = applyExecutionCaptureResult(prepared, {
      status: "failure",
      error: "Capture remains blocked in baseline.",
    });

    expect(captureFailure).toMatchObject({
      capture: {
        status: "failure",
        message: "",
        error: "Capture remains blocked in baseline.",
      },
    });
  });

  test("locks source wiring for extracted sandbox card", () => {
    const appSource = read(tradeAppPath);
    const cardSource = read(sandboxFixtureCardPath);
    const modalSource = read(handoffPreviewModalPath);
    const panelSource = sourceSlice(
      appSource,
      "function ExecutionSandboxFixturePanel",
      "function ActivePositionCard",
    );

    expect(cardSource).toContain('"use client";');
    expect(cardSource).toContain(
      "export function ExecutionSandboxFixtureCard",
    );
    expect(appSource).toContain(
      'from "@/components/execution/execution-sandbox-fixture-card"',
    );
    expect(appSource).toContain(
      'from "@/components/execution/execution-handoff-preview-modal"',
    );
    expect(panelSource).toContain("renderHandoffPreviewModal");
    expect(panelSource).toContain("<ExecutionHandoffPreviewModal");
    expect(modalSource).toContain(
      "export function ExecutionHandoffPreviewModal",
    );
    expect(modalSource).toContain("useState<ExecutionLifecycleSnapshot>");
    expect(modalSource).toContain("buildExecutionLifecycleModalCopy({");
    expect(modalSource).toContain("applyExecutionPrepareResult");
    expect(modalSource).toContain("applyExecutionCaptureResult");
    const modalStateHookSource = read(modalStateHookPath);

    expect(cardSource).toContain("useExecutionModalState");
    expect(cardSource).toContain(
      "const executionPreviewModal = useExecutionModalState();",
    );
    expect(cardSource).toContain("runExecutionOrchestrator({");
    expect(cardSource).toContain("livePositions: [");
    expect(cardSource).toContain("positionId: fixture.id");
    expect(cardSource).toContain("mode: executionMode");
    expect(cardSource).toContain("buildExecutionUiStatusFromOrchestratorResult");
    expect(cardSource).toContain("buildExecutionLifecycleUiState({");
    expect(cardSource).toContain('source: "orchestrator"');
    expect(cardSource).toContain(
      "const closeExecutionPreviewModal = executionPreviewModal.close;",
    );
    expect(cardSource).toContain(
      "executionPreviewModal.openFromSandbox(orchestratorResult)",
    );
    expect(modalStateHookSource).toContain(
      "openExecutionModalState({ result, source })",
    );
    expect(modalStateHookSource).toContain('source: "fixture"');
    expect(cardSource).toContain("<LiveExecutionStatusSurface");
    expect(cardSource).toContain("status={uiState.statusSurface}");
    expect(cardSource).toContain("onViewHandoff={openExecutionPreviewModal}");
    expect(cardSource).toContain("executionPreviewModal.isOpen &&");
    expect(cardSource).toContain("uiStatus.visible &&");
    expect(cardSource).toContain(
      "executionPreviewModal.selectedResult?.selectedIntent",
    );
    expect(cardSource).toContain("renderHandoffPreviewModal({");
    expect(cardSource).toContain("result: executionPreviewModal.selectedResult");
    expect(cardSource).toContain("status: uiStatus");
    expect(cardSource).toContain("onClose: closeExecutionPreviewModal");
    expect(cardSource).not.toContain("<ExecutionHandoffPreviewModal");

    expect(cardSource).not.toContain("setIsExecutionPreviewOpen(true)");
    expect(cardSource).not.toContain("fetch(");
    expect(cardSource).not.toContain("supabase");
    expect(cardSource).not.toContain("appendExecutionAuditEventWithServiceRole");
  });

  test("keeps live position status and handoff controls extracted while ownership stays parent-bound", () => {
    const appSource = read(tradeAppPath);
    const settingsSource = read(settingsPath);
    const executionSettingsPanelSource = read(executionSettingsPanelPath);
    const executionAuditLogViewerSource = read(executionAuditLogViewerPath);
    const executionLocalRecordsViewerSource = read(executionLocalRecordsViewerPath);
    const livePositionExecutionStatusSurfaceSource = read(
      livePositionExecutionStatusSurfacePath,
    );
    const livePositionHandoffControlsSource = read(livePositionHandoffControlsPath);
    const livePositionHandoffStateHookSource = read(
      livePositionHandoffStateHookPath,
    );
    const activePositionSource = sourceSlice(
      appSource,
      "function ActivePositionCard",
      "function sellAgentCommandTone",
    );

    expect(activePositionSource).toContain("function ActivePositionCard");
    expect(activePositionSource).toContain("<LiveDayTradeCardBody");
    expect(activePositionSource).toContain("<LivePositionExecutionStatusSurface");
    expect(activePositionSource).toContain("footerAction={");
    expect(activePositionSource).toContain("<LivePositionHandoffControls");
    expect(activePositionSource).toContain(
      "onViewHandoff={openExecutionPreviewModal}",
    );
    expect(activePositionSource).toContain("onClosePosition(position)");
    expect(activePositionSource).toContain("setIsDetailsOpen(true)");
    expect(activePositionSource).toContain("useExecutionLivePositionHandoffState");
    expect(livePositionHandoffStateHookSource).toContain(
      "executionPreviewModal.openFromLivePosition(liveExecutionOrchestratorResult)",
    );
    expect(livePositionExecutionStatusSurfaceSource).toContain(
      "export function LivePositionExecutionStatusSurface",
    );
    expect(livePositionExecutionStatusSurfaceSource).not.toContain("View handoff");
    expect(livePositionExecutionStatusSurfaceSource).not.toContain("onViewHandoff");
    expect(livePositionHandoffControlsSource).toContain(
      "export function LivePositionHandoffControls",
    );
    expect(livePositionHandoffControlsSource).toContain('label = "View handoff"');
    expect(livePositionHandoffControlsSource).toContain("event.stopPropagation();");
    expect(livePositionHandoffControlsSource).toContain("onViewHandoff();");
    expect(livePositionHandoffControlsSource).not.toContain(
      "openExecutionPreviewModal",
    );

    expect(settingsSource).toContain(
      'from "@/components/execution/execution-settings-panel"',
    );
    expect(settingsSource).toContain("<ExecutionSettingsPanel");
    expect(settingsSource).toContain(
      "onSelectExecutionMode={updateExecutionModePreference}",
    );
    expect(settingsSource).not.toContain("function ExecutionSettingsPanel");
    expect(executionSettingsPanelSource).toContain(
      "export function ExecutionSettingsPanel",
    );
    expect(executionSettingsPanelSource).toContain("Execution Mode");
    expect(executionSettingsPanelSource).toContain("Semi-automatic");
    expect(executionSettingsPanelSource).toContain("Default");
    expect(executionSettingsPanelSource).toContain("Recommended");
    expect(executionSettingsPanelSource).toContain("Automatic");
    expect(executionSettingsPanelSource).toContain("Advanced");
    expect(executionSettingsPanelSource).toContain("Experimental");
    expect(executionSettingsPanelSource).toContain("Locked");
    expect(executionSettingsPanelSource).toContain(
      "disabled={!automaticExecutionEnabled}",
    );
    expect(executionSettingsPanelSource).toContain(
      "NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION is set to true.",
    );
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
    expect(settingsSource).not.toContain("function ExecutionEventLogRow");
    expect(settingsSource).not.toContain("function ExecutionRecordRow");
    expect(executionAuditLogViewerSource).toContain(
      "export function ExecutionAuditLogViewer",
    );
    expect(executionAuditLogViewerSource).toContain("Execution Event Log");
    expect(executionAuditLogViewerSource).toContain("Clear execution event log");
    expect(executionAuditLogViewerSource).toContain(
      "Stored locally in this browser. Refresh reads the current local log;",
    );
    expect(executionAuditLogViewerSource).toContain("onClick={onRefresh}");
    expect(executionAuditLogViewerSource).toContain("onClick={onClear}");
    expect(executionAuditLogViewerSource).not.toContain("localStorage");
    expect(executionAuditLogViewerSource).not.toContain("readExecutionEventLog");
    expect(executionAuditLogViewerSource).not.toContain(
      "clearExecutionAuditEvents",
    );
    expect(executionLocalRecordsViewerSource).toContain(
      "export function ExecutionLocalRecordsViewer",
    );
    expect(executionLocalRecordsViewerSource).toContain("Execution Records");
    expect(executionLocalRecordsViewerSource).toContain("Clear execution records");
    expect(executionLocalRecordsViewerSource).toContain(
      "Stub/dev records are not proof of",
    );
    expect(executionLocalRecordsViewerSource).toContain("onClick={onRefresh}");
    expect(executionLocalRecordsViewerSource).toContain("onClick={onClear}");
    expect(executionLocalRecordsViewerSource).not.toContain("localStorage");
    expect(executionLocalRecordsViewerSource).not.toContain(
      "readExecutionRecordStoreResult",
    );
    expect(executionLocalRecordsViewerSource).not.toContain(
      "clearExecutionRecords",
    );
    expect(settingsSource).toContain("<DevMockBrokerResultsPanel");
    expect(settingsSource).toContain(
      'from "@/components/execution/execution-dev-mock-broker-results-panel"',
    );
    expect(read(devMockBrokerResultsPanelPath)).toContain(
      "export function DevMockBrokerResultsPanel",
    );
    expect(settingsSource).toContain("updateExecutionModePreference");
    expect(settingsSource).toContain("refreshExecutionEventLog");
    expect(settingsSource).toContain("clearExecutionEventLog");
    expect(settingsSource).toContain("refreshExecutionRecords");
    expect(settingsSource).toContain("clearLocalExecutionRecords");
    expect(settingsSource).toContain("refreshDevMockBrokerResults");
    expect(settingsSource).toContain("clearLocalDevMockBrokerResults");
  });

  test("keeps manual/semi-auto and automatic safety boundaries visible", () => {
    const semiAutomaticResult = createSandboxFixtureResult("semi_automatic");
    const automaticResult = createSandboxFixtureResult("automatic");
    const semiAutomaticStatus =
      buildExecutionUiStatusFromOrchestratorResult(semiAutomaticResult);
    const automaticStatus =
      buildExecutionUiStatusFromOrchestratorResult(automaticResult);

    expect(getExecutionAuthorityForMode("semi_automatic")).toMatchObject({
      can_submit_broker_order: false,
      allowFinalSubmit: false,
      final_confirmation_actor: "human",
    });
    expect(semiAutomaticStatus).toMatchObject({
      ctaType: "prepare_avanza_order",
      ctaLabel: "Prepare in Avanza",
      canPrepareOrder: true,
      canSubmitFinalOrder: false,
    });

    expect(getExecutionAuthorityForMode("automatic")).toMatchObject({
      can_submit_broker_order: true,
      allowFinalSubmit: true,
      final_confirmation_actor: "agent",
    });
    expect(automaticStatus).toMatchObject({
      ctaType: "automatic_ready",
      ctaLabel: "Automatic execution ready",
      canPrepareOrder: true,
      canSubmitFinalOrder: true,
    });
    expect(JSON.stringify({ semiAutomaticStatus, automaticStatus })).not.toMatch(
      /click_buy|click_sell|confirm_order|submit_order|broker_result_created/i,
    );
  });

  test("keeps extraction baseline client-safe and free of server write-path imports", () => {
    const sources = [
      ["ExecutionSandboxFixtureCard source", read(sandboxFixtureCardPath)],
      ["ExecutionHandoffPreviewModal source", read(handoffPreviewModalPath)],
      ["ExecutionSettingsPanel source", read(executionSettingsPanelPath)],
      ["ExecutionAuditLogViewer source", read(executionAuditLogViewerPath)],
      ["ExecutionLocalRecordsViewer source", read(executionLocalRecordsViewerPath)],
      ["modal helper", read(modalHelperPath)],
      ["lifecycle UI adapter", read(lifecycleAdapterPath)],
      ["local storage helper", read(localStorageHelperPath)],
      ["settings persistence helper", read(settingsPersistenceHelperPath)],
    ] as const;
    const cardSource = read(sandboxFixtureCardPath);

    for (const fragment of forbiddenClientUiFragments) {
      expect(
        cardSource,
        `sandbox fixture card must not include ${fragment}`,
      ).not.toContain(fragment);
    }

    for (const [label, source] of sources.slice(1)) {
      for (const fragment of forbiddenClientUiFragments) {
        expect(source, `${label} must not include ${fragment}`).not.toContain(
          fragment,
        );
      }
    }

    expect(cardSource).toContain("export function ExecutionSandboxFixtureCard");
    expect(read(tradeAppPath)).not.toContain(
      "function ExecutionSandboxFixtureCard",
    );
    expect(read(tradeAppPath)).not.toContain(
      'from "@/components/execution/ExecutionSandboxFixtureCard"',
    );
    expect(read(tradeAppPath)).toContain(
      'from "@/components/execution/execution-sandbox-fixture-card"',
    );
  });
});
