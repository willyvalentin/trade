import type {
  FinalizationActionInput,
  FinalizationActionMode,
  FinalizationActionResult,
} from "@/lib/finalization-action-contract";
import type { FinalizationCandidate } from "@/lib/finalization-candidate-contract";
import type {
  FinalizationTransitionAuditContext,
  FinalizationTransitionBoundaryStatus,
} from "@/lib/finalization-state-transition-contract";
import type { FinalizationStateTransitionValidationResult } from "@/lib/finalization-state-transition-validator-contract";
import type { FinalizationValidationResult } from "@/lib/finalization-validator-contract";
import {
  FINALIZATION_ACTION_VALIDATION_DEFAULT_SAFETY_POLICY,
  FINALIZATION_ACTION_VALIDATOR_CONTRACT_VERSION,
  type FinalizationActionAuditCorrectionValidation,
  type FinalizationActionAuthorityValidation,
  type FinalizationActionBlockedReason,
  type FinalizationActionDecisionRecommendation,
  type FinalizationActionPreconditionValidation,
  type FinalizationActionValidationAuditCorrectionRequirement,
  type FinalizationActionValidationResult,
  type FinalizationActionValidationStatus,
  type FinalizationActionValidationWarning,
  type FinalizationActionValidationWriteBoundary,
  type FinalizationActionWriteBoundaryValidation,
  type FinalizationActionValidatorInput,
  type FinalizationActionValidatorManualApprovalContext,
} from "@/lib/finalization-action-validator-contract";

type AuthorityCarrier = {
  safeToValidateOnly?: unknown;
  safeToRunFinalizationAction?: unknown;
  safeToFinalize?: unknown;
  safeToPersist?: unknown;
  safeToCreateExecutionRecord?: unknown;
  safeToUpdateStats?: unknown;
  safeToMutateTrade?: unknown;
  safeToAppendAudit?: unknown;
  safeToRollback?: unknown;
  automaticModeAllowed?: unknown;
  finalizationAuthority?: unknown;
  persistenceAuthority?: unknown;
  executionRecordCreationAuthority?: unknown;
  statsPnlUpdateAuthority?: unknown;
  auditAppendAuthority?: unknown;
  correctionRollbackAuthority?: unknown;
  rollbackCorrectionAuthority?: unknown;
  tradeMutationAuthority?: unknown;
  automaticModeAuthority?: unknown;
  finalizationActionAttempted?: unknown;
  finalizationAttempted?: unknown;
  persistenceAttempted?: unknown;
  executionRecordCreationAttempted?: unknown;
  statsUpdateAttempted?: unknown;
  tradeMutationAttempted?: unknown;
  auditAppendAttempted?: unknown;
  rollbackAttempted?: unknown;
  browserAutomationAttempted?: unknown;
  avanzaAutomationAttempted?: unknown;
  brokerAutomationAttempted?: unknown;
};

type ValidationAccumulator = {
  preconditionValidations: FinalizationActionPreconditionValidation[];
  blockedReasons: FinalizationActionBlockedReason[];
  warnings: FinalizationActionValidationWarning[];
};

const SUPPORTED_SOURCE_CLASSIFICATIONS = new Set([
  "broker_confirmed",
  "production_safe_candidate",
]);

const AUTHORITY_FIELDS = [
  {
    field: "finalizationAuthority",
    key: "finalization_authority",
  },
  {
    field: "persistenceAuthority",
    key: "persistence_authority",
  },
  {
    field: "executionRecordCreationAuthority",
    key: "execution_record_creation_authority",
  },
  {
    field: "statsPnlUpdateAuthority",
    key: "stats_pnl_update_authority",
  },
  {
    field: "auditAppendAuthority",
    key: "audit_append_authority",
  },
  {
    field: "rollbackCorrectionAuthority",
    key: "rollback_correction_authority",
  },
  {
    field: "correctionRollbackAuthority",
    key: "rollback_correction_authority",
  },
  {
    field: "tradeMutationAuthority",
    key: "trade_mutation_authority",
  },
  {
    field: "automaticModeAuthority",
    key: "automatic_mode_authority",
  },
  {
    field: "automaticModeAllowed",
    key: "automatic_mode_authority",
  },
] as const;

const UNSAFE_BOOLEAN_FIELDS: Array<keyof AuthorityCarrier> = [
  "safeToRunFinalizationAction",
  "safeToFinalize",
  "safeToPersist",
  "safeToCreateExecutionRecord",
  "safeToUpdateStats",
  "safeToMutateTrade",
  "safeToAppendAudit",
  "safeToRollback",
  "automaticModeAllowed",
  "finalizationAuthority",
  "persistenceAuthority",
  "executionRecordCreationAuthority",
  "statsPnlUpdateAuthority",
  "auditAppendAuthority",
  "correctionRollbackAuthority",
  "rollbackCorrectionAuthority",
  "tradeMutationAuthority",
  "automaticModeAuthority",
  "finalizationActionAttempted",
  "finalizationAttempted",
  "persistenceAttempted",
  "executionRecordCreationAttempted",
  "statsUpdateAttempted",
  "tradeMutationAttempted",
  "auditAppendAttempted",
  "rollbackAttempted",
  "browserAutomationAttempted",
  "avanzaAutomationAttempted",
  "brokerAutomationAttempted",
];

// Pure validation only. This function inspects supplied finalization action
// metadata and returns a typed diagnostic result. It does not run actions,
// finalize, persist, create execution records, update stats/PnL, append audit,
// rollback/correct, mutate trades, wire UI, drive browser automation, interact
// with Avanza, or call broker APIs.
export function validateFinalizationAction(
  input: FinalizationActionValidatorInput,
): FinalizationActionValidationResult {
  const evaluatedAt = input.requestedAt;
  const actionInput = input.actionInput ?? input.actionResult ?? null;
  const candidate = candidateFor(input);
  const finalizationValidationResult = finalizationValidationFor(input);
  const transitionValidationResult = transitionValidationFor(input);
  const transitionResult =
    input.transitionResult ??
    input.actionInput?.transitionResult ??
    input.actionResult?.transitionResult ??
    null;
  const manualApprovalContext = manualApprovalContextFor(input);
  const accumulator: ValidationAccumulator = {
    preconditionValidations: [],
    blockedReasons: [],
    warnings: [
      "action_candidate_not_execution",
      "candidate_not_write_authority",
    ],
  };

  const authorityValidation = evaluateAuthority(input, actionInput);
  if (authorityValidation.blockedReason) {
    addBlockedReason(accumulator, authorityValidation.blockedReason);
  }
  if (authorityValidation.warning) {
    addWarning(accumulator, authorityValidation.warning);
  }

  const writeBoundaryValidations = evaluateWriteBoundaries(input);
  const auditCorrectionValidation = evaluateAuditCorrection(input);

  addPrecondition(
    accumulator,
    candidate
      ? passPrecondition(
          "finalization_candidate_present",
          "Finalization candidate is present.",
        )
      : blockPrecondition(
          "finalization_candidate_present",
          "missing_finalization_candidate",
          "Finalization candidate is missing.",
        ),
  );
  addPrecondition(
    accumulator,
    evaluateFinalizationValidation(finalizationValidationResult),
  );
  addPrecondition(
    accumulator,
    evaluateTransitionValidation(transitionValidationResult),
  );
  addPrecondition(
    accumulator,
    evaluateManualApproval(manualApprovalContext),
  );
  addPrecondition(
    accumulator,
    evaluateDuplicateConflict(finalizationValidationResult, candidate),
  );
  addPrecondition(
    accumulator,
    evaluateReviewBlockers(finalizationValidationResult, transitionValidationResult, candidate),
  );
  addPrecondition(accumulator, evaluateSupportedSourceBroker(candidate));
  addPrecondition(
    accumulator,
    evaluateAuditCorrectionPrecondition(auditCorrectionValidation),
  );
  addPrecondition(
    accumulator,
    evaluateBoundaryMetadataPrecondition(writeBoundaryValidations),
  );

  for (const boundaryValidation of writeBoundaryValidations) {
    if (boundaryValidation.blockedReason) {
      addBlockedReason(accumulator, boundaryValidation.blockedReason);
    }
    if (boundaryValidation.warning) {
      addWarning(accumulator, boundaryValidation.warning);
    }
  }

  if (auditCorrectionValidation.blockedReason) {
    addBlockedReason(accumulator, auditCorrectionValidation.blockedReason);
  }
  if (
    auditCorrectionValidation.missingRequirements.some(
      (requirement) => requirement !== "correction_rollback_requirements_present",
    )
  ) {
    addBlockedReason(accumulator, "audit_requirement_missing");
  }
  if (
    auditCorrectionValidation.missingRequirements.includes(
      "correction_rollback_requirements_present",
    )
  ) {
    addBlockedReason(accumulator, "correction_strategy_missing");
  }
  if (auditCorrectionValidation.warning) {
    addWarning(accumulator, auditCorrectionValidation.warning);
  }

  const status = deriveStatus(accumulator);
  const decisionRecommendation = buildDecisionRecommendation(status, accumulator);

  return {
    contractVersion: FINALIZATION_ACTION_VALIDATOR_CONTRACT_VERSION,
    evaluatedAt,
    status,
    actionInput: input.actionInput ?? null,
    actionResult: input.actionResult ?? null,
    candidate,
    finalizationValidationResult,
    transitionValidationResult,
    transitionResult,
    authorityValidation,
    preconditionValidations: accumulator.preconditionValidations,
    writeBoundaryValidations,
    auditCorrectionValidation,
    decisionRecommendation,
    safetyPolicy: FINALIZATION_ACTION_VALIDATION_DEFAULT_SAFETY_POLICY,
    blockedReasons: unique(accumulator.blockedReasons),
    warnings: unique(accumulator.warnings),
    manualApprovalContext,
    executionRecordCandidateMetadata:
      input.executionRecordCandidateMetadata ??
      input.actionInput?.executionRecordCandidateMetadata ??
      input.actionResult?.executionRecordCandidateMetadata ??
      candidate?.executionRecordMetadata?.executionRecordCandidate ??
      null,
    safeToValidateOnly: true,
    safeToRunFinalizationAction: false,
    safeToFinalize: false,
    safeToPersist: false,
    safeToCreateExecutionRecord: false,
    safeToUpdateStats: false,
    safeToMutateTrade: false,
    safeToAppendAudit: false,
    safeToRollback: false,
    validatorImplementationEnabled: false,
    finalizationActionAttempted: false,
    finalizationAttempted: false,
    persistenceAttempted: false,
    executionRecordCreationAttempted: false,
    statsUpdateAttempted: false,
    tradeMutationAttempted: false,
    auditAppendAttempted: false,
    rollbackAttempted: false,
    browserAutomationAttempted: false,
    avanzaAutomationAttempted: false,
    brokerAutomationAttempted: false,
    metadata: {
      ...(input.metadata ?? {}),
      finalizationActionValidatorPure: true,
      validationOnly: true,
      actionExecutionApproval: false,
      finalizationApproval: false,
      persistenceApproval: false,
      executionRecordCreationApproval: false,
      statsUpdateApproval: false,
      auditAppendApproval: false,
      rollbackApproval: false,
      tradeMutationApproval: false,
    },
  };
}

function candidateFor(
  input: FinalizationActionValidatorInput,
): FinalizationCandidate | null {
  return (
    input.candidate ??
    input.actionInput?.candidate ??
    input.actionResult?.candidate ??
    input.finalizationValidationResult?.candidate ??
    input.transitionValidationResult?.candidate ??
    null
  );
}

function finalizationValidationFor(
  input: FinalizationActionValidatorInput,
): FinalizationValidationResult | null {
  return (
    input.finalizationValidationResult ??
    input.actionInput?.finalizationValidationResult ??
    input.actionResult?.finalizationValidationResult ??
    input.transitionValidationResult?.validationResult ??
    null
  );
}

function transitionValidationFor(
  input: FinalizationActionValidatorInput,
): FinalizationStateTransitionValidationResult | null {
  return (
    input.transitionValidationResult ??
    input.actionInput?.transitionValidationResult ??
    input.actionResult?.transitionValidationResult ??
    null
  );
}

function evaluateAuthority(
  input: FinalizationActionValidatorInput,
  actionInput: FinalizationActionInput | FinalizationActionResult | null,
): FinalizationActionAuthorityValidation {
  const carriers: AuthorityCarrier[] = [
    input as AuthorityCarrier,
    input.safetyPolicy ?? {},
    (input.actionInput ?? {}) as AuthorityCarrier,
    (input.actionInput?.authority ?? {}) as AuthorityCarrier,
    (input.actionResult ?? {}) as AuthorityCarrier,
    (input.actionResult?.authority ?? {}) as AuthorityCarrier,
    (input.actionResult?.safetyPolicy ?? {}) as AuthorityCarrier,
    (input.finalizationValidationResult ?? {}) as AuthorityCarrier,
    (input.finalizationValidationResult?.safetyPolicy ?? {}) as AuthorityCarrier,
    (input.transitionValidationResult ?? {}) as AuthorityCarrier,
    (input.transitionValidationResult?.safetyPolicy ?? {}) as AuthorityCarrier,
    (input.candidate ?? {}) as AuthorityCarrier,
    (input.candidate?.safetyPolicy ?? {}) as AuthorityCarrier,
    (actionInput ?? {}) as AuthorityCarrier,
  ];
  const unexpectedTrueAuthorityKeys = unique(
    carriers.flatMap(authorityKeysForCarrier),
  );
  const hasUnexpectedAuthority = unexpectedTrueAuthorityKeys.length > 0;
  const automaticModeRequested =
    modeFor(actionInput) === "future_write_candidate" ||
    hasTrueField(carriers, "automaticModeAllowed") ||
    hasTrueField(carriers, "automaticModeAuthority");
  const blockedReason = hasUnexpectedAuthority
    ? "authority_flag_unexpectedly_true"
    : automaticModeRequested
      ? "automatic_mode_not_allowed"
      : null;

  return {
    finalizationAuthority: false,
    persistenceAuthority: false,
    executionRecordCreationAuthority: false,
    statsPnlUpdateAuthority: false,
    auditAppendAuthority: false,
    rollbackCorrectionAuthority: false,
    tradeMutationAuthority: false,
    automaticModeAuthority: false,
    unexpectedTrueAuthorityKeys,
    safeForValidationOnly: true,
    blockedReason,
    warning: "manual_approval_not_write_authority",
    details: blockedReason
      ? "Unexpected authority or automatic-mode metadata was detected."
      : "Authority metadata remains validation-only and grants no write capability.",
  };
}

function authorityKeysForCarrier(
  carrier: AuthorityCarrier,
): Array<FinalizationActionAuthorityValidation["unexpectedTrueAuthorityKeys"][number]> {
  const keys = AUTHORITY_FIELDS
    .filter(({ field }) => carrier[field] === true)
    .map(({ key }) => key);
  const unsafeOperationalFlag = UNSAFE_BOOLEAN_FIELDS.some(
    (field) => carrier[field] === true,
  );

  return unsafeOperationalFlag && keys.length === 0
    ? ["finalization_authority"]
    : unique(keys);
}

function evaluateFinalizationValidation(
  result: FinalizationValidationResult | null,
): FinalizationActionPreconditionValidation {
  if (!result) {
    return blockPrecondition(
      "finalization_validation_acceptable",
      "missing_finalization_validation",
      "Finalization validation result is missing.",
    );
  }

  if (result.status === "ready_for_finalization_review") {
    return passPrecondition(
      "finalization_validation_acceptable",
      "Finalization validation result is ready for review.",
    );
  }

  if (result.status === "unsupported") {
    return unsupportedPrecondition(
      "finalization_validation_acceptable",
      "Finalization validation result is unsupported.",
    );
  }

  if (result.status === "not_ready") {
    return notReadyPrecondition(
      "finalization_validation_acceptable",
      "Finalization validation result is not ready.",
    );
  }

  if (result.status === "blocked") {
    return blockPrecondition(
      "finalization_validation_acceptable",
      "missing_finalization_validation",
      "Blocked finalization validation cannot produce an action candidate.",
    );
  }

  return reviewPrecondition(
    "finalization_validation_acceptable",
    "Finalization validation requires review before any future action.",
  );
}

function evaluateTransitionValidation(
  result: FinalizationStateTransitionValidationResult | null,
): FinalizationActionPreconditionValidation {
  if (!result) {
    return blockPrecondition(
      "transition_validation_acceptable",
      "missing_transition_validation",
      "Transition validation result is missing.",
    );
  }

  if (result.status === "transition_candidate_valid") {
    return passPrecondition(
      "transition_validation_acceptable",
      "Transition validation result is acceptable.",
      "action_candidate_not_execution",
    );
  }

  if (result.status === "unsupported") {
    return unsupportedPrecondition(
      "transition_validation_acceptable",
      "Transition validation result is unsupported.",
    );
  }

  if (result.status === "not_ready") {
    return notReadyPrecondition(
      "transition_validation_acceptable",
      "Transition validation result is not ready.",
    );
  }

  if (result.status === "blocked") {
    return blockPrecondition(
      "transition_validation_acceptable",
      "missing_transition_validation",
      "Blocked transition validation cannot produce an action candidate.",
    );
  }

  return reviewPrecondition(
    "transition_validation_acceptable",
    "Transition validation requires review before any future action.",
  );
}

function evaluateManualApproval(
  context: FinalizationActionValidatorManualApprovalContext | null,
): FinalizationActionPreconditionValidation {
  if (context?.approvalRequired === false) {
    return passPrecondition(
      "manual_approval_present_if_required",
      "Manual approval is not required for this validation-only candidate.",
      "manual_approval_not_write_authority",
    );
  }

  if (context?.approvalPresent) {
    return passPrecondition(
      "manual_approval_present_if_required",
      "Manual approval metadata is present but does not grant write authority.",
      "manual_approval_not_write_authority",
    );
  }

  return reviewPrecondition(
    "manual_approval_present_if_required",
    "Manual approval metadata is missing; action candidate remains review-only.",
    "manual_approval_not_write_authority",
  );
}

function evaluateDuplicateConflict(
  validationResult: FinalizationValidationResult | null,
  candidate: FinalizationCandidate | null,
): FinalizationActionPreconditionValidation {
  const hasDuplicateConflict = Boolean(
    validationResult?.status === "duplicate_review" ||
      validationResult?.rejectionReasons.includes("duplicate_conflict") ||
      validationResult?.candidate?.matchSummary.duplicateReasons.length ||
      candidate?.status === "duplicate_review" ||
      candidate?.matchSummary.duplicateReasons.length,
  );

  if (hasDuplicateConflict) {
    return reviewPrecondition(
      "no_duplicate_conflict",
      "Duplicate conflict requires review before any future action.",
    );
  }

  return passPrecondition(
    "no_duplicate_conflict",
    "No duplicate conflict is present.",
  );
}

function evaluateReviewBlockers(
  validationResult: FinalizationValidationResult | null,
  transitionValidationResult: FinalizationStateTransitionValidationResult | null,
  candidate: FinalizationCandidate | null,
): FinalizationActionPreconditionValidation {
  const hasReviewBlocker = Boolean(
    validationResult?.status === "needs_review" ||
      validationResult?.status === "partial_fill_review" ||
      validationResult?.reviewFlags.length ||
      validationResult?.warnings.includes("manual_review_required") ||
      transitionValidationResult?.status === "needs_review" ||
      candidate?.status === "needs_review" ||
      candidate?.status === "partial_fill_review" ||
      candidate?.feeSummary.reviewRequired ||
      candidate?.fxSummary.reviewRequired ||
      candidate?.pnlAdjustmentSummary.status === "requires_review" ||
      candidate?.pnlAdjustmentSummary.status === "blocked",
  );

  if (hasReviewBlocker) {
    return reviewPrecondition(
      "no_unresolved_review_blocker",
      "Review blockers remain unresolved and cannot authorize an action.",
    );
  }

  return passPrecondition(
    "no_unresolved_review_blocker",
    "No unresolved review blocker is present.",
  );
}

function evaluateSupportedSourceBroker(
  candidate: FinalizationCandidate | null,
): FinalizationActionPreconditionValidation {
  if (!candidate) {
    return notReadyPrecondition(
      "supported_source_broker",
      "Candidate is required before source/broker support can be checked.",
    );
  }

  const sourceClassification = candidate.evidenceSummary.sourceClassification;
  const supportedBroker = candidate.evidenceSummary.broker === "avanza";
  const supportedSource =
    !sourceClassification ||
    SUPPORTED_SOURCE_CLASSIFICATIONS.has(sourceClassification);

  if (candidate.status === "unsupported" || !supportedBroker || !supportedSource) {
    return unsupportedPrecondition(
      "supported_source_broker",
      "Candidate source or broker is unsupported for action validation.",
    );
  }

  return passPrecondition(
    "supported_source_broker",
    "Candidate source and broker are supported for review metadata.",
  );
}

function evaluateAuditCorrectionPrecondition(
  auditCorrectionValidation: FinalizationActionAuditCorrectionValidation,
): FinalizationActionPreconditionValidation {
  if (auditCorrectionValidation.missingRequirements.length > 0) {
    return blockPrecondition(
      "audit_correction_strategy_present",
      auditCorrectionValidation.missingRequirements.includes(
        "correction_rollback_requirements_present",
      )
        ? "correction_strategy_missing"
        : "audit_requirement_missing",
      "Audit/correction metadata is missing or incomplete.",
    );
  }

  return passPrecondition(
    "audit_correction_strategy_present",
    "Audit/correction metadata is present and was not invoked.",
    "audit_required_before_write",
  );
}

function evaluateBoundaryMetadataPrecondition(
  writeBoundaryValidations: FinalizationActionWriteBoundaryValidation[],
): FinalizationActionPreconditionValidation {
  const unavailable = writeBoundaryValidations.some(
    (validation) => validation.blockedReason === "write_boundary_unavailable",
  );

  if (unavailable) {
    return blockPrecondition(
      "boundary_metadata_present_when_relevant",
      "write_boundary_unavailable",
      "Required write boundary metadata is missing or unavailable.",
    );
  }

  return passPrecondition(
    "boundary_metadata_present_when_relevant",
    "Write boundary metadata is present and was not invoked.",
    "future_write_boundary_required",
  );
}

function evaluateWriteBoundaries(
  input: FinalizationActionValidatorInput,
): FinalizationActionWriteBoundaryValidation[] {
  return [
    buildWriteBoundaryValidation(
      "persistence_boundary",
      boundaryStatusFor(input, "persistence_boundary"),
    ),
    buildWriteBoundaryValidation(
      "execution_record_creation_boundary",
      boundaryStatusFor(input, "execution_record_creation_boundary"),
    ),
    buildWriteBoundaryValidation(
      "stats_pnl_update_boundary",
      boundaryStatusFor(input, "stats_pnl_update_boundary"),
    ),
    buildWriteBoundaryValidation(
      "audit_append_boundary",
      boundaryStatusFor(input, "audit_append_boundary"),
    ),
    buildWriteBoundaryValidation(
      "correction_rollback_boundary",
      boundaryStatusFor(input, "correction_rollback_boundary"),
    ),
    buildWriteBoundaryValidation(
      "trade_mutation_boundary",
      boundaryStatusFor(input, "trade_mutation_boundary"),
    ),
  ];
}

function buildWriteBoundaryValidation(
  boundary: FinalizationActionValidationWriteBoundary,
  sourceBoundaryStatus: FinalizationTransitionBoundaryStatus | null,
): FinalizationActionWriteBoundaryValidation {
  const status = normalizeBoundaryStatus(sourceBoundaryStatus);
  const unavailable = status === "missing" || status === "blocked";

  return {
    boundary,
    status,
    sourceBoundaryStatus,
    requiredForFutureWrite: true,
    safeToInvoke: false,
    writeAttempted: false,
    blockedReason: unavailable ? "write_boundary_unavailable" : null,
    warning: "future_write_boundary_required",
    details: unavailable
      ? "Write boundary metadata is unavailable and was not invoked."
      : "Write boundary metadata was inspected only; no boundary was invoked.",
  };
}

function boundaryStatusFor(
  input: FinalizationActionValidatorInput,
  boundary: FinalizationActionValidationWriteBoundary,
): FinalizationTransitionBoundaryStatus | null {
  const metadata = input.boundaryMetadata;

  if (metadata) {
    switch (boundary) {
      case "persistence_boundary":
        return metadata.persistenceBoundaryStatus ?? null;
      case "execution_record_creation_boundary":
        return metadata.executionRecordBoundaryStatus ?? null;
      case "stats_pnl_update_boundary":
        return metadata.statsPnlBoundaryStatus ?? null;
      case "audit_append_boundary":
        return metadata.auditAppendBoundaryStatus ?? null;
      case "correction_rollback_boundary":
        return metadata.correctionRollbackBoundaryStatus ?? null;
      case "trade_mutation_boundary":
        return metadata.tradeMutationBoundaryStatus ?? null;
    }
  }

  switch (boundary) {
    case "persistence_boundary":
      return input.actionInput?.persistenceBoundaryStatus ?? null;
    case "execution_record_creation_boundary":
      return input.actionInput?.executionRecordBoundaryStatus ?? null;
    case "stats_pnl_update_boundary":
      return input.actionInput?.statsPnlBoundaryStatus ?? null;
    case "audit_append_boundary":
      return input.actionInput?.auditAppendBoundaryStatus ?? null;
    case "correction_rollback_boundary":
      return input.actionInput?.correctionRollbackBoundaryStatus ?? null;
    case "trade_mutation_boundary":
      return input.actionInput?.tradeMutationBoundaryStatus ?? null;
  }
}

function normalizeBoundaryStatus(
  sourceBoundaryStatus: FinalizationTransitionBoundaryStatus | null,
) {
  if (!sourceBoundaryStatus) {
    return "missing";
  }

  if (sourceBoundaryStatus.status === "blocked") {
    return "blocked";
  }

  if (sourceBoundaryStatus.status === "not_required") {
    return "not_required";
  }

  if (sourceBoundaryStatus.available) {
    return "available_but_disabled";
  }

  if (sourceBoundaryStatus.status === "unknown") {
    return "unknown";
  }

  return "missing";
}

function evaluateAuditCorrection(
  input: FinalizationActionValidatorInput,
): FinalizationActionAuditCorrectionValidation {
  const metadata = input.auditCorrectionMetadata;
  const auditContext = metadata?.auditContext ?? auditContextFor(input);
  const auditRequirementsPresent =
    metadata?.auditRequired === false || auditContext?.auditStrategyAvailable === true;
  const correctionRollbackRequirementsPresent =
    metadata?.correctionRollbackRequired === false ||
    Boolean(metadata?.correctionStrategyReference) ||
    auditContext?.correctionStrategyAvailable === true;
  const beforeAfterStateReferencesAvailable = Boolean(
    metadata?.beforeStateReference && metadata?.afterStateReference,
  ) || auditContext?.beforeAfterValuesKnown === true;
  const sourceEvidenceTraceable = Boolean(
    metadata?.sourceEvidenceReference,
  ) || auditContext?.sourceEvidenceTraceable === true;
  const manualApprovalTraceable =
    manualApprovalContextFor(input)?.approvalPresent === true ||
    auditContextHasApprovalTrace(input);
  const duplicatePreventionAvailable = Boolean(
    metadata?.duplicatePreventionReference,
  ) || auditContext?.duplicatePreventionAvailable === true;
  const requirementResults = {
    audit_requirements_present: auditRequirementsPresent,
    correction_rollback_requirements_present:
      correctionRollbackRequirementsPresent,
    before_after_state_references_available:
      beforeAfterStateReferencesAvailable,
    source_evidence_traceable: sourceEvidenceTraceable,
    manual_approval_traceable: manualApprovalTraceable,
    duplicate_prevention_available: duplicatePreventionAvailable,
  } satisfies Record<
    FinalizationActionValidationAuditCorrectionRequirement,
    boolean
  >;
  const missingRequirements =
    Object.entries(requirementResults).flatMap(([requirement, satisfied]) =>
      satisfied
        ? []
        : [requirement as FinalizationActionValidationAuditCorrectionRequirement],
    );

  return {
    auditRequirementsPresent,
    correctionRollbackRequirementsPresent,
    beforeAfterStateReferencesAvailable,
    sourceEvidenceTraceable,
    manualApprovalTraceable,
    duplicatePreventionAvailable,
    requirements: Object.keys(
      requirementResults,
    ) as FinalizationActionValidationAuditCorrectionRequirement[],
    missingRequirements,
    auditContext,
    readyForFutureWrite: false,
    checkedAsMetadataOnly: true,
    auditAppendAttempted: false,
    rollbackAttempted: false,
    blockedReason:
      missingRequirements.length === 0
        ? null
        : missingRequirements.includes(
              "correction_rollback_requirements_present",
            )
          ? "correction_strategy_missing"
          : "audit_requirement_missing",
    warning: "audit_required_before_write",
    details:
      missingRequirements.length === 0
        ? "Audit/correction metadata is present and no audit or rollback was invoked."
        : "Audit/correction metadata is missing or incomplete.",
  };
}

function manualApprovalContextFor(
  input: FinalizationActionValidatorInput,
): FinalizationActionValidatorManualApprovalContext | null {
  if (input.manualApprovalContext) {
    return input.manualApprovalContext;
  }

  const approvalContext =
    input.actionInput?.approvalContext ??
    input.actionResult?.approvalContext ??
    null;

  if (!approvalContext) {
    return {
      approvalRequired: true,
      approvalPresent: false,
      approvalContext: null,
      approvalIsWriteAuthority: false,
    };
  }

  return {
    approvalRequired: approvalContext.approvalRequired,
    approvalPresent: approvalContext.approved,
    approvalContext,
    approvalIsWriteAuthority: false,
    approvedBy: approvalContext.approvedBy,
    approvedAt: approvalContext.approvedAt,
    approvalReference: approvalContext.approvalReference,
    metadata: approvalContext.metadata,
  };
}

function auditContextFor(
  input: FinalizationActionValidatorInput,
): FinalizationTransitionAuditContext | null {
  return input.actionInput?.auditContext ?? input.actionResult?.auditReadiness.auditContext ?? null;
}

function auditContextHasApprovalTrace(
  input: FinalizationActionValidatorInput,
) {
  const approvalContext =
    input.actionInput?.approvalContext ??
    input.actionResult?.approvalContext ??
    null;

  return Boolean(
    approvalContext?.approvedBy ||
      approvalContext?.approvedAt ||
      approvalContext?.approvalReference ||
      approvalContext?.manualReviewContext,
  );
}

function modeFor(
  input: FinalizationActionInput | FinalizationActionResult | null,
): FinalizationActionMode | null {
  return input && "mode" in input ? input.mode : null;
}

function deriveStatus(
  accumulator: ValidationAccumulator,
): FinalizationActionValidationStatus {
  const preconditions = accumulator.preconditionValidations;
  const blockedReasons = unique(accumulator.blockedReasons);

  if (preconditions.some((result) => result.status === "unsupported")) {
    return "unsupported";
  }

  if (
    blockedReasons.length > 0 ||
    preconditions.some((result) => result.status === "blocked")
  ) {
    return "blocked";
  }

  if (preconditions.some((result) => result.status === "not_ready")) {
    return "not_ready";
  }

  if (preconditions.some((result) => result.status === "needs_review")) {
    return "needs_review";
  }

  return "action_candidate_valid";
}

function buildDecisionRecommendation(
  status: FinalizationActionValidationStatus,
  accumulator: ValidationAccumulator,
): FinalizationActionDecisionRecommendation {
  return {
    recommendedStatus: status,
    safeToValidateOnly: true,
    runFinalizationAction: false,
    finalize: false,
    persist: false,
    createExecutionRecord: false,
    updateStats: false,
    appendAudit: false,
    rollback: false,
    mutateTrade: false,
    requiresManualReview: true,
    blockedReason: unique(accumulator.blockedReasons)[0] ?? null,
    warning: unique(accumulator.warnings)[0] ?? null,
    details:
      "Finalization action validation result is diagnostic metadata only and does not run actions or writes.",
  };
}

function addPrecondition(
  accumulator: ValidationAccumulator,
  result: FinalizationActionPreconditionValidation,
) {
  accumulator.preconditionValidations.push(result);

  if (result.blockedReason) {
    addBlockedReason(accumulator, result.blockedReason);
  }

  if (result.warning) {
    addWarning(accumulator, result.warning);
  }
}

function passPrecondition(
  precondition: FinalizationActionPreconditionValidation["precondition"],
  details: string,
  warning?: FinalizationActionValidationWarning,
): FinalizationActionPreconditionValidation {
  return {
    precondition,
    status: "satisfied",
    satisfied: true,
    checkedAsMetadataOnly: true,
    warning,
    details,
  };
}

function reviewPrecondition(
  precondition: FinalizationActionPreconditionValidation["precondition"],
  details: string,
  warning: FinalizationActionValidationWarning = "candidate_not_write_authority",
): FinalizationActionPreconditionValidation {
  return {
    precondition,
    status: "needs_review",
    satisfied: false,
    checkedAsMetadataOnly: true,
    warning,
    details,
  };
}

function blockPrecondition(
  precondition: FinalizationActionPreconditionValidation["precondition"],
  blockedReason: FinalizationActionBlockedReason,
  details: string,
): FinalizationActionPreconditionValidation {
  return {
    precondition,
    status: "blocked",
    satisfied: false,
    checkedAsMetadataOnly: true,
    blockedReason,
    details,
  };
}

function unsupportedPrecondition(
  precondition: FinalizationActionPreconditionValidation["precondition"],
  details: string,
): FinalizationActionPreconditionValidation {
  return {
    precondition,
    status: "unsupported",
    satisfied: false,
    checkedAsMetadataOnly: true,
    warning: "candidate_not_write_authority",
    details,
  };
}

function notReadyPrecondition(
  precondition: FinalizationActionPreconditionValidation["precondition"],
  details: string,
): FinalizationActionPreconditionValidation {
  return {
    precondition,
    status: "not_ready",
    satisfied: false,
    checkedAsMetadataOnly: true,
    warning: "candidate_not_write_authority",
    details,
  };
}

function addBlockedReason(
  accumulator: ValidationAccumulator,
  reason: FinalizationActionBlockedReason,
) {
  if (!accumulator.blockedReasons.includes(reason)) {
    accumulator.blockedReasons.push(reason);
  }
}

function addWarning(
  accumulator: ValidationAccumulator,
  warning: FinalizationActionValidationWarning,
) {
  if (!accumulator.warnings.includes(warning)) {
    accumulator.warnings.push(warning);
  }
}

function hasTrueField(
  carriers: AuthorityCarrier[],
  field: keyof AuthorityCarrier,
) {
  return carriers.some((carrier) => carrier[field] === true);
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}
