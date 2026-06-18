import type {
  FinalizationActionInput,
  FinalizationActionResult,
} from "@/lib/finalization-action-contract";
import type { FinalizationCandidate } from "@/lib/finalization-candidate-contract";
import type {
  FinalizationTransitionApprovalContext,
  FinalizationTransitionAuditContext,
  FinalizationTransitionBoundaryStatus,
  FinalizationTransitionResult,
} from "@/lib/finalization-state-transition-contract";
import type { FinalizationStateTransitionValidationResult } from "@/lib/finalization-state-transition-validator-contract";
import type { FinalizationValidationResult } from "@/lib/finalization-validator-contract";
import type { ExecutionRecordCandidate } from "@/lib/execution-record-creation-contract";

// Contract metadata only. These types describe a future Finalization Action
// Validator boundary. They do not implement validation logic, execute
// finalization actions, finalize, persist, create execution records, update
// stats/PnL, append audit records, rollback/correct, mutate trades, wire UI,
// capture broker evidence, automate browser/Avanza behavior, perform broker
// behavior, or run production runtime behavior.

export const FINALIZATION_ACTION_VALIDATOR_CONTRACT_VERSION =
  "finalization_action_validator_v1" as const;

export type FinalizationActionValidatorContractVersion =
  typeof FINALIZATION_ACTION_VALIDATOR_CONTRACT_VERSION;

export const FINALIZATION_ACTION_VALIDATION_STATUSES = [
  "action_candidate_valid",
  "needs_review",
  "blocked",
  "unsupported",
  "not_ready",
] as const;

export type FinalizationActionValidationStatus =
  (typeof FINALIZATION_ACTION_VALIDATION_STATUSES)[number];

export const FINALIZATION_ACTION_VALIDATION_AUTHORITY_KEYS = [
  "finalization_authority",
  "persistence_authority",
  "execution_record_creation_authority",
  "stats_pnl_update_authority",
  "audit_append_authority",
  "rollback_correction_authority",
  "trade_mutation_authority",
  "automatic_mode_authority",
] as const;

export type FinalizationActionValidationAuthorityKey =
  (typeof FINALIZATION_ACTION_VALIDATION_AUTHORITY_KEYS)[number];

export const FINALIZATION_ACTION_VALIDATION_PRECONDITIONS = [
  "finalization_candidate_present",
  "finalization_validation_acceptable",
  "transition_validation_acceptable",
  "manual_approval_present_if_required",
  "no_duplicate_conflict",
  "no_unresolved_review_blocker",
  "supported_source_broker",
  "audit_correction_strategy_present",
  "boundary_metadata_present_when_relevant",
] as const;

export type FinalizationActionValidationPrecondition =
  (typeof FINALIZATION_ACTION_VALIDATION_PRECONDITIONS)[number];

export const FINALIZATION_ACTION_VALIDATION_WRITE_BOUNDARIES = [
  "persistence_boundary",
  "execution_record_creation_boundary",
  "stats_pnl_update_boundary",
  "audit_append_boundary",
  "correction_rollback_boundary",
  "trade_mutation_boundary",
] as const;

export type FinalizationActionValidationWriteBoundary =
  (typeof FINALIZATION_ACTION_VALIDATION_WRITE_BOUNDARIES)[number];

export const FINALIZATION_ACTION_VALIDATION_WRITE_BOUNDARY_STATUSES = [
  "available_but_disabled",
  "missing",
  "not_required",
  "blocked",
  "unknown",
] as const;

export type FinalizationActionValidationWriteBoundaryStatus =
  (typeof FINALIZATION_ACTION_VALIDATION_WRITE_BOUNDARY_STATUSES)[number];

export const FINALIZATION_ACTION_VALIDATION_AUDIT_CORRECTION_REQUIREMENTS = [
  "audit_requirements_present",
  "correction_rollback_requirements_present",
  "before_after_state_references_available",
  "source_evidence_traceable",
  "manual_approval_traceable",
  "duplicate_prevention_available",
] as const;

export type FinalizationActionValidationAuditCorrectionRequirement =
  (typeof FINALIZATION_ACTION_VALIDATION_AUDIT_CORRECTION_REQUIREMENTS)[number];

export const FINALIZATION_ACTION_VALIDATION_BLOCKED_REASONS = [
  "finalization_action_not_enabled",
  "missing_finalization_candidate",
  "missing_finalization_validation",
  "missing_transition_validation",
  "manual_approval_missing",
  "write_boundary_unavailable",
  "audit_requirement_missing",
  "correction_strategy_missing",
  "authority_flag_unexpectedly_true",
  "persistence_coupling_detected",
  "execution_record_coupling_detected",
  "stats_update_coupling_detected",
  "audit_append_coupling_detected",
  "rollback_coupling_detected",
  "trade_mutation_coupling_detected",
  "automatic_mode_not_allowed",
] as const;

export type FinalizationActionBlockedReason =
  (typeof FINALIZATION_ACTION_VALIDATION_BLOCKED_REASONS)[number];

export const FINALIZATION_ACTION_VALIDATION_WARNINGS = [
  "action_validator_contract_only",
  "action_candidate_not_execution",
  "manual_approval_not_write_authority",
  "dry_run_not_production_action",
  "audit_required_before_write",
  "future_write_boundary_required",
  "candidate_not_write_authority",
] as const;

export type FinalizationActionValidationWarning =
  (typeof FINALIZATION_ACTION_VALIDATION_WARNINGS)[number];

export type FinalizationActionValidationSafetyPolicy = {
  safeToValidateOnly: true;
  safeToRunFinalizationAction: false;
  safeToFinalize: false;
  safeToPersist: false;
  safeToCreateExecutionRecord: false;
  safeToUpdateStats: false;
  safeToMutateTrade: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  automaticModeAllowed: false;
  validatorImplementationEnabled: false;
  finalizationActionImplementationEnabled: false;
  finalizationImplementationEnabled: false;
  persistenceImplementationEnabled: false;
  executionRecordCreationEnabled: false;
  statsUpdateEnabled: false;
  tradeMutationEnabled: false;
  auditAppendEnabled: false;
  rollbackImplementationEnabled: false;
  browserAutomationEnabled: false;
  avanzaAutomationEnabled: false;
  brokerAutomationEnabled: false;
  policyReason: string;
};

export const FINALIZATION_ACTION_VALIDATION_DEFAULT_SAFETY_POLICY = {
  safeToValidateOnly: true,
  safeToRunFinalizationAction: false,
  safeToFinalize: false,
  safeToPersist: false,
  safeToCreateExecutionRecord: false,
  safeToUpdateStats: false,
  safeToMutateTrade: false,
  safeToAppendAudit: false,
  safeToRollback: false,
  automaticModeAllowed: false,
  validatorImplementationEnabled: false,
  finalizationActionImplementationEnabled: false,
  finalizationImplementationEnabled: false,
  persistenceImplementationEnabled: false,
  executionRecordCreationEnabled: false,
  statsUpdateEnabled: false,
  tradeMutationEnabled: false,
  auditAppendEnabled: false,
  rollbackImplementationEnabled: false,
  browserAutomationEnabled: false,
  avanzaAutomationEnabled: false,
  brokerAutomationEnabled: false,
  policyReason:
    "Finalization action validator contract types are validation-only and do not implement or approve action execution, finalization, persistence, execution-record creation, stats/PnL updates, trade mutation, audit append, rollback/correction, browser automation, Avanza behavior, broker behavior, or automatic production behavior.",
} as const satisfies FinalizationActionValidationSafetyPolicy;

export type FinalizationActionAuthorityValidation = {
  finalizationAuthority: false;
  persistenceAuthority: false;
  executionRecordCreationAuthority: false;
  statsPnlUpdateAuthority: false;
  auditAppendAuthority: false;
  rollbackCorrectionAuthority: false;
  tradeMutationAuthority: false;
  automaticModeAuthority: false;
  unexpectedTrueAuthorityKeys: FinalizationActionValidationAuthorityKey[];
  safeForValidationOnly: true;
  blockedReason?: FinalizationActionBlockedReason | null;
  warning?: FinalizationActionValidationWarning | null;
  details?: string | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationActionPreconditionValidation = {
  precondition: FinalizationActionValidationPrecondition;
  status:
    | "satisfied"
    | "needs_review"
    | "blocked"
    | "unsupported"
    | "not_ready";
  satisfied: boolean;
  checkedAsMetadataOnly: true;
  blockedReason?: FinalizationActionBlockedReason | null;
  warning?: FinalizationActionValidationWarning | null;
  details?: string | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationActionWriteBoundaryValidation = {
  boundary: FinalizationActionValidationWriteBoundary;
  status: FinalizationActionValidationWriteBoundaryStatus;
  sourceBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  requiredForFutureWrite: boolean;
  safeToInvoke: false;
  writeAttempted: false;
  blockedReason?: FinalizationActionBlockedReason | null;
  warning?: FinalizationActionValidationWarning | null;
  details?: string | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationActionAuditCorrectionValidation = {
  auditRequirementsPresent: boolean;
  correctionRollbackRequirementsPresent: boolean;
  beforeAfterStateReferencesAvailable: boolean;
  sourceEvidenceTraceable: boolean;
  manualApprovalTraceable: boolean;
  duplicatePreventionAvailable: boolean;
  requirements: FinalizationActionValidationAuditCorrectionRequirement[];
  missingRequirements: FinalizationActionValidationAuditCorrectionRequirement[];
  auditContext?: FinalizationTransitionAuditContext | null;
  readyForFutureWrite: false;
  checkedAsMetadataOnly: true;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  blockedReason?: FinalizationActionBlockedReason | null;
  warning?: FinalizationActionValidationWarning | null;
  details?: string | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationActionDecisionRecommendation = {
  recommendedStatus: FinalizationActionValidationStatus;
  safeToValidateOnly: true;
  runFinalizationAction: false;
  finalize: false;
  persist: false;
  createExecutionRecord: false;
  updateStats: false;
  appendAudit: false;
  rollback: false;
  mutateTrade: false;
  requiresManualReview: boolean;
  blockedReason?: FinalizationActionBlockedReason | null;
  warning?: FinalizationActionValidationWarning | null;
  details: string;
};

export type FinalizationActionValidatorManualApprovalContext = {
  approvalRequired: boolean;
  approvalPresent: boolean;
  approvalContext?: FinalizationTransitionApprovalContext | null;
  approvalIsWriteAuthority: false;
  approvedBy?: string | null;
  approvedAt?: string | null;
  approvalReference?: string | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationActionValidatorBoundaryMetadata = {
  persistenceBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  executionRecordBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  statsPnlBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  auditAppendBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  correctionRollbackBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  tradeMutationBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  metadataPresentWhenRelevant: boolean;
  missingBoundaryMetadata: FinalizationActionValidationWriteBoundary[];
  metadata?: Record<string, unknown>;
};

export type FinalizationActionValidatorAuditCorrectionMetadata = {
  auditRequired: boolean;
  correctionRollbackRequired: boolean;
  auditContext?: FinalizationTransitionAuditContext | null;
  beforeStateReference?: string | null;
  afterStateReference?: string | null;
  sourceEvidenceReference?: string | null;
  duplicatePreventionReference?: string | null;
  correctionStrategyReference?: string | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationActionValidatorInput = {
  contractVersion: FinalizationActionValidatorContractVersion;
  requestedAt: string;
  actionInput?: FinalizationActionInput | null;
  actionResult?: FinalizationActionResult | null;
  candidate?: FinalizationCandidate | null;
  finalizationValidationResult?: FinalizationValidationResult | null;
  transitionValidationResult?: FinalizationStateTransitionValidationResult | null;
  transitionResult?: FinalizationTransitionResult | null;
  executionRecordCandidateMetadata?: ExecutionRecordCandidate | null;
  boundaryMetadata?: FinalizationActionValidatorBoundaryMetadata | null;
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  auditCorrectionMetadata?: FinalizationActionValidatorAuditCorrectionMetadata | null;
  safetyPolicy?: FinalizationActionValidationSafetyPolicy | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationActionValidationResult = {
  contractVersion: FinalizationActionValidatorContractVersion;
  evaluatedAt: string;
  status: FinalizationActionValidationStatus;
  actionInput?: FinalizationActionInput | null;
  actionResult?: FinalizationActionResult | null;
  candidate?: FinalizationCandidate | null;
  finalizationValidationResult?: FinalizationValidationResult | null;
  transitionValidationResult?: FinalizationStateTransitionValidationResult | null;
  transitionResult?: FinalizationTransitionResult | null;
  authorityValidation: FinalizationActionAuthorityValidation;
  preconditionValidations: FinalizationActionPreconditionValidation[];
  writeBoundaryValidations: FinalizationActionWriteBoundaryValidation[];
  auditCorrectionValidation: FinalizationActionAuditCorrectionValidation;
  decisionRecommendation: FinalizationActionDecisionRecommendation;
  safetyPolicy: FinalizationActionValidationSafetyPolicy;
  blockedReasons: FinalizationActionBlockedReason[];
  warnings: FinalizationActionValidationWarning[];
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  executionRecordCandidateMetadata?: ExecutionRecordCandidate | null;
  safeToValidateOnly: true;
  safeToRunFinalizationAction: false;
  safeToFinalize: false;
  safeToPersist: false;
  safeToCreateExecutionRecord: false;
  safeToUpdateStats: false;
  safeToMutateTrade: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  validatorImplementationEnabled: false;
  finalizationActionAttempted: false;
  finalizationAttempted: false;
  persistenceAttempted: false;
  executionRecordCreationAttempted: false;
  statsUpdateAttempted: false;
  tradeMutationAttempted: false;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  browserAutomationAttempted: false;
  avanzaAutomationAttempted: false;
  brokerAutomationAttempted: false;
  metadata?: Record<string, unknown>;
};

export const FINALIZATION_ACTION_VALIDATION_STATUS_METADATA = {
  action_candidate_valid: {
    requiresManualReview: true,
    blocksFinalizationAction: true,
    reason:
      "Action candidate metadata may be validator-ready, but validator contract types do not run finalization actions.",
  },
  needs_review: {
    requiresManualReview: true,
    blocksFinalizationAction: true,
    reason:
      "Manual review is required before any future finalization action boundary.",
  },
  blocked: {
    requiresManualReview: true,
    blocksFinalizationAction: true,
    reason:
      "Blocking authority, precondition, write boundary, audit, correction, or coupling data is present.",
  },
  unsupported: {
    requiresManualReview: true,
    blocksFinalizationAction: true,
    reason:
      "The requested finalization action validator source, broker, mode, or behavior is unsupported.",
  },
  not_ready: {
    requiresManualReview: true,
    blocksFinalizationAction: true,
    reason:
      "Required candidate, validation, transition, approval, boundary, audit, or correction metadata is incomplete.",
  },
} as const satisfies Record<
  FinalizationActionValidationStatus,
  {
    requiresManualReview: true;
    blocksFinalizationAction: true;
    reason: string;
  }
>;
