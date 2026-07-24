export type AvanzaGuardedApiRouteCallIntentStatus =
  | "api_call_intent_disabled"
  | "route_unavailable"
  | "route_disabled"
  | "visible_shell_unavailable"
  | "api_call_ready_internal_disabled"
  | "api_call_blocked"
  | "api_call_failed"
  | "unknown";

export type AvanzaGuardedApiRouteCallIntentMode =
  | "disabled"
  | "internal_preview"
  | "internal_call_intent";

export type AvanzaGuardedApiRouteCallIntentSafetyFlags = {
  apiCallIntentEnabled: boolean;
  canCallApiRoute: false;
  canCallBridge: false;
  canClickConfirm: false;
  canClickReview: false;
  canControlBrowser: false;
  canCreateApiCallIntent: boolean;
  canFetch: false;
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

export type AvanzaGuardedApiRouteCallIntent =
  AvanzaGuardedApiRouteCallIntentSafetyFlags & {
    accountLabel?: string;
    apiCallIntentId?: string;
    blockedReasons: string[];
    createdAt: string;
    label: string;
    limitPrice?: number;
    mode: AvanzaGuardedApiRouteCallIntentMode;
    orderType?: string;
    packageId?: string;
    quantity?: number;
    reason: string;
    routeStatus?: string;
    side?: "BUY" | "SELL";
    sourceRecommendationId?: string;
    status: AvanzaGuardedApiRouteCallIntentStatus;
    symbol?: string;
    ticker?: string;
    warnings: string[];
  };

export type BuildAvanzaGuardedApiRouteCallIntentInput = {
  apiCallIntentEnabled?: boolean;
  apiCallIntentId?: string;
  apiRouteState?: unknown;
  handoffMetadata?: unknown;
  mode?: AvanzaGuardedApiRouteCallIntentMode;
  now?: string;
  prepareIntentModel?: unknown;
  visibleShellModel?: unknown;
};

type SafeIntentMetadata = {
  accountLabel?: unknown;
  blockedReasons?: unknown;
  limitPrice?: unknown;
  orderType?: unknown;
  packageId?: unknown;
  quantity?: unknown;
  side?: unknown;
  sourceRecommendationId?: unknown;
  symbol?: unknown;
  ticker?: unknown;
  warnings?: unknown;
};

const readyVisibleShellStatuses = new Set([
  "visible_shell_ready_internal_disabled",
  "visible_shell_disabled",
  "visible_shell_hidden",
]);

const blockedVisibleShellStatuses = new Set([
  "visible_shell_blocked",
  "visible_shell_error",
]);

const readyPrepareIntentStatuses = new Set(["prepare_ready_internal"]);

const blockedPrepareIntentStatuses = new Set([
  "package_blocked",
  "prepare_blocked",
  "package_unavailable",
  "unknown",
]);

const failedStatuses = new Set([
  "api_call_failed",
  "fill_failed",
  "prepare_failed",
  "visible_shell_error",
]);

const readyRouteStatuses = new Set([
  "dry_run_ready_mock",
  "fill_only_ready_mock",
]);

const disabledRouteStatuses = new Set([
  "api_stub_disabled",
  "local_only_not_enabled",
]);

const unsafeTextPattern =
  /account\s*id|accountid|bankid|broker\s*secret|cookie|credential|secret|session|storage|token/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function safeText(value: unknown) {
  const text = nonEmptyString(value);

  if (!text) return undefined;
  if (unsafeTextPattern.test(text) || /\d{5,}/.test(text)) return undefined;

  return text;
}

function finitePositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function safeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.flatMap((item) => {
      const text = safeText(item);

      return text ? [text] : [];
    })
    : [];
}

function normalizeSide(value: unknown): "BUY" | "SELL" | undefined {
  const side = safeText(value)?.toUpperCase();

  if (side === "BUY" || side === "SELL") return side;

  return undefined;
}

function statusLabel(status: AvanzaGuardedApiRouteCallIntentStatus) {
  const labels: Record<AvanzaGuardedApiRouteCallIntentStatus, string> = {
    api_call_blocked: "Guarded API route call intent blocked",
    api_call_failed: "Guarded API route call intent failed",
    api_call_intent_disabled: "Guarded API route call intent disabled",
    api_call_ready_internal_disabled:
      "Guarded API route call intent ready internally disabled",
    route_disabled: "Guarded API route call intent route disabled",
    route_unavailable: "Guarded API route call intent route unavailable",
    unknown: "Guarded API route call intent unknown",
    visible_shell_unavailable:
      "Guarded API route call intent visible shell unavailable",
  };

  return labels[status];
}

function buildSafetyFlags({
  apiCallIntentEnabled,
  canCreateApiCallIntent,
}: {
  apiCallIntentEnabled: boolean;
  canCreateApiCallIntent: boolean;
}): AvanzaGuardedApiRouteCallIntentSafetyFlags {
  return {
    apiCallIntentEnabled,
    canCallApiRoute: false,
    canCallBridge: false,
    canClickConfirm: false,
    canClickReview: false,
    canControlBrowser: false,
    canCreateApiCallIntent,
    canFetch: false,
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

function extractMetadata(
  ...sources: Array<Record<string, unknown> | undefined>
): SafeIntentMetadata {
  for (const source of sources) {
    if (!source) continue;

    return isRecord(source.package) ? source.package : source;
  }

  return {};
}

function routeStatus(apiRouteState: unknown) {
  if (apiRouteState === undefined || apiRouteState === null) {
    return undefined;
  }

  if (!isRecord(apiRouteState)) {
    return "unknown";
  }

  return safeText(apiRouteState.status) ?? "unknown";
}

function inputHasFailedStatus(...values: unknown[]) {
  return values.some((value) => {
    if (!isRecord(value)) return false;

    const status = safeText(value.status);

    return Boolean(status && failedStatuses.has(status));
  });
}

function inputHasUnsafeSafetyFlag(...values: unknown[]) {
  return values.some((value) => {
    if (!isRecord(value)) return false;

    return (
      value.canCallApiRoute === true ||
      value.canCallBridge === true ||
      value.canFetch === true ||
      value.canFetchLocalhost === true ||
      value.canControlBrowser === true ||
      value.canFillForm === true ||
      value.canClickReview === true ||
      value.canClickConfirm === true ||
      value.canSubmitOrder === true ||
      value.canHandleCredentials === true ||
      value.canReadCookies === true ||
      value.canReadBankId === true ||
      value.canWriteSupabaseExecution === true ||
      value.controlsEnabled === true ||
      value.gateLocked === false ||
      value.userMustConfirm === false ||
      value.finalHumanClickRequired === false
    );
  });
}

function validateMetadata(metadata: SafeIntentMetadata) {
  const blockedReasons: string[] = [];
  const orderType = safeText(metadata.orderType)?.toUpperCase();

  if (!safeText(metadata.packageId)) blockedReasons.push("missing packageId");
  if (!safeText(metadata.ticker)) blockedReasons.push("missing ticker");
  if (!normalizeSide(metadata.side)) {
    blockedReasons.push("missing or invalid side");
  }
  if (!finitePositiveNumber(metadata.quantity)) {
    blockedReasons.push("invalid quantity");
  }
  if (!orderType) blockedReasons.push("missing orderType");
  if (orderType && orderType !== "MARKET" && !finitePositiveNumber(metadata.limitPrice)) {
    blockedReasons.push("invalid or unsafe price");
  }
  if (safeStringArray(metadata.blockedReasons).length > 0) {
    blockedReasons.push("metadata has blocked reasons");
  }

  return blockedReasons;
}

function buildIntent({
  apiCallIntentEnabled,
  apiCallIntentId,
  blockedReasons = [],
  canCreateApiCallIntent = false,
  metadata,
  mode,
  now,
  reason,
  routeStatus,
  status,
  warnings = [],
}: {
  apiCallIntentEnabled: boolean;
  apiCallIntentId?: string;
  blockedReasons?: string[];
  canCreateApiCallIntent?: boolean;
  metadata?: SafeIntentMetadata;
  mode: AvanzaGuardedApiRouteCallIntentMode;
  now: string;
  reason: string;
  routeStatus?: string;
  status: AvanzaGuardedApiRouteCallIntentStatus;
  warnings?: string[];
}): AvanzaGuardedApiRouteCallIntent {
  const safeApiCallIntentId = safeText(apiCallIntentId);
  const accountLabel = safeText(metadata?.accountLabel);
  const limitPrice = finitePositiveNumber(metadata?.limitPrice);
  const orderType = safeText(metadata?.orderType);
  const packageId = safeText(metadata?.packageId);
  const quantity = finitePositiveNumber(metadata?.quantity);
  const side = normalizeSide(metadata?.side);
  const sourceRecommendationId = safeText(metadata?.sourceRecommendationId);
  const ticker = safeText(metadata?.ticker);
  const symbol = safeText(metadata?.symbol) ?? ticker;

  return {
    ...(accountLabel ? { accountLabel } : {}),
    ...(limitPrice ? { limitPrice } : {}),
    ...(orderType ? { orderType } : {}),
    ...(packageId ? { packageId } : {}),
    ...(quantity ? { quantity } : {}),
    ...(safeApiCallIntentId ? { apiCallIntentId: safeApiCallIntentId } : {}),
    ...(routeStatus ? { routeStatus } : {}),
    ...(side ? { side } : {}),
    ...(sourceRecommendationId ? { sourceRecommendationId } : {}),
    ...(symbol ? { symbol } : {}),
    ...(ticker ? { ticker } : {}),
    ...buildSafetyFlags({ apiCallIntentEnabled, canCreateApiCallIntent }),
    blockedReasons,
    createdAt: now,
    label: statusLabel(status),
    mode,
    reason,
    status,
    warnings,
  };
}

export function buildAvanzaGuardedApiRouteCallIntent({
  apiCallIntentEnabled = false,
  apiCallIntentId,
  apiRouteState,
  handoffMetadata,
  mode = "disabled",
  now = "not_provided",
  prepareIntentModel,
  visibleShellModel,
}: BuildAvanzaGuardedApiRouteCallIntentInput = {}): AvanzaGuardedApiRouteCallIntent {
  if (!apiCallIntentEnabled || mode === "disabled") {
    return buildIntent({
      apiCallIntentEnabled,
      apiCallIntentId,
      blockedReasons: ["api call intent disabled"],
      mode,
      now,
      reason:
        "Guarded API route call intent is disabled by default. No route call, fetch, localhost call, bridge call, browser control, fill, review, confirmation, submit, order, sensitive-data handling, or persistence is available.",
      status: "api_call_intent_disabled",
    });
  }

  if (inputHasFailedStatus(visibleShellModel, prepareIntentModel, apiRouteState)) {
    return buildIntent({
      apiCallIntentEnabled,
      apiCallIntentId,
      blockedReasons: ["explicit failed input"],
      mode,
      now,
      reason:
        "An explicit failed visible shell, prepare intent, or route state was provided, so the API route call intent is failed without side effects.",
      status: "api_call_failed",
    });
  }

  if (!isRecord(visibleShellModel)) {
    return buildIntent({
      apiCallIntentEnabled,
      apiCallIntentId,
      blockedReasons: ["visible shell unavailable"],
      mode,
      now,
      reason:
        "No explicit visible shell model was provided, so no API route call intent metadata can be created.",
      status: "visible_shell_unavailable",
    });
  }

  const visibleShellStatus = safeText(visibleShellModel.status);

  if (!visibleShellStatus) {
    return buildIntent({
      apiCallIntentEnabled,
      apiCallIntentId,
      blockedReasons: ["visible shell status unavailable"],
      mode,
      now,
      reason:
        "The explicit visible shell model has no safe status, so API route call intent metadata is unavailable.",
      status: "visible_shell_unavailable",
    });
  }

  if (blockedVisibleShellStatuses.has(visibleShellStatus)) {
    return buildIntent({
      apiCallIntentEnabled,
      apiCallIntentId,
      blockedReasons:
        safeStringArray(visibleShellModel.blockedReasons).length > 0
          ? safeStringArray(visibleShellModel.blockedReasons)
          : ["visible shell blocked"],
      mode,
      now,
      reason:
        "The explicit visible shell model is blocked or errored, so API route call intent metadata remains blocked.",
      status: "api_call_blocked",
      warnings: safeStringArray(visibleShellModel.warnings),
    });
  }

  if (!readyVisibleShellStatuses.has(visibleShellStatus)) {
    return buildIntent({
      apiCallIntentEnabled,
      apiCallIntentId,
      blockedReasons: ["visible shell status not safe"],
      mode,
      now,
      reason:
        "The visible shell status could not be classified as safe internal disabled metadata.",
      status: "visible_shell_unavailable",
      warnings: safeStringArray(visibleShellModel.warnings),
    });
  }

  const explicitRouteStatus = routeStatus(apiRouteState);

  if (!explicitRouteStatus) {
    return buildIntent({
      apiCallIntentEnabled,
      apiCallIntentId,
      blockedReasons: ["route state unavailable"],
      mode,
      now,
      reason:
        "No explicit disabled local-only API route state was provided, so route call intent metadata is unavailable.",
      status: "route_unavailable",
      warnings: safeStringArray(visibleShellModel.warnings),
    });
  }

  if (disabledRouteStatuses.has(explicitRouteStatus)) {
    return buildIntent({
      apiCallIntentEnabled,
      apiCallIntentId,
      blockedReasons: ["api route disabled"],
      mode,
      now,
      reason:
        "The explicit API route state is disabled, so API route call intent remains disabled metadata only.",
      routeStatus: explicitRouteStatus,
      status: "route_disabled",
      warnings: safeStringArray(visibleShellModel.warnings),
    });
  }

  if (!readyRouteStatuses.has(explicitRouteStatus)) {
    return buildIntent({
      apiCallIntentEnabled,
      apiCallIntentId,
      blockedReasons: ["route state not ready"],
      mode,
      now,
      reason:
        "The explicit API route state is unavailable, blocked, failed, or unknown, so API route call intent is blocked.",
      routeStatus: explicitRouteStatus,
      status: explicitRouteStatus === "unknown" ? "unknown" : "api_call_blocked",
      warnings: safeStringArray(visibleShellModel.warnings),
    });
  }

  if (inputHasUnsafeSafetyFlag(visibleShellModel, prepareIntentModel, apiRouteState)) {
    return buildIntent({
      apiCallIntentEnabled,
      apiCallIntentId,
      blockedReasons: ["unsafe safety flag present"],
      mode,
      now,
      reason:
        "One or more explicit inputs contains an unsafe safety flag, so API route call intent is blocked.",
      routeStatus: explicitRouteStatus,
      status: "api_call_blocked",
      warnings: safeStringArray(visibleShellModel.warnings),
    });
  }

  if (isRecord(prepareIntentModel)) {
    const prepareStatus = safeText(prepareIntentModel.status);

    if (prepareStatus && blockedPrepareIntentStatuses.has(prepareStatus)) {
      return buildIntent({
        apiCallIntentEnabled,
        apiCallIntentId,
        blockedReasons:
          safeStringArray(prepareIntentModel.blockedReasons).length > 0
            ? safeStringArray(prepareIntentModel.blockedReasons)
            : ["prepare intent blocked"],
        mode,
        now,
        reason:
          "The explicit prepare intent model is blocked or unavailable, so API route call intent remains blocked.",
        routeStatus: explicitRouteStatus,
        status: "api_call_blocked",
        warnings: safeStringArray(prepareIntentModel.warnings),
      });
    }

    if (prepareStatus && !readyPrepareIntentStatuses.has(prepareStatus)) {
      return buildIntent({
        apiCallIntentEnabled,
        apiCallIntentId,
        blockedReasons: ["prepare intent status not ready"],
        mode,
        now,
        reason:
          "The explicit prepare intent model could not be classified as safe internal metadata.",
        routeStatus: explicitRouteStatus,
        status: "api_call_blocked",
        warnings: safeStringArray(prepareIntentModel.warnings),
      });
    }
  }

  const metadata = extractMetadata(
    isRecord(handoffMetadata) ? handoffMetadata : undefined,
    isRecord(prepareIntentModel) ? prepareIntentModel : undefined,
    visibleShellModel,
  );
  const validationBlockers = validateMetadata(metadata);

  if (validationBlockers.length > 0) {
    return buildIntent({
      apiCallIntentEnabled,
      apiCallIntentId,
      blockedReasons: validationBlockers,
      metadata,
      mode,
      now,
      reason:
        "Explicit metadata is missing safe fields required for API route call intent metadata.",
      routeStatus: explicitRouteStatus,
      status: "api_call_blocked",
      warnings: safeStringArray(metadata.warnings),
    });
  }

  if (mode === "internal_preview" || mode === "internal_call_intent") {
    return buildIntent({
      apiCallIntentEnabled,
      apiCallIntentId,
      canCreateApiCallIntent: true,
      metadata,
      mode,
      now,
      reason:
        "All explicit inputs are safe enough to describe a guarded internal API route call intent as disabled metadata only. It still cannot call the route, fetch, call localhost, call bridge, control a browser, fill, review, confirm, submit, or place an order.",
      routeStatus: explicitRouteStatus,
      status: "api_call_ready_internal_disabled",
      warnings: safeStringArray(metadata.warnings),
    });
  }

  return buildIntent({
    apiCallIntentEnabled,
    apiCallIntentId,
    blockedReasons: ["unknown API route call intent mode"],
    mode,
    now,
    reason: "The API route call intent mode is unknown.",
    routeStatus: explicitRouteStatus,
    status: "unknown",
  });
}
