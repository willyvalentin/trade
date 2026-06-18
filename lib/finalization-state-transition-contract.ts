import type { ExecutionRecordCandidate } from "@/lib/execution-record-creation-contract";
import type { FinalizationCandidate } from "@/lib/finalization-candidate-contract";
import type {
  FinalizationCandidateBuilderResult,
  FinalizationCandidateBuilderTradeContext,
} from "@/lib/finalization-candidate-builder-contract";
import type { FinalSettlementNoteMatchingResult } from "@/lib/final-settlement-note-matching-contract";
import type {
  FinalizationManualReviewContext,
  FinalizationValidationResult,
  FinalizationValidationStatus,
} from "@/lib/finalization-validator-contract";

// Contract metadata only. These types describe a future finalization state
// transition boundary. They do not implement transitions, finalization,
// persistence, execution-record creation, stats/PnL updates, trade mutation,
// UI wiring, capture, browser automation, Avanza behavior, broker behavior, or
// production runtime behavior.

export const FINALIZATION_STATE_TRANSITION_CONTRACT_VERSION =
  "finalization_state_transition_v1" as const;

export type FinalizationStateTransitionContractVersion =
  typeof FINALIZATION_STATE_TRANSITION_CONTRACT_VERSION;

export const FINALIZATION_TRANSITION_SOURCE_STATES = [
  "finalization_candidate_built",
  "ready_for_finalization_review",
  "needs_review",
  "blocked",
  "partial_fill_review",
  "duplicate_review",
  "unsupported",
  "not_ready",
] as const;

export type FinalizationTransitionSourceState =
  (typeof FINALIZATION_TRANSITION_SOURCE_STATES)[number];

export const FINALIZATION_TRANSITION_TARGET_STATES = [
  "finalization_review_ready",
  "finalization_approved_pending_write",
  "finalization_write_pending",
  "finalized",
  "finalization_rejected",
  "finalization_needs_review",
  "finalization_blocked",
  "finalization_rolled_back",
  "correction_needed",
] as const;

export type FinalizationTransitionTargetState =
  (typeof FINALIZATION_TRANSITION_TARGET_STATES)[number];

export const FINALIZATION_TRANSITION_STATUSES = [
  "transition_candidate",
  "needs_review",
  "blocked",
  "unsupported",
  "not_ready",
] as const;

export type FinalizationTransitionStatus =
  (typeof FINALIZATION_TRANSITION_STATUSES)[number];

export const FINALIZATION_TRANSITION_PREREQUISITES = [
  "valid_finalization_candidate",
  "acceptable_validation_status",
  "manual_review_or_approval_if_required",
  "no_duplicate_conflict",
  "no_partial_fill_ambiguity",
  "no_unsafe_authority_flags",
  "no_unresolved_pnl_fee_fx_uncertainty_unless_review_accepted",
  "persistence_boundary_available_if_future_write_requested",
  "execution_record_boundary_available_if_future_record_creation_requested",
  "stats_pnl_boundary_available_if_future_stats_update_requested",
  "audit_correction_strategy_available",
] as const;

export type FinalizationTransitionPrerequisite =
  (typeof FINALIZATION_TRANSITION_PREREQUISITES)[number];

export const FINALIZATION_TRANSITION_BLOCKED_REASONS = [
  "candidate_missing",
  "validation_result_missing",
  "validation_status_not_acceptable",
  "manual_approval_missing",
  "duplicate_conflict_unresolved",
  "partial_fill_ambiguity_unresolved",
  "unsafe_authority_flag_detected",
  "pnl_fee_fx_uncertainty_unresolved",
  "persistence_boundary_missing",
  "execution_record_boundary_missing",
  "stats_pnl_boundary_missing",
  "audit_correction_strategy_missing",
  "transition_implementation_missing",
  "finalization_action_contract_missing",
] as const;

export type FinalizationTransitionBlockedReason =
  (typeof FINALIZATION_TRANSITION_BLOCKED_REASONS)[number];

export const FINALIZATION_TRANSITION_WARNINGS = [
  "transition_contract_only",
  "transition_not_implemented",
  "target_state_not_applied",
  "manual_approval_required",
  "write_boundary_required",
  "audit_correction_required",
  "not_finalization_approval",
  "not_persistence_approval",
  "not_execution_record_creation_approval",
  "not_stats_update_approval",
  "not_trade_mutation_approval",
] as const;

export type FinalizationTransitionWarning =
  (typeof FINALIZATION_TRANSITION_WARNINGS)[number];

export const FINALIZATION_TRANSITION_AUDIT_REQUIREMENTS = [
  "source_evidence_traceable",
  "before_after_values_known",
  "approval_actor_timestamp_recorded",
  "candidate_fingerprint_recorded",
  "validator_result_recorded",
  "write_attempts_traceable",
  "duplicate_finalization_prevention",
] as const;

export type FinalizationTransitionAuditRequirement =
  (typeof FINALIZATION_TRANSITION_AUDIT_REQUIREMENTS)[number];

export const FINALIZATION_TRANSITION_CORRECTION_REQUIREMENTS = [
  "correction_strategy_available",
  "rollback_or_amendment_path_defined",
  "duplicate_correction_prevention",
  "correction_audit_trail_required",
] as const;

export type FinalizationTransitionCorrectionRequirement =
  (typeof FINALIZATION_TRANSITION_CORRECTION_REQUIREMENTS)[number];

export type FinalizationTransitionBoundaryStatus = {
  available: boolean;
  status?: "available" | "missing" | "not_required" | "blocked" | "unknown";
  reason?: string | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationTransitionApprovalContext = {
  approvalRequired: true;
  approved: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
  approvalReference?: string | null;
  approvalNotes?: string | null;
  manualReviewContext?: FinalizationManualReviewContext | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationTransitionAuditContext = {
  auditRequired: true;
  auditStrategyAvailable: boolean;
  sourceEvidenceTraceable: boolean;
  beforeAfterValuesKnown: boolean;
  duplicatePreventionAvailable: boolean;
  correctionStrategyAvailable: boolean;
  auditReference?: string | null;
  candidateFingerprint?: string | null;
  validatorResultReference?: string | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationTransitionSafetyPolicy = {
  safeToTransition: false;
  safeToFinalize: false;
  safeToPersist: false;
  safeToCreateExecutionRecord: false;
  safeToUpdateStats: false;
  safeToMutateTrade: false;
  automaticModeAllowed: false;
  manualApprovalRequired: true;
  transitionImplementationEnabled: false;
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

export const FINALIZATION_TRANSITION_DEFAULT_SAFETY_POLICY = {
  safeToTransition: false,
  safeToFinalize: false,
  safeToPersist: false,
  safeToCreateExecutionRecord: false,
  safeToUpdateStats: false,
  safeToMutateTrade: false,
  automaticModeAllowed: false,
  manualApprovalRequired: true,
  transitionImplementationEnabled: false,
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
    "Finalization state transition contract types are type-only and do not implement or approve transitions, finalization, persistence, execution-record creation, stats/PnL updates, trade mutation, audit append, browser automation, Avanza behavior, broker behavior, or production runtime behavior.",
} as const satisfies FinalizationTransitionSafetyPolicy;

export type FinalizationTransitionPrerequisiteResult = {
  prerequisite: FinalizationTransitionPrerequisite;
  status: "satisfied" | "review_required" | "blocked" | "not_required";
  satisfied: boolean;
  blockedReason?: FinalizationTransitionBlockedReason | null;
  warning?: FinalizationTransitionWarning | null;
  details?: string | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationTransitionDecision = {
  sourceState: FinalizationTransitionSourceState;
  targetState: FinalizationTransitionTargetState;
  transitionStatus: FinalizationTransitionStatus;
  appliesTargetState: false;
  requiresApproval: boolean;
  requiresWriteBoundary: boolean;
  blockedReason?: FinalizationTransitionBlockedReason | null;
  warning?: FinalizationTransitionWarning | null;
  details: string;
};

export const FINALIZATION_TRANSITION_DECISION_TABLE = {
  ready_for_finalization_review: {
    sourceState: "ready_for_finalization_review",
    targetState: "finalization_review_ready",
    transitionStatus: "transition_candidate",
    appliesTargetState: false,
    requiresApproval: true,
    requiresWriteBoundary: false,
    warning: "target_state_not_applied",
    details:
      "Validation result can be reviewed for future finalization, but no state transition is applied.",
  },
  needs_review: {
    sourceState: "needs_review",
    targetState: "finalization_needs_review",
    transitionStatus: "needs_review",
    appliesTargetState: false,
    requiresApproval: true,
    requiresWriteBoundary: false,
    warning: "manual_approval_required",
    details: "Validation result requires review before any future transition.",
  },
  partial_fill_review: {
    sourceState: "partial_fill_review",
    targetState: "finalization_needs_review",
    transitionStatus: "needs_review",
    appliesTargetState: false,
    requiresApproval: true,
    requiresWriteBoundary: false,
    warning: "manual_approval_required",
    details: "Partial-fill validation result requires review.",
  },
  duplicate_review: {
    sourceState: "duplicate_review",
    targetState: "finalization_needs_review",
    transitionStatus: "needs_review",
    appliesTargetState: false,
    requiresApproval: true,
    requiresWriteBoundary: false,
    blockedReason: "duplicate_conflict_unresolved",
    warning: "manual_approval_required",
    details: "Duplicate validation result requires review and duplicate controls.",
  },
  blocked: {
    sourceState: "blocked",
    targetState: "finalization_blocked",
    transitionStatus: "blocked",
    appliesTargetState: false,
    requiresApproval: true,
    requiresWriteBoundary: false,
    blockedReason: "validation_status_not_acceptable",
    details: "Blocked validation result cannot transition.",
  },
  unsupported: {
    sourceState: "unsupported",
    targetState: "finalization_blocked",
    transitionStatus: "unsupported",
    appliesTargetState: false,
    requiresApproval: true,
    requiresWriteBoundary: false,
    blockedReason: "validation_status_not_acceptable",
    details: "Unsupported validation result cannot transition.",
  },
  not_ready: {
    sourceState: "not_ready",
    targetState: "finalization_blocked",
    transitionStatus: "not_ready",
    appliesTargetState: false,
    requiresApproval: true,
    requiresWriteBoundary: false,
    blockedReason: "validation_status_not_acceptable",
    details: "Not-ready validation result cannot transition.",
  },
} as const satisfies Record<
  Exclude<FinalizationValidationStatus, never>,
  Omit<FinalizationTransitionDecision, "sourceState"> & {
    sourceState: FinalizationValidationStatus;
  }
>;

export type FinalizationTransitionInput = {
  contractVersion: FinalizationStateTransitionContractVersion;
  requestedAt: string;
  sourceState: FinalizationTransitionSourceState;
  candidate?: FinalizationCandidate | null;
  validationResult?: FinalizationValidationResult | null;
  builderResult?: FinalizationCandidateBuilderResult | null;
  finalSettlementNoteMatchingResult?: FinalSettlementNoteMatchingResult | null;
  provisionalTradeContext?: FinalizationCandidateBuilderTradeContext | null;
  executionRecordCandidateMetadata?: ExecutionRecordCandidate | null;
  approvalContext?: FinalizationTransitionApprovalContext | null;
  persistenceBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  executionRecordBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  statsPnlBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  auditContext?: FinalizationTransitionAuditContext | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationTransitionResult = {
  contractVersion: FinalizationStateTransitionContractVersion;
  evaluatedAt: string;
  sourceState: FinalizationTransitionSourceState;
  targetState: FinalizationTransitionTargetState;
  status: FinalizationTransitionStatus;
  decision: FinalizationTransitionDecision;
  prerequisiteResults: FinalizationTransitionPrerequisiteResult[];
  blockedReasons: FinalizationTransitionBlockedReason[];
  warnings: FinalizationTransitionWarning[];
  auditRequirements: FinalizationTransitionAuditRequirement[];
  correctionRequirements: FinalizationTransitionCorrectionRequirement[];
  safetyPolicy: FinalizationTransitionSafetyPolicy;
  candidate?: FinalizationCandidate | null;
  validationResult?: FinalizationValidationResult | null;
  builderResult?: FinalizationCandidateBuilderResult | null;
  approvalContext?: FinalizationTransitionApprovalContext | null;
  auditContext?: FinalizationTransitionAuditContext | null;
  safeToTransition: false;
  safeToFinalize: false;
  safeToPersist: false;
  safeToCreateExecutionRecord: false;
  safeToUpdateStats: false;
  safeToMutateTrade: false;
  transitionApplied: false;
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
