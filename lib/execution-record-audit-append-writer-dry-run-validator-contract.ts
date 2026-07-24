import type {
  ExecutionRecordAuditAppendWriterInput,
} from "@/lib/execution-record-audit-append-writer-contract";
import type {
  ExecutionRecordAuditAppendWriterContractValidationResult,
} from "@/lib/execution-record-audit-append-writer-contract-validator-contract";
import type {
  ExecutionRecordAuditAppendWriterDryRunInput,
  ExecutionRecordAuditAppendWriterDryRunResult,
} from "@/lib/execution-record-audit-append-writer-dry-run-result-contract";
import type {
  ExecutionRecordAuditAppendWriterValidationResult,
} from "@/lib/execution-record-audit-append-writer-validator-contract";
import type {
  ExecutionRecordDuplicateMatch,
  PersistedExecutionRecordReference,
} from "@/lib/execution-record-persistence-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Audit append writer dry-run validator contract metadata only. These types and
// constants do not implement dry-run validation logic, dry-run execution, audit
// writer behavior, audit append execution, route calls, execution-record
// creation, persistence/write behavior, Supabase/localStorage writes, stats/PnL
// update, rollback/correction, trade mutation/reconciliation, UI update,
// notification execution, broker/order behavior, Avanza/browser behavior, or
// automatic mode. Dry-run validation is not dry-run execution, audit write
// approval, security proof, server-only proof, schema proof, generated-types
// proof, migration proof, RLS/security proof, or downstream action approval.

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATOR_CONTRACT_VERSION =
  "execution_record_audit_append_writer_dry_run_validator_v1" as const;

export type ExecutionRecordAuditAppendWriterDryRunValidatorContractVersion =
  typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATOR_CONTRACT_VERSION;

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_STATUSES =
  [
    "audit_append_writer_dry_run_validation_ready_for_design_only",
    "audit_append_writer_dry_run_validation_blocked",
    "audit_append_writer_dry_run_validation_needs_review",
    "audit_append_writer_dry_run_validation_invalid",
    "audit_append_writer_dry_run_validation_absent",
  ] as const;

export type ExecutionRecordAuditAppendWriterDryRunValidationStatus =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_STATUSES)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_DECISION_RECOMMENDATIONS =
  [
    "design_only_do_not_write_audit",
    "blocked_do_not_write_audit",
    "needs_manual_review",
    "invalid_do_not_write_audit",
    "future_audit_writer_dry_run_validator_required",
  ] as const;

export type ExecutionRecordAuditAppendWriterDryRunValidationDecisionRecommendation =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_BLOCKED_REASONS =
  [
    "dry_run_validation_input_missing",
    "dry_run_result_input_missing",
    "dry_run_result_output_missing",
    "contract_validator_result_missing",
    "writer_validator_result_missing",
    "writer_contract_input_missing",
    "audit_event_candidate_missing",
    "execution_record_reference_missing",
    "evidence_provenance_missing",
    "idempotency_key_missing",
    "duplicate_prevention_key_missing",
    "server_only_security_status_missing",
    "schema_table_proof_status_missing",
    "generated_audit_types_status_missing",
    "migration_status_missing",
    "rls_security_status_missing",
    "service_role_exposure_risk",
    "client_side_write_risk",
    "dry_run_success_misinterpreted_as_write_approval",
    "dry_run_success_misinterpreted_as_security_proof",
    "dry_run_success_misinterpreted_as_schema_proof",
    "dry_run_success_misinterpreted_as_downstream_approval",
    "actual_audit_write_requested",
    "route_call_requested",
    "writer_execution_requested",
    "audit_append_requested",
    "record_creation_requested",
    "persistence_write_requested",
    "supabase_write_requested",
    "local_storage_write_requested",
    "stats_pnl_update_requested",
    "trade_mutation_requested",
    "trade_reconciliation_requested",
    "rollback_correction_requested",
    "ui_update_requested",
    "notification_requested",
    "broker_or_avanza_action_requested",
    "automatic_mode_requested",
  ] as const;

export type ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_WARNINGS =
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
    "manual_review_may_be_required",
    "automatic_mode_not_enabled",
  ] as const;

export type ExecutionRecordAuditAppendWriterDryRunValidationWarning =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_WARNINGS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_REVIEW_ITEMS =
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
  ] as const;

export type ExecutionRecordAuditAppendWriterDryRunValidationReviewItem =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_REVIEW_ITEMS)[number];

export type ExecutionRecordAuditAppendWriterDryRunValidationAuthorityFlags = {
  validationOnly: true;
  designOnly: true;
  dryRunValidationOnly: true;
  dryRunValidatorImplemented: false;
  dryRunExecutionAllowed: false;
  dryRunImplemented: false;
  writerImplemented: false;
  auditAppendImplemented: false;
  auditRouteImplemented: false;
  auditWriteAllowed: false;
  safeToWriteAudit: false;
  auditAppendAllowed: false;
  safeToAppendAudit: false;
  routeCallAllowed: false;
  recordCreationAllowed: false;
  persistenceWriteAllowed: false;
  supabaseWriteAllowed: false;
  localStorageWriteAllowed: false;
  statsPnlUpdateAllowed: false;
  tradeMutationAllowed: false;
  tradeReconciliationAllowed: false;
  correctionRollbackAllowed: false;
  uiStateMutationAllowed: false;
  userNotificationAllowed: false;
  brokerOrderFollowUpAllowed: false;
  avanzaBrowserFollowUpAllowed: false;
  safeToUpdateStats: false;
  safeToMutateTrade: false;
  safeToReconcileTrade: false;
  safeToRollback: false;
  safeToUpdateUiState: false;
  safeToNotifyUser: false;
  safeToRunBrokerAction: false;
  safeToRunAvanzaBrowserAction: false;
  automaticModeAllowed: false;
};

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_DEFAULT_AUTHORITY_FLAGS =
  {
    validationOnly: true,
    designOnly: true,
    dryRunValidationOnly: true,
    dryRunValidatorImplemented: false,
    dryRunExecutionAllowed: false,
    dryRunImplemented: false,
    writerImplemented: false,
    auditAppendImplemented: false,
    auditRouteImplemented: false,
    auditWriteAllowed: false,
    safeToWriteAudit: false,
    auditAppendAllowed: false,
    safeToAppendAudit: false,
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
    brokerOrderFollowUpAllowed: false,
    avanzaBrowserFollowUpAllowed: false,
    safeToUpdateStats: false,
    safeToMutateTrade: false,
    safeToReconcileTrade: false,
    safeToRollback: false,
    safeToUpdateUiState: false,
    safeToNotifyUser: false,
    safeToRunBrokerAction: false,
    safeToRunAvanzaBrowserAction: false,
    automaticModeAllowed: false,
  } as const satisfies ExecutionRecordAuditAppendWriterDryRunValidationAuthorityFlags;

export type ExecutionRecordAuditAppendWriterDryRunValidationSafetyPolicy =
  ExecutionRecordAuditAppendWriterDryRunValidationAuthorityFlags & {
    hypotheticalOnly: true;
    nonPersistent: true;
    validationIsDryRunExecution: false;
    validationIsAuditWriteApproval: false;
    validationIsAuditAppendExecution: false;
    validationIsRouteCallApproval: false;
    validationIsRecordCreationApproval: false;
    validationIsPersistenceWriteApproval: false;
    validationIsSupabaseLocalStorageWriteApproval: false;
    validationIsSecurityProof: false;
    validationIsServerOnlyProof: false;
    validationIsSchemaProof: false;
    validationIsGeneratedTypesProof: false;
    validationIsMigrationProof: false;
    validationIsRlsSecurityProof: false;
    validationIsDownstreamApproval: false;
    dryRunResultSuccessIsWriteApproval: false;
    contractValidatorReadinessIsWriteApproval: false;
    writerValidatorReadinessIsWriteApproval: false;
    insertSuccessIsAuditWriteApproval: false;
    devPreviewDiagnosticsAreWriteApproval: false;
    dryRunExecutionForbidden: true;
    writerExecutionForbidden: true;
    routeCallForbidden: true;
    auditWriteForbidden: true;
    auditAppendForbidden: true;
    recordCreationForbidden: true;
    persistenceWriteForbidden: true;
    supabaseWriteForbidden: true;
    localStorageWriteForbidden: true;
    downstreamActionForbidden: true;
    brokerAvanzaActionForbidden: true;
    automaticModeForbidden: true;
    generatedExecutionRecordTypesAloneNotEnough: true;
    summary:
      "Audit append writer dry-run validation is design/readiness-only. Validation success is not dry-run execution, audit write approval, security proof, server-only proof, schema proof, generated-types proof, migration proof, RLS/security proof, route call approval, persistence/write approval, or downstream action approval.";
  };

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_DEFAULT_SAFETY_POLICY =
  {
    ...EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
    hypotheticalOnly: true,
    nonPersistent: true,
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
    dryRunExecutionForbidden: true,
    writerExecutionForbidden: true,
    routeCallForbidden: true,
    auditWriteForbidden: true,
    auditAppendForbidden: true,
    recordCreationForbidden: true,
    persistenceWriteForbidden: true,
    supabaseWriteForbidden: true,
    localStorageWriteForbidden: true,
    downstreamActionForbidden: true,
    brokerAvanzaActionForbidden: true,
    automaticModeForbidden: true,
    generatedExecutionRecordTypesAloneNotEnough: true,
    summary:
      "Audit append writer dry-run validation is design/readiness-only. Validation success is not dry-run execution, audit write approval, security proof, server-only proof, schema proof, generated-types proof, migration proof, RLS/security proof, route call approval, persistence/write approval, or downstream action approval.",
  } as const satisfies ExecutionRecordAuditAppendWriterDryRunValidationSafetyPolicy;

type ExecutionRecordAuditAppendWriterDryRunValidationDiagnosticSummary = {
  statusKnown: boolean;
  readyForDesignOnly: boolean;
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterDryRunValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterDryRunValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterDryRunInputValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunValidationDiagnosticSummary & {
    dryRunValidationInputPresent: boolean;
    dryRunResultInputPresent: boolean;
    writerContractValidationResultPresent: boolean;
    writerValidatorResultPresent: boolean;
    writerContractInputPresent: boolean;
    auditEventCandidatePresent: boolean;
    executionRecordReferencePresent: boolean;
    evidenceProvenancePresent: boolean;
    idempotencyMetadataPresent: boolean;
    duplicatePreventionMetadataPresent: boolean;
    downstreamAuthorityMetadataPresent: boolean;
    unsafeCallablePresent: false;
  };

export type ExecutionRecordAuditAppendWriterDryRunResultValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunValidationDiagnosticSummary & {
    dryRunResultOutputPresent: boolean;
    dryRunResultStatus?: string | null;
    dryRunResultReadyForDesignOnly: boolean;
    dryRunResultClaimsWriteApproval: false;
    dryRunResultClaimsSecurityProof: false;
    dryRunResultClaimsSchemaProof: false;
    dryRunResultClaimsDownstreamApproval: false;
    dryRunResultClaimsAuditWriteExecuted: false;
    dryRunResultAuthorityFlagsAllFalse: boolean;
  };

export type ExecutionRecordAuditAppendWriterDryRunWouldWriteAuditEventValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunValidationDiagnosticSummary & {
    auditEventCandidatePresent: boolean;
    wouldWriteSummaryPresent: boolean;
    wouldAttemptAuditWrite: boolean;
    auditWriteExecuted: false;
    auditWriteAllowed: false;
    safeToWriteAudit: false;
    executionRecordReferencePresent: boolean;
    hypotheticalOnly: true;
  };

export type ExecutionRecordAuditAppendWriterDryRunTableSchemaSimulationValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunValidationDiagnosticSummary & {
    schemaTableStatusKnown: boolean;
    schemaTableProofPresent: boolean;
    generatedAuditTypesStatusKnown: boolean;
    generatedAuditTypesProofPresent: boolean;
    generatedExecutionRecordTypesPresent: boolean;
    generatedExecutionRecordTypesAssumedEnough: false;
    migrationStatusKnown: boolean;
    migrationProofPresent: boolean;
    rlsSecurityStatusKnown: boolean;
    rlsSecurityProofPresent: boolean;
    schemaTableAssumedWithoutProof: false;
  };

export type ExecutionRecordAuditAppendWriterDryRunIdempotencyDuplicatePreventionValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunValidationDiagnosticSummary & {
    idempotencyKeyPresent: boolean;
    idempotencyMetadataComplete: boolean;
    duplicatePreventionKeyPresent: boolean;
    duplicatePreventionMetadataComplete: boolean;
    retrySafetyRepresented: boolean;
    unknownWriteStatusRepresented: boolean;
    duplicateMatches: ExecutionRecordDuplicateMatch[];
    duplicateWriteWouldBeBlocked: boolean;
    duplicateWriteExecuted: false;
    safeToWriteDuplicateAuditEvent: false;
  };

export type ExecutionRecordAuditAppendWriterDryRunEvidenceProvenanceValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunValidationDiagnosticSummary & {
    executionRecordReference?: PersistedExecutionRecordReference | null;
    executionRecordReferencePresent: boolean;
    evidenceProvenancePresent: boolean;
    actorSourceMetadataPresent: boolean;
    timestampSourceClockPresent: boolean;
    auditEventCandidatePresent: boolean;
    sourceReferences: string[];
    noLocalOnlySourceOfTruth: boolean;
    provenanceTraceComplete: boolean;
  };

export type ExecutionRecordAuditAppendWriterDryRunServerOnlySecurityDependencyValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunValidationDiagnosticSummary & {
    serverOnlySecurityStatusKnown: boolean;
    serverOnlyProofPresent: boolean;
    serviceRoleProofPresent: boolean;
    serviceRoleExposureRisk: boolean;
    clientSideWriteRisk: boolean;
    routeAuthBoundaryProofPresent: boolean;
    serviceRoleSecretValuesForbidden: true;
    clientSideWriteForbidden: true;
  };

export type ExecutionRecordAuditAppendWriterDryRunNoWriteNoActionSafetyValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunValidationDiagnosticSummary & {
    validationOnly: true;
    designOnly: true;
    dryRunValidationOnly: true;
    hypotheticalOnly: true;
    dryRunExecuted: false;
    auditWriteExecuted: false;
    auditWriteAllowed: false;
    auditAppendAllowed: false;
    routeCallAllowed: false;
    recordCreationAllowed: false;
    persistenceWriteAllowed: false;
    supabaseWriteAllowed: false;
    localStorageWriteAllowed: false;
    statsPnlUpdateAllowed: false;
    tradeMutationAllowed: false;
    tradeReconciliationAllowed: false;
    correctionRollbackAllowed: false;
    uiStateMutationAllowed: false;
    userNotificationAllowed: false;
    brokerAvanzaActionAllowed: false;
    automaticModeAllowed: false;
  };

export type ExecutionRecordAuditAppendWriterDryRunDependencyValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunValidationDiagnosticSummary & {
    dryRunValidatorImplemented: false;
    dryRunImplemented: false;
    writerImplemented: false;
    auditAppendImplemented: false;
    auditRouteImplemented: false;
    auditWritePathPresent: false;
    productionInsertRouteImplemented: boolean;
    productionInsertWritePathPresent: boolean;
    contractValidatorResultPresent: boolean;
    writerValidatorResultPresent: boolean;
    writerContractInputPresent: boolean;
    serverOnlyProofPresent: boolean;
    serviceRoleProofPresent: boolean;
    auditSchemaTableProofPresent: boolean;
    generatedAuditTypesProofPresent: boolean;
    generatedTypesProofPresent: boolean;
    migrationProofPresent: boolean;
    rlsSecurityProofPresent: boolean;
    devPreviewDiagnosticsAreProof: false;
  };

export type ExecutionRecordAuditAppendWriterDryRunValidationInput = {
  contractVersion: ExecutionRecordAuditAppendWriterDryRunValidatorContractVersion;
  requestedAt: string;
  requestedBy?: string | null;
  dryRunResultInput?: ExecutionRecordAuditAppendWriterDryRunInput | null;
  dryRunResult?: ExecutionRecordAuditAppendWriterDryRunResult | null;
  writerContractValidationResult?: ExecutionRecordAuditAppendWriterContractValidationResult | null;
  writerValidatorResult?: ExecutionRecordAuditAppendWriterValidationResult | null;
  auditWriterContractInput?: ExecutionRecordAuditAppendWriterInput | null;
  auditEventCandidate?: Record<string, unknown> | null;
  executionRecordReference?: PersistedExecutionRecordReference | null;
  evidenceProvenance?: Record<string, unknown> | null;
  idempotencyMetadata?: Record<string, unknown> | null;
  duplicatePreventionMetadata?: Record<string, unknown> | null;
  serverOnlySecurityProofStatus?: string | null;
  schemaTableProofStatus?: string | null;
  generatedAuditTypesProofStatus?: string | null;
  migrationProofStatus?: string | null;
  rlsSecurityProofStatus?: string | null;
  serviceRoleExposureRiskStatus?: string | null;
  clientSideWriteRiskStatus?: string | null;
  manualReviewMetadata?: FinalizationActionValidatorManualApprovalContext | null;
  downstreamAuthorityMetadata?: Record<string, unknown> | null;
  inputValidation: ExecutionRecordAuditAppendWriterDryRunInputValidationSummary;
  resultValidation: ExecutionRecordAuditAppendWriterDryRunResultValidationSummary;
  wouldWriteAuditEventValidation: ExecutionRecordAuditAppendWriterDryRunWouldWriteAuditEventValidationSummary;
  tableSchemaSimulationValidation: ExecutionRecordAuditAppendWriterDryRunTableSchemaSimulationValidationSummary;
  idempotencyDuplicatePreventionValidation: ExecutionRecordAuditAppendWriterDryRunIdempotencyDuplicatePreventionValidationSummary;
  evidenceProvenanceValidation: ExecutionRecordAuditAppendWriterDryRunEvidenceProvenanceValidationSummary;
  serverOnlySecurityDependencyValidation: ExecutionRecordAuditAppendWriterDryRunServerOnlySecurityDependencyValidationSummary;
  noWriteNoActionSafetyValidation: ExecutionRecordAuditAppendWriterDryRunNoWriteNoActionSafetyValidationSummary;
  dependencyValidation: ExecutionRecordAuditAppendWriterDryRunDependencyValidationSummary;
  authority: ExecutionRecordAuditAppendWriterDryRunValidationAuthorityFlags;
  safetyPolicy: ExecutionRecordAuditAppendWriterDryRunValidationSafetyPolicy;
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterDryRunValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterDryRunValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterDryRunValidationResult = {
  contractVersion: ExecutionRecordAuditAppendWriterDryRunValidatorContractVersion;
  status: ExecutionRecordAuditAppendWriterDryRunValidationStatus;
  decisionRecommendation: ExecutionRecordAuditAppendWriterDryRunValidationDecisionRecommendation;
  validationOnly: true;
  designOnly: true;
  dryRunValidationOnly: true;
  hypotheticalOnly: true;
  nonPersistent: true;
  dryRunValidatorImplemented: false;
  dryRunExecuted: false;
  dryRunExecutionAllowed: false;
  auditWriteExecuted: false;
  auditWriteAllowed: false;
  safeToWriteAudit: false;
  validationIsDryRunExecution: false;
  validationIsAuditWriteApproval: false;
  validationIsAuditAppendExecution: false;
  validationIsRouteCallApproval: false;
  validationIsRecordCreationApproval: false;
  validationIsPersistenceWriteApproval: false;
  validationIsSupabaseLocalStorageWriteApproval: false;
  validationIsSecurityProof: false;
  validationIsServerOnlyProof: false;
  validationIsSchemaProof: false;
  validationIsGeneratedTypesProof: false;
  validationIsMigrationProof: false;
  validationIsRlsSecurityProof: false;
  validationIsDownstreamApproval: false;
  dryRunResultSuccessIsWriteApproval: false;
  contractValidatorReadinessIsWriteApproval: false;
  writerValidatorReadinessIsWriteApproval: false;
  insertSuccessIsAuditWriteApproval: false;
  devPreviewDiagnosticsAreWriteApproval: false;
  inputValidation: ExecutionRecordAuditAppendWriterDryRunInputValidationSummary;
  resultValidation: ExecutionRecordAuditAppendWriterDryRunResultValidationSummary;
  wouldWriteAuditEventValidation: ExecutionRecordAuditAppendWriterDryRunWouldWriteAuditEventValidationSummary;
  tableSchemaSimulationValidation: ExecutionRecordAuditAppendWriterDryRunTableSchemaSimulationValidationSummary;
  idempotencyDuplicatePreventionValidation: ExecutionRecordAuditAppendWriterDryRunIdempotencyDuplicatePreventionValidationSummary;
  evidenceProvenanceValidation: ExecutionRecordAuditAppendWriterDryRunEvidenceProvenanceValidationSummary;
  serverOnlySecurityDependencyValidation: ExecutionRecordAuditAppendWriterDryRunServerOnlySecurityDependencyValidationSummary;
  noWriteNoActionSafetyValidation: ExecutionRecordAuditAppendWriterDryRunNoWriteNoActionSafetyValidationSummary;
  dependencyValidation: ExecutionRecordAuditAppendWriterDryRunDependencyValidationSummary;
  authority: ExecutionRecordAuditAppendWriterDryRunValidationAuthorityFlags;
  safetyPolicy: ExecutionRecordAuditAppendWriterDryRunValidationSafetyPolicy;
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterDryRunValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterDryRunValidationReviewItem[];
  recommendedNextManualReview?: string | null;
  metadata?: Record<string, unknown>;
};
