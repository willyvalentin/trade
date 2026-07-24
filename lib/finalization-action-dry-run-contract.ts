import type {
  FinalizationActionInput,
  FinalizationActionResult,
} from "@/lib/finalization-action-contract";
import type {
  FinalizationActionValidationResult,
  FinalizationActionValidatorAuditCorrectionMetadata,
  FinalizationActionValidatorBoundaryMetadata,
  FinalizationActionValidatorManualApprovalContext,
} from "@/lib/finalization-action-validator-contract";
import type { FinalizationCandidate } from "@/lib/finalization-candidate-contract";
import type { ExecutionRecordCandidate } from "@/lib/execution-record-creation-contract";
import type {
  FinalizationTransitionApprovalContext,
  FinalizationTransitionAuditContext,
  FinalizationTransitionBoundaryStatus,
  FinalizationTransitionResult,
} from "@/lib/finalization-state-transition-contract";
import type { FinalizationStateTransitionValidationResult } from "@/lib/finalization-state-transition-validator-contract";
import type { FinalizationValidationResult } from "@/lib/finalization-validator-contract";

// Contract metadata only. These types describe a future Finalization Action
// Dry-run boundary. They do not implement dry-run logic, execute finalization
// actions, finalize, persist, create execution records, update stats/PnL,
// append audit records, rollback/correct, mutate trades, wire UI, capture
// broker evidence, automate browser/Avanza behavior, perform broker behavior,
// or run production runtime behavior.

export const FINALIZATION_ACTION_DRY_RUN_CONTRACT_VERSION =
  "finalization_action_dry_run_v1" as const;

export type FinalizationActionDryRunContractVersion =
  typeof FINALIZATION_ACTION_DRY_RUN_CONTRACT_VERSION;

export const FINALIZATION_ACTION_DRY_RUN_STATUSES = [
  "dry_run_ready",
  "dry_run_needs_review",
  "dry_run_blocked",
  "dry_run_unsupported",
  "dry_run_not_ready",
] as const;

export type FinalizationActionDryRunStatus =
  (typeof FINALIZATION_ACTION_DRY_RUN_STATUSES)[number];

export const FINALIZATION_ACTION_DRY_RUN_IMPACT_KINDS = [
  "finalization",
  "execution_record",
  "persistence",
  "stats_pnl",
  "audit",
  "correction",
  "trade_mutation",
] as const;

export type FinalizationActionDryRunImpactKind =
  (typeof FINALIZATION_ACTION_DRY_RUN_IMPACT_KINDS)[number];

export const FINALIZATION_ACTION_DRY_RUN_IMPACT_DISPOSITIONS = [
  "descriptive_only",
  "none",
  "out_of_scope",
  "blocked",
  "needs_review",
] as const;

export type FinalizationActionDryRunImpactDisposition =
  (typeof FINALIZATION_ACTION_DRY_RUN_IMPACT_DISPOSITIONS)[number];

export const FINALIZATION_ACTION_DRY_RUN_BLOCKED_REASONS = [
  "missing_finalization_action_validation",
  "missing_finalization_candidate",
  "missing_transition_validation",
  "missing_boundary_metadata",
  "missing_audit_correction_metadata",
  "manual_approval_missing",
  "unsafe_authority_flag",
  "unsupported_source",
  "unsupported_mode",
  "finalization_action_not_enabled",
  "write_boundary_unavailable",
] as const;

export type FinalizationActionDryRunBlockedReason =
  (typeof FINALIZATION_ACTION_DRY_RUN_BLOCKED_REASONS)[number];

export const FINALIZATION_ACTION_DRY_RUN_WARNINGS = [
  "dry_run_only",
  "proposed_impact_not_write",
  "manual_review_required",
  "audit_required_before_write",
  "future_write_boundary_required",
  "trade_mutation_out_of_scope",
  "stats_update_out_of_scope",
] as const;

export type FinalizationActionDryRunWarning =
  (typeof FINALIZATION_ACTION_DRY_RUN_WARNINGS)[number];

export type FinalizationActionDryRunSafetyPolicy = {
  dryRunOnly: true;
  safeToRunFinalizationAction: false;
  safeToFinalize: false;
  safeToPersist: false;
  safeToCreateExecutionRecord: false;
  safeToUpdateStats: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  automaticModeAllowed: false;
  dryRunImplementationEnabled: false;
  finalizationActionImplementationEnabled: false;
  finalizationImplementationEnabled: false;
  persistenceImplementationEnabled: false;
  executionRecordCreationEnabled: false;
  statsUpdateEnabled: false;
  auditAppendEnabled: false;
  rollbackImplementationEnabled: false;
  tradeMutationEnabled: false;
  browserAutomationEnabled: false;
  avanzaAutomationEnabled: false;
  brokerAutomationEnabled: false;
  policyReason: string;
};

export const FINALIZATION_ACTION_DRY_RUN_DEFAULT_SAFETY_POLICY = {
  dryRunOnly: true,
  safeToRunFinalizationAction: false,
  safeToFinalize: false,
  safeToPersist: false,
  safeToCreateExecutionRecord: false,
  safeToUpdateStats: false,
  safeToAppendAudit: false,
  safeToRollback: false,
  safeToMutateTrade: false,
  automaticModeAllowed: false,
  dryRunImplementationEnabled: false,
  finalizationActionImplementationEnabled: false,
  finalizationImplementationEnabled: false,
  persistenceImplementationEnabled: false,
  executionRecordCreationEnabled: false,
  statsUpdateEnabled: false,
  auditAppendEnabled: false,
  rollbackImplementationEnabled: false,
  tradeMutationEnabled: false,
  browserAutomationEnabled: false,
  avanzaAutomationEnabled: false,
  brokerAutomationEnabled: false,
  policyReason:
    "Finalization action dry-run contract types are descriptive only and do not implement or approve dry-run execution, finalization action execution, finalization, persistence, execution-record creation, stats/PnL updates, audit append, rollback/correction, trade mutation, browser automation, Avanza behavior, broker behavior, or automatic production behavior.",
} as const satisfies FinalizationActionDryRunSafetyPolicy;

export type FinalizationActionDryRunValidationSummary = {
  validationResultPresent: boolean;
  validationStatus?: FinalizationActionValidationResult["status"] | null;
  finalizationValidationStatus?: FinalizationValidationResult["status"] | null;
  transitionValidationStatus?:
    | FinalizationStateTransitionValidationResult["status"]
    | null;
  actionCandidateValid: boolean;
  requiresManualReview: boolean;
  blockedReasons: FinalizationActionDryRunBlockedReason[];
  warnings: FinalizationActionDryRunWarning[];
  metadata?: Record<string, unknown>;
};

export type FinalizationActionDryRunProposedImpact = {
  kind: FinalizationActionDryRunImpactKind;
  disposition: FinalizationActionDryRunImpactDisposition;
  descriptiveOnly: true;
  proposed: boolean;
  safeToApply: false;
  blockedReasons?: FinalizationActionDryRunBlockedReason[];
  warnings?: FinalizationActionDryRunWarning[];
  summary?: string | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationActionDryRunFinalizationImpact =
  FinalizationActionDryRunProposedImpact & {
    kind: "finalization";
    candidateId?: string | null;
    currentState?: string | null;
    proposedTargetState?: string | null;
    transitionResult?: FinalizationTransitionResult | null;
    finalizationWouldBeMarkedComplete: boolean;
    finalizationAttempted: false;
  };

export type FinalizationActionDryRunExecutionRecordImpact =
  FinalizationActionDryRunProposedImpact & {
    kind: "execution_record";
    executionRecordCandidate?: ExecutionRecordCandidate | null;
    proposedRecordFingerprint?: string | null;
    proposedIdempotencyKey?: string | null;
    wouldCreateExecutionRecord: boolean;
    wouldUpdateExecutionRecord: boolean;
    executionRecordCreationAttempted: false;
  };

export type FinalizationActionDryRunPersistenceImpact =
  FinalizationActionDryRunProposedImpact & {
    kind: "persistence";
    targetBoundary?: FinalizationTransitionBoundaryStatus | null;
    proposedStorageTarget?: string | null;
    proposedRecordFingerprint?: string | null;
    wouldPersist: boolean;
    persistenceAttempted: false;
  };

export type FinalizationActionDryRunStatsPnLImpact =
  FinalizationActionDryRunProposedImpact & {
    kind: "stats_pnl";
    proposedQuantity?: number | null;
    proposedExecutionPrice?: number | null;
    proposedFees?: number | null;
    proposedFxRate?: number | null;
    proposedRealizedPnl?: number | null;
    proposedCurrency?: string | null;
    wouldUpdateStats: boolean;
    statsUpdateAttempted: false;
  };

export type FinalizationActionDryRunAuditImpact =
  FinalizationActionDryRunProposedImpact & {
    kind: "audit";
    auditContext?: FinalizationTransitionAuditContext | null;
    proposedAuditEventTypes: string[];
    sourceEvidenceReferences: string[];
    beforeStateReference?: string | null;
    afterStateReference?: string | null;
    manualApprovalReference?: string | null;
    wouldAppendAudit: boolean;
    auditAppendAttempted: false;
  };

export type FinalizationActionDryRunCorrectionImpact =
  FinalizationActionDryRunProposedImpact & {
    kind: "correction";
    correctionStrategyReference?: string | null;
    rollbackOrAmendmentPathReference?: string | null;
    duplicateCorrectionPreventionReference?: string | null;
    correctionAuditTrailReference?: string | null;
    wouldRollback: boolean;
    wouldCorrect: boolean;
    rollbackAttempted: false;
  };

export type FinalizationActionDryRunTradeMutationImpact =
  FinalizationActionDryRunProposedImpact & {
    kind: "trade_mutation";
    disposition: "none" | "out_of_scope";
    proposed: false;
    wouldMutateTrade: false;
    tradeMutationAttempted: false;
    outOfScopeReason: string;
  };

export type FinalizationActionDryRunImpactSummary = {
  finalizationImpact: FinalizationActionDryRunFinalizationImpact;
  executionRecordImpact: FinalizationActionDryRunExecutionRecordImpact;
  persistenceImpact: FinalizationActionDryRunPersistenceImpact;
  statsPnlImpact: FinalizationActionDryRunStatsPnLImpact;
  auditImpact: FinalizationActionDryRunAuditImpact;
  correctionImpact: FinalizationActionDryRunCorrectionImpact;
  tradeMutationImpact: FinalizationActionDryRunTradeMutationImpact;
  allImpactsDescriptiveOnly: true;
  writesAttempted: false;
  metadata?: Record<string, unknown>;
};

export type FinalizationActionDryRunInput = {
  contractVersion: FinalizationActionDryRunContractVersion;
  requestedAt: string;
  actionInput?: FinalizationActionInput | null;
  actionResult?: FinalizationActionResult | null;
  actionValidationResult?: FinalizationActionValidationResult | null;
  candidate?: FinalizationCandidate | null;
  finalizationValidationResult?: FinalizationValidationResult | null;
  transitionValidationResult?: FinalizationStateTransitionValidationResult | null;
  transitionResult?: FinalizationTransitionResult | null;
  executionRecordCandidateMetadata?: ExecutionRecordCandidate | null;
  boundaryMetadata?: FinalizationActionValidatorBoundaryMetadata | null;
  persistenceBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  executionRecordBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  statsPnlBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  auditAppendBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  correctionRollbackBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  tradeMutationBoundaryStatus?: FinalizationTransitionBoundaryStatus | null;
  auditCorrectionMetadata?: FinalizationActionValidatorAuditCorrectionMetadata | null;
  auditContext?: FinalizationTransitionAuditContext | null;
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  approvalContext?: FinalizationTransitionApprovalContext | null;
  metadata?: Record<string, unknown>;
};

export type FinalizationActionDryRunResult = {
  contractVersion: FinalizationActionDryRunContractVersion;
  evaluatedAt: string;
  status: FinalizationActionDryRunStatus;
  actionInput?: FinalizationActionInput | null;
  actionResult?: FinalizationActionResult | null;
  actionValidationResult?: FinalizationActionValidationResult | null;
  candidate?: FinalizationCandidate | null;
  finalizationValidationResult?: FinalizationValidationResult | null;
  transitionValidationResult?: FinalizationStateTransitionValidationResult | null;
  transitionResult?: FinalizationTransitionResult | null;
  executionRecordCandidateMetadata?: ExecutionRecordCandidate | null;
  validationSummary: FinalizationActionDryRunValidationSummary;
  impactSummary: FinalizationActionDryRunImpactSummary;
  blockedReasons: FinalizationActionDryRunBlockedReason[];
  warnings: FinalizationActionDryRunWarning[];
  safetyPolicy: FinalizationActionDryRunSafetyPolicy;
  dryRunOnly: true;
  safeToRunFinalizationAction: false;
  safeToFinalize: false;
  safeToPersist: false;
  safeToCreateExecutionRecord: false;
  safeToUpdateStats: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  automaticModeAllowed: false;
  dryRunExecuted: false;
  finalizationActionAttempted: false;
  finalizationAttempted: false;
  persistenceAttempted: false;
  executionRecordCreationAttempted: false;
  statsUpdateAttempted: false;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  tradeMutationAttempted: false;
  browserAutomationAttempted: false;
  avanzaAutomationAttempted: false;
  brokerAutomationAttempted: false;
  metadata?: Record<string, unknown>;
};

export const FINALIZATION_ACTION_DRY_RUN_STATUS_METADATA = {
  dry_run_ready: {
    requiresManualReview: true,
    blocksWrites: true,
    reason:
      "Dry-run can describe proposed impacts, but it cannot run finalization actions or writes.",
  },
  dry_run_needs_review: {
    requiresManualReview: true,
    blocksWrites: true,
    reason:
      "Dry-run metadata requires review before any future action boundary.",
  },
  dry_run_blocked: {
    requiresManualReview: true,
    blocksWrites: true,
    reason:
      "Blocking validation, candidate, boundary, audit/correction, authority, or support metadata is present.",
  },
  dry_run_unsupported: {
    requiresManualReview: true,
    blocksWrites: true,
    reason: "The dry-run source, broker, mode, or behavior is unsupported.",
  },
  dry_run_not_ready: {
    requiresManualReview: true,
    blocksWrites: true,
    reason:
      "Required action validation, candidate, transition, boundary, approval, audit, or correction metadata is incomplete.",
  },
} as const satisfies Record<
  FinalizationActionDryRunStatus,
  {
    requiresManualReview: true;
    blocksWrites: true;
    reason: string;
  }
>;
