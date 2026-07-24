import {
  EXECUTION_RECORD_INSERT_ROUTE_CALL_DEFAULT_POST_INSERT_BOUNDARY,
  EXECUTION_RECORD_INSERT_ROUTE_CALL_DEFAULT_SAFETY_POLICY,
  EXECUTION_RECORD_INSERT_ROUTE_CALL_IMPLEMENTATION_CONTRACT_VERSION,
  type ExecutionRecordInsertRouteCallBlockedReason,
  type ExecutionRecordInsertRouteCallDecisionRecommendation,
  type ExecutionRecordInsertRouteCallIdempotencyDuplicateSummary,
  type ExecutionRecordInsertRouteCallInput,
  type ExecutionRecordInsertRouteCallPostInsertBoundarySummary,
  type ExecutionRecordInsertRouteCallResult,
  type ExecutionRecordInsertRouteCallReviewItem,
  type ExecutionRecordInsertRouteCallRlsSecurityServerOnlySummary,
  type ExecutionRecordInsertRouteCallRouteOutputSummary,
  type ExecutionRecordInsertRouteCallSafetyPolicy,
  type ExecutionRecordInsertRouteCallSchemaGeneratedTypesMigrationSummary,
  type ExecutionRecordInsertRouteCallStatus,
  type ExecutionRecordInsertRouteCallWarning,
} from "@/lib/execution-record-insert-route-call-implementation-contract";
import type { ExecutionRecordPersistenceInput } from "@/lib/execution-record-persistence-contract";

function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function valueIsTrue(value: unknown): boolean {
  return value === true;
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

function implementationSafetyPolicy(): ExecutionRecordInsertRouteCallSafetyPolicy {
  return {
    ...EXECUTION_RECORD_INSERT_ROUTE_CALL_DEFAULT_SAFETY_POLICY,
    policyReason:
      "Insert route call implementation is route-call-only. It may invoke only an explicitly injected callable after readiness and server-only safety gates pass, and it never authorizes execution-record creation beyond the route call, persistence workflow completion, audit append, stats/PnL update, rollback/correction, trade mutation, broker/order behavior, Avanza/browser behavior, or automatic mode.",
  };
}

function hasUnsafePostInsertAuthority(
  input: ExecutionRecordInsertRouteCallInput,
): boolean {
  const safetyPolicy = input.safetyPolicy;
  const postInsert = input.postInsertBoundarySummary;
  const readinessPostInsert =
    input.readinessValidationResult?.postInsertBoundaryValidationSummary;

  return Boolean(
    safetyPolicy?.safeToCreateExecutionRecord ||
      safetyPolicy?.safeToPersist ||
      safetyPolicy?.safeToFinalize ||
      safetyPolicy?.safeToAppendAudit ||
      safetyPolicy?.safeToUpdateStats ||
      safetyPolicy?.safeToRollback ||
      safetyPolicy?.safeToMutateTrade ||
      safetyPolicy?.safeToRunBrokerAction ||
      safetyPolicy?.safeToRunAvanzaBrowserAction ||
      safetyPolicy?.automaticModeAllowed ||
      postInsert?.safeToAppendAudit ||
      postInsert?.safeToUpdateStats ||
      postInsert?.safeToRollback ||
      postInsert?.safeToMutateTrade ||
      postInsert?.safeToRunBrokerAction ||
      postInsert?.safeToRunAvanzaBrowserAction ||
      postInsert?.automaticModeAllowed ||
      readinessPostInsert?.auditAppendApproved ||
      readinessPostInsert?.statsPnlUpdateApproved ||
      readinessPostInsert?.rollbackCorrectionApproved ||
      readinessPostInsert?.tradeMutationApproved ||
      readinessPostInsert?.brokerOrderApproved ||
      readinessPostInsert?.avanzaBrowserApproved ||
      readinessPostInsert?.automaticModeApproved,
  );
}

function automaticModeEnabled(input: ExecutionRecordInsertRouteCallInput): boolean {
  return Boolean(
    input.safetyPolicy?.automaticModeAllowed ||
      input.manualApprovalSummary?.automaticModeAllowed ||
      input.readinessValidationResult?.manualApprovalValidationSummary
        .automaticModeAllowed,
  );
}

function statusFromBlockedReasons(params: {
  attempted: boolean;
  blockedReasons: ExecutionRecordInsertRouteCallBlockedReason[];
  routeMode: ExecutionRecordInsertRouteCallInput["routeMode"];
  callableStatus?: ExecutionRecordInsertRouteCallStatus | null;
}): ExecutionRecordInsertRouteCallStatus {
  if (params.blockedReasons.length > 0) {
    if (
      params.blockedReasons.some((reason) =>
        [
          "automatic_mode_not_allowed",
          "post_insert_mutation_not_allowed",
          "broker_or_avanza_action_not_allowed",
          "insert_route_callable_failed",
        ].includes(reason),
      )
    ) {
      return "insert_route_call_invalid";
    }

    return params.attempted
      ? "insert_route_call_blocked"
      : "insert_route_call_not_called";
  }

  if (params.callableStatus) {
    return params.routeMode === "dry_run"
      ? "insert_route_call_dry_run_only"
      : params.callableStatus;
  }

  return params.routeMode === "dry_run"
    ? "insert_route_call_dry_run_only"
    : "insert_route_call_prepared";
}

function decisionFromStatus(
  status: ExecutionRecordInsertRouteCallStatus,
): ExecutionRecordInsertRouteCallDecisionRecommendation {
  switch (status) {
    case "insert_route_call_prepared":
      return "may_call_insert_route_only";
    case "insert_route_call_dry_run_only":
      return "dry_run_only_do_not_persist";
    case "insert_route_call_needs_review":
      return "needs_manual_review";
    case "insert_route_call_invalid":
      return "invalid_do_not_call_insert_route";
    case "insert_route_call_not_called":
      return "not_called";
    case "insert_route_call_blocked":
    default:
      return "blocked_do_not_call_insert_route";
  }
}

function baseWarnings(
  extraWarnings: ExecutionRecordInsertRouteCallWarning[] = [],
): ExecutionRecordInsertRouteCallWarning[] {
  return uniqueValues([
    "insert_route_call_not_full_persistence_workflow",
    "route_success_not_post_insert_mutation_approval",
    "stats_update_out_of_scope",
    "trade_mutation_out_of_scope",
    "broker_avanza_action_out_of_scope",
    ...extraWarnings,
  ]);
}

function buildResult(params: {
  input: ExecutionRecordInsertRouteCallInput;
  attempted: boolean;
  blockedReasons: ExecutionRecordInsertRouteCallBlockedReason[];
  warnings: ExecutionRecordInsertRouteCallWarning[];
  reviewItems: ExecutionRecordInsertRouteCallReviewItem[];
  callableStatus?: ExecutionRecordInsertRouteCallStatus | null;
  routeValidationErrors?: string[];
  dryRunResult?: Record<string, unknown> | null;
  insertedExecutionRecordId?: string | null;
  insertedExecutionRecordReference?: ExecutionRecordInsertRouteCallRouteOutputSummary["insertedExecutionRecordReference"];
  metadata?: Record<string, unknown>;
}): ExecutionRecordInsertRouteCallResult {
  const input = params.input;
  const blockedReasons = uniqueValues(params.blockedReasons);
  const warnings = baseWarnings(params.warnings);
  const reviewItems = uniqueValues(params.reviewItems);
  const status = statusFromBlockedReasons({
    attempted: params.attempted,
    blockedReasons,
    routeMode: input.routeMode,
    callableStatus: params.callableStatus,
  });
  const decisionRecommendation = decisionFromStatus(status);
  const readinessValidationResult = input.readinessValidationResult ?? null;
  const normalizedPersistenceInput =
    input.normalizedPersistenceInput ??
    readinessValidationResult?.normalizedInputValidationSummary
      .proposedPersistenceInput ??
    null;
  const requiredFieldsPresent =
    input.normalizedInputSummary?.requiredPersistenceFieldsPresent ??
    readinessValidationResult?.normalizedInputValidationSummary
      .requiredNormalizedFieldsPresent ??
    requiredPersistenceFieldsPresent(normalizedPersistenceInput);
  const generatedTypesPresent =
    input.schemaGeneratedTypesMigrationSummary?.generatedTypesPresent ??
    readinessValidationResult?.generatedTypesValidationSummary
      .generatedTypesPresent ??
    false;
  const executionRecordsTableTyped =
    input.schemaGeneratedTypesMigrationSummary?.executionRecordsTableTyped ??
    readinessValidationResult?.generatedTypesValidationSummary
      .executionRecordsTableTyped ??
    false;
  const migrationApplicationProven =
    input.schemaGeneratedTypesMigrationSummary?.migrationApplicationProven ??
    readinessValidationResult?.migrationValidationSummary.migrationApplied ??
    false;
  const schemaReadyForInsert =
    input.schemaGeneratedTypesMigrationSummary?.schemaReadyForInsert ??
    readinessValidationResult?.schemaReadinessValidationSummary
      .schemaReadyForInsertReadiness ??
    false;
  const rlsSecurityProofPresent =
    input.rlsSecurityServerOnlySummary?.rlsSecurityProofPresent ??
    readinessValidationResult?.rlsSecurityValidationSummary
      .rlsSecurityProofPresent ??
    false;
  const serverOnlyBoundaryProofPresent =
    input.rlsSecurityServerOnlySummary?.serverOnlyBoundaryProofPresent ??
    readinessValidationResult?.serverOnlyBoundaryValidationSummary
      .serverOnlyBoundaryProofPresent ??
    false;
  const serverOnlyRequestContext =
    input.rlsSecurityServerOnlySummary?.serverOnlyRequestContext ??
    input.routeModeMetadata?.serverOnlyRequestContext ??
    readinessValidationResult?.serverOnlyBoundaryValidationSummary
      .serverOnlyRequestContext ??
    input.readinessInput?.serverOnlyRequestContext ??
    null;
  const serverOnlyRequestContextPresent =
    input.rlsSecurityServerOnlySummary?.serverOnlyRequestContextPresent ??
    Boolean(serverOnlyRequestContext?.isServerOnly);
  const idempotencyMetadataPresent =
    input.idempotencyDuplicateSummary?.idempotencyMetadataPresent ??
    readinessValidationResult?.idempotencyDuplicateValidationSummary
      .idempotencyMetadataPresent ??
    false;
  const duplicatePreventionMetadataPresent =
    input.idempotencyDuplicateSummary?.duplicatePreventionMetadataPresent ??
    readinessValidationResult?.idempotencyDuplicateValidationSummary
      .duplicatePreventionMetadataPresent ??
    false;
  const duplicateMatches =
    input.idempotencyDuplicateSummary?.duplicateMatches ??
    readinessValidationResult?.idempotencyDuplicateValidationSummary
      .duplicateMatches ??
    [];
  const auditCorrectionMetadataPresent =
    input.auditCorrectionSummary?.auditCorrectionMetadataPresent ??
    readinessValidationResult?.auditCorrectionValidationSummary
      .auditCorrectionMetadataPresent ??
    false;
  const sourceEvidencePresent =
    input.evidenceProvenanceSummary?.sourceEvidencePresent ??
    readinessValidationResult?.evidenceProvenanceValidationSummary
      .sourceEvidencePresent ??
    false;
  const manualApprovalRequired =
    input.manualApprovalSummary?.manualApprovalRequired ??
    readinessValidationResult?.manualApprovalValidationSummary
      .manualApprovalRequired ??
    true;
  const manualApprovalSatisfied =
    manualApprovalRequired === false ||
    input.manualApprovalSummary?.manualApprovalSatisfied === true ||
    readinessValidationResult?.manualApprovalValidationSummary
      .manualApprovalSatisfied === true;
  const dryRunRouteKnown =
    input.dryRunProductionModeSummary?.dryRunRouteKnown ??
    readinessValidationResult?.dryRunProductionSeparationValidationSummary
      .dryRunRouteStatus === "known";
  const productionRouteSeparatedFromDryRun =
    input.dryRunProductionModeSummary?.productionRouteSeparatedFromDryRun ??
    readinessValidationResult?.dryRunProductionSeparationValidationSummary
      .productionRouteSeparatedFromDryRun ??
    false;
  const productionRouteAvailable =
    input.dryRunProductionModeSummary?.productionRouteAvailable ?? false;
  const postInsertAuthoritiesFalse =
    !hasUnsafePostInsertAuthority(input);
  const automaticModeDisabled = !automaticModeEnabled(input);
  const safetyPolicy = implementationSafetyPolicy();
  const schemaGeneratedTypesMigrationSummary:
    ExecutionRecordInsertRouteCallSchemaGeneratedTypesMigrationSummary = {
      schemaReference:
        input.schemaGeneratedTypesMigrationSummary?.schemaReference ??
        readinessValidationResult?.schemaReadinessValidationSummary
          .schemaReference ??
        normalizedPersistenceInput?.schemaReference ??
        null,
      schemaReadinessSummary:
        input.schemaGeneratedTypesMigrationSummary?.schemaReadinessSummary ??
        readinessValidationResult?.schemaReadinessValidationSummary
          .sourceSummary ??
        null,
      generatedTypesSummary:
        input.schemaGeneratedTypesMigrationSummary?.generatedTypesSummary ??
        readinessValidationResult?.generatedTypesValidationSummary
          .sourceSummary ??
        null,
      migrationSummary:
        input.schemaGeneratedTypesMigrationSummary?.migrationSummary ??
        readinessValidationResult?.migrationValidationSummary.sourceSummary ??
        null,
      schemaReadyForInsert,
      generatedTypesPresent,
      executionRecordsTableTyped,
      migrationApplicationProven,
      expectedTableName: "execution_records",
      blockedReasons,
      warnings,
      reviewItems,
    };
  const rlsSecurityServerOnlySummary:
    ExecutionRecordInsertRouteCallRlsSecurityServerOnlySummary = {
      rlsSecuritySummary:
        input.rlsSecurityServerOnlySummary?.rlsSecuritySummary ??
        readinessValidationResult?.rlsSecurityValidationSummary.sourceSummary ??
        null,
      serverOnlyBoundarySummary:
        input.rlsSecurityServerOnlySummary?.serverOnlyBoundarySummary ??
        readinessValidationResult?.serverOnlyBoundaryValidationSummary
          .sourceSummary ??
        null,
      serverOnlyRequestContext,
      rlsSecurityProofPresent,
      serverOnlyBoundaryProofPresent,
      serverOnlyRequestContextPresent,
      clientSideInsertAllowed: false,
      browserAutomationAllowed: false,
      brokerAutomationAllowed: false,
      blockedReasons,
      warnings,
      reviewItems,
    };
  const idempotencyDuplicateSummary:
    ExecutionRecordInsertRouteCallIdempotencyDuplicateSummary = {
      idempotencyDuplicateSummary:
        input.idempotencyDuplicateSummary?.idempotencyDuplicateSummary ??
        readinessValidationResult?.idempotencyDuplicateValidationSummary
          .sourceSummary ??
        null,
      idempotencyKey: normalizedPersistenceInput?.idempotencyKey ?? null,
      recordFingerprint: normalizedPersistenceInput?.recordFingerprint ?? null,
      sourceFingerprint: normalizedPersistenceInput?.sourceFingerprint ?? null,
      duplicateMatches,
      idempotencyMetadataPresent,
      duplicatePreventionMetadataPresent,
      duplicateDetected: duplicateMatches.length > 0,
      duplicateBlocksInsert:
        input.idempotencyDuplicateSummary?.duplicateBlocksInsert ??
        duplicateMatches.length > 0,
      blockedReasons,
      warnings,
      reviewItems,
    };
  const postInsertBoundarySummary:
    ExecutionRecordInsertRouteCallPostInsertBoundarySummary = {
      ...EXECUTION_RECORD_INSERT_ROUTE_CALL_DEFAULT_POST_INSERT_BOUNDARY,
      sourcePostInsertBoundarySummary:
        input.postInsertBoundarySummary?.sourcePostInsertBoundarySummary ??
        readinessValidationResult?.postInsertBoundaryValidationSummary
          .sourceSummary ??
        null,
      blockedReasons,
      warnings,
      reviewItems,
    };
  const routeOutputSummary: ExecutionRecordInsertRouteCallRouteOutputSummary = {
    routeMode: input.routeMode,
    insertRouteCallAttempted: params.attempted,
    insertRouteCallStatus: status,
    insertedExecutionRecordId: params.insertedExecutionRecordId ?? null,
    insertedExecutionRecordReference:
      params.insertedExecutionRecordReference ?? null,
    dryRunResult: params.dryRunResult ?? null,
    routeValidationErrors: params.routeValidationErrors ?? [],
    duplicateDetectionResult: idempotencyDuplicateSummary,
    serverOnlyExecutionSummary: rlsSecurityServerOnlySummary,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: params.metadata,
  };

  return {
    contractVersion:
      input.contractVersion ??
      EXECUTION_RECORD_INSERT_ROUTE_CALL_IMPLEMENTATION_CONTRACT_VERSION,
    evaluatedAt: input.requestedAt,
    status,
    decisionRecommendation,
    input,
    preconditionSummary: {
      readinessValidationReady:
        readinessValidationResult?.status ===
        "insert_route_readiness_validation_ready",
      readinessDecisionPrepareOnly:
        readinessValidationResult?.decisionRecommendation ===
        "may_prepare_insert_route_call_only",
      normalizedPersistenceInputPresent: Boolean(normalizedPersistenceInput),
      generatedTypesPresent,
      migrationApplicationProven,
      schemaReadinessProven: schemaReadyForInsert,
      rlsSecurityProofPresent,
      serverOnlyRequestContextPresent,
      serverOnlyWriteBoundaryProven: serverOnlyBoundaryProofPresent,
      duplicatePreventionMetadataPresent,
      idempotencyMetadataPresent,
      auditCorrectionMetadataPresent,
      sourceEvidencePresent,
      manualApprovalSatisfied,
      dryRunRouteStatusKnown: dryRunRouteKnown,
      productionRouteSeparatedFromDryRun,
      postInsertAuthoritiesFalse,
      automaticModeDisabled,
      blockedReasons,
      warnings,
      reviewItems,
    },
    readinessSummary: {
      readinessValidationResult,
      readinessInput: input.readinessInput ?? null,
      readinessResult: input.readinessResult ?? null,
      readinessValidationResultPresent: Boolean(readinessValidationResult),
      readinessValidationReady:
        readinessValidationResult?.status ===
        "insert_route_readiness_validation_ready",
      readinessDecisionPrepareOnly:
        readinessValidationResult?.decisionRecommendation ===
        "may_prepare_insert_route_call_only",
      mayPrepareInsertRouteCallOnly:
        readinessValidationResult?.decisionRecommendation ===
        "may_prepare_insert_route_call_only",
      mayPrepareIsNotInsertExecution: true,
      insertRouteCalledByReadiness: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    normalizedInputSummary: {
      normalizedPersistenceInput,
      readinessNormalizedInputSummary:
        input.normalizedInputSummary?.readinessNormalizedInputSummary ??
        readinessValidationResult?.normalizedInputValidationSummary
          .sourceSummary ??
        null,
      normalizedPersistenceInputPresent: Boolean(normalizedPersistenceInput),
      requiredPersistenceFieldsPresent: requiredFieldsPresent,
      idempotencyKeyPresent: hasText(normalizedPersistenceInput?.idempotencyKey),
      recordFingerprintPresent: hasText(
        normalizedPersistenceInput?.recordFingerprint,
      ),
      sourceFingerprintPresent: hasText(
        normalizedPersistenceInput?.sourceFingerprint,
      ),
      brokerConfirmationPresent: Boolean(
        normalizedPersistenceInput?.brokerConfirmation,
      ),
      associationPresent: Boolean(normalizedPersistenceInput?.association),
      userContextPresent: Boolean(normalizedPersistenceInput?.userContext),
      safetyChecklistPresent: Boolean(
        normalizedPersistenceInput?.safetyChecklist,
      ),
      auditMetadataPresent: Boolean(normalizedPersistenceInput?.auditMetadata),
      blockedReasons,
      warnings,
      reviewItems,
    },
    schemaGeneratedTypesMigrationSummary,
    rlsSecurityServerOnlySummary,
    idempotencyDuplicateSummary,
    auditCorrectionSummary: {
      auditCorrectionSummary:
        input.auditCorrectionSummary?.auditCorrectionSummary ??
        readinessValidationResult?.auditCorrectionValidationSummary
          .sourceSummary ??
        null,
      auditCorrectionMetadataPresent,
      auditAppendAllowed: false,
      correctionAllowed: false,
      rollbackAllowed: false,
      postInsertAuditRequiresSeparateBoundary: true,
      blockedReasons,
      warnings,
      reviewItems,
    },
    evidenceProvenanceSummary: {
      evidenceProvenanceSummary:
        input.evidenceProvenanceSummary?.evidenceProvenanceSummary ??
        readinessValidationResult?.evidenceProvenanceValidationSummary
          .sourceSummary ??
        null,
      actualValidatorSummary:
        input.evidenceProvenanceSummary?.actualValidatorSummary ??
        readinessValidationResult?.actualValidatorValidationSummary
          .sourceSummary ??
        null,
      sourceEvidencePresent,
      sourceFingerprintPresent: hasText(
        normalizedPersistenceInput?.sourceFingerprint,
      ),
      brokerConfirmationEvidencePresent:
        input.evidenceProvenanceSummary?.brokerConfirmationEvidencePresent ??
        readinessValidationResult?.evidenceProvenanceValidationSummary
          .brokerConfirmationEvidencePresent ??
        false,
      provenanceMetadataPresent:
        input.evidenceProvenanceSummary?.provenanceMetadataPresent ??
        readinessValidationResult?.evidenceProvenanceValidationSummary
          .provenanceComplete ??
        false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    manualApprovalSummary: {
      manualApprovalSummary:
        input.manualApprovalSummary?.manualApprovalSummary ??
        readinessValidationResult?.manualApprovalValidationSummary
          .sourceSummary ??
        null,
      manualApprovalContext:
        input.manualApprovalSummary?.manualApprovalContext ??
        readinessValidationResult?.manualApprovalValidationSummary
          .manualApprovalContext ??
        null,
      manualApprovalRequired,
      manualApprovalSatisfied,
      automaticModeAllowed: false,
      automaticModeDisabled: true,
      blockedReasons,
      warnings,
      reviewItems,
    },
    dryRunProductionModeSummary: {
      dryRunProductionSeparationSummary:
        input.dryRunProductionModeSummary?.dryRunProductionSeparationSummary ??
        readinessValidationResult?.dryRunProductionSeparationValidationSummary
          .sourceSummary ??
        null,
      routeMode: input.routeMode,
      dryRunRouteKnown,
      dryRunRouteOnly: input.routeMode === "dry_run",
      dryRunRouteIsProductionInsert: false,
      dryRunSuccessIsNotProductionInsertSuccess: true,
      productionRouteAvailable,
      productionRouteSeparatedFromDryRun,
      productionRouteRequiresServerOnlyBoundary: true,
      productionRouteCallableFromDevPreview: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    routeOutputSummary,
    postInsertBoundarySummary,
    safetyPolicy,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: {
      routeCallableAttempted: params.attempted,
      routeCallableInjected: typeof input.insertRouteCallable === "function",
      ...params.metadata,
    },
  };
}

function collectBlockedReasons(
  input: ExecutionRecordInsertRouteCallInput,
): ExecutionRecordInsertRouteCallBlockedReason[] {
  const readinessValidationResult = input.readinessValidationResult ?? null;
  const normalizedPersistenceInput =
    input.normalizedPersistenceInput ??
    readinessValidationResult?.normalizedInputValidationSummary
      .proposedPersistenceInput ??
    null;
  const reasons: ExecutionRecordInsertRouteCallBlockedReason[] = [];

  if (!readinessValidationResult) {
    reasons.push("missing_insert_readiness_validation_result");
  } else {
    if (
      readinessValidationResult.status !==
      "insert_route_readiness_validation_ready"
    ) {
      reasons.push("insert_readiness_not_ready");
    }

    if (
      readinessValidationResult.decisionRecommendation !==
      "may_prepare_insert_route_call_only"
    ) {
      reasons.push("insert_readiness_decision_not_prepare_only");
    }
  }

  if (!normalizedPersistenceInput) {
    reasons.push("missing_normalized_persistence_input");
  }

  if (typeof input.insertRouteCallable !== "function") {
    reasons.push("missing_insert_route_callable");
  }

  if (!input.routeMode || input.routeMode === "not_selected") {
    reasons.push("missing_route_mode");
  }

  if (
    !(
      input.schemaGeneratedTypesMigrationSummary?.generatedTypesPresent ??
      readinessValidationResult?.generatedTypesValidationSummary
        .generatedTypesPresent
    ) ||
    !(
      input.schemaGeneratedTypesMigrationSummary?.executionRecordsTableTyped ??
      readinessValidationResult?.generatedTypesValidationSummary
        .executionRecordsTableTyped
    )
  ) {
    reasons.push("generated_types_absent_or_unknown");
  }

  if (
    !(
      input.schemaGeneratedTypesMigrationSummary?.migrationApplicationProven ??
      readinessValidationResult?.migrationValidationSummary.migrationApplied
    )
  ) {
    reasons.push("migration_application_not_proven");
  }

  if (
    !(
      input.schemaGeneratedTypesMigrationSummary?.schemaReadyForInsert ??
      readinessValidationResult?.schemaReadinessValidationSummary
        .schemaReadyForInsertReadiness
    )
  ) {
    reasons.push("schema_readiness_absent_or_unknown");
  }

  if (
    !(
      input.rlsSecurityServerOnlySummary?.rlsSecurityProofPresent ??
      readinessValidationResult?.rlsSecurityValidationSummary
        .rlsSecurityProofPresent
    )
  ) {
    reasons.push("missing_rls_security_proof");
  }

  const serverOnlyContext =
    input.rlsSecurityServerOnlySummary?.serverOnlyRequestContext ??
    input.routeModeMetadata?.serverOnlyRequestContext ??
    readinessValidationResult?.serverOnlyBoundaryValidationSummary
      .serverOnlyRequestContext ??
    input.readinessInput?.serverOnlyRequestContext ??
    null;
  if (!serverOnlyContext?.isServerOnly) {
    reasons.push("missing_server_only_request_context");
  }

  if (
    !(
      input.rlsSecurityServerOnlySummary?.serverOnlyBoundaryProofPresent ??
      readinessValidationResult?.serverOnlyBoundaryValidationSummary
        .serverOnlyBoundaryProofPresent
    )
  ) {
    reasons.push("missing_server_only_write_boundary");
  }

  if (
    !(
      input.idempotencyDuplicateSummary?.duplicatePreventionMetadataPresent ??
      readinessValidationResult?.idempotencyDuplicateValidationSummary
        .duplicatePreventionMetadataPresent
    )
  ) {
    reasons.push("missing_duplicate_prevention_metadata");
  }

  if (
    !(
      input.idempotencyDuplicateSummary?.idempotencyMetadataPresent ??
      readinessValidationResult?.idempotencyDuplicateValidationSummary
        .idempotencyMetadataPresent
    )
  ) {
    reasons.push("missing_idempotency_metadata");
  }

  if (
    !(
      input.auditCorrectionSummary?.auditCorrectionMetadataPresent ??
      readinessValidationResult?.auditCorrectionValidationSummary
        .auditCorrectionMetadataPresent
    )
  ) {
    reasons.push("missing_audit_correction_metadata");
  }

  if (
    !(
      input.evidenceProvenanceSummary?.sourceEvidencePresent ??
      readinessValidationResult?.evidenceProvenanceValidationSummary
        .sourceEvidencePresent
    )
  ) {
    reasons.push("missing_source_evidence");
  }

  const manualApprovalRequired =
    input.manualApprovalSummary?.manualApprovalRequired ??
    readinessValidationResult?.manualApprovalValidationSummary
      .manualApprovalRequired ??
    true;
  const manualApprovalSatisfied =
    manualApprovalRequired === false ||
    input.manualApprovalSummary?.manualApprovalSatisfied === true ||
    readinessValidationResult?.manualApprovalValidationSummary
      .manualApprovalSatisfied === true;
  if (!manualApprovalSatisfied) {
    reasons.push("missing_manual_approval");
  }

  if (
    !(
      input.dryRunProductionModeSummary?.dryRunRouteKnown ??
      readinessValidationResult?.dryRunProductionSeparationValidationSummary
        .dryRunRouteStatus === "known"
    )
  ) {
    reasons.push("dry_run_route_not_production_insert");
  }

  if (
    !(
      input.dryRunProductionModeSummary?.productionRouteSeparatedFromDryRun ??
      readinessValidationResult?.dryRunProductionSeparationValidationSummary
        .productionRouteSeparatedFromDryRun
    )
  ) {
    reasons.push("dry_run_route_not_production_insert");
  }

  if (
    input.routeMode === "production" &&
    input.dryRunProductionModeSummary?.productionRouteAvailable !== true
  ) {
    reasons.push("production_route_unavailable");
  }

  if (
    valueIsTrue(input.rlsSecurityServerOnlySummary?.clientSideInsertAllowed) ||
    valueIsTrue(
      input.routeModeMetadata?.serverOnlyRequestContext
        ?.clientInitiatedWriteAllowed,
    )
  ) {
    reasons.push("client_side_insert_not_allowed");
  }

  if (automaticModeEnabled(input)) {
    reasons.push("automatic_mode_not_allowed");
  }

  if (hasUnsafePostInsertAuthority(input)) {
    reasons.push("post_insert_mutation_not_allowed");
  }

  if (
    valueIsTrue(input.rlsSecurityServerOnlySummary?.browserAutomationAllowed) ||
    valueIsTrue(input.rlsSecurityServerOnlySummary?.brokerAutomationAllowed) ||
    valueIsTrue(
      input.routeModeMetadata?.serverOnlyRequestContext
        ?.browserAutomationAllowed,
    ) ||
    valueIsTrue(
      input.routeModeMetadata?.serverOnlyRequestContext
        ?.brokerAutomationAllowed,
    )
  ) {
    reasons.push("broker_or_avanza_action_not_allowed");
  }

  return uniqueValues(reasons);
}

export async function callExecutionRecordInsertRoute(
  input: ExecutionRecordInsertRouteCallInput,
): Promise<ExecutionRecordInsertRouteCallResult> {
  const initialBlockedReasons = collectBlockedReasons(input);

  if (initialBlockedReasons.length > 0) {
    return buildResult({
      input,
      attempted: false,
      blockedReasons: initialBlockedReasons,
      warnings: ["insert_route_not_called"],
      reviewItems: ["future_insert_route_implementation_review"],
    });
  }

  try {
    const callableResult = await input.insertRouteCallable!(input);
    const callableBlockedReasons = callableResult.blockedReasons ?? [];

    return buildResult({
      input,
      attempted: true,
      blockedReasons: callableBlockedReasons,
      warnings: callableResult.warnings ?? [],
      reviewItems: callableResult.reviewItems ?? [],
      callableStatus: callableResult.status,
      routeValidationErrors: callableResult.routeValidationErrors ?? [],
      dryRunResult: callableResult.dryRunResult ?? null,
      insertedExecutionRecordId: callableResult.insertedExecutionRecordId ?? null,
      insertedExecutionRecordReference:
        callableResult.insertedExecutionRecordReference ?? null,
      metadata: callableResult.metadata,
    });
  } catch (error) {
    return buildResult({
      input,
      attempted: true,
      blockedReasons: ["insert_route_callable_failed"],
      warnings: ["insert_route_not_called"],
      reviewItems: ["future_insert_route_implementation_review"],
      routeValidationErrors: [
        error instanceof Error
          ? error.message
          : "Injected insert route callable failed.",
      ],
    });
  }
}
