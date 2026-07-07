import { NextResponse } from "next/server";

import { isExecutionDevToolsEnabled } from "@/lib/execution";
import { getTradeAuthToken, TRADE_AUTH_COOKIE } from "@/lib/trade-auth";
import {
  appendExecutionRecordAuditEvent,
  type ExecutionRecordAuditWriterResultWithDryRun,
} from "@/lib/server/execution-record-audit-writer";
import {
  EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION,
  type ExecutionRecordAuditWriterInput,
} from "@/lib/server/execution-record-audit-writer-contract";

const ROUTE_PATH = "/api/execution/audit/writer" as const;
const ROUTE_CONTRACT_VERSION =
  "execution_record_audit_writer_route_boundary_v1" as const;
const AUDIT_WRITER_ROUTE_HARD_DISABLED = true as const;

type AuditWriterRouteValidationError = {
  code:
    | "invalid_json"
    | "invalid_request_contract"
    | "route_disabled"
    | "route_auth_missing";
  message: string;
  fieldPath?: string;
};

type AuditWriterRouteResponse = {
  routeContractVersion: typeof ROUTE_CONTRACT_VERSION;
  writerContractVersion: typeof EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION;
  routePath: typeof ROUTE_PATH;
  method: "POST";
  status:
    | "accepted"
    | "blocked"
    | "validation_failed"
    | "conflict_idempotent_duplicate"
    | "service_unavailable"
    | "unknown_error";
  receivedAt: string;
  evaluatedAt: string;
  validationErrors: AuditWriterRouteValidationError[];
  writerResult: ExecutionRecordAuditWriterResultWithDryRun | null;
  safety: {
    serverOnly: true;
    authGateRequired: true;
    authGatePassed: boolean;
    devGateRequired: true;
    devGatePassed: boolean;
    hardDisabled: true;
    routeCallAllowed: false;
    uiWiringAdded: false;
    browserClientInvocationAllowed: false;
    scheduledInvocationAllowed: false;
    productionExecutionPersistenceBlocked: true;
    supabaseExecutionRecordsWriteAllowed: false;
    productionWritePathApproved: false;
    liveSmokeInsertApproved: false;
    updateDeleteUpsertSelectAllowed: false;
    tradeStatsPnlMutationAllowed: false;
    externalOrderBrowserAllowed: false;
    externalOrderSubmissionAllowed: false;
    finalBuySellClickAllowed: false;
    autonomousModeAllowed: false;
  };
};

function nowIso(): string {
  return new Date().toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function jsonResponse(body: AuditWriterRouteResponse, status: number) {
  return NextResponse.json(body, { status });
}

function safety(input: {
  authGatePassed: boolean;
  devGatePassed: boolean;
}): AuditWriterRouteResponse["safety"] {
  return {
    serverOnly: true,
    authGateRequired: true,
    authGatePassed: input.authGatePassed,
    devGateRequired: true,
    devGatePassed: input.devGatePassed,
    hardDisabled: AUDIT_WRITER_ROUTE_HARD_DISABLED,
    routeCallAllowed: false,
    uiWiringAdded: false,
    browserClientInvocationAllowed: false,
    scheduledInvocationAllowed: false,
    productionExecutionPersistenceBlocked: true,
    supabaseExecutionRecordsWriteAllowed: false,
    productionWritePathApproved: false,
    liveSmokeInsertApproved: false,
    updateDeleteUpsertSelectAllowed: false,
    tradeStatsPnlMutationAllowed: false,
    externalOrderBrowserAllowed: false,
    externalOrderSubmissionAllowed: false,
    finalBuySellClickAllowed: false,
    autonomousModeAllowed: false,
  };
}

function response(input: {
  status: AuditWriterRouteResponse["status"];
  receivedAt: string;
  validationErrors?: AuditWriterRouteValidationError[];
  writerResult?: ExecutionRecordAuditWriterResultWithDryRun | null;
  authGatePassed: boolean;
  devGatePassed: boolean;
}): AuditWriterRouteResponse {
  return {
    routeContractVersion: ROUTE_CONTRACT_VERSION,
    writerContractVersion: EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION,
    routePath: ROUTE_PATH,
    method: "POST",
    status: input.status,
    receivedAt: input.receivedAt,
    evaluatedAt: nowIso(),
    validationErrors: input.validationErrors ?? [],
    writerResult: input.writerResult ?? null,
    safety: safety({
      authGatePassed: input.authGatePassed,
      devGatePassed: input.devGatePassed,
    }),
  };
}

function cookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = cookie.trim().split("=");

    if (rawName === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }

  return null;
}

async function isAuthenticated(request: Request): Promise<boolean> {
  const appPassword = process.env.TRADE_APP_PASSWORD;

  if (!appPassword) {
    return false;
  }

  const expectedToken = await getTradeAuthToken(appPassword);
  const actualToken = cookieValue(request.headers.get("cookie"), TRADE_AUTH_COOKIE);

  return actualToken === expectedToken;
}

function validateRequestShape(body: unknown): {
  input: ExecutionRecordAuditWriterInput | null;
  errors: AuditWriterRouteValidationError[];
} {
  const errors: AuditWriterRouteValidationError[] = [];

  if (!isRecord(body)) {
    return {
      input: null,
      errors: [
        {
          code: "invalid_request_contract",
          message: "Audit writer route request body must be an object.",
        },
      ],
    };
  }

  if (body.routeContractVersion !== ROUTE_CONTRACT_VERSION) {
    errors.push({
      code: "invalid_request_contract",
      message: "Audit writer route contract version is invalid.",
      fieldPath: "routeContractVersion",
    });
  }

  if (body.writerContractVersion !== EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION) {
    errors.push({
      code: "invalid_request_contract",
      message: "Audit writer contract version is invalid.",
      fieldPath: "writerContractVersion",
    });
  }

  if (body.routePath !== ROUTE_PATH) {
    errors.push({
      code: "invalid_request_contract",
      message: "Audit writer route path is invalid.",
      fieldPath: "routePath",
    });
  }

  if (body.method !== "POST") {
    errors.push({
      code: "invalid_request_contract",
      message: "Audit writer route method must be POST.",
      fieldPath: "method",
    });
  }

  if (!isRecord(body.input)) {
    errors.push({
      code: "invalid_request_contract",
      message: "Audit writer route input must be an object.",
      fieldPath: "input",
    });
  }

  return {
    input: errors.length === 0 ? (body.input as ExecutionRecordAuditWriterInput) : null,
    errors,
  };
}

function statusFromWriterResult(
  result: ExecutionRecordAuditWriterResultWithDryRun,
): AuditWriterRouteResponse["status"] {
  if (result.status === "success") {
    return "accepted";
  }

  return result.status;
}

export async function POST(request: Request) {
  const receivedAt = nowIso();
  const devGatePassed = isExecutionDevToolsEnabled();

  if (!devGatePassed) {
    return jsonResponse(
      response({
        status: "blocked",
        receivedAt,
        authGatePassed: false,
        devGatePassed,
        validationErrors: [
          {
            code: "route_disabled",
            message:
              "Audit writer route boundary is disabled. No writer call occurred.",
          },
        ],
      }),
      403,
    );
  }

  if (AUDIT_WRITER_ROUTE_HARD_DISABLED) {
    return jsonResponse(
      response({
        status: "blocked",
        receivedAt,
        authGatePassed: false,
        devGatePassed,
        validationErrors: [
          {
            code: "route_disabled",
            message:
              "Audit writer route is hard-disabled for production execution persistence. No writer call occurred.",
          },
        ],
      }),
      403,
    );
  }

  const authGatePassed = await isAuthenticated(request);

  if (!authGatePassed) {
    return jsonResponse(
      response({
        status: "blocked",
        receivedAt,
        authGatePassed,
        devGatePassed,
        validationErrors: [
          {
            code: "route_auth_missing",
            message:
              "Audit writer route authentication failed. No writer call occurred.",
          },
        ],
      }),
      401,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      response({
        status: "validation_failed",
        receivedAt,
        authGatePassed,
        devGatePassed,
        validationErrors: [
          {
            code: "invalid_json",
            message: "Audit writer route request body must be valid JSON.",
          },
        ],
      }),
      400,
    );
  }

  const validation = validateRequestShape(body);

  if (!validation.input) {
    return jsonResponse(
      response({
        status: "validation_failed",
        receivedAt,
        authGatePassed,
        devGatePassed,
        validationErrors: validation.errors,
      }),
      400,
    );
  }

  const writerResult = await appendExecutionRecordAuditEvent(validation.input);

  return jsonResponse(
    response({
      status: statusFromWriterResult(writerResult),
      receivedAt,
      authGatePassed,
      devGatePassed,
      writerResult,
    }),
    writerResult.status === "success" ? 201 : 200,
  );
}
