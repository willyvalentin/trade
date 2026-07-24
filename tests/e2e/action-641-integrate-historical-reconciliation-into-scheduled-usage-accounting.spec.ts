import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target,
  continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion,
  continuousIntelligenceShadowCanaryHistoricalUsageReconciliationReason,
} from "../../lib/continuous-intelligence-shadow-canary-historical-usage-reconciliation-contract";
import {
  buildContinuousIntelligenceShadowCanaryUsageAccounting,
  type ContinuousIntelligenceShadowCanaryUsageReconciliationRow,
} from "../../lib/continuous-intelligence-shadow-canary-usage-accounting";
import {
  continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
  evaluateContinuousIntelligenceShadowCanaryScheduledBudget,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-execution-safety";

const utcDay = "2026-07-22";
const root = resolve(__dirname, "../..");

function action609Reconciliation(): ContinuousIntelligenceShadowCanaryUsageReconciliationRow {
  return {
    reconciliation_identity:
      `historical_manual_usage_reconciliation:${continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion}:${continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target.claim_id}`,
    contract_version: continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion,
    operation_type: "historical_manual_usage_ledger_reconciliation",
    record_type: "historical_manual_usage_reconciliation",
    target_claim_id: continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target.claim_id,
    source_execution_id: continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target.execution_id,
    source_audit_id: continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target.source_audit_id,
    authorization_id: "action641_authorization_609",
    usage_units: 1,
    provider_request_count_for_reconciliation: 0,
    reason_code: continuousIntelligenceShadowCanaryHistoricalUsageReconciliationReason,
    historical_utc_day: utcDay,
  };
}

function action609Accounting(reconciliation_rows: unknown = [action609Reconciliation()]) {
  return buildContinuousIntelligenceShadowCanaryUsageAccounting({
    utc_day: utcDay,
    ledger_rows: [{
      entry_kind: "bounded_manual_proof",
      generated_at: "2026-07-22T19:31:00.000Z",
      provider_estimated_credits: 1,
    }],
    claim_rows: [
      { utc_day: utcDay, estimated_credits: 1, status: "completed" },
      { utc_day: utcDay, estimated_credits: 1, status: "completed" },
    ],
    reconciliation_rows,
  });
}

test("Action 641 accounts for the exact reconciled Action 609 state without reclassifying the ordinary ledger", () => {
  const usage = action609Accounting();
  expect(usage).toEqual({
    status: "available",
    scope: "utc_day",
    queried_utc_date: utcDay,
    scheduled_shadow_collector_canary: { attempts: 0, estimated_credits: 0 },
    bounded_manual_proof: { attempts: 1, estimated_credits: 1 },
    historical_manual_usage_reconciliation: { attempts: 1, estimated_credits: 1 },
    total_ledger: { attempts: 2, estimated_credits: 2 },
    claim_capacity: { attempts: 2, estimated_credits: 2 },
  });
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledBudget({
    policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
    usage,
    invocation: { provider_calls: 1, estimated_credits: 1, active_scheduled_claims: 0, scheduled_claims_for_market_window: 0 },
  })).toBe("scheduled_attempt_limit_reached");
});

test("Action 641 preserves ordinary-only days and fails closed for absent, malformed, duplicate, or wrong-day reconciliation state", () => {
  const ordinaryOnly = buildContinuousIntelligenceShadowCanaryUsageAccounting({
    utc_day: utcDay,
    ledger_rows: [{ entry_kind: "bounded_manual_proof", generated_at: "2026-07-22T19:31:00.000Z", provider_estimated_credits: 1 }],
    claim_rows: [{ utc_day: utcDay, estimated_credits: 1, status: "completed" }],
  });
  expect(ordinaryOnly).toMatchObject({
    status: "available",
    bounded_manual_proof: { attempts: 1, estimated_credits: 1 },
    historical_manual_usage_reconciliation: { attempts: 0, estimated_credits: 0 },
    total_ledger: { attempts: 1, estimated_credits: 1 },
  });
  expect(action609Accounting([{ ...action609Reconciliation(), usage_units: 2 }]).status).toBe("unavailable");
  expect(action609Accounting([action609Reconciliation(), action609Reconciliation()]).status).toBe("unavailable");
  expect(action609Accounting([{ ...action609Reconciliation(), historical_utc_day: "2026-07-21" }]).status).toBe("unavailable");
});

test("Action 641 rejects wrong reconciliation contract, operation, reason, provider work, and legacy target mismatches", () => {
  for (const row of [
    { ...action609Reconciliation(), contract_version: "continuous_intelligence_shadow_canary_historical_usage_reconciliation_v2" },
    { ...action609Reconciliation(), operation_type: "other" },
    { ...action609Reconciliation(), reason_code: "other" },
    { ...action609Reconciliation(), provider_request_count_for_reconciliation: 1 },
    { ...action609Reconciliation(), source_execution_id: "canary_execution_20260723_wrong" },
  ]) {
    expect(action609Accounting([row]).status).toBe("unavailable");
  }
});

test("Action 642 reads reconciliation evidence through a bounded service-role RPC without direct table access", () => {
  const source = readFileSync(resolve(root, "lib/server/continuous-intelligence-shadow-canary-usage-accounting.ts"), "utf8");
  const migration = readFileSync(
    resolve(root, "supabase/migrations/20260724000000_add_historical_usage_reconciliation_read_rpc.sql"),
    "utf8",
  );

  expect(source).toContain('"ci_hur_read_for_usage_accounting"');
  expect(source).toContain("supabase.client.rpc(");
  expect(source).toContain("p_historical_utc_day: input.utc_day");
  expect(source).toContain("reconciliation_rows: reconciliations.data");
  expect(source).not.toContain('.from("ci_hur_reconciliations")');

  expect(migration).toContain("language sql");
  expect(migration).toContain("stable");
  expect(migration).toContain("security definer");
  expect(migration).toContain("set search_path = pg_catalog, public");
  expect(migration).toContain("where reconciliation.historical_utc_day = p_historical_utc_day");
  expect(migration).toContain("revoke all on function public.ci_hur_read_for_usage_accounting(date)");
  expect(migration).toContain("from public, anon, authenticated");
  expect(migration).toContain("grant execute on function public.ci_hur_read_for_usage_accounting(date)");
  expect(migration).toContain("to service_role");
  expect(migration).not.toContain("grant select on");
  expect(migration).not.toContain("insert into");
  expect(migration).not.toContain("update ");
  expect(migration).not.toContain("delete from");

  for (const forbidden of ["insert(", "update(", "delete(", "getIntradayCandlesWithDiagnostics", "claimContinuous", "persistBounded"]) {
    expect(source).not.toContain(forbidden);
  }
});
