import type {
  ExecutionRecordInsertRouteActualValidatorSummary,
  ExecutionRecordInsertRouteAuditCorrectionSummary,
  ExecutionRecordInsertRouteDryRunProductionSeparationSummary,
  ExecutionRecordInsertRouteEvidenceProvenanceSummary,
  ExecutionRecordInsertRouteGeneratedTypesSummary,
  ExecutionRecordInsertRouteIdempotencyDuplicateSummary,
  ExecutionRecordInsertRouteManualApprovalSummary,
  ExecutionRecordInsertRouteMigrationSummary,
  ExecutionRecordInsertRouteNormalizedInputSummary,
  ExecutionRecordInsertRoutePostInsertBoundarySummary,
  ExecutionRecordInsertRouteReadinessInput,
  ExecutionRecordInsertRouteReadinessResult,
  ExecutionRecordInsertRouteRlsSecuritySummary,
  ExecutionRecordInsertRouteSchemaReadinessSummary,
  ExecutionRecordInsertRouteServerOnlyBoundarySummary,
  ExecutionRecordInsertRouteServerOnlyRequestContext,
} from "@/lib/execution-record-insert-route-readiness-boundary-contract";
import type {
  ExecutionRecordInsertRouteReadinessValidationResult,
} from "@/lib/execution-record-insert-route-readiness-boundary-validator-contract";
import type {
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceInput,
  ExecutionRecordPersistenceSchemaReference,
  PersistedExecutionRecordReference,
} from "@/lib/execution-record-persistence-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Future insert route call implementation contract metadata only. These types
// describe a later server-only route-call wrapper. They do not implement the
// wrapper, call insert routes, create execution records, persist, write
// Supabase/localStorage, append audit records, update stats/PnL, roll back,
// mutate trades, wire UI, capture browser/Avanza behavior, run broker actions,
// or enable automatic mode.

export const EXECUTION_RECORD_INSERT_ROUTE_CALL_IMPLEMENTATION_CONTRACT_VERSION =
  "execution_record_insert_route_call_implementation_v1" as const;

export type ExecutionRecordInsertRouteCallImplementationContractVersion =
  typeof EXECUTION_RECORD_INSERT_ROUTE_CALL_IMPLEMENTATION_CONTRACT_VERSION;

export const EXECUTION_RECORD_INSERT_ROUTE_CALL_STATUSES = [
  "insert_route_call_prepared",
  "insert_route_call_blocked",
  "insert_route_call_needs_review",
  "insert_route_call_invalid",
  "insert_route_call_not_called",
  "insert_route_call_dry_run_only",
] as const;

export type ExecutionRecordInsertRouteCallStatus =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_CALL_STATUSES)[number];

export const EXECUTION_RECORD_INSERT_ROUTE_CALL_DECISION_RECOMMENDATIONS = [
  "may_call_insert_route_only",
  "dry_run_only_do_not_persist",
  "needs_manual_review",
  "blocked_do_not_call_insert_route",
  "invalid_do_not_call_insert_route",
  "not_called",
] as const;

export type ExecutionRecordInsertRouteCallDecisionRecommendation =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_CALL_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_INSERT_ROUTE_CALL_ROUTE_MODES = [
  "dry_run",
  "production",
  "not_selected",
] as const;

export type ExecutionRecordInsertRouteCallRouteMode =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_CALL_ROUTE_MODES)[number];

export const EXECUTION_RECORD_INSERT_ROUTE_CALL_BLOCKED_REASONS = [
  "missing_insert_readiness_validation_result",
  "insert_readiness_not_ready",
  "insert_readiness_decision_not_prepare_only",
  "missing_normalized_persistence_input",
  "missing_insert_route_callable",
  "generated_types_absent_or_unknown",
  "migration_application_not_proven",
  "schema_readiness_absent_or_unknown",
  "missing_rls_security_proof",
  "missing_server_only_request_context",
  "missing_server_only_write_boundary",
  "missing_duplicate_prevention_metadata",
  "missing_idempotency_metadata",
  "missing_audit_correction_metadata",
  "missing_source_evidence",
  "missing_manual_approval",
  "missing_route_mode",
  "dry_run_route_not_production_insert",
  "production_route_unavailable",
  "client_side_insert_not_allowed",
  "automatic_mode_not_allowed",
  "post_insert_mutation_not_allowed",
  "broker_or_avanza_action_not_allowed",
  "insert_route_callable_failed",
] as const;

export type ExecutionRecordInsertRouteCallBlockedReason =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_CALL_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_INSERT_ROUTE_CALL_WARNINGS = [
  "contract_only",
  "implementation_not_created",
  "insert_route_not_called",
  "insert_route_call_not_full_persistence_workflow",
  "route_success_not_post_insert_mutation_approval",
  "dry_run_route_not_production_route",
  "production_route_requires_server_only_boundary",
  "generated_types_required_before_insert",
  "migration_application_required_before_insert",
  "rls_security_required_before_insert",
  "server_only_boundary_required_before_insert",
  "duplicate_prevention_required_before_insert",
  "audit_required_before_post_insert_mutation",
  "stats_update_out_of_scope",
  "trade_mutation_out_of_scope",
  "broker_avanza_action_out_of_scope",
] as const;

export type ExecutionRecordInsertRouteCallWarning =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_CALL_WARNINGS)[number];

export const EXECUTION_RECORD_INSERT_ROUTE_CALL_REVIEW_ITEMS = [
  "insert_readiness_validation_review",
  "normalized_persistence_input_review",
  "schema_generated_types_migration_review",
  "rls_security_server_only_review",
  "idempotency_duplicate_review",
  "audit_correction_review",
  "evidence_provenance_review",
  "manual_approval_review",
  "dry_run_production_mode_review",
  "route_mode_review",
  "route_output_review",
  "post_insert_boundary_review",
  "future_insert_route_implementation_review",
  "production_write_boundary_review",
] as const;

export type ExecutionRecordInsertRouteCallReviewItem =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_CALL_REVIEW_ITEMS)[number];

export type ExecutionRecordInsertRouteCallRouteModeMetadata = {
  mode: ExecutionRecordInsertRouteCallRouteMode;
  routeName?: string | null;
  dryRunRouteName?: string | null;
  productionRouteName?: string | null;
  requestedAt?: string | null;
  requestedBy?: string | null;
  serverOnlyRequestContext?: ExecutionRecordInsertRouteServerOnlyRequestContext | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteCallPreconditionSummary = {
  readinessValidationReady: boolean;
  readinessDecisionPrepareOnly: boolean;
  normalizedPersistenceInputPresent: boolean;
  generatedTypesPresent: boolean;
  migrationApplicationProven: boolean;
  schemaReadinessProven: boolean;
  rlsSecurityProofPresent: boolean;
  serverOnlyRequestContextPresent: boolean;
  serverOnlyWriteBoundaryProven: boolean;
  duplicatePreventionMetadataPresent: boolean;
  idempotencyMetadataPresent: boolean;
  auditCorrectionMetadataPresent: boolean;
  sourceEvidencePresent: boolean;
  manualApprovalSatisfied: boolean;
  dryRunRouteStatusKnown: boolean;
  productionRouteSeparatedFromDryRun: boolean;
  postInsertAuthoritiesFalse: boolean;
  automaticModeDisabled: boolean;
  blockedReasons: ExecutionRecordInsertRouteCallBlockedReason[];
  warnings: ExecutionRecordInsertRouteCallWarning[];
  reviewItems: ExecutionRecordInsertRouteCallReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteCallReadinessSummary = {
  readinessValidationResult?: ExecutionRecordInsertRouteReadinessValidationResult | null;
  readinessInput?: ExecutionRecordInsertRouteReadinessInput | null;
  readinessResult?: ExecutionRecordInsertRouteReadinessResult | null;
  readinessValidationResultPresent: boolean;
  readinessValidationReady: boolean;
  readinessDecisionPrepareOnly: boolean;
  mayPrepareInsertRouteCallOnly: boolean;
  mayPrepareIsNotInsertExecution: true;
  insertRouteCalledByReadiness: false;
  blockedReasons: ExecutionRecordInsertRouteCallBlockedReason[];
  warnings: ExecutionRecordInsertRouteCallWarning[];
  reviewItems: ExecutionRecordInsertRouteCallReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteCallNormalizedInputSummary = {
  normalizedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  readinessNormalizedInputSummary?: ExecutionRecordInsertRouteNormalizedInputSummary | null;
  normalizedPersistenceInputPresent: boolean;
  requiredPersistenceFieldsPresent: boolean;
  idempotencyKeyPresent: boolean;
  recordFingerprintPresent: boolean;
  sourceFingerprintPresent: boolean;
  brokerConfirmationPresent: boolean;
  associationPresent: boolean;
  userContextPresent: boolean;
  safetyChecklistPresent: boolean;
  auditMetadataPresent: boolean;
  blockedReasons: ExecutionRecordInsertRouteCallBlockedReason[];
  warnings: ExecutionRecordInsertRouteCallWarning[];
  reviewItems: ExecutionRecordInsertRouteCallReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteCallSchemaGeneratedTypesMigrationSummary =
  {
    schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
    schemaReadinessSummary?: ExecutionRecordInsertRouteSchemaReadinessSummary | null;
    generatedTypesSummary?: ExecutionRecordInsertRouteGeneratedTypesSummary | null;
    migrationSummary?: ExecutionRecordInsertRouteMigrationSummary | null;
    schemaReadyForInsert: boolean;
    generatedTypesPresent: boolean;
    executionRecordsTableTyped: boolean;
    migrationApplicationProven: boolean;
    expectedTableName: "execution_records";
    blockedReasons: ExecutionRecordInsertRouteCallBlockedReason[];
    warnings: ExecutionRecordInsertRouteCallWarning[];
    reviewItems: ExecutionRecordInsertRouteCallReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordInsertRouteCallRlsSecurityServerOnlySummary = {
  rlsSecuritySummary?: ExecutionRecordInsertRouteRlsSecuritySummary | null;
  serverOnlyBoundarySummary?: ExecutionRecordInsertRouteServerOnlyBoundarySummary | null;
  serverOnlyRequestContext?: ExecutionRecordInsertRouteServerOnlyRequestContext | null;
  rlsSecurityProofPresent: boolean;
  serverOnlyBoundaryProofPresent: boolean;
  serverOnlyRequestContextPresent: boolean;
  clientSideInsertAllowed: false;
  browserAutomationAllowed: false;
  brokerAutomationAllowed: false;
  blockedReasons: ExecutionRecordInsertRouteCallBlockedReason[];
  warnings: ExecutionRecordInsertRouteCallWarning[];
  reviewItems: ExecutionRecordInsertRouteCallReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteCallIdempotencyDuplicateSummary = {
  idempotencyDuplicateSummary?: ExecutionRecordInsertRouteIdempotencyDuplicateSummary | null;
  idempotencyKey?: string | null;
  recordFingerprint?: string | null;
  sourceFingerprint?: string | null;
  duplicateMatches: ExecutionRecordDuplicateMatch[];
  idempotencyMetadataPresent: boolean;
  duplicatePreventionMetadataPresent: boolean;
  duplicateDetected: boolean;
  duplicateBlocksInsert: boolean;
  blockedReasons: ExecutionRecordInsertRouteCallBlockedReason[];
  warnings: ExecutionRecordInsertRouteCallWarning[];
  reviewItems: ExecutionRecordInsertRouteCallReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteCallAuditCorrectionSummary = {
  auditCorrectionSummary?: ExecutionRecordInsertRouteAuditCorrectionSummary | null;
  auditCorrectionMetadataPresent: boolean;
  auditAppendAllowed: false;
  correctionAllowed: false;
  rollbackAllowed: false;
  postInsertAuditRequiresSeparateBoundary: true;
  blockedReasons: ExecutionRecordInsertRouteCallBlockedReason[];
  warnings: ExecutionRecordInsertRouteCallWarning[];
  reviewItems: ExecutionRecordInsertRouteCallReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteCallEvidenceProvenanceSummary = {
  evidenceProvenanceSummary?: ExecutionRecordInsertRouteEvidenceProvenanceSummary | null;
  actualValidatorSummary?: ExecutionRecordInsertRouteActualValidatorSummary | null;
  sourceEvidencePresent: boolean;
  sourceFingerprintPresent: boolean;
  brokerConfirmationEvidencePresent: boolean;
  provenanceMetadataPresent: boolean;
  blockedReasons: ExecutionRecordInsertRouteCallBlockedReason[];
  warnings: ExecutionRecordInsertRouteCallWarning[];
  reviewItems: ExecutionRecordInsertRouteCallReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteCallManualApprovalSummary = {
  manualApprovalSummary?: ExecutionRecordInsertRouteManualApprovalSummary | null;
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  manualApprovalRequired: boolean;
  manualApprovalSatisfied: boolean;
  automaticModeAllowed: false;
  automaticModeDisabled: true;
  blockedReasons: ExecutionRecordInsertRouteCallBlockedReason[];
  warnings: ExecutionRecordInsertRouteCallWarning[];
  reviewItems: ExecutionRecordInsertRouteCallReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteCallDryRunProductionModeSummary = {
  dryRunProductionSeparationSummary?: ExecutionRecordInsertRouteDryRunProductionSeparationSummary | null;
  routeMode: ExecutionRecordInsertRouteCallRouteMode;
  dryRunRouteKnown: boolean;
  dryRunRouteOnly: boolean;
  dryRunRouteIsProductionInsert: false;
  dryRunSuccessIsNotProductionInsertSuccess: true;
  productionRouteAvailable: boolean;
  productionRouteSeparatedFromDryRun: boolean;
  productionRouteRequiresServerOnlyBoundary: true;
  productionRouteCallableFromDevPreview: false;
  blockedReasons: ExecutionRecordInsertRouteCallBlockedReason[];
  warnings: ExecutionRecordInsertRouteCallWarning[];
  reviewItems: ExecutionRecordInsertRouteCallReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteCallRouteOutputSummary = {
  routeMode: ExecutionRecordInsertRouteCallRouteMode;
  insertRouteCallAttempted: boolean;
  insertRouteCallStatus?: ExecutionRecordInsertRouteCallStatus | null;
  insertedExecutionRecordId?: string | null;
  insertedExecutionRecordReference?: PersistedExecutionRecordReference | null;
  dryRunResult?: Record<string, unknown> | null;
  routeValidationErrors: string[];
  duplicateDetectionResult?: ExecutionRecordInsertRouteCallIdempotencyDuplicateSummary | null;
  serverOnlyExecutionSummary?: ExecutionRecordInsertRouteCallRlsSecurityServerOnlySummary | null;
  blockedReasons: ExecutionRecordInsertRouteCallBlockedReason[];
  warnings: ExecutionRecordInsertRouteCallWarning[];
  reviewItems: ExecutionRecordInsertRouteCallReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteCallPostInsertBoundarySummary = {
  sourcePostInsertBoundarySummary?: ExecutionRecordInsertRoutePostInsertBoundarySummary | null;
  safeToAppendAudit: false;
  safeToUpdateStats: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  safeToRunBrokerAction: false;
  safeToRunAvanzaBrowserAction: false;
  automaticModeAllowed: false;
  auditAppendRequiresSeparateBoundary: true;
  statsUpdateRequiresSeparateBoundary: true;
  rollbackCorrectionRequiresSeparateBoundary: true;
  tradeMutationRequiresSeparateBoundary: true;
  brokerOrderRequiresSeparateBoundary: true;
  avanzaBrowserRequiresSeparateBoundary: true;
  blockedReasons: ExecutionRecordInsertRouteCallBlockedReason[];
  warnings: ExecutionRecordInsertRouteCallWarning[];
  reviewItems: ExecutionRecordInsertRouteCallReviewItem[];
  metadata?: Record<string, unknown>;
};

export const EXECUTION_RECORD_INSERT_ROUTE_CALL_DEFAULT_POST_INSERT_BOUNDARY = {
  safeToAppendAudit: false,
  safeToUpdateStats: false,
  safeToRollback: false,
  safeToMutateTrade: false,
  safeToRunBrokerAction: false,
  safeToRunAvanzaBrowserAction: false,
  automaticModeAllowed: false,
  auditAppendRequiresSeparateBoundary: true,
  statsUpdateRequiresSeparateBoundary: true,
  rollbackCorrectionRequiresSeparateBoundary: true,
  tradeMutationRequiresSeparateBoundary: true,
  brokerOrderRequiresSeparateBoundary: true,
  avanzaBrowserRequiresSeparateBoundary: true,
  blockedReasons: [],
  warnings: [
    "route_success_not_post_insert_mutation_approval",
    "stats_update_out_of_scope",
    "trade_mutation_out_of_scope",
    "broker_avanza_action_out_of_scope",
  ],
  reviewItems: ["post_insert_boundary_review"],
} as const satisfies ExecutionRecordInsertRouteCallPostInsertBoundarySummary;

export type ExecutionRecordInsertRouteCallableResult = {
  status: ExecutionRecordInsertRouteCallStatus;
  insertedExecutionRecordId?: string | null;
  insertedExecutionRecordReference?: PersistedExecutionRecordReference | null;
  dryRunResult?: Record<string, unknown> | null;
  routeValidationErrors?: string[];
  duplicateDetectionResult?: ExecutionRecordInsertRouteCallIdempotencyDuplicateSummary | null;
  serverOnlyExecutionSummary?: ExecutionRecordInsertRouteCallRlsSecurityServerOnlySummary | null;
  blockedReasons?: ExecutionRecordInsertRouteCallBlockedReason[];
  warnings?: ExecutionRecordInsertRouteCallWarning[];
  reviewItems?: ExecutionRecordInsertRouteCallReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteCallable = (
  input: ExecutionRecordInsertRouteCallInput,
) =>
  | ExecutionRecordInsertRouteCallableResult
  | Promise<ExecutionRecordInsertRouteCallableResult>;

export type ExecutionRecordInsertRouteCallSafetyPolicy = {
  contractOnly: true;
  implementationCreated: false;
  serverOnlyRequired: true;
  routeCallOnly: true;
  insertRouteCalled: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  safeToFinalize: false;
  safeToAppendAudit: false;
  safeToUpdateStats: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  safeToRunBrokerAction: false;
  safeToRunAvanzaBrowserAction: false;
  automaticModeAllowed: false;
  executionRecordCreationAttempted: false;
  persistenceAttempted: false;
  finalizationAttempted: false;
  auditAppendAttempted: false;
  statsUpdateAttempted: false;
  rollbackAttempted: false;
  tradeMutationAttempted: false;
  brokerAutomationAttempted: false;
  avanzaAutomationAttempted: false;
  browserAutomationAttempted: false;
  policyReason: string;
};

export const EXECUTION_RECORD_INSERT_ROUTE_CALL_DEFAULT_SAFETY_POLICY = {
  contractOnly: true,
  implementationCreated: false,
  serverOnlyRequired: true,
  routeCallOnly: true,
  insertRouteCalled: false,
  safeToCreateExecutionRecord: false,
  safeToPersist: false,
  safeToFinalize: false,
  safeToAppendAudit: false,
  safeToUpdateStats: false,
  safeToRollback: false,
  safeToMutateTrade: false,
  safeToRunBrokerAction: false,
  safeToRunAvanzaBrowserAction: false,
  automaticModeAllowed: false,
  executionRecordCreationAttempted: false,
  persistenceAttempted: false,
  finalizationAttempted: false,
  auditAppendAttempted: false,
  statsUpdateAttempted: false,
  rollbackAttempted: false,
  tradeMutationAttempted: false,
  brokerAutomationAttempted: false,
  avanzaAutomationAttempted: false,
  browserAutomationAttempted: false,
  policyReason:
    "Insert route call implementation contract types are contract-only. They do not implement a wrapper, call insert routes, create execution records, persist, finalize, append audit records, update stats/PnL, roll back, mutate trades, run broker actions, automate browser/Avanza behavior, or enable automatic mode.",
} as const satisfies ExecutionRecordInsertRouteCallSafetyPolicy;

export type ExecutionRecordInsertRouteCallInput = {
  contractVersion: ExecutionRecordInsertRouteCallImplementationContractVersion;
  requestedAt: string;
  routeMode: ExecutionRecordInsertRouteCallRouteMode;
  readinessValidationResult?: ExecutionRecordInsertRouteReadinessValidationResult | null;
  readinessInput?: ExecutionRecordInsertRouteReadinessInput | null;
  readinessResult?: ExecutionRecordInsertRouteReadinessResult | null;
  normalizedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  routeModeMetadata?: ExecutionRecordInsertRouteCallRouteModeMetadata | null;
  preconditionSummary?: ExecutionRecordInsertRouteCallPreconditionSummary | null;
  readinessSummary?: ExecutionRecordInsertRouteCallReadinessSummary | null;
  normalizedInputSummary?: ExecutionRecordInsertRouteCallNormalizedInputSummary | null;
  schemaGeneratedTypesMigrationSummary?: ExecutionRecordInsertRouteCallSchemaGeneratedTypesMigrationSummary | null;
  rlsSecurityServerOnlySummary?: ExecutionRecordInsertRouteCallRlsSecurityServerOnlySummary | null;
  idempotencyDuplicateSummary?: ExecutionRecordInsertRouteCallIdempotencyDuplicateSummary | null;
  auditCorrectionSummary?: ExecutionRecordInsertRouteCallAuditCorrectionSummary | null;
  evidenceProvenanceSummary?: ExecutionRecordInsertRouteCallEvidenceProvenanceSummary | null;
  manualApprovalSummary?: ExecutionRecordInsertRouteCallManualApprovalSummary | null;
  dryRunProductionModeSummary?: ExecutionRecordInsertRouteCallDryRunProductionModeSummary | null;
  postInsertBoundarySummary?: ExecutionRecordInsertRouteCallPostInsertBoundarySummary | null;
  safetyPolicy?: ExecutionRecordInsertRouteCallSafetyPolicy | null;
  insertRouteCallable?: ExecutionRecordInsertRouteCallable | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteCallResult = {
  contractVersion: ExecutionRecordInsertRouteCallImplementationContractVersion;
  evaluatedAt: string;
  status: ExecutionRecordInsertRouteCallStatus;
  decisionRecommendation: ExecutionRecordInsertRouteCallDecisionRecommendation;
  input: ExecutionRecordInsertRouteCallInput;
  preconditionSummary: ExecutionRecordInsertRouteCallPreconditionSummary;
  readinessSummary: ExecutionRecordInsertRouteCallReadinessSummary;
  normalizedInputSummary: ExecutionRecordInsertRouteCallNormalizedInputSummary;
  schemaGeneratedTypesMigrationSummary: ExecutionRecordInsertRouteCallSchemaGeneratedTypesMigrationSummary;
  rlsSecurityServerOnlySummary: ExecutionRecordInsertRouteCallRlsSecurityServerOnlySummary;
  idempotencyDuplicateSummary: ExecutionRecordInsertRouteCallIdempotencyDuplicateSummary;
  auditCorrectionSummary: ExecutionRecordInsertRouteCallAuditCorrectionSummary;
  evidenceProvenanceSummary: ExecutionRecordInsertRouteCallEvidenceProvenanceSummary;
  manualApprovalSummary: ExecutionRecordInsertRouteCallManualApprovalSummary;
  dryRunProductionModeSummary: ExecutionRecordInsertRouteCallDryRunProductionModeSummary;
  routeOutputSummary: ExecutionRecordInsertRouteCallRouteOutputSummary;
  postInsertBoundarySummary: ExecutionRecordInsertRouteCallPostInsertBoundarySummary;
  safetyPolicy: ExecutionRecordInsertRouteCallSafetyPolicy;
  blockedReasons: ExecutionRecordInsertRouteCallBlockedReason[];
  warnings: ExecutionRecordInsertRouteCallWarning[];
  reviewItems: ExecutionRecordInsertRouteCallReviewItem[];
  metadata?: Record<string, unknown>;
};
