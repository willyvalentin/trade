import type {
  ExecutionRecordAuditAppendBoundaryAuthorityFlags,
  ExecutionRecordAuditAppendBoundaryInput,
  ExecutionRecordAuditAppendBoundaryResult,
  ExecutionRecordAuditAppendBoundarySafetyPolicy,
  ExecutionRecordAuditAppendDuplicatePreventionSummary,
  ExecutionRecordAuditAppendEventCandidateSummary,
  ExecutionRecordAuditAppendEvidenceSummary,
  ExecutionRecordAuditAppendFailureModelSummary,
  ExecutionRecordAuditAppendIdempotencySummary,
} from "@/lib/execution-record-audit-append-boundary-contract";
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
  ExecutionRecordPersistenceInput,
  PersistedExecutionRecordReference,
} from "@/lib/execution-record-persistence-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Audit append boundary validator contract metadata only. These types and
// constants do not implement audit validation logic, append audit data, write
// audit records, call routes, create execution records, persist/write, write
// Supabase/localStorage, update stats/PnL, roll back/correct, mutate or
// reconcile trades, update UI, notify users, run broker/order behavior,
// automate Avanza/browser behavior, or enable automatic mode. Audit validation
// readiness is not audit append execution.

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATOR_CONTRACT_VERSION =
  "execution_record_audit_append_boundary_validator_v1" as const;

export type ExecutionRecordAuditAppendBoundaryValidatorContractVersion =
  typeof EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATOR_CONTRACT_VERSION;

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_STATUSES = [
  "audit_append_boundary_validation_ready_for_design_only",
  "audit_append_boundary_validation_blocked",
  "audit_append_boundary_validation_needs_review",
  "audit_append_boundary_validation_invalid",
  "audit_append_boundary_validation_absent",
] as const;

export type ExecutionRecordAuditAppendBoundaryValidationStatus =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_STATUSES)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_DECISION_RECOMMENDATIONS =
  [
    "design_only_do_not_append_audit",
    "blocked_do_not_append_audit",
    "needs_manual_review",
    "invalid_do_not_append_audit",
    "future_audit_validator_required",
  ] as const;

export type ExecutionRecordAuditAppendBoundaryValidationDecisionRecommendation =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_BLOCKED_REASONS =
  [
    "audit_boundary_input_missing",
    "execution_record_reference_missing",
    "inserted_execution_record_summary_missing",
    "execution_record_evidence_missing",
    "evidence_provenance_missing",
    "audit_event_type_missing",
    "audit_event_source_missing",
    "audit_event_payload_missing",
    "actor_source_metadata_missing",
    "timestamp_source_metadata_missing",
    "idempotency_key_missing",
    "duplicate_prevention_key_missing",
    "generated_types_absent_or_unknown",
    "migration_application_not_proven",
    "rls_security_unverified",
    "server_only_boundary_unverified",
    "audit_schema_table_unverified",
    "manual_review_required",
    "insert_success_misinterpreted_as_audit_approval",
    "post_insert_validator_readiness_misinterpreted_as_audit_approval",
    "orchestrator_contract_readiness_misinterpreted_as_audit_approval",
    "audit_boundary_contract_readiness_misinterpreted_as_audit_approval",
    "audit_append_requested_in_validator_phase",
    "stats_pnl_update_requested",
    "trade_mutation_requested",
    "trade_reconciliation_requested",
    "rollback_correction_requested",
    "ui_update_requested",
    "notification_requested",
    "broker_or_avanza_action_requested",
    "automatic_mode_requested",
  ] as const;

export type ExecutionRecordAuditAppendBoundaryValidationBlockedReason =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_WARNINGS = [
  "contract_only",
  "audit_validator_not_implemented",
  "audit_append_not_implemented",
  "audit_writer_not_implemented",
  "audit_validation_readiness_not_audit_append_execution",
  "insert_success_not_audit_append_approval",
  "post_insert_validator_readiness_not_audit_append_approval",
  "orchestrator_contract_readiness_not_audit_append_approval",
  "audit_boundary_contract_readiness_not_audit_append_approval",
  "audit_validation_success_not_stats_pnl_approval",
  "audit_validation_success_not_trade_mutation_approval",
  "audit_validation_success_not_trade_reconciliation_approval",
  "audit_validation_success_not_rollback_approval",
  "audit_validation_success_not_ui_update_approval",
  "audit_validation_success_not_notification_approval",
  "audit_validation_success_not_broker_order_approval",
  "audit_validation_success_not_avanza_browser_approval",
  "audit_validation_success_not_automatic_mode_approval",
  "idempotency_required",
  "duplicate_prevention_required",
  "evidence_provenance_required",
  "audit_schema_must_be_proven_before_write",
  "generated_types_required_before_audit_append",
  "migration_application_required_before_audit_append",
  "rls_security_required_before_audit_append",
  "server_only_boundary_required_before_audit_append",
  "manual_review_may_be_required",
  "automatic_mode_not_enabled",
] as const;

export type ExecutionRecordAuditAppendBoundaryValidationWarning =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_WARNINGS)[number];

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_REVIEW_ITEMS = [
  "audit_append_boundary_validator_contract_review",
  "audit_boundary_input_review",
  "execution_record_reference_review",
  "inserted_execution_record_summary_review",
  "execution_record_evidence_review",
  "audit_event_candidate_validation_review",
  "evidence_provenance_validation_review",
  "idempotency_validation_review",
  "duplicate_prevention_validation_review",
  "audit_schema_validation_review",
  "security_server_only_validation_review",
  "dependency_validation_review",
  "failure_model_validation_review",
  "authority_flags_review",
  "manual_review",
  "downstream_authority_review",
  "broker_avanza_safety_review",
] as const;

export type ExecutionRecordAuditAppendBoundaryValidationReviewItem =
  (typeof EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_REVIEW_ITEMS)[number];

export type ExecutionRecordAuditAppendBoundaryValidationAuthorityFlags = {
  validationOnly: true;
  designOnly: true;
  auditValidatorImplemented: false;
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

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_DEFAULT_AUTHORITY_FLAGS =
  {
    validationOnly: true,
    designOnly: true,
    auditValidatorImplemented: false,
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
  } as const satisfies ExecutionRecordAuditAppendBoundaryValidationAuthorityFlags;

export type ExecutionRecordAuditAppendBoundaryValidationSafetyPolicy =
  ExecutionRecordAuditAppendBoundaryValidationAuthorityFlags & {
    auditValidationReadinessIsAuditAppendExecution: false;
    insertSuccessIsAuditAppendApproval: false;
    postInsertValidatorReadinessIsAuditAppendApproval: false;
    orchestratorContractReadinessIsAuditAppendApproval: false;
    auditBoundaryContractReadinessIsAuditAppendApproval: false;
    auditValidationSuccessApprovesStatsPnlUpdate: false;
    auditValidationSuccessApprovesTradeMutation: false;
    auditValidationSuccessApprovesTradeReconciliation: false;
    auditValidationSuccessApprovesCorrectionRollback: false;
    auditValidationSuccessApprovesUiUpdate: false;
    auditValidationSuccessApprovesNotification: false;
    auditValidationSuccessApprovesBrokerOrderFollowUp: false;
    auditValidationSuccessApprovesAvanzaBrowserFollowUp: false;
    auditSchemaMustBeProvenBeforeWrite: true;
    generatedTypesRequiredBeforeAuditAppend: true;
    migrationProofRequiredBeforeAuditAppend: true;
    rlsSecurityRequiredBeforeAuditAppend: true;
    serverOnlyBoundaryRequiredBeforeAuditAppend: true;
    idempotencyRequired: true;
    duplicatePreventionRequired: true;
    evidenceProvenanceRequired: true;
    manualReviewSupported: true;
    noImplicitChainedActions: true;
    brokerAvanzaDisabledUnlessSeparatelyApproved: true;
    noHiddenAutomaticMode: true;
    boundaryAuthority?: ExecutionRecordAuditAppendBoundaryAuthorityFlags | null;
    boundarySafetyPolicy?: ExecutionRecordAuditAppendBoundarySafetyPolicy | null;
    policyReason: string;
  };

export const EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_DEFAULT_SAFETY_POLICY =
  {
    ...EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
    auditValidationReadinessIsAuditAppendExecution: false,
    insertSuccessIsAuditAppendApproval: false,
    postInsertValidatorReadinessIsAuditAppendApproval: false,
    orchestratorContractReadinessIsAuditAppendApproval: false,
    auditBoundaryContractReadinessIsAuditAppendApproval: false,
    auditValidationSuccessApprovesStatsPnlUpdate: false,
    auditValidationSuccessApprovesTradeMutation: false,
    auditValidationSuccessApprovesTradeReconciliation: false,
    auditValidationSuccessApprovesCorrectionRollback: false,
    auditValidationSuccessApprovesUiUpdate: false,
    auditValidationSuccessApprovesNotification: false,
    auditValidationSuccessApprovesBrokerOrderFollowUp: false,
    auditValidationSuccessApprovesAvanzaBrowserFollowUp: false,
    auditSchemaMustBeProvenBeforeWrite: true,
    generatedTypesRequiredBeforeAuditAppend: true,
    migrationProofRequiredBeforeAuditAppend: true,
    rlsSecurityRequiredBeforeAuditAppend: true,
    serverOnlyBoundaryRequiredBeforeAuditAppend: true,
    idempotencyRequired: true,
    duplicatePreventionRequired: true,
    evidenceProvenanceRequired: true,
    manualReviewSupported: true,
    noImplicitChainedActions: true,
    brokerAvanzaDisabledUnlessSeparatelyApproved: true,
    noHiddenAutomaticMode: true,
    policyReason:
      "Audit append boundary validator contracts are validation-only. Audit validation readiness is not audit append execution, and validation success does not approve downstream actions.",
  } as const satisfies ExecutionRecordAuditAppendBoundaryValidationSafetyPolicy;

export type ExecutionRecordAuditAppendEventCandidateValidationSummary = {
  candidate?: ExecutionRecordAuditAppendEventCandidateSummary | null;
  auditEventTypePresent: boolean;
  auditEventSourcePresent: boolean;
  auditEventPayloadSummaryPresent: boolean;
  actorSourceMetadataPresent: boolean;
  timestampSourceClockMetadataPresent: boolean;
  payloadExplainable: boolean;
  noSecretPayloadExposure: boolean;
  noLocalOnlySourceOfTruth: boolean;
  noBrokerAvanzaAssumptions: boolean;
  blockedReasons: ExecutionRecordAuditAppendBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendEvidenceValidationSummary = {
  evidence?: ExecutionRecordAuditAppendEvidenceSummary | null;
  executionRecordId?: string | null;
  executionRecordReference?: PersistedExecutionRecordReference | null;
  insertedExecutionRecordSummary?: Record<string, unknown> | null;
  normalizedExecutionRecordInput?: ExecutionRecordPersistenceInput | null;
  productionInsertBoundaryResult?: ExecutionRecordProductionInsertRouteBoundaryResult | null;
  postInsertBoundaryInput?: ExecutionRecordPostInsertBoundaryInput | null;
  postInsertBoundaryResult?: ExecutionRecordPostInsertBoundaryResult | null;
  postInsertValidatorResult?: ExecutionRecordPostInsertBoundaryValidationResult | null;
  postInsertOrchestratorResult?: ExecutionRecordPostInsertOrchestratorResult | null;
  executionRecordReferencePresent: boolean;
  insertedExecutionRecordSummaryPresent: boolean;
  executionRecordEvidencePresent: boolean;
  evidenceProvenancePresent: boolean;
  sourceReferencesPresent: boolean;
  blockedReasons: ExecutionRecordAuditAppendBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendIdempotencyValidationSummary = {
  idempotency?: ExecutionRecordAuditAppendIdempotencySummary | null;
  idempotencyKey?: string | null;
  auditEventKey?: string | null;
  sourceEventFingerprint?: string | null;
  candidateFingerprint?: string | null;
  idempotencyKeyPresent: boolean;
  stableAuditEventKeyPresent: boolean;
  sourceEventFingerprintPresent: boolean;
  retrySafetyPresent: boolean;
  safeToRetry: false;
  retryRequiresManualReview: true;
  blockedReasons: ExecutionRecordAuditAppendBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendDuplicatePreventionValidationSummary = {
  duplicatePrevention?: ExecutionRecordAuditAppendDuplicatePreventionSummary | null;
  duplicatePreventionKey?: string | null;
  duplicatePreventionKeyPresent: boolean;
  duplicatePreventionMetadataPresent: boolean;
  duplicateMatches: ExecutionRecordDuplicateMatch[];
  duplicateAuditEventDetected: boolean;
  duplicateAuditEventBlocked: boolean;
  duplicateLookupRequiredBeforeWrite: true;
  blockedReasons: ExecutionRecordAuditAppendBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendSchemaValidationSummary = {
  auditSchemaProof?: Record<string, unknown> | null;
  generatedTypesProof?: Record<string, unknown> | null;
  migrationProof?: Record<string, unknown> | null;
  auditSchemaTableVerified: boolean;
  auditGeneratedTypesPresent: boolean;
  executionRecordGeneratedTypesPresent: boolean;
  migrationApplicationProven: boolean;
  auditSchemaAssumedWithoutProof: boolean;
  safeToWriteAudit: false;
  blockedReasons: ExecutionRecordAuditAppendBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendSecurityServerOnlyValidationSummary = {
  rlsSecurityProof?: Record<string, unknown> | null;
  serverOnlyProof?: Record<string, unknown> | null;
  rlsSecurityVerified: boolean;
  serverOnlyBoundaryVerified: boolean;
  clientSideAuditWriteBlocked: boolean;
  serviceRoleExposureBlocked: boolean;
  safeToWriteFromClient: false;
  safeToUseServiceRoleInClient: false;
  blockedReasons: ExecutionRecordAuditAppendBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendDependencyValidationSummary = {
  auditBoundaryContractPresent: boolean;
  auditBoundaryInputPresent: boolean;
  auditBoundaryResultPresent: boolean;
  auditValidatorContractPresent: true;
  auditValidatorImplemented: false;
  auditAppendImplemented: false;
  auditWriterImplemented: false;
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
  auditSchemaTableVerified: boolean;
  blockedReasons: ExecutionRecordAuditAppendBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendFailureModelValidationSummary = {
  failureModel?: ExecutionRecordAuditAppendFailureModelSummary | null;
  validationBlockedRepresented: boolean;
  validationInvalidRepresented: boolean;
  duplicateAuditCandidateRepresented: boolean;
  missingProofRepresented: boolean;
  futureAppendWriteFailureRepresented: boolean;
  retryBlockedWithoutIdempotencyRepresented: boolean;
  manualReviewRequiredRepresented: boolean;
  downstreamActionsRemainBlockedRepresented: boolean;
  hiddenFailureAllowed: false;
  blockedReasons: ExecutionRecordAuditAppendBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendBoundaryValidationInput = {
  contractVersion: ExecutionRecordAuditAppendBoundaryValidatorContractVersion;
  requestedAt: string;
  requestedBy?: string | null;
  auditBoundaryInput?: ExecutionRecordAuditAppendBoundaryInput | null;
  auditBoundaryResult?: ExecutionRecordAuditAppendBoundaryResult | null;
  auditEventCandidate?: ExecutionRecordAuditAppendEventCandidateSummary | null;
  executionRecordId?: string | null;
  executionRecordReference?: PersistedExecutionRecordReference | null;
  insertedExecutionRecordSummary?: Record<string, unknown> | null;
  executionRecordEvidence?: ExecutionRecordAuditAppendEvidenceSummary | null;
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
  auditSchemaTableProof?: Record<string, unknown> | null;
  manualReviewMetadata?: FinalizationActionValidatorManualApprovalContext | null;
  failureRetryMetadata?: Record<string, unknown> | null;
  boundaryAuthority?: ExecutionRecordAuditAppendBoundaryAuthorityFlags | null;
  boundarySafetyPolicy?: ExecutionRecordAuditAppendBoundarySafetyPolicy | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordAuditAppendBoundaryValidationResult = {
  contractVersion: ExecutionRecordAuditAppendBoundaryValidatorContractVersion;
  status: ExecutionRecordAuditAppendBoundaryValidationStatus;
  decisionRecommendation: ExecutionRecordAuditAppendBoundaryValidationDecisionRecommendation;
  validationOnly: true;
  designOnly: true;
  auditValidatorImplemented: false;
  auditValidationReadinessIsAuditAppendExecution: false;
  auditAppendAllowed: false;
  safeToAppendAudit: false;
  auditValidationSuccessApprovesStatsPnlUpdate: false;
  auditValidationSuccessApprovesTradeMutation: false;
  auditValidationSuccessApprovesTradeReconciliation: false;
  auditValidationSuccessApprovesCorrectionRollback: false;
  auditValidationSuccessApprovesUiUpdate: false;
  auditValidationSuccessApprovesNotification: false;
  auditValidationSuccessApprovesBrokerOrderFollowUp: false;
  auditValidationSuccessApprovesAvanzaBrowserFollowUp: false;
  candidate: ExecutionRecordAuditAppendEventCandidateValidationSummary;
  evidence: ExecutionRecordAuditAppendEvidenceValidationSummary;
  idempotency: ExecutionRecordAuditAppendIdempotencyValidationSummary;
  duplicatePrevention: ExecutionRecordAuditAppendDuplicatePreventionValidationSummary;
  schema: ExecutionRecordAuditAppendSchemaValidationSummary;
  securityServerOnly: ExecutionRecordAuditAppendSecurityServerOnlyValidationSummary;
  dependencies: ExecutionRecordAuditAppendDependencyValidationSummary;
  failureModel: ExecutionRecordAuditAppendFailureModelValidationSummary;
  authority: ExecutionRecordAuditAppendBoundaryValidationAuthorityFlags;
  safetyPolicy: ExecutionRecordAuditAppendBoundaryValidationSafetyPolicy;
  blockedReasons: ExecutionRecordAuditAppendBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordAuditAppendBoundaryValidationWarning[];
  reviewItems: ExecutionRecordAuditAppendBoundaryValidationReviewItem[];
  recommendedNextManualReview?: string | null;
  metadata?: Record<string, unknown>;
};
