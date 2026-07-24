import { NextResponse } from "next/server";

import {
  boundedShadowCollectorProofAuditContractVersion,
  boundedShadowCollectorProofAuditFlagName,
} from "@/lib/bounded-shadow-collector-proof-audit-contract";
import {
  isBoundedShadowCollectorProofAuditEnabled,
  parseBoundedShadowCollectorProofAuditReceipt,
} from "@/lib/bounded-shadow-collector-proof-audit-store";
import { persistBoundedShadowCollectorProofAudit } from "@/lib/server/bounded-shadow-collector-proof-audit-persistence";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

const noStoreHeaders = { "Cache-Control": "no-store" };
const routePath =
  "/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/audits/import" as const;

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

async function parseBody(request: Request): Promise<unknown> {
  try {
    const text = await request.text();
    return text.trim() ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
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
  if (!isBoundedShadowCollectorProofAuditEnabled(process.env.TURE_BOUNDED_PROOF_DURABLE_AUDIT_ENABLED)) {
    return json(
      {
        error: "Durable audit is disabled.",
        contract_version: boundedShadowCollectorProofAuditContractVersion,
        route_path: routePath,
        persistence_feature_flag: boundedShadowCollectorProofAuditFlagName,
        failure_category: "durable_audit_disabled",
      },
      403,
    );
  }
  const receipt = parseBoundedShadowCollectorProofAuditReceipt(await parseBody(request));
  if (!receipt) {
    return json(
      {
        error: "Invalid sanitized receipt.",
        contract_version: boundedShadowCollectorProofAuditContractVersion,
        route_path: routePath,
        failure_category: "validation_failed",
      },
      400,
    );
  }
  const result = await persistBoundedShadowCollectorProofAudit(receipt);
  const status =
    result.status === "persisted" || result.status === "already_persisted"
      ? 200
      : result.status === "validation_failed"
        ? 400
        : 503;
  return json(
    {
      contract_version: boundedShadowCollectorProofAuditContractVersion,
      route_path: routePath,
      enabled: true,
      attempted: true,
      ...result,
      provider_calls_executed: false,
      token_actions_executed: false,
      runtime_capacity_reserved: false,
    },
    status,
  );
}
