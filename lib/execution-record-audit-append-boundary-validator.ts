import {
  EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_DEFAULT_SAFETY_POLICY,
  EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordAuditAppendBoundaryValidationBlockedReason,
  type ExecutionRecordAuditAppendBoundaryValidationDecisionRecommendation,
  type ExecutionRecordAuditAppendBoundaryValidationInput,
  type ExecutionRecordAuditAppendBoundaryValidationResult,
  type ExecutionRecordAuditAppendBoundaryValidationReviewItem,
  type ExecutionRecordAuditAppendBoundaryValidationSafetyPolicy,
  type ExecutionRecordAuditAppendBoundaryValidationStatus,
  type ExecutionRecordAuditAppendBoundaryValidationWarning,
} from "@/lib/execution-record-audit-append-boundary-validator-contract";
import type {
  ExecutionRecordAuditAppendDuplicatePreventionSummary,
  ExecutionRecordAuditAppendEvidenceSummary,
  ExecutionRecordAuditAppendEventCandidateSummary,
  ExecutionRecordAuditAppendIdempotencySummary,
} from "@/lib/execution-record-audit-append-boundary-contract";
import type { PersistedExecutionRecordReference } from "@/lib/execution-record-persistence-contract";

// Pure audit append boundary validation only. This module does not append audit
// data, write records, call routes, create execution records, persist/write,
// write Supabase/localStorage, update stats/PnL, roll back/correct, mutate or
// reconcile trades, update UI, notify users, run broker/order behavior,
// automate Avanza/browser behavior, or enable automatic mode.

type ReasonBuckets = {
  blocked: ExecutionRecordAuditAppendBoundaryValidationBlockedReason[];
  invalid: ExecutionRecordAuditAppendBoundaryValidationBlockedReason[];
  review: ExecutionRecordAuditAppendBoundaryValidationBlockedReason[];
};

const BASE_WARNINGS: ExecutionRecordAuditAppendBoundaryValidationWarning[] = [
  "contract_only",
  "audit_append_not_implemented",
  "audit_writer_not_implemented",
  "audit_validation_readiness_not_audit_append_execution",
  "insert_success_not_audit_append_approval",
  "post_insert_validator_readiness_not_audit_append_approval",
  "orchestrator_contract_readiness_not_audit_append_approval",
  "audit_boundary_contract_readiness_not_audit_append_approval",
  "audit_validation_success_not_stats_pnl_approval",
  "audit_validation_success_not_trade_mutation_approval",
  "audit_validation_success_not_trade_reconciliation_approval",
  "audit_validation_success_not_rollback_approval",
  "audit_validation_success_not_ui_update_approval",
  "audit_validation_success_not_notification_approval",
  "audit_validation_success_not_broker_order_approval",
  "audit_validation_success_not_avanza_browser_approval",
  "audit_validation_success_not_automatic_mode_approval",
  "automatic_mode_not_enabled",
];

const ALL_REVIEW_ITEMS: ExecutionRecordAuditAppendBoundaryValidationReviewItem[] =
  [
    "audit_append_boundary_validator_contract_review",
    "audit_boundary_input_review",
    "execution_record_reference_review",
    "inserted_execution_record_summary_review",
    "execution_record_evidence_review",
    "audit_event_candidate_validation_review",
    "evidence_provenance_validation_review",
    "idempotency_validation_review",
    "duplicate_prevention_validation_review",
    "audit_schema_validation_review",
    "security_server_only_validation_review",
    "dependency_validation_review",
    "failure_model_validation_review",
    "authority_flags_review",
    "manual_review",
    "downstream_authority_review",
    "broker_avanza_safety_review",
  ];

const AUDIT_APPEND_AUTHORITY_KEYS = [
  "auditAppendAllowed",
  "safeToAppendAudit",
  "auditAppendAttempted",
  "auditAppendRequested",
  "appendAudit",
  "auditWriteAllowed",
  "auditWriteAttempted",
  "auditWritePathPresent",
  "auditAppendImplementationPresent",
  "auditWriterPresent",
  "auditAppendImplementationAllowed",
  "auditValidationReadinessIsAuditAppendExecution",
];

const STATS_AUTHORITY_KEYS = [
  "statsPnlUpdateAllowed",
  "safeToUpdateStats",
  "statsUpdateAttempted",
  "statsPnlUpdateRequested",
  "auditValidationSuccessApprovesStatsPnlUpdate",
  "auditSuccessApprovesStatsPnlUpdate",
];

const TRADE_MUTATION_KEYS = [
  "tradeMutationAllowed",
  "safeToMutateTrade",
  "tradeMutationAttempted",
  "tradeMutationRequested",
  "auditValidationSuccessApprovesTradeMutation",
  "auditSuccessApprovesTradeMutation",
];

const TRADE_RECONCILIATION_KEYS = [
  "tradeReconciliationAllowed",
  "safeToReconcileTrade",
  "tradeReconciliationAttempted",
  "tradeReconciliationRequested",
  "auditValidationSuccessApprovesTradeReconciliation",
  "auditSuccessApprovesTradeReconciliation",
];

const ROLLBACK_KEYS = [
  "correctionRollbackAllowed",
  "safeToRollback",
  "rollbackAttempted",
  "rollbackCorrectionRequested",
  "auditValidationSuccessApprovesCorrectionRollback",
  "auditSuccessApprovesCorrectionRollback",
];

const UI_KEYS = [
  "uiStateMutationAllowed",
  "safeToUpdateUiState",
  "uiUpdateRequested",
  "uiStateUpdateRequested",
  "auditValidationSuccessApprovesUiUpdate",
  "auditSuccessApprovesUiUpdate",
];

const NOTIFICATION_KEYS = [
  "userNotificationAllowed",
  "safeToNotifyUser",
  "notificationRequested",
  "userNotificationRequested",
  "auditValidationSuccessApprovesNotification",
  "auditSuccessApprovesNotification",
];

const BROKER_AVANZA_KEYS = [
  "brokerOrderFollowUpAllowed",
  "avanzaBrowserFollowUpAllowed",
  "safeToRunBrokerAction",
  "safeToRunAvanzaBrowserAction",
  "brokerAutomationAttempted",
  "avanzaAutomationAttempted",
  "browserAutomationAttempted",
  "brokerOrderRequested",
  "avanzaBrowserRequested",
  "browserActionAllowed",
  "kopSaljTriggerAllowed",
  "auditValidationSuccessApprovesBrokerOrderFollowUp",
  "auditValidationSuccessApprovesAvanzaBrowserFollowUp",
  "auditSuccessApprovesBrokerOrderFollowUp",
  "auditSuccessApprovesAvanzaBrowserFollowUp",
];

const AUTOMATIC_MODE_KEYS = [
  "automaticModeAllowed",
  "automaticModeRequested",
  "automaticModeApprovalAllowed",
  "auditValidationSuccessApprovesAutomaticMode",
  "auditSuccessApprovesAutomaticMode",
];

const INSERT_SUCCESS_APPROVAL_KEYS = [
  "insertSuccessIsAuditAppendApproval",
  "insertSuccessApprovesAuditAppend",
  "insertSuccessMisinterpretedAsAuditApproval",
];

const POST_INSERT_APPROVAL_KEYS = [
  "postInsertValidatorReadinessIsAuditAppendApproval",
  "postInsertValidatorReadinessApprovesAuditAppend",
  "postInsertValidatorReadinessMisinterpretedAsAuditApproval",
];

const ORCHESTRATOR_APPROVAL_KEYS = [
  "orchestratorContractReadinessIsAuditAppendApproval",
  "orchestratorReadinessApprovesAuditAppend",
  "orchestratorContractReadinessMisinterpretedAsAuditApproval",
];

const AUDIT_BOUNDARY_APPROVAL_KEYS = [
  "auditBoundaryContractReadinessIsAuditAppendApproval",
  "auditBoundaryContractReadinessApprovesAuditAppend",
  "auditBoundaryContractReadinessMisinterpretedAsAuditApproval",
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

function hasAnyTruthyFlag(value: unknown, keys: string[]): boolean {
  return keys.some((key) => hasTruthyFlag(value, key));
}

function addReason(
  buckets: ReasonBuckets,
  bucket: keyof ReasonBuckets,
  reason: ExecutionRecordAuditAppendBoundaryValidationBlockedReason,
): void {
  buckets[bucket].push(reason);
}

function addAuthorityReasons(buckets: ReasonBuckets, value: unknown): void {
  if (!isObject(value)) {
    return;
  }

  if (hasAnyTruthyFlag(value, AUDIT_APPEND_AUTHORITY_KEYS)) {
    addReason(buckets, "invalid", "audit_append_requested_in_validator_phase");
  }
  if (hasAnyTruthyFlag(value, STATS_AUTHORITY_KEYS)) {
    addReason(buckets, "invalid", "stats_pnl_update_requested");
  }
  if (hasAnyTruthyFlag(value, TRADE_MUTATION_KEYS)) {
    addReason(buckets, "invalid", "trade_mutation_requested");
  }
  if (hasAnyTruthyFlag(value, TRADE_RECONCILIATION_KEYS)) {
    addReason(buckets, "invalid", "trade_reconciliation_requested");
  }
  if (hasAnyTruthyFlag(value, ROLLBACK_KEYS)) {
    addReason(buckets, "invalid", "rollback_correction_requested");
  }
  if (hasAnyTruthyFlag(value, UI_KEYS)) {
    addReason(buckets, "invalid", "ui_update_requested");
  }
  if (hasAnyTruthyFlag(value, NOTIFICATION_KEYS)) {
    addReason(buckets, "invalid", "notification_requested");
  }
  if (hasAnyTruthyFlag(value, BROKER_AVANZA_KEYS)) {
    addReason(buckets, "invalid", "broker_or_avanza_action_requested");
  }
  if (hasAnyTruthyFlag(value, AUTOMATIC_MODE_KEYS)) {
    addReason(buckets, "invalid", "automatic_mode_requested");
  }
  if (hasAnyTruthyFlag(value, INSERT_SUCCESS_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "insert_success_misinterpreted_as_audit_approval",
    );
  }
  if (hasAnyTruthyFlag(value, POST_INSERT_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "post_insert_validator_readiness_misinterpreted_as_audit_approval",
    );
  }
  if (hasAnyTruthyFlag(value, ORCHESTRATOR_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "orchestrator_contract_readiness_misinterpreted_as_audit_approval",
    );
  }
  if (hasAnyTruthyFlag(value, AUDIT_BOUNDARY_APPROVAL_KEYS)) {
    addReason(
      buckets,
      "invalid",
      "audit_boundary_contract_readiness_misinterpreted_as_audit_approval",
    );
  }
}

function collectBlockedReasons(
  buckets: ReasonBuckets,
): ExecutionRecordAuditAppendBoundaryValidationBlockedReason[] {
  return uniqueValues([
    ...buckets.invalid,
    ...buckets.blocked,
    ...buckets.review,
  ]);
}

function collectWarnings(
  blockedReasons: ExecutionRecordAuditAppendBoundaryValidationBlockedReason[],
): ExecutionRecordAuditAppendBoundaryValidationWarning[] {
  const warnings: ExecutionRecordAuditAppendBoundaryValidationWarning[] = [
    ...BASE_WARNINGS,
  ];

  if (blockedReasons.includes("idempotency_key_missing")) {
    warnings.push("idempotency_required");
  }
  if (blockedReasons.includes("duplicate_prevention_key_missing")) {
    warnings.push("duplicate_prevention_required");
  }
  if (blockedReasons.includes("evidence_provenance_missing")) {
    warnings.push("evidence_provenance_required");
  }
  if (blockedReasons.includes("generated_types_absent_or_unknown")) {
    warnings.push("generated_types_required_before_audit_append");
  }
  if (blockedReasons.includes("migration_application_not_proven")) {
    warnings.push("migration_application_required_before_audit_append");
  }
  if (blockedReasons.includes("rls_security_unverified")) {
    warnings.push("rls_security_required_before_audit_append");
  }
  if (blockedReasons.includes("server_only_boundary_unverified")) {
    warnings.push("server_only_boundary_required_before_audit_append");
  }
  if (blockedReasons.includes("audit_schema_table_unverified")) {
    warnings.push("audit_schema_must_be_proven_before_write");
  }
  if (blockedReasons.length > 0) {
    warnings.push("manual_review_may_be_required");
  }

  return uniqueValues(warnings);
}

function collectReviewItems(
  blockedReasons: ExecutionRecordAuditAppendBoundaryValidationBlockedReason[],
): ExecutionRecordAuditAppendBoundaryValidationReviewItem[] {
  return blockedReasons.length > 0 ? ALL_REVIEW_ITEMS : [];
}

function statusFromBuckets(
  input: ExecutionRecordAuditAppendBoundaryValidationInput | null | undefined,
  buckets: ReasonBuckets,
): ExecutionRecordAuditAppendBoundaryValidationStatus {
  if (!input) {
    return "audit_append_boundary_validation_absent";
  }
  if (buckets.invalid.length > 0) {
    return "audit_append_boundary_validation_invalid";
  }
  if (buckets.blocked.length > 0) {
    return "audit_append_boundary_validation_blocked";
  }
  if (buckets.review.length > 0) {
    return "audit_append_boundary_validation_needs_review";
  }

  return "audit_append_boundary_validation_ready_for_design_only";
}

function decisionFromStatus(
  status: ExecutionRecordAuditAppendBoundaryValidationStatus,
): ExecutionRecordAuditAppendBoundaryValidationDecisionRecommendation {
  switch (status) {
    case "audit_append_boundary_validation_ready_for_design_only":
      return "design_only_do_not_append_audit";
    case "audit_append_boundary_validation_needs_review":
      return "needs_manual_review";
    case "audit_append_boundary_validation_invalid":
      return "invalid_do_not_append_audit";
    case "audit_append_boundary_validation_absent":
      return "future_audit_validator_required";
    case "audit_append_boundary_validation_blocked":
    default:
      return "blocked_do_not_append_audit";
  }
}

function validationInputObjects(
  input: ExecutionRecordAuditAppendBoundaryValidationInput,
): unknown[] {
  const boundaryInput = input.auditBoundaryInput ?? null;
  const boundaryResult = input.auditBoundaryResult ?? null;

  return [
    input,
    input.boundaryAuthority,
    input.boundarySafetyPolicy,
    input.manualReviewMetadata,
    input.failureRetryMetadata,
    input.metadata,
    boundaryInput,
    boundaryInput?.authority,
    boundaryInput?.safetyPolicy,
    boundaryInput?.candidate,
    boundaryInput?.evidence,
    boundaryInput?.idempotency,
    boundaryInput?.duplicatePrevention,
    boundaryInput?.failureModel,
    boundaryInput?.dependencies,
    boundaryInput?.metadata,
    boundaryResult,
    boundaryResult?.authority,
    boundaryResult?.safetyPolicy,
    boundaryResult?.candidate,
    boundaryResult?.evidence,
    boundaryResult?.idempotency,
    boundaryResult?.duplicatePrevention,
    boundaryResult?.failureModel,
    boundaryResult?.dependencies,
    boundaryResult?.metadata,
    input.auditEventCandidate,
    input.executionRecordEvidence,
  ];
}

function textFromCandidates(...values: Array<string | null | undefined>) {
  return values.find((value) => hasText(value)) ?? null;
}

function objectFromCandidates<T extends Record<string, unknown>>(
  ...values: Array<T | Record<string, unknown> | null | undefined>
): T | null {
  return (values.find((value) => isObject(value)) as T | undefined) ?? null;
}

function referencePresent(
  executionRecordId: string | null,
  executionRecordReference: PersistedExecutionRecordReference | null,
): boolean {
  return hasText(executionRecordId) || isObject(executionRecordReference);
}

function validateBoundaryInput(
  input: ExecutionRecordAuditAppendBoundaryValidationInput | null | undefined,
): ReasonBuckets {
  const buckets: ReasonBuckets = { blocked: [], invalid: [], review: [] };
  const boundaryInput = input?.auditBoundaryInput ?? null;

  if (!input || !boundaryInput) {
    addReason(buckets, "blocked", "audit_boundary_input_missing");
    return buckets;
  }

  validationInputObjects(input).forEach((value) => {
    addAuthorityReasons(buckets, value);
  });

  const candidate = input.auditEventCandidate ?? boundaryInput.candidate ?? null;
  const evidence =
    input.executionRecordEvidence ??
    boundaryInput.executionRecordEvidence ??
    boundaryInput.evidence ??
    null;
  const dependencies =
    boundaryInput.dependencies ?? input.auditBoundaryResult?.dependencies ?? null;
  const idempotency = boundaryInput.idempotency ?? null;
  const duplicatePrevention = boundaryInput.duplicatePrevention ?? null;
  const executionRecordId = textFromCandidates(
    input.executionRecordId,
    boundaryInput.executionRecordId,
    candidate?.executionRecordId,
    evidence?.executionRecordId,
  );
  const executionRecordReference = objectFromCandidates<PersistedExecutionRecordReference>(
    input.executionRecordReference,
    boundaryInput.executionRecordReference,
    candidate?.executionRecordReference,
    evidence?.executionRecordReference,
  );
  const insertedExecutionRecordSummary = objectFromCandidates(
    input.insertedExecutionRecordSummary,
    boundaryInput.insertedExecutionRecordSummary,
    evidence?.insertedExecutionRecordSummary,
  );
  const auditEventType = textFromCandidates(
    input.auditEventType,
    boundaryInput.auditEventType,
    candidate?.auditEventType,
  );
  const auditEventSource = textFromCandidates(
    input.auditEventSource,
    boundaryInput.auditEventSource,
    candidate?.auditEventSource,
  );
  const auditEventPayloadSummary = objectFromCandidates(
    input.auditEventPayloadSummary,
    boundaryInput.auditEventPayloadSummary,
    candidate?.auditEventPayloadSummary,
  );
  const actorSourceMetadata = objectFromCandidates(
    input.actorSourceMetadata,
    boundaryInput.actorSourceMetadata,
    candidate?.actorSourceMetadata,
  );
  const timestampSourceClockMetadata = objectFromCandidates(
    input.timestampSourceClockMetadata,
    boundaryInput.timestampSourceClockMetadata,
    candidate?.timestampSourceClockMetadata,
  );
  const idempotencyKey = textFromCandidates(
    input.idempotencyKey,
    boundaryInput.idempotencyKey,
    idempotency?.idempotencyKey,
  );
  const duplicatePreventionKey = textFromCandidates(
    input.duplicatePreventionKey,
    boundaryInput.duplicatePreventionKey,
    duplicatePrevention?.duplicatePreventionKey,
  );

  if (!referencePresent(executionRecordId, executionRecordReference)) {
    addReason(buckets, "blocked", "execution_record_reference_missing");
  }
  if (!insertedExecutionRecordSummary) {
    addReason(
      buckets,
      "blocked",
      "inserted_execution_record_summary_missing",
    );
  }
  if (!evidence || evidence.executionRecordEvidencePresent !== true) {
    addReason(buckets, "blocked", "execution_record_evidence_missing");
  }
  if (
    evidence?.evidenceProvenancePresent !== true ||
    !Array.isArray(evidence?.sourceReferences) ||
    evidence.sourceReferences.length === 0
  ) {
    addReason(buckets, "blocked", "evidence_provenance_missing");
  }
  if (!hasText(auditEventType)) {
    addReason(buckets, "blocked", "audit_event_type_missing");
  }
  if (!hasText(auditEventSource)) {
    addReason(buckets, "blocked", "audit_event_source_missing");
  }
  if (!auditEventPayloadSummary) {
    addReason(buckets, "blocked", "audit_event_payload_missing");
  }
  if (!actorSourceMetadata || evidence?.actorSourceMetadataPresent !== true) {
    addReason(buckets, "blocked", "actor_source_metadata_missing");
  }
  if (
    !timestampSourceClockMetadata ||
    evidence?.timestampSourceClockMetadataPresent !== true
  ) {
    addReason(buckets, "blocked", "timestamp_source_metadata_missing");
  }
  if (!hasText(idempotencyKey)) {
    addReason(buckets, "blocked", "idempotency_key_missing");
  }
  if (!hasText(duplicatePreventionKey)) {
    addReason(buckets, "blocked", "duplicate_prevention_key_missing");
  }
  if (
    evidence?.generatedTypesProofPresent !== true ||
    dependencies?.generatedTypesPresent !== true ||
    !isObject(input.generatedTypesProof ?? boundaryInput.generatedTypesProof)
  ) {
    addReason(buckets, "blocked", "generated_types_absent_or_unknown");
  }
  if (
    evidence?.migrationProofPresent !== true ||
    dependencies?.migrationApplicationProven !== true ||
    !isObject(input.migrationProof ?? boundaryInput.migrationProof)
  ) {
    addReason(buckets, "blocked", "migration_application_not_proven");
  }
  if (
    evidence?.rlsSecurityProofPresent !== true ||
    dependencies?.rlsSecurityVerified !== true ||
    !isObject(input.rlsSecurityProof ?? boundaryInput.rlsSecurityProof)
  ) {
    addReason(buckets, "blocked", "rls_security_unverified");
  }
  if (
    evidence?.serverOnlyProofPresent !== true ||
    dependencies?.serverOnlyBoundaryVerified !== true ||
    !isObject(input.serverOnlyProof ?? boundaryInput.serverOnlyProof)
  ) {
    addReason(buckets, "blocked", "server_only_boundary_unverified");
  }
  if (
    evidence?.auditSchemaProofPresent !== true ||
    dependencies?.auditSchemaProofPresent !== true ||
    !isObject(input.auditSchemaTableProof ?? boundaryInput.auditSchemaProof)
  ) {
    addReason(buckets, "blocked", "audit_schema_table_unverified");
  }
  if (input.manualReviewMetadata || boundaryInput.manualReviewMetadata) {
    addReason(buckets, "review", "manual_review_required");
  }

  return buckets;
}

export function validateExecutionRecordAuditAppendBoundary(
  input: ExecutionRecordAuditAppendBoundaryValidationInput | null | undefined,
): ExecutionRecordAuditAppendBoundaryValidationResult {
  const buckets = validateBoundaryInput(input);
  const blockedReasons = collectBlockedReasons(buckets);
  const warnings = collectWarnings(blockedReasons);
  const reviewItems = collectReviewItems(blockedReasons);
  const status = statusFromBuckets(input, buckets);
  const boundaryInput = input?.auditBoundaryInput ?? null;
  const boundaryResult = input?.auditBoundaryResult ?? null;
  const candidate = input?.auditEventCandidate ?? boundaryInput?.candidate ?? null;
  const evidence =
    input?.executionRecordEvidence ??
    boundaryInput?.executionRecordEvidence ??
    boundaryInput?.evidence ??
    null;
  const dependencies =
    boundaryInput?.dependencies ?? boundaryResult?.dependencies ?? null;
  const idempotency = boundaryInput?.idempotency ?? null;
  const duplicatePrevention = boundaryInput?.duplicatePrevention ?? null;
  const failureModel = boundaryInput?.failureModel ?? boundaryResult?.failureModel ?? null;
  const executionRecordId = textFromCandidates(
    input?.executionRecordId,
    boundaryInput?.executionRecordId,
    candidate?.executionRecordId,
    evidence?.executionRecordId,
  );
  const executionRecordReference = objectFromCandidates<PersistedExecutionRecordReference>(
    input?.executionRecordReference,
    boundaryInput?.executionRecordReference,
    candidate?.executionRecordReference,
    evidence?.executionRecordReference,
  );
  const insertedExecutionRecordSummary = objectFromCandidates(
    input?.insertedExecutionRecordSummary,
    boundaryInput?.insertedExecutionRecordSummary,
    evidence?.insertedExecutionRecordSummary,
  );
  const auditEventType = textFromCandidates(
    input?.auditEventType,
    boundaryInput?.auditEventType,
    candidate?.auditEventType,
  );
  const auditEventSource = textFromCandidates(
    input?.auditEventSource,
    boundaryInput?.auditEventSource,
    candidate?.auditEventSource,
  );
  const auditEventPayloadSummary = objectFromCandidates(
    input?.auditEventPayloadSummary,
    boundaryInput?.auditEventPayloadSummary,
    candidate?.auditEventPayloadSummary,
  );
  const actorSourceMetadata = objectFromCandidates(
    input?.actorSourceMetadata,
    boundaryInput?.actorSourceMetadata,
    candidate?.actorSourceMetadata,
  );
  const timestampSourceClockMetadata = objectFromCandidates(
    input?.timestampSourceClockMetadata,
    boundaryInput?.timestampSourceClockMetadata,
    candidate?.timestampSourceClockMetadata,
  );
  const idempotencyKey = textFromCandidates(
    input?.idempotencyKey,
    boundaryInput?.idempotencyKey,
    idempotency?.idempotencyKey,
  );
  const duplicatePreventionKey = textFromCandidates(
    input?.duplicatePreventionKey,
    boundaryInput?.duplicatePreventionKey,
    duplicatePrevention?.duplicatePreventionKey,
  );
  const safetyPolicy: ExecutionRecordAuditAppendBoundaryValidationSafetyPolicy = {
    ...EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_DEFAULT_SAFETY_POLICY,
    boundaryAuthority: boundaryInput?.authority ?? input?.boundaryAuthority ?? null,
    boundarySafetyPolicy:
      boundaryInput?.safetyPolicy ?? input?.boundarySafetyPolicy ?? null,
  };

  return {
    contractVersion:
      EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATOR_CONTRACT_VERSION,
    status,
    decisionRecommendation: decisionFromStatus(status),
    validationOnly: true,
    designOnly: true,
    auditValidatorImplemented: false,
    auditValidationReadinessIsAuditAppendExecution: false,
    auditAppendAllowed: false,
    safeToAppendAudit: false,
    auditValidationSuccessApprovesStatsPnlUpdate: false,
    auditValidationSuccessApprovesTradeMutation: false,
    auditValidationSuccessApprovesTradeReconciliation: false,
    auditValidationSuccessApprovesCorrectionRollback: false,
    auditValidationSuccessApprovesUiUpdate: false,
    auditValidationSuccessApprovesNotification: false,
    auditValidationSuccessApprovesBrokerOrderFollowUp: false,
    auditValidationSuccessApprovesAvanzaBrowserFollowUp: false,
    candidate: {
      candidate: candidate as ExecutionRecordAuditAppendEventCandidateSummary | null,
      auditEventTypePresent: hasText(auditEventType),
      auditEventSourcePresent: hasText(auditEventSource),
      auditEventPayloadSummaryPresent: Boolean(auditEventPayloadSummary),
      actorSourceMetadataPresent: Boolean(actorSourceMetadata),
      timestampSourceClockMetadataPresent: Boolean(timestampSourceClockMetadata),
      payloadExplainable: candidate?.payloadExplainable === true,
      noSecretPayloadExposure: candidate?.noSecretPayloadExposure === true,
      noLocalOnlySourceOfTruth: candidate?.noLocalOnlySourceOfTruth === true,
      noBrokerAvanzaAssumptions: candidate?.noBrokerAvanzaAssumptions === true,
      blockedReasons,
      warnings,
      reviewItems,
    },
    evidence: {
      evidence: evidence as ExecutionRecordAuditAppendEvidenceSummary | null,
      executionRecordId,
      executionRecordReference,
      insertedExecutionRecordSummary,
      normalizedExecutionRecordInput:
        boundaryInput?.normalizedExecutionRecordInput ??
        evidence?.normalizedExecutionRecordInput ??
        null,
      productionInsertBoundaryResult:
        boundaryInput?.productionInsertBoundaryResult ??
        evidence?.productionInsertBoundaryResult ??
        null,
      postInsertBoundaryInput:
        boundaryInput?.postInsertBoundaryInput ??
        evidence?.postInsertBoundaryInput ??
        null,
      postInsertBoundaryResult:
        boundaryInput?.postInsertBoundaryResult ??
        evidence?.postInsertBoundaryResult ??
        null,
      postInsertValidatorResult:
        boundaryInput?.postInsertValidatorResult ??
        evidence?.postInsertValidatorResult ??
        null,
      postInsertOrchestratorResult:
        boundaryInput?.postInsertOrchestratorResult ??
        evidence?.postInsertOrchestratorResult ??
        null,
      executionRecordReferencePresent: referencePresent(
        executionRecordId,
        executionRecordReference,
      ),
      insertedExecutionRecordSummaryPresent: Boolean(
        insertedExecutionRecordSummary,
      ),
      executionRecordEvidencePresent:
        evidence?.executionRecordEvidencePresent === true,
      evidenceProvenancePresent: evidence?.evidenceProvenancePresent === true,
      sourceReferencesPresent:
        Array.isArray(evidence?.sourceReferences) &&
        evidence.sourceReferences.length > 0,
      blockedReasons,
      warnings,
      reviewItems,
    },
    idempotency: {
      idempotency: idempotency as ExecutionRecordAuditAppendIdempotencySummary | null,
      idempotencyKey,
      auditEventKey: idempotency?.auditEventKey ?? null,
      sourceEventFingerprint: idempotency?.sourceEventFingerprint ?? null,
      candidateFingerprint:
        idempotency?.candidateFingerprint ?? candidate?.candidateFingerprint ?? null,
      idempotencyKeyPresent: hasText(idempotencyKey),
      stableAuditEventKeyPresent:
        hasText(idempotency?.auditEventKey) ||
        hasText(candidate?.candidateFingerprint),
      sourceEventFingerprintPresent: hasText(idempotency?.sourceEventFingerprint),
      retrySafetyPresent:
        idempotency?.retryRequiresManualReview === true &&
        idempotency?.safeToRetry === false,
      safeToRetry: false,
      retryRequiresManualReview: true,
      blockedReasons,
      warnings,
      reviewItems,
    },
    duplicatePrevention: {
      duplicatePrevention:
        duplicatePrevention as ExecutionRecordAuditAppendDuplicatePreventionSummary | null,
      duplicatePreventionKey,
      duplicatePreventionKeyPresent: hasText(duplicatePreventionKey),
      duplicatePreventionMetadataPresent:
        duplicatePrevention?.duplicatePreventionMetadataPresent === true,
      duplicateMatches: duplicatePrevention?.duplicateMatches ?? [],
      duplicateAuditEventDetected:
        duplicatePrevention?.duplicateAuditEventDetected === true,
      duplicateAuditEventBlocked:
        duplicatePrevention?.duplicateAuditEventBlocked === true,
      duplicateLookupRequiredBeforeWrite: true,
      blockedReasons,
      warnings,
      reviewItems,
    },
    schema: {
      auditSchemaProof:
        input?.auditSchemaTableProof ?? boundaryInput?.auditSchemaProof ?? null,
      generatedTypesProof:
        input?.generatedTypesProof ?? boundaryInput?.generatedTypesProof ?? null,
      migrationProof: input?.migrationProof ?? boundaryInput?.migrationProof ?? null,
      auditSchemaTableVerified:
        evidence?.auditSchemaProofPresent === true &&
        dependencies?.auditSchemaProofPresent === true,
      auditGeneratedTypesPresent:
        evidence?.generatedTypesProofPresent === true &&
        dependencies?.generatedTypesPresent === true,
      executionRecordGeneratedTypesPresent:
        evidence?.generatedTypesProofPresent === true &&
        dependencies?.generatedTypesPresent === true,
      migrationApplicationProven:
        evidence?.migrationProofPresent === true &&
        dependencies?.migrationApplicationProven === true,
      auditSchemaAssumedWithoutProof:
        evidence?.auditSchemaProofPresent !== true ||
        dependencies?.auditSchemaProofPresent !== true,
      safeToWriteAudit: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    securityServerOnly: {
      rlsSecurityProof:
        input?.rlsSecurityProof ?? boundaryInput?.rlsSecurityProof ?? null,
      serverOnlyProof:
        input?.serverOnlyProof ?? boundaryInput?.serverOnlyProof ?? null,
      rlsSecurityVerified:
        evidence?.rlsSecurityProofPresent === true &&
        dependencies?.rlsSecurityVerified === true,
      serverOnlyBoundaryVerified:
        evidence?.serverOnlyProofPresent === true &&
        dependencies?.serverOnlyBoundaryVerified === true,
      clientSideAuditWriteBlocked: true,
      serviceRoleExposureBlocked: true,
      safeToWriteFromClient: false,
      safeToUseServiceRoleInClient: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    dependencies: {
      auditBoundaryContractPresent: Boolean(boundaryInput),
      auditBoundaryInputPresent: Boolean(boundaryInput),
      auditBoundaryResultPresent: Boolean(boundaryResult),
      auditValidatorContractPresent: true,
      auditValidatorImplemented: false,
      auditAppendImplemented: false,
      auditWriterImplemented: false,
      auditWritePathPresent: false,
      productionInsertRouteImplemented:
        dependencies?.productionInsertRouteImplemented === true,
      productionInsertWritePathPresent:
        dependencies?.productionInsertWritePathPresent === true,
      postInsertBoundaryContractPresent:
        dependencies?.postInsertBoundaryContractPresent === true,
      postInsertValidatorPresent: dependencies?.postInsertValidatorPresent === true,
      postInsertOrchestratorImplemented: false,
      generatedTypesPresent: dependencies?.generatedTypesPresent === true,
      migrationApplicationProven:
        dependencies?.migrationApplicationProven === true,
      rlsSecurityVerified: dependencies?.rlsSecurityVerified === true,
      serverOnlyBoundaryVerified:
        dependencies?.serverOnlyBoundaryVerified === true,
      auditSchemaTableVerified:
        dependencies?.auditSchemaProofPresent === true &&
        evidence?.auditSchemaProofPresent === true,
      blockedReasons,
      warnings,
      reviewItems,
    },
    failureModel: {
      failureModel,
      validationBlockedRepresented:
        failureModel?.auditValidationFailedRepresented === true,
      validationInvalidRepresented:
        failureModel?.auditValidationFailedRepresented === true,
      duplicateAuditCandidateRepresented:
        failureModel?.auditDuplicateDetectedRepresented === true,
      missingProofRepresented:
        failureModel?.auditBlockedAfterInsertSuccessRepresented === true,
      futureAppendWriteFailureRepresented:
        failureModel?.futureAuditWriteFailedRepresented === true,
      retryBlockedWithoutIdempotencyRepresented:
        failureModel?.auditRetryBlockedWithoutIdempotencyRepresented === true,
      manualReviewRequiredRepresented:
        failureModel?.manualReviewRequiredForPartialFailure === true,
      downstreamActionsRemainBlockedRepresented:
        failureModel?.downstreamActionsRemainBlockedRepresented === true,
      hiddenFailureAllowed: false,
      blockedReasons,
      warnings,
      reviewItems,
    },
    authority:
      EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy,
    blockedReasons,
    warnings,
    reviewItems,
    recommendedNextManualReview:
      status === "audit_append_boundary_validation_needs_review"
        ? "Manual review required before any future audit append design may proceed."
        : null,
    metadata: {
      validatorPure: true,
      validatorDeterministic: true,
      designReadinessOnly: true,
      noAuditAppend: true,
      noAuditWrite: true,
      noRouteCall: true,
      noExecutionRecordCreation: true,
      noPersistenceWrite: true,
      noStatsPnlUpdate: true,
      noRollbackCorrection: true,
      noTradeMutation: true,
      noUiUpdate: true,
      noNotification: true,
      noBrokerOrderBehavior: true,
      noAvanzaBrowserBehavior: true,
      noAutomaticMode: true,
      inputMetadata: input?.metadata ?? null,
    },
  };
}
