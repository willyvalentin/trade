import type { ExecutionRecordCandidate } from "@/lib/execution-record-creation-contract";
import type { FinalizationCandidate } from "@/lib/finalization-candidate-contract";
import type {
  FinalizationTransitionApprovalContext,
  FinalizationTransitionAuditContext,
  FinalizationTransitionAuditRequirement,
  FinalizationTransitionBoundaryStatus,
  FinalizationTransitionCorrectionRequirement,
  FinalizationTransitionInput,
  FinalizationTransitionSourceState,
  FinalizationTransitionTargetState,
} from "@/lib/finalization-state-transition-contract";
import type { FinalizationValidationResult } from "@/lib/finalization-validator-contract";

// Contract metadata only. These types describe a future finalization state
// transition validator boundary. They do not implement validation, apply
// transitions, finalize, persist, create execution records, update stats/PnL,
// mutate trades, wire UI, capture broker evidence, automate Avanza/browser
// behavior, perform broker behavior, or run production runtime behavior.

export const FINALIZATION_STATE_TRANSITION_VALIDATOR_CONTRACT_VERSION =
  "finalization_state_transition_validator_v1" as const;

export type FinalizationStateTransitionValidatorContractVersion =
  typeof FINALIZATION_STATE_TRANSITION_VALIDATOR_CONTRACT_VERSION;

export const FINALIZATION_STATE_TRANSITION_VALIDATION_STATUSES = [
  "transition_candidate_valid",
  "needs_review",
  "blocked",
  "unsupported",
  "not_ready",
] as const;

export type FinalizationStateTransitionValidationStatus =
  (typeof FINALIZATION_STATE_TRANSITION_VALIDATION_STATUSES)[number];

export const FINALIZATION_STATE_TRANSITION_PREREQUISITES = [
  "valid_finalization_candidate",
  "acceptable_finalization_validation_result",
  "manual_review_or_approval_if_required",
  "no_duplicate_conflict",
  "no_partial_fill_ambiguity_unless_routed_to_review",
  "no_unsafe_authority_flags",
  "unresolved_pnl_fee_fx_uncertainty_review_only",
  "persistence_boundary_available_only_if_future_write_requested",
  "execution_record_boundary_available_only_if_future_record_creation_requested",
  "stats_pnl_boundary_available_only_if_future_stats_update_requested",
  "audit_correction_strategy_available",
] as const;

export type FinalizationStateTransitionPrerequisite =
  (typeof FINALIZATION_STATE_TRANSITION_PREREQUISITES)[number];

export const FINALIZATION_STATE_TRANSITION_BOUNDARY_READINESS_KEYS = [
  "persistence_boundary",
  "execution_record_boundary",
  "stats_pnl_boundary",
  "trade_mutation_boundary",
  "audit_append_boundary",
  "correction_rollback_boundary",
] as const;

export type FinalizationStateTransitionBoundaryReadinessKey =
  (typeof FINALIZATION_STATE_TRANSITION_BOUNDARY_READINESS_KEYS)[number];

export const FINALIZATION_STATE_TRANSITION_BLOCKED_REASONS = [
  "unsupported_source_target_pair",
  "missing_candidate",
  "missing_validation_result",
  "unsafe_authority_flag",
  "missing_audit_correction_strategy",
  "missing_required_boundary_metadata",
  "duplicate_conflict",
  "finalization_action_not_defined",
  "automatic_mode_not_allowed",
  "persistence_coupling_detected",
  "execution_record_coupling_detected",
  "stats_update_coupling_detected",
  "trade_mutation_coupling_detected",
] as const;

export type FinalizationStateTransitionBlockedReason =
  (typeof FINALIZATION_STATE_TRANSITION_BLOCKED_REASONS)[number];

export const FINALIZATION_STATE_TRANSITION_WARNINGS = [
  "valid_transition_candidate_not_applied",
  "manual_approval_not_write_authority",
  "boundary_readiness_metadata_only",
  "audit_correction_required",
  "review_state_required",
] as const;

export type FinalizationStateTransitionWarning =
  (typeof FINALIZATION_STATE_TRANSITION_WARNINGS)[number];

export const FINALIZATION_STATE_TRANSITION_SOURCE_TARGET_COMPATIBILITY_STATUS = [
  "compatible",
  "review_required",
  "blocked",
  "unsupported",
  "not_ready",
] as const;

export type FinalizationStateTransitionSourceTargetCompatibilityStatus =
  (typeof FINALIZATION_STATE_TRANSITION_SOURCE_TARGET_COMPATIBILITY_STATUS)[number];

export type FinalizationStateTransitionSafetyPolicy = {
  safeToApplyTransition: false;
  safeToFinalize: false;
  safeToPersist: false;
  safeToCreateExecutionRecord: false;
  safeToUpdateStats: false;
  safeToMutateTrade: false;
  automaticModeAllowed: false;
  manualReviewRequired: true;
  validatorImplementationEnabled: false;
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

export const FINALIZATION_STATE_TRANSITION_VALIDATOR_DEFAULT_SAFETY_POLICY = {
  safeToApplyTransition: false,
  safeToFinalize: false,
  safeToPersist: false,
  safeToCreateExecutionRecord: false,
  safeToUpdateStats: false,
  safeToMutateTrade: false,
  automaticModeAllowed: false,
  manualReviewRequired: true,
  validatorImplementationEnabled: false,
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
    "Finalization state transition validator contract types are type-only and do not implement validation, apply transitions, approve finalization, persist, create execution records, update stats/PnL, mutate trades, append audit records, automate browser/Avanza behavior, perform broker behavior, or run production runtime behavior.",
} as const satisfies FinalizationStateTransitionSafetyPolicy;

export type FinalizationStateTransitionSourceTargetCompatibility = {
  sourceState: FinalizationTransitionSourceState;
  proposedTargetState: FinalizationTransitionTargetState;
  expectedTargetState?: FinalizationTransitionTargetState | null;
  status: FinalizationStateTransitionSourceTargetCompatibilityStatus;
  compatible: boolean;
  blockedReason?: FinalizationStateTransitionBlockedReason | null;
  warning?: FinalizationStateTransitionWarning | null;
  details: string;
};

export const FINALIZATION_STATE_TRANSITION_SOURCE_TARGET_COMPATIBILITY = {
  ready_for_finalization_review: {
    sourceState: "ready_for_finalization_review",
    proposedTargetState: "finalization_review_ready",
    expectedTargetState: "finalization_review_ready",
    status: "compatible",
    compatible: true,
    warning: "valid_transition_candidate_not_applied",
    details:
      "Ready-for-finalization-review may validate toward finalization_review_ready, but no transition is applied.",
  },
  needs_review: {
    sourceState: "needs_review",
    proposedTargetState: "finalization_needs_review",
    expectedTargetState: "finalization_needs_review",
    status: "review_required",
    compatible: true,
    warning: "review_state_required",
    details: "Needs-review validation state maps to a review target concept.",
  },
  partial_fill_review: {
    sourceState: "partial_fill_review",
    proposedTargetState: "finalization_needs_review",
    expectedTargetState: "finalization_needs_review",
    status: "review_required",
    compatible: true,
    warning: "review_state_required",
    details: "Partial-fill review maps to a review target concept.",
  },
  duplicate_review: {
    sourceState: "duplicate_review",
    proposedTargetState: "finalization_needs_review",
    expectedTargetState: "finalization_needs_review",
    status: "review_required",
    compatible: true,
    blockedReason: "duplicate_conflict",
    warning: "review_state_required",
    details:
      "Duplicate review maps to a review target concept and requires duplicate controls.",
  },
  blocked: {
    sourceState: "blocked",
    proposedTargetState: "finalization_blocked",
    expectedTargetState: "finalization_blocked",
    status: "blocked",
    compatible: true,
    details: "Blocked validation state maps only to a blocked target concept.",
  },
  unsupported: {
    sourceState: "unsupported",
    proposedTargetState: "finalization_blocked",
    expectedTargetState: "finalization_blocked",
    status: "unsupported",
    compatible: true,
    details:
      "Unsupported validation state maps only to a blocked target concept.",
  },
  not_ready: {
    sourceState: "not_ready",
    proposedTargetState: "finalization_blocked",
    expectedTargetState: "finalization_blocked",
    status: "not_ready",
    compatible: true,
    details:
      "Not-ready validation state maps only to a blocked target concept.",
  },
} as const satisfies Record<
  Exclude<FinalizationTransitionSourceState, "finalization_candidate_built">,
  FinalizationStateTransitionSourceTargetCompatibility
>;

export type FinalizationStateTransitionPrerequisiteResult = {
  prerequisite: FinalizationStateTransitionPrerequisite;
  status: "satisfied" | "review_required" | "blocked" | "unsupported" | "not_ready";
  satisfied: boolean;
  blockedReason?: FinalizationStateTransitionBlockedReason | null;
  warning?: FinalizationStateTransitionWarning | null;
  details?: string | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationStateTransitionBoundaryReadiness = {
  persistenceBoundary: FinalizationTransitionBoundaryStatus;
  executionRecordBoundary: FinalizationTransitionBoundaryStatus;
  statsPnlBoundary: FinalizationTransitionBoundaryStatus;
  tradeMutationBoundary: FinalizationTransitionBoundaryStatus;
  auditAppendBoundary: FinalizationTransitionBoundaryStatus;
  correctionRollbackBoundary: FinalizationTransitionBoundaryStatus;
  requiredBoundaryMetadataPresent: boolean;
  missingBoundaryMetadata: FinalizationStateTransitionBoundaryReadinessKey[];
  checkedAsMetadataOnly: true;
  persistenceAttempted: false;
  executionRecordCreationAttempted: false;
  statsUpdateAttempted: false;
  tradeMutationAttempted: false;
  auditAppendAttempted: false;
};

export type FinalizationStateTransitionAuditCorrectionReadiness = {
  sourceEvidenceTraceable: boolean;
  beforeAfterValuesAvailable: boolean;
  duplicateFinalizationPreventionAvailable: boolean;
  correctionRollbackPathAvailable: boolean;
  auditTrailReady: boolean;
  manualApprovalTraceable: boolean;
  auditRequirements: FinalizationTransitionAuditRequirement[];
  correctionRequirements: FinalizationTransitionCorrectionRequirement[];
  auditContext?: FinalizationTransitionAuditContext | null;
  ready: boolean;
  checkedAsMetadataOnly: true;
  auditAppendAttempted: false;
};

export type FinalizationStateTransitionDecisionRecommendation = {
  recommendedStatus: FinalizationStateTransitionValidationStatus;
  recommendedTargetState: FinalizationTransitionTargetState;
  sourceState: FinalizationTransitionSourceState;
  applyTransition: false;
  requiresManualReview: boolean;
  requiresFinalizationActionContract: true;
  requiresWriteBoundary: boolean;
  blockedReason?: FinalizationStateTransitionBlockedReason | null;
  warning?: FinalizationStateTransitionWarning | null;
  details: string;
};

export type FinalizationStateTransitionValidatorInput = {
  contractVersion: FinalizationStateTransitionValidatorContractVersion;
  requestedAt: string;
  transitionInput?: FinalizationTransitionInput | null;
  validationResult?: FinalizationValidationResult | null;
  candidate?: FinalizationCandidate | null;
  sourceState: FinalizationTransitionSourceState;
  proposedTargetState: FinalizationTransitionTargetState;
  persistenceBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  executionRecordBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  statsPnlBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  tradeMutationBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  auditAppendBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  correctionRollbackBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  approvalContext?: FinalizationTransitionApprovalContext | null;
  auditContext?: FinalizationTransitionAuditContext | null;
  executionRecordCandidateMetadata?: ExecutionRecordCandidate | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationStateTransitionValidationResult = {
  contractVersion: FinalizationStateTransitionValidatorContractVersion;
  evaluatedAt: string;
  status: FinalizationStateTransitionValidationStatus;
  transitionInput?: FinalizationTransitionInput | null;
  validationResult?: FinalizationValidationResult | null;
  candidate?: FinalizationCandidate | null;
  sourceState: FinalizationTransitionSourceState;
  proposedTargetState: FinalizationTransitionTargetState;
  prerequisiteResults: FinalizationStateTransitionPrerequisiteResult[];
  blockedReasons: FinalizationStateTransitionBlockedReason[];
  warnings: FinalizationStateTransitionWarning[];
  decisionRecommendation: FinalizationStateTransitionDecisionRecommendation;
  sourceTargetCompatibility: FinalizationStateTransitionSourceTargetCompatibility;
  boundaryReadinessSummary: FinalizationStateTransitionBoundaryReadiness;
  auditCorrectionReadinessSummary: FinalizationStateTransitionAuditCorrectionReadiness;
  safetyPolicy: FinalizationStateTransitionSafetyPolicy;
  approvalContext?: FinalizationTransitionApprovalContext | null;
  executionRecordCandidateMetadata?: ExecutionRecordCandidate | null;
  safeToApplyTransition: false;
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

export const FINALIZATION_STATE_TRANSITION_VALIDATION_STATUS_METADATA = {
  transition_candidate_valid: {
    requiresManualReview: true,
    blocksTransitionApplication: true,
    reason:
      "Transition candidate may be valid for review, but validator contracts do not apply transitions.",
  },
  needs_review: {
    requiresManualReview: true,
    blocksTransitionApplication: true,
    reason:
      "Manual review is required before any future transition application boundary.",
  },
  blocked: {
    requiresManualReview: true,
    blocksTransitionApplication: true,
    reason:
      "Blocking evidence, prerequisite, authority, coupling, or boundary data is present.",
  },
  unsupported: {
    requiresManualReview: true,
    blocksTransitionApplication: true,
    reason: "The source/target pair or requested behavior is unsupported.",
  },
  not_ready: {
    requiresManualReview: true,
    blocksTransitionApplication: true,
    reason:
      "Required candidate, validation, boundary, approval, audit, or correction data is incomplete.",
  },
} as const satisfies Record<
  FinalizationStateTransitionValidationStatus,
  {
    requiresManualReview: true;
    blocksTransitionApplication: true;
    reason: string;
  }
>;
