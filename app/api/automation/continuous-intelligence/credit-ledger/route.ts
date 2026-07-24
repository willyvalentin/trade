import { NextResponse } from "next/server";

import {
  continuousIntelligenceCreditLedgerContractVersion,
  continuousIntelligenceCreditLedgerTableName,
} from "@/lib/continuous-intelligence-credit-ledger";
import { readContinuousIntelligenceCreditLedger } from "@/lib/server/continuous-intelligence-credit-ledger-persistence";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

const noStoreHeaders = { "Cache-Control": "no-store" };
const routePath = "/api/automation/continuous-intelligence/credit-ledger" as const;
const idPattern = /^[A-Za-z0-9_-]{1,160}$/;

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

export async function GET(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  const providedSecret = request.headers.get("x-automation-secret");
  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return json({ error: "Unauthorized.", contract_version: continuousIntelligenceCreditLedgerContractVersion, route_path: routePath }, 401);
  }
  const parameters = new URL(request.url).searchParams;
  const sourceReceiptId = parameters.get("source_receipt_id");
  const ledgerEntryId = parameters.get("ledger_entry_id");
  if (
    (sourceReceiptId && !idPattern.test(sourceReceiptId)) ||
    (ledgerEntryId && !idPattern.test(ledgerEntryId)) ||
    (sourceReceiptId && ledgerEntryId)
  ) {
    return json({ error: "Invalid ledger lookup.", contract_version: continuousIntelligenceCreditLedgerContractVersion, route_path: routePath, failure_category: "validation_failed" }, 400);
  }
  const result = await readContinuousIntelligenceCreditLedger({ sourceReceiptId, ledgerEntryId });
  return json(
    {
      contract_version: continuousIntelligenceCreditLedgerContractVersion,
      route_path: routePath,
      table_name: continuousIntelligenceCreditLedgerTableName,
      status: result.status,
      entry: result.entry,
      provider_calls_executed: false,
      token_actions_executed: false,
      runtime_capacity_reserved: false,
    },
    result.status === "found" ? 200 : result.status === "not_found" ? 404 : 503,
  );
}
