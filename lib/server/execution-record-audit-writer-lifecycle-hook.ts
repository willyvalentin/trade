import "server-only";

import type {
  ExecutionLifecycleEvent,
  ExecutionLifecycleTransitionResult,
} from "@/lib/execution-state-machine";
import {
  appendExecutionRecordAuditEventFromProductionWritePath,
  type ExecutionRecordAuditWriterProductionWritePathInput,
  type ExecutionRecordAuditWriterProductionWritePathResult,
} from "@/lib/server/execution-record-audit-writer-production-write-path";
import type {
  ExecutionRecordAuditWriterActor,
  ExecutionRecordAuditWriterInput,
} from "@/lib/server/execution-record-audit-writer-contract";
import type { Json } from "@/lib/supabase-database.types";

export const EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_HOOK_VERSION =
  "execution_record_audit_writer_lifecycle_hook_v1" as const;

export type ExecutionRecordAuditWriterLifecycleHookIntegrationPoint =
  "server_only_execution_lifecycle_transition_handler";

export type ExecutionRecordAuditWriterLifecycleHookInput = {
  runtimeIntegrationApproved: true;
  integrationPoint: ExecutionRecordAuditWriterLifecycleHookIntegrationPoint;
  operation: "insert_only_audit_append";
  targetTable: "public.execution_record_audit_events";
  transition: ExecutionLifecycleTransitionResult;
  executionRecordId?: string | null;
  requestId?: string | null;
  actor?: ExecutionRecordAuditWriterActor | null;
  traceId?: string | null;
  sourceFingerprint?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ExecutionRecordAuditWriterLifecycleHookSafety = {
  serverOnly: true;
  lifecycleTransitionHandler: true;
  productionWritePathUsed: true;
  routeBoundaryBypassed: false;
  insertOnlyAuditAppend: true;
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
};

export type ExecutionRecordAuditWriterLifecycleHookResult =
  | {
      status: "completed";
      ok: boolean;
      hookVersion: typeof EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_HOOK_VERSION;
      productionWritePathResult: ExecutionRecordAuditWriterProductionWritePathResult;
      errors: [];
      warnings: string[];
      safety: ExecutionRecordAuditWriterLifecycleHookSafety;
    }
  | {
      status: "blocked";
      ok: false;
      hookVersion: typeof EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_HOOK_VERSION;
      productionWritePathResult: null;
      errors: string[];
      warnings: string[];
      safety: ExecutionRecordAuditWriterLifecycleHookSafety;
    };

export type ExecutionRecordAuditWriterLifecycleHookOptions = {
  appendFromProductionWritePath?: (
    input: unknown,
  ) => Promise<ExecutionRecordAuditWriterProductionWritePathResult>;
};

const SOURCE_SYSTEM = "trade_app" as const;
const EVENT_SOURCE = "execution_lifecycle_transition_handler" as const;
const UUID_LIKE_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function safety(): ExecutionRecordAuditWriterLifecycleHookSafety {
  return {
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
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function optionalTrimmed(value: string | null | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeAuditWriterActor(
  actor: ExecutionRecordAuditWriterActor | null | undefined,
): ExecutionRecordAuditWriterActor {
  const selected = actor ?? {
    actorType: "system",
    actorId: null,
  };
  const actorId = optionalTrimmed(selected.actorId);

  return {
    actorType: selected.actorType,
    actorId: actorId && UUID_LIKE_PATTERN.test(actorId) ? actorId : null,
  };
}

function sanitizeIdPart(value: string | null | undefined) {
  return (
    optionalTrimmed(value)?.replace(/[^a-zA-Z0-9:_./-]+/g, "_") || "unknown"
  );
}

function hashString(value: string) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36);
}

function boundedKey(prefix: string, parts: string[]) {
  const raw = [prefix, ...parts.map(sanitizeIdPart)].join(":");
  const suffix = hashString(raw);
  const maxPrefixLength = 160 - suffix.length - 1;

  return `${raw.slice(0, maxPrefixLength)}:${suffix}`;
}

function validateHookInput(input: unknown): string[] {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return ["lifecycle_hook_input_invalid"];
  }

  if (input.runtimeIntegrationApproved !== true) {
    errors.push("runtime_integration_approval_required");
  }

  if (
    input.integrationPoint !==
    "server_only_execution_lifecycle_transition_handler"
  ) {
    errors.push("server_only_lifecycle_integration_point_required");
  }

  if (input.operation !== "insert_only_audit_append") {
    errors.push("insert_only_audit_append_required");
  }

  if (input.targetTable !== "public.execution_record_audit_events") {
    errors.push("audit_events_table_target_required");
  }

  if (!isRecord(input.transition)) {
    errors.push("transition_result_required");
    return errors;
  }

  if (input.transition.ok !== true) {
    errors.push("successful_transition_required");
  }

  return errors;
}

function executionRecordIdFromInput(
  input: ExecutionRecordAuditWriterLifecycleHookInput,
  event: ExecutionLifecycleEvent,
) {
  return optionalTrimmed(input.executionRecordId) ?? optionalTrimmed(event.recordId);
}

function buildWriterInput(
  input: ExecutionRecordAuditWriterLifecycleHookInput,
  event: ExecutionLifecycleEvent,
): ExecutionRecordAuditWriterInput | null {
  const executionRecordId = executionRecordIdFromInput(input, event);

  if (!executionRecordId) {
    return null;
  }

  const lifecycleId = input.transition.snapshot.lifecycleId;
  const eventType = `execution_lifecycle_${event.type}`;
  const idempotencyKey = boundedKey("execution-lifecycle", [
    lifecycleId,
    event.eventId,
    event.type,
  ]);
  const duplicatePreventionKey = boundedKey("execution-lifecycle-duplicate", [
    executionRecordId,
    event.type,
    event.fromState,
    event.toState,
  ]);

  return {
    executionRecordId,
    eventType,
    source: {
      eventSource: EVENT_SOURCE,
      sourceSystem: SOURCE_SYSTEM,
      sourceFingerprint:
        optionalTrimmed(input.sourceFingerprint) ??
        boundedKey("execution-lifecycle-source", [
          lifecycleId,
          event.eventId,
          event.type,
        ]),
      traceId: optionalTrimmed(input.traceId) ?? lifecycleId,
      writerVersion: EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_HOOK_VERSION,
    },
    requestId: optionalTrimmed(input.requestId) ?? event.eventId,
    idempotencyKey,
    duplicatePreventionKey,
    actor: normalizeAuditWriterActor(input.actor),
    authorityMode: "server_append_only",
    payload: {
      lifecycleId,
      eventId: event.eventId,
      eventType: event.type,
      fromState: event.fromState,
      toState: event.toState,
      currentState: input.transition.snapshot.currentState,
      mode: input.transition.snapshot.mode ?? null,
      action: input.transition.snapshot.action ?? null,
      triggerType: input.transition.snapshot.triggerType ?? null,
      message: event.message ?? null,
    },
    evidence: {
      transitionCreatedAt: event.createdAt,
      transitionMetadata: (event.metadata ?? {}) as Json,
      source: EVENT_SOURCE,
    },
    provenance: {
      generatedBy: EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_HOOK_VERSION,
      integrationPoint: input.integrationPoint,
      targetTable: input.targetTable,
      operation: input.operation,
      productionWritePathUsed: true,
    },
    occurredAt: event.createdAt,
    schemaVersion: "1",
    metadata: {
      ...((input.metadata ?? {}) as Record<string, Json>),
      lifecycleHookVersion: EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_HOOK_VERSION,
      noDownstreamMutation: true,
      productionRolloutApproved: true,
      productionRolloutApproval: "action_887_approved_server_only_path",
      browserClientInvocationAllowed: false,
      marketLoopInvocationAllowed: false,
      brokerAvanzaAllowed: false,
      automaticModeAllowed: false,
    },
  };
}

function buildProductionWritePathInput(
  writerInput: ExecutionRecordAuditWriterInput,
): ExecutionRecordAuditWriterProductionWritePathInput {
  return {
    productionWritePathApproved: true,
    liveSmokeInsertApproved: false,
    payloadSource: "validated_server_side_audit_payload",
    operation: "insert_only_audit_append",
    targetTable: "public.execution_record_audit_events",
    input: writerInput,
  };
}

export async function appendExecutionLifecycleTransitionAuditEvent(
  input: unknown,
  options: ExecutionRecordAuditWriterLifecycleHookOptions = {},
): Promise<ExecutionRecordAuditWriterLifecycleHookResult> {
  const errors = validateHookInput(input);

  if (errors.length > 0) {
    return {
      status: "blocked",
      ok: false,
      hookVersion: EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_HOOK_VERSION,
      productionWritePathResult: null,
      errors,
      warnings: [],
      safety: safety(),
    };
  }

  const approvedInput = input as ExecutionRecordAuditWriterLifecycleHookInput;

  if (!approvedInput.transition.ok) {
    return {
      status: "blocked",
      ok: false,
      hookVersion: EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_HOOK_VERSION,
      productionWritePathResult: null,
      errors: ["successful_transition_required"],
      warnings: [],
      safety: safety(),
    };
  }

  const writerInput = buildWriterInput(
    approvedInput,
    approvedInput.transition.event,
  );

  if (!writerInput) {
    return {
      status: "blocked",
      ok: false,
      hookVersion: EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_HOOK_VERSION,
      productionWritePathResult: null,
      errors: ["execution_record_id_required"],
      warnings: [],
      safety: safety(),
    };
  }

  const appendFromProductionWritePath =
    options.appendFromProductionWritePath ??
    appendExecutionRecordAuditEventFromProductionWritePath;
  const productionWritePathResult = await appendFromProductionWritePath(
    buildProductionWritePathInput(writerInput),
  );

  return {
    status: "completed",
    ok: productionWritePathResult.ok,
    hookVersion: EXECUTION_RECORD_AUDIT_WRITER_LIFECYCLE_HOOK_VERSION,
    productionWritePathResult,
    errors: [],
    warnings: productionWritePathResult.warnings,
    safety: safety(),
  };
}
