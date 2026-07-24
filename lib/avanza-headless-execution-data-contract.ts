export type AvanzaHeadlessExecutionContractStatus =
  | "ready_headless"
  | "incomplete_trade_package"
  | "missing_ticker"
  | "missing_side"
  | "missing_quantity"
  | "missing_limit_price"
  | "blocked"
  | "local_dev_only"
  | "unknown";

export type AvanzaHeadlessExecutionContractSource =
  | "recommendation"
  | "live_position"
  | "fixture"
  | "manual_review"
  | "unknown";

export type AvanzaHeadlessExecutionContractIntent =
  | "entry_buy"
  | "exit_sell"
  | "review_only"
  | "unknown";

export type AvanzaHeadlessExecutionContractSide = "buy" | "sell" | "unknown";

export type AvanzaHeadlessExecutionContractOrderType =
  | "limit"
  | "market_forbidden"
  | "unknown";

export type AvanzaHeadlessExecutionContractSafetyFlags = {
  headlessOnly: true;
  visibleInUi: false;
  canRenderVisualBadge: false;
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

export type AvanzaHeadlessExecutionContractAuditMetadata = {
  generatedAt: string;
  generatedBy: "ture_headless_execution_contract";
  schemaVersion: string;
  sourceFingerprint: string;
  visibleInUi: false;
  uiDisplayMode: "hidden_under_surface";
  intendedConsumer: "execution_agent";
};

export type AvanzaHeadlessExecutionContractSettlementExpectation = {
  settlementRequiredAfterExecution: boolean;
  expectedBrokerDocument: "avanza_avrakningsnota";
  expectedFields: [
    "courtage",
    "fxRate",
    "settlementAmount",
    "executionPrice",
    "quantity",
    "tradeDate",
    "settlementDate",
  ];
  reconciliationMode: "manual_or_future_agent";
  writeEnabled: false;
};

export type AvanzaHeadlessExecutionContractInput = {
  contractId?: string;
  source?: AvanzaHeadlessExecutionContractSource;
  intent?: AvanzaHeadlessExecutionContractIntent;
  recommendationId?: string;
  positionId?: string;
  ticker?: string;
  instrumentName?: string;
  isin?: string;
  marketPlace?: string;
  side?: AvanzaHeadlessExecutionContractSide;
  quantity?: number;
  limitPrice?: number;
  entryPrice?: number;
  stopLoss?: number;
  targetPrice?: number;
  rewardRisk?: number;
  confidence?: number;
  orderType?: AvanzaHeadlessExecutionContractOrderType;
  profileReady?: boolean;
  readinessModeled?: boolean;
  settlementModeled?: boolean;
  now?: string;
  warnings?: readonly string[];
  blockers?: readonly string[];
};

export type AvanzaHeadlessExecutionContract = {
  contractId: string;
  createdAt: string;
  status: AvanzaHeadlessExecutionContractStatus;
  label: string;
  reason: string;
  source: AvanzaHeadlessExecutionContractSource;
  intent: AvanzaHeadlessExecutionContractIntent;
  recommendationId?: string;
  positionId?: string;
  ticker?: string;
  instrumentName?: string;
  isin?: string;
  marketPlace?: string;
  side: AvanzaHeadlessExecutionContractSide;
  quantity?: number;
  limitPrice?: number;
  entryPrice?: number;
  stopLoss?: number;
  targetPrice?: number;
  rewardRisk?: number;
  confidence?: number;
  orderType: AvanzaHeadlessExecutionContractOrderType;
  canBeUsedByAgentLater: boolean;
  localDevOnly: boolean;
  missingFields: string[];
  blockers: string[];
  warnings: string[];
  agentReadableInstructions: string[];
  humanConfirmationRequirement: string;
  forbiddenActions: string[];
  auditMetadata: AvanzaHeadlessExecutionContractAuditMetadata;
  settlementExpectation: AvanzaHeadlessExecutionContractSettlementExpectation;
  safetyFlags: AvanzaHeadlessExecutionContractSafetyFlags;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const schemaVersion = "avanza_headless_execution_contract_v1";

export const avanzaHeadlessExecutionContractSafetyFlags:
  AvanzaHeadlessExecutionContractSafetyFlags = {
    headlessOnly: true,
    visibleInUi: false,
    canRenderVisualBadge: false,
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

const forbiddenActions = [
  "submit_order",
  "click_final_buy",
  "click_final_sell",
  "automate_bankid",
  "read_cookies",
  "export_session",
  "store_raw_credentials",
  "write_supabase_execution",
] as const;

const agentReadableInstructions = [
  "verify instrument identity",
  "prepare limit order fields",
  "stop at broker review/final confirmation",
  "wait for user final click",
  "capture result later only through approved flow",
] as const;

const settlementExpectedFields = [
  "courtage",
  "fxRate",
  "settlementAmount",
  "executionPrice",
  "quantity",
  "tradeDate",
  "settlementDate",
] as AvanzaHeadlessExecutionContractSettlementExpectation["expectedFields"];

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();

  return trimmed ? trimmed : undefined;
}

function safeTextArray(value: unknown) {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        const text = safeText(item);

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
  source: AvanzaHeadlessExecutionContractInput["source"],
): AvanzaHeadlessExecutionContractSource {
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
  intent: AvanzaHeadlessExecutionContractInput["intent"],
): AvanzaHeadlessExecutionContractIntent {
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
  side: AvanzaHeadlessExecutionContractInput["side"],
): AvanzaHeadlessExecutionContractSide {
  if (side === "buy" || side === "sell") return side;

  return "unknown";
}

function normalizeOrderType(
  orderType: AvanzaHeadlessExecutionContractInput["orderType"],
): AvanzaHeadlessExecutionContractOrderType {
  if (orderType === "limit" || orderType === "market_forbidden") {
    return orderType;
  }

  return "unknown";
}

function buildSourceFingerprint(input: {
  source: AvanzaHeadlessExecutionContractSource;
  intent: AvanzaHeadlessExecutionContractIntent;
  recommendationId?: string;
  positionId?: string;
  ticker?: string;
  side: AvanzaHeadlessExecutionContractSide;
  quantity?: number;
  limitPrice?: number;
}) {
  return [
    input.source,
    input.intent,
    input.recommendationId ?? "no_recommendation",
    input.positionId ?? "no_position",
    input.ticker ?? "no_ticker",
    input.side,
    input.quantity ?? "no_quantity",
    input.limitPrice ?? "no_limit",
  ]
    .join(":")
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, "_");
}

function statusDetails(status: AvanzaHeadlessExecutionContractStatus) {
  if (status === "ready_headless") {
    return {
      label: "Headless execution contract ready",
      reason:
        "Required limit-order data exists for a future Execution Agent read path.",
    };
  }
  if (status === "local_dev_only") {
    return {
      label: "Headless execution contract local-dev only",
      reason:
        "Required fields exist, but readiness or settlement modeling is local-dev only.",
    };
  }
  if (status === "missing_ticker") {
    return { label: "Missing ticker", reason: "Ticker is required." };
  }
  if (status === "missing_side") {
    return { label: "Missing side", reason: "BUY or SELL side is required." };
  }
  if (status === "missing_quantity") {
    return { label: "Missing quantity", reason: "Positive quantity is required." };
  }
  if (status === "missing_limit_price") {
    return {
      label: "Missing limit price",
      reason: "Positive limit price is required for the headless contract.",
    };
  }
  if (status === "blocked") {
    return {
      label: "Headless execution contract blocked",
      reason: "Blocked by forbidden or unsafe input.",
    };
  }
  if (status === "incomplete_trade_package") {
    return {
      label: "Incomplete trade package",
      reason: "Intent or limit-order type is incomplete.",
    };
  }

  return {
    label: "Headless execution contract unknown",
    reason: "Input could not be classified.",
  };
}

export function buildAvanzaHeadlessExecutionContract(
  input: AvanzaHeadlessExecutionContractInput = {},
): AvanzaHeadlessExecutionContract {
  const createdAt = safeText(input.now) ?? defaultCreatedAt;
  const source = normalizeSource(input.source);
  const intent = normalizeIntent(input.intent);
  const side = normalizeSide(input.side);
  const orderType = normalizeOrderType(input.orderType);
  const ticker = safeText(input.ticker);
  const quantity = safePositiveNumber(input.quantity);
  const limitPrice = safePositiveNumber(input.limitPrice);
  const profileReady = input.profileReady === true;
  const readinessModeled = input.readinessModeled !== false;
  const settlementModeled = input.settlementModeled !== false;

  const missingFields = [
    ticker ? undefined : "ticker",
    side !== "unknown" ? undefined : "side",
    quantity ? undefined : "quantity",
    limitPrice ? undefined : "limitPrice",
  ].flatMap((field) => (field ? [field] : []));

  const inputBlockers = safeTextArray(input.blockers);
  const inputWarnings = safeTextArray(input.warnings);
  const warnings = [
    ...inputWarnings,
    ...(profileReady ? [] : ["Execution profile is incomplete."]),
    ...(readinessModeled ? [] : ["Readiness is local-dev only."]),
    ...(settlementModeled ? [] : ["Settlement expectation is local-dev only."]),
  ];
  const blockers = [
    ...inputBlockers,
    ...(orderType === "market_forbidden"
      ? ["Market orders are forbidden for this contract."]
      : []),
  ];

  let status: AvanzaHeadlessExecutionContractStatus = "unknown";
  if (blockers.length > 0) status = "blocked";
  else if (!ticker) status = "missing_ticker";
  else if (side === "unknown") status = "missing_side";
  else if (!quantity) status = "missing_quantity";
  else if (!limitPrice) status = "missing_limit_price";
  else if (orderType !== "limit" || intent === "unknown" || intent === "review_only") {
    status = "incomplete_trade_package";
  } else if (!readinessModeled || !settlementModeled) {
    status = "local_dev_only";
  } else {
    status = "ready_headless";
  }

  const contractId =
    safeText(input.contractId) ??
    `headless-${source}-${intent}-${ticker ?? "missing"}-${createdAt}`;
  const sourceFingerprint = buildSourceFingerprint({
    intent,
    limitPrice,
    positionId: safeText(input.positionId),
    quantity,
    recommendationId: safeText(input.recommendationId),
    side,
    source,
    ticker,
  });
  const details = statusDetails(status);

  return {
    auditMetadata: {
      generatedAt: createdAt,
      generatedBy: "ture_headless_execution_contract",
      intendedConsumer: "execution_agent",
      schemaVersion,
      sourceFingerprint,
      uiDisplayMode: "hidden_under_surface",
      visibleInUi: false,
    },
    blockers,
    canBeUsedByAgentLater:
      (status === "ready_headless" || status === "local_dev_only") &&
      avanzaHeadlessExecutionContractSafetyFlags.gateLocked,
    confidence: safePositiveNumber(input.confidence),
    contractId,
    createdAt,
    entryPrice: safePositiveNumber(input.entryPrice),
    forbiddenActions: [...forbiddenActions],
    humanConfirmationRequirement:
      "Final KÖP/SÄLJ is human-only. The Execution Agent must stop before final broker confirmation and wait for the user final click.",
    instrumentName: safeText(input.instrumentName),
    intent,
    isin: safeText(input.isin),
    label: details.label,
    limitPrice,
    localDevOnly: true,
    marketPlace: safeText(input.marketPlace),
    missingFields,
    orderType,
    positionId: safeText(input.positionId),
    quantity,
    reason: details.reason,
    recommendationId: safeText(input.recommendationId),
    rewardRisk: safePositiveNumber(input.rewardRisk),
    safetyFlags: avanzaHeadlessExecutionContractSafetyFlags,
    settlementExpectation: {
      expectedBrokerDocument: "avanza_avrakningsnota",
      expectedFields: settlementExpectedFields,
      reconciliationMode: "manual_or_future_agent",
      settlementRequiredAfterExecution: true,
      writeEnabled: false,
    },
    side,
    source,
    status,
    stopLoss: safePositiveNumber(input.stopLoss),
    targetPrice: safePositiveNumber(input.targetPrice),
    ticker,
    warnings,
    agentReadableInstructions: [...agentReadableInstructions],
  };
}
