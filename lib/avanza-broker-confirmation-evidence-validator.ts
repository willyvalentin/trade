import {
  AVANZA_CONFIRMATION_EVIDENCE_ALLOWED_SOURCE_TYPES,
  type AvanzaConfirmationEvidence,
  type AvanzaConfirmationEvidenceFieldConfidence,
  type AvanzaConfirmationEvidenceRejectionReason,
  type AvanzaConfirmationEvidenceWarning,
} from "@/lib/avanza-broker-confirmation-evidence-contract";
import {
  type BrokerResultSourceClassificationValidationResult,
  validateBrokerResultSourceForUsage,
} from "@/lib/broker-result-source-classification-validator";

export const AVANZA_CONFIRMATION_EVIDENCE_VALIDATION_STATUSES = [
  "valid",
  "rejected",
  "needs_review",
] as const;

export type AvanzaConfirmationEvidenceValidationStatus =
  (typeof AVANZA_CONFIRMATION_EVIDENCE_VALIDATION_STATUSES)[number];

export type AvanzaConfirmationEvidenceValidationResult = {
  status: AvanzaConfirmationEvidenceValidationStatus;
  validForNextStep: boolean;
  rejectionReasons: AvanzaConfirmationEvidenceRejectionReason[];
  warnings: AvanzaConfirmationEvidenceWarning[];
  sourceClassificationResult: BrokerResultSourceClassificationValidationResult | null;
  evidence: Partial<AvanzaConfirmationEvidence> | null;
};

const LOW_CONFIDENCE_THRESHOLD = 0.7;

function uniqueValues<T extends string>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

function isPresentString(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveFiniteNumber(value: number | null | undefined): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function hasValidTimestamp(value: string | null | undefined): boolean {
  if (!isPresentString(value)) {
    return false;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
}

function hasBrokerReference(
  evidence: Partial<AvanzaConfirmationEvidence>,
): boolean {
  const references = evidence.brokerReferences;

  return Boolean(
    isPresentString(references?.orderId) ||
      isPresentString(references?.orderNumber) ||
      isPresentString(references?.confirmationId) ||
      isPresentString(references?.fillId) ||
      isPresentString(references?.executionId) ||
      isPresentString(references?.brokerReference) ||
      isPresentString(references?.strongEquivalentReference),
  );
}

function hasInstrumentIdentifier(
  evidence: Partial<AvanzaConfirmationEvidence>,
): boolean {
  const instrument = evidence.instrument;

  return Boolean(
    isPresentString(instrument?.instrumentName) ||
      isPresentString(instrument?.ticker) ||
      isPresentString(instrument?.isin) ||
      isPresentString(instrument?.instrumentId),
  );
}

function confidenceIsLow(
  confidence: AvanzaConfirmationEvidenceFieldConfidence | null | undefined,
): boolean {
  return (
    typeof confidence?.value === "number" &&
    Number.isFinite(confidence.value) &&
    confidence.value < LOW_CONFIDENCE_THRESHOLD
  );
}

function hasLowFieldConfidence(
  evidence: Partial<AvanzaConfirmationEvidence>,
): boolean {
  const fieldConfidence = evidence.provenance?.fieldConfidence;

  return Boolean(
    confidenceIsLow({ value: evidence.provenance?.extractionConfidence ?? 1 }) ||
      confidenceIsLow(fieldConfidence?.instrument) ||
      confidenceIsLow(fieldConfidence?.side) ||
      confidenceIsLow(fieldConfidence?.quantity) ||
      confidenceIsLow(fieldConfidence?.price) ||
      confidenceIsLow(fieldConfidence?.timestamp) ||
      confidenceIsLow(fieldConfidence?.brokerReference) ||
      confidenceIsLow(fieldConfidence?.status) ||
      confidenceIsLow(fieldConfidence?.currency),
  );
}

function hasAmbiguousPartialFill(
  evidence: Partial<AvanzaConfirmationEvidence>,
): boolean {
  return (
    evidence.orderStatus === "partially_filled" ||
    evidence.partialFill?.status === "partial" ||
    evidence.partialFill?.status === "multiple_fills" ||
    evidence.partialFill?.status === "unclear"
  );
}

function statusFromReasons(
  rejectionReasons: readonly AvanzaConfirmationEvidenceRejectionReason[],
): AvanzaConfirmationEvidenceValidationStatus {
  const reviewOnlyReasons: AvanzaConfirmationEvidenceRejectionReason[] = [
    "extraction_confidence_low",
    "partial_fill_ambiguous",
  ];

  const hasHardRejection = rejectionReasons.some(
    (reason) => !reviewOnlyReasons.includes(reason),
  );

  if (hasHardRejection) {
    return "rejected";
  }

  if (rejectionReasons.length > 0) {
    return "needs_review";
  }

  return "valid";
}

export function validateAvanzaConfirmationEvidence(
  evidence: Partial<AvanzaConfirmationEvidence> | null | undefined,
): AvanzaConfirmationEvidenceValidationResult {
  const rejectionReasons: AvanzaConfirmationEvidenceRejectionReason[] = [];
  const warnings: AvanzaConfirmationEvidenceWarning[] = [];

  if (!evidence) {
    return {
      status: "rejected",
      validForNextStep: false,
      rejectionReasons: [
        "missing_final_confirmation_source",
        "provenance_missing",
      ],
      warnings: [],
      sourceClassificationResult: null,
      evidence: null,
    };
  }

  const sourceClassificationResult = evidence.sourceClassification
    ? validateBrokerResultSourceForUsage({
        classification: evidence.sourceClassification,
        intendedUsage: "execution_record_creation",
        metadata: {
          classification: evidence.sourceClassification,
          evidenceFingerprint: evidence.provenance?.evidenceFingerprint,
          captureId: evidence.provenance?.captureId,
          requestId: evidence.provenance?.requestId,
          brokerOrderId: evidence.brokerReferences?.orderId,
          brokerConfirmationId: evidence.brokerReferences?.confirmationId,
          provenanceLabel: evidence.sourcePageFlowIdentifier,
        },
      })
    : null;

  const sourceTypeAllowed =
    evidence.sourceType &&
    (AVANZA_CONFIRMATION_EVIDENCE_ALLOWED_SOURCE_TYPES as readonly string[]).includes(
      evidence.sourceType,
    );

  if (!sourceTypeAllowed) {
    rejectionReasons.push("missing_final_confirmation_source");
  }

  if (evidence.sourceType === "order_preview") {
    rejectionReasons.push("source_is_order_preview");
  }

  if (!hasBrokerReference(evidence)) {
    rejectionReasons.push("missing_order_id");
  }

  if (!hasValidTimestamp(evidence.confirmationTimestamp)) {
    rejectionReasons.push("missing_confirmation_timestamp");
  }

  if (!hasValidTimestamp(evidence.capturedTimestamp)) {
    warnings.push("timestamp_out_of_range");
  }

  if (!hasInstrumentIdentifier(evidence)) {
    rejectionReasons.push("missing_instrument_identifier");
  }

  if (!evidence.side) {
    rejectionReasons.push("side_mismatch");
  }

  if (!isPositiveFiniteNumber(evidence.quantity)) {
    rejectionReasons.push("quantity_mismatch");
  }

  if (!isPositiveFiniteNumber(evidence.price?.value)) {
    rejectionReasons.push("price_invalid");
  }

  if (!isPresentString(evidence.currency) || !isPresentString(evidence.price?.currency)) {
    warnings.push("currency_missing");
  }

  if (!evidence.provenance || !isPresentString(evidence.provenance.evidenceFingerprint)) {
    rejectionReasons.push("provenance_missing");
  }

  if (!evidence.manualConfirmationCheckpoint) {
    warnings.push("manual_confirmation_missing");
  }

  if (!isPresentString(evidence.handoffPayloadFingerprint)) {
    warnings.push("handoff_fingerprint_missing");
  }

  if (sourceClassificationResult && !sourceClassificationResult.allowed) {
    rejectionReasons.push("provenance_missing");
  }

  if (hasAmbiguousPartialFill(evidence)) {
    rejectionReasons.push("partial_fill_ambiguous");
  }

  if (hasLowFieldConfidence(evidence)) {
    rejectionReasons.push("extraction_confidence_low");
    warnings.push("field_confidence_partial");
  }

  if (
    evidence.orderStatus &&
    !["filled", "executed"].includes(evidence.orderStatus)
  ) {
    warnings.push("status_not_filled_or_executed");
  }

  if (!evidence.accountContext) {
    warnings.push("account_context_missing");
  }

  const uniqueRejectionReasons = uniqueValues(rejectionReasons);
  const status = statusFromReasons(uniqueRejectionReasons);

  return {
    status,
    validForNextStep: status === "valid",
    rejectionReasons: uniqueRejectionReasons,
    warnings: uniqueValues(warnings),
    sourceClassificationResult,
    evidence,
  };
}
