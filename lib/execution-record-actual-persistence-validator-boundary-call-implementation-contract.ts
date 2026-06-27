import type {
  ActualPersistenceValidatorBoundaryAuditCorrectionSummary,
  ActualPersistenceValidatorBoundaryCallInput,
  ActualPersistenceValidatorBoundaryDryRunRouteSummary,
  ActualPersistenceValidatorBoundaryGeneratedTypesSummary,
  ActualPersistenceValidatorBoundaryIdempotencySummary,
  ActualPersistenceValidatorBoundaryManualApprovalSummary,
  ActualPersistenceValidatorBoundaryMigrationSummary,
  ActualPersistenceValidatorBoundaryProposedInputSummary,
  ActualPersistenceValidatorBoundarySchemaReadinessSummary,
  ActualPersistenceValidatorBoundarySecuritySummary,
  ActualPersistenceValidatorBoundaryServerOnlySummary,
  ActualPersistenceValidatorBoundarySourceEvidenceSummary,
} from "@/lib/execution-record-actual-persistence-validator-boundary-call-contract";
import type {
  ActualPersistenceValidatorBoundaryCallValidationInput,
  ActualPersistenceValidatorBoundaryCallValidationResult,
  ActualPersistenceValidatorBoundaryDuplicatePreventionValidationInput,
} from "@/lib/execution-record-actual-persistence-validator-boundary-call-validator-contract";
import type {
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceInput,
  ExecutionRecordPersistenceResult,
  ExecutionRecordPersistenceSchemaReference,
} from "@/lib/execution-record-persistence-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Future actual-persistence-validator boundary-call implementation contract
// metadata only. These types describe a later validation-only wrapper around
// the actual persistence validator. They do not implement the wrapper, call the
// actual persistence validator, call insert routes, create execution records,
// persist, write Supabase/localStorage, append audit records, update stats/PnL,
// roll back, mutate trades, wire UI, capture browser/Avanza behavior, run
// broker actions, or enable automatic mode.

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_CONTRACT_VERSION =
  "actual_persistence_validator_boundary_call_implementation_v1" as const;

export type ActualPersistenceValidatorBoundaryCallImplementationContractVersion =
  typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_CONTRACT_VERSION;

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_STATUSES =
  [
    "actual_persistence_validator_boundary_call_validated",
    "actual_persistence_validator_boundary_call_blocked",
    "actual_persistence_validator_boundary_call_needs_review",
    "actual_persistence_validator_boundary_call_invalid",
    "actual_persistence_validator_boundary_call_not_called",
  ] as const;

export type ActualPersistenceValidatorBoundaryCallImplementationStatus =
  (typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_STATUSES)[number];

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_DECISION_RECOMMENDATIONS =
  [
    "actual_validator_valid_do_not_insert",
    "needs_manual_review",
    "blocked_do_not_insert",
    "invalid_do_not_insert",
    "not_called",
  ] as const;

export type ActualPersistenceValidatorBoundaryCallImplementationDecisionRecommendation =
  (typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_DECISION_RECOMMENDATIONS)[number];

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_BLOCKED_REASONS =
  [
    "missing_boundary_call_validation_result",
    "boundary_call_validation_not_valid",
    "missing_proposed_persistence_input",
    "missing_actual_persistence_validator_callable",
    "generated_types_absent_or_unknown",
    "migration_application_not_proven",
    "schema_readiness_absent_or_unknown",
    "missing_source_evidence",
    "missing_idempotency_metadata",
    "missing_duplicate_prevention_metadata",
    "missing_audit_correction_metadata",
    "missing_rls_security_proof",
    "missing_server_only_boundary",
    "missing_dry_run_route_status",
    "manual_approval_missing",
    "actual_validator_call_not_allowed",
    "actual_validator_callable_failed",
    "insert_route_call_not_allowed",
    "write_authority_not_allowed",
    "authority_flags_not_false",
    "automatic_mode_not_allowed",
  ] as const;

export type ActualPersistenceValidatorBoundaryCallImplementationBlockedReason =
  (typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_BLOCKED_REASONS)[number];

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_WARNINGS =
  [
    "contract_only",
    "implementation_not_created",
    "actual_validator_not_called",
    "actual_validator_valid_not_insert_approval",
    "actual_validator_valid_not_record_creation_approval",
    "actual_validator_valid_not_persistence_approval",
    "actual_validator_valid_not_audit_approval",
    "actual_validator_valid_not_stats_approval",
    "actual_validator_valid_not_trade_mutation_approval",
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

export type ActualPersistenceValidatorBoundaryCallImplementationWarning =
  (typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_WARNINGS)[number];

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_REVIEW_ITEMS =
  [
    "boundary_call_validation_review",
    "actual_validator_callable_review",
    "proposed_persistence_input_review",
    "normalized_input_review",
    "validator_output_review",
    "source_evidence_review",
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

export type ActualPersistenceValidatorBoundaryCallImplementationReviewItem =
  (typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_REVIEW_ITEMS)[number];

export type ActualPersistenceValidatorBoundaryCallImplementationSafetyPolicy =
  {
    contractOnly: boolean;
    implementationCreated: boolean;
    validationOnly: true;
    safeToCallActualPersistenceValidator: false;
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
    actualPersistenceValidatorCallAttempted: boolean;
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
    policyReason: string;
  };

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_DEFAULT_SAFETY_POLICY =
  {
    contractOnly: true,
    implementationCreated: false,
    validationOnly: true,
    safeToCallActualPersistenceValidator: false,
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
    actualPersistenceValidatorCallAttempted: false,
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
    policyReason:
      "Actual persistence validator boundary-call implementation contract types are contract-only. They do not implement or call the actual persistence validator, call insert routes, create execution records, persist, finalize, append audit records, update stats/PnL, roll back, mutate trades, run broker actions, automate browser/Avanza behavior, or enable automatic mode.",
  } as const satisfies ActualPersistenceValidatorBoundaryCallImplementationSafetyPolicy;

export type ActualPersistenceValidatorBoundaryCallImplementationPostCallBoundarySummary =
  {
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
    insertRouteRequiresSeparateBoundary: true;
    productionWriteRequiresSeparateBoundary: true;
    blockedReasons: ActualPersistenceValidatorBoundaryCallImplementationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallImplementationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallImplementationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_DEFAULT_POST_CALL_BOUNDARY =
  {
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
    noInsertRouteCall: true,
    noExecutionRecordCreation: true,
    noPersistenceWrite: true,
    noSupabaseLocalStorageWrite: true,
    noAuditAppend: true,
    noStatsPnlUpdate: true,
    noRollbackCorrection: true,
    noTradeMutation: true,
    noBrokerOrderBehavior: true,
    noAvanzaBrowserBehavior: true,
    insertRouteRequiresSeparateBoundary: true,
    productionWriteRequiresSeparateBoundary: true,
    blockedReasons: [],
    warnings: [
      "contract_only",
      "implementation_not_created",
      "actual_validator_not_called",
      "actual_validator_valid_not_insert_approval",
      "actual_validator_valid_not_record_creation_approval",
      "actual_validator_valid_not_persistence_approval",
    ],
    reviewItems: ["post_call_boundary_review"],
  } as const satisfies ActualPersistenceValidatorBoundaryCallImplementationPostCallBoundarySummary;

export type ActualPersistenceValidatorCallableMetadata = {
  callablePresent: boolean;
  callableName?: "validateExecutionRecordPersistence" | string;
  callableModule?: string | null;
  callableVersion?: string | null;
  actualValidatorImplemented: boolean;
  actualValidatorCallAllowed: boolean;
  actualValidatorCallAttempted: false;
  validatesOnly: true;
  safeToCallInsertRoute: false;
  safeToPersist: false;
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryCallImplementationCallable = (
  input: ExecutionRecordPersistenceInput,
) => ExecutionRecordPersistenceResult;

export type ActualPersistenceValidatorBoundaryCallImplementationPreconditionSummary =
  {
    boundaryCallValidationResultPresent: boolean;
    boundaryCallValidationValid: boolean;
    decisionAllowsActualValidatorOnly: boolean;
    proposedPersistenceInputPresent: boolean;
    actualPersistenceValidatorCallablePresent: boolean;
    generatedTypesPresent: boolean;
    migrationApplicationProven: boolean;
    schemaReadinessKnown: boolean;
    sourceEvidencePresent: boolean;
    idempotencyMetadataPresent: boolean;
    duplicatePreventionMetadataPresent: boolean;
    auditCorrectionMetadataPresent: boolean;
    rlsSecurityProofPresent: boolean;
    serverOnlyBoundaryPresent: boolean;
    dryRunRouteStatusKnown: boolean;
    manualApprovalMetadataPresent: boolean;
    authorityFlagsFalse: boolean;
    automaticModeDisabled: boolean;
    blockedReasons: ActualPersistenceValidatorBoundaryCallImplementationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallImplementationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallImplementationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ActualPersistenceValidatorBoundaryCallImplementationValidationInputSummary =
  {
    boundaryCallValidationInput?:
      | ActualPersistenceValidatorBoundaryCallValidationInput
      | null;
    boundaryCallValidationResult?:
      | ActualPersistenceValidatorBoundaryCallValidationResult
      | null;
    boundaryCallInput?: ActualPersistenceValidatorBoundaryCallInput | null;
    boundaryCallValidationInputPresent: boolean;
    boundaryCallValidationResultPresent: boolean;
    boundaryCallValidationStatus?:
      | ActualPersistenceValidatorBoundaryCallValidationResult["status"]
      | null;
    proposedPersistenceInput?: ExecutionRecordPersistenceInput | null;
    proposedInputSummary?:
      | ActualPersistenceValidatorBoundaryProposedInputSummary
      | null;
    proposedPersistenceInputPresent: boolean;
    proposedPersistenceInputNormalizedForValidation: boolean;
    safeToCallInsertRoute: false;
    safeToPersist: false;
    blockedReasons: ActualPersistenceValidatorBoundaryCallImplementationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallImplementationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallImplementationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ActualPersistenceValidatorBoundaryCallImplementationValidatorOutputSummary =
  {
    actualValidatorResult?: ExecutionRecordPersistenceResult | null;
    actualValidatorStatus?: ExecutionRecordPersistenceResult["status"] | null;
    actualValidatorCalled: boolean;
    actualValidatorImplemented: boolean;
    actualValidatorValidatedOnly: true;
    actualValidatorValidDoesNotInsert: true;
    validationErrors: string[];
    blockedReasons: ActualPersistenceValidatorBoundaryCallImplementationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallImplementationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallImplementationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ActualPersistenceValidatorBoundaryCallImplementationNormalizedInputSummary =
  {
    proposedPersistenceInput?: ExecutionRecordPersistenceInput | null;
    normalizedProposedInput?: ExecutionRecordPersistenceInput | null;
    normalizedInputPresent: boolean;
    requiredPersistenceFieldsPresent: boolean;
    candidateIdentityPresent: boolean;
    brokerConfirmationPresent: boolean;
    userContextPresent: boolean;
    safetyChecklistPresent: boolean;
    auditMetadataPresent: boolean;
    noWriteFieldsMutated: true;
    safeToPersist: false;
    blockedReasons: ActualPersistenceValidatorBoundaryCallImplementationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallImplementationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallImplementationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ActualPersistenceValidatorBoundaryCallImplementationSchemaValidationSummary =
  {
    schemaReadinessSummary?:
      | ActualPersistenceValidatorBoundarySchemaReadinessSummary
      | null;
    generatedTypesSummary?:
      | ActualPersistenceValidatorBoundaryGeneratedTypesSummary
      | null;
    schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
    schemaReadinessKnown: boolean;
    schemaSufficientForActualValidator: boolean;
    generatedTypesStatus: "available" | "absent" | "unknown";
    generatedTypesPresent: boolean;
    migrationSummary?: ActualPersistenceValidatorBoundaryMigrationSummary | null;
    migrationApplicationStatus: "proven" | "not_proven" | "unknown";
    migrationApplicationProven: boolean;
    runtimeDbWritesAllowed: false;
    blockedReasons: ActualPersistenceValidatorBoundaryCallImplementationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallImplementationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallImplementationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ActualPersistenceValidatorBoundaryCallImplementationIdempotencyDuplicateSummary =
  {
    idempotencySummary?:
      | ActualPersistenceValidatorBoundaryIdempotencySummary
      | null;
    duplicatePreventionSummary?:
      | ActualPersistenceValidatorBoundaryDuplicatePreventionValidationInput
      | null;
    idempotencyMetadataPresent: boolean;
    requiredFingerprintFieldsPresent: boolean;
    duplicatePreventionMetadataPresent: boolean;
    duplicateLookupCompleted: boolean;
    duplicateDetected: boolean;
    conflictingDuplicateRequiresReview: boolean;
    duplicateMatches?: ExecutionRecordDuplicateMatch[];
    safeForWrite: false;
    blockedReasons: ActualPersistenceValidatorBoundaryCallImplementationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallImplementationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallImplementationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ActualPersistenceValidatorBoundaryCallImplementationAuditCorrectionSummary =
  {
    auditCorrectionSummary?:
      | ActualPersistenceValidatorBoundaryAuditCorrectionSummary
      | null;
    auditCorrectionMetadataPresent: boolean;
    sourceEvidenceSummary?:
      | ActualPersistenceValidatorBoundarySourceEvidenceSummary
      | null;
    sourceEvidencePresent: boolean;
    provenanceChainPresent: boolean;
    manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
    manualApprovalContextPresent: boolean;
    auditAppendSeparateFutureBoundary: true;
    correctionRollbackSeparateFutureBoundary: true;
    safeToAppendAudit: false;
    safeToRollback: false;
    blockedReasons: ActualPersistenceValidatorBoundaryCallImplementationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallImplementationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallImplementationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ActualPersistenceValidatorBoundaryCallImplementationSecuritySummary =
  {
    securitySummary?: ActualPersistenceValidatorBoundarySecuritySummary | null;
    serverOnlySummary?:
      | ActualPersistenceValidatorBoundaryServerOnlySummary
      | null;
    rlsSecurityProofPresent: boolean;
    rlsSecurityRequiredForActualValidatorCall: boolean;
    serverOnlyBoundaryPresent: boolean;
    serverOnlyBoundaryRequiredForActualValidatorCall: boolean;
    clientWriteAccessPrevented: boolean;
    safeForWrite: false;
    blockedReasons: ActualPersistenceValidatorBoundaryCallImplementationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallImplementationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallImplementationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ActualPersistenceValidatorBoundaryCallImplementationDryRunManualApprovalSummary =
  {
    dryRunRouteSummary?: ActualPersistenceValidatorBoundaryDryRunRouteSummary | null;
    dryRunRouteStatus: "known" | "missing" | "unknown";
    dryRunRouteStatusKnown: boolean;
    dryRunRouteIsProductionInsert: false;
    manualApprovalSummary?:
      | ActualPersistenceValidatorBoundaryManualApprovalSummary
      | null;
    manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
    manualApprovalMetadataPresent: boolean;
    manualApprovalRequired: boolean;
    manualApprovalSatisfied: boolean;
    automaticModeAllowed: false;
    safeToCallInsertRoute: false;
    blockedReasons: ActualPersistenceValidatorBoundaryCallImplementationBlockedReason[];
    warnings: ActualPersistenceValidatorBoundaryCallImplementationWarning[];
    reviewItems: ActualPersistenceValidatorBoundaryCallImplementationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ActualPersistenceValidatorBoundaryCallImplementationInput = {
  contractVersion?: ActualPersistenceValidatorBoundaryCallImplementationContractVersion;
  requestedAt: string;
  boundaryCallValidationInput?:
    | ActualPersistenceValidatorBoundaryCallValidationInput
    | null;
  boundaryCallValidationResult?:
    | ActualPersistenceValidatorBoundaryCallValidationResult
    | null;
  proposedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  proposedInputSummary?: ActualPersistenceValidatorBoundaryProposedInputSummary | null;
  actualPersistenceValidatorCallable?: ActualPersistenceValidatorCallableMetadata | null;
  actualPersistenceValidatorCallableFunction?:
    | ActualPersistenceValidatorBoundaryCallImplementationCallable
    | null;
  schemaReadinessSummary?:
    | ActualPersistenceValidatorBoundarySchemaReadinessSummary
    | null;
  generatedTypesSummary?:
    | ActualPersistenceValidatorBoundaryGeneratedTypesSummary
    | null;
  migrationSummary?: ActualPersistenceValidatorBoundaryMigrationSummary | null;
  sourceEvidenceSummary?: ActualPersistenceValidatorBoundarySourceEvidenceSummary | null;
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
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  safetyPolicy?:
    | ActualPersistenceValidatorBoundaryCallImplementationSafetyPolicy
    | null;
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryCallImplementationResult = {
  contractVersion: ActualPersistenceValidatorBoundaryCallImplementationContractVersion;
  evaluatedAt: string;
  status: ActualPersistenceValidatorBoundaryCallImplementationStatus;
  decisionRecommendation: ActualPersistenceValidatorBoundaryCallImplementationDecisionRecommendation;
  input?: ActualPersistenceValidatorBoundaryCallImplementationInput | null;
  preconditionSummary:
    ActualPersistenceValidatorBoundaryCallImplementationPreconditionSummary;
  validationInputSummary:
    ActualPersistenceValidatorBoundaryCallImplementationValidationInputSummary;
  validatorOutputSummary:
    ActualPersistenceValidatorBoundaryCallImplementationValidatorOutputSummary;
  normalizedInputSummary:
    ActualPersistenceValidatorBoundaryCallImplementationNormalizedInputSummary;
  schemaValidationSummary:
    ActualPersistenceValidatorBoundaryCallImplementationSchemaValidationSummary;
  idempotencyDuplicateSummary:
    ActualPersistenceValidatorBoundaryCallImplementationIdempotencyDuplicateSummary;
  auditCorrectionSummary:
    ActualPersistenceValidatorBoundaryCallImplementationAuditCorrectionSummary;
  securitySummary: ActualPersistenceValidatorBoundaryCallImplementationSecuritySummary;
  dryRunManualApprovalSummary:
    ActualPersistenceValidatorBoundaryCallImplementationDryRunManualApprovalSummary;
  postCallBoundarySummary:
    ActualPersistenceValidatorBoundaryCallImplementationPostCallBoundarySummary;
  safetyPolicy: ActualPersistenceValidatorBoundaryCallImplementationSafetyPolicy;
  blockedReasons: ActualPersistenceValidatorBoundaryCallImplementationBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryCallImplementationWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryCallImplementationReviewItem[];
  contractOnly: boolean;
  implementationCreated: boolean;
  validationOnly: true;
  actualValidatorCalled: boolean;
  safeToCallActualPersistenceValidator: false;
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
  metadata?: Record<string, unknown>;
};
