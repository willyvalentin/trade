import type {
  ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary,
  ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary,
  ExecutionRecordCandidateBuilderIntegrationAdapterResult,
  ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary,
} from "@/lib/execution-record-candidate-builder-integration-adapter-contract";
import type {
  ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary,
  ExecutionRecordCandidateBuilderIntegrationIdempotencySummary,
  ExecutionRecordCandidateBuilderIntegrationInput,
  ExecutionRecordCandidateBuilderIntegrationResult,
  ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary,
} from "@/lib/execution-record-candidate-builder-integration-contract";
import type { ExecutionRecordCandidateBuilderIntegrationValidationResult } from "@/lib/execution-record-candidate-builder-integration-validator-contract";
import type {
  ExecutionRecordCandidateBuilderInvocationAuditProvenanceSummary,
  ExecutionRecordCandidateBuilderInvocationContractVersion,
  ExecutionRecordCandidateBuilderInvocationIdempotencySummary,
  ExecutionRecordCandidateBuilderInvocationInput,
  ExecutionRecordCandidateBuilderInvocationInputSourceSummary,
  ExecutionRecordCandidateBuilderInvocationOutputSummary,
  ExecutionRecordCandidateBuilderInvocationPrerequisiteSummary,
  ExecutionRecordCandidateBuilderInvocationResult,
  ExecutionRecordCandidateBuilderInvocationSafetyPolicy,
  ExecutionRecordCandidateBuilderInvocationSchemaReadinessSummary,
  ExecutionRecordCandidateBuilderInvocationStatus,
} from "@/lib/execution-record-candidate-builder-invocation-contract";
import type { ExecutionRecordCreationInput } from "@/lib/execution-record-creation-contract";
import type { ExecutionRecordFinalizationBridgeValidationResult } from "@/lib/execution-record-finalization-bridge-validator-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";
import type { FinalizationCandidate } from "@/lib/finalization-candidate-contract";
import type { FinalizationToExecutionRecordBridgeResult } from "@/lib/finalization-to-execution-record-bridge-contract";

// Contract metadata only. These types describe a future validation-only
// boundary for execution-record candidate builder invocation metadata. They do
// not implement validation logic, call buildExecutionRecordCandidate, create
// execution-record candidates, create execution records, persist, write
// Supabase/localStorage, finalize, update stats/PnL, append audit records,
// rollback/correct, mutate trades, wire UI, capture browser/Avanza behavior,
// run broker behavior, execute orders, or enable production runtime behavior.

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATOR_CONTRACT_VERSION =
  "execution_record_candidate_builder_invocation_validator_v1" as const;

export type ExecutionRecordCandidateBuilderInvocationValidatorContractVersion =
  typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATOR_CONTRACT_VERSION;

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATION_STATUSES =
  [
    "builder_invocation_validation_valid",
    "builder_invocation_validation_needs_review",
    "builder_invocation_validation_blocked",
    "builder_invocation_validation_unsupported",
    "builder_invocation_validation_invalid",
  ] as const;

export type ExecutionRecordCandidateBuilderInvocationValidationStatus =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATION_STATUSES)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATION_DECISION_RECOMMENDATIONS =
  [
    "validate_only",
    "needs_manual_review",
    "blocked_do_not_call_builder",
    "unsupported_do_not_call_builder",
    "invalid_do_not_call_builder",
  ] as const;

export type ExecutionRecordCandidateBuilderInvocationValidationDecisionRecommendation =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATION_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATION_BLOCKED_REASONS =
  [
    "missing_invocation_result",
    "invalid_invocation_status",
    "invocation_ready_with_blocked_reasons",
    "missing_adapter_validation",
    "adapter_validation_not_valid",
    "missing_proposed_input",
    "missing_required_proposed_input_field",
    "schema_readiness_absent_or_unknown",
    "migration_application_not_proven",
    "generated_types_absent_or_unknown",
    "missing_idempotency_summary",
    "missing_required_fingerprint",
    "conflicting_fingerprint",
    "missing_audit_provenance_summary",
    "manual_approval_missing",
    "unsupported_source",
    "unsupported_broker",
    "safety_policy_authority_violation",
    "candidate_builder_call_not_allowed",
    "execution_record_candidate_creation_not_allowed",
    "write_authority_not_allowed",
  ] as const;

export type ExecutionRecordCandidateBuilderInvocationValidationBlockedReason =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATION_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATION_WARNINGS =
  [
    "validation_only",
    "builder_invocation_ready_not_call_approval",
    "candidate_builder_not_called",
    "candidate_output_not_created",
    "generated_types_required_later",
    "migration_application_required_later",
    "audit_required_before_write",
    "idempotency_review_required",
    "duplicate_check_required",
    "stats_update_out_of_scope",
    "trade_mutation_out_of_scope",
  ] as const;

export type ExecutionRecordCandidateBuilderInvocationValidationWarning =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATION_WARNINGS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATION_REVIEW_ITEMS =
  [
    "invocation_result_review",
    "invocation_status_review",
    "adapter_validation_review",
    "proposed_input_review",
    "schema_readiness_review",
    "generated_types_review",
    "migration_application_review",
    "idempotency_review",
    "duplicate_review",
    "audit_provenance_review",
    "manual_approval_review",
    "safety_policy_review",
    "authority_flags_review",
    "candidate_output_boundary_review",
    "persistence_boundary_review",
  ] as const;

export type ExecutionRecordCandidateBuilderInvocationValidationReviewItem =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATION_REVIEW_ITEMS)[number];

export type ExecutionRecordCandidateBuilderInvocationAuthorityFlags = {
  validationOnly: true;
  safeToCallCandidateBuilder: false;
  safeToCreateExecutionRecordCandidate: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  safeToFinalize: false;
  safeToUpdateStats: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  safeToRunBrokerAction: false;
  automaticModeAllowed: false;
  validatorImplementationEnabled: false;
  candidateBuilderInvocationAttempted: false;
  executionRecordCandidateCreationAttempted: false;
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

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DEFAULT_AUTHORITY_FLAGS =
  {
    validationOnly: true,
    safeToCallCandidateBuilder: false,
    safeToCreateExecutionRecordCandidate: false,
    safeToCreateExecutionRecord: false,
    safeToPersist: false,
    safeToFinalize: false,
    safeToUpdateStats: false,
    safeToAppendAudit: false,
    safeToRollback: false,
    safeToMutateTrade: false,
    safeToRunBrokerAction: false,
    automaticModeAllowed: false,
    validatorImplementationEnabled: false,
    candidateBuilderInvocationAttempted: false,
    executionRecordCandidateCreationAttempted: false,
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
  } as const satisfies ExecutionRecordCandidateBuilderInvocationAuthorityFlags;

export type ExecutionRecordCandidateBuilderInvocationPrerequisiteValidationSummary =
  {
    sourceSummary?:
      | ExecutionRecordCandidateBuilderInvocationPrerequisiteSummary
      | null;
    invocationResultPresent: boolean;
    invocationStatusRecognized: boolean;
    invocationStatus?: ExecutionRecordCandidateBuilderInvocationStatus | null;
    invocationReadyWithRequiredSummaries: boolean;
    invocationReadyWithBlockedReasons: boolean;
    adapterValidationPresent: boolean;
    adapterValidationValidOrReviewGated: boolean;
    proposedInputPresent: boolean;
    proposedInputComplete: boolean;
    schemaReadinessPresent: boolean;
    idempotencySummaryPresent: boolean;
    auditProvenanceSummaryPresent: boolean;
    safetyPolicyPresent: boolean;
    allAuthorityFlagsFalse: boolean;
    candidateBuilderCallOccurred: false;
    canValidateInvocationBoundary: boolean;
    blockedReasons: ExecutionRecordCandidateBuilderInvocationValidationBlockedReason[];
    warnings: ExecutionRecordCandidateBuilderInvocationValidationWarning[];
    reviewItems: ExecutionRecordCandidateBuilderInvocationValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderInvocationInputSourceValidationSummary =
  {
    sourceSummary?:
      | ExecutionRecordCandidateBuilderInvocationInputSourceSummary
      | null;
    adapterResultPresent: boolean;
    adapterValidationPresent: boolean;
    adapterOutputValidated: boolean;
    proposedInputComesFromAdapter: boolean;
    bridgeMapperResultPresent: boolean;
    bridgeValidationResultPresent: boolean;
    finalizationCandidatePresent: boolean;
    directBridgeToBuilderBypassAttempted: false;
    directFinalizationToBuilderBypassAttempted: false;
    liveBrokerOrAvanzaDataConsumed: false;
    routeOrStorageBypassAttempted: false;
    blockedReason?:
      | ExecutionRecordCandidateBuilderInvocationValidationBlockedReason
      | null;
    warning?: ExecutionRecordCandidateBuilderInvocationValidationWarning | null;
    reviewItem?:
      | ExecutionRecordCandidateBuilderInvocationValidationReviewItem
      | null;
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderInvocationProposedInputValidationSummary =
  {
    proposedCreationInput?: Partial<ExecutionRecordCreationInput> | null;
    proposedInputPresent: boolean;
    requiredFieldsPresent: boolean;
    missingRequiredFields: (keyof ExecutionRecordCreationInput | string)[];
    tickerPresent: boolean;
    sidePresent: boolean;
    quantityPresent: boolean;
    pricePresent: boolean;
    currencyPresent: boolean;
    feesOrCommissionRepresented: boolean;
    fxRepresented: boolean;
    grossNetValuesRepresented: boolean;
    executionTimestampPresent: boolean;
    settlementOrPaymentDateRepresented: boolean;
    brokerSourceIdentifiersPresent: boolean;
    finalNoteOrReferenceRepresented: boolean;
    sourceEvidenceProvenancePresent: boolean;
    idempotencyFingerprintValuesPresent: boolean;
    auditProvenanceMetadataPresent: boolean;
    manualApprovalContextPresent: boolean;
    finalizationMetadataPresent: boolean;
    candidateBuilderCalled: false;
    executionRecordCandidateCreated: false;
    blockedReasons: ExecutionRecordCandidateBuilderInvocationValidationBlockedReason[];
    warnings: ExecutionRecordCandidateBuilderInvocationValidationWarning[];
    reviewItems: ExecutionRecordCandidateBuilderInvocationValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderInvocationIdempotencyValidationSummary =
  {
    sourceSummary?:
      | ExecutionRecordCandidateBuilderInvocationIdempotencySummary
      | ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary
      | ExecutionRecordCandidateBuilderIntegrationIdempotencySummary
      | null;
    requiredFingerprintsPresent: boolean;
    missingFingerprints: string[];
    conflictingFingerprints: string[];
    duplicateCheckMetadataPresent: boolean;
    duplicateCheckRequired: true;
    duplicateDetectionSeparate: true;
    bridgeFingerprintPreserved: boolean;
    adapterFingerprintPreserved: boolean;
    invocationFingerprintPreserved: boolean;
    candidateBuilderFingerprintReady: boolean;
    insertBoundaryMustEnforceUniquenessLater: true;
    safeForValidationOnly: true;
    safeForWrite: false;
    blockedReason?:
      | ExecutionRecordCandidateBuilderInvocationValidationBlockedReason
      | null;
    warning?: ExecutionRecordCandidateBuilderInvocationValidationWarning | null;
    reviewItem?:
      | ExecutionRecordCandidateBuilderInvocationValidationReviewItem
      | null;
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderInvocationAuditProvenanceValidationSummary =
  {
    sourceSummary?:
      | ExecutionRecordCandidateBuilderInvocationAuditProvenanceSummary
      | ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary
      | ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary
      | null;
    sourceEvidenceChainPresent: boolean;
    finalizationReferencePresent: boolean;
    bridgeReferencePresent: boolean;
    adapterValidationReferencePresent: boolean;
    manualApprovalContextPresent: boolean;
    handoffSessionIdPresent: boolean;
    payloadIdPresent: boolean;
    sourceEventIdsPresent: boolean;
    beforeAfterValuesRequiredLater: true;
    auditAppendSeparate: true;
    correctionRollbackSeparate: true;
    auditAppendAttempted: false;
    rollbackAttempted: false;
    safeForValidationOnly: true;
    safeForWrite: false;
    blockedReason?:
      | ExecutionRecordCandidateBuilderInvocationValidationBlockedReason
      | null;
    warning?: ExecutionRecordCandidateBuilderInvocationValidationWarning | null;
    reviewItem?:
      | ExecutionRecordCandidateBuilderInvocationValidationReviewItem
      | null;
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderInvocationSchemaReadinessValidationSummary =
  {
    sourceSummary?:
      | ExecutionRecordCandidateBuilderInvocationSchemaReadinessSummary
      | ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary
      | ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary
      | null;
    schemaReadinessMetadataPresent: boolean;
    generatedTypesAvailable: boolean;
    generatedTypesReviewed: boolean;
    generatedTypesStatus:
      | "generated_types_present"
      | "generated_types_absent"
      | "generated_types_unknown";
    migrationApplicationProven: boolean;
    migrationApplicationStatus:
      | "migration_application_proven"
      | "migration_application_unproven"
      | "migration_application_unknown";
    schemaReadinessMustNotBeAssumed: true;
    candidateOnlyInvocationMayBeValidWithReview: boolean;
    persistenceCouplingBlockedUntilSchemaReady: true;
    runtimeDbWritesAllowed: false;
    safeToPersist: false;
    blockedReasons: ExecutionRecordCandidateBuilderInvocationValidationBlockedReason[];
    warnings: ExecutionRecordCandidateBuilderInvocationValidationWarning[];
    reviewItems: ExecutionRecordCandidateBuilderInvocationValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderInvocationSafetyPolicyValidationSummary =
  {
    validationOnly: true;
    safetyPolicyPresent: boolean;
    sourceSafetyPolicy?:
      | ExecutionRecordCandidateBuilderInvocationSafetyPolicy
      | null;
    authorityFlags: ExecutionRecordCandidateBuilderInvocationAuthorityFlags;
    allAuthorityFlagsFalse: boolean;
    unexpectedTrueAuthorityFlags: string[];
    automaticModeAllowed: false;
    validatorImplementationEnabled: false;
    candidateBuilderInvocationEnabled: false;
    executionRecordCandidateCreationEnabled: false;
    executionRecordCreationEnabled: false;
    persistenceImplementationEnabled: false;
    finalizationImplementationEnabled: false;
    statsUpdateEnabled: false;
    auditAppendEnabled: false;
    rollbackImplementationEnabled: false;
    tradeMutationEnabled: false;
    brokerAutomationEnabled: false;
    avanzaAutomationEnabled: false;
    browserAutomationEnabled: false;
    blockedReason?:
      | ExecutionRecordCandidateBuilderInvocationValidationBlockedReason
      | null;
    warning?: ExecutionRecordCandidateBuilderInvocationValidationWarning | null;
    reviewItem?:
      | ExecutionRecordCandidateBuilderInvocationValidationReviewItem
      | null;
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderInvocationValidationInput = {
  contractVersion: ExecutionRecordCandidateBuilderInvocationValidatorContractVersion;
  requestedAt: string;
  invocationResult?: ExecutionRecordCandidateBuilderInvocationResult | null;
  invocationInput?: ExecutionRecordCandidateBuilderInvocationInput | null;
  invocationOutputSummary?:
    | ExecutionRecordCandidateBuilderInvocationOutputSummary
    | null;
  adapterResult?: ExecutionRecordCandidateBuilderIntegrationAdapterResult | null;
  adapterValidationResult?:
    | ExecutionRecordCandidateBuilderIntegrationValidationResult
    | null;
  proposedCreationInput?: ExecutionRecordCreationInput | null;
  integrationInput?: ExecutionRecordCandidateBuilderIntegrationInput | null;
  integrationResult?: ExecutionRecordCandidateBuilderIntegrationResult | null;
  bridgeValidationResult?:
    | ExecutionRecordFinalizationBridgeValidationResult
    | null;
  bridgeMapperResult?: FinalizationToExecutionRecordBridgeResult | null;
  finalizationCandidate?: FinalizationCandidate | null;
  schemaReadinessMetadata?:
    | ExecutionRecordCandidateBuilderInvocationSchemaReadinessSummary
    | ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary
    | ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary
    | null;
  idempotencyMetadata?:
    | ExecutionRecordCandidateBuilderInvocationIdempotencySummary
    | ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary
    | ExecutionRecordCandidateBuilderIntegrationIdempotencySummary
    | null;
  auditProvenanceMetadata?:
    | ExecutionRecordCandidateBuilderInvocationAuditProvenanceSummary
    | ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary
    | ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary
    | null;
  manualApprovalMetadata?:
    | FinalizationActionValidatorManualApprovalContext
    | null;
  expectedInvocationContractVersion?:
    | ExecutionRecordCandidateBuilderInvocationContractVersion
    | null;
  expectedInvocationStatus?: ExecutionRecordCandidateBuilderInvocationStatus | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderInvocationValidationResult = {
  contractVersion: ExecutionRecordCandidateBuilderInvocationValidatorContractVersion;
  evaluatedAt: string;
  status: ExecutionRecordCandidateBuilderInvocationValidationStatus;
  decisionRecommendation: ExecutionRecordCandidateBuilderInvocationValidationDecisionRecommendation;
  input?: ExecutionRecordCandidateBuilderInvocationValidationInput | null;
  prerequisiteValidationSummary: ExecutionRecordCandidateBuilderInvocationPrerequisiteValidationSummary;
  inputSourceValidationSummary: ExecutionRecordCandidateBuilderInvocationInputSourceValidationSummary;
  proposedInputValidationSummary: ExecutionRecordCandidateBuilderInvocationProposedInputValidationSummary;
  idempotencyValidationSummary: ExecutionRecordCandidateBuilderInvocationIdempotencyValidationSummary;
  auditProvenanceValidationSummary: ExecutionRecordCandidateBuilderInvocationAuditProvenanceValidationSummary;
  schemaReadinessValidationSummary: ExecutionRecordCandidateBuilderInvocationSchemaReadinessValidationSummary;
  safetyPolicyValidationSummary: ExecutionRecordCandidateBuilderInvocationSafetyPolicyValidationSummary;
  authorityFlags: ExecutionRecordCandidateBuilderInvocationAuthorityFlags;
  blockedReasons: ExecutionRecordCandidateBuilderInvocationValidationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderInvocationValidationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderInvocationValidationReviewItem[];
  validationOnly: true;
  safeToCallCandidateBuilder: false;
  safeToCreateExecutionRecordCandidate: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  safeToFinalize: false;
  safeToUpdateStats: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  safeToRunBrokerAction: false;
  automaticModeAllowed: false;
  validatorImplementationEnabled: false;
  candidateBuilderInvocationAttempted: false;
  executionRecordCandidateCreationAttempted: false;
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
