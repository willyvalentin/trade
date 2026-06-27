import "server-only";

import {
  type ExecutionLifecycleEventType,
  type ExecutionLifecycleSnapshot,
  type TransitionExecutionLifecycleOptions,
} from "@/lib/execution-state-machine";
import {
  transitionExecutionLifecycleAndAppendAuditEvent,
  type ExecutionRecordAuditWriterLifecycleCallerOptions,
  type ExecutionRecordAuditWriterLifecycleCallerResult,
} from "@/lib/server/execution-record-audit-writer-lifecycle-caller";
import type {
  ExecutionRecordAuditWriterActor,
} from "@/lib/server/execution-record-audit-writer-contract";

export type ServerOnlyExecutionLifecycleTransitionBoundaryCaller =
  "server_only_lifecycle_transition_boundary";

export type ServerOnlyExecutionLifecycleTransitionServiceInput = {
  boundaryApproved: boolean;
  auditCallerWiringApproved: boolean;
  caller: ServerOnlyExecutionLifecycleTransitionBoundaryCaller;
  snapshot: ExecutionLifecycleSnapshot;
  eventType: ExecutionLifecycleEventType;
  transitionOptions?: TransitionExecutionLifecycleOptions;
  executionRecordId?: string | null;
  requestId?: string | null;
  actor?: ExecutionRecordAuditWriterActor | null;
  traceId?: string | null;
  sourceFingerprint?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ServerOnlyExecutionLifecycleTransitionServiceResult =
  | {
      status: "blocked";
      ok: false;
      auditCallerResult: null;
      errors: string[];
      safety: ServerOnlyExecutionLifecycleTransitionServiceSafety;
    }
  | {
      status: "transition_failed";
      ok: false;
      auditCallerResult: Extract<
        ExecutionRecordAuditWriterLifecycleCallerResult,
        { status: "blocked" }
      >;
      errors: string[];
      safety: ServerOnlyExecutionLifecycleTransitionServiceSafety;
    }
  | {
      status: "transition_completed";
      ok: boolean;
      auditCallerResult: Extract<
        ExecutionRecordAuditWriterLifecycleCallerResult,
        { status: "completed" }
      >;
      errors: [];
      warnings: string[];
      safety: ServerOnlyExecutionLifecycleTransitionServiceSafety;
    };

export type ServerOnlyExecutionLifecycleTransitionServiceSafety = {
  serverOnly: true;
  auditCallerWiringAllowed: true;
  lifecycleCallerUsed: true;
  auditCallerInvokedOnlyAfterBoundaryValidation: true;
  insertOnlyAuditAppend: true;
  uiBrowserInvocationAllowed: false;
  appShellImportAllowed: false;
  routeFetchCallAllowed: false;
  scannerAutomationInvocationAllowed: false;
  brokerAvanzaBehaviorAllowed: false;
  automaticModeAllowed: false;
  downstreamMutationAllowed: false;
  directSupabaseCallAllowed: false;
  serviceRoleExposed: false;
  retryLoopAllowed: false;
  broaderProductionRolloutAllowed: false;
};

const SAFETY: ServerOnlyExecutionLifecycleTransitionServiceSafety = {
  serverOnly: true,
  auditCallerWiringAllowed: true,
  lifecycleCallerUsed: true,
  auditCallerInvokedOnlyAfterBoundaryValidation: true,
  insertOnlyAuditAppend: true,
  uiBrowserInvocationAllowed: false,
  appShellImportAllowed: false,
  routeFetchCallAllowed: false,
  scannerAutomationInvocationAllowed: false,
  brokerAvanzaBehaviorAllowed: false,
  automaticModeAllowed: false,
  downstreamMutationAllowed: false,
  directSupabaseCallAllowed: false,
  serviceRoleExposed: false,
  retryLoopAllowed: false,
  broaderProductionRolloutAllowed: false,
};

function validateInput(
  input: ServerOnlyExecutionLifecycleTransitionServiceInput,
) {
  const errors: string[] = [];

  if (input.boundaryApproved !== true) {
    errors.push("server_only_lifecycle_transition_boundary_approval_required");
  }

  if (input.auditCallerWiringApproved !== true) {
    errors.push("boundary_to_audit_caller_wiring_approval_required");
  }

  if (input.caller !== "server_only_lifecycle_transition_boundary") {
    errors.push("server_only_lifecycle_transition_boundary_caller_required");
  }

  return errors;
}

export async function transitionExecutionLifecycleOnServer(
  input: ServerOnlyExecutionLifecycleTransitionServiceInput,
  options: ExecutionRecordAuditWriterLifecycleCallerOptions = {},
): Promise<ServerOnlyExecutionLifecycleTransitionServiceResult> {
  const errors = validateInput(input);

  if (errors.length > 0) {
    return {
      status: "blocked",
      ok: false,
      auditCallerResult: null,
      errors,
      safety: SAFETY,
    };
  }

  const auditCallerResult = await transitionExecutionLifecycleAndAppendAuditEvent(
    {
      lifecycleCallerWiringApproved: true,
      caller: "server_only_execution_lifecycle_transition_module",
      operation: "transition_then_insert_only_audit_append",
      targetTable: "public.execution_record_audit_events",
      snapshot: input.snapshot,
      eventType: input.eventType,
      transitionOptions: input.transitionOptions ?? null,
      executionRecordId: input.executionRecordId ?? null,
      requestId: input.requestId ?? null,
      actor: input.actor ?? null,
      traceId: input.traceId ?? null,
      sourceFingerprint: input.sourceFingerprint ?? null,
      metadata: {
        ...((input.metadata ?? {}) as Record<string, unknown>),
        boundary: "server_only_lifecycle_transition_boundary",
        boundaryToAuditCallerWiring: "action_863_approved",
        noRetry: true,
        productionRolloutApproved: true,
        productionRolloutApproval: "action_887_approved_server_only_path",
      },
    },
    options,
  );

  if (auditCallerResult.status === "blocked") {
    return {
      status: "transition_failed",
      ok: false,
      auditCallerResult,
      errors: auditCallerResult.errors,
      safety: SAFETY,
    };
  }

  return {
    status: "transition_completed",
    ok: auditCallerResult.ok,
    auditCallerResult,
    errors: [],
    warnings: auditCallerResult.warnings,
    safety: SAFETY,
  };
}
