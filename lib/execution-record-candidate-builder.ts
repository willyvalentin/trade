import {
  EXECUTION_RECORD_CREATION_CONTRACT_VERSION,
  type ExecutionRecordCandidate,
  type ExecutionRecordCreationBrokerStatus,
  type ExecutionRecordCreationInput,
  type ExecutionRecordCreationResult,
  type ExecutionRecordCreationSide,
  type ExecutionRecordCreationWarning,
  type ExecutionRecordSourceBrokerExecutionResult,
} from "@/lib/execution-record-creation-contract";
import { validateExecutionRecordCreationInput } from "@/lib/execution-record-creation-validator";

function normalizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeTicker(value: string | null | undefined): string | null {
  return normalizeText(value)?.toUpperCase() ?? null;
}

function normalizeLower(value: string | null | undefined): string | null {
  return normalizeText(value)?.toLowerCase() ?? null;
}

function sanitizeRecordIdPart(value: string): string {
  const sanitized = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
  return sanitized.replace(/^_+|_+$/g, "") || "unknown";
}

function getSide(
  source: ExecutionRecordSourceBrokerExecutionResult,
): ExecutionRecordCreationSide | null {
  const side = normalizeLower(source.side) ?? normalizeLower(source.action);
  return side === "buy" || side === "sell" ? side : null;
}

function getStatus(
  source: ExecutionRecordSourceBrokerExecutionResult,
): ExecutionRecordCreationBrokerStatus | null {
  const status = normalizeLower(source.status);
  return status === "filled" || status === "executed" ? status : null;
}

function getQuantity(source: ExecutionRecordSourceBrokerExecutionResult) {
  return source.filledQuantity ?? source.filled_quantity ?? source.quantity ?? null;
}

function getPrice(source: ExecutionRecordSourceBrokerExecutionResult) {
  return source.averageFillPrice ?? source.average_fill_price ?? source.price ?? null;
}

function getBrokerOrderId(source: ExecutionRecordSourceBrokerExecutionResult) {
  return normalizeText(source.brokerOrderId) ?? normalizeText(source.broker_order_id);
}

function getBrokerConfirmationId(source: ExecutionRecordSourceBrokerExecutionResult) {
  return (
    normalizeText(source.brokerConfirmationId) ??
    normalizeText(source.broker_confirmation_id)
  );
}

function getBrokerReference(source: ExecutionRecordSourceBrokerExecutionResult) {
  return normalizeText(source.brokerReference) ?? normalizeText(source.broker_reference);
}

function getConfirmationTimestamp(
  input: ExecutionRecordCreationInput,
  source: ExecutionRecordSourceBrokerExecutionResult,
) {
  return (
    normalizeText(input.brokerMetadata.confirmationTimestamp) ??
    normalizeText(source.confirmationTimestamp) ??
    normalizeText(source.confirmation_timestamp) ??
    normalizeText(source.confirmedAt) ??
    normalizeText(source.confirmed_at)
  );
}

function hasPositiveNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function mergeWarnings(
  warnings: ExecutionRecordCreationWarning[],
): ExecutionRecordCreationWarning[] {
  return Array.from(new Set(warnings));
}

function buildCandidateRecordId(input: ExecutionRecordCreationInput) {
  return `execution_record_${sanitizeRecordIdPart(input.idempotency.idempotencyKey)}`;
}

function buildCandidate(
  input: ExecutionRecordCreationInput,
  validationResult: Extract<ExecutionRecordCreationResult, { status: "eligible" }>,
): ExecutionRecordCandidate | null {
  const source = input.sourceBrokerExecutionResult;
  const side = getSide(source);
  const status = getStatus(source);
  const ticker = normalizeTicker(source.ticker) ?? normalizeTicker(input.expectedInstrument.ticker);
  const quantity = getQuantity(source);
  const price = getPrice(source);
  const currency =
    normalizeText(input.expectedInstrument.currency) ?? normalizeText(source.currency);
  const confirmationTimestamp = getConfirmationTimestamp(input, source);
  const recordFingerprint = validationResult.recordFingerprint;

  if (
    !side ||
    !status ||
    !ticker ||
    !hasPositiveNumber(quantity) ||
    !hasPositiveNumber(price) ||
    !currency ||
    !confirmationTimestamp ||
    !recordFingerprint
  ) {
    return null;
  }

  const brokerOrderId =
    normalizeText(input.brokerMetadata.brokerOrderId) ?? getBrokerOrderId(source);
  const brokerConfirmationId =
    normalizeText(input.brokerMetadata.brokerConfirmationId) ??
    getBrokerConfirmationId(source);
  const brokerReference =
    normalizeText(input.brokerMetadata.brokerReference) ?? getBrokerReference(source);
  const sourceEventIds = input.auditContext.sourceEventIds ?? [];
  const warnings = mergeWarnings(validationResult.warnings);

  return {
    recordId: buildCandidateRecordId(input),
    recordFingerprint,
    idempotencyKey: input.idempotency.idempotencyKey,
    contractVersion: EXECUTION_RECORD_CREATION_CONTRACT_VERSION,
    createdAt: validationResult.evaluatedAt,
    broker: "avanza",
    side,
    ticker,
    quantity,
    price,
    currency,
    brokerStatus: status,
    confirmationTimestamp,
    sourceEvidenceFingerprint: input.idempotency.sourceEvidenceFingerprint,
    sourceEnvironment: input.sourceEnvironment,
    executionMode: input.executionMode,
    executionPhase: input.executionPhase,
    safetyMetadata: {
      noSupabaseWrite: true,
      noTradeMutation: true,
      noBrokerExecution: true,
      noAvanzaAutomation: true,
      previewOnlySourceRejected: true,
      syntheticSourceAllowed: false,
      automaticModeAllowed: false,
      validationWarnings: warnings,
    },
    auditMetadata: validationResult.auditMetadata,
    brokerOrderId,
    brokerConfirmationId,
    brokerReference,
    recommendationId:
      normalizeText(input.recommendationId) ??
      normalizeText(input.existingTradeRef?.recommendationId),
    positionId:
      normalizeText(input.positionId) ??
      normalizeText(input.expectedPositionId) ??
      normalizeText(input.existingTradeRef?.positionId),
    handoffSessionId: normalizeText(input.auditContext.handoffSessionId),
    payloadId: normalizeText(input.auditContext.payloadId),
    instrumentName:
      normalizeText(input.expectedInstrument.name) ?? normalizeText(source.instrumentName),
    market: normalizeText(input.expectedInstrument.market) ?? normalizeText(source.market),
    instrumentType:
      normalizeText(input.expectedInstrument.instrumentType) ??
      normalizeText(source.instrumentType),
    grossAmount: source.grossAmount ?? null,
    netAmount: source.netAmount ?? null,
    fees: source.fees ?? null,
    planningSnapshotId: normalizeText(input.planningSnapshotRef?.snapshotId),
    planningSnapshotVersion: normalizeText(input.planningSnapshotRef?.snapshotVersion),
    captureId: normalizeText(input.idempotency.captureId),
    requestId: normalizeText(input.idempotency.requestId),
    brokerResultFingerprint: normalizeText(input.idempotency.brokerResultFingerprint),
    handoffPayloadFingerprint: normalizeText(
      input.idempotency.handoffPayloadFingerprint,
    ),
    sourceEventIds,
    warnings,
    provenanceMetadata: {
      sourceCaptureStatus: input.auditContext.sourceCaptureStatus ?? null,
      sourceOrderStatus: input.auditContext.sourceOrderStatus ?? null,
      createdBy: input.auditContext.createdBy ?? null,
      sourceBrokerResultMetadata: source.metadata
        ? { ...source.metadata }
        : null,
    },
  };
}

export function buildExecutionRecordCandidate(
  input: ExecutionRecordCreationInput,
): ExecutionRecordCreationResult {
  const validationResult = validateExecutionRecordCreationInput(input);

  if (validationResult.status !== "eligible" || !validationResult.eligible) {
    return validationResult;
  }

  const recordCandidate = buildCandidate(input, validationResult);

  if (!recordCandidate) {
    return {
      ...validationResult,
      status: "rejected",
      eligible: false,
      safeToPersist: false,
      recordCandidate: undefined,
      rejectionReasons: ["missing_confirmed_broker_result"],
      blockers: ["missing_confirmed_broker_result"],
    };
  }

  return {
    ...validationResult,
    safeToPersist: false,
    recordCandidate,
  };
}
