import type {
  ExecutionRecordInsertRouteActualValidatorSummary,
  ExecutionRecordInsertRouteAuditCorrectionSummary,
  ExecutionRecordInsertRouteDryRunProductionSeparationSummary,
  ExecutionRecordInsertRouteEvidenceProvenanceSummary,
  ExecutionRecordInsertRouteGeneratedTypesSummary,
  ExecutionRecordInsertRouteIdempotencyDuplicateSummary,
  ExecutionRecordInsertRouteManualApprovalSummary,
  ExecutionRecordInsertRouteMigrationSummary,
  ExecutionRecordInsertRouteNormalizedInputSummary,
  ExecutionRecordInsertRoutePostInsertBoundarySummary,
  ExecutionRecordInsertRouteReadinessInput,
  ExecutionRecordInsertRouteReadinessResult,
  ExecutionRecordInsertRouteRlsSecuritySummary,
  ExecutionRecordInsertRouteSchemaReadinessSummary,
  ExecutionRecordInsertRouteServerOnlyBoundarySummary,
  ExecutionRecordInsertRouteServerOnlyRequestContext,
} from "@/lib/execution-record-insert-route-readiness-boundary-contract";
import {
  EXECUTION_RECORD_INSERT_ROUTE_READINESS_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordInsertRouteReadinessAuthorityFlags,
  type ExecutionRecordInsertRouteReadinessValidationBlockedReason,
  type ExecutionRecordInsertRouteReadinessValidationDecisionRecommendation,
  type ExecutionRecordInsertRouteReadinessValidationInput,
  type ExecutionRecordInsertRouteReadinessValidationResult,
  type ExecutionRecordInsertRouteReadinessValidationReviewItem,
  type ExecutionRecordInsertRouteReadinessValidationStatus,
  type ExecutionRecordInsertRouteReadinessValidationWarning,
} from "@/lib/execution-record-insert-route-readiness-boundary-validator-contract";
import type {
  ExecutionRecordPersistenceInput,
  ExecutionRecordPersistenceResult,
} from "@/lib/execution-record-persistence-contract";

type ReasonBuckets = {
  blocked: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  invalid: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  unsupported: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  review: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
};

const BASE_WARNINGS: ExecutionRecordInsertRouteReadinessValidationWarning[] = [
  "insert_route_not_called",
  "insert_readiness_validation_not_insert_execution",
  "may_prepare_insert_route_call_only_not_insert_execution",
  "dry_run_route_not_production_route",
  "actual_validator_do_not_insert_required",
  "audit_required_before_post_insert_mutation",
  "stats_update_out_of_scope",
  "trade_mutation_out_of_scope",
  "broker_avanza_action_out_of_scope",
];

const ALL_REVIEW_ITEMS: ExecutionRecordInsertRouteReadinessValidationReviewItem[] =
  [
    "readiness_input_review",
    "route_eligibility_review",
    "actual_validator_wrapper_result_review",
    "actual_validator_output_review",
    "normalized_persistence_input_review",
    "required_normalized_field_review",
    "schema_readiness_review",
    "generated_types_review",
    "migration_application_review",
    "rls_security_review",
    "server_only_write_boundary_review",
    "idempotency_fingerprint_review",
    "duplicate_prevention_review",
    "audit_correction_review",
    "evidence_provenance_review",
    "manual_approval_review",
    "dry_run_route_review",
    "production_route_separation_review",
    "authority_flags_review",
    "post_insert_boundary_review",
    "future_insert_route_boundary_review",
  ];

function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function hasPositiveNumber(value: number | null | undefined): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(value: unknown, key: string): boolean {
  return isObject(value) && Object.prototype.hasOwnProperty.call(value, key);
}

function hasTruthyFlag(value: unknown, key: string): boolean {
  return isObject(value) && value[key] === true;
}

function requiredNormalizedFields(
  proposedInput: ExecutionRecordPersistenceInput | null | undefined,
): (keyof ExecutionRecordPersistenceInput | string)[] {
  if (!proposedInput) {
    return ["proposedPersistenceInput"];
  }

  const missing: (keyof ExecutionRecordPersistenceInput | string)[] = [];
  const candidate = proposedInput.candidate;

  if (!hasText(proposedInput.requestedAt)) missing.push("requestedAt");
  if (!candidate) missing.push("candidate");
  if (!hasText(candidate?.recordId)) missing.push("candidate.recordId");
  if (!hasText(candidate?.ticker)) missing.push("candidate.ticker");
  if (!hasText(candidate?.side)) missing.push("candidate.side");
  if (!hasPositiveNumber(candidate?.quantity)) missing.push("candidate.quantity");
  if (!hasPositiveNumber(candidate?.price)) missing.push("candidate.price");
  if (!hasText(candidate?.currency)) missing.push("candidate.currency");
  if (!hasText(candidate?.confirmationTimestamp)) {
    missing.push("candidate.confirmationTimestamp");
  }
  if (!hasText(proposedInput.idempotencyKey)) missing.push("idempotencyKey");
  if (!hasText(proposedInput.recordFingerprint)) {
    missing.push("recordFingerprint");
  }
  if (!hasText(proposedInput.sourceFingerprint)) {
    missing.push("sourceFingerprint");
  }
  if (!proposedInput.brokerConfirmation) missing.push("brokerConfirmation");
  if (!hasText(proposedInput.brokerConfirmation?.confirmedAt)) {
    missing.push("brokerConfirmation.confirmedAt");
  }
  if (!hasText(proposedInput.brokerConfirmation?.sourceFingerprint)) {
    missing.push("brokerConfirmation.sourceFingerprint");
  }
  if (!proposedInput.association) missing.push("association");
  if (!proposedInput.userContext) missing.push("userContext");
  if (!proposedInput.safetyChecklist) missing.push("safetyChecklist");
  if (!proposedInput.auditMetadata) missing.push("auditMetadata");

  return missing;
}

function hasAuthorityViolation(value: unknown): boolean {
  if (!isObject(value)) {
    return false;
  }

  const forbiddenKeys = [
    "safeToCallInsertRoute",
    "safeToCreateExecutionRecord",
    "safeToPersist",
    "safeToFinalize",
    "safeToAppendAudit",
    "safeToUpdateStats",
    "safeToRollback",
    "safeToMutateTrade",
    "safeToRunBrokerAction",
    "safeToRunAvanzaBrowserAction",
    "automaticModeAllowed",
    "insertRouteCallAttempted",
    "executionRecordCreationAttempted",
    "persistenceAttempted",
    "finalizationAttempted",
    "auditAppendAttempted",
    "statsUpdateAttempted",
    "rollbackAttempted",
    "tradeMutationAttempted",
    "brokerAutomationAttempted",
    "avanzaAutomationAttempted",
    "browserAutomationAttempted",
  ];

  return forbiddenKeys.some((key) => value[key] === true);
}

function actualValidatorHasBlockingErrors(
  result: ExecutionRecordPersistenceResult | null | undefined,
): boolean {
  if (!result) {
    return false;
  }

  return (
    result.status !== "eligible" ||
    result.safeToWrite !== true ||
    result.rejectionReasons.length > 0
  );
}

function addReason(
  buckets: ReasonBuckets,
  bucket: keyof ReasonBuckets,
  reason: ExecutionRecordInsertRouteReadinessValidationBlockedReason,
): void {
  buckets[bucket].push(reason);
}

function statusFromBuckets(
  buckets: ReasonBuckets,
): ExecutionRecordInsertRouteReadinessValidationStatus {
  if (buckets.invalid.length > 0) {
    return "insert_route_readiness_validation_invalid";
  }

  if (buckets.unsupported.length > 0) {
    return "insert_route_readiness_validation_unsupported";
  }

  if (buckets.blocked.length > 0) {
    return "insert_route_readiness_validation_blocked";
  }

  if (buckets.review.length > 0) {
    return "insert_route_readiness_validation_needs_review";
  }

  return "insert_route_readiness_validation_ready";
}

function decisionFromStatus(
  status: ExecutionRecordInsertRouteReadinessValidationStatus,
): ExecutionRecordInsertRouteReadinessValidationDecisionRecommendation {
  switch (status) {
    case "insert_route_readiness_validation_ready":
      return "may_prepare_insert_route_call_only";
    case "insert_route_readiness_validation_needs_review":
      return "needs_manual_review";
    case "insert_route_readiness_validation_invalid":
      return "invalid_do_not_call_insert_route";
    case "insert_route_readiness_validation_unsupported":
      return "unsupported_do_not_call_insert_route";
    case "insert_route_readiness_validation_blocked":
    default:
      return "blocked_do_not_call_insert_route";
  }
}

function collectWarnings(
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[],
): ExecutionRecordInsertRouteReadinessValidationWarning[] {
  const warnings: ExecutionRecordInsertRouteReadinessValidationWarning[] = [
    ...BASE_WARNINGS,
  ];

  if (blockedReasons.includes("generated_types_absent_or_unknown")) {
    warnings.push("generated_types_required_before_insert_readiness");
  }
  if (blockedReasons.includes("migration_application_not_proven")) {
    warnings.push("migration_application_required_before_insert_readiness");
  }
  if (blockedReasons.includes("missing_rls_security_proof")) {
    warnings.push("rls_security_required_before_insert_readiness");
  }
  if (blockedReasons.includes("missing_server_only_write_boundary")) {
    warnings.push("server_only_boundary_required_before_insert_readiness");
  }
  if (blockedReasons.includes("missing_duplicate_prevention_metadata")) {
    warnings.push("duplicate_prevention_required_before_insert_readiness");
  }

  return uniqueValues(warnings);
}

function collectReviewItems(
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[],
): ExecutionRecordInsertRouteReadinessValidationReviewItem[] {
  if (blockedReasons.length === 0) {
    return [];
  }

  return ALL_REVIEW_ITEMS;
}

function resolveReadinessInput(
  input: ExecutionRecordInsertRouteReadinessValidationInput | null | undefined,
): ExecutionRecordInsertRouteReadinessInput | null {
  return input?.readinessInput ?? null;
}

function resolveActualValidatorSummary(
  input: ExecutionRecordInsertRouteReadinessValidationInput | null | undefined,
  readinessInput: ExecutionRecordInsertRouteReadinessInput | null,
): ExecutionRecordInsertRouteActualValidatorSummary | null {
  return (
    input?.actualValidatorOutputSummary ??
    readinessInput?.actualValidatorOutputSummary ??
    input?.readinessResult?.actualValidatorSummary ??
    null
  );
}

function resolveNormalizedInput(
  input: ExecutionRecordInsertRouteReadinessValidationInput | null | undefined,
  readinessInput: ExecutionRecordInsertRouteReadinessInput | null,
): ExecutionRecordPersistenceInput | null {
  if (hasOwn(input, "normalizedPersistenceInput")) {
    return input?.normalizedPersistenceInput ?? null;
  }

  if (hasOwn(readinessInput, "proposedNormalizedPersistenceInput")) {
    return readinessInput?.proposedNormalizedPersistenceInput ?? null;
  }

  return (
    input?.normalizedInputSummary?.proposedPersistenceInput ??
    readinessInput?.normalizedInputSummary?.proposedPersistenceInput ??
    input?.readinessResult?.normalizedInputSummary.proposedPersistenceInput ??
    null
  );
}

function resolveSummary<T>(
  direct: T | null | undefined,
  readinessInputValue: T | null | undefined,
  readinessResultValue: T | null | undefined,
): T | null {
  return direct ?? readinessInputValue ?? readinessResultValue ?? null;
}

function buildResult(params: {
  input: ExecutionRecordInsertRouteReadinessValidationInput | null | undefined;
  readinessInput: ExecutionRecordInsertRouteReadinessInput | null;
  readinessResult: ExecutionRecordInsertRouteReadinessResult | null;
  proposedInput: ExecutionRecordPersistenceInput | null;
  actualValidatorSummary: ExecutionRecordInsertRouteActualValidatorSummary | null;
  actualValidatorWrapperResult:
    | NonNullable<
        ExecutionRecordInsertRouteReadinessValidationInput["actualValidatorWrapperResult"]
      >
    | null;
  normalizedInputSummary: ExecutionRecordInsertRouteNormalizedInputSummary | null;
  schemaReadinessSummary: ExecutionRecordInsertRouteSchemaReadinessSummary | null;
  generatedTypesSummary: ExecutionRecordInsertRouteGeneratedTypesSummary | null;
  migrationSummary: ExecutionRecordInsertRouteMigrationSummary | null;
  rlsSecuritySummary: ExecutionRecordInsertRouteRlsSecuritySummary | null;
  serverOnlyBoundarySummary: ExecutionRecordInsertRouteServerOnlyBoundarySummary | null;
  idempotencyDuplicateSummary: ExecutionRecordInsertRouteIdempotencyDuplicateSummary | null;
  auditCorrectionSummary: ExecutionRecordInsertRouteAuditCorrectionSummary | null;
  evidenceProvenanceSummary: ExecutionRecordInsertRouteEvidenceProvenanceSummary | null;
  manualApprovalSummary: ExecutionRecordInsertRouteManualApprovalSummary | null;
  dryRunProductionSeparationSummary: ExecutionRecordInsertRouteDryRunProductionSeparationSummary | null;
  postInsertBoundarySummary: ExecutionRecordInsertRoutePostInsertBoundarySummary | null;
  serverOnlyRequestContext: ExecutionRecordInsertRouteServerOnlyRequestContext | null;
  missingFields: (keyof ExecutionRecordPersistenceInput | string)[];
  blockedReasons: ExecutionRecordInsertRouteReadinessValidationBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessValidationWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessValidationReviewItem[];
  status: ExecutionRecordInsertRouteReadinessValidationStatus;
}): ExecutionRecordInsertRouteReadinessValidationResult {
  const authorityFlags: ExecutionRecordInsertRouteReadinessAuthorityFlags = {
    ...EXECUTION_RECORD_INSERT_ROUTE_READINESS_DEFAULT_AUTHORITY_FLAGS,
  };
  const decisionRecommendation = decisionFromStatus(params.status);
  const actualValidatorOutput =
    params.actualValidatorSummary?.actualValidatorOutput ??
    params.actualValidatorWrapperResult?.validatorOutputSummary
      .actualValidatorResult ??
    null;
  const candidate = params.proposedInput?.candidate;

  return {
    contractVersion:
      params.input?.contractVersion ??
      EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATOR_CONTRACT_VERSION,
    evaluatedAt: params.input?.requestedAt ?? new Date(0).toISOString(),
    status: params.status,
    decisionRecommendation,
    input: params.input ?? null,
    routeEligibilityValidationSummary: {
      sourceSummary: params.readinessResult?.routeEligibilitySummary ?? null,
      routeEligibilityKnown: Boolean(params.readinessInput || params.readinessResult),
      mayPrepareInsertRouteCallOnly:
        params.status === "insert_route_readiness_validation_ready",
      readinessStatus: params.readinessResult?.status ?? null,
      readinessDecision: params.readinessResult?.decisionRecommendation ?? null,
      insertRouteCallAllowed: false,
      insertRouteCallAttempted: false,
      safeToCallInsertRoute: false,
      safeToCreateExecutionRecord: false,
      safeToPersist: false,
      dryRunRouteOnly:
        params.dryRunProductionSeparationSummary?.dryRunRouteAvailable === true,
      productionRouteSeparated:
        params.dryRunProductionSeparationSummary
          ?.productionRouteSeparatedFromDryRun === true,
      blockedReasons: params.blockedReasons,
      warnings: params.warnings,
      reviewItems: params.reviewItems,
    },
    actualValidatorValidationSummary: {
      sourceSummary: params.actualValidatorSummary,
      wrapperResult: params.actualValidatorWrapperResult,
      wrapperResultPresent: Boolean(params.actualValidatorWrapperResult),
      wrapperValidated:
        params.actualValidatorWrapperResult?.status ===
        "actual_persistence_validator_boundary_call_validated",
      wrapperDecisionDoNotInsert:
        params.actualValidatorWrapperResult?.decisionRecommendation ===
        "actual_validator_valid_do_not_insert",
      actualValidatorOutput,
      actualValidatorOutputPresent: Boolean(actualValidatorOutput),
      actualValidatorOutputHasBlockingErrors:
        actualValidatorHasBlockingErrors(actualValidatorOutput),
      actualValidatorWarnings: actualValidatorOutput?.warnings ?? [],
      blockedReasons: params.blockedReasons,
      warnings: params.warnings,
      reviewItems: params.reviewItems,
    },
    normalizedInputValidationSummary: {
      sourceSummary: params.normalizedInputSummary,
      proposedPersistenceInput: params.proposedInput,
      proposedPersistenceInputPresent: Boolean(params.proposedInput),
      proposedPersistenceInputNormalized:
        params.missingFields.length === 0 && Boolean(params.proposedInput),
      requiredNormalizedFieldsPresent: params.missingFields.length === 0,
      missingRequiredNormalizedFields: params.missingFields,
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
        hasText(params.proposedInput?.brokerConfirmation?.brokerOrderId) ||
          hasText(params.proposedInput?.brokerConfirmation?.brokerConfirmationId) ||
          hasText(params.proposedInput?.brokerConfirmation?.brokerResultId),
      ),
      finalNoteReferencePresent: Boolean(
        hasText(params.proposedInput?.association?.handoffSessionId) ||
          hasText(params.proposedInput?.association?.planningSnapshotId),
      ),
      evidenceProvenancePresent:
        params.evidenceProvenanceSummary?.sourceEvidencePresent === true,
      idempotencyFingerprintValuesPresent: Boolean(
        hasText(params.proposedInput?.idempotencyKey) &&
          hasText(params.proposedInput?.recordFingerprint) &&
          hasText(params.proposedInput?.sourceFingerprint),
      ),
      auditCorrectionMetadataPresent: Boolean(params.proposedInput?.auditMetadata),
      manualApprovalContextPresent:
        params.manualApprovalSummary?.manualApprovalMetadataPresent === true,
      finalizationMetadataPresent: Boolean(
        params.proposedInput?.association?.handoffSessionId ||
          params.proposedInput?.association?.planningSnapshotId,
      ),
      blockedReasons: params.blockedReasons,
      warnings: params.warnings,
      reviewItems: params.reviewItems,
    },
    schemaReadinessValidationSummary: {
      sourceSummary: params.schemaReadinessSummary,
      schemaReference: params.schemaReadinessSummary?.schemaReference ?? null,
      schemaReadinessKnown:
        params.schemaReadinessSummary?.schemaReadinessKnown === true,
      schemaReadyForInsertReadiness:
        params.schemaReadinessSummary?.schemaReadyForInsertReadiness === true,
      executionRecordsTableReady:
        params.schemaReadinessSummary?.schemaReadyForInsertReadiness === true,
      requiredColumnsPresent:
        params.schemaReadinessSummary?.schemaReadyForInsertReadiness === true,
      nullableRequiredSemanticsReviewed:
        params.schemaReadinessSummary?.schemaReadinessKnown === true,
      jsonMetadataCompatibilityReviewed:
        params.schemaReadinessSummary?.schemaReadinessKnown === true,
      runtimeDbWritesAllowed: false,
      blockedReasons: params.blockedReasons,
      warnings: params.warnings,
      reviewItems: params.reviewItems,
    },
    generatedTypesValidationSummary: {
      sourceSummary: params.generatedTypesSummary,
      generatedTypesStatus:
        params.generatedTypesSummary?.generatedTypesStatus ?? "unknown",
      generatedTypesPresent:
        params.generatedTypesSummary?.generatedTypesPresent === true,
      executionRecordsTableTyped:
        params.generatedTypesSummary?.executionRecordsTableTyped === true,
      generatedTypesVersion:
        params.generatedTypesSummary?.generatedTypesVersion ?? null,
      blockedReasons: params.blockedReasons,
      warnings: params.warnings,
      reviewItems: params.reviewItems,
    },
    migrationValidationSummary: {
      sourceSummary: params.migrationSummary,
      migrationApplicationStatus:
        params.migrationSummary?.migrationApplicationStatus ?? "unknown",
      migrationApplied: params.migrationSummary?.migrationApplied === true,
      migrationVersion: params.migrationSummary?.migrationVersion ?? null,
      blockedReasons: params.blockedReasons,
      warnings: params.warnings,
      reviewItems: params.reviewItems,
    },
    rlsSecurityValidationSummary: {
      sourceSummary: params.rlsSecuritySummary,
      rlsSecurityProofPresent:
        params.rlsSecuritySummary?.rlsSecurityProofPresent === true,
      rlsPolicyVerified: params.rlsSecuritySummary?.rlsPolicyVerified === true,
      serviceRoleWriteBoundaryVerified:
        params.rlsSecuritySummary?.serviceRoleWriteBoundaryVerified === true,
      userScopedWriteBoundaryVerified:
        params.rlsSecuritySummary?.userScopedWriteBoundaryVerified === true,
      routeAuthSecretRequirementsDocumented:
        params.rlsSecuritySummary?.secretHandlingReviewed === true,
      clientSideInsertCallsAllowed: false,
      blockedReasons: params.blockedReasons,
      warnings: params.warnings,
      reviewItems: params.reviewItems,
    },
    serverOnlyBoundaryValidationSummary: {
      sourceSummary: params.serverOnlyBoundarySummary,
      serverOnlyRequestContext: params.serverOnlyRequestContext,
      serverOnlyBoundaryProofPresent:
        params.serverOnlyBoundarySummary?.serverOnlyBoundaryProofPresent === true,
      serverOnlyRequestContextPresent:
        params.serverOnlyBoundarySummary?.serverOnlyRequestContextPresent ===
          true || params.serverOnlyRequestContext?.isServerOnly === true,
      routeHandlerBoundaryVerified:
        params.serverOnlyBoundarySummary?.routeHandlerBoundaryVerified === true,
      clientWritePathAbsent:
        params.serverOnlyBoundarySummary?.clientWritePathAbsent === true,
      productionRouteReachableFromDevPreview: false,
      browserCallablePathAbsent:
        params.serverOnlyBoundarySummary?.browserCallablePathAbsent === true,
      blockedReasons: params.blockedReasons,
      warnings: params.warnings,
      reviewItems: params.reviewItems,
    },
    idempotencyDuplicateValidationSummary: {
      sourceSummary: params.idempotencyDuplicateSummary,
      idempotencyMetadataPresent:
        params.idempotencyDuplicateSummary?.idempotencyMetadataPresent === true,
      idempotencyKeyPresent:
        params.idempotencyDuplicateSummary?.idempotencyKeyPresent === true ||
        hasText(params.proposedInput?.idempotencyKey),
      recordFingerprintPresent:
        params.idempotencyDuplicateSummary?.recordFingerprintPresent === true ||
        hasText(params.proposedInput?.recordFingerprint),
      sourceFingerprintPresent:
        params.idempotencyDuplicateSummary?.sourceFingerprintPresent === true ||
        hasText(params.proposedInput?.sourceFingerprint),
      brokerResultFingerprintPresent:
        params.idempotencyDuplicateSummary?.brokerResultFingerprintPresent ===
        true,
      duplicatePreventionMetadataPresent:
        params.idempotencyDuplicateSummary
          ?.duplicatePreventionMetadataPresent === true,
      duplicateLookupCompleted:
        params.idempotencyDuplicateSummary?.duplicateLookupCompleted === true,
      duplicateMatches: params.idempotencyDuplicateSummary?.duplicateMatches ?? [],
      duplicateConflictsRequireReview:
        params.idempotencyDuplicateSummary?.duplicateConflictsRequireReview ===
        true,
      missingWeakOrConflictingFingerprints: Boolean(
        params.blockedReasons.includes("missing_idempotency_metadata") ||
          params.idempotencyDuplicateSummary?.duplicateConflictsRequireReview,
      ),
      blockedReasons: params.blockedReasons,
      warnings: params.warnings,
      reviewItems: params.reviewItems,
    },
    auditCorrectionValidationSummary: {
      sourceSummary: params.auditCorrectionSummary,
      auditCorrectionMetadataPresent:
        params.auditCorrectionSummary?.auditCorrectionMetadataPresent === true,
      auditPolicyReviewed:
        params.auditCorrectionSummary?.auditPolicyReviewed === true,
      sourceEvidenceChainPresent:
        params.auditCorrectionSummary?.sourceEvidenceChainPresent === true,
      auditAppendRequiresSeparateBoundary: true,
      correctionRollbackRequiresSeparateBoundary: true,
      blockedReasons: params.blockedReasons,
      warnings: params.warnings,
      reviewItems: params.reviewItems,
    },
    evidenceProvenanceValidationSummary: {
      sourceSummary: params.evidenceProvenanceSummary,
      sourceEvidencePresent:
        params.evidenceProvenanceSummary?.sourceEvidencePresent === true,
      sourceEvidenceIds: params.evidenceProvenanceSummary?.sourceEvidenceIds ?? [],
      provenanceComplete:
        params.evidenceProvenanceSummary?.provenanceComplete === true,
      uiStateAloneAcceptedAsEvidence: false,
      brokerConfirmationEvidencePresent:
        params.evidenceProvenanceSummary?.brokerConfirmationEvidencePresent ===
        true,
      finalizationEvidencePresent:
        params.evidenceProvenanceSummary?.finalizationEvidencePresent === true,
      candidateBuilderEvidencePresent:
        params.evidenceProvenanceSummary?.candidateBuilderEvidencePresent ===
        true,
      persistenceAdapterEvidencePresent:
        params.evidenceProvenanceSummary?.persistenceAdapterEvidencePresent ===
        true,
      blockedReasons: params.blockedReasons,
      warnings: params.warnings,
      reviewItems: params.reviewItems,
    },
    manualApprovalValidationSummary: {
      sourceSummary: params.manualApprovalSummary,
      manualApprovalMetadataPresent:
        params.manualApprovalSummary?.manualApprovalMetadataPresent === true,
      manualApprovalRequired:
        params.manualApprovalSummary?.manualApprovalRequired !== false,
      manualApprovalSatisfied:
        params.manualApprovalSummary?.manualApprovalSatisfied === true,
      manualApprovalContext:
        params.manualApprovalSummary?.manualApprovalContext ?? null,
      automaticModeAllowed: false,
      automaticModeDisabled: true,
      blockedReasons: params.blockedReasons,
      warnings: params.warnings,
      reviewItems: params.reviewItems,
    },
    dryRunProductionSeparationValidationSummary: {
      sourceSummary: params.dryRunProductionSeparationSummary,
      dryRunRouteStatus:
        params.dryRunProductionSeparationSummary?.dryRunRouteStatus ?? "unknown",
      dryRunRouteAvailable:
        params.dryRunProductionSeparationSummary?.dryRunRouteAvailable === true,
      dryRunRouteIsProductionRoute: false,
      dryRunSuccessIsProductionReadiness: false,
      productionRouteStatus:
        params.dryRunProductionSeparationSummary?.productionRouteStatus ??
        "unknown",
      productionRouteSeparatedFromDryRun:
        params.dryRunProductionSeparationSummary
          ?.productionRouteSeparatedFromDryRun === true,
      productionInsertRequiresSeparateBoundary: true,
      insertReadinessCallsDryRunRoute: false,
      insertReadinessCallsProductionRoute: false,
      blockedReasons: params.blockedReasons,
      warnings: params.warnings,
      reviewItems: params.reviewItems,
    },
    postInsertBoundaryValidationSummary: {
      sourceSummary: params.postInsertBoundarySummary,
      auditAppendApproved: false,
      statsPnlUpdateApproved: false,
      rollbackCorrectionApproved: false,
      tradeMutationApproved: false,
      brokerOrderApproved: false,
      avanzaBrowserApproved: false,
      automaticModeApproved: false,
      auditAppendRequiresSeparateBoundary: true,
      statsUpdateRequiresSeparateBoundary: true,
      rollbackCorrectionRequiresSeparateBoundary: true,
      tradeMutationRequiresSeparateBoundary: true,
      reconciliationRequiresSeparateBoundary: true,
      failureRecoveryRequiresSeparateBoundary: true,
      blockedReasons: params.blockedReasons,
      warnings: params.warnings,
      reviewItems: params.reviewItems,
    },
    safetyPolicyValidationSummary: {
      sourceSafetyPolicy: params.readinessResult?.safetyPolicy ?? null,
      authorityFlags,
      validationOnly: true,
      readinessOnly: true,
      mayPrepareInsertRouteCallOnlyIsNotExecution: true,
      noInsertRouteCall: true,
      noExecutionRecordCreation: true,
      noPersistenceWrite: true,
      noAuditAppend: true,
      noStatsPnlUpdate: true,
      noRollbackCorrection: true,
      noTradeMutation: true,
      noBrokerOrderBehavior: true,
      noAvanzaBrowserBehavior: true,
      automaticModeDisabled: true,
      blockedReasons: params.blockedReasons,
      warnings: params.warnings,
      reviewItems: params.reviewItems,
    },
    authorityFlags,
    blockedReasons: params.blockedReasons,
    warnings: params.warnings,
    reviewItems: params.reviewItems,
    metadata: {
      readinessOnly: true,
      mayPrepareInsertRouteCallOnly:
        decisionRecommendation === "may_prepare_insert_route_call_only",
      insertRouteCalled: false,
      executionRecordCreated: false,
      persistenceAttempted: false,
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

export function validateExecutionRecordInsertRouteReadiness(
  input: ExecutionRecordInsertRouteReadinessValidationInput | null | undefined,
): ExecutionRecordInsertRouteReadinessValidationResult {
  const buckets: ReasonBuckets = {
    blocked: [],
    invalid: [],
    unsupported: [],
    review: [],
  };
  const readinessInput = resolveReadinessInput(input);
  const readinessResult = input?.readinessResult ?? null;
  const actualValidatorSummary = resolveActualValidatorSummary(
    input,
    readinessInput,
  );
  const actualValidatorWrapperResult =
    input?.actualValidatorWrapperResult ??
    readinessInput?.actualValidatorWrapperResult ??
    actualValidatorSummary?.wrapperResult ??
    null;
  const proposedInput = resolveNormalizedInput(
    input,
    readinessInput,
  );
  const normalizedInputSummary = resolveSummary(
    input?.normalizedInputSummary,
    readinessInput?.normalizedInputSummary,
    readinessResult?.normalizedInputSummary,
  );
  const schemaReadinessSummary = resolveSummary(
    input?.schemaReadinessSummary,
    readinessInput?.schemaReadinessSummary,
    readinessResult?.schemaReadinessSummary,
  );
  const generatedTypesSummary = resolveSummary(
    input?.generatedTypesSummary,
    readinessInput?.generatedTypesSummary,
    readinessResult?.generatedTypesSummary,
  );
  const migrationSummary = resolveSummary(
    input?.migrationSummary,
    readinessInput?.migrationSummary,
    readinessResult?.migrationSummary,
  );
  const rlsSecuritySummary = resolveSummary(
    input?.rlsSecuritySummary,
    readinessInput?.rlsSecuritySummary,
    readinessResult?.rlsSecuritySummary,
  );
  const serverOnlyBoundarySummary = resolveSummary(
    input?.serverOnlyBoundarySummary,
    readinessInput?.serverOnlyBoundarySummary,
    readinessResult?.serverOnlyBoundarySummary,
  );
  const idempotencyDuplicateSummary = resolveSummary(
    input?.idempotencyDuplicateSummary,
    readinessInput?.idempotencyDuplicateSummary,
    readinessResult?.idempotencyDuplicateSummary,
  );
  const auditCorrectionSummary = resolveSummary(
    input?.auditCorrectionSummary,
    readinessInput?.auditCorrectionSummary,
    readinessResult?.auditCorrectionSummary,
  );
  const evidenceProvenanceSummary = resolveSummary(
    input?.evidenceProvenanceSummary,
    readinessInput?.evidenceProvenanceSummary,
    readinessResult?.evidenceProvenanceSummary,
  );
  const dryRunProductionSeparationSummary = resolveSummary(
    input?.dryRunProductionSeparationSummary,
    readinessInput?.dryRunProductionSeparationSummary,
    readinessResult?.dryRunProductionSeparationSummary,
  );
  const manualApprovalSummary = resolveSummary(
    input?.manualApprovalSummary,
    readinessInput?.manualApprovalSummary,
    readinessResult?.manualApprovalSummary,
  );
  const postInsertBoundarySummary = resolveSummary(
    input?.postInsertBoundarySummary,
    null,
    readinessResult?.postInsertBoundarySummary,
  );
  const serverOnlyRequestContext =
    input?.serverOnlyRequestContext ??
    readinessInput?.serverOnlyRequestContext ??
    null;
  const missingFields = requiredNormalizedFields(proposedInput);

  if (!readinessInput) {
    addReason(buckets, "blocked", "missing_readiness_input");
  }
  if (!actualValidatorWrapperResult) {
    addReason(
      buckets,
      "blocked",
      "missing_actual_validator_wrapper_result",
    );
  } else {
    if (
      actualValidatorWrapperResult.status !==
      "actual_persistence_validator_boundary_call_validated"
    ) {
      addReason(
        buckets,
        "blocked",
        "actual_validator_wrapper_not_validated",
      );
    }
    if (
      actualValidatorWrapperResult.decisionRecommendation !==
      "actual_validator_valid_do_not_insert"
    ) {
      addReason(
        buckets,
        "invalid",
        "actual_validator_decision_not_do_not_insert",
      );
    }
  }
  if (
    actualValidatorHasBlockingErrors(
      actualValidatorSummary?.actualValidatorOutput ??
        actualValidatorWrapperResult?.validatorOutputSummary
          .actualValidatorResult,
    ) ||
    actualValidatorSummary?.actualValidatorOutputHasBlockingErrors === true
  ) {
    addReason(buckets, "invalid", "actual_validator_output_has_errors");
  }
  if (!proposedInput) {
    addReason(buckets, "blocked", "missing_normalized_persistence_input");
  } else if (missingFields.length > 0) {
    addReason(buckets, "invalid", "missing_required_normalized_field");
  }
  if (
    !generatedTypesSummary ||
    generatedTypesSummary.generatedTypesStatus !== "available" ||
    generatedTypesSummary.generatedTypesPresent !== true ||
    generatedTypesSummary.executionRecordsTableTyped !== true
  ) {
    addReason(buckets, "blocked", "generated_types_absent_or_unknown");
  }
  if (
    !migrationSummary ||
    migrationSummary.migrationApplicationStatus !== "proven" ||
    migrationSummary.migrationApplied !== true
  ) {
    addReason(buckets, "blocked", "migration_application_not_proven");
  }
  if (
    !schemaReadinessSummary ||
    schemaReadinessSummary.schemaReadinessKnown !== true ||
    schemaReadinessSummary.schemaReadyForInsertReadiness !== true
  ) {
    addReason(buckets, "blocked", "schema_readiness_absent_or_unknown");
  }
  if (
    !rlsSecuritySummary ||
    rlsSecuritySummary.rlsSecurityProofPresent !== true ||
    rlsSecuritySummary.rlsPolicyVerified !== true
  ) {
    addReason(buckets, "blocked", "missing_rls_security_proof");
  }
  if (
    !serverOnlyBoundarySummary ||
    serverOnlyBoundarySummary.serverOnlyBoundaryProofPresent !== true ||
    serverOnlyBoundarySummary.serverOnlyRequestContextPresent !== true ||
    serverOnlyBoundarySummary.clientWritePathAbsent !== true ||
    serverOnlyRequestContext?.isServerOnly !== true
  ) {
    addReason(buckets, "blocked", "missing_server_only_write_boundary");
  }
  if (
    !idempotencyDuplicateSummary ||
    idempotencyDuplicateSummary.duplicatePreventionMetadataPresent !== true ||
    idempotencyDuplicateSummary.duplicateLookupCompleted !== true
  ) {
    addReason(
      buckets,
      "blocked",
      "missing_duplicate_prevention_metadata",
    );
  }
  if (
    !idempotencyDuplicateSummary ||
    idempotencyDuplicateSummary.idempotencyMetadataPresent !== true ||
    idempotencyDuplicateSummary.idempotencyKeyPresent !== true ||
    idempotencyDuplicateSummary.recordFingerprintPresent !== true ||
    idempotencyDuplicateSummary.sourceFingerprintPresent !== true
  ) {
    addReason(buckets, "blocked", "missing_idempotency_metadata");
  }
  if (
    !auditCorrectionSummary ||
    auditCorrectionSummary.auditCorrectionMetadataPresent !== true ||
    auditCorrectionSummary.auditPolicyReviewed !== true ||
    auditCorrectionSummary.sourceEvidenceChainPresent !== true
  ) {
    addReason(buckets, "blocked", "missing_audit_correction_metadata");
  }
  if (
    !evidenceProvenanceSummary ||
    evidenceProvenanceSummary.sourceEvidencePresent !== true ||
    evidenceProvenanceSummary.provenanceComplete !== true ||
    evidenceProvenanceSummary.sourceEvidenceIds.length === 0
  ) {
    addReason(buckets, "blocked", "missing_source_evidence");
  }
  if (
    !manualApprovalSummary ||
    manualApprovalSummary.manualApprovalMetadataPresent !== true ||
    manualApprovalSummary.manualApprovalSatisfied !== true
  ) {
    addReason(buckets, "blocked", "missing_manual_approval");
  }
  if (
    !dryRunProductionSeparationSummary ||
    dryRunProductionSeparationSummary.dryRunRouteStatus !== "known"
  ) {
    addReason(buckets, "blocked", "missing_dry_run_route_status");
  }
  if (
    !dryRunProductionSeparationSummary ||
    dryRunProductionSeparationSummary.productionRouteSeparatedFromDryRun !==
      true ||
    dryRunProductionSeparationSummary.dryRunRouteIsProductionRoute !== false
  ) {
    addReason(
      buckets,
      "invalid",
      "production_route_not_separated_from_dry_run",
    );
  }
  if (
    hasTruthyFlag(manualApprovalSummary, "automaticModeAllowed") ||
    hasTruthyFlag(input?.readinessResult?.safetyPolicy, "automaticModeAllowed") ||
    hasTruthyFlag(input?.readinessInput?.metadata, "automaticModeAllowed") ||
    hasTruthyFlag(input?.metadata, "automaticModeAllowed")
  ) {
    addReason(buckets, "invalid", "automatic_mode_enabled");
  }
  if (
    hasAuthorityViolation(input?.readinessResult?.safetyPolicy) ||
    hasAuthorityViolation(input?.readinessResult?.routeEligibilitySummary) ||
    hasAuthorityViolation(input?.readinessResult?.postInsertBoundarySummary) ||
    hasAuthorityViolation(input?.readinessInput?.metadata) ||
    hasAuthorityViolation(input?.postInsertBoundarySummary) ||
    hasAuthorityViolation(input?.metadata)
  ) {
    addReason(buckets, "invalid", "write_authority_present");
  }
  if (
    hasTruthyFlag(input?.readinessResult?.postInsertBoundarySummary, "safeToMutateTrade") ||
    hasTruthyFlag(postInsertBoundarySummary, "safeToMutateTrade") ||
    hasTruthyFlag(input?.metadata, "tradeMutationRequested")
  ) {
    addReason(buckets, "invalid", "trade_mutation_requested");
  }
  if (
    hasTruthyFlag(input?.readinessResult?.postInsertBoundarySummary, "safeToRunBrokerAction") ||
    hasTruthyFlag(input?.readinessResult?.postInsertBoundarySummary, "safeToRunAvanzaBrowserAction") ||
    hasTruthyFlag(postInsertBoundarySummary, "safeToRunBrokerAction") ||
    hasTruthyFlag(postInsertBoundarySummary, "safeToRunAvanzaBrowserAction") ||
    hasTruthyFlag(input?.metadata, "brokerAutomationRequested") ||
    hasTruthyFlag(input?.metadata, "avanzaAutomationRequested")
  ) {
    addReason(buckets, "invalid", "broker_or_avanza_action_requested");
  }
  if (
    hasTruthyFlag(input?.readinessResult?.routeEligibilitySummary, "safeToCallInsertRoute")
  ) {
    addReason(buckets, "invalid", "insert_route_call_not_allowed");
  }
  if (
    hasTruthyFlag(
      input?.readinessResult?.routeEligibilitySummary,
      "safeToCreateExecutionRecord",
    )
  ) {
    addReason(buckets, "invalid", "execution_record_creation_not_allowed");
  }

  const blockedReasons = uniqueValues([
    ...buckets.invalid,
    ...buckets.unsupported,
    ...buckets.blocked,
    ...buckets.review,
  ]);
  const warnings = collectWarnings(blockedReasons);
  const reviewItems = collectReviewItems(blockedReasons);
  const status = statusFromBuckets(buckets);

  return buildResult({
    input,
    readinessInput,
    readinessResult,
    proposedInput,
    actualValidatorSummary,
    actualValidatorWrapperResult,
    normalizedInputSummary,
    schemaReadinessSummary,
    generatedTypesSummary,
    migrationSummary,
    rlsSecuritySummary,
    serverOnlyBoundarySummary,
    idempotencyDuplicateSummary,
    auditCorrectionSummary,
    evidenceProvenanceSummary,
    manualApprovalSummary,
    dryRunProductionSeparationSummary,
    postInsertBoundarySummary,
    serverOnlyRequestContext,
    missingFields,
    blockedReasons,
    warnings,
    reviewItems,
    status,
  });
}
