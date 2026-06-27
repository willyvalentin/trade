import type {
  ExecutionRecordAuditAppendWriterInput,
  ExecutionRecordAuditAppendWriterResult,
} from "@/lib/execution-record-audit-append-writer-contract";
import type {
  ExecutionRecordAuditAppendWriterContractValidationResult,
} from "@/lib/execution-record-audit-append-writer-contract-validator-contract";
import type {
  ExecutionRecordAuditAppendWriterValidationResult,
} from "@/lib/execution-record-audit-append-writer-validator-contract";
import type {
  ExecutionRecordDuplicateMatch,
  PersistedExecutionRecordReference,
} from "@/lib/execution-record-persistence-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Audit append writer dry-run result contract metadata only. These types and
// constants do not implement dry-run logic, audit writer behavior, audit append
// execution, route calls, execution-record creation, persistence/write
// behavior, Supabase/localStorage writes, stats/PnL update, rollback/correction,
// trade mutation/reconciliation, UI update, notification execution,
// broker/order behavior, Avanza/browser behavior, or automatic mode. Dry-run
// result success is not audit write approval, security proof, server-only proof,
// schema proof, generated-types proof, migration proof, RLS/security proof, or
// downstream action approval.

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_RESULT_CONTRACT_VERSION =
  "execution_record_audit_append_writer_dry_run_result_v1" as const;

export type ExecutionRecordAuditAppendWriterDryRunResultContractVersion =
  typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_RESULT_CONTRACT_VERSION;

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_STATUSES = [
  "audit_append_writer_dry_run_ready_for_design_only",
  "audit_append_writer_dry_run_blocked",
  "audit_append_writer_dry_run_needs_review",
  "audit_append_writer_dry_run_invalid",
  "audit_append_writer_dry_run_absent",
] as const;

export type ExecutionRecordAuditAppendWriterDryRunStatus =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_STATUSES)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_DECISION_RECOMMENDATIONS =
  [
    "design_only_do_not_write_audit",
    "blocked_do_not_write_audit",
    "needs_manual_review",
    "invalid_do_not_write_audit",
    "future_audit_writer_dry_run_required",
  ] as const;

export type ExecutionRecordAuditAppendWriterDryRunDecisionRecommendation =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_BLOCKED_REASONS = [
  "dry_run_input_missing",
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
  "dry_run_misinterpreted_as_write_approval",
  "dry_run_misinterpreted_as_security_proof",
  "dry_run_misinterpreted_as_schema_proof",
  "dry_run_misinterpreted_as_downstream_approval",
  "audit_write_requested",
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

export type ExecutionRecordAuditAppendWriterDryRunBlockedReason =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_WARNINGS = [
  "contract_only",
  "dry_run_not_implemented",
  "audit_writer_not_implemented",
  "audit_route_not_implemented",
  "audit_write_not_executed",
  "dry_run_result_not_audit_write_approval",
  "dry_run_result_not_security_proof",
  "dry_run_result_not_server_only_proof",
  "dry_run_result_not_schema_proof",
  "dry_run_result_not_generated_types_proof",
  "dry_run_result_not_migration_proof",
  "dry_run_result_not_rls_security_proof",
  "dry_run_result_not_downstream_approval",
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

export type ExecutionRecordAuditAppendWriterDryRunWarning =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_WARNINGS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_REVIEW_ITEMS = [
  "audit_append_writer_dry_run_contract_review",
  "dry_run_input_review",
  "contract_validator_result_review",
  "writer_validator_result_review",
  "writer_contract_input_review",
  "audit_event_candidate_review",
  "execution_record_reference_review",
  "evidence_provenance_review",
  "idempotency_review",
  "duplicate_prevention_review",
  "server_only_security_dependency_review",
  "schema_table_dependency_review",
  "generated_audit_types_dependency_review",
  "migration_dependency_review",
  "rls_security_dependency_review",
  "service_role_exposure_review",
  "client_side_write_risk_review",
  "manual_review",
  "failure_retry_review",
  "downstream_authority_review",
  "broker_avanza_safety_review",
] as const;

export type ExecutionRecordAuditAppendWriterDryRunReviewItem =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_REVIEW_ITEMS)[number];

export type ExecutionRecordAuditAppendWriterDryRunAuthorityFlags = {
  validationOnly: true;
  designOnly: true;
  dryRunOnly: true;
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

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_DEFAULT_AUTHORITY_FLAGS =
  {
    validationOnly: true,
    designOnly: true,
    dryRunOnly: true,
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
  } as const satisfies ExecutionRecordAuditAppendWriterDryRunAuthorityFlags;

export type ExecutionRecordAuditAppendWriterDryRunSafetyPolicy =
  ExecutionRecordAuditAppendWriterDryRunAuthorityFlags & {
    hypotheticalOnly: true;
    nonPersistent: true;
    dryRunResultIsAuditWriteApproval: false;
    dryRunResultIsAuditAppendExecution: false;
    dryRunResultIsRouteCallApproval: false;
    dryRunResultIsRecordCreationApproval: false;
    dryRunResultIsPersistenceWriteApproval: false;
    dryRunResultIsSupabaseLocalStorageWriteApproval: false;
    dryRunResultIsSecurityProof: false;
    dryRunResultIsServerOnlyProof: false;
    dryRunResultIsSchemaProof: false;
    dryRunResultIsGeneratedTypesProof: false;
    dryRunResultIsMigrationProof: false;
    dryRunResultIsRlsSecurityProof: false;
    dryRunResultIsDownstreamApproval: false;
    contractValidatorReadinessIsWriteApproval: false;
    writerValidatorReadinessIsWriteApproval: false;
    insertSuccessIsAuditWriteApproval: false;
    devPreviewDiagnosticsAreWriteApproval: false;
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
      "Audit append writer dry-run result is type-only/readiness-only. Dry-run success is not audit write approval, security proof, server-only proof, schema proof, generated-types proof, migration proof, RLS/security proof, route call approval, persistence/write approval, or downstream action approval.";
  };

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_DEFAULT_SAFETY_POLICY =
  {
    ...EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_DEFAULT_AUTHORITY_FLAGS,
    hypotheticalOnly: true,
    nonPersistent: true,
    dryRunResultIsAuditWriteApproval: false,
    dryRunResultIsAuditAppendExecution: false,
    dryRunResultIsRouteCallApproval: false,
    dryRunResultIsRecordCreationApproval: false,
    dryRunResultIsPersistenceWriteApproval: false,
    dryRunResultIsSupabaseLocalStorageWriteApproval: false,
    dryRunResultIsSecurityProof: false,
    dryRunResultIsServerOnlyProof: false,
    dryRunResultIsSchemaProof: false,
    dryRunResultIsGeneratedTypesProof: false,
    dryRunResultIsMigrationProof: false,
    dryRunResultIsRlsSecurityProof: false,
    dryRunResultIsDownstreamApproval: false,
    contractValidatorReadinessIsWriteApproval: false,
    writerValidatorReadinessIsWriteApproval: false,
    insertSuccessIsAuditWriteApproval: false,
    devPreviewDiagnosticsAreWriteApproval: false,
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
      "Audit append writer dry-run result is type-only/readiness-only. Dry-run success is not audit write approval, security proof, server-only proof, schema proof, generated-types proof, migration proof, RLS/security proof, route call approval, persistence/write approval, or downstream action approval.",
  } as const satisfies ExecutionRecordAuditAppendWriterDryRunSafetyPolicy;

export type ExecutionRecordAuditAppendWriterDryRunWouldWriteAuditEventSummary =
  {
    hypotheticalOnly: true;
    wouldAttemptAuditWrite: boolean;
    auditWriteExecuted: false;
    auditEventCandidatePresent: boolean;
    auditEventType?: string | null;
    auditEventSource?: string | null;
    auditPayloadShape?: Record<string, unknown> | null;
    executionRecordReference?: PersistedExecutionRecordReference | null;
    executionRecordReferencePresent: boolean;
    blockedReasons: ExecutionRecordAuditAppendWriterDryRunBlockedReason[];
    warnings: ExecutionRecordAuditAppendWriterDryRunWarning[];
    reviewItems: ExecutionRecordAuditAppendWriterDryRunReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordAuditAppendWriterDryRunWouldUseTableSchemaSummary = {
  auditSchemaTableStatus?: string | null;
  auditSchemaTableStatusKnown: boolean;
  auditSchemaTableProofPresent: boolean;
  generatedAuditTypesStatus?: string | null;
  generatedAuditTypesStatusKnown: boolean;
  generatedAuditTypesProofPresent: boolean;
  generatedExecutionRecordTypesPresent: boolean;
  generatedExecutionRecordTypesAssumedEnough: false;
  migrationStatus?: string | null;
  migrationStatusKnown: boolean;
  migrationProofPresent: boolean;
  rlsSecurityStatus?: string | null;
  rlsSecurityStatusKnown: boolean;
  rlsSecurityProofPresent: boolean;
  schemaTableAssumedWithoutProof: false;
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterDryRunWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterDryRunReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterDryRunWouldUseIdempotencySummary = {
  idempotencyKey?: string | null;
  idempotencyKeyPresent: boolean;
  idempotencyMetadataComplete: boolean;
  retrySafetyRepresented: boolean;
  unknownWriteStatusRepresented: boolean;
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterDryRunWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterDryRunReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterDryRunDuplicatePreventionSimulationSummary =
  {
    duplicatePreventionKey?: string | null;
    duplicatePreventionKeyPresent: boolean;
    duplicatePreventionMetadataComplete: boolean;
    duplicateMatches: ExecutionRecordDuplicateMatch[];
    duplicateWriteWouldBeBlocked: boolean;
    duplicateWriteExecuted: false;
    safeToWriteDuplicateAuditEvent: false;
    blockedReasons: ExecutionRecordAuditAppendWriterDryRunBlockedReason[];
    warnings: ExecutionRecordAuditAppendWriterDryRunWarning[];
    reviewItems: ExecutionRecordAuditAppendWriterDryRunReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordAuditAppendWriterDryRunEvidenceProvenanceSummary = {
  executionRecordReference?: PersistedExecutionRecordReference | null;
  executionRecordReferencePresent: boolean;
  evidenceProvenancePresent: boolean;
  actorSourceMetadataPresent: boolean;
  timestampSourceClockPresent: boolean;
  auditEventCandidatePresent: boolean;
  sourceReferences: string[];
  noLocalOnlySourceOfTruth: boolean;
  provenanceTraceComplete: boolean;
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterDryRunWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterDryRunReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterDryRunServerOnlySecurityDependencySummary =
  {
    serverOnlySecurityStatus?: string | null;
    serverOnlySecurityStatusKnown: boolean;
    serverOnlyProofPresent: boolean;
    serviceRoleProofPresent: boolean;
    serviceRoleExposureRisk: boolean;
    clientSideWriteRisk: boolean;
    routeAuthBoundaryProofPresent: boolean;
    serviceRoleSecretValuesForbidden: true;
    clientSideWriteForbidden: true;
    blockedReasons: ExecutionRecordAuditAppendWriterDryRunBlockedReason[];
    warnings: ExecutionRecordAuditAppendWriterDryRunWarning[];
    reviewItems: ExecutionRecordAuditAppendWriterDryRunReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordAuditAppendWriterDryRunNoWriteNoActionSafetySummary =
  {
    validationOnly: true;
    designOnly: true;
    dryRunOnly: true;
    hypotheticalOnly: true;
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
    blockedReasons: ExecutionRecordAuditAppendWriterDryRunBlockedReason[];
    warnings: ExecutionRecordAuditAppendWriterDryRunWarning[];
    reviewItems: ExecutionRecordAuditAppendWriterDryRunReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordAuditAppendWriterDryRunDependencySummary = {
  contractValidatorResultPresent: boolean;
  writerValidatorResultPresent: boolean;
  writerContractInputPresent: boolean;
  dryRunImplemented: false;
  writerImplemented: false;
  auditAppendImplemented: false;
  auditRouteImplemented: false;
  auditWritePathPresent: false;
  productionInsertRouteImplemented: boolean;
  productionInsertWritePathPresent: boolean;
  serverOnlyProofPresent: boolean;
  serviceRoleProofPresent: boolean;
  auditSchemaTableProofPresent: boolean;
  generatedAuditTypesProofPresent: boolean;
  generatedTypesProofPresent: boolean;
  migrationProofPresent: boolean;
  rlsSecurityProofPresent: boolean;
  devPreviewDiagnosticsAreProof: false;
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterDryRunWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterDryRunReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterDryRunInput = {
  contractVersion: ExecutionRecordAuditAppendWriterDryRunResultContractVersion;
  requestedAt: string;
  requestedBy?: string | null;
  writerContractValidationResult?: ExecutionRecordAuditAppendWriterContractValidationResult | null;
  writerValidatorResult?: ExecutionRecordAuditAppendWriterValidationResult | null;
  auditWriterContractInput?: ExecutionRecordAuditAppendWriterInput | null;
  auditEventCandidate?: Record<string, unknown> | null;
  executionRecordReference?: PersistedExecutionRecordReference | null;
  evidenceProvenance?: Record<string, unknown> | null;
  idempotencyKey?: string | null;
  duplicatePreventionKey?: string | null;
  serverOnlySecurityProofStatus?: string | null;
  schemaTableProofStatus?: string | null;
  generatedAuditTypesProofStatus?: string | null;
  migrationProofStatus?: string | null;
  rlsSecurityProofStatus?: string | null;
  serviceRoleExposureRiskStatus?: string | null;
  clientSideWriteRiskStatus?: string | null;
  manualReviewMetadata?: FinalizationActionValidatorManualApprovalContext | null;
  failureRetryMetadata?: Record<string, unknown> | null;
  downstreamAuthorityRequestMetadata?: Record<string, unknown> | null;
  wouldWriteAuditEvent: ExecutionRecordAuditAppendWriterDryRunWouldWriteAuditEventSummary;
  wouldUseTableSchema: ExecutionRecordAuditAppendWriterDryRunWouldUseTableSchemaSummary;
  wouldUseIdempotency: ExecutionRecordAuditAppendWriterDryRunWouldUseIdempotencySummary;
  duplicatePreventionSimulation: ExecutionRecordAuditAppendWriterDryRunDuplicatePreventionSimulationSummary;
  evidenceProvenanceSummary: ExecutionRecordAuditAppendWriterDryRunEvidenceProvenanceSummary;
  serverOnlySecurity: ExecutionRecordAuditAppendWriterDryRunServerOnlySecurityDependencySummary;
  noWriteNoAction: ExecutionRecordAuditAppendWriterDryRunNoWriteNoActionSafetySummary;
  dependencies: ExecutionRecordAuditAppendWriterDryRunDependencySummary;
  authority: ExecutionRecordAuditAppendWriterDryRunAuthorityFlags;
  safetyPolicy: ExecutionRecordAuditAppendWriterDryRunSafetyPolicy;
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterDryRunWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterDryRunReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterDryRunResult = {
  contractVersion: ExecutionRecordAuditAppendWriterDryRunResultContractVersion;
  status: ExecutionRecordAuditAppendWriterDryRunStatus;
  decisionRecommendation: ExecutionRecordAuditAppendWriterDryRunDecisionRecommendation;
  validationOnly: true;
  designOnly: true;
  dryRunOnly: true;
  hypotheticalOnly: true;
  nonPersistent: true;
  dryRunImplemented: false;
  auditWriteExecuted: false;
  auditWriteAllowed: false;
  safeToWriteAudit: false;
  dryRunResultIsAuditWriteApproval: false;
  dryRunResultIsAuditAppendExecution: false;
  dryRunResultIsRouteCallApproval: false;
  dryRunResultIsRecordCreationApproval: false;
  dryRunResultIsPersistenceWriteApproval: false;
  dryRunResultIsSupabaseLocalStorageWriteApproval: false;
  dryRunResultIsSecurityProof: false;
  dryRunResultIsServerOnlyProof: false;
  dryRunResultIsSchemaProof: false;
  dryRunResultIsGeneratedTypesProof: false;
  dryRunResultIsMigrationProof: false;
  dryRunResultIsRlsSecurityProof: false;
  dryRunResultIsDownstreamApproval: false;
  contractValidatorReadinessIsWriteApproval: false;
  writerValidatorReadinessIsWriteApproval: false;
  insertSuccessIsAuditWriteApproval: false;
  devPreviewDiagnosticsAreWriteApproval: false;
  wouldWriteAuditEvent: ExecutionRecordAuditAppendWriterDryRunWouldWriteAuditEventSummary;
  wouldUseTableSchema: ExecutionRecordAuditAppendWriterDryRunWouldUseTableSchemaSummary;
  wouldUseIdempotency: ExecutionRecordAuditAppendWriterDryRunWouldUseIdempotencySummary;
  duplicatePreventionSimulation: ExecutionRecordAuditAppendWriterDryRunDuplicatePreventionSimulationSummary;
  evidenceProvenance: ExecutionRecordAuditAppendWriterDryRunEvidenceProvenanceSummary;
  serverOnlySecurity: ExecutionRecordAuditAppendWriterDryRunServerOnlySecurityDependencySummary;
  noWriteNoAction: ExecutionRecordAuditAppendWriterDryRunNoWriteNoActionSafetySummary;
  dependencies: ExecutionRecordAuditAppendWriterDryRunDependencySummary;
  authority: ExecutionRecordAuditAppendWriterDryRunAuthorityFlags;
  safetyPolicy: ExecutionRecordAuditAppendWriterDryRunSafetyPolicy;
  referenceWriterContractResult?: ExecutionRecordAuditAppendWriterResult | null;
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterDryRunWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterDryRunReviewItem[];
  recommendedNextManualReview?: string | null;
  metadata?: Record<string, unknown>;
};
