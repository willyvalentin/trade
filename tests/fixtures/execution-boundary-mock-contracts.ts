export type MockBoundarySide = "BUY" | "SELL";
export type MockBoundaryMode = "mock_review_only";
export type MockBoundaryOrderType = "LIMIT" | "MARKET";

export type MockBoundaryRiskSummary = {
  maxPlannedLossPercent: number;
  rewardRiskRatio: number;
  notes: string[];
};

export type MockBoundaryAuthority = {
  brokerAuthority: false;
  accountBinding: false;
  liveOrderIntent: false;
  orderSubmissionAuthority: false;
  supabaseExecutionWriteAuthority: false;
  humanFinalRequired: true;
};

export type MockBuyBoundaryAuthority = MockBoundaryAuthority & {
  finalBuyAuthority: false;
};

export type MockSellBoundaryAuthority = MockBoundaryAuthority & {
  finalSellAuthority: false;
  livePositionMutationAuthority: false;
};

export type MockBoundarySafety = {
  noSubmit: true;
  stopAtReview: true;
  noFinalClick: true;
  noAvanza: true;
  noCredentials: true;
  noBankID: true;
  noCookieSession: true;
  redactedEvidenceOnly: true;
};

export type MockSellBoundarySafety = MockBoundarySafety & {
  noLivePositionMutation: true;
};

export type MockBuyBoundaryContract = {
  scenarioId: "scenario_b_buy_order_prep_mock_review_boundary";
  mode: MockBoundaryMode;
  side: "BUY";
  ticker: string;
  company: string;
  quantity: number;
  entry: number;
  stop: number;
  target: number;
  orderType: MockBoundaryOrderType;
  riskSummary: MockBoundaryRiskSummary;
  authority: MockBuyBoundaryAuthority;
  safety: MockBoundarySafety;
};

export type MockSellPositionReference = {
  referenceId: string;
  ticker: string;
  company: string;
  quantity: number;
  referenceEntry: number;
};

export type MockSellPlanReference = {
  planId: string;
  ticker: string;
  plannedExitReason: string;
  stop: number;
  target: number;
};

export type MockSellBoundaryContract = {
  scenarioId: "scenario_c_sell_order_prep_mock_review_boundary";
  mode: MockBoundaryMode;
  side: "SELL";
  ticker: string;
  company: string;
  quantity: number;
  plannedExitReason: "target_review" | "stop_review" | "risk_reduction_review";
  referenceEntry: number;
  stop: number;
  target: number;
  orderType: MockBoundaryOrderType;
  positionReference: MockSellPositionReference;
  planReference: MockSellPlanReference;
  riskSummary: MockBoundaryRiskSummary;
  authority: MockSellBoundaryAuthority;
  safety: MockSellBoundarySafety;
};

export const mockBuyBoundaryContractFixture: MockBuyBoundaryContract = {
  scenarioId: "scenario_b_buy_order_prep_mock_review_boundary",
  mode: "mock_review_only",
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
      "Mock/review-only BUY boundary fixture.",
      "Human final action is required outside this fixture.",
    ],
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

export const mockSellBoundaryContractFixture: MockSellBoundaryContract = {
  scenarioId: "scenario_c_sell_order_prep_mock_review_boundary",
  mode: "mock_review_only",
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
    referenceId: "mock_position_reference_scenario_c",
    ticker: "TURSELL",
    company: "Ture Mock SELL AB",
    quantity: 8,
    referenceEntry: 184.5,
  },
  planReference: {
    planId: "mock_exit_plan_scenario_c",
    ticker: "TURSELL",
    plannedExitReason: "target_review",
    stop: 176.25,
    target: 205,
  },
  riskSummary: {
    maxPlannedLossPercent: 4.47,
    rewardRiskRatio: 2.48,
    notes: [
      "Mock/review-only SELL exit boundary fixture.",
      "Position and exit references must remain consistent.",
      "Human final action is required outside this fixture.",
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

export const mockBoundaryContractFixtures = [
  mockBuyBoundaryContractFixture,
  mockSellBoundaryContractFixture,
] as const;

function collectSharedSafetyViolations(
  contract: MockBuyBoundaryContract | MockSellBoundaryContract,
) {
  const violations: string[] = [];

  if (contract.mode !== "mock_review_only") violations.push("mode must be mock_review_only");
  if (!contract.safety.noSubmit) violations.push("noSubmit must be true");
  if (!contract.safety.stopAtReview) violations.push("stopAtReview must be true");
  if (!contract.safety.noFinalClick) violations.push("noFinalClick must be true");
  if (!contract.safety.noAvanza) violations.push("noAvanza must be true");
  if (!contract.safety.noCredentials) violations.push("noCredentials must be true");
  if (!contract.safety.noBankID) violations.push("noBankID must be true");
  if (!contract.safety.noCookieSession) violations.push("noCookieSession must be true");
  if (!contract.safety.redactedEvidenceOnly) {
    violations.push("redactedEvidenceOnly must be true");
  }
  if (contract.authority.brokerAuthority) violations.push("brokerAuthority must be false");
  if (contract.authority.accountBinding) violations.push("accountBinding must be false");
  if (contract.authority.liveOrderIntent) violations.push("liveOrderIntent must be false");
  if (contract.authority.orderSubmissionAuthority) {
    violations.push("orderSubmissionAuthority must be false");
  }
  if (contract.authority.supabaseExecutionWriteAuthority) {
    violations.push("supabaseExecutionWriteAuthority must be false");
  }
  if (!contract.authority.humanFinalRequired) {
    violations.push("humanFinalRequired must be true");
  }

  return violations;
}

export function getMockBuyBoundaryContractSafetyViolations(
  contract: MockBuyBoundaryContract,
) {
  const violations = collectSharedSafetyViolations(contract);

  if (contract.side !== "BUY") violations.push("side must be BUY");
  if (contract.authority.finalBuyAuthority) {
    violations.push("finalBuyAuthority must be false");
  }

  return violations;
}

export function getMockSellBoundaryContractSafetyViolations(
  contract: MockSellBoundaryContract,
) {
  const violations = collectSharedSafetyViolations(contract);

  if (contract.side !== "SELL") violations.push("side must be SELL");
  if (contract.authority.finalSellAuthority) {
    violations.push("finalSellAuthority must be false");
  }
  if (contract.authority.livePositionMutationAuthority) {
    violations.push("livePositionMutationAuthority must be false");
  }
  if (!contract.safety.noLivePositionMutation) {
    violations.push("noLivePositionMutation must be true");
  }
  if (contract.positionReference.ticker !== contract.ticker) {
    violations.push("positionReference ticker must match contract ticker");
  }
  if (contract.positionReference.company !== contract.company) {
    violations.push("positionReference company must match contract company");
  }
  if (contract.positionReference.quantity !== contract.quantity) {
    violations.push("positionReference quantity must match contract quantity");
  }
  if (contract.positionReference.referenceEntry !== contract.referenceEntry) {
    violations.push("positionReference referenceEntry must match contract referenceEntry");
  }
  if (contract.planReference.ticker !== contract.ticker) {
    violations.push("planReference ticker must match contract ticker");
  }
  if (contract.planReference.plannedExitReason !== contract.plannedExitReason) {
    violations.push("planReference plannedExitReason must match contract plannedExitReason");
  }
  if (contract.planReference.stop !== contract.stop) {
    violations.push("planReference stop must match contract stop");
  }
  if (contract.planReference.target !== contract.target) {
    violations.push("planReference target must match contract target");
  }

  return violations;
}

export function isMockBuyBoundaryContractSafe(contract: MockBuyBoundaryContract) {
  return getMockBuyBoundaryContractSafetyViolations(contract).length === 0;
}

export function isMockSellBoundaryContractSafe(contract: MockSellBoundaryContract) {
  return getMockSellBoundaryContractSafetyViolations(contract).length === 0;
}

export function assertMockBuyBoundaryContractSafe(contract: MockBuyBoundaryContract) {
  const violations = getMockBuyBoundaryContractSafetyViolations(contract);

  if (violations.length > 0) {
    throw new Error(`Unsafe mock BUY boundary contract: ${violations.join("; ")}`);
  }
}

export function assertMockSellBoundaryContractSafe(contract: MockSellBoundaryContract) {
  const violations = getMockSellBoundaryContractSafetyViolations(contract);

  if (violations.length > 0) {
    throw new Error(`Unsafe mock SELL boundary contract: ${violations.join("; ")}`);
  }
}
