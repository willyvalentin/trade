import type {
  ExecutionRecordInsertRouteCallResult,
} from "@/lib/execution-record-insert-route-call-implementation-contract";
import type {
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceAuditMetadata,
  ExecutionRecordPersistenceInput,
  ExecutionRecordPersistenceSchemaReference,
  PersistedExecutionRecordReference,
} from "@/lib/execution-record-persistence-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Post-insert boundary contract metadata only. These types and constants make
// explicit that an execution-record insert result is not approval to run audit,
// stats/PnL, trade mutation, correction/rollback, UI, notification,
// broker/order, or Avanza/browser follow-up behavior. They do not implement
// validators, orchestrators, route calls, Supabase/localStorage writes, audit
// appends, stats/PnL updates, rollback/correction, trade mutation, UI wiring,
// broker/order behavior, Avanza/browser behavior, or automatic mode.

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_CONTRACT_VERSION =
  "execution_record_post_insert_boundary_v1" as const;

export type ExecutionRecordPostInsertBoundaryContractVersion =
  typeof EXECUTION_RECORD_POST_INSERT_BOUNDARY_CONTRACT_VERSION;

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_STATUSES = [
  "post_insert_boundary_contract_only",
  "post_insert_boundary_blocked",
  "post_insert_boundary_needs_review",
  "post_insert_boundary_invalid",
  "post_insert_boundary_absent",
] as const;

export type ExecutionRecordPostInsertBoundaryStatus =
  (typeof EXECUTION_RECORD_POST_INSERT_BOUNDARY_STATUSES)[number];

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_DECISION_RECOMMENDATIONS =
  [
    "contract_only_do_not_run_post_insert_actions",
    "blocked_do_not_run_post_insert_actions",
    "needs_manual_review",
    "invalid_do_not_run_post_insert_actions",
    "future_boundary_required",
  ] as const;

export type ExecutionRecordPostInsertBoundaryDecisionRecommendation =
  (typeof EXECUTION_RECORD_POST_INSERT_BOUNDARY_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_BLOCKED_REASONS = [
  "execution_record_insert_not_proven",
  "execution_record_evidence_missing",
  "audit_boundary_missing",
  "stats_pnl_boundary_missing",
  "trade_reconciliation_boundary_missing",
  "correction_rollback_boundary_missing",
  "failure_recovery_boundary_missing",
  "ui_state_boundary_missing",
  "notification_boundary_missing",
  "broker_order_boundary_missing",
  "avanza_browser_boundary_missing",
  "idempotency_missing",
  "duplicate_prevention_missing",
  "evidence_provenance_missing",
  "manual_review_required",
  "generated_types_absent_or_unknown",
  "migration_application_not_proven",
  "rls_security_unverified",
  "server_only_boundary_unverified",
  "post_insert_action_not_allowed_in_this_action",
] as const;

export type ExecutionRecordPostInsertBoundaryBlockedReason =
  (typeof EXECUTION_RECORD_POST_INSERT_BOUNDARY_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_WARNINGS = [
  "contract_only",
  "post_insert_actions_not_implemented",
  "insert_success_not_audit_approval",
  "insert_success_not_stats_pnl_approval",
  "insert_success_not_trade_mutation_approval",
  "insert_success_not_rollback_approval",
  "insert_success_not_ui_mutation_approval",
  "insert_success_not_notification_approval",
  "insert_success_not_broker_order_approval",
  "insert_success_not_avanza_browser_approval",
  "generated_types_required_before_post_insert_implementation",
  "migration_application_required_before_post_insert_implementation",
  "rls_security_required_before_post_insert_implementation",
  "server_only_boundary_required_before_post_insert_implementation",
  "idempotency_required",
  "duplicate_prevention_required",
  "automatic_mode_not_enabled",
] as const;

export type ExecutionRecordPostInsertBoundaryWarning =
  (typeof EXECUTION_RECORD_POST_INSERT_BOUNDARY_WARNINGS)[number];

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_REVIEW_ITEMS = [
  "post_insert_boundary_contract_review",
  "execution_record_insert_result_review",
  "execution_record_evidence_review",
  "generated_types_review",
  "migration_application_review",
  "rls_security_review",
  "server_only_boundary_review",
  "idempotency_review",
  "duplicate_prevention_review",
  "audit_append_boundary_review",
  "stats_pnl_boundary_review",
  "trade_reconciliation_boundary_review",
  "correction_rollback_boundary_review",
  "failure_recovery_boundary_review",
  "ui_state_boundary_review",
  "notification_boundary_review",
  "broker_order_boundary_review",
  "avanza_browser_boundary_review",
  "manual_approval_review",
] as const;

export type ExecutionRecordPostInsertBoundaryReviewItem =
  (typeof EXECUTION_RECORD_POST_INSERT_BOUNDARY_REVIEW_ITEMS)[number];

export type ExecutionRecordPostInsertBoundaryAuthorityFlags = {
  contractOnly: true;
  postInsertActionsImplemented: false;
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
  safeToRollback: false;
  safeToUpdateUiState: false;
  safeToNotifyUser: false;
  safeToRunBrokerAction: false;
  safeToRunAvanzaBrowserAction: false;
  automaticModeAllowed: false;
};

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_DEFAULT_AUTHORITY_FLAGS = {
  contractOnly: true,
  postInsertActionsImplemented: false,
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
  safeToRollback: false,
  safeToUpdateUiState: false,
  safeToNotifyUser: false,
  safeToRunBrokerAction: false,
  safeToRunAvanzaBrowserAction: false,
  automaticModeAllowed: false,
} as const satisfies ExecutionRecordPostInsertBoundaryAuthorityFlags;

export type ExecutionRecordPostInsertBoundarySafetyPolicy =
  ExecutionRecordPostInsertBoundaryAuthorityFlags & {
    insertSuccessIsFullWorkflowCompletion: false;
    insertSuccessApprovesAuditAppend: false;
    insertSuccessApprovesStatsPnlUpdate: false;
    insertSuccessApprovesTradeMutation: false;
    insertSuccessApprovesCorrectionRollback: false;
    insertSuccessApprovesUiMutation: false;
    insertSuccessApprovesNotification: false;
    insertSuccessApprovesBrokerOrderFollowUp: false;
    insertSuccessApprovesAvanzaBrowserFollowUp: false;
    boundariesDisabledByDefault: true;
    eachBoundaryRequiresSeparateAuthority: true;
    eachBoundaryRequiresSeparateValidation: true;
    eachBoundaryRequiresSeparateAuditTrail: true;
    idempotencyRequired: true;
    duplicatePreventionRequired: true;
    evidenceProvenanceRequired: true;
    noImplicitChainedMutation: true;
    noHiddenAutomaticMode: true;
    policyReason: string;
  };

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_DEFAULT_SAFETY_POLICY = {
  ...EXECUTION_RECORD_POST_INSERT_BOUNDARY_DEFAULT_AUTHORITY_FLAGS,
  insertSuccessIsFullWorkflowCompletion: false,
  insertSuccessApprovesAuditAppend: false,
  insertSuccessApprovesStatsPnlUpdate: false,
  insertSuccessApprovesTradeMutation: false,
  insertSuccessApprovesCorrectionRollback: false,
  insertSuccessApprovesUiMutation: false,
  insertSuccessApprovesNotification: false,
  insertSuccessApprovesBrokerOrderFollowUp: false,
  insertSuccessApprovesAvanzaBrowserFollowUp: false,
  boundariesDisabledByDefault: true,
  eachBoundaryRequiresSeparateAuthority: true,
  eachBoundaryRequiresSeparateValidation: true,
  eachBoundaryRequiresSeparateAuditTrail: true,
  idempotencyRequired: true,
  duplicatePreventionRequired: true,
  evidenceProvenanceRequired: true,
  noImplicitChainedMutation: true,
  noHiddenAutomaticMode: true,
  policyReason:
    "Post-insert boundary contract types are contract-only. Execution-record insert success is not approval to append audit records, update stats/PnL, mutate or reconcile trades, roll back/correct, update UI source-of-truth state, notify users, run broker/order follow-up, automate Avanza/browser behavior, or enable automatic mode.",
} as const satisfies ExecutionRecordPostInsertBoundarySafetyPolicy;

export type ExecutionRecordPostInsertBoundaryEvidenceSummary = {
  executionRecordId?: string | null;
  executionRecordReference?: PersistedExecutionRecordReference | null;
  executionRecordInsertResult?: ExecutionRecordInsertRouteCallResult | null;
  insertResultProven: boolean;
  insertedRecordSummary?: Record<string, unknown> | null;
  normalizedExecutionRecordInput?: ExecutionRecordPersistenceInput | null;
  executionRecordEvidencePresent: boolean;
  executionRecordEvidenceProvenancePresent: boolean;
  finalBrokerEvidenceIdentifiersPresent: boolean;
  generatedTypesProofPresent: boolean;
  migrationProofPresent: boolean;
  rlsSecurityProofPresent: boolean;
  serverOnlyProofPresent: boolean;
  schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
  auditCorrectionMetadata?: ExecutionRecordPersistenceAuditMetadata | null;
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  sourceReferences: string[];
  blockedReasons: ExecutionRecordPostInsertBoundaryBlockedReason[];
  warnings: ExecutionRecordPostInsertBoundaryWarning[];
  reviewItems: ExecutionRecordPostInsertBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertBoundaryIdempotencySummary = {
  idempotencyKey?: string | null;
  idempotencyFingerprint?: string | null;
  idempotencyMetadataPresent: boolean;
  duplicatePreventionMetadataPresent: boolean;
  duplicateMatches: ExecutionRecordDuplicateMatch[];
  safeToRetry: false;
  retryRequiresReview: true;
  duplicateSideEffectsPrevented: boolean;
  conflictingDuplicateDetected: boolean;
  blockedReasons: ExecutionRecordPostInsertBoundaryBlockedReason[];
  warnings: ExecutionRecordPostInsertBoundaryWarning[];
  reviewItems: ExecutionRecordPostInsertBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertBoundaryFailureModelSummary = {
  partialFailureStatesKnown: boolean;
  insertSucceededPostInsertFailedPossible: boolean;
  auditSucceededStatsFailedPossible: boolean;
  statsSucceededTradeMutationFailedPossible: boolean;
  uiRefreshFailedPossible: boolean;
  notificationFailedPossible: boolean;
  retryModelDefined: boolean;
  retriesRequireStableIdempotency: true;
  userVisibleReviewRequired: true;
  hiddenPartialFailureAllowed: false;
  blockedReasons: ExecutionRecordPostInsertBoundaryBlockedReason[];
  warnings: ExecutionRecordPostInsertBoundaryWarning[];
  reviewItems: ExecutionRecordPostInsertBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertBoundaryDependencySummary = {
  generatedTypesPresent: boolean;
  migrationApplicationProven: boolean;
  rlsSecurityVerified: boolean;
  serverOnlyBoundaryVerified: boolean;
  productionInsertRouteImplemented: boolean;
  productionInsertRouteCalled: boolean;
  postInsertImplementationPresent: false;
  auditAppendImplementationPresent: false;
  statsPnlUpdateImplementationPresent: false;
  tradeReconciliationImplementationPresent: false;
  correctionRollbackImplementationPresent: false;
  uiStateUpdateImplementationPresent: false;
  userNotificationImplementationPresent: false;
  brokerOrderFollowUpImplementationPresent: false;
  avanzaBrowserFollowUpImplementationPresent: false;
  blockedReasons: ExecutionRecordPostInsertBoundaryBlockedReason[];
  warnings: ExecutionRecordPostInsertBoundaryWarning[];
  reviewItems: ExecutionRecordPostInsertBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertBoundaryCategorySummary = {
  boundaryName: string;
  representedSeparately: true;
  implemented: false;
  enabled: false;
  authorityAllowed: false;
  safeToExecute: false;
  insertSuccessApprovesBoundary: false;
  requiresSeparateValidator: true;
  requiresSeparateAuthority: true;
  requiresSeparateIdempotency: true;
  requiresSeparateEvidence: true;
  requiresSeparateFailureModel: true;
  requiresSeparateAuditTrail: true;
  blockedReasons: ExecutionRecordPostInsertBoundaryBlockedReason[];
  warnings: ExecutionRecordPostInsertBoundaryWarning[];
  reviewItems: ExecutionRecordPostInsertBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendBoundarySummary =
  ExecutionRecordPostInsertBoundaryCategorySummary & {
    boundaryName: "audit_append";
    auditAppendAllowed: false;
    safeToAppendAudit: false;
    requiredAuditEventType?: string | null;
    requiredInputPresent: boolean;
    requiredEvidencePresent: boolean;
    idempotencyKeyPresent: boolean;
    duplicatePreventionPresent: boolean;
    allowedOutputIsAuditCandidateOnly: boolean;
    statsPnlAuthority: false;
    tradeMutationAuthority: false;
  };

export type ExecutionRecordStatsPnlUpdateBoundarySummary =
  ExecutionRecordPostInsertBoundaryCategorySummary & {
    boundaryName: "stats_pnl_update";
    statsPnlUpdateAllowed: false;
    safeToUpdateStats: false;
    executionRecordEvidencePresent: boolean;
    tradeLinkPresent: boolean;
    calculationSourcePresent: boolean;
    consistencyRequirementsMet: boolean;
    idempotencyKeyPresent: boolean;
    duplicatePreventionPresent: boolean;
    reconciliationRequirementsDefined: boolean;
    auditAppendAuthority: false;
    tradeMutationAuthority: false;
  };

export type ExecutionRecordTradeReconciliationBoundarySummary =
  ExecutionRecordPostInsertBoundaryCategorySummary & {
    boundaryName: "trade_reconciliation";
    tradeReconciliationAllowed: false;
    tradeMutationAllowed: false;
    safeToMutateTrade: false;
    executionRecordEvidencePresent: boolean;
    currentTradeStatePresent: boolean;
    mutationTypeConstraintsDefined: boolean;
    reconciliationChecksDefined: boolean;
    conflictHandlingDefined: boolean;
    idempotencyKeyPresent: boolean;
    brokerOrderAuthority: false;
    avanzaBrowserAuthority: false;
  };

export type ExecutionRecordCorrectionRollbackBoundarySummary =
  ExecutionRecordPostInsertBoundaryCategorySummary & {
    boundaryName: "correction_rollback";
    correctionRollbackAllowed: false;
    safeToRollback: false;
    correctionEventRequirementsPresent: boolean;
    originalRecordReferencePresent: boolean;
    immutableRecordAssumptionsDocumented: boolean;
    compensatingActionModelDefined: boolean;
    rollbackLimitationsDocumented: boolean;
    auditRequirementsPresent: boolean;
  };

export type ExecutionRecordFailureRecoveryBoundarySummary =
  ExecutionRecordPostInsertBoundaryCategorySummary & {
    boundaryName: "failure_recovery";
    failureRecoveryAllowed: false;
    partialFailureStatesDefined: boolean;
    routeSuccessPostInsertFailureModeDefined: boolean;
    auditSuccessStatsFailureModeDefined: boolean;
    statsSuccessTradeMutationFailureModeDefined: boolean;
    retryModelDefined: boolean;
    idempotencyRequired: true;
    userVisibleReviewRequired: true;
  };

export type ExecutionRecordUiStateUpdateBoundarySummary =
  ExecutionRecordPostInsertBoundaryCategorySummary & {
    boundaryName: "ui_state_update";
    uiStateMutationAllowed: false;
    safeToUpdateUiState: false;
    readAfterWriteRequired: true;
    optimisticUpdateRestricted: true;
    staleDataHandlingDefined: boolean;
    confirmationDisplaySeparatedFromPostInsertCompletion: boolean;
    localOnlySourceOfTruthAllowed: false;
  };

export type ExecutionRecordUserNotificationBoundarySummary =
  ExecutionRecordPostInsertBoundaryCategorySummary & {
    boundaryName: "user_notification";
    userNotificationAllowed: false;
    safeToNotifyUser: false;
    notificationTriggersDefined: boolean;
    requiredSourceOfTruthPresent: boolean;
    failureRetryDefined: boolean;
    userReviewStatesDefined: boolean;
    mayImplyBrokerOrderExecution: false;
    mayImplyAvanzaBrowserCompletion: false;
  };

export type ExecutionRecordBrokerOrderFollowUpBoundarySummary =
  ExecutionRecordPostInsertBoundaryCategorySummary & {
    boundaryName: "broker_order_follow_up";
    brokerOrderFollowUpAllowed: false;
    safeToRunBrokerAction: false;
    brokerOrderFollowUpDisabledByDefault: true;
    kopSaljTriggerAllowed: false;
    automaticModeApprovalAllowed: false;
    futureSeparateDesignRequired: true;
    manualConfirmationRequired: true;
  };

export type ExecutionRecordAvanzaBrowserFollowUpBoundarySummary =
  ExecutionRecordPostInsertBoundaryCategorySummary & {
    boundaryName: "avanza_browser_follow_up";
    avanzaBrowserFollowUpAllowed: false;
    safeToRunAvanzaBrowserAction: false;
    avanzaBrowserFollowUpDisabledByDefault: true;
    browserActionAllowed: false;
    kopSaljTriggerAllowed: false;
    automaticModeApprovalAllowed: false;
    futureSeparateDesignRequired: true;
    manualConfirmationRequired: true;
  };

export type ExecutionRecordPostInsertBoundaryCategorySummaries = {
  auditAppend: ExecutionRecordAuditAppendBoundarySummary;
  statsPnlUpdate: ExecutionRecordStatsPnlUpdateBoundarySummary;
  tradeReconciliation: ExecutionRecordTradeReconciliationBoundarySummary;
  correctionRollback: ExecutionRecordCorrectionRollbackBoundarySummary;
  failureRecovery: ExecutionRecordFailureRecoveryBoundarySummary;
  uiStateUpdate: ExecutionRecordUiStateUpdateBoundarySummary;
  userNotification: ExecutionRecordUserNotificationBoundarySummary;
  brokerOrderFollowUp: ExecutionRecordBrokerOrderFollowUpBoundarySummary;
  avanzaBrowserFollowUp: ExecutionRecordAvanzaBrowserFollowUpBoundarySummary;
};

export type ExecutionRecordPostInsertBoundaryInput = {
  contractVersion: ExecutionRecordPostInsertBoundaryContractVersion;
  status: ExecutionRecordPostInsertBoundaryStatus;
  productionInsertRouteResult?: ExecutionRecordInsertRouteCallResult | null;
  futureInsertResultMetadata?: Record<string, unknown> | null;
  executionRecordId?: string | null;
  executionRecordReference?: PersistedExecutionRecordReference | null;
  executionRecordEvidence?: ExecutionRecordPostInsertBoundaryEvidenceSummary | null;
  finalBrokerEvidenceIdentifiers?: Record<string, unknown> | null;
  normalizedExecutionRecordInput?: ExecutionRecordPersistenceInput | null;
  insertedRecordSummary?: Record<string, unknown> | null;
  generatedTypesProof?: Record<string, unknown> | null;
  migrationProof?: Record<string, unknown> | null;
  rlsSecurityProof?: Record<string, unknown> | null;
  serverOnlyProof?: Record<string, unknown> | null;
  idempotency: ExecutionRecordPostInsertBoundaryIdempotencySummary;
  duplicatePrevention?: Record<string, unknown> | null;
  auditCorrectionMetadata?: ExecutionRecordPersistenceAuditMetadata | null;
  currentTradeState?: Record<string, unknown> | null;
  statsPnlCalculationSource?: Record<string, unknown> | null;
  uiStateSourceOfTruth?: Record<string, unknown> | null;
  notificationContext?: Record<string, unknown> | null;
  brokerOrderFollowUpMetadata?: Record<string, unknown> | null;
  avanzaBrowserFollowUpMetadata?: Record<string, unknown> | null;
  authority: ExecutionRecordPostInsertBoundaryAuthorityFlags;
  safetyPolicy: ExecutionRecordPostInsertBoundarySafetyPolicy;
  categorySummaries: ExecutionRecordPostInsertBoundaryCategorySummaries;
  blockedReasons: ExecutionRecordPostInsertBoundaryBlockedReason[];
  warnings: ExecutionRecordPostInsertBoundaryWarning[];
  reviewItems: ExecutionRecordPostInsertBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertBoundaryResult = {
  contractVersion: ExecutionRecordPostInsertBoundaryContractVersion;
  status: ExecutionRecordPostInsertBoundaryStatus;
  decisionRecommendation: ExecutionRecordPostInsertBoundaryDecisionRecommendation;
  contractOnly: true;
  postInsertActionsImplemented: false;
  insertSuccessIsFullWorkflowCompletion: false;
  insertSuccessApprovesPostInsertActions: false;
  authority: ExecutionRecordPostInsertBoundaryAuthorityFlags;
  safetyPolicy: ExecutionRecordPostInsertBoundarySafetyPolicy;
  evidence: ExecutionRecordPostInsertBoundaryEvidenceSummary;
  idempotency: ExecutionRecordPostInsertBoundaryIdempotencySummary;
  failureModel: ExecutionRecordPostInsertBoundaryFailureModelSummary;
  dependencies: ExecutionRecordPostInsertBoundaryDependencySummary;
  categorySummaries: ExecutionRecordPostInsertBoundaryCategorySummaries;
  blockedReasons: ExecutionRecordPostInsertBoundaryBlockedReason[];
  warnings: ExecutionRecordPostInsertBoundaryWarning[];
  reviewItems: ExecutionRecordPostInsertBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};
