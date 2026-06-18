import type {
  FinalizationCandidate,
  FinalizationCandidatePartialFillStatus,
  FinalizationCandidateRejectionReason,
  FinalizationCandidateReviewFlag,
  FinalizationCandidateStatus,
  FinalizationCandidateWarning,
} from "@/lib/finalization-candidate-contract";
import {
  FINALIZATION_CANDIDATE_CONTRACT_VERSION,
  FINALIZATION_CANDIDATE_DEFAULT_SAFETY_POLICY,
} from "@/lib/finalization-candidate-contract";
import type {
  FinalizationCandidateBuilderInput,
  FinalizationCandidateBuilderPolicySnapshot,
  FinalizationCandidateBuilderPrecondition,
  FinalizationCandidateBuilderPreconditionResult,
  FinalizationCandidateBuilderPnLInputSummary,
  FinalizationCandidateBuilderRejectionReason,
  FinalizationCandidateBuilderResult,
  FinalizationCandidateBuilderSafetyPolicy,
  FinalizationCandidateBuilderStatus,
  FinalizationCandidateBuilderWarning,
} from "@/lib/finalization-candidate-builder-contract";
import {
  FINALIZATION_CANDIDATE_BUILDER_CONTRACT_VERSION,
  FINALIZATION_CANDIDATE_BUILDER_DEFAULT_POLICY_SNAPSHOT,
  FINALIZATION_CANDIDATE_BUILDER_DEFAULT_SAFETY_POLICY,
} from "@/lib/finalization-candidate-builder-contract";
import type {
  BrokerEvidenceReviewFlag,
  BrokerEvidenceWarning,
} from "@/lib/two-stage-broker-evidence-contract";

const SUPPORTED_SOURCE_CLASSIFICATIONS = new Set([
  "broker_confirmed",
  "production_safe_candidate",
]);

const CANDIDATE_SAFETY_POLICY = {
  ...FINALIZATION_CANDIDATE_DEFAULT_SAFETY_POLICY,
  policyReason:
    "Finalization candidate builder output is candidate metadata only and does not approve or implement finalization, persistence, execution-record creation, stats/PnL updates, trade mutation, audit append, browser automation, or Avanza behavior.",
} as const;

type CandidateReviewFlag =
  | FinalizationCandidateReviewFlag
  | BrokerEvidenceReviewFlag;

type CandidateWarning = FinalizationCandidateWarning | BrokerEvidenceWarning;

type BuilderEvaluation = {
  preconditionResults: FinalizationCandidateBuilderPreconditionResult[];
  warnings: FinalizationCandidateBuilderWarning[];
  rejectionReasons: FinalizationCandidateBuilderRejectionReason[];
  candidateReviewFlags: CandidateReviewFlag[];
  candidateWarnings: CandidateWarning[];
  candidateRejectionReasons: FinalizationCandidateRejectionReason[];
};

export function buildFinalizationCandidate(
  input: FinalizationCandidateBuilderInput,
): FinalizationCandidateBuilderResult {
  const evaluatedAt = input.requestedAt;
  const safetyPolicy = FINALIZATION_CANDIDATE_BUILDER_DEFAULT_SAFETY_POLICY;
  const policySnapshot = buildPolicySnapshot(input, evaluatedAt, safetyPolicy);
  const settlementInputSummary = buildSettlementInputSummary(input);
  const feeInputSummary = buildFeeInputSummary(input);
  const fxInputSummary = buildFxInputSummary(input);
  const pnlInputSummary = buildPnLInputSummary(input);
  const evaluation = evaluatePreconditions(input);
  const status = deriveBuilderStatus(input, evaluation.preconditionResults);
  const candidateStatus = mapBuilderStatusToCandidateStatus(status);
  const candidate =
    candidateStatus === null
      ? null
      : buildCandidate(input, {
          evaluatedAt,
          status: candidateStatus,
          settlementMissingFields: settlementInputSummary.missingFields,
          feeReviewRequired: feeInputSummary.reviewRequired,
          fxReviewRequired: fxInputSummary.reviewRequired,
          pnlDeltaEstimated: pnlInputSummary.pnlDeltaEstimated,
          reviewFlags: evaluation.candidateReviewFlags,
          warnings: evaluation.candidateWarnings,
          rejectionReasons: evaluation.candidateRejectionReasons,
        });

  return {
    contractVersion: FINALIZATION_CANDIDATE_BUILDER_CONTRACT_VERSION,
    evaluatedAt,
    status,
    candidateStatus,
    candidate,
    preconditionResults: evaluation.preconditionResults,
    warnings: evaluation.warnings,
    rejectionReasons: evaluation.rejectionReasons,
    policySnapshot,
    settlementInputSummary,
    feeInputSummary,
    fxInputSummary,
    pnlInputSummary,
    safetyPolicy,
    safeToFinalize: false,
    safeToPersist: false,
    safeToCreateExecutionRecord: false,
    safeToUpdateStats: false,
    safeToMutateTrade: false,
    builderImplementationEnabled: false,
    finalizationAttempted: false,
    persistenceAttempted: false,
    executionRecordCreationAttempted: false,
    statsUpdateAttempted: false,
    tradeMutationAttempted: false,
    auditAppendAttempted: false,
    browserAutomationAttempted: false,
    avanzaAutomationAttempted: false,
    metadata: {
      ...(input.metadata ?? {}),
      finalizationCandidateBuilderPure: true,
      candidateOnly: true,
      finalizationApproval: false,
      persistenceApproval: false,
      executionRecordCreationApproval: false,
      statsUpdateApproval: false,
      tradeMutationApproval: false,
    },
  };
}

function buildPolicySnapshot(
  input: FinalizationCandidateBuilderInput,
  evaluatedAt: string,
  safetyPolicy: FinalizationCandidateBuilderSafetyPolicy,
): FinalizationCandidateBuilderPolicySnapshot {
  return {
    ...(input.policySnapshot ??
      FINALIZATION_CANDIDATE_BUILDER_DEFAULT_POLICY_SNAPSHOT),
    evaluatedAt,
    allowsCandidateBuild: true,
    allowsFinalization: false,
    allowsPersistence: false,
    allowsExecutionRecordCreation: false,
    allowsStatsUpdate: false,
    allowsTradeMutation: false,
    allowsAutomaticMode: false,
    requiresManualReview: true,
    safetyPolicy,
  };
}

function buildSettlementInputSummary(input: FinalizationCandidateBuilderInput) {
  const finalNote = input.finalSettlementNoteEvidence;
  const missingFields = new Set<string>(finalNote.missingFields);

  if (!finalNote.businessDate) {
    missingFields.add("business_date");
  }

  if (!finalNote.settlementDate) {
    missingFields.add("settlement_date");
  }

  if (!finalNote.printDate) {
    missingFields.add("print_date");
  }

  if (!finalNote.noteReferenceNumber) {
    missingFields.add("note_reference_number");
  }

  return {
    broker: "avanza" as const,
    businessDate: finalNote.businessDate,
    settlementDate: finalNote.settlementDate,
    printDate: finalNote.printDate,
    noteReferenceNumber: finalNote.noteReferenceNumber,
    totalAmount: finalNote.totalAmount,
    consideration: finalNote.consideration,
    currency: finalNote.currency,
    accountContext: input.accountContext ?? finalNote.accountContext ?? null,
    sourceProvenance: finalNote.provenance,
    missingFields: Array.from(missingFields),
    reviewRequired:
      !finalNote.businessDate || !finalNote.settlementDate || !finalNote.printDate,
  };
}

function buildFeeInputSummary(input: FinalizationCandidateBuilderInput) {
  const finalNote = input.finalSettlementNoteEvidence;
  const commission = finalNote.commission ?? null;
  const commissionMissing = !commission;

  return {
    commission,
    fees: commission ? [commission] : [],
    feeCurrency: commission?.currency ?? finalNote.currency ?? null,
    totalFees: commission,
    commissionAvailable: commission !== null,
    commissionMissing,
    reviewRequired: commissionMissing,
  };
}

function buildFxInputSummary(input: FinalizationCandidateBuilderInput) {
  const finalNote = input.finalSettlementNoteEvidence;
  const settlementCurrency =
    finalNote.currency ?? finalNote.totalAmount?.currency ?? null;
  const baseCurrency =
    finalNote.executionPrice?.currency ??
    finalNote.consideration?.currency ??
    settlementCurrency;
  const accountCurrency =
    input.existingStatsSummary?.currentRealizedPnL?.currency ??
    input.existingStatsSummary?.currentFeeTotal?.currency ??
    settlementCurrency;
  const currencies = [baseCurrency, settlementCurrency, accountCurrency].filter(
    (currency): currency is string => Boolean(currency),
  );
  const uniqueCurrencies = new Set(currencies);
  const hasNonSekCurrency = currencies.some((currency) => currency !== "SEK");
  const fxRequired = uniqueCurrencies.size > 1 || hasNonSekCurrency;
  const fxRatesAvailable = (finalNote.fxRates ?? []).length > 0;

  return {
    baseCurrency,
    settlementCurrency,
    accountCurrency,
    fxRequired,
    fxRatesAvailable,
    fxRatesMissing: fxRequired && !fxRatesAvailable,
    sekOnly: !fxRequired && currencies.every((currency) => currency === "SEK"),
    reviewRequired: fxRequired && !fxRatesAvailable,
  };
}

function buildPnLInputSummary(
  input: FinalizationCandidateBuilderInput,
): FinalizationCandidateBuilderPnLInputSummary {
  const finalNote = input.finalSettlementNoteEvidence;
  const existingRealizedPnL =
    input.existingStatsSummary?.currentRealizedPnL ?? null;
  const feeAdjustment = finalNote.commission ?? null;
  const cashImpact = finalNote.totalAmount ?? finalNote.consideration ?? null;

  return {
    existingRealizedPnL,
    provisionalPnL: null,
    estimatedFinalPnL: null,
    feeAdjustment,
    fxAdjustment: null,
    cashImpact,
    pnlDeltaEstimated: Boolean(feeAdjustment || cashImpact),
    previewOnly: true,
    safeToUpdateStats: false,
  };
}

function evaluatePreconditions(
  input: FinalizationCandidateBuilderInput,
): BuilderEvaluation {
  const evaluation: BuilderEvaluation = {
    preconditionResults: [],
    warnings: ["candidate_not_finalization_approval"],
    rejectionReasons: [],
    candidateReviewFlags: ["finalization_validator_missing"],
    candidateWarnings: [
      "candidate_contract_only",
      "not_finalization_approval",
      "not_persistence_approval",
      "not_execution_record_creation_approval",
      "not_stats_update_approval",
      "not_trade_mutation_approval",
      "finalization_validator_not_implemented",
      "persistence_not_attempted",
      "execution_record_creation_not_attempted",
      "stats_update_not_attempted",
      "trade_mutation_not_attempted",
    ],
    candidateRejectionReasons: ["finalization_validator_missing"],
  };

  addPrecondition(evaluation, evaluateMatchingResult(input));
  addPrecondition(evaluation, evaluateFinalNoteSourceIdentity(input));
  addPrecondition(evaluation, evaluateProvenance(input));
  addPrecondition(evaluation, evaluateBrokerSourceCompatibility(input));
  addPrecondition(evaluation, evaluateSimpleCompatibility(input, "side"));
  addPrecondition(evaluation, evaluateSimpleCompatibility(input, "instrument"));
  addPrecondition(evaluation, evaluateQuantityCompatibility(input));
  addPrecondition(evaluation, evaluateSimpleCompatibility(input, "date"));
  addPrecondition(evaluation, evaluateFeeData(input));
  addPrecondition(evaluation, evaluateFxData(input));
  addPrecondition(evaluation, evaluateSettlementDates(input));
  addPrecondition(evaluation, evaluateHandoffFingerprint(input));
  addPrecondition(evaluation, evaluateDuplicateConflict(input));
  addPrecondition(evaluation, evaluatePartialFill(input));

  return evaluation;
}

function addPrecondition(
  evaluation: BuilderEvaluation,
  result: FinalizationCandidateBuilderPreconditionResult,
) {
  evaluation.preconditionResults.push(result);

  if (result.warning) {
    addUnique(evaluation.warnings, result.warning);
  }

  if (result.rejectionReason) {
    addUnique(evaluation.rejectionReasons, result.rejectionReason);
  }

  if (result.status === "review_required") {
    addUnique(evaluation.warnings, "manual_review_required");
    addUnique(evaluation.candidateWarnings, "manual_review_required");
    addUnique(evaluation.candidateReviewFlags, "manual_review_required");
  }
}

function evaluateMatchingResult(
  input: FinalizationCandidateBuilderInput,
): FinalizationCandidateBuilderPreconditionResult {
  const matchingResult = input.finalSettlementNoteMatchingResult;

  if (
    matchingResult.status === "matched" &&
    (matchingResult.confidence === "exact_match" ||
      matchingResult.confidence === "strong_match") &&
    matchingResult.matched
  ) {
    return pass(
      "matching_result_exact_or_strong_enough_or_reviewable",
      "Final settlement note matching result is exact or strong.",
    );
  }

  if (
    matchingResult.status === "needs_review" ||
    matchingResult.confidence === "partial_match" ||
    matchingResult.confidence === "ambiguous_match" ||
    matchingResult.confidence === "needs_review"
  ) {
    return review(
      "matching_result_exact_or_strong_enough_or_reviewable",
      "matching_result_not_acceptable",
      "manual_review_required",
      "Final settlement note matching result is reviewable only.",
    );
  }

  if (
    matchingResult.status === "duplicate_candidates" ||
    matchingResult.confidence === "duplicate_candidates"
  ) {
    return review(
      "matching_result_exact_or_strong_enough_or_reviewable",
      "duplicate_candidate_conflict",
      "manual_review_required",
      "Final settlement note matching result has duplicate candidates.",
    );
  }

  return block(
    "matching_result_exact_or_strong_enough_or_reviewable",
    "matching_result_not_acceptable",
    "Final settlement note matching result is not acceptable for candidate building.",
  );
}

function evaluateFinalNoteSourceIdentity(
  input: FinalizationCandidateBuilderInput,
): FinalizationCandidateBuilderPreconditionResult {
  const finalNote = input.finalSettlementNoteEvidence;
  const provenance = finalNote.provenance;
  const hasIdentity = Boolean(
    finalNote.noteReferenceNumber ||
      provenance.sourceReferenceLabel ||
      provenance.evidenceFingerprint,
  );

  if (hasIdentity) {
    return pass(
      "final_note_source_identity_present",
      "Final note source identity is present.",
    );
  }

  return block(
    "final_note_source_identity_present",
    "missing_final_note_source",
    "Final settlement note source identity is missing.",
  );
}

function evaluateProvenance(
  input: FinalizationCandidateBuilderInput,
): FinalizationCandidateBuilderPreconditionResult {
  const provenance = input.finalSettlementNoteEvidence.provenance;
  const hasProvenance = Boolean(
    provenance.sourcePageIdentity &&
      (provenance.evidenceFingerprint ||
        provenance.captureId ||
        provenance.requestId ||
        provenance.sourceReferenceLabel),
  );

  if (hasProvenance) {
    return pass("provenance_present", "Final note provenance is present.");
  }

  return block(
    "provenance_present",
    "missing_provenance",
    "Final settlement note provenance is incomplete.",
  );
}

function evaluateBrokerSourceCompatibility(
  input: FinalizationCandidateBuilderInput,
): FinalizationCandidateBuilderPreconditionResult {
  const sourceClassification =
    input.finalSettlementNoteEvidence.provenance.sourceClassification;

  if (
    input.finalSettlementNoteEvidence.broker !== "avanza" ||
    input.brokerExecutionResultCandidate.broker !== "avanza"
  ) {
    return unsupported(
      "broker_source_compatible",
      "unsupported_broker",
      "Only Avanza final settlement note candidates are supported.",
    );
  }

  if (!SUPPORTED_SOURCE_CLASSIFICATIONS.has(sourceClassification)) {
    return unsupported(
      "broker_source_compatible",
      "unsupported_source",
      `Final note source classification ${sourceClassification} is unsupported for finalization candidate building.`,
    );
  }

  return pass(
    "broker_source_compatible",
    "Broker and source classification are compatible.",
  );
}

function evaluateSimpleCompatibility(
  input: FinalizationCandidateBuilderInput,
  field: "side" | "instrument" | "date",
): FinalizationCandidateBuilderPreconditionResult {
  const config = {
    side: {
      precondition: "side_compatible",
      gate: "same_side",
      mismatchReason: "side_mismatch",
      rejectionReason: "side_mismatch",
      detail: "Side is compatible.",
      blockedDetail: "Side mismatch blocks candidate building.",
    },
    instrument: {
      precondition: "instrument_compatible",
      gate: "compatible_instrument_identity",
      mismatchReason: "instrument_mismatch",
      rejectionReason: "instrument_mismatch",
      detail: "Instrument identity is compatible.",
      blockedDetail: "Instrument mismatch blocks candidate building.",
    },
    date: {
      precondition: "date_compatible",
      gate: "compatible_trade_or_business_date",
      mismatchReason: "date_mismatch",
      rejectionReason: "date_mismatch",
      detail: "Trade and business dates are compatible.",
      blockedDetail: "Date mismatch blocks candidate building.",
    },
  }[field];
  const matchingResult = input.finalSettlementNoteMatchingResult;
  const gateBlocked = matchingResult.hardGateResults.some(
    (result) => result.gate === config.gate && result.blocked,
  );
  const mismatched = matchingResult.mismatchReasons.some(
    (reason) => reason === config.mismatchReason,
  );

  if (gateBlocked || mismatched) {
    return block(
      config.precondition as FinalizationCandidateBuilderPrecondition,
      config.rejectionReason as FinalizationCandidateBuilderRejectionReason,
      config.blockedDetail,
    );
  }

  return pass(
    config.precondition as FinalizationCandidateBuilderPrecondition,
    config.detail,
  );
}

function evaluateQuantityCompatibility(
  input: FinalizationCandidateBuilderInput,
): FinalizationCandidateBuilderPreconditionResult {
  const matchingResult = input.finalSettlementNoteMatchingResult;
  const quantityGateBlocked = matchingResult.hardGateResults.some(
    (result) =>
      result.gate === "compatible_quantity_or_explicit_partial_fill_model" &&
      result.blocked,
  );
  const quantityMismatch =
    matchingResult.mismatchReasons.includes("quantity_mismatch");
  const partialFillReview = isPartialFillReview(input);

  if (partialFillReview) {
    return review(
      "quantity_compatible",
      "partial_fill_ambiguous",
      "manual_review_required",
      "Quantity requires partial-fill review.",
    );
  }

  if (quantityGateBlocked || quantityMismatch) {
    return block(
      "quantity_compatible",
      "quantity_mismatch",
      "Quantity mismatch blocks candidate building.",
    );
  }

  return pass("quantity_compatible", "Quantity is compatible.");
}

function evaluateFeeData(
  input: FinalizationCandidateBuilderInput,
): FinalizationCandidateBuilderPreconditionResult {
  const finalNote = input.finalSettlementNoteEvidence;
  const missingFee =
    !finalNote.commission || finalNote.missingFields.includes("commission");

  if (missingFee) {
    return review(
      "fee_or_commission_present_or_flagged",
      "missing_fee_data",
      "fee_data_missing_review_required",
      "Commission/fee data is missing and requires review.",
    );
  }

  return pass(
    "fee_or_commission_present_or_flagged",
    "Commission/fee data is present.",
  );
}

function evaluateFxData(
  input: FinalizationCandidateBuilderInput,
): FinalizationCandidateBuilderPreconditionResult {
  const fxSummary = buildFxInputSummary(input);

  if (fxSummary.fxRatesMissing) {
    return review(
      "fx_data_present_if_needed_or_flagged",
      "missing_fx_data",
      "fx_data_missing_review_required",
      "FX data is required but missing and requires review.",
    );
  }

  return pass(
    "fx_data_present_if_needed_or_flagged",
    fxSummary.fxRequired
      ? "FX data is present."
      : "FX data is not required for SEK-only settlement.",
  );
}

function evaluateSettlementDates(
  input: FinalizationCandidateBuilderInput,
): FinalizationCandidateBuilderPreconditionResult {
  const finalNote = input.finalSettlementNoteEvidence;
  const missingDate =
    !finalNote.businessDate || !finalNote.settlementDate || !finalNote.printDate;

  if (missingDate) {
    return review(
      "settlement_dates_present_or_flagged",
      null,
      "settlement_date_missing_review_required",
      "One or more settlement dates are missing and require review.",
    );
  }

  return pass(
    "settlement_dates_present_or_flagged",
    "Business, settlement, and print dates are present.",
  );
}

function evaluateHandoffFingerprint(
  input: FinalizationCandidateBuilderInput,
): FinalizationCandidateBuilderPreconditionResult {
  if (getHandoffPayloadFingerprint(input)) {
    return pass(
      "handoff_fingerprint_present",
      "Handoff payload fingerprint is present.",
    );
  }

  return block(
    "handoff_fingerprint_present",
    "missing_handoff_fingerprint",
    "Handoff payload fingerprint is missing.",
  );
}

function evaluateDuplicateConflict(
  input: FinalizationCandidateBuilderInput,
): FinalizationCandidateBuilderPreconditionResult {
  const matchingResult = input.finalSettlementNoteMatchingResult;
  const duplicateConflict =
    matchingResult.status === "duplicate_candidates" ||
    matchingResult.confidence === "duplicate_candidates" ||
    matchingResult.duplicateReasons.length > 0 ||
    input.metadata?.duplicate_candidate_conflict === true;

  if (duplicateConflict) {
    return review(
      "no_duplicate_candidate_conflict",
      "duplicate_candidate_conflict",
      "manual_review_required",
      "Duplicate candidate conflict requires review.",
    );
  }

  return pass(
    "no_duplicate_candidate_conflict",
    "No duplicate candidate conflict is present.",
  );
}

function evaluatePartialFill(
  input: FinalizationCandidateBuilderInput,
): FinalizationCandidateBuilderPreconditionResult {
  if (isPartialFillReview(input)) {
    return review(
      "partial_fill_ambiguity_resolved_or_review_only",
      "partial_fill_ambiguous",
      "manual_review_required",
      "Partial-fill ambiguity is review-only.",
    );
  }

  return pass(
    "partial_fill_ambiguity_resolved_or_review_only",
    "Partial-fill ambiguity is not present.",
  );
}

function pass(
  precondition: FinalizationCandidateBuilderPrecondition,
  details: string,
): FinalizationCandidateBuilderPreconditionResult {
  return {
    precondition,
    status: "passed",
    satisfied: true,
    rejectionReason: null,
    warning: null,
    details,
  };
}

function review(
  precondition: FinalizationCandidateBuilderPrecondition,
  rejectionReason: FinalizationCandidateBuilderRejectionReason | null,
  warning: FinalizationCandidateBuilderWarning,
  details: string,
): FinalizationCandidateBuilderPreconditionResult {
  return {
    precondition,
    status: "review_required",
    satisfied: false,
    rejectionReason,
    warning,
    details,
  };
}

function block(
  precondition: FinalizationCandidateBuilderPrecondition,
  rejectionReason: FinalizationCandidateBuilderRejectionReason,
  details: string,
): FinalizationCandidateBuilderPreconditionResult {
  return {
    precondition,
    status: "blocked",
    satisfied: false,
    rejectionReason,
    warning: null,
    details,
  };
}

function unsupported(
  precondition: FinalizationCandidateBuilderPrecondition,
  rejectionReason: FinalizationCandidateBuilderRejectionReason,
  details: string,
): FinalizationCandidateBuilderPreconditionResult {
  return {
    precondition,
    status: "unsupported",
    satisfied: false,
    rejectionReason,
    warning: null,
    details,
  };
}

function deriveBuilderStatus(
  input: FinalizationCandidateBuilderInput,
  preconditionResults: FinalizationCandidateBuilderPreconditionResult[],
): FinalizationCandidateBuilderStatus {
  if (preconditionResults.some((result) => result.status === "unsupported")) {
    return "unsupported";
  }

  if (preconditionResults.some((result) => result.status === "blocked")) {
    return "blocked";
  }

  if (hasDuplicateConflict(input)) {
    return "duplicate_review";
  }

  if (isPartialFillReview(input)) {
    return "partial_fill_review";
  }

  if (
    preconditionResults.some((result) => result.status === "review_required")
  ) {
    return "needs_review";
  }

  return "candidate_built";
}

function mapBuilderStatusToCandidateStatus(
  status: FinalizationCandidateBuilderStatus,
): FinalizationCandidateStatus | null {
  switch (status) {
    case "candidate_built":
      return "candidate_ready";
    case "needs_review":
      return "needs_review";
    case "partial_fill_review":
      return "partial_fill_review";
    case "duplicate_review":
      return "duplicate_review";
    case "blocked":
    case "unsupported":
      return null;
  }
}

function buildCandidate(
  input: FinalizationCandidateBuilderInput,
  options: {
    evaluatedAt: string;
    status: FinalizationCandidateStatus;
    settlementMissingFields: string[];
    feeReviewRequired: boolean;
    fxReviewRequired: boolean;
    pnlDeltaEstimated: boolean;
    reviewFlags: CandidateReviewFlag[];
    warnings: CandidateWarning[];
    rejectionReasons: FinalizationCandidateRejectionReason[];
  },
): FinalizationCandidate {
  const finalNote = input.finalSettlementNoteEvidence;
  const matchingResult = input.finalSettlementNoteMatchingResult;
  const brokerCandidate = input.brokerExecutionResultCandidate;
  const handoffPayloadFingerprint = getHandoffPayloadFingerprint(input);
  const candidateReviewFlags = [...options.reviewFlags];
  const candidateWarnings = [...options.warnings];
  const candidateRejectionReasons = [...options.rejectionReasons];

  if (matchingResult.status !== "matched") {
    addUnique(candidateReviewFlags, "match_not_exact");
  }

  if (options.feeReviewRequired) {
    addUnique(candidateReviewFlags, "missing_fee_or_total");
  }

  if (options.fxReviewRequired) {
    addUnique(candidateReviewFlags, "missing_fx_rate");
  }

  if (options.pnlDeltaEstimated) {
    addUnique(candidateReviewFlags, "pnl_adjustment_preview_only");
  }

  if (input.executionRecordCandidate) {
    addUnique(
      candidateReviewFlags,
      "execution_record_metadata_present_but_not_authorized",
    );
  }

  return {
    contractVersion: FINALIZATION_CANDIDATE_CONTRACT_VERSION,
    candidateId: buildCandidateId(input),
    createdAt: options.evaluatedAt,
    status: options.status,
    sourceReferences: {
      source: "final_settlement_note_match",
      provisionalImmediateReadbackEvidence:
        input.provisionalImmediateReadbackEvidence,
      finalSettlementNoteEvidence: finalNote,
      finalSettlementNoteMatchingResult: matchingResult,
      brokerExecutionResultCandidate: brokerCandidate,
      executionRecordCandidate: input.executionRecordCandidate ?? null,
      handoffPayloadFingerprint,
      provisionalTradeId:
        input.provisionalTradeContext?.provisionalTradeId ?? null,
      liveTradeId: input.liveTradeContext?.liveTradeId ?? null,
      positionId:
        input.liveTradeContext?.positionId ??
        input.provisionalTradeContext?.positionId ??
        null,
      recommendationId:
        input.liveTradeContext?.recommendationId ??
        input.provisionalTradeContext?.recommendationId ??
        null,
      accountContext: input.accountContext ?? finalNote.accountContext ?? null,
      metadata: input.metadata,
    },
    evidenceSummary: {
      broker: "avanza",
      sourceClassification: finalNote.provenance.sourceClassification,
      provisionalEvidenceFingerprint:
        input.provisionalImmediateReadbackEvidence.provenance
          .evidenceFingerprint ?? null,
      finalNoteEvidenceFingerprint:
        finalNote.provenance.evidenceFingerprint ?? null,
      handoffPayloadFingerprint,
      noteReferenceNumber: finalNote.noteReferenceNumber ?? null,
      sourceReference: finalNote.provenance,
      accountContext: input.accountContext ?? finalNote.accountContext ?? null,
      missingFields: options.settlementMissingFields,
      reviewFlags: candidateReviewFlags,
      rawSensitiveDataStored: false,
    },
    matchSummary: {
      status: matchingResult.status,
      confidence: matchingResult.confidence,
      matched: matchingResult.matched,
      lifecycleTransitionSuggestion:
        matchingResult.lifecycleTransitionSuggestion,
      hardGateBlockedCount: matchingResult.hardGateResults.filter(
        (result) => result.blocked,
      ).length,
      softSignalReviewCount: matchingResult.softSignalResults.filter(
        (result) => result.requiresReview,
      ).length,
      mismatchReasons: matchingResult.mismatchReasons,
      duplicateReasons: matchingResult.duplicateReasons,
      reviewFlags: candidateReviewFlags,
      warnings: candidateWarnings,
    },
    settlementSummary: {
      broker: "avanza",
      instrument: {
        instrumentName: finalNote.instrument.instrumentName,
        ticker: finalNote.instrument.ticker ?? brokerCandidate.instrument.ticker,
        isin: finalNote.isin ?? finalNote.instrument.isin ?? null,
        instrumentId: finalNote.instrument.instrumentId ?? null,
        market: finalNote.instrument.market ?? null,
        venue: finalNote.instrument.venue ?? finalNote.marketOrVenue ?? null,
      },
      side: finalNote.side,
      quantity: finalNote.quantity,
      executionPrice: finalNote.executionPrice ?? null,
      currency: finalNote.currency ?? null,
      businessDate: finalNote.businessDate ?? null,
      settlementDate: finalNote.settlementDate ?? null,
      executionTimestamp: finalNote.executionTime ?? null,
      orderType: finalNote.orderType ?? null,
      noteReferenceNumber: finalNote.noteReferenceNumber ?? null,
      consideration: finalNote.consideration ?? null,
      totalAmount: finalNote.totalAmount ?? null,
      provenance: finalNote.provenance,
    },
    feeSummary: {
      commission: finalNote.commission ?? null,
      fees: finalNote.commission ? [finalNote.commission] : [],
      feeCurrency:
        finalNote.commission?.currency ?? finalNote.currency ?? null,
      totalFees: finalNote.commission ?? null,
      missingFeeData: options.feeReviewRequired,
      reviewRequired: options.feeReviewRequired,
    },
    fxSummary: {
      baseCurrency:
        finalNote.executionPrice?.currency ??
        finalNote.consideration?.currency ??
        finalNote.currency ??
        null,
      settlementCurrency: finalNote.currency ?? null,
      accountCurrency:
        input.existingStatsSummary?.currentRealizedPnL?.currency ??
        finalNote.currency ??
        null,
      fxRates: (finalNote.fxRates ?? []).map((rate) => ({
        fromCurrency: rate.fromCurrency,
        toCurrency: rate.toCurrency,
        rate: rate.rate,
        sourceReference: rate.rawLabel ?? null,
      })),
      missingFxData: options.fxReviewRequired,
      reviewRequired: options.fxReviewRequired,
    },
    pnlAdjustmentSummary: {
      status: options.pnlDeltaEstimated ? "preview_only" : "not_calculated",
      previewOnly: true,
      realizedPnL: input.existingStatsSummary?.currentRealizedPnL ?? null,
      feeAdjustment: finalNote.commission ?? null,
      fxAdjustment: null,
      cashImpact: finalNote.totalAmount ?? finalNote.consideration ?? null,
      statsUpdateAttempted: false,
      tradeMutationAttempted: false,
      notes: "Preview only; no stats or trade mutation attempted.",
    },
    executionRecordMetadata: input.executionRecordCandidate
      ? {
          executionRecordCandidate: input.executionRecordCandidate,
          recordFingerprint: input.executionRecordCandidate.recordFingerprint,
          idempotencyKey: input.executionRecordCandidate.idempotencyKey,
          sourceEvidenceFingerprint:
            input.executionRecordCandidate.sourceEvidenceFingerprint,
          brokerResultFingerprint:
            input.executionRecordCandidate.brokerResultFingerprint ?? null,
          safeToCreateExecutionRecord: false,
          executionRecordCreated: false,
          persistenceAttempted: false,
        }
      : null,
    partialFillStatus: deriveCandidatePartialFillStatus(input),
    reviewFlags: candidateReviewFlags,
    warnings: candidateWarnings,
    rejectionReasons: candidateRejectionReasons,
    safetyPolicy: CANDIDATE_SAFETY_POLICY,
    safeToFinalize: false,
    safeToPersist: false,
    safeToMutateTrade: false,
    safeToUpdateStats: false,
    safeToCreateExecutionRecord: false,
    finalizationAttempted: false,
    persistenceAttempted: false,
    executionRecordCreationAttempted: false,
    statsUpdateAttempted: false,
    tradeMutationAttempted: false,
    auditAppendAttempted: false,
    browserAutomationAttempted: false,
    avanzaAutomationAttempted: false,
    metadata: {
      finalizationCandidateBuilderPure: true,
      candidateOnly: true,
      finalizationApproval: false,
      persistenceApproval: false,
      executionRecordCreationApproval: false,
      statsUpdateApproval: false,
      tradeMutationApproval: false,
    },
  };
}

function buildCandidateId(input: FinalizationCandidateBuilderInput): string {
  const finalNote = input.finalSettlementNoteEvidence;
  const hashInput = [
    FINALIZATION_CANDIDATE_CONTRACT_VERSION,
    finalNote.noteReferenceNumber,
    finalNote.provenance.evidenceFingerprint,
    getHandoffPayloadFingerprint(input),
    input.brokerExecutionResultCandidate.fingerprintInput
      .candidateFingerprintDraft,
    input.brokerExecutionResultCandidate.fingerprintInput
      .brokerReferenceFingerprintInput,
  ]
    .filter((value): value is string => Boolean(value))
    .join("|");
  const digest = buildStableHexDigest(hashInput);

  return `finalization_candidate_${digest}`;
}

function buildStableHexDigest(value: string): string {
  let first = 0x811c9dc5;
  let second = 0x01000193;

  for (let index = 0; index < value.length; index += 1) {
    const charCode = value.charCodeAt(index);
    first ^= charCode;
    first = Math.imul(first, 0x01000193);
    second ^= charCode + index;
    second = Math.imul(second, 0x811c9dc5);
  }

  return `${(first >>> 0).toString(16).padStart(8, "0")}${(second >>> 0)
    .toString(16)
    .padStart(8, "0")}`;
}

function getHandoffPayloadFingerprint(
  input: FinalizationCandidateBuilderInput,
): string | null {
  return (
    input.handoffPayloadFingerprint ??
    input.finalSettlementNoteEvidence.provenance.handoffPayloadFingerprint ??
    input.provisionalImmediateReadbackEvidence.handoffPayloadFingerprint ??
    input.brokerExecutionResultCandidate.handoffPayloadFingerprint ??
    input.brokerExecutionResultCandidate.fingerprintInput
      .handoffPayloadFingerprint ??
    null
  );
}

function hasDuplicateConflict(
  input: FinalizationCandidateBuilderInput,
): boolean {
  const matchingResult = input.finalSettlementNoteMatchingResult;

  return (
    matchingResult.status === "duplicate_candidates" ||
    matchingResult.confidence === "duplicate_candidates" ||
    matchingResult.duplicateReasons.length > 0 ||
    input.metadata?.duplicate_candidate_conflict === true
  );
}

function isPartialFillReview(input: FinalizationCandidateBuilderInput): boolean {
  const matchingResult = input.finalSettlementNoteMatchingResult;
  const partialStatus = matchingResult.partialFillMatchingStatus;

  return (
    partialStatus !== "not_partial" &&
    partialStatus !== "single_note_full_fill"
  ) || input.brokerExecutionResultCandidate.partialFill?.requiresReview === true;
}

function deriveCandidatePartialFillStatus(
  input: FinalizationCandidateBuilderInput,
): FinalizationCandidatePartialFillStatus {
  const partialStatus =
    input.finalSettlementNoteMatchingResult.partialFillMatchingStatus;

  if (partialStatus === "not_partial") {
    return "not_partial";
  }

  if (partialStatus === "single_note_full_fill") {
    return "single_note_full_fill";
  }

  if (partialStatus === "partial_fill_ambiguous") {
    return "partial_fill_ambiguous";
  }

  if (partialStatus === "multiple_notes_aggregate_requires_review") {
    return "multiple_notes_requires_review";
  }

  return "partial_fill_requires_review";
}

function addUnique<T>(values: T[], value: T): void {
  if (!values.includes(value)) {
    values.push(value);
  }
}
