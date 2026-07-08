import {
  assertMockBuyBoundaryContractSafe,
  assertMockSellBoundaryContractSafe,
  type MockBoundaryRiskSummary,
  type MockBuyBoundaryContract,
  type MockSellBoundaryContract,
} from "./execution-boundary-mock-contracts";

export type MockHeadlessAuthorityInput = {
  brokerAuthority?: boolean;
  accountBinding?: boolean;
  liveOrderIntent?: boolean;
  orderSubmissionAuthority?: boolean;
  supabaseExecutionWriteAuthority?: boolean;
  finalBuyAuthority?: boolean;
  finalSellAuthority?: boolean;
  livePositionMutationAuthority?: boolean;
  humanFinalRequired?: boolean;
};

export type MockHeadlessSafetyInput = {
  noSubmit?: boolean;
  stopAtReview?: boolean;
  noFinalClick?: boolean;
  noAvanza?: boolean;
  noCredentials?: boolean;
  noBankID?: boolean;
  noCookieSession?: boolean;
  noLivePositionMutation?: boolean;
  redactedEvidenceOnly?: boolean;
};

export type MockHeadlessForbiddenCouplingInput = {
  accountId?: string;
  brokerOrderId?: string;
  productionExecutionId?: string;
  credential?: string;
  session?: string;
  cookie?: string;
  finalKopAuthority?: boolean;
  finalSaljAuthority?: boolean;
  liveTradeMutationAuthority?: boolean;
};

export type MockHeadlessBuyExecutionInput = {
  sourceId: string;
  action: "BUY";
  side: "BUY";
  ticker: string;
  company: string;
  quantity: number;
  entry: number;
  stop: number;
  target: number;
  orderType: "LIMIT" | "MARKET";
  riskSummary: MockBoundaryRiskSummary;
  planReference: {
    planId: string;
    ticker: string;
    intent: "entry_buy";
  };
  authority?: MockHeadlessAuthorityInput;
  safety?: MockHeadlessSafetyInput;
  forbiddenCoupling?: MockHeadlessForbiddenCouplingInput;
};

export type MockHeadlessSellExitInput = {
  sourceId: string;
  action: "SELL";
  side: "SELL";
  ticker: string;
  company: string;
  quantity: number;
  plannedExitReason: "target_review" | "stop_review" | "risk_reduction_review";
  referenceEntry: number;
  stop: number;
  target: number;
  orderType: "LIMIT" | "MARKET";
  positionReference?: {
    referenceId: string;
    ticker: string;
    company: string;
    quantity: number;
    referenceEntry: number;
  };
  planReference?: {
    planId: string;
    ticker: string;
    plannedExitReason: string;
    stop: number;
    target: number;
  };
  riskSummary: MockBoundaryRiskSummary;
  authority?: MockHeadlessAuthorityInput;
  safety?: MockHeadlessSafetyInput;
  forbiddenCoupling?: MockHeadlessForbiddenCouplingInput;
};

export const mockHeadlessBuyExecutionInputFixture: MockHeadlessBuyExecutionInput = {
  sourceId: "mock_headless_buy_contract_scenario_b",
  action: "BUY",
  side: "BUY",
  ticker: "TURBUY",
  company: "Ture Mock BUY AB",
  quantity: 12,
  entry: 101.25,
  stop: 96.1,
  target: 113.4,
  orderType: "LIMIT",
  riskSummary: {
    maxPlannedLossPercent: 5.09,
    rewardRiskRatio: 2.36,
    notes: [
      "Headless-ish BUY input for mock boundary mapping.",
      "No broker authority is carried into the boundary fixture.",
    ],
  },
  planReference: {
    planId: "mock_headless_buy_plan_scenario_b",
    ticker: "TURBUY",
    intent: "entry_buy",
  },
  authority: {
    brokerAuthority: false,
    accountBinding: false,
    liveOrderIntent: false,
    finalBuyAuthority: false,
    orderSubmissionAuthority: false,
    supabaseExecutionWriteAuthority: false,
    humanFinalRequired: true,
  },
  safety: {
    noSubmit: true,
    stopAtReview: true,
    noFinalClick: true,
    noAvanza: true,
    noCredentials: true,
    noBankID: true,
    noCookieSession: true,
    redactedEvidenceOnly: true,
  },
};

export const mockHeadlessSellExitInputFixture: MockHeadlessSellExitInput = {
  sourceId: "mock_headless_sell_exit_contract_scenario_c",
  action: "SELL",
  side: "SELL",
  ticker: "TURSELL",
  company: "Ture Mock SELL AB",
  quantity: 8,
  plannedExitReason: "target_review",
  referenceEntry: 184.5,
  stop: 176.25,
  target: 205,
  orderType: "LIMIT",
  positionReference: {
    referenceId: "mock_headless_position_reference_scenario_c",
    ticker: "TURSELL",
    company: "Ture Mock SELL AB",
    quantity: 8,
    referenceEntry: 184.5,
  },
  planReference: {
    planId: "mock_headless_sell_exit_plan_scenario_c",
    ticker: "TURSELL",
    plannedExitReason: "target_review",
    stop: 176.25,
    target: 205,
  },
  riskSummary: {
    maxPlannedLossPercent: 4.47,
    rewardRiskRatio: 2.48,
    notes: [
      "Headless-ish SELL exit input for mock boundary mapping.",
      "Position and exit references must stay consistent.",
    ],
  },
  authority: {
    brokerAuthority: false,
    accountBinding: false,
    liveOrderIntent: false,
    finalSellAuthority: false,
    orderSubmissionAuthority: false,
    supabaseExecutionWriteAuthority: false,
    livePositionMutationAuthority: false,
    humanFinalRequired: true,
  },
  safety: {
    noSubmit: true,
    stopAtReview: true,
    noFinalClick: true,
    noAvanza: true,
    noCredentials: true,
    noBankID: true,
    noCookieSession: true,
    noLivePositionMutation: true,
    redactedEvidenceOnly: true,
  },
};

function collectUnsafeSharedInputViolations(
  authority: MockHeadlessAuthorityInput | undefined,
  safety: MockHeadlessSafetyInput | undefined,
  forbiddenCoupling: MockHeadlessForbiddenCouplingInput | undefined,
) {
  const violations: string[] = [];

  if (authority?.brokerAuthority) violations.push("brokerAuthority input must be false");
  if (authority?.accountBinding) violations.push("accountBinding input must be false");
  if (authority?.liveOrderIntent) violations.push("liveOrderIntent input must be false");
  if (authority?.orderSubmissionAuthority) {
    violations.push("orderSubmissionAuthority input must be false");
  }
  if (authority?.supabaseExecutionWriteAuthority) {
    violations.push("supabaseExecutionWriteAuthority input must be false");
  }
  if (authority?.humanFinalRequired === false) {
    violations.push("humanFinalRequired input must not be false");
  }
  if (safety?.noSubmit === false) violations.push("noSubmit input must not be false");
  if (safety?.stopAtReview === false) {
    violations.push("stopAtReview input must not be false");
  }
  if (safety?.noFinalClick === false) {
    violations.push("noFinalClick input must not be false");
  }
  if (safety?.noAvanza === false) violations.push("noAvanza input must not be false");
  if (safety?.noCredentials === false) {
    violations.push("noCredentials input must not be false");
  }
  if (safety?.noBankID === false) violations.push("noBankID input must not be false");
  if (safety?.noCookieSession === false) {
    violations.push("noCookieSession input must not be false");
  }
  if (safety?.redactedEvidenceOnly === false) {
    violations.push("redactedEvidenceOnly input must not be false");
  }
  if (forbiddenCoupling?.accountId) violations.push("accountId input is forbidden");
  if (forbiddenCoupling?.brokerOrderId) {
    violations.push("brokerOrderId input is forbidden");
  }
  if (forbiddenCoupling?.productionExecutionId) {
    violations.push("productionExecutionId input is forbidden");
  }
  if (forbiddenCoupling?.credential) {
    violations.push("credential-like input is forbidden");
  }
  if (forbiddenCoupling?.session) {
    violations.push("session-like input is forbidden");
  }
  if (forbiddenCoupling?.cookie) {
    violations.push("cookie-like input is forbidden");
  }
  if (forbiddenCoupling?.finalKopAuthority) {
    violations.push("finalKopAuthority input is forbidden");
  }
  if (forbiddenCoupling?.finalSaljAuthority) {
    violations.push("finalSaljAuthority input is forbidden");
  }
  if (forbiddenCoupling?.liveTradeMutationAuthority) {
    violations.push("liveTradeMutationAuthority input is forbidden");
  }

  return violations;
}

function hasSafeText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasPositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function hasBuyRewardRiskShape(input: MockHeadlessBuyExecutionInput) {
  return input.stop < input.entry && input.entry < input.target;
}

function hasSellExitPriceShape(input: MockHeadlessSellExitInput) {
  return input.stop > 0 && input.referenceEntry > 0 && input.target > 0;
}

function isAllowedPlannedExitReason(value: unknown) {
  return (
    value === "target_review" ||
    value === "stop_review" ||
    value === "risk_reduction_review"
  );
}

function assertNoUnsafeBuyInput(input: MockHeadlessBuyExecutionInput) {
  const violations = collectUnsafeSharedInputViolations(
    input.authority,
    input.safety,
    input.forbiddenCoupling,
  );

  if (input.action !== "BUY" || input.side !== "BUY") {
    violations.push("BUY mapping input must use BUY action and side");
  }
  if (!hasSafeText(input.ticker)) violations.push("BUY ticker is required");
  if (!hasSafeText(input.company)) violations.push("BUY company is required");
  if (!hasPositiveNumber(input.quantity)) {
    violations.push("BUY quantity must be positive");
  }
  if (!hasPositiveNumber(input.entry)) violations.push("BUY entry must be positive");
  if (!hasPositiveNumber(input.stop)) violations.push("BUY stop must be positive");
  if (!hasPositiveNumber(input.target)) violations.push("BUY target must be positive");
  if (!hasBuyRewardRiskShape(input)) {
    violations.push("BUY stop, entry, and target must form a valid reward/risk shape");
  }
  if (input.orderType !== "LIMIT") {
    violations.push("BUY orderType must be LIMIT");
  }
  if (input.authority?.finalBuyAuthority) {
    violations.push("finalBuyAuthority input must be false");
  }
  if (!input.planReference) {
    violations.push("BUY planReference is required");
  }
  if (input.planReference?.ticker !== input.ticker) {
    violations.push("BUY planReference ticker must match input ticker");
  }
  if (input.planReference?.intent !== "entry_buy") {
    violations.push("BUY planReference intent must be entry_buy");
  }

  if (violations.length > 0) {
    throw new Error(`Unsafe mock headless BUY mapping input: ${violations.join("; ")}`);
  }
}

function assertNoUnsafeSellInput(input: MockHeadlessSellExitInput) {
  const violations = collectUnsafeSharedInputViolations(
    input.authority,
    input.safety,
    input.forbiddenCoupling,
  );

  if (input.action !== "SELL" || input.side !== "SELL") {
    violations.push("SELL mapping input must use SELL action and side");
  }
  if (!hasSafeText(input.ticker)) violations.push("SELL ticker is required");
  if (!hasSafeText(input.company)) violations.push("SELL company is required");
  if (!hasPositiveNumber(input.quantity)) {
    violations.push("SELL quantity must be positive");
  }
  if (!hasPositiveNumber(input.referenceEntry)) {
    violations.push("SELL referenceEntry must be positive");
  }
  if (!hasPositiveNumber(input.stop)) violations.push("SELL stop must be positive");
  if (!hasPositiveNumber(input.target)) violations.push("SELL target must be positive");
  if (!hasSellExitPriceShape(input)) {
    violations.push("SELL referenceEntry, stop, and target must be positive");
  }
  if (input.orderType !== "LIMIT") {
    violations.push("SELL orderType must be LIMIT");
  }
  if (!isAllowedPlannedExitReason(input.plannedExitReason)) {
    violations.push("SELL plannedExitReason is invalid");
  }
  if (input.authority?.finalSellAuthority) {
    violations.push("finalSellAuthority input must be false");
  }
  if (input.authority?.livePositionMutationAuthority) {
    violations.push("livePositionMutationAuthority input must be false");
  }
  if (input.safety?.noLivePositionMutation === false) {
    violations.push("noLivePositionMutation input must not be false");
  }
  if (!input.positionReference) {
    violations.push("SELL positionReference is required");
  }
  if (!input.planReference) {
    violations.push("SELL planReference is required");
  }
  if (input.positionReference?.ticker !== input.ticker) {
    violations.push("SELL positionReference ticker must match input ticker");
  }
  if (input.positionReference?.company !== input.company) {
    violations.push("SELL positionReference company must match input company");
  }
  if (input.positionReference?.quantity !== input.quantity) {
    violations.push("SELL positionReference quantity must match input quantity");
  }
  if (input.positionReference?.referenceEntry !== input.referenceEntry) {
    violations.push("SELL positionReference referenceEntry must match input referenceEntry");
  }
  if (input.planReference?.ticker !== input.ticker) {
    violations.push("SELL planReference ticker must match input ticker");
  }
  if (input.planReference?.plannedExitReason !== input.plannedExitReason) {
    violations.push("SELL planReference plannedExitReason must match input plannedExitReason");
  }
  if (input.planReference?.stop !== input.stop) {
    violations.push("SELL planReference stop must match input stop");
  }
  if (input.planReference?.target !== input.target) {
    violations.push("SELL planReference target must match input target");
  }

  if (violations.length > 0) {
    throw new Error(`Unsafe mock headless SELL mapping input: ${violations.join("; ")}`);
  }
}

export function mapMockHeadlessBuyContractToBoundaryFixture(
  input: MockHeadlessBuyExecutionInput,
): MockBuyBoundaryContract {
  assertNoUnsafeBuyInput(input);

  return {
    scenarioId: "scenario_b_buy_order_prep_mock_review_boundary",
    mode: "mock_review_only",
    side: "BUY",
    ticker: input.ticker,
    company: input.company,
    quantity: input.quantity,
    entry: input.entry,
    stop: input.stop,
    target: input.target,
    orderType: input.orderType,
    riskSummary: input.riskSummary,
    authority: {
      brokerAuthority: false,
      accountBinding: false,
      liveOrderIntent: false,
      finalBuyAuthority: false,
      orderSubmissionAuthority: false,
      supabaseExecutionWriteAuthority: false,
      humanFinalRequired: true,
    },
    safety: {
      noSubmit: true,
      stopAtReview: true,
      noFinalClick: true,
      noAvanza: true,
      noCredentials: true,
      noBankID: true,
      noCookieSession: true,
      redactedEvidenceOnly: true,
    },
  };
}

export function mapMockHeadlessSellExitContractToBoundaryFixture(
  input: MockHeadlessSellExitInput,
): MockSellBoundaryContract {
  assertNoUnsafeSellInput(input);
  const { planReference, positionReference } = input;

  if (!positionReference || !planReference) {
    throw new Error("Unsafe mock headless SELL mapping input: references are required");
  }

  return {
    scenarioId: "scenario_c_sell_order_prep_mock_review_boundary",
    mode: "mock_review_only",
    side: "SELL",
    ticker: input.ticker,
    company: input.company,
    quantity: input.quantity,
    plannedExitReason: input.plannedExitReason,
    referenceEntry: input.referenceEntry,
    stop: input.stop,
    target: input.target,
    orderType: input.orderType,
    positionReference: {
      referenceId: positionReference.referenceId,
      ticker: positionReference.ticker,
      company: positionReference.company,
      quantity: positionReference.quantity,
      referenceEntry: positionReference.referenceEntry,
    },
    planReference: {
      planId: planReference.planId,
      ticker: planReference.ticker,
      plannedExitReason: planReference.plannedExitReason,
      stop: planReference.stop,
      target: planReference.target,
    },
    riskSummary: input.riskSummary,
    authority: {
      brokerAuthority: false,
      accountBinding: false,
      liveOrderIntent: false,
      finalSellAuthority: false,
      orderSubmissionAuthority: false,
      supabaseExecutionWriteAuthority: false,
      livePositionMutationAuthority: false,
      humanFinalRequired: true,
    },
    safety: {
      noSubmit: true,
      stopAtReview: true,
      noFinalClick: true,
      noAvanza: true,
      noCredentials: true,
      noBankID: true,
      noCookieSession: true,
      noLivePositionMutation: true,
      redactedEvidenceOnly: true,
    },
  };
}

export function assertMappedBuyBoundarySafe(mapped: MockBuyBoundaryContract) {
  assertMockBuyBoundaryContractSafe(mapped);
}

export function assertMappedSellBoundarySafe(mapped: MockSellBoundaryContract) {
  assertMockSellBoundaryContractSafe(mapped);
}
