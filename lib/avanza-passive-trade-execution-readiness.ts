export type AvanzaPassiveTradeExecutionReadinessStatus =
  | "ready_passive"
  | "incomplete_profile"
  | "missing_trade_package"
  | "missing_ticker"
  | "missing_side"
  | "missing_quantity"
  | "missing_limit_price"
  | "blocked"
  | "local_dev_only"
  | "unknown";

export type AvanzaPassiveTradeExecutionReadinessSource =
  | "recommendation"
  | "live_position"
  | "fixture"
  | "manual_review"
  | "unknown";

export type AvanzaPassiveTradeExecutionReadinessIntent =
  | "entry_buy"
  | "exit_sell"
  | "review_only"
  | "unknown";

export type AvanzaPassiveTradeExecutionReadinessSide =
  | "buy"
  | "sell"
  | "unknown";

export type AvanzaPassiveTradeExecutionReadinessOrderType =
  | "limit"
  | "market_forbidden"
  | "unknown";

export type AvanzaPassiveTradeExecutionReadinessSafetyFlags = {
  readinessOnly: true;
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

export type AvanzaPassiveTradeExecutionReadinessInput = {
  readinessId?: string;
  source?: AvanzaPassiveTradeExecutionReadinessSource;
  intent?: AvanzaPassiveTradeExecutionReadinessIntent;
  ticker?: string;
  instrumentName?: string;
  side?: AvanzaPassiveTradeExecutionReadinessSide;
  quantity?: number;
  limitPrice?: number;
  orderType?: AvanzaPassiveTradeExecutionReadinessOrderType;
  recommendationId?: string;
  positionId?: string;
  profileReady?: boolean;
  loginModeled?: boolean;
  instrumentSearchModeled?: boolean;
  orderPrepModeled?: boolean;
  settlementModeled?: boolean;
  now?: string;
  warnings?: readonly string[];
  blockers?: readonly string[];
};

export type AvanzaPassiveTradeExecutionReadinessModel = {
  readinessId: string;
  createdAt: string;
  status: AvanzaPassiveTradeExecutionReadinessStatus;
  label: string;
  reason: string;
  source: AvanzaPassiveTradeExecutionReadinessSource;
  intent: AvanzaPassiveTradeExecutionReadinessIntent;
  ticker?: string;
  instrumentName?: string;
  side: AvanzaPassiveTradeExecutionReadinessSide;
  quantity?: number;
  limitPrice?: number;
  orderType: AvanzaPassiveTradeExecutionReadinessOrderType;
  recommendationId?: string;
  positionId?: string;
  profileReady: boolean;
  loginModeled: boolean;
  instrumentSearchModeled: boolean;
  orderPrepModeled: boolean;
  settlementModeled: boolean;
  localDevOnly: true;
  canTheoreticallyPrepareOrder: boolean;
  blockers: string[];
  warnings: string[];
  nextPassiveStep: string;
  hardStops: string[];
  safetyFlags: AvanzaPassiveTradeExecutionReadinessSafetyFlags;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";

export const avanzaPassiveTradeExecutionReadinessSafetyFlags:
  AvanzaPassiveTradeExecutionReadinessSafetyFlags = {
    readinessOnly: true,
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

const hardStops = [
  "final KÖP/SÄLJ human-only",
  "no order submission",
  "no BankID automation",
  "no cookies/session",
  "no Trade UI execution wiring",
  "no API route wiring",
  "local-dev only",
] as const;

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();

  return trimmed ? trimmed : undefined;
}

function safeTextArray(values: unknown): string[] {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        const text = safeText(value);

        return text ? [text] : [];
      })
    : [];
}

function safePositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function normalizeSource(
  source: AvanzaPassiveTradeExecutionReadinessInput["source"],
): AvanzaPassiveTradeExecutionReadinessSource {
  if (
    source === "recommendation" ||
    source === "live_position" ||
    source === "fixture" ||
    source === "manual_review"
  ) {
    return source;
  }

  return "unknown";
}

function normalizeIntent(
  intent: AvanzaPassiveTradeExecutionReadinessInput["intent"],
): AvanzaPassiveTradeExecutionReadinessIntent {
  if (
    intent === "entry_buy" ||
    intent === "exit_sell" ||
    intent === "review_only"
  ) {
    return intent;
  }

  return "unknown";
}

function normalizeSide(
  side: AvanzaPassiveTradeExecutionReadinessInput["side"],
): AvanzaPassiveTradeExecutionReadinessSide {
  if (side === "buy" || side === "sell") return side;

  return "unknown";
}

function normalizeOrderType(
  orderType: AvanzaPassiveTradeExecutionReadinessInput["orderType"],
): AvanzaPassiveTradeExecutionReadinessOrderType {
  if (orderType === "limit" || orderType === "market_forbidden") {
    return orderType;
  }

  return "unknown";
}

function inferStatus(input: {
  ticker?: string;
  side: AvanzaPassiveTradeExecutionReadinessSide;
  quantity?: number;
  limitPrice?: number;
  orderType: AvanzaPassiveTradeExecutionReadinessOrderType;
  profileReady: boolean;
  loginModeled: boolean;
  instrumentSearchModeled: boolean;
  orderPrepModeled: boolean;
  settlementModeled: boolean;
  explicitBlockers: readonly string[];
}): AvanzaPassiveTradeExecutionReadinessStatus {
  if (input.explicitBlockers.length > 0) return "blocked";
  if (!input.profileReady) return "incomplete_profile";
  if (!input.ticker && input.side === "unknown" && !input.quantity && !input.limitPrice) {
    return "missing_trade_package";
  }
  if (!input.ticker) return "missing_ticker";
  if (input.side === "unknown") return "missing_side";
  if (!input.quantity) return "missing_quantity";
  if (input.orderType === "market_forbidden") return "blocked";
  if (!input.limitPrice) return "missing_limit_price";
  if (
    input.loginModeled &&
    input.instrumentSearchModeled &&
    input.orderPrepModeled &&
    input.settlementModeled &&
    input.orderType === "limit"
  ) {
    return "ready_passive";
  }

  return "local_dev_only";
}

function defaultReason(status: AvanzaPassiveTradeExecutionReadinessStatus) {
  if (status === "ready_passive") {
    return "Trade execution readiness is modeled as passive metadata only.";
  }
  if (status === "incomplete_profile") {
    return "Ture Settings Avanza execution profile is incomplete.";
  }
  if (status === "missing_trade_package") {
    return "No recommendation or live-position trade package is available.";
  }
  if (status === "missing_ticker") return "Ticker is missing.";
  if (status === "missing_side") return "BUY/SELL side is missing.";
  if (status === "missing_quantity") return "Quantity is missing.";
  if (status === "missing_limit_price") return "Limit price is missing.";
  if (status === "blocked") {
    return "Passive readiness is blocked by a hard safety condition.";
  }
  if (status === "local_dev_only") {
    return "Readiness metadata is available for local-dev review only.";
  }

  return "Passive readiness state is unknown.";
}

function nextPassiveStep(status: AvanzaPassiveTradeExecutionReadinessStatus) {
  if (status === "ready_passive") {
    return "Review passive readiness metadata; final Avanza action remains human-only.";
  }
  if (status === "incomplete_profile") {
    return "Complete the passive Avanza execution profile in Settings.";
  }
  if (status.startsWith("missing_")) {
    return "Provide a complete explicit recommendation or live-position package.";
  }
  if (status === "blocked") {
    return "Keep execution disabled and resolve the blocking safety reason.";
  }

  return "Keep this as passive local-dev readiness metadata.";
}

function buildBlockers(input: {
  status: AvanzaPassiveTradeExecutionReadinessStatus;
  explicitBlockers: readonly string[];
  orderType: AvanzaPassiveTradeExecutionReadinessOrderType;
}) {
  const blockers = [...input.explicitBlockers];

  if (input.orderType === "market_forbidden") {
    blockers.push("Market order is forbidden for this passive readiness layer.");
  }
  if (input.status === "incomplete_profile") {
    blockers.push("Ture Settings Avanza execution profile is incomplete.");
  }
  if (input.status === "missing_trade_package") {
    blockers.push("Trade package is missing.");
  }
  if (input.status === "missing_ticker") blockers.push("Ticker is missing.");
  if (input.status === "missing_side") blockers.push("Side is missing.");
  if (input.status === "missing_quantity") blockers.push("Quantity is missing.");
  if (input.status === "missing_limit_price") {
    blockers.push("Limit price is missing.");
  }

  return [...new Set(blockers)];
}

export function buildAvanzaPassiveTradeExecutionReadiness(
  input: AvanzaPassiveTradeExecutionReadinessInput = {},
): AvanzaPassiveTradeExecutionReadinessModel {
  const source = normalizeSource(input.source);
  const intent = normalizeIntent(input.intent);
  const side = normalizeSide(input.side);
  const orderType = normalizeOrderType(input.orderType);
  const ticker = safeText(input.ticker)?.toUpperCase();
  const instrumentName = safeText(input.instrumentName);
  const quantity = safePositiveNumber(input.quantity);
  const limitPrice = safePositiveNumber(input.limitPrice);
  const profileReady = input.profileReady === true;
  const loginModeled = input.loginModeled !== false;
  const instrumentSearchModeled = input.instrumentSearchModeled !== false;
  const orderPrepModeled = input.orderPrepModeled !== false;
  const settlementModeled = input.settlementModeled !== false;
  const explicitBlockers = safeTextArray(input.blockers);
  const status = inferStatus({
    explicitBlockers,
    instrumentSearchModeled,
    limitPrice,
    loginModeled,
    orderPrepModeled,
    orderType,
    profileReady,
    quantity,
    settlementModeled,
    side,
    ticker,
  });
  const canTheoreticallyPrepareOrder =
    status === "ready_passive" &&
    profileReady &&
    loginModeled &&
    instrumentSearchModeled &&
    orderPrepModeled &&
    settlementModeled &&
    Boolean(ticker) &&
    side !== "unknown" &&
    Boolean(quantity) &&
    Boolean(limitPrice) &&
    orderType === "limit";

  return {
    readinessId: input.readinessId ?? `avanza-passive-trade-${source}-${intent}`,
    createdAt: input.now ?? defaultCreatedAt,
    status,
    label: "Avanza passive trade execution readiness",
    reason: defaultReason(status),
    source,
    intent,
    ticker,
    instrumentName,
    side,
    quantity,
    limitPrice,
    orderType,
    recommendationId: safeText(input.recommendationId),
    positionId: safeText(input.positionId),
    profileReady,
    loginModeled,
    instrumentSearchModeled,
    orderPrepModeled,
    settlementModeled,
    localDevOnly: true,
    canTheoreticallyPrepareOrder,
    blockers: buildBlockers({ explicitBlockers, orderType, status }),
    warnings: safeTextArray(input.warnings),
    nextPassiveStep: nextPassiveStep(status),
    hardStops: [...hardStops],
    safetyFlags: avanzaPassiveTradeExecutionReadinessSafetyFlags,
  };
}
