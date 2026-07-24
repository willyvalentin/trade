import type {
  AvanzaInstrumentSearchActionContract,
} from "./avanza-instrument-search-action-contract";
import type {
  AvanzaInstrumentSearchRouteContract,
} from "./avanza-instrument-search-route-contract";
import type {
  AvanzaRealWorldInstrumentSearchSignalPack,
} from "./avanza-real-world-instrument-search-signals";
import type {
  AvanzaOrderTicketActionContract,
} from "./avanza-order-ticket-action-contract";
import type {
  AvanzaOrderTicketFieldPlan,
  AvanzaOrderTicketOrderType,
  AvanzaOrderTicketSide,
  AvanzaOrderTicketTimeInForce,
} from "./avanza-order-ticket-field-contract";

export type AvanzaInstrumentToOrderHandoffChainStatus =
  | "disabled"
  | "waiting_for_execution_package"
  | "waiting_for_instrument_search"
  | "waiting_for_instrument_verification"
  | "waiting_for_order_field_plan"
  | "waiting_for_order_action_contract"
  | "handoff_chain_ready"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaInstrumentToOrderHandoffChainMode =
  | "disabled"
  | "chain_model"
  | "local_dev_chain_model";

export type AvanzaInstrumentToOrderHandoffStepType =
  | "no_op"
  | "build_instrument_search_package"
  | "plan_instrument_search_route"
  | "plan_instrument_search_actions"
  | "verify_instrument_identity"
  | "build_verified_instrument_state"
  | "build_order_ticket_field_plan"
  | "build_order_ticket_action_contract"
  | "stop_before_final_buy"
  | "stop_before_final_sell"
  | "stop_for_manual_user_action";

export type AvanzaExecutionPackageForOrderHandoff = {
  packageId?: string;
  createdAt?: string;
  source?: "recommendation" | "live_position_exit" | "manual_review" | "fixture";
  side?: AvanzaOrderTicketSide;
  ticker?: string;
  instrumentName?: string;
  expectedMarket?: string;
  expectedCurrency?: string;
  expectedInstrumentType?: string;
  expectedIsin?: string;
  quantity?: number;
  orderType?: AvanzaOrderTicketOrderType;
  limitPrice?: number;
  timeInForce?: AvanzaOrderTicketTimeInForce;
  accountType?: string;
  customerType?: string;
  recommendationId?: string;
  positionId?: string;
  confidence?: number;
  reason?: string;
  riskWarnings?: readonly string[];
  now?: string;
};

export type AvanzaVerifiedInstrumentHandoffState = {
  verificationId: string;
  createdAt: string;
  status:
    | "not_verified"
    | "verified_model_only"
    | "verification_blocked"
    | "unknown";
  ticker: string;
  instrumentName?: string;
  expectedMarket?: string;
  observedMarket?: string;
  expectedCurrency?: string;
  observedCurrency?: string;
  expectedInstrumentType?: string;
  observedInstrumentType?: string;
  expectedIsin?: string;
  observedIsin?: string;
  instrumentIdentityMatched: boolean;
  marketplaceMatched: boolean;
  shortNameMatched: boolean;
  isinMatchedOrUnavailable: boolean;
  buyButtonLocated: boolean;
  sellButtonLocated: boolean;
  warnings: string[];
  blockedReasons: string[];
};

export type AvanzaInstrumentToOrderHandoffStepValueSource =
  | "none"
  | "execution_package"
  | "search_contract"
  | "order_contract"
  | "verification_state"
  | "static_safe_signal"
  | "user_review";

export type AvanzaInstrumentToOrderHandoffStep = {
  stepId: string;
  type: AvanzaInstrumentToOrderHandoffStepType;
  label: string;
  reason: string;
  targetSignalText?: string;
  valueSource: AvanzaInstrumentToOrderHandoffStepValueSource;
  safeDisplayValue?: string;
  executableInThisTask: false;
  dryRunOnly: true;
  requiresHumanAction: boolean;
  forbidden: boolean;
  expectedResult: string;
};

export type AvanzaInstrumentToOrderHandoffChainSafetyFlags = {
  chainEnabled: boolean;
  canBuildChain: boolean;
  canExecuteChain: false;
  canSearchInstrument: false;
  canNavigateToInstrument: false;
  canVerifyInstrument: boolean;
  canOpenBuyEntry: false;
  canOpenSellEntry: false;
  canBuildOrderFieldPlan: boolean;
  canBuildOrderActionContract: boolean;
  canFillOrderFields: false;
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

export type AvanzaInstrumentToOrderHandoffChain =
  AvanzaInstrumentToOrderHandoffChainSafetyFlags & {
    chainId: string;
    createdAt: string;
    mode: AvanzaInstrumentToOrderHandoffChainMode;
    status: AvanzaInstrumentToOrderHandoffChainStatus;
    label: string;
    reason: string;
    side: AvanzaOrderTicketSide;
    ticker: string;
    instrumentName?: string;
    quantity?: number;
    orderType: AvanzaOrderTicketOrderType;
    limitPrice?: number;
    verifiedInstrumentState: AvanzaVerifiedInstrumentHandoffState;
    steps: AvanzaInstrumentToOrderHandoffStep[];
    nextExpectedState: string;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaInstrumentToOrderHandoffChainSafetyFlags;
  };

export type AvanzaInstrumentToOrderHandoffChainInput = {
  mode?: AvanzaInstrumentToOrderHandoffChainMode;
  chainEnabled?: boolean;
  executionPackage?: unknown;
  executionSettingsProfile?: unknown;
  realWorldInstrumentSearchSignals?: unknown;
  instrumentSearchRouteContract?: unknown;
  instrumentSearchActionContract?: unknown;
  realWorldOrderFlowSignals?: unknown;
  orderTicketFieldPlan?: unknown;
  orderTicketActionContract?: unknown;
  now?: string;
  chainId?: string;
  forceError?: boolean;
  forceUnknown?: boolean;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid|cookie|credential|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret|session|storage|token|order\s*id|orderid/i;

function isPlainObject(value: unknown): value is Record<string, unknown> {
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

function positiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function isExecutionPackage(
  value: unknown,
): value is AvanzaExecutionPackageForOrderHandoff {
  return isPlainObject(value);
}

function isInstrumentSearchSignals(
  value: unknown,
): value is AvanzaRealWorldInstrumentSearchSignalPack {
  return (
    isPlainObject(value) &&
    value.source === "sanitized_user_visual_material" &&
    typeof value.step === "string" &&
    Array.isArray(value.visibleTexts) &&
    Array.isArray(value.blockedReasons)
  );
}

function isInstrumentSearchRoute(
  value: unknown,
): value is AvanzaInstrumentSearchRouteContract {
  return (
    isPlainObject(value) &&
    typeof value.routeContractId === "string" &&
    typeof value.status === "string" &&
    typeof value.ticker === "string" &&
    typeof value.side === "string" &&
    Array.isArray(value.steps) &&
    Array.isArray(value.blockedReasons)
  );
}

function isInstrumentSearchAction(
  value: unknown,
): value is AvanzaInstrumentSearchActionContract {
  return (
    isPlainObject(value) &&
    typeof value.contractId === "string" &&
    typeof value.status === "string" &&
    typeof value.ticker === "string" &&
    typeof value.side === "string" &&
    Array.isArray(value.actions) &&
    Array.isArray(value.blockedReasons)
  );
}

function isOrderFieldPlan(value: unknown): value is AvanzaOrderTicketFieldPlan {
  return (
    isPlainObject(value) &&
    typeof value.fieldPlanId === "string" &&
    typeof value.status === "string" &&
    typeof value.side === "string" &&
    typeof value.ticker === "string" &&
    Array.isArray(value.fields) &&
    Array.isArray(value.blockedReasons)
  );
}

function isOrderActionContract(
  value: unknown,
): value is AvanzaOrderTicketActionContract {
  return (
    isPlainObject(value) &&
    typeof value.contractId === "string" &&
    typeof value.status === "string" &&
    typeof value.side === "string" &&
    typeof value.ticker === "string" &&
    Array.isArray(value.actions) &&
    Array.isArray(value.blockedReasons)
  );
}

function buildSafetyFlags(options: {
  chainEnabled: boolean;
  canBuildChain?: boolean;
  canVerifyInstrument?: boolean;
  canBuildOrderFieldPlan?: boolean;
  canBuildOrderActionContract?: boolean;
}): AvanzaInstrumentToOrderHandoffChainSafetyFlags {
  return {
    chainEnabled: options.chainEnabled,
    canBuildChain: options.canBuildChain === true,
    canExecuteChain: false,
    canSearchInstrument: false,
    canNavigateToInstrument: false,
    canVerifyInstrument: options.canVerifyInstrument === true,
    canOpenBuyEntry: false,
    canOpenSellEntry: false,
    canBuildOrderFieldPlan: options.canBuildOrderFieldPlan === true,
    canBuildOrderActionContract: options.canBuildOrderActionContract === true,
    canFillOrderFields: false,
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

function statusLabel(status: AvanzaInstrumentToOrderHandoffChainStatus) {
  switch (status) {
    case "disabled":
      return "Instrument to order handoff chain disabled";
    case "waiting_for_execution_package":
      return "Instrument to order handoff waiting for execution package";
    case "waiting_for_instrument_search":
      return "Instrument to order handoff waiting for instrument search";
    case "waiting_for_instrument_verification":
      return "Instrument to order handoff waiting for verification";
    case "waiting_for_order_field_plan":
      return "Instrument to order handoff waiting for order field plan";
    case "waiting_for_order_action_contract":
      return "Instrument to order handoff waiting for order action contract";
    case "handoff_chain_ready":
      return "Instrument to order handoff chain ready";
    case "blocked":
      return "Instrument to order handoff chain blocked";
    case "error":
      return "Instrument to order handoff chain error";
    case "unknown":
      return "Instrument to order handoff chain unknown";
  }
}

function defaultVerifiedState(
  createdAt: string,
): AvanzaVerifiedInstrumentHandoffState {
  return {
    verificationId: "avanza-instrument-verification-not-ready",
    createdAt,
    status: "not_verified",
    ticker: "missing",
    instrumentIdentityMatched: false,
    marketplaceMatched: false,
    shortNameMatched: false,
    isinMatchedOrUnavailable: false,
    buyButtonLocated: false,
    sellButtonLocated: false,
    warnings: [],
    blockedReasons: ["Instrument has not been verified."],
  };
}

function step(
  stepId: string,
  type: AvanzaInstrumentToOrderHandoffStepType,
  label: string,
  reason: string,
  expectedResult: string,
  options: {
    targetSignalText?: string;
    valueSource?: AvanzaInstrumentToOrderHandoffStepValueSource;
    safeDisplayValue?: string | number;
    requiresHumanAction?: boolean;
    forbidden?: boolean;
  } = {},
): AvanzaInstrumentToOrderHandoffStep {
  return {
    stepId,
    type,
    label,
    reason,
    targetSignalText: options.targetSignalText,
    valueSource: options.valueSource ?? "none",
    safeDisplayValue:
      options.safeDisplayValue === undefined
        ? undefined
        : String(options.safeDisplayValue),
    executableInThisTask: false,
    dryRunOnly: true,
    requiresHumanAction: options.requiresHumanAction ?? false,
    forbidden: options.forbidden ?? false,
    expectedResult,
  };
}

function noOpStep(reason: string) {
  return [
    step(
      "no_op_disabled",
      "no_op",
      "No handoff chain step",
      reason,
      "No chain step is planned.",
      { forbidden: true },
    ),
  ];
}

function buildBlockedReasons(
  executionPackage: AvanzaExecutionPackageForOrderHandoff,
) {
  const blockedReasons: string[] = [];
  const ticker = safeText(executionPackage.ticker);
  const quantity = positiveNumber(executionPackage.quantity);
  const limitPrice = positiveNumber(executionPackage.limitPrice);

  if (executionPackage.side !== "buy" && executionPackage.side !== "sell") {
    blockedReasons.push("Execution package side must be BUY or SELL.");
  }

  if (!ticker) {
    blockedReasons.push("Execution package ticker is required.");
  }

  if (quantity === undefined) {
    blockedReasons.push("Execution package quantity must be positive.");
  }

  if (executionPackage.orderType !== "limit") {
    blockedReasons.push("Only limit orders are modeled.");
  }

  if (limitPrice === undefined) {
    blockedReasons.push("Execution package limit price must be positive.");
  }

  return blockedReasons;
}

function buildVerifiedState(input: {
  createdAt: string;
  executionPackage: AvanzaExecutionPackageForOrderHandoff;
  signals: AvanzaRealWorldInstrumentSearchSignalPack;
  route: AvanzaInstrumentSearchRouteContract;
  action: AvanzaInstrumentSearchActionContract;
}): AvanzaVerifiedInstrumentHandoffState {
  const ticker = safeText(input.executionPackage.ticker) ?? "missing";
  const expectedMarket = safeText(input.executionPackage.expectedMarket);
  const expectedCurrency = safeText(input.executionPackage.expectedCurrency);
  const expectedInstrumentType = safeText(
    input.executionPackage.expectedInstrumentType,
  );
  const expectedIsin = safeText(input.executionPackage.expectedIsin);
  const instrumentName = safeText(input.executionPackage.instrumentName);
  const observedMarket = safeText(input.route.expectedMarket);
  const observedCurrency = safeText(input.route.expectedCurrency);
  const observedInstrumentType = safeText(input.route.expectedInstrumentType);
  const observedIsin = safeText(input.route.expectedIsin);
  const instrumentIdentityMatched =
    ticker !== "missing" &&
    input.route.ticker !== "missing" &&
    input.route.ticker.toLowerCase() === ticker.toLowerCase();
  const marketplaceMatched =
    !expectedMarket ||
    !observedMarket ||
    expectedMarket.toLowerCase() === observedMarket.toLowerCase();
  const shortNameMatched =
    !instrumentName ||
    input.route.instrumentName === "missing" ||
    input.route.instrumentName.toLowerCase().includes(instrumentName.toLowerCase()) ||
    instrumentName.toLowerCase().includes(input.route.instrumentName.toLowerCase());
  const isinMatchedOrUnavailable =
    !expectedIsin ||
    !observedIsin ||
    expectedIsin.toLowerCase() === observedIsin.toLowerCase();
  const buyButtonLocated =
    input.signals.buyButtonDetected && input.action.canLocateBuyButton;
  const sellButtonLocated =
    input.signals.sellButtonDetected && input.action.canLocateSellButton;
  const sideButtonLocated =
    input.executionPackage.side === "sell" ? sellButtonLocated : buyButtonLocated;
  const blockedReasons: string[] = [];

  if (!instrumentIdentityMatched) {
    blockedReasons.push("Ticker/instrument identity did not match.");
  }

  if (!marketplaceMatched) {
    blockedReasons.push("Marketplace did not match expected value.");
  }

  if (!isinMatchedOrUnavailable) {
    blockedReasons.push("ISIN did not match expected value.");
  }

  if (!sideButtonLocated) {
    blockedReasons.push("Required BUY/SELL entry button was not located.");
  }

  return {
    verificationId: `verified-${ticker.toLowerCase()}-${input.executionPackage.side ?? "unknown"}`,
    createdAt: input.createdAt,
    status: blockedReasons.length > 0 ? "verification_blocked" : "verified_model_only",
    ticker,
    instrumentName,
    expectedMarket,
    observedMarket,
    expectedCurrency,
    observedCurrency,
    expectedInstrumentType,
    observedInstrumentType,
    expectedIsin,
    observedIsin,
    instrumentIdentityMatched,
    marketplaceMatched,
    shortNameMatched,
    isinMatchedOrUnavailable,
    buyButtonLocated,
    sellButtonLocated,
    warnings: [
      ...safeStringArray(input.executionPackage.riskWarnings),
      ...input.signals.warnings,
      ...input.route.warnings,
      ...input.action.warnings,
    ],
    blockedReasons,
  };
}

function readySteps(input: {
  executionPackage: AvanzaExecutionPackageForOrderHandoff;
  verifiedState: AvanzaVerifiedInstrumentHandoffState;
  orderFieldPlan: AvanzaOrderTicketFieldPlan;
  orderActionContract: AvanzaOrderTicketActionContract;
}) {
  const side = input.executionPackage.side === "sell" ? "sell" : "buy";
  const finalType =
    side === "sell" ? "stop_before_final_sell" : "stop_before_final_buy";
  const finalLabel =
    side === "sell" ? "Stop before final SÄLJ" : "Stop before final KÖP";
  const finalSignal = side === "sell" ? "SÄLJ" : "KÖP";

  return [
    step(
      "build_instrument_search_package",
      "build_instrument_search_package",
      "Build instrument search package",
      "Ticker and instrument expectations come from the explicit execution package.",
      "Instrument search package is available for route planning.",
      {
        valueSource: "execution_package",
        safeDisplayValue: input.executionPackage.ticker,
      },
    ),
    step(
      "plan_instrument_search_route",
      "plan_instrument_search_route",
      "Plan instrument search route",
      "Instrument search route contract is available.",
      "The future route would search and open the instrument page.",
      { valueSource: "search_contract", targetSignalText: "Sök" },
    ),
    step(
      "plan_instrument_search_actions",
      "plan_instrument_search_actions",
      "Plan instrument search actions",
      "Instrument search action contract is available.",
      "The future action plan would stop before BUY/SELL entry click.",
      { valueSource: "search_contract", targetSignalText: finalSignal },
    ),
    step(
      "verify_instrument_identity",
      "verify_instrument_identity",
      "Verify instrument identity",
      "Safe instrument fields are matched in model-only state.",
      "Instrument verification is modeled as read-only.",
      {
        valueSource: "verification_state",
        targetSignalText: "Om depåbeviset",
        requiresHumanAction: true,
      },
    ),
    step(
      "build_verified_instrument_state",
      "build_verified_instrument_state",
      "Build verified instrument handoff state",
      "Verified instrument state links search output to order ticket preparation.",
      "Verified instrument handoff state is available.",
      {
        valueSource: "verification_state",
        safeDisplayValue: input.verifiedState.ticker,
      },
    ),
    step(
      "build_order_ticket_field_plan",
      "build_order_ticket_field_plan",
      "Build order ticket field plan",
      "Order ticket field plan is available.",
      "BUY/SELL limit-order fields are modeled.",
      {
        valueSource: "order_contract",
        safeDisplayValue: input.orderFieldPlan.fieldPlanId,
      },
    ),
    step(
      "build_order_ticket_action_contract",
      "build_order_ticket_action_contract",
      "Build order ticket action contract",
      "Order ticket action contract is available.",
      "Order preparation actions are modeled but non-executable.",
      {
        valueSource: "order_contract",
        safeDisplayValue: input.orderActionContract.contractId,
      },
    ),
    step(
      finalType,
      finalType,
      finalLabel,
      "The final order confirmation is human-only.",
      "The agent stops before final KÖP/SÄLJ.",
      {
        targetSignalText: finalSignal,
        valueSource: "user_review",
        requiresHumanAction: true,
        forbidden: true,
      },
    ),
    step(
      "stop_for_manual_user_action",
      "stop_for_manual_user_action",
      "Stop for manual user action",
      "Final human confirmation remains mandatory.",
      "The user manually decides whether to press final KÖP/SÄLJ.",
      {
        valueSource: "user_review",
        requiresHumanAction: true,
        forbidden: true,
      },
    ),
  ];
}

function baseChain(
  input: AvanzaInstrumentToOrderHandoffChainInput,
  status: AvanzaInstrumentToOrderHandoffChainStatus,
  reason: string,
  options: {
    executionPackage?: AvanzaExecutionPackageForOrderHandoff;
    verifiedInstrumentState?: AvanzaVerifiedInstrumentHandoffState;
    steps?: AvanzaInstrumentToOrderHandoffStep[];
    warnings?: string[];
    blockedReasons?: string[];
    canBuildChain?: boolean;
    canVerifyInstrument?: boolean;
    canBuildOrderFieldPlan?: boolean;
    canBuildOrderActionContract?: boolean;
    nextExpectedState?: string;
  } = {},
): AvanzaInstrumentToOrderHandoffChain {
  const chainEnabled =
    input.chainEnabled === true && (input.mode ?? "disabled") !== "disabled";
  const safetyFlags = buildSafetyFlags({
    chainEnabled,
    canBuildChain: options.canBuildChain,
    canVerifyInstrument: options.canVerifyInstrument,
    canBuildOrderFieldPlan: options.canBuildOrderFieldPlan,
    canBuildOrderActionContract: options.canBuildOrderActionContract,
  });
  const executionPackage = options.executionPackage;
  const verifiedInstrumentState =
    options.verifiedInstrumentState ?? defaultVerifiedState(input.now ?? defaultCreatedAt);

  return {
    ...safetyFlags,
    chainId: safeText(input.chainId) ?? "avanza-instrument-to-order-handoff-chain",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode: input.mode ?? "disabled",
    status,
    label: statusLabel(status),
    reason,
    side: executionPackage?.side ?? "unknown",
    ticker: safeText(executionPackage?.ticker) ?? "missing",
    instrumentName: safeText(executionPackage?.instrumentName),
    quantity: positiveNumber(executionPackage?.quantity),
    orderType: executionPackage?.orderType ?? "unknown",
    limitPrice: positiveNumber(executionPackage?.limitPrice),
    verifiedInstrumentState,
    steps: options.steps ?? noOpStep(reason),
    nextExpectedState:
      options.nextExpectedState ?? "No instrument to order handoff state change.",
    warnings: options.warnings ?? safeStringArray(executionPackage?.riskWarnings),
    blockedReasons: options.blockedReasons ?? [],
    safetyFlags,
  };
}

export function buildAvanzaInstrumentToOrderHandoffChain(
  input: AvanzaInstrumentToOrderHandoffChainInput = {},
): AvanzaInstrumentToOrderHandoffChain {
  if (input.forceError === true) {
    return baseChain(input, "error", "Instrument to order handoff chain returned an error.", {
      blockedReasons: ["Forced error fixture."],
    });
  }

  if (input.forceUnknown === true) {
    return baseChain(input, "unknown", "Instrument to order handoff chain state is unknown.", {
      blockedReasons: ["Forced unknown fixture."],
    });
  }

  if (input.chainEnabled !== true || input.mode === "disabled") {
    return baseChain(input, "disabled", "Instrument to order handoff chain is disabled.", {
      blockedReasons: ["Chain disabled."],
    });
  }

  if (input.executionPackage === undefined) {
    return baseChain(
      input,
      "waiting_for_execution_package",
      "Execution package is required before instrument search can be linked to order preparation.",
      { blockedReasons: ["Missing execution package."] },
    );
  }

  if (!isExecutionPackage(input.executionPackage)) {
    return baseChain(input, "blocked", "Execution package is invalid.", {
      blockedReasons: ["Invalid execution package."],
    });
  }

  const executionPackage = input.executionPackage;
  const blockedReasons = buildBlockedReasons(executionPackage);

  if (blockedReasons.length > 0) {
    return baseChain(input, "blocked", "Execution package is blocked.", {
      executionPackage,
      blockedReasons,
    });
  }

  if (
    !isInstrumentSearchSignals(input.realWorldInstrumentSearchSignals) ||
    !isInstrumentSearchRoute(input.instrumentSearchRouteContract) ||
    !isInstrumentSearchAction(input.instrumentSearchActionContract)
  ) {
    return baseChain(
      input,
      "waiting_for_instrument_search",
      "Instrument search signals, route contract, and action contract are required.",
      {
        executionPackage,
        blockedReasons: ["Waiting for complete instrument search model."],
      },
    );
  }

  const signals = input.realWorldInstrumentSearchSignals;
  const route = input.instrumentSearchRouteContract;
  const searchAction = input.instrumentSearchActionContract;

  if (
    route.status === "error" ||
    searchAction.status === "error" ||
    signals.step === "unknown" && signals.blockedReasons.length > 0
  ) {
    return baseChain(input, "error", "Instrument search model returned an error.", {
      executionPackage,
      blockedReasons: [
        ...signals.blockedReasons,
        ...route.blockedReasons,
        ...searchAction.blockedReasons,
      ],
    });
  }

  if (route.status === "unknown" || searchAction.status === "unknown") {
    return baseChain(input, "unknown", "Instrument search model state is unknown.", {
      executionPackage,
      blockedReasons: [...route.blockedReasons, ...searchAction.blockedReasons],
    });
  }

  if (route.status === "blocked" || searchAction.status === "blocked") {
    return baseChain(input, "blocked", "Instrument search model is blocked.", {
      executionPackage,
      blockedReasons: [...route.blockedReasons, ...searchAction.blockedReasons],
    });
  }

  if (
    route.status !== "instrument_verification_ready" ||
    searchAction.status !== "action_plan_ready" ||
    !signals.instrumentVerificationDetected
  ) {
    return baseChain(
      input,
      "waiting_for_instrument_verification",
      "Instrument verification must be modeled before order ticket preparation.",
      {
        executionPackage,
        canVerifyInstrument: true,
        nextExpectedState: "Waiting for read-only instrument verification.",
      },
    );
  }

  const verifiedInstrumentState = buildVerifiedState({
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    executionPackage,
    signals,
    route,
    action: searchAction,
  });

  if (verifiedInstrumentState.status === "verification_blocked") {
    return baseChain(input, "blocked", "Instrument verification is blocked.", {
      executionPackage,
      verifiedInstrumentState,
      canVerifyInstrument: true,
      blockedReasons: verifiedInstrumentState.blockedReasons,
      warnings: verifiedInstrumentState.warnings,
    });
  }

  if (!isOrderFieldPlan(input.orderTicketFieldPlan)) {
    return baseChain(
      input,
      "waiting_for_order_field_plan",
      "Order ticket field plan is required after verified instrument handoff.",
      {
        executionPackage,
        verifiedInstrumentState,
        canVerifyInstrument: true,
        blockedReasons: ["Missing order ticket field plan."],
      },
    );
  }

  const orderFieldPlan = input.orderTicketFieldPlan;

  if (orderFieldPlan.status === "error") {
    return baseChain(input, "error", "Order ticket field plan returned an error.", {
      executionPackage,
      verifiedInstrumentState,
      blockedReasons: orderFieldPlan.blockedReasons,
    });
  }

  if (orderFieldPlan.status === "unknown") {
    return baseChain(input, "unknown", "Order ticket field plan state is unknown.", {
      executionPackage,
      verifiedInstrumentState,
      blockedReasons: orderFieldPlan.blockedReasons,
    });
  }

  if (orderFieldPlan.status !== "field_mapping_ready") {
    return baseChain(input, "waiting_for_order_field_plan", "Order ticket field plan is not ready.", {
      executionPackage,
      verifiedInstrumentState,
      canVerifyInstrument: true,
      blockedReasons: orderFieldPlan.blockedReasons,
    });
  }

  if (!isOrderActionContract(input.orderTicketActionContract)) {
    return baseChain(
      input,
      "waiting_for_order_action_contract",
      "Order ticket action contract is required after field planning.",
      {
        executionPackage,
        verifiedInstrumentState,
        canVerifyInstrument: true,
        canBuildOrderFieldPlan: true,
        blockedReasons: ["Missing order ticket action contract."],
      },
    );
  }

  const orderActionContract = input.orderTicketActionContract;

  if (orderActionContract.status === "error") {
    return baseChain(input, "error", "Order ticket action contract returned an error.", {
      executionPackage,
      verifiedInstrumentState,
      blockedReasons: orderActionContract.blockedReasons,
    });
  }

  if (orderActionContract.status === "unknown") {
    return baseChain(input, "unknown", "Order ticket action contract state is unknown.", {
      executionPackage,
      verifiedInstrumentState,
      blockedReasons: orderActionContract.blockedReasons,
    });
  }

  if (orderActionContract.status !== "action_plan_ready") {
    return baseChain(
      input,
      "waiting_for_order_action_contract",
      "Order ticket action contract is not ready.",
      {
        executionPackage,
        verifiedInstrumentState,
        canVerifyInstrument: true,
        canBuildOrderFieldPlan: true,
        blockedReasons: orderActionContract.blockedReasons,
      },
    );
  }

  return baseChain(
    input,
    "handoff_chain_ready",
    "Full pre-submit instrument search to order ticket handoff chain is modeled.",
    {
      executionPackage,
      verifiedInstrumentState,
      steps: readySteps({
        executionPackage,
        verifiedState: verifiedInstrumentState,
        orderFieldPlan,
        orderActionContract,
      }),
      warnings: [
        ...verifiedInstrumentState.warnings,
        ...orderFieldPlan.warnings,
        ...orderActionContract.warnings,
      ],
      canBuildChain: true,
      canVerifyInstrument: true,
      canBuildOrderFieldPlan: true,
      canBuildOrderActionContract: true,
      nextExpectedState:
        executionPackage.side === "sell"
          ? "Stop before final SÄLJ; user must confirm manually."
          : "Stop before final KÖP; user must confirm manually.",
    },
  );
}
