import type {
  ExecutionRecordAuditAppendBoundaryInput,
  ExecutionRecordAuditAppendBoundaryResult,
  ExecutionRecordAuditAppendEventCandidateSummary,
  ExecutionRecordAuditAppendEvidenceSummary,
} from "@/lib/execution-record-audit-append-boundary-contract";
import type {
  ExecutionRecordAuditAppendBoundaryValidationResult,
} from "@/lib/execution-record-audit-append-boundary-validator-contract";
import type {
  ExecutionRecordPostInsertOrchestratorResult,
} from "@/lib/execution-record-post-insert-orchestrator-contract";
import type {
  ExecutionRecordProductionInsertRouteBoundaryResult,
} from "@/lib/execution-record-production-insert-route-boundary-contract";
import type {
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceAuditMetadata,
  ExecutionRecordPersistenceInput,
  ExecutionRecordPersistenceSchemaReference,
  PersistedExecutionRecordReference,
} from "@/lib/execution-record-persistence-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Audit append writer contract metadata only. These types and constants do not
// implement audit writer logic, append audit data, call routes, create
// execution records, persist/write, write Supabase/localStorage, update
// stats/PnL, roll back/correct, mutate or reconcile trades, update UI, notify
// users, run broker/order behavior, automate Avanza/browser behavior, or
// enable automatic mode. Writer contract readiness, insert success, validator
// readiness, dev-preview diagnostics, and orchestrator contract readiness are
// not audit write approval. Audit write success is not downstream action
// approval.

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VERSION =
  "execution_record_audit_append_writer_v1" as const;

export type ExecutionRecordAuditAppendWriterContractVersion =
  typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VERSION;

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_STATUSES = [
  "audit_append_writer_contract_only",
  "audit_append_writer_blocked",
  "audit_append_writer_needs_review",
  "audit_append_writer_invalid",
  "audit_append_writer_absent",
] as const;

export type ExecutionRecordAuditAppendWriterStatus =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_STATUSES)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DECISION_RECOMMENDATIONS = [
  "contract_only_do_not_write_audit",
  "blocked_do_not_write_audit",
  "needs_manual_review",
  "invalid_do_not_write_audit",
  "future_audit_writer_required",
] as const;

export type ExecutionRecordAuditAppendWriterDecisionRecommendation =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_BLOCKED_REASONS = [
  "validated_audit_boundary_result_missing",
  "audit_validator_result_missing",
  "audit_event_candidate_missing",
  "execution_record_reference_missing",
  "execution_record_evidence_missing",
  "evidence_provenance_missing",
  "audit_event_type_missing",
  "audit_event_source_missing",
  "audit_event_payload_missing",
  "actor_source_metadata_missing",
  "timestamp_source_metadata_missing",
  "idempotency_key_missing",
  "duplicate_prevention_key_missing",
  "audit_schema_table_unverified",
  "generated_types_absent_or_unknown",
  "migration_application_not_proven",
  "rls_security_unverified",
  "server_only_boundary_unverified",
  "service_role_execution_context_missing",
  "service_role_secret_exposure_risk",
  "manual_review_required",
  "insert_success_misinterpreted_as_write_approval",
  "validator_readiness_misinterpreted_as_write_approval",
  "dev_preview_diagnostics_misinterpreted_as_write_approval",
  "orchestrator_contract_readiness_misinterpreted_as_write_approval",
  "audit_write_requested_in_contract_phase",
  "stats_pnl_update_requested",
  "trade_mutation_requested",
  "trade_reconciliation_requested",
  "rollback_correction_requested",
  "ui_update_requested",
  "notification_requested",
  "broker_or_avanza_action_requested",
  "automatic_mode_requested",
] as const;

export type ExecutionRecordAuditAppendWriterBlockedReason =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_WARNINGS = [
  "contract_only",
  "audit_writer_not_implemented",
  "audit_append_not_implemented",
  "audit_route_not_implemented",
  "audit_write_not_executed",
  "insert_success_not_audit_write_approval",
  "validator_readiness_not_audit_write_approval",
  "dev_preview_diagnostics_not_audit_write_approval",
  "orchestrator_contract_readiness_not_audit_write_approval",
  "audit_write_success_not_stats_pnl_approval",
  "audit_write_success_not_trade_mutation_approval",
  "audit_write_success_not_trade_reconciliation_approval",
  "audit_write_success_not_rollback_approval",
  "audit_write_success_not_ui_update_approval",
  "audit_write_success_not_notification_approval",
  "audit_write_success_not_broker_order_approval",
  "audit_write_success_not_avanza_browser_approval",
  "audit_write_success_not_automatic_mode_approval",
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
  "manual_review_may_be_required",
  "automatic_mode_not_enabled",
] as const;

export type ExecutionRecordAuditAppendWriterWarning =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_WARNINGS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_REVIEW_ITEMS = [
  "audit_append_writer_contract_review",
  "validated_audit_boundary_result_review",
  "audit_validator_result_review",
  "audit_event_candidate_review",
  "execution_record_reference_review",
  "execution_record_evidence_review",
  "evidence_provenance_review",
  "audit_event_payload_review",
  "actor_source_metadata_review",
  "timestamp_source_clock_review",
  "idempotency_review",
  "duplicate_prevention_review",
  "audit_schema_review",
  "generated_types_review",
  "migration_application_review",
  "rls_security_review",
  "server_only_boundary_review",
  "service_role_execution_context_review",
  "manual_review",
  "failure_retry_review",
  "downstream_authority_review",
  "broker_avanza_safety_review",
] as const;

export type ExecutionRecordAuditAppendWriterReviewItem =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_WRITER_REVIEW_ITEMS)[number];

export type ExecutionRecordAuditAppendWriterAuthorityFlags = {
  contractOnly: true;
  writerImplemented: false;
  auditAppendImplemented: false;
  auditRouteImplemented: false;
  auditWriteAllowed: false;
  safeToWriteAudit: false;
  auditAppendAllowed: false;
  safeToAppendAudit: false;
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

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DEFAULT_AUTHORITY_FLAGS = {
  contractOnly: true,
  writerImplemented: false,
  auditAppendImplemented: false,
  auditRouteImplemented: false,
  auditWriteAllowed: false,
  safeToWriteAudit: false,
  auditAppendAllowed: false,
  safeToAppendAudit: false,
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
} as const satisfies ExecutionRecordAuditAppendWriterAuthorityFlags;

export type ExecutionRecordAuditAppendWriterSafetyPolicy =
  ExecutionRecordAuditAppendWriterAuthorityFlags & {
    writerContractReadinessIsAuditWriteApproval: false;
    insertSuccessIsAuditWriteApproval: false;
    validatorReadinessIsAuditWriteApproval: false;
    devPreviewDiagnosticsAreAuditWriteApproval: false;
    orchestratorContractReadinessIsAuditWriteApproval: false;
    auditWriteSuccessApprovesStatsPnlUpdate: false;
    auditWriteSuccessApprovesTradeMutation: false;
    auditWriteSuccessApprovesTradeReconciliation: false;
    auditWriteSuccessApprovesCorrectionRollback: false;
    auditWriteSuccessApprovesUiUpdate: false;
    auditWriteSuccessApprovesNotification: false;
    auditWriteSuccessApprovesBrokerOrderFollowUp: false;
    auditWriteSuccessApprovesAvanzaBrowserFollowUp: false;
    auditWriteSuccessApprovesAutomaticMode: false;
    auditSchemaMustBeProvenBeforeWrite: true;
    generatedTypesRequiredBeforeAuditWrite: true;
    migrationProofRequiredBeforeAuditWrite: true;
    rlsSecurityRequiredBeforeAuditWrite: true;
    serverOnlyBoundaryRequiredBeforeAuditWrite: true;
    serviceRoleMustRemainServerOnly: true;
    clientSideWriteForbidden: true;
    idempotencyRequired: true;
    duplicatePreventionRequired: true;
    evidenceProvenanceRequired: true;
    manualReviewSupported: true;
    noImplicitChainedActions: true;
    brokerAvanzaDisabledUnlessSeparatelyApproved: true;
    noHiddenAutomaticMode: true;
    policyReason: string;
  };

export const EXECUTION_RECORD_AUDIT_APPEND_WRITER_DEFAULT_SAFETY_POLICY = {
  ...EXECUTION_RECORD_AUDIT_APPEND_WRITER_DEFAULT_AUTHORITY_FLAGS,
  writerContractReadinessIsAuditWriteApproval: false,
  insertSuccessIsAuditWriteApproval: false,
  validatorReadinessIsAuditWriteApproval: false,
  devPreviewDiagnosticsAreAuditWriteApproval: false,
  orchestratorContractReadinessIsAuditWriteApproval: false,
  auditWriteSuccessApprovesStatsPnlUpdate: false,
  auditWriteSuccessApprovesTradeMutation: false,
  auditWriteSuccessApprovesTradeReconciliation: false,
  auditWriteSuccessApprovesCorrectionRollback: false,
  auditWriteSuccessApprovesUiUpdate: false,
  auditWriteSuccessApprovesNotification: false,
  auditWriteSuccessApprovesBrokerOrderFollowUp: false,
  auditWriteSuccessApprovesAvanzaBrowserFollowUp: false,
  auditWriteSuccessApprovesAutomaticMode: false,
  auditSchemaMustBeProvenBeforeWrite: true,
  generatedTypesRequiredBeforeAuditWrite: true,
  migrationProofRequiredBeforeAuditWrite: true,
  rlsSecurityRequiredBeforeAuditWrite: true,
  serverOnlyBoundaryRequiredBeforeAuditWrite: true,
  serviceRoleMustRemainServerOnly: true,
  clientSideWriteForbidden: true,
  idempotencyRequired: true,
  duplicatePreventionRequired: true,
  evidenceProvenanceRequired: true,
  manualReviewSupported: true,
  noImplicitChainedActions: true,
  brokerAvanzaDisabledUnlessSeparatelyApproved: true,
  noHiddenAutomaticMode: true,
  policyReason:
    "Audit append writer contracts are contract-only. Writer contract readiness, insert success, validator readiness, dev-preview diagnostics, and orchestrator contract readiness are not audit write approval. Audit write success does not approve downstream actions.",
} as const satisfies ExecutionRecordAuditAppendWriterSafetyPolicy;

export type ExecutionRecordAuditAppendWriterAuditEventSummary = {
  auditEventType?: string | null;
  auditEventSource?: string | null;
  auditEventPayloadSummary?: Record<string, unknown> | null;
  auditEventCandidate?: ExecutionRecordAuditAppendEventCandidateSummary | null;
  actorSourceMetadata?: Record<string, unknown> | null;
  timestampSourceClockMetadata?: Record<string, unknown> | null;
  executionRecordId?: string | null;
  executionRecordReference?: PersistedExecutionRecordReference | null;
  candidateFingerprint?: string | null;
  payloadExplainable: boolean;
  noSecretPayloadExposure: boolean;
  noLocalOnlySourceOfTruth: boolean;
  noBrokerAvanzaAssumptions: boolean;
  blockedReasons: ExecutionRecordAuditAppendWriterBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterInsertedAuditEventReference = {
  auditEventId: string;
  auditTableName?: string | null;
  auditEventFingerprint: string;
  auditEventType: string;
  auditEventSource: string;
  executionRecordId: string;
  executionRecordReference?: PersistedExecutionRecordReference | null;
  idempotencyKey: string;
  duplicatePreventionKey: string;
  writtenAt: string;
  writtenBy: "server_only_audit_writer";
  serviceRoleSecretExposed: false;
  clientSideWrite: false;
};

export type ExecutionRecordAuditAppendWriterEvidenceSummary = {
  validatedAuditBoundaryInput?: ExecutionRecordAuditAppendBoundaryInput | null;
  validatedAuditBoundaryResult?: ExecutionRecordAuditAppendBoundaryResult | null;
  auditValidatorResult?: ExecutionRecordAuditAppendBoundaryValidationResult | null;
  postInsertOrchestratorResult?: ExecutionRecordPostInsertOrchestratorResult | null;
  productionInsertBoundaryResult?: ExecutionRecordProductionInsertRouteBoundaryResult | null;
  executionRecordId?: string | null;
  executionRecordReference?: PersistedExecutionRecordReference | null;
  executionRecordEvidence?: ExecutionRecordAuditAppendEvidenceSummary | null;
  normalizedExecutionRecordInput?: ExecutionRecordPersistenceInput | null;
  auditCorrectionMetadata?: ExecutionRecordPersistenceAuditMetadata | null;
  schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
  evidencePresent: boolean;
  evidenceProvenancePresent: boolean;
  sourceReferences: string[];
  blockedReasons: ExecutionRecordAuditAppendWriterBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterIdempotencySummary = {
  idempotencyKey?: string | null;
  auditEventKey?: string | null;
  sourceEventFingerprint?: string | null;
  executionRecordId?: string | null;
  executionRecordFingerprint?: string | null;
  candidateFingerprint?: string | null;
  idempotencyMetadataPresent: boolean;
  stableAuditEventKeyPresent: boolean;
  sourceEventFingerprintPresent: boolean;
  safeToRetry: false;
  retryRequiresManualReview: true;
  blockedReasons: ExecutionRecordAuditAppendWriterBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterDuplicatePreventionSummary = {
  duplicatePreventionKey?: string | null;
  duplicatePreventionMetadataPresent: boolean;
  duplicateMatches: ExecutionRecordDuplicateMatch[];
  duplicateAuditEventDetected: boolean;
  duplicateAuditWriteBlocked: boolean;
  duplicateLookupRequiredBeforeWrite: true;
  writeConflictDetected: boolean;
  blockedReasons: ExecutionRecordAuditAppendWriterBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterFailureSummary = {
  validationBlockedBeforeWriterRepresented: boolean;
  writerBlockedRepresented: boolean;
  duplicateDetectedRepresented: boolean;
  writeFailedRepresented: boolean;
  unknownWriteStatusRepresented: boolean;
  partialFailureAfterWriteRepresented: boolean;
  retryPolicyPresent: boolean;
  retryRequiresStableIdempotency: true;
  manualReviewRequired: true;
  downstreamActionsRemainBlocked: true;
  hiddenPartialFailureAllowed: false;
  blockedReasons: ExecutionRecordAuditAppendWriterBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterDependencySummary = {
  auditWriterContractPresent: true;
  auditWriterImplemented: false;
  auditAppendImplementationPresent: false;
  auditRouteImplemented: false;
  auditWritePathPresent: false;
  auditSchemaTableProven: boolean;
  generatedTypesPresent: boolean;
  migrationApplicationProven: boolean;
  rlsSecurityVerified: boolean;
  serverOnlyBoundaryVerified: boolean;
  productionInsertRouteImplemented: boolean;
  productionInsertWritePathPresent: boolean;
  postInsertOrchestratorImplemented: boolean;
  blockedReasons: ExecutionRecordAuditAppendWriterBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterServerOnlySecuritySummary = {
  serverOnlyExecutionContextPresent: boolean;
  serviceRoleExecutionContextPresent: boolean;
  serviceRoleSecretExposed: false;
  serviceRoleSecretValueIncluded: false;
  clientSideWriteBlocked: boolean;
  safeToWriteFromClient: false;
  safeToUseServiceRoleInClient: false;
  routeAuthBoundaryVerified: boolean;
  rlsSecurityVerified: boolean;
  serverOnlyBoundaryVerified: boolean;
  safeEvidenceLoggingOnly: boolean;
  blockedReasons: ExecutionRecordAuditAppendWriterBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterInput = {
  contractVersion: ExecutionRecordAuditAppendWriterContractVersion;
  requestedAt: string;
  requestedBy?: string | null;
  validatedAuditBoundaryInput?: ExecutionRecordAuditAppendBoundaryInput | null;
  validatedAuditBoundaryResult?: ExecutionRecordAuditAppendBoundaryResult | null;
  auditValidatorResult?: ExecutionRecordAuditAppendBoundaryValidationResult | null;
  auditEventCandidate?: ExecutionRecordAuditAppendEventCandidateSummary | null;
  auditEvent: ExecutionRecordAuditAppendWriterAuditEventSummary;
  executionRecordId?: string | null;
  executionRecordReference?: PersistedExecutionRecordReference | null;
  executionRecordEvidence?: ExecutionRecordAuditAppendEvidenceSummary | null;
  normalizedExecutionRecordInput?: ExecutionRecordPersistenceInput | null;
  auditEventType?: string | null;
  auditEventSource?: string | null;
  auditEventPayloadSummary?: Record<string, unknown> | null;
  actorSourceMetadata?: Record<string, unknown> | null;
  timestampSourceClockMetadata?: Record<string, unknown> | null;
  idempotencyKey?: string | null;
  duplicatePreventionKey?: string | null;
  auditSchemaTableProof?: Record<string, unknown> | null;
  generatedTypesProof?: Record<string, unknown> | null;
  migrationProof?: Record<string, unknown> | null;
  rlsSecurityProof?: Record<string, unknown> | null;
  serverOnlyProof?: Record<string, unknown> | null;
  serviceRoleServerOnlyExecutionContext?: Record<string, unknown> | null;
  manualReviewMetadata?: FinalizationActionValidatorManualApprovalContext | null;
  failureRetryMetadata?: Record<string, unknown> | null;
  evidence: ExecutionRecordAuditAppendWriterEvidenceSummary;
  idempotency: ExecutionRecordAuditAppendWriterIdempotencySummary;
  duplicatePrevention: ExecutionRecordAuditAppendWriterDuplicatePreventionSummary;
  failure: ExecutionRecordAuditAppendWriterFailureSummary;
  dependencies: ExecutionRecordAuditAppendWriterDependencySummary;
  serverOnlySecurity: ExecutionRecordAuditAppendWriterServerOnlySecuritySummary;
  authority: ExecutionRecordAuditAppendWriterAuthorityFlags;
  safetyPolicy: ExecutionRecordAuditAppendWriterSafetyPolicy;
  blockedReasons: ExecutionRecordAuditAppendWriterBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendWriterResult = {
  contractVersion: ExecutionRecordAuditAppendWriterContractVersion;
  status: ExecutionRecordAuditAppendWriterStatus;
  decisionRecommendation: ExecutionRecordAuditAppendWriterDecisionRecommendation;
  contractOnly: true;
  writerImplemented: false;
  auditAppendImplemented: false;
  auditRouteImplemented: false;
  auditWriteExecuted: false;
  auditWriteAllowed: false;
  safeToWriteAudit: false;
  auditAppendAllowed: false;
  safeToAppendAudit: false;
  writerContractReadinessIsAuditWriteApproval: false;
  insertSuccessIsAuditWriteApproval: false;
  validatorReadinessIsAuditWriteApproval: false;
  devPreviewDiagnosticsAreAuditWriteApproval: false;
  orchestratorContractReadinessIsAuditWriteApproval: false;
  auditWriteSuccessApprovesStatsPnlUpdate: false;
  auditWriteSuccessApprovesTradeMutation: false;
  auditWriteSuccessApprovesTradeReconciliation: false;
  auditWriteSuccessApprovesCorrectionRollback: false;
  auditWriteSuccessApprovesUiUpdate: false;
  auditWriteSuccessApprovesNotification: false;
  auditWriteSuccessApprovesBrokerOrderFollowUp: false;
  auditWriteSuccessApprovesAvanzaBrowserFollowUp: false;
  auditWriteSuccessApprovesAutomaticMode: false;
  auditEvent: ExecutionRecordAuditAppendWriterAuditEventSummary;
  auditAppendResultSummary?: Record<string, unknown> | null;
  insertedAuditEventReference?: ExecutionRecordAuditAppendWriterInsertedAuditEventReference | null;
  evidence: ExecutionRecordAuditAppendWriterEvidenceSummary;
  idempotency: ExecutionRecordAuditAppendWriterIdempotencySummary;
  duplicatePrevention: ExecutionRecordAuditAppendWriterDuplicatePreventionSummary;
  failure: ExecutionRecordAuditAppendWriterFailureSummary;
  dependencies: ExecutionRecordAuditAppendWriterDependencySummary;
  serverOnlySecurity: ExecutionRecordAuditAppendWriterServerOnlySecuritySummary;
  authority: ExecutionRecordAuditAppendWriterAuthorityFlags;
  safetyPolicy: ExecutionRecordAuditAppendWriterSafetyPolicy;
  blockedReasons: ExecutionRecordAuditAppendWriterBlockedReason[];
  warnings: ExecutionRecordAuditAppendWriterWarning[];
  reviewItems: ExecutionRecordAuditAppendWriterReviewItem[];
  recommendedNextManualReview?: string | null;
  metadata?: Record<string, unknown>;
};
