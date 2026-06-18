import { NextResponse } from "next/server";

import { isExecutionDevToolsEnabled } from "@/lib/execution";
import {
  EXECUTION_RECORD_INSERT_ROUTE_CONTRACT_VERSION,
  type ExecutionRecordInsertRouteDuplicatePayload,
  type ExecutionRecordInsertRouteDryRunMetadata,
  type ExecutionRecordInsertRoutePath,
  type ExecutionRecordInsertRouteRequest,
  type ExecutionRecordInsertRouteResponse,
  type ExecutionRecordInsertRouteSafetyMetadata,
  type ExecutionRecordInsertRouteValidationError,
} from "@/lib/execution-record-insert-route-contract";
import {
  type ExecutionRecordPersistenceAuditMetadata,
  type ExecutionRecordPersistenceInput,
  type ExecutionRecordPersistenceRejectionReason,
  type ExecutionRecordPersistenceResult,
  type ExecutionRecordPersistenceWarning,
} from "@/lib/execution-record-persistence-contract";
import {
  validateExecutionRecordPersistenceInput,
} from "@/lib/execution-record-persistence-validator";

const ROUTE_PATH: ExecutionRecordInsertRoutePath =
  "/api/execution/records/insert";

const SAFETY_METADATA: ExecutionRecordInsertRouteSafetyMetadata = {
  serverOnly: true,
  directClientSupabaseWriteAllowed: false,
  noTradeMutation: true,
  noAuditAppendInInitialRoute: true,
  noBrokerResultCreation: true,
  noAvanzaAutomation: true,
  migrationMustBeAppliedBeforeRealInsert: true,
};

function jsonResponse(body: ExecutionRecordInsertRouteResponse, status: number) {
  return NextResponse.json(body, { status });
}

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

function dryRunMetadata(
  message: string,
  options: {
    plannedDuplicateLookup?: boolean;
    plannedInsertMapping?: boolean;
  } = {},
): ExecutionRecordInsertRouteDryRunMetadata {
  return {
    dryRun: true,
    insertAttempted: false,
    supabaseWriteAttempted: false,
    auditAppendAttempted: false,
    tradeMutationAttempted: false,
    plannedRoutePath: ROUTE_PATH,
    plannedMethod: "POST",
    plannedTableName: "execution_records",
    plannedDuplicateLookup: options.plannedDuplicateLookup ?? false,
    plannedInsertMapping: options.plannedInsertMapping ?? false,
    message,
  };
}

function fallbackRejectedResponse(input: {
  receivedAt: string;
  evaluatedAt?: string;
  validationErrors: ExecutionRecordInsertRouteValidationError[];
  rejectionReasons?: ExecutionRecordPersistenceRejectionReason[];
  warnings?: ExecutionRecordPersistenceWarning[];
  idempotencyKey?: string | null;
  recordFingerprint?: string | null;
  auditMetadata?: ExecutionRecordPersistenceAuditMetadata;
  message: string;
}): ExecutionRecordInsertRouteResponse {
  return {
    contractVersion: EXECUTION_RECORD_INSERT_ROUTE_CONTRACT_VERSION,
    routePath: ROUTE_PATH,
    method: "POST",
    receivedAt: input.receivedAt,
    evaluatedAt: input.evaluatedAt ?? nowIso(),
    status: "rejected",
    idempotencyKey: input.idempotencyKey ?? null,
    recordFingerprint: input.recordFingerprint ?? null,
    warnings: input.warnings ?? [],
    validationErrors: input.validationErrors,
    rejectionReasons: input.rejectionReasons ?? [],
    auditMetadata: input.auditMetadata ?? defaultAuditMetadata(),
    safetyMetadata: SAFETY_METADATA,
    dryRunMetadata: dryRunMetadata(input.message),
  };
}

function requiredObject(
  source: Record<string, unknown>,
  fieldName: string,
  errors: ExecutionRecordInsertRouteValidationError[],
): Record<string, unknown> | null {
  const value = source[fieldName];

  if (isRecord(value)) {
    return value;
  }

  errors.push({
    code: "invalid_request_contract",
    message: `${fieldName} must be an object.`,
    fieldPath: fieldName,
  });

  return null;
}

function requiredString(
  source: Record<string, unknown>,
  fieldName: string,
  errors: ExecutionRecordInsertRouteValidationError[],
): string | null {
  const value = source[fieldName];

  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  errors.push({
    code: "invalid_request_contract",
    message: `${fieldName} must be a non-empty string.`,
    fieldPath: fieldName,
  });

  return null;
}

function validateRequestShape(
  body: unknown,
): {
  request?: ExecutionRecordInsertRouteRequest;
  validationErrors: ExecutionRecordInsertRouteValidationError[];
  idempotencyKey: string | null;
  recordFingerprint: string | null;
  auditMetadata?: ExecutionRecordPersistenceAuditMetadata;
} {
  const validationErrors: ExecutionRecordInsertRouteValidationError[] = [];

  if (!isRecord(body)) {
    return {
      validationErrors: [
        {
          code: "invalid_request_contract",
          message: "Execution record insert dry-run request must be an object.",
        },
      ],
      idempotencyKey: null,
      recordFingerprint: null,
    };
  }

  const idempotencyKey =
    typeof body.idempotencyKey === "string" ? body.idempotencyKey : null;
  const recordFingerprint =
    typeof body.recordFingerprint === "string" ? body.recordFingerprint : null;
  const auditMetadata = isRecord(body.auditMetadata)
    ? (body.auditMetadata as ExecutionRecordPersistenceAuditMetadata)
    : undefined;

  if (body.contractVersion !== EXECUTION_RECORD_INSERT_ROUTE_CONTRACT_VERSION) {
    validationErrors.push({
      code: "invalid_request_contract",
      message: "Execution record insert route contract version is invalid.",
      fieldPath: "contractVersion",
    });
  }

  if (body.method !== "POST") {
    validationErrors.push({
      code: "invalid_request_contract",
      message: "Execution record insert route method must be POST.",
      fieldPath: "method",
    });
  }

  if (body.routePath !== ROUTE_PATH) {
    validationErrors.push({
      code: "invalid_request_contract",
      message: "Execution record insert route path is invalid.",
      fieldPath: "routePath",
    });
  }

  if (body.mode !== "dry_run" || body.dryRun !== true) {
    validationErrors.push({
      code: "supabase_write_disabled",
      message:
        "Execution record insert route stub requires dry-run mode. No write path is enabled.",
      fieldPath: body.mode !== "dry_run" ? "mode" : "dryRun",
    });
  }

  requiredString(body, "requestedAt", validationErrors);
  requiredString(body, "idempotencyKey", validationErrors);
  requiredString(body, "recordFingerprint", validationErrors);
  requiredString(body, "sourceFingerprint", validationErrors);

  const persistenceInput = requiredObject(
    body,
    "persistenceInput",
    validationErrors,
  );
  requiredObject(body, "candidate", validationErrors);
  requiredObject(body, "brokerConfirmation", validationErrors);
  requiredObject(body, "association", validationErrors);
  requiredObject(body, "userContext", validationErrors);
  requiredObject(body, "auditMetadata", validationErrors);
  requiredObject(body, "safetyChecklist", validationErrors);

  if (persistenceInput) {
    requiredObject(persistenceInput, "candidate", validationErrors);
    requiredObject(persistenceInput, "brokerConfirmation", validationErrors);
    requiredObject(persistenceInput, "association", validationErrors);
    requiredObject(persistenceInput, "userContext", validationErrors);
    requiredObject(persistenceInput, "safetyChecklist", validationErrors);
    requiredObject(persistenceInput, "auditMetadata", validationErrors);
  }

  return {
    request:
      validationErrors.length === 0
        ? (body as ExecutionRecordInsertRouteRequest)
        : undefined,
    validationErrors,
    idempotencyKey,
    recordFingerprint,
    auditMetadata,
  };
}

function duplicatePayload(
  result: ExecutionRecordPersistenceResult,
): ExecutionRecordInsertRouteDuplicatePayload {
  return {
    duplicateMatches: result.duplicateMatches,
    idempotencyKey: result.idempotencyKey,
    recordFingerprint: result.recordFingerprint,
    conflictRequiresReview: result.duplicateMatches.some(
      (match) => match.conflictRequiresReview === true,
    ),
  };
}

function responseFromPersistenceResult(input: {
  request: ExecutionRecordInsertRouteRequest;
  result: ExecutionRecordPersistenceResult;
  receivedAt: string;
}): { response: ExecutionRecordInsertRouteResponse; status: number } {
  const { request, result, receivedAt } = input;
  const base = {
    contractVersion: EXECUTION_RECORD_INSERT_ROUTE_CONTRACT_VERSION,
    routePath: ROUTE_PATH,
    method: "POST" as const,
    receivedAt,
    evaluatedAt: result.evaluatedAt,
    idempotencyKey: result.idempotencyKey,
    recordFingerprint: result.recordFingerprint,
    warnings: result.warnings,
    validationErrors: [] as ExecutionRecordInsertRouteValidationError[],
    rejectionReasons: result.rejectionReasons,
    auditMetadata: result.auditMetadata,
    safetyMetadata: SAFETY_METADATA,
    serverContext: {
      actor: "authenticated_user" as const,
      sourceEnvironment: request.userContext.sourceEnvironment,
      authenticatedUserId: request.userContext.userId,
      accountId: request.userContext.accountId,
      sessionId: request.userContext.sessionId,
      requestId: request.clientContext?.requestId ?? null,
    },
  };

  if (result.status === "eligible") {
    return {
      status: 202,
      response: {
        ...base,
        status: "dry_run",
        rejectionReasons: [],
        dryRunMetadata: dryRunMetadata(
          "Execution record insert dry-run accepted. No Supabase read/write, audit append, or trade mutation occurred.",
          {
            plannedDuplicateLookup: true,
            plannedInsertMapping: true,
          },
        ),
      },
    };
  }

  if (result.status === "duplicate") {
    return {
      status: 200,
      response: {
        ...base,
        status: "duplicate",
        duplicate: duplicatePayload(result),
        dryRunMetadata: dryRunMetadata(
          "Execution record insert dry-run duplicate simulation completed. No Supabase duplicate lookup or write occurred.",
          {
            plannedDuplicateLookup: false,
            plannedInsertMapping: false,
          },
        ),
      },
    };
  }

  if (result.status === "needs_review") {
    return {
      status: 409,
      response: {
        ...base,
        status: "needs_review",
        duplicate:
          result.duplicateMatches.length > 0
            ? duplicatePayload(result)
            : undefined,
        dryRunMetadata: dryRunMetadata(
          "Execution record insert dry-run requires review. No Supabase read/write, audit append, or trade mutation occurred.",
        ),
      },
    };
  }

  return {
    status: 400,
    response: {
      ...base,
      status: "rejected",
      duplicate:
        result.duplicateMatches.length > 0 ? duplicatePayload(result) : undefined,
      validationErrors: result.rejectionReasons.map((reason) => ({
        code: "persistence_validation_failed",
        message: `Persistence validation rejected the dry-run request: ${reason}.`,
        persistenceReason: reason,
      })),
      dryRunMetadata: dryRunMetadata(
        "Execution record insert dry-run rejected. No Supabase read/write, audit append, or trade mutation occurred.",
      ),
    },
  };
}

export async function POST(request: Request) {
  const receivedAt = nowIso();

  if (!isExecutionDevToolsEnabled()) {
    return jsonResponse(
      fallbackRejectedResponse({
        receivedAt,
        validationErrors: [
          {
            code: "unauthorized",
            message:
              "Execution record insert dry-run stub is disabled in this build.",
          },
        ],
        message:
          "Execution record insert dry-run stub is disabled. No Supabase read/write, audit append, or trade mutation occurred.",
      }),
      403,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      fallbackRejectedResponse({
        receivedAt,
        validationErrors: [
          {
            code: "invalid_json",
            message: "Execution record insert dry-run request body must be valid JSON.",
          },
        ],
        message:
          "Execution record insert dry-run rejected invalid JSON. No Supabase read/write, audit append, or trade mutation occurred.",
      }),
      400,
    );
  }

  const shape = validateRequestShape(body);

  if (!shape.request) {
    return jsonResponse(
      fallbackRejectedResponse({
        receivedAt,
        validationErrors: shape.validationErrors,
        idempotencyKey: shape.idempotencyKey,
        recordFingerprint: shape.recordFingerprint,
        auditMetadata: shape.auditMetadata,
        message:
          "Execution record insert dry-run request shape is invalid. No Supabase read/write, audit append, or trade mutation occurred.",
      }),
      400,
    );
  }

  const validationResult = validateExecutionRecordPersistenceInput(
    shape.request.persistenceInput as ExecutionRecordPersistenceInput,
  );
  const routeResult = responseFromPersistenceResult({
    request: shape.request,
    result: validationResult,
    receivedAt,
  });

  return jsonResponse(routeResult.response, routeResult.status);
}
