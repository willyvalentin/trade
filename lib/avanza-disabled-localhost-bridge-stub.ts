import type {
  AvanzaLocalBridgeRequest,
} from "./avanza-disabled-local-bridge-contract";

export type AvanzaLocalhostBridgeStubMode =
  | "disabled"
  | "dry_run"
  | "fill_only";

export type AvanzaLocalhostBridgeStubStatus =
  | "stub_disabled"
  | "request_unavailable"
  | "request_invalid"
  | "local_bridge_unavailable"
  | "dry_run_ready"
  | "fill_only_ready"
  | "fill_started_mock"
  | "fill_completed_waiting_manual_review_mock"
  | "fill_blocked"
  | "fill_failed"
  | "cancelled"
  | "unknown";

export type AvanzaLocalhostBridgeStubScenario =
  | "ready"
  | "started"
  | "completed_waiting_manual_review"
  | "blocked"
  | "failed"
  | "cancelled"
  | "unavailable"
  | "unknown";

export type AvanzaLocalhostBridgeStubRequest = {
  accountLabel?: string;
  action: "fill_order_form_only";
  adapterRequestId: string;
  bridgeRequestId: string;
  broker: "avanza";
  createdAt: string;
  finalHumanClickRequired: true;
  limitPrice?: number;
  mode: Exclude<AvanzaLocalhostBridgeStubMode, "disabled">;
  orderType: AvanzaLocalBridgeRequest["orderType"];
  packageId: string;
  quantity: number;
  side: AvanzaLocalBridgeRequest["side"];
  stubRequestId: string;
  symbol: string;
  ticker: string;
  userMustConfirm: true;
};

export type AvanzaLocalhostBridgeStubSafetyFlags = {
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
  stubEnabled: boolean;
  userMustConfirm: true;
};

export type AvanzaLocalhostBridgeStubResponse =
  AvanzaLocalhostBridgeStubSafetyFlags & {
    blockedReasons: string[];
    label: string;
    reason: string;
    request?: AvanzaLocalhostBridgeStubRequest;
    safetyFlags: AvanzaLocalhostBridgeStubSafetyFlags;
    scenario: AvanzaLocalhostBridgeStubScenario;
    status: AvanzaLocalhostBridgeStubStatus;
    warnings: string[];
  };

export type BuildAvanzaLocalhostBridgeStubModelInput = {
  bridgeRequest?: unknown;
  mode?: AvanzaLocalhostBridgeStubMode;
  now?: string;
  scenario?: AvanzaLocalhostBridgeStubScenario;
  stubEnabled?: boolean;
  stubRequestId?: string;
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
  stubEnabled: boolean,
): AvanzaLocalhostBridgeStubSafetyFlags {
  return {
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
    stubEnabled,
    userMustConfirm: true,
  };
}

function buildResponse({
  blockedReasons = [],
  label,
  reason,
  request,
  scenario,
  status,
  stubEnabled = false,
  warnings = [],
}: {
  blockedReasons?: string[];
  label: string;
  reason: string;
  request?: AvanzaLocalhostBridgeStubRequest;
  scenario: AvanzaLocalhostBridgeStubScenario;
  status: AvanzaLocalhostBridgeStubStatus;
  stubEnabled?: boolean;
  warnings?: string[];
}): AvanzaLocalhostBridgeStubResponse {
  const safetyFlags = buildSafetyFlags(stubEnabled);

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

function buildStubRequestId(
  stubRequestId: string | undefined,
  bridgeRequestId: string,
) {
  return (
    nonEmptyString(stubRequestId) ??
    `avanza-disabled-localhost-bridge-stub-${bridgeRequestId}`
  );
}

function toStubRequest({
  bridgeRequest,
  now,
  stubRequestId,
}: {
  bridgeRequest: AvanzaLocalBridgeRequest;
  now: string;
  stubRequestId?: string;
}): AvanzaLocalhostBridgeStubRequest {
  const accountLabel = nonEmptyString(bridgeRequest.accountLabel);
  const limitPrice = finitePositiveNumber(bridgeRequest.limitPrice);

  return {
    ...(accountLabel ? { accountLabel } : {}),
    ...(limitPrice ? { limitPrice } : {}),
    action: "fill_order_form_only",
    adapterRequestId: bridgeRequest.adapterRequestId,
    bridgeRequestId: bridgeRequest.bridgeRequestId,
    broker: "avanza",
    createdAt: now,
    finalHumanClickRequired: true,
    mode: bridgeRequest.mode,
    orderType: bridgeRequest.orderType,
    packageId: bridgeRequest.packageId,
    quantity: bridgeRequest.quantity,
    side: bridgeRequest.side,
    stubRequestId: buildStubRequestId(stubRequestId, bridgeRequest.bridgeRequestId),
    symbol: bridgeRequest.symbol,
    ticker: bridgeRequest.ticker,
    userMustConfirm: true,
  };
}

function scenarioStatus({
  mode,
  scenario,
}: {
  mode: Exclude<AvanzaLocalhostBridgeStubMode, "disabled">;
  scenario: AvanzaLocalhostBridgeStubScenario;
}): AvanzaLocalhostBridgeStubStatus {
  if (scenario === "unavailable") return "local_bridge_unavailable";
  if (scenario === "started") return "fill_started_mock";
  if (scenario === "completed_waiting_manual_review") {
    return "fill_completed_waiting_manual_review_mock";
  }
  if (scenario === "blocked") return "fill_blocked";
  if (scenario === "failed") return "fill_failed";
  if (scenario === "cancelled") return "cancelled";
  if (scenario === "unknown") return "unknown";

  return mode === "dry_run" ? "dry_run_ready" : "fill_only_ready";
}

function statusLabel(status: AvanzaLocalhostBridgeStubStatus) {
  const labels: Record<AvanzaLocalhostBridgeStubStatus, string> = {
    cancelled: "Avanza localhost bridge stub cancelled",
    dry_run_ready: "Avanza localhost bridge stub dry-run ready",
    fill_blocked: "Avanza localhost bridge stub fill blocked",
    fill_completed_waiting_manual_review_mock:
      "Avanza localhost bridge stub waiting for manual review",
    fill_failed: "Avanza localhost bridge stub fill failed",
    fill_only_ready: "Avanza localhost bridge stub fill-only ready",
    fill_started_mock: "Avanza localhost bridge stub fill started mock",
    local_bridge_unavailable: "Avanza localhost bridge stub unavailable",
    request_invalid: "Avanza localhost bridge stub request invalid",
    request_unavailable: "Avanza localhost bridge stub request unavailable",
    stub_disabled: "Avanza localhost bridge stub disabled",
    unknown: "Avanza localhost bridge stub unknown",
  };

  return labels[status];
}

function statusBlockedReasons(status: AvanzaLocalhostBridgeStubStatus) {
  if (
    status === "dry_run_ready" ||
    status === "fill_only_ready" ||
    status === "fill_started_mock" ||
    status === "fill_completed_waiting_manual_review_mock"
  ) {
    return [];
  }

  return [`modeled ${status}`];
}

export function buildAvanzaLocalhostBridgeStubModel({
  bridgeRequest,
  mode = "disabled",
  now = defaultNow,
  scenario = "ready",
  stubEnabled = false,
  stubRequestId,
}: BuildAvanzaLocalhostBridgeStubModelInput = {}): AvanzaLocalhostBridgeStubResponse {
  if (!stubEnabled || mode === "disabled") {
    return buildResponse({
      blockedReasons: ["stub disabled"],
      label: "Avanza localhost bridge stub disabled",
      reason:
        "The disabled localhost bridge stub is off by default. No endpoint, localhost fetch, bridge call, browser control, form fill, review click, confirmation, submit, order, or execution behavior is available.",
      scenario,
      status: "stub_disabled",
    });
  }

  if (bridgeRequest === undefined || bridgeRequest === null) {
    return buildResponse({
      blockedReasons: ["bridge request unavailable"],
      label: "Avanza localhost bridge stub request unavailable",
      reason:
        "No explicit disabled local bridge request was provided to the localhost bridge stub model.",
      scenario,
      status: "request_unavailable",
      stubEnabled,
    });
  }

  if (!isSafeBridgeRequest(bridgeRequest)) {
    return buildResponse({
      blockedReasons: ["bridge request invalid"],
      label: "Avanza localhost bridge stub request invalid",
      reason:
        "The explicit bridge request does not match the safe disabled local bridge request shape.",
      scenario,
      status: "request_invalid",
      stubEnabled,
    });
  }

  if (mode !== "dry_run" && mode !== "fill_only") {
    return buildResponse({
      blockedReasons: ["stub mode invalid"],
      label: "Avanza localhost bridge stub request invalid",
      reason:
        "The disabled localhost bridge stub only accepts explicit dry_run or fill_only mode when enabled in model-only tests.",
      scenario,
      status: "request_invalid",
      stubEnabled,
    });
  }

  if (bridgeRequest.mode !== mode || hasUnsafeBridgeRequest(bridgeRequest)) {
    return buildResponse({
      blockedReasons: ["bridge request unsafe for requested stub mode"],
      label:
        mode === "fill_only"
          ? "Avanza localhost bridge stub fill blocked"
          : "Avanza localhost bridge stub request invalid",
      reason:
        "The explicit bridge request is present but unsafe or mismatched for the disabled localhost bridge stub mode.",
      scenario,
      status: mode === "fill_only" ? "fill_blocked" : "request_invalid",
      stubEnabled,
    });
  }

  const request = toStubRequest({
    bridgeRequest,
    now,
    stubRequestId,
  });
  const status = scenarioStatus({ mode, scenario });

  return buildResponse({
    blockedReasons: statusBlockedReasons(status),
    label: statusLabel(status),
    reason:
      status === "fill_completed_waiting_manual_review_mock"
        ? "The disabled localhost bridge stub modeled a completed fill-form wait state only. Manual review and final human click remain mandatory; no review click, confirmation, submit, order, or execution occurred."
        : "This is a pure disabled localhost bridge stub model response only. No endpoint, localhost fetch, bridge call, browser control, form fill, review click, confirmation, submit, order, credential handling, or Supabase write occurred.",
    request,
    scenario,
    status,
    stubEnabled,
  });
}
