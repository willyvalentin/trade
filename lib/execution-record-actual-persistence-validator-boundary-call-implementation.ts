import {
  ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_CONTRACT_VERSION,
  ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_DEFAULT_POST_CALL_BOUNDARY,
  ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_DEFAULT_SAFETY_POLICY,
  type ActualPersistenceValidatorBoundaryCallImplementationBlockedReason,
  type ActualPersistenceValidatorBoundaryCallImplementationDecisionRecommendation,
  type ActualPersistenceValidatorBoundaryCallImplementationInput,
  type ActualPersistenceValidatorBoundaryCallImplementationResult,
  type ActualPersistenceValidatorBoundaryCallImplementationReviewItem,
  type ActualPersistenceValidatorBoundaryCallImplementationSafetyPolicy,
  type ActualPersistenceValidatorBoundaryCallImplementationStatus,
  type ActualPersistenceValidatorBoundaryCallImplementationWarning,
} from "@/lib/execution-record-actual-persistence-validator-boundary-call-implementation-contract";
import type {
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceInput,
  ExecutionRecordPersistenceResult,
} from "@/lib/execution-record-persistence-contract";

function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requiredPersistenceFieldsPresent(
  input: ExecutionRecordPersistenceInput | null | undefined,
): boolean {
  return Boolean(
    input &&
      hasText(input.requestedAt) &&
      hasText(input.idempotencyKey) &&
      hasText(input.recordFingerprint) &&
      hasText(input.sourceFingerprint) &&
      input.candidate &&
      input.brokerConfirmation &&
      input.association &&
      input.userContext &&
      input.safetyChecklist &&
      input.auditMetadata,
  );
}

function authorityFlagsFalse(
  input: ActualPersistenceValidatorBoundaryCallImplementationInput,
): boolean {
  const flags = input.boundaryCallValidationResult?.authorityFlags;

  if (!flags) {
    return false;
  }

  return (
    flags.validationOnly === true &&
    flags.safeToCallInsertRoute === false &&
    flags.safeToCreateExecutionRecord === false &&
    flags.safeToPersist === false &&
    flags.safeToFinalize === false &&
    flags.safeToAppendAudit === false &&
    flags.safeToUpdateStats === false &&
    flags.safeToRollback === false &&
    flags.safeToMutateTrade === false &&
    flags.safeToRunBrokerAction === false &&
    flags.safeToRunAvanzaBrowserAction === false &&
    flags.automaticModeAllowed === false &&
    flags.actualPersistenceValidatorCallAttempted === false &&
    flags.insertRouteCallAttempted === false &&
    flags.executionRecordCreationAttempted === false &&
    flags.persistenceAttempted === false
  );
}

function duplicateMatches(
  input: ActualPersistenceValidatorBoundaryCallImplementationInput,
): ExecutionRecordDuplicateMatch[] {
  const matches = input.duplicatePreventionSummary?.duplicateMatches;

  return Array.isArray(matches) ? matches : [];
}

function implementationSafetyPolicy(
  actualValidatorCallAttempted: boolean,
): ActualPersistenceValidatorBoundaryCallImplementationSafetyPolicy {
  return {
    ...ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_DEFAULT_SAFETY_POLICY,
    contractOnly: false,
    implementationCreated: true,
    actualPersistenceValidatorCallAttempted: actualValidatorCallAttempted,
    policyReason:
      "Actual persistence validator boundary-call implementation is validation-only. It may call only the explicitly injected actual persistence validator after readiness passes and never authorizes insert routes, execution-record creation, persistence, audit append, stats updates, rollback/correction, trade mutation, broker actions, or Avanza/browser behavior.",
  };
}

function statusFromBlockedReasons(
  blockedReasons: ActualPersistenceValidatorBoundaryCallImplementationBlockedReason[],
): ActualPersistenceValidatorBoundaryCallImplementationStatus {
  if (blockedReasons.length === 0) {
    return "actual_persistence_validator_boundary_call_validated";
  }

  return blockedReasons.some((reason) =>
    [
      "actual_validator_callable_failed",
      "authority_flags_not_false",
      "write_authority_not_allowed",
      "automatic_mode_not_allowed",
      "actual_validator_call_not_allowed",
    ].includes(reason),
  )
    ? "actual_persistence_validator_boundary_call_invalid"
    : "actual_persistence_validator_boundary_call_blocked";
}

function decisionFromStatus(
  status: ActualPersistenceValidatorBoundaryCallImplementationStatus,
): ActualPersistenceValidatorBoundaryCallImplementationDecisionRecommendation {
  switch (status) {
    case "actual_persistence_validator_boundary_call_validated":
      return "actual_validator_valid_do_not_insert";
    case "actual_persistence_validator_boundary_call_needs_review":
      return "needs_manual_review";
    case "actual_persistence_validator_boundary_call_invalid":
      return "invalid_do_not_insert";
    case "actual_persistence_validator_boundary_call_not_called":
      return "not_called";
    case "actual_persistence_validator_boundary_call_blocked":
    default:
      return "blocked_do_not_insert";
  }
}

function buildResult(params: {
  input: ActualPersistenceValidatorBoundaryCallImplementationInput;
  blockedReasons: ActualPersistenceValidatorBoundaryCallImplementationBlockedReason[];
  warnings: ActualPersistenceValidatorBoundaryCallImplementationWarning[];
  reviewItems: ActualPersistenceValidatorBoundaryCallImplementationReviewItem[];
  actualValidatorCalled: boolean;
  actualValidatorResult?: ExecutionRecordPersistenceResult | null;
  validationErrors?: string[];
  metadata?: Record<string, unknown>;
}): ActualPersistenceValidatorBoundaryCallImplementationResult {
  const {
    input,
    actualValidatorCalled,
    actualValidatorResult = null,
    validationErrors = [],
    metadata,
  } = params;
  const blockedReasons = uniqueValues(params.blockedReasons);
  const warnings = uniqueValues(params.warnings);
  const reviewItems = uniqueValues(params.reviewItems);
  const status = statusFromBlockedReasons(blockedReasons);
  const decisionRecommendation = decisionFromStatus(status);
  const proposedPersistenceInput =
    input.proposedPersistenceInput ??
    input.boundaryCallValidationResult?.proposedInputValidationSummary
      .proposedPersistenceInput ??
    null;
  const requiredFieldsPresent = requiredPersistenceFieldsPresent(
    proposedPersistenceInput,
  );
  const safetyPolicy = implementationSafetyPolicy(actualValidatorCalled);
  const manualApprovalRequired =
    input.manualApprovalSummary?.manualApprovalRequired ?? true;
  const manualApprovalSatisfied =
    manualApprovalRequired === false ||
    input.manualApprovalSummary?.manualApprovalSatisfied === true;
  const schemaReadinessKnown =
    input.schemaReadinessSummary?.schemaReadinessKnown === true &&
    input.schemaReadinessSummary.schemaReadyForValidation === true;
  const generatedTypesPresent =
    input.generatedTypesSummary?.generatedTypesStatus === "available" &&
    input.generatedTypesSummary.generatedTypesPresent === true;
  const migrationApplicationProven =
    input.migrationSummary?.migrationApplicationStatus === "proven" &&
    input.migrationSummary.migrationApplied === true;
  const actualValidatorImplemented =
    input.actualPersistenceValidatorCallable?.actualValidatorImplemented ===
      true && typeof input.actualPersistenceValidatorCallableFunction === "function";

  return {
    contractVersion:
      input.contractVersion ??
      ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_CONTRACT_VERSION,
    evaluatedAt: input.requestedAt,
    status,
    decisionRecommendation,
    input,
    preconditionSummary: {
      boundaryCallValidationResultPresent: Boolean(
        input.boundaryCallValidationResult,
      ),
      boundaryCallValidationValid:
        input.boundaryCallValidationResult?.status ===
        "actual_persistence_validator_boundary_validation_valid",
      decisionAllowsActualValidatorOnly:
        input.boundaryCallValidationResult?.decisionRecommendation ===
        "may_call_actual_persistence_validator_only",
      proposedPersistenceInputPresent: Boolean(proposedPersistenceInput),
      actualPersistenceValidatorCallablePresent:
        typeof input.actualPersistenceValidatorCallableFunction === "function" &&
        input.actualPersistenceValidatorCallable?.callablePresent === true,
      generatedTypesPresent,
      migrationApplicationProven,
      schemaReadinessKnown,
      sourceEvidencePresent:
        input.sourceEvidenceSummary?.sourceEvidencePresent === true,
      idempotencyMetadataPresent:
        input.idempotencySummary?.idempotencyMetadataPresent === true &&
        input.idempotencySummary.requiredFingerprintsPresent === true,
      duplicatePreventionMetadataPresent:
        input.duplicatePreventionSummary?.duplicatePreventionMetadataPresent ===
          true &&
        input.duplicatePreventionSummary.duplicateLookupCompleted === true,
      auditCorrectionMetadataPresent:
        input.auditCorrectionSummary?.auditCorrectionMetadataPresent === true &&
        input.auditCorrectionSummary.sourceEvidenceChainPresent === true,
      rlsSecurityProofPresent:
        input.securitySummary?.rlsSecurityProofPresent === true,
      serverOnlyBoundaryPresent:
        input.serverOnlySummary?.serverOnlyBoundaryProofPresent === true,
      dryRunRouteStatusKnown:
        input.dryRunRouteSummary?.dryRunRouteStatus === "known",
      manualApprovalMetadataPresent:
        input.manualApprovalSummary?.manualApprovalMetadataPresent === true &&
        manualApprovalSatisfied,
      authorityFlagsFalse: authorityFlagsFalse(input),
      automaticModeDisabled:
        input.manualApprovalSummary?.automaticModeAllowed === false &&
        input.boundaryCallValidationResult?.authorityFlags
          .automaticModeAllowed === false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    validationInputSummary: {
      boundaryCallValidationInput: input.boundaryCallValidationInput ?? null,
      boundaryCallValidationResult: input.boundaryCallValidationResult ?? null,
      boundaryCallInput:
        input.boundaryCallValidationInput?.boundaryInput ??
        input.boundaryCallValidationResult?.input?.boundaryInput ??
        null,
      boundaryCallValidationInputPresent: Boolean(
        input.boundaryCallValidationInput,
      ),
      boundaryCallValidationResultPresent: Boolean(
        input.boundaryCallValidationResult,
      ),
      boundaryCallValidationStatus:
        input.boundaryCallValidationResult?.status ?? null,
      proposedPersistenceInput,
      proposedInputSummary: input.proposedInputSummary ?? null,
      proposedPersistenceInputPresent: Boolean(proposedPersistenceInput),
      proposedPersistenceInputNormalizedForValidation: requiredFieldsPresent,
      safeToCallInsertRoute: false,
      safeToPersist: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    validatorOutputSummary: {
      actualValidatorResult,
      actualValidatorStatus: actualValidatorResult?.status ?? null,
      actualValidatorCalled,
      actualValidatorImplemented,
      actualValidatorValidatedOnly: true,
      actualValidatorValidDoesNotInsert: true,
      validationErrors,
      blockedReasons,
      warnings,
      reviewItems,
    },
    normalizedInputSummary: {
      proposedPersistenceInput,
      normalizedProposedInput: proposedPersistenceInput,
      normalizedInputPresent: Boolean(proposedPersistenceInput),
      requiredPersistenceFieldsPresent: requiredFieldsPresent,
      candidateIdentityPresent: Boolean(
        proposedPersistenceInput?.candidate &&
          hasText(proposedPersistenceInput.candidate.recordId),
      ),
      brokerConfirmationPresent: Boolean(
        proposedPersistenceInput?.brokerConfirmation &&
          (hasText(proposedPersistenceInput.brokerConfirmation.brokerOrderId) ||
            hasText(
              proposedPersistenceInput.brokerConfirmation.brokerConfirmationId,
            )),
      ),
      userContextPresent: Boolean(
        proposedPersistenceInput?.userContext &&
          (hasText(proposedPersistenceInput.userContext.userId) ||
            hasText(proposedPersistenceInput.userContext.accountId)),
      ),
      safetyChecklistPresent: hasObject(proposedPersistenceInput?.safetyChecklist),
      auditMetadataPresent: hasObject(proposedPersistenceInput?.auditMetadata),
      noWriteFieldsMutated: true,
      safeToPersist: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    schemaValidationSummary: {
      schemaReadinessSummary: input.schemaReadinessSummary ?? null,
      generatedTypesSummary: input.generatedTypesSummary ?? null,
      schemaReference: proposedPersistenceInput?.schemaReference ?? null,
      schemaReadinessKnown,
      schemaSufficientForActualValidator: schemaReadinessKnown,
      generatedTypesStatus:
        input.generatedTypesSummary?.generatedTypesStatus ?? "unknown",
      generatedTypesPresent,
      migrationSummary: input.migrationSummary ?? null,
      migrationApplicationStatus:
        input.migrationSummary?.migrationApplicationStatus ?? "unknown",
      migrationApplicationProven,
      runtimeDbWritesAllowed: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    idempotencyDuplicateSummary: {
      idempotencySummary: input.idempotencySummary ?? null,
      duplicatePreventionSummary: input.duplicatePreventionSummary ?? null,
      idempotencyMetadataPresent:
        input.idempotencySummary?.idempotencyMetadataPresent === true,
      requiredFingerprintFieldsPresent:
        input.idempotencySummary?.requiredFingerprintsPresent === true,
      duplicatePreventionMetadataPresent:
        input.duplicatePreventionSummary?.duplicatePreventionMetadataPresent ===
        true,
      duplicateLookupCompleted:
        input.duplicatePreventionSummary?.duplicateLookupCompleted === true,
      duplicateDetected:
        input.duplicatePreventionSummary?.duplicateDetected === true,
      conflictingDuplicateRequiresReview:
        input.duplicatePreventionSummary?.conflictingDuplicateRequiresReview ===
        true,
      duplicateMatches: duplicateMatches(input),
      safeForWrite: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    auditCorrectionSummary: {
      auditCorrectionSummary: input.auditCorrectionSummary ?? null,
      auditCorrectionMetadataPresent:
        input.auditCorrectionSummary?.auditCorrectionMetadataPresent === true,
      sourceEvidenceSummary: input.sourceEvidenceSummary ?? null,
      sourceEvidencePresent:
        input.sourceEvidenceSummary?.sourceEvidencePresent === true,
      provenanceChainPresent:
        input.auditCorrectionSummary?.sourceEvidenceChainPresent === true,
      manualApprovalContext: input.manualApprovalContext ?? null,
      manualApprovalContextPresent: Boolean(input.manualApprovalContext),
      auditAppendSeparateFutureBoundary: true,
      correctionRollbackSeparateFutureBoundary: true,
      safeToAppendAudit: false,
      safeToRollback: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    securitySummary: {
      securitySummary: input.securitySummary ?? null,
      serverOnlySummary: input.serverOnlySummary ?? null,
      rlsSecurityProofPresent:
        input.securitySummary?.rlsSecurityProofPresent === true,
      rlsSecurityRequiredForActualValidatorCall: true,
      serverOnlyBoundaryPresent:
        input.serverOnlySummary?.serverOnlyBoundaryProofPresent === true,
      serverOnlyBoundaryRequiredForActualValidatorCall: true,
      clientWriteAccessPrevented:
        input.serverOnlySummary?.clientWriteAccessPrevented === true,
      safeForWrite: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    dryRunManualApprovalSummary: {
      dryRunRouteSummary: input.dryRunRouteSummary ?? null,
      dryRunRouteStatus: input.dryRunRouteSummary?.dryRunRouteStatus ?? "unknown",
      dryRunRouteStatusKnown:
        input.dryRunRouteSummary?.dryRunRouteStatus === "known",
      dryRunRouteIsProductionInsert: false,
      manualApprovalSummary: input.manualApprovalSummary ?? null,
      manualApprovalContext: input.manualApprovalContext ?? null,
      manualApprovalMetadataPresent:
        input.manualApprovalSummary?.manualApprovalMetadataPresent === true,
      manualApprovalRequired,
      manualApprovalSatisfied,
      automaticModeAllowed: false,
      safeToCallInsertRoute: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    postCallBoundarySummary: {
      ...ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_IMPLEMENTATION_DEFAULT_POST_CALL_BOUNDARY,
      warnings: warnings.length > 0 ? warnings : [
        "actual_validator_valid_not_insert_approval",
        "actual_validator_valid_not_record_creation_approval",
        "actual_validator_valid_not_persistence_approval",
      ],
      blockedReasons,
      reviewItems,
    },
    safetyPolicy,
    blockedReasons,
    warnings,
    reviewItems,
    contractOnly: false,
    implementationCreated: true,
    validationOnly: true,
    actualValidatorCalled,
    safeToCallActualPersistenceValidator: false,
    safeToCallInsertRoute: false,
    safeToCreateExecutionRecord: false,
    safeToPersist: false,
    safeToFinalize: false,
    safeToAppendAudit: false,
    safeToUpdateStats: false,
    safeToRollback: false,
    safeToMutateTrade: false,
    safeToRunBrokerAction: false,
    safeToRunAvanzaBrowserAction: false,
    automaticModeAllowed: false,
    metadata,
  };
}

function preconditionBlockedReasons(
  input: ActualPersistenceValidatorBoundaryCallImplementationInput,
): ActualPersistenceValidatorBoundaryCallImplementationBlockedReason[] {
  const boundaryResult = input.boundaryCallValidationResult;
  const callableMetadata = input.actualPersistenceValidatorCallable;
  const manualApprovalRequired =
    input.manualApprovalSummary?.manualApprovalRequired ?? true;

  return uniqueValues([
    ...(!boundaryResult
      ? ["missing_boundary_call_validation_result" as const]
      : []),
    ...(boundaryResult &&
    boundaryResult.status !==
      "actual_persistence_validator_boundary_validation_valid"
      ? ["boundary_call_validation_not_valid" as const]
      : []),
    ...(boundaryResult &&
    boundaryResult.decisionRecommendation !==
      "may_call_actual_persistence_validator_only"
      ? ["actual_validator_call_not_allowed" as const]
      : []),
    ...(!input.proposedPersistenceInput
      ? ["missing_proposed_persistence_input" as const]
      : []),
    ...(!callableMetadata?.callablePresent ||
    callableMetadata.actualValidatorImplemented !== true ||
    callableMetadata.actualValidatorCallAllowed !== true ||
    typeof input.actualPersistenceValidatorCallableFunction !== "function"
      ? ["missing_actual_persistence_validator_callable" as const]
      : []),
    ...(callableMetadata &&
    (callableMetadata.validatesOnly !== true ||
      callableMetadata.safeToCallInsertRoute !== false ||
      callableMetadata.safeToPersist !== false)
      ? ["actual_validator_call_not_allowed" as const]
      : []),
    ...(input.generatedTypesSummary?.generatedTypesStatus !== "available" ||
    input.generatedTypesSummary.generatedTypesPresent !== true
      ? ["generated_types_absent_or_unknown" as const]
      : []),
    ...(input.migrationSummary?.migrationApplicationStatus !== "proven" ||
    input.migrationSummary.migrationApplied !== true
      ? ["migration_application_not_proven" as const]
      : []),
    ...(input.schemaReadinessSummary?.schemaReadinessKnown !== true ||
    input.schemaReadinessSummary.schemaReadyForValidation !== true
      ? ["schema_readiness_absent_or_unknown" as const]
      : []),
    ...(input.sourceEvidenceSummary?.sourceEvidencePresent !== true
      ? ["missing_source_evidence" as const]
      : []),
    ...(input.idempotencySummary?.idempotencyMetadataPresent !== true ||
    input.idempotencySummary.requiredFingerprintsPresent !== true
      ? ["missing_idempotency_metadata" as const]
      : []),
    ...(input.duplicatePreventionSummary?.duplicatePreventionMetadataPresent !==
      true ||
    input.duplicatePreventionSummary.duplicateLookupCompleted !== true
      ? ["missing_duplicate_prevention_metadata" as const]
      : []),
    ...(input.auditCorrectionSummary?.auditCorrectionMetadataPresent !== true ||
    input.auditCorrectionSummary.sourceEvidenceChainPresent !== true
      ? ["missing_audit_correction_metadata" as const]
      : []),
    ...(input.securitySummary?.rlsSecurityProofPresent !== true
      ? ["missing_rls_security_proof" as const]
      : []),
    ...(input.serverOnlySummary?.serverOnlyBoundaryProofPresent !== true
      ? ["missing_server_only_boundary" as const]
      : []),
    ...(input.dryRunRouteSummary?.dryRunRouteStatus !== "known"
      ? ["missing_dry_run_route_status" as const]
      : []),
    ...(input.manualApprovalSummary?.manualApprovalMetadataPresent !== true ||
    (manualApprovalRequired &&
      input.manualApprovalSummary.manualApprovalSatisfied !== true)
      ? ["manual_approval_missing" as const]
      : []),
    ...(!authorityFlagsFalse(input)
      ? ["authority_flags_not_false" as const]
      : []),
    ...(input.manualApprovalSummary?.automaticModeAllowed !== false ||
    input.boundaryCallValidationResult?.authorityFlags.automaticModeAllowed !==
      false
      ? ["automatic_mode_not_allowed" as const]
      : []),
  ]);
}

export function callActualPersistenceValidatorBoundary(
  input: ActualPersistenceValidatorBoundaryCallImplementationInput,
): ActualPersistenceValidatorBoundaryCallImplementationResult {
  const blockedReasons = preconditionBlockedReasons(input);
  const baseReviewItems: ActualPersistenceValidatorBoundaryCallImplementationReviewItem[] =
    [
      "boundary_call_validation_review",
      "actual_validator_callable_review",
      "proposed_persistence_input_review",
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
    ];

  if (blockedReasons.length > 0) {
    return buildResult({
      input,
      blockedReasons,
      warnings: [
        "actual_validator_not_called",
        "actual_validator_valid_not_insert_approval",
        "actual_validator_valid_not_record_creation_approval",
        "actual_validator_valid_not_persistence_approval",
        "actual_validator_valid_not_audit_approval",
        "actual_validator_valid_not_stats_approval",
        "actual_validator_valid_not_trade_mutation_approval",
      ],
      reviewItems: baseReviewItems,
      actualValidatorCalled: false,
    });
  }

  const proposedPersistenceInput = input.proposedPersistenceInput!;
  const callable = input.actualPersistenceValidatorCallableFunction!;

  try {
    const actualValidatorResult = callable(proposedPersistenceInput);
    const validatorOutputValid =
      actualValidatorResult.status === "eligible" &&
      actualValidatorResult.safeToWrite === true;

    return buildResult({
      input,
      actualValidatorResult,
      blockedReasons: validatorOutputValid
        ? []
        : ["actual_validator_call_not_allowed"],
      warnings: [
        "actual_validator_valid_not_insert_approval",
        "actual_validator_valid_not_record_creation_approval",
        "actual_validator_valid_not_persistence_approval",
        "actual_validator_valid_not_audit_approval",
        "actual_validator_valid_not_stats_approval",
        "actual_validator_valid_not_trade_mutation_approval",
        "dry_run_insert_not_production_insert",
        "stats_update_out_of_scope",
        "trade_mutation_out_of_scope",
      ],
      reviewItems: baseReviewItems,
      actualValidatorCalled: true,
      validationErrors: validatorOutputValid
        ? []
        : [
            `actual persistence validator returned ${actualValidatorResult.status}`,
          ],
      metadata: {
        actualValidatorOutputSafeToWrite: actualValidatorResult.safeToWrite,
        actualValidatorOutputDoesNotAuthorizeInsert: true,
        actualValidatorOutputDoesNotAuthorizePersistence: true,
      },
    });
  } catch (error) {
    return buildResult({
      input,
      blockedReasons: ["actual_validator_callable_failed"],
      warnings: [
        "actual_validator_valid_not_insert_approval",
        "actual_validator_valid_not_record_creation_approval",
        "actual_validator_valid_not_persistence_approval",
        "actual_validator_valid_not_audit_approval",
        "actual_validator_valid_not_stats_approval",
        "actual_validator_valid_not_trade_mutation_approval",
      ],
      reviewItems: [...baseReviewItems, "validator_output_review"],
      actualValidatorCalled: true,
      validationErrors: [
        error instanceof Error ? error.message : "actual validator threw",
      ],
      metadata: {
        actualValidatorCallableThrew: true,
      },
    });
  }
}
