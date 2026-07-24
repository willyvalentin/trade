import type { MockSemiAutoBrowserAgentResult } from "@/lib/mock-semi-auto-browser-agent-adapter";
import type { BuildSemiAutoAgentPayloadResult } from "@/lib/semi-auto-agent-payload-builder";
import type { SemiAutoAgentResultCaptureStubResult } from "@/lib/semi-auto-agent-result-capture-stub";

export type SemiAutoAgentDevFlowStateStatus =
  | "idle"
  | "payload_ready"
  | "payload_blocked"
  | "preview_ready"
  | "waiting_for_manual_confirmation"
  | "result_captured_local"
  | "completed_local"
  | "cancelled_local"
  | "broker_rejected_local"
  | "failed_local"
  | "timeout_local"
  | "unknown_needs_review";

export type SemiAutoAgentDevFlowEventType =
  | "BUILD_PAYLOAD_SUCCEEDED"
  | "BUILD_PAYLOAD_BLOCKED"
  | "MOCK_PREPARE_SUCCEEDED"
  | "MOCK_PREPARE_BLOCKED"
  | "MANUAL_CONFIRMATION_WAITING"
  | "LOCAL_RESULT_SELECTED"
  | "RESET";

export type SemiAutoAgentDevFlowState = {
  status: SemiAutoAgentDevFlowStateStatus;
  payloadResult: BuildSemiAutoAgentPayloadResult | null;
  adapterResult: MockSemiAutoBrowserAgentResult | null;
  captureResult: SemiAutoAgentResultCaptureStubResult | null;
  terminal: boolean;
  warnings: string[];
  blockedReasons: string[];
};

export type SemiAutoAgentDevFlowEvent =
  | {
      type: "BUILD_PAYLOAD_SUCCEEDED" | "BUILD_PAYLOAD_BLOCKED";
      payloadResult: BuildSemiAutoAgentPayloadResult | null;
    }
  | {
      type: "MOCK_PREPARE_SUCCEEDED" | "MOCK_PREPARE_BLOCKED";
      adapterResult: MockSemiAutoBrowserAgentResult | null;
    }
  | { type: "MANUAL_CONFIRMATION_WAITING" }
  | {
      type: "LOCAL_RESULT_SELECTED";
      captureResult: SemiAutoAgentResultCaptureStubResult | null;
    }
  | { type: "RESET" };

export type SemiAutoAgentDevFlowTransitionResult = {
  state: SemiAutoAgentDevFlowState;
  event: SemiAutoAgentDevFlowEventType;
  accepted: boolean;
  warning: string | null;
};

export const initialSemiAutoAgentDevFlowState: SemiAutoAgentDevFlowState = {
  status: "idle",
  payloadResult: null,
  adapterResult: null,
  captureResult: null,
  terminal: false,
  warnings: [],
  blockedReasons: [],
};

function withWarning(
  state: SemiAutoAgentDevFlowState,
  event: SemiAutoAgentDevFlowEventType,
  warning: string,
): SemiAutoAgentDevFlowTransitionResult {
  return {
    state: {
      ...state,
      warnings: [...state.warnings, warning],
    },
    event,
    accepted: false,
    warning,
  };
}

function blockReasonsFromPayload(
  payloadResult: BuildSemiAutoAgentPayloadResult | null,
): string[] {
  if (!payloadResult) {
    return ["payload_missing"];
  }

  return [...payloadResult.errors, ...payloadResult.validation.errors];
}

function blockReasonsFromAdapter(
  adapterResult: MockSemiAutoBrowserAgentResult | null,
): string[] {
  if (!adapterResult) {
    return ["mock_prepare_result_missing"];
  }

  return [
    ...(adapterResult.blocking_reason ? [adapterResult.blocking_reason] : []),
    ...adapterResult.errors,
  ];
}

function payloadReady(
  payloadResult: BuildSemiAutoAgentPayloadResult | null,
): boolean {
  const payload = payloadResult?.payload;

  return (
    payloadResult?.status === "ready" &&
    payloadResult.validation.valid === true &&
    payload?.mode === "semi_auto" &&
    payload.authority.human_final_confirmation_required === true &&
    payload.authority.automatic_submit_allowed === false &&
    payload.authority.final_confirmation_actor === "human" &&
    payload.authority.agent_can_submit_order === false
  );
}

function adapterReady(
  state: SemiAutoAgentDevFlowState,
  adapterResult: MockSemiAutoBrowserAgentResult | null,
): boolean {
  return (
    state.status === "payload_ready" &&
    payloadReady(state.payloadResult) &&
    adapterResult?.status === "waiting_for_manual_confirmation" &&
    adapterResult.lifecycle_status === "waiting_for_manual_confirmation" &&
    adapterResult.manual_final_confirmation_required === true &&
    adapterResult.automatic_submit_attempted === false &&
    adapterResult.automatic_submit_allowed === false &&
    adapterResult.requested_automatic_submit_allowed === false &&
    adapterResult.validation.valid === true
  );
}

function terminalStatusForCapture(
  captureResult: SemiAutoAgentResultCaptureStubResult | null,
): SemiAutoAgentDevFlowStateStatus {
  if (!captureResult) {
    return "unknown_needs_review";
  }

  if (captureResult.status === "user_confirmed") {
    return "completed_local";
  }

  if (captureResult.status === "user_cancelled") {
    return "cancelled_local";
  }

  if (captureResult.status === "broker_rejected") {
    return "broker_rejected_local";
  }

  if (captureResult.status === "failed") {
    return "failed_local";
  }

  if (captureResult.status === "timeout") {
    return "timeout_local";
  }

  return "unknown_needs_review";
}

function captureIsLocalOnly(
  captureResult: SemiAutoAgentResultCaptureStubResult | null,
): boolean {
  return (
    captureResult?.local_only === true &&
    captureResult.mock_only === true &&
    captureResult.no_avanza_confirmation_captured === true &&
    captureResult.no_broker_order_submitted_by_ture === true &&
    captureResult.automatic_submit_enabled === false &&
    captureResult.supabase_write_attempted === false &&
    captureResult.audit_writer_invoked === false &&
    captureResult.trade_stats_pnl_mutated === false
  );
}

export function transitionSemiAutoAgentDevFlow(
  currentState: SemiAutoAgentDevFlowState,
  event: SemiAutoAgentDevFlowEvent,
): SemiAutoAgentDevFlowTransitionResult {
  if (event.type === "RESET") {
    return {
      state: { ...initialSemiAutoAgentDevFlowState },
      event: event.type,
      accepted: true,
      warning: null,
    };
  }

  if (event.type === "BUILD_PAYLOAD_SUCCEEDED") {
    if (!payloadReady(event.payloadResult)) {
      return {
        state: {
          ...currentState,
          status: "payload_blocked",
          payloadResult: event.payloadResult,
          blockedReasons: blockReasonsFromPayload(event.payloadResult),
        },
        event: event.type,
        accepted: false,
        warning: "payload_not_ready_for_semi_auto_dev_flow",
      };
    }

    return {
      state: {
        ...currentState,
        status: "payload_ready",
        payloadResult: event.payloadResult,
        adapterResult: null,
        captureResult: null,
        terminal: false,
        blockedReasons: [],
      },
      event: event.type,
      accepted: true,
      warning: null,
    };
  }

  if (event.type === "BUILD_PAYLOAD_BLOCKED") {
    return {
      state: {
        ...currentState,
        status: "payload_blocked",
        payloadResult: event.payloadResult,
        adapterResult: null,
        captureResult: null,
        terminal: false,
        blockedReasons: blockReasonsFromPayload(event.payloadResult),
      },
      event: event.type,
      accepted: true,
      warning: null,
    };
  }

  if (event.type === "MOCK_PREPARE_SUCCEEDED") {
    if (!adapterReady(currentState, event.adapterResult)) {
      return {
        state: {
          ...currentState,
          adapterResult: event.adapterResult,
          blockedReasons: blockReasonsFromAdapter(event.adapterResult),
        },
        event: event.type,
        accepted: false,
        warning: "mock_prepare_not_ready_for_manual_confirmation",
      };
    }

    return {
      state: {
        ...currentState,
        status: "preview_ready",
        adapterResult: event.adapterResult,
        captureResult: null,
        terminal: false,
        blockedReasons: [],
      },
      event: event.type,
      accepted: true,
      warning: null,
    };
  }

  if (event.type === "MOCK_PREPARE_BLOCKED") {
    return {
      state: {
        ...currentState,
        adapterResult: event.adapterResult,
        blockedReasons: blockReasonsFromAdapter(event.adapterResult),
      },
      event: event.type,
      accepted: true,
      warning: null,
    };
  }

  if (event.type === "MANUAL_CONFIRMATION_WAITING") {
    if (
      currentState.status !== "preview_ready" ||
      !adapterReady(
        { ...currentState, status: "payload_ready" },
        currentState.adapterResult,
      )
    ) {
      return withWarning(
        currentState,
        event.type,
        "manual_confirmation_waiting_requires_preview_ready",
      );
    }

    return {
      state: {
        ...currentState,
        status: "waiting_for_manual_confirmation",
        terminal: false,
      },
      event: event.type,
      accepted: true,
      warning: null,
    };
  }

  if (event.type === "LOCAL_RESULT_SELECTED") {
    if (currentState.status !== "waiting_for_manual_confirmation") {
      return withWarning(
        currentState,
        event.type,
        "local_result_capture_requires_waiting_for_manual_confirmation",
      );
    }

    if (!captureIsLocalOnly(event.captureResult)) {
      return withWarning(
        currentState,
        event.type,
        "local_result_capture_safety_flags_invalid",
      );
    }

    const resultCaptured: SemiAutoAgentDevFlowState = {
      ...currentState,
      status: "result_captured_local",
      captureResult: event.captureResult,
      terminal: false,
    };

    return {
      state: {
        ...resultCaptured,
        status: terminalStatusForCapture(event.captureResult),
        terminal: true,
      },
      event: event.type,
      accepted: true,
      warning: null,
    };
  }

  return withWarning(currentState, event.type, "unknown_dev_flow_event");
}
