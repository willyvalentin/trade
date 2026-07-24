import {
  BROKER_EXECUTION_RESULT_CANDIDATE_CONTRACT_VERSION,
  BROKER_EXECUTION_RESULT_CANDIDATE_DEFAULT_SAFETY_POLICY,
  type BrokerExecutionResultCandidate,
  type BrokerExecutionResultCandidatePartialFill,
  type BrokerExecutionResultCandidateReviewFlag,
  type BrokerExecutionResultCandidateWarning,
} from "@/lib/broker-execution-result-candidate-contract";
import type {
  AvanzaConfirmationEvidence,
  AvanzaConfirmationEvidenceWarning,
  AvanzaPartialFillEvidence,
} from "@/lib/avanza-broker-confirmation-evidence-contract";
import type {
  EvidenceToBrokerExecutionResultFieldMappingSnapshot,
  EvidenceToBrokerExecutionResultMapperInput,
  EvidenceToBrokerExecutionResultMapperRejectionReason,
  EvidenceToBrokerExecutionResultMapperResult,
  EvidenceToBrokerExecutionResultMapperStatus,
  EvidenceToBrokerExecutionResultMapperWarning,
  EvidenceToBrokerExecutionResultPartialFillMapping,
  EvidenceToBrokerExecutionResultProvenanceSnapshot,
} from "@/lib/evidence-to-broker-execution-result-mapper-contract";

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

  return Number.isFinite(Date.parse(value));
}

function getHandoffPayloadFingerprint(
  input: EvidenceToBrokerExecutionResultMapperInput,
): string | null {
  return (
    input.handoffPayloadFingerprint ??
    input.rawEvidence.handoffPayloadFingerprint ??
    input.rawEvidence.provenance.handoffPayloadFingerprint ??
    null
  );
}

function getBrokerOrderId(evidence: AvanzaConfirmationEvidence): string | null {
  return evidence.brokerReferences.orderId ?? evidence.brokerReferences.orderNumber ?? null;
}

function getBrokerConfirmationId(
  evidence: AvanzaConfirmationEvidence,
): string | null {
  return (
    evidence.brokerReferences.confirmationId ??
    evidence.brokerReferences.fillId ??
    evidence.brokerReferences.executionId ??
    evidence.brokerReferences.strongEquivalentReference ??
    null
  );
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

function hasInstrumentIdentifier(evidence: AvanzaConfirmationEvidence): boolean {
  const instrument = evidence.instrument;

  return Boolean(
    isPresentString(instrument.instrumentName) ||
      isPresentString(instrument.ticker) ||
      isPresentString(instrument.isin) ||
      isPresentString(instrument.instrumentId),
  );
}

function getPartialFillStatus(
  evidence: AvanzaConfirmationEvidence,
): EvidenceToBrokerExecutionResultPartialFillMapping["status"] {
  if (evidence.partialFill?.status === "multiple_fills") {
    return "multiple_fill_review";
  }

  if (
    evidence.orderStatus === "partially_filled" ||
    evidence.partialFill?.status === "partial" ||
    evidence.partialFill?.status === "unclear"
  ) {
    return "partial_fill_review";
  }

  return "not_partial";
}

function buildPartialFillMapping(
  evidence: AvanzaConfirmationEvidence,
): EvidenceToBrokerExecutionResultPartialFillMapping {
  const status = getPartialFillStatus(evidence);
  const partialFill = evidence.partialFill ?? null;

  return {
    status,
    sourcePartialFill: partialFill,
    filledQuantity: partialFill?.filledQuantity ?? null,
    remainingQuantity: partialFill?.remainingQuantity ?? null,
    averageFillPrice: partialFill?.averageFillPrice ?? null,
    fillIds: partialFill?.fillIds ?? [],
    mappingPolicyAvailable: false,
    requiresReview: status !== "not_partial",
  };
}

function buildCandidatePartialFill(
  partialFillMapping: EvidenceToBrokerExecutionResultPartialFillMapping,
): BrokerExecutionResultCandidatePartialFill {
  const sourcePartialFill =
    partialFillMapping.sourcePartialFill as AvanzaPartialFillEvidence | null;

  return {
    status: partialFillMapping.status,
    sourcePartialFill,
    filledQuantity: partialFillMapping.filledQuantity ?? null,
    remainingQuantity: partialFillMapping.remainingQuantity ?? null,
    averageFillPrice: partialFillMapping.averageFillPrice ?? null,
    fillTimestamp: sourcePartialFill?.fillTimestamp ?? null,
    fillIds: partialFillMapping.fillIds ?? [],
    requiresReview: partialFillMapping.requiresReview,
  };
}

function buildFieldMappingSnapshot(
  evidence: AvanzaConfirmationEvidence,
): EvidenceToBrokerExecutionResultFieldMappingSnapshot[] {
  const confidence = evidence.provenance.fieldConfidence;

  return [
    {
      field: "broker_order_id",
      evidencePath: "brokerReferences.orderId",
      required: true,
      mappedValuePreview: getBrokerOrderId(evidence),
      confidence: confidence?.brokerReference?.value ?? null,
    },
    {
      field: "status",
      evidencePath: "orderStatus",
      required: true,
      mappedValuePreview: evidence.orderStatus ?? "unknown",
      confidence: confidence?.status?.value ?? null,
    },
    {
      field: "captured_at",
      evidencePath: "capturedTimestamp",
      required: true,
      mappedValuePreview: evidence.capturedTimestamp,
      confidence: confidence?.timestamp?.value ?? null,
    },
    {
      field: "filled_at",
      evidencePath: "confirmationTimestamp",
      required: true,
      mappedValuePreview: evidence.confirmationTimestamp,
      confidence: confidence?.timestamp?.value ?? null,
    },
    {
      field: "filled_quantity",
      evidencePath: "quantity",
      required: true,
      mappedValuePreview: evidence.quantity,
      confidence: confidence?.quantity?.value ?? null,
    },
    {
      field: "average_fill_price",
      evidencePath: "price.value",
      required: true,
      mappedValuePreview: evidence.price.value,
      confidence: confidence?.price?.value ?? null,
    },
    {
      field: "raw_status",
      evidencePath: "orderStatus",
      required: false,
      mappedValuePreview: evidence.orderStatus ?? null,
      confidence: confidence?.status?.value ?? null,
    },
    {
      field: "notes",
      evidencePath: "warnings",
      required: false,
      mappedValuePreview:
        evidence.warnings && evidence.warnings.length > 0
          ? evidence.warnings.join(", ")
          : null,
    },
  ];
}

function buildProvenanceSnapshot(
  input: EvidenceToBrokerExecutionResultMapperInput,
): EvidenceToBrokerExecutionResultProvenanceSnapshot {
  const evidence = input.rawEvidence;

  return {
    evidenceFingerprint: evidence.provenance.evidenceFingerprint,
    sourceClassification: input.sourceClassification,
    sourceType: evidence.sourceType,
    sourcePageFlowIdentifier: evidence.sourcePageFlowIdentifier,
    captureMethod: evidence.provenance.captureMethod,
    captureMode: evidence.provenance.captureMode,
    pageIdentity: evidence.provenance.pageIdentity,
    capturedAt: evidence.provenance.capturedAt ?? evidence.capturedTimestamp,
    confirmationTimestamp: evidence.confirmationTimestamp,
    captureId: evidence.provenance.captureId ?? null,
    requestId: evidence.provenance.requestId ?? null,
    handoffPayloadFingerprint: getHandoffPayloadFingerprint(input),
    confirmationStatus: input.confirmationValidationResult.status,
  };
}

function buildMapperWarnings(
  evidence: AvanzaConfirmationEvidence,
): EvidenceToBrokerExecutionResultMapperWarning[] {
  const warnings: EvidenceToBrokerExecutionResultMapperWarning[] = [
    "persistence_not_attempted",
    "trade_mutation_not_attempted",
  ];

  if (!evidence.accountContext) {
    warnings.push("optional_account_context_missing");
  }

  if (!evidence.instrument.market) {
    warnings.push("optional_market_missing");
  }

  if (!evidence.fee && !evidence.commission) {
    warnings.push("optional_fee_missing");
  }

  if (getPartialFillStatus(evidence) !== "not_partial") {
    warnings.push("partial_fill_mapping_policy_missing");
  }

  return uniqueValues(warnings);
}

function mapEvidenceWarningToCandidateReviewFlag(
  warning: AvanzaConfirmationEvidenceWarning,
): BrokerExecutionResultCandidateReviewFlag | null {
  if (warning === "field_confidence_partial") {
    return "field_confidence_partial";
  }

  if (warning === "broker_reference_ambiguous") {
    return "broker_reference_ambiguous";
  }

  if (warning === "timestamp_out_of_range") {
    return "timestamp_requires_review";
  }

  if (warning === "handoff_fingerprint_missing") {
    return "handoff_fingerprint_missing";
  }

  return null;
}

function buildReviewFlags(
  input: EvidenceToBrokerExecutionResultMapperInput,
  partialFillMapping: EvidenceToBrokerExecutionResultPartialFillMapping,
): BrokerExecutionResultCandidateReviewFlag[] {
  const flags: BrokerExecutionResultCandidateReviewFlag[] = [];

  for (const warning of input.rawEvidence.warnings ?? []) {
    const flag = mapEvidenceWarningToCandidateReviewFlag(warning);
    if (flag) {
      flags.push(flag);
    }
  }

  for (const warning of input.evidenceValidationResult.warnings) {
    const flag = mapEvidenceWarningToCandidateReviewFlag(warning);
    if (flag) {
      flags.push(flag);
    }
  }

  if (partialFillMapping.requiresReview) {
    flags.push("partial_fill_policy_missing");
  }

  if (!isPresentString(getHandoffPayloadFingerprint(input))) {
    flags.push("handoff_fingerprint_missing");
  }

  return uniqueValues(flags);
}

function collectRequiredFieldRejections(
  input: EvidenceToBrokerExecutionResultMapperInput,
): EvidenceToBrokerExecutionResultMapperRejectionReason[] {
  const evidence = input.rawEvidence;
  const rejectionReasons: EvidenceToBrokerExecutionResultMapperRejectionReason[] = [];

  if (!isPresentString(getHandoffPayloadFingerprint(input))) {
    rejectionReasons.push("missing_handoff_fingerprint");
  }

  if (!hasBrokerReference(evidence)) {
    rejectionReasons.push("missing_broker_reference");
  }

  if (!hasInstrumentIdentifier(evidence)) {
    rejectionReasons.push("missing_required_field");
  }

  if (!evidence.side) {
    rejectionReasons.push("missing_required_field");
  }

  if (!isPositiveFiniteNumber(evidence.quantity)) {
    rejectionReasons.push("missing_required_field");
  }

  if (!isPositiveFiniteNumber(evidence.price.value)) {
    rejectionReasons.push("missing_required_field");
  }

  if (!isPresentString(evidence.currency) || !isPresentString(evidence.price.currency)) {
    rejectionReasons.push("missing_required_field");
  }

  if (!hasValidTimestamp(evidence.confirmationTimestamp)) {
    rejectionReasons.push("missing_required_field");
  }

  if (!hasValidTimestamp(evidence.capturedTimestamp)) {
    rejectionReasons.push("missing_required_field");
  }

  if (!isPresentString(evidence.provenance.evidenceFingerprint)) {
    rejectionReasons.push("missing_required_field");
  }

  return uniqueValues(rejectionReasons);
}

function statusForPreconditionFailure(
  input: EvidenceToBrokerExecutionResultMapperInput,
  partialFillMapping: EvidenceToBrokerExecutionResultPartialFillMapping,
): EvidenceToBrokerExecutionResultMapperStatus {
  if (
    input.confirmationValidationResult.status === "partial_fill_review" ||
    partialFillMapping.requiresReview
  ) {
    return "partial_fill_review";
  }

  if (
    input.confirmationValidationResult.status === "needs_review" ||
    input.evidenceValidationResult.status === "needs_review"
  ) {
    return "needs_review";
  }

  if (input.confirmationValidationResult.status === "unsupported") {
    return "unsupported";
  }

  return "rejected";
}

function buildCandidate(
  input: EvidenceToBrokerExecutionResultMapperInput,
  fieldMappingSnapshot: EvidenceToBrokerExecutionResultFieldMappingSnapshot[],
  provenanceSnapshot: EvidenceToBrokerExecutionResultProvenanceSnapshot,
  partialFillMapping: EvidenceToBrokerExecutionResultPartialFillMapping,
  mapperWarnings: EvidenceToBrokerExecutionResultMapperWarning[],
): BrokerExecutionResultCandidate {
  const evidence = input.rawEvidence;
  const handoffPayloadFingerprint = getHandoffPayloadFingerprint(input);

  const candidateWarnings: Array<
    | BrokerExecutionResultCandidateWarning
    | EvidenceToBrokerExecutionResultMapperWarning
  > = [
    "candidate_contract_only",
    "confirmation_mapper_not_implemented",
    ...mapperWarnings,
  ];

  return {
    contractVersion: BROKER_EXECUTION_RESULT_CANDIDATE_CONTRACT_VERSION,
    status: "confirmed_candidate",
    broker: "avanza",
    source: {
      classification: input.sourceClassification,
      evidenceSourceType: evidence.sourceType,
      sourcePageFlowIdentifier: evidence.sourcePageFlowIdentifier,
      evidenceFingerprint: evidence.provenance.evidenceFingerprint,
      captureId: evidence.provenance.captureId ?? null,
      requestId: evidence.provenance.requestId ?? null,
    },
    sourceClassification: input.sourceClassification,
    brokerReferences: {
      ...evidence.brokerReferences,
      brokerOrderId: getBrokerOrderId(evidence),
      brokerConfirmationId: getBrokerConfirmationId(evidence),
    },
    instrument: {
      instrumentName: evidence.instrument.instrumentName,
      ticker: evidence.instrument.ticker ?? null,
      isin: evidence.instrument.isin ?? null,
      instrumentId: evidence.instrument.instrumentId ?? null,
      market: evidence.instrument.market ?? null,
      venue: evidence.instrument.venue ?? null,
      instrumentType: evidence.instrument.instrumentType ?? null,
    },
    execution: {
      side: evidence.side,
      quantity: evidence.quantity,
      orderType: evidence.orderType ?? null,
      brokerStatus: evidence.orderStatus ?? null,
      rawStatus: evidence.orderStatus ?? null,
    },
    price: {
      executionPrice: evidence.price.value,
      currency: evidence.currency,
      priceFieldType: evidence.price.fieldType,
      rawLabel: evidence.price.rawLabel ?? null,
      commission: evidence.commission ?? null,
      fee: evidence.fee ?? null,
      totalAmount: evidence.totalAmount ?? null,
      settlementCashImpact: evidence.settlementCashImpact ?? null,
    },
    confirmationTimestamp: evidence.confirmationTimestamp,
    capturedTimestamp: evidence.capturedTimestamp,
    provenance: {
      source: {
        classification: input.sourceClassification,
        evidenceSourceType: evidence.sourceType,
        sourcePageFlowIdentifier: evidence.sourcePageFlowIdentifier,
        evidenceFingerprint: evidence.provenance.evidenceFingerprint,
        captureId: evidence.provenance.captureId ?? null,
        requestId: evidence.provenance.requestId ?? null,
      },
      confirmationStatus: input.confirmationValidationResult.status,
      confirmationTimestamp: evidence.confirmationTimestamp,
      capturedTimestamp: evidence.capturedTimestamp,
      captureMethod: evidence.provenance.captureMethod,
      captureMode: evidence.provenance.captureMode,
      pageIdentity: evidence.provenance.pageIdentity,
      evidenceValidationStatus: input.evidenceValidationResult.status,
      confirmationValidatorEvaluatedAt:
        input.confirmationValidationResult.evaluatedAt,
      mapperContractVersion: input.contractVersion,
    },
    fieldMapping: {
      mappedFields: fieldMappingSnapshot,
      fieldConfidence: evidence.provenance.fieldConfidence ?? null,
      rawFieldMapPresent: Boolean(evidence.rawFieldMap),
      rawSensitiveDataStored: false,
    },
    fingerprintInput: {
      confirmationFingerprintInputSummary:
        input.confirmationValidationResult.fingerprintInputSummary,
      handoffPayloadFingerprint,
      evidenceFingerprint: evidence.provenance.evidenceFingerprint,
      brokerReferenceFingerprintInput:
        getBrokerConfirmationId(evidence) ?? getBrokerOrderId(evidence),
      candidateFingerprintDraft: null,
      mapperContributionFields: fieldMappingSnapshot.map((field) => field.field),
    },
    handoffPayloadFingerprint,
    accountContext: evidence.accountContext ?? null,
    partialFill: buildCandidatePartialFill(partialFillMapping),
    warnings: uniqueValues(candidateWarnings),
    reviewFlags: buildReviewFlags(input, partialFillMapping),
    mapperProvenanceSnapshot: provenanceSnapshot,
    safetyPolicy: BROKER_EXECUTION_RESULT_CANDIDATE_DEFAULT_SAFETY_POLICY,
    metadata: {
      mapperMode: input.mode,
      requestedAt: input.requestedAt,
      notRuntimeBrokerExecutionResult: true,
      notExecutionRecord: true,
      notPersistenceApproval: true,
      notTradeMutationApproval: true,
    },
  };
}

function buildResult(input: {
  sourceInput: EvidenceToBrokerExecutionResultMapperInput;
  status: EvidenceToBrokerExecutionResultMapperStatus;
  rejectionReasons: EvidenceToBrokerExecutionResultMapperRejectionReason[];
  warnings: EvidenceToBrokerExecutionResultMapperWarning[];
  fieldMappingSnapshot: EvidenceToBrokerExecutionResultFieldMappingSnapshot[];
  provenanceSnapshot: EvidenceToBrokerExecutionResultProvenanceSnapshot;
  partialFillMapping: EvidenceToBrokerExecutionResultPartialFillMapping;
  mappedCandidate?: BrokerExecutionResultCandidate;
}): EvidenceToBrokerExecutionResultMapperResult {
  return {
    contractVersion: input.sourceInput.contractVersion,
    evaluatedAt: input.sourceInput.requestedAt,
    status: input.status,
    rejectionReasons: uniqueValues(input.rejectionReasons),
    warnings: uniqueValues(input.warnings),
    fieldMappingSnapshot: input.fieldMappingSnapshot,
    provenanceSnapshot: input.provenanceSnapshot,
    fingerprintContribution: {
      confirmationFingerprintInputSummary:
        input.sourceInput.confirmationValidationResult.fingerprintInputSummary,
      mapperContributionFields: input.fieldMappingSnapshot.map(
        (field) => field.field,
      ),
      sourceEvidenceFingerprint:
        input.sourceInput.rawEvidence.provenance.evidenceFingerprint,
      brokerReferenceFingerprintInput:
        getBrokerConfirmationId(input.sourceInput.rawEvidence) ??
        getBrokerOrderId(input.sourceInput.rawEvidence),
      handoffPayloadFingerprint: getHandoffPayloadFingerprint(input.sourceInput),
      conversionFingerprintDraft: null,
    },
    partialFillMapping: input.partialFillMapping,
    mappedCandidate: input.mappedCandidate,
    safeToPersist: false,
    safeToMutateTrade: false,
    brokerExecutionResultCreated: false,
    mapperImplemented: true,
    persistenceAttempted: false,
    tradeMutationAttempted: false,
    auditAppendAttempted: false,
    browserAutomationAttempted: false,
  };
}

export function mapEvidenceToBrokerExecutionResultCandidate(
  input: EvidenceToBrokerExecutionResultMapperInput,
): EvidenceToBrokerExecutionResultMapperResult {
  const fieldMappingSnapshot = buildFieldMappingSnapshot(input.rawEvidence);
  const provenanceSnapshot = buildProvenanceSnapshot(input);
  const partialFillMapping = buildPartialFillMapping(input.rawEvidence);
  const warnings = buildMapperWarnings(input.rawEvidence);
  const rejectionReasons: EvidenceToBrokerExecutionResultMapperRejectionReason[] =
    [];

  if (input.confirmationValidationResult.status !== "confirmed_candidate") {
    rejectionReasons.push("confirmation_not_confirmed_candidate");
  }

  if (!input.confirmationValidationResult.safeToConvert) {
    rejectionReasons.push("confirmation_not_confirmed_candidate");
  }

  if (input.evidenceValidationResult.status === "rejected") {
    rejectionReasons.push("evidence_rejected");
  }

  if (input.evidenceValidationResult.status === "needs_review") {
    rejectionReasons.push("evidence_needs_review");
  }

  if (input.broker !== "avanza") {
    rejectionReasons.push("unsupported_broker");
  }

  if (input.sourceClassification !== "production_safe_candidate") {
    rejectionReasons.push("source_not_mappable");
  }

  rejectionReasons.push(...collectRequiredFieldRejections(input));

  if (partialFillMapping.requiresReview) {
    rejectionReasons.push("partial_fill_ambiguous");
  }

  const uniqueRejectionReasons = uniqueValues(rejectionReasons);

  if (uniqueRejectionReasons.length > 0) {
    return buildResult({
      sourceInput: input,
      status: statusForPreconditionFailure(input, partialFillMapping),
      rejectionReasons: uniqueRejectionReasons,
      warnings,
      fieldMappingSnapshot,
      provenanceSnapshot,
      partialFillMapping,
    });
  }

  const mappedCandidate = buildCandidate(
    input,
    fieldMappingSnapshot,
    provenanceSnapshot,
    partialFillMapping,
    warnings,
  );

  return buildResult({
    sourceInput: input,
    status: "mapped_candidate",
    rejectionReasons: [],
    warnings,
    fieldMappingSnapshot,
    provenanceSnapshot,
    partialFillMapping,
    mappedCandidate,
  });
}
