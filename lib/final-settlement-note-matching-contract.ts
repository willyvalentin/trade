import type { BrokerExecutionResultCandidate } from "@/lib/broker-execution-result-candidate-contract";
import type { BrokerResultSourceClassification } from "@/lib/broker-result-source-classification";
import type { ExecutionRecordCandidate } from "@/lib/execution-record-creation-contract";
import type {
  BrokerEvidenceMaskedAccountContext,
  BrokerEvidenceMonetaryAmount,
  BrokerEvidenceReviewFlag,
  BrokerEvidenceSourceReference,
  BrokerEvidenceWarning,
  FinalBrokerSettlementNoteEvidence,
  ImmediateBrokerReadbackEvidence,
} from "@/lib/two-stage-broker-evidence-contract";

export const FINAL_SETTLEMENT_NOTE_MATCHING_CONTRACT_VERSION =
  "final_settlement_note_matching_v1" as const;

export type FinalSettlementNoteMatchingContractVersion =
  typeof FINAL_SETTLEMENT_NOTE_MATCHING_CONTRACT_VERSION;

export const FINAL_SETTLEMENT_NOTE_MATCHING_CONFIDENCES = [
  "exact_match",
  "strong_match",
  "partial_match",
  "ambiguous_match",
  "mismatch",
  "duplicate_candidates",
  "insufficient_data",
  "needs_review",
] as const;

export type FinalSettlementNoteMatchingConfidence =
  (typeof FINAL_SETTLEMENT_NOTE_MATCHING_CONFIDENCES)[number];

export const FINAL_SETTLEMENT_NOTE_MATCHING_STATUSES = [
  "not_attempted",
  "matched",
  "needs_review",
  "mismatch",
  "duplicate_candidates",
  "insufficient_data",
] as const;

export type FinalSettlementNoteMatchingStatus =
  (typeof FINAL_SETTLEMENT_NOTE_MATCHING_STATUSES)[number];

export const FINAL_SETTLEMENT_NOTE_MATCHING_HARD_GATES = [
  "same_broker",
  "same_side",
  "compatible_instrument_identity",
  "compatible_quantity_or_explicit_partial_fill_model",
  "compatible_trade_or_business_date",
  "non_contradictory_account_or_category",
  "final_note_source_identity_present",
  "provenance_present",
] as const;

export type FinalSettlementNoteMatchingHardGate =
  (typeof FINAL_SETTLEMENT_NOTE_MATCHING_HARD_GATES)[number];

export const FINAL_SETTLEMENT_NOTE_MATCHING_SOFT_SIGNALS = [
  "price_tolerance",
  "time_proximity",
  "currency_match",
  "order_type_match",
  "market_or_venue_match",
  "amount_or_commission_consistency",
  "fx_consistency",
  "handoff_fingerprint_linkage",
  "note_reference_uniqueness",
] as const;

export type FinalSettlementNoteMatchingSoftSignal =
  (typeof FINAL_SETTLEMENT_NOTE_MATCHING_SOFT_SIGNALS)[number];

export const FINAL_SETTLEMENT_NOTE_MATCHING_MISMATCH_REASONS = [
  "instrument_mismatch",
  "side_mismatch",
  "quantity_mismatch",
  "date_mismatch",
  "price_mismatch",
  "account_mismatch",
  "currency_mismatch",
  "order_type_mismatch",
  "market_or_venue_mismatch",
  "fx_or_commission_mismatch",
  "missing_note_reference",
  "missing_provenance",
  "partial_fill_ambiguous",
  "insufficient_data",
] as const;

export type FinalSettlementNoteMatchingMismatchReason =
  (typeof FINAL_SETTLEMENT_NOTE_MATCHING_MISMATCH_REASONS)[number];

export const FINAL_SETTLEMENT_NOTE_MATCHING_DUPLICATE_REASONS = [
  "duplicate_note_candidates",
  "same_note_matches_multiple_provisional_trades",
  "duplicate_note_reference_number",
  "duplicate_handoff_payload_fingerprint",
  "duplicate_provenance_reference",
] as const;

export type FinalSettlementNoteMatchingDuplicateReason =
  (typeof FINAL_SETTLEMENT_NOTE_MATCHING_DUPLICATE_REASONS)[number];

export const FINAL_SETTLEMENT_NOTE_PARTIAL_FILL_MATCHING_STATUSES = [
  "not_partial",
  "single_note_full_fill",
  "single_note_partial_fill_requires_review",
  "multiple_notes_aggregate_requires_review",
  "multiple_fills_individual_review",
  "partial_fill_ambiguous",
] as const;

export type FinalSettlementNotePartialFillMatchingStatus =
  (typeof FINAL_SETTLEMENT_NOTE_PARTIAL_FILL_MATCHING_STATUSES)[number];

export const FINAL_SETTLEMENT_NOTE_MATCHING_LIFECYCLE_TRANSITIONS = [
  "final_note_pending_to_final_note_available",
  "final_note_available_to_final_note_matched",
  "final_note_available_to_needs_review",
  "final_note_available_to_final_note_mismatch",
  "final_note_pending_to_final_note_missing",
  "final_note_matched_to_finalization_candidate_only",
] as const;

export type FinalSettlementNoteMatchingLifecycleTransition =
  (typeof FINAL_SETTLEMENT_NOTE_MATCHING_LIFECYCLE_TRANSITIONS)[number];

export const FINAL_SETTLEMENT_NOTE_MATCHING_REVIEW_FLAGS = [
  "hard_gate_missing_data",
  "hard_gate_contradiction",
  "soft_signal_weak",
  "price_tolerance_review",
  "time_proximity_review",
  "partial_fill_review",
  "duplicate_candidate_review",
  "missing_note_reference_review",
  "account_context_review",
  "provenance_review",
] as const;

export type FinalSettlementNoteMatchingReviewFlag =
  (typeof FINAL_SETTLEMENT_NOTE_MATCHING_REVIEW_FLAGS)[number];

export const FINAL_SETTLEMENT_NOTE_MATCHING_WARNINGS = [
  "matching_contract_only",
  "matching_not_implemented",
  "finalization_not_implemented",
  "final_note_match_not_persistence_approval",
  "final_note_match_not_trade_mutation_approval",
  "final_note_match_not_execution_record",
  "safe_to_finalize_false",
  "safe_to_persist_false",
  "safe_to_mutate_trade_false",
] as const;

export type FinalSettlementNoteMatchingWarning =
  (typeof FINAL_SETTLEMENT_NOTE_MATCHING_WARNINGS)[number];

export type FinalSettlementNoteMatchingSafetyPolicy = {
  safeToFinalize: false;
  safeToPersist: false;
  safeToMutateTrade: false;
  matchingImplementationEnabled: boolean;
  finalizationImplementationEnabled: false;
  captureImplementationEnabled: false;
  executionRecordCreationEnabled: false;
  auditAppendEnabled: false;
  browserAutomationEnabled: false;
  policyReason: string;
};

export const FINAL_SETTLEMENT_NOTE_MATCHING_DEFAULT_SAFETY_POLICY = {
  safeToFinalize: false,
  safeToPersist: false,
  safeToMutateTrade: false,
  matchingImplementationEnabled: false,
  finalizationImplementationEnabled: false,
  captureImplementationEnabled: false,
  executionRecordCreationEnabled: false,
  auditAppendEnabled: false,
  browserAutomationEnabled: false,
  policyReason:
    "Final settlement note matching contracts are type-only and do not enable matching, finalization, capture, persistence, trade mutation, audit append, execution-record creation, browser automation, or Avanza behavior.",
} as const satisfies FinalSettlementNoteMatchingSafetyPolicy;

export type FinalSettlementNoteMatchingPolicySnapshot = {
  contractVersion: FinalSettlementNoteMatchingContractVersion;
  evaluatedAt?: string | null;
  requiresSameBroker: true;
  requiresSameSide: true;
  requiresCompatibleInstrumentIdentity: true;
  requiresCompatibleQuantityOrPartialFillModel: true;
  requiresCompatibleTradeOrBusinessDate: true;
  requiresNonContradictoryAccountContext: true;
  requiresFinalNoteSourceIdentity: true;
  requiresProvenance: true;
  allowsPartialMatchReview: true;
  allowsDuplicateAutoResolution: false;
  allowsFinalization: false;
  allowsPersistence: false;
  allowsTradeMutation: false;
  safetyPolicy: FinalSettlementNoteMatchingSafetyPolicy;
};

export const FINAL_SETTLEMENT_NOTE_MATCHING_DEFAULT_POLICY_SNAPSHOT = {
  contractVersion: FINAL_SETTLEMENT_NOTE_MATCHING_CONTRACT_VERSION,
  evaluatedAt: null,
  requiresSameBroker: true,
  requiresSameSide: true,
  requiresCompatibleInstrumentIdentity: true,
  requiresCompatibleQuantityOrPartialFillModel: true,
  requiresCompatibleTradeOrBusinessDate: true,
  requiresNonContradictoryAccountContext: true,
  requiresFinalNoteSourceIdentity: true,
  requiresProvenance: true,
  allowsPartialMatchReview: true,
  allowsDuplicateAutoResolution: false,
  allowsFinalization: false,
  allowsPersistence: false,
  allowsTradeMutation: false,
  safetyPolicy: FINAL_SETTLEMENT_NOTE_MATCHING_DEFAULT_SAFETY_POLICY,
} as const satisfies FinalSettlementNoteMatchingPolicySnapshot;

export type FinalSettlementNoteProvisionalTradeContext = {
  provisionalTradeId?: string | null;
  recommendationId?: string | null;
  positionId?: string | null;
  broker: "avanza";
  accountContext?: BrokerEvidenceMaskedAccountContext | null;
  instrumentName?: string | null;
  ticker?: string | null;
  isin?: string | null;
  instrumentId?: string | null;
  side?: "buy" | "sell" | null;
  quantity?: number | null;
  tradeDate?: string | null;
  approximateExecutionTime?: string | null;
  expectedPrice?: BrokerEvidenceMonetaryAmount | null;
  handoffPayloadFingerprint?: string | null;
  provenance?: BrokerEvidenceSourceReference | null;
  metadata?: Record<string, unknown>;
};

export type FinalSettlementNoteMatchingSourceMetadata = {
  broker: "avanza";
  sourceClassification: BrokerResultSourceClassification;
  sourcePageIdentity?: string | null;
  sourceReferenceLabel?: string | null;
  sourceEvidenceFingerprint?: string | null;
  finalNoteReferenceNumber?: string | null;
  capturedAt?: string | null;
  provenance?: BrokerEvidenceSourceReference | null;
};

export type FinalSettlementNoteMatchingExecutionCandidateMetadata = {
  brokerExecutionResultCandidate?: BrokerExecutionResultCandidate | null;
  executionRecordCandidate?: ExecutionRecordCandidate | null;
  executionCandidateFingerprint?: string | null;
  brokerResultFingerprint?: string | null;
  recordFingerprint?: string | null;
  metadata?: Record<string, unknown>;
};

export type FinalSettlementNoteMatchingFieldComparison = {
  field:
    | FinalSettlementNoteMatchingHardGate
    | FinalSettlementNoteMatchingSoftSignal;
  expectedValuePreview?: string | number | boolean | null;
  actualValuePreview?: string | number | boolean | null;
  compatible: boolean | null;
  confidence?: FinalSettlementNoteMatchingConfidence | null;
  notes?: string | null;
};

export type FinalSettlementNoteMatchingHardGateResult = {
  gate: FinalSettlementNoteMatchingHardGate;
  passed: boolean;
  required: true;
  blocked: boolean;
  mismatchReason?: FinalSettlementNoteMatchingMismatchReason | null;
  comparison?: FinalSettlementNoteMatchingFieldComparison | null;
};

export type FinalSettlementNoteMatchingSoftSignalResult = {
  signal: FinalSettlementNoteMatchingSoftSignal;
  present: boolean;
  supportive: boolean | null;
  requiresReview: boolean;
  comparison?: FinalSettlementNoteMatchingFieldComparison | null;
};

export type FinalSettlementNoteMatchingInput = {
  contractVersion: FinalSettlementNoteMatchingContractVersion;
  requestedAt: string;
  broker: "avanza";
  provisionalImmediateReadbackEvidence?: ImmediateBrokerReadbackEvidence | null;
  provisionalTradeContext?: FinalSettlementNoteProvisionalTradeContext | null;
  handoffPayloadFingerprint?: string | null;
  finalSettlementNoteEvidence: FinalBrokerSettlementNoteEvidence;
  accountContext?: BrokerEvidenceMaskedAccountContext | null;
  sourceMetadata: FinalSettlementNoteMatchingSourceMetadata;
  executionCandidateMetadata?: FinalSettlementNoteMatchingExecutionCandidateMetadata | null;
  policySnapshot?: FinalSettlementNoteMatchingPolicySnapshot | null;
  metadata?: Record<string, unknown>;
};

export type FinalSettlementNoteMatchingResult = {
  contractVersion: FinalSettlementNoteMatchingContractVersion;
  evaluatedAt: string;
  status: FinalSettlementNoteMatchingStatus;
  confidence: FinalSettlementNoteMatchingConfidence;
  matched: boolean;
  hardGateResults: FinalSettlementNoteMatchingHardGateResult[];
  softSignalResults: FinalSettlementNoteMatchingSoftSignalResult[];
  mismatchReasons: FinalSettlementNoteMatchingMismatchReason[];
  duplicateReasons: FinalSettlementNoteMatchingDuplicateReason[];
  partialFillMatchingStatus: FinalSettlementNotePartialFillMatchingStatus;
  lifecycleTransitionSuggestion: FinalSettlementNoteMatchingLifecycleTransition;
  reviewFlags: Array<
    FinalSettlementNoteMatchingReviewFlag | BrokerEvidenceReviewFlag
  >;
  warnings: Array<FinalSettlementNoteMatchingWarning | BrokerEvidenceWarning>;
  policySnapshot: FinalSettlementNoteMatchingPolicySnapshot;
  safetyPolicy: FinalSettlementNoteMatchingSafetyPolicy;
  safeToFinalize: false;
  safeToPersist: false;
  safeToMutateTrade: false;
  finalizationAttempted: false;
  persistenceAttempted: false;
  tradeMutationAttempted: false;
  executionRecordCreated: false;
  auditAppendAttempted: false;
  browserAutomationAttempted: false;
  metadata?: Record<string, unknown>;
};

export const FINAL_SETTLEMENT_NOTE_MATCHING_CONFIDENCE_METADATA = {
  exact_match: {
    matched: true,
    requiresReview: false,
    blocksFinalizationCandidate: false,
  },
  strong_match: {
    matched: true,
    requiresReview: false,
    blocksFinalizationCandidate: false,
  },
  partial_match: {
    matched: false,
    requiresReview: true,
    blocksFinalizationCandidate: true,
  },
  ambiguous_match: {
    matched: false,
    requiresReview: true,
    blocksFinalizationCandidate: true,
  },
  mismatch: {
    matched: false,
    requiresReview: true,
    blocksFinalizationCandidate: true,
  },
  duplicate_candidates: {
    matched: false,
    requiresReview: true,
    blocksFinalizationCandidate: true,
  },
  insufficient_data: {
    matched: false,
    requiresReview: true,
    blocksFinalizationCandidate: true,
  },
  needs_review: {
    matched: false,
    requiresReview: true,
    blocksFinalizationCandidate: true,
  },
} as const satisfies Record<
  FinalSettlementNoteMatchingConfidence,
  {
    matched: boolean;
    requiresReview: boolean;
    blocksFinalizationCandidate: boolean;
  }
>;

// Contract types only. This module does not implement matching, finalization,
// capture, persistence, Supabase/localStorage writes, audit append,
// execution-record creation, trade mutation, UI wiring, browser automation, or
// Avanza behavior.
