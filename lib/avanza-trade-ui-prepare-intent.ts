export type AvanzaTradeUiPrepareIntentStatus =
  | "prepare_disabled"
  | "package_unavailable"
  | "package_blocked"
  | "route_disabled"
  | "prepare_ready_internal"
  | "prepare_blocked"
  | "prepare_failed"
  | "unknown";

export type AvanzaTradeUiPrepareIntentMode =
  | "disabled"
  | "internal_preview"
  | "internal_prepare";

export type AvanzaTradeUiPrepareIntentSafetyFlags = {
  canCallApiRoute: false;
  canCallBridge: false;
  canClickConfirm: false;
  canClickPrepare: false;
  canClickReview: false;
  canControlBrowser: false;
  canFetchLocalhost: false;
  canFillForm: false;
  canHandleCredentials: false;
  canReadBankId: false;
  canReadCookies: false;
  canRenderPrepare: false;
  canSubmitOrder: false;
  canWriteSupabaseExecution: false;
  controlsEnabled: false;
  finalHumanClickRequired: true;
  gateLocked: true;
  prepareEnabled: boolean;
  userMustConfirm: true;
};

export type AvanzaTradeUiPrepareIntent = AvanzaTradeUiPrepareIntentSafetyFlags & {
  accountLabel?: string;
  blockedReasons: string[];
  createdAt: string;
  label: string;
  limitPrice?: number;
  mode: AvanzaTradeUiPrepareIntentMode;
  orderType?: string;
  packageId?: string;
  prepareIntentId?: string;
  quantity?: number;
  reason: string;
  side?: "BUY" | "SELL";
  sourceRecommendationId?: string;
  status: AvanzaTradeUiPrepareIntentStatus;
  symbol?: string;
  ticker?: string;
  warnings: string[];
};

export type BuildAvanzaTradeUiPrepareIntentInput = {
  adapterResponse?: unknown;
  apiRouteState?: unknown;
  handoffPackageResult?: unknown;
  handoffPreviewResult?: unknown;
  mode?: AvanzaTradeUiPrepareIntentMode;
  now?: string;
  prepareEnabled?: boolean;
  prepareIntentId?: string;
};

type SafePackage = {
  accountLabel?: string;
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

type PackageNormalization = {
  blockedReasons: string[];
  package?: SafePackage;
  warnings: string[];
};

const readyHandoffStatuses = new Set([
  "handoff_ready_read_only",
  "handoff_ready_fill_only",
]);

const blockedHandoffStatuses = new Set([
  "source_invalid",
  "risk_blocked",
]);

const unavailableHandoffStatuses = new Set([
  "handoff_disabled",
  "source_unavailable",
]);

const readyPreviewStatuses = new Set([
  "package_ready_read_only",
  "package_ready_fill_only_preview",
]);

const blockedPreviewStatuses = new Set(["package_blocked"]);

const unavailablePreviewStatuses = new Set([
  "preview_disabled",
  "package_unavailable",
]);

const readyAdapterStatuses = new Set(["dry_run_ready", "fill_only_ready"]);

const failedStatuses = new Set(["fill_failed", "prepare_failed"]);

const readyApiStatuses = new Set([
  "dry_run_ready_mock",
  "fill_only_ready_mock",
]);

const disabledApiStatuses = new Set([
  "api_stub_disabled",
  "local_only_not_enabled",
]);

const accountLabelBlockPattern =
  /account\s*id|accountid|bankid|cookie|credential|secret|session|storage|token/i;

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

function safeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeSide(value: unknown): "BUY" | "SELL" | undefined {
  const side = nonEmptyString(value)?.toUpperCase();

  if (side === "BUY" || side === "SELL") {
    return side;
  }

  return undefined;
}

function sanitizeAccountLabel(value: unknown) {
  const label = nonEmptyString(value);

  if (!label) {
    return undefined;
  }

  if (accountLabelBlockPattern.test(label) || /\d{5,}/.test(label)) {
    return undefined;
  }

  return label;
}

function buildSafetyFlags(
  prepareEnabled: boolean,
): AvanzaTradeUiPrepareIntentSafetyFlags {
  return {
    canCallApiRoute: false,
    canCallBridge: false,
    canClickConfirm: false,
    canClickPrepare: false,
    canClickReview: false,
    canControlBrowser: false,
    canFetchLocalhost: false,
    canFillForm: false,
    canHandleCredentials: false,
    canReadBankId: false,
    canReadCookies: false,
    canRenderPrepare: false,
    canSubmitOrder: false,
    canWriteSupabaseExecution: false,
    controlsEnabled: false,
    finalHumanClickRequired: true,
    gateLocked: true,
    prepareEnabled,
    userMustConfirm: true,
  };
}

function buildIntent({
  blockedReasons = [],
  mode,
  now,
  packageData,
  prepareEnabled,
  prepareIntentId,
  reason,
  status,
  warnings = [],
}: {
  blockedReasons?: string[];
  mode: AvanzaTradeUiPrepareIntentMode;
  now: string;
  packageData?: SafePackage;
  prepareEnabled: boolean;
  prepareIntentId?: string;
  reason: string;
  status: AvanzaTradeUiPrepareIntentStatus;
  warnings?: string[];
}): AvanzaTradeUiPrepareIntent {
  const packageId = nonEmptyString(packageData?.packageId);
  const ticker = nonEmptyString(packageData?.ticker);
  const symbol = nonEmptyString(packageData?.symbol) ?? ticker;
  const side = normalizeSide(packageData?.side);
  const quantity = finitePositiveNumber(packageData?.quantity);
  const orderType = nonEmptyString(packageData?.orderType);
  const limitPrice = finitePositiveNumber(packageData?.limitPrice);
  const accountLabel = sanitizeAccountLabel(packageData?.accountLabel);
  const sourceRecommendationId = nonEmptyString(
    packageData?.sourceRecommendationId,
  );
  const safePrepareIntentId =
    nonEmptyString(prepareIntentId) ??
    (packageId ? `avanza-prepare-intent-${packageId}` : undefined);

  return {
    ...(accountLabel ? { accountLabel } : {}),
    ...(limitPrice ? { limitPrice } : {}),
    ...(orderType ? { orderType } : {}),
    ...(packageId ? { packageId } : {}),
    ...(quantity ? { quantity } : {}),
    ...(safePrepareIntentId ? { prepareIntentId: safePrepareIntentId } : {}),
    ...(side ? { side } : {}),
    ...(sourceRecommendationId ? { sourceRecommendationId } : {}),
    ...(symbol ? { symbol } : {}),
    ...(ticker ? { ticker } : {}),
    ...buildSafetyFlags(prepareEnabled),
    blockedReasons,
    createdAt: now,
    label: statusLabel(status),
    mode,
    reason,
    status,
    warnings,
  };
}

function statusLabel(status: AvanzaTradeUiPrepareIntentStatus) {
  const labels: Record<AvanzaTradeUiPrepareIntentStatus, string> = {
    package_blocked: "Trade UI prepare intent package blocked",
    package_unavailable: "Trade UI prepare intent package unavailable",
    prepare_blocked: "Trade UI prepare intent blocked",
    prepare_disabled: "Trade UI prepare intent disabled",
    prepare_failed: "Trade UI prepare intent failed",
    prepare_ready_internal: "Trade UI prepare intent ready internally",
    route_disabled: "Trade UI prepare intent route disabled",
    unknown: "Trade UI prepare intent unknown",
  };

  return labels[status];
}

function normalizePackageFromSource(value: unknown): PackageNormalization {
  if (!isRecord(value)) {
    return {
      blockedReasons: [],
      warnings: [],
    };
  }

  if (isRecord(value.package)) {
    return {
      blockedReasons: safeStringArray(value.blockedReasons),
      package: value.package,
      warnings: safeStringArray(value.warnings),
    };
  }

  return {
    blockedReasons: safeStringArray(value.blockedReasons),
    package: value as SafePackage,
    warnings: safeStringArray(value.warnings),
  };
}

function resolvePackageInput({
  handoffPackageResult,
  handoffPreviewResult,
}: Pick<
  BuildAvanzaTradeUiPrepareIntentInput,
  "handoffPackageResult" | "handoffPreviewResult"
>): PackageNormalization | "unavailable" | "blocked" | "unknown" {
  const sources = [handoffPreviewResult, handoffPackageResult].filter(
    (value) => value !== undefined && value !== null,
  );

  if (sources.length === 0) {
    return "unavailable";
  }

  for (const source of sources) {
    if (!isRecord(source)) {
      return "blocked";
    }

    const status = nonEmptyString(source.status);

    if (status && failedStatuses.has(status)) {
      return "blocked";
    }

    if (
      status &&
      (blockedHandoffStatuses.has(status) || blockedPreviewStatuses.has(status))
    ) {
      return "blocked";
    }

    if (
      status &&
      (readyHandoffStatuses.has(status) || readyPreviewStatuses.has(status))
    ) {
      return normalizePackageFromSource(source);
    }

    if (
      status &&
      (unavailableHandoffStatuses.has(status) ||
        unavailablePreviewStatuses.has(status))
    ) {
      continue;
    }
  }

  return sources.some((source) => isRecord(source) && "status" in source)
    ? "unavailable"
    : "unknown";
}

function validatePackage(packageData: SafePackage | undefined) {
  if (!isRecord(packageData)) {
    return ["package unavailable"];
  }

  const blockedReasons: string[] = [];
  const orderType = nonEmptyString(packageData.orderType)?.toUpperCase();

  if (!nonEmptyString(packageData.packageId)) {
    blockedReasons.push("missing packageId");
  }

  if (!nonEmptyString(packageData.ticker)) {
    blockedReasons.push("missing ticker");
  }

  if (!normalizeSide(packageData.side)) {
    blockedReasons.push("missing or invalid side");
  }

  if (!finitePositiveNumber(packageData.quantity)) {
    blockedReasons.push("invalid quantity");
  }

  if (!orderType) {
    blockedReasons.push("missing orderType");
  }

  if (orderType && orderType !== "MARKET" && !finitePositiveNumber(packageData.limitPrice)) {
    blockedReasons.push("invalid or unsafe price");
  }

  if (safeStringArray(packageData.blockedReasons).length > 0) {
    blockedReasons.push("package has blocked reasons");
  }

  return blockedReasons;
}

function adapterIsReady(adapterResponse: unknown) {
  if (!isRecord(adapterResponse)) {
    return false;
  }

  const status = nonEmptyString(adapterResponse.status);

  return Boolean(status && readyAdapterStatuses.has(status));
}

function inputHasFailedStatus(...values: unknown[]) {
  return values.some((value) => {
    if (!isRecord(value)) {
      return false;
    }

    const status = nonEmptyString(value.status);

    return Boolean(status && failedStatuses.has(status));
  });
}

function apiRouteStatus(apiRouteState: unknown) {
  if (apiRouteState === undefined || apiRouteState === null) {
    return undefined;
  }

  if (!isRecord(apiRouteState)) {
    return "unknown";
  }

  return nonEmptyString(apiRouteState.status) ?? "unknown";
}

export function buildAvanzaTradeUiPrepareIntent({
  adapterResponse,
  apiRouteState,
  handoffPackageResult,
  handoffPreviewResult,
  mode = "disabled",
  now = "not_provided",
  prepareEnabled = false,
  prepareIntentId,
}: BuildAvanzaTradeUiPrepareIntentInput = {}): AvanzaTradeUiPrepareIntent {
  if (!prepareEnabled || mode === "disabled") {
    return buildIntent({
      blockedReasons: ["prepare disabled"],
      mode,
      now,
      prepareEnabled,
      prepareIntentId,
      reason:
        "Trade UI prepare intent is disabled by default. No UI wiring, button, API route call, bridge call, browser control, fill, review, confirmation, submit, order, credential handling, or Supabase write is available.",
      status: "prepare_disabled",
    });
  }

  if (inputHasFailedStatus(adapterResponse, apiRouteState)) {
    return buildIntent({
      blockedReasons: ["explicit failed input"],
      mode,
      now,
      prepareEnabled,
      prepareIntentId,
      reason:
        "An explicit failed adapter or route state was provided, so prepare intent is marked failed without side effects.",
      status: "prepare_failed",
    });
  }

  const normalizedPackage = resolvePackageInput({
    handoffPackageResult,
    handoffPreviewResult,
  });

  if (normalizedPackage === "unavailable") {
    return buildIntent({
      blockedReasons: ["package unavailable"],
      mode,
      now,
      prepareEnabled,
      prepareIntentId,
      reason:
        "No safe explicit handoff package or Trade UI handoff preview package was provided.",
      status: "package_unavailable",
    });
  }

  if (normalizedPackage === "blocked") {
    return buildIntent({
      blockedReasons: ["package blocked"],
      mode,
      now,
      prepareEnabled,
      prepareIntentId,
      reason:
        "The explicit handoff package or preview result is blocked or unsafe for prepare intent metadata.",
      status: "package_blocked",
    });
  }

  if (normalizedPackage === "unknown") {
    return buildIntent({
      blockedReasons: ["unknown package input"],
      mode,
      now,
      prepareEnabled,
      prepareIntentId,
      reason:
        "The explicit prepare intent input could not be classified safely.",
      status: "unknown",
    });
  }

  const validationBlockers = [
    ...normalizedPackage.blockedReasons,
    ...validatePackage(normalizedPackage.package),
  ];

  if (validationBlockers.length > 0) {
    return buildIntent({
      blockedReasons: validationBlockers,
      mode,
      now,
      packageData: normalizedPackage.package,
      prepareEnabled,
      prepareIntentId,
      reason:
        "The handoff package is present but blocked or missing safe fields required for prepare intent metadata.",
      status: "package_blocked",
      warnings: normalizedPackage.warnings,
    });
  }

  const routeStatus = apiRouteStatus(apiRouteState);

  if (routeStatus && disabledApiStatuses.has(routeStatus)) {
    return buildIntent({
      blockedReasons: ["api route disabled"],
      mode,
      now,
      packageData: normalizedPackage.package,
      prepareEnabled,
      prepareIntentId,
      reason:
        "The explicit API route state is disabled, so prepare intent cannot proceed beyond disabled metadata.",
      status: "route_disabled",
      warnings: normalizedPackage.warnings,
    });
  }

  if (routeStatus === "unknown") {
    return buildIntent({
      blockedReasons: ["api route state unknown"],
      mode,
      now,
      packageData: normalizedPackage.package,
      prepareEnabled,
      prepareIntentId,
      reason:
        "The explicit API route state could not be classified safely.",
      status: "prepare_blocked",
      warnings: normalizedPackage.warnings,
    });
  }

  if (mode === "internal_preview") {
    return buildIntent({
      mode,
      now,
      packageData: normalizedPackage.package,
      prepareEnabled,
      prepareIntentId,
      reason:
        "A safe explicit handoff package can be represented as internal read-only prepare metadata only. No button, route call, bridge call, browser control, fill, review, confirmation, submit, order, or execution is enabled.",
      status: "prepare_ready_internal",
      warnings: normalizedPackage.warnings,
    });
  }

  if (mode === "internal_prepare") {
    if (!adapterIsReady(adapterResponse)) {
      return buildIntent({
        blockedReasons: ["adapter response unavailable or not ready"],
        mode,
        now,
        packageData: normalizedPackage.package,
        prepareEnabled,
        prepareIntentId,
        reason:
          "Internal prepare intent requires an explicit safe adapter response before it can be represented as ready metadata.",
        status: "prepare_blocked",
        warnings: normalizedPackage.warnings,
      });
    }

    if (!routeStatus || !readyApiStatuses.has(routeStatus)) {
      return buildIntent({
        blockedReasons: ["api route state unavailable or not ready"],
        mode,
        now,
        packageData: normalizedPackage.package,
        prepareEnabled,
        prepareIntentId,
        reason:
          "Internal prepare intent requires an explicit safe local-only API route mock-ready state before it can be represented as ready metadata.",
        status: "prepare_blocked",
        warnings: normalizedPackage.warnings,
      });
    }

    return buildIntent({
      mode,
      now,
      packageData: normalizedPackage.package,
      prepareEnabled,
      prepareIntentId,
      reason:
        "All explicit safe inputs are present, so internal prepare intent is ready as metadata only. It still cannot render or click prepare, call the API route, call bridge, fetch localhost, control a browser, fill a form, review, confirm, submit, or place an order.",
      status: "prepare_ready_internal",
      warnings: normalizedPackage.warnings,
    });
  }

  return buildIntent({
    blockedReasons: ["unknown prepare intent mode"],
    mode,
    now,
    packageData: normalizedPackage.package,
    prepareEnabled,
    prepareIntentId,
    reason: "The prepare intent mode is unknown.",
    status: "unknown",
    warnings: normalizedPackage.warnings,
  });
}
