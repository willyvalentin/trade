export type AvanzaDisabledInternalPrepareButtonShellStatus =
  | "prepare_shell_hidden"
  | "prepare_shell_disabled"
  | "prepare_shell_blocked"
  | "prepare_shell_ready_internal_disabled"
  | "prepare_shell_error"
  | "unknown";

export type AvanzaDisabledInternalPrepareButtonShellMode =
  | "hidden"
  | "disabled"
  | "internal_preview";

export type AvanzaDisabledInternalPrepareButtonShellSafetyFlags = {
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
  canRenderShell: boolean;
  canSubmitOrder: false;
  canWriteSupabaseExecution: false;
  controlsEnabled: false;
  finalHumanClickRequired: true;
  gateLocked: true;
  shellEnabled: boolean;
  userMustConfirm: true;
};

export type AvanzaDisabledInternalPrepareButtonShellModel =
  AvanzaDisabledInternalPrepareButtonShellSafetyFlags & {
    accountLabel?: string;
    blockedReasons: string[];
    copy: string[];
    createdAt: string;
    label: string;
    limitPrice?: number;
    mode: AvanzaDisabledInternalPrepareButtonShellMode;
    orderType?: string;
    packageId?: string;
    prepareIntentId?: string;
    quantity?: number;
    reason: string;
    shellId?: string;
    side?: "BUY" | "SELL";
    sourceRecommendationId?: string;
    status: AvanzaDisabledInternalPrepareButtonShellStatus;
    symbol?: string;
    ticker?: string;
    warnings: string[];
  };

export type BuildAvanzaDisabledInternalPrepareButtonShellInput = {
  mode?: AvanzaDisabledInternalPrepareButtonShellMode;
  now?: string;
  prepareIntent?: unknown;
  shellEnabled?: boolean;
  shellId?: string;
};

const copy = [
  "internal preview",
  "disabled",
  "no broker action",
  "no order submission",
  "final human confirmation required",
];

const blockedPrepareIntentStatuses = new Set([
  "package_blocked",
  "prepare_blocked",
  "route_disabled",
]);

const disabledPrepareIntentStatuses = new Set([
  "package_unavailable",
  "prepare_disabled",
]);

const failedPrepareIntentStatuses = new Set(["prepare_failed"]);

const safeStringBlockPattern =
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

function buildSafetyFlags({
  canRenderShell,
  shellEnabled,
}: {
  canRenderShell: boolean;
  shellEnabled: boolean;
}): AvanzaDisabledInternalPrepareButtonShellSafetyFlags {
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
    canRenderShell,
    canSubmitOrder: false,
    canWriteSupabaseExecution: false,
    controlsEnabled: false,
    finalHumanClickRequired: true,
    gateLocked: true,
    shellEnabled,
    userMustConfirm: true,
  };
}

function statusLabel(status: AvanzaDisabledInternalPrepareButtonShellStatus) {
  const labels: Record<AvanzaDisabledInternalPrepareButtonShellStatus, string> =
    {
      prepare_shell_blocked: "Disabled internal prepare shell blocked",
      prepare_shell_disabled: "Disabled internal prepare shell disabled",
      prepare_shell_error: "Disabled internal prepare shell error",
      prepare_shell_hidden: "Disabled internal prepare shell hidden",
      prepare_shell_ready_internal_disabled:
        "Disabled internal prepare shell ready internally",
      unknown: "Disabled internal prepare shell unknown",
    };

  return labels[status];
}

function buildModel({
  blockedReasons = [],
  canRenderShell,
  mode,
  now,
  prepareIntent,
  reason,
  shellEnabled,
  shellId,
  status,
  warnings = [],
}: {
  blockedReasons?: string[];
  canRenderShell: boolean;
  mode: AvanzaDisabledInternalPrepareButtonShellMode;
  now: string;
  prepareIntent?: Record<string, unknown>;
  reason: string;
  shellEnabled: boolean;
  shellId?: string;
  status: AvanzaDisabledInternalPrepareButtonShellStatus;
  warnings?: string[];
}): AvanzaDisabledInternalPrepareButtonShellModel {
  const ticker = safeText(prepareIntent?.ticker);
  const symbol = safeText(prepareIntent?.symbol) ?? ticker;
  const safeShellId = safeText(shellId);
  const safePrepareIntentId = safeText(prepareIntent?.prepareIntentId);
  const packageId = safeText(prepareIntent?.packageId);
  const sourceRecommendationId = safeText(
    prepareIntent?.sourceRecommendationId,
  );
  const orderType = safeText(prepareIntent?.orderType);
  const accountLabel = safeText(prepareIntent?.accountLabel);
  const side = normalizeSide(prepareIntent?.side);
  const quantity = finitePositiveNumber(prepareIntent?.quantity);
  const limitPrice = finitePositiveNumber(prepareIntent?.limitPrice);

  return {
    ...(accountLabel ? { accountLabel } : {}),
    ...(limitPrice ? { limitPrice } : {}),
    ...(orderType ? { orderType } : {}),
    ...(packageId ? { packageId } : {}),
    ...(quantity ? { quantity } : {}),
    ...(safePrepareIntentId ? { prepareIntentId: safePrepareIntentId } : {}),
    ...(safeShellId ? { shellId: safeShellId } : {}),
    ...(side ? { side } : {}),
    ...(sourceRecommendationId ? { sourceRecommendationId } : {}),
    ...(symbol ? { symbol } : {}),
    ...(ticker ? { ticker } : {}),
    ...buildSafetyFlags({ canRenderShell, shellEnabled }),
    blockedReasons,
    copy,
    createdAt: now,
    label: statusLabel(status),
    mode,
    reason,
    status,
    warnings,
  };
}

export function buildAvanzaDisabledInternalPrepareButtonShell({
  mode = "hidden",
  now = "not_provided",
  prepareIntent,
  shellEnabled = false,
  shellId,
}: BuildAvanzaDisabledInternalPrepareButtonShellInput = {}): AvanzaDisabledInternalPrepareButtonShellModel {
  if (!shellEnabled || mode === "hidden") {
    return buildModel({
      blockedReasons: ["prepare shell hidden"],
      canRenderShell: false,
      mode,
      now,
      reason:
        "Disabled internal prepare shell is hidden by default. No UI wiring, button, API route call, bridge call, browser control, fill, review, confirmation, submit, order, credential handling, or Supabase write is available.",
      shellEnabled,
      shellId,
      status: "prepare_shell_hidden",
    });
  }

  if (!isRecord(prepareIntent)) {
    return buildModel({
      blockedReasons: ["prepare intent unavailable"],
      canRenderShell: true,
      mode,
      now,
      reason:
        "No explicit safe prepare intent metadata was provided for the disabled internal prepare shell.",
      shellEnabled,
      shellId,
      status: "prepare_shell_disabled",
    });
  }

  const prepareStatus = nonEmptyString(prepareIntent.status);
  const warnings = safeStringArray(prepareIntent.warnings);
  const blockedReasons = safeStringArray(prepareIntent.blockedReasons);

  if (prepareStatus === "prepare_ready_internal") {
    return buildModel({
      canRenderShell: true,
      mode,
      now,
      prepareIntent,
      reason:
        "Explicit prepare intent metadata is internally ready, but the prepare shell remains disabled and cannot click, call a route, fill, review, confirm, submit, or place an order.",
      shellEnabled,
      shellId,
      status: "prepare_shell_ready_internal_disabled",
      warnings,
    });
  }

  if (prepareStatus && disabledPrepareIntentStatuses.has(prepareStatus)) {
    return buildModel({
      blockedReasons:
        blockedReasons.length > 0 ? blockedReasons : ["prepare intent disabled"],
      canRenderShell: true,
      mode,
      now,
      prepareIntent,
      reason:
        "Explicit prepare intent metadata is disabled, so the shell can only describe disabled internal preview metadata.",
      shellEnabled,
      shellId,
      status: "prepare_shell_disabled",
      warnings,
    });
  }

  if (prepareStatus && blockedPrepareIntentStatuses.has(prepareStatus)) {
    return buildModel({
      blockedReasons:
        blockedReasons.length > 0 ? blockedReasons : ["prepare intent blocked"],
      canRenderShell: true,
      mode,
      now,
      prepareIntent,
      reason:
        "Explicit prepare intent metadata is blocked, so the shell remains disabled.",
      shellEnabled,
      shellId,
      status: "prepare_shell_blocked",
      warnings,
    });
  }

  if (prepareStatus && failedPrepareIntentStatuses.has(prepareStatus)) {
    return buildModel({
      blockedReasons:
        blockedReasons.length > 0 ? blockedReasons : ["prepare intent failed"],
      canRenderShell: true,
      mode,
      now,
      prepareIntent,
      reason:
        "Explicit prepare intent metadata failed, so the shell remains disabled and reports an error state.",
      shellEnabled,
      shellId,
      status: "prepare_shell_error",
      warnings,
    });
  }

  return buildModel({
    blockedReasons:
      blockedReasons.length > 0 ? blockedReasons : ["prepare intent unknown"],
    canRenderShell: true,
    mode,
    now,
    prepareIntent,
    reason:
      "Explicit prepare intent metadata could not be classified safely, so the shell remains disabled.",
    shellEnabled,
    shellId,
    status: "unknown",
    warnings,
  });
}
