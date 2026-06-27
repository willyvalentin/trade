import {
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_IMPLEMENTATION_CONTRACT_VERSION,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_IMPLEMENTATION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_IMPLEMENTATION_DEFAULT_SAFETY_POLICY,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationBlockedReason,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationDecisionRecommendation,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationDependencySummary,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationEvidenceProvenanceResult,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationInput,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationNoWriteNoActionSafetySummary,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationResult,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationReviewItem,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationServerOnlySecurityDependencyResult,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationSimulatedAuditEventPayload,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationSimulatedDuplicatePreventionResult,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationSimulatedIdempotencyResult,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationSimulatedTableSchemaTarget,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationStatus,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationWarning,
} from "@/lib/execution-record-audit-append-writer-dry-run-execution-implementation-contract";

// Pure audit append writer dry-run execution simulation only. This module does
// not execute the audit writer, append/write audit data, call routes, create
// records, persist/write, write Supabase/localStorage, update stats/PnL, roll
// back/correct, mutate or reconcile trades, update UI, notify users, run
// broker/order behavior, automate Avanza/browser behavior, or enable automatic
// mode.

type ReasonBuckets = {
  blocked: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationBlockedReason[];
  invalid: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationBlockedReason[];
  review: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationBlockedReason[];
};

const BASE_WARNINGS: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationWarning[] =
  [
    "contract_only",
    "dry_run_execution_not_real_write",
    "audit_writer_not_implemented",
    "audit_route_not_implemented",
    "audit_write_not_executed",
    "dry_run_execution_implementation_not_audit_write_approval",
    "dry_run_execution_implementation_not_security_proof",
    "dry_run_execution_implementation_not_schema_proof",
    "dry_run_execution_implementation_not_downstream_approval",
    "dry_run_execution_validator_readiness_not_execution",
    "dry_run_validator_readiness_not_execution",
    "contract_validator_readiness_not_write_approval",
    "writer_validator_readiness_not_write_approval",
    "insert_success_not_audit_write_approval",
    "dev_preview_not_write_approval",
    "server_only_required",
    "service_role_must_not_be_exposed",
    "client_side_write_not_allowed",
    "audit_schema_table_proof_required",
    "generated_audit_types_required_if_schema_backed",
    "generated_execution_record_types_not_enough",
    "migration_proof_required",
    "rls_security_proof_required",
    "idempotency_required",
    "duplicate_prevention_required",
    "evidence_provenance_required",
    "automatic_mode_not_enabled",
  ];

const ALL_REVIEW_ITEMS: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationReviewItem[] =
  [
    "audit_append_writer_dry_run_execution_implementation_contract_review",
    "dry_run_execution_implementation_input_review",
    "dry_run_execution_validator_result_review",
    "dry_run_execution_contract_input_review",
    "dry_run_validator_result_review",
    "dry_run_result_input_review",
    "contract_validator_result_review",
    "writer_validator_result_review",
    "writer_contract_input_review",
    "simulated_audit_event_payload_review",
    "simulated_table_schema_target_review",
    "simulated_idempotency_review",
    "simulated_duplicate_prevention_review",
    "evidence_provenance_review",
    "server_only_security_dependency_review",
    "no_write_no_action_safety_review",
    "dependency_summary_review",
    "authority_flags_review",
    "service_role_exposure_review",
    "client_side_write_risk_review",
    "manual_review",
    "downstream_authority_review",
    "broker_avanza_safety_review",
  ];

const AUDIT_WRITE_KEYS = [
  "auditWriteAllowed",
  "safeToWriteAudit",
  "auditWriteExecuted",
  "auditWriteRequested",
  "actualAuditWriteRequested",
  "realWriteRequested",
  "safeToWriteDuplicateAuditEvent",
];

const ROUTE_KEYS = [
  "routeCallAllowed",
  "routeCallRequested",
  "auditRouteCalled",
  "productionRouteCallRequested",
  "insertRouteCallRequested",
];

const WRITER_KEYS = [
  "writerExecutionRequested",
  "auditWriterExecutionRequested",
  "writerExecuted",
];

const AUDIT_APPEND_KEYS = [
  "auditAppendAllowed",
  "safeToAppendAudit",
  "auditAppendRequested",
  "auditAppendAttempted",
];

const RECORD_CREATION_KEYS = [
  "recordCreationAllowed",
  "recordCreationRequested",
  "executionRecordCreationRequested",
];

const PERSISTENCE_KEYS = [
  "persistenceWriteAllowed",
  "persistenceWriteRequested",
  "supabaseWriteAllowed",
  "supabaseWriteRequested",
  "localStorageWriteAllowed",
  "localStorageWriteRequested",
];

const STATS_KEYS = [
  "statsPnlUpdateAllowed",
  "safeToUpdateStats",
  "statsPnlUpdateRequested",
];

const TRADE_MUTATION_KEYS = [
  "tradeMutationAllowed",
  "safeToMutateTrade",
  "tradeMutationRequested",
];

const TRADE_RECONCILIATION_KEYS = [
  "tradeReconciliationAllowed",
  "safeToReconcileTrade",
  "tradeReconciliationRequested",
];

const ROLLBACK_KEYS = [
  "correctionRollbackAllowed",
  "safeToRollback",
  "rollbackCorrectionRequested",
];

const UI_KEYS = [
  "uiStateMutationAllowed",
  "safeToUpdateUiState",
  "uiUpdateRequested",
  "uiStateUpdateRequested",
];

const NOTIFICATION_KEYS = [
  "userNotificationAllowed",
  "safeToNotifyUser",
  "notificationRequested",
  "userNotificationRequested",
];

const BROKER_AVANZA_KEYS = [
  "brokerOrderFollowUpAllowed",
  "avanzaBrowserFollowUpAllowed",
  "safeToRunBrokerAction",
  "safeToRunAvanzaBrowserAction",
  "brokerOrderRequested",
  "avanzaBrowserRequested",
  "brokerAutomationAttempted",
  "avanzaAutomationAttempted",
  "browserAutomationAttempted",
];

const AUTOMATIC_MODE_KEYS = ["automaticModeAllowed", "automaticModeRequested"];

function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function hasTruthyFlag(value: unknown, key: string): boolean {
  return isObject(value) && value[key] === true;
}

function hasAnyTruthyFlag(value: unknown, keys: string[]): boolean {
  return keys.some((key) => hasTruthyFlag(value, key));
}

function addReason(
  buckets: ReasonBuckets,
  bucket: keyof ReasonBuckets,
  reason: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationBlockedReason,
): void {
  buckets[bucket].push(reason);
}

function statusIndicatesRisk(value: string | null | undefined): boolean {
  if (!hasText(value)) {
    return false;
  }

  const status = value ?? "";

  return !/(^|_)(absent|none|false|clear|safe|no_risk)($|_)/i.test(status);
}

function proofStatusesPresent(
  input: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationInput,
): boolean {
  if (
    hasText(input.serverOnlySecurityProofStatus) &&
    hasText(input.schemaTableProofStatus) &&
    hasText(input.generatedAuditTypesProofStatus) &&
    hasText(input.migrationProofStatus) &&
    hasText(input.rlsSecurityProofStatus)
  ) {
    return true;
  }

  return Boolean(
    input.proofStatuses && Object.keys(input.proofStatuses).length > 0,
  );
}

function collectReasons(
  input: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationInput,
): ReasonBuckets {
  const buckets: ReasonBuckets = {
    blocked: [],
    invalid: [],
    review: [],
  };

  if (!input.dryRunExecutionValidatorResult) {
    addReason(buckets, "blocked", "dry_run_execution_validator_result_missing");
  } else if (
    input.dryRunExecutionValidatorResult.status !==
    "audit_append_writer_dry_run_execution_validation_ready_for_design_only"
  ) {
    addReason(buckets, "blocked", "dry_run_execution_validator_result_missing");
  }

  if (!input.dryRunExecutionContractInput) {
    addReason(buckets, "blocked", "dry_run_execution_contract_input_missing");
  }

  if (!input.dryRunValidatorResult) {
    addReason(buckets, "blocked", "dry_run_validator_result_missing");
  }

  if (!input.dryRunResultInput) {
    addReason(buckets, "blocked", "dry_run_result_input_missing");
  }

  if (!input.writerContractValidationResult) {
    addReason(buckets, "blocked", "contract_validator_result_missing");
  }

  if (!input.writerValidatorResult) {
    addReason(buckets, "blocked", "writer_validator_result_missing");
  }

  if (!input.auditWriterContractInput) {
    addReason(buckets, "blocked", "writer_contract_input_missing");
  }

  if (!input.auditEventCandidate) {
    addReason(buckets, "blocked", "audit_event_candidate_missing");
  }

  if (!input.executionRecordReference) {
    addReason(buckets, "blocked", "execution_record_reference_missing");
  }

  if (!input.evidenceProvenance) {
    addReason(buckets, "blocked", "evidence_provenance_missing");
  }

  if (!hasText(input.idempotencyKey)) {
    addReason(buckets, "blocked", "idempotency_key_missing");
  }

  if (!hasText(input.duplicatePreventionKey)) {
    addReason(buckets, "blocked", "duplicate_prevention_key_missing");
  }

  if (!proofStatusesPresent(input)) {
    addReason(buckets, "blocked", "proof_statuses_missing");
  }

  if (input.explicitDryRunOnlyFlag !== true) {
    addReason(buckets, "blocked", "explicit_dry_run_only_flag_missing");
  }

  if (statusIndicatesRisk(input.serviceRoleExposureRiskStatus)) {
    addReason(buckets, "invalid", "service_role_exposure_risk");
  }

  if (statusIndicatesRisk(input.clientSideWriteRiskStatus)) {
    addReason(buckets, "invalid", "client_side_write_risk");
  }

  const surfaces: unknown[] = [
    input,
    input.authority,
    input.safetyPolicy,
    input.noWriteNoAction,
    input.downstreamAuthorityMetadata,
  ];

  for (const surface of surfaces) {
    if (hasAnyTruthyFlag(surface, AUDIT_WRITE_KEYS)) {
      addReason(buckets, "invalid", "real_write_requested");
    }
    if (hasAnyTruthyFlag(surface, ROUTE_KEYS)) {
      addReason(buckets, "invalid", "route_call_requested");
    }
    if (hasAnyTruthyFlag(surface, WRITER_KEYS)) {
      addReason(buckets, "invalid", "writer_execution_requested");
    }
    if (hasAnyTruthyFlag(surface, AUDIT_APPEND_KEYS)) {
      addReason(buckets, "invalid", "audit_append_requested");
    }
    if (hasAnyTruthyFlag(surface, RECORD_CREATION_KEYS)) {
      addReason(buckets, "invalid", "record_creation_requested");
    }
    if (hasAnyTruthyFlag(surface, PERSISTENCE_KEYS)) {
      addReason(buckets, "invalid", "persistence_write_requested");
    }
    if (
      hasTruthyFlag(surface, "supabaseWriteAllowed") ||
      hasTruthyFlag(surface, "supabaseWriteRequested")
    ) {
      addReason(buckets, "invalid", "supabase_write_requested");
    }
    if (
      hasTruthyFlag(surface, "localStorageWriteAllowed") ||
      hasTruthyFlag(surface, "localStorageWriteRequested")
    ) {
      addReason(buckets, "invalid", "local_storage_write_requested");
    }
    if (hasAnyTruthyFlag(surface, STATS_KEYS)) {
      addReason(buckets, "invalid", "stats_pnl_update_requested");
    }
    if (hasAnyTruthyFlag(surface, TRADE_MUTATION_KEYS)) {
      addReason(buckets, "invalid", "trade_mutation_requested");
    }
    if (hasAnyTruthyFlag(surface, TRADE_RECONCILIATION_KEYS)) {
      addReason(buckets, "invalid", "trade_reconciliation_requested");
    }
    if (hasAnyTruthyFlag(surface, ROLLBACK_KEYS)) {
      addReason(buckets, "invalid", "rollback_correction_requested");
    }
    if (hasAnyTruthyFlag(surface, UI_KEYS)) {
      addReason(buckets, "invalid", "ui_update_requested");
    }
    if (hasAnyTruthyFlag(surface, NOTIFICATION_KEYS)) {
      addReason(buckets, "invalid", "notification_requested");
    }
    if (hasAnyTruthyFlag(surface, BROKER_AVANZA_KEYS)) {
      addReason(buckets, "invalid", "broker_or_avanza_action_requested");
    }
    if (hasAnyTruthyFlag(surface, AUTOMATIC_MODE_KEYS)) {
      addReason(buckets, "invalid", "automatic_mode_requested");
    }
  }

  return {
    blocked: uniqueValues(buckets.blocked),
    invalid: uniqueValues(buckets.invalid),
    review: uniqueValues(buckets.review),
  };
}

function createReviewItems(
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationBlockedReason[],
): ExecutionRecordAuditAppendWriterDryRunExecutionImplementationReviewItem[] {
  if (blockedReasons.length === 0) {
    return [];
  }

  return ALL_REVIEW_ITEMS;
}

function createWarnings(
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationBlockedReason[],
): ExecutionRecordAuditAppendWriterDryRunExecutionImplementationWarning[] {
  const warnings = [...BASE_WARNINGS];

  if (blockedReasons.length > 0) {
    warnings.push("manual_review_may_be_required");
  }

  return uniqueValues(warnings);
}

function createStatus(
  inputPresent: boolean,
  reasons: ReasonBuckets,
): ExecutionRecordAuditAppendWriterDryRunExecutionImplementationStatus {
  if (!inputPresent) {
    return "audit_append_writer_dry_run_execution_implementation_absent";
  }

  if (reasons.invalid.length > 0) {
    return "audit_append_writer_dry_run_execution_implementation_invalid";
  }

  if (reasons.blocked.length > 0) {
    return "audit_append_writer_dry_run_execution_implementation_blocked";
  }

  if (reasons.review.length > 0) {
    return "audit_append_writer_dry_run_execution_implementation_needs_review";
  }

  return "audit_append_writer_dry_run_execution_implementation_ready_for_design_only";
}

function createDecision(
  status: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationStatus,
): ExecutionRecordAuditAppendWriterDryRunExecutionImplementationDecisionRecommendation {
  if (
    status ===
    "audit_append_writer_dry_run_execution_implementation_ready_for_design_only"
  ) {
    return "design_only_do_not_write_audit";
  }

  if (status === "audit_append_writer_dry_run_execution_implementation_invalid") {
    return "invalid_do_not_write_audit";
  }

  if (
    status ===
    "audit_append_writer_dry_run_execution_implementation_needs_review"
  ) {
    return "needs_manual_review";
  }

  if (status === "audit_append_writer_dry_run_execution_implementation_absent") {
    return "future_audit_writer_dry_run_execution_implementation_required";
  }

  return "blocked_do_not_write_audit";
}

function createSimulatedAuditEventPayload(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionImplementationInput
    | null
    | undefined,
  ready: boolean,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionImplementationSimulatedAuditEventPayload {
  const source =
    input?.dryRunExecutionContractResult?.simulatedAuditEventPayload ??
    input?.dryRunExecutionContractInput?.simulatedAuditEventPayload ??
    null;

  return {
    statusKnown: true,
    readyForDesignOnly: ready,
    hypotheticalOnly: true,
    nonPersistent: true,
    sourceDryRunExecutionSummary: source,
    simulatedPayloadPresent: Boolean(input?.auditEventCandidate),
    wouldAttemptAuditWrite: ready && Boolean(input?.auditEventCandidate),
    auditWriteExecuted: false,
    auditWriteAllowed: false,
    safeToWriteAudit: false,
    auditEventCandidatePresent: Boolean(input?.auditEventCandidate),
    auditEventType:
      input?.auditWriterContractInput?.auditEventType ??
      source?.auditEventType ??
      null,
    auditEventSource:
      input?.auditWriterContractInput?.auditEventSource ??
      source?.auditEventSource ??
      null,
    auditPayloadShape:
      input?.auditWriterContractInput?.auditEventPayloadSummary ??
      source?.auditPayloadShape ??
      null,
    executionRecordReference: input?.executionRecordReference ?? null,
    executionRecordReferencePresent: Boolean(input?.executionRecordReference),
    resultIsAuditWriteApproval: false,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function createSimulatedTableSchemaTarget(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionImplementationInput
    | null
    | undefined,
  ready: boolean,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionImplementationSimulatedTableSchemaTarget {
  const source =
    input?.dryRunExecutionContractResult?.simulatedTableSchemaTarget ??
    input?.dryRunExecutionContractInput?.simulatedTableSchemaTarget ??
    null;

  return {
    statusKnown: true,
    readyForDesignOnly: ready,
    sourceDryRunExecutionSummary: source,
    targetTable: source?.targetTable ?? "execution_record_audit",
    targetSchema: source?.targetSchema ?? "public",
    schemaTableStatusKnown: hasText(input?.schemaTableProofStatus),
    schemaTableProofPresent: hasText(input?.schemaTableProofStatus),
    generatedAuditTypesStatusKnown: hasText(input?.generatedAuditTypesProofStatus),
    generatedAuditTypesProofPresent: hasText(
      input?.generatedAuditTypesProofStatus,
    ),
    generatedExecutionRecordTypesPresent:
      source?.generatedExecutionRecordTypesPresent ?? false,
    generatedExecutionRecordTypesAssumedEnough: false,
    migrationStatusKnown: hasText(input?.migrationProofStatus),
    migrationProofPresent: hasText(input?.migrationProofStatus),
    rlsSecurityStatusKnown: hasText(input?.rlsSecurityProofStatus),
    rlsSecurityProofPresent: hasText(input?.rlsSecurityProofStatus),
    schemaTableAssumedWithoutProof: false,
    resultIsSchemaProof: false,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function createSimulatedIdempotency(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionImplementationInput
    | null
    | undefined,
  ready: boolean,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionImplementationSimulatedIdempotencyResult {
  const source =
    input?.dryRunExecutionContractResult?.simulatedIdempotency ??
    input?.dryRunExecutionContractInput?.simulatedIdempotency ??
    null;

  return {
    statusKnown: true,
    readyForDesignOnly: ready,
    sourceDryRunExecutionSummary: source,
    idempotencyKey: input?.idempotencyKey ?? source?.idempotencyKey ?? null,
    idempotencyKeyPresent: hasText(input?.idempotencyKey),
    idempotencyMetadataComplete:
      hasText(input?.idempotencyKey) && Boolean(input?.auditWriterContractInput),
    retrySafetyRepresented: source?.retrySafetyRepresented ?? hasText(input?.idempotencyKey),
    unknownWriteStatusRepresented:
      source?.unknownWriteStatusRepresented ?? hasText(input?.idempotencyKey),
    simulatedWriteIdempotent: ready && hasText(input?.idempotencyKey),
    idempotentWriteExecuted: false,
    resultIsWriteApproval: false,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function createSimulatedDuplicatePrevention(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionImplementationInput
    | null
    | undefined,
  ready: boolean,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionImplementationSimulatedDuplicatePreventionResult {
  const source =
    input?.dryRunExecutionContractResult?.simulatedDuplicatePrevention ??
    input?.dryRunExecutionContractInput?.simulatedDuplicatePrevention ??
    null;

  return {
    statusKnown: true,
    readyForDesignOnly: ready,
    sourceDryRunExecutionSummary: source,
    duplicatePreventionKey:
      input?.duplicatePreventionKey ?? source?.duplicatePreventionKey ?? null,
    duplicatePreventionKeyPresent: hasText(input?.duplicatePreventionKey),
    duplicatePreventionMetadataComplete:
      hasText(input?.duplicatePreventionKey) &&
      Boolean(input?.auditWriterContractInput),
    duplicateMatches: source?.duplicateMatches ?? [],
    simulatedDuplicateWriteWouldBeBlocked:
      ready && hasText(input?.duplicatePreventionKey),
    duplicateWriteExecuted: false,
    safeToWriteDuplicateAuditEvent: false,
    resultIsWriteApproval: false,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function createEvidenceProvenance(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionImplementationInput
    | null
    | undefined,
  ready: boolean,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionImplementationEvidenceProvenanceResult {
  const source =
    input?.dryRunExecutionContractResult?.evidenceProvenance ??
    input?.dryRunExecutionContractInput?.evidenceProvenanceSummary ??
    null;

  return {
    statusKnown: true,
    readyForDesignOnly: ready,
    sourceDryRunExecutionSummary: source,
    executionRecordReference: input?.executionRecordReference ?? null,
    executionRecordReferencePresent: Boolean(input?.executionRecordReference),
    evidenceProvenancePresent: Boolean(input?.evidenceProvenance),
    actorSourceMetadataPresent:
      source?.actorSourceMetadataPresent ?? Boolean(input?.evidenceProvenance),
    timestampSourceClockPresent:
      source?.timestampSourceClockPresent ?? Boolean(input?.evidenceProvenance),
    auditEventCandidatePresent: Boolean(input?.auditEventCandidate),
    sourceReferences: source?.sourceReferences ?? [],
    noLocalOnlySourceOfTruth:
      source?.noLocalOnlySourceOfTruth ?? Boolean(input?.evidenceProvenance),
    provenanceTraceComplete:
      source?.provenanceTraceComplete ?? Boolean(input?.evidenceProvenance),
    resultIsSecurityProof: false,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function createServerOnlySecurity(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionImplementationInput
    | null
    | undefined,
  ready: boolean,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionImplementationServerOnlySecurityDependencyResult {
  const source =
    input?.dryRunExecutionContractResult?.serverOnlySecurity ??
    input?.dryRunExecutionContractInput?.serverOnlySecurity ??
    null;

  return {
    statusKnown: true,
    readyForDesignOnly: ready,
    sourceDryRunExecutionSummary: source,
    serverOnlySecurityStatusKnown: hasText(input?.serverOnlySecurityProofStatus),
    serverOnlyProofPresent: hasText(input?.serverOnlySecurityProofStatus),
    serviceRoleProofPresent: source?.serviceRoleProofPresent ?? false,
    serviceRoleExposureRisk: statusIndicatesRisk(
      input?.serviceRoleExposureRiskStatus,
    ),
    clientSideWriteRisk: statusIndicatesRisk(input?.clientSideWriteRiskStatus),
    routeAuthBoundaryProofPresent: source?.routeAuthBoundaryProofPresent ?? false,
    serviceRoleSecretValuesForbidden: true,
    clientSideWriteForbidden: true,
    resultIsServerOnlyProof: false,
    resultIsRlsSecurityProof: false,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function createNoWriteNoAction(
  ready: boolean,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationReviewItem[],
  input?:
    | ExecutionRecordAuditAppendWriterDryRunExecutionImplementationInput
    | null,
): ExecutionRecordAuditAppendWriterDryRunExecutionImplementationNoWriteNoActionSafetySummary {
  return {
    statusKnown: true,
    readyForDesignOnly: ready,
    sourceDryRunExecutionSummary:
      input?.dryRunExecutionContractResult?.noWriteNoAction ??
      input?.dryRunExecutionContractInput?.noWriteNoAction ??
      null,
    validationOnly: true,
    designOnly: true,
    dryRunExecutionOnly: true,
    hypotheticalOnly: true,
    nonPersistent: true,
    dryRunExecutionImplementationImplemented: false,
    dryRunExecutionAllowed: false,
    dryRunExecutedAgainstRealData: false,
    auditWriteExecuted: false,
    auditWriteAllowed: false,
    auditAppendAllowed: false,
    routeCallAllowed: false,
    recordCreationAllowed: false,
    persistenceWriteAllowed: false,
    supabaseWriteAllowed: false,
    localStorageWriteAllowed: false,
    statsPnlUpdateAllowed: false,
    tradeMutationAllowed: false,
    tradeReconciliationAllowed: false,
    correctionRollbackAllowed: false,
    uiStateMutationAllowed: false,
    userNotificationAllowed: false,
    brokerAvanzaActionAllowed: false,
    automaticModeAllowed: false,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

function createDependencies(
  input:
    | ExecutionRecordAuditAppendWriterDryRunExecutionImplementationInput
    | null
    | undefined,
  ready: boolean,
  blockedReasons: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationBlockedReason[],
  warnings: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationWarning[],
  reviewItems: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationReviewItem[],
): ExecutionRecordAuditAppendWriterDryRunExecutionImplementationDependencySummary {
  const source =
    input?.dryRunExecutionContractResult?.dependencies ??
    input?.dryRunExecutionContractInput?.dependencies ??
    null;

  return {
    statusKnown: true,
    readyForDesignOnly: ready,
    dryRunExecutionValidatorResultPresent: Boolean(
      input?.dryRunExecutionValidatorResult,
    ),
    dryRunExecutionContractInputPresent: Boolean(
      input?.dryRunExecutionContractInput,
    ),
    dryRunExecutionContractResultPresent: Boolean(
      input?.dryRunExecutionContractResult,
    ),
    dryRunValidatorResultPresent: Boolean(input?.dryRunValidatorResult),
    dryRunResultInputPresent: Boolean(input?.dryRunResultInput),
    contractValidatorResultPresent: Boolean(input?.writerContractValidationResult),
    writerValidatorResultPresent: Boolean(input?.writerValidatorResult),
    writerContractInputPresent: Boolean(input?.auditWriterContractInput),
    dryRunExecutionImplementationImplemented: false,
    dryRunExecutionImplemented: false,
    dryRunImplemented: false,
    writerImplemented: false,
    auditAppendImplemented: false,
    auditRouteImplemented: false,
    auditWritePathPresent: false,
    productionInsertRouteImplemented:
      source?.productionInsertRouteImplemented ?? false,
    productionInsertWritePathPresent:
      source?.productionInsertWritePathPresent ?? false,
    serverOnlyProofPresent: hasText(input?.serverOnlySecurityProofStatus),
    serviceRoleProofPresent: source?.serviceRoleProofPresent ?? false,
    auditSchemaTableProofPresent: hasText(input?.schemaTableProofStatus),
    generatedAuditTypesProofPresent: hasText(
      input?.generatedAuditTypesProofStatus,
    ),
    generatedTypesProofPresent: source?.generatedTypesProofPresent ?? false,
    migrationProofPresent: hasText(input?.migrationProofStatus),
    rlsSecurityProofPresent: hasText(input?.rlsSecurityProofStatus),
    devPreviewDiagnosticsAreProof: false,
    blockedReasons,
    warnings,
    reviewItems,
  };
}

export function executeAuditAppendWriterDryRun(
  input?:
    | ExecutionRecordAuditAppendWriterDryRunExecutionImplementationInput
    | null,
): ExecutionRecordAuditAppendWriterDryRunExecutionImplementationResult {
  const inputPresent = Boolean(input);
  const reasons = input ? collectReasons(input) : {
    blocked: ["dry_run_execution_implementation_input_missing"],
    invalid: [],
    review: [],
  } satisfies ReasonBuckets;
  const blockedReasons = uniqueValues([
    ...reasons.blocked,
    ...reasons.invalid,
    ...reasons.review,
  ]);
  const status = createStatus(inputPresent, reasons);
  const ready =
    status ===
    "audit_append_writer_dry_run_execution_implementation_ready_for_design_only";
  const warnings = createWarnings(blockedReasons);
  const reviewItems = createReviewItems(blockedReasons);

  return {
    contractVersion:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_IMPLEMENTATION_CONTRACT_VERSION,
    status,
    decisionRecommendation: createDecision(status),
    validationOnly: true,
    designOnly: true,
    dryRunExecutionOnly: true,
    hypotheticalOnly: true,
    nonPersistent: true,
    dryRunExecutionImplementationImplemented: false,
    dryRunExecutionAllowed: false,
    dryRunExecutedAgainstRealData: false,
    auditWriteExecuted: false,
    auditWriteAllowed: false,
    safeToWriteAudit: false,
    implementationResultIsAuditWriteApproval: false,
    implementationResultIsAuditAppendExecution: false,
    implementationResultIsRouteCallApproval: false,
    implementationResultIsRecordCreationApproval: false,
    implementationResultIsPersistenceWriteApproval: false,
    implementationResultIsSupabaseLocalStorageWriteApproval: false,
    implementationResultIsSecurityProof: false,
    implementationResultIsServerOnlyProof: false,
    implementationResultIsSchemaProof: false,
    implementationResultIsGeneratedTypesProof: false,
    implementationResultIsMigrationProof: false,
    implementationResultIsRlsSecurityProof: false,
    implementationResultIsDownstreamApproval: false,
    dryRunExecutionValidatorReadinessIsExecution: false,
    dryRunValidatorReadinessIsExecution: false,
    contractValidatorReadinessIsWriteApproval: false,
    writerValidatorReadinessIsWriteApproval: false,
    insertSuccessIsAuditWriteApproval: false,
    devPreviewDiagnosticsAreWriteApproval: false,
    simulatedAuditEventPayload: createSimulatedAuditEventPayload(
      input,
      ready,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    simulatedTableSchemaTarget: createSimulatedTableSchemaTarget(
      input,
      ready,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    simulatedIdempotency: createSimulatedIdempotency(
      input,
      ready,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    simulatedDuplicatePrevention: createSimulatedDuplicatePrevention(
      input,
      ready,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    evidenceProvenance: createEvidenceProvenance(
      input,
      ready,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    serverOnlySecurity: createServerOnlySecurity(
      input,
      ready,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    noWriteNoAction: createNoWriteNoAction(
      ready,
      blockedReasons,
      warnings,
      reviewItems,
      input,
    ),
    dependencies: createDependencies(
      input,
      ready,
      blockedReasons,
      warnings,
      reviewItems,
    ),
    authority:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_IMPLEMENTATION_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_IMPLEMENTATION_DEFAULT_SAFETY_POLICY,
    blockedReasons,
    warnings,
    reviewItems,
    recommendedNextManualReview:
      blockedReasons.length > 0
        ? "Review blocked dry-run execution implementation diagnostics before any future implementation or route work."
        : null,
    metadata: {
      implementationPure: true,
      implementationDeterministic: true,
      dryRunSimulationOnly: true,
      readyMeansDesignOnlyDoNotWriteAudit: true,
      noAuditWriter: true,
      noAuditAppend: true,
      noAuditWrite: true,
      noRouteCall: true,
      noExecutionRecordCreation: true,
      noPersistenceWrite: true,
      noSupabaseWrite: true,
      noLocalStorageWrite: true,
      noStatsPnlUpdate: true,
      noRollbackCorrection: true,
      noTradeMutation: true,
      noTradeReconciliation: true,
      noUiUpdate: true,
      noNotification: true,
      noBrokerOrderBehavior: true,
      noAvanzaBrowserBehavior: true,
      noAutomaticMode: true,
      sourceMetadata: input?.metadata ?? null,
    },
  };
}
