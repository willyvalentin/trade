"use client";

import type { AvanzaDryRunReadinessPanelProps } from "@/components/execution/AvanzaDryRunReadinessPanel";
import {
  createUnavailableAvanzaDryRunRunnerSelfCheck,
} from "@/lib/avanza-dry-run-runner-self-check";
import type { AvanzaExecutionHandoff } from "@/lib/avanza-execution-handoff";
import {
  createAvanzaDryRunBrowserRunnerCapability,
  summarizeBrowserRunnerCapabilityValidation,
  validateBrowserRunnerCapability,
} from "@/lib/browser-runner-capability-gate";
import type { ExecutionIntent } from "@/lib/execution";
import type { ExecutionIntentToAvanzaDryRunResult } from "@/lib/execution-intent-to-avanza-dry-run";
import {
  buildAdvancedFormFillReadinessItems,
  buildBrokerConfirmationCaptureReadinessItems,
  buildBrokerExecutionEligibilityReadinessItems,
  buildBrokerExecutionPreviewReadinessItems,
  buildExecutionRecordEligibilityReadinessItems,
  buildInstrumentPageReadinessItems,
  buildInstrumentVerificationReadinessItems,
  buildOrderPageOpenReadinessItems,
  buildReviewClickReadinessItems,
  buildSearchOnlyReadinessItems,
  buildSessionDetectionReadinessItems,
} from "@/lib/handoff-modal-data-mappers";
import type { useEarlyPhasePreviewState } from "@/hooks/execution/useEarlyPhasePreviewState";
import type { useLatePhasePreviewState } from "@/hooks/execution/useLatePhasePreviewState";
import type { useLocalhostBridgeControlsState } from "@/hooks/execution/useLocalhostBridgeControlsState";
import type { useMiddlePhasePreviewState } from "@/hooks/execution/useMiddlePhasePreviewState";

type LocalhostBridgeControlsState = ReturnType<
  typeof useLocalhostBridgeControlsState
>;
type EarlyPhasePreviewState = ReturnType<typeof useEarlyPhasePreviewState>;
type MiddlePhasePreviewState = ReturnType<typeof useMiddlePhasePreviewState>;
type LatePhasePreviewState = ReturnType<typeof useLatePhasePreviewState>;

export type UseAvanzaReadinessStateInput = {
  avanzaDryRunRequestPreview: ExecutionIntentToAvanzaDryRunResult | null;
  earlyPhasePreviewState: EarlyPhasePreviewState;
  executionDevToolsEnabled: boolean;
  latePhasePreviewState: LatePhasePreviewState;
  localhostBridgeControlsState: LocalhostBridgeControlsState;
  middlePhasePreviewState: MiddlePhasePreviewState;
  selectedHandoff: AvanzaExecutionHandoff | null;
  selectedIntent: ExecutionIntent | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Just now";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

function createFallbackReadinessPanelProps(): AvanzaDryRunReadinessPanelProps {
  return {
    advancedForm: {
      blocked: false,
      blockerMessage: "Advanced form-fill cannot proceed safely.",
      fieldMismatch: false,
      filled: false,
      labels: undefined,
      summary: "Advanced form-fill stub has not been checked in this modal session.",
      validationError: false,
    },
    allowedSafetyLevel: "unknown",
    brokerConfirmation: {
      blocked: false,
      blockerMessage: "broker-confirmation-capture cannot proceed safely.",
      captured: false,
      labels: undefined,
      mismatch: false,
      partial: false,
      rejectedOrCancelled: false,
      summary:
        "Broker-confirmation-capture stub has not been checked in this modal session.",
    },
    defaultGateBlocked: true,
    instrumentPage: {
      blocked: false,
      blockerMessage: "instrument-page identity cannot proceed safely.",
      identified: false,
      labels: undefined,
      mismatch: false,
      prohibitedControlsVisible: false,
      summary: "Instrument-page stub has not been checked in this modal session.",
    },
    instrumentVerification: {
      ambiguous: false,
      labels: undefined,
      rejected: false,
      summary:
        "Instrument-verification stub has not been checked in this modal session.",
      verified: false,
    },
    items: [],
    localhostRunnerSelfCheckLabels: [],
    localhostRunnerSelfCheckSummary:
      "Localhost self-check has not been run in this modal session.",
    orderPage: {
      blocked: false,
      blockerMessage: "order-page-open cannot proceed safely.",
      labels: undefined,
      mismatch: false,
      opened: false,
      summary: "Order-page-open stub has not been checked in this modal session.",
      wrongAction: false,
    },
    overall: "Not ready to run",
    reviewClick: {
      blocked: false,
      blockerMessage: "Review-click cannot proceed safely.",
      confirmationMismatch: false,
      confirmationReady: false,
      finalConfirmBlocked: false,
      labels: undefined,
      summary: "Review-click stub has not been checked in this modal session.",
      validationError: false,
    },
    searchOnly: {
      ambiguous: false,
      exactMatch: false,
      labels: undefined,
      summary: "Search-only stub has not been checked in this modal session.",
    },
    sessionDetection: {
      labels: undefined,
      readyForSearchOnly: false,
      summary:
        "Session-detection stub has not been checked in this modal session.",
    },
  };
}

export function useAvanzaReadinessState({
  avanzaDryRunRequestPreview,
  earlyPhasePreviewState,
  executionDevToolsEnabled,
  latePhasePreviewState,
  localhostBridgeControlsState,
  middlePhasePreviewState,
  selectedHandoff,
  selectedIntent,
}: UseAvanzaReadinessStateInput) {
  if (!selectedIntent || !selectedHandoff) {
    return {
      panelProps: createFallbackReadinessPanelProps(),
    };
  }

  const avanzaDryRunCapability = createAvanzaDryRunBrowserRunnerCapability({
    runnerId: "future_avanza_dry_run_runner_missing",
    runnerName: "Future Avanza Dry-Run Runner - Not Implemented",
    createdAt: new Date().toISOString(),
    metadata: {
      source: "execution_handoff_preview_modal",
      runnerImplemented: false,
      no_browser_runner: true,
      no_avanza_navigation: true,
      no_order_submitted: true,
    },
  });
  const avanzaDryRunDefaultGateValidation =
    validateBrowserRunnerCapability(avanzaDryRunCapability);
  const avanzaDryRunAllowedGateValidation = validateBrowserRunnerCapability(
    avanzaDryRunCapability,
    { allowAvanzaDryRun: true },
  );
  const avanzaDryRunRunnerSelfCheck =
    createUnavailableAvanzaDryRunRunnerSelfCheck({
      runnerId: "future_avanza_dry_run_runner_missing",
      runnerName: "Future Avanza Dry-Run Runner - Not Implemented",
      version: "not-implemented",
      checkedAt: avanzaDryRunCapability.createdAt,
      metadata: {
        source: "execution_handoff_preview_modal",
        runnerImplemented: false,
      },
    });
  const localhostRunnerSelfCheck =
    localhostBridgeControlsState.localhostBridgeSelfCheckResult?.response
      ?.selfCheck ?? avanzaDryRunRunnerSelfCheck;
  const localhostRunnerCapability =
    localhostBridgeControlsState.localhostBridgeSelfCheckResult?.response
      ?.capability;
  const localhostRunnerSelfCheckHasRun = Boolean(
    localhostBridgeControlsState.localhostBridgeSelfCheckResult?.response
      ?.selfCheck,
  );
  const localhostRunnerCanRunAvanzaDryRun =
    localhostRunnerSelfCheck.capabilityValidation.canRunAvanzaDryRun;
  const localhostRunnerCanSubmitBrokerOrder =
    localhostRunnerSelfCheck.capabilityValidation.canSubmitBrokerOrder;
  const localhostRunnerCanClickFinalConfirm =
    localhostRunnerCapability?.supportsFinalConfirmClick === true;
  const localhostRunnerSelfCheckSummary = localhostRunnerSelfCheckHasRun
    ? `Latest localhost self-check: ${localhostRunnerSelfCheck.status} at ${formatDate(
        localhostBridgeControlsState.localhostBridgeSelfCheckResult?.response
          ?.checkedAt ??
          localhostBridgeControlsState.localhostBridgeSelfCheckResult
            ?.checkedAt,
      )}.`
    : "Localhost self-check has not been run in this modal session.";

  const localhostSessionDetectionSummary =
    earlyPhasePreviewState.localhostSessionDetectionHasRun
      ? `Latest session-detection status: ${earlyPhasePreviewState.localhostSessionDetection?.status ?? "unknown"} at ${formatDate(
          earlyPhasePreviewState.localhostSessionDetectionResult?.response
            ?.checkedAt ??
            earlyPhasePreviewState.localhostSessionDetectionResult?.completedAt,
        )}.`
      : "Session-detection stub has not been checked in this modal session.";
  const localhostSearchOnlySummary =
    earlyPhasePreviewState.localhostSearchOnlyHasRun
      ? `Latest search-only status: ${earlyPhasePreviewState.localhostSearchOnly?.status ?? "unknown"} at ${formatDate(
          earlyPhasePreviewState.localhostSearchOnlyResult?.response
            ?.completedAt ??
            earlyPhasePreviewState.localhostSearchOnlyResult?.completedAt,
        )}.`
      : "Search-only stub has not been checked in this modal session.";
  const localhostInstrumentVerificationSummary =
    earlyPhasePreviewState.localhostInstrumentVerificationHasRun
      ? `Latest instrument-verification status: ${earlyPhasePreviewState.localhostInstrumentVerification?.status ?? "unknown"} at ${formatDate(
          earlyPhasePreviewState.localhostInstrumentVerificationResult?.response
            ?.completedAt ??
            earlyPhasePreviewState.localhostInstrumentVerificationResult
              ?.completedAt,
        )}.`
      : "Instrument-verification stub has not been checked in this modal session.";
  const localhostInstrumentPageSummary =
    middlePhasePreviewState.localhostInstrumentPageHasRun
      ? `Latest instrument-page status: ${middlePhasePreviewState.localhostInstrumentPage?.status ?? "unknown"} at ${formatDate(
          middlePhasePreviewState.localhostInstrumentPageResult?.response
            ?.completedAt ??
            middlePhasePreviewState.localhostInstrumentPageResult?.completedAt,
        )}.`
      : "Instrument-page stub has not been checked in this modal session.";
  const localhostOrderPageSummary =
    middlePhasePreviewState.localhostOrderPageOpenHasRun
      ? `Latest order-page-open status: ${middlePhasePreviewState.localhostOrderPageOpen?.status ?? "unknown"} at ${formatDate(
          middlePhasePreviewState.localhostOrderPageOpenResult?.response
            ?.completedAt ??
            middlePhasePreviewState.localhostOrderPageOpenResult?.completedAt,
        )}.`
      : "Order-page-open stub has not been checked in this modal session.";
  const localhostAdvancedFormSummary =
    middlePhasePreviewState.localhostAdvancedFormFillHasRun
      ? `Latest Advanced form-fill status: ${middlePhasePreviewState.localhostAdvancedFormFill?.status ?? "unknown"} at ${formatDate(
          middlePhasePreviewState.localhostAdvancedFormFillResult?.response
            ?.completedAt ??
            middlePhasePreviewState.localhostAdvancedFormFillResult
              ?.completedAt,
        )}.`
      : "Advanced form-fill stub has not been checked in this modal session.";
  const localhostReviewClickSummary =
    middlePhasePreviewState.localhostReviewClickHasRun
      ? `Latest review-click status: ${middlePhasePreviewState.localhostReviewClick?.status ?? "unknown"} at ${formatDate(
          middlePhasePreviewState.localhostReviewClickResult?.response
            ?.completedAt ??
            middlePhasePreviewState.localhostReviewClickResult?.completedAt,
        )}.`
      : "Review-click stub has not been checked in this modal session.";
  const localhostBrokerConfirmationSummary =
    latePhasePreviewState.localhostBrokerConfirmationCaptureHasRun
      ? `Latest broker-confirmation-capture status: ${latePhasePreviewState.localhostBrokerConfirmationCapture?.status ?? "unknown"} at ${formatDate(
          latePhasePreviewState.localhostBrokerConfirmationCaptureResult
            ?.response?.completedAt ??
            latePhasePreviewState.localhostBrokerConfirmationCaptureResult
              ?.completedAt,
        )}.`
      : "Broker-confirmation-capture stub has not been checked in this modal session.";

  const avanzaDryRunReadinessCriticalBlocked =
    selectedIntent.authority.can_submit_broker_order ||
    selectedIntent.authority.allowFinalSubmit ||
    selectedHandoff.canSubmitFinalOrder;
  const avanzaDryRunReadinessOverall = !avanzaDryRunRequestPreview?.ok
    ? "Blocked: invalid dry-run request"
    : selectedIntent.mode === "automatic"
      ? "Blocked: automatic mode out of scope"
      : avanzaDryRunReadinessCriticalBlocked
        ? "Critical blocked: broker submission or final confirm is allowed"
        : localhostRunnerSelfCheck.status === "available_dry_run_only"
          ? "Dry-run runner available"
          : localhostRunnerSelfCheck.status === "available_mock_only"
            ? "Not ready for Avanza dry-run"
            : localhostRunnerSelfCheck.status === "blocked"
              ? "Blocked: runner self-check blocked"
              : localhostRunnerSelfCheck.status === "failed"
                ? "Blocked: runner self-check failed"
                : "Not ready to run";

  const panelProps: AvanzaDryRunReadinessPanelProps = {
    advancedForm: {
      blocked: middlePhasePreviewState.localhostAdvancedFormBlocked,
      blockerMessage:
        middlePhasePreviewState.localhostAdvancedFormFill?.blockers[0] ??
        middlePhasePreviewState.localhostAdvancedFormFill?.errors[0] ??
        "Advanced form-fill cannot proceed safely.",
      fieldMismatch: middlePhasePreviewState.localhostAdvancedFormFieldMismatch,
      filled: middlePhasePreviewState.localhostAdvancedFormFilled,
      labels: middlePhasePreviewState.localhostAdvancedFormFill?.labels,
      summary: localhostAdvancedFormSummary,
      validationError:
        middlePhasePreviewState.localhostAdvancedFormValidationError,
    },
    allowedSafetyLevel: avanzaDryRunAllowedGateValidation.safetyLevel,
    brokerConfirmation: {
      blocked: latePhasePreviewState.localhostBrokerConfirmationBlocked,
      blockerMessage:
        latePhasePreviewState.localhostBrokerConfirmationCapture?.blockers[0] ??
        latePhasePreviewState.localhostBrokerConfirmationCapture?.errors[0] ??
        "broker-confirmation-capture cannot proceed safely.",
      captured: latePhasePreviewState.localhostBrokerConfirmationCaptured,
      labels: latePhasePreviewState.localhostBrokerConfirmationCapture?.labels,
      mismatch: latePhasePreviewState.localhostBrokerConfirmationMismatch,
      partial: latePhasePreviewState.localhostBrokerConfirmationPartial,
      rejectedOrCancelled:
        latePhasePreviewState.localhostBrokerConfirmationRejectedOrCancelled,
      summary: localhostBrokerConfirmationSummary,
    },
    defaultGateBlocked: avanzaDryRunDefaultGateValidation.blocked,
    instrumentPage: {
      blocked: middlePhasePreviewState.localhostInstrumentPageBlocked,
      blockerMessage:
        middlePhasePreviewState.localhostInstrumentPage?.blockers[0] ??
        middlePhasePreviewState.localhostInstrumentPage?.errors[0] ??
        "instrument-page identity cannot proceed safely.",
      identified: middlePhasePreviewState.localhostInstrumentPageIdentified,
      labels: middlePhasePreviewState.localhostInstrumentPage?.labels,
      mismatch: middlePhasePreviewState.localhostInstrumentPageMismatch,
      prohibitedControlsVisible:
        middlePhasePreviewState.localhostInstrumentPageProhibitedControlsVisible,
      summary: localhostInstrumentPageSummary,
    },
    instrumentVerification: {
      ambiguous: earlyPhasePreviewState.localhostInstrumentAmbiguous,
      labels: earlyPhasePreviewState.localhostInstrumentVerification?.labels,
      rejected: earlyPhasePreviewState.localhostInstrumentRejected,
      summary: localhostInstrumentVerificationSummary,
      verified: earlyPhasePreviewState.localhostInstrumentVerified,
    },
    items: [
      {
        label: "Dev tools enabled",
        status: executionDevToolsEnabled ? "pass" : "fail",
        message: executionDevToolsEnabled
          ? "Execution dev tools are enabled for this read-only checklist."
          : "Execution dev tools are disabled; dry-run readiness is hidden.",
      },
      {
        label: "Execution mode is semi_automatic",
        status: selectedIntent.mode === "semi_automatic" ? "pass" : "fail",
        message:
          selectedIntent.mode === "semi_automatic"
            ? "Semi-automatic mode keeps final confirmation with the user."
            : "Automatic mode is out of scope for Avanza dry-run.",
      },
      {
        label: "Avanza dry-run request is valid",
        status: avanzaDryRunRequestPreview?.ok ? "pass" : "fail",
        message: avanzaDryRunRequestPreview?.ok
          ? "The read-only dry-run request preview validates."
          : (avanzaDryRunRequestPreview?.errors[0] ??
            "Dry-run request preview is invalid or unavailable."),
      },
      {
        label: "Default capability gate",
        status: avanzaDryRunDefaultGateValidation.blocked ? "pass" : "fail",
        message: avanzaDryRunDefaultGateValidation.blocked
          ? "Default gate: blocked. Avanza dry-run is not enabled unless explicitly allowed."
          : "Default gate unexpectedly allows Avanza dry-run.",
      },
      {
        label: "Dry-run capability classification",
        status:
          avanzaDryRunAllowedGateValidation.safetyLevel === "dry_run_only" &&
          avanzaDryRunAllowedGateValidation.canRunAvanzaDryRun
            ? "pass"
            : "fail",
        message:
          avanzaDryRunAllowedGateValidation.safetyLevel === "dry_run_only" &&
          avanzaDryRunAllowedGateValidation.canRunAvanzaDryRun
            ? "Dry-run classification: dry_run_only when explicitly allowed."
            : summarizeBrowserRunnerCapabilityValidation(
                avanzaDryRunAllowedGateValidation,
              ),
      },
      {
        label: "Broker submission disabled",
        status: selectedIntent.authority.can_submit_broker_order
          ? "fail"
          : "pass",
        message: selectedIntent.authority.can_submit_broker_order
          ? "Broker submission is enabled and blocks dry-run."
          : "Broker submission disabled.",
      },
      {
        label: "Final confirm disabled",
        status:
          selectedIntent.authority.allowFinalSubmit ||
          selectedHandoff.canSubmitFinalOrder
            ? "fail"
            : "pass",
        message:
          selectedIntent.authority.allowFinalSubmit ||
          selectedHandoff.canSubmitFinalOrder
            ? "Final confirm is allowed and blocks dry-run."
            : "Final confirm disabled.",
      },
      {
        label: "Automatic mode disabled",
        status: selectedIntent.mode === "automatic" ? "fail" : "pass",
        message:
          selectedIntent.mode === "automatic"
            ? "Automatic mode is out of scope."
            : "Automatic mode disabled.",
      },
      {
        label: "Avanza runner implementation missing",
        status:
          localhostRunnerSelfCheck.status === "unavailable" ? "fail" : "pass",
        message:
          localhostRunnerSelfCheck.status === "unavailable"
            ? (localhostRunnerSelfCheck.blockers[0] ??
              "No Avanza runner exists yet. This is why the overall status remains Not ready to run.")
            : "Latest localhost self-check returned a runner capability state.",
      },
      {
        label: "Localhost self-check status",
        status: localhostRunnerSelfCheckHasRun
          ? localhostRunnerSelfCheck.status === "available_dry_run_only"
            ? "pass"
            : localhostRunnerSelfCheck.status === "available_mock_only"
              ? "warn"
              : "fail"
          : "pending",
        message: localhostRunnerSelfCheckHasRun
          ? `Latest localhost self-check status: ${localhostRunnerSelfCheck.status}.`
          : "No localhost runner self-check has been run in this modal session.",
      },
      ...buildSessionDetectionReadinessItems({
        hasRun: earlyPhasePreviewState.localhostSessionDetectionHasRun,
        readyForSearchOnly:
          earlyPhasePreviewState.localhostSessionDetectionReadyForSearchOnly,
        sessionDetection: earlyPhasePreviewState.localhostSessionDetection,
      }),
      ...buildSearchOnlyReadinessItems({
        ambiguous: earlyPhasePreviewState.localhostSearchOnlyAmbiguous,
        blocked: earlyPhasePreviewState.localhostSearchOnlyBlocked,
        exactMatch: earlyPhasePreviewState.localhostSearchOnlyExactMatch,
        hasRun: earlyPhasePreviewState.localhostSearchOnlyHasRun,
        noMatch: earlyPhasePreviewState.localhostSearchOnlyNoMatch,
        noOrderPageOpened:
          earlyPhasePreviewState.localhostSearchOnlyNoOrderPageOpened,
        searchOnly: earlyPhasePreviewState.localhostSearchOnly,
      }),
      ...buildInstrumentVerificationReadinessItems({
        ambiguous: earlyPhasePreviewState.localhostInstrumentAmbiguous,
        blocked: earlyPhasePreviewState.localhostInstrumentBlocked,
        hasRun: earlyPhasePreviewState.localhostInstrumentVerificationHasRun,
        instrumentVerification:
          earlyPhasePreviewState.localhostInstrumentVerification,
        noOrderPageOpened:
          earlyPhasePreviewState.localhostInstrumentNoOrderPageOpened,
        rejected: earlyPhasePreviewState.localhostInstrumentRejected,
        verified: earlyPhasePreviewState.localhostInstrumentVerified,
      }),
      ...buildInstrumentPageReadinessItems({
        blocked: middlePhasePreviewState.localhostInstrumentPageBlocked,
        hasRun: middlePhasePreviewState.localhostInstrumentPageHasRun,
        instrumentPage: middlePhasePreviewState.localhostInstrumentPage,
        mismatch: middlePhasePreviewState.localhostInstrumentPageMismatch,
        noOrderPageOpened:
          middlePhasePreviewState.localhostInstrumentPageNoOrderPageOpened,
        pageIdentified:
          middlePhasePreviewState.localhostInstrumentPageIdentified,
        prohibitedControlsVisible:
          middlePhasePreviewState.localhostInstrumentPageProhibitedControlsVisible,
      }),
      ...buildOrderPageOpenReadinessItems({
        blocked: middlePhasePreviewState.localhostOrderPageBlocked,
        hasRun: middlePhasePreviewState.localhostOrderPageOpenHasRun,
        mismatch: middlePhasePreviewState.localhostOrderPageMismatch,
        noFinalConfirmClick:
          middlePhasePreviewState.localhostOrderPageNoFinalConfirmClick,
        noFormFill: middlePhasePreviewState.localhostOrderPageNoFormFill,
        noReviewClick: middlePhasePreviewState.localhostOrderPageNoReviewClick,
        orderPageOpen: middlePhasePreviewState.localhostOrderPageOpen,
        orderPageOpened: middlePhasePreviewState.localhostOrderPageOpened,
        wrongAction: middlePhasePreviewState.localhostOrderPageWrongAction,
      }),
      ...buildAdvancedFormFillReadinessItems({
        advancedFormFill: middlePhasePreviewState.localhostAdvancedFormFill,
        blocked: middlePhasePreviewState.localhostAdvancedFormBlocked,
        fieldMismatch:
          middlePhasePreviewState.localhostAdvancedFormFieldMismatch,
        formFilled: middlePhasePreviewState.localhostAdvancedFormFilled,
        hasRun: middlePhasePreviewState.localhostAdvancedFormFillHasRun,
        noBrokerSubmission:
          middlePhasePreviewState.localhostAdvancedFormNoBrokerSubmission,
        noFinalConfirmClick:
          middlePhasePreviewState.localhostAdvancedFormNoFinalConfirmClick,
        noReviewClick:
          middlePhasePreviewState.localhostAdvancedFormNoReviewClick,
        unsupportedMode: middlePhasePreviewState.localhostAdvancedFormUnsupportedMode,
        validationError:
          middlePhasePreviewState.localhostAdvancedFormValidationError,
      }),
      ...buildReviewClickReadinessItems({
        blocked: middlePhasePreviewState.localhostReviewClickBlocked,
        confirmationMismatch:
          middlePhasePreviewState.localhostReviewClickConfirmationMismatch,
        confirmationReady:
          middlePhasePreviewState.localhostReviewClickConfirmationReady,
        hasRun: middlePhasePreviewState.localhostReviewClickHasRun,
        noBrokerResult:
          middlePhasePreviewState.localhostReviewClickNoBrokerResult,
        noFinalConfirmClick:
          middlePhasePreviewState.localhostReviewClickNoFinalConfirmClick,
        reviewClick: middlePhasePreviewState.localhostReviewClick,
        validationError:
          middlePhasePreviewState.localhostReviewClickValidationError,
        waitingForManualConfirmation:
          middlePhasePreviewState.localhostReviewClickWaitingForManualConfirmation,
      }),
      ...buildBrokerConfirmationCaptureReadinessItems({
        blocked: latePhasePreviewState.localhostBrokerConfirmationBlocked,
        capture: latePhasePreviewState.localhostBrokerConfirmationCapture,
        captured: latePhasePreviewState.localhostBrokerConfirmationCaptured,
        hasRun:
          latePhasePreviewState.localhostBrokerConfirmationCaptureHasRun,
        mismatch: latePhasePreviewState.localhostBrokerConfirmationMismatch,
        noBrokerExecutionResult:
          latePhasePreviewState.localhostBrokerConfirmationNoBrokerExecutionResult,
        noExecutionRecord:
          latePhasePreviewState.localhostBrokerConfirmationNoExecutionRecord,
        noTradeMutation:
          latePhasePreviewState.localhostBrokerConfirmationNoTradeMutation,
        partial: latePhasePreviewState.localhostBrokerConfirmationPartial,
        rejectedOrCancelled:
          latePhasePreviewState.localhostBrokerConfirmationRejectedOrCancelled,
      }),
      ...buildBrokerExecutionEligibilityReadinessItems({
        blocked: latePhasePreviewState.localhostBrokerExecutionEligibilityBlocked,
        duplicateRisk:
          latePhasePreviewState.localhostBrokerExecutionDuplicateRisk,
        eligible: latePhasePreviewState.localhostBrokerExecutionEligible,
        eligibility: latePhasePreviewState.localhostBrokerExecutionEligibility,
        failed: latePhasePreviewState.localhostBrokerExecutionEligibilityFailed,
        hasRun:
          latePhasePreviewState.localhostBrokerExecutionEligibilityHasRun,
        noBrokerExecutionResult:
          latePhasePreviewState.localhostBrokerExecutionEligibilityNoBrokerExecutionResult,
        noExecutionRecord:
          latePhasePreviewState.localhostBrokerExecutionEligibilityNoExecutionRecord,
        noSupabaseWrite:
          latePhasePreviewState.localhostBrokerExecutionEligibilityNoSupabaseWrite,
        noTradeMutation:
          latePhasePreviewState.localhostBrokerExecutionEligibilityNoTradeMutation,
        notEligible: latePhasePreviewState.localhostBrokerExecutionNotEligible,
        partialOnly: latePhasePreviewState.localhostBrokerExecutionPartialOnly,
      }),
      ...buildBrokerExecutionPreviewReadinessItems({
        blocked: latePhasePreviewState.localhostBrokerExecutionPreviewBlocked,
        duplicateRisk:
          latePhasePreviewState.localhostBrokerExecutionPreviewDuplicateRisk,
        failed: latePhasePreviewState.localhostBrokerExecutionPreviewFailed,
        hasRun: latePhasePreviewState.localhostBrokerExecutionPreviewHasRun,
        noExecutionRecord:
          latePhasePreviewState.localhostBrokerExecutionPreviewNoExecutionRecord,
        noRealBrokerExecutionResult:
          latePhasePreviewState.localhostBrokerExecutionPreviewNoRealBrokerExecutionResult,
        noSupabaseWrite:
          latePhasePreviewState.localhostBrokerExecutionPreviewNoSupabaseWrite,
        noTradeMutation:
          latePhasePreviewState.localhostBrokerExecutionPreviewNoTradeMutation,
        notEligible:
          latePhasePreviewState.localhostBrokerExecutionPreviewNotEligible,
        partialOnly:
          latePhasePreviewState.localhostBrokerExecutionPreviewPartialOnly,
        previewAvailable:
          latePhasePreviewState.localhostBrokerExecutionPreviewAvailable,
        previewResult: latePhasePreviewState.localhostBrokerExecutionPreview,
      }),
      ...buildExecutionRecordEligibilityReadinessItems({
        blocked: latePhasePreviewState.localhostExecutionRecordBlocked,
        duplicateRisk:
          latePhasePreviewState.localhostExecutionRecordDuplicateRisk,
        eligible: latePhasePreviewState.localhostExecutionRecordEligible,
        failed: latePhasePreviewState.localhostExecutionRecordFailed,
        hasRun: latePhasePreviewState.localhostExecutionRecordEligibilityHasRun,
        noBrokerExecutionResult:
          latePhasePreviewState.localhostExecutionRecordNoBrokerExecutionResult,
        noExecutionRecord:
          latePhasePreviewState.localhostExecutionRecordNoExecutionRecord,
        noSupabaseWrite:
          latePhasePreviewState.localhostExecutionRecordNoSupabaseWrite,
        noTradeMutation:
          latePhasePreviewState.localhostExecutionRecordNoTradeMutation,
        notEligible: latePhasePreviewState.localhostExecutionRecordNotEligible,
        result: latePhasePreviewState.localhostExecutionRecordEligibility,
      }),
      {
        label: "Session detection no browser actions",
        status: earlyPhasePreviewState.localhostSessionDetectionHasRun
          ? earlyPhasePreviewState.localhostSessionDetectionNoBrowserActions
            ? "pass"
            : "fail"
          : "pending",
        message: earlyPhasePreviewState.localhostSessionDetectionNoBrowserActions
          ? "No browser actions were executed by the session-detection stub."
          : "No session-detection stub metadata is available yet.",
      },
      {
        label: "Session detection no Avanza page touched",
        status: earlyPhasePreviewState.localhostSessionDetectionHasRun
          ? earlyPhasePreviewState.localhostSessionDetectionNoAvanzaTouched
            ? "pass"
            : "fail"
          : "pending",
        message: earlyPhasePreviewState.localhostSessionDetectionNoAvanzaTouched
          ? "No Avanza page was touched by the session-detection stub."
          : "No session-detection stub metadata is available yet.",
      },
      {
        label: "Runner capability",
        status:
          localhostRunnerSelfCheck.status === "available_dry_run_only"
            ? "pass"
            : localhostRunnerSelfCheck.status === "available_mock_only"
              ? "warn"
              : "fail",
        message:
          localhostRunnerSelfCheck.status === "available_dry_run_only"
            ? "Runner self-check passed for Avanza dry-run only. This still does not enable submission."
            : localhostRunnerSelfCheck.status === "available_mock_only"
              ? "Mock-only runner detected. It cannot run Avanza dry-run."
              : (localhostRunnerSelfCheck.blockers[0] ??
                "No Avanza runner exists yet. This is why the overall status remains Not ready to run."),
      },
      {
        label: "Runner Avanza dry-run capable",
        status: localhostRunnerCanRunAvanzaDryRun ? "pass" : "fail",
        message: localhostRunnerCanRunAvanzaDryRun
          ? "Latest self-check says the runner can run Avanza dry-run only."
          : "Latest self-check does not allow Avanza dry-run.",
      },
      {
        label: "Runner can submit broker order",
        status: localhostRunnerCanSubmitBrokerOrder ? "fail" : "pass",
        message: localhostRunnerCanSubmitBrokerOrder
          ? "Runner reports broker submission capability and is blocked."
          : "Runner cannot submit broker orders.",
      },
      {
        label: "Runner can click final confirm",
        status: localhostRunnerCanClickFinalConfirm ? "fail" : "pass",
        message: localhostRunnerCanClickFinalConfirm
          ? "Runner reports final-confirm click capability and is blocked."
          : "Runner cannot click final confirmation.",
      },
      {
        label: "Avanza selectors/URLs missing intentionally",
        status: "pass",
        message:
          "No Avanza selectors or URLs are present in runtime code for this dry-run preview.",
      },
      {
        label: "User manual final confirmation required",
        status: selectedIntent.authority.requires_human_final_confirmation
          ? "pass"
          : "fail",
        message: selectedIntent.authority.requires_human_final_confirmation
          ? "User manual final confirmation required."
          : "Human final confirmation is not required and dry-run is blocked.",
      },
    ],
    localhostRunnerSelfCheckLabels: localhostRunnerSelfCheck.readinessLabels,
    localhostRunnerSelfCheckSummary,
    orderPage: {
      blocked: middlePhasePreviewState.localhostOrderPageBlocked,
      blockerMessage:
        middlePhasePreviewState.localhostOrderPageOpen?.blockers[0] ??
        middlePhasePreviewState.localhostOrderPageOpen?.errors[0] ??
        "order-page-open cannot proceed safely.",
      labels: middlePhasePreviewState.localhostOrderPageOpen?.labels,
      mismatch: middlePhasePreviewState.localhostOrderPageMismatch,
      opened: middlePhasePreviewState.localhostOrderPageOpened,
      summary: localhostOrderPageSummary,
      wrongAction: middlePhasePreviewState.localhostOrderPageWrongAction,
    },
    overall: avanzaDryRunReadinessOverall,
    reviewClick: {
      blocked: middlePhasePreviewState.localhostReviewClickBlocked,
      blockerMessage:
        middlePhasePreviewState.localhostReviewClick?.blockers[0] ??
        middlePhasePreviewState.localhostReviewClick?.errors[0] ??
        "Review-click cannot proceed safely.",
      confirmationMismatch:
        middlePhasePreviewState.localhostReviewClickConfirmationMismatch,
      confirmationReady:
        middlePhasePreviewState.localhostReviewClickConfirmationReady,
      finalConfirmBlocked:
        middlePhasePreviewState.localhostReviewClickFinalConfirmBlocked,
      labels: middlePhasePreviewState.localhostReviewClick?.labels,
      summary: localhostReviewClickSummary,
      validationError: middlePhasePreviewState.localhostReviewClickValidationError,
    },
    searchOnly: {
      ambiguous: earlyPhasePreviewState.localhostSearchOnlyAmbiguous,
      exactMatch: earlyPhasePreviewState.localhostSearchOnlyExactMatch,
      labels: earlyPhasePreviewState.localhostSearchOnly?.labels,
      summary: localhostSearchOnlySummary,
    },
    sessionDetection: {
      labels: earlyPhasePreviewState.localhostSessionDetection?.labels,
      readyForSearchOnly:
        earlyPhasePreviewState.localhostSessionDetectionReadyForSearchOnly,
      summary: localhostSessionDetectionSummary,
    },
  };

  return {
    panelProps,
  };
}
