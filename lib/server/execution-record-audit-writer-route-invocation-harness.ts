import "server-only";

import {
  EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION,
  type ExecutionRecordAuditWriterInput,
} from "@/lib/server/execution-record-audit-writer-contract";
import type {
  ExecutionRecordAuditWriterResultWithDryRun,
} from "@/lib/server/execution-record-audit-writer";

export const EXECUTION_RECORD_AUDIT_WRITER_ROUTE_INVOCATION_HARNESS_VERSION =
  "execution_record_audit_writer_route_invocation_harness_v1" as const;

export const EXECUTION_RECORD_AUDIT_WRITER_ROUTE_INVOCATION_TARGET_ROUTE =
  "/api/execution/audit/writer" as const;

export const EXECUTION_RECORD_AUDIT_WRITER_ROUTE_BOUNDARY_CONTRACT_VERSION =
  "execution_record_audit_writer_route_boundary_v1" as const;

export type ExecutionRecordAuditWriterRouteInvocationPayloadSource =
  "fixture" | "test_fixture";

export type ExecutionRecordAuditWriterRouteInvocationProvenance =
  "test_vm_mocked_route";

export type ExecutionRecordAuditWriterRouteInvocationMode =
  "dev_manual_test_only";

export type ExecutionRecordAuditWriterRouteInvocationFixture = {
  routeContractVersion:
    typeof EXECUTION_RECORD_AUDIT_WRITER_ROUTE_BOUNDARY_CONTRACT_VERSION;
  writerContractVersion:
    typeof EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION;
  routePath: typeof EXECUTION_RECORD_AUDIT_WRITER_ROUTE_INVOCATION_TARGET_ROUTE;
  method: "POST";
  input: ExecutionRecordAuditWriterInput;
};

export type ExecutionRecordAuditWriterRouteValidationError = {
  code: string;
  message: string;
  fieldPath?: string;
};

export type ExecutionRecordAuditWriterRouteResponseEnvelope = {
  routeContractVersion: string;
  writerContractVersion: string;
  routePath: string;
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
  validationErrors: ExecutionRecordAuditWriterRouteValidationError[];
  writerResult: ExecutionRecordAuditWriterResultWithDryRun | null;
  safety: {
    serverOnly: true;
    authGateRequired: true;
    authGatePassed: boolean;
    devGateRequired: true;
    devGatePassed: boolean;
    routeCallAllowed: true;
    uiWiringAdded: false;
    browserClientInvocationAllowed: false;
    scheduledInvocationAllowed: false;
    productionWritePathApproved: false;
    liveSmokeInsertApproved: false;
    updateDeleteUpsertSelectAllowed: false;
    tradeStatsPnlMutationAllowed: false;
    externalOrderBrowserAllowed: false;
    autonomousModeAllowed: false;
  };
};

export type ExecutionRecordAuditWriterRouteHandler = (
  request: Request,
) => Promise<Response>;

export type ExecutionRecordAuditWriterRouteInvocationHarnessInput = {
  routeHandler: ExecutionRecordAuditWriterRouteHandler;
  explicitTrigger: boolean;
  invocationMode: ExecutionRecordAuditWriterRouteInvocationMode;
  payloadSource: ExecutionRecordAuditWriterRouteInvocationPayloadSource;
  routeHandlerProvenance: ExecutionRecordAuditWriterRouteInvocationProvenance | "unknown";
  fixture?: ExecutionRecordAuditWriterRouteInvocationFixture;
  authCookieValue?: string | null;
  productionWritePathApproved?: boolean;
  liveSmokeInsertApproved?: boolean;
};

export type ExecutionRecordAuditWriterRouteInvocationHarnessResult =
  | {
      status: "invoked";
      ok: true;
      harnessVersion:
        typeof EXECUTION_RECORD_AUDIT_WRITER_ROUTE_INVOCATION_HARNESS_VERSION;
      targetRoute:
        typeof EXECUTION_RECORD_AUDIT_WRITER_ROUTE_INVOCATION_TARGET_ROUTE;
      routeStatus: number;
      routeResponse: ExecutionRecordAuditWriterRouteResponseEnvelope;
      safety: ExecutionRecordAuditWriterRouteInvocationHarnessSafety;
    }
  | {
      status: "blocked";
      ok: false;
      harnessVersion:
        typeof EXECUTION_RECORD_AUDIT_WRITER_ROUTE_INVOCATION_HARNESS_VERSION;
      targetRoute:
        typeof EXECUTION_RECORD_AUDIT_WRITER_ROUTE_INVOCATION_TARGET_ROUTE;
      routeStatus: null;
      routeResponse: null;
      errors: string[];
      safety: ExecutionRecordAuditWriterRouteInvocationHarnessSafety;
    };

export type ExecutionRecordAuditWriterRouteInvocationHarnessSafety = {
  serverOnly: true;
  explicitTriggerOnly: true;
  fixturePayloadOnly: true;
  devManualTestOnly: true;
  preservesRouteDevGate: true;
  preservesRouteAuthGate: true;
  routeHandlerInjected: true;
  routeHandlerMustBeMocked: true;
  productionUiAdded: false;
  browserClientRuntimePathAdded: false;
  normalAppRuntimeRouteCallAdded: false;
  automaticInvocationAllowed: false;
  marketLoopInvocationAllowed: false;
  liveSmokeInsertApproved: false;
  productionWritePathApproved: false;
  externalExecutionBehaviorAllowed: false;
  automaticModeAllowed: false;
  tradeStatsPnlMutationAllowed: false;
  routeGateBypassAllowed: false;
};

export function buildExecutionRecordAuditWriterRouteInvocationFixture():
  ExecutionRecordAuditWriterRouteInvocationFixture {
  return {
    routeContractVersion:
      EXECUTION_RECORD_AUDIT_WRITER_ROUTE_BOUNDARY_CONTRACT_VERSION,
    writerContractVersion: EXECUTION_RECORD_AUDIT_WRITER_CONTRACT_VERSION,
    routePath: EXECUTION_RECORD_AUDIT_WRITER_ROUTE_INVOCATION_TARGET_ROUTE,
    method: "POST",
    input: {
      executionRecordId: "11111111-1111-4111-8111-111111111111",
      eventType: "execution_record_created",
      source: {
        eventSource: "route_invocation_harness_fixture",
        sourceSystem: "trade_app",
        sourceFingerprint: "route-invocation-harness-fixture",
        traceId: "route-invocation-harness-trace",
        writerVersion: "route-invocation-harness",
      },
      requestId: "route-invocation-harness-request",
      idempotencyKey: "execution-record-audit:route-invocation-harness",
      duplicatePreventionKey:
        "execution-record-audit:route-invocation-harness-duplicate",
      actor: {
        actorType: "system",
        actorId: null,
      },
      authorityMode: "server_append_only",
      payload: {
        status: "fixture_only",
      },
      evidence: {
        source: "fixture",
      },
      provenance: {
        generatedBy: "action_829_route_invocation_harness",
      },
      occurredAt: "2026-06-26T00:26:00.000Z",
      metadata: {
        fixtureOnly: true,
        liveSmokeInsertApproved: false,
        productionWritePathApproved: false,
      },
    },
  };
}

function safety(): ExecutionRecordAuditWriterRouteInvocationHarnessSafety {
  return {
    serverOnly: true,
    explicitTriggerOnly: true,
    fixturePayloadOnly: true,
    devManualTestOnly: true,
    preservesRouteDevGate: true,
    preservesRouteAuthGate: true,
    routeHandlerInjected: true,
    routeHandlerMustBeMocked: true,
    productionUiAdded: false,
    browserClientRuntimePathAdded: false,
    normalAppRuntimeRouteCallAdded: false,
    automaticInvocationAllowed: false,
    marketLoopInvocationAllowed: false,
    liveSmokeInsertApproved: false,
    productionWritePathApproved: false,
    externalExecutionBehaviorAllowed: false,
    automaticModeAllowed: false,
    tradeStatsPnlMutationAllowed: false,
    routeGateBypassAllowed: false,
  };
}

function blocked(errors: string[]):
  ExecutionRecordAuditWriterRouteInvocationHarnessResult {
  return {
    status: "blocked",
    ok: false,
    harnessVersion:
      EXECUTION_RECORD_AUDIT_WRITER_ROUTE_INVOCATION_HARNESS_VERSION,
    targetRoute: EXECUTION_RECORD_AUDIT_WRITER_ROUTE_INVOCATION_TARGET_ROUTE,
    routeStatus: null,
    routeResponse: null,
    errors,
    safety: safety(),
  };
}

function validateHarnessInput(
  input: ExecutionRecordAuditWriterRouteInvocationHarnessInput,
): string[] {
  const errors: string[] = [];

  if (!input.explicitTrigger) {
    errors.push("explicit_trigger_required");
  }

  if (input.invocationMode !== "dev_manual_test_only") {
    errors.push("dev_manual_test_only_mode_required");
  }

  if (input.payloadSource !== "fixture" && input.payloadSource !== "test_fixture") {
    errors.push("fixture_payload_source_required");
  }

  if (input.routeHandlerProvenance !== "test_vm_mocked_route") {
    errors.push("mocked_route_handler_required_no_live_smoke_insert");
  }

  if (input.productionWritePathApproved) {
    errors.push("production_write_path_not_approved");
  }

  if (input.liveSmokeInsertApproved) {
    errors.push("live_smoke_insert_not_approved");
  }

  return errors;
}

function cookieHeader(authCookieValue: string | null | undefined): HeadersInit {
  if (!authCookieValue) {
    return {};
  }

  return {
    cookie: `trade_auth=${encodeURIComponent(authCookieValue)}`,
  };
}

export async function invokeExecutionRecordAuditWriterRouteHarness(
  input: ExecutionRecordAuditWriterRouteInvocationHarnessInput,
): Promise<ExecutionRecordAuditWriterRouteInvocationHarnessResult> {
  const validationErrors = validateHarnessInput(input);

  if (validationErrors.length > 0) {
    return blocked(validationErrors);
  }

  const fixture =
    input.fixture ?? buildExecutionRecordAuditWriterRouteInvocationFixture();
  const request = new Request(
    `http://localhost${EXECUTION_RECORD_AUDIT_WRITER_ROUTE_INVOCATION_TARGET_ROUTE}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...cookieHeader(input.authCookieValue),
      },
      body: JSON.stringify(fixture),
    },
  );
  const response = await input.routeHandler(request);
  const routeResponse =
    (await response.json()) as ExecutionRecordAuditWriterRouteResponseEnvelope;

  return {
    status: "invoked",
    ok: true,
    harnessVersion:
      EXECUTION_RECORD_AUDIT_WRITER_ROUTE_INVOCATION_HARNESS_VERSION,
    targetRoute: EXECUTION_RECORD_AUDIT_WRITER_ROUTE_INVOCATION_TARGET_ROUTE,
    routeStatus: response.status,
    routeResponse,
    safety: safety(),
  };
}
