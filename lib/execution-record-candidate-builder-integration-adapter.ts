import {
  EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_CONTRACT_VERSION,
  EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_DEFAULT_SAFETY_POLICY,
  type ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary,
  type ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason,
  type ExecutionRecordCandidateBuilderIntegrationAdapterDecisionRecommendation,
  type ExecutionRecordCandidateBuilderIntegrationAdapterFieldMappingSummary,
  type ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary,
  type ExecutionRecordCandidateBuilderIntegrationAdapterInput,
  type ExecutionRecordCandidateBuilderIntegrationAdapterPreconditionSummary,
  type ExecutionRecordCandidateBuilderIntegrationAdapterProposedInputSummary,
  type ExecutionRecordCandidateBuilderIntegrationAdapterResult,
  type ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem,
  type ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary,
  type ExecutionRecordCandidateBuilderIntegrationAdapterStatus,
  type ExecutionRecordCandidateBuilderIntegrationAdapterWarning,
} from "@/lib/execution-record-candidate-builder-integration-adapter-contract";
import type {
  ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary,
  ExecutionRecordCandidateBuilderIntegrationIdempotencySummary,
  ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary,
  ExecutionRecordCandidateBuilderIntegrationStatus,
} from "@/lib/execution-record-candidate-builder-integration-contract";
import type { ExecutionRecordCreationInput } from "@/lib/execution-record-creation-contract";
import type {
  ExecutionRecordFinalizationBridgeAuditCorrectionValidationSummary,
  ExecutionRecordFinalizationBridgeIdempotencyValidationSummary,
  ExecutionRecordFinalizationBridgeValidationResult,
} from "@/lib/execution-record-finalization-bridge-validator-contract";
import type { FinalizationActionValidatorAuditCorrectionMetadata } from "@/lib/finalization-action-validator-contract";
import type {
  FinalizationToExecutionRecordAuditCorrectionSummary,
  FinalizationToExecutionRecordBridgeResult,
  FinalizationToExecutionRecordFieldMappingSummary,
  FinalizationToExecutionRecordIdempotencySummary,
} from "@/lib/finalization-to-execution-record-bridge-contract";

type AdapterSchemaInput =
  | ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary
  | ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary;

type AdapterIdempotencyInput =
  | ExecutionRecordCandidateBuilderIntegrationIdempotencySummary
  | FinalizationToExecutionRecordIdempotencySummary
  | ExecutionRecordFinalizationBridgeIdempotencyValidationSummary;

type AdapterAuditInput =
  | ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary
  | FinalizationActionValidatorAuditCorrectionMetadata
  | FinalizationToExecutionRecordAuditCorrectionSummary
  | ExecutionRecordFinalizationBridgeAuditCorrectionValidationSummary;

const BASE_WARNINGS: ExecutionRecordCandidateBuilderIntegrationAdapterWarning[] =
  [
    "contract_only",
    "adapter_not_implemented",
    "proposed_input_only",
    "builder_not_called",
    "candidate_not_created",
    "audit_required_before_write",
    "duplicate_check_required",
    "stats_update_out_of_scope",
    "trade_mutation_out_of_scope",
  ];

const REQUIRED_INPUT_FIELDS: Array<keyof ExecutionRecordCreationInput | string> =
  [
    "contractVersion",
    "requestedAt",
    "sourceEnvironment",
    "executionMode",
    "executionPhase",
    "expectedAction",
    "expectedInstrument.ticker",
    "sourceBrokerExecutionResult",
    "brokerMetadata.confirmationTimestamp",
    "idempotency.idempotencyKey",
    "idempotency.sourceEvidenceFingerprint",
    "auditContext",
  ];

function pushUnique<T extends string>(items: T[], item: T) {
  if (!items.includes(item)) {
    items.push(item);
  }
}

function hasValue(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function pickBridgeResult(
  input: ExecutionRecordCandidateBuilderIntegrationAdapterInput,
): FinalizationToExecutionRecordBridgeResult | null {
  return (
    input.bridgeResult ??
    input.bridgeMapperResult ??
    input.integrationResult?.sourceSummary.bridgeResult ??
    input.integrationInput?.bridgeResult ??
    null
  );
}

function pickBridgeValidation(
  input: ExecutionRecordCandidateBuilderIntegrationAdapterInput,
): ExecutionRecordFinalizationBridgeValidationResult | null {
  return (
    input.bridgeValidationResult ??
    input.integrationResult?.sourceSummary.bridgeValidationResult ??
    input.integrationInput?.bridgeValidationResult ??
    null
  );
}

function pickSchemaReadiness(
  input: ExecutionRecordCandidateBuilderIntegrationAdapterInput,
): AdapterSchemaInput | null {
  return (
    input.schemaReadinessSummary ??
    input.integrationResult?.schemaReadinessSummary ??
    input.integrationInput?.schemaReadinessSummary ??
    null
  );
}

function pickIdempotency(
  input: ExecutionRecordCandidateBuilderIntegrationAdapterInput,
  bridgeResult: FinalizationToExecutionRecordBridgeResult | null,
): AdapterIdempotencyInput | null {
  return (
    input.idempotencyMetadata ??
    input.integrationResult?.idempotencySummary ??
    input.integrationInput?.idempotencyMetadata ??
    bridgeResult?.idempotencySummary ??
    null
  );
}

function pickAudit(
  input: ExecutionRecordCandidateBuilderIntegrationAdapterInput,
  bridgeResult: FinalizationToExecutionRecordBridgeResult | null,
): AdapterAuditInput | null {
  return (
    input.auditCorrectionMetadata ??
    input.integrationResult?.auditCorrectionSummary ??
    input.integrationInput?.auditCorrectionMetadata ??
    bridgeResult?.auditCorrectionSummary ??
    null
  );
}

function pickProposedCreationInput(
  input: ExecutionRecordCandidateBuilderIntegrationAdapterInput,
  bridgeResult: FinalizationToExecutionRecordBridgeResult | null,
): Partial<ExecutionRecordCreationInput> | null {
  return (
    input.proposedCreationInput ??
    input.integrationInput?.candidateBuilderInputShape ??
    input.integrationResult?.inputShapeSummary.proposedCandidateInput ??
    bridgeResult?.targetSummary.intendedCreationInput ??
    null
  );
}

function getPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, part) => {
    if (!hasObject(current)) {
      return undefined;
    }

    return current[part];
  }, value);
}

function missingRequiredFields(
  proposedCreationInput: Partial<ExecutionRecordCreationInput> | null,
): string[] {
  return REQUIRED_INPUT_FIELDS.filter((field) => {
    const value = getPath(proposedCreationInput, String(field));

    if (typeof value === "string") {
      return !hasValue(value);
    }

    return value === null || value === undefined;
  }).map(String);
}

function isAdapterSchemaSummary(
  value: AdapterSchemaInput,
): value is ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary {
  return "executionRecordsSchemaAlignedWithCreationContract" in value;
}

function schemaAlignedWithCreationContract(value: AdapterSchemaInput): boolean {
  return isAdapterSchemaSummary(value)
    ? value.executionRecordsSchemaAlignedWithCreationContract
    : value.executionRecordsSchemaAlignedWithContract;
}

function schemaBlockedReasons(
  schema: AdapterSchemaInput | null,
): ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason[] {
  if (!schema) {
    return ["missing_schema_readiness"];
  }

  const reasons: ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason[] =
    [];

  if (!schema.generatedTypesAvailable || !schema.generatedTypesReviewed) {
    reasons.push("generated_types_absent_or_unknown");
  }

  if (!schema.migrationApplicationProven) {
    reasons.push("migration_application_not_proven");
  }

  if (schema.persistenceBoundaryEnabled !== false) {
    reasons.push("persistence_boundary_not_enabled");
  }

  return reasons;
}

function buildSchemaReadinessSummary(
  schema: AdapterSchemaInput | null,
): ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary {
  const blockedReasons = schemaBlockedReasons(schema);
  const warnings: ExecutionRecordCandidateBuilderIntegrationAdapterWarning[] = [];
  const reviewItems: ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem[] =
    [];

  if (!schema || !schema.generatedTypesAvailable || !schema.generatedTypesReviewed) {
    warnings.push("generated_types_required_later");
    reviewItems.push("generated_types_review");
  }

  if (!schema || !schema.migrationApplicationProven) {
    warnings.push("migration_application_required_later");
    reviewItems.push("migration_application_review");
  }

  if (!schema) {
    reviewItems.push("schema_readiness_review");
  }

  return {
    sourceSummary: schema && !isAdapterSchemaSummary(schema) ? schema : null,
    schemaReadinessMetadataPresent: Boolean(schema),
    generatedTypesAvailable: schema?.generatedTypesAvailable ?? false,
    generatedTypesReviewed: schema?.generatedTypesReviewed ?? false,
    generatedTypesLocation: schema?.generatedTypesLocation ?? null,
    migrationApplicationProven: schema?.migrationApplicationProven ?? false,
    migrationReference: schema?.migrationReference ?? null,
    executionRecordsTablePresent: schema?.executionRecordsTablePresent ?? null,
    executionRecordsSchemaAlignedWithCreationContract: schema
      ? schemaAlignedWithCreationContract(schema)
      : false,
    rlsPolicyReviewed: schema?.rlsPolicyReviewed ?? false,
    persistenceBoundaryEnabled: false,
    insertRouteDryRunOnly: true,
    productionWriteEnabled: false,
    safeToPersist: false,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function idempotencyKey(
  value: AdapterIdempotencyInput | null,
): string | null {
  if (!value) {
    return null;
  }

  if ("intendedExecutionRecordIdempotencyKey" in value) {
    return value.intendedExecutionRecordIdempotencyKey ?? null;
  }

  if ("sourceSummary" in value) {
    return value.sourceSummary?.intendedExecutionRecordIdempotencyKey ?? null;
  }

  return null;
}

function idempotencyCandidateFingerprint(
  value: AdapterIdempotencyInput | null,
): string | null {
  if (!value) {
    return null;
  }

  if ("intendedExecutionRecordCandidateFingerprint" in value) {
    return value.intendedExecutionRecordCandidateFingerprint ?? null;
  }

  if ("sourceSummary" in value) {
    return value.sourceSummary?.intendedExecutionRecordCandidateFingerprint ?? null;
  }

  return null;
}

function idempotencySourceFingerprint(
  value: AdapterIdempotencyInput | null,
): string | null {
  if (!value) {
    return null;
  }

  if ("sourceEvidenceFingerprint" in value) {
    return value.sourceEvidenceFingerprint ?? null;
  }

  if ("sourceSummary" in value) {
    return value.sourceSummary?.sourceEvidenceFingerprint ?? null;
  }

  return null;
}

function idempotencyBrokerFingerprint(
  value: AdapterIdempotencyInput | null,
): string | null {
  if (!value) {
    return null;
  }

  if ("brokerResultFingerprint" in value) {
    return typeof value.brokerResultFingerprint === "string"
      ? value.brokerResultFingerprint
      : null;
  }

  if ("brokerExecutionResultCandidateFingerprint" in value) {
    return value.brokerExecutionResultCandidateFingerprint ?? null;
  }

  if ("sourceSummary" in value) {
    return value.sourceSummary?.brokerExecutionResultCandidateFingerprint ?? null;
  }

  return null;
}

function idempotencyHandoffFingerprint(
  value: AdapterIdempotencyInput | null,
): string | null {
  if (!value) {
    return null;
  }

  if ("handoffPayloadFingerprint" in value) {
    return value.handoffPayloadFingerprint ?? null;
  }

  if ("sourceSummary" in value) {
    return value.sourceSummary?.handoffPayloadFingerprint ?? null;
  }

  return null;
}

function idempotencyFinalMatchIdentity(
  value: AdapterIdempotencyInput | null,
): string | null {
  if (!value) {
    return null;
  }

  if ("finalSettlementNoteMatchIdentity" in value) {
    return value.finalSettlementNoteMatchIdentity ?? null;
  }

  if ("sourceSummary" in value) {
    return value.sourceSummary?.finalSettlementNoteMatchIdentity ?? null;
  }

  return null;
}

function idempotencyDuplicateOfRecordId(
  value: AdapterIdempotencyInput | null,
): string | null {
  if (!value) {
    return null;
  }

  if ("duplicateOfRecordId" in value) {
    return value.duplicateOfRecordId ?? null;
  }

  return null;
}

function buildIdempotencySummary(
  idempotency: AdapterIdempotencyInput | null,
): ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary {
  return {
    integrationSummary:
      idempotency && "safeForCandidateInputShapeOnly" in idempotency
        ? idempotency
        : null,
    bridgeSummary:
      idempotency && "missingFingerprintReasons" in idempotency
        ? idempotency
        : null,
    validationSummary:
      idempotency && "safeForValidationOnly" in idempotency
        ? idempotency
        : null,
    intendedExecutionRecordIdempotencyKey: idempotencyKey(idempotency),
    intendedExecutionRecordCandidateFingerprint:
      idempotencyCandidateFingerprint(idempotency),
    sourceEvidenceFingerprint: idempotencySourceFingerprint(idempotency),
    brokerResultFingerprint: idempotencyBrokerFingerprint(idempotency),
    handoffPayloadFingerprint: idempotencyHandoffFingerprint(idempotency),
    finalSettlementNoteMatchIdentity:
      idempotencyFinalMatchIdentity(idempotency),
    requiredFingerprintsPresent:
      idempotency?.requiredFingerprintsPresent ?? false,
    duplicateCheckRequired: true,
    duplicateDetected: idempotency?.duplicateDetected ?? false,
    duplicateOfRecordId: idempotencyDuplicateOfRecordId(idempotency),
    retrySafe: idempotency?.retrySafe ?? false,
    mismatchRequiresReview: idempotency?.mismatchRequiresReview ?? true,
    safeForProposedInputOnly: true,
    safeForWrite: false,
    blockedReason: idempotency ? null : "missing_idempotency_metadata",
    warning: idempotency ? null : "idempotency_review_required",
    reviewItem: idempotency ? null : "idempotency_review",
  };
}

function auditMetadataPresent(value: AdapterAuditInput | null): boolean {
  if (!value) {
    return false;
  }

  if ("auditMetadataPresent" in value) {
    return value.auditMetadataPresent;
  }

  if ("auditRequired" in value) {
    return value.auditRequired;
  }

  return false;
}

function isBridgeAuditSummary(
  value: AdapterAuditInput,
): value is FinalizationToExecutionRecordAuditCorrectionSummary {
  return "correctionEligible" in value;
}

function isIntegrationAuditSummary(
  value: AdapterAuditInput,
): value is ExecutionRecordCandidateBuilderIntegrationAuditCorrectionSummary {
  return "safeForCandidateInputShapeOnly" in value;
}

function isValidationAuditSummary(
  value: AdapterAuditInput,
): value is ExecutionRecordFinalizationBridgeAuditCorrectionValidationSummary {
  return "readyForFutureWriteBoundary" in value;
}

function auditCorrectionPresent(value: AdapterAuditInput | null): boolean {
  if (!value) {
    return false;
  }

  if ("correctionMetadataPresent" in value) {
    return value.correctionMetadataPresent;
  }

  if ("correctionRollbackRequired" in value) {
    return value.correctionRollbackRequired;
  }

  return false;
}

function auditSourceEvidenceTraceable(value: AdapterAuditInput | null): boolean {
  if (!value) {
    return false;
  }

  if ("sourceEvidenceTraceable" in value) {
    return value.sourceEvidenceTraceable;
  }

  if (!("sourceEvidenceReference" in value)) {
    return false;
  }

  return hasValue(value.sourceEvidenceReference);
}

function auditManualApprovalRequired(value: AdapterAuditInput | null): boolean {
  if (!value) {
    return true;
  }

  if ("manualApprovalRequired" in value) {
    return value.manualApprovalRequired;
  }

  return true;
}

function auditManualApprovalPresent(value: AdapterAuditInput | null): boolean {
  if (!value) {
    return false;
  }

  if ("manualApprovalPresent" in value) {
    return value.manualApprovalPresent;
  }

  if (!("manualApprovalReference" in value)) {
    return false;
  }

  return hasValue(value.manualApprovalReference);
}

function auditRollbackRequired(value: AdapterAuditInput | null): boolean {
  if (!value) {
    return true;
  }

  if ("rollbackMetadataRequired" in value) {
    return value.rollbackMetadataRequired;
  }

  if ("correctionRollbackRequired" in value) {
    return value.correctionRollbackRequired;
  }

  return true;
}

function auditRollbackPresent(value: AdapterAuditInput | null): boolean {
  if (!value) {
    return false;
  }

  if ("rollbackMetadataPresent" in value) {
    return value.rollbackMetadataPresent;
  }

  if (!("rollbackMetadataReference" in value)) {
    return false;
  }

  return hasValue(value.rollbackMetadataReference);
}

function auditDuplicateReference(value: AdapterAuditInput | null): string | null {
  if (!value) {
    return null;
  }

  if ("duplicatePreventionReference" in value) {
    return value.duplicatePreventionReference ?? null;
  }

  return null;
}

function auditCorrectionStrategy(value: AdapterAuditInput | null): string | null {
  if (!value) {
    return null;
  }

  if ("correctionStrategyReference" in value) {
    return value.correctionStrategyReference ?? null;
  }

  return null;
}

function buildAuditProvenanceSummary(
  input: ExecutionRecordCandidateBuilderIntegrationAdapterInput,
  audit: AdapterAuditInput | null,
  proposedCreationInput: Partial<ExecutionRecordCreationInput> | null,
): ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary {
  const manualApprovalContext =
    input.manualApprovalContext ??
    input.integrationInput?.manualApprovalContext ??
    null;
  const manualApprovalRequired =
    manualApprovalContext?.approvalRequired ?? auditManualApprovalRequired(audit);
  const manualApprovalPresent =
    manualApprovalContext?.approvalPresent ?? auditManualApprovalPresent(audit);

  return {
    integrationSummary: audit && isIntegrationAuditSummary(audit) ? audit : null,
    bridgeSummary: audit && isBridgeAuditSummary(audit) ? audit : null,
    validationSummary: audit && isValidationAuditSummary(audit) ? audit : null,
    auditCorrectionMetadata:
      input.integrationInput?.auditCorrectionMetadata &&
      "auditRequired" in input.integrationInput.auditCorrectionMetadata
        ? input.integrationInput.auditCorrectionMetadata
        : null,
    manualApprovalContext,
    auditRequiredBeforeWrite: true,
    auditMetadataPresent: auditMetadataPresent(audit),
    provenanceMetadataPresent: Boolean(
      proposedCreationInput?.auditContext || input.sourceEvidenceSummary,
    ),
    correctionMetadataPresent: auditCorrectionPresent(audit),
    sourceEvidenceTraceable: auditSourceEvidenceTraceable(audit),
    manualApprovalRequired,
    manualApprovalPresent,
    sourceEventIds: proposedCreationInput?.auditContext?.sourceEventIds ?? [],
    handoffSessionId: proposedCreationInput?.auditContext?.handoffSessionId ?? null,
    payloadId: proposedCreationInput?.auditContext?.payloadId ?? null,
    duplicatePreventionReference: auditDuplicateReference(audit),
    correctionStrategyReference: auditCorrectionStrategy(audit),
    rollbackMetadataRequired: auditRollbackRequired(audit),
    rollbackMetadataPresent: auditRollbackPresent(audit),
    auditAppendAttempted: false,
    rollbackAttempted: false,
    safeForProposedInputOnly: true,
    safeForWrite: false,
    blockedReason: audit ? null : "missing_audit_provenance_metadata",
    warning: audit ? null : "audit_required_before_write",
    reviewItem: audit ? null : "audit_provenance_review",
  };
}

function mapBridgeField(
  field: FinalizationToExecutionRecordFieldMappingSummary,
): ExecutionRecordCandidateBuilderIntegrationAdapterFieldMappingSummary {
  return {
    sourcePath: field.source,
    targetPath: field.targetPath ?? field.field,
    sourceMapping: field,
    available: field.available,
    requiredForProposedInput: field.requiredForCandidateInput,
    mapped: field.available && Boolean(field.targetPath),
    requiresReview: field.requiresReview,
    sourceValuePreview: field.sourceValuePreview,
    targetValuePreview: field.targetValuePreview,
    blockedReason: field.available ? null : "missing_required_builder_input_field",
    warning: field.requiresReview ? "proposed_input_only" : null,
    reviewItem: field.requiresReview ? "field_mapping_review" : null,
    metadata: field.metadata,
  };
}

function mapRequiredField(
  field: string,
  proposedCreationInput: Partial<ExecutionRecordCreationInput> | null,
): ExecutionRecordCandidateBuilderIntegrationAdapterFieldMappingSummary {
  const value = getPath(proposedCreationInput, field);
  const available =
    typeof value === "string"
      ? hasValue(value)
      : value !== null && value !== undefined;

  return {
    sourcePath: "proposed_creation_input",
    targetPath: field,
    available,
    requiredForProposedInput: true,
    mapped: available,
    requiresReview: !available,
    targetValuePreview:
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
        ? value
        : null,
    blockedReason: available ? null : "missing_required_builder_input_field",
    warning: available ? null : "proposed_input_only",
    reviewItem: available ? null : "creation_input_shape_review",
  };
}

function buildFieldMappingSummary(
  input: ExecutionRecordCandidateBuilderIntegrationAdapterInput,
  bridgeResult: FinalizationToExecutionRecordBridgeResult | null,
  proposedCreationInput: Partial<ExecutionRecordCreationInput> | null,
): ExecutionRecordCandidateBuilderIntegrationAdapterFieldMappingSummary[] {
  const bridgeMappings =
    input.fieldMappingSummary ??
    input.integrationInput?.fieldMappingSummary ??
    input.integrationResult?.inputShapeSummary.fieldMappingSummary ??
    bridgeResult?.fieldMappingSummary ??
    [];

  return [
    ...bridgeMappings.map(mapBridgeField),
    ...REQUIRED_INPUT_FIELDS.map((field) =>
      mapRequiredField(String(field), proposedCreationInput),
    ),
  ];
}

function buildProposedInputSummary(
  proposedCreationInput: Partial<ExecutionRecordCreationInput> | null,
  fieldMappingSummary: ExecutionRecordCandidateBuilderIntegrationAdapterFieldMappingSummary[],
): ExecutionRecordCandidateBuilderIntegrationAdapterProposedInputSummary {
  const missingFields = missingRequiredFields(proposedCreationInput);
  const blockedReasons: ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason[] =
    [];
  const warnings: ExecutionRecordCandidateBuilderIntegrationAdapterWarning[] = [
    "proposed_input_only",
    "builder_not_called",
    "candidate_not_created",
  ];
  const reviewItems: ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem[] =
    [];

  if (missingFields.length > 0) {
    blockedReasons.push("missing_required_builder_input_field");
    reviewItems.push("creation_input_shape_review");
  }

  return {
    proposedInputOnly: true,
    proposedCreationInput,
    proposedSourceBrokerExecutionResult:
      proposedCreationInput?.sourceBrokerExecutionResult ?? null,
    requiredFieldsPresent: missingFields.length === 0,
    missingRequiredFields: missingFields,
    mappedFields: fieldMappingSummary,
    safeToCallCandidateBuilder: false,
    safeToCreateExecutionRecordCandidate: false,
    candidateBuilderCalled: false,
    executionRecordCandidateCreated: false,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function integrationStatusReview(
  status: ExecutionRecordCandidateBuilderIntegrationStatus | null,
): {
  blockedReasons: ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderIntegrationAdapterWarning[];
  reviewItems: ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem[];
  statusHint?: ExecutionRecordCandidateBuilderIntegrationAdapterStatus;
} {
  if (!status || status === "builder_integration_ready") {
    return { blockedReasons: [], warnings: [], reviewItems: [] };
  }

  if (status === "builder_integration_unsupported") {
    return {
      blockedReasons: ["integration_not_ready", "unsupported_source"],
      warnings: ["proposed_input_only"],
      reviewItems: ["integration_result_review"],
      statusHint: "adapter_input_unsupported",
    };
  }

  if (status === "builder_integration_not_ready") {
    return {
      blockedReasons: ["integration_not_ready"],
      warnings: ["proposed_input_only"],
      reviewItems: ["integration_result_review"],
      statusHint: "adapter_input_not_ready",
    };
  }

  return {
    blockedReasons: ["integration_not_ready"],
    warnings: ["proposed_input_only"],
    reviewItems: ["integration_result_review"],
    statusHint:
      status === "builder_integration_needs_review"
        ? "adapter_input_needs_review"
        : "adapter_input_blocked",
  };
}

function bridgeValidationReview(
  bridgeValidation: ExecutionRecordFinalizationBridgeValidationResult | null,
): {
  blockedReasons: ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderIntegrationAdapterWarning[];
  reviewItems: ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem[];
  statusHint?: ExecutionRecordCandidateBuilderIntegrationAdapterStatus;
} {
  if (!bridgeValidation) {
    return {
      blockedReasons: ["missing_bridge_validation"],
      warnings: ["proposed_input_only"],
      reviewItems: ["bridge_validation_review"],
      statusHint: "adapter_input_blocked",
    };
  }

  if (bridgeValidation.status === "bridge_validation_valid") {
    return { blockedReasons: [], warnings: [], reviewItems: [] };
  }

  if (bridgeValidation.status === "bridge_validation_needs_review") {
    return {
      blockedReasons: ["bridge_validation_not_valid"],
      warnings: ["proposed_input_only"],
      reviewItems: ["bridge_validation_review"],
      statusHint: "adapter_input_needs_review",
    };
  }

  if (bridgeValidation.status === "bridge_validation_unsupported") {
    return {
      blockedReasons: ["bridge_validation_not_valid", "unsupported_source"],
      warnings: ["proposed_input_only"],
      reviewItems: ["bridge_validation_review"],
      statusHint: "adapter_input_unsupported",
    };
  }

  return {
    blockedReasons: ["bridge_validation_not_valid"],
    warnings: ["proposed_input_only"],
    reviewItems: ["bridge_validation_review"],
    statusHint: "adapter_input_blocked",
  };
}

function buildPreconditionSummary(input: {
  adapterInput: ExecutionRecordCandidateBuilderIntegrationAdapterInput;
  bridgeResult: FinalizationToExecutionRecordBridgeResult | null;
  bridgeValidation: ExecutionRecordFinalizationBridgeValidationResult | null;
  proposedInputSummary: ExecutionRecordCandidateBuilderIntegrationAdapterProposedInputSummary;
  schemaReadinessSummary: ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary;
  idempotencySummary: ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary;
  auditProvenanceSummary: ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary;
  blockedReasons: ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderIntegrationAdapterWarning[];
  reviewItems: ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem[];
}): ExecutionRecordCandidateBuilderIntegrationAdapterPreconditionSummary {
  const manualApprovalRequired =
    input.auditProvenanceSummary.manualApprovalRequired;
  const manualApprovalPresent = input.auditProvenanceSummary.manualApprovalPresent;

  return {
    integrationInputPresent: Boolean(input.adapterInput.integrationInput),
    integrationResultPresent: Boolean(input.adapterInput.integrationResult),
    integrationResultReadyForShapeReview:
      input.adapterInput.integrationResult?.status === "builder_integration_ready",
    bridgeResultPresent: Boolean(input.bridgeResult),
    bridgeValidationPresent: Boolean(input.bridgeValidation),
    bridgeValidationValid:
      input.bridgeValidation?.status === "bridge_validation_valid",
    bridgeMapperResultPresent: Boolean(input.adapterInput.bridgeMapperResult),
    finalizationCandidatePresent: Boolean(
      input.adapterInput.finalizationCandidate ??
        input.adapterInput.integrationInput?.finalizationCandidate,
    ),
    sourceEvidenceSummaryPresent: Boolean(
      input.adapterInput.sourceEvidenceSummary ??
        input.adapterInput.integrationInput?.sourceEvidenceSummary ??
        input.bridgeResult?.sourceEvidenceSummary,
    ),
    targetSummaryPresent: Boolean(
      input.adapterInput.targetSummary ??
        input.adapterInput.integrationInput?.targetSummary ??
        input.bridgeResult?.targetSummary,
    ),
    brokerEvidencePresent: Boolean(
      input.bridgeResult?.sourceEvidenceSummary.brokerExecutionResultCandidate ??
        input.adapterInput.originalBridgeInput?.brokerExecutionResultCandidate,
    ),
    idempotencyMetadataPresent: Boolean(input.adapterInput.idempotencyMetadata),
    auditProvenanceMetadataPresent: Boolean(input.adapterInput.auditCorrectionMetadata),
    manualApprovalRequired,
    manualApprovalPresent,
    schemaReadinessPresent:
      input.schemaReadinessSummary.schemaReadinessMetadataPresent,
    allAuthorityFlagsFalse: true,
    canShapeProposedInput:
      input.proposedInputSummary.requiredFieldsPresent &&
      Boolean(input.bridgeResult) &&
      input.bridgeValidation?.status === "bridge_validation_valid",
    blockedReasons: input.blockedReasons,
    warnings: input.warnings,
    reviewItems: input.reviewItems,
  };
}

function decisionForStatus(
  status: ExecutionRecordCandidateBuilderIntegrationAdapterStatus,
): ExecutionRecordCandidateBuilderIntegrationAdapterDecisionRecommendation {
  switch (status) {
    case "adapter_input_ready":
      return "shape_input_only";
    case "adapter_input_needs_review":
      return "needs_manual_review";
    case "adapter_input_unsupported":
      return "unsupported_do_not_shape";
    case "adapter_input_not_ready":
      return "not_ready_do_not_shape";
    case "adapter_input_blocked":
      return "blocked_do_not_shape";
  }
}

function determineStatus(args: {
  blockedReasons: ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason[];
  reviewItems: ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem[];
  statusHints: ExecutionRecordCandidateBuilderIntegrationAdapterStatus[];
}): ExecutionRecordCandidateBuilderIntegrationAdapterStatus {
  if (args.statusHints.includes("adapter_input_unsupported")) {
    return "adapter_input_unsupported";
  }

  if (args.statusHints.includes("adapter_input_not_ready")) {
    return "adapter_input_not_ready";
  }

  const reviewOnlyReasons = new Set<
    ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason
  >([
    "generated_types_absent_or_unknown",
    "migration_application_not_proven",
  ]);
  const hardBlocked = args.blockedReasons.some(
    (reason) => !reviewOnlyReasons.has(reason),
  );

  if (hardBlocked || args.statusHints.includes("adapter_input_blocked")) {
    return "adapter_input_blocked";
  }

  if (
    args.blockedReasons.length > 0 ||
    args.reviewItems.length > 0 ||
    args.statusHints.includes("adapter_input_needs_review")
  ) {
    return "adapter_input_needs_review";
  }

  return "adapter_input_ready";
}

function collectCommonDiagnostics(args: {
  input: ExecutionRecordCandidateBuilderIntegrationAdapterInput;
  bridgeResult: FinalizationToExecutionRecordBridgeResult | null;
  bridgeValidation: ExecutionRecordFinalizationBridgeValidationResult | null;
  proposedInputSummary: ExecutionRecordCandidateBuilderIntegrationAdapterProposedInputSummary;
  schemaReadinessSummary: ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary;
  idempotencySummary: ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary;
  auditProvenanceSummary: ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary;
}): {
  blockedReasons: ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderIntegrationAdapterWarning[];
  reviewItems: ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem[];
  statusHints: ExecutionRecordCandidateBuilderIntegrationAdapterStatus[];
} {
  const blockedReasons: ExecutionRecordCandidateBuilderIntegrationAdapterBlockedReason[] =
    [];
  const warnings = [...BASE_WARNINGS];
  const reviewItems: ExecutionRecordCandidateBuilderIntegrationAdapterReviewItem[] =
    [];
  const statusHints: ExecutionRecordCandidateBuilderIntegrationAdapterStatus[] =
    [];

  if (!args.input.integrationInput) {
    pushUnique(blockedReasons, "missing_integration_input");
    pushUnique(reviewItems, "integration_input_review");
  }

  if (!args.input.integrationResult) {
    pushUnique(blockedReasons, "missing_integration_result");
    pushUnique(reviewItems, "integration_result_review");
  }

  const integrationReview = integrationStatusReview(
    args.input.integrationResult?.status ?? null,
  );
  integrationReview.blockedReasons.forEach((reason) =>
    pushUnique(blockedReasons, reason),
  );
  integrationReview.warnings.forEach((warning) => pushUnique(warnings, warning));
  integrationReview.reviewItems.forEach((item) => pushUnique(reviewItems, item));
  if (integrationReview.statusHint) {
    statusHints.push(integrationReview.statusHint);
  }

  if (!args.bridgeResult) {
    pushUnique(blockedReasons, "missing_bridge_result");
    pushUnique(reviewItems, "bridge_result_review");
  }

  const validationReview = bridgeValidationReview(args.bridgeValidation);
  validationReview.blockedReasons.forEach((reason) =>
    pushUnique(blockedReasons, reason),
  );
  validationReview.warnings.forEach((warning) => pushUnique(warnings, warning));
  validationReview.reviewItems.forEach((item) => pushUnique(reviewItems, item));
  if (validationReview.statusHint) {
    statusHints.push(validationReview.statusHint);
  }

  if (!args.proposedInputSummary.requiredFieldsPresent) {
    pushUnique(blockedReasons, "missing_required_builder_input_field");
    pushUnique(reviewItems, "creation_input_shape_review");
  }

  args.schemaReadinessSummary.blockedReasons.forEach((reason) =>
    pushUnique(blockedReasons, reason),
  );
  args.schemaReadinessSummary.warnings.forEach((warning) =>
    pushUnique(warnings, warning),
  );
  args.schemaReadinessSummary.reviewItems.forEach((item) =>
    pushUnique(reviewItems, item),
  );

  if (!args.idempotencySummary.requiredFingerprintsPresent) {
    pushUnique(blockedReasons, "missing_idempotency_metadata");
    pushUnique(warnings, "idempotency_review_required");
    pushUnique(reviewItems, "idempotency_review");
  }

  if (!args.auditProvenanceSummary.auditMetadataPresent) {
    pushUnique(blockedReasons, "missing_audit_provenance_metadata");
    pushUnique(warnings, "audit_required_before_write");
    pushUnique(reviewItems, "audit_provenance_review");
  }

  if (
    args.auditProvenanceSummary.manualApprovalRequired &&
    !args.auditProvenanceSummary.manualApprovalPresent
  ) {
    pushUnique(blockedReasons, "manual_approval_missing");
    pushUnique(reviewItems, "manual_approval_review");
  }

  return { blockedReasons, warnings, reviewItems, statusHints };
}

export function shapeExecutionRecordCandidateBuilderInput(
  input: ExecutionRecordCandidateBuilderIntegrationAdapterInput,
): ExecutionRecordCandidateBuilderIntegrationAdapterResult {
  const bridgeResult = pickBridgeResult(input);
  const bridgeValidation = pickBridgeValidation(input);
  const proposedCreationInput = pickProposedCreationInput(input, bridgeResult);
  const fieldMappingSummary = buildFieldMappingSummary(
    input,
    bridgeResult,
    proposedCreationInput,
  );
  const proposedInputSummary = buildProposedInputSummary(
    proposedCreationInput,
    fieldMappingSummary,
  );
  const schemaReadinessSummary = buildSchemaReadinessSummary(
    pickSchemaReadiness(input),
  );
  const idempotencySummary = buildIdempotencySummary(
    pickIdempotency(input, bridgeResult),
  );
  const auditProvenanceSummary = buildAuditProvenanceSummary(
    input,
    pickAudit(input, bridgeResult),
    proposedCreationInput,
  );
  const diagnostics = collectCommonDiagnostics({
    input,
    bridgeResult,
    bridgeValidation,
    proposedInputSummary,
    schemaReadinessSummary,
    idempotencySummary,
    auditProvenanceSummary,
  });
  const preconditionSummary = buildPreconditionSummary({
    adapterInput: input,
    bridgeResult,
    bridgeValidation,
    proposedInputSummary,
    schemaReadinessSummary,
    idempotencySummary,
    auditProvenanceSummary,
    blockedReasons: diagnostics.blockedReasons,
    warnings: diagnostics.warnings,
    reviewItems: diagnostics.reviewItems,
  });
  const status = determineStatus(diagnostics);

  return {
    contractVersion:
      EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_CONTRACT_VERSION,
    evaluatedAt: input.requestedAt,
    status,
    decisionRecommendation: decisionForStatus(status),
    input,
    proposedInputSummary,
    fieldMappingSummary,
    preconditionSummary,
    schemaReadinessSummary,
    idempotencySummary,
    auditProvenanceSummary,
    safetyPolicy:
      input.safetyPolicy ??
      EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_DEFAULT_SAFETY_POLICY,
    blockedReasons: diagnostics.blockedReasons,
    warnings: diagnostics.warnings,
    reviewItems: diagnostics.reviewItems,
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
  };
}
