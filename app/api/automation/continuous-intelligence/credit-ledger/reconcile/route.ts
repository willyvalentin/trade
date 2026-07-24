import { NextResponse } from "next/server";

import {
  continuousIntelligenceCreditLedgerContractVersion,
  continuousIntelligenceCreditLedgerFlagName,
  isContinuousIntelligenceCreditLedgerEnabled,
} from "@/lib/continuous-intelligence-credit-ledger";
import { parseContinuousIntelligenceProviderUsageEvidence } from "@/lib/continuous-intelligence-credit-ledger-store";
import { reconcileContinuousIntelligenceCreditLedger } from "@/lib/server/continuous-intelligence-credit-ledger-persistence";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

const noStoreHeaders = { "Cache-Control": "no-store" };
const routePath = "/api/automation/continuous-intelligence/credit-ledger/reconcile" as const;
const sourceReceiptIdPattern = /^[A-Za-z0-9_-]{1,128}$/;

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
    return json({ error: "Unauthorized.", contract_version: continuousIntelligenceCreditLedgerContractVersion, route_path: routePath }, 401);
  }
  if (!isContinuousIntelligenceCreditLedgerEnabled(process.env.TURE_CONTINUOUS_INTELLIGENCE_CREDIT_LEDGER_ENABLED)) {
    return json({ error: "Credit ledger is disabled.", contract_version: continuousIntelligenceCreditLedgerContractVersion, route_path: routePath, feature_flag: continuousIntelligenceCreditLedgerFlagName, failure_category: "credit_ledger_disabled" }, 403);
  }
  const body = await parseBody(request);
  const sourceReceiptId = typeof body === "object" && body !== null && !Array.isArray(body)
    ? (body as Record<string, unknown>).source_receipt_id
    : null;
  const evidence = typeof body === "object" && body !== null && !Array.isArray(body)
    ? parseContinuousIntelligenceProviderUsageEvidence((body as Record<string, unknown>).evidence)
    : null;
  if (
    !sourceReceiptId ||
    typeof sourceReceiptId !== "string" ||
    !sourceReceiptIdPattern.test(sourceReceiptId) ||
    !evidence ||
    Object.keys(body as Record<string, unknown>).length !== 2
  ) {
    return json({ error: "Invalid reconciliation evidence.", contract_version: continuousIntelligenceCreditLedgerContractVersion, route_path: routePath, failure_category: "validation_failed" }, 400);
  }
  const result = await reconcileContinuousIntelligenceCreditLedger(sourceReceiptId, evidence);
  return json(
    {
      contract_version: continuousIntelligenceCreditLedgerContractVersion,
      route_path: routePath,
      enabled: true,
      attempted: true,
      ...result,
      provider_calls_executed: false,
      token_actions_executed: false,
      runtime_capacity_reserved: false,
    },
    result.status === "persisted" || result.status === "already_persisted"
      ? 200
      : result.status === "conflict_requires_review"
        ? 409
        : result.status === "validation_failed"
          ? 400
          : 503,
  );
}
