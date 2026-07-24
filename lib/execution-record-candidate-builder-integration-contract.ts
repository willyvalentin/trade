import type {
  ExecutionRecordCandidate,
  ExecutionRecordCreationInput,
  ExecutionRecordCreationResult,
} from "@/lib/execution-record-creation-contract";
import type {
  ExecutionRecordFinalizationBridgeAuditCorrectionValidationSummary,
  ExecutionRecordFinalizationBridgeIdempotencyValidationSummary,
  ExecutionRecordFinalizationBridgeSafetyPolicyValidationSummary,
  ExecutionRecordFinalizationBridgeValidationResult,
  ExecutionRecordFinalizationBridgeValidatedFieldSummary,
} from "@/lib/execution-record-finalization-bridge-validator-contract";
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

// Contract metadata only. These types describe the future handoff shape between
// the validated finalization-to-execution-record bridge and the execution-record
// candidate builder. They do not implement bridge mapping, call the candidate
// builder, create execution records, persist, write Supabase/localStorage,
// finalize, update stats/PnL, append audit records, rollback/correct, mutate
// trades, automate broker/Avanza behavior, execute orders, or enable automatic
// runtime behavior.

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_CONTRACT_VERSION =
  "execution_record_candidate_builder_integration_v1" as const;

export type ExecutionRecordCandidateBuilderIntegrationContractVersion =
  typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_CONTRACT_VERSION;

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_STATUSES = [
  "builder_integration_ready",
  "builder_integration_needs_review",
  "builder_integration_blocked",
  "builder_integration_unsupported",
  "builder_integration_not_ready",
] as const;

export type ExecutionRecordCandidateBuilderIntegrationStatus =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_STATUSES)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_DECISION_RECOMMENDATIONS =
  [
    "shape_candidate_input_only",
    "needs_manual_review",
    "blocked_do_not_build",
    "unsupported_do_not_build",
    "not_ready_do_not_build",
  ] as const;

export type ExecutionRecordCandidateBuilderIntegrationDecisionRecommendation =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_BLOCKED_REASONS = [
  "missing_bridge_result",
  "missing_bridge_validation",
  "bridge_validation_not_valid",
  "missing_builder_contract",
  "missing_candidate_input_shape",
  "missing_source_summary",
  "missing_idempotency_metadata",
  "missing_audit_correction_metadata",
  "missing_schema_readiness",
  "generated_types_absent_or_unknown",
  "migration_application_not_proven",
  "manual_approval_missing",
  "unsupported_source",
  "unsupported_broker",
  "safety_policy_authority_violation",
  "persistence_boundary_not_enabled",
] as const;

export type ExecutionRecordCandidateBuilderIntegrationBlockedReason =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_WARNINGS = [
  "contract_only",
  "candidate_input_shape_only",
  "builder_integration_not_builder_execution",
  "bridge_validation_not_write_approval",
  "generated_types_required_later",
  "migration_application_required_later",
  "audit_required_before_write",
  "idempotency_review_required",
  "duplicate_check_required",
  "stats_update_out_of_scope",
  "trade_mutation_out_of_scope",
] as const;

export type ExecutionRecordCandidateBuilderIntegrationWarning =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_WARNINGS)[number];

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_REVIEW_ITEMS = [
  "bridge_result_review",
  "bridge_validation_review",
  "candidate_input_shape_review",
  "source_summary_review",
  "field_mapping_review",
  "idempotency_review",
  "duplicate_review",
  "audit_correction_review",
  "manual_approval_review",
  "schema_readiness_review",
  "generated_types_review",
  "migration_application_review",
  "persistence_boundary_review",
  "safety_policy_review",
] as const;

export type ExecutionRecordCandidateBuilderIntegrationReviewItem =
  (typeof EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_REVIEW_ITEMS)[number];

export type ExecutionRecordCandidateBuilderIntegrationSafetyPolicy = {
  contractOnly: true;
  candidateInputShapeOnly: true;
  safeToCallCandidateBuilder: false;
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

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_DEFAULT_SAFETY_POLICY =
  {
    contractOnly: true,
    candidateInputShapeOnly: true,
    safeToCallCandidateBuilder: false,
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
      "Execution-record candidate builder integration contract types are contract-only and candidate-input-shape-only. They do not call the candidate builder, create execution records, persist, finalize, update stats/PnL, append audit records, roll back, mutate trades, run broker actions, automate browser/Avanza behavior, or enable automatic mode.",
  } as const satisfies ExecutionRecordCandidateBuilderIntegrationSafetyPolicy;

export type ExecutionRecordCandidateBuilderIntegrationSourceSummary = {
  bridgeResultPresent: boolean;
  bridgeResult?: FinalizationToExecutionRecordBridgeResult | null;
  bridgeValidationPresent: boolean;
  bridgeValidationResult?: ExecutionRecordFinalizationBridgeValidationResult | null;
  bridgeMapperResult?: FinalizationToExecutionRecordBridgeResult | null;
  originalBridgeInput?: FinalizationToExecutionRecordBridgeInput | null;
  finalizationCandidate?: FinalizationCandidate | null;
  sourceEvidenceSummary?: FinalizationToExecutionRecordSourceEvidenceSummary | null;
  targetSummary?: FinalizationToExecutionRecordTargetSummary | null;
  validationHandoffSummary?: FinalizationToExecutionRecordValidationHandoffSummary | null;
  sourceEvidenceTraceable: boolean;
  finalSettlementNoteIdentityPresent: boolean;
  supportedSource: boolean;
  supportedBroker: boolean;
  blockedReasons: ExecutionRecordCandidateBuilderIntegrationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderIntegrationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderIntegrationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderInputFieldSummary = {
  field: keyof ExecutionRecordCreationInput | string;
  sourceMapping?: FinalizationToExecutionRecordFieldMappingSummary | null;
  validationFieldSummary?: ExecutionRecordFinalizationBridgeValidatedFieldSummary | null;
  available: boolean;
  requiredForBuilderInput: boolean;
  requiresReview: boolean;
  blockedReason?: ExecutionRecordCandidateBuilderIntegrationBlockedReason | null;
  warning?: ExecutionRecordCandidateBuilderIntegrationWarning | null;
  reviewItem?: ExecutionRecordCandidateBuilderIntegrationReviewItem | null;
  sourceValuePreview?: string | number | boolean | null;
  targetValuePreview?: string | number | boolean | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderInputShapeSummary = {
  candidateBuilderContractPresent: boolean;
  candidateInputShapeAvailable: boolean;
  candidateInputShapeOnly: true;
  proposedCandidateInput?: Partial<ExecutionRecordCreationInput> | null;
  proposedCandidate?: ExecutionRecordCandidate | null;
  candidateBuilderResultPreview?: ExecutionRecordCreationResult | null;
  fieldMappingSummary?: FinalizationToExecutionRecordFieldMappingSummary[] | null;
  validatedFieldSummary?:
    | ExecutionRecordFinalizationBridgeValidatedFieldSummary[]
    | null;
  requiredFieldsPresent: boolean;
  missingRequiredFields: (keyof ExecutionRecordCreationInput | string)[];
  shapedFields: ExecutionRecordCandidateBuilderInputFieldSummary[];
  safeToCallCandidateBuilder: false;
  safeToCreateExecutionRecord: false;
  builderInvocationAttempted: false;
  executionRecordCreationAttempted: false;
  blockedReasons: ExecutionRecordCandidateBuilderIntegrationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderIntegrationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderIntegrationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderIntegrationHandoffSummary = {
  contractOnly: true;
  bridgeResultPresent: boolean;
  bridgeValidationPresent: boolean;
  bridgeValidationValid: boolean;
  bridgeMapperResultPresent: boolean;
  finalizationCandidatePresent: boolean;
  candidateBuilderContractPresent: boolean;
  candidateInputShapeAvailable: boolean;
  manualApprovalRequired: boolean;
  manualApprovalPresent: boolean;
  canShapeCandidateInput: boolean;
  safeToCallCandidateBuilder: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  candidateBuilderCalled: false;
  builderIntegrationImplemented: false;
  executionRecordCreated: false;
  persistenceAttempted: false;
  blockedReasons: ExecutionRecordCandidateBuilderIntegrationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderIntegrationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderIntegrationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderIntegrationIdempotencySummary = {
  sourceSummary?: FinalizationToExecutionRecordIdempotencySummary | null;
  validationSummary?:
    | ExecutionRecordFinalizationBridgeIdempotencyValidationSummary
    | null;
  requiredFingerprintsPresent: boolean;
  duplicateCheckRequired: true;
  duplicateDetected: boolean;
  duplicateOfRecordId?: string | null;
  retrySafe: boolean;
  mismatchRequiresReview: boolean;
  intendedExecutionRecordCandidateFingerprint?: string | null;
  intendedExecutionRecordIdempotencyKey?: string | null;
  sourceEvidenceFingerprint?: string | null;
  finalSettlementNoteMatchIdentity?: string | null;
  safeForCandidateInputShapeOnly: true;
  safeForWrite: false;
  blockedReason?: ExecutionRecordCandidateBuilderIntegrationBlockedReason | null;
  warning?: ExecutionRecordCandidateBuilderIntegrationWarning | null;
  reviewItem?: ExecutionRecordCandidateBuilderIntegrationReviewItem | null;
  details?: string | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary = {
  sourceSummary?: FinalizationToExecutionRecordAuditCorrectionSummary | null;
  validationSummary?:
    | ExecutionRecordFinalizationBridgeAuditCorrectionValidationSummary
    | null;
  auditCorrectionMetadata?:
    | FinalizationActionValidatorAuditCorrectionMetadata
    | null;
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  auditRequiredBeforeWrite: true;
  auditMetadataPresent: boolean;
  correctionMetadataPresent: boolean;
  sourceEvidenceTraceable: boolean;
  manualApprovalRequired: boolean;
  manualApprovalPresent: boolean;
  duplicatePreventionReference?: string | null;
  correctionStrategyReference?: string | null;
  rollbackMetadataRequired: boolean;
  rollbackMetadataPresent: boolean;
  auditAppendAttempted: false;
  rollbackAttempted: false;
  safeForCandidateInputShapeOnly: true;
  safeForWrite: false;
  blockedReason?: ExecutionRecordCandidateBuilderIntegrationBlockedReason | null;
  warning?: ExecutionRecordCandidateBuilderIntegrationWarning | null;
  reviewItem?: ExecutionRecordCandidateBuilderIntegrationReviewItem | null;
  details?: string | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary = {
  schemaReadinessMetadataPresent: boolean;
  generatedTypesAvailable: boolean;
  generatedTypesLocation?: string | null;
  generatedTypesReviewed: boolean;
  executionRecordsTablePresent?: boolean | null;
  executionRecordsSchemaAlignedWithContract: boolean;
  migrationApplicationProven: boolean;
  migrationReference?: string | null;
  rlsPolicyReviewed: boolean;
  persistenceBoundaryEnabled: false;
  insertRouteDryRunOnly: true;
  productionWriteEnabled: false;
  safeToPersist: false;
  blockedReasons: ExecutionRecordCandidateBuilderIntegrationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderIntegrationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderIntegrationReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderIntegrationInput = {
  contractVersion: ExecutionRecordCandidateBuilderIntegrationContractVersion;
  requestedAt: string;
  bridgeResult?: FinalizationToExecutionRecordBridgeResult | null;
  bridgeValidationResult?:
    | ExecutionRecordFinalizationBridgeValidationResult
    | null;
  bridgeMapperResult?: FinalizationToExecutionRecordBridgeResult | null;
  originalBridgeInput?: FinalizationToExecutionRecordBridgeInput | null;
  finalizationCandidate?: FinalizationCandidate | null;
  candidateBuilderInputShape?: Partial<ExecutionRecordCreationInput> | null;
  candidateBuilderResultPreview?: ExecutionRecordCreationResult | null;
  existingExecutionRecordCandidateMetadata?: ExecutionRecordCandidate | null;
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  idempotencyMetadata?:
    | FinalizationToExecutionRecordIdempotencySummary
    | ExecutionRecordFinalizationBridgeIdempotencyValidationSummary
    | null;
  auditCorrectionMetadata?:
    | FinalizationActionValidatorAuditCorrectionMetadata
    | FinalizationToExecutionRecordAuditCorrectionSummary
    | ExecutionRecordFinalizationBridgeAuditCorrectionValidationSummary
    | null;
  sourceEvidenceSummary?: FinalizationToExecutionRecordSourceEvidenceSummary | null;
  targetSummary?: FinalizationToExecutionRecordTargetSummary | null;
  fieldMappingSummary?: FinalizationToExecutionRecordFieldMappingSummary[] | null;
  validationHandoffSummary?:
    | FinalizationToExecutionRecordValidationHandoffSummary
    | null;
  safetyPolicyValidationSummary?:
    | ExecutionRecordFinalizationBridgeSafetyPolicyValidationSummary
    | null;
  schemaReadinessSummary?:
    | ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary
    | null;
  safetyPolicy?: ExecutionRecordCandidateBuilderIntegrationSafetyPolicy | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordCandidateBuilderIntegrationResult = {
  contractVersion: ExecutionRecordCandidateBuilderIntegrationContractVersion;
  evaluatedAt: string;
  status: ExecutionRecordCandidateBuilderIntegrationStatus;
  decisionRecommendation: ExecutionRecordCandidateBuilderIntegrationDecisionRecommendation;
  input?: ExecutionRecordCandidateBuilderIntegrationInput | null;
  sourceSummary: ExecutionRecordCandidateBuilderIntegrationSourceSummary;
  inputShapeSummary: ExecutionRecordCandidateBuilderInputShapeSummary;
  handoffSummary: ExecutionRecordCandidateBuilderIntegrationHandoffSummary;
  idempotencySummary: ExecutionRecordCandidateBuilderIntegrationIdempotencySummary;
  auditCorrectionSummary: ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary;
  schemaReadinessSummary: ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary;
  safetyPolicy: ExecutionRecordCandidateBuilderIntegrationSafetyPolicy;
  blockedReasons: ExecutionRecordCandidateBuilderIntegrationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderIntegrationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderIntegrationReviewItem[];
  contractOnly: true;
  candidateInputShapeOnly: true;
  safeToCallCandidateBuilder: false;
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

export const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_STATUS_METADATA = {
  builder_integration_ready: {
    decisionRecommendation: "shape_candidate_input_only",
    requiresManualReview: true,
    blocksBuilderInvocation: true,
    blocksWrites: true,
    reason:
      "Bridge and validation metadata may be ready to shape candidate-builder input only; this contract still does not call the builder or approve writes.",
  },
  builder_integration_needs_review: {
    decisionRecommendation: "needs_manual_review",
    requiresManualReview: true,
    blocksBuilderInvocation: true,
    blocksWrites: true,
    reason:
      "Candidate-builder integration metadata requires manual review before any future builder, creation, or persistence boundary.",
  },
  builder_integration_blocked: {
    decisionRecommendation: "blocked_do_not_build",
    requiresManualReview: true,
    blocksBuilderInvocation: true,
    blocksWrites: true,
    reason:
      "Required bridge, validation, input-shape, idempotency, audit/correction, approval, schema, or safety metadata is missing or blocking.",
  },
  builder_integration_unsupported: {
    decisionRecommendation: "unsupported_do_not_build",
    requiresManualReview: true,
    blocksBuilderInvocation: true,
    blocksWrites: true,
    reason:
      "The source, broker, builder input shape, or schema scenario is unsupported.",
  },
  builder_integration_not_ready: {
    decisionRecommendation: "not_ready_do_not_build",
    requiresManualReview: true,
    blocksBuilderInvocation: true,
    blocksWrites: true,
    reason:
      "Candidate-builder integration metadata is incomplete and cannot progress beyond contract-only review.",
  },
} as const satisfies Record<
  ExecutionRecordCandidateBuilderIntegrationStatus,
  {
    decisionRecommendation: ExecutionRecordCandidateBuilderIntegrationDecisionRecommendation;
    requiresManualReview: true;
    blocksBuilderInvocation: true;
    blocksWrites: true;
    reason: string;
  }
>;
