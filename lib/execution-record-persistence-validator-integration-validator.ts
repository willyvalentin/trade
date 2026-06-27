import {
  EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_STATUSES,
  type ExecutionRecordPersistenceValidatorIntegrationAdapterStatus,
} from "@/lib/execution-record-persistence-validator-integration-adapter-contract";
import type {
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceInput,
} from "@/lib/execution-record-persistence-contract";
import {
  EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATOR_CONTRACT_VERSION,
  EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATOR_DEFAULT_AUTHORITY_FLAGS,
  type ExecutionRecordPersistenceAuditCorrectionValidationSummary,
  type ExecutionRecordPersistenceDryRunRouteValidationSummary,
  type ExecutionRecordPersistenceIdempotencyValidationSummary,
  type ExecutionRecordPersistenceProposedInputValidationSummary,
  type ExecutionRecordPersistenceReadinessValidationSummary,
  type ExecutionRecordPersistenceSafetyPolicyValidationSummary,
  type ExecutionRecordPersistenceSchemaReadinessValidationSummary,
  type ExecutionRecordPersistenceSecurityValidationSummary,
  type ExecutionRecordPersistenceValidatorIntegrationAuthorityFlags,
  type ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason,
  type ExecutionRecordPersistenceValidatorIntegrationValidationDecisionRecommendation,
  type ExecutionRecordPersistenceValidatorIntegrationValidationInput,
  type ExecutionRecordPersistenceValidatorIntegrationValidationResult,
  type ExecutionRecordPersistenceValidatorIntegrationValidationReviewItem,
  type ExecutionRecordPersistenceValidatorIntegrationValidationStatus,
  type ExecutionRecordPersistenceValidatorIntegrationValidationWarning,
} from "@/lib/execution-record-persistence-validator-integration-validator-contract";

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

function getArrayProperty<T>(value: unknown, key: string): T[] | null {
  if (!isObject(value)) {
    return null;
  }

  const property = value[key];

  return Array.isArray(property) ? property as T[] : null;
}

function isRecognizedAdapterStatus(
  value: unknown,
): value is ExecutionRecordPersistenceValidatorIntegrationAdapterStatus {
  return (
    typeof value === "string" &&
    EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_STATUSES.includes(
      value as ExecutionRecordPersistenceValidatorIntegrationAdapterStatus,
    )
  );
}

function getProposedInput(
  input: ExecutionRecordPersistenceValidatorIntegrationValidationInput,
): ExecutionRecordPersistenceInput | null {
  if ("proposedPersistenceInput" in input) {
    return input.proposedPersistenceInput ?? null;
  }

  const summaryInput =
    isObject(input.proposedInputSummary) &&
    "proposedPersistenceInput" in input.proposedInputSummary
      ? input.proposedInputSummary.proposedPersistenceInput
      : null;

  return (
    input.proposedPersistenceInput ??
    input.adapterResult?.proposedInputSummary.proposedPersistenceInput ??
    input.adapterResult?.input?.proposedPersistenceInput ??
    summaryInput ??
    null
  );
}

function getMissingRequiredPersistenceInputFields(
  proposedInput: ExecutionRecordPersistenceInput | null,
): (keyof ExecutionRecordPersistenceInput | string)[] {
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

  const missing: (keyof ExecutionRecordPersistenceInput | string)[] = [];

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

function resolveAuthorityFlags(): ExecutionRecordPersistenceValidatorIntegrationAuthorityFlags {
  return EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATOR_DEFAULT_AUTHORITY_FLAGS;
}

function hasAuthorityViolation(value: unknown): boolean {
  return [
    "safeToCallPersistenceValidator",
    "safeToCallInsertRoute",
    "safeToCreateExecutionRecord",
    "safeToPersist",
    "safeToFinalize",
    "safeToUpdateStats",
    "safeToAppendAudit",
    "safeToRollback",
    "safeToMutateTrade",
    "safeToRunBrokerAction",
    "automaticModeAllowed",
    "persistenceValidatorCallAttempted",
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
  ].some((key) => getBooleanProperty(value, key) === true);
}

function resolveStatus(
  adapterStatus: unknown,
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason[],
): ExecutionRecordPersistenceValidatorIntegrationValidationStatus {
  if (!isRecognizedAdapterStatus(adapterStatus)) {
    return blockedReasons.includes("missing_adapter_result")
      ? "persistence_integration_validation_blocked"
      : "persistence_integration_validation_invalid";
  }

  if (
    adapterStatus === "persistence_adapter_unsupported" ||
    blockedReasons.includes("unsupported_source") ||
    blockedReasons.includes("unsupported_broker")
  ) {
    return "persistence_integration_validation_unsupported";
  }

  if (
    blockedReasons.includes("safety_policy_authority_violation") ||
    blockedReasons.includes("conflicting_fingerprint") ||
    blockedReasons.includes("adapter_ready_with_blocked_reasons")
  ) {
    return "persistence_integration_validation_blocked";
  }

  if (
    adapterStatus === "persistence_adapter_blocked" ||
    adapterStatus === "persistence_adapter_not_ready"
  ) {
    return "persistence_integration_validation_blocked";
  }

  if (blockedReasons.length > 0) {
    return "persistence_integration_validation_blocked";
  }

  if (adapterStatus === "persistence_adapter_needs_review") {
    return "persistence_integration_validation_needs_review";
  }

  return "persistence_integration_validation_valid";
}

function resolveDecision(
  status: ExecutionRecordPersistenceValidatorIntegrationValidationStatus,
): ExecutionRecordPersistenceValidatorIntegrationValidationDecisionRecommendation {
  if (status === "persistence_integration_validation_valid") {
    return "validate_readiness_only";
  }

  if (status === "persistence_integration_validation_needs_review") {
    return "needs_manual_review";
  }

  if (status === "persistence_integration_validation_unsupported") {
    return "unsupported_do_not_call_persistence_validator";
  }

  if (status === "persistence_integration_validation_invalid") {
    return "invalid_do_not_call_persistence_validator";
  }

  return "blocked_do_not_call_persistence_validator";
}

function toValidationBlockedReasons(
  adapterReasons: readonly string[],
): ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason[] {
  const mapped = adapterReasons.flatMap(
    (reason): ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason[] => {
      if (
        reason === "missing_persistence_integration_input" ||
        reason === "missing_persistence_integration_result" ||
        reason === "integration_not_ready"
      ) {
        return ["invalid_adapter_status"];
      }

      if (reason === "missing_execution_record_persistence_contract") {
        return ["missing_proposed_persistence_input"];
      }

      if (reason === "missing_required_persistence_input_field") {
        return ["missing_proposed_persistence_input"];
      }

      if (reason === "missing_idempotency_metadata") {
        return ["missing_idempotency_summary", "missing_required_fingerprint"];
      }

      if (reason === "missing_audit_correction_metadata") {
        return ["missing_audit_correction_summary"];
      }

      if (reason === "missing_schema_readiness") {
        return ["schema_readiness_absent_or_unknown"];
      }

      if (reason === "generated_types_absent_or_unknown") {
        return ["generated_types_absent_or_unknown"];
      }

      if (reason === "migration_application_not_proven") {
        return ["migration_application_not_proven"];
      }

      if (reason === "missing_rls_security_proof") {
        return ["missing_rls_security_proof"];
      }

      if (reason === "missing_server_only_write_boundary") {
        return ["missing_server_only_write_boundary"];
      }

      if (reason === "missing_dry_run_route_status") {
        return ["missing_dry_run_route_status"];
      }

      if (reason === "manual_approval_missing") {
        return ["manual_approval_missing"];
      }

      if (reason === "unsupported_source") {
        return ["unsupported_source"];
      }

      if (reason === "unsupported_broker") {
        return ["unsupported_broker"];
      }

      if (
        reason === "safety_policy_authority_violation" ||
        reason === "persistence_validator_call_not_allowed" ||
        reason === "insert_route_call_not_allowed" ||
        reason === "write_authority_not_allowed"
      ) {
        return [reason];
      }

      return [];
    },
  );

  return uniqueValues(mapped);
}

function buildWarnings(
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason[],
): ExecutionRecordPersistenceValidatorIntegrationValidationWarning[] {
  return uniqueValues<ExecutionRecordPersistenceValidatorIntegrationValidationWarning>([
    "validation_only",
    "persistence_adapter_ready_not_validator_call_approval",
    "proposed_persistence_input_not_write_approval",
    "dry_run_insert_not_production_insert",
    ...(blockedReasons.includes("generated_types_absent_or_unknown")
      ? ["generated_types_required_later" as const]
      : []),
    ...(blockedReasons.includes("migration_application_not_proven")
      ? ["migration_application_required_later" as const]
      : []),
    ...(blockedReasons.includes("missing_rls_security_proof")
      ? ["rls_security_required_later" as const]
      : []),
    ...(blockedReasons.includes("missing_server_only_write_boundary")
      ? ["server_only_write_boundary_required_later" as const]
      : []),
    ...(blockedReasons.includes("missing_audit_correction_summary")
      ? ["audit_required_before_write" as const]
      : []),
    ...(blockedReasons.includes("missing_idempotency_summary") ||
    blockedReasons.includes("missing_required_fingerprint") ||
    blockedReasons.includes("conflicting_fingerprint")
      ? ["idempotency_review_required" as const]
      : []),
    "duplicate_check_required",
    "stats_update_out_of_scope",
    "trade_mutation_out_of_scope",
  ]);
}

function buildReviewItems(
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason[],
): ExecutionRecordPersistenceValidatorIntegrationValidationReviewItem[] {
  return uniqueValues<ExecutionRecordPersistenceValidatorIntegrationValidationReviewItem>([
    "adapter_result_review",
    "adapter_status_review",
    "proposed_persistence_input_review",
    "readiness_summary_review",
    "schema_readiness_review",
    "idempotency_review",
    "audit_correction_review",
    "rls_security_review",
    "server_only_write_boundary_review",
    "dry_run_route_review",
    "safety_policy_review",
    "persistence_validator_boundary_review",
    "insert_route_boundary_review",
    "production_write_boundary_review",
    ...(blockedReasons.includes("generated_types_absent_or_unknown")
      ? ["generated_types_review" as const]
      : []),
    ...(blockedReasons.includes("migration_application_not_proven")
      ? ["migration_application_review" as const]
      : []),
    ...(blockedReasons.includes("manual_approval_missing")
      ? ["manual_approval_review" as const]
      : []),
    ...(blockedReasons.includes("missing_required_fingerprint") ||
    blockedReasons.includes("conflicting_fingerprint")
      ? ["fingerprint_review" as const]
      : []),
    "duplicate_prevention_review",
  ]);
}

export function validateExecutionRecordPersistenceIntegration(
  input: ExecutionRecordPersistenceValidatorIntegrationValidationInput,
): ExecutionRecordPersistenceValidatorIntegrationValidationResult {
  const adapterResult = input.adapterResult ?? null;
  const adapterStatus = adapterResult?.status ?? null;
  const proposedInput = getProposedInput(input);
  const missingRequiredFields =
    getMissingRequiredPersistenceInputFields(proposedInput);

  const adapterBlockedReasons = adapterResult?.blockedReasons ?? [];
  const blockedReasons: ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason[] =
    [];

  if (!adapterResult) {
    blockedReasons.push("missing_adapter_result");
  } else if (!isRecognizedAdapterStatus(adapterStatus)) {
    blockedReasons.push("invalid_adapter_status");
  }

  blockedReasons.push(...toValidationBlockedReasons(adapterBlockedReasons));

  if (
    adapterResult?.status === "persistence_adapter_ready" &&
    adapterBlockedReasons.length > 0
  ) {
    blockedReasons.push("adapter_ready_with_blocked_reasons");
  }

  if (!proposedInput || missingRequiredFields.length > 0) {
    blockedReasons.push("missing_proposed_persistence_input");
  }

  const readinessSource =
    input.readinessSummary ?? adapterResult?.preconditionSummary ?? null;
  if (!readinessSource) {
    blockedReasons.push("missing_readiness_summary");
  }

  const schemaSource =
    input.schemaReadinessSummary ?? adapterResult?.schemaReadinessSummary ?? null;
  if (
    !schemaSource ||
    getBooleanProperty(schemaSource, "schemaReadinessAcknowledged") !== true
  ) {
    blockedReasons.push("schema_readiness_absent_or_unknown");
  }

  if (
    input.generatedTypesStatus === "absent" ||
    input.generatedTypesStatus === "unknown" ||
    getBooleanProperty(schemaSource, "generatedTypesAvailable") !== true ||
    getBooleanProperty(schemaSource, "generatedTypesReviewed") !== true
  ) {
    blockedReasons.push("generated_types_absent_or_unknown");
  }

  if (
    input.migrationApplicationStatus === "not_proven" ||
    input.migrationApplicationStatus === "unknown" ||
    getBooleanProperty(schemaSource, "migrationApplicationProven") !== true
  ) {
    blockedReasons.push("migration_application_not_proven");
  }

  const idempotencySource =
    input.idempotencySummary ?? adapterResult?.idempotencySummary ?? null;
  if (!idempotencySource) {
    blockedReasons.push("missing_idempotency_summary");
  }

  if (
    getBooleanProperty(idempotencySource, "idempotencyMetadataPresent") !==
      true ||
    getBooleanProperty(idempotencySource, "requiredFingerprintsPresent") !==
      true ||
    !hasText(getStringProperty(idempotencySource, "idempotencyKey")) ||
    !hasText(getStringProperty(idempotencySource, "recordFingerprint")) ||
    !hasText(getStringProperty(idempotencySource, "sourceFingerprint"))
  ) {
    blockedReasons.push("missing_required_fingerprint");
  }

  if (
    getBooleanProperty(idempotencySource, "conflictingFingerprintDetected") ===
      true ||
    getBooleanProperty(idempotencySource, "conflictingDuplicateRequiresReview") ===
      true
  ) {
    blockedReasons.push("conflicting_fingerprint");
  }

  const auditSource =
    input.auditCorrectionSummary ?? adapterResult?.auditCorrectionSummary ?? null;
  if (
    !auditSource ||
    getBooleanProperty(auditSource, "auditProvenanceMetadataPresent") !==
      true ||
    getBooleanProperty(auditSource, "sourceEvidenceChainPresent") !== true
  ) {
    blockedReasons.push("missing_audit_correction_summary");
  }

  const manualApprovalRequired =
    getBooleanProperty(readinessSource, "manualApprovalRequired") !== false;
  const manualApprovalPresent =
    getBooleanProperty(readinessSource, "manualApprovalPresent") === true ||
    getBooleanProperty(auditSource, "manualApprovalMetadataPresent") === true ||
    input.manualApprovalContext !== null &&
      input.manualApprovalContext !== undefined;

  if (manualApprovalRequired && !manualApprovalPresent) {
    blockedReasons.push("manual_approval_missing");
  }

  const securitySource =
    input.securitySummary ?? adapterResult?.securitySummary ?? null;
  if (
    input.rlsSecurityStatus === "missing" ||
    input.rlsSecurityStatus === "unknown" ||
    getBooleanProperty(securitySource, "rlsSecurityProofPresent") !== true
  ) {
    blockedReasons.push("missing_rls_security_proof");
  }

  if (
    input.serverOnlyWriteBoundaryStatus === "missing" ||
    input.serverOnlyWriteBoundaryStatus === "unknown" ||
    getBooleanProperty(securitySource, "serverOnlyWriteBoundaryPresent") !== true
  ) {
    blockedReasons.push("missing_server_only_write_boundary");
  }

  const dryRunSource =
    input.dryRunRouteSummary ?? adapterResult?.dryRunRouteSummary ?? null;
  if (
    input.dryRunInsertRouteStatus === "missing" ||
    input.dryRunInsertRouteStatus === "unknown" ||
    !dryRunSource ||
    getBooleanProperty(dryRunSource, "dryRunRouteKnown") !== true
  ) {
    blockedReasons.push("missing_dry_run_route_status");
  }

  if (hasAuthorityViolation(input.authorityFlags)) {
    blockedReasons.push("safety_policy_authority_violation");
  }

  if (hasAuthorityViolation(adapterResult) || hasAuthorityViolation(adapterResult?.safetyPolicy)) {
    blockedReasons.push("safety_policy_authority_violation");
  }

  const authorityFlags = resolveAuthorityFlags();
  const uniqueBlockedReasons = uniqueValues(blockedReasons);
  const warnings = buildWarnings(uniqueBlockedReasons);
  const reviewItems = buildReviewItems(uniqueBlockedReasons);
  const status = resolveStatus(adapterStatus, uniqueBlockedReasons);
  const decisionRecommendation = resolveDecision(status);

  const proposedInputValidationSummary: ExecutionRecordPersistenceProposedInputValidationSummary =
    {
      adapterProposedInputSummary: adapterResult?.proposedInputSummary ?? null,
      proposedPersistenceInput: proposedInput,
      proposedPersistenceInputPresent: proposedInput !== null,
      proposedPersistenceInputComplete:
        proposedInput !== null && missingRequiredFields.length === 0,
      proposedPersistenceInputIsReviewOnly: true,
      candidate: proposedInput?.candidate ?? adapterResult?.fieldMappingSummary.candidateBuilderOutput ?? null,
      candidatePresent:
        proposedInput?.candidate !== undefined ||
        adapterResult?.fieldMappingSummary.candidateBuilderOutput !== null &&
          adapterResult?.fieldMappingSummary.candidateBuilderOutput !== undefined,
      candidateOnlyOutputSummary:
        input.candidateOnlyBuilderOutputSummary ??
        adapterResult?.fieldMappingSummary.invocationOutputSummary ??
        null,
      candidateOutputOnly:
        getBooleanProperty(input.candidateOnlyBuilderOutputSummary, "candidateOutputOnly") === true ||
        adapterResult?.candidateOnlyOutputBoundary === true,
      requestedAtPresent: hasText(proposedInput?.requestedAt),
      brokerConfirmationPresent: proposedInput?.brokerConfirmation !== undefined,
      associationPresent: proposedInput?.association !== undefined,
      userContextPresent: proposedInput?.userContext !== undefined,
      safetyChecklist: proposedInput?.safetyChecklist ?? null,
      safetyChecklistPresent: proposedInput?.safetyChecklist !== undefined,
      auditMetadataPresent: proposedInput?.auditMetadata !== undefined,
      schemaReferencePresent: proposedInput?.schemaReference !== undefined,
      duplicateMatches: proposedInput?.duplicateMatches,
      missingRequiredPersistenceInputFields: missingRequiredFields,
      proposedInputSafeForPersistenceValidatorReview:
        proposedInput !== null && missingRequiredFields.length === 0,
      proposedInputSafeForWrite: false,
      blockedReasons: uniqueBlockedReasons.filter(
        (reason) => reason === "missing_proposed_persistence_input",
      ),
      warnings,
      reviewItems,
    };

  const readinessValidationSummary: ExecutionRecordPersistenceReadinessValidationSummary =
    {
      adapterPreconditionSummary: adapterResult?.preconditionSummary ?? null,
      integrationReadinessSummary: null,
      persistenceIntegrationInput: adapterResult?.input?.persistenceIntegrationInput ?? null,
      persistenceIntegrationResult:
        adapterResult?.input?.persistenceIntegrationResult ?? null,
      adapterResultPresent: adapterResult !== null,
      adapterStatusRecognized: isRecognizedAdapterStatus(adapterStatus),
      adapterReadyStatus: adapterStatus === "persistence_adapter_ready",
      adapterHasBlockedReasons: adapterBlockedReasons.length > 0,
      adapterReadyWithBlockedReasons: uniqueBlockedReasons.includes(
        "adapter_ready_with_blocked_reasons",
      ),
      proposedPersistenceInputPresent: proposedInput !== null,
      readinessSummaryPresent: readinessSource !== null,
      candidateBuilderInvocationResultPresent:
        input.invocationResult !== null &&
          input.invocationResult !== undefined ||
        adapterResult?.input?.invocationResult !== null &&
          adapterResult?.input?.invocationResult !== undefined,
      candidateOutputOnly:
        adapterResult?.candidateOnlyOutputBoundary === true ||
        getBooleanProperty(input.candidateOnlyBuilderOutputSummary, "candidateOutputOnly") === true,
      manualApprovalRequired,
      manualApprovalPresent,
      allAuthorityFlagsFalse: !hasAuthorityViolation(authorityFlags),
      validationOnly: true,
      safeToCallPersistenceValidator: false,
      safeToCallInsertRoute: false,
      safeToCreateExecutionRecord: false,
      safeToPersist: false,
      blockedReasons: uniqueBlockedReasons.filter(
        (reason) =>
          reason === "missing_adapter_result" ||
          reason === "invalid_adapter_status" ||
          reason === "adapter_ready_with_blocked_reasons" ||
          reason === "missing_readiness_summary" ||
          reason === "manual_approval_missing",
      ),
      warnings,
      reviewItems,
    };

  const schemaReadinessValidationSummary: ExecutionRecordPersistenceSchemaReadinessValidationSummary =
    {
      adapterSchemaReadinessSummary: adapterResult?.schemaReadinessSummary ?? null,
      integrationSchemaReadinessSummary: null,
      schemaReference: proposedInput?.schemaReference ?? null,
      schemaReadinessSummaryPresent: schemaSource !== null,
      schemaReadinessAcknowledged:
        getBooleanProperty(schemaSource, "schemaReadinessAcknowledged") === true,
      executionRecordsTableExpected: true,
      executionRecordsTablePresent:
        getBooleanProperty(schemaSource, "executionRecordsTablePresent"),
      generatedTypesStatusAcknowledged:
        getBooleanProperty(schemaSource, "generatedTypesStatusAcknowledged") === true,
      generatedTypesAvailable:
        getBooleanProperty(schemaSource, "generatedTypesAvailable") === true,
      generatedTypesReviewed:
        getBooleanProperty(schemaSource, "generatedTypesReviewed") === true,
      generatedTypesLocation: getStringProperty(schemaSource, "generatedTypesLocation"),
      migrationApplicationStatusAcknowledged:
        getBooleanProperty(schemaSource, "migrationApplicationStatusAcknowledged") === true,
      migrationApplicationProven:
        getBooleanProperty(schemaSource, "migrationApplicationProven") === true,
      migrationReference: getStringProperty(schemaSource, "migrationReference"),
      schemaAlignedWithPersistenceContract:
        getBooleanProperty(schemaSource, "schemaAlignedWithPersistenceContract") === true,
      schemaAlignedWithProposedInput:
        getBooleanProperty(schemaSource, "schemaAlignedWithProposedInput") === true,
      productionWriteReadinessBlockedBySchema:
        uniqueBlockedReasons.includes("schema_readiness_absent_or_unknown") ||
        uniqueBlockedReasons.includes("generated_types_absent_or_unknown") ||
        uniqueBlockedReasons.includes("migration_application_not_proven"),
      safeForValidationOnly: true,
      safeForWrite: false,
      blockedReasons: uniqueBlockedReasons.filter(
        (reason) =>
          reason === "schema_readiness_absent_or_unknown" ||
          reason === "generated_types_absent_or_unknown" ||
          reason === "migration_application_not_proven",
      ),
      warnings,
      reviewItems,
    };

  const duplicateMatches = getArrayProperty<ExecutionRecordDuplicateMatch>(
    idempotencySource,
    "duplicateMatches",
  ) ??
    proposedInput?.duplicateMatches;
  const idempotencyValidationSummary: ExecutionRecordPersistenceIdempotencyValidationSummary =
    {
      adapterIdempotencySummary: adapterResult?.idempotencySummary ?? null,
      integrationIdempotencySummary: null,
      idempotencySummaryPresent: idempotencySource !== null,
      idempotencyMetadataPresent:
        getBooleanProperty(idempotencySource, "idempotencyMetadataPresent") === true,
      idempotencyKey: getStringProperty(idempotencySource, "idempotencyKey") ??
        proposedInput?.idempotencyKey,
      recordFingerprint: getStringProperty(idempotencySource, "recordFingerprint") ??
        proposedInput?.recordFingerprint,
      sourceFingerprint: getStringProperty(idempotencySource, "sourceFingerprint") ??
        proposedInput?.sourceFingerprint,
      brokerResultFingerprint: getStringProperty(idempotencySource, "brokerResultFingerprint") ??
        proposedInput?.brokerConfirmation.brokerResultFingerprint,
      brokerOrderFingerprint: getStringProperty(idempotencySource, "brokerOrderFingerprint") ??
        proposedInput?.brokerConfirmation.brokerOrderId,
      requiredFingerprintsPresent:
        getBooleanProperty(idempotencySource, "requiredFingerprintsPresent") === true,
      conflictingFingerprintDetected:
        uniqueBlockedReasons.includes("conflicting_fingerprint"),
      duplicatePreventionPresent:
        getBooleanProperty(idempotencySource, "duplicatePreventionPresent") === true,
      duplicateLookupRequiredBeforeWrite: true,
      duplicateLookupCompleted:
        getBooleanProperty(idempotencySource, "duplicateLookupCompleted") === true,
      duplicateMatches,
      duplicateDetected:
        getBooleanProperty(idempotencySource, "duplicateDetected") === true ||
        (duplicateMatches?.length ?? 0) > 0,
      conflictingDuplicateRequiresReview:
        getBooleanProperty(idempotencySource, "conflictingDuplicateRequiresReview") === true,
      safeForValidationOnly: true,
      safeForWrite: false,
      blockedReasons: uniqueBlockedReasons.filter(
        (reason) =>
          reason === "missing_idempotency_summary" ||
          reason === "missing_required_fingerprint" ||
          reason === "conflicting_fingerprint",
      ),
      warnings,
      reviewItems,
    };

  const auditCorrectionValidationSummary: ExecutionRecordPersistenceAuditCorrectionValidationSummary =
    {
      adapterAuditCorrectionSummary: adapterResult?.auditCorrectionSummary ?? null,
      integrationAuditCorrectionSummary: null,
      auditMetadata: proposedInput?.auditMetadata ?? null,
      auditCorrectionSummaryPresent: auditSource !== null,
      auditProvenanceMetadataPresent:
        getBooleanProperty(auditSource, "auditProvenanceMetadataPresent") === true,
      sourceEvidenceChainPresent:
        getBooleanProperty(auditSource, "sourceEvidenceChainPresent") === true,
      sourceEventIds:
        getArrayProperty<string>(auditSource, "sourceEventIds") ??
        proposedInput?.auditMetadata.sourceEventIds ??
        [],
      manualApprovalMetadataPresent: manualApprovalPresent,
      manualApprovalContext: input.manualApprovalContext ?? null,
      correctionPolicyReviewed:
        getBooleanProperty(auditSource, "correctionPolicyReviewed") === true,
      rollbackPolicyReviewed:
        getBooleanProperty(auditSource, "rollbackPolicyReviewed") === true,
      auditAppendSeparate: true,
      auditAppendAttempted: false,
      rollbackAttempted: false,
      safeForValidationOnly: true,
      safeForWrite: false,
      blockedReasons: uniqueBlockedReasons.filter(
        (reason) =>
          reason === "missing_audit_correction_summary" ||
          reason === "manual_approval_missing",
      ),
      warnings,
      reviewItems,
    };

  const securityValidationSummary: ExecutionRecordPersistenceSecurityValidationSummary =
    {
      adapterSecuritySummary: adapterResult?.securitySummary ?? null,
      integrationSecuritySummary: null,
      userContext: proposedInput?.userContext ?? null,
      rlsSecurityProofPresent:
        getBooleanProperty(securitySource, "rlsSecurityProofPresent") === true,
      rlsPolicyReviewed:
        getBooleanProperty(securitySource, "rlsPolicyReviewed") === true,
      serverOnlyWriteBoundaryPresent:
        getBooleanProperty(securitySource, "serverOnlyWriteBoundaryPresent") === true,
      serviceRoleRestrictedToServer:
        getBooleanProperty(securitySource, "serviceRoleRestrictedToServer") === true,
      directClientWritePathAbsent:
        getBooleanProperty(securitySource, "directClientWritePathAbsent") !== false,
      noProductionUiWriteAction:
        getBooleanProperty(securitySource, "noProductionUiWriteAction") !== false,
      automaticModeAllowed: false,
      automaticModeReviewed:
        getBooleanProperty(securitySource, "automaticModeReviewed") === true,
      productionWriteBoundaryPresent:
        getBooleanProperty(securitySource, "productionWriteBoundaryPresent") === true,
      safeForValidationOnly: true,
      safeForWrite: false,
      blockedReasons: uniqueBlockedReasons.filter(
        (reason) =>
          reason === "missing_rls_security_proof" ||
          reason === "missing_server_only_write_boundary",
      ),
      warnings,
      reviewItems,
    };

  const dryRunRouteValidationSummary: ExecutionRecordPersistenceDryRunRouteValidationSummary =
    {
      adapterDryRunRouteSummary: adapterResult?.dryRunRouteSummary ?? null,
      integrationDryRunRouteSummary: null,
      dryRunRouteStatusPresent: dryRunSource !== null,
      dryRunRouteKnown:
        getBooleanProperty(dryRunSource, "dryRunRouteKnown") === true,
      dryRunRouteDevToolsGated:
        getBooleanProperty(dryRunSource, "dryRunRouteDevToolsGated") === true,
      dryRunRouteRejectsNonDryRun:
        getBooleanProperty(dryRunSource, "dryRunRouteRejectsNonDryRun") === true,
      dryRunRouteMayCallPersistenceValidatorInDryRun:
        getBooleanProperty(
          dryRunSource,
          "dryRunRouteMayCallPersistenceValidatorInDryRun",
        ) === true,
      validationContractCallsPersistenceValidator: false,
      validationContractCallsInsertRoute: false,
      dryRunRouteWritesSupabase: false,
      dryRunRouteAppendsAudit: false,
      dryRunRouteUpdatesStats: false,
      dryRunRouteMutatesTrade: false,
      dryRunRouteRunsBrokerAction: false,
      dryRunRouteRunsAvanzaOrBrowser: false,
      dryRunOutputIsProductionInsertReadiness: false,
      productionInsertRouteReady: false,
      safeForValidationOnly: true,
      blockedReasons: uniqueBlockedReasons.filter(
        (reason) => reason === "missing_dry_run_route_status",
      ),
      warnings,
      reviewItems,
    };

  const safetyPolicyValidationSummary: ExecutionRecordPersistenceSafetyPolicyValidationSummary =
    {
      authorityFlags,
      safetyPolicyPresent: adapterResult?.safetyPolicy !== undefined,
      validationOnly: true,
      allWriteAuthorityFlagsFalse: !hasAuthorityViolation(authorityFlags),
      allRuntimeMutationAttemptFlagsFalse: !hasAuthorityViolation(authorityFlags),
      persistenceValidatorCallAllowed: false,
      persistenceValidatorCallAttempted: false,
      insertRouteCallAllowed: false,
      insertRouteCallAttempted: false,
      executionRecordCreationAllowed: false,
      executionRecordCreationAttempted: false,
      persistenceAllowed: false,
      persistenceAttempted: false,
      auditAppendAllowed: false,
      auditAppendAttempted: false,
      statsUpdateAllowed: false,
      statsUpdateAttempted: false,
      rollbackAllowed: false,
      rollbackAttempted: false,
      tradeMutationAllowed: false,
      tradeMutationAttempted: false,
      brokerAutomationAllowed: false,
      brokerAutomationAttempted: false,
      automaticModeAllowed: false,
      safetyPolicyAuthorityViolation: uniqueBlockedReasons.includes(
        "safety_policy_authority_violation",
      ),
      policyReason: getStringProperty(adapterResult?.safetyPolicy, "policyReason"),
      blockedReasons: uniqueBlockedReasons.filter(
        (reason) =>
          reason === "safety_policy_authority_violation" ||
          reason === "persistence_validator_call_not_allowed" ||
          reason === "insert_route_call_not_allowed" ||
          reason === "write_authority_not_allowed",
      ),
      warnings,
      reviewItems,
    };

  return {
    contractVersion:
      EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATOR_CONTRACT_VERSION,
    evaluatedAt: input.requestedAt,
    status,
    decisionRecommendation,
    input,
    proposedInputValidationSummary,
    readinessValidationSummary,
    schemaReadinessValidationSummary,
    idempotencyValidationSummary,
    auditCorrectionValidationSummary,
    securityValidationSummary,
    dryRunRouteValidationSummary,
    safetyPolicyValidationSummary,
    authorityFlags,
    blockedReasons: uniqueBlockedReasons,
    warnings,
    reviewItems,
    contractOnly: true,
    validationOnly: true,
    persistenceReadinessOnly: true,
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
    validatorImplemented: true,
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
      noLocalStorageWrite: true,
      noAuditAppend: true,
      noStatsUpdate: true,
      noRollbackOrCorrection: true,
      noTradeMutation: true,
      noUiWiring: true,
      noBrowserOrAvanzaBehavior: true,
      noBrokerOrOrderBehavior: true,
    },
  };
}
