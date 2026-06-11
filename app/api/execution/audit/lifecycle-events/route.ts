import { NextResponse } from "next/server";

import { isExecutionDevToolsEnabled } from "@/lib/execution";
import {
  createRejectedExecutionAuditPersistenceResponse,
  type PersistExecutionLifecycleEventRequest,
  validatePersistExecutionLifecycleEventRequest,
} from "@/lib/execution-audit-persistence-contract";
import {
  buildExecutionAuditPersistenceRouteResponse,
} from "@/lib/execution-audit-persistence-route-handler";
import { getExecutionAuditSupabaseDbClient } from "../server-db";

function jsonResponse(body: unknown, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  if (!isExecutionDevToolsEnabled()) {
    return jsonResponse(
      createRejectedExecutionAuditPersistenceResponse({
        status: "disabled",
        errors: ["Execution audit persistence stub is disabled in this build."],
        message: "Execution audit persistence stub is disabled in this build.",
      }),
      403,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      createRejectedExecutionAuditPersistenceResponse({
        errors: ["Execution audit persistence request body must be valid JSON."],
        message: "Execution audit persistence request body must be valid JSON.",
      }),
      400,
    );
  }

  const validation = validatePersistExecutionLifecycleEventRequest(
    body as Partial<PersistExecutionLifecycleEventRequest>,
  );

  if (!validation.ok) {
    return jsonResponse(
      createRejectedExecutionAuditPersistenceResponse({
        errors: validation.errors,
        warnings: validation.warnings,
      }),
      400,
    );
  }

  const routeResponse = await buildExecutionAuditPersistenceRouteResponse({
    kind: "lifecycle_event",
    request: body as PersistExecutionLifecycleEventRequest,
    id: (body as Partial<PersistExecutionLifecycleEventRequest>).event?.eventId,
    getDbClient: getExecutionAuditSupabaseDbClient,
    validationWarnings: validation.warnings,
    stubMessage:
      "Execution lifecycle event accepted by dev stub only. No Supabase write occurred.",
  });

  return jsonResponse(routeResponse.response, routeResponse.statusCode);
}
