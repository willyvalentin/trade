import type {
  ExecutionAuditPersistenceResponse,
  PersistExecutionAgentProgressEventRequest,
  PersistExecutionAgentRunRequest,
  PersistExecutionLifecycleEventRequest,
} from "@/lib/execution-audit-persistence-contract";

export type PostExecutionAuditPersistenceRequestOptions = {
  timeoutMs?: number | null;
  endpoint?: string | null;
};

export type PostExecutionAuditPersistenceRequestResult = {
  ok: boolean;
  statusCode: number | null;
  response?: ExecutionAuditPersistenceResponse;
  errors: string[];
  warnings: string[];
  completedAt: string;
};

const lifecycleEndpoint = "/api/execution/audit/lifecycle-events";
const agentRunsEndpoint = "/api/execution/audit/agent-runs";
const agentProgressEventsEndpoint =
  "/api/execution/audit/agent-progress-events";
const defaultTimeoutMs = 10_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function parseAuditPersistenceResponse(
  value: unknown,
): ExecutionAuditPersistenceResponse | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (
    typeof value.version !== "string" ||
    typeof value.receivedAt !== "string" ||
    typeof value.status !== "string" ||
    typeof value.message !== "string"
  ) {
    return undefined;
  }

  return {
    version: value.version as ExecutionAuditPersistenceResponse["version"],
    receivedAt: value.receivedAt,
    status: value.status as ExecutionAuditPersistenceResponse["status"],
    ...(typeof value.id === "string" ? { id: value.id } : {}),
    errors: stringArray(value.errors),
    warnings: stringArray(value.warnings),
    message: value.message,
  };
}

function timeoutMsFromOptions(
  options: PostExecutionAuditPersistenceRequestOptions,
) {
  return typeof options.timeoutMs === "number" &&
    Number.isFinite(options.timeoutMs) &&
    options.timeoutMs > 0
    ? options.timeoutMs
    : defaultTimeoutMs;
}

async function postExecutionAuditPersistenceRequest(
  request:
    | PersistExecutionLifecycleEventRequest
    | PersistExecutionAgentRunRequest
    | PersistExecutionAgentProgressEventRequest,
  endpoint: string,
  options: PostExecutionAuditPersistenceRequestOptions = {},
): Promise<PostExecutionAuditPersistenceRequestResult> {
  const completedAt = () => new Date().toISOString();
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    timeoutMsFromOptions(options),
  );

  try {
    const response = await fetch(options.endpoint || endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    let json: unknown;

    try {
      json = await response.json();
    } catch {
      return {
        ok: false,
        statusCode: response.status,
        errors: ["Execution audit persistence response was not valid JSON."],
        warnings: [],
        completedAt: completedAt(),
      };
    }

    const parsed = parseAuditPersistenceResponse(json);

    if (!parsed) {
      return {
        ok: false,
        statusCode: response.status,
        errors: [
          "Execution audit persistence response did not match the contract shape.",
        ],
        warnings: [],
        completedAt: completedAt(),
      };
    }

    return {
      ok: response.ok && parsed.status === "accepted",
      statusCode: response.status,
      response: parsed,
      errors: stringArray(parsed.errors),
      warnings: stringArray(parsed.warnings),
      completedAt: completedAt(),
    };
  } catch (error) {
    const isAbort = error instanceof DOMException && error.name === "AbortError";

    return {
      ok: false,
      statusCode: null,
      errors: [
        isAbort
          ? "Execution audit persistence request timed out."
          : "Execution audit persistence request failed before a response was received.",
      ],
      warnings: [],
      completedAt: completedAt(),
    };
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export function postPersistExecutionLifecycleEventRequest(
  request: PersistExecutionLifecycleEventRequest,
  options: PostExecutionAuditPersistenceRequestOptions = {},
) {
  return postExecutionAuditPersistenceRequest(
    request,
    lifecycleEndpoint,
    options,
  );
}

export function postPersistExecutionAgentRunRequest(
  request: PersistExecutionAgentRunRequest,
  options: PostExecutionAuditPersistenceRequestOptions = {},
) {
  return postExecutionAuditPersistenceRequest(
    request,
    agentRunsEndpoint,
    options,
  );
}

export function postPersistExecutionAgentProgressEventRequest(
  request: PersistExecutionAgentProgressEventRequest,
  options: PostExecutionAuditPersistenceRequestOptions = {},
) {
  return postExecutionAuditPersistenceRequest(
    request,
    agentProgressEventsEndpoint,
    options,
  );
}
