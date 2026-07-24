import type {
  ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary,
  ExecutionRecordCandidateBuilderIntegrationAdapterFieldMappingSummary,
  ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary,
  ExecutionRecordCandidateBuilderIntegrationAdapterInput,
  ExecutionRecordCandidateBuilderIntegrationAdapterPreconditionSummary,
  ExecutionRecordCandidateBuilderIntegrationAdapterProposedInputSummary,
  ExecutionRecordCandidateBuilderIntegrationAdapterResult,
  ExecutionRecordCandidateBuilderIntegrationAdapterSafetyPolicy,
  ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary,
  ExecutionRecordCandidateBuilderIntegrationAdapterStatus,
} from "@/lib/execution-record-candidate-builder-integration-adapter-contract";
import type {
  ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary,
  ExecutionRecordCandidateBuilderIntegrationIdempotencySummary,
  ExecutionRecordCandidateBuilderIntegrationInput,
  ExecutionRecordCandidateBuilderIntegrationResult,
  ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary,
} from "@/lib/execution-record-candidate-builder-integration-contract";
import type { ExecutionRecordCreationInput } from "@/lib/execution-record-creation-contract";
import type {
  ExecutionRecordFinalizationBridgeValidationResult,
  ExecutionRecordFinalizationBridgeValidatedFieldSummary,
} from "@/lib/execution-record-finalization-bridge-validator-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";
import type {
  FinalizationToExecutionRecordBridgeResult,
  FinalizationToExecutionRecordFieldMappingSummary,
} from "@/lib/finalization-to-execution-record-bridge-contract";

// Contract metadata only. These types describe a future validation-only
// boundary for Execution Record Candidate Builder Integration Adapter output.
// They do not implement validation logic, call buildExecutionRecordCandidate,
// create execution-record candidates, create execution records, persist, write
// Supabase/localStorage, finalize, update stats/PnL, append audit records,
// rollback/correct, mutate trades, wire UI, capture browser/Avanza behavior,
// run broker behavior, execute orders, or enable production runtime behavior.

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATOR_CONTRACT_VERSION =
  "execution_record_candidate_builder_integration_validator_v1" as const;

export type ExecutionRecordCandidateBuilderIntegrationValidatorContractVersion =
  typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATOR_CONTRACT_VERSION;

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATION_STATUSES =
  [
    "adapter_validation_valid",
    "adapter_validation_needs_review",
    "adapter_validation_blocked",
    "adapter_validation_unsupported",
    "adapter_validation_invalid",
  ] as const;

export type ExecutionRecordCandidateBuilderIntegrationValidationStatus =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATION_STATUSES)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATION_DECISION_RECOMMENDATIONS =
  [
    "validate_only",
    "needs_manual_review",
    "blocked_do_not_call_builder",
    "unsupported_do_not_call_builder",
    "invalid_do_not_call_builder",
  ] as const;

export type ExecutionRecordCandidateBuilderIntegrationValidationDecisionRecommendation =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATION_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATION_BLOCKED_REASONS =
  [
    "missing_adapter_result",
    "invalid_adapter_status",
    "adapter_ready_with_blocked_reasons",
    "adapter_ready_with_missing_proposed_input_summary",
    "missing_required_proposed_input_field",
    "missing_field_mapping_summary",
    "missing_precondition_summary",
    "missing_schema_readiness_summary",
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
    "candidate_builder_invocation_not_allowed",
    "write_authority_not_allowed",
  ] as const;

export type ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATION_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATION_WARNINGS =
  [
    "validation_only",
    "adapter_input_ready_not_builder_invocation_approval",
    "proposed_input_not_execution_record_candidate",
    "candidate_builder_not_called",
    "generated_types_required_later",
    "migration_application_required_later",
    "audit_required_before_write",
    "idempotency_review_required",
    "duplicate_check_required",
    "stats_update_out_of_scope",
    "trade_mutation_out_of_scope",
  ] as const;

export type ExecutionRecordCandidateBuilderIntegrationValidationWarning =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATION_WARNINGS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATION_REVIEW_ITEMS =
  [
    "adapter_result_review",
    "adapter_status_review",
    "proposed_input_shape_review",
    "field_mapping_review",
    "precondition_review",
    "schema_readiness_review",
    "generated_types_review",
    "migration_application_review",
    "idempotency_review",
    "duplicate_review",
    "audit_provenance_review",
    "manual_approval_review",
    "safety_policy_review",
    "builder_invocation_boundary_review",
    "persistence_boundary_review",
  ] as const;

export type ExecutionRecordCandidateBuilderIntegrationValidationReviewItem =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATION_REVIEW_ITEMS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATION_FIELD_STATUSES =
  [
    "field_valid",
    "field_missing",
    "field_needs_review",
    "field_mismatched",
    "field_unsupported",
  ] as const;

export type ExecutionRecordCandidateBuilderIntegrationValidationFieldStatus =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATION_FIELD_STATUSES)[number];

export type ExecutionRecordCandidateBuilderIntegrationAuthorityFlags = {
  validationOnly: true;
  adapterOutputOnly: true;
  proposedInputOnly: true;
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

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_DEFAULT_AUTHORITY_FLAGS =
  {
    validationOnly: true,
    adapterOutputOnly: true,
    proposedInputOnly: true,
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
  } as const satisfies ExecutionRecordCandidateBuilderIntegrationAuthorityFlags;

export type ExecutionRecordCandidateBuilderIntegrationSafetyPolicyValidationSummary =
  {
    validationOnly: true;
    adapterOutputOnly: true;
    proposedInputOnly: true;
    safetyPolicyPresent: boolean;
    adapterSafetyPolicy?:
      | ExecutionRecordCandidateBuilderIntegrationAdapterSafetyPolicy
      | null;
    allAuthorityFlagsFalse: boolean;
    automaticModeAllowed: false;
    authorityFlags: ExecutionRecordCandidateBuilderIntegrationAuthorityFlags;
    unexpectedTrueAuthorityFlags: string[];
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
      | ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason
      | null;
    warning?:
      | ExecutionRecordCandidateBuilderIntegrationValidationWarning
      | null;
    reviewItem?:
      | ExecutionRecordCandidateBuilderIntegrationValidationReviewItem
      | null;
    details?: string | null;
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderIntegrationValidatedProposedInputSummary =
  {
    proposedInputOnly: true;
    sourceSummary?:
      | ExecutionRecordCandidateBuilderIntegrationAdapterProposedInputSummary
      | null;
    proposedCreationInput?: Partial<ExecutionRecordCreationInput> | null;
    requiredFieldsPresent: boolean;
    missingRequiredFields: (keyof ExecutionRecordCreationInput | string)[];
    proposedSourceBrokerExecutionResultPresent: boolean;
    proposedInputIsExecutionRecordCandidate: false;
    safeToCallCandidateBuilder: false;
    candidateBuilderCalled: false;
    executionRecordCandidateCreated: false;
    blockedReasons: ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason[];
    warnings: ExecutionRecordCandidateBuilderIntegrationValidationWarning[];
    reviewItems: ExecutionRecordCandidateBuilderIntegrationValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderIntegrationFieldMappingValidationSummary =
  {
    field: keyof ExecutionRecordCreationInput | string;
    status: ExecutionRecordCandidateBuilderIntegrationValidationFieldStatus;
    adapterMapping?:
      | ExecutionRecordCandidateBuilderIntegrationAdapterFieldMappingSummary
      | null;
    bridgeMapping?: FinalizationToExecutionRecordFieldMappingSummary | null;
    bridgeValidationField?:
      | ExecutionRecordFinalizationBridgeValidatedFieldSummary
      | null;
    requiredForProposedInput: boolean;
    available: boolean;
    mapped: boolean;
    requiresReview: boolean;
    blockedReason?:
      | ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason
      | null;
    warning?:
      | ExecutionRecordCandidateBuilderIntegrationValidationWarning
      | null;
    reviewItem?:
      | ExecutionRecordCandidateBuilderIntegrationValidationReviewItem
      | null;
    sourceValuePreview?: string | number | boolean | null;
    targetValuePreview?: string | number | boolean | null;
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderIntegrationPreconditionValidationSummary =
  {
    sourceSummary?:
      | ExecutionRecordCandidateBuilderIntegrationAdapterPreconditionSummary
      | null;
    integrationInputPresent: boolean;
    integrationResultPresent: boolean;
    integrationResultReadyForShapeReview: boolean;
    adapterResultPresent: boolean;
    adapterStatusAcceptableForValidation: boolean;
    bridgeResultPresent: boolean;
    bridgeValidationPresent: boolean;
    bridgeValidationValid: boolean;
    bridgeMapperResultPresent: boolean;
    finalizationCandidatePresent: boolean;
    sourceEvidenceSummaryPresent: boolean;
    targetSummaryPresent: boolean;
    brokerEvidencePresent: boolean;
    idempotencyMetadataPresent: boolean;
    auditProvenanceMetadataPresent: boolean;
    manualApprovalRequired: boolean;
    manualApprovalPresent: boolean;
    schemaReadinessPresent: boolean;
    allAuthorityFlagsFalse: boolean;
    canValidateAdapterOutput: boolean;
    safeToCallCandidateBuilder: false;
    safeToCreateExecutionRecordCandidate: false;
    safeToCreateExecutionRecord: false;
    safeToPersist: false;
    blockedReasons: ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason[];
    warnings: ExecutionRecordCandidateBuilderIntegrationValidationWarning[];
    reviewItems: ExecutionRecordCandidateBuilderIntegrationValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderIntegrationSchemaReadinessValidationSummary =
  {
    sourceSummary?:
      | ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary
      | ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary
      | null;
    schemaReadinessMetadataPresent: boolean;
    generatedTypesAvailable: boolean;
    generatedTypesReviewed: boolean;
    generatedTypesLocation?: string | null;
    migrationApplicationProven: boolean;
    migrationReference?: string | null;
    executionRecordsTablePresent?: boolean | null;
    executionRecordsSchemaAlignedWithCreationContract: boolean;
    rlsPolicyReviewed: boolean;
    persistenceBoundaryEnabled: false;
    insertRouteDryRunOnly: true;
    productionWriteEnabled: false;
    safeToPersist: false;
    blockedReasons: ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason[];
    warnings: ExecutionRecordCandidateBuilderIntegrationValidationWarning[];
    reviewItems: ExecutionRecordCandidateBuilderIntegrationValidationReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderIntegrationIdempotencyValidationSummary =
  {
    sourceSummary?:
      | ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary
      | ExecutionRecordCandidateBuilderIntegrationIdempotencySummary
      | null;
    intendedExecutionRecordIdempotencyKey?: string | null;
    intendedExecutionRecordCandidateFingerprint?: string | null;
    sourceEvidenceFingerprint?: string | null;
    brokerResultFingerprint?: string | null;
    handoffPayloadFingerprint?: string | null;
    finalSettlementNoteMatchIdentity?: string | null;
    requiredFingerprintsPresent: boolean;
    duplicateCheckRequired: true;
    duplicateDetected: boolean;
    duplicateOfRecordId?: string | null;
    retrySafe: boolean;
    mismatchRequiresReview: boolean;
    safeForValidationOnly: true;
    safeForProposedInputOnly: true;
    safeForWrite: false;
    blockedReason?:
      | ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason
      | null;
    warning?:
      | ExecutionRecordCandidateBuilderIntegrationValidationWarning
      | null;
    reviewItem?:
      | ExecutionRecordCandidateBuilderIntegrationValidationReviewItem
      | null;
    details?: string | null;
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderIntegrationAuditProvenanceValidationSummary =
  {
    sourceSummary?:
      | ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary
      | ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary
      | null;
    auditRequiredBeforeWrite: true;
    auditMetadataPresent: boolean;
    provenanceMetadataPresent: boolean;
    correctionMetadataPresent: boolean;
    sourceEvidenceTraceable: boolean;
    manualApprovalRequired: boolean;
    manualApprovalPresent: boolean;
    sourceEventIds: string[];
    handoffSessionId?: string | null;
    payloadId?: string | null;
    duplicatePreventionReference?: string | null;
    correctionStrategyReference?: string | null;
    rollbackMetadataRequired: boolean;
    rollbackMetadataPresent: boolean;
    auditAppendAttempted: false;
    rollbackAttempted: false;
    safeForValidationOnly: true;
    safeForProposedInputOnly: true;
    safeForWrite: false;
    blockedReason?:
      | ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason
      | null;
    warning?:
      | ExecutionRecordCandidateBuilderIntegrationValidationWarning
      | null;
    reviewItem?:
      | ExecutionRecordCandidateBuilderIntegrationValidationReviewItem
      | null;
    details?: string | null;
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderIntegrationValidationInput = {
  contractVersion: ExecutionRecordCandidateBuilderIntegrationValidatorContractVersion;
  requestedAt: string;
  adapterResult?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterResult
    | null;
  adapterInput?: ExecutionRecordCandidateBuilderIntegrationAdapterInput | null;
  integrationInput?: ExecutionRecordCandidateBuilderIntegrationInput | null;
  integrationResult?: ExecutionRecordCandidateBuilderIntegrationResult | null;
  bridgeValidationResult?:
    | ExecutionRecordFinalizationBridgeValidationResult
    | null;
  bridgeMapperResult?: FinalizationToExecutionRecordBridgeResult | null;
  proposedInputSummary?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterProposedInputSummary
    | null;
  fieldMappingSummary?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterFieldMappingSummary[]
    | null;
  preconditionSummary?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterPreconditionSummary
    | null;
  schemaReadinessSummary?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary
    | ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary
    | null;
  idempotencySummary?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary
    | ExecutionRecordCandidateBuilderIntegrationIdempotencySummary
    | null;
  auditProvenanceSummary?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary
    | ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary
    | null;
  manualApprovalContext?:
    | FinalizationActionValidatorManualApprovalContext
    | null;
  expectedCreationContractVersion?: ExecutionRecordCreationInput["contractVersion"] | null;
  expectedAdapterStatus?: ExecutionRecordCandidateBuilderIntegrationAdapterStatus | null;
  safetyPolicy?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterSafetyPolicy
    | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderIntegrationValidationResult = {
  contractVersion: ExecutionRecordCandidateBuilderIntegrationValidatorContractVersion;
  evaluatedAt: string;
  status: ExecutionRecordCandidateBuilderIntegrationValidationStatus;
  decisionRecommendation: ExecutionRecordCandidateBuilderIntegrationValidationDecisionRecommendation;
  input?: ExecutionRecordCandidateBuilderIntegrationValidationInput | null;
  adapterResult?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterResult
    | null;
  adapterStatus?: ExecutionRecordCandidateBuilderIntegrationAdapterStatus | null;
  proposedInputValidationSummary: ExecutionRecordCandidateBuilderIntegrationValidatedProposedInputSummary;
  fieldMappingValidationSummary: ExecutionRecordCandidateBuilderIntegrationFieldMappingValidationSummary[];
  preconditionValidationSummary: ExecutionRecordCandidateBuilderIntegrationPreconditionValidationSummary;
  schemaReadinessValidationSummary: ExecutionRecordCandidateBuilderIntegrationSchemaReadinessValidationSummary;
  idempotencyValidationSummary: ExecutionRecordCandidateBuilderIntegrationIdempotencyValidationSummary;
  auditProvenanceValidationSummary: ExecutionRecordCandidateBuilderIntegrationAuditProvenanceValidationSummary;
  safetyPolicyValidationSummary: ExecutionRecordCandidateBuilderIntegrationSafetyPolicyValidationSummary;
  authorityFlags: ExecutionRecordCandidateBuilderIntegrationAuthorityFlags;
  blockedReasons: ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderIntegrationValidationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderIntegrationValidationReviewItem[];
  validationOnly: true;
  adapterOutputOnly: true;
  proposedInputOnly: true;
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

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATION_STATUS_METADATA =
  {
    adapter_validation_valid: {
      decisionRecommendation: "validate_only",
      requiresManualReview: true,
      blocksBuilderInvocation: true,
      blocksCandidateCreation: true,
      blocksWrites: true,
      reason:
        "Adapter output may be internally valid for future manual builder-review consideration only. It is not builder invocation, candidate creation, or write approval.",
    },
    adapter_validation_needs_review: {
      decisionRecommendation: "needs_manual_review",
      requiresManualReview: true,
      blocksBuilderInvocation: true,
      blocksCandidateCreation: true,
      blocksWrites: true,
      reason:
        "Adapter output requires manual review before any future builder invocation boundary.",
    },
    adapter_validation_blocked: {
      decisionRecommendation: "blocked_do_not_call_builder",
      requiresManualReview: true,
      blocksBuilderInvocation: true,
      blocksCandidateCreation: true,
      blocksWrites: true,
      reason:
        "Adapter output is missing required proposed input, schema, idempotency, audit/provenance, safety, or authority metadata.",
    },
    adapter_validation_unsupported: {
      decisionRecommendation: "unsupported_do_not_call_builder",
      requiresManualReview: true,
      blocksBuilderInvocation: true,
      blocksCandidateCreation: true,
      blocksWrites: true,
      reason:
        "Adapter output represents an unsupported source, broker, mapping, schema, or proposed input scenario.",
    },
    adapter_validation_invalid: {
      decisionRecommendation: "invalid_do_not_call_builder",
      requiresManualReview: true,
      blocksBuilderInvocation: true,
      blocksCandidateCreation: true,
      blocksWrites: true,
      reason:
        "Adapter output is internally inconsistent or has invalid status/authority metadata.",
    },
  } as const satisfies Record<
    ExecutionRecordCandidateBuilderIntegrationValidationStatus,
    {
      decisionRecommendation: ExecutionRecordCandidateBuilderIntegrationValidationDecisionRecommendation;
      requiresManualReview: true;
      blocksBuilderInvocation: true;
      blocksCandidateCreation: true;
      blocksWrites: true;
      reason: string;
    }
  >;
