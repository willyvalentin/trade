import type {
  ExecutionRecordAuditAppendBoundarySummary,
  ExecutionRecordAvanzaBrowserFollowUpBoundarySummary,
  ExecutionRecordBrokerOrderFollowUpBoundarySummary,
  ExecutionRecordCorrectionRollbackBoundarySummary,
  ExecutionRecordFailureRecoveryBoundarySummary,
  ExecutionRecordPostInsertBoundaryAuthorityFlags,
  ExecutionRecordPostInsertBoundaryCategorySummaries,
  ExecutionRecordPostInsertBoundaryDependencySummary,
  ExecutionRecordPostInsertBoundaryEvidenceSummary,
  ExecutionRecordPostInsertBoundaryFailureModelSummary,
  ExecutionRecordPostInsertBoundaryIdempotencySummary,
  ExecutionRecordPostInsertBoundaryInput,
  ExecutionRecordPostInsertBoundaryResult,
  ExecutionRecordPostInsertBoundarySafetyPolicy,
  ExecutionRecordStatsPnlUpdateBoundarySummary,
  ExecutionRecordTradeReconciliationBoundarySummary,
  ExecutionRecordUiStateUpdateBoundarySummary,
  ExecutionRecordUserNotificationBoundarySummary,
} from "@/lib/execution-record-post-insert-boundary-contract";

// Post-insert boundary validator contract metadata only. These types describe
// future validation diagnostics and do not implement validator logic,
// orchestrators, route calls, post-insert actions, Supabase/localStorage
// writes, audit append, stats/PnL updates, rollback/correction, trade
// mutation, UI wiring, broker/order behavior, Avanza/browser behavior, or
// automatic mode. Validator readiness is not action execution.

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATOR_CONTRACT_VERSION =
  "execution_record_post_insert_boundary_validator_v1" as const;

export type ExecutionRecordPostInsertBoundaryValidatorContractVersion =
  typeof EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATOR_CONTRACT_VERSION;

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_STATUSES = [
  "post_insert_boundary_validation_ready_for_design_only",
  "post_insert_boundary_validation_blocked",
  "post_insert_boundary_validation_needs_review",
  "post_insert_boundary_validation_invalid",
  "post_insert_boundary_validation_absent",
] as const;

export type ExecutionRecordPostInsertBoundaryValidationStatus =
  (typeof EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_STATUSES)[number];

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_DECISION_RECOMMENDATIONS =
  [
    "design_only_do_not_run_post_insert_actions",
    "blocked_do_not_run_post_insert_actions",
    "needs_manual_review",
    "invalid_do_not_run_post_insert_actions",
    "future_boundary_required",
  ] as const;

export type ExecutionRecordPostInsertBoundaryValidationDecisionRecommendation =
  (typeof EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_BLOCKED_REASONS =
  [
    "post_insert_boundary_input_missing",
    "execution_record_insert_not_proven",
    "execution_record_reference_missing",
    "execution_record_evidence_missing",
    "evidence_provenance_missing",
    "idempotency_missing",
    "duplicate_prevention_missing",
    "generated_types_absent_or_unknown",
    "migration_application_not_proven",
    "rls_security_unverified",
    "server_only_boundary_unverified",
    "audit_boundary_missing",
    "stats_pnl_boundary_missing",
    "trade_reconciliation_boundary_missing",
    "correction_rollback_boundary_missing",
    "failure_recovery_boundary_missing",
    "ui_state_boundary_missing",
    "notification_boundary_missing",
    "broker_order_boundary_missing",
    "avanza_browser_boundary_missing",
    "insert_success_misinterpreted_as_action_approval",
    "post_insert_action_requested_in_contract_phase",
    "broker_or_avanza_action_requested",
    "automatic_mode_requested",
  ] as const;

export type ExecutionRecordPostInsertBoundaryValidationBlockedReason =
  (typeof EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_WARNINGS = [
  "contract_only",
  "validator_not_implemented",
  "post_insert_actions_not_implemented",
  "insert_success_not_audit_approval",
  "insert_success_not_stats_pnl_approval",
  "insert_success_not_trade_mutation_approval",
  "insert_success_not_trade_reconciliation_approval",
  "insert_success_not_rollback_approval",
  "insert_success_not_failure_recovery_approval",
  "insert_success_not_ui_mutation_approval",
  "insert_success_not_notification_approval",
  "insert_success_not_broker_order_approval",
  "insert_success_not_avanza_browser_approval",
  "insert_success_not_automatic_mode_approval",
  "insert_success_not_full_workflow_completion",
  "generated_types_required_before_post_insert_validation",
  "migration_application_required_before_post_insert_validation",
  "rls_security_required_before_post_insert_validation",
  "server_only_boundary_required_before_post_insert_validation",
  "idempotency_required",
  "duplicate_prevention_required",
  "evidence_provenance_required",
  "manual_review_may_be_required",
  "automatic_mode_not_enabled",
] as const;

export type ExecutionRecordPostInsertBoundaryValidationWarning =
  (typeof EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_WARNINGS)[number];

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_REVIEW_ITEMS = [
  "post_insert_boundary_validator_contract_review",
  "post_insert_boundary_input_review",
  "execution_record_insert_result_review",
  "execution_record_reference_review",
  "execution_record_evidence_review",
  "generated_types_review",
  "migration_application_review",
  "rls_security_review",
  "server_only_boundary_review",
  "idempotency_review",
  "duplicate_prevention_review",
  "audit_append_validation_review",
  "stats_pnl_validation_review",
  "trade_reconciliation_validation_review",
  "correction_rollback_validation_review",
  "failure_recovery_validation_review",
  "ui_state_validation_review",
  "notification_validation_review",
  "broker_order_validation_review",
  "avanza_browser_validation_review",
  "authority_flags_review",
  "insert_success_safety_review",
] as const;

export type ExecutionRecordPostInsertBoundaryValidationReviewItem =
  (typeof EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_REVIEW_ITEMS)[number];

export type ExecutionRecordPostInsertBoundaryValidationAuthorityFlags = {
  validationOnly: true;
  designOnly: true;
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

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_DEFAULT_AUTHORITY_FLAGS =
  {
    validationOnly: true,
    designOnly: true,
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
  } as const satisfies ExecutionRecordPostInsertBoundaryValidationAuthorityFlags;

export type ExecutionRecordPostInsertBoundaryValidationSafetyPolicy =
  ExecutionRecordPostInsertBoundaryValidationAuthorityFlags & {
    validationReadinessIsActionExecution: false;
    insertSuccessIsPostInsertApproval: false;
    insertSuccessIsFullWorkflowCompletion: false;
    boundaryContractAuthority?: ExecutionRecordPostInsertBoundaryAuthorityFlags | null;
    boundarySafetyPolicy?: ExecutionRecordPostInsertBoundarySafetyPolicy | null;
    eachCategoryValidatedSeparately: true;
    evidenceProvenanceRequired: true;
    idempotencyRequired: true;
    duplicatePreventionRequired: true;
    partialFailureRepresentable: true;
    noChainedImplicitActions: true;
    brokerAvanzaDisabledUnlessApproved: true;
    policyReason: string;
  };

export const EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_DEFAULT_SAFETY_POLICY =
  {
    ...EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
    validationReadinessIsActionExecution: false,
    insertSuccessIsPostInsertApproval: false,
    insertSuccessIsFullWorkflowCompletion: false,
    boundaryContractAuthority: null,
    boundarySafetyPolicy: null,
    eachCategoryValidatedSeparately: true,
    evidenceProvenanceRequired: true,
    idempotencyRequired: true,
    duplicatePreventionRequired: true,
    partialFailureRepresentable: true,
    noChainedImplicitActions: true,
    brokerAvanzaDisabledUnlessApproved: true,
    policyReason:
      "Post-insert boundary validator contracts are validation-only and design-only. Validator readiness is not post-insert action execution, and insert success is not approval to append audit records, update stats/PnL, mutate or reconcile trades, roll back/correct, recover failures, update UI state, notify users, run broker/order follow-up, automate Avanza/browser behavior, or enable automatic mode.",
  } as const satisfies ExecutionRecordPostInsertBoundaryValidationSafetyPolicy;

export type ExecutionRecordPostInsertBoundaryValidationEvidenceSummary = {
  boundaryEvidence?: ExecutionRecordPostInsertBoundaryEvidenceSummary | null;
  executionRecordId?: string | null;
  executionRecordReferencePresent: boolean;
  insertedExecutionRecordSummaryPresent: boolean;
  insertResultMetadataPresent: boolean;
  normalizedExecutionRecordInputPresent: boolean;
  executionRecordEvidencePresent: boolean;
  evidenceProvenancePresent: boolean;
  generatedTypesProofPresent: boolean;
  migrationProofPresent: boolean;
  rlsSecurityProofPresent: boolean;
  serverOnlyProofPresent: boolean;
  auditCorrectionMetadataPresent: boolean;
  currentTradeStatePresent: boolean;
  statsPnlCalculationSourcePresent: boolean;
  uiStateSourceOfTruthPresent: boolean;
  notificationContextPresent: boolean;
  brokerOrderFollowUpMetadataPresent: boolean;
  avanzaBrowserFollowUpMetadataPresent: boolean;
  blockedReasons: ExecutionRecordPostInsertBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordPostInsertBoundaryValidationWarning[];
  reviewItems: ExecutionRecordPostInsertBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertBoundaryValidationIdempotencySummary = {
  boundaryIdempotency?: ExecutionRecordPostInsertBoundaryIdempotencySummary | null;
  idempotencyPresent: boolean;
  duplicatePreventionPresent: boolean;
  stableExecutionRecordReferencePresent: boolean;
  duplicateSideEffectPreventionPresent: boolean;
  retryWithoutIdempotencyBlocked: true;
  conflictingDuplicateDetected: boolean;
  safeToRetryPostInsertAction: false;
  blockedReasons: ExecutionRecordPostInsertBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordPostInsertBoundaryValidationWarning[];
  reviewItems: ExecutionRecordPostInsertBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertBoundaryValidationFailureModelSummary = {
  boundaryFailureModel?: ExecutionRecordPostInsertBoundaryFailureModelSummary | null;
  partialFailureRepresentable: boolean;
  insertSuccessAuditBlockedRepresented: boolean;
  auditSuccessStatsBlockedRepresented: boolean;
  statsSuccessTradeReconciliationBlockedRepresented: boolean;
  uiUpdateBlockedRepresented: boolean;
  notificationBlockedRepresented: boolean;
  brokerAvanzaBlockedUnlessApproved: true;
  manualReviewStatesPresent: boolean;
  hiddenPartialFailureAllowed: false;
  blockedReasons: ExecutionRecordPostInsertBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordPostInsertBoundaryValidationWarning[];
  reviewItems: ExecutionRecordPostInsertBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertBoundaryValidationDependencySummary = {
  boundaryDependencies?: ExecutionRecordPostInsertBoundaryDependencySummary | null;
  productionInsertRoutePresent: boolean;
  productionInsertWritePathPresent: boolean;
  generatedTypesPresent: boolean;
  migrationApplicationProven: boolean;
  rlsSecurityVerified: boolean;
  serverOnlyBoundaryVerified: boolean;
  postInsertBoundaryContractPresent: boolean;
  postInsertValidatorImplementationPresent: false;
  postInsertOrchestratorPresent: false;
  postInsertActionsImplemented: false;
  blockedReasons: ExecutionRecordPostInsertBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordPostInsertBoundaryValidationWarning[];
  reviewItems: ExecutionRecordPostInsertBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertBoundaryCategoryValidationSummary = {
  categoryName: string;
  boundarySummaryPresent: boolean;
  categoryValidatedSeparately: true;
  validationOnly: true;
  designOnly: true;
  readyForDesignOnly: boolean;
  actionExecutionAllowed: false;
  actionAuthorityAllowed: false;
  insertSuccessApprovesCategory: false;
  validatorReadinessExecutesCategory: false;
  evidencePresent: boolean;
  idempotencyPresent: boolean;
  duplicatePreventionPresent: boolean;
  blockedReasons: ExecutionRecordPostInsertBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordPostInsertBoundaryValidationWarning[];
  reviewItems: ExecutionRecordPostInsertBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendBoundaryValidationSummary =
  ExecutionRecordPostInsertBoundaryCategoryValidationSummary & {
    categoryName: "audit_append";
    boundarySummary?: ExecutionRecordAuditAppendBoundarySummary | null;
    auditAppendAllowed: false;
    safeToAppendAudit: false;
    statsPnlAuthority: false;
    tradeMutationAuthority: false;
  };

export type ExecutionRecordStatsPnlUpdateBoundaryValidationSummary =
  ExecutionRecordPostInsertBoundaryCategoryValidationSummary & {
    categoryName: "stats_pnl_update";
    boundarySummary?: ExecutionRecordStatsPnlUpdateBoundarySummary | null;
    statsPnlUpdateAllowed: false;
    safeToUpdateStats: false;
    auditAppendAuthority: false;
    tradeMutationAuthority: false;
  };

export type ExecutionRecordTradeReconciliationBoundaryValidationSummary =
  ExecutionRecordPostInsertBoundaryCategoryValidationSummary & {
    categoryName: "trade_reconciliation";
    boundarySummary?: ExecutionRecordTradeReconciliationBoundarySummary | null;
    tradeReconciliationAllowed: false;
    tradeMutationAllowed: false;
    safeToReconcileTrade: false;
    safeToMutateTrade: false;
    brokerOrderAuthority: false;
    avanzaBrowserAuthority: false;
  };

export type ExecutionRecordCorrectionRollbackBoundaryValidationSummary =
  ExecutionRecordPostInsertBoundaryCategoryValidationSummary & {
    categoryName: "correction_rollback";
    boundarySummary?: ExecutionRecordCorrectionRollbackBoundarySummary | null;
    correctionRollbackAllowed: false;
    safeToRollback: false;
    originalInsertMutationAllowed: false;
  };

export type ExecutionRecordFailureRecoveryBoundaryValidationSummary =
  ExecutionRecordPostInsertBoundaryCategoryValidationSummary & {
    categoryName: "failure_recovery";
    boundarySummary?: ExecutionRecordFailureRecoveryBoundarySummary | null;
    failureRecoveryAllowed: false;
    safeToRecoverFailure: false;
    normalSuccessPathAuthority: false;
  };

export type ExecutionRecordUiStateUpdateBoundaryValidationSummary =
  ExecutionRecordPostInsertBoundaryCategoryValidationSummary & {
    categoryName: "ui_state_update";
    boundarySummary?: ExecutionRecordUiStateUpdateBoundarySummary | null;
    uiStateMutationAllowed: false;
    safeToUpdateUiState: false;
    localOnlySourceOfTruthAllowed: false;
  };

export type ExecutionRecordUserNotificationBoundaryValidationSummary =
  ExecutionRecordPostInsertBoundaryCategoryValidationSummary & {
    categoryName: "user_notification";
    boundarySummary?: ExecutionRecordUserNotificationBoundarySummary | null;
    userNotificationAllowed: false;
    safeToNotifyUser: false;
    brokerOrderExecutionImplicationAllowed: false;
    avanzaBrowserCompletionImplicationAllowed: false;
  };

export type ExecutionRecordBrokerOrderFollowUpBoundaryValidationSummary =
  ExecutionRecordPostInsertBoundaryCategoryValidationSummary & {
    categoryName: "broker_order_follow_up";
    boundarySummary?: ExecutionRecordBrokerOrderFollowUpBoundarySummary | null;
    brokerOrderFollowUpAllowed: false;
    safeToRunBrokerAction: false;
    kopSaljTriggerAllowed: false;
    automaticModeApprovalAllowed: false;
    disabledUnlessSeparatelyApproved: true;
  };

export type ExecutionRecordAvanzaBrowserFollowUpBoundaryValidationSummary =
  ExecutionRecordPostInsertBoundaryCategoryValidationSummary & {
    categoryName: "avanza_browser_follow_up";
    boundarySummary?: ExecutionRecordAvanzaBrowserFollowUpBoundarySummary | null;
    avanzaBrowserFollowUpAllowed: false;
    safeToRunAvanzaBrowserAction: false;
    browserActionAllowed: false;
    kopSaljTriggerAllowed: false;
    automaticModeApprovalAllowed: false;
    disabledUnlessSeparatelyApproved: true;
  };

export type ExecutionRecordPostInsertBoundaryValidationCategorySummaries = {
  auditAppend: ExecutionRecordAuditAppendBoundaryValidationSummary;
  statsPnlUpdate: ExecutionRecordStatsPnlUpdateBoundaryValidationSummary;
  tradeReconciliation: ExecutionRecordTradeReconciliationBoundaryValidationSummary;
  correctionRollback: ExecutionRecordCorrectionRollbackBoundaryValidationSummary;
  failureRecovery: ExecutionRecordFailureRecoveryBoundaryValidationSummary;
  uiStateUpdate: ExecutionRecordUiStateUpdateBoundaryValidationSummary;
  userNotification: ExecutionRecordUserNotificationBoundaryValidationSummary;
  brokerOrderFollowUp: ExecutionRecordBrokerOrderFollowUpBoundaryValidationSummary;
  avanzaBrowserFollowUp: ExecutionRecordAvanzaBrowserFollowUpBoundaryValidationSummary;
};

export type ExecutionRecordPostInsertBoundaryValidationInput = {
  contractVersion: ExecutionRecordPostInsertBoundaryValidatorContractVersion;
  boundaryInput?: ExecutionRecordPostInsertBoundaryInput | null;
  boundaryResult?: ExecutionRecordPostInsertBoundaryResult | null;
  boundaryCategorySummaries?: ExecutionRecordPostInsertBoundaryCategorySummaries | null;
  futureExecutionRecordInsertResultMetadata?: Record<string, unknown> | null;
  executionRecordId?: string | null;
  executionRecordReference?: Record<string, unknown> | null;
  insertedExecutionRecordSummary?: Record<string, unknown> | null;
  executionRecordEvidence?: ExecutionRecordPostInsertBoundaryEvidenceSummary | null;
  normalizedExecutionRecordInput?: Record<string, unknown> | null;
  generatedTypesProof?: Record<string, unknown> | null;
  migrationProof?: Record<string, unknown> | null;
  rlsSecurityProof?: Record<string, unknown> | null;
  serverOnlyProof?: Record<string, unknown> | null;
  idempotency?: ExecutionRecordPostInsertBoundaryIdempotencySummary | null;
  duplicatePrevention?: Record<string, unknown> | null;
  auditCorrectionMetadata?: Record<string, unknown> | null;
  currentTradeState?: Record<string, unknown> | null;
  statsPnlCalculationSource?: Record<string, unknown> | null;
  uiStateSourceOfTruth?: Record<string, unknown> | null;
  notificationContext?: Record<string, unknown> | null;
  brokerOrderFollowUpMetadata?: Record<string, unknown> | null;
  avanzaBrowserFollowUpMetadata?: Record<string, unknown> | null;
  requestedCategoryValidations: Array<keyof ExecutionRecordPostInsertBoundaryValidationCategorySummaries>;
  authority: ExecutionRecordPostInsertBoundaryValidationAuthorityFlags;
  safetyPolicy: ExecutionRecordPostInsertBoundaryValidationSafetyPolicy;
  blockedReasons: ExecutionRecordPostInsertBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordPostInsertBoundaryValidationWarning[];
  reviewItems: ExecutionRecordPostInsertBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPostInsertBoundaryValidationResult = {
  contractVersion: ExecutionRecordPostInsertBoundaryValidatorContractVersion;
  status: ExecutionRecordPostInsertBoundaryValidationStatus;
  decisionRecommendation: ExecutionRecordPostInsertBoundaryValidationDecisionRecommendation;
  validationOnly: true;
  designOnly: true;
  validatorImplemented: false;
  validatorReadinessExecutesActions: false;
  insertSuccessApprovesPostInsertActions: false;
  insertSuccessIsFullWorkflowCompletion: false;
  authority: ExecutionRecordPostInsertBoundaryValidationAuthorityFlags;
  safetyPolicy: ExecutionRecordPostInsertBoundaryValidationSafetyPolicy;
  categoryValidations: ExecutionRecordPostInsertBoundaryValidationCategorySummaries;
  evidence: ExecutionRecordPostInsertBoundaryValidationEvidenceSummary;
  idempotency: ExecutionRecordPostInsertBoundaryValidationIdempotencySummary;
  failureModel: ExecutionRecordPostInsertBoundaryValidationFailureModelSummary;
  dependencies: ExecutionRecordPostInsertBoundaryValidationDependencySummary;
  blockedReasons: ExecutionRecordPostInsertBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordPostInsertBoundaryValidationWarning[];
  reviewItems: ExecutionRecordPostInsertBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};
