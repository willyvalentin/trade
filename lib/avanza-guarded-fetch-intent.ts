export type AvanzaGuardedFetchIntentStatus =
  | "fetch_intent_disabled"
  | "fetch_intent_hidden"
  | "fetch_intent_blocked"
  | "route_unavailable"
  | "route_disabled"
  | "internal_guard_missing"
  | "action_shell_unavailable"
  | "fetch_intent_ready_internal_disabled"
  | "fetch_intent_failed"
  | "unknown";

export type AvanzaGuardedFetchIntentMode =
  | "hidden"
  | "disabled"
  | "internal_preview"
  | "internal_fetch_intent";

export type AvanzaGuardedFetchIntentSafetyFlags = {
  canCallApiRoute: false;
  canCallBridge: false;
  canClickConfirm: false;
  canClickReview: false;
  canControlBrowser: false;
  canCreateFetchIntent: boolean;
  canFetch: false;
  canFetchLocalhost: false;
  canFillForm: false;
  canHandleCredentials: false;
  canReadBankId: false;
  canReadCookies: false;
  canSubmitOrder: false;
  canWriteSupabaseExecution: false;
  controlsEnabled: false;
  fetchIntentEnabled: boolean;
  finalHumanClickRequired: true;
  gateLocked: true;
  userMustConfirm: true;
};

export type AvanzaGuardedFetchIntent =
  AvanzaGuardedFetchIntentSafetyFlags & {
    accountLabel?: string;
    actionShellId?: string;
    apiCallIntentId?: string;
    blockedReasons: string[];
    createdAt: string;
    fetchIntentId?: string;
    label: string;
    limitPrice?: number;
    mode: AvanzaGuardedFetchIntentMode;
    orderType?: string;
    packageId?: string;
    quantity?: number;
    reason: string;
    routeStatus?: string;
    side?: "BUY" | "SELL";
    sourceRecommendationId?: string;
    status: AvanzaGuardedFetchIntentStatus;
    symbol?: string;
    ticker?: string;
    warnings: string[];
  };

export type BuildAvanzaGuardedFetchIntentInput = {
  actionShellModel?: unknown;
  apiCallIntent?: unknown;
  fetchIntentEnabled?: boolean;
  fetchIntentId?: string;
  handoffMetadata?: unknown;
  internalGuard?: unknown;
  mode?: AvanzaGuardedFetchIntentMode;
  now?: string;
  routeAvailability?: unknown;
};

type SafeFetchIntentMetadata = {
  accountLabel?: unknown;
  actionShellId?: unknown;
  apiCallIntentId?: unknown;
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

const readyActionShellStatuses = new Set([
  "action_shell_ready_internal_disabled",
]);

const passiveActionShellStatuses = new Set([
  "action_shell_hidden",
  "action_shell_disabled",
]);

const blockedActionShellStatuses = new Set([
  "action_shell_blocked",
  "action_shell_error",
  "unknown",
]);

const readyApiCallIntentStatuses = new Set([
  "api_call_ready_internal_disabled",
]);

const disabledApiCallIntentStatuses = new Set(["api_call_intent_disabled"]);

const blockedApiCallIntentStatuses = new Set([
  "api_call_blocked",
  "route_unavailable",
  "route_disabled",
  "visible_shell_unavailable",
  "unknown",
]);

const readyRouteStatuses = new Set([
  "route_available_internal_disabled",
  "route_ready_internal_disabled",
  "dry_run_ready_mock",
  "fill_only_ready_mock",
]);

const disabledRouteStatuses = new Set([
  "api_stub_disabled",
  "local_only_not_enabled",
  "route_disabled",
]);

const allowedInternalGuardStatuses = new Set([
  "internal_guard_allowed",
  "dev_only_allowed",
  "internal_fetch_intent_allowed",
]);

const failedStatuses = new Set([
  "fetch_intent_failed",
  "api_call_failed",
  "action_shell_error",
  "route_failed",
  "internal_guard_failed",
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

function safeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.flatMap((item) => {
      const text = safeText(item);

      return text ? [text] : [];
    })
    : [];
}

function finitePositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function normalizeSide(value: unknown): "BUY" | "SELL" | undefined {
  const side = safeText(value)?.toUpperCase();

  if (side === "BUY" || side === "SELL") return side;

  return undefined;
}

function statusOf(value: unknown) {
  if (!isRecord(value)) return undefined;

  return safeText(value.status);
}

function routeStatusOf(value: unknown) {
  if (value === undefined || value === null) return undefined;
  if (!isRecord(value)) return "unknown";

  return safeText(value.status) ?? safeText(value.routeStatus) ?? "unknown";
}

function inputHasFailedStatus(...values: unknown[]) {
  return values.some((value) => {
    const status = statusOf(value) ?? routeStatusOf(value);

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

function internalGuardAllows(value: unknown) {
  if (!isRecord(value)) return false;

  const status = safeText(value.status);

  return (
    value.internalGuardEnabled === true ||
    value.devOnlyGuardEnabled === true ||
    value.allowFetchIntent === true ||
    Boolean(status && allowedInternalGuardStatuses.has(status))
  );
}

function extractMetadata(
  ...sources: Array<Record<string, unknown> | undefined>
): SafeFetchIntentMetadata {
  const result: SafeFetchIntentMetadata = {};

  for (const source of sources) {
    if (!source) continue;

    const candidate = isRecord(source.package) ? source.package : source;

    result.accountLabel ??= candidate.accountLabel;
    result.actionShellId ??= candidate.actionShellId;
    result.apiCallIntentId ??= candidate.apiCallIntentId;
    result.blockedReasons ??= candidate.blockedReasons;
    result.limitPrice ??= candidate.limitPrice;
    result.orderType ??= candidate.orderType;
    result.packageId ??= candidate.packageId;
    result.quantity ??= candidate.quantity;
    result.side ??= candidate.side;
    result.sourceRecommendationId ??= candidate.sourceRecommendationId;
    result.symbol ??= candidate.symbol;
    result.ticker ??= candidate.ticker;
    result.warnings ??= candidate.warnings;
  }

  return result;
}

function validateMetadata(metadata: SafeFetchIntentMetadata) {
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

function statusLabel(status: AvanzaGuardedFetchIntentStatus) {
  const labels: Record<AvanzaGuardedFetchIntentStatus, string> = {
    action_shell_unavailable: "Guarded fetch intent action shell unavailable",
    fetch_intent_blocked: "Guarded fetch intent blocked",
    fetch_intent_disabled: "Guarded fetch intent disabled",
    fetch_intent_failed: "Guarded fetch intent failed",
    fetch_intent_hidden: "Guarded fetch intent hidden",
    fetch_intent_ready_internal_disabled:
      "Guarded fetch intent ready internally disabled",
    internal_guard_missing: "Guarded fetch intent internal guard missing",
    route_disabled: "Guarded fetch intent route disabled",
    route_unavailable: "Guarded fetch intent route unavailable",
    unknown: "Guarded fetch intent unknown",
  };

  return labels[status];
}

function buildSafetyFlags({
  canCreateFetchIntent,
  fetchIntentEnabled,
}: {
  canCreateFetchIntent: boolean;
  fetchIntentEnabled: boolean;
}): AvanzaGuardedFetchIntentSafetyFlags {
  return {
    canCallApiRoute: false,
    canCallBridge: false,
    canClickConfirm: false,
    canClickReview: false,
    canControlBrowser: false,
    canCreateFetchIntent,
    canFetch: false,
    canFetchLocalhost: false,
    canFillForm: false,
    canHandleCredentials: false,
    canReadBankId: false,
    canReadCookies: false,
    canSubmitOrder: false,
    canWriteSupabaseExecution: false,
    controlsEnabled: false,
    fetchIntentEnabled,
    finalHumanClickRequired: true,
    gateLocked: true,
    userMustConfirm: true,
  };
}

function buildIntent({
  blockedReasons = [],
  canCreateFetchIntent = false,
  fetchIntentEnabled,
  fetchIntentId,
  metadata,
  mode,
  now,
  reason,
  routeStatus,
  status,
  warnings = [],
}: {
  blockedReasons?: string[];
  canCreateFetchIntent?: boolean;
  fetchIntentEnabled: boolean;
  fetchIntentId?: string;
  metadata?: SafeFetchIntentMetadata;
  mode: AvanzaGuardedFetchIntentMode;
  now: string;
  reason: string;
  routeStatus?: string;
  status: AvanzaGuardedFetchIntentStatus;
  warnings?: string[];
}): AvanzaGuardedFetchIntent {
  const accountLabel = safeText(metadata?.accountLabel);
  const actionShellId = safeText(metadata?.actionShellId);
  const apiCallIntentId = safeText(metadata?.apiCallIntentId);
  const limitPrice = finitePositiveNumber(metadata?.limitPrice);
  const orderType = safeText(metadata?.orderType);
  const packageId = safeText(metadata?.packageId);
  const quantity = finitePositiveNumber(metadata?.quantity);
  const safeFetchIntentId = safeText(fetchIntentId);
  const side = normalizeSide(metadata?.side);
  const sourceRecommendationId = safeText(metadata?.sourceRecommendationId);
  const ticker = safeText(metadata?.ticker);
  const symbol = safeText(metadata?.symbol) ?? ticker;

  return {
    ...(accountLabel ? { accountLabel } : {}),
    ...(actionShellId ? { actionShellId } : {}),
    ...(apiCallIntentId ? { apiCallIntentId } : {}),
    ...(limitPrice ? { limitPrice } : {}),
    ...(orderType ? { orderType } : {}),
    ...(packageId ? { packageId } : {}),
    ...(quantity ? { quantity } : {}),
    ...(routeStatus ? { routeStatus } : {}),
    ...(safeFetchIntentId ? { fetchIntentId: safeFetchIntentId } : {}),
    ...(side ? { side } : {}),
    ...(sourceRecommendationId ? { sourceRecommendationId } : {}),
    ...(symbol ? { symbol } : {}),
    ...(ticker ? { ticker } : {}),
    ...buildSafetyFlags({ canCreateFetchIntent, fetchIntentEnabled }),
    blockedReasons,
    createdAt: now,
    label: statusLabel(status),
    mode,
    reason,
    status,
    warnings,
  };
}

export function buildAvanzaGuardedFetchIntent({
  actionShellModel,
  apiCallIntent,
  fetchIntentEnabled = false,
  fetchIntentId,
  handoffMetadata,
  internalGuard,
  mode = "disabled",
  now = "not_provided",
  routeAvailability,
}: BuildAvanzaGuardedFetchIntentInput = {}): AvanzaGuardedFetchIntent {
  if (mode === "hidden") {
    return buildIntent({
      blockedReasons: ["fetch intent hidden"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "Guarded fetch intent is hidden. No fetch, API route call, route path, localhost call, bridge call, browser control, fill, review, confirmation, submit, order, sensitive-data handling, or persistence is available.",
      status: "fetch_intent_hidden",
    });
  }

  if (!fetchIntentEnabled || mode === "disabled") {
    return buildIntent({
      blockedReasons: ["fetch intent disabled"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "Guarded fetch intent is disabled by default. No fetch, API route call, route path, localhost call, bridge call, browser control, fill, review, confirmation, submit, order, sensitive-data handling, or persistence is available.",
      status: "fetch_intent_disabled",
    });
  }

  if (inputHasFailedStatus(actionShellModel, apiCallIntent, routeAvailability, internalGuard)) {
    return buildIntent({
      blockedReasons: ["explicit failed input"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "An explicit failed action shell, API call intent, route availability, or internal guard was provided, so fetch intent metadata is failed without side effects.",
      status: "fetch_intent_failed",
    });
  }

  if (!isRecord(actionShellModel)) {
    return buildIntent({
      blockedReasons: ["action shell unavailable"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "No explicit disabled action shell model was provided, so guarded fetch intent metadata is unavailable.",
      status: "action_shell_unavailable",
    });
  }

  const actionShellStatus = statusOf(actionShellModel);

  if (!actionShellStatus) {
    return buildIntent({
      blockedReasons: ["action shell status unavailable"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "The explicit action shell model has no safe status, so guarded fetch intent metadata is unavailable.",
      status: "action_shell_unavailable",
    });
  }

  if (blockedActionShellStatuses.has(actionShellStatus)) {
    return buildIntent({
      blockedReasons:
        safeStringArray(actionShellModel.blockedReasons).length > 0
          ? safeStringArray(actionShellModel.blockedReasons)
          : ["action shell blocked"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "The explicit action shell model is blocked, failed, or unknown, so guarded fetch intent metadata remains blocked.",
      status: actionShellStatus === "action_shell_error"
        ? "fetch_intent_failed"
        : "fetch_intent_blocked",
      warnings: safeStringArray(actionShellModel.warnings),
    });
  }

  if (
    !readyActionShellStatuses.has(actionShellStatus) &&
    !passiveActionShellStatuses.has(actionShellStatus)
  ) {
    return buildIntent({
      blockedReasons: ["action shell status not safe"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "The action shell status could not be classified as safe disabled metadata.",
      status: "action_shell_unavailable",
      warnings: safeStringArray(actionShellModel.warnings),
    });
  }

  if (!readyActionShellStatuses.has(actionShellStatus)) {
    return buildIntent({
      blockedReasons: ["action shell not ready for internal disabled intent"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "The action shell is hidden or disabled, so no guarded fetch intent can be created.",
      status: "action_shell_unavailable",
      warnings: safeStringArray(actionShellModel.warnings),
    });
  }

  const explicitRouteStatus = routeStatusOf(routeAvailability);

  if (!explicitRouteStatus) {
    return buildIntent({
      blockedReasons: ["route availability unavailable"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "No explicit route availability metadata was provided, so guarded fetch intent metadata is unavailable.",
      status: "route_unavailable",
      warnings: safeStringArray(actionShellModel.warnings),
    });
  }

  if (disabledRouteStatuses.has(explicitRouteStatus)) {
    return buildIntent({
      blockedReasons: ["route disabled"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "The explicit route availability is disabled, so guarded fetch intent remains disabled metadata only.",
      routeStatus: explicitRouteStatus,
      status: "route_disabled",
      warnings: safeStringArray(actionShellModel.warnings),
    });
  }

  if (!readyRouteStatuses.has(explicitRouteStatus)) {
    return buildIntent({
      blockedReasons: ["route availability not ready"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "The explicit route availability is unavailable, failed, blocked, or unknown, so guarded fetch intent is blocked.",
      routeStatus: explicitRouteStatus,
      status: explicitRouteStatus === "unknown" ? "unknown" : "route_unavailable",
      warnings: safeStringArray(actionShellModel.warnings),
    });
  }

  if (!internalGuardAllows(internalGuard)) {
    return buildIntent({
      blockedReasons: ["internal guard missing"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "No explicit internal/dev-only guard allowed guarded fetch intent metadata.",
      routeStatus: explicitRouteStatus,
      status: "internal_guard_missing",
      warnings: safeStringArray(actionShellModel.warnings),
    });
  }

  if (inputHasUnsafeSafetyFlag(actionShellModel, apiCallIntent, routeAvailability, internalGuard)) {
    return buildIntent({
      blockedReasons: ["unsafe safety flag present"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "One or more explicit inputs contains an unsafe safety flag, so guarded fetch intent is blocked.",
      routeStatus: explicitRouteStatus,
      status: "fetch_intent_blocked",
      warnings: safeStringArray(actionShellModel.warnings),
    });
  }

  if (!isRecord(apiCallIntent)) {
    return buildIntent({
      blockedReasons: ["API call intent unavailable"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "No explicit guarded API route call intent model was provided, so guarded fetch intent is blocked.",
      routeStatus: explicitRouteStatus,
      status: "fetch_intent_blocked",
      warnings: safeStringArray(actionShellModel.warnings),
    });
  }

  const apiCallIntentStatus = statusOf(apiCallIntent);

  if (apiCallIntentStatus && disabledApiCallIntentStatuses.has(apiCallIntentStatus)) {
    return buildIntent({
      blockedReasons: ["API call intent disabled"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "The explicit API call intent is disabled, so guarded fetch intent remains disabled metadata.",
      routeStatus: explicitRouteStatus,
      status: "fetch_intent_disabled",
      warnings: safeStringArray(apiCallIntent.warnings),
    });
  }

  if (apiCallIntentStatus && blockedApiCallIntentStatuses.has(apiCallIntentStatus)) {
    return buildIntent({
      blockedReasons:
        safeStringArray(apiCallIntent.blockedReasons).length > 0
          ? safeStringArray(apiCallIntent.blockedReasons)
          : ["API call intent blocked"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "The explicit API call intent is blocked, unavailable, disabled, or unknown, so guarded fetch intent is blocked.",
      routeStatus: explicitRouteStatus,
      status: "fetch_intent_blocked",
      warnings: safeStringArray(apiCallIntent.warnings),
    });
  }

  if (!apiCallIntentStatus || !readyApiCallIntentStatuses.has(apiCallIntentStatus)) {
    return buildIntent({
      blockedReasons: ["API call intent status not ready"],
      fetchIntentEnabled,
      fetchIntentId,
      mode,
      now,
      reason:
        "The explicit API call intent status could not be classified as safe internal disabled metadata.",
      routeStatus: explicitRouteStatus,
      status: "fetch_intent_blocked",
      warnings: safeStringArray(apiCallIntent.warnings),
    });
  }

  const metadata = extractMetadata(
    isRecord(handoffMetadata) ? handoffMetadata : undefined,
    apiCallIntent,
    actionShellModel,
  );
  const validationBlockers = validateMetadata(metadata);

  if (validationBlockers.length > 0) {
    return buildIntent({
      blockedReasons: validationBlockers,
      fetchIntentEnabled,
      fetchIntentId,
      metadata,
      mode,
      now,
      reason:
        "Explicit metadata is missing safe fields required for guarded fetch intent metadata.",
      routeStatus: explicitRouteStatus,
      status: "fetch_intent_blocked",
      warnings: safeStringArray(metadata.warnings),
    });
  }

  if (mode === "internal_preview" || mode === "internal_fetch_intent") {
    return buildIntent({
      canCreateFetchIntent: true,
      fetchIntentEnabled,
      fetchIntentId,
      metadata,
      mode,
      now,
      reason:
        "All explicit inputs are safe enough to describe a guarded internal fetch intent as disabled metadata only. It still cannot fetch, call the route, expose a route path, call localhost, call bridge, control a browser, fill, review, confirm, submit, or place an order.",
      routeStatus: explicitRouteStatus,
      status: "fetch_intent_ready_internal_disabled",
      warnings: safeStringArray(metadata.warnings),
    });
  }

  return buildIntent({
    blockedReasons: ["unknown guarded fetch intent mode"],
    fetchIntentEnabled,
    fetchIntentId,
    mode,
    now,
    reason: "The guarded fetch intent mode is unknown.",
    routeStatus: explicitRouteStatus,
    status: "unknown",
  });
}
