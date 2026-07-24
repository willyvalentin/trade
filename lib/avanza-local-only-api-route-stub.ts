import type {
  AvanzaLocalBridgeRequest,
} from "./avanza-disabled-local-bridge-contract";

export type AvanzaLocalOnlyApiRouteStubMode =
  | "disabled"
  | "dry_run"
  | "fill_only";

export type AvanzaLocalOnlyApiRouteStubStatus =
  | "api_stub_disabled"
  | "request_unavailable"
  | "request_invalid"
  | "local_only_not_enabled"
  | "dry_run_ready_mock"
  | "fill_only_ready_mock"
  | "fill_started_mock"
  | "fill_completed_waiting_manual_review_mock"
  | "fill_blocked"
  | "fill_failed"
  | "cancelled"
  | "unknown";

export type AvanzaLocalOnlyApiRouteStubScenario =
  | "ready"
  | "started"
  | "completed_waiting_manual_review"
  | "blocked"
  | "failed"
  | "cancelled"
  | "local_only_not_enabled"
  | "unknown";

export type AvanzaLocalOnlyApiRouteStubRequest = {
  accountLabel?: string;
  action: "fill_order_form_only";
  adapterRequestId: string;
  apiRequestId: string;
  bridgeRequestId: string;
  broker: "avanza";
  createdAt: string;
  finalHumanClickRequired: true;
  limitPrice?: number;
  mode: Exclude<AvanzaLocalOnlyApiRouteStubMode, "disabled">;
  orderType: AvanzaLocalBridgeRequest["orderType"];
  packageId: string;
  quantity: number;
  side: AvanzaLocalBridgeRequest["side"];
  symbol: string;
  ticker: string;
  userMustConfirm: true;
};

export type AvanzaLocalOnlyApiRouteStubSafetyFlags = {
  apiRouteEnabled: boolean;
  canCallBridge: false;
  canClickConfirm: false;
  canClickReview: false;
  canControlBrowser: false;
  canExposeEndpoint: false;
  canFetchLocalhost: false;
  canFillForm: false;
  canHandleCredentials: false;
  canReadBankId: false;
  canReadCookies: false;
  canSubmitOrder: false;
  canWriteSupabaseExecution: false;
  controlsEnabled: false;
  finalHumanClickRequired: true;
  gateLocked: true;
  localOnly: true;
  userMustConfirm: true;
};

export type AvanzaLocalOnlyApiRouteStubResponse =
  AvanzaLocalOnlyApiRouteStubSafetyFlags & {
    blockedReasons: string[];
    label: string;
    reason: string;
    request?: AvanzaLocalOnlyApiRouteStubRequest;
    safetyFlags: AvanzaLocalOnlyApiRouteStubSafetyFlags;
    scenario: AvanzaLocalOnlyApiRouteStubScenario;
    status: AvanzaLocalOnlyApiRouteStubStatus;
    warnings: string[];
  };

export type BuildAvanzaLocalOnlyApiRouteStubModelInput = {
  apiRequestId?: string;
  apiRouteEnabled?: boolean;
  bridgeRequest?: unknown;
  localOnlyEnabled?: boolean;
  mode?: AvanzaLocalOnlyApiRouteStubMode;
  now?: string;
  scenario?: AvanzaLocalOnlyApiRouteStubScenario;
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

function finitePositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function isSafeBridgeRequest(value: unknown): value is AvanzaLocalBridgeRequest {
  if (!isRecord(value)) {
    return false;
  }

  const mode = value.mode;
  const side = value.side;
  const orderType = nonEmptyString(value.orderType)?.toUpperCase();

  return (
    value.broker === "avanza" &&
    value.action === "fill_order_form_only" &&
    (mode === "dry_run" || mode === "fill_only") &&
    (side === "BUY" || side === "SELL") &&
    value.userMustConfirm === true &&
    value.finalHumanClickRequired === true &&
    Boolean(nonEmptyString(value.adapterRequestId)) &&
    Boolean(nonEmptyString(value.bridgeRequestId)) &&
    Boolean(nonEmptyString(value.packageId)) &&
    Boolean(nonEmptyString(value.ticker)) &&
    Boolean(nonEmptyString(value.symbol)) &&
    Boolean(orderType) &&
    (orderType === "MARKET" ||
      finitePositiveNumber(value.limitPrice) !== undefined) &&
    finitePositiveNumber(value.quantity) !== undefined
  );
}

function hasUnsafeBridgeRequest(value: AvanzaLocalBridgeRequest) {
  return value.userMustConfirm !== true || value.finalHumanClickRequired !== true;
}

function buildSafetyFlags(
  apiRouteEnabled: boolean,
): AvanzaLocalOnlyApiRouteStubSafetyFlags {
  return {
    apiRouteEnabled,
    canCallBridge: false,
    canClickConfirm: false,
    canClickReview: false,
    canControlBrowser: false,
    canExposeEndpoint: false,
    canFetchLocalhost: false,
    canFillForm: false,
    canHandleCredentials: false,
    canReadBankId: false,
    canReadCookies: false,
    canSubmitOrder: false,
    canWriteSupabaseExecution: false,
    controlsEnabled: false,
    finalHumanClickRequired: true,
    gateLocked: true,
    localOnly: true,
    userMustConfirm: true,
  };
}

function buildResponse({
  apiRouteEnabled = false,
  blockedReasons = [],
  label,
  reason,
  request,
  scenario,
  status,
  warnings = [],
}: {
  apiRouteEnabled?: boolean;
  blockedReasons?: string[];
  label: string;
  reason: string;
  request?: AvanzaLocalOnlyApiRouteStubRequest;
  scenario: AvanzaLocalOnlyApiRouteStubScenario;
  status: AvanzaLocalOnlyApiRouteStubStatus;
  warnings?: string[];
}): AvanzaLocalOnlyApiRouteStubResponse {
  const safetyFlags = buildSafetyFlags(apiRouteEnabled);

  return {
    ...(request ? { request } : {}),
    ...safetyFlags,
    blockedReasons,
    label,
    reason,
    safetyFlags,
    scenario,
    status,
    warnings,
  };
}

function buildApiRequestId(
  apiRequestId: string | undefined,
  bridgeRequestId: string,
) {
  return (
    nonEmptyString(apiRequestId) ??
    `avanza-local-only-api-route-stub-${bridgeRequestId}`
  );
}

function toApiStubRequest({
  apiRequestId,
  bridgeRequest,
  now,
}: {
  apiRequestId?: string;
  bridgeRequest: AvanzaLocalBridgeRequest;
  now: string;
}): AvanzaLocalOnlyApiRouteStubRequest {
  const accountLabel = nonEmptyString(bridgeRequest.accountLabel);
  const limitPrice = finitePositiveNumber(bridgeRequest.limitPrice);

  return {
    ...(accountLabel ? { accountLabel } : {}),
    ...(limitPrice ? { limitPrice } : {}),
    action: "fill_order_form_only",
    adapterRequestId: bridgeRequest.adapterRequestId,
    apiRequestId: buildApiRequestId(apiRequestId, bridgeRequest.bridgeRequestId),
    bridgeRequestId: bridgeRequest.bridgeRequestId,
    broker: "avanza",
    createdAt: now,
    finalHumanClickRequired: true,
    mode: bridgeRequest.mode,
    orderType: bridgeRequest.orderType,
    packageId: bridgeRequest.packageId,
    quantity: bridgeRequest.quantity,
    side: bridgeRequest.side,
    symbol: bridgeRequest.symbol,
    ticker: bridgeRequest.ticker,
    userMustConfirm: true,
  };
}

function scenarioStatus({
  mode,
  scenario,
}: {
  mode: Exclude<AvanzaLocalOnlyApiRouteStubMode, "disabled">;
  scenario: AvanzaLocalOnlyApiRouteStubScenario;
}): AvanzaLocalOnlyApiRouteStubStatus {
  if (scenario === "local_only_not_enabled") return "local_only_not_enabled";
  if (scenario === "started") return "fill_started_mock";
  if (scenario === "completed_waiting_manual_review") {
    return "fill_completed_waiting_manual_review_mock";
  }
  if (scenario === "blocked") return "fill_blocked";
  if (scenario === "failed") return "fill_failed";
  if (scenario === "cancelled") return "cancelled";
  if (scenario === "unknown") return "unknown";

  return mode === "dry_run" ? "dry_run_ready_mock" : "fill_only_ready_mock";
}

function statusLabel(status: AvanzaLocalOnlyApiRouteStubStatus) {
  const labels: Record<AvanzaLocalOnlyApiRouteStubStatus, string> = {
    api_stub_disabled: "Avanza local-only API route stub disabled",
    cancelled: "Avanza local-only API route stub cancelled",
    dry_run_ready_mock: "Avanza local-only API route stub dry-run mock ready",
    fill_blocked: "Avanza local-only API route stub fill blocked",
    fill_completed_waiting_manual_review_mock:
      "Avanza local-only API route stub waiting for manual review",
    fill_failed: "Avanza local-only API route stub fill failed",
    fill_only_ready_mock:
      "Avanza local-only API route stub fill-only mock ready",
    fill_started_mock: "Avanza local-only API route stub fill started mock",
    local_only_not_enabled: "Avanza local-only API route stub not enabled",
    request_invalid: "Avanza local-only API route stub request invalid",
    request_unavailable: "Avanza local-only API route stub request unavailable",
    unknown: "Avanza local-only API route stub unknown",
  };

  return labels[status];
}

function statusBlockedReasons(status: AvanzaLocalOnlyApiRouteStubStatus) {
  if (
    status === "dry_run_ready_mock" ||
    status === "fill_only_ready_mock" ||
    status === "fill_started_mock" ||
    status === "fill_completed_waiting_manual_review_mock"
  ) {
    return [];
  }

  return [`modeled ${status}`];
}

export function buildAvanzaLocalOnlyApiRouteStubModel({
  apiRequestId,
  apiRouteEnabled = false,
  bridgeRequest,
  localOnlyEnabled = false,
  mode = "disabled",
  now = defaultNow,
  scenario = "ready",
}: BuildAvanzaLocalOnlyApiRouteStubModelInput = {}): AvanzaLocalOnlyApiRouteStubResponse {
  if (!apiRouteEnabled || mode === "disabled") {
    return buildResponse({
      blockedReasons: ["api route stub disabled"],
      label: "Avanza local-only API route stub disabled",
      reason:
        "The local-only API route stub model is disabled by default. No Next.js route, endpoint, network call, bridge call, browser control, form fill, review click, confirmation, submit, order, or execution behavior is available.",
      scenario,
      status: "api_stub_disabled",
    });
  }

  if (!localOnlyEnabled || scenario === "local_only_not_enabled") {
    return buildResponse({
      apiRouteEnabled,
      blockedReasons: ["local-only guard not enabled"],
      label: "Avanza local-only API route stub not enabled",
      reason:
        "The local-only guard is not enabled, so the API route stub model returns a disabled mock state only.",
      scenario,
      status: "local_only_not_enabled",
    });
  }

  if (bridgeRequest === undefined || bridgeRequest === null) {
    return buildResponse({
      apiRouteEnabled,
      blockedReasons: ["bridge request unavailable"],
      label: "Avanza local-only API route stub request unavailable",
      reason:
        "No explicit disabled local bridge request was provided to the local-only API route stub model.",
      scenario,
      status: "request_unavailable",
    });
  }

  if (!isSafeBridgeRequest(bridgeRequest)) {
    return buildResponse({
      apiRouteEnabled,
      blockedReasons: ["bridge request invalid"],
      label: "Avanza local-only API route stub request invalid",
      reason:
        "The explicit bridge request does not match the safe disabled local bridge request shape.",
      scenario,
      status: "request_invalid",
    });
  }

  if (mode !== "dry_run" && mode !== "fill_only") {
    return buildResponse({
      apiRouteEnabled,
      blockedReasons: ["api route stub mode invalid"],
      label: "Avanza local-only API route stub request invalid",
      reason:
        "The local-only API route stub model only accepts explicit dry_run or fill_only mode when enabled in tests.",
      scenario,
      status: "request_invalid",
    });
  }

  if (bridgeRequest.mode !== mode || hasUnsafeBridgeRequest(bridgeRequest)) {
    return buildResponse({
      apiRouteEnabled,
      blockedReasons: ["bridge request unsafe for requested API route stub mode"],
      label:
        mode === "fill_only"
          ? "Avanza local-only API route stub fill blocked"
          : "Avanza local-only API route stub request invalid",
      reason:
        "The explicit bridge request is present but unsafe or mismatched for the local-only API route stub mode.",
      scenario,
      status: mode === "fill_only" ? "fill_blocked" : "request_invalid",
    });
  }

  const request = toApiStubRequest({
    apiRequestId,
    bridgeRequest,
    now,
  });
  const status = scenarioStatus({ mode, scenario });

  return buildResponse({
    apiRouteEnabled,
    blockedReasons: statusBlockedReasons(status),
    label: statusLabel(status),
    reason:
      status === "fill_completed_waiting_manual_review_mock"
        ? "The local-only API route stub model reached a mocked waiting-for-manual-review state only. Manual review and final human click remain mandatory; no review click, confirmation, submit, order, or execution occurred."
        : "This is a pure local-only API route stub model response only. No endpoint, network call, bridge call, browser control, form fill, review click, confirmation, submit, order, credential handling, or Supabase write occurred.",
    request,
    scenario,
    status,
  });
}
