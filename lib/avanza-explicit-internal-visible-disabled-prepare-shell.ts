export type AvanzaExplicitInternalVisibleDisabledPrepareShellStatus =
  | "visible_shell_disabled"
  | "visible_shell_blocked"
  | "visible_shell_ready_internal_disabled"
  | "visible_shell_error"
  | "visible_shell_hidden"
  | "unknown";

export type AvanzaExplicitInternalVisibleDisabledPrepareShellMode =
  | "hidden"
  | "disabled"
  | "internal_visible_disabled";

export type AvanzaExplicitInternalVisibleDisabledPrepareShellSafetyFlags = {
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
  canRenderVisibleShell: boolean;
  canSubmitOrder: false;
  canWriteSupabaseExecution: false;
  controlsEnabled: false;
  finalHumanClickRequired: true;
  gateLocked: true;
  userMustConfirm: true;
  visibleShellEnabled: boolean;
};

export type AvanzaExplicitInternalVisibleDisabledPrepareShellModel =
  AvanzaExplicitInternalVisibleDisabledPrepareShellSafetyFlags & {
    accountLabel?: string;
    blockedReasons: string[];
    copy: string[];
    createdAt: string;
    label: string;
    limitPrice?: number;
    mode: AvanzaExplicitInternalVisibleDisabledPrepareShellMode;
    orderType?: string;
    packageId?: string;
    prepareIntentId?: string;
    quantity?: number;
    reason: string;
    shellId?: string;
    side?: "BUY" | "SELL";
    sourceRecommendationId?: string;
    sourceShellStatus?: string;
    sourceComponentStatus?: string;
    status: AvanzaExplicitInternalVisibleDisabledPrepareShellStatus;
    symbol?: string;
    ticker?: string;
    visibleShellId?: string;
    warnings: string[];
  };

export type BuildAvanzaExplicitInternalVisibleDisabledPrepareShellInput = {
  baseShellModel?: unknown;
  mode?: AvanzaExplicitInternalVisibleDisabledPrepareShellMode;
  now?: string;
  passiveComponentModel?: unknown;
  visibleShellEnabled?: boolean;
  visibleShellId?: string;
};

const visibleShellCopy = [
  "Internal preview",
  "Disabled",
  "No broker action",
  "No order submission",
  "Final human confirmation required",
  "Not production ready",
  "Manual confirmation required in Avanza",
];

const safeStringBlockPattern =
  /account\s*id|accountid|bankid|broker\s*secret|cookie|credential|secret|session|storage|token/i;

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
    ? value.flatMap((item) => {
      const text = safeText(item);

      return text ? [text] : [];
    })
    : [];
}

function safeText(value: unknown) {
  const text = nonEmptyString(value);

  if (!text) {
    return undefined;
  }

  if (safeStringBlockPattern.test(text) || /\d{5,}/.test(text)) {
    return undefined;
  }

  return text;
}

function normalizeSide(value: unknown): "BUY" | "SELL" | undefined {
  const side = nonEmptyString(value)?.toUpperCase();

  if (side === "BUY" || side === "SELL") {
    return side;
  }

  return undefined;
}

function isShellLike(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    typeof value.status === "string" &&
    "canClickPrepare" in value &&
    "canCallApiRoute" in value &&
    "canCallBridge" in value &&
    "canFetchLocalhost" in value &&
    "canSubmitOrder" in value
  );
}

function isComponentLike(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    typeof value.status === "string" &&
    "componentEnabled" in value &&
    "canRenderComponent" in value &&
    "canClickPrepare" in value &&
    "canCallApiRoute" in value
  );
}

function buildSafetyFlags({
  canRenderVisibleShell,
  visibleShellEnabled,
}: {
  canRenderVisibleShell: boolean;
  visibleShellEnabled: boolean;
}): AvanzaExplicitInternalVisibleDisabledPrepareShellSafetyFlags {
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
    canRenderVisibleShell,
    canSubmitOrder: false,
    canWriteSupabaseExecution: false,
    controlsEnabled: false,
    finalHumanClickRequired: true,
    gateLocked: true,
    userMustConfirm: true,
    visibleShellEnabled,
  };
}

function statusLabel(
  status: AvanzaExplicitInternalVisibleDisabledPrepareShellStatus,
) {
  const labels: Record<
    AvanzaExplicitInternalVisibleDisabledPrepareShellStatus,
    string
  > = {
    unknown: "Explicit internal visible disabled prepare shell unknown",
    visible_shell_blocked:
      "Explicit internal visible disabled prepare shell blocked",
    visible_shell_disabled:
      "Explicit internal visible disabled prepare shell disabled",
    visible_shell_error:
      "Explicit internal visible disabled prepare shell error",
    visible_shell_hidden:
      "Explicit internal visible disabled prepare shell hidden",
    visible_shell_ready_internal_disabled:
      "Explicit internal visible disabled prepare shell ready internally",
  };

  return labels[status];
}

function firstSafeText(...values: unknown[]) {
  for (const value of values) {
    const text = safeText(value);

    if (text) {
      return text;
    }
  }

  return undefined;
}

function firstPositiveNumber(...values: unknown[]) {
  for (const value of values) {
    const number = finitePositiveNumber(value);

    if (number !== undefined) {
      return number;
    }
  }

  return undefined;
}

function buildModel({
  baseShell,
  blockedReasons = [],
  canRenderVisibleShell,
  mode,
  now,
  passiveComponent,
  reason,
  status,
  visibleShellEnabled,
  visibleShellId,
  warnings = [],
}: {
  baseShell?: Record<string, unknown>;
  blockedReasons?: string[];
  canRenderVisibleShell: boolean;
  mode: AvanzaExplicitInternalVisibleDisabledPrepareShellMode;
  now: string;
  passiveComponent?: Record<string, unknown>;
  reason: string;
  status: AvanzaExplicitInternalVisibleDisabledPrepareShellStatus;
  visibleShellEnabled: boolean;
  visibleShellId?: string;
  warnings?: string[];
}): AvanzaExplicitInternalVisibleDisabledPrepareShellModel {
  const source = baseShell ?? passiveComponent;
  const ticker = firstSafeText(baseShell?.ticker, passiveComponent?.ticker);
  const symbol = firstSafeText(
    baseShell?.symbol,
    passiveComponent?.symbol,
    ticker,
  );
  const safeVisibleShellId = safeText(visibleShellId);
  const shellId = safeText(baseShell?.shellId);
  const prepareIntentId = safeText(baseShell?.prepareIntentId);
  const packageId = safeText(baseShell?.packageId);
  const sourceRecommendationId = safeText(baseShell?.sourceRecommendationId);
  const orderType = firstSafeText(baseShell?.orderType, passiveComponent?.orderType);
  const accountLabel = firstSafeText(
    baseShell?.accountLabel,
    passiveComponent?.accountLabel,
  );
  const side = normalizeSide(baseShell?.side ?? passiveComponent?.side);
  const quantity = firstPositiveNumber(
    baseShell?.quantity,
    passiveComponent?.quantity,
  );
  const limitPrice = firstPositiveNumber(
    baseShell?.limitPrice,
    passiveComponent?.limitPrice,
  );
  const sourceShellStatus = safeText(baseShell?.status);
  const sourceComponentStatus = safeText(passiveComponent?.status);

  return {
    ...(accountLabel ? { accountLabel } : {}),
    ...(limitPrice ? { limitPrice } : {}),
    ...(orderType ? { orderType } : {}),
    ...(packageId ? { packageId } : {}),
    ...(prepareIntentId ? { prepareIntentId } : {}),
    ...(quantity ? { quantity } : {}),
    ...(safeVisibleShellId ? { visibleShellId: safeVisibleShellId } : {}),
    ...(shellId ? { shellId } : {}),
    ...(side ? { side } : {}),
    ...(sourceComponentStatus ? { sourceComponentStatus } : {}),
    ...(sourceRecommendationId ? { sourceRecommendationId } : {}),
    ...(sourceShellStatus ? { sourceShellStatus } : {}),
    ...(symbol ? { symbol } : {}),
    ...(ticker ? { ticker } : {}),
    ...buildSafetyFlags({ canRenderVisibleShell, visibleShellEnabled }),
    blockedReasons,
    copy: visibleShellCopy,
    createdAt: now,
    label: statusLabel(status),
    mode,
    reason,
    status,
    warnings:
      warnings.length > 0
        ? warnings
        : safeStringArray(source?.warnings),
  };
}

function sourceBlockedReasons(source?: Record<string, unknown>) {
  return safeStringArray(source?.blockedReasons);
}

function sourceWarnings(source?: Record<string, unknown>) {
  return safeStringArray(source?.warnings);
}

export function buildAvanzaExplicitInternalVisibleDisabledPrepareShell({
  baseShellModel,
  mode = "hidden",
  now = "not_provided",
  passiveComponentModel,
  visibleShellEnabled = false,
  visibleShellId,
}: BuildAvanzaExplicitInternalVisibleDisabledPrepareShellInput = {}): AvanzaExplicitInternalVisibleDisabledPrepareShellModel {
  if (!visibleShellEnabled || mode === "hidden") {
    return buildModel({
      blockedReasons: ["visible shell hidden"],
      canRenderVisibleShell: false,
      mode,
      now,
      reason:
        "Explicit internal visible disabled prepare shell is hidden by default. No visible shell, active prepare button, API route call, localhost call, bridge call, browser control, fill, review, confirmation, submit, order, credential handling, or Supabase write is available.",
      status: "visible_shell_hidden",
      visibleShellEnabled,
      visibleShellId,
    });
  }

  if (mode === "disabled") {
    return buildModel({
      baseShell: isShellLike(baseShellModel) ? baseShellModel : undefined,
      blockedReasons: ["visible shell disabled"],
      canRenderVisibleShell: true,
      mode,
      now,
      passiveComponent: isComponentLike(passiveComponentModel)
        ? passiveComponentModel
        : undefined,
      reason:
        "Explicit internal visible disabled prepare shell is disabled. It may show disabled metadata only and cannot click, call an API route, call a bridge, fetch localhost, control a browser, fill, review, confirm, submit, or place an order.",
      status: "visible_shell_disabled",
      visibleShellEnabled,
      visibleShellId,
    });
  }

  const baseShell = isShellLike(baseShellModel) ? baseShellModel : undefined;
  const passiveComponent = isComponentLike(passiveComponentModel)
    ? passiveComponentModel
    : undefined;

  if (!baseShell) {
    return buildModel({
      blockedReasons: ["base shell model unavailable or invalid"],
      canRenderVisibleShell: true,
      mode,
      now,
      passiveComponent,
      reason:
        "No explicit safe disabled internal prepare shell model was provided, so the visible disabled shell remains blocked and cannot prepare, call an API route, call a bridge, fetch localhost, control a browser, fill, review, confirm, submit, or place an order.",
      status: "visible_shell_blocked",
      visibleShellEnabled,
      visibleShellId,
    });
  }

  const shellStatus = nonEmptyString(baseShell.status);
  const blockedReasons = sourceBlockedReasons(baseShell);
  const warnings = sourceWarnings(baseShell);

  if (shellStatus === "prepare_shell_ready_internal_disabled") {
    return buildModel({
      baseShell,
      canRenderVisibleShell: true,
      mode,
      now,
      passiveComponent,
      reason:
        "Explicit disabled internal prepare shell metadata is ready internally, but the visible shell remains disabled and cannot click, call a route, fill, review, confirm, submit, or place an order.",
      status: "visible_shell_ready_internal_disabled",
      visibleShellEnabled,
      visibleShellId,
      warnings,
    });
  }

  if (shellStatus === "prepare_shell_blocked") {
    return buildModel({
      baseShell,
      blockedReasons:
        blockedReasons.length > 0 ? blockedReasons : ["base shell blocked"],
      canRenderVisibleShell: true,
      mode,
      now,
      passiveComponent,
      reason:
        "Explicit disabled internal prepare shell metadata is blocked, so the visible shell remains disabled.",
      status: "visible_shell_blocked",
      visibleShellEnabled,
      visibleShellId,
      warnings,
    });
  }

  if (shellStatus === "prepare_shell_error") {
    return buildModel({
      baseShell,
      blockedReasons:
        blockedReasons.length > 0 ? blockedReasons : ["base shell error"],
      canRenderVisibleShell: true,
      mode,
      now,
      passiveComponent,
      reason:
        "Explicit disabled internal prepare shell metadata is in an error state, so the visible shell remains disabled.",
      status: "visible_shell_error",
      visibleShellEnabled,
      visibleShellId,
      warnings,
    });
  }

  if (
    shellStatus === "prepare_shell_disabled" ||
    shellStatus === "prepare_shell_hidden"
  ) {
    return buildModel({
      baseShell,
      blockedReasons:
        blockedReasons.length > 0 ? blockedReasons : ["base shell disabled"],
      canRenderVisibleShell: true,
      mode,
      now,
      passiveComponent,
      reason:
        "Explicit disabled internal prepare shell metadata is disabled, so the visible shell may only show disabled metadata.",
      status: "visible_shell_disabled",
      visibleShellEnabled,
      visibleShellId,
      warnings,
    });
  }

  return buildModel({
    baseShell,
    blockedReasons:
      blockedReasons.length > 0 ? blockedReasons : ["base shell unknown"],
    canRenderVisibleShell: true,
    mode,
    now,
    passiveComponent,
    reason:
      "Explicit disabled internal prepare shell metadata could not be classified safely, so the visible shell remains disabled.",
    status: "unknown",
    visibleShellEnabled,
    visibleShellId,
    warnings,
  });
}
