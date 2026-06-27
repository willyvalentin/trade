import type {
  ExecutionRecordAuditAppendWriterContractValidationResult,
} from "@/lib/execution-record-audit-append-writer-contract-validator-contract";
import type {
  ExecutionRecordAuditAppendWriterDryRunInput,
} from "@/lib/execution-record-audit-append-writer-dry-run-result-contract";
import type {
  ExecutionRecordAuditAppendWriterDryRunValidationResult,
} from "@/lib/execution-record-audit-append-writer-dry-run-validator-contract";
import type {
  ExecutionRecordAuditAppendWriterDryRunExecutionInput,
  ExecutionRecordAuditAppendWriterDryRunExecutionResult,
} from "@/lib/execution-record-audit-append-writer-dry-run-execution-contract";
import type {
  ExecutionRecordAuditAppendWriterInput,
} from "@/lib/execution-record-audit-append-writer-contract";
import type {
  ExecutionRecordAuditAppendWriterValidationResult,
} from "@/lib/execution-record-audit-append-writer-validator-contract";
import type {
  ExecutionRecordDuplicateMatch,
  PersistedExecutionRecordReference,
} from "@/lib/execution-record-persistence-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Audit append writer dry-run execution validator contract metadata only. These
// types and constants do not implement dry-run execution validation logic,
// dry-run execution, dry-run validator changes, audit writer behavior, audit
// append execution, route calls, execution-record creation, persistence/write
// behavior, Supabase/localStorage writes, audit writes, stats/PnL update,
// rollback/correction, trade mutation/reconciliation, UI update, notification
// execution, broker/order behavior, Avanza/browser behavior, or automatic mode.
// Dry-run execution validation is not dry-run execution, audit write approval,
// security proof, server-only proof, schema proof, generated-types proof,
// migration proof, RLS/security proof, or downstream action approval.

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATOR_CONTRACT_VERSION =
  "execution_record_audit_append_writer_dry_run_execution_validator_v1" as const;

export type ExecutionRecordAuditAppendWriterDryRunExecutionValidatorContractVersion =
  typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATOR_CONTRACT_VERSION;

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_STATUSES =
  [
    "audit_append_writer_dry_run_execution_validation_ready_for_design_only",
    "audit_append_writer_dry_run_execution_validation_blocked",
    "audit_append_writer_dry_run_execution_validation_needs_review",
    "audit_append_writer_dry_run_execution_validation_invalid",
    "audit_append_writer_dry_run_execution_validation_absent",
  ] as const;

export type ExecutionRecordAuditAppendWriterDryRunExecutionValidationStatus =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_STATUSES)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_DECISION_RECOMMENDATIONS =
  [
    "design_only_do_not_write_audit",
    "blocked_do_not_write_audit",
    "needs_manual_review",
    "invalid_do_not_write_audit",
    "future_audit_writer_dry_run_execution_validator_required",
  ] as const;

export type ExecutionRecordAuditAppendWriterDryRunExecutionValidationDecisionRecommendation =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_BLOCKED_REASONS =
  [
    "dry_run_execution_validation_input_missing",
    "dry_run_execution_input_missing",
    "dry_run_execution_result_missing",
    "dry_run_validator_result_missing",
    "dry_run_result_input_missing",
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
    "explicit_dry_run_only_flag_missing",
    "service_role_exposure_risk",
    "client_side_write_risk",
    "dry_run_execution_success_misinterpreted_as_write_approval",
    "dry_run_execution_success_misinterpreted_as_security_proof",
    "dry_run_execution_success_misinterpreted_as_schema_proof",
    "dry_run_execution_success_misinterpreted_as_downstream_approval",
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

export type ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_WARNINGS =
  [
    "contract_only",
    "dry_run_execution_validator_not_implemented",
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
    "manual_review_may_be_required",
    "automatic_mode_not_enabled",
  ] as const;

export type ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_WARNINGS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_REVIEW_ITEMS =
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
  ] as const;

export type ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_REVIEW_ITEMS)[number];

export type ExecutionRecordAuditAppendWriterDryRunExecutionValidationAuthorityFlags =
  {
    validationOnly: true;
    designOnly: true;
    dryRunExecutionValidationOnly: true;
    dryRunExecutionValidatorImplemented: false;
    dryRunExecutionAllowed: false;
    dryRunExecutedAgainstRealData: false;
    dryRunExecutionImplemented: false;
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

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_DEFAULT_AUTHORITY_FLAGS =
  {
    validationOnly: true,
    designOnly: true,
    dryRunExecutionValidationOnly: true,
    dryRunExecutionValidatorImplemented: false,
    dryRunExecutionAllowed: false,
    dryRunExecutedAgainstRealData: false,
    dryRunExecutionImplemented: false,
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
  } as const satisfies ExecutionRecordAuditAppendWriterDryRunExecutionValidationAuthorityFlags;

export type ExecutionRecordAuditAppendWriterDryRunExecutionValidationSafetyPolicy =
  ExecutionRecordAuditAppendWriterDryRunExecutionValidationAuthorityFlags & {
    hypotheticalOnly: true;
    nonPersistent: true;
    validationIsDesignReadinessOnly: true;
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
    dryRunExecutionSuccessIsWriteApproval: false;
    dryRunValidatorReadinessIsExecution: false;
    dryRunValidatorReadinessIsWriteApproval: false;
    contractValidatorReadinessIsWriteApproval: false;
    writerValidatorReadinessIsWriteApproval: false;
    insertSuccessIsAuditWriteApproval: false;
    devPreviewDiagnosticsAreWriteApproval: false;
    allAuthorityFlagsMustRemainFalse: true;
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
    summary: string;
  };

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_DEFAULT_SAFETY_POLICY =
  {
    ...EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
    hypotheticalOnly: true,
    nonPersistent: true,
    validationIsDesignReadinessOnly: true,
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
    allAuthorityFlagsMustRemainFalse: true,
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
      "Audit append writer dry-run execution validation is design/readiness-only. Validation success is not dry-run execution, audit write approval, security proof, server-only proof, schema proof, generated-types proof, migration proof, RLS/security proof, route call approval, persistence/write approval, or downstream action approval.",
  } as const satisfies ExecutionRecordAuditAppendWriterDryRunExecutionValidationSafetyPolicy;

type ExecutionRecordAuditAppendWriterDryRunExecutionValidationDiagnosticSummary =
  {
    statusKnown: boolean;
    readyForDesignOnly: boolean;
    blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[];
    warnings: ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[];
    reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordAuditAppendWriterDryRunExecutionInputValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionValidationDiagnosticSummary & {
    dryRunExecutionValidationInputPresent: boolean;
    dryRunExecutionInputPresent: boolean;
    dryRunValidatorResultPresent: boolean;
    dryRunResultInputPresent: boolean;
    writerContractValidationResultPresent: boolean;
    writerValidatorResultPresent: boolean;
    writerContractInputPresent: boolean;
    auditEventCandidatePresent: boolean;
    executionRecordReferencePresent: boolean;
    evidenceProvenancePresent: boolean;
    idempotencyMetadataPresent: boolean;
    duplicatePreventionMetadataPresent: boolean;
    explicitDryRunOnlyFlagPresent: boolean;
    downstreamAuthorityMetadataPresent: boolean;
    unsafeCallablePresent: false;
  };

export type ExecutionRecordAuditAppendWriterDryRunExecutionResultValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionValidationDiagnosticSummary & {
    dryRunExecutionResultPresent: boolean;
    dryRunExecutionResultStatus?: string | null;
    dryRunExecutionResultReadyForDesignOnly: boolean;
    dryRunExecutionResultClaimsWriteApproval: false;
    dryRunExecutionResultClaimsSecurityProof: false;
    dryRunExecutionResultClaimsSchemaProof: false;
    dryRunExecutionResultClaimsDownstreamApproval: false;
    dryRunExecutionResultClaimsAuditWriteExecuted: false;
    dryRunExecutionResultAuthorityFlagsAllFalse: boolean;
  };

export type ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedAuditEventValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionValidationDiagnosticSummary & {
    auditEventCandidatePresent: boolean;
    simulatedAuditEventPayloadPresent: boolean;
    wouldAttemptAuditWrite: boolean;
    auditWriteExecuted: false;
    auditWriteAllowed: false;
    safeToWriteAudit: false;
    executionRecordReferencePresent: boolean;
    hypotheticalOnly: true;
  };

export type ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedTableSchemaValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionValidationDiagnosticSummary & {
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

export type ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedIdempotencyDuplicatePreventionValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionValidationDiagnosticSummary & {
    idempotencyKeyPresent: boolean;
    idempotencyMetadataComplete: boolean;
    duplicatePreventionKeyPresent: boolean;
    duplicatePreventionMetadataComplete: boolean;
    retrySafetyRepresented: boolean;
    unknownWriteStatusRepresented: boolean;
    duplicateMatches: ExecutionRecordDuplicateMatch[];
    simulatedDuplicateWriteWouldBeBlocked: boolean;
    duplicateWriteExecuted: false;
    safeToWriteDuplicateAuditEvent: false;
  };

export type ExecutionRecordAuditAppendWriterDryRunExecutionEvidenceProvenanceValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionValidationDiagnosticSummary & {
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

export type ExecutionRecordAuditAppendWriterDryRunExecutionServerOnlySecurityDependencyValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionValidationDiagnosticSummary & {
    serverOnlySecurityStatusKnown: boolean;
    serverOnlyProofPresent: boolean;
    serviceRoleProofPresent: boolean;
    serviceRoleExposureRisk: boolean;
    clientSideWriteRisk: boolean;
    routeAuthBoundaryProofPresent: boolean;
    serviceRoleSecretValuesForbidden: true;
    clientSideWriteForbidden: true;
  };

export type ExecutionRecordAuditAppendWriterDryRunExecutionNoWriteNoActionSafetyValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionValidationDiagnosticSummary & {
    validationOnly: true;
    designOnly: true;
    dryRunExecutionValidationOnly: true;
    hypotheticalOnly: true;
    nonPersistent: true;
    dryRunExecuted: false;
    dryRunExecutedAgainstRealData: false;
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

export type ExecutionRecordAuditAppendWriterDryRunExecutionDependencyValidationSummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionValidationDiagnosticSummary & {
    dryRunExecutionValidatorImplemented: false;
    dryRunExecutionImplemented: false;
    dryRunImplemented: false;
    writerImplemented: false;
    auditAppendImplemented: false;
    auditRouteImplemented: false;
    auditWritePathPresent: false;
    productionInsertRouteImplemented: boolean;
    productionInsertWritePathPresent: boolean;
    dryRunExecutionContractPresent: boolean;
    dryRunValidatorResultPresent: boolean;
    dryRunResultInputPresent: boolean;
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

export type ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput = {
  contractVersion: ExecutionRecordAuditAppendWriterDryRunExecutionValidatorContractVersion;
  requestedAt: string;
  requestedBy?: string | null;
  dryRunExecutionInput?: ExecutionRecordAuditAppendWriterDryRunExecutionInput | null;
  dryRunExecutionResult?: ExecutionRecordAuditAppendWriterDryRunExecutionResult | null;
  dryRunValidatorResult?: ExecutionRecordAuditAppendWriterDryRunValidationResult | null;
  dryRunResultInput?: ExecutionRecordAuditAppendWriterDryRunInput | null;
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
  explicitDryRunOnlyFlag: boolean;
  manualReviewMetadata?: FinalizationActionValidatorManualApprovalContext | null;
  downstreamAuthorityMetadata?: Record<string, unknown> | null;
  inputValidation: ExecutionRecordAuditAppendWriterDryRunExecutionInputValidationSummary;
  resultValidation: ExecutionRecordAuditAppendWriterDryRunExecutionResultValidationSummary;
  simulatedAuditEventValidation: ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedAuditEventValidationSummary;
  simulatedTableSchemaValidation: ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedTableSchemaValidationSummary;
  simulatedIdempotencyDuplicatePreventionValidation: ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedIdempotencyDuplicatePreventionValidationSummary;
  evidenceProvenanceValidation: ExecutionRecordAuditAppendWriterDryRunExecutionEvidenceProvenanceValidationSummary;
  serverOnlySecurityDependencyValidation: ExecutionRecordAuditAppendWriterDryRunExecutionServerOnlySecurityDependencyValidationSummary;
  noWriteNoActionSafetyValidation: ExecutionRecordAuditAppendWriterDryRunExecutionNoWriteNoActionSafetyValidationSummary;
  dependencyValidation: ExecutionRecordAuditAppendWriterDryRunExecutionDependencyValidationSummary;
  authority: ExecutionRecordAuditAppendWriterDryRunExecutionValidationAuthorityFlags;
  safetyPolicy: ExecutionRecordAuditAppendWriterDryRunExecutionValidationSafetyPolicy;
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterDryRunExecutionValidationResult = {
  contractVersion: ExecutionRecordAuditAppendWriterDryRunExecutionValidatorContractVersion;
  status: ExecutionRecordAuditAppendWriterDryRunExecutionValidationStatus;
  decisionRecommendation: ExecutionRecordAuditAppendWriterDryRunExecutionValidationDecisionRecommendation;
  validationOnly: true;
  designOnly: true;
  dryRunExecutionValidationOnly: true;
  hypotheticalOnly: true;
  nonPersistent: true;
  dryRunExecutionValidatorImplemented: false;
  dryRunExecutionAllowed: false;
  dryRunExecutedAgainstRealData: false;
  dryRunExecutionImplemented: false;
  dryRunExecuted: false;
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
  dryRunExecutionSuccessIsWriteApproval: false;
  dryRunValidatorReadinessIsExecution: false;
  dryRunValidatorReadinessIsWriteApproval: false;
  contractValidatorReadinessIsWriteApproval: false;
  writerValidatorReadinessIsWriteApproval: false;
  insertSuccessIsAuditWriteApproval: false;
  devPreviewDiagnosticsAreWriteApproval: false;
  inputValidation: ExecutionRecordAuditAppendWriterDryRunExecutionInputValidationSummary;
  resultValidation: ExecutionRecordAuditAppendWriterDryRunExecutionResultValidationSummary;
  simulatedAuditEventValidation: ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedAuditEventValidationSummary;
  simulatedTableSchemaValidation: ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedTableSchemaValidationSummary;
  simulatedIdempotencyDuplicatePreventionValidation: ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedIdempotencyDuplicatePreventionValidationSummary;
  evidenceProvenanceValidation: ExecutionRecordAuditAppendWriterDryRunExecutionEvidenceProvenanceValidationSummary;
  serverOnlySecurityDependencyValidation: ExecutionRecordAuditAppendWriterDryRunExecutionServerOnlySecurityDependencyValidationSummary;
  noWriteNoActionSafetyValidation: ExecutionRecordAuditAppendWriterDryRunExecutionNoWriteNoActionSafetyValidationSummary;
  dependencyValidation: ExecutionRecordAuditAppendWriterDryRunExecutionDependencyValidationSummary;
  authority: ExecutionRecordAuditAppendWriterDryRunExecutionValidationAuthorityFlags;
  safetyPolicy: ExecutionRecordAuditAppendWriterDryRunExecutionValidationSafetyPolicy;
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionValidationReviewItem[];
  recommendedNextManualReview?: string | null;
  metadata?: Record<string, unknown>;
};
