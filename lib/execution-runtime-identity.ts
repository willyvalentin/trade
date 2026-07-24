import type { ExecutionLifecycleEventType } from "@/lib/execution-state-machine";

export type ExecutionRuntimeIdentityContext = Readonly<{
  now: string;
  executionId: string;
  lifecycleId: string;
  recordId: string;
  lifecycleEventId: (input: {
    eventType: ExecutionLifecycleEventType;
    eventIndex: number;
  }) => string;
  auditEventId: (input: { auditType: string; eventIndex: number }) => string;
  brokerProgressId: (input: {
    progressType: string;
    eventIndex: number;
  }) => string;
}>;

export type ExplicitExecutionRuntimeIdentityInput = Readonly<{
  now: string;
  executionId: string;
}>;

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Execution runtime identity ${field} is required.`);
  }

  return value.trim();
}

function requiredTimestamp(value: unknown) {
  const timestamp = requiredString(value, "now");

  if (!Number.isFinite(Date.parse(timestamp))) {
    throw new Error("Execution runtime identity now is invalid.");
  }

  return timestamp;
}

function stablePart(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "_");
}

/** Pure identity context for execution-critical helpers and deterministic replay. */
export function createExplicitExecutionRuntimeIdentityContext(
  input: ExplicitExecutionRuntimeIdentityInput,
): ExecutionRuntimeIdentityContext {
  const now = requiredTimestamp(input.now);
  const executionId = requiredString(input.executionId, "executionId");
  const identity = stablePart(executionId);

  return Object.freeze({
    now,
    executionId,
    lifecycleId: `execution_lifecycle_${identity}`,
    recordId: `ture_execution_${identity}`,
    lifecycleEventId: ({ eventType, eventIndex }) =>
      `execution_event_${identity}_${String(eventIndex + 1).padStart(3, "0")}_${eventType}`,
    auditEventId: ({ auditType, eventIndex }) =>
      `execution_audit_${identity}_${String(eventIndex + 1).padStart(3, "0")}_${stablePart(auditType)}`,
    brokerProgressId: ({ progressType, eventIndex }) =>
      `execution_broker_progress_${identity}_${String(eventIndex + 1).padStart(3, "0")}_${stablePart(progressType)}`,
  });
}

/**
 * UI and route boundary only. Core execution helpers must receive the returned
 * context; they never read a clock or generate an identity themselves.
 */
export function createExecutionRuntimeIdentityContextAtBoundary(
  input: Partial<ExplicitExecutionRuntimeIdentityInput> = {},
): ExecutionRuntimeIdentityContext {
  const now = input.now ?? new Date().toISOString();
  const executionId = input.executionId ?? globalThis.crypto?.randomUUID?.();

  if (!executionId) {
    throw new Error("Secure execution runtime identity generation is unavailable.");
  }

  return createExplicitExecutionRuntimeIdentityContext({ now, executionId });
}
