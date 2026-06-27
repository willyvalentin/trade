import type {
  ActualPersistenceValidatorBoundaryCallImplementationResult,
} from "@/lib/execution-record-actual-persistence-validator-boundary-call-implementation-contract";
import type {
  ExecutionRecordInsertRouteActualValidatorSummary,
  ExecutionRecordInsertRouteAuditCorrectionSummary,
  ExecutionRecordInsertRouteDryRunProductionSeparationSummary,
  ExecutionRecordInsertRouteEligibilitySummary,
  ExecutionRecordInsertRouteEvidenceProvenanceSummary,
  ExecutionRecordInsertRouteGeneratedTypesSummary,
  ExecutionRecordInsertRouteIdempotencyDuplicateSummary,
  ExecutionRecordInsertRouteManualApprovalSummary,
  ExecutionRecordInsertRouteMigrationSummary,
  ExecutionRecordInsertRouteNormalizedInputSummary,
  ExecutionRecordInsertRoutePostInsertBoundarySummary,
  ExecutionRecordInsertRouteReadinessDecisionRecommendation,
  ExecutionRecordInsertRouteReadinessInput,
  ExecutionRecordInsertRouteReadinessResult,
  ExecutionRecordInsertRouteReadinessSafetyPolicy,
  ExecutionRecordInsertRouteReadinessStatus,
  ExecutionRecordInsertRouteRlsSecuritySummary,
  ExecutionRecordInsertRouteSchemaReadinessSummary,
  ExecutionRecordInsertRouteServerOnlyBoundarySummary,
  ExecutionRecordInsertRouteServerOnlyRequestContext,
} from "@/lib/execution-record-insert-route-readiness-boundary-contract";
import type {
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceInput,
  ExecutionRecordPersistenceResult,
  ExecutionRecordPersistenceSchemaReference,
} from "@/lib/execution-record-persistence-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Future insert-route readiness validator contract metadata only. These types
// describe a later pure validator for insert route readiness. They do not
// implement validation logic, call insert routes, create execution records,
// persist, write Supabase/localStorage, append audit records, update stats/PnL,
// roll back, mutate trades, wire UI, capture browser/Avanza behavior, run
// broker actions, or enable automatic mode.

export const EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATOR_CONTRACT_VERSION =
  "execution_record_insert_route_readiness_validator_v1" as const;

export type ExecutionRecordInsertRouteReadinessValidatorContractVersion =
  typeof EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATOR_CONTRACT_VERSION;

export const EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATION_STATUSES = [
  "insert_route_readiness_validation_ready",
  "insert_route_readiness_validation_blocked",
  "insert_route_readiness_validation_needs_review",
  "insert_route_readiness_validation_invalid",
  "insert_route_readiness_validation_unsupported",
] as const;

export type ExecutionRecordInsertRouteReadinessValidationStatus =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATION_STATUSES)[number];

export const EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATION_DECISION_RECOMMENDATIONS =
  [
    "may_prepare_insert_route_call_only",
    "needs_manual_review",
    "blocked_do_not_call_insert_route",
    "invalid_do_not_call_insert_route",
    "unsupported_do_not_call_insert_route",
  ] as const;

export type ExecutionRecordInsertRouteReadinessValidationDecisionRecommendation =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATION_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATION_BLOCKED_REASONS =
  [
    "missing_readiness_input",
    "missing_actual_validator_wrapper_result",
    "actual_validator_wrapper_not_validated",
    "actual_validator_decision_not_do_not_insert",
    "actual_validator_output_has_errors",
    "missing_normalized_persistence_input",
    "missing_required_normalized_field",
    "generated_types_absent_or_unknown",
    "migration_application_not_proven",
    "schema_readiness_absent_or_unknown",
    "missing_rls_security_proof",
    "missing_server_only_write_boundary",
    "missing_duplicate_prevention_metadata",
    "missing_idempotency_metadata",
    "missing_audit_correction_metadata",
    "missing_source_evidence",
    "missing_manual_approval",
    "missing_dry_run_route_status",
    "production_route_not_separated_from_dry_run",
    "automatic_mode_enabled",
    "write_authority_present",
    "trade_mutation_requested",
    "broker_or_avanza_action_requested",
    "insert_route_call_not_allowed",
    "execution_record_creation_not_allowed",
  ] as const;

export type ExecutionRecordInsertRouteReadinessValidationBlockedReason =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATION_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATION_WARNINGS = [
  "contract_only",
  "validator_not_implemented",
  "insert_route_not_called",
  "insert_readiness_validation_not_insert_execution",
  "may_prepare_insert_route_call_only_not_insert_execution",
  "dry_run_route_not_production_route",
  "actual_validator_do_not_insert_required",
  "generated_types_required_before_insert_readiness",
  "migration_application_required_before_insert_readiness",
  "rls_security_required_before_insert_readiness",
  "server_only_boundary_required_before_insert_readiness",
  "duplicate_prevention_required_before_insert_readiness",
  "audit_required_before_post_insert_mutation",
  "stats_update_out_of_scope",
  "trade_mutation_out_of_scope",
  "broker_avanza_action_out_of_scope",
] as const;

export type ExecutionRecordInsertRouteReadinessValidationWarning =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATION_WARNINGS)[number];

export const EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATION_REVIEW_ITEMS =
  [
    "readiness_input_review",
    "route_eligibility_review",
    "actual_validator_wrapper_result_review",
    "actual_validator_output_review",
    "normalized_persistence_input_review",
    "required_normalized_field_review",
    "schema_readiness_review",
    "generated_types_review",
    "migration_application_review",
    "rls_security_review",
    "server_only_write_boundary_review",
    "idempotency_fingerprint_review",
    "duplicate_prevention_review",
    "audit_correction_review",
    "evidence_provenance_review",
    "manual_approval_review",
    "dry_run_route_review",
    "production_route_separation_review",
    "authority_flags_review",
    "post_insert_boundary_review",
    "future_insert_route_boundary_review",
  ] as const;

export type ExecutionRecordInsertRouteReadinessValidationReviewItem =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATION_REVIEW_ITEMS)[number];

export type ExecutionRecordInsertRouteReadinessAuthorityFlags = {
  validationOnly: true;
  readinessOnly: true;
  safeToCallInsertRoute: false;
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

export const EXECUTION_RECORD_INSERT_ROUTE_READINESS_DEFAULT_AUTHORITY_FLAGS =
  {
    validationOnly: true,
    readinessOnly: true,
    safeToCallInsertRoute: false,
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
  } as const satisfies ExecutionRecordInsertRouteReadinessAuthorityFlags;

export type ExecutionRecordInsertRouteSafetyPolicyValidationSummary = {
  sourceSafetyPolicy?: ExecutionRecordInsertRouteReadinessSafetyPolicy | null;
  authorityFlags: ExecutionRecordInsertRouteReadinessAuthorityFlags;
  validationOnly: true;
  readinessOnly: true;
  mayPrepareInsertRouteCallOnlyIsNotExecution: true;
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
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteEligibilityValidationSummary = {
  sourceSummary?: ExecutionRecordInsertRouteEligibilitySummary | null;
  routeEligibilityKnown: boolean;
  mayPrepareInsertRouteCallOnly: boolean;
  readinessStatus?: ExecutionRecordInsertRouteReadinessStatus | null;
  readinessDecision?: ExecutionRecordInsertRouteReadinessDecisionRecommendation | null;
  insertRouteCallAllowed: false;
  insertRouteCallAttempted: false;
  safeToCallInsertRoute: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  dryRunRouteOnly: boolean;
  productionRouteSeparated: boolean;
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteActualValidatorValidationSummary = {
  sourceSummary?: ExecutionRecordInsertRouteActualValidatorSummary | null;
  wrapperResult?: ActualPersistenceValidatorBoundaryCallImplementationResult | null;
  wrapperResultPresent: boolean;
  wrapperValidated: boolean;
  wrapperDecisionDoNotInsert: boolean;
  actualValidatorOutput?: ExecutionRecordPersistenceResult | null;
  actualValidatorOutputPresent: boolean;
  actualValidatorOutputHasBlockingErrors: boolean;
  actualValidatorWarnings: string[];
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteNormalizedInputValidationSummary = {
  sourceSummary?: ExecutionRecordInsertRouteNormalizedInputSummary | null;
  proposedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  proposedPersistenceInputPresent: boolean;
  proposedPersistenceInputNormalized: boolean;
  requiredNormalizedFieldsPresent: boolean;
  missingRequiredNormalizedFields: (keyof ExecutionRecordPersistenceInput | string)[];
  recordCandidateIdentityPresent: boolean;
  tickerSymbolPresent: boolean;
  sidePresent: boolean;
  quantityPresent: boolean;
  pricePresent: boolean;
  currencyPresent: boolean;
  feesCommissionReviewed: boolean;
  fxReviewed: boolean;
  grossNetValuesReviewed: boolean;
  executionTimestampPresent: boolean;
  settlementPaymentDateReviewed: boolean;
  brokerSourceIdentifiersPresent: boolean;
  finalNoteReferencePresent: boolean;
  evidenceProvenancePresent: boolean;
  idempotencyFingerprintValuesPresent: boolean;
  auditCorrectionMetadataPresent: boolean;
  manualApprovalContextPresent: boolean;
  finalizationMetadataPresent: boolean;
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteSchemaReadinessValidationSummary = {
  sourceSummary?: ExecutionRecordInsertRouteSchemaReadinessSummary | null;
  schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
  schemaReadinessKnown: boolean;
  schemaReadyForInsertReadiness: boolean;
  executionRecordsTableReady: boolean;
  requiredColumnsPresent: boolean;
  nullableRequiredSemanticsReviewed: boolean;
  jsonMetadataCompatibilityReviewed: boolean;
  runtimeDbWritesAllowed: false;
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteGeneratedTypesValidationSummary = {
  sourceSummary?: ExecutionRecordInsertRouteGeneratedTypesSummary | null;
  generatedTypesStatus: "available" | "absent" | "unknown";
  generatedTypesPresent: boolean;
  executionRecordsTableTyped: boolean;
  generatedTypesVersion?: string | null;
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteMigrationValidationSummary = {
  sourceSummary?: ExecutionRecordInsertRouteMigrationSummary | null;
  migrationApplicationStatus: "proven" | "unproven" | "unknown";
  migrationApplied: boolean;
  migrationVersion?: string | null;
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteRlsSecurityValidationSummary = {
  sourceSummary?: ExecutionRecordInsertRouteRlsSecuritySummary | null;
  rlsSecurityProofPresent: boolean;
  rlsPolicyVerified: boolean;
  serviceRoleWriteBoundaryVerified: boolean;
  userScopedWriteBoundaryVerified: boolean;
  routeAuthSecretRequirementsDocumented: boolean;
  clientSideInsertCallsAllowed: false;
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteServerOnlyBoundaryValidationSummary = {
  sourceSummary?: ExecutionRecordInsertRouteServerOnlyBoundarySummary | null;
  serverOnlyRequestContext?: ExecutionRecordInsertRouteServerOnlyRequestContext | null;
  serverOnlyBoundaryProofPresent: boolean;
  serverOnlyRequestContextPresent: boolean;
  routeHandlerBoundaryVerified: boolean;
  clientWritePathAbsent: boolean;
  productionRouteReachableFromDevPreview: false;
  browserCallablePathAbsent: boolean;
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteIdempotencyDuplicateValidationSummary = {
  sourceSummary?: ExecutionRecordInsertRouteIdempotencyDuplicateSummary | null;
  idempotencyMetadataPresent: boolean;
  idempotencyKeyPresent: boolean;
  recordFingerprintPresent: boolean;
  sourceFingerprintPresent: boolean;
  brokerResultFingerprintPresent: boolean;
  duplicatePreventionMetadataPresent: boolean;
  duplicateLookupCompleted: boolean;
  duplicateMatches: ExecutionRecordDuplicateMatch[];
  duplicateConflictsRequireReview: boolean;
  missingWeakOrConflictingFingerprints: boolean;
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteAuditCorrectionValidationSummary = {
  sourceSummary?: ExecutionRecordInsertRouteAuditCorrectionSummary | null;
  auditCorrectionMetadataPresent: boolean;
  auditPolicyReviewed: boolean;
  sourceEvidenceChainPresent: boolean;
  auditAppendRequiresSeparateBoundary: true;
  correctionRollbackRequiresSeparateBoundary: true;
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteEvidenceProvenanceValidationSummary = {
  sourceSummary?: ExecutionRecordInsertRouteEvidenceProvenanceSummary | null;
  sourceEvidencePresent: boolean;
  sourceEvidenceIds: string[];
  provenanceComplete: boolean;
  uiStateAloneAcceptedAsEvidence: false;
  brokerConfirmationEvidencePresent: boolean;
  finalizationEvidencePresent: boolean;
  candidateBuilderEvidencePresent: boolean;
  persistenceAdapterEvidencePresent: boolean;
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteManualApprovalValidationSummary = {
  sourceSummary?: ExecutionRecordInsertRouteManualApprovalSummary | null;
  manualApprovalMetadataPresent: boolean;
  manualApprovalRequired: boolean;
  manualApprovalSatisfied: boolean;
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  automaticModeAllowed: false;
  automaticModeDisabled: true;
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteDryRunProductionSeparationValidationSummary =
  {
    sourceSummary?: ExecutionRecordInsertRouteDryRunProductionSeparationSummary | null;
    dryRunRouteStatus: "known" | "unknown" | "unsupported";
    dryRunRouteAvailable: boolean;
    dryRunRouteIsProductionRoute: false;
    dryRunSuccessIsProductionReadiness: false;
    productionRouteStatus: "absent" | "future_boundary_required" | "unknown";
    productionRouteSeparatedFromDryRun: boolean;
    productionInsertRequiresSeparateBoundary: true;
    insertReadinessCallsDryRunRoute: false;
    insertReadinessCallsProductionRoute: false;
    blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
    warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
    reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordInsertRoutePostInsertBoundaryValidationSummary = {
  sourceSummary?: ExecutionRecordInsertRoutePostInsertBoundarySummary | null;
  auditAppendApproved: false;
  statsPnlUpdateApproved: false;
  rollbackCorrectionApproved: false;
  tradeMutationApproved: false;
  brokerOrderApproved: false;
  avanzaBrowserApproved: false;
  automaticModeApproved: false;
  auditAppendRequiresSeparateBoundary: true;
  statsUpdateRequiresSeparateBoundary: true;
  rollbackCorrectionRequiresSeparateBoundary: true;
  tradeMutationRequiresSeparateBoundary: true;
  reconciliationRequiresSeparateBoundary: true;
  failureRecoveryRequiresSeparateBoundary: true;
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteReadinessValidationInput = {
  contractVersion: ExecutionRecordInsertRouteReadinessValidatorContractVersion;
  requestedAt: string;
  readinessInput?: ExecutionRecordInsertRouteReadinessInput | null;
  readinessResult?: ExecutionRecordInsertRouteReadinessResult | null;
  actualValidatorWrapperResult?: ActualPersistenceValidatorBoundaryCallImplementationResult | null;
  actualValidatorOutputSummary?: ExecutionRecordInsertRouteActualValidatorSummary | null;
  normalizedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  normalizedInputSummary?: ExecutionRecordInsertRouteNormalizedInputSummary | null;
  schemaReadinessSummary?: ExecutionRecordInsertRouteSchemaReadinessSummary | null;
  generatedTypesSummary?: ExecutionRecordInsertRouteGeneratedTypesSummary | null;
  migrationSummary?: ExecutionRecordInsertRouteMigrationSummary | null;
  rlsSecuritySummary?: ExecutionRecordInsertRouteRlsSecuritySummary | null;
  serverOnlyBoundarySummary?: ExecutionRecordInsertRouteServerOnlyBoundarySummary | null;
  idempotencyDuplicateSummary?: ExecutionRecordInsertRouteIdempotencyDuplicateSummary | null;
  auditCorrectionSummary?: ExecutionRecordInsertRouteAuditCorrectionSummary | null;
  evidenceProvenanceSummary?: ExecutionRecordInsertRouteEvidenceProvenanceSummary | null;
  dryRunProductionSeparationSummary?: ExecutionRecordInsertRouteDryRunProductionSeparationSummary | null;
  manualApprovalSummary?: ExecutionRecordInsertRouteManualApprovalSummary | null;
  postInsertBoundarySummary?: ExecutionRecordInsertRoutePostInsertBoundarySummary | null;
  serverOnlyRequestContext?: ExecutionRecordInsertRouteServerOnlyRequestContext | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteReadinessValidationResult = {
  contractVersion: ExecutionRecordInsertRouteReadinessValidatorContractVersion;
  evaluatedAt: string;
  status: ExecutionRecordInsertRouteReadinessValidationStatus;
  decisionRecommendation: ExecutionRecordInsertRouteReadinessValidationDecisionRecommendation;
  input?: ExecutionRecordInsertRouteReadinessValidationInput | null;
  routeEligibilityValidationSummary: ExecutionRecordInsertRouteEligibilityValidationSummary;
  actualValidatorValidationSummary: ExecutionRecordInsertRouteActualValidatorValidationSummary;
  normalizedInputValidationSummary: ExecutionRecordInsertRouteNormalizedInputValidationSummary;
  schemaReadinessValidationSummary: ExecutionRecordInsertRouteSchemaReadinessValidationSummary;
  generatedTypesValidationSummary: ExecutionRecordInsertRouteGeneratedTypesValidationSummary;
  migrationValidationSummary: ExecutionRecordInsertRouteMigrationValidationSummary;
  rlsSecurityValidationSummary: ExecutionRecordInsertRouteRlsSecurityValidationSummary;
  serverOnlyBoundaryValidationSummary: ExecutionRecordInsertRouteServerOnlyBoundaryValidationSummary;
  idempotencyDuplicateValidationSummary: ExecutionRecordInsertRouteIdempotencyDuplicateValidationSummary;
  auditCorrectionValidationSummary: ExecutionRecordInsertRouteAuditCorrectionValidationSummary;
  evidenceProvenanceValidationSummary: ExecutionRecordInsertRouteEvidenceProvenanceValidationSummary;
  manualApprovalValidationSummary: ExecutionRecordInsertRouteManualApprovalValidationSummary;
  dryRunProductionSeparationValidationSummary: ExecutionRecordInsertRouteDryRunProductionSeparationValidationSummary;
  postInsertBoundaryValidationSummary: ExecutionRecordInsertRoutePostInsertBoundaryValidationSummary;
  safetyPolicyValidationSummary: ExecutionRecordInsertRouteSafetyPolicyValidationSummary;
  authorityFlags: ExecutionRecordInsertRouteReadinessAuthorityFlags;
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  metadata?: Record<string, unknown>;
};
