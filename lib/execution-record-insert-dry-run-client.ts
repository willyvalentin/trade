import {
  EXECUTION_RECORD_INSERT_ROUTE_CONTRACT_VERSION,
  type ExecutionRecordInsertRouteDryRunMetadata,
  type ExecutionRecordInsertRouteErrorCode,
  type ExecutionRecordInsertRoutePath,
  type ExecutionRecordInsertRouteRequest,
  type ExecutionRecordInsertRouteResponse,
  type ExecutionRecordInsertRouteSafetyMetadata,
  type ExecutionRecordInsertRouteValidationError,
} from "@/lib/execution-record-insert-route-contract";
import type {
  ExecutionRecordPersistenceAuditMetadata,
  ExecutionRecordPersistenceRejectionReason,
  ExecutionRecordPersistenceWarning,
} from "@/lib/execution-record-persistence-contract";

export type RequestExecutionRecordInsertDryRunOptions = {
  endpoint?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch;
};

const defaultEndpoint: ExecutionRecordInsertRoutePath =
  "/api/execution/records/insert";
const defaultTimeoutMs = 10_000;

const SAFETY_METADATA: ExecutionRecordInsertRouteSafetyMetadata = {
  serverOnly: true,
  directClientSupabaseWriteAllowed: false,
  noTradeMutation: true,
  noAuditAppendInInitialRoute: true,
  noBrokerResultCreation: true,
  noAvanzaAutomation: true,
  migrationMustBeAppliedBeforeRealInsert: true,
};

function nowIso(): string {
  return new Date().toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function defaultAuditMetadata(): ExecutionRecordPersistenceAuditMetadata {
  return {
    noTradeMutation: true,
    noAuditAppendInContract: true,
    persistenceAttempted: false,
    supabaseWriteAttempted: false,
    tradeMutationAttempted: false,
    auditAppendAttempted: false,
    actor: "server_route",
    sourceEnvironment: "production",
    sourceEventIds: [],
  };
}

function dryRunMetadata(message: string): ExecutionRecordInsertRouteDryRunMetadata {
  return {
    dryRun: true,
    insertAttempted: false,
    supabaseWriteAttempted: false,
    auditAppendAttempted: false,
    tradeMutationAttempted: false,
    plannedRoutePath: defaultEndpoint,
    plannedMethod: "POST" as const,
    plannedTableName: "execution_records" as const,
    plannedDuplicateLookup: false,
    plannedInsertMapping: false,
    message,
  };
}

function fallbackResponse(input: {
  request?: ExecutionRecordInsertRouteRequest;
  status: "rejected" | "error";
  validationErrors?: ExecutionRecordInsertRouteValidationError[];
  rejectionReasons?: ExecutionRecordPersistenceRejectionReason[];
  warnings?: ExecutionRecordPersistenceWarning[];
  errorCode?: ExecutionRecordInsertRouteErrorCode;
  errorMessage?: string;
  message: string;
}): ExecutionRecordInsertRouteResponse {
  const receivedAt = nowIso();
  const base = {
    contractVersion: EXECUTION_RECORD_INSERT_ROUTE_CONTRACT_VERSION,
    routePath: defaultEndpoint,
    method: "POST" as const,
    receivedAt,
    evaluatedAt: receivedAt,
    idempotencyKey: input.request?.idempotencyKey ?? null,
    recordFingerprint: input.request?.recordFingerprint ?? null,
    warnings: input.warnings ?? [],
    validationErrors: input.validationErrors ?? [],
    rejectionReasons: input.rejectionReasons ?? [],
    auditMetadata: input.request?.auditMetadata ?? defaultAuditMetadata(),
    safetyMetadata: SAFETY_METADATA,
    dryRunMetadata: dryRunMetadata(input.message),
  };

  if (input.status === "error") {
    return {
      ...base,
      status: "error",
      errorCode: input.errorCode ?? "unexpected_server_error",
      errorMessage:
        input.errorMessage ??
        "Execution record insert dry-run request failed before a valid route response was received.",
    };
  }

  return {
    ...base,
    status: "rejected",
  };
}

function timeoutMsFromOptions(
  options: RequestExecutionRecordInsertDryRunOptions,
) {
  return typeof options.timeoutMs === "number" &&
    Number.isFinite(options.timeoutMs) &&
    options.timeoutMs > 0
    ? options.timeoutMs
    : defaultTimeoutMs;
}

function parseRouteResponse(
  value: unknown,
): ExecutionRecordInsertRouteResponse | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (
    value.contractVersion !== EXECUTION_RECORD_INSERT_ROUTE_CONTRACT_VERSION ||
    value.routePath !== defaultEndpoint ||
    value.method !== "POST" ||
    typeof value.receivedAt !== "string" ||
    typeof value.evaluatedAt !== "string" ||
    typeof value.status !== "string" ||
    !isRecord(value.safetyMetadata)
  ) {
    return undefined;
  }

  return value as ExecutionRecordInsertRouteResponse;
}

export async function requestExecutionRecordInsertDryRun(
  request: ExecutionRecordInsertRouteRequest,
  options: RequestExecutionRecordInsertDryRunOptions = {},
): Promise<ExecutionRecordInsertRouteResponse> {
  if (request.mode !== "dry_run" || request.dryRun !== true) {
    return fallbackResponse({
      request,
      status: "rejected",
      validationErrors: [
        {
          code: "supabase_write_disabled",
          message:
            "Execution record insert client helper only supports dry-run requests.",
          fieldPath: request.mode !== "dry_run" ? "mode" : "dryRun",
        },
      ],
      message:
        "Execution record insert dry-run client rejected a non-dry-run request. No Supabase read/write, audit append, or trade mutation occurred.",
    });
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    timeoutMsFromOptions(options),
  );
  const fetchFn = options.fetchFn ?? fetch;

  try {
    const response = await fetchFn(options.endpoint || defaultEndpoint, {
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
      return fallbackResponse({
        request,
        status: "error",
        errorCode: "invalid_request_contract",
        errorMessage:
          "Execution record insert dry-run route response was not valid JSON.",
        message:
          "Execution record insert dry-run client could not parse the route response. No Supabase read/write, audit append, or trade mutation occurred.",
      });
    }

    const parsed = parseRouteResponse(json);

    if (!parsed) {
      return fallbackResponse({
        request,
        status: "error",
        errorCode: "invalid_request_contract",
        errorMessage:
          "Execution record insert dry-run route response did not match the contract shape.",
        message:
          "Execution record insert dry-run client received an invalid route response. No Supabase read/write, audit append, or trade mutation occurred.",
      });
    }

    return parsed;
  } catch (error) {
    const isAbort = error instanceof DOMException && error.name === "AbortError";

    return fallbackResponse({
      request,
      status: "error",
      errorCode: "unexpected_server_error",
      errorMessage: isAbort
        ? "Execution record insert dry-run request timed out."
        : "Execution record insert dry-run request failed before a response was received.",
      message:
        "Execution record insert dry-run client failed before receiving a route response. No Supabase read/write, audit append, or trade mutation occurred.",
    });
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
