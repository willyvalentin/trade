import type { BrokerExecutionResultCandidate } from "@/lib/broker-execution-result-candidate-contract";
import type { ExecutionRecordCandidate } from "@/lib/execution-record-creation-contract";
import type {
  FinalSettlementNoteMatchingConfidence,
  FinalSettlementNoteMatchingLifecycleTransition,
  FinalSettlementNoteMatchingResult,
  FinalSettlementNoteMatchingStatus,
} from "@/lib/final-settlement-note-matching-contract";
import type {
  BrokerEvidenceMaskedAccountContext,
  BrokerEvidenceMonetaryAmount,
  BrokerEvidenceReviewFlag,
  BrokerEvidenceSourceReference,
  BrokerEvidenceWarning,
  FinalBrokerSettlementNoteEvidence,
  ImmediateBrokerReadbackEvidence,
} from "@/lib/two-stage-broker-evidence-contract";

export const FINALIZATION_CANDIDATE_CONTRACT_VERSION =
  "finalization_candidate_v1" as const;

export type FinalizationCandidateContractVersion =
  typeof FINALIZATION_CANDIDATE_CONTRACT_VERSION;

export const FINALIZATION_CANDIDATE_STATUSES = [
  "candidate_ready",
  "needs_review",
  "blocked",
  "partial_fill_review",
  "duplicate_review",
  "unsupported",
] as const;

export type FinalizationCandidateStatus =
  (typeof FINALIZATION_CANDIDATE_STATUSES)[number];

export const FINALIZATION_CANDIDATE_SOURCES = [
  "final_settlement_note_match",
  "manual_review",
  "dev_fixture",
  "broker_execution_result_candidate",
  "execution_record_candidate_metadata",
] as const;

export type FinalizationCandidateSource =
  (typeof FINALIZATION_CANDIDATE_SOURCES)[number];

export const FINALIZATION_CANDIDATE_REVIEW_FLAGS = [
  "manual_review_required",
  "match_not_exact",
  "partial_fill_requires_review",
  "duplicate_match_requires_review",
  "missing_final_note_field",
  "missing_settlement_field",
  "missing_fee_or_total",
  "missing_fx_rate",
  "account_context_requires_review",
  "provenance_requires_review",
  "execution_record_metadata_present_but_not_authorized",
  "pnl_adjustment_preview_only",
  "finalization_validator_missing",
] as const;

export type FinalizationCandidateReviewFlag =
  (typeof FINALIZATION_CANDIDATE_REVIEW_FLAGS)[number];

export const FINALIZATION_CANDIDATE_WARNINGS = [
  "candidate_contract_only",
  "not_finalization_approval",
  "not_persistence_approval",
  "not_execution_record_creation_approval",
  "not_stats_update_approval",
  "not_trade_mutation_approval",
  "finalization_validator_not_implemented",
  "persistence_not_attempted",
  "execution_record_creation_not_attempted",
  "stats_update_not_attempted",
  "trade_mutation_not_attempted",
  "manual_review_required",
] as const;

export type FinalizationCandidateWarning =
  (typeof FINALIZATION_CANDIDATE_WARNINGS)[number];

export const FINALIZATION_CANDIDATE_REJECTION_REASONS = [
  "matching_result_missing",
  "matching_result_not_matched",
  "matching_result_needs_review",
  "matching_result_duplicate",
  "matching_result_insufficient_data",
  "matching_result_mismatch",
  "provisional_evidence_missing",
  "final_settlement_note_missing",
  "instrument_mismatch",
  "side_mismatch",
  "quantity_mismatch",
  "account_context_mismatch",
  "missing_note_reference",
  "missing_provenance",
  "missing_business_or_settlement_date",
  "missing_execution_price",
  "missing_currency",
  "partial_fill_policy_missing",
  "unsupported_broker",
  "automatic_mode_not_allowed",
  "finalization_validator_missing",
] as const;

export type FinalizationCandidateRejectionReason =
  (typeof FINALIZATION_CANDIDATE_REJECTION_REASONS)[number];

export const FINALIZATION_CANDIDATE_PARTIAL_FILL_STATUSES = [
  "not_partial",
  "single_note_full_fill",
  "partial_fill_requires_review",
  "multiple_notes_requires_review",
  "partial_fill_ambiguous",
] as const;

export type FinalizationCandidatePartialFillStatus =
  (typeof FINALIZATION_CANDIDATE_PARTIAL_FILL_STATUSES)[number];

export const FINALIZATION_CANDIDATE_PNL_ADJUSTMENT_STATUSES = [
  "not_calculated",
  "preview_only",
  "requires_review",
  "blocked",
] as const;

export type FinalizationCandidatePnLAdjustmentStatus =
  (typeof FINALIZATION_CANDIDATE_PNL_ADJUSTMENT_STATUSES)[number];

export type FinalizationCandidateSafetyPolicy = {
  safeToFinalize: false;
  safeToPersist: false;
  safeToMutateTrade: false;
  safeToUpdateStats: false;
  safeToCreateExecutionRecord: false;
  automaticModeAllowed: false;
  manualReviewRequired: true;
  finalizationImplementationEnabled: false;
  finalizationValidatorImplemented: false;
  persistenceImplementationEnabled: false;
  executionRecordCreationEnabled: false;
  statsUpdateEnabled: false;
  tradeMutationEnabled: false;
  auditAppendEnabled: false;
  browserAutomationEnabled: false;
  avanzaAutomationEnabled: false;
  policyReason: string;
};

export const FINALIZATION_CANDIDATE_DEFAULT_SAFETY_POLICY = {
  safeToFinalize: false,
  safeToPersist: false,
  safeToMutateTrade: false,
  safeToUpdateStats: false,
  safeToCreateExecutionRecord: false,
  automaticModeAllowed: false,
  manualReviewRequired: true,
  finalizationImplementationEnabled: false,
  finalizationValidatorImplemented: false,
  persistenceImplementationEnabled: false,
  executionRecordCreationEnabled: false,
  statsUpdateEnabled: false,
  tradeMutationEnabled: false,
  auditAppendEnabled: false,
  browserAutomationEnabled: false,
  avanzaAutomationEnabled: false,
  policyReason:
    "Finalization candidate contracts are type-only and do not approve or implement finalization, persistence, execution-record creation, stats/PnL updates, trade mutation, audit append, browser automation, or Avanza behavior.",
} as const satisfies FinalizationCandidateSafetyPolicy;

export type FinalizationCandidateSourceReferences = {
  source: FinalizationCandidateSource;
  provisionalImmediateReadbackEvidence?: ImmediateBrokerReadbackEvidence | null;
  finalSettlementNoteEvidence?: FinalBrokerSettlementNoteEvidence | null;
  finalSettlementNoteMatchingResult?: FinalSettlementNoteMatchingResult | null;
  brokerExecutionResultCandidate?: BrokerExecutionResultCandidate | null;
  executionRecordCandidate?: ExecutionRecordCandidate | null;
  handoffPayloadFingerprint?: string | null;
  provisionalTradeId?: string | null;
  liveTradeId?: string | null;
  positionId?: string | null;
  recommendationId?: string | null;
  accountContext?: BrokerEvidenceMaskedAccountContext | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationCandidateEvidenceSummary = {
  broker: "avanza";
  sourceClassification?: string | null;
  provisionalEvidenceFingerprint?: string | null;
  finalNoteEvidenceFingerprint?: string | null;
  handoffPayloadFingerprint?: string | null;
  noteReferenceNumber?: string | null;
  sourceReference?: BrokerEvidenceSourceReference | null;
  accountContext?: BrokerEvidenceMaskedAccountContext | null;
  missingFields: string[];
  reviewFlags: Array<FinalizationCandidateReviewFlag | BrokerEvidenceReviewFlag>;
  rawSensitiveDataStored: false;
};

export type FinalizationCandidateMatchSummary = {
  status: FinalSettlementNoteMatchingStatus;
  confidence: FinalSettlementNoteMatchingConfidence;
  matched: boolean;
  lifecycleTransitionSuggestion: FinalSettlementNoteMatchingLifecycleTransition;
  hardGateBlockedCount: number;
  softSignalReviewCount: number;
  mismatchReasons: string[];
  duplicateReasons: string[];
  reviewFlags: Array<FinalizationCandidateReviewFlag | BrokerEvidenceReviewFlag>;
  warnings: Array<FinalizationCandidateWarning | BrokerEvidenceWarning>;
};

export type FinalizationCandidateInstrumentSummary = {
  instrumentName: string;
  ticker?: string | null;
  isin?: string | null;
  instrumentId?: string | null;
  market?: string | null;
  venue?: string | null;
};

export type FinalizationCandidateSettlementSummary = {
  broker: "avanza";
  instrument: FinalizationCandidateInstrumentSummary;
  side: "buy" | "sell";
  quantity: number;
  executionPrice?: BrokerEvidenceMonetaryAmount | null;
  currency?: string | null;
  businessDate?: string | null;
  settlementDate?: string | null;
  executionTimestamp?: string | null;
  orderType?: string | null;
  noteReferenceNumber?: string | null;
  consideration?: BrokerEvidenceMonetaryAmount | null;
  totalAmount?: BrokerEvidenceMonetaryAmount | null;
  provenance?: BrokerEvidenceSourceReference | null;
};

export type FinalizationCandidateFeeSummary = {
  commission?: BrokerEvidenceMonetaryAmount | null;
  fees?: BrokerEvidenceMonetaryAmount[];
  feeCurrency?: string | null;
  totalFees?: BrokerEvidenceMonetaryAmount | null;
  missingFeeData: boolean;
  reviewRequired: boolean;
};

export type FinalizationCandidateFxSummary = {
  baseCurrency?: string | null;
  settlementCurrency?: string | null;
  accountCurrency?: string | null;
  fxRates: Array<{
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    sourceReference?: string | null;
  }>;
  missingFxData: boolean;
  reviewRequired: boolean;
};

export type FinalizationCandidatePnLAdjustmentSummary = {
  status: FinalizationCandidatePnLAdjustmentStatus;
  previewOnly: true;
  realizedPnL?: BrokerEvidenceMonetaryAmount | null;
  feeAdjustment?: BrokerEvidenceMonetaryAmount | null;
  fxAdjustment?: BrokerEvidenceMonetaryAmount | null;
  cashImpact?: BrokerEvidenceMonetaryAmount | null;
  statsUpdateAttempted: false;
  tradeMutationAttempted: false;
  notes?: string | null;
};

export type FinalizationCandidateExecutionRecordMetadata = {
  executionRecordCandidate?: ExecutionRecordCandidate | null;
  recordFingerprint?: string | null;
  idempotencyKey?: string | null;
  sourceEvidenceFingerprint?: string | null;
  brokerResultFingerprint?: string | null;
  safeToCreateExecutionRecord: false;
  executionRecordCreated: false;
  persistenceAttempted: false;
};

export type FinalizationCandidate = {
  contractVersion: FinalizationCandidateContractVersion;
  candidateId: string;
  createdAt: string;
  status: FinalizationCandidateStatus;
  sourceReferences: FinalizationCandidateSourceReferences;
  evidenceSummary: FinalizationCandidateEvidenceSummary;
  matchSummary: FinalizationCandidateMatchSummary;
  settlementSummary: FinalizationCandidateSettlementSummary;
  feeSummary: FinalizationCandidateFeeSummary;
  fxSummary: FinalizationCandidateFxSummary;
  pnlAdjustmentSummary: FinalizationCandidatePnLAdjustmentSummary;
  executionRecordMetadata?: FinalizationCandidateExecutionRecordMetadata | null;
  partialFillStatus: FinalizationCandidatePartialFillStatus;
  reviewFlags: Array<FinalizationCandidateReviewFlag | BrokerEvidenceReviewFlag>;
  warnings: Array<FinalizationCandidateWarning | BrokerEvidenceWarning>;
  rejectionReasons: FinalizationCandidateRejectionReason[];
  safetyPolicy: FinalizationCandidateSafetyPolicy;
  safeToFinalize: false;
  safeToPersist: false;
  safeToMutateTrade: false;
  safeToUpdateStats: false;
  safeToCreateExecutionRecord: false;
  finalizationAttempted: false;
  persistenceAttempted: false;
  executionRecordCreationAttempted: false;
  statsUpdateAttempted: false;
  tradeMutationAttempted: false;
  auditAppendAttempted: false;
  browserAutomationAttempted: false;
  avanzaAutomationAttempted: false;
  metadata?: Record<string, unknown>;
};

export const FINALIZATION_CANDIDATE_STATUS_METADATA = {
  candidate_ready: {
    requiresReview: false,
    blocksFinalization: true,
    reason:
      "Candidate appears ready for a future validator, but this contract does not approve finalization.",
  },
  needs_review: {
    requiresReview: true,
    blocksFinalization: true,
    reason: "Manual review is required before any future finalization boundary.",
  },
  blocked: {
    requiresReview: true,
    blocksFinalization: true,
    reason: "Blocking data or policy prevents finalization candidacy.",
  },
  partial_fill_review: {
    requiresReview: true,
    blocksFinalization: true,
    reason: "Partial-fill handling requires separate review.",
  },
  duplicate_review: {
    requiresReview: true,
    blocksFinalization: true,
    reason: "Duplicate match candidates require separate review.",
  },
  unsupported: {
    requiresReview: true,
    blocksFinalization: true,
    reason: "The candidate source or broker is unsupported.",
  },
} as const satisfies Record<
  FinalizationCandidateStatus,
  {
    requiresReview: boolean;
    blocksFinalization: true;
    reason: string;
  }
>;

// Contract metadata only. A FinalizationCandidate is not finalization approval,
// not persistence approval, not execution-record creation approval, not
// stats/PnL update approval, and not trade mutation approval. This module does
// not implement validation, finalization, persistence, Supabase/localStorage
// writes, audit append, execution-record creation, stats updates, trade
// mutation, UI wiring, capture, browser automation, or Avanza behavior.
