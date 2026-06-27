import type {
  ExecutionRecordPostInsertBoundaryInput,
  ExecutionRecordPostInsertBoundaryResult,
} from "@/lib/execution-record-post-insert-boundary-contract";
import type {
  ExecutionRecordPostInsertBoundaryValidationResult,
} from "@/lib/execution-record-post-insert-boundary-validator-contract";
import type {
  ExecutionRecordProductionInsertRouteBoundaryInput,
  ExecutionRecordProductionInsertRouteBoundaryResult,
} from "@/lib/execution-record-production-insert-route-boundary-contract";
import type {
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceAuditMetadata,
  ExecutionRecordPersistenceInput,
  ExecutionRecordPersistenceSchemaReference,
  PersistedExecutionRecordReference,
} from "@/lib/execution-record-persistence-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Post-insert orchestrator contract metadata only. These types and constants
// do not implement an orchestrator, execute post-insert actions, call routes,
// create execution records, persist/write records, write Supabase/localStorage,
// append audit, update stats/PnL, roll back/correct, mutate or reconcile
// trades, update UI, notify users, run broker/order behavior, automate
// Avanza/browser behavior, or enable automatic mode. Insert success is not full
// workflow completion, validator readiness is not orchestration approval, and
// the orchestrator cannot self-grant authority.

export const EXECUTION_RECORD_POST_INSERT_ORCHESTRATOR_CONTRACT_VERSION =
  "execution_record_post_insert_orchestrator_v1" as const;

export type ExecutionRecordPostInsertOrchestratorContractVersion =
  typeof EXECUTION_RECORD_POST_INSERT_ORCHESTRATOR_CONTRACT_VERSION;

export const EXECUTION_RECORD_POST_INSERT_ORCHESTRATOR_STATUSES = [
  "post_insert_orchestrator_contract_only",
  "post_insert_orchestrator_blocked",
  "post_insert_orchestrator_needs_review",
  "post_insert_orchestrator_invalid",
  "post_insert_orchestrator_absent",
] as const;

export type ExecutionRecordPostInsertOrchestratorStatus =
  (typeof EXECUTION_RECORD_POST_INSERT_ORCHESTRATOR_STATUSES)[number];

export const EXECUTION_RECORD_POST_INSERT_ORCHESTRATOR_DECISION_RECOMMENDATIONS =
  [
    "contract_only_do_not_orchestrate",
    "blocked_do_not_orchestrate",
    "needs_manual_review",
    "invalid_do_not_orchestrate",
    "future_orchestrator_boundary_required",
  ] as const;

export type ExecutionRecordPostInsertOrchestratorDecisionRecommendation =
  (typeof EXECUTION_RECORD_POST_INSERT_ORCHESTRATOR_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_POST_INSERT_ORCHESTRATOR_BLOCKED_REASONS = [
  "production_insert_result_missing",
  "execution_record_reference_missing",
  "execution_record_evidence_missing",
  "post_insert_validator_result_missing",
  "post_insert_boundary_result_missing",
  "orchestrator_authority_missing",
  "orchestrator_attempted_to_self_grant_authority",
  "audit_boundary_not_authorized",
  "stats_pnl_boundary_not_authorized",
  "trade_reconciliation_boundary_not_authorized",
  "correction_rollback_boundary_not_authorized",
  "failure_recovery_boundary_not_authorized",
  "ui_state_boundary_not_authorized",
  "notification_boundary_not_authorized",
  "broker_order_boundary_not_authorized",
  "avanza_browser_boundary_not_authorized",
  "generated_types_absent_or_unknown",
  "migration_application_not_proven",
  "rls_security_unverified",
  "server_only_boundary_unverified",
  "idempotency_missing",
  "duplicate_prevention_missing",
  "evidence_provenance_missing",
  "partial_failure_model_missing",
  "automatic_mode_requested",
  "post_insert_action_requested_in_contract_phase",
] as const;

export type ExecutionRecordPostInsertOrchestratorBlockedReason =
  (typeof EXECUTION_RECORD_POST_INSERT_ORCHESTRATOR_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_POST_INSERT_ORCHESTRATOR_WARNINGS = [
  "contract_only",
  "orchestrator_not_implemented",
  "post_insert_actions_not_implemented",
  "orchestrator_cannot_self_grant_authority",
  "insert_success_not_full_workflow_completion",
  "validator_readiness_not_orchestration_approval",
  "audit_append_not_automatic",
  "stats_pnl_update_not_automatic",
  "trade_reconciliation_not_automatic",
  "rollback_not_automatic",
  "ui_update_not_automatic",
  "notification_not_automatic",
  "broker_order_follow_up_not_automatic",
  "avanza_browser_follow_up_not_automatic",
  "automatic_mode_not_enabled",
  "idempotency_required",
  "duplicate_prevention_required",
  "partial_failure_must_be_visible",
  "manual_review_may_be_required",
] as const;

export type ExecutionRecordPostInsertOrchestratorWarning =
  (typeof EXECUTION_RECORD_POST_INSERT_ORCHESTRATOR_WARNINGS)[number];

export const EXECUTION_RECORD_POST_INSERT_ORCHESTRATOR_REVIEW_ITEMS = [
  "post_insert_orchestrator_contract_review",
  "production_insert_result_review",
  "execution_record_reference_review",
  "execution_record_evidence_review",
  "post_insert_validator_result_review",
  "post_insert_boundary_result_review",
  "authority_model_review",
  "audit_append_orchestration_review",
  "stats_pnl_orchestration_review",
  "trade_reconciliation_orchestration_review",
  "correction_rollback_orchestration_review",
  "failure_recovery_orchestration_review",
  "ui_state_orchestration_review",
  "notification_orchestration_review",
  "broker_order_follow_up_orchestration_review",
  "avanza_browser_follow_up_orchestration_review",
  "generated_types_review",
  "migration_application_review",
  "rls_security_review",
  "server_only_boundary_review",
  "idempotency_review",
  "duplicate_prevention_review",
  "partial_failure_review",
  "manual_review",
] as const;

export type ExecutionRecordPostInsertOrchestratorReviewItem =
  (typeof EXECUTION_RECORD_POST_INSERT_ORCHESTRATOR_REVIEW_ITEMS)[number];

export type ExecutionRecordPostInsertOrchestratorAuthorityFlags = {
  contractOnly: true;
  orchestratorImplemented: false;
  orchestrationAllowed: false;
  orchestratorCanSelfGrantAuthority: false;
  postInsertActionsImplemented: false;
  postInsertActionsAllowed: false;
  auditAppendAllowed: false;
  statsPnlUpdateAllowed: false;
  tradeMutationAllowed: false;
  tradeReconciliationAllowed: false;
  correctionRollbackAllowed: false;
  failureRecoveryAllowed: false;
  uiStateMutationAllowed: false;
  userNotificationAllowed: false;
  brokerOrderFollowUpAllowed: false;
  avanzaBrowserFollowUpAllowed: false;
  safeToAppendAudit: false;
  safeToUpdateStats: false;
  safeToMutateTrade: false;
  safeToReconcileTrade: false;
  safeToRollback: false;
  safeToRecoverFailure: false;
  safeToUpdateUiState: false;
  safeToNotifyUser: false;
  safeToRunBrokerAction: false;
  safeToRunAvanzaBrowserAction: false;
  automaticModeAllowed: false;
};

export const EXECUTION_RECORD_POST_INSERT_ORCHESTRATOR_DEFAULT_AUTHORITY_FLAGS =
  {
    contractOnly: true,
    orchestratorImplemented: false,
    orchestrationAllowed: false,
    orchestratorCanSelfGrantAuthority: false,
    postInsertActionsImplemented: false,
    postInsertActionsAllowed: false,
    auditAppendAllowed: false,
    statsPnlUpdateAllowed: false,
    tradeMutationAllowed: false,
    tradeReconciliationAllowed: false,
    correctionRollbackAllowed: false,
    failureRecoveryAllowed: false,
    uiStateMutationAllowed: false,
    userNotificationAllowed: false,
    brokerOrderFollowUpAllowed: false,
    avanzaBrowserFollowUpAllowed: false,
    safeToAppendAudit: false,
    safeToUpdateStats: false,
    safeToMutateTrade: false,
    safeToReconcileTrade: false,
    safeToRollback: false,
    safeToRecoverFailure: false,
    safeToUpdateUiState: false,
    safeToNotifyUser: false,
    safeToRunBrokerAction: false,
    safeToRunAvanzaBrowserAction: false,
    automaticModeAllowed: false,
  } as const satisfies ExecutionRecordPostInsertOrchestratorAuthorityFlags;

export type ExecutionRecordPostInsertOrchestratorSafetyPolicy =
  ExecutionRecordPostInsertOrchestratorAuthorityFlags & {
    insertSuccessIsFullWorkflowCompletion: false;
    validatorReadinessIsOrchestrationApproval: false;
    orchestrationReadinessIsActionExecution: false;
    eachCategoryRequiresSeparateBoundary: true;
    eachCategoryRequiresSeparateAuthority: true;
    auditAppendSeparateFromStatsPnlUpdate: true;
    statsPnlUpdateSeparateFromTradeReconciliation: true;
    tradeReconciliationSeparateFromCorrectionRollback: true;
    uiUpdateSeparateFromDatabaseWrite: true;
    notificationSeparateFromBrokerOrderExecution: true;
    brokerAvanzaDisabledUnlessSeparatelyApproved: true;
    idempotencyRequired: true;
    duplicatePreventionRequired: true;
    evidenceProvenanceRequired: true;
    partialFailureMustBeVisible: true;
    manualReviewSupported: true;
    noHiddenAutomaticMode: true;
    policyReason: string;
  };

export const EXECUTION_RECORD_POST_INSERT_ORCHESTRATOR_DEFAULT_SAFETY_POLICY =
  {
    ...EXECUTION_RECORD_POST_INSERT_ORCHESTRATOR_DEFAULT_AUTHORITY_FLAGS,
    insertSuccessIsFullWorkflowCompletion: false,
    validatorReadinessIsOrchestrationApproval: false,
    orchestrationReadinessIsActionExecution: false,
    eachCategoryRequiresSeparateBoundary: true,
    eachCategoryRequiresSeparateAuthority: true,
    auditAppendSeparateFromStatsPnlUpdate: true,
    statsPnlUpdateSeparateFromTradeReconciliation: true,
    tradeReconciliationSeparateFromCorrectionRollback: true,
    uiUpdateSeparateFromDatabaseWrite: true,
    notificationSeparateFromBrokerOrderExecution: true,
    brokerAvanzaDisabledUnlessSeparatelyApproved: true,
    idempotencyRequired: true,
    duplicatePreventionRequired: true,
    evidenceProvenanceRequired: true,
    partialFailureMustBeVisible: true,
    manualReviewSupported: true,
    noHiddenAutomaticMode: true,
    policyReason:
      "Post-insert orchestrator contracts are contract-only. The orchestrator is not implemented, cannot self-grant authority, cannot execute actions by contract alone, and insert success is not full workflow completion.",
  } as const satisfies ExecutionRecordPostInsertOrchestratorSafetyPolicy;

export type ExecutionRecordPostInsertOrchestratorEvidenceSummary = {
  productionInsertRouteResultMetadata?: Record<string, unknown> | null;
  productionInsertBoundaryInput?: ExecutionRecordProductionInsertRouteBoundaryInput | null;
  productionInsertBoundaryResult?: ExecutionRecordProductionInsertRouteBoundaryResult | null;
  insertedExecutionRecordSummary?: Record<string, unknown> | null;
  executionRecordId?: string | null;
  executionRecordReference?: PersistedExecutionRecordReference | null;
  normalizedExecutionRecordInput?: ExecutionRecordPersistenceInput | null;
  schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
  postInsertBoundaryInput?: ExecutionRecordPostInsertBoundaryInput | null;
  postInsertBoundaryResult?: ExecutionRecordPostInsertBoundaryResult | null;
  postInsertValidatorResult?: ExecutionRecordPostInsertBoundaryValidationResult | null;
  executionRecordEvidencePresent: boolean;
  evidenceProvenancePresent: boolean;
  finalBrokerEvidenceIdentifiersPresent: boolean;
  generatedTypesProofPresent: boolean;
  migrationProofPresent: boolean;
  rlsSecurityProofPresent: boolean;
  serverOnlyProofPresent: boolean;
  sourceReferences: string[];
  blockedReasons: ExecutionRecordPostInsertOrchestratorBlockedReason[];
  warnings: ExecutionRecordPostInsertOrchestratorWarning[];
  reviewItems: ExecutionRecordPostInsertOrchestratorReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertOrchestratorIdempotencySummary = {
  executionRecordId?: string | null;
  idempotencyKey?: string | null;
  idempotencyFingerprint?: string | null;
  categoryActionKeys: Record<string, string | null>;
  idempotencyMetadataPresent: boolean;
  duplicatePreventionMetadataPresent: boolean;
  duplicateMatches: ExecutionRecordDuplicateMatch[];
  duplicateAuditAppendPrevented: boolean;
  duplicateStatsPnlUpdatePrevented: boolean;
  duplicateTradeReconciliationPrevented: boolean;
  duplicateNotificationPrevented: boolean;
  duplicateBrokerAvanzaAttemptPrevented: boolean;
  safeToRetry: false;
  retryRequiresManualReview: true;
  blockedReasons: ExecutionRecordPostInsertOrchestratorBlockedReason[];
  warnings: ExecutionRecordPostInsertOrchestratorWarning[];
  reviewItems: ExecutionRecordPostInsertOrchestratorReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertOrchestratorDependencySummary = {
  generatedTypesPresent: boolean;
  migrationApplicationProven: boolean;
  rlsSecurityVerified: boolean;
  serverOnlyBoundaryVerified: boolean;
  productionInsertRouteImplemented: boolean;
  productionInsertWritePathPresent: boolean;
  postInsertBoundaryContractPresent: boolean;
  postInsertValidatorPresent: boolean;
  orchestratorImplementationPresent: false;
  postInsertActionsImplemented: false;
  auditAppendBoundaryPresent: boolean;
  statsPnlUpdateBoundaryPresent: boolean;
  tradeReconciliationBoundaryPresent: boolean;
  correctionRollbackBoundaryPresent: boolean;
  failureRecoveryBoundaryPresent: boolean;
  uiStateBoundaryPresent: boolean;
  notificationBoundaryPresent: boolean;
  brokerOrderBoundaryPresent: boolean;
  avanzaBrowserBoundaryPresent: boolean;
  blockedReasons: ExecutionRecordPostInsertOrchestratorBlockedReason[];
  warnings: ExecutionRecordPostInsertOrchestratorWarning[];
  reviewItems: ExecutionRecordPostInsertOrchestratorReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertOrchestratorPartialFailureSummary = {
  partialFailureModelPresent: boolean;
  insertSucceededPostInsertBlockedRepresented: boolean;
  auditSucceededStatsBlockedRepresented: boolean;
  statsSucceededTradeReconciliationBlockedRepresented: boolean;
  uiUpdateBlockedRepresented: boolean;
  notificationBlockedRepresented: boolean;
  brokerAvanzaBlockedRepresented: boolean;
  hiddenPartialFailureAllowed: false;
  manualReviewRequiredForPartialFailure: true;
  blockedReasons: ExecutionRecordPostInsertOrchestratorBlockedReason[];
  warnings: ExecutionRecordPostInsertOrchestratorWarning[];
  reviewItems: ExecutionRecordPostInsertOrchestratorReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertOrchestratorOrderingSummary = {
  insertResultReceived: boolean;
  postInsertValidatorChecked: boolean;
  auditBoundaryEvaluatedSeparately: boolean;
  statsPnlBoundaryEvaluatedSeparately: boolean;
  tradeReconciliationBoundaryEvaluatedSeparately: boolean;
  uiBoundaryEvaluatedSeparately: boolean;
  notificationBoundaryEvaluatedSeparately: boolean;
  brokerAvanzaBoundariesBlockedByDefault: true;
  noCategoryRunsWithoutAuthority: true;
  orderingIsExecution: false;
  blockedReasons: ExecutionRecordPostInsertOrchestratorBlockedReason[];
  warnings: ExecutionRecordPostInsertOrchestratorWarning[];
  reviewItems: ExecutionRecordPostInsertOrchestratorReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertOrchestratorCategoryStatus =
  | "category_contract_only"
  | "category_allowed_by_boundary_only"
  | "category_blocked"
  | "category_needs_review"
  | "category_skipped"
  | "category_failed";

export type ExecutionRecordPostInsertOrchestratorCategoryCoordinationSummary = {
  categoryName: string;
  status: ExecutionRecordPostInsertOrchestratorCategoryStatus;
  categoryBoundaryPresent: boolean;
  categoryBoundaryAuthorized: boolean;
  categoryAuthorityRequired: true;
  categoryActionImplemented: false;
  categoryActionAttempted: false;
  categoryActionSucceeded: false;
  categoryActionFailed: false;
  categorySkipped: boolean;
  actionExecutionAllowed: false;
  actionAuthorityAllowed: false;
  orchestratorSelfGrantedAuthority: false;
  insertSuccessApprovesCategory: false;
  validatorReadinessApprovesCategory: false;
  evidencePresent: boolean;
  idempotencyPresent: boolean;
  duplicatePreventionPresent: boolean;
  blockedReasons: ExecutionRecordPostInsertOrchestratorBlockedReason[];
  warnings: ExecutionRecordPostInsertOrchestratorWarning[];
  reviewItems: ExecutionRecordPostInsertOrchestratorReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendOrchestrationSummary =
  ExecutionRecordPostInsertOrchestratorCategoryCoordinationSummary & {
    categoryName: "audit_append";
    auditAppendAllowed: false;
    safeToAppendAudit: false;
    statsPnlAuthority: false;
    tradeMutationAuthority: false;
  };

export type ExecutionRecordStatsPnlUpdateOrchestrationSummary =
  ExecutionRecordPostInsertOrchestratorCategoryCoordinationSummary & {
    categoryName: "stats_pnl_update";
    statsPnlUpdateAllowed: false;
    safeToUpdateStats: false;
    auditAppendAuthority: false;
    tradeMutationAuthority: false;
  };

export type ExecutionRecordTradeReconciliationOrchestrationSummary =
  ExecutionRecordPostInsertOrchestratorCategoryCoordinationSummary & {
    categoryName: "trade_reconciliation";
    tradeReconciliationAllowed: false;
    tradeMutationAllowed: false;
    safeToReconcileTrade: false;
    safeToMutateTrade: false;
    brokerOrderAuthority: false;
    avanzaBrowserAuthority: false;
  };

export type ExecutionRecordCorrectionRollbackOrchestrationSummary =
  ExecutionRecordPostInsertOrchestratorCategoryCoordinationSummary & {
    categoryName: "correction_rollback";
    correctionRollbackAllowed: false;
    safeToRollback: false;
    originalInsertMutationAllowed: false;
  };

export type ExecutionRecordFailureRecoveryOrchestrationSummary =
  ExecutionRecordPostInsertOrchestratorCategoryCoordinationSummary & {
    categoryName: "failure_recovery";
    failureRecoveryAllowed: false;
    safeToRecoverFailure: false;
    normalSuccessPathAuthority: false;
  };

export type ExecutionRecordUiStateUpdateOrchestrationSummary =
  ExecutionRecordPostInsertOrchestratorCategoryCoordinationSummary & {
    categoryName: "ui_state_update";
    uiStateMutationAllowed: false;
    safeToUpdateUiState: false;
    localOnlySourceOfTruthAllowed: false;
  };

export type ExecutionRecordUserNotificationOrchestrationSummary =
  ExecutionRecordPostInsertOrchestratorCategoryCoordinationSummary & {
    categoryName: "user_notification";
    userNotificationAllowed: false;
    safeToNotifyUser: false;
    brokerOrderExecutionImplicationAllowed: false;
    avanzaBrowserCompletionImplicationAllowed: false;
  };

export type ExecutionRecordBrokerOrderFollowUpOrchestrationSummary =
  ExecutionRecordPostInsertOrchestratorCategoryCoordinationSummary & {
    categoryName: "broker_order_follow_up";
    brokerOrderFollowUpAllowed: false;
    safeToRunBrokerAction: false;
    kopSaljTriggerAllowed: false;
    automaticModeApprovalAllowed: false;
    disabledUnlessSeparatelyApproved: true;
  };

export type ExecutionRecordAvanzaBrowserFollowUpOrchestrationSummary =
  ExecutionRecordPostInsertOrchestratorCategoryCoordinationSummary & {
    categoryName: "avanza_browser_follow_up";
    avanzaBrowserFollowUpAllowed: false;
    safeToRunAvanzaBrowserAction: false;
    browserActionAllowed: false;
    kopSaljTriggerAllowed: false;
    automaticModeApprovalAllowed: false;
    disabledUnlessSeparatelyApproved: true;
  };

export type ExecutionRecordPostInsertOrchestratorCategorySummaries = {
  auditAppend: ExecutionRecordAuditAppendOrchestrationSummary;
  statsPnlUpdate: ExecutionRecordStatsPnlUpdateOrchestrationSummary;
  tradeReconciliation: ExecutionRecordTradeReconciliationOrchestrationSummary;
  correctionRollback: ExecutionRecordCorrectionRollbackOrchestrationSummary;
  failureRecovery: ExecutionRecordFailureRecoveryOrchestrationSummary;
  uiStateUpdate: ExecutionRecordUiStateUpdateOrchestrationSummary;
  userNotification: ExecutionRecordUserNotificationOrchestrationSummary;
  brokerOrderFollowUp: ExecutionRecordBrokerOrderFollowUpOrchestrationSummary;
  avanzaBrowserFollowUp: ExecutionRecordAvanzaBrowserFollowUpOrchestrationSummary;
};

export type ExecutionRecordPostInsertOrchestratorInput = {
  contractVersion: ExecutionRecordPostInsertOrchestratorContractVersion;
  requestedAt: string;
  requestedBy?: string | null;
  productionInsertRouteResultMetadata?: Record<string, unknown> | null;
  productionInsertBoundaryInput?: ExecutionRecordProductionInsertRouteBoundaryInput | null;
  productionInsertBoundaryResult?: ExecutionRecordProductionInsertRouteBoundaryResult | null;
  insertedExecutionRecordSummary?: Record<string, unknown> | null;
  executionRecordId?: string | null;
  executionRecordReference?: PersistedExecutionRecordReference | null;
  executionRecordEvidence?: ExecutionRecordPostInsertOrchestratorEvidenceSummary | null;
  normalizedExecutionRecordInput?: ExecutionRecordPersistenceInput | null;
  postInsertBoundaryInput?: ExecutionRecordPostInsertBoundaryInput | null;
  postInsertBoundaryResult?: ExecutionRecordPostInsertBoundaryResult | null;
  postInsertValidatorResult?: ExecutionRecordPostInsertBoundaryValidationResult | null;
  generatedTypesProof?: Record<string, unknown> | null;
  migrationProof?: Record<string, unknown> | null;
  rlsSecurityProof?: Record<string, unknown> | null;
  serverOnlyProof?: Record<string, unknown> | null;
  currentTradeState?: Record<string, unknown> | null;
  auditCorrectionMetadata?: ExecutionRecordPersistenceAuditMetadata | null;
  statsPnlCalculationSource?: Record<string, unknown> | null;
  uiStateSourceOfTruth?: Record<string, unknown> | null;
  notificationContext?: Record<string, unknown> | null;
  brokerOrderMetadata?: Record<string, unknown> | null;
  avanzaBrowserMetadata?: Record<string, unknown> | null;
  idempotency: ExecutionRecordPostInsertOrchestratorIdempotencySummary;
  duplicatePrevention?: Record<string, unknown> | null;
  partialFailureMetadata?: ExecutionRecordPostInsertOrchestratorPartialFailureSummary | null;
  manualReviewMetadata?: FinalizationActionValidatorManualApprovalContext | null;
  categorySummaries: ExecutionRecordPostInsertOrchestratorCategorySummaries;
  orderingSummary: ExecutionRecordPostInsertOrchestratorOrderingSummary;
  dependencySummary: ExecutionRecordPostInsertOrchestratorDependencySummary;
  authority: ExecutionRecordPostInsertOrchestratorAuthorityFlags;
  safetyPolicy: ExecutionRecordPostInsertOrchestratorSafetyPolicy;
  blockedReasons: ExecutionRecordPostInsertOrchestratorBlockedReason[];
  warnings: ExecutionRecordPostInsertOrchestratorWarning[];
  reviewItems: ExecutionRecordPostInsertOrchestratorReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertOrchestratorResult = {
  contractVersion: ExecutionRecordPostInsertOrchestratorContractVersion;
  status: ExecutionRecordPostInsertOrchestratorStatus;
  decisionRecommendation: ExecutionRecordPostInsertOrchestratorDecisionRecommendation;
  contractOnly: true;
  orchestratorImplemented: false;
  orchestrationAllowed: false;
  orchestratorCanSelfGrantAuthority: false;
  insertSuccessIsFullWorkflowCompletion: false;
  validatorReadinessIsOrchestrationApproval: false;
  orchestrationReadinessIsActionExecution: false;
  allowedCategories: Array<keyof ExecutionRecordPostInsertOrchestratorCategorySummaries>;
  blockedCategories: Array<keyof ExecutionRecordPostInsertOrchestratorCategorySummaries>;
  reviewCategories: Array<keyof ExecutionRecordPostInsertOrchestratorCategorySummaries>;
  skippedCategories: Array<keyof ExecutionRecordPostInsertOrchestratorCategorySummaries>;
  failureCategories: Array<keyof ExecutionRecordPostInsertOrchestratorCategorySummaries>;
  categorySummaries: ExecutionRecordPostInsertOrchestratorCategorySummaries;
  evidence: ExecutionRecordPostInsertOrchestratorEvidenceSummary;
  idempotency: ExecutionRecordPostInsertOrchestratorIdempotencySummary;
  dependencies: ExecutionRecordPostInsertOrchestratorDependencySummary;
  partialFailure: ExecutionRecordPostInsertOrchestratorPartialFailureSummary;
  ordering: ExecutionRecordPostInsertOrchestratorOrderingSummary;
  recommendedNextManualReview?: string | null;
  authority: ExecutionRecordPostInsertOrchestratorAuthorityFlags;
  safetyPolicy: ExecutionRecordPostInsertOrchestratorSafetyPolicy;
  blockedReasons: ExecutionRecordPostInsertOrchestratorBlockedReason[];
  warnings: ExecutionRecordPostInsertOrchestratorWarning[];
  reviewItems: ExecutionRecordPostInsertOrchestratorReviewItem[];
  metadata?: Record<string, unknown>;
};

