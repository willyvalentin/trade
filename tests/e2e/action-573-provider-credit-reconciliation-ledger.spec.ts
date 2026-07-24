import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildBoundedShadowCollectorExecutionProofBlockedResult,
  buildBoundedShadowCollectorExecutionProofPlan,
  createBoundedShadowCollectorExecutionProofRuntime,
  parseBoundedShadowCollectorExecutionProofRequest,
} from "../../lib/bounded-shadow-collector-execution-proof";
import {
  buildBoundedShadowCollectorLiveProofReceipt,
} from "../../lib/bounded-shadow-collector-live-proof-receipt";
import {
  buildContinuousIntelligenceCreditLedgerDiagnostics,
  buildContinuousIntelligenceCreditLedgerEntry,
  continuousIntelligenceCreditLedgerFlagName,
  continuousIntelligenceCreditLedgerPolicy,
  continuousIntelligenceCreditLedgerTableName,
  isContinuousIntelligenceCreditLedgerEnabled,
  type ContinuousIntelligenceCreditLedgerEntry,
} from "../../lib/continuous-intelligence-credit-ledger";
import {
  createContinuousIntelligenceCreditLedgerStore,
  parseContinuousIntelligenceProviderUsageEvidence,
  type ContinuousIntelligenceCreditLedgerDatabase,
} from "../../lib/continuous-intelligence-credit-ledger-store";

const now = new Date("2026-07-21T15:00:00.000Z");
const migrationPath =
  "supabase/migrations/20260721001000_create_continuous_intelligence_credit_ledger.sql";
const executionRoutePath =
  "app/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/route.ts";
const readRoutePath = "app/api/automation/continuous-intelligence/credit-ledger/route.ts";
const reconcileRoutePath =
  "app/api/automation/continuous-intelligence/credit-ledger/reconcile/route.ts";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function receipt(receiptId = "proof-receipt-573") {
  const parsed = parseBoundedShadowCollectorExecutionProofRequest(
    {
      tickers: ["AAPL"],
      interval: "5min",
      start: "2026-07-20T14:00:00.000Z",
      end: "2026-07-20T14:30:00.000Z",
    },
    { now },
  );
  if (!parsed.ok) throw new Error("Expected valid receipt fixture.");
  const planner = buildBoundedShadowCollectorExecutionProofPlan({
    now,
    provider_metadata_status: "within_budget",
    proof_ticker: parsed.value.ticker,
  });
  const preflight = createBoundedShadowCollectorExecutionProofRuntime().preflight({
    request: parsed.value,
    budget_plan: planner.budget_plan,
    provider_configured: true,
    provider_metadata_status: "within_budget",
    execution_feature_enabled: true,
    ticker_input_source: planner.ticker_input_source,
    evaluation_now: planner.evaluation_now,
  });
  return buildBoundedShadowCollectorLiveProofReceipt({
    request: parsed.value,
    preflight,
    result: buildBoundedShadowCollectorExecutionProofBlockedResult(
      "provider_failure",
      preflight.request_fingerprint,
      "Provider request failed.",
      1,
    ),
    operator_authorization_verified: true,
    authorization_consumed: true,
    receipt_id: receiptId,
    now,
  });
}

function databaseFixture() {
  const rows = new Map<string, ContinuousIntelligenceCreditLedgerEntry>();
  let inserts = 0;
  let updates = 0;
  const database: ContinuousIntelligenceCreditLedgerDatabase = {
    async insert(entry) {
      inserts += 1;
      if (rows.has(entry.source_receipt_id)) return { data: null, error: { code: "23505" } };
      rows.set(entry.source_receipt_id, structuredClone(entry));
      return { data: { ledger_entry_id: entry.ledger_entry_id }, error: null };
    },
    async update(entry) {
      updates += 1;
      rows.set(entry.source_receipt_id, structuredClone(entry));
      return { data: { ledger_entry_id: entry.ledger_entry_id }, error: null };
    },
    async findBySourceReceiptId(receiptId) {
      return { data: rows.get(receiptId) ?? null, error: null };
    },
    async findByLedgerEntryId(entryId) {
      return { data: [...rows.values()].find((row) => row.ledger_entry_id === entryId) ?? null, error: null };
    },
    async latest() {
      return { data: [...rows.values()].at(-1) ?? null, error: null };
    },
    async listCanaryEntriesForUtcDay(start, end) {
      return {
        data: [...rows.values()].filter(
          (row) =>
            row.entry_kind === "scheduled_shadow_collector_canary" &&
            row.generated_at >= start &&
            row.generated_at < end,
        ),
        error: null,
      };
    },
  };
  return { database, rows, inserts: () => inserts, updates: () => updates };
}

test("Action 573 preserves unknown actual usage for failed provider attempts", () => {
  const original = receipt();
  const entry = buildContinuousIntelligenceCreditLedgerEntry({
    receipt: original,
    durable_audit: { status: "persisted", persisted: true },
    ledger_entry_id: "ledger-deterministic",
    now,
  });
  expect(entry).toMatchObject({
    ledger_entry_id: "ledger-deterministic",
    provider_request_count: 1,
    provider_estimated_credits: null,
    provider_reported_actual_credits: null,
    actual_credits_known: false,
    reconciled_credits: null,
    reconciliation_status: "reconciliation_unavailable",
    normal_capacity_credits_charged: null,
    reserve_credits_charged: 0,
  });
  expect(original.actual_credits).toBeNull();
  expect(continuousIntelligenceCreditLedgerPolicy).toEqual({
    total_credits: 377,
    hard_reserve_credits: 57,
    normal_planned_max_credits: 320,
  });
});

test("Action 573 reconciles explicit provider reports but rejects conflicts and invalid actuals", () => {
  const successReceipt = {
    ...receipt("reported-credit"),
    primary_result_category: "provider_success_with_candles" as const,
    execution_status: "executed" as const,
    estimated_credits: 1,
    actual_credits: 1,
  };
  expect(
    buildContinuousIntelligenceCreditLedgerEntry({
      receipt: successReceipt,
      durable_audit: { status: "disabled", persisted: false },
      now,
    }),
  ).toMatchObject({
    reconciliation_status: "provider_reported",
    reconciled_credits: 1,
    actual_credits_known: true,
  });
  expect(
    buildContinuousIntelligenceCreditLedgerEntry({
      receipt: { ...successReceipt, actual_credits: 0 },
      durable_audit: { status: "disabled", persisted: false },
      now,
    }),
  ).toMatchObject({ reconciliation_status: "conflict_requires_review", reconciled_credits: null });
  expect(
    buildContinuousIntelligenceCreditLedgerEntry({
      receipt: { ...successReceipt, actual_credits: 2 } as never,
      durable_audit: { status: "disabled", persisted: false },
      now,
    }),
  ).toBeNull();
});

test("Action 573 schema constrains sanitized bounded ledger fields", () => {
  const migration = read(migrationPath);
  expect(migration).toContain(`create table if not exists public.${continuousIntelligenceCreditLedgerTableName}`);
  expect(migration).toContain("source_receipt_id text not null unique");
  expect(migration).toContain("provider_request_count between 0 and 1");
  expect(migration).toContain("reserve_credits_charged = 0");
  expect(migration).toContain("policy_total_credits = 377");
  expect(migration).toContain("conflict_requires_review");
  expect(migration).toContain("enable row level security");
  for (const prohibited of ["candle_data", "token_hash", "raw_payload", "provider_url", "stack_trace"]) {
    expect(migration).not.toContain(prohibited);
  }
});

test("Action 573 persists exactly once, is idempotent, and fails closed on a conflicting duplicate", async () => {
  const fixture = databaseFixture();
  const store = createContinuousIntelligenceCreditLedgerStore(fixture.database);
  const input = { receipt: receipt("duplicate-ledger"), durable_audit: { status: "persisted" as const, persisted: true }, now };
  expect(await store.persist(input)).toMatchObject({ status: "persisted", persisted: true, idempotent: false });
  expect(await store.persist(input)).toMatchObject({ status: "already_persisted", persisted: true, idempotent: true });
  expect(await store.persist({ ...input, durable_audit: { status: "persistence_failed", persisted: false } })).toMatchObject({
    status: "validation_failed",
    persisted: false,
  });
  expect(fixture.inserts()).toBe(3);
  expect(fixture.rows.size).toBe(1);
});

test("Action 573 upgrades estimated-only data only with explicit matching evidence", async () => {
  const fixture = databaseFixture();
  const store = createContinuousIntelligenceCreditLedgerStore(fixture.database);
  const successReceipt = {
    ...receipt("reconcile-ledger"),
    primary_result_category: "provider_success_with_candles" as const,
    execution_status: "executed" as const,
    estimated_credits: 1,
    actual_credits: null,
  };
  await store.persist({ receipt: successReceipt, durable_audit: { status: "persisted", persisted: true }, now });
  const evidence = parseContinuousIntelligenceProviderUsageEvidence({
    evidence_source: "provider_usage_snapshot",
    observed_at: "2026-07-21T15:01:00.000Z",
    request_count_delta: 1,
    credit_delta: 1,
    verification_confidence: "verified",
  });
  if (!evidence) throw new Error("Expected valid usage evidence.");
  expect(await store.reconcile("reconcile-ledger", evidence, now)).toMatchObject({
    status: "persisted",
    reconciliation_status: "verified_from_provider_usage_snapshot",
  });
  expect(await store.reconcile("reconcile-ledger", { ...evidence, credit_delta: 0 }, now)).toMatchObject({
    status: "conflict_requires_review",
    persisted: false,
  });
  expect(fixture.updates()).toBe(1);
});

test("Action 573 flag is separate and diagnostics are passive", () => {
  expect(continuousIntelligenceCreditLedgerFlagName).toBe("TURE_CONTINUOUS_INTELLIGENCE_CREDIT_LEDGER_ENABLED");
  for (const value of [undefined, null, "", "false", "TRUE", "malformed"]) {
    expect(isContinuousIntelligenceCreditLedgerEnabled(value)).toBe(false);
  }
  expect(isContinuousIntelligenceCreditLedgerEnabled("true")).toBe(true);
  expect(buildContinuousIntelligenceCreditLedgerDiagnostics()).toMatchObject({
    status: "not_observed",
    feature_flag_state_client_side: "unknown",
    reserve_charging_allowed: false,
    provider_call_inferred_by_client: false,
    token_or_candle_payload_present: false,
  });
});

test("Action 573 routes and integration remain post-receipt, authenticated, and non-executing", () => {
  const executionRoute = read(executionRoutePath);
  const readRoute = read(readRoutePath);
  const reconcileRoute = read(reconcileRoutePath);
  expect(executionRoute.indexOf("boundedShadowCollectorLatestProofReceiptStore.record(receipt)")).toBeLessThan(
    executionRoute.lastIndexOf("persistContinuousIntelligenceCreditLedger({"),
  );
  expect(executionRoute.indexOf("persistBoundedShadowCollectorProofAudit(receipt)")).toBeLessThan(
    executionRoute.lastIndexOf("persistContinuousIntelligenceCreditLedger({"),
  );
  expect(executionRoute).toContain("TURE_CONTINUOUS_INTELLIGENCE_CREDIT_LEDGER_ENABLED");
  expect(readRoute).toContain("export async function GET");
  expect(readRoute).toContain("x-automation-secret");
  expect(readRoute).toContain('"Cache-Control": "no-store"');
  expect(readRoute).not.toContain("getIntradayCandlesWithDiagnostics");
  expect(reconcileRoute).toContain("export async function POST");
  expect(reconcileRoute).toContain("x-automation-secret");
  expect(reconcileRoute).toContain("parseContinuousIntelligenceProviderUsageEvidence");
  expect(reconcileRoute).not.toContain("getIntradayCandlesWithDiagnostics");
});
