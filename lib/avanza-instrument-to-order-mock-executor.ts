import type {
  AvanzaInstrumentToOrderDryRunReport,
} from "./avanza-instrument-to-order-dry-run-executor";
import type {
  AvanzaInstrumentToOrderHandoffChain,
  AvanzaInstrumentToOrderHandoffStepValueSource,
} from "./avanza-instrument-to-order-handoff-chain";
import type {
  AvanzaOrderTicketOrderType,
  AvanzaOrderTicketSide,
} from "./avanza-order-ticket-field-contract";

export type AvanzaInstrumentToOrderMockExecutorStatus =
  | "disabled"
  | "mock_ready"
  | "mock_executed"
  | "mock_blocked"
  | "mock_instrument_not_found"
  | "mock_instrument_verification_failed"
  | "mock_order_ticket_blocked"
  | "mock_final_human_action_required"
  | "mock_error"
  | "unknown";

export type AvanzaInstrumentToOrderMockActionStatus =
  | "skipped"
  | "simulated"
  | "blocked"
  | "blocked_instrument_not_found"
  | "blocked_instrument_verification"
  | "blocked_order_ticket"
  | "final_human_action_required"
  | "forbidden"
  | "error";

export type AvanzaInstrumentToOrderMockPageStateKind =
  | "initial_logged_in_page"
  | "search_panel_open"
  | "search_results_visible"
  | "instrument_detail_page"
  | "instrument_verified"
  | "buy_sell_entry_available"
  | "order_ticket_open"
  | "order_review_ready"
  | "final_human_action"
  | "unknown";

export type AvanzaInstrumentToOrderMockExecutorMode =
  | "disabled"
  | "mock_local_dev";

export type AvanzaInstrumentToOrderMockPageState = {
  stateId: string;
  kind: AvanzaInstrumentToOrderMockPageStateKind;
  searchButtonVisible: boolean;
  searchPanelVisible: boolean;
  searchInputVisible: boolean;
  searchResultsVisible: boolean;
  matchingInstrumentVisible: boolean;
  instrumentPageVisible: boolean;
  instrumentIdentityVerified: boolean;
  marketplaceVerified: boolean;
  shortNameVerified: boolean;
  isinVerifiedOrUnavailable: boolean;
  buyButtonVisible: boolean;
  sellButtonVisible: boolean;
  orderTicketVisible: boolean;
  quantityFieldVisible: boolean;
  limitPriceFieldVisible: boolean;
  limitOrderTypeVisible: boolean;
  reviewButtonVisible: boolean;
  finalBuyButtonVisible: boolean;
  finalSellButtonVisible: boolean;
  visibleTexts: string[];
  warnings: string[];
  blockedReasons: string[];
};

export type AvanzaInstrumentToOrderMockExecutorSafetyFlags = {
  mockExecutorEnabled: boolean;
  mockOnly: true;
  canExecuteMockActions: boolean;
  canExecuteRealBrowserActions: false;
  canSearchInstrumentReal: false;
  canNavigateRealBrowser: false;
  canFillOrderFieldsReal: false;
  canClickReal: false;
  canOpenBuyEntryReal: false;
  canOpenSellEntryReal: false;
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

export type AvanzaInstrumentToOrderMockActionReport = {
  actionId: string;
  actionType: string;
  label: string;
  executionStatus: AvanzaInstrumentToOrderMockActionStatus;
  simulatedTargetText?: string;
  simulatedValueSource: AvanzaInstrumentToOrderHandoffStepValueSource;
  safeDisplayValue?: string;
  containsCredentialMaterial: false;
  realBrowserAction: false;
  expectedResult: string;
  actualMockResult: string;
  blockedReason?: string;
};

export type AvanzaInstrumentToOrderMockExecutorInput = {
  mode?: AvanzaInstrumentToOrderMockExecutorMode;
  mockExecutorEnabled?: boolean;
  handoffChain?: unknown;
  dryRunReport?: unknown;
  executionPackage?: unknown;
  initialMockPageState?: unknown;
  now?: string;
  reportId?: string;
  forceError?: boolean;
  forceUnknown?: boolean;
};

export type AvanzaInstrumentToOrderMockExecutorReport =
  AvanzaInstrumentToOrderMockExecutorSafetyFlags & {
    reportId: string;
    createdAt: string;
    mode: AvanzaInstrumentToOrderMockExecutorMode;
    status: AvanzaInstrumentToOrderMockExecutorStatus;
    label: string;
    reason: string;
    side: AvanzaOrderTicketSide;
    ticker: string;
    instrumentName?: string;
    quantity?: number;
    orderType: AvanzaOrderTicketOrderType;
    limitPrice?: number;
    initialPageStateKind: AvanzaInstrumentToOrderMockPageStateKind;
    finalPageStateKind: AvanzaInstrumentToOrderMockPageStateKind;
    instrumentVerificationPassed: boolean;
    orderTicketPrepared: boolean;
    orderReviewReady: boolean;
    finalHumanActionRequired: true;
    orderSubmitted: false;
    actionReports: AvanzaInstrumentToOrderMockActionReport[];
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaInstrumentToOrderMockExecutorSafetyFlags;
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

function isDryRunReport(value: unknown): value is AvanzaInstrumentToOrderDryRunReport {
  return (
    isRecord(value) &&
    typeof value.dryRunId === "string" &&
    typeof value.status === "string" &&
    typeof value.side === "string" &&
    typeof value.ticker === "string" &&
    Array.isArray(value.stepReports) &&
    Array.isArray(value.blockedReasons)
  );
}

function createMockPageState(
  kind: AvanzaInstrumentToOrderMockPageStateKind,
  side: AvanzaOrderTicketSide = "unknown",
  stateId: string = kind,
): AvanzaInstrumentToOrderMockPageState {
  const searchPanelOpen = kind !== "initial_logged_in_page" && kind !== "unknown";
  const searchResultsVisible =
    kind !== "initial_logged_in_page" &&
    kind !== "search_panel_open" &&
    kind !== "unknown";
  const instrumentPageVisible =
    kind === "instrument_detail_page" ||
    kind === "instrument_verified" ||
    kind === "buy_sell_entry_available" ||
    kind === "order_ticket_open" ||
    kind === "order_review_ready" ||
    kind === "final_human_action";
  const instrumentVerified =
    kind === "instrument_verified" ||
    kind === "buy_sell_entry_available" ||
    kind === "order_ticket_open" ||
    kind === "order_review_ready" ||
    kind === "final_human_action";
  const entryAvailable =
    kind === "buy_sell_entry_available" ||
    kind === "order_ticket_open" ||
    kind === "order_review_ready" ||
    kind === "final_human_action";
  const orderTicketVisible =
    kind === "order_ticket_open" ||
    kind === "order_review_ready" ||
    kind === "final_human_action";
  const reviewReady =
    kind === "order_review_ready" || kind === "final_human_action";

  return {
    stateId,
    kind,
    searchButtonVisible: kind !== "unknown",
    searchPanelVisible: searchPanelOpen,
    searchInputVisible: searchPanelOpen,
    searchResultsVisible,
    matchingInstrumentVisible: searchResultsVisible,
    instrumentPageVisible,
    instrumentIdentityVerified: instrumentVerified,
    marketplaceVerified: instrumentVerified,
    shortNameVerified: instrumentVerified,
    isinVerifiedOrUnavailable: instrumentVerified,
    buyButtonVisible: entryAvailable && side !== "sell",
    sellButtonVisible: entryAvailable && side !== "buy",
    orderTicketVisible,
    quantityFieldVisible: orderTicketVisible,
    limitPriceFieldVisible: orderTicketVisible,
    limitOrderTypeVisible: orderTicketVisible,
    reviewButtonVisible: reviewReady,
    finalBuyButtonVisible: reviewReady && side !== "sell",
    finalSellButtonVisible: reviewReady && side !== "buy",
    visibleTexts: [],
    warnings: [],
    blockedReasons: [],
  };
}

function isMockPageState(value: unknown): value is AvanzaInstrumentToOrderMockPageState {
  return (
    isRecord(value) &&
    typeof value.stateId === "string" &&
    typeof value.kind === "string" &&
    Array.isArray(value.visibleTexts) &&
    Array.isArray(value.warnings) &&
    Array.isArray(value.blockedReasons)
  );
}

function buildSafetyFlags(options: {
  mockExecutorEnabled: boolean;
  canExecuteMockActions?: boolean;
}): AvanzaInstrumentToOrderMockExecutorSafetyFlags {
  return {
    mockExecutorEnabled: options.mockExecutorEnabled,
    mockOnly: true,
    canExecuteMockActions: options.canExecuteMockActions === true,
    canExecuteRealBrowserActions: false,
    canSearchInstrumentReal: false,
    canNavigateRealBrowser: false,
    canFillOrderFieldsReal: false,
    canClickReal: false,
    canOpenBuyEntryReal: false,
    canOpenSellEntryReal: false,
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

function statusLabel(status: AvanzaInstrumentToOrderMockExecutorStatus) {
  switch (status) {
    case "disabled":
      return "Instrument to order mock executor disabled";
    case "mock_ready":
      return "Instrument to order mock executor ready";
    case "mock_executed":
      return "Instrument to order mock executor simulated";
    case "mock_blocked":
      return "Instrument to order mock executor blocked";
    case "mock_instrument_not_found":
      return "Mock instrument was not found";
    case "mock_instrument_verification_failed":
      return "Mock instrument verification failed";
    case "mock_order_ticket_blocked":
      return "Mock order ticket preparation blocked";
    case "mock_final_human_action_required":
      return "Mock executor reached final human action";
    case "mock_error":
      return "Instrument to order mock executor error";
    case "unknown":
      return "Instrument to order mock executor unknown";
  }
}

function actionReport(options: {
  actionId: string;
  actionType: string;
  label: string;
  executionStatus?: AvanzaInstrumentToOrderMockActionStatus;
  simulatedTargetText?: string;
  simulatedValueSource?: AvanzaInstrumentToOrderHandoffStepValueSource;
  safeDisplayValue?: string;
  expectedResult: string;
  actualMockResult: string;
  blockedReason?: string;
}): AvanzaInstrumentToOrderMockActionReport {
  return {
    actionId: options.actionId,
    actionType: options.actionType,
    label: options.label,
    executionStatus: options.executionStatus ?? "simulated",
    simulatedTargetText: safeText(options.simulatedTargetText),
    simulatedValueSource: options.simulatedValueSource ?? "none",
    safeDisplayValue: safeText(options.safeDisplayValue),
    containsCredentialMaterial: false,
    realBrowserAction: false,
    expectedResult: options.expectedResult,
    actualMockResult: options.actualMockResult,
    blockedReason: options.blockedReason,
  };
}

function noOpAction(
  executionStatus: AvanzaInstrumentToOrderMockActionStatus,
  reason: string,
): AvanzaInstrumentToOrderMockActionReport[] {
  return [
    actionReport({
      actionId: "no_op",
      actionType: "no_op",
      actualMockResult: "No mock page action was simulated.",
      blockedReason: reason,
      executionStatus,
      expectedResult: "No mock page state change.",
      label: "No mock action",
    }),
  ];
}

function baseReport(
  input: AvanzaInstrumentToOrderMockExecutorInput,
  status: AvanzaInstrumentToOrderMockExecutorStatus,
  reason: string,
  options: {
    chain?: AvanzaInstrumentToOrderHandoffChain;
    dryRunReport?: AvanzaInstrumentToOrderDryRunReport;
    initialPageState?: AvanzaInstrumentToOrderMockPageState;
    finalPageStateKind?: AvanzaInstrumentToOrderMockPageStateKind;
    actionReports?: AvanzaInstrumentToOrderMockActionReport[];
    warnings?: string[];
    blockedReasons?: string[];
    canExecuteMockActions?: boolean;
    instrumentVerificationPassed?: boolean;
    orderTicketPrepared?: boolean;
    orderReviewReady?: boolean;
  } = {},
): AvanzaInstrumentToOrderMockExecutorReport {
  const mockExecutorEnabled =
    input.mockExecutorEnabled === true && (input.mode ?? "disabled") !== "disabled";
  const safetyFlags = buildSafetyFlags({
    mockExecutorEnabled,
    canExecuteMockActions: options.canExecuteMockActions,
  });
  const chain = options.chain;
  const dryRunReport = options.dryRunReport;
  const side = chain?.side ?? dryRunReport?.side ?? "unknown";
  const initialPageState =
    options.initialPageState ?? createMockPageState("initial_logged_in_page", side);

  return {
    ...safetyFlags,
    reportId: safeText(input.reportId) ?? "avanza-instrument-to-order-mock-executor",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode: input.mode ?? "disabled",
    status,
    label: statusLabel(status),
    reason,
    side,
    ticker: chain?.ticker ?? dryRunReport?.ticker ?? "missing",
    instrumentName: chain?.instrumentName ?? dryRunReport?.instrumentName,
    quantity: chain?.quantity ?? dryRunReport?.quantity,
    orderType: chain?.orderType ?? dryRunReport?.orderType ?? "unknown",
    limitPrice: chain?.limitPrice ?? dryRunReport?.limitPrice,
    initialPageStateKind: initialPageState.kind,
    finalPageStateKind: options.finalPageStateKind ?? initialPageState.kind,
    instrumentVerificationPassed:
      options.instrumentVerificationPassed === true,
    orderTicketPrepared: options.orderTicketPrepared === true,
    orderReviewReady: options.orderReviewReady === true,
    finalHumanActionRequired: true,
    orderSubmitted: false,
    actionReports: options.actionReports ?? noOpAction("skipped", reason),
    warnings: options.warnings ?? [
      ...safeStringArray(chain?.warnings),
      ...safeStringArray(dryRunReport?.warnings),
      ...safeStringArray(initialPageState.warnings),
    ],
    blockedReasons: options.blockedReasons ?? [],
    safetyFlags,
  };
}

function buildSuccessfulActions(
  chain: AvanzaInstrumentToOrderHandoffChain,
): AvanzaInstrumentToOrderMockActionReport[] {
  const sideLabel = chain.side === "sell" ? "SÄLJ" : "KÖP";

  return [
    actionReport({
      actionId: "mock_open_search_panel",
      actionType: "open_search_panel",
      actualMockResult: "Mock search panel visible.",
      expectedResult: "Search panel simulated.",
      label: "Simulate opening search panel",
      simulatedTargetText: "Sök",
      simulatedValueSource: "static_safe_signal",
    }),
    actionReport({
      actionId: "mock_enter_search_query",
      actionType: "enter_search_query",
      actualMockResult: `Mock search query set to ${chain.ticker}.`,
      expectedResult: "Search query simulated with safe ticker.",
      label: "Simulate search query",
      safeDisplayValue: chain.ticker,
      simulatedTargetText: "Sök värdepapper",
      simulatedValueSource: "execution_package",
    }),
    actionReport({
      actionId: "mock_show_search_results",
      actionType: "show_search_results",
      actualMockResult: "Mock search results visible.",
      expectedResult: "Search results simulated.",
      label: "Simulate search results",
      simulatedValueSource: "search_contract",
    }),
    actionReport({
      actionId: "mock_select_matching_instrument",
      actionType: "select_matching_instrument",
      actualMockResult: "Mock matching instrument selected.",
      expectedResult: "Matching instrument selection simulated.",
      label: "Simulate matching instrument selection",
      safeDisplayValue: chain.instrumentName ?? chain.ticker,
      simulatedValueSource: "search_contract",
    }),
    actionReport({
      actionId: "mock_verify_instrument_identity",
      actionType: "verify_instrument_identity",
      actualMockResult: "Mock instrument identity verified.",
      expectedResult: "Instrument verification simulated.",
      label: "Simulate instrument verification",
      simulatedValueSource: "verification_state",
    }),
    actionReport({
      actionId: "mock_locate_buy_sell_entry",
      actionType: "locate_buy_sell_entry",
      actualMockResult: `Mock ${sideLabel} entry located.`,
      expectedResult: "BUY/SELL entry location simulated.",
      label: `Simulate locating ${sideLabel} entry`,
      simulatedTargetText: sideLabel,
      simulatedValueSource: "static_safe_signal",
    }),
    actionReport({
      actionId: "mock_open_order_ticket",
      actionType: "open_order_ticket",
      actualMockResult: "Mock order ticket visible.",
      expectedResult: "Order ticket state simulated without browser action.",
      label: "Simulate order ticket state",
      simulatedValueSource: "order_contract",
    }),
    actionReport({
      actionId: "mock_prepare_order_ticket_fields",
      actionType: "prepare_order_ticket_fields",
      actualMockResult: "Mock order ticket fields prepared.",
      expectedResult: "Order ticket preparation simulated.",
      label: "Simulate order ticket field preparation",
      safeDisplayValue: `${chain.quantity ?? "n/a"} ${chain.orderType}`,
      simulatedValueSource: "order_contract",
    }),
    actionReport({
      actionId: "mock_reach_review_ready_state",
      actionType: "reach_review_ready_state",
      actualMockResult: "Mock review-ready state reached.",
      expectedResult: "Review-ready state simulated.",
      label: "Simulate review-ready state",
      simulatedValueSource: "user_review",
    }),
    actionReport({
      actionId:
        chain.side === "sell"
          ? "mock_stop_before_final_salj"
          : "mock_stop_before_final_kop",
      actionType:
        chain.side === "sell"
          ? "stop_before_final_salj"
          : "stop_before_final_kop",
      actualMockResult: `Stopped before final ${sideLabel}.`,
      expectedResult: "Final human confirmation required.",
      executionStatus: "final_human_action_required",
      label: `Stop before final ${sideLabel}`,
      simulatedTargetText: sideLabel,
      simulatedValueSource: "user_review",
    }),
  ];
}

export function createAvanzaInstrumentToOrderMockPageState(
  kind: AvanzaInstrumentToOrderMockPageStateKind,
  side: AvanzaOrderTicketSide = "unknown",
): AvanzaInstrumentToOrderMockPageState {
  return createMockPageState(kind, side);
}

export function buildAvanzaInstrumentToOrderMockExecutorReport(
  input: AvanzaInstrumentToOrderMockExecutorInput = {},
): AvanzaInstrumentToOrderMockExecutorReport {
  if (input.forceError === true) {
    return baseReport(
      input,
      "mock_error",
      "Instrument to order mock executor returned an error.",
      {
        actionReports: noOpAction("error", "Forced error fixture."),
        blockedReasons: ["Forced error fixture."],
      },
    );
  }

  if (input.forceUnknown === true) {
    return baseReport(
      input,
      "unknown",
      "Instrument to order mock executor state is unknown.",
      {
        blockedReasons: ["Forced unknown fixture."],
      },
    );
  }

  if (input.mockExecutorEnabled !== true || input.mode === "disabled") {
    return baseReport(
      input,
      "disabled",
      "Instrument to order mock executor is disabled.",
      {
        blockedReasons: ["Mock executor disabled."],
      },
    );
  }

  const chain = isHandoffChain(input.handoffChain)
    ? input.handoffChain
    : undefined;
  const dryRunReport = isDryRunReport(input.dryRunReport)
    ? input.dryRunReport
    : undefined;
  const initialPageState = isMockPageState(input.initialMockPageState)
    ? input.initialMockPageState
    : createMockPageState("initial_logged_in_page", chain?.side ?? "unknown");

  if (!chain || !dryRunReport || dryRunReport.status !== "dry_run_final_human_action_required") {
    return baseReport(
      input,
      "mock_blocked",
      "A completed dry-run report and handoff chain are required before mock execution.",
      {
        chain,
        dryRunReport,
        initialPageState,
        blockedReasons: [
          "Missing or blocked dry-run/handoff chain.",
        ],
        actionReports: noOpAction("blocked", "Missing or blocked dry-run/handoff chain."),
      },
    );
  }

  if (!initialPageState.matchingInstrumentVisible && initialPageState.kind !== "initial_logged_in_page") {
    return baseReport(
      input,
      "mock_instrument_not_found",
      "The simulated page state does not expose a matching instrument.",
      {
        chain,
        dryRunReport,
        initialPageState,
        finalPageStateKind: initialPageState.kind,
        blockedReasons: ["Matching instrument not visible in mock page state."],
        actionReports: noOpAction(
          "blocked_instrument_not_found",
          "Matching instrument not visible in mock page state.",
        ),
      },
    );
  }

  const instrumentVerificationPassed =
    dryRunReport.instrumentVerificationPassed === true &&
    (initialPageState.kind === "initial_logged_in_page" ||
      (initialPageState.instrumentIdentityVerified &&
        initialPageState.marketplaceVerified &&
        initialPageState.shortNameVerified &&
        initialPageState.isinVerifiedOrUnavailable));

  if (!instrumentVerificationPassed) {
    return baseReport(
      input,
      "mock_instrument_verification_failed",
      "The simulated instrument verification did not pass.",
      {
        chain,
        dryRunReport,
        initialPageState,
        finalPageStateKind: "instrument_detail_page",
        blockedReasons: ["Mock instrument verification failed."],
        actionReports: noOpAction(
          "blocked_instrument_verification",
          "Mock instrument verification failed.",
        ),
      },
    );
  }

  if (
    dryRunReport.orderFieldPlanReady !== true ||
    dryRunReport.orderActionPlanReady !== true ||
    (initialPageState.kind !== "initial_logged_in_page" &&
      (!initialPageState.quantityFieldVisible ||
        !initialPageState.limitPriceFieldVisible ||
        !initialPageState.limitOrderTypeVisible))
  ) {
    return baseReport(
      input,
      "mock_order_ticket_blocked",
      "The simulated order ticket plan is not ready.",
      {
        chain,
        dryRunReport,
        initialPageState,
        finalPageStateKind: "order_ticket_open",
        instrumentVerificationPassed,
        blockedReasons: ["Mock order ticket preparation blocked."],
        actionReports: noOpAction(
          "blocked_order_ticket",
          "Mock order ticket preparation blocked.",
        ),
      },
    );
  }

  return baseReport(
    input,
    "mock_final_human_action_required",
    "Full pre-submit flow simulated with simulated Avanza page state and stopped before final KÖP/SÄLJ.",
    {
      actionReports: buildSuccessfulActions(chain),
      canExecuteMockActions: input.mode === "mock_local_dev",
      chain,
      dryRunReport,
      finalPageStateKind: "final_human_action",
      initialPageState,
      instrumentVerificationPassed: true,
      orderReviewReady: true,
      orderTicketPrepared: true,
    },
  );
}
