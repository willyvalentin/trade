export type PostTradePersistencePayloadCategory =
  | "settlement_review"
  | "broker_confirmation_evidence_metadata"
  | "cost_breakdown"
  | "deviation_review"
  | "manual_review_status"
  | "learning_candidate";

export type PostTradePersistenceDeviationClassification =
  | "execution_match"
  | "minor_execution_deviation"
  | "major_execution_deviation"
  | "requires_manual_review"
  | "blocked_sensitive_or_mismatched_evidence";

export type PostTradePersistenceManualReviewStatus =
  | "not_required"
  | "required"
  | "approved_for_review_only"
  | "blocked";

export type PostTradePersistencePayload = {
  payloadCategory: PostTradePersistencePayloadCategory;
  internalTradeId?: string;
  planId?: string;
  contractId?: string;
  reviewId?: string;
  extractionId?: string;
  redactedEvidenceArtifactId?: string;
  side?: "BUY" | "SELL";
  ticker?: string;
  quantity?: number;
  plannedPrice?: number;
  executionPrice?: number;
  slippage?: number;
  currency?: string;
  commission?: number;
  fxRate?: number;
  grossAmount?: number;
  settlementAmount?: number;
  deviationClassification?: PostTradePersistenceDeviationClassification;
  manualReviewStatus?: PostTradePersistenceManualReviewStatus;
  extractionTimestamp?: string;
  reviewedBySafeActorLabel?: string;
  redactionStatus: "redacted" | "safe_summary_only";
  sensitiveDataPresent: false;
  supabaseWriteAuthority: false;
  productionPersistenceAllowed: false;
  rawArtifactStored: false;
  learningAutoUpdateAllowed: false;
  learningCandidateStatus?: "staged_manual_review_only";
  outcomeEligible?: false;
  requiresSeparateLearningGate?: true;
};

export const postTradePersistenceAllowedFields = [
  "payloadCategory",
  "internalTradeId",
  "planId",
  "contractId",
  "reviewId",
  "extractionId",
  "redactedEvidenceArtifactId",
  "side",
  "ticker",
  "quantity",
  "plannedPrice",
  "executionPrice",
  "slippage",
  "currency",
  "commission",
  "fxRate",
  "grossAmount",
  "settlementAmount",
  "deviationClassification",
  "manualReviewStatus",
  "extractionTimestamp",
  "reviewedBySafeActorLabel",
  "redactionStatus",
  "sensitiveDataPresent",
  "supabaseWriteAuthority",
  "productionPersistenceAllowed",
  "rawArtifactStored",
  "learningAutoUpdateAllowed",
  "learningCandidateStatus",
  "outcomeEligible",
  "requiresSeparateLearningGate",
] as const;

export const postTradePersistenceNeverPersistFields = [
  "credentials",
  "password",
  "BankID",
  "bankIdData",
  "MFA",
  "mfaCode",
  "cookie",
  "session",
  "rawBrowserStorage",
  "networkDump",
  "envSecret",
  "supabaseServiceKey",
  "apiToken",
  "personalIdentityNumber",
  "personnummer",
  "customerId",
  "accountNumber",
  "accountId",
  "accountBalance",
  "unrelatedHoldings",
  "rawPdf",
  "rawScreenshot",
  "rawHtml",
  "rawBrokerPage",
  "unredactedSettlementNote",
  "unredactedBrokerConfirmation",
  "orderSubmissionAuthority",
  "finalBuyAuthority",
  "finalSellAuthority",
  "brokerAuthority",
  "accountBinding",
  "liveOrderIntent",
  "liveTradeMutationAuthority",
  "livePositionMutationAuthority",
  "apiRouteActivation",
  "tradeUiExecution",
  "browserAutomation",
  "avanzaBridgeSession",
  "cookieSessionExport",
  "bankIdAutomation",
] as const;

const allowedFieldSet = new Set<string>(postTradePersistenceAllowedFields);
const neverPersistFieldSet = new Set<string>(postTradePersistenceNeverPersistFields);

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

function requireText(
  payload: Record<string, unknown>,
  key: string,
  violations: string[],
) {
  if (!hasText(payload[key])) {
    violations.push(`${key} is required`);
  }
}

function requireNumber(
  payload: Record<string, unknown>,
  key: string,
  violations: string[],
) {
  if (!isFiniteNumber(payload[key])) {
    violations.push(`${key} must be a finite number`);
  }
}

export const safeSettlementReviewPayloadFixture: PostTradePersistencePayload = {
  payloadCategory: "settlement_review",
  internalTradeId: "internal_trade_mock_001",
  planId: "mock_buy_plan_001",
  contractId: "mock_buy_contract_001",
  reviewId: "mock_buy_review_001",
  extractionId: "mock_buy_settlement_extraction_001",
  redactedEvidenceArtifactId: "redacted_artifact_mock_buy_001",
  side: "BUY",
  ticker: "TURBUY",
  quantity: 12,
  plannedPrice: 101.25,
  executionPrice: 101.4,
  slippage: 0.15,
  currency: "SEK",
  commission: 9,
  fxRate: 1,
  grossAmount: 1216.8,
  settlementAmount: 1225.8,
  deviationClassification: "execution_match",
  manualReviewStatus: "not_required",
  extractionTimestamp: "2026-07-07T09:31:30.000Z",
  reviewedBySafeActorLabel: "reviewer_internal_mock",
  redactionStatus: "redacted",
  sensitiveDataPresent: false,
  supabaseWriteAuthority: false,
  productionPersistenceAllowed: false,
  rawArtifactStored: false,
  learningAutoUpdateAllowed: false,
};

export const safeBrokerConfirmationMetadataPayloadFixture: PostTradePersistencePayload = {
  payloadCategory: "broker_confirmation_evidence_metadata",
  internalTradeId: "internal_trade_mock_001",
  reviewId: "mock_buy_review_001",
  extractionId: "mock_buy_settlement_extraction_001",
  redactedEvidenceArtifactId: "redacted_artifact_mock_buy_001",
  side: "BUY",
  ticker: "TURBUY",
  quantity: 12,
  executionPrice: 101.4,
  currency: "SEK",
  extractionTimestamp: "2026-07-07T09:31:30.000Z",
  reviewedBySafeActorLabel: "reviewer_internal_mock",
  redactionStatus: "redacted",
  sensitiveDataPresent: false,
  supabaseWriteAuthority: false,
  productionPersistenceAllowed: false,
  rawArtifactStored: false,
  learningAutoUpdateAllowed: false,
};

export const safeCostBreakdownPayloadFixture: PostTradePersistencePayload = {
  payloadCategory: "cost_breakdown",
  internalTradeId: "internal_trade_mock_001",
  reviewId: "mock_buy_review_001",
  extractionId: "mock_buy_settlement_extraction_001",
  currency: "SEK",
  commission: 9,
  fxRate: 1,
  grossAmount: 1216.8,
  settlementAmount: 1225.8,
  extractionTimestamp: "2026-07-07T09:31:30.000Z",
  redactionStatus: "redacted",
  sensitiveDataPresent: false,
  supabaseWriteAuthority: false,
  productionPersistenceAllowed: false,
  rawArtifactStored: false,
  learningAutoUpdateAllowed: false,
};

export const safeDeviationReviewPayloadFixture: PostTradePersistencePayload = {
  payloadCategory: "deviation_review",
  internalTradeId: "internal_trade_mock_001",
  planId: "mock_sell_plan_001",
  contractId: "mock_sell_contract_001",
  reviewId: "mock_sell_review_001",
  extractionId: "mock_sell_settlement_extraction_001",
  side: "SELL",
  ticker: "TURSELL",
  quantity: 8,
  plannedPrice: 205,
  executionPrice: 204.2,
  slippage: 0.8,
  currency: "SEK",
  commission: 9,
  grossAmount: 1633.6,
  settlementAmount: 1624.6,
  deviationClassification: "minor_execution_deviation",
  manualReviewStatus: "approved_for_review_only",
  extractionTimestamp: "2026-07-07T10:15:30.000Z",
  reviewedBySafeActorLabel: "reviewer_internal_mock",
  redactionStatus: "redacted",
  sensitiveDataPresent: false,
  supabaseWriteAuthority: false,
  productionPersistenceAllowed: false,
  rawArtifactStored: false,
  learningAutoUpdateAllowed: false,
};

export const safeManualReviewStatusPayloadFixture: PostTradePersistencePayload = {
  payloadCategory: "manual_review_status",
  internalTradeId: "internal_trade_mock_partial_001",
  reviewId: "mock_partial_review_001",
  extractionId: "mock_buy_partial_fill_settlement_extraction_001",
  deviationClassification: "requires_manual_review",
  manualReviewStatus: "required",
  extractionTimestamp: "2026-07-07T09:31:30.000Z",
  reviewedBySafeActorLabel: "reviewer_internal_mock",
  redactionStatus: "redacted",
  sensitiveDataPresent: false,
  supabaseWriteAuthority: false,
  productionPersistenceAllowed: false,
  rawArtifactStored: false,
  learningAutoUpdateAllowed: false,
};

export const safeLearningCandidatePayloadFixture: PostTradePersistencePayload = {
  payloadCategory: "learning_candidate",
  internalTradeId: "internal_trade_mock_learning_001",
  reviewId: "mock_learning_candidate_review_001",
  extractionId: "mock_buy_settlement_extraction_001",
  deviationClassification: "requires_manual_review",
  manualReviewStatus: "required",
  extractionTimestamp: "2026-07-07T09:31:30.000Z",
  reviewedBySafeActorLabel: "reviewer_internal_mock",
  redactionStatus: "redacted",
  sensitiveDataPresent: false,
  supabaseWriteAuthority: false,
  productionPersistenceAllowed: false,
  rawArtifactStored: false,
  learningAutoUpdateAllowed: false,
  learningCandidateStatus: "staged_manual_review_only",
  outcomeEligible: false,
  requiresSeparateLearningGate: true,
};

export const safePostTradePersistencePayloadFixtures = [
  safeSettlementReviewPayloadFixture,
  safeBrokerConfirmationMetadataPayloadFixture,
  safeCostBreakdownPayloadFixture,
  safeDeviationReviewPayloadFixture,
  safeManualReviewStatusPayloadFixture,
  safeLearningCandidatePayloadFixture,
] as const;

export function buildMockSafeSettlementReviewPayload() {
  return { ...safeSettlementReviewPayloadFixture };
}

export function buildMockLearningCandidatePayload() {
  return { ...safeLearningCandidatePayloadFixture };
}

export function containsForbiddenPersistenceField(payload: Record<string, unknown>) {
  return Object.keys(payload).some((key) => neverPersistFieldSet.has(key));
}

export function getPostTradePersistencePayloadAllowlistViolations(
  payload: Record<string, unknown>,
) {
  const violations: string[] = [];
  const keys = Object.keys(payload);

  for (const key of keys) {
    if (!allowedFieldSet.has(key)) {
      violations.push(`unknown or non-allowlisted field: ${key}`);
    }
    if (neverPersistFieldSet.has(key)) {
      violations.push(`never-persist field present: ${key}`);
    }
  }

  if (payload.redactionStatus !== "redacted" && payload.redactionStatus !== "safe_summary_only") {
    violations.push("redactionStatus must be redacted or safe_summary_only");
  }
  if (payload.sensitiveDataPresent !== false) {
    violations.push("sensitiveDataPresent must be false");
  }
  if (payload.supabaseWriteAuthority !== false) {
    violations.push("supabaseWriteAuthority must be false");
  }
  if (payload.productionPersistenceAllowed !== false) {
    violations.push("productionPersistenceAllowed must be false");
  }
  if (payload.rawArtifactStored !== false) {
    violations.push("rawArtifactStored must be false");
  }
  if (payload.learningAutoUpdateAllowed !== false) {
    violations.push("learningAutoUpdateAllowed must be false");
  }

  requireText(payload, "reviewId", violations);
  requireText(payload, "extractionId", violations);
  requireText(payload, "extractionTimestamp", violations);

  switch (payload.payloadCategory) {
    case "settlement_review":
      for (const key of ["internalTradeId", "planId", "contractId", "redactedEvidenceArtifactId", "side", "ticker", "currency", "deviationClassification", "manualReviewStatus"]) {
        requireText(payload, key, violations);
      }
      for (const key of ["quantity", "plannedPrice", "executionPrice", "slippage", "commission", "grossAmount", "settlementAmount"]) {
        requireNumber(payload, key, violations);
      }
      break;
    case "broker_confirmation_evidence_metadata":
      for (const key of ["internalTradeId", "redactedEvidenceArtifactId", "side", "ticker", "currency"]) {
        requireText(payload, key, violations);
      }
      for (const key of ["quantity", "executionPrice"]) {
        requireNumber(payload, key, violations);
      }
      break;
    case "cost_breakdown":
      for (const key of ["internalTradeId", "currency"]) {
        requireText(payload, key, violations);
      }
      for (const key of ["commission", "grossAmount", "settlementAmount"]) {
        requireNumber(payload, key, violations);
      }
      break;
    case "deviation_review":
      for (const key of ["internalTradeId", "side", "ticker", "currency", "deviationClassification", "manualReviewStatus"]) {
        requireText(payload, key, violations);
      }
      for (const key of ["quantity", "plannedPrice", "executionPrice", "slippage"]) {
        requireNumber(payload, key, violations);
      }
      break;
    case "manual_review_status":
      for (const key of ["internalTradeId", "deviationClassification", "manualReviewStatus", "reviewedBySafeActorLabel"]) {
        requireText(payload, key, violations);
      }
      break;
    case "learning_candidate":
      for (const key of ["internalTradeId", "deviationClassification", "manualReviewStatus", "learningCandidateStatus", "reviewedBySafeActorLabel"]) {
        requireText(payload, key, violations);
      }
      if (payload.learningCandidateStatus !== "staged_manual_review_only") {
        violations.push("learningCandidateStatus must be staged_manual_review_only");
      }
      if (payload.outcomeEligible !== false) {
        violations.push("learning candidate outcomeEligible must be false before a future clean gate");
      }
      if (payload.requiresSeparateLearningGate !== true) {
        violations.push("learning candidate requiresSeparateLearningGate must be true");
      }
      if (payload.deviationClassification === "blocked_sensitive_or_mismatched_evidence") {
        violations.push("blocked deviation cannot be staged as learning candidate");
      }
      break;
    default:
      violations.push("payloadCategory must be recognized");
  }

  if (
    payload.deviationClassification === "requires_manual_review" &&
    payload.manualReviewStatus !== "required" &&
    payload.manualReviewStatus !== "approved_for_review_only"
  ) {
    violations.push("manual review deviation must be flagged for manual review");
  }
  if (
    payload.deviationClassification === "blocked_sensitive_or_mismatched_evidence" &&
    payload.manualReviewStatus !== "blocked"
  ) {
    violations.push("blocked deviation must be blocked");
  }

  return violations;
}

export function assertPostTradePersistencePayloadAllowlisted(
  payload: Record<string, unknown>,
) {
  const violations = getPostTradePersistencePayloadAllowlistViolations(payload);

  if (violations.length > 0) {
    throw new Error(`Unsafe post-trade persistence payload: ${violations.join("; ")}`);
  }
}
