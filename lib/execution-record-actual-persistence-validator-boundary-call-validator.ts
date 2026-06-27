import type {
  ActualPersistenceValidatorBoundaryCallInput,
  ActualPersistenceValidatorBoundaryPostCallBoundarySummary,
  ActualPersistenceValidatorBoundaryProposedInputSummary,
  ActualPersistenceValidatorBoundarySourceEvidenceSummary,
} from "@/lib/execution-record-actual-persistence-validator-boundary-call-contract";
import {
  ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATOR_CONTRACT_VERSION,
  ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_DEFAULT_AUTHORITY_FLAGS,
  type ActualPersistenceValidatorBoundaryAuthorityFlags,
  type ActualPersistenceValidatorBoundaryAuditCorrectionValidationSummary,
  type ActualPersistenceValidatorBoundaryCallReadinessSummary,
  type ActualPersistenceValidatorBoundaryCallValidationBlockedReason,
  type ActualPersistenceValidatorBoundaryCallValidationDecisionRecommendation,
  type ActualPersistenceValidatorBoundaryCallValidationInput,
  type ActualPersistenceValidatorBoundaryCallValidationResult,
  type ActualPersistenceValidatorBoundaryCallValidationReviewItem,
  type ActualPersistenceValidatorBoundaryCallValidationStatus,
  type ActualPersistenceValidatorBoundaryCallValidationWarning,
  type ActualPersistenceValidatorBoundaryComposerValidationSummary,
  type ActualPersistenceValidatorBoundaryDryRunRouteValidationSummary,
  type ActualPersistenceValidatorBoundaryIdempotencyDuplicateValidationSummary,
  type ActualPersistenceValidatorBoundaryManualApprovalValidationSummary,
  type ActualPersistenceValidatorBoundaryMigrationValidationSummary,
  type ActualPersistenceValidatorBoundaryPostCallBoundaryValidationSummary,
  type ActualPersistenceValidatorBoundaryProposedInputValidationSummary,
  type ActualPersistenceValidatorBoundarySchemaGeneratedTypesValidationSummary,
  type ActualPersistenceValidatorBoundarySecurityServerOnlyValidationSummary,
} from "@/lib/execution-record-actual-persistence-validator-boundary-call-validator-contract";
import type { ExecutionRecordPersistenceInput } from "@/lib/execution-record-persistence-contract";

type ReasonBuckets = {
  blocked: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
  invalid: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
  unsupported: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
  review: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
};

const BASE_WARNINGS: ActualPersistenceValidatorBoundaryCallValidationWarning[] =
  [
    "actual_validator_not_called",
    "actual_validator_boundary_validation_not_write_approval",
    "may_call_actual_persistence_validator_only_not_insert_approval",
    "may_call_actual_persistence_validator_only_not_record_creation_approval",
    "dry_run_insert_not_production_insert",
    "audit_required_before_write",
    "stats_update_out_of_scope",
    "trade_mutation_out_of_scope",
  ];

function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function hasPositiveNumber(value: number | null | undefined): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function hasAuthorityViolation(value: unknown): boolean {
  if (!isObject(value)) {
    return false;
  }

  const trueForbiddenKeys = [
    "actualPersistenceValidatorCallAttempted",
    "actualValidatorCalled",
    "safeToCallInsertRoute",
    "safeToCreateExecutionRecord",
    "safeToPersist",
    "safeToFinalize",
    "safeToUpdateStats",
    "safeToAppendAudit",
    "safeToRollback",
    "safeToMutateTrade",
    "safeToRunBrokerAction",
    "safeToRunAvanzaBrowserAction",
    "automaticModeAllowed",
    "insertRouteCallAttempted",
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

  return trueForbiddenKeys.some((key) => value[key] === true);
}

function hasTruthyFlag(value: unknown, key: string): boolean {
  return isObject(value) && value[key] === true;
}

function requiredPersistenceInputFields(
  proposedPersistenceInput: ExecutionRecordPersistenceInput | null | undefined,
): (keyof ExecutionRecordPersistenceInput | string)[] {
  if (!proposedPersistenceInput) {
    return ["proposedPersistenceInput"];
  }

  const missing: (keyof ExecutionRecordPersistenceInput | string)[] = [];
  const candidate = proposedPersistenceInput.candidate;

  if (!hasText(proposedPersistenceInput.requestedAt)) missing.push("requestedAt");
  if (!candidate) missing.push("candidate");
  if (!hasText(candidate?.ticker)) missing.push("candidate.ticker");
  if (!hasText(candidate?.side)) missing.push("candidate.side");
  if (!hasPositiveNumber(candidate?.quantity)) missing.push("candidate.quantity");
  if (!hasPositiveNumber(candidate?.price)) missing.push("candidate.price");
  if (!hasText(candidate?.currency)) missing.push("candidate.currency");
  if (!hasText(candidate?.confirmationTimestamp)) {
    missing.push("candidate.confirmationTimestamp");
  }
  if (!hasText(proposedPersistenceInput.idempotencyKey)) {
    missing.push("idempotencyKey");
  }
  if (!hasText(proposedPersistenceInput.recordFingerprint)) {
    missing.push("recordFingerprint");
  }
  if (!hasText(proposedPersistenceInput.sourceFingerprint)) {
    missing.push("sourceFingerprint");
  }
  if (!proposedPersistenceInput.brokerConfirmation) {
    missing.push("brokerConfirmation");
  }
  if (!hasText(proposedPersistenceInput.brokerConfirmation?.confirmedAt)) {
    missing.push("brokerConfirmation.confirmedAt");
  }
  if (!hasText(proposedPersistenceInput.brokerConfirmation?.sourceFingerprint)) {
    missing.push("brokerConfirmation.sourceFingerprint");
  }
  if (!proposedPersistenceInput.association) missing.push("association");
  if (!proposedPersistenceInput.userContext) missing.push("userContext");
  if (!proposedPersistenceInput.safetyChecklist) missing.push("safetyChecklist");
  if (!proposedPersistenceInput.auditMetadata) missing.push("auditMetadata");

  return missing;
}

function sourceEvidencePresent(
  proposedPersistenceInput: ExecutionRecordPersistenceInput | null | undefined,
  sourceEvidenceSummary: ActualPersistenceValidatorBoundarySourceEvidenceSummary | null | undefined,
): boolean {
  return Boolean(
    sourceEvidenceSummary?.sourceEvidencePresent ||
      hasText(proposedPersistenceInput?.sourceFingerprint) &&
        Boolean(proposedPersistenceInput?.auditMetadata?.sourceEventIds.length),
  );
}

function sourceSupported(
  proposedPersistenceInput: ExecutionRecordPersistenceInput | null | undefined,
): boolean {
  const sourceEnvironment = proposedPersistenceInput?.userContext?.sourceEnvironment;
  return !sourceEnvironment || ["development", "test", "staging", "production"].includes(sourceEnvironment);
}

function brokerSupported(
  proposedPersistenceInput: ExecutionRecordPersistenceInput | null | undefined,
): boolean {
  const broker = proposedPersistenceInput?.brokerConfirmation?.broker;
  return !broker || broker === "avanza";
}

function buildReadinessSummary(params: {
  boundaryInput: ActualPersistenceValidatorBoundaryCallInput | null;
  mayCallActualPersistenceValidatorOnly: boolean;
  actualValidatorAlreadyCalledUnexpectedly: boolean;
  blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryCallValidationWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryCallValidationReviewItem[];
}): ActualPersistenceValidatorBoundaryCallReadinessSummary {
  return {
    boundaryInput: params.boundaryInput,
    boundaryInputPresent: Boolean(params.boundaryInput),
    boundaryCallStatus: params.boundaryInput?.composerSummary?.composerReportsNotCalledFutureBoundary
      ? "actual_persistence_validator_not_called_future_boundary"
      : params.boundaryInput
        ? "actual_persistence_validator_call_ready"
        : null,
    mayCallActualPersistenceValidatorOnly:
      params.mayCallActualPersistenceValidatorOnly,
    actualValidatorAlreadyCalledUnexpectedly:
      params.actualValidatorAlreadyCalledUnexpectedly,
    actualValidatorCallAllowedOnly: params.mayCallActualPersistenceValidatorOnly,
    safeToCallInsertRoute: false,
    safeToCreateExecutionRecord: false,
    safeToPersist: false,
    blockedReasons: params.blockedReasons,
    warnings: params.warnings,
    reviewItems: params.reviewItems,
  };
}

function buildComposerSummary(params: {
  boundaryInput: ActualPersistenceValidatorBoundaryCallInput | null;
  blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryCallValidationWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryCallValidationReviewItem[];
}): ActualPersistenceValidatorBoundaryComposerValidationSummary {
  const composerResult = params.boundaryInput?.composerResult ?? null;
  const composerSummary = params.boundaryInput?.composerSummary ?? null;
  const composerReady =
    composerSummary?.composerReady === true ||
    composerResult?.status === "persistence_validator_integration_ready";

  return {
    composerResult,
    composerSummary,
    composerResultPresent: Boolean(composerResult),
    composerReady,
    composerReadinessValidated: composerReady,
    composerReportsNotCalledFutureBoundary:
      composerSummary?.composerReportsNotCalledFutureBoundary === true ||
      composerResult?.actualPersistenceValidatorBoundarySummary.status ===
        "not_called_future_boundary",
    blockedReasons: params.blockedReasons,
    warnings: params.warnings,
    reviewItems: params.reviewItems,
  };
}

function buildProposedInputSummary(params: {
  proposedPersistenceInput: ExecutionRecordPersistenceInput | null;
  proposedInputSummary: ActualPersistenceValidatorBoundaryProposedInputSummary | null;
  missingFields: (keyof ExecutionRecordPersistenceInput | string)[];
  sourceEvidencePresentValue: boolean;
  blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryCallValidationWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryCallValidationReviewItem[];
}): ActualPersistenceValidatorBoundaryProposedInputValidationSummary {
  const candidate = params.proposedPersistenceInput?.candidate;

  return {
    proposedPersistenceInput: params.proposedPersistenceInput,
    proposedInputSummary: params.proposedInputSummary,
    proposedPersistenceInputPresent: Boolean(params.proposedPersistenceInput),
    proposedPersistenceInputComplete: params.missingFields.length === 0,
    requiredPersistenceInputFieldsPresent: params.missingFields.length === 0,
    missingRequiredPersistenceInputFields: params.missingFields,
    recordCandidateIdentityPresent: hasText(candidate?.recordId),
    tickerSymbolPresent: hasText(candidate?.ticker),
    sidePresent: hasText(candidate?.side),
    quantityPresent: hasPositiveNumber(candidate?.quantity),
    pricePresent: hasPositiveNumber(candidate?.price),
    currencyPresent: hasText(candidate?.currency),
    feesCommissionReviewed: true,
    fxReviewed: true,
    grossNetValuesReviewed: true,
    executionTimestampPresent: hasText(candidate?.confirmationTimestamp),
    settlementPaymentDateReviewed: true,
    brokerSourceIdentifiersPresent: Boolean(
      hasText(params.proposedPersistenceInput?.brokerConfirmation?.brokerOrderId) ||
        hasText(params.proposedPersistenceInput?.brokerConfirmation?.brokerConfirmationId) ||
        hasText(params.proposedPersistenceInput?.brokerConfirmation?.brokerResultId),
    ),
    finalNoteReferencePresent: Boolean(
      hasText(params.proposedPersistenceInput?.association?.handoffSessionId) ||
        hasText(params.proposedPersistenceInput?.association?.planningSnapshotId),
    ),
    sourceEvidencePresent: params.sourceEvidencePresentValue,
    idempotencyFingerprintValuesPresent: Boolean(
      hasText(params.proposedPersistenceInput?.idempotencyKey) &&
        hasText(params.proposedPersistenceInput?.recordFingerprint) &&
        hasText(params.proposedPersistenceInput?.sourceFingerprint),
    ),
    auditCorrectionMetadataPresent: Boolean(params.proposedPersistenceInput?.auditMetadata),
    manualApprovalContextPresent: true,
    finalizationMetadataPresent: true,
    safeToPersist: false,
    blockedReasons: params.blockedReasons,
    warnings: params.warnings,
    reviewItems: params.reviewItems,
  };
}

function validationStatus(params: {
  invalidReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
  unsupportedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
  blockedReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
  reviewReasons: ActualPersistenceValidatorBoundaryCallValidationBlockedReason[];
}): ActualPersistenceValidatorBoundaryCallValidationStatus {
  if (params.invalidReasons.length > 0) {
    return "actual_persistence_validator_boundary_validation_invalid";
  }
  if (params.unsupportedReasons.length > 0) {
    return "actual_persistence_validator_boundary_validation_unsupported";
  }
  if (params.blockedReasons.length > 0) {
    return "actual_persistence_validator_boundary_validation_blocked";
  }
  if (params.reviewReasons.length > 0) {
    return "actual_persistence_validator_boundary_validation_needs_review";
  }
  return "actual_persistence_validator_boundary_validation_valid";
}

function decisionRecommendation(
  status: ActualPersistenceValidatorBoundaryCallValidationStatus,
): ActualPersistenceValidatorBoundaryCallValidationDecisionRecommendation {
  switch (status) {
    case "actual_persistence_validator_boundary_validation_valid":
      return "may_call_actual_persistence_validator_only";
    case "actual_persistence_validator_boundary_validation_needs_review":
      return "needs_manual_review";
    case "actual_persistence_validator_boundary_validation_unsupported":
      return "unsupported_do_not_call_actual_persistence_validator";
    case "actual_persistence_validator_boundary_validation_invalid":
      return "invalid_do_not_call_actual_persistence_validator";
    case "actual_persistence_validator_boundary_validation_blocked":
    default:
      return "blocked_do_not_call_actual_persistence_validator";
  }
}

export function validateActualPersistenceValidatorBoundaryCall(
  input: ActualPersistenceValidatorBoundaryCallValidationInput,
): ActualPersistenceValidatorBoundaryCallValidationResult {
  const boundaryInput = input.boundaryInput ?? null;
  const proposedPersistenceInput =
    input.proposedPersistenceInput ?? boundaryInput?.proposedPersistenceInput ?? null;
  const proposedInputSummary =
    input.proposedInputSummary ?? boundaryInput?.proposedInputSummary ?? null;
  const sourceEvidenceSummary =
    input.sourceEvidenceSummary ?? boundaryInput?.sourceEvidenceSummary ?? null;
  const schemaReadinessSummary =
    input.schemaReadinessSummary ?? boundaryInput?.schemaReadinessSummary ?? null;
  const generatedTypesSummary =
    input.generatedTypesSummary ?? boundaryInput?.generatedTypesSummary ?? null;
  const migrationSummary =
    input.migrationSummary ?? boundaryInput?.migrationSummary ?? null;
  const idempotencySummary =
    input.idempotencySummary ?? boundaryInput?.idempotencySummary ?? null;
  const duplicatePreventionSummary = input.duplicatePreventionSummary ?? null;
  const auditCorrectionSummary =
    input.auditCorrectionSummary ?? boundaryInput?.auditCorrectionSummary ?? null;
  const securitySummary =
    input.securitySummary ?? boundaryInput?.securitySummary ?? null;
  const serverOnlySummary =
    input.serverOnlySummary ?? boundaryInput?.serverOnlySummary ?? null;
  const dryRunRouteSummary =
    input.dryRunRouteSummary ?? boundaryInput?.dryRunRouteSummary ?? null;
  const manualApprovalSummary =
    input.manualApprovalSummary ?? boundaryInput?.manualApprovalSummary ?? null;
  const composerResult = input.composerResult ?? boundaryInput?.composerResult ?? null;
  const adapterResult = input.adapterResult ?? boundaryInput?.adapterResult ?? null;
  const integrationValidationResult =
    input.integrationValidationResult ??
    boundaryInput?.integrationValidationResult ??
    null;
  const missingFields = requiredPersistenceInputFields(proposedPersistenceInput);
  const evidencePresent = sourceEvidencePresent(
    proposedPersistenceInput,
    sourceEvidenceSummary,
  );
  const buckets: ReasonBuckets = {
    blocked: [],
    invalid: [],
    unsupported: [],
    review: [],
  };

  if (!boundaryInput) buckets.blocked.push("missing_boundary_input");
  if (!composerResult) buckets.blocked.push("missing_composer_result");
  if (
    composerResult &&
    composerResult.status !== "persistence_validator_integration_ready"
  ) {
    buckets.blocked.push("composer_not_ready");
  }
  if (
    hasTruthyFlag(input.boundaryResult, "actualPersistenceValidatorCalled") ||
    hasTruthyFlag(
      input.boundaryResult?.safetyPolicy,
      "actualPersistenceValidatorCallAttempted",
    ) ||
    hasTruthyFlag(
      boundaryInput?.safetyPolicy,
      "actualPersistenceValidatorCallAttempted",
    )
  ) {
    buckets.invalid.push("actual_validator_already_called_unexpectedly");
  }
  if (!adapterResult || adapterResult.status !== "persistence_adapter_ready") {
    buckets.blocked.push("adapter_not_ready");
  }
  if (
    !integrationValidationResult ||
    integrationValidationResult.status !==
      "persistence_integration_validation_valid"
  ) {
    buckets.blocked.push("integration_validation_not_valid");
  }
  if (!proposedPersistenceInput) {
    buckets.blocked.push("missing_proposed_persistence_input");
  }
  if (missingFields.length > 0) {
    buckets.blocked.push("missing_required_persistence_field");
  }
  if (!evidencePresent) buckets.blocked.push("missing_source_evidence");
  if (
    !schemaReadinessSummary ||
    !schemaReadinessSummary.schemaReadinessKnown ||
    !schemaReadinessSummary.schemaReadyForValidation
  ) {
    buckets.blocked.push("schema_readiness_absent_or_unknown");
  }
  if (
    !generatedTypesSummary ||
    generatedTypesSummary.generatedTypesStatus !== "available" ||
    !generatedTypesSummary.generatedTypesPresent
  ) {
    buckets.blocked.push("generated_types_absent_or_unknown");
  }
  if (
    !migrationSummary ||
    migrationSummary.migrationApplicationStatus !== "proven" ||
    !migrationSummary.migrationApplied
  ) {
    buckets.blocked.push("migration_application_not_proven");
  }
  if (
    !idempotencySummary ||
    !idempotencySummary.idempotencyMetadataPresent ||
    !idempotencySummary.requiredFingerprintsPresent
  ) {
    buckets.blocked.push("missing_idempotency_metadata");
  }
  if (idempotencySummary?.conflictingFingerprintsDetected === true) {
    buckets.invalid.push("conflicting_fingerprint");
  }
  if (
    !duplicatePreventionSummary ||
    !duplicatePreventionSummary.duplicatePreventionMetadataPresent
  ) {
    buckets.blocked.push("missing_duplicate_prevention_metadata");
  }
  if (duplicatePreventionSummary?.conflictingDuplicateRequiresReview === true) {
    buckets.invalid.push("conflicting_fingerprint");
  }
  if (
    !auditCorrectionSummary ||
    !auditCorrectionSummary.auditCorrectionMetadataPresent ||
    !auditCorrectionSummary.sourceEvidenceChainPresent
  ) {
    buckets.blocked.push("missing_audit_correction_metadata");
  }
  if (!securitySummary || !securitySummary.rlsSecurityProofPresent) {
    buckets.blocked.push("missing_rls_security_proof");
  }
  if (!serverOnlySummary || !serverOnlySummary.serverOnlyBoundaryProofPresent) {
    buckets.blocked.push("missing_server_only_boundary");
  }
  if (
    !dryRunRouteSummary ||
    dryRunRouteSummary.dryRunRouteStatus !== "known" ||
    !dryRunRouteSummary.dryRunRouteMetadataPresent
  ) {
    buckets.blocked.push("missing_dry_run_route_status");
  }
  if (
    !manualApprovalSummary ||
    !manualApprovalSummary.manualApprovalMetadataPresent ||
    !manualApprovalSummary.manualApprovalSatisfied
  ) {
    buckets.blocked.push("manual_approval_missing");
  }
  if (hasTruthyFlag(manualApprovalSummary, "automaticModeAllowed")) {
    buckets.invalid.push("automatic_mode_enabled");
  }
  if (hasAuthorityViolation(input.authorityFlags)) {
    buckets.invalid.push("authority_flags_not_false");
  }
  if (!sourceSupported(proposedPersistenceInput)) {
    buckets.unsupported.push("unsupported_source");
  }
  if (!brokerSupported(proposedPersistenceInput)) {
    buckets.unsupported.push("unsupported_broker");
  }

  const blockedReasons = uniqueValues([
    ...buckets.blocked,
    ...buckets.invalid,
    ...buckets.unsupported,
  ]);
  const reviewItems = uniqueValues<ActualPersistenceValidatorBoundaryCallValidationReviewItem>([
    "boundary_input_review",
    "composer_result_review",
    "actual_validator_not_called_boundary_review",
    "adapter_result_review",
    "integration_validation_result_review",
    "proposed_persistence_input_review",
    "required_persistence_field_review",
    "source_evidence_review",
    "fingerprint_review",
    "schema_generated_types_review",
    "migration_application_review",
    "idempotency_duplicate_review",
    "audit_correction_review",
    "security_server_only_review",
    "dry_run_route_review",
    "manual_approval_review",
    "authority_flags_review",
    "post_call_boundary_review",
    "insert_route_boundary_review",
    "production_write_boundary_review",
  ]);
  const warnings = uniqueValues<ActualPersistenceValidatorBoundaryCallValidationWarning>([
    ...BASE_WARNINGS,
    ...(generatedTypesSummary?.generatedTypesStatus === "available"
      ? []
      : ["generated_types_required_before_call" as const]),
    ...(migrationSummary?.migrationApplicationStatus === "proven"
      ? []
      : ["migration_application_required_before_call" as const]),
    ...(securitySummary?.rlsSecurityProofPresent
      ? []
      : ["rls_security_required_before_call" as const]),
    ...(serverOnlySummary?.serverOnlyBoundaryProofPresent
      ? []
      : ["server_only_boundary_required_before_call" as const]),
    ...(duplicatePreventionSummary?.duplicatePreventionMetadataPresent
      ? []
      : ["duplicate_prevention_required_before_call" as const]),
  ]);
  const status = validationStatus({
    invalidReasons: buckets.invalid,
    unsupportedReasons: buckets.unsupported,
    blockedReasons: buckets.blocked,
    reviewReasons: buckets.review,
  });
  const decision = decisionRecommendation(status);
  const mayCallActualPersistenceValidatorOnly =
    status === "actual_persistence_validator_boundary_validation_valid";
  const categoryReasons = {
    blockedReasons,
    warnings,
    reviewItems,
  };
  const authorityFlags: ActualPersistenceValidatorBoundaryAuthorityFlags = {
    ...ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_DEFAULT_AUTHORITY_FLAGS,
    actualPersistenceValidatorCallAllowedOnly: false,
  };
  const readinessSummary = buildReadinessSummary({
    boundaryInput,
    mayCallActualPersistenceValidatorOnly,
    actualValidatorAlreadyCalledUnexpectedly: buckets.invalid.includes(
      "actual_validator_already_called_unexpectedly",
    ),
    ...categoryReasons,
  });
  const composerValidationSummary = buildComposerSummary({
    boundaryInput,
    ...categoryReasons,
  });
  const proposedInputValidationSummary = buildProposedInputSummary({
    proposedPersistenceInput,
    proposedInputSummary,
    missingFields,
    sourceEvidencePresentValue: evidencePresent,
    ...categoryReasons,
  });
  const schemaGeneratedTypesValidationSummary:
    ActualPersistenceValidatorBoundarySchemaGeneratedTypesValidationSummary = {
      schemaReadinessSummary,
      generatedTypesSummary,
      schemaReadinessKnown: schemaReadinessSummary?.schemaReadinessKnown === true,
      schemaSufficientForValidation:
        schemaReadinessSummary?.schemaReadyForValidation === true,
      generatedTypesStatus: generatedTypesSummary?.generatedTypesStatus ?? "unknown",
      generatedTypesPresent: generatedTypesSummary?.generatedTypesPresent === true,
      tableColumnReadinessKnown:
        schemaReadinessSummary?.executionRecordsTablePresent === true,
      nullableRequiredSemanticsReviewed:
        schemaReadinessSummary?.schemaAlignedWithPersistenceInput === true,
      jsonMetadataFieldCompatibilityReviewed:
        schemaReadinessSummary?.schemaAlignedWithPersistenceInput === true,
      runtimeDbWritesAllowed: false,
      ...categoryReasons,
    };
  const migrationValidationSummary:
    ActualPersistenceValidatorBoundaryMigrationValidationSummary = {
      migrationSummary,
      migrationApplicationStatus:
        migrationSummary?.migrationApplicationStatus ?? "unknown",
      migrationApplicationProven:
        migrationSummary?.migrationApplicationStatus === "proven" &&
        migrationSummary.migrationApplied,
      migrationReference: migrationSummary?.migrationReference,
      targetProjectVerified:
        migrationSummary?.migrationVerifiedAgainstTargetProject === true,
      runtimeMigrationApplicationAllowed: false,
      ...categoryReasons,
    };
  const idempotencyDuplicateValidationSummary:
    ActualPersistenceValidatorBoundaryIdempotencyDuplicateValidationSummary = {
      idempotencySummary,
      duplicatePreventionSummary,
      idempotencyMetadataPresent:
        idempotencySummary?.idempotencyMetadataPresent === true,
      requiredFingerprintFieldsPresent:
        idempotencySummary?.requiredFingerprintsPresent === true,
      candidateOutputFingerprintPreserved: hasText(
        idempotencySummary?.candidateFingerprint,
      ),
      finalNoteBrokerReferenceIdentityPresent: Boolean(
        hasText(idempotencySummary?.brokerResultFingerprint) ||
          hasText(proposedPersistenceInput?.brokerConfirmation?.brokerOrderId),
      ),
      conflictingFingerprintDetected:
        idempotencySummary?.conflictingFingerprintsDetected === true,
      duplicatePreventionMetadataPresent:
        duplicatePreventionSummary?.duplicatePreventionMetadataPresent === true,
      duplicateMatches: duplicatePreventionSummary?.duplicateMatches ?? [],
      duplicatePreventionReady:
        duplicatePreventionSummary?.duplicatePreventionMetadataPresent === true,
      safeForWrite: false,
      ...categoryReasons,
    };
  const auditCorrectionValidationSummary:
    ActualPersistenceValidatorBoundaryAuditCorrectionValidationSummary = {
      auditCorrectionSummary,
      sourceEvidenceChainPresent:
        auditCorrectionSummary?.sourceEvidenceChainPresent === true,
      manualApprovalContextPresent:
        manualApprovalSummary?.manualApprovalMetadataPresent === true,
      correctionBeforeAfterValuesRequiredLater: true,
      auditAppendSeparateFutureBoundary: true,
      correctionRollbackSeparateFutureBoundary: true,
      safeToAppendAudit: false,
      safeToRollback: false,
      ...categoryReasons,
    };
  const securityServerOnlyValidationSummary:
    ActualPersistenceValidatorBoundarySecurityServerOnlyValidationSummary = {
      securitySummary,
      serverOnlySummary,
      rlsSecurityProofPresent: securitySummary?.rlsSecurityProofPresent === true,
      rlsSecurityRequiredForActualCall: true,
      serverOnlyBoundaryProofPresent:
        serverOnlySummary?.serverOnlyBoundaryProofPresent === true,
      serverOnlyBoundaryRequiredForActualCall: true,
      clientWriteAccessPrevented:
        serverOnlySummary?.clientWriteAccessPrevented === true,
      safeForWrite: false,
      ...categoryReasons,
    };
  const dryRunRouteValidationSummary:
    ActualPersistenceValidatorBoundaryDryRunRouteValidationSummary = {
      dryRunRouteSummary,
      dryRunRouteStatus: dryRunRouteSummary?.dryRunRouteStatus ?? "unknown",
      dryRunRouteStatusKnown: dryRunRouteSummary?.dryRunRouteStatus === "known",
      dryRunRouteIsProductionInsert: false,
      insertRouteCallSeparateFutureBoundary: true,
      safeToCallInsertRoute: false,
      ...categoryReasons,
    };
  const manualApprovalValidationSummary:
    ActualPersistenceValidatorBoundaryManualApprovalValidationSummary = {
      manualApprovalSummary,
      manualApprovalContext: manualApprovalSummary?.manualApprovalContext ?? null,
      manualApprovalRequired: manualApprovalSummary?.manualApprovalRequired ?? true,
      manualApprovalMetadataPresent:
        manualApprovalSummary?.manualApprovalMetadataPresent === true,
      manualApprovalSatisfied: manualApprovalSummary?.manualApprovalSatisfied === true,
      automaticModeAllowed: false,
      ...categoryReasons,
    };
  const metadataPostCallBoundarySummary = isObject(input.boundaryInput?.metadata)
    ? (input.boundaryInput.metadata.postCallBoundarySummary as
        | ActualPersistenceValidatorBoundaryPostCallBoundarySummary
        | undefined)
    : undefined;
  const postCallBoundarySummary:
    ActualPersistenceValidatorBoundaryPostCallBoundarySummary | null =
      input.boundaryResult?.postCallBoundarySummary ??
      metadataPostCallBoundarySummary ??
      null;
  const postCallBoundaryValidationSummary:
    ActualPersistenceValidatorBoundaryPostCallBoundaryValidationSummary = {
      postCallBoundarySummary,
      noInsertRouteCall: true,
      noExecutionRecordCreation: true,
      noPersistenceWrite: true,
      noSupabaseLocalStorageWrite: true,
      noAuditAppend: true,
      noStatsPnlUpdate: true,
      noRollbackCorrection: true,
      noTradeMutation: true,
      noBrokerOrderBehavior: true,
      noAvanzaBrowserBehavior: true,
      automaticModeDisabled: true,
      separateFutureInsertReadinessBoundaryRequired: true,
      ...categoryReasons,
    };

  return {
    contractVersion:
      ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATOR_CONTRACT_VERSION,
    evaluatedAt: input.requestedAt,
    status,
    decisionRecommendation: decision,
    input,
    readinessSummary,
    composerValidationSummary,
    proposedInputValidationSummary,
    schemaGeneratedTypesValidationSummary,
    migrationValidationSummary,
    idempotencyDuplicateValidationSummary,
    auditCorrectionValidationSummary,
    securityServerOnlyValidationSummary,
    dryRunRouteValidationSummary,
    manualApprovalValidationSummary,
    postCallBoundaryValidationSummary,
    authorityFlags,
    blockedReasons,
    warnings,
    reviewItems,
    validationOnly: true,
    validatorImplemented: false,
    actualValidatorCalled: false,
    safeToCallInsertRoute: false,
    safeToCreateExecutionRecord: false,
    safeToPersist: false,
    safeToFinalize: false,
    safeToUpdateStats: false,
    safeToAppendAudit: false,
    safeToRollback: false,
    safeToMutateTrade: false,
    safeToRunBrokerAction: false,
    safeToRunAvanzaBrowserAction: false,
    automaticModeAllowed: false,
    metadata: {
      callReadinessOnly: true,
      mayCallActualPersistenceValidatorOnly,
      insertRouteApproval: false,
      executionRecordCreationApproval: false,
      persistenceWriteApproval: false,
      auditAppendApproval: false,
      statsUpdateApproval: false,
      rollbackCorrectionApproval: false,
      tradeMutationApproval: false,
      brokerOrderApproval: false,
      avanzaBrowserApproval: false,
    },
  };
}
