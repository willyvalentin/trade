import type {
  ExecutionRecordAuditAppendWriterContractValidationResult,
} from "@/lib/execution-record-audit-append-writer-contract-validator-contract";
import type {
  ExecutionRecordAuditAppendWriterDryRunInput,
  ExecutionRecordAuditAppendWriterDryRunResult,
} from "@/lib/execution-record-audit-append-writer-dry-run-result-contract";
import type {
  ExecutionRecordAuditAppendWriterDryRunValidationResult,
} from "@/lib/execution-record-audit-append-writer-dry-run-validator-contract";
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

// Audit append writer dry-run execution contract metadata only. These types and
// constants do not implement dry-run execution, dry-run validation changes,
// audit writer behavior, audit append execution, route calls,
// execution-record creation, persistence/write behavior, Supabase/localStorage
// writes, audit writes, stats/PnL update, rollback/correction, trade
// mutation/reconciliation, UI update, notification execution, broker/order
// behavior, Avanza/browser behavior, or automatic mode. Dry-run execution
// readiness is not audit write approval, security proof, server-only proof,
// schema proof, generated-types proof, migration proof, RLS/security proof, or
// downstream action approval.

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_CONTRACT_VERSION =
  "execution_record_audit_append_writer_dry_run_execution_v1" as const;

export type ExecutionRecordAuditAppendWriterDryRunExecutionContractVersion =
  typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_CONTRACT_VERSION;

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_STATUSES =
  [
    "audit_append_writer_dry_run_execution_ready_for_design_only",
    "audit_append_writer_dry_run_execution_blocked",
    "audit_append_writer_dry_run_execution_needs_review",
    "audit_append_writer_dry_run_execution_invalid",
    "audit_append_writer_dry_run_execution_absent",
  ] as const;

export type ExecutionRecordAuditAppendWriterDryRunExecutionStatus =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_STATUSES)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_DECISION_RECOMMENDATIONS =
  [
    "design_only_do_not_write_audit",
    "blocked_do_not_write_audit",
    "needs_manual_review",
    "invalid_do_not_write_audit",
    "future_audit_writer_dry_run_execution_required",
  ] as const;

export type ExecutionRecordAuditAppendWriterDryRunExecutionDecisionRecommendation =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_BLOCKED_REASONS =
  [
    "dry_run_execution_input_missing",
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

export type ExecutionRecordAuditAppendWriterDryRunExecutionBlockedReason =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_WARNINGS =
  [
    "contract_only",
    "dry_run_execution_not_implemented",
    "dry_run_execution_not_real_write",
    "audit_writer_not_implemented",
    "audit_route_not_implemented",
    "audit_write_not_executed",
    "dry_run_execution_not_audit_write_approval",
    "dry_run_execution_not_security_proof",
    "dry_run_execution_not_server_only_proof",
    "dry_run_execution_not_schema_proof",
    "dry_run_execution_not_generated_types_proof",
    "dry_run_execution_not_migration_proof",
    "dry_run_execution_not_rls_security_proof",
    "dry_run_execution_not_downstream_approval",
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

export type ExecutionRecordAuditAppendWriterDryRunExecutionWarning =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_WARNINGS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_REVIEW_ITEMS =
  [
    "audit_append_writer_dry_run_execution_contract_review",
    "dry_run_execution_input_review",
    "dry_run_validator_result_review",
    "dry_run_result_input_review",
    "contract_validator_result_review",
    "writer_validator_result_review",
    "writer_contract_input_review",
    "simulated_audit_event_payload_review",
    "simulated_table_schema_target_review",
    "simulated_idempotency_review",
    "simulated_duplicate_prevention_review",
    "evidence_provenance_review",
    "server_only_security_dependency_review",
    "no_write_no_action_safety_review",
    "dependency_summary_review",
    "authority_flags_review",
    "service_role_exposure_review",
    "client_side_write_risk_review",
    "manual_review",
    "failure_retry_review",
    "downstream_authority_review",
    "broker_avanza_safety_review",
  ] as const;

export type ExecutionRecordAuditAppendWriterDryRunExecutionReviewItem =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_REVIEW_ITEMS)[number];

export type ExecutionRecordAuditAppendWriterDryRunExecutionAuthorityFlags = {
  validationOnly: true;
  designOnly: true;
  dryRunExecutionOnly: true;
  dryRunExecutedAgainstRealData: false;
  dryRunExecutionImplemented: false;
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

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_DEFAULT_AUTHORITY_FLAGS =
  {
    validationOnly: true,
    designOnly: true,
    dryRunExecutionOnly: true,
    dryRunExecutedAgainstRealData: false,
    dryRunExecutionImplemented: false,
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
  } as const satisfies ExecutionRecordAuditAppendWriterDryRunExecutionAuthorityFlags;

export type ExecutionRecordAuditAppendWriterDryRunExecutionSafetyPolicy =
  ExecutionRecordAuditAppendWriterDryRunExecutionAuthorityFlags & {
    hypotheticalOnly: true;
    nonPersistent: true;
    executionContractIsDesignReadinessOnly: true;
    executionContractIsDryRunImplementation: false;
    dryRunExecutionResultIsAuditWriteApproval: false;
    dryRunExecutionResultIsAuditAppendExecution: false;
    dryRunExecutionResultIsRouteCallApproval: false;
    dryRunExecutionResultIsRecordCreationApproval: false;
    dryRunExecutionResultIsPersistenceWriteApproval: false;
    dryRunExecutionResultIsSupabaseLocalStorageWriteApproval: false;
    dryRunExecutionResultIsSecurityProof: false;
    dryRunExecutionResultIsServerOnlyProof: false;
    dryRunExecutionResultIsSchemaProof: false;
    dryRunExecutionResultIsGeneratedTypesProof: false;
    dryRunExecutionResultIsMigrationProof: false;
    dryRunExecutionResultIsRlsSecurityProof: false;
    dryRunExecutionResultIsDownstreamApproval: false;
    dryRunValidatorReadinessIsExecution: false;
    dryRunValidatorReadinessIsWriteApproval: false;
    contractValidatorReadinessIsWriteApproval: false;
    writerValidatorReadinessIsWriteApproval: false;
    insertSuccessIsAuditWriteApproval: false;
    devPreviewDiagnosticsAreWriteApproval: false;
    allAuthorityFlagsMustRemainFalse: true;
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
    policyReason: string;
  };

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_DEFAULT_SAFETY_POLICY =
  {
    ...EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_DEFAULT_AUTHORITY_FLAGS,
    hypotheticalOnly: true,
    nonPersistent: true,
    executionContractIsDesignReadinessOnly: true,
    executionContractIsDryRunImplementation: false,
    dryRunExecutionResultIsAuditWriteApproval: false,
    dryRunExecutionResultIsAuditAppendExecution: false,
    dryRunExecutionResultIsRouteCallApproval: false,
    dryRunExecutionResultIsRecordCreationApproval: false,
    dryRunExecutionResultIsPersistenceWriteApproval: false,
    dryRunExecutionResultIsSupabaseLocalStorageWriteApproval: false,
    dryRunExecutionResultIsSecurityProof: false,
    dryRunExecutionResultIsServerOnlyProof: false,
    dryRunExecutionResultIsSchemaProof: false,
    dryRunExecutionResultIsGeneratedTypesProof: false,
    dryRunExecutionResultIsMigrationProof: false,
    dryRunExecutionResultIsRlsSecurityProof: false,
    dryRunExecutionResultIsDownstreamApproval: false,
    dryRunValidatorReadinessIsExecution: false,
    dryRunValidatorReadinessIsWriteApproval: false,
    contractValidatorReadinessIsWriteApproval: false,
    writerValidatorReadinessIsWriteApproval: false,
    insertSuccessIsAuditWriteApproval: false,
    devPreviewDiagnosticsAreWriteApproval: false,
    allAuthorityFlagsMustRemainFalse: true,
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
    policyReason:
      "Audit append writer dry-run execution is a hypothetical, non-persistent contract. Dry-run execution success is not audit write approval, audit append execution, route call approval, record creation approval, persistence/write approval, Supabase/localStorage write approval, security proof, server-only proof, schema proof, generated-types proof, migration proof, RLS/security proof, or downstream action approval.",
  } as const satisfies ExecutionRecordAuditAppendWriterDryRunExecutionSafetyPolicy;

type ExecutionRecordAuditAppendWriterDryRunExecutionDiagnosticSummary = {
  statusKnown: boolean;
  readyForDesignOnly: boolean;
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedAuditEventPayloadSummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionDiagnosticSummary & {
    hypotheticalOnly: true;
    simulatedPayloadPresent: boolean;
    wouldAttemptAuditWrite: boolean;
    auditWriteExecuted: false;
    auditWriteAllowed: false;
    safeToWriteAudit: false;
    auditEventCandidatePresent: boolean;
    auditEventType?: string | null;
    auditEventSource?: string | null;
    auditPayloadShape?: Record<string, unknown> | null;
    executionRecordReference?: PersistedExecutionRecordReference | null;
    executionRecordReferencePresent: boolean;
  };

export type ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedTableSchemaTargetSummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionDiagnosticSummary & {
    targetTable?: string | null;
    targetSchema?: string | null;
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

export type ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedIdempotencySummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionDiagnosticSummary & {
    idempotencyKey?: string | null;
    idempotencyKeyPresent: boolean;
    idempotencyMetadataComplete: boolean;
    retrySafetyRepresented: boolean;
    unknownWriteStatusRepresented: boolean;
    simulatedWriteIdempotent: boolean;
  };

export type ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedDuplicatePreventionSummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionDiagnosticSummary & {
    duplicatePreventionKey?: string | null;
    duplicatePreventionKeyPresent: boolean;
    duplicatePreventionMetadataComplete: boolean;
    duplicateMatches: ExecutionRecordDuplicateMatch[];
    simulatedDuplicateWriteWouldBeBlocked: boolean;
    duplicateWriteExecuted: false;
    safeToWriteDuplicateAuditEvent: false;
  };

export type ExecutionRecordAuditAppendWriterDryRunExecutionEvidenceProvenanceSummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionDiagnosticSummary & {
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

export type ExecutionRecordAuditAppendWriterDryRunExecutionServerOnlySecurityDependencySummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionDiagnosticSummary & {
    serverOnlySecurityStatusKnown: boolean;
    serverOnlyProofPresent: boolean;
    serviceRoleProofPresent: boolean;
    serviceRoleExposureRisk: boolean;
    clientSideWriteRisk: boolean;
    routeAuthBoundaryProofPresent: boolean;
    serviceRoleSecretValuesForbidden: true;
    clientSideWriteForbidden: true;
  };

export type ExecutionRecordAuditAppendWriterDryRunExecutionNoWriteNoActionSafetySummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionDiagnosticSummary & {
    validationOnly: true;
    designOnly: true;
    dryRunExecutionOnly: true;
    hypotheticalOnly: true;
    nonPersistent: true;
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

export type ExecutionRecordAuditAppendWriterDryRunExecutionDependencySummary =
  ExecutionRecordAuditAppendWriterDryRunExecutionDiagnosticSummary & {
    dryRunValidatorResultPresent: boolean;
    dryRunResultInputPresent: boolean;
    contractValidatorResultPresent: boolean;
    writerValidatorResultPresent: boolean;
    writerContractInputPresent: boolean;
    dryRunExecutionImplemented: false;
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
  };

export type ExecutionRecordAuditAppendWriterDryRunExecutionInput = {
  contractVersion: ExecutionRecordAuditAppendWriterDryRunExecutionContractVersion;
  requestedAt: string;
  requestedBy?: string | null;
  dryRunValidatorResult?: ExecutionRecordAuditAppendWriterDryRunValidationResult | null;
  dryRunResultInput?: ExecutionRecordAuditAppendWriterDryRunInput | null;
  dryRunResult?: ExecutionRecordAuditAppendWriterDryRunResult | null;
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
  explicitDryRunOnlyExecutionFlag: boolean;
  downstreamAuthorityRequestMetadata?: Record<string, unknown> | null;
  simulatedAuditEventPayload: ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedAuditEventPayloadSummary;
  simulatedTableSchemaTarget: ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedTableSchemaTargetSummary;
  simulatedIdempotency: ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedIdempotencySummary;
  simulatedDuplicatePrevention: ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedDuplicatePreventionSummary;
  evidenceProvenanceSummary: ExecutionRecordAuditAppendWriterDryRunExecutionEvidenceProvenanceSummary;
  serverOnlySecurity: ExecutionRecordAuditAppendWriterDryRunExecutionServerOnlySecurityDependencySummary;
  noWriteNoAction: ExecutionRecordAuditAppendWriterDryRunExecutionNoWriteNoActionSafetySummary;
  dependencies: ExecutionRecordAuditAppendWriterDryRunExecutionDependencySummary;
  authority: ExecutionRecordAuditAppendWriterDryRunExecutionAuthorityFlags;
  safetyPolicy: ExecutionRecordAuditAppendWriterDryRunExecutionSafetyPolicy;
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterDryRunExecutionResult = {
  contractVersion: ExecutionRecordAuditAppendWriterDryRunExecutionContractVersion;
  status: ExecutionRecordAuditAppendWriterDryRunExecutionStatus;
  decisionRecommendation: ExecutionRecordAuditAppendWriterDryRunExecutionDecisionRecommendation;
  validationOnly: true;
  designOnly: true;
  dryRunExecutionOnly: true;
  hypotheticalOnly: true;
  nonPersistent: true;
  dryRunExecutedAgainstRealData: false;
  dryRunExecutionImplemented: false;
  dryRunExecutionAllowed: false;
  auditWriteExecuted: false;
  auditWriteAllowed: false;
  safeToWriteAudit: false;
  dryRunExecutionResultIsAuditWriteApproval: false;
  dryRunExecutionResultIsAuditAppendExecution: false;
  dryRunExecutionResultIsRouteCallApproval: false;
  dryRunExecutionResultIsRecordCreationApproval: false;
  dryRunExecutionResultIsPersistenceWriteApproval: false;
  dryRunExecutionResultIsSupabaseLocalStorageWriteApproval: false;
  dryRunExecutionResultIsSecurityProof: false;
  dryRunExecutionResultIsServerOnlyProof: false;
  dryRunExecutionResultIsSchemaProof: false;
  dryRunExecutionResultIsGeneratedTypesProof: false;
  dryRunExecutionResultIsMigrationProof: false;
  dryRunExecutionResultIsRlsSecurityProof: false;
  dryRunExecutionResultIsDownstreamApproval: false;
  dryRunValidatorReadinessIsExecution: false;
  dryRunValidatorReadinessIsWriteApproval: false;
  contractValidatorReadinessIsWriteApproval: false;
  writerValidatorReadinessIsWriteApproval: false;
  insertSuccessIsAuditWriteApproval: false;
  devPreviewDiagnosticsAreWriteApproval: false;
  simulatedAuditEventPayload: ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedAuditEventPayloadSummary;
  simulatedTableSchemaTarget: ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedTableSchemaTargetSummary;
  simulatedIdempotency: ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedIdempotencySummary;
  simulatedDuplicatePrevention: ExecutionRecordAuditAppendWriterDryRunExecutionSimulatedDuplicatePreventionSummary;
  evidenceProvenance: ExecutionRecordAuditAppendWriterDryRunExecutionEvidenceProvenanceSummary;
  serverOnlySecurity: ExecutionRecordAuditAppendWriterDryRunExecutionServerOnlySecurityDependencySummary;
  noWriteNoAction: ExecutionRecordAuditAppendWriterDryRunExecutionNoWriteNoActionSafetySummary;
  dependencies: ExecutionRecordAuditAppendWriterDryRunExecutionDependencySummary;
  authority: ExecutionRecordAuditAppendWriterDryRunExecutionAuthorityFlags;
  safetyPolicy: ExecutionRecordAuditAppendWriterDryRunExecutionSafetyPolicy;
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionReviewItem[];
  recommendedNextManualReview?: string | null;
  metadata?: Record<string, unknown>;
};
