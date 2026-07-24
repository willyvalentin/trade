import {
  FINAL_SETTLEMENT_NOTE_MATCHING_CONTRACT_VERSION,
  FINAL_SETTLEMENT_NOTE_MATCHING_DEFAULT_POLICY_SNAPSHOT,
  FINAL_SETTLEMENT_NOTE_MATCHING_DEFAULT_SAFETY_POLICY,
  type FinalSettlementNoteMatchingConfidence,
  type FinalSettlementNoteMatchingDuplicateReason,
  type FinalSettlementNoteMatchingFieldComparison,
  type FinalSettlementNoteMatchingHardGate,
  type FinalSettlementNoteMatchingHardGateResult,
  type FinalSettlementNoteMatchingInput,
  type FinalSettlementNoteMatchingLifecycleTransition,
  type FinalSettlementNoteMatchingMismatchReason,
  type FinalSettlementNoteMatchingResult,
  type FinalSettlementNoteMatchingReviewFlag,
  type FinalSettlementNoteMatchingSafetyPolicy,
  type FinalSettlementNoteMatchingSoftSignal,
  type FinalSettlementNoteMatchingSoftSignalResult,
  type FinalSettlementNoteMatchingStatus,
  type FinalSettlementNotePartialFillMatchingStatus,
  type FinalSettlementNoteProvisionalTradeContext,
} from "@/lib/final-settlement-note-matching-contract";
import type {
  BrokerEvidenceMaskedAccountContext,
  BrokerEvidenceMonetaryAmount,
  BrokerEvidenceReviewFlag,
  BrokerEvidenceSourceReference,
  FinalBrokerSettlementNoteEvidence,
  ImmediateBrokerReadbackEvidence,
} from "@/lib/two-stage-broker-evidence-contract";

type MatchSide = "buy" | "sell";

type EvaluationState = {
  mismatchReasons: FinalSettlementNoteMatchingMismatchReason[];
  duplicateReasons: FinalSettlementNoteMatchingDuplicateReason[];
  reviewFlags: Array<FinalSettlementNoteMatchingReviewFlag | BrokerEvidenceReviewFlag>;
};

type InstrumentCandidate = {
  instrumentName?: string | null;
  ticker?: string | null;
  isin?: string | null;
  instrumentId?: string | null;
};

const PRICE_TOLERANCE_BPS = 50;
const TIME_PROXIMITY_MINUTES = 15;

const FINAL_SETTLEMENT_NOTE_MATCHING_VALIDATOR_SAFETY_POLICY = {
  ...FINAL_SETTLEMENT_NOTE_MATCHING_DEFAULT_SAFETY_POLICY,
  matchingImplementationEnabled: true,
  policyReason:
    "Pure final settlement note matching validation is enabled; finalization, capture, persistence, trade mutation, audit append, execution-record creation, browser automation, and Avanza behavior remain disabled.",
} as const satisfies FinalSettlementNoteMatchingSafetyPolicy;

function uniqueValues<T extends string>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

function isPresentString(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText(value: string | null | undefined): string | null {
  if (!isPresentString(value)) {
    return null;
  }

  return value.trim().replace(/\s+/g, " ").toLocaleUpperCase("sv-SE");
}

function textMatches(
  expected: string | null | undefined,
  actual: string | null | undefined,
): boolean {
  const normalizedExpected = normalizeText(expected);
  const normalizedActual = normalizeText(actual);

  return Boolean(
    normalizedExpected &&
      normalizedActual &&
      normalizedExpected === normalizedActual,
  );
}

function numberValue(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function numbersMatch(
  expected: number | null | undefined,
  actual: number | null | undefined,
): boolean | null {
  const normalizedExpected = numberValue(expected);
  const normalizedActual = numberValue(actual);

  if (normalizedExpected == null || normalizedActual == null) {
    return null;
  }

  return Math.abs(normalizedExpected - normalizedActual) < 0.000001;
}

function dateOnly(value: string | null | undefined): string | null {
  if (!isPresentString(value)) {
    return null;
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return new Date(timestamp).toISOString().slice(0, 10);
}

function minutesBetween(
  expected: string | null | undefined,
  actual: string | null | undefined,
): number | null {
  if (!isPresentString(expected) || !isPresentString(actual)) {
    return null;
  }

  const expectedTimestamp = Date.parse(expected);
  const actualTimestamp = Date.parse(actual);

  if (!Number.isFinite(expectedTimestamp) || !Number.isFinite(actualTimestamp)) {
    return null;
  }

  return Math.abs(actualTimestamp - expectedTimestamp) / 60_000;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function metadataBoolean(
  input: FinalSettlementNoteMatchingInput,
  keys: readonly string[],
): boolean {
  const metadataSources = [
    input.metadata,
    input.provisionalTradeContext?.metadata,
    input.finalSettlementNoteEvidence.metadata,
    input.executionCandidateMetadata?.metadata,
    toRecord(input.executionCandidateMetadata?.brokerExecutionResultCandidate),
    toRecord(input.executionCandidateMetadata?.executionRecordCandidate),
  ];

  return metadataSources.some((source) => {
    if (!source) {
      return false;
    }

    return keys.some((key) => source[key] === true);
  });
}

function previewString(value: string | null | undefined): string | null {
  return isPresentString(value) ? value.trim() : null;
}

function amountValue(amount: BrokerEvidenceMonetaryAmount | null | undefined) {
  return amount?.value ?? null;
}

function amountCurrency(amount: BrokerEvidenceMonetaryAmount | null | undefined) {
  return amount?.currency ?? null;
}

function getAccountField(
  account: BrokerEvidenceMaskedAccountContext | null | undefined,
  field: "accountLabel" | "accountType" | "maskedAccountId" | "category",
): string | null {
  const record = toRecord(account);
  const value = record?.[field];

  return typeof value === "string" ? value : null;
}

function accountContradicts(
  expected: BrokerEvidenceMaskedAccountContext | null | undefined,
  actual: BrokerEvidenceMaskedAccountContext | null | undefined,
): boolean {
  const fields = [
    "accountLabel",
    "accountType",
    "maskedAccountId",
    "category",
  ] as const;

  return fields.some((field) => {
    const expectedValue = getAccountField(expected, field);
    const actualValue = getAccountField(actual, field);

    return Boolean(
      normalizeText(expectedValue) &&
        normalizeText(actualValue) &&
        !textMatches(expectedValue, actualValue),
    );
  });
}

function accountHasComparisonData(
  expected: BrokerEvidenceMaskedAccountContext | null | undefined,
  actual: BrokerEvidenceMaskedAccountContext | null | undefined,
): boolean {
  const fields = [
    "accountLabel",
    "accountType",
    "maskedAccountId",
    "category",
  ] as const;

  return fields.some(
    (field) =>
      isPresentString(getAccountField(expected, field)) ||
      isPresentString(getAccountField(actual, field)),
  );
}

function instrumentCandidateFromReadback(
  evidence: ImmediateBrokerReadbackEvidence | null | undefined,
): InstrumentCandidate {
  return evidence?.instrument ?? {};
}

function instrumentCandidateFromProvisional(
  context: FinalSettlementNoteProvisionalTradeContext | null | undefined,
): InstrumentCandidate {
  return {
    instrumentName: context?.instrumentName ?? null,
    ticker: context?.ticker ?? null,
    isin: context?.isin ?? null,
    instrumentId: context?.instrumentId ?? null,
  };
}

function instrumentCandidateFromFinal(
  evidence: FinalBrokerSettlementNoteEvidence,
): InstrumentCandidate {
  return {
    instrumentName: evidence.instrument.instrumentName,
    ticker: evidence.instrument.ticker,
    isin: evidence.isin ?? evidence.instrument.isin ?? null,
    instrumentId: evidence.instrument.instrumentId,
  };
}

function pickExpectedInstrument(input: FinalSettlementNoteMatchingInput) {
  const provisional = instrumentCandidateFromProvisional(
    input.provisionalTradeContext,
  );
  const readback = instrumentCandidateFromReadback(
    input.provisionalImmediateReadbackEvidence,
  );

  return {
    instrumentName: provisional.instrumentName ?? readback.instrumentName ?? null,
    ticker: provisional.ticker ?? readback.ticker ?? null,
    isin: provisional.isin ?? readback.isin ?? null,
    instrumentId: provisional.instrumentId ?? readback.instrumentId ?? null,
  };
}

function hasInstrumentData(instrument: InstrumentCandidate): boolean {
  return Boolean(
    isPresentString(instrument.instrumentName) ||
      isPresentString(instrument.ticker) ||
      isPresentString(instrument.isin) ||
      isPresentString(instrument.instrumentId),
  );
}

function instrumentCompatible(
  expected: InstrumentCandidate,
  actual: InstrumentCandidate,
): boolean | null {
  if (!hasInstrumentData(expected) || !hasInstrumentData(actual)) {
    return null;
  }

  const strictPairs = [
    [expected.isin, actual.isin],
    [expected.instrumentId, actual.instrumentId],
    [expected.ticker, actual.ticker],
  ] as const;

  const contradictoryStrictPair = strictPairs.some(
    ([expectedValue, actualValue]) =>
      normalizeText(expectedValue) &&
      normalizeText(actualValue) &&
      !textMatches(expectedValue, actualValue),
  );

  if (contradictoryStrictPair) {
    return false;
  }

  const hasMatchingIdentity = strictPairs.some(([expectedValue, actualValue]) =>
    textMatches(expectedValue, actualValue),
  );

  return (
    hasMatchingIdentity ||
    textMatches(expected.instrumentName, actual.instrumentName)
  );
}

function pickExpectedSide(input: FinalSettlementNoteMatchingInput): MatchSide | null {
  return (
    input.provisionalTradeContext?.side ??
    input.provisionalImmediateReadbackEvidence?.side ??
    null
  );
}

function pickExpectedQuantity(input: FinalSettlementNoteMatchingInput) {
  return (
    input.provisionalTradeContext?.quantity ??
    input.provisionalImmediateReadbackEvidence?.quantity ??
    null
  );
}

function pickExpectedPrice(
  input: FinalSettlementNoteMatchingInput,
): BrokerEvidenceMonetaryAmount | null {
  return (
    input.provisionalTradeContext?.expectedPrice ??
    input.provisionalImmediateReadbackEvidence?.visiblePrice ??
    null
  );
}

function pickExpectedCurrency(input: FinalSettlementNoteMatchingInput) {
  return (
    input.provisionalTradeContext?.expectedPrice?.currency ??
    input.provisionalImmediateReadbackEvidence?.visibleCurrency ??
    input.provisionalImmediateReadbackEvidence?.visiblePrice?.currency ??
    null
  );
}

function pickExpectedDate(input: FinalSettlementNoteMatchingInput) {
  return (
    input.provisionalTradeContext?.tradeDate ??
    input.provisionalImmediateReadbackEvidence?.transactionReadbackTimestamp ??
    null
  );
}

function pickExpectedExecutionTime(input: FinalSettlementNoteMatchingInput) {
  return (
    input.provisionalTradeContext?.approximateExecutionTime ??
    input.provisionalImmediateReadbackEvidence?.transactionReadbackTimestamp ??
    null
  );
}

function pickExpectedHandoffFingerprint(input: FinalSettlementNoteMatchingInput) {
  return (
    input.handoffPayloadFingerprint ??
    input.provisionalTradeContext?.handoffPayloadFingerprint ??
    input.provisionalImmediateReadbackEvidence?.handoffPayloadFingerprint ??
    input.provisionalTradeContext?.provenance?.handoffPayloadFingerprint ??
    input.provisionalImmediateReadbackEvidence?.provenance.handoffPayloadFingerprint ??
    null
  );
}

function pickActualHandoffFingerprint(input: FinalSettlementNoteMatchingInput) {
  return (
    input.finalSettlementNoteEvidence.matchingCandidate
      ?.handoffPayloadFingerprint ??
    input.finalSettlementNoteEvidence.provenance.handoffPayloadFingerprint ??
    input.sourceMetadata.provenance?.handoffPayloadFingerprint ??
    null
  );
}

function hasProvenanceReference(
  provenance: BrokerEvidenceSourceReference | null | undefined,
) {
  return Boolean(
    provenance &&
      isPresentString(provenance.sourcePageIdentity) &&
      (isPresentString(provenance.evidenceFingerprint) ||
        isPresentString(provenance.captureId) ||
        isPresentString(provenance.requestId) ||
        isPresentString(provenance.sourceReferenceLabel)),
  );
}

function hasFinalNoteSourceIdentity(input: FinalSettlementNoteMatchingInput) {
  const evidence = input.finalSettlementNoteEvidence;
  const source = input.sourceMetadata;

  return Boolean(
    isPresentString(evidence.noteReferenceNumber) ||
      isPresentString(source.finalNoteReferenceNumber) ||
      isPresentString(source.sourceReferenceLabel) ||
      isPresentString(evidence.provenance.sourceReferenceLabel) ||
      isPresentString(source.sourceEvidenceFingerprint) ||
      isPresentString(evidence.provenance.evidenceFingerprint),
  );
}

function hasExplicitPartialFillModel(input: FinalSettlementNoteMatchingInput) {
  return Boolean(
    metadataBoolean(input, [
      "explicit_partial_fill_model",
      "explicitPartialFillModel",
      "partial_fill_model_present",
      "partialFillModelPresent",
    ]) ||
      input.finalSettlementNoteEvidence.reviewFlags.includes(
        "partial_match_requires_review",
      ) ||
      input.finalSettlementNoteEvidence.matchingCandidate?.reviewFlags.includes(
        "partial_match_requires_review",
      ),
  );
}

function hasPartialFillAmbiguity(input: FinalSettlementNoteMatchingInput) {
  return metadataBoolean(input, [
    "partial_fill_ambiguous",
    "partialFillAmbiguous",
    "multiple_notes_aggregate_requires_review",
    "multipleNotesAggregateRequiresReview",
  ]);
}

function buildComparison(input: {
  field: FinalSettlementNoteMatchingHardGate | FinalSettlementNoteMatchingSoftSignal;
  expectedValuePreview?: string | number | boolean | null;
  actualValuePreview?: string | number | boolean | null;
  compatible: boolean | null;
  confidence?: FinalSettlementNoteMatchingConfidence | null;
  notes?: string | null;
}): FinalSettlementNoteMatchingFieldComparison {
  return {
    field: input.field,
    expectedValuePreview: input.expectedValuePreview ?? null,
    actualValuePreview: input.actualValuePreview ?? null,
    compatible: input.compatible,
    confidence: input.confidence ?? null,
    notes: input.notes ?? null,
  };
}

function pushReason(
  reasons: FinalSettlementNoteMatchingMismatchReason[],
  reason: FinalSettlementNoteMatchingMismatchReason,
) {
  reasons.push(reason);
}

function buildGate(input: {
  gate: FinalSettlementNoteMatchingHardGate;
  passed: boolean;
  mismatchReason?: FinalSettlementNoteMatchingMismatchReason | null;
  comparison?: FinalSettlementNoteMatchingFieldComparison | null;
  state: EvaluationState;
}): FinalSettlementNoteMatchingHardGateResult {
  if (!input.passed && input.mismatchReason) {
    pushReason(input.state.mismatchReasons, input.mismatchReason);
  }

  return {
    gate: input.gate,
    passed: input.passed,
    required: true,
    blocked: !input.passed,
    mismatchReason: input.mismatchReason ?? null,
    comparison: input.comparison ?? null,
  };
}

function buildSignal(input: {
  signal: FinalSettlementNoteMatchingSoftSignal;
  present: boolean;
  supportive: boolean | null;
  requiresReview?: boolean;
  comparison?: FinalSettlementNoteMatchingFieldComparison | null;
}): FinalSettlementNoteMatchingSoftSignalResult {
  return {
    signal: input.signal,
    present: input.present,
    supportive: input.supportive,
    requiresReview: input.requiresReview ?? false,
    comparison: input.comparison ?? null,
  };
}

function evaluateHardGates(
  input: FinalSettlementNoteMatchingInput,
  state: EvaluationState,
): FinalSettlementNoteMatchingHardGateResult[] {
  const finalEvidence = input.finalSettlementNoteEvidence;
  const expectedInstrument = pickExpectedInstrument(input);
  const actualInstrument = instrumentCandidateFromFinal(finalEvidence);
  const instrumentMatch = instrumentCompatible(expectedInstrument, actualInstrument);
  const expectedSide = pickExpectedSide(input);
  const expectedQuantity = pickExpectedQuantity(input);
  const quantityMatch = numbersMatch(expectedQuantity, finalEvidence.quantity);
  const explicitPartialFillModel = hasExplicitPartialFillModel(input);
  const expectedDate = dateOnly(pickExpectedDate(input));
  const actualDate = dateOnly(
    finalEvidence.businessDate ?? finalEvidence.executionTime ?? null,
  );
  const expectedAccount =
    input.accountContext ??
    input.provisionalTradeContext?.accountContext ??
    input.provisionalImmediateReadbackEvidence?.accountContext ??
    null;
  const actualAccount = finalEvidence.accountContext ?? null;
  const sourceIdentityPresent = hasFinalNoteSourceIdentity(input);
  const provenancePresent = Boolean(
    hasProvenanceReference(input.sourceMetadata.provenance) ||
      hasProvenanceReference(finalEvidence.provenance),
  );

  return [
    buildGate({
      gate: "same_broker",
      passed: input.broker === finalEvidence.broker,
      mismatchReason: input.broker === finalEvidence.broker ? null : "insufficient_data",
      comparison: buildComparison({
        field: "same_broker",
        expectedValuePreview: input.broker,
        actualValuePreview: finalEvidence.broker,
        compatible: input.broker === finalEvidence.broker,
      }),
      state,
    }),
    buildGate({
      gate: "same_side",
      passed: Boolean(expectedSide && expectedSide === finalEvidence.side),
      mismatchReason:
        expectedSide && expectedSide !== finalEvidence.side
          ? "side_mismatch"
          : "insufficient_data",
      comparison: buildComparison({
        field: "same_side",
        expectedValuePreview: expectedSide,
        actualValuePreview: finalEvidence.side,
        compatible: expectedSide ? expectedSide === finalEvidence.side : null,
      }),
      state,
    }),
    buildGate({
      gate: "compatible_instrument_identity",
      passed: instrumentMatch === true,
      mismatchReason:
        instrumentMatch === false ? "instrument_mismatch" : "insufficient_data",
      comparison: buildComparison({
        field: "compatible_instrument_identity",
        expectedValuePreview:
          expectedInstrument.isin ??
          expectedInstrument.ticker ??
          expectedInstrument.instrumentName ??
          null,
        actualValuePreview:
          actualInstrument.isin ??
          actualInstrument.ticker ??
          actualInstrument.instrumentName ??
          null,
        compatible: instrumentMatch,
      }),
      state,
    }),
    buildGate({
      gate: "compatible_quantity_or_explicit_partial_fill_model",
      passed: quantityMatch === true || explicitPartialFillModel,
      mismatchReason:
        quantityMatch === false && !explicitPartialFillModel
          ? "quantity_mismatch"
          : "insufficient_data",
      comparison: buildComparison({
        field: "compatible_quantity_or_explicit_partial_fill_model",
        expectedValuePreview: expectedQuantity,
        actualValuePreview: finalEvidence.quantity,
        compatible:
          quantityMatch === true || explicitPartialFillModel
            ? true
            : quantityMatch,
        notes: explicitPartialFillModel
          ? "Quantity differs but an explicit partial-fill review model is present."
          : null,
      }),
      state,
    }),
    buildGate({
      gate: "compatible_trade_or_business_date",
      passed: Boolean(expectedDate && actualDate && expectedDate === actualDate),
      mismatchReason:
        expectedDate && actualDate && expectedDate !== actualDate
          ? "date_mismatch"
          : "insufficient_data",
      comparison: buildComparison({
        field: "compatible_trade_or_business_date",
        expectedValuePreview: expectedDate,
        actualValuePreview: actualDate,
        compatible: expectedDate && actualDate ? expectedDate === actualDate : null,
      }),
      state,
    }),
    buildGate({
      gate: "non_contradictory_account_or_category",
      passed: !accountContradicts(expectedAccount, actualAccount),
      mismatchReason: accountContradicts(expectedAccount, actualAccount)
        ? "account_mismatch"
        : null,
      comparison: buildComparison({
        field: "non_contradictory_account_or_category",
        expectedValuePreview:
          getAccountField(expectedAccount, "maskedAccountId") ??
          getAccountField(expectedAccount, "accountType") ??
          getAccountField(expectedAccount, "category"),
        actualValuePreview:
          getAccountField(actualAccount, "maskedAccountId") ??
          getAccountField(actualAccount, "accountType") ??
          getAccountField(actualAccount, "category"),
        compatible: accountHasComparisonData(expectedAccount, actualAccount)
          ? !accountContradicts(expectedAccount, actualAccount)
          : null,
      }),
      state,
    }),
    buildGate({
      gate: "final_note_source_identity_present",
      passed: sourceIdentityPresent,
      mismatchReason: sourceIdentityPresent ? null : "missing_note_reference",
      comparison: buildComparison({
        field: "final_note_source_identity_present",
        expectedValuePreview: true,
        actualValuePreview: sourceIdentityPresent,
        compatible: sourceIdentityPresent,
      }),
      state,
    }),
    buildGate({
      gate: "provenance_present",
      passed: provenancePresent,
      mismatchReason: provenancePresent ? null : "missing_provenance",
      comparison: buildComparison({
        field: "provenance_present",
        expectedValuePreview: true,
        actualValuePreview: provenancePresent,
        compatible: provenancePresent,
      }),
      state,
    }),
  ];
}

function evaluateSoftSignals(
  input: FinalSettlementNoteMatchingInput,
  state: EvaluationState,
): FinalSettlementNoteMatchingSoftSignalResult[] {
  const finalEvidence = input.finalSettlementNoteEvidence;
  const expectedPrice = pickExpectedPrice(input);
  const actualPrice = finalEvidence.executionPrice ?? null;
  const expectedPriceValue = amountValue(expectedPrice);
  const actualPriceValue = amountValue(actualPrice);
  const priceDeltaBps =
    expectedPriceValue && actualPriceValue
      ? (Math.abs(actualPriceValue - expectedPriceValue) / expectedPriceValue) *
        10_000
      : null;
  const pricePresent = expectedPriceValue != null && actualPriceValue != null;
  const priceSupportive = pricePresent
    ? priceDeltaBps != null && priceDeltaBps <= PRICE_TOLERANCE_BPS
    : null;
  const executionTimeDelta = minutesBetween(
    pickExpectedExecutionTime(input),
    finalEvidence.executionTime,
  );
  const expectedCurrency = pickExpectedCurrency(input);
  const actualCurrency =
    finalEvidence.currency ?? finalEvidence.executionPrice?.currency ?? null;
  const currencyPresent =
    isPresentString(expectedCurrency) && isPresentString(actualCurrency);
  const orderTypeCandidate = finalEvidence.matchingCandidate?.price?.rawLabel;
  const expectedVenue =
    input.provisionalImmediateReadbackEvidence?.instrument.venue ??
    input.provisionalImmediateReadbackEvidence?.instrument.market ??
    null;
  const actualVenue =
    finalEvidence.marketOrVenue ??
    finalEvidence.instrument.venue ??
    finalEvidence.instrument.market ??
    null;
  const expectedHandoff = pickExpectedHandoffFingerprint(input);
  const actualHandoff = pickActualHandoffFingerprint(input);
  const handoffPresent =
    isPresentString(expectedHandoff) && isPresentString(actualHandoff);

  if (pricePresent && priceSupportive === false) {
    state.mismatchReasons.push("price_mismatch");
    state.reviewFlags.push("price_tolerance_review");
  }

  if (
    executionTimeDelta != null &&
    executionTimeDelta > TIME_PROXIMITY_MINUTES
  ) {
    state.reviewFlags.push("time_proximity_review");
  }

  if (currencyPresent && !textMatches(expectedCurrency, actualCurrency)) {
    state.mismatchReasons.push("currency_mismatch");
  }

  const orderTypePresent =
    isPresentString(orderTypeCandidate) && isPresentString(finalEvidence.orderType);
  if (orderTypePresent && !textMatches(orderTypeCandidate, finalEvidence.orderType)) {
    state.mismatchReasons.push("order_type_mismatch");
  }

  const venuePresent = isPresentString(expectedVenue) && isPresentString(actualVenue);
  if (venuePresent && !textMatches(expectedVenue, actualVenue)) {
    state.mismatchReasons.push("market_or_venue_mismatch");
  }

  const amountPresent = Boolean(
    finalEvidence.commission || finalEvidence.consideration || finalEvidence.totalAmount,
  );
  const fxPresent = Boolean(finalEvidence.fxRates && finalEvidence.fxRates.length > 0);
  const noteReference =
    finalEvidence.noteReferenceNumber ??
    input.sourceMetadata.finalNoteReferenceNumber ??
    null;

  return [
    buildSignal({
      signal: "price_tolerance",
      present: pricePresent,
      supportive: priceSupportive,
      requiresReview: priceSupportive === false,
      comparison: buildComparison({
        field: "price_tolerance",
        expectedValuePreview: expectedPriceValue,
        actualValuePreview: actualPriceValue,
        compatible: priceSupportive,
        notes:
          priceDeltaBps == null
            ? null
            : `${priceDeltaBps.toFixed(2)} bps from provisional price`,
      }),
    }),
    buildSignal({
      signal: "time_proximity",
      present: executionTimeDelta != null,
      supportive:
        executionTimeDelta == null
          ? null
          : executionTimeDelta <= TIME_PROXIMITY_MINUTES,
      requiresReview:
        executionTimeDelta != null &&
        executionTimeDelta > TIME_PROXIMITY_MINUTES,
      comparison: buildComparison({
        field: "time_proximity",
        expectedValuePreview: previewString(pickExpectedExecutionTime(input)),
        actualValuePreview: previewString(finalEvidence.executionTime),
        compatible:
          executionTimeDelta == null
            ? null
            : executionTimeDelta <= TIME_PROXIMITY_MINUTES,
        notes:
          executionTimeDelta == null
            ? null
            : `${executionTimeDelta.toFixed(1)} minutes apart`,
      }),
    }),
    buildSignal({
      signal: "currency_match",
      present: currencyPresent,
      supportive: currencyPresent
        ? textMatches(expectedCurrency, actualCurrency)
        : null,
      requiresReview:
        currencyPresent && !textMatches(expectedCurrency, actualCurrency),
      comparison: buildComparison({
        field: "currency_match",
        expectedValuePreview: expectedCurrency,
        actualValuePreview: actualCurrency,
        compatible: currencyPresent
          ? textMatches(expectedCurrency, actualCurrency)
          : null,
      }),
    }),
    buildSignal({
      signal: "order_type_match",
      present: orderTypePresent,
      supportive: orderTypePresent
        ? textMatches(orderTypeCandidate, finalEvidence.orderType)
        : null,
      requiresReview:
        orderTypePresent && !textMatches(orderTypeCandidate, finalEvidence.orderType),
      comparison: buildComparison({
        field: "order_type_match",
        expectedValuePreview: orderTypeCandidate ?? null,
        actualValuePreview: finalEvidence.orderType ?? null,
        compatible: orderTypePresent
          ? textMatches(orderTypeCandidate, finalEvidence.orderType)
          : null,
      }),
    }),
    buildSignal({
      signal: "market_or_venue_match",
      present: venuePresent,
      supportive: venuePresent ? textMatches(expectedVenue, actualVenue) : null,
      requiresReview: venuePresent && !textMatches(expectedVenue, actualVenue),
      comparison: buildComparison({
        field: "market_or_venue_match",
        expectedValuePreview: expectedVenue,
        actualValuePreview: actualVenue,
        compatible: venuePresent ? textMatches(expectedVenue, actualVenue) : null,
      }),
    }),
    buildSignal({
      signal: "amount_or_commission_consistency",
      present: amountPresent,
      supportive: amountPresent,
      comparison: buildComparison({
        field: "amount_or_commission_consistency",
        expectedValuePreview: amountCurrency(expectedPrice),
        actualValuePreview:
          finalEvidence.commission?.currency ??
          finalEvidence.consideration?.currency ??
          finalEvidence.totalAmount?.currency ??
          null,
        compatible: amountPresent,
      }),
    }),
    buildSignal({
      signal: "fx_consistency",
      present: fxPresent,
      supportive:
        currencyPresent && textMatches(expectedCurrency, actualCurrency)
          ? true
          : fxPresent || null,
      requiresReview:
        currencyPresent &&
        !textMatches(expectedCurrency, actualCurrency) &&
        !fxPresent,
      comparison: buildComparison({
        field: "fx_consistency",
        expectedValuePreview: expectedCurrency,
        actualValuePreview: actualCurrency,
        compatible:
          currencyPresent && textMatches(expectedCurrency, actualCurrency)
            ? true
            : fxPresent || null,
      }),
    }),
    buildSignal({
      signal: "handoff_fingerprint_linkage",
      present: handoffPresent,
      supportive: handoffPresent ? textMatches(expectedHandoff, actualHandoff) : null,
      requiresReview:
        handoffPresent && !textMatches(expectedHandoff, actualHandoff),
      comparison: buildComparison({
        field: "handoff_fingerprint_linkage",
        expectedValuePreview: expectedHandoff,
        actualValuePreview: actualHandoff,
        compatible: handoffPresent
          ? textMatches(expectedHandoff, actualHandoff)
          : null,
      }),
    }),
    buildSignal({
      signal: "note_reference_uniqueness",
      present: isPresentString(noteReference),
      supportive:
        isPresentString(noteReference) && state.duplicateReasons.length === 0,
      requiresReview: state.duplicateReasons.length > 0,
      comparison: buildComparison({
        field: "note_reference_uniqueness",
        expectedValuePreview: "unique note reference",
        actualValuePreview: noteReference,
        compatible:
          isPresentString(noteReference) && state.duplicateReasons.length === 0,
      }),
    }),
  ];
}

function evaluateDuplicateReasons(
  input: FinalSettlementNoteMatchingInput,
): FinalSettlementNoteMatchingDuplicateReason[] {
  const reasons: FinalSettlementNoteMatchingDuplicateReason[] = [];

  if (
    metadataBoolean(input, ["duplicate_note_candidates", "duplicateNoteCandidates"]) ||
    input.finalSettlementNoteEvidence.reviewFlags.includes(
      "duplicate_final_note_candidates",
    )
  ) {
    reasons.push("duplicate_note_candidates");
  }

  if (
    metadataBoolean(input, [
      "same_note_matches_multiple_provisional_trades",
      "sameNoteMatchesMultipleProvisionalTrades",
    ])
  ) {
    reasons.push("same_note_matches_multiple_provisional_trades");
  }

  if (
    metadataBoolean(input, [
      "duplicate_note_reference_number",
      "duplicateNoteReferenceNumber",
    ])
  ) {
    reasons.push("duplicate_note_reference_number");
  }

  if (
    metadataBoolean(input, [
      "duplicate_handoff_payload_fingerprint",
      "duplicateHandoffPayloadFingerprint",
    ])
  ) {
    reasons.push("duplicate_handoff_payload_fingerprint");
  }

  if (
    metadataBoolean(input, [
      "duplicate_provenance_reference",
      "duplicateProvenanceReference",
    ])
  ) {
    reasons.push("duplicate_provenance_reference");
  }

  return uniqueValues(reasons);
}

function determinePartialFillStatus(
  input: FinalSettlementNoteMatchingInput,
): FinalSettlementNotePartialFillMatchingStatus {
  const expectedQuantity = pickExpectedQuantity(input);
  const actualQuantity = input.finalSettlementNoteEvidence.quantity;
  const quantityMatch = numbersMatch(expectedQuantity, actualQuantity);

  if (hasPartialFillAmbiguity(input)) {
    return "partial_fill_ambiguous";
  }

  if (quantityMatch === true) {
    return "single_note_full_fill";
  }

  if (hasExplicitPartialFillModel(input)) {
    return "single_note_partial_fill_requires_review";
  }

  return "not_partial";
}

function statusFromEvaluation(input: {
  hardGateResults: FinalSettlementNoteMatchingHardGateResult[];
  softSignalResults: FinalSettlementNoteMatchingSoftSignalResult[];
  mismatchReasons: FinalSettlementNoteMatchingMismatchReason[];
  duplicateReasons: FinalSettlementNoteMatchingDuplicateReason[];
  partialFillMatchingStatus: FinalSettlementNotePartialFillMatchingStatus;
}): {
  status: FinalSettlementNoteMatchingStatus;
  confidence: FinalSettlementNoteMatchingConfidence;
  matched: boolean;
  lifecycleTransitionSuggestion: FinalSettlementNoteMatchingLifecycleTransition;
} {
  if (input.duplicateReasons.length > 0) {
    return {
      status: "duplicate_candidates",
      confidence: "duplicate_candidates",
      matched: false,
      lifecycleTransitionSuggestion: "final_note_available_to_needs_review",
    };
  }

  const blockedGates = input.hardGateResults.filter((result) => result.blocked);
  const hardMismatch = blockedGates.some(
    (result) =>
      result.mismatchReason &&
      ![
        "insufficient_data",
        "missing_note_reference",
        "missing_provenance",
        "partial_fill_ambiguous",
      ].includes(result.mismatchReason),
  );

  if (hardMismatch) {
    return {
      status: "mismatch",
      confidence: "mismatch",
      matched: false,
      lifecycleTransitionSuggestion: "final_note_available_to_final_note_mismatch",
    };
  }

  if (blockedGates.length > 0) {
    return {
      status: "insufficient_data",
      confidence: "insufficient_data",
      matched: false,
      lifecycleTransitionSuggestion: "final_note_available_to_needs_review",
    };
  }

  if (
    input.partialFillMatchingStatus === "single_note_partial_fill_requires_review" ||
    input.partialFillMatchingStatus === "partial_fill_ambiguous"
  ) {
    return {
      status: "needs_review",
      confidence: "partial_match",
      matched: false,
      lifecycleTransitionSuggestion: "final_note_available_to_needs_review",
    };
  }

  const reviewSignals = input.softSignalResults.filter(
    (result) => result.requiresReview,
  );
  if (reviewSignals.length > 0) {
    return {
      status: "needs_review",
      confidence:
        reviewSignals.length >= 2 || input.mismatchReasons.length >= 2
          ? "ambiguous_match"
          : "partial_match",
      matched: false,
      lifecycleTransitionSuggestion: "final_note_available_to_needs_review",
    };
  }

  const supportiveSignals = input.softSignalResults.filter(
    (result) => result.supportive === true,
  );
  const presentSignals = input.softSignalResults.filter((result) => result.present);
  const exactSignals = new Set(
    input.softSignalResults
      .filter((result) => result.supportive === true)
      .map((result) => result.signal),
  );
  const exact =
    exactSignals.has("price_tolerance") &&
    exactSignals.has("time_proximity") &&
    exactSignals.has("currency_match") &&
    exactSignals.has("handoff_fingerprint_linkage") &&
    exactSignals.has("note_reference_uniqueness");

  return {
    status: "matched",
    confidence:
      exact || supportiveSignals.length === presentSignals.length
        ? "exact_match"
        : "strong_match",
    matched: true,
    lifecycleTransitionSuggestion: "final_note_available_to_final_note_matched",
  };
}

function addReviewFlags(
  state: EvaluationState,
  hardGateResults: FinalSettlementNoteMatchingHardGateResult[],
  softSignalResults: FinalSettlementNoteMatchingSoftSignalResult[],
  partialFillStatus: FinalSettlementNotePartialFillMatchingStatus,
) {
  if (hardGateResults.some((result) => result.blocked)) {
    state.reviewFlags.push("hard_gate_missing_data");
  }

  if (
    hardGateResults.some(
      (result) =>
        result.blocked && result.mismatchReason !== "insufficient_data",
    )
  ) {
    state.reviewFlags.push("hard_gate_contradiction");
  }

  if (softSignalResults.some((result) => result.requiresReview)) {
    state.reviewFlags.push("soft_signal_weak");
  }

  if (
    partialFillStatus === "single_note_partial_fill_requires_review" ||
    partialFillStatus === "partial_fill_ambiguous"
  ) {
    state.reviewFlags.push("partial_fill_review");
    state.mismatchReasons.push("partial_fill_ambiguous");
  }

  if (state.duplicateReasons.length > 0) {
    state.reviewFlags.push("duplicate_candidate_review");
  }

  if (state.mismatchReasons.includes("missing_note_reference")) {
    state.reviewFlags.push("missing_note_reference_review");
  }

  if (state.mismatchReasons.includes("account_mismatch")) {
    state.reviewFlags.push("account_context_review");
  }

  if (state.mismatchReasons.includes("missing_provenance")) {
    state.reviewFlags.push("provenance_review");
  }
}

export function validateFinalSettlementNoteMatch(
  input: FinalSettlementNoteMatchingInput,
): FinalSettlementNoteMatchingResult {
  const state: EvaluationState = {
    mismatchReasons: [],
    duplicateReasons: evaluateDuplicateReasons(input),
    reviewFlags: [],
  };
  const hardGateResults = evaluateHardGates(input, state);
  const partialFillMatchingStatus = determinePartialFillStatus(input);
  const softSignalResults = evaluateSoftSignals(input, state);

  addReviewFlags(
    state,
    hardGateResults,
    softSignalResults,
    partialFillMatchingStatus,
  );

  const status = statusFromEvaluation({
    hardGateResults,
    softSignalResults,
    mismatchReasons: uniqueValues(state.mismatchReasons),
    duplicateReasons: uniqueValues(state.duplicateReasons),
    partialFillMatchingStatus,
  });

  return {
    contractVersion: FINAL_SETTLEMENT_NOTE_MATCHING_CONTRACT_VERSION,
    evaluatedAt: input.requestedAt,
    status: status.status,
    confidence: status.confidence,
    matched: status.matched,
    hardGateResults,
    softSignalResults,
    mismatchReasons: uniqueValues(state.mismatchReasons),
    duplicateReasons: uniqueValues(state.duplicateReasons),
    partialFillMatchingStatus,
    lifecycleTransitionSuggestion: status.lifecycleTransitionSuggestion,
    reviewFlags: uniqueValues(state.reviewFlags),
    warnings: [
      "final_note_match_not_persistence_approval",
      "final_note_match_not_trade_mutation_approval",
      "final_note_match_not_execution_record",
      "safe_to_finalize_false",
      "safe_to_persist_false",
      "safe_to_mutate_trade_false",
    ],
    policySnapshot: {
      ...(input.policySnapshot ?? FINAL_SETTLEMENT_NOTE_MATCHING_DEFAULT_POLICY_SNAPSHOT),
      evaluatedAt: input.policySnapshot?.evaluatedAt ?? input.requestedAt,
      safetyPolicy: FINAL_SETTLEMENT_NOTE_MATCHING_VALIDATOR_SAFETY_POLICY,
    },
    safetyPolicy: FINAL_SETTLEMENT_NOTE_MATCHING_VALIDATOR_SAFETY_POLICY,
    safeToFinalize: false,
    safeToPersist: false,
    safeToMutateTrade: false,
    finalizationAttempted: false,
    persistenceAttempted: false,
    tradeMutationAttempted: false,
    executionRecordCreated: false,
    auditAppendAttempted: false,
    browserAutomationAttempted: false,
    metadata: {
      validator: "validateFinalSettlementNoteMatch",
      priceToleranceBps: PRICE_TOLERANCE_BPS,
      timeProximityMinutes: TIME_PROXIMITY_MINUTES,
      sideEffectFree: true,
    },
  };
}
