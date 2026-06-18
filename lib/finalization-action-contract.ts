import type { ExecutionRecordCandidate } from "@/lib/execution-record-creation-contract";
import type { FinalizationCandidate } from "@/lib/finalization-candidate-contract";
import type {
  FinalizationTransitionApprovalContext,
  FinalizationTransitionAuditContext,
  FinalizationTransitionBoundaryStatus,
  FinalizationTransitionResult,
} from "@/lib/finalization-state-transition-contract";
import type { FinalizationStateTransitionValidationResult } from "@/lib/finalization-state-transition-validator-contract";
import type { FinalizationValidationResult } from "@/lib/finalization-validator-contract";

// Contract metadata only. These types describe a future Finalization Action
// boundary. They do not implement action execution, finalization, transition
// application, persistence, execution-record creation, stats/PnL updates, audit
// append, rollback/correction, trade mutation, UI wiring, capture, browser
// automation, Avanza behavior, broker behavior, or production runtime behavior.

export const FINALIZATION_ACTION_CONTRACT_VERSION =
  "finalization_action_v1" as const;

export type FinalizationActionContractVersion =
  typeof FINALIZATION_ACTION_CONTRACT_VERSION;

export const FINALIZATION_ACTION_STATUSES = [
  "action_candidate",
  "needs_review",
  "blocked",
  "unsupported",
  "not_ready",
] as const;

export type FinalizationActionStatus =
  (typeof FINALIZATION_ACTION_STATUSES)[number];

export const FINALIZATION_ACTION_MODES = [
  "dry_run",
  "manual_review_only",
  "future_write_candidate",
  "disabled",
] as const;

export type FinalizationActionMode = (typeof FINALIZATION_ACTION_MODES)[number];

export const FINALIZATION_ACTION_AUTHORITY_KEYS = [
  "finalization_authority",
  "persistence_authority",
  "execution_record_creation_authority",
  "stats_pnl_update_authority",
  "trade_mutation_authority",
  "audit_append_authority",
  "correction_rollback_authority",
] as const;

export type FinalizationActionAuthorityKey =
  (typeof FINALIZATION_ACTION_AUTHORITY_KEYS)[number];

export type FinalizationActionAuthority = {
  finalizationAuthority: false;
  persistenceAuthority: false;
  executionRecordCreationAuthority: false;
  statsPnlUpdateAuthority: false;
  tradeMutationAuthority: false;
  auditAppendAuthority: false;
  correctionRollbackAuthority: false;
  automaticModeAllowed: false;
  authorityReason: string;
};

export const FINALIZATION_ACTION_DEFAULT_AUTHORITY = {
  finalizationAuthority: false,
  persistenceAuthority: false,
  executionRecordCreationAuthority: false,
  statsPnlUpdateAuthority: false,
  tradeMutationAuthority: false,
  auditAppendAuthority: false,
  correctionRollbackAuthority: false,
  automaticModeAllowed: false,
  authorityReason:
    "Finalization action contract types are type-only and do not grant finalization, persistence, execution-record creation, stats/PnL update, trade mutation, audit append, rollback/correction, automatic mode, browser automation, Avanza behavior, broker behavior, or production runtime authority.",
} as const satisfies FinalizationActionAuthority;

export const FINALIZATION_ACTION_PRECONDITIONS = [
  "finalization_candidate_present",
  "finalization_validation_present",
  "transition_validation_present",
  "transition_validation_reviewable",
  "manual_approval_present_if_required",
  "write_boundaries_reviewed",
  "audit_requirements_satisfied",
  "correction_strategy_available",
  "no_unexpected_authority_flags",
  "no_persistence_coupling",
  "no_execution_record_coupling",
  "no_stats_update_coupling",
  "no_trade_mutation_coupling",
  "automatic_mode_disabled",
] as const;

export type FinalizationActionPrecondition =
  (typeof FINALIZATION_ACTION_PRECONDITIONS)[number];

export const FINALIZATION_ACTION_WRITE_BOUNDARIES = [
  "finalization_write_boundary",
  "persistence_write_boundary",
  "execution_record_creation_boundary",
  "stats_pnl_update_boundary",
  "trade_mutation_boundary",
  "audit_append_boundary",
  "correction_rollback_boundary",
] as const;

export type FinalizationActionWriteBoundary =
  (typeof FINALIZATION_ACTION_WRITE_BOUNDARIES)[number];

export const FINALIZATION_ACTION_WRITE_BOUNDARY_STATUSES = [
  "not_available",
  "available_but_disabled",
  "requires_manual_approval",
  "requires_reassessment",
  "out_of_scope",
] as const;

export type FinalizationActionWriteBoundaryStatus =
  (typeof FINALIZATION_ACTION_WRITE_BOUNDARY_STATUSES)[number];

export const FINALIZATION_ACTION_AUDIT_REQUIREMENTS = [
  "source_evidence_traceable",
  "candidate_fingerprint_recorded",
  "validation_result_recorded",
  "transition_validation_result_recorded",
  "approval_actor_timestamp_recorded",
  "before_after_values_known",
  "write_attempts_traceable",
  "duplicate_finalization_prevention",
] as const;

export type FinalizationActionAuditRequirement =
  (typeof FINALIZATION_ACTION_AUDIT_REQUIREMENTS)[number];

export const FINALIZATION_ACTION_CORRECTION_REQUIREMENTS = [
  "correction_strategy_available",
  "rollback_or_amendment_path_defined",
  "duplicate_correction_prevention",
  "correction_audit_trail_required",
] as const;

export type FinalizationActionCorrectionRequirement =
  (typeof FINALIZATION_ACTION_CORRECTION_REQUIREMENTS)[number];

export const FINALIZATION_ACTION_BLOCKED_REASONS = [
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
  "trade_mutation_coupling_detected",
  "automatic_mode_not_allowed",
] as const;

export type FinalizationActionBlockedReason =
  (typeof FINALIZATION_ACTION_BLOCKED_REASONS)[number];

export const FINALIZATION_ACTION_WARNINGS = [
  "action_contract_only",
  "dry_run_only",
  "manual_review_required",
  "future_write_boundary_required",
  "candidate_not_write_authority",
  "transition_not_applied",
  "audit_required_before_write",
] as const;

export type FinalizationActionWarning =
  (typeof FINALIZATION_ACTION_WARNINGS)[number];

export type FinalizationActionSafetyPolicy = {
  safeToRunFinalizationAction: false;
  safeToFinalize: false;
  safeToPersist: false;
  safeToCreateExecutionRecord: false;
  safeToUpdateStats: false;
  safeToMutateTrade: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  automaticModeAllowed: false;
  finalizationActionImplementationEnabled: false;
  transitionApplicationEnabled: false;
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

export const FINALIZATION_ACTION_DEFAULT_SAFETY_POLICY = {
  safeToRunFinalizationAction: false,
  safeToFinalize: false,
  safeToPersist: false,
  safeToCreateExecutionRecord: false,
  safeToUpdateStats: false,
  safeToMutateTrade: false,
  safeToAppendAudit: false,
  safeToRollback: false,
  automaticModeAllowed: false,
  finalizationActionImplementationEnabled: false,
  transitionApplicationEnabled: false,
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
    "Finalization action contract types are type-only and do not implement or approve action execution, finalization, transition application, persistence, execution-record creation, stats/PnL updates, audit append, rollback/correction, trade mutation, browser automation, Avanza behavior, broker behavior, or production runtime behavior.",
} as const satisfies FinalizationActionSafetyPolicy;

export type FinalizationActionPreconditionResult = {
  precondition: FinalizationActionPrecondition;
  status: "satisfied" | "review_required" | "blocked" | "unsupported" | "not_ready";
  satisfied: boolean;
  blockedReason?: FinalizationActionBlockedReason | null;
  warning?: FinalizationActionWarning | null;
  details?: string | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationActionWriteBoundaryReadiness = {
  boundary: FinalizationActionWriteBoundary;
  status: FinalizationActionWriteBoundaryStatus;
  safeToInvoke: false;
  requiredForFutureWrite: boolean;
  sourceBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  blockedReason?: FinalizationActionBlockedReason | null;
  warning?: FinalizationActionWarning | null;
  details?: string | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationActionAuditReadiness = {
  auditRequirements: FinalizationActionAuditRequirement[];
  missingAuditRequirements: FinalizationActionAuditRequirement[];
  correctionRequirements: FinalizationActionCorrectionRequirement[];
  missingCorrectionRequirements: FinalizationActionCorrectionRequirement[];
  auditContext?: FinalizationTransitionAuditContext | null;
  readyForFutureWrite: false;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  metadata?: Record<string, unknown>;
};

export type FinalizationActionInput = {
  contractVersion: FinalizationActionContractVersion;
  requestedAt: string;
  mode: FinalizationActionMode;
  candidate?: FinalizationCandidate | null;
  finalizationValidationResult?: FinalizationValidationResult | null;
  transitionValidationResult?: FinalizationStateTransitionValidationResult | null;
  transitionResult?: FinalizationTransitionResult | null;
  executionRecordCandidateMetadata?: ExecutionRecordCandidate | null;
  persistenceBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  executionRecordBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  statsPnlBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  tradeMutationBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  auditAppendBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  correctionRollbackBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  approvalContext?: FinalizationTransitionApprovalContext | null;
  auditContext?: FinalizationTransitionAuditContext | null;
  authority?: FinalizationActionAuthority | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationActionResult = {
  contractVersion: FinalizationActionContractVersion;
  evaluatedAt: string;
  status: FinalizationActionStatus;
  mode: FinalizationActionMode;
  candidate?: FinalizationCandidate | null;
  finalizationValidationResult?: FinalizationValidationResult | null;
  transitionValidationResult?: FinalizationStateTransitionValidationResult | null;
  transitionResult?: FinalizationTransitionResult | null;
  preconditionResults: FinalizationActionPreconditionResult[];
  writeBoundaryReadiness: FinalizationActionWriteBoundaryReadiness[];
  auditReadiness: FinalizationActionAuditReadiness;
  authority: FinalizationActionAuthority;
  safetyPolicy: FinalizationActionSafetyPolicy;
  blockedReasons: FinalizationActionBlockedReason[];
  warnings: FinalizationActionWarning[];
  auditRequirements: FinalizationActionAuditRequirement[];
  correctionRequirements: FinalizationActionCorrectionRequirement[];
  approvalContext?: FinalizationTransitionApprovalContext | null;
  executionRecordCandidateMetadata?: ExecutionRecordCandidate | null;
  safeToRunFinalizationAction: false;
  safeToFinalize: false;
  safeToPersist: false;
  safeToCreateExecutionRecord: false;
  safeToUpdateStats: false;
  safeToMutateTrade: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  finalizationActionAttempted: false;
  transitionApplicationAttempted: false;
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

export const FINALIZATION_ACTION_STATUS_METADATA = {
  action_candidate: {
    requiresManualReview: true,
    blocksRuntimeAction: true,
    reason:
      "Action candidate metadata may be reviewable, but this contract does not run finalization actions.",
  },
  needs_review: {
    requiresManualReview: true,
    blocksRuntimeAction: true,
    reason: "Manual review is required before any future finalization action.",
  },
  blocked: {
    requiresManualReview: true,
    blocksRuntimeAction: true,
    reason:
      "Blocking candidate, validation, transition, authority, boundary, audit, or correction data is present.",
  },
  unsupported: {
    requiresManualReview: true,
    blocksRuntimeAction: true,
    reason: "The requested finalization action mode or behavior is unsupported.",
  },
  not_ready: {
    requiresManualReview: true,
    blocksRuntimeAction: true,
    reason:
      "Required candidate, validation, transition, approval, audit, or boundary metadata is incomplete.",
  },
} as const satisfies Record<
  FinalizationActionStatus,
  {
    requiresManualReview: true;
    blocksRuntimeAction: true;
    reason: string;
  }
>;
