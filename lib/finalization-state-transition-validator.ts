import {
  FINALIZATION_STATE_TRANSITION_SOURCE_TARGET_COMPATIBILITY,
  FINALIZATION_STATE_TRANSITION_VALIDATOR_CONTRACT_VERSION,
  FINALIZATION_STATE_TRANSITION_VALIDATOR_DEFAULT_SAFETY_POLICY,
  type FinalizationStateTransitionAuditCorrectionReadiness,
  type FinalizationStateTransitionBlockedReason,
  type FinalizationStateTransitionBoundaryReadiness,
  type FinalizationStateTransitionBoundaryReadinessKey,
  type FinalizationStateTransitionDecisionRecommendation,
  type FinalizationStateTransitionPrerequisite,
  type FinalizationStateTransitionPrerequisiteResult,
  type FinalizationStateTransitionSafetyPolicy,
  type FinalizationStateTransitionSourceTargetCompatibility,
  type FinalizationStateTransitionValidationResult,
  type FinalizationStateTransitionValidationStatus,
  type FinalizationStateTransitionValidatorInput,
  type FinalizationStateTransitionWarning,
} from "@/lib/finalization-state-transition-validator-contract";
import type {
  FinalizationTransitionBoundaryStatus,
  FinalizationTransitionSourceState,
  FinalizationTransitionTargetState,
} from "@/lib/finalization-state-transition-contract";
import type { FinalizationValidationResult } from "@/lib/finalization-validator-contract";

type AuthorityCarrier = {
  safeToApplyTransition?: unknown;
  safeToTransition?: unknown;
  safeToFinalize?: unknown;
  safeToPersist?: unknown;
  safeToCreateExecutionRecord?: unknown;
  safeToUpdateStats?: unknown;
  safeToMutateTrade?: unknown;
  automaticModeAllowed?: unknown;
  transitionApplied?: unknown;
  finalizationAttempted?: unknown;
  persistenceAttempted?: unknown;
  executionRecordCreationAttempted?: unknown;
  statsUpdateAttempted?: unknown;
  tradeMutationAttempted?: unknown;
  auditAppendAttempted?: unknown;
  browserAutomationAttempted?: unknown;
  avanzaAutomationAttempted?: unknown;
  brokerAutomationAttempted?: unknown;
};

type ValidationAccumulator = {
  prerequisiteResults: FinalizationStateTransitionPrerequisiteResult[];
  blockedReasons: FinalizationStateTransitionBlockedReason[];
  warnings: FinalizationStateTransitionWarning[];
};

const FALSE_BOUNDARY_STATUS: FinalizationTransitionBoundaryStatus = {
  available: false,
  status: "missing",
  reason: "Boundary readiness metadata was not supplied.",
};

const REVIEW_VALIDATION_STATUSES = new Set([
  "needs_review",
  "partial_fill_review",
  "duplicate_review",
]);

const AUTHORITATIVE_FLAGS: Array<keyof AuthorityCarrier> = [
  "safeToApplyTransition",
  "safeToTransition",
  "safeToFinalize",
  "safeToPersist",
  "safeToCreateExecutionRecord",
  "safeToUpdateStats",
  "safeToMutateTrade",
  "automaticModeAllowed",
  "transitionApplied",
  "finalizationAttempted",
  "persistenceAttempted",
  "executionRecordCreationAttempted",
  "statsUpdateAttempted",
  "tradeMutationAttempted",
  "auditAppendAttempted",
  "browserAutomationAttempted",
  "avanzaAutomationAttempted",
  "brokerAutomationAttempted",
];

// Pure validation only. This function inspects supplied transition metadata and
// returns a typed diagnostic result. It does not apply transitions, finalize,
// persist, create execution records, update stats/PnL, mutate trades, append
// audit records, drive browser automation, interact with Avanza, or call broker
// APIs.
export function validateFinalizationStateTransition(
  input: FinalizationStateTransitionValidatorInput,
): FinalizationStateTransitionValidationResult {
  const evaluatedAt = input.requestedAt;
  const candidate = input.candidate ?? input.transitionInput?.candidate ?? null;
  const validationResult =
    input.validationResult ?? input.transitionInput?.validationResult ?? null;
  const sourceState =
    input.sourceState ?? input.transitionInput?.sourceState ?? "not_ready";
  const proposedTargetState = input.proposedTargetState;
  const safetyPolicy = buildSafetyPolicy();
  const accumulator: ValidationAccumulator = {
    prerequisiteResults: [],
    blockedReasons: [],
    warnings: ["valid_transition_candidate_not_applied"],
  };

  const sourceTargetCompatibility = evaluateSourceTargetCompatibility(
    sourceState,
    proposedTargetState,
    accumulator,
  );
  const boundaryReadinessSummary = buildBoundaryReadinessSummary(input);
  const auditCorrectionReadinessSummary =
    buildAuditCorrectionReadinessSummary(input);

  evaluatePrerequisites(
    input,
    validationResult,
    sourceTargetCompatibility,
    boundaryReadinessSummary,
    auditCorrectionReadinessSummary,
    accumulator,
  );

  const status = deriveStatus(
    sourceState,
    sourceTargetCompatibility,
    accumulator,
  );
  const decisionRecommendation = buildDecisionRecommendation(
    sourceState,
    proposedTargetState,
    sourceTargetCompatibility,
    status,
    accumulator,
  );

  return {
    contractVersion: FINALIZATION_STATE_TRANSITION_VALIDATOR_CONTRACT_VERSION,
    evaluatedAt,
    status,
    transitionInput: input.transitionInput ?? null,
    validationResult,
    candidate,
    sourceState,
    proposedTargetState,
    prerequisiteResults: accumulator.prerequisiteResults,
    blockedReasons: unique(accumulator.blockedReasons),
    warnings: unique(accumulator.warnings),
    decisionRecommendation,
    sourceTargetCompatibility,
    boundaryReadinessSummary,
    auditCorrectionReadinessSummary,
    safetyPolicy,
    approvalContext: approvalContextFor(input),
    executionRecordCandidateMetadata:
      input.executionRecordCandidateMetadata ??
      input.transitionInput?.executionRecordCandidateMetadata ??
      null,
    safeToApplyTransition: false,
    safeToFinalize: false,
    safeToPersist: false,
    safeToCreateExecutionRecord: false,
    safeToUpdateStats: false,
    safeToMutateTrade: false,
    transitionApplied: false,
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
      finalizationStateTransitionValidatorPure: true,
      validationOnly: true,
      transitionApproval: false,
      transitionApplied: false,
      finalizationApproval: false,
      persistenceApproval: false,
      executionRecordCreationApproval: false,
      statsUpdateApproval: false,
      tradeMutationApproval: false,
    },
  };
}

function evaluateSourceTargetCompatibility(
  sourceState: FinalizationTransitionSourceState,
  proposedTargetState: FinalizationTransitionTargetState,
  accumulator: ValidationAccumulator,
): FinalizationStateTransitionSourceTargetCompatibility {
  const expected = sourceTargetFor(sourceState);

  if (!expected) {
    addBlockedReason(accumulator, "unsupported_source_target_pair");

    return {
      sourceState,
      proposedTargetState,
      expectedTargetState: null,
      status: "not_ready",
      compatible: false,
      blockedReason: "unsupported_source_target_pair",
      details:
        "Source state is not ready for transition validation until finalization validation exists.",
    };
  }

  if (expected.proposedTargetState !== proposedTargetState) {
    addBlockedReason(accumulator, "unsupported_source_target_pair");

    return {
      sourceState,
      proposedTargetState,
      expectedTargetState: expected.expectedTargetState,
      status: "blocked",
      compatible: false,
      blockedReason: "unsupported_source_target_pair",
      details: "Proposed target state does not match the compatible target concept.",
    };
  }

  if (expected.warning) {
    addWarning(accumulator, expected.warning);
  }

  if (expected.blockedReason) {
    addBlockedReason(accumulator, expected.blockedReason);
  }

  return expected;
}

function sourceTargetFor(
  sourceState: FinalizationTransitionSourceState,
): FinalizationStateTransitionSourceTargetCompatibility | null {
  if (sourceState === "finalization_candidate_built") {
    return null;
  }

  return FINALIZATION_STATE_TRANSITION_SOURCE_TARGET_COMPATIBILITY[sourceState];
}

function evaluatePrerequisites(
  input: FinalizationStateTransitionValidatorInput,
  validationResult: FinalizationValidationResult | null,
  sourceTargetCompatibility: FinalizationStateTransitionSourceTargetCompatibility,
  boundaryReadinessSummary: FinalizationStateTransitionBoundaryReadiness,
  auditCorrectionReadinessSummary: FinalizationStateTransitionAuditCorrectionReadiness,
  accumulator: ValidationAccumulator,
) {
  const candidate = input.candidate ?? input.transitionInput?.candidate ?? null;

  addPrerequisite(
    accumulator,
    candidate
      ? passPrerequisite(
          "valid_finalization_candidate",
          "Finalization candidate is present.",
        )
      : blockPrerequisite(
          "valid_finalization_candidate",
          "missing_candidate",
          "Finalization candidate is missing.",
        ),
  );

  addPrerequisite(
    accumulator,
    validationResult
      ? evaluateValidationResult(input.sourceState, validationResult)
      : blockPrerequisite(
          "acceptable_finalization_validation_result",
          "missing_validation_result",
          "Finalization validation result is missing.",
        ),
  );

  addPrerequisite(
    accumulator,
    evaluateManualApproval(input, sourceTargetCompatibility),
  );
  addPrerequisite(accumulator, evaluateDuplicateConflict(validationResult));
  addPrerequisite(accumulator, evaluatePartialFillAmbiguity(validationResult));
  addPrerequisite(accumulator, evaluateUnsafeAuthorityFlags(input));
  addPrerequisite(accumulator, evaluatePnlFeeFxUncertainty(validationResult));
  addPrerequisite(
    accumulator,
    evaluateBoundaryMetadata(
      "persistence_boundary_available_only_if_future_write_requested",
      boundaryReadinessSummary,
    ),
  );
  addPrerequisite(
    accumulator,
    evaluateBoundaryMetadata(
      "execution_record_boundary_available_only_if_future_record_creation_requested",
      boundaryReadinessSummary,
    ),
  );
  addPrerequisite(
    accumulator,
    evaluateBoundaryMetadata(
      "stats_pnl_boundary_available_only_if_future_stats_update_requested",
      boundaryReadinessSummary,
    ),
  );
  addPrerequisite(
    accumulator,
    auditCorrectionReadinessSummary.ready
      ? passPrerequisite(
          "audit_correction_strategy_available",
          "Audit/correction strategy metadata is available.",
        )
      : blockPrerequisite(
          "audit_correction_strategy_available",
          "missing_audit_correction_strategy",
          "Audit/correction strategy metadata is missing or incomplete.",
        ),
  );
}

function evaluateValidationResult(
  sourceState: FinalizationTransitionSourceState,
  validationResult: FinalizationValidationResult,
): FinalizationStateTransitionPrerequisiteResult {
  if (sourceState !== "finalization_candidate_built" && validationResult.status !== sourceState) {
    return blockPrerequisite(
      "acceptable_finalization_validation_result",
      "unsupported_source_target_pair",
      "Validation result status does not match the requested source state.",
    );
  }

  if (validationResult.status === "blocked") {
    return blockPrerequisite(
      "acceptable_finalization_validation_result",
      "missing_validation_result",
      "Blocked validation result cannot produce an apply-transition candidate.",
    );
  }

  if (validationResult.status === "unsupported") {
    return unsupportedPrerequisite(
      "acceptable_finalization_validation_result",
      "unsupported_source_target_pair",
      "Unsupported validation result cannot produce an apply-transition candidate.",
    );
  }

  if (validationResult.status === "not_ready") {
    return notReadyPrerequisite(
      "acceptable_finalization_validation_result",
      "Validation result is not ready for transition validation.",
    );
  }

  if (REVIEW_VALIDATION_STATUSES.has(validationResult.status)) {
    return reviewPrerequisite(
      "acceptable_finalization_validation_result",
      "review_state_required",
      "Validation result requires review before any future transition application.",
    );
  }

  return passPrerequisite(
    "acceptable_finalization_validation_result",
    "Validation result is compatible with transition candidate validation.",
  );
}

function evaluateManualApproval(
  input: FinalizationStateTransitionValidatorInput,
  sourceTargetCompatibility: FinalizationStateTransitionSourceTargetCompatibility,
): FinalizationStateTransitionPrerequisiteResult {
  const approvalContext =
    approvalContextFor(input);

  if (sourceTargetCompatibility.status !== "compatible") {
    return reviewPrerequisite(
      "manual_review_or_approval_if_required",
      "review_state_required",
      "Review or blocked source states require manual review metadata.",
    );
  }

  if (approvalContext?.approved) {
    return passPrerequisite(
      "manual_review_or_approval_if_required",
      "Manual approval is present but remains review metadata only.",
      "manual_approval_not_write_authority",
    );
  }

  return reviewPrerequisite(
    "manual_review_or_approval_if_required",
    "manual_approval_not_write_authority",
    "Manual approval is not present; transition candidate remains review-only.",
  );
}

function evaluateDuplicateConflict(
  validationResult: FinalizationValidationResult | null,
): FinalizationStateTransitionPrerequisiteResult {
  const hasDuplicateConflict =
    validationResult?.status === "duplicate_review" ||
    validationResult?.rejectionReasons.includes("duplicate_conflict") ||
    validationResult?.candidate?.matchSummary.duplicateReasons.length;

  if (hasDuplicateConflict) {
    return reviewPrerequisite(
      "no_duplicate_conflict",
      "review_state_required",
      "Duplicate conflict requires review before any future transition application.",
      "duplicate_conflict",
    );
  }

  return passPrerequisite(
    "no_duplicate_conflict",
    "No duplicate conflict is present.",
  );
}

function evaluatePartialFillAmbiguity(
  validationResult: FinalizationValidationResult | null,
): FinalizationStateTransitionPrerequisiteResult {
  const hasPartialFillAmbiguity =
    validationResult?.status === "partial_fill_review" ||
    validationResult?.reviewFlags.includes("partial_fill_review") ||
    validationResult?.candidate?.partialFillStatus !== "not_partial";

  if (hasPartialFillAmbiguity) {
    return reviewPrerequisite(
      "no_partial_fill_ambiguity_unless_routed_to_review",
      "review_state_required",
      "Partial-fill ambiguity is routed to review.",
    );
  }

  return passPrerequisite(
    "no_partial_fill_ambiguity_unless_routed_to_review",
    "No partial-fill ambiguity is present.",
  );
}

function evaluateUnsafeAuthorityFlags(
  input: FinalizationStateTransitionValidatorInput,
): FinalizationStateTransitionPrerequisiteResult {
  const carriers: AuthorityCarrier[] = [
    input as AuthorityCarrier,
    (input.transitionInput ?? {}) as AuthorityCarrier,
    (input.validationResult ?? {}) as AuthorityCarrier,
    (input.transitionInput?.validationResult ?? {}) as AuthorityCarrier,
    (input.candidate?.safetyPolicy ?? {}) as AuthorityCarrier,
    (input.transitionInput?.candidate?.safetyPolicy ?? {}) as AuthorityCarrier,
  ];

  const unsafeFlag = carriers.some(hasUnsafeAuthorityFlag);

  if (unsafeFlag) {
    return blockPrerequisite(
      "no_unsafe_authority_flags",
      "unsafe_authority_flag",
      "Unexpected true authority or attempted-operation flag was detected.",
    );
  }

  return passPrerequisite(
    "no_unsafe_authority_flags",
    "No unsafe authority flags are present.",
  );
}

function evaluatePnlFeeFxUncertainty(
  validationResult: FinalizationValidationResult | null,
): FinalizationStateTransitionPrerequisiteResult {
  const hasReviewUncertainty = Boolean(
    validationResult?.reviewFlags.includes("missing_fee_fx_data") ||
      validationResult?.reviewFlags.includes("pnl_adjustment_uncertainty") ||
      validationResult?.candidate?.feeSummary.reviewRequired ||
      validationResult?.candidate?.fxSummary.reviewRequired ||
      validationResult?.candidate?.pnlAdjustmentSummary.status ===
        "requires_review" ||
      validationResult?.candidate?.pnlAdjustmentSummary.status === "blocked",
  );

  if (hasReviewUncertainty) {
    return reviewPrerequisite(
      "unresolved_pnl_fee_fx_uncertainty_review_only",
      "review_state_required",
      "PnL/fee/FX uncertainty is review-only and cannot authorize transition application.",
    );
  }

  return passPrerequisite(
    "unresolved_pnl_fee_fx_uncertainty_review_only",
    "No unresolved PnL/fee/FX uncertainty is present.",
  );
}

function evaluateBoundaryMetadata(
  prerequisite: FinalizationStateTransitionPrerequisite,
  boundaryReadinessSummary: FinalizationStateTransitionBoundaryReadiness,
): FinalizationStateTransitionPrerequisiteResult {
  if (!boundaryReadinessSummary.requiredBoundaryMetadataPresent) {
    return blockPrerequisite(
      prerequisite,
      "missing_required_boundary_metadata",
      "Boundary readiness metadata is missing.",
    );
  }

  return passPrerequisite(
    prerequisite,
    "Boundary readiness metadata is present and was not invoked.",
    "boundary_readiness_metadata_only",
  );
}

function buildBoundaryReadinessSummary(
  input: FinalizationStateTransitionValidatorInput,
): FinalizationStateTransitionBoundaryReadiness {
  const missingBoundaryMetadata: FinalizationStateTransitionBoundaryReadinessKey[] =
    [];

  const persistenceBoundary = boundaryStatusOrMissing(
    input.persistenceBoundaryStatus,
    "persistence_boundary",
    missingBoundaryMetadata,
  );
  const executionRecordBoundary = boundaryStatusOrMissing(
    input.executionRecordBoundaryStatus,
    "execution_record_boundary",
    missingBoundaryMetadata,
  );
  const statsPnlBoundary = boundaryStatusOrMissing(
    input.statsPnlBoundaryStatus,
    "stats_pnl_boundary",
    missingBoundaryMetadata,
  );
  const tradeMutationBoundary = boundaryStatusOrMissing(
    input.tradeMutationBoundaryStatus,
    "trade_mutation_boundary",
    missingBoundaryMetadata,
  );
  const auditAppendBoundary = boundaryStatusOrMissing(
    input.auditAppendBoundaryStatus,
    "audit_append_boundary",
    missingBoundaryMetadata,
  );
  const correctionRollbackBoundary = boundaryStatusOrMissing(
    input.correctionRollbackBoundaryStatus,
    "correction_rollback_boundary",
    missingBoundaryMetadata,
  );

  return {
    persistenceBoundary,
    executionRecordBoundary,
    statsPnlBoundary,
    tradeMutationBoundary,
    auditAppendBoundary,
    correctionRollbackBoundary,
    requiredBoundaryMetadataPresent: missingBoundaryMetadata.length === 0,
    missingBoundaryMetadata,
    checkedAsMetadataOnly: true,
    persistenceAttempted: false,
    executionRecordCreationAttempted: false,
    statsUpdateAttempted: false,
    tradeMutationAttempted: false,
    auditAppendAttempted: false,
  };
}

function boundaryStatusOrMissing(
  boundaryStatus: FinalizationTransitionBoundaryStatus | null | undefined,
  key: FinalizationStateTransitionBoundaryReadinessKey,
  missingBoundaryMetadata: FinalizationStateTransitionBoundaryReadinessKey[],
): FinalizationTransitionBoundaryStatus {
  if (boundaryStatus) {
    return boundaryStatus;
  }

  missingBoundaryMetadata.push(key);

  return FALSE_BOUNDARY_STATUS;
}

function buildAuditCorrectionReadinessSummary(
  input: FinalizationStateTransitionValidatorInput,
): FinalizationStateTransitionAuditCorrectionReadiness {
  const auditContext = auditContextFor(input);
  const approvalContext = approvalContextFor(input);
  const sourceEvidenceTraceable = auditContext?.sourceEvidenceTraceable === true;
  const beforeAfterValuesAvailable = auditContext?.beforeAfterValuesKnown === true;
  const duplicateFinalizationPreventionAvailable =
    auditContext?.duplicatePreventionAvailable === true;
  const correctionRollbackPathAvailable =
    auditContext?.correctionStrategyAvailable === true;
  const auditTrailReady = auditContext?.auditStrategyAvailable === true;
  const manualApprovalTraceable = Boolean(
    approvalContext?.approvedAt ||
      approvalContext?.approvedBy ||
      approvalContext?.approvalReference ||
      approvalContext?.manualReviewContext,
  );
  const ready =
    sourceEvidenceTraceable &&
    beforeAfterValuesAvailable &&
    duplicateFinalizationPreventionAvailable &&
    correctionRollbackPathAvailable &&
    auditTrailReady &&
    manualApprovalTraceable;

  return {
    sourceEvidenceTraceable,
    beforeAfterValuesAvailable,
    duplicateFinalizationPreventionAvailable,
    correctionRollbackPathAvailable,
    auditTrailReady,
    manualApprovalTraceable,
    auditRequirements: [
      "source_evidence_traceable",
      "before_after_values_known",
      "approval_actor_timestamp_recorded",
      "candidate_fingerprint_recorded",
      "validator_result_recorded",
      "write_attempts_traceable",
      "duplicate_finalization_prevention",
    ],
    correctionRequirements: [
      "correction_strategy_available",
      "rollback_or_amendment_path_defined",
      "duplicate_correction_prevention",
      "correction_audit_trail_required",
    ],
    auditContext,
    ready,
    checkedAsMetadataOnly: true,
    auditAppendAttempted: false,
  };
}

function approvalContextFor(input: FinalizationStateTransitionValidatorInput) {
  return input.approvalContext === undefined
    ? input.transitionInput?.approvalContext ?? null
    : input.approvalContext;
}

function auditContextFor(input: FinalizationStateTransitionValidatorInput) {
  return input.auditContext === undefined
    ? input.transitionInput?.auditContext ?? null
    : input.auditContext;
}

function deriveStatus(
  sourceState: FinalizationTransitionSourceState,
  sourceTargetCompatibility: FinalizationStateTransitionSourceTargetCompatibility,
  accumulator: ValidationAccumulator,
): FinalizationStateTransitionValidationStatus {
  const blockedReasons = unique(accumulator.blockedReasons);
  const hardBlocks = blockedReasons.filter(
    (reason) => reason !== "duplicate_conflict",
  );

  if (hardBlocks.length > 0) {
    return sourceTargetCompatibility.status === "unsupported"
      ? "unsupported"
      : "blocked";
  }

  if (sourceState === "not_ready") {
    return "not_ready";
  }

  if (sourceState === "unsupported") {
    return "unsupported";
  }

  if (
    sourceState === "needs_review" ||
    sourceState === "partial_fill_review" ||
    sourceState === "duplicate_review" ||
    accumulator.prerequisiteResults.some(
      (result) => result.status === "review_required",
    )
  ) {
    return "needs_review";
  }

  if (sourceState === "blocked") {
    return "blocked";
  }

  return "transition_candidate_valid";
}

function buildDecisionRecommendation(
  sourceState: FinalizationTransitionSourceState,
  proposedTargetState: FinalizationTransitionTargetState,
  sourceTargetCompatibility: FinalizationStateTransitionSourceTargetCompatibility,
  status: FinalizationStateTransitionValidationStatus,
  accumulator: ValidationAccumulator,
): FinalizationStateTransitionDecisionRecommendation {
  const firstBlockedReason = unique(accumulator.blockedReasons)[0] ?? null;
  const firstWarning = unique(accumulator.warnings)[0] ?? null;

  return {
    recommendedStatus: status,
    recommendedTargetState:
      sourceTargetCompatibility.expectedTargetState ?? proposedTargetState,
    sourceState,
    applyTransition: false,
    requiresManualReview: true,
    requiresFinalizationActionContract: true,
    requiresWriteBoundary: false,
    blockedReason: firstBlockedReason,
    warning: firstWarning,
    details:
      "Transition validation result is diagnostic metadata only and does not apply target state.",
  };
}

function addPrerequisite(
  accumulator: ValidationAccumulator,
  result: FinalizationStateTransitionPrerequisiteResult,
) {
  accumulator.prerequisiteResults.push(result);

  if (result.blockedReason) {
    addBlockedReason(accumulator, result.blockedReason);
  }

  if (result.warning) {
    addWarning(accumulator, result.warning);
  }
}

function passPrerequisite(
  prerequisite: FinalizationStateTransitionPrerequisite,
  details: string,
  warning?: FinalizationStateTransitionWarning,
): FinalizationStateTransitionPrerequisiteResult {
  return {
    prerequisite,
    status: "satisfied",
    satisfied: true,
    warning,
    details,
  };
}

function reviewPrerequisite(
  prerequisite: FinalizationStateTransitionPrerequisite,
  warning: FinalizationStateTransitionWarning,
  details: string,
  blockedReason?: FinalizationStateTransitionBlockedReason,
): FinalizationStateTransitionPrerequisiteResult {
  return {
    prerequisite,
    status: "review_required",
    satisfied: false,
    blockedReason,
    warning,
    details,
  };
}

function blockPrerequisite(
  prerequisite: FinalizationStateTransitionPrerequisite,
  blockedReason: FinalizationStateTransitionBlockedReason,
  details: string,
): FinalizationStateTransitionPrerequisiteResult {
  return {
    prerequisite,
    status: "blocked",
    satisfied: false,
    blockedReason,
    details,
  };
}

function unsupportedPrerequisite(
  prerequisite: FinalizationStateTransitionPrerequisite,
  blockedReason: FinalizationStateTransitionBlockedReason,
  details: string,
): FinalizationStateTransitionPrerequisiteResult {
  return {
    prerequisite,
    status: "unsupported",
    satisfied: false,
    blockedReason,
    details,
  };
}

function notReadyPrerequisite(
  prerequisite: FinalizationStateTransitionPrerequisite,
  details: string,
): FinalizationStateTransitionPrerequisiteResult {
  return {
    prerequisite,
    status: "not_ready",
    satisfied: false,
    details,
  };
}

function hasUnsafeAuthorityFlag(carrier: AuthorityCarrier): boolean {
  return AUTHORITATIVE_FLAGS.some((flag) => carrier[flag] === true);
}

function addBlockedReason(
  accumulator: ValidationAccumulator,
  reason: FinalizationStateTransitionBlockedReason,
) {
  accumulator.blockedReasons.push(reason);
}

function addWarning(
  accumulator: ValidationAccumulator,
  warning: FinalizationStateTransitionWarning,
) {
  accumulator.warnings.push(warning);
}

function buildSafetyPolicy(): FinalizationStateTransitionSafetyPolicy {
  return FINALIZATION_STATE_TRANSITION_VALIDATOR_DEFAULT_SAFETY_POLICY;
}

function unique<T extends string>(items: T[]): T[] {
  return [...new Set(items)];
}
