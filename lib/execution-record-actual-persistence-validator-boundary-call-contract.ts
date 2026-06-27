import type {
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceInput,
  ExecutionRecordPersistenceResult,
  ExecutionRecordPersistenceSchemaReference,
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

// Future boundary-call contract metadata only. These types describe when a
// later system may call the actual execution-record persistence validator and
// what that validation-only result may report. They do not implement the call,
// call persistence validators, call insert routes, create execution records,
// persist, write Supabase/localStorage, append audit records, update stats/PnL,
// roll back, mutate trades, wire UI, automate browser/Avanza behavior, run
// broker actions, or enable automatic mode.

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_CONTRACT_VERSION =
  "actual_persistence_validator_boundary_call_v1" as const;

export type ActualPersistenceValidatorBoundaryCallContractVersion =
  typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_CONTRACT_VERSION;

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_STATUSES = [
  "actual_persistence_validator_call_ready",
  "actual_persistence_validator_call_blocked",
  "actual_persistence_validator_call_needs_review",
  "actual_persistence_validator_call_unsupported",
  "actual_persistence_validator_call_invalid",
  "actual_persistence_validator_not_called_future_boundary",
] as const;

export type ActualPersistenceValidatorBoundaryCallStatus =
  (typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_STATUSES)[number];

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_DECISION_RECOMMENDATIONS =
  [
    "may_call_actual_persistence_validator_only",
    "needs_manual_review",
    "blocked_do_not_call_actual_persistence_validator",
    "unsupported_do_not_call_actual_persistence_validator",
    "invalid_do_not_call_actual_persistence_validator",
    "future_boundary_not_called",
  ] as const;

export type ActualPersistenceValidatorBoundaryCallDecisionRecommendation =
  (typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_DECISION_RECOMMENDATIONS)[number];

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_BLOCKED_REASONS = [
  "missing_composer_result",
  "composer_not_ready",
  "adapter_not_ready",
  "integration_validation_not_valid",
  "missing_proposed_persistence_input",
  "missing_required_persistence_field",
  "generated_types_absent_or_unknown",
  "migration_application_not_proven",
  "schema_readiness_absent_or_unknown",
  "missing_idempotency_metadata",
  "missing_duplicate_prevention_metadata",
  "missing_audit_correction_metadata",
  "missing_source_evidence",
  "missing_rls_security_proof",
  "missing_server_only_boundary",
  "missing_dry_run_route_status",
  "manual_approval_missing",
  "authority_flags_not_false",
  "automatic_mode_not_allowed",
  "insert_route_call_not_allowed",
  "write_authority_not_allowed",
] as const;

export type ActualPersistenceValidatorBoundaryBlockedReason =
  (typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_BLOCKED_REASONS)[number];

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_WARNINGS = [
  "contract_only",
  "actual_call_not_implemented",
  "actual_validator_call_not_write_approval",
  "actual_validator_valid_not_insert_approval",
  "actual_validator_valid_not_record_creation_approval",
  "actual_validator_valid_not_persistence_approval",
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

export type ActualPersistenceValidatorBoundaryWarning =
  (typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_WARNINGS)[number];

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_REVIEW_ITEMS = [
  "composer_result_review",
  "adapter_result_review",
  "integration_validation_result_review",
  "proposed_persistence_input_review",
  "source_evidence_review",
  "fingerprint_review",
  "broker_final_note_identifier_review",
  "schema_readiness_review",
  "generated_types_review",
  "migration_application_review",
  "idempotency_review",
  "duplicate_prevention_review",
  "audit_correction_review",
  "rls_security_review",
  "server_only_boundary_review",
  "dry_run_route_review",
  "manual_approval_review",
  "authority_flags_review",
  "post_call_boundary_review",
  "insert_route_boundary_review",
  "production_write_boundary_review",
] as const;

export type ActualPersistenceValidatorBoundaryReviewItem =
  (typeof ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_REVIEW_ITEMS)[number];

export type ActualPersistenceValidatorBoundarySafetyPolicy = {
  contractOnly: true;
  actualCallImplemented: false;
  futureCallValidationOnly: true;
  safeToCallActualPersistenceValidator: false;
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
  policyReason: string;
};

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_DEFAULT_SAFETY_POLICY = {
  contractOnly: true,
  actualCallImplemented: false,
  futureCallValidationOnly: true,
  safeToCallActualPersistenceValidator: false,
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
  policyReason:
    "Actual persistence validator boundary call contract types are contract-only. They do not implement or call the actual persistence validator, call insert routes, create execution records, persist, finalize, update stats/PnL, append audit records, roll back, mutate trades, run broker actions, automate browser/Avanza behavior, or enable automatic mode.",
} as const satisfies ActualPersistenceValidatorBoundarySafetyPolicy;

export type ActualPersistenceValidatorBoundaryPostCallBoundarySummary = {
  safeToCallInsertRoute: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  safeToAppendAudit: false;
  safeToUpdateStats: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  safeToRunBrokerAction: false;
  safeToRunAvanzaBrowserAction: false;
  automaticModeAllowed: false;
  insertRouteRequiresSeparateBoundary: true;
  productionWriteRequiresSeparateBoundary: true;
  auditAppendRequiresSeparateBoundary: true;
  statsUpdateRequiresSeparateBoundary: true;
  rollbackCorrectionRequiresSeparateBoundary: true;
  tradeMutationRequiresSeparateBoundary: true;
  brokerAvanzaRequiresSeparateBoundary: true;
  reason: string;
};

export const ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_DEFAULT_POST_CALL_BOUNDARY =
  {
    safeToCallInsertRoute: false,
    safeToCreateExecutionRecord: false,
    safeToPersist: false,
    safeToAppendAudit: false,
    safeToUpdateStats: false,
    safeToRollback: false,
    safeToMutateTrade: false,
    safeToRunBrokerAction: false,
    safeToRunAvanzaBrowserAction: false,
    automaticModeAllowed: false,
    insertRouteRequiresSeparateBoundary: true,
    productionWriteRequiresSeparateBoundary: true,
    auditAppendRequiresSeparateBoundary: true,
    statsUpdateRequiresSeparateBoundary: true,
    rollbackCorrectionRequiresSeparateBoundary: true,
    tradeMutationRequiresSeparateBoundary: true,
    brokerAvanzaRequiresSeparateBoundary: true,
    reason:
      "A future valid actual persistence validator result is validation-only and is not insert, execution-record creation, persistence, audit append, stats/PnL, rollback/correction, trade mutation, broker, or Avanza/browser approval.",
  } as const satisfies ActualPersistenceValidatorBoundaryPostCallBoundarySummary;

export type ActualPersistenceValidatorBoundaryComposerSummary = {
  composerResult?: ExecutionRecordPersistenceValidatorIntegrationReadinessResult | null;
  composerResultPresent: boolean;
  composerStatus?: string | null;
  composerReady: boolean;
  composerReportsNotCalledFutureBoundary: boolean;
  adapterResultPresent: boolean;
  integrationValidationResultPresent: boolean;
  proposedPersistenceInputSummaryPresent: boolean;
  allWriteActionAuthorityFlagsFalse: boolean;
  blockedReasons: ActualPersistenceValidatorBoundaryBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryProposedInputSummary = {
  proposedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  proposedPersistenceInputPresent: boolean;
  proposedPersistenceInputComplete: boolean;
  proposedInputIsValidationOnly: true;
  persistenceContractVersionKnown: boolean;
  requestedAtPresent: boolean;
  candidatePresent: boolean;
  brokerConfirmationPresent: boolean;
  associationPresent: boolean;
  userContextPresent: boolean;
  safetyChecklistPresent: boolean;
  auditMetadataPresent: boolean;
  schemaReferencePresent: boolean;
  missingRequiredPersistenceInputFields: (keyof ExecutionRecordPersistenceInput | string)[];
  safeToCallActualPersistenceValidator: false;
  safeToCallInsertRoute: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  blockedReasons: ActualPersistenceValidatorBoundaryBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundarySchemaReadinessSummary = {
  schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
  schemaReadinessKnown: boolean;
  schemaReadyForValidation: boolean;
  schemaAlignedWithPersistenceInput: boolean;
  executionRecordsTableExpected: true;
  executionRecordsTablePresent?: boolean | null;
  productionWriteReadinessBlockedBySchema: boolean;
  blockedReasons: ActualPersistenceValidatorBoundaryBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryGeneratedTypesSummary = {
  generatedTypesStatus: "available" | "absent" | "unknown";
  generatedTypesPresent: boolean;
  generatedTypesReviewed: boolean;
  generatedTypesLocation?: string | null;
  generatedTypesMatchExecutionRecordsSchema: boolean;
  callBlockedWhenAbsentOrUnknown: true;
  blockedReasons: ActualPersistenceValidatorBoundaryBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryMigrationSummary = {
  migrationApplicationStatus: "proven" | "not_proven" | "unknown";
  migrationApplied: boolean;
  migrationReference?: string | null;
  migrationVerifiedAgainstTargetProject: boolean;
  callBlockedWhenNotProven: true;
  blockedReasons: ActualPersistenceValidatorBoundaryBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryIdempotencySummary = {
  idempotencyMetadataPresent: boolean;
  idempotencyKey?: string | null;
  recordFingerprint?: string | null;
  sourceFingerprint?: string | null;
  brokerResultFingerprint?: string | null;
  candidateFingerprint?: string | null;
  integrationFingerprint?: string | null;
  requiredFingerprintsPresent: boolean;
  conflictingFingerprintsDetected: boolean;
  safeForValidationReview: boolean;
  safeForWrite: false;
  blockedReasons: ActualPersistenceValidatorBoundaryBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryDuplicatePreventionSummary = {
  duplicatePreventionMetadataPresent: boolean;
  duplicateLookupRequiredBeforeWrite: true;
  duplicateLookupCompleted: boolean;
  duplicateMatches?: ExecutionRecordDuplicateMatch[];
  duplicateDetected: boolean;
  conflictingDuplicateRequiresReview: boolean;
  safeForValidationReview: boolean;
  safeForWrite: false;
  blockedReasons: ActualPersistenceValidatorBoundaryBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryAuditCorrectionSummary = {
  auditCorrectionMetadataPresent: boolean;
  auditProvenanceMetadataPresent: boolean;
  sourceEvidenceChainPresent: boolean;
  sourceEventIds: string[];
  correctionPolicyReviewed: boolean;
  rollbackPolicyReviewed: boolean;
  auditAppendRequiresSeparateBoundary: true;
  correctionRollbackRequiresSeparateBoundary: true;
  safeToAppendAudit: false;
  safeToRollback: false;
  blockedReasons: ActualPersistenceValidatorBoundaryBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundarySecuritySummary = {
  rlsSecurityStatus: "proven" | "missing" | "unknown";
  rlsSecurityProofPresent: boolean;
  securityAssumptionsReviewed: boolean;
  callBlockedWhenProofMissing: true;
  safeForValidationReview: boolean;
  safeForWrite: false;
  blockedReasons: ActualPersistenceValidatorBoundaryBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryServerOnlySummary = {
  serverOnlyBoundaryStatus: "proven" | "missing" | "unknown";
  serverOnlyBoundaryProofPresent: boolean;
  clientWriteAccessPrevented: boolean;
  callBlockedWhenBoundaryMissing: true;
  safeForValidationReview: boolean;
  safeForWrite: false;
  blockedReasons: ActualPersistenceValidatorBoundaryBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryDryRunRouteSummary = {
  dryRunRouteStatus: "known" | "missing" | "unknown";
  dryRunRouteMetadataPresent: boolean;
  dryRunRouteIsProductionInsert: false;
  productionInsertRouteReady: false;
  dryRunRouteDoesNotAuthorizeWrite: true;
  blockedReasons: ActualPersistenceValidatorBoundaryBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryManualApprovalSummary = {
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  manualApprovalMetadataPresent: boolean;
  manualApprovalRequired: boolean;
  manualApprovalSatisfied: boolean;
  automaticModeAllowed: false;
  blockedReasons: ActualPersistenceValidatorBoundaryBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundarySourceEvidenceSummary = {
  sourceEvidencePresent: boolean;
  sourceEvidenceFingerprint?: string | null;
  candidateFingerprint?: string | null;
  builderFingerprint?: string | null;
  integrationFingerprint?: string | null;
  brokerOrderId?: string | null;
  brokerConfirmationId?: string | null;
  brokerResultId?: string | null;
  finalNoteId?: string | null;
  finalNoteFingerprint?: string | null;
  provenanceMetadata?: Record<string, unknown>;
  blockedReasons: ActualPersistenceValidatorBoundaryBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryCallInput = {
  contractVersion?: ActualPersistenceValidatorBoundaryCallContractVersion;
  requestedAt: string;
  composerResult?: ExecutionRecordPersistenceValidatorIntegrationReadinessResult | null;
  adapterResult?: ExecutionRecordPersistenceValidatorIntegrationAdapterResult | null;
  integrationValidationResult?:
    | ExecutionRecordPersistenceValidatorIntegrationValidationResult
    | null;
  proposedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  composerSummary?: ActualPersistenceValidatorBoundaryComposerSummary | null;
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
    | ActualPersistenceValidatorBoundaryDuplicatePreventionSummary
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
  safetyPolicy?: ActualPersistenceValidatorBoundarySafetyPolicy | null;
  metadata?: Record<string, unknown>;
};

export type ActualPersistenceValidatorBoundaryCallResult = {
  contractVersion: ActualPersistenceValidatorBoundaryCallContractVersion;
  evaluatedAt: string;
  status: ActualPersistenceValidatorBoundaryCallStatus;
  decisionRecommendation: ActualPersistenceValidatorBoundaryCallDecisionRecommendation;
  input?: ActualPersistenceValidatorBoundaryCallInput | null;
  actualValidatorResult?: ExecutionRecordPersistenceResult | null;
  composerSummary?: ActualPersistenceValidatorBoundaryComposerSummary | null;
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
    | ActualPersistenceValidatorBoundaryDuplicatePreventionSummary
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
  postCallBoundarySummary: ActualPersistenceValidatorBoundaryPostCallBoundarySummary;
  safetyPolicy: ActualPersistenceValidatorBoundarySafetyPolicy;
  blockedReasons: ActualPersistenceValidatorBoundaryBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryReviewItem[];
  contractOnly: true;
  validationOnly: true;
  actualCallImplemented: false;
  actualPersistenceValidatorCalled: false;
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
