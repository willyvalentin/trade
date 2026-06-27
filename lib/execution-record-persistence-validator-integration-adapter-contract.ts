import type {
  ExecutionRecordCandidateBuilderInvocationOutputSummary,
  ExecutionRecordCandidateBuilderInvocationResult,
} from "@/lib/execution-record-candidate-builder-invocation-contract";
import type { ExecutionRecordCandidate } from "@/lib/execution-record-creation-contract";
import type {
  ExecutionRecordBrokerConfirmationMetadata,
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceAuditMetadata,
  ExecutionRecordPersistenceInput,
  ExecutionRecordPersistenceSafetyChecklist,
  ExecutionRecordPersistenceSchemaReference,
  ExecutionRecordPersistenceUserContext,
} from "@/lib/execution-record-persistence-contract";
import type {
  ExecutionRecordPersistenceAuditCorrectionSummary,
  ExecutionRecordPersistenceCandidateOutputSummary,
  ExecutionRecordPersistenceDryRunRouteSummary,
  ExecutionRecordPersistenceIdempotencySummary,
  ExecutionRecordPersistenceSchemaReadinessSummary,
  ExecutionRecordPersistenceSecuritySummary,
  ExecutionRecordPersistenceValidatorIntegrationInput,
  ExecutionRecordPersistenceValidatorIntegrationResult,
} from "@/lib/execution-record-persistence-validator-integration-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Contract metadata only. These types describe a future pure adapter that
// shapes candidate-only execution-record builder output into proposed
// persistence-validator input metadata. They do not implement adapter logic,
// call persistence validators, call insert routes, create execution records,
// persist, write Supabase/localStorage, append audit records, update stats/PnL,
// roll back, mutate trades, wire UI, capture browser/Avanza behavior, run
// broker actions, or enable automatic mode.

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_CONTRACT_VERSION =
  "execution_record_persistence_validator_integration_adapter_v1" as const;

export type ExecutionRecordPersistenceValidatorIntegrationAdapterContractVersion =
  typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_CONTRACT_VERSION;

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_STATUSES =
  [
    "persistence_adapter_ready",
    "persistence_adapter_needs_review",
    "persistence_adapter_blocked",
    "persistence_adapter_unsupported",
    "persistence_adapter_not_ready",
  ] as const;

export type ExecutionRecordPersistenceValidatorIntegrationAdapterStatus =
  (typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_STATUSES)[number];

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_DECISION_RECOMMENDATIONS =
  [
    "shape_persistence_input_only",
    "needs_manual_review",
    "blocked_do_not_validate_persistence",
    "unsupported_do_not_validate_persistence",
    "not_ready_do_not_validate_persistence",
  ] as const;

export type ExecutionRecordPersistenceValidatorIntegrationAdapterDecisionRecommendation =
  (typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_BLOCKED_REASONS =
  [
    "missing_persistence_integration_input",
    "missing_persistence_integration_result",
    "integration_not_ready",
    "missing_candidate_builder_output",
    "candidate_output_not_candidate_only",
    "missing_execution_record_persistence_contract",
    "missing_required_persistence_input_field",
    "missing_idempotency_metadata",
    "missing_audit_correction_metadata",
    "missing_schema_readiness",
    "generated_types_absent_or_unknown",
    "migration_application_not_proven",
    "missing_rls_security_proof",
    "missing_server_only_write_boundary",
    "missing_dry_run_route_status",
    "missing_duplicate_prevention",
    "manual_approval_missing",
    "unsupported_source",
    "unsupported_broker",
    "safety_policy_authority_violation",
    "persistence_validator_call_not_allowed",
    "insert_route_call_not_allowed",
    "write_authority_not_allowed",
  ] as const;

export type ExecutionRecordPersistenceValidatorIntegrationAdapterBlockedReason =
  (typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_WARNINGS =
  [
    "contract_only",
    "adapter_not_implemented",
    "proposed_persistence_input_only",
    "persistence_validator_not_called",
    "insert_route_not_called",
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

export type ExecutionRecordPersistenceValidatorIntegrationAdapterWarning =
  (typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_WARNINGS)[number];

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_REVIEW_ITEMS =
  [
    "persistence_integration_input_review",
    "persistence_integration_result_review",
    "candidate_builder_output_review",
    "candidate_only_boundary_review",
    "proposed_persistence_input_review",
    "field_mapping_review",
    "precondition_review",
    "schema_readiness_review",
    "generated_types_review",
    "migration_application_review",
    "idempotency_review",
    "duplicate_prevention_review",
    "audit_correction_review",
    "rls_security_review",
    "server_only_write_boundary_review",
    "dry_run_route_review",
    "manual_approval_review",
    "safety_policy_review",
    "production_write_boundary_review",
  ] as const;

export type ExecutionRecordPersistenceValidatorIntegrationAdapterReviewItem =
  (typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_REVIEW_ITEMS)[number];

export type ExecutionRecordPersistenceValidatorIntegrationAdapterSafetyPolicy =
  {
    contractOnly: true;
    adapterOnly: true;
    proposedPersistenceInputOnly: true;
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
    adapterImplemented: false;
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
    policyReason: string;
  };

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_DEFAULT_SAFETY_POLICY =
  {
    contractOnly: true,
    adapterOnly: true,
    proposedPersistenceInputOnly: true,
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
    adapterImplemented: false,
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
    policyReason:
      "Execution-record persistence validator integration adapter contract types are contract-only, adapter-only, and proposed-persistence-input-only. They do not implement an adapter, call persistence validators, call insert routes, create execution records, persist, finalize, update stats/PnL, append audit records, roll back, mutate trades, run broker actions, automate browser/Avanza behavior, or enable automatic mode.",
  } as const satisfies ExecutionRecordPersistenceValidatorIntegrationAdapterSafetyPolicy;

export type ExecutionRecordPersistenceValidatorAdapterProposedInputSummary = {
  proposedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  proposedPersistenceInputPresent: boolean;
  proposedPersistenceInputComplete: boolean;
  proposedPersistenceInputIsReviewOnly: true;
  persistenceContractVersionKnown: boolean;
  requestedAtPresent: boolean;
  candidatePresent: boolean;
  brokerConfirmationPresent: boolean;
  associationPresent: boolean;
  userContextPresent: boolean;
  safetyChecklistPresent: boolean;
  auditMetadataPresent: boolean;
  schemaReferencePresent: boolean;
  duplicateMatches?: ExecutionRecordDuplicateMatch[];
  missingRequiredPersistenceInputFields: (keyof ExecutionRecordPersistenceInput | string)[];
  safeToCallPersistenceValidator: false;
  safeToCallInsertRoute: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationAdapterBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationAdapterWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationAdapterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceValidatorAdapterFieldMappingSummary = {
  candidateBuilderOutput?: ExecutionRecordCandidate | null;
  invocationResult?: ExecutionRecordCandidateBuilderInvocationResult | null;
  invocationOutputSummary?:
    | ExecutionRecordCandidateBuilderInvocationOutputSummary
    | null;
  candidateIdMapped: boolean;
  candidateFingerprintMapped: boolean;
  sourceEvidenceChainMapped: boolean;
  brokerFinalizationMetadataMapped: boolean;
  executionValuesMapped: boolean;
  quantityPriceCurrencyFeesFxMapped: boolean;
  settlementAndFinalNoteFieldsMapped: boolean;
  idempotencyKeysMapped: boolean;
  auditProvenanceFieldsMapped: boolean;
  manualApprovalFieldsMapped: boolean;
  schemaTypeReadinessFieldsMapped: boolean;
  dryRunRouteMetadataMapped: boolean;
  brokerConfirmation?: ExecutionRecordBrokerConfirmationMetadata | null;
  persistenceSafetyChecklist?: ExecutionRecordPersistenceSafetyChecklist | null;
  unmappedRequiredFields: (keyof ExecutionRecordPersistenceInput | string)[];
  mappingWarnings: ExecutionRecordPersistenceValidatorIntegrationAdapterWarning[];
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationAdapterBlockedReason[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationAdapterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceValidatorAdapterPreconditionSummary = {
  persistenceIntegrationInputPresent: boolean;
  persistenceIntegrationResultPresent: boolean;
  persistenceIntegrationReady: boolean;
  candidateBuilderInvocationResultPresent: boolean;
  candidateBuilderOutputPresent: boolean;
  candidateOutputOnly: boolean;
  executionRecordCandidatePresent: boolean;
  idempotencyMetadataPresent: boolean;
  recordFingerprintPresent: boolean;
  sourceFingerprintPresent: boolean;
  auditCorrectionMetadataPresent: boolean;
  schemaReadinessAcknowledged: boolean;
  generatedTypesStatusAcknowledged: boolean;
  migrationApplicationStatusAcknowledged: boolean;
  rlsSecurityStatusAcknowledged: boolean;
  serverOnlyWriteBoundaryStatusAcknowledged: boolean;
  dryRunRouteStatusAcknowledged: boolean;
  duplicatePreventionStatusAcknowledged: boolean;
  manualApprovalRequired: boolean;
  manualApprovalPresent: boolean;
  noWriteAuthorityRequested: boolean;
  allAuthorityFlagsFalse: boolean;
  canShapeProposedPersistenceInput: boolean;
  safeToCallPersistenceValidator: false;
  safeToCallInsertRoute: false;
  safeToPersist: false;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationAdapterBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationAdapterWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationAdapterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceValidatorAdapterSchemaReadinessSummary = {
  integrationSchemaReadinessSummary?:
    | ExecutionRecordPersistenceSchemaReadinessSummary
    | null;
  schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
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
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationAdapterBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationAdapterWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationAdapterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceValidatorAdapterIdempotencySummary = {
  integrationIdempotencySummary?:
    | ExecutionRecordPersistenceIdempotencySummary
    | null;
  idempotencyMetadataPresent: boolean;
  idempotencyKey?: string | null;
  recordFingerprint?: string | null;
  sourceFingerprint?: string | null;
  brokerResultFingerprint?: string | null;
  brokerOrderFingerprint?: string | null;
  requiredFingerprintsPresent: boolean;
  duplicatePreventionPresent: boolean;
  duplicateLookupRequiredBeforeWrite: true;
  duplicateLookupCompleted: boolean;
  duplicateMatches?: ExecutionRecordDuplicateMatch[];
  duplicateDetected: boolean;
  conflictingDuplicateRequiresReview: boolean;
  safeForProposedInputShaping: boolean;
  safeForWrite: false;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationAdapterBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationAdapterWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationAdapterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceValidatorAdapterAuditCorrectionSummary = {
  integrationAuditCorrectionSummary?:
    | ExecutionRecordPersistenceAuditCorrectionSummary
    | null;
  auditMetadata?: ExecutionRecordPersistenceAuditMetadata | null;
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
  safeForProposedInputShaping: boolean;
  safeForWrite: false;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationAdapterBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationAdapterWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationAdapterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceValidatorAdapterSecuritySummary = {
  integrationSecuritySummary?:
    | ExecutionRecordPersistenceSecuritySummary
    | null;
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
  safeForProposedInputShaping: boolean;
  safeForWrite: false;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationAdapterBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationAdapterWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationAdapterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceValidatorAdapterDryRunRouteSummary = {
  integrationDryRunRouteSummary?:
    | ExecutionRecordPersistenceDryRunRouteSummary
    | null;
  dryRunRouteStatusAcknowledged: boolean;
  dryRunRouteKnown: boolean;
  dryRunRouteDevToolsGated: boolean;
  dryRunRouteRejectsNonDryRun: boolean;
  dryRunRouteMayCallPersistenceValidatorInDryRun: boolean;
  adapterCallsPersistenceValidator: false;
  adapterCallsInsertRoute: false;
  dryRunRouteWritesSupabase: false;
  dryRunRouteAppendsAudit: false;
  dryRunRouteUpdatesStats: false;
  dryRunRouteMutatesTrade: false;
  dryRunRouteRunsBrokerAction: false;
  dryRunRouteRunsAvanzaOrBrowser: false;
  dryRunOutputIsProductionInsertReadiness: false;
  productionInsertRouteReady: false;
  safeForProposedInputShaping: boolean;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationAdapterBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationAdapterWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationAdapterReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceValidatorIntegrationAdapterInput = {
  contractVersion: ExecutionRecordPersistenceValidatorIntegrationAdapterContractVersion;
  requestedAt: string;
  persistenceIntegrationInput?:
    | ExecutionRecordPersistenceValidatorIntegrationInput
    | null;
  persistenceIntegrationResult?:
    | ExecutionRecordPersistenceValidatorIntegrationResult
    | null;
  invocationResult?: ExecutionRecordCandidateBuilderInvocationResult | null;
  candidateBuilderOutputSummary?:
    | ExecutionRecordPersistenceCandidateOutputSummary
    | ExecutionRecordCandidateBuilderInvocationOutputSummary
    | null;
  candidateOutput?: ExecutionRecordCandidate | null;
  proposedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  idempotencySummary?:
    | ExecutionRecordPersistenceValidatorAdapterIdempotencySummary
    | ExecutionRecordPersistenceIdempotencySummary
    | null;
  auditCorrectionSummary?:
    | ExecutionRecordPersistenceValidatorAdapterAuditCorrectionSummary
    | ExecutionRecordPersistenceAuditCorrectionSummary
    | null;
  schemaReadinessSummary?:
    | ExecutionRecordPersistenceValidatorAdapterSchemaReadinessSummary
    | ExecutionRecordPersistenceSchemaReadinessSummary
    | null;
  securitySummary?:
    | ExecutionRecordPersistenceValidatorAdapterSecuritySummary
    | ExecutionRecordPersistenceSecuritySummary
    | null;
  dryRunRouteSummary?:
    | ExecutionRecordPersistenceValidatorAdapterDryRunRouteSummary
    | ExecutionRecordPersistenceDryRunRouteSummary
    | null;
  manualApprovalContext?:
    | FinalizationActionValidatorManualApprovalContext
    | null;
  safetyPolicy?:
    | ExecutionRecordPersistenceValidatorIntegrationAdapterSafetyPolicy
    | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceValidatorIntegrationAdapterResult = {
  contractVersion: ExecutionRecordPersistenceValidatorIntegrationAdapterContractVersion;
  evaluatedAt: string;
  status: ExecutionRecordPersistenceValidatorIntegrationAdapterStatus;
  decisionRecommendation: ExecutionRecordPersistenceValidatorIntegrationAdapterDecisionRecommendation;
  input?: ExecutionRecordPersistenceValidatorIntegrationAdapterInput | null;
  proposedInputSummary: ExecutionRecordPersistenceValidatorAdapterProposedInputSummary;
  fieldMappingSummary: ExecutionRecordPersistenceValidatorAdapterFieldMappingSummary;
  preconditionSummary: ExecutionRecordPersistenceValidatorAdapterPreconditionSummary;
  schemaReadinessSummary: ExecutionRecordPersistenceValidatorAdapterSchemaReadinessSummary;
  idempotencySummary: ExecutionRecordPersistenceValidatorAdapterIdempotencySummary;
  auditCorrectionSummary: ExecutionRecordPersistenceValidatorAdapterAuditCorrectionSummary;
  securitySummary: ExecutionRecordPersistenceValidatorAdapterSecuritySummary;
  dryRunRouteSummary: ExecutionRecordPersistenceValidatorAdapterDryRunRouteSummary;
  safetyPolicy: ExecutionRecordPersistenceValidatorIntegrationAdapterSafetyPolicy;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationAdapterBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationAdapterWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationAdapterReviewItem[];
  contractOnly: true;
  adapterOnly: true;
  proposedPersistenceInputOnly: true;
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
  adapterImplemented: false;
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
