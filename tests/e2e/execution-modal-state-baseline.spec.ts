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
  getExecutionLifecycleDisplayLabel,
  transitionExecutionLifecycle,
  type ExecutionLifecycleSnapshot,
} from "../../lib/execution-state-machine";
import {
  runExecutionOrchestrator,
  type ExecutionOrchestratorResult,
} from "../../lib/execution-orchestrator";

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
const plannedHelperPath = join(root, "docs/execution-modal-state-helper-extraction-plan.md");
const adapterPath = join(root, "lib/execution-lifecycle-ui-state-adapter.ts");
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

type ExecutionModalSource = "fixture" | "live_position";
type BaselineAsyncStatus = "idle" | "pending" | "success" | "failure";

type ExecutionModalBaselineState = {
  isOpen: boolean;
  source: ExecutionModalSource | null;
  selectedIntent: ExecutionOrchestratorResult["selectedIntent"];
  selectedHandoff: ExecutionOrchestratorResult["handoff"];
  localLifecycle: ExecutionLifecycleSnapshot | null;
  captureBaseLifecycle: ExecutionLifecycleSnapshot | null;
  preparation: {
    status: BaselineAsyncStatus;
    message: string;
    error: string;
  };
  capture: {
    status: BaselineAsyncStatus;
    brokerStatus: "submitted" | "filled" | "rejected" | "cancelled";
    executedPrice: string;
    orderId: string;
    brokerTimestamp: string;
    message: string;
    error: string;
  };
  agentProgress: {
    selectedType: "agent_started" | "order_form_prepared";
    timelineCount: number;
    message: string;
    error: string;
  };
};

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
    intent_id: overrides.intent_id ?? `modal-intent-${action}-${mode}`,
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
      recommendation_id: action === "buy" ? "rec-modal-baseline-001" : null,
      live_position_id: action === "sell" ? "position-modal-baseline-001" : null,
      ticker: "ture",
      market: "US",
      quantity: 10,
      order_type: "limit",
      limit_price: 123.45,
      stop_loss: action === "sell" ? 110 : null,
      target_price: action === "sell" ? 140 : null,
      expires_at: "2026-06-27T20:00:00.000Z",
      payload_id: "payload-modal-baseline-001",
      payload_fingerprint: "payload-fingerprint-modal-baseline-001",
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

function closedModalState(): ExecutionModalBaselineState {
  return {
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
  };
}

function openModalState(
  result: ExecutionOrchestratorResult,
  source: ExecutionModalSource,
): ExecutionModalBaselineState {
  return {
    ...closedModalState(),
    isOpen: true,
    source,
    selectedIntent: result.selectedIntent,
    selectedHandoff: result.handoff,
    localLifecycle: result.lifecycle,
  };
}

function closeModalState(): ExecutionModalBaselineState {
  return closedModalState();
}

function applyPreparationSuccess(
  state: ExecutionModalBaselineState,
): ExecutionModalBaselineState {
  if (!state.localLifecycle || !state.selectedIntent || !state.selectedHandoff) {
    return {
      ...state,
      preparation: {
        status: "failure",
        message: "",
        error: "Selected lifecycle, intent, and handoff are required.",
      },
    };
  }

  const start = transitionExecutionLifecycle(
    state.localLifecycle,
    "start_broker_preparation",
    {
      createdAt: "2026-06-27T08:01:00.000Z",
      intentId: state.selectedIntent.intent_id,
      handoffVersion: state.selectedHandoff.version,
      mode: state.selectedIntent.mode,
      action: state.selectedIntent.action,
      triggerType: state.selectedIntent.trigger_type,
      message: "Local baseline preparation transition.",
    },
  );

  if (!start.ok) {
    return {
      ...state,
      preparation: {
        status: "failure",
        message: "",
        error: start.error,
      },
    };
  }

  const followUpEvent =
    state.selectedIntent.mode === "automatic"
      ? "submit_broker_order"
      : "wait_for_manual_confirmation";
  const followUp = transitionExecutionLifecycle(start.snapshot, followUpEvent, {
    createdAt: "2026-06-27T08:02:00.000Z",
    intentId: state.selectedIntent.intent_id,
    handoffVersion: state.selectedHandoff.version,
    mode: state.selectedIntent.mode,
    action: state.selectedIntent.action,
    triggerType: state.selectedIntent.trigger_type,
    message: "Local baseline preparation follow-up transition.",
  });

  if (!followUp.ok) {
    return {
      ...state,
      captureBaseLifecycle: start.snapshot,
      preparation: {
        status: "failure",
        message: "",
        error: followUp.error,
      },
    };
  }

  return {
    ...state,
    localLifecycle: followUp.snapshot,
    captureBaseLifecycle: followUp.snapshot,
    preparation: {
      status: "success",
      message:
        state.selectedIntent.mode === "automatic"
          ? "Preparation reached broker order submitting."
          : "Preparation reached manual confirmation.",
      error: "",
    },
  };
}

function applyCaptureSuccess(
  state: ExecutionModalBaselineState,
): ExecutionModalBaselineState {
  if (!state.localLifecycle || !state.selectedIntent) {
    return {
      ...state,
      capture: {
        ...state.capture,
        status: "failure",
        error: "Selected lifecycle and intent are required.",
      },
    };
  }

  const captureBase = state.captureBaseLifecycle ?? state.localLifecycle;
  const capture = transitionExecutionLifecycle(captureBase, "capture_broker_result", {
    createdAt: "2026-06-27T08:03:00.000Z",
    intentId: state.selectedIntent.intent_id,
    mode: state.selectedIntent.mode,
    action: state.selectedIntent.action,
    triggerType: state.selectedIntent.trigger_type,
    message: "Local baseline capture transition.",
  });

  if (!capture.ok) {
    return {
      ...state,
      capture: {
        ...state.capture,
        status: "failure",
        error: capture.error,
      },
    };
  }

  return {
    ...state,
    localLifecycle: capture.snapshot,
    capture: {
      ...state.capture,
      status: "success",
      brokerStatus: "filled",
      executedPrice: "123.45",
      orderId: "modal-baseline-order-001",
      brokerTimestamp: "2026-06-27T08:03:00.000Z",
      message: "Broker result captured locally.",
      error: "",
    },
  };
}

function modalDebugSummary(state: ExecutionModalBaselineState) {
  return {
    isOpen: state.isOpen,
    source: state.source,
    selectedIntentId: state.selectedIntent?.intent_id ?? null,
    selectedHandoffStatus: state.selectedHandoff?.status ?? null,
    lifecycleState: state.localLifecycle?.currentState ?? null,
    lifecycleLabel: state.localLifecycle
      ? getExecutionLifecycleDisplayLabel(state.localLifecycle.currentState)
      : null,
    preparationStatus: state.preparation.status,
    captureStatus: state.capture.status,
    agentProgressTimelineCount: state.agentProgress.timelineCount,
  };
}

test.describe("execution modal state baseline", () => {
  test("locks initial closed/reset modal state shape", () => {
    expect(closedModalState()).toEqual({
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

  test("locks open modal state with selected handoff and payload", () => {
    const result = createResult();
    const state = openModalState(result, "fixture");

    expect(state).toMatchObject({
      isOpen: true,
      source: "fixture",
      selectedIntent: {
        intent_id: "modal-intent-buy-semi_automatic",
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
        intentId: "modal-intent-buy-semi_automatic",
      },
      captureBaseLifecycle: null,
    });
  });

  test("locks close/reset clearing selected handoff and payload", () => {
    const result = createResult();
    const open = openModalState(result, "live_position");
    const closed = closeModalState();

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

  test("locks semi-automatic preparation success shape", () => {
    const prepared = applyPreparationSuccess(openModalState(createResult(), "fixture"));

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
  });

  test("locks automatic preparation shape without enabling runtime execution", () => {
    const prepared = applyPreparationSuccess(
      openModalState(createResult("automatic"), "fixture"),
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

  test("locks preparation failure shape for missing selected payload", () => {
    expect(applyPreparationSuccess(closedModalState())).toMatchObject({
      preparation: {
        status: "failure",
        message: "",
        error: "Selected lifecycle, intent, and handoff are required.",
      },
    });
  });

  test("locks capture success and failure status shapes", () => {
    const prepared = applyPreparationSuccess(openModalState(createResult(), "fixture"));
    const captured = applyCaptureSuccess(prepared);
    const failed = applyCaptureSuccess(openModalState(createResult(), "fixture"));

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
  });

  test("locks debug-safe modal summary shape", () => {
    const captured = applyCaptureSuccess(
      applyPreparationSuccess(openModalState(createResult(), "fixture")),
    );
    const summary = modalDebugSummary(captured);

    expect(summary).toEqual({
      isOpen: true,
      source: "fixture",
      selectedIntentId: "modal-intent-buy-semi_automatic",
      selectedHandoffStatus: "ready",
      lifecycleState: "broker_result_captured",
      lifecycleLabel: "Broker result captured",
      preparationStatus: "success",
      captureStatus: "success",
      agentProgressTimelineCount: 0,
    });
    expect(JSON.stringify(summary)).not.toMatch(
      /service[_-]?role|SUPABASE|execution_record_audit_events|secret|token/i,
    );
  });

  test("documents and preserves extracted modal state coupling", () => {
    const appSource = read(tradeAppPath);
    const modalSource = read(handoffPreviewModalPath);

    expect(appSource).toContain(
      'from "@/components/execution/execution-handoff-preview-modal"',
    );
    expect(appSource).not.toContain("function ExecutionHandoffPreviewModal");
    expect(modalSource).toContain("export function ExecutionHandoffPreviewModal");
    expect(modalSource).toContain("useState<ExecutionLifecycleSnapshot>");
    expect(modalSource).toContain("const [captureBaseLifecycle");
    expect(modalSource).toContain("const [preparationStubMessage");
    expect(modalSource).toContain("const [preparationStubError");
    expect(modalSource).toContain("const [stubCaptureResult");
    expect(modalSource).toContain("setLocalLifecycle(");
    expect(modalSource).toContain("setCaptureBaseLifecycle(");
    expect(modalSource).toContain("appendExecutionAuditEvents(");
    expect(modalSource).toContain("buildExecutionLifecycleModalCopy({");
    expect(modalSource).toContain("window.addEventListener(\"keydown\"");
    expect(modalSource).toContain("applyExecutionPrepareResult");
    expect(modalSource).toContain("applyExecutionCaptureResult");
  });

  test("keeps helper boundary client-safe with both open paths, close/reset, and prepare/capture production wiring", () => {
    const plan = read(plannedHelperPath);
    const adapterSource = read(adapterPath);
    const appSource = read(tradeAppPath);
    const modalSource = read(handoffPreviewModalPath);
    const hookSource = read(modalStateHookPath);
    const livePositionHandoffStateHookSource = read(
      livePositionHandoffStateHookPath,
    );
    const liveStart = appSource.indexOf("function ActivePositionCard");
    const nextStart = appSource.indexOf("function sellAgentCommandTone");
    const fixtureSource = read(sandboxFixtureCardPath);
    const liveSource = appSource.slice(liveStart, nextStart);

    expect(plan).toContain("lib/execution-modal-state-helpers.ts");
    expect(plan).toContain("no audit writer client invocation");
    expect(plan).toContain("no broker/Avanza behavior");
    expect(plan).toContain("Action 903 - Implement Execution Modal State Helpers");
    expect(appSource).toContain("useExecutionLivePositionHandoffState");
    expect(livePositionHandoffStateHookSource).toContain(
      "useExecutionModalState()",
    );
    expect(modalSource).toContain("applyExecutionPrepareResult");
    expect(modalSource).toContain("applyExecutionCaptureResult");
    expect(hookSource).toContain("closeExecutionModalState");
    expect(hookSource).toContain("openExecutionModalState");
    expect(fixtureSource).toContain("openFromSandbox");
    expect(liveSource).toContain("useExecutionLivePositionHandoffState");
    expect(livePositionHandoffStateHookSource).toContain("openFromLivePosition");
    expect(hookSource).toContain('source: "live_position"');

    for (const fragment of forbiddenClientSafeFragments) {
      expect(
        adapterSource,
        `existing adapter must not include ${fragment}`,
      ).not.toContain(fragment);
    }
  });
});
