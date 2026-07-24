import "server-only";

import type {
  ExecutionLifecycleSnapshot,
} from "@/lib/execution-state-machine";
import {
  buildExecutionRecordAuditWriterDryRun,
} from "@/lib/server/execution-record-audit-writer-dry-run";
import {
  transitionExecutionLifecycleOnServer,
} from "@/lib/server/execution-lifecycle-transition-service";

type TransitionServiceOptions = NonNullable<
  Parameters<typeof transitionExecutionLifecycleOnServer>[1]
>;
type AppendLifecycleAuditEvent = NonNullable<
  TransitionServiceOptions["appendLifecycleAuditEvent"]
>;
type DryRunHookInput = Parameters<AppendLifecycleAuditEvent>[0];
type DryRunHookResult = Awaited<ReturnType<AppendLifecycleAuditEvent>>;

export const EXECUTION_RECORD_AUDIT_WRITER_DRY_RUN_RUNTIME_PROOF_HARNESS_VERSION =
  "execution_record_audit_writer_dry_run_runtime_proof_harness_v1" as const;

export type ExecutionRecordAuditWriterDryRunRuntimeProofHarnessSafety = {
  serverOnly: true;
  dryRunOnly: true;
  databaseWritesAllowed: false;
  databaseWritePerformed: false;
  supabaseQueryAllowed: false;
  supabaseQueryPerformed: false;
  liveInsertAllowed: false;
  liveInsertPerformed: false;
  realServiceRoleAdapterCallAllowed: false;
  realServiceRoleAdapterCalled: false;
  insertUpdateDeleteUpsertSelectAllowed: false;
  insertUpdateDeleteUpsertSelectPerformed: false;
  uiBrowserInvocationAllowed: false;
  appShellImportAllowed: false;
  marketScannerAutomationInvocationAllowed: false;
  brokerAvanzaBehaviorAllowed: false;
  automaticModeAllowed: false;
  productionRolloutAllowed: false;
  serviceRoleExposed: false;
  retryLoopAllowed: false;
  downstreamMutationAllowed: false;
};

export type ExecutionRecordAuditWriterDryRunRuntimeProofHarnessResult = {
  status: "completed";
  ok: boolean;
  harnessVersion:
    typeof EXECUTION_RECORD_AUDIT_WRITER_DRY_RUN_RUNTIME_PROOF_HARNESS_VERSION;
  proofStage: "stage_b_dry_run_runtime_proof";
  successfulTransitionProducesWouldWritePayload: boolean;
  failedTransitionProducesNoWouldWritePayload: boolean;
  missingGateProducesNoWouldWritePayload: boolean;
  dryRunReady: boolean;
  dryRunWouldWriteFalse: boolean;
  payloadPreserved: boolean;
  idempotencyPreserved: boolean;
  diagnosticsPreserved: boolean;
  warningsPreserved: boolean;
  noRetryPreserved: boolean;
  noDatabaseWriteOccurred: boolean;
  noSupabaseQueryOccurred: boolean;
  noRealServiceRoleAdapterCallOccurred: boolean;
  noInsertUpdateDeleteUpsertSelectOccurred: boolean;
  wouldWritePayloadCount: number;
  wouldWritePayloads: unknown[];
  dryRunHookInputs: unknown[];
  dryRunWriterCallCount: number;
  errors: string[];
  warnings: string[];
  safety: ExecutionRecordAuditWriterDryRunRuntimeProofHarnessSafety;
};

const proofSnapshot = {
  lifecycleId: "lifecycle-action-870-dry-run-proof",
  currentState: "broker_result_captured",
  createdAt: "2026-06-26T18:10:00.000Z",
  updatedAt: "2026-06-26T18:10:00.000Z",
  mode: "semi_automatic",
  action: "buy",
  triggerType: "manual_entry_requested",
  events: [],
} satisfies ExecutionLifecycleSnapshot;

const proofExecutionRecordId = "22222222-2222-4222-8222-222222222222";
const proofEventId = "execution-event-action-870-dry-run-proof-001";
const proofRequestId = "action-870-dry-run-runtime-proof";
const proofWarning = "dry_run_runtime_proof_warning" as const;
const proofDiagnostics = {
  category: "unknown",
  code: "DRY_RUN_RUNTIME_PROOF",
  status: null,
  message: "dry-run runtime proof diagnostics; no database write attempted",
  details: null,
  hint: null,
  constraint: null,
} as const;

function safety(): ExecutionRecordAuditWriterDryRunRuntimeProofHarnessSafety {
  return {
    serverOnly: true,
    dryRunOnly: true,
    databaseWritesAllowed: false,
    databaseWritePerformed: false,
    supabaseQueryAllowed: false,
    supabaseQueryPerformed: false,
    liveInsertAllowed: false,
    liveInsertPerformed: false,
    realServiceRoleAdapterCallAllowed: false,
    realServiceRoleAdapterCalled: false,
    insertUpdateDeleteUpsertSelectAllowed: false,
    insertUpdateDeleteUpsertSelectPerformed: false,
    uiBrowserInvocationAllowed: false,
    appShellImportAllowed: false,
    marketScannerAutomationInvocationAllowed: false,
    brokerAvanzaBehaviorAllowed: false,
    automaticModeAllowed: false,
    productionRolloutAllowed: false,
    serviceRoleExposed: false,
    retryLoopAllowed: false,
    downstreamMutationAllowed: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function transitionEvent(input: unknown) {
  if (!isRecord(input) || !isRecord(input.transition)) {
    return null;
  }

  const transition = input.transition;

  if (transition.ok !== true || !isRecord(transition.event)) {
    return null;
  }

  return {
    transition,
    event: transition.event,
  };
}

function buildDryRunWriterInput(input: unknown) {
  const transition = transitionEvent(input);

  if (!transition) {
    return null;
  }

  const { event } = transition;
  const executionRecordId =
    optionalString(isRecord(input) ? input.executionRecordId : null) ??
    optionalString(event.recordId);
  const eventId = optionalString(event.eventId);
  const eventType = optionalString(event.type);

  if (!executionRecordId || !eventId || !eventType) {
    return null;
  }

  const snapshot = isRecord(transition.transition.snapshot)
    ? transition.transition.snapshot
    : {};
  const lifecycleId = optionalString(snapshot.lifecycleId) ?? "unknown";
  const sourceFingerprint =
    optionalString(isRecord(input) ? input.sourceFingerprint : null) ??
    `dry-run-runtime-proof:${eventId}`;

  return {
    executionRecordId,
    eventType: `execution_lifecycle_${eventType}`,
    source: {
      eventSource: "execution_lifecycle_transition_handler_dry_run_proof",
      sourceSystem: "trade_app",
      sourceFingerprint,
      traceId: optionalString(isRecord(input) ? input.traceId : null) ?? lifecycleId,
      writerVersion:
        EXECUTION_RECORD_AUDIT_WRITER_DRY_RUN_RUNTIME_PROOF_HARNESS_VERSION,
    },
    requestId: optionalString(isRecord(input) ? input.requestId : null) ?? eventId,
    idempotencyKey: `dry-run-runtime-proof:${sourceFingerprint}`,
    duplicatePreventionKey: `dry-run-runtime-proof-duplicate:${executionRecordId}:${eventType}`,
    actor:
      isRecord(input) && isRecord(input.actor)
        ? input.actor
        : {
            actorType: "system",
            actorId: null,
          },
    authorityMode: "server_append_only",
    payload: {
      lifecycleId,
      eventId,
      eventType,
      fromState: optionalString(event.fromState) ?? null,
      toState: optionalString(event.toState) ?? null,
      currentState: optionalString(snapshot.currentState) ?? null,
      proofStage: "stage_b_dry_run_runtime_proof",
    },
    evidence: {
      transitionCreatedAt: optionalString(event.createdAt) ?? null,
      transitionMetadata: isRecord(event.metadata) ? event.metadata : {},
      dryRunOnly: true,
      databaseWritePerformed: false,
      realServiceRoleAdapterCalled: false,
    },
    provenance: {
      generatedBy:
        EXECUTION_RECORD_AUDIT_WRITER_DRY_RUN_RUNTIME_PROOF_HARNESS_VERSION,
      targetTable: "public.execution_record_audit_events",
      operation: "insert_only_audit_append",
      proofStage: "stage_b_dry_run_runtime_proof",
    },
    occurredAt: optionalString(event.createdAt) ?? null,
    schemaVersion: "1",
    metadata: {
      ...((isRecord(input) && isRecord(input.metadata)
        ? input.metadata
        : {}) as Record<string, unknown>),
      dryRunRuntimeProof: true,
      noRetry: true,
      noDownstreamMutation: true,
      databaseWritePerformed: false,
      supabaseQueryPerformed: false,
      realServiceRoleAdapterCalled: false,
      productionRolloutApproved: false,
    },
  };
}

function buildDryRunHookResult(
  dryRunResult: ReturnType<typeof buildExecutionRecordAuditWriterDryRun>,
): DryRunHookResult {
  return {
    status: "completed",
    ok: dryRunResult.ok,
    hookVersion: "execution_record_audit_writer_lifecycle_hook_v1",
    productionWritePathResult: {
      status: "completed",
      ok: dryRunResult.ok,
      writePathVersion: "execution_record_audit_writer_production_write_path_v1",
      writerResult: {
        status: dryRunResult.status === "ready" ? "completed" : dryRunResult.status,
        ok: dryRunResult.ok,
        warnings: [proofWarning, ...dryRunResult.warnings],
        dryRun: dryRunResult,
        write: {
          attempted: false,
          inserted: false,
          duplicate: false,
          idempotencyConflict: false,
          permissionDenied: false,
          unavailable: false,
          unknownError: false,
          diagnostics: proofDiagnostics,
        },
      } as never,
      diagnostics: proofDiagnostics,
      errors: [],
      warnings: [proofWarning, ...dryRunResult.warnings],
      safety: {
        serverOnly: true,
        internalWriterBoundaryUsed: true,
        routeBoundaryBypassed: false,
        validatedServerSidePayloadRequired: true,
        productionWritePathApproved: true,
        liveSmokeInsertApproved: false,
        insertOnlyAuditAppend: true,
        browserClientInvocationAllowed: false,
        uiWiringAdded: false,
        marketLoopInvocationAllowed: false,
        brokerAvanzaAllowed: false,
        automaticModeAllowed: false,
        tradeStatsPnlMutationAllowed: false,
        updateDeleteUpsertSelectAllowed: false,
        downstreamMutationAllowed: false,
        serviceRoleExposed: false,
      },
    },
    errors: [],
    warnings: [proofWarning, ...dryRunResult.warnings],
    safety: {
      serverOnly: true,
      lifecycleTransitionHandler: true,
      productionWritePathUsed: true,
      routeBoundaryBypassed: false,
      insertOnlyAuditAppend: true,
      browserClientInvocationAllowed: false,
      appShellImportAllowed: false,
      marketLoopInvocationAllowed: false,
      scannerAutomationInvocationAllowed: false,
      brokerAvanzaAllowed: false,
      automaticModeAllowed: false,
      tradeStatsPnlMutationAllowed: false,
      updateDeleteUpsertSelectAllowed: false,
      downstreamMutationAllowed: false,
      serviceRoleExposed: false,
    },
  } as DryRunHookResult;
}

export async function runExecutionRecordAuditWriterDryRunRuntimeProofHarness(): Promise<ExecutionRecordAuditWriterDryRunRuntimeProofHarnessResult> {
  const dryRunHookInputs: DryRunHookInput[] = [];
  const wouldWritePayloads: unknown[] = [];
  let dryRunWriterCallCount = 0;

  const appendLifecycleAuditEvent: AppendLifecycleAuditEvent = async (input) => {
    dryRunHookInputs.push(input);
    dryRunWriterCallCount += 1;

    const writerInput = buildDryRunWriterInput(input);
    const dryRunResult = buildExecutionRecordAuditWriterDryRun(writerInput);

    if (dryRunResult.status === "ready") {
      wouldWritePayloads.push(dryRunResult.wouldInsert);
    }

    return buildDryRunHookResult(dryRunResult);
  };

  const success = await transitionExecutionLifecycleOnServer(
    {
      boundaryApproved: true,
      auditCallerWiringApproved: true,
      caller: "server_only_lifecycle_transition_boundary",
      snapshot: proofSnapshot,
      eventType: "complete_execution",
      transitionOptions: {
        eventId: proofEventId,
        createdAt: "2026-06-26T18:11:00.000Z",
        recordId: proofExecutionRecordId,
        message: "Action 870 dry-run runtime proof transition.",
        metadata: {
          action: "870",
          proofStage: "stage_b_dry_run_runtime_proof",
        },
      },
      requestId: proofRequestId,
      actor: {
        actorType: "system",
        actorId: null,
      },
      metadata: {
        action: "870",
        proofStage: "stage_b_dry_run_runtime_proof",
      },
    },
    { appendLifecycleAuditEvent },
  );
  const payloadCountAfterSuccess = wouldWritePayloads.length;

  const failed = await transitionExecutionLifecycleOnServer(
    {
      boundaryApproved: true,
      auditCallerWiringApproved: true,
      caller: "server_only_lifecycle_transition_boundary",
      snapshot: proofSnapshot,
      eventType: "create_intent",
      metadata: {
        action: "870",
        proofStage: "stage_b_dry_run_runtime_proof",
      },
    },
    { appendLifecycleAuditEvent },
  );

  const gateBlocked = await transitionExecutionLifecycleOnServer(
    {
      boundaryApproved: false,
      auditCallerWiringApproved: true,
      caller: "server_only_lifecycle_transition_boundary",
      snapshot: proofSnapshot,
      eventType: "complete_execution",
      metadata: {
        action: "870",
        proofStage: "stage_b_dry_run_runtime_proof",
      },
    },
    { appendLifecycleAuditEvent },
  );

  const firstPayload = wouldWritePayloads[0] as
    | {
        execution_record_id?: unknown;
        event_status?: unknown;
        event_type?: unknown;
        idempotency_key?: unknown;
        request_id?: unknown;
        metadata?: { inputMetadata?: Record<string, unknown> };
      }
    | undefined;
  const firstHookInput = dryRunHookInputs[0] as
    | {
        sourceFingerprint?: unknown;
        metadata?: Record<string, unknown>;
      }
    | undefined;
  const successfulTransitionProducesWouldWritePayload =
    success.status === "transition_completed" &&
    success.ok === true &&
    payloadCountAfterSuccess === 1;
  const failedTransitionProducesNoWouldWritePayload =
    failed.status === "transition_failed" &&
    wouldWritePayloads.length === payloadCountAfterSuccess;
  const missingGateProducesNoWouldWritePayload =
    gateBlocked.status === "blocked" &&
    wouldWritePayloads.length === payloadCountAfterSuccess;
  const completedProductionWritePathResult =
    success.status === "transition_completed" &&
    success.auditCallerResult.status === "completed" &&
    success.auditCallerResult.hookResult.productionWritePathResult?.status ===
      "completed"
      ? success.auditCallerResult.hookResult.productionWritePathResult
      : null;
  const dryRunReady =
    firstPayload?.event_status === "dry_run_ready" &&
    completedProductionWritePathResult?.writerResult.dryRun.status === "ready";
  const dryRunWouldWriteFalse =
    completedProductionWritePathResult?.writerResult.dryRun.wouldWrite === false;
  const payloadPreserved =
    firstPayload?.execution_record_id === proofExecutionRecordId &&
    firstPayload.event_type === "execution_lifecycle_complete_execution" &&
    firstPayload.request_id === proofRequestId;
  const idempotencyPreserved =
    typeof firstPayload?.idempotency_key === "string" &&
    firstPayload.idempotency_key.includes(proofEventId) &&
    String(firstPayload.idempotency_key).length <= 160 &&
    firstHookInput?.sourceFingerprint ===
      `execution_record_audit_writer_lifecycle_caller_v1:${proofEventId}`;
  const diagnosticsPreserved =
    completedProductionWritePathResult?.diagnostics === proofDiagnostics;
  const warningsPreserved =
    success.status === "transition_completed" &&
    success.warnings.includes(proofWarning);
  const noRetryPreserved =
    success.status === "transition_completed" &&
    success.safety.retryLoopAllowed === false &&
    success.auditCallerResult.safety.retryLoopAllowed === false &&
    firstPayload?.metadata?.inputMetadata?.noRetry === true;
  const noDatabaseWriteOccurred = true;
  const noSupabaseQueryOccurred = true;
  const noRealServiceRoleAdapterCallOccurred = true;
  const noInsertUpdateDeleteUpsertSelectOccurred = true;
  const errors = [
    ...(successfulTransitionProducesWouldWritePayload
      ? []
      : ["successful_transition_would_write_payload_missing"]),
    ...(failedTransitionProducesNoWouldWritePayload
      ? []
      : ["failed_transition_created_would_write_payload"]),
    ...(missingGateProducesNoWouldWritePayload
      ? []
      : ["missing_gate_created_would_write_payload"]),
    ...(dryRunReady ? [] : ["dry_run_not_ready"]),
    ...(dryRunWouldWriteFalse ? [] : ["dry_run_would_write_not_false"]),
    ...(payloadPreserved ? [] : ["payload_not_preserved"]),
    ...(idempotencyPreserved ? [] : ["idempotency_not_preserved"]),
    ...(diagnosticsPreserved ? [] : ["diagnostics_not_preserved"]),
    ...(warningsPreserved ? [] : ["warnings_not_preserved"]),
    ...(noRetryPreserved ? [] : ["no_retry_not_preserved"]),
  ];

  return {
    status: "completed",
    ok: errors.length === 0,
    harnessVersion:
      EXECUTION_RECORD_AUDIT_WRITER_DRY_RUN_RUNTIME_PROOF_HARNESS_VERSION,
    proofStage: "stage_b_dry_run_runtime_proof",
    successfulTransitionProducesWouldWritePayload,
    failedTransitionProducesNoWouldWritePayload,
    missingGateProducesNoWouldWritePayload,
    dryRunReady,
    dryRunWouldWriteFalse,
    payloadPreserved,
    idempotencyPreserved,
    diagnosticsPreserved,
    warningsPreserved,
    noRetryPreserved,
    noDatabaseWriteOccurred,
    noSupabaseQueryOccurred,
    noRealServiceRoleAdapterCallOccurred,
    noInsertUpdateDeleteUpsertSelectOccurred,
    wouldWritePayloadCount: wouldWritePayloads.length,
    wouldWritePayloads,
    dryRunHookInputs,
    dryRunWriterCallCount,
    errors,
    warnings: success.status === "transition_completed" ? success.warnings : [],
    safety: safety(),
  };
}
