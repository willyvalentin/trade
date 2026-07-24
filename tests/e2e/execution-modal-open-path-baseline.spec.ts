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
import { buildExecutionLifecycleModalCopy } from "../../lib/execution-lifecycle-ui-state-adapter";
import {
  closeExecutionModalState,
  openExecutionModalState,
} from "../../lib/execution-modal-state-helpers";
import { buildExecutionUiStatusFromOrchestratorResult } from "../../lib/execution-ui-status";
import { runExecutionOrchestrator } from "../../lib/execution-orchestrator";

const root = process.cwd();
const tradeAppPath = join(root, "app/trade-app.tsx");
const sandboxFixtureCardPath = join(
  root,
  "components/execution/execution-sandbox-fixture-card.tsx",
);
const handoffPreviewModalPath = join(
  root,
  "components/execution/execution-handoff-preview-modal.tsx",
);
const helperPath = join(root, "lib/execution-modal-state-helpers.ts");
const modalStateHookPath = join(root, "hooks/execution/useExecutionModalState.ts");
const livePositionHandoffStateHookPath = join(
  root,
  "hooks/execution/useExecutionLivePositionHandoffState.ts",
);

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
  "localStorage",
  "sessionStorage",
  "window.",
  "document.",
  ".insert(",
  ".update(",
  ".delete(",
  ".upsert(",
  ".select(",
];

function read(path: string) {
  return readFileSync(path, "utf8");
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
    intent_id: overrides.intent_id ?? `open-path-intent-${action}-${mode}`,
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
      recommendation_id: action === "buy" ? "rec-open-path-001" : null,
      live_position_id: action === "sell" ? "position-open-path-001" : null,
      ticker: "ture",
      market: "US",
      quantity: 10,
      order_type: "limit",
      limit_price: 123.45,
      stop_loss: action === "sell" ? 110 : null,
      target_price: action === "sell" ? 140 : null,
      expires_at: "2026-06-27T20:00:00.000Z",
      payload_id: "payload-open-path-001",
      payload_fingerprint: "payload-fingerprint-open-path-001",
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

function sourceSlice(source: string, startNeedle: string, endNeedle: string) {
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  expect(start, `missing ${startNeedle}`).toBeGreaterThanOrEqual(0);
  expect(end, `missing ${endNeedle}`).toBeGreaterThan(start);
  return source.slice(start, end);
}

test.describe("execution modal open path baseline", () => {
  test("locks sandbox fixture open path as helper-backed visibility after first wiring", () => {
    const appSource = read(tradeAppPath);
    const fixtureSource = read(sandboxFixtureCardPath);
    const hookSource = read(modalStateHookPath);

    expect(fixtureSource).toContain("useExecutionModalState");
    expect(fixtureSource).toContain(
      "const executionPreviewModal = useExecutionModalState();",
    );
    expect(fixtureSource).toContain("const openExecutionPreviewModal = () => {");
    expect(fixtureSource).toContain(
      "executionPreviewModal.openFromSandbox(orchestratorResult)",
    );
    expect(fixtureSource).toContain("onViewHandoff={openExecutionPreviewModal}");
    expect(fixtureSource).toContain("executionPreviewModal.isOpen &&");
    expect(fixtureSource).toContain(
      "executionPreviewModal.selectedResult?.selectedIntent",
    );
    expect(fixtureSource).toContain("renderHandoffPreviewModal({");
    expect(fixtureSource).toContain("result: executionPreviewModal.selectedResult");
    expect(fixtureSource).toContain("onClose: closeExecutionPreviewModal");
    expect(appSource).toContain("<ExecutionHandoffPreviewModal");
    expect(fixtureSource).toContain(
      "const closeExecutionPreviewModal = executionPreviewModal.close;",
    );
    expect(hookSource).toContain("openExecutionModalState({ result, source })");
    expect(hookSource).toContain("source: \"fixture\"");
    expect(hookSource).toContain("closeExecutionModalState()");
    expect(fixtureSource).not.toContain("setIsExecutionPreviewOpen(true)");
  });

  test("locks live position open path as helper-backed visibility after second wiring", () => {
    const appSource = read(tradeAppPath);
    const liveSource = sourceSlice(
      appSource,
      "function ActivePositionCard",
      "function sellAgentCommandTone",
    );
    const hookSource = read(modalStateHookPath);
    const livePositionHandoffStateHookSource = read(
      livePositionHandoffStateHookPath,
    );

    expect(liveSource).toContain("useExecutionLivePositionHandoffState");
    expect(liveSource).not.toContain(
      "const executionPreviewModal = useExecutionModalState();",
    );
    expect(liveSource).not.toContain("const openExecutionPreviewModal = () => {");
    expect(livePositionHandoffStateHookSource).toContain("useExecutionModalState()");
    expect(livePositionHandoffStateHookSource).toContain(
      "if (!liveExecutionOrchestratorResult) {",
    );
    expect(livePositionHandoffStateHookSource).toContain(
      "executionPreviewModal.openFromLivePosition(liveExecutionOrchestratorResult)",
    );
    expect(liveSource).toContain("footerAction={");
    expect(liveSource).toContain("<LivePositionHandoffControls");
    expect(liveSource).toContain("onViewHandoff={openExecutionPreviewModal}");
    expect(liveSource).toContain(
      "executionPreviewModal.selectedResult?.selectedIntent",
    );
    expect(liveSource).toContain("<ExecutionHandoffPreviewModal");
    expect(liveSource).toContain("result={executionPreviewModal.selectedResult}");
    expect(liveSource).toContain("onClose={closeExecutionPreviewModal}");
    expect(liveSource).not.toContain(
      "const closeExecutionPreviewModal = executionPreviewModal.close;",
    );
    expect(hookSource).toContain("source: \"live_position\"");
    expect(liveSource).not.toContain("setIsExecutionPreviewOpen(true)");
  });

  test("locks helper-equivalent sandbox open state with selected handoff and payload", () => {
    const result = createResult();
    const opened = openExecutionModalState({ result, source: "fixture" });

    expect(opened).toMatchObject({
      isOpen: true,
      source: "fixture",
      selectedIntent: {
        intent_id: "open-path-intent-buy-semi_automatic",
        action: "buy",
        mode: "semi_automatic",
        trading_package: {
          payload_id: "payload-open-path-001",
          payload_fingerprint: "payload-fingerprint-open-path-001",
        },
      },
      selectedHandoff: {
        status: "ready",
        canPrepareOrder: true,
        canSubmitFinalOrder: false,
      },
      localLifecycle: {
        currentState: "handoff_created",
        intentId: "open-path-intent-buy-semi_automatic",
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
  });

  test("locks live-position helper source support for the wired production seam", () => {
    const result = createResult();
    const opened = openExecutionModalState({ result, source: "live_position" });

    expect(opened).toMatchObject({
      isOpen: true,
      source: "live_position",
      selectedIntent: {
        intent_id: "open-path-intent-buy-semi_automatic",
        action: "buy",
        mode: "semi_automatic",
        trading_package: {
          payload_id: "payload-open-path-001",
        },
      },
      selectedHandoff: {
        status: "ready",
      },
      localLifecycle: {
        currentState: "handoff_created",
        intentId: "open-path-intent-buy-semi_automatic",
      },
      preparation: {
        status: "idle",
      },
      capture: {
        status: "idle",
      },
    });
  });

  test("locks modal copy compatibility and manual/semi-automatic readiness boundaries", () => {
    const result = createResult();
    const opened = openExecutionModalState({ result, source: "fixture" });
    const status = buildExecutionUiStatusFromOrchestratorResult(result);
    const modalCopy = buildExecutionLifecycleModalCopy({
      status,
      lifecycle: opened.localLifecycle,
    });

    expect(status).toMatchObject({
      visible: true,
      ctaType: "prepare_avanza_order",
      canPrepareOrder: true,
      canSubmitFinalOrder: false,
    });
    expect(modalCopy).toMatchObject({
      statusLabel: status.label,
      statusTitle: status.title,
      statusDescription: status.description,
    });
    expect(modalCopy.readinessHint).toBe(
      "Execution handoff is ready for preparation.",
    );
    expect(opened.selectedIntent?.mode).toBe("semi_automatic");
  });

  test("locks automatic open baseline as non-executing placeholder only", () => {
    const result = createResult({ mode: "automatic" });
    const opened = openExecutionModalState({ result, source: "fixture" });
    const status = buildExecutionUiStatusFromOrchestratorResult(result);

    expect(opened).toMatchObject({
      isOpen: true,
      selectedIntent: {
        mode: "automatic",
      },
      preparation: {
        status: "idle",
      },
      capture: {
        status: "idle",
      },
    });
    expect(status).toMatchObject({
      visible: true,
      ctaType: "automatic_ready",
      canPrepareOrder: true,
      canSubmitFinalOrder: true,
    });
    expect(JSON.stringify({ opened, status })).not.toMatch(
      /click_buy|click_sell|confirm_order|brokerResult|avanza_submit/i,
    );
  });

  test("keeps close/reset and prepare/capture wiring present while both open paths are wired", () => {
    const appSource = read(tradeAppPath);
    const fixtureSource = read(sandboxFixtureCardPath);
    const handoffPreviewModalSource = read(handoffPreviewModalPath);
    const hookSource = read(modalStateHookPath);
    const liveSource = sourceSlice(
      appSource,
      "function ActivePositionCard",
      "function sellAgentCommandTone",
    );

    expect(appSource).toContain("useExecutionLivePositionHandoffState");
    expect(read(livePositionHandoffStateHookPath)).toContain(
      "useExecutionModalState()",
    );
    expect(handoffPreviewModalSource).toContain("applyExecutionPrepareResult");
    expect(handoffPreviewModalSource).toContain("applyExecutionCaptureResult");
    expect(hookSource).toContain("closeExecutionModalState");
    expect(hookSource).toContain("openExecutionModalState");
    expect(fixtureSource).toContain("openFromSandbox");
    expect(liveSource).toContain("useExecutionLivePositionHandoffState");
    expect(read(livePositionHandoffStateHookPath)).toContain("openFromLivePosition");
    expect(closeExecutionModalState()).toMatchObject({
      isOpen: false,
      selectedIntent: null,
      selectedHandoff: null,
      localLifecycle: null,
      captureBaseLifecycle: null,
    });
  });

  test("keeps modal helper/open-path baseline boundary client-safe", () => {
    const helperSource = read(helperPath);

    for (const fragment of forbiddenClientSafeFragments) {
      expect(
        helperSource,
        `modal helper must not include ${fragment}`,
      ).not.toContain(fragment);
    }
  });
});
