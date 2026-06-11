import { NextResponse } from "next/server";

import { isExecutionDevToolsEnabled } from "@/lib/execution";
import {
  createAcceptedExecutionServerCaptureResponse,
  createRejectedExecutionServerCaptureResponse,
  type ExecutionServerCaptureRequest,
  validateExecutionServerCaptureRequest,
} from "@/lib/execution-server-capture-contract";

function jsonResponse(body: unknown, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  if (!isExecutionDevToolsEnabled()) {
    return jsonResponse(
      createRejectedExecutionServerCaptureResponse({
        errors: ["Execution capture stub is disabled in this build."],
        message: "Execution capture stub is disabled in this build.",
      }),
      403,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      createRejectedExecutionServerCaptureResponse({
        errors: ["Execution capture request body must be valid JSON."],
        message: "Execution capture request body must be valid JSON.",
      }),
      400,
    );
  }

  const validation = validateExecutionServerCaptureRequest(
    body as Partial<ExecutionServerCaptureRequest>,
  );

  if (!validation.ok) {
    return jsonResponse(
      createRejectedExecutionServerCaptureResponse({
        errors: validation.errors,
        idempotencyKey: validation.idempotencyKey,
        warnings: validation.warnings,
      }),
      400,
    );
  }

  return jsonResponse(
    createAcceptedExecutionServerCaptureResponse({
      idempotencyKey: validation.idempotencyKey,
      warnings: validation.warnings,
      message:
        "Capture request accepted by dev stub only. No Supabase write or trade mutation occurred.",
    }),
    202,
  );
}
