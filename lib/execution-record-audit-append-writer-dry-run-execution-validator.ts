import {
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_DEFAULT_SAFETY_POLICY,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordAuditAppendWriterDryRunExecutionDependencyValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunExecutionEvidenceProvenanceValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunExecutionInputValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunExecutionNoWriteNoActionSafetyValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunExecutionResultValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunExecutionServerOnlySecurityDependencyValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedAuditEventValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedIdempotencyDuplicatePreventionValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedTableSchemaValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason,
  type ExecutionRecordAuditAppendWriterDryRunExecutionValidationDecisionRecommendation,
  type ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput,
  type ExecutionRecordAuditAppendWriterDryRunExecutionValidationResult,
  type ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem,
  type ExecutionRecordAuditAppendWriterDryRunExecutionValidationStatus,
  type ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning,
} from "@/lib/execution-record-audit-append-writer-dry-run-execution-validator-contract";

// Pure audit append writer dry-run execution validation only. This module does
// not execute dry-run logic, execute an audit writer, append/write audit data,
// call routes, create records, persist/write, write Supabase/localStorage,
// update stats/PnL, roll back/correct, mutate or reconcile trades, update UI,
// notify users, run broker/order behavior, automate Avanza/browser behavior, or
// enable automatic mode.

type ReasonBuckets = {
  blocked: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[];
  invalid: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[];
  review: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[];
};

const BASE_WARNINGS: ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[] =
  [
    "contract_only",
    "dry_run_execution_not_implemented",
    "dry_run_execution_not_real_write",
    "audit_writer_not_implemented",
    "audit_route_not_implemented",
    "audit_write_not_executed",
    "dry_run_execution_validation_not_dry_run_execution",
    "dry_run_execution_validation_not_audit_write_approval",
    "dry_run_execution_validation_not_security_proof",
    "dry_run_execution_validation_not_server_only_proof",
    "dry_run_execution_validation_not_schema_proof",
    "dry_run_execution_validation_not_generated_types_proof",
    "dry_run_execution_validation_not_migration_proof",
    "dry_run_execution_validation_not_rls_security_proof",
    "dry_run_execution_validation_not_downstream_approval",
    "dry_run_execution_success_not_write_approval",
    "dry_run_validator_readiness_not_execution",
    "dry_run_validator_readiness_not_write_approval",
    "contract_validator_readiness_not_write_approval",
    "writer_validator_readiness_not_write_approval",
    "insert_success_not_audit_write_approval",
    "dev_preview_not_write_approval",
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

const ALL_REVIEW_ITEMS: ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem[] =
  [
    "audit_append_writer_dry_run_execution_validator_contract_review",
    "dry_run_execution_validation_input_review",
    "dry_run_execution_input_review",
    "dry_run_execution_result_review",
    "dry_run_validator_result_review",
    "dry_run_result_input_review",
    "contract_validator_result_review",
    "writer_validator_result_review",
    "writer_contract_input_review",
    "simulated_audit_event_validation_review",
    "simulated_table_schema_validation_review",
    "simulated_idempotency_duplicate_prevention_review",
    "evidence_provenance_validation_review",
    "server_only_security_dependency_review",
    "no_write_no_action_safety_review",
    "dependency_validation_review",
    "authority_flags_review",
    "service_role_exposure_review",
    "client_side_write_risk_review",
    "manual_review",
    "downstream_authority_review",
    "broker_avanza_safety_review",
  ];

const AUDIT_WRITE_KEYS = [
  "auditWriteAllowed",
  "safeToWriteAudit",
  "auditWriteExecuted",
  "auditWriteRequested",
  "actualAuditWriteRequested",
  "safeToWriteDuplicateAuditEvent",
];

const AUDIT_APPEND_KEYS = [
  "auditAppendAllowed",
  "safeToAppendAudit",
  "auditAppendRequested",
  "auditAppendAttempted",
  "auditAppendImplemented",
];

const ROUTE_KEYS = [
  "routeCallAllowed",
  "routeCallRequested",
  "auditRouteCalled",
  "auditRouteImplemented",
  "productionRouteCallRequested",
  "insertRouteCallRequested",
];

const WRITER_EXECUTION_KEYS = [
  "writerExecutionRequested",
  "auditWriterExecutionRequested",
  "writerExecuted",
  "writerImplemented",
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
];

const TRADE_MUTATION_KEYS = [
  "tradeMutationAllowed",
  "safeToMutateTrade",
  "tradeMutationRequested",
];

const TRADE_RECONCILIATION_KEYS = [
  "tradeReconciliationAllowed",
  "safeToReconcileTrade",
  "tradeReconciliationRequested",
];

const ROLLBACK_KEYS = [
  "correctionRollbackAllowed",
  "safeToRollback",
  "rollbackCorrectionRequested",
];

const UI_KEYS = [
  "uiStateMutationAllowed",
  "safeToUpdateUiState",
  "uiUpdateRequested",
  "uiStateUpdateRequested",
];

const NOTIFICATION_KEYS = [
  "userNotificationAllowed",
  "safeToNotifyUser",
  "notificationRequested",
  "userNotificationRequested",
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
];

const AUTOMATIC_MODE_KEYS = ["automaticModeAllowed", "automaticModeRequested"];

const WRITE_APPROVAL_CONFUSION_KEYS = [
  "dryRunExecutionSuccessIsWriteApproval",
  "dryRunExecutionResultIsAuditWriteApproval",
  "dryRunValidatorReadinessIsWriteApproval",
  "contractValidatorReadinessIsWriteApproval",
  "writerValidatorReadinessIsWriteApproval",
  "insertSuccessIsAuditWriteApproval",
  "devPreviewDiagnosticsAreWriteApproval",
];

const SECURITY_PROOF_CONFUSION_KEYS = [
  "validationIsSecurityProof",
  "validationIsServerOnlyProof",
  "validationIsGeneratedTypesProof",
  "validationIsMigrationProof",
  "validationIsRlsSecurityProof",
  "dryRunExecutionResultIsSecurityProof",
  "dryRunExecutionResultIsServerOnlyProof",
  "dryRunExecutionResultIsGeneratedTypesProof",
  "dryRunExecutionResultIsMigrationProof",
  "dryRunExecutionResultIsRlsSecurityProof",
];

const SCHEMA_PROOF_CONFUSION_KEYS = [
  "validationIsSchemaProof",
  "dryRunExecutionResultIsSchemaProof",
];

const DOWNSTREAM_APPROVAL_KEYS = [
  "validationIsDownstreamApproval",
  "dryRunExecutionResultIsDownstreamApproval",
  "downstreamAuthorityPresent",
  "downstreamActionAllowed",
  "downstreamActionRequested",
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
  reason: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason,
): void {
  buckets[bucket].push(reason);
}

function addAuthorityReasons(buckets: ReasonBuckets, value: unknown): void {
  if (!isObject(value)) {
    return;
  }

  if (hasAnyTruthyFlag(value, AUDIT_WRITE_KEYS)) {
    addReason(buckets, "invalid", "actual_audit_write_requested");
  }
  if (hasAnyTruthyFlag(value, ROUTE_KEYS)) {
    addReason(buckets, "invalid", "route_call_requested");
  }
  if (hasAnyTruthyFlag(value, WRITER_EXECUTION_KEYS)) {
    addReason(buckets, "invalid", "writer_execution_requested");
  }
  if (hasAnyTruthyFlag(value, AUDIT_APPEND_KEYS)) {
    addReason(buckets, "invalid", "audit_append_requested");
  }
  if (hasAnyTruthyFlag(value, RECORD_CREATION_KEYS)) {
    addReason(buckets, "invalid", "record_creation_requested");
  }
  if (hasAnyTruthyFlag(value, PERSISTENCE_KEYS)) {
    if (
      hasTruthyFlag(value, "supabaseWriteAllowed") ||
      hasTruthyFlag(value, "supabaseWriteRequested")
    ) {
      addReason(buckets, "invalid", "supabase_write_requested");
    }
    if (
      hasTruthyFlag(value, "localStorageWriteAllowed") ||
      hasTruthyFlag(value, "localStorageWriteRequested")
    ) {
      addReason(buckets, "invalid", "local_storage_write_requested");
    }
    addReason(buckets, "invalid", "persistence_write_requested");
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
  if (hasAnyTruthyFlag(value, AUTOMATIC_MODE_KEYS)) {
    addReason(buckets, "invalid", "automatic_mode_requested");
  }
  if (hasAnyTruthyFlag(value, WRITE_APPROVAL_CONFUSION_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "dry_run_execution_success_misinterpreted_as_write_approval",
    );
  }
  if (hasAnyTruthyFlag(value, SECURITY_PROOF_CONFUSION_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "dry_run_execution_success_misinterpreted_as_security_proof",
    );
  }
  if (hasAnyTruthyFlag(value, SCHEMA_PROOF_CONFUSION_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "dry_run_execution_success_misinterpreted_as_schema_proof",
    );
  }
  if (hasAnyTruthyFlag(value, DOWNSTREAM_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "dry_run_execution_success_misinterpreted_as_downstream_approval",
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
): ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[] {
  return uniqueValues([
    ...buckets.invalid,
    ...buckets.blocked,
    ...buckets.review,
  ]);
}

function statusFromBuckets(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput
    | null
    | undefined,
  buckets: ReasonBuckets,
): ExecutionRecordAuditAppendWriterDryRunExecutionValidationStatus {
  if (!input) {
    return "audit_append_writer_dry_run_execution_validation_absent";
  }
  if (buckets.invalid.length > 0) {
    return "audit_append_writer_dry_run_execution_validation_invalid";
  }
  if (buckets.blocked.length > 0) {
    return "audit_append_writer_dry_run_execution_validation_blocked";
  }
  if (buckets.review.length > 0) {
    return "audit_append_writer_dry_run_execution_validation_needs_review";
  }
  return "audit_append_writer_dry_run_execution_validation_ready_for_design_only";
}

function decisionFromStatus(
  status: ExecutionRecordAuditAppendWriterDryRunExecutionValidationStatus,
): ExecutionRecordAuditAppendWriterDryRunExecutionValidationDecisionRecommendation {
  switch (status) {
    case "audit_append_writer_dry_run_execution_validation_ready_for_design_only":
      return "design_only_do_not_write_audit";
    case "audit_append_writer_dry_run_execution_validation_needs_review":
      return "needs_manual_review";
    case "audit_append_writer_dry_run_execution_validation_invalid":
      return "invalid_do_not_write_audit";
    case "audit_append_writer_dry_run_execution_validation_absent":
      return "future_audit_writer_dry_run_execution_validator_required";
    case "audit_append_writer_dry_run_execution_validation_blocked":
      return "blocked_do_not_write_audit";
    default:
      return "future_audit_writer_dry_run_execution_validator_required";
  }
}

function collectWarnings(
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[],
): ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[] {
  const warnings: ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[] =
    [...BASE_WARNINGS];

  if (blockedReasons.length > 0) {
    warnings.push("manual_review_may_be_required");
  }

  return uniqueValues(warnings);
}

function collectReviewItems(
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[],
): ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem[] {
  return blockedReasons.length > 0 ? ALL_REVIEW_ITEMS : [];
}

function hasMetadataKey(
  value: Record<string, unknown> | null | undefined,
  key: string,
): boolean {
  return hasText(typeof value?.[key] === "string" ? value[key] : null);
}

function validateInput(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput
    | null
    | undefined,
): ReasonBuckets {
  const buckets: ReasonBuckets = { blocked: [], invalid: [], review: [] };

  if (!input) {
    addReason(
      buckets,
      "blocked",
      "dry_run_execution_validation_input_missing",
    );
    return buckets;
  }

  if (!input.dryRunExecutionInput) {
    addReason(buckets, "blocked", "dry_run_execution_input_missing");
  }
  if (!input.dryRunExecutionResult) {
    addReason(buckets, "blocked", "dry_run_execution_result_missing");
  }
  if (!input.dryRunValidatorResult) {
    addReason(buckets, "blocked", "dry_run_validator_result_missing");
  }
  if (!input.dryRunResultInput) {
    addReason(buckets, "blocked", "dry_run_result_input_missing");
  }
  if (!input.writerContractValidationResult) {
    addReason(buckets, "blocked", "contract_validator_result_missing");
  }
  if (!input.writerValidatorResult) {
    addReason(buckets, "blocked", "writer_validator_result_missing");
  }
  if (!input.auditWriterContractInput) {
    addReason(buckets, "blocked", "writer_contract_input_missing");
  }
  if (!input.auditEventCandidate) {
    addReason(buckets, "blocked", "audit_event_candidate_missing");
  }
  if (!input.executionRecordReference) {
    addReason(buckets, "blocked", "execution_record_reference_missing");
  }
  if (
    !input.evidenceProvenance ||
    input.evidenceProvenanceValidation.evidenceProvenancePresent !== true ||
    input.evidenceProvenanceValidation.provenanceTraceComplete !== true ||
    input.evidenceProvenanceValidation.sourceReferences.length === 0
  ) {
    addReason(buckets, "blocked", "evidence_provenance_missing");
  }
  if (
    !input.idempotencyMetadata ||
    !input.simulatedIdempotencyDuplicatePreventionValidation
      .idempotencyKeyPresent ||
    !hasMetadataKey(input.idempotencyMetadata, "idempotencyKey")
  ) {
    addReason(buckets, "blocked", "idempotency_key_missing");
  }
  if (
    !input.duplicatePreventionMetadata ||
    !input.simulatedIdempotencyDuplicatePreventionValidation
      .duplicatePreventionKeyPresent ||
    !hasMetadataKey(
      input.duplicatePreventionMetadata,
      "duplicatePreventionKey",
    )
  ) {
    addReason(buckets, "blocked", "duplicate_prevention_key_missing");
  }
  if (!hasText(input.serverOnlySecurityProofStatus)) {
    addReason(buckets, "blocked", "server_only_security_status_missing");
  }
  if (!hasText(input.schemaTableProofStatus)) {
    addReason(buckets, "blocked", "schema_table_proof_status_missing");
  }
  if (!hasText(input.generatedAuditTypesProofStatus)) {
    addReason(buckets, "blocked", "generated_audit_types_status_missing");
  }
  if (!hasText(input.migrationProofStatus)) {
    addReason(buckets, "blocked", "migration_status_missing");
  }
  if (!hasText(input.rlsSecurityProofStatus)) {
    addReason(buckets, "blocked", "rls_security_status_missing");
  }
  if (input.explicitDryRunOnlyFlag !== true) {
    addReason(buckets, "blocked", "explicit_dry_run_only_flag_missing");
  }
  if (
    input.serviceRoleExposureRiskStatus === "risk_present" ||
    input.serverOnlySecurityDependencyValidation.serviceRoleExposureRisk
  ) {
    addReason(buckets, "invalid", "service_role_exposure_risk");
  }
  if (
    input.clientSideWriteRiskStatus === "risk_present" ||
    input.serverOnlySecurityDependencyValidation.clientSideWriteRisk
  ) {
    addReason(buckets, "invalid", "client_side_write_risk");
  }
  if (input.resultValidation.dryRunExecutionResultClaimsWriteApproval) {
    addReason(
      buckets,
      "invalid",
      "dry_run_execution_success_misinterpreted_as_write_approval",
    );
  }
  if (input.resultValidation.dryRunExecutionResultClaimsSecurityProof) {
    addReason(
      buckets,
      "invalid",
      "dry_run_execution_success_misinterpreted_as_security_proof",
    );
  }
  if (input.resultValidation.dryRunExecutionResultClaimsSchemaProof) {
    addReason(
      buckets,
      "invalid",
      "dry_run_execution_success_misinterpreted_as_schema_proof",
    );
  }
  if (input.resultValidation.dryRunExecutionResultClaimsDownstreamApproval) {
    addReason(
      buckets,
      "invalid",
      "dry_run_execution_success_misinterpreted_as_downstream_approval",
    );
  }

  const valuesToScan: unknown[] = [
    input,
    input.metadata,
    input.dryRunExecutionInput,
    input.dryRunExecutionResult,
    input.dryRunValidatorResult,
    input.dryRunResultInput,
    input.writerContractValidationResult,
    input.writerValidatorResult,
    input.auditWriterContractInput,
    input.auditEventCandidate,
    input.evidenceProvenance,
    input.idempotencyMetadata,
    input.duplicatePreventionMetadata,
    input.manualReviewMetadata,
    input.downstreamAuthorityMetadata,
    input.inputValidation,
    input.resultValidation,
    input.simulatedAuditEventValidation,
    input.simulatedTableSchemaValidation,
    input.simulatedIdempotencyDuplicatePreventionValidation,
    input.evidenceProvenanceValidation,
    input.serverOnlySecurityDependencyValidation,
    input.noWriteNoActionSafetyValidation,
    input.dependencyValidation,
    input.authority,
    input.safetyPolicy,
  ];

  for (const value of valuesToScan) {
    addAuthorityReasons(buckets, value);
  }

  return buckets;
}

function baseSummary(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput
    | null
    | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem[],
) {
  return {
    statusKnown: Boolean(input),
    readyForDesignOnly: blockedReasons.length === 0,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function buildInputValidationSummary(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput
    | null
    | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionInputValidationSummary {
  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    dryRunExecutionValidationInputPresent: Boolean(input),
    dryRunExecutionInputPresent: Boolean(input?.dryRunExecutionInput),
    dryRunValidatorResultPresent: Boolean(input?.dryRunValidatorResult),
    dryRunResultInputPresent: Boolean(input?.dryRunResultInput),
    writerContractValidationResultPresent:
      Boolean(input?.writerContractValidationResult),
    writerValidatorResultPresent: Boolean(input?.writerValidatorResult),
    writerContractInputPresent: Boolean(input?.auditWriterContractInput),
    auditEventCandidatePresent: Boolean(input?.auditEventCandidate),
    executionRecordReferencePresent: Boolean(input?.executionRecordReference),
    evidenceProvenancePresent: Boolean(input?.evidenceProvenance),
    idempotencyMetadataPresent: Boolean(input?.idempotencyMetadata),
    duplicatePreventionMetadataPresent:
      Boolean(input?.duplicatePreventionMetadata),
    explicitDryRunOnlyFlagPresent: input?.explicitDryRunOnlyFlag === true,
    downstreamAuthorityMetadataPresent:
      Boolean(input?.downstreamAuthorityMetadata),
    unsafeCallablePresent: false,
    metadata: input?.inputValidation.metadata,
  };
}

function buildResultValidationSummary(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput
    | null
    | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionResultValidationSummary {
  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    dryRunExecutionResultPresent: Boolean(input?.dryRunExecutionResult),
    dryRunExecutionResultStatus: input?.dryRunExecutionResult?.status ?? null,
    dryRunExecutionResultReadyForDesignOnly:
      input?.dryRunExecutionResult?.status ===
      "audit_append_writer_dry_run_execution_ready_for_design_only",
    dryRunExecutionResultClaimsWriteApproval: false,
    dryRunExecutionResultClaimsSecurityProof: false,
    dryRunExecutionResultClaimsSchemaProof: false,
    dryRunExecutionResultClaimsDownstreamApproval: false,
    dryRunExecutionResultClaimsAuditWriteExecuted: false,
    dryRunExecutionResultAuthorityFlagsAllFalse:
      input?.dryRunExecutionResult?.authority.auditWriteAllowed === false &&
      input.dryRunExecutionResult.authority.safeToWriteAudit === false &&
      input.dryRunExecutionResult.authority.routeCallAllowed === false &&
      input.dryRunExecutionResult.authority.recordCreationAllowed === false &&
      input.dryRunExecutionResult.authority.persistenceWriteAllowed === false,
    metadata: input?.resultValidation.metadata,
  };
}

function buildSimulatedAuditEventSummary(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput
    | null
    | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedAuditEventValidationSummary {
  const summary = input?.dryRunExecutionResult?.simulatedAuditEventPayload;

  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    auditEventCandidatePresent: Boolean(input?.auditEventCandidate),
    simulatedAuditEventPayloadPresent:
      summary?.simulatedPayloadPresent === true,
    wouldAttemptAuditWrite: summary?.wouldAttemptAuditWrite === true,
    auditWriteExecuted: false,
    auditWriteAllowed: false,
    safeToWriteAudit: false,
    executionRecordReferencePresent: Boolean(input?.executionRecordReference),
    hypotheticalOnly: true,
    metadata: input?.simulatedAuditEventValidation.metadata,
  };
}

function buildSimulatedTableSchemaSummary(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput
    | null
    | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedTableSchemaValidationSummary {
  const summary = input?.dryRunExecutionResult?.simulatedTableSchemaTarget;

  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    schemaTableStatusKnown: hasText(input?.schemaTableProofStatus),
    schemaTableProofPresent: summary?.schemaTableProofPresent === true,
    generatedAuditTypesStatusKnown:
      hasText(input?.generatedAuditTypesProofStatus),
    generatedAuditTypesProofPresent:
      summary?.generatedAuditTypesProofPresent === true,
    generatedExecutionRecordTypesPresent:
      summary?.generatedExecutionRecordTypesPresent === true,
    generatedExecutionRecordTypesAssumedEnough: false,
    migrationStatusKnown: hasText(input?.migrationProofStatus),
    migrationProofPresent: summary?.migrationProofPresent === true,
    rlsSecurityStatusKnown: hasText(input?.rlsSecurityProofStatus),
    rlsSecurityProofPresent: summary?.rlsSecurityProofPresent === true,
    schemaTableAssumedWithoutProof: false,
    metadata: input?.simulatedTableSchemaValidation.metadata,
  };
}

function buildIdempotencySummary(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput
    | null
    | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedIdempotencyDuplicatePreventionValidationSummary {
  const idempotency = input?.dryRunExecutionResult?.simulatedIdempotency;
  const duplicatePrevention =
    input?.dryRunExecutionResult?.simulatedDuplicatePrevention;

  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    idempotencyKeyPresent: idempotency?.idempotencyKeyPresent === true,
    idempotencyMetadataComplete:
      idempotency?.idempotencyMetadataComplete === true,
    duplicatePreventionKeyPresent:
      duplicatePrevention?.duplicatePreventionKeyPresent === true,
    duplicatePreventionMetadataComplete:
      duplicatePrevention?.duplicatePreventionMetadataComplete === true,
    retrySafetyRepresented: idempotency?.retrySafetyRepresented === true,
    unknownWriteStatusRepresented:
      idempotency?.unknownWriteStatusRepresented === true,
    duplicateMatches: duplicatePrevention?.duplicateMatches ?? [],
    simulatedDuplicateWriteWouldBeBlocked:
      duplicatePrevention?.simulatedDuplicateWriteWouldBeBlocked === true,
    duplicateWriteExecuted: false,
    safeToWriteDuplicateAuditEvent: false,
    metadata: input?.simulatedIdempotencyDuplicatePreventionValidation.metadata,
  };
}

function buildEvidenceSummary(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput
    | null
    | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionEvidenceProvenanceValidationSummary {
  const summary = input?.dryRunExecutionResult?.evidenceProvenance;

  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    executionRecordReference:
      summary?.executionRecordReference ?? input?.executionRecordReference ?? null,
    executionRecordReferencePresent:
      summary?.executionRecordReferencePresent === true ||
      Boolean(input?.executionRecordReference),
    evidenceProvenancePresent: summary?.evidenceProvenancePresent === true,
    actorSourceMetadataPresent: summary?.actorSourceMetadataPresent === true,
    timestampSourceClockPresent: summary?.timestampSourceClockPresent === true,
    auditEventCandidatePresent:
      summary?.auditEventCandidatePresent === true ||
      Boolean(input?.auditEventCandidate),
    sourceReferences: summary?.sourceReferences ?? [],
    noLocalOnlySourceOfTruth: summary?.noLocalOnlySourceOfTruth === true,
    provenanceTraceComplete: summary?.provenanceTraceComplete === true,
    metadata: input?.evidenceProvenanceValidation.metadata,
  };
}

function buildServerOnlySummary(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput
    | null
    | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionServerOnlySecurityDependencyValidationSummary {
  const summary = input?.dryRunExecutionResult?.serverOnlySecurity;

  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    serverOnlySecurityStatusKnown: hasText(input?.serverOnlySecurityProofStatus),
    serverOnlyProofPresent: summary?.serverOnlyProofPresent === true,
    serviceRoleProofPresent: summary?.serviceRoleProofPresent === true,
    serviceRoleExposureRisk:
      input?.serverOnlySecurityDependencyValidation.serviceRoleExposureRisk === true,
    clientSideWriteRisk:
      input?.serverOnlySecurityDependencyValidation.clientSideWriteRisk === true,
    routeAuthBoundaryProofPresent:
      summary?.routeAuthBoundaryProofPresent === true,
    serviceRoleSecretValuesForbidden: true,
    clientSideWriteForbidden: true,
    metadata: input?.serverOnlySecurityDependencyValidation.metadata,
  };
}

function buildNoWriteNoActionSummary(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput
    | null
    | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionNoWriteNoActionSafetyValidationSummary {
  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    validationOnly: true,
    designOnly: true,
    dryRunExecutionValidationOnly: true,
    hypotheticalOnly: true,
    nonPersistent: true,
    dryRunExecuted: false,
    dryRunExecutedAgainstRealData: false,
    auditWriteExecuted: false,
    auditWriteAllowed: false,
    auditAppendAllowed: false,
    routeCallAllowed: false,
    recordCreationAllowed: false,
    persistenceWriteAllowed: false,
    supabaseWriteAllowed: false,
    localStorageWriteAllowed: false,
    statsPnlUpdateAllowed: false,
    tradeMutationAllowed: false,
    tradeReconciliationAllowed: false,
    correctionRollbackAllowed: false,
    uiStateMutationAllowed: false,
    userNotificationAllowed: false,
    brokerAvanzaActionAllowed: false,
    automaticModeAllowed: false,
    metadata: input?.noWriteNoActionSafetyValidation.metadata,
  };
}

function buildDependencySummary(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput
    | null
    | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionDependencyValidationSummary {
  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    dryRunExecutionValidatorImplemented: false,
    dryRunExecutionImplemented: false,
    dryRunImplemented: false,
    writerImplemented: false,
    auditAppendImplemented: false,
    auditRouteImplemented: false,
    auditWritePathPresent: false,
    productionInsertRouteImplemented:
      input?.dependencyValidation.productionInsertRouteImplemented === true,
    productionInsertWritePathPresent:
      input?.dependencyValidation.productionInsertWritePathPresent === true,
    dryRunExecutionContractPresent: Boolean(input?.dryRunExecutionInput),
    dryRunValidatorResultPresent: Boolean(input?.dryRunValidatorResult),
    dryRunResultInputPresent: Boolean(input?.dryRunResultInput),
    contractValidatorResultPresent:
      Boolean(input?.writerContractValidationResult),
    writerValidatorResultPresent: Boolean(input?.writerValidatorResult),
    writerContractInputPresent: Boolean(input?.auditWriterContractInput),
    serverOnlyProofPresent:
      input?.dependencyValidation.serverOnlyProofPresent === true,
    serviceRoleProofPresent:
      input?.dependencyValidation.serviceRoleProofPresent === true,
    auditSchemaTableProofPresent:
      input?.dependencyValidation.auditSchemaTableProofPresent === true,
    generatedAuditTypesProofPresent:
      input?.dependencyValidation.generatedAuditTypesProofPresent === true,
    generatedTypesProofPresent:
      input?.dependencyValidation.generatedTypesProofPresent === true,
    migrationProofPresent:
      input?.dependencyValidation.migrationProofPresent === true,
    rlsSecurityProofPresent:
      input?.dependencyValidation.rlsSecurityProofPresent === true,
    devPreviewDiagnosticsAreProof: false,
    metadata: input?.dependencyValidation.metadata,
  };
}

export function validateExecutionRecordAuditAppendWriterDryRunExecution(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput
    | null
    | undefined,
): ExecutionRecordAuditAppendWriterDryRunExecutionValidationResult {
  const buckets = validateInput(input);
  const blockedReasons = collectBlockedReasons(buckets);
  const warnings = collectWarnings(blockedReasons);
  const reviewItems = collectReviewItems(blockedReasons);
  const status = statusFromBuckets(input, buckets);
  const decisionRecommendation = decisionFromStatus(status);

  return {
    contractVersion:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATOR_CONTRACT_VERSION,
    status,
    decisionRecommendation,
    validationOnly: true,
    designOnly: true,
    dryRunExecutionValidationOnly: true,
    hypotheticalOnly: true,
    nonPersistent: true,
    dryRunExecutionValidatorImplemented: false,
    dryRunExecutionAllowed: false,
    dryRunExecutedAgainstRealData: false,
    dryRunExecutionImplemented: false,
    dryRunExecuted: false,
    auditWriteExecuted: false,
    auditWriteAllowed: false,
    safeToWriteAudit: false,
    validationIsDryRunExecution: false,
    validationIsAuditWriteApproval: false,
    validationIsAuditAppendExecution: false,
    validationIsRouteCallApproval: false,
    validationIsRecordCreationApproval: false,
    validationIsPersistenceWriteApproval: false,
    validationIsSupabaseLocalStorageWriteApproval: false,
    validationIsSecurityProof: false,
    validationIsServerOnlyProof: false,
    validationIsSchemaProof: false,
    validationIsGeneratedTypesProof: false,
    validationIsMigrationProof: false,
    validationIsRlsSecurityProof: false,
    validationIsDownstreamApproval: false,
    dryRunExecutionSuccessIsWriteApproval: false,
    dryRunValidatorReadinessIsExecution: false,
    dryRunValidatorReadinessIsWriteApproval: false,
    contractValidatorReadinessIsWriteApproval: false,
    writerValidatorReadinessIsWriteApproval: false,
    insertSuccessIsAuditWriteApproval: false,
    devPreviewDiagnosticsAreWriteApproval: false,
    inputValidation: buildInputValidationSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    resultValidation: buildResultValidationSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    simulatedAuditEventValidation: buildSimulatedAuditEventSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    simulatedTableSchemaValidation: buildSimulatedTableSchemaSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    simulatedIdempotencyDuplicatePreventionValidation:
      buildIdempotencySummary(input, blockedReasons, warnings, reviewItems),
    evidenceProvenanceValidation: buildEvidenceSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    serverOnlySecurityDependencyValidation: buildServerOnlySummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    noWriteNoActionSafetyValidation: buildNoWriteNoActionSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    dependencyValidation: buildDependencySummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    authority:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_DEFAULT_SAFETY_POLICY,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: {
      ...input?.metadata,
      validatorPure: true,
      validatorDeterministic: true,
      designReadinessOnly: true,
      readyMeansDesignOnlyDoNotWriteAudit: true,
      noDryRunExecution: true,
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
