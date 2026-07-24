import {
  shapeExecutionRecordPersistenceValidatorInput,
} from "@/lib/execution-record-persistence-validator-integration-adapter";
import {
  EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_CONTRACT_VERSION,
  type ExecutionRecordPersistenceValidatorIntegrationAdapterBlockedReason,
  type ExecutionRecordPersistenceValidatorIntegrationAdapterInput,
  type ExecutionRecordPersistenceValidatorIntegrationAdapterResult,
} from "@/lib/execution-record-persistence-validator-integration-adapter-contract";
import {
  EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATOR_CONTRACT_VERSION,
  EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATOR_DEFAULT_AUTHORITY_FLAGS,
  type ExecutionRecordPersistenceValidatorIntegrationAuthorityFlags,
  type ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason,
  type ExecutionRecordPersistenceValidatorIntegrationValidationInput,
  type ExecutionRecordPersistenceValidatorIntegrationValidationResult,
} from "@/lib/execution-record-persistence-validator-integration-validator-contract";
import {
  validateExecutionRecordPersistenceIntegration,
} from "@/lib/execution-record-persistence-validator-integration-validator";

export const EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_READINESS_VERSION =
  "execution_record_persistence_validator_integration_readiness_v1" as const;

export type ExecutionRecordPersistenceValidatorIntegrationReadinessStatus =
  | "persistence_validator_integration_ready"
  | "persistence_validator_integration_needs_review"
  | "persistence_validator_integration_blocked"
  | "persistence_validator_integration_unsupported"
  | "persistence_validator_integration_invalid";

export type ExecutionRecordPersistenceValidatorIntegrationDecisionRecommendation =
  | "readiness_validated_do_not_persist"
  | "needs_manual_review"
  | "blocked_do_not_call_persistence_validator"
  | "unsupported_do_not_call_persistence_validator"
  | "invalid_do_not_call_persistence_validator";

export type ExecutionRecordPersistenceValidatorIntegrationBlockedReason =
  | "missing_adapter_input"
  | "missing_candidate_builder_invocation_result"
  | "missing_candidate_only_builder_output"
  | "adapter_blocked"
  | "adapter_not_ready"
  | "adapter_unsupported"
  | "validator_blocked"
  | "validator_invalid"
  | "validator_unsupported"
  | "generated_types_absent_or_unknown"
  | "migration_application_not_proven"
  | "missing_rls_security_proof"
  | "missing_server_only_write_boundary"
  | "missing_dry_run_route_status"
  | "authority_violation";

export type ExecutionRecordPersistenceValidatorIntegrationWarning =
  | "readiness_only_not_write_approval"
  | "actual_persistence_validator_not_called"
  | "insert_route_not_called"
  | "execution_record_creation_not_attempted"
  | "persistence_not_attempted"
  | "audit_append_not_attempted"
  | "stats_update_not_attempted"
  | "rollback_not_attempted"
  | "trade_mutation_not_attempted"
  | "broker_order_behavior_not_attempted"
  | "browser_avanza_behavior_not_attempted";

export type ExecutionRecordPersistenceValidatorIntegrationReviewItem =
  | "candidate_builder_invocation_review"
  | "candidate_only_builder_output_review"
  | "adapter_result_review"
  | "integration_validator_result_review"
  | "actual_persistence_validator_boundary_review"
  | "generated_types_review"
  | "migration_application_review"
  | "rls_security_review"
  | "server_only_write_boundary_review"
  | "dry_run_route_review"
  | "authority_flags_review"
  | "production_write_boundary_review";

export type ExecutionRecordPersistenceValidatorBoundarySummary = {
  status: "not_called_future_boundary";
  called: false;
  reason: string;
  safeToCallPersistenceValidator: false;
  persistenceValidatorCallAttempted: false;
  requiresGeneratedTypesProof: true;
  requiresMigrationApplicationProof: true;
  requiresRlsSecurityProof: true;
  requiresServerOnlyWriteBoundary: true;
  requiresDryRunRouteProof: true;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceValidatorIntegrationReadinessInput = {
  contractVersion?: typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_READINESS_VERSION;
  requestedAt: string;
  adapterInput?: ExecutionRecordPersistenceValidatorIntegrationAdapterInput | null;
  validationInputOverrides?: Partial<ExecutionRecordPersistenceValidatorIntegrationValidationInput>;
  generatedTypesStatus?: "available" | "absent" | "unknown" | null;
  migrationApplicationStatus?: "proven" | "not_proven" | "unknown" | null;
  rlsSecurityStatus?: "proven" | "missing" | "unknown" | null;
  serverOnlyWriteBoundaryStatus?: "proven" | "missing" | "unknown" | null;
  dryRunInsertRouteStatus?: "known" | "missing" | "unknown" | null;
  authorityFlags?: ExecutionRecordPersistenceValidatorIntegrationAuthorityFlags | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordPersistenceValidatorIntegrationReadinessResult = {
  contractVersion: typeof EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_READINESS_VERSION;
  evaluatedAt: string;
  status: ExecutionRecordPersistenceValidatorIntegrationReadinessStatus;
  decisionRecommendation: ExecutionRecordPersistenceValidatorIntegrationDecisionRecommendation;
  input?: ExecutionRecordPersistenceValidatorIntegrationReadinessInput | null;
  adapterInput?: ExecutionRecordPersistenceValidatorIntegrationAdapterInput | null;
  adapterResult?: ExecutionRecordPersistenceValidatorIntegrationAdapterResult | null;
  validationInput?: ExecutionRecordPersistenceValidatorIntegrationValidationInput | null;
  validationResult?: ExecutionRecordPersistenceValidatorIntegrationValidationResult | null;
  actualPersistenceValidatorBoundarySummary: ExecutionRecordPersistenceValidatorBoundarySummary;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationBlockedReason[];
  warnings: ExecutionRecordPersistenceValidatorIntegrationWarning[];
  reviewItems: ExecutionRecordPersistenceValidatorIntegrationReviewItem[];
  authorityFlags: ExecutionRecordPersistenceValidatorIntegrationAuthorityFlags;
  integrationOnly: true;
  readinessOnly: true;
  candidateOnlyOutputBoundary: true;
  safeToCallPersistenceValidator: false;
  safeToCallInsertRoute: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  safeToFinalize: false;
  safeToUpdateStats: false;
  safeToAppendAudit: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  safeToRunBrokerAction: false;
  automaticModeAllowed: false;
  actualPersistenceValidatorCalled: false;
  persistenceValidatorCallAttempted: false;
  insertRouteCallAttempted: false;
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

function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function hasCandidateOnlyBuilderOutput(
  adapterInput: ExecutionRecordPersistenceValidatorIntegrationAdapterInput,
): boolean {
  return (
    adapterInput.candidateOutput !== null &&
      adapterInput.candidateOutput !== undefined ||
    adapterInput.proposedPersistenceInput?.candidate !== null &&
      adapterInput.proposedPersistenceInput?.candidate !== undefined ||
    adapterInput.invocationResult?.outputSummary.candidateOutput !== null &&
      adapterInput.invocationResult?.outputSummary.candidateOutput !== undefined
  );
}

function hasAuthorityViolation(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const flags = value as Record<string, unknown>;

  return [
    flags.safeToCallPersistenceValidator,
    flags.safeToCallInsertRoute,
    flags.safeToCreateExecutionRecord,
    flags.safeToPersist,
    flags.safeToFinalize,
    flags.safeToUpdateStats,
    flags.safeToAppendAudit,
    flags.safeToRollback,
    flags.safeToMutateTrade,
    flags.safeToRunBrokerAction,
    flags.automaticModeAllowed,
    flags.persistenceValidatorCallAttempted,
    flags.insertRouteCallAttempted,
    flags.executionRecordCreationAttempted,
    flags.persistenceAttempted,
    flags.finalizationAttempted,
    flags.statsUpdateAttempted,
    flags.auditAppendAttempted,
    flags.rollbackAttempted,
    flags.tradeMutationAttempted,
    flags.brokerAutomationAttempted,
    flags.avanzaAutomationAttempted,
    flags.browserAutomationAttempted,
  ].some((flag) => flag === true);
}

function mapAdapterReason(
  reason: ExecutionRecordPersistenceValidatorIntegrationAdapterBlockedReason,
): ExecutionRecordPersistenceValidatorIntegrationBlockedReason | null {
  if (reason === "generated_types_absent_or_unknown") {
    return "generated_types_absent_or_unknown";
  }

  if (reason === "migration_application_not_proven") {
    return "migration_application_not_proven";
  }

  if (reason === "missing_rls_security_proof") {
    return "missing_rls_security_proof";
  }

  if (reason === "missing_server_only_write_boundary") {
    return "missing_server_only_write_boundary";
  }

  if (reason === "missing_dry_run_route_status") {
    return "missing_dry_run_route_status";
  }

  if (reason === "safety_policy_authority_violation") {
    return "authority_violation";
  }

  return null;
}

function mapValidatorReason(
  reason: ExecutionRecordPersistenceValidatorIntegrationValidationBlockedReason,
): ExecutionRecordPersistenceValidatorIntegrationBlockedReason | null {
  if (reason === "generated_types_absent_or_unknown") {
    return "generated_types_absent_or_unknown";
  }

  if (reason === "migration_application_not_proven") {
    return "migration_application_not_proven";
  }

  if (reason === "missing_rls_security_proof") {
    return "missing_rls_security_proof";
  }

  if (reason === "missing_server_only_write_boundary") {
    return "missing_server_only_write_boundary";
  }

  if (reason === "missing_dry_run_route_status") {
    return "missing_dry_run_route_status";
  }

  if (reason === "safety_policy_authority_violation") {
    return "authority_violation";
  }

  return null;
}

function resolveGeneratedTypesStatus(
  input: ExecutionRecordPersistenceValidatorIntegrationReadinessInput,
  adapterResult: ExecutionRecordPersistenceValidatorIntegrationAdapterResult,
): ExecutionRecordPersistenceValidatorIntegrationValidationInput["generatedTypesStatus"] {
  return input.generatedTypesStatus ??
    (adapterResult.schemaReadinessSummary.generatedTypesAvailable &&
      adapterResult.schemaReadinessSummary.generatedTypesReviewed
      ? "available"
      : "unknown");
}

function resolveMigrationApplicationStatus(
  input: ExecutionRecordPersistenceValidatorIntegrationReadinessInput,
  adapterResult: ExecutionRecordPersistenceValidatorIntegrationAdapterResult,
): ExecutionRecordPersistenceValidatorIntegrationValidationInput["migrationApplicationStatus"] {
  return input.migrationApplicationStatus ??
    (adapterResult.schemaReadinessSummary.migrationApplicationProven
      ? "proven"
      : "unknown");
}

function resolveRlsSecurityStatus(
  input: ExecutionRecordPersistenceValidatorIntegrationReadinessInput,
  adapterResult: ExecutionRecordPersistenceValidatorIntegrationAdapterResult,
): ExecutionRecordPersistenceValidatorIntegrationValidationInput["rlsSecurityStatus"] {
  return input.rlsSecurityStatus ??
    (adapterResult.securitySummary.rlsSecurityProofPresent ? "proven" : "unknown");
}

function resolveServerOnlyWriteBoundaryStatus(
  input: ExecutionRecordPersistenceValidatorIntegrationReadinessInput,
  adapterResult: ExecutionRecordPersistenceValidatorIntegrationAdapterResult,
): ExecutionRecordPersistenceValidatorIntegrationValidationInput["serverOnlyWriteBoundaryStatus"] {
  return input.serverOnlyWriteBoundaryStatus ??
    (adapterResult.securitySummary.serverOnlyWriteBoundaryPresent
      ? "proven"
      : "unknown");
}

function resolveDryRunInsertRouteStatus(
  input: ExecutionRecordPersistenceValidatorIntegrationReadinessInput,
  adapterResult: ExecutionRecordPersistenceValidatorIntegrationAdapterResult,
): ExecutionRecordPersistenceValidatorIntegrationValidationInput["dryRunInsertRouteStatus"] {
  return input.dryRunInsertRouteStatus ??
    (adapterResult.dryRunRouteSummary.dryRunRouteKnown ? "known" : "unknown");
}

function buildValidationInput(
  input: ExecutionRecordPersistenceValidatorIntegrationReadinessInput,
  adapterInput: ExecutionRecordPersistenceValidatorIntegrationAdapterInput,
  adapterResult: ExecutionRecordPersistenceValidatorIntegrationAdapterResult,
): ExecutionRecordPersistenceValidatorIntegrationValidationInput {
  return {
    contractVersion:
      EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATOR_CONTRACT_VERSION,
    requestedAt: input.requestedAt,
    adapterInput,
    adapterResult,
    proposedPersistenceInput: adapterInput.proposedPersistenceInput,
    proposedInputSummary: adapterResult.proposedInputSummary,
    readinessSummary: adapterResult.preconditionSummary,
    invocationResult: adapterInput.invocationResult,
    candidateOnlyBuilderOutput: adapterInput.candidateOutput,
    candidateOnlyBuilderOutputSummary:
      adapterResult.fieldMappingSummary.invocationOutputSummary,
    schemaReadinessSummary: adapterResult.schemaReadinessSummary,
    idempotencySummary: adapterResult.idempotencySummary,
    auditCorrectionSummary: adapterResult.auditCorrectionSummary,
    securitySummary: adapterResult.securitySummary,
    dryRunRouteSummary: adapterResult.dryRunRouteSummary,
    manualApprovalContext: adapterInput.manualApprovalContext,
    authorityFlags:
      input.authorityFlags ??
      EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATOR_DEFAULT_AUTHORITY_FLAGS,
    generatedTypesStatus: resolveGeneratedTypesStatus(input, adapterResult),
    migrationApplicationStatus: resolveMigrationApplicationStatus(
      input,
      adapterResult,
    ),
    rlsSecurityStatus: resolveRlsSecurityStatus(input, adapterResult),
    serverOnlyWriteBoundaryStatus: resolveServerOnlyWriteBoundaryStatus(
      input,
      adapterResult,
    ),
    dryRunInsertRouteStatus: resolveDryRunInsertRouteStatus(
      input,
      adapterResult,
    ),
    metadata: {
      ...input.metadata,
      integrationOnly: true,
      readinessOnly: true,
      noActualPersistenceValidatorCall: true,
      noInsertRouteCall: true,
      noExecutionRecordCreation: true,
      noPersistence: true,
    },
    ...input.validationInputOverrides,
  };
}

function collectBlockedReasons(input: {
  adapterInput: ExecutionRecordPersistenceValidatorIntegrationAdapterInput | null;
  adapterResult: ExecutionRecordPersistenceValidatorIntegrationAdapterResult | null;
  validationResult: ExecutionRecordPersistenceValidatorIntegrationValidationResult | null;
  authorityFlags: ExecutionRecordPersistenceValidatorIntegrationAuthorityFlags;
}): ExecutionRecordPersistenceValidatorIntegrationBlockedReason[] {
  const blockedReasons: ExecutionRecordPersistenceValidatorIntegrationBlockedReason[] =
    [];

  if (!input.adapterInput) {
    blockedReasons.push("missing_adapter_input");
  } else {
    if (!input.adapterInput.invocationResult) {
      blockedReasons.push("missing_candidate_builder_invocation_result");
    }

    if (!hasCandidateOnlyBuilderOutput(input.adapterInput)) {
      blockedReasons.push("missing_candidate_only_builder_output");
    }
  }

  if (input.adapterResult) {
    if (input.adapterResult.status === "persistence_adapter_unsupported") {
      blockedReasons.push("adapter_unsupported");
    } else if (input.adapterResult.status === "persistence_adapter_blocked") {
      blockedReasons.push("adapter_blocked");
    } else if (input.adapterResult.status === "persistence_adapter_not_ready") {
      blockedReasons.push("adapter_not_ready");
    }

    blockedReasons.push(
      ...input.adapterResult.blockedReasons
        .map(mapAdapterReason)
        .filter(
          (
            reason,
          ): reason is ExecutionRecordPersistenceValidatorIntegrationBlockedReason =>
            reason !== null,
        ),
    );
  }

  if (input.validationResult) {
    if (
      input.validationResult.status ===
      "persistence_integration_validation_unsupported"
    ) {
      blockedReasons.push("validator_unsupported");
    } else if (
      input.validationResult.status === "persistence_integration_validation_invalid"
    ) {
      blockedReasons.push("validator_invalid");
    } else if (
      input.validationResult.status === "persistence_integration_validation_blocked"
    ) {
      blockedReasons.push("validator_blocked");
    }

    blockedReasons.push(
      ...input.validationResult.blockedReasons
        .map(mapValidatorReason)
        .filter(
          (
            reason,
          ): reason is ExecutionRecordPersistenceValidatorIntegrationBlockedReason =>
            reason !== null,
        ),
    );
  }

  if (hasAuthorityViolation(input.authorityFlags)) {
    blockedReasons.push("authority_violation");
  }

  return uniqueValues(blockedReasons);
}

function buildReviewItems(
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationBlockedReason[],
): ExecutionRecordPersistenceValidatorIntegrationReviewItem[] {
  return uniqueValues<ExecutionRecordPersistenceValidatorIntegrationReviewItem>([
    "adapter_result_review",
    "integration_validator_result_review",
    "actual_persistence_validator_boundary_review",
    "production_write_boundary_review",
    ...(blockedReasons.includes("missing_candidate_builder_invocation_result")
      ? ["candidate_builder_invocation_review" as const]
      : []),
    ...(blockedReasons.includes("missing_candidate_only_builder_output")
      ? ["candidate_only_builder_output_review" as const]
      : []),
    ...(blockedReasons.includes("generated_types_absent_or_unknown")
      ? ["generated_types_review" as const]
      : []),
    ...(blockedReasons.includes("migration_application_not_proven")
      ? ["migration_application_review" as const]
      : []),
    ...(blockedReasons.includes("missing_rls_security_proof")
      ? ["rls_security_review" as const]
      : []),
    ...(blockedReasons.includes("missing_server_only_write_boundary")
      ? ["server_only_write_boundary_review" as const]
      : []),
    ...(blockedReasons.includes("missing_dry_run_route_status")
      ? ["dry_run_route_review" as const]
      : []),
    ...(blockedReasons.includes("authority_violation")
      ? ["authority_flags_review" as const]
      : []),
  ]);
}

function resolveStatus(input: {
  adapterResult: ExecutionRecordPersistenceValidatorIntegrationAdapterResult | null;
  validationResult: ExecutionRecordPersistenceValidatorIntegrationValidationResult | null;
  blockedReasons: ExecutionRecordPersistenceValidatorIntegrationBlockedReason[];
}): ExecutionRecordPersistenceValidatorIntegrationReadinessStatus {
  if (
    input.blockedReasons.includes("authority_violation") ||
    input.validationResult?.status === "persistence_integration_validation_invalid"
  ) {
    return "persistence_validator_integration_invalid";
  }

  if (
    input.blockedReasons.includes("adapter_unsupported") ||
    input.blockedReasons.includes("validator_unsupported")
  ) {
    return "persistence_validator_integration_unsupported";
  }

  if (
    input.blockedReasons.includes("missing_adapter_input") ||
    input.blockedReasons.includes("missing_candidate_builder_invocation_result") ||
    input.blockedReasons.includes("missing_candidate_only_builder_output") ||
    input.blockedReasons.includes("adapter_blocked") ||
    input.blockedReasons.includes("adapter_not_ready") ||
    input.blockedReasons.includes("validator_blocked")
  ) {
    return "persistence_validator_integration_blocked";
  }

  if (
    input.blockedReasons.length > 0 ||
    input.adapterResult?.status === "persistence_adapter_needs_review" ||
    input.validationResult?.status ===
      "persistence_integration_validation_needs_review"
  ) {
    return "persistence_validator_integration_needs_review";
  }

  if (
    input.adapterResult?.status === "persistence_adapter_ready" &&
    input.validationResult?.status === "persistence_integration_validation_valid"
  ) {
    return "persistence_validator_integration_ready";
  }

  return "persistence_validator_integration_blocked";
}

function resolveDecision(
  status: ExecutionRecordPersistenceValidatorIntegrationReadinessStatus,
): ExecutionRecordPersistenceValidatorIntegrationDecisionRecommendation {
  if (status === "persistence_validator_integration_ready") {
    return "readiness_validated_do_not_persist";
  }

  if (status === "persistence_validator_integration_needs_review") {
    return "needs_manual_review";
  }

  if (status === "persistence_validator_integration_unsupported") {
    return "unsupported_do_not_call_persistence_validator";
  }

  if (status === "persistence_validator_integration_invalid") {
    return "invalid_do_not_call_persistence_validator";
  }

  return "blocked_do_not_call_persistence_validator";
}

export function buildExecutionRecordPersistenceValidatorIntegration(
  input: ExecutionRecordPersistenceValidatorIntegrationReadinessInput,
): ExecutionRecordPersistenceValidatorIntegrationReadinessResult {
  const adapterInput = input.adapterInput ?? null;
  const authorityFlags =
    input.authorityFlags ??
    EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATOR_DEFAULT_AUTHORITY_FLAGS;
  const adapterResult = adapterInput
    ? shapeExecutionRecordPersistenceValidatorInput({
      ...adapterInput,
      contractVersion:
        adapterInput.contractVersion ??
        EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_CONTRACT_VERSION,
    })
    : null;
  const validationInput = adapterInput && adapterResult
    ? buildValidationInput(input, adapterInput, adapterResult)
    : null;
  const validationResult = validationInput
    ? validateExecutionRecordPersistenceIntegration(validationInput)
    : null;
  const blockedReasons = collectBlockedReasons({
    adapterInput,
    adapterResult,
    validationResult,
    authorityFlags,
  });
  const status = resolveStatus({
    adapterResult,
    validationResult,
    blockedReasons,
  });
  const decisionRecommendation = resolveDecision(status);
  const warnings = uniqueValues<ExecutionRecordPersistenceValidatorIntegrationWarning>([
    "readiness_only_not_write_approval",
    "actual_persistence_validator_not_called",
    "insert_route_not_called",
    "execution_record_creation_not_attempted",
    "persistence_not_attempted",
    "audit_append_not_attempted",
    "stats_update_not_attempted",
    "rollback_not_attempted",
    "trade_mutation_not_attempted",
    "broker_order_behavior_not_attempted",
    "browser_avanza_behavior_not_attempted",
  ]);

  return {
    contractVersion:
      EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_READINESS_VERSION,
    evaluatedAt: input.requestedAt,
    status,
    decisionRecommendation,
    input,
    adapterInput,
    adapterResult,
    validationInput,
    validationResult,
    actualPersistenceValidatorBoundarySummary: {
      status: "not_called_future_boundary",
      called: false,
      reason:
        "Action 604 only composes adapter and integration-validator readiness. The actual execution-record persistence validator remains a future boundary and is not called.",
      safeToCallPersistenceValidator: false,
      persistenceValidatorCallAttempted: false,
      requiresGeneratedTypesProof: true,
      requiresMigrationApplicationProof: true,
      requiresRlsSecurityProof: true,
      requiresServerOnlyWriteBoundary: true,
      requiresDryRunRouteProof: true,
      metadata: {
        action: "604",
        futureBoundary: true,
      },
    },
    blockedReasons,
    warnings,
    reviewItems: buildReviewItems(blockedReasons),
    authorityFlags:
      EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_VALIDATOR_DEFAULT_AUTHORITY_FLAGS,
    integrationOnly: true,
    readinessOnly: true,
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
    actualPersistenceValidatorCalled: false,
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
      ...input.metadata,
      integrationOnly: true,
      readinessOnly: true,
      actualPersistenceValidatorCalled: false,
      insertRouteCalled: false,
      executionRecordCreated: false,
      executionRecordPersisted: false,
      noSupabaseWrite: true,
      noLocalStorageWrite: true,
      noAuditAppend: true,
      noStatsUpdate: true,
      noRollbackCorrection: true,
      noTradeMutation: true,
      noBrokerOrderBehavior: true,
      noAvanzaBehavior: true,
      noBrowserAutomation: true,
    },
  };
}
