import type {
  FinalizationToExecutionRecordAuditCorrectionSummary,
  FinalizationToExecutionRecordBridgeInput,
  FinalizationToExecutionRecordBridgeResult,
  FinalizationToExecutionRecordFieldMappingSummary,
  FinalizationToExecutionRecordFieldName,
  FinalizationToExecutionRecordIdempotencySummary,
  FinalizationToExecutionRecordSourceEvidenceSummary,
  FinalizationToExecutionRecordTargetSummary,
  FinalizationToExecutionRecordValidationHandoffSummary,
} from "@/lib/finalization-to-execution-record-bridge-contract";
import type {
  FinalizationActionDryRunResult,
} from "@/lib/finalization-action-dry-run-contract";
import type {
  FinalizationActionValidationResult,
  FinalizationActionValidatorAuditCorrectionMetadata,
  FinalizationActionValidatorManualApprovalContext,
} from "@/lib/finalization-action-validator-contract";
import type { FinalizationCandidate } from "@/lib/finalization-candidate-contract";
import type { FinalizationStateTransitionValidationResult } from "@/lib/finalization-state-transition-validator-contract";
import type { FinalizationValidationResult } from "@/lib/finalization-validator-contract";
import type { FinalSettlementNoteMatchingResult } from "@/lib/final-settlement-note-matching-contract";

// Contract metadata only. These types describe a future Execution Record
// Finalization Bridge Validator boundary. They do not implement validation
// logic, create execution records, persist, write Supabase/localStorage,
// finalize, update stats/PnL, append audit records, rollback/correct, mutate
// trades, wire UI, capture broker evidence, automate browser/Avanza behavior,
// perform broker behavior, run order execution, or enable production runtime
// behavior.

export const EXECUTION_RECORD_FINALIZATION_BRIDGE_VALIDATOR_CONTRACT_VERSION =
  "execution_record_finalization_bridge_validator_v1" as const;

export type ExecutionRecordFinalizationBridgeValidatorContractVersion =
  typeof EXECUTION_RECORD_FINALIZATION_BRIDGE_VALIDATOR_CONTRACT_VERSION;

export const EXECUTION_RECORD_FINALIZATION_BRIDGE_VALIDATION_STATUSES = [
  "bridge_validation_valid",
  "bridge_validation_needs_review",
  "bridge_validation_blocked",
  "bridge_validation_unsupported",
  "bridge_validation_invalid",
] as const;

export type ExecutionRecordFinalizationBridgeValidationStatus =
  (typeof EXECUTION_RECORD_FINALIZATION_BRIDGE_VALIDATION_STATUSES)[number];

export const EXECUTION_RECORD_FINALIZATION_BRIDGE_DECISION_RECOMMENDATIONS = [
  "validate_only",
  "needs_manual_review",
  "blocked_do_not_write",
  "unsupported_do_not_write",
  "invalid_do_not_write",
] as const;

export type ExecutionRecordFinalizationBridgeDecisionRecommendation =
  (typeof EXECUTION_RECORD_FINALIZATION_BRIDGE_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_FINALIZATION_BRIDGE_BLOCKED_REASONS = [
  "missing_bridge_result",
  "invalid_bridge_status",
  "bridge_ready_with_blocked_reasons",
  "bridge_ready_with_missing_required_summary",
  "missing_source_evidence_summary",
  "missing_target_summary",
  "missing_field_mapping_summary",
  "missing_idempotency_summary",
  "missing_audit_correction_summary",
  "missing_validation_handoff_summary",
  "missing_required_fingerprint",
  "conflicting_fingerprint",
  "missing_final_settlement_note_match_identity",
  "unsupported_source",
  "unsupported_broker",
  "field_mismatch",
  "manual_approval_missing",
  "audit_correction_metadata_missing",
  "safety_policy_authority_violation",
  "write_authority_not_allowed",
] as const;

export type ExecutionRecordFinalizationBridgeBlockedReason =
  (typeof EXECUTION_RECORD_FINALIZATION_BRIDGE_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_FINALIZATION_BRIDGE_WARNINGS = [
  "validation_only",
  "bridge_candidate_ready_not_write_approval",
  "dry_run_proposed_impact_not_write",
  "candidate_only",
  "mapping_only",
  "audit_required_before_write",
  "idempotency_review_required",
  "duplicate_check_required",
  "stats_update_out_of_scope",
  "trade_mutation_out_of_scope",
] as const;

export type ExecutionRecordFinalizationBridgeWarning =
  (typeof EXECUTION_RECORD_FINALIZATION_BRIDGE_WARNINGS)[number];

export const EXECUTION_RECORD_FINALIZATION_BRIDGE_REVIEW_ITEMS = [
  "source_evidence_review",
  "target_summary_review",
  "field_mapping_review",
  "idempotency_review",
  "duplicate_review",
  "audit_correction_review",
  "validation_handoff_review",
  "final_settlement_note_match_review",
  "manual_approval_review",
  "safety_policy_review",
  "dry_run_impact_review",
] as const;

export type ExecutionRecordFinalizationBridgeReviewItem =
  (typeof EXECUTION_RECORD_FINALIZATION_BRIDGE_REVIEW_ITEMS)[number];

export const EXECUTION_RECORD_FINALIZATION_BRIDGE_FIELD_VALIDATION_STATUSES = [
  "field_valid",
  "field_missing",
  "field_needs_review",
  "field_mismatched",
  "field_unsupported",
] as const;

export type ExecutionRecordFinalizationBridgeFieldValidationStatus =
  (typeof EXECUTION_RECORD_FINALIZATION_BRIDGE_FIELD_VALIDATION_STATUSES)[number];

export const EXECUTION_RECORD_FINALIZATION_BRIDGE_FINGERPRINT_COMPONENTS = [
  "source_evidence_fingerprint",
  "final_settlement_note_match_identity",
  "handoff_payload_fingerprint",
  "finalization_candidate_fingerprint",
  "intended_execution_record_candidate_fingerprint",
  "intended_execution_record_idempotency_key",
] as const;

export type ExecutionRecordFinalizationBridgeFingerprintComponent =
  (typeof EXECUTION_RECORD_FINALIZATION_BRIDGE_FINGERPRINT_COMPONENTS)[number];

export type ExecutionRecordFinalizationBridgeAuthorityFlags = {
  validationOnly: true;
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
  finalizationAttempted: false;
  statsUpdateAttempted: false;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  tradeMutationAttempted: false;
  brokerAutomationAttempted: false;
  avanzaAutomationAttempted: false;
  browserAutomationAttempted: false;
};

export const EXECUTION_RECORD_FINALIZATION_BRIDGE_DEFAULT_AUTHORITY_FLAGS = {
  validationOnly: true,
  safeToCreateExecutionRecord: false,
  safeToPersist: false,
  safeToFinalize: false,
  safeToUpdateStats: false,
  safeToAppendAudit: false,
  safeToRollback: false,
  safeToMutateTrade: false,
  safeToRunBrokerAction: false,
  automaticModeAllowed: false,
  executionRecordCreationAttempted: false,
  persistenceAttempted: false,
  finalizationAttempted: false,
  statsUpdateAttempted: false,
  auditAppendAttempted: false,
  rollbackAttempted: false,
  tradeMutationAttempted: false,
  brokerAutomationAttempted: false,
  avanzaAutomationAttempted: false,
  browserAutomationAttempted: false,
} as const satisfies ExecutionRecordFinalizationBridgeAuthorityFlags;

export type ExecutionRecordFinalizationBridgeSafetyPolicyValidationSummary = {
  validationOnly: true;
  safetyPolicyPresent: boolean;
  candidateOnly: boolean;
  mappingOnly: boolean;
  allAuthorityFlagsFalse: boolean;
  automaticModeAllowed: false;
  authorityFlags: ExecutionRecordFinalizationBridgeAuthorityFlags;
  unexpectedTrueAuthorityFlags: string[];
  validatorImplementationEnabled: false;
  executionRecordCreationEnabled: false;
  persistenceImplementationEnabled: false;
  finalizationImplementationEnabled: false;
  statsUpdateEnabled: false;
  auditAppendEnabled: false;
  rollbackImplementationEnabled: false;
  tradeMutationEnabled: false;
  brokerAutomationEnabled: false;
  avanzaAutomationEnabled: false;
  browserAutomationEnabled: false;
  blockedReason?: ExecutionRecordFinalizationBridgeBlockedReason | null;
  warning?: ExecutionRecordFinalizationBridgeWarning | null;
  reviewItem?: ExecutionRecordFinalizationBridgeReviewItem | null;
  details?: string | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordFinalizationBridgeValidatedFieldSummary = {
  field: FinalizationToExecutionRecordFieldName | string;
  status: ExecutionRecordFinalizationBridgeFieldValidationStatus;
  sourceMapping?: FinalizationToExecutionRecordFieldMappingSummary | null;
  requiredForReadyBridge: boolean;
  available: boolean;
  consistent: boolean;
  sourceValuePreview?: string | number | boolean | null;
  targetValuePreview?: string | number | boolean | null;
  blockedReason?: ExecutionRecordFinalizationBridgeBlockedReason | null;
  warning?: ExecutionRecordFinalizationBridgeWarning | null;
  reviewItem?: ExecutionRecordFinalizationBridgeReviewItem | null;
  details?: string | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordFinalizationBridgeIdempotencyValidationSummary = {
  sourceSummary?: FinalizationToExecutionRecordIdempotencySummary | null;
  requiredFingerprintComponents: ExecutionRecordFinalizationBridgeFingerprintComponent[];
  presentFingerprintComponents: ExecutionRecordFinalizationBridgeFingerprintComponent[];
  missingFingerprintComponents: ExecutionRecordFinalizationBridgeFingerprintComponent[];
  conflictingFingerprintComponents: ExecutionRecordFinalizationBridgeFingerprintComponent[];
  requiredFingerprintsPresent: boolean;
  finalSettlementNoteMatchIdentityPresent: boolean;
  duplicateCheckRequired: true;
  duplicateDetected: boolean;
  retrySafe: boolean;
  mismatchRequiresReview: boolean;
  safeForValidationOnly: true;
  safeForWrite: false;
  blockedReason?: ExecutionRecordFinalizationBridgeBlockedReason | null;
  warning?: ExecutionRecordFinalizationBridgeWarning | null;
  reviewItem?: ExecutionRecordFinalizationBridgeReviewItem | null;
  details?: string | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordFinalizationBridgeAuditCorrectionValidationSummary = {
  sourceSummary?: FinalizationToExecutionRecordAuditCorrectionSummary | null;
  auditMetadataPresent: boolean;
  correctionMetadataPresent: boolean;
  sourceEvidenceTraceable: boolean;
  beforeStateReferencePresent: boolean;
  afterStateReferencePresent: boolean;
  manualApprovalRequired: boolean;
  manualApprovalPresent: boolean;
  rollbackMetadataRequired: boolean;
  rollbackMetadataPresent: boolean;
  readyForFutureWriteBoundary: false;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  safeForValidationOnly: true;
  blockedReason?: ExecutionRecordFinalizationBridgeBlockedReason | null;
  warning?: ExecutionRecordFinalizationBridgeWarning | null;
  reviewItem?: ExecutionRecordFinalizationBridgeReviewItem | null;
  details?: string | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordFinalizationBridgeSummaryValidation = {
  sourceEvidenceSummary?: FinalizationToExecutionRecordSourceEvidenceSummary | null;
  targetSummary?: FinalizationToExecutionRecordTargetSummary | null;
  fieldMappingSummary?: FinalizationToExecutionRecordFieldMappingSummary[] | null;
  idempotencySummary?: FinalizationToExecutionRecordIdempotencySummary | null;
  auditCorrectionSummary?: FinalizationToExecutionRecordAuditCorrectionSummary | null;
  validationHandoffSummary?: FinalizationToExecutionRecordValidationHandoffSummary | null;
  sourceEvidenceSummaryPresent: boolean;
  targetSummaryPresent: boolean;
  fieldMappingSummaryPresent: boolean;
  idempotencySummaryPresent: boolean;
  auditCorrectionSummaryPresent: boolean;
  validationHandoffSummaryPresent: boolean;
  blockedReasons: ExecutionRecordFinalizationBridgeBlockedReason[];
  warnings: ExecutionRecordFinalizationBridgeWarning[];
  reviewItems: ExecutionRecordFinalizationBridgeReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordFinalizationBridgeValidationInput = {
  contractVersion: ExecutionRecordFinalizationBridgeValidatorContractVersion;
  requestedAt: string;
  bridgeResult?: FinalizationToExecutionRecordBridgeResult | null;
  originalBridgeInput?: FinalizationToExecutionRecordBridgeInput | null;
  finalizationCandidate?: FinalizationCandidate | null;
  finalSettlementNoteMatch?: FinalSettlementNoteMatchingResult | null;
  finalizationValidationResult?: FinalizationValidationResult | null;
  transitionValidationResult?: FinalizationStateTransitionValidationResult | null;
  actionValidationResult?: FinalizationActionValidationResult | null;
  actionDryRunResult?: FinalizationActionDryRunResult | null;
  idempotencyMetadata?: FinalizationToExecutionRecordIdempotencySummary | null;
  auditCorrectionMetadata?:
    | FinalizationActionValidatorAuditCorrectionMetadata
    | FinalizationToExecutionRecordAuditCorrectionSummary
    | null;
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordFinalizationBridgeValidationResult = {
  contractVersion: ExecutionRecordFinalizationBridgeValidatorContractVersion;
  evaluatedAt: string;
  status: ExecutionRecordFinalizationBridgeValidationStatus;
  decisionRecommendation: ExecutionRecordFinalizationBridgeDecisionRecommendation;
  input?: ExecutionRecordFinalizationBridgeValidationInput | null;
  bridgeResult?: FinalizationToExecutionRecordBridgeResult | null;
  summaryValidation: ExecutionRecordFinalizationBridgeSummaryValidation;
  validatedFieldSummary: ExecutionRecordFinalizationBridgeValidatedFieldSummary[];
  idempotencyValidationSummary: ExecutionRecordFinalizationBridgeIdempotencyValidationSummary;
  auditCorrectionValidationSummary: ExecutionRecordFinalizationBridgeAuditCorrectionValidationSummary;
  safetyPolicyValidationSummary: ExecutionRecordFinalizationBridgeSafetyPolicyValidationSummary;
  blockedReasons: ExecutionRecordFinalizationBridgeBlockedReason[];
  warnings: ExecutionRecordFinalizationBridgeWarning[];
  reviewItems: ExecutionRecordFinalizationBridgeReviewItem[];
  authorityFlags: ExecutionRecordFinalizationBridgeAuthorityFlags;
  validationOnly: true;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  safeToFinalize: false;
  safeToUpdateStats: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  safeToRunBrokerAction: false;
  automaticModeAllowed: false;
  validatorImplemented: false;
  executionRecordCreationAttempted: false;
  persistenceAttempted: false;
  finalizationAttempted: false;
  statsUpdateAttempted: false;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  tradeMutationAttempted: false;
  brokerAutomationAttempted: false;
  avanzaAutomationAttempted: false;
  browserAutomationAttempted: false;
  metadata?: Record<string, unknown>;
};

export const EXECUTION_RECORD_FINALIZATION_BRIDGE_STATUS_METADATA = {
  bridge_validation_valid: {
    decisionRecommendation: "validate_only",
    blocksWrites: true,
    requiresManualReview: false,
    reason:
      "Bridge output is structurally valid for future candidate-builder review only. It is not write approval.",
  },
  bridge_validation_needs_review: {
    decisionRecommendation: "needs_manual_review",
    blocksWrites: true,
    requiresManualReview: true,
    reason:
      "Bridge output requires manual review before any future downstream consumption.",
  },
  bridge_validation_blocked: {
    decisionRecommendation: "blocked_do_not_write",
    blocksWrites: true,
    requiresManualReview: true,
    reason:
      "Bridge output is blocked and must not feed candidate building or persistence.",
  },
  bridge_validation_unsupported: {
    decisionRecommendation: "unsupported_do_not_write",
    blocksWrites: true,
    requiresManualReview: true,
    reason: "Bridge output source, broker, or status is unsupported.",
  },
  bridge_validation_invalid: {
    decisionRecommendation: "invalid_do_not_write",
    blocksWrites: true,
    requiresManualReview: true,
    reason:
      "Bridge output is malformed or violates validation-only safety policy.",
  },
} as const satisfies Record<
  ExecutionRecordFinalizationBridgeValidationStatus,
  {
    decisionRecommendation: ExecutionRecordFinalizationBridgeDecisionRecommendation;
    blocksWrites: true;
    requiresManualReview: boolean;
    reason: string;
  }
>;
