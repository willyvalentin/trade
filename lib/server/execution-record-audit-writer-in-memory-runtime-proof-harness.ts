import "server-only";

import type {
  ExecutionLifecycleSnapshot,
} from "@/lib/execution-state-machine";
import {
  transitionExecutionLifecycleOnServer,
} from "@/lib/server/execution-lifecycle-transition-service";

type TransitionServiceOptions = NonNullable<
  Parameters<typeof transitionExecutionLifecycleOnServer>[1]
>;
type AppendLifecycleAuditEvent = NonNullable<
  TransitionServiceOptions["appendLifecycleAuditEvent"]
>;
type InMemoryHookResult = Awaited<ReturnType<AppendLifecycleAuditEvent>>;

export const EXECUTION_RECORD_AUDIT_WRITER_IN_MEMORY_RUNTIME_PROOF_HARNESS_VERSION =
  "execution_record_audit_writer_in_memory_runtime_proof_harness_v1" as const;

export type ExecutionRecordAuditWriterInMemoryRuntimeProofHarnessSafety = {
  serverOnly: true;
  inMemoryOnly: true;
  databaseWritesAllowed: false;
  supabaseQueryAllowed: false;
  liveInsertAllowed: false;
  realServiceRoleAdapterCallAllowed: false;
  insertUpdateDeleteUpsertSelectAllowed: false;
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

export type ExecutionRecordAuditWriterInMemoryRuntimeProofHarnessResult = {
  status: "completed";
  ok: boolean;
  harnessVersion:
    typeof EXECUTION_RECORD_AUDIT_WRITER_IN_MEMORY_RUNTIME_PROOF_HARNESS_VERSION;
  proofStage: "stage_a_in_memory_runtime_proof";
  successfulTransitionCreatesAppendIntent: boolean;
  failedTransitionCreatesNoAppendIntent: boolean;
  payloadPreserved: boolean;
  idempotencyPreserved: boolean;
  diagnosticsPreserved: boolean;
  warningsPreserved: boolean;
  noRetryPreserved: boolean;
  appendIntentCount: number;
  appendIntents: unknown[];
  errors: string[];
  warnings: string[];
  safety: ExecutionRecordAuditWriterInMemoryRuntimeProofHarnessSafety;
};

const proofSnapshot = {
  lifecycleId: "lifecycle-action-867-in-memory-proof",
  currentState: "broker_result_captured",
  createdAt: "2026-06-26T19:40:00.000Z",
  updatedAt: "2026-06-26T19:40:00.000Z",
  mode: "semi_automatic",
  action: "buy",
  triggerType: "manual_entry_requested",
  events: [],
} satisfies ExecutionLifecycleSnapshot;

const proofExecutionRecordId = "11111111-1111-4111-8111-111111111111";
const proofEventId = "execution-event-action-867-in-memory-proof-001";
const proofDiagnostics = {
  category: "unknown",
  code: "IN_MEMORY_PROOF",
  status: null,
  message: "in-memory proof diagnostics; no database write attempted",
  details: null,
  hint: null,
  constraint: null,
} as const;
const proofWarning = "in_memory_runtime_proof_warning" as const;

function safety(): ExecutionRecordAuditWriterInMemoryRuntimeProofHarnessSafety {
  return {
    serverOnly: true,
    inMemoryOnly: true,
    databaseWritesAllowed: false,
    supabaseQueryAllowed: false,
    liveInsertAllowed: false,
    realServiceRoleAdapterCallAllowed: false,
    insertUpdateDeleteUpsertSelectAllowed: false,
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

function buildInMemoryHookResult(): InMemoryHookResult {
  return {
    status: "completed",
    ok: true,
    hookVersion: "execution_record_audit_writer_lifecycle_hook_v1",
    productionWritePathResult: {
      status: "completed",
      ok: true,
      writePathVersion: "execution_record_audit_writer_production_write_path_v1",
      writerResult: {
        status: "completed",
        ok: true,
        warnings: [proofWarning],
        dryRun: {
          valid: true,
          errors: [],
          warnings: [proofWarning],
        },
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
      warnings: [proofWarning],
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
    warnings: [proofWarning],
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
  } as InMemoryHookResult;
}

export async function runExecutionRecordAuditWriterInMemoryRuntimeProofHarness(): Promise<ExecutionRecordAuditWriterInMemoryRuntimeProofHarnessResult> {
  const appendIntents: unknown[] = [];
  const appendLifecycleAuditEvent: AppendLifecycleAuditEvent = async (
    input: unknown,
  ) => {
    appendIntents.push(input);

    return buildInMemoryHookResult();
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
        createdAt: "2026-06-26T19:41:00.000Z",
        recordId: proofExecutionRecordId,
        message: "Action 867 in-memory runtime proof transition.",
        metadata: {
          action: "867",
          proofStage: "stage_a_in_memory_runtime_proof",
        },
      },
      requestId: "action-867-in-memory-runtime-proof",
      actor: {
        actorType: "system",
        actorId: null,
      },
      metadata: {
        action: "867",
        proofStage: "stage_a_in_memory_runtime_proof",
      },
    },
    { appendLifecycleAuditEvent },
  );
  const appendIntentCountAfterSuccess = appendIntents.length;

  const failed = await transitionExecutionLifecycleOnServer(
    {
      boundaryApproved: true,
      auditCallerWiringApproved: true,
      caller: "server_only_lifecycle_transition_boundary",
      snapshot: proofSnapshot,
      eventType: "create_intent",
      metadata: {
        action: "867",
        proofStage: "stage_a_in_memory_runtime_proof",
      },
    },
    { appendLifecycleAuditEvent },
  );

  const firstIntent = appendIntents[0] as
    | {
        operation?: unknown;
        targetTable?: unknown;
        executionRecordId?: unknown;
        requestId?: unknown;
        sourceFingerprint?: unknown;
        metadata?: Record<string, unknown>;
      }
    | undefined;
  const successfulTransitionCreatesAppendIntent =
    success.status === "transition_completed" &&
    success.ok === true &&
    appendIntentCountAfterSuccess === 1;
  const failedTransitionCreatesNoAppendIntent =
    failed.status === "transition_failed" &&
    appendIntents.length === appendIntentCountAfterSuccess;
  const payloadPreserved =
    firstIntent?.operation === "insert_only_audit_append" &&
    firstIntent.targetTable === "public.execution_record_audit_events" &&
    firstIntent.executionRecordId === proofExecutionRecordId;
  const idempotencyPreserved =
    firstIntent?.requestId === "action-867-in-memory-runtime-proof" &&
    typeof firstIntent.sourceFingerprint === "string" &&
    firstIntent.sourceFingerprint.includes(proofEventId);
  const productionWritePathResult =
    success.status === "transition_completed" &&
    success.auditCallerResult.status === "completed" &&
    success.auditCallerResult.hookResult.status === "completed"
      ? success.auditCallerResult.hookResult.productionWritePathResult
      : null;
  const diagnosticsPreserved =
    productionWritePathResult?.status === "completed" &&
    productionWritePathResult.diagnostics === proofDiagnostics;
  const warningsPreserved =
    success.status === "transition_completed" &&
    success.warnings.includes(proofWarning);
  const noRetryPreserved =
    success.status === "transition_completed" &&
    success.safety.retryLoopAllowed === false &&
    success.auditCallerResult.safety.retryLoopAllowed === false &&
    firstIntent?.metadata?.noRetry === true;
  const errors = [
    ...(successfulTransitionCreatesAppendIntent
      ? []
      : ["successful_transition_append_intent_missing"]),
    ...(failedTransitionCreatesNoAppendIntent
      ? []
      : ["failed_transition_created_append_intent"]),
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
      EXECUTION_RECORD_AUDIT_WRITER_IN_MEMORY_RUNTIME_PROOF_HARNESS_VERSION,
    proofStage: "stage_a_in_memory_runtime_proof",
    successfulTransitionCreatesAppendIntent,
    failedTransitionCreatesNoAppendIntent,
    payloadPreserved,
    idempotencyPreserved,
    diagnosticsPreserved,
    warningsPreserved,
    noRetryPreserved,
    appendIntentCount: appendIntents.length,
    appendIntents,
    errors,
    warnings: success.status === "transition_completed" ? success.warnings : [],
    safety: safety(),
  };
}
