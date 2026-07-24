import type {
  AvanzaFillOnlyAdapterRequest,
  AvanzaFillOnlyAdapterResponse,
} from "./avanza-fill-only-adapter-contract";

export type AvanzaDryRunAdapterScenario =
  | "success"
  | "blocked"
  | "failed"
  | "cancelled"
  | "unknown";

export type AvanzaDryRunAdapterStatus =
  | "dry_run_disabled"
  | "request_unavailable"
  | "request_invalid"
  | "dry_run_ready"
  | "dry_run_started"
  | "dry_run_completed_waiting_manual_review"
  | "dry_run_blocked"
  | "dry_run_failed"
  | "dry_run_cancelled"
  | "dry_run_unknown";

export type AvanzaDryRunAdapterProgressEventType =
  | "request_received"
  | "package_validated"
  | "broker_context_checked_mock"
  | "form_mapping_checked_mock"
  | "manual_review_required"
  | "dry_run_completed"
  | "dry_run_failed"
  | "dry_run_cancelled";

export type AvanzaDryRunAdapterProgressEvent = {
  at: string;
  label: string;
  type: AvanzaDryRunAdapterProgressEventType;
};

export type AvanzaDryRunAdapterSafetyFlags = {
  canCallBridge: false;
  canClickConfirm: false;
  canClickReview: false;
  canControlBrowser: false;
  canFetchLocalhost: false;
  canFillForm: false;
  canHandleCredentials: false;
  canReadBankId: false;
  canReadCookies: false;
  canStartDryRun: boolean;
  canSubmitOrder: false;
  canWriteSupabaseExecution: false;
  controlsEnabled: false;
  finalHumanClickRequired: true;
  gateLocked: true;
  userMustConfirm: true;
};

export type AvanzaDryRunAdapterResult = AvanzaDryRunAdapterSafetyFlags & {
  adapterRequest?: AvanzaFillOnlyAdapterRequest;
  blockedReasons: string[];
  label: string;
  progressEvents: AvanzaDryRunAdapterProgressEvent[];
  reason: string;
  runId?: string;
  safetyFlags: AvanzaDryRunAdapterSafetyFlags;
  scenario: AvanzaDryRunAdapterScenario;
  status: AvanzaDryRunAdapterStatus;
  warnings: string[];
};

export type BuildAvanzaDryRunAdapterResultInput = {
  adapterResponse?: unknown;
  dryRunEnabled: boolean;
  now?: string;
  runId?: string;
  scenario?: AvanzaDryRunAdapterScenario;
};

const defaultNow = "not_provided";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function isSafeRequest(value: unknown): value is AvanzaFillOnlyAdapterRequest {
  if (!isRecord(value)) {
    return false;
  }

  const broker = value.broker;
  const mode = value.mode;
  const side = value.side;

  return (
    broker === "avanza" &&
    (mode === "dry_run" || mode === "fill_only") &&
    (side === "BUY" || side === "SELL") &&
    value.userMustConfirm === true &&
    value.finalHumanClickRequired === true &&
    Boolean(nonEmptyString(value.requestId)) &&
    Boolean(nonEmptyString(value.packageId)) &&
    Boolean(nonEmptyString(value.ticker)) &&
    Boolean(nonEmptyString(value.symbol)) &&
    typeof value.quantity === "number" &&
    Number.isFinite(value.quantity) &&
    value.quantity > 0
  );
}

function isAdapterResponse(
  value: unknown,
): value is AvanzaFillOnlyAdapterResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.status === "string" &&
    typeof value.label === "string" &&
    typeof value.reason === "string" &&
    Array.isArray(value.blockedReasons) &&
    Array.isArray(value.warnings)
  );
}

function hasUnsafeAdapterFlags(value: AvanzaFillOnlyAdapterResponse) {
  return (
    value.canClickReview !== false ||
    value.canClickConfirm !== false ||
    value.canSubmitOrder !== false ||
    value.canHandleCredentials !== false ||
    value.canReadCookies !== false ||
    value.canReadBankId !== false ||
    value.canWriteSupabaseExecution !== false ||
    value.controlsEnabled !== false ||
    value.gateLocked !== true ||
    value.userMustConfirm !== true ||
    value.finalHumanClickRequired !== true
  );
}

function isReadyAdapterResponse(
  value: AvanzaFillOnlyAdapterResponse,
): value is AvanzaFillOnlyAdapterResponse & {
  request: AvanzaFillOnlyAdapterRequest;
} {
  return (
    (value.status === "dry_run_ready" || value.status === "fill_only_ready") &&
    isSafeRequest(value.request) &&
    !hasUnsafeAdapterFlags(value)
  );
}

function buildSafetyFlags(canStartDryRun: boolean): AvanzaDryRunAdapterSafetyFlags {
  return {
    canCallBridge: false,
    canClickConfirm: false,
    canClickReview: false,
    canControlBrowser: false,
    canFetchLocalhost: false,
    canFillForm: false,
    canHandleCredentials: false,
    canReadBankId: false,
    canReadCookies: false,
    canStartDryRun,
    canSubmitOrder: false,
    canWriteSupabaseExecution: false,
    controlsEnabled: false,
    finalHumanClickRequired: true,
    gateLocked: true,
    userMustConfirm: true,
  };
}

function progressEvent(
  type: AvanzaDryRunAdapterProgressEventType,
  at: string,
): AvanzaDryRunAdapterProgressEvent {
  const labels: Record<AvanzaDryRunAdapterProgressEventType, string> = {
    broker_context_checked_mock: "Mock broker context checked",
    dry_run_cancelled: "Dry-run cancelled",
    dry_run_completed: "Dry-run completed without execution",
    dry_run_failed: "Dry-run failed",
    form_mapping_checked_mock: "Mock form mapping checked",
    manual_review_required: "Manual review required",
    package_validated: "Adapter request package validated",
    request_received: "Adapter request received",
  };

  return {
    at,
    label: labels[type],
    type,
  };
}

function buildResult({
  adapterRequest,
  blockedReasons = [],
  canStartDryRun = false,
  label,
  progressEvents = [],
  reason,
  runId,
  scenario,
  status,
  warnings = [],
}: {
  adapterRequest?: AvanzaFillOnlyAdapterRequest;
  blockedReasons?: string[];
  canStartDryRun?: boolean;
  label: string;
  progressEvents?: AvanzaDryRunAdapterProgressEvent[];
  reason: string;
  runId?: string;
  scenario: AvanzaDryRunAdapterScenario;
  status: AvanzaDryRunAdapterStatus;
  warnings?: string[];
}): AvanzaDryRunAdapterResult {
  const safetyFlags = buildSafetyFlags(canStartDryRun);

  return {
    ...(adapterRequest ? { adapterRequest } : {}),
    ...(runId ? { runId } : {}),
    ...safetyFlags,
    blockedReasons,
    label,
    progressEvents,
    reason,
    safetyFlags,
    scenario,
    status,
    warnings,
  };
}

function baseProgress(now: string) {
  return [
    progressEvent("request_received", now),
    progressEvent("package_validated", now),
  ];
}

export function buildAvanzaDryRunAdapterResult({
  adapterResponse,
  dryRunEnabled,
  now = defaultNow,
  runId,
  scenario,
}: BuildAvanzaDryRunAdapterResultInput): AvanzaDryRunAdapterResult {
  const resultScenario = scenario ?? "unknown";

  if (!dryRunEnabled) {
    return buildResult({
      blockedReasons: ["dry-run disabled"],
      label: "Avanza dry-run adapter disabled",
      reason:
        "The Avanza dry-run adapter layer is disabled by explicit input. No adapter lifecycle can start.",
      runId,
      scenario: resultScenario,
      status: "dry_run_disabled",
    });
  }

  if (adapterResponse === undefined || adapterResponse === null) {
    return buildResult({
      blockedReasons: ["adapter response unavailable"],
      label: "Avanza dry-run adapter request unavailable",
      reason:
        "No explicit Avanza fill-only adapter response was provided to the dry-run layer.",
      runId,
      scenario: resultScenario,
      status: "request_unavailable",
    });
  }

  if (!isAdapterResponse(adapterResponse)) {
    return buildResult({
      blockedReasons: ["adapter response invalid"],
      label: "Avanza dry-run adapter request invalid",
      reason:
        "The explicit adapter response does not match the fill-only adapter contract shape.",
      runId,
      scenario: resultScenario,
      status: "request_invalid",
    });
  }

  if (!isReadyAdapterResponse(adapterResponse)) {
    return buildResult({
      blockedReasons:
        adapterResponse.blockedReasons.length > 0
          ? adapterResponse.blockedReasons
          : ["adapter response is not safe dry-run input"],
      label: "Avanza dry-run adapter blocked",
      reason:
        "The explicit adapter response is unavailable, blocked, unsafe, or missing a safe request model.",
      runId,
      scenario: resultScenario,
      status: "dry_run_blocked",
      warnings: adapterResponse.warnings,
    });
  }

  if (scenario === "success") {
    return buildResult({
      adapterRequest: adapterResponse.request,
      canStartDryRun: true,
      label: "Avanza dry-run completed waiting manual review",
      progressEvents: [
        ...baseProgress(now),
        progressEvent("broker_context_checked_mock", now),
        progressEvent("form_mapping_checked_mock", now),
        progressEvent("manual_review_required", now),
        progressEvent("dry_run_completed", now),
      ],
      reason:
        "The dry-run lifecycle completed as model-only progress and is waiting for manual review. No fill, review click, confirmation, or order submission occurred.",
      runId,
      scenario: resultScenario,
      status: "dry_run_completed_waiting_manual_review",
      warnings: adapterResponse.warnings,
    });
  }

  if (scenario === "blocked") {
    return buildResult({
      adapterRequest: adapterResponse.request,
      blockedReasons: ["dry-run scenario blocked"],
      label: "Avanza dry-run blocked",
      progressEvents: baseProgress(now),
      reason:
        "The explicit dry-run scenario is blocked before any fill, browser control, or order behavior.",
      runId,
      scenario: resultScenario,
      status: "dry_run_blocked",
      warnings: adapterResponse.warnings,
    });
  }

  if (scenario === "failed") {
    return buildResult({
      adapterRequest: adapterResponse.request,
      blockedReasons: ["dry-run scenario failed"],
      label: "Avanza dry-run failed",
      progressEvents: [
        ...baseProgress(now),
        progressEvent("dry_run_failed", now),
      ],
      reason:
        "The explicit dry-run scenario failed in model-only simulation. No live adapter action was attempted.",
      runId,
      scenario: resultScenario,
      status: "dry_run_failed",
      warnings: adapterResponse.warnings,
    });
  }

  if (scenario === "cancelled") {
    return buildResult({
      adapterRequest: adapterResponse.request,
      blockedReasons: ["dry-run scenario cancelled"],
      label: "Avanza dry-run cancelled",
      progressEvents: [
        ...baseProgress(now),
        progressEvent("dry_run_cancelled", now),
      ],
      reason:
        "The explicit dry-run scenario was cancelled in model-only simulation. No live adapter action was attempted.",
      runId,
      scenario: resultScenario,
      status: "dry_run_cancelled",
      warnings: adapterResponse.warnings,
    });
  }

  if (scenario === "unknown") {
    return buildResult({
      adapterRequest: adapterResponse.request,
      blockedReasons: ["dry-run scenario unknown"],
      label: "Avanza dry-run unknown",
      progressEvents: baseProgress(now),
      reason:
        "The explicit dry-run scenario is unknown and remains model-only. No fill, review, confirmation, or order behavior is available.",
      runId,
      scenario: resultScenario,
      status: "dry_run_unknown",
      warnings: adapterResponse.warnings,
    });
  }

  return buildResult({
    adapterRequest: adapterResponse.request,
    canStartDryRun: true,
    label: "Avanza dry-run ready",
    progressEvents: baseProgress(now),
    reason:
      "A safe explicit adapter response is ready for dry-run lifecycle simulation only.",
    runId,
    scenario: resultScenario,
    status: "dry_run_ready",
    warnings: adapterResponse.warnings,
  });
}
