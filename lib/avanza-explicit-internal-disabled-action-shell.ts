export type AvanzaExplicitInternalDisabledActionShellStatus =
  | "action_shell_hidden"
  | "action_shell_disabled"
  | "action_shell_blocked"
  | "action_shell_ready_internal_disabled"
  | "action_shell_error"
  | "unknown";

export type AvanzaExplicitInternalDisabledActionShellMode =
  | "hidden"
  | "disabled"
  | "internal_disabled";

export type AvanzaExplicitInternalDisabledActionShellSafetyFlags = {
  actionShellEnabled: boolean;
  canCallApiRoute: false;
  canCallBridge: false;
  canClickAction: false;
  canClickConfirm: false;
  canClickReview: false;
  canControlBrowser: false;
  canFetch: false;
  canFetchLocalhost: false;
  canFillForm: false;
  canHandleCredentials: false;
  canReadBankId: false;
  canReadCookies: false;
  canRenderActionShell: boolean;
  canSubmitOrder: false;
  canWriteSupabaseExecution: false;
  controlsEnabled: false;
  finalHumanClickRequired: true;
  gateLocked: true;
  userMustConfirm: true;
};

export type AvanzaExplicitInternalDisabledActionShellModel =
  AvanzaExplicitInternalDisabledActionShellSafetyFlags & {
    accountLabel?: string;
    actionShellId?: string;
    apiCallIntentId?: string;
    blockedReasons: string[];
    copy: string[];
    createdAt: string;
    label: string;
    limitPrice?: number;
    mode: AvanzaExplicitInternalDisabledActionShellMode;
    orderType?: string;
    packageId?: string;
    quantity?: number;
    reason: string;
    side?: "BUY" | "SELL";
    sourceRecommendationId?: string;
    status: AvanzaExplicitInternalDisabledActionShellStatus;
    symbol?: string;
    ticker?: string;
    visibleShellId?: string;
    warnings: string[];
  };

export type BuildAvanzaExplicitInternalDisabledActionShellInput = {
  actionShellEnabled?: boolean;
  actionShellId?: string;
  apiCallIntent?: unknown;
  mode?: AvanzaExplicitInternalDisabledActionShellMode;
  now?: string;
  visibleShellModel?: unknown;
};

const actionShellCopy = [
  "Internal preview",
  "Disabled",
  "No broker action",
  "No API call",
  "No order submission",
  "Final human confirmation required",
  "Not production ready",
  "Manual confirmation required in Avanza",
];

const blockedIntentStatuses = new Set([
  "api_call_blocked",
  "route_unavailable",
  "route_disabled",
  "visible_shell_unavailable",
  "unknown",
]);

const disabledIntentStatuses = new Set(["api_call_intent_disabled"]);

const errorIntentStatuses = new Set(["api_call_failed"]);

const readyIntentStatuses = new Set(["api_call_ready_internal_disabled"]);

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

function firstSafeText(...values: unknown[]) {
  for (const value of values) {
    const text = safeText(value);

    if (text) return text;
  }

  return undefined;
}

function firstPositiveNumber(...values: unknown[]) {
  for (const value of values) {
    const number = finitePositiveNumber(value);

    if (number !== undefined) return number;
  }

  return undefined;
}

function statusLabel(status: AvanzaExplicitInternalDisabledActionShellStatus) {
  const labels: Record<AvanzaExplicitInternalDisabledActionShellStatus, string> =
    {
      action_shell_blocked:
        "Explicit internal disabled action shell blocked",
      action_shell_disabled:
        "Explicit internal disabled action shell disabled",
      action_shell_error: "Explicit internal disabled action shell error",
      action_shell_hidden: "Explicit internal disabled action shell hidden",
      action_shell_ready_internal_disabled:
        "Explicit internal disabled action shell ready internally disabled",
      unknown: "Explicit internal disabled action shell unknown",
    };

  return labels[status];
}

function buildSafetyFlags({
  actionShellEnabled,
  canRenderActionShell,
}: {
  actionShellEnabled: boolean;
  canRenderActionShell: boolean;
}): AvanzaExplicitInternalDisabledActionShellSafetyFlags {
  return {
    actionShellEnabled,
    canCallApiRoute: false,
    canCallBridge: false,
    canClickAction: false,
    canClickConfirm: false,
    canClickReview: false,
    canControlBrowser: false,
    canFetch: false,
    canFetchLocalhost: false,
    canFillForm: false,
    canHandleCredentials: false,
    canReadBankId: false,
    canReadCookies: false,
    canRenderActionShell,
    canSubmitOrder: false,
    canWriteSupabaseExecution: false,
    controlsEnabled: false,
    finalHumanClickRequired: true,
    gateLocked: true,
    userMustConfirm: true,
  };
}

function buildModel({
  actionShellEnabled,
  actionShellId,
  apiCallIntent,
  blockedReasons = [],
  canRenderActionShell,
  mode,
  now,
  reason,
  status,
  visibleShellModel,
  warnings = [],
}: {
  actionShellEnabled: boolean;
  actionShellId?: string;
  apiCallIntent?: Record<string, unknown>;
  blockedReasons?: string[];
  canRenderActionShell: boolean;
  mode: AvanzaExplicitInternalDisabledActionShellMode;
  now: string;
  reason: string;
  status: AvanzaExplicitInternalDisabledActionShellStatus;
  visibleShellModel?: Record<string, unknown>;
  warnings?: string[];
}): AvanzaExplicitInternalDisabledActionShellModel {
  const ticker = firstSafeText(apiCallIntent?.ticker, visibleShellModel?.ticker);
  const symbol = firstSafeText(apiCallIntent?.symbol, visibleShellModel?.symbol) ?? ticker;
  const safeActionShellId = safeText(actionShellId);
  const apiCallIntentId = safeText(apiCallIntent?.apiCallIntentId);
  const visibleShellId = firstSafeText(
    visibleShellModel?.visibleShellId,
    visibleShellModel?.shellId,
  );
  const packageId = firstSafeText(
    apiCallIntent?.packageId,
    visibleShellModel?.packageId,
  );
  const sourceRecommendationId = firstSafeText(
    apiCallIntent?.sourceRecommendationId,
    visibleShellModel?.sourceRecommendationId,
  );
  const orderType = firstSafeText(
    apiCallIntent?.orderType,
    visibleShellModel?.orderType,
  );
  const accountLabel = firstSafeText(
    apiCallIntent?.accountLabel,
    visibleShellModel?.accountLabel,
  );
  const side =
    normalizeSide(apiCallIntent?.side) ?? normalizeSide(visibleShellModel?.side);
  const quantity = firstPositiveNumber(
    apiCallIntent?.quantity,
    visibleShellModel?.quantity,
  );
  const limitPrice = firstPositiveNumber(
    apiCallIntent?.limitPrice,
    visibleShellModel?.limitPrice,
  );

  return {
    ...(accountLabel ? { accountLabel } : {}),
    ...(safeActionShellId ? { actionShellId: safeActionShellId } : {}),
    ...(apiCallIntentId ? { apiCallIntentId } : {}),
    ...(limitPrice ? { limitPrice } : {}),
    ...(orderType ? { orderType } : {}),
    ...(packageId ? { packageId } : {}),
    ...(quantity ? { quantity } : {}),
    ...(side ? { side } : {}),
    ...(sourceRecommendationId ? { sourceRecommendationId } : {}),
    ...(symbol ? { symbol } : {}),
    ...(ticker ? { ticker } : {}),
    ...(visibleShellId ? { visibleShellId } : {}),
    ...buildSafetyFlags({ actionShellEnabled, canRenderActionShell }),
    blockedReasons,
    copy: actionShellCopy,
    createdAt: now,
    label: statusLabel(status),
    mode,
    reason,
    status,
    warnings,
  };
}

function hasUnsafeSafetyFlag(...values: unknown[]) {
  return values.some((value) => {
    if (!isRecord(value)) return false;

    return (
      value.canClickAction === true ||
      value.canCallApiRoute === true ||
      value.canFetch === true ||
      value.canFetchLocalhost === true ||
      value.canCallBridge === true ||
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

export function buildAvanzaExplicitInternalDisabledActionShell({
  actionShellEnabled = false,
  actionShellId,
  apiCallIntent,
  mode = "hidden",
  now = "not_provided",
  visibleShellModel,
}: BuildAvanzaExplicitInternalDisabledActionShellInput = {}): AvanzaExplicitInternalDisabledActionShellModel {
  if (!actionShellEnabled || mode === "hidden") {
    return buildModel({
      actionShellEnabled,
      actionShellId,
      canRenderActionShell: false,
      mode,
      now,
      reason:
        "Explicit internal disabled action shell is hidden by default. It cannot click, call an API route, fetch, call localhost, call bridge, control a browser, fill, review, confirm, submit, place an order, handle sensitive state, or persist execution records.",
      status: "action_shell_hidden",
    });
  }

  if (mode === "disabled") {
    return buildModel({
      actionShellEnabled,
      actionShellId,
      canRenderActionShell: true,
      mode,
      now,
      reason:
        "Explicit internal disabled action shell is disabled metadata only. It is non-clickable and cannot call API routes, fetch, or perform broker actions.",
      status: "action_shell_disabled",
    });
  }

  if (!isRecord(apiCallIntent)) {
    return buildModel({
      actionShellEnabled,
      actionShellId,
      blockedReasons: ["api call intent unavailable"],
      canRenderActionShell: true,
      mode,
      now,
      reason:
        "No explicit guarded API route call intent metadata was provided, so the disabled action shell is blocked.",
      status: "action_shell_blocked",
    });
  }

  if (hasUnsafeSafetyFlag(apiCallIntent, visibleShellModel)) {
    return buildModel({
      actionShellEnabled,
      actionShellId,
      apiCallIntent,
      blockedReasons: ["unsafe safety flag present"],
      canRenderActionShell: true,
      mode,
      now,
      reason:
        "Explicit input contains an unsafe safety flag, so the disabled action shell is blocked.",
      status: "action_shell_blocked",
      visibleShellModel: isRecord(visibleShellModel) ? visibleShellModel : undefined,
      warnings: safeStringArray(apiCallIntent.warnings),
    });
  }

  const apiIntentStatus = safeText(apiCallIntent.status);

  if (!apiIntentStatus) {
    return buildModel({
      actionShellEnabled,
      actionShellId,
      apiCallIntent,
      blockedReasons: ["api call intent status unavailable"],
      canRenderActionShell: true,
      mode,
      now,
      reason:
        "Explicit API call intent metadata has no safe status, so the disabled action shell is blocked.",
      status: "action_shell_blocked",
      visibleShellModel: isRecord(visibleShellModel) ? visibleShellModel : undefined,
      warnings: safeStringArray(apiCallIntent.warnings),
    });
  }

  if (errorIntentStatuses.has(apiIntentStatus)) {
    return buildModel({
      actionShellEnabled,
      actionShellId,
      apiCallIntent,
      blockedReasons:
        safeStringArray(apiCallIntent.blockedReasons).length > 0
          ? safeStringArray(apiCallIntent.blockedReasons)
          : ["api call intent failed"],
      canRenderActionShell: true,
      mode,
      now,
      reason:
        "Explicit API call intent metadata is failed, so the disabled action shell reports an error without side effects.",
      status: "action_shell_error",
      visibleShellModel: isRecord(visibleShellModel) ? visibleShellModel : undefined,
      warnings: safeStringArray(apiCallIntent.warnings),
    });
  }

  if (disabledIntentStatuses.has(apiIntentStatus)) {
    return buildModel({
      actionShellEnabled,
      actionShellId,
      apiCallIntent,
      blockedReasons:
        safeStringArray(apiCallIntent.blockedReasons).length > 0
          ? safeStringArray(apiCallIntent.blockedReasons)
          : ["api call intent disabled"],
      canRenderActionShell: true,
      mode,
      now,
      reason:
        "Explicit API call intent metadata is disabled, so the action shell remains disabled and non-clickable.",
      status: "action_shell_disabled",
      visibleShellModel: isRecord(visibleShellModel) ? visibleShellModel : undefined,
      warnings: safeStringArray(apiCallIntent.warnings),
    });
  }

  if (blockedIntentStatuses.has(apiIntentStatus)) {
    return buildModel({
      actionShellEnabled,
      actionShellId,
      apiCallIntent,
      blockedReasons:
        safeStringArray(apiCallIntent.blockedReasons).length > 0
          ? safeStringArray(apiCallIntent.blockedReasons)
          : ["api call intent blocked"],
      canRenderActionShell: true,
      mode,
      now,
      reason:
        "Explicit API call intent metadata is blocked or unavailable, so the disabled action shell is blocked.",
      status: "action_shell_blocked",
      visibleShellModel: isRecord(visibleShellModel) ? visibleShellModel : undefined,
      warnings: safeStringArray(apiCallIntent.warnings),
    });
  }

  if (readyIntentStatuses.has(apiIntentStatus)) {
    return buildModel({
      actionShellEnabled,
      actionShellId,
      apiCallIntent,
      canRenderActionShell: true,
      mode,
      now,
      reason:
        "Explicit API call intent metadata is ready for internal disabled preview only. The action shell remains non-clickable and cannot call routes, fetch, fill, review, confirm, submit, or place orders.",
      status: "action_shell_ready_internal_disabled",
      visibleShellModel: isRecord(visibleShellModel) ? visibleShellModel : undefined,
      warnings: safeStringArray(apiCallIntent.warnings),
    });
  }

  return buildModel({
    actionShellEnabled,
    actionShellId,
    apiCallIntent,
    blockedReasons: ["unknown API call intent status"],
    canRenderActionShell: true,
    mode,
    now,
    reason:
      "Explicit API call intent metadata has an unknown status, so the disabled action shell remains unknown and non-executing.",
    status: "unknown",
    visibleShellModel: isRecord(visibleShellModel) ? visibleShellModel : undefined,
    warnings: safeStringArray(apiCallIntent.warnings),
  });
}
