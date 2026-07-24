export type AvanzaDisabledLocalOnlyManualTestPathStatus =
  | "manual_test_path_disabled"
  | "manual_test_path_hidden"
  | "manual_test_path_blocked"
  | "route_unavailable"
  | "route_disabled"
  | "fetch_intent_unavailable"
  | "internal_guard_missing"
  | "local_only_guard_missing"
  | "manual_test_path_ready_internal_disabled"
  | "manual_test_path_failed"
  | "unknown";

export type AvanzaDisabledLocalOnlyManualTestPathMode =
  | "hidden"
  | "disabled"
  | "internal_preview"
  | "internal_manual_test_path";

export type AvanzaDisabledLocalOnlyManualTestPathSafetyFlags = {
  canCallApiRoute: false;
  canCallBridge: false;
  canClickConfirm: false;
  canClickReview: false;
  canControlBrowser: false;
  canCreateManualTestPath: boolean;
  canExposeLocalRoute: false;
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
  manualTestPathEnabled: boolean;
  userMustConfirm: true;
};

export type AvanzaDisabledLocalOnlyManualTestPath =
  AvanzaDisabledLocalOnlyManualTestPathSafetyFlags & {
    accountLabel?: string;
    actionShellId?: string;
    apiCallIntentId?: string;
    blockedReasons: string[];
    createdAt: string;
    fetchIntentId?: string;
    internalGuardStatus?: string;
    label: string;
    limitPrice?: number;
    localOnlyGuardStatus?: string;
    manualTestPathId?: string;
    mode: AvanzaDisabledLocalOnlyManualTestPathMode;
    orderType?: string;
    packageId?: string;
    quantity?: number;
    reason: string;
    routeStatus?: string;
    side?: "BUY" | "SELL";
    sourceRecommendationId?: string;
    status: AvanzaDisabledLocalOnlyManualTestPathStatus;
    symbol?: string;
    ticker?: string;
    warnings: string[];
  };

export type BuildAvanzaDisabledLocalOnlyManualTestPathInput = {
  actionShellModel?: unknown;
  apiCallIntent?: unknown;
  fetchIntent?: unknown;
  handoffMetadata?: unknown;
  internalGuard?: unknown;
  localOnlyGuard?: unknown;
  manualTestPathEnabled?: boolean;
  manualTestPathId?: string;
  mode?: AvanzaDisabledLocalOnlyManualTestPathMode;
  now?: string;
  routeState?: unknown;
};

type SafeManualTestPathMetadata = {
  accountLabel?: unknown;
  actionShellId?: unknown;
  apiCallIntentId?: unknown;
  blockedReasons?: unknown;
  fetchIntentId?: unknown;
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

const readyFetchIntentStatuses = new Set([
  "fetch_intent_ready_internal_disabled",
]);

const unavailableFetchIntentStatuses = new Set([
  "fetch_intent_disabled",
  "fetch_intent_hidden",
  "action_shell_unavailable",
]);

const blockedFetchIntentStatuses = new Set([
  "fetch_intent_blocked",
  "route_unavailable",
  "route_disabled",
  "internal_guard_missing",
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
  "internal_manual_test_path_allowed",
]);

const allowedLocalOnlyGuardStatuses = new Set([
  "local_only_guard_allowed",
  "local_only_allowed",
  "local_dev_only_allowed",
]);

const failedStatuses = new Set([
  "manual_test_path_failed",
  "fetch_intent_failed",
  "route_failed",
  "api_call_failed",
  "action_shell_error",
  "internal_guard_failed",
  "local_only_guard_failed",
  "fill_failed",
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
      value.canExposeLocalRoute === true ||
      value.controlsEnabled === true ||
      value.gateLocked === false ||
      value.userMustConfirm === false ||
      value.finalHumanClickRequired === false
    );
  });
}

function guardAllows(
  value: unknown,
  allowedStatuses: Set<string>,
  booleanKeys: string[],
) {
  if (!isRecord(value)) return false;

  const status = safeText(value.status);

  return (
    booleanKeys.some((key) => value[key] === true) ||
    Boolean(status && allowedStatuses.has(status))
  );
}

function extractMetadata(
  ...sources: Array<Record<string, unknown> | undefined>
): SafeManualTestPathMetadata {
  const result: SafeManualTestPathMetadata = {};

  for (const source of sources) {
    if (!source) continue;

    const candidate = isRecord(source.package) ? source.package : source;

    result.accountLabel ??= candidate.accountLabel;
    result.actionShellId ??= candidate.actionShellId;
    result.apiCallIntentId ??= candidate.apiCallIntentId;
    result.blockedReasons ??= candidate.blockedReasons;
    result.fetchIntentId ??= candidate.fetchIntentId;
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

function validateMetadata(metadata: SafeManualTestPathMetadata) {
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

function statusLabel(status: AvanzaDisabledLocalOnlyManualTestPathStatus) {
  const labels: Record<AvanzaDisabledLocalOnlyManualTestPathStatus, string> = {
    fetch_intent_unavailable:
      "Disabled local-only manual test path fetch intent unavailable",
    internal_guard_missing:
      "Disabled local-only manual test path internal guard missing",
    local_only_guard_missing:
      "Disabled local-only manual test path local-only guard missing",
    manual_test_path_blocked:
      "Disabled local-only manual test path blocked",
    manual_test_path_disabled:
      "Disabled local-only manual test path disabled",
    manual_test_path_failed:
      "Disabled local-only manual test path failed",
    manual_test_path_hidden:
      "Disabled local-only manual test path hidden",
    manual_test_path_ready_internal_disabled:
      "Disabled local-only manual test path ready internally disabled",
    route_disabled: "Disabled local-only manual test path route disabled",
    route_unavailable: "Disabled local-only manual test path route unavailable",
    unknown: "Disabled local-only manual test path unknown",
  };

  return labels[status];
}

function buildSafetyFlags({
  canCreateManualTestPath,
  manualTestPathEnabled,
}: {
  canCreateManualTestPath: boolean;
  manualTestPathEnabled: boolean;
}): AvanzaDisabledLocalOnlyManualTestPathSafetyFlags {
  return {
    canCallApiRoute: false,
    canCallBridge: false,
    canClickConfirm: false,
    canClickReview: false,
    canControlBrowser: false,
    canCreateManualTestPath,
    canExposeLocalRoute: false,
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
    manualTestPathEnabled,
    userMustConfirm: true,
  };
}

function buildManualTestPath({
  blockedReasons = [],
  canCreateManualTestPath = false,
  fetchIntent,
  internalGuardStatus,
  localOnlyGuardStatus,
  manualTestPathEnabled,
  manualTestPathId,
  metadata,
  mode,
  now,
  reason,
  routeStatus,
  status,
  warnings = [],
}: {
  blockedReasons?: string[];
  canCreateManualTestPath?: boolean;
  fetchIntent?: unknown;
  internalGuardStatus?: string;
  localOnlyGuardStatus?: string;
  manualTestPathEnabled: boolean;
  manualTestPathId?: string;
  metadata?: SafeManualTestPathMetadata;
  mode: AvanzaDisabledLocalOnlyManualTestPathMode;
  now: string;
  reason: string;
  routeStatus?: string;
  status: AvanzaDisabledLocalOnlyManualTestPathStatus;
  warnings?: string[];
}): AvanzaDisabledLocalOnlyManualTestPath {
  const accountLabel = safeText(metadata?.accountLabel);
  const actionShellId = safeText(metadata?.actionShellId);
  const apiCallIntentId = safeText(metadata?.apiCallIntentId);
  const explicitFetchIntentId = isRecord(fetchIntent)
    ? safeText(fetchIntent.fetchIntentId)
    : undefined;
  const fetchIntentId = safeText(metadata?.fetchIntentId) ?? explicitFetchIntentId;
  const limitPrice = finitePositiveNumber(metadata?.limitPrice);
  const orderType = safeText(metadata?.orderType);
  const packageId = safeText(metadata?.packageId);
  const quantity = finitePositiveNumber(metadata?.quantity);
  const safeManualTestPathId = safeText(manualTestPathId);
  const side = normalizeSide(metadata?.side);
  const sourceRecommendationId = safeText(metadata?.sourceRecommendationId);
  const ticker = safeText(metadata?.ticker);
  const symbol = safeText(metadata?.symbol) ?? ticker;

  return {
    ...(accountLabel ? { accountLabel } : {}),
    ...(actionShellId ? { actionShellId } : {}),
    ...(apiCallIntentId ? { apiCallIntentId } : {}),
    ...(fetchIntentId ? { fetchIntentId } : {}),
    ...(internalGuardStatus ? { internalGuardStatus } : {}),
    ...(limitPrice ? { limitPrice } : {}),
    ...(localOnlyGuardStatus ? { localOnlyGuardStatus } : {}),
    ...(orderType ? { orderType } : {}),
    ...(packageId ? { packageId } : {}),
    ...(quantity ? { quantity } : {}),
    ...(routeStatus ? { routeStatus } : {}),
    ...(safeManualTestPathId ? { manualTestPathId: safeManualTestPathId } : {}),
    ...(side ? { side } : {}),
    ...(sourceRecommendationId ? { sourceRecommendationId } : {}),
    ...(symbol ? { symbol } : {}),
    ...(ticker ? { ticker } : {}),
    ...buildSafetyFlags({ canCreateManualTestPath, manualTestPathEnabled }),
    blockedReasons,
    createdAt: now,
    label: statusLabel(status),
    mode,
    reason,
    status,
    warnings,
  };
}

export function buildAvanzaDisabledLocalOnlyManualTestPath({
  actionShellModel,
  apiCallIntent,
  fetchIntent,
  handoffMetadata,
  internalGuard,
  localOnlyGuard,
  manualTestPathEnabled = false,
  manualTestPathId,
  mode = "disabled",
  now = "not_provided",
  routeState,
}: BuildAvanzaDisabledLocalOnlyManualTestPathInput = {}): AvanzaDisabledLocalOnlyManualTestPath {
  if (mode === "hidden") {
    return buildManualTestPath({
      blockedReasons: ["manual test path hidden"],
      manualTestPathEnabled,
      manualTestPathId,
      mode,
      now,
      reason:
        "Disabled local-only manual test path is hidden. No fetch, API route call, route exposure, localhost call, bridge call, browser control, fill, review, confirmation, submit, order, sensitive-data handling, or persistence is available.",
      status: "manual_test_path_hidden",
    });
  }

  if (!manualTestPathEnabled || mode === "disabled") {
    return buildManualTestPath({
      blockedReasons: ["manual test path disabled"],
      manualTestPathEnabled,
      manualTestPathId,
      mode,
      now,
      reason:
        "Disabled local-only manual test path is disabled by default. No fetch, API route call, route exposure, localhost call, bridge call, browser control, fill, review, confirmation, submit, order, sensitive-data handling, or persistence is available.",
      status: "manual_test_path_disabled",
    });
  }

  if (inputHasFailedStatus(fetchIntent, routeState, internalGuard, localOnlyGuard, actionShellModel, apiCallIntent)) {
    return buildManualTestPath({
      blockedReasons: ["explicit failed input"],
      manualTestPathEnabled,
      manualTestPathId,
      mode,
      now,
      reason:
        "An explicit failed fetch intent, route state, guard, action shell, or API call intent was provided, so the manual test path metadata is failed without side effects.",
      status: "manual_test_path_failed",
    });
  }

  if (!isRecord(fetchIntent)) {
    return buildManualTestPath({
      blockedReasons: ["fetch intent unavailable"],
      manualTestPathEnabled,
      manualTestPathId,
      mode,
      now,
      reason:
        "No explicit guarded fetch intent metadata was provided, so the disabled local-only manual test path is unavailable.",
      status: "fetch_intent_unavailable",
    });
  }

  const fetchIntentStatus = statusOf(fetchIntent);

  if (!fetchIntentStatus) {
    return buildManualTestPath({
      blockedReasons: ["fetch intent status unavailable"],
      manualTestPathEnabled,
      manualTestPathId,
      mode,
      now,
      reason:
        "The explicit guarded fetch intent has no safe status, so the disabled local-only manual test path is unavailable.",
      status: "fetch_intent_unavailable",
    });
  }

  if (unavailableFetchIntentStatuses.has(fetchIntentStatus)) {
    return buildManualTestPath({
      blockedReasons: ["fetch intent not ready"],
      manualTestPathEnabled,
      manualTestPathId,
      mode,
      now,
      reason:
        "The explicit guarded fetch intent is hidden, disabled, or unavailable, so no manual test path metadata can be created.",
      status: "fetch_intent_unavailable",
      warnings: safeStringArray(fetchIntent.warnings),
    });
  }

  if (blockedFetchIntentStatuses.has(fetchIntentStatus)) {
    return buildManualTestPath({
      blockedReasons:
        safeStringArray(fetchIntent.blockedReasons).length > 0
          ? safeStringArray(fetchIntent.blockedReasons)
          : ["fetch intent blocked"],
      manualTestPathEnabled,
      manualTestPathId,
      mode,
      now,
      reason:
        "The explicit guarded fetch intent is blocked, unavailable, disabled, or unknown, so the manual test path is blocked.",
      status: fetchIntentStatus === "unknown" ? "unknown" : "manual_test_path_blocked",
      warnings: safeStringArray(fetchIntent.warnings),
    });
  }

  if (!readyFetchIntentStatuses.has(fetchIntentStatus)) {
    return buildManualTestPath({
      blockedReasons: ["fetch intent status not safe"],
      manualTestPathEnabled,
      manualTestPathId,
      mode,
      now,
      reason:
        "The explicit guarded fetch intent status could not be classified as safe internal disabled metadata.",
      status: "fetch_intent_unavailable",
      warnings: safeStringArray(fetchIntent.warnings),
    });
  }

  const explicitRouteStatus = routeStatusOf(routeState);

  if (!explicitRouteStatus) {
    return buildManualTestPath({
      blockedReasons: ["route state unavailable"],
      manualTestPathEnabled,
      manualTestPathId,
      mode,
      now,
      reason:
        "No explicit disabled local-only route state metadata was provided, so the manual test path route is unavailable.",
      status: "route_unavailable",
      warnings: safeStringArray(fetchIntent.warnings),
    });
  }

  if (disabledRouteStatuses.has(explicitRouteStatus)) {
    return buildManualTestPath({
      blockedReasons: ["route disabled"],
      manualTestPathEnabled,
      manualTestPathId,
      mode,
      now,
      reason:
        "The explicit local-only route state is disabled, so the manual test path remains disabled metadata only.",
      routeStatus: explicitRouteStatus,
      status: "route_disabled",
      warnings: safeStringArray(fetchIntent.warnings),
    });
  }

  if (!readyRouteStatuses.has(explicitRouteStatus)) {
    return buildManualTestPath({
      blockedReasons: ["route state not ready"],
      manualTestPathEnabled,
      manualTestPathId,
      mode,
      now,
      reason:
        "The explicit local-only route state is unavailable, failed, blocked, or unknown, so the manual test path is unavailable.",
      routeStatus: explicitRouteStatus,
      status: explicitRouteStatus === "unknown" ? "unknown" : "route_unavailable",
      warnings: safeStringArray(fetchIntent.warnings),
    });
  }

  const internalGuardStatus = statusOf(internalGuard);

  if (
    !guardAllows(internalGuard, allowedInternalGuardStatuses, [
      "internalGuardEnabled",
      "devOnlyGuardEnabled",
      "allowManualTestPath",
    ])
  ) {
    return buildManualTestPath({
      blockedReasons: ["internal guard missing"],
      internalGuardStatus,
      manualTestPathEnabled,
      manualTestPathId,
      mode,
      now,
      reason:
        "No explicit internal/dev-only guard allowed disabled local-only manual test path metadata.",
      routeStatus: explicitRouteStatus,
      status: "internal_guard_missing",
      warnings: safeStringArray(fetchIntent.warnings),
    });
  }

  const localOnlyGuardStatus = statusOf(localOnlyGuard);

  if (
    !guardAllows(localOnlyGuard, allowedLocalOnlyGuardStatuses, [
      "localOnlyGuardEnabled",
      "localOnlyEnabled",
      "allowLocalOnlyManualTestPath",
    ])
  ) {
    return buildManualTestPath({
      blockedReasons: ["local-only guard missing"],
      internalGuardStatus,
      localOnlyGuardStatus,
      manualTestPathEnabled,
      manualTestPathId,
      mode,
      now,
      reason:
        "No explicit local-only guard allowed disabled manual test path metadata.",
      routeStatus: explicitRouteStatus,
      status: "local_only_guard_missing",
      warnings: safeStringArray(fetchIntent.warnings),
    });
  }

  if (inputHasUnsafeSafetyFlag(fetchIntent, routeState, internalGuard, localOnlyGuard, actionShellModel, apiCallIntent)) {
    return buildManualTestPath({
      blockedReasons: ["unsafe safety flag present"],
      internalGuardStatus,
      localOnlyGuardStatus,
      manualTestPathEnabled,
      manualTestPathId,
      mode,
      now,
      reason:
        "One or more explicit inputs contains an unsafe safety flag, so the disabled local-only manual test path is blocked.",
      routeStatus: explicitRouteStatus,
      status: "manual_test_path_blocked",
      warnings: safeStringArray(fetchIntent.warnings),
    });
  }

  const metadata = extractMetadata(
    isRecord(handoffMetadata) ? handoffMetadata : undefined,
    fetchIntent,
    isRecord(apiCallIntent) ? apiCallIntent : undefined,
    isRecord(actionShellModel) ? actionShellModel : undefined,
  );
  const validationBlockers = validateMetadata(metadata);

  if (validationBlockers.length > 0) {
    return buildManualTestPath({
      blockedReasons: validationBlockers,
      internalGuardStatus,
      localOnlyGuardStatus,
      manualTestPathEnabled,
      manualTestPathId,
      metadata,
      mode,
      now,
      reason:
        "Explicit metadata is missing safe fields required for disabled local-only manual test path metadata.",
      routeStatus: explicitRouteStatus,
      status: "manual_test_path_blocked",
      warnings: safeStringArray(metadata.warnings),
    });
  }

  if (mode === "internal_preview" || mode === "internal_manual_test_path") {
    return buildManualTestPath({
      canCreateManualTestPath: true,
      fetchIntent,
      internalGuardStatus,
      localOnlyGuardStatus,
      manualTestPathEnabled,
      manualTestPathId,
      metadata,
      mode,
      now,
      reason:
        "All explicit inputs are safe enough to describe a disabled local-only manual test path as internal disabled metadata only. It still cannot fetch, call the route, expose a route, call localhost, call bridge, control a browser, fill, review, confirm, submit, or place an order.",
      routeStatus: explicitRouteStatus,
      status: "manual_test_path_ready_internal_disabled",
      warnings: safeStringArray(metadata.warnings),
    });
  }

  return buildManualTestPath({
    blockedReasons: ["unknown manual test path mode"],
    manualTestPathEnabled,
    manualTestPathId,
    mode,
    now,
    reason: "The disabled local-only manual test path mode is unknown.",
    routeStatus: explicitRouteStatus,
    status: "unknown",
  });
}
