import type {
  ExecutionRecordProductionInsertRouteAllowedInputSummary,
  ExecutionRecordProductionInsertRouteAllowedOutputSummary,
  ExecutionRecordProductionInsertRouteAuditCorrectionSummary,
  ExecutionRecordProductionInsertRouteBoundaryInput,
  ExecutionRecordProductionInsertRouteBoundaryResult,
  ExecutionRecordProductionInsertRouteBoundaryStatus,
  ExecutionRecordProductionInsertRouteBoundaryCurrentStateSummary,
  ExecutionRecordProductionInsertRouteDryRunSeparationSummary,
  ExecutionRecordProductionInsertRouteEvidenceProvenanceSummary,
  ExecutionRecordProductionInsertRouteIdempotencyDuplicateSummary,
  ExecutionRecordProductionInsertRoutePostInsertBoundarySummary,
  ExecutionRecordProductionInsertRoutePreconditionSummary,
  ExecutionRecordProductionInsertRouteSafetyPolicy,
  ExecutionRecordProductionInsertRouteSchemaGeneratedTypesMigrationSummary,
  ExecutionRecordProductionInsertRouteSecuritySummary,
  ExecutionRecordProductionInsertRouteServerOnlySummary,
  ExecutionRecordProductionInsertRouteShapeSummary,
} from "@/lib/execution-record-production-insert-route-boundary-contract";
import type {
  ExecutionRecordInsertRouteCallResult,
} from "@/lib/execution-record-insert-route-call-implementation-contract";
import type {
  ExecutionRecordInsertRouteReadinessValidationResult,
} from "@/lib/execution-record-insert-route-readiness-boundary-validator-contract";
import type {
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceInput,
  ExecutionRecordPersistenceSchemaReference,
} from "@/lib/execution-record-persistence-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Future production insert route boundary validator contract metadata only.
// These types do not implement validation logic, create or call a production
// route, call insert routes, create execution records, persist, write
// Supabase/localStorage, append audit records, update stats/PnL, roll back,
// mutate trades, wire UI, capture browser/Avanza behavior, run broker actions,
// or enable automatic mode.

export const EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATOR_CONTRACT_VERSION =
  "execution_record_production_insert_route_boundary_validator_v1" as const;

export type ExecutionRecordProductionInsertRouteBoundaryValidatorContractVersion =
  typeof EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATOR_CONTRACT_VERSION;

export const EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATION_STATUSES =
  [
    "production_insert_route_boundary_validation_ready_for_design_only",
    "production_insert_route_boundary_validation_blocked",
    "production_insert_route_boundary_validation_needs_review",
    "production_insert_route_boundary_validation_invalid",
    "production_insert_route_boundary_validation_absent",
  ] as const;

export type ExecutionRecordProductionInsertRouteBoundaryValidationStatus =
  (typeof EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATION_STATUSES)[number];

export const EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATION_DECISION_RECOMMENDATIONS =
  [
    "design_only_do_not_implement_route",
    "blocked_do_not_create_production_route",
    "needs_manual_review",
    "invalid_do_not_create_production_route",
    "future_route_boundary_required",
  ] as const;

export type ExecutionRecordProductionInsertRouteBoundaryValidationDecisionRecommendation =
  (typeof EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATION_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATION_BLOCKED_REASONS =
  [
    "missing_boundary_input",
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
    "production_route_implementation_present_unexpectedly",
    "production_route_call_attempted",
    "broker_or_avanza_action_requested",
  ] as const;

export type ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason =
  (typeof EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATION_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATION_WARNINGS =
  [
    "contract_only",
    "validator_not_implemented",
    "production_route_not_implemented",
    "production_route_not_called",
    "dry_run_route_not_production_insert",
    "production_route_requires_server_only_boundary",
    "generated_types_required_before_production_insert",
    "migration_application_required_before_production_insert",
    "rls_security_required_before_production_insert",
    "route_auth_secret_model_required",
    "client_side_write_must_be_blocked",
    "duplicate_prevention_required_before_insert",
    "audit_required_before_post_insert_mutation",
    "stats_update_out_of_scope",
    "trade_mutation_out_of_scope",
    "broker_avanza_action_out_of_scope",
    "post_insert_mutations_not_automatic",
  ] as const;

export type ExecutionRecordProductionInsertRouteBoundaryValidationWarning =
  (typeof EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATION_WARNINGS)[number];

export const EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATION_REVIEW_ITEMS =
  [
    "boundary_input_review",
    "current_state_review",
    "precondition_review",
    "route_shape_review",
    "allowed_input_review",
    "allowed_output_review",
    "dry_run_production_separation_review",
    "security_review",
    "server_only_review",
    "schema_generated_types_migration_review",
    "idempotency_duplicate_review",
    "audit_correction_review",
    "evidence_provenance_review",
    "manual_approval_review",
    "post_insert_boundary_review",
    "safety_policy_review",
    "future_route_implementation_review",
  ] as const;

export type ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem =
  (typeof EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATION_REVIEW_ITEMS)[number];

export type ExecutionRecordProductionInsertRouteBoundaryAuthorityFlags = {
  validationOnly: true;
  designOnly: true;
  productionRouteImplementationAllowed: false;
  productionRouteCallAllowed: false;
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
  productionRouteImplementationAttempted: false;
  productionRouteCallAttempted: false;
  insertRouteCallAttempted: false;
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
};

export const EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_DEFAULT_AUTHORITY_FLAGS =
  {
    validationOnly: true,
    designOnly: true,
    productionRouteImplementationAllowed: false,
    productionRouteCallAllowed: false,
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
    productionRouteImplementationAttempted: false,
    productionRouteCallAttempted: false,
    insertRouteCallAttempted: false,
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
  } as const satisfies ExecutionRecordProductionInsertRouteBoundaryAuthorityFlags;

export type ExecutionRecordProductionInsertRouteCurrentStateValidationSummary = {
  sourceSummary?: ExecutionRecordProductionInsertRouteBoundaryCurrentStateSummary | null;
  boundaryInputPresent: boolean;
  boundaryContractPresent: boolean;
  productionRouteImplemented: false;
  productionRouteCalled: false;
  productionInsertWritePathPresent: false;
  devPreviewDiagnosticsOnly: boolean;
  generatedTypesStatusKnown: boolean;
  migrationApplicationStatusKnown: boolean;
  blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRoutePreconditionValidationSummary =
  {
    sourceSummary?: ExecutionRecordProductionInsertRoutePreconditionSummary | null;
    generatedTypesPresent: boolean;
    migrationApplicationProven: boolean;
    executionRecordsSchemaVerified: boolean;
    rlsSecurityVerified: boolean;
    serviceRoleServerOnlyAccessDefined: boolean;
    routeAuthSecretModelDefined: boolean;
    clientSideWriteBlocked: boolean;
    serverOnlyBoundaryProven: boolean;
    normalizedInputPresent: boolean;
    idempotencyKeyPresent: boolean;
    duplicatePreventionPresent: boolean;
    evidenceProvenancePresent: boolean;
    auditCorrectionMetadataPresent: boolean;
    manualApprovalSatisfied: boolean;
    dryRunProductionSeparated: boolean;
    postInsertAuthoritiesFalse: boolean;
    blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
    warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
    reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordProductionInsertRouteShapeValidationSummary = {
  sourceSummary?: ExecutionRecordProductionInsertRouteShapeSummary | null;
  routeModeProductionOnly: boolean;
  serverOnly: boolean;
  authenticated: boolean;
  authorized: boolean;
  idempotencyKeyRequired: boolean;
  duplicatePreventionRequired: boolean;
  normalizedInputOnly: boolean;
  clientSideSupabaseInsertAllowed: false;
  devPreviewCallable: false;
  postInsertMutationSideEffectsAllowed: false;
  blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRouteAllowedInputValidationSummary =
  {
    sourceSummary?: ExecutionRecordProductionInsertRouteAllowedInputSummary | null;
    normalizedPersistenceInput?: ExecutionRecordPersistenceInput | null;
    normalizedInputPresent: boolean;
    schemaGeneratedTypesMigrationProofPresent: boolean;
    rlsSecurityProofPresent: boolean;
    serverOnlyRequestContextPresent: boolean;
    routeAuthSecretModelPresent: boolean;
    idempotencyFingerprintMetadataPresent: boolean;
    duplicatePreventionMetadataPresent: boolean;
    auditCorrectionMetadataPresent: boolean;
    evidenceProvenanceChainPresent: boolean;
    manualApprovalMetadataPresent: boolean;
    dryRunProductionSeparationMetadataPresent: boolean;
    postInsertBoundaryMetadataPresent: boolean;
    uiStateOnlySourceAllowed: false;
    fixtureInputAllowed: false;
    dryRunDiagnosticsAllowedAsProductionInput: false;
    blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
    warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
    reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordProductionInsertRouteAllowedOutputValidationSummary =
  {
    sourceSummary?: ExecutionRecordProductionInsertRouteAllowedOutputSummary | null;
    boundaryStatus?: ExecutionRecordProductionInsertRouteBoundaryStatus | null;
    insertedRecordIdOutputAllowedForFutureRoute: boolean;
    safeSummaryOnly: boolean;
    auditAppendApprovalOutput: false;
    statsPnlUpdateApprovalOutput: false;
    rollbackCorrectionApprovalOutput: false;
    tradeMutationApprovalOutput: false;
    brokerOrderApprovalOutput: false;
    avanzaBrowserApprovalOutput: false;
    automaticModeApprovalOutput: false;
    blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
    warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
    reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordProductionInsertRouteDryRunSeparationValidationSummary =
  {
    sourceSummary?: ExecutionRecordProductionInsertRouteDryRunSeparationSummary | null;
    dryRunRouteDiagnosticsOnly: boolean;
    dryRunResultIsProductionInsert: false;
    dryRunSuccessProvesProductionReadiness: false;
    productionRouteSeparate: boolean;
    productionRouteServerOnly: boolean;
    devPreviewMayCallProductionRoute: false;
    fixtureCallableMayCallProductionRoute: false;
    routeModeExplicit: boolean;
    blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
    warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
    reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordProductionInsertRouteSecurityValidationSummary = {
  sourceSummary?: ExecutionRecordProductionInsertRouteSecuritySummary | null;
  rlsSecurityProofPresent: boolean;
  rlsPoliciesVerified: boolean;
  routeAuthSecretModelDefined: boolean;
  userRoleAssumptionsDocumented: boolean;
  serviceRoleAssumptionsDocumented: boolean;
  serviceRoleServerOnly: boolean;
  clientSideWriteBlocked: boolean;
  brokerAutomationAuthority: false;
  avanzaBrowserAuthority: false;
  blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRouteServerOnlyValidationSummary = {
  sourceSummary?: ExecutionRecordProductionInsertRouteServerOnlySummary | null;
  serverOnlyBoundaryProven: boolean;
  serverOnlyRequestContext?: Record<string, unknown> | null;
  routeHandlerOnly: boolean;
  importedIntoClientCode: false;
  callableFromDevPreview: false;
  serviceRoleRestrictedToServer: boolean;
  clientSideSupabaseInsertAllowed: false;
  localStorageWriteAllowed: false;
  blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRouteSchemaGeneratedTypesMigrationValidationSummary =
  {
    sourceSummary?:
      | ExecutionRecordProductionInsertRouteSchemaGeneratedTypesMigrationSummary
      | null;
    schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
    expectedTableName: "execution_records";
    executionRecordsSchemaVerified: boolean;
    generatedTypesPresent: boolean;
    generatedTypesLocation?: string | null;
    executionRecordsTableTyped: boolean;
    migrationApplicationProven: boolean;
    migrationReference?: string | null;
    targetEnvironment?: string | null;
    metadataJsonCompatible: boolean;
    requiredColumnsVerified: boolean;
    nullableRequiredSemanticsVerified: boolean;
    noRuntimeDbWritesInValidation: true;
    blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
    warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
    reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordProductionInsertRouteIdempotencyDuplicateValidationSummary =
  {
    sourceSummary?: ExecutionRecordProductionInsertRouteIdempotencyDuplicateSummary | null;
    idempotencyKey?: string | null;
    recordFingerprint?: string | null;
    sourceFingerprint?: string | null;
    duplicateMatches: ExecutionRecordDuplicateMatch[];
    idempotencyKeyPresent: boolean;
    duplicatePreventionPresent: boolean;
    finalBrokerEvidenceIdentifiersPresent: boolean;
    sourceEvidenceIdentityPresent: boolean;
    normalizedInputFingerprintPresent: boolean;
    duplicateInsertBlockedBeforeProductionInsert: boolean;
    blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
    warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
    reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordProductionInsertRouteAuditCorrectionValidationSummary =
  {
    sourceSummary?: ExecutionRecordProductionInsertRouteAuditCorrectionSummary | null;
    auditCorrectionMetadataPresent: boolean;
    auditAppendAllowedByValidation: false;
    correctionAllowedByValidation: false;
    rollbackAllowedByValidation: false;
    postInsertAuditRequiresSeparateBoundary: true;
    correctionRollbackRequiresSeparateBoundary: true;
    blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
    warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
    reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordProductionInsertRouteEvidenceProvenanceValidationSummary =
  {
    sourceSummary?: ExecutionRecordProductionInsertRouteEvidenceProvenanceSummary | null;
    evidenceProvenanceChainPresent: boolean;
    sourceFingerprintPresent: boolean;
    finalBrokerEvidenceIdentifiersPresent: boolean;
    brokerConfirmationEvidencePresent: boolean;
    manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
    sourceEventIds: string[];
    blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
    warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
    reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordProductionInsertRoutePostInsertBoundaryValidationSummary =
  {
    sourceSummary?: ExecutionRecordProductionInsertRoutePostInsertBoundarySummary | null;
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
    blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
    warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
    reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordProductionInsertRouteSafetyPolicyValidationSummary =
  {
    sourceSafetyPolicy?: ExecutionRecordProductionInsertRouteSafetyPolicy | null;
    authorityFlags: ExecutionRecordProductionInsertRouteBoundaryAuthorityFlags;
    validationOnly: true;
    designOnly: true;
    noProductionRouteImplementation: true;
    noProductionRouteCall: true;
    noInsertRouteCall: true;
    noExecutionRecordCreation: true;
    noPersistenceWrite: true;
    noAuditAppend: true;
    noStatsPnlUpdate: true;
    noRollbackCorrection: true;
    noTradeMutation: true;
    noBrokerOrderBehavior: true;
    noAvanzaBrowserBehavior: true;
    automaticModeDisabled: true;
    blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
    warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
    reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordProductionInsertRouteBoundaryValidationInput = {
  contractVersion: ExecutionRecordProductionInsertRouteBoundaryValidatorContractVersion;
  requestedAt: string;
  requestedBy?: string | null;
  boundaryInput?: ExecutionRecordProductionInsertRouteBoundaryInput | null;
  boundaryResult?: ExecutionRecordProductionInsertRouteBoundaryResult | null;
  insertRouteCallWrapperResult?: ExecutionRecordInsertRouteCallResult | null;
  insertRouteReadinessValidationResult?:
    | ExecutionRecordInsertRouteReadinessValidationResult
    | null;
  normalizedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  schemaGeneratedTypesMigrationProof?:
    | ExecutionRecordProductionInsertRouteSchemaGeneratedTypesMigrationSummary
    | null;
  rlsSecurityProof?: ExecutionRecordProductionInsertRouteSecuritySummary | null;
  serviceRoleServerOnlyMetadata?: ExecutionRecordProductionInsertRouteServerOnlySummary | null;
  routeAuthSecretModelMetadata?: Record<string, unknown> | null;
  serverOnlyRequestContext?: Record<string, unknown> | null;
  idempotencyDuplicateMetadata?:
    | ExecutionRecordProductionInsertRouteIdempotencyDuplicateSummary
    | null;
  auditCorrectionMetadata?: ExecutionRecordProductionInsertRouteAuditCorrectionSummary | null;
  evidenceProvenanceChain?:
    | ExecutionRecordProductionInsertRouteEvidenceProvenanceSummary
    | null;
  manualApprovalMetadata?: FinalizationActionValidatorManualApprovalContext | null;
  dryRunProductionSeparationMetadata?:
    | ExecutionRecordProductionInsertRouteDryRunSeparationSummary
    | null;
  postInsertBoundaryMetadata?:
    | ExecutionRecordProductionInsertRoutePostInsertBoundarySummary
    | null;
  safetyPolicy?: ExecutionRecordProductionInsertRouteSafetyPolicy | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordProductionInsertRouteBoundaryValidationResult = {
  contractVersion: ExecutionRecordProductionInsertRouteBoundaryValidatorContractVersion;
  evaluatedAt: string;
  status: ExecutionRecordProductionInsertRouteBoundaryValidationStatus;
  decisionRecommendation: ExecutionRecordProductionInsertRouteBoundaryValidationDecisionRecommendation;
  input?: ExecutionRecordProductionInsertRouteBoundaryValidationInput | null;
  currentStateValidationSummary: ExecutionRecordProductionInsertRouteCurrentStateValidationSummary;
  preconditionValidationSummary: ExecutionRecordProductionInsertRoutePreconditionValidationSummary;
  routeShapeValidationSummary: ExecutionRecordProductionInsertRouteShapeValidationSummary;
  allowedInputValidationSummary: ExecutionRecordProductionInsertRouteAllowedInputValidationSummary;
  allowedOutputValidationSummary: ExecutionRecordProductionInsertRouteAllowedOutputValidationSummary;
  dryRunSeparationValidationSummary: ExecutionRecordProductionInsertRouteDryRunSeparationValidationSummary;
  securityValidationSummary: ExecutionRecordProductionInsertRouteSecurityValidationSummary;
  serverOnlyValidationSummary: ExecutionRecordProductionInsertRouteServerOnlyValidationSummary;
  schemaGeneratedTypesMigrationValidationSummary: ExecutionRecordProductionInsertRouteSchemaGeneratedTypesMigrationValidationSummary;
  idempotencyDuplicateValidationSummary: ExecutionRecordProductionInsertRouteIdempotencyDuplicateValidationSummary;
  auditCorrectionValidationSummary: ExecutionRecordProductionInsertRouteAuditCorrectionValidationSummary;
  evidenceProvenanceValidationSummary: ExecutionRecordProductionInsertRouteEvidenceProvenanceValidationSummary;
  postInsertBoundaryValidationSummary: ExecutionRecordProductionInsertRoutePostInsertBoundaryValidationSummary;
  safetyPolicyValidationSummary: ExecutionRecordProductionInsertRouteSafetyPolicyValidationSummary;
  authorityFlags: ExecutionRecordProductionInsertRouteBoundaryAuthorityFlags;
  blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
  metadata?: Record<string, unknown>;
};
