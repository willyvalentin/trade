import type {
  PersistExecutionAgentProgressEventRequest,
  PersistExecutionAgentRunRequest,
  PersistExecutionLifecycleEventRequest,
} from "@/lib/execution-audit-persistence-contract";
import {
  validatePersistExecutionAgentProgressEventRequest,
  validatePersistExecutionAgentRunRequest,
  validatePersistExecutionLifecycleEventRequest,
} from "@/lib/execution-audit-persistence-contract";

export type JsonObject = Record<string, unknown>;

export type ExecutionLifecycleEventInsertPayload = {
  created_at: string;
  user_id: string | null;
  lifecycle_id: string | null;
  intent_id: string | null;
  recommendation_id: string | null;
  position_id: string | null;
  ticker: string | null;
  action: "buy" | "sell" | null;
  mode: "semi_automatic" | "automatic" | null;
  trigger_type: string | null;
  event_type: string;
  state_from: string | null;
  state_to: string | null;
  source: string;
  source_environment: PersistExecutionLifecycleEventRequest["sourceEnvironment"];
  is_mock: boolean;
  is_dev: boolean;
  message: string | null;
  payload: JsonObject;
  metadata: JsonObject;
};

export type ExecutionAgentRunInsertPayload = {
  created_at: string;
  updated_at: string;
  user_id: string | null;
  request_id: string;
  intent_id: string | null;
  recommendation_id: string | null;
  position_id: string | null;
  ticker: string | null;
  action: "buy" | "sell" | null;
  mode: "semi_automatic" | "automatic" | null;
  broker: "avanza";
  bridge_transport: string | null;
  runner_name: string | null;
  runner_version: string | null;
  result_status: string | null;
  broker_result_present: boolean;
  source_environment: PersistExecutionAgentRunRequest["sourceEnvironment"];
  is_mock: boolean;
  is_dev: boolean;
  error: string | null;
  warnings: unknown[];
  request_summary: JsonObject;
  result_summary: JsonObject;
  metadata: JsonObject;
};

export type ExecutionAgentProgressEventInsertPayload = {
  created_at: string;
  user_id: string | null;
  agent_run_id: string | null;
  request_id: string | null;
  intent_id: string | null;
  event_type: string;
  lifecycle_event_type: string | null;
  message: string | null;
  source_environment: PersistExecutionAgentProgressEventRequest["sourceEnvironment"];
  is_mock: boolean;
  is_dev: boolean;
  metadata: JsonObject;
};

export type ExecutionAuditPersistenceMappingResult<TPayload> = {
  ok: boolean;
  payload?: TPayload;
  errors: string[];
  warnings: string[];
};

export type ExecutionAuditPersistenceWriterResult<TPayload> =
  ExecutionAuditPersistenceMappingResult<TPayload> & {
    persisted: false;
    message: string;
  };

export type ExecutionAuditPersistenceWriter = {
  persistLifecycleEvent: (
    request: PersistExecutionLifecycleEventRequest,
  ) => ExecutionAuditPersistenceWriterResult<ExecutionLifecycleEventInsertPayload>;
  persistAgentRun: (
    request: PersistExecutionAgentRunRequest,
  ) => ExecutionAuditPersistenceWriterResult<ExecutionAgentRunInsertPayload>;
  persistAgentProgressEvent: (
    request: PersistExecutionAgentProgressEventRequest,
  ) => ExecutionAuditPersistenceWriterResult<ExecutionAgentProgressEventInsertPayload>;
};

type MappingOptions = {
  userId?: string | null;
  source?: string | null;
};

const sensitiveKeyPattern =
  /(password|credential|cookie|session|secret|token|rawhtml|rawpage|rawbrokerpage|browserstorage)/i;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function validSource(value: string | null | undefined) {
  return value && /^[a-zA-Z0-9_-]+$/.test(value) ? value : "api_stub";
}

function validUserId(value: string | null | undefined) {
  return value && uuidPattern.test(value) ? value : null;
}

function validAction(value: unknown): "buy" | "sell" | null {
  return value === "buy" || value === "sell" ? value : null;
}

function validMode(value: unknown): "semi_automatic" | "automatic" | null {
  return value === "semi_automatic" || value === "automatic" ? value : null;
}

function safeObject(value: unknown): JsonObject {
  const seen = new WeakSet<object>();

  function scrub(item: unknown): unknown {
    if (item === null || item === undefined) {
      return item ?? null;
    }

    if (
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean"
    ) {
      return item;
    }

    if (Array.isArray(item)) {
      return item.slice(0, 100).map((entry) => scrub(entry));
    }

    if (typeof item !== "object") {
      return null;
    }

    if (seen.has(item)) {
      return "[circular]";
    }

    seen.add(item);

    return Object.fromEntries(
      Object.entries(item as Record<string, unknown>).map(([key, entry]) => [
        key,
        sensitiveKeyPattern.test(key) ? "[redacted]" : scrub(entry),
      ]),
    );
  }

  const scrubbed = scrub(value);

  return scrubbed && typeof scrubbed === "object" && !Array.isArray(scrubbed)
    ? (scrubbed as JsonObject)
    : {};
}

function metadataString(metadata: JsonObject, key: string): string | null {
  return optionalString(metadata[key]);
}

function metadataAction(metadata: JsonObject, key: string): "buy" | "sell" | null {
  return validAction(metadata[key]);
}

function metadataMode(
  metadata: JsonObject,
  key: string,
): "semi_automatic" | "automatic" | null {
  return validMode(metadata[key]);
}

function mapInvalid<TPayload>(
  errors: string[],
  warnings: string[],
): ExecutionAuditPersistenceMappingResult<TPayload> {
  return {
    ok: false,
    errors,
    warnings,
  };
}

export function mapLifecycleEventRequestToInsertPayload(
  request: PersistExecutionLifecycleEventRequest,
  options: MappingOptions = {},
): ExecutionAuditPersistenceMappingResult<ExecutionLifecycleEventInsertPayload> {
  const validation = validatePersistExecutionLifecycleEventRequest(request);

  if (!validation.ok) {
    return mapInvalid(validation.errors, validation.warnings);
  }

  const requestMetadata = safeObject(request.metadata);
  const eventMetadata = safeObject(request.event.metadata);
  const combinedMetadata = safeObject({
    ...requestMetadata,
    eventId: request.event.eventId,
    eventMetadata,
    submittedAt: request.submittedAt,
  });

  return {
    ok: true,
    payload: {
      created_at: request.event.createdAt,
      user_id: validUserId(options.userId ?? null),
      lifecycle_id: metadataString(combinedMetadata, "lifecycleId"),
      intent_id:
        optionalString(request.event.intentId) ??
        metadataString(combinedMetadata, "intentId"),
      recommendation_id: metadataString(combinedMetadata, "recommendationId"),
      position_id: metadataString(combinedMetadata, "positionId"),
      ticker: metadataString(combinedMetadata, "ticker"),
      action: metadataAction(combinedMetadata, "action"),
      mode: metadataMode(combinedMetadata, "mode"),
      trigger_type: metadataString(combinedMetadata, "triggerType"),
      event_type: request.event.type,
      state_from: request.event.fromState,
      state_to: request.event.toState,
      source: validSource(options.source),
      source_environment: request.sourceEnvironment,
      is_mock: request.isMock,
      is_dev: request.isDev,
      message: optionalString(request.event.message),
      payload: safeObject({
        event: request.event,
        submittedAt: request.submittedAt,
      }),
      metadata: combinedMetadata,
    },
    errors: [],
    warnings: validation.warnings,
  };
}

export function mapAgentRunRequestToInsertPayload(
  request: PersistExecutionAgentRunRequest,
  options: MappingOptions = {},
): ExecutionAuditPersistenceMappingResult<ExecutionAgentRunInsertPayload> {
  const validation = validatePersistExecutionAgentRunRequest(request);

  if (!validation.ok) {
    return mapInvalid(validation.errors, validation.warnings);
  }

  const runMetadata = safeObject(request.run.metadata);
  const requestMetadata = safeObject(request.metadata);
  const combinedMetadata = safeObject({
    ...requestMetadata,
    runId: request.run.runId,
    runnerId: request.run.runnerId ?? null,
    progressEventCount: request.run.progressEventCount,
    progressEventTypes: request.run.progressEventTypes,
    runMetadata,
    submittedAt: request.submittedAt,
  });

  return {
    ok: true,
    payload: {
      created_at: request.run.createdAt,
      updated_at: request.run.updatedAt,
      user_id: validUserId(options.userId ?? null),
      request_id: request.run.requestId,
      intent_id: optionalString(request.run.intentId),
      recommendation_id: optionalString(request.run.recommendationId),
      position_id: optionalString(request.run.positionId),
      ticker: optionalString(request.run.ticker),
      action: validAction(request.run.action),
      mode: validMode(request.run.mode),
      broker: request.run.broker,
      bridge_transport: metadataString(combinedMetadata, "bridgeTransport"),
      runner_name: optionalString(request.run.runnerName),
      runner_version: optionalString(request.run.runnerVersion),
      result_status: optionalString(request.run.resultStatus),
      broker_result_present: request.run.brokerResultPresent,
      source_environment: request.sourceEnvironment,
      is_mock: request.isMock,
      is_dev: request.isDev,
      error: optionalString(request.run.resultError),
      warnings: [],
      request_summary: safeObject(request.run.request ?? {}),
      result_summary: safeObject(request.run.result ?? {}),
      metadata: combinedMetadata,
    },
    errors: [],
    warnings: validation.warnings,
  };
}

export function mapAgentProgressEventRequestToInsertPayload(
  request: PersistExecutionAgentProgressEventRequest,
  options: MappingOptions = {},
): ExecutionAuditPersistenceMappingResult<ExecutionAgentProgressEventInsertPayload> {
  const validation = validatePersistExecutionAgentProgressEventRequest(request);

  if (!validation.ok) {
    return mapInvalid(validation.errors, validation.warnings);
  }

  const progressMetadata = safeObject(request.progressEvent.metadata);
  const requestMetadata = safeObject(request.metadata);
  const externalAgentRunId = optionalString(request.agentRunId);
  const agentRunId =
    externalAgentRunId && uuidPattern.test(externalAgentRunId)
      ? externalAgentRunId
      : null;
  const warnings = [...validation.warnings];

  if (externalAgentRunId && !agentRunId) {
    warnings.push(
      "Agent run id is not a database UUID; storing it in metadata only.",
    );
  }

  return {
    ok: true,
    payload: {
      created_at: request.progressEvent.createdAt,
      user_id: validUserId(options.userId ?? null),
      agent_run_id: agentRunId,
      request_id: optionalString(request.progressEvent.requestId),
      intent_id: metadataString(requestMetadata, "intentId"),
      event_type: request.progressEvent.type,
      lifecycle_event_type:
        optionalString(request.progressEvent.lifecycleEventType) ?? null,
      message: optionalString(request.progressEvent.message),
      source_environment: request.sourceEnvironment,
      is_mock: request.isMock,
      is_dev: request.isDev,
      metadata: safeObject({
        ...requestMetadata,
        eventId: request.progressEvent.eventId,
        externalAgentRunId,
        progressMetadata,
        submittedAt: request.submittedAt,
      }),
    },
    errors: [],
    warnings,
  };
}

function noopWriterResult<TPayload>(
  mapping: ExecutionAuditPersistenceMappingResult<TPayload>,
): ExecutionAuditPersistenceWriterResult<TPayload> {
  return {
    ...mapping,
    persisted: false,
    message:
      "Execution audit persistence writer draft did not write to Supabase.",
    warnings: [
      ...mapping.warnings,
      "No-op writer draft only. Routes are not wired to persist audit data.",
    ],
  };
}

export function createNoopExecutionAuditPersistenceWriter(): ExecutionAuditPersistenceWriter {
  return {
    persistLifecycleEvent: (request) =>
      noopWriterResult(mapLifecycleEventRequestToInsertPayload(request)),
    persistAgentRun: (request) =>
      noopWriterResult(mapAgentRunRequestToInsertPayload(request)),
    persistAgentProgressEvent: (request) =>
      noopWriterResult(mapAgentProgressEventRequestToInsertPayload(request)),
  };
}
