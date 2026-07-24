import type { FinalizationCandidate } from "@/lib/finalization-candidate-contract";
import {
  FINALIZATION_VALIDATION_DEFAULT_POLICY_SNAPSHOT,
  FINALIZATION_VALIDATION_DEFAULT_SAFETY_POLICY,
  FINALIZATION_VALIDATOR_CONTRACT_VERSION,
  type FinalizationReadinessSummary,
  type FinalizationValidationBlockedReason,
  type FinalizationValidationGateResult,
  type FinalizationValidationHardGate,
  type FinalizationValidationPolicySnapshot,
  type FinalizationValidationResult,
  type FinalizationValidationReviewGate,
  type FinalizationValidationSafetyPolicy,
  type FinalizationValidationStatus,
  type FinalizationValidationWarning,
  type FinalizationValidatorInput,
} from "@/lib/finalization-validator-contract";
import type { BrokerEvidenceSourceReference } from "@/lib/two-stage-broker-evidence-contract";

type AuthorityFlags = {
  safeToFinalize?: boolean;
  safeToPersist?: boolean;
  safeToCreateExecutionRecord?: boolean;
  safeToUpdateStats?: boolean;
  safeToMutateTrade?: boolean;
  automaticModeAllowed?: boolean;
  finalizationAttempted?: boolean;
  persistenceAttempted?: boolean;
  executionRecordCreationAttempted?: boolean;
  statsUpdateAttempted?: boolean;
  tradeMutationAttempted?: boolean;
};

type ValidationAccumulator = {
  hardGateResults: FinalizationValidationGateResult[];
  reviewGateResults: FinalizationValidationGateResult[];
  rejectionReasons: FinalizationValidationBlockedReason[];
  reviewFlags: FinalizationValidationReviewGate[];
  warnings: FinalizationValidationWarning[];
};

const SUPPORTED_SOURCE_CLASSIFICATIONS = new Set([
  "broker_confirmed",
  "production_safe_candidate",
]);

const REVIEWABLE_CANDIDATE_STATUSES = new Set([
  "candidate_ready",
  "needs_review",
  "partial_fill_review",
  "duplicate_review",
]);

// Pure validation only. This function inspects candidate metadata and returns a
// typed diagnostic result. It does not finalize, persist, create execution
// records, update stats/PnL, mutate trades, write audit records, drive browser
// automation, interact with Avanza, or call broker APIs.
export function validateFinalizationCandidate(
  input: FinalizationValidatorInput,
): FinalizationValidationResult {
  const evaluatedAt = input.requestedAt;
  const candidate = input.candidate ?? input.builderResult?.candidate ?? null;
  const safetyPolicy = buildSafetyPolicy();
  const policySnapshot = buildPolicySnapshot(input, evaluatedAt, safetyPolicy);
  const accumulator: ValidationAccumulator = {
    hardGateResults: [],
    reviewGateResults: [],
    rejectionReasons: [],
    reviewFlags: [],
    warnings: [
      "ready_for_review_not_finalization",
      "candidate_not_write_authority",
    ],
  };

  evaluateHardGates(candidate, accumulator);
  evaluateReviewGates(candidate, input, accumulator);

  const status = deriveStatus(candidate, accumulator);
  const readinessSummary = buildReadinessSummary(candidate, status, accumulator);

  return {
    contractVersion: FINALIZATION_VALIDATOR_CONTRACT_VERSION,
    evaluatedAt,
    status,
    candidate,
    builderResult: input.builderResult ?? null,
    validationGates: [
      ...accumulator.hardGateResults,
      ...accumulator.reviewGateResults,
    ],
    hardGateResults: accumulator.hardGateResults,
    reviewGateResults: accumulator.reviewGateResults,
    rejectionReasons: accumulator.rejectionReasons,
    reviewFlags: accumulator.reviewFlags,
    warnings: accumulator.warnings,
    policySnapshot,
    safetyPolicy,
    readinessSummary,
    manualReviewContext: input.manualReviewContext ?? null,
    safeToFinalize: false,
    safeToPersist: false,
    safeToCreateExecutionRecord: false,
    safeToUpdateStats: false,
    safeToMutateTrade: false,
    validatorImplementationEnabled: false,
    finalizationAttempted: false,
    persistenceAttempted: false,
    executionRecordCreationAttempted: false,
    statsUpdateAttempted: false,
    tradeMutationAttempted: false,
    auditAppendAttempted: false,
    browserAutomationAttempted: false,
    avanzaAutomationAttempted: false,
    brokerAutomationAttempted: false,
    metadata: {
      ...(input.metadata ?? {}),
      finalizationValidatorPure: true,
      validationOnly: true,
      finalizationApproval: false,
      persistenceApproval: false,
      executionRecordCreationApproval: false,
      statsUpdateApproval: false,
      tradeMutationApproval: false,
    },
  };
}

function evaluateHardGates(
  candidate: FinalizationCandidate | null,
  accumulator: ValidationAccumulator,
) {
  if (!candidate) {
    addHardGate(
      accumulator,
      blockHardGate(
        "candidate_exists",
        "candidate_missing",
        "Finalization candidate is missing.",
      ),
    );
    addNotReadyHardGates(accumulator);
    return;
  }

  addHardGate(
    accumulator,
    passHardGate("candidate_exists", "Finalization candidate is present."),
  );

  addHardGate(accumulator, evaluateCandidateStatus(candidate));
  addHardGate(accumulator, evaluateEvidenceSummary(candidate));
  addHardGate(accumulator, evaluateMatchSummary(candidate));
  addHardGate(accumulator, evaluateSettlementSummary(candidate));
  addHardGate(accumulator, evaluateNoteReference(candidate));
  addHardGate(accumulator, evaluateProvenance(candidate));
  addHardGate(accumulator, evaluateDuplicateConflict(candidate));
  addHardGate(accumulator, evaluateBlockingMismatch(candidate));
  addHardGate(accumulator, evaluateBrokerSourceSupport(candidate));
  addHardGate(accumulator, evaluateHandoffFingerprint(candidate));
  addHardGate(accumulator, evaluateSafetyPolicy(candidate));
}

function addNotReadyHardGates(accumulator: ValidationAccumulator) {
  const gates: FinalizationValidationHardGate[] = [
    "candidate_status_acceptable",
    "source_evidence_summary_present",
    "match_summary_present",
    "settlement_summary_present",
    "note_reference_present",
    "provenance_present",
    "no_duplicate_conflict",
    "no_blocking_mismatch",
    "broker_source_supported",
    "handoff_fingerprint_present",
    "safety_policy_present_and_conservative",
  ];

  for (const gate of gates) {
    addHardGate(
      accumulator,
      notReadyHardGate(gate, "Candidate is required before this gate can pass."),
    );
  }
}

function evaluateCandidateStatus(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  if (candidate.status === "blocked") {
    return blockHardGate(
      "candidate_status_acceptable",
      "candidate_blocked",
      "Candidate status is blocked.",
      candidate.status,
    );
  }

  if (candidate.status === "unsupported") {
    return unsupportedHardGate(
      "candidate_status_acceptable",
      "unsupported_source",
      "Candidate status is unsupported.",
      candidate.status,
    );
  }

  if (REVIEWABLE_CANDIDATE_STATUSES.has(candidate.status)) {
    return passHardGate(
      "candidate_status_acceptable",
      "Candidate status is acceptable or reviewable.",
      candidate.status,
    );
  }

  return notReadyHardGate(
    "candidate_status_acceptable",
    "Candidate status is not ready for validation.",
    candidate.status,
  );
}

function evaluateEvidenceSummary(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  if (candidate.evidenceSummary?.broker && candidate.evidenceSummary.broker === "avanza") {
    return passHardGate(
      "source_evidence_summary_present",
      "Source evidence summary is present.",
      candidate.status,
    );
  }

  return notReadyHardGate(
    "source_evidence_summary_present",
    "Source evidence summary is missing.",
    candidate.status,
  );
}

function evaluateMatchSummary(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  if (candidate.matchSummary) {
    return passHardGate(
      "match_summary_present",
      "Match summary is present.",
      candidate.status,
    );
  }

  return notReadyHardGate(
    "match_summary_present",
    "Match summary is missing.",
    candidate.status,
  );
}

function evaluateSettlementSummary(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  const settlement = candidate.settlementSummary;
  const hasSettlement = Boolean(
    settlement?.broker &&
      settlement.instrument?.instrumentName &&
      settlement.side &&
      Number.isFinite(settlement.quantity),
  );

  if (hasSettlement) {
    return passHardGate(
      "settlement_summary_present",
      "Settlement summary is present.",
      candidate.status,
    );
  }

  return notReadyHardGate(
    "settlement_summary_present",
    "Settlement summary is missing or incomplete.",
    candidate.status,
  );
}

function evaluateNoteReference(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  const hasReference = Boolean(
    candidate.evidenceSummary.noteReferenceNumber ||
      candidate.settlementSummary.noteReferenceNumber ||
      candidate.sourceReferences.finalSettlementNoteEvidence
        ?.noteReferenceNumber ||
      candidate.evidenceSummary.sourceReference?.sourceReferenceLabel,
  );

  if (hasReference) {
    return passHardGate(
      "note_reference_present",
      "Final note reference is present.",
      candidate.status,
    );
  }

  return blockHardGate(
    "note_reference_present",
    "missing_final_note_source",
    "Final settlement note source reference is missing.",
    candidate.status,
  );
}

function evaluateProvenance(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  const sourceReference =
    candidate.settlementSummary.provenance ??
    candidate.evidenceSummary.sourceReference ??
    candidate.sourceReferences.finalSettlementNoteEvidence?.provenance ??
    null;

  if (hasUsableProvenance(sourceReference)) {
    return passHardGate(
      "provenance_present",
      "Final note provenance is present.",
      candidate.status,
    );
  }

  return blockHardGate(
    "provenance_present",
    "missing_provenance",
    "Final note provenance is missing.",
    candidate.status,
  );
}

function evaluateDuplicateConflict(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  const hasDuplicateConflict =
    candidate.status === "duplicate_review" ||
    candidate.matchSummary.status === "duplicate_candidates" ||
    candidate.matchSummary.duplicateReasons.length > 0;

  if (hasDuplicateConflict) {
    return reviewHardGate(
      "no_duplicate_conflict",
      "duplicate_conflict",
      "Duplicate candidate conflict requires review.",
      candidate.status,
    );
  }

  return passHardGate(
    "no_duplicate_conflict",
    "No duplicate conflict is present.",
    candidate.status,
  );
}

function evaluateBlockingMismatch(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  const blockingMismatch =
    candidate.matchSummary.status === "mismatch" ||
    candidate.matchSummary.confidence === "mismatch" ||
    candidate.matchSummary.mismatchReasons.some(
      (reason) => reason !== "partial_fill_ambiguous",
    );

  if (blockingMismatch) {
    return blockHardGate(
      "no_blocking_mismatch",
      "unacceptable_match",
      "Blocking match mismatch is present.",
      candidate.status,
    );
  }

  return passHardGate(
    "no_blocking_mismatch",
    "No blocking mismatch is present.",
    candidate.status,
  );
}

function evaluateBrokerSourceSupport(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  if (
    candidate.evidenceSummary.broker !== "avanza" ||
    candidate.settlementSummary.broker !== "avanza"
  ) {
    return unsupportedHardGate(
      "broker_source_supported",
      "unsupported_broker",
      "Only Avanza finalization candidates are supported.",
      candidate.status,
    );
  }

  const sourceClassification =
    candidate.evidenceSummary.sourceClassification ??
    candidate.evidenceSummary.sourceReference?.sourceClassification ??
    candidate.settlementSummary.provenance?.sourceClassification ??
    null;

  if (
    sourceClassification &&
    sourceClassification !== "dev_fixture" &&
    !SUPPORTED_SOURCE_CLASSIFICATIONS.has(sourceClassification)
  ) {
    return unsupportedHardGate(
      "broker_source_supported",
      "unsupported_source",
      `Source classification ${sourceClassification} is unsupported.`,
      candidate.status,
    );
  }

  return passHardGate(
    "broker_source_supported",
    "Broker and source are supported.",
    candidate.status,
  );
}

function evaluateHandoffFingerprint(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  const hasFingerprint = Boolean(
    candidate.evidenceSummary.handoffPayloadFingerprint ||
      candidate.sourceReferences.handoffPayloadFingerprint,
  );

  if (hasFingerprint) {
    return passHardGate(
      "handoff_fingerprint_present",
      "Handoff fingerprint is present.",
      candidate.status,
    );
  }

  return notReadyHardGate(
    "handoff_fingerprint_present",
    "Handoff fingerprint is missing.",
    candidate.status,
  );
}

function evaluateSafetyPolicy(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  const candidateFlags: AuthorityFlags = candidate;
  const safetyPolicyFlags: AuthorityFlags = candidate.safetyPolicy;

  if (!candidate.safetyPolicy) {
    return blockHardGate(
      "safety_policy_present_and_conservative",
      "safety_policy_missing",
      "Candidate safety policy is missing.",
      candidate.status,
    );
  }

  if (safetyPolicyFlags.automaticModeAllowed === true) {
    return blockHardGate(
      "safety_policy_present_and_conservative",
      "automatic_mode_not_allowed",
      "Automatic mode is not allowed for finalization validation.",
      candidate.status,
    );
  }

  if (candidateFlags.executionRecordCreationAttempted === true) {
    return blockHardGate(
      "safety_policy_present_and_conservative",
      "execution_record_coupling_detected",
      "Execution-record creation coupling was detected.",
      candidate.status,
    );
  }

  if (candidateFlags.persistenceAttempted === true) {
    return blockHardGate(
      "safety_policy_present_and_conservative",
      "persistence_coupling_detected",
      "Persistence coupling was detected.",
      candidate.status,
    );
  }

  if (candidateFlags.tradeMutationAttempted === true) {
    return blockHardGate(
      "safety_policy_present_and_conservative",
      "trade_mutation_coupling_detected",
      "Trade mutation coupling was detected.",
      candidate.status,
    );
  }

  if (candidateFlags.statsUpdateAttempted === true) {
    return blockHardGate(
      "safety_policy_present_and_conservative",
      "stats_update_coupling_detected",
      "Stats/PnL update coupling was detected.",
      candidate.status,
    );
  }

  if (
    hasUnexpectedAuthority(candidateFlags) ||
    hasUnexpectedAuthority(safetyPolicyFlags) ||
    hasUnexpectedAuthority(candidate.executionRecordMetadata ?? null) ||
    hasUnexpectedAuthority(candidate.pnlAdjustmentSummary)
  ) {
    return blockHardGate(
      "safety_policy_present_and_conservative",
      "authority_flag_unexpectedly_true",
      "Candidate contains unexpected write or mutation authority.",
      candidate.status,
    );
  }

  return passHardGate(
    "safety_policy_present_and_conservative",
    "Safety policy is present and conservative.",
    candidate.status,
  );
}

function evaluateReviewGates(
  candidate: FinalizationCandidate | null,
  input: FinalizationValidatorInput,
  accumulator: ValidationAccumulator,
) {
  if (!candidate) {
    return;
  }

  addReviewGate(accumulator, evaluatePartialFillReview(candidate));
  addReviewGate(accumulator, evaluateMissingFeeFxData(candidate));
  addReviewGate(accumulator, evaluatePnLAdjustmentUncertainty(candidate));
  addReviewGate(accumulator, evaluateSettlementDateUncertainty(candidate));
  addReviewGate(accumulator, evaluateAccountCategoryAmbiguity(candidate));
  addReviewGate(accumulator, evaluateManualReviewRequired(candidate));
  addReviewGate(accumulator, evaluatePolicyMismatch(candidate, input));
  addReviewGate(accumulator, evaluateFixtureDevSource(candidate));
  addReviewGate(accumulator, evaluateUnsupportedInspectableSource(candidate));
}

function evaluatePartialFillReview(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  const requiresReview =
    candidate.status === "partial_fill_review" ||
    candidate.partialFillStatus !== "not_partial";

  return requiresReview
    ? reviewGate(
        "partial_fill_review",
        "manual_review_required",
        "Partial-fill conditions require review.",
        candidate.status,
      )
    : passReviewGate(
        "partial_fill_review",
        "No partial-fill review is required.",
        candidate.status,
      );
}

function evaluateMissingFeeFxData(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  const requiresReview =
    candidate.feeSummary.reviewRequired ||
    candidate.feeSummary.missingFeeData ||
    candidate.fxSummary.reviewRequired ||
    candidate.fxSummary.missingFxData;

  return requiresReview
    ? reviewGate(
        "missing_fee_fx_data",
        "fee_fx_review_required",
        "Missing fee or FX data requires review.",
        candidate.status,
      )
    : passReviewGate(
        "missing_fee_fx_data",
        "Fee and FX data do not require review.",
        candidate.status,
      );
}

function evaluatePnLAdjustmentUncertainty(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  const requiresReview =
    candidate.pnlAdjustmentSummary.status === "requires_review" ||
    candidate.pnlAdjustmentSummary.status === "blocked";

  return requiresReview
    ? reviewGate(
        "pnl_adjustment_uncertainty",
        "pnl_adjustment_review_required",
        "PnL adjustment uncertainty requires review.",
        candidate.status,
      )
    : passReviewGate(
        "pnl_adjustment_uncertainty",
        "PnL adjustment summary does not require review.",
        candidate.status,
      );
}

function evaluateSettlementDateUncertainty(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  const requiresReview = Boolean(
    !candidate.settlementSummary.businessDate ||
      !candidate.settlementSummary.settlementDate ||
      candidate.settlementSummary.provenance?.sourceReferenceLabel ===
        "settlement_date_uncertain",
  );

  return requiresReview
    ? reviewGate(
        "settlement_date_uncertainty",
        "settlement_date_review_required",
        "Settlement date uncertainty requires review.",
        candidate.status,
      )
    : passReviewGate(
        "settlement_date_uncertainty",
        "Settlement dates do not require review.",
        candidate.status,
      );
}

function evaluateAccountCategoryAmbiguity(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  const reviewFlags = [
    ...candidate.reviewFlags,
    ...candidate.evidenceSummary.reviewFlags,
    ...candidate.matchSummary.reviewFlags,
  ].map(String);
  const requiresReview = reviewFlags.some(
    (flag) =>
      flag === "account_context_requires_review" ||
      flag === "account_context_review" ||
      flag === "account_category_ambiguity",
  );

  return requiresReview
    ? reviewGate(
        "account_category_ambiguity",
        "manual_review_required",
        "Account or category ambiguity requires review.",
        candidate.status,
      )
    : passReviewGate(
        "account_category_ambiguity",
        "Account/category context does not require review.",
        candidate.status,
      );
}

function evaluateManualReviewRequired(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  const requiresReview =
    candidate.status === "needs_review" ||
    candidate.reviewFlags.map(String).includes("manual_review_required") ||
    candidate.warnings.map(String).includes("manual_review_required");

  return requiresReview
    ? reviewGate(
        "manual_review_required",
        "manual_review_required",
        "Candidate metadata requires manual review.",
        candidate.status,
      )
    : passReviewGate(
        "manual_review_required",
        "No explicit manual review flag is present.",
        candidate.status,
      );
}

function evaluatePolicyMismatch(
  candidate: FinalizationCandidate,
  input: FinalizationValidatorInput,
): FinalizationValidationGateResult {
  const policySnapshot = input.policySnapshot;
  const requiresReview = Boolean(
    policySnapshot &&
      (policySnapshot.allowsFinalization ||
        policySnapshot.allowsPersistence ||
        policySnapshot.allowsExecutionRecordCreation ||
        policySnapshot.allowsStatsUpdate ||
        policySnapshot.allowsTradeMutation ||
        policySnapshot.allowsAutomaticMode ||
        policySnapshot.safetyPolicy.safeToFinalize ||
        policySnapshot.safetyPolicy.safeToPersist ||
        policySnapshot.safetyPolicy.safeToCreateExecutionRecord ||
        policySnapshot.safetyPolicy.safeToUpdateStats ||
        policySnapshot.safetyPolicy.safeToMutateTrade),
  );

  return requiresReview
    ? reviewGate(
        "policy_mismatch",
        "manual_review_required",
        "Policy snapshot does not match conservative finalization validation.",
        candidate.status,
      )
    : passReviewGate(
        "policy_mismatch",
        "Policy snapshot is conservative or omitted.",
        candidate.status,
      );
}

function evaluateFixtureDevSource(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  const metadataSource =
    typeof candidate.metadata?.source === "string"
      ? candidate.metadata.source
      : null;
  const requiresReview =
    candidate.sourceReferences.source === "dev_fixture" ||
    candidate.evidenceSummary.sourceClassification === "dev_fixture" ||
    metadataSource === "finalization_candidate_dev_fixture" ||
    candidate.metadata?.fixtureOnly === true;

  return requiresReview
    ? reviewGate(
        "fixture_dev_source",
        "fixture_source_review_required",
        "Fixture or dev source requires review.",
        candidate.status,
      )
    : passReviewGate(
        "fixture_dev_source",
        "Candidate is not marked as a fixture/dev source.",
        candidate.status,
      );
}

function evaluateUnsupportedInspectableSource(
  candidate: FinalizationCandidate,
): FinalizationValidationGateResult {
  const requiresReview = candidate.status === "unsupported";

  return requiresReview
    ? reviewGate(
        "unsupported_but_inspectable_source",
        "manual_review_required",
        "Unsupported but inspectable source requires review.",
        candidate.status,
      )
    : passReviewGate(
        "unsupported_but_inspectable_source",
        "No unsupported inspectable source review is required.",
        candidate.status,
      );
}

function deriveStatus(
  candidate: FinalizationCandidate | null,
  accumulator: ValidationAccumulator,
): FinalizationValidationStatus {
  const hardStatuses = accumulator.hardGateResults.map((result) => result.status);

  if (hardStatuses.includes("unsupported")) {
    return "unsupported";
  }

  if (hardStatuses.includes("blocked")) {
    return "blocked";
  }

  if (!candidate || hardStatuses.includes("not_ready")) {
    return "not_ready";
  }

  if (
    candidate.status === "duplicate_review" ||
    accumulator.reviewFlags.includes("unsupported_but_inspectable_source") ||
    accumulator.rejectionReasons.includes("duplicate_conflict")
  ) {
    return candidate.status === "duplicate_review"
      ? "duplicate_review"
      : "unsupported";
  }

  if (
    candidate.status === "partial_fill_review" ||
    accumulator.reviewFlags.includes("partial_fill_review")
  ) {
    return "partial_fill_review";
  }

  if (accumulator.reviewGateResults.some((result) => result.status === "review_required")) {
    return "needs_review";
  }

  return "ready_for_finalization_review";
}

function buildReadinessSummary(
  candidate: FinalizationCandidate | null,
  status: FinalizationValidationStatus,
  accumulator: ValidationAccumulator,
): FinalizationReadinessSummary {
  return {
    candidatePresent: Boolean(candidate),
    candidateStatus: candidate?.status ?? null,
    validationStatus: status,
    hardGatePassedCount: accumulator.hardGateResults.filter(
      (result) => result.status === "passed",
    ).length,
    hardGateBlockedCount: accumulator.hardGateResults.filter(
      (result) =>
        result.status === "blocked" ||
        result.status === "unsupported" ||
        result.status === "not_ready",
    ).length,
    reviewGateCount: accumulator.reviewGateResults.filter(
      (result) => result.status === "review_required",
    ).length,
    warningCount: accumulator.warnings.length,
    blockedReasonCount: accumulator.rejectionReasons.length,
    manualReviewRequired:
      status !== "ready_for_finalization_review" ||
      accumulator.reviewGateResults.some(
        (result) => result.status === "review_required",
      ),
    readyForFinalizationReview: status === "ready_for_finalization_review",
    readyForFinalizationReviewIsNotFinalization: true,
    finalizationAttempted: false,
    persistenceAttempted: false,
    executionRecordCreationAttempted: false,
    statsUpdateAttempted: false,
    tradeMutationAttempted: false,
  };
}

function buildPolicySnapshot(
  input: FinalizationValidatorInput,
  evaluatedAt: string,
  safetyPolicy: FinalizationValidationSafetyPolicy,
): FinalizationValidationPolicySnapshot {
  return {
    ...(input.policySnapshot ?? FINALIZATION_VALIDATION_DEFAULT_POLICY_SNAPSHOT),
    evaluatedAt,
    allowsFinalization: false,
    allowsPersistence: false,
    allowsExecutionRecordCreation: false,
    allowsStatsUpdate: false,
    allowsTradeMutation: false,
    allowsAutomaticMode: false,
    safetyPolicy,
  };
}

function buildSafetyPolicy(): FinalizationValidationSafetyPolicy {
  return {
    ...FINALIZATION_VALIDATION_DEFAULT_SAFETY_POLICY,
    policyReason:
      "Finalization validator output is validation metadata only and does not approve or implement finalization, persistence, execution-record creation, stats/PnL updates, trade mutation, audit append, browser automation, Avanza behavior, broker behavior, or production runtime behavior.",
  };
}

function addHardGate(
  accumulator: ValidationAccumulator,
  result: FinalizationValidationGateResult,
) {
  accumulator.hardGateResults.push(result);
  collectResultSignals(accumulator, result);
}

function addReviewGate(
  accumulator: ValidationAccumulator,
  result: FinalizationValidationGateResult,
) {
  accumulator.reviewGateResults.push(result);
  collectResultSignals(accumulator, result);

  if (result.status === "review_required") {
    addUnique(accumulator.reviewFlags, result.gate as FinalizationValidationReviewGate);
  }
}

function collectResultSignals(
  accumulator: ValidationAccumulator,
  result: FinalizationValidationGateResult,
) {
  if (result.blockedReason) {
    addUnique(accumulator.rejectionReasons, result.blockedReason);
  }

  if (result.warning) {
    addUnique(accumulator.warnings, result.warning);
  }
}

function passHardGate(
  gate: FinalizationValidationHardGate,
  details: string,
  relatedCandidateStatus?: FinalizationCandidate["status"],
): FinalizationValidationGateResult {
  return {
    gate,
    gateType: "hard",
    status: "passed",
    satisfied: true,
    relatedCandidateStatus,
    details,
  };
}

function blockHardGate(
  gate: FinalizationValidationHardGate,
  blockedReason: FinalizationValidationBlockedReason,
  details: string,
  relatedCandidateStatus?: FinalizationCandidate["status"],
): FinalizationValidationGateResult {
  return {
    gate,
    gateType: "hard",
    status: "blocked",
    satisfied: false,
    blockedReason,
    relatedCandidateStatus,
    details,
  };
}

function unsupportedHardGate(
  gate: FinalizationValidationHardGate,
  blockedReason: FinalizationValidationBlockedReason,
  details: string,
  relatedCandidateStatus?: FinalizationCandidate["status"],
): FinalizationValidationGateResult {
  return {
    gate,
    gateType: "hard",
    status: "unsupported",
    satisfied: false,
    blockedReason,
    relatedCandidateStatus,
    details,
  };
}

function reviewHardGate(
  gate: FinalizationValidationHardGate,
  blockedReason: FinalizationValidationBlockedReason,
  details: string,
  relatedCandidateStatus?: FinalizationCandidate["status"],
): FinalizationValidationGateResult {
  return {
    gate,
    gateType: "hard",
    status: "review_required",
    satisfied: false,
    blockedReason,
    warning: "manual_review_required",
    relatedCandidateStatus,
    details,
  };
}

function notReadyHardGate(
  gate: FinalizationValidationHardGate,
  details: string,
  relatedCandidateStatus?: FinalizationCandidate["status"],
): FinalizationValidationGateResult {
  return {
    gate,
    gateType: "hard",
    status: "not_ready",
    satisfied: false,
    relatedCandidateStatus,
    details,
  };
}

function passReviewGate(
  gate: FinalizationValidationReviewGate,
  details: string,
  relatedCandidateStatus?: FinalizationCandidate["status"],
): FinalizationValidationGateResult {
  return {
    gate,
    gateType: "review",
    status: "passed",
    satisfied: true,
    relatedCandidateStatus,
    details,
  };
}

function reviewGate(
  gate: FinalizationValidationReviewGate,
  warning: FinalizationValidationWarning,
  details: string,
  relatedCandidateStatus?: FinalizationCandidate["status"],
): FinalizationValidationGateResult {
  return {
    gate,
    gateType: "review",
    status: "review_required",
    satisfied: false,
    warning,
    relatedCandidateStatus,
    details,
  };
}

function hasUsableProvenance(
  reference: BrokerEvidenceSourceReference | null | undefined,
) {
  return Boolean(
    reference?.sourcePageIdentity &&
      (reference.evidenceFingerprint ||
        reference.captureId ||
        reference.requestId ||
        reference.sourceReferenceLabel),
  );
}

function hasUnexpectedAuthority(value: AuthorityFlags | null | undefined) {
  return Boolean(
    value?.safeToFinalize === true ||
      value?.safeToPersist === true ||
      value?.safeToCreateExecutionRecord === true ||
      value?.safeToUpdateStats === true ||
      value?.safeToMutateTrade === true ||
      value?.automaticModeAllowed === true ||
      value?.finalizationAttempted === true ||
      value?.persistenceAttempted === true ||
      value?.executionRecordCreationAttempted === true ||
      value?.statsUpdateAttempted === true ||
      value?.tradeMutationAttempted === true,
  );
}

function addUnique<T>(items: T[], item: T) {
  if (!items.includes(item)) {
    items.push(item);
  }
}
