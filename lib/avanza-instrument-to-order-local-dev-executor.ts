import type {
  AvanzaInstrumentToOrderDryRunReport,
} from "./avanza-instrument-to-order-dry-run-executor";
import type {
  AvanzaInstrumentToOrderHandoffChain,
  AvanzaInstrumentToOrderHandoffStepValueSource,
} from "./avanza-instrument-to-order-handoff-chain";
import type {
  AvanzaInstrumentToOrderMockExecutorReport,
} from "./avanza-instrument-to-order-mock-executor";
import type {
  AvanzaOrderTicketOrderType,
  AvanzaOrderTicketSide,
} from "./avanza-order-ticket-field-contract";

export type AvanzaInstrumentToOrderLocalDevExecutorStatus =
  | "disabled"
  | "ready"
  | "executed_to_review"
  | "blocked"
  | "waiting_for_handoff_chain"
  | "instrument_search_failed"
  | "instrument_verification_failed"
  | "order_ticket_preparation_failed"
  | "order_review_not_ready"
  | "final_human_action_required"
  | "page_action_failed"
  | "error"
  | "unknown";

export type AvanzaInstrumentToOrderLocalDevActionStatus =
  | "pending"
  | "executed"
  | "skipped"
  | "blocked"
  | "failed"
  | "final_human_action_required";

export type AvanzaInstrumentToOrderLocalDevExecutorMode =
  | "disabled"
  | "local_dev_mock_injected"
  | "local_dev_real_injected";

export type AvanzaInstrumentToOrderLocalDevExecutorConfig = {
  executorId?: string;
  mode?: AvanzaInstrumentToOrderLocalDevExecutorMode;
  enabled?: boolean;
  localDevOnly?: true;
  allowSearchActions?: boolean;
  allowFillSearchInput?: boolean;
  allowSelectSearchResult?: boolean;
  allowReadInstrumentVerificationSnapshot?: boolean;
  allowLocateBuySellEntry?: boolean;
  allowFillOrderFields?: boolean;
  allowReadOrderReviewSnapshot?: boolean;
  allowFinalBuyClick?: false | boolean;
  allowFinalSellClick?: false | boolean;
  allowOrderSubmit?: false | boolean;
  allowCookieRead?: false | boolean;
  allowSessionExport?: false | boolean;
  allowBankIdAutomation?: false | boolean;
  dryRun?: boolean;
  forceError?: boolean;
  statusOverride?: AvanzaInstrumentToOrderLocalDevExecutorStatus;
  now?: string;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaInstrumentToOrderLocalDevExecutorDependencies = {
  clickByText: (text: string) => Promise<{ ok: boolean; reason?: string }>;
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
  closeResources?: () => Promise<{ ok: boolean; reason?: string }>;
};

export type AvanzaInstrumentToOrderLocalDevExecutorSafetyFlags = {
  executorEnabled: boolean;
  localDevOnly: true;
  canExecuteLocalDevActions: boolean;
  canSearchInstrument: boolean;
  canFillSearchInput: boolean;
  canSelectSearchResult: boolean;
  canReadInstrumentVerificationSnapshot: boolean;
  canLocateBuySellEntry: boolean;
  canFillOrderFields: boolean;
  canReadOrderReviewSnapshot: boolean;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canSubmitOrder: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaInstrumentToOrderLocalDevActionReport = {
  actionId: string;
  actionType: string;
  label: string;
  executionStatus: AvanzaInstrumentToOrderLocalDevActionStatus;
  targetSignalText?: string;
  valueSource: AvanzaInstrumentToOrderHandoffStepValueSource;
  valueUsed?: boolean;
  valueVisible: false;
  safeDisplayValue?: string;
  realBrowserAction: boolean;
  orderSubmitted: false;
  finalBuySellClicked: false;
  expectedResult: string;
  actualResult?: string;
  blockedReason?: string;
};

export type AvanzaInstrumentToOrderLocalDevExecutorReport =
  AvanzaInstrumentToOrderLocalDevExecutorSafetyFlags & {
    reportId: string;
    createdAt: string;
    mode: AvanzaInstrumentToOrderLocalDevExecutorMode;
    status: AvanzaInstrumentToOrderLocalDevExecutorStatus;
    label: string;
    reason: string;
    side: AvanzaOrderTicketSide;
    ticker: string;
    instrumentName?: string;
    quantity?: number;
    orderType: AvanzaOrderTicketOrderType;
    limitPrice?: number;
    searchExecuted: boolean;
    instrumentSelected: boolean;
    instrumentVerificationRead: boolean;
    instrumentVerificationPassed: boolean;
    buySellEntryLocated: boolean;
    orderFieldsPrepared: boolean;
    orderReviewReady: boolean;
    finalHumanActionRequired: true;
    orderSubmitted: false;
    finalBuySellClicked: false;
    actionReports: AvanzaInstrumentToOrderLocalDevActionReport[];
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaInstrumentToOrderLocalDevExecutorSafetyFlags;
  };

export type AvanzaInstrumentToOrderLocalDevExecutorInput = {
  config?: AvanzaInstrumentToOrderLocalDevExecutorConfig;
  handoffChain?: unknown;
  dryRunReport?: AvanzaInstrumentToOrderDryRunReport;
  mockExecutorReport?: AvanzaInstrumentToOrderMockExecutorReport;
  dependencies?: AvanzaInstrumentToOrderLocalDevExecutorDependencies;
  now?: string;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid|broker\s*secret|cookie|credential|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret|session|storage|token|order\s*id|orderid/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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

function isHandoffChain(value: unknown): value is AvanzaInstrumentToOrderHandoffChain {
  return (
    isRecord(value) &&
    typeof value.chainId === "string" &&
    typeof value.status === "string" &&
    typeof value.side === "string" &&
    typeof value.ticker === "string" &&
    Array.isArray(value.steps) &&
    Array.isArray(value.blockedReasons)
  );
}

function normalizeMode(
  mode: AvanzaInstrumentToOrderLocalDevExecutorConfig["mode"],
): AvanzaInstrumentToOrderLocalDevExecutorMode {
  if (mode === "local_dev_mock_injected" || mode === "local_dev_real_injected") {
    return mode;
  }

  return "disabled";
}

function normalizeConfig(input: AvanzaInstrumentToOrderLocalDevExecutorInput) {
  const config = input.config ?? {};

  return {
    executorId:
      safeText(config.executorId) ??
      "avanza-instrument-to-order-local-dev-executor",
    mode: normalizeMode(config.mode),
    enabled: config.enabled === true,
    localDevOnly: true as const,
    allowSearchActions: config.allowSearchActions === true,
    allowFillSearchInput: config.allowFillSearchInput === true,
    allowSelectSearchResult: config.allowSelectSearchResult === true,
    allowReadInstrumentVerificationSnapshot:
      config.allowReadInstrumentVerificationSnapshot === true,
    allowLocateBuySellEntry: config.allowLocateBuySellEntry === true,
    allowFillOrderFields: config.allowFillOrderFields === true,
    allowReadOrderReviewSnapshot: config.allowReadOrderReviewSnapshot === true,
    allowFinalBuyClick: config.allowFinalBuyClick === true,
    allowFinalSellClick: config.allowFinalSellClick === true,
    allowOrderSubmit: config.allowOrderSubmit === true,
    allowCookieRead: config.allowCookieRead === true,
    allowSessionExport: config.allowSessionExport === true,
    allowBankIdAutomation: config.allowBankIdAutomation === true,
    dryRun: config.dryRun === true,
    forceError: config.forceError === true,
    statusOverride: config.statusOverride,
    now: safeText(config.now) ?? safeText(input.now) ?? defaultCreatedAt,
    warnings: config.warnings ?? [],
    blockedReasons: config.blockedReasons ?? [],
  };
}

function buildSafetyFlags(options: {
  executorEnabled: boolean;
  canExecuteLocalDevActions?: boolean;
  canSearchInstrument?: boolean;
  canFillSearchInput?: boolean;
  canSelectSearchResult?: boolean;
  canReadInstrumentVerificationSnapshot?: boolean;
  canLocateBuySellEntry?: boolean;
  canFillOrderFields?: boolean;
  canReadOrderReviewSnapshot?: boolean;
}): AvanzaInstrumentToOrderLocalDevExecutorSafetyFlags {
  return {
    executorEnabled: options.executorEnabled,
    localDevOnly: true,
    canExecuteLocalDevActions: options.canExecuteLocalDevActions === true,
    canSearchInstrument: options.canSearchInstrument === true,
    canFillSearchInput: options.canFillSearchInput === true,
    canSelectSearchResult: options.canSelectSearchResult === true,
    canReadInstrumentVerificationSnapshot:
      options.canReadInstrumentVerificationSnapshot === true,
    canLocateBuySellEntry: options.canLocateBuySellEntry === true,
    canFillOrderFields: options.canFillOrderFields === true,
    canReadOrderReviewSnapshot: options.canReadOrderReviewSnapshot === true,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canSubmitOrder: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function statusLabel(status: AvanzaInstrumentToOrderLocalDevExecutorStatus) {
  switch (status) {
    case "disabled":
      return "Instrument to order local-dev executor disabled";
    case "ready":
      return "Instrument to order local-dev executor ready";
    case "executed_to_review":
      return "Instrument to order local-dev executor reached review";
    case "blocked":
      return "Instrument to order local-dev executor blocked";
    case "waiting_for_handoff_chain":
      return "Instrument to order local-dev executor waiting for handoff chain";
    case "instrument_search_failed":
      return "Instrument search failed";
    case "instrument_verification_failed":
      return "Instrument verification failed";
    case "order_ticket_preparation_failed":
      return "Order ticket preparation failed";
    case "order_review_not_ready":
      return "Order review not ready";
    case "final_human_action_required":
      return "Final human action required";
    case "page_action_failed":
      return "Injected page action failed";
    case "error":
      return "Instrument to order local-dev executor error";
    case "unknown":
      return "Instrument to order local-dev executor unknown";
  }
}

function baseAction(
  actionId: string,
  actionType: string,
  label: string,
  expectedResult: string,
  options: {
    executionStatus?: AvanzaInstrumentToOrderLocalDevActionStatus;
    targetSignalText?: string;
    valueSource?: AvanzaInstrumentToOrderHandoffStepValueSource;
    valueUsed?: boolean;
    safeDisplayValue?: string | number;
    actualResult?: string;
    blockedReason?: string;
  } = {},
): AvanzaInstrumentToOrderLocalDevActionReport {
  return {
    actionId,
    actionType,
    label,
    executionStatus: options.executionStatus ?? "pending",
    targetSignalText: safeText(options.targetSignalText),
    valueSource: options.valueSource ?? "none",
    valueUsed: options.valueUsed,
    valueVisible: false,
    safeDisplayValue:
      options.safeDisplayValue === undefined
        ? undefined
        : safeText(String(options.safeDisplayValue)),
    realBrowserAction: options.executionStatus === "executed",
    orderSubmitted: false,
    finalBuySellClicked: false,
    expectedResult,
    actualResult: safeText(options.actualResult),
    blockedReason: safeText(options.blockedReason),
  };
}

function blockedActions(reason: string): AvanzaInstrumentToOrderLocalDevActionReport[] {
  return [
    baseAction("no_op", "no_op", "No local-dev executor action", "No action is run.", {
      blockedReason: reason,
      executionStatus: "blocked",
    }),
  ];
}

function emptyReport(
  input: AvanzaInstrumentToOrderLocalDevExecutorInput,
  status: AvanzaInstrumentToOrderLocalDevExecutorStatus,
  reason: string,
  options: {
    actionReports?: AvanzaInstrumentToOrderLocalDevActionReport[];
    blockedReasons?: string[];
    warnings?: string[];
    chain?: AvanzaInstrumentToOrderHandoffChain;
  } = {},
): AvanzaInstrumentToOrderLocalDevExecutorReport {
  const config = normalizeConfig(input);
  const chain = options.chain;
  const executorActive =
    config.enabled && config.mode !== "disabled" && !config.dryRun;
  const safetyFlags = buildSafetyFlags({
    executorEnabled: config.enabled,
    canExecuteLocalDevActions: executorActive,
    canSearchInstrument: executorActive && config.allowSearchActions,
    canFillSearchInput: executorActive && config.allowFillSearchInput,
    canSelectSearchResult: executorActive && config.allowSelectSearchResult,
    canReadInstrumentVerificationSnapshot:
      executorActive && config.allowReadInstrumentVerificationSnapshot,
    canLocateBuySellEntry: executorActive && config.allowLocateBuySellEntry,
    canFillOrderFields: executorActive && config.allowFillOrderFields,
    canReadOrderReviewSnapshot:
      executorActive && config.allowReadOrderReviewSnapshot,
  });
  const blockedReasons = [
    ...safeStringArray(config.blockedReasons),
    ...safeStringArray(options.blockedReasons),
  ];
  const warnings = [
    ...safeStringArray(config.warnings),
    ...safeStringArray(options.warnings),
  ];

  return {
    ...safetyFlags,
    reportId: config.executorId,
    createdAt: config.now,
    mode: config.mode,
    status,
    label: statusLabel(status),
    reason,
    side: chain?.side ?? "unknown",
    ticker: chain?.ticker ?? "missing",
    instrumentName: safeText(chain?.instrumentName),
    quantity: chain?.quantity,
    orderType: chain?.orderType ?? "unknown",
    limitPrice: chain?.limitPrice,
    searchExecuted: false,
    instrumentSelected: false,
    instrumentVerificationRead: false,
    instrumentVerificationPassed: false,
    buySellEntryLocated: false,
    orderFieldsPrepared: false,
    orderReviewReady: false,
    finalHumanActionRequired: true,
    orderSubmitted: false,
    finalBuySellClicked: false,
    actionReports: options.actionReports ?? blockedActions(reason),
    warnings,
    blockedReasons,
    safetyFlags,
  };
}

function inputIsReady(
  config: ReturnType<typeof normalizeConfig>,
  chain: AvanzaInstrumentToOrderHandoffChain,
) {
  const blockedReasons: string[] = [];

  if (config.allowFinalBuyClick || config.allowFinalSellClick) {
    blockedReasons.push("Final KOP/SALJ clicks remain forbidden.");
  }

  if (config.allowOrderSubmit) {
    blockedReasons.push("Order submission remains forbidden.");
  }

  if (config.allowCookieRead || config.allowSessionExport) {
    blockedReasons.push("Cookie/session access remains forbidden.");
  }

  if (config.allowBankIdAutomation) {
    blockedReasons.push("BankID automation remains forbidden.");
  }

  if (chain.status !== "handoff_chain_ready") {
    blockedReasons.push("Handoff chain is not ready.");
  }

  if (chain.side !== "buy" && chain.side !== "sell") {
    blockedReasons.push("Handoff chain side must be BUY or SELL.");
  }

  if (!safeText(chain.ticker) || chain.ticker === "missing") {
    blockedReasons.push("Handoff chain ticker is required.");
  }

  if (typeof chain.quantity !== "number" || chain.quantity <= 0) {
    blockedReasons.push("Handoff chain quantity must be positive.");
  }

  if (chain.orderType === "limit" && !chain.limitPrice) {
    blockedReasons.push("Limit price is required for limit orders.");
  }

  if (chain.blockedReasons.length > 0) {
    blockedReasons.push(...chain.blockedReasons);
  }

  return blockedReasons;
}

function successfulActionReports(
  chain: AvanzaInstrumentToOrderHandoffChain,
): AvanzaInstrumentToOrderLocalDevActionReport[] {
  const searchText = safeText(chain.instrumentName) ?? safeText(chain.ticker);

  return [
    baseAction("click_search", "click_by_text", "Click/open search", "Search control is opened.", {
      executionStatus: "executed",
      targetSignalText: "Sök",
      valueSource: "static_safe_signal",
      actualResult: "Search action executed.",
    }),
    baseAction(
      "fill_search_input",
      "fill_search_input",
      "Fill search input",
      "Search query is entered.",
      {
        executionStatus: "executed",
        valueSource: "execution_package",
        valueUsed: true,
        safeDisplayValue: "value hidden",
        actualResult: "Search value used with hidden report value.",
      },
    ),
    baseAction(
      "wait_for_search_results",
      "wait_for_search_results",
      "Wait for search results",
      "Search results become available.",
      {
        executionStatus: "executed",
        valueSource: "static_safe_signal",
        actualResult: "Search results wait completed.",
      },
    ),
    baseAction(
      "select_search_result",
      "select_search_result_by_text",
      "Select matching instrument",
      "Matching instrument is selected.",
      {
        executionStatus: "executed",
        targetSignalText: searchText,
        valueSource: "execution_package",
        actualResult: "Instrument selection action executed.",
      },
    ),
    baseAction(
      "read_instrument_snapshot",
      "read_instrument_verification_snapshot",
      "Read instrument verification snapshot",
      "Instrument verification snapshot is read.",
      {
        executionStatus: "executed",
        valueSource: "verification_state",
        actualResult: "Redacted instrument verification snapshot read.",
      },
    ),
    baseAction(
      "locate_buy_sell_entry",
      "locate_buy_sell_entry",
      "Locate BUY/SELL entry",
      "Required BUY/SELL entry is located but not clicked as final action.",
      {
        executionStatus: "executed",
        targetSignalText: chain.side === "sell" ? "Sälj" : "Köp",
        valueSource: "order_contract",
        actualResult: "Entry located without final order submission.",
      },
    ),
    baseAction(
      "fill_quantity",
      "fill_order_field",
      "Fill quantity",
      "Quantity field is prepared.",
      {
        executionStatus: "executed",
        valueSource: "execution_package",
        valueUsed: true,
        safeDisplayValue: "value hidden",
        actualResult: "Quantity value used with hidden report value.",
      },
    ),
    baseAction(
      "fill_limit_price",
      "fill_order_field",
      "Fill limit price",
      "Limit price field is prepared.",
      {
        executionStatus: chain.orderType === "limit" ? "executed" : "skipped",
        valueSource: "execution_package",
        valueUsed: chain.orderType === "limit",
        safeDisplayValue: "value hidden",
        actualResult:
          chain.orderType === "limit"
            ? "Limit price value used with hidden report value."
            : "Limit price skipped for non-limit order.",
      },
    ),
    baseAction(
      "wait_for_order_review",
      "wait_for_order_review_state",
      "Wait for order review state",
      "Review-ready state is reached.",
      {
        executionStatus: "executed",
        valueSource: "order_contract",
        actualResult: "Order review state reached.",
      },
    ),
    baseAction(
      "read_order_review_snapshot",
      "read_order_review_snapshot",
      "Read order review snapshot",
      "Redacted order review snapshot is read.",
      {
        executionStatus: "executed",
        valueSource: "user_review",
        actualResult: "Redacted order review snapshot read.",
      },
    ),
    baseAction(
      "stop_before_final_buy_sell",
      "stop_before_final_buy_sell",
      "Stop before final KOP/SALJ",
      "User must manually press final KOP/SALJ if they choose to continue.",
      {
        executionStatus: "final_human_action_required",
        valueSource: "user_review",
        actualResult: "Final human action required; no order submitted.",
      },
    ),
  ];
}

function failAction(
  actions: AvanzaInstrumentToOrderLocalDevActionReport[],
  actionId: string,
  reason: string,
) {
  return actions.map((action) =>
    action.actionId === actionId
      ? {
          ...action,
          executionStatus: "failed" as const,
          actualResult: reason,
          blockedReason: reason,
          realBrowserAction: false,
        }
      : action,
  );
}

function okResult(value: unknown): value is { ok: true; valueUsed?: boolean; located?: boolean } {
  return isRecord(value) && value.ok === true;
}

function resultReason(value: unknown, fallback: string) {
  return isRecord(value) ? safeText(value.reason) ?? fallback : fallback;
}

function snapshotLooksSafe(value: unknown, chain: AvanzaInstrumentToOrderHandoffChain) {
  if (chain.verifiedInstrumentState.status !== "verified_model_only") {
    return false;
  }

  if (!isRecord(value)) {
    return true;
  }

  const ok = value.ok !== false;
  const redacted =
    value.snapshotRedacted === true || safeText(value.snapshotTextPreview) === "redacted";

  return ok && redacted;
}

export function buildAvanzaInstrumentToOrderLocalDevExecutorState(
  input: AvanzaInstrumentToOrderLocalDevExecutorInput = {},
): AvanzaInstrumentToOrderLocalDevExecutorReport {
  const config = normalizeConfig(input);

  if (config.forceError) {
    return emptyReport(input, "error", "Forced local-dev executor error.");
  }

  if (config.statusOverride === "unknown") {
    return emptyReport(input, "unknown", "Local-dev executor status unknown.");
  }

  if (!config.enabled || config.mode === "disabled") {
    return emptyReport(input, "disabled", "Local-dev executor is disabled.");
  }

  if (!isHandoffChain(input.handoffChain)) {
    return emptyReport(
      input,
      "waiting_for_handoff_chain",
      "Local-dev executor is waiting for a handoff chain.",
      { blockedReasons: ["Handoff chain is missing or invalid."] },
    );
  }

  const chain = input.handoffChain;
  const blockedReasons = inputIsReady(config, chain);

  if (blockedReasons.length > 0) {
    return emptyReport(input, "blocked", "Local-dev executor input is blocked.", {
      blockedReasons,
      chain,
    });
  }

  const missingPermission =
    !config.allowSearchActions ||
    !config.allowFillSearchInput ||
    !config.allowSelectSearchResult ||
    !config.allowReadInstrumentVerificationSnapshot ||
    !config.allowLocateBuySellEntry ||
    !config.allowFillOrderFields ||
    !config.allowReadOrderReviewSnapshot;

  if (missingPermission) {
    return emptyReport(
      input,
      "blocked",
      "Local-dev executor permissions are incomplete.",
      { blockedReasons: ["Every pre-submit action permission must be explicit."], chain },
    );
  }

  if (config.dryRun) {
    return emptyReport(
      input,
      "ready",
      "Dry-run mode reports readiness without executing injected actions.",
      {
        actionReports: successfulActionReports(chain).map((action) => ({
          ...action,
          executionStatus:
            action.executionStatus === "final_human_action_required"
              ? "final_human_action_required"
              : "skipped",
          realBrowserAction: false,
        })),
        chain,
        warnings: ["dryRun true blocks injected page actions."],
      },
    );
  }

  return emptyReport(input, "ready", "Local-dev executor is ready.", {
    actionReports: successfulActionReports(chain).map((action) => ({
      ...action,
      executionStatus:
        action.executionStatus === "final_human_action_required"
          ? "final_human_action_required"
          : "pending",
      realBrowserAction: false,
    })),
    chain,
  });
}

export function toAvanzaInstrumentToOrderLocalDevSafeReport(
  report: AvanzaInstrumentToOrderLocalDevExecutorReport,
): AvanzaInstrumentToOrderLocalDevExecutorReport {
  return {
    ...report,
    actionReports: report.actionReports.map((action) => ({
      ...action,
      valueVisible: false,
      safeDisplayValue:
        action.valueUsed === true
          ? "value hidden"
          : safeText(action.safeDisplayValue),
      orderSubmitted: false,
      finalBuySellClicked: false,
    })),
    orderSubmitted: false,
    finalBuySellClicked: false,
    finalHumanActionRequired: true,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canSubmitOrder: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    controlsEnabled: false,
    gateLocked: true,
  };
}

export async function executeAvanzaInstrumentToOrderLocalDevPlan(
  input: AvanzaInstrumentToOrderLocalDevExecutorInput,
): Promise<AvanzaInstrumentToOrderLocalDevExecutorReport> {
  const ready = buildAvanzaInstrumentToOrderLocalDevExecutorState(input);

  if (ready.status !== "ready" || !ready.canExecuteLocalDevActions) {
    return toAvanzaInstrumentToOrderLocalDevSafeReport(ready);
  }

  const chain = input.handoffChain as AvanzaInstrumentToOrderHandoffChain;
  const dependencies = input.dependencies;

  if (!dependencies) {
    return toAvanzaInstrumentToOrderLocalDevSafeReport(
      emptyReport(
        input,
        "blocked",
        "Injected order/search dependencies are required.",
        { blockedReasons: ["Dependencies missing."], chain },
      ),
    );
  }

  const actions = successfulActionReports(chain);
  const searchText = safeText(chain.instrumentName) ?? chain.ticker;

  try {
    const clickSearch = await dependencies.clickByText("Sök");
    if (!okResult(clickSearch)) {
      return toAvanzaInstrumentToOrderLocalDevSafeReport({
        ...ready,
        status: "instrument_search_failed",
        label: statusLabel("instrument_search_failed"),
        reason: resultReason(clickSearch, "Search click failed."),
        actionReports: failAction(actions, "click_search", "Search click failed."),
        searchExecuted: false,
        blockedReasons: [resultReason(clickSearch, "Search click failed.")],
      });
    }

    const fillSearch = await dependencies.fillSearchInput(searchText);
    if (!okResult(fillSearch)) {
      return toAvanzaInstrumentToOrderLocalDevSafeReport({
        ...ready,
        status: "instrument_search_failed",
        label: statusLabel("instrument_search_failed"),
        reason: resultReason(fillSearch, "Search input fill failed."),
        actionReports: failAction(
          actions,
          "fill_search_input",
          "Search input fill failed.",
        ),
        searchExecuted: true,
        blockedReasons: [resultReason(fillSearch, "Search input fill failed.")],
      });
    }

    const waitResults = await dependencies.waitForSearchResults();
    if (!okResult(waitResults)) {
      return toAvanzaInstrumentToOrderLocalDevSafeReport({
        ...ready,
        status: "instrument_search_failed",
        label: statusLabel("instrument_search_failed"),
        reason: resultReason(waitResults, "Search results did not become ready."),
        actionReports: failAction(
          actions,
          "wait_for_search_results",
          "Search results did not become ready.",
        ),
        searchExecuted: true,
        blockedReasons: [
          resultReason(waitResults, "Search results did not become ready."),
        ],
      });
    }

    const selectInstrument =
      await dependencies.selectSearchResultByText(searchText);
    if (!okResult(selectInstrument)) {
      return toAvanzaInstrumentToOrderLocalDevSafeReport({
        ...ready,
        status: "instrument_search_failed",
        label: statusLabel("instrument_search_failed"),
        reason: resultReason(selectInstrument, "Instrument selection failed."),
        actionReports: failAction(
          actions,
          "select_search_result",
          "Instrument selection failed.",
        ),
        searchExecuted: true,
        instrumentSelected: false,
        blockedReasons: [
          resultReason(selectInstrument, "Instrument selection failed."),
        ],
      });
    }

    const instrumentSnapshot =
      await dependencies.readInstrumentVerificationSnapshot();
    if (!snapshotLooksSafe(instrumentSnapshot, chain)) {
      return toAvanzaInstrumentToOrderLocalDevSafeReport({
        ...ready,
        status: "instrument_verification_failed",
        label: statusLabel("instrument_verification_failed"),
        reason: "Instrument verification did not pass.",
        actionReports: failAction(
          actions,
          "read_instrument_snapshot",
          "Instrument verification did not pass.",
        ),
        searchExecuted: true,
        instrumentSelected: true,
        instrumentVerificationRead: true,
        instrumentVerificationPassed: false,
        blockedReasons: ["Instrument verification did not pass."],
      });
    }

    const entrySide = chain.side === "sell" ? "sell" : "buy";
    const entry = await dependencies.locateBuySellEntry(entrySide);
    if (!okResult(entry) || entry.located !== true) {
      return toAvanzaInstrumentToOrderLocalDevSafeReport({
        ...ready,
        status: "order_ticket_preparation_failed",
        label: statusLabel("order_ticket_preparation_failed"),
        reason: resultReason(entry, "BUY/SELL entry was not located."),
        actionReports: failAction(
          actions,
          "locate_buy_sell_entry",
          "BUY/SELL entry was not located.",
        ),
        searchExecuted: true,
        instrumentSelected: true,
        instrumentVerificationRead: true,
        instrumentVerificationPassed: true,
        buySellEntryLocated: false,
        blockedReasons: [resultReason(entry, "BUY/SELL entry was not located.")],
      });
    }

    const quantity = await dependencies.fillOrderField(
      "Antal",
      String(chain.quantity),
    );
    if (!okResult(quantity)) {
      return toAvanzaInstrumentToOrderLocalDevSafeReport({
        ...ready,
        status: "order_ticket_preparation_failed",
        label: statusLabel("order_ticket_preparation_failed"),
        reason: resultReason(quantity, "Quantity fill failed."),
        actionReports: failAction(actions, "fill_quantity", "Quantity fill failed."),
        searchExecuted: true,
        instrumentSelected: true,
        instrumentVerificationRead: true,
        instrumentVerificationPassed: true,
        buySellEntryLocated: true,
        blockedReasons: [resultReason(quantity, "Quantity fill failed.")],
      });
    }

    if (chain.orderType === "limit") {
      const limitPrice = await dependencies.fillOrderField(
        "Pris",
        String(chain.limitPrice),
      );
      if (!okResult(limitPrice)) {
        return toAvanzaInstrumentToOrderLocalDevSafeReport({
          ...ready,
          status: "order_ticket_preparation_failed",
          label: statusLabel("order_ticket_preparation_failed"),
          reason: resultReason(limitPrice, "Limit price fill failed."),
          actionReports: failAction(
            actions,
            "fill_limit_price",
            "Limit price fill failed.",
          ),
          searchExecuted: true,
          instrumentSelected: true,
          instrumentVerificationRead: true,
          instrumentVerificationPassed: true,
          buySellEntryLocated: true,
          orderFieldsPrepared: false,
          blockedReasons: [resultReason(limitPrice, "Limit price fill failed.")],
        });
      }
    }

    const orderReviewState = await dependencies.waitForOrderReviewState();
    if (!okResult(orderReviewState)) {
      return toAvanzaInstrumentToOrderLocalDevSafeReport({
        ...ready,
        status: "order_review_not_ready",
        label: statusLabel("order_review_not_ready"),
        reason: resultReason(orderReviewState, "Order review did not become ready."),
        actionReports: failAction(
          actions,
          "wait_for_order_review",
          "Order review did not become ready.",
        ),
        searchExecuted: true,
        instrumentSelected: true,
        instrumentVerificationRead: true,
        instrumentVerificationPassed: true,
        buySellEntryLocated: true,
        orderFieldsPrepared: true,
        blockedReasons: [
          resultReason(orderReviewState, "Order review did not become ready."),
        ],
      });
    }

    const orderReviewSnapshot = await dependencies.readOrderReviewSnapshot();
    if (!isRecord(orderReviewSnapshot) || orderReviewSnapshot.ok === false) {
      return toAvanzaInstrumentToOrderLocalDevSafeReport({
        ...ready,
        status: "order_review_not_ready",
        label: statusLabel("order_review_not_ready"),
        reason: "Order review snapshot was not readable.",
        actionReports: failAction(
          actions,
          "read_order_review_snapshot",
          "Order review snapshot was not readable.",
        ),
        searchExecuted: true,
        instrumentSelected: true,
        instrumentVerificationRead: true,
        instrumentVerificationPassed: true,
        buySellEntryLocated: true,
        orderFieldsPrepared: true,
        blockedReasons: ["Order review snapshot was not readable."],
      });
    }

    await dependencies.closeResources?.();

    return toAvanzaInstrumentToOrderLocalDevSafeReport({
      ...ready,
      status: "executed_to_review",
      label: statusLabel("executed_to_review"),
      reason:
        "Injected local-dev order/search actions reached review and stopped before final KOP/SALJ.",
      searchExecuted: true,
      instrumentSelected: true,
      instrumentVerificationRead: true,
      instrumentVerificationPassed: true,
      buySellEntryLocated: true,
      orderFieldsPrepared: true,
      orderReviewReady: true,
      finalHumanActionRequired: true,
      orderSubmitted: false,
      finalBuySellClicked: false,
      actionReports: actions,
      warnings: [
        ...ready.warnings,
        "Final human action required; final KOP/SALJ was not clicked.",
      ],
    });
  } catch {
    return toAvanzaInstrumentToOrderLocalDevSafeReport({
      ...ready,
      status: "page_action_failed",
      label: statusLabel("page_action_failed"),
      reason: "Injected dependency threw while executing local-dev order path.",
      actionReports: failAction(
        actions,
        "click_search",
        "Injected dependency threw while executing local-dev order path.",
      ),
      blockedReasons: [
        "Injected dependency threw while executing local-dev order path.",
      ],
    });
  }
}
