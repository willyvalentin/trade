import {
  EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_CONTRACT_VERSION,
  EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_DEFAULT_SAFETY_POLICY,
  type ExecutionRecordPersistenceValidatorAdapterAuditCorrectionSummary,
  type ExecutionRecordPersistenceValidatorAdapterDryRunRouteSummary,
  type ExecutionRecordPersistenceValidatorAdapterFieldMappingSummary,
  type ExecutionRecordPersistenceValidatorAdapterIdempotencySummary,
  type ExecutionRecordPersistenceValidatorAdapterPreconditionSummary,
  type ExecutionRecordPersistenceValidatorAdapterProposedInputSummary,
  type ExecutionRecordPersistenceValidatorAdapterSchemaReadinessSummary,
  type ExecutionRecordPersistenceValidatorAdapterSecuritySummary,
  type ExecutionRecordPersistenceValidatorIntegrationAdapterBlockedReason,
  type ExecutionRecordPersistenceValidatorIntegrationAdapterDecisionRecommendation,
  type ExecutionRecordPersistenceValidatorIntegrationAdapterInput,
  type ExecutionRecordPersistenceValidatorIntegrationAdapterResult,
  type ExecutionRecordPersistenceValidatorIntegrationAdapterReviewItem,
  type ExecutionRecordPersistenceValidatorIntegrationAdapterStatus,
  type ExecutionRecordPersistenceValidatorIntegrationAdapterWarning,
} from "@/lib/execution-record-persistence-validator-integration-adapter-contract";
import type {
  ExecutionRecordPersistenceInput,
} from "@/lib/execution-record-persistence-contract";

type CandidateOutputSummaryLike = {
  candidateOutputOnly?: boolean;
};

function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getBooleanProperty(value: unknown, key: string): boolean | null {
  if (!isObject(value)) {
    return null;
  }

  const property = value[key];

  return typeof property === "boolean" ? property : null;
}

function getStringProperty(value: unknown, key: string): string | null {
  if (!isObject(value)) {
    return null;
  }

  const property = value[key];

  return typeof property === "string" ? property : null;
}

function getCandidateOutputOnly(
  input: ExecutionRecordPersistenceValidatorIntegrationAdapterInput,
): boolean {
  const summary = input.candidateBuilderOutputSummary;
  const summaryCandidateOnly =
    isObject(summary) &&
    (summary as CandidateOutputSummaryLike).candidateOutputOnly === true;

  return input.invocationResult?.outputSummary.candidateOutputOnly === true ||
    summaryCandidateOnly;
}

function getCandidate(
  input: ExecutionRecordPersistenceValidatorIntegrationAdapterInput,
): ExecutionRecordPersistenceInput["candidate"] | null {
  return (
    input.candidateOutput ??
    input.proposedPersistenceInput?.candidate ??
    input.invocationResult?.outputSummary.candidateOutput ??
    null
  );
}

function getMissingRequiredPersistenceInputFields(
  proposedInput: ExecutionRecordPersistenceInput | null | undefined,
): (keyof ExecutionRecordPersistenceInput | string)[] {
  const missing: (keyof ExecutionRecordPersistenceInput | string)[] = [];

  if (!proposedInput) {
    return [
      "contractVersion",
      "requestedAt",
      "candidate",
      "idempotencyKey",
      "recordFingerprint",
      "sourceFingerprint",
      "brokerConfirmation",
      "association",
      "userContext",
      "safetyChecklist",
      "auditMetadata",
    ];
  }

  if (!hasText(proposedInput.contractVersion)) missing.push("contractVersion");
  if (!hasText(proposedInput.requestedAt)) missing.push("requestedAt");
  if (!proposedInput.candidate) missing.push("candidate");
  if (!hasText(proposedInput.idempotencyKey)) missing.push("idempotencyKey");
  if (!hasText(proposedInput.recordFingerprint)) missing.push("recordFingerprint");
  if (!hasText(proposedInput.sourceFingerprint)) missing.push("sourceFingerprint");
  if (!proposedInput.brokerConfirmation) missing.push("brokerConfirmation");
  if (!proposedInput.association) missing.push("association");
  if (!proposedInput.userContext) missing.push("userContext");
  if (!proposedInput.safetyChecklist) missing.push("safetyChecklist");
  if (!proposedInput.auditMetadata) missing.push("auditMetadata");

  return missing;
}

function resolveStatus(
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationAdapterBlockedReason[],
): ExecutionRecordPersistenceValidatorIntegrationAdapterStatus {
  if (blockedReasons.includes("unsupported_source") || blockedReasons.includes("unsupported_broker")) {
    return "persistence_adapter_unsupported";
  }

  if (
    blockedReasons.includes("missing_persistence_integration_input") ||
    blockedReasons.includes("missing_persistence_integration_result") ||
    blockedReasons.includes("missing_candidate_builder_output")
  ) {
    return "persistence_adapter_blocked";
  }

  if (blockedReasons.length > 0) {
    return "persistence_adapter_needs_review";
  }

  return "persistence_adapter_ready";
}

function resolveDecision(
  status: ExecutionRecordPersistenceValidatorIntegrationAdapterStatus,
): ExecutionRecordPersistenceValidatorIntegrationAdapterDecisionRecommendation {
  if (status === "persistence_adapter_ready") {
    return "shape_persistence_input_only";
  }

  if (status === "persistence_adapter_needs_review") {
    return "needs_manual_review";
  }

  if (status === "persistence_adapter_unsupported") {
    return "unsupported_do_not_validate_persistence";
  }

  if (status === "persistence_adapter_not_ready") {
    return "not_ready_do_not_validate_persistence";
  }

  return "blocked_do_not_validate_persistence";
}

export function shapeExecutionRecordPersistenceValidatorInput(
  input: ExecutionRecordPersistenceValidatorIntegrationAdapterInput,
): ExecutionRecordPersistenceValidatorIntegrationAdapterResult {
  const proposedInput = input.proposedPersistenceInput ?? null;
  const candidate = getCandidate(input);
  const candidateOutputOnly = getCandidateOutputOnly(input);
  const missingRequiredFields =
    getMissingRequiredPersistenceInputFields(proposedInput);

  const idempotencyKey =
    input.idempotencySummary?.idempotencyKey ??
    proposedInput?.idempotencyKey ??
    candidate?.idempotencyKey ??
    null;
  const recordFingerprint =
    input.idempotencySummary?.recordFingerprint ??
    proposedInput?.recordFingerprint ??
    candidate?.recordFingerprint ??
    null;
  const sourceFingerprint =
    input.idempotencySummary?.sourceFingerprint ??
    proposedInput?.sourceFingerprint ??
    candidate?.sourceEvidenceFingerprint ??
    null;
  const brokerResultFingerprint =
    input.idempotencySummary?.brokerResultFingerprint ??
    proposedInput?.auditMetadata.brokerResultFingerprint ??
    candidate?.brokerResultFingerprint ??
    null;

  const idempotencyMetadataPresent =
    input.idempotencySummary?.idempotencyMetadataPresent ??
    (hasText(idempotencyKey) &&
      hasText(recordFingerprint) &&
      hasText(sourceFingerprint));
  const requiredFingerprintsPresent =
    input.idempotencySummary?.requiredFingerprintsPresent ??
    (hasText(idempotencyKey) &&
      hasText(recordFingerprint) &&
      hasText(sourceFingerprint));
  const duplicatePreventionPresent =
    input.idempotencySummary?.duplicatePreventionPresent === true;

  const auditMetadata = proposedInput?.auditMetadata ?? null;
  const auditProvenanceMetadataPresent =
    input.auditCorrectionSummary?.auditProvenanceMetadataPresent ??
    auditMetadata !== null;
  const sourceEvidenceChainPresent =
    input.auditCorrectionSummary?.sourceEvidenceChainPresent ??
    (auditMetadata?.sourceEventIds.length ?? 0) > 0;
  const manualApprovalPresent =
    input.auditCorrectionSummary?.manualApprovalMetadataPresent === true ||
    input.manualApprovalContext !== null &&
      input.manualApprovalContext !== undefined;

  const schemaReadinessAcknowledged =
    input.schemaReadinessSummary?.schemaReadinessAcknowledged === true;
  const generatedTypesStatusAcknowledged =
    input.schemaReadinessSummary?.generatedTypesStatusAcknowledged === true;
  const generatedTypesAvailable =
    input.schemaReadinessSummary?.generatedTypesAvailable === true;
  const generatedTypesReviewed =
    input.schemaReadinessSummary?.generatedTypesReviewed === true;
  const migrationApplicationStatusAcknowledged =
    getBooleanProperty(
      input.schemaReadinessSummary,
      "migrationApplicationStatusAcknowledged",
    ) === true ||
    input.schemaReadinessSummary?.migrationApplicationProven === true;
  const migrationApplicationProven =
    input.schemaReadinessSummary?.migrationApplicationProven === true;

  const rlsSecurityProofPresent =
    input.securitySummary?.rlsSecurityProofPresent === true;
  const serverOnlyWriteBoundaryPresent =
    input.securitySummary?.serverOnlyWriteBoundaryPresent === true;
  const dryRunRouteStatusAcknowledged =
    getBooleanProperty(
      input.dryRunRouteSummary,
      "dryRunRouteStatusAcknowledged",
    ) === true ||
    input.dryRunRouteSummary?.dryRunRouteKnown === true;

  const blockedReasons: ExecutionRecordPersistenceValidatorIntegrationAdapterBlockedReason[] =
    [];

  if (!input.persistenceIntegrationInput) {
    blockedReasons.push("missing_persistence_integration_input");
  }

  if (!input.persistenceIntegrationResult) {
    blockedReasons.push("missing_persistence_integration_result");
  } else if (
    input.persistenceIntegrationResult.status !== "persistence_validation_ready"
  ) {
    blockedReasons.push("integration_not_ready");
  }

  if (!input.invocationResult) {
    blockedReasons.push("missing_candidate_builder_output");
  }

  if (!candidate) {
    blockedReasons.push("missing_candidate_builder_output");
  }

  if (!candidateOutputOnly) {
    blockedReasons.push("candidate_output_not_candidate_only");
  }

  if (!proposedInput) {
    blockedReasons.push("missing_execution_record_persistence_contract");
  }

  if (missingRequiredFields.length > 0) {
    blockedReasons.push("missing_required_persistence_input_field");
  }

  if (!idempotencyMetadataPresent || !requiredFingerprintsPresent) {
    blockedReasons.push("missing_idempotency_metadata");
  }

  if (!auditProvenanceMetadataPresent || !sourceEvidenceChainPresent) {
    blockedReasons.push("missing_audit_correction_metadata");
  }

  if (!schemaReadinessAcknowledged) {
    blockedReasons.push("missing_schema_readiness");
  }

  if (
    !generatedTypesStatusAcknowledged ||
    !generatedTypesAvailable ||
    !generatedTypesReviewed
  ) {
    blockedReasons.push("generated_types_absent_or_unknown");
  }

  if (!migrationApplicationStatusAcknowledged || !migrationApplicationProven) {
    blockedReasons.push("migration_application_not_proven");
  }

  if (!rlsSecurityProofPresent) {
    blockedReasons.push("missing_rls_security_proof");
  }

  if (!serverOnlyWriteBoundaryPresent) {
    blockedReasons.push("missing_server_only_write_boundary");
  }

  if (!dryRunRouteStatusAcknowledged) {
    blockedReasons.push("missing_dry_run_route_status");
  }

  if (!duplicatePreventionPresent) {
    blockedReasons.push("missing_duplicate_prevention");
  }

  if (!manualApprovalPresent) {
    blockedReasons.push("manual_approval_missing");
  }

  if (
    getBooleanProperty(input.safetyPolicy, "safeToCallPersistenceValidator") ===
      true ||
    getBooleanProperty(input.safetyPolicy, "safeToCallInsertRoute") === true ||
    getBooleanProperty(input.safetyPolicy, "safeToCreateExecutionRecord") ===
      true ||
    getBooleanProperty(input.safetyPolicy, "safeToPersist") === true
  ) {
    blockedReasons.push("safety_policy_authority_violation");
  }

  const uniqueBlockedReasons = uniqueValues(blockedReasons);
  const warnings = uniqueValues<ExecutionRecordPersistenceValidatorIntegrationAdapterWarning>([
    "proposed_persistence_input_only",
    "persistence_validator_not_called",
    "insert_route_not_called",
    ...(generatedTypesAvailable && generatedTypesReviewed
      ? []
      : ["generated_types_required_later" as const]),
    ...(migrationApplicationProven
      ? []
      : ["migration_application_required_later" as const]),
    ...(rlsSecurityProofPresent ? [] : ["rls_security_required_later" as const]),
    ...(serverOnlyWriteBoundaryPresent
      ? []
      : ["server_only_write_boundary_required_later" as const]),
    ...(auditProvenanceMetadataPresent
      ? []
      : ["audit_required_before_write" as const]),
    ...(idempotencyMetadataPresent
      ? []
      : ["idempotency_review_required" as const]),
    ...(duplicatePreventionPresent
      ? []
      : ["duplicate_check_required" as const]),
    "stats_update_out_of_scope",
    "trade_mutation_out_of_scope",
  ]);
  const reviewItems = uniqueValues<ExecutionRecordPersistenceValidatorIntegrationAdapterReviewItem>([
    "proposed_persistence_input_review",
    "field_mapping_review",
    "precondition_review",
    "schema_readiness_review",
    "idempotency_review",
    "audit_correction_review",
    "rls_security_review",
    "dry_run_route_review",
    "safety_policy_review",
    ...(manualApprovalPresent ? [] : ["manual_approval_review" as const]),
    ...(duplicatePreventionPresent
      ? []
      : ["duplicate_prevention_review" as const]),
    "production_write_boundary_review",
  ]);

  const status = resolveStatus(uniqueBlockedReasons);
  const decisionRecommendation = resolveDecision(status);
  const proposedPersistenceInputComplete =
    proposedInput !== null && missingRequiredFields.length === 0;

  const proposedInputSummary: ExecutionRecordPersistenceValidatorAdapterProposedInputSummary =
    {
      proposedPersistenceInput: proposedInput,
      proposedPersistenceInputPresent: proposedInput !== null,
      proposedPersistenceInputComplete,
      proposedPersistenceInputIsReviewOnly: true,
      persistenceContractVersionKnown: hasText(proposedInput?.contractVersion),
      requestedAtPresent: hasText(proposedInput?.requestedAt),
      candidatePresent: proposedInput?.candidate !== undefined,
      brokerConfirmationPresent: proposedInput?.brokerConfirmation !== undefined,
      associationPresent: proposedInput?.association !== undefined,
      userContextPresent: proposedInput?.userContext !== undefined,
      safetyChecklistPresent: proposedInput?.safetyChecklist !== undefined,
      auditMetadataPresent: proposedInput?.auditMetadata !== undefined,
      schemaReferencePresent: proposedInput?.schemaReference !== undefined,
      duplicateMatches: proposedInput?.duplicateMatches,
      missingRequiredPersistenceInputFields: missingRequiredFields,
      safeToCallPersistenceValidator: false,
      safeToCallInsertRoute: false,
      safeToCreateExecutionRecord: false,
      safeToPersist: false,
      blockedReasons: uniqueBlockedReasons,
      warnings,
      reviewItems,
    };

  const fieldMappingSummary: ExecutionRecordPersistenceValidatorAdapterFieldMappingSummary =
    {
      candidateBuilderOutput: candidate,
      invocationResult: input.invocationResult ?? null,
      invocationOutputSummary: input.invocationResult?.outputSummary ?? null,
      candidateIdMapped: hasText(candidate?.recordId),
      candidateFingerprintMapped: hasText(candidate?.recordFingerprint),
      sourceEvidenceChainMapped: sourceEvidenceChainPresent,
      brokerFinalizationMetadataMapped:
        proposedInput?.brokerConfirmation !== undefined,
      executionValuesMapped:
        candidate !== null &&
        hasText(candidate.ticker) &&
        typeof candidate.quantity === "number" &&
        typeof candidate.price === "number",
      quantityPriceCurrencyFeesFxMapped:
        candidate !== null &&
        typeof candidate.quantity === "number" &&
        typeof candidate.price === "number" &&
        hasText(candidate.currency),
      settlementAndFinalNoteFieldsMapped: candidate !== null,
      idempotencyKeysMapped: requiredFingerprintsPresent,
      auditProvenanceFieldsMapped: auditProvenanceMetadataPresent,
      manualApprovalFieldsMapped: manualApprovalPresent,
      schemaTypeReadinessFieldsMapped: schemaReadinessAcknowledged,
      dryRunRouteMetadataMapped: dryRunRouteStatusAcknowledged,
      brokerConfirmation: proposedInput?.brokerConfirmation ?? null,
      persistenceSafetyChecklist: proposedInput?.safetyChecklist ?? null,
      unmappedRequiredFields: missingRequiredFields,
      mappingWarnings: warnings,
      blockedReasons: uniqueBlockedReasons,
      reviewItems,
    };

  const preconditionSummary: ExecutionRecordPersistenceValidatorAdapterPreconditionSummary =
    {
      persistenceIntegrationInputPresent: input.persistenceIntegrationInput !== undefined &&
        input.persistenceIntegrationInput !== null,
      persistenceIntegrationResultPresent:
        input.persistenceIntegrationResult !== undefined &&
        input.persistenceIntegrationResult !== null,
      persistenceIntegrationReady:
        input.persistenceIntegrationResult?.status ===
        "persistence_validation_ready",
      candidateBuilderInvocationResultPresent: input.invocationResult !== undefined &&
        input.invocationResult !== null,
      candidateBuilderOutputPresent: candidate !== null,
      candidateOutputOnly,
      executionRecordCandidatePresent: candidate !== null,
      idempotencyMetadataPresent,
      recordFingerprintPresent: hasText(recordFingerprint),
      sourceFingerprintPresent: hasText(sourceFingerprint),
      auditCorrectionMetadataPresent: auditProvenanceMetadataPresent,
      schemaReadinessAcknowledged,
      generatedTypesStatusAcknowledged,
      migrationApplicationStatusAcknowledged,
      rlsSecurityStatusAcknowledged: rlsSecurityProofPresent,
      serverOnlyWriteBoundaryStatusAcknowledged: serverOnlyWriteBoundaryPresent,
      dryRunRouteStatusAcknowledged,
      duplicatePreventionStatusAcknowledged: duplicatePreventionPresent,
      manualApprovalRequired: true,
      manualApprovalPresent,
      noWriteAuthorityRequested: uniqueBlockedReasons.includes(
        "safety_policy_authority_violation",
      ) === false,
      allAuthorityFlagsFalse: uniqueBlockedReasons.includes(
        "safety_policy_authority_violation",
      ) === false,
      canShapeProposedPersistenceInput:
        proposedPersistenceInputComplete &&
        candidate !== null &&
        candidateOutputOnly,
      safeToCallPersistenceValidator: false,
      safeToCallInsertRoute: false,
      safeToPersist: false,
      blockedReasons: uniqueBlockedReasons,
      warnings,
      reviewItems,
    };

  const schemaReadinessSummary: ExecutionRecordPersistenceValidatorAdapterSchemaReadinessSummary =
    {
      integrationSchemaReadinessSummary:
        input.schemaReadinessSummary &&
        "schemaReadinessAcknowledged" in input.schemaReadinessSummary
          ? null
          : input.schemaReadinessSummary ?? null,
      schemaReference: proposedInput?.schemaReference ?? null,
      schemaReadinessAcknowledged,
      executionRecordsTableExpected: true,
      executionRecordsTablePresent:
        input.schemaReadinessSummary?.executionRecordsTablePresent ?? null,
      generatedTypesStatusAcknowledged,
      generatedTypesAvailable,
      generatedTypesReviewed,
      generatedTypesLocation:
        input.schemaReadinessSummary?.generatedTypesLocation ?? null,
      migrationApplicationStatusAcknowledged,
      migrationApplicationProven,
      migrationReference:
        getStringProperty(input.schemaReadinessSummary, "migrationReference") ??
        null,
      schemaAlignedWithPersistenceContract:
        getBooleanProperty(
          input.schemaReadinessSummary,
          "schemaAlignedWithPersistenceContract",
        ) === true ||
        getBooleanProperty(
          input.schemaReadinessSummary,
          "schemaAlignedWithPersistenceInput",
        ) === true,
      schemaAlignedWithProposedInput:
        getBooleanProperty(
          input.schemaReadinessSummary,
          "schemaAlignedWithProposedInput",
        ) === true ||
        getBooleanProperty(
          input.schemaReadinessSummary,
          "schemaAlignedWithPersistenceInput",
        ) === true,
      productionWriteReadinessBlockedBySchema:
        !generatedTypesAvailable ||
        !generatedTypesReviewed ||
        !migrationApplicationProven,
      blockedReasons: uniqueBlockedReasons.filter((reason) =>
        [
          "missing_schema_readiness",
          "generated_types_absent_or_unknown",
          "migration_application_not_proven",
        ].includes(reason),
      ),
      warnings,
      reviewItems,
    };

  const idempotencySummary: ExecutionRecordPersistenceValidatorAdapterIdempotencySummary =
    {
      integrationIdempotencySummary:
        input.idempotencySummary &&
        "safeForProposedInputShaping" in input.idempotencySummary
          ? null
          : input.idempotencySummary ?? null,
      idempotencyMetadataPresent,
      idempotencyKey,
      recordFingerprint,
      sourceFingerprint,
      brokerResultFingerprint,
      brokerOrderFingerprint: getStringProperty(
        input.idempotencySummary,
        "brokerOrderFingerprint",
      ),
      requiredFingerprintsPresent,
      duplicatePreventionPresent,
      duplicateLookupRequiredBeforeWrite: true,
      duplicateLookupCompleted:
        input.idempotencySummary?.duplicateLookupCompleted === true,
      duplicateMatches: proposedInput?.duplicateMatches,
      duplicateDetected: (proposedInput?.duplicateMatches?.length ?? 0) > 0,
      conflictingDuplicateRequiresReview:
        proposedInput?.duplicateMatches?.some(
          (match) => match.conflictRequiresReview === true,
        ) === true,
      safeForProposedInputShaping:
        idempotencyMetadataPresent && requiredFingerprintsPresent,
      safeForWrite: false,
      blockedReasons: uniqueBlockedReasons.filter(
        (reason) =>
          reason === "missing_idempotency_metadata" ||
          reason === "missing_duplicate_prevention",
      ),
      warnings,
      reviewItems,
    };

  const auditCorrectionSummary: ExecutionRecordPersistenceValidatorAdapterAuditCorrectionSummary =
    {
      integrationAuditCorrectionSummary:
        input.auditCorrectionSummary &&
        "safeForProposedInputShaping" in input.auditCorrectionSummary
          ? null
          : input.auditCorrectionSummary ?? null,
      auditMetadata,
      auditProvenanceMetadataPresent,
      sourceEvidenceChainPresent,
      sourceEventIds: auditMetadata?.sourceEventIds ?? [],
      manualApprovalMetadataPresent: manualApprovalPresent,
      manualApprovalContext: input.manualApprovalContext ?? null,
      correctionPolicyReviewed:
        input.auditCorrectionSummary?.correctionPolicyReviewed === true,
      rollbackPolicyReviewed:
        input.auditCorrectionSummary?.rollbackPolicyReviewed === true,
      auditAppendSeparate: true,
      auditAppendAttempted: false,
      rollbackAttempted: false,
      safeForProposedInputShaping:
        auditProvenanceMetadataPresent && sourceEvidenceChainPresent,
      safeForWrite: false,
      blockedReasons: uniqueBlockedReasons.filter(
        (reason) =>
          reason === "missing_audit_correction_metadata" ||
          reason === "manual_approval_missing",
      ),
      warnings,
      reviewItems,
    };

  const securitySummary: ExecutionRecordPersistenceValidatorAdapterSecuritySummary =
    {
      integrationSecuritySummary:
        input.securitySummary &&
        "safeForProposedInputShaping" in input.securitySummary
          ? null
          : input.securitySummary ?? null,
      userContext: proposedInput?.userContext ?? null,
      rlsSecurityProofPresent,
      rlsPolicyReviewed: input.securitySummary?.rlsPolicyReviewed === true,
      serverOnlyWriteBoundaryPresent,
      serviceRoleRestrictedToServer:
        input.securitySummary?.serviceRoleRestrictedToServer === true,
      directClientWritePathAbsent:
        input.securitySummary?.directClientWritePathAbsent !== false,
      noProductionUiWriteAction:
        input.securitySummary?.noProductionUiWriteAction !== false,
      automaticModeAllowed: false,
      automaticModeReviewed: input.securitySummary?.automaticModeReviewed === true,
      productionWriteBoundaryPresent:
        input.securitySummary?.productionWriteBoundaryPresent === true,
      safeForProposedInputShaping:
        rlsSecurityProofPresent && serverOnlyWriteBoundaryPresent,
      safeForWrite: false,
      blockedReasons: uniqueBlockedReasons.filter(
        (reason) =>
          reason === "missing_rls_security_proof" ||
          reason === "missing_server_only_write_boundary",
      ),
      warnings,
      reviewItems,
    };

  const dryRunRouteSummary: ExecutionRecordPersistenceValidatorAdapterDryRunRouteSummary =
    {
      integrationDryRunRouteSummary:
        input.dryRunRouteSummary &&
        "safeForProposedInputShaping" in input.dryRunRouteSummary
          ? null
          : input.dryRunRouteSummary ?? null,
      dryRunRouteStatusAcknowledged,
      dryRunRouteKnown: input.dryRunRouteSummary?.dryRunRouteKnown === true,
      dryRunRouteDevToolsGated:
        input.dryRunRouteSummary?.dryRunRouteDevToolsGated === true,
      dryRunRouteRejectsNonDryRun:
        input.dryRunRouteSummary?.dryRunRouteRejectsNonDryRun === true,
      dryRunRouteMayCallPersistenceValidatorInDryRun:
        getBooleanProperty(
          input.dryRunRouteSummary,
          "dryRunRouteCallsPersistenceValidator",
        ) === true ||
        getBooleanProperty(
          input.dryRunRouteSummary,
          "dryRunRouteMayCallPersistenceValidatorInDryRun",
        ) === true,
      adapterCallsPersistenceValidator: false,
      adapterCallsInsertRoute: false,
      dryRunRouteWritesSupabase: false,
      dryRunRouteAppendsAudit: false,
      dryRunRouteUpdatesStats: false,
      dryRunRouteMutatesTrade: false,
      dryRunRouteRunsBrokerAction: false,
      dryRunRouteRunsAvanzaOrBrowser: false,
      dryRunOutputIsProductionInsertReadiness: false,
      productionInsertRouteReady: false,
      safeForProposedInputShaping: dryRunRouteStatusAcknowledged,
      blockedReasons: uniqueBlockedReasons.filter(
        (reason) => reason === "missing_dry_run_route_status",
      ),
      warnings,
      reviewItems,
    };

  return {
    contractVersion:
      EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_CONTRACT_VERSION,
    evaluatedAt: input.requestedAt,
    status,
    decisionRecommendation,
    input,
    proposedInputSummary,
    fieldMappingSummary,
    preconditionSummary,
    schemaReadinessSummary,
    idempotencySummary,
    auditCorrectionSummary,
    securitySummary,
    dryRunRouteSummary,
    safetyPolicy:
      EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_DEFAULT_SAFETY_POLICY,
    blockedReasons: uniqueBlockedReasons,
    warnings,
    reviewItems,
    contractOnly: true,
    adapterOnly: true,
    proposedPersistenceInputOnly: true,
    candidateOnlyOutputBoundary: true,
    safeToCallPersistenceValidator: false,
    safeToCallInsertRoute: false,
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
    persistenceValidatorCallAttempted: false,
    insertRouteCallAttempted: false,
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
    metadata: {
      noPersistenceValidatorCall: true,
      noInsertRouteCall: true,
      noExecutionRecordCreated: true,
      noPersistenceAttempted: true,
      noSupabaseWrite: true,
      noAuditAppend: true,
      noStatsUpdate: true,
      noTradeMutation: true,
      noBrokerAction: true,
      noAvanzaOrBrowserAutomation: true,
    },
  };
}
