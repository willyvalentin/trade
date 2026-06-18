import type {
  ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary,
  ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary,
  ExecutionRecordCandidateBuilderIntegrationAdapterInput,
  ExecutionRecordCandidateBuilderIntegrationAdapterPreconditionSummary,
  ExecutionRecordCandidateBuilderIntegrationAdapterProposedInputSummary,
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
import type {
  ExecutionRecordCandidateBuilderIntegrationAuditProvenanceValidationSummary,
  ExecutionRecordCandidateBuilderIntegrationIdempotencyValidationSummary,
  ExecutionRecordCandidateBuilderIntegrationPreconditionValidationSummary,
  ExecutionRecordCandidateBuilderIntegrationSchemaReadinessValidationSummary,
  ExecutionRecordCandidateBuilderIntegrationValidatedProposedInputSummary,
  ExecutionRecordCandidateBuilderIntegrationValidationResult,
} from "@/lib/execution-record-candidate-builder-integration-validator-contract";
import type {
  ExecutionRecordCandidate,
  ExecutionRecordCreationInput,
  ExecutionRecordCreationResult,
} from "@/lib/execution-record-creation-contract";
import type { ExecutionRecordFinalizationBridgeValidationResult } from "@/lib/execution-record-finalization-bridge-validator-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";
import type { FinalizationCandidate } from "@/lib/finalization-candidate-contract";
import type { FinalizationToExecutionRecordBridgeResult } from "@/lib/finalization-to-execution-record-bridge-contract";

// Contract metadata only. These types describe a future candidate-builder
// invocation boundary after adapter and adapter-validator gates. They do not
// implement invocation logic, import or call buildExecutionRecordCandidate,
// create execution-record candidates, create execution records, persist, write
// Supabase/localStorage, finalize, update stats/PnL, append audit records,
// rollback/correct, mutate trades, wire UI, capture browser/Avanza behavior,
// run broker behavior, execute orders, or enable production runtime behavior.

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_CONTRACT_VERSION =
  "execution_record_candidate_builder_invocation_v1" as const;

export type ExecutionRecordCandidateBuilderInvocationContractVersion =
  typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_CONTRACT_VERSION;

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_STATUSES = [
  "builder_invocation_ready",
  "builder_invocation_needs_review",
  "builder_invocation_blocked",
  "builder_invocation_unsupported",
  "builder_invocation_not_ready",
] as const;

export type ExecutionRecordCandidateBuilderInvocationStatus =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_STATUSES)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DECISION_RECOMMENDATIONS =
  [
    "candidate_builder_invocation_contract_only",
    "needs_manual_review",
    "blocked_do_not_call_builder",
    "unsupported_do_not_call_builder",
    "not_ready_do_not_call_builder",
  ] as const;

export type ExecutionRecordCandidateBuilderInvocationDecisionRecommendation =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_BLOCKED_REASONS = [
  "missing_adapter_result",
  "missing_adapter_validation",
  "adapter_validation_not_valid",
  "missing_proposed_execution_record_creation_input",
  "missing_required_builder_input_field",
  "missing_idempotency_metadata",
  "missing_audit_provenance_metadata",
  "missing_schema_readiness",
  "generated_types_absent_or_unknown",
  "migration_application_not_proven",
  "manual_approval_missing",
  "unsupported_source",
  "unsupported_broker",
  "safety_policy_authority_violation",
  "candidate_builder_invocation_not_implemented",
  "execution_record_candidate_creation_not_allowed",
  "persistence_boundary_not_enabled",
  "direct_bridge_to_builder_bypass_not_allowed",
  "direct_finalization_to_builder_bypass_not_allowed",
  "write_authority_not_allowed",
] as const;

export type ExecutionRecordCandidateBuilderInvocationBlockedReason =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_WARNINGS = [
  "contract_only",
  "builder_invocation_not_implemented",
  "candidate_builder_not_called",
  "candidate_output_would_be_candidate_only",
  "generated_types_required_later",
  "migration_application_required_later",
  "audit_required_before_write",
  "idempotency_review_required",
  "duplicate_check_required",
  "stats_update_out_of_scope",
  "trade_mutation_out_of_scope",
] as const;

export type ExecutionRecordCandidateBuilderInvocationWarning =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_WARNINGS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_REVIEW_ITEMS = [
  "adapter_result_review",
  "adapter_validation_review",
  "proposed_creation_input_review",
  "builder_input_shape_review",
  "source_summary_review",
  "field_mapping_review",
  "schema_readiness_review",
  "generated_types_review",
  "migration_application_review",
  "idempotency_review",
  "duplicate_review",
  "audit_provenance_review",
  "manual_approval_review",
  "safety_policy_review",
  "candidate_output_boundary_review",
  "persistence_boundary_review",
] as const;

export type ExecutionRecordCandidateBuilderInvocationReviewItem =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_REVIEW_ITEMS)[number];

export type ExecutionRecordCandidateBuilderInvocationSafetyPolicy = {
  contractOnly: true;
  invocationBoundaryOnly: true;
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
  invocationImplemented: false;
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
  policyReason: string;
};

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DEFAULT_SAFETY_POLICY =
  {
    contractOnly: true,
    invocationBoundaryOnly: true,
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
    invocationImplemented: false,
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
    policyReason:
      "Execution-record candidate builder invocation contract types are contract-only and invocation-boundary-only. They do not call buildExecutionRecordCandidate, create execution-record candidates, create execution records, persist, finalize, update stats/PnL, append audit records, roll back, mutate trades, run broker actions, automate browser/Avanza behavior, or enable automatic mode.",
  } as const satisfies ExecutionRecordCandidateBuilderInvocationSafetyPolicy;

export type ExecutionRecordCandidateBuilderInvocationPrerequisiteSummary = {
  adapterResultPresent: boolean;
  adapterValidationResultPresent: boolean;
  adapterValidationValid: boolean;
  reviewGateExplicitlyAllowed: boolean;
  proposedCreationInputPresent: boolean;
  proposedCreationInputComplete: boolean;
  requiredBuilderInputFieldsPresent: boolean;
  missingRequiredBuilderInputFields: (keyof ExecutionRecordCreationInput | string)[];
  schemaReadinessAcknowledged: boolean;
  generatedTypesStatusAcknowledged: boolean;
  migrationApplicationStatusAcknowledged: boolean;
  idempotencyMetadataPresent: boolean;
  auditProvenanceMetadataPresent: boolean;
  manualApprovalRequired: boolean;
  manualApprovalPresent: boolean;
  supportedSource: boolean;
  supportedBroker: boolean;
  allAuthorityFlagsFalse: boolean;
  noWriteAuthorityRequested: boolean;
  canConsiderCandidateOnlyInvocation: boolean;
  safeToCallCandidateBuilder: false;
  safeToCreateExecutionRecordCandidate: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  blockedReasons: ExecutionRecordCandidateBuilderInvocationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderInvocationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderInvocationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderInvocationInputSourceSummary = {
  adapterInput?: ExecutionRecordCandidateBuilderIntegrationAdapterInput | null;
  adapterResult?: ExecutionRecordCandidateBuilderIntegrationAdapterResult | null;
  adapterValidationResult?:
    | ExecutionRecordCandidateBuilderIntegrationValidationResult
    | null;
  adapterProposedInputSummary?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterProposedInputSummary
    | null;
  adapterPreconditionSummary?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterPreconditionSummary
    | null;
  validatorProposedInputSummary?:
    | ExecutionRecordCandidateBuilderIntegrationValidatedProposedInputSummary
    | null;
  validatorPreconditionSummary?:
    | ExecutionRecordCandidateBuilderIntegrationPreconditionValidationSummary
    | null;
  proposedCreationInput?: ExecutionRecordCreationInput | null;
  inputComesFromAdapterShapedProposedInput: boolean;
  adapterOutputValidated: boolean;
  directBridgeToBuilderBypassAttempted: false;
  directFinalizationToBuilderBypassAttempted: false;
  liveBrokerOrAvanzaDataConsumed: false;
  uiStateBypassAttempted: false;
  routeOrStorageBypassAttempted: false;
  blockedReasons: ExecutionRecordCandidateBuilderInvocationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderInvocationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderInvocationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderInvocationOutputSummary = {
  candidateOutputOnly: true;
  builderInvocationImplemented: false;
  candidateBuilderCalled: false;
  candidateBuilderResult?: ExecutionRecordCreationResult | null;
  candidateOutput?: ExecutionRecordCandidate | null;
  candidateOutputWouldBeCandidateOnly: boolean;
  outputRequiresSeparateValidation: true;
  persistenceValidatorSeparate: true;
  insertRouteSeparate: true;
  dryRunInsertRouteSeparate: true;
  productionWritePathSeparate: true;
  safeToCreateExecutionRecordCandidate: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  safeToAppendAudit: false;
  safeToUpdateStats: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  blockedReasons: ExecutionRecordCandidateBuilderInvocationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderInvocationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderInvocationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderInvocationIdempotencySummary = {
  sourceSummary?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary
    | ExecutionRecordCandidateBuilderIntegrationIdempotencyValidationSummary
    | ExecutionRecordCandidateBuilderIntegrationIdempotencySummary
    | null;
  intendedExecutionRecordIdempotencyKey?: string | null;
  intendedExecutionRecordCandidateFingerprint?: string | null;
  builderRecordFingerprint?: string | null;
  sourceEvidenceFingerprint?: string | null;
  brokerResultFingerprint?: string | null;
  handoffPayloadFingerprint?: string | null;
  captureId?: string | null;
  requestId?: string | null;
  requiredFingerprintsPresent: boolean;
  duplicateCheckRequired: true;
  duplicateDetectionSeparate: true;
  duplicateDetected: boolean;
  duplicateOfRecordId?: string | null;
  retrySafe: boolean;
  mismatchRequiresReview: boolean;
  insertBoundaryMustEnforceUniquenessLater: true;
  safeForCandidateOnlyInvocationReview: true;
  safeForWrite: false;
  blockedReason?: ExecutionRecordCandidateBuilderInvocationBlockedReason | null;
  warning?: ExecutionRecordCandidateBuilderInvocationWarning | null;
  reviewItem?: ExecutionRecordCandidateBuilderInvocationReviewItem | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderInvocationAuditProvenanceSummary = {
  sourceSummary?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary
    | ExecutionRecordCandidateBuilderIntegrationAuditProvenanceValidationSummary
    | ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary
    | null;
  sourceEvidenceChainPreserved: boolean;
  finalizationReferencePreserved: boolean;
  bridgeReferencePreserved: boolean;
  adapterValidationReferencePreserved: boolean;
  manualApprovalMetadataPreserved: boolean;
  auditAppendSeparate: true;
  auditRequiredBeforeWrite: true;
  auditMetadataPresent: boolean;
  provenanceMetadataPresent: boolean;
  sourceEvidenceTraceable: boolean;
  sourceEventIds: string[];
  handoffSessionId?: string | null;
  payloadId?: string | null;
  beforeAfterValuesRequiredLater: true;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  safeForCandidateOnlyInvocationReview: true;
  safeForWrite: false;
  blockedReason?: ExecutionRecordCandidateBuilderInvocationBlockedReason | null;
  warning?: ExecutionRecordCandidateBuilderInvocationWarning | null;
  reviewItem?: ExecutionRecordCandidateBuilderInvocationReviewItem | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderInvocationSchemaReadinessSummary = {
  sourceSummary?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary
    | ExecutionRecordCandidateBuilderIntegrationSchemaReadinessValidationSummary
    | ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary
    | null;
  schemaReadinessMetadataPresent: boolean;
  generatedTypesAvailable: boolean;
  generatedTypesReviewed: boolean;
  generatedTypesLocation?: string | null;
  generatedTypesRequiredForCandidateOnlyInvocation: boolean;
  migrationApplicationProven: boolean;
  migrationReference?: string | null;
  executionRecordsTablePresent?: boolean | null;
  executionRecordsSchemaAlignedWithCreationContract: boolean;
  persistenceBoundaryEnabled: false;
  insertRouteDryRunOnly: true;
  productionWriteEnabled: false;
  candidateOnlyInvocationIndependentFromDbGeneratedTypes: boolean;
  persistenceCouplingMustWaitForMigrationAndTypes: true;
  safeToPersist: false;
  blockedReasons: ExecutionRecordCandidateBuilderInvocationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderInvocationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderInvocationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderInvocationInput = {
  contractVersion: ExecutionRecordCandidateBuilderInvocationContractVersion;
  requestedAt: string;
  adapterResult?: ExecutionRecordCandidateBuilderIntegrationAdapterResult | null;
  adapterInput?: ExecutionRecordCandidateBuilderIntegrationAdapterInput | null;
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
  idempotencyMetadata?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary
    | ExecutionRecordCandidateBuilderIntegrationIdempotencyValidationSummary
    | ExecutionRecordCandidateBuilderIntegrationIdempotencySummary
    | null;
  auditProvenanceMetadata?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary
    | ExecutionRecordCandidateBuilderIntegrationAuditProvenanceValidationSummary
    | ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary
    | null;
  manualApprovalMetadata?:
    | FinalizationActionValidatorManualApprovalContext
    | null;
  schemaReadinessMetadata?:
    | ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary
    | ExecutionRecordCandidateBuilderIntegrationSchemaReadinessValidationSummary
    | ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary
    | null;
  prerequisiteSummary?: ExecutionRecordCandidateBuilderInvocationPrerequisiteSummary | null;
  inputSourceSummary?: ExecutionRecordCandidateBuilderInvocationInputSourceSummary | null;
  safetyPolicy?: ExecutionRecordCandidateBuilderInvocationSafetyPolicy | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderInvocationResult = {
  contractVersion: ExecutionRecordCandidateBuilderInvocationContractVersion;
  evaluatedAt: string;
  status: ExecutionRecordCandidateBuilderInvocationStatus;
  decisionRecommendation: ExecutionRecordCandidateBuilderInvocationDecisionRecommendation;
  input?: ExecutionRecordCandidateBuilderInvocationInput | null;
  prerequisiteSummary: ExecutionRecordCandidateBuilderInvocationPrerequisiteSummary;
  inputSourceSummary: ExecutionRecordCandidateBuilderInvocationInputSourceSummary;
  outputSummary: ExecutionRecordCandidateBuilderInvocationOutputSummary;
  idempotencySummary: ExecutionRecordCandidateBuilderInvocationIdempotencySummary;
  auditProvenanceSummary: ExecutionRecordCandidateBuilderInvocationAuditProvenanceSummary;
  schemaReadinessSummary: ExecutionRecordCandidateBuilderInvocationSchemaReadinessSummary;
  safetyPolicy: ExecutionRecordCandidateBuilderInvocationSafetyPolicy;
  blockedReasons: ExecutionRecordCandidateBuilderInvocationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderInvocationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderInvocationReviewItem[];
  contractOnly: true;
  invocationBoundaryOnly: true;
  candidateOnlyOutputBoundary: true;
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
  invocationImplemented: false;
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
