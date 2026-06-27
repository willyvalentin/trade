import type {
  ExecutionRecordAuditAppendWriterInput,
  ExecutionRecordAuditAppendWriterResult,
} from "@/lib/execution-record-audit-append-writer-contract";
import type {
  ExecutionRecordAuditAppendWriterValidationResult,
} from "@/lib/execution-record-audit-append-writer-validator-contract";
import type {
  ExecutionRecordDuplicateMatch,
  PersistedExecutionRecordReference,
} from "@/lib/execution-record-persistence-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Audit append writer contract-validator contract metadata only. These types
// and constants do not implement validation logic, audit writer behavior,
// audit append execution, audit route calls, execution-record creation,
// persistence/write behavior, Supabase/localStorage writes, stats/PnL update,
// rollback/correction, trade mutation/reconciliation, UI update, notification
// execution, broker/order behavior, Avanza/browser behavior, or automatic
// mode. Contract validation is not audit write approval, security proof,
// server-only proof, schema proof, generated-types proof, migration proof,
// RLS/security proof, or downstream action approval.

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATOR_CONTRACT_VERSION =
  "execution_record_audit_append_writer_contract_validator_v1" as const;

export type ExecutionRecordAuditAppendWriterContractValidatorContractVersion =
  typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATOR_CONTRACT_VERSION;

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_STATUSES =
  [
    "audit_append_writer_contract_validation_ready_for_design_only",
    "audit_append_writer_contract_validation_blocked",
    "audit_append_writer_contract_validation_needs_review",
    "audit_append_writer_contract_validation_invalid",
    "audit_append_writer_contract_validation_absent",
  ] as const;

export type ExecutionRecordAuditAppendWriterContractValidationStatus =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_STATUSES)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_DECISION_RECOMMENDATIONS =
  [
    "design_only_do_not_write_audit",
    "blocked_do_not_write_audit",
    "needs_manual_review",
    "invalid_do_not_write_audit",
    "future_writer_contract_validator_required",
  ] as const;

export type ExecutionRecordAuditAppendWriterContractValidationDecisionRecommendation =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_BLOCKED_REASONS =
  [
    "contract_validation_input_missing",
    "writer_contract_input_missing",
    "writer_contract_result_missing",
    "writer_validator_result_missing",
    "execution_record_reference_missing",
    "audit_event_candidate_missing",
    "evidence_provenance_missing",
    "idempotency_key_missing",
    "duplicate_prevention_key_missing",
    "server_only_security_placeholder_missing",
    "audit_schema_table_placeholder_missing",
    "server_only_proof_missing",
    "service_role_proof_missing",
    "service_role_exposure_risk",
    "client_side_write_risk",
    "checklist_misinterpreted_as_security_proof",
    "dev_preview_diagnostics_misinterpreted_as_proof",
    "writer_validator_readiness_misinterpreted_as_write_approval",
    "contract_validation_misinterpreted_as_write_approval",
    "audit_schema_table_proof_missing",
    "generated_audit_types_missing",
    "generated_execution_record_types_assumed_enough",
    "migration_proof_missing",
    "rls_security_proof_missing",
    "idempotency_incomplete",
    "duplicate_prevention_incomplete",
    "evidence_provenance_incomplete",
    "downstream_authority_present",
    "write_requested_in_contract_validation_phase",
    "route_call_requested",
    "audit_writer_execution_requested",
    "audit_append_requested",
    "stats_pnl_update_requested",
    "trade_mutation_requested",
    "trade_reconciliation_requested",
    "rollback_correction_requested",
    "ui_update_requested",
    "notification_requested",
    "broker_or_avanza_action_requested",
    "automatic_mode_requested",
  ] as const;

export type ExecutionRecordAuditAppendWriterContractValidationBlockedReason =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_WARNINGS =
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
    "manual_review_may_be_required",
    "automatic_mode_not_enabled",
  ] as const;

export type ExecutionRecordAuditAppendWriterContractValidationWarning =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_WARNINGS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_REVIEW_ITEMS =
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
  ] as const;

export type ExecutionRecordAuditAppendWriterContractValidationReviewItem =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_REVIEW_ITEMS)[number];

export type ExecutionRecordAuditAppendWriterContractValidationAuthorityFlags = {
  validationOnly: true;
  designOnly: true;
  contractValidatorImplemented: false;
  writerValidatorImplemented: false;
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

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_DEFAULT_AUTHORITY_FLAGS =
  {
    validationOnly: true,
    designOnly: true,
    contractValidatorImplemented: false,
    writerValidatorImplemented: false,
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
  } as const satisfies ExecutionRecordAuditAppendWriterContractValidationAuthorityFlags;

export type ExecutionRecordAuditAppendWriterContractValidationSafetyPolicy =
  ExecutionRecordAuditAppendWriterContractValidationAuthorityFlags & {
    contractValidationIsAuditWriteApproval: false;
    contractValidationIsSecurityProof: false;
    contractValidationIsServerOnlyProof: false;
    contractValidationIsSchemaProof: false;
    contractValidationIsGeneratedTypesProof: false;
    contractValidationIsMigrationProof: false;
    contractValidationIsRlsSecurityProof: false;
    checklistStatusIsSecurityProof: false;
    devPreviewDiagnosticsAreProof: false;
    devPreviewDiagnosticsAreAuditWriteApproval: false;
    writerValidatorReadinessIsAuditWriteApproval: false;
    writerContractReadinessIsAuditWriteApproval: false;
    insertSuccessIsAuditWriteApproval: false;
    auditWriteSuccessIsDownstreamApproval: false;
    contractValidationSuccessApprovesStatsPnlUpdate: false;
    contractValidationSuccessApprovesTradeMutation: false;
    contractValidationSuccessApprovesTradeReconciliation: false;
    contractValidationSuccessApprovesCorrectionRollback: false;
    contractValidationSuccessApprovesUiUpdate: false;
    contractValidationSuccessApprovesNotification: false;
    contractValidationSuccessApprovesBrokerOrderFollowUp: false;
    contractValidationSuccessApprovesAvanzaBrowserFollowUp: false;
    contractValidationSuccessApprovesAutomaticMode: false;
    serverOnlyProofRequiredBeforeWriter: true;
    serviceRoleProofRequiredBeforeWriter: true;
    auditSchemaTableProofRequiredBeforeWriter: true;
    generatedAuditTypesRequiredIfSchemaBacked: true;
    generatedExecutionRecordTypesAloneNotEnough: true;
    migrationProofRequiredBeforeWriter: true;
    rlsSecurityProofRequiredBeforeWriter: true;
    idempotencyRequired: true;
    duplicatePreventionRequired: true;
    evidenceProvenanceRequired: true;
    serviceRoleMustRemainServerOnly: true;
    clientSideWriteForbidden: true;
    manualReviewSupported: true;
    noImplicitChainedActions: true;
    brokerAvanzaDisabledUnlessSeparatelyApproved: true;
    noHiddenAutomaticMode: true;
    policyReason: string;
  };

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_DEFAULT_SAFETY_POLICY =
  {
    ...EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
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
    serverOnlyProofRequiredBeforeWriter: true,
    serviceRoleProofRequiredBeforeWriter: true,
    auditSchemaTableProofRequiredBeforeWriter: true,
    generatedAuditTypesRequiredIfSchemaBacked: true,
    generatedExecutionRecordTypesAloneNotEnough: true,
    migrationProofRequiredBeforeWriter: true,
    rlsSecurityProofRequiredBeforeWriter: true,
    idempotencyRequired: true,
    duplicatePreventionRequired: true,
    evidenceProvenanceRequired: true,
    serviceRoleMustRemainServerOnly: true,
    clientSideWriteForbidden: true,
    manualReviewSupported: true,
    noImplicitChainedActions: true,
    brokerAvanzaDisabledUnlessSeparatelyApproved: true,
    noHiddenAutomaticMode: true,
    policyReason:
      "Audit append writer contract validation is type-only/readiness-only. Contract validation is not audit write approval, security proof, server-only proof, schema proof, generated-types proof, migration proof, RLS/security proof, or downstream action approval.",
  } as const satisfies ExecutionRecordAuditAppendWriterContractValidationSafetyPolicy;

export type ExecutionRecordAuditAppendWriterContractInputShapeValidationSummary =
  {
    writerContractInputPresent: boolean;
    executionRecordReference?: PersistedExecutionRecordReference | null;
    executionRecordReferencePresent: boolean;
    auditEventCandidatePresent: boolean;
    evidenceProvenancePresent: boolean;
    idempotencyKeyPresent: boolean;
    duplicatePreventionKeyPresent: boolean;
    serverOnlySecurityPlaceholderPresent: boolean;
    auditSchemaTablePlaceholderPresent: boolean;
    serviceRoleExposureRiskModeled: boolean;
    clientSideWriteRiskModeled: boolean;
    noLocalOnlySourceOfTruth: boolean;
    blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[];
    warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[];
    reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordAuditAppendWriterContractResultShapeValidationSummary =
  {
    writerContractResultPresent: boolean;
    statusPresent: boolean;
    decisionRecommendationPresent: boolean;
    noWriteNoActionStatusPresent: boolean;
    authorityFlagsPresent: boolean;
    allAuthorityFlagsFalse: boolean;
    downstreamNoAuthorityPreserved: boolean;
    auditWriteExecuted: false;
    auditWriteAllowed: false;
    safeToWriteAudit: false;
    blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[];
    warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[];
    reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordAuditAppendWriterContractServerOnlySecurityDependencySummary =
  {
    checklistStatus?: string | null;
    checklistStatusPresent: boolean;
    checklistStatusTreatedAsProof: false;
    serverOnlyProofPresent: boolean;
    serviceRoleProofPresent: boolean;
    serviceRoleExposureRisk: boolean;
    clientSideWriteRisk: boolean;
    routeAuthBoundaryProofPresent: boolean;
    serviceRoleSecretValuesForbidden: true;
    clientSideWriteForbidden: true;
    blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[];
    warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[];
    reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordAuditAppendWriterContractSchemaTypeDependencySummary =
  {
    auditSchemaTableProofPresent: boolean;
    generatedTypesProofPresent: boolean;
    generatedAuditTypesPresent: boolean;
    generatedExecutionRecordTypesPresent: boolean;
    generatedExecutionRecordTypesAssumedEnough: false;
    migrationProofPresent: boolean;
    rlsSecurityProofPresent: boolean;
    schemaDriftDetected: boolean;
    nullableRequiredMismatchDetected: boolean;
    schemaTableAssumedWithoutProof: false;
    blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[];
    warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[];
    reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordAuditAppendWriterContractIdempotencyDuplicatePreventionSummary =
  {
    idempotencyKey?: string | null;
    duplicatePreventionKey?: string | null;
    sourceFingerprint?: string | null;
    idempotencyKeyPresent: boolean;
    duplicatePreventionKeyPresent: boolean;
    idempotencyMetadataComplete: boolean;
    duplicatePreventionMetadataComplete: boolean;
    duplicateMatches: ExecutionRecordDuplicateMatch[];
    duplicateWriteBlocked: boolean;
    retrySafetyRepresented: boolean;
    unknownWriteStatusRepresented: boolean;
    safeToWriteDuplicateAuditEvent: false;
    blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[];
    warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[];
    reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordAuditAppendWriterContractEvidenceProvenanceSummary =
  {
    executionRecordReference?: PersistedExecutionRecordReference | null;
    executionRecordReferencePresent: boolean;
    evidenceProvenancePresent: boolean;
    actorSourceMetadataPresent: boolean;
    timestampSourceClockPresent: boolean;
    auditEventCandidatePresent: boolean;
    sourceReferences: string[];
    noLocalOnlySourceOfTruth: boolean;
    provenanceTraceComplete: boolean;
    blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[];
    warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[];
    reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordAuditAppendWriterContractNoWriteNoActionSafetySummary =
  {
    validationOnly: true;
    designOnly: true;
    auditWriteExecuted: false;
    auditWriteAllowed: false;
    routeCallAllowed: false;
    recordCreationAllowed: false;
    persistenceWriteAllowed: false;
    supabaseWriteAllowed: false;
    localStorageWriteAllowed: false;
    downstreamAuthorityPresent: false;
    brokerAvanzaActionAllowed: false;
    automaticModeAllowed: false;
    blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[];
    warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[];
    reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordAuditAppendWriterContractDependencyValidationSummary =
  {
    writerContractInputPresent: boolean;
    writerContractResultPresent: boolean;
    writerValidatorResultPresent: boolean;
    contractValidatorImplemented: false;
    writerValidatorImplemented: boolean;
    writerImplemented: false;
    auditAppendImplemented: false;
    auditRouteImplemented: false;
    auditWritePathPresent: false;
    productionInsertRouteImplemented: boolean;
    productionInsertWritePathPresent: boolean;
    serverOnlyProofPresent: boolean;
    serviceRoleProofPresent: boolean;
    auditSchemaTableProofPresent: boolean;
    generatedTypesProofPresent: boolean;
    migrationProofPresent: boolean;
    rlsSecurityProofPresent: boolean;
    checklistStatusIsProof: false;
    devPreviewDiagnosticsAreProof: false;
    blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[];
    warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[];
    reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordAuditAppendWriterContractValidationInput = {
  contractVersion: ExecutionRecordAuditAppendWriterContractValidatorContractVersion;
  requestedAt: string;
  requestedBy?: string | null;
  auditWriterContractInput?: ExecutionRecordAuditAppendWriterInput | null;
  auditWriterContractResult?: ExecutionRecordAuditAppendWriterResult | null;
  writerValidatorResult?: ExecutionRecordAuditAppendWriterValidationResult | null;
  serverOnlySecurityChecklistStatus?: string | null;
  auditSchemaTableProofStatus?: string | null;
  generatedTypesProofStatus?: string | null;
  migrationProofStatus?: string | null;
  rlsSecurityProofStatus?: string | null;
  idempotencyMetadata?: Record<string, unknown> | null;
  duplicatePreventionMetadata?: Record<string, unknown> | null;
  evidenceProvenanceMetadata?: Record<string, unknown> | null;
  serviceRoleExposureRiskMetadata?: Record<string, unknown> | null;
  clientSideWriteRiskMetadata?: Record<string, unknown> | null;
  downstreamAuthorityMetadata?: Record<string, unknown> | null;
  manualReviewMetadata?: FinalizationActionValidatorManualApprovalContext | null;
  inputShape: ExecutionRecordAuditAppendWriterContractInputShapeValidationSummary;
  resultShape: ExecutionRecordAuditAppendWriterContractResultShapeValidationSummary;
  serverOnlySecurity: ExecutionRecordAuditAppendWriterContractServerOnlySecurityDependencySummary;
  schemaType: ExecutionRecordAuditAppendWriterContractSchemaTypeDependencySummary;
  idempotencyDuplicatePrevention: ExecutionRecordAuditAppendWriterContractIdempotencyDuplicatePreventionSummary;
  evidenceProvenance: ExecutionRecordAuditAppendWriterContractEvidenceProvenanceSummary;
  noWriteNoAction: ExecutionRecordAuditAppendWriterContractNoWriteNoActionSafetySummary;
  dependencies: ExecutionRecordAuditAppendWriterContractDependencyValidationSummary;
  authority: ExecutionRecordAuditAppendWriterContractValidationAuthorityFlags;
  safetyPolicy: ExecutionRecordAuditAppendWriterContractValidationSafetyPolicy;
  blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterContractValidationResult = {
  contractVersion: ExecutionRecordAuditAppendWriterContractValidatorContractVersion;
  status: ExecutionRecordAuditAppendWriterContractValidationStatus;
  decisionRecommendation: ExecutionRecordAuditAppendWriterContractValidationDecisionRecommendation;
  validationOnly: true;
  designOnly: true;
  contractValidatorImplemented: false;
  auditWriteExecuted: false;
  auditWriteAllowed: false;
  safeToWriteAudit: false;
  contractValidationIsAuditWriteApproval: false;
  contractValidationIsSecurityProof: false;
  contractValidationIsServerOnlyProof: false;
  contractValidationIsSchemaProof: false;
  contractValidationIsGeneratedTypesProof: false;
  contractValidationIsMigrationProof: false;
  contractValidationIsRlsSecurityProof: false;
  checklistStatusIsSecurityProof: false;
  devPreviewDiagnosticsAreProof: false;
  devPreviewDiagnosticsAreAuditWriteApproval: false;
  writerValidatorReadinessIsAuditWriteApproval: false;
  writerContractReadinessIsAuditWriteApproval: false;
  insertSuccessIsAuditWriteApproval: false;
  auditWriteSuccessIsDownstreamApproval: false;
  contractValidationSuccessApprovesStatsPnlUpdate: false;
  contractValidationSuccessApprovesTradeMutation: false;
  contractValidationSuccessApprovesTradeReconciliation: false;
  contractValidationSuccessApprovesCorrectionRollback: false;
  contractValidationSuccessApprovesUiUpdate: false;
  contractValidationSuccessApprovesNotification: false;
  contractValidationSuccessApprovesBrokerOrderFollowUp: false;
  contractValidationSuccessApprovesAvanzaBrowserFollowUp: false;
  contractValidationSuccessApprovesAutomaticMode: false;
  inputShape: ExecutionRecordAuditAppendWriterContractInputShapeValidationSummary;
  resultShape: ExecutionRecordAuditAppendWriterContractResultShapeValidationSummary;
  serverOnlySecurity: ExecutionRecordAuditAppendWriterContractServerOnlySecurityDependencySummary;
  schemaType: ExecutionRecordAuditAppendWriterContractSchemaTypeDependencySummary;
  idempotencyDuplicatePrevention: ExecutionRecordAuditAppendWriterContractIdempotencyDuplicatePreventionSummary;
  evidenceProvenance: ExecutionRecordAuditAppendWriterContractEvidenceProvenanceSummary;
  noWriteNoAction: ExecutionRecordAuditAppendWriterContractNoWriteNoActionSafetySummary;
  dependencies: ExecutionRecordAuditAppendWriterContractDependencyValidationSummary;
  authority: ExecutionRecordAuditAppendWriterContractValidationAuthorityFlags;
  safetyPolicy: ExecutionRecordAuditAppendWriterContractValidationSafetyPolicy;
  blockedReasons: ExecutionRecordAuditAppendWriterContractValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterContractValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterContractValidationReviewItem[];
  recommendedNextManualReview?: string | null;
  metadata?: Record<string, unknown>;
};
