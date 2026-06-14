import type {
  LocalhostBridgeClientAdvancedFormFillResult,
  LocalhostBridgeClientBrokerConfirmationCaptureResult,
  LocalhostBridgeClientBrokerExecutionResultEligibilityResult,
  LocalhostBridgeClientBrokerExecutionResultPreviewResult,
  LocalhostBridgeClientExecutionRecordEligibilityResult,
  LocalhostBridgeClientInstrumentPageResult,
  LocalhostBridgeClientInstrumentVerificationResult,
  LocalhostBridgeClientOrderPageOpenResult,
  LocalhostBridgeClientReviewClickResult,
  LocalhostBridgeClientSearchOnlyResult,
  LocalhostBridgeClientSessionDetectionResult,
} from "@/lib/avanza-localhost-bridge-client";

export type ExecutionSandboxQaStatus = "pass" | "warn" | "fail" | "pending";

export type ExecutionSandboxQaItem = {
  label: string;
  status: ExecutionSandboxQaStatus;
  message: string;
};

export function buildSessionDetectionReadinessItems({
  hasRun,
  readyForSearchOnly,
  sessionDetection,
}: {
  hasRun: boolean;
  readyForSearchOnly: boolean;
  sessionDetection:
    | NonNullable<
        LocalhostBridgeClientSessionDetectionResult["response"]
      >["sessionDetection"]
    | null;
}): ExecutionSandboxQaItem[] {
  return [
    {
      label: "Session detection status",
      status: hasRun
        ? readyForSearchOnly
          ? "pass"
          : sessionDetection?.status === "login_required"
            ? "warn"
            : sessionDetection?.status === "blocked" ||
                sessionDetection?.status === "failed"
              ? "fail"
              : "pending"
        : "pending",
      message: hasRun
        ? `Latest session-detection status: ${sessionDetection?.status ?? "unknown"}.`
        : "No session-detection stub check has been run in this modal session.",
    },
    {
      label: "Ready for search-only",
      status: hasRun
        ? readyForSearchOnly
          ? "pass"
          : sessionDetection?.status === "login_required"
            ? "warn"
            : "fail"
        : "pending",
      message: readyForSearchOnly
        ? "Ready for future search-only phase. This does not enable search or dry-run execution."
        : sessionDetection?.status === "login_required"
          ? "Login required before any future search-only phase."
          : sessionDetection?.blockers[0] ??
            "Session detection is informational only and has not cleared search-only readiness.",
    },
  ];
}

export function buildSearchOnlyReadinessItems({
  ambiguous,
  blocked,
  exactMatch,
  hasRun,
  noMatch,
  noOrderPageOpened,
  searchOnly,
}: {
  ambiguous: boolean;
  blocked: boolean;
  exactMatch: boolean;
  hasRun: boolean;
  noMatch: boolean;
  noOrderPageOpened: boolean;
  searchOnly:
    | NonNullable<
        LocalhostBridgeClientSearchOnlyResult["response"]
      >["searchOnly"]
    | null;
}): ExecutionSandboxQaItem[] {
  return [
    {
      label: "Search-only status",
      status: hasRun
        ? exactMatch
          ? "pass"
          : ambiguous || noMatch
            ? "warn"
            : blocked
              ? "fail"
              : "pending"
        : "pending",
      message: hasRun
        ? `Latest search-only status: ${searchOnly?.status ?? "unknown"}.`
        : "No search-only stub check has been run in this modal session.",
    },
    {
      label: "Exact match found",
      status: hasRun ? (exactMatch ? "pass" : "warn") : "pending",
      message: exactMatch
        ? "Ready for future instrument-verification phase. This remains informational only."
        : ambiguous
          ? "Manual review required before any future instrument-verification phase."
          : noMatch
            ? "No exact match found by the search-only stub."
            : searchOnly?.blockers[0] ??
              "Search-only has not produced an exact match.",
    },
    {
      label: "Ambiguous candidates",
      status: hasRun ? (ambiguous ? "warn" : "pass") : "pending",
      message: ambiguous
        ? "Manual review required."
        : hasRun
          ? "No ambiguous candidates reported by latest search-only stub."
          : "No search-only stub response available yet.",
    },
    {
      label: "Search-only no order page opened",
      status: hasRun ? (noOrderPageOpened ? "pass" : "fail") : "pending",
      message: noOrderPageOpened
        ? "No order page opened."
        : "No search-only no-order-page metadata is available yet.",
    },
  ];
}

export function buildInstrumentVerificationReadinessItems({
  ambiguous,
  blocked,
  hasRun,
  instrumentVerification,
  noOrderPageOpened,
  rejected,
  verified,
}: {
  ambiguous: boolean;
  blocked: boolean;
  hasRun: boolean;
  instrumentVerification:
    | NonNullable<
        LocalhostBridgeClientInstrumentVerificationResult["response"]
      >["instrumentVerification"]
    | null;
  noOrderPageOpened: boolean;
  rejected: boolean;
  verified: boolean;
}): ExecutionSandboxQaItem[] {
  return [
    {
      label: "Instrument verification status",
      status: hasRun
        ? verified
          ? "pass"
          : rejected || ambiguous
            ? "warn"
            : blocked
              ? "fail"
              : "pending"
        : "pending",
      message: hasRun
        ? `Latest instrument-verification status: ${instrumentVerification?.status ?? "unknown"}.`
        : "No instrument-verification stub check has been run in this modal session.",
    },
    {
      label: "Instrument verified",
      status: hasRun ? (verified ? "pass" : "warn") : "pending",
      message: verified
        ? "Ready for future instrument-page phase. This remains informational only."
        : rejected
          ? "Rejected: manual review required."
          : ambiguous
            ? "Ambiguous: manual review required."
            : instrumentVerification?.blockers[0] ??
              "Instrument verification has not produced a verified result.",
    },
    {
      label: "Instrument rejected",
      status: hasRun ? (rejected ? "warn" : "pass") : "pending",
      message: rejected
        ? "Rejected: manual review required."
        : hasRun
          ? "Latest instrument-verification stub did not reject the instrument."
          : "No instrument-verification stub response available yet.",
    },
    {
      label: "Instrument ambiguous",
      status: hasRun ? (ambiguous ? "warn" : "pass") : "pending",
      message: ambiguous
        ? "Ambiguous: manual review required."
        : hasRun
          ? "Latest instrument-verification stub did not report ambiguity."
          : "No instrument-verification stub response available yet.",
    },
    {
      label: "Instrument no order page opened",
      status: hasRun ? (noOrderPageOpened ? "pass" : "fail") : "pending",
      message: noOrderPageOpened
        ? "No order page opened."
        : "No instrument-verification no-order-page metadata is available yet.",
    },
  ];
}

export function buildInstrumentPageReadinessItems({
  blocked,
  hasRun,
  instrumentPage,
  mismatch,
  noOrderPageOpened,
  pageIdentified,
  prohibitedControlsVisible,
}: {
  blocked: boolean;
  hasRun: boolean;
  instrumentPage:
    | NonNullable<
        LocalhostBridgeClientInstrumentPageResult["response"]
      >["instrumentPage"]
    | null;
  mismatch: boolean;
  noOrderPageOpened: boolean;
  pageIdentified: boolean;
  prohibitedControlsVisible: boolean;
}): ExecutionSandboxQaItem[] {
  return [
    {
      label: "Instrument page status",
      status: hasRun
        ? pageIdentified
          ? "pass"
          : mismatch || prohibitedControlsVisible
            ? "warn"
            : blocked
              ? "fail"
              : "pending"
        : "pending",
      message: hasRun
        ? `Latest instrument-page status: ${instrumentPage?.status ?? "unknown"}.`
        : "No instrument-page stub check has been run in this modal session.",
    },
    {
      label: "Page identified",
      status: hasRun ? (pageIdentified ? "pass" : "warn") : "pending",
      message: pageIdentified
        ? "Ready for future order-page-open design. This remains informational only."
        : mismatch
          ? "Page mismatch: manual review required."
          : instrumentPage?.blockers[0] ??
            "Instrument page identity has not been confirmed.",
    },
    {
      label: "Page mismatch",
      status: hasRun ? (mismatch ? "warn" : "pass") : "pending",
      message: mismatch
        ? "Page mismatch: manual review required."
        : hasRun
          ? "Latest instrument-page stub did not report a page mismatch."
          : "No instrument-page stub response available yet.",
    },
    {
      label: "Prohibited controls visible",
      status: hasRun
        ? prohibitedControlsVisible
          ? "warn"
          : "pass"
        : "pending",
      message: prohibitedControlsVisible
        ? "Buy/sell controls visible - no click allowed."
        : hasRun
          ? "No prohibited buy/sell controls reported by latest instrument-page stub."
          : "No instrument-page stub response available yet.",
    },
    {
      label: "Instrument page no order page opened",
      status: hasRun ? (noOrderPageOpened ? "pass" : "fail") : "pending",
      message: noOrderPageOpened
        ? "No order page opened."
        : "No instrument-page no-order-page metadata is available yet.",
    },
  ];
}

export function buildOrderPageOpenReadinessItems({
  blocked,
  hasRun,
  mismatch,
  noFinalConfirmClick,
  noFormFill,
  noReviewClick,
  orderPageOpen,
  orderPageOpened,
  wrongAction,
}: {
  blocked: boolean;
  hasRun: boolean;
  mismatch: boolean;
  noFinalConfirmClick: boolean;
  noFormFill: boolean;
  noReviewClick: boolean;
  orderPageOpen:
    | NonNullable<
        LocalhostBridgeClientOrderPageOpenResult["response"]
      >["orderPageOpen"]
    | null;
  orderPageOpened: boolean;
  wrongAction: boolean;
}): ExecutionSandboxQaItem[] {
  return [
    {
      label: "Order page open status",
      status: hasRun
        ? orderPageOpened
          ? "pass"
          : wrongAction || mismatch
            ? "warn"
            : blocked
              ? "fail"
              : "pending"
        : "pending",
      message: hasRun
        ? `Latest order-page-open status: ${orderPageOpen?.status ?? "unknown"}.`
        : "No order-page-open stub check has been run in this modal session.",
    },
    {
      label: "Order page opened",
      status: hasRun ? (orderPageOpened ? "pass" : "warn") : "pending",
      message: orderPageOpened
        ? "Ready for future form-fill design. This remains informational only."
        : wrongAction
          ? "Wrong action opened: manual review required."
          : mismatch
            ? "Order page mismatch: manual review required."
            : orderPageOpen?.blockers[0] ??
              "Order-page-open has not produced an opened result.",
    },
    {
      label: "Wrong action opened",
      status: hasRun ? (wrongAction ? "warn" : "pass") : "pending",
      message: wrongAction
        ? "Wrong action opened: manual review required."
        : hasRun
          ? "Latest order-page-open stub did not report a wrong action."
          : "No order-page-open stub response available yet.",
    },
    {
      label: "Order page mismatch",
      status: hasRun ? (mismatch ? "warn" : "pass") : "pending",
      message: mismatch
        ? "Order page mismatch: manual review required."
        : hasRun
          ? "Latest order-page-open stub did not report a page mismatch."
          : "No order-page-open stub response available yet.",
    },
    {
      label: "Order page no form fill",
      status: hasRun ? (noFormFill ? "pass" : "fail") : "pending",
      message: noFormFill
        ? "No form fill occurred."
        : "No order-page-open no-form-fill metadata is available yet.",
    },
    {
      label: "Order page no Granska/Bekräfta",
      status: hasRun
        ? noReviewClick && noFinalConfirmClick
          ? "pass"
          : "fail"
        : "pending",
      message:
        noReviewClick && noFinalConfirmClick
          ? "No Granska or Bekrafta click occurred."
          : "No order-page-open review/final-confirm metadata is available yet.",
    },
  ];
}

export function buildAdvancedFormFillReadinessItems({
  advancedFormFill,
  blocked,
  fieldMismatch,
  formFilled,
  hasRun,
  noBrokerSubmission,
  noFinalConfirmClick,
  noReviewClick,
  unsupportedMode,
  validationError,
}: {
  advancedFormFill:
    | NonNullable<
        LocalhostBridgeClientAdvancedFormFillResult["response"]
      >["advancedFormFill"]
    | null;
  blocked: boolean;
  fieldMismatch: boolean;
  formFilled: boolean;
  hasRun: boolean;
  noBrokerSubmission: boolean;
  noFinalConfirmClick: boolean;
  noReviewClick: boolean;
  unsupportedMode: boolean;
  validationError: boolean;
}): ExecutionSandboxQaItem[] {
  return [
    {
      label: "Advanced form-fill status",
      status: hasRun
        ? formFilled
          ? "pass"
          : fieldMismatch || validationError || unsupportedMode
            ? "warn"
            : blocked
              ? "fail"
              : "pending"
        : "pending",
      message: hasRun
        ? `Latest Advanced form-fill status: ${advancedFormFill?.status ?? "unknown"}.`
        : "No Advanced form-fill stub check has been run in this modal session.",
    },
    {
      label: "Advanced form filled",
      status: hasRun ? (formFilled ? "pass" : "warn") : "pending",
      message: formFilled
        ? "Ready for future review-click design. This remains informational only."
        : fieldMismatch
          ? "Field mismatch: manual review required."
          : validationError
            ? "Validation error: manual review required."
            : advancedFormFill?.blockers[0] ??
              "Advanced form-fill has not produced a filled result.",
    },
    {
      label: "Advanced field mismatch",
      status: hasRun ? (fieldMismatch ? "warn" : "pass") : "pending",
      message: fieldMismatch
        ? "Field mismatch: manual review required."
        : hasRun
          ? "Latest Advanced form-fill stub did not report a field mismatch."
          : "No Advanced form-fill stub response available yet.",
    },
    {
      label: "Advanced validation error",
      status: hasRun ? (validationError ? "warn" : "pass") : "pending",
      message: validationError
        ? "Validation error: manual review required."
        : hasRun
          ? "Latest Advanced form-fill stub did not report validation errors."
          : "No Advanced form-fill stub response available yet.",
    },
    {
      label: "Advanced no Granska/Bekräfta",
      status: hasRun
        ? noReviewClick && noFinalConfirmClick
          ? "pass"
          : "fail"
        : "pending",
      message:
        noReviewClick && noFinalConfirmClick
          ? "No Granska or Bekrafta click occurred."
          : "No Advanced form-fill review/final-confirm metadata is available yet.",
    },
    {
      label: "Advanced no order submission",
      status: hasRun ? (noBrokerSubmission ? "pass" : "fail") : "pending",
      message: noBrokerSubmission
        ? "No order submission occurred."
        : "No Advanced form-fill no-submission metadata is available yet.",
    },
  ];
}

export function buildReviewClickReadinessItems({
  blocked,
  confirmationMismatch,
  confirmationReady,
  hasRun,
  noBrokerResult,
  noFinalConfirmClick,
  reviewClick,
  validationError,
  waitingForManualConfirmation,
}: {
  blocked: boolean;
  confirmationMismatch: boolean;
  confirmationReady: boolean;
  hasRun: boolean;
  noBrokerResult: boolean;
  noFinalConfirmClick: boolean;
  reviewClick:
    | NonNullable<
        LocalhostBridgeClientReviewClickResult["response"]
      >["reviewClick"]
    | null;
  validationError: boolean;
  waitingForManualConfirmation: boolean;
}): ExecutionSandboxQaItem[] {
  return [
    {
      label: "Review click status",
      status: hasRun
        ? confirmationReady
          ? "pass"
          : confirmationMismatch || validationError
            ? "warn"
            : blocked
              ? "fail"
              : "pending"
        : "pending",
      message: hasRun
        ? `Latest review-click status: ${reviewClick?.status ?? "unknown"}.`
        : "No review-click stub check has been run in this modal session.",
    },
    {
      label: "Confirmation ready",
      status: hasRun ? (confirmationReady ? "pass" : "warn") : "pending",
      message: confirmationReady
        ? "Ready for future manual-confirmation wait design. This remains informational only."
        : confirmationMismatch
          ? "Confirmation mismatch: manual review required."
          : validationError
            ? "Validation error: manual review required."
            : reviewClick?.blockers[0] ??
              "Review-click has not produced a confirmation-ready result.",
    },
    {
      label: "Confirmation mismatch",
      status: hasRun ? (confirmationMismatch ? "warn" : "pass") : "pending",
      message: confirmationMismatch
        ? "Confirmation mismatch: manual review required."
        : hasRun
          ? "Latest review-click stub did not report a confirmation mismatch."
          : "No review-click stub response available yet.",
    },
    {
      label: "Waiting for manual confirmation",
      status: hasRun
        ? waitingForManualConfirmation
          ? "pass"
          : "warn"
        : "pending",
      message: waitingForManualConfirmation
        ? "Waiting for manual confirmation. No Bekrafta click is available in Ture."
        : "Review-click stub has not reported a manual-confirmation wait state.",
    },
    {
      label: "Review click no Bekräfta",
      status: hasRun ? (noFinalConfirmClick ? "pass" : "fail") : "pending",
      message: noFinalConfirmClick
        ? "No Bekrafta click occurred."
        : "No review-click final-confirm metadata is available yet.",
    },
    {
      label: "Review click no broker result",
      status: hasRun ? (noBrokerResult ? "pass" : "fail") : "pending",
      message: noBrokerResult
        ? "No broker result was created."
        : "No review-click broker-result metadata is available yet.",
    },
  ];
}

export function buildBrokerConfirmationCaptureReadinessItems({
  blocked,
  capture,
  captured,
  hasRun,
  mismatch,
  noBrokerExecutionResult,
  noExecutionRecord,
  noTradeMutation,
  partial,
  rejectedOrCancelled,
}: {
  blocked: boolean;
  capture:
    | NonNullable<
        LocalhostBridgeClientBrokerConfirmationCaptureResult["response"]
      >["brokerConfirmationCapture"]
    | null;
  captured: boolean;
  hasRun: boolean;
  mismatch: boolean;
  noBrokerExecutionResult: boolean;
  noExecutionRecord: boolean;
  noTradeMutation: boolean;
  partial: boolean;
  rejectedOrCancelled: boolean;
}): ExecutionSandboxQaItem[] {
  return [
    {
      label: "Broker confirmation capture status",
      status: hasRun
        ? captured
          ? "pass"
          : partial || mismatch || rejectedOrCancelled
            ? "warn"
            : blocked
              ? "fail"
              : "pending"
        : "pending",
      message: hasRun
        ? `Latest broker-confirmation-capture status: ${capture?.status ?? "unknown"}.`
        : "No broker-confirmation-capture stub check has been run in this modal session.",
    },
    {
      label: "Broker confirmation captured",
      status: hasRun ? (captured ? "pass" : "warn") : "pending",
      message: captured
        ? "Ready for future BrokerExecutionResult conversion design. This remains informational only."
        : partial
          ? "Partial confirmation: manual review required."
          : mismatch
            ? "Confirmation mismatch: manual review required."
            : rejectedOrCancelled
              ? "Rejected/cancelled: no execution result."
              : (capture?.blockers[0] ??
                "Broker confirmation capture has not produced a captured result."),
    },
    {
      label: "Broker confirmation partial",
      status: hasRun ? (partial ? "warn" : "pass") : "pending",
      message: partial
        ? "Partial confirmation: manual review required."
        : hasRun
          ? "Latest broker-confirmation-capture stub did not report a partial confirmation."
          : "No broker-confirmation-capture stub response available yet.",
    },
    {
      label: "Broker confirmation mismatch",
      status: hasRun ? (mismatch ? "warn" : "pass") : "pending",
      message: mismatch
        ? "Confirmation mismatch: manual review required."
        : hasRun
          ? "Latest broker-confirmation-capture stub did not report a mismatch."
          : "No broker-confirmation-capture stub response available yet.",
    },
    {
      label: "Broker confirmation rejected/cancelled",
      status: hasRun ? (rejectedOrCancelled ? "warn" : "pass") : "pending",
      message: rejectedOrCancelled
        ? "Rejected/cancelled: no execution result."
        : hasRun
          ? "Latest broker-confirmation-capture stub did not report rejected/cancelled."
          : "No broker-confirmation-capture stub response available yet.",
    },
    {
      label: "Broker capture no BrokerExecutionResult",
      status: hasRun
        ? noBrokerExecutionResult
          ? "pass"
          : "fail"
        : "pending",
      message: noBrokerExecutionResult
        ? "No BrokerExecutionResult was created."
        : "No broker-confirmation no-BrokerExecutionResult metadata is available yet.",
    },
    {
      label: "Broker capture no execution record",
      status: hasRun ? (noExecutionRecord ? "pass" : "fail") : "pending",
      message: noExecutionRecord
        ? "No execution record was created."
        : "No broker-confirmation no-execution-record metadata is available yet.",
    },
    {
      label: "Broker capture no trade mutation",
      status: hasRun ? (noTradeMutation ? "pass" : "fail") : "pending",
      message: noTradeMutation
        ? "No trade mutation occurred."
        : "No broker-confirmation no-trade-mutation metadata is available yet.",
    },
  ];
}

export function buildBrokerExecutionEligibilityReadinessItems({
  blocked,
  duplicateRisk,
  eligible,
  eligibility,
  failed,
  hasRun,
  noBrokerExecutionResult,
  noExecutionRecord,
  noSupabaseWrite,
  noTradeMutation,
  notEligible,
  partialOnly,
}: {
  blocked: boolean;
  duplicateRisk: boolean;
  eligible: boolean;
  eligibility:
    | NonNullable<
        LocalhostBridgeClientBrokerExecutionResultEligibilityResult["response"]
      >["eligibility"]
    | null;
  failed: boolean;
  hasRun: boolean;
  noBrokerExecutionResult: boolean;
  noExecutionRecord: boolean;
  noSupabaseWrite: boolean;
  noTradeMutation: boolean;
  notEligible: boolean;
  partialOnly: boolean;
}): ExecutionSandboxQaItem[] {
  return [
    {
      label: "BrokerExecutionResult eligibility status",
      status: hasRun
        ? eligible
          ? "pass"
          : partialOnly || duplicateRisk || notEligible
            ? "warn"
            : blocked || failed
              ? "fail"
              : "pending"
        : "pending",
      message: hasRun
        ? `Latest BrokerExecutionResult eligibility status: ${eligibility?.status ?? "unknown"}.`
        : "No BrokerExecutionResult eligibility stub check has been run in this modal session.",
    },
    {
      label: "BrokerExecutionResult eligible",
      status: hasRun ? (eligible ? "pass" : "warn") : "pending",
      message: eligible
        ? "Ready for future BrokerExecutionResult conversion preview design."
        : partialOnly
          ? "Partial only: conversion blocked until separate policy."
          : duplicateRisk
            ? "Duplicate risk: conversion blocked/idempotency review required."
            : blocked
              ? (eligibility?.blockers[0] ?? "Blocked: not eligible.")
              : "BrokerExecutionResult eligibility has not produced an eligible result.",
    },
    {
      label: "BrokerExecutionResult partial only",
      status: hasRun ? (partialOnly ? "warn" : "pass") : "pending",
      message: partialOnly
        ? "Partial only: conversion blocked until separate policy."
        : hasRun
          ? "Latest eligibility check did not report partial-only evidence."
          : "No BrokerExecutionResult eligibility response available yet.",
    },
    {
      label: "BrokerExecutionResult duplicate risk",
      status: hasRun ? (duplicateRisk ? "warn" : "pass") : "pending",
      message: duplicateRisk
        ? "Duplicate risk: conversion blocked/idempotency review required."
        : hasRun
          ? "Latest eligibility check did not report duplicate risk."
          : "No BrokerExecutionResult eligibility response available yet.",
    },
    {
      label: "Eligibility no BrokerExecutionResult",
      status: hasRun
        ? noBrokerExecutionResult
          ? "pass"
          : "fail"
        : "pending",
      message: noBrokerExecutionResult
        ? "No BrokerExecutionResult was created."
        : "No eligibility no-BrokerExecutionResult metadata is available yet.",
    },
    {
      label: "Eligibility no execution record",
      status: hasRun ? (noExecutionRecord ? "pass" : "fail") : "pending",
      message: noExecutionRecord
        ? "No execution record was created."
        : "No eligibility no-execution-record metadata is available yet.",
    },
    {
      label: "Eligibility no Supabase write",
      status: hasRun ? (noSupabaseWrite ? "pass" : "fail") : "pending",
      message: noSupabaseWrite
        ? "No Supabase write occurred."
        : "No eligibility no-Supabase-write metadata is available yet.",
    },
    {
      label: "Eligibility no trade mutation",
      status: hasRun ? (noTradeMutation ? "pass" : "fail") : "pending",
      message: noTradeMutation
        ? "No trade mutation occurred."
        : "No eligibility no-trade-mutation metadata is available yet.",
    },
  ];
}

export function buildBrokerExecutionPreviewReadinessItems({
  blocked,
  duplicateRisk,
  failed,
  hasRun,
  noExecutionRecord,
  noRealBrokerExecutionResult,
  noSupabaseWrite,
  noTradeMutation,
  notEligible,
  partialOnly,
  previewAvailable,
  previewResult,
}: {
  blocked: boolean;
  duplicateRisk: boolean;
  failed: boolean;
  hasRun: boolean;
  noExecutionRecord: boolean;
  noRealBrokerExecutionResult: boolean;
  noSupabaseWrite: boolean;
  noTradeMutation: boolean;
  notEligible: boolean;
  partialOnly: boolean;
  previewAvailable: boolean;
  previewResult:
    | NonNullable<
        LocalhostBridgeClientBrokerExecutionResultPreviewResult["response"]
      >["brokerExecutionResultPreview"]
    | null;
}): ExecutionSandboxQaItem[] {
  return [
    {
      label: "BrokerExecutionResult preview status",
      status: hasRun
        ? previewAvailable
          ? "pass"
          : partialOnly || duplicateRisk || notEligible
            ? "warn"
            : blocked || failed
              ? "fail"
              : "pending"
        : "pending",
      message: hasRun
        ? `Latest BrokerExecutionResult preview status: ${previewResult?.status ?? "unknown"}.`
        : "No BrokerExecutionResult preview stub check has been run in this modal session.",
    },
    {
      label: "BrokerExecutionResult preview available",
      status: hasRun ? (previewAvailable ? "pass" : "warn") : "pending",
      message: previewAvailable
        ? "Ready for future execution-record boundary design. No real BrokerExecutionResult was created."
        : partialOnly
          ? "Partial only: conversion preview unavailable."
          : duplicateRisk
            ? "Duplicate risk: idempotency review required."
            : blocked
              ? (previewResult?.blockers[0] ?? "Preview blocked.")
              : "BrokerExecutionResult preview has not produced preview-shaped data.",
    },
    {
      label: "BrokerExecutionResult preview partial only",
      status: hasRun ? (partialOnly ? "warn" : "pass") : "pending",
      message: partialOnly
        ? "Partial only: conversion preview unavailable."
        : hasRun
          ? "Latest preview check did not report partial-only evidence."
          : "No BrokerExecutionResult preview response available yet.",
    },
    {
      label: "BrokerExecutionResult preview duplicate risk",
      status: hasRun ? (duplicateRisk ? "warn" : "pass") : "pending",
      message: duplicateRisk
        ? "Duplicate risk: idempotency review required."
        : hasRun
          ? "Latest preview check did not report duplicate risk."
          : "No BrokerExecutionResult preview response available yet.",
    },
    {
      label: "Preview no real BrokerExecutionResult",
      status: hasRun
        ? noRealBrokerExecutionResult
          ? "pass"
          : "fail"
        : "pending",
      message: noRealBrokerExecutionResult
        ? "No real BrokerExecutionResult was created."
        : "No preview no-real-BrokerExecutionResult metadata is available yet.",
    },
    {
      label: "Preview no execution record",
      status: hasRun ? (noExecutionRecord ? "pass" : "fail") : "pending",
      message: noExecutionRecord
        ? "No execution record was created."
        : "No preview no-execution-record metadata is available yet.",
    },
    {
      label: "Preview no Supabase write",
      status: hasRun ? (noSupabaseWrite ? "pass" : "fail") : "pending",
      message: noSupabaseWrite
        ? "No Supabase write occurred."
        : "No preview no-Supabase-write metadata is available yet.",
    },
    {
      label: "Preview no trade mutation",
      status: hasRun ? (noTradeMutation ? "pass" : "fail") : "pending",
      message: noTradeMutation
        ? "No trade mutation occurred."
        : "No preview no-trade-mutation metadata is available yet.",
    },
  ];
}

export function buildExecutionRecordEligibilityReadinessItems({
  blocked,
  duplicateRisk,
  eligible,
  failed,
  hasRun,
  noBrokerExecutionResult,
  noExecutionRecord,
  noSupabaseWrite,
  noTradeMutation,
  notEligible,
  result,
}: {
  blocked: boolean;
  duplicateRisk: boolean;
  eligible: boolean;
  failed: boolean;
  hasRun: boolean;
  noBrokerExecutionResult: boolean;
  noExecutionRecord: boolean;
  noSupabaseWrite: boolean;
  noTradeMutation: boolean;
  notEligible: boolean;
  result:
    | NonNullable<
        LocalhostBridgeClientExecutionRecordEligibilityResult["response"]
      >["executionRecordEligibility"]
    | null;
}): ExecutionSandboxQaItem[] {
  return [
    {
      label: "Execution record eligibility status",
      status: hasRun
        ? eligible
          ? "pass"
          : duplicateRisk || notEligible
            ? "warn"
            : blocked || failed
              ? "fail"
              : "pending"
        : "pending",
      message: hasRun
        ? `Latest execution-record eligibility status: ${result?.status ?? "unknown"}.`
        : "No execution-record eligibility stub check has been run in this modal session.",
    },
    {
      label: "Execution record eligible",
      status: hasRun ? (eligible ? "pass" : "warn") : "pending",
      message: eligible
        ? "Ready for future local execution record preview design. No execution record was created."
        : duplicateRisk
          ? "Duplicate risk: idempotency review required."
          : blocked
            ? (result?.blockers[0] ?? "Execution-record eligibility blocked.")
            : notEligible
              ? "Not eligible for execution-record boundary preview."
              : "Execution-record eligibility has not produced an eligible result.",
    },
    {
      label: "Execution record duplicate risk",
      status: hasRun ? (duplicateRisk ? "warn" : "pass") : "pending",
      message: duplicateRisk
        ? "Duplicate risk detected. Future record creation would require idempotency review."
        : hasRun
          ? "Latest eligibility check did not report duplicate risk."
          : "No execution-record eligibility response available yet.",
    },
    {
      label: "Execution eligibility no BrokerExecutionResult",
      status: hasRun ? (noBrokerExecutionResult ? "pass" : "fail") : "pending",
      message: noBrokerExecutionResult
        ? "No BrokerExecutionResult was created by this eligibility check."
        : "No execution-record no-BrokerExecutionResult metadata is available yet.",
    },
    {
      label: "Execution eligibility no execution record",
      status: hasRun ? (noExecutionRecord ? "pass" : "fail") : "pending",
      message: noExecutionRecord
        ? "No execution record was created."
        : "No execution-record no-record metadata is available yet.",
    },
    {
      label: "Execution eligibility no Supabase write",
      status: hasRun ? (noSupabaseWrite ? "pass" : "fail") : "pending",
      message: noSupabaseWrite
        ? "No Supabase write occurred."
        : "No execution-record no-Supabase-write metadata is available yet.",
    },
    {
      label: "Execution eligibility no trade mutation",
      status: hasRun ? (noTradeMutation ? "pass" : "fail") : "pending",
      message: noTradeMutation
        ? "No trade mutation occurred."
        : "No execution-record no-trade-mutation metadata is available yet.",
    },
  ];
}
