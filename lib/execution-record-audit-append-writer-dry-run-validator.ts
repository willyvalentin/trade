import {
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_DEFAULT_SAFETY_POLICY,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordAuditAppendWriterDryRunDependencyValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunEvidenceProvenanceValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunIdempotencyDuplicatePreventionValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunInputValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunNoWriteNoActionSafetyValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunResultValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunServerOnlySecurityDependencyValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunTableSchemaSimulationValidationSummary,
  type ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason,
  type ExecutionRecordAuditAppendWriterDryRunValidationDecisionRecommendation,
  type ExecutionRecordAuditAppendWriterDryRunValidationInput,
  type ExecutionRecordAuditAppendWriterDryRunValidationResult,
  type ExecutionRecordAuditAppendWriterDryRunValidationReviewItem,
  type ExecutionRecordAuditAppendWriterDryRunValidationStatus,
  type ExecutionRecordAuditAppendWriterDryRunValidationWarning,
  type ExecutionRecordAuditAppendWriterDryRunWouldWriteAuditEventValidationSummary,
} from "@/lib/execution-record-audit-append-writer-dry-run-validator-contract";

// Pure audit append writer dry-run validation only. This module does not
// execute dry-run logic, execute an audit writer, append/write audit data, call
// routes, create records, persist/write, write Supabase/localStorage, update
// stats/PnL, roll back/correct, mutate or reconcile trades, update UI, notify
// users, run broker/order behavior, automate Avanza/browser behavior, or enable
// automatic mode.

type ReasonBuckets = {
  blocked: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[];
  invalid: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[];
  review: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[];
};

const BASE_WARNINGS: ExecutionRecordAuditAppendWriterDryRunValidationWarning[] =
  [
    "contract_only",
    "dry_run_validator_not_implemented",
    "dry_run_not_implemented",
    "audit_writer_not_implemented",
    "audit_route_not_implemented",
    "audit_write_not_executed",
    "dry_run_validation_not_audit_write_approval",
    "dry_run_validation_not_dry_run_execution",
    "dry_run_validation_not_security_proof",
    "dry_run_validation_not_server_only_proof",
    "dry_run_validation_not_schema_proof",
    "dry_run_validation_not_generated_types_proof",
    "dry_run_validation_not_migration_proof",
    "dry_run_validation_not_rls_security_proof",
    "dry_run_validation_not_downstream_approval",
    "dry_run_result_success_not_write_approval",
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

const ALL_REVIEW_ITEMS: ExecutionRecordAuditAppendWriterDryRunValidationReviewItem[] =
  [
    "audit_append_writer_dry_run_validator_contract_review",
    "dry_run_validation_input_review",
    "dry_run_result_input_review",
    "dry_run_result_output_review",
    "contract_validator_result_review",
    "writer_validator_result_review",
    "writer_contract_input_review",
    "would_write_audit_event_review",
    "table_schema_simulation_review",
    "idempotency_duplicate_prevention_review",
    "evidence_provenance_review",
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

const AUTOMATIC_MODE_KEYS = [
  "automaticModeAllowed",
  "automaticModeRequested",
];

const DRY_RUN_WRITE_APPROVAL_KEYS = [
  "dryRunResultSuccessIsWriteApproval",
  "dryRunSuccessIsWriteApproval",
  "dryRunSuccessIsAuditWriteApproval",
  "dryRunSuccessApprovesAuditWrite",
];

const DRY_RUN_PROOF_CONFUSION_KEYS = [
  "validationIsSecurityProof",
  "validationIsServerOnlyProof",
  "validationIsSchemaProof",
  "validationIsGeneratedTypesProof",
  "validationIsMigrationProof",
  "validationIsRlsSecurityProof",
  "dryRunResultSuccessIsSecurityProof",
  "dryRunResultSuccessIsServerOnlyProof",
  "dryRunResultSuccessIsSchemaProof",
  "dryRunResultSuccessIsGeneratedTypesProof",
  "dryRunResultSuccessIsMigrationProof",
  "dryRunResultSuccessIsRlsSecurityProof",
  "dryRunSuccessIsSecurityProof",
  "dryRunSuccessIsSchemaProof",
];

const DOWNSTREAM_APPROVAL_KEYS = [
  "validationIsDownstreamApproval",
  "dryRunResultSuccessIsDownstreamApproval",
  "dryRunSuccessIsDownstreamApproval",
  "downstreamAuthorityPresent",
  "downstreamActionAllowed",
  "downstreamActionRequested",
];

const CONTRACT_VALIDATOR_APPROVAL_KEYS = [
  "contractValidatorReadinessIsWriteApproval",
  "contractValidatorReadinessIsAuditWriteApproval",
];

const WRITER_VALIDATOR_APPROVAL_KEYS = [
  "writerValidatorReadinessIsWriteApproval",
  "writerValidatorReadinessIsAuditWriteApproval",
];

const INSERT_SUCCESS_APPROVAL_KEYS = [
  "insertSuccessIsAuditWriteApproval",
  "insertSuccessApprovesAuditWrite",
];

const DEV_PREVIEW_APPROVAL_KEYS = [
  "devPreviewDiagnosticsAreWriteApproval",
  "devPreviewDiagnosticsAreAuditWriteApproval",
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
  reason: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason,
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
  if (hasAnyTruthyFlag(value, DRY_RUN_WRITE_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "dry_run_success_misinterpreted_as_write_approval",
    );
  }
  if (hasAnyTruthyFlag(value, DRY_RUN_PROOF_CONFUSION_KEYS)) {
    addReason(
      buckets,
      "invalid",
      hasAnyTruthyFlag(value, [
        "validationIsSchemaProof",
        "dryRunResultSuccessIsSchemaProof",
        "dryRunSuccessIsSchemaProof",
      ])
        ? "dry_run_success_misinterpreted_as_schema_proof"
        : "dry_run_success_misinterpreted_as_security_proof",
    );
  }
  if (hasAnyTruthyFlag(value, DOWNSTREAM_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "dry_run_success_misinterpreted_as_downstream_approval",
    );
  }
  if (hasAnyTruthyFlag(value, CONTRACT_VALIDATOR_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "dry_run_success_misinterpreted_as_write_approval",
    );
  }
  if (hasAnyTruthyFlag(value, WRITER_VALIDATOR_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "dry_run_success_misinterpreted_as_write_approval",
    );
  }
  if (hasAnyTruthyFlag(value, INSERT_SUCCESS_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "dry_run_success_misinterpreted_as_write_approval",
    );
  }
  if (hasAnyTruthyFlag(value, DEV_PREVIEW_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "dry_run_success_misinterpreted_as_write_approval",
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
): ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[] {
  return uniqueValues([
    ...buckets.invalid,
    ...buckets.blocked,
    ...buckets.review,
  ]);
}

function statusFromBuckets(
  input: ExecutionRecordAuditAppendWriterDryRunValidationInput | null | undefined,
  buckets: ReasonBuckets,
): ExecutionRecordAuditAppendWriterDryRunValidationStatus {
  if (!input) {
    return "audit_append_writer_dry_run_validation_absent";
  }
  if (buckets.invalid.length > 0) {
    return "audit_append_writer_dry_run_validation_invalid";
  }
  if (buckets.blocked.length > 0) {
    return "audit_append_writer_dry_run_validation_blocked";
  }
  if (buckets.review.length > 0) {
    return "audit_append_writer_dry_run_validation_needs_review";
  }
  return "audit_append_writer_dry_run_validation_ready_for_design_only";
}

function decisionFromStatus(
  status: ExecutionRecordAuditAppendWriterDryRunValidationStatus,
): ExecutionRecordAuditAppendWriterDryRunValidationDecisionRecommendation {
  switch (status) {
    case "audit_append_writer_dry_run_validation_ready_for_design_only":
      return "design_only_do_not_write_audit";
    case "audit_append_writer_dry_run_validation_needs_review":
      return "needs_manual_review";
    case "audit_append_writer_dry_run_validation_invalid":
      return "invalid_do_not_write_audit";
    case "audit_append_writer_dry_run_validation_absent":
      return "future_audit_writer_dry_run_validator_required";
    case "audit_append_writer_dry_run_validation_blocked":
      return "blocked_do_not_write_audit";
    default:
      return "future_audit_writer_dry_run_validator_required";
  }
}

function collectWarnings(
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[],
): ExecutionRecordAuditAppendWriterDryRunValidationWarning[] {
  const warnings: ExecutionRecordAuditAppendWriterDryRunValidationWarning[] = [
    ...BASE_WARNINGS,
  ];

  if (blockedReasons.length > 0) {
    warnings.push("manual_review_may_be_required");
  }

  return uniqueValues(warnings);
}

function collectReviewItems(
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[],
): ExecutionRecordAuditAppendWriterDryRunValidationReviewItem[] {
  return blockedReasons.length > 0 ? ALL_REVIEW_ITEMS : [];
}

function hasMetadataKey(
  value: Record<string, unknown> | null | undefined,
  key: string,
): boolean {
  return hasText(typeof value?.[key] === "string" ? value[key] : null);
}

function validateInput(
  input: ExecutionRecordAuditAppendWriterDryRunValidationInput | null | undefined,
): ReasonBuckets {
  const buckets: ReasonBuckets = { blocked: [], invalid: [], review: [] };

  if (!input) {
    addReason(buckets, "blocked", "dry_run_validation_input_missing");
    return buckets;
  }

  if (!input.dryRunResultInput) {
    addReason(buckets, "blocked", "dry_run_result_input_missing");
  }
  if (!input.dryRunResult) {
    addReason(buckets, "blocked", "dry_run_result_output_missing");
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
    !input.idempotencyDuplicatePreventionValidation.idempotencyKeyPresent ||
    !hasMetadataKey(input.idempotencyMetadata, "idempotencyKey")
  ) {
    addReason(buckets, "blocked", "idempotency_key_missing");
  }
  if (
    !input.duplicatePreventionMetadata ||
    !input.idempotencyDuplicatePreventionValidation.duplicatePreventionKeyPresent ||
    !hasMetadataKey(input.duplicatePreventionMetadata, "duplicatePreventionKey")
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
  if (input.resultValidation.dryRunResultClaimsWriteApproval) {
    addReason(
      buckets,
      "invalid",
      "dry_run_success_misinterpreted_as_write_approval",
    );
  }
  if (input.resultValidation.dryRunResultClaimsSecurityProof) {
    addReason(
      buckets,
      "invalid",
      "dry_run_success_misinterpreted_as_security_proof",
    );
  }
  if (input.resultValidation.dryRunResultClaimsSchemaProof) {
    addReason(
      buckets,
      "invalid",
      "dry_run_success_misinterpreted_as_schema_proof",
    );
  }
  if (input.resultValidation.dryRunResultClaimsDownstreamApproval) {
    addReason(
      buckets,
      "invalid",
      "dry_run_success_misinterpreted_as_downstream_approval",
    );
  }

  const valuesToScan: unknown[] = [
    input,
    input.metadata,
    input.dryRunResultInput,
    input.dryRunResult,
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
    input.wouldWriteAuditEventValidation,
    input.tableSchemaSimulationValidation,
    input.idempotencyDuplicatePreventionValidation,
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
  input: ExecutionRecordAuditAppendWriterDryRunValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunValidationReviewItem[],
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
  input: ExecutionRecordAuditAppendWriterDryRunValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunInputValidationSummary {
  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    dryRunValidationInputPresent: Boolean(input),
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
    downstreamAuthorityMetadataPresent:
      Boolean(input?.downstreamAuthorityMetadata),
    unsafeCallablePresent: false,
    metadata: input?.inputValidation.metadata,
  };
}

function buildResultValidationSummary(
  input: ExecutionRecordAuditAppendWriterDryRunValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunResultValidationSummary {
  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    dryRunResultOutputPresent: Boolean(input?.dryRunResult),
    dryRunResultStatus: input?.dryRunResult?.status ?? null,
    dryRunResultReadyForDesignOnly:
      input?.dryRunResult?.status ===
      "audit_append_writer_dry_run_ready_for_design_only",
    dryRunResultClaimsWriteApproval: false,
    dryRunResultClaimsSecurityProof: false,
    dryRunResultClaimsSchemaProof: false,
    dryRunResultClaimsDownstreamApproval: false,
    dryRunResultClaimsAuditWriteExecuted: false,
    dryRunResultAuthorityFlagsAllFalse:
      input?.dryRunResult?.authority.auditWriteAllowed === false &&
      input.dryRunResult.authority.safeToWriteAudit === false &&
      input.dryRunResult.authority.routeCallAllowed === false &&
      input.dryRunResult.authority.recordCreationAllowed === false &&
      input.dryRunResult.authority.persistenceWriteAllowed === false,
    metadata: input?.resultValidation.metadata,
  };
}

function buildWouldWriteValidationSummary(
  input: ExecutionRecordAuditAppendWriterDryRunValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunWouldWriteAuditEventValidationSummary {
  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    auditEventCandidatePresent: Boolean(input?.auditEventCandidate),
    wouldWriteSummaryPresent: Boolean(input?.dryRunResult?.wouldWriteAuditEvent),
    wouldAttemptAuditWrite:
      input?.dryRunResult?.wouldWriteAuditEvent.wouldAttemptAuditWrite === true,
    auditWriteExecuted: false,
    auditWriteAllowed: false,
    safeToWriteAudit: false,
    executionRecordReferencePresent: Boolean(input?.executionRecordReference),
    hypotheticalOnly: true,
    metadata: input?.wouldWriteAuditEventValidation.metadata,
  };
}

function buildTableSchemaValidationSummary(
  input: ExecutionRecordAuditAppendWriterDryRunValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunTableSchemaSimulationValidationSummary {
  const summary = input?.dryRunResult?.wouldUseTableSchema;

  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    schemaTableStatusKnown: hasText(input?.schemaTableProofStatus),
    schemaTableProofPresent: summary?.auditSchemaTableProofPresent === true,
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
    metadata: input?.tableSchemaSimulationValidation.metadata,
  };
}

function buildIdempotencyValidationSummary(
  input: ExecutionRecordAuditAppendWriterDryRunValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunIdempotencyDuplicatePreventionValidationSummary {
  const summary = input?.dryRunResult?.duplicatePreventionSimulation;

  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    idempotencyKeyPresent:
      input?.dryRunResult?.wouldUseIdempotency.idempotencyKeyPresent === true,
    idempotencyMetadataComplete:
      input?.dryRunResult?.wouldUseIdempotency.idempotencyMetadataComplete === true,
    duplicatePreventionKeyPresent:
      summary?.duplicatePreventionKeyPresent === true,
    duplicatePreventionMetadataComplete:
      summary?.duplicatePreventionMetadataComplete === true,
    retrySafetyRepresented:
      input?.dryRunResult?.wouldUseIdempotency.retrySafetyRepresented === true,
    unknownWriteStatusRepresented:
      input?.dryRunResult?.wouldUseIdempotency.unknownWriteStatusRepresented === true,
    duplicateMatches: summary?.duplicateMatches ?? [],
    duplicateWriteWouldBeBlocked:
      summary?.duplicateWriteWouldBeBlocked === true,
    duplicateWriteExecuted: false,
    safeToWriteDuplicateAuditEvent: false,
    metadata: input?.idempotencyDuplicatePreventionValidation.metadata,
  };
}

function buildEvidenceValidationSummary(
  input: ExecutionRecordAuditAppendWriterDryRunValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunEvidenceProvenanceValidationSummary {
  const summary = input?.dryRunResult?.evidenceProvenance;

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

function buildServerOnlyValidationSummary(
  input: ExecutionRecordAuditAppendWriterDryRunValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunServerOnlySecurityDependencyValidationSummary {
  const summary = input?.dryRunResult?.serverOnlySecurity;

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
  input: ExecutionRecordAuditAppendWriterDryRunValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunNoWriteNoActionSafetyValidationSummary {
  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    validationOnly: true,
    designOnly: true,
    dryRunValidationOnly: true,
    hypotheticalOnly: true,
    dryRunExecuted: false,
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

function buildDependencyValidationSummary(
  input: ExecutionRecordAuditAppendWriterDryRunValidationInput | null | undefined,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunValidationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunValidationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunDependencyValidationSummary {
  return {
    ...baseSummary(input, blockedReasons, warnings, reviewItems),
    dryRunValidatorImplemented: false,
    dryRunImplemented: false,
    writerImplemented: false,
    auditAppendImplemented: false,
    auditRouteImplemented: false,
    auditWritePathPresent: false,
    productionInsertRouteImplemented:
      input?.dependencyValidation.productionInsertRouteImplemented === true,
    productionInsertWritePathPresent:
      input?.dependencyValidation.productionInsertWritePathPresent === true,
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

export function validateExecutionRecordAuditAppendWriterDryRun(
  input: ExecutionRecordAuditAppendWriterDryRunValidationInput | null | undefined,
): ExecutionRecordAuditAppendWriterDryRunValidationResult {
  const buckets = validateInput(input);
  const blockedReasons = collectBlockedReasons(buckets);
  const warnings = collectWarnings(blockedReasons);
  const reviewItems = collectReviewItems(blockedReasons);
  const status = statusFromBuckets(input, buckets);
  const decisionRecommendation = decisionFromStatus(status);

  return {
    contractVersion:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATOR_CONTRACT_VERSION,
    status,
    decisionRecommendation,
    validationOnly: true,
    designOnly: true,
    dryRunValidationOnly: true,
    hypotheticalOnly: true,
    nonPersistent: true,
    dryRunValidatorImplemented: false,
    dryRunExecuted: false,
    dryRunExecutionAllowed: false,
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
    dryRunResultSuccessIsWriteApproval: false,
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
    wouldWriteAuditEventValidation: buildWouldWriteValidationSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    tableSchemaSimulationValidation: buildTableSchemaValidationSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    idempotencyDuplicatePreventionValidation:
      buildIdempotencyValidationSummary(
        input,
        blockedReasons,
        warnings,
        reviewItems,
      ),
    evidenceProvenanceValidation: buildEvidenceValidationSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    serverOnlySecurityDependencyValidation:
      buildServerOnlyValidationSummary(
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
    dependencyValidation: buildDependencyValidationSummary(
      input,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    authority:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_DEFAULT_SAFETY_POLICY,
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
