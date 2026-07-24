import {
  EXECUTION_RECORD_PERSISTENCE_CONTRACT_VERSION,
  type ExecutionRecordDuplicateMatch,
  type ExecutionRecordPersistenceAuditMetadata,
  type ExecutionRecordPersistenceInput,
  type ExecutionRecordPersistenceRejectionReason,
  type ExecutionRecordPersistenceResult,
  type ExecutionRecordPersistenceWarning,
} from "@/lib/execution-record-persistence-contract";

function normalizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function uniqueReasons(
  reasons: ExecutionRecordPersistenceRejectionReason[],
): ExecutionRecordPersistenceRejectionReason[] {
  return Array.from(new Set(reasons));
}

function uniqueWarnings(
  warnings: ExecutionRecordPersistenceWarning[],
): ExecutionRecordPersistenceWarning[] {
  return Array.from(new Set(warnings));
}

function hasPositiveNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function sourceBrokerMetadata(input: ExecutionRecordPersistenceInput) {
  const provenance = input.candidate.provenanceMetadata;

  if (!isObject(provenance)) {
    return null;
  }

  const metadata = provenance.sourceBrokerResultMetadata;

  return isObject(metadata) ? metadata : null;
}

function hasTruthyMetadataFlag(
  input: ExecutionRecordPersistenceInput,
  key: string,
): boolean {
  return sourceBrokerMetadata(input)?.[key] === true;
}

function isDevFixtureCandidate(input: ExecutionRecordPersistenceInput): boolean {
  const metadata = sourceBrokerMetadata(input);

  return (
    metadata?.fixtureOnly === true ||
    metadata?.source === "execution_record_creation_dev_fixture"
  );
}

function baseAuditMetadata(
  input: ExecutionRecordPersistenceInput,
): ExecutionRecordPersistenceAuditMetadata {
  return {
    ...input.auditMetadata,
    noTradeMutation: true,
    noAuditAppendInContract: true,
    tradeMutationAttempted: false,
    idempotencyKey: normalizeText(input.idempotencyKey),
    recordFingerprint: normalizeText(input.recordFingerprint),
    sourceFingerprint: normalizeText(input.sourceFingerprint),
    brokerResultFingerprint:
      normalizeText(input.brokerConfirmation.brokerResultFingerprint) ??
      normalizeText(input.candidate.brokerResultFingerprint),
    handoffSessionId:
      normalizeText(input.association.handoffSessionId) ??
      normalizeText(input.candidate.handoffSessionId),
  };
}

function duplicateMatches(
  input: ExecutionRecordPersistenceInput,
): ExecutionRecordDuplicateMatch[] {
  return Array.isArray(input.duplicateMatches)
    ? input.duplicateMatches.filter(
        (match): match is ExecutionRecordDuplicateMatch =>
          isObject(match) && typeof match.existingRecordId === "string",
      )
    : [];
}

export function validateExecutionRecordPersistenceInput(
  input: ExecutionRecordPersistenceInput,
): ExecutionRecordPersistenceResult {
  const checklist = input.safetyChecklist;
  const candidate = input.candidate;
  const warnings = uniqueWarnings([
    ...(input.association.associationWarnings ?? []),
    ...(checklist.auditPolicyReviewed ? [] : ["audit_append_deferred" as const]),
    "trade_mutation_deferred",
    "statistics_integration_deferred",
    ...(input.schemaReference ? [] : ["rls_policy_pending_review" as const]),
  ]);
  const reasons: ExecutionRecordPersistenceRejectionReason[] = [];
  const reviewReasons: ExecutionRecordPersistenceRejectionReason[] = [];
  const duplicates = duplicateMatches(input);

  if (!checklist.candidateValidated) {
    reasons.push("candidate_not_validated");
  }

  if (!checklist.candidateSafeToPersist) {
    reasons.push("candidate_not_safe_to_persist");
  }

  if (
    !normalizeText(input.idempotencyKey) ||
    !normalizeText(candidate.idempotencyKey) ||
    !checklist.hasIdempotencyKey
  ) {
    reasons.push("missing_idempotency_key");
  }

  if (
    !normalizeText(input.recordFingerprint) ||
    !normalizeText(candidate.recordFingerprint) ||
    !checklist.hasRecordFingerprint
  ) {
    reasons.push("missing_record_fingerprint");
  }

  if (
    !normalizeText(input.sourceFingerprint) ||
    !normalizeText(candidate.sourceEvidenceFingerprint) ||
    !normalizeText(input.brokerConfirmation.sourceFingerprint) ||
    !checklist.hasSourceFingerprint
  ) {
    reasons.push("missing_source_fingerprint");
  }

  if (
    !normalizeText(input.userContext.userId) &&
    !normalizeText(input.userContext.accountId)
  ) {
    reasons.push("missing_user_context");
  }

  if (!checklist.hasUserOrAccountContext) {
    reasons.push("missing_user_context");
  }

  if (
    !checklist.hasConfirmedBrokerResult ||
    (!normalizeText(input.brokerConfirmation.brokerOrderId) &&
      !normalizeText(input.brokerConfirmation.brokerConfirmationId) &&
      !normalizeText(candidate.brokerOrderId) &&
      !normalizeText(candidate.brokerConfirmationId))
  ) {
    reasons.push("missing_broker_confirmation");
  }

  if (
    !normalizeText(input.brokerConfirmation.confirmedAt) ||
    !normalizeText(candidate.confirmationTimestamp)
  ) {
    reasons.push("missing_confirmation_timestamp");
  }

  if (!checklist.notPreviewOnly || hasTruthyMetadataFlag(input, "previewOnly")) {
    reasons.push("preview_only_candidate");
  }

  if (!checklist.notDevFixture || isDevFixtureCandidate(input)) {
    reasons.push("dev_fixture_candidate_not_allowed");
  }

  if (!checklist.notSynthetic || hasTruthyMetadataFlag(input, "isSynthetic")) {
    reasons.push("synthetic_candidate_not_allowed");
  }

  if (!checklist.notMock || hasTruthyMetadataFlag(input, "isMock")) {
    reasons.push("mock_candidate_not_allowed");
  }

  if (!checklist.schemaAvailable || !input.schemaReference) {
    reasons.push("schema_unavailable");
  }

  if (!checklist.rlsContextPresent) {
    reasons.push("rls_context_missing");
  }

  if (candidate.broker !== "avanza" || input.brokerConfirmation.broker !== "avanza") {
    reasons.push("unsupported_broker");
  }

  if (candidate.executionMode === "automatic" && !checklist.automaticModeReviewed) {
    reviewReasons.push("automatic_mode_requires_review");
  }

  if (candidate.executionPhase !== "entry" && candidate.executionPhase !== "exit") {
    reasons.push("unsupported_execution_phase");
  }

  if (!hasPositiveNumber(candidate.quantity)) {
    reasons.push("invalid_quantity");
  }

  if (!hasPositiveNumber(candidate.price)) {
    reasons.push("invalid_price");
  }

  if (input.brokerConfirmation.sourceFingerprint !== input.sourceFingerprint) {
    reviewReasons.push("instrument_mismatch");
  }

  if (
    input.association.tradeAssociationConfidence === "ambiguous" ||
    !checklist.hasUnambiguousTradeAssociation
  ) {
    reviewReasons.push("ambiguous_trade_association");
  }

  if (!checklist.tradeMutationSeparated) {
    reasons.push("trade_mutation_not_allowed");
  }

  if (!checklist.auditPolicyReviewed) {
    reviewReasons.push("audit_policy_missing");
  }

  const auditMetadata = baseAuditMetadata(input);
  const idempotencyKey = normalizeText(input.idempotencyKey);
  const recordFingerprint = normalizeText(input.recordFingerprint);
  const rejectionReasons = uniqueReasons(reasons);

  if (duplicates.length > 0 && rejectionReasons.length === 0) {
    return {
      contractVersion: EXECUTION_RECORD_PERSISTENCE_CONTRACT_VERSION,
      evaluatedAt: input.requestedAt,
      status: "duplicate",
      safeToWrite: false,
      warnings,
      rejectionReasons: uniqueReasons([
        "duplicate_execution_record",
        ...(duplicates.some((match) => match.conflictRequiresReview)
          ? ["conflicting_duplicate_match" as const]
          : []),
      ]),
      duplicateMatches: duplicates,
      idempotencyKey,
      recordFingerprint,
      auditMetadata,
    };
  }

  if (rejectionReasons.length > 0) {
    return {
      contractVersion: EXECUTION_RECORD_PERSISTENCE_CONTRACT_VERSION,
      evaluatedAt: input.requestedAt,
      status: "rejected",
      safeToWrite: false,
      warnings,
      rejectionReasons,
      duplicateMatches: duplicates,
      idempotencyKey,
      recordFingerprint,
      auditMetadata,
    };
  }

  const needsReviewReasons = uniqueReasons(reviewReasons);

  if (needsReviewReasons.length > 0) {
    return {
      contractVersion: EXECUTION_RECORD_PERSISTENCE_CONTRACT_VERSION,
      evaluatedAt: input.requestedAt,
      status: "needs_review",
      safeToWrite: false,
      warnings,
      rejectionReasons: needsReviewReasons,
      duplicateMatches: duplicates,
      idempotencyKey,
      recordFingerprint,
      auditMetadata,
    };
  }

  return {
    contractVersion: EXECUTION_RECORD_PERSISTENCE_CONTRACT_VERSION,
    evaluatedAt: input.requestedAt,
    status: "eligible",
    safeToWrite: true,
    warnings,
    rejectionReasons: [],
    duplicateMatches: [],
    idempotencyKey,
    recordFingerprint,
    auditMetadata,
  };
}
