import {
  EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_STATUSES,
  type ExecutionRecordCandidateBuilderInvocationAuditProvenanceSummary,
  type ExecutionRecordCandidateBuilderInvocationBlockedReason,
  type ExecutionRecordCandidateBuilderInvocationIdempotencySummary,
  type ExecutionRecordCandidateBuilderInvocationInputSourceSummary,
  type ExecutionRecordCandidateBuilderInvocationPrerequisiteSummary,
  type ExecutionRecordCandidateBuilderInvocationResult,
  type ExecutionRecordCandidateBuilderInvocationSchemaReadinessSummary,
  type ExecutionRecordCandidateBuilderInvocationStatus,
} from "@/lib/execution-record-candidate-builder-invocation-contract";
import {
  EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordCandidateBuilderInvocationAuditProvenanceValidationSummary,
  type ExecutionRecordCandidateBuilderInvocationIdempotencyValidationSummary,
  type ExecutionRecordCandidateBuilderInvocationInputSourceValidationSummary,
  type ExecutionRecordCandidateBuilderInvocationPrerequisiteValidationSummary,
  type ExecutionRecordCandidateBuilderInvocationProposedInputValidationSummary,
  type ExecutionRecordCandidateBuilderInvocationSafetyPolicyValidationSummary,
  type ExecutionRecordCandidateBuilderInvocationSchemaReadinessValidationSummary,
  type ExecutionRecordCandidateBuilderInvocationValidationBlockedReason,
  type ExecutionRecordCandidateBuilderInvocationValidationDecisionRecommendation,
  type ExecutionRecordCandidateBuilderInvocationValidationInput,
  type ExecutionRecordCandidateBuilderInvocationValidationResult,
  type ExecutionRecordCandidateBuilderInvocationValidationReviewItem,
  type ExecutionRecordCandidateBuilderInvocationValidationStatus,
  type ExecutionRecordCandidateBuilderInvocationValidationWarning,
} from "@/lib/execution-record-candidate-builder-invocation-validator-contract";
import type { ExecutionRecordCreationInput } from "@/lib/execution-record-creation-contract";

const BASE_WARNINGS: ExecutionRecordCandidateBuilderInvocationValidationWarning[] =
  [
    "validation_only",
    "builder_invocation_ready_not_call_approval",
    "candidate_builder_not_called",
    "candidate_output_not_created",
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
] as const;

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

function isInvocationStatus(
  status: string,
): status is ExecutionRecordCandidateBuilderInvocationStatus {
  return EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_STATUSES.includes(
    status as ExecutionRecordCandidateBuilderInvocationStatus,
  );
}

function decisionForStatus(
  status: ExecutionRecordCandidateBuilderInvocationValidationStatus,
): ExecutionRecordCandidateBuilderInvocationValidationDecisionRecommendation {
  switch (status) {
    case "builder_invocation_validation_valid":
      return "validate_only";
    case "builder_invocation_validation_needs_review":
      return "needs_manual_review";
    case "builder_invocation_validation_unsupported":
      return "unsupported_do_not_call_builder";
    case "builder_invocation_validation_invalid":
      return "invalid_do_not_call_builder";
    case "builder_invocation_validation_blocked":
      return "blocked_do_not_call_builder";
  }
}

function mapInvocationBlockedReason(
  reason: ExecutionRecordCandidateBuilderInvocationBlockedReason,
): ExecutionRecordCandidateBuilderInvocationValidationBlockedReason {
  switch (reason) {
    case "missing_adapter_result":
      return "missing_invocation_result";
    case "missing_adapter_validation":
    case "missing_invocation_validation":
      return "missing_adapter_validation";
    case "adapter_validation_not_valid":
      return "adapter_validation_not_valid";
    case "missing_proposed_execution_record_creation_input":
      return "missing_proposed_input";
    case "missing_required_builder_input_field":
      return "missing_required_proposed_input_field";
    case "missing_idempotency_metadata":
      return "missing_idempotency_summary";
    case "missing_audit_provenance_metadata":
      return "missing_audit_provenance_summary";
    case "missing_schema_readiness":
      return "schema_readiness_absent_or_unknown";
    case "generated_types_absent_or_unknown":
      return "generated_types_absent_or_unknown";
    case "migration_application_not_proven":
      return "migration_application_not_proven";
    case "manual_approval_missing":
      return "manual_approval_missing";
    case "unsupported_source":
      return "unsupported_source";
    case "unsupported_broker":
      return "unsupported_broker";
    case "safety_policy_authority_violation":
      return "safety_policy_authority_violation";
    case "candidate_builder_invocation_not_implemented":
      return "candidate_builder_call_not_allowed";
    case "execution_record_candidate_creation_not_allowed":
      return "execution_record_candidate_creation_not_allowed";
    case "persistence_boundary_not_enabled":
    case "write_authority_not_allowed":
      return "write_authority_not_allowed";
    case "direct_bridge_to_builder_bypass_not_allowed":
    case "direct_finalization_to_builder_bypass_not_allowed":
      return "unsupported_source";
  }
}

function collectAuthorityViolations(
  invocationResult: ExecutionRecordCandidateBuilderInvocationResult | null,
): string[] {
  const violations: string[] = [];
  const resultRecord: Record<string, unknown> | null = hasObject(invocationResult)
    ? invocationResult
    : null;
  const safetyPolicy: Record<string, unknown> | null = hasObject(
    invocationResult?.safetyPolicy,
  )
    ? invocationResult.safetyPolicy
    : null;

  AUTHORITY_FLAG_KEYS.forEach((key) => {
    if (resultRecord?.[key] === true) {
      violations.push(String(key));
    }

    if (safetyPolicy?.[key] === true) {
      violations.push(`safetyPolicy.${String(key)}`);
    }
  });

  return violations;
}

function missingProposedInputFields(
  proposedInput: ExecutionRecordCreationInput | null,
): (keyof ExecutionRecordCreationInput | string)[] {
  if (!proposedInput) {
    return ["proposedCreationInput"];
  }

  const missing: (keyof ExecutionRecordCreationInput | string)[] = [];
  if (!hasText(proposedInput.expectedInstrument?.ticker)) {
    missing.push("expectedInstrument.ticker");
  }
  if (!hasText(proposedInput.expectedAction)) {
    missing.push("expectedAction");
  }
  if (
    typeof proposedInput.expectedQuantity !== "number" ||
    proposedInput.expectedQuantity <= 0
  ) {
    missing.push("expectedQuantity");
  }
  if (!hasText(proposedInput.brokerMetadata?.broker)) {
    missing.push("brokerMetadata.broker");
  }
  if (!hasText(proposedInput.brokerMetadata?.confirmationTimestamp)) {
    missing.push("brokerMetadata.confirmationTimestamp");
  }
  if (!hasText(proposedInput.idempotency?.idempotencyKey)) {
    missing.push("idempotency.idempotencyKey");
  }
  if (!hasText(proposedInput.idempotency?.sourceEvidenceFingerprint)) {
    missing.push("idempotency.sourceEvidenceFingerprint");
  }

  const source = proposedInput.sourceBrokerExecutionResult;
  if (!source) {
    missing.push("sourceBrokerExecutionResult");
  } else {
    if (!hasText(source.side ?? source.action ?? null)) {
      missing.push("sourceBrokerExecutionResult.side");
    }
    if (
      typeof (source.quantity ?? source.filledQuantity ?? source.filled_quantity) !==
        "number" ||
      Number(source.quantity ?? source.filledQuantity ?? source.filled_quantity) <=
        0
    ) {
      missing.push("sourceBrokerExecutionResult.quantity");
    }
    if (
      typeof (source.price ?? source.averageFillPrice ?? source.average_fill_price) !==
        "number" ||
      Number(source.price ?? source.averageFillPrice ?? source.average_fill_price) <=
        0
    ) {
      missing.push("sourceBrokerExecutionResult.price");
    }
    if (!hasText(source.currency)) {
      missing.push("sourceBrokerExecutionResult.currency");
    }
  }

  return missing;
}

function buildProposedInputValidationSummary(args: {
  proposedCreationInput: ExecutionRecordCreationInput | null;
  sourceSummary: ExecutionRecordCandidateBuilderInvocationPrerequisiteSummary | null;
}): ExecutionRecordCandidateBuilderInvocationProposedInputValidationSummary {
  const sourceMissingFields =
    args.sourceSummary?.missingRequiredBuilderInputFields ?? [];
  const localMissingFields = missingProposedInputFields(args.proposedCreationInput);
  const missingRequiredFields = Array.from(
    new Set([...sourceMissingFields, ...localMissingFields]),
  );
  const blockedReasons: ExecutionRecordCandidateBuilderInvocationValidationBlockedReason[] =
    [];
  const warnings: ExecutionRecordCandidateBuilderInvocationValidationWarning[] =
    ["candidate_builder_not_called", "candidate_output_not_created"];
  const reviewItems: ExecutionRecordCandidateBuilderInvocationValidationReviewItem[] =
    [];

  if (!args.proposedCreationInput) {
    blockedReasons.push("missing_proposed_input");
    reviewItems.push("proposed_input_review");
  }

  if (missingRequiredFields.length > 0) {
    blockedReasons.push("missing_required_proposed_input_field");
    reviewItems.push("proposed_input_review");
  }

  const source = args.proposedCreationInput?.sourceBrokerExecutionResult;

  return {
    proposedCreationInput: args.proposedCreationInput,
    proposedInputPresent: Boolean(args.proposedCreationInput),
    requiredFieldsPresent: missingRequiredFields.length === 0,
    missingRequiredFields,
    tickerPresent: hasText(args.proposedCreationInput?.expectedInstrument?.ticker),
    sidePresent: hasText(
      args.proposedCreationInput?.expectedAction ??
        source?.side ??
        source?.action ??
        null,
    ),
    quantityPresent:
      typeof args.proposedCreationInput?.expectedQuantity === "number" ||
      typeof source?.quantity === "number" ||
      typeof source?.filledQuantity === "number" ||
      typeof source?.filled_quantity === "number",
    pricePresent:
      typeof source?.price === "number" ||
      typeof source?.averageFillPrice === "number" ||
      typeof source?.average_fill_price === "number",
    currencyPresent: hasText(source?.currency ?? null),
    feesOrCommissionRepresented: typeof source?.fees === "number",
    fxRepresented: Boolean(source?.metadata && "fxRate" in source.metadata),
    grossNetValuesRepresented:
      typeof source?.grossAmount === "number" ||
      typeof source?.netAmount === "number",
    executionTimestampPresent: hasText(
      source?.confirmationTimestamp ??
        source?.confirmation_timestamp ??
        source?.confirmedAt ??
        source?.confirmed_at ??
        null,
    ),
    settlementOrPaymentDateRepresented: Boolean(
      args.proposedCreationInput?.auditContext?.sourceCaptureStatus,
    ),
    brokerSourceIdentifiersPresent:
      hasText(source?.brokerOrderId ?? source?.broker_order_id ?? null) ||
      hasText(
        source?.brokerConfirmationId ?? source?.broker_confirmation_id ?? null,
      ) ||
      hasText(source?.brokerReference ?? source?.broker_reference ?? null),
    finalNoteOrReferenceRepresented:
      hasText(args.proposedCreationInput?.planningSnapshotRef?.snapshotId) ||
      hasText(args.proposedCreationInput?.planningSnapshotRef?.snapshotVersion),
    sourceEvidenceProvenancePresent: hasText(
      args.proposedCreationInput?.idempotency?.sourceEvidenceFingerprint,
    ),
    idempotencyFingerprintValuesPresent:
      hasText(args.proposedCreationInput?.idempotency?.idempotencyKey) &&
      hasText(args.proposedCreationInput?.idempotency?.sourceEvidenceFingerprint),
    auditProvenanceMetadataPresent: Boolean(
      args.proposedCreationInput?.auditContext,
    ),
    manualApprovalContextPresent:
      args.proposedCreationInput?.auditContext?.createdBy ===
      "manual_user_confirmation",
    finalizationMetadataPresent: Boolean(
      args.proposedCreationInput?.existingTradeRef ||
        args.proposedCreationInput?.planningSnapshotRef,
    ),
    candidateBuilderCalled: false,
    executionRecordCandidateCreated: false,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function buildIdempotencyValidationSummary(
  sourceSummary: ExecutionRecordCandidateBuilderInvocationIdempotencySummary | null,
): ExecutionRecordCandidateBuilderInvocationIdempotencyValidationSummary {
  const missingFingerprints: string[] = [];
  const conflictingFingerprints: string[] = [];
  let blockedReason:
    | ExecutionRecordCandidateBuilderInvocationValidationBlockedReason
    | null = null;

  if (!sourceSummary) {
    blockedReason = "missing_idempotency_summary";
    missingFingerprints.push("idempotencySummary");
  } else {
    if (!sourceSummary.requiredFingerprintsPresent) {
      blockedReason = "missing_required_fingerprint";
    }
    if (!hasText(sourceSummary.intendedExecutionRecordIdempotencyKey)) {
      missingFingerprints.push("intendedExecutionRecordIdempotencyKey");
    }
    if (!hasText(sourceSummary.intendedExecutionRecordCandidateFingerprint)) {
      missingFingerprints.push("intendedExecutionRecordCandidateFingerprint");
    }
    if (!hasText(sourceSummary.sourceEvidenceFingerprint)) {
      missingFingerprints.push("sourceEvidenceFingerprint");
    }
    if (sourceSummary.duplicateDetected || sourceSummary.mismatchRequiresReview) {
      blockedReason = "conflicting_fingerprint";
      conflictingFingerprints.push("duplicate_or_mismatch");
    }
  }

  if (!blockedReason && missingFingerprints.length > 0) {
    blockedReason = "missing_required_fingerprint";
  }

  return {
    sourceSummary,
    requiredFingerprintsPresent:
      Boolean(sourceSummary?.requiredFingerprintsPresent) &&
      missingFingerprints.length === 0,
    missingFingerprints,
    conflictingFingerprints,
    duplicateCheckMetadataPresent: Boolean(sourceSummary?.duplicateCheckRequired),
    duplicateCheckRequired: true,
    duplicateDetectionSeparate: true,
    bridgeFingerprintPreserved: hasText(sourceSummary?.handoffPayloadFingerprint),
    adapterFingerprintPreserved: hasText(
      sourceSummary?.intendedExecutionRecordCandidateFingerprint,
    ),
    invocationFingerprintPreserved: hasText(
      sourceSummary?.builderRecordFingerprint,
    ),
    candidateBuilderFingerprintReady:
      Boolean(sourceSummary?.requiredFingerprintsPresent) &&
      missingFingerprints.length === 0,
    insertBoundaryMustEnforceUniquenessLater: true,
    safeForValidationOnly: true,
    safeForWrite: false,
    blockedReason,
    warning: blockedReason ? "idempotency_review_required" : null,
    reviewItem: blockedReason ? "idempotency_review" : null,
  };
}

function buildAuditProvenanceValidationSummary(
  sourceSummary:
    | ExecutionRecordCandidateBuilderInvocationAuditProvenanceSummary
    | null,
): ExecutionRecordCandidateBuilderInvocationAuditProvenanceValidationSummary {
  let blockedReason:
    | ExecutionRecordCandidateBuilderInvocationValidationBlockedReason
    | null = null;

  if (!sourceSummary || !sourceSummary.auditMetadataPresent) {
    blockedReason = "missing_audit_provenance_summary";
  } else if (!sourceSummary.manualApprovalMetadataPreserved) {
    blockedReason = "manual_approval_missing";
  }

  return {
    sourceSummary,
    sourceEvidenceChainPresent:
      sourceSummary?.sourceEvidenceChainPreserved ?? false,
    finalizationReferencePresent:
      sourceSummary?.finalizationReferencePreserved ?? false,
    bridgeReferencePresent: sourceSummary?.bridgeReferencePreserved ?? false,
    adapterValidationReferencePresent:
      sourceSummary?.adapterValidationReferencePreserved ?? false,
    manualApprovalContextPresent:
      sourceSummary?.manualApprovalMetadataPreserved ?? false,
    handoffSessionIdPresent: hasText(sourceSummary?.handoffSessionId),
    payloadIdPresent: hasText(sourceSummary?.payloadId),
    sourceEventIdsPresent: Boolean(sourceSummary?.sourceEventIds.length),
    beforeAfterValuesRequiredLater: true,
    auditAppendSeparate: true,
    correctionRollbackSeparate: true,
    auditAppendAttempted: false,
    rollbackAttempted: false,
    safeForValidationOnly: true,
    safeForWrite: false,
    blockedReason,
    warning: blockedReason ? "audit_required_before_write" : null,
    reviewItem:
      blockedReason === "manual_approval_missing"
        ? "manual_approval_review"
        : blockedReason
          ? "audit_provenance_review"
          : null,
  };
}

function buildSchemaReadinessValidationSummary(
  sourceSummary:
    | ExecutionRecordCandidateBuilderInvocationSchemaReadinessSummary
    | null,
): ExecutionRecordCandidateBuilderInvocationSchemaReadinessValidationSummary {
  const blockedReasons: ExecutionRecordCandidateBuilderInvocationValidationBlockedReason[] =
    [];
  const warnings: ExecutionRecordCandidateBuilderInvocationValidationWarning[] =
    [];
  const reviewItems: ExecutionRecordCandidateBuilderInvocationValidationReviewItem[] =
    [];

  if (!sourceSummary?.schemaReadinessMetadataPresent) {
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
    generatedTypesStatus: sourceSummary?.generatedTypesAvailable
      ? "generated_types_present"
      : sourceSummary
        ? "generated_types_absent"
        : "generated_types_unknown",
    migrationApplicationProven:
      sourceSummary?.migrationApplicationProven ?? false,
    migrationApplicationStatus: sourceSummary?.migrationApplicationProven
      ? "migration_application_proven"
      : sourceSummary
        ? "migration_application_unproven"
        : "migration_application_unknown",
    schemaReadinessMustNotBeAssumed: true,
    candidateOnlyInvocationMayBeValidWithReview:
      blockedReasons.length > 0 &&
      blockedReasons.every((reason) =>
        [
          "schema_readiness_absent_or_unknown",
          "generated_types_absent_or_unknown",
          "migration_application_not_proven",
        ].includes(reason),
      ),
    persistenceCouplingBlockedUntilSchemaReady: true,
    runtimeDbWritesAllowed: false,
    safeToPersist: false,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function buildSafetyPolicyValidationSummary(args: {
  invocationResult: ExecutionRecordCandidateBuilderInvocationResult | null;
  unexpectedTrueAuthorityFlags: string[];
}): ExecutionRecordCandidateBuilderInvocationSafetyPolicyValidationSummary {
  const hasViolations = args.unexpectedTrueAuthorityFlags.length > 0;

  return {
    validationOnly: true,
    safetyPolicyPresent: Boolean(args.invocationResult?.safetyPolicy),
    sourceSafetyPolicy: args.invocationResult?.safetyPolicy ?? null,
    authorityFlags:
      EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DEFAULT_AUTHORITY_FLAGS,
    allAuthorityFlagsFalse: !hasViolations,
    unexpectedTrueAuthorityFlags: args.unexpectedTrueAuthorityFlags,
    automaticModeAllowed: false,
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

function buildPrerequisiteValidationSummary(args: {
  sourceSummary: ExecutionRecordCandidateBuilderInvocationPrerequisiteSummary | null;
  invocationResultPresent: boolean;
  invocationStatusRecognized: boolean;
  invocationStatus: ExecutionRecordCandidateBuilderInvocationStatus | null;
  adapterValidationValid: boolean;
  proposedInputPresent: boolean;
  schemaReadinessPresent: boolean;
  idempotencySummaryPresent: boolean;
  auditProvenanceSummaryPresent: boolean;
  safetyPolicyPresent: boolean;
  allAuthorityFlagsFalse: boolean;
}): ExecutionRecordCandidateBuilderInvocationPrerequisiteValidationSummary {
  const blockedReasons: ExecutionRecordCandidateBuilderInvocationValidationBlockedReason[] =
    [];
  const warnings: ExecutionRecordCandidateBuilderInvocationValidationWarning[] =
    [];
  const reviewItems: ExecutionRecordCandidateBuilderInvocationValidationReviewItem[] =
    [];

  if (!args.invocationResultPresent) {
    blockedReasons.push("missing_invocation_result");
    reviewItems.push("invocation_result_review");
  }
  if (!args.invocationStatusRecognized) {
    blockedReasons.push("invalid_invocation_status");
    reviewItems.push("invocation_status_review");
  }
  if (!args.sourceSummary?.adapterValidationResultPresent) {
    blockedReasons.push("missing_adapter_validation");
    reviewItems.push("adapter_validation_review");
  }
  if (!args.adapterValidationValid) {
    blockedReasons.push("adapter_validation_not_valid");
    reviewItems.push("adapter_validation_review");
  }
  if (!args.proposedInputPresent) {
    blockedReasons.push("missing_proposed_input");
    reviewItems.push("proposed_input_review");
  }
  if (!args.schemaReadinessPresent) {
    blockedReasons.push("schema_readiness_absent_or_unknown");
    reviewItems.push("schema_readiness_review");
  }
  if (!args.idempotencySummaryPresent) {
    blockedReasons.push("missing_idempotency_summary");
    warnings.push("idempotency_review_required");
    reviewItems.push("idempotency_review");
  }
  if (!args.auditProvenanceSummaryPresent) {
    blockedReasons.push("missing_audit_provenance_summary");
    warnings.push("audit_required_before_write");
    reviewItems.push("audit_provenance_review");
  }
  if (!args.allAuthorityFlagsFalse) {
    blockedReasons.push("safety_policy_authority_violation");
    reviewItems.push("safety_policy_review");
  }

  return {
    sourceSummary: args.sourceSummary,
    invocationResultPresent: args.invocationResultPresent,
    invocationStatusRecognized: args.invocationStatusRecognized,
    invocationStatus: args.invocationStatus,
    invocationReadyWithRequiredSummaries:
      args.invocationStatus === "builder_invocation_ready" &&
      args.adapterValidationValid &&
      args.proposedInputPresent &&
      args.schemaReadinessPresent &&
      args.idempotencySummaryPresent &&
      args.auditProvenanceSummaryPresent &&
      args.safetyPolicyPresent &&
      args.allAuthorityFlagsFalse,
    invocationReadyWithBlockedReasons:
      args.invocationStatus === "builder_invocation_ready" &&
      Boolean(args.sourceSummary?.blockedReasons.length),
    adapterValidationPresent:
      args.sourceSummary?.adapterValidationResultPresent ?? false,
    adapterValidationValidOrReviewGated: args.adapterValidationValid,
    proposedInputPresent: args.proposedInputPresent,
    proposedInputComplete:
      args.sourceSummary?.proposedCreationInputComplete ?? false,
    schemaReadinessPresent: args.schemaReadinessPresent,
    idempotencySummaryPresent: args.idempotencySummaryPresent,
    auditProvenanceSummaryPresent: args.auditProvenanceSummaryPresent,
    safetyPolicyPresent: args.safetyPolicyPresent,
    allAuthorityFlagsFalse: args.allAuthorityFlagsFalse,
    candidateBuilderCallOccurred: false,
    canValidateInvocationBoundary:
      args.invocationResultPresent && args.invocationStatusRecognized,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function buildInputSourceValidationSummary(
  sourceSummary: ExecutionRecordCandidateBuilderInvocationInputSourceSummary | null,
): ExecutionRecordCandidateBuilderInvocationInputSourceValidationSummary {
  const blockedReason =
    sourceSummary?.inputComesFromAdapterShapedProposedInput === false ||
    sourceSummary?.adapterOutputValidated === false
      ? "unsupported_source"
      : null;

  return {
    sourceSummary,
    adapterResultPresent: Boolean(sourceSummary?.adapterResult),
    adapterValidationPresent: Boolean(sourceSummary?.adapterValidationResult),
    adapterOutputValidated: sourceSummary?.adapterOutputValidated ?? false,
    proposedInputComesFromAdapter:
      sourceSummary?.inputComesFromAdapterShapedProposedInput ?? false,
    bridgeMapperResultPresent: Boolean(
      sourceSummary?.adapterPreconditionSummary?.bridgeMapperResultPresent,
    ),
    bridgeValidationResultPresent: Boolean(
      sourceSummary?.adapterPreconditionSummary?.bridgeValidationPresent,
    ),
    finalizationCandidatePresent: Boolean(
      sourceSummary?.adapterPreconditionSummary?.finalizationCandidatePresent,
    ),
    directBridgeToBuilderBypassAttempted: false,
    directFinalizationToBuilderBypassAttempted: false,
    liveBrokerOrAvanzaDataConsumed: false,
    routeOrStorageBypassAttempted: false,
    blockedReason,
    warning: blockedReason ? "validation_only" : null,
    reviewItem: blockedReason ? "invocation_result_review" : null,
  };
}

function addSummaryFindings(args: {
  blockedReasons: ExecutionRecordCandidateBuilderInvocationValidationBlockedReason[];
  warnings: ExecutionRecordCandidateBuilderInvocationValidationWarning[];
  reviewItems: ExecutionRecordCandidateBuilderInvocationValidationReviewItem[];
  summary:
    | ExecutionRecordCandidateBuilderInvocationPrerequisiteValidationSummary
    | ExecutionRecordCandidateBuilderInvocationProposedInputValidationSummary
    | ExecutionRecordCandidateBuilderInvocationSchemaReadinessValidationSummary;
}) {
  args.summary.blockedReasons.forEach((reason) =>
    pushUnique(args.blockedReasons, reason),
  );
  args.summary.warnings.forEach((warning) =>
    pushUnique(args.warnings, warning),
  );
  args.summary.reviewItems.forEach((item) =>
    pushUnique(args.reviewItems, item),
  );
}

function determineStatus(args: {
  statusHints: ExecutionRecordCandidateBuilderInvocationValidationStatus[];
  blockedReasons: ExecutionRecordCandidateBuilderInvocationValidationBlockedReason[];
  reviewItems: ExecutionRecordCandidateBuilderInvocationValidationReviewItem[];
}): ExecutionRecordCandidateBuilderInvocationValidationStatus {
  if (args.statusHints.includes("builder_invocation_validation_invalid")) {
    return "builder_invocation_validation_invalid";
  }
  if (args.statusHints.includes("builder_invocation_validation_unsupported")) {
    return "builder_invocation_validation_unsupported";
  }
  if (args.statusHints.includes("builder_invocation_validation_blocked")) {
    return "builder_invocation_validation_blocked";
  }

  const reviewOnlyReasons = new Set<
    ExecutionRecordCandidateBuilderInvocationValidationBlockedReason
  >([
    "schema_readiness_absent_or_unknown",
    "generated_types_absent_or_unknown",
    "migration_application_not_proven",
  ]);
  const hardBlocked = args.blockedReasons.some(
    (reason) => !reviewOnlyReasons.has(reason),
  );

  if (hardBlocked) {
    return "builder_invocation_validation_blocked";
  }

  if (
    args.statusHints.includes("builder_invocation_validation_needs_review") ||
    args.blockedReasons.length > 0 ||
    args.reviewItems.length > 0
  ) {
    return "builder_invocation_validation_needs_review";
  }

  return "builder_invocation_validation_valid";
}

export function validateExecutionRecordCandidateBuilderInvocation(
  input: ExecutionRecordCandidateBuilderInvocationValidationInput,
): ExecutionRecordCandidateBuilderInvocationValidationResult {
  const invocationResult = input.invocationResult ?? null;
  const invocationStatusText =
    typeof invocationResult?.status === "string"
      ? invocationResult.status
      : String(invocationResult?.status ?? "");
  const invocationStatus = isInvocationStatus(invocationStatusText)
    ? invocationStatusText
    : null;
  const blockedReasons: ExecutionRecordCandidateBuilderInvocationValidationBlockedReason[] =
    [];
  const warnings = [...BASE_WARNINGS];
  const reviewItems: ExecutionRecordCandidateBuilderInvocationValidationReviewItem[] =
    [];
  const statusHints: ExecutionRecordCandidateBuilderInvocationValidationStatus[] =
    [];

  if (!invocationResult) {
    pushUnique(blockedReasons, "missing_invocation_result");
    pushUnique(reviewItems, "invocation_result_review");
    statusHints.push("builder_invocation_validation_blocked");
  } else if (!invocationStatus) {
    pushUnique(blockedReasons, "invalid_invocation_status");
    pushUnique(reviewItems, "invocation_status_review");
    statusHints.push("builder_invocation_validation_invalid");
  } else {
    switch (invocationStatus) {
      case "builder_invocation_ready":
        break;
      case "builder_invocation_needs_review":
        pushUnique(reviewItems, "invocation_status_review");
        statusHints.push("builder_invocation_validation_needs_review");
        break;
      case "builder_invocation_blocked":
        pushUnique(blockedReasons, "invalid_invocation_status");
        pushUnique(reviewItems, "invocation_status_review");
        statusHints.push("builder_invocation_validation_blocked");
        break;
      case "builder_invocation_unsupported":
        pushUnique(blockedReasons, "unsupported_source");
        pushUnique(reviewItems, "invocation_status_review");
        statusHints.push("builder_invocation_validation_unsupported");
        break;
      case "builder_invocation_not_ready":
        pushUnique(blockedReasons, "invalid_invocation_status");
        pushUnique(reviewItems, "invocation_status_review");
        statusHints.push("builder_invocation_validation_blocked");
        break;
    }
  }

  invocationResult?.blockedReasons.forEach((reason) => {
    pushUnique(blockedReasons, mapInvocationBlockedReason(reason));
    if (invocationResult.status === "builder_invocation_ready") {
      pushUnique(blockedReasons, "invocation_ready_with_blocked_reasons");
    }
  });
  invocationResult?.warnings.forEach((warning) => {
    switch (warning) {
      case "generated_types_required_later":
        pushUnique(warnings, "generated_types_required_later");
        break;
      case "migration_application_required_later":
        pushUnique(warnings, "migration_application_required_later");
        break;
      case "audit_required_before_write":
        pushUnique(warnings, "audit_required_before_write");
        break;
      case "idempotency_review_required":
        pushUnique(warnings, "idempotency_review_required");
        break;
      case "duplicate_check_required":
        pushUnique(warnings, "duplicate_check_required");
        break;
      case "stats_update_out_of_scope":
        pushUnique(warnings, "stats_update_out_of_scope");
        break;
      case "trade_mutation_out_of_scope":
        pushUnique(warnings, "trade_mutation_out_of_scope");
        break;
      case "contract_only":
      case "builder_invocation_not_implemented":
      case "candidate_builder_not_called":
      case "candidate_builder_called_candidate_only":
      case "candidate_output_would_be_candidate_only":
        pushUnique(warnings, "validation_only");
        break;
    }
  });

  const authorityViolations = collectAuthorityViolations(invocationResult);
  const proposedCreationInput =
    input.proposedCreationInput ??
    invocationResult?.input?.proposedCreationInput ??
    null;
  const prerequisiteSource = invocationResult?.prerequisiteSummary ?? null;
  const inputSource = invocationResult?.inputSourceSummary ?? null;
  const schemaReadiness =
    invocationResult?.schemaReadinessSummary ??
    (input.schemaReadinessMetadata as
      | ExecutionRecordCandidateBuilderInvocationSchemaReadinessSummary
      | null) ??
    null;
  const idempotency =
    invocationResult?.idempotencySummary ??
    (input.idempotencyMetadata as
      | ExecutionRecordCandidateBuilderInvocationIdempotencySummary
      | null) ??
    null;
  const auditProvenance =
    invocationResult?.auditProvenanceSummary ??
    (input.auditProvenanceMetadata as
      | ExecutionRecordCandidateBuilderInvocationAuditProvenanceSummary
      | null) ??
    null;

  const adapterValidationValid =
    invocationResult?.prerequisiteSummary.adapterValidationValid === true &&
    input.adapterValidationResult?.status === "adapter_validation_valid";
  const safetyPolicyValidationSummary = buildSafetyPolicyValidationSummary({
    invocationResult,
    unexpectedTrueAuthorityFlags: authorityViolations,
  });
  const prerequisiteValidationSummary = buildPrerequisiteValidationSummary({
    sourceSummary: prerequisiteSource,
    invocationResultPresent: Boolean(invocationResult),
    invocationStatusRecognized: Boolean(invocationStatus),
    invocationStatus,
    adapterValidationValid,
    proposedInputPresent: Boolean(proposedCreationInput),
    schemaReadinessPresent: Boolean(schemaReadiness?.schemaReadinessMetadataPresent),
    idempotencySummaryPresent: Boolean(idempotency),
    auditProvenanceSummaryPresent: Boolean(auditProvenance),
    safetyPolicyPresent: Boolean(invocationResult?.safetyPolicy),
    allAuthorityFlagsFalse:
      safetyPolicyValidationSummary.allAuthorityFlagsFalse,
  });
  const inputSourceValidationSummary =
    buildInputSourceValidationSummary(inputSource);
  const proposedInputValidationSummary = buildProposedInputValidationSummary({
    proposedCreationInput,
    sourceSummary: prerequisiteSource,
  });
  const idempotencyValidationSummary =
    buildIdempotencyValidationSummary(idempotency);
  const auditProvenanceValidationSummary =
    buildAuditProvenanceValidationSummary(auditProvenance);
  const schemaReadinessValidationSummary =
    buildSchemaReadinessValidationSummary(schemaReadiness);

  [
    prerequisiteValidationSummary,
    proposedInputValidationSummary,
    schemaReadinessValidationSummary,
  ].forEach((summary) => {
    addSummaryFindings({
      blockedReasons,
      warnings,
      reviewItems,
      summary,
    });
  });

  if (inputSourceValidationSummary.blockedReason) {
    pushUnique(blockedReasons, inputSourceValidationSummary.blockedReason);
  }
  if (inputSourceValidationSummary.warning) {
    pushUnique(warnings, inputSourceValidationSummary.warning);
  }
  if (inputSourceValidationSummary.reviewItem) {
    pushUnique(reviewItems, inputSourceValidationSummary.reviewItem);
  }
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
    pushUnique(blockedReasons, "candidate_builder_call_not_allowed");
    pushUnique(blockedReasons, "write_authority_not_allowed");
    statusHints.push("builder_invocation_validation_invalid");
  }
  if (safetyPolicyValidationSummary.warning) {
    pushUnique(warnings, safetyPolicyValidationSummary.warning);
  }
  if (safetyPolicyValidationSummary.reviewItem) {
    pushUnique(reviewItems, safetyPolicyValidationSummary.reviewItem);
  }

  const status = determineStatus({
    statusHints,
    blockedReasons,
    reviewItems,
  });

  return {
    contractVersion:
      EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATOR_CONTRACT_VERSION,
    evaluatedAt: input.requestedAt,
    status,
    decisionRecommendation: decisionForStatus(status),
    input,
    prerequisiteValidationSummary,
    inputSourceValidationSummary,
    proposedInputValidationSummary,
    idempotencyValidationSummary,
    auditProvenanceValidationSummary,
    schemaReadinessValidationSummary,
    safetyPolicyValidationSummary,
    authorityFlags:
      EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DEFAULT_AUTHORITY_FLAGS,
    blockedReasons,
    warnings,
    reviewItems,
    validationOnly: true,
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
