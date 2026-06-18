import {
  EXECUTION_RECORD_CREATION_CONTRACT_VERSION,
  type ExecutionRecordCreationAuditMetadata,
  type ExecutionRecordCreationInput,
  type ExecutionRecordCreationMode,
  type ExecutionRecordCreationPhase,
  type ExecutionRecordCreationRejectionReason,
  type ExecutionRecordCreationResult,
  type ExecutionRecordCreationSide,
  type ExecutionRecordCreationWarning,
  type ExecutionRecordSourceBrokerExecutionResult,
} from "@/lib/execution-record-creation-contract";

type PartialCreationInput = Partial<ExecutionRecordCreationInput>;

const filledStatuses = new Set(["filled", "executed"]);
const placedOnlyStatuses = new Set(["submitted", "accepted", "placed"]);

function normalizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeLower(value: string | null | undefined): string | null {
  return normalizeText(value)?.toLowerCase() ?? null;
}

function normalizeTicker(value: string | null | undefined): string | null {
  return normalizeText(value)?.toUpperCase() ?? null;
}

function isPositiveFiniteNumber(value: number | null | undefined): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function addUnique<T extends string>(items: T[], item: T) {
  if (!items.includes(item)) {
    items.push(item);
  }
}

function buildAuditMetadata(
  input: PartialCreationInput,
): ExecutionRecordCreationAuditMetadata {
  return {
    noSupabaseWrite: true,
    noTradeMutation: true,
    noBrokerExecution: true,
    noAvanzaAutomation: true,
    creationAttempted: false,
    persistenceAttempted: false,
    tradeMutationAttempted: false,
    sourceEventIds: input.auditContext?.sourceEventIds ?? [],
    sourceEvidenceFingerprint: input.idempotency?.sourceEvidenceFingerprint ?? null,
    brokerResultFingerprint: input.idempotency?.brokerResultFingerprint ?? null,
    handoffPayloadFingerprint:
      input.idempotency?.handoffPayloadFingerprint ?? null,
    handoffSessionId: input.auditContext?.handoffSessionId ?? null,
    payloadId: input.auditContext?.payloadId ?? null,
    captureId: input.idempotency?.captureId ?? null,
    requestId: input.idempotency?.requestId ?? null,
    createdBy: input.auditContext?.createdBy ?? null,
  };
}

function buildResultBase(input: PartialCreationInput) {
  return {
    contractVersion: EXECUTION_RECORD_CREATION_CONTRACT_VERSION,
    evaluatedAt: normalizeText(input.requestedAt) ?? "",
    warnings: [] as ExecutionRecordCreationWarning[],
    blockers: [] as string[],
    idempotencyKey: normalizeText(input.idempotency?.idempotencyKey) ?? null,
    recordFingerprint:
      normalizeText(input.idempotency?.brokerResultFingerprint) ??
      normalizeText(input.idempotency?.sourceEvidenceFingerprint),
    auditMetadata: buildAuditMetadata(input),
  };
}

function getBroker(
  input: PartialCreationInput,
  source: ExecutionRecordSourceBrokerExecutionResult | null,
): string | null {
  return (
    normalizeLower(input.brokerMetadata?.broker) ??
    normalizeLower(source?.broker) ??
    normalizeLower(source?.brokerHint) ??
    normalizeLower(source?.broker_hint)
  );
}

function getSourceSide(
  source: ExecutionRecordSourceBrokerExecutionResult | null,
): string | null {
  return normalizeLower(source?.side) ?? normalizeLower(source?.action);
}

function getSourceQuantity(
  source: ExecutionRecordSourceBrokerExecutionResult | null,
): number | null {
  return source?.filledQuantity ?? source?.filled_quantity ?? source?.quantity ?? null;
}

function getSourcePrice(
  source: ExecutionRecordSourceBrokerExecutionResult | null,
): number | null {
  return source?.averageFillPrice ?? source?.average_fill_price ?? source?.price ?? null;
}

function getSourceBrokerOrderId(
  source: ExecutionRecordSourceBrokerExecutionResult | null,
): string | null {
  return normalizeText(source?.brokerOrderId) ?? normalizeText(source?.broker_order_id);
}

function getSourceBrokerConfirmationId(
  source: ExecutionRecordSourceBrokerExecutionResult | null,
): string | null {
  return (
    normalizeText(source?.brokerConfirmationId) ??
    normalizeText(source?.broker_confirmation_id)
  );
}

function getSourceBrokerReference(
  source: ExecutionRecordSourceBrokerExecutionResult | null,
): string | null {
  return (
    normalizeText(source?.brokerReference) ?? normalizeText(source?.broker_reference)
  );
}

function getConfirmationTimestamp(
  input: PartialCreationInput,
  source: ExecutionRecordSourceBrokerExecutionResult | null,
): string | null {
  return (
    normalizeText(input.brokerMetadata?.confirmationTimestamp) ??
    normalizeText(source?.confirmationTimestamp) ??
    normalizeText(source?.confirmation_timestamp) ??
    normalizeText(source?.confirmedAt) ??
    normalizeText(source?.confirmed_at)
  );
}

function hasBrokerReference(
  input: PartialCreationInput,
  source: ExecutionRecordSourceBrokerExecutionResult | null,
): boolean {
  return Boolean(
    normalizeText(input.brokerMetadata?.brokerOrderId) ??
      normalizeText(input.brokerMetadata?.brokerConfirmationId) ??
      normalizeText(input.brokerMetadata?.brokerReference) ??
      getSourceBrokerOrderId(source) ??
      getSourceBrokerConfirmationId(source) ??
      getSourceBrokerReference(source),
  );
}

function hasBrokerOrderId(
  input: PartialCreationInput,
  source: ExecutionRecordSourceBrokerExecutionResult | null,
): boolean {
  return Boolean(
    normalizeText(input.brokerMetadata?.brokerOrderId) ??
      getSourceBrokerOrderId(source),
  );
}

function addAssociationReasons(
  input: PartialCreationInput,
  reasons: ExecutionRecordCreationRejectionReason[],
) {
  const phase = input.executionPhase;
  const inputRecommendationId = normalizeText(input.recommendationId);
  const refRecommendationId = normalizeText(input.existingTradeRef?.recommendationId);
  const inputPositionId = normalizeText(input.positionId);
  const expectedPositionId = normalizeText(input.expectedPositionId);
  const refPositionId = normalizeText(input.existingTradeRef?.positionId);

  if (
    inputRecommendationId &&
    refRecommendationId &&
    inputRecommendationId !== refRecommendationId
  ) {
    addUnique(reasons, "ambiguous_trade_association");
  }

  if (inputPositionId && expectedPositionId && inputPositionId !== expectedPositionId) {
    addUnique(reasons, "ambiguous_trade_association");
  }

  if (inputPositionId && refPositionId && inputPositionId !== refPositionId) {
    addUnique(reasons, "ambiguous_trade_association");
  }

  if (phase === "entry" && !inputRecommendationId && !refRecommendationId) {
    addUnique(reasons, "missing_entry_recommendation");
  }

  if (
    phase === "exit" &&
    !inputPositionId &&
    !expectedPositionId &&
    !refPositionId
  ) {
    addUnique(reasons, "missing_exit_position");
  }
}

function addOptionalWarnings(
  input: PartialCreationInput,
  source: ExecutionRecordSourceBrokerExecutionResult | null,
  warnings: ExecutionRecordCreationWarning[],
) {
  if (!isPositiveFiniteNumber(source?.fees)) {
    addUnique(warnings, "missing_optional_fees");
  }

  if (
    !isPositiveFiniteNumber(source?.grossAmount) &&
    !isPositiveFiniteNumber(source?.netAmount)
  ) {
    addUnique(warnings, "missing_optional_amounts");
  }

  if (!normalizeText(input.expectedInstrument?.market) && !normalizeText(source?.market)) {
    addUnique(warnings, "missing_optional_market");
  }

  if (
    !normalizeText(input.expectedInstrument?.instrumentType) &&
    !normalizeText(source?.instrumentType)
  ) {
    addUnique(warnings, "missing_optional_instrument_type");
  }

  if (!input.planningSnapshotRef?.snapshotId) {
    addUnique(warnings, "missing_planning_snapshot");
  }

  if (!normalizeText(input.idempotency?.handoffPayloadFingerprint)) {
    addUnique(warnings, "missing_handoff_payload_fingerprint");
  }

  if (!hasBrokerOrderId(input, source) && hasBrokerReference(input, source)) {
    addUnique(warnings, "missing_broker_reference_allowed_by_policy");
    addUnique(warnings, "manual_review_required");
  }

  addUnique(warnings, "persistence_not_attempted");
  addUnique(warnings, "trade_mutation_not_attempted");
}

function isSupportedMode(
  mode: string | null | undefined,
): mode is ExecutionRecordCreationMode {
  return mode === "semi_automatic" || mode === "automatic";
}

function isSupportedPhase(
  phase: string | null | undefined,
): phase is ExecutionRecordCreationPhase {
  return phase === "entry" || phase === "exit";
}

function isSupportedSide(
  side: string | null | undefined,
): side is ExecutionRecordCreationSide {
  return side === "buy" || side === "sell";
}

export function validateExecutionRecordCreationInput(
  input: ExecutionRecordCreationInput,
): ExecutionRecordCreationResult {
  const partialInput = input as PartialCreationInput;
  const source = partialInput.sourceBrokerExecutionResult ?? null;
  const sourceMetadata = source?.metadata ?? null;
  const reasons: ExecutionRecordCreationRejectionReason[] = [];
  const base = buildResultBase(partialInput);
  const warnings = base.warnings;

  if (!source) {
    addUnique(reasons, "missing_confirmed_broker_result");
  }

  if (sourceMetadata?.previewOnly === true) {
    addUnique(reasons, "preview_only_result");
  }

  if (sourceMetadata?.notBrokerExecutionResult === true) {
    addUnique(reasons, "not_broker_execution_result");
  }

  if (
    sourceMetadata?.isSynthetic === true ||
    partialInput.auditContext?.isSynthetic === true
  ) {
    addUnique(reasons, "synthetic_result_not_allowed");
  }

  if (
    sourceMetadata?.isDevOnly === true ||
    sourceMetadata?.isMock === true ||
    partialInput.auditContext?.isDevOnly === true ||
    partialInput.auditContext?.isMock === true
  ) {
    addUnique(reasons, "dev_or_mock_result_not_allowed");
  }

  if (sourceMetadata?.containsSensitiveData === true) {
    addUnique(reasons, "sensitive_data_detected");
  }

  if (sourceMetadata?.containsRawData === true) {
    addUnique(reasons, "raw_data_detected");
  }

  if (sourceMetadata?.noSupabaseWrite === false) {
    addUnique(reasons, "supabase_write_attempted");
  }

  if (sourceMetadata?.noTradeMutation === false) {
    addUnique(reasons, "trade_mutation_attempted");
  }

  if (!normalizeText(partialInput.idempotency?.idempotencyKey)) {
    addUnique(reasons, "missing_idempotency_key");
  }

  if (!normalizeText(partialInput.idempotency?.sourceEvidenceFingerprint)) {
    addUnique(reasons, "missing_source_fingerprint");
  }

  if (!hasBrokerReference(partialInput, source)) {
    addUnique(reasons, "missing_order_id");
  }

  if (!getConfirmationTimestamp(partialInput, source)) {
    addUnique(reasons, "missing_confirmation_timestamp");
  }

  const broker = getBroker(partialInput, source);
  if (broker !== "avanza") {
    addUnique(reasons, "unsupported_broker");
  }

  if (!isSupportedMode(partialInput.executionMode)) {
    addUnique(reasons, "unsupported_execution_mode");
  } else if (partialInput.executionMode === "automatic") {
    addUnique(reasons, "automatic_mode_not_supported");
  }

  if (!isSupportedPhase(partialInput.executionPhase)) {
    addUnique(reasons, "unsupported_execution_phase");
  }

  const status = normalizeLower(source?.status);
  if (!status || !filledStatuses.has(status)) {
    if (status && placedOnlyStatuses.has(status)) {
      addUnique(reasons, "placed_or_accepted_not_filled");
    } else if (status === "partially_filled") {
      addUnique(reasons, "partial_fill_policy_missing");
    } else {
      addUnique(reasons, "unsupported_status");
    }
  }

  const sourceSide = getSourceSide(source);
  if (!sourceSide || !isSupportedSide(sourceSide)) {
    addUnique(reasons, "missing_side");
  } else if (
    isSupportedSide(partialInput.expectedAction) &&
    sourceSide !== partialInput.expectedAction
  ) {
    addUnique(reasons, "side_mismatch");
  }

  const expectedTicker = normalizeTicker(partialInput.expectedInstrument?.ticker);
  const sourceTicker = normalizeTicker(source?.ticker);
  if (!expectedTicker || !sourceTicker) {
    addUnique(reasons, "missing_instrument");
  } else if (expectedTicker !== sourceTicker) {
    addUnique(reasons, "instrument_mismatch");
  }

  const quantity = getSourceQuantity(source);
  if (!isPositiveFiniteNumber(quantity)) {
    addUnique(reasons, "quantity_invalid");
  } else if (
    isPositiveFiniteNumber(partialInput.expectedQuantity) &&
    quantity !== partialInput.expectedQuantity
  ) {
    addUnique(reasons, "quantity_mismatch");
  }

  const price = getSourcePrice(source);
  if (!isPositiveFiniteNumber(price)) {
    addUnique(reasons, "price_invalid");
  }

  if (!normalizeText(partialInput.expectedInstrument?.currency) && !source?.currency) {
    addUnique(reasons, "currency_missing");
  }

  addAssociationReasons(partialInput, reasons);
  addOptionalWarnings(partialInput, source, warnings);

  if (reasons.length > 0) {
    return {
      ...base,
      status: "rejected",
      eligible: false,
      safeToPersist: false,
      rejectionReasons: reasons,
      blockers: [...reasons],
    };
  }

  if (warnings.includes("manual_review_required")) {
    return {
      ...base,
      status: "needs_review",
      eligible: false,
      safeToPersist: false,
      rejectionReasons: [],
      blockers: [],
    };
  }

  return {
    ...base,
    status: "eligible",
    eligible: true,
    safeToPersist: false,
    rejectionReasons: [],
    blockers: [],
  };
}
