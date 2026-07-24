import {
  FINALIZATION_ACTION_DRY_RUN_CONTRACT_VERSION,
  FINALIZATION_ACTION_DRY_RUN_DEFAULT_SAFETY_POLICY,
  type FinalizationActionDryRunBlockedReason,
  type FinalizationActionDryRunCorrectionImpact,
  type FinalizationActionDryRunExecutionRecordImpact,
  type FinalizationActionDryRunFinalizationImpact,
  type FinalizationActionDryRunImpactDisposition,
  type FinalizationActionDryRunImpactSummary,
  type FinalizationActionDryRunInput,
  type FinalizationActionDryRunAuditImpact,
  type FinalizationActionDryRunPersistenceImpact,
  type FinalizationActionDryRunProposedImpact,
  type FinalizationActionDryRunResult,
  type FinalizationActionDryRunStatsPnLImpact,
  type FinalizationActionDryRunStatus,
  type FinalizationActionDryRunTradeMutationImpact,
  type FinalizationActionDryRunValidationSummary,
  type FinalizationActionDryRunWarning,
} from "@/lib/finalization-action-dry-run-contract";
import type {
  FinalizationActionBlockedReason,
  FinalizationActionValidationResult,
} from "@/lib/finalization-action-validator-contract";
import type { FinalizationCandidate } from "@/lib/finalization-candidate-contract";
import type { ExecutionRecordCandidate } from "@/lib/execution-record-creation-contract";
import type {
  FinalizationTransitionAuditContext,
  FinalizationTransitionBoundaryStatus,
  FinalizationTransitionResult,
} from "@/lib/finalization-state-transition-contract";
import type { FinalizationStateTransitionValidationResult } from "@/lib/finalization-state-transition-validator-contract";
import type { FinalizationValidationResult } from "@/lib/finalization-validator-contract";

type DryRunContext = {
  actionValidationResult: FinalizationActionValidationResult | null;
  candidate: FinalizationCandidate | null;
  finalizationValidationResult: FinalizationValidationResult | null;
  transitionValidationResult: FinalizationStateTransitionValidationResult | null;
  transitionResult: FinalizationTransitionResult | null;
  executionRecordCandidateMetadata: ExecutionRecordCandidate | null;
  auditContext: FinalizationTransitionAuditContext | null;
  persistenceBoundaryStatus: FinalizationTransitionBoundaryStatus | null;
};

// Pure deterministic dry-run. This function only describes proposed impacts.
// It does not run actions, finalize, persist, create execution records, update
// stats/PnL, append audit, rollback/correct, mutate trades, automate browser or
// Avanza behavior, or call broker APIs.
export function runFinalizationActionDryRun(
  input: FinalizationActionDryRunInput,
): FinalizationActionDryRunResult {
  const evaluatedAt = input.requestedAt;
  const context = buildContext(input);
  const blockedReasons = buildBlockedReasons(context);
  const warnings = buildWarnings(context, blockedReasons);
  const status = deriveStatus(context, blockedReasons);
  const validationSummary = buildValidationSummary(
    context,
    blockedReasons,
    warnings,
  );
  const impactSummary = buildImpactSummary(input, context, status, blockedReasons, warnings);

  return {
    contractVersion: FINALIZATION_ACTION_DRY_RUN_CONTRACT_VERSION,
    evaluatedAt,
    status,
    actionInput: input.actionInput ?? null,
    actionResult: input.actionResult ?? null,
    actionValidationResult: context.actionValidationResult,
    candidate: context.candidate,
    finalizationValidationResult: context.finalizationValidationResult,
    transitionValidationResult: context.transitionValidationResult,
    transitionResult: context.transitionResult,
    executionRecordCandidateMetadata:
      context.executionRecordCandidateMetadata,
    validationSummary,
    impactSummary,
    blockedReasons,
    warnings,
    safetyPolicy: FINALIZATION_ACTION_DRY_RUN_DEFAULT_SAFETY_POLICY,
    dryRunOnly: true,
    safeToRunFinalizationAction: false,
    safeToFinalize: false,
    safeToPersist: false,
    safeToCreateExecutionRecord: false,
    safeToUpdateStats: false,
    safeToAppendAudit: false,
    safeToRollback: false,
    safeToMutateTrade: false,
    automaticModeAllowed: false,
    dryRunExecuted: false,
    finalizationActionAttempted: false,
    finalizationAttempted: false,
    persistenceAttempted: false,
    executionRecordCreationAttempted: false,
    statsUpdateAttempted: false,
    auditAppendAttempted: false,
    rollbackAttempted: false,
    tradeMutationAttempted: false,
    browserAutomationAttempted: false,
    avanzaAutomationAttempted: false,
    brokerAutomationAttempted: false,
    metadata: {
      ...(input.metadata ?? {}),
      finalizationActionDryRunPure: true,
      proposedImpactOnly: true,
      writesAttempted: false,
      status,
    },
  };
}

function buildContext(input: FinalizationActionDryRunInput): DryRunContext {
  const actionValidationResult = input.actionValidationResult ?? null;
  const candidate =
    input.candidate ??
    actionValidationResult?.candidate ??
    input.actionInput?.candidate ??
    input.actionResult?.candidate ??
    null;
  const finalizationValidationResult =
    input.finalizationValidationResult ??
    actionValidationResult?.finalizationValidationResult ??
    input.actionInput?.finalizationValidationResult ??
    input.actionResult?.finalizationValidationResult ??
    null;
  const transitionValidationResult =
    input.transitionValidationResult ??
    actionValidationResult?.transitionValidationResult ??
    input.actionInput?.transitionValidationResult ??
    input.actionResult?.transitionValidationResult ??
    null;
  const transitionResult =
    input.transitionResult ??
    actionValidationResult?.transitionResult ??
    input.actionInput?.transitionResult ??
    input.actionResult?.transitionResult ??
    null;
  const executionRecordCandidateMetadata =
    input.executionRecordCandidateMetadata ??
    actionValidationResult?.executionRecordCandidateMetadata ??
    transitionValidationResult?.executionRecordCandidateMetadata ??
    input.actionInput?.executionRecordCandidateMetadata ??
    input.actionResult?.executionRecordCandidateMetadata ??
    candidate?.executionRecordMetadata?.executionRecordCandidate ??
    null;
  const auditContext =
    input.auditContext ??
    input.auditCorrectionMetadata?.auditContext ??
    actionValidationResult?.auditCorrectionValidation.auditContext ??
    input.actionInput?.auditContext ??
    input.actionResult?.auditReadiness.auditContext ??
    transitionResult?.auditContext ??
    transitionValidationResult?.auditCorrectionReadinessSummary.auditContext ??
    null;
  const persistenceBoundaryStatus =
    input.persistenceBoundaryStatus ??
    input.boundaryMetadata?.persistenceBoundaryStatus ??
    input.actionInput?.persistenceBoundaryStatus ??
    input.actionResult?.writeBoundaryReadiness.find(
      (boundary) => boundary.boundary === "persistence_write_boundary",
    )?.sourceBoundaryStatus ??
    transitionValidationResult?.boundaryReadinessSummary.persistenceBoundary ??
    null;

  return {
    actionValidationResult,
    candidate,
    finalizationValidationResult,
    transitionValidationResult,
    transitionResult,
    executionRecordCandidateMetadata,
    auditContext,
    persistenceBoundaryStatus,
  };
}

function buildBlockedReasons(
  context: DryRunContext,
): FinalizationActionDryRunBlockedReason[] {
  const reasons: FinalizationActionDryRunBlockedReason[] = [];

  if (!context.actionValidationResult) {
    addUnique(reasons, "missing_finalization_action_validation");
  }
  if (!context.candidate) {
    addUnique(reasons, "missing_finalization_candidate");
  }
  if (!context.transitionValidationResult) {
    addUnique(reasons, "missing_transition_validation");
  }

  for (const reason of context.actionValidationResult?.blockedReasons ?? []) {
    const mappedReason = mapValidationBlockedReason(reason);
    if (mappedReason) {
      addUnique(reasons, mappedReason);
    }
  }

  return reasons;
}

function mapValidationBlockedReason(
  reason: FinalizationActionBlockedReason,
): FinalizationActionDryRunBlockedReason | null {
  switch (reason) {
    case "missing_finalization_candidate":
      return "missing_finalization_candidate";
    case "missing_transition_validation":
      return "missing_transition_validation";
    case "manual_approval_missing":
      return "manual_approval_missing";
    case "write_boundary_unavailable":
      return "write_boundary_unavailable";
    case "audit_requirement_missing":
    case "correction_strategy_missing":
      return "missing_audit_correction_metadata";
    case "authority_flag_unexpectedly_true":
    case "persistence_coupling_detected":
    case "execution_record_coupling_detected":
    case "stats_update_coupling_detected":
    case "audit_append_coupling_detected":
    case "rollback_coupling_detected":
    case "trade_mutation_coupling_detected":
      return "unsafe_authority_flag";
    case "automatic_mode_not_allowed":
      return "unsupported_mode";
    case "finalization_action_not_enabled":
      return "finalization_action_not_enabled";
    case "missing_finalization_validation":
      return "missing_boundary_metadata";
  }
}

function buildWarnings(
  context: DryRunContext,
  blockedReasons: FinalizationActionDryRunBlockedReason[],
): FinalizationActionDryRunWarning[] {
  const warnings: FinalizationActionDryRunWarning[] = [
    "dry_run_only",
    "proposed_impact_not_write",
    "audit_required_before_write",
    "future_write_boundary_required",
    "trade_mutation_out_of_scope",
    "stats_update_out_of_scope",
  ];

  if (
    context.actionValidationResult?.status === "needs_review" ||
    context.transitionValidationResult?.status === "needs_review" ||
    blockedReasons.includes("manual_approval_missing")
  ) {
    addUnique(warnings, "manual_review_required");
  }

  return warnings;
}

function deriveStatus(
  context: DryRunContext,
  blockedReasons: FinalizationActionDryRunBlockedReason[],
): FinalizationActionDryRunStatus {
  if (
    blockedReasons.includes("missing_finalization_action_validation") ||
    blockedReasons.includes("missing_finalization_candidate") ||
    blockedReasons.includes("missing_transition_validation")
  ) {
    return "dry_run_blocked";
  }

  if (
    context.actionValidationResult?.status === "unsupported" ||
    context.transitionValidationResult?.status === "unsupported"
  ) {
    return "dry_run_unsupported";
  }

  if (
    blockedReasons.length > 0 ||
    context.actionValidationResult?.status === "blocked" ||
    context.transitionValidationResult?.status === "blocked"
  ) {
    return "dry_run_blocked";
  }

  if (
    context.actionValidationResult?.status === "needs_review" ||
    context.transitionValidationResult?.status === "needs_review"
  ) {
    return "dry_run_needs_review";
  }

  if (
    context.actionValidationResult?.status === "not_ready" ||
    context.transitionValidationResult?.status === "not_ready"
  ) {
    return "dry_run_not_ready";
  }

  if (context.actionValidationResult?.status === "action_candidate_valid") {
    return "dry_run_ready";
  }

  return "dry_run_not_ready";
}

function buildValidationSummary(
  context: DryRunContext,
  blockedReasons: FinalizationActionDryRunBlockedReason[],
  warnings: FinalizationActionDryRunWarning[],
): FinalizationActionDryRunValidationSummary {
  return {
    validationResultPresent: Boolean(context.actionValidationResult),
    validationStatus: context.actionValidationResult?.status ?? null,
    finalizationValidationStatus:
      context.finalizationValidationResult?.status ?? null,
    transitionValidationStatus:
      context.transitionValidationResult?.status ?? null,
    actionCandidateValid:
      context.actionValidationResult?.status === "action_candidate_valid",
    requiresManualReview:
      context.actionValidationResult?.decisionRecommendation
        .requiresManualReview ?? true,
    blockedReasons,
    warnings,
    metadata: {
      candidatePresent: Boolean(context.candidate),
      transitionValidationPresent: Boolean(context.transitionValidationResult),
      dryRunOnly: true,
    },
  };
}

function buildImpactSummary(
  input: FinalizationActionDryRunInput,
  context: DryRunContext,
  status: FinalizationActionDryRunStatus,
  blockedReasons: FinalizationActionDryRunBlockedReason[],
  warnings: FinalizationActionDryRunWarning[],
): FinalizationActionDryRunImpactSummary {
  const finalizationImpact = buildFinalizationImpact(
    context,
    status,
    blockedReasons,
    warnings,
  );
  const executionRecordImpact = buildExecutionRecordImpact(
    context,
    status,
    blockedReasons,
    warnings,
  );
  const persistenceImpact = buildPersistenceImpact(
    context,
    status,
    blockedReasons,
    warnings,
  );
  const statsPnlImpact = buildStatsPnlImpact(
    context,
    status,
    blockedReasons,
    warnings,
  );
  const auditImpact = buildAuditImpact(
    input,
    context,
    status,
    blockedReasons,
    warnings,
  );
  const correctionImpact = buildCorrectionImpact(
    input,
    status,
    blockedReasons,
    warnings,
  );
  const tradeMutationImpact = buildTradeMutationImpact();

  return {
    finalizationImpact,
    executionRecordImpact,
    persistenceImpact,
    statsPnlImpact,
    auditImpact,
    correctionImpact,
    tradeMutationImpact,
    allImpactsDescriptiveOnly: true,
    writesAttempted: false,
    metadata: {
      status,
      proposedImpactOnly: true,
      safeToApply: false,
    },
  };
}

function buildImpactBase<K extends FinalizationActionDryRunProposedImpact["kind"]>(
  kind: K,
  status: FinalizationActionDryRunStatus,
  blockedReasons: FinalizationActionDryRunBlockedReason[],
  warnings: FinalizationActionDryRunWarning[],
  summary: string,
): FinalizationActionDryRunProposedImpact & { kind: K } {
  const disposition = impactDisposition(status);

  return {
    kind,
    disposition,
    descriptiveOnly: true,
    proposed: status === "dry_run_ready",
    safeToApply: false,
    blockedReasons: blockedReasons.length > 0 ? blockedReasons : undefined,
    warnings,
    summary,
    metadata: {
      dryRunOnly: true,
      proposedImpactNotWriteAuthority: true,
    },
  };
}

function buildFinalizationImpact(
  context: DryRunContext,
  status: FinalizationActionDryRunStatus,
  blockedReasons: FinalizationActionDryRunBlockedReason[],
  warnings: FinalizationActionDryRunWarning[],
): FinalizationActionDryRunFinalizationImpact {
  const proposedTargetState =
    context.transitionValidationResult?.proposedTargetState ??
    context.transitionResult?.targetState ??
    null;

  return {
    ...buildImpactBase(
      "finalization",
      status,
      blockedReasons,
      warnings,
      "Describes the finalization state impact only; no finalization is attempted.",
    ),
    candidateId: context.candidate?.candidateId ?? null,
    currentState: context.finalizationValidationResult?.status ?? null,
    proposedTargetState,
    transitionResult: context.transitionResult,
    finalizationWouldBeMarkedComplete:
      status === "dry_run_ready" && proposedTargetState === "finalized",
    finalizationAttempted: false,
  };
}

function buildExecutionRecordImpact(
  context: DryRunContext,
  status: FinalizationActionDryRunStatus,
  blockedReasons: FinalizationActionDryRunBlockedReason[],
  warnings: FinalizationActionDryRunWarning[],
): FinalizationActionDryRunExecutionRecordImpact {
  return {
    ...buildImpactBase(
      "execution_record",
      status,
      blockedReasons,
      warnings,
      "Describes the execution-record candidate impact only; no record is created or updated.",
    ),
    executionRecordCandidate: context.executionRecordCandidateMetadata,
    proposedRecordFingerprint:
      context.executionRecordCandidateMetadata?.recordFingerprint ??
      context.candidate?.executionRecordMetadata?.recordFingerprint ??
      null,
    proposedIdempotencyKey:
      context.executionRecordCandidateMetadata?.idempotencyKey ??
      context.candidate?.executionRecordMetadata?.idempotencyKey ??
      null,
    wouldCreateExecutionRecord:
      status === "dry_run_ready" &&
      Boolean(context.executionRecordCandidateMetadata),
    wouldUpdateExecutionRecord: false,
    executionRecordCreationAttempted: false,
  };
}

function buildPersistenceImpact(
  context: DryRunContext,
  status: FinalizationActionDryRunStatus,
  blockedReasons: FinalizationActionDryRunBlockedReason[],
  warnings: FinalizationActionDryRunWarning[],
): FinalizationActionDryRunPersistenceImpact {
  return {
    ...buildImpactBase(
      "persistence",
      status,
      blockedReasons,
      warnings,
      "Describes the future persistence impact only; no storage boundary is invoked.",
    ),
    targetBoundary: context.persistenceBoundaryStatus,
    proposedStorageTarget: "execution_records",
    proposedRecordFingerprint:
      context.executionRecordCandidateMetadata?.recordFingerprint ??
      context.candidate?.executionRecordMetadata?.recordFingerprint ??
      null,
    wouldPersist: status === "dry_run_ready",
    persistenceAttempted: false,
  };
}

function buildStatsPnlImpact(
  context: DryRunContext,
  status: FinalizationActionDryRunStatus,
  blockedReasons: FinalizationActionDryRunBlockedReason[],
  warnings: FinalizationActionDryRunWarning[],
): FinalizationActionDryRunStatsPnLImpact {
  const candidate = context.candidate;
  const fxRate = candidate?.fxSummary.fxRates.at(0)?.rate ?? null;

  return {
    ...buildImpactBase(
      "stats_pnl",
      status,
      blockedReasons,
      warnings,
      "Describes potential stats/PnL inputs only; no stats or PnL state is updated.",
    ),
    proposedQuantity: candidate?.settlementSummary.quantity ?? null,
    proposedExecutionPrice:
      candidate?.settlementSummary.executionPrice?.value ?? null,
    proposedFees: candidate?.feeSummary.totalFees?.value ?? null,
    proposedFxRate: fxRate,
    proposedRealizedPnl:
      candidate?.pnlAdjustmentSummary.realizedPnL?.value ?? null,
    proposedCurrency:
      candidate?.settlementSummary.currency ??
      candidate?.settlementSummary.executionPrice?.currency ??
      null,
    wouldUpdateStats: status === "dry_run_ready",
    statsUpdateAttempted: false,
  };
}

function buildAuditImpact(
  input: FinalizationActionDryRunInput,
  context: DryRunContext,
  status: FinalizationActionDryRunStatus,
  blockedReasons: FinalizationActionDryRunBlockedReason[],
  warnings: FinalizationActionDryRunWarning[],
): FinalizationActionDryRunAuditImpact {
  const sourceEvidenceReferences = [
    input.auditCorrectionMetadata?.sourceEvidenceReference ?? null,
    context.candidate?.evidenceSummary.sourceReference?.evidenceFingerprint ??
      null,
    context.candidate?.evidenceSummary.provisionalEvidenceFingerprint ?? null,
    context.candidate?.evidenceSummary.finalNoteEvidenceFingerprint ?? null,
  ].filter(isNonEmptyString);

  return {
    ...buildImpactBase(
      "audit",
      status,
      blockedReasons,
      warnings,
      "Describes audit fields that would be needed before a future write; no audit event is appended.",
    ),
    auditContext: context.auditContext,
    proposedAuditEventTypes: ["finalization_action_dry_run"],
    sourceEvidenceReferences,
    beforeStateReference:
      input.auditCorrectionMetadata?.beforeStateReference ?? null,
    afterStateReference:
      input.auditCorrectionMetadata?.afterStateReference ?? null,
    manualApprovalReference:
      input.manualApprovalContext?.approvalReference ??
      input.approvalContext?.approvalReference ??
      input.actionInput?.approvalContext?.approvalReference ??
      input.actionResult?.approvalContext?.approvalReference ??
      null,
    wouldAppendAudit: status === "dry_run_ready",
    auditAppendAttempted: false,
  };
}

function buildCorrectionImpact(
  input: FinalizationActionDryRunInput,
  status: FinalizationActionDryRunStatus,
  blockedReasons: FinalizationActionDryRunBlockedReason[],
  warnings: FinalizationActionDryRunWarning[],
): FinalizationActionDryRunCorrectionImpact {
  return {
    ...buildImpactBase(
      "correction",
      status,
      blockedReasons,
      warnings,
      "Describes correction and rollback metadata only; no rollback or correction is attempted.",
    ),
    correctionStrategyReference:
      input.auditCorrectionMetadata?.correctionStrategyReference ?? null,
    rollbackOrAmendmentPathReference:
      input.correctionRollbackBoundaryStatus?.reason ?? null,
    duplicateCorrectionPreventionReference:
      input.auditCorrectionMetadata?.duplicatePreventionReference ?? null,
    correctionAuditTrailReference:
      input.auditCorrectionMetadata?.auditContext?.auditReference ?? null,
    wouldRollback: false,
    wouldCorrect: status === "dry_run_ready",
    rollbackAttempted: false,
  };
}

function buildTradeMutationImpact(): FinalizationActionDryRunTradeMutationImpact {
  return {
    kind: "trade_mutation",
    disposition: "out_of_scope",
    descriptiveOnly: true,
    proposed: false,
    safeToApply: false,
    warnings: ["trade_mutation_out_of_scope"],
    summary:
      "Trade mutation is outside finalization action dry-run scope and is never proposed.",
    wouldMutateTrade: false,
    tradeMutationAttempted: false,
    outOfScopeReason:
      "Finalization action dry-run does not mutate trades or authorize trade mutation.",
  };
}

function impactDisposition(
  status: FinalizationActionDryRunStatus,
): FinalizationActionDryRunImpactDisposition {
  if (status === "dry_run_ready") {
    return "descriptive_only";
  }
  if (status === "dry_run_needs_review") {
    return "needs_review";
  }

  return "blocked";
}

function addUnique<T>(items: T[], item: T) {
  if (!items.includes(item)) {
    items.push(item);
  }
}

function isNonEmptyString(value: string | null): value is string {
  return typeof value === "string" && value.length > 0;
}
