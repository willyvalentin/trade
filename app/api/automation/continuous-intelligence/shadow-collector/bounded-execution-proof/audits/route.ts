import { NextResponse } from "next/server";

import {
  boundedShadowCollectorProofAuditContractVersion,
  boundedShadowCollectorProofAuditTableName,
} from "@/lib/bounded-shadow-collector-proof-audit-contract";
import { readBoundedShadowCollectorProofAudit } from "@/lib/server/bounded-shadow-collector-proof-audit-persistence";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

const noStoreHeaders = { "Cache-Control": "no-store" };
const routePath =
  "/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/audits" as const;

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

function validReceiptId(value: string | null) {
  return value === null || (/^[A-Za-z0-9_-]{1,128}$/.test(value) && value.length <= 128);
}

export async function GET(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  const providedSecret = request.headers.get("x-automation-secret");
  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return json(
      {
        error: "Unauthorized.",
        contract_version: boundedShadowCollectorProofAuditContractVersion,
        route_path: routePath,
      },
      401,
    );
  }
  const receiptId = new URL(request.url).searchParams.get("receipt_id");
  if (!validReceiptId(receiptId)) {
    return json(
      {
        error: "Invalid audit lookup.",
        contract_version: boundedShadowCollectorProofAuditContractVersion,
        route_path: routePath,
        failure_category: "validation_failed",
      },
      400,
    );
  }
  const result = await readBoundedShadowCollectorProofAudit(receiptId);
  const status = result.status === "found" ? 200 : result.status === "not_found" ? 404 : 503;
  return json(
    {
      contract_version: boundedShadowCollectorProofAuditContractVersion,
      route_path: routePath,
      table_name: boundedShadowCollectorProofAuditTableName,
      status: result.status,
      audit: result.audit,
      provider_calls_executed: false,
      token_actions_executed: false,
      runtime_capacity_reserved: false,
    },
    status,
  );
}
