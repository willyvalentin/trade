export type AvanzaLocalPlaywrightPageActionBindingStatus =
  | "disabled"
  | "ready"
  | "action_executed"
  | "action_blocked"
  | "action_failed"
  | "snapshot_read"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaLocalPlaywrightPageActionType =
  | "click_by_text"
  | "fill_by_label"
  | "wait_for_state"
  | "read_page_snapshot";

export type AvanzaLocalPlaywrightPageActionBindingMode =
  | "disabled"
  | "local_dev_mock_page"
  | "local_dev_playwright_page";

export type AvanzaLocalPlaywrightLikePage = {
  getByText?: (text: string) => { click: () => Promise<void> };
  getByLabel?: (label: string) => { fill: (value: string) => Promise<void> };
  locator?: (selector: string) => unknown;
  title?: () => Promise<string>;
  url?: () => string;
  textContent?: (selector: string) => Promise<string | null>;
  waitForLoadState?: (state?: string) => Promise<void>;
  waitForTimeout?: (ms: number) => Promise<void>;
};

export type AvanzaLocalPlaywrightPageActionBindingConfig = {
  bindingId?: string;
  mode?: AvanzaLocalPlaywrightPageActionBindingMode;
  enabled?: boolean;
  localDevOnly?: true;
  allowClickByText?: boolean;
  allowFillByLabel?: boolean;
  allowWaitForState?: boolean;
  allowReadPageSnapshot?: boolean;
  allowNavigation?: false | boolean;
  allowCookieRead?: false | boolean;
  allowSessionExport?: false | boolean;
  allowOrderSubmit?: false | boolean;
  allowFinalBuyClick?: false | boolean;
  allowFinalSellClick?: false | boolean;
  allowBankIdAutomation?: false | boolean;
  redactSnapshotText?: true | boolean;
  forceError?: boolean;
  statusOverride?: AvanzaLocalPlaywrightPageActionBindingStatus;
  modeledActionType?: AvanzaLocalPlaywrightPageActionType;
  modeledActionStatus?: AvanzaLocalPlaywrightPageActionBindingStatus;
  modeledValueUsed?: boolean;
  modeledSnapshotRedacted?: boolean;
  now?: string;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaLocalPlaywrightPageActionBindingDependencies = {
  page?: AvanzaLocalPlaywrightLikePage;
};

export type AvanzaLocalPlaywrightPageActionBindingSafetyFlags = {
  bindingEnabled: boolean;
  localDevOnly: true;
  canClickByText: boolean;
  canFillByLabel: boolean;
  canWaitForState: boolean;
  canReadPageSnapshot: boolean;
  canNavigate: false;
  canReadCookies: false;
  canExportSession: false;
  canSubmitOrder: false;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  credentialValuesVisibleInReports: false;
  canLogCredentialMaterial: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaLocalPlaywrightPageActionResult =
  AvanzaLocalPlaywrightPageActionBindingSafetyFlags & {
    resultId: string;
    createdAt: string;
    status: AvanzaLocalPlaywrightPageActionBindingStatus;
    actionType: AvanzaLocalPlaywrightPageActionType;
    ok: boolean;
    label: string;
    reason: string;
    valueUsed: boolean;
    valueVisible: false;
    snapshotRedacted: boolean;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaLocalPlaywrightPageActionBindingSafetyFlags;
  };

export type AvanzaLocalPlaywrightPageSnapshotResult =
  AvanzaLocalPlaywrightPageActionResult & {
    snapshotTitle: string;
    snapshotUrl: string;
    snapshotTextPreview: string;
  };

export type AvanzaLocalPlaywrightPageActionBindingState =
  AvanzaLocalPlaywrightPageActionBindingSafetyFlags & {
    bindingId: string;
    createdAt: string;
    mode: AvanzaLocalPlaywrightPageActionBindingMode;
    status: AvanzaLocalPlaywrightPageActionBindingStatus;
    label: string;
    reason: string;
    actionType: AvanzaLocalPlaywrightPageActionType;
    valueUsed: boolean;
    valueVisible: false;
    snapshotRedacted: boolean;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaLocalPlaywrightPageActionBindingSafetyFlags;
  };

export type AvanzaLocalPlaywrightPageActionBinding = {
  getState: () => AvanzaLocalPlaywrightPageActionBindingState;
  clickByText: (text: string) => Promise<{ ok: boolean; reason?: string }>;
  fillByLabel: (
    label: string,
    value: string,
  ) => Promise<{ ok: boolean; reason?: string }>;
  waitForState: (stateHint: string) => Promise<{ ok: boolean; reason?: string }>;
  readPageSnapshot: () => Promise<unknown>;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid\s*qr\s*data|broker\s*secret|cookie\s*[:=]|credential\s*[:=]|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret\s*[:=]|session\s*[:=]|storage\s*[:=]|token\s*[:=]/i;

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (!text) return undefined;
  if (unsafeTextPattern.test(text)) return undefined;

  return text;
}

function safeStringArray(values: unknown) {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        const text = safeText(value);

        return text ? [text] : [];
      })
    : [];
}

function modeFor(
  mode: AvanzaLocalPlaywrightPageActionBindingConfig["mode"],
): AvanzaLocalPlaywrightPageActionBindingMode {
  if (mode === "local_dev_mock_page" || mode === "local_dev_playwright_page") {
    return mode;
  }

  return "disabled";
}

function bindingId(config: AvanzaLocalPlaywrightPageActionBindingConfig) {
  return safeText(config.bindingId) ?? "avanza-local-playwright-page-action-binding";
}

function createdAt(config: AvanzaLocalPlaywrightPageActionBindingConfig) {
  return safeText(config.now) ?? defaultCreatedAt;
}

function hasForbiddenConfig(config: AvanzaLocalPlaywrightPageActionBindingConfig) {
  return (
    config.allowNavigation === true ||
    config.allowCookieRead === true ||
    config.allowSessionExport === true ||
    config.allowOrderSubmit === true ||
    config.allowFinalBuyClick === true ||
    config.allowFinalSellClick === true ||
    config.allowBankIdAutomation === true
  );
}

function statusFor(config: AvanzaLocalPlaywrightPageActionBindingConfig) {
  if (config.statusOverride) return config.statusOverride;
  if (config.forceError === true) return "error";
  if (config.enabled !== true || modeFor(config.mode) === "disabled") {
    return "disabled";
  }
  if (hasForbiddenConfig(config)) return "blocked";

  return "ready";
}

function labelFor(status: AvanzaLocalPlaywrightPageActionBindingStatus) {
  switch (status) {
    case "disabled":
      return "Playwright page action binding disabled";
    case "ready":
      return "Playwright page action binding ready";
    case "action_executed":
      return "Injected page action executed";
    case "action_blocked":
      return "Injected page action blocked";
    case "action_failed":
      return "Injected page action failed";
    case "snapshot_read":
      return "Injected page snapshot read";
    case "blocked":
      return "Playwright page action binding blocked";
    case "error":
      return "Playwright page action binding error";
    case "unknown":
      return "Playwright page action binding unknown";
  }
}

function reasonFor(status: AvanzaLocalPlaywrightPageActionBindingStatus) {
  switch (status) {
    case "disabled":
      return "Binding is disabled.";
    case "ready":
      return "Binding can adapt explicit injected Playwright-like page methods.";
    case "action_executed":
      return "Injected page method completed; reports hide inputs.";
    case "action_blocked":
      return "Action is blocked by explicit allow flags.";
    case "action_failed":
      return "Injected page method failed without leaking inputs.";
    case "snapshot_read":
      return "Injected page snapshot was read with redacted text output.";
    case "blocked":
      return "Forbidden navigation, cookie/session, BankID, final click, or order config was blocked.";
    case "error":
      return "Binding received an error input.";
    case "unknown":
      return "Binding input is unknown.";
  }
}

function blockedReasonsFor(
  config: AvanzaLocalPlaywrightPageActionBindingConfig,
  status: AvanzaLocalPlaywrightPageActionBindingStatus,
) {
  const reasons = [...safeStringArray(config.blockedReasons)];

  if (config.allowNavigation === true) reasons.push("Navigation is forbidden.");
  if (config.allowCookieRead === true) reasons.push("Cookie reads are forbidden.");
  if (config.allowSessionExport === true) reasons.push("Session export is forbidden.");
  if (config.allowOrderSubmit === true) reasons.push("Order submission is forbidden.");
  if (config.allowFinalBuyClick === true) reasons.push("Final buy click is forbidden.");
  if (config.allowFinalSellClick === true) reasons.push("Final sell click is forbidden.");
  if (config.allowBankIdAutomation === true) {
    reasons.push("BankID automation is forbidden.");
  }
  if (status === "action_blocked") reasons.push("Action blocked by config.");
  if (status === "action_failed") reasons.push("Injected page action failed.");

  return reasons;
}

function safetyFlags(
  config: AvanzaLocalPlaywrightPageActionBindingConfig,
  status: AvanzaLocalPlaywrightPageActionBindingStatus,
): AvanzaLocalPlaywrightPageActionBindingSafetyFlags {
  const bindingEnabled =
    config.enabled === true &&
    modeFor(config.mode) !== "disabled" &&
    !["disabled", "blocked", "error", "unknown"].includes(status);

  return {
    bindingEnabled,
    localDevOnly: true,
    canClickByText: bindingEnabled && config.allowClickByText === true,
    canFillByLabel: bindingEnabled && config.allowFillByLabel === true,
    canWaitForState: bindingEnabled && config.allowWaitForState === true,
    canReadPageSnapshot:
      bindingEnabled && config.allowReadPageSnapshot === true,
    canNavigate: false,
    canReadCookies: false,
    canExportSession: false,
    canSubmitOrder: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    credentialValuesVisibleInReports: false,
    canLogCredentialMaterial: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function stateFrom(
  config: AvanzaLocalPlaywrightPageActionBindingConfig,
  status: AvanzaLocalPlaywrightPageActionBindingStatus,
): AvanzaLocalPlaywrightPageActionBindingState {
  const flags = safetyFlags(config, status);

  return {
    bindingId: bindingId(config),
    createdAt: createdAt(config),
    mode: modeFor(config.mode),
    status,
    label: labelFor(status),
    reason: reasonFor(status),
    actionType: config.modeledActionType ?? "click_by_text",
    valueUsed: config.modeledValueUsed === true,
    valueVisible: false,
    snapshotRedacted:
      config.modeledSnapshotRedacted === true ||
      config.redactSnapshotText !== false,
    warnings: safeStringArray(config.warnings),
    blockedReasons: blockedReasonsFor(config, status),
    safetyFlags: flags,
    ...flags,
  };
}

function resultFrom(
  config: AvanzaLocalPlaywrightPageActionBindingConfig,
  actionType: AvanzaLocalPlaywrightPageActionType,
  status: AvanzaLocalPlaywrightPageActionBindingStatus,
  options: {
    ok?: boolean;
    reason?: string;
    valueUsed?: boolean;
    snapshotRedacted?: boolean;
  } = {},
): AvanzaLocalPlaywrightPageActionResult {
  const flags = safetyFlags(config, status);

  return {
    resultId: `${bindingId(config)}-${actionType}`,
    createdAt: createdAt(config),
    status,
    actionType,
    ok: options.ok === true,
    label: labelFor(status),
    reason: safeText(options.reason) ?? reasonFor(status),
    valueUsed: options.valueUsed === true,
    valueVisible: false,
    snapshotRedacted:
      options.snapshotRedacted === true || config.redactSnapshotText !== false,
    warnings: safeStringArray(config.warnings),
    blockedReasons: blockedReasonsFor(config, status),
    safetyFlags: flags,
    ...flags,
  };
}

function blockedResult(
  config: AvanzaLocalPlaywrightPageActionBindingConfig,
  actionType: AvanzaLocalPlaywrightPageActionType,
  reason: string,
) {
  return resultFrom(config, actionType, "action_blocked", {
    ok: false,
    reason,
  });
}

function failedResult(
  config: AvanzaLocalPlaywrightPageActionBindingConfig,
  actionType: AvanzaLocalPlaywrightPageActionType,
  reason: string,
) {
  return resultFrom(config, actionType, "action_failed", {
    ok: false,
    reason,
  });
}

function toDependencyResult(result: AvanzaLocalPlaywrightPageActionResult) {
  return result.ok ? { ok: true } : { ok: false, reason: result.reason };
}

export function buildAvanzaLocalPlaywrightPageActionBindingState(
  config: AvanzaLocalPlaywrightPageActionBindingConfig = {},
): AvanzaLocalPlaywrightPageActionBindingState {
  return stateFrom(config, config.modeledActionStatus ?? statusFor(config));
}

export function createAvanzaLocalPlaywrightPageActionBinding(
  config: AvanzaLocalPlaywrightPageActionBindingConfig = {},
  dependencies: AvanzaLocalPlaywrightPageActionBindingDependencies = {},
): AvanzaLocalPlaywrightPageActionBinding {
  const state = buildAvanzaLocalPlaywrightPageActionBindingState(config);
  const page = dependencies.page;

  return {
    getState: () => state,
    clickByText: async (text: string) => {
      if (!state.canClickByText) {
        return toDependencyResult(
          blockedResult(config, "click_by_text", "clickByText is disabled."),
        );
      }

      try {
        await page?.getByText?.(text).click();

        return toDependencyResult(
          resultFrom(config, "click_by_text", "action_executed", { ok: true }),
        );
      } catch {
        return toDependencyResult(
          failedResult(config, "click_by_text", "Injected click failed."),
        );
      }
    },
    fillByLabel: async (label: string, value: string) => {
      if (!state.canFillByLabel) {
        return toDependencyResult(
          blockedResult(config, "fill_by_label", "fillByLabel is disabled."),
        );
      }

      try {
        await page?.getByLabel?.(label).fill(value);

        return toDependencyResult(
          resultFrom(config, "fill_by_label", "action_executed", {
            ok: true,
            valueUsed: true,
          }),
        );
      } catch {
        return toDependencyResult(
          failedResult(config, "fill_by_label", "Injected fill failed."),
        );
      }
    },
    waitForState: async (stateHint: string) => {
      if (!state.canWaitForState) {
        return toDependencyResult(
          blockedResult(config, "wait_for_state", "waitForState is disabled."),
        );
      }

      try {
        if (page?.waitForLoadState) {
          await page.waitForLoadState(safeText(stateHint) ?? undefined);
        } else {
          await page?.waitForTimeout?.(100);
        }

        return toDependencyResult(
          resultFrom(config, "wait_for_state", "action_executed", { ok: true }),
        );
      } catch {
        return toDependencyResult(
          failedResult(config, "wait_for_state", "Injected wait failed."),
        );
      }
    },
    readPageSnapshot: async () => {
      if (!state.canReadPageSnapshot) {
        return blockedResult(
          config,
          "read_page_snapshot",
          "readPageSnapshot is disabled.",
        );
      }

      try {
        const title = safeText(await page?.title?.()) ?? "redacted";
        const url = safeText(page?.url?.()) ?? "redacted";
        const textPreview = config.redactSnapshotText === false
          ? safeText(await page?.textContent?.("body")) ?? "redacted"
          : "redacted";

        return {
          ...resultFrom(config, "read_page_snapshot", "snapshot_read", {
            ok: true,
            snapshotRedacted: true,
          }),
          snapshotTitle: title,
          snapshotUrl: url,
          snapshotTextPreview: textPreview,
        } satisfies AvanzaLocalPlaywrightPageSnapshotResult;
      } catch {
        return failedResult(
          config,
          "read_page_snapshot",
          "Injected snapshot read failed.",
        );
      }
    },
  };
}

export const avanzaLocalPlaywrightPageActionBindingDefaultConfig:
  AvanzaLocalPlaywrightPageActionBindingConfig = {
    bindingId: "avanza-local-playwright-page-action-binding",
    mode: "disabled",
    enabled: false,
    localDevOnly: true,
    allowClickByText: false,
    allowFillByLabel: false,
    allowWaitForState: false,
    allowReadPageSnapshot: false,
    allowNavigation: false,
    allowCookieRead: false,
    allowSessionExport: false,
    allowOrderSubmit: false,
    allowFinalBuyClick: false,
    allowFinalSellClick: false,
    allowBankIdAutomation: false,
    redactSnapshotText: true,
    now: defaultCreatedAt,
  };
