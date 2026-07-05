import type {
  AvanzaFillOnlyAdapterRequest,
  AvanzaFillOnlyAdapterResponse,
} from "./avanza-fill-only-adapter-contract";

export type AvanzaLocalBridgeMode = "disabled" | "dry_run" | "fill_only";

export type AvanzaLocalBridgeAction = "fill_order_form_only";

export type AvanzaLocalBridgeStatus =
  | "bridge_disabled"
  | "request_unavailable"
  | "request_invalid"
  | "bridge_unavailable"
  | "dry_run_ready"
  | "fill_only_ready"
  | "fill_started"
  | "fill_completed_waiting_manual_review"
  | "fill_blocked"
  | "fill_failed"
  | "cancelled"
  | "unknown";

export type AvanzaLocalBridgeSafetyFlags = {
  bridgeEnabled: boolean;
  canCallBridge: false;
  canClickConfirm: false;
  canClickReview: false;
  canControlBrowser: false;
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
  userMustConfirm: true;
};

export type AvanzaLocalBridgeRequest = {
  accountLabel?: string;
  action: AvanzaLocalBridgeAction;
  adapterRequestId: string;
  bridgeRequestId: string;
  broker: "avanza";
  createdAt: string;
  finalHumanClickRequired: true;
  limitPrice?: number;
  mode: Exclude<AvanzaLocalBridgeMode, "disabled">;
  orderType: AvanzaFillOnlyAdapterRequest["orderType"];
  packageId: string;
  quantity: number;
  side: AvanzaFillOnlyAdapterRequest["side"];
  symbol: string;
  ticker: string;
  userMustConfirm: true;
};

export type AvanzaLocalBridgeResponse = AvanzaLocalBridgeSafetyFlags & {
  blockedReasons: string[];
  label: string;
  reason: string;
  request?: AvanzaLocalBridgeRequest;
  safetyFlags: AvanzaLocalBridgeSafetyFlags;
  status: AvanzaLocalBridgeStatus;
  warnings: string[];
};

export type BuildAvanzaLocalBridgeContractInput = {
  adapterResponse?: unknown;
  bridgeEnabled?: boolean;
  bridgeRequestId?: string;
  mode?: AvanzaLocalBridgeMode;
  now?: string;
  statusOverride?: Extract<
    AvanzaLocalBridgeStatus,
    | "bridge_unavailable"
    | "fill_started"
    | "fill_completed_waiting_manual_review"
    | "fill_failed"
    | "cancelled"
    | "unknown"
  >;
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

function isSafeAdapterRequest(
  value: unknown,
): value is AvanzaFillOnlyAdapterRequest {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.broker === "avanza" &&
    (value.mode === "dry_run" || value.mode === "fill_only") &&
    (value.side === "BUY" || value.side === "SELL") &&
    value.userMustConfirm === true &&
    value.finalHumanClickRequired === true &&
    Boolean(nonEmptyString(value.requestId)) &&
    Boolean(nonEmptyString(value.packageId)) &&
    Boolean(nonEmptyString(value.ticker)) &&
    Boolean(nonEmptyString(value.symbol)) &&
    Boolean(nonEmptyString(value.orderType)) &&
    finitePositiveNumber(value.quantity) !== undefined
  );
}

function isAdapterResponse(
  value: unknown,
): value is AvanzaFillOnlyAdapterResponse {
  return (
    isRecord(value) &&
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

function isReadyAdapterResponseForMode(
  value: AvanzaFillOnlyAdapterResponse,
  mode: Exclude<AvanzaLocalBridgeMode, "disabled">,
): value is AvanzaFillOnlyAdapterResponse & {
  request: AvanzaFillOnlyAdapterRequest;
} {
  return (
    ((mode === "dry_run" && value.status === "dry_run_ready") ||
      (mode === "fill_only" && value.status === "fill_only_ready")) &&
    isSafeAdapterRequest(value.request) &&
    value.request.mode === mode &&
    !hasUnsafeAdapterFlags(value)
  );
}

function buildSafetyFlags(bridgeEnabled: boolean): AvanzaLocalBridgeSafetyFlags {
  return {
    bridgeEnabled,
    canCallBridge: false,
    canClickConfirm: false,
    canClickReview: false,
    canControlBrowser: false,
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
    userMustConfirm: true,
  };
}

function buildBridgeRequestId(
  bridgeRequestId: string | undefined,
  adapterRequestId: string,
) {
  const explicitId = nonEmptyString(bridgeRequestId);

  return explicitId ?? `avanza-disabled-local-bridge-${adapterRequestId}`;
}

function buildRequestFromAdapterRequest({
  adapterRequest,
  bridgeRequestId,
  now,
}: {
  adapterRequest: AvanzaFillOnlyAdapterRequest;
  bridgeRequestId?: string;
  now: string;
}): AvanzaLocalBridgeRequest {
  const accountLabel = nonEmptyString(adapterRequest.accountLabel);
  const limitPrice = finitePositiveNumber(adapterRequest.limitPrice);

  return {
    ...(accountLabel ? { accountLabel } : {}),
    ...(limitPrice ? { limitPrice } : {}),
    action: "fill_order_form_only",
    adapterRequestId: adapterRequest.requestId,
    bridgeRequestId: buildBridgeRequestId(
      bridgeRequestId,
      adapterRequest.requestId,
    ),
    broker: "avanza",
    createdAt: now,
    finalHumanClickRequired: true,
    mode: adapterRequest.mode,
    orderType: adapterRequest.orderType,
    packageId: adapterRequest.packageId,
    quantity: adapterRequest.quantity,
    side: adapterRequest.side,
    symbol: adapterRequest.symbol,
    ticker: adapterRequest.ticker,
    userMustConfirm: true,
  };
}

function buildResponse({
  blockedReasons = [],
  bridgeEnabled = false,
  label,
  reason,
  request,
  status,
  warnings = [],
}: {
  blockedReasons?: string[];
  bridgeEnabled?: boolean;
  label: string;
  reason: string;
  request?: AvanzaLocalBridgeRequest;
  status: AvanzaLocalBridgeStatus;
  warnings?: string[];
}): AvanzaLocalBridgeResponse {
  const safetyFlags = buildSafetyFlags(bridgeEnabled);

  return {
    ...(request ? { request } : {}),
    ...safetyFlags,
    blockedReasons,
    label,
    reason,
    safetyFlags,
    status,
    warnings,
  };
}

function modeledStatusLabel(status: AvanzaLocalBridgeStatus) {
  const labels: Record<AvanzaLocalBridgeStatus, string> = {
    bridge_disabled: "Avanza local bridge disabled",
    bridge_unavailable: "Avanza local bridge unavailable",
    cancelled: "Avanza local bridge cancelled",
    dry_run_ready: "Avanza local bridge dry-run ready",
    fill_blocked: "Avanza local bridge fill blocked",
    fill_completed_waiting_manual_review:
      "Avanza local bridge fill completed waiting manual review",
    fill_failed: "Avanza local bridge fill failed",
    fill_only_ready: "Avanza local bridge fill-only ready",
    fill_started: "Avanza local bridge fill started",
    request_invalid: "Avanza local bridge request invalid",
    request_unavailable: "Avanza local bridge request unavailable",
    unknown: "Avanza local bridge unknown",
  };

  return labels[status];
}

export function buildAvanzaLocalBridgeRequest(
  input: BuildAvanzaLocalBridgeContractInput,
): AvanzaLocalBridgeResponse {
  return buildAvanzaLocalBridgeResponse(input);
}

export function buildAvanzaLocalBridgeResponse({
  adapterResponse,
  bridgeEnabled = false,
  bridgeRequestId,
  mode = "disabled",
  now = defaultNow,
  statusOverride,
}: BuildAvanzaLocalBridgeContractInput): AvanzaLocalBridgeResponse {
  if (!bridgeEnabled || mode === "disabled") {
    return buildResponse({
      blockedReasons: ["bridge disabled"],
      label: "Avanza local bridge disabled",
      reason:
        "The disabled local bridge contract is off by default. No bridge, localhost, browser, fill, review, confirmation, submit, order, or execution behavior is available.",
      status: "bridge_disabled",
    });
  }

  if (adapterResponse === undefined || adapterResponse === null) {
    return buildResponse({
      blockedReasons: ["adapter response unavailable"],
      bridgeEnabled,
      label: "Avanza local bridge request unavailable",
      reason:
        "No explicit Avanza fill-only adapter response was provided to the disabled local bridge contract.",
      status: "request_unavailable",
    });
  }

  if (!isAdapterResponse(adapterResponse)) {
    return buildResponse({
      blockedReasons: ["adapter response invalid"],
      bridgeEnabled,
      label: "Avanza local bridge request invalid",
      reason:
        "The explicit adapter response does not match the safe fill-only adapter response shape.",
      status: "request_invalid",
    });
  }

  if (mode !== "dry_run" && mode !== "fill_only") {
    return buildResponse({
      blockedReasons: ["bridge mode invalid"],
      bridgeEnabled,
      label: "Avanza local bridge request invalid",
      reason:
        "The disabled local bridge contract only accepts explicit dry_run or fill_only mode when enabled in model-only tests.",
      status: "request_invalid",
      warnings: adapterResponse.warnings,
    });
  }

  if (!isReadyAdapterResponseForMode(adapterResponse, mode)) {
    return buildResponse({
      blockedReasons:
        adapterResponse.blockedReasons.length > 0
          ? adapterResponse.blockedReasons
          : ["adapter response is not safe bridge input"],
      bridgeEnabled,
      label:
        mode === "fill_only"
          ? "Avanza local bridge fill blocked"
          : "Avanza local bridge request invalid",
      reason:
        mode === "fill_only"
          ? "The explicit adapter response is present but blocked or unsafe for a disabled local bridge fill-only request model."
          : "The explicit adapter response is not safe dry-run bridge input.",
      status: mode === "fill_only" ? "fill_blocked" : "request_invalid",
      warnings: adapterResponse.warnings,
    });
  }

  const request = buildRequestFromAdapterRequest({
    adapterRequest: adapterResponse.request,
    bridgeRequestId,
    now,
  });

  if (statusOverride) {
    return buildResponse({
      blockedReasons:
        statusOverride === "fill_started" ||
        statusOverride === "fill_completed_waiting_manual_review"
          ? []
          : [`modeled ${statusOverride}`],
      bridgeEnabled,
      label: modeledStatusLabel(statusOverride),
      reason:
        "This is a modeled disabled-local-bridge status only. No bridge call, localhost fetch, browser control, form fill, review click, confirmation, submit, order, credential handling, or Supabase write occurred.",
      request,
      status: statusOverride,
      warnings: adapterResponse.warnings,
    });
  }

  return buildResponse({
    bridgeEnabled,
    label:
      mode === "fill_only"
        ? "Avanza local bridge fill-only ready"
        : "Avanza local bridge dry-run ready",
    reason:
      mode === "fill_only"
        ? "A safe explicit adapter response produced a disabled local bridge fill-only request model. Final human confirmation remains mandatory and no bridge call or order behavior is available."
        : "A safe explicit adapter response produced a disabled local bridge dry-run request model. No bridge, localhost, browser, fill, or order behavior is available.",
    request,
    status: mode === "fill_only" ? "fill_only_ready" : "dry_run_ready",
    warnings: adapterResponse.warnings,
  });
}
