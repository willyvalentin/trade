import type { AvanzaAgentProgressEvent } from "@/lib/avanza-agent-adapter";
import type { StoredAvanzaAgentRun } from "@/lib/avanza-agent-run-store";
import type { ExecutionLifecycleEvent } from "@/lib/execution-state-machine";

export const EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION =
  "execution_audit_persistence_v1" as const;

export type ExecutionAuditPersistenceContractVersion =
  typeof EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION;

export type ExecutionAuditPersistenceSourceEnvironment =
  | "local_dev"
  | "staging"
  | "production";

export type PersistExecutionLifecycleEventRequest = {
  version: ExecutionAuditPersistenceContractVersion;
  submittedAt: string;
  sourceEnvironment: ExecutionAuditPersistenceSourceEnvironment;
  isMock: boolean;
  isDev: boolean;
  event: ExecutionLifecycleEvent;
  metadata?: Record<string, unknown>;
};

export type PersistExecutionAgentRunRequest = {
  version: ExecutionAuditPersistenceContractVersion;
  submittedAt: string;
  sourceEnvironment: ExecutionAuditPersistenceSourceEnvironment;
  isMock: boolean;
  isDev: boolean;
  run: StoredAvanzaAgentRun;
  metadata?: Record<string, unknown>;
};

export type PersistExecutionAgentProgressEventRequest = {
  version: ExecutionAuditPersistenceContractVersion;
  submittedAt: string;
  sourceEnvironment: ExecutionAuditPersistenceSourceEnvironment;
  isMock: boolean;
  isDev: boolean;
  progressEvent: AvanzaAgentProgressEvent;
  agentRunId?: string;
  metadata?: Record<string, unknown>;
};

export type ExecutionAuditPersistenceResponseStatus =
  | "accepted"
  | "invalid"
  | "disabled"
  | "failed";

export type ExecutionAuditPersistenceResponse = {
  version: ExecutionAuditPersistenceContractVersion;
  receivedAt: string;
  status: ExecutionAuditPersistenceResponseStatus;
  id?: string;
  errors: string[];
  warnings: string[];
  message: string;
  metadata?: Record<string, unknown>;
};

export type ExecutionAuditPersistenceValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  normalizedSourceEnvironment: ExecutionAuditPersistenceSourceEnvironment | null;
};

export type CreateExecutionAuditPersistenceResponseInput = {
  id?: string | null;
  receivedAt?: string | null;
  errors?: string[] | null;
  warnings?: string[] | null;
  message?: string | null;
  status?: ExecutionAuditPersistenceResponseStatus | null;
  metadata?: Record<string, unknown> | null;
};

const sourceEnvironments: ExecutionAuditPersistenceSourceEnvironment[] = [
  "local_dev",
  "staging",
  "production",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeTimestamp(value: string | null | undefined) {
  return value && Number.isFinite(Date.parse(value))
    ? value
    : new Date().toISOString();
}

function normalizeSourceEnvironment(
  value: unknown,
): ExecutionAuditPersistenceSourceEnvironment | null {
  return sourceEnvironments.includes(
    value as ExecutionAuditPersistenceSourceEnvironment,
  )
    ? (value as ExecutionAuditPersistenceSourceEnvironment)
    : null;
}

function validateBaseRequest(
  request:
    | Partial<PersistExecutionLifecycleEventRequest>
    | Partial<PersistExecutionAgentRunRequest>
    | Partial<PersistExecutionAgentProgressEventRequest>
    | null
    | undefined,
) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const normalizedSourceEnvironment = normalizeSourceEnvironment(
    request?.sourceEnvironment,
  );

  if (!request) {
    return {
      errors: ["Execution audit persistence request is missing."],
      warnings,
      normalizedSourceEnvironment,
    };
  }

  if (request.version !== EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION) {
    errors.push("Execution audit persistence request version is invalid.");
  }

  if (
    !request.submittedAt ||
    !Number.isFinite(Date.parse(request.submittedAt))
  ) {
    errors.push(
      "Execution audit persistence submittedAt is missing or invalid.",
    );
  }

  if (!normalizedSourceEnvironment) {
    errors.push("Execution audit persistence sourceEnvironment is invalid.");
  }

  if (typeof request.isMock !== "boolean") {
    errors.push("Execution audit persistence isMock must be explicit.");
  }

  if (typeof request.isDev !== "boolean") {
    errors.push("Execution audit persistence isDev must be explicit.");
  }

  if (
    normalizedSourceEnvironment === "production" &&
    (request.isMock || request.isDev)
  ) {
    errors.push("Production execution audit persistence cannot be mock/dev data.");
  }

  if (request.metadata !== undefined && !isRecord(request.metadata)) {
    errors.push("Execution audit persistence metadata must be an object.");
  }

  return { errors, warnings, normalizedSourceEnvironment };
}

function validationResult(
  errors: string[],
  warnings: string[],
  normalizedSourceEnvironment: ExecutionAuditPersistenceSourceEnvironment | null,
): ExecutionAuditPersistenceValidationResult {
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    normalizedSourceEnvironment,
  };
}

export function validatePersistExecutionLifecycleEventRequest(
  request: Partial<PersistExecutionLifecycleEventRequest> | null | undefined,
): ExecutionAuditPersistenceValidationResult {
  const base = validateBaseRequest(request);
  const errors = [...base.errors];
  const warnings = [...base.warnings];
  const event = request?.event;

  if (!event || !isRecord(event)) {
    errors.push("Execution lifecycle event is missing.");
  } else {
    if (!optionalString(event.eventId)) {
      errors.push("Execution lifecycle event id is missing.");
    }

    if (!optionalString(event.type)) {
      errors.push("Execution lifecycle event type is missing.");
    }

    if (!optionalString(event.createdAt)) {
      errors.push("Execution lifecycle event createdAt is missing.");
    } else if (!Number.isFinite(Date.parse(event.createdAt))) {
      errors.push("Execution lifecycle event createdAt is invalid.");
    }

    if (!optionalString(event.fromState)) {
      errors.push("Execution lifecycle event fromState is missing.");
    }

    if (!optionalString(event.toState)) {
      errors.push("Execution lifecycle event toState is missing.");
    }
  }

  return validationResult(
    errors,
    warnings,
    base.normalizedSourceEnvironment,
  );
}

export function validatePersistExecutionAgentRunRequest(
  request: Partial<PersistExecutionAgentRunRequest> | null | undefined,
): ExecutionAuditPersistenceValidationResult {
  const base = validateBaseRequest(request);
  const errors = [...base.errors];
  const warnings = [...base.warnings];
  const run = request?.run;

  if (!run || !isRecord(run)) {
    errors.push("Execution agent run is missing.");
  } else {
    if (!optionalString(run.runId)) {
      warnings.push(
        "Execution agent run id is missing; future persistence may generate a database id only.",
      );
    }

    if (!optionalString(run.requestId)) {
      errors.push("Execution agent run requestId is missing.");
    }

    if (!optionalString(run.createdAt)) {
      errors.push("Execution agent run createdAt is missing.");
    } else if (!Number.isFinite(Date.parse(run.createdAt))) {
      errors.push("Execution agent run createdAt is invalid.");
    }

    if (!optionalString(run.resultStatus)) {
      errors.push("Execution agent run resultStatus is missing.");
    }
  }

  return validationResult(
    errors,
    warnings,
    base.normalizedSourceEnvironment,
  );
}

export function validatePersistExecutionAgentProgressEventRequest(
  request:
    | Partial<PersistExecutionAgentProgressEventRequest>
    | null
    | undefined,
): ExecutionAuditPersistenceValidationResult {
  const base = validateBaseRequest(request);
  const errors = [...base.errors];
  const warnings = [...base.warnings];
  const progressEvent = request?.progressEvent;

  if (!progressEvent || !isRecord(progressEvent)) {
    errors.push("Execution agent progress event is missing.");
  } else {
    if (!optionalString(progressEvent.eventId)) {
      errors.push("Execution agent progress event id is missing.");
    }

    if (!optionalString(progressEvent.requestId)) {
      errors.push("Execution agent progress event requestId is missing.");
    }

    if (!optionalString(progressEvent.createdAt)) {
      errors.push("Execution agent progress event createdAt is missing.");
    } else if (!Number.isFinite(Date.parse(progressEvent.createdAt))) {
      errors.push("Execution agent progress event createdAt is invalid.");
    }

    if (!optionalString(progressEvent.type)) {
      errors.push("Execution agent progress event type is missing.");
    }
  }

  return validationResult(
    errors,
    warnings,
    base.normalizedSourceEnvironment,
  );
}

export function createAcceptedExecutionAuditPersistenceResponse(
  input: CreateExecutionAuditPersistenceResponseInput = {},
): ExecutionAuditPersistenceResponse {
  const id = optionalString(input.id);

  return {
    version: EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
    receivedAt: normalizeTimestamp(input.receivedAt),
    status: input.status ?? "accepted",
    ...(id ? { id } : {}),
    errors: input.errors?.filter(Boolean) ?? [],
    warnings: input.warnings?.filter(Boolean) ?? [],
    message:
      input.message ??
      "Execution audit persistence request accepted by dev stub only. No Supabase write occurred.",
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };
}

export function createRejectedExecutionAuditPersistenceResponse(
  input: CreateExecutionAuditPersistenceResponseInput = {},
): ExecutionAuditPersistenceResponse {
  const id = optionalString(input.id);

  return {
    version: EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
    receivedAt: normalizeTimestamp(input.receivedAt),
    status: input.status ?? (input.errors?.length ? "invalid" : "failed"),
    ...(id ? { id } : {}),
    errors: input.errors?.filter(Boolean) ?? [],
    warnings: input.warnings?.filter(Boolean) ?? [],
    message:
      input.message ??
      "Execution audit persistence request was rejected by the dev stub.",
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };
}
