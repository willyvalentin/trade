import "server-only";

import {
  transitionExecutionLifecycle,
  type ExecutionLifecycleEventType,
  type ExecutionLifecycleSnapshot,
  type ExecutionLifecycleTransitionResult,
  type TransitionExecutionLifecycleOptions,
} from "@/lib/execution-state-machine";
import {
  appendExecutionLifecycleTransitionAuditEvent,
  type ExecutionRecordAuditWriterLifecycleHookInput,
  type ExecutionRecordAuditWriterLifecycleHookResult,
} from "@/lib/server/execution-record-audit-writer-lifecycle-hook";
import type {
  ExecutionRecordAuditWriterActor,
} from "@/lib/server/execution-record-audit-writer-contract";

export const EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_CALLER_VERSION =
  "execution_record_audit_writer_lifecycle_caller_v1" as const;

export type ExecutionRecordAuditWriterLifecycleCallerId =
  "server_only_execution_lifecycle_transition_module";

export type ExecutionRecordAuditWriterLifecycleCallerInput = {
  lifecycleCallerWiringApproved: true;
  caller: ExecutionRecordAuditWriterLifecycleCallerId;
  operation: "transition_then_insert_only_audit_append";
  targetTable: "public.execution_record_audit_events";
  snapshot: ExecutionLifecycleSnapshot;
  eventType: ExecutionLifecycleEventType;
  transitionOptions?: TransitionExecutionLifecycleOptions | null;
  executionRecordId?: string | null;
  requestId?: string | null;
  actor?: ExecutionRecordAuditWriterActor | null;
  traceId?: string | null;
  sourceFingerprint?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ExecutionRecordAuditWriterLifecycleCallerSafety = {
  serverOnly: true;
  exactlyOneLifecycleCaller: true;
  lifecycleHookUsed: true;
  hookCalledOnlyAfterSuccessfulTransition: true;
  insertOnlyAuditAppend: true;
  routeBoundaryBypassed: false;
  browserClientInvocationAllowed: false;
  appShellImportAllowed: false;
  marketLoopInvocationAllowed: false;
  scannerAutomationInvocationAllowed: false;
  brokerAvanzaAllowed: false;
  automaticModeAllowed: false;
  tradeStatsPnlMutationAllowed: false;
  updateDeleteUpsertSelectAllowed: false;
  downstreamMutationAllowed: false;
  serviceRoleExposed: false;
  retryLoopAllowed: false;
};

export type ExecutionRecordAuditWriterLifecycleCallerResult =
  | {
      status: "completed";
      ok: boolean;
      callerVersion:
        typeof EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_CALLER_VERSION;
      transition: Extract<ExecutionLifecycleTransitionResult, { ok: true }>;
      hookResult: ExecutionRecordAuditWriterLifecycleHookResult;
      errors: [];
      warnings: string[];
      safety: ExecutionRecordAuditWriterLifecycleCallerSafety;
    }
  | {
      status: "blocked";
      ok: false;
      callerVersion:
        typeof EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_CALLER_VERSION;
      transition: ExecutionLifecycleTransitionResult | null;
      hookResult: null;
      errors: string[];
      warnings: string[];
      safety: ExecutionRecordAuditWriterLifecycleCallerSafety;
    };

export type ExecutionRecordAuditWriterLifecycleCallerOptions = {
  appendLifecycleAuditEvent?: (
    input: unknown,
  ) => Promise<ExecutionRecordAuditWriterLifecycleHookResult>;
};

function safety(): ExecutionRecordAuditWriterLifecycleCallerSafety {
  return {
    serverOnly: true,
    exactlyOneLifecycleCaller: true,
    lifecycleHookUsed: true,
    hookCalledOnlyAfterSuccessfulTransition: true,
    insertOnlyAuditAppend: true,
    routeBoundaryBypassed: false,
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
    retryLoopAllowed: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function optionalTrimmed(value: string | null | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function validateCallerInput(input: unknown): string[] {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return ["lifecycle_caller_input_invalid"];
  }

  if (input.lifecycleCallerWiringApproved !== true) {
    errors.push("lifecycle_caller_wiring_approval_required");
  }

  if (input.caller !== "server_only_execution_lifecycle_transition_module") {
    errors.push("server_only_lifecycle_caller_required");
  }

  if (input.operation !== "transition_then_insert_only_audit_append") {
    errors.push("transition_then_insert_only_audit_append_required");
  }

  if (input.targetTable !== "public.execution_record_audit_events") {
    errors.push("audit_events_table_target_required");
  }

  if (!isRecord(input.snapshot)) {
    errors.push("lifecycle_snapshot_required");
  }

  if (typeof input.eventType !== "string" || !input.eventType.trim()) {
    errors.push("lifecycle_event_type_required");
  }

  return errors;
}

function buildHookInput(
  input: ExecutionRecordAuditWriterLifecycleCallerInput,
  transition: Extract<ExecutionLifecycleTransitionResult, { ok: true }>,
): ExecutionRecordAuditWriterLifecycleHookInput {
  return {
    runtimeIntegrationApproved: true,
    integrationPoint: "server_only_execution_lifecycle_transition_handler",
    operation: "insert_only_audit_append",
    targetTable: "public.execution_record_audit_events",
    transition,
    executionRecordId:
      optionalTrimmed(input.executionRecordId) ??
      optionalTrimmed(transition.event.recordId),
    requestId: optionalTrimmed(input.requestId) ?? transition.event.eventId,
    actor: input.actor ?? {
      actorType: "system",
      actorId: null,
    },
    traceId: optionalTrimmed(input.traceId) ?? transition.snapshot.lifecycleId,
    sourceFingerprint:
      optionalTrimmed(input.sourceFingerprint) ??
      `${EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_CALLER_VERSION}:${transition.event.eventId}`,
    metadata: {
      ...((input.metadata ?? {}) as Record<string, unknown>),
      lifecycleCallerVersion:
        EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_CALLER_VERSION,
      lifecycleCaller: input.caller,
      noRetry: true,
      noDownstreamMutation: true,
      productionRolloutApproved: true,
      productionRolloutApproval: "action_887_approved_server_only_path",
    },
  };
}

export async function transitionExecutionLifecycleAndAppendAuditEvent(
  input: unknown,
  options: ExecutionRecordAuditWriterLifecycleCallerOptions = {},
): Promise<ExecutionRecordAuditWriterLifecycleCallerResult> {
  const errors = validateCallerInput(input);

  if (errors.length > 0) {
    return {
      status: "blocked",
      ok: false,
      callerVersion: EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_CALLER_VERSION,
      transition: null,
      hookResult: null,
      errors,
      warnings: [],
      safety: safety(),
    };
  }

  const approvedInput = input as ExecutionRecordAuditWriterLifecycleCallerInput;
  const transition = transitionExecutionLifecycle(
    approvedInput.snapshot,
    approvedInput.eventType,
    approvedInput.transitionOptions ?? {},
  );

  if (!transition.ok) {
    return {
      status: "blocked",
      ok: false,
      callerVersion: EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_CALLER_VERSION,
      transition,
      hookResult: null,
      errors: [transition.error],
      warnings: [],
      safety: safety(),
    };
  }

  const appendLifecycleAuditEvent =
    options.appendLifecycleAuditEvent ??
    appendExecutionLifecycleTransitionAuditEvent;
  const hookResult = await appendLifecycleAuditEvent(
    buildHookInput(approvedInput, transition),
  );

  return {
    status: "completed",
    ok: hookResult.ok,
    callerVersion: EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_CALLER_VERSION,
    transition,
    hookResult,
    errors: [],
    warnings: hookResult.warnings,
    safety: safety(),
  };
}
