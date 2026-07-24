export type AvanzaLocalBrowserAgentRuntimeMode = "disabled" | "local_dev";

export type AvanzaLocalBrowserAgentRuntimeStatus =
  | "runtime_disabled"
  | "runtime_unavailable"
  | "runtime_ready_local_dev"
  | "runtime_blocked"
  | "runtime_error"
  | "unknown";

export type AvanzaLocalBrowserAgentRuntimeSafetyFlags = {
  runtimeEnabled: boolean;
  localDevOnly: boolean;
  canLaunchBrowser: boolean;
  canConnectToExistingBrowser: boolean;
  canNavigate: boolean;
  canReadPage: boolean;
  canFillForm: false;
  canClick: false;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canSubmitOrder: false;
  canHandleCredentials: false;
  canReadCookies: false;
  canExportSession: false;
  canBypassBankId: false;
  canWriteSupabaseExecution: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaLocalBrowserAgentRuntimeConfig = {
  allowConnectToExistingBrowser?: boolean;
  allowLaunchBrowser?: boolean;
  allowNavigate?: boolean;
  allowReadPage?: boolean;
  browserProvider?: "playwright" | "unknown";
  createdAt?: string;
  forceError?: boolean;
  label?: string;
  mode?: AvanzaLocalBrowserAgentRuntimeMode;
  reason?: string;
  runtimeAvailable?: boolean;
  runtimeBlocked?: boolean;
  runtimeEnabled?: boolean;
  runtimeId?: string;
  statusOverride?: AvanzaLocalBrowserAgentRuntimeStatus;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaLocalBrowserAgentRuntimeState =
  AvanzaLocalBrowserAgentRuntimeSafetyFlags & {
    runtimeId: string;
    createdAt: string;
    mode: AvanzaLocalBrowserAgentRuntimeMode;
    status: AvanzaLocalBrowserAgentRuntimeStatus;
    label: string;
    reason: string;
    browserProvider: "playwright" | "unknown";
    localOnly: boolean;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaLocalBrowserAgentRuntimeSafetyFlags;
  };

const defaultCreatedAt = "2026-07-05T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid|broker\s*secret|cookie|credential|password|secret|session|storage|token/i;

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (!text) return undefined;
  if (unsafeTextPattern.test(text) || /\d{5,}/.test(text)) return undefined;

  return text;
}

function safeStringArray(values: readonly string[] | undefined) {
  return Array.isArray(values)
    ? values.flatMap((value) => {
      const text = safeText(value);

      return text ? [text] : [];
    })
    : [];
}

function buildSafetyFlags(
  config: AvanzaLocalBrowserAgentRuntimeConfig,
  status: AvanzaLocalBrowserAgentRuntimeStatus,
): AvanzaLocalBrowserAgentRuntimeSafetyFlags {
  const runtimeEnabled =
    config.mode === "local_dev" &&
    config.runtimeEnabled === true &&
    status === "runtime_ready_local_dev";

  return {
    runtimeEnabled,
    localDevOnly: config.mode === "local_dev" && runtimeEnabled,
    canLaunchBrowser:
      runtimeEnabled === true && config.allowLaunchBrowser === true,
    canConnectToExistingBrowser:
      runtimeEnabled === true && config.allowConnectToExistingBrowser === true,
    canNavigate: runtimeEnabled === true && config.allowNavigate === true,
    canReadPage: runtimeEnabled === true && config.allowReadPage === true,
    canFillForm: false,
    canClick: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canSubmitOrder: false,
    canHandleCredentials: false,
    canReadCookies: false,
    canExportSession: false,
    canBypassBankId: false,
    canWriteSupabaseExecution: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function deriveStatus(
  config: AvanzaLocalBrowserAgentRuntimeConfig,
  blockedReasons: readonly string[],
): AvanzaLocalBrowserAgentRuntimeStatus {
  if (config.statusOverride) return config.statusOverride;
  if (config.forceError === true) return "runtime_error";
  if (config.runtimeBlocked === true || blockedReasons.length > 0) {
    return "runtime_blocked";
  }
  if (config.mode !== "local_dev" || config.runtimeEnabled !== true) {
    return "runtime_disabled";
  }
  if (config.runtimeAvailable === false) return "runtime_unavailable";
  if (config.browserProvider === "unknown") return "runtime_unavailable";

  return "runtime_ready_local_dev";
}

function labelFor(status: AvanzaLocalBrowserAgentRuntimeStatus) {
  switch (status) {
    case "runtime_disabled":
      return "Runtime disabled";
    case "runtime_unavailable":
      return "Runtime unavailable";
    case "runtime_ready_local_dev":
      return "Runtime ready for local dev modeling";
    case "runtime_blocked":
      return "Runtime blocked";
    case "runtime_error":
      return "Runtime error";
    case "unknown":
      return "Runtime unknown";
  }
}

function reasonFor(status: AvanzaLocalBrowserAgentRuntimeStatus) {
  switch (status) {
    case "runtime_disabled":
      return "Local browser agent runtime is disabled by default.";
    case "runtime_unavailable":
      return "Local browser agent runtime is not available for this explicit input.";
    case "runtime_ready_local_dev":
      return "Local browser runtime readiness is modeled for local dev only; no browser is launched.";
    case "runtime_blocked":
      return "Local browser agent runtime is blocked by explicit safety input.";
    case "runtime_error":
      return "Local browser agent runtime modeling returned an error state.";
    case "unknown":
      return "Local browser agent runtime state is unknown.";
  }
}

export function buildAvanzaLocalBrowserAgentRuntimeState(
  input: AvanzaLocalBrowserAgentRuntimeConfig = {},
): AvanzaLocalBrowserAgentRuntimeState {
  const config: AvanzaLocalBrowserAgentRuntimeConfig = {
    browserProvider: "unknown",
    mode: "disabled",
    runtimeAvailable: false,
    runtimeEnabled: false,
    ...input,
  };
  const warnings = safeStringArray(config.warnings);
  const blockedReasons = safeStringArray(config.blockedReasons);
  const status = deriveStatus(config, blockedReasons);
  const safetyFlags = buildSafetyFlags(config, status);
  const runtimeId =
    safeText(config.runtimeId) ??
    (status === "runtime_ready_local_dev"
      ? "avanza-local-browser-runtime-local-dev"
      : "avanza-local-browser-runtime-disabled");
  const label = safeText(config.label) ?? labelFor(status);
  const reason = safeText(config.reason) ?? reasonFor(status);

  return {
    ...safetyFlags,
    runtimeId,
    createdAt: safeText(config.createdAt) ?? defaultCreatedAt,
    mode: config.mode ?? "disabled",
    status,
    label,
    reason,
    browserProvider: config.browserProvider ?? "unknown",
    localOnly: config.mode === "local_dev" && status === "runtime_ready_local_dev",
    warnings,
    blockedReasons,
    safetyFlags,
  };
}

export function createDisabledAvanzaLocalBrowserAgentRuntime(
  input: AvanzaLocalBrowserAgentRuntimeConfig = {},
) {
  return buildAvanzaLocalBrowserAgentRuntimeState({
    ...input,
    mode: "disabled",
    runtimeEnabled: false,
  });
}

export function createLocalDevAvanzaBrowserAgentRuntime(
  input: AvanzaLocalBrowserAgentRuntimeConfig = {},
) {
  return buildAvanzaLocalBrowserAgentRuntimeState({
    browserProvider: "playwright",
    runtimeAvailable: true,
    ...input,
    mode: "local_dev",
  });
}
