import {
  EXECUTION_RECORD_FINALIZATION_BRIDGE_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordFinalizationBridgeValidationResult,
} from "@/lib/execution-record-finalization-bridge-validator-contract";
import { validateExecutionRecordFinalizationBridge } from "@/lib/execution-record-finalization-bridge-validator";
import {
  buildFinalizationActionDevFixtureResult,
  type FinalizationActionDevFixtureResult,
} from "@/lib/finalization-action-dev-fixture";
import {
  FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_CONTRACT_VERSION,
  type FinalizationToExecutionRecordBridgeInput,
  type FinalizationToExecutionRecordBridgeResult,
} from "@/lib/finalization-to-execution-record-bridge-contract";
import { mapFinalizationToExecutionRecordBridge } from "@/lib/finalization-to-execution-record-bridge-mapper";

const FINALIZATION_EXECUTION_RECORD_BRIDGE_DEV_FIXTURE_TIMESTAMP =
  "2026-06-16T13:10:00.000Z";

export type FinalizationExecutionRecordBridgeDevFixtureResult = {
  finalizationActionFixture: FinalizationActionDevFixtureResult;
  bridgeInput: FinalizationToExecutionRecordBridgeInput;
  bridgeResult: FinalizationToExecutionRecordBridgeResult;
  validatorResult: ExecutionRecordFinalizationBridgeValidationResult;
  metadata: {
    fixtureOnly: true;
    explicitTriggerOnly: true;
    readOnlyPreview: true;
    pureMapperOnly: true;
    pureValidatorOnly: true;
    noLiveAvanzaData: true;
    noCapture: true;
    noBrowserAutomation: true;
    noAvanzaBehavior: true;
    noBrokerOrderBehavior: true;
    noExecutionRecordCandidateBuilder: true;
    noExecutionRecordCreated: true;
    noPersistence: true;
    noSupabaseWrite: true;
    noLocalStorageWrite: true;
    noAuditAppend: true;
    noStatsUpdate: true;
    noRollbackCorrection: true;
    noTradeMutation: true;
  };
};

export function buildFinalizationExecutionRecordBridgeDevFixtureResult(): FinalizationExecutionRecordBridgeDevFixtureResult {
  const finalizationActionFixture = buildFinalizationActionDevFixtureResult();
  const candidate =
    finalizationActionFixture.finalizationCandidateBuilderResult.candidate;

  const bridgeInput: FinalizationToExecutionRecordBridgeInput = {
    contractVersion: FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_CONTRACT_VERSION,
    requestedAt: FINALIZATION_EXECUTION_RECORD_BRIDGE_DEV_FIXTURE_TIMESTAMP,
    immediateBrokerReadback:
      candidate?.sourceReferences.provisionalImmediateReadbackEvidence ?? null,
    brokerExecutionResultCandidate:
      candidate?.sourceReferences.brokerExecutionResultCandidate ?? null,
    finalSettlementNoteMatch:
      candidate?.sourceReferences.finalSettlementNoteMatchingResult ?? null,
    finalizationCandidate: candidate ?? null,
    finalizationValidationResult:
      finalizationActionFixture.finalizationValidationResult,
    transitionValidationResult:
      finalizationActionFixture.transitionValidationResult,
    actionValidationResult: finalizationActionFixture.actionValidationResult,
    actionDryRunResult: finalizationActionFixture.dryRunResult,
    brokerPayloadHandoffMetadata: candidate
      ? {
          handoffPayloadFingerprint:
            candidate.evidenceSummary.handoffPayloadFingerprint,
          recommendationId: candidate.sourceReferences.recommendationId,
          positionId: candidate.sourceReferences.positionId,
          executionMode: "semi_automatic",
          sourceEnvironment: "local_dev",
        }
      : null,
    manualApprovalContext:
      finalizationActionFixture.actionValidationInput.manualApprovalContext ??
      null,
    auditCorrectionMetadata:
      finalizationActionFixture.actionValidationInput.auditCorrectionMetadata ??
      null,
    existingExecutionRecordCandidateMetadata: null,
    metadata: {
      source: "finalization_execution_record_bridge_dev_fixture",
      fixtureOnly: true,
      explicitTriggerOnly: true,
      readOnlyPreview: true,
      pureMapperOnly: true,
      pureValidatorOnly: true,
      noExecutionRecordCandidateBuilder: true,
      noExecutionRecordCreated: true,
      noPersistence: true,
      noSupabaseWrite: true,
      noLocalStorageWrite: true,
      noAuditAppend: true,
      noStatsUpdate: true,
      noRollbackCorrection: true,
      noTradeMutation: true,
      noLiveAvanzaData: true,
      noCapture: true,
      noBrowserAutomation: true,
      noAvanzaBehavior: true,
      noBrokerOrderBehavior: true,
    },
  };
  const bridgeResult = mapFinalizationToExecutionRecordBridge(bridgeInput);
  const validatorResult = validateExecutionRecordFinalizationBridge({
    contractVersion:
      EXECUTION_RECORD_FINALIZATION_BRIDGE_VALIDATOR_CONTRACT_VERSION,
    requestedAt: FINALIZATION_EXECUTION_RECORD_BRIDGE_DEV_FIXTURE_TIMESTAMP,
    bridgeResult,
    originalBridgeInput: bridgeInput,
    finalizationCandidate: bridgeInput.finalizationCandidate,
    finalSettlementNoteMatch: bridgeInput.finalSettlementNoteMatch,
    finalizationValidationResult: bridgeInput.finalizationValidationResult,
    transitionValidationResult: bridgeInput.transitionValidationResult,
    actionValidationResult: bridgeInput.actionValidationResult,
    actionDryRunResult: bridgeInput.actionDryRunResult,
    auditCorrectionMetadata: bridgeInput.auditCorrectionMetadata,
    manualApprovalContext: bridgeInput.manualApprovalContext,
    metadata: {
      source: "finalization_execution_record_bridge_dev_fixture",
      fixtureOnly: true,
      explicitTriggerOnly: true,
      readOnlyPreview: true,
    },
  });

  return {
    finalizationActionFixture,
    bridgeInput,
    bridgeResult,
    validatorResult,
    metadata: {
      fixtureOnly: true,
      explicitTriggerOnly: true,
      readOnlyPreview: true,
      pureMapperOnly: true,
      pureValidatorOnly: true,
      noLiveAvanzaData: true,
      noCapture: true,
      noBrowserAutomation: true,
      noAvanzaBehavior: true,
      noBrokerOrderBehavior: true,
      noExecutionRecordCandidateBuilder: true,
      noExecutionRecordCreated: true,
      noPersistence: true,
      noSupabaseWrite: true,
      noLocalStorageWrite: true,
      noAuditAppend: true,
      noStatsUpdate: true,
      noRollbackCorrection: true,
      noTradeMutation: true,
    },
  };
}
