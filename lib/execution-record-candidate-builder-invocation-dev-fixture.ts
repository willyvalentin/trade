import {
  EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_CONTRACT_VERSION,
  EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DEFAULT_SAFETY_POLICY,
  type ExecutionRecordCandidateBuilderInvocationResult,
} from "@/lib/execution-record-candidate-builder-invocation-contract";
import {
  EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordCandidateBuilderInvocationValidationResult,
} from "@/lib/execution-record-candidate-builder-invocation-validator-contract";
import { invokeExecutionRecordCandidateBuilder } from "@/lib/execution-record-candidate-builder-invocation";
import { validateExecutionRecordCandidateBuilderInvocation } from "@/lib/execution-record-candidate-builder-invocation-validator";
import {
  buildExecutionRecordCandidateBuilderIntegrationDevFixtureResult,
  type ExecutionRecordCandidateBuilderIntegrationDevFixtureResult,
} from "@/lib/execution-record-candidate-builder-integration-dev-fixture";
import type { ExecutionRecordCreationInput } from "@/lib/execution-record-creation-contract";

const EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DEV_FIXTURE_TIMESTAMP =
  "2026-06-16T13:25:00.000Z";

export type ExecutionRecordCandidateBuilderInvocationDevFixtureResult = {
  integrationFixture: ExecutionRecordCandidateBuilderIntegrationDevFixtureResult;
  invocationResult: ExecutionRecordCandidateBuilderInvocationResult;
  validatorResult: ExecutionRecordCandidateBuilderInvocationValidationResult;
  metadata: {
    fixtureOnly: true;
    explicitTriggerOnly: true;
    readOnlyPreview: true;
    invocationBoundaryOnly: true;
    invokesPureWrapper: true;
    candidateBuilderCalledThroughPureWrapper: boolean;
    noDirectBuildExecutionRecordCandidateCall: true;
    noExecutionRecordCandidatePersisted: true;
    noExecutionRecordCreated: true;
    noPersistence: true;
    noSupabaseWrite: true;
    noLocalStorageWrite: true;
    noAuditAppend: true;
    noStatsUpdate: true;
    noRollbackCorrection: true;
    noTradeMutation: true;
    noLiveAvanzaData: true;
    noCapture: true;
    noBrowserAutomation: true;
    noAvanzaBehavior: true;
    noBrokerOrderBehavior: true;
  };
};

function buildInvocationResult(
  integrationFixture: ExecutionRecordCandidateBuilderIntegrationDevFixtureResult,
): ExecutionRecordCandidateBuilderInvocationResult {
  const { adapterResult, validatorResult } = integrationFixture;
  const proposedCreationInput =
    adapterResult.proposedInputSummary
      .proposedCreationInput as ExecutionRecordCreationInput | null;

  return {
    contractVersion: EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_CONTRACT_VERSION,
    evaluatedAt: EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DEV_FIXTURE_TIMESTAMP,
    status: "builder_invocation_ready",
    decisionRecommendation: "candidate_builder_invocation_contract_only",
    input: {
      contractVersion:
        EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_CONTRACT_VERSION,
      requestedAt:
        EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DEV_FIXTURE_TIMESTAMP,
      adapterResult,
      adapterInput: adapterResult.input,
      adapterValidationResult: validatorResult,
      proposedCreationInput,
      integrationInput: adapterResult.input?.integrationInput ?? null,
      integrationResult: adapterResult.input?.integrationResult ?? null,
      bridgeValidationResult:
        adapterResult.input?.bridgeValidationResult ?? null,
      bridgeMapperResult: adapterResult.input?.bridgeMapperResult ?? null,
      finalizationCandidate: adapterResult.input?.finalizationCandidate ?? null,
      idempotencyMetadata: adapterResult.idempotencySummary,
      auditProvenanceMetadata: adapterResult.auditProvenanceSummary,
      manualApprovalMetadata:
        adapterResult.auditProvenanceSummary.manualApprovalContext ?? null,
      schemaReadinessMetadata: adapterResult.schemaReadinessSummary,
      safetyPolicy:
        EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DEFAULT_SAFETY_POLICY,
      metadata: {
        fixtureOnly: true,
        invocationBoundaryOnly: true,
        validationPreflightOnly: true,
        noBuilderInvocationBeforeValidation: true,
        noPersistence: true,
      },
    },
    prerequisiteSummary: {
      adapterResultPresent: true,
      adapterValidationResultPresent: true,
      adapterValidationValid: validatorResult.status === "adapter_validation_valid",
      reviewGateExplicitlyAllowed: false,
      proposedCreationInputPresent: proposedCreationInput !== null,
      proposedCreationInputComplete: proposedCreationInput !== null,
      requiredBuilderInputFieldsPresent: proposedCreationInput !== null,
      missingRequiredBuilderInputFields: proposedCreationInput ? [] : ["proposedCreationInput"],
      schemaReadinessAcknowledged: true,
      generatedTypesStatusAcknowledged: true,
      migrationApplicationStatusAcknowledged: true,
      idempotencyMetadataPresent: true,
      auditProvenanceMetadataPresent: true,
      manualApprovalRequired: true,
      manualApprovalPresent: true,
      supportedSource: true,
      supportedBroker: true,
      allAuthorityFlagsFalse: true,
      noWriteAuthorityRequested: true,
      canConsiderCandidateOnlyInvocation: true,
      safeToCallCandidateBuilder: false,
      safeToCreateExecutionRecordCandidate: false,
      safeToCreateExecutionRecord: false,
      safeToPersist: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
        builderInvocationRequiresValidation: true,
      },
    },
    inputSourceSummary: {
      adapterInput: adapterResult.input,
      adapterResult,
      adapterValidationResult: validatorResult,
      adapterProposedInputSummary: adapterResult.proposedInputSummary,
      adapterPreconditionSummary: adapterResult.preconditionSummary,
      validatorProposedInputSummary:
        validatorResult.proposedInputValidationSummary,
      validatorPreconditionSummary:
        validatorResult.preconditionValidationSummary,
      proposedCreationInput,
      inputComesFromAdapterShapedProposedInput: true,
      adapterOutputValidated: true,
      directBridgeToBuilderBypassAttempted: false,
      directFinalizationToBuilderBypassAttempted: false,
      liveBrokerOrAvanzaDataConsumed: false,
      uiStateBypassAttempted: false,
      routeOrStorageBypassAttempted: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
        controlledInputOnly: true,
      },
    },
    outputSummary: {
      candidateOutputOnly: true,
      builderInvocationImplemented: false,
      candidateBuilderCalled: false,
      candidateBuilderResult: null,
      candidateOutput: null,
      candidateOutputWouldBeCandidateOnly: true,
      outputRequiresSeparateValidation: true,
      persistenceValidatorSeparate: true,
      insertRouteSeparate: true,
      dryRunInsertRouteSeparate: true,
      productionWritePathSeparate: true,
      safeToCreateExecutionRecordCandidate: false,
      safeToCreateExecutionRecord: false,
      safeToPersist: false,
      safeToAppendAudit: false,
      safeToUpdateStats: false,
      safeToRollback: false,
      safeToMutateTrade: false,
      blockedReasons: [],
      warnings: ["candidate_builder_not_called"],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
        noCandidateOutputCreatedBeforeWrapper: true,
      },
    },
    idempotencySummary: {
      sourceSummary: adapterResult.idempotencySummary,
      intendedExecutionRecordIdempotencyKey:
        adapterResult.idempotencySummary.intendedExecutionRecordIdempotencyKey,
      intendedExecutionRecordCandidateFingerprint:
        adapterResult.idempotencySummary
          .intendedExecutionRecordCandidateFingerprint,
      builderRecordFingerprint:
        adapterResult.idempotencySummary
          .intendedExecutionRecordCandidateFingerprint,
      sourceEvidenceFingerprint:
        adapterResult.idempotencySummary.sourceEvidenceFingerprint,
      brokerResultFingerprint:
        adapterResult.idempotencySummary.brokerResultFingerprint,
      handoffPayloadFingerprint:
        adapterResult.idempotencySummary.handoffPayloadFingerprint,
      captureId: null,
      requestId: "execution-record-builder-invocation-dev-fixture",
      requiredFingerprintsPresent: true,
      duplicateCheckRequired: true,
      duplicateDetectionSeparate: true,
      duplicateDetected: false,
      duplicateOfRecordId: null,
      retrySafe: true,
      mismatchRequiresReview: false,
      insertBoundaryMustEnforceUniquenessLater: true,
      safeForCandidateOnlyInvocationReview: true,
      safeForWrite: false,
      metadata: {
        fixtureOnly: true,
        duplicateCheckNotPerformed: true,
      },
    },
    auditProvenanceSummary: {
      sourceSummary: adapterResult.auditProvenanceSummary,
      sourceEvidenceChainPreserved: true,
      finalizationReferencePreserved: true,
      bridgeReferencePreserved: true,
      adapterValidationReferencePreserved: true,
      manualApprovalMetadataPreserved: true,
      auditAppendSeparate: true,
      auditRequiredBeforeWrite: true,
      auditMetadataPresent: true,
      provenanceMetadataPresent: true,
      sourceEvidenceTraceable: true,
      sourceEventIds: ["event-invocation-dev-fixture-001"],
      handoffSessionId:
        adapterResult.auditProvenanceSummary.handoffSessionId ??
        "handoff-invocation-dev-fixture-001",
      payloadId:
        adapterResult.auditProvenanceSummary.payloadId ??
        "payload-invocation-dev-fixture-001",
      beforeAfterValuesRequiredLater: true,
      auditAppendAttempted: false,
      rollbackAttempted: false,
      safeForCandidateOnlyInvocationReview: true,
      safeForWrite: false,
      metadata: {
        fixtureOnly: true,
        auditAppendAttempted: false,
      },
    },
    schemaReadinessSummary: {
      sourceSummary: adapterResult.schemaReadinessSummary,
      schemaReadinessMetadataPresent: true,
      generatedTypesAvailable: true,
      generatedTypesReviewed: true,
      generatedTypesLocation: "generated-types-fixture",
      generatedTypesRequiredForCandidateOnlyInvocation: false,
      migrationApplicationProven: true,
      migrationReference: "migration-fixture",
      executionRecordsTablePresent: true,
      executionRecordsSchemaAlignedWithCreationContract: true,
      persistenceBoundaryEnabled: false,
      insertRouteDryRunOnly: true,
      productionWriteEnabled: false,
      candidateOnlyInvocationIndependentFromDbGeneratedTypes: true,
      persistenceCouplingMustWaitForMigrationAndTypes: true,
      safeToPersist: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
        actualSchemaStillRequiresSeparateVerification: true,
      },
    },
    safetyPolicy:
      EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DEFAULT_SAFETY_POLICY,
    blockedReasons: [],
    warnings: ["candidate_builder_not_called"],
    reviewItems: [],
    contractOnly: true,
    invocationBoundaryOnly: true,
    candidateOnlyOutputBoundary: true,
    safeToCallCandidateBuilder: false,
    safeToCreateExecutionRecordCandidate: false,
    safeToCreateExecutionRecord: false,
    safeToPersist: false,
    safeToFinalize: false,
    safeToUpdateStats: false,
    safeToAppendAudit: false,
    safeToRollback: false,
    safeToMutateTrade: false,
    safeToRunBrokerAction: false,
    automaticModeAllowed: false,
    invocationImplemented: false,
    candidateBuilderInvocationAttempted: false,
    executionRecordCandidateCreationAttempted: false,
    executionRecordCreationAttempted: false,
    persistenceAttempted: false,
    finalizationAttempted: false,
    statsUpdateAttempted: false,
    auditAppendAttempted: false,
    rollbackAttempted: false,
    tradeMutationAttempted: false,
    brokerAutomationAttempted: false,
    avanzaAutomationAttempted: false,
    browserAutomationAttempted: false,
    metadata: {
      fixtureOnly: true,
      explicitTriggerOnly: true,
      wrapperNotAppliedYet: true,
      noPersistence: true,
    },
  };
}

export function buildExecutionRecordCandidateBuilderInvocationDevFixtureResult(): ExecutionRecordCandidateBuilderInvocationDevFixtureResult {
  const integrationFixture =
    buildExecutionRecordCandidateBuilderIntegrationDevFixtureResult();
  const validationInputResult = buildInvocationResult(integrationFixture);
  const validatorResult = validateExecutionRecordCandidateBuilderInvocation({
    contractVersion:
      EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_VALIDATOR_CONTRACT_VERSION,
    requestedAt: EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_DEV_FIXTURE_TIMESTAMP,
    invocationResult: validationInputResult,
    invocationInput: validationInputResult.input ?? null,
    invocationOutputSummary: validationInputResult.outputSummary,
    adapterResult: validationInputResult.input?.adapterResult ?? null,
    adapterValidationResult:
      validationInputResult.input?.adapterValidationResult ?? null,
    proposedCreationInput:
      validationInputResult.input?.proposedCreationInput ?? null,
    integrationInput: validationInputResult.input?.integrationInput ?? null,
    integrationResult: validationInputResult.input?.integrationResult ?? null,
    bridgeValidationResult:
      validationInputResult.input?.bridgeValidationResult ?? null,
    bridgeMapperResult: validationInputResult.input?.bridgeMapperResult ?? null,
    finalizationCandidate:
      validationInputResult.input?.finalizationCandidate ?? null,
    schemaReadinessMetadata: validationInputResult.schemaReadinessSummary,
    idempotencyMetadata: validationInputResult.idempotencySummary,
    auditProvenanceMetadata: validationInputResult.auditProvenanceSummary,
    manualApprovalMetadata:
      validationInputResult.input?.manualApprovalMetadata ?? null,
    expectedInvocationContractVersion:
      EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_CONTRACT_VERSION,
    expectedInvocationStatus: "builder_invocation_ready",
    metadata: {
      fixtureOnly: true,
      validationOnly: true,
      noBuilderInvocationBeforeValidation: true,
      noPersistence: true,
    },
  });
  const invocationResult = invokeExecutionRecordCandidateBuilder({
    ...validationInputResult.input!,
    invocationValidationResult: validatorResult,
  });

  return {
    integrationFixture,
    invocationResult,
    validatorResult,
    metadata: {
      fixtureOnly: true,
      explicitTriggerOnly: true,
      readOnlyPreview: true,
      invocationBoundaryOnly: true,
      invokesPureWrapper: true,
      candidateBuilderCalledThroughPureWrapper:
        invocationResult.outputSummary.candidateBuilderCalled,
      noDirectBuildExecutionRecordCandidateCall: true,
      noExecutionRecordCandidatePersisted: true,
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
}
