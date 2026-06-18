import {
  FINALIZATION_ACTION_CONTRACT_VERSION,
  FINALIZATION_ACTION_DEFAULT_AUTHORITY,
  type FinalizationActionInput,
} from "@/lib/finalization-action-contract";
import { runFinalizationActionDryRun } from "@/lib/finalization-action-dry-run";
import {
  FINALIZATION_ACTION_DRY_RUN_CONTRACT_VERSION,
  type FinalizationActionDryRunInput,
  type FinalizationActionDryRunResult,
} from "@/lib/finalization-action-dry-run-contract";
import { validateFinalizationAction } from "@/lib/finalization-action-validator";
import {
  FINALIZATION_ACTION_VALIDATOR_CONTRACT_VERSION,
  type FinalizationActionValidationResult,
  type FinalizationActionValidatorInput,
} from "@/lib/finalization-action-validator-contract";
import {
  buildFinalizationCandidateDevFixtureResult,
} from "@/lib/finalization-candidate-dev-fixture";
import type { FinalizationCandidateBuilderResult } from "@/lib/finalization-candidate-builder-contract";
import type {
  FinalizationTransitionAuditContext,
  FinalizationTransitionBoundaryStatus,
} from "@/lib/finalization-state-transition-contract";
import { validateFinalizationStateTransition } from "@/lib/finalization-state-transition-validator";
import {
  FINALIZATION_STATE_TRANSITION_VALIDATOR_CONTRACT_VERSION,
  type FinalizationStateTransitionValidationResult,
  type FinalizationStateTransitionValidatorInput,
} from "@/lib/finalization-state-transition-validator-contract";
import { validateFinalizationCandidate } from "@/lib/finalization-validator";
import {
  FINALIZATION_VALIDATOR_CONTRACT_VERSION,
  type FinalizationValidationResult,
  type FinalizationValidatorInput,
} from "@/lib/finalization-validator-contract";

const FINALIZATION_ACTION_DEV_FIXTURE_TIMESTAMP =
  "2026-06-16T12:20:00.000Z";

export type FinalizationActionDevFixtureResult = {
  finalizationCandidateBuilderResult: FinalizationCandidateBuilderResult;
  finalizationValidationResult: FinalizationValidationResult;
  transitionValidationResult: FinalizationStateTransitionValidationResult;
  actionInput: FinalizationActionInput;
  actionValidationInput: FinalizationActionValidatorInput;
  actionValidationResult: FinalizationActionValidationResult;
  dryRunInput: FinalizationActionDryRunInput;
  dryRunResult: FinalizationActionDryRunResult;
  metadata: {
    fixtureOnly: true;
    explicitTriggerOnly: true;
    readOnlyPreview: true;
    pureValidatorOnly: true;
    pureDryRunOnly: true;
    noLiveAvanzaData: true;
    noCapture: true;
    noBrowserAutomation: true;
    noAvanzaBehavior: true;
    noFinalizationAction: true;
    noFinalization: true;
    noPersistence: true;
    noSupabaseWrite: true;
    noLocalStorageWrite: true;
    noAuditAppend: true;
    noExecutionRecordCreated: true;
    noStatsUpdate: true;
    noRollbackCorrection: true;
    noTradeMutation: true;
    noBrokerOrderBehavior: true;
  };
};

function boundaryStatus(
  reason = "No write boundary requested for finalization action dev preview.",
): FinalizationTransitionBoundaryStatus {
  return {
    available: false,
    status: "not_required",
    reason,
  };
}

function auditContext(
  candidateFingerprint: string | null,
  validatorResultReference: string | null,
): FinalizationTransitionAuditContext {
  return {
    auditRequired: true,
    auditStrategyAvailable: true,
    sourceEvidenceTraceable: true,
    beforeAfterValuesKnown: true,
    duplicatePreventionAvailable: true,
    correctionStrategyAvailable: true,
    auditReference: "finalization-action-dev-preview-audit",
    candidateFingerprint,
    validatorResultReference,
    metadata: {
      fixtureOnly: true,
      previewOnly: true,
      noAuditAppend: true,
    },
  };
}

export function buildFinalizationActionDevFixtureResult(): FinalizationActionDevFixtureResult {
  const finalizationCandidateBuilderResult =
    buildFinalizationCandidateDevFixtureResult();
  const candidate = finalizationCandidateBuilderResult.candidate ?? null;
  const finalizationValidationInput: FinalizationValidatorInput = {
    contractVersion: FINALIZATION_VALIDATOR_CONTRACT_VERSION,
    requestedAt: FINALIZATION_ACTION_DEV_FIXTURE_TIMESTAMP,
    candidate,
    builderResult: finalizationCandidateBuilderResult,
    finalSettlementNoteMatchingResult:
      candidate?.sourceReferences.finalSettlementNoteMatchingResult ?? null,
    provisionalTradeContext: {
      provisionalTradeId: "finalization-action-dev-preview-trade-001",
      recommendationId: "finalization-action-dev-preview-recommendation-001",
      positionId: "finalization-action-dev-preview-position-001",
      ticker: "ERIC B",
      instrumentName: "Ericsson B",
      side: "buy",
      quantity: 12,
      status: "final_note_pending",
    },
    executionRecordCandidateMetadata:
      candidate?.executionRecordMetadata?.executionRecordCandidate ?? null,
    metadata: {
      fixtureOnly: true,
      source: "finalization_action_dev_preview_fixture",
      readOnlyPreview: true,
      noFinalization: true,
      noPersistence: true,
      noExecutionRecordCreated: true,
      noStatsUpdate: true,
      noTradeMutation: true,
    },
  };
  const finalizationValidationResult = validateFinalizationCandidate(
    finalizationValidationInput,
  );
  const previewAuditContext = auditContext(
    candidate?.candidateId ?? null,
    finalizationValidationResult.evaluatedAt,
  );
  const transitionValidationInput: FinalizationStateTransitionValidatorInput = {
    contractVersion: FINALIZATION_STATE_TRANSITION_VALIDATOR_CONTRACT_VERSION,
    requestedAt: FINALIZATION_ACTION_DEV_FIXTURE_TIMESTAMP,
    transitionInput: null,
    validationResult: finalizationValidationResult,
    candidate,
    sourceState: finalizationValidationResult.status,
    proposedTargetState: "finalization_review_ready",
    persistenceBoundaryStatus: boundaryStatus(),
    executionRecordBoundaryStatus: boundaryStatus(),
    statsPnlBoundaryStatus: boundaryStatus(),
    tradeMutationBoundaryStatus: boundaryStatus(),
    auditAppendBoundaryStatus: boundaryStatus(),
    correctionRollbackBoundaryStatus: boundaryStatus(),
    approvalContext: {
      approvalRequired: true,
      approved: true,
      approvedBy: "dev-preview-manual-reviewer",
      approvedAt: FINALIZATION_ACTION_DEV_FIXTURE_TIMESTAMP,
      approvalReference: "finalization-action-dev-preview-transition-approval",
      approvalNotes: "Preview fixture approval metadata only.",
    },
    auditContext: previewAuditContext,
    executionRecordCandidateMetadata:
      candidate?.executionRecordMetadata?.executionRecordCandidate ?? null,
    metadata: {
      fixtureOnly: true,
      source: "finalization_action_dev_preview_fixture",
      previewOnly: true,
      noTransitionApplied: true,
      noFinalization: true,
      noPersistence: true,
      noExecutionRecordCreated: true,
      noStatsUpdate: true,
      noTradeMutation: true,
    },
  };
  const transitionValidationResult = validateFinalizationStateTransition(
    transitionValidationInput,
  );
  const actionInput: FinalizationActionInput = {
    contractVersion: FINALIZATION_ACTION_CONTRACT_VERSION,
    requestedAt: FINALIZATION_ACTION_DEV_FIXTURE_TIMESTAMP,
    mode: "dry_run",
    candidate,
    finalizationValidationResult,
    transitionValidationResult,
    transitionResult: null,
    executionRecordCandidateMetadata:
      candidate?.executionRecordMetadata?.executionRecordCandidate ?? null,
    persistenceBoundaryStatus: boundaryStatus(),
    executionRecordBoundaryStatus: boundaryStatus(),
    statsPnlBoundaryStatus: boundaryStatus(),
    tradeMutationBoundaryStatus: boundaryStatus(),
    auditAppendBoundaryStatus: boundaryStatus(),
    correctionRollbackBoundaryStatus: boundaryStatus(),
    approvalContext: {
      approvalRequired: true,
      approved: true,
      approvedBy: "dev-preview-manual-reviewer",
      approvedAt: FINALIZATION_ACTION_DEV_FIXTURE_TIMESTAMP,
      approvalReference: "finalization-action-dev-preview-approval",
      approvalNotes: "Preview fixture approval metadata only.",
    },
    auditContext: previewAuditContext,
    authority: FINALIZATION_ACTION_DEFAULT_AUTHORITY,
    metadata: {
      fixtureOnly: true,
      source: "finalization_action_dev_preview_fixture",
      readOnlyPreview: true,
      noFinalizationAction: true,
      noFinalization: true,
      noPersistence: true,
      noExecutionRecordCreated: true,
      noStatsUpdate: true,
      noAuditAppend: true,
      noRollbackCorrection: true,
      noTradeMutation: true,
    },
  };
  const actionValidationInput: FinalizationActionValidatorInput = {
    contractVersion: FINALIZATION_ACTION_VALIDATOR_CONTRACT_VERSION,
    requestedAt: FINALIZATION_ACTION_DEV_FIXTURE_TIMESTAMP,
    actionInput,
    actionResult: null,
    candidate,
    finalizationValidationResult,
    transitionValidationResult,
    transitionResult: null,
    executionRecordCandidateMetadata:
      actionInput.executionRecordCandidateMetadata ?? null,
    boundaryMetadata: {
      persistenceBoundaryStatus: actionInput.persistenceBoundaryStatus,
      executionRecordBoundaryStatus: actionInput.executionRecordBoundaryStatus,
      statsPnlBoundaryStatus: actionInput.statsPnlBoundaryStatus,
      auditAppendBoundaryStatus: actionInput.auditAppendBoundaryStatus,
      correctionRollbackBoundaryStatus:
        actionInput.correctionRollbackBoundaryStatus,
      tradeMutationBoundaryStatus: actionInput.tradeMutationBoundaryStatus,
      metadataPresentWhenRelevant: true,
      missingBoundaryMetadata: [],
    },
    manualApprovalContext: {
      approvalRequired: true,
      approvalPresent: actionInput.approvalContext?.approved === true,
      approvalContext: actionInput.approvalContext ?? null,
      approvalIsWriteAuthority: false,
      approvedBy: actionInput.approvalContext?.approvedBy,
      approvedAt: actionInput.approvalContext?.approvedAt,
      approvalReference: actionInput.approvalContext?.approvalReference,
    },
    auditCorrectionMetadata: {
      auditRequired: true,
      correctionRollbackRequired: true,
      auditContext: actionInput.auditContext ?? null,
      beforeStateReference: "finalization-action-dev-preview-before-state",
      afterStateReference: "finalization-action-dev-preview-after-state",
      sourceEvidenceReference:
        candidate?.evidenceSummary.sourceReference?.evidenceFingerprint ??
        "finalization-action-dev-preview-source-evidence",
      duplicatePreventionReference:
        "finalization-action-dev-preview-duplicate-prevention",
      correctionStrategyReference:
        "finalization-action-dev-preview-correction-strategy",
    },
    metadata: {
      fixtureOnly: true,
      source: "finalization_action_dev_preview_fixture",
      readOnlyPreview: true,
      noFinalizationAction: true,
      noPersistence: true,
      noAuditAppend: true,
      noTradeMutation: true,
    },
  };
  const actionValidationResult = validateFinalizationAction(
    actionValidationInput,
  );
  const dryRunInput: FinalizationActionDryRunInput = {
    contractVersion: FINALIZATION_ACTION_DRY_RUN_CONTRACT_VERSION,
    requestedAt: FINALIZATION_ACTION_DEV_FIXTURE_TIMESTAMP,
    actionInput,
    actionResult: null,
    actionValidationResult,
    candidate,
    finalizationValidationResult,
    transitionValidationResult,
    transitionResult: null,
    executionRecordCandidateMetadata:
      actionValidationResult.executionRecordCandidateMetadata ?? null,
    boundaryMetadata: actionValidationInput.boundaryMetadata,
    persistenceBoundaryStatus: actionInput.persistenceBoundaryStatus,
    executionRecordBoundaryStatus: actionInput.executionRecordBoundaryStatus,
    statsPnlBoundaryStatus: actionInput.statsPnlBoundaryStatus,
    auditAppendBoundaryStatus: actionInput.auditAppendBoundaryStatus,
    correctionRollbackBoundaryStatus:
      actionInput.correctionRollbackBoundaryStatus,
    tradeMutationBoundaryStatus: actionInput.tradeMutationBoundaryStatus,
    auditCorrectionMetadata: actionValidationInput.auditCorrectionMetadata,
    auditContext: actionInput.auditContext ?? null,
    manualApprovalContext: actionValidationInput.manualApprovalContext,
    approvalContext: actionInput.approvalContext ?? null,
    metadata: {
      fixtureOnly: true,
      source: "finalization_action_dev_preview_fixture",
      readOnlyPreview: true,
      explicitTriggerOnly: true,
      noFinalizationAction: true,
      noFinalization: true,
      noPersistence: true,
      noSupabaseWrite: true,
      noLocalStorageWrite: true,
      noAuditAppend: true,
      noExecutionRecordCreated: true,
      noStatsUpdate: true,
      noRollbackCorrection: true,
      noTradeMutation: true,
      noBrokerOrderBehavior: true,
    },
  };
  const dryRunResult = runFinalizationActionDryRun(dryRunInput);

  return {
    finalizationCandidateBuilderResult,
    finalizationValidationResult,
    transitionValidationResult,
    actionInput,
    actionValidationInput,
    actionValidationResult,
    dryRunInput,
    dryRunResult,
    metadata: {
      fixtureOnly: true,
      explicitTriggerOnly: true,
      readOnlyPreview: true,
      pureValidatorOnly: true,
      pureDryRunOnly: true,
      noLiveAvanzaData: true,
      noCapture: true,
      noBrowserAutomation: true,
      noAvanzaBehavior: true,
      noFinalizationAction: true,
      noFinalization: true,
      noPersistence: true,
      noSupabaseWrite: true,
      noLocalStorageWrite: true,
      noAuditAppend: true,
      noExecutionRecordCreated: true,
      noStatsUpdate: true,
      noRollbackCorrection: true,
      noTradeMutation: true,
      noBrokerOrderBehavior: true,
    },
  };
}
