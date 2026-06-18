import type {
  ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary,
  ExecutionRecordCandidateBuilderIntegrationIdempotencySummary,
  ExecutionRecordCandidateBuilderIntegrationInput,
  ExecutionRecordCandidateBuilderIntegrationResult,
  ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary,
} from "@/lib/execution-record-candidate-builder-integration-contract";
import type {
  ExecutionRecordFinalizationBridgeAuditCorrectionValidationSummary,
  ExecutionRecordFinalizationBridgeIdempotencyValidationSummary,
  ExecutionRecordFinalizationBridgeValidationResult,
  ExecutionRecordFinalizationBridgeValidatedFieldSummary,
} from "@/lib/execution-record-finalization-bridge-validator-contract";
import type {
  ExecutionRecordCreationInput,
  ExecutionRecordSourceBrokerExecutionResult,
} from "@/lib/execution-record-creation-contract";
import type {
  FinalizationActionValidatorAuditCorrectionMetadata,
  FinalizationActionValidatorManualApprovalContext,
} from "@/lib/finalization-action-validator-contract";
import type { FinalizationCandidate } from "@/lib/finalization-candidate-contract";
import type {
  FinalizationToExecutionRecordAuditCorrectionSummary,
  FinalizationToExecutionRecordBridgeInput,
  FinalizationToExecutionRecordBridgeResult,
  FinalizationToExecutionRecordFieldMappingSummary,
  FinalizationToExecutionRecordIdempotencySummary,
  FinalizationToExecutionRecordSourceEvidenceSummary,
  FinalizationToExecutionRecordTargetSummary,
  FinalizationToExecutionRecordValidationHandoffSummary,
} from "@/lib/finalization-to-execution-record-bridge-contract";

// Contract metadata only. These types describe a future adapter boundary that
// may shape validated bridge/integration metadata into a proposed
// ExecutionRecordCreationInput. They do not implement adapter logic, call
// buildExecutionRecordCandidate, create execution-record candidates, create or
// persist execution records, write Supabase/localStorage, finalize, update
// stats/PnL, append audit records, rollback/correct, mutate trades, wire UI,
// capture browser/Avanza behavior, run broker behavior, execute orders, or
// enable production runtime behavior.

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_CONTRACT_VERSION =
  "execution_record_candidate_builder_integration_adapter_v1" as const;

export type ExecutionRecordCandidateBuilderIntegrationAdapterContractVersion =
  typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_CONTRACT_VERSION;

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_STATUSES =
  [
    "adapter_input_ready",
    "adapter_input_needs_review",
    "adapter_input_blocked",
    "adapter_input_unsupported",
    "adapter_input_not_ready",
  ] as const;

export type ExecutionRecordCandidateBuilderIntegrationAdapterStatus =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_STATUSES)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_DECISION_RECOMMENDATIONS =
  [
    "shape_input_only",
    "needs_manual_review",
    "blocked_do_not_shape",
    "unsupported_do_not_shape",
    "not_ready_do_not_shape",
  ] as const;

export type ExecutionRecordCandidateBuilderIntegrationAdapterDecisionRecommendation =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_BLOCKED_REASONS =
  [
    "missing_integration_input",
    "missing_integration_result",
    "integration_not_ready",
    "missing_bridge_result",
    "missing_bridge_validation",
    "bridge_validation_not_valid",
    "missing_execution_record_creation_contract",
    "missing_required_builder_input_field",
    "missing_idempotency_metadata",
    "missing_audit_provenance_metadata",
    "missing_schema_readiness",
    "generated_types_absent_or_unknown",
    "migration_application_not_proven",
    "manual_approval_missing",
    "unsupported_source",
    "unsupported_broker",
    "field_mapping_mismatch",
    "safety_policy_authority_violation",
    "candidate_builder_invocation_not_allowed",
    "persistence_boundary_not_enabled",
  ] as const;

export type ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_WARNINGS =
  [
    "contract_only",
    "adapter_not_implemented",
    "proposed_input_only",
    "builder_not_called",
    "candidate_not_created",
    "generated_types_required_later",
    "migration_application_required_later",
    "audit_required_before_write",
    "idempotency_review_required",
    "duplicate_check_required",
    "stats_update_out_of_scope",
    "trade_mutation_out_of_scope",
  ] as const;

export type ExecutionRecordCandidateBuilderIntegrationAdapterWarning =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_WARNINGS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_REVIEW_ITEMS =
  [
    "integration_input_review",
    "integration_result_review",
    "bridge_result_review",
    "bridge_validation_review",
    "creation_input_shape_review",
    "field_mapping_review",
    "source_evidence_review",
    "broker_evidence_review",
    "idempotency_review",
    "duplicate_review",
    "audit_provenance_review",
    "manual_approval_review",
    "schema_readiness_review",
    "generated_types_review",
    "migration_application_review",
    "safety_policy_review",
  ] as const;

export type ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_REVIEW_ITEMS)[number];

export type ExecutionRecordCandidateBuilderIntegrationAdapterSafetyPolicy = {
  contractOnly: true;
  adapterOnly: true;
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
  adapterImplemented: false;
  candidateBuilderInvocationAttempted: false;
  executionRecordCandidateCreationAttempted: false;
  executionRecordCreationAttempted: false;
  persistenceAttempted: false;
  finalizationAttempted: false;
  statsUpdateAttempted: false;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  tradeMutationAttempted: false;
  browserAutomationAttempted: false;
  avanzaAutomationAttempted: false;
  brokerAutomationAttempted: false;
  policyReason: string;
};

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_DEFAULT_SAFETY_POLICY =
  {
    contractOnly: true,
    adapterOnly: true,
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
    adapterImplemented: false,
    candidateBuilderInvocationAttempted: false,
    executionRecordCandidateCreationAttempted: false,
    executionRecordCreationAttempted: false,
    persistenceAttempted: false,
    finalizationAttempted: false,
    statsUpdateAttempted: false,
    auditAppendAttempted: false,
    rollbackAttempted: false,
    tradeMutationAttempted: false,
    browserAutomationAttempted: false,
    avanzaAutomationAttempted: false,
    brokerAutomationAttempted: false,
    policyReason:
      "Execution-record candidate builder integration adapter contract types are contract-only, adapter-only, and proposed-input-only. They do not implement an adapter, call buildExecutionRecordCandidate, create execution-record candidates, create execution records, persist, finalize, update stats/PnL, append audit records, roll back, mutate trades, run broker actions, automate browser/Avanza behavior, or enable automatic mode.",
  } as const satisfies ExecutionRecordCandidateBuilderIntegrationAdapterSafetyPolicy;

export type ExecutionRecordCandidateBuilderIntegrationAdapterFieldMappingSummary =
  {
    sourcePath:
      | keyof FinalizationToExecutionRecordSourceEvidenceSummary
      | keyof FinalizationToExecutionRecordTargetSummary
      | string;
    targetPath: keyof ExecutionRecordCreationInput | string;
    sourceMapping?: FinalizationToExecutionRecordFieldMappingSummary | null;
    validationFieldSummary?:
      | ExecutionRecordFinalizationBridgeValidatedFieldSummary
      | null;
    available: boolean;
    requiredForProposedInput: boolean;
    mapped: boolean;
    requiresReview: boolean;
    sourceValuePreview?: string | number | boolean | null;
    targetValuePreview?: string | number | boolean | null;
    blockedReason?:
      | ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason
      | null;
    warning?: ExecutionRecordCandidateBuilderIntegrationAdapterWarning | null;
    reviewItem?: ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem | null;
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderIntegrationAdapterProposedInputSummary =
  {
    proposedInputOnly: true;
    proposedCreationInput?: Partial<ExecutionRecordCreationInput> | null;
    proposedSourceBrokerExecutionResult?:
      | Partial<ExecutionRecordSourceBrokerExecutionResult>
      | null;
    requiredFieldsPresent: boolean;
    missingRequiredFields: (keyof ExecutionRecordCreationInput | string)[];
    mappedFields: ExecutionRecordCandidateBuilderIntegrationAdapterFieldMappingSummary[];
    safeToCallCandidateBuilder: false;
    safeToCreateExecutionRecordCandidate: false;
    candidateBuilderCalled: false;
    executionRecordCandidateCreated: false;
    blockedReasons: ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason[];
    warnings: ExecutionRecordCandidateBuilderIntegrationAdapterWarning[];
    reviewItems: ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderIntegrationAdapterPreconditionSummary =
  {
    integrationInputPresent: boolean;
    integrationResultPresent: boolean;
    integrationResultReadyForShapeReview: boolean;
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
    canShapeProposedInput: boolean;
    blockedReasons: ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason[];
    warnings: ExecutionRecordCandidateBuilderIntegrationAdapterWarning[];
    reviewItems: ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary =
  {
    sourceSummary?:
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
    blockedReasons: ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason[];
    warnings: ExecutionRecordCandidateBuilderIntegrationAdapterWarning[];
    reviewItems: ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem[];
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary =
  {
    integrationSummary?:
      | ExecutionRecordCandidateBuilderIntegrationIdempotencySummary
      | null;
    bridgeSummary?: FinalizationToExecutionRecordIdempotencySummary | null;
    validationSummary?:
      | ExecutionRecordFinalizationBridgeIdempotencyValidationSummary
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
    safeForProposedInputOnly: true;
    safeForWrite: false;
    blockedReason?:
      | ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason
      | null;
    warning?: ExecutionRecordCandidateBuilderIntegrationAdapterWarning | null;
    reviewItem?: ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem | null;
    details?: string | null;
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary =
  {
    integrationSummary?:
      | ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary
      | null;
    bridgeSummary?: FinalizationToExecutionRecordAuditCorrectionSummary | null;
    validationSummary?:
      | ExecutionRecordFinalizationBridgeAuditCorrectionValidationSummary
      | null;
    auditCorrectionMetadata?:
      | FinalizationActionValidatorAuditCorrectionMetadata
      | null;
    manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
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
    safeForProposedInputOnly: true;
    safeForWrite: false;
    blockedReason?:
      | ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason
      | null;
    warning?: ExecutionRecordCandidateBuilderIntegrationAdapterWarning | null;
    reviewItem?: ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem | null;
    details?: string | null;
    metadata?: Record<string, unknown>;
  };

export type ExecutionRecordCandidateBuilderIntegrationAdapterInput = {
  contractVersion: ExecutionRecordCandidateBuilderIntegrationAdapterContractVersion;
  requestedAt: string;
  integrationInput?: ExecutionRecordCandidateBuilderIntegrationInput | null;
  integrationResult?: ExecutionRecordCandidateBuilderIntegrationResult | null;
  bridgeResult?: FinalizationToExecutionRecordBridgeResult | null;
  bridgeValidationResult?:
    | ExecutionRecordFinalizationBridgeValidationResult
    | null;
  bridgeMapperResult?: FinalizationToExecutionRecordBridgeResult | null;
  originalBridgeInput?: FinalizationToExecutionRecordBridgeInput | null;
  finalizationCandidate?: FinalizationCandidate | null;
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  idempotencyMetadata?:
    | ExecutionRecordCandidateBuilderIntegrationIdempotencySummary
    | FinalizationToExecutionRecordIdempotencySummary
    | ExecutionRecordFinalizationBridgeIdempotencyValidationSummary
    | null;
  auditCorrectionMetadata?:
    | ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary
    | FinalizationActionValidatorAuditCorrectionMetadata
    | FinalizationToExecutionRecordAuditCorrectionSummary
    | ExecutionRecordFinalizationBridgeAuditCorrectionValidationSummary
    | null;
  sourceEvidenceSummary?: FinalizationToExecutionRecordSourceEvidenceSummary | null;
  targetSummary?: FinalizationToExecutionRecordTargetSummary | null;
  validationHandoffSummary?:
    | FinalizationToExecutionRecordValidationHandoffSummary
    | null;
  fieldMappingSummary?: FinalizationToExecutionRecordFieldMappingSummary[] | null;
  proposedCreationInput?:
    | Partial<ExecutionRecordCreationInput>
    | ExecutionRecordCreationInput
    | null;
  schemaReadinessSummary?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary
    | ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary
    | null;
  safetyPolicy?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterSafetyPolicy
    | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderIntegrationAdapterResult = {
  contractVersion: ExecutionRecordCandidateBuilderIntegrationAdapterContractVersion;
  evaluatedAt: string;
  status: ExecutionRecordCandidateBuilderIntegrationAdapterStatus;
  decisionRecommendation: ExecutionRecordCandidateBuilderIntegrationAdapterDecisionRecommendation;
  input?: ExecutionRecordCandidateBuilderIntegrationAdapterInput | null;
  proposedInputSummary: ExecutionRecordCandidateBuilderIntegrationAdapterProposedInputSummary;
  fieldMappingSummary: ExecutionRecordCandidateBuilderIntegrationAdapterFieldMappingSummary[];
  preconditionSummary: ExecutionRecordCandidateBuilderIntegrationAdapterPreconditionSummary;
  schemaReadinessSummary: ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary;
  idempotencySummary: ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary;
  auditProvenanceSummary: ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary;
  safetyPolicy: ExecutionRecordCandidateBuilderIntegrationAdapterSafetyPolicy;
  blockedReasons: ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderIntegrationAdapterWarning[];
  reviewItems: ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem[];
  contractOnly: true;
  adapterOnly: true;
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
  adapterImplemented: false;
  candidateBuilderInvocationAttempted: false;
  executionRecordCandidateCreationAttempted: false;
  executionRecordCreationAttempted: false;
  persistenceAttempted: false;
  finalizationAttempted: false;
  statsUpdateAttempted: false;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  tradeMutationAttempted: false;
  browserAutomationAttempted: false;
  avanzaAutomationAttempted: false;
  brokerAutomationAttempted: false;
  metadata?: Record<string, unknown>;
};

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_STATUS_METADATA =
  {
    adapter_input_ready: {
      decisionRecommendation: "shape_input_only",
      requiresManualReview: true,
      blocksBuilderInvocation: true,
      blocksCandidateCreation: true,
      blocksWrites: true,
      reason:
        "Adapter metadata may be ready to shape a proposed ExecutionRecordCreationInput only. It is not builder invocation, candidate creation, or write approval.",
    },
    adapter_input_needs_review: {
      decisionRecommendation: "needs_manual_review",
      requiresManualReview: true,
      blocksBuilderInvocation: true,
      blocksCandidateCreation: true,
      blocksWrites: true,
      reason:
        "Adapter metadata requires manual review before any future builder invocation, candidate creation, or persistence boundary.",
    },
    adapter_input_blocked: {
      decisionRecommendation: "blocked_do_not_shape",
      requiresManualReview: true,
      blocksBuilderInvocation: true,
      blocksCandidateCreation: true,
      blocksWrites: true,
      reason:
        "Required integration, bridge, validation, idempotency, audit/provenance, approval, schema, or safety metadata is missing or blocking.",
    },
    adapter_input_unsupported: {
      decisionRecommendation: "unsupported_do_not_shape",
      requiresManualReview: true,
      blocksBuilderInvocation: true,
      blocksCandidateCreation: true,
      blocksWrites: true,
      reason:
        "The source, broker, field mapping, or proposed creation input scenario is unsupported.",
    },
    adapter_input_not_ready: {
      decisionRecommendation: "not_ready_do_not_shape",
      requiresManualReview: true,
      blocksBuilderInvocation: true,
      blocksCandidateCreation: true,
      blocksWrites: true,
      reason:
        "Adapter metadata is incomplete and cannot progress beyond contract-only review.",
    },
  } as const satisfies Record<
    ExecutionRecordCandidateBuilderIntegrationAdapterStatus,
    {
      decisionRecommendation: ExecutionRecordCandidateBuilderIntegrationAdapterDecisionRecommendation;
      requiresManualReview: true;
      blocksBuilderInvocation: true;
      blocksCandidateCreation: true;
      blocksWrites: true;
      reason: string;
    }
  >;
