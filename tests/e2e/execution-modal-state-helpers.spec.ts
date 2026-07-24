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
import {
  applyExecutionCaptureResult,
  applyExecutionPrepareResult,
  buildExecutionModalDebugSummary,
  closeExecutionModalState,
  createClosedExecutionModalState,
  openExecutionModalState,
} from "../../lib/execution-modal-state-helpers";
import {
  runExecutionOrchestrator,
  type ExecutionOrchestratorResult,
} from "../../lib/execution-orchestrator";

const helperPath = join(process.cwd(), "lib/execution-modal-state-helpers.ts");
const tradeAppPath = join(process.cwd(), "app/trade-app.tsx");
const modalStateHookPath = join(
  process.cwd(),
  "hooks/execution/useExecutionModalState.ts",
);
const sandboxFixtureCardPath = join(
  process.cwd(),
  "components/execution/execution-sandbox-fixture-card.tsx",
);
const handoffPreviewModalPath = join(
  process.cwd(),
  "components/execution/execution-handoff-preview-modal.tsx",
);
const livePositionHandoffStateHookPath = join(
  process.cwd(),
  "hooks/execution/useExecutionLivePositionHandoffState.ts",
);

const forbiddenHelperFragments = [
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
    intent_id: overrides.intent_id ?? `modal-helper-intent-${action}-${mode}`,
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
      recommendation_id: action === "buy" ? "rec-modal-helper-001" : null,
      live_position_id: action === "sell" ? "position-modal-helper-001" : null,
      ticker: "ture",
      market: "US",
      quantity: 10,
      order_type: "limit",
      limit_price: 123.45,
      stop_loss: action === "sell" ? 110 : null,
      target_price: action === "sell" ? 140 : null,
      expires_at: "2026-06-27T20:00:00.000Z",
      payload_id: "payload-modal-helper-001",
      payload_fingerprint: "payload-fingerprint-modal-helper-001",
      ...overrides.trading_package,
    },
    safety_warnings: overrides.safety_warnings ?? [],
    broker_result: overrides.broker_result ?? null,
    ...overrides,
  };
}

function createResult(mode: ExecutionMode = "semi_automatic") {
  return runExecutionOrchestrator({
    candidateIntents: [createIntent({ mode })],
    createdAt: "2026-06-27T08:00:00.000Z",
  });
}

function prepare(result: ExecutionOrchestratorResult) {
  return applyExecutionPrepareResult(
    openExecutionModalState({ result, source: "fixture" }),
    { status: "success" },
  );
}

test.describe("execution modal state helpers", () => {
  test("reproduces baseline closed/reset modal shape", () => {
    expect(createClosedExecutionModalState()).toEqual({
      isOpen: false,
      source: null,
      selectedIntent: null,
      selectedHandoff: null,
      localLifecycle: null,
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

  test("reproduces baseline open modal shape with selected handoff and payload", () => {
    const state = openExecutionModalState({
      result: createResult(),
      source: "fixture",
    });

    expect(state).toMatchObject({
      isOpen: true,
      source: "fixture",
      selectedIntent: {
        intent_id: "modal-helper-intent-buy-semi_automatic",
        mode: "semi_automatic",
        action: "buy",
      },
      selectedHandoff: {
        status: "ready",
        canPrepareOrder: true,
        canSubmitFinalOrder: false,
      },
      localLifecycle: {
        currentState: "handoff_created",
        intentId: "modal-helper-intent-buy-semi_automatic",
      },
      captureBaseLifecycle: null,
    });
  });

  test("reproduces close/reset clearing selected handoff and payload", () => {
    const open = openExecutionModalState({
      result: createResult(),
      source: "live_position",
    });
    const closed = closeExecutionModalState();

    expect(open.selectedIntent).not.toBeNull();
    expect(open.selectedHandoff).not.toBeNull();
    expect(closed).toMatchObject({
      isOpen: false,
      source: null,
      selectedIntent: null,
      selectedHandoff: null,
      localLifecycle: null,
      captureBaseLifecycle: null,
      preparation: {
        status: "idle",
        message: "",
        error: "",
      },
      capture: {
        status: "idle",
        message: "",
        error: "",
      },
    });
  });

  test("models prepare pending, success, and failure state shape", () => {
    const open = openExecutionModalState({
      result: createResult(),
      source: "fixture",
    });
    const pending = applyExecutionPrepareResult(open, {
      status: "pending",
      message: "Preparing local modal handoff.",
    });
    const prepared = applyExecutionPrepareResult(open, { status: "success" });
    const failed = applyExecutionPrepareResult(createClosedExecutionModalState(), {
      status: "success",
    });
    const explicitFailure = applyExecutionPrepareResult(open, {
      status: "failure",
      error: "Preparation failed safely.",
    });

    expect(pending).toMatchObject({
      preparation: {
        status: "pending",
        message: "Preparing local modal handoff.",
        error: "",
      },
    });
    expect(prepared).toMatchObject({
      preparation: {
        status: "success",
        message: "Preparation reached manual confirmation.",
        error: "",
      },
      localLifecycle: {
        currentState: "waiting_for_manual_confirmation",
      },
      captureBaseLifecycle: {
        currentState: "waiting_for_manual_confirmation",
      },
    });
    expect(failed).toMatchObject({
      preparation: {
        status: "failure",
        message: "",
        error: "Selected lifecycle, intent, and handoff are required.",
      },
    });
    expect(explicitFailure).toMatchObject({
      preparation: {
        status: "failure",
        message: "",
        error: "Preparation failed safely.",
      },
    });
  });

  test("models automatic preparation shape without enabling execution behavior", () => {
    const prepared = applyExecutionPrepareResult(
      openExecutionModalState({
        result: createResult("automatic"),
        source: "fixture",
      }),
      { status: "success" },
    );

    expect(prepared).toMatchObject({
      selectedIntent: {
        mode: "automatic",
      },
      preparation: {
        status: "success",
        message: "Preparation reached broker order submitting.",
        error: "",
      },
      localLifecycle: {
        currentState: "broker_order_submitting",
      },
      captureBaseLifecycle: {
        currentState: "broker_order_submitting",
      },
    });
    expect(JSON.stringify(prepared)).not.toMatch(
      /submit_order|click_buy|click_sell|confirm_order|brokerResult/i,
    );
  });

  test("models capture pending, success, and failure state shape", () => {
    const prepared = prepare(createResult());
    const pending = applyExecutionCaptureResult(prepared, {
      status: "pending",
      message: "Capturing local modal result.",
    });
    const captured = applyExecutionCaptureResult(prepared, { status: "success" });
    const failed = applyExecutionCaptureResult(
      openExecutionModalState({ result: createResult(), source: "fixture" }),
      { status: "success" },
    );
    const explicitFailure = applyExecutionCaptureResult(prepared, {
      status: "failure",
      error: "Capture failed safely.",
    });

    expect(pending).toMatchObject({
      capture: {
        status: "pending",
        message: "Capturing local modal result.",
        error: "",
      },
    });
    expect(captured).toMatchObject({
      localLifecycle: {
        currentState: "broker_result_captured",
      },
      capture: {
        status: "success",
        brokerStatus: "filled",
        executedPrice: "123.45",
        orderId: "modal-baseline-order-001",
        brokerTimestamp: "2026-06-27T08:03:00.000Z",
        message: "Broker result captured locally.",
        error: "",
      },
    });
    expect(failed).toMatchObject({
      capture: {
        status: "failure",
        error:
          "Invalid execution lifecycle transition from handoff_created using capture_broker_result.",
      },
    });
    expect(explicitFailure).toMatchObject({
      capture: {
        status: "failure",
        error: "Capture failed safely.",
      },
    });
  });

  test("preserves dev capture field overrides without side effects", () => {
    const captured = applyExecutionCaptureResult(prepare(createResult()), {
      status: "success",
      brokerStatus: "rejected",
      executedPrice: "121.10",
      orderId: "modal-helper-order-override",
      brokerTimestamp: "2026-06-27T08:04:00.000Z",
      successMessage: "Dev capture fields applied locally.",
    });

    expect(captured).toMatchObject({
      capture: {
        status: "success",
        brokerStatus: "rejected",
        executedPrice: "121.10",
        orderId: "modal-helper-order-override",
        brokerTimestamp: "2026-06-27T08:04:00.000Z",
        message: "Dev capture fields applied locally.",
        error: "",
      },
    });
  });

  test("accepts already-computed production prepare and capture snapshots", () => {
    const open = openExecutionModalState({
      result: createResult(),
      source: "fixture",
    });
    const prepared = applyExecutionPrepareResult(open, { status: "success" });
    const preparedFromSnapshot = applyExecutionPrepareResult(open, {
      status: "success",
      localLifecycle: prepared.localLifecycle,
      captureBaseLifecycle: prepared.captureBaseLifecycle,
      successMessage:
        "Preparation stub reached. The bridge-backed diagnostics runner can now test the future agent path, but Avanza will not be opened and no order will be prepared.",
    });
    const captured = applyExecutionCaptureResult(prepared, { status: "success" });
    const capturedFromSnapshot = applyExecutionCaptureResult(prepared, {
      status: "success",
      localLifecycle: captured.localLifecycle,
      captureBaseLifecycle: null,
      brokerStatus: "filled",
      executedPrice: "123.45",
      orderId: "modal-helper-order-snapshot",
      brokerTimestamp: "2026-06-27T08:04:00.000Z",
      successMessage:
        "Dev broker result captured and stored locally. This local record was created by the dev capture stub. It is not a real Avanza confirmation and it does not update the trade.",
    });

    expect(preparedFromSnapshot).toMatchObject({
      localLifecycle: {
        currentState: "waiting_for_manual_confirmation",
      },
      captureBaseLifecycle: {
        currentState: "waiting_for_manual_confirmation",
      },
      preparation: {
        status: "success",
        message:
          "Preparation stub reached. The bridge-backed diagnostics runner can now test the future agent path, but Avanza will not be opened and no order will be prepared.",
        error: "",
      },
    });
    expect(capturedFromSnapshot).toMatchObject({
      localLifecycle: {
        currentState: "broker_result_captured",
      },
      captureBaseLifecycle: null,
      capture: {
        status: "success",
        brokerStatus: "filled",
        executedPrice: "123.45",
        orderId: "modal-helper-order-snapshot",
        brokerTimestamp: "2026-06-27T08:04:00.000Z",
        message:
          "Dev broker result captured and stored locally. This local record was created by the dev capture stub. It is not a real Avanza confirmation and it does not update the trade.",
        error: "",
      },
    });
  });

  test("builds debug-safe summaries", () => {
    const captured = applyExecutionCaptureResult(prepare(createResult()), {
      status: "success",
    });

    expect(buildExecutionModalDebugSummary(captured)).toEqual({
      isOpen: true,
      source: "fixture",
      selectedIntentId: "modal-helper-intent-buy-semi_automatic",
      selectedHandoffStatus: "ready",
      lifecycleState: "broker_result_captured",
      lifecycleLabel: "Broker result captured",
      preparationStatus: "success",
      captureStatus: "success",
      agentProgressTimelineCount: 0,
    });
    expect(JSON.stringify(buildExecutionModalDebugSummary(captured))).not.toMatch(
      /service[_-]?role|SUPABASE|execution_record_audit_events|secret|token/i,
    );
  });

  test("is deterministic for identical inputs", () => {
    const result = createResult();
    const input = openExecutionModalState({ result, source: "fixture" });

    expect(applyExecutionPrepareResult(input, { status: "success" })).toEqual(
      applyExecutionPrepareResult(input, { status: "success" }),
    );
    expect(applyExecutionCaptureResult(prepare(result), { status: "success" })).toEqual(
      applyExecutionCaptureResult(prepare(result), { status: "success" }),
    );
  });

  test("keeps helper module client-safe and wires both open paths plus close/reset plus prepare/capture result shape", () => {
    const helperSource = read(helperPath);
    const appSource = read(tradeAppPath);
    const hookSource = read(modalStateHookPath);
    const livePositionHandoffStateHookSource = read(
      livePositionHandoffStateHookPath,
    );
    const modalSource = read(handoffPreviewModalPath);
    const fixtureSource = read(sandboxFixtureCardPath);
    const liveSource = appSource.slice(
      appSource.indexOf("function ActivePositionCard"),
      appSource.indexOf("function sellAgentCommandTone"),
    );

    for (const fragment of forbiddenHelperFragments) {
      expect(
        helperSource,
        `helper module must not include ${fragment}`,
      ).not.toContain(fragment);
    }
    expect(appSource).toContain("useExecutionLivePositionHandoffState");
    expect(livePositionHandoffStateHookSource).toContain(
      "useExecutionModalState()",
    );
    expect(hookSource).toContain("closeExecutionModalState");
    expect(hookSource).toContain("openExecutionModalState({ result, source })");
    expect(modalSource).toContain("applyExecutionPrepareResult");
    expect(modalSource).toContain("applyExecutionCaptureResult");
    expect(fixtureSource).toContain("executionPreviewModal.openFromSandbox");
    expect(fixtureSource).toContain("executionPreviewModal.isOpen &&");
    expect(liveSource).toContain("useExecutionLivePositionHandoffState");
    expect(livePositionHandoffStateHookSource).toContain(
      "executionPreviewModal.openFromLivePosition",
    );
    expect(liveSource).toContain("executionPreviewModal.isOpen &&");
    expect(hookSource).toContain('source: "fixture"');
    expect(hookSource).toContain('source: "live_position"');
    expect(hookSource).toContain("reset: close");
    expect(modalSource).toContain("setPreparationStubMessage(");
    expect(modalSource).toContain("setStubCaptureMessage(");
  });
});
