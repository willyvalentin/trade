import {
  EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordProductionInsertRouteBoundaryAuthorityFlags,
  type ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason,
  type ExecutionRecordProductionInsertRouteBoundaryValidationDecisionRecommendation,
  type ExecutionRecordProductionInsertRouteBoundaryValidationInput,
  type ExecutionRecordProductionInsertRouteBoundaryValidationResult,
  type ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem,
  type ExecutionRecordProductionInsertRouteBoundaryValidationStatus,
  type ExecutionRecordProductionInsertRouteBoundaryValidationWarning,
  type ExecutionRecordProductionInsertRouteCurrentStateValidationSummary,
  type ExecutionRecordProductionInsertRouteSafetyPolicyValidationSummary,
} from "@/lib/execution-record-production-insert-route-boundary-validator-contract";
import type {
  ExecutionRecordProductionInsertRouteBoundaryInput,
} from "@/lib/execution-record-production-insert-route-boundary-contract";

// Pure production insert route boundary validation only. This module does not
// implement or call production routes, call insert routes, create execution
// records, persist/write, append audit, update stats/PnL, roll back, mutate
// trades, wire UI, run broker/order behavior, or automate browser/Avanza.

type ReasonBuckets = {
  blocked: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
  invalid: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
  review: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
};

const BASE_WARNINGS: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[] =
  [
    "contract_only",
    "validator_not_implemented",
    "production_route_not_implemented",
    "production_route_not_called",
    "dry_run_route_not_production_insert",
    "production_route_requires_server_only_boundary",
    "audit_required_before_post_insert_mutation",
    "stats_update_out_of_scope",
    "trade_mutation_out_of_scope",
    "broker_avanza_action_out_of_scope",
    "post_insert_mutations_not_automatic",
  ];

const ALL_REVIEW_ITEMS: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[] =
  [
    "boundary_input_review",
    "current_state_review",
    "precondition_review",
    "route_shape_review",
    "allowed_input_review",
    "allowed_output_review",
    "dry_run_production_separation_review",
    "security_review",
    "server_only_review",
    "schema_generated_types_migration_review",
    "idempotency_duplicate_review",
    "audit_correction_review",
    "evidence_provenance_review",
    "manual_approval_review",
    "post_insert_boundary_review",
    "safety_policy_review",
    "future_route_implementation_review",
  ];

function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasTruthyFlag(value: unknown, key: string): boolean {
  return isObject(value) && value[key] === true;
}

function addReason(
  buckets: ReasonBuckets,
  bucket: keyof ReasonBuckets,
  reason: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason,
): void {
  buckets[bucket].push(reason);
}

function hasAuthorityViolation(value: unknown): boolean {
  if (!isObject(value)) {
    return false;
  }

  const forbiddenKeys = [
    "productionRouteImplementationAllowed",
    "productionRouteCallAllowed",
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
    "productionRouteImplementationAttempted",
    "productionRouteCallAttempted",
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

function collectBlockedReasons(buckets: ReasonBuckets) {
  return uniqueValues([
    ...buckets.invalid,
    ...buckets.blocked,
    ...buckets.review,
  ]);
}

function statusFromBuckets(
  input: ExecutionRecordProductionInsertRouteBoundaryValidationInput | null | undefined,
  buckets: ReasonBuckets,
): ExecutionRecordProductionInsertRouteBoundaryValidationStatus {
  if (buckets.invalid.length > 0) {
    return "production_insert_route_boundary_validation_invalid";
  }

  if (buckets.blocked.length > 0) {
    return "production_insert_route_boundary_validation_blocked";
  }

  if (buckets.review.length > 0) {
    return "production_insert_route_boundary_validation_needs_review";
  }

  return "production_insert_route_boundary_validation_ready_for_design_only";
}

function decisionFromStatus(
  status: ExecutionRecordProductionInsertRouteBoundaryValidationStatus,
): ExecutionRecordProductionInsertRouteBoundaryValidationDecisionRecommendation {
  switch (status) {
    case "production_insert_route_boundary_validation_ready_for_design_only":
      return "design_only_do_not_implement_route";
    case "production_insert_route_boundary_validation_needs_review":
      return "needs_manual_review";
    case "production_insert_route_boundary_validation_invalid":
      return "invalid_do_not_create_production_route";
    case "production_insert_route_boundary_validation_absent":
    case "production_insert_route_boundary_validation_blocked":
      return "blocked_do_not_create_production_route";
    default:
      return "future_route_boundary_required";
  }
}

function collectWarnings(
  blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[],
): ExecutionRecordProductionInsertRouteBoundaryValidationWarning[] {
  const warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[] =
    [...BASE_WARNINGS];

  if (blockedReasons.includes("generated_types_absent_or_unknown")) {
    warnings.push("generated_types_required_before_production_insert");
  }
  if (blockedReasons.includes("migration_application_not_proven")) {
    warnings.push("migration_application_required_before_production_insert");
  }
  if (blockedReasons.includes("rls_security_unverified")) {
    warnings.push("rls_security_required_before_production_insert");
  }
  if (blockedReasons.includes("route_auth_secret_model_missing")) {
    warnings.push("route_auth_secret_model_required");
  }
  if (blockedReasons.includes("client_side_write_not_blocked")) {
    warnings.push("client_side_write_must_be_blocked");
  }
  if (blockedReasons.includes("duplicate_prevention_missing")) {
    warnings.push("duplicate_prevention_required_before_insert");
  }

  return uniqueValues(warnings);
}

function collectReviewItems(
  blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[],
): ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[] {
  return blockedReasons.length > 0 ? ALL_REVIEW_ITEMS : [];
}

function validateBoundaryInput(
  input: ExecutionRecordProductionInsertRouteBoundaryValidationInput | null | undefined,
): ReasonBuckets {
  const buckets: ReasonBuckets = { blocked: [], invalid: [], review: [] };
  const boundaryInput = input?.boundaryInput ?? null;

  if (!input || !boundaryInput) {
    addReason(buckets, "blocked", "missing_boundary_input");
    return buckets;
  }

  const currentState = boundaryInput.currentStateSummary ?? null;
  const preconditions = boundaryInput.preconditionSummary ?? null;
  const routeShape = boundaryInput.routeShapeSummary ?? null;
  const allowedInput = boundaryInput.allowedInputSummary ?? null;
  const allowedOutput = boundaryInput.allowedOutputSummary ?? null;
  const dryRunSeparation = boundaryInput.dryRunSeparationSummary ?? null;
  const security = boundaryInput.securitySummary ?? null;
  const serverOnly = boundaryInput.serverOnlySummary ?? null;
  const schema = boundaryInput.schemaGeneratedTypesMigrationSummary ?? null;
  const idempotency = boundaryInput.idempotencyDuplicateSummary ?? null;
  const auditCorrection = boundaryInput.auditCorrectionSummary ?? null;
  const evidence = boundaryInput.evidenceProvenanceSummary ?? null;
  const postInsert = boundaryInput.postInsertBoundarySummary ?? null;
  const safetyPolicy = boundaryInput.safetyPolicy ?? input.safetyPolicy ?? null;

  if (hasTruthyFlag(currentState, "productionRouteImplemented")) {
    addReason(
      buckets,
      "invalid",
      "production_route_implementation_present_unexpectedly",
    );
  }
  if (hasTruthyFlag(currentState, "productionRouteCalled")) {
    addReason(buckets, "invalid", "production_route_call_attempted");
  }
  if (hasTruthyFlag(input.boundaryResult?.safetyPolicy, "productionRouteCalled")) {
    addReason(buckets, "invalid", "production_route_call_attempted");
  }
  if (hasAuthorityViolation(input.boundaryResult?.safetyPolicy)) {
    addReason(
      buckets,
      "invalid",
      "production_route_implementation_present_unexpectedly",
    );
  }
  if (hasAuthorityViolation(safetyPolicy)) {
    addReason(
      buckets,
      "invalid",
      "production_route_implementation_present_unexpectedly",
    );
  }

  if (
    schema?.generatedTypesPresent !== true ||
    preconditions?.generatedTypesPresent !== true ||
    allowedInput?.generatedTypesSchemaReadinessProofPresent !== true
  ) {
    addReason(buckets, "blocked", "generated_types_absent_or_unknown");
  }
  if (
    schema?.migrationApplicationProven !== true ||
    preconditions?.migrationApplicationProven !== true ||
    allowedInput?.migrationProofPresent !== true
  ) {
    addReason(buckets, "blocked", "migration_application_not_proven");
  }
  if (
    schema?.executionRecordsSchemaVerified !== true ||
    preconditions?.executionRecordsSchemaVerified !== true
  ) {
    addReason(buckets, "blocked", "execution_records_schema_unverified");
  }
  if (
    security?.rlsSecurityProofPresent !== true ||
    security?.rlsPoliciesVerified !== true ||
    preconditions?.rlsSecurityVerified !== true ||
    allowedInput?.rlsSecurityProofPresent !== true
  ) {
    addReason(buckets, "blocked", "rls_security_unverified");
  }
  if (
    serverOnly?.serverOnlyBoundaryProven !== true ||
    serverOnly?.routeHandlerOnly !== true ||
    serverOnly?.serviceRoleRestrictedToServer !== true ||
    preconditions?.serverOnlyBoundaryProven !== true
  ) {
    addReason(buckets, "blocked", "server_only_boundary_missing");
  }
  if (
    security?.routeAuthSecretModelDefined !== true ||
    preconditions?.routeAuthSecretModelDefined !== true ||
    !isObject(input.routeAuthSecretModelMetadata)
  ) {
    addReason(buckets, "blocked", "route_auth_secret_model_missing");
  }
  if (
    security?.clientSideWriteBlocked !== true ||
    preconditions?.clientSideWriteImpossible !== true ||
    serverOnly?.clientSideSupabaseInsertAllowed !== false ||
    serverOnly?.localStorageWriteAllowed !== false ||
    routeShape?.clientSideSupabaseInsertAllowed !== false
  ) {
    addReason(buckets, "invalid", "client_side_write_not_blocked");
  }
  if (
    idempotency?.duplicatePreventionMetadataPresent !== true ||
    idempotency?.duplicateBlocksInsert !== true ||
    preconditions?.duplicatePreventionImplemented !== true ||
    allowedInput?.duplicatePreventionMetadataPresent !== true
  ) {
    addReason(buckets, "blocked", "duplicate_prevention_missing");
  }
  if (
    idempotency?.idempotencyKeyPresent !== true ||
    !hasText(idempotency?.idempotencyKey) ||
    preconditions?.idempotencyStrategyImplemented !== true
  ) {
    addReason(buckets, "blocked", "idempotency_key_missing");
  }
  if (
    !boundaryInput.normalizedPersistenceInput ||
    !input.normalizedPersistenceInput ||
    allowedInput?.normalizedExecutionRecordInputPresent !== true ||
    preconditions?.normalizedPersistenceInputValidated !== true
  ) {
    addReason(buckets, "blocked", "normalized_input_missing");
  }
  if (
    evidence?.evidenceProvenanceChainPresent !== true ||
    evidence?.sourceFingerprintPresent !== true ||
    evidence?.finalBrokerEvidenceIdentifiersPresent !== true ||
    preconditions?.evidenceProvenanceComplete !== true ||
    allowedInput?.evidenceProvenanceChainPresent !== true
  ) {
    addReason(buckets, "blocked", "evidence_provenance_missing");
  }
  if (
    auditCorrection?.auditCorrectionMetadataPresent !== true ||
    preconditions?.auditCorrectionMetadataComplete !== true ||
    allowedInput?.auditCorrectionMetadataPresent !== true
  ) {
    addReason(buckets, "blocked", "audit_correction_metadata_missing");
  }
  if (
    preconditions?.manualApprovalContextPresent !== true ||
    allowedInput?.manualApprovalMetadataPresent !== true
  ) {
    addReason(buckets, "blocked", "manual_approval_missing");
  }
  if (
    dryRunSeparation?.dryRunRouteDiagnosticsOnly !== true ||
    dryRunSeparation?.dryRunResultIsProductionInsert !== false ||
    dryRunSeparation?.dryRunSuccessProvesProductionReadiness !== false ||
    dryRunSeparation?.productionRouteSeparate !== true ||
    dryRunSeparation?.productionRouteServerOnly !== true ||
    dryRunSeparation?.devPreviewMayCallProductionRoute !== false ||
    dryRunSeparation?.fixtureCallableMayCallProductionRoute !== false ||
    !hasText(dryRunSeparation?.sourceRouteMode ?? boundaryInput.routeMode) ||
    preconditions?.dryRunProductionSeparated !== true
  ) {
    addReason(buckets, "invalid", "dry_run_production_separation_missing");
  }
  if (
    !postInsert ||
    postInsert.safeToAppendAudit !== false ||
    postInsert.safeToUpdateStats !== false ||
    postInsert.safeToRollback !== false ||
    postInsert.safeToMutateTrade !== false ||
    postInsert.safeToRunBrokerAction !== false ||
    postInsert.safeToRunAvanzaBrowserAction !== false ||
    postInsert.automaticModeAllowed !== false ||
    postInsert.auditAppendRequiresSeparateBoundary !== true ||
    postInsert.statsUpdateRequiresSeparateBoundary !== true ||
    postInsert.rollbackCorrectionRequiresSeparateBoundary !== true ||
    postInsert.tradeMutationReconciliationRequiresSeparateBoundary !== true ||
    postInsert.failureRecoveryRequiresSeparateBoundary !== true ||
    postInsert.uiStateMutationRequiresSeparateBoundary !== true ||
    postInsert.userNotificationRequiresSeparateBoundary !== true ||
    postInsert.brokerOrderFollowUpRequiresSeparateBoundary !== true ||
    preconditions?.postInsertAuthoritiesFalse !== true
  ) {
    addReason(buckets, "blocked", "post_insert_boundaries_missing");
  }
  if (
    hasTruthyFlag(security, "brokerAutomationAuthority") ||
    hasTruthyFlag(security, "avanzaBrowserAuthority") ||
    hasTruthyFlag(postInsert, "safeToRunBrokerAction") ||
    hasTruthyFlag(postInsert, "safeToRunAvanzaBrowserAction")
  ) {
    addReason(buckets, "invalid", "broker_or_avanza_action_requested");
  }
  if (
    allowedOutput?.auditAppendApprovalOutput !== false ||
    allowedOutput?.statsPnlUpdateApprovalOutput !== false ||
    allowedOutput?.rollbackCorrectionApprovalOutput !== false ||
    allowedOutput?.tradeMutationApprovalOutput !== false ||
    allowedOutput?.brokerOrderApprovalOutput !== false ||
    allowedOutput?.avanzaBrowserApprovalOutput !== false ||
    allowedOutput?.automaticModeApprovalOutput !== false
  ) {
    addReason(buckets, "invalid", "broker_or_avanza_action_requested");
  }

  return buckets;
}

function buildCurrentStateSummary(params: {
  boundaryInput: ExecutionRecordProductionInsertRouteBoundaryInput | null;
  blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
}): ExecutionRecordProductionInsertRouteCurrentStateValidationSummary {
  const source = params.boundaryInput?.currentStateSummary ?? null;

  return {
    sourceSummary: source,
    boundaryInputPresent: Boolean(params.boundaryInput),
    boundaryContractPresent: Boolean(params.boundaryInput),
    productionRouteImplemented: false,
    productionRouteCalled: false,
    productionInsertWritePathPresent: false,
    devPreviewDiagnosticsOnly: source?.devPreviewDiagnosticsOnly === true,
    generatedTypesStatusKnown: source?.generatedTypesPresent === true,
    migrationApplicationStatusKnown:
      source?.migrationApplicationProven === true,
    blockedReasons: params.blockedReasons,
    warnings: params.warnings,
    reviewItems: params.reviewItems,
  };
}

function buildSafetyPolicySummary(params: {
  sourceSafetyPolicy: ExecutionRecordProductionInsertRouteBoundaryInput["safetyPolicy"] | null | undefined;
  authorityFlags: ExecutionRecordProductionInsertRouteBoundaryAuthorityFlags;
  blockedReasons: ExecutionRecordProductionInsertRouteBoundaryValidationBlockedReason[];
  warnings: ExecutionRecordProductionInsertRouteBoundaryValidationWarning[];
  reviewItems: ExecutionRecordProductionInsertRouteBoundaryValidationReviewItem[];
}): ExecutionRecordProductionInsertRouteSafetyPolicyValidationSummary {
  return {
    sourceSafetyPolicy: params.sourceSafetyPolicy ?? null,
    authorityFlags: params.authorityFlags,
    validationOnly: true,
    designOnly: true,
    noProductionRouteImplementation: true,
    noProductionRouteCall: true,
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
  };
}

export function validateExecutionRecordProductionInsertRouteBoundary(
  input: ExecutionRecordProductionInsertRouteBoundaryValidationInput | null | undefined,
): ExecutionRecordProductionInsertRouteBoundaryValidationResult {
  const buckets = validateBoundaryInput(input);
  const blockedReasons = collectBlockedReasons(buckets);
  const warnings = collectWarnings(blockedReasons);
  const reviewItems = collectReviewItems(blockedReasons);
  const status = statusFromBuckets(input, buckets);
  const decisionRecommendation = decisionFromStatus(status);
  const boundaryInput = input?.boundaryInput ?? null;
  const authorityFlags =
    EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_DEFAULT_AUTHORITY_FLAGS;

  const preconditionSource = boundaryInput?.preconditionSummary ?? null;
  const routeShapeSource = boundaryInput?.routeShapeSummary ?? null;
  const allowedInputSource = boundaryInput?.allowedInputSummary ?? null;
  const allowedOutputSource = boundaryInput?.allowedOutputSummary ?? null;
  const dryRunSource = boundaryInput?.dryRunSeparationSummary ?? null;
  const securitySource = boundaryInput?.securitySummary ?? null;
  const serverOnlySource = boundaryInput?.serverOnlySummary ?? null;
  const schemaSource = boundaryInput?.schemaGeneratedTypesMigrationSummary ?? null;
  const idempotencySource = boundaryInput?.idempotencyDuplicateSummary ?? null;
  const auditSource = boundaryInput?.auditCorrectionSummary ?? null;
  const evidenceSource = boundaryInput?.evidenceProvenanceSummary ?? null;
  const postInsertSource = boundaryInput?.postInsertBoundarySummary ?? null;

  return {
    contractVersion:
      EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATOR_CONTRACT_VERSION,
    evaluatedAt: new Date(0).toISOString(),
    status,
    decisionRecommendation,
    input: input ?? null,
    currentStateValidationSummary: buildCurrentStateSummary({
      boundaryInput,
      blockedReasons,
      warnings,
      reviewItems,
    }),
    preconditionValidationSummary: {
      sourceSummary: preconditionSource,
      generatedTypesPresent: preconditionSource?.generatedTypesPresent === true,
      migrationApplicationProven:
        preconditionSource?.migrationApplicationProven === true,
      executionRecordsSchemaVerified:
        preconditionSource?.executionRecordsSchemaVerified === true,
      rlsSecurityVerified: preconditionSource?.rlsSecurityVerified === true,
      serviceRoleServerOnlyAccessDefined:
        preconditionSource?.serviceRoleServerOnlyAccessDefined === true,
      routeAuthSecretModelDefined:
        preconditionSource?.routeAuthSecretModelDefined === true,
      clientSideWriteBlocked:
        preconditionSource?.clientSideWriteImpossible === true,
      serverOnlyBoundaryProven:
        preconditionSource?.serverOnlyBoundaryProven === true,
      normalizedInputPresent:
        preconditionSource?.normalizedPersistenceInputValidated === true,
      idempotencyKeyPresent:
        preconditionSource?.idempotencyStrategyImplemented === true,
      duplicatePreventionPresent:
        preconditionSource?.duplicatePreventionImplemented === true,
      evidenceProvenancePresent:
        preconditionSource?.evidenceProvenanceComplete === true,
      auditCorrectionMetadataPresent:
        preconditionSource?.auditCorrectionMetadataComplete === true,
      manualApprovalSatisfied:
        preconditionSource?.manualApprovalContextPresent === true,
      dryRunProductionSeparated:
        preconditionSource?.dryRunProductionSeparated === true,
      postInsertAuthoritiesFalse:
        preconditionSource?.postInsertAuthoritiesFalse === true,
      blockedReasons,
      warnings,
      reviewItems,
    },
    routeShapeValidationSummary: {
      sourceSummary: routeShapeSource,
      routeModeProductionOnly: routeShapeSource?.routeMode === "production",
      serverOnly: routeShapeSource?.serverOnly === true,
      authenticated: routeShapeSource?.authenticated === true,
      authorized: routeShapeSource?.authorized === true,
      idempotencyKeyRequired: routeShapeSource?.idempotencyKeyRequired === true,
      duplicatePreventionRequired:
        routeShapeSource?.duplicatePreventionRequired === true,
      normalizedInputOnly: routeShapeSource?.normalizedInputOnly === true,
      clientSideSupabaseInsertAllowed: false,
      devPreviewCallable: false,
      postInsertMutationSideEffectsAllowed: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    allowedInputValidationSummary: {
      sourceSummary: allowedInputSource,
      normalizedPersistenceInput:
        boundaryInput?.normalizedPersistenceInput ??
        input?.normalizedPersistenceInput ??
        null,
      normalizedInputPresent:
        allowedInputSource?.normalizedExecutionRecordInputPresent === true,
      schemaGeneratedTypesMigrationProofPresent:
        allowedInputSource?.generatedTypesSchemaReadinessProofPresent === true,
      rlsSecurityProofPresent:
        allowedInputSource?.rlsSecurityProofPresent === true,
      serverOnlyRequestContextPresent:
        allowedInputSource?.serverOnlyRequestContextPresent === true,
      routeAuthSecretModelPresent:
        isObject(input?.routeAuthSecretModelMetadata),
      idempotencyFingerprintMetadataPresent:
        allowedInputSource?.idempotencyFingerprintMetadataPresent === true,
      duplicatePreventionMetadataPresent:
        allowedInputSource?.duplicatePreventionMetadataPresent === true,
      auditCorrectionMetadataPresent:
        allowedInputSource?.auditCorrectionMetadataPresent === true,
      evidenceProvenanceChainPresent:
        allowedInputSource?.evidenceProvenanceChainPresent === true,
      manualApprovalMetadataPresent:
        allowedInputSource?.manualApprovalMetadataPresent === true,
      dryRunProductionSeparationMetadataPresent:
        Boolean(
          input?.dryRunProductionSeparationMetadata ??
            boundaryInput?.dryRunProductionSeparationMetadata ??
            boundaryInput?.dryRunSeparationSummary,
        ),
      postInsertBoundaryMetadataPresent:
        Boolean(input?.postInsertBoundaryMetadata ?? postInsertSource),
      uiStateOnlySourceAllowed: false,
      fixtureInputAllowed: false,
      dryRunDiagnosticsAllowedAsProductionInput: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    allowedOutputValidationSummary: {
      sourceSummary: allowedOutputSource,
      boundaryStatus: allowedOutputSource?.routeStatus ?? null,
      insertedRecordIdOutputAllowedForFutureRoute:
        hasText(allowedOutputSource?.insertedExecutionRecordId) ||
        Boolean(allowedOutputSource?.insertedExecutionRecordReference),
      safeSummaryOnly: Boolean(allowedOutputSource?.safeRouteOutputSummary),
      auditAppendApprovalOutput: false,
      statsPnlUpdateApprovalOutput: false,
      rollbackCorrectionApprovalOutput: false,
      tradeMutationApprovalOutput: false,
      brokerOrderApprovalOutput: false,
      avanzaBrowserApprovalOutput: false,
      automaticModeApprovalOutput: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    dryRunSeparationValidationSummary: {
      sourceSummary: dryRunSource,
      dryRunRouteDiagnosticsOnly:
        dryRunSource?.dryRunRouteDiagnosticsOnly === true,
      dryRunResultIsProductionInsert: false,
      dryRunSuccessProvesProductionReadiness: false,
      productionRouteSeparate: dryRunSource?.productionRouteSeparate === true,
      productionRouteServerOnly:
        dryRunSource?.productionRouteServerOnly === true,
      devPreviewMayCallProductionRoute: false,
      fixtureCallableMayCallProductionRoute: false,
      routeModeExplicit:
        hasText(dryRunSource?.sourceRouteMode) ||
        boundaryInput?.routeMode === "production",
      blockedReasons,
      warnings,
      reviewItems,
    },
    securityValidationSummary: {
      sourceSummary: securitySource,
      rlsSecurityProofPresent:
        securitySource?.rlsSecurityProofPresent === true,
      rlsPoliciesVerified: securitySource?.rlsPoliciesVerified === true,
      routeAuthSecretModelDefined:
        securitySource?.routeAuthSecretModelDefined === true,
      userRoleAssumptionsDocumented:
        securitySource?.userRoleAssumptionsDocumented === true,
      serviceRoleAssumptionsDocumented:
        securitySource?.serviceRoleAssumptionsDocumented === true,
      serviceRoleServerOnly: securitySource?.serviceRoleServerOnly === true,
      clientSideWriteBlocked: securitySource?.clientSideWriteBlocked === true,
      brokerAutomationAuthority: false,
      avanzaBrowserAuthority: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    serverOnlyValidationSummary: {
      sourceSummary: serverOnlySource,
      serverOnlyBoundaryProven:
        serverOnlySource?.serverOnlyBoundaryProven === true,
      serverOnlyRequestContext:
        serverOnlySource?.serverOnlyRequestContext ??
        input?.serverOnlyRequestContext ??
        null,
      routeHandlerOnly: serverOnlySource?.routeHandlerOnly === true,
      importedIntoClientCode: false,
      callableFromDevPreview: false,
      serviceRoleRestrictedToServer:
        serverOnlySource?.serviceRoleRestrictedToServer === true,
      clientSideSupabaseInsertAllowed: false,
      localStorageWriteAllowed: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    schemaGeneratedTypesMigrationValidationSummary: {
      sourceSummary: schemaSource,
      schemaReference: schemaSource?.schemaReference ?? null,
      expectedTableName: "execution_records",
      executionRecordsSchemaVerified:
        schemaSource?.executionRecordsSchemaVerified === true,
      generatedTypesPresent: schemaSource?.generatedTypesPresent === true,
      generatedTypesLocation: schemaSource?.generatedTypesLocation ?? null,
      executionRecordsTableTyped:
        schemaSource?.executionRecordsTableTyped === true,
      migrationApplicationProven:
        schemaSource?.migrationApplicationProven === true,
      migrationReference: schemaSource?.migrationReference ?? null,
      targetEnvironment: schemaSource?.targetEnvironment ?? null,
      metadataJsonCompatible:
        schemaSource?.executionRecordsSchemaVerified === true,
      requiredColumnsVerified:
        schemaSource?.executionRecordsSchemaVerified === true,
      nullableRequiredSemanticsVerified:
        schemaSource?.executionRecordsSchemaVerified === true,
      noRuntimeDbWritesInValidation: true,
      blockedReasons,
      warnings,
      reviewItems,
    },
    idempotencyDuplicateValidationSummary: {
      sourceSummary: idempotencySource,
      idempotencyKey: idempotencySource?.idempotencyKey ?? null,
      recordFingerprint: idempotencySource?.recordFingerprint ?? null,
      sourceFingerprint: idempotencySource?.sourceFingerprint ?? null,
      duplicateMatches: idempotencySource?.duplicateMatches ?? [],
      idempotencyKeyPresent:
        idempotencySource?.idempotencyKeyPresent === true,
      duplicatePreventionPresent:
        idempotencySource?.duplicatePreventionMetadataPresent === true,
      finalBrokerEvidenceIdentifiersPresent:
        evidenceSource?.finalBrokerEvidenceIdentifiersPresent === true,
      sourceEvidenceIdentityPresent:
        hasText(idempotencySource?.sourceFingerprint),
      normalizedInputFingerprintPresent:
        hasText(idempotencySource?.recordFingerprint) ||
        hasText(idempotencySource?.sourceFingerprint),
      duplicateInsertBlockedBeforeProductionInsert:
        idempotencySource?.duplicateBlocksInsert === true,
      blockedReasons,
      warnings,
      reviewItems,
    },
    auditCorrectionValidationSummary: {
      sourceSummary: auditSource,
      auditCorrectionMetadataPresent:
        auditSource?.auditCorrectionMetadataPresent === true,
      auditAppendAllowedByValidation: false,
      correctionAllowedByValidation: false,
      rollbackAllowedByValidation: false,
      postInsertAuditRequiresSeparateBoundary: true,
      correctionRollbackRequiresSeparateBoundary: true,
      blockedReasons,
      warnings,
      reviewItems,
    },
    evidenceProvenanceValidationSummary: {
      sourceSummary: evidenceSource,
      evidenceProvenanceChainPresent:
        evidenceSource?.evidenceProvenanceChainPresent === true,
      sourceFingerprintPresent:
        evidenceSource?.sourceFingerprintPresent === true,
      finalBrokerEvidenceIdentifiersPresent:
        evidenceSource?.finalBrokerEvidenceIdentifiersPresent === true,
      brokerConfirmationEvidencePresent:
        evidenceSource?.brokerConfirmationEvidencePresent === true,
      manualApprovalContext:
        evidenceSource?.manualApprovalContext ??
        input?.manualApprovalMetadata ??
        null,
      sourceEventIds: evidenceSource?.sourceEventIds ?? [],
      blockedReasons,
      warnings,
      reviewItems,
    },
    postInsertBoundaryValidationSummary: {
      sourceSummary: postInsertSource,
      safeToAppendAudit: false,
      safeToUpdateStats: false,
      safeToRollback: false,
      safeToMutateTrade: false,
      safeToRunBrokerAction: false,
      safeToRunAvanzaBrowserAction: false,
      automaticModeAllowed: false,
      auditAppendRequiresSeparateBoundary: true,
      statsUpdateRequiresSeparateBoundary: true,
      rollbackCorrectionRequiresSeparateBoundary: true,
      tradeMutationReconciliationRequiresSeparateBoundary: true,
      failureRecoveryRequiresSeparateBoundary: true,
      uiStateMutationRequiresSeparateBoundary: true,
      userNotificationRequiresSeparateBoundary: true,
      brokerOrderFollowUpRequiresSeparateBoundary: true,
      blockedReasons,
      warnings,
      reviewItems,
    },
    safetyPolicyValidationSummary: buildSafetyPolicySummary({
      sourceSafetyPolicy: boundaryInput?.safetyPolicy ?? input?.safetyPolicy,
      authorityFlags,
      blockedReasons,
      warnings,
      reviewItems,
    }),
    authorityFlags,
    blockedReasons,
    warnings,
    reviewItems,
    metadata: {
      validationOnly: true,
      designOnly: true,
      productionRouteImplementationApproval: false,
      productionRouteCallApproval: false,
      insertRouteCallApproval: false,
      executionRecordCreationApproval: false,
      persistenceWriteApproval: false,
      auditAppendApproval: false,
      statsUpdateApproval: false,
      rollbackCorrectionApproval: false,
      tradeMutationApproval: false,
      brokerOrderApproval: false,
      avanzaBrowserApproval: false,
      automaticModeApproval: false,
    },
  };
}
