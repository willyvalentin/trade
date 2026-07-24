import { buildExecutionRecordCandidate } from "@/lib/execution-record-candidate-builder";
import {
  EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_CONTRACT_VERSION,
  EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DEFAULT_SAFETY_POLICY,
  type ExecutionRecordCandidateBuilderInvocationAuditProvenanceSummary,
  type ExecutionRecordCandidateBuilderInvocationBlockedReason,
  type ExecutionRecordCandidateBuilderInvocationDecisionRecommendation,
  type ExecutionRecordCandidateBuilderInvocationIdempotencySummary,
  type ExecutionRecordCandidateBuilderInvocationInput,
  type ExecutionRecordCandidateBuilderInvocationInputSourceSummary,
  type ExecutionRecordCandidateBuilderInvocationOutputSummary,
  type ExecutionRecordCandidateBuilderInvocationPrerequisiteSummary,
  type ExecutionRecordCandidateBuilderInvocationResult,
  type ExecutionRecordCandidateBuilderInvocationReviewItem,
  type ExecutionRecordCandidateBuilderInvocationSchemaReadinessSummary,
  type ExecutionRecordCandidateBuilderInvocationStatus,
  type ExecutionRecordCandidateBuilderInvocationWarning,
} from "@/lib/execution-record-candidate-builder-invocation-contract";
import type {
  ExecutionRecordCandidateBuilderInvocationValidationBlockedReason,
  ExecutionRecordCandidateBuilderInvocationValidationResult,
  ExecutionRecordCandidateBuilderInvocationValidationReviewItem,
  ExecutionRecordCandidateBuilderInvocationValidationStatus,
  ExecutionRecordCandidateBuilderInvocationValidationWarning,
} from "@/lib/execution-record-candidate-builder-invocation-validator-contract";
import type {
  ExecutionRecordCreationInput,
  ExecutionRecordCreationResult,
} from "@/lib/execution-record-creation-contract";

type BuilderFn = (
  input: ExecutionRecordCreationInput,
) => ExecutionRecordCreationResult;

type InvokeExecutionRecordCandidateBuilderOptions = {
  buildCandidate?: BuilderFn;
};

function pushUnique<T extends string>(items: T[], item: T) {
  if (!items.includes(item)) {
    items.push(item);
  }
}

function hasObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function textFromRecord(source: unknown, key: string): string | null {
  if (!hasObject(source)) return null;
  const value = source[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function booleanFromRecord(source: unknown, key: string) {
  return hasObject(source) && source[key] === true;
}

function mapValidationBlockedReason(
  reason: ExecutionRecordCandidateBuilderInvocationValidationBlockedReason,
): ExecutionRecordCandidateBuilderInvocationBlockedReason {
  switch (reason) {
    case "missing_invocation_result":
      return "missing_invocation_validation";
    case "invalid_invocation_status":
      return "candidate_builder_invocation_not_implemented";
    case "invocation_ready_with_blocked_reasons":
      return "candidate_builder_invocation_not_implemented";
    case "missing_adapter_validation":
      return "missing_adapter_validation";
    case "adapter_validation_not_valid":
      return "adapter_validation_not_valid";
    case "missing_proposed_input":
      return "missing_proposed_execution_record_creation_input";
    case "missing_required_proposed_input_field":
      return "missing_required_builder_input_field";
    case "schema_readiness_absent_or_unknown":
      return "missing_schema_readiness";
    case "migration_application_not_proven":
      return "migration_application_not_proven";
    case "generated_types_absent_or_unknown":
      return "generated_types_absent_or_unknown";
    case "missing_idempotency_summary":
    case "missing_required_fingerprint":
    case "conflicting_fingerprint":
      return "missing_idempotency_metadata";
    case "missing_audit_provenance_summary":
      return "missing_audit_provenance_metadata";
    case "manual_approval_missing":
      return "manual_approval_missing";
    case "unsupported_source":
      return "unsupported_source";
    case "unsupported_broker":
      return "unsupported_broker";
    case "safety_policy_authority_violation":
      return "safety_policy_authority_violation";
    case "candidate_builder_call_not_allowed":
      return "candidate_builder_invocation_not_implemented";
    case "execution_record_candidate_creation_not_allowed":
      return "execution_record_candidate_creation_not_allowed";
    case "write_authority_not_allowed":
      return "write_authority_not_allowed";
  }
}

function mapValidationWarning(
  warning: ExecutionRecordCandidateBuilderInvocationValidationWarning,
): ExecutionRecordCandidateBuilderInvocationWarning {
  switch (warning) {
    case "validation_only":
      return "contract_only";
    case "builder_invocation_ready_not_call_approval":
      return "candidate_output_would_be_candidate_only";
    case "candidate_builder_not_called":
      return "candidate_builder_not_called";
    case "candidate_output_not_created":
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
  }
}

function mapValidationReviewItem(
  item: ExecutionRecordCandidateBuilderInvocationValidationReviewItem,
): ExecutionRecordCandidateBuilderInvocationReviewItem {
  switch (item) {
    case "invocation_result_review":
    case "invocation_status_review":
      return "adapter_validation_review";
    case "adapter_validation_review":
      return "adapter_validation_review";
    case "proposed_input_review":
      return "proposed_creation_input_review";
    case "schema_readiness_review":
      return "schema_readiness_review";
    case "generated_types_review":
      return "generated_types_review";
    case "migration_application_review":
      return "migration_application_review";
    case "idempotency_review":
      return "idempotency_review";
    case "duplicate_review":
      return "duplicate_review";
    case "audit_provenance_review":
      return "audit_provenance_review";
    case "manual_approval_review":
      return "manual_approval_review";
    case "safety_policy_review":
    case "authority_flags_review":
      return "safety_policy_review";
    case "candidate_output_boundary_review":
      return "candidate_output_boundary_review";
    case "persistence_boundary_review":
      return "persistence_boundary_review";
  }
}

function statusFromValidation(
  status: ExecutionRecordCandidateBuilderInvocationValidationStatus | null,
): ExecutionRecordCandidateBuilderInvocationStatus {
  switch (status) {
    case "builder_invocation_validation_valid":
      return "builder_invocation_ready";
    case "builder_invocation_validation_needs_review":
      return "builder_invocation_needs_review";
    case "builder_invocation_validation_unsupported":
      return "builder_invocation_unsupported";
    case "builder_invocation_validation_invalid":
    case "builder_invocation_validation_blocked":
      return "builder_invocation_blocked";
    case null:
      return "builder_invocation_not_ready";
  }
}

function decisionFromStatus(
  status: ExecutionRecordCandidateBuilderInvocationStatus,
): ExecutionRecordCandidateBuilderInvocationDecisionRecommendation {
  switch (status) {
    case "builder_invocation_ready":
      return "candidate_builder_invocation_contract_only";
    case "builder_invocation_needs_review":
      return "needs_manual_review";
    case "builder_invocation_unsupported":
      return "unsupported_do_not_call_builder";
    case "builder_invocation_blocked":
      return "blocked_do_not_call_builder";
    case "builder_invocation_not_ready":
      return "not_ready_do_not_call_builder";
  }
}

function collectValidationFindings(
  validation: ExecutionRecordCandidateBuilderInvocationValidationResult | null,
) {
  const blockedReasons: ExecutionRecordCandidateBuilderInvocationBlockedReason[] =
    [];
  const warnings: ExecutionRecordCandidateBuilderInvocationWarning[] = [];
  const reviewItems: ExecutionRecordCandidateBuilderInvocationReviewItem[] = [];

  if (!validation) {
    blockedReasons.push("missing_invocation_validation");
    warnings.push("candidate_builder_not_called");
    reviewItems.push("adapter_validation_review");
    return { blockedReasons, warnings, reviewItems };
  }

  validation.blockedReasons.forEach((reason) =>
    pushUnique(blockedReasons, mapValidationBlockedReason(reason)),
  );
  validation.warnings.forEach((warning) =>
    pushUnique(warnings, mapValidationWarning(warning)),
  );
  validation.reviewItems.forEach((item) =>
    pushUnique(reviewItems, mapValidationReviewItem(item)),
  );

  return { blockedReasons, warnings, reviewItems };
}

function isValidValidation(
  validation: ExecutionRecordCandidateBuilderInvocationValidationResult | null,
) {
  return validation?.status === "builder_invocation_validation_valid";
}

function buildPrerequisiteSummary(args: {
  input: ExecutionRecordCandidateBuilderInvocationInput;
  validation: ExecutionRecordCandidateBuilderInvocationValidationResult | null;
  blockedReasons: ExecutionRecordCandidateBuilderInvocationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderInvocationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderInvocationReviewItem[];
}): ExecutionRecordCandidateBuilderInvocationPrerequisiteSummary {
  const validationPrerequisites = args.validation?.prerequisiteValidationSummary;
  const proposedInput =
    args.input.proposedCreationInput ??
    validationPrerequisites?.sourceSummary?.metadata?.proposedCreationInput ??
    null;
  const missingFields =
    args.validation?.proposedInputValidationSummary.missingRequiredFields ??
    (proposedInput ? [] : ["proposedCreationInput"]);

  return {
    adapterResultPresent: Boolean(args.input.adapterResult),
    adapterValidationResultPresent: Boolean(args.input.adapterValidationResult),
    adapterValidationValid:
      args.input.adapterValidationResult?.status === "adapter_validation_valid",
    reviewGateExplicitlyAllowed: false,
    proposedCreationInputPresent: Boolean(args.input.proposedCreationInput),
    proposedCreationInputComplete:
      args.validation?.proposedInputValidationSummary.requiredFieldsPresent ??
      Boolean(args.input.proposedCreationInput),
    requiredBuilderInputFieldsPresent:
      args.validation?.proposedInputValidationSummary.requiredFieldsPresent ??
      Boolean(args.input.proposedCreationInput),
    missingRequiredBuilderInputFields: missingFields,
    schemaReadinessAcknowledged: Boolean(args.input.schemaReadinessMetadata),
    generatedTypesStatusAcknowledged:
      args.validation?.schemaReadinessValidationSummary.generatedTypesReviewed ??
      booleanFromRecord(args.input.schemaReadinessMetadata, "generatedTypesReviewed"),
    migrationApplicationStatusAcknowledged:
      args.validation?.schemaReadinessValidationSummary.migrationApplicationProven ??
      booleanFromRecord(
        args.input.schemaReadinessMetadata,
        "migrationApplicationProven",
      ),
    idempotencyMetadataPresent: Boolean(args.input.idempotencyMetadata),
    auditProvenanceMetadataPresent: Boolean(args.input.auditProvenanceMetadata),
    manualApprovalRequired: true,
    manualApprovalPresent:
      args.validation?.auditProvenanceValidationSummary
        .manualApprovalContextPresent ?? Boolean(args.input.manualApprovalMetadata),
    supportedSource:
      !args.blockedReasons.includes("unsupported_source") &&
      !args.blockedReasons.includes("direct_bridge_to_builder_bypass_not_allowed"),
    supportedBroker: !args.blockedReasons.includes("unsupported_broker"),
    allAuthorityFlagsFalse:
      args.validation?.safetyPolicyValidationSummary.allAuthorityFlagsFalse ??
      true,
    noWriteAuthorityRequested: true,
    canConsiderCandidateOnlyInvocation: isValidValidation(args.validation),
    safeToCallCandidateBuilder: false,
    safeToCreateExecutionRecordCandidate: false,
    safeToCreateExecutionRecord: false,
    safeToPersist: false,
    blockedReasons: args.blockedReasons,
    warnings: args.warnings,
    reviewItems: args.reviewItems,
    metadata: {
      pureWrapper: true,
      validationStatus: args.validation?.status ?? "missing",
    },
  };
}

function buildInputSourceSummary(args: {
  input: ExecutionRecordCandidateBuilderInvocationInput;
  validation: ExecutionRecordCandidateBuilderInvocationValidationResult | null;
  blockedReasons: ExecutionRecordCandidateBuilderInvocationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderInvocationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderInvocationReviewItem[];
}): ExecutionRecordCandidateBuilderInvocationInputSourceSummary {
  return {
    adapterInput: args.input.adapterInput ?? args.input.adapterResult?.input ?? null,
    adapterResult: args.input.adapterResult ?? null,
    adapterValidationResult: args.input.adapterValidationResult ?? null,
    adapterProposedInputSummary:
      args.input.adapterResult?.proposedInputSummary ?? null,
    adapterPreconditionSummary:
      args.input.adapterResult?.preconditionSummary ?? null,
    validatorProposedInputSummary:
      args.input.adapterValidationResult?.proposedInputValidationSummary ?? null,
    validatorPreconditionSummary:
      args.input.adapterValidationResult?.preconditionValidationSummary ?? null,
    proposedCreationInput: args.input.proposedCreationInput ?? null,
    inputComesFromAdapterShapedProposedInput:
      args.validation?.inputSourceValidationSummary
        .proposedInputComesFromAdapter ?? Boolean(args.input.adapterResult),
    adapterOutputValidated:
      args.validation?.inputSourceValidationSummary.adapterOutputValidated ??
      (args.input.adapterValidationResult?.status === "adapter_validation_valid"),
    directBridgeToBuilderBypassAttempted: false,
    directFinalizationToBuilderBypassAttempted: false,
    liveBrokerOrAvanzaDataConsumed: false,
    uiStateBypassAttempted: false,
    routeOrStorageBypassAttempted: false,
    blockedReasons: args.blockedReasons,
    warnings: args.warnings,
    reviewItems: args.reviewItems,
    metadata: {
      pureWrapper: true,
      controlledByInvocationValidation: true,
    },
  };
}

function buildIdempotencySummary(
  input: ExecutionRecordCandidateBuilderInvocationInput,
): ExecutionRecordCandidateBuilderInvocationIdempotencySummary {
  const source = input.idempotencyMetadata;

  return {
    sourceSummary: source,
    intendedExecutionRecordIdempotencyKey:
      textFromRecord(source, "intendedExecutionRecordIdempotencyKey") ??
      input.proposedCreationInput?.idempotency.idempotencyKey ??
      null,
    intendedExecutionRecordCandidateFingerprint:
      textFromRecord(source, "intendedExecutionRecordCandidateFingerprint") ??
      textFromRecord(source, "recordFingerprint"),
    builderRecordFingerprint:
      textFromRecord(source, "builderRecordFingerprint") ??
      textFromRecord(source, "intendedExecutionRecordCandidateFingerprint"),
    sourceEvidenceFingerprint:
      textFromRecord(source, "sourceEvidenceFingerprint") ??
      input.proposedCreationInput?.idempotency.sourceEvidenceFingerprint ??
      null,
    brokerResultFingerprint:
      textFromRecord(source, "brokerResultFingerprint") ??
      input.proposedCreationInput?.idempotency.brokerResultFingerprint ??
      null,
    handoffPayloadFingerprint:
      textFromRecord(source, "handoffPayloadFingerprint") ??
      input.proposedCreationInput?.idempotency.handoffPayloadFingerprint ??
      null,
    captureId: input.proposedCreationInput?.idempotency.captureId ?? null,
    requestId: input.proposedCreationInput?.idempotency.requestId ?? null,
    requiredFingerprintsPresent:
      booleanFromRecord(source, "requiredFingerprintsPresent") ||
      Boolean(
        input.proposedCreationInput?.idempotency.idempotencyKey &&
          input.proposedCreationInput.idempotency.sourceEvidenceFingerprint,
      ),
    duplicateCheckRequired: true,
    duplicateDetectionSeparate: true,
    duplicateDetected: booleanFromRecord(source, "duplicateDetected"),
    duplicateOfRecordId: textFromRecord(source, "duplicateOfRecordId"),
    retrySafe: booleanFromRecord(source, "retrySafe"),
    mismatchRequiresReview: booleanFromRecord(source, "mismatchRequiresReview"),
    insertBoundaryMustEnforceUniquenessLater: true,
    safeForCandidateOnlyInvocationReview: true,
    safeForWrite: false,
    metadata: {
      pureWrapper: true,
      duplicateCheckNotPerformed: true,
    },
  };
}

function buildAuditProvenanceSummary(
  input: ExecutionRecordCandidateBuilderInvocationInput,
): ExecutionRecordCandidateBuilderInvocationAuditProvenanceSummary {
  const source = input.auditProvenanceMetadata;

  return {
    sourceSummary: source,
    sourceEvidenceChainPreserved:
      booleanFromRecord(source, "sourceEvidenceChainPreserved") ||
      Boolean(input.proposedCreationInput?.idempotency.sourceEvidenceFingerprint),
    finalizationReferencePreserved:
      booleanFromRecord(source, "finalizationReferencePreserved") ||
      Boolean(input.finalizationCandidate),
    bridgeReferencePreserved:
      booleanFromRecord(source, "bridgeReferencePreserved") ||
      Boolean(input.bridgeMapperResult),
    adapterValidationReferencePreserved:
      booleanFromRecord(source, "adapterValidationReferencePreserved") ||
      Boolean(input.adapterValidationResult),
    manualApprovalMetadataPreserved:
      booleanFromRecord(source, "manualApprovalMetadataPreserved") ||
      Boolean(input.manualApprovalMetadata),
    auditAppendSeparate: true,
    auditRequiredBeforeWrite: true,
    auditMetadataPresent:
      booleanFromRecord(source, "auditMetadataPresent") ||
      Boolean(input.proposedCreationInput?.auditContext),
    provenanceMetadataPresent:
      booleanFromRecord(source, "provenanceMetadataPresent") ||
      Boolean(input.proposedCreationInput?.auditContext),
    sourceEvidenceTraceable:
      booleanFromRecord(source, "sourceEvidenceTraceable") ||
      Boolean(input.proposedCreationInput?.idempotency.sourceEvidenceFingerprint),
    sourceEventIds: input.proposedCreationInput?.auditContext.sourceEventIds ?? [],
    handoffSessionId:
      textFromRecord(source, "handoffSessionId") ??
      input.proposedCreationInput?.auditContext.handoffSessionId ??
      null,
    payloadId:
      textFromRecord(source, "payloadId") ??
      input.proposedCreationInput?.auditContext.payloadId ??
      null,
    beforeAfterValuesRequiredLater: true,
    auditAppendAttempted: false,
    rollbackAttempted: false,
    safeForCandidateOnlyInvocationReview: true,
    safeForWrite: false,
    metadata: {
      pureWrapper: true,
      auditAppendAttempted: false,
    },
  };
}

function buildSchemaReadinessSummary(
  input: ExecutionRecordCandidateBuilderInvocationInput,
  validation: ExecutionRecordCandidateBuilderInvocationValidationResult | null,
): ExecutionRecordCandidateBuilderInvocationSchemaReadinessSummary {
  const source = input.schemaReadinessMetadata;

  return {
    sourceSummary: source,
    schemaReadinessMetadataPresent: Boolean(source),
    generatedTypesAvailable:
      validation?.schemaReadinessValidationSummary.generatedTypesAvailable ??
      booleanFromRecord(source, "generatedTypesAvailable"),
    generatedTypesReviewed:
      validation?.schemaReadinessValidationSummary.generatedTypesReviewed ??
      booleanFromRecord(source, "generatedTypesReviewed"),
    generatedTypesLocation: textFromRecord(source, "generatedTypesLocation"),
    generatedTypesRequiredForCandidateOnlyInvocation: false,
    migrationApplicationProven:
      validation?.schemaReadinessValidationSummary.migrationApplicationProven ??
      booleanFromRecord(source, "migrationApplicationProven"),
    migrationReference: textFromRecord(source, "migrationReference"),
    executionRecordsTablePresent: booleanFromRecord(
      source,
      "executionRecordsTablePresent",
    ),
    executionRecordsSchemaAlignedWithCreationContract: booleanFromRecord(
      source,
      "executionRecordsSchemaAlignedWithCreationContract",
    ),
    persistenceBoundaryEnabled: false,
    insertRouteDryRunOnly: true,
    productionWriteEnabled: false,
    candidateOnlyInvocationIndependentFromDbGeneratedTypes: true,
    persistenceCouplingMustWaitForMigrationAndTypes: true,
    safeToPersist: false,
    blockedReasons: [],
    warnings: [],
    reviewItems: [],
    metadata: {
      pureWrapper: true,
      persistenceStillSeparate: true,
    },
  };
}

function buildOutputSummary(args: {
  builderCalled: boolean;
  builderResult: ExecutionRecordCreationResult | null;
  blockedReasons: ExecutionRecordCandidateBuilderInvocationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderInvocationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderInvocationReviewItem[];
}): ExecutionRecordCandidateBuilderInvocationOutputSummary {
  const candidateOutput =
    args.builderResult?.status === "eligible"
      ? args.builderResult.recordCandidate ?? null
      : null;

  return {
    candidateOutputOnly: true,
    builderInvocationImplemented: args.builderCalled,
    candidateBuilderCalled: args.builderCalled,
    candidateBuilderResult: args.builderResult,
    candidateOutput,
    candidateOutputWouldBeCandidateOnly: Boolean(candidateOutput),
    outputRequiresSeparateValidation: true,
    persistenceValidatorSeparate: true,
    insertRouteSeparate: true,
    dryRunInsertRouteSeparate: true,
    productionWritePathSeparate: true,
    safeToCreateExecutionRecordCandidate: false,
    safeToCreateExecutionRecord: false,
    safeToPersist: false,
    safeToAppendAudit: false,
    safeToUpdateStats: false,
    safeToRollback: false,
    safeToMutateTrade: false,
    blockedReasons: args.blockedReasons,
    warnings: args.warnings,
    reviewItems: args.reviewItems,
    metadata: {
      candidateOnly: true,
      notPersistenceApproval: true,
      noExecutionRecordCreated: true,
      noSupabaseWrite: true,
      noAuditAppend: true,
      noStatsUpdate: true,
      noTradeMutation: true,
    },
  };
}

function mergeWarning(
  warnings: ExecutionRecordCandidateBuilderInvocationWarning[],
  warning: ExecutionRecordCandidateBuilderInvocationWarning,
) {
  pushUnique(warnings, warning);
}

function buildResult(args: {
  input: ExecutionRecordCandidateBuilderInvocationInput;
  validation: ExecutionRecordCandidateBuilderInvocationValidationResult | null;
  status: ExecutionRecordCandidateBuilderInvocationStatus;
  blockedReasons: ExecutionRecordCandidateBuilderInvocationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderInvocationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderInvocationReviewItem[];
  builderCalled: boolean;
  builderResult: ExecutionRecordCreationResult | null;
}): ExecutionRecordCandidateBuilderInvocationResult {
  const prerequisiteSummary = buildPrerequisiteSummary({
    input: args.input,
    validation: args.validation,
    blockedReasons: args.blockedReasons,
    warnings: args.warnings,
    reviewItems: args.reviewItems,
  });
  const inputSourceSummary = buildInputSourceSummary({
    input: args.input,
    validation: args.validation,
    blockedReasons: args.blockedReasons,
    warnings: args.warnings,
    reviewItems: args.reviewItems,
  });

  return {
    contractVersion: EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_CONTRACT_VERSION,
    evaluatedAt: args.input.requestedAt,
    status: args.status,
    decisionRecommendation: decisionFromStatus(args.status),
    input: args.input,
    prerequisiteSummary,
    inputSourceSummary,
    outputSummary: buildOutputSummary({
      builderCalled: args.builderCalled,
      builderResult: args.builderResult,
      blockedReasons: args.blockedReasons,
      warnings: args.warnings,
      reviewItems: args.reviewItems,
    }),
    idempotencySummary: buildIdempotencySummary(args.input),
    auditProvenanceSummary: buildAuditProvenanceSummary(args.input),
    schemaReadinessSummary: buildSchemaReadinessSummary(
      args.input,
      args.validation,
    ),
    safetyPolicy: EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DEFAULT_SAFETY_POLICY,
    blockedReasons: args.blockedReasons,
    warnings: args.warnings,
    reviewItems: args.reviewItems,
    contractOnly: true,
    invocationBoundaryOnly: true,
    candidateOnlyOutputBoundary: true,
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
    invocationImplemented: true,
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
    metadata: {
      pureWrapper: true,
      candidateBuilderCalledInsidePureWrapper: args.builderCalled,
      candidateOutputOnly: true,
      notPersistenceApproval: true,
      noExecutionRecordCreated: true,
      noSupabaseWrite: true,
      noLocalStorageWrite: true,
      noAuditAppend: true,
      noStatsUpdate: true,
      noRollbackCorrection: true,
      noTradeMutation: true,
      noBrokerOrderBehavior: true,
      noAvanzaBrowserBehavior: true,
    },
  };
}

export function invokeExecutionRecordCandidateBuilder(
  input: ExecutionRecordCandidateBuilderInvocationInput,
  options: InvokeExecutionRecordCandidateBuilderOptions = {},
): ExecutionRecordCandidateBuilderInvocationResult {
  const validation = input.invocationValidationResult ?? null;
  const findings = collectValidationFindings(validation);
  const blockedReasons = [...findings.blockedReasons];
  const warnings = [...findings.warnings];
  const reviewItems = [...findings.reviewItems];
  const proposedInput = input.proposedCreationInput ?? null;
  let status = statusFromValidation(validation?.status ?? null);

  if (!proposedInput) {
    pushUnique(blockedReasons, "missing_proposed_execution_record_creation_input");
    pushUnique(warnings, "candidate_builder_not_called");
    pushUnique(reviewItems, "proposed_creation_input_review");
    if (status === "builder_invocation_ready") {
      status = "builder_invocation_blocked";
    }
  }

  if (!isValidValidation(validation) || !proposedInput) {
    if (warnings.length === 0) {
      warnings.push("candidate_builder_not_called");
    }

    return buildResult({
      input,
      validation,
      status,
      blockedReasons,
      warnings,
      reviewItems,
      builderCalled: false,
      builderResult: null,
    });
  }

  const buildCandidate = options.buildCandidate ?? buildExecutionRecordCandidate;
  const builderResult = buildCandidate(proposedInput);
  mergeWarning(warnings, "candidate_builder_called_candidate_only");
  mergeWarning(warnings, "candidate_output_would_be_candidate_only");
  mergeWarning(warnings, "audit_required_before_write");
  mergeWarning(warnings, "duplicate_check_required");
  mergeWarning(warnings, "stats_update_out_of_scope");
  mergeWarning(warnings, "trade_mutation_out_of_scope");
  pushUnique(reviewItems, "candidate_output_boundary_review");
  pushUnique(reviewItems, "persistence_boundary_review");

  if (builderResult.status !== "eligible" || !builderResult.recordCandidate) {
    status = "builder_invocation_needs_review";
    pushUnique(reviewItems, "builder_input_shape_review");
  }

  return buildResult({
    input,
    validation,
    status,
    blockedReasons,
    warnings,
    reviewItems,
    builderCalled: true,
    builderResult,
  });
}
