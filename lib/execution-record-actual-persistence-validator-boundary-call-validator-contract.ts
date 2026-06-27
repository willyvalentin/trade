import type {
  ActualPersistenceValidatorBoundaryAuditCorrectionSummary,
  ActualPersistenceValidatorBoundaryCallInput,
  ActualPersistenceValidatorBoundaryCallResult,
  ActualPersistenceValidatorBoundaryCallStatus,
  ActualPersistenceValidatorBoundaryComposerSummary,
  ActualPersistenceValidatorBoundaryDryRunRouteSummary,
  ActualPersistenceValidatorBoundaryGeneratedTypesSummary,
  ActualPersistenceValidatorBoundaryIdempotencySummary,
  ActualPersistenceValidatorBoundaryManualApprovalSummary,
  ActualPersistenceValidatorBoundaryMigrationSummary,
  ActualPersistenceValidatorBoundaryPostCallBoundarySummary,
  ActualPersistenceValidatorBoundaryProposedInputSummary,
  ActualPersistenceValidatorBoundarySchemaReadinessSummary,
  ActualPersistenceValidatorBoundarySecuritySummary,
  ActualPersistenceValidatorBoundaryServerOnlySummary,
  ActualPersistenceValidatorBoundarySourceEvidenceSummary,
} from "@/lib/execution-record-actual-persistence-validator-boundary-call-contract";
import type {
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceInput,
} from "@/lib/execution-record-persistence-contract";
import type {
  ExecutionRecordPersistenceValidatorIntegrationReadinessResult,
} from "@/lib/execution-record-persistence-validator-integration";
import type {
  ExecutionRecordPersistenceValidatorIntegrationAdapterResult,
} from "@/lib/execution-record-persistence-validator-integration-adapter-contract";
import type {
  ExecutionRecordPersistenceValidatorIntegrationValidationResult,
} from "@/lib/execution-record-persistence-validator-integration-validator-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Future boundary-call validator contract metadata only. These types describe a
// later validator that may decide whether an actual persistence validator call
// is allowed. They do not implement validation logic, call persistence
// validators, call insert routes, create execution records, persist, write
// Supabase/localStorage, append audit records, update stats/PnL, roll back,
// mutate trades, wire UI, capture browser/Avanza behavior, run broker actions,
// or enable automatic mode.

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATOR_CONTRACT_VERSION =
  "actual_persistence_validator_boundary_call_validator_v1" as const;

export type ActualPersistenceValidatorBoundaryCallValidatorContractVersion =
  typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATOR_CONTRACT_VERSION;

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATION_STATUSES =
  [
    "actual_persistence_validator_boundary_validation_valid",
    "actual_persistence_validator_boundary_validation_needs_review",
    "actual_persistence_validator_boundary_validation_blocked",
    "actual_persistence_validator_boundary_validation_unsupported",
    "actual_persistence_validator_boundary_validation_invalid",
  ] as const;

export type ActualPersistenceValidatorBoundaryCallValidationStatus =
  (typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATION_STATUSES)[number];

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATION_DECISION_RECOMMENDATIONS =
  [
    "may_call_actual_persistence_validator_only",
    "needs_manual_review",
    "blocked_do_not_call_actual_persistence_validator",
    "unsupported_do_not_call_actual_persistence_validator",
    "invalid_do_not_call_actual_persistence_validator",
  ] as const;

export type ActualPersistenceValidatorBoundaryCallValidationDecisionRecommendation =
  (typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATION_DECISION_RECOMMENDATIONS)[number];

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATION_BLOCKED_REASONS =
  [
    "missing_boundary_input",
    "missing_composer_result",
    "composer_not_ready",
    "actual_validator_already_called_unexpectedly",
    "adapter_not_ready",
    "integration_validation_not_valid",
    "missing_proposed_persistence_input",
    "missing_required_persistence_field",
    "missing_source_evidence",
    "generated_types_absent_or_unknown",
    "migration_application_not_proven",
    "schema_readiness_absent_or_unknown",
    "missing_idempotency_metadata",
    "missing_duplicate_prevention_metadata",
    "conflicting_fingerprint",
    "missing_audit_correction_metadata",
    "missing_rls_security_proof",
    "missing_server_only_boundary",
    "missing_dry_run_route_status",
    "manual_approval_missing",
    "authority_flags_not_false",
    "automatic_mode_enabled",
    "unsupported_source",
    "unsupported_broker",
    "insert_route_call_not_allowed",
    "write_authority_not_allowed",
  ] as const;

export type ActualPersistenceValidatorBoundaryCallValidationBlockedReason =
  (typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATION_BLOCKED_REASONS)[number];

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATION_WARNINGS =
  [
    "contract_only",
    "validator_not_implemented",
    "actual_validator_not_called",
    "actual_validator_boundary_validation_not_write_approval",
    "may_call_actual_persistence_validator_only_not_insert_approval",
    "may_call_actual_persistence_validator_only_not_record_creation_approval",
    "dry_run_insert_not_production_insert",
    "generated_types_required_before_call",
    "migration_application_required_before_call",
    "rls_security_required_before_call",
    "server_only_boundary_required_before_call",
    "duplicate_prevention_required_before_call",
    "audit_required_before_write",
    "stats_update_out_of_scope",
    "trade_mutation_out_of_scope",
  ] as const;

export type ActualPersistenceValidatorBoundaryCallValidationWarning =
  (typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATION_WARNINGS)[number];

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATION_REVIEW_ITEMS =
  [
    "boundary_input_review",
    "composer_result_review",
    "actual_validator_not_called_boundary_review",
    "adapter_result_review",
    "integration_validation_result_review",
    "proposed_persistence_input_review",
    "required_persistence_field_review",
    "source_evidence_review",
    "fingerprint_review",
    "schema_generated_types_review",
    "migration_application_review",
    "idempotency_duplicate_review",
    "audit_correction_review",
    "security_server_only_review",
    "dry_run_route_review",
    "manual_approval_review",
    "authority_flags_review",
    "post_call_boundary_review",
    "insert_route_boundary_review",
    "production_write_boundary_review",
  ] as const;

export type ActualPersistenceValidatorBoundaryCallValidationReviewItem =
  (typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATION_REVIEW_ITEMS)[number];

export type ActualPersistenceValidatorBoundaryAuthorityFlags = {
  validationOnly: true;
  actualPersistenceValidatorCallAllowedOnly: false;
  safeToCallInsertRoute: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  safeToFinalize: false;
  safeToUpdateStats: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  safeToRunBrokerAction: false;
  safeToRunAvanzaBrowserAction: false;
  automaticModeAllowed: false;
  actualPersistenceValidatorCallAttempted: false;
  insertRouteCallAttempted: false;
  executionRecordCreationAttempted: false;
  persistenceAttempted: false;
  finalizationAttempted: false;
  statsUpdateAttempted: false;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  tradeMutationAttempted: false;
  brokerAutomationAttempted: false;
  avanzaAutomationAttempted: false;
  browserAutomationAttempted: false;
};

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_DEFAULT_AUTHORITY_FLAGS = {
  validationOnly: true,
  actualPersistenceValidatorCallAllowedOnly: false,
  safeToCallInsertRoute: false,
  safeToCreateExecutionRecord: false,
  safeToPersist: false,
  safeToFinalize: false,
  safeToUpdateStats: false,
  safeToAppendAudit: false,
  safeToRollback: false,
  safeToMutateTrade: false,
  safeToRunBrokerAction: false,
  safeToRunAvanzaBrowserAction: false,
  automaticModeAllowed: false,
  actualPersistenceValidatorCallAttempted: false,
  insertRouteCallAttempted: false,
  executionRecordCreationAttempted: false,
  persistenceAttempted: false,
  finalizationAttempted: false,
  statsUpdateAttempted: false,
  auditAppendAttempted: false,
  rollbackAttempted: false,
  tradeMutationAttempted: false,
  brokerAutomationAttempted: false,
  avanzaAutomationAttempted: false,
  browserAutomationAttempted: false,
} as const satisfies ActualPersistenceValidatorBoundaryAuthorityFlags;

export type ActualPersistenceValidatorBoundaryCallReadinessSummary = {
  boundaryInput?: ActualPersistenceValidatorBoundaryCallInput | null;
  boundaryInputPresent: boolean;
  boundaryCallStatus?: ActualPersistenceValidatorBoundaryCallStatus | null;
  mayCallActualPersistenceValidatorOnly: boolean;
  actualValidatorAlreadyCalledUnexpectedly: boolean;
  actualValidatorCallAllowedOnly: boolean;
  safeToCallInsertRoute: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryCallValidationWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryCallValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryComposerValidationSummary = {
  composerResult?: ExecutionRecordPersistenceValidatorIntegrationReadinessResult | null;
  composerSummary?: ActualPersistenceValidatorBoundaryComposerSummary | null;
  composerResultPresent: boolean;
  composerReady: boolean;
  composerReadinessValidated: boolean;
  composerReportsNotCalledFutureBoundary: boolean;
  blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryCallValidationWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryCallValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryProposedInputValidationSummary = {
  proposedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  proposedInputSummary?: ActualPersistenceValidatorBoundaryProposedInputSummary | null;
  proposedPersistenceInputPresent: boolean;
  proposedPersistenceInputComplete: boolean;
  requiredPersistenceInputFieldsPresent: boolean;
  missingRequiredPersistenceInputFields: (keyof ExecutionRecordPersistenceInput | string)[];
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
  sourceEvidencePresent: boolean;
  idempotencyFingerprintValuesPresent: boolean;
  auditCorrectionMetadataPresent: boolean;
  manualApprovalContextPresent: boolean;
  finalizationMetadataPresent: boolean;
  safeToPersist: false;
  blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryCallValidationWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryCallValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundarySchemaGeneratedTypesValidationSummary =
  {
    schemaReadinessSummary?:
      | ActualPersistenceValidatorBoundarySchemaReadinessSummary
      | null;
    generatedTypesSummary?:
      | ActualPersistenceValidatorBoundaryGeneratedTypesSummary
      | null;
    schemaReadinessKnown: boolean;
    schemaSufficientForValidation: boolean;
    generatedTypesStatus: "available" | "absent" | "unknown";
    generatedTypesPresent: boolean;
    tableColumnReadinessKnown: boolean;
    nullableRequiredSemanticsReviewed: boolean;
    jsonMetadataFieldCompatibilityReviewed: boolean;
    runtimeDbWritesAllowed: false;
    blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallValidationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ActualPersistenceValidatorBoundaryMigrationValidationSummary = {
  migrationSummary?: ActualPersistenceValidatorBoundaryMigrationSummary | null;
  migrationApplicationStatus: "proven" | "not_proven" | "unknown";
  migrationApplicationProven: boolean;
  migrationReference?: string | null;
  targetProjectVerified: boolean;
  runtimeMigrationApplicationAllowed: false;
  blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryCallValidationWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryCallValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryIdempotencyDuplicateValidationSummary =
  {
    idempotencySummary?:
      | ActualPersistenceValidatorBoundaryIdempotencySummary
      | null;
    duplicatePreventionSummary?:
      | ActualPersistenceValidatorBoundaryDuplicatePreventionValidationInput
      | null;
    idempotencyMetadataPresent: boolean;
    requiredFingerprintFieldsPresent: boolean;
    candidateOutputFingerprintPreserved: boolean;
    finalNoteBrokerReferenceIdentityPresent: boolean;
    conflictingFingerprintDetected: boolean;
    duplicatePreventionMetadataPresent: boolean;
    duplicateMatches?: ExecutionRecordDuplicateMatch[];
    duplicatePreventionReady: boolean;
    safeForWrite: false;
    blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallValidationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ActualPersistenceValidatorBoundaryDuplicatePreventionValidationInput = {
  duplicatePreventionMetadataPresent: boolean;
  duplicateLookupCompleted: boolean;
  duplicateDetected: boolean;
  conflictingDuplicateRequiresReview: boolean;
  duplicateMatches?: ExecutionRecordDuplicateMatch[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryAuditCorrectionValidationSummary =
  {
    auditCorrectionSummary?:
      | ActualPersistenceValidatorBoundaryAuditCorrectionSummary
      | null;
    sourceEvidenceChainPresent: boolean;
    manualApprovalContextPresent: boolean;
    correctionBeforeAfterValuesRequiredLater: boolean;
    auditAppendSeparateFutureBoundary: true;
    correctionRollbackSeparateFutureBoundary: true;
    safeToAppendAudit: false;
    safeToRollback: false;
    blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallValidationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ActualPersistenceValidatorBoundarySecurityServerOnlyValidationSummary =
  {
    securitySummary?: ActualPersistenceValidatorBoundarySecuritySummary | null;
    serverOnlySummary?:
      | ActualPersistenceValidatorBoundaryServerOnlySummary
      | null;
    rlsSecurityProofPresent: boolean;
    rlsSecurityRequiredForActualCall: boolean;
    serverOnlyBoundaryProofPresent: boolean;
    serverOnlyBoundaryRequiredForActualCall: boolean;
    clientWriteAccessPrevented: boolean;
    safeForWrite: false;
    blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallValidationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ActualPersistenceValidatorBoundaryDryRunRouteValidationSummary = {
  dryRunRouteSummary?: ActualPersistenceValidatorBoundaryDryRunRouteSummary | null;
  dryRunRouteStatus: "known" | "missing" | "unknown";
  dryRunRouteStatusKnown: boolean;
  dryRunRouteIsProductionInsert: false;
  insertRouteCallSeparateFutureBoundary: true;
  safeToCallInsertRoute: false;
  blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryCallValidationWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryCallValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryManualApprovalValidationSummary =
  {
    manualApprovalSummary?:
      | ActualPersistenceValidatorBoundaryManualApprovalSummary
      | null;
    manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
    manualApprovalRequired: boolean;
    manualApprovalMetadataPresent: boolean;
    manualApprovalSatisfied: boolean;
    automaticModeAllowed: false;
    blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallValidationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ActualPersistenceValidatorBoundaryPostCallBoundaryValidationSummary =
  {
    postCallBoundarySummary?:
      | ActualPersistenceValidatorBoundaryPostCallBoundarySummary
      | null;
    noInsertRouteCall: true;
    noExecutionRecordCreation: true;
    noPersistenceWrite: true;
    noSupabaseLocalStorageWrite: true;
    noAuditAppend: true;
    noStatsPnlUpdate: true;
    noRollbackCorrection: true;
    noTradeMutation: true;
    noBrokerOrderBehavior: true;
    noAvanzaBrowserBehavior: true;
    automaticModeDisabled: true;
    separateFutureInsertReadinessBoundaryRequired: true;
    blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallValidationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ActualPersistenceValidatorBoundaryCallValidationInput = {
  contractVersion?: ActualPersistenceValidatorBoundaryCallValidatorContractVersion;
  requestedAt: string;
  boundaryInput?: ActualPersistenceValidatorBoundaryCallInput | null;
  boundaryResult?: ActualPersistenceValidatorBoundaryCallResult | null;
  composerResult?: ExecutionRecordPersistenceValidatorIntegrationReadinessResult | null;
  adapterResult?: ExecutionRecordPersistenceValidatorIntegrationAdapterResult | null;
  integrationValidationResult?:
    | ExecutionRecordPersistenceValidatorIntegrationValidationResult
    | null;
  proposedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  proposedInputSummary?: ActualPersistenceValidatorBoundaryProposedInputSummary | null;
  sourceEvidenceSummary?: ActualPersistenceValidatorBoundarySourceEvidenceSummary | null;
  schemaReadinessSummary?:
    | ActualPersistenceValidatorBoundarySchemaReadinessSummary
    | null;
  generatedTypesSummary?:
    | ActualPersistenceValidatorBoundaryGeneratedTypesSummary
    | null;
  migrationSummary?: ActualPersistenceValidatorBoundaryMigrationSummary | null;
  idempotencySummary?:
    | ActualPersistenceValidatorBoundaryIdempotencySummary
    | null;
  duplicatePreventionSummary?:
    | ActualPersistenceValidatorBoundaryDuplicatePreventionValidationInput
    | null;
  auditCorrectionSummary?:
    | ActualPersistenceValidatorBoundaryAuditCorrectionSummary
    | null;
  securitySummary?: ActualPersistenceValidatorBoundarySecuritySummary | null;
  serverOnlySummary?: ActualPersistenceValidatorBoundaryServerOnlySummary | null;
  dryRunRouteSummary?: ActualPersistenceValidatorBoundaryDryRunRouteSummary | null;
  manualApprovalSummary?:
    | ActualPersistenceValidatorBoundaryManualApprovalSummary
    | null;
  authorityFlags?: ActualPersistenceValidatorBoundaryAuthorityFlags | null;
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryCallValidationResult = {
  contractVersion: ActualPersistenceValidatorBoundaryCallValidatorContractVersion;
  evaluatedAt: string;
  status: ActualPersistenceValidatorBoundaryCallValidationStatus;
  decisionRecommendation: ActualPersistenceValidatorBoundaryCallValidationDecisionRecommendation;
  input?: ActualPersistenceValidatorBoundaryCallValidationInput | null;
  readinessSummary: ActualPersistenceValidatorBoundaryCallReadinessSummary;
  composerValidationSummary: ActualPersistenceValidatorBoundaryComposerValidationSummary;
  proposedInputValidationSummary: ActualPersistenceValidatorBoundaryProposedInputValidationSummary;
  schemaGeneratedTypesValidationSummary:
    ActualPersistenceValidatorBoundarySchemaGeneratedTypesValidationSummary;
  migrationValidationSummary: ActualPersistenceValidatorBoundaryMigrationValidationSummary;
  idempotencyDuplicateValidationSummary:
    ActualPersistenceValidatorBoundaryIdempotencyDuplicateValidationSummary;
  auditCorrectionValidationSummary:
    ActualPersistenceValidatorBoundaryAuditCorrectionValidationSummary;
  securityServerOnlyValidationSummary:
    ActualPersistenceValidatorBoundarySecurityServerOnlyValidationSummary;
  dryRunRouteValidationSummary: ActualPersistenceValidatorBoundaryDryRunRouteValidationSummary;
  manualApprovalValidationSummary:
    ActualPersistenceValidatorBoundaryManualApprovalValidationSummary;
  postCallBoundaryValidationSummary:
    ActualPersistenceValidatorBoundaryPostCallBoundaryValidationSummary;
  authorityFlags: ActualPersistenceValidatorBoundaryAuthorityFlags;
  blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryCallValidationWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryCallValidationReviewItem[];
  validationOnly: true;
  validatorImplemented: false;
  actualValidatorCalled: false;
  safeToCallInsertRoute: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  safeToFinalize: false;
  safeToUpdateStats: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  safeToRunBrokerAction: false;
  safeToRunAvanzaBrowserAction: false;
  automaticModeAllowed: false;
  metadata?: Record<string, unknown>;
};
