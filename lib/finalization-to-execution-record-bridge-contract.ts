import type { BrokerExecutionResultCandidate } from "@/lib/broker-execution-result-candidate-contract";
import type {
  ExecutionRecordCandidate,
  ExecutionRecordCreationInput,
} from "@/lib/execution-record-creation-contract";
import type {
  FinalSettlementNoteMatchingResult,
  FinalSettlementNoteMatchingStatus,
} from "@/lib/final-settlement-note-matching-contract";
import type {
  FinalizationActionDryRunResult,
  FinalizationActionDryRunStatus,
} from "@/lib/finalization-action-dry-run-contract";
import type {
  FinalizationActionValidationResult,
  FinalizationActionValidatorAuditCorrectionMetadata,
  FinalizationActionValidatorManualApprovalContext,
} from "@/lib/finalization-action-validator-contract";
import type { FinalizationCandidate } from "@/lib/finalization-candidate-contract";
import type { FinalizationStateTransitionValidationResult } from "@/lib/finalization-state-transition-validator-contract";
import type { FinalizationValidationResult } from "@/lib/finalization-validator-contract";
import type {
  FinalBrokerSettlementNoteEvidence,
  ImmediateBrokerReadbackEvidence,
} from "@/lib/two-stage-broker-evidence-contract";

// Contract metadata only. These types describe a future mapping bridge from
// finalization outputs to execution-record candidate inputs. They do not
// implement bridge mapping, validation, finalization actions, execution-record
// creation, persistence, Supabase/localStorage writes, stats/PnL updates, audit
// append, rollback/correction, trade mutation, UI wiring, capture,
// browser/Avanza automation, broker behavior, order execution, or production
// runtime behavior.

export const FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_CONTRACT_VERSION =
  "finalization_to_execution_record_bridge_v1" as const;

export type FinalizationToExecutionRecordBridgeContractVersion =
  typeof FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_CONTRACT_VERSION;

export const FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_STATUSES = [
  "bridge_candidate_ready",
  "bridge_candidate_needs_review",
  "bridge_candidate_blocked",
  "bridge_candidate_unsupported",
  "bridge_candidate_not_ready",
] as const;

export type FinalizationToExecutionRecordBridgeStatus =
  (typeof FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_STATUSES)[number];

export const FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_BLOCKED_REASONS = [
  "missing_finalization_candidate",
  "missing_finalization_validation",
  "missing_transition_validation",
  "missing_action_validation",
  "missing_action_dry_run",
  "missing_final_settlement_note_match",
  "ambiguous_final_settlement_note_match",
  "mismatched_amount",
  "mismatched_quantity",
  "mismatched_currency",
  "mismatched_fees",
  "mismatched_fx_rate",
  "missing_idempotency_fingerprint",
  "missing_audit_correction_metadata",
  "unsupported_source",
  "unsupported_broker",
  "manual_approval_missing",
  "execution_record_candidate_not_enabled",
  "persistence_boundary_not_enabled",
] as const;

export type FinalizationToExecutionRecordBridgeBlockedReason =
  (typeof FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_BLOCKED_REASONS)[number];

export const FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_WARNINGS = [
  "candidate_only",
  "mapping_only",
  "proposed_impact_not_write",
  "dry_run_ready_not_write_approval",
  "audit_required_before_write",
  "idempotency_review_required",
  "duplicate_check_required",
  "stats_update_out_of_scope",
  "trade_mutation_out_of_scope",
] as const;

export type FinalizationToExecutionRecordBridgeWarning =
  (typeof FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_WARNINGS)[number];

export const FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_REVIEW_ITEMS = [
  "finalization_candidate_review",
  "final_settlement_note_match_review",
  "finalization_validation_review",
  "transition_validation_review",
  "action_validation_review",
  "dry_run_review",
  "amount_review",
  "quantity_review",
  "currency_review",
  "fees_review",
  "fx_rate_review",
  "idempotency_review",
  "duplicate_review",
  "manual_approval_review",
  "audit_correction_review",
] as const;

export type FinalizationToExecutionRecordBridgeReviewItem =
  (typeof FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_REVIEW_ITEMS)[number];

export const FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_FIELD_NAMES = [
  "ticker",
  "side",
  "quantity",
  "price",
  "currency",
  "fees",
  "commission",
  "fx_rate",
  "gross_amount",
  "net_amount",
  "broker_order_id",
  "broker_confirmation_id",
  "broker_reference",
  "execution_timestamp",
  "settlement_date",
  "payment_date",
  "final_note_reference",
  "source_evidence_type",
  "broker_confirmation_status",
  "finalization_status",
  "validation_status",
  "warnings",
  "blocked_reasons",
  "audit_correction_readiness",
] as const;

export type FinalizationToExecutionRecordFieldName =
  (typeof FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_FIELD_NAMES)[number];

export const FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_INPUT_SOURCES = [
  "immediate_broker_readback",
  "broker_execution_result_candidate",
  "final_settlement_note_match",
  "finalization_candidate",
  "finalization_validation_result",
  "transition_validation_result",
  "action_validation_result",
  "action_dry_run_result",
  "broker_payload_handoff_metadata",
  "manual_approval_context",
  "audit_correction_metadata",
] as const;

export type FinalizationToExecutionRecordBridgeInputSource =
  (typeof FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_INPUT_SOURCES)[number];

export type FinalizationToExecutionRecordBridgeSafetyPolicy = {
  mappingOnly: true;
  candidateOnly: true;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  safeToFinalize: false;
  safeToUpdateStats: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  safeToRunBrokerAction: false;
  automaticModeAllowed: false;
  bridgeImplementationEnabled: false;
  mapperImplementationEnabled: false;
  validatorImplementationEnabled: false;
  executionRecordCreationEnabled: false;
  persistenceImplementationEnabled: false;
  finalizationActionImplementationEnabled: false;
  statsUpdateEnabled: false;
  auditAppendEnabled: false;
  rollbackImplementationEnabled: false;
  tradeMutationEnabled: false;
  browserAutomationEnabled: false;
  avanzaAutomationEnabled: false;
  brokerAutomationEnabled: false;
  policyReason: string;
};

export const FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_DEFAULT_SAFETY_POLICY = {
  mappingOnly: true,
  candidateOnly: true,
  safeToCreateExecutionRecord: false,
  safeToPersist: false,
  safeToFinalize: false,
  safeToUpdateStats: false,
  safeToAppendAudit: false,
  safeToRollback: false,
  safeToMutateTrade: false,
  safeToRunBrokerAction: false,
  automaticModeAllowed: false,
  bridgeImplementationEnabled: false,
  mapperImplementationEnabled: false,
  validatorImplementationEnabled: false,
  executionRecordCreationEnabled: false,
  persistenceImplementationEnabled: false,
  finalizationActionImplementationEnabled: false,
  statsUpdateEnabled: false,
  auditAppendEnabled: false,
  rollbackImplementationEnabled: false,
  tradeMutationEnabled: false,
  browserAutomationEnabled: false,
  avanzaAutomationEnabled: false,
  brokerAutomationEnabled: false,
  policyReason:
    "Finalization-to-execution-record bridge contract types are mapping-only and candidate-only. They do not implement bridge mapping, create execution records, persist, finalize, update stats/PnL, append audit records, roll back, mutate trades, run broker actions, automate browser/Avanza behavior, or enable automatic mode.",
} as const satisfies FinalizationToExecutionRecordBridgeSafetyPolicy;

export type FinalizationToExecutionRecordBridgeHandoffMetadata = {
  handoffSessionId?: string | null;
  payloadId?: string | null;
  handoffPayloadFingerprint?: string | null;
  recommendationId?: string | null;
  positionId?: string | null;
  executionMode?: "semi_automatic" | "automatic" | null;
  sourceEnvironment?: "local_dev" | "staging" | "production" | null;
  sourceEventIds?: string[];
  metadata?: Record<string, unknown>;
};

export type FinalizationToExecutionRecordSourceEvidenceSummary = {
  immediateBrokerReadback?: ImmediateBrokerReadbackEvidence | null;
  brokerExecutionResultCandidate?: BrokerExecutionResultCandidate | null;
  finalSettlementNoteEvidence?: FinalBrokerSettlementNoteEvidence | null;
  finalSettlementNoteMatch?: FinalSettlementNoteMatchingResult | null;
  finalSettlementNoteMatchStatus?: FinalSettlementNoteMatchingStatus | null;
  sourceEvidenceFingerprint?: string | null;
  brokerResultCandidateFingerprint?: string | null;
  finalSettlementNoteFingerprint?: string | null;
  finalSettlementNoteMatchIdentity?: string | null;
  handoffPayloadFingerprint?: string | null;
  evidenceChainComplete: boolean;
  finalSettlementNoteMatched: boolean;
  provisionalEvidenceOnly: boolean;
  warnings: FinalizationToExecutionRecordBridgeWarning[];
  blockedReasons: FinalizationToExecutionRecordBridgeBlockedReason[];
  metadata?: Record<string, unknown>;
};

export type FinalizationToExecutionRecordTargetSummary = {
  intendedExecutionRecordCandidateInputAvailable: boolean;
  intendedCreationInput?: Partial<ExecutionRecordCreationInput> | null;
  existingExecutionRecordCandidateMetadata?: ExecutionRecordCandidate | null;
  intendedExecutionRecordCandidateFingerprintInputs: string[];
  sourceEvidenceBlockReady: boolean;
  brokerConfirmationBlockReady: boolean;
  settlementNoteBlockReady: boolean;
  finalizationBlockReady: boolean;
  validationBlockReady: boolean;
  dryRunBlockReady: boolean;
  auditCorrectionBlockReady: boolean;
  candidateOnly: true;
  mappingOnly: true;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  metadata?: Record<string, unknown>;
};

export type FinalizationToExecutionRecordFieldMappingSummary = {
  field: FinalizationToExecutionRecordFieldName;
  source:
    | FinalizationToExecutionRecordBridgeInputSource
    | "derived_fingerprint"
    | "not_available";
  targetPath?: keyof ExecutionRecordCreationInput | string | null;
  available: boolean;
  requiredForCandidateInput: boolean;
  requiresReview: boolean;
  blockedReason?: FinalizationToExecutionRecordBridgeBlockedReason | null;
  warning?: FinalizationToExecutionRecordBridgeWarning | null;
  sourceValuePreview?: string | number | boolean | null;
  targetValuePreview?: string | number | boolean | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationToExecutionRecordIdempotencySummary = {
  sourceEvidenceFingerprint?: string | null;
  immediateReadbackIdentity?: string | null;
  brokerExecutionResultCandidateFingerprint?: string | null;
  handoffPayloadFingerprint?: string | null;
  finalSettlementNoteFingerprint?: string | null;
  finalSettlementNoteMatchIdentity?: string | null;
  finalizationCandidateFingerprint?: string | null;
  finalizationValidationIdentity?: string | null;
  transitionValidationIdentity?: string | null;
  actionValidationIdentity?: string | null;
  actionDryRunIdentity?: string | null;
  intendedExecutionRecordCandidateFingerprint?: string | null;
  intendedExecutionRecordIdempotencyKey?: string | null;
  requiredFingerprintsPresent: boolean;
  duplicateCheckRequired: true;
  duplicateDetected: boolean;
  duplicateOfRecordId?: string | null;
  retrySafe: boolean;
  mismatchRequiresReview: boolean;
  missingFingerprintReasons: FinalizationToExecutionRecordBridgeBlockedReason[];
  metadata?: Record<string, unknown>;
};

export type FinalizationToExecutionRecordAuditCorrectionSummary = {
  auditRequiredBeforeWrite: true;
  auditMetadataPresent: boolean;
  correctionMetadataPresent: boolean;
  beforeStateReference?: string | null;
  afterStateReference?: string | null;
  sourceEvidenceReference?: string | null;
  manualApprovalReference?: string | null;
  duplicatePreventionReference?: string | null;
  correctionStrategyReference?: string | null;
  rollbackMetadataReference?: string | null;
  correctionEligible: boolean;
  rollbackMetadataRequired: boolean;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  warnings: FinalizationToExecutionRecordBridgeWarning[];
  blockedReasons: FinalizationToExecutionRecordBridgeBlockedReason[];
  metadata?: Record<string, unknown>;
};

export type FinalizationToExecutionRecordValidationHandoffSummary = {
  finalizationCandidatePresent: boolean;
  finalSettlementNoteMatchPresent: boolean;
  finalizationValidationPresent: boolean;
  finalizationValidationStatus?: FinalizationValidationResult["status"] | null;
  transitionValidationPresent: boolean;
  transitionValidationStatus?:
    | FinalizationStateTransitionValidationResult["status"]
    | null;
  actionValidationPresent: boolean;
  actionValidationStatus?: FinalizationActionValidationResult["status"] | null;
  actionDryRunPresent: boolean;
  actionDryRunStatus?: FinalizationActionDryRunStatus | null;
  unsupportedOrBlockedStatePresent: boolean;
  manualApprovalRequired: boolean;
  manualApprovalPresent: boolean;
  bridgeOutputCandidateOnly: true;
  executableWriteCandidateProduced: false;
  blockedReasons: FinalizationToExecutionRecordBridgeBlockedReason[];
  warnings: FinalizationToExecutionRecordBridgeWarning[];
  reviewItems: FinalizationToExecutionRecordBridgeReviewItem[];
  metadata?: Record<string, unknown>;
};

export type FinalizationToExecutionRecordBridgeInput = {
  contractVersion: FinalizationToExecutionRecordBridgeContractVersion;
  requestedAt: string;
  immediateBrokerReadback?: ImmediateBrokerReadbackEvidence | null;
  brokerExecutionResultCandidate?: BrokerExecutionResultCandidate | null;
  finalSettlementNoteMatch?: FinalSettlementNoteMatchingResult | null;
  finalizationCandidate?: FinalizationCandidate | null;
  finalizationValidationResult?: FinalizationValidationResult | null;
  transitionValidationResult?: FinalizationStateTransitionValidationResult | null;
  actionValidationResult?: FinalizationActionValidationResult | null;
  actionDryRunResult?: FinalizationActionDryRunResult | null;
  brokerPayloadHandoffMetadata?: FinalizationToExecutionRecordBridgeHandoffMetadata | null;
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  auditCorrectionMetadata?: FinalizationActionValidatorAuditCorrectionMetadata | null;
  existingExecutionRecordCandidateMetadata?: ExecutionRecordCandidate | null;
  safetyPolicy?: FinalizationToExecutionRecordBridgeSafetyPolicy | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationToExecutionRecordBridgeResult = {
  contractVersion: FinalizationToExecutionRecordBridgeContractVersion;
  evaluatedAt: string;
  status: FinalizationToExecutionRecordBridgeStatus;
  input?: FinalizationToExecutionRecordBridgeInput | null;
  sourceEvidenceSummary: FinalizationToExecutionRecordSourceEvidenceSummary;
  targetSummary: FinalizationToExecutionRecordTargetSummary;
  fieldMappingSummary: FinalizationToExecutionRecordFieldMappingSummary[];
  idempotencySummary: FinalizationToExecutionRecordIdempotencySummary;
  auditCorrectionSummary: FinalizationToExecutionRecordAuditCorrectionSummary;
  validationHandoffSummary: FinalizationToExecutionRecordValidationHandoffSummary;
  blockedReasons: FinalizationToExecutionRecordBridgeBlockedReason[];
  warnings: FinalizationToExecutionRecordBridgeWarning[];
  reviewItems: FinalizationToExecutionRecordBridgeReviewItem[];
  safetyPolicy: FinalizationToExecutionRecordBridgeSafetyPolicy;
  mappingOnly: true;
  candidateOnly: true;
  bridgeExecuted: false;
  mapperImplemented: false;
  validatorImplemented: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  safeToFinalize: false;
  safeToUpdateStats: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  safeToRunBrokerAction: false;
  automaticModeAllowed: false;
  executionRecordCreationAttempted: false;
  persistenceAttempted: false;
  finalizationActionAttempted: false;
  finalizationAttempted: false;
  statsUpdateAttempted: false;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  tradeMutationAttempted: false;
  browserAutomationAttempted: false;
  avanzaAutomationAttempted: false;
  brokerAutomationAttempted: false;
  metadata?: Record<string, unknown>;
};

export const FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_STATUS_METADATA = {
  bridge_candidate_ready: {
    requiresManualReview: true,
    blocksWrites: true,
    reason:
      "Bridge candidate metadata may be ready for future candidate-builder input, but bridge contracts do not create or persist execution records.",
  },
  bridge_candidate_needs_review: {
    requiresManualReview: true,
    blocksWrites: true,
    reason:
      "Bridge candidate metadata requires review before any future creation or persistence boundary.",
  },
  bridge_candidate_blocked: {
    requiresManualReview: true,
    blocksWrites: true,
    reason:
      "Required finalization, matching, dry-run, idempotency, manual approval, or audit/correction metadata is missing or blocking.",
  },
  bridge_candidate_unsupported: {
    requiresManualReview: true,
    blocksWrites: true,
    reason: "The bridge source, broker, or mapping scenario is unsupported.",
  },
  bridge_candidate_not_ready: {
    requiresManualReview: true,
    blocksWrites: true,
    reason:
      "Required source evidence, validation, dry-run, fingerprint, or handoff metadata is incomplete.",
  },
} as const satisfies Record<
  FinalizationToExecutionRecordBridgeStatus,
  {
    requiresManualReview: true;
    blocksWrites: true;
    reason: string;
  }
>;
