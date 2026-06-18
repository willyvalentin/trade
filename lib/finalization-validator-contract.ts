import type { ExecutionRecordCandidate } from "@/lib/execution-record-creation-contract";
import type {
  FinalizationCandidate,
  FinalizationCandidateStatus,
} from "@/lib/finalization-candidate-contract";
import type {
  FinalizationCandidateBuilderResult,
  FinalizationCandidateBuilderTradeContext,
} from "@/lib/finalization-candidate-builder-contract";
import type { FinalSettlementNoteMatchingResult } from "@/lib/final-settlement-note-matching-contract";

// Contract metadata only. These types describe a future Finalization Validator
// boundary. They do not implement validation, finalization, persistence,
// execution-record creation, stats/PnL updates, trade mutation, UI wiring,
// capture, browser automation, Avanza behavior, broker behavior, or production
// runtime behavior.

export const FINALIZATION_VALIDATOR_CONTRACT_VERSION =
  "finalization_validator_v1" as const;

export type FinalizationValidatorContractVersion =
  typeof FINALIZATION_VALIDATOR_CONTRACT_VERSION;

export const FINALIZATION_VALIDATION_STATUSES = [
  "ready_for_finalization_review",
  "blocked",
  "needs_review",
  "partial_fill_review",
  "duplicate_review",
  "unsupported",
  "not_ready",
] as const;

export type FinalizationValidationStatus =
  (typeof FINALIZATION_VALIDATION_STATUSES)[number];

export const FINALIZATION_VALIDATION_HARD_GATES = [
  "candidate_exists",
  "candidate_status_acceptable",
  "source_evidence_summary_present",
  "match_summary_present",
  "settlement_summary_present",
  "note_reference_present",
  "provenance_present",
  "no_duplicate_conflict",
  "no_blocking_mismatch",
  "broker_source_supported",
  "handoff_fingerprint_present",
  "safety_policy_present_and_conservative",
] as const;

export type FinalizationValidationHardGate =
  (typeof FINALIZATION_VALIDATION_HARD_GATES)[number];

export const FINALIZATION_VALIDATION_REVIEW_GATES = [
  "partial_fill_review",
  "missing_fee_fx_data",
  "pnl_adjustment_uncertainty",
  "settlement_date_uncertainty",
  "account_category_ambiguity",
  "manual_review_required",
  "policy_mismatch",
  "fixture_dev_source",
  "unsupported_but_inspectable_source",
] as const;

export type FinalizationValidationReviewGate =
  (typeof FINALIZATION_VALIDATION_REVIEW_GATES)[number];

export const FINALIZATION_VALIDATION_BLOCKED_REASONS = [
  "candidate_missing",
  "candidate_blocked",
  "missing_final_note_source",
  "missing_provenance",
  "unacceptable_match",
  "duplicate_conflict",
  "unsupported_broker",
  "unsupported_source",
  "safety_policy_missing",
  "authority_flag_unexpectedly_true",
  "automatic_mode_not_allowed",
  "execution_record_coupling_detected",
  "persistence_coupling_detected",
  "trade_mutation_coupling_detected",
  "stats_update_coupling_detected",
] as const;

export type FinalizationValidationBlockedReason =
  (typeof FINALIZATION_VALIDATION_BLOCKED_REASONS)[number];

export const FINALIZATION_VALIDATION_WARNINGS = [
  "ready_for_review_not_finalization",
  "manual_review_required",
  "fee_fx_review_required",
  "pnl_adjustment_review_required",
  "settlement_date_review_required",
  "fixture_source_review_required",
  "candidate_not_write_authority",
] as const;

export type FinalizationValidationWarning =
  (typeof FINALIZATION_VALIDATION_WARNINGS)[number];

export type FinalizationValidationSafetyPolicy = {
  safeToFinalize: false;
  safeToPersist: false;
  safeToCreateExecutionRecord: false;
  safeToUpdateStats: false;
  safeToMutateTrade: false;
  automaticModeAllowed: false;
  manualReviewRequired: true;
  validatorImplementationEnabled: false;
  finalizationImplementationEnabled: false;
  persistenceImplementationEnabled: false;
  executionRecordCreationEnabled: false;
  statsUpdateEnabled: false;
  tradeMutationEnabled: false;
  auditAppendEnabled: false;
  browserAutomationEnabled: false;
  avanzaAutomationEnabled: false;
  brokerAutomationEnabled: false;
  policyReason: string;
};

export const FINALIZATION_VALIDATION_DEFAULT_SAFETY_POLICY = {
  safeToFinalize: false,
  safeToPersist: false,
  safeToCreateExecutionRecord: false,
  safeToUpdateStats: false,
  safeToMutateTrade: false,
  automaticModeAllowed: false,
  manualReviewRequired: true,
  validatorImplementationEnabled: false,
  finalizationImplementationEnabled: false,
  persistenceImplementationEnabled: false,
  executionRecordCreationEnabled: false,
  statsUpdateEnabled: false,
  tradeMutationEnabled: false,
  auditAppendEnabled: false,
  browserAutomationEnabled: false,
  avanzaAutomationEnabled: false,
  brokerAutomationEnabled: false,
  policyReason:
    "Finalization validator contract types are type-only and do not implement or approve finalization, persistence, execution-record creation, stats/PnL updates, trade mutation, audit append, browser automation, Avanza behavior, broker behavior, or production runtime behavior.",
} as const satisfies FinalizationValidationSafetyPolicy;

export type FinalizationValidationPolicySnapshot = {
  contractVersion: FinalizationValidatorContractVersion;
  evaluatedAt?: string | null;
  requiresCandidate: true;
  requiresAcceptableCandidateStatus: true;
  requiresSourceEvidenceSummary: true;
  requiresMatchSummary: true;
  requiresSettlementSummary: true;
  requiresNoteReference: true;
  requiresProvenance: true;
  requiresNoDuplicateConflict: true;
  requiresNoBlockingMismatch: true;
  requiresSupportedBrokerSource: true;
  requiresHandoffFingerprint: true;
  requiresConservativeSafetyPolicy: true;
  allowsFinalization: false;
  allowsPersistence: false;
  allowsExecutionRecordCreation: false;
  allowsStatsUpdate: false;
  allowsTradeMutation: false;
  allowsAutomaticMode: false;
  safetyPolicy: FinalizationValidationSafetyPolicy;
};

export const FINALIZATION_VALIDATION_DEFAULT_POLICY_SNAPSHOT = {
  contractVersion: FINALIZATION_VALIDATOR_CONTRACT_VERSION,
  evaluatedAt: null,
  requiresCandidate: true,
  requiresAcceptableCandidateStatus: true,
  requiresSourceEvidenceSummary: true,
  requiresMatchSummary: true,
  requiresSettlementSummary: true,
  requiresNoteReference: true,
  requiresProvenance: true,
  requiresNoDuplicateConflict: true,
  requiresNoBlockingMismatch: true,
  requiresSupportedBrokerSource: true,
  requiresHandoffFingerprint: true,
  requiresConservativeSafetyPolicy: true,
  allowsFinalization: false,
  allowsPersistence: false,
  allowsExecutionRecordCreation: false,
  allowsStatsUpdate: false,
  allowsTradeMutation: false,
  allowsAutomaticMode: false,
  safetyPolicy: FINALIZATION_VALIDATION_DEFAULT_SAFETY_POLICY,
} as const satisfies FinalizationValidationPolicySnapshot;

export type FinalizationValidationGateResult = {
  gate: FinalizationValidationHardGate | FinalizationValidationReviewGate;
  gateType: "hard" | "review";
  status: "passed" | "review_required" | "blocked" | "unsupported" | "not_ready";
  satisfied: boolean;
  blockedReason?: FinalizationValidationBlockedReason | null;
  warning?: FinalizationValidationWarning | null;
  relatedCandidateStatus?: FinalizationCandidateStatus | null;
  details?: string | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationManualReviewContext = {
  requestedBy?: string | null;
  requestedAt?: string | null;
  reviewerId?: string | null;
  reviewReason?: string | null;
  reviewNotes?: string | null;
  acknowledgedWarnings?: FinalizationValidationWarning[];
  acknowledgedBlockedReasons?: FinalizationValidationBlockedReason[];
  approvedForFutureFinalizationReview?: boolean;
  metadata?: Record<string, unknown>;
};

export type FinalizationReadinessSummary = {
  candidatePresent: boolean;
  candidateStatus?: FinalizationCandidateStatus | null;
  validationStatus: FinalizationValidationStatus;
  hardGatePassedCount: number;
  hardGateBlockedCount: number;
  reviewGateCount: number;
  warningCount: number;
  blockedReasonCount: number;
  manualReviewRequired: boolean;
  readyForFinalizationReview: boolean;
  readyForFinalizationReviewIsNotFinalization: true;
  finalizationAttempted: false;
  persistenceAttempted: false;
  executionRecordCreationAttempted: false;
  statsUpdateAttempted: false;
  tradeMutationAttempted: false;
};

export type FinalizationValidatorInput = {
  contractVersion: FinalizationValidatorContractVersion;
  requestedAt: string;
  candidate?: FinalizationCandidate | null;
  builderResult?: FinalizationCandidateBuilderResult | null;
  finalSettlementNoteMatchingResult?: FinalSettlementNoteMatchingResult | null;
  provisionalTradeContext?: FinalizationCandidateBuilderTradeContext | null;
  executionRecordCandidateMetadata?: ExecutionRecordCandidate | null;
  policySnapshot?: FinalizationValidationPolicySnapshot | null;
  manualReviewContext?: FinalizationManualReviewContext | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationValidationResult = {
  contractVersion: FinalizationValidatorContractVersion;
  evaluatedAt: string;
  status: FinalizationValidationStatus;
  candidate?: FinalizationCandidate | null;
  builderResult?: FinalizationCandidateBuilderResult | null;
  validationGates: FinalizationValidationGateResult[];
  hardGateResults: FinalizationValidationGateResult[];
  reviewGateResults: FinalizationValidationGateResult[];
  rejectionReasons: FinalizationValidationBlockedReason[];
  reviewFlags: FinalizationValidationReviewGate[];
  warnings: FinalizationValidationWarning[];
  policySnapshot: FinalizationValidationPolicySnapshot;
  safetyPolicy: FinalizationValidationSafetyPolicy;
  readinessSummary: FinalizationReadinessSummary;
  manualReviewContext?: FinalizationManualReviewContext | null;
  safeToFinalize: false;
  safeToPersist: false;
  safeToCreateExecutionRecord: false;
  safeToUpdateStats: false;
  safeToMutateTrade: false;
  validatorImplementationEnabled: false;
  finalizationAttempted: false;
  persistenceAttempted: false;
  executionRecordCreationAttempted: false;
  statsUpdateAttempted: false;
  tradeMutationAttempted: false;
  auditAppendAttempted: false;
  browserAutomationAttempted: false;
  avanzaAutomationAttempted: false;
  brokerAutomationAttempted: false;
  metadata?: Record<string, unknown>;
};

export const FINALIZATION_VALIDATION_STATUS_METADATA = {
  ready_for_finalization_review: {
    requiresManualReview: true,
    blocksFinalization: true,
    reason:
      "Candidate may be ready for a separate future finalization review, but validator contracts do not finalize.",
  },
  blocked: {
    requiresManualReview: true,
    blocksFinalization: true,
    reason: "Blocking evidence, policy, duplication, or safety data is present.",
  },
  needs_review: {
    requiresManualReview: true,
    blocksFinalization: true,
    reason: "Manual review is required before any future finalization action.",
  },
  partial_fill_review: {
    requiresManualReview: true,
    blocksFinalization: true,
    reason: "Partial-fill conditions require review.",
  },
  duplicate_review: {
    requiresManualReview: true,
    blocksFinalization: true,
    reason: "Duplicate-risk conditions require review.",
  },
  unsupported: {
    requiresManualReview: true,
    blocksFinalization: true,
    reason: "The broker, source, settlement model, or evidence shape is unsupported.",
  },
  not_ready: {
    requiresManualReview: true,
    blocksFinalization: true,
    reason: "Required candidate, evidence, policy, or provenance data is incomplete.",
  },
} as const satisfies Record<
  FinalizationValidationStatus,
  {
    requiresManualReview: true;
    blocksFinalization: true;
    reason: string;
  }
>;
