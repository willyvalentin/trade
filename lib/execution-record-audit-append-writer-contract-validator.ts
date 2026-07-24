import {
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_DEFAULT_SAFETY_POLICY,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordAuditAppendWriterContractDependencyValidationSummary,
  type ExecutionRecordAuditAppendWriterContractEvidenceProvenanceSummary,
  type ExecutionRecordAuditAppendWriterContractIdempotencyDuplicatePreventionSummary,
  type ExecutionRecordAuditAppendWriterContractInputShapeValidationSummary,
  type ExecutionRecordAuditAppendWriterContractNoWriteNoActionSafetySummary,
  type ExecutionRecordAuditAppendWriterContractResultShapeValidationSummary,
  type ExecutionRecordAuditAppendWriterContractSchemaTypeDependencySummary,
  type ExecutionRecordAuditAppendWriterContractServerOnlySecurityDependencySummary,
  type ExecutionRecordAuditAppendWriterContractValidationBlockedReason,
  type ExecutionRecordAuditAppendWriterContractValidationDecisionRecommendation,
  type ExecutionRecordAuditAppendWriterContractValidationInput,
  type ExecutionRecordAuditAppendWriterContractValidationResult,
  type ExecutionRecordAuditAppendWriterContractValidationReviewItem,
  type ExecutionRecordAuditAppendWriterContractValidationStatus,
  type ExecutionRecordAuditAppendWriterContractValidationWarning,
} from "@/lib/execution-record-audit-append-writer-contract-validator-contract";

// Pure audit append writer contract validation only. This module does not
// execute an audit writer, append/write audit data, call routes, create records,
// persist/write, write Supabase/localStorage, update stats/PnL, roll
// back/correct, mutate or reconcile trades, update UI, notify users, run
// broker/order behavior, automate Avanza/browser behavior, or enable automatic
// mode.

type ReasonBuckets = {
  blocked: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[];
  invalid: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[];
  review: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[];
};

const BASE_WARNINGS: ExecutionRecordAuditAppendWriterContractValidationWarning[] =
  [
    "contract_only",
    "contract_validator_not_implemented",
    "audit_writer_not_implemented",
    "audit_route_not_implemented",
    "audit_write_not_executed",
    "contract_validation_not_audit_write_approval",
    "contract_validation_not_security_proof",
    "contract_validation_not_server_only_proof",
    "contract_validation_not_schema_proof",
    "checklist_not_security_proof",
    "dev_preview_not_write_approval",
    "writer_validator_readiness_not_write_approval",
    "writer_contract_readiness_not_write_approval",
    "insert_success_not_audit_write_approval",
    "audit_write_success_not_downstream_approval",
    "server_only_required",
    "service_role_must_not_be_exposed",
    "client_side_write_not_allowed",
    "audit_schema_table_proof_required",
    "generated_audit_types_required_if_schema_backed",
    "generated_execution_record_types_not_enough",
    "migration_proof_required",
    "rls_security_proof_required",
    "idempotency_required",
    "duplicate_prevention_required",
    "evidence_provenance_required",
    "automatic_mode_not_enabled",
  ];

const ALL_REVIEW_ITEMS: ExecutionRecordAuditAppendWriterContractValidationReviewItem[] =
  [
    "audit_append_writer_contract_validator_contract_review",
    "contract_validation_input_review",
    "writer_contract_input_shape_review",
    "writer_contract_result_shape_review",
    "writer_validator_result_review",
    "server_only_security_dependency_review",
    "service_role_exposure_review",
    "client_side_write_risk_review",
    "schema_type_dependency_review",
    "generated_types_dependency_review",
    "migration_dependency_review",
    "rls_security_dependency_review",
    "idempotency_duplicate_prevention_review",
    "evidence_provenance_review",
    "authority_flags_review",
    "manual_review",
    "downstream_authority_review",
    "broker_avanza_safety_review",
  ];

const AUDIT_WRITE_KEYS = [
  "auditWriteAllowed",
  "safeToWriteAudit",
  "auditWriteExecuted",
  "auditWriteRequested",
  "safeToWriteDuplicateAuditEvent",
];

const AUDIT_APPEND_KEYS = [
  "auditAppendAllowed",
  "safeToAppendAudit",
  "auditAppendRequested",
  "auditAppendAttempted",
  "auditAppendImplemented",
  "auditWriterExecutionRequested",
  "writerExecutionRequested",
];

const ROUTE_KEYS = [
  "routeCallAllowed",
  "routeCallRequested",
  "auditRouteCalled",
  "auditRouteImplemented",
];

const RECORD_CREATION_KEYS = [
  "recordCreationAllowed",
  "recordCreationRequested",
  "executionRecordCreationRequested",
];

const PERSISTENCE_KEYS = [
  "persistenceWriteAllowed",
  "persistenceWriteRequested",
  "supabaseWriteAllowed",
  "supabaseWriteRequested",
  "localStorageWriteAllowed",
  "localStorageWriteRequested",
];

const STATS_KEYS = [
  "statsPnlUpdateAllowed",
  "safeToUpdateStats",
  "statsPnlUpdateRequested",
  "contractValidationSuccessApprovesStatsPnlUpdate",
];

const TRADE_MUTATION_KEYS = [
  "tradeMutationAllowed",
  "safeToMutateTrade",
  "tradeMutationRequested",
  "contractValidationSuccessApprovesTradeMutation",
];

const TRADE_RECONCILIATION_KEYS = [
  "tradeReconciliationAllowed",
  "safeToReconcileTrade",
  "tradeReconciliationRequested",
  "contractValidationSuccessApprovesTradeReconciliation",
];

const ROLLBACK_KEYS = [
  "correctionRollbackAllowed",
  "safeToRollback",
  "rollbackCorrectionRequested",
  "contractValidationSuccessApprovesCorrectionRollback",
];

const UI_KEYS = [
  "uiStateMutationAllowed",
  "safeToUpdateUiState",
  "uiUpdateRequested",
  "contractValidationSuccessApprovesUiUpdate",
];

const NOTIFICATION_KEYS = [
  "userNotificationAllowed",
  "safeToNotifyUser",
  "notificationRequested",
  "contractValidationSuccessApprovesNotification",
];

const BROKER_AVANZA_KEYS = [
  "brokerOrderFollowUpAllowed",
  "avanzaBrowserFollowUpAllowed",
  "safeToRunBrokerAction",
  "safeToRunAvanzaBrowserAction",
  "brokerOrderRequested",
  "avanzaBrowserRequested",
  "contractValidationSuccessApprovesBrokerOrderFollowUp",
  "contractValidationSuccessApprovesAvanzaBrowserFollowUp",
];

const AUTOMATIC_KEYS = [
  "automaticModeAllowed",
  "automaticModeRequested",
  "contractValidationSuccessApprovesAutomaticMode",
];

const CHECKLIST_PROOF_KEYS = [
  "checklistStatusIsSecurityProof",
  "checklistStatusTreatedAsProof",
];

const DEV_PREVIEW_PROOF_KEYS = [
  "devPreviewDiagnosticsAreProof",
  "devPreviewDiagnosticsAreAuditWriteApproval",
];

const WRITER_VALIDATOR_APPROVAL_KEYS = [
  "writerValidatorReadinessIsAuditWriteApproval",
  "writerValidatorReadinessIsWriteApproval",
  "writerValidatorReadinessMisinterpretedAsWriteApproval",
];

const WRITER_CONTRACT_APPROVAL_KEYS = [
  "writerContractReadinessIsAuditWriteApproval",
  "writerContractReadinessIsWriteApproval",
];

const CONTRACT_VALIDATION_APPROVAL_KEYS = [
  "contractValidationIsAuditWriteApproval",
  "contractValidationMisinterpretedAsWriteApproval",
];

const PROOF_CONFUSION_KEYS = [
  "contractValidationIsSecurityProof",
  "contractValidationIsServerOnlyProof",
  "contractValidationIsSchemaProof",
  "contractValidationIsGeneratedTypesProof",
  "contractValidationIsMigrationProof",
  "contractValidationIsRlsSecurityProof",
];

const INSERT_SUCCESS_APPROVAL_KEYS = [
  "insertSuccessIsAuditWriteApproval",
  "insertSuccessApprovesAuditWrite",
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

function hasAnyTruthyFlag(value: unknown, keys: string[]): boolean {
  return keys.some((key) => hasTruthyFlag(value, key));
}

function addReason(
  buckets: ReasonBuckets,
  bucket: keyof ReasonBuckets,
  reason: ExecutionRecordAuditAppendWriterContractValidationBlockedReason,
): void {
  buckets[bucket].push(reason);
}

function addAuthorityReasons(buckets: ReasonBuckets, value: unknown): void {
  if (!isObject(value)) {
    return;
  }

  if (hasAnyTruthyFlag(value, AUDIT_WRITE_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "write_requested_in_contract_validation_phase",
    );
  }
  if (hasAnyTruthyFlag(value, AUDIT_APPEND_KEYS)) {
    addReason(buckets, "invalid", "audit_append_requested");
  }
  if (hasAnyTruthyFlag(value, ROUTE_KEYS)) {
    addReason(buckets, "invalid", "route_call_requested");
  }
  if (hasAnyTruthyFlag(value, RECORD_CREATION_KEYS)) {
    addReason(buckets, "invalid", "write_requested_in_contract_validation_phase");
  }
  if (hasAnyTruthyFlag(value, PERSISTENCE_KEYS)) {
    addReason(buckets, "invalid", "write_requested_in_contract_validation_phase");
  }
  if (hasAnyTruthyFlag(value, STATS_KEYS)) {
    addReason(buckets, "invalid", "stats_pnl_update_requested");
  }
  if (hasAnyTruthyFlag(value, TRADE_MUTATION_KEYS)) {
    addReason(buckets, "invalid", "trade_mutation_requested");
  }
  if (hasAnyTruthyFlag(value, TRADE_RECONCILIATION_KEYS)) {
    addReason(buckets, "invalid", "trade_reconciliation_requested");
  }
  if (hasAnyTruthyFlag(value, ROLLBACK_KEYS)) {
    addReason(buckets, "invalid", "rollback_correction_requested");
  }
  if (hasAnyTruthyFlag(value, UI_KEYS)) {
    addReason(buckets, "invalid", "ui_update_requested");
  }
  if (hasAnyTruthyFlag(value, NOTIFICATION_KEYS)) {
    addReason(buckets, "invalid", "notification_requested");
  }
  if (hasAnyTruthyFlag(value, BROKER_AVANZA_KEYS)) {
    addReason(buckets, "invalid", "broker_or_avanza_action_requested");
  }
  if (hasAnyTruthyFlag(value, AUTOMATIC_KEYS)) {
    addReason(buckets, "invalid", "automatic_mode_requested");
  }
  if (hasAnyTruthyFlag(value, CHECKLIST_PROOF_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "checklist_misinterpreted_as_security_proof",
    );
  }
  if (hasAnyTruthyFlag(value, DEV_PREVIEW_PROOF_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "dev_preview_diagnostics_misinterpreted_as_proof",
    );
  }
  if (hasAnyTruthyFlag(value, WRITER_VALIDATOR_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "writer_validator_readiness_misinterpreted_as_write_approval",
    );
  }
  if (hasAnyTruthyFlag(value, WRITER_CONTRACT_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "writer_validator_readiness_misinterpreted_as_write_approval",
    );
  }
  if (hasAnyTruthyFlag(value, CONTRACT_VALIDATION_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "contract_validation_misinterpreted_as_write_approval",
    );
  }
  if (hasAnyTruthyFlag(value, PROOF_CONFUSION_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "contract_validation_misinterpreted_as_write_approval",
    );
  }
  if (hasAnyTruthyFlag(value, INSERT_SUCCESS_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "contract_validation_misinterpreted_as_write_approval",
    );
  }
  if (
    hasTruthyFlag(value, "serviceRoleSecretExposed") ||
    hasTruthyFlag(value, "serviceRoleSecretValueIncluded") ||
    hasTruthyFlag(value, "serviceRoleExposureRisk")
  ) {
    addReason(buckets, "invalid", "service_role_exposure_risk");
  }
  if (
    hasTruthyFlag(value, "clientSideWriteRisk") ||
    hasTruthyFlag(value, "clientSideAuditWriteRisk") ||
    hasTruthyFlag(value, "clientSideWriteAllowed") ||
    hasTruthyFlag(value, "safeToWriteFromClient")
  ) {
    addReason(buckets, "invalid", "client_side_write_risk");
  }
}

function collectBlockedReasons(
  buckets: ReasonBuckets,
): ExecutionRecordAuditAppendWriterContractValidationBlockedReason[] {
  return uniqueValues([
    ...buckets.invalid,
    ...buckets.blocked,
    ...buckets.review,
  ]);
}

function statusFromBuckets(
  input: ExecutionRecordAuditAppendWriterContractValidationInput | null | undefined,
  buckets: ReasonBuckets,
): ExecutionRecordAuditAppendWriterContractValidationStatus {
  if (!input) {
    return "audit_append_writer_contract_validation_absent";
  }
  if (buckets.invalid.length > 0) {
    return "audit_append_writer_contract_validation_invalid";
  }
  if (buckets.blocked.length > 0) {
    return "audit_append_writer_contract_validation_blocked";
  }
  if (buckets.review.length > 0) {
    return "audit_append_writer_contract_validation_needs_review";
  }
  return "audit_append_writer_contract_validation_ready_for_design_only";
}

function decisionFromStatus(
  status: ExecutionRecordAuditAppendWriterContractValidationStatus,
): ExecutionRecordAuditAppendWriterContractValidationDecisionRecommendation {
  switch (status) {
    case "audit_append_writer_contract_validation_ready_for_design_only":
      return "design_only_do_not_write_audit";
    case "audit_append_writer_contract_validation_needs_review":
      return "needs_manual_review";
    case "audit_append_writer_contract_validation_invalid":
      return "invalid_do_not_write_audit";
    case "audit_append_writer_contract_validation_absent":
      return "future_writer_contract_validator_required";
    case "audit_append_writer_contract_validation_blocked":
      return "blocked_do_not_write_audit";
    default:
      return "future_writer_contract_validator_required";
  }
}

function collectWarnings(
  blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[],
): ExecutionRecordAuditAppendWriterContractValidationWarning[] {
  const warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[] = [
    ...BASE_WARNINGS,
  ];

  if (blockedReasons.length > 0) {
    warnings.push("manual_review_may_be_required");
  }

  return uniqueValues(warnings);
}

function collectReviewItems(
  blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[],
): ExecutionRecordAuditAppendWriterContractValidationReviewItem[] {
  return blockedReasons.length > 0 ? ALL_REVIEW_ITEMS : [];
}

function validateInput(
  input: ExecutionRecordAuditAppendWriterContractValidationInput | null | undefined,
): ReasonBuckets {
  const buckets: ReasonBuckets = { blocked: [], invalid: [], review: [] };

  if (!input) {
    addReason(buckets, "blocked", "contract_validation_input_missing");
    return buckets;
  }

  if (!input.auditWriterContractInput) {
    addReason(buckets, "blocked", "writer_contract_input_missing");
  }
  if (!input.auditWriterContractResult) {
    addReason(buckets, "blocked", "writer_contract_result_missing");
  }
  if (!input.writerValidatorResult) {
    addReason(buckets, "blocked", "writer_validator_result_missing");
  }
  if (!input.inputShape.executionRecordReferencePresent) {
    addReason(buckets, "blocked", "execution_record_reference_missing");
  }
  if (!input.inputShape.auditEventCandidatePresent) {
    addReason(buckets, "blocked", "audit_event_candidate_missing");
  }
  if (!input.inputShape.evidenceProvenancePresent) {
    addReason(buckets, "blocked", "evidence_provenance_missing");
  }
  if (!input.inputShape.idempotencyKeyPresent) {
    addReason(buckets, "blocked", "idempotency_key_missing");
  }
  if (!input.inputShape.duplicatePreventionKeyPresent) {
    addReason(buckets, "blocked", "duplicate_prevention_key_missing");
  }
  if (!input.inputShape.serverOnlySecurityPlaceholderPresent) {
    addReason(buckets, "blocked", "server_only_security_placeholder_missing");
  }
  if (!input.inputShape.auditSchemaTablePlaceholderPresent) {
    addReason(buckets, "blocked", "audit_schema_table_placeholder_missing");
  }
  if (!input.resultShape.writerContractResultPresent) {
    addReason(buckets, "blocked", "writer_contract_result_missing");
  }
  if (
    !input.resultShape.noWriteNoActionStatusPresent ||
    !input.resultShape.authorityFlagsPresent ||
    !input.resultShape.allAuthorityFlagsFalse ||
    !input.resultShape.downstreamNoAuthorityPreserved
  ) {
    addReason(buckets, "invalid", "downstream_authority_present");
  }
  if (!input.serverOnlySecurity.serverOnlyProofPresent) {
    addReason(buckets, "blocked", "server_only_proof_missing");
  }
  if (!input.serverOnlySecurity.serviceRoleProofPresent) {
    addReason(buckets, "blocked", "service_role_proof_missing");
  }
  if (input.serverOnlySecurity.serviceRoleExposureRisk) {
    addReason(buckets, "invalid", "service_role_exposure_risk");
  }
  if (input.serverOnlySecurity.clientSideWriteRisk) {
    addReason(buckets, "invalid", "client_side_write_risk");
  }
  if (input.serverOnlySecurity.checklistStatusTreatedAsProof) {
    addReason(
      buckets,
      "invalid",
      "checklist_misinterpreted_as_security_proof",
    );
  }
  if (!input.schemaType.auditSchemaTableProofPresent) {
    addReason(buckets, "blocked", "audit_schema_table_proof_missing");
  }
  if (
    !input.schemaType.generatedTypesProofPresent ||
    !input.schemaType.generatedAuditTypesPresent
  ) {
    addReason(buckets, "blocked", "generated_audit_types_missing");
  }
  if (input.schemaType.generatedExecutionRecordTypesAssumedEnough) {
    addReason(
      buckets,
      "invalid",
      "generated_execution_record_types_assumed_enough",
    );
  }
  if (!input.schemaType.migrationProofPresent) {
    addReason(buckets, "blocked", "migration_proof_missing");
  }
  if (!input.schemaType.rlsSecurityProofPresent) {
    addReason(buckets, "blocked", "rls_security_proof_missing");
  }
  if (
    !input.idempotencyDuplicatePrevention.idempotencyKeyPresent ||
    !input.idempotencyDuplicatePrevention.idempotencyMetadataComplete
  ) {
    addReason(buckets, "blocked", "idempotency_incomplete");
  }
  if (
    !input.idempotencyDuplicatePrevention.duplicatePreventionKeyPresent ||
    !input.idempotencyDuplicatePrevention.duplicatePreventionMetadataComplete
  ) {
    addReason(buckets, "blocked", "duplicate_prevention_incomplete");
  }
  if (
    !input.evidenceProvenance.executionRecordReferencePresent ||
    !input.evidenceProvenance.evidenceProvenancePresent ||
    !input.evidenceProvenance.auditEventCandidatePresent ||
    !input.evidenceProvenance.provenanceTraceComplete ||
    input.evidenceProvenance.sourceReferences.length === 0
  ) {
    addReason(buckets, "blocked", "evidence_provenance_incomplete");
  }
  if (
    input.noWriteNoAction.downstreamAuthorityPresent ||
    input.noWriteNoAction.brokerAvanzaActionAllowed ||
    input.noWriteNoAction.automaticModeAllowed
  ) {
    addReason(buckets, "invalid", "downstream_authority_present");
  }
  if (
    input.dependencies.checklistStatusIsProof ||
    input.dependencies.devPreviewDiagnosticsAreProof
  ) {
    addReason(
      buckets,
      "invalid",
      input.dependencies.checklistStatusIsProof
        ? "checklist_misinterpreted_as_security_proof"
        : "dev_preview_diagnostics_misinterpreted_as_proof",
    );
  }

  const valuesToScan: unknown[] = [
    input,
    input.metadata,
    input.auditWriterContractInput,
    input.auditWriterContractResult,
    input.writerValidatorResult,
    input.inputShape,
    input.resultShape,
    input.serverOnlySecurity,
    input.schemaType,
    input.idempotencyDuplicatePrevention,
    input.evidenceProvenance,
    input.noWriteNoAction,
    input.dependencies,
    input.authority,
    input.safetyPolicy,
    input.downstreamAuthorityMetadata,
    input.serviceRoleExposureRiskMetadata,
    input.clientSideWriteRiskMetadata,
  ];

  for (const value of valuesToScan) {
    addAuthorityReasons(buckets, value);
  }

  return buckets;
}

function buildInputShapeSummary(
  input: ExecutionRecordAuditAppendWriterContractValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[],
): ExecutionRecordAuditAppendWriterContractInputShapeValidationSummary {
  return {
    writerContractInputPresent: Boolean(input?.auditWriterContractInput),
    executionRecordReference:
      input?.inputShape.executionRecordReference ?? null,
    executionRecordReferencePresent:
      input?.inputShape.executionRecordReferencePresent === true,
    auditEventCandidatePresent:
      input?.inputShape.auditEventCandidatePresent === true,
    evidenceProvenancePresent:
      input?.inputShape.evidenceProvenancePresent === true,
    idempotencyKeyPresent: input?.inputShape.idempotencyKeyPresent === true,
    duplicatePreventionKeyPresent:
      input?.inputShape.duplicatePreventionKeyPresent === true,
    serverOnlySecurityPlaceholderPresent:
      input?.inputShape.serverOnlySecurityPlaceholderPresent === true,
    auditSchemaTablePlaceholderPresent:
      input?.inputShape.auditSchemaTablePlaceholderPresent === true,
    serviceRoleExposureRiskModeled:
      input?.inputShape.serviceRoleExposureRiskModeled === true,
    clientSideWriteRiskModeled:
      input?.inputShape.clientSideWriteRiskModeled === true,
    noLocalOnlySourceOfTruth:
      input?.inputShape.noLocalOnlySourceOfTruth === true,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.inputShape.metadata,
  };
}

function buildResultShapeSummary(
  input: ExecutionRecordAuditAppendWriterContractValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[],
): ExecutionRecordAuditAppendWriterContractResultShapeValidationSummary {
  return {
    writerContractResultPresent: Boolean(input?.auditWriterContractResult),
    statusPresent: input?.resultShape.statusPresent === true,
    decisionRecommendationPresent:
      input?.resultShape.decisionRecommendationPresent === true,
    noWriteNoActionStatusPresent:
      input?.resultShape.noWriteNoActionStatusPresent === true,
    authorityFlagsPresent: input?.resultShape.authorityFlagsPresent === true,
    allAuthorityFlagsFalse: input?.resultShape.allAuthorityFlagsFalse === true,
    downstreamNoAuthorityPreserved:
      input?.resultShape.downstreamNoAuthorityPreserved === true,
    auditWriteExecuted: false,
    auditWriteAllowed: false,
    safeToWriteAudit: false,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.resultShape.metadata,
  };
}

function buildServerOnlySecuritySummary(
  input: ExecutionRecordAuditAppendWriterContractValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[],
): ExecutionRecordAuditAppendWriterContractServerOnlySecurityDependencySummary {
  return {
    checklistStatus: input?.serverOnlySecurityChecklistStatus ?? null,
    checklistStatusPresent: hasText(input?.serverOnlySecurityChecklistStatus),
    checklistStatusTreatedAsProof: false,
    serverOnlyProofPresent:
      input?.serverOnlySecurity.serverOnlyProofPresent === true,
    serviceRoleProofPresent:
      input?.serverOnlySecurity.serviceRoleProofPresent === true,
    serviceRoleExposureRisk: false,
    clientSideWriteRisk: false,
    routeAuthBoundaryProofPresent:
      input?.serverOnlySecurity.routeAuthBoundaryProofPresent === true,
    serviceRoleSecretValuesForbidden: true,
    clientSideWriteForbidden: true,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.serverOnlySecurity.metadata,
  };
}

function buildSchemaTypeSummary(
  input: ExecutionRecordAuditAppendWriterContractValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[],
): ExecutionRecordAuditAppendWriterContractSchemaTypeDependencySummary {
  return {
    auditSchemaTableProofPresent:
      input?.schemaType.auditSchemaTableProofPresent === true,
    generatedTypesProofPresent:
      input?.schemaType.generatedTypesProofPresent === true,
    generatedAuditTypesPresent:
      input?.schemaType.generatedAuditTypesPresent === true,
    generatedExecutionRecordTypesPresent:
      input?.schemaType.generatedExecutionRecordTypesPresent === true,
    generatedExecutionRecordTypesAssumedEnough: false,
    migrationProofPresent: input?.schemaType.migrationProofPresent === true,
    rlsSecurityProofPresent: input?.schemaType.rlsSecurityProofPresent === true,
    schemaDriftDetected: input?.schemaType.schemaDriftDetected === true,
    nullableRequiredMismatchDetected:
      input?.schemaType.nullableRequiredMismatchDetected === true,
    schemaTableAssumedWithoutProof: false,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.schemaType.metadata,
  };
}

function buildIdempotencyDuplicateSummary(
  input: ExecutionRecordAuditAppendWriterContractValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[],
): ExecutionRecordAuditAppendWriterContractIdempotencyDuplicatePreventionSummary {
  return {
    idempotencyKey:
      input?.idempotencyDuplicatePrevention.idempotencyKey ?? null,
    duplicatePreventionKey:
      input?.idempotencyDuplicatePrevention.duplicatePreventionKey ?? null,
    sourceFingerprint:
      input?.idempotencyDuplicatePrevention.sourceFingerprint ?? null,
    idempotencyKeyPresent:
      input?.idempotencyDuplicatePrevention.idempotencyKeyPresent === true,
    duplicatePreventionKeyPresent:
      input?.idempotencyDuplicatePrevention.duplicatePreventionKeyPresent ===
      true,
    idempotencyMetadataComplete:
      input?.idempotencyDuplicatePrevention.idempotencyMetadataComplete ===
      true,
    duplicatePreventionMetadataComplete:
      input?.idempotencyDuplicatePrevention
        .duplicatePreventionMetadataComplete === true,
    duplicateMatches:
      input?.idempotencyDuplicatePrevention.duplicateMatches ?? [],
    duplicateWriteBlocked:
      input?.idempotencyDuplicatePrevention.duplicateWriteBlocked === true,
    retrySafetyRepresented:
      input?.idempotencyDuplicatePrevention.retrySafetyRepresented === true,
    unknownWriteStatusRepresented:
      input?.idempotencyDuplicatePrevention.unknownWriteStatusRepresented ===
      true,
    safeToWriteDuplicateAuditEvent: false,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.idempotencyDuplicatePrevention.metadata,
  };
}

function buildEvidenceProvenanceSummary(
  input: ExecutionRecordAuditAppendWriterContractValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[],
): ExecutionRecordAuditAppendWriterContractEvidenceProvenanceSummary {
  return {
    executionRecordReference:
      input?.evidenceProvenance.executionRecordReference ?? null,
    executionRecordReferencePresent:
      input?.evidenceProvenance.executionRecordReferencePresent === true,
    evidenceProvenancePresent:
      input?.evidenceProvenance.evidenceProvenancePresent === true,
    actorSourceMetadataPresent:
      input?.evidenceProvenance.actorSourceMetadataPresent === true,
    timestampSourceClockPresent:
      input?.evidenceProvenance.timestampSourceClockPresent === true,
    auditEventCandidatePresent:
      input?.evidenceProvenance.auditEventCandidatePresent === true,
    sourceReferences: input?.evidenceProvenance.sourceReferences ?? [],
    noLocalOnlySourceOfTruth:
      input?.evidenceProvenance.noLocalOnlySourceOfTruth === true,
    provenanceTraceComplete:
      input?.evidenceProvenance.provenanceTraceComplete === true,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.evidenceProvenance.metadata,
  };
}

function buildNoWriteNoActionSummary(
  input: ExecutionRecordAuditAppendWriterContractValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[],
): ExecutionRecordAuditAppendWriterContractNoWriteNoActionSafetySummary {
  return {
    validationOnly: true,
    designOnly: true,
    auditWriteExecuted: false,
    auditWriteAllowed: false,
    routeCallAllowed: false,
    recordCreationAllowed: false,
    persistenceWriteAllowed: false,
    supabaseWriteAllowed: false,
    localStorageWriteAllowed: false,
    downstreamAuthorityPresent: false,
    brokerAvanzaActionAllowed: false,
    automaticModeAllowed: false,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.noWriteNoAction.metadata,
  };
}

function buildDependencySummary(
  input: ExecutionRecordAuditAppendWriterContractValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[],
): ExecutionRecordAuditAppendWriterContractDependencyValidationSummary {
  return {
    writerContractInputPresent: Boolean(input?.auditWriterContractInput),
    writerContractResultPresent: Boolean(input?.auditWriterContractResult),
    writerValidatorResultPresent: Boolean(input?.writerValidatorResult),
    contractValidatorImplemented: false,
    writerValidatorImplemented:
      input?.dependencies.writerValidatorImplemented === true,
    writerImplemented: false,
    auditAppendImplemented: false,
    auditRouteImplemented: false,
    auditWritePathPresent: false,
    productionInsertRouteImplemented:
      input?.dependencies.productionInsertRouteImplemented === true,
    productionInsertWritePathPresent:
      input?.dependencies.productionInsertWritePathPresent === true,
    serverOnlyProofPresent: input?.dependencies.serverOnlyProofPresent === true,
    serviceRoleProofPresent:
      input?.dependencies.serviceRoleProofPresent === true,
    auditSchemaTableProofPresent:
      input?.dependencies.auditSchemaTableProofPresent === true,
    generatedTypesProofPresent:
      input?.dependencies.generatedTypesProofPresent === true,
    migrationProofPresent: input?.dependencies.migrationProofPresent === true,
    rlsSecurityProofPresent:
      input?.dependencies.rlsSecurityProofPresent === true,
    checklistStatusIsProof: false,
    devPreviewDiagnosticsAreProof: false,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.dependencies.metadata,
  };
}

export function validateExecutionRecordAuditAppendWriterContract(
  input: ExecutionRecordAuditAppendWriterContractValidationInput | null | undefined,
): ExecutionRecordAuditAppendWriterContractValidationResult {
  const buckets = validateInput(input);
  const blockedReasons = collectBlockedReasons(buckets);
  const status = statusFromBuckets(input, buckets);
  const decisionRecommendation = decisionFromStatus(status);
  const warnings = collectWarnings(blockedReasons);
  const reviewItems = collectReviewItems(blockedReasons);

  return {
    contractVersion:
      input?.contractVersion ??
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATOR_CONTRACT_VERSION,
    status,
    decisionRecommendation,
    validationOnly: true,
    designOnly: true,
    contractValidatorImplemented: false,
    auditWriteExecuted: false,
    auditWriteAllowed: false,
    safeToWriteAudit: false,
    contractValidationIsAuditWriteApproval: false,
    contractValidationIsSecurityProof: false,
    contractValidationIsServerOnlyProof: false,
    contractValidationIsSchemaProof: false,
    contractValidationIsGeneratedTypesProof: false,
    contractValidationIsMigrationProof: false,
    contractValidationIsRlsSecurityProof: false,
    checklistStatusIsSecurityProof: false,
    devPreviewDiagnosticsAreProof: false,
    devPreviewDiagnosticsAreAuditWriteApproval: false,
    writerValidatorReadinessIsAuditWriteApproval: false,
    writerContractReadinessIsAuditWriteApproval: false,
    insertSuccessIsAuditWriteApproval: false,
    auditWriteSuccessIsDownstreamApproval: false,
    contractValidationSuccessApprovesStatsPnlUpdate: false,
    contractValidationSuccessApprovesTradeMutation: false,
    contractValidationSuccessApprovesTradeReconciliation: false,
    contractValidationSuccessApprovesCorrectionRollback: false,
    contractValidationSuccessApprovesUiUpdate: false,
    contractValidationSuccessApprovesNotification: false,
    contractValidationSuccessApprovesBrokerOrderFollowUp: false,
    contractValidationSuccessApprovesAvanzaBrowserFollowUp: false,
    contractValidationSuccessApprovesAutomaticMode: false,
    inputShape: buildInputShapeSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    resultShape: buildResultShapeSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    serverOnlySecurity: buildServerOnlySecuritySummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    schemaType: buildSchemaTypeSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    idempotencyDuplicatePrevention: buildIdempotencyDuplicateSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    evidenceProvenance: buildEvidenceProvenanceSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    noWriteNoAction: buildNoWriteNoActionSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    dependencies: buildDependencySummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    authority:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_DEFAULT_SAFETY_POLICY,
    blockedReasons,
    warnings,
    reviewItems,
    recommendedNextManualReview:
      status === "audit_append_writer_contract_validation_needs_review"
        ? "Review audit append writer contract validation input before any future writer contract validation step."
        : null,
    metadata: {
      ...input?.metadata,
      validatorPure: true,
      validatorDeterministic: true,
      designReadinessOnly: true,
      readyMeansDesignOnlyDoNotWriteAudit: true,
      noAuditWriter: true,
      noAuditAppend: true,
      noAuditWrite: true,
      noRouteCall: true,
      noExecutionRecordCreation: true,
      noPersistenceWrite: true,
      noSupabaseWrite: true,
      noLocalStorageWrite: true,
      noStatsPnlUpdate: true,
      noRollbackCorrection: true,
      noTradeMutation: true,
      noTradeReconciliation: true,
      noUiUpdate: true,
      noNotification: true,
      noBrokerOrderBehavior: true,
      noAvanzaBrowserBehavior: true,
      noAutomaticMode: true,
    },
  };
}
