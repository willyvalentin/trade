import {
  EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_DEFAULT_SAFETY_POLICY,
  EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordAuditAppendBoundaryValidationSummary,
  type ExecutionRecordAvanzaBrowserFollowUpBoundaryValidationSummary,
  type ExecutionRecordBrokerOrderFollowUpBoundaryValidationSummary,
  type ExecutionRecordCorrectionRollbackBoundaryValidationSummary,
  type ExecutionRecordFailureRecoveryBoundaryValidationSummary,
  type ExecutionRecordPostInsertBoundaryValidationBlockedReason,
  type ExecutionRecordPostInsertBoundaryValidationCategorySummaries,
  type ExecutionRecordPostInsertBoundaryValidationDecisionRecommendation,
  type ExecutionRecordPostInsertBoundaryValidationEvidenceSummary,
  type ExecutionRecordPostInsertBoundaryValidationFailureModelSummary,
  type ExecutionRecordPostInsertBoundaryValidationIdempotencySummary,
  type ExecutionRecordPostInsertBoundaryValidationInput,
  type ExecutionRecordPostInsertBoundaryValidationResult,
  type ExecutionRecordPostInsertBoundaryValidationReviewItem,
  type ExecutionRecordPostInsertBoundaryValidationSafetyPolicy,
  type ExecutionRecordPostInsertBoundaryValidationStatus,
  type ExecutionRecordPostInsertBoundaryValidationWarning,
  type ExecutionRecordStatsPnlUpdateBoundaryValidationSummary,
  type ExecutionRecordTradeReconciliationBoundaryValidationSummary,
  type ExecutionRecordUiStateUpdateBoundaryValidationSummary,
  type ExecutionRecordUserNotificationBoundaryValidationSummary,
} from "@/lib/execution-record-post-insert-boundary-validator-contract";
import type {
  ExecutionRecordPostInsertBoundaryCategorySummaries,
  ExecutionRecordPostInsertBoundaryCategorySummary,
} from "@/lib/execution-record-post-insert-boundary-contract";

// Pure post-insert boundary validation only. This module does not implement or
// call orchestrators, production routes, insert routes, execution-record
// creation, persistence/write behavior, Supabase/localStorage writes, audit
// append, stats/PnL updates, rollback/correction, trade mutation or
// reconciliation, failure recovery, UI updates, user notifications, broker/order
// behavior, Avanza/browser behavior, or automatic mode.

type ReasonBuckets = {
  blocked: ExecutionRecordPostInsertBoundaryValidationBlockedReason[];
  invalid: ExecutionRecordPostInsertBoundaryValidationBlockedReason[];
  review: ExecutionRecordPostInsertBoundaryValidationBlockedReason[];
};

const BASE_WARNINGS: ExecutionRecordPostInsertBoundaryValidationWarning[] = [
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
  "automatic_mode_not_enabled",
];

const ALL_REVIEW_ITEMS: ExecutionRecordPostInsertBoundaryValidationReviewItem[] =
  [
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
  ];

function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasTruthyFlag(value: unknown, key: string): boolean {
  return isObject(value) && value[key] === true;
}

function addReason(
  buckets: ReasonBuckets,
  bucket: keyof ReasonBuckets,
  reason: ExecutionRecordPostInsertBoundaryValidationBlockedReason,
): void {
  buckets[bucket].push(reason);
}

function hasAnyTruthyFlag(value: unknown, keys: string[]): boolean {
  return keys.some((key) => hasTruthyFlag(value, key));
}

const ACTION_AUTHORITY_KEYS = [
  "postInsertActionsImplemented",
  "postInsertActionsAllowed",
  "auditAppendAllowed",
  "statsPnlUpdateAllowed",
  "tradeMutationAllowed",
  "tradeReconciliationAllowed",
  "correctionRollbackAllowed",
  "failureRecoveryAllowed",
  "uiStateMutationAllowed",
  "userNotificationAllowed",
  "brokerOrderFollowUpAllowed",
  "avanzaBrowserFollowUpAllowed",
  "safeToAppendAudit",
  "safeToUpdateStats",
  "safeToMutateTrade",
  "safeToReconcileTrade",
  "safeToRollback",
  "safeToRecoverFailure",
  "safeToUpdateUiState",
  "safeToNotifyUser",
  "safeToRunBrokerAction",
  "safeToRunAvanzaBrowserAction",
  "automaticModeAllowed",
  "implemented",
  "enabled",
  "authorityAllowed",
  "safeToExecute",
  "insertSuccessApprovesBoundary",
  "validatorReadinessExecutesCategory",
  "actionExecutionAllowed",
  "actionAuthorityAllowed",
  "browserActionAllowed",
  "kopSaljTriggerAllowed",
  "automaticModeApprovalAllowed",
  "insertSuccessApprovesPostInsertActions",
  "insertSuccessIsPostInsertApproval",
  "insertSuccessIsFullWorkflowCompletion",
  "validationReadinessIsActionExecution",
];

const BROKER_AVANZA_AUTHORITY_KEYS = [
  "brokerOrderFollowUpAllowed",
  "avanzaBrowserFollowUpAllowed",
  "safeToRunBrokerAction",
  "safeToRunAvanzaBrowserAction",
  "browserActionAllowed",
  "kopSaljTriggerAllowed",
];

const INSERT_SUCCESS_APPROVAL_KEYS = [
  "insertSuccessApprovesPostInsertActions",
  "insertSuccessIsPostInsertApproval",
  "insertSuccessIsFullWorkflowCompletion",
  "insertSuccessApprovesAuditAppend",
  "insertSuccessApprovesStatsPnlUpdate",
  "insertSuccessApprovesTradeMutation",
  "insertSuccessApprovesCorrectionRollback",
  "insertSuccessApprovesUiMutation",
  "insertSuccessApprovesNotification",
  "insertSuccessApprovesBrokerOrderFollowUp",
  "insertSuccessApprovesAvanzaBrowserFollowUp",
  "insertSuccessApprovesBoundary",
];

function addAuthorityReasons(
  buckets: ReasonBuckets,
  value: unknown,
): void {
  if (!isObject(value)) {
    return;
  }

  if (hasAnyTruthyFlag(value, ACTION_AUTHORITY_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "post_insert_action_requested_in_contract_phase",
    );
  }
  if (hasAnyTruthyFlag(value, BROKER_AVANZA_AUTHORITY_KEYS)) {
    addReason(buckets, "invalid", "broker_or_avanza_action_requested");
  }
  if (hasTruthyFlag(value, "automaticModeAllowed")) {
    addReason(buckets, "invalid", "automatic_mode_requested");
  }
  if (hasTruthyFlag(value, "automaticModeApprovalAllowed")) {
    addReason(buckets, "invalid", "automatic_mode_requested");
  }
  if (hasAnyTruthyFlag(value, INSERT_SUCCESS_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "insert_success_misinterpreted_as_action_approval",
    );
  }
}

function collectBlockedReasons(buckets: ReasonBuckets) {
  return uniqueValues([
    ...buckets.invalid,
    ...buckets.blocked,
    ...buckets.review,
  ]);
}

function statusFromBuckets(
  input: ExecutionRecordPostInsertBoundaryValidationInput | null | undefined,
  buckets: ReasonBuckets,
): ExecutionRecordPostInsertBoundaryValidationStatus {
  if (!input) {
    return "post_insert_boundary_validation_absent";
  }
  if (buckets.invalid.length > 0) {
    return "post_insert_boundary_validation_invalid";
  }
  if (buckets.blocked.length > 0) {
    return "post_insert_boundary_validation_blocked";
  }
  if (buckets.review.length > 0) {
    return "post_insert_boundary_validation_needs_review";
  }

  return "post_insert_boundary_validation_ready_for_design_only";
}

function decisionFromStatus(
  status: ExecutionRecordPostInsertBoundaryValidationStatus,
): ExecutionRecordPostInsertBoundaryValidationDecisionRecommendation {
  switch (status) {
    case "post_insert_boundary_validation_ready_for_design_only":
      return "design_only_do_not_run_post_insert_actions";
    case "post_insert_boundary_validation_needs_review":
      return "needs_manual_review";
    case "post_insert_boundary_validation_invalid":
      return "invalid_do_not_run_post_insert_actions";
    case "post_insert_boundary_validation_absent":
      return "future_boundary_required";
    case "post_insert_boundary_validation_blocked":
    default:
      return "blocked_do_not_run_post_insert_actions";
  }
}

function collectWarnings(
  blockedReasons: ExecutionRecordPostInsertBoundaryValidationBlockedReason[],
): ExecutionRecordPostInsertBoundaryValidationWarning[] {
  const warnings: ExecutionRecordPostInsertBoundaryValidationWarning[] = [
    ...BASE_WARNINGS,
  ];

  if (blockedReasons.includes("generated_types_absent_or_unknown")) {
    warnings.push("generated_types_required_before_post_insert_validation");
  }
  if (blockedReasons.includes("migration_application_not_proven")) {
    warnings.push("migration_application_required_before_post_insert_validation");
  }
  if (blockedReasons.includes("rls_security_unverified")) {
    warnings.push("rls_security_required_before_post_insert_validation");
  }
  if (blockedReasons.includes("server_only_boundary_unverified")) {
    warnings.push("server_only_boundary_required_before_post_insert_validation");
  }
  if (blockedReasons.includes("idempotency_missing")) {
    warnings.push("idempotency_required");
  }
  if (blockedReasons.includes("duplicate_prevention_missing")) {
    warnings.push("duplicate_prevention_required");
  }
  if (blockedReasons.includes("evidence_provenance_missing")) {
    warnings.push("evidence_provenance_required");
  }
  if (blockedReasons.length > 0) {
    warnings.push("manual_review_may_be_required");
  }

  return uniqueValues(warnings);
}

function collectReviewItems(
  blockedReasons: ExecutionRecordPostInsertBoundaryValidationBlockedReason[],
): ExecutionRecordPostInsertBoundaryValidationReviewItem[] {
  return blockedReasons.length > 0 ? ALL_REVIEW_ITEMS : [];
}

function collectCategoryAuthorityReasons(
  buckets: ReasonBuckets,
  categorySummaries: ExecutionRecordPostInsertBoundaryCategorySummaries | null,
): void {
  if (!categorySummaries) {
    return;
  }

  Object.values(categorySummaries).forEach((summary) => {
    addAuthorityReasons(buckets, summary);
  });
}

function validateBoundaryInput(
  input: ExecutionRecordPostInsertBoundaryValidationInput | null | undefined,
): ReasonBuckets {
  const buckets: ReasonBuckets = { blocked: [], invalid: [], review: [] };
  const boundaryInput = input?.boundaryInput ?? null;

  if (!input || !boundaryInput) {
    addReason(buckets, "blocked", "post_insert_boundary_input_missing");
    return buckets;
  }

  const evidence =
    input.executionRecordEvidence ?? boundaryInput.executionRecordEvidence ?? null;
  const idempotency = input.idempotency ?? boundaryInput.idempotency ?? null;
  const categories =
    input.boundaryCategorySummaries ?? boundaryInput.categorySummaries ?? null;
  const dependencies = input.boundaryResult?.dependencies ?? null;

  addAuthorityReasons(buckets, input.authority);
  addAuthorityReasons(buckets, input.safetyPolicy);
  addAuthorityReasons(buckets, boundaryInput.authority);
  addAuthorityReasons(buckets, boundaryInput.safetyPolicy);
  addAuthorityReasons(buckets, input.boundaryResult?.authority);
  addAuthorityReasons(buckets, input.boundaryResult?.safetyPolicy);
  addAuthorityReasons(buckets, input.boundaryResult);
  collectCategoryAuthorityReasons(buckets, categories);

  if (evidence?.insertResultProven !== true) {
    addReason(buckets, "blocked", "execution_record_insert_not_proven");
  }

  if (
    !hasText(input.executionRecordId) &&
    !hasText(boundaryInput.executionRecordId) &&
    !isObject(input.executionRecordReference) &&
    !isObject(boundaryInput.executionRecordReference)
  ) {
    addReason(buckets, "blocked", "execution_record_reference_missing");
  }

  if (!evidence) {
    addReason(buckets, "blocked", "execution_record_evidence_missing");
  }
  if (evidence?.executionRecordEvidencePresent !== true) {
    addReason(buckets, "blocked", "execution_record_evidence_missing");
  }
  if (evidence?.executionRecordEvidenceProvenancePresent !== true) {
    addReason(buckets, "blocked", "evidence_provenance_missing");
  }

  if (!idempotency || idempotency.idempotencyMetadataPresent !== true) {
    addReason(buckets, "blocked", "idempotency_missing");
  }
  if (
    idempotency?.duplicatePreventionMetadataPresent !== true ||
    idempotency.duplicateSideEffectsPrevented !== true ||
    !isObject(input.duplicatePrevention) && !isObject(boundaryInput.duplicatePrevention)
  ) {
    addReason(buckets, "blocked", "duplicate_prevention_missing");
  }

  if (
    evidence?.generatedTypesProofPresent !== true ||
    dependencies?.generatedTypesPresent !== true ||
    (!isObject(input.generatedTypesProof) &&
      !isObject(boundaryInput.generatedTypesProof))
  ) {
    addReason(buckets, "blocked", "generated_types_absent_or_unknown");
  }
  if (
    evidence?.migrationProofPresent !== true ||
    dependencies?.migrationApplicationProven !== true ||
    (!isObject(input.migrationProof) && !isObject(boundaryInput.migrationProof))
  ) {
    addReason(buckets, "blocked", "migration_application_not_proven");
  }
  if (
    evidence?.rlsSecurityProofPresent !== true ||
    dependencies?.rlsSecurityVerified !== true ||
    (!isObject(input.rlsSecurityProof) && !isObject(boundaryInput.rlsSecurityProof))
  ) {
    addReason(buckets, "blocked", "rls_security_unverified");
  }
  if (
    evidence?.serverOnlyProofPresent !== true ||
    dependencies?.serverOnlyBoundaryVerified !== true ||
    (!isObject(input.serverOnlyProof) && !isObject(boundaryInput.serverOnlyProof))
  ) {
    addReason(buckets, "blocked", "server_only_boundary_unverified");
  }

  if (!categories?.auditAppend) {
    addReason(buckets, "blocked", "audit_boundary_missing");
  }
  if (!categories?.statsPnlUpdate) {
    addReason(buckets, "blocked", "stats_pnl_boundary_missing");
  }
  if (!categories?.tradeReconciliation) {
    addReason(buckets, "blocked", "trade_reconciliation_boundary_missing");
  }
  if (!categories?.correctionRollback) {
    addReason(buckets, "blocked", "correction_rollback_boundary_missing");
  }
  if (!categories?.failureRecovery) {
    addReason(buckets, "blocked", "failure_recovery_boundary_missing");
  }
  if (!categories?.uiStateUpdate) {
    addReason(buckets, "blocked", "ui_state_boundary_missing");
  }
  if (!categories?.userNotification) {
    addReason(buckets, "blocked", "notification_boundary_missing");
  }
  if (!categories?.brokerOrderFollowUp) {
    addReason(buckets, "blocked", "broker_order_boundary_missing");
  }
  if (!categories?.avanzaBrowserFollowUp) {
    addReason(buckets, "blocked", "avanza_browser_boundary_missing");
  }

  return buckets;
}

function categoryBase(
  categoryName: string,
  boundarySummary: ExecutionRecordPostInsertBoundaryCategorySummary | null,
  blockedReasons: ExecutionRecordPostInsertBoundaryValidationBlockedReason[],
  warnings: ExecutionRecordPostInsertBoundaryValidationWarning[],
  reviewItems: ExecutionRecordPostInsertBoundaryValidationReviewItem[],
) {
  return {
    categoryName,
    boundarySummaryPresent: Boolean(boundarySummary),
    categoryValidatedSeparately: true as const,
    validationOnly: true as const,
    designOnly: true as const,
    readyForDesignOnly: Boolean(boundarySummary) && blockedReasons.length === 0,
    actionExecutionAllowed: false as const,
    actionAuthorityAllowed: false as const,
    insertSuccessApprovesCategory: false as const,
    validatorReadinessExecutesCategory: false as const,
    evidencePresent: Boolean(boundarySummary?.requiresSeparateEvidence),
    idempotencyPresent: Boolean(boundarySummary?.requiresSeparateIdempotency),
    duplicatePreventionPresent: Boolean(
      boundarySummary?.requiresSeparateIdempotency,
    ),
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function categoryValidations(
  categories: ExecutionRecordPostInsertBoundaryCategorySummaries | null,
  blockedReasons: ExecutionRecordPostInsertBoundaryValidationBlockedReason[],
  warnings: ExecutionRecordPostInsertBoundaryValidationWarning[],
  reviewItems: ExecutionRecordPostInsertBoundaryValidationReviewItem[],
): ExecutionRecordPostInsertBoundaryValidationCategorySummaries {
  const auditAppend = categories?.auditAppend ?? null;
  const statsPnlUpdate = categories?.statsPnlUpdate ?? null;
  const tradeReconciliation = categories?.tradeReconciliation ?? null;
  const correctionRollback = categories?.correctionRollback ?? null;
  const failureRecovery = categories?.failureRecovery ?? null;
  const uiStateUpdate = categories?.uiStateUpdate ?? null;
  const userNotification = categories?.userNotification ?? null;
  const brokerOrderFollowUp = categories?.brokerOrderFollowUp ?? null;
  const avanzaBrowserFollowUp = categories?.avanzaBrowserFollowUp ?? null;

  return {
    auditAppend: {
      ...categoryBase(
        "audit_append",
        auditAppend,
        blockedReasons,
        warnings,
        reviewItems,
      ),
      categoryName: "audit_append",
      boundarySummary: auditAppend,
      auditAppendAllowed: false,
      safeToAppendAudit: false,
      statsPnlAuthority: false,
      tradeMutationAuthority: false,
    } satisfies ExecutionRecordAuditAppendBoundaryValidationSummary,
    statsPnlUpdate: {
      ...categoryBase(
        "stats_pnl_update",
        statsPnlUpdate,
        blockedReasons,
        warnings,
        reviewItems,
      ),
      categoryName: "stats_pnl_update",
      boundarySummary: statsPnlUpdate,
      statsPnlUpdateAllowed: false,
      safeToUpdateStats: false,
      auditAppendAuthority: false,
      tradeMutationAuthority: false,
    } satisfies ExecutionRecordStatsPnlUpdateBoundaryValidationSummary,
    tradeReconciliation: {
      ...categoryBase(
        "trade_reconciliation",
        tradeReconciliation,
        blockedReasons,
        warnings,
        reviewItems,
      ),
      categoryName: "trade_reconciliation",
      boundarySummary: tradeReconciliation,
      tradeReconciliationAllowed: false,
      tradeMutationAllowed: false,
      safeToReconcileTrade: false,
      safeToMutateTrade: false,
      brokerOrderAuthority: false,
      avanzaBrowserAuthority: false,
    } satisfies ExecutionRecordTradeReconciliationBoundaryValidationSummary,
    correctionRollback: {
      ...categoryBase(
        "correction_rollback",
        correctionRollback,
        blockedReasons,
        warnings,
        reviewItems,
      ),
      categoryName: "correction_rollback",
      boundarySummary: correctionRollback,
      correctionRollbackAllowed: false,
      safeToRollback: false,
      originalInsertMutationAllowed: false,
    } satisfies ExecutionRecordCorrectionRollbackBoundaryValidationSummary,
    failureRecovery: {
      ...categoryBase(
        "failure_recovery",
        failureRecovery,
        blockedReasons,
        warnings,
        reviewItems,
      ),
      categoryName: "failure_recovery",
      boundarySummary: failureRecovery,
      failureRecoveryAllowed: false,
      safeToRecoverFailure: false,
      normalSuccessPathAuthority: false,
    } satisfies ExecutionRecordFailureRecoveryBoundaryValidationSummary,
    uiStateUpdate: {
      ...categoryBase(
        "ui_state_update",
        uiStateUpdate,
        blockedReasons,
        warnings,
        reviewItems,
      ),
      categoryName: "ui_state_update",
      boundarySummary: uiStateUpdate,
      uiStateMutationAllowed: false,
      safeToUpdateUiState: false,
      localOnlySourceOfTruthAllowed: false,
    } satisfies ExecutionRecordUiStateUpdateBoundaryValidationSummary,
    userNotification: {
      ...categoryBase(
        "user_notification",
        userNotification,
        blockedReasons,
        warnings,
        reviewItems,
      ),
      categoryName: "user_notification",
      boundarySummary: userNotification,
      userNotificationAllowed: false,
      safeToNotifyUser: false,
      brokerOrderExecutionImplicationAllowed: false,
      avanzaBrowserCompletionImplicationAllowed: false,
    } satisfies ExecutionRecordUserNotificationBoundaryValidationSummary,
    brokerOrderFollowUp: {
      ...categoryBase(
        "broker_order_follow_up",
        brokerOrderFollowUp,
        blockedReasons,
        warnings,
        reviewItems,
      ),
      categoryName: "broker_order_follow_up",
      boundarySummary: brokerOrderFollowUp,
      brokerOrderFollowUpAllowed: false,
      safeToRunBrokerAction: false,
      kopSaljTriggerAllowed: false,
      automaticModeApprovalAllowed: false,
      disabledUnlessSeparatelyApproved: true,
    } satisfies ExecutionRecordBrokerOrderFollowUpBoundaryValidationSummary,
    avanzaBrowserFollowUp: {
      ...categoryBase(
        "avanza_browser_follow_up",
        avanzaBrowserFollowUp,
        blockedReasons,
        warnings,
        reviewItems,
      ),
      categoryName: "avanza_browser_follow_up",
      boundarySummary: avanzaBrowserFollowUp,
      avanzaBrowserFollowUpAllowed: false,
      safeToRunAvanzaBrowserAction: false,
      browserActionAllowed: false,
      kopSaljTriggerAllowed: false,
      automaticModeApprovalAllowed: false,
      disabledUnlessSeparatelyApproved: true,
    } satisfies ExecutionRecordAvanzaBrowserFollowUpBoundaryValidationSummary,
  };
}

export function validateExecutionRecordPostInsertBoundary(
  input: ExecutionRecordPostInsertBoundaryValidationInput | null | undefined,
): ExecutionRecordPostInsertBoundaryValidationResult {
  const buckets = validateBoundaryInput(input);
  const blockedReasons = collectBlockedReasons(buckets);
  const warnings = collectWarnings(blockedReasons);
  const reviewItems = collectReviewItems(blockedReasons);
  const status = statusFromBuckets(input, buckets);
  const boundaryInput = input?.boundaryInput ?? null;
  const boundaryResult = input?.boundaryResult ?? null;
  const evidence =
    input?.executionRecordEvidence ?? boundaryInput?.executionRecordEvidence ?? null;
  const idempotency = input?.idempotency ?? boundaryInput?.idempotency ?? null;
  const dependencies = boundaryResult?.dependencies ?? null;
  const failureModel = boundaryResult?.failureModel ?? null;
  const categories =
    input?.boundaryCategorySummaries ?? boundaryInput?.categorySummaries ?? null;
  const executionRecordId =
    input?.executionRecordId ?? boundaryInput?.executionRecordId ?? null;

  const safetyPolicy: ExecutionRecordPostInsertBoundaryValidationSafetyPolicy = {
    ...EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_DEFAULT_SAFETY_POLICY,
    boundaryContractAuthority: boundaryInput?.authority ?? null,
    boundarySafetyPolicy: boundaryInput?.safetyPolicy ?? null,
  };

  return {
    contractVersion: EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATOR_CONTRACT_VERSION,
    status,
    decisionRecommendation: decisionFromStatus(status),
    validationOnly: true,
    designOnly: true,
    validatorImplemented: false,
    validatorReadinessExecutesActions: false,
    insertSuccessApprovesPostInsertActions: false,
    insertSuccessIsFullWorkflowCompletion: false,
    authority:
      EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy,
    categoryValidations: categoryValidations(
      categories,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    evidence: {
      boundaryEvidence: evidence,
      executionRecordId,
      executionRecordReferencePresent:
        isObject(input?.executionRecordReference) ||
        isObject(boundaryInput?.executionRecordReference),
      insertedExecutionRecordSummaryPresent:
        isObject(input?.insertedExecutionRecordSummary) ||
        isObject(boundaryInput?.insertedRecordSummary),
      insertResultMetadataPresent:
        isObject(input?.futureExecutionRecordInsertResultMetadata) ||
        isObject(boundaryInput?.futureInsertResultMetadata) ||
        isObject(boundaryInput?.productionInsertRouteResult),
      normalizedExecutionRecordInputPresent:
        isObject(input?.normalizedExecutionRecordInput) ||
        isObject(boundaryInput?.normalizedExecutionRecordInput),
      executionRecordEvidencePresent:
        evidence?.executionRecordEvidencePresent === true,
      evidenceProvenancePresent:
        evidence?.executionRecordEvidenceProvenancePresent === true,
      generatedTypesProofPresent: evidence?.generatedTypesProofPresent === true,
      migrationProofPresent: evidence?.migrationProofPresent === true,
      rlsSecurityProofPresent: evidence?.rlsSecurityProofPresent === true,
      serverOnlyProofPresent: evidence?.serverOnlyProofPresent === true,
      auditCorrectionMetadataPresent:
        isObject(input?.auditCorrectionMetadata) ||
        isObject(boundaryInput?.auditCorrectionMetadata),
      currentTradeStatePresent:
        isObject(input?.currentTradeState) ||
        isObject(boundaryInput?.currentTradeState),
      statsPnlCalculationSourcePresent:
        isObject(input?.statsPnlCalculationSource) ||
        isObject(boundaryInput?.statsPnlCalculationSource),
      uiStateSourceOfTruthPresent:
        isObject(input?.uiStateSourceOfTruth) ||
        isObject(boundaryInput?.uiStateSourceOfTruth),
      notificationContextPresent:
        isObject(input?.notificationContext) ||
        isObject(boundaryInput?.notificationContext),
      brokerOrderFollowUpMetadataPresent:
        isObject(input?.brokerOrderFollowUpMetadata) ||
        isObject(boundaryInput?.brokerOrderFollowUpMetadata),
      avanzaBrowserFollowUpMetadataPresent:
        isObject(input?.avanzaBrowserFollowUpMetadata) ||
        isObject(boundaryInput?.avanzaBrowserFollowUpMetadata),
      blockedReasons,
      warnings,
      reviewItems,
    } satisfies ExecutionRecordPostInsertBoundaryValidationEvidenceSummary,
    idempotency: {
      boundaryIdempotency: idempotency,
      idempotencyPresent: idempotency?.idempotencyMetadataPresent === true,
      duplicatePreventionPresent:
        idempotency?.duplicatePreventionMetadataPresent === true,
      stableExecutionRecordReferencePresent: hasText(executionRecordId),
      duplicateSideEffectPreventionPresent:
        idempotency?.duplicateSideEffectsPrevented === true,
      retryWithoutIdempotencyBlocked: true,
      conflictingDuplicateDetected:
        idempotency?.conflictingDuplicateDetected === true,
      safeToRetryPostInsertAction: false,
      blockedReasons,
      warnings,
      reviewItems,
    } satisfies ExecutionRecordPostInsertBoundaryValidationIdempotencySummary,
    failureModel: {
      boundaryFailureModel: failureModel,
      partialFailureRepresentable:
        failureModel?.partialFailureStatesKnown === true,
      insertSuccessAuditBlockedRepresented:
        failureModel?.insertSucceededPostInsertFailedPossible === true,
      auditSuccessStatsBlockedRepresented:
        failureModel?.auditSucceededStatsFailedPossible === true,
      statsSuccessTradeReconciliationBlockedRepresented:
        failureModel?.statsSucceededTradeMutationFailedPossible === true,
      uiUpdateBlockedRepresented: failureModel?.uiRefreshFailedPossible === true,
      notificationBlockedRepresented:
        failureModel?.notificationFailedPossible === true,
      brokerAvanzaBlockedUnlessApproved: true,
      manualReviewStatesPresent: failureModel?.userVisibleReviewRequired === true,
      hiddenPartialFailureAllowed: false,
      blockedReasons,
      warnings,
      reviewItems,
    } satisfies ExecutionRecordPostInsertBoundaryValidationFailureModelSummary,
    dependencies: {
      boundaryDependencies: dependencies,
      productionInsertRoutePresent:
        dependencies?.productionInsertRouteImplemented === true,
      productionInsertWritePathPresent:
        dependencies?.productionInsertRouteCalled === true,
      generatedTypesPresent: dependencies?.generatedTypesPresent === true,
      migrationApplicationProven:
        dependencies?.migrationApplicationProven === true,
      rlsSecurityVerified: dependencies?.rlsSecurityVerified === true,
      serverOnlyBoundaryVerified:
        dependencies?.serverOnlyBoundaryVerified === true,
      postInsertBoundaryContractPresent: Boolean(boundaryInput),
      postInsertValidatorImplementationPresent: false,
      postInsertOrchestratorPresent: false,
      postInsertActionsImplemented: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    blockedReasons,
    warnings,
    reviewItems,
    metadata: {
      validatorPure: true,
      validatorDeterministic: true,
      noRouteCall: true,
      noPersistenceWrite: true,
      noPostInsertActions: true,
      brokerAvanzaDisabled: true,
      inputMetadata: input?.metadata ?? null,
    },
  };
}
