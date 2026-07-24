import { expect, test } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  closeExecutionModalState,
  openExecutionModalState,
} from "../../lib/execution-modal-state-helpers";
import { runExecutionOrchestrator } from "../../lib/execution-orchestrator";
import { buildExecutionUiStatusFromOrchestratorResult } from "../../lib/execution-ui-status";

const root = process.cwd();
const tradeAppPath = join(root, "app/trade-app.tsx");
const liveExecutionStatusSurfacePath = join(
  root,
  "components/live-day-trades/LiveExecutionStatusSurface.tsx",
);
const livePositionExecutionStatusSurfacePath = join(
  root,
  "components/execution/live-position-execution-status-surface.tsx",
);
const livePositionHandoffControlsPath = join(
  root,
  "components/execution/live-position-handoff-controls.tsx",
);
const liveDayTradeCardBodyPath = join(
  root,
  "components/live-day-trades/LiveDayTradeCardBody.tsx",
);
const liveTradeDetailsModalPath = join(
  root,
  "components/live-day-trades/LiveTradeDetailsModal.tsx",
);
const executionHandoffPreviewModalPath = join(
  root,
  "components/execution/execution-handoff-preview-modal.tsx",
);
const executionSandboxFixtureCardPath = join(
  root,
  "components/execution/execution-sandbox-fixture-card.tsx",
);
const executionSettingsPanelPath = join(
  root,
  "components/execution/execution-settings-panel.tsx",
);
const modalStateHookPath = join(root, "hooks/execution/useExecutionModalState.ts");
const livePositionHandoffStateHookPath = join(
  root,
  "hooks/execution/useExecutionLivePositionHandoffState.ts",
);
const executionAuditLogViewerPath = join(
  root,
  "components/execution/execution-audit-log-viewer.tsx",
);
const executionLocalRecordsViewerPath = join(
  root,
  "components/execution/execution-local-records-viewer.tsx",
);
const forbiddenClientUiFragments = [
  "server-only",
  "execution-record-audit-writer",
  "execution-lifecycle-transition-service",
  "transitionExecutionLifecycleOnServer",
  "transitionExecutionLifecycleAndAppendAuditEvent",
  "SUPABASE_SERVICE_ROLE",
  "SUPABASE_SERVICE_ROLE_KEY",
  "process.env.SUPABASE",
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

function createLivePositionResult({
  currentPrice = 98.4,
  targetPrice = 124,
  stopLossPrice = 100,
  mode = "semi_automatic" as "semi_automatic" | "automatic",
} = {}) {
  return runExecutionOrchestrator({
    livePositions: [
      {
        positionId: "live-position-baseline-001",
        recommendationId: "recommendation-baseline-001",
        ticker: "TURE",
        instrumentName: "Ture Baseline",
        quantity: 12,
        currentPrice,
        targetPrice,
        stopLossPrice,
        mode,
        createdAt: "2026-06-27T13:30:00.000Z",
      },
    ],
    mode,
    createdAt: "2026-06-27T13:30:00.000Z",
  });
}

test.describe("live position execution UI baseline", () => {
  test("keeps live position status and handoff controls extracted without moving modal ownership", () => {
    const appSource = read(tradeAppPath);
    const activePositionSource = sourceSlice(
      appSource,
      "function ActivePositionCard",
      "function sellAgentCommandTone",
    );
    const handoffStateHookSource = read(livePositionHandoffStateHookPath);
    const readOnlySurfaceSource = read(livePositionExecutionStatusSurfacePath);
    const handoffControlsSource = read(livePositionHandoffControlsPath);
    const compatibilitySurfaceSource = read(liveExecutionStatusSurfacePath);

    expect(existsSync(livePositionExecutionStatusSurfacePath)).toBe(true);
    expect(existsSync(livePositionHandoffControlsPath)).toBe(true);
    expect(existsSync(livePositionHandoffStateHookPath)).toBe(true);
    expect(activePositionSource).toContain("function ActivePositionCard");
    expect(activePositionSource).toContain("useExecutionLivePositionHandoffState");
    expect(activePositionSource).not.toContain("runExecutionOrchestrator({");
    expect(activePositionSource).not.toContain("livePositions: [");
    expect(activePositionSource).toContain("positionId: position.id");
    expect(activePositionSource).toContain("recommendationId: position.recommendationId");
    expect(activePositionSource).toContain("mode: executionMode");
    expect(activePositionSource).not.toContain(
      "buildExecutionUiStatusFromOrchestratorResult(",
    );
    expect(handoffStateHookSource).toContain("runExecutionOrchestrator({");
    expect(handoffStateHookSource).toContain("livePositions: [");
    expect(handoffStateHookSource).toContain("positionId");
    expect(handoffStateHookSource).toContain("recommendationId");
    expect(handoffStateHookSource).toContain("mode");
    expect(handoffStateHookSource).toContain(
      "buildExecutionUiStatusFromOrchestratorResult(",
    );
    expect(handoffStateHookSource).toContain("useExecutionModalState()");
    expect(handoffStateHookSource).toContain("openFromLivePosition");
    expect(activePositionSource).toContain("<LivePositionExecutionStatusSurface");
    expect(activePositionSource).toContain("status={liveExecutionStatus}");
    expect(activePositionSource).toContain("footerAction={");
    expect(activePositionSource).toContain("<LivePositionHandoffControls");
    expect(activePositionSource).toContain(
      "onViewHandoff={openExecutionPreviewModal}",
    );
    expect(activePositionSource).toContain("<ExecutionHandoffPreviewModal");
    expect(activePositionSource).toContain(
      "result={executionPreviewModal.selectedResult}",
    );
    expect(activePositionSource).toContain("onClose={closeExecutionPreviewModal}");
    expect(activePositionSource).toContain("<LiveTradeDetailsModal");
    expect(activePositionSource).toContain("<LiveDayTradeCardBody");
    expect(activePositionSource).toContain("onClosePosition(position)");
    expect(readOnlySurfaceSource).toContain(
      "export function LivePositionExecutionStatusSurface",
    );
    expect(readOnlySurfaceSource).not.toContain("onViewHandoff");
    expect(readOnlySurfaceSource).not.toContain("openExecutionPreviewModal");
    expect(handoffControlsSource).toContain(
      "export function LivePositionHandoffControls",
    );
    expect(handoffControlsSource).toContain('label = "View handoff"');
    expect(handoffControlsSource).toContain("event.stopPropagation();");
    expect(handoffControlsSource).toContain("onViewHandoff();");
    expect(handoffControlsSource).not.toContain("openExecutionPreviewModal");
    expect(compatibilitySurfaceSource).toContain(
      'from "@/components/execution/live-position-execution-status-surface"',
    );
    expect(compatibilitySurfaceSource).toContain("<LivePositionHandoffControls");
  });

  test("locks read-only live execution status labels, severity, and CTA state", () => {
    const stopLossResult = createLivePositionResult();
    const stopLossStatus =
      buildExecutionUiStatusFromOrchestratorResult(stopLossResult);
    const targetResult = createLivePositionResult({
      currentPrice: 126.2,
      stopLossPrice: 100,
      targetPrice: 125,
    });
    const targetStatus = buildExecutionUiStatusFromOrchestratorResult(targetResult);

    expect(stopLossResult).toMatchObject({
      status: "handoff_ready",
      selectedIntent: {
        action: "sell",
        mode: "semi_automatic",
        trigger_type: "exit_stop_loss_reached",
        trading_package: {
          live_position_id: "live-position-baseline-001",
          ticker: "TURE",
          quantity: 12,
          stop_loss: 100,
          target_price: 124,
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
    expect(stopLossStatus).toMatchObject({
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
      ticker: "TURE",
      canPrepareOrder: true,
      canSubmitFinalOrder: false,
    });
    expect(targetStatus).toMatchObject({
      visible: true,
      severity: "success",
      badgeTone: "success",
      label: "TARGET REACHED",
      title: "Sell action ready",
      description:
        "Ture detected that the live position reached target and prepared a sell execution handoff.",
      ctaType: "prepare_avanza_order",
      ctaLabel: "Prepare in Avanza",
      action: "sell",
      mode: "semi_automatic",
      triggerType: "exit_target_reached",
      canPrepareOrder: true,
      canSubmitFinalOrder: false,
    });
  });

  test("locks hidden no-action status for ineligible live positions", () => {
    const noActionResult = runExecutionOrchestrator({
      livePositions: [
        {
          positionId: "live-position-no-action-001",
          recommendationId: "recommendation-no-action-001",
          ticker: "TURE",
          instrumentName: "Ture Baseline",
          quantity: 12,
          currentPrice: 110,
          targetPrice: 125,
          stopLossPrice: 100,
          mode: "semi_automatic",
          createdAt: "2026-06-27T13:30:00.000Z",
        },
      ],
      mode: "semi_automatic",
      createdAt: "2026-06-27T13:30:00.000Z",
    });
    const status = buildExecutionUiStatusFromOrchestratorResult(noActionResult);

    expect(noActionResult).toMatchObject({
      status: "no_action",
      selectedIntent: null,
    });
    expect(status).toMatchObject({
      visible: false,
      severity: "neutral",
      badgeTone: "muted",
      label: "NO ACTION",
      title: "No execution action",
      description: "Ture has no execution action ready.",
      ctaType: "none",
      canPrepareOrder: false,
      canSubmitFinalOrder: false,
    });
  });

  test("locks status surface rendering classes and CTA copy source", () => {
    const surfaceSource = read(livePositionExecutionStatusSurfacePath);
    const handoffControlsSource = read(livePositionHandoffControlsPath);
    const compatibilitySurfaceSource = read(liveExecutionStatusSurfacePath);
    const activePositionSource = sourceSlice(
      read(tradeAppPath),
      "function ActivePositionCard",
      "function sellAgentCommandTone",
    );

    expect(surfaceSource).toContain(
      "export function LivePositionExecutionStatusSurface",
    );
    expect(surfaceSource).toContain("executionUiStatusPanelClassName");
    expect(surfaceSource).toContain("border-rose-300/30 bg-rose-300/[0.08]");
    expect(surfaceSource).toContain("border-emerald-300/25 bg-emerald-300/[0.08]");
    expect(surfaceSource).toContain("border-amber-300/25 bg-amber-300/[0.08]");
    expect(surfaceSource).toContain("border-cyan-300/20 bg-cyan-300/[0.06]");
    expect(surfaceSource).toContain("executionUiStatusBadgeClassName");
    expect(surfaceSource).toContain('return "Automatic";');
    expect(surfaceSource).toContain('return "Semi-auto";');
    expect(surfaceSource).toContain(
      'status.ctaLabel ??\n    (status.canPrepareOrder ? "Prepare in Avanza" : null)',
    );
    expect(surfaceSource).toContain("Next action: {nextAction}");
    expect(surfaceSource).toContain("Final submit allowed by authority");
    expect(surfaceSource).toContain("footerAction");
    expect(surfaceSource).not.toContain("View handoff");
    expect(surfaceSource).not.toContain("event.stopPropagation()");
    expect(handoffControlsSource).toContain("View handoff");
    expect(handoffControlsSource).toContain("event.stopPropagation()");
    expect(handoffControlsSource).toContain("onViewHandoff()");
    expect(compatibilitySurfaceSource).toContain("<LivePositionHandoffControls");
    expect(compatibilitySurfaceSource).not.toContain("View handoff");
    expect(compatibilitySurfaceSource).not.toContain("event.stopPropagation()");
    expect(activePositionSource).toContain("<LivePositionHandoffControls");
    expect(activePositionSource).toContain(
      "onViewHandoff={openExecutionPreviewModal}",
    );
    expect(activePositionSource).not.toContain("openExecutionPreviewModal();");
  });

  test("keeps live-position modal open and close behavior helper-backed", () => {
    const appSource = read(tradeAppPath);
    const modalStateHookSource = read(modalStateHookPath);
    const handoffStateHookSource = read(livePositionHandoffStateHookPath);
    const activePositionSource = sourceSlice(
      appSource,
      "function ActivePositionCard",
      "function sellAgentCommandTone",
    );
    const result = createLivePositionResult();
    const opened = openExecutionModalState({ result, source: "live_position" });
    const closed = closeExecutionModalState();

    expect(activePositionSource).toContain("useExecutionLivePositionHandoffState");
    expect(activePositionSource).not.toContain(
      "const executionPreviewModal = useExecutionModalState();",
    );
    expect(activePositionSource).toContain(
      "closeExecutionPreviewModal",
    );
    expect(activePositionSource).toContain("openExecutionPreviewModal");
    expect(activePositionSource).not.toContain(
      "if (!liveExecutionOrchestratorResult) {",
    );
    expect(activePositionSource).not.toContain(
      "executionPreviewModal.openFromLivePosition(liveExecutionOrchestratorResult)",
    );
    expect(handoffStateHookSource).toContain(
      "if (!liveExecutionOrchestratorResult) {",
    );
    expect(handoffStateHookSource).toContain(
      "executionPreviewModal.openFromLivePosition(liveExecutionOrchestratorResult)",
    );
    expect(modalStateHookSource).toContain("source: \"live_position\"");
    expect(modalStateHookSource).toContain("openExecutionModalState({ result, source })");
    expect(modalStateHookSource).toContain("closeExecutionModalState()");
    expect(activePositionSource).toContain("executionPreviewModal.isOpen &&");
    expect(activePositionSource).toContain("liveExecutionStatus?.visible &&");
    expect(activePositionSource).toContain(
      "executionPreviewModal.selectedResult?.selectedIntent",
    );
    expect(activePositionSource).toContain(
      "result={executionPreviewModal.selectedResult}",
    );
    expect(activePositionSource).not.toContain("setIsExecutionPreviewOpen(true)");
    expect(activePositionSource).toContain(
      "onViewHandoff={openExecutionPreviewModal}",
    );

    expect(opened).toMatchObject({
      isOpen: true,
      source: "live_position",
      selectedIntent: {
        action: "sell",
        mode: "semi_automatic",
        trigger_type: "exit_stop_loss_reached",
      },
      selectedHandoff: {
        status: "ready",
        canPrepareOrder: true,
        canSubmitFinalOrder: false,
      },
      localLifecycle: {
        currentState: "handoff_created",
      },
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

  test("keeps prepare and capture result display inside extracted handoff modal", () => {
    const modalSource = read(executionHandoffPreviewModalPath);

    expect(modalSource).toContain("export function ExecutionHandoffPreviewModal");
    expect(modalSource).toContain("applyExecutionPrepareResult");
    expect(modalSource).toContain("applyExecutionCaptureResult");
    expect(modalSource).toContain("buildExecutionLifecycleModalCopy({");
    expect(modalSource).toContain("const modalStateForHelper = (): ExecutionModalState => ({");
    expect(modalSource).toContain("preparation: {");
    expect(modalSource).toContain("status: preparationStubError");
    expect(modalSource).toContain("capture: {");
    expect(modalSource).toContain("status: stubCaptureError");
    expect(modalSource).toContain("brokerStatus");
    expect(modalSource).toContain("executedPrice");
    expect(modalSource).toContain("orderId");
    expect(modalSource).toContain("brokerTimestamp");
    expect(modalSource).toContain("executionBrokerCaptureStubPanelProps");
    expect(modalSource).toContain("agentProgressStubPanelProps");
    expect(modalSource).toContain("agentProgressTimeline");
    expect(modalSource).toContain("manual");
    expect(modalSource).toContain("Avanza");
    expect(modalSource).not.toContain("execution-record-audit-writer");
    expect(modalSource).not.toContain("/api/execution/audit/writer");
  });

  test("keeps close/reset and mutation-heavy close flow parent-owned", () => {
    const appSource = read(tradeAppPath);
    const activePositionSource = sourceSlice(
      appSource,
      "function ActivePositionCard",
      "function sellAgentCommandTone",
    );
    const closeModalOpenSource = sourceSlice(
      appSource,
      "function openClosePositionModal",
      "function closeClosePositionModal",
    );
    const submitCloseSource = sourceSlice(
      appSource,
      "async function submitClosePosition",
      "const dailySessionDate =",
    );

    expect(activePositionSource).toContain("onClosePositionClick={(event) => {");
    expect(activePositionSource).toContain("event.stopPropagation();");
    expect(activePositionSource).toContain("onClosePosition(position);");
    expect(closeModalOpenSource).toContain("setSelectedPosition(position)");
    expect(closeModalOpenSource).toContain('setExitPrice("");');
    expect(closeModalOpenSource).toContain('setExitNotes("");');
    expect(closeModalOpenSource).toContain('setMessage("");');
    expect(submitCloseSource).toContain("validateBrokerExitConfirmation");
    expect(submitCloseSource).toContain("buildPartialPositionState");
    expect(submitCloseSource).toContain("writeDemoActivePositions");
    expect(submitCloseSource).toContain("writeDemoClosedPositions");
    expect(submitCloseSource).toContain('supabase\n        .from("positions")\n        .update');
    expect(submitCloseSource).toContain('["live_trades", "stats_today", "history_statistics"]');
    expect(submitCloseSource).toContain("logBrokerExitConfirmationEvent");
  });

  test("keeps manual and semi-automatic boundaries visible without adding automatic submission", () => {
    const semiAutomaticResult = createLivePositionResult();
    const automaticResult = createLivePositionResult({ mode: "automatic" });
    const semiAutomaticStatus =
      buildExecutionUiStatusFromOrchestratorResult(semiAutomaticResult);
    const automaticStatus =
      buildExecutionUiStatusFromOrchestratorResult(automaticResult);
    const surfaceSource = read(livePositionExecutionStatusSurfacePath);
    const handoffControlsSource = read(livePositionHandoffControlsPath);
    const activePositionSource = sourceSlice(
      read(tradeAppPath),
      "function ActivePositionCard",
      "function sellAgentCommandTone",
    );

    expect(semiAutomaticStatus).toMatchObject({
      ctaType: "prepare_avanza_order",
      ctaLabel: "Prepare in Avanza",
      mode: "semi_automatic",
      canPrepareOrder: true,
      canSubmitFinalOrder: false,
    });
    expect(automaticStatus).toMatchObject({
      ctaType: "automatic_ready",
      ctaLabel: "Automatic execution ready",
      mode: "automatic",
      canPrepareOrder: true,
      canSubmitFinalOrder: true,
    });
    expect(surfaceSource).toContain("Final submit allowed by authority");
    expect(handoffControlsSource).not.toMatch(
      /submitFinal|submitOrder|clickBuy|clickSell|confirmOrder|brokerResult/i,
    );
    expect(activePositionSource).not.toMatch(
      /submitFinal|submitOrder|clickBuy|clickSell|confirmOrder|brokerResult/i,
    );
    expect(JSON.stringify({ semiAutomaticStatus, automaticStatus })).not.toMatch(
      /click_buy|click_sell|confirm_order|brokerResult|avanza_submit/i,
    );
  });

  test("keeps extracted execution components intact while live position panel remains parent-owned", () => {
    const appSource = read(tradeAppPath);
    const settingsSource = read(join(root, "app/settings/page.tsx"));
    const sandboxSource = read(executionSandboxFixtureCardPath);
    const settingsPanelSource = read(executionSettingsPanelPath);
    const auditLogViewerSource = read(executionAuditLogViewerPath);
    const localRecordsViewerSource = read(executionLocalRecordsViewerPath);

    expect(appSource).toContain(
      'from "@/components/execution/execution-sandbox-fixture-card"',
    );
    expect(appSource).toContain(
      'from "@/components/execution/execution-handoff-preview-modal"',
    );
    expect(appSource).not.toContain("function ExecutionSandboxFixtureCard");
    expect(appSource).not.toContain("function ExecutionHandoffPreviewModal");
    expect(sandboxSource).toContain("export function ExecutionSandboxFixtureCard");
    expect(read(executionHandoffPreviewModalPath)).toContain(
      "export function ExecutionHandoffPreviewModal",
    );
    expect(settingsSource).toContain("<ExecutionSettingsPanel");
    expect(settingsPanelSource).toContain("export function ExecutionSettingsPanel");
    expect(settingsSource).toContain("<ExecutionAuditLogViewer");
    expect(settingsSource).toContain("<ExecutionLocalRecordsViewer");
    expect(auditLogViewerSource).toContain("export function ExecutionAuditLogViewer");
    expect(localRecordsViewerSource).toContain(
      "export function ExecutionLocalRecordsViewer",
    );
  });

  test("keeps live-position execution UI boundary client-safe and non-audit-writing", () => {
    const appSource = read(tradeAppPath);
    const activePositionSource = sourceSlice(
      appSource,
      "function ActivePositionCard",
      "function sellAgentCommandTone",
    );
    const surfaceSource = read(liveExecutionStatusSurfacePath);
    const readOnlySurfaceSource = read(livePositionExecutionStatusSurfacePath);
    const handoffControlsSource = read(livePositionHandoffControlsPath);
    const handoffStateHookSource = read(livePositionHandoffStateHookPath);
    const cardBodySource = read(liveDayTradeCardBodyPath);
    const detailsModalSource = read(liveTradeDetailsModalPath);

    for (const fragment of forbiddenClientUiFragments) {
      expect(
        activePositionSource,
        `ActivePositionCard must not include ${fragment}`,
      ).not.toContain(fragment);
      expect(
        surfaceSource,
        `LiveExecutionStatusSurface must not include ${fragment}`,
      ).not.toContain(fragment);
      expect(
        readOnlySurfaceSource,
        `LivePositionExecutionStatusSurface must not include ${fragment}`,
      ).not.toContain(fragment);
      expect(
        handoffControlsSource,
        `LivePositionHandoffControls must not include ${fragment}`,
      ).not.toContain(fragment);
      expect(
        handoffStateHookSource,
        `useExecutionLivePositionHandoffState must not include ${fragment}`,
      ).not.toContain(fragment);
      expect(
        cardBodySource,
        `LiveDayTradeCardBody must not include ${fragment}`,
      ).not.toContain(fragment);
    }

    expect(surfaceSource).not.toContain("fetch(");
    expect(readOnlySurfaceSource).not.toContain("fetch(");
    expect(handoffControlsSource).not.toContain("fetch(");
    expect(handoffStateHookSource).not.toContain("fetch(");
    expect(cardBodySource).not.toContain("fetch(");
    expect(activePositionSource).not.toContain("fetch(");
    expect(surfaceSource).not.toContain("localStorage");
    expect(readOnlySurfaceSource).not.toContain("localStorage");
    expect(handoffControlsSource).not.toContain("localStorage");
    expect(handoffStateHookSource).not.toContain("localStorage");
    expect(cardBodySource).not.toContain("localStorage");
    expect(activePositionSource).not.toContain("localStorage");
    expect(detailsModalSource).toContain("window.addEventListener");
    expect(detailsModalSource).toContain("window.removeEventListener");
    expect(detailsModalSource).not.toContain("execution-record-audit-writer");
    expect(detailsModalSource).not.toContain("/api/execution/audit/writer");
  });
});
