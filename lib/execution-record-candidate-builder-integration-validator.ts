import {
  EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_STATUSES,
  type ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary,
  type ExecutionRecordCandidateBuilderIntegrationAdapterFieldMappingSummary,
  type ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary,
  type ExecutionRecordCandidateBuilderIntegrationAdapterPreconditionSummary,
  type ExecutionRecordCandidateBuilderIntegrationAdapterProposedInputSummary,
  type ExecutionRecordCandidateBuilderIntegrationAdapterResult,
  type ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary,
  type ExecutionRecordCandidateBuilderIntegrationAdapterStatus,
} from "@/lib/execution-record-candidate-builder-integration-adapter-contract";
import {
  EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATION_STATUS_METADATA,
  EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordCandidateBuilderIntegrationAuditProvenanceValidationSummary,
  type ExecutionRecordCandidateBuilderIntegrationFieldMappingValidationSummary,
  type ExecutionRecordCandidateBuilderIntegrationIdempotencyValidationSummary,
  type ExecutionRecordCandidateBuilderIntegrationPreconditionValidationSummary,
  type ExecutionRecordCandidateBuilderIntegrationSafetyPolicyValidationSummary,
  type ExecutionRecordCandidateBuilderIntegrationSchemaReadinessValidationSummary,
  type ExecutionRecordCandidateBuilderIntegrationValidatedProposedInputSummary,
  type ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason,
  type ExecutionRecordCandidateBuilderIntegrationValidationFieldStatus,
  type ExecutionRecordCandidateBuilderIntegrationValidationInput,
  type ExecutionRecordCandidateBuilderIntegrationValidationResult,
  type ExecutionRecordCandidateBuilderIntegrationValidationReviewItem,
  type ExecutionRecordCandidateBuilderIntegrationValidationStatus,
  type ExecutionRecordCandidateBuilderIntegrationValidationWarning,
} from "@/lib/execution-record-candidate-builder-integration-validator-contract";

const BASE_WARNINGS: ExecutionRecordCandidateBuilderIntegrationValidationWarning[] =
  [
    "validation_only",
    "adapter_input_ready_not_builder_invocation_approval",
    "proposed_input_not_execution_record_candidate",
    "candidate_builder_not_called",
    "audit_required_before_write",
    "duplicate_check_required",
    "stats_update_out_of_scope",
    "trade_mutation_out_of_scope",
  ];

const AUTHORITY_FLAG_KEYS = [
    "safeToCallCandidateBuilder",
    "safeToCreateExecutionRecordCandidate",
    "safeToCreateExecutionRecord",
    "safeToPersist",
    "safeToFinalize",
    "safeToUpdateStats",
    "safeToAppendAudit",
    "safeToRollback",
    "safeToMutateTrade",
    "safeToRunBrokerAction",
    "automaticModeAllowed",
    "candidateBuilderInvocationAttempted",
    "executionRecordCandidateCreationAttempted",
    "executionRecordCreationAttempted",
    "persistenceAttempted",
    "finalizationAttempted",
    "statsUpdateAttempted",
    "auditAppendAttempted",
    "rollbackAttempted",
    "tradeMutationAttempted",
    "brokerAutomationAttempted",
    "avanzaAutomationAttempted",
    "browserAutomationAttempted",
];

function pushUnique<T extends string>(items: T[], item: T) {
  if (!items.includes(item)) {
    items.push(item);
  }
}

function hasObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAdapterStatus(
  status: string,
): status is ExecutionRecordCandidateBuilderIntegrationAdapterStatus {
  return EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_STATUSES.includes(
    status as ExecutionRecordCandidateBuilderIntegrationAdapterStatus,
  );
}

function mapAdapterBlockedReason(
  reason: string,
): ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason {
  switch (reason) {
    case "generated_types_absent_or_unknown":
      return "generated_types_absent_or_unknown";
    case "migration_application_not_proven":
      return "migration_application_not_proven";
    case "missing_schema_readiness":
      return "schema_readiness_absent_or_unknown";
    case "missing_idempotency_metadata":
      return "missing_idempotency_summary";
    case "missing_audit_provenance_metadata":
      return "missing_audit_provenance_summary";
    case "manual_approval_missing":
      return "manual_approval_missing";
    case "unsupported_source":
      return "unsupported_source";
    case "unsupported_broker":
      return "unsupported_broker";
    case "candidate_builder_invocation_not_allowed":
      return "candidate_builder_invocation_not_allowed";
    case "safety_policy_authority_violation":
      return "safety_policy_authority_violation";
    case "persistence_boundary_not_enabled":
      return "write_authority_not_allowed";
    case "missing_required_builder_input_field":
      return "missing_required_proposed_input_field";
    default:
      return "invalid_adapter_status";
  }
}

function mapAdapterWarning(
  warning: string,
): ExecutionRecordCandidateBuilderIntegrationValidationWarning | null {
  switch (warning) {
    case "builder_not_called":
    case "candidate_not_created":
      return "candidate_builder_not_called";
    case "generated_types_required_later":
      return "generated_types_required_later";
    case "migration_application_required_later":
      return "migration_application_required_later";
    case "audit_required_before_write":
      return "audit_required_before_write";
    case "idempotency_review_required":
      return "idempotency_review_required";
    case "duplicate_check_required":
      return "duplicate_check_required";
    case "stats_update_out_of_scope":
      return "stats_update_out_of_scope";
    case "trade_mutation_out_of_scope":
      return "trade_mutation_out_of_scope";
    case "proposed_input_only":
    case "contract_only":
    case "adapter_not_implemented":
      return "validation_only";
    default:
      return null;
  }
}

function mapAdapterReviewItem(
  item: string,
): ExecutionRecordCandidateBuilderIntegrationValidationReviewItem | null {
  switch (item) {
    case "integration_input_review":
    case "integration_result_review":
    case "bridge_result_review":
    case "bridge_validation_review":
      return "adapter_result_review";
    case "creation_input_shape_review":
      return "proposed_input_shape_review";
    case "field_mapping_review":
      return "field_mapping_review";
    case "idempotency_review":
      return "idempotency_review";
    case "duplicate_review":
      return "duplicate_review";
    case "audit_provenance_review":
      return "audit_provenance_review";
    case "manual_approval_review":
      return "manual_approval_review";
    case "schema_readiness_review":
      return "schema_readiness_review";
    case "generated_types_review":
      return "generated_types_review";
    case "migration_application_review":
      return "migration_application_review";
    case "safety_policy_review":
      return "safety_policy_review";
    default:
      return null;
  }
}

function collectAuthorityViolations(
  adapterResult: ExecutionRecordCandidateBuilderIntegrationAdapterResult | null,
): string[] {
  const adapterRecord: Record<string, unknown> | null = hasObject(adapterResult)
    ? adapterResult
    : null;
  if (!adapterRecord) {
    return [];
  }

  const policy: Record<string, unknown> | null = hasObject(
    adapterResult?.safetyPolicy,
  )
    ? adapterResult.safetyPolicy
    : null;
  const violations: string[] = [];

  AUTHORITY_FLAG_KEYS.forEach((key) => {
    if (adapterRecord[key] === true) {
      violations.push(String(key));
    }

    if (policy?.[key] === true) {
      violations.push(`safetyPolicy.${String(key)}`);
    }
  });

  return violations;
}

function buildProposedInputValidationSummary(
  sourceSummary:
    | ExecutionRecordCandidateBuilderIntegrationAdapterProposedInputSummary
    | null,
): ExecutionRecordCandidateBuilderIntegrationValidatedProposedInputSummary {
  const missingFields = sourceSummary?.missingRequiredFields ?? [];
  const blockedReasons: ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason[] =
    [];
  const warnings: ExecutionRecordCandidateBuilderIntegrationValidationWarning[] =
    ["proposed_input_not_execution_record_candidate", "candidate_builder_not_called"];
  const reviewItems: ExecutionRecordCandidateBuilderIntegrationValidationReviewItem[] =
    [];

  if (!sourceSummary) {
    blockedReasons.push("adapter_ready_with_missing_proposed_input_summary");
    reviewItems.push("proposed_input_shape_review");
  }

  if (missingFields.length > 0 || sourceSummary?.requiredFieldsPresent === false) {
    blockedReasons.push("missing_required_proposed_input_field");
    reviewItems.push("proposed_input_shape_review");
  }

  return {
    proposedInputOnly: true,
    sourceSummary,
    proposedCreationInput: sourceSummary?.proposedCreationInput ?? null,
    requiredFieldsPresent: sourceSummary?.requiredFieldsPresent ?? false,
    missingRequiredFields: missingFields,
    proposedSourceBrokerExecutionResultPresent: Boolean(
      sourceSummary?.proposedSourceBrokerExecutionResult,
    ),
    proposedInputIsExecutionRecordCandidate: false,
    safeToCallCandidateBuilder: false,
    candidateBuilderCalled: false,
    executionRecordCandidateCreated: false,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function fieldStatus(
  mapping: ExecutionRecordCandidateBuilderIntegrationAdapterFieldMappingSummary,
): ExecutionRecordCandidateBuilderIntegrationValidationFieldStatus {
  if (!mapping.available) {
    return "field_missing";
  }

  if (mapping.requiresReview) {
    return "field_needs_review";
  }

  if (!mapping.mapped) {
    return "field_mismatched";
  }

  return "field_valid";
}

function buildFieldMappingValidationSummary(
  mappings: ExecutionRecordCandidateBuilderIntegrationAdapterFieldMappingSummary[],
): ExecutionRecordCandidateBuilderIntegrationFieldMappingValidationSummary[] {
  return mappings.map((mapping) => {
    const status = fieldStatus(mapping);
    return {
      field: mapping.targetPath,
      status,
      adapterMapping: mapping,
      bridgeMapping: mapping.sourceMapping ?? null,
      bridgeValidationField: mapping.validationFieldSummary ?? null,
      requiredForProposedInput: mapping.requiredForProposedInput,
      available: mapping.available,
      mapped: mapping.mapped,
      requiresReview: mapping.requiresReview,
      blockedReason: null,
      warning: mapping.requiresReview ? "validation_only" : null,
      reviewItem: mapping.requiresReview ? "field_mapping_review" : null,
      sourceValuePreview: mapping.sourceValuePreview,
      targetValuePreview: mapping.targetValuePreview,
      metadata: mapping.metadata,
    };
  });
}

function buildSchemaReadinessValidationSummary(
  sourceSummary:
    | ExecutionRecordCandidateBuilderIntegrationAdapterSchemaReadinessSummary
    | NonNullable<
        ExecutionRecordCandidateBuilderIntegrationValidationInput["schemaReadinessSummary"]
      >
    | null,
): ExecutionRecordCandidateBuilderIntegrationSchemaReadinessValidationSummary {
  const blockedReasons: ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason[] =
    [];
  const warnings: ExecutionRecordCandidateBuilderIntegrationValidationWarning[] =
    [];
  const reviewItems: ExecutionRecordCandidateBuilderIntegrationValidationReviewItem[] =
    [];

  if (!sourceSummary || !sourceSummary.schemaReadinessMetadataPresent) {
    blockedReasons.push("missing_schema_readiness_summary");
    blockedReasons.push("schema_readiness_absent_or_unknown");
    reviewItems.push("schema_readiness_review");
  }

  if (!sourceSummary?.generatedTypesAvailable || !sourceSummary.generatedTypesReviewed) {
    blockedReasons.push("generated_types_absent_or_unknown");
    warnings.push("generated_types_required_later");
    reviewItems.push("generated_types_review");
  }

  if (!sourceSummary?.migrationApplicationProven) {
    blockedReasons.push("migration_application_not_proven");
    warnings.push("migration_application_required_later");
    reviewItems.push("migration_application_review");
  }

  return {
    sourceSummary,
    schemaReadinessMetadataPresent:
      sourceSummary?.schemaReadinessMetadataPresent ?? false,
    generatedTypesAvailable: sourceSummary?.generatedTypesAvailable ?? false,
    generatedTypesReviewed: sourceSummary?.generatedTypesReviewed ?? false,
    generatedTypesLocation: sourceSummary?.generatedTypesLocation ?? null,
    migrationApplicationProven:
      sourceSummary?.migrationApplicationProven ?? false,
    migrationReference: sourceSummary?.migrationReference ?? null,
    executionRecordsTablePresent:
      sourceSummary?.executionRecordsTablePresent ?? null,
    executionRecordsSchemaAlignedWithCreationContract:
      sourceSummary &&
      "executionRecordsSchemaAlignedWithCreationContract" in sourceSummary
        ? sourceSummary.executionRecordsSchemaAlignedWithCreationContract
        : sourceSummary?.executionRecordsSchemaAlignedWithContract ?? false,
    rlsPolicyReviewed: sourceSummary?.rlsPolicyReviewed ?? false,
    persistenceBoundaryEnabled: false,
    insertRouteDryRunOnly: true,
    productionWriteEnabled: false,
    safeToPersist: false,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function buildIdempotencyValidationSummary(
  sourceSummary:
    | ExecutionRecordCandidateBuilderIntegrationAdapterIdempotencySummary
    | NonNullable<
        ExecutionRecordCandidateBuilderIntegrationValidationInput["idempotencySummary"]
      >
    | null,
): ExecutionRecordCandidateBuilderIntegrationIdempotencyValidationSummary {
  const blockedReasons: ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason[] =
    [];
  let blockedReason: ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason | null =
    null;
  let warning: ExecutionRecordCandidateBuilderIntegrationValidationWarning | null =
    null;
  let reviewItem: ExecutionRecordCandidateBuilderIntegrationValidationReviewItem | null =
    null;

  if (!sourceSummary) {
    blockedReason = "missing_idempotency_summary";
  } else if (!sourceSummary.requiredFingerprintsPresent) {
    blockedReason = "missing_required_fingerprint";
  } else if (
    sourceSummary.duplicateDetected ||
    sourceSummary.mismatchRequiresReview
  ) {
    blockedReason = "conflicting_fingerprint";
  } else if (!hasText(sourceSummary.sourceEvidenceFingerprint)) {
    blockedReason = "missing_required_fingerprint";
  }

  if (blockedReason) {
    blockedReasons.push(blockedReason);
    warning = "idempotency_review_required";
    reviewItem = "idempotency_review";
  }

  return {
    sourceSummary,
    intendedExecutionRecordIdempotencyKey:
      sourceSummary?.intendedExecutionRecordIdempotencyKey ?? null,
    intendedExecutionRecordCandidateFingerprint:
      sourceSummary?.intendedExecutionRecordCandidateFingerprint ?? null,
    sourceEvidenceFingerprint: sourceSummary?.sourceEvidenceFingerprint ?? null,
    brokerResultFingerprint:
      sourceSummary && "brokerResultFingerprint" in sourceSummary
        ? sourceSummary.brokerResultFingerprint ?? null
        : null,
    handoffPayloadFingerprint:
      sourceSummary && "handoffPayloadFingerprint" in sourceSummary
        ? sourceSummary.handoffPayloadFingerprint ?? null
        : null,
    finalSettlementNoteMatchIdentity:
      sourceSummary?.finalSettlementNoteMatchIdentity ?? null,
    requiredFingerprintsPresent:
      sourceSummary?.requiredFingerprintsPresent ?? false,
    duplicateCheckRequired: true,
    duplicateDetected: sourceSummary?.duplicateDetected ?? false,
    duplicateOfRecordId: sourceSummary?.duplicateOfRecordId ?? null,
    retrySafe: sourceSummary?.retrySafe ?? false,
    mismatchRequiresReview: sourceSummary?.mismatchRequiresReview ?? true,
    safeForValidationOnly: true,
    safeForProposedInputOnly: true,
    safeForWrite: false,
    blockedReason,
    warning,
    reviewItem,
  };
}

function buildAuditProvenanceValidationSummary(
  sourceSummary:
    | ExecutionRecordCandidateBuilderIntegrationAdapterAuditProvenanceSummary
    | NonNullable<
        ExecutionRecordCandidateBuilderIntegrationValidationInput["auditProvenanceSummary"]
      >
    | null,
): ExecutionRecordCandidateBuilderIntegrationAuditProvenanceValidationSummary {
  let blockedReason: ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason | null =
    null;
  let warning: ExecutionRecordCandidateBuilderIntegrationValidationWarning | null =
    null;
  let reviewItem: ExecutionRecordCandidateBuilderIntegrationValidationReviewItem | null =
    null;

  if (!sourceSummary || !sourceSummary.auditMetadataPresent) {
    blockedReason = "missing_audit_provenance_summary";
  } else if (
    sourceSummary.manualApprovalRequired &&
    !sourceSummary.manualApprovalPresent
  ) {
    blockedReason = "manual_approval_missing";
  }

  if (blockedReason) {
    warning = "audit_required_before_write";
    reviewItem =
      blockedReason === "manual_approval_missing"
        ? "manual_approval_review"
        : "audit_provenance_review";
  }

  return {
    sourceSummary,
    auditRequiredBeforeWrite: true,
    auditMetadataPresent: sourceSummary?.auditMetadataPresent ?? false,
    provenanceMetadataPresent:
      sourceSummary && "provenanceMetadataPresent" in sourceSummary
        ? sourceSummary.provenanceMetadataPresent
        : false,
    correctionMetadataPresent:
      sourceSummary?.correctionMetadataPresent ?? false,
    sourceEvidenceTraceable: sourceSummary?.sourceEvidenceTraceable ?? false,
    manualApprovalRequired: sourceSummary?.manualApprovalRequired ?? true,
    manualApprovalPresent: sourceSummary?.manualApprovalPresent ?? false,
    sourceEventIds:
      sourceSummary && "sourceEventIds" in sourceSummary
        ? sourceSummary.sourceEventIds
        : [],
    handoffSessionId:
      sourceSummary && "handoffSessionId" in sourceSummary
        ? sourceSummary.handoffSessionId ?? null
        : null,
    payloadId:
      sourceSummary && "payloadId" in sourceSummary
        ? sourceSummary.payloadId ?? null
        : null,
    duplicatePreventionReference:
      sourceSummary?.duplicatePreventionReference ?? null,
    correctionStrategyReference:
      sourceSummary?.correctionStrategyReference ?? null,
    rollbackMetadataRequired: sourceSummary?.rollbackMetadataRequired ?? true,
    rollbackMetadataPresent: sourceSummary?.rollbackMetadataPresent ?? false,
    auditAppendAttempted: false,
    rollbackAttempted: false,
    safeForValidationOnly: true,
    safeForProposedInputOnly: true,
    safeForWrite: false,
    blockedReason,
    warning,
    reviewItem,
  };
}

function buildSafetyPolicyValidationSummary(args: {
  adapterResult: ExecutionRecordCandidateBuilderIntegrationAdapterResult | null;
  unexpectedTrueAuthorityFlags: string[];
}): ExecutionRecordCandidateBuilderIntegrationSafetyPolicyValidationSummary {
  const hasViolations = args.unexpectedTrueAuthorityFlags.length > 0;

  return {
    validationOnly: true,
    adapterOutputOnly: true,
    proposedInputOnly: true,
    safetyPolicyPresent: Boolean(args.adapterResult?.safetyPolicy),
    adapterSafetyPolicy: args.adapterResult?.safetyPolicy ?? null,
    allAuthorityFlagsFalse: !hasViolations,
    automaticModeAllowed: false,
    authorityFlags:
      EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_DEFAULT_AUTHORITY_FLAGS,
    unexpectedTrueAuthorityFlags: args.unexpectedTrueAuthorityFlags,
    validatorImplementationEnabled: false,
    candidateBuilderInvocationEnabled: false,
    executionRecordCandidateCreationEnabled: false,
    executionRecordCreationEnabled: false,
    persistenceImplementationEnabled: false,
    finalizationImplementationEnabled: false,
    statsUpdateEnabled: false,
    auditAppendEnabled: false,
    rollbackImplementationEnabled: false,
    tradeMutationEnabled: false,
    brokerAutomationEnabled: false,
    avanzaAutomationEnabled: false,
    browserAutomationEnabled: false,
    blockedReason: hasViolations
      ? "safety_policy_authority_violation"
      : null,
    warning: hasViolations ? "validation_only" : null,
    reviewItem: hasViolations ? "safety_policy_review" : null,
  };
}

function buildPreconditionValidationSummary(args: {
  sourceSummary:
    | ExecutionRecordCandidateBuilderIntegrationAdapterPreconditionSummary
    | null;
  adapterResultPresent: boolean;
  adapterStatusAcceptableForValidation: boolean;
  authorityFlagsFalse: boolean;
}): ExecutionRecordCandidateBuilderIntegrationPreconditionValidationSummary {
  const blockedReasons: ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason[] =
    [];
  const reviewItems: ExecutionRecordCandidateBuilderIntegrationValidationReviewItem[] =
    [];

  if (!args.sourceSummary) {
    blockedReasons.push("missing_precondition_summary");
    reviewItems.push("precondition_review");
  }

  return {
    sourceSummary: args.sourceSummary,
    integrationInputPresent: args.sourceSummary?.integrationInputPresent ?? false,
    integrationResultPresent:
      args.sourceSummary?.integrationResultPresent ?? false,
    integrationResultReadyForShapeReview:
      args.sourceSummary?.integrationResultReadyForShapeReview ?? false,
    adapterResultPresent: args.adapterResultPresent,
    adapterStatusAcceptableForValidation:
      args.adapterStatusAcceptableForValidation,
    bridgeResultPresent: args.sourceSummary?.bridgeResultPresent ?? false,
    bridgeValidationPresent:
      args.sourceSummary?.bridgeValidationPresent ?? false,
    bridgeValidationValid: args.sourceSummary?.bridgeValidationValid ?? false,
    bridgeMapperResultPresent:
      args.sourceSummary?.bridgeMapperResultPresent ?? false,
    finalizationCandidatePresent:
      args.sourceSummary?.finalizationCandidatePresent ?? false,
    sourceEvidenceSummaryPresent:
      args.sourceSummary?.sourceEvidenceSummaryPresent ?? false,
    targetSummaryPresent: args.sourceSummary?.targetSummaryPresent ?? false,
    brokerEvidencePresent: args.sourceSummary?.brokerEvidencePresent ?? false,
    idempotencyMetadataPresent:
      args.sourceSummary?.idempotencyMetadataPresent ?? false,
    auditProvenanceMetadataPresent:
      args.sourceSummary?.auditProvenanceMetadataPresent ?? false,
    manualApprovalRequired:
      args.sourceSummary?.manualApprovalRequired ?? true,
    manualApprovalPresent: args.sourceSummary?.manualApprovalPresent ?? false,
    schemaReadinessPresent:
      args.sourceSummary?.schemaReadinessPresent ?? false,
    allAuthorityFlagsFalse: args.authorityFlagsFalse,
    canValidateAdapterOutput:
      args.adapterResultPresent &&
      args.adapterStatusAcceptableForValidation &&
      args.authorityFlagsFalse,
    safeToCallCandidateBuilder: false,
    safeToCreateExecutionRecordCandidate: false,
    safeToCreateExecutionRecord: false,
    safeToPersist: false,
    blockedReasons,
    warnings: [],
    reviewItems,
  };
}

function decisionForStatus(
  status: ExecutionRecordCandidateBuilderIntegrationValidationStatus,
) {
  return EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATION_STATUS_METADATA[
    status
  ].decisionRecommendation;
}

function determineStatus(args: {
  statusHints: ExecutionRecordCandidateBuilderIntegrationValidationStatus[];
  blockedReasons: ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason[];
  reviewItems: ExecutionRecordCandidateBuilderIntegrationValidationReviewItem[];
}): ExecutionRecordCandidateBuilderIntegrationValidationStatus {
  if (args.statusHints.includes("adapter_validation_invalid")) {
    return "adapter_validation_invalid";
  }

  if (args.statusHints.includes("adapter_validation_unsupported")) {
    return "adapter_validation_unsupported";
  }

  if (args.statusHints.includes("adapter_validation_blocked")) {
    return "adapter_validation_blocked";
  }

  const reviewOnlyReasons = new Set<
    ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason
  >([
    "schema_readiness_absent_or_unknown",
    "migration_application_not_proven",
    "generated_types_absent_or_unknown",
  ]);
  const hardBlocked = args.blockedReasons.some(
    (reason) => !reviewOnlyReasons.has(reason),
  );

  if (hardBlocked) {
    return "adapter_validation_blocked";
  }

  if (
    args.statusHints.includes("adapter_validation_needs_review") ||
    args.blockedReasons.length > 0 ||
    args.reviewItems.length > 0
  ) {
    return "adapter_validation_needs_review";
  }

  return "adapter_validation_valid";
}

export function validateExecutionRecordCandidateBuilderIntegration(
  input: ExecutionRecordCandidateBuilderIntegrationValidationInput,
): ExecutionRecordCandidateBuilderIntegrationValidationResult {
  const adapterResult = input.adapterResult ?? null;
  const adapterStatus = adapterResult?.status ?? null;
  const statusText =
    typeof adapterStatus === "string" ? adapterStatus : String(adapterStatus ?? "");
  const statusHints: ExecutionRecordCandidateBuilderIntegrationValidationStatus[] =
    [];
  const blockedReasons: ExecutionRecordCandidateBuilderIntegrationValidationBlockedReason[] =
    [];
  const warnings = [...BASE_WARNINGS];
  const reviewItems: ExecutionRecordCandidateBuilderIntegrationValidationReviewItem[] =
    [];

  if (!adapterResult) {
    pushUnique(blockedReasons, "missing_adapter_result");
    pushUnique(reviewItems, "adapter_result_review");
    statusHints.push("adapter_validation_blocked");
  } else if (!isAdapterStatus(statusText)) {
    pushUnique(blockedReasons, "invalid_adapter_status");
    pushUnique(reviewItems, "adapter_status_review");
    statusHints.push("adapter_validation_invalid");
  } else {
    switch (statusText) {
      case "adapter_input_unsupported":
        pushUnique(blockedReasons, "unsupported_source");
        pushUnique(reviewItems, "adapter_status_review");
        statusHints.push("adapter_validation_unsupported");
        break;
      case "adapter_input_blocked":
        pushUnique(blockedReasons, "invalid_adapter_status");
        pushUnique(reviewItems, "adapter_status_review");
        statusHints.push("adapter_validation_blocked");
        break;
      case "adapter_input_needs_review":
        pushUnique(reviewItems, "adapter_status_review");
        statusHints.push("adapter_validation_needs_review");
        break;
      case "adapter_input_not_ready":
        pushUnique(blockedReasons, "invalid_adapter_status");
        pushUnique(reviewItems, "adapter_status_review");
        statusHints.push("adapter_validation_blocked");
        break;
      case "adapter_input_ready":
        break;
    }
  }

  adapterResult?.blockedReasons.forEach((reason) => {
    const mapped = mapAdapterBlockedReason(reason);
    pushUnique(blockedReasons, mapped);
    if (adapterResult.status === "adapter_input_ready") {
      pushUnique(blockedReasons, "adapter_ready_with_blocked_reasons");
    }
  });
  adapterResult?.warnings.forEach((warning) => {
    const mapped = mapAdapterWarning(warning);
    if (mapped) {
      pushUnique(warnings, mapped);
    }
  });
  adapterResult?.reviewItems.forEach((item) => {
    const mapped = mapAdapterReviewItem(item);
    if (mapped) {
      pushUnique(reviewItems, mapped);
    }
  });

  const proposedInputSummary =
    input.proposedInputSummary ?? adapterResult?.proposedInputSummary ?? null;
  const fieldMappingSummary =
    input.fieldMappingSummary ?? adapterResult?.fieldMappingSummary ?? [];
  const preconditionSummary =
    input.preconditionSummary ?? adapterResult?.preconditionSummary ?? null;
  const schemaReadinessSummary =
    input.schemaReadinessSummary ?? adapterResult?.schemaReadinessSummary ?? null;
  const idempotencySummary =
    input.idempotencySummary ?? adapterResult?.idempotencySummary ?? null;
  const auditProvenanceSummary =
    input.auditProvenanceSummary ??
    adapterResult?.auditProvenanceSummary ??
    null;
  const authorityViolations = collectAuthorityViolations(adapterResult);

  const proposedInputValidationSummary =
    buildProposedInputValidationSummary(proposedInputSummary);
  const fieldMappingValidationSummary = buildFieldMappingValidationSummary(
    fieldMappingSummary,
  );
  const schemaReadinessValidationSummary =
    buildSchemaReadinessValidationSummary(schemaReadinessSummary);
  const idempotencyValidationSummary =
    buildIdempotencyValidationSummary(idempotencySummary);
  const auditProvenanceValidationSummary =
    buildAuditProvenanceValidationSummary(auditProvenanceSummary);
  const safetyPolicyValidationSummary = buildSafetyPolicyValidationSummary({
    adapterResult,
    unexpectedTrueAuthorityFlags: authorityViolations,
  });
  const preconditionValidationSummary = buildPreconditionValidationSummary({
    sourceSummary: preconditionSummary,
    adapterResultPresent: Boolean(adapterResult),
    adapterStatusAcceptableForValidation:
      adapterResult?.status === "adapter_input_ready",
    authorityFlagsFalse:
      safetyPolicyValidationSummary.allAuthorityFlagsFalse,
  });

  [
    proposedInputValidationSummary,
    schemaReadinessValidationSummary,
    preconditionValidationSummary,
  ].forEach((summary) => {
    summary.blockedReasons.forEach((reason) =>
      pushUnique(blockedReasons, reason),
    );
    summary.warnings.forEach((warning) => pushUnique(warnings, warning));
    summary.reviewItems.forEach((item) => pushUnique(reviewItems, item));
  });

  fieldMappingValidationSummary.forEach((field) => {
    if (field.blockedReason) {
      pushUnique(blockedReasons, field.blockedReason);
    }
    if (field.warning) {
      pushUnique(warnings, field.warning);
    }
    if (field.reviewItem) {
      pushUnique(reviewItems, field.reviewItem);
    }
  });

  if (idempotencyValidationSummary.blockedReason) {
    pushUnique(blockedReasons, idempotencyValidationSummary.blockedReason);
  }
  if (idempotencyValidationSummary.warning) {
    pushUnique(warnings, idempotencyValidationSummary.warning);
  }
  if (idempotencyValidationSummary.reviewItem) {
    pushUnique(reviewItems, idempotencyValidationSummary.reviewItem);
  }

  if (auditProvenanceValidationSummary.blockedReason) {
    pushUnique(blockedReasons, auditProvenanceValidationSummary.blockedReason);
  }
  if (auditProvenanceValidationSummary.warning) {
    pushUnique(warnings, auditProvenanceValidationSummary.warning);
  }
  if (auditProvenanceValidationSummary.reviewItem) {
    pushUnique(reviewItems, auditProvenanceValidationSummary.reviewItem);
  }

  if (safetyPolicyValidationSummary.blockedReason) {
    pushUnique(blockedReasons, safetyPolicyValidationSummary.blockedReason);
    pushUnique(blockedReasons, "candidate_builder_invocation_not_allowed");
    pushUnique(blockedReasons, "write_authority_not_allowed");
    statusHints.push("adapter_validation_invalid");
  }
  if (safetyPolicyValidationSummary.warning) {
    pushUnique(warnings, safetyPolicyValidationSummary.warning);
  }
  if (safetyPolicyValidationSummary.reviewItem) {
    pushUnique(reviewItems, safetyPolicyValidationSummary.reviewItem);
  }

  if (!adapterResult?.fieldMappingSummary) {
    pushUnique(blockedReasons, "missing_field_mapping_summary");
    pushUnique(reviewItems, "field_mapping_review");
  }

  const status = determineStatus({ statusHints, blockedReasons, reviewItems });

  return {
    contractVersion:
      EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATOR_CONTRACT_VERSION,
    evaluatedAt: input.requestedAt,
    status,
    decisionRecommendation: decisionForStatus(status),
    input,
    adapterResult,
    adapterStatus: adapterResult?.status ?? null,
    proposedInputValidationSummary,
    fieldMappingValidationSummary,
    preconditionValidationSummary,
    schemaReadinessValidationSummary,
    idempotencyValidationSummary,
    auditProvenanceValidationSummary,
    safetyPolicyValidationSummary,
    authorityFlags:
      EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_DEFAULT_AUTHORITY_FLAGS,
    blockedReasons,
    warnings,
    reviewItems,
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
  };
}
