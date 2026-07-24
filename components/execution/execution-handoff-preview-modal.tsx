"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ExecutionHandoffModalComposition,
} from "@/components/execution/ExecutionHandoffModalComposition";
import {
  ExecutionHandoffModalShell,
} from "@/components/execution/ExecutionHandoffModalShell";
import type { AgentProgressStubTimelineItem } from "@/components/execution/AgentProgressStubPanel";
import type { ExecutionSandboxQaOverallStatus } from "@/components/execution/ExecutionSandboxQaPanel";
import type { ExecutionSandboxQaItem } from "@/lib/handoff-modal-data-mappers";
import {
  buildAvanzaDryRunOrderInputFromExecutionIntent,
} from "@/lib/execution-intent-to-avanza-dry-run";
import {
  buildSemiAutoAgentHandoffPreview,
} from "@/lib/semi-auto-agent-handoff-preview";
import type {
  SemiAutoAgentResultCaptureStubResult,
} from "@/lib/semi-auto-agent-result-capture-stub";
import {
  createAvanzaAgentBridgeRunnerFromConfig,
  createAvanzaAgentBridgeFromConfig,
} from "@/lib/avanza-agent-bridge-factory";
import { readAvanzaAgentBridgeConfig } from "@/lib/avanza-agent-bridge-config";
import {
  appendAvanzaAgentRun,
  createStoredAvanzaAgentRun,
} from "@/lib/avanza-agent-run-store";
import {
  buildAvanzaAgentBridgeEnvelope,
  getAvanzaAgentBridgeTransportDisplayLabel,
  isRealAvanzaAgentBridge,
  validateAvanzaAgentBridgeEnvelope,
} from "@/lib/avanza-agent-bridge";
import {
  buildAvanzaAgentProgressEvent,
  buildAvanzaAgentRequest,
  getAvanzaAgentProgressDisplayLabel,
  mapAvanzaAgentProgressToLifecycleEventType,
  validateAvanzaAgentRequest,
  type AvanzaAgentProgressEventType,
  type AvanzaAgentResult,
} from "@/lib/avanza-agent-adapter";
import {
  isExecutionDevToolsEnabled,
  type BrokerExecutionStatus,
} from "@/lib/execution";
import type { ExecutionOrchestratorResult } from "@/lib/execution-orchestrator";
import {
  type ExecutionUiBadgeTone,
  type ExecutionUiSeverity,
  type ExecutionUiStatus,
} from "@/lib/execution-ui-status";
import { buildExecutionLifecycleModalCopy } from "@/lib/execution-lifecycle-ui-state-adapter";
import {
  applyExecutionCaptureResult,
  applyExecutionPrepareResult,
  type ExecutionModalState,
} from "@/lib/execution-modal-state-helpers";
import {
  getExecutionLifecycleDisplayLabel,
  isManualConfirmationState,
  transitionExecutionLifecycle,
  type ExecutionLifecycleSnapshot,
} from "@/lib/execution-state-machine";
import {
  appendExecutionAuditEvents,
  buildExecutionAuditEventFromLifecycleEvent,
  createExecutionAuditEvent,
} from "@/lib/execution-event-log";
import {
  buildTureExecutionRecord,
  type BrokerExecutionCaptureStatus,
  type BrokerExecutionCaptureResult,
} from "@/lib/broker-execution-capture";
import { appendExecutionRecord } from "@/lib/execution-record-store";
import { useAvanzaReadinessState } from "@/hooks/execution/useAvanzaReadinessState";
import { useEarlyPhasePreviewState } from "@/hooks/execution/useEarlyPhasePreviewState";
import { useLatePhasePreviewState } from "@/hooks/execution/useLatePhasePreviewState";
import {
  useLocalhostBridgeControlsState,
} from "@/hooks/execution/useLocalhostBridgeControlsState";
import { useMiddlePhasePreviewState } from "@/hooks/execution/useMiddlePhasePreviewState";

export type ExecutionHandoffPreviewModalProps = {
  result: ExecutionOrchestratorResult;
  status: ExecutionUiStatus;
  onClose: () => void;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatShares(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function agentCommandValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value).replaceAll("_", " ");
}

function shortPayloadId(value: string | null) {
  if (!value) {
    return "—";
  }

  if (value.length <= 14) {
    return value;
  }

  return value.slice(0, 8) + "…" + value.slice(-4);
}

function safeText(value: string | null | undefined, fallback = "—") {
  if (!value || value.trim().length === 0) {
    return fallback;
  }

  return value;
}

function CompanyIdentity({
  ticker,
  companyName,
  size = "normal",
}: {
  ticker: string;
  companyName?: string | null;
  size?: "normal" | "compact" | "live";
}) {
  const safeTicker = safeText(ticker, "—").toUpperCase();
  const safeCompanyName = safeText(companyName, safeTicker);
  const initials = safeTicker.slice(0, 2) || "T";
  const avatarClassName =
    size === "live"
      ? "trade-company-identity__avatar trade-company-identity__avatar--live"
      : `flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] font-mono font-bold uppercase tracking-[0.08em] text-zinc-200 ${
          size === "compact" ? "h-10 w-10 text-xs" : "h-12 w-12 text-sm"
        }`;
  const tickerClassName =
    size === "live"
      ? "trade-company-identity__ticker trade-company-identity__ticker--live"
      : `truncate font-mono font-semibold tracking-normal text-white ${
          size === "compact" ? "text-2xl" : "text-3xl"
        }`;
  const nameClassName =
    size === "live"
      ? "trade-company-identity__name trade-company-identity__name--live"
      : "mt-0.5 truncate text-sm text-zinc-400";

  return (
    <div className="trade-company-identity flex min-w-0 items-center gap-3">
      <div aria-hidden="true" className={avatarClassName}>
        {initials}
      </div>
      <div className="min-w-0">
        <div className={tickerClassName}>{safeTicker}</div>
        <div className={nameClassName}>{safeCompanyName}</div>
      </div>
    </div>
  );
}
function executionUiStatusPanelClassName(severity: ExecutionUiSeverity) {
  if (severity === "danger") {
    return "border-rose-300/30 bg-rose-300/[0.08]";
  }

  if (severity === "success") {
    return "border-emerald-300/25 bg-emerald-300/[0.08]";
  }

  if (severity === "warning") {
    return "border-amber-300/25 bg-amber-300/[0.08]";
  }

  if (severity === "info") {
    return "border-cyan-300/20 bg-cyan-300/[0.06]";
  }

  return "border-white/10 bg-white/[0.035]";
}

function executionUiStatusBadgeClassName(tone: ExecutionUiBadgeTone) {
  if (tone === "danger") {
    return "border-rose-300/40 bg-rose-300/15 text-rose-100";
  }

  if (tone === "success") {
    return "border-emerald-300/35 bg-emerald-300/10 text-emerald-100";
  }

  if (tone === "warning") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-100";
  }

  if (tone === "info") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-300";
}

function executionHandoffStatusTone(status: "ready" | "blocked" | "invalid_intent") {
  if (status === "ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "blocked") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-amber-300/30 bg-amber-300/10 text-amber-100";
}

function avanzaAgentRequestValidationTone(
  status: "ok" | "warning" | "invalid",
) {
  if (status === "ok") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function executionSafetyCheckTone(status: "passed" | "warning" | "failed") {
  if (status === "passed") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function executionLifecycleStubTone(
  state: ExecutionLifecycleSnapshot["currentState"],
) {
  if (isManualConfirmationState(state)) {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }

  if (state === "broker_order_submitting") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (state === "broker_order_preparing") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-300";
}

function terminalExecutionEventForBrokerStatus(
  status: BrokerExecutionStatus,
  captureStatus: BrokerExecutionCaptureStatus,
) {
  if (
    captureStatus === "captured" &&
    (status === "submitted" ||
      status === "filled" ||
      status === "partially_filled")
  ) {
    return "complete_execution" as const;
  }

  if (status === "rejected") {
    return "fail_execution" as const;
  }

  if (status === "cancelled") {
    return "cancel_execution" as const;
  }

  if (status === "unknown") {
    return "mark_unknown" as const;
  }

  return "fail_execution" as const;
}

function executionIntentReason(intent: ExecutionOrchestratorResult["selectedIntent"]) {
  if (intent && "reason" in intent && typeof intent.reason === "string") {
    return intent.reason;
  }

  return intent?.safety_warnings[0] ?? "Execution intent selected by Ture.";
}

function executionIntentIntendedPrice(
  intent: ExecutionOrchestratorResult["selectedIntent"],
) {
  if (
    intent &&
    "intendedPrice" in intent &&
    typeof intent.intendedPrice === "number"
  ) {
    return intent.intendedPrice;
  }

  return intent?.trading_package.limit_price ?? null;
}

const agentProgressStubEventTypes: AvanzaAgentProgressEventType[] = [
  "agent_started",
  "broker_session_check_started",
  "broker_session_ready",
  "broker_session_missing",
  "instrument_search_started",
  "instrument_selected",
  "order_form_opened",
  "order_form_filled",
  "order_review_ready",
  "waiting_for_manual_confirmation",
  "automatic_submit_started",
  "broker_confirmation_detected",
  "broker_result_returned",
  "agent_failed",
  "agent_cancelled",
];

export function ExecutionHandoffPreviewModal({
  result,
  status,
  onClose,
}: {
  result: ExecutionOrchestratorResult;
  status: ExecutionUiStatus;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const [localLifecycle, setLocalLifecycle] =
    useState<ExecutionLifecycleSnapshot>(() => result.lifecycle);
  const [captureBaseLifecycle, setCaptureBaseLifecycle] =
    useState<ExecutionLifecycleSnapshot | null>(null);
  const [preparationStubMessage, setPreparationStubMessage] = useState("");
  const [preparationStubError, setPreparationStubError] = useState("");
  const [isAgentRunnerRunning, setIsAgentRunnerRunning] = useState(false);
  const [agentRunnerResult, setAgentRunnerResult] =
    useState<AvanzaAgentResult | null>(null);
  const [agentRunnerError, setAgentRunnerError] = useState("");
  const [agentRunStoreMessage, setAgentRunStoreMessage] = useState("");
  const [stubBrokerStatus, setStubBrokerStatus] =
    useState<BrokerExecutionStatus>("submitted");
  const [stubExecutedPrice, setStubExecutedPrice] = useState("");
  const [stubOrderId, setStubOrderId] = useState("");
  const [stubBrokerTimestamp, setStubBrokerTimestamp] = useState("");
  const [stubCaptureResult, setStubCaptureResult] =
    useState<BrokerExecutionCaptureResult | null>(null);
  const [stubCaptureMessage, setStubCaptureMessage] = useState("");
  const [stubCaptureError, setStubCaptureError] = useState("");
  const [selectedAgentProgressType, setSelectedAgentProgressType] =
    useState<AvanzaAgentProgressEventType>("agent_started");
  const [agentProgressTimeline, setAgentProgressTimeline] = useState<
    AgentProgressStubTimelineItem[]
  >([]);
  const [agentProgressStubMessage, setAgentProgressStubMessage] = useState("");
  const [agentProgressStubError, setAgentProgressStubError] = useState("");
  const intent = result.selectedIntent;
  const handoff = result.handoff;
  const modalStateForHelper = (): ExecutionModalState => ({
    isOpen: true,
    source: null,
    selectedIntent: intent,
    selectedHandoff: handoff,
    localLifecycle,
    captureBaseLifecycle,
    preparation: {
      status: preparationStubError
        ? "failure"
        : preparationStubMessage
          ? "success"
          : "idle",
      message: preparationStubMessage,
      error: preparationStubError,
    },
    capture: {
      status: stubCaptureError
        ? "failure"
        : stubCaptureMessage
          ? "success"
          : "idle",
      brokerStatus: stubBrokerStatus,
      executedPrice: stubExecutedPrice,
      orderId: stubOrderId,
      brokerTimestamp: stubBrokerTimestamp,
      message: stubCaptureMessage,
      error: stubCaptureError,
    },
    agentProgress: {
      selectedType: selectedAgentProgressType,
      timelineCount: agentProgressTimeline.length,
      message: agentProgressStubMessage,
      error: agentProgressStubError,
    },
  });
  const avanzaAgentRequestPreview = useMemo(() => {
    if (!result.handoff) {
      return {
        request: null,
        validation: null,
        error: "Future agent request preview requires an Avanza handoff.",
      };
    }

    if (result.handoff.status !== "ready") {
      return {
        request: null,
        validation: null,
        error:
          "Future agent request preview is unavailable until the handoff is ready.",
      };
    }

    try {
      const request = buildAvanzaAgentRequest(result.handoff, {
        metadata: {
          preview_only: true,
          source: "execution_handoff_preview_modal",
          broker_connected: false,
          no_order_prepared: true,
          no_order_submitted: true,
        },
      });

      return {
        request,
        validation: validateAvanzaAgentRequest(request),
        error: null,
      };
    } catch (error) {
      return {
        request: null,
        validation: null,
        error:
          error instanceof Error
            ? error.message
            : "Future agent request preview could not be built.",
      };
    }
  }, [result.handoff]);
  const avanzaAgentBridgeEnvelopePreview = useMemo(() => {
    const request = avanzaAgentRequestPreview.request;

    if (!isExecutionDevToolsEnabled()) {
      return {
        envelope: null,
        validation: null,
        error: "Bridge request envelope preview is hidden unless dev tools are enabled.",
      };
    }

    if (!request) {
      return {
        envelope: null,
        validation: null,
        error:
          avanzaAgentRequestPreview.error ??
          "Bridge request envelope preview requires a valid future-agent request.",
      };
    }

    try {
      const envelope = buildAvanzaAgentBridgeEnvelope("request", request, {
        requestId: request.requestId,
        transport: "none",
        metadata: {
          preview_only: true,
          source: "execution_handoff_preview_modal",
          no_external_avanza_bridge_connected: true,
          no_transport_connected: true,
          no_order_prepared: true,
          no_order_submitted: true,
        },
      });

      return {
        envelope,
        validation: validateAvanzaAgentBridgeEnvelope(envelope),
        error: null,
      };
    } catch (error) {
      return {
        envelope: null,
        validation: null,
        error:
          error instanceof Error
            ? error.message
            : "Bridge request envelope preview could not be built.",
      };
    }
  }, [avanzaAgentRequestPreview]);
  const avanzaDryRunRequestPreview = useMemo(() => {
    if (!isExecutionDevToolsEnabled()) {
      return null;
    }

    return buildAvanzaDryRunOrderInputFromExecutionIntent({
      executionIntent: result.selectedIntent,
      handoffPayload: result.handoff,
      metadata: {
        preview_only: true,
        source: "execution_handoff_preview_modal",
        no_browser_runner: true,
        no_avanza_navigation: true,
        no_order_submitted: true,
        no_broker_result_created: true,
      },
    });
  }, [result.handoff, result.selectedIntent]);
  const semiAutoAgentHandoffPreview = useMemo(
    () =>
      buildSemiAutoAgentHandoffPreview({
        handoff: result.handoff,
        selectedIntent: result.selectedIntent,
      }),
    [result.handoff, result.selectedIntent],
  );
  const [
    semiAutoAgentResultCaptureStubState,
    setSemiAutoAgentResultCaptureStubState,
  ] = useState<{
    previewKey: string;
    result: SemiAutoAgentResultCaptureStubResult | null;
  }>({ previewKey: "unavailable:none", result: null });
  const semiAutoAgentPreviewPayloadId =
    semiAutoAgentHandoffPreview.payloadResult?.payload.payload_id ?? null;
  const semiAutoAgentPreviewKey = `${semiAutoAgentHandoffPreview.status}:${
    semiAutoAgentPreviewPayloadId ?? "none"
  }`;
  const semiAutoAgentResultCaptureStubResult =
    semiAutoAgentResultCaptureStubState.previewKey === semiAutoAgentPreviewKey
      ? semiAutoAgentResultCaptureStubState.result
      : null;
  const executionDevToolsEnabled = isExecutionDevToolsEnabled();
  const avanzaAgentRequest = avanzaAgentRequestPreview.request;
  const avanzaAgentRequestValidation = avanzaAgentRequestPreview.validation;
  const avanzaAgentRequestValidationStatus =
    avanzaAgentRequestValidation?.ok === true
      ? avanzaAgentRequestValidation.warnings.length > 0
        ? "warning"
        : "ok"
      : "invalid";
  const avanzaAgentBridgeEnvelope = avanzaAgentBridgeEnvelopePreview.envelope;
  const avanzaAgentBridgeEnvelopeValidation =
    avanzaAgentBridgeEnvelopePreview.validation;
  const avanzaAgentBridgeEnvelopeValidationStatus =
    avanzaAgentBridgeEnvelopeValidation?.ok === true
      ? avanzaAgentBridgeEnvelopeValidation.warnings.length > 0
        ? "warning"
        : "ok"
      : "invalid";
  const localhostBridgeControlsState = useLocalhostBridgeControlsState({
    avanzaAgentBridgeEnvelope,
    avanzaAgentBridgeEnvelopeValidation,
    avanzaAgentRequest,
    avanzaAgentRequestValidation,
    avanzaDryRunRequestPreview,
    executionDevToolsEnabled,
    localLifecycle,
    selectedHandoff: handoff,
    selectedIntent: intent,
    setAgentRunStoreMessage,
  });
  const {
    canCancelLocalhostBridgeRun,
    canCheckLocalhostBridgeSelfCheck,
    canRunLocalhostBridgeDryRun,
    canRunLocalhostMockAgent,
    canTestLocalhostDryRunBridgeStub,
    cancelLocalhostBridgeEcho,
    checkLocalhostBridgeSelfCheck,
    isLocalhostBridgeCancelRunning,
    isLocalhostBridgeRunRunning,
    isLocalhostBridgeSelfCheckRunning,
    isLocalhostDryRunBridgeStubRunning,
    isLocalhostMockAgentRunRunning,
    localhostBridgeCancelMessage,
    localhostBridgeCancelResult,
    localhostBridgeRunMessage,
    localhostBridgeRunResult,
    localhostBridgeSelfCheckMessage,
    localhostBridgeSelfCheckResult,
    localhostDryRunBridgeStubMessage,
    localhostDryRunBridgeStubResult,
    localhostMockAgentRunMessage,
    localhostMockAgentRunResult,
    runLocalhostBridgeEcho,
    runLocalhostMockAgent,
    testLocalhostDryRunBridgeStub,
  } = localhostBridgeControlsState;
  const earlyPhasePreviewState = useEarlyPhasePreviewState({
    avanzaDryRunRequestPreview,
    executionDevToolsEnabled,
    selectedIntent: intent,
  });
  const {
    avanzaSearchOnlyExpectedInstrumentValid,
    canCheckLocalhostInstrumentVerification,
    canCheckLocalhostSearchOnly,
    canCheckLocalhostSessionDetection,
    checkLocalhostInstrumentVerificationStub,
    checkLocalhostSearchOnlyStub,
    checkLocalhostSessionDetectionStub,
    isLocalhostInstrumentVerificationRunning,
    isLocalhostSearchOnlyRunning,
    isLocalhostSessionDetectionRunning,
    localhostInstrumentAmbiguous,
    localhostInstrumentBlocked,
    localhostInstrumentNoAvanzaTouched,
    localhostInstrumentNoBrokerSubmission,
    localhostInstrumentNoBrowserActions,
    localhostInstrumentNoFormFill,
    localhostInstrumentNoOrderPageOpened,
    localhostInstrumentRejected,
    localhostInstrumentVerification,
    localhostInstrumentVerificationMessage,
    localhostInstrumentVerificationResult,
    localhostInstrumentVerified,
    localhostSearchOnly,
    localhostSearchOnlyAmbiguous,
    localhostSearchOnlyBlocked,
    localhostSearchOnlyExactMatch,
    localhostSearchOnlyMessage,
    localhostSearchOnlyNoAvanzaTouched,
    localhostSearchOnlyNoBrokerSubmission,
    localhostSearchOnlyNoBrowserActions,
    localhostSearchOnlyNoMatch,
    localhostSearchOnlyNoOrderPageOpened,
    localhostSearchOnlyResult,
    localhostSessionDetection,
    localhostSessionDetectionMessage,
    localhostSessionDetectionNoAvanzaTouched,
    localhostSessionDetectionNoBrowserActions,
    localhostSessionDetectionReadyForSearchOnly,
    localhostSessionDetectionResult,
  } = earlyPhasePreviewState;
  const middlePhasePreviewState = useMiddlePhasePreviewState({
    avanzaDryRunRequestPreview,
    executionDevToolsEnabled,
    localhostInstrumentVerification,
    localhostInstrumentVerified,
    selectedIntent: intent,
  });
  const {
    canCheckLocalhostAdvancedFormFill,
    canCheckLocalhostInstrumentPage,
    canCheckLocalhostOrderPageOpen,
    canCheckLocalhostReviewClick,
    checkLocalhostAdvancedFormFillStub,
    checkLocalhostInstrumentPageStub,
    checkLocalhostOrderPageOpenStub,
    checkLocalhostReviewClickStub,
    isLocalhostAdvancedFormFillRunning,
    isLocalhostInstrumentPageRunning,
    isLocalhostOrderPageOpenRunning,
    isLocalhostReviewClickRunning,
    localhostAdvancedFormBlocked,
    localhostAdvancedFormFieldMismatch,
    localhostAdvancedFormFill,
    localhostAdvancedFormFilled,
    localhostAdvancedFormFillMessage,
    localhostAdvancedFormFillResult,
    localhostAdvancedFormNoAvanzaTouched,
    localhostAdvancedFormNoBrokerSubmission,
    localhostAdvancedFormNoBrowserActions,
    localhostAdvancedFormNoFinalConfirmClick,
    localhostAdvancedFormNoRealFormFieldsFilled,
    localhostAdvancedFormNoReviewClick,
    localhostAdvancedFormUnsupportedMode,
    localhostAdvancedFormValidationError,
    localhostInstrumentPage,
    localhostInstrumentPageBlocked,
    localhostInstrumentPageIdentified,
    localhostInstrumentPageMessage,
    localhostInstrumentPageMismatch,
    localhostInstrumentPageNoAvanzaTouched,
    localhostInstrumentPageNoBrokerSubmission,
    localhostInstrumentPageNoBrowserActions,
    localhostInstrumentPageNoBuySellClick,
    localhostInstrumentPageNoFormFill,
    localhostInstrumentPageNoOrderPageOpened,
    localhostInstrumentPageProhibitedControlsVisible,
    localhostInstrumentPageResult,
    localhostOrderPageBlocked,
    localhostOrderPageMismatch,
    localhostOrderPageNoAvanzaTouched,
    localhostOrderPageNoBrokerSubmission,
    localhostOrderPageNoBrowserActions,
    localhostOrderPageNoFinalConfirmClick,
    localhostOrderPageNoFormFill,
    localhostOrderPageNoRealOrderPageOpened,
    localhostOrderPageNoReviewClick,
    localhostOrderPageOpen,
    localhostOrderPageOpenMessage,
    localhostOrderPageOpenResult,
    localhostOrderPageOpened,
    localhostOrderPageWrongAction,
    localhostReviewClick,
    localhostReviewClickBlocked,
    localhostReviewClickConfirmationMismatch,
    localhostReviewClickConfirmationReady,
    localhostReviewClickFinalConfirmBlocked,
    localhostReviewClickMessage,
    localhostReviewClickNoAvanzaTouched,
    localhostReviewClickNoBrokerResult,
    localhostReviewClickNoBrowserActions,
    localhostReviewClickNoFinalConfirmClick,
    localhostReviewClickNoRealReviewClick,
    localhostReviewClickNoTradeMutation,
    localhostReviewClickResult,
    localhostReviewClickValidationError,
    localhostReviewClickWaitingForManualConfirmation,
  } = middlePhasePreviewState;
  const latePhasePreviewState = useLatePhasePreviewState({
    avanzaDryRunRequestPreview,
    executionDevToolsEnabled,
    selectedIntent: intent,
  });
  const {
    canCheckLocalhostBrokerConfirmationCapture,
    canCheckLocalhostBrokerExecutionEligibility,
    canCheckLocalhostBrokerExecutionPreview,
    canCheckLocalhostExecutionRecordEligibility,
    checkLocalhostBrokerConfirmationCaptureStub,
    checkLocalhostBrokerExecutionEligibilityStub,
    checkLocalhostBrokerExecutionPreviewStub,
    checkLocalhostExecutionRecordEligibilityStub,
    canRunExecutionRecordInsertDryRun,
    canRunFinalSettlementNoteMatchPreview,
    canRunFinalizationCandidatePreview,
    canRunFinalizationActionPreview,
    canRunFinalizationExecutionRecordBridgePreview,
    canRunExecutionRecordCandidateBuilderIntegrationPreview,
    canRunMappedBrokerExecutionResultCandidatePreview,
    executionRecordCreationPreviewResult,
    executionRecordCreationPreviewSourceDescription,
    executionRecordCreationPreviewSourceLabel,
    executionRecordInsertDryRunMessage,
    executionRecordInsertDryRunResult,
    executionRecordInsertDryRunUnavailableReason,
    executionRecordCandidateBuilderIntegrationPreviewMessage,
    executionRecordCandidateBuilderIntegrationPreviewResult,
    executionRecordCandidateBuilderIntegrationPreviewUnavailableReason,
    executionRecordEligibilityCandidate,
    executionRecordEligibilityCandidateIsPreviewOnly,
    finalSettlementNoteMatchPreviewMessage,
    finalSettlementNoteMatchPreviewResult,
    finalSettlementNoteMatchPreviewUnavailableReason,
    finalizationCandidatePreviewMessage,
    finalizationCandidatePreviewResult,
    finalizationCandidatePreviewUnavailableReason,
    finalizationActionPreviewMessage,
    finalizationActionPreviewResult,
    finalizationActionPreviewUnavailableReason,
    finalizationExecutionRecordBridgePreviewMessage,
    finalizationExecutionRecordBridgePreviewResult,
    finalizationExecutionRecordBridgePreviewUnavailableReason,
    isExecutionRecordInsertDryRunRunning,
    isExecutionRecordCandidateBuilderIntegrationPreviewRunning,
    isFinalSettlementNoteMatchPreviewRunning,
    isFinalizationCandidatePreviewRunning,
    isFinalizationActionPreviewRunning,
    isFinalizationExecutionRecordBridgePreviewRunning,
    isMappedBrokerExecutionResultCandidatePreviewRunning,
    isLocalhostBrokerConfirmationCaptureRunning,
    isLocalhostBrokerExecutionEligibilityRunning,
    isLocalhostBrokerExecutionPreviewRunning,
    isLocalhostExecutionRecordEligibilityRunning,
    localhostBrokerConfirmationBlocked,
    localhostBrokerConfirmationCapture,
    localhostBrokerConfirmationCaptured,
    localhostBrokerConfirmationCaptureMessage,
    localhostBrokerConfirmationCaptureResult,
    localhostBrokerConfirmationMismatch,
    localhostBrokerConfirmationNoAvanzaTouched,
    localhostBrokerConfirmationNoBekrafta,
    localhostBrokerConfirmationNoBrokerExecutionResult,
    localhostBrokerConfirmationNoBrowserActions,
    localhostBrokerConfirmationNoExecutionRecord,
    localhostBrokerConfirmationNoSupabaseWrite,
    localhostBrokerConfirmationNoTradeMutation,
    localhostBrokerConfirmationPartial,
    localhostBrokerConfirmationRejectedOrCancelled,
    localhostBrokerExecutionDuplicateRisk,
    localhostBrokerExecutionEligibility,
    localhostBrokerExecutionEligibilityBlocked,
    localhostBrokerExecutionEligibilityFailed,
    localhostBrokerExecutionEligibilityMessage,
    localhostBrokerExecutionEligibilityNoBrokerExecutionResult,
    localhostBrokerExecutionEligibilityNoExecutionRecord,
    localhostBrokerExecutionEligibilityNoSupabaseWrite,
    localhostBrokerExecutionEligibilityNoTradeMutation,
    localhostBrokerExecutionEligibilityResult,
    localhostBrokerExecutionEligible,
    localhostBrokerExecutionNotEligible,
    localhostBrokerExecutionPartialOnly,
    localhostBrokerExecutionPreviewMessage,
    localhostBrokerExecutionPreviewNoExecutionRecord,
    localhostBrokerExecutionPreviewNoRealBrokerExecutionResult,
    localhostBrokerExecutionPreviewNoSupabaseWrite,
    localhostBrokerExecutionPreviewNoTradeMutation,
    localhostBrokerExecutionPreviewResult,
    localhostExecutionRecordEligibilityMessage,
    localhostExecutionRecordEligibilityResult,
    localhostExecutionRecordNoBrokerExecutionResult,
    localhostExecutionRecordNoExecutionRecord,
    localhostExecutionRecordNoSupabaseWrite,
    localhostExecutionRecordNoTradeMutation,
    mappedBrokerExecutionResultCandidatePreviewMessage,
    mappedBrokerExecutionResultCandidatePreviewResult,
    mappedBrokerExecutionResultCandidatePreviewUnavailableReason,
    runExecutionRecordInsertDryRunPreview,
    runExecutionRecordCandidateBuilderIntegrationPreview,
    runFinalizationActionPreview,
    runFinalizationExecutionRecordBridgePreview,
    runFinalSettlementNoteMatchPreview,
    runFinalizationCandidatePreview,
    runMappedBrokerExecutionResultCandidatePreview,
  } = latePhasePreviewState;
  const avanzaReadinessState = useAvanzaReadinessState({
    avanzaDryRunRequestPreview,
    earlyPhasePreviewState,
    executionDevToolsEnabled,
    latePhasePreviewState,
    localhostBridgeControlsState,
    middlePhasePreviewState,
    selectedHandoff: handoff,
    selectedIntent: intent,
  });
  const { panelProps: avanzaDryRunReadinessPanelProps } = avanzaReadinessState;

  if (!status.visible || !intent || !handoff) {
    return null;
  }

  const selectedIntent = intent;
  const selectedHandoff = handoff;
  const packageSnapshot = selectedIntent.trading_package;
  const modalCopy = buildExecutionLifecycleModalCopy({
    status,
    lifecycle: localLifecycle,
  });
  const canRunPreparationStub =
    executionDevToolsEnabled &&
    selectedHandoff.status === "ready" &&
    selectedHandoff.canPrepareOrder &&
    !isAgentRunnerRunning &&
    localLifecycle.currentState === "handoff_created";
  const preparationStubReached =
    isManualConfirmationState(localLifecycle.currentState) ||
    localLifecycle.currentState === "broker_order_submitting" ||
    captureBaseLifecycle !== null;
  const captureStubVisible =
    preparationStubReached ||
    stubCaptureResult !== null ||
    localLifecycle.currentState === "broker_result_captured" ||
    localLifecycle.currentState === "completed" ||
    localLifecycle.currentState === "failed" ||
    localLifecycle.currentState === "cancelled" ||
    localLifecycle.currentState === "unknown";
  const devCaptureStubVisible = executionDevToolsEnabled && captureStubVisible;
  const canRunCaptureStub =
    executionDevToolsEnabled &&
    preparationStubReached &&
    stubCaptureResult === null &&
    !isAgentRunnerRunning;
  const authorityMessage =
    selectedIntent.mode === "automatic"
      ? "Automatic authority allows final submit when all checks are ready, but no broker connection or order execution is implemented here."
      : "Semi-automatic mode may allow a future agent to prepare the Avanza order, but you must manually press final KÖP or SÄLJ.";
  const avanzaAgentBridgeConfig = executionDevToolsEnabled
    ? readAvanzaAgentBridgeConfig()
    : null;
  const avanzaAgentBridgeFactoryResult = executionDevToolsEnabled
    ? createAvanzaAgentBridgeFromConfig({
        selectedTransport: avanzaAgentBridgeConfig?.selectedTransport,
        metadata: {
          source: "execution_sandbox_qa_panel",
          no_real_transport_connected: true,
          no_broker_order_prepared: true,
          no_broker_order_submitted: true,
        },
      })
    : null;
  const safetyCheckFailures = selectedHandoff.safetyChecks.filter(
    (check) => check.status === "failed",
  );
  const safetyCheckWarnings = selectedHandoff.safetyChecks.filter(
    (check) => check.status === "warning",
  );
  const requestValidationFailed =
    avanzaAgentRequestValidation !== null &&
    avanzaAgentRequestValidation.ok === false;
  const envelopeValidationFailed =
    avanzaAgentBridgeEnvelopeValidation !== null &&
    avanzaAgentBridgeEnvelopeValidation.ok === false;
  const sandboxCoreValid =
    selectedHandoff.status === "ready" &&
    safetyCheckFailures.length === 0 &&
    avanzaAgentRequestValidation?.ok === true &&
    avanzaAgentBridgeEnvelopeValidation?.ok === true;
  const sandboxBlocked =
    selectedHandoff.status === "blocked" ||
    selectedHandoff.status === "invalid_intent" ||
    safetyCheckFailures.length > 0 ||
    requestValidationFailed ||
    envelopeValidationFailed;
  const sandboxOverallStatus: ExecutionSandboxQaOverallStatus = sandboxBlocked
    ? "blocked"
    : sandboxCoreValid
      ? "ready"
      : "incomplete";
  const sandboxOverallMessage =
    sandboxOverallStatus === "ready"
      ? "Sandbox-ready means the local typed handoff chain is valid for diagnostics only. It does not mean broker execution is available."
      : sandboxOverallStatus === "blocked"
        ? selectedHandoff.blockedReason ??
          avanzaAgentRequestValidation?.errors[0] ??
          avanzaAgentBridgeEnvelopeValidation?.errors[0] ??
          safetyCheckFailures[0]?.message ??
          "The local execution sandbox chain is blocked by handoff or validation errors."
        : "The local execution sandbox chain is incomplete until the typed request and bridge envelope are available.";
  const executionSandboxQaItems: ExecutionSandboxQaItem[] = [
    {
      label: "Execution dev tools",
      status: executionDevToolsEnabled ? "pass" : "fail",
      message: executionDevToolsEnabled
        ? "Enabled for this local diagnostics surface."
        : "Disabled; sandbox diagnostics and runners stay hidden.",
    },
    {
      label: "Selected intent",
      status: selectedIntent ? "pass" : "fail",
      message: selectedIntent
        ? `${agentCommandValue(selectedIntent.action)} ${selectedIntent.trading_package.ticker} intent is selected.`
        : "No execution intent is selected.",
    },
    {
      label: "Handoff",
      status: selectedHandoff ? "pass" : "fail",
      message: selectedHandoff
        ? `Handoff status is ${agentCommandValue(selectedHandoff.status)}.`
        : "No Avanza handoff exists.",
    },
    {
      label: "Handoff ready",
      status: selectedHandoff.status === "ready" ? "pass" : "fail",
      message:
        selectedHandoff.status === "ready"
          ? "Ready for local sandbox preparation preview."
          : (selectedHandoff.blockedReason ??
            `Handoff is ${selectedHandoff.status}.`),
    },
    {
      label: "Safety checks",
      status:
        safetyCheckFailures.length > 0
          ? "fail"
          : safetyCheckWarnings.length > 0
            ? "warn"
            : "pass",
      message:
        safetyCheckFailures.length > 0
          ? `${safetyCheckFailures.length} safety check failed.`
          : safetyCheckWarnings.length > 0
            ? `${safetyCheckWarnings.length} safety check warning.`
            : "No failed safety checks.",
    },
    {
      label: "Future agent request",
      status: avanzaAgentRequest ? "pass" : "pending",
      message: avanzaAgentRequest
        ? `Request ${shortPayloadId(avanzaAgentRequest.requestId)} is built.`
        : (avanzaAgentRequestPreview.error ??
          "Future agent request has not been built."),
    },
    {
      label: "Request validation",
      status:
        avanzaAgentRequestValidation?.ok === true
          ? avanzaAgentRequestValidation.warnings.length > 0
            ? "warn"
            : "pass"
          : "fail",
      message:
        avanzaAgentRequestValidation?.ok === true
          ? avanzaAgentRequestValidation.warnings.length > 0
            ? `${avanzaAgentRequestValidation.warnings.length} request validation warning.`
            : "Future agent request is valid."
          : (avanzaAgentRequestValidation?.errors[0] ??
            "Future agent request validation is unavailable."),
    },
    {
      label: "Bridge envelope",
      status: avanzaAgentBridgeEnvelope ? "pass" : "pending",
      message: avanzaAgentBridgeEnvelope
        ? `Envelope ${shortPayloadId(avanzaAgentBridgeEnvelope.envelopeId)} is built.`
        : (avanzaAgentBridgeEnvelopePreview.error ??
          "Bridge envelope has not been built."),
    },
    {
      label: "Envelope validation",
      status:
        avanzaAgentBridgeEnvelopeValidation?.ok === true
          ? avanzaAgentBridgeEnvelopeValidation.warnings.length > 0
            ? "warn"
            : "pass"
          : "fail",
      message:
        avanzaAgentBridgeEnvelopeValidation?.ok === true
          ? avanzaAgentBridgeEnvelopeValidation.warnings.length > 0
            ? `${avanzaAgentBridgeEnvelopeValidation.warnings.length} envelope warning. Transport none is expected for this sandbox.`
          : "Bridge envelope is valid."
          : (avanzaAgentBridgeEnvelopeValidation?.errors[0] ??
            "Bridge envelope validation is unavailable."),
    },
    {
      label: "Bridge config loaded",
      status: avanzaAgentBridgeConfig
        ? avanzaAgentBridgeConfig.error
          ? "warn"
          : "pass"
        : "pending",
      message: avanzaAgentBridgeConfig
        ? avanzaAgentBridgeConfig.error
          ? `Config loaded with storage warning: ${avanzaAgentBridgeConfig.error}`
          : "Bridge config loaded locally for diagnostics."
        : "Bridge config is hidden because dev tools are disabled.",
    },
    {
      label: "Selected bridge transport",
      status:
        avanzaAgentBridgeFactoryResult?.selectedTransport === "none"
          ? "pass"
          : "warn",
      message: avanzaAgentBridgeFactoryResult
        ? `Selected ${getAvanzaAgentBridgeTransportDisplayLabel(
            avanzaAgentBridgeFactoryResult.selectedTransport,
          )}.`
        : "No bridge factory result available.",
    },
    {
      label: "Resolved bridge transport",
      status:
        avanzaAgentBridgeFactoryResult?.resolvedTransport === "none"
          ? "pass"
          : "warn",
      message: avanzaAgentBridgeFactoryResult
        ? `Resolved ${getAvanzaAgentBridgeTransportDisplayLabel(
            avanzaAgentBridgeFactoryResult.resolvedTransport,
          )}. Runtime bridge remains local diagnostics only in this build.`
        : "No bridge factory result available.",
    },
    {
      label: "Factory fallback",
      status: avanzaAgentBridgeFactoryResult?.fallbackUsed ? "warn" : "pass",
      message: avanzaAgentBridgeFactoryResult
        ? avanzaAgentBridgeFactoryResult.fallbackUsed
          ? `${avanzaAgentBridgeFactoryResult.reason} ${avanzaAgentBridgeFactoryResult.warnings.join(" ")}`
          : avanzaAgentBridgeFactoryResult.reason
        : "No bridge factory result available.",
    },
    {
      label: "Real broker automation",
      status: avanzaAgentBridgeFactoryResult
        ? isRealAvanzaAgentBridge(avanzaAgentBridgeFactoryResult.bridge)
          ? "fail"
          : "pass"
        : "pending",
      message: avanzaAgentBridgeFactoryResult
        ? isRealAvanzaAgentBridge(avanzaAgentBridgeFactoryResult.bridge)
          ? "Unexpected real broker automation support detected."
          : "Real broker automation is false for this diagnostics bridge."
        : "No bridge factory result available.",
    },
    {
      label: "Lifecycle",
      status: localLifecycle ? "pass" : "fail",
      message: localLifecycle
        ? `Lifecycle is ${getExecutionLifecycleDisplayLabel(localLifecycle.currentState)}.`
        : "Lifecycle snapshot is missing.",
    },
    {
      label: "Prepare stub / runner",
      status: preparationStubReached || agentRunnerResult ? "pass" : "pending",
      message:
        preparationStubReached || agentRunnerResult
          ? "Prepare stub or bridge-backed runner has been attempted locally."
          : "Not attempted yet.",
    },
    {
      label: "Runner result",
      status: agentRunnerResult ? "pass" : "pending",
      message: agentRunnerResult
        ? `Runner result status is ${agentCommandValue(agentRunnerResult.status)}.`
        : "No bridge-backed runner result yet.",
    },
    {
      label: "Broker result",
      status: agentRunnerResult
        ? agentRunnerResult.brokerResult
          ? "fail"
          : "pass"
        : "pending",
      message: agentRunnerResult
        ? agentRunnerResult.brokerResult
          ? "Unexpected broker result is present."
          : "Broker result is absent as expected for the diagnostics runner."
        : "Pending until the bridge-backed diagnostics runner is attempted.",
    },
    {
      label: "Stub capture record",
      status: stubCaptureResult ? "pass" : "pending",
      message: stubCaptureResult
        ? `Dev capture status is ${agentCommandValue(stubCaptureResult.captureStatus)}.`
        : "Optional dev capture stub has not been used.",
    },
  ];

  function addAgentProgressStubEvent() {
    setAgentProgressStubMessage("");
    setAgentProgressStubError("");

    if (!avanzaAgentRequest) {
      setAgentProgressStubError(
        "Agent progress stub requires a ready future-agent request preview.",
      );
      return;
    }

    const createdAt = new Date().toISOString();
    const mappedLifecycleEventType = mapAvanzaAgentProgressToLifecycleEventType(
      selectedAgentProgressType,
    );
    const progressEvent = buildAvanzaAgentProgressEvent({
      requestId: avanzaAgentRequest.requestId,
      createdAt,
      type: selectedAgentProgressType,
      message: `${getAvanzaAgentProgressDisplayLabel(
        selectedAgentProgressType,
      )} - local dev progress stub only. No Avanza agent is connected.`,
      metadata: {
        stub_only: true,
        broker_connected: false,
        no_order_prepared: true,
        no_order_submitted: true,
        no_broker_result_created: true,
        handoff_status: selectedHandoff.status,
      },
    });
    const progressAuditEvent = createExecutionAuditEvent({
      type: "agent_progress_stub",
      createdAt,
      lifecycleId: localLifecycle.lifecycleId,
      intentId: selectedIntent.intent_id,
      recommendationId: selectedIntent.trading_package.recommendation_id,
      positionId: selectedIntent.trading_package.live_position_id,
      ticker: selectedIntent.trading_package.ticker,
      action: selectedIntent.action,
      mode: selectedIntent.mode,
      triggerType: selectedIntent.trigger_type,
      broker: "avanza",
      handoffVersion: selectedHandoff.version,
      handoffStatus: selectedHandoff.status,
      message:
        "Dev-only Avanza agent progress event stub recorded locally. No broker agent is connected and no order was prepared or submitted.",
      metadata: {
        stub_only: true,
        broker_connected: false,
        no_order_prepared: true,
        no_order_submitted: true,
        no_broker_result_created: true,
        agent_request_id: avanzaAgentRequest.requestId,
        agent_progress_event_id: progressEvent.eventId,
        agent_progress_type: progressEvent.type,
        mapped_lifecycle_event_type: mappedLifecycleEventType,
      },
    });

    if (!mappedLifecycleEventType) {
      appendExecutionAuditEvents([progressAuditEvent]);
      setAgentProgressTimeline((current) => [
        {
          progressEvent,
          mappedLifecycleEventType: null,
          lifecycleTransitionStatus: "not_mapped",
          lifecycleNote:
            "No lifecycle transition is mapped for this progress event.",
        },
        ...current,
      ]);
      setAgentProgressStubMessage(
        "Progress event added locally. It has no lifecycle mapping, so lifecycle state was unchanged.",
      );
      return;
    }

    const transition = transitionExecutionLifecycle(
      localLifecycle,
      mappedLifecycleEventType,
      {
        createdAt,
        intentId: selectedIntent.intent_id,
        handoffVersion: selectedHandoff.version,
        mode: selectedIntent.mode,
        action: selectedIntent.action,
        triggerType: selectedIntent.trigger_type,
        message:
          "Local dev agent progress stub applied a mapped lifecycle transition. No broker agent is connected and no real order action occurred.",
        metadata: {
          stub_only: true,
          broker_connected: false,
          no_order_prepared: true,
          no_order_submitted: true,
          no_broker_result_created: true,
          agent_request_id: avanzaAgentRequest.requestId,
          agent_progress_event_id: progressEvent.eventId,
          agent_progress_type: progressEvent.type,
          handoff_status: selectedHandoff.status,
        },
      },
    );

    if (!transition.ok) {
      appendExecutionAuditEvents([progressAuditEvent]);
      setAgentProgressTimeline((current) => [
        {
          progressEvent,
          mappedLifecycleEventType,
          lifecycleTransitionStatus: "invalid",
          lifecycleNote: transition.error,
        },
        ...current,
      ]);
      setAgentProgressStubError(
        `Progress event added locally, but lifecycle transition was not applied: ${transition.error}`,
      );
      return;
    }

    appendExecutionAuditEvents([
      progressAuditEvent,
      buildExecutionAuditEventFromLifecycleEvent(
        transition.event,
        transition.snapshot,
      ),
    ]);
    setLocalLifecycle(transition.snapshot);
    setAgentProgressTimeline((current) => [
      {
        progressEvent,
        mappedLifecycleEventType,
        lifecycleTransitionStatus: "applied",
        lifecycleNote: `${mappedLifecycleEventType} moved lifecycle to ${transition.snapshot.currentState}.`,
      },
      ...current,
    ]);
    setAgentProgressStubMessage(
      "Progress event added locally and its mapped lifecycle transition was applied.",
    );
  }

  async function runPreparationStub() {
    setPreparationStubMessage("");
    setPreparationStubError("");
    setAgentRunnerResult(null);
    setAgentRunnerError("");
    setAgentRunStoreMessage("");

    if (!executionDevToolsEnabled) {
      setPreparationStubError(
        "Avanza preparation is not connected in this build.",
      );
      return;
    }

    if (!canRunPreparationStub) {
      setPreparationStubError(
        "Preparation stub is unavailable because this handoff is not ready.",
      );
      return;
    }

    const createdAt = new Date().toISOString();
    setCaptureBaseLifecycle(null);
    const baseAuditFields = {
      createdAt,
      lifecycleId: localLifecycle.lifecycleId,
      intentId: selectedIntent.intent_id,
      recommendationId: selectedIntent.trading_package.recommendation_id,
      positionId: selectedIntent.trading_package.live_position_id,
      ticker: selectedIntent.trading_package.ticker,
      action: selectedIntent.action,
      mode: selectedIntent.mode,
      triggerType: selectedIntent.trigger_type,
      broker: "avanza" as const,
      handoffVersion: selectedHandoff.version,
      handoffStatus: selectedHandoff.status,
    };
    appendExecutionAuditEvents([
      createExecutionAuditEvent({
        ...baseAuditFields,
        type: "stub_prepare_clicked",
        message:
          "Prepare in Avanza stub clicked. No broker is connected, Avanza was not opened, and no real order was prepared.",
        metadata: {
          stub_only: true,
          broker_connected: false,
          no_order_prepared: true,
          no_order_submitted: true,
          handoff_status: selectedHandoff.status,
          can_prepare_order: selectedHandoff.canPrepareOrder,
          can_submit_final_order: selectedHandoff.canSubmitFinalOrder,
        },
      }),
    ]);

    const startPreparation = transitionExecutionLifecycle(
      localLifecycle,
      "start_broker_preparation",
      {
        createdAt,
        intentId: selectedIntent.intent_id,
        handoffVersion: selectedHandoff.version,
        mode: selectedIntent.mode,
        action: selectedIntent.action,
        triggerType: selectedIntent.trigger_type,
        message:
          "Local UI stub started broker preparation placeholder. No broker is connected and no real order was prepared.",
        metadata: {
          stub_only: true,
          broker_connected: false,
          no_order_prepared: true,
          no_order_submitted: true,
          can_prepare_order: selectedHandoff.canPrepareOrder,
          can_submit_final_order: selectedHandoff.canSubmitFinalOrder,
        },
      },
    );

    if (!startPreparation.ok) {
      const nextModalState = applyExecutionPrepareResult(modalStateForHelper(), {
        status: "failure",
        error: startPreparation.error,
      });
      setPreparationStubMessage(nextModalState.preparation.message);
      setPreparationStubError(nextModalState.preparation.error);
      return;
    }

    appendExecutionAuditEvents([
      buildExecutionAuditEventFromLifecycleEvent(
        startPreparation.event,
        startPreparation.snapshot,
      ),
    ]);

    const followUpEvent =
      selectedIntent.mode === "automatic"
        ? "submit_broker_order"
        : "wait_for_manual_confirmation";
    const followUpMessage =
      selectedIntent.mode === "automatic"
        ? "Local UI stub reached broker_order_submitting placeholder. No broker is connected and no order was submitted."
        : "Local UI stub reached waiting_for_manual_confirmation placeholder. No broker is connected and no order was prepared.";
    const followUp = transitionExecutionLifecycle(
      startPreparation.snapshot,
      followUpEvent,
      {
        createdAt,
        intentId: selectedIntent.intent_id,
        handoffVersion: selectedHandoff.version,
        mode: selectedIntent.mode,
        action: selectedIntent.action,
        triggerType: selectedIntent.trigger_type,
        message: followUpMessage,
        metadata: {
          stub_only: true,
          broker_connected: false,
          no_order_prepared: true,
          no_order_submitted: true,
          handoff_status: selectedHandoff.status,
        },
      },
    );

    if (!followUp.ok) {
      const nextModalState = applyExecutionPrepareResult(modalStateForHelper(), {
        status: "failure",
        error: followUp.error,
      });
      setLocalLifecycle(startPreparation.snapshot);
      setPreparationStubMessage(nextModalState.preparation.message);
      setPreparationStubError(nextModalState.preparation.error);
      return;
    }

    appendExecutionAuditEvents([
      buildExecutionAuditEventFromLifecycleEvent(
        followUp.event,
        followUp.snapshot,
      ),
    ]);

    const preparedModalState = applyExecutionPrepareResult(modalStateForHelper(), {
      status: "success",
      localLifecycle: followUp.snapshot,
      captureBaseLifecycle: followUp.snapshot,
      successMessage:
        selectedIntent.mode === "automatic"
          ? "Automatic preparation stub reached. The bridge-backed diagnostics runner can now test the future agent path, but no real Avanza bridge or broker is connected in this build."
          : "Preparation stub reached. The bridge-backed diagnostics runner can now test the future agent path, but Avanza will not be opened and no order will be prepared.",
    });
    setLocalLifecycle(preparedModalState.localLifecycle ?? followUp.snapshot);
    setCaptureBaseLifecycle(preparedModalState.captureBaseLifecycle);
    setPreparationStubMessage(preparedModalState.preparation.message);
    setPreparationStubError(preparedModalState.preparation.error);

    if (!avanzaAgentRequest) {
      return;
    }

    setIsAgentRunnerRunning(true);

    let runnerLifecycleSnapshot = followUp.snapshot;

    try {
      const bridgeConfig = readAvanzaAgentBridgeConfig();
      const runnerFactoryResult = createAvanzaAgentBridgeRunnerFromConfig({
        selectedTransport: bridgeConfig.selectedTransport,
        allowUnavailableBridgeSend: true,
        metadata: {
          source: "execution_handoff_preview_modal",
          runner_path: "bridge_backed_diagnostics_runner",
          bridge_backed_runner: true,
          no_external_avanza_bridge_connected: true,
          no_browser_automation: true,
          no_order_prepared: true,
          no_order_submitted: true,
          no_broker_result_created: true,
        },
      });
      const runner = runnerFactoryResult.runner;
      const runnerResult = await runner.run(avanzaAgentRequest, {
        metadata: {
          source: "prepare_in_avanza_button",
          stub_only: true,
          runner_path: "bridge_backed_diagnostics_runner",
          bridge_backed_runner: true,
          bridge_factory_selected_transport: runnerFactoryResult.selectedTransport,
          bridge_factory_resolved_transport: runnerFactoryResult.resolvedTransport,
          bridge_factory_fallback_used: runnerFactoryResult.fallbackUsed,
          bridge_factory_reason: runnerFactoryResult.reason,
          bridge_factory_warnings: runnerFactoryResult.warnings,
          no_external_avanza_bridge_connected: true,
          no_browser_automation: true,
          no_order_prepared: true,
          no_order_submitted: true,
          no_broker_result_created: true,
        },
        onProgress: async (progressEvent) => {
          const mappedLifecycleEventType =
            mapAvanzaAgentProgressToLifecycleEventType(progressEvent.type);
          const progressAuditEvent = createExecutionAuditEvent({
            type: "agent_progress_stub",
            createdAt: progressEvent.createdAt,
            lifecycleId: runnerLifecycleSnapshot.lifecycleId,
            intentId: selectedIntent.intent_id,
            recommendationId: selectedIntent.trading_package.recommendation_id,
            positionId: selectedIntent.trading_package.live_position_id,
            ticker: selectedIntent.trading_package.ticker,
            action: selectedIntent.action,
            mode: selectedIntent.mode,
            triggerType: selectedIntent.trigger_type,
            broker: "avanza",
            handoffVersion: selectedHandoff.version,
            handoffStatus: selectedHandoff.status,
            message:
              "Bridge-backed Avanza agent diagnostics runner progress event recorded locally. No real Avanza bridge is connected, Avanza was not opened, no order was prepared, no order was submitted, and no broker result was created.",
            metadata: {
              stub_only: true,
              diagnostics_runner: true,
              bridge_backed_runner: true,
              bridge_factory_selected_transport:
                runnerFactoryResult.selectedTransport,
              bridge_factory_resolved_transport:
                runnerFactoryResult.resolvedTransport,
              bridge_factory_fallback_used: runnerFactoryResult.fallbackUsed,
              bridge_factory_reason: runnerFactoryResult.reason,
              bridge_factory_warnings: runnerFactoryResult.warnings,
              no_external_avanza_bridge_connected: true,
              broker_connected: false,
              no_browser_automation: true,
              no_order_prepared: true,
              no_order_submitted: true,
              no_broker_result_created: true,
              agent_request_id: avanzaAgentRequest.requestId,
              agent_progress_event_id: progressEvent.eventId,
              agent_progress_type: progressEvent.type,
              mapped_lifecycle_event_type: mappedLifecycleEventType,
            },
          });

          if (!mappedLifecycleEventType) {
            appendExecutionAuditEvents([progressAuditEvent]);
            setAgentProgressTimeline((current) => [
              {
                progressEvent,
                mappedLifecycleEventType: null,
                lifecycleTransitionStatus: "not_mapped",
                lifecycleNote:
                  "No lifecycle transition is mapped for this bridge-backed diagnostics runner progress event.",
              },
              ...current,
            ]);
            return;
          }

          const transition = transitionExecutionLifecycle(
            runnerLifecycleSnapshot,
            mappedLifecycleEventType,
            {
              createdAt: progressEvent.createdAt,
              intentId: selectedIntent.intent_id,
              handoffVersion: selectedHandoff.version,
              mode: selectedIntent.mode,
              action: selectedIntent.action,
              triggerType: selectedIntent.trigger_type,
              message:
                "Bridge-backed Avanza agent diagnostics runner progress mapped to a local lifecycle transition. No real transport, browser, or broker action occurred.",
              metadata: {
                stub_only: true,
                diagnostics_runner: true,
                bridge_backed_runner: true,
                bridge_factory_selected_transport:
                  runnerFactoryResult.selectedTransport,
                bridge_factory_resolved_transport:
                  runnerFactoryResult.resolvedTransport,
                bridge_factory_fallback_used: runnerFactoryResult.fallbackUsed,
                bridge_factory_reason: runnerFactoryResult.reason,
                bridge_factory_warnings: runnerFactoryResult.warnings,
                no_external_avanza_bridge_connected: true,
                broker_connected: false,
                no_browser_automation: true,
                no_order_prepared: true,
                no_order_submitted: true,
                no_broker_result_created: true,
                agent_request_id: avanzaAgentRequest.requestId,
                agent_progress_event_id: progressEvent.eventId,
                agent_progress_type: progressEvent.type,
                handoff_status: selectedHandoff.status,
              },
            },
          );

          if (!transition.ok) {
            appendExecutionAuditEvents([progressAuditEvent]);
            setAgentProgressTimeline((current) => [
              {
                progressEvent,
                mappedLifecycleEventType,
                lifecycleTransitionStatus: "invalid",
                lifecycleNote: transition.error,
              },
              ...current,
            ]);
            return;
          }

          appendExecutionAuditEvents([
            progressAuditEvent,
            buildExecutionAuditEventFromLifecycleEvent(
              transition.event,
              transition.snapshot,
            ),
          ]);
          runnerLifecycleSnapshot = transition.snapshot;
          setLocalLifecycle(transition.snapshot);
          setAgentProgressTimeline((current) => [
            {
              progressEvent,
              mappedLifecycleEventType,
              lifecycleTransitionStatus: "applied",
              lifecycleNote: `${mappedLifecycleEventType} moved lifecycle to ${transition.snapshot.currentState}.`,
            },
            ...current,
          ]);
        },
      });

      setAgentRunnerResult(runnerResult);
      const storedRun = createStoredAvanzaAgentRun({
        request: avanzaAgentRequest,
        result: runnerResult,
        runner,
        metadata: {
          source: "execution_handoff_preview_modal",
          diagnostics_runner: true,
          bridge_backed_runner: true,
          runner_path: "bridge_backed_diagnostics_runner",
          bridge_factory_selected_transport: runnerFactoryResult.selectedTransport,
          bridge_factory_resolved_transport: runnerFactoryResult.resolvedTransport,
          bridge_factory_fallback_used: runnerFactoryResult.fallbackUsed,
          bridge_factory_reason: runnerFactoryResult.reason,
          bridge_factory_warnings: runnerFactoryResult.warnings,
          no_external_avanza_bridge_connected: true,
          local_diagnostics_only: true,
          no_browser_automation: true,
          no_order_prepared: true,
          no_order_submitted: true,
          no_broker_result_created: true,
        },
      });
      const runStored = appendAvanzaAgentRun(storedRun);
      setAgentRunStoreMessage(
        runStored
          ? `Local agent run saved for diagnostics. Factory resolved ${runnerFactoryResult.selectedTransport} to ${runnerFactoryResult.resolvedTransport}. No real Avanza bridge is connected, no Avanza session was opened, and no broker order was created.`
          : `Bridge-backed diagnostics runner finished, but the local agent run could not be saved. Factory resolved ${runnerFactoryResult.selectedTransport} to ${runnerFactoryResult.resolvedTransport}. No Avanza session was opened and no broker order was created.`,
      );
      setPreparationStubMessage(
        `Bridge factory runner finished. ${runnerFactoryResult.reason} Avanza was not opened, no order was prepared or submitted, and no broker result was created.`,
      );
    } catch (error) {
      setAgentRunnerError(
        error instanceof Error
          ? error.message
          : "Bridge-backed diagnostics runner failed safely without broker action.",
      );
    } finally {
      setIsAgentRunnerRunning(false);
    }
  }

  function captureStubBrokerResult() {
    setStubCaptureMessage("");
    setStubCaptureError("");

    if (!canRunCaptureStub) {
      setStubCaptureError(
        "Dev capture stub is available only after the preparation stub reaches its placeholder state.",
      );
      return;
    }

    const capturedAt = new Date().toISOString();
    const lifecycleForCapture = captureBaseLifecycle ?? localLifecycle;
    const brokerTimestamp = stubBrokerTimestamp.trim() || capturedAt;
    const requestedPrice = executionIntentIntendedPrice(selectedIntent);
    const executedPrice = stubExecutedPrice.trim()
      ? Number(stubExecutedPrice.trim().replace(",", "."))
      : null;
    const brokerResult = {
      broker: "avanza",
      broker_hint: "AVANZA" as const,
      mode: selectedIntent.mode,
      action: selectedIntent.action,
      ticker: selectedIntent.trading_package.ticker,
      instrumentName:
        "instrumentName" in selectedIntent &&
        typeof selectedIntent.instrumentName === "string"
          ? selectedIntent.instrumentName
          : status.ticker,
      quantity: selectedIntent.trading_package.quantity,
      orderType: selectedIntent.trading_package.order_type,
      requestedPrice,
      executedPrice: Number.isFinite(executedPrice) ? executedPrice : null,
      orderId: stubOrderId.trim() || null,
      brokerTimestamp,
      status: stubBrokerStatus,
      captured_at: capturedAt,
      submitted_at: brokerTimestamp,
      filled_at:
        stubBrokerStatus === "filled" ||
        stubBrokerStatus === "partially_filled"
          ? brokerTimestamp
          : null,
      filled_quantity:
        stubBrokerStatus === "filled" ||
        stubBrokerStatus === "partially_filled"
          ? selectedIntent.trading_package.quantity
          : null,
      average_fill_price: Number.isFinite(executedPrice) ? executedPrice : null,
      broker_order_id: stubOrderId.trim() || null,
      rejection_reason:
        stubBrokerStatus === "rejected"
          ? "Local dev stub rejection. No real broker confirmation was received."
          : null,
      cancellation_reason:
        stubBrokerStatus === "cancelled"
          ? "Local dev stub cancellation. No real broker confirmation was received."
          : null,
      raw_status: `LOCAL_DEV_STUB_${stubBrokerStatus.toUpperCase()}`,
      rawBrokerSummary:
        "Local dev broker result capture stub only. This is not a real Avanza confirmation.",
      notes: [
        "LOCAL DEV STUB ONLY - not a real Avanza broker confirmation.",
        "No Avanza browser automation ran and no real order was prepared or submitted.",
      ],
    };
    const captureResult = buildTureExecutionRecord(selectedIntent, brokerResult, {
      createdAt: capturedAt,
      recordId: `local_dev_record_${lifecycleForCapture.lifecycleId}_${Date.parse(capturedAt)}`,
    });
    const recordStored = appendExecutionRecord(captureResult.record);
    setStubCaptureResult(captureResult);

    appendExecutionAuditEvents([
      createExecutionAuditEvent({
        type: "broker_result_captured",
        createdAt: capturedAt,
        lifecycleId: lifecycleForCapture.lifecycleId,
        intentId: selectedIntent.intent_id,
        recommendationId: selectedIntent.trading_package.recommendation_id,
        positionId: selectedIntent.trading_package.live_position_id,
        ticker: selectedIntent.trading_package.ticker,
        action: selectedIntent.action,
        mode: selectedIntent.mode,
        triggerType: selectedIntent.trigger_type,
        broker: "avanza",
        handoffVersion: selectedHandoff.version,
        handoffStatus: selectedHandoff.status,
        brokerStatus: stubBrokerStatus,
        message:
          "Dev broker result capture stub recorded locally. No real broker confirmation was received and no Avanza order was executed.",
        metadata: {
          stub_only: true,
          broker_connected: false,
          no_real_broker_confirmation: true,
          no_order_prepared: true,
          no_order_submitted: true,
          capture_status: captureResult.captureStatus,
          broker_status: stubBrokerStatus,
          record_id: captureResult.record.recordId,
          record_stored_locally: recordStored,
        },
      }),
    ]);

    const captureTransition = transitionExecutionLifecycle(
      lifecycleForCapture,
      "capture_broker_result",
      {
        createdAt: capturedAt,
        intentId: selectedIntent.intent_id,
        mode: selectedIntent.mode,
        action: selectedIntent.action,
        triggerType: selectedIntent.trigger_type,
        brokerStatus: stubBrokerStatus,
        message:
          "Local dev stub captured a broker result placeholder. No real broker confirmation was received.",
        metadata: {
          stub_only: true,
          broker_connected: false,
          no_real_broker_confirmation: true,
          capture_status: captureResult.captureStatus,
          broker_status: stubBrokerStatus,
          record_id: captureResult.record.recordId,
          record_stored_locally: recordStored,
          handoff_status: selectedHandoff.status,
        },
      },
    );

    if (!captureTransition.ok) {
      const nextModalState = applyExecutionCaptureResult(modalStateForHelper(), {
        status: "failure",
        error: captureTransition.error,
      });
      setStubCaptureMessage(nextModalState.capture.message);
      setStubCaptureError(nextModalState.capture.error);
      return;
    }

    appendExecutionAuditEvents([
      buildExecutionAuditEventFromLifecycleEvent(
        captureTransition.event,
        captureTransition.snapshot,
      ),
    ]);

    const terminalEvent = terminalExecutionEventForBrokerStatus(
      stubBrokerStatus,
      captureResult.captureStatus,
    );
    const terminalTransition = transitionExecutionLifecycle(
      captureTransition.snapshot,
      terminalEvent,
      {
        createdAt: capturedAt,
        intentId: selectedIntent.intent_id,
        mode: selectedIntent.mode,
        action: selectedIntent.action,
        triggerType: selectedIntent.trigger_type,
        brokerStatus: stubBrokerStatus,
        message:
          "Local dev stub moved the execution lifecycle after broker result capture. No real broker action occurred.",
        metadata: {
          stub_only: true,
          broker_connected: false,
          no_real_broker_confirmation: true,
          capture_status: captureResult.captureStatus,
          broker_status: stubBrokerStatus,
          record_id: captureResult.record.recordId,
          record_stored_locally: recordStored,
          handoff_status: selectedHandoff.status,
        },
      },
    );

    if (terminalTransition.ok) {
      const capturedModalState = applyExecutionCaptureResult(modalStateForHelper(), {
        status: "success",
        localLifecycle: terminalTransition.snapshot,
        captureBaseLifecycle: null,
        brokerStatus: stubBrokerStatus,
        executedPrice: stubExecutedPrice,
        orderId: stubOrderId,
        brokerTimestamp,
        successMessage: recordStored
          ? "Dev broker result captured and stored locally. This local record was created by the dev capture stub. It is not a real Avanza confirmation and it does not update the trade."
          : "Dev broker result captured in the modal, but could not be stored locally. This is not a real Avanza confirmation and it does not update the trade.",
      });
      setLocalLifecycle(capturedModalState.localLifecycle ?? terminalTransition.snapshot);
      setCaptureBaseLifecycle(capturedModalState.captureBaseLifecycle);
      setStubCaptureMessage(capturedModalState.capture.message);
      setStubCaptureError(capturedModalState.capture.error);
      appendExecutionAuditEvents([
        buildExecutionAuditEventFromLifecycleEvent(
          terminalTransition.event,
          terminalTransition.snapshot,
        ),
      ]);
    } else {
      const nextModalState = applyExecutionCaptureResult(modalStateForHelper(), {
        status: "failure",
        error: terminalTransition.error,
      });
      setLocalLifecycle(captureTransition.snapshot);
      setStubCaptureMessage(nextModalState.capture.message);
      setStubCaptureError(nextModalState.capture.error);
    }
  }

  return (
    <ExecutionHandoffModalShell onClose={onClose}>
      <ExecutionHandoffModalComposition
        advancedFormFillPreviewProps={{
          blocked: localhostAdvancedFormBlocked,
          canCheck: canCheckLocalhostAdvancedFormFill,
          dryRunRequestValid: Boolean(avanzaDryRunRequestPreview?.ok),
          fieldMismatch: localhostAdvancedFormFieldMismatch,
          filled: localhostAdvancedFormFilled,
          formFill: localhostAdvancedFormFill,
          isRunning: isLocalhostAdvancedFormFillRunning,
          message: localhostAdvancedFormFillMessage,
          noAvanzaTouched: localhostAdvancedFormNoAvanzaTouched,
          noBrokerSubmission: localhostAdvancedFormNoBrokerSubmission,
          noBrowserActions: localhostAdvancedFormNoBrowserActions,
          noFinalConfirmClick: localhostAdvancedFormNoFinalConfirmClick,
          noRealFormFieldsFilled: localhostAdvancedFormNoRealFormFieldsFilled,
          noReviewClick: localhostAdvancedFormNoReviewClick,
          onCheck: () => void checkLocalhostAdvancedFormFillStub(),
          orderPageOpened: localhostOrderPageOpened,
          result: localhostAdvancedFormFillResult,
          unsupportedMode: localhostAdvancedFormUnsupportedMode,
          validationError: localhostAdvancedFormValidationError,
        }}
        agentProgressStubPanelProps={
          avanzaAgentRequest
            ? {
                agentCommandValue,
                currentLifecycleLabel: getExecutionLifecycleDisplayLabel(
                  localLifecycle.currentState,
                ),
                currentLifecycleToneClassName: executionLifecycleStubTone(
                  localLifecycle.currentState,
                ),
                error: agentProgressStubError,
                eventTypes: agentProgressStubEventTypes,
                formatDate,
                getProgressDisplayLabel: getAvanzaAgentProgressDisplayLabel,
                message: agentProgressStubMessage,
                onAddProgressEvent: addAgentProgressStubEvent,
                onProgressTypeChange: setSelectedAgentProgressType,
                requestId: avanzaAgentRequest.requestId,
                selectedType: selectedAgentProgressType,
                shortPayloadId,
                timeline: agentProgressTimeline,
              }
            : null
        }
        avanzaDryRunReadinessPanelProps={avanzaDryRunReadinessPanelProps}
        avanzaDryRunRequestPreviewProps={
          avanzaDryRunRequestPreview
            ? {
                agentCommandValue,
                formatCurrency,
                formatShares,
                preview: avanzaDryRunRequestPreview,
                requestValidationTone: avanzaAgentRequestValidationTone,
                shortPayloadId,
              }
            : null
        }
        bridgeRequestEnvelopePreviewProps={
          avanzaAgentRequest
            ? {
                agentCommandValue,
                envelope: avanzaAgentBridgeEnvelope,
                envelopeValidation: avanzaAgentBridgeEnvelopeValidation,
                envelopeValidationStatus:
                  avanzaAgentBridgeEnvelopeValidationStatus,
                getTransportDisplayLabel:
                  getAvanzaAgentBridgeTransportDisplayLabel,
                previewError: avanzaAgentBridgeEnvelopePreview.error,
                request: avanzaAgentRequest,
                requestValidationTone: avanzaAgentRequestValidationTone,
                shortPayloadId,
                ticker: packageSnapshot.ticker,
              }
            : null
        }
        brokerConfirmationCapturePreviewProps={{
          blocked: localhostBrokerConfirmationBlocked,
          canCheck: canCheckLocalhostBrokerConfirmationCapture,
          capture: localhostBrokerConfirmationCapture,
          captured: localhostBrokerConfirmationCaptured,
          dryRunRequestValid: Boolean(avanzaDryRunRequestPreview?.ok),
          isRunning: isLocalhostBrokerConfirmationCaptureRunning,
          message: localhostBrokerConfirmationCaptureMessage,
          mismatch: localhostBrokerConfirmationMismatch,
          noAvanzaTouched: localhostBrokerConfirmationNoAvanzaTouched,
          noBekrafta: localhostBrokerConfirmationNoBekrafta,
          noBrokerExecutionResult:
            localhostBrokerConfirmationNoBrokerExecutionResult,
          noBrowserActions: localhostBrokerConfirmationNoBrowserActions,
          noExecutionRecord: localhostBrokerConfirmationNoExecutionRecord,
          noSupabaseWrite: localhostBrokerConfirmationNoSupabaseWrite,
          noTradeMutation: localhostBrokerConfirmationNoTradeMutation,
          onCheck: () => void checkLocalhostBrokerConfirmationCaptureStub(),
          partial: localhostBrokerConfirmationPartial,
          rejectedOrCancelled: localhostBrokerConfirmationRejectedOrCancelled,
          result: localhostBrokerConfirmationCaptureResult,
        }}
        brokerExecutionResultEligibilityPreviewProps={{
          blocked: localhostBrokerExecutionEligibilityBlocked,
          canCheck: canCheckLocalhostBrokerExecutionEligibility,
          duplicateRisk: localhostBrokerExecutionDuplicateRisk,
          eligible: localhostBrokerExecutionEligible,
          eligibility: localhostBrokerExecutionEligibility,
          failed: localhostBrokerExecutionEligibilityFailed,
          hasCaptureEvidence: Boolean(localhostBrokerConfirmationCapture),
          isRunning: isLocalhostBrokerExecutionEligibilityRunning,
          message: localhostBrokerExecutionEligibilityMessage,
          noBrokerExecutionResult:
            localhostBrokerExecutionEligibilityNoBrokerExecutionResult,
          noExecutionRecord: localhostBrokerExecutionEligibilityNoExecutionRecord,
          noSupabaseWrite: localhostBrokerExecutionEligibilityNoSupabaseWrite,
          noTradeMutation: localhostBrokerExecutionEligibilityNoTradeMutation,
          notEligible: localhostBrokerExecutionNotEligible,
          onCheck: () =>
            void checkLocalhostBrokerExecutionEligibilityStub(),
          partialOnly: localhostBrokerExecutionPartialOnly,
          result: localhostBrokerExecutionEligibilityResult,
        }}
        brokerExecutionResultPreviewProps={{
          canCheck: canCheckLocalhostBrokerExecutionPreview,
          formatTimestamp: formatDate,
          hasCaptureOrEligibilityEvidence: Boolean(
            localhostBrokerConfirmationCapture ||
              localhostBrokerExecutionEligibility,
          ),
          isRunning: isLocalhostBrokerExecutionPreviewRunning,
          message: localhostBrokerExecutionPreviewMessage,
          noExecutionRecord: localhostBrokerExecutionPreviewNoExecutionRecord,
          noRealBrokerExecutionResult:
            localhostBrokerExecutionPreviewNoRealBrokerExecutionResult,
          noSupabaseWrite: localhostBrokerExecutionPreviewNoSupabaseWrite,
          noTradeMutation: localhostBrokerExecutionPreviewNoTradeMutation,
          onCheck: () => void checkLocalhostBrokerExecutionPreviewStub(),
          result: localhostBrokerExecutionPreviewResult,
        }}
        coreSummaryProps={{
          authorityMessage,
          handoffStatusLabel: "Handoff " + agentCommandValue(handoff.status),
          handoffStatusToneClassName: executionHandoffStatusTone(
            handoff.status,
          ),
          identity: (
            <CompanyIdentity
              ticker={packageSnapshot.ticker}
              companyName={status.ticker ?? packageSnapshot.ticker}
              size="live"
            />
          ),
          statusBadgeClassName: executionUiStatusBadgeClassName(
            status.badgeTone,
          ),
          statusDescription: modalCopy.statusDescription,
          statusLabel: modalCopy.statusLabel,
          statusPanelClassName: executionUiStatusPanelClassName(
            status.severity,
          ),
          statusTitle: modalCopy.statusTitle,
        }}
        executionBrokerCaptureStubPanelProps={
          devCaptureStubVisible
            ? {
                agentCommandValue,
                brokerStatus: stubBrokerStatus,
                brokerTimestamp: stubBrokerTimestamp,
                canRunCaptureStub,
                captureResult: stubCaptureResult,
                currentLifecycleLabel: getExecutionLifecycleDisplayLabel(
                  localLifecycle.currentState,
                ),
                currentLifecycleToneClassName: executionLifecycleStubTone(
                  localLifecycle.currentState,
                ),
                error: stubCaptureError,
                executedPrice: stubExecutedPrice,
                formatCurrency,
                formatShares,
                message: stubCaptureMessage,
                onBrokerStatusChange: setStubBrokerStatus,
                onBrokerTimestampChange: setStubBrokerTimestamp,
                onCaptureStubBrokerResult: captureStubBrokerResult,
                onExecutedPriceChange: setStubExecutedPrice,
                onOrderIdChange: setStubOrderId,
                orderId: stubOrderId,
                shortPayloadId,
              }
            : null
        }
        executionDevToolsEnabled={executionDevToolsEnabled}
        executionLifecycleStatusPanelProps={{
          agentCommandValue,
          agentRunStoreMessage,
          agentRunnerError,
          agentRunnerResult,
          canRunPreparationStub,
          currentLifecycleLabel: getExecutionLifecycleDisplayLabel(
            localLifecycle.currentState,
          ),
          currentLifecycleToneClassName: executionLifecycleStubTone(
            localLifecycle.currentState,
          ),
          executionDevToolsEnabled,
          onRunPreparationStub: runPreparationStub,
          preparationButtonLabel: isAgentRunnerRunning
            ? "Running bridge diagnostics"
            : preparationStubReached
              ? "Stub reached"
              : executionDevToolsEnabled
                ? "Prepare in Avanza"
                : "Not connected",
          preparationStatusMessage:
            handoff.status === "ready"
              ? executionDevToolsEnabled
                ? "Ready handoff. The bridge-backed diagnostics runner tests where a future Avanza agent bridge would begin without opening Avanza."
                : "Ready handoff. Avanza preparation is disabled because execution dev tools are off."
              : "Preparation is disabled until the handoff is ready.",
          preparationStubError,
          preparationStubMessage,
          shortPayloadId,
        }}
        mappedBrokerExecutionResultCandidatePreviewProps={{
          canRun: canRunMappedBrokerExecutionResultCandidatePreview,
          isRunning: isMappedBrokerExecutionResultCandidatePreviewRunning,
          message: mappedBrokerExecutionResultCandidatePreviewMessage,
          onRun: () =>
            void runMappedBrokerExecutionResultCandidatePreview(),
          result: mappedBrokerExecutionResultCandidatePreviewResult,
          unavailableReason:
            mappedBrokerExecutionResultCandidatePreviewUnavailableReason,
        }}
        finalSettlementNoteMatchPreviewProps={{
          canRun: canRunFinalSettlementNoteMatchPreview,
          isRunning: isFinalSettlementNoteMatchPreviewRunning,
          message: finalSettlementNoteMatchPreviewMessage,
          onRun: () => void runFinalSettlementNoteMatchPreview(),
          result: finalSettlementNoteMatchPreviewResult,
          unavailableReason: finalSettlementNoteMatchPreviewUnavailableReason,
        }}
        finalizationCandidatePreviewProps={{
          canRun: canRunFinalizationCandidatePreview,
          isRunning: isFinalizationCandidatePreviewRunning,
          message: finalizationCandidatePreviewMessage,
          onRun: () => void runFinalizationCandidatePreview(),
          result: finalizationCandidatePreviewResult,
          unavailableReason: finalizationCandidatePreviewUnavailableReason,
        }}
        finalizationActionPreviewProps={{
          canRun: canRunFinalizationActionPreview,
          isRunning: isFinalizationActionPreviewRunning,
          message: finalizationActionPreviewMessage,
          onRun: () => void runFinalizationActionPreview(),
          result: finalizationActionPreviewResult,
          unavailableReason: finalizationActionPreviewUnavailableReason,
        }}
        finalizationExecutionRecordBridgePreviewProps={{
          canRun: canRunFinalizationExecutionRecordBridgePreview,
          isRunning: isFinalizationExecutionRecordBridgePreviewRunning,
          message: finalizationExecutionRecordBridgePreviewMessage,
          onRun: () => void runFinalizationExecutionRecordBridgePreview(),
          result: finalizationExecutionRecordBridgePreviewResult,
          unavailableReason:
            finalizationExecutionRecordBridgePreviewUnavailableReason,
        }}
        executionRecordCandidateBuilderIntegrationPreviewProps={{
          canRun: canRunExecutionRecordCandidateBuilderIntegrationPreview,
          isRunning:
            isExecutionRecordCandidateBuilderIntegrationPreviewRunning,
          message: executionRecordCandidateBuilderIntegrationPreviewMessage,
          onRun: () =>
            void runExecutionRecordCandidateBuilderIntegrationPreview(),
          result: executionRecordCandidateBuilderIntegrationPreviewResult,
          unavailableReason:
            executionRecordCandidateBuilderIntegrationPreviewUnavailableReason,
        }}
        executionRecordCreationPreviewProps={{
          result: executionRecordCreationPreviewResult,
          sourceDescription: executionRecordCreationPreviewSourceDescription,
          sourceLabel: executionRecordCreationPreviewSourceLabel,
        }}
        executionRecordInsertDryRunPreviewProps={{
          canRun: canRunExecutionRecordInsertDryRun,
          isRunning: isExecutionRecordInsertDryRunRunning,
          message: executionRecordInsertDryRunMessage,
          onRun: () => void runExecutionRecordInsertDryRunPreview(),
          result: executionRecordInsertDryRunResult,
          unavailableReason: executionRecordInsertDryRunUnavailableReason,
        }}
        executionRecordEligibilityPreviewProps={{
          canCheck: canCheckLocalhostExecutionRecordEligibility,
          candidateIsPreviewOnly: executionRecordEligibilityCandidateIsPreviewOnly,
          hasPreviewCandidate: Boolean(executionRecordEligibilityCandidate),
          isRunning: isLocalhostExecutionRecordEligibilityRunning,
          message: localhostExecutionRecordEligibilityMessage,
          noBrokerExecutionResult: localhostExecutionRecordNoBrokerExecutionResult,
          noExecutionRecord: localhostExecutionRecordNoExecutionRecord,
          noSupabaseWrite: localhostExecutionRecordNoSupabaseWrite,
          noTradeMutation: localhostExecutionRecordNoTradeMutation,
          onCheck: () => void checkLocalhostExecutionRecordEligibilityStub(),
          result: localhostExecutionRecordEligibilityResult,
        }}
        executionSandboxQaPanelProps={{
          items: executionSandboxQaItems,
          overallMessage: sandboxOverallMessage,
          overallStatus: sandboxOverallStatus,
        }}
        futureAgentRequestPreviewProps={{
          agentCommandValue,
          executionDevToolsEnabled,
          formatShares,
          previewError: avanzaAgentRequestPreview.error,
          quantity: packageSnapshot.quantity,
          request: avanzaAgentRequest,
          requestValidation: avanzaAgentRequestValidation,
          requestValidationStatus: avanzaAgentRequestValidationStatus,
          requestValidationTone: avanzaAgentRequestValidationTone,
          shortPayloadId,
          ticker: packageSnapshot.ticker,
        }}
        instrumentPagePreviewProps={{
          blocked: localhostInstrumentPageBlocked,
          canCheck: canCheckLocalhostInstrumentPage,
          expectedInstrumentValid: avanzaSearchOnlyExpectedInstrumentValid,
          identified: localhostInstrumentPageIdentified,
          instrumentVerified: localhostInstrumentVerified,
          isRunning: isLocalhostInstrumentPageRunning,
          message: localhostInstrumentPageMessage,
          mismatch: localhostInstrumentPageMismatch,
          noAvanzaTouched: localhostInstrumentPageNoAvanzaTouched,
          noBrokerSubmission: localhostInstrumentPageNoBrokerSubmission,
          noBrowserActions: localhostInstrumentPageNoBrowserActions,
          noBuySellClick: localhostInstrumentPageNoBuySellClick,
          noFormFill: localhostInstrumentPageNoFormFill,
          noOrderPageOpened: localhostInstrumentPageNoOrderPageOpened,
          onCheck: () => void checkLocalhostInstrumentPageStub(),
          page: localhostInstrumentPage,
          prohibitedControlsVisible:
            localhostInstrumentPageProhibitedControlsVisible,
          result: localhostInstrumentPageResult,
        }}
        instrumentVerificationPreviewProps={{
          ambiguous: localhostInstrumentAmbiguous,
          blocked: localhostInstrumentBlocked,
          canCheck: canCheckLocalhostInstrumentVerification,
          expectedInstrumentValid: avanzaSearchOnlyExpectedInstrumentValid,
          isRunning: isLocalhostInstrumentVerificationRunning,
          message: localhostInstrumentVerificationMessage,
          noAvanzaTouched: localhostInstrumentNoAvanzaTouched,
          noBrokerSubmission: localhostInstrumentNoBrokerSubmission,
          noBrowserActions: localhostInstrumentNoBrowserActions,
          noFormFill: localhostInstrumentNoFormFill,
          noOrderPageOpened: localhostInstrumentNoOrderPageOpened,
          onCheck: () => void checkLocalhostInstrumentVerificationStub(),
          rejected: localhostInstrumentRejected,
          result: localhostInstrumentVerificationResult,
          searchOnlyExactMatch: localhostSearchOnlyExactMatch,
          verification: localhostInstrumentVerification,
          verified: localhostInstrumentVerified,
        }}
        orderPageOpenPreviewProps={{
          blocked: localhostOrderPageBlocked,
          canCheck: canCheckLocalhostOrderPageOpen,
          dryRunRequestValid: Boolean(avanzaDryRunRequestPreview?.ok),
          instrumentPageIdentified: localhostInstrumentPageIdentified,
          isRunning: isLocalhostOrderPageOpenRunning,
          message: localhostOrderPageOpenMessage,
          mismatch: localhostOrderPageMismatch,
          noAvanzaTouched: localhostOrderPageNoAvanzaTouched,
          noBrokerSubmission: localhostOrderPageNoBrokerSubmission,
          noBrowserActions: localhostOrderPageNoBrowserActions,
          noFinalConfirmClick: localhostOrderPageNoFinalConfirmClick,
          noFormFill: localhostOrderPageNoFormFill,
          noRealOrderPageOpened: localhostOrderPageNoRealOrderPageOpened,
          noReviewClick: localhostOrderPageNoReviewClick,
          onCheck: () => void checkLocalhostOrderPageOpenStub(),
          opened: localhostOrderPageOpened,
          orderPage: localhostOrderPageOpen,
          result: localhostOrderPageOpenResult,
          wrongAction: localhostOrderPageWrongAction,
        }}
        primaryLocalhostBridgeControlsProps={{
          canCancelLocalhostBridgeRun,
          canCheckLocalhostBridgeSelfCheck,
          canRunLocalhostBridgeDryRun,
          canRunLocalhostMockAgent,
          canTestLocalhostDryRunBridgeStub,
          dryRunRequestValid: avanzaDryRunRequestPreview?.ok === true,
          isLocalhostBridgeCancelRunning,
          isLocalhostBridgeRunRunning,
          isLocalhostBridgeSelfCheckRunning,
          isLocalhostDryRunBridgeStubRunning,
          isLocalhostMockAgentRunRunning,
          localhostBridgeCancelMessage,
          localhostBridgeCancelResult,
          localhostBridgeRunMessage,
          localhostBridgeRunResult,
          localhostBridgeSelfCheckMessage,
          localhostBridgeSelfCheckResult,
          localhostDryRunBridgeStubMessage,
          localhostDryRunBridgeStubResult,
          localhostMockAgentRunMessage,
          localhostMockAgentRunResult,
          onCancelLocalhostBridgeEcho: () => void cancelLocalhostBridgeEcho(),
          onCheckLocalhostBridgeSelfCheck: () =>
            void checkLocalhostBridgeSelfCheck(),
          onRunLocalhostBridgeEcho: () => void runLocalhostBridgeEcho(),
          onRunLocalhostMockAgent: () => void runLocalhostMockAgent(),
          onTestLocalhostDryRunBridgeStub: () =>
            void testLocalhostDryRunBridgeStub(),
          showDryRunBridgePreview: executionDevToolsEnabled,
          showLocalhostBridgeEchoControls: false,
        }}
        reviewClickPreviewProps={{
          advancedFormFilled: localhostAdvancedFormFilled,
          blocked: localhostReviewClickBlocked,
          canCheck: canCheckLocalhostReviewClick,
          confirmationMismatch: localhostReviewClickConfirmationMismatch,
          confirmationReady: localhostReviewClickConfirmationReady,
          dryRunRequestValid: Boolean(avanzaDryRunRequestPreview?.ok),
          finalConfirmBlocked: localhostReviewClickFinalConfirmBlocked,
          isRunning: isLocalhostReviewClickRunning,
          message: localhostReviewClickMessage,
          noAvanzaTouched: localhostReviewClickNoAvanzaTouched,
          noBrokerResult: localhostReviewClickNoBrokerResult,
          noBrowserActions: localhostReviewClickNoBrowserActions,
          noFinalConfirmClick: localhostReviewClickNoFinalConfirmClick,
          noRealReviewClick: localhostReviewClickNoRealReviewClick,
          noTradeMutation: localhostReviewClickNoTradeMutation,
          onCheck: () => void checkLocalhostReviewClickStub(),
          result: localhostReviewClickResult,
          reviewClick: localhostReviewClick,
          validationError: localhostReviewClickValidationError,
          waitingForManualConfirmation:
            localhostReviewClickWaitingForManualConfirmation,
        }}
        searchOnlyPreviewProps={{
          ambiguous: localhostSearchOnlyAmbiguous,
          blocked: localhostSearchOnlyBlocked,
          canCheck: canCheckLocalhostSearchOnly,
          exactMatch: localhostSearchOnlyExactMatch,
          expectedInstrumentValid: avanzaSearchOnlyExpectedInstrumentValid,
          isRunning: isLocalhostSearchOnlyRunning,
          message: localhostSearchOnlyMessage,
          noAvanzaTouched: localhostSearchOnlyNoAvanzaTouched,
          noBrokerSubmission: localhostSearchOnlyNoBrokerSubmission,
          noBrowserActions: localhostSearchOnlyNoBrowserActions,
          noMatch: localhostSearchOnlyNoMatch,
          noOrderPageOpened: localhostSearchOnlyNoOrderPageOpened,
          onCheck: () => void checkLocalhostSearchOnlyStub(),
          result: localhostSearchOnlyResult,
          searchOnly: localhostSearchOnly,
        }}
        secondaryLocalhostBridgeControlsProps={{
          canCancelLocalhostBridgeRun,
          canCheckLocalhostBridgeSelfCheck,
          canRunLocalhostBridgeDryRun,
          canRunLocalhostMockAgent,
          canTestLocalhostDryRunBridgeStub,
          dryRunRequestValid: avanzaDryRunRequestPreview?.ok === true,
          isLocalhostBridgeCancelRunning,
          isLocalhostBridgeRunRunning,
          isLocalhostBridgeSelfCheckRunning,
          isLocalhostDryRunBridgeStubRunning,
          isLocalhostMockAgentRunRunning,
          localhostBridgeCancelMessage,
          localhostBridgeCancelResult,
          localhostBridgeRunMessage,
          localhostBridgeRunResult,
          localhostBridgeSelfCheckMessage,
          localhostBridgeSelfCheckResult,
          localhostDryRunBridgeStubMessage,
          localhostDryRunBridgeStubResult,
          localhostMockAgentRunMessage,
          localhostMockAgentRunResult,
          onCancelLocalhostBridgeEcho: () => void cancelLocalhostBridgeEcho(),
          onCheckLocalhostBridgeSelfCheck: () =>
            void checkLocalhostBridgeSelfCheck(),
          onRunLocalhostBridgeEcho: () => void runLocalhostBridgeEcho(),
          onRunLocalhostMockAgent: () => void runLocalhostMockAgent(),
          onTestLocalhostDryRunBridgeStub: () =>
            void testLocalhostDryRunBridgeStub(),
          showDryRunBridgePreview: false,
          showLocalhostBridgeEchoControls:
            executionDevToolsEnabled &&
            Boolean(avanzaAgentRequest && avanzaAgentBridgeEnvelope),
        }}
        semiAutoAgentHandoffPreviewProps={{
          agentCommandValue,
          formatCurrency,
          formatShares,
          preview: semiAutoAgentHandoffPreview,
          shortPayloadId,
        }}
        semiAutoAgentDevFlowReviewPanelProps={{
          agentCommandValue,
          captureResult: semiAutoAgentResultCaptureStubResult,
          formatShares,
          preview: semiAutoAgentHandoffPreview,
          shortPayloadId,
        }}
        semiAutoAgentResultCaptureStubProps={{
          agentCommandValue,
          formatShares,
          onResultChange: (nextResult) =>
            setSemiAutoAgentResultCaptureStubState({
              previewKey: semiAutoAgentPreviewKey,
              result: nextResult,
            }),
          preview: semiAutoAgentHandoffPreview,
          result: semiAutoAgentResultCaptureStubResult,
          shortPayloadId,
        }}
        sessionDetectionPreviewProps={{
          canCheck: canCheckLocalhostSessionDetection,
          isRunning: isLocalhostSessionDetectionRunning,
          message: localhostSessionDetectionMessage,
          noAvanzaTouched: localhostSessionDetectionNoAvanzaTouched,
          noBrowserActions: localhostSessionDetectionNoBrowserActions,
          onCheck: () => void checkLocalhostSessionDetectionStub(),
          readyForSearchOnly: localhostSessionDetectionReadyForSearchOnly,
          result: localhostSessionDetectionResult,
          sessionDetection: localhostSessionDetection,
        }}
        statusReadbacksProps={{
          blockedReason: handoff.blockedReason,
          details: [
            { label: "Action", value: intent.action.toUpperCase() },
            { label: "Ticker", value: packageSnapshot.ticker },
            { label: "Quantity", value: formatShares(packageSnapshot.quantity) },
            {
              label: "Intended Price",
              value: formatCurrency(executionIntentIntendedPrice(intent)),
            },
            {
              label: "Target",
              value: formatCurrency(packageSnapshot.target_price),
            },
            {
              label: "Stop Loss",
              value: formatCurrency(packageSnapshot.stop_loss),
            },
            { label: "Trigger", value: agentCommandValue(intent.trigger_type) },
            { label: "Mode", value: agentCommandValue(intent.mode) },
            { label: "Broker", value: "Avanza" },
            {
              label: "Can Prepare",
              value: agentCommandValue(handoff.canPrepareOrder),
            },
            {
              label: "Can Submit Final",
              value: agentCommandValue(handoff.canSubmitFinalOrder),
            },
            { label: "Intent", value: shortPayloadId(intent.intent_id) },
          ],
          handoffStatusLabel: agentCommandValue(handoff.status),
          handoffStatusToneClassName: executionHandoffStatusTone(
            handoff.status,
          ),
          intentReason: executionIntentReason(intent),
          onClose,
          safetyChecks: handoff.safetyChecks.map((check) => ({
            id: agentCommandValue(check.id),
            message: check.message,
            status: check.status,
            toneClassName: executionSafetyCheckTone(check.status),
          })),
        }}
      />
    </ExecutionHandoffModalShell>
  );
}
