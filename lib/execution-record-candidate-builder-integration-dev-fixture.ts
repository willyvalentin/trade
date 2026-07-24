import {
  shapeExecutionRecordCandidateBuilderInput,
} from "@/lib/execution-record-candidate-builder-integration-adapter";
import {
  EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_CONTRACT_VERSION,
  type ExecutionRecordCandidateBuilderIntegrationAdapterInput,
  type ExecutionRecordCandidateBuilderIntegrationAdapterResult,
} from "@/lib/execution-record-candidate-builder-integration-adapter-contract";
import {
  EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_CONTRACT_VERSION,
  EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_DEFAULT_SAFETY_POLICY,
  type ExecutionRecordCandidateBuilderIntegrationResult,
  type ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary,
} from "@/lib/execution-record-candidate-builder-integration-contract";
import {
  validateExecutionRecordCandidateBuilderIntegration,
} from "@/lib/execution-record-candidate-builder-integration-validator";
import {
  EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordCandidateBuilderIntegrationValidationResult,
} from "@/lib/execution-record-candidate-builder-integration-validator-contract";
import {
  EXECUTION_RECORD_CREATION_CONTRACT_VERSION,
  type ExecutionRecordCreationInput,
} from "@/lib/execution-record-creation-contract";
import {
  buildFinalizationExecutionRecordBridgeDevFixtureResult,
  type FinalizationExecutionRecordBridgeDevFixtureResult,
} from "@/lib/finalization-execution-record-bridge-dev-fixture";

const EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_DEV_FIXTURE_TIMESTAMP =
  "2026-06-16T13:15:00.000Z";

export type ExecutionRecordCandidateBuilderIntegrationDevFixtureResult = {
  bridgeFixture: FinalizationExecutionRecordBridgeDevFixtureResult;
  schemaReadinessSummary: ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary;
  proposedCreationInput: ExecutionRecordCreationInput;
  integrationResult: ExecutionRecordCandidateBuilderIntegrationResult;
  adapterInput: ExecutionRecordCandidateBuilderIntegrationAdapterInput;
  adapterResult: ExecutionRecordCandidateBuilderIntegrationAdapterResult;
  validatorResult: ExecutionRecordCandidateBuilderIntegrationValidationResult;
  metadata: {
    fixtureOnly: true;
    explicitTriggerOnly: true;
    readOnlyPreview: true;
    pureAdapterOnly: true;
    pureValidatorOnly: true;
    noBuildExecutionRecordCandidateCall: true;
    noExecutionRecordCandidateCreated: true;
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

function buildSchemaReadinessSummary(): ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary {
  return {
    schemaReadinessMetadataPresent: true,
    generatedTypesAvailable: true,
    generatedTypesLocation: "types/supabase.execution-records.generated.ts",
    generatedTypesReviewed: true,
    executionRecordsTablePresent: true,
    executionRecordsSchemaAlignedWithContract: true,
    migrationApplicationProven: true,
    migrationReference: "supabase/migrations/execution_records.sql",
    rlsPolicyReviewed: true,
    persistenceBoundaryEnabled: false,
    insertRouteDryRunOnly: true,
    productionWriteEnabled: false,
    safeToPersist: false,
    blockedReasons: [],
    warnings: [],
    reviewItems: [],
    metadata: {
      fixtureOnly: true,
      noPersistence: true,
      actualGeneratedTypesStillRequireSeparateVerification: true,
      actualMigrationApplicationStillRequiresSeparateVerification: true,
    },
  };
}

function buildProposedCreationInput(
  bridgeFixture: FinalizationExecutionRecordBridgeDevFixtureResult,
): ExecutionRecordCreationInput {
  const draft = bridgeFixture.bridgeResult.targetSummary.intendedCreationInput ?? {};

  return {
    ...draft,
    contractVersion: EXECUTION_RECORD_CREATION_CONTRACT_VERSION,
    requestedAt: bridgeFixture.bridgeInput.requestedAt,
    sourceEnvironment: "local_dev",
    executionMode: "semi_automatic",
    executionPhase: "exit",
    expectedAction: "sell",
    expectedInstrument: {
      ticker: "ERIC B",
      name: "Ericsson B",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
      ...draft.expectedInstrument,
    },
    expectedQuantity: draft.expectedQuantity ?? 12,
    expectedPositionId: draft.expectedPositionId ?? "position-adapter-001",
    positionId: draft.positionId ?? "position-adapter-001",
    recommendationId:
      draft.recommendationId ??
      bridgeFixture.bridgeInput.brokerPayloadHandoffMetadata?.recommendationId ??
      "recommendation-adapter-001",
    sourceBrokerExecutionResult: {
      broker: "avanza",
      status: "filled",
      side: "sell",
      ticker: "ERIC B",
      instrumentName: "Ericsson B",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
      filledQuantity: 12,
      averageFillPrice: 86.5,
      grossAmount: 1038,
      netAmount: 1036.5,
      fees: 1.5,
      brokerOrderId: "AVZ-ADAPTER-ORDER-001",
      brokerConfirmationId: "AVZ-ADAPTER-CONFIRM-001",
      confirmationTimestamp: bridgeFixture.bridgeInput.requestedAt,
      metadata: {
        fxRate: 1,
        noSupabaseWrite: true,
        noTradeMutation: true,
        adapterFixtureOnly: true,
      },
    },
    brokerMetadata: {
      broker: "avanza",
      brokerOrderId: "AVZ-ADAPTER-ORDER-001",
      brokerConfirmationId: "AVZ-ADAPTER-CONFIRM-001",
      confirmationTimestamp: bridgeFixture.bridgeInput.requestedAt,
    },
    idempotency: {
      idempotencyKey:
        bridgeFixture.bridgeResult.idempotencySummary
          .intendedExecutionRecordIdempotencyKey ??
        "execution-record-adapter-idempotency-001",
      sourceEvidenceFingerprint:
        bridgeFixture.bridgeResult.idempotencySummary.sourceEvidenceFingerprint ??
        "source-evidence-adapter-001",
      brokerResultFingerprint:
        bridgeFixture.bridgeResult.idempotencySummary
          .brokerExecutionResultCandidateFingerprint ??
        "broker-result-adapter-001",
      handoffPayloadFingerprint:
        bridgeFixture.bridgeResult.idempotencySummary.handoffPayloadFingerprint ??
        "handoff-payload-adapter-001",
    },
    auditContext: {
      createdBy: "manual_user_confirmation",
      handoffSessionId:
        bridgeFixture.bridgeInput.brokerPayloadHandoffMetadata
          ?.handoffSessionId ?? "handoff-adapter-001",
      payloadId:
        bridgeFixture.bridgeInput.brokerPayloadHandoffMetadata?.payloadId ??
        "payload-adapter-001",
      sourceEventIds: ["event-adapter-001"],
    },
    existingTradeRef: {
      positionId: "position-adapter-001",
      ticker: "ERIC B",
    },
  };
}

function buildIntegrationResult(input: {
  bridgeFixture: FinalizationExecutionRecordBridgeDevFixtureResult;
  proposedCreationInput: ExecutionRecordCreationInput;
  schemaReadinessSummary: ExecutionRecordCandidateBuilderIntegrationSchemaReadinessSummary;
}): ExecutionRecordCandidateBuilderIntegrationResult {
  const { bridgeFixture, proposedCreationInput, schemaReadinessSummary } = input;
  const integrationInput = {
    contractVersion: EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_CONTRACT_VERSION,
    requestedAt: bridgeFixture.bridgeInput.requestedAt,
    bridgeResult: bridgeFixture.bridgeResult,
    bridgeValidationResult: bridgeFixture.validatorResult,
    bridgeMapperResult: bridgeFixture.bridgeResult,
    originalBridgeInput: bridgeFixture.bridgeInput,
    finalizationCandidate: bridgeFixture.bridgeInput.finalizationCandidate,
    candidateBuilderInputShape: proposedCreationInput,
    manualApprovalContext: bridgeFixture.bridgeInput.manualApprovalContext,
    idempotencyMetadata: bridgeFixture.bridgeResult.idempotencySummary,
    auditCorrectionMetadata: bridgeFixture.bridgeResult.auditCorrectionSummary,
    sourceEvidenceSummary: bridgeFixture.bridgeResult.sourceEvidenceSummary,
    targetSummary: bridgeFixture.bridgeResult.targetSummary,
    fieldMappingSummary: bridgeFixture.bridgeResult.fieldMappingSummary,
    validationHandoffSummary: bridgeFixture.bridgeResult.validationHandoffSummary,
    schemaReadinessSummary,
    metadata: {
      fixtureOnly: true,
      noBuilderInvocation: true,
      noPersistence: true,
    },
  };

  return {
    contractVersion: EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_CONTRACT_VERSION,
    evaluatedAt: bridgeFixture.bridgeInput.requestedAt,
    status: "builder_integration_ready",
    decisionRecommendation: "shape_candidate_input_only",
    input: integrationInput,
    sourceSummary: {
      bridgeResultPresent: true,
      bridgeResult: bridgeFixture.bridgeResult,
      bridgeValidationPresent: true,
      bridgeValidationResult: bridgeFixture.validatorResult,
      bridgeMapperResult: bridgeFixture.bridgeResult,
      originalBridgeInput: bridgeFixture.bridgeInput,
      finalizationCandidate: bridgeFixture.bridgeInput.finalizationCandidate,
      sourceEvidenceSummary: bridgeFixture.bridgeResult.sourceEvidenceSummary,
      targetSummary: bridgeFixture.bridgeResult.targetSummary,
      validationHandoffSummary:
        bridgeFixture.bridgeResult.validationHandoffSummary,
      sourceEvidenceTraceable: true,
      finalSettlementNoteIdentityPresent: true,
      supportedSource: true,
      supportedBroker: true,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
    },
    inputShapeSummary: {
      candidateBuilderContractPresent: true,
      candidateInputShapeAvailable: true,
      candidateInputShapeOnly: true,
      proposedCandidateInput: proposedCreationInput,
      proposedCandidate: null,
      candidateBuilderResultPreview: null,
      fieldMappingSummary: bridgeFixture.bridgeResult.fieldMappingSummary,
      validatedFieldSummary: bridgeFixture.validatorResult.validatedFieldSummary,
      requiredFieldsPresent: true,
      missingRequiredFields: [],
      shapedFields: [],
      safeToCallCandidateBuilder: false,
      safeToCreateExecutionRecord: false,
      builderInvocationAttempted: false,
      executionRecordCreationAttempted: false,
      blockedReasons: [],
      warnings: ["candidate_input_shape_only"],
      reviewItems: [],
    },
    handoffSummary: {
      contractOnly: true,
      bridgeResultPresent: true,
      bridgeValidationPresent: true,
      bridgeValidationValid: true,
      bridgeMapperResultPresent: true,
      finalizationCandidatePresent: true,
      candidateBuilderContractPresent: true,
      candidateInputShapeAvailable: true,
      manualApprovalRequired:
        bridgeFixture.bridgeResult.validationHandoffSummary.manualApprovalRequired,
      manualApprovalPresent:
        bridgeFixture.bridgeResult.validationHandoffSummary.manualApprovalPresent,
      canShapeCandidateInput: true,
      safeToCallCandidateBuilder: false,
      safeToCreateExecutionRecord: false,
      safeToPersist: false,
      candidateBuilderCalled: false,
      builderIntegrationImplemented: false,
      executionRecordCreated: false,
      persistenceAttempted: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
    },
    idempotencySummary: {
      sourceSummary: bridgeFixture.bridgeResult.idempotencySummary,
      validationSummary: bridgeFixture.validatorResult.idempotencyValidationSummary,
      requiredFingerprintsPresent: true,
      duplicateCheckRequired: true,
      duplicateDetected: false,
      duplicateOfRecordId: null,
      retrySafe: true,
      mismatchRequiresReview: false,
      intendedExecutionRecordCandidateFingerprint:
        bridgeFixture.bridgeResult.idempotencySummary
          .intendedExecutionRecordCandidateFingerprint,
      intendedExecutionRecordIdempotencyKey:
        bridgeFixture.bridgeResult.idempotencySummary
          .intendedExecutionRecordIdempotencyKey,
      sourceEvidenceFingerprint:
        bridgeFixture.bridgeResult.idempotencySummary.sourceEvidenceFingerprint,
      finalSettlementNoteMatchIdentity:
        bridgeFixture.bridgeResult.idempotencySummary
          .finalSettlementNoteMatchIdentity,
      safeForCandidateInputShapeOnly: true,
      safeForWrite: false,
    },
    auditCorrectionSummary: {
      sourceSummary: bridgeFixture.bridgeResult.auditCorrectionSummary,
      validationSummary:
        bridgeFixture.validatorResult.auditCorrectionValidationSummary,
      auditCorrectionMetadata: bridgeFixture.bridgeInput.auditCorrectionMetadata,
      manualApprovalContext: bridgeFixture.bridgeInput.manualApprovalContext,
      auditRequiredBeforeWrite: true,
      auditMetadataPresent: true,
      correctionMetadataPresent: true,
      sourceEvidenceTraceable: true,
      manualApprovalRequired:
        bridgeFixture.bridgeResult.validationHandoffSummary.manualApprovalRequired,
      manualApprovalPresent:
        bridgeFixture.bridgeResult.validationHandoffSummary.manualApprovalPresent,
      duplicatePreventionReference:
        bridgeFixture.bridgeResult.auditCorrectionSummary
          .duplicatePreventionReference,
      correctionStrategyReference:
        bridgeFixture.bridgeResult.auditCorrectionSummary
          .correctionStrategyReference,
      rollbackMetadataRequired: true,
      rollbackMetadataPresent: false,
      auditAppendAttempted: false,
      rollbackAttempted: false,
      safeForCandidateInputShapeOnly: true,
      safeForWrite: false,
    },
    schemaReadinessSummary,
    safetyPolicy: EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_DEFAULT_SAFETY_POLICY,
    blockedReasons: [],
    warnings: ["candidate_input_shape_only"],
    reviewItems: [],
    contractOnly: true,
    candidateInputShapeOnly: true,
    safeToCallCandidateBuilder: false,
    safeToCreateExecutionRecord: false,
    safeToPersist: false,
    safeToFinalize: false,
    safeToUpdateStats: false,
    safeToAppendAudit: false,
    safeToRollback: false,
    safeToMutateTrade: false,
    safeToRunBrokerAction: false,
    automaticModeAllowed: false,
    candidateBuilderInvocationAttempted: false,
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
      noBuilderInvocation: true,
      noPersistence: true,
    },
  };
}

export function buildExecutionRecordCandidateBuilderIntegrationDevFixtureResult(): ExecutionRecordCandidateBuilderIntegrationDevFixtureResult {
  const bridgeFixture = buildFinalizationExecutionRecordBridgeDevFixtureResult();
  const schemaReadinessSummary = buildSchemaReadinessSummary();
  const proposedCreationInput = buildProposedCreationInput(bridgeFixture);
  const integrationResult = buildIntegrationResult({
    bridgeFixture,
    proposedCreationInput,
    schemaReadinessSummary,
  });
  const adapterInput: ExecutionRecordCandidateBuilderIntegrationAdapterInput = {
    contractVersion:
      EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_ADAPTER_CONTRACT_VERSION,
    requestedAt: EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_DEV_FIXTURE_TIMESTAMP,
    integrationInput: integrationResult.input,
    integrationResult,
    bridgeResult: bridgeFixture.bridgeResult,
    bridgeValidationResult: bridgeFixture.validatorResult,
    bridgeMapperResult: bridgeFixture.bridgeResult,
    originalBridgeInput: bridgeFixture.bridgeInput,
    finalizationCandidate: bridgeFixture.bridgeInput.finalizationCandidate,
    manualApprovalContext: bridgeFixture.bridgeInput.manualApprovalContext,
    idempotencyMetadata: integrationResult.idempotencySummary,
    auditCorrectionMetadata: integrationResult.auditCorrectionSummary,
    sourceEvidenceSummary: bridgeFixture.bridgeResult.sourceEvidenceSummary,
    targetSummary: bridgeFixture.bridgeResult.targetSummary,
    validationHandoffSummary:
      bridgeFixture.bridgeResult.validationHandoffSummary,
    fieldMappingSummary: bridgeFixture.bridgeResult.fieldMappingSummary,
    proposedCreationInput,
    schemaReadinessSummary,
    metadata: {
      fixtureOnly: true,
      adapterInputShapeOnly: true,
      noBuilderInvocation: true,
      noPersistence: true,
    },
  };
  const adapterResult = shapeExecutionRecordCandidateBuilderInput(adapterInput);
  const validatorResult = validateExecutionRecordCandidateBuilderIntegration({
    contractVersion:
      EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_VALIDATOR_CONTRACT_VERSION,
    requestedAt: EXECUTION_RECORD_CANDIDATE_BUILDER_INTEGRATION_DEV_FIXTURE_TIMESTAMP,
    adapterResult,
    adapterInput,
    integrationInput: integrationResult.input,
    integrationResult,
    bridgeValidationResult: bridgeFixture.validatorResult,
    bridgeMapperResult: bridgeFixture.bridgeResult,
    proposedInputSummary: adapterResult.proposedInputSummary,
    fieldMappingSummary: adapterResult.fieldMappingSummary,
    preconditionSummary: adapterResult.preconditionSummary,
    schemaReadinessSummary: adapterResult.schemaReadinessSummary,
    idempotencySummary: adapterResult.idempotencySummary,
    auditProvenanceSummary: adapterResult.auditProvenanceSummary,
    manualApprovalContext:
      adapterResult.auditProvenanceSummary.manualApprovalContext ?? null,
    expectedCreationContractVersion: EXECUTION_RECORD_CREATION_CONTRACT_VERSION,
    expectedAdapterStatus: "adapter_input_ready",
    safetyPolicy: adapterResult.safetyPolicy,
    metadata: {
      fixtureOnly: true,
      validatorOnly: true,
      noBuilderInvocation: true,
      noPersistence: true,
    },
  });

  return {
    bridgeFixture,
    schemaReadinessSummary,
    proposedCreationInput,
    integrationResult,
    adapterInput,
    adapterResult,
    validatorResult,
    metadata: {
      fixtureOnly: true,
      explicitTriggerOnly: true,
      readOnlyPreview: true,
      pureAdapterOnly: true,
      pureValidatorOnly: true,
      noBuildExecutionRecordCandidateCall: true,
      noExecutionRecordCandidateCreated: true,
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
