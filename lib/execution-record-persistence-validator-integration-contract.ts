import type {
  ExecutionRecordCandidateBuilderInvocationAuditProvenanceSummary,
  ExecutionRecordCandidateBuilderInvocationIdempotencySummary,
  ExecutionRecordCandidateBuilderInvocationOutputSummary,
  ExecutionRecordCandidateBuilderInvocationResult,
  ExecutionRecordCandidateBuilderInvocationSchemaReadinessSummary,
} from "@/lib/execution-record-candidate-builder-invocation-contract";
import type { ExecutionRecordCandidate } from "@/lib/execution-record-creation-contract";
import type {
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceAuditMetadata,
  ExecutionRecordPersistenceInput,
  ExecutionRecordPersistenceResult,
  ExecutionRecordPersistenceSafetyChecklist,
  ExecutionRecordPersistenceSchemaReference,
  ExecutionRecordPersistenceUserContext,
} from "@/lib/execution-record-persistence-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Contract metadata only. These types describe a future handoff between
// candidate-only execution-record builder output and the persistence validator
// boundary. They do not implement integration logic, call persistence
// validators, call insert routes, create execution records, persist, write
// Supabase/localStorage, append audit records, update stats/PnL, roll back,
// mutate trades, wire UI, capture browser/Avanza behavior, run broker actions,
// or enable automatic mode.

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_CONTRACT_VERSION =
  "execution_record_persistence_validator_integration_v1" as const;

export type ExecutionRecordPersistenceValidatorIntegrationContractVersion =
  typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_CONTRACT_VERSION;

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_STATUSES = [
  "persistence_validation_ready",
  "persistence_validation_needs_review",
  "persistence_validation_blocked",
  "persistence_validation_unsupported",
  "persistence_validation_not_ready",
] as const;

export type ExecutionRecordPersistenceValidatorIntegrationStatus =
  (typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_STATUSES)[number];

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_DECISION_RECOMMENDATIONS =
  [
    "validate_persistence_readiness_only",
    "needs_manual_review",
    "blocked_do_not_persist",
    "unsupported_do_not_persist",
    "not_ready_do_not_persist",
  ] as const;

export type ExecutionRecordPersistenceValidatorIntegrationDecisionRecommendation =
  (typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_BLOCKED_REASONS =
  [
    "missing_candidate_builder_output",
    "candidate_output_not_candidate_only",
    "missing_idempotency_metadata",
    "missing_audit_correction_metadata",
    "missing_schema_readiness",
    "generated_types_absent_or_unknown",
    "migration_application_not_proven",
    "missing_rls_security_proof",
    "missing_server_only_write_boundary",
    "missing_duplicate_prevention",
    "missing_dry_run_route_status",
    "persistence_boundary_not_enabled",
    "insert_route_not_production_ready",
    "manual_approval_missing",
    "safety_policy_authority_violation",
    "write_authority_not_allowed",
  ] as const;

export type ExecutionRecordPersistenceValidatorIntegrationBlockedReason =
  (typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_WARNINGS = [
  "contract_only",
  "persistence_readiness_not_write_approval",
  "candidate_output_not_record_creation",
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

export type ExecutionRecordPersistenceValidatorIntegrationWarning =
  (typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_WARNINGS)[number];

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_REVIEW_ITEMS = [
  "candidate_output_review",
  "candidate_only_boundary_review",
  "persistence_input_shape_review",
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

export type ExecutionRecordPersistenceValidatorIntegrationReviewItem =
  (typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_REVIEW_ITEMS)[number];

export type ExecutionRecordPersistenceValidatorIntegrationSafetyPolicy = {
  contractOnly: true;
  persistenceReadinessOnly: true;
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
  persistenceValidatorIntegrationImplemented: false;
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

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_DEFAULT_SAFETY_POLICY =
  {
    contractOnly: true,
    persistenceReadinessOnly: true,
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
    persistenceValidatorIntegrationImplemented: false,
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
      "Execution-record persistence validator integration contract types are contract-only and persistence-readiness-only. They do not call persistence validators, call insert routes, create execution records, persist, finalize, update stats/PnL, append audit records, roll back, mutate trades, run broker actions, automate browser/Avanza behavior, or enable automatic mode.",
  } as const satisfies ExecutionRecordPersistenceValidatorIntegrationSafetyPolicy;

export type ExecutionRecordPersistenceCandidateOutputSummary = {
  invocationResult?: ExecutionRecordCandidateBuilderInvocationResult | null;
  invocationOutputSummary?:
    | ExecutionRecordCandidateBuilderInvocationOutputSummary
    | null;
  candidateOutput?: ExecutionRecordCandidate | null;
  candidateOutputPresent: boolean;
  candidateOutputOnly: boolean;
  candidateOutputValidated: boolean;
  candidateOutputSafeForPersistenceReview: boolean;
  candidateOutputIsExecutionRecordCreation: false;
  candidateOutputHasWriteAuthority: false;
  candidateOutputRequiresPersistenceValidation: true;
  candidateOutputRequiresSeparateWriteApproval: true;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceSchemaReadinessSummary = {
  invocationSchemaReadinessSummary?:
    | ExecutionRecordCandidateBuilderInvocationSchemaReadinessSummary
    | null;
  schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
  schemaReadinessAcknowledged: boolean;
  schemaAvailable: boolean;
  executionRecordsTableExpected: true;
  executionRecordsTablePresent?: boolean | null;
  migrationApplicationProven: boolean;
  migrationReference?: string | null;
  generatedTypesStatusAcknowledged: boolean;
  generatedTypesAvailable: boolean;
  generatedTypesReviewed: boolean;
  generatedTypesLocation?: string | null;
  schemaAlignedWithCandidateOutput: boolean;
  schemaAlignedWithPersistenceInput: boolean;
  productionWriteReadinessBlockedBySchema: boolean;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceIdempotencySummary = {
  invocationIdempotencySummary?:
    | ExecutionRecordCandidateBuilderInvocationIdempotencySummary
    | null;
  idempotencyMetadataPresent: boolean;
  idempotencyKey?: string | null;
  recordFingerprint?: string | null;
  sourceFingerprint?: string | null;
  brokerResultFingerprint?: string | null;
  requiredFingerprintsPresent: boolean;
  duplicatePreventionPresent: boolean;
  duplicateLookupRequiredBeforeWrite: true;
  duplicateLookupCompleted: boolean;
  duplicateMatches?: ExecutionRecordDuplicateMatch[];
  duplicateDetected: boolean;
  conflictingDuplicateRequiresReview: boolean;
  safeForPersistenceReadinessReview: boolean;
  safeForWrite: false;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceAuditCorrectionSummary = {
  invocationAuditProvenanceSummary?:
    | ExecutionRecordCandidateBuilderInvocationAuditProvenanceSummary
    | null;
  auditMetadata?: ExecutionRecordPersistenceAuditMetadata | null;
  auditProvenanceMetadataPresent: boolean;
  sourceEvidenceChainPresent: boolean;
  sourceEventIds: string[];
  manualApprovalMetadataPresent: boolean;
  correctionPolicyReviewed: boolean;
  rollbackPolicyReviewed: boolean;
  auditAppendSeparate: true;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  safeForPersistenceReadinessReview: boolean;
  safeForWrite: false;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceSecuritySummary = {
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
  safeForPersistenceReadinessReview: boolean;
  safeForWrite: false;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceDryRunRouteSummary = {
  dryRunRouteKnown: boolean;
  dryRunRouteDevToolsGated: boolean;
  dryRunRouteRejectsNonDryRun: boolean;
  dryRunRouteCallsPersistenceValidator: boolean;
  dryRunRouteCallsInsertRoute: false;
  dryRunRouteWritesSupabase: false;
  dryRunRouteAppendsAudit: false;
  dryRunRouteUpdatesStats: false;
  dryRunRouteMutatesTrade: false;
  dryRunRouteRunsBrokerAction: false;
  dryRunRouteRunsAvanzaOrBrowser: false;
  dryRunOutputIsProductionInsertReadiness: false;
  productionInsertRouteReady: false;
  safeForPersistenceReadinessReview: boolean;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceReadinessSummary = {
  candidateOutputReadyForValidation: boolean;
  persistenceInputShapeReady: boolean;
  persistenceSafetyChecklist?: ExecutionRecordPersistenceSafetyChecklist | null;
  proposedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  persistenceValidatorResult?: ExecutionRecordPersistenceResult | null;
  persistenceValidatorCallAllowed: false;
  persistenceValidatorCallAttempted: false;
  insertRouteCallAllowed: false;
  insertRouteCallAttempted: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  safeForReadinessOnly: boolean;
  schemaReadiness: ExecutionRecordPersistenceSchemaReadinessSummary;
  idempotency: ExecutionRecordPersistenceIdempotencySummary;
  auditCorrection: ExecutionRecordPersistenceAuditCorrectionSummary;
  security: ExecutionRecordPersistenceSecuritySummary;
  dryRunRoute: ExecutionRecordPersistenceDryRunRouteSummary;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceValidatorIntegrationInput = {
  contractVersion: ExecutionRecordPersistenceValidatorIntegrationContractVersion;
  requestedAt: string;
  invocationResult?: ExecutionRecordCandidateBuilderInvocationResult | null;
  candidateOutputSummary?: ExecutionRecordPersistenceCandidateOutputSummary | null;
  candidateOutput?: ExecutionRecordCandidate | null;
  proposedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  idempotencySummary?: ExecutionRecordPersistenceIdempotencySummary | null;
  auditCorrectionSummary?: ExecutionRecordPersistenceAuditCorrectionSummary | null;
  schemaReadinessSummary?: ExecutionRecordPersistenceSchemaReadinessSummary | null;
  securitySummary?: ExecutionRecordPersistenceSecuritySummary | null;
  dryRunRouteSummary?: ExecutionRecordPersistenceDryRunRouteSummary | null;
  manualApprovalContext?:
    | FinalizationActionValidatorManualApprovalContext
    | null;
  safetyPolicy?:
    | ExecutionRecordPersistenceValidatorIntegrationSafetyPolicy
    | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceValidatorIntegrationResult = {
  contractVersion: ExecutionRecordPersistenceValidatorIntegrationContractVersion;
  evaluatedAt: string;
  status: ExecutionRecordPersistenceValidatorIntegrationStatus;
  decisionRecommendation: ExecutionRecordPersistenceValidatorIntegrationDecisionRecommendation;
  input?: ExecutionRecordPersistenceValidatorIntegrationInput | null;
  candidateOutputSummary: ExecutionRecordPersistenceCandidateOutputSummary;
  readinessSummary: ExecutionRecordPersistenceReadinessSummary;
  schemaReadinessSummary: ExecutionRecordPersistenceSchemaReadinessSummary;
  idempotencySummary: ExecutionRecordPersistenceIdempotencySummary;
  auditCorrectionSummary: ExecutionRecordPersistenceAuditCorrectionSummary;
  securitySummary: ExecutionRecordPersistenceSecuritySummary;
  dryRunRouteSummary: ExecutionRecordPersistenceDryRunRouteSummary;
  safetyPolicy: ExecutionRecordPersistenceValidatorIntegrationSafetyPolicy;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationReviewItem[];
  contractOnly: true;
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
  persistenceValidatorIntegrationImplemented: false;
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
