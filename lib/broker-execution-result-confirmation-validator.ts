import type { AvanzaConfirmationEvidence } from "@/lib/avanza-broker-confirmation-evidence-contract";
import {
  BROKER_RESULT_SOURCE_CLASSIFICATION_RULES,
  type BrokerResultSourceClassification,
} from "@/lib/broker-result-source-classification";
import {
  validateBrokerResultSourceForUsage,
  type BrokerResultSourceClassificationValidationResult,
} from "@/lib/broker-result-source-classification-validator";
import {
  BROKER_EXECUTION_RESULT_CONFIRMATION_VALIDATOR_CONTRACT_VERSION,
  type BrokerExecutionResultConfirmationEvidenceSnapshotReference,
  type BrokerExecutionResultConfirmationFingerprintInputSummary,
  type BrokerExecutionResultConfirmationInputMode,
  type BrokerExecutionResultConfirmationPolicySnapshot,
  type BrokerExecutionResultConfirmationRejectionReason,
  type BrokerExecutionResultConfirmationValidationResult,
  type BrokerExecutionResultConfirmationValidationStatus,
  type BrokerExecutionResultConfirmationValidatorInput,
  type BrokerExecutionResultConfirmationWarning,
} from "@/lib/broker-execution-result-confirmation-validator-contract";

function uniqueValues<T extends string>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

function isPresentString(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveFiniteNumber(value: number | null | undefined): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function normalizeIdentity(value: string | null | undefined): string | null {
  if (!isPresentString(value)) {
    return null;
  }

  return value.trim().toLocaleUpperCase("sv-SE");
}

function valuesMatch(
  expected: string | null | undefined,
  actual: string | null | undefined,
): boolean {
  const normalizedExpected = normalizeIdentity(expected);
  const normalizedActual = normalizeIdentity(actual);

  if (!normalizedExpected || !normalizedActual) {
    return false;
  }

  return normalizedExpected === normalizedActual;
}

function hasBrokerReference(evidence: AvanzaConfirmationEvidence): boolean {
  const references = evidence.brokerReferences;

  return Boolean(
    isPresentString(references.orderId) ||
      isPresentString(references.orderNumber) ||
      isPresentString(references.confirmationId) ||
      isPresentString(references.fillId) ||
      isPresentString(references.executionId) ||
      isPresentString(references.brokerReference) ||
      isPresentString(references.strongEquivalentReference),
  );
}

function hasValidTimestamp(value: string | null | undefined): boolean {
  if (!isPresentString(value)) {
    return false;
  }

  return Number.isFinite(Date.parse(value));
}

function hasAmbiguousPartialFill(evidence: AvanzaConfirmationEvidence): boolean {
  return (
    evidence.orderStatus === "partially_filled" ||
    evidence.partialFill?.status === "partial" ||
    evidence.partialFill?.status === "multiple_fills" ||
    evidence.partialFill?.status === "unclear"
  );
}

function hasInstrumentMatch(
  input: BrokerExecutionResultConfirmationValidatorInput,
): boolean {
  const expected = input.intendedInstrument;
  const actual = input.rawEvidence.instrument;

  const checks = [
    [expected.ticker, actual.ticker],
    [expected.instrumentName, actual.instrumentName],
    [expected.isin, actual.isin],
    [expected.instrumentId, actual.instrumentId],
  ] as const;

  return checks.some(([expectedValue, actualValue]) =>
    valuesMatch(expectedValue, actualValue),
  );
}

function buildSourceClassificationResult(
  input: BrokerExecutionResultConfirmationValidatorInput,
): BrokerResultSourceClassificationValidationResult {
  if (input.sourceClassificationResult) {
    return input.sourceClassificationResult;
  }

  return validateBrokerResultSourceForUsage({
    classification: input.sourceClassification,
    intendedUsage: "execution_record_creation",
    metadata: {
      classification: input.sourceClassification,
      evidenceFingerprint: input.rawEvidence.provenance.evidenceFingerprint,
      captureId: input.rawEvidence.provenance.captureId,
      requestId: input.rawEvidence.provenance.requestId,
      brokerOrderId: input.rawEvidence.brokerReferences.orderId,
      brokerConfirmationId: input.rawEvidence.brokerReferences.confirmationId,
      provenanceLabel: input.rawEvidence.sourcePageFlowIdentifier,
    },
  });
}

function buildPolicySnapshot(input: {
  mode: BrokerExecutionResultConfirmationInputMode;
  sourceClassification: BrokerResultSourceClassification;
  mappingPolicyVersion?: string | null;
  reviewedAt: string;
}): BrokerExecutionResultConfirmationPolicySnapshot {
  return {
    contractVersion:
      BROKER_EXECUTION_RESULT_CONFIRMATION_VALIDATOR_CONTRACT_VERSION,
    mode: input.mode,
    sourceClassification: input.sourceClassification,
    sourcePolicyRule:
      BROKER_RESULT_SOURCE_CLASSIFICATION_RULES[input.sourceClassification] ??
      null,
    requiresValidEvidence: true,
    requiresFinalConfirmationOrAccountHistory: true,
    requiresBrokerReference: true,
    requiresHandoffFingerprint: true,
    requiresProductionSafeSource: true,
    allowsAutomaticMode: false,
    safeToPersistDefault: false,
    safeToMutateTradeDefault: false,
    mappingPolicyVersion: input.mappingPolicyVersion ?? null,
    reviewedAt: input.reviewedAt,
  };
}

function buildEvidenceSnapshotReference(
  input: BrokerExecutionResultConfirmationValidatorInput,
): BrokerExecutionResultConfirmationEvidenceSnapshotReference {
  return {
    evidenceFingerprint: input.rawEvidence.provenance.evidenceFingerprint,
    captureId: input.rawEvidence.provenance.captureId,
    requestId: input.rawEvidence.provenance.requestId,
    sourceType: input.rawEvidence.sourceType,
    sourcePageFlowIdentifier: input.rawEvidence.sourcePageFlowIdentifier,
    sourceClassification: input.sourceClassification,
    capturedTimestamp: input.rawEvidence.capturedTimestamp,
    confirmationTimestamp: input.rawEvidence.confirmationTimestamp,
    validationStatus: input.evidenceValidationResult.status,
    validationRejectionReasons: input.evidenceValidationResult.rejectionReasons,
    validationWarnings: input.evidenceValidationResult.warnings,
  };
}

function buildFingerprintInputSummary(
  input: BrokerExecutionResultConfirmationValidatorInput,
): BrokerExecutionResultConfirmationFingerprintInputSummary {
  const evidence = input.rawEvidence;

  return {
    handoffPayloadFingerprint: input.handoffPayloadFingerprint ?? null,
    evidenceFingerprint: evidence.provenance.evidenceFingerprint,
    brokerOrderId: evidence.brokerReferences.orderId,
    orderNumber: evidence.brokerReferences.orderNumber,
    brokerConfirmationId: evidence.brokerReferences.confirmationId,
    fillId: evidence.brokerReferences.fillId,
    executionId: evidence.brokerReferences.executionId,
    brokerReference: evidence.brokerReferences.brokerReference,
    ticker: evidence.instrument.ticker,
    instrumentName: evidence.instrument.instrumentName,
    isin: evidence.instrument.isin,
    instrumentId: evidence.instrument.instrumentId,
    side: evidence.side,
    quantity: evidence.quantity,
    price: evidence.price.value,
    currency: evidence.currency,
    confirmationTimestamp: evidence.confirmationTimestamp,
    captureId: evidence.provenance.captureId,
    requestId: evidence.provenance.requestId,
    provenanceHash:
      evidence.provenance.sourceTextHash ??
      evidence.provenance.sourceScreenshotHash ??
      null,
  };
}

function buildResult(input: {
  sourceInput: BrokerExecutionResultConfirmationValidatorInput;
  evaluatedAt: string;
  status: BrokerExecutionResultConfirmationValidationStatus;
  rejectionReasons: BrokerExecutionResultConfirmationRejectionReason[];
  warnings: BrokerExecutionResultConfirmationWarning[];
  sourceClassificationResult: BrokerResultSourceClassificationValidationResult;
}): BrokerExecutionResultConfirmationValidationResult {
  return {
    contractVersion:
      BROKER_EXECUTION_RESULT_CONFIRMATION_VALIDATOR_CONTRACT_VERSION,
    evaluatedAt: input.evaluatedAt,
    status: input.status,
    rejectionReasons: uniqueValues(input.rejectionReasons),
    warnings: uniqueValues(input.warnings),
    policySnapshot:
      input.sourceInput.policySnapshot ??
      buildPolicySnapshot({
        mode: input.sourceInput.mode,
        sourceClassification: input.sourceInput.sourceClassification,
        mappingPolicyVersion: input.sourceInput.mappingPolicyVersion,
        reviewedAt: input.evaluatedAt,
      }),
    evidenceSnapshotReference: buildEvidenceSnapshotReference(
      input.sourceInput,
    ),
    fingerprintInputSummary: buildFingerprintInputSummary(input.sourceInput),
    sourceClassificationResult: input.sourceClassificationResult,
    safeToConvert: input.status === "confirmed_candidate",
    safeToPersist: false,
    safeToMutateTrade: false,
    brokerExecutionResultCreated: false,
    mapperRan: false,
    persistenceAttempted: false,
    tradeMutationAttempted: false,
    auditAppendAttempted: false,
    browserAutomationAttempted: false,
  };
}

export function validateBrokerExecutionResultConfirmation(
  input: BrokerExecutionResultConfirmationValidatorInput,
): BrokerExecutionResultConfirmationValidationResult {
  const evaluatedAt = input.requestedAt;
  const sourceClassificationResult = buildSourceClassificationResult(input);
  const rejectionReasons: BrokerExecutionResultConfirmationRejectionReason[] = [];
  const warnings: BrokerExecutionResultConfirmationWarning[] = [
    "persistence_not_attempted",
    "trade_mutation_not_attempted",
  ];

  if (input.mode === "automatic") {
    rejectionReasons.push("automatic_mode_not_allowed");
  }

  if (input.broker !== "avanza") {
    rejectionReasons.push("unsupported_broker");
  }

  if (input.evidenceValidationResult.status === "rejected") {
    rejectionReasons.push("evidence_rejected");
  }

  if (input.evidenceValidationResult.status === "needs_review") {
    rejectionReasons.push("evidence_needs_review");
  }

  if (!sourceClassificationResult.allowed) {
    rejectionReasons.push("source_not_confirmation_capable");
  }

  if (!sourceClassificationResult.policyRule?.productionSafe) {
    rejectionReasons.push("source_not_production_safe");
  }

  if (!isPresentString(input.handoffPayloadFingerprint)) {
    rejectionReasons.push("missing_handoff_fingerprint");
  }

  if (!hasBrokerReference(input.rawEvidence)) {
    rejectionReasons.push("broker_reference_missing");
  }

  if (input.rawEvidence.side !== input.intendedSide) {
    rejectionReasons.push("side_mismatch");
  }

  if (!hasInstrumentMatch(input)) {
    rejectionReasons.push("instrument_mismatch");
  }

  if (
    typeof input.intendedQuantity === "number" &&
    input.rawEvidence.quantity !== input.intendedQuantity
  ) {
    rejectionReasons.push("quantity_mismatch");
  }

  if (!isPositiveFiniteNumber(input.rawEvidence.price.value)) {
    rejectionReasons.push("price_invalid");
  }

  if (
    input.intendedPrice?.expectedExecutionPrice != null &&
    input.rawEvidence.price.value !== input.intendedPrice.expectedExecutionPrice
  ) {
    rejectionReasons.push("price_invalid");
  }

  if (!hasValidTimestamp(input.rawEvidence.confirmationTimestamp)) {
    rejectionReasons.push("timestamp_invalid");
  }

  if (!isPresentString(input.rawEvidence.provenance.evidenceFingerprint)) {
    rejectionReasons.push("provenance_missing");
  }

  if (hasAmbiguousPartialFill(input.rawEvidence)) {
    rejectionReasons.push("partial_fill_ambiguous");
  }

  if (!input.rawEvidence.accountContext) {
    warnings.push("account_context_missing");
  }

  if (!input.rawEvidence.fee && !input.rawEvidence.commission) {
    warnings.push("optional_fee_missing");
  }

  if (!input.rawEvidence.instrument.market) {
    warnings.push("optional_market_missing");
  }

  if (!input.rawEvidence.manualConfirmationCheckpoint) {
    warnings.push("manual_review_required");
  }

  if (!input.mappingPolicyVersion) {
    warnings.push("mapping_policy_missing");
  }

  let status: BrokerExecutionResultConfirmationValidationStatus =
    "confirmed_candidate";

  if (rejectionReasons.includes("automatic_mode_not_allowed")) {
    status = "rejected";
  } else if (rejectionReasons.includes("partial_fill_ambiguous")) {
    status = "partial_fill_review";
  } else if (rejectionReasons.includes("evidence_needs_review")) {
    status = "needs_review";
  } else if (rejectionReasons.includes("unsupported_broker")) {
    status = "unsupported";
  } else if (rejectionReasons.length > 0) {
    status = "rejected";
  }

  return buildResult({
    sourceInput: input,
    evaluatedAt,
    status,
    rejectionReasons,
    warnings,
    sourceClassificationResult,
  });
}
