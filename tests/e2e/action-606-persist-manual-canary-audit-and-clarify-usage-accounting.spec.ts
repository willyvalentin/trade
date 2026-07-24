import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildBoundedShadowCollectorExecutionProofBlockedResult,
  buildBoundedShadowCollectorExecutionProofPlan,
  createBoundedShadowCollectorExecutionProofRuntime,
  parseBoundedShadowCollectorExecutionProofRequest,
} from "../../lib/bounded-shadow-collector-execution-proof";
import { buildBoundedShadowCollectorLiveProofReceipt } from "../../lib/bounded-shadow-collector-live-proof-receipt";
import {
  createBoundedShadowCollectorProofAuditStore,
  mapBoundedShadowCollectorProofAuditReceipt,
  type BoundedShadowCollectorProofAuditDatabase,
  type BoundedShadowCollectorProofAuditRow,
} from "../../lib/bounded-shadow-collector-proof-audit-store";
import { buildContinuousIntelligenceShadowCanaryUsageAccounting } from "../../lib/continuous-intelligence-shadow-canary-usage-accounting";
import { buildContinuousIntelligenceShadowCanaryExecutionId } from "../../lib/continuous-intelligence-shadow-canary-claim-store";
import { buildContinuousIntelligenceCreditLedgerEntry } from "../../lib/continuous-intelligence-credit-ledger";

const now = new Date("2026-07-23T15:00:00.000Z");
const migrationPath = "supabase/migrations/20260723001000_allow_bounded_manual_proof_claim_linkage.sql";
const manualRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/manual-execution/route.ts";
const preflightRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/preflight/route.ts";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function action604Receipt() {
  const parsed = parseBoundedShadowCollectorExecutionProofRequest({
    tickers: ["AAPL"],
    interval: "5min",
    start: "2026-07-23T14:00:00.000Z",
    end: "2026-07-23T14:30:00.000Z",
  }, { now });
  if (!parsed.ok) throw new Error("Expected bounded manual fixture request.");
  const plan = buildBoundedShadowCollectorExecutionProofPlan({
    now,
    provider_metadata_status: "within_budget",
    proof_ticker: "AAPL",
  });
  const preflight = createBoundedShadowCollectorExecutionProofRuntime().preflight({
    request: parsed.value,
    budget_plan: plan.budget_plan,
    provider_configured: true,
    provider_metadata_status: "within_budget",
    execution_feature_enabled: true,
    ticker_input_source: plan.ticker_input_source,
    evaluation_now: plan.evaluation_now,
  });
  const executionId = buildContinuousIntelligenceShadowCanaryExecutionId({
    utc_day: "2026-07-23",
    request_fingerprint: preflight.request_fingerprint,
  });
  return {
    ...buildBoundedShadowCollectorLiveProofReceipt({
      request: parsed.value,
      preflight,
      result: buildBoundedShadowCollectorExecutionProofBlockedResult(
        "provider_failure",
        preflight.request_fingerprint,
        "Provider request failed safely.",
        1,
      ),
      operator_authorization_verified: true,
      authorization_consumed: true,
      receipt_id: "action-604-terminal-manual-receipt",
      now,
      entry_kind: "bounded_manual_proof",
      daily_claim_id: `canary_claim_${executionId}`,
      daily_claim_status: "completed",
      daily_claim_execution_id: executionId,
    }),
    execution_status: "executed" as const,
    primary_result_category: "provider_success_with_candles" as const,
    estimated_credits: 1 as const,
    actual_credits: 1 as const,
    candle_count: 6,
  };
}

function auditDatabase() {
  const rows = new Map<string, BoundedShadowCollectorProofAuditRow>();
  const database: BoundedShadowCollectorProofAuditDatabase = {
    async insert(row) {
      if (rows.has(row.receipt_id)) return { data: null, error: { code: "23505" } };
      rows.set(row.receipt_id, structuredClone(row));
      return { data: { receipt_id: row.receipt_id }, error: null };
    },
    async findByReceiptId(receiptId) {
      return { data: rows.get(receiptId) ?? null, error: null };
    },
    async latest() {
      return { data: [...rows.values()].at(-1) ?? null, error: null };
    },
  };
  return { database, rows };
}

test("Action 606 persists the Action 604-equivalent terminal manual receipt with exact claim linkage", async () => {
  const receipt = action604Receipt();
  const row = mapBoundedShadowCollectorProofAuditReceipt(receipt);
  expect(row).toMatchObject({
    entry_kind: "bounded_manual_proof",
    daily_claim_status: "completed",
    daily_claim_id: `canary_claim_${receipt.daily_claim_execution_id}`,
    daily_claim_execution_id: receipt.daily_claim_execution_id,
    ticker: "AAPL",
    interval: "5min",
    provider_request_count: 1,
    policy_total_credits: 377,
    policy_hard_reserve_credits: 57,
    policy_normal_planned_max_credits: 320,
  });
  const fixture = auditDatabase();
  const persisted = await createBoundedShadowCollectorProofAuditStore(fixture.database).persist(receipt);
  expect(persisted).toMatchObject({ status: "persisted", persisted: true });
  expect(fixture.rows.get(receipt.receipt_id)).toMatchObject({
    daily_claim_id: receipt.daily_claim_id,
    daily_claim_execution_id: receipt.daily_claim_execution_id,
  });
  const serialized = JSON.stringify(fixture.rows.get(receipt.receipt_id));
  expect(serialized).not.toContain("token");
  expect(serialized).not.toContain("secret");
  expect(serialized).not.toContain("raw");
});

test("Action 606 fails closed for non-terminal, missing, and mismatched manual claim linkage", () => {
  const receipt = action604Receipt();
  expect(mapBoundedShadowCollectorProofAuditReceipt({ ...receipt, daily_claim_status: "attempted" })).toBeNull();
  expect(mapBoundedShadowCollectorProofAuditReceipt({ ...receipt, daily_claim_execution_id: null })).toBeNull();
  expect(mapBoundedShadowCollectorProofAuditReceipt({ ...receipt, daily_claim_id: "canary_claim_other" })).toBeNull();
  expect(mapBoundedShadowCollectorProofAuditReceipt({ ...receipt, daily_claim_execution_id: "canary_execution_20260723_deadbeef" })).toBeNull();
});

test("Action 606 keeps ledger and audit on the same bounded manual receipt identity", () => {
  const receipt = action604Receipt();
  const audit = mapBoundedShadowCollectorProofAuditReceipt(receipt);
  const ledger = buildContinuousIntelligenceCreditLedgerEntry({
    receipt,
    durable_audit: { status: "persisted", persisted: true },
    now,
  });
  expect(audit?.request_fingerprint).toBe(ledger?.request_fingerprint);
  expect(ledger).toMatchObject({
    entry_kind: "bounded_manual_proof",
    provider_estimated_credits: 1,
    policy_total_credits: 377,
    policy_hard_reserve_credits: 57,
    policy_normal_planned_max_credits: 320,
  });
});

test("Action 606 reports scheduled, manual, total ledger, and claim capacity without double counting", () => {
  const usage = buildContinuousIntelligenceShadowCanaryUsageAccounting({
    utc_day: "2026-07-23",
    ledger_rows: [
      { entry_kind: "bounded_manual_proof", generated_at: "2026-07-23T15:00:00.000Z", provider_estimated_credits: 1 },
      { entry_kind: "scheduled_shadow_collector_canary", generated_at: "2026-07-23T16:00:00.000Z", provider_estimated_credits: 1 },
    ],
    claim_rows: [{ utc_day: "2026-07-23", estimated_credits: 1, status: "completed" }],
  });
  expect(usage).toEqual({
    status: "available",
    scope: "utc_day",
    queried_utc_date: "2026-07-23",
    scheduled_shadow_collector_canary: { attempts: 1, estimated_credits: 1 },
    bounded_manual_proof: { attempts: 1, estimated_credits: 1 },
    historical_manual_usage_reconciliation: { attempts: 0, estimated_credits: 0 },
    total_ledger: { attempts: 2, estimated_credits: 2 },
    claim_capacity: { attempts: 1, estimated_credits: 1 },
  });
  expect(buildContinuousIntelligenceShadowCanaryUsageAccounting({
    utc_day: "2026-07-23",
    ledger_rows: [{ entry_kind: "bounded_manual_proof", generated_at: "2026-07-23T23:59:59.999Z", provider_estimated_credits: 1 }],
    claim_rows: [{ utc_day: "2026-07-22", estimated_credits: 1, status: "completed" }],
  }).status).toBe("unavailable");
});

test("Action 606 migration and read-only diagnostics preserve scheduled-cap semantics", () => {
  const migration = read(migrationPath);
  const manualRoute = read(manualRoutePath);
  const preflightRoute = read(preflightRoutePath);
  expect(migration).toContain("daily_claim_execution_id text null");
  expect(migration).toContain("entry_kind = 'bounded_manual_proof'");
  expect(migration).toContain("daily_claim_status in ('completed', 'failed')");
  expect(migration).toContain("daily_claim_id = 'canary_claim_' || daily_claim_execution_id");
  expect(migration).toContain("policy_total_credits = 377");
  expect(migration).toContain("policy_hard_reserve_credits = 57");
  expect(migration).toContain("policy_normal_planned_max_credits = 320");
  expect(migration).not.toContain("token_hash");
  expect(manualRoute).toContain("daily_claim_execution_id: binding.execution_id");
  expect(preflightRoute).toContain("usage_accounting: usageAccounting");
  expect(preflightRoute).toContain("readContinuousIntelligenceCanaryDailyUsage");
  expect(preflightRoute).not.toContain("getIntradayCandlesWithDiagnostics");
});
