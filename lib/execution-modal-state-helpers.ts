import type { BrokerExecutionStatus } from "@/lib/execution";
import {
  getExecutionLifecycleDisplayLabel,
  transitionExecutionLifecycle,
  type ExecutionLifecycleSnapshot,
} from "@/lib/execution-state-machine";
import type { ExecutionOrchestratorResult } from "@/lib/execution-orchestrator";

export type ExecutionModalSource = "fixture" | "live_position";
export type ExecutionModalAsyncStatus = "idle" | "pending" | "success" | "failure";
export type ExecutionModalAgentProgressType = string;

export type ExecutionModalPreparationState = {
  status: ExecutionModalAsyncStatus;
  message: string;
  error: string;
};

export type ExecutionModalCaptureState = {
  status: ExecutionModalAsyncStatus;
  brokerStatus: BrokerExecutionStatus;
  executedPrice: string;
  orderId: string;
  brokerTimestamp: string;
  message: string;
  error: string;
};

export type ExecutionModalAgentProgressState = {
  selectedType: ExecutionModalAgentProgressType;
  timelineCount: number;
  message: string;
  error: string;
};

export type ExecutionModalState = {
  isOpen: boolean;
  source: ExecutionModalSource | null;
  selectedIntent: ExecutionOrchestratorResult["selectedIntent"];
  selectedHandoff: ExecutionOrchestratorResult["handoff"];
  localLifecycle: ExecutionLifecycleSnapshot | null;
  captureBaseLifecycle: ExecutionLifecycleSnapshot | null;
  preparation: ExecutionModalPreparationState;
  capture: ExecutionModalCaptureState;
  agentProgress: ExecutionModalAgentProgressState;
};

export type OpenExecutionModalStateInput = {
  result: ExecutionOrchestratorResult;
  source: ExecutionModalSource;
};

export type ExecutionModalPrepareResult =
  | {
      status: "pending";
      message?: string | null;
    }
  | {
      status: "success";
      localLifecycle?: ExecutionLifecycleSnapshot | null;
      captureBaseLifecycle?: ExecutionLifecycleSnapshot | null;
      createdAt?: string | null;
      followUpCreatedAt?: string | null;
      startMessage?: string | null;
      followUpMessage?: string | null;
      successMessage?: string | null;
    }
  | {
      status: "failure";
      error: string;
      message?: string | null;
    };

export type ExecutionModalCaptureResult =
  | {
      status: "pending";
      message?: string | null;
    }
  | {
      status: "success";
      localLifecycle?: ExecutionLifecycleSnapshot | null;
      captureBaseLifecycle?: ExecutionLifecycleSnapshot | null;
      brokerStatus?: BrokerExecutionStatus | null;
      executedPrice?: string | null;
      orderId?: string | null;
      brokerTimestamp?: string | null;
      createdAt?: string | null;
      transitionMessage?: string | null;
      successMessage?: string | null;
    }
  | {
      status: "failure";
      error: string;
      message?: string | null;
    };

export type ExecutionModalDebugSummary = {
  isOpen: boolean;
  source: ExecutionModalSource | null;
  selectedIntentId: string | null;
  selectedHandoffStatus: string | null;
  lifecycleState: string | null;
  lifecycleLabel: string | null;
  preparationStatus: ExecutionModalAsyncStatus;
  captureStatus: ExecutionModalAsyncStatus;
  agentProgressTimelineCount: number;
};

const defaultPrepareCreatedAt = "2026-06-27T08:01:00.000Z";
const defaultPrepareFollowUpCreatedAt = "2026-06-27T08:02:00.000Z";
const defaultCaptureCreatedAt = "2026-06-27T08:03:00.000Z";

function stringOrDefault(value: string | null | undefined, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function createClosedExecutionModalState(): ExecutionModalState {
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

export function openExecutionModalState({
  result,
  source,
}: OpenExecutionModalStateInput): ExecutionModalState {
  return {
    ...createClosedExecutionModalState(),
    isOpen: true,
    source,
    selectedIntent: result.selectedIntent,
    selectedHandoff: result.handoff,
    localLifecycle: result.lifecycle,
  };
}

export function closeExecutionModalState(): ExecutionModalState {
  return createClosedExecutionModalState();
}

export function applyExecutionPrepareResult(
  state: ExecutionModalState,
  result: ExecutionModalPrepareResult,
): ExecutionModalState {
  if (result.status === "pending") {
    return {
      ...state,
      preparation: {
        status: "pending",
        message: result.message ?? "",
        error: "",
      },
    };
  }

  if (result.status === "failure") {
    return {
      ...state,
      preparation: {
        status: "failure",
        message: result.message ?? "",
        error: result.error,
      },
    };
  }

  if (result.localLifecycle) {
    return {
      ...state,
      localLifecycle: result.localLifecycle,
      captureBaseLifecycle:
        result.captureBaseLifecycle === undefined
          ? result.localLifecycle
          : result.captureBaseLifecycle,
      preparation: {
        status: "success",
        message:
          result.successMessage ??
          (state.selectedIntent?.mode === "automatic"
            ? "Preparation reached broker order submitting."
            : "Preparation reached manual confirmation."),
        error: "",
      },
    };
  }

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

  const createdAt = stringOrDefault(result.createdAt, defaultPrepareCreatedAt);
  const start = transitionExecutionLifecycle(
    state.localLifecycle,
    "start_broker_preparation",
    {
      createdAt,
      intentId: state.selectedIntent.intent_id,
      handoffVersion: state.selectedHandoff.version,
      mode: state.selectedIntent.mode,
      action: state.selectedIntent.action,
      triggerType: state.selectedIntent.trigger_type,
      message:
        result.startMessage ?? "Local baseline preparation transition.",
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
    createdAt: stringOrDefault(
      result.followUpCreatedAt,
      defaultPrepareFollowUpCreatedAt,
    ),
    intentId: state.selectedIntent.intent_id,
    handoffVersion: state.selectedHandoff.version,
    mode: state.selectedIntent.mode,
    action: state.selectedIntent.action,
    triggerType: state.selectedIntent.trigger_type,
    message:
      result.followUpMessage ?? "Local baseline preparation follow-up transition.",
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
        result.successMessage ??
        (state.selectedIntent.mode === "automatic"
          ? "Preparation reached broker order submitting."
          : "Preparation reached manual confirmation."),
      error: "",
    },
  };
}

export function applyExecutionCaptureResult(
  state: ExecutionModalState,
  result: ExecutionModalCaptureResult,
): ExecutionModalState {
  if (result.status === "pending") {
    return {
      ...state,
      capture: {
        ...state.capture,
        status: "pending",
        message: result.message ?? "",
        error: "",
      },
    };
  }

  if (result.status === "failure") {
    return {
      ...state,
      capture: {
        ...state.capture,
        status: "failure",
        message: result.message ?? "",
        error: result.error,
      },
    };
  }

  if (result.localLifecycle) {
    const capturedAt = stringOrDefault(
      result.brokerTimestamp ?? result.createdAt,
      defaultCaptureCreatedAt,
    );

    return {
      ...state,
      localLifecycle: result.localLifecycle,
      captureBaseLifecycle:
        result.captureBaseLifecycle === undefined
          ? state.captureBaseLifecycle
          : result.captureBaseLifecycle,
      capture: {
        ...state.capture,
        status: "success",
        brokerStatus: result.brokerStatus ?? "filled",
        executedPrice: result.executedPrice ?? "123.45",
        orderId: result.orderId ?? "modal-baseline-order-001",
        brokerTimestamp: capturedAt,
        message: result.successMessage ?? "Broker result captured locally.",
        error: "",
      },
    };
  }

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

  const capturedAt = stringOrDefault(result.createdAt, defaultCaptureCreatedAt);
  const captureBase = state.captureBaseLifecycle ?? state.localLifecycle;
  const capture = transitionExecutionLifecycle(captureBase, "capture_broker_result", {
    createdAt: capturedAt,
    intentId: state.selectedIntent.intent_id,
    mode: state.selectedIntent.mode,
    action: state.selectedIntent.action,
    triggerType: state.selectedIntent.trigger_type,
    brokerStatus: result.brokerStatus ?? "filled",
    message: result.transitionMessage ?? "Local baseline capture transition.",
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
      brokerStatus: result.brokerStatus ?? "filled",
      executedPrice: result.executedPrice ?? "123.45",
      orderId: result.orderId ?? "modal-baseline-order-001",
      brokerTimestamp: stringOrDefault(result.brokerTimestamp, capturedAt),
      message: result.successMessage ?? "Broker result captured locally.",
      error: "",
    },
  };
}

export function buildExecutionModalDebugSummary(
  state: ExecutionModalState,
): ExecutionModalDebugSummary {
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
