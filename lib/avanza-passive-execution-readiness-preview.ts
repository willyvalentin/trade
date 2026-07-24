export type AvanzaPassiveExecutionReadinessPreviewStatus =
  | "ready_passive_preview"
  | "incomplete_profile"
  | "local_dev_only"
  | "blocked"
  | "unknown";

export type AvanzaPassiveExecutionReadinessPreviewSource =
  | "fixture"
  | "recommendation"
  | "live_position"
  | "manual_review"
  | "unknown";

export type AvanzaPassiveExecutionReadinessPreviewSide =
  | "buy"
  | "sell"
  | "unknown";

export type AvanzaPassiveExecutionReadinessPreviewSafetyFlags = {
  previewOnly: true;
  canShowReadiness: true;
  canStartHandoff: false;
  canPrepareOrder: false;
  canRunSmokeTestFromUi: false;
  canCallApiRoute: false;
  canFetch: false;
  canPoll: false;
  canUseBrowserAutomation: false;
  canAccessCredentials: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canSubmitOrder: false;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canWriteSupabase: false;
  canClaimProductionReady: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaPassiveExecutionReadinessPreviewModel = {
  previewId: string;
  createdAt: string;
  status: AvanzaPassiveExecutionReadinessPreviewStatus;
  label: string;
  reason: string;
  source: AvanzaPassiveExecutionReadinessPreviewSource;
  selectedTicker?: string;
  selectedSide?: AvanzaPassiveExecutionReadinessPreviewSide;
  profileReady: boolean;
  loginModeled: boolean;
  instrumentSearchModeled: boolean;
  orderPrepModeled: boolean;
  settlementModeled: boolean;
  localDevOnly: boolean;
  tradeUiExecutionWired: false;
  apiRouteWired: false;
  browserAutomationWired: false;
  smokeTestRunnableFromUi: false;
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaPassiveExecutionReadinessPreviewSafetyFlags;
};

export type AvanzaPassiveExecutionReadinessPreviewInput = {
  previewId?: string;
  now?: string;
  source?: AvanzaPassiveExecutionReadinessPreviewSource;
  selectedTicker?: string;
  selectedSide?: AvanzaPassiveExecutionReadinessPreviewSide;
  profileReady?: boolean;
  loginReady?: boolean;
  orderPrepReady?: boolean;
  instrumentSearchReady?: boolean;
  settlementReady?: boolean;
  localDevOnly?: boolean;
  statusOverride?: AvanzaPassiveExecutionReadinessPreviewStatus;
  label?: string;
  reason?: string;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";

export const avanzaPassiveExecutionReadinessPreviewSafetyFlags:
  AvanzaPassiveExecutionReadinessPreviewSafetyFlags = {
    previewOnly: true,
    canShowReadiness: true,
    canStartHandoff: false,
    canPrepareOrder: false,
    canRunSmokeTestFromUi: false,
    canCallApiRoute: false,
    canFetch: false,
    canPoll: false,
    canUseBrowserAutomation: false,
    canAccessCredentials: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canSubmitOrder: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canWriteSupabase: false,
    canClaimProductionReady: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;
  const text = value.trim();

  return text ? text : undefined;
}

function safeTextArray(values: unknown): string[] {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        const text = safeText(value);

        return text ? [text] : [];
      })
    : [];
}

function normalizeSource(
  source: AvanzaPassiveExecutionReadinessPreviewInput["source"],
): AvanzaPassiveExecutionReadinessPreviewSource {
  if (
    source === "fixture" ||
    source === "recommendation" ||
    source === "live_position" ||
    source === "manual_review"
  ) {
    return source;
  }

  return "unknown";
}

function normalizeSide(
  side: AvanzaPassiveExecutionReadinessPreviewInput["selectedSide"],
): AvanzaPassiveExecutionReadinessPreviewSide | undefined {
  if (side === "buy" || side === "sell" || side === "unknown") return side;

  return undefined;
}

function inferStatus(input: {
  profileReady: boolean;
  loginModeled: boolean;
  instrumentSearchModeled: boolean;
  orderPrepModeled: boolean;
  settlementModeled: boolean;
  localDevOnly: boolean;
  blockedReasons: readonly string[];
}): AvanzaPassiveExecutionReadinessPreviewStatus {
  if (input.blockedReasons.length > 0) return "blocked";
  if (!input.profileReady) return "incomplete_profile";
  if (
    input.profileReady &&
    input.loginModeled &&
    input.instrumentSearchModeled &&
    input.orderPrepModeled &&
    input.settlementModeled
  ) {
    return input.localDevOnly ? "ready_passive_preview" : "local_dev_only";
  }

  return "local_dev_only";
}

function defaultReason(status: AvanzaPassiveExecutionReadinessPreviewStatus) {
  if (status === "ready_passive_preview") {
    return "Execution readiness is visible as a passive preview only.";
  }
  if (status === "incomplete_profile") {
    return "Ture Settings profile readiness is incomplete.";
  }
  if (status === "local_dev_only") {
    return "Readiness is modeled for local-dev visibility only.";
  }
  if (status === "blocked") {
    return "Readiness preview is blocked by a hard safety condition.";
  }

  return "Readiness preview state is unknown.";
}

export function buildAvanzaPassiveExecutionReadinessPreview(
  input: AvanzaPassiveExecutionReadinessPreviewInput = {},
): AvanzaPassiveExecutionReadinessPreviewModel {
  const source = normalizeSource(input.source);
  const profileReady = input.profileReady === true;
  const loginModeled = input.loginReady !== false;
  const instrumentSearchModeled =
    input.instrumentSearchReady ?? input.orderPrepReady ?? true;
  const orderPrepModeled = input.orderPrepReady !== false;
  const settlementModeled = input.settlementReady !== false;
  const localDevOnly = input.localDevOnly !== false;
  const warnings = safeTextArray(input.warnings);
  const blockedReasons = safeTextArray(input.blockedReasons);
  const status =
    input.statusOverride ??
    inferStatus({
      blockedReasons,
      instrumentSearchModeled,
      localDevOnly,
      loginModeled,
      orderPrepModeled,
      profileReady,
      settlementModeled,
    });

  return {
    previewId: input.previewId ?? `avanza-passive-readiness-${source}`,
    createdAt: input.now ?? defaultCreatedAt,
    status,
    label: input.label ?? "Avanza Execution Readiness",
    reason: input.reason ?? defaultReason(status),
    source,
    selectedTicker: safeText(input.selectedTicker),
    selectedSide: normalizeSide(input.selectedSide),
    profileReady,
    loginModeled,
    instrumentSearchModeled,
    orderPrepModeled,
    settlementModeled,
    localDevOnly,
    tradeUiExecutionWired: false,
    apiRouteWired: false,
    browserAutomationWired: false,
    smokeTestRunnableFromUi: false,
    warnings,
    blockedReasons,
    safetyFlags: avanzaPassiveExecutionReadinessPreviewSafetyFlags,
  };
}
