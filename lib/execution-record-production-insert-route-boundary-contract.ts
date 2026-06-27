import type {
  ExecutionRecordInsertRouteCallResult,
  ExecutionRecordInsertRouteCallRouteMode,
  ExecutionRecordInsertRouteCallStatus,
} from "@/lib/execution-record-insert-route-call-implementation-contract";
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

// Future production insert route boundary contract metadata only. These types
// do not implement a production route, call an insert route, create execution
// records, persist, write Supabase/localStorage, append audit records, update
// stats/PnL, roll back, mutate trades, wire UI, capture browser/Avanza
// behavior, run broker actions, or enable automatic mode.

export const EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_CONTRACT_VERSION =
  "execution_record_production_insert_route_boundary_v1" as const;

export type ExecutionRecordProductionInsertRouteBoundaryContractVersion =
  typeof EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_CONTRACT_VERSION;

export const EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_STATUSES = [
  "production_insert_route_boundary_ready_for_design_only",
  "production_insert_route_boundary_blocked",
  "production_insert_route_boundary_needs_review",
  "production_insert_route_boundary_invalid",
  "production_insert_route_boundary_absent",
] as const;

export type ExecutionRecordProductionInsertRouteBoundaryStatus =
  (typeof EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_STATUSES)[number];

export const EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_DECISION_RECOMMENDATIONS =
  [
    "design_only_do_not_implement_route",
    "blocked_do_not_create_production_route",
    "needs_manual_review",
    "invalid_do_not_create_production_route",
    "future_route_boundary_required",
  ] as const;

export type ExecutionRecordProductionInsertRouteBoundaryDecisionRecommendation =
  (typeof EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_BLOCKED_REASONS =
  [
    "generated_types_absent_or_unknown",
    "migration_application_not_proven",
    "execution_records_schema_unverified",
    "rls_security_unverified",
    "server_only_boundary_missing",
    "route_auth_secret_model_missing",
    "client_side_write_not_blocked",
    "duplicate_prevention_missing",
    "idempotency_key_missing",
    "normalized_input_missing",
    "evidence_provenance_missing",
    "audit_correction_metadata_missing",
    "manual_approval_missing",
    "dry_run_production_separation_missing",
    "post_insert_boundaries_missing",
    "production_route_not_allowed_in_this_action",
  ] as const;

export type ExecutionRecordProductionInsertRouteBlockedReason =
  (typeof EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_WARNINGS = [
  "contract_only",
  "production_route_not_implemented",
  "production_route_not_called",
  "dry_run_route_not_production_insert",
  "production_route_requires_server_only_boundary",
  "generated_types_required_before_production_insert",
  "migration_application_required_before_production_insert",
  "rls_security_required_before_production_insert",
  "route_auth_secret_model_required",
  "duplicate_prevention_required_before_insert",
  "audit_required_before_post_insert_mutation",
  "stats_update_out_of_scope",
  "trade_mutation_out_of_scope",
  "broker_avanza_action_out_of_scope",
  "post_insert_mutations_not_automatic",
] as const;

export type ExecutionRecordProductionInsertRouteWarning =
  (typeof EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_WARNINGS)[number];

export const EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_REVIEW_ITEMS = [
  "production_boundary_contract_review",
  "insert_route_call_wrapper_result_review",
  "insert_route_readiness_validation_review",
  "normalized_input_review",
  "schema_generated_types_migration_review",
  "rls_security_review",
  "server_only_boundary_review",
  "route_auth_secret_model_review",
  "idempotency_duplicate_prevention_review",
  "audit_correction_review",
  "evidence_provenance_review",
  "manual_approval_review",
  "dry_run_production_separation_review",
  "post_insert_boundary_review",
  "future_route_implementation_review",
] as const;

export type ExecutionRecordProductionInsertRouteReviewItem =
  (typeof EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_REVIEW_ITEMS)[number];

export type ExecutionRecordProductionInsertRouteBoundaryCurrentStateSummary = {
  designExists: boolean;
  contractExists: true;
  productionRouteImplemented: false;
  productionRouteCalled: false;
  insertRouteCallWrapperExists: boolean;
  insertRouteCallWrapperDryRunOnly: boolean;
  devPreviewDiagnosticsOnly: boolean;
  generatedTypesPresent?: boolean | null;
  migrationApplicationProven?: boolean | null;
  rlsSecurityVerified?: boolean | null;
  serverOnlyProductionWriteBoundaryVerified: false;
  executionRecordCreationEnabled: false;
  persistenceWriteEnabled: false;
  blockedReasons: ExecutionRecordProductionInsertRouteBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRoutePreconditionSummary = {
  generatedTypesPresent: boolean;
  migrationApplicationProven: boolean;
  executionRecordsSchemaVerified: boolean;
  rlsSecurityVerified: boolean;
  serviceRoleServerOnlyAccessDefined: boolean;
  routeAuthSecretModelDefined: boolean;
  clientSideWriteImpossible: boolean;
  serverOnlyBoundaryProven: boolean;
  normalizedPersistenceInputValidated: boolean;
  insertRouteReadinessValidated: boolean;
  insertRouteCallWrapperReassessed: boolean;
  idempotencyStrategyImplemented: boolean;
  duplicatePreventionImplemented: boolean;
  auditCorrectionMetadataComplete: boolean;
  evidenceProvenanceComplete: boolean;
  manualApprovalContextPresent: boolean;
  dryRunProductionSeparated: boolean;
  postInsertAuthoritiesFalse: boolean;
  blockedReasons: ExecutionRecordProductionInsertRouteBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRouteShapeSummary = {
  routeMode: "production";
  serverOnly: true;
  authenticated: boolean;
  authorized: boolean;
  idempotencyKeyRequired: true;
  duplicatePreventionRequired: true;
  normalizedInputOnly: true;
  uiStateOnlySourceAllowed: false;
  clientSideSupabaseInsertAllowed: false;
  returnsInsertedRecordIdOnly: boolean;
  returnsSafeSummaryOnly: boolean;
  postInsertMutationSideEffectsAllowed: false;
  devPreviewCallable: false;
  blockedReasons: ExecutionRecordProductionInsertRouteBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRouteAllowedInputSummary = {
  normalizedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  normalizedExecutionRecordInputPresent: boolean;
  idempotencyFingerprintMetadataPresent: boolean;
  duplicatePreventionMetadataPresent: boolean;
  finalBrokerEvidenceIdentifiersPresent: boolean;
  auditCorrectionMetadataPresent: boolean;
  evidenceProvenanceChainPresent: boolean;
  manualApprovalMetadataPresent: boolean;
  serverOnlyRequestContextPresent: boolean;
  generatedTypesSchemaReadinessProofPresent: boolean;
  migrationProofPresent: boolean;
  rlsSecurityProofPresent: boolean;
  productionRouteModePresent: boolean;
  uiStateOnlySourceAllowed: false;
  fixtureInputAllowed: false;
  dryRunDiagnosticsAllowedAsProductionInput: false;
  blockedReasons: ExecutionRecordProductionInsertRouteBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRouteAllowedOutputSummary = {
  routeStatus?: ExecutionRecordProductionInsertRouteBoundaryStatus | null;
  insertedExecutionRecordId?: string | null;
  insertedExecutionRecordReference?: PersistedExecutionRecordReference | null;
  duplicateDetected: boolean;
  duplicateMatches: ExecutionRecordDuplicateMatch[];
  blockedReasons: ExecutionRecordProductionInsertRouteBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteReviewItem[];
  safeRouteOutputSummary?: Record<string, unknown> | null;
  auditAppendApprovalOutput: false;
  statsPnlUpdateApprovalOutput: false;
  rollbackCorrectionApprovalOutput: false;
  tradeMutationApprovalOutput: false;
  brokerOrderApprovalOutput: false;
  avanzaBrowserApprovalOutput: false;
  automaticModeApprovalOutput: false;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRouteDryRunSeparationSummary = {
  sourceRouteMode?: ExecutionRecordInsertRouteCallRouteMode | null;
  sourceRouteCallStatus?: ExecutionRecordInsertRouteCallStatus | null;
  dryRunRouteDiagnosticsOnly: boolean;
  dryRunResultIsProductionInsert: false;
  dryRunSuccessProvesProductionReadiness: false;
  productionRouteSeparate: boolean;
  productionRouteServerOnly: boolean;
  devPreviewMayCallProductionRoute: false;
  fixtureCallableMayCallProductionRoute: false;
  blockedReasons: ExecutionRecordProductionInsertRouteBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRouteSecuritySummary = {
  rlsSecurityProofPresent: boolean;
  rlsPoliciesVerified: boolean;
  routeAuthSecretModelDefined: boolean;
  userRoleAssumptionsDocumented: boolean;
  serviceRoleAssumptionsDocumented: boolean;
  serviceRoleServerOnly: boolean;
  clientSideWriteBlocked: boolean;
  browserWritable: false;
  brokerAutomationAuthority: false;
  avanzaBrowserAuthority: false;
  blockedReasons: ExecutionRecordProductionInsertRouteBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRouteServerOnlySummary = {
  serverOnlyRequestContext?: Record<string, unknown> | null;
  serverOnlyBoundaryProven: boolean;
  routeHandlerOnly: boolean;
  importedIntoClientCode: false;
  callableFromDevPreview: false;
  serviceRoleRestrictedToServer: boolean;
  clientSideSupabaseInsertAllowed: false;
  localStorageWriteAllowed: false;
  blockedReasons: ExecutionRecordProductionInsertRouteBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRouteSchemaGeneratedTypesMigrationSummary =
  {
    schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
    expectedTableName: "execution_records";
    executionRecordsSchemaVerified: boolean;
    generatedTypesPresent: boolean;
    generatedTypesLocation?: string | null;
    executionRecordsTableTyped: boolean;
    migrationApplicationProven: boolean;
    migrationReference?: string | null;
    targetEnvironment?: string | null;
    productionWriteReadinessBlockedBySchema: boolean;
    blockedReasons: ExecutionRecordProductionInsertRouteBlockedReason[];
    warnings: ExecutionRecordProductionInsertRouteWarning[];
    reviewItems: ExecutionRecordProductionInsertRouteReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordProductionInsertRouteIdempotencyDuplicateSummary = {
  idempotencyKey?: string | null;
  recordFingerprint?: string | null;
  sourceFingerprint?: string | null;
  duplicatePreventionMetadataPresent: boolean;
  idempotencyKeyPresent: boolean;
  duplicateCheckRequiredBeforeInsert: true;
  duplicateCheckPerformed: boolean;
  duplicateDetected: boolean;
  duplicateMatches: ExecutionRecordDuplicateMatch[];
  duplicateBlocksInsert: boolean;
  blockedReasons: ExecutionRecordProductionInsertRouteBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRouteAuditCorrectionSummary = {
  auditCorrectionMetadataPresent: boolean;
  auditAppendAllowedByProductionInsert: false;
  correctionAllowedByProductionInsert: false;
  rollbackAllowedByProductionInsert: false;
  postInsertAuditRequiresSeparateBoundary: true;
  correctionRollbackRequiresSeparateBoundary: true;
  blockedReasons: ExecutionRecordProductionInsertRouteBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRouteEvidenceProvenanceSummary = {
  evidenceProvenanceChainPresent: boolean;
  sourceFingerprintPresent: boolean;
  finalBrokerEvidenceIdentifiersPresent: boolean;
  brokerConfirmationEvidencePresent: boolean;
  sourceEventIds: string[];
  provenanceMetadataPresent: boolean;
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  blockedReasons: ExecutionRecordProductionInsertRouteBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRoutePostInsertBoundarySummary = {
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
  tradeMutationReconciliationRequiresSeparateBoundary: true;
  failureRecoveryRequiresSeparateBoundary: true;
  uiStateMutationRequiresSeparateBoundary: true;
  userNotificationRequiresSeparateBoundary: true;
  brokerOrderFollowUpRequiresSeparateBoundary: true;
  blockedReasons: ExecutionRecordProductionInsertRouteBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRouteSafetyPolicy = {
  contractOnly: true;
  designOnly: true;
  productionRouteImplemented: false;
  productionRouteCalled: false;
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

export const EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_DEFAULT_SAFETY_POLICY =
  {
    contractOnly: true,
    designOnly: true,
    productionRouteImplemented: false,
    productionRouteCalled: false,
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
      "Production insert route boundary contract types are contract-only and design-only. They do not implement or call a production route, create execution records, persist, finalize, append audit records, update stats/PnL, roll back, mutate trades, run broker actions, automate browser/Avanza behavior, or enable automatic mode.",
  } as const satisfies ExecutionRecordProductionInsertRouteSafetyPolicy;

export const EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_DEFAULT_POST_INSERT_BOUNDARY =
  {
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
    tradeMutationReconciliationRequiresSeparateBoundary: true,
    failureRecoveryRequiresSeparateBoundary: true,
    uiStateMutationRequiresSeparateBoundary: true,
    userNotificationRequiresSeparateBoundary: true,
    brokerOrderFollowUpRequiresSeparateBoundary: true,
    blockedReasons: ["post_insert_boundaries_missing"],
    warnings: [
      "audit_required_before_post_insert_mutation",
      "stats_update_out_of_scope",
      "trade_mutation_out_of_scope",
      "broker_avanza_action_out_of_scope",
      "post_insert_mutations_not_automatic",
    ],
    reviewItems: ["post_insert_boundary_review"],
  } as const satisfies ExecutionRecordProductionInsertRoutePostInsertBoundarySummary;

export type ExecutionRecordProductionInsertRouteBoundaryInput = {
  contractVersion: ExecutionRecordProductionInsertRouteBoundaryContractVersion;
  requestedAt: string;
  requestedBy?: string | null;
  routeMode: "production";
  insertRouteCallWrapperResult?: ExecutionRecordInsertRouteCallResult | null;
  insertRouteReadinessValidationResult?:
    | ExecutionRecordInsertRouteReadinessValidationResult
    | null;
  normalizedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  currentStateSummary?: ExecutionRecordProductionInsertRouteBoundaryCurrentStateSummary | null;
  preconditionSummary?: ExecutionRecordProductionInsertRoutePreconditionSummary | null;
  routeShapeSummary?: ExecutionRecordProductionInsertRouteShapeSummary | null;
  allowedInputSummary?: ExecutionRecordProductionInsertRouteAllowedInputSummary | null;
  allowedOutputSummary?: ExecutionRecordProductionInsertRouteAllowedOutputSummary | null;
  dryRunSeparationSummary?: ExecutionRecordProductionInsertRouteDryRunSeparationSummary | null;
  securitySummary?: ExecutionRecordProductionInsertRouteSecuritySummary | null;
  serverOnlySummary?: ExecutionRecordProductionInsertRouteServerOnlySummary | null;
  schemaGeneratedTypesMigrationSummary?: ExecutionRecordProductionInsertRouteSchemaGeneratedTypesMigrationSummary | null;
  idempotencyDuplicateSummary?: ExecutionRecordProductionInsertRouteIdempotencyDuplicateSummary | null;
  auditCorrectionSummary?: ExecutionRecordProductionInsertRouteAuditCorrectionSummary | null;
  evidenceProvenanceSummary?: ExecutionRecordProductionInsertRouteEvidenceProvenanceSummary | null;
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  dryRunProductionSeparationMetadata?: Record<string, unknown> | null;
  postInsertBoundarySummary?: ExecutionRecordProductionInsertRoutePostInsertBoundarySummary | null;
  safetyPolicy?: ExecutionRecordProductionInsertRouteSafetyPolicy | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRouteBoundaryResult = {
  contractVersion: ExecutionRecordProductionInsertRouteBoundaryContractVersion;
  evaluatedAt: string;
  status: ExecutionRecordProductionInsertRouteBoundaryStatus;
  decisionRecommendation: ExecutionRecordProductionInsertRouteBoundaryDecisionRecommendation;
  input?: ExecutionRecordProductionInsertRouteBoundaryInput | null;
  currentStateSummary: ExecutionRecordProductionInsertRouteBoundaryCurrentStateSummary;
  preconditionSummary: ExecutionRecordProductionInsertRoutePreconditionSummary;
  routeShapeSummary: ExecutionRecordProductionInsertRouteShapeSummary;
  allowedInputSummary: ExecutionRecordProductionInsertRouteAllowedInputSummary;
  allowedOutputSummary: ExecutionRecordProductionInsertRouteAllowedOutputSummary;
  dryRunSeparationSummary: ExecutionRecordProductionInsertRouteDryRunSeparationSummary;
  securitySummary: ExecutionRecordProductionInsertRouteSecuritySummary;
  serverOnlySummary: ExecutionRecordProductionInsertRouteServerOnlySummary;
  schemaGeneratedTypesMigrationSummary: ExecutionRecordProductionInsertRouteSchemaGeneratedTypesMigrationSummary;
  idempotencyDuplicateSummary: ExecutionRecordProductionInsertRouteIdempotencyDuplicateSummary;
  auditCorrectionSummary: ExecutionRecordProductionInsertRouteAuditCorrectionSummary;
  evidenceProvenanceSummary: ExecutionRecordProductionInsertRouteEvidenceProvenanceSummary;
  postInsertBoundarySummary: ExecutionRecordProductionInsertRoutePostInsertBoundarySummary;
  safetyPolicy: ExecutionRecordProductionInsertRouteSafetyPolicy;
  insertedExecutionRecordId?: string | null;
  insertedExecutionRecordReference?: PersistedExecutionRecordReference | null;
  blockedReasons: ExecutionRecordProductionInsertRouteBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteReviewItem[];
  metadata?: Record<string, unknown>;
};
