export type MockSettlementSide = "BUY" | "SELL";

export type MockExecutionDeviationClassification =
  | "execution_match"
  | "minor_execution_deviation"
  | "major_execution_deviation"
  | "requires_manual_review"
  | "blocked_sensitive_or_mismatched_evidence";

export type MockRedactionStatus = "redacted" | "safe_summary_only";

export type MockSettlementAuthority = {
  brokerAuthority: false;
  accountBinding: false;
  liveOrderIntent: false;
  orderSubmissionAuthority: false;
  supabaseExecutionWriteAuthority: false;
  productionPersistenceAllowed: false;
  humanFinalRequired: true;
};

export type MockBuySettlementAuthority = MockSettlementAuthority & {
  finalBuyAuthority: false;
};

export type MockSellSettlementAuthority = MockSettlementAuthority & {
  finalSellAuthority: false;
  livePositionMutationAuthority: false;
};

export type MockSettlementSafety = {
  redactedEvidenceOnly: true;
  noCredentials: true;
  noBankID: true;
  noCookieSession: true;
  noBrowserStorage: true;
  noNetworkDump: true;
  noSupabaseWrite: true;
  noOrderSubmission: true;
  noFinalClick: true;
};

export type MockSellSettlementSafety = MockSettlementSafety & {
  noLivePositionMutation: true;
};

export type MockExecutionCostBreakdown = {
  grossAmount: number;
  commission: number;
  fxRate?: number;
  fxImpact?: number;
  taxes?: number;
  exchangeFee?: number;
  totalSettlementAmount: number;
  currency: string;
};

export type MockBrokerConfirmationEvidence = {
  evidenceId: string;
  sourceLabel: "mock_broker_confirmation";
  evidenceTimestamp: string;
  brokerLabel: "mock_broker_only";
  side: MockSettlementSide;
  ticker: string;
  quantity: number;
  executionPrice: number;
  currency: string;
  redactedBrokerReference?: string;
  redactionStatus: MockRedactionStatus;
  duplicateConfirmation: boolean;
  forbiddenSensitiveData?: Partial<Record<MockSettlementSensitiveField, string>>;
};

export type MockSettlementNoteArtifact = {
  artifactId: string;
  sourceLabel: "mock_settlement_note";
  evidenceTimestamp: string;
  executionTimestamp: string;
  settlementDate?: string;
  side: MockSettlementSide;
  instrument: string;
  ticker: string;
  isin?: string;
  quantity: number;
  executionPrice: number;
  currency: string;
  grossAmount: number;
  commission: number;
  totalSettlementAmount: number;
  costs: MockExecutionCostBreakdown;
  orderType?: "LIMIT";
  partialFill: boolean;
  treatedAsFullFill: boolean;
  redactedBrokerReference?: string;
  redactionStatus: MockRedactionStatus;
  duplicateConfirmation: boolean;
  forbiddenSensitiveData?: Partial<Record<MockSettlementSensitiveField, string>>;
};

export type MockPlannedTradePackage = {
  planId: string;
  contractId: string;
  side: MockSettlementSide;
  ticker: string;
  instrument: string;
  plannedQuantity: number;
  plannedPrice: number;
  stop?: number;
  target?: number;
  riskReward?: number;
  plannedRisk: number;
  plannedReward: number;
  currency: string;
  noSubmitNoFinalClickContext: true;
  plannedExitReason?: "target" | "stop" | "manual-review-only";
  referenceEntry?: number;
  positionReferenceId?: string;
  noLivePositionMutationContext?: true;
  humanFinalRequired: true;
};

export type MockSellPositionReference = {
  positionId: string;
  ticker: string;
  instrument: string;
  quantity: number;
  entryReference: number;
};

export type MockSettlementExtractionResult = {
  extractionId: string;
  status: "extracted" | "partial" | "blocked_sensitive_or_invalid";
  side: MockSettlementSide;
  plan: MockPlannedTradePackage;
  artifact: MockSettlementNoteArtifact;
  evidence: MockBrokerConfirmationEvidence;
  authority: MockBuySettlementAuthority | MockSellSettlementAuthority;
  safety: MockSettlementSafety | MockSellSettlementSafety;
  positionReference?: MockSellPositionReference;
  exitReason?: "target_review" | "stop_review" | "manual_review_only";
  remainingQuantity?: number;
  partialFillManualReviewRequired?: boolean;
  realizedPnl?: number;
  roundTripFees?: number;
  forbiddenPersistenceCoupling?: Partial<{
    automaticResultUpdateAuthority: boolean;
    automaticStatisticsUpdateAuthority: boolean;
    automaticLearningUpdateAuthority: boolean;
  }>;
};

export type MockPlanVsActualExecutionReview = {
  reviewId: string;
  extractionId: string;
  sideMatches: boolean;
  tickerMatches: boolean;
  quantityMatches: boolean;
  partialFill: boolean;
  plannedPrice: number;
  executionPrice: number;
  slippageAmount: number;
  slippagePercent: number;
  feeImpact: number;
  settlementAmountReconciles: boolean;
  expectedGrossAmount: number;
  grossAmountReconciles: boolean;
  expectedSettlementAmount: number;
  settlementAmountDelta: number;
  commissionImpactPercent: number;
  fxRate?: number;
  fxImpact: number;
  fxMismatch: boolean;
  expectedRealizedPnl?: number;
  realizedPnl?: number;
  realizedPnlReconciles: boolean;
  noLivePositionMutation: boolean;
  deviationClassification: MockExecutionDeviationClassification;
  requiresManualReview: boolean;
  blockedReasons: string[];
};

export type MockSettlementSensitiveField =
  | "credentials"
  | "passwordLikeField"
  | "bankIdData"
  | "mfaCode"
  | "cookieToken"
  | "sessionToken"
  | "rawBrowserStorage"
  | "networkDump"
  | "avanzaCustomerId"
  | "accountNumber"
  | "accountId"
  | "customerId"
  | "personnummer"
  | "personalIdentityData"
  | "fullNameAccountLinkage"
  | "accountBalance"
  | "unrelatedHoldings"
  | "envSecret"
  | "supabaseServiceKey"
  | "apiToken"
  | "unredactedRawArtifact"
  | "rawPdfWithSensitiveData"
  | "screenshotWithSensitiveAccountData";

const safeBuyAuthority: MockBuySettlementAuthority = {
  brokerAuthority: false,
  accountBinding: false,
  liveOrderIntent: false,
  orderSubmissionAuthority: false,
  finalBuyAuthority: false,
  supabaseExecutionWriteAuthority: false,
  productionPersistenceAllowed: false,
  humanFinalRequired: true,
};

const safeSellAuthority: MockSellSettlementAuthority = {
  brokerAuthority: false,
  accountBinding: false,
  liveOrderIntent: false,
  orderSubmissionAuthority: false,
  finalSellAuthority: false,
  supabaseExecutionWriteAuthority: false,
  livePositionMutationAuthority: false,
  productionPersistenceAllowed: false,
  humanFinalRequired: true,
};

const safeSettlementSafety: MockSettlementSafety = {
  redactedEvidenceOnly: true,
  noCredentials: true,
  noBankID: true,
  noCookieSession: true,
  noBrowserStorage: true,
  noNetworkDump: true,
  noSupabaseWrite: true,
  noOrderSubmission: true,
  noFinalClick: true,
};

const safeSellSettlementSafety: MockSellSettlementSafety = {
  ...safeSettlementSafety,
  noLivePositionMutation: true,
};

export const mockBuySettlementExtractionFixture: MockSettlementExtractionResult = {
  extractionId: "mock_buy_settlement_extraction_001",
  status: "extracted",
  side: "BUY",
  plan: {
    planId: "mock_buy_plan_001",
    contractId: "mock_buy_contract_001",
    side: "BUY",
    ticker: "TURBUY",
    instrument: "Ture Mock BUY AB",
    plannedQuantity: 12,
    plannedPrice: 101.25,
    stop: 96.1,
    target: 113.4,
    riskReward: 2.36,
    plannedRisk: 61.8,
    plannedReward: 145.8,
    currency: "SEK",
    noSubmitNoFinalClickContext: true,
    humanFinalRequired: true,
  },
  evidence: {
    evidenceId: "mock_buy_broker_confirmation_001",
    sourceLabel: "mock_broker_confirmation",
    evidenceTimestamp: "2026-07-07T09:31:00.000Z",
    brokerLabel: "mock_broker_only",
    side: "BUY",
    ticker: "TURBUY",
    quantity: 12,
    executionPrice: 101.4,
    currency: "SEK",
    redactedBrokerReference: "mock-ref-redacted-buy-001",
    redactionStatus: "redacted",
    duplicateConfirmation: false,
  },
  artifact: {
    artifactId: "mock_buy_settlement_note_001",
    sourceLabel: "mock_settlement_note",
    evidenceTimestamp: "2026-07-07T09:31:30.000Z",
    executionTimestamp: "2026-07-07T09:30:45.000Z",
    settlementDate: "2026-07-09",
    side: "BUY",
    instrument: "Ture Mock BUY AB",
    ticker: "TURBUY",
    isin: "MOCKBUY00001",
    quantity: 12,
    executionPrice: 101.4,
    currency: "SEK",
    grossAmount: 1216.8,
    commission: 9,
    totalSettlementAmount: 1225.8,
    costs: {
      grossAmount: 1216.8,
      commission: 9,
      taxes: 0,
      exchangeFee: 0,
      totalSettlementAmount: 1225.8,
      currency: "SEK",
    },
    orderType: "LIMIT",
    partialFill: false,
    treatedAsFullFill: true,
    redactedBrokerReference: "mock-ref-redacted-buy-001",
    redactionStatus: "redacted",
    duplicateConfirmation: false,
  },
  authority: safeBuyAuthority,
  safety: safeSettlementSafety,
};

export const mockSellSettlementExtractionFixture: MockSettlementExtractionResult = {
  extractionId: "mock_sell_settlement_extraction_001",
  status: "extracted",
  side: "SELL",
  plan: {
    planId: "mock_sell_plan_001",
    contractId: "mock_sell_contract_001",
    side: "SELL",
    ticker: "TURSELL",
    instrument: "Ture Mock SELL AB",
    plannedQuantity: 8,
    plannedPrice: 205,
    stop: 176.25,
    target: 205,
    riskReward: 2.48,
    plannedRisk: 230,
    plannedReward: 164,
    currency: "SEK",
    plannedExitReason: "target",
    referenceEntry: 184.5,
    positionReferenceId: "mock_sell_position_001",
    noSubmitNoFinalClickContext: true,
    noLivePositionMutationContext: true,
    humanFinalRequired: true,
  },
  positionReference: {
    positionId: "mock_sell_position_001",
    ticker: "TURSELL",
    instrument: "Ture Mock SELL AB",
    quantity: 8,
    entryReference: 184.5,
  },
  exitReason: "target_review",
  evidence: {
    evidenceId: "mock_sell_broker_confirmation_001",
    sourceLabel: "mock_broker_confirmation",
    evidenceTimestamp: "2026-07-07T10:15:00.000Z",
    brokerLabel: "mock_broker_only",
    side: "SELL",
    ticker: "TURSELL",
    quantity: 8,
    executionPrice: 204.2,
    currency: "SEK",
    redactedBrokerReference: "mock-ref-redacted-sell-001",
    redactionStatus: "redacted",
    duplicateConfirmation: false,
  },
  artifact: {
    artifactId: "mock_sell_settlement_note_001",
    sourceLabel: "mock_settlement_note",
    evidenceTimestamp: "2026-07-07T10:15:30.000Z",
    executionTimestamp: "2026-07-07T10:14:50.000Z",
    settlementDate: "2026-07-09",
    side: "SELL",
    instrument: "Ture Mock SELL AB",
    ticker: "TURSELL",
    isin: "MOCKSELL0001",
    quantity: 8,
    executionPrice: 204.2,
    currency: "SEK",
    grossAmount: 1633.6,
    commission: 9,
    totalSettlementAmount: 1624.6,
    costs: {
      grossAmount: 1633.6,
      commission: 9,
      taxes: 0,
      exchangeFee: 0,
      totalSettlementAmount: 1624.6,
      currency: "SEK",
    },
    orderType: "LIMIT",
    partialFill: false,
    treatedAsFullFill: true,
    redactedBrokerReference: "mock-ref-redacted-sell-001",
    redactionStatus: "redacted",
    duplicateConfirmation: false,
  },
  authority: safeSellAuthority,
  safety: safeSellSettlementSafety,
  realizedPnl: 148.6,
  roundTripFees: 18,
};

export const mockPartialFillSettlementExtractionFixture: MockSettlementExtractionResult = {
  ...mockBuySettlementExtractionFixture,
  extractionId: "mock_buy_partial_fill_settlement_extraction_001",
  evidence: {
    ...mockBuySettlementExtractionFixture.evidence,
    evidenceId: "mock_buy_partial_fill_confirmation_001",
    quantity: 6,
  },
  artifact: {
    ...mockBuySettlementExtractionFixture.artifact,
    artifactId: "mock_buy_partial_fill_settlement_note_001",
    quantity: 6,
    grossAmount: 608.4,
    totalSettlementAmount: 617.4,
    costs: {
      ...mockBuySettlementExtractionFixture.artifact.costs,
      grossAmount: 608.4,
      totalSettlementAmount: 617.4,
    },
    partialFill: true,
    treatedAsFullFill: false,
  },
  remainingQuantity: 6,
  partialFillManualReviewRequired: true,
};

export const mockMismatchSettlementExtractionFixture: MockSettlementExtractionResult = {
  ...mockBuySettlementExtractionFixture,
  extractionId: "mock_buy_mismatch_settlement_extraction_001",
  evidence: {
    ...mockBuySettlementExtractionFixture.evidence,
    evidenceId: "mock_buy_wrong_ticker_confirmation_001",
    ticker: "WRONG",
  },
  artifact: {
    ...mockBuySettlementExtractionFixture.artifact,
    artifactId: "mock_buy_wrong_ticker_settlement_note_001",
    ticker: "WRONG",
  },
};

export const mockSettlementExtractionFixtures = [
  mockBuySettlementExtractionFixture,
  mockSellSettlementExtractionFixture,
  mockPartialFillSettlementExtractionFixture,
  mockMismatchSettlementExtractionFixture,
] as const;

const sensitiveKeys: MockSettlementSensitiveField[] = [
  "credentials",
  "passwordLikeField",
  "bankIdData",
  "mfaCode",
  "cookieToken",
  "sessionToken",
  "rawBrowserStorage",
  "networkDump",
  "avanzaCustomerId",
  "accountNumber",
  "accountId",
  "customerId",
  "personnummer",
  "personalIdentityData",
  "fullNameAccountLinkage",
  "accountBalance",
  "unrelatedHoldings",
  "envSecret",
  "supabaseServiceKey",
  "apiToken",
  "unredactedRawArtifact",
  "rawPdfWithSensitiveData",
  "screenshotWithSensitiveAccountData",
];

function isPositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function approxEqual(left: number, right: number, tolerance = 0.01) {
  return Math.abs(left - right) <= tolerance;
}

export const mockPlanVsActualDeviationThresholds = {
  exactSlippagePercent: 0.25,
  minorSlippagePercent: 2,
  majorFeeImpactPercent: 5,
  majorSettlementDeltaAmount: 1,
  majorGrossDeltaAmount: 1,
  majorFxImpactAmount: 25,
  fxMismatchTolerance: 0.01,
} as const;

export function containsForbiddenSettlementSensitiveData(
  value:
    | MockBrokerConfirmationEvidence
    | MockSettlementNoteArtifact
    | MockSettlementExtractionResult,
) {
  const records =
    "artifact" in value
      ? [value.artifact, value.evidence]
      : [value];

  return records.some((record) =>
    sensitiveKeys.some((key) => Boolean(record.forbiddenSensitiveData?.[key])),
  );
}

export function assertSettlementArtifactRedacted(
  artifact: MockSettlementNoteArtifact,
) {
  const violations: string[] = [];

  if (artifact.redactionStatus !== "redacted" && artifact.redactionStatus !== "safe_summary_only") {
    violations.push("redaction status must be safe");
  }
  if (containsForbiddenSettlementSensitiveData(artifact)) {
    violations.push("forbidden sensitive data must be absent");
  }
  if (!artifact.redactedBrokerReference?.startsWith("mock-ref-redacted-")) {
    violations.push("broker reference must be redacted mock reference");
  }

  if (violations.length > 0) {
    throw new Error(`Unsafe settlement artifact: ${violations.join("; ")}`);
  }
}

export function getSettlementExtractionViolations(
  extraction: MockSettlementExtractionResult,
) {
  const violations: string[] = [];
  const { artifact, authority, evidence, plan, safety } = extraction;

  if (extraction.side !== "BUY" && extraction.side !== "SELL") {
    violations.push("side must be BUY or SELL");
  }
  if (artifact.side !== extraction.side || evidence.side !== extraction.side) {
    violations.push("artifact/evidence side must match extraction side");
  }
  if (plan.side !== extraction.side) {
    violations.push("plan side must match extraction side");
  }
  if (!hasText(artifact.ticker) || !hasText(evidence.ticker) || !hasText(plan.ticker)) {
    violations.push("ticker/instrument must exist");
  }
  if (!hasText(plan.planId) || !hasText(plan.contractId)) {
    violations.push("plan reference must exist");
  }
  if (!isPositiveNumber(plan.plannedPrice)) {
    violations.push("planned price must be positive");
  }
  if (!isPositiveNumber(plan.plannedQuantity)) {
    violations.push("planned quantity must be positive");
  }
  if (!isPositiveNumber(plan.plannedRisk)) {
    violations.push("planned risk must be positive");
  }
  if (!isPositiveNumber(plan.plannedReward)) {
    violations.push("planned reward must be positive");
  }
  if (!hasText(plan.currency)) {
    violations.push("plan currency must exist");
  }
  if (plan.currency !== artifact.currency) {
    violations.push("plan currency must match settlement currency");
  }
  if (!plan.humanFinalRequired || !plan.noSubmitNoFinalClickContext) {
    violations.push("plan must require human final and no-submit context");
  }
  if (!isPositiveNumber(artifact.quantity) || !isPositiveNumber(evidence.quantity)) {
    violations.push("quantity must be positive");
  }
  if (artifact.quantity !== evidence.quantity) {
    violations.push("artifact/evidence quantity must match");
  }
  if (!isPositiveNumber(artifact.executionPrice) || !isPositiveNumber(evidence.executionPrice)) {
    violations.push("execution price must be positive");
  }
  if (artifact.executionPrice !== evidence.executionPrice) {
    violations.push("artifact/evidence execution price must match");
  }
  if (!hasText(artifact.executionTimestamp)) {
    violations.push("execution timestamp must exist");
  }
  if (!hasText(artifact.currency) || !hasText(evidence.currency)) {
    violations.push("currency must exist");
  }
  if (artifact.currency !== evidence.currency || artifact.currency !== artifact.costs.currency) {
    violations.push("currency must be consistent across evidence, artifact, and costs");
  }
  if (!isPositiveNumber(artifact.grossAmount)) {
    violations.push("gross amount must exist");
  }
  if (typeof artifact.commission !== "number" || artifact.commission < 0) {
    violations.push("commission/courtage must exist");
  }
  if (!approxEqual(artifact.grossAmount, artifact.executionPrice * artifact.quantity)) {
    violations.push("gross amount must equal execution price times quantity");
  }
  if (!isPositiveNumber(artifact.totalSettlementAmount)) {
    violations.push("total settlement amount must exist");
  }
  if (!approxEqual(artifact.costs.grossAmount, artifact.grossAmount)) {
    violations.push("cost gross amount must match artifact gross amount");
  }
  if (!approxEqual(artifact.costs.commission, artifact.commission)) {
    violations.push("cost commission must match artifact commission");
  }
  if (
    typeof artifact.costs.fxImpact === "number" &&
    !Number.isFinite(artifact.costs.fxImpact)
  ) {
    violations.push("FX impact must be finite when present");
  }
  if (!approxEqual(artifact.costs.totalSettlementAmount, artifact.totalSettlementAmount)) {
    violations.push("cost total settlement amount must match artifact total");
  }
  if (evidence.brokerLabel !== "mock_broker_only") {
    violations.push("broker/source label must be mock only");
  }
  if (!hasText(evidence.evidenceTimestamp) || !hasText(artifact.evidenceTimestamp)) {
    violations.push("evidence timestamp must exist");
  }
  if (artifact.redactionStatus !== "redacted" && artifact.redactionStatus !== "safe_summary_only") {
    violations.push("redaction status must be safe");
  }
  if (containsForbiddenSettlementSensitiveData(extraction)) {
    violations.push("forbidden sensitive data must be absent");
  }
  if (authority.brokerAuthority) violations.push("brokerAuthority must be false");
  if (authority.accountBinding) violations.push("accountBinding must be false");
  if (authority.liveOrderIntent) violations.push("liveOrderIntent must be false");
  if (authority.orderSubmissionAuthority) {
    violations.push("orderSubmissionAuthority must be false");
  }
  if (authority.supabaseExecutionWriteAuthority) {
    violations.push("supabaseExecutionWriteAuthority must be false");
  }
  if (authority.productionPersistenceAllowed) {
    violations.push("productionPersistenceAllowed must be false");
  }
  if (extraction.forbiddenPersistenceCoupling?.automaticResultUpdateAuthority) {
    violations.push("automaticResultUpdateAuthority must be absent or false");
  }
  if (extraction.forbiddenPersistenceCoupling?.automaticStatisticsUpdateAuthority) {
    violations.push("automaticStatisticsUpdateAuthority must be absent or false");
  }
  if (extraction.forbiddenPersistenceCoupling?.automaticLearningUpdateAuthority) {
    violations.push("automaticLearningUpdateAuthority must be absent or false");
  }
  if (!authority.humanFinalRequired) {
    violations.push("humanFinalRequired must be true");
  }
  if (!safety.redactedEvidenceOnly) violations.push("redactedEvidenceOnly must be true");
  if (!safety.noCredentials) violations.push("noCredentials must be true");
  if (!safety.noBankID) violations.push("noBankID must be true");
  if (!safety.noCookieSession) violations.push("noCookieSession must be true");
  if (!safety.noBrowserStorage) violations.push("noBrowserStorage must be true");
  if (!safety.noNetworkDump) violations.push("noNetworkDump must be true");
  if (!safety.noSupabaseWrite) violations.push("noSupabaseWrite must be true");
  if (!safety.noOrderSubmission) violations.push("noOrderSubmission must be true");
  if (!safety.noFinalClick) violations.push("noFinalClick must be true");
  if (extraction.side === "BUY" && "finalBuyAuthority" in authority && authority.finalBuyAuthority) {
    violations.push("finalBuyAuthority must be false");
  }
  if (extraction.side === "SELL") {
    const sellAuthority = authority as MockSellSettlementAuthority;
    const sellSafety = safety as MockSellSettlementSafety;

    if (sellAuthority.finalSellAuthority) {
      violations.push("finalSellAuthority must be false");
    }
    if (sellAuthority.livePositionMutationAuthority) {
      violations.push("livePositionMutationAuthority must be false");
    }
    if (!sellSafety.noLivePositionMutation) {
      violations.push("noLivePositionMutation must be true");
    }
    if (!extraction.positionReference) {
      violations.push("SELL position reference must exist");
    } else {
      if (extraction.positionReference.ticker !== plan.ticker) {
        violations.push("SELL position ticker must match plan ticker");
      }
      if (extraction.positionReference.instrument !== plan.instrument) {
        violations.push("SELL position instrument must match plan instrument");
      }
      if (!isPositiveNumber(extraction.positionReference.entryReference)) {
        violations.push("SELL position entry reference must be positive");
      }
      if (artifact.quantity > extraction.positionReference.quantity) {
        violations.push("SELL quantity must not exceed position quantity");
      }
    }
    if (!extraction.exitReason) {
      violations.push("SELL exit reason must exist");
    }
    if (!plan.plannedExitReason) {
      violations.push("SELL planned exit reason must exist");
    }
    if (!isPositiveNumber(plan.referenceEntry)) {
      violations.push("SELL plan reference entry must be positive");
    }
    if (!hasText(plan.positionReferenceId)) {
      violations.push("SELL plan position reference must exist");
    }
    if (!plan.noLivePositionMutationContext) {
      violations.push("SELL plan no-live-position-mutation context must exist");
    }
    if (!isPositiveNumber(plan.stop) || !isPositiveNumber(plan.target)) {
      violations.push("SELL planned target/stop must exist");
    }
    if (typeof extraction.realizedPnl !== "number" || !Number.isFinite(extraction.realizedPnl)) {
      violations.push("SELL realized PnL must be mock-calculable");
    }
  }

  if (artifact.partialFill) {
    if (artifact.treatedAsFullFill) {
      violations.push("partial fill cannot be treated as full fill");
    }
    if (artifact.quantity >= plan.plannedQuantity) {
      violations.push("partial fill quantity must be less than planned quantity");
    }
    if (
      !isPositiveNumber(extraction.remainingQuantity) &&
      extraction.remainingQuantity !== 0 &&
      !extraction.partialFillManualReviewRequired
    ) {
      violations.push("partial fill remaining quantity or manual review marker must exist");
    }
  }

  return violations;
}

function isHardBlockedViolation(violation: string) {
  return (
    violation.includes("sensitive") ||
    violation.includes("Authority") ||
    violation.includes("authority") ||
    violation.includes("Persistence") ||
    violation.includes("persistence") ||
    violation.includes("brokerAuthority") ||
    violation.includes("accountBinding") ||
    violation.includes("liveOrderIntent") ||
    violation.includes("orderSubmissionAuthority") ||
    violation.includes("supabaseExecutionWriteAuthority") ||
    violation.includes("productionPersistenceAllowed") ||
    violation.includes("humanFinalRequired") ||
    violation.includes("finalBuyAuthority") ||
    violation.includes("finalSellAuthority") ||
    violation.includes("livePositionMutationAuthority") ||
    violation.includes("noLivePositionMutation") ||
    violation.includes("SELL position reference") ||
    violation.includes("SELL position ticker") ||
    violation.includes("SELL position instrument") ||
    violation.includes("SELL quantity must not exceed") ||
    violation.includes("SELL exit reason") ||
    violation.includes("plan reference") ||
    violation.includes("planned price") ||
    violation.includes("planned quantity") ||
    violation === "execution price must be positive" ||
    violation === "artifact/evidence execution price must match" ||
    violation.includes("quantity must be positive") ||
    violation.includes("commission/courtage") ||
    violation.includes("total settlement amount must exist") ||
    violation.includes("redaction") ||
    violation.includes("currency must exist") ||
    violation.includes("plan currency")
  );
}

export function assertSettlementExtractionSafe(
  extraction: MockSettlementExtractionResult,
) {
  const violations = getSettlementExtractionViolations(extraction);

  if (violations.length > 0) {
    throw new Error(`Unsafe settlement extraction: ${violations.join("; ")}`);
  }
}

export function buildPlanVsActualExecutionReview(
  extraction: MockSettlementExtractionResult,
): MockPlanVsActualExecutionReview {
  const { artifact, plan } = extraction;
  const sideMatches = artifact.side === plan.side;
  const tickerMatches = artifact.ticker === plan.ticker;
  const quantityMatches = artifact.quantity === plan.plannedQuantity;
  const partialFill = artifact.partialFill;
  const slippageAmount =
    artifact.side === "BUY"
      ? artifact.executionPrice - plan.plannedPrice
      : plan.plannedPrice - artifact.executionPrice;
  const slippagePercent = (slippageAmount / plan.plannedPrice) * 100;
  const expectedGrossAmount = artifact.executionPrice * artifact.quantity;
  const grossAmountReconciles = approxEqual(artifact.grossAmount, expectedGrossAmount);
  const fxImpact = artifact.costs.fxImpact ?? 0;
  const taxes = artifact.costs.taxes ?? 0;
  const exchangeFee = artifact.costs.exchangeFee ?? 0;
  const expectedSettlementAmount =
    artifact.side === "BUY"
      ? artifact.grossAmount + artifact.commission + taxes + exchangeFee + fxImpact
      : artifact.grossAmount - artifact.commission - taxes - exchangeFee + fxImpact;
  const settlementAmountReconciles = approxEqual(
    artifact.totalSettlementAmount,
    expectedSettlementAmount,
  );
  const settlementAmountDelta = artifact.totalSettlementAmount - expectedSettlementAmount;
  const commissionImpactPercent =
    artifact.grossAmount > 0 ? (artifact.commission / artifact.grossAmount) * 100 : 0;
  const fxMismatch = Boolean(
    artifact.costs.fxRate &&
      Math.abs(fxImpact) > mockPlanVsActualDeviationThresholds.fxMismatchTolerance &&
      !approxEqual(artifact.totalSettlementAmount, expectedSettlementAmount),
  );
  const sensitiveOrUnsafe =
    containsForbiddenSettlementSensitiveData(extraction) ||
    artifact.duplicateConfirmation ||
    extraction.evidence.duplicateConfirmation;
  const missingArtifact = !hasText(artifact.artifactId);
  const extractionViolations = getSettlementExtractionViolations(extraction);
  const hardBlockedViolations = extractionViolations.filter(isHardBlockedViolation);
  const softExtractionViolations =
    extractionViolations.length > hardBlockedViolations.length;
  const expectedRealizedPnl =
    extraction.side === "SELL" && extraction.positionReference
      ? (artifact.executionPrice - extraction.positionReference.entryReference) *
          artifact.quantity -
        artifact.commission
      : undefined;
  const realizedPnl = extraction.realizedPnl;
  const realizedPnlReconciles =
    extraction.side !== "SELL" ||
    (typeof realizedPnl === "number" &&
      typeof expectedRealizedPnl === "number" &&
      approxEqual(realizedPnl, expectedRealizedPnl));
  const financialMismatch =
    !grossAmountReconciles ||
    !settlementAmountReconciles ||
    fxMismatch ||
    !realizedPnlReconciles;
  const majorFinancialMismatch = Boolean(
    Math.abs(artifact.grossAmount - expectedGrossAmount) >
      mockPlanVsActualDeviationThresholds.majorGrossDeltaAmount ||
      Math.abs(settlementAmountDelta) >
        mockPlanVsActualDeviationThresholds.majorSettlementDeltaAmount ||
      Math.abs(fxImpact) > mockPlanVsActualDeviationThresholds.majorFxImpactAmount ||
      !realizedPnlReconciles,
  );
  const mismatch =
    hardBlockedViolations.length > 0 ||
    !sideMatches ||
    !tickerMatches ||
    (!quantityMatches && !partialFill) ||
    missingArtifact;
  const partialFillNeedsReview = partialFill;
  const blockedReasons: string[] = [
    ...extractionViolations,
    ...(!tickerMatches ? ["ticker mismatch"] : []),
    ...(!sideMatches ? ["side mismatch"] : []),
    ...(!quantityMatches && !partialFill ? ["quantity mismatch without partial fill"] : []),
    ...(!grossAmountReconciles ? ["gross amount does not reconcile"] : []),
    ...(!settlementAmountReconciles ? ["settlement amount does not reconcile"] : []),
    ...(fxMismatch ? ["FX amount does not reconcile"] : []),
    ...(!realizedPnlReconciles ? ["SELL realized PnL does not reconcile"] : []),
    ...(missingArtifact ? ["settlement artifact missing"] : []),
    ...(partialFillNeedsReview ? ["partial fill requires manual review"] : []),
    ...(sensitiveOrUnsafe ? ["sensitive or duplicate evidence blocked"] : []),
  ];

  let deviationClassification: MockExecutionDeviationClassification = "execution_match";

  if (sensitiveOrUnsafe || missingArtifact || mismatch) {
    deviationClassification = "blocked_sensitive_or_mismatched_evidence";
  } else if (partialFillNeedsReview || partialFill) {
    deviationClassification = "requires_manual_review";
  } else if (
    majorFinancialMismatch ||
    softExtractionViolations ||
    Math.abs(slippagePercent) > mockPlanVsActualDeviationThresholds.minorSlippagePercent ||
    commissionImpactPercent > mockPlanVsActualDeviationThresholds.majorFeeImpactPercent
  ) {
    deviationClassification = "major_execution_deviation";
  } else if (
    financialMismatch ||
    Math.abs(slippagePercent) > mockPlanVsActualDeviationThresholds.exactSlippagePercent
  ) {
    deviationClassification = "minor_execution_deviation";
  }

  return {
    reviewId: `${extraction.extractionId}_review`,
    extractionId: extraction.extractionId,
    sideMatches,
    tickerMatches,
    quantityMatches,
    partialFill,
    plannedPrice: plan.plannedPrice,
    executionPrice: artifact.executionPrice,
    slippageAmount: Number(slippageAmount.toFixed(4)),
    slippagePercent: Number(slippagePercent.toFixed(4)),
    feeImpact: artifact.commission,
    expectedGrossAmount: Number(expectedGrossAmount.toFixed(4)),
    grossAmountReconciles,
    expectedSettlementAmount: Number(expectedSettlementAmount.toFixed(4)),
    settlementAmountDelta: Number(settlementAmountDelta.toFixed(4)),
    commissionImpactPercent: Number(commissionImpactPercent.toFixed(4)),
    fxRate: artifact.costs.fxRate,
    fxImpact: Number(fxImpact.toFixed(4)),
    fxMismatch,
    expectedRealizedPnl:
      typeof expectedRealizedPnl === "number"
        ? Number(expectedRealizedPnl.toFixed(4))
        : undefined,
    realizedPnl,
    realizedPnlReconciles,
    settlementAmountReconciles,
    noLivePositionMutation:
      extraction.side === "SELL"
        ? (extraction.safety as MockSellSettlementSafety).noLivePositionMutation
        : true,
    deviationClassification,
    requiresManualReview:
      deviationClassification !== "execution_match" &&
      deviationClassification !== "minor_execution_deviation",
    blockedReasons,
  };
}
