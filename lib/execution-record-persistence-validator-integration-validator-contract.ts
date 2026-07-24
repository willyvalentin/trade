import type {
  ExecutionRecordCandidateBuilderInvocationOutputSummary,
  ExecutionRecordCandidateBuilderInvocationResult,
} from "@/lib/execution-record-candidate-builder-invocation-contract";
import type { ExecutionRecordCandidate } from "@/lib/execution-record-creation-contract";
import type {
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceAuditMetadata,
  ExecutionRecordPersistenceInput,
  ExecutionRecordPersistenceSafetyChecklist,
  ExecutionRecordPersistenceSchemaReference,
  ExecutionRecordPersistenceUserContext,
} from "@/lib/execution-record-persistence-contract";
import type {
  ExecutionRecordPersistenceValidatorIntegrationAdapterInput,
  ExecutionRecordPersistenceValidatorIntegrationAdapterResult,
  ExecutionRecordPersistenceValidatorAdapterAuditCorrectionSummary,
  ExecutionRecordPersistenceValidatorAdapterDryRunRouteSummary,
  ExecutionRecordPersistenceValidatorAdapterIdempotencySummary,
  ExecutionRecordPersistenceValidatorAdapterPreconditionSummary,
  ExecutionRecordPersistenceValidatorAdapterProposedInputSummary,
  ExecutionRecordPersistenceValidatorAdapterSchemaReadinessSummary,
  ExecutionRecordPersistenceValidatorAdapterSecuritySummary,
} from "@/lib/execution-record-persistence-validator-integration-adapter-contract";
import type {
  ExecutionRecordPersistenceAuditCorrectionSummary,
  ExecutionRecordPersistenceCandidateOutputSummary,
  ExecutionRecordPersistenceDryRunRouteSummary,
  ExecutionRecordPersistenceIdempotencySummary,
  ExecutionRecordPersistenceReadinessSummary,
  ExecutionRecordPersistenceSchemaReadinessSummary,
  ExecutionRecordPersistenceSecuritySummary,
  ExecutionRecordPersistenceValidatorIntegrationInput,
  ExecutionRecordPersistenceValidatorIntegrationResult,
} from "@/lib/execution-record-persistence-validator-integration-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Contract metadata only. These types describe a future validation layer for
// the persistence-validator integration adapter result. They do not implement a
// validator, call persistence validators, call insert routes, create execution
// records, persist, write Supabase/localStorage, append audit records, update
// stats/PnL, roll back, mutate trades, wire UI, capture browser/Avanza
// behavior, run broker actions, or enable automatic mode.

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATOR_CONTRACT_VERSION =
  "execution_record_persistence_validator_integration_validator_v1" as const;

export type ExecutionRecordPersistenceValidatorIntegrationValidatorContractVersion =
  typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATOR_CONTRACT_VERSION;

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATION_STATUSES =
  [
    "persistence_integration_validation_valid",
    "persistence_integration_validation_needs_review",
    "persistence_integration_validation_blocked",
    "persistence_integration_validation_unsupported",
    "persistence_integration_validation_invalid",
  ] as const;

export type ExecutionRecordPersistenceValidatorIntegrationValidationStatus =
  (typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATION_STATUSES)[number];

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATION_DECISION_RECOMMENDATIONS =
  [
    "validate_readiness_only",
    "needs_manual_review",
    "blocked_do_not_call_persistence_validator",
    "unsupported_do_not_call_persistence_validator",
    "invalid_do_not_call_persistence_validator",
  ] as const;

export type ExecutionRecordPersistenceValidatorIntegrationValidationDecisionRecommendation =
  (typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATION_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATION_BLOCKED_REASONS =
  [
    "missing_adapter_result",
    "invalid_adapter_status",
    "adapter_ready_with_blocked_reasons",
    "missing_proposed_persistence_input",
    "missing_readiness_summary",
    "schema_readiness_absent_or_unknown",
    "generated_types_absent_or_unknown",
    "migration_application_not_proven",
    "missing_idempotency_summary",
    "missing_required_fingerprint",
    "conflicting_fingerprint",
    "missing_audit_correction_summary",
    "missing_rls_security_proof",
    "missing_server_only_write_boundary",
    "missing_dry_run_route_status",
    "manual_approval_missing",
    "unsupported_source",
    "unsupported_broker",
    "safety_policy_authority_violation",
    "persistence_validator_call_not_allowed",
    "insert_route_call_not_allowed",
    "write_authority_not_allowed",
  ] as const;

export type ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason =
  (typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATION_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATION_WARNINGS =
  [
    "validation_only",
    "persistence_adapter_ready_not_validator_call_approval",
    "proposed_persistence_input_not_write_approval",
    "dry_run_insert_not_production_insert",
    "generated_types_required_later",
    "migration_application_required_later",
    "rls_security_required_later",
    "server_only_write_boundary_required_later",
    "audit_required_before_write",
    "idempotency_review_required",
    "duplicate_check_required",
    "stats_update_out_of_scope",
    "trade_mutation_out_of_scope",
  ] as const;

export type ExecutionRecordPersistenceValidatorIntegrationValidationWarning =
  (typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATION_WARNINGS)[number];

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATION_REVIEW_ITEMS =
  [
    "adapter_result_review",
    "adapter_status_review",
    "proposed_persistence_input_review",
    "readiness_summary_review",
    "schema_readiness_review",
    "generated_types_review",
    "migration_application_review",
    "idempotency_review",
    "fingerprint_review",
    "duplicate_prevention_review",
    "audit_correction_review",
    "rls_security_review",
    "server_only_write_boundary_review",
    "dry_run_route_review",
    "manual_approval_review",
    "safety_policy_review",
    "persistence_validator_boundary_review",
    "insert_route_boundary_review",
    "production_write_boundary_review",
  ] as const;

export type ExecutionRecordPersistenceValidatorIntegrationValidationReviewItem =
  (typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATION_REVIEW_ITEMS)[number];

export type ExecutionRecordPersistenceValidatorIntegrationAuthorityFlags = {
  validationOnly: true;
  safeToCallPersistenceValidator: false;
  safeToCallInsertRoute: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  safeToFinalize: false;
  safeToUpdateStats: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  safeToRunBrokerAction: false;
  automaticModeAllowed: false;
  persistenceValidatorCallAttempted: false;
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

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATOR_DEFAULT_AUTHORITY_FLAGS =
  {
    validationOnly: true,
    safeToCallPersistenceValidator: false,
    safeToCallInsertRoute: false,
    safeToCreateExecutionRecord: false,
    safeToPersist: false,
    safeToFinalize: false,
    safeToUpdateStats: false,
    safeToAppendAudit: false,
    safeToRollback: false,
    safeToMutateTrade: false,
    safeToRunBrokerAction: false,
    automaticModeAllowed: false,
    persistenceValidatorCallAttempted: false,
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
  } as const satisfies ExecutionRecordPersistenceValidatorIntegrationAuthorityFlags;

export type ExecutionRecordPersistenceProposedInputValidationSummary = {
  adapterProposedInputSummary?:
    | ExecutionRecordPersistenceValidatorAdapterProposedInputSummary
    | null;
  proposedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  proposedPersistenceInputPresent: boolean;
  proposedPersistenceInputComplete: boolean;
  proposedPersistenceInputIsReviewOnly: true;
  candidate?: ExecutionRecordCandidate | null;
  candidatePresent: boolean;
  candidateOnlyOutputSummary?:
    | ExecutionRecordPersistenceCandidateOutputSummary
    | ExecutionRecordCandidateBuilderInvocationOutputSummary
    | null;
  candidateOutputOnly: boolean;
  requestedAtPresent: boolean;
  brokerConfirmationPresent: boolean;
  associationPresent: boolean;
  userContextPresent: boolean;
  safetyChecklist?: ExecutionRecordPersistenceSafetyChecklist | null;
  safetyChecklistPresent: boolean;
  auditMetadataPresent: boolean;
  schemaReferencePresent: boolean;
  duplicateMatches?: ExecutionRecordDuplicateMatch[];
  missingRequiredPersistenceInputFields: (keyof ExecutionRecordPersistenceInput | string)[];
  proposedInputSafeForPersistenceValidatorReview: boolean;
  proposedInputSafeForWrite: false;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationValidationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceReadinessValidationSummary = {
  adapterPreconditionSummary?:
    | ExecutionRecordPersistenceValidatorAdapterPreconditionSummary
    | null;
  integrationReadinessSummary?: ExecutionRecordPersistenceReadinessSummary | null;
  persistenceIntegrationInput?:
    | ExecutionRecordPersistenceValidatorIntegrationInput
    | null;
  persistenceIntegrationResult?:
    | ExecutionRecordPersistenceValidatorIntegrationResult
    | null;
  adapterResultPresent: boolean;
  adapterStatusRecognized: boolean;
  adapterReadyStatus: boolean;
  adapterHasBlockedReasons: boolean;
  adapterReadyWithBlockedReasons: boolean;
  proposedPersistenceInputPresent: boolean;
  readinessSummaryPresent: boolean;
  candidateBuilderInvocationResultPresent: boolean;
  candidateOutputOnly: boolean;
  manualApprovalRequired: boolean;
  manualApprovalPresent: boolean;
  allAuthorityFlagsFalse: boolean;
  validationOnly: true;
  safeToCallPersistenceValidator: false;
  safeToCallInsertRoute: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationValidationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceSchemaReadinessValidationSummary = {
  adapterSchemaReadinessSummary?:
    | ExecutionRecordPersistenceValidatorAdapterSchemaReadinessSummary
    | null;
  integrationSchemaReadinessSummary?:
    | ExecutionRecordPersistenceSchemaReadinessSummary
    | null;
  schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
  schemaReadinessSummaryPresent: boolean;
  schemaReadinessAcknowledged: boolean;
  executionRecordsTableExpected: true;
  executionRecordsTablePresent?: boolean | null;
  generatedTypesStatusAcknowledged: boolean;
  generatedTypesAvailable: boolean;
  generatedTypesReviewed: boolean;
  generatedTypesLocation?: string | null;
  migrationApplicationStatusAcknowledged: boolean;
  migrationApplicationProven: boolean;
  migrationReference?: string | null;
  schemaAlignedWithPersistenceContract: boolean;
  schemaAlignedWithProposedInput: boolean;
  productionWriteReadinessBlockedBySchema: boolean;
  safeForValidationOnly: boolean;
  safeForWrite: false;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationValidationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceIdempotencyValidationSummary = {
  adapterIdempotencySummary?:
    | ExecutionRecordPersistenceValidatorAdapterIdempotencySummary
    | null;
  integrationIdempotencySummary?:
    | ExecutionRecordPersistenceIdempotencySummary
    | null;
  idempotencySummaryPresent: boolean;
  idempotencyMetadataPresent: boolean;
  idempotencyKey?: string | null;
  recordFingerprint?: string | null;
  sourceFingerprint?: string | null;
  brokerResultFingerprint?: string | null;
  brokerOrderFingerprint?: string | null;
  requiredFingerprintsPresent: boolean;
  conflictingFingerprintDetected: boolean;
  duplicatePreventionPresent: boolean;
  duplicateLookupRequiredBeforeWrite: true;
  duplicateLookupCompleted: boolean;
  duplicateMatches?: ExecutionRecordDuplicateMatch[];
  duplicateDetected: boolean;
  conflictingDuplicateRequiresReview: boolean;
  safeForValidationOnly: boolean;
  safeForWrite: false;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationValidationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceAuditCorrectionValidationSummary = {
  adapterAuditCorrectionSummary?:
    | ExecutionRecordPersistenceValidatorAdapterAuditCorrectionSummary
    | null;
  integrationAuditCorrectionSummary?:
    | ExecutionRecordPersistenceAuditCorrectionSummary
    | null;
  auditMetadata?: ExecutionRecordPersistenceAuditMetadata | null;
  auditCorrectionSummaryPresent: boolean;
  auditProvenanceMetadataPresent: boolean;
  sourceEvidenceChainPresent: boolean;
  sourceEventIds: string[];
  manualApprovalMetadataPresent: boolean;
  manualApprovalContext?:
    | FinalizationActionValidatorManualApprovalContext
    | null;
  correctionPolicyReviewed: boolean;
  rollbackPolicyReviewed: boolean;
  auditAppendSeparate: true;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  safeForValidationOnly: boolean;
  safeForWrite: false;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationValidationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceSecurityValidationSummary = {
  adapterSecuritySummary?:
    | ExecutionRecordPersistenceValidatorAdapterSecuritySummary
    | null;
  integrationSecuritySummary?: ExecutionRecordPersistenceSecuritySummary | null;
  userContext?: ExecutionRecordPersistenceUserContext | null;
  rlsSecurityProofPresent: boolean;
  rlsPolicyReviewed: boolean;
  serverOnlyWriteBoundaryPresent: boolean;
  serviceRoleRestrictedToServer: boolean;
  directClientWritePathAbsent: boolean;
  noProductionUiWriteAction: boolean;
  automaticModeAllowed: false;
  automaticModeReviewed: boolean;
  productionWriteBoundaryPresent: boolean;
  safeForValidationOnly: boolean;
  safeForWrite: false;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationValidationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceDryRunRouteValidationSummary = {
  adapterDryRunRouteSummary?:
    | ExecutionRecordPersistenceValidatorAdapterDryRunRouteSummary
    | null;
  integrationDryRunRouteSummary?:
    | ExecutionRecordPersistenceDryRunRouteSummary
    | null;
  dryRunRouteStatusPresent: boolean;
  dryRunRouteKnown: boolean;
  dryRunRouteDevToolsGated: boolean;
  dryRunRouteRejectsNonDryRun: boolean;
  dryRunRouteMayCallPersistenceValidatorInDryRun: boolean;
  validationContractCallsPersistenceValidator: false;
  validationContractCallsInsertRoute: false;
  dryRunRouteWritesSupabase: false;
  dryRunRouteAppendsAudit: false;
  dryRunRouteUpdatesStats: false;
  dryRunRouteMutatesTrade: false;
  dryRunRouteRunsBrokerAction: false;
  dryRunRouteRunsAvanzaOrBrowser: false;
  dryRunOutputIsProductionInsertReadiness: false;
  productionInsertRouteReady: false;
  safeForValidationOnly: boolean;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationValidationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceSafetyPolicyValidationSummary = {
  authorityFlags: ExecutionRecordPersistenceValidatorIntegrationAuthorityFlags;
  safetyPolicyPresent: boolean;
  validationOnly: true;
  allWriteAuthorityFlagsFalse: boolean;
  allRuntimeMutationAttemptFlagsFalse: boolean;
  persistenceValidatorCallAllowed: false;
  persistenceValidatorCallAttempted: false;
  insertRouteCallAllowed: false;
  insertRouteCallAttempted: false;
  executionRecordCreationAllowed: false;
  executionRecordCreationAttempted: false;
  persistenceAllowed: false;
  persistenceAttempted: false;
  auditAppendAllowed: false;
  auditAppendAttempted: false;
  statsUpdateAllowed: false;
  statsUpdateAttempted: false;
  rollbackAllowed: false;
  rollbackAttempted: false;
  tradeMutationAllowed: false;
  tradeMutationAttempted: false;
  brokerAutomationAllowed: false;
  brokerAutomationAttempted: false;
  automaticModeAllowed: false;
  safetyPolicyAuthorityViolation: boolean;
  policyReason?: string | null;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationValidationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationValidationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceValidatorIntegrationValidationInput = {
  contractVersion: ExecutionRecordPersistenceValidatorIntegrationValidatorContractVersion;
  requestedAt: string;
  adapterInput?: ExecutionRecordPersistenceValidatorIntegrationAdapterInput | null;
  adapterResult?: ExecutionRecordPersistenceValidatorIntegrationAdapterResult | null;
  proposedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  proposedInputSummary?:
    | ExecutionRecordPersistenceProposedInputValidationSummary
    | ExecutionRecordPersistenceValidatorAdapterProposedInputSummary
    | null;
  readinessSummary?:
    | ExecutionRecordPersistenceReadinessValidationSummary
    | ExecutionRecordPersistenceReadinessSummary
    | ExecutionRecordPersistenceValidatorAdapterPreconditionSummary
    | null;
  invocationResult?: ExecutionRecordCandidateBuilderInvocationResult | null;
  candidateOnlyBuilderOutput?: ExecutionRecordCandidate | null;
  candidateOnlyBuilderOutputSummary?:
    | ExecutionRecordPersistenceCandidateOutputSummary
    | ExecutionRecordCandidateBuilderInvocationOutputSummary
    | null;
  schemaReadinessSummary?:
    | ExecutionRecordPersistenceSchemaReadinessValidationSummary
    | ExecutionRecordPersistenceValidatorAdapterSchemaReadinessSummary
    | ExecutionRecordPersistenceSchemaReadinessSummary
    | null;
  idempotencySummary?:
    | ExecutionRecordPersistenceIdempotencyValidationSummary
    | ExecutionRecordPersistenceValidatorAdapterIdempotencySummary
    | ExecutionRecordPersistenceIdempotencySummary
    | null;
  auditCorrectionSummary?:
    | ExecutionRecordPersistenceAuditCorrectionValidationSummary
    | ExecutionRecordPersistenceValidatorAdapterAuditCorrectionSummary
    | ExecutionRecordPersistenceAuditCorrectionSummary
    | null;
  securitySummary?:
    | ExecutionRecordPersistenceSecurityValidationSummary
    | ExecutionRecordPersistenceValidatorAdapterSecuritySummary
    | ExecutionRecordPersistenceSecuritySummary
    | null;
  dryRunRouteSummary?:
    | ExecutionRecordPersistenceDryRunRouteValidationSummary
    | ExecutionRecordPersistenceValidatorAdapterDryRunRouteSummary
    | ExecutionRecordPersistenceDryRunRouteSummary
    | null;
  manualApprovalContext?:
    | FinalizationActionValidatorManualApprovalContext
    | null;
  authorityFlags?:
    | ExecutionRecordPersistenceValidatorIntegrationAuthorityFlags
    | null;
  generatedTypesStatus?: "available" | "absent" | "unknown" | null;
  migrationApplicationStatus?: "proven" | "not_proven" | "unknown" | null;
  rlsSecurityStatus?: "proven" | "missing" | "unknown" | null;
  serverOnlyWriteBoundaryStatus?: "proven" | "missing" | "unknown" | null;
  dryRunInsertRouteStatus?: "known" | "missing" | "unknown" | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceValidatorIntegrationValidationResult = {
  contractVersion: ExecutionRecordPersistenceValidatorIntegrationValidatorContractVersion;
  evaluatedAt: string;
  status: ExecutionRecordPersistenceValidatorIntegrationValidationStatus;
  decisionRecommendation: ExecutionRecordPersistenceValidatorIntegrationValidationDecisionRecommendation;
  input?: ExecutionRecordPersistenceValidatorIntegrationValidationInput | null;
  proposedInputValidationSummary: ExecutionRecordPersistenceProposedInputValidationSummary;
  readinessValidationSummary: ExecutionRecordPersistenceReadinessValidationSummary;
  schemaReadinessValidationSummary: ExecutionRecordPersistenceSchemaReadinessValidationSummary;
  idempotencyValidationSummary: ExecutionRecordPersistenceIdempotencyValidationSummary;
  auditCorrectionValidationSummary: ExecutionRecordPersistenceAuditCorrectionValidationSummary;
  securityValidationSummary: ExecutionRecordPersistenceSecurityValidationSummary;
  dryRunRouteValidationSummary: ExecutionRecordPersistenceDryRunRouteValidationSummary;
  safetyPolicyValidationSummary: ExecutionRecordPersistenceSafetyPolicyValidationSummary;
  authorityFlags: ExecutionRecordPersistenceValidatorIntegrationAuthorityFlags;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationValidationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationValidationReviewItem[];
  contractOnly: true;
  validationOnly: true;
  persistenceReadinessOnly: true;
  candidateOnlyOutputBoundary: true;
  safeToCallPersistenceValidator: false;
  safeToCallInsertRoute: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  safeToFinalize: false;
  safeToUpdateStats: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  safeToRunBrokerAction: false;
  automaticModeAllowed: false;
  validatorImplemented: boolean;
  persistenceValidatorCallAttempted: false;
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
  metadata?: Record<string, unknown>;
};
