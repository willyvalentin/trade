import {
  EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_CONTRACT_VERSION,
  type ExecutionRecordCandidateBuilderInvocationResult,
} from "@/lib/execution-record-candidate-builder-invocation-contract";
import {
  EXECUTION_RECORD_CREATION_CONTRACT_VERSION,
  type ExecutionRecordCandidate,
} from "@/lib/execution-record-creation-contract";
import {
  EXECUTION_RECORD_PERSISTENCE_CONTRACT_VERSION,
  type ExecutionRecordPersistenceInput,
  type PersistedExecutionRecordReference,
} from "@/lib/execution-record-persistence-contract";
import {
  validateExecutionRecordPersistenceInput,
} from "@/lib/execution-record-persistence-validator";
import {
  EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_CONTRACT_VERSION,
  type ExecutionRecordPersistenceValidatorAdapterAuditCorrectionSummary,
  type ExecutionRecordPersistenceValidatorAdapterDryRunRouteSummary,
  type ExecutionRecordPersistenceValidatorAdapterIdempotencySummary,
  type ExecutionRecordPersistenceValidatorAdapterSchemaReadinessSummary,
  type ExecutionRecordPersistenceValidatorAdapterSecuritySummary,
  type ExecutionRecordPersistenceValidatorIntegrationAdapterInput,
  type ExecutionRecordPersistenceValidatorIntegrationAdapterResult,
} from "@/lib/execution-record-persistence-validator-integration-adapter-contract";
import {
  buildExecutionRecordPersistenceValidatorIntegration,
  type ExecutionRecordPersistenceValidatorIntegrationReadinessResult,
} from "@/lib/execution-record-persistence-validator-integration";
import {
  EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_CONTRACT_VERSION,
  EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_DEFAULT_SAFETY_POLICY,
  type ExecutionRecordPersistenceCandidateOutputSummary,
  type ExecutionRecordPersistenceValidatorIntegrationInput,
  type ExecutionRecordPersistenceValidatorIntegrationResult,
} from "@/lib/execution-record-persistence-validator-integration-contract";
import {
  type ExecutionRecordPersistenceValidatorIntegrationValidationInput,
  type ExecutionRecordPersistenceValidatorIntegrationValidationResult,
} from "@/lib/execution-record-persistence-validator-integration-validator-contract";
import {
  validateActualPersistenceValidatorBoundaryCall,
} from "@/lib/execution-record-actual-persistence-validator-boundary-call-validator";
import {
  ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_CONTRACT_VERSION,
  ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_DEFAULT_POST_CALL_BOUNDARY,
  ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_DEFAULT_SAFETY_POLICY,
  type ActualPersistenceValidatorBoundaryAuditCorrectionSummary,
  type ActualPersistenceValidatorBoundaryCallInput,
  type ActualPersistenceValidatorBoundaryDryRunRouteSummary,
  type ActualPersistenceValidatorBoundaryGeneratedTypesSummary,
  type ActualPersistenceValidatorBoundaryIdempotencySummary,
  type ActualPersistenceValidatorBoundaryManualApprovalSummary,
  type ActualPersistenceValidatorBoundaryMigrationSummary,
  type ActualPersistenceValidatorBoundaryProposedInputSummary,
  type ActualPersistenceValidatorBoundarySchemaReadinessSummary,
  type ActualPersistenceValidatorBoundarySecuritySummary,
  type ActualPersistenceValidatorBoundaryServerOnlySummary,
  type ActualPersistenceValidatorBoundarySourceEvidenceSummary,
} from "@/lib/execution-record-actual-persistence-validator-boundary-call-contract";
import {
  ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATOR_CONTRACT_VERSION,
  ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_DEFAULT_AUTHORITY_FLAGS,
  type ActualPersistenceValidatorBoundaryCallValidationInput,
  type ActualPersistenceValidatorBoundaryCallValidationResult,
} from "@/lib/execution-record-actual-persistence-validator-boundary-call-validator-contract";
import {
  callActualPersistenceValidatorBoundary,
} from "@/lib/execution-record-actual-persistence-validator-boundary-call-implementation";
import type {
  ActualPersistenceValidatorBoundaryCallImplementationInput,
  ActualPersistenceValidatorBoundaryCallImplementationResult,
} from "@/lib/execution-record-actual-persistence-validator-boundary-call-implementation-contract";
import {
  EXECUTION_RECORD_INSERT_ROUTE_READINESS_BOUNDARY_CONTRACT_VERSION,
  EXECUTION_RECORD_INSERT_ROUTE_READINESS_DEFAULT_POST_INSERT_BOUNDARY,
  EXECUTION_RECORD_INSERT_ROUTE_READINESS_DEFAULT_SAFETY_POLICY,
  type ExecutionRecordInsertRouteActualValidatorSummary,
  type ExecutionRecordInsertRouteAuditCorrectionSummary,
  type ExecutionRecordInsertRouteDryRunProductionSeparationSummary,
  type ExecutionRecordInsertRouteEvidenceProvenanceSummary,
  type ExecutionRecordInsertRouteGeneratedTypesSummary,
  type ExecutionRecordInsertRouteIdempotencyDuplicateSummary,
  type ExecutionRecordInsertRouteManualApprovalSummary,
  type ExecutionRecordInsertRouteMigrationSummary,
  type ExecutionRecordInsertRouteNormalizedInputSummary,
  type ExecutionRecordInsertRouteReadinessInput,
  type ExecutionRecordInsertRouteReadinessResult,
  type ExecutionRecordInsertRouteRlsSecuritySummary,
  type ExecutionRecordInsertRouteSchemaReadinessSummary,
  type ExecutionRecordInsertRouteServerOnlyBoundarySummary,
  type ExecutionRecordInsertRouteServerOnlyRequestContext,
} from "@/lib/execution-record-insert-route-readiness-boundary-contract";
import {
  validateExecutionRecordInsertRouteReadiness,
} from "@/lib/execution-record-insert-route-readiness-boundary-validator";
import {
  callExecutionRecordInsertRoute,
} from "@/lib/execution-record-insert-route-call-implementation";
import {
  EXECUTION_RECORD_INSERT_ROUTE_CALL_IMPLEMENTATION_CONTRACT_VERSION,
  type ExecutionRecordInsertRouteCallInput,
  type ExecutionRecordInsertRouteCallResult,
} from "@/lib/execution-record-insert-route-call-implementation-contract";
import {
  EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordInsertRouteReadinessValidationInput,
  type ExecutionRecordInsertRouteReadinessValidationResult,
} from "@/lib/execution-record-insert-route-readiness-boundary-validator-contract";
import {
  EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_CONTRACT_VERSION,
  EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_DEFAULT_POST_INSERT_BOUNDARY,
  EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_DEFAULT_SAFETY_POLICY,
  type ExecutionRecordProductionInsertRouteBoundaryInput,
} from "@/lib/execution-record-production-insert-route-boundary-contract";
import {
  validateExecutionRecordProductionInsertRouteBoundary,
} from "@/lib/execution-record-production-insert-route-boundary-validator";
import {
  EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordProductionInsertRouteBoundaryValidationInput,
  type ExecutionRecordProductionInsertRouteBoundaryValidationResult,
} from "@/lib/execution-record-production-insert-route-boundary-validator-contract";
import {
  EXECUTION_RECORD_POST_INSERT_BOUNDARY_CONTRACT_VERSION,
  EXECUTION_RECORD_POST_INSERT_BOUNDARY_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_POST_INSERT_BOUNDARY_DEFAULT_SAFETY_POLICY,
  type ExecutionRecordPostInsertBoundaryCategorySummaries,
  type ExecutionRecordPostInsertBoundaryCategorySummary,
  type ExecutionRecordPostInsertBoundaryInput,
  type ExecutionRecordPostInsertBoundaryResult,
} from "@/lib/execution-record-post-insert-boundary-contract";
import {
  validateExecutionRecordPostInsertBoundary,
} from "@/lib/execution-record-post-insert-boundary-validator";
import {
  EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_DEFAULT_SAFETY_POLICY,
  EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordPostInsertBoundaryValidationInput,
  type ExecutionRecordPostInsertBoundaryValidationResult,
} from "@/lib/execution-record-post-insert-boundary-validator-contract";
import {
  EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_CONTRACT_VERSION,
  EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_DEFAULT_SAFETY_POLICY,
  type ExecutionRecordAuditAppendBoundaryInput,
  type ExecutionRecordAuditAppendBoundaryResult,
} from "@/lib/execution-record-audit-append-boundary-contract";
import {
  validateExecutionRecordAuditAppendBoundary,
} from "@/lib/execution-record-audit-append-boundary-validator";
import {
  EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordAuditAppendBoundaryValidationInput,
  type ExecutionRecordAuditAppendBoundaryValidationResult,
} from "@/lib/execution-record-audit-append-boundary-validator-contract";
import {
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VERSION,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DEFAULT_SAFETY_POLICY,
  type ExecutionRecordAuditAppendWriterInput,
  type ExecutionRecordAuditAppendWriterResult,
} from "@/lib/execution-record-audit-append-writer-contract";
import {
  validateExecutionRecordAuditAppendWriter,
} from "@/lib/execution-record-audit-append-writer-validator";
import {
  validateExecutionRecordAuditAppendWriterContract,
} from "@/lib/execution-record-audit-append-writer-contract-validator";
import {
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_VALIDATION_DEFAULT_SAFETY_POLICY,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordAuditAppendWriterValidationInput,
  type ExecutionRecordAuditAppendWriterValidationResult,
} from "@/lib/execution-record-audit-append-writer-validator-contract";
import {
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_DEFAULT_SAFETY_POLICY,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordAuditAppendWriterContractValidationInput,
  type ExecutionRecordAuditAppendWriterContractValidationResult,
} from "@/lib/execution-record-audit-append-writer-contract-validator-contract";
import {
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_RESULT_CONTRACT_VERSION,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_DEFAULT_SAFETY_POLICY,
  type ExecutionRecordAuditAppendWriterDryRunInput,
  type ExecutionRecordAuditAppendWriterDryRunResult,
} from "@/lib/execution-record-audit-append-writer-dry-run-result-contract";
import {
  validateExecutionRecordAuditAppendWriterDryRun,
} from "@/lib/execution-record-audit-append-writer-dry-run-validator";
import {
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_DEFAULT_SAFETY_POLICY,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordAuditAppendWriterDryRunValidationInput,
  type ExecutionRecordAuditAppendWriterDryRunValidationResult,
} from "@/lib/execution-record-audit-append-writer-dry-run-validator-contract";
import {
  executeAuditAppendWriterDryRun,
} from "@/lib/execution-record-audit-append-writer-dry-run-execution-implementation";
import {
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_IMPLEMENTATION_CONTRACT_VERSION,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_IMPLEMENTATION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_IMPLEMENTATION_DEFAULT_SAFETY_POLICY,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationInput,
  type ExecutionRecordAuditAppendWriterDryRunExecutionImplementationResult,
} from "@/lib/execution-record-audit-append-writer-dry-run-execution-implementation-contract";
import {
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_CONTRACT_VERSION,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_DEFAULT_SAFETY_POLICY,
  type ExecutionRecordAuditAppendWriterDryRunExecutionInput,
  type ExecutionRecordAuditAppendWriterDryRunExecutionResult,
} from "@/lib/execution-record-audit-append-writer-dry-run-execution-contract";
import {
  validateExecutionRecordAuditAppendWriterDryRunExecution,
} from "@/lib/execution-record-audit-append-writer-dry-run-execution-validator";
import {
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_DEFAULT_SAFETY_POLICY,
  EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput,
  type ExecutionRecordAuditAppendWriterDryRunExecutionValidationResult,
} from "@/lib/execution-record-audit-append-writer-dry-run-execution-validator-contract";

const FIXTURE_TIMESTAMP = "2026-06-18T09:15:00.000Z";

export type ExecutionRecordPersistenceValidatorIntegrationDevFixtureScenario = {
  adapterInput: ExecutionRecordPersistenceValidatorIntegrationAdapterInput;
  adapterResult: ExecutionRecordPersistenceValidatorIntegrationAdapterResult;
  auditAppendBoundaryValidatorInput: ExecutionRecordAuditAppendBoundaryValidationInput;
  auditAppendBoundaryValidatorResult: ExecutionRecordAuditAppendBoundaryValidationResult;
  auditAppendWriterContractValidationInput: ExecutionRecordAuditAppendWriterContractValidationInput;
  auditAppendWriterContractValidationResult: ExecutionRecordAuditAppendWriterContractValidationResult;
  auditAppendWriterDryRunExecutionImplementationInput: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationInput;
  auditAppendWriterDryRunExecutionImplementationResult: ExecutionRecordAuditAppendWriterDryRunExecutionImplementationResult;
  auditAppendWriterDryRunExecutionValidationInput: ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput;
  auditAppendWriterDryRunExecutionValidationResult: ExecutionRecordAuditAppendWriterDryRunExecutionValidationResult;
  auditAppendWriterDryRunValidationInput: ExecutionRecordAuditAppendWriterDryRunValidationInput;
  auditAppendWriterDryRunValidationResult: ExecutionRecordAuditAppendWriterDryRunValidationResult;
  auditAppendWriterValidationInput: ExecutionRecordAuditAppendWriterValidationInput;
  auditAppendWriterValidationResult: ExecutionRecordAuditAppendWriterValidationResult;
  boundaryCallValidatorInput: ActualPersistenceValidatorBoundaryCallValidationInput;
  boundaryCallValidatorResult: ActualPersistenceValidatorBoundaryCallValidationResult;
  boundaryCallWrapperInput: ActualPersistenceValidatorBoundaryCallImplementationInput;
  boundaryCallWrapperResult: ActualPersistenceValidatorBoundaryCallImplementationResult;
  insertRouteCallWrapperInput: ExecutionRecordInsertRouteCallInput;
  insertRouteCallWrapperResult: ExecutionRecordInsertRouteCallResult;
  insertRouteReadinessValidatorInput: ExecutionRecordInsertRouteReadinessValidationInput;
  insertRouteReadinessValidatorResult: ExecutionRecordInsertRouteReadinessValidationResult;
  integrationResult: ExecutionRecordPersistenceValidatorIntegrationReadinessResult;
  label: string;
  postInsertBoundaryValidatorInput: ExecutionRecordPostInsertBoundaryValidationInput;
  postInsertBoundaryValidatorResult: ExecutionRecordPostInsertBoundaryValidationResult;
  productionInsertRouteBoundaryValidatorInput: ExecutionRecordProductionInsertRouteBoundaryValidationInput;
  productionInsertRouteBoundaryValidatorResult: ExecutionRecordProductionInsertRouteBoundaryValidationResult;
  validatorInput: ExecutionRecordPersistenceValidatorIntegrationValidationInput;
  validatorResult: ExecutionRecordPersistenceValidatorIntegrationValidationResult;
};

export type ExecutionRecordPersistenceValidatorIntegrationDevFixtureResult = {
  readyScenario: ExecutionRecordPersistenceValidatorIntegrationDevFixtureScenario;
  reviewScenario: ExecutionRecordPersistenceValidatorIntegrationDevFixtureScenario;
  metadata: {
    fixtureOnly: true;
    explicitTriggerOnly: true;
    readOnlyPreview: true;
    usesPureIntegrationComposer: true;
    proposedPersistenceInputOnly: true;
    callsOnlyAdapterAndIntegrationValidator: true;
    callsPureBoundaryCallValidator: true;
    callsBoundaryCallWrapperWithFixtureCallableOnly: true;
    actualPersistenceValidatorBoundary: "fixture_wrapper_diagnostics_only";
    actualPersistenceValidatorBoundaryCallValidatorRan: true;
    actualPersistenceValidatorBoundaryCallWrapperRan: true;
    persistenceValidatorCalled: true;
    persistenceValidatorCalledByFixtureWrapperOnly: true;
    callsInsertRouteReadinessValidator: true;
    insertRouteReadinessValidatorRan: true;
    insertRouteReadinessOnly: true;
    callsInsertRouteCallWrapper: true;
    insertRouteCallWrapperRan: true;
    insertRouteCallWrapperDiagnosticsOnly: true;
    insertRouteCalledByFixtureCallableOnly: true;
    insertRouteCalled: true;
    insertRouteProductionCalled: false;
    callsProductionInsertRouteBoundaryValidator: true;
    productionInsertRouteBoundaryValidatorRan: true;
    productionInsertRouteBoundaryDiagnosticsOnly: true;
    callsPostInsertBoundaryValidator: true;
    postInsertBoundaryValidatorRan: true;
    postInsertBoundaryDiagnosticsOnly: true;
    callsAuditAppendBoundaryValidator: true;
    auditAppendBoundaryValidatorRan: true;
    auditAppendBoundaryDiagnosticsOnly: true;
    callsAuditAppendWriterValidator: true;
    callsAuditAppendWriterContractValidator: true;
    auditAppendWriterValidatorRan: true;
    auditAppendWriterContractValidatorRan: true;
    auditAppendWriterDryRunValidatorRan: true;
    auditAppendWriterDryRunExecutionValidatorRan: true;
    auditAppendWriterDryRunExecutionImplementationRan: true;
    callsAuditAppendWriterDryRunValidator: true;
    callsAuditAppendWriterDryRunExecutionValidator: true;
    auditAppendWriterValidatorDiagnosticsOnly: true;
    auditAppendWriterContractValidatorDiagnosticsOnly: true;
    auditAppendWriterDryRunValidatorDiagnosticsOnly: true;
    auditAppendWriterDryRunExecutionValidatorDiagnosticsOnly: true;
    auditAppendWriterDryRunExecutionImplementationDiagnosticsOnly: true;
    auditAppendRan: false;
    auditWriterRan: false;
    postInsertActionsRan: false;
    productionInsertRouteImplemented: false;
    productionInsertRouteCalled: false;
    executionRecordCreated: false;
    executionRecordPersisted: false;
    noSupabaseWrite: true;
    noLocalStorageWrite: true;
    noAuditAppend: true;
    noStatsUpdate: true;
    noRollbackCorrection: true;
    noTradeMutation: true;
    noBrokerOrderBehavior: true;
    noAvanzaBehavior: true;
    noBrowserAutomation: true;
  };
};

function buildCandidate(): ExecutionRecordCandidate {
  return {
    recordId: "exec_candidate_persistence_preview_001",
    recordFingerprint: "record_fp_persistence_preview_001",
    idempotencyKey: "idem_persistence_preview_001",
    contractVersion: EXECUTION_RECORD_CREATION_CONTRACT_VERSION,
    createdAt: FIXTURE_TIMESTAMP,
    broker: "avanza",
    side: "buy",
    ticker: "AAPL",
    quantity: 2,
    price: 195.42,
    currency: "USD",
    brokerStatus: "filled",
    confirmationTimestamp: FIXTURE_TIMESTAMP,
    sourceEvidenceFingerprint: "source_fp_persistence_preview_001",
    sourceEnvironment: "local_dev",
    executionMode: "semi_automatic",
    executionPhase: "entry",
    brokerOrderId: "avanza-order-persistence-preview-001",
    brokerConfirmationId: "avanza-confirmation-persistence-preview-001",
    recommendationId: "rec_persistence_preview_001",
    positionId: "position_persistence_preview_001",
    handoffSessionId: "handoff_persistence_preview_001",
    payloadId: "payload_persistence_preview_001",
    instrumentName: "Apple Inc.",
    market: "NASDAQ",
    instrumentType: "stock",
    grossAmount: 390.84,
    netAmount: 391.83,
    fees: 0.99,
    planningSnapshotId: "planning_snapshot_persistence_preview_001",
    planningSnapshotVersion: "v1",
    captureId: "capture_persistence_preview_001",
    requestId: "request_persistence_preview_001",
    brokerResultFingerprint: "broker_result_fp_persistence_preview_001",
    handoffPayloadFingerprint: "handoff_payload_fp_persistence_preview_001",
    sourceEventIds: ["event_persistence_preview_001"],
    warnings: ["persistence_not_attempted", "trade_mutation_not_attempted"],
    safetyMetadata: {
      noSupabaseWrite: true,
      noTradeMutation: true,
      noBrokerExecution: true,
      noAvanzaAutomation: true,
      previewOnlySourceRejected: false,
      syntheticSourceAllowed: false,
      automaticModeAllowed: false,
      validationWarnings: ["persistence_not_attempted"],
    },
    auditMetadata: {
      noSupabaseWrite: true,
      noTradeMutation: true,
      noBrokerExecution: true,
      noAvanzaAutomation: true,
      creationAttempted: false,
      persistenceAttempted: false,
      tradeMutationAttempted: false,
      sourceEventIds: ["event_persistence_preview_001"],
      sourceEvidenceFingerprint: "source_fp_persistence_preview_001",
      brokerResultFingerprint: "broker_result_fp_persistence_preview_001",
      handoffPayloadFingerprint: "handoff_payload_fp_persistence_preview_001",
      handoffSessionId: "handoff_persistence_preview_001",
      payloadId: "payload_persistence_preview_001",
      captureId: "capture_persistence_preview_001",
      requestId: "request_persistence_preview_001",
      createdBy: "dev_stub",
    },
    provenanceMetadata: {
      fixtureOnly: true,
      candidateOnlyBuilderOutput: true,
      persistenceValidatorNotCalled: true,
      insertRouteNotCalled: true,
      noExecutionRecordCreated: true,
    },
  };
}

function buildPersistenceInput(
  candidate: ExecutionRecordCandidate,
): ExecutionRecordPersistenceInput {
  return {
    contractVersion: EXECUTION_RECORD_PERSISTENCE_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    candidate,
    idempotencyKey: candidate.idempotencyKey,
    recordFingerprint: candidate.recordFingerprint,
    sourceFingerprint: candidate.sourceEvidenceFingerprint,
    brokerConfirmation: {
      broker: candidate.broker,
      brokerOrderId: candidate.brokerOrderId ?? null,
      brokerConfirmationId: candidate.brokerConfirmationId ?? null,
      brokerResultFingerprint: candidate.brokerResultFingerprint ?? null,
      confirmedAt: candidate.confirmationTimestamp,
      capturedAt: candidate.createdAt,
      sourceFingerprint: candidate.sourceEvidenceFingerprint,
    },
    association: {
      sourceRecommendationId: candidate.recommendationId ?? null,
      sourcePositionId: candidate.positionId ?? null,
      handoffSessionId: candidate.handoffSessionId ?? null,
      planningSnapshotId: candidate.planningSnapshotId ?? null,
      tradeAssociationConfidence: "confirmed",
    },
    userContext: {
      userId: "persistence-preview-user",
      accountId: "persistence-preview-account",
      actor: "server_route",
      sourceEnvironment: candidate.sourceEnvironment,
    },
    safetyChecklist: {
      candidateValidated: true,
      candidateSafeToPersist: false,
      notPreviewOnly: true,
      notDevFixture: false,
      notSynthetic: true,
      notMock: true,
      hasConfirmedBrokerResult: true,
      hasIdempotencyKey: true,
      hasRecordFingerprint: true,
      hasSourceFingerprint: true,
      hasUserOrAccountContext: true,
      hasUnambiguousTradeAssociation: true,
      schemaAvailable: true,
      rlsContextPresent: true,
      auditPolicyReviewed: true,
      tradeMutationSeparated: true,
      automaticModeReviewed: true,
    },
    auditMetadata: {
      noTradeMutation: true,
      noAuditAppendInContract: true,
      persistenceAttempted: false,
      supabaseWriteAttempted: false,
      tradeMutationAttempted: false,
      auditAppendAttempted: false,
      actor: "server_route",
      sourceEnvironment: candidate.sourceEnvironment,
      sourceEventIds: candidate.sourceEventIds ?? [],
      idempotencyKey: candidate.idempotencyKey,
      recordFingerprint: candidate.recordFingerprint,
      sourceFingerprint: candidate.sourceEvidenceFingerprint,
      brokerResultFingerprint: candidate.brokerResultFingerprint ?? null,
      handoffSessionId: candidate.handoffSessionId ?? null,
    },
    duplicateMatches: [],
    schemaReference: {
      tableName: "execution_records",
      expectedColumnsVersion: "execution_records_v1",
      migrationVersion: "fixture-only",
    },
    metadata: {
      fixtureOnly: true,
      proposedPersistenceInputOnly: true,
      noPersistenceValidatorCall: true,
      noInsertRouteCall: true,
      noExecutionRecordCreated: true,
      noPersistence: true,
    },
  };
}

function buildAdapterInput(options: {
  blocked: boolean;
}): ExecutionRecordPersistenceValidatorIntegrationAdapterInput {
  const candidate = buildCandidate();
  const persistenceInput = buildPersistenceInput(candidate);
  const candidateOutputSummary: ExecutionRecordPersistenceCandidateOutputSummary =
    {
      invocationResult: null,
      candidateOutput: candidate,
      candidateOutputPresent: true,
      candidateOutputOnly: true,
      candidateOutputValidated: true,
      candidateOutputSafeForPersistenceReview: true,
      candidateOutputIsExecutionRecordCreation: false,
      candidateOutputHasWriteAuthority: false,
      candidateOutputRequiresPersistenceValidation: true,
      candidateOutputRequiresSeparateWriteApproval: true,
      blockedReasons: [],
      warnings: ["candidate_output_not_record_creation"],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
        hardcodedCandidateOnlyOutput: true,
        noCandidateBuilderInvocation: true,
      },
    };
  const invocationResult = {
    contractVersion: EXECUTION_RECORD_CANDIDATE_BUILDER_INVOCATION_CONTRACT_VERSION,
    evaluatedAt: FIXTURE_TIMESTAMP,
    status: "builder_invocation_ready",
    decisionRecommendation: "candidate_builder_invocation_contract_only",
    outputSummary: {
      candidateOutputOnly: true,
      candidateBuilderCalled: false,
      candidateOutput: candidate,
      candidateBuilderResult: null,
    },
    candidateBuilderInvocationAttempted: false,
    persistenceAttempted: false,
    auditAppendAttempted: false,
    statsUpdateAttempted: false,
    rollbackAttempted: false,
    tradeMutationAttempted: false,
    brokerAutomationAttempted: false,
    avanzaAutomationAttempted: false,
    browserAutomationAttempted: false,
  } as unknown as ExecutionRecordCandidateBuilderInvocationResult;
  const idempotencySummary: ExecutionRecordPersistenceValidatorAdapterIdempotencySummary =
    {
      idempotencyMetadataPresent: true,
      idempotencyKey: persistenceInput.idempotencyKey,
      recordFingerprint: persistenceInput.recordFingerprint,
      sourceFingerprint: persistenceInput.sourceFingerprint,
      brokerResultFingerprint:
        persistenceInput.brokerConfirmation.brokerResultFingerprint,
      brokerOrderFingerprint: persistenceInput.brokerConfirmation.brokerOrderId,
      requiredFingerprintsPresent: true,
      duplicatePreventionPresent: !options.blocked,
      duplicateLookupRequiredBeforeWrite: true,
      duplicateLookupCompleted: !options.blocked,
      duplicateMatches: [],
      duplicateDetected: false,
      conflictingDuplicateRequiresReview: false,
      safeForProposedInputShaping: true,
      safeForWrite: false,
      blockedReasons: options.blocked ? ["missing_duplicate_prevention"] : [],
      warnings: options.blocked ? ["duplicate_check_required"] : [],
      reviewItems: options.blocked ? ["duplicate_prevention_review"] : [],
    };
  const auditCorrectionSummary: ExecutionRecordPersistenceValidatorAdapterAuditCorrectionSummary =
    {
      auditMetadata: persistenceInput.auditMetadata,
      auditProvenanceMetadataPresent: true,
      sourceEvidenceChainPresent: true,
      sourceEventIds: persistenceInput.auditMetadata.sourceEventIds,
      manualApprovalMetadataPresent: true,
      manualApprovalContext: {
        approvalRequired: true,
        approvalPresent: true,
        approvalIsWriteAuthority: false,
        approvedBy: "dev-preview-fixture",
        approvedAt: FIXTURE_TIMESTAMP,
        approvalReference: "manual-approval-fixture",
        metadata: {
          fixtureOnly: true,
          notWriteAuthority: true,
        },
      },
      correctionPolicyReviewed: true,
      rollbackPolicyReviewed: true,
      auditAppendSeparate: true,
      auditAppendAttempted: false,
      rollbackAttempted: false,
      safeForProposedInputShaping: true,
      safeForWrite: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
    };
  const schemaReadinessSummary: ExecutionRecordPersistenceValidatorAdapterSchemaReadinessSummary =
    {
      schemaReference: persistenceInput.schemaReference,
      schemaReadinessAcknowledged: true,
      executionRecordsTableExpected: true,
      executionRecordsTablePresent: !options.blocked,
      generatedTypesStatusAcknowledged: true,
      generatedTypesAvailable: !options.blocked,
      generatedTypesReviewed: !options.blocked,
      generatedTypesLocation: options.blocked ? null : "fixture-generated-types",
      migrationApplicationStatusAcknowledged: true,
      migrationApplicationProven: !options.blocked,
      migrationReference: options.blocked ? null : "fixture-migration-proof",
      schemaAlignedWithPersistenceContract: !options.blocked,
      schemaAlignedWithProposedInput: !options.blocked,
      productionWriteReadinessBlockedBySchema: true,
      blockedReasons: options.blocked
        ? ["generated_types_absent_or_unknown", "migration_application_not_proven"]
        : [],
      warnings: options.blocked
        ? ["generated_types_required_later", "migration_application_required_later"]
        : [],
      reviewItems: options.blocked
        ? ["generated_types_review", "migration_application_review"]
        : [],
    };
  const securitySummary: ExecutionRecordPersistenceValidatorAdapterSecuritySummary =
    {
      userContext: persistenceInput.userContext,
      rlsSecurityProofPresent: !options.blocked,
      rlsPolicyReviewed: !options.blocked,
      serverOnlyWriteBoundaryPresent: !options.blocked,
      serviceRoleRestrictedToServer: !options.blocked,
      directClientWritePathAbsent: true,
      noProductionUiWriteAction: true,
      automaticModeAllowed: false,
      automaticModeReviewed: true,
      productionWriteBoundaryPresent: false,
      safeForProposedInputShaping: !options.blocked,
      safeForWrite: false,
      blockedReasons: options.blocked
        ? ["missing_rls_security_proof", "missing_server_only_write_boundary"]
        : [],
      warnings: options.blocked
        ? ["rls_security_required_later", "server_only_write_boundary_required_later"]
        : [],
      reviewItems: options.blocked
        ? ["rls_security_review", "server_only_write_boundary_review"]
        : [],
    };
  const dryRunRouteSummary: ExecutionRecordPersistenceValidatorAdapterDryRunRouteSummary =
    {
      dryRunRouteStatusAcknowledged: true,
      dryRunRouteKnown: !options.blocked,
      dryRunRouteDevToolsGated: true,
      dryRunRouteRejectsNonDryRun: true,
      dryRunRouteMayCallPersistenceValidatorInDryRun: true,
      adapterCallsPersistenceValidator: false,
      adapterCallsInsertRoute: false,
      dryRunRouteWritesSupabase: false,
      dryRunRouteAppendsAudit: false,
      dryRunRouteUpdatesStats: false,
      dryRunRouteMutatesTrade: false,
      dryRunRouteRunsBrokerAction: false,
      dryRunRouteRunsAvanzaOrBrowser: false,
      dryRunOutputIsProductionInsertReadiness: false,
      productionInsertRouteReady: false,
      safeForProposedInputShaping: true,
      blockedReasons: options.blocked ? ["missing_dry_run_route_status"] : [],
      warnings: [],
      reviewItems: options.blocked ? ["dry_run_route_review"] : [],
    };
  const integrationInput: ExecutionRecordPersistenceValidatorIntegrationInput = {
    contractVersion: EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    invocationResult,
    candidateOutputSummary,
    candidateOutput: candidate,
    proposedPersistenceInput: persistenceInput,
    idempotencySummary:
      idempotencySummary as unknown as ExecutionRecordPersistenceValidatorIntegrationInput["idempotencySummary"],
    auditCorrectionSummary:
      auditCorrectionSummary as unknown as ExecutionRecordPersistenceValidatorIntegrationInput["auditCorrectionSummary"],
    schemaReadinessSummary:
      schemaReadinessSummary as unknown as ExecutionRecordPersistenceValidatorIntegrationInput["schemaReadinessSummary"],
    securitySummary:
      securitySummary as unknown as ExecutionRecordPersistenceValidatorIntegrationInput["securitySummary"],
    dryRunRouteSummary:
      dryRunRouteSummary as unknown as ExecutionRecordPersistenceValidatorIntegrationInput["dryRunRouteSummary"],
    manualApprovalContext: auditCorrectionSummary.manualApprovalContext,
    safetyPolicy:
      EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_DEFAULT_SAFETY_POLICY,
    metadata: {
      fixtureOnly: true,
      noPersistenceValidatorCall: true,
      noInsertRouteCall: true,
    },
  };
  const integrationResult = {
      contractVersion: EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_CONTRACT_VERSION,
      evaluatedAt: FIXTURE_TIMESTAMP,
      status: options.blocked
        ? "persistence_validation_blocked"
        : "persistence_validation_ready",
      decisionRecommendation: options.blocked
        ? "blocked_do_not_persist"
        : "validate_persistence_readiness_only",
      input: integrationInput,
      candidateOutputSummary,
      readinessSummary: {
        candidateOutputReadyForValidation: !options.blocked,
        persistenceInputShapeReady: !options.blocked,
        persistenceSafetyChecklist: persistenceInput.safetyChecklist,
        proposedPersistenceInput: persistenceInput,
        persistenceValidatorResult: null,
        persistenceValidatorCallAllowed: false,
        persistenceValidatorCallAttempted: false,
        insertRouteCallAllowed: false,
        insertRouteCallAttempted: false,
        safeToCreateExecutionRecord: false,
        safeToPersist: false,
        safeForReadinessOnly: !options.blocked,
        schemaReadiness: {
          ...schemaReadinessSummary,
          schemaAvailable: !options.blocked,
          schemaAlignedWithCandidateOutput: !options.blocked,
          schemaAlignedWithPersistenceInput: !options.blocked,
        },
        idempotency: {
          ...idempotencySummary,
          safeForPersistenceReadinessReview: !options.blocked,
        },
        auditCorrection: {
          ...auditCorrectionSummary,
          safeForPersistenceReadinessReview: true,
        },
        security: {
          ...securitySummary,
          safeForPersistenceReadinessReview: !options.blocked,
        },
        dryRunRoute: {
          ...dryRunRouteSummary,
          dryRunRouteCallsPersistenceValidator: true,
          dryRunRouteCallsInsertRoute: false,
          safeForPersistenceReadinessReview: !options.blocked,
        },
        blockedReasons: options.blocked ? ["generated_types_absent_or_unknown"] : [],
        warnings: [],
        reviewItems: options.blocked ? ["schema_readiness_review"] : [],
      },
      schemaReadinessSummary,
      idempotencySummary,
      auditCorrectionSummary,
      securitySummary,
      dryRunRouteSummary,
      safetyPolicy:
        EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_DEFAULT_SAFETY_POLICY,
      blockedReasons: options.blocked ? ["generated_types_absent_or_unknown"] : [],
      warnings: ["persistence_readiness_not_write_approval"],
      reviewItems: options.blocked ? ["schema_readiness_review"] : [],
      contractOnly: true,
      persistenceReadinessOnly: true,
      candidateOnlyOutputBoundary: true,
      safeToCallPersistenceValidator: false,
      safeToCallInsertRoute: false,
      safeToCreateExecutionRecord: false,
      safeToPersist: false,
      safeToFinalize: false,
      safeToUpdateStats: false,
      safeToAppendAudit: false,
      safeToRollback: false,
      safeToMutateTrade: false,
      safeToRunBrokerAction: false,
      automaticModeAllowed: false,
      persistenceValidatorIntegrationImplemented: false,
      persistenceValidatorCallAttempted: false,
      insertRouteCallAttempted: false,
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
      },
  } as unknown as ExecutionRecordPersistenceValidatorIntegrationResult;

  return {
    contractVersion:
      EXECUTION_RECORD_PERSISTENCE_VALIDATOR_INTEGRATION_ADAPTER_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    persistenceIntegrationInput: integrationInput,
    persistenceIntegrationResult: integrationResult,
    invocationResult,
    candidateBuilderOutputSummary: candidateOutputSummary,
    candidateOutput: candidate,
    proposedPersistenceInput: persistenceInput,
    idempotencySummary,
    auditCorrectionSummary,
    schemaReadinessSummary,
    securitySummary,
    dryRunRouteSummary,
    manualApprovalContext: auditCorrectionSummary.manualApprovalContext,
    metadata: {
      fixtureOnly: true,
      hardcodedCandidateOnlyOutput: true,
      noPersistenceValidatorCall: true,
      noInsertRouteCall: true,
      noExecutionRecordCreated: true,
    },
  };
}

function buildBoundaryCallValidatorInput(input: {
  adapterInput: ExecutionRecordPersistenceValidatorIntegrationAdapterInput;
  adapterResult: ExecutionRecordPersistenceValidatorIntegrationAdapterResult;
  blocked: boolean;
  integrationResult: ExecutionRecordPersistenceValidatorIntegrationReadinessResult;
  validatorResult: ExecutionRecordPersistenceValidatorIntegrationValidationResult;
}): ActualPersistenceValidatorBoundaryCallValidationInput {
  const proposedPersistenceInput: ExecutionRecordPersistenceInput = {
    ...input.adapterInput.proposedPersistenceInput!,
    safetyChecklist: {
      ...input.adapterInput.proposedPersistenceInput!.safetyChecklist,
      candidateSafeToPersist: !input.blocked,
      notDevFixture: !input.blocked,
    },
    userContext: {
      ...input.adapterInput.proposedPersistenceInput!.userContext,
      sourceEnvironment: "staging",
    },
  };
  const proposedInputSummary: ActualPersistenceValidatorBoundaryProposedInputSummary =
    {
      proposedPersistenceInput,
      proposedPersistenceInputPresent: true,
      proposedPersistenceInputComplete: !input.blocked,
      proposedInputIsValidationOnly: true,
      persistenceContractVersionKnown: true,
      requestedAtPresent: true,
      candidatePresent: true,
      brokerConfirmationPresent: true,
      associationPresent: true,
      userContextPresent: true,
      safetyChecklistPresent: true,
      auditMetadataPresent: true,
      schemaReferencePresent: true,
      missingRequiredPersistenceInputFields: [],
      safeToCallActualPersistenceValidator: false,
      safeToCallInsertRoute: false,
      safeToCreateExecutionRecord: false,
      safeToPersist: false,
      blockedReasons: [],
      warnings: ["actual_validator_call_not_write_approval"],
      reviewItems: [],
    };
  const sourceEvidenceSummary: ActualPersistenceValidatorBoundarySourceEvidenceSummary =
    {
      sourceEvidencePresent: true,
      sourceEvidenceFingerprint: proposedPersistenceInput.sourceFingerprint,
      candidateFingerprint: proposedPersistenceInput.candidate.recordFingerprint,
      builderFingerprint: proposedPersistenceInput.candidate.recordFingerprint,
      integrationFingerprint: `integration_fixture_${input.blocked ? "blocked" : "ready"}`,
      brokerOrderId: proposedPersistenceInput.brokerConfirmation.brokerOrderId,
      brokerConfirmationId:
        proposedPersistenceInput.brokerConfirmation.brokerConfirmationId,
      brokerResultId: proposedPersistenceInput.brokerConfirmation.brokerResultId,
      provenanceMetadata: proposedPersistenceInput.auditMetadata,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
    };
  const schemaReadinessSummary: ActualPersistenceValidatorBoundarySchemaReadinessSummary =
    {
      schemaReference: proposedPersistenceInput.schemaReference,
      schemaReadinessKnown: !input.blocked,
      schemaReadyForValidation: !input.blocked,
      schemaAlignedWithPersistenceInput: !input.blocked,
      executionRecordsTableExpected: true,
      executionRecordsTablePresent: !input.blocked,
      productionWriteReadinessBlockedBySchema: true,
      blockedReasons: input.blocked
        ? ["schema_readiness_absent_or_unknown"]
        : [],
      warnings: input.blocked
        ? ["generated_types_required_before_call"]
        : [],
      reviewItems: input.blocked ? ["schema_readiness_review"] : [],
    };
  const generatedTypesSummary: ActualPersistenceValidatorBoundaryGeneratedTypesSummary =
    {
      generatedTypesStatus: input.blocked ? "unknown" : "available",
      generatedTypesPresent: !input.blocked,
      generatedTypesReviewed: !input.blocked,
      generatedTypesLocation: input.blocked ? null : "fixture-generated-types",
      generatedTypesMatchExecutionRecordsSchema: !input.blocked,
      callBlockedWhenAbsentOrUnknown: true,
      blockedReasons: input.blocked
        ? ["generated_types_absent_or_unknown"]
        : [],
      warnings: input.blocked
        ? ["generated_types_required_before_call"]
        : [],
      reviewItems: input.blocked ? ["generated_types_review"] : [],
    };
  const migrationSummary: ActualPersistenceValidatorBoundaryMigrationSummary = {
    migrationApplicationStatus: input.blocked ? "unknown" : "proven",
    migrationApplied: !input.blocked,
    migrationReference: input.blocked ? null : "fixture-migration-proof",
    migrationVerifiedAgainstTargetProject: !input.blocked,
    callBlockedWhenNotProven: true,
    blockedReasons: input.blocked
      ? ["migration_application_not_proven"]
      : [],
    warnings: input.blocked
      ? ["migration_application_required_before_call"]
      : [],
    reviewItems: input.blocked ? ["migration_application_review"] : [],
  };
  const idempotencySummary: ActualPersistenceValidatorBoundaryIdempotencySummary =
    {
      idempotencyMetadataPresent: true,
      idempotencyKey: proposedPersistenceInput.idempotencyKey,
      recordFingerprint: proposedPersistenceInput.recordFingerprint,
      sourceFingerprint: proposedPersistenceInput.sourceFingerprint,
      brokerResultFingerprint:
        proposedPersistenceInput.brokerConfirmation.brokerResultFingerprint,
      candidateFingerprint: proposedPersistenceInput.candidate.recordFingerprint,
      integrationFingerprint: `integration_fixture_${input.blocked ? "blocked" : "ready"}`,
      requiredFingerprintsPresent: true,
      conflictingFingerprintsDetected: false,
      safeForValidationReview: true,
      safeForWrite: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
    };
  const duplicatePreventionSummary:
    ActualPersistenceValidatorBoundaryCallValidationInput["duplicatePreventionSummary"] =
    {
      duplicatePreventionMetadataPresent: !input.blocked,
      duplicateLookupCompleted: !input.blocked,
      duplicateDetected: false,
      conflictingDuplicateRequiresReview: false,
      duplicateMatches: [],
      metadata: {
        fixtureOnly: true,
      },
    };
  const auditCorrectionSummary: ActualPersistenceValidatorBoundaryAuditCorrectionSummary =
    {
      auditCorrectionMetadataPresent: true,
      auditProvenanceMetadataPresent: true,
      sourceEvidenceChainPresent: true,
      sourceEventIds: proposedPersistenceInput.auditMetadata.sourceEventIds,
      correctionPolicyReviewed: true,
      rollbackPolicyReviewed: true,
      auditAppendRequiresSeparateBoundary: true,
      correctionRollbackRequiresSeparateBoundary: true,
      safeToAppendAudit: false,
      safeToRollback: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
    };
  const securitySummary: ActualPersistenceValidatorBoundarySecuritySummary = {
    rlsSecurityStatus: input.blocked ? "unknown" : "proven",
    rlsSecurityProofPresent: !input.blocked,
    securityAssumptionsReviewed: !input.blocked,
    callBlockedWhenProofMissing: true,
    safeForValidationReview: !input.blocked,
    safeForWrite: false,
    blockedReasons: input.blocked ? ["missing_rls_security_proof"] : [],
    warnings: input.blocked ? ["rls_security_required_before_call"] : [],
    reviewItems: input.blocked ? ["rls_security_review"] : [],
  };
  const serverOnlySummary: ActualPersistenceValidatorBoundaryServerOnlySummary =
    {
      serverOnlyBoundaryStatus: input.blocked ? "unknown" : "proven",
      serverOnlyBoundaryProofPresent: !input.blocked,
      clientWriteAccessPrevented: true,
      callBlockedWhenBoundaryMissing: true,
      safeForValidationReview: !input.blocked,
      safeForWrite: false,
      blockedReasons: input.blocked ? ["missing_server_only_boundary"] : [],
      warnings: input.blocked
        ? ["server_only_boundary_required_before_call"]
        : [],
      reviewItems: input.blocked ? ["server_only_boundary_review"] : [],
    };
  const dryRunRouteSummary: ActualPersistenceValidatorBoundaryDryRunRouteSummary =
    {
      dryRunRouteStatus: input.blocked ? "unknown" : "known",
      dryRunRouteMetadataPresent: !input.blocked,
      dryRunRouteIsProductionInsert: false,
      productionInsertRouteReady: false,
      dryRunRouteDoesNotAuthorizeWrite: true,
      blockedReasons: input.blocked ? ["missing_dry_run_route_status"] : [],
      warnings: [],
      reviewItems: input.blocked ? ["dry_run_route_review"] : [],
    };
  const manualApprovalSummary: ActualPersistenceValidatorBoundaryManualApprovalSummary =
    {
      manualApprovalContext: input.adapterInput.manualApprovalContext ?? null,
      manualApprovalMetadataPresent: true,
      manualApprovalRequired: true,
      manualApprovalSatisfied: true,
      automaticModeAllowed: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
    };
  const boundaryInput: ActualPersistenceValidatorBoundaryCallInput = {
    contractVersion: ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    composerResult: input.integrationResult,
    adapterResult: input.adapterResult,
    integrationValidationResult: input.validatorResult,
    proposedPersistenceInput,
    composerSummary: {
      composerResult: input.integrationResult,
      composerResultPresent: true,
      composerStatus: input.integrationResult.status,
      composerReady:
        input.integrationResult.status === "persistence_validator_integration_ready",
      composerReportsNotCalledFutureBoundary: true,
      adapterResultPresent: true,
      integrationValidationResultPresent: true,
      proposedPersistenceInputSummaryPresent: true,
      allWriteActionAuthorityFlagsFalse: true,
      blockedReasons: [],
      warnings: ["actual_call_not_implemented"],
      reviewItems: [],
    },
    proposedInputSummary,
    sourceEvidenceSummary,
    schemaReadinessSummary,
    generatedTypesSummary,
    migrationSummary,
    idempotencySummary,
    duplicatePreventionSummary: {
      duplicatePreventionMetadataPresent: !input.blocked,
      duplicateLookupRequiredBeforeWrite: true,
      duplicateLookupCompleted: !input.blocked,
      duplicateMatches: [],
      duplicateDetected: false,
      conflictingDuplicateRequiresReview: false,
      safeForValidationReview: !input.blocked,
      safeForWrite: false,
      blockedReasons: input.blocked
        ? ["missing_duplicate_prevention_metadata"]
        : [],
      warnings: input.blocked
        ? ["duplicate_prevention_required_before_call"]
        : [],
      reviewItems: input.blocked ? ["duplicate_prevention_review"] : [],
    },
    auditCorrectionSummary,
    securitySummary,
    serverOnlySummary,
    dryRunRouteSummary,
    manualApprovalSummary,
    safetyPolicy: ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_DEFAULT_SAFETY_POLICY,
    metadata: {
      fixtureOnly: true,
      postCallBoundarySummary:
        ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_DEFAULT_POST_CALL_BOUNDARY,
    },
  };

  return {
    contractVersion:
      ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_CALL_VALIDATOR_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    boundaryInput,
    composerResult: input.integrationResult,
    adapterResult: input.adapterResult,
    integrationValidationResult: input.validatorResult,
    proposedPersistenceInput,
    proposedInputSummary,
    sourceEvidenceSummary,
    schemaReadinessSummary,
    generatedTypesSummary,
    migrationSummary,
    idempotencySummary,
    duplicatePreventionSummary,
    auditCorrectionSummary,
    securitySummary,
    serverOnlySummary,
    dryRunRouteSummary,
    manualApprovalSummary,
    authorityFlags: ACTUAL_PERSISTENCE_VALIDATOR_BOUNDARY_DEFAULT_AUTHORITY_FLAGS,
    metadata: {
      fixtureOnly: true,
      callReadinessOnly: true,
      actualPersistenceValidatorWrapperMayUseFixtureCallableOnly: true,
      noInsertRouteCall: true,
      noExecutionRecordCreated: true,
      noPersistenceWrite: true,
    },
  };
}

function buildBoundaryCallWrapperInput(input: {
  boundaryCallValidatorInput: ActualPersistenceValidatorBoundaryCallValidationInput;
  boundaryCallValidatorResult: ActualPersistenceValidatorBoundaryCallValidationResult;
}): ActualPersistenceValidatorBoundaryCallImplementationInput {
  const { boundaryCallValidatorInput, boundaryCallValidatorResult } = input;

  return {
    requestedAt: FIXTURE_TIMESTAMP,
    boundaryCallValidationInput: boundaryCallValidatorInput,
    boundaryCallValidationResult: boundaryCallValidatorResult,
    proposedPersistenceInput: boundaryCallValidatorInput.proposedPersistenceInput,
    proposedInputSummary: boundaryCallValidatorInput.proposedInputSummary,
    actualPersistenceValidatorCallable: {
      callablePresent: true,
      callableName: "validateExecutionRecordPersistence",
      callableModule: "@/lib/execution-record-persistence-validator",
      callableVersion: EXECUTION_RECORD_PERSISTENCE_CONTRACT_VERSION,
      actualValidatorImplemented: true,
      actualValidatorCallAllowed: true,
      actualValidatorCallAttempted: false,
      validatesOnly: true,
      safeToCallInsertRoute: false,
      safeToPersist: false,
      metadata: {
        fixtureOnly: true,
        injectedByDevPreviewFixture: true,
        diagnosticsOnly: true,
      },
    },
    actualPersistenceValidatorCallableFunction:
      validateExecutionRecordPersistenceInput,
    schemaReadinessSummary: boundaryCallValidatorInput.schemaReadinessSummary,
    generatedTypesSummary: boundaryCallValidatorInput.generatedTypesSummary,
    migrationSummary: boundaryCallValidatorInput.migrationSummary,
    sourceEvidenceSummary: boundaryCallValidatorInput.sourceEvidenceSummary,
    idempotencySummary: boundaryCallValidatorInput.idempotencySummary,
    duplicatePreventionSummary:
      boundaryCallValidatorInput.duplicatePreventionSummary,
    auditCorrectionSummary: boundaryCallValidatorInput.auditCorrectionSummary,
    securitySummary: boundaryCallValidatorInput.securitySummary,
    serverOnlySummary: boundaryCallValidatorInput.serverOnlySummary,
    dryRunRouteSummary: boundaryCallValidatorInput.dryRunRouteSummary,
    manualApprovalSummary: boundaryCallValidatorInput.manualApprovalSummary,
    manualApprovalContext:
      boundaryCallValidatorInput.manualApprovalSummary?.manualApprovalContext ??
      null,
    metadata: {
      fixtureOnly: true,
      wrapperDiagnosticsOnly: true,
      fixtureInjectedCallableOnly: true,
      noInsertRouteCall: true,
      noExecutionRecordCreated: true,
      noPersistenceWrite: true,
    },
  };
}

function buildInsertRouteReadinessValidatorInput(input: {
  blocked: boolean;
  boundaryCallValidatorInput: ActualPersistenceValidatorBoundaryCallValidationInput;
  boundaryCallValidatorResult: ActualPersistenceValidatorBoundaryCallValidationResult;
  boundaryCallWrapperResult: ActualPersistenceValidatorBoundaryCallImplementationResult;
  label: string;
}): ExecutionRecordInsertRouteReadinessValidationInput {
  const proposedPersistenceInput =
    input.boundaryCallValidatorInput.proposedPersistenceInput ?? null;
  const actualValidatorOutput =
    input.boundaryCallWrapperResult.validatorOutputSummary.actualValidatorResult;
  const actualValidatorSummary: ExecutionRecordInsertRouteActualValidatorSummary =
    {
      wrapperResult: input.boundaryCallWrapperResult,
      wrapperResultPresent: true,
      wrapperStatus: input.boundaryCallWrapperResult.status,
      wrapperValidated:
        input.boundaryCallWrapperResult.status ===
        "actual_persistence_validator_boundary_call_validated",
      wrapperDecision: input.boundaryCallWrapperResult.decisionRecommendation,
      wrapperDecisionDoNotInsert:
        input.boundaryCallWrapperResult.decisionRecommendation ===
        "actual_validator_valid_do_not_insert",
      actualValidatorOutput,
      actualValidatorOutputPresent: Boolean(actualValidatorOutput),
      actualValidatorOutputHasBlockingErrors:
        input.blocked ||
        actualValidatorOutput?.status !== "eligible" ||
        actualValidatorOutput?.safeToWrite !== true ||
        Boolean(actualValidatorOutput?.rejectionReasons.length),
      actualValidatorWarnings: actualValidatorOutput?.warnings ?? [],
      boundaryCallValidationResult: input.boundaryCallValidatorResult,
      blockedReasons: input.blocked
        ? ["actual_validator_wrapper_not_validated"]
        : [],
      warnings: ["actual_validator_do_not_insert_required"],
      reviewItems: input.blocked
        ? ["actual_validator_wrapper_result_review"]
        : [],
    };
  const normalizedInputSummary: ExecutionRecordInsertRouteNormalizedInputSummary =
    {
      proposedPersistenceInput,
      proposedPersistenceInputPresent: Boolean(proposedPersistenceInput),
      proposedPersistenceInputNormalized:
        Boolean(proposedPersistenceInput) && !input.blocked,
      requiredPersistenceFieldsPresent:
        Boolean(proposedPersistenceInput) && !input.blocked,
      missingRequiredPersistenceFields: [],
      schemaReference: proposedPersistenceInput?.schemaReference ?? null,
      idempotencyKeyPresent: Boolean(proposedPersistenceInput?.idempotencyKey),
      recordFingerprintPresent: Boolean(
        proposedPersistenceInput?.recordFingerprint,
      ),
      sourceFingerprintPresent: Boolean(
        proposedPersistenceInput?.sourceFingerprint,
      ),
      candidatePresent: Boolean(proposedPersistenceInput?.candidate),
      brokerConfirmationPresent: Boolean(
        proposedPersistenceInput?.brokerConfirmation,
      ),
      associationPresent: Boolean(proposedPersistenceInput?.association),
      userContextPresent: Boolean(proposedPersistenceInput?.userContext),
      safetyChecklistPresent: Boolean(proposedPersistenceInput?.safetyChecklist),
      auditMetadataPresent: Boolean(proposedPersistenceInput?.auditMetadata),
      blockedReasons: input.blocked
        ? ["missing_normalized_persistence_input"]
        : [],
      warnings: [],
      reviewItems: input.blocked
        ? ["normalized_persistence_input_review"]
        : [],
    };
  const schemaReadinessSummary: ExecutionRecordInsertRouteSchemaReadinessSummary =
    {
      schemaReadinessKnown: !input.blocked,
      schemaReadyForInsertReadiness: !input.blocked,
      schemaReference: proposedPersistenceInput?.schemaReference ?? null,
      expectedTableName: "execution_records",
      expectedColumnsVersion: input.blocked ? null : "execution_records_v1",
      blockedReasons: input.blocked
        ? ["schema_readiness_absent_or_unknown"]
        : [],
      warnings: [],
      reviewItems: input.blocked ? ["schema_readiness_review"] : [],
    };
  const generatedTypesSummary: ExecutionRecordInsertRouteGeneratedTypesSummary =
    {
      generatedTypesStatus: input.blocked ? "unknown" : "available",
      generatedTypesPresent: !input.blocked,
      generatedTypesVersion: input.blocked ? null : "fixture-generated-types",
      generatedTypesSource: input.blocked ? null : "dev-preview-fixture",
      executionRecordsTableTyped: !input.blocked,
      blockedReasons: input.blocked
        ? ["generated_types_absent_or_unknown"]
        : [],
      warnings: input.blocked
        ? ["generated_types_required_before_insert_readiness"]
        : [],
      reviewItems: input.blocked ? ["generated_types_review"] : [],
    };
  const migrationSummary: ExecutionRecordInsertRouteMigrationSummary = {
    migrationApplicationStatus: input.blocked ? "unknown" : "proven",
    migrationApplied: !input.blocked,
    migrationVersion: input.blocked ? null : "fixture-migration-proof",
    migrationCheckedAt: FIXTURE_TIMESTAMP,
    blockedReasons: input.blocked
      ? ["migration_application_not_proven"]
      : [],
    warnings: input.blocked
      ? ["migration_application_required_before_insert_readiness"]
      : [],
    reviewItems: input.blocked ? ["migration_application_review"] : [],
  };
  const rlsSecuritySummary: ExecutionRecordInsertRouteRlsSecuritySummary = {
    rlsSecurityProofPresent: !input.blocked,
    rlsPolicyVerified: !input.blocked,
    serviceRoleWriteBoundaryVerified: !input.blocked,
    userScopedWriteBoundaryVerified: !input.blocked,
    secretHandlingReviewed: !input.blocked,
    blockedReasons: input.blocked ? ["missing_rls_security_proof"] : [],
    warnings: input.blocked
      ? ["rls_security_required_before_insert_readiness"]
      : [],
    reviewItems: input.blocked ? ["rls_security_review"] : [],
  };
  const serverOnlyBoundarySummary: ExecutionRecordInsertRouteServerOnlyBoundarySummary =
    {
      serverOnlyBoundaryProofPresent: !input.blocked,
      serverOnlyRequestContextPresent: !input.blocked,
      clientWritePathAbsent: true,
      browserCallablePathAbsent: true,
      routeHandlerBoundaryVerified: !input.blocked,
      blockedReasons: input.blocked
        ? ["missing_server_only_write_boundary"]
        : [],
      warnings: input.blocked
        ? ["server_only_boundary_required_before_insert_readiness"]
        : [],
      reviewItems: input.blocked
        ? ["server_only_write_boundary_review"]
        : [],
    };
  const idempotencyDuplicateSummary: ExecutionRecordInsertRouteIdempotencyDuplicateSummary =
    {
      idempotencyMetadataPresent: !input.blocked,
      idempotencyKeyPresent: Boolean(proposedPersistenceInput?.idempotencyKey),
      recordFingerprintPresent: Boolean(
        proposedPersistenceInput?.recordFingerprint,
      ),
      sourceFingerprintPresent: Boolean(
        proposedPersistenceInput?.sourceFingerprint,
      ),
      brokerResultFingerprintPresent: Boolean(
        proposedPersistenceInput?.brokerConfirmation.brokerResultFingerprint,
      ),
      duplicatePreventionMetadataPresent: !input.blocked,
      duplicateLookupCompleted: !input.blocked,
      duplicateMatches: [],
      duplicateConflictsRequireReview: false,
      blockedReasons: input.blocked
        ? [
            "missing_duplicate_prevention_metadata",
            "missing_idempotency_metadata",
          ]
        : [],
      warnings: input.blocked
        ? ["duplicate_prevention_required_before_insert_readiness"]
        : [],
      reviewItems: input.blocked
        ? ["duplicate_prevention_review", "idempotency_fingerprint_review"]
        : [],
    };
  const auditCorrectionSummary: ExecutionRecordInsertRouteAuditCorrectionSummary =
    {
      auditCorrectionMetadataPresent: !input.blocked,
      auditPolicyReviewed: !input.blocked,
      sourceEvidenceChainPresent: !input.blocked,
      correctionRollbackSeparated: true,
      noAuditAppendInReadinessContract: true,
      noRollbackCorrectionInReadinessContract: true,
      blockedReasons: input.blocked
        ? ["missing_audit_correction_metadata"]
        : [],
      warnings: [],
      reviewItems: input.blocked ? ["audit_correction_review"] : [],
    };
  const evidenceProvenanceSummary: ExecutionRecordInsertRouteEvidenceProvenanceSummary =
    {
      sourceEvidencePresent: !input.blocked,
      sourceEvidenceIds:
        proposedPersistenceInput?.auditMetadata.sourceEventIds ?? [],
      provenanceComplete: !input.blocked,
      brokerConfirmationEvidencePresent: !input.blocked,
      finalizationEvidencePresent: !input.blocked,
      candidateBuilderEvidencePresent: !input.blocked,
      persistenceAdapterEvidencePresent: !input.blocked,
      blockedReasons: input.blocked ? ["missing_source_evidence"] : [],
      warnings: [],
      reviewItems: input.blocked ? ["evidence_provenance_review"] : [],
    };
  const manualApprovalSummary: ExecutionRecordInsertRouteManualApprovalSummary =
    {
      manualApprovalMetadataPresent: !input.blocked,
      manualApprovalRequired: true,
      manualApprovalSatisfied: !input.blocked,
      manualApprovalContext:
        input.boundaryCallValidatorInput.manualApprovalSummary
          ?.manualApprovalContext ?? null,
      automaticModeAllowed: false,
      automaticModeDisabled: true,
      blockedReasons: input.blocked ? ["missing_manual_approval"] : [],
      warnings: [],
      reviewItems: input.blocked ? ["manual_approval_review"] : [],
    };
  const dryRunProductionSeparationSummary: ExecutionRecordInsertRouteDryRunProductionSeparationSummary =
    {
      dryRunRouteStatus: input.blocked ? "unknown" : "known",
      dryRunRouteAvailable: !input.blocked,
      dryRunRouteIsProductionRoute: false,
      productionRouteStatus: "future_boundary_required",
      productionRouteSeparatedFromDryRun: true,
      dryRunSuccessIsNotProductionReadiness: true,
      productionInsertRequiresSeparateBoundary: true,
      blockedReasons: input.blocked ? ["missing_dry_run_route_status"] : [],
      warnings: ["dry_run_route_not_production_route"],
      reviewItems: input.blocked ? ["dry_run_route_review"] : [],
    };
  const serverOnlyRequestContext: ExecutionRecordInsertRouteServerOnlyRequestContext =
    {
      requestId: `insert_readiness_${input.blocked ? "blocked" : "ready"}`,
      requestedAt: FIXTURE_TIMESTAMP,
      sourceEnvironment: "staging",
      actor: "server_route",
      routeName: "/api/execution/records/insert",
      isServerOnly: !input.blocked,
      clientInitiatedWriteAllowed: false,
      browserAutomationAllowed: false,
      brokerAutomationAllowed: false,
      metadata: {
        fixtureOnly: true,
        devPreviewOnly: true,
      },
    };
  const readinessInput: ExecutionRecordInsertRouteReadinessInput = {
    contractVersion: EXECUTION_RECORD_INSERT_ROUTE_READINESS_BOUNDARY_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    actualValidatorWrapperResult: input.boundaryCallWrapperResult,
    actualValidatorOutputSummary: actualValidatorSummary,
    proposedNormalizedPersistenceInput: proposedPersistenceInput,
    normalizedInputSummary,
    schemaReadinessSummary,
    generatedTypesSummary,
    migrationSummary,
    rlsSecuritySummary,
    serverOnlyBoundarySummary,
    idempotencyDuplicateSummary,
    auditCorrectionSummary,
    evidenceProvenanceSummary,
    dryRunProductionSeparationSummary,
    manualApprovalSummary,
    serverOnlyRequestContext,
    metadata: {
      fixtureOnly: true,
      label: input.label,
      insertRouteReadinessOnly: true,
      noInsertRouteCall: true,
      noExecutionRecordCreated: true,
      noPersistenceWrite: true,
    },
  };
  const readinessResult: ExecutionRecordInsertRouteReadinessResult = {
    contractVersion: EXECUTION_RECORD_INSERT_ROUTE_READINESS_BOUNDARY_CONTRACT_VERSION,
    evaluatedAt: FIXTURE_TIMESTAMP,
    status: input.blocked
      ? "insert_route_readiness_blocked"
      : "insert_route_readiness_ready",
    decisionRecommendation: input.blocked
      ? "blocked_do_not_call_insert_route"
      : "may_prepare_insert_route_call_only",
    input: readinessInput,
    routeEligibilitySummary: {
      routeEligibilityKnown: true,
      mayPrepareInsertRouteCallOnly: !input.blocked,
      insertRouteCallImplemented: false,
      insertRouteCallAttempted: false,
      safeToCallInsertRoute: false,
      safeToCreateExecutionRecord: false,
      safeToPersist: false,
      dryRunRouteOnly: true,
      productionRouteSeparated: true,
      automaticModeAllowed: false,
      blockedReasons: input.blocked
        ? ["generated_types_absent_or_unknown"]
        : [],
      warnings: ["insert_route_not_called"],
      reviewItems: input.blocked ? ["future_insert_route_boundary_review"] : [],
    },
    actualValidatorSummary,
    normalizedInputSummary,
    schemaReadinessSummary,
    generatedTypesSummary,
    migrationSummary,
    rlsSecuritySummary,
    serverOnlyBoundarySummary,
    idempotencyDuplicateSummary,
    auditCorrectionSummary,
    evidenceProvenanceSummary,
    manualApprovalSummary,
    dryRunProductionSeparationSummary,
    postInsertBoundarySummary:
      EXECUTION_RECORD_INSERT_ROUTE_READINESS_DEFAULT_POST_INSERT_BOUNDARY,
    safetyPolicy: EXECUTION_RECORD_INSERT_ROUTE_READINESS_DEFAULT_SAFETY_POLICY,
    blockedReasons: input.blocked
      ? ["generated_types_absent_or_unknown"]
      : [],
    warnings: [
      "insert_route_not_called",
      "insert_readiness_not_insert_execution",
      "dry_run_route_not_production_route",
    ],
    reviewItems: input.blocked ? ["future_insert_route_boundary_review"] : [],
    metadata: {
      fixtureOnly: true,
      insertRouteReadinessOnly: true,
      mayPrepareInsertRouteCallOnly: !input.blocked,
      noInsertRouteCall: true,
      noExecutionRecordCreated: true,
      noPersistenceWrite: true,
    },
  };

  return {
    contractVersion:
      EXECUTION_RECORD_INSERT_ROUTE_READINESS_VALIDATOR_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    readinessInput,
    readinessResult,
    actualValidatorWrapperResult: input.boundaryCallWrapperResult,
    actualValidatorOutputSummary: actualValidatorSummary,
    normalizedPersistenceInput: proposedPersistenceInput,
    normalizedInputSummary,
    schemaReadinessSummary,
    generatedTypesSummary,
    migrationSummary,
    rlsSecuritySummary,
    serverOnlyBoundarySummary,
    idempotencyDuplicateSummary,
    auditCorrectionSummary,
    evidenceProvenanceSummary,
    dryRunProductionSeparationSummary,
    manualApprovalSummary,
    postInsertBoundarySummary:
      EXECUTION_RECORD_INSERT_ROUTE_READINESS_DEFAULT_POST_INSERT_BOUNDARY,
    serverOnlyRequestContext,
    metadata: {
      fixtureOnly: true,
      label: input.label,
      insertRouteReadinessOnly: true,
      noInsertRouteCall: true,
      noExecutionRecordCreated: true,
      noPersistenceWrite: true,
      noAuditAppend: true,
      noStatsUpdate: true,
      noRollbackCorrection: true,
      noTradeMutation: true,
      noBrokerOrderBehavior: true,
      noAvanzaBehavior: true,
    },
  };
}

function buildInsertRouteCallWrapperInput(input: {
  blocked: boolean;
  insertRouteReadinessValidatorInput: ExecutionRecordInsertRouteReadinessValidationInput;
  insertRouteReadinessValidatorResult: ExecutionRecordInsertRouteReadinessValidationResult;
  label: string;
}): ExecutionRecordInsertRouteCallInput {
  const readinessInput = input.insertRouteReadinessValidatorInput.readinessInput;

  return {
    contractVersion:
      EXECUTION_RECORD_INSERT_ROUTE_CALL_IMPLEMENTATION_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    routeMode: "dry_run",
    readinessValidationResult: input.insertRouteReadinessValidatorResult,
    readinessInput,
    readinessResult: input.insertRouteReadinessValidatorInput.readinessResult,
    normalizedPersistenceInput:
      input.insertRouteReadinessValidatorInput.normalizedPersistenceInput,
    routeModeMetadata: {
      mode: "dry_run",
      routeName: "/api/execution/records/insert",
      dryRunRouteName: "/api/execution/records/insert",
      productionRouteName: null,
      requestedAt: FIXTURE_TIMESTAMP,
      requestedBy: "dev-preview-fixture",
      serverOnlyRequestContext:
        input.insertRouteReadinessValidatorInput.serverOnlyRequestContext,
      metadata: {
        fixtureOnly: true,
        devPreviewOnly: true,
        dryRunRouteIsNotProductionInsert: true,
      },
    },
    insertRouteCallable: () => ({
      status: "insert_route_call_dry_run_only",
      dryRunResult: {
        accepted: true,
        dryRunOnly: true,
        fixtureOnly: true,
        productionInsertAttempted: false,
        supabaseWriteAttempted: false,
        auditAppendAttempted: false,
        statsUpdateAttempted: false,
        rollbackAttempted: false,
        tradeMutationAttempted: false,
        brokerOrderAttempted: false,
        avanzaBrowserAttempted: false,
        routeOutputIsNotFullPersistenceWorkflowCompletion: true,
      },
      routeValidationErrors: [],
      warnings: [
        "dry_run_route_not_production_route",
        "route_success_not_post_insert_mutation_approval",
        "insert_route_call_not_full_persistence_workflow",
        "stats_update_out_of_scope",
        "trade_mutation_out_of_scope",
        "broker_avanza_action_out_of_scope",
      ],
      metadata: {
        fixtureOnly: true,
        fixtureInjectedRouteCallableOnly: true,
        routeDiagnosticsOnly: true,
        dryRunOnly: true,
        noProductionInsert: true,
        noSupabaseWrite: true,
        noAuditAppend: true,
        noStatsUpdate: true,
        noRollbackCorrection: true,
        noTradeMutation: true,
        noBrokerOrderBehavior: true,
        noAvanzaBrowserBehavior: true,
      },
    }),
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      label: input.label,
      fixtureInjectedRouteCallableOnly: true,
      insertRouteWrapperDiagnosticsOnly: true,
      dryRunOnly: true,
      dryRunRouteIsNotProductionInsert: true,
      routeSuccessIsNotFullPersistenceWorkflowCompletion: true,
      routeSuccessIsNotPostInsertMutationApproval: true,
      noDirectSupabaseWrite: true,
      noDirectRouteHandlerCall: true,
      noAuditAppend: true,
      noStatsUpdate: true,
      noRollbackCorrection: true,
      noTradeMutation: true,
      noBrokerOrderBehavior: true,
      noAvanzaBrowserBehavior: true,
      blockedScenarioCallableShouldNotRun: input.blocked,
    },
  };
}

function buildProductionInsertRouteBoundaryValidatorInput(input: {
  blocked: boolean;
  insertRouteCallWrapperInput: ExecutionRecordInsertRouteCallInput;
  insertRouteCallWrapperResult: ExecutionRecordInsertRouteCallResult;
  insertRouteReadinessValidatorInput: ExecutionRecordInsertRouteReadinessValidationInput;
  insertRouteReadinessValidatorResult: ExecutionRecordInsertRouteReadinessValidationResult;
  label: string;
}): ExecutionRecordProductionInsertRouteBoundaryValidationInput {
  const normalizedPersistenceInput =
    input.insertRouteCallWrapperInput.normalizedPersistenceInput ?? null;
  const manualApprovalContext =
    input.insertRouteReadinessValidatorInput.manualApprovalSummary
      ?.manualApprovalContext ?? null;
  const serverOnlyRequestContext = {
    source: "execution_record_persistence_validator_integration_dev_fixture",
    fixtureOnly: true,
    devPreviewOnly: true,
    routeHandler: "/api/execution/records/insert",
    serviceRoleRestrictedToServer: !input.blocked,
    clientInitiatedWriteAllowed: false,
  };
  const boundaryInput: ExecutionRecordProductionInsertRouteBoundaryInput = {
    contractVersion:
      EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    requestedBy: "dev-preview-fixture",
    routeMode: "production",
    insertRouteCallWrapperResult: input.insertRouteCallWrapperResult,
    insertRouteReadinessValidationResult:
      input.insertRouteReadinessValidatorResult,
    normalizedPersistenceInput,
    currentStateSummary: {
      designExists: true,
      contractExists: true,
      productionRouteImplemented: false,
      productionRouteCalled: false,
      insertRouteCallWrapperExists: true,
      insertRouteCallWrapperDryRunOnly: true,
      devPreviewDiagnosticsOnly: true,
      generatedTypesPresent: !input.blocked,
      migrationApplicationProven: !input.blocked,
      rlsSecurityVerified: !input.blocked,
      serverOnlyProductionWriteBoundaryVerified: false,
      executionRecordCreationEnabled: false,
      persistenceWriteEnabled: false,
      blockedReasons: input.blocked
        ? ["generated_types_absent_or_unknown"]
        : [],
      warnings: ["production_route_not_called"],
      reviewItems: input.blocked
        ? ["schema_generated_types_migration_review"]
        : [],
      metadata: {
        fixtureOnly: true,
        label: input.label,
      },
    },
    preconditionSummary: {
      generatedTypesPresent: !input.blocked,
      migrationApplicationProven: !input.blocked,
      executionRecordsSchemaVerified: !input.blocked,
      rlsSecurityVerified: !input.blocked,
      serviceRoleServerOnlyAccessDefined: !input.blocked,
      routeAuthSecretModelDefined: !input.blocked,
      clientSideWriteImpossible: true,
      serverOnlyBoundaryProven: !input.blocked,
      normalizedPersistenceInputValidated:
        Boolean(normalizedPersistenceInput) && !input.blocked,
      insertRouteReadinessValidated:
        input.insertRouteReadinessValidatorResult.status ===
        "insert_route_readiness_validation_ready",
      insertRouteCallWrapperReassessed: true,
      idempotencyStrategyImplemented: !input.blocked,
      duplicatePreventionImplemented: !input.blocked,
      auditCorrectionMetadataComplete: !input.blocked,
      evidenceProvenanceComplete: !input.blocked,
      manualApprovalContextPresent: Boolean(manualApprovalContext),
      dryRunProductionSeparated: true,
      postInsertAuthoritiesFalse: true,
      blockedReasons: input.blocked
        ? ["generated_types_absent_or_unknown"]
        : [],
      warnings: ["production_route_requires_server_only_boundary"],
      reviewItems: input.blocked
        ? ["schema_generated_types_migration_review"]
        : [],
    },
    routeShapeSummary: {
      routeMode: "production",
      serverOnly: true,
      authenticated: !input.blocked,
      authorized: !input.blocked,
      idempotencyKeyRequired: true,
      duplicatePreventionRequired: true,
      normalizedInputOnly: true,
      uiStateOnlySourceAllowed: false,
      clientSideSupabaseInsertAllowed: false,
      returnsInsertedRecordIdOnly: true,
      returnsSafeSummaryOnly: true,
      postInsertMutationSideEffectsAllowed: false,
      devPreviewCallable: false,
      blockedReasons: [],
      warnings: ["production_route_not_implemented"],
      reviewItems: [],
    },
    allowedInputSummary: {
      normalizedPersistenceInput,
      normalizedExecutionRecordInputPresent:
        Boolean(normalizedPersistenceInput) && !input.blocked,
      idempotencyFingerprintMetadataPresent: !input.blocked,
      duplicatePreventionMetadataPresent: !input.blocked,
      finalBrokerEvidenceIdentifiersPresent: !input.blocked,
      auditCorrectionMetadataPresent: !input.blocked,
      evidenceProvenanceChainPresent: !input.blocked,
      manualApprovalMetadataPresent: Boolean(manualApprovalContext),
      serverOnlyRequestContextPresent: !input.blocked,
      generatedTypesSchemaReadinessProofPresent: !input.blocked,
      migrationProofPresent: !input.blocked,
      rlsSecurityProofPresent: !input.blocked,
      productionRouteModePresent: true,
      uiStateOnlySourceAllowed: false,
      fixtureInputAllowed: false,
      dryRunDiagnosticsAllowedAsProductionInput: false,
      blockedReasons: input.blocked
        ? ["generated_types_absent_or_unknown"]
        : [],
      warnings: [],
      reviewItems: input.blocked
        ? ["production_boundary_contract_review"]
        : [],
    },
    allowedOutputSummary: {
      routeStatus: "production_insert_route_boundary_ready_for_design_only",
      insertedExecutionRecordId: null,
      insertedExecutionRecordReference: null,
      duplicateDetected: false,
      duplicateMatches: [],
      blockedReasons: [],
      warnings: ["production_route_not_called"],
      reviewItems: [],
      safeRouteOutputSummary: {
        designOnly: true,
        diagnosticsOnly: true,
        productionRouteNotCalled: true,
      },
      auditAppendApprovalOutput: false,
      statsPnlUpdateApprovalOutput: false,
      rollbackCorrectionApprovalOutput: false,
      tradeMutationApprovalOutput: false,
      brokerOrderApprovalOutput: false,
      avanzaBrowserApprovalOutput: false,
      automaticModeApprovalOutput: false,
    },
    dryRunSeparationSummary: {
      sourceRouteMode: input.insertRouteCallWrapperInput.routeMode,
      sourceRouteCallStatus: input.insertRouteCallWrapperResult.status,
      dryRunRouteDiagnosticsOnly: true,
      dryRunResultIsProductionInsert: false,
      dryRunSuccessProvesProductionReadiness: false,
      productionRouteSeparate: true,
      productionRouteServerOnly: true,
      devPreviewMayCallProductionRoute: false,
      fixtureCallableMayCallProductionRoute: false,
      blockedReasons: [],
      warnings: ["dry_run_route_not_production_insert"],
      reviewItems: [],
    },
    securitySummary: {
      rlsSecurityProofPresent: !input.blocked,
      rlsPoliciesVerified: !input.blocked,
      routeAuthSecretModelDefined: !input.blocked,
      userRoleAssumptionsDocumented: !input.blocked,
      serviceRoleAssumptionsDocumented: !input.blocked,
      serviceRoleServerOnly: !input.blocked,
      clientSideWriteBlocked: true,
      browserWritable: false,
      brokerAutomationAuthority: false,
      avanzaBrowserAuthority: false,
      blockedReasons: input.blocked ? ["rls_security_unverified"] : [],
      warnings: input.blocked
        ? ["rls_security_required_before_production_insert"]
        : [],
      reviewItems: input.blocked ? ["rls_security_review"] : [],
    },
    serverOnlySummary: {
      serverOnlyRequestContext,
      serverOnlyBoundaryProven: !input.blocked,
      routeHandlerOnly: true,
      importedIntoClientCode: false,
      callableFromDevPreview: false,
      serviceRoleRestrictedToServer: !input.blocked,
      clientSideSupabaseInsertAllowed: false,
      localStorageWriteAllowed: false,
      blockedReasons: input.blocked ? ["server_only_boundary_missing"] : [],
      warnings: input.blocked
        ? ["production_route_requires_server_only_boundary"]
        : [],
      reviewItems: input.blocked ? ["server_only_boundary_review"] : [],
    },
    schemaGeneratedTypesMigrationSummary: {
      schemaReference: normalizedPersistenceInput?.schemaReference ?? {
        tableName: "execution_records",
        expectedColumnsVersion: "execution_records_v1",
        migrationVersion: "fixture-migration-proof",
      },
      expectedTableName: "execution_records",
      executionRecordsSchemaVerified: !input.blocked,
      generatedTypesPresent: !input.blocked,
      generatedTypesLocation: input.blocked
        ? null
        : "fixture-generated-types",
      executionRecordsTableTyped: !input.blocked,
      migrationApplicationProven: !input.blocked,
      migrationReference: input.blocked ? null : "fixture-migration-proof",
      targetEnvironment: "dev-preview-fixture",
      productionWriteReadinessBlockedBySchema: true,
      blockedReasons: input.blocked
        ? ["generated_types_absent_or_unknown"]
        : [],
      warnings: input.blocked
        ? ["generated_types_required_before_production_insert"]
        : [],
      reviewItems: input.blocked
        ? ["schema_generated_types_migration_review"]
        : [],
    },
    idempotencyDuplicateSummary: {
      idempotencyKey: normalizedPersistenceInput?.idempotencyKey ?? null,
      recordFingerprint: normalizedPersistenceInput?.recordFingerprint ?? null,
      sourceFingerprint: normalizedPersistenceInput?.sourceFingerprint ?? null,
      duplicatePreventionMetadataPresent: !input.blocked,
      idempotencyKeyPresent: Boolean(
        normalizedPersistenceInput?.idempotencyKey,
      ),
      duplicateCheckRequiredBeforeInsert: true,
      duplicateCheckPerformed: !input.blocked,
      duplicateDetected: false,
      duplicateMatches: [],
      duplicateBlocksInsert: true,
      blockedReasons: input.blocked ? ["duplicate_prevention_missing"] : [],
      warnings: input.blocked
        ? ["duplicate_prevention_required_before_insert"]
        : [],
      reviewItems: input.blocked
        ? ["idempotency_duplicate_prevention_review"]
        : [],
    },
    auditCorrectionSummary: {
      auditCorrectionMetadataPresent: !input.blocked,
      auditAppendAllowedByProductionInsert: false,
      correctionAllowedByProductionInsert: false,
      rollbackAllowedByProductionInsert: false,
      postInsertAuditRequiresSeparateBoundary: true,
      correctionRollbackRequiresSeparateBoundary: true,
      blockedReasons: input.blocked
        ? ["audit_correction_metadata_missing"]
        : [],
      warnings: ["audit_required_before_post_insert_mutation"],
      reviewItems: input.blocked ? ["audit_correction_review"] : [],
    },
    evidenceProvenanceSummary: {
      evidenceProvenanceChainPresent: !input.blocked,
      sourceFingerprintPresent: Boolean(
        normalizedPersistenceInput?.sourceFingerprint,
      ),
      finalBrokerEvidenceIdentifiersPresent: !input.blocked,
      brokerConfirmationEvidencePresent: !input.blocked,
      sourceEventIds:
        normalizedPersistenceInput?.auditMetadata.sourceEventIds ?? [],
      provenanceMetadataPresent: !input.blocked,
      manualApprovalContext,
      blockedReasons: input.blocked ? ["evidence_provenance_missing"] : [],
      warnings: [],
      reviewItems: input.blocked ? ["evidence_provenance_review"] : [],
    },
    manualApprovalContext,
    dryRunProductionSeparationMetadata: {
      dryRunRouteDiagnosticsOnly: true,
      dryRunResultIsProductionInsert: false,
      productionRouteSeparate: true,
    },
    postInsertBoundarySummary:
      EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_DEFAULT_POST_INSERT_BOUNDARY,
    safetyPolicy:
      EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_DEFAULT_SAFETY_POLICY,
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      label: input.label,
      productionBoundaryDiagnosticsOnly: true,
      productionRouteNotImplemented: true,
      productionRouteNotCalled: true,
      noExecutionRecordCreated: true,
      noPersistenceWrite: true,
    },
  };

  return {
    contractVersion:
      EXECUTION_RECORD_PRODUCTION_INSERT_ROUTE_BOUNDARY_VALIDATOR_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    requestedBy: "dev-preview-fixture",
    boundaryInput,
    boundaryResult: null,
    insertRouteCallWrapperResult: input.insertRouteCallWrapperResult,
    insertRouteReadinessValidationResult:
      input.insertRouteReadinessValidatorResult,
    normalizedPersistenceInput,
    schemaGeneratedTypesMigrationProof:
      boundaryInput.schemaGeneratedTypesMigrationSummary,
    rlsSecurityProof: boundaryInput.securitySummary,
    serviceRoleServerOnlyMetadata: boundaryInput.serverOnlySummary,
    routeAuthSecretModelMetadata: {
      fixtureOnly: true,
      routeAuthSecretModelDefined: !input.blocked,
      secretModel: "dev-preview-fixture-only",
    },
    serverOnlyRequestContext,
    idempotencyDuplicateMetadata: boundaryInput.idempotencyDuplicateSummary,
    auditCorrectionMetadata: boundaryInput.auditCorrectionSummary,
    evidenceProvenanceChain: boundaryInput.evidenceProvenanceSummary,
    manualApprovalMetadata: manualApprovalContext,
    dryRunProductionSeparationMetadata:
      boundaryInput.dryRunSeparationSummary,
    postInsertBoundaryMetadata: boundaryInput.postInsertBoundarySummary,
    safetyPolicy: boundaryInput.safetyPolicy,
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      explicitTriggerOnly: true,
      productionBoundaryDiagnosticsOnly: true,
      noProductionRouteCall: true,
      noInsertRouteCall: true,
      noExecutionRecordCreated: true,
      noPersistenceWrite: true,
    },
  };
}

function buildPostInsertBoundaryCategoryBase<TName extends string>(
  boundaryName: TName,
): ExecutionRecordPostInsertBoundaryCategorySummary & {
  boundaryName: TName;
} {
  return {
    boundaryName,
    representedSeparately: true,
    implemented: false,
    enabled: false,
    authorityAllowed: false,
    safeToExecute: false,
    insertSuccessApprovesBoundary: false,
    requiresSeparateValidator: true,
    requiresSeparateAuthority: true,
    requiresSeparateIdempotency: true,
    requiresSeparateEvidence: true,
    requiresSeparateFailureModel: true,
    requiresSeparateAuditTrail: true,
    blockedReasons: [],
    warnings: [],
    reviewItems: [],
  };
}

function buildPostInsertBoundaryCategorySummaries(): ExecutionRecordPostInsertBoundaryCategorySummaries {
  return {
    auditAppend: {
      ...buildPostInsertBoundaryCategoryBase("audit_append"),
      auditAppendAllowed: false,
      safeToAppendAudit: false,
      requiredAuditEventType:
        "execution_record_post_insert_audit_candidate_only",
      requiredInputPresent: true,
      requiredEvidencePresent: true,
      idempotencyKeyPresent: true,
      duplicatePreventionPresent: true,
      allowedOutputIsAuditCandidateOnly: true,
      statsPnlAuthority: false,
      tradeMutationAuthority: false,
    },
    statsPnlUpdate: {
      ...buildPostInsertBoundaryCategoryBase("stats_pnl_update"),
      statsPnlUpdateAllowed: false,
      safeToUpdateStats: false,
      executionRecordEvidencePresent: true,
      tradeLinkPresent: true,
      calculationSourcePresent: true,
      consistencyRequirementsMet: true,
      idempotencyKeyPresent: true,
      duplicatePreventionPresent: true,
      reconciliationRequirementsDefined: true,
      auditAppendAuthority: false,
      tradeMutationAuthority: false,
    },
    tradeReconciliation: {
      ...buildPostInsertBoundaryCategoryBase("trade_reconciliation"),
      tradeReconciliationAllowed: false,
      tradeMutationAllowed: false,
      safeToMutateTrade: false,
      executionRecordEvidencePresent: true,
      currentTradeStatePresent: true,
      mutationTypeConstraintsDefined: true,
      reconciliationChecksDefined: true,
      conflictHandlingDefined: true,
      idempotencyKeyPresent: true,
      brokerOrderAuthority: false,
      avanzaBrowserAuthority: false,
    },
    correctionRollback: {
      ...buildPostInsertBoundaryCategoryBase("correction_rollback"),
      correctionRollbackAllowed: false,
      safeToRollback: false,
      correctionEventRequirementsPresent: true,
      originalRecordReferencePresent: true,
      immutableRecordAssumptionsDocumented: true,
      compensatingActionModelDefined: true,
      rollbackLimitationsDocumented: true,
      auditRequirementsPresent: true,
    },
    failureRecovery: {
      ...buildPostInsertBoundaryCategoryBase("failure_recovery"),
      failureRecoveryAllowed: false,
      partialFailureStatesDefined: true,
      routeSuccessPostInsertFailureModeDefined: true,
      auditSuccessStatsFailureModeDefined: true,
      statsSuccessTradeMutationFailureModeDefined: true,
      retryModelDefined: true,
      idempotencyRequired: true,
      userVisibleReviewRequired: true,
    },
    uiStateUpdate: {
      ...buildPostInsertBoundaryCategoryBase("ui_state_update"),
      uiStateMutationAllowed: false,
      safeToUpdateUiState: false,
      readAfterWriteRequired: true,
      optimisticUpdateRestricted: true,
      staleDataHandlingDefined: true,
      confirmationDisplaySeparatedFromPostInsertCompletion: true,
      localOnlySourceOfTruthAllowed: false,
    },
    userNotification: {
      ...buildPostInsertBoundaryCategoryBase("user_notification"),
      userNotificationAllowed: false,
      safeToNotifyUser: false,
      notificationTriggersDefined: true,
      requiredSourceOfTruthPresent: true,
      failureRetryDefined: true,
      userReviewStatesDefined: true,
      mayImplyBrokerOrderExecution: false,
      mayImplyAvanzaBrowserCompletion: false,
    },
    brokerOrderFollowUp: {
      ...buildPostInsertBoundaryCategoryBase("broker_order_follow_up"),
      brokerOrderFollowUpAllowed: false,
      safeToRunBrokerAction: false,
      brokerOrderFollowUpDisabledByDefault: true,
      kopSaljTriggerAllowed: false,
      automaticModeApprovalAllowed: false,
      futureSeparateDesignRequired: true,
      manualConfirmationRequired: true,
    },
    avanzaBrowserFollowUp: {
      ...buildPostInsertBoundaryCategoryBase("avanza_browser_follow_up"),
      avanzaBrowserFollowUpAllowed: false,
      safeToRunAvanzaBrowserAction: false,
      avanzaBrowserFollowUpDisabledByDefault: true,
      browserActionAllowed: false,
      kopSaljTriggerAllowed: false,
      automaticModeApprovalAllowed: false,
      futureSeparateDesignRequired: true,
      manualConfirmationRequired: true,
    },
  };
}

function buildPostInsertBoundaryValidatorInput(input: {
  blocked: boolean;
  insertRouteCallWrapperInput: ExecutionRecordInsertRouteCallInput;
  insertRouteCallWrapperResult: ExecutionRecordInsertRouteCallResult;
  productionInsertRouteBoundaryValidatorResult: ExecutionRecordProductionInsertRouteBoundaryValidationResult;
}): ExecutionRecordPostInsertBoundaryValidationInput {
  const normalizedPersistenceInput =
    input.insertRouteCallWrapperInput.normalizedPersistenceInput ?? null;
  const executionRecordId = input.blocked
    ? null
    : "exec_record_persistence_preview_inserted_001";
  const categorySummaries = buildPostInsertBoundaryCategorySummaries();
  const insertResultProven =
    input.insertRouteCallWrapperResult.status === "insert_route_call_dry_run_only";
  const proof = input.blocked
    ? null
    : {
        fixtureOnly: true,
        devPreviewOnly: true,
      };
  const evidence: ExecutionRecordPostInsertBoundaryInput["executionRecordEvidence"] =
    {
      executionRecordId,
      executionRecordReference: null,
      executionRecordInsertResult: input.insertRouteCallWrapperResult,
      insertResultProven,
      insertedRecordSummary: executionRecordId
        ? {
            id: executionRecordId,
            fixtureOnly: true,
          }
        : null,
      normalizedExecutionRecordInput: normalizedPersistenceInput,
      executionRecordEvidencePresent: !input.blocked,
      executionRecordEvidenceProvenancePresent: !input.blocked,
      finalBrokerEvidenceIdentifiersPresent: !input.blocked,
      generatedTypesProofPresent: !input.blocked,
      migrationProofPresent: !input.blocked,
      rlsSecurityProofPresent: !input.blocked,
      serverOnlyProofPresent: !input.blocked,
      schemaReference: normalizedPersistenceInput?.schemaReference ?? null,
      auditCorrectionMetadata: normalizedPersistenceInput?.auditMetadata ?? null,
      manualApprovalContext: null,
      sourceReferences: normalizedPersistenceInput?.auditMetadata.sourceEventIds ?? [],
      blockedReasons: input.blocked
        ? [
            "execution_record_evidence_missing",
            "generated_types_absent_or_unknown",
            "migration_application_not_proven",
          ]
        : [],
      warnings: [],
      reviewItems: input.blocked ? ["execution_record_evidence_review"] : [],
      metadata: {
        fixtureOnly: true,
        devPreviewOnly: true,
        dryRunInsertRouteResultOnly: true,
      },
    };
  const idempotency: ExecutionRecordPostInsertBoundaryInput["idempotency"] = {
    idempotencyKey: normalizedPersistenceInput?.idempotencyKey ?? null,
    idempotencyFingerprint: normalizedPersistenceInput?.recordFingerprint ?? null,
    idempotencyMetadataPresent: Boolean(
      normalizedPersistenceInput?.idempotencyKey,
    ),
    duplicatePreventionMetadataPresent: !input.blocked,
    duplicateMatches: [],
    safeToRetry: false,
    retryRequiresReview: true,
    duplicateSideEffectsPrevented: !input.blocked,
    conflictingDuplicateDetected: false,
    blockedReasons: input.blocked ? ["duplicate_prevention_missing"] : [],
    warnings: [],
    reviewItems: input.blocked ? ["duplicate_prevention_review"] : [],
  };
  const failureModel: ExecutionRecordPostInsertBoundaryResult["failureModel"] =
    {
      partialFailureStatesKnown: true,
      insertSucceededPostInsertFailedPossible: true,
      auditSucceededStatsFailedPossible: true,
      statsSucceededTradeMutationFailedPossible: true,
      uiRefreshFailedPossible: true,
      notificationFailedPossible: true,
      retryModelDefined: true,
      retriesRequireStableIdempotency: true,
      userVisibleReviewRequired: true,
      hiddenPartialFailureAllowed: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
    };
  const dependencies: ExecutionRecordPostInsertBoundaryResult["dependencies"] =
    {
      generatedTypesPresent: !input.blocked,
      migrationApplicationProven: !input.blocked,
      rlsSecurityVerified: !input.blocked,
      serverOnlyBoundaryVerified: !input.blocked,
      productionInsertRouteImplemented: false,
      productionInsertRouteCalled: false,
      postInsertImplementationPresent: false,
      auditAppendImplementationPresent: false,
      statsPnlUpdateImplementationPresent: false,
      tradeReconciliationImplementationPresent: false,
      correctionRollbackImplementationPresent: false,
      uiStateUpdateImplementationPresent: false,
      userNotificationImplementationPresent: false,
      brokerOrderFollowUpImplementationPresent: false,
      avanzaBrowserFollowUpImplementationPresent: false,
      blockedReasons: input.blocked
        ? [
            "generated_types_absent_or_unknown",
            "migration_application_not_proven",
          ]
        : [],
      warnings: [],
      reviewItems: input.blocked ? ["generated_types_review"] : [],
    };
  const boundaryInput: ExecutionRecordPostInsertBoundaryInput = {
    contractVersion: EXECUTION_RECORD_POST_INSERT_BOUNDARY_CONTRACT_VERSION,
    status: input.blocked
      ? "post_insert_boundary_blocked"
      : "post_insert_boundary_contract_only",
    productionInsertRouteResult: null,
    futureInsertResultMetadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      dryRunRouteResultIsNotProductionInsert: true,
      productionBoundaryStatus:
        input.productionInsertRouteBoundaryValidatorResult.status,
    },
    executionRecordId,
    executionRecordReference: null,
    executionRecordEvidence: evidence,
    finalBrokerEvidenceIdentifiers: proof,
    normalizedExecutionRecordInput: normalizedPersistenceInput,
    insertedRecordSummary: executionRecordId
      ? {
          id: executionRecordId,
          fixtureOnly: true,
        }
      : null,
    generatedTypesProof: proof,
    migrationProof: proof,
    rlsSecurityProof: proof,
    serverOnlyProof: proof,
    idempotency,
    duplicatePrevention: proof,
    auditCorrectionMetadata: normalizedPersistenceInput?.auditMetadata ?? null,
    currentTradeState: proof,
    statsPnlCalculationSource: proof,
    uiStateSourceOfTruth: proof,
    notificationContext: proof,
    brokerOrderFollowUpMetadata: {
      disabledUnlessSeparatelyApproved: true,
      fixtureOnly: true,
    },
    avanzaBrowserFollowUpMetadata: {
      disabledUnlessSeparatelyApproved: true,
      fixtureOnly: true,
    },
    authority: EXECUTION_RECORD_POST_INSERT_BOUNDARY_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy: EXECUTION_RECORD_POST_INSERT_BOUNDARY_DEFAULT_SAFETY_POLICY,
    categorySummaries,
    blockedReasons: input.blocked
      ? ["generated_types_absent_or_unknown", "migration_application_not_proven"]
      : [],
    warnings: [],
    reviewItems: input.blocked ? ["generated_types_review"] : [],
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      diagnosticsOnly: true,
      noPostInsertActions: true,
    },
  };
  const boundaryResult: ExecutionRecordPostInsertBoundaryResult = {
    contractVersion: EXECUTION_RECORD_POST_INSERT_BOUNDARY_CONTRACT_VERSION,
    status: boundaryInput.status,
    decisionRecommendation: input.blocked
      ? "blocked_do_not_run_post_insert_actions"
      : "contract_only_do_not_run_post_insert_actions",
    contractOnly: true,
    postInsertActionsImplemented: false,
    insertSuccessIsFullWorkflowCompletion: false,
    insertSuccessApprovesPostInsertActions: false,
    authority: boundaryInput.authority,
    safetyPolicy: boundaryInput.safetyPolicy,
    evidence,
    idempotency,
    failureModel,
    dependencies,
    categorySummaries,
    blockedReasons: input.blocked
      ? ["generated_types_absent_or_unknown", "migration_application_not_proven"]
      : [],
    warnings: [],
    reviewItems: input.blocked ? ["generated_types_review"] : [],
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      diagnosticsOnly: true,
    },
  };

  return {
    contractVersion:
      EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATOR_CONTRACT_VERSION,
    boundaryInput,
    boundaryResult,
    boundaryCategorySummaries: categorySummaries,
    futureExecutionRecordInsertResultMetadata:
      boundaryInput.futureInsertResultMetadata,
    executionRecordId,
    executionRecordReference: null,
    insertedExecutionRecordSummary: boundaryInput.insertedRecordSummary,
    executionRecordEvidence: evidence,
    normalizedExecutionRecordInput:
      normalizedPersistenceInput as unknown as Record<string, unknown> | null,
    generatedTypesProof: proof,
    migrationProof: proof,
    rlsSecurityProof: proof,
    serverOnlyProof: proof,
    idempotency,
    duplicatePrevention: proof,
    auditCorrectionMetadata: normalizedPersistenceInput?.auditMetadata ?? null,
    currentTradeState: proof,
    statsPnlCalculationSource: proof,
    uiStateSourceOfTruth: proof,
    notificationContext: proof,
    brokerOrderFollowUpMetadata: boundaryInput.brokerOrderFollowUpMetadata,
    avanzaBrowserFollowUpMetadata:
      boundaryInput.avanzaBrowserFollowUpMetadata,
    requestedCategoryValidations: [
      "auditAppend",
      "statsPnlUpdate",
      "tradeReconciliation",
      "correctionRollback",
      "failureRecovery",
      "uiStateUpdate",
      "userNotification",
      "brokerOrderFollowUp",
      "avanzaBrowserFollowUp",
    ],
    authority:
      EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy:
      EXECUTION_RECORD_POST_INSERT_BOUNDARY_VALIDATION_DEFAULT_SAFETY_POLICY,
    blockedReasons: input.blocked
      ? ["generated_types_absent_or_unknown", "migration_application_not_proven"]
      : [],
    warnings: [],
    reviewItems: input.blocked ? ["generated_types_review"] : [],
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      diagnosticsOnly: true,
      explicitTriggerOnly: true,
      noRouteCall: true,
      noPersistenceWrite: true,
      noPostInsertActions: true,
    },
  };
}

function buildAuditAppendBoundaryValidatorInput(input: {
  blocked: boolean;
  insertRouteCallWrapperInput: ExecutionRecordInsertRouteCallInput;
  insertRouteCallWrapperResult: ExecutionRecordInsertRouteCallResult;
  postInsertBoundaryValidatorInput: ExecutionRecordPostInsertBoundaryValidationInput;
  postInsertBoundaryValidatorResult: ExecutionRecordPostInsertBoundaryValidationResult;
  productionInsertRouteBoundaryValidatorResult: ExecutionRecordProductionInsertRouteBoundaryValidationResult;
}): ExecutionRecordAuditAppendBoundaryValidationInput {
  const normalizedPersistenceInput =
    input.insertRouteCallWrapperInput.normalizedPersistenceInput ?? null;
  const executionRecordId =
    input.postInsertBoundaryValidatorInput.executionRecordId ?? null;
  const executionRecordReference: PersistedExecutionRecordReference | null =
    executionRecordId && normalizedPersistenceInput
      ? {
          recordId: executionRecordId,
          tableName: "execution_records",
          idempotencyKey: normalizedPersistenceInput.idempotencyKey,
          recordFingerprint: normalizedPersistenceInput.recordFingerprint,
          broker: normalizedPersistenceInput.brokerConfirmation.broker,
          brokerOrderId:
            normalizedPersistenceInput.brokerConfirmation.brokerOrderId,
          brokerConfirmationId:
            normalizedPersistenceInput.brokerConfirmation.brokerConfirmationId,
          ticker: normalizedPersistenceInput.candidate.ticker,
          side: normalizedPersistenceInput.candidate.side,
          executionMode: normalizedPersistenceInput.candidate.executionMode,
          executionPhase: normalizedPersistenceInput.candidate.executionPhase,
          sourceRecommendationId:
            normalizedPersistenceInput.association.sourceRecommendationId,
          sourcePositionId:
            normalizedPersistenceInput.association.sourcePositionId,
          confirmedAt: normalizedPersistenceInput.brokerConfirmation.confirmedAt,
          persistedAt: FIXTURE_TIMESTAMP,
        }
      : null;
  const insertedExecutionRecordSummary =
    executionRecordId && normalizedPersistenceInput
      ? {
          id: executionRecordId,
          recordFingerprint: normalizedPersistenceInput.recordFingerprint,
          idempotencyKey: normalizedPersistenceInput.idempotencyKey,
          fixtureOnly: true,
          dryRunInsertRouteResultOnly: true,
        }
      : null;
  const proof = input.blocked
    ? null
    : {
        fixtureOnly: true,
        devPreviewOnly: true,
        source: "execution_record_persistence_validator_integration_fixture",
      };
  const auditEventType = "execution_record_inserted";
  const auditEventSource =
    "execution_record_persistence_validator_integration_dev_preview";
  const candidateFingerprint = executionRecordId
    ? `audit_append_candidate_${executionRecordId}`
    : null;
  const duplicatePreventionKey = normalizedPersistenceInput
    ? `audit_append_duplicate_${normalizedPersistenceInput.recordFingerprint}`
    : null;
  const sourceReferences =
    normalizedPersistenceInput?.auditMetadata.sourceEventIds ?? [];
  const auditEventPayloadSummary =
    executionRecordId && normalizedPersistenceInput
      ? {
          executionRecordId,
          ticker: normalizedPersistenceInput.candidate.ticker,
          side: normalizedPersistenceInput.candidate.side,
          executionMode: normalizedPersistenceInput.candidate.executionMode,
          executionPhase: normalizedPersistenceInput.candidate.executionPhase,
          idempotencyKey: normalizedPersistenceInput.idempotencyKey,
          recordFingerprint: normalizedPersistenceInput.recordFingerprint,
          fixtureOnly: true,
        }
      : null;
  const actorSourceMetadata = input.blocked
    ? null
    : {
        actor: "dev_preview_fixture",
        source: auditEventSource,
        fixtureOnly: true,
        explicitTriggerOnly: true,
      };
  const timestampSourceClockMetadata = input.blocked
    ? null
    : {
        requestedAt: FIXTURE_TIMESTAMP,
        sourceClock: "fixture",
        fixtureOnly: true,
      };
  const blockedReasons: ExecutionRecordAuditAppendBoundaryResult["blockedReasons"] =
    input.blocked
      ? [
          "execution_record_reference_missing",
          "execution_record_evidence_missing",
          "evidence_provenance_missing",
          "generated_types_absent_or_unknown",
          "migration_application_not_proven",
        ]
      : [];
  const reviewItems: ExecutionRecordAuditAppendBoundaryResult["reviewItems"] =
    input.blocked
      ? [
          "execution_record_reference_review",
          "execution_record_evidence_review",
          "generated_types_review",
          "migration_application_review",
        ]
      : [];
  const candidate: ExecutionRecordAuditAppendBoundaryInput["candidate"] = {
    auditEventType,
    auditEventSource,
    auditEventPayloadSummary,
    actorSourceMetadata,
    timestampSourceClockMetadata,
    executionRecordId,
    executionRecordReference,
    candidateFingerprint,
    candidateCreatedAt: FIXTURE_TIMESTAMP,
    payloadExplainable: !input.blocked,
    noSecretPayloadExposure: true,
    noLocalOnlySourceOfTruth: true,
    noBrokerAvanzaAssumptions: true,
    blockedReasons,
    warnings: [],
    reviewItems,
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      diagnosticsOnly: true,
      noAuditAppend: true,
    },
  };
  const evidence: ExecutionRecordAuditAppendBoundaryInput["evidence"] = {
    executionRecordId,
    executionRecordReference,
    insertedExecutionRecordSummary,
    normalizedExecutionRecordInput: normalizedPersistenceInput,
    productionInsertRouteResultMetadata: {
      status: input.insertRouteCallWrapperResult.status,
      dryRunOnly: true,
      fixtureOnly: true,
    },
    productionInsertBoundaryResult: null,
    postInsertBoundaryInput: input.postInsertBoundaryValidatorInput.boundaryInput,
    postInsertBoundaryResult:
      input.postInsertBoundaryValidatorInput.boundaryResult,
    postInsertValidatorResult: input.postInsertBoundaryValidatorResult,
    postInsertOrchestratorResult: null,
    auditCorrectionMetadata: normalizedPersistenceInput?.auditMetadata ?? null,
    schemaReference: normalizedPersistenceInput?.schemaReference ?? null,
    executionRecordEvidencePresent: !input.blocked,
    evidenceProvenancePresent: !input.blocked,
    actorSourceMetadataPresent: !input.blocked,
    timestampSourceClockMetadataPresent: !input.blocked,
    generatedTypesProofPresent: !input.blocked,
    migrationProofPresent: !input.blocked,
    rlsSecurityProofPresent: !input.blocked,
    serverOnlyProofPresent: !input.blocked,
    auditSchemaProofPresent: !input.blocked,
    sourceReferences,
    blockedReasons,
    warnings: [],
    reviewItems,
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      dryRunInsertRouteResultOnly: true,
      postInsertValidatorDiagnosticsOnly: true,
    },
  };
  const idempotency: ExecutionRecordAuditAppendBoundaryInput["idempotency"] = {
    executionRecordId,
    auditEventKey: executionRecordId
      ? `audit_event_execution_record_inserted_${executionRecordId}`
      : null,
    idempotencyKey: normalizedPersistenceInput?.idempotencyKey ?? null,
    sourceEventFingerprint:
      normalizedPersistenceInput?.sourceFingerprint ?? null,
    candidateFingerprint,
    idempotencyMetadataPresent: Boolean(
      normalizedPersistenceInput?.idempotencyKey,
    ),
    stableAuditEventKeyPresent: Boolean(executionRecordId),
    sourceEventFingerprintPresent: Boolean(
      normalizedPersistenceInput?.sourceFingerprint,
    ),
    safeToRetry: false,
    retryRequiresManualReview: true,
    blockedReasons: input.blocked ? ["idempotency_key_missing"] : [],
    warnings: [],
    reviewItems: input.blocked ? ["idempotency_review"] : [],
    metadata: {
      fixtureOnly: true,
      retryDiagnosticsOnly: true,
    },
  };
  const duplicatePrevention: ExecutionRecordAuditAppendBoundaryInput["duplicatePrevention"] =
    {
      duplicatePreventionKey,
      duplicatePreventionMetadataPresent: !input.blocked,
      duplicateMatches: [],
      duplicateAuditEventDetected: false,
      duplicateAuditEventBlocked: true,
      duplicateLookupRequiredBeforeWrite: true,
      blockedReasons: input.blocked
        ? ["duplicate_prevention_key_missing"]
        : [],
      warnings: [],
      reviewItems: input.blocked ? ["duplicate_prevention_review"] : [],
      metadata: {
        fixtureOnly: true,
        duplicateLookupNotExecuted: true,
        noAuditWrite: true,
      },
    };
  const failureModel: ExecutionRecordAuditAppendBoundaryInput["failureModel"] =
    {
      auditBlockedAfterInsertSuccessRepresented: true,
      auditDuplicateDetectedRepresented: true,
      auditValidationFailedRepresented: true,
      futureAuditWriteFailedRepresented: true,
      auditRetryBlockedWithoutIdempotencyRepresented: true,
      downstreamActionsRemainBlockedRepresented: true,
      partialFailureModelPresent: true,
      hiddenPartialFailureAllowed: false,
      manualReviewRequiredForPartialFailure: true,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
        downstreamActionsRemainBlocked: true,
      },
    };
  const dependencies: ExecutionRecordAuditAppendBoundaryInput["dependencies"] =
    {
      auditAppendBoundaryContractPresent: true,
      auditAppendValidatorContractPresent: true,
      auditAppendValidatorPresent: true,
      auditAppendImplementationPresent: false,
      auditWriterPresent: false,
      auditWritePathPresent: false,
      productionInsertRouteImplemented: false,
      productionInsertWritePathPresent: false,
      postInsertBoundaryContractPresent: true,
      postInsertValidatorPresent: true,
      postInsertOrchestratorImplemented: false,
      generatedTypesPresent: !input.blocked,
      migrationApplicationProven: !input.blocked,
      rlsSecurityVerified: !input.blocked,
      serverOnlyBoundaryVerified: !input.blocked,
      auditSchemaProofPresent: !input.blocked,
      blockedReasons: input.blocked
        ? [
            "generated_types_absent_or_unknown",
            "migration_application_not_proven",
          ]
        : [],
      warnings: [],
      reviewItems: input.blocked
        ? ["generated_types_review", "migration_application_review"]
        : [],
      metadata: {
        fixtureOnly: true,
        auditWriterPresent: false,
        auditWritePathPresent: false,
      },
    };
  const boundaryInput: ExecutionRecordAuditAppendBoundaryInput = {
    contractVersion: EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    requestedBy: "execution_record_persistence_validator_integration_fixture",
    executionRecordId,
    executionRecordReference,
    insertedExecutionRecordSummary,
    executionRecordEvidence: evidence,
    normalizedExecutionRecordInput: normalizedPersistenceInput,
    productionInsertRouteResultMetadata: evidence.productionInsertRouteResultMetadata,
    productionInsertBoundaryResult: null,
    postInsertBoundaryInput: input.postInsertBoundaryValidatorInput.boundaryInput,
    postInsertBoundaryResult:
      input.postInsertBoundaryValidatorInput.boundaryResult,
    postInsertValidatorResult: input.postInsertBoundaryValidatorResult,
    postInsertOrchestratorResult: null,
    auditEventType,
    auditEventSource,
    auditEventPayloadSummary,
    actorSourceMetadata,
    timestampSourceClockMetadata,
    idempotencyKey: normalizedPersistenceInput?.idempotencyKey ?? null,
    duplicatePreventionKey,
    generatedTypesProof: proof,
    migrationProof: proof,
    rlsSecurityProof: proof,
    serverOnlyProof: proof,
    auditSchemaProof: proof,
    manualReviewMetadata: null,
    failureRetryMetadata: {
      fixtureOnly: true,
      retriesRequireManualReview: true,
      safeToRetry: false,
    },
    candidate,
    evidence,
    idempotency,
    duplicatePrevention,
    failureModel,
    dependencies,
    authority: EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy:
      EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_DEFAULT_SAFETY_POLICY,
    blockedReasons,
    warnings: [],
    reviewItems,
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      diagnosticsOnly: true,
      designReadinessOnly: true,
      noAuditAppend: true,
      noAuditWrite: true,
      noPersistenceWrite: true,
      noDownstreamActions: true,
    },
  };
  const boundaryResult: ExecutionRecordAuditAppendBoundaryResult = {
    contractVersion: EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_CONTRACT_VERSION,
    status: input.blocked
      ? "audit_append_boundary_blocked"
      : "audit_append_boundary_contract_only",
    decisionRecommendation: input.blocked
      ? "blocked_do_not_append_audit"
      : "contract_only_do_not_append_audit",
    contractOnly: true,
    auditAppendImplemented: false,
    auditWriterImplemented: false,
    auditAppendAllowed: false,
    safeToAppendAudit: false,
    insertSuccessIsAuditAppendApproval: false,
    postInsertValidatorReadinessIsAuditAppendApproval: false,
    orchestratorContractReadinessIsAuditAppendApproval: false,
    auditSuccessApprovesStatsPnlUpdate: false,
    auditSuccessApprovesTradeMutation: false,
    auditSuccessApprovesTradeReconciliation: false,
    auditSuccessApprovesCorrectionRollback: false,
    auditSuccessApprovesUiUpdate: false,
    auditSuccessApprovesNotification: false,
    auditSuccessApprovesBrokerOrderFollowUp: false,
    auditSuccessApprovesAvanzaBrowserFollowUp: false,
    candidate,
    evidence,
    idempotency,
    duplicatePrevention,
    failureModel,
    dependencies,
    authority: boundaryInput.authority,
    safetyPolicy: boundaryInput.safetyPolicy,
    recommendedNextManualReview: null,
    blockedReasons,
    warnings: [],
    reviewItems,
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      diagnosticsOnly: true,
      noAuditAppend: true,
      noAuditWrite: true,
    },
  };

  return {
    contractVersion:
      EXECUTION_RECORD_AUDIT_APPEND_BOUNDARY_VALIDATOR_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    requestedBy: "execution_record_persistence_validator_integration_fixture",
    auditBoundaryInput: boundaryInput,
    auditBoundaryResult: boundaryResult,
    auditEventCandidate: candidate,
    executionRecordId,
    executionRecordReference,
    insertedExecutionRecordSummary,
    executionRecordEvidence: evidence,
    auditEventType,
    auditEventSource,
    auditEventPayloadSummary,
    actorSourceMetadata,
    timestampSourceClockMetadata,
    idempotencyKey: normalizedPersistenceInput?.idempotencyKey ?? null,
    duplicatePreventionKey,
    generatedTypesProof: proof,
    migrationProof: proof,
    rlsSecurityProof: proof,
    serverOnlyProof: proof,
    auditSchemaTableProof: proof,
    manualReviewMetadata: null,
    failureRetryMetadata: boundaryInput.failureRetryMetadata,
    boundaryAuthority: boundaryInput.authority,
    boundarySafetyPolicy: boundaryInput.safetyPolicy,
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      diagnosticsOnly: true,
      explicitTriggerOnly: true,
      noAuditAppend: true,
      noAuditWrite: true,
      noRouteCall: true,
      noPersistenceWrite: true,
      noStatsPnlUpdate: true,
      noTradeMutation: true,
      noBrokerAvanzaBehavior: true,
    },
  };
}

function buildAuditAppendWriterValidationInput(input: {
  auditAppendBoundaryValidatorInput: ExecutionRecordAuditAppendBoundaryValidationInput;
  auditAppendBoundaryValidatorResult: ExecutionRecordAuditAppendBoundaryValidationResult;
  blocked: boolean;
}): ExecutionRecordAuditAppendWriterValidationInput {
  const boundaryInput =
    input.auditAppendBoundaryValidatorInput.auditBoundaryInput!;
  const boundaryResult =
    input.auditAppendBoundaryValidatorInput.auditBoundaryResult!;
  const executionRecordId = input.auditAppendBoundaryValidatorInput.executionRecordId;
  const executionRecordReference =
    input.auditAppendBoundaryValidatorInput.executionRecordReference ?? null;
  const executionRecordEvidence =
    input.auditAppendBoundaryValidatorInput.executionRecordEvidence ?? null;
  const auditEventCandidate =
    input.auditAppendBoundaryValidatorInput.auditEventCandidate ?? null;
  const proof = input.blocked
    ? null
    : {
        fixtureOnly: true,
        devPreviewOnly: true,
        source: "execution_record_persistence_validator_integration_fixture",
      };
  const idempotencyKey =
    input.auditAppendBoundaryValidatorInput.idempotencyKey ?? null;
  const duplicatePreventionKey =
    input.auditAppendBoundaryValidatorInput.duplicatePreventionKey ?? null;
  const sourceReferences = executionRecordEvidence?.sourceReferences ?? [];
  const writerBlockedReasons: ExecutionRecordAuditAppendWriterResult["blockedReasons"] =
    input.blocked
      ? [
          "execution_record_reference_missing",
          "execution_record_evidence_missing",
          "evidence_provenance_missing",
          "generated_types_absent_or_unknown",
          "migration_application_not_proven",
        ]
      : [];
  const writerReviewItems: ExecutionRecordAuditAppendWriterResult["reviewItems"] =
    input.blocked
      ? [
          "execution_record_reference_review",
          "execution_record_evidence_review",
          "generated_types_review",
          "migration_application_review",
        ]
      : [];

  const auditEvent: ExecutionRecordAuditAppendWriterInput["auditEvent"] = {
    auditEventType: input.auditAppendBoundaryValidatorInput.auditEventType,
    auditEventSource: input.auditAppendBoundaryValidatorInput.auditEventSource,
    auditEventPayloadSummary:
      input.auditAppendBoundaryValidatorInput.auditEventPayloadSummary,
    auditEventCandidate,
    actorSourceMetadata:
      input.auditAppendBoundaryValidatorInput.actorSourceMetadata,
    timestampSourceClockMetadata:
      input.auditAppendBoundaryValidatorInput.timestampSourceClockMetadata,
    executionRecordId,
    executionRecordReference,
    candidateFingerprint: auditEventCandidate?.candidateFingerprint ?? null,
    payloadExplainable: !input.blocked,
    noSecretPayloadExposure: true,
    noLocalOnlySourceOfTruth: true,
    noBrokerAvanzaAssumptions: true,
    blockedReasons: writerBlockedReasons,
    warnings: [],
    reviewItems: writerReviewItems,
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      diagnosticsOnly: true,
      noAuditWrite: true,
    },
  };
  const evidence: ExecutionRecordAuditAppendWriterInput["evidence"] = {
    validatedAuditBoundaryInput: boundaryInput,
    validatedAuditBoundaryResult: boundaryResult,
    auditValidatorResult: input.auditAppendBoundaryValidatorResult,
    postInsertOrchestratorResult: null,
    productionInsertBoundaryResult: null,
    executionRecordId,
    executionRecordReference,
    executionRecordEvidence,
    normalizedExecutionRecordInput:
      boundaryInput.normalizedExecutionRecordInput,
    auditCorrectionMetadata:
      boundaryInput.evidence.auditCorrectionMetadata,
    schemaReference:
      boundaryInput.normalizedExecutionRecordInput?.schemaReference ?? null,
    evidencePresent: !input.blocked,
    evidenceProvenancePresent: !input.blocked,
    sourceReferences,
    blockedReasons: writerBlockedReasons,
    warnings: [],
    reviewItems: writerReviewItems,
    metadata: {
      fixtureOnly: true,
      validatedAuditBoundaryResultOnly: true,
    },
  };
  const idempotency: ExecutionRecordAuditAppendWriterInput["idempotency"] = {
    idempotencyKey,
    auditEventKey:
      boundaryInput.idempotency.auditEventKey,
    sourceEventFingerprint:
      boundaryInput.idempotency.sourceEventFingerprint,
    executionRecordId,
    executionRecordFingerprint:
      boundaryInput.normalizedExecutionRecordInput?.recordFingerprint ?? null,
    candidateFingerprint: auditEvent.candidateFingerprint,
    idempotencyMetadataPresent: Boolean(idempotencyKey),
    stableAuditEventKeyPresent: Boolean(
      boundaryInput.idempotency.auditEventKey,
    ),
    sourceEventFingerprintPresent: Boolean(
      boundaryInput.idempotency.sourceEventFingerprint,
    ),
    safeToRetry: false,
    retryRequiresManualReview: true,
    blockedReasons: input.blocked ? ["idempotency_key_missing"] : [],
    warnings: [],
    reviewItems: input.blocked ? ["idempotency_review"] : [],
    metadata: {
      fixtureOnly: true,
      retryDiagnosticsOnly: true,
    },
  };
  const duplicatePrevention:
    ExecutionRecordAuditAppendWriterInput["duplicatePrevention"] = {
      duplicatePreventionKey,
      duplicatePreventionMetadataPresent: !input.blocked,
      duplicateMatches: [],
      duplicateAuditEventDetected: false,
      duplicateAuditWriteBlocked: true,
      duplicateLookupRequiredBeforeWrite: true,
      writeConflictDetected: false,
      blockedReasons: input.blocked
        ? ["duplicate_prevention_key_missing"]
        : [],
      warnings: [],
      reviewItems: input.blocked ? ["duplicate_prevention_review"] : [],
      metadata: {
        fixtureOnly: true,
        duplicateLookupNotExecuted: true,
        noAuditWrite: true,
      },
    };
  const failure: ExecutionRecordAuditAppendWriterInput["failure"] = {
    validationBlockedBeforeWriterRepresented: input.blocked,
    writerBlockedRepresented: true,
    duplicateDetectedRepresented: true,
    writeFailedRepresented: true,
    unknownWriteStatusRepresented: true,
    partialFailureAfterWriteRepresented: true,
    retryPolicyPresent: true,
    retryRequiresStableIdempotency: true,
    manualReviewRequired: true,
    downstreamActionsRemainBlocked: true,
    hiddenPartialFailureAllowed: false,
    blockedReasons: [],
    warnings: [],
    reviewItems: [],
    metadata: {
      fixtureOnly: true,
      downstreamActionsRemainBlocked: true,
    },
  };
  const dependencies: ExecutionRecordAuditAppendWriterInput["dependencies"] = {
    auditWriterContractPresent: true,
    auditWriterImplemented: false,
    auditAppendImplementationPresent: false,
    auditRouteImplemented: false,
    auditWritePathPresent: false,
    auditSchemaTableProven: !input.blocked,
    generatedTypesPresent: !input.blocked,
    migrationApplicationProven: !input.blocked,
    rlsSecurityVerified: !input.blocked,
    serverOnlyBoundaryVerified: !input.blocked,
    productionInsertRouteImplemented: false,
    productionInsertWritePathPresent: false,
    postInsertOrchestratorImplemented: false,
    blockedReasons: input.blocked
      ? ["generated_types_absent_or_unknown", "migration_application_not_proven"]
      : [],
    warnings: [],
    reviewItems: input.blocked
      ? ["generated_types_review", "migration_application_review"]
      : [],
    metadata: {
      fixtureOnly: true,
      auditWriterImplemented: false,
      auditWritePathPresent: false,
    },
  };
  const serverOnlySecurity:
    ExecutionRecordAuditAppendWriterInput["serverOnlySecurity"] = {
      serverOnlyExecutionContextPresent: !input.blocked,
      serviceRoleExecutionContextPresent: !input.blocked,
      serviceRoleSecretExposed: false,
      serviceRoleSecretValueIncluded: false,
      clientSideWriteBlocked: true,
      safeToWriteFromClient: false,
      safeToUseServiceRoleInClient: false,
      routeAuthBoundaryVerified: !input.blocked,
      rlsSecurityVerified: !input.blocked,
      serverOnlyBoundaryVerified: !input.blocked,
      safeEvidenceLoggingOnly: true,
      blockedReasons: input.blocked
        ? ["rls_security_unverified", "server_only_boundary_unverified"]
        : [],
      warnings: input.blocked
        ? ["rls_security_required_before_audit_write"]
        : [],
      reviewItems: input.blocked
        ? ["rls_security_review", "server_only_boundary_review"]
        : [],
      metadata: {
        fixtureOnly: true,
        serverOnlyProof: proof,
      },
    };
  const auditWriterContractInput: ExecutionRecordAuditAppendWriterInput = {
    contractVersion: EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    requestedBy: "execution_record_persistence_validator_integration_fixture",
    validatedAuditBoundaryInput: boundaryInput,
    validatedAuditBoundaryResult: boundaryResult,
    auditValidatorResult: input.auditAppendBoundaryValidatorResult,
    auditEventCandidate,
    auditEvent,
    executionRecordId,
    executionRecordReference,
    executionRecordEvidence,
    normalizedExecutionRecordInput:
      boundaryInput.normalizedExecutionRecordInput,
    auditEventType: boundaryInput.auditEventType,
    auditEventSource: boundaryInput.auditEventSource,
    auditEventPayloadSummary: boundaryInput.auditEventPayloadSummary,
    actorSourceMetadata: boundaryInput.actorSourceMetadata,
    timestampSourceClockMetadata: boundaryInput.timestampSourceClockMetadata,
    idempotencyKey,
    duplicatePreventionKey,
    auditSchemaTableProof: proof,
    generatedTypesProof: proof,
    migrationProof: proof,
    rlsSecurityProof: proof,
    serverOnlyProof: proof,
    serviceRoleServerOnlyExecutionContext: proof,
    manualReviewMetadata: null,
    failureRetryMetadata: boundaryInput.failureRetryMetadata,
    evidence,
    idempotency,
    duplicatePrevention,
    failure,
    dependencies,
    serverOnlySecurity,
    authority: EXECUTION_RECORD_AUDIT_APPEND_WRITER_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy: EXECUTION_RECORD_AUDIT_APPEND_WRITER_DEFAULT_SAFETY_POLICY,
    blockedReasons: writerBlockedReasons,
    warnings: ["contract_only", "audit_writer_not_implemented"],
    reviewItems: writerReviewItems,
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      diagnosticsOnly: true,
      noAuditWrite: true,
      noAuditAppend: true,
      noDownstreamActions: true,
    },
  };
  const auditWriterContractResult: ExecutionRecordAuditAppendWriterResult = {
    contractVersion: EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VERSION,
    status: input.blocked
      ? "audit_append_writer_blocked"
      : "audit_append_writer_contract_only",
    decisionRecommendation: input.blocked
      ? "blocked_do_not_write_audit"
      : "contract_only_do_not_write_audit",
    contractOnly: true,
    writerImplemented: false,
    auditAppendImplemented: false,
    auditRouteImplemented: false,
    auditWriteExecuted: false,
    auditWriteAllowed: false,
    safeToWriteAudit: false,
    auditAppendAllowed: false,
    safeToAppendAudit: false,
    writerContractReadinessIsAuditWriteApproval: false,
    insertSuccessIsAuditWriteApproval: false,
    validatorReadinessIsAuditWriteApproval: false,
    devPreviewDiagnosticsAreAuditWriteApproval: false,
    orchestratorContractReadinessIsAuditWriteApproval: false,
    auditWriteSuccessApprovesStatsPnlUpdate: false,
    auditWriteSuccessApprovesTradeMutation: false,
    auditWriteSuccessApprovesTradeReconciliation: false,
    auditWriteSuccessApprovesCorrectionRollback: false,
    auditWriteSuccessApprovesUiUpdate: false,
    auditWriteSuccessApprovesNotification: false,
    auditWriteSuccessApprovesBrokerOrderFollowUp: false,
    auditWriteSuccessApprovesAvanzaBrowserFollowUp: false,
    auditWriteSuccessApprovesAutomaticMode: false,
    auditEvent,
    auditAppendResultSummary: null,
    insertedAuditEventReference: null,
    evidence,
    idempotency,
    duplicatePrevention,
    failure,
    dependencies,
    serverOnlySecurity,
    authority: auditWriterContractInput.authority,
    safetyPolicy: auditWriterContractInput.safetyPolicy,
    blockedReasons: writerBlockedReasons,
    warnings: auditWriterContractInput.warnings,
    reviewItems: writerReviewItems,
    recommendedNextManualReview: input.blocked
      ? "Review audit writer fixture readiness gaps before any future writer design step."
      : null,
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      diagnosticsOnly: true,
      noAuditWrite: true,
    },
  };

  return {
    contractVersion:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_VALIDATOR_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    requestedBy: "execution_record_persistence_validator_integration_fixture",
    auditWriterContractInput,
    auditWriterContractResult,
    validatedAuditBoundaryResult: boundaryResult,
    auditBoundaryValidatorResult: input.auditAppendBoundaryValidatorResult,
    auditEventCandidate,
    executionRecordId,
    executionRecordReference,
    executionRecordEvidence,
    auditEventType: boundaryInput.auditEventType,
    auditEventSource: boundaryInput.auditEventSource,
    auditEventPayloadSummary: boundaryInput.auditEventPayloadSummary,
    actorSourceMetadata: boundaryInput.actorSourceMetadata,
    timestampSourceClockMetadata: boundaryInput.timestampSourceClockMetadata,
    idempotencyKey,
    duplicatePreventionKey,
    auditSchemaTableProof: proof,
    generatedTypesProof: proof,
    migrationProof: proof,
    rlsSecurityProof: proof,
    serverOnlyProof: proof,
    serviceRoleServerOnlyExecutionContext: proof,
    manualReviewMetadata: null,
    failureRetryMetadata: boundaryInput.failureRetryMetadata,
    readiness: {
      writerValidationInputPresent: true,
      auditWriterContractInputPresent: true,
      auditWriterContractResultPresent: true,
      validatedAuditBoundaryResultPresent: Boolean(boundaryResult),
      auditBoundaryValidatorResultPresent: true,
      writerValidatorImplemented: false,
      writerImplemented: false,
      auditAppendImplemented: false,
      auditRouteImplemented: false,
      auditWriteExecuted: false,
      readinessIsAuditWriteApproval: false,
      safeToWriteAudit: false,
      blockedReasons: writerBlockedReasons,
      warnings: ["writer_validation_readiness_not_audit_write_approval"],
      reviewItems: writerReviewItems,
      metadata: {
        fixtureOnly: true,
      },
    },
    auditEvent: {
      ...auditEvent,
      writerAuditEventSummary: auditEvent,
      auditEventTypePresent: Boolean(boundaryInput.auditEventType),
      auditEventSourcePresent: Boolean(boundaryInput.auditEventSource),
      auditEventPayloadPresent: Boolean(boundaryInput.auditEventPayloadSummary),
      actorSourceMetadataPresent: !input.blocked,
      timestampSourceMetadataPresent: !input.blocked,
    },
    serverOnlySecurity: {
      ...serverOnlySecurity,
      writerServerOnlySecuritySummary: serverOnlySecurity,
      serverOnlyProof: proof,
      serviceRoleServerOnlyExecutionContext: proof,
      rlsSecurityProof: proof,
      serviceRoleExposureRiskModeled: true,
      clientSideAuditWriteRisk: false,
    },
    schemaType: {
      schemaReference:
        boundaryInput.normalizedExecutionRecordInput?.schemaReference ?? null,
      auditSchemaTableProof: proof,
      generatedTypesProof: proof,
      migrationProof: proof,
      auditSchemaTableProven: !input.blocked,
      generatedTypesPresent: !input.blocked,
      generatedExecutionRecordTypesPresent: !input.blocked,
      generatedAuditTypesPresent: !input.blocked,
      migrationApplicationProven: !input.blocked,
      rlsSecurityVerified: !input.blocked,
      schemaAssumedWithoutProof: false,
      auditTableAssumedWithoutProof: false,
      blockedReasons: dependencies.blockedReasons,
      warnings: dependencies.warnings,
      reviewItems: dependencies.reviewItems,
      metadata: {
        fixtureOnly: true,
      },
    },
    idempotency: {
      ...idempotency,
      writerIdempotencySummary: idempotency,
      idempotencyKeyPresent: Boolean(idempotencyKey),
    },
    duplicatePrevention: {
      ...duplicatePrevention,
      writerDuplicatePreventionSummary: duplicatePrevention,
      duplicatePreventionKeyPresent: Boolean(duplicatePreventionKey),
      safeToWriteDuplicateAuditEvent: false,
    },
    evidenceProvenance: {
      ...evidence,
      writerEvidenceSummary: evidence,
      auditBoundaryResult: boundaryResult,
      auditBoundaryValidationResult: input.auditAppendBoundaryValidatorResult,
      auditCorrectionMetadata: boundaryInput.evidence.auditCorrectionMetadata,
      executionRecordReferencePresent: Boolean(executionRecordReference),
      executionRecordEvidencePresent: Boolean(executionRecordEvidence),
      provenanceTraceComplete: !input.blocked,
    },
    failureRetry: {
      ...failure,
      writerFailureSummary: failure,
      failureRetryMetadata: boundaryInput.failureRetryMetadata,
    },
    dependencies: {
      auditWriterContractPresent: true,
      auditWriterValidatorContractPresent: true,
      auditWriterValidatorImplemented: false,
      auditWriterImplemented: false,
      auditAppendImplementationPresent: false,
      auditRouteImplemented: false,
      auditWritePathPresent: false,
      validatedAuditBoundaryResultPresent: Boolean(boundaryResult),
      auditBoundaryValidatorResultPresent: true,
      postInsertOrchestratorResult: null,
      productionInsertBoundaryResult: null,
      productionInsertRouteImplemented: false,
      productionInsertWritePathPresent: false,
      postInsertOrchestratorImplemented: false,
      auditSchemaTableProven: !input.blocked,
      generatedTypesPresent: !input.blocked,
      migrationApplicationProven: !input.blocked,
      rlsSecurityVerified: !input.blocked,
      serverOnlyBoundaryVerified: !input.blocked,
      dryRunSuccessPresent: true,
      dryRunSuccessIsAuditWriteApproval: false,
      blockedReasons: dependencies.blockedReasons,
      warnings: dependencies.warnings,
      reviewItems: dependencies.reviewItems,
      metadata: dependencies.metadata,
    },
    authority:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_VALIDATION_DEFAULT_SAFETY_POLICY,
    blockedReasons: writerBlockedReasons,
    warnings: [
      "contract_only",
      "writer_validator_not_implemented",
      "audit_writer_not_implemented",
      "audit_write_not_executed",
      "writer_validation_readiness_not_audit_write_approval",
      "writer_contract_readiness_not_audit_write_approval",
      "insert_success_not_audit_write_approval",
      "validator_readiness_not_audit_write_approval",
      "dev_preview_diagnostics_not_audit_write_approval",
      "orchestrator_readiness_not_audit_write_approval",
      "production_boundary_readiness_not_audit_write_approval",
      "dry_run_success_not_audit_write_approval",
      "writer_validation_success_not_stats_pnl_approval",
      "writer_validation_success_not_trade_mutation_approval",
      "writer_validation_success_not_rollback_approval",
    ],
    reviewItems: writerReviewItems,
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      explicitTriggerOnly: true,
      diagnosticsOnly: true,
      noAuditWriterExecution: true,
      noAuditWrite: true,
      noAuditAppend: true,
      noRouteCall: true,
      noPersistenceWrite: true,
      noDownstreamActions: true,
    },
  } as unknown as ExecutionRecordAuditAppendWriterValidationInput;
}

function buildAuditAppendWriterContractValidationInput(input: {
  auditAppendWriterValidationInput: ExecutionRecordAuditAppendWriterValidationInput;
  auditAppendWriterValidationResult: ExecutionRecordAuditAppendWriterValidationResult;
  blocked: boolean;
}): ExecutionRecordAuditAppendWriterContractValidationInput {
  const writerInput = input.auditAppendWriterValidationInput;
  const writerContractInput = writerInput.auditWriterContractInput ?? null;
  const writerContractResult = writerInput.auditWriterContractResult ?? null;
  const writerValidatorResult = input.auditAppendWriterValidationResult;
  const executionRecordReference =
    writerInput.executionRecordReference ?? null;
  const sourceReferences =
    writerInput.evidenceProvenance.sourceReferences ?? [];
  const proofStatus = input.blocked ? "fixture_unproven" : "fixture_present";

  return {
    contractVersion:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATOR_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    requestedBy: "execution_record_persistence_validator_integration_fixture",
    auditWriterContractInput: writerContractInput,
    auditWriterContractResult: writerContractResult,
    writerValidatorResult,
    serverOnlySecurityChecklistStatus: "checked_not_proof",
    auditSchemaTableProofStatus: proofStatus,
    generatedTypesProofStatus: proofStatus,
    migrationProofStatus: proofStatus,
    rlsSecurityProofStatus: proofStatus,
    idempotencyMetadata: writerInput.idempotency.metadata ?? null,
    duplicatePreventionMetadata:
      writerInput.duplicatePrevention.metadata ?? null,
    evidenceProvenanceMetadata: writerInput.evidenceProvenance.metadata ?? null,
    serviceRoleExposureRiskMetadata: {
      fixtureOnly: true,
      serviceRoleExposureRisk: false,
    },
    clientSideWriteRiskMetadata: {
      fixtureOnly: true,
      clientSideWriteRisk: false,
    },
    downstreamAuthorityMetadata: {
      fixtureOnly: true,
      downstreamAuthorityPresent: false,
    },
    manualReviewMetadata: writerInput.manualReviewMetadata ?? null,
    inputShape: {
      writerContractInputPresent: Boolean(writerContractInput),
      executionRecordReference,
      executionRecordReferencePresent: Boolean(executionRecordReference),
      auditEventCandidatePresent: Boolean(writerInput.auditEventCandidate),
      evidenceProvenancePresent:
        writerInput.evidenceProvenance.evidenceProvenancePresent === true,
      idempotencyKeyPresent: Boolean(writerInput.idempotencyKey),
      duplicatePreventionKeyPresent: Boolean(
        writerInput.duplicatePreventionKey,
      ),
      serverOnlySecurityPlaceholderPresent:
        Boolean(writerInput.serverOnlyProof),
      auditSchemaTablePlaceholderPresent:
        Boolean(writerInput.auditSchemaTableProof),
      serviceRoleExposureRiskModeled: true,
      clientSideWriteRiskModeled: true,
      noLocalOnlySourceOfTruth: true,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
      },
    },
    resultShape: {
      writerContractResultPresent: Boolean(writerContractResult),
      statusPresent: Boolean(writerContractResult?.status),
      decisionRecommendationPresent: Boolean(
        writerContractResult?.decisionRecommendation,
      ),
      noWriteNoActionStatusPresent: true,
      authorityFlagsPresent: Boolean(writerContractResult?.authority),
      allAuthorityFlagsFalse: true,
      downstreamNoAuthorityPreserved: true,
      auditWriteExecuted: false,
      auditWriteAllowed: false,
      safeToWriteAudit: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
      },
    },
    serverOnlySecurity: {
      checklistStatus: "checked_not_proof",
      checklistStatusPresent: true,
      checklistStatusTreatedAsProof: false,
      serverOnlyProofPresent: Boolean(writerInput.serverOnlyProof),
      serviceRoleProofPresent: Boolean(
        writerInput.serviceRoleServerOnlyExecutionContext,
      ),
      serviceRoleExposureRisk: false,
      clientSideWriteRisk: false,
      routeAuthBoundaryProofPresent:
        writerInput.serverOnlySecurity.routeAuthBoundaryVerified === true,
      serviceRoleSecretValuesForbidden: true,
      clientSideWriteForbidden: true,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
        checklistStatusIsNotProof: true,
      },
    },
    schemaType: {
      auditSchemaTableProofPresent: Boolean(writerInput.auditSchemaTableProof),
      generatedTypesProofPresent: Boolean(writerInput.generatedTypesProof),
      generatedAuditTypesPresent:
        writerInput.schemaType.generatedAuditTypesPresent === true,
      generatedExecutionRecordTypesPresent:
        writerInput.schemaType.generatedExecutionRecordTypesPresent === true,
      generatedExecutionRecordTypesAssumedEnough: false,
      migrationProofPresent: Boolean(writerInput.migrationProof),
      rlsSecurityProofPresent: Boolean(writerInput.rlsSecurityProof),
      schemaDriftDetected: false,
      nullableRequiredMismatchDetected: false,
      schemaTableAssumedWithoutProof: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
        generatedExecutionRecordTypesNotEnough: true,
      },
    },
    idempotencyDuplicatePrevention: {
      idempotencyKey: writerInput.idempotencyKey,
      duplicatePreventionKey: writerInput.duplicatePreventionKey,
      sourceFingerprint: writerInput.idempotency.sourceEventFingerprint,
      idempotencyKeyPresent: Boolean(writerInput.idempotencyKey),
      duplicatePreventionKeyPresent: Boolean(
        writerInput.duplicatePreventionKey,
      ),
      idempotencyMetadataComplete:
        writerInput.idempotency.idempotencyMetadataPresent === true,
      duplicatePreventionMetadataComplete:
        writerInput.duplicatePrevention
          .duplicatePreventionMetadataPresent === true,
      duplicateMatches: writerInput.duplicatePrevention.duplicateMatches,
      duplicateWriteBlocked: true,
      retrySafetyRepresented: true,
      unknownWriteStatusRepresented: true,
      safeToWriteDuplicateAuditEvent: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
        noDuplicateAuditWrite: true,
      },
    },
    evidenceProvenance: {
      executionRecordReference,
      executionRecordReferencePresent: Boolean(executionRecordReference),
      evidenceProvenancePresent:
        writerInput.evidenceProvenance.evidenceProvenancePresent === true,
      actorSourceMetadataPresent: Boolean(writerInput.actorSourceMetadata),
      timestampSourceClockPresent: Boolean(
        writerInput.timestampSourceClockMetadata,
      ),
      auditEventCandidatePresent: Boolean(writerInput.auditEventCandidate),
      sourceReferences,
      noLocalOnlySourceOfTruth: true,
      provenanceTraceComplete:
        writerInput.evidenceProvenance.provenanceTraceComplete === true,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
      },
    },
    noWriteNoAction: {
      validationOnly: true,
      designOnly: true,
      auditWriteExecuted: false,
      auditWriteAllowed: false,
      routeCallAllowed: false,
      recordCreationAllowed: false,
      persistenceWriteAllowed: false,
      supabaseWriteAllowed: false,
      localStorageWriteAllowed: false,
      downstreamAuthorityPresent: false,
      brokerAvanzaActionAllowed: false,
      automaticModeAllowed: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
        diagnosticsOnly: true,
      },
    },
    dependencies: {
      writerContractInputPresent: Boolean(writerContractInput),
      writerContractResultPresent: Boolean(writerContractResult),
      writerValidatorResultPresent: Boolean(writerValidatorResult),
      contractValidatorImplemented: false,
      writerValidatorImplemented: true,
      writerImplemented: false,
      auditAppendImplemented: false,
      auditRouteImplemented: false,
      auditWritePathPresent: false,
      productionInsertRouteImplemented: false,
      productionInsertWritePathPresent: false,
      serverOnlyProofPresent: Boolean(writerInput.serverOnlyProof),
      serviceRoleProofPresent: Boolean(
        writerInput.serviceRoleServerOnlyExecutionContext,
      ),
      auditSchemaTableProofPresent: Boolean(writerInput.auditSchemaTableProof),
      generatedTypesProofPresent: Boolean(writerInput.generatedTypesProof),
      migrationProofPresent: Boolean(writerInput.migrationProof),
      rlsSecurityProofPresent: Boolean(writerInput.rlsSecurityProof),
      checklistStatusIsProof: false,
      devPreviewDiagnosticsAreProof: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
        noProductionRoute: true,
        noAuditWritePath: true,
      },
    },
    authority:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_CONTRACT_VALIDATION_DEFAULT_SAFETY_POLICY,
    blockedReasons: [],
    warnings: [],
    reviewItems: [],
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      explicitTriggerOnly: true,
      diagnosticsOnly: true,
      noAuditWriterExecution: true,
      noAuditWrite: true,
      noAuditAppend: true,
      noRouteCall: true,
      noPersistenceWrite: true,
      noDownstreamActions: true,
    },
  };
}

function buildAuditAppendWriterDryRunValidationInput(input: {
  auditAppendWriterContractValidationInput: ExecutionRecordAuditAppendWriterContractValidationInput;
  auditAppendWriterContractValidationResult: ExecutionRecordAuditAppendWriterContractValidationResult;
  auditAppendWriterValidationInput: ExecutionRecordAuditAppendWriterValidationInput;
  auditAppendWriterValidationResult: ExecutionRecordAuditAppendWriterValidationResult;
  blocked: boolean;
}): ExecutionRecordAuditAppendWriterDryRunValidationInput {
  const writerInput = input.auditAppendWriterValidationInput;
  const writerContractInput = writerInput.auditWriterContractInput ?? null;
  const auditEventCandidate = writerInput.auditEventCandidate ?? null;
  const executionRecordReference =
    writerInput.executionRecordReference ?? null;
  const evidenceProvenance = writerInput.evidenceProvenance.metadata ?? {
    fixtureOnly: true,
    sourceReferences: writerInput.evidenceProvenance.sourceReferences,
  };
  const idempotencyMetadata = {
    ...(writerInput.idempotency.metadata ?? {}),
    idempotencyKey: writerInput.idempotencyKey,
    fixtureOnly: true,
  };
  const duplicatePreventionMetadata = {
    ...(writerInput.duplicatePrevention.metadata ?? {}),
    duplicatePreventionKey: writerInput.duplicatePreventionKey,
    fixtureOnly: true,
  };
  const proofStatus = input.blocked ? null : "fixture_present";
  const dryRunBlockedReasons = input.blocked
    ? (["schema_table_proof_status_missing"] as const)
    : [];
  const dryRunReviewItems = input.blocked
    ? (["schema_table_dependency_review"] as const)
    : [];
  const dryRunWarnings = [
    "contract_only",
    "dry_run_not_implemented",
    "audit_writer_not_implemented",
    "audit_route_not_implemented",
    "audit_write_not_executed",
    "dry_run_result_not_audit_write_approval",
    "dry_run_result_not_security_proof",
    "dry_run_result_not_server_only_proof",
    "dry_run_result_not_schema_proof",
    "dry_run_result_not_generated_types_proof",
    "dry_run_result_not_migration_proof",
    "dry_run_result_not_rls_security_proof",
    "dry_run_result_not_downstream_approval",
    "automatic_mode_not_enabled",
  ] as const;

  const wouldWriteAuditEvent: ExecutionRecordAuditAppendWriterDryRunInput["wouldWriteAuditEvent"] =
    {
      hypotheticalOnly: true,
      wouldAttemptAuditWrite: false,
      auditWriteExecuted: false,
      auditEventCandidatePresent: Boolean(auditEventCandidate),
      auditEventType:
        typeof auditEventCandidate?.auditEventType === "string"
          ? auditEventCandidate.auditEventType
          : "execution_record_persisted",
      auditEventSource: "dev_preview_fixture",
      auditPayloadShape: auditEventCandidate,
      executionRecordReference,
      executionRecordReferencePresent: Boolean(executionRecordReference),
      blockedReasons: [],
      warnings: ["audit_write_not_executed"],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
        dryRunValidatorDiagnosticsOnly: true,
      },
    };
  const wouldUseTableSchema: ExecutionRecordAuditAppendWriterDryRunInput["wouldUseTableSchema"] =
    {
      auditSchemaTableStatus: proofStatus,
      auditSchemaTableStatusKnown: !input.blocked,
      auditSchemaTableProofPresent: !input.blocked,
      generatedAuditTypesStatus: proofStatus,
      generatedAuditTypesStatusKnown: !input.blocked,
      generatedAuditTypesProofPresent: !input.blocked,
      generatedExecutionRecordTypesPresent: !input.blocked,
      generatedExecutionRecordTypesAssumedEnough: false,
      migrationStatus: proofStatus,
      migrationStatusKnown: !input.blocked,
      migrationProofPresent: !input.blocked,
      rlsSecurityStatus: proofStatus,
      rlsSecurityStatusKnown: !input.blocked,
      rlsSecurityProofPresent: !input.blocked,
      schemaTableAssumedWithoutProof: false,
      blockedReasons: [...dryRunBlockedReasons],
      warnings: input.blocked ? ["audit_schema_table_proof_required"] : [],
      reviewItems: [...dryRunReviewItems],
      metadata: {
        fixtureOnly: true,
        generatedExecutionRecordTypesAloneNotEnough: true,
      },
    };
  const wouldUseIdempotency: ExecutionRecordAuditAppendWriterDryRunInput["wouldUseIdempotency"] =
    {
      idempotencyKey: writerInput.idempotencyKey,
      idempotencyKeyPresent: Boolean(writerInput.idempotencyKey),
      idempotencyMetadataComplete:
        writerInput.idempotency.idempotencyMetadataPresent === true,
      retrySafetyRepresented: true,
      unknownWriteStatusRepresented: true,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: idempotencyMetadata,
    };
  const duplicatePreventionSimulation: ExecutionRecordAuditAppendWriterDryRunInput["duplicatePreventionSimulation"] =
    {
      duplicatePreventionKey: writerInput.duplicatePreventionKey,
      duplicatePreventionKeyPresent: Boolean(
        writerInput.duplicatePreventionKey,
      ),
      duplicatePreventionMetadataComplete:
        writerInput.duplicatePrevention
          .duplicatePreventionMetadataPresent === true,
      duplicateMatches: [],
      duplicateWriteWouldBeBlocked: true,
      duplicateWriteExecuted: false,
      safeToWriteDuplicateAuditEvent: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: duplicatePreventionMetadata,
    };
  const evidenceProvenanceSummary: ExecutionRecordAuditAppendWriterDryRunInput["evidenceProvenanceSummary"] =
    {
      executionRecordReference,
      executionRecordReferencePresent: Boolean(executionRecordReference),
      evidenceProvenancePresent:
        writerInput.evidenceProvenance.evidenceProvenancePresent === true,
      actorSourceMetadataPresent: Boolean(writerInput.actorSourceMetadata),
      timestampSourceClockPresent: Boolean(
        writerInput.timestampSourceClockMetadata,
      ),
      auditEventCandidatePresent: Boolean(auditEventCandidate),
      sourceReferences: writerInput.evidenceProvenance.sourceReferences,
      noLocalOnlySourceOfTruth: true,
      provenanceTraceComplete:
        writerInput.evidenceProvenance.provenanceTraceComplete === true,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: evidenceProvenance,
    };
  const serverOnlySecurity: ExecutionRecordAuditAppendWriterDryRunInput["serverOnlySecurity"] =
    {
      serverOnlySecurityStatus: proofStatus,
      serverOnlySecurityStatusKnown: !input.blocked,
      serverOnlyProofPresent: !input.blocked,
      serviceRoleProofPresent: !input.blocked,
      serviceRoleExposureRisk: false,
      clientSideWriteRisk: false,
      routeAuthBoundaryProofPresent: !input.blocked,
      serviceRoleSecretValuesForbidden: true,
      clientSideWriteForbidden: true,
      blockedReasons: input.blocked
        ? ["server_only_security_status_missing"]
        : [],
      warnings: input.blocked ? ["server_only_required"] : [],
      reviewItems: input.blocked
        ? ["server_only_security_dependency_review"]
        : [],
      metadata: {
        fixtureOnly: true,
        serviceRoleMustRemainServerOnly: true,
      },
    };
  const noWriteNoAction: ExecutionRecordAuditAppendWriterDryRunInput["noWriteNoAction"] =
    {
      validationOnly: true,
      designOnly: true,
      dryRunOnly: true,
      hypotheticalOnly: true,
      auditWriteExecuted: false,
      auditWriteAllowed: false,
      auditAppendAllowed: false,
      routeCallAllowed: false,
      recordCreationAllowed: false,
      persistenceWriteAllowed: false,
      supabaseWriteAllowed: false,
      localStorageWriteAllowed: false,
      statsPnlUpdateAllowed: false,
      tradeMutationAllowed: false,
      tradeReconciliationAllowed: false,
      correctionRollbackAllowed: false,
      uiStateMutationAllowed: false,
      userNotificationAllowed: false,
      brokerAvanzaActionAllowed: false,
      automaticModeAllowed: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
        diagnosticsOnly: true,
      },
    };
  const dependencies: ExecutionRecordAuditAppendWriterDryRunInput["dependencies"] =
    {
      contractValidatorResultPresent: true,
      writerValidatorResultPresent: true,
      writerContractInputPresent: Boolean(writerContractInput),
      dryRunImplemented: false,
      writerImplemented: false,
      auditAppendImplemented: false,
      auditRouteImplemented: false,
      auditWritePathPresent: false,
      productionInsertRouteImplemented: false,
      productionInsertWritePathPresent: false,
      serverOnlyProofPresent: !input.blocked,
      serviceRoleProofPresent: !input.blocked,
      auditSchemaTableProofPresent: !input.blocked,
      generatedAuditTypesProofPresent: !input.blocked,
      generatedTypesProofPresent: !input.blocked,
      migrationProofPresent: !input.blocked,
      rlsSecurityProofPresent: !input.blocked,
      devPreviewDiagnosticsAreProof: false,
      blockedReasons: input.blocked
        ? ["schema_table_proof_status_missing"]
        : [],
      warnings: ["dry_run_not_implemented", "audit_writer_not_implemented"],
      reviewItems: input.blocked
        ? ["generated_audit_types_dependency_review"]
        : [],
      metadata: {
        fixtureOnly: true,
        noAuditWritePath: true,
      },
    };

  const dryRunResultInput: ExecutionRecordAuditAppendWriterDryRunInput = {
    contractVersion: EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_RESULT_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    requestedBy: "execution_record_persistence_validator_integration_fixture",
    writerContractValidationResult:
      input.auditAppendWriterContractValidationResult,
    writerValidatorResult: input.auditAppendWriterValidationResult,
    auditWriterContractInput: writerContractInput,
    auditEventCandidate,
    executionRecordReference,
    evidenceProvenance,
    idempotencyKey: writerInput.idempotencyKey,
    duplicatePreventionKey: writerInput.duplicatePreventionKey,
    serverOnlySecurityProofStatus: proofStatus,
    schemaTableProofStatus: proofStatus,
    generatedAuditTypesProofStatus: proofStatus,
    migrationProofStatus: proofStatus,
    rlsSecurityProofStatus: proofStatus,
    serviceRoleExposureRiskStatus: "risk_absent",
    clientSideWriteRiskStatus: "risk_absent",
    manualReviewMetadata: writerInput.manualReviewMetadata ?? null,
    failureRetryMetadata: {
      fixtureOnly: true,
      dryRunExecutionNotImplemented: true,
    },
    downstreamAuthorityRequestMetadata: {
      fixtureOnly: true,
      downstreamAuthorityPresent: false,
    },
    wouldWriteAuditEvent,
    wouldUseTableSchema,
    wouldUseIdempotency,
    duplicatePreventionSimulation,
    evidenceProvenanceSummary,
    serverOnlySecurity,
    noWriteNoAction,
    dependencies,
    authority: EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy: EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_DEFAULT_SAFETY_POLICY,
    blockedReasons: [],
    warnings: [...dryRunWarnings],
    reviewItems: input.blocked ? ["manual_review"] : [],
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      explicitTriggerOnly: true,
      dryRunValidatorDiagnosticsOnly: true,
      noDryRunExecution: true,
      noAuditWrite: true,
      noAuditAppend: true,
    },
  };
  const dryRunResult: ExecutionRecordAuditAppendWriterDryRunResult = {
    contractVersion: EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_RESULT_CONTRACT_VERSION,
    status: input.blocked
      ? "audit_append_writer_dry_run_blocked"
      : "audit_append_writer_dry_run_ready_for_design_only",
    decisionRecommendation: input.blocked
      ? "blocked_do_not_write_audit"
      : "design_only_do_not_write_audit",
    validationOnly: true,
    designOnly: true,
    dryRunOnly: true,
    hypotheticalOnly: true,
    nonPersistent: true,
    dryRunImplemented: false,
    auditWriteExecuted: false,
    auditWriteAllowed: false,
    safeToWriteAudit: false,
    dryRunResultIsAuditWriteApproval: false,
    dryRunResultIsAuditAppendExecution: false,
    dryRunResultIsRouteCallApproval: false,
    dryRunResultIsRecordCreationApproval: false,
    dryRunResultIsPersistenceWriteApproval: false,
    dryRunResultIsSupabaseLocalStorageWriteApproval: false,
    dryRunResultIsSecurityProof: false,
    dryRunResultIsServerOnlyProof: false,
    dryRunResultIsSchemaProof: false,
    dryRunResultIsGeneratedTypesProof: false,
    dryRunResultIsMigrationProof: false,
    dryRunResultIsRlsSecurityProof: false,
    dryRunResultIsDownstreamApproval: false,
    contractValidatorReadinessIsWriteApproval: false,
    writerValidatorReadinessIsWriteApproval: false,
    insertSuccessIsAuditWriteApproval: false,
    devPreviewDiagnosticsAreWriteApproval: false,
    wouldWriteAuditEvent,
    wouldUseTableSchema,
    wouldUseIdempotency,
    duplicatePreventionSimulation,
    evidenceProvenance: evidenceProvenanceSummary,
    serverOnlySecurity,
    noWriteNoAction,
    dependencies,
    authority: EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy: EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_DEFAULT_SAFETY_POLICY,
    referenceWriterContractResult:
      input.auditAppendWriterValidationInput.auditWriterContractResult ?? null,
    blockedReasons: input.blocked ? ["schema_table_proof_status_missing"] : [],
    warnings: [...dryRunWarnings],
    reviewItems: input.blocked ? ["manual_review"] : [],
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      diagnosticsOnly: true,
      noDryRunExecution: true,
      noAuditWrite: true,
    },
  };

  return {
    contractVersion:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATOR_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    requestedBy: "execution_record_persistence_validator_integration_fixture",
    dryRunResultInput,
    dryRunResult,
    writerContractValidationResult:
      input.auditAppendWriterContractValidationResult,
    writerValidatorResult: input.auditAppendWriterValidationResult,
    auditWriterContractInput: writerContractInput,
    auditEventCandidate,
    executionRecordReference,
    evidenceProvenance,
    idempotencyMetadata,
    duplicatePreventionMetadata,
    serverOnlySecurityProofStatus: proofStatus,
    schemaTableProofStatus: proofStatus,
    generatedAuditTypesProofStatus: proofStatus,
    migrationProofStatus: proofStatus,
    rlsSecurityProofStatus: proofStatus,
    serviceRoleExposureRiskStatus: "risk_absent",
    clientSideWriteRiskStatus: "risk_absent",
    manualReviewMetadata: writerInput.manualReviewMetadata ?? null,
    downstreamAuthorityMetadata: {
      fixtureOnly: true,
      downstreamAuthorityPresent: false,
    },
    inputValidation: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      dryRunValidationInputPresent: true,
      dryRunResultInputPresent: true,
      writerContractValidationResultPresent: true,
      writerValidatorResultPresent: true,
      writerContractInputPresent: Boolean(writerContractInput),
      auditEventCandidatePresent: Boolean(auditEventCandidate),
      executionRecordReferencePresent: Boolean(executionRecordReference),
      evidenceProvenancePresent: true,
      idempotencyMetadataPresent: true,
      duplicatePreventionMetadataPresent: true,
      downstreamAuthorityMetadataPresent: true,
      unsafeCallablePresent: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: { fixtureOnly: true },
    },
    resultValidation: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      dryRunResultOutputPresent: true,
      dryRunResultStatus: dryRunResult.status,
      dryRunResultReadyForDesignOnly: !input.blocked,
      dryRunResultClaimsWriteApproval: false,
      dryRunResultClaimsSecurityProof: false,
      dryRunResultClaimsSchemaProof: false,
      dryRunResultClaimsDownstreamApproval: false,
      dryRunResultClaimsAuditWriteExecuted: false,
      dryRunResultAuthorityFlagsAllFalse: true,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: { fixtureOnly: true },
    },
    wouldWriteAuditEventValidation: {
      statusKnown: true,
      readyForDesignOnly: true,
      auditEventCandidatePresent: Boolean(auditEventCandidate),
      wouldWriteSummaryPresent: true,
      wouldAttemptAuditWrite: false,
      auditWriteExecuted: false,
      auditWriteAllowed: false,
      safeToWriteAudit: false,
      executionRecordReferencePresent: Boolean(executionRecordReference),
      hypotheticalOnly: true,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: { fixtureOnly: true },
    },
    tableSchemaSimulationValidation: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      schemaTableStatusKnown: !input.blocked,
      schemaTableProofPresent: !input.blocked,
      generatedAuditTypesStatusKnown: !input.blocked,
      generatedAuditTypesProofPresent: !input.blocked,
      generatedExecutionRecordTypesPresent: !input.blocked,
      generatedExecutionRecordTypesAssumedEnough: false,
      migrationStatusKnown: !input.blocked,
      migrationProofPresent: !input.blocked,
      rlsSecurityStatusKnown: !input.blocked,
      rlsSecurityProofPresent: !input.blocked,
      schemaTableAssumedWithoutProof: false,
      blockedReasons: [...dryRunBlockedReasons],
      warnings: [],
      reviewItems: input.blocked ? ["table_schema_simulation_review"] : [],
      metadata: { fixtureOnly: true },
    },
    idempotencyDuplicatePreventionValidation: {
      statusKnown: true,
      readyForDesignOnly: true,
      idempotencyKeyPresent: Boolean(writerInput.idempotencyKey),
      idempotencyMetadataComplete: true,
      duplicatePreventionKeyPresent: Boolean(
        writerInput.duplicatePreventionKey,
      ),
      duplicatePreventionMetadataComplete: true,
      retrySafetyRepresented: true,
      unknownWriteStatusRepresented: true,
      duplicateMatches: [],
      duplicateWriteWouldBeBlocked: true,
      duplicateWriteExecuted: false,
      safeToWriteDuplicateAuditEvent: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: { fixtureOnly: true },
    },
    evidenceProvenanceValidation: {
      statusKnown: true,
      readyForDesignOnly: true,
      executionRecordReference,
      executionRecordReferencePresent: Boolean(executionRecordReference),
      evidenceProvenancePresent: true,
      actorSourceMetadataPresent: true,
      timestampSourceClockPresent: true,
      auditEventCandidatePresent: Boolean(auditEventCandidate),
      sourceReferences: writerInput.evidenceProvenance.sourceReferences,
      noLocalOnlySourceOfTruth: true,
      provenanceTraceComplete: true,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: { fixtureOnly: true },
    },
    serverOnlySecurityDependencyValidation: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      serverOnlySecurityStatusKnown: !input.blocked,
      serverOnlyProofPresent: !input.blocked,
      serviceRoleProofPresent: !input.blocked,
      serviceRoleExposureRisk: false,
      clientSideWriteRisk: false,
      routeAuthBoundaryProofPresent: !input.blocked,
      serviceRoleSecretValuesForbidden: true,
      clientSideWriteForbidden: true,
      blockedReasons: input.blocked
        ? ["server_only_security_status_missing"]
        : [],
      warnings: [],
      reviewItems: input.blocked
        ? ["server_only_security_dependency_review"]
        : [],
      metadata: { fixtureOnly: true },
    },
    noWriteNoActionSafetyValidation: {
      statusKnown: true,
      readyForDesignOnly: true,
      validationOnly: true,
      designOnly: true,
      dryRunValidationOnly: true,
      hypotheticalOnly: true,
      dryRunExecuted: false,
      auditWriteExecuted: false,
      auditWriteAllowed: false,
      auditAppendAllowed: false,
      routeCallAllowed: false,
      recordCreationAllowed: false,
      persistenceWriteAllowed: false,
      supabaseWriteAllowed: false,
      localStorageWriteAllowed: false,
      statsPnlUpdateAllowed: false,
      tradeMutationAllowed: false,
      tradeReconciliationAllowed: false,
      correctionRollbackAllowed: false,
      uiStateMutationAllowed: false,
      userNotificationAllowed: false,
      brokerAvanzaActionAllowed: false,
      automaticModeAllowed: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: { fixtureOnly: true },
    },
    dependencyValidation: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      dryRunValidatorImplemented: false,
      dryRunImplemented: false,
      writerImplemented: false,
      auditAppendImplemented: false,
      auditRouteImplemented: false,
      auditWritePathPresent: false,
      productionInsertRouteImplemented: false,
      productionInsertWritePathPresent: false,
      contractValidatorResultPresent: true,
      writerValidatorResultPresent: true,
      writerContractInputPresent: Boolean(writerContractInput),
      serverOnlyProofPresent: !input.blocked,
      serviceRoleProofPresent: !input.blocked,
      auditSchemaTableProofPresent: !input.blocked,
      generatedAuditTypesProofPresent: !input.blocked,
      generatedTypesProofPresent: !input.blocked,
      migrationProofPresent: !input.blocked,
      rlsSecurityProofPresent: !input.blocked,
      devPreviewDiagnosticsAreProof: false,
      blockedReasons: input.blocked
        ? ["schema_table_proof_status_missing"]
        : [],
      warnings: [],
      reviewItems: input.blocked ? ["dependency_validation_review"] : [],
      metadata: { fixtureOnly: true },
    },
    authority:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_VALIDATION_DEFAULT_SAFETY_POLICY,
    blockedReasons: [],
    warnings: [
      "contract_only",
      "dry_run_validator_not_implemented",
      "dry_run_not_implemented",
      "audit_writer_not_implemented",
      "audit_route_not_implemented",
      "audit_write_not_executed",
      "dry_run_validation_not_audit_write_approval",
      "dry_run_validation_not_dry_run_execution",
      "dry_run_validation_not_security_proof",
      "dry_run_validation_not_downstream_approval",
    ],
    reviewItems: input.blocked ? ["manual_review"] : [],
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      explicitTriggerOnly: true,
      diagnosticsOnly: true,
      noDryRunExecution: true,
      noAuditWriterExecution: true,
      noAuditWrite: true,
      noAuditAppend: true,
      noRouteCall: true,
      noPersistenceWrite: true,
      noDownstreamActions: true,
    },
  };
}

function buildAuditAppendWriterDryRunExecutionValidationInput(input: {
  auditAppendWriterDryRunValidationInput: ExecutionRecordAuditAppendWriterDryRunValidationInput;
  auditAppendWriterDryRunValidationResult: ExecutionRecordAuditAppendWriterDryRunValidationResult;
  blocked: boolean;
}): ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput {
  const dryRunValidationInput = input.auditAppendWriterDryRunValidationInput;
  const dryRunValidatorResult = input.auditAppendWriterDryRunValidationResult;
  const dryRunResultInput = dryRunValidationInput.dryRunResultInput ?? null;
  const dryRunResult = dryRunValidationInput.dryRunResult ?? null;
  const writerContractValidationResult =
    dryRunValidationInput.writerContractValidationResult ?? null;
  const writerValidatorResult =
    dryRunValidationInput.writerValidatorResult ?? null;
  const auditWriterContractInput =
    dryRunValidationInput.auditWriterContractInput ?? null;
  const auditEventCandidate =
    dryRunValidationInput.auditEventCandidate ?? null;
  const executionRecordReference =
    dryRunValidationInput.executionRecordReference ?? null;
  const evidenceProvenance = dryRunValidationInput.evidenceProvenance ?? null;
  const idempotencyMetadata =
    dryRunValidationInput.idempotencyMetadata ?? null;
  const duplicatePreventionMetadata =
    dryRunValidationInput.duplicatePreventionMetadata ?? null;
  const proofStatus = input.blocked ? null : "fixture_present";
  const executionBlockedReasons = input.blocked
    ? (["schema_table_proof_status_missing"] as const)
    : [];
  const executionReviewItems = input.blocked
    ? (["simulated_table_schema_target_review"] as const)
    : [];
  const validationBlockedReasons = input.blocked
    ? (["schema_table_proof_status_missing"] as const)
    : [];
  const validationReviewItems = input.blocked
    ? (["simulated_table_schema_validation_review"] as const)
    : [];
  const executionWarnings = [
    "contract_only",
    "dry_run_execution_not_implemented",
    "dry_run_execution_not_real_write",
    "audit_writer_not_implemented",
    "audit_route_not_implemented",
    "audit_write_not_executed",
    "dry_run_execution_not_audit_write_approval",
    "dry_run_execution_not_security_proof",
    "dry_run_execution_not_server_only_proof",
    "dry_run_execution_not_schema_proof",
    "dry_run_execution_not_generated_types_proof",
    "dry_run_execution_not_migration_proof",
    "dry_run_execution_not_rls_security_proof",
    "dry_run_execution_not_downstream_approval",
    "dry_run_validator_readiness_not_execution",
    "dry_run_validator_readiness_not_write_approval",
    "automatic_mode_not_enabled",
  ] as const;
  const validationWarnings = [
    "contract_only",
    "dry_run_execution_validator_not_implemented",
    "dry_run_execution_not_implemented",
    "dry_run_execution_not_real_write",
    "audit_writer_not_implemented",
    "audit_route_not_implemented",
    "audit_write_not_executed",
    "dry_run_execution_validation_not_dry_run_execution",
    "dry_run_execution_validation_not_audit_write_approval",
    "dry_run_execution_validation_not_security_proof",
    "dry_run_execution_validation_not_downstream_approval",
    "automatic_mode_not_enabled",
  ] as const;

  const simulatedAuditEventPayload: ExecutionRecordAuditAppendWriterDryRunExecutionInput["simulatedAuditEventPayload"] =
    {
      statusKnown: true,
      readyForDesignOnly: true,
      hypotheticalOnly: true,
      simulatedPayloadPresent: Boolean(dryRunResult?.wouldWriteAuditEvent),
      wouldAttemptAuditWrite: false,
      auditWriteExecuted: false,
      auditWriteAllowed: false,
      safeToWriteAudit: false,
      auditEventCandidatePresent: Boolean(auditEventCandidate),
      auditEventType: dryRunResult?.wouldWriteAuditEvent.auditEventType ?? null,
      auditEventSource:
        dryRunResult?.wouldWriteAuditEvent.auditEventSource ?? null,
      auditPayloadShape:
        dryRunResult?.wouldWriteAuditEvent.auditPayloadShape ?? null,
      executionRecordReference,
      executionRecordReferencePresent: Boolean(executionRecordReference),
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
        dryRunExecutionValidatorDiagnosticsOnly: true,
      },
    };
  const simulatedTableSchemaTarget: ExecutionRecordAuditAppendWriterDryRunExecutionInput["simulatedTableSchemaTarget"] =
    {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      targetTable: "execution_record_audit",
      targetSchema: "public",
      schemaTableStatusKnown: !input.blocked,
      schemaTableProofPresent: !input.blocked,
      generatedAuditTypesStatusKnown: !input.blocked,
      generatedAuditTypesProofPresent: !input.blocked,
      generatedExecutionRecordTypesPresent: !input.blocked,
      generatedExecutionRecordTypesAssumedEnough: false,
      migrationStatusKnown: !input.blocked,
      migrationProofPresent: !input.blocked,
      rlsSecurityStatusKnown: !input.blocked,
      rlsSecurityProofPresent: !input.blocked,
      schemaTableAssumedWithoutProof: false,
      blockedReasons: [...executionBlockedReasons],
      warnings: input.blocked ? ["audit_schema_table_proof_required"] : [],
      reviewItems: [...executionReviewItems],
      metadata: {
        fixtureOnly: true,
        generatedExecutionRecordTypesAloneNotEnough: true,
      },
    };
  const simulatedIdempotency: ExecutionRecordAuditAppendWriterDryRunExecutionInput["simulatedIdempotency"] =
    {
      statusKnown: true,
      readyForDesignOnly: true,
      idempotencyKey: dryRunResultInput?.idempotencyKey ?? null,
      idempotencyKeyPresent: Boolean(dryRunResultInput?.idempotencyKey),
      idempotencyMetadataComplete: true,
      retrySafetyRepresented: true,
      unknownWriteStatusRepresented: true,
      simulatedWriteIdempotent: true,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: idempotencyMetadata ?? { fixtureOnly: true },
    };
  const simulatedDuplicatePrevention: ExecutionRecordAuditAppendWriterDryRunExecutionInput["simulatedDuplicatePrevention"] =
    {
      statusKnown: true,
      readyForDesignOnly: true,
      duplicatePreventionKey:
        dryRunResultInput?.duplicatePreventionKey ?? null,
      duplicatePreventionKeyPresent: Boolean(
        dryRunResultInput?.duplicatePreventionKey,
      ),
      duplicatePreventionMetadataComplete: true,
      duplicateMatches:
        dryRunResult?.duplicatePreventionSimulation.duplicateMatches ?? [],
      simulatedDuplicateWriteWouldBeBlocked: true,
      duplicateWriteExecuted: false,
      safeToWriteDuplicateAuditEvent: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: duplicatePreventionMetadata ?? { fixtureOnly: true },
    };
  const evidenceProvenanceSummary: ExecutionRecordAuditAppendWriterDryRunExecutionInput["evidenceProvenanceSummary"] =
    {
      statusKnown: true,
      readyForDesignOnly: true,
      executionRecordReference,
      executionRecordReferencePresent: Boolean(executionRecordReference),
      evidenceProvenancePresent: Boolean(evidenceProvenance),
      actorSourceMetadataPresent:
        dryRunResult?.evidenceProvenance.actorSourceMetadataPresent === true,
      timestampSourceClockPresent:
        dryRunResult?.evidenceProvenance.timestampSourceClockPresent === true,
      auditEventCandidatePresent: Boolean(auditEventCandidate),
      sourceReferences: dryRunResult?.evidenceProvenance.sourceReferences ?? [],
      noLocalOnlySourceOfTruth: true,
      provenanceTraceComplete:
        dryRunResult?.evidenceProvenance.provenanceTraceComplete === true,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: evidenceProvenance ?? { fixtureOnly: true },
    };
  const serverOnlySecurity: ExecutionRecordAuditAppendWriterDryRunExecutionInput["serverOnlySecurity"] =
    {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      serverOnlySecurityStatusKnown: !input.blocked,
      serverOnlyProofPresent: !input.blocked,
      serviceRoleProofPresent: !input.blocked,
      serviceRoleExposureRisk: false,
      clientSideWriteRisk: false,
      routeAuthBoundaryProofPresent: !input.blocked,
      serviceRoleSecretValuesForbidden: true,
      clientSideWriteForbidden: true,
      blockedReasons: input.blocked
        ? ["server_only_security_status_missing"]
        : [],
      warnings: input.blocked ? ["server_only_required"] : [],
      reviewItems: input.blocked
        ? ["server_only_security_dependency_review"]
        : [],
      metadata: {
        fixtureOnly: true,
        serviceRoleMustRemainServerOnly: true,
      },
    };
  const noWriteNoAction: ExecutionRecordAuditAppendWriterDryRunExecutionInput["noWriteNoAction"] =
    {
      statusKnown: true,
      readyForDesignOnly: true,
      validationOnly: true,
      designOnly: true,
      dryRunExecutionOnly: true,
      hypotheticalOnly: true,
      nonPersistent: true,
      dryRunExecutedAgainstRealData: false,
      auditWriteExecuted: false,
      auditWriteAllowed: false,
      auditAppendAllowed: false,
      routeCallAllowed: false,
      recordCreationAllowed: false,
      persistenceWriteAllowed: false,
      supabaseWriteAllowed: false,
      localStorageWriteAllowed: false,
      statsPnlUpdateAllowed: false,
      tradeMutationAllowed: false,
      tradeReconciliationAllowed: false,
      correctionRollbackAllowed: false,
      uiStateMutationAllowed: false,
      userNotificationAllowed: false,
      brokerAvanzaActionAllowed: false,
      automaticModeAllowed: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: {
        fixtureOnly: true,
        diagnosticsOnly: true,
      },
    };
  const dependencies: ExecutionRecordAuditAppendWriterDryRunExecutionInput["dependencies"] =
    {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      dryRunValidatorResultPresent: Boolean(dryRunValidatorResult),
      dryRunResultInputPresent: Boolean(dryRunResultInput),
      contractValidatorResultPresent: Boolean(writerContractValidationResult),
      writerValidatorResultPresent: Boolean(writerValidatorResult),
      writerContractInputPresent: Boolean(auditWriterContractInput),
      dryRunExecutionImplemented: false,
      dryRunImplemented: false,
      writerImplemented: false,
      auditAppendImplemented: false,
      auditRouteImplemented: false,
      auditWritePathPresent: false,
      productionInsertRouteImplemented: false,
      productionInsertWritePathPresent: false,
      serverOnlyProofPresent: !input.blocked,
      serviceRoleProofPresent: !input.blocked,
      auditSchemaTableProofPresent: !input.blocked,
      generatedAuditTypesProofPresent: !input.blocked,
      generatedTypesProofPresent: !input.blocked,
      migrationProofPresent: !input.blocked,
      rlsSecurityProofPresent: !input.blocked,
      devPreviewDiagnosticsAreProof: false,
      blockedReasons: [...executionBlockedReasons],
      warnings: ["dry_run_execution_not_implemented"],
      reviewItems: input.blocked ? ["dependency_summary_review"] : [],
      metadata: {
        fixtureOnly: true,
        noAuditWritePath: true,
      },
    };

  const dryRunExecutionInput: ExecutionRecordAuditAppendWriterDryRunExecutionInput =
    {
      contractVersion:
        EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_CONTRACT_VERSION,
      requestedAt: FIXTURE_TIMESTAMP,
      requestedBy: "execution_record_persistence_validator_integration_fixture",
      dryRunValidatorResult,
      dryRunResultInput,
      dryRunResult,
      writerContractValidationResult,
      writerValidatorResult,
      auditWriterContractInput,
      auditEventCandidate,
      executionRecordReference,
      evidenceProvenance,
      idempotencyKey: dryRunResultInput?.idempotencyKey ?? null,
      duplicatePreventionKey:
        dryRunResultInput?.duplicatePreventionKey ?? null,
      serverOnlySecurityProofStatus: proofStatus,
      schemaTableProofStatus: proofStatus,
      generatedAuditTypesProofStatus: proofStatus,
      migrationProofStatus: proofStatus,
      rlsSecurityProofStatus: proofStatus,
      serviceRoleExposureRiskStatus: "risk_absent",
      clientSideWriteRiskStatus: "risk_absent",
      manualReviewMetadata: dryRunValidationInput.manualReviewMetadata ?? null,
      failureRetryMetadata: {
        fixtureOnly: true,
        dryRunExecutionNotImplemented: true,
      },
      explicitDryRunOnlyExecutionFlag: true,
      downstreamAuthorityRequestMetadata: {
        fixtureOnly: true,
        downstreamAuthorityPresent: false,
      },
      simulatedAuditEventPayload,
      simulatedTableSchemaTarget,
      simulatedIdempotency,
      simulatedDuplicatePrevention,
      evidenceProvenanceSummary,
      serverOnlySecurity,
      noWriteNoAction,
      dependencies,
      authority:
        EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_DEFAULT_AUTHORITY_FLAGS,
      safetyPolicy:
        EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_DEFAULT_SAFETY_POLICY,
      blockedReasons: [...executionBlockedReasons],
      warnings: [...executionWarnings],
      reviewItems: input.blocked ? ["manual_review"] : [],
      metadata: {
        fixtureOnly: true,
        devPreviewOnly: true,
        explicitTriggerOnly: true,
        dryRunExecutionValidatorDiagnosticsOnly: true,
        noDryRunExecution: true,
        noAuditWrite: true,
        noAuditAppend: true,
        noRouteCall: true,
        noPersistenceWrite: true,
      },
    };
  const dryRunExecutionResult: ExecutionRecordAuditAppendWriterDryRunExecutionResult =
    {
      contractVersion:
        EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_CONTRACT_VERSION,
      status: input.blocked
        ? "audit_append_writer_dry_run_execution_blocked"
        : "audit_append_writer_dry_run_execution_ready_for_design_only",
      decisionRecommendation: input.blocked
        ? "blocked_do_not_write_audit"
        : "design_only_do_not_write_audit",
      validationOnly: true,
      designOnly: true,
      dryRunExecutionOnly: true,
      hypotheticalOnly: true,
      nonPersistent: true,
      dryRunExecutedAgainstRealData: false,
      dryRunExecutionImplemented: false,
      dryRunExecutionAllowed: false,
      auditWriteExecuted: false,
      auditWriteAllowed: false,
      safeToWriteAudit: false,
      dryRunExecutionResultIsAuditWriteApproval: false,
      dryRunExecutionResultIsAuditAppendExecution: false,
      dryRunExecutionResultIsRouteCallApproval: false,
      dryRunExecutionResultIsRecordCreationApproval: false,
      dryRunExecutionResultIsPersistenceWriteApproval: false,
      dryRunExecutionResultIsSupabaseLocalStorageWriteApproval: false,
      dryRunExecutionResultIsSecurityProof: false,
      dryRunExecutionResultIsServerOnlyProof: false,
      dryRunExecutionResultIsSchemaProof: false,
      dryRunExecutionResultIsGeneratedTypesProof: false,
      dryRunExecutionResultIsMigrationProof: false,
      dryRunExecutionResultIsRlsSecurityProof: false,
      dryRunExecutionResultIsDownstreamApproval: false,
      dryRunValidatorReadinessIsExecution: false,
      dryRunValidatorReadinessIsWriteApproval: false,
      contractValidatorReadinessIsWriteApproval: false,
      writerValidatorReadinessIsWriteApproval: false,
      insertSuccessIsAuditWriteApproval: false,
      devPreviewDiagnosticsAreWriteApproval: false,
      simulatedAuditEventPayload,
      simulatedTableSchemaTarget,
      simulatedIdempotency,
      simulatedDuplicatePrevention,
      evidenceProvenance: evidenceProvenanceSummary,
      serverOnlySecurity,
      noWriteNoAction,
      dependencies,
      authority: dryRunExecutionInput.authority,
      safetyPolicy: dryRunExecutionInput.safetyPolicy,
      blockedReasons: [...executionBlockedReasons],
      warnings: [...executionWarnings],
      reviewItems: input.blocked ? ["manual_review"] : [],
      metadata: {
        fixtureOnly: true,
        devPreviewOnly: true,
        diagnosticsOnly: true,
        noDryRunExecution: true,
        noAuditWrite: true,
      },
    };

  return {
    contractVersion:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATOR_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    requestedBy: "execution_record_persistence_validator_integration_fixture",
    dryRunExecutionInput,
    dryRunExecutionResult,
    dryRunValidatorResult,
    dryRunResultInput,
    writerContractValidationResult,
    writerValidatorResult,
    auditWriterContractInput,
    auditEventCandidate,
    executionRecordReference,
    evidenceProvenance,
    idempotencyMetadata,
    duplicatePreventionMetadata,
    serverOnlySecurityProofStatus: proofStatus,
    schemaTableProofStatus: proofStatus,
    generatedAuditTypesProofStatus: proofStatus,
    migrationProofStatus: proofStatus,
    rlsSecurityProofStatus: proofStatus,
    serviceRoleExposureRiskStatus: "risk_absent",
    clientSideWriteRiskStatus: "risk_absent",
    explicitDryRunOnlyFlag: true,
    manualReviewMetadata: dryRunValidationInput.manualReviewMetadata ?? null,
    downstreamAuthorityMetadata: {
      fixtureOnly: true,
      downstreamAuthorityPresent: false,
    },
    inputValidation: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      dryRunExecutionValidationInputPresent: true,
      dryRunExecutionInputPresent: true,
      dryRunValidatorResultPresent: true,
      dryRunResultInputPresent: Boolean(dryRunResultInput),
      writerContractValidationResultPresent: Boolean(
        writerContractValidationResult,
      ),
      writerValidatorResultPresent: Boolean(writerValidatorResult),
      writerContractInputPresent: Boolean(auditWriterContractInput),
      auditEventCandidatePresent: Boolean(auditEventCandidate),
      executionRecordReferencePresent: Boolean(executionRecordReference),
      evidenceProvenancePresent: Boolean(evidenceProvenance),
      idempotencyMetadataPresent: Boolean(idempotencyMetadata),
      duplicatePreventionMetadataPresent: Boolean(duplicatePreventionMetadata),
      explicitDryRunOnlyFlagPresent: true,
      downstreamAuthorityMetadataPresent: true,
      unsafeCallablePresent: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: { fixtureOnly: true },
    },
    resultValidation: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      dryRunExecutionResultPresent: true,
      dryRunExecutionResultStatus: dryRunExecutionResult.status,
      dryRunExecutionResultReadyForDesignOnly: !input.blocked,
      dryRunExecutionResultClaimsWriteApproval: false,
      dryRunExecutionResultClaimsSecurityProof: false,
      dryRunExecutionResultClaimsSchemaProof: false,
      dryRunExecutionResultClaimsDownstreamApproval: false,
      dryRunExecutionResultClaimsAuditWriteExecuted: false,
      dryRunExecutionResultAuthorityFlagsAllFalse: true,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: { fixtureOnly: true },
    },
    simulatedAuditEventValidation: {
      statusKnown: true,
      readyForDesignOnly: true,
      auditEventCandidatePresent: Boolean(auditEventCandidate),
      simulatedAuditEventPayloadPresent: true,
      wouldAttemptAuditWrite: false,
      auditWriteExecuted: false,
      auditWriteAllowed: false,
      safeToWriteAudit: false,
      executionRecordReferencePresent: Boolean(executionRecordReference),
      hypotheticalOnly: true,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: { fixtureOnly: true },
    },
    simulatedTableSchemaValidation: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      schemaTableStatusKnown: !input.blocked,
      schemaTableProofPresent: !input.blocked,
      generatedAuditTypesStatusKnown: !input.blocked,
      generatedAuditTypesProofPresent: !input.blocked,
      generatedExecutionRecordTypesPresent: !input.blocked,
      generatedExecutionRecordTypesAssumedEnough: false,
      migrationStatusKnown: !input.blocked,
      migrationProofPresent: !input.blocked,
      rlsSecurityStatusKnown: !input.blocked,
      rlsSecurityProofPresent: !input.blocked,
      schemaTableAssumedWithoutProof: false,
      blockedReasons: [...validationBlockedReasons],
      warnings: [],
      reviewItems: [...validationReviewItems],
      metadata: { fixtureOnly: true },
    },
    simulatedIdempotencyDuplicatePreventionValidation: {
      statusKnown: true,
      readyForDesignOnly: true,
      idempotencyKeyPresent: Boolean(dryRunResultInput?.idempotencyKey),
      idempotencyMetadataComplete: true,
      duplicatePreventionKeyPresent: Boolean(
        dryRunResultInput?.duplicatePreventionKey,
      ),
      duplicatePreventionMetadataComplete: true,
      retrySafetyRepresented: true,
      unknownWriteStatusRepresented: true,
      duplicateMatches:
        dryRunResult?.duplicatePreventionSimulation.duplicateMatches ?? [],
      simulatedDuplicateWriteWouldBeBlocked: true,
      duplicateWriteExecuted: false,
      safeToWriteDuplicateAuditEvent: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: { fixtureOnly: true },
    },
    evidenceProvenanceValidation: {
      statusKnown: true,
      readyForDesignOnly: true,
      executionRecordReference,
      executionRecordReferencePresent: Boolean(executionRecordReference),
      evidenceProvenancePresent: Boolean(evidenceProvenance),
      actorSourceMetadataPresent:
        dryRunResult?.evidenceProvenance.actorSourceMetadataPresent === true,
      timestampSourceClockPresent:
        dryRunResult?.evidenceProvenance.timestampSourceClockPresent === true,
      auditEventCandidatePresent: Boolean(auditEventCandidate),
      sourceReferences: dryRunResult?.evidenceProvenance.sourceReferences ?? [],
      noLocalOnlySourceOfTruth: true,
      provenanceTraceComplete:
        dryRunResult?.evidenceProvenance.provenanceTraceComplete === true,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: { fixtureOnly: true },
    },
    serverOnlySecurityDependencyValidation: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      serverOnlySecurityStatusKnown: !input.blocked,
      serverOnlyProofPresent: !input.blocked,
      serviceRoleProofPresent: !input.blocked,
      serviceRoleExposureRisk: false,
      clientSideWriteRisk: false,
      routeAuthBoundaryProofPresent: !input.blocked,
      serviceRoleSecretValuesForbidden: true,
      clientSideWriteForbidden: true,
      blockedReasons: input.blocked
        ? ["server_only_security_status_missing"]
        : [],
      warnings: [],
      reviewItems: input.blocked
        ? ["server_only_security_dependency_review"]
        : [],
      metadata: { fixtureOnly: true },
    },
    noWriteNoActionSafetyValidation: {
      statusKnown: true,
      readyForDesignOnly: true,
      validationOnly: true,
      designOnly: true,
      dryRunExecutionValidationOnly: true,
      hypotheticalOnly: true,
      nonPersistent: true,
      dryRunExecuted: false,
      dryRunExecutedAgainstRealData: false,
      auditWriteExecuted: false,
      auditWriteAllowed: false,
      auditAppendAllowed: false,
      routeCallAllowed: false,
      recordCreationAllowed: false,
      persistenceWriteAllowed: false,
      supabaseWriteAllowed: false,
      localStorageWriteAllowed: false,
      statsPnlUpdateAllowed: false,
      tradeMutationAllowed: false,
      tradeReconciliationAllowed: false,
      correctionRollbackAllowed: false,
      uiStateMutationAllowed: false,
      userNotificationAllowed: false,
      brokerAvanzaActionAllowed: false,
      automaticModeAllowed: false,
      blockedReasons: [],
      warnings: [],
      reviewItems: [],
      metadata: { fixtureOnly: true },
    },
    dependencyValidation: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      dryRunExecutionValidatorImplemented: false,
      dryRunExecutionImplemented: false,
      dryRunImplemented: false,
      writerImplemented: false,
      auditAppendImplemented: false,
      auditRouteImplemented: false,
      auditWritePathPresent: false,
      productionInsertRouteImplemented: false,
      productionInsertWritePathPresent: false,
      dryRunExecutionContractPresent: true,
      dryRunValidatorResultPresent: true,
      dryRunResultInputPresent: Boolean(dryRunResultInput),
      contractValidatorResultPresent: Boolean(writerContractValidationResult),
      writerValidatorResultPresent: Boolean(writerValidatorResult),
      writerContractInputPresent: Boolean(auditWriterContractInput),
      serverOnlyProofPresent: !input.blocked,
      serviceRoleProofPresent: !input.blocked,
      auditSchemaTableProofPresent: !input.blocked,
      generatedAuditTypesProofPresent: !input.blocked,
      generatedTypesProofPresent: !input.blocked,
      migrationProofPresent: !input.blocked,
      rlsSecurityProofPresent: !input.blocked,
      devPreviewDiagnosticsAreProof: false,
      blockedReasons: [...validationBlockedReasons],
      warnings: [],
      reviewItems: input.blocked ? ["dependency_validation_review"] : [],
      metadata: { fixtureOnly: true },
    },
    authority:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_VALIDATION_DEFAULT_SAFETY_POLICY,
    blockedReasons: [...validationBlockedReasons],
    warnings: [...validationWarnings],
    reviewItems: input.blocked ? ["manual_review"] : [],
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      explicitTriggerOnly: true,
      diagnosticsOnly: true,
      noDryRunExecution: true,
      noAuditWriterExecution: true,
      noAuditWrite: true,
      noAuditAppend: true,
      noRouteCall: true,
      noPersistenceWrite: true,
      noSupabaseWrite: true,
      noLocalStorageWrite: true,
      noDownstreamActions: true,
    },
  };
}

function buildAuditAppendWriterDryRunExecutionImplementationInput(input: {
  auditAppendWriterDryRunExecutionValidationInput: ExecutionRecordAuditAppendWriterDryRunExecutionValidationInput;
  auditAppendWriterDryRunExecutionValidationResult: ExecutionRecordAuditAppendWriterDryRunExecutionValidationResult;
  blocked: boolean;
}): ExecutionRecordAuditAppendWriterDryRunExecutionImplementationInput {
  const validationInput = input.auditAppendWriterDryRunExecutionValidationInput;
  const validationResult = input.auditAppendWriterDryRunExecutionValidationResult;
  const dryRunExecutionInput = validationInput.dryRunExecutionInput;
  const dryRunExecutionResult = validationInput.dryRunExecutionResult!;
  const dryRunResultInput = validationInput.dryRunResultInput;
  const blockedReasons = input.blocked
    ? (["proof_statuses_missing"] as const)
    : [];
  const warnings = [
    "contract_only",
    "dry_run_execution_not_real_write",
    "audit_writer_not_implemented",
    "audit_route_not_implemented",
    "audit_write_not_executed",
    "dry_run_execution_implementation_not_audit_write_approval",
    "dry_run_execution_implementation_not_security_proof",
    "dry_run_execution_implementation_not_schema_proof",
    "dry_run_execution_implementation_not_downstream_approval",
    "automatic_mode_not_enabled",
  ] as const;
  const reviewItems = input.blocked ? (["manual_review"] as const) : [];
  const proofStatus = input.blocked ? null : "fixture_present";

  return {
    contractVersion:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_IMPLEMENTATION_CONTRACT_VERSION,
    requestedAt: FIXTURE_TIMESTAMP,
    requestedBy: "execution_record_persistence_validator_integration_fixture",
    dryRunExecutionValidatorResult: validationResult,
    dryRunExecutionContractInput: dryRunExecutionInput,
    dryRunExecutionContractResult: dryRunExecutionResult,
    dryRunValidatorResult: validationInput.dryRunValidatorResult,
    dryRunResultInput: validationInput.dryRunResultInput,
    writerContractValidationResult: validationInput.writerContractValidationResult,
    writerValidatorResult: validationInput.writerValidatorResult,
    auditWriterContractInput: validationInput.auditWriterContractInput,
    auditEventCandidate: validationInput.auditEventCandidate,
    executionRecordReference: validationInput.executionRecordReference,
    evidenceProvenance: validationInput.evidenceProvenance,
    idempotencyKey: dryRunResultInput?.idempotencyKey ?? null,
    duplicatePreventionKey: dryRunResultInput?.duplicatePreventionKey ?? null,
    proofStatuses: input.blocked
      ? null
      : {
          serverOnlySecurityProofStatus: proofStatus,
          schemaTableProofStatus: proofStatus,
          generatedAuditTypesProofStatus: proofStatus,
          migrationProofStatus: proofStatus,
          rlsSecurityProofStatus: proofStatus,
        },
    serverOnlySecurityProofStatus: proofStatus,
    schemaTableProofStatus: proofStatus,
    generatedAuditTypesProofStatus: proofStatus,
    migrationProofStatus: proofStatus,
    rlsSecurityProofStatus: proofStatus,
    serviceRoleExposureRiskStatus: validationInput.serviceRoleExposureRiskStatus,
    clientSideWriteRiskStatus: validationInput.clientSideWriteRiskStatus,
    explicitDryRunOnlyFlag: validationInput.explicitDryRunOnlyFlag,
    manualReviewMetadata: validationInput.manualReviewMetadata,
    downstreamAuthorityMetadata: validationInput.downstreamAuthorityMetadata,
    simulatedAuditEventPayload: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      hypotheticalOnly: true,
      nonPersistent: true,
      sourceDryRunExecutionSummary:
        dryRunExecutionResult.simulatedAuditEventPayload,
      simulatedPayloadPresent:
        dryRunExecutionResult.simulatedAuditEventPayload
          .simulatedPayloadPresent,
      wouldAttemptAuditWrite:
        dryRunExecutionResult.simulatedAuditEventPayload
          .wouldAttemptAuditWrite,
      auditWriteExecuted: false,
      auditWriteAllowed: false,
      safeToWriteAudit: false,
      auditEventCandidatePresent: Boolean(validationInput.auditEventCandidate),
      auditEventType:
        dryRunExecutionResult.simulatedAuditEventPayload.auditEventType,
      auditEventSource:
        dryRunExecutionResult.simulatedAuditEventPayload.auditEventSource,
      auditPayloadShape:
        dryRunExecutionResult.simulatedAuditEventPayload.auditPayloadShape,
      executionRecordReference: validationInput.executionRecordReference,
      executionRecordReferencePresent: Boolean(
        validationInput.executionRecordReference,
      ),
      resultIsAuditWriteApproval: false,
      blockedReasons: [...blockedReasons],
      warnings: [...warnings],
      reviewItems: [...reviewItems],
      metadata: {
        fixtureOnly: true,
        devPreviewOnly: true,
        implementationDiagnosticsOnly: true,
      },
    },
    simulatedTableSchemaTarget: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      sourceDryRunExecutionSummary:
        dryRunExecutionResult.simulatedTableSchemaTarget,
      targetTable:
        dryRunExecutionResult.simulatedTableSchemaTarget.targetTable,
      targetSchema:
        dryRunExecutionResult.simulatedTableSchemaTarget.targetSchema,
      schemaTableStatusKnown:
        dryRunExecutionResult.simulatedTableSchemaTarget
          .schemaTableStatusKnown,
      schemaTableProofPresent:
        dryRunExecutionResult.simulatedTableSchemaTarget
          .schemaTableProofPresent,
      generatedAuditTypesStatusKnown:
        dryRunExecutionResult.simulatedTableSchemaTarget
          .generatedAuditTypesStatusKnown,
      generatedAuditTypesProofPresent:
        dryRunExecutionResult.simulatedTableSchemaTarget
          .generatedAuditTypesProofPresent,
      generatedExecutionRecordTypesPresent:
        dryRunExecutionResult.simulatedTableSchemaTarget
          .generatedExecutionRecordTypesPresent,
      generatedExecutionRecordTypesAssumedEnough: false,
      migrationStatusKnown:
        dryRunExecutionResult.simulatedTableSchemaTarget.migrationStatusKnown,
      migrationProofPresent:
        dryRunExecutionResult.simulatedTableSchemaTarget.migrationProofPresent,
      rlsSecurityStatusKnown:
        dryRunExecutionResult.simulatedTableSchemaTarget
          .rlsSecurityStatusKnown,
      rlsSecurityProofPresent:
        dryRunExecutionResult.simulatedTableSchemaTarget
          .rlsSecurityProofPresent,
      schemaTableAssumedWithoutProof: false,
      resultIsSchemaProof: false,
      blockedReasons: [...blockedReasons],
      warnings: [...warnings],
      reviewItems: [...reviewItems],
      metadata: {
        fixtureOnly: true,
        generatedExecutionRecordTypesAloneNotEnough: true,
      },
    },
    simulatedIdempotency: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      sourceDryRunExecutionSummary: dryRunExecutionResult.simulatedIdempotency,
      idempotencyKey: dryRunResultInput?.idempotencyKey ?? null,
      idempotencyKeyPresent: Boolean(dryRunResultInput?.idempotencyKey),
      idempotencyMetadataComplete:
        dryRunExecutionResult.simulatedIdempotency
          .idempotencyMetadataComplete,
      retrySafetyRepresented:
        dryRunExecutionResult.simulatedIdempotency.retrySafetyRepresented,
      unknownWriteStatusRepresented:
        dryRunExecutionResult.simulatedIdempotency
          .unknownWriteStatusRepresented,
      simulatedWriteIdempotent:
        dryRunExecutionResult.simulatedIdempotency.simulatedWriteIdempotent,
      idempotentWriteExecuted: false,
      resultIsWriteApproval: false,
      blockedReasons: [...blockedReasons],
      warnings: [...warnings],
      reviewItems: [...reviewItems],
      metadata: {
        fixtureOnly: true,
      },
    },
    simulatedDuplicatePrevention: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      sourceDryRunExecutionSummary:
        dryRunExecutionResult.simulatedDuplicatePrevention,
      duplicatePreventionKey: dryRunResultInput?.duplicatePreventionKey ?? null,
      duplicatePreventionKeyPresent: Boolean(
        dryRunResultInput?.duplicatePreventionKey,
      ),
      duplicatePreventionMetadataComplete:
        dryRunExecutionResult.simulatedDuplicatePrevention
          .duplicatePreventionMetadataComplete,
      duplicateMatches:
        dryRunExecutionResult.simulatedDuplicatePrevention.duplicateMatches,
      simulatedDuplicateWriteWouldBeBlocked:
        dryRunExecutionResult.simulatedDuplicatePrevention
          .simulatedDuplicateWriteWouldBeBlocked,
      duplicateWriteExecuted: false,
      safeToWriteDuplicateAuditEvent: false,
      resultIsWriteApproval: false,
      blockedReasons: [...blockedReasons],
      warnings: [...warnings],
      reviewItems: [...reviewItems],
      metadata: {
        fixtureOnly: true,
      },
    },
    evidenceProvenanceResult: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      sourceDryRunExecutionSummary: dryRunExecutionResult.evidenceProvenance,
      executionRecordReference: validationInput.executionRecordReference,
      executionRecordReferencePresent: Boolean(
        validationInput.executionRecordReference,
      ),
      evidenceProvenancePresent: Boolean(validationInput.evidenceProvenance),
      actorSourceMetadataPresent:
        dryRunExecutionResult.evidenceProvenance.actorSourceMetadataPresent,
      timestampSourceClockPresent:
        dryRunExecutionResult.evidenceProvenance.timestampSourceClockPresent,
      auditEventCandidatePresent: Boolean(validationInput.auditEventCandidate),
      sourceReferences:
        dryRunExecutionResult.evidenceProvenance.sourceReferences,
      noLocalOnlySourceOfTruth: true,
      provenanceTraceComplete:
        dryRunExecutionResult.evidenceProvenance.provenanceTraceComplete,
      resultIsSecurityProof: false,
      blockedReasons: [...blockedReasons],
      warnings: [...warnings],
      reviewItems: [...reviewItems],
      metadata: {
        fixtureOnly: true,
      },
    },
    serverOnlySecurity: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      sourceDryRunExecutionSummary: dryRunExecutionResult.serverOnlySecurity,
      serverOnlySecurityStatusKnown:
        dryRunExecutionResult.serverOnlySecurity
          .serverOnlySecurityStatusKnown,
      serverOnlyProofPresent:
        dryRunExecutionResult.serverOnlySecurity.serverOnlyProofPresent,
      serviceRoleProofPresent:
        dryRunExecutionResult.serverOnlySecurity.serviceRoleProofPresent,
      serviceRoleExposureRisk: false,
      clientSideWriteRisk: false,
      routeAuthBoundaryProofPresent:
        dryRunExecutionResult.serverOnlySecurity.routeAuthBoundaryProofPresent,
      serviceRoleSecretValuesForbidden: true,
      clientSideWriteForbidden: true,
      resultIsServerOnlyProof: false,
      resultIsRlsSecurityProof: false,
      blockedReasons: [...blockedReasons],
      warnings: [...warnings],
      reviewItems: [...reviewItems],
      metadata: {
        fixtureOnly: true,
        serviceRoleMustRemainServerOnly: true,
      },
    },
    noWriteNoAction: {
      statusKnown: true,
      readyForDesignOnly: true,
      sourceDryRunExecutionSummary: dryRunExecutionResult.noWriteNoAction,
      validationOnly: true,
      designOnly: true,
      dryRunExecutionOnly: true,
      hypotheticalOnly: true,
      nonPersistent: true,
      dryRunExecutionImplementationImplemented: false,
      dryRunExecutionAllowed: false,
      dryRunExecutedAgainstRealData: false,
      auditWriteExecuted: false,
      auditWriteAllowed: false,
      auditAppendAllowed: false,
      routeCallAllowed: false,
      recordCreationAllowed: false,
      persistenceWriteAllowed: false,
      supabaseWriteAllowed: false,
      localStorageWriteAllowed: false,
      statsPnlUpdateAllowed: false,
      tradeMutationAllowed: false,
      tradeReconciliationAllowed: false,
      correctionRollbackAllowed: false,
      uiStateMutationAllowed: false,
      userNotificationAllowed: false,
      brokerAvanzaActionAllowed: false,
      automaticModeAllowed: false,
      blockedReasons: [...blockedReasons],
      warnings: [...warnings],
      reviewItems: [...reviewItems],
      metadata: {
        fixtureOnly: true,
        diagnosticsOnly: true,
      },
    },
    dependencies: {
      statusKnown: true,
      readyForDesignOnly: !input.blocked,
      dryRunExecutionValidatorResultPresent: true,
      dryRunExecutionContractInputPresent: true,
      dryRunExecutionContractResultPresent: true,
      dryRunValidatorResultPresent: Boolean(validationInput.dryRunValidatorResult),
      dryRunResultInputPresent: Boolean(validationInput.dryRunResultInput),
      contractValidatorResultPresent: Boolean(
        validationInput.writerContractValidationResult,
      ),
      writerValidatorResultPresent: Boolean(validationInput.writerValidatorResult),
      writerContractInputPresent: Boolean(validationInput.auditWriterContractInput),
      dryRunExecutionImplementationImplemented: false,
      dryRunExecutionImplemented: false,
      dryRunImplemented: false,
      writerImplemented: false,
      auditAppendImplemented: false,
      auditRouteImplemented: false,
      auditWritePathPresent: false,
      productionInsertRouteImplemented: false,
      productionInsertWritePathPresent: false,
      serverOnlyProofPresent: !input.blocked,
      serviceRoleProofPresent: !input.blocked,
      auditSchemaTableProofPresent: !input.blocked,
      generatedAuditTypesProofPresent: !input.blocked,
      generatedTypesProofPresent: !input.blocked,
      migrationProofPresent: !input.blocked,
      rlsSecurityProofPresent: !input.blocked,
      devPreviewDiagnosticsAreProof: false,
      blockedReasons: [...blockedReasons],
      warnings: [...warnings],
      reviewItems: [...reviewItems],
      metadata: {
        fixtureOnly: true,
        noAuditWritePath: true,
      },
    },
    authority:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_IMPLEMENTATION_DEFAULT_AUTHORITY_FLAGS,
    safetyPolicy:
      EXECUTION_RECORD_AUDIT_APPEND_WRITER_DRY_RUN_EXECUTION_IMPLEMENTATION_DEFAULT_SAFETY_POLICY,
    blockedReasons: [...blockedReasons],
    warnings: [...warnings],
    reviewItems: [...reviewItems],
    metadata: {
      fixtureOnly: true,
      devPreviewOnly: true,
      explicitTriggerOnly: true,
      diagnosticsOnly: true,
      noAuditWriterExecution: true,
      noAuditWrite: true,
      noAuditAppend: true,
      noRouteCall: true,
      noPersistenceWrite: true,
      noSupabaseWrite: true,
      noLocalStorageWrite: true,
      noDownstreamActions: true,
    },
  };
}

async function buildScenario(input: {
  blocked: boolean;
  label: string;
}): Promise<ExecutionRecordPersistenceValidatorIntegrationDevFixtureScenario> {
  const adapterInput = buildAdapterInput({ blocked: input.blocked });
  const integrationResult = buildExecutionRecordPersistenceValidatorIntegration({
    requestedAt: FIXTURE_TIMESTAMP,
    adapterInput,
    generatedTypesStatus: input.blocked ? "unknown" : "available",
    migrationApplicationStatus: input.blocked ? "unknown" : "proven",
    rlsSecurityStatus: input.blocked ? "unknown" : "proven",
    serverOnlyWriteBoundaryStatus: input.blocked ? "unknown" : "proven",
    dryRunInsertRouteStatus: input.blocked ? "unknown" : "known",
    metadata: {
      fixtureOnly: true,
      validationOnly: true,
      noPersistenceValidatorCall: true,
      noInsertRouteCall: true,
      devPreviewScenario: input.label,
    },
  });
  const adapterResult = integrationResult.adapterResult;
  const validatorInput = integrationResult.validationInput;
  const validatorResult = integrationResult.validationResult;

  if (!adapterResult || !validatorInput || !validatorResult) {
    throw new Error(
      "Persistence validator integration fixture expected composer sub-results.",
    );
  }
  const boundaryCallValidatorInput = buildBoundaryCallValidatorInput({
    adapterInput,
    adapterResult,
    blocked: input.blocked,
    integrationResult,
    validatorResult,
  });
  const boundaryCallValidatorResult =
    validateActualPersistenceValidatorBoundaryCall(boundaryCallValidatorInput);
  const boundaryCallWrapperInput = buildBoundaryCallWrapperInput({
    boundaryCallValidatorInput,
    boundaryCallValidatorResult,
  });
  const boundaryCallWrapperResult = callActualPersistenceValidatorBoundary(
    boundaryCallWrapperInput,
  );
  const insertRouteReadinessValidatorInput =
    buildInsertRouteReadinessValidatorInput({
      blocked: input.blocked,
      boundaryCallValidatorInput,
      boundaryCallValidatorResult,
      boundaryCallWrapperResult,
      label: input.label,
    });
  const insertRouteReadinessValidatorResult =
    validateExecutionRecordInsertRouteReadiness(
      insertRouteReadinessValidatorInput,
    );
  const insertRouteCallWrapperInput = buildInsertRouteCallWrapperInput({
    blocked: input.blocked,
    insertRouteReadinessValidatorInput,
    insertRouteReadinessValidatorResult,
    label: input.label,
  });
  const insertRouteCallWrapperResult = await callExecutionRecordInsertRoute(
    insertRouteCallWrapperInput,
  );
  const productionInsertRouteBoundaryValidatorInput =
    buildProductionInsertRouteBoundaryValidatorInput({
      blocked: input.blocked,
      insertRouteCallWrapperInput,
      insertRouteCallWrapperResult,
      insertRouteReadinessValidatorInput,
      insertRouteReadinessValidatorResult,
      label: input.label,
    });
  const productionInsertRouteBoundaryValidatorResult =
    validateExecutionRecordProductionInsertRouteBoundary(
      productionInsertRouteBoundaryValidatorInput,
    );
  const postInsertBoundaryValidatorInput =
    buildPostInsertBoundaryValidatorInput({
      blocked: input.blocked,
      insertRouteCallWrapperInput,
      insertRouteCallWrapperResult,
      productionInsertRouteBoundaryValidatorResult,
    });
  const postInsertBoundaryValidatorResult =
    validateExecutionRecordPostInsertBoundary(
      postInsertBoundaryValidatorInput,
    );
  const auditAppendBoundaryValidatorInput =
    buildAuditAppendBoundaryValidatorInput({
      blocked: input.blocked,
      insertRouteCallWrapperInput,
      insertRouteCallWrapperResult,
      postInsertBoundaryValidatorInput,
      postInsertBoundaryValidatorResult,
      productionInsertRouteBoundaryValidatorResult,
    });
  const auditAppendBoundaryValidatorResult =
    validateExecutionRecordAuditAppendBoundary(
      auditAppendBoundaryValidatorInput,
    );
  const auditAppendWriterValidationInput =
    buildAuditAppendWriterValidationInput({
      auditAppendBoundaryValidatorInput,
      auditAppendBoundaryValidatorResult,
      blocked: input.blocked,
    });
  const auditAppendWriterValidationResult =
    validateExecutionRecordAuditAppendWriter(auditAppendWriterValidationInput);
  const auditAppendWriterContractValidationInput =
    buildAuditAppendWriterContractValidationInput({
      auditAppendWriterValidationInput,
      auditAppendWriterValidationResult,
      blocked: input.blocked,
    });
  const auditAppendWriterContractValidationResult =
    validateExecutionRecordAuditAppendWriterContract(
      auditAppendWriterContractValidationInput,
    );
  const auditAppendWriterDryRunValidationInput =
    buildAuditAppendWriterDryRunValidationInput({
      auditAppendWriterContractValidationInput,
      auditAppendWriterContractValidationResult,
      auditAppendWriterValidationInput,
      auditAppendWriterValidationResult,
      blocked: input.blocked,
    });
  const auditAppendWriterDryRunValidationResult =
    validateExecutionRecordAuditAppendWriterDryRun(
      auditAppendWriterDryRunValidationInput,
    );
  const auditAppendWriterDryRunExecutionValidationInput =
    buildAuditAppendWriterDryRunExecutionValidationInput({
      auditAppendWriterDryRunValidationInput,
      auditAppendWriterDryRunValidationResult,
      blocked: input.blocked,
    });
  const auditAppendWriterDryRunExecutionValidationResult =
    validateExecutionRecordAuditAppendWriterDryRunExecution(
      auditAppendWriterDryRunExecutionValidationInput,
    );
  const auditAppendWriterDryRunExecutionImplementationInput =
    buildAuditAppendWriterDryRunExecutionImplementationInput({
      auditAppendWriterDryRunExecutionValidationInput,
      auditAppendWriterDryRunExecutionValidationResult,
      blocked: input.blocked,
    });
  const auditAppendWriterDryRunExecutionImplementationResult =
    executeAuditAppendWriterDryRun(
      auditAppendWriterDryRunExecutionImplementationInput,
    );

  return {
    adapterInput,
    adapterResult,
    auditAppendBoundaryValidatorInput,
    auditAppendBoundaryValidatorResult,
    auditAppendWriterContractValidationInput,
    auditAppendWriterContractValidationResult,
    auditAppendWriterDryRunExecutionImplementationInput,
    auditAppendWriterDryRunExecutionImplementationResult,
    auditAppendWriterDryRunExecutionValidationInput,
    auditAppendWriterDryRunExecutionValidationResult,
    auditAppendWriterDryRunValidationInput,
    auditAppendWriterDryRunValidationResult,
    auditAppendWriterValidationInput,
    auditAppendWriterValidationResult,
    boundaryCallValidatorInput,
    boundaryCallValidatorResult,
    boundaryCallWrapperInput,
    boundaryCallWrapperResult,
    insertRouteCallWrapperInput,
    insertRouteCallWrapperResult,
    insertRouteReadinessValidatorInput,
    insertRouteReadinessValidatorResult,
    integrationResult,
    label: input.label,
    postInsertBoundaryValidatorInput,
    postInsertBoundaryValidatorResult,
    productionInsertRouteBoundaryValidatorInput,
    productionInsertRouteBoundaryValidatorResult,
    validatorInput,
    validatorResult,
  };
}

export async function buildExecutionRecordPersistenceValidatorIntegrationDevFixtureResult(): Promise<ExecutionRecordPersistenceValidatorIntegrationDevFixtureResult> {
  const readyScenario = await buildScenario({
    blocked: false,
    label: "Ready fixture path",
  });
  const reviewScenario = await buildScenario({
    blocked: true,
    label: "Blocked/review fixture path",
  });

  return {
    readyScenario,
    reviewScenario,
    metadata: {
      fixtureOnly: true,
      explicitTriggerOnly: true,
      readOnlyPreview: true,
      usesPureIntegrationComposer: true,
      proposedPersistenceInputOnly: true,
      callsOnlyAdapterAndIntegrationValidator: true,
      callsPureBoundaryCallValidator: true,
      callsBoundaryCallWrapperWithFixtureCallableOnly: true,
      actualPersistenceValidatorBoundary: "fixture_wrapper_diagnostics_only",
      actualPersistenceValidatorBoundaryCallValidatorRan: true,
      actualPersistenceValidatorBoundaryCallWrapperRan: true,
      persistenceValidatorCalled: true,
      persistenceValidatorCalledByFixtureWrapperOnly: true,
      callsInsertRouteReadinessValidator: true,
      insertRouteReadinessValidatorRan: true,
      insertRouteReadinessOnly: true,
      callsInsertRouteCallWrapper: true,
      insertRouteCallWrapperRan: true,
      insertRouteCallWrapperDiagnosticsOnly: true,
      insertRouteCalledByFixtureCallableOnly: true,
      insertRouteCalled: true,
      insertRouteProductionCalled: false,
      callsProductionInsertRouteBoundaryValidator: true,
      productionInsertRouteBoundaryValidatorRan: true,
      productionInsertRouteBoundaryDiagnosticsOnly: true,
      callsPostInsertBoundaryValidator: true,
      postInsertBoundaryValidatorRan: true,
      postInsertBoundaryDiagnosticsOnly: true,
      callsAuditAppendBoundaryValidator: true,
      auditAppendBoundaryValidatorRan: true,
      auditAppendBoundaryDiagnosticsOnly: true,
      callsAuditAppendWriterValidator: true,
      callsAuditAppendWriterContractValidator: true,
      callsAuditAppendWriterDryRunValidator: true,
      callsAuditAppendWriterDryRunExecutionValidator: true,
      auditAppendWriterDryRunExecutionImplementationRan: true,
      auditAppendWriterValidatorRan: true,
      auditAppendWriterContractValidatorRan: true,
      auditAppendWriterDryRunValidatorRan: true,
      auditAppendWriterDryRunExecutionValidatorRan: true,
      auditAppendWriterValidatorDiagnosticsOnly: true,
      auditAppendWriterContractValidatorDiagnosticsOnly: true,
      auditAppendWriterDryRunValidatorDiagnosticsOnly: true,
      auditAppendWriterDryRunExecutionValidatorDiagnosticsOnly: true,
      auditAppendWriterDryRunExecutionImplementationDiagnosticsOnly: true,
      auditAppendRan: false,
      auditWriterRan: false,
      postInsertActionsRan: false,
      productionInsertRouteImplemented: false,
      productionInsertRouteCalled: false,
      executionRecordCreated: false,
      executionRecordPersisted: false,
      noSupabaseWrite: true,
      noLocalStorageWrite: true,
      noAuditAppend: true,
      noStatsUpdate: true,
      noRollbackCorrection: true,
      noTradeMutation: true,
      noBrokerOrderBehavior: true,
      noAvanzaBehavior: true,
      noBrowserAutomation: true,
    },
  };
}
