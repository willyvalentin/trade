export type AvanzaLocalPlaywrightOrderPageActionBindingStatus =
  | "disabled"
  | "ready"
  | "action_executed"
  | "action_blocked"
  | "action_failed"
  | "snapshot_read"
  | "order_review_snapshot_read"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaLocalPlaywrightOrderPageActionType =
  | "click_by_text"
  | "fill_by_label"
  | "fill_search_input"
  | "wait_for_search_results"
  | "select_search_result_by_text"
  | "read_instrument_verification_snapshot"
  | "locate_buy_sell_entry"
  | "fill_order_field"
  | "wait_for_order_review_state"
  | "read_order_review_snapshot";

export type AvanzaLocalPlaywrightOrderPageActionBindingMode =
  | "disabled"
  | "local_dev_mock_page"
  | "local_dev_playwright_page";

type AvanzaLocalPlaywrightOrderPageLocator = {
  click?: () => Promise<void>;
  fill?: (value: string) => Promise<void>;
  textContent?: () => Promise<string | null>;
  count?: () => Promise<number>;
};

export type AvanzaLocalPlaywrightOrderPageLikePage = {
  getByText?: (text: string) => { click: () => Promise<void> };
  getByLabel?: (label: string) => { fill: (value: string) => Promise<void> };
  getByPlaceholder?: (
    placeholder: string,
  ) => { fill: (value: string) => Promise<void> };
  locator?: (selector: string) => AvanzaLocalPlaywrightOrderPageLocator;
  title?: () => Promise<string>;
  url?: () => string;
  textContent?: (selector: string) => Promise<string | null>;
  waitForLoadState?: (state?: string) => Promise<void>;
  waitForTimeout?: (ms: number) => Promise<void>;
};

export type AvanzaLocalPlaywrightOrderPageActionBindingConfig = {
  bindingId?: string;
  mode?: AvanzaLocalPlaywrightOrderPageActionBindingMode;
  enabled?: boolean;
  localDevOnly?: true;
  allowClickByText?: boolean;
  allowFillByLabel?: boolean;
  allowFillSearchInput?: boolean;
  allowWaitForSearchResults?: boolean;
  allowSelectSearchResultByText?: boolean;
  allowReadInstrumentVerificationSnapshot?: boolean;
  allowLocateBuySellEntry?: boolean;
  allowFillOrderField?: boolean;
  allowWaitForOrderReviewState?: boolean;
  allowReadOrderReviewSnapshot?: boolean;
  allowAutomaticNavigation?: false | boolean;
  allowCookieRead?: false | boolean;
  allowSessionExport?: false | boolean;
  allowOrderSubmit?: false | boolean;
  allowFinalBuyClick?: false | boolean;
  allowFinalSellClick?: false | boolean;
  allowBankIdAutomation?: false | boolean;
  redactSnapshotText?: true | boolean;
  forceError?: boolean;
  statusOverride?: AvanzaLocalPlaywrightOrderPageActionBindingStatus;
  modeledActionType?: AvanzaLocalPlaywrightOrderPageActionType;
  modeledActionStatus?: AvanzaLocalPlaywrightOrderPageActionBindingStatus;
  modeledValueUsed?: boolean;
  modeledSnapshotRedacted?: boolean;
  now?: string;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaLocalPlaywrightOrderPageActionBindingDependencies = {
  page?: AvanzaLocalPlaywrightOrderPageLikePage;
};

export type AvanzaLocalPlaywrightOrderPageActionBindingSafetyFlags = {
  bindingEnabled: boolean;
  localDevOnly: true;
  canClickByText: boolean;
  canFillByLabel: boolean;
  canFillSearchInput: boolean;
  canWaitForSearchResults: boolean;
  canSelectSearchResultByText: boolean;
  canReadInstrumentVerificationSnapshot: boolean;
  canLocateBuySellEntry: boolean;
  canFillOrderField: boolean;
  canWaitForOrderReviewState: boolean;
  canReadOrderReviewSnapshot: boolean;
  canNavigateAutomatically: false;
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

export type AvanzaLocalPlaywrightOrderPageActionResult =
  AvanzaLocalPlaywrightOrderPageActionBindingSafetyFlags & {
    resultId: string;
    createdAt: string;
    status: AvanzaLocalPlaywrightOrderPageActionBindingStatus;
    actionType: AvanzaLocalPlaywrightOrderPageActionType;
    ok: boolean;
    label: string;
    reason: string;
    valueUsed: boolean;
    valueVisible: false;
    located: boolean;
    snapshotRedacted: boolean;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaLocalPlaywrightOrderPageActionBindingSafetyFlags;
  };

export type AvanzaLocalPlaywrightOrderPageSnapshotResult =
  AvanzaLocalPlaywrightOrderPageActionResult & {
    snapshotTitle: string;
    snapshotUrl: string;
    snapshotTextPreview: string;
    snapshotKind: "instrument_verification" | "order_review";
  };

export type AvanzaLocalPlaywrightOrderPageActionBindingState =
  AvanzaLocalPlaywrightOrderPageActionBindingSafetyFlags & {
    bindingId: string;
    createdAt: string;
    mode: AvanzaLocalPlaywrightOrderPageActionBindingMode;
    status: AvanzaLocalPlaywrightOrderPageActionBindingStatus;
    label: string;
    reason: string;
    actionType: AvanzaLocalPlaywrightOrderPageActionType;
    valueUsed: boolean;
    valueVisible: false;
    located: boolean;
    snapshotRedacted: boolean;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaLocalPlaywrightOrderPageActionBindingSafetyFlags;
  };

export type AvanzaLocalPlaywrightOrderPageActionBinding = {
  getState: () => AvanzaLocalPlaywrightOrderPageActionBindingState;
  clickByText: (text: string) => Promise<{ ok: boolean; reason?: string }>;
  fillByLabel: (
    label: string,
    value: string,
  ) => Promise<{ ok: boolean; reason?: string; valueUsed?: boolean }>;
  fillSearchInput: (
    value: string,
  ) => Promise<{ ok: boolean; reason?: string; valueUsed?: boolean }>;
  waitForSearchResults: () => Promise<{ ok: boolean; reason?: string }>;
  selectSearchResultByText: (
    text: string,
  ) => Promise<{ ok: boolean; reason?: string }>;
  readInstrumentVerificationSnapshot: () => Promise<unknown>;
  locateBuySellEntry: (
    side: "buy" | "sell",
  ) => Promise<{ ok: boolean; reason?: string; located?: boolean }>;
  fillOrderField: (
    label: string,
    value: string,
  ) => Promise<{ ok: boolean; reason?: string; valueUsed?: boolean }>;
  waitForOrderReviewState: () => Promise<{ ok: boolean; reason?: string }>;
  readOrderReviewSnapshot: () => Promise<unknown>;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid\s*qr\s*data|broker\s*secret|cookie\s*[:=]|credential\s*[:=]|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret\s*[:=]|session\s*[:=]|storage\s*[:=]|token\s*[:=]|order\s*id|orderid/i;

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
  mode: AvanzaLocalPlaywrightOrderPageActionBindingConfig["mode"],
): AvanzaLocalPlaywrightOrderPageActionBindingMode {
  if (mode === "local_dev_mock_page" || mode === "local_dev_playwright_page") {
    return mode;
  }

  return "disabled";
}

function bindingId(config: AvanzaLocalPlaywrightOrderPageActionBindingConfig) {
  return (
    safeText(config.bindingId) ??
    "avanza-local-playwright-order-page-action-binding"
  );
}

function createdAt(config: AvanzaLocalPlaywrightOrderPageActionBindingConfig) {
  return safeText(config.now) ?? defaultCreatedAt;
}

function hasForbiddenConfig(
  config: AvanzaLocalPlaywrightOrderPageActionBindingConfig,
) {
  return (
    config.allowAutomaticNavigation === true ||
    config.allowCookieRead === true ||
    config.allowSessionExport === true ||
    config.allowOrderSubmit === true ||
    config.allowFinalBuyClick === true ||
    config.allowFinalSellClick === true ||
    config.allowBankIdAutomation === true
  );
}

function statusFor(config: AvanzaLocalPlaywrightOrderPageActionBindingConfig) {
  if (config.statusOverride) return config.statusOverride;
  if (config.forceError === true) return "error";
  if (config.enabled !== true || modeFor(config.mode) === "disabled") {
    return "disabled";
  }
  if (hasForbiddenConfig(config)) return "blocked";

  return "ready";
}

function labelFor(status: AvanzaLocalPlaywrightOrderPageActionBindingStatus) {
  switch (status) {
    case "disabled":
      return "Order/search page action binding disabled";
    case "ready":
      return "Order/search page action binding ready";
    case "action_executed":
      return "Injected order/search page action executed";
    case "action_blocked":
      return "Injected order/search page action blocked";
    case "action_failed":
      return "Injected order/search page action failed";
    case "snapshot_read":
      return "Instrument verification snapshot read";
    case "order_review_snapshot_read":
      return "Order review snapshot read";
    case "blocked":
      return "Order/search page action binding blocked";
    case "error":
      return "Order/search page action binding error";
    case "unknown":
      return "Order/search page action binding unknown";
  }
}

function reasonFor(status: AvanzaLocalPlaywrightOrderPageActionBindingStatus) {
  switch (status) {
    case "disabled":
      return "Binding is disabled.";
    case "ready":
      return "Binding can adapt explicit injected Playwright-like order/search page methods.";
    case "action_executed":
      return "Injected page method completed; reports hide runtime values.";
    case "action_blocked":
      return "Action is blocked by explicit allow flags.";
    case "action_failed":
      return "Injected page method failed without leaking inputs.";
    case "snapshot_read":
      return "Instrument verification snapshot was read with redacted output.";
    case "order_review_snapshot_read":
      return "Order review snapshot was read with redacted output.";
    case "blocked":
      return "Forbidden navigation, cookie/session, BankID, final click, or order config was blocked.";
    case "error":
      return "Binding received an error input.";
    case "unknown":
      return "Binding input is unknown.";
  }
}

function blockedReasonsFor(
  config: AvanzaLocalPlaywrightOrderPageActionBindingConfig,
  status: AvanzaLocalPlaywrightOrderPageActionBindingStatus,
) {
  const reasons = [...safeStringArray(config.blockedReasons)];

  if (config.allowAutomaticNavigation === true) {
    reasons.push("Automatic Avanza navigation is forbidden.");
  }
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
  config: AvanzaLocalPlaywrightOrderPageActionBindingConfig,
  status: AvanzaLocalPlaywrightOrderPageActionBindingStatus,
): AvanzaLocalPlaywrightOrderPageActionBindingSafetyFlags {
  const bindingEnabled =
    config.enabled === true &&
    modeFor(config.mode) !== "disabled" &&
    !["disabled", "blocked", "error", "unknown"].includes(status);

  return {
    bindingEnabled,
    localDevOnly: true,
    canClickByText: bindingEnabled && config.allowClickByText === true,
    canFillByLabel: bindingEnabled && config.allowFillByLabel === true,
    canFillSearchInput:
      bindingEnabled && config.allowFillSearchInput === true,
    canWaitForSearchResults:
      bindingEnabled && config.allowWaitForSearchResults === true,
    canSelectSearchResultByText:
      bindingEnabled && config.allowSelectSearchResultByText === true,
    canReadInstrumentVerificationSnapshot:
      bindingEnabled &&
      config.allowReadInstrumentVerificationSnapshot === true,
    canLocateBuySellEntry:
      bindingEnabled && config.allowLocateBuySellEntry === true,
    canFillOrderField: bindingEnabled && config.allowFillOrderField === true,
    canWaitForOrderReviewState:
      bindingEnabled && config.allowWaitForOrderReviewState === true,
    canReadOrderReviewSnapshot:
      bindingEnabled && config.allowReadOrderReviewSnapshot === true,
    canNavigateAutomatically: false,
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
  config: AvanzaLocalPlaywrightOrderPageActionBindingConfig,
  status: AvanzaLocalPlaywrightOrderPageActionBindingStatus,
): AvanzaLocalPlaywrightOrderPageActionBindingState {
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
    located: status === "action_executed",
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
  config: AvanzaLocalPlaywrightOrderPageActionBindingConfig,
  actionType: AvanzaLocalPlaywrightOrderPageActionType,
  status: AvanzaLocalPlaywrightOrderPageActionBindingStatus,
  options: {
    ok?: boolean;
    reason?: string;
    valueUsed?: boolean;
    located?: boolean;
    snapshotRedacted?: boolean;
  } = {},
): AvanzaLocalPlaywrightOrderPageActionResult {
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
    located: options.located === true,
    snapshotRedacted:
      options.snapshotRedacted === true || config.redactSnapshotText !== false,
    warnings: safeStringArray(config.warnings),
    blockedReasons: blockedReasonsFor(config, status),
    safetyFlags: flags,
    ...flags,
  };
}

function blockedResult(
  config: AvanzaLocalPlaywrightOrderPageActionBindingConfig,
  actionType: AvanzaLocalPlaywrightOrderPageActionType,
  reason: string,
) {
  return resultFrom(config, actionType, "action_blocked", {
    ok: false,
    reason,
  });
}

function failedResult(
  config: AvanzaLocalPlaywrightOrderPageActionBindingConfig,
  actionType: AvanzaLocalPlaywrightOrderPageActionType,
  reason: string,
) {
  return resultFrom(config, actionType, "action_failed", {
    ok: false,
    reason,
  });
}

function toDependencyResult(result: AvanzaLocalPlaywrightOrderPageActionResult) {
  if (!result.ok) {
    return { ok: false, reason: result.reason };
  }

  return {
    ok: true,
    ...(result.valueUsed ? { valueUsed: true } : {}),
    ...(result.located ? { located: true } : {}),
  };
}

async function readSnapshot(
  config: AvanzaLocalPlaywrightOrderPageActionBindingConfig,
  page: AvanzaLocalPlaywrightOrderPageLikePage | undefined,
  actionType: Extract<
    AvanzaLocalPlaywrightOrderPageActionType,
    "read_instrument_verification_snapshot" | "read_order_review_snapshot"
  >,
) {
  const status =
    actionType === "read_order_review_snapshot"
      ? "order_review_snapshot_read"
      : "snapshot_read";
  const kind =
    actionType === "read_order_review_snapshot"
      ? "order_review"
      : "instrument_verification";

  try {
    const title = safeText(await page?.title?.()) ?? "redacted";
    const url = safeText(page?.url?.()) ?? "redacted";
    const textPreview =
      config.redactSnapshotText === false
        ? safeText(await page?.textContent?.("body")) ?? "redacted"
        : "redacted";

    return {
      ...resultFrom(config, actionType, status, {
        ok: true,
        snapshotRedacted: true,
      }),
      snapshotTitle: title,
      snapshotUrl: url,
      snapshotTextPreview: textPreview,
      snapshotKind: kind,
    } satisfies AvanzaLocalPlaywrightOrderPageSnapshotResult;
  } catch {
    return failedResult(config, actionType, "Injected snapshot read failed.");
  }
}

export function buildAvanzaLocalPlaywrightOrderPageActionBindingState(
  config: AvanzaLocalPlaywrightOrderPageActionBindingConfig = {},
): AvanzaLocalPlaywrightOrderPageActionBindingState {
  return stateFrom(config, config.modeledActionStatus ?? statusFor(config));
}

export function createAvanzaLocalPlaywrightOrderPageActionBinding(
  config: AvanzaLocalPlaywrightOrderPageActionBindingConfig = {},
  dependencies: AvanzaLocalPlaywrightOrderPageActionBindingDependencies = {},
): AvanzaLocalPlaywrightOrderPageActionBinding {
  const state = buildAvanzaLocalPlaywrightOrderPageActionBindingState(config);
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
    fillSearchInput: async (value: string) => {
      if (!state.canFillSearchInput) {
        return toDependencyResult(
          blockedResult(
            config,
            "fill_search_input",
            "fillSearchInput is disabled.",
          ),
        );
      }

      try {
        if (page?.getByPlaceholder) {
          await page.getByPlaceholder("Sök").fill(value);
        } else {
          await page?.locator?.("input[type='search']")?.fill?.(value);
        }

        return toDependencyResult(
          resultFrom(config, "fill_search_input", "action_executed", {
            ok: true,
            valueUsed: true,
          }),
        );
      } catch {
        return toDependencyResult(
          failedResult(config, "fill_search_input", "Injected search fill failed."),
        );
      }
    },
    waitForSearchResults: async () => {
      if (!state.canWaitForSearchResults) {
        return toDependencyResult(
          blockedResult(
            config,
            "wait_for_search_results",
            "waitForSearchResults is disabled.",
          ),
        );
      }

      try {
        if (page?.waitForLoadState) {
          await page.waitForLoadState("domcontentloaded");
        } else {
          await page?.waitForTimeout?.(100);
        }

        return toDependencyResult(
          resultFrom(config, "wait_for_search_results", "action_executed", {
            ok: true,
          }),
        );
      } catch {
        return toDependencyResult(
          failedResult(
            config,
            "wait_for_search_results",
            "Injected search wait failed.",
          ),
        );
      }
    },
    selectSearchResultByText: async (text: string) => {
      if (!state.canSelectSearchResultByText) {
        return toDependencyResult(
          blockedResult(
            config,
            "select_search_result_by_text",
            "selectSearchResultByText is disabled.",
          ),
        );
      }

      try {
        await page?.getByText?.(text).click();

        return toDependencyResult(
          resultFrom(config, "select_search_result_by_text", "action_executed", {
            ok: true,
          }),
        );
      } catch {
        return toDependencyResult(
          failedResult(
            config,
            "select_search_result_by_text",
            "Injected search result select failed.",
          ),
        );
      }
    },
    readInstrumentVerificationSnapshot: async () => {
      if (!state.canReadInstrumentVerificationSnapshot) {
        return blockedResult(
          config,
          "read_instrument_verification_snapshot",
          "readInstrumentVerificationSnapshot is disabled.",
        );
      }

      return readSnapshot(config, page, "read_instrument_verification_snapshot");
    },
    locateBuySellEntry: async (side: "buy" | "sell") => {
      if (!state.canLocateBuySellEntry) {
        return toDependencyResult(
          blockedResult(
            config,
            "locate_buy_sell_entry",
            "locateBuySellEntry is disabled.",
          ),
        );
      }

      try {
        const label = side === "sell" ? "Sälj" : "Köp";
        const count = await page?.locator?.(`text=${label}`)?.count?.();
        const located = count === undefined ? true : count > 0;

        return toDependencyResult(
          resultFrom(config, "locate_buy_sell_entry", "action_executed", {
            ok: located,
            located,
            reason: located
              ? "BUY/SELL entry located without final click."
              : "BUY/SELL entry was not located.",
          }),
        );
      } catch {
        return toDependencyResult(
          failedResult(
            config,
            "locate_buy_sell_entry",
            "Injected BUY/SELL locate failed.",
          ),
        );
      }
    },
    fillOrderField: async (label: string, value: string) => {
      if (!state.canFillOrderField) {
        return toDependencyResult(
          blockedResult(
            config,
            "fill_order_field",
            "fillOrderField is disabled.",
          ),
        );
      }

      try {
        await page?.getByLabel?.(label).fill(value);

        return toDependencyResult(
          resultFrom(config, "fill_order_field", "action_executed", {
            ok: true,
            valueUsed: true,
          }),
        );
      } catch {
        return toDependencyResult(
          failedResult(config, "fill_order_field", "Injected order field fill failed."),
        );
      }
    },
    waitForOrderReviewState: async () => {
      if (!state.canWaitForOrderReviewState) {
        return toDependencyResult(
          blockedResult(
            config,
            "wait_for_order_review_state",
            "waitForOrderReviewState is disabled.",
          ),
        );
      }

      try {
        if (page?.waitForLoadState) {
          await page.waitForLoadState("domcontentloaded");
        } else {
          await page?.waitForTimeout?.(100);
        }

        return toDependencyResult(
          resultFrom(config, "wait_for_order_review_state", "action_executed", {
            ok: true,
          }),
        );
      } catch {
        return toDependencyResult(
          failedResult(
            config,
            "wait_for_order_review_state",
            "Injected order review wait failed.",
          ),
        );
      }
    },
    readOrderReviewSnapshot: async () => {
      if (!state.canReadOrderReviewSnapshot) {
        return blockedResult(
          config,
          "read_order_review_snapshot",
          "readOrderReviewSnapshot is disabled.",
        );
      }

      return readSnapshot(config, page, "read_order_review_snapshot");
    },
  };
}

export const avanzaLocalPlaywrightOrderPageActionBindingDefaultConfig:
  AvanzaLocalPlaywrightOrderPageActionBindingConfig = {
    bindingId: "avanza-local-playwright-order-page-action-binding",
    mode: "disabled",
    enabled: false,
    localDevOnly: true,
    allowClickByText: false,
    allowFillByLabel: false,
    allowFillSearchInput: false,
    allowWaitForSearchResults: false,
    allowSelectSearchResultByText: false,
    allowReadInstrumentVerificationSnapshot: false,
    allowLocateBuySellEntry: false,
    allowFillOrderField: false,
    allowWaitForOrderReviewState: false,
    allowReadOrderReviewSnapshot: false,
    allowAutomaticNavigation: false,
    allowCookieRead: false,
    allowSessionExport: false,
    allowOrderSubmit: false,
    allowFinalBuyClick: false,
    allowFinalSellClick: false,
    allowBankIdAutomation: false,
    redactSnapshotText: true,
    now: defaultCreatedAt,
  };
