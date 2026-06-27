import {
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_VALIDATION_DEFAULT_SAFETY_POLICY,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordAuditAppendWriterAuditEventValidationSummary,
  type ExecutionRecordAuditAppendWriterDependencyValidationSummary,
  type ExecutionRecordAuditAppendWriterDuplicatePreventionValidationSummary,
  type ExecutionRecordAuditAppendWriterEvidenceProvenanceValidationSummary,
  type ExecutionRecordAuditAppendWriterFailureRetryValidationSummary,
  type ExecutionRecordAuditAppendWriterIdempotencyValidationSummary,
  type ExecutionRecordAuditAppendWriterReadinessValidationSummary,
  type ExecutionRecordAuditAppendWriterSchemaTypeValidationSummary,
  type ExecutionRecordAuditAppendWriterServerOnlySecurityValidationSummary,
  type ExecutionRecordAuditAppendWriterValidationBlockedReason,
  type ExecutionRecordAuditAppendWriterValidationDecisionRecommendation,
  type ExecutionRecordAuditAppendWriterValidationInput,
  type ExecutionRecordAuditAppendWriterValidationResult,
  type ExecutionRecordAuditAppendWriterValidationReviewItem,
  type ExecutionRecordAuditAppendWriterValidationStatus,
  type ExecutionRecordAuditAppendWriterValidationWarning,
} from "@/lib/execution-record-audit-append-writer-validator-contract";

// Pure audit append writer validation only. This module does not implement an
// audit writer, append audit data, call routes, create execution records,
// persist/write, write Supabase/localStorage, update stats/PnL, roll
// back/correct, mutate or reconcile trades, update UI, notify users, run
// broker/order behavior, automate Avanza/browser behavior, or enable automatic
// mode.

type ReasonBuckets = {
  blocked: ExecutionRecordAuditAppendWriterValidationBlockedReason[];
  invalid: ExecutionRecordAuditAppendWriterValidationBlockedReason[];
  review: ExecutionRecordAuditAppendWriterValidationBlockedReason[];
};

const BASE_WARNINGS: ExecutionRecordAuditAppendWriterValidationWarning[] = [
  "contract_only",
  "writer_validator_not_implemented",
  "audit_writer_not_implemented",
  "audit_append_not_implemented",
  "audit_route_not_implemented",
  "audit_write_not_executed",
  "writer_validation_readiness_not_audit_write_approval",
  "writer_contract_readiness_not_audit_write_approval",
  "insert_success_not_audit_write_approval",
  "validator_readiness_not_audit_write_approval",
  "dev_preview_diagnostics_not_audit_write_approval",
  "orchestrator_readiness_not_audit_write_approval",
  "production_boundary_readiness_not_audit_write_approval",
  "dry_run_success_not_audit_write_approval",
  "writer_validation_success_not_stats_pnl_approval",
  "writer_validation_success_not_trade_mutation_approval",
  "writer_validation_success_not_rollback_approval",
  "writer_validation_success_not_ui_update_approval",
  "writer_validation_success_not_notification_approval",
  "writer_validation_success_not_broker_order_approval",
  "writer_validation_success_not_avanza_browser_approval",
  "writer_validation_success_not_automatic_mode_approval",
  "server_only_required",
  "service_role_must_not_be_exposed",
  "client_side_write_not_allowed",
  "idempotency_required",
  "duplicate_prevention_required",
  "evidence_provenance_required",
  "audit_schema_must_be_proven_before_write",
  "generated_types_required_before_audit_write",
  "migration_application_required_before_audit_write",
  "rls_security_required_before_audit_write",
  "server_only_boundary_required_before_audit_write",
  "automatic_mode_not_enabled",
];

const ALL_REVIEW_ITEMS: ExecutionRecordAuditAppendWriterValidationReviewItem[] =
  [
    "audit_append_writer_validator_contract_review",
    "writer_validation_input_review",
    "audit_writer_contract_input_review",
    "audit_writer_contract_result_review",
    "validated_audit_boundary_result_review",
    "audit_validator_result_review",
    "audit_event_candidate_review",
    "execution_record_reference_review",
    "execution_record_evidence_review",
    "evidence_provenance_review",
    "audit_event_payload_review",
    "actor_source_metadata_review",
    "timestamp_source_clock_review",
    "idempotency_validation_review",
    "duplicate_prevention_validation_review",
    "audit_schema_type_validation_review",
    "security_server_only_validation_review",
    "service_role_exposure_review",
    "failure_retry_validation_review",
    "dependency_validation_review",
    "authority_flags_review",
    "manual_review",
    "downstream_authority_review",
    "broker_avanza_safety_review",
  ];

const AUDIT_WRITE_AUTHORITY_KEYS = [
  "auditWriteAllowed",
  "safeToWriteAudit",
  "auditAppendAllowed",
  "safeToAppendAudit",
  "auditWriteExecuted",
  "auditWriteRequested",
  "auditAppendRequested",
  "auditAppendAttempted",
  "auditRouteCalled",
  "routeCallAllowed",
  "persistenceWriteAllowed",
  "safeToPersist",
];

const STATS_AUTHORITY_KEYS = [
  "statsPnlUpdateAllowed",
  "safeToUpdateStats",
  "statsPnlUpdateRequested",
  "statsUpdateAttempted",
  "writerValidationSuccessApprovesStatsPnlUpdate",
];

const TRADE_MUTATION_KEYS = [
  "tradeMutationAllowed",
  "safeToMutateTrade",
  "tradeMutationRequested",
  "tradeMutationAttempted",
  "writerValidationSuccessApprovesTradeMutation",
];

const TRADE_RECONCILIATION_KEYS = [
  "tradeReconciliationAllowed",
  "safeToReconcileTrade",
  "tradeReconciliationRequested",
  "tradeReconciliationAttempted",
  "writerValidationSuccessApprovesTradeReconciliation",
];

const ROLLBACK_KEYS = [
  "correctionRollbackAllowed",
  "safeToRollback",
  "rollbackCorrectionRequested",
  "rollbackAttempted",
  "writerValidationSuccessApprovesCorrectionRollback",
];

const UI_KEYS = [
  "uiStateMutationAllowed",
  "safeToUpdateUiState",
  "uiUpdateRequested",
  "uiStateUpdateRequested",
  "writerValidationSuccessApprovesUiUpdate",
];

const NOTIFICATION_KEYS = [
  "userNotificationAllowed",
  "safeToNotifyUser",
  "notificationRequested",
  "userNotificationRequested",
  "writerValidationSuccessApprovesNotification",
];

const BROKER_AVANZA_KEYS = [
  "brokerOrderFollowUpAllowed",
  "avanzaBrowserFollowUpAllowed",
  "safeToRunBrokerAction",
  "safeToRunAvanzaBrowserAction",
  "brokerOrderRequested",
  "avanzaBrowserRequested",
  "brokerAutomationAttempted",
  "avanzaAutomationAttempted",
  "browserAutomationAttempted",
  "writerValidationSuccessApprovesBrokerOrderFollowUp",
  "writerValidationSuccessApprovesAvanzaBrowserFollowUp",
];

const AUTOMATIC_MODE_KEYS = [
  "automaticModeAllowed",
  "automaticModeRequested",
  "writerValidationSuccessApprovesAutomaticMode",
];

const WRITER_READINESS_APPROVAL_KEYS = [
  "writerReadinessIsAuditWriteApproval",
  "writerValidationReadinessIsAuditWriteApproval",
  "writerReadinessMisinterpretedAsWriteApproval",
];

const INSERT_SUCCESS_APPROVAL_KEYS = [
  "insertSuccessIsAuditWriteApproval",
  "insertSuccessApprovesAuditWrite",
  "insertSuccessMisinterpretedAsWriteApproval",
];

const VALIDATOR_READINESS_APPROVAL_KEYS = [
  "validatorReadinessIsAuditWriteApproval",
  "auditBoundaryValidatorReadinessIsAuditWriteApproval",
  "validatorReadinessApprovesAuditWrite",
];

const DEV_PREVIEW_APPROVAL_KEYS = [
  "devPreviewDiagnosticsAreAuditWriteApproval",
  "devPreviewDiagnosticsApproveAuditWrite",
];

const ORCHESTRATOR_APPROVAL_KEYS = [
  "orchestratorReadinessIsAuditWriteApproval",
  "orchestratorContractReadinessIsAuditWriteApproval",
  "orchestratorReadinessApprovesAuditWrite",
];

const PRODUCTION_BOUNDARY_APPROVAL_KEYS = [
  "productionBoundaryReadinessIsAuditWriteApproval",
  "productionBoundaryReadinessApprovesAuditWrite",
];

const DRY_RUN_APPROVAL_KEYS = [
  "dryRunSuccessIsAuditWriteApproval",
  "dryRunSuccessApprovesAuditWrite",
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
  reason: ExecutionRecordAuditAppendWriterValidationBlockedReason,
): void {
  buckets[bucket].push(reason);
}

function addAuthorityReasons(buckets: ReasonBuckets, value: unknown): void {
  if (!isObject(value)) {
    return;
  }

  if (hasAnyTruthyFlag(value, AUDIT_WRITE_AUTHORITY_KEYS)) {
    addReason(buckets, "invalid", "audit_write_requested_in_validator_phase");
  }
  if (hasAnyTruthyFlag(value, STATS_AUTHORITY_KEYS)) {
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
  if (hasAnyTruthyFlag(value, AUTOMATIC_MODE_KEYS)) {
    addReason(buckets, "invalid", "automatic_mode_requested");
  }
  if (hasAnyTruthyFlag(value, WRITER_READINESS_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "writer_readiness_misinterpreted_as_write_approval",
    );
  }
  if (hasAnyTruthyFlag(value, INSERT_SUCCESS_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "insert_success_misinterpreted_as_write_approval",
    );
  }
  if (hasAnyTruthyFlag(value, VALIDATOR_READINESS_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "validator_readiness_misinterpreted_as_write_approval",
    );
  }
  if (hasAnyTruthyFlag(value, DEV_PREVIEW_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "dev_preview_diagnostics_misinterpreted_as_write_approval",
    );
  }
  if (hasAnyTruthyFlag(value, ORCHESTRATOR_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "orchestrator_readiness_misinterpreted_as_write_approval",
    );
  }
  if (hasAnyTruthyFlag(value, PRODUCTION_BOUNDARY_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "production_boundary_readiness_misinterpreted_as_write_approval",
    );
  }
  if (hasAnyTruthyFlag(value, DRY_RUN_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "dry_run_success_misinterpreted_as_write_approval",
    );
  }
  if (
    hasTruthyFlag(value, "serviceRoleSecretExposed") ||
    hasTruthyFlag(value, "serviceRoleSecretValueIncluded")
  ) {
    addReason(buckets, "invalid", "service_role_secret_exposure_risk");
  }
  if (
    hasTruthyFlag(value, "clientSideAuditWriteRisk") ||
    hasTruthyFlag(value, "safeToWriteFromClient") ||
    hasTruthyFlag(value, "clientSideWriteAllowed")
  ) {
    addReason(buckets, "invalid", "client_side_audit_write_risk");
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
  buckets: ReasonBuckets,
): ExecutionRecordAuditAppendWriterValidationStatus {
  if (buckets.invalid.length > 0) {
    return "audit_append_writer_validation_invalid";
  }
  if (buckets.blocked.length > 0) {
    return "audit_append_writer_validation_blocked";
  }
  if (buckets.review.length > 0) {
    return "audit_append_writer_validation_needs_review";
  }
  return "audit_append_writer_validation_ready_for_design_only";
}

function decisionFromStatus(
  status: ExecutionRecordAuditAppendWriterValidationStatus,
): ExecutionRecordAuditAppendWriterValidationDecisionRecommendation {
  switch (status) {
    case "audit_append_writer_validation_ready_for_design_only":
      return "design_only_do_not_write_audit";
    case "audit_append_writer_validation_needs_review":
      return "needs_manual_review";
    case "audit_append_writer_validation_invalid":
      return "invalid_do_not_write_audit";
    case "audit_append_writer_validation_absent":
    case "audit_append_writer_validation_blocked":
      return "blocked_do_not_write_audit";
    default:
      return "future_audit_writer_validator_required";
  }
}

function collectWarnings(
  blockedReasons: ExecutionRecordAuditAppendWriterValidationBlockedReason[],
): ExecutionRecordAuditAppendWriterValidationWarning[] {
  const warnings: ExecutionRecordAuditAppendWriterValidationWarning[] = [
    ...BASE_WARNINGS,
  ];

  if (blockedReasons.includes("manual_review_required")) {
    warnings.push("manual_review_may_be_required");
  }

  return uniqueValues(warnings);
}

function collectReviewItems(
  blockedReasons: ExecutionRecordAuditAppendWriterValidationBlockedReason[],
): ExecutionRecordAuditAppendWriterValidationReviewItem[] {
  return blockedReasons.length > 0 ? ALL_REVIEW_ITEMS : [];
}

function validateInput(
  input: ExecutionRecordAuditAppendWriterValidationInput | null | undefined,
): ReasonBuckets {
  const buckets: ReasonBuckets = { blocked: [], invalid: [], review: [] };

  if (!input) {
    addReason(buckets, "blocked", "writer_validation_input_missing");
    return buckets;
  }

  if (!input.auditWriterContractInput) {
    addReason(buckets, "blocked", "audit_writer_contract_input_missing");
  }
  if (!input.validatedAuditBoundaryResult) {
    addReason(buckets, "blocked", "validated_audit_boundary_result_missing");
  }
  if (!input.auditBoundaryValidatorResult) {
    addReason(buckets, "blocked", "audit_validator_result_missing");
  }
  if (!input.auditEventCandidate) {
    addReason(buckets, "blocked", "audit_event_candidate_missing");
  }
  if (!input.executionRecordReference || !hasText(input.executionRecordId)) {
    addReason(buckets, "blocked", "execution_record_reference_missing");
  }
  if (!input.executionRecordEvidence) {
    addReason(buckets, "blocked", "execution_record_evidence_missing");
  }
  if (
    !input.evidenceProvenance.evidenceProvenancePresent ||
    !input.evidenceProvenance.provenanceTraceComplete ||
    input.evidenceProvenance.sourceReferences.length === 0
  ) {
    addReason(buckets, "blocked", "evidence_provenance_missing");
  }
  if (!hasText(input.auditEventType)) {
    addReason(buckets, "blocked", "audit_event_type_missing");
  }
  if (!hasText(input.auditEventSource)) {
    addReason(buckets, "blocked", "audit_event_source_missing");
  }
  if (!isObject(input.auditEventPayloadSummary)) {
    addReason(buckets, "blocked", "audit_event_payload_missing");
  }
  if (!isObject(input.actorSourceMetadata)) {
    addReason(buckets, "blocked", "actor_source_metadata_missing");
  }
  if (!isObject(input.timestampSourceClockMetadata)) {
    addReason(buckets, "blocked", "timestamp_source_metadata_missing");
  }
  if (!hasText(input.idempotencyKey)) {
    addReason(buckets, "blocked", "idempotency_key_missing");
  }
  if (!hasText(input.duplicatePreventionKey)) {
    addReason(buckets, "blocked", "duplicate_prevention_key_missing");
  }
  if (
    !input.schemaType.auditSchemaTableProven ||
    !isObject(input.auditSchemaTableProof)
  ) {
    addReason(buckets, "blocked", "audit_schema_table_unverified");
  }
  if (
    !input.schemaType.generatedTypesPresent ||
    !input.schemaType.generatedAuditTypesPresent ||
    !input.schemaType.generatedExecutionRecordTypesPresent ||
    !isObject(input.generatedTypesProof)
  ) {
    addReason(buckets, "blocked", "generated_types_absent_or_unknown");
  }
  if (
    !input.schemaType.migrationApplicationProven ||
    !isObject(input.migrationProof)
  ) {
    addReason(buckets, "blocked", "migration_application_not_proven");
  }
  if (
    !input.schemaType.rlsSecurityVerified ||
    !input.serverOnlySecurity.rlsSecurityVerified ||
    !isObject(input.rlsSecurityProof)
  ) {
    addReason(buckets, "blocked", "rls_security_unverified");
  }
  if (
    !input.serverOnlySecurity.serverOnlyBoundaryVerified ||
    !isObject(input.serverOnlyProof)
  ) {
    addReason(buckets, "blocked", "server_only_boundary_unverified");
  }
  if (
    !input.serverOnlySecurity.serviceRoleExecutionContextPresent ||
    !isObject(input.serviceRoleServerOnlyExecutionContext)
  ) {
    addReason(
      buckets,
      "blocked",
      "service_role_execution_context_missing",
    );
  }
  if (
    input.serverOnlySecurity.serviceRoleSecretExposed ||
    input.serverOnlySecurity.serviceRoleSecretValueIncluded
  ) {
    addReason(buckets, "invalid", "service_role_secret_exposure_risk");
  }
  if (
    input.serverOnlySecurity.clientSideAuditWriteRisk ||
    !input.serverOnlySecurity.clientSideWriteBlocked
  ) {
    addReason(buckets, "invalid", "client_side_audit_write_risk");
  }
  if (input.manualReviewMetadata || input.failureRetry.retryRequiresManualReview) {
    if (input.metadata?.manualReviewRequired === true) {
      addReason(buckets, "review", "manual_review_required");
    }
  }

  const valuesToScan: unknown[] = [
    input,
    input.metadata,
    input.authority,
    input.safetyPolicy,
    input.auditWriterContractInput,
    input.auditWriterContractResult,
    input.validatedAuditBoundaryResult,
    input.auditBoundaryValidatorResult,
    input.readiness,
    input.auditEvent,
    input.serverOnlySecurity,
    input.schemaType,
    input.idempotency,
    input.duplicatePrevention,
    input.evidenceProvenance,
    input.failureRetry,
    input.dependencies,
  ];

  for (const value of valuesToScan) {
    addAuthorityReasons(buckets, value);
  }

  return buckets;
}

function buildReadinessSummary(
  input: ExecutionRecordAuditAppendWriterValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterValidationReviewItem[],
): ExecutionRecordAuditAppendWriterReadinessValidationSummary {
  return {
    writerValidationInputPresent: Boolean(input),
    auditWriterContractInputPresent: Boolean(input?.auditWriterContractInput),
    auditWriterContractResultPresent: Boolean(input?.auditWriterContractResult),
    validatedAuditBoundaryResultPresent: Boolean(
      input?.validatedAuditBoundaryResult,
    ),
    auditBoundaryValidatorResultPresent: Boolean(
      input?.auditBoundaryValidatorResult,
    ),
    writerValidatorImplemented: false,
    writerImplemented: false,
    auditAppendImplemented: false,
    auditRouteImplemented: false,
    auditWriteExecuted: false,
    readinessIsAuditWriteApproval: false,
    safeToWriteAudit: false,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.readiness.metadata,
  };
}

function buildAuditEventSummary(
  input: ExecutionRecordAuditAppendWriterValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterValidationReviewItem[],
): ExecutionRecordAuditAppendWriterAuditEventValidationSummary {
  return {
    auditEventType: input?.auditEventType ?? null,
    auditEventSource: input?.auditEventSource ?? null,
    auditEventPayloadSummary: input?.auditEventPayloadSummary ?? null,
    auditEventCandidate: input?.auditEventCandidate ?? null,
    writerAuditEventSummary: input?.auditEvent.writerAuditEventSummary ?? null,
    executionRecordId: input?.executionRecordId ?? null,
    executionRecordReference: input?.executionRecordReference ?? null,
    actorSourceMetadata: input?.actorSourceMetadata ?? null,
    timestampSourceClockMetadata: input?.timestampSourceClockMetadata ?? null,
    auditEventTypePresent: hasText(input?.auditEventType),
    auditEventSourcePresent: hasText(input?.auditEventSource),
    auditEventPayloadPresent: isObject(input?.auditEventPayloadSummary),
    actorSourceMetadataPresent: isObject(input?.actorSourceMetadata),
    timestampSourceMetadataPresent: isObject(input?.timestampSourceClockMetadata),
    noSecretPayloadExposure:
      input?.auditEvent.noSecretPayloadExposure === true,
    noBrokerAvanzaAssumptions:
      input?.auditEvent.noBrokerAvanzaAssumptions === true,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.auditEvent.metadata,
  };
}

function buildServerOnlySecuritySummary(
  input: ExecutionRecordAuditAppendWriterValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterValidationReviewItem[],
): ExecutionRecordAuditAppendWriterServerOnlySecurityValidationSummary {
  return {
    writerServerOnlySecuritySummary:
      input?.serverOnlySecurity.writerServerOnlySecuritySummary ?? null,
    serverOnlyProof: input?.serverOnlyProof ?? null,
    serviceRoleServerOnlyExecutionContext:
      input?.serviceRoleServerOnlyExecutionContext ?? null,
    rlsSecurityProof: input?.rlsSecurityProof ?? null,
    serverOnlyExecutionContextPresent:
      input?.serverOnlySecurity.serverOnlyExecutionContextPresent === true,
    serviceRoleExecutionContextPresent:
      input?.serverOnlySecurity.serviceRoleExecutionContextPresent === true,
    serviceRoleSecretExposed: false,
    serviceRoleSecretValueIncluded: false,
    serviceRoleExposureRiskModeled:
      input?.serverOnlySecurity.serviceRoleExposureRiskModeled === true,
    clientSideAuditWriteRisk:
      input?.serverOnlySecurity.clientSideAuditWriteRisk === true,
    clientSideWriteBlocked:
      input?.serverOnlySecurity.clientSideWriteBlocked === true,
    safeToWriteFromClient: false,
    safeToUseServiceRoleInClient: false,
    routeAuthBoundaryVerified:
      input?.serverOnlySecurity.routeAuthBoundaryVerified === true,
    rlsSecurityVerified:
      input?.serverOnlySecurity.rlsSecurityVerified === true,
    serverOnlyBoundaryVerified:
      input?.serverOnlySecurity.serverOnlyBoundaryVerified === true,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.serverOnlySecurity.metadata,
  };
}

function buildSchemaTypeSummary(
  input: ExecutionRecordAuditAppendWriterValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterValidationReviewItem[],
): ExecutionRecordAuditAppendWriterSchemaTypeValidationSummary {
  return {
    schemaReference: input?.schemaType.schemaReference ?? null,
    auditSchemaTableProof: input?.auditSchemaTableProof ?? null,
    generatedTypesProof: input?.generatedTypesProof ?? null,
    migrationProof: input?.migrationProof ?? null,
    auditSchemaTableProven:
      input?.schemaType.auditSchemaTableProven === true,
    generatedTypesPresent: input?.schemaType.generatedTypesPresent === true,
    generatedExecutionRecordTypesPresent:
      input?.schemaType.generatedExecutionRecordTypesPresent === true,
    generatedAuditTypesPresent:
      input?.schemaType.generatedAuditTypesPresent === true,
    migrationApplicationProven:
      input?.schemaType.migrationApplicationProven === true,
    rlsSecurityVerified: input?.schemaType.rlsSecurityVerified === true,
    schemaAssumedWithoutProof: false,
    auditTableAssumedWithoutProof: false,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.schemaType.metadata,
  };
}

function buildIdempotencySummary(
  input: ExecutionRecordAuditAppendWriterValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterValidationReviewItem[],
): ExecutionRecordAuditAppendWriterIdempotencyValidationSummary {
  return {
    writerIdempotencySummary:
      input?.idempotency.writerIdempotencySummary ?? null,
    idempotencyKey: input?.idempotencyKey ?? null,
    auditEventKey: input?.idempotency.auditEventKey ?? null,
    sourceEventFingerprint: input?.idempotency.sourceEventFingerprint ?? null,
    idempotencyKeyPresent: hasText(input?.idempotencyKey),
    idempotencyMetadataPresent:
      input?.idempotency.idempotencyMetadataPresent === true,
    stableAuditEventKeyPresent:
      input?.idempotency.stableAuditEventKeyPresent === true,
    sourceEventFingerprintPresent:
      input?.idempotency.sourceEventFingerprintPresent === true,
    safeToRetry: false,
    retryRequiresManualReview: true,
    retryRequiresStableIdempotency: true,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.idempotency.metadata,
  };
}

function buildDuplicatePreventionSummary(
  input: ExecutionRecordAuditAppendWriterValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDuplicatePreventionValidationSummary {
  return {
    writerDuplicatePreventionSummary:
      input?.duplicatePrevention.writerDuplicatePreventionSummary ?? null,
    duplicatePreventionKey: input?.duplicatePreventionKey ?? null,
    duplicatePreventionKeyPresent: hasText(input?.duplicatePreventionKey),
    duplicatePreventionMetadataPresent:
      input?.duplicatePrevention.duplicatePreventionMetadataPresent === true,
    duplicateMatches: input?.duplicatePrevention.duplicateMatches ?? [],
    duplicateAuditEventDetected:
      input?.duplicatePrevention.duplicateAuditEventDetected === true,
    duplicateAuditWriteBlocked:
      input?.duplicatePrevention.duplicateAuditWriteBlocked === true,
    duplicateLookupRequiredBeforeWrite: true,
    writeConflictDetected:
      input?.duplicatePrevention.writeConflictDetected === true,
    safeToWriteDuplicateAuditEvent: false,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.duplicatePrevention.metadata,
  };
}

function buildEvidenceProvenanceSummary(
  input: ExecutionRecordAuditAppendWriterValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterValidationReviewItem[],
): ExecutionRecordAuditAppendWriterEvidenceProvenanceValidationSummary {
  return {
    writerEvidenceSummary:
      input?.evidenceProvenance.writerEvidenceSummary ?? null,
    executionRecordReference: input?.executionRecordReference ?? null,
    executionRecordEvidence: input?.executionRecordEvidence ?? null,
    auditBoundaryResult: input?.validatedAuditBoundaryResult ?? null,
    auditBoundaryValidationResult: input?.auditBoundaryValidatorResult ?? null,
    auditCorrectionMetadata:
      input?.evidenceProvenance.auditCorrectionMetadata ?? null,
    sourceReferences: input?.evidenceProvenance.sourceReferences ?? [],
    executionRecordReferencePresent: Boolean(input?.executionRecordReference),
    executionRecordEvidencePresent: Boolean(input?.executionRecordEvidence),
    evidencePresent: input?.evidenceProvenance.evidencePresent === true,
    evidenceProvenancePresent:
      input?.evidenceProvenance.evidenceProvenancePresent === true,
    sourceReferencesPresent:
      Boolean(input?.evidenceProvenance.sourceReferences.length),
    provenanceTraceComplete:
      input?.evidenceProvenance.provenanceTraceComplete === true,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.evidenceProvenance.metadata,
  };
}

function buildFailureRetrySummary(
  input: ExecutionRecordAuditAppendWriterValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterValidationReviewItem[],
): ExecutionRecordAuditAppendWriterFailureRetryValidationSummary {
  return {
    writerFailureSummary: input?.failureRetry.writerFailureSummary ?? null,
    failureRetryMetadata: input?.failureRetryMetadata ?? null,
    validationBlockedBeforeWriterRepresented:
      input?.failureRetry.validationBlockedBeforeWriterRepresented === true,
    writerBlockedRepresented:
      input?.failureRetry.writerBlockedRepresented === true,
    duplicateDetectedRepresented:
      input?.failureRetry.duplicateDetectedRepresented === true,
    writeFailedRepresented:
      input?.failureRetry.writeFailedRepresented === true,
    unknownWriteStatusRepresented:
      input?.failureRetry.unknownWriteStatusRepresented === true,
    partialFailureAfterWriteRepresented:
      input?.failureRetry.partialFailureAfterWriteRepresented === true,
    retryPolicyPresent: input?.failureRetry.retryPolicyPresent === true,
    retryRequiresStableIdempotency: true,
    retryRequiresDuplicatePrevention: true,
    retryRequiresManualReview: true,
    downstreamActionsRemainBlocked: true,
    hiddenPartialFailureAllowed: false,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.failureRetry.metadata,
  };
}

function buildDependencySummary(
  input: ExecutionRecordAuditAppendWriterValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDependencyValidationSummary {
  return {
    auditWriterContractPresent: Boolean(input?.auditWriterContractInput),
    auditWriterValidatorContractPresent: true,
    auditWriterValidatorImplemented: false,
    auditWriterImplemented: false,
    auditAppendImplementationPresent: false,
    auditRouteImplemented: false,
    auditWritePathPresent: false,
    validatedAuditBoundaryResultPresent: Boolean(
      input?.validatedAuditBoundaryResult,
    ),
    auditBoundaryValidatorResultPresent: Boolean(
      input?.auditBoundaryValidatorResult,
    ),
    postInsertOrchestratorResult:
      input?.dependencies.postInsertOrchestratorResult ?? null,
    productionInsertBoundaryResult:
      input?.dependencies.productionInsertBoundaryResult ?? null,
    productionInsertRouteImplemented:
      input?.dependencies.productionInsertRouteImplemented === true,
    productionInsertWritePathPresent:
      input?.dependencies.productionInsertWritePathPresent === true,
    postInsertOrchestratorImplemented:
      input?.dependencies.postInsertOrchestratorImplemented === true,
    auditSchemaTableProven:
      input?.dependencies.auditSchemaTableProven === true,
    generatedTypesPresent: input?.dependencies.generatedTypesPresent === true,
    migrationApplicationProven:
      input?.dependencies.migrationApplicationProven === true,
    rlsSecurityVerified: input?.dependencies.rlsSecurityVerified === true,
    serverOnlyBoundaryVerified:
      input?.dependencies.serverOnlyBoundaryVerified === true,
    dryRunSuccessPresent: input?.dependencies.dryRunSuccessPresent === true,
    dryRunSuccessIsAuditWriteApproval: false,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: input?.dependencies.metadata,
  };
}

export function validateExecutionRecordAuditAppendWriter(
  input: ExecutionRecordAuditAppendWriterValidationInput | null | undefined,
): ExecutionRecordAuditAppendWriterValidationResult {
  const buckets = validateInput(input);
  const blockedReasons = collectBlockedReasons(buckets);
  const status = statusFromBuckets(buckets);
  const decisionRecommendation = decisionFromStatus(status);
  const warnings = collectWarnings(blockedReasons);
  const reviewItems = collectReviewItems(blockedReasons);

  return {
    contractVersion:
      input?.contractVersion ??
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_VALIDATOR_CONTRACT_VERSION,
    status,
    decisionRecommendation,
    validationOnly: true,
    designOnly: true,
    writerValidatorImplemented: false,
    writerImplemented: false,
    auditAppendImplemented: false,
    auditRouteImplemented: false,
    auditWriteExecuted: false,
    auditWriteAllowed: false,
    safeToWriteAudit: false,
    auditAppendAllowed: false,
    safeToAppendAudit: false,
    writerValidationReadinessIsAuditWriteApproval: false,
    writerContractReadinessIsAuditWriteApproval: false,
    insertSuccessIsAuditWriteApproval: false,
    auditBoundaryValidatorReadinessIsAuditWriteApproval: false,
    devPreviewDiagnosticsAreAuditWriteApproval: false,
    orchestratorReadinessIsAuditWriteApproval: false,
    productionBoundaryReadinessIsAuditWriteApproval: false,
    dryRunSuccessIsAuditWriteApproval: false,
    writerValidationSuccessApprovesStatsPnlUpdate: false,
    writerValidationSuccessApprovesTradeMutation: false,
    writerValidationSuccessApprovesTradeReconciliation: false,
    writerValidationSuccessApprovesCorrectionRollback: false,
    writerValidationSuccessApprovesUiUpdate: false,
    writerValidationSuccessApprovesNotification: false,
    writerValidationSuccessApprovesBrokerOrderFollowUp: false,
    writerValidationSuccessApprovesAvanzaBrowserFollowUp: false,
    writerValidationSuccessApprovesAutomaticMode: false,
    readiness: buildReadinessSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    auditEvent: buildAuditEventSummary(
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
    idempotency: buildIdempotencySummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    duplicatePrevention: buildDuplicatePreventionSummary(
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
    failureRetry: buildFailureRetrySummary(
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
    authority: EXECUTION_RECORD_AUDIT_APPEND_WRITER_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_VALIDATION_DEFAULT_SAFETY_POLICY,
    blockedReasons,
    warnings,
    reviewItems,
    recommendedNextManualReview:
      status === "audit_append_writer_validation_needs_review"
        ? "Review audit append writer validation inputs before any future writer design step."
        : null,
    metadata: {
      ...input?.metadata,
      validatorPure: true,
      validatorDeterministic: true,
      designReadinessOnly: true,
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

