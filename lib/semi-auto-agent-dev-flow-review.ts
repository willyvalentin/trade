import type { SemiAutoAgentHandoffPreviewResult } from "@/lib/semi-auto-agent-handoff-preview";
import {
  initialSemiAutoAgentDevFlowState,
  transitionSemiAutoAgentDevFlow,
  type SemiAutoAgentDevFlowState,
} from "@/lib/semi-auto-agent-dev-flow-state-machine";
import type { SemiAutoAgentResultCaptureStubResult } from "@/lib/semi-auto-agent-result-capture-stub";

export type SemiAutoAgentDevFlowReviewSafetyCheck = {
  label: string;
  passed: boolean;
  value: string;
};

export type SemiAutoAgentDevFlowReview = {
  state: SemiAutoAgentDevFlowState;
  hasActivePreview: boolean;
  payloadId: string | null;
  ticker: string | null;
  action: "buy" | "sell" | null;
  quantity: number | null;
  adapterStatus: string | null;
  localResultStatus: string | null;
  terminalOutcome: string | null;
  blockedReasons: string[];
  warnings: string[];
  safetyChecks: SemiAutoAgentDevFlowReviewSafetyCheck[];
};

function uniqueItems(items: readonly string[]): string[] {
  return [...new Set(items.filter((item) => item.trim().length > 0))];
}

function buildStateFromPreview(
  preview: SemiAutoAgentHandoffPreviewResult,
  captureResult: SemiAutoAgentResultCaptureStubResult | null,
): SemiAutoAgentDevFlowState {
  if (preview.status === "unavailable") {
    return { ...initialSemiAutoAgentDevFlowState };
  }

  const payloadTransition = transitionSemiAutoAgentDevFlow(
    initialSemiAutoAgentDevFlowState,
    {
      type:
        preview.payloadResult?.status === "ready"
          ? "BUILD_PAYLOAD_SUCCEEDED"
          : "BUILD_PAYLOAD_BLOCKED",
      payloadResult: preview.payloadResult,
    },
  );

  const prepareTransition = transitionSemiAutoAgentDevFlow(
    payloadTransition.state,
    {
      type:
        preview.adapterResult?.status === "waiting_for_manual_confirmation"
          ? "MOCK_PREPARE_SUCCEEDED"
          : "MOCK_PREPARE_BLOCKED",
      adapterResult: preview.adapterResult,
    },
  );

  const waitingTransition = transitionSemiAutoAgentDevFlow(
    prepareTransition.state,
    {
      type: "MANUAL_CONFIRMATION_WAITING",
    },
  );

  if (!captureResult || !waitingTransition.accepted) {
    return waitingTransition.accepted
      ? waitingTransition.state
      : prepareTransition.state;
  }

  return transitionSemiAutoAgentDevFlow(waitingTransition.state, {
    type: "LOCAL_RESULT_SELECTED",
    captureResult,
  }).state;
}

export function buildSemiAutoAgentDevFlowReview(
  preview: SemiAutoAgentHandoffPreviewResult,
  captureResult: SemiAutoAgentResultCaptureStubResult | null,
): SemiAutoAgentDevFlowReview {
  const state = buildStateFromPreview(preview, captureResult);
  const payload = preview.payloadResult?.payload ?? null;
  const adapter = preview.adapterResult;
  const localResult = state.captureResult ?? captureResult;
  const warnings = uniqueItems([
    ...state.warnings,
    ...(preview.payloadResult?.warnings ?? []),
    ...(adapter?.warnings ?? []),
  ]);
  const blockedReasons = uniqueItems([
    ...state.blockedReasons,
    ...(preview.payloadResult?.errors ?? []),
    ...(adapter?.errors ?? []),
    ...(adapter?.blocking_reason ? [adapter.blocking_reason] : []),
    preview.status === "blocked" ? preview.message : "",
  ]);

  return {
    state,
    hasActivePreview: preview.status !== "unavailable",
    payloadId: payload?.payload_id ?? adapter?.payload_id ?? null,
    ticker: payload?.ticker ?? adapter?.ticker ?? localResult?.ticker ?? null,
    action: payload?.action ?? adapter?.action ?? localResult?.action ?? null,
    quantity:
      payload?.quantity ?? adapter?.quantity ?? localResult?.quantity ?? null,
    adapterStatus: adapter?.status ?? null,
    localResultStatus: localResult?.status ?? null,
    terminalOutcome: state.terminal ? state.status : null,
    blockedReasons,
    warnings,
    safetyChecks: [
      {
        label: "Semi-auto mode only",
        passed: payload?.mode === "semi_auto",
        value: payload?.mode ?? "not available",
      },
      {
        label: "Manual final confirmation required",
        passed:
          adapter?.manual_final_confirmation_required === true ||
          payload?.authority.human_final_confirmation_required === true,
        value:
          adapter?.manual_final_confirmation_required === true ||
          payload?.authority.human_final_confirmation_required === true
            ? "true"
            : "not available",
      },
      {
        label: "Automatic submit allowed",
        passed:
          adapter?.automatic_submit_allowed === false ||
          payload?.authority.automatic_submit_allowed === false,
        value: String(
          adapter?.automatic_submit_allowed ??
            payload?.authority.automatic_submit_allowed ??
            "not available",
        ),
      },
      {
        label: "Automatic submit attempted",
        passed: adapter?.automatic_submit_attempted === false,
        value: String(adapter?.automatic_submit_attempted ?? "not available"),
      },
      {
        label: "No Avanza order placed",
        passed: localResult
          ? localResult.no_avanza_confirmation_captured === true
          : true,
        value: "true",
      },
      {
        label: "No broker submit by Ture",
        passed: localResult
          ? localResult.no_broker_order_submitted_by_ture === true
          : true,
        value: "true",
      },
      {
        label: "Local-only review",
        passed: localResult ? localResult.local_only === true : true,
        value: "true",
      },
    ],
  };
}
