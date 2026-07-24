import type {
  ExecutionRecordPostInsertBoundaryInput,
  ExecutionRecordPostInsertBoundaryResult,
} from "@/lib/execution-record-post-insert-boundary-contract";
import type {
  ExecutionRecordPostInsertBoundaryValidationResult,
} from "@/lib/execution-record-post-insert-boundary-validator-contract";
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

// Audit append boundary contract metadata only. These types and constants do
// not implement audit append, write audit data, validate audit append, call
// routes, create execution records, persist/write, write Supabase/localStorage,
// update stats/PnL, roll back/correct, mutate or reconcile trades, update UI,
// notify users, run broker/order behavior, automate Avanza/browser behavior, or
// enable automatic mode. Insert success, post-insert validator readiness, and
// orchestrator contract readiness are not audit append approval.

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_CONTRACT_VERSION =
  "execution_record_audit_append_boundary_v1" as const;

export type ExecutionRecordAuditAppendBoundaryContractVersion =
  typeof EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_CONTRACT_VERSION;

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_STATUSES = [
  "audit_append_boundary_contract_only",
  "audit_append_boundary_blocked",
  "audit_append_boundary_needs_review",
  "audit_append_boundary_invalid",
  "audit_append_boundary_absent",
] as const;

export type ExecutionRecordAuditAppendBoundaryStatus =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_STATUSES)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_DECISION_RECOMMENDATIONS =
  [
    "contract_only_do_not_append_audit",
    "blocked_do_not_append_audit",
    "needs_manual_review",
    "invalid_do_not_append_audit",
    "future_audit_boundary_required",
  ] as const;

export type ExecutionRecordAuditAppendBoundaryDecisionRecommendation =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_BLOCKED_REASONS = [
  "execution_record_reference_missing",
  "execution_record_evidence_missing",
  "evidence_provenance_missing",
  "audit_event_type_missing",
  "audit_event_source_missing",
  "audit_event_payload_missing",
  "actor_source_metadata_missing",
  "idempotency_key_missing",
  "duplicate_prevention_key_missing",
  "generated_types_absent_or_unknown",
  "migration_application_not_proven",
  "rls_security_unverified",
  "server_only_boundary_unverified",
  "manual_review_required",
  "insert_success_misinterpreted_as_audit_approval",
  "post_insert_validator_readiness_misinterpreted_as_audit_approval",
  "orchestrator_contract_readiness_misinterpreted_as_audit_approval",
  "audit_append_requested_in_contract_phase",
  "stats_pnl_update_requested",
  "trade_mutation_requested",
  "ui_update_requested",
  "notification_requested",
  "broker_or_avanza_action_requested",
  "automatic_mode_requested",
] as const;

export type ExecutionRecordAuditAppendBoundaryBlockedReason =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_WARNINGS = [
  "contract_only",
  "audit_append_not_implemented",
  "audit_writer_not_implemented",
  "insert_success_not_audit_append_approval",
  "post_insert_validator_readiness_not_audit_append_approval",
  "orchestrator_contract_readiness_not_audit_append_approval",
  "audit_success_not_stats_pnl_approval",
  "audit_success_not_trade_mutation_approval",
  "audit_success_not_rollback_approval",
  "audit_success_not_ui_update_approval",
  "audit_success_not_notification_approval",
  "audit_success_not_broker_order_approval",
  "audit_success_not_avanza_browser_approval",
  "audit_success_not_automatic_mode_approval",
  "idempotency_required",
  "duplicate_prevention_required",
  "evidence_provenance_required",
  "generated_types_required_before_audit_append",
  "migration_application_required_before_audit_append",
  "rls_security_required_before_audit_append",
  "server_only_boundary_required_before_audit_append",
  "audit_schema_must_be_proven_before_write",
  "manual_review_may_be_required",
  "automatic_mode_not_enabled",
] as const;

export type ExecutionRecordAuditAppendBoundaryWarning =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_WARNINGS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_REVIEW_ITEMS = [
  "audit_append_boundary_contract_review",
  "execution_record_reference_review",
  "execution_record_evidence_review",
  "audit_event_candidate_review",
  "audit_event_payload_review",
  "actor_source_metadata_review",
  "timestamp_source_clock_review",
  "idempotency_review",
  "duplicate_prevention_review",
  "generated_types_review",
  "migration_application_review",
  "rls_security_review",
  "server_only_boundary_review",
  "audit_schema_review",
  "manual_review",
  "failure_retry_review",
  "downstream_authority_review",
  "broker_avanza_safety_review",
] as const;

export type ExecutionRecordAuditAppendBoundaryReviewItem =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_REVIEW_ITEMS)[number];

export type ExecutionRecordAuditAppendBoundaryAuthorityFlags = {
  contractOnly: true;
  auditAppendImplemented: false;
  auditWriterImplemented: false;
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

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_DEFAULT_AUTHORITY_FLAGS = {
  contractOnly: true,
  auditAppendImplemented: false,
  auditWriterImplemented: false,
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
} as const satisfies ExecutionRecordAuditAppendBoundaryAuthorityFlags;

export type ExecutionRecordAuditAppendBoundarySafetyPolicy =
  ExecutionRecordAuditAppendBoundaryAuthorityFlags & {
    insertSuccessIsAuditAppendApproval: false;
    postInsertValidatorReadinessIsAuditAppendApproval: false;
    orchestratorContractReadinessIsAuditAppendApproval: false;
    auditSuccessApprovesStatsPnlUpdate: false;
    auditSuccessApprovesTradeMutation: false;
    auditSuccessApprovesTradeReconciliation: false;
    auditSuccessApprovesCorrectionRollback: false;
    auditSuccessApprovesUiUpdate: false;
    auditSuccessApprovesNotification: false;
    auditSuccessApprovesBrokerOrderFollowUp: false;
    auditSuccessApprovesAvanzaBrowserFollowUp: false;
    auditSchemaMustBeProvenBeforeWrite: true;
    idempotencyRequired: true;
    duplicatePreventionRequired: true;
    evidenceProvenanceRequired: true;
    manualReviewSupported: true;
    noImplicitChainedActions: true;
    brokerAvanzaDisabledUnlessSeparatelyApproved: true;
    noHiddenAutomaticMode: true;
    policyReason: string;
  };

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_DEFAULT_SAFETY_POLICY = {
  ...EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_DEFAULT_AUTHORITY_FLAGS,
  insertSuccessIsAuditAppendApproval: false,
  postInsertValidatorReadinessIsAuditAppendApproval: false,
  orchestratorContractReadinessIsAuditAppendApproval: false,
  auditSuccessApprovesStatsPnlUpdate: false,
  auditSuccessApprovesTradeMutation: false,
  auditSuccessApprovesTradeReconciliation: false,
  auditSuccessApprovesCorrectionRollback: false,
  auditSuccessApprovesUiUpdate: false,
  auditSuccessApprovesNotification: false,
  auditSuccessApprovesBrokerOrderFollowUp: false,
  auditSuccessApprovesAvanzaBrowserFollowUp: false,
  auditSchemaMustBeProvenBeforeWrite: true,
  idempotencyRequired: true,
  duplicatePreventionRequired: true,
  evidenceProvenanceRequired: true,
  manualReviewSupported: true,
  noImplicitChainedActions: true,
  brokerAvanzaDisabledUnlessSeparatelyApproved: true,
  noHiddenAutomaticMode: true,
  policyReason:
    "Audit append boundary contracts are contract-only. Insert success, post-insert validator readiness, and orchestrator contract readiness are not audit append approval, and audit success does not approve downstream actions.",
} as const satisfies ExecutionRecordAuditAppendBoundarySafetyPolicy;

export type ExecutionRecordAuditAppendEventCandidateSummary = {
  auditEventType?: string | null;
  auditEventSource?: string | null;
  auditEventPayloadSummary?: Record<string, unknown> | null;
  actorSourceMetadata?: Record<string, unknown> | null;
  timestampSourceClockMetadata?: Record<string, unknown> | null;
  executionRecordId?: string | null;
  executionRecordReference?: PersistedExecutionRecordReference | null;
  candidateFingerprint?: string | null;
  candidateCreatedAt?: string | null;
  payloadExplainable: boolean;
  noSecretPayloadExposure: boolean;
  noLocalOnlySourceOfTruth: boolean;
  noBrokerAvanzaAssumptions: boolean;
  blockedReasons: ExecutionRecordAuditAppendBoundaryBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendEvidenceSummary = {
  executionRecordId?: string | null;
  executionRecordReference?: PersistedExecutionRecordReference | null;
  insertedExecutionRecordSummary?: Record<string, unknown> | null;
  normalizedExecutionRecordInput?: ExecutionRecordPersistenceInput | null;
  productionInsertRouteResultMetadata?: Record<string, unknown> | null;
  productionInsertBoundaryResult?: ExecutionRecordProductionInsertRouteBoundaryResult | null;
  postInsertBoundaryInput?: ExecutionRecordPostInsertBoundaryInput | null;
  postInsertBoundaryResult?: ExecutionRecordPostInsertBoundaryResult | null;
  postInsertValidatorResult?: ExecutionRecordPostInsertBoundaryValidationResult | null;
  postInsertOrchestratorResult?: ExecutionRecordPostInsertOrchestratorResult | null;
  auditCorrectionMetadata?: ExecutionRecordPersistenceAuditMetadata | null;
  schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
  executionRecordEvidencePresent: boolean;
  evidenceProvenancePresent: boolean;
  actorSourceMetadataPresent: boolean;
  timestampSourceClockMetadataPresent: boolean;
  generatedTypesProofPresent: boolean;
  migrationProofPresent: boolean;
  rlsSecurityProofPresent: boolean;
  serverOnlyProofPresent: boolean;
  auditSchemaProofPresent: boolean;
  sourceReferences: string[];
  blockedReasons: ExecutionRecordAuditAppendBoundaryBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendIdempotencySummary = {
  executionRecordId?: string | null;
  auditEventKey?: string | null;
  idempotencyKey?: string | null;
  sourceEventFingerprint?: string | null;
  candidateFingerprint?: string | null;
  idempotencyMetadataPresent: boolean;
  stableAuditEventKeyPresent: boolean;
  sourceEventFingerprintPresent: boolean;
  safeToRetry: false;
  retryRequiresManualReview: true;
  blockedReasons: ExecutionRecordAuditAppendBoundaryBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendDuplicatePreventionSummary = {
  duplicatePreventionKey?: string | null;
  duplicatePreventionMetadataPresent: boolean;
  duplicateMatches: ExecutionRecordDuplicateMatch[];
  duplicateAuditEventDetected: boolean;
  duplicateAuditEventBlocked: boolean;
  duplicateLookupRequiredBeforeWrite: true;
  blockedReasons: ExecutionRecordAuditAppendBoundaryBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendFailureModelSummary = {
  auditBlockedAfterInsertSuccessRepresented: boolean;
  auditDuplicateDetectedRepresented: boolean;
  auditValidationFailedRepresented: boolean;
  futureAuditWriteFailedRepresented: boolean;
  auditRetryBlockedWithoutIdempotencyRepresented: boolean;
  downstreamActionsRemainBlockedRepresented: boolean;
  partialFailureModelPresent: boolean;
  hiddenPartialFailureAllowed: false;
  manualReviewRequiredForPartialFailure: true;
  blockedReasons: ExecutionRecordAuditAppendBoundaryBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendDependencySummary = {
  auditAppendBoundaryContractPresent: true;
  auditAppendValidatorContractPresent: boolean;
  auditAppendValidatorPresent: boolean;
  auditAppendImplementationPresent: false;
  auditWriterPresent: false;
  auditWritePathPresent: false;
  productionInsertRouteImplemented: boolean;
  productionInsertWritePathPresent: boolean;
  postInsertBoundaryContractPresent: boolean;
  postInsertValidatorPresent: boolean;
  postInsertOrchestratorImplemented: false;
  generatedTypesPresent: boolean;
  migrationApplicationProven: boolean;
  rlsSecurityVerified: boolean;
  serverOnlyBoundaryVerified: boolean;
  auditSchemaProofPresent: boolean;
  blockedReasons: ExecutionRecordAuditAppendBoundaryBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendBoundaryInput = {
  contractVersion: ExecutionRecordAuditAppendBoundaryContractVersion;
  requestedAt: string;
  requestedBy?: string | null;
  executionRecordId?: string | null;
  executionRecordReference?: PersistedExecutionRecordReference | null;
  insertedExecutionRecordSummary?: Record<string, unknown> | null;
  executionRecordEvidence?: ExecutionRecordAuditAppendEvidenceSummary | null;
  normalizedExecutionRecordInput?: ExecutionRecordPersistenceInput | null;
  productionInsertRouteResultMetadata?: Record<string, unknown> | null;
  productionInsertBoundaryResult?: ExecutionRecordProductionInsertRouteBoundaryResult | null;
  postInsertBoundaryInput?: ExecutionRecordPostInsertBoundaryInput | null;
  postInsertBoundaryResult?: ExecutionRecordPostInsertBoundaryResult | null;
  postInsertValidatorResult?: ExecutionRecordPostInsertBoundaryValidationResult | null;
  postInsertOrchestratorResult?: ExecutionRecordPostInsertOrchestratorResult | null;
  auditEventType?: string | null;
  auditEventSource?: string | null;
  auditEventPayloadSummary?: Record<string, unknown> | null;
  actorSourceMetadata?: Record<string, unknown> | null;
  timestampSourceClockMetadata?: Record<string, unknown> | null;
  idempotencyKey?: string | null;
  duplicatePreventionKey?: string | null;
  generatedTypesProof?: Record<string, unknown> | null;
  migrationProof?: Record<string, unknown> | null;
  rlsSecurityProof?: Record<string, unknown> | null;
  serverOnlyProof?: Record<string, unknown> | null;
  auditSchemaProof?: Record<string, unknown> | null;
  manualReviewMetadata?: FinalizationActionValidatorManualApprovalContext | null;
  failureRetryMetadata?: Record<string, unknown> | null;
  candidate: ExecutionRecordAuditAppendEventCandidateSummary;
  evidence: ExecutionRecordAuditAppendEvidenceSummary;
  idempotency: ExecutionRecordAuditAppendIdempotencySummary;
  duplicatePrevention: ExecutionRecordAuditAppendDuplicatePreventionSummary;
  failureModel: ExecutionRecordAuditAppendFailureModelSummary;
  dependencies: ExecutionRecordAuditAppendDependencySummary;
  authority: ExecutionRecordAuditAppendBoundaryAuthorityFlags;
  safetyPolicy: ExecutionRecordAuditAppendBoundarySafetyPolicy;
  blockedReasons: ExecutionRecordAuditAppendBoundaryBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendBoundaryResult = {
  contractVersion: ExecutionRecordAuditAppendBoundaryContractVersion;
  status: ExecutionRecordAuditAppendBoundaryStatus;
  decisionRecommendation: ExecutionRecordAuditAppendBoundaryDecisionRecommendation;
  contractOnly: true;
  auditAppendImplemented: false;
  auditWriterImplemented: false;
  auditAppendAllowed: false;
  safeToAppendAudit: false;
  insertSuccessIsAuditAppendApproval: false;
  postInsertValidatorReadinessIsAuditAppendApproval: false;
  orchestratorContractReadinessIsAuditAppendApproval: false;
  auditSuccessApprovesStatsPnlUpdate: false;
  auditSuccessApprovesTradeMutation: false;
  auditSuccessApprovesTradeReconciliation: false;
  auditSuccessApprovesCorrectionRollback: false;
  auditSuccessApprovesUiUpdate: false;
  auditSuccessApprovesNotification: false;
  auditSuccessApprovesBrokerOrderFollowUp: false;
  auditSuccessApprovesAvanzaBrowserFollowUp: false;
  candidate: ExecutionRecordAuditAppendEventCandidateSummary;
  evidence: ExecutionRecordAuditAppendEvidenceSummary;
  idempotency: ExecutionRecordAuditAppendIdempotencySummary;
  duplicatePrevention: ExecutionRecordAuditAppendDuplicatePreventionSummary;
  failureModel: ExecutionRecordAuditAppendFailureModelSummary;
  dependencies: ExecutionRecordAuditAppendDependencySummary;
  authority: ExecutionRecordAuditAppendBoundaryAuthorityFlags;
  safetyPolicy: ExecutionRecordAuditAppendBoundarySafetyPolicy;
  recommendedNextManualReview?: string | null;
  blockedReasons: ExecutionRecordAuditAppendBoundaryBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};
