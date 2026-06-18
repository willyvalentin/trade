import type { BrokerExecutionResultCandidate } from "@/lib/broker-execution-result-candidate-contract";
import type { ExecutionRecordCandidate } from "@/lib/execution-record-creation-contract";
import type {
  FinalizationCandidate,
  FinalizationCandidateSafetyPolicy,
  FinalizationCandidateStatus,
} from "@/lib/finalization-candidate-contract";
import type { FinalSettlementNoteMatchingResult } from "@/lib/final-settlement-note-matching-contract";
import type {
  BrokerEvidenceMaskedAccountContext,
  BrokerEvidenceMonetaryAmount,
  BrokerEvidenceSourceReference,
  FinalBrokerSettlementNoteEvidence,
  ImmediateBrokerReadbackEvidence,
} from "@/lib/two-stage-broker-evidence-contract";

// Contract metadata only. These types describe the future builder input and
// result boundary. They do not implement a builder, validator, finalization,
// persistence, execution-record creation, stats/PnL updates, trade mutation,
// UI wiring, capture, browser automation, or Avanza behavior.

export const FINALIZATION_CANDIDATE_BUILDER_CONTRACT_VERSION =
  "finalization_candidate_builder_v1" as const;

export type FinalizationCandidateBuilderContractVersion =
  typeof FINALIZATION_CANDIDATE_BUILDER_CONTRACT_VERSION;

export const FINALIZATION_CANDIDATE_BUILDER_STATUSES = [
  "candidate_built",
  "needs_review",
  "blocked",
  "partial_fill_review",
  "duplicate_review",
  "unsupported",
] as const;

export type FinalizationCandidateBuilderStatus =
  (typeof FINALIZATION_CANDIDATE_BUILDER_STATUSES)[number];

export const FINALIZATION_CANDIDATE_BUILDER_PRECONDITIONS = [
  "matching_result_exact_or_strong_enough_or_reviewable",
  "final_note_source_identity_present",
  "provenance_present",
  "broker_source_compatible",
  "side_compatible",
  "instrument_compatible",
  "quantity_compatible",
  "date_compatible",
  "fee_or_commission_present_or_flagged",
  "fx_data_present_if_needed_or_flagged",
  "settlement_dates_present_or_flagged",
  "handoff_fingerprint_present",
  "no_duplicate_candidate_conflict",
  "partial_fill_ambiguity_resolved_or_review_only",
] as const;

export type FinalizationCandidateBuilderPrecondition =
  (typeof FINALIZATION_CANDIDATE_BUILDER_PRECONDITIONS)[number];

export const FINALIZATION_CANDIDATE_BUILDER_REJECTION_REASONS = [
  "matching_result_not_acceptable",
  "missing_final_note_source",
  "missing_provenance",
  "broker_source_mismatch",
  "instrument_mismatch",
  "side_mismatch",
  "quantity_mismatch",
  "date_mismatch",
  "missing_handoff_fingerprint",
  "duplicate_candidate_conflict",
  "partial_fill_ambiguous",
  "missing_fee_data",
  "missing_fx_data",
  "unsupported_broker",
  "unsupported_source",
  "finalization_not_enabled",
] as const;

export type FinalizationCandidateBuilderRejectionReason =
  (typeof FINALIZATION_CANDIDATE_BUILDER_REJECTION_REASONS)[number];

export const FINALIZATION_CANDIDATE_BUILDER_WARNINGS = [
  "fee_data_missing_review_required",
  "fx_data_missing_review_required",
  "settlement_date_missing_review_required",
  "pnl_adjustment_estimated",
  "manual_review_required",
  "candidate_not_finalization_approval",
] as const;

export type FinalizationCandidateBuilderWarning =
  (typeof FINALIZATION_CANDIDATE_BUILDER_WARNINGS)[number];

export type FinalizationCandidateBuilderSafetyPolicy = Pick<
  FinalizationCandidateSafetyPolicy,
  | "safeToFinalize"
  | "safeToPersist"
  | "safeToCreateExecutionRecord"
  | "safeToUpdateStats"
  | "safeToMutateTrade"
  | "automaticModeAllowed"
  | "manualReviewRequired"
  | "finalizationImplementationEnabled"
  | "finalizationValidatorImplemented"
  | "persistenceImplementationEnabled"
  | "executionRecordCreationEnabled"
  | "statsUpdateEnabled"
  | "tradeMutationEnabled"
  | "auditAppendEnabled"
  | "browserAutomationEnabled"
  | "avanzaAutomationEnabled"
  | "policyReason"
>;

export const FINALIZATION_CANDIDATE_BUILDER_DEFAULT_SAFETY_POLICY = {
  safeToFinalize: false,
  safeToPersist: false,
  safeToCreateExecutionRecord: false,
  safeToUpdateStats: false,
  safeToMutateTrade: false,
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
    "Finalization candidate builder contract types are type-only and do not implement or approve finalization, persistence, execution-record creation, stats/PnL updates, trade mutation, audit append, browser automation, or Avanza behavior.",
} as const satisfies FinalizationCandidateBuilderSafetyPolicy;

export type FinalizationCandidateBuilderPreconditionResult = {
  precondition: FinalizationCandidateBuilderPrecondition;
  status: "passed" | "review_required" | "blocked" | "unsupported";
  satisfied: boolean;
  rejectionReason?: FinalizationCandidateBuilderRejectionReason | null;
  warning?: FinalizationCandidateBuilderWarning | null;
  details?: string | null;
};

export type FinalizationCandidateBuilderPolicySnapshot = {
  contractVersion: FinalizationCandidateBuilderContractVersion;
  evaluatedAt?: string | null;
  allowsCandidateBuild: true;
  allowsFinalization: false;
  allowsPersistence: false;
  allowsExecutionRecordCreation: false;
  allowsStatsUpdate: false;
  allowsTradeMutation: false;
  allowsAutomaticMode: false;
  requiresManualReview: true;
  safetyPolicy: FinalizationCandidateBuilderSafetyPolicy;
};

export const FINALIZATION_CANDIDATE_BUILDER_DEFAULT_POLICY_SNAPSHOT = {
  contractVersion: FINALIZATION_CANDIDATE_BUILDER_CONTRACT_VERSION,
  evaluatedAt: null,
  allowsCandidateBuild: true,
  allowsFinalization: false,
  allowsPersistence: false,
  allowsExecutionRecordCreation: false,
  allowsStatsUpdate: false,
  allowsTradeMutation: false,
  allowsAutomaticMode: false,
  requiresManualReview: true,
  safetyPolicy: FINALIZATION_CANDIDATE_BUILDER_DEFAULT_SAFETY_POLICY,
} as const satisfies FinalizationCandidateBuilderPolicySnapshot;

export type FinalizationCandidateBuilderSettlementInputSummary = {
  broker: "avanza" | "unsupported";
  businessDate?: string | null;
  settlementDate?: string | null;
  printDate?: string | null;
  noteReferenceNumber?: string | null;
  totalAmount?: BrokerEvidenceMonetaryAmount | null;
  consideration?: BrokerEvidenceMonetaryAmount | null;
  currency?: string | null;
  accountContext?: BrokerEvidenceMaskedAccountContext | null;
  sourceProvenance?: BrokerEvidenceSourceReference | null;
  missingFields: string[];
  reviewRequired: boolean;
};

export type FinalizationCandidateBuilderFeeInputSummary = {
  commission?: BrokerEvidenceMonetaryAmount | null;
  fees?: BrokerEvidenceMonetaryAmount[];
  feeCurrency?: string | null;
  totalFees?: BrokerEvidenceMonetaryAmount | null;
  commissionAvailable: boolean;
  commissionMissing: boolean;
  reviewRequired: boolean;
};

export type FinalizationCandidateBuilderFxInputSummary = {
  baseCurrency?: string | null;
  settlementCurrency?: string | null;
  accountCurrency?: string | null;
  fxRequired: boolean;
  fxRatesAvailable: boolean;
  fxRatesMissing: boolean;
  sekOnly: boolean;
  reviewRequired: boolean;
};

export type FinalizationCandidateBuilderPnLInputSummary = {
  existingRealizedPnL?: BrokerEvidenceMonetaryAmount | null;
  provisionalPnL?: BrokerEvidenceMonetaryAmount | null;
  estimatedFinalPnL?: BrokerEvidenceMonetaryAmount | null;
  feeAdjustment?: BrokerEvidenceMonetaryAmount | null;
  fxAdjustment?: BrokerEvidenceMonetaryAmount | null;
  cashImpact?: BrokerEvidenceMonetaryAmount | null;
  pnlDeltaEstimated: boolean;
  previewOnly: true;
  safeToUpdateStats: false;
};

export type FinalizationCandidateBuilderTradeContext = {
  provisionalTradeId?: string | null;
  liveTradeId?: string | null;
  positionId?: string | null;
  recommendationId?: string | null;
  ticker?: string | null;
  instrumentName?: string | null;
  side?: "buy" | "sell" | null;
  quantity?: number | null;
  status?: string | null;
};

export type FinalizationCandidateBuilderExistingStatsSummary = {
  currentRealizedPnL?: BrokerEvidenceMonetaryAmount | null;
  currentFeeTotal?: BrokerEvidenceMonetaryAmount | null;
  currentFxAdjustment?: BrokerEvidenceMonetaryAmount | null;
  lastUpdatedAt?: string | null;
  source?: string | null;
};

export type FinalizationCandidateBuilderInput = {
  contractVersion: FinalizationCandidateBuilderContractVersion;
  requestedAt: string;
  provisionalImmediateReadbackEvidence: ImmediateBrokerReadbackEvidence;
  finalSettlementNoteEvidence: FinalBrokerSettlementNoteEvidence;
  finalSettlementNoteMatchingResult: FinalSettlementNoteMatchingResult;
  brokerExecutionResultCandidate: BrokerExecutionResultCandidate;
  provisionalTradeContext?: FinalizationCandidateBuilderTradeContext | null;
  liveTradeContext?: FinalizationCandidateBuilderTradeContext | null;
  handoffPayloadFingerprint?: string | null;
  accountContext?: BrokerEvidenceMaskedAccountContext | null;
  executionRecordCandidate?: ExecutionRecordCandidate | null;
  existingStatsSummary?: FinalizationCandidateBuilderExistingStatsSummary | null;
  policySnapshot?: FinalizationCandidateBuilderPolicySnapshot | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationCandidateBuilderResult = {
  contractVersion: FinalizationCandidateBuilderContractVersion;
  evaluatedAt: string;
  status: FinalizationCandidateBuilderStatus;
  candidateStatus?: FinalizationCandidateStatus | null;
  candidate?: FinalizationCandidate | null;
  preconditionResults: FinalizationCandidateBuilderPreconditionResult[];
  warnings: FinalizationCandidateBuilderWarning[];
  rejectionReasons: FinalizationCandidateBuilderRejectionReason[];
  policySnapshot: FinalizationCandidateBuilderPolicySnapshot;
  settlementInputSummary: FinalizationCandidateBuilderSettlementInputSummary;
  feeInputSummary: FinalizationCandidateBuilderFeeInputSummary;
  fxInputSummary: FinalizationCandidateBuilderFxInputSummary;
  pnlInputSummary: FinalizationCandidateBuilderPnLInputSummary;
  safetyPolicy: FinalizationCandidateBuilderSafetyPolicy;
  safeToFinalize: false;
  safeToPersist: false;
  safeToCreateExecutionRecord: false;
  safeToUpdateStats: false;
  safeToMutateTrade: false;
  builderImplementationEnabled: false;
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

export const FINALIZATION_CANDIDATE_BUILDER_STATUS_METADATA = {
  candidate_built: {
    candidateMayBePresent: true,
    requiresReview: true,
    blocksFinalization: true,
    reason:
      "A candidate may be shaped for future validation, but builder contracts do not approve finalization.",
  },
  needs_review: {
    candidateMayBePresent: true,
    requiresReview: true,
    blocksFinalization: true,
    reason: "Manual review is required before any future finalization boundary.",
  },
  blocked: {
    candidateMayBePresent: false,
    requiresReview: true,
    blocksFinalization: true,
    reason: "Blocking evidence, match, provenance, or policy data is missing.",
  },
  partial_fill_review: {
    candidateMayBePresent: true,
    requiresReview: true,
    blocksFinalization: true,
    reason: "Partial-fill ambiguity requires manual review.",
  },
  duplicate_review: {
    candidateMayBePresent: true,
    requiresReview: true,
    blocksFinalization: true,
    reason: "Duplicate candidate conflicts require manual review.",
  },
  unsupported: {
    candidateMayBePresent: false,
    requiresReview: true,
    blocksFinalization: true,
    reason: "The broker, source, settlement model, or evidence shape is unsupported.",
  },
} as const satisfies Record<
  FinalizationCandidateBuilderStatus,
  {
    candidateMayBePresent: boolean;
    requiresReview: true;
    blocksFinalization: true;
    reason: string;
  }
>;
