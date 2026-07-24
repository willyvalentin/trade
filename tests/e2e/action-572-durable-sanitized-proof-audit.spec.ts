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
  buildBoundedShadowCollectorProofAuditDiagnostics,
  boundedShadowCollectorProofAuditFlagName,
  boundedShadowCollectorProofAuditTableName,
} from "../../lib/bounded-shadow-collector-proof-audit-contract";
import {
  createBoundedShadowCollectorProofAuditStore,
  isBoundedShadowCollectorProofAuditEnabled,
  mapBoundedShadowCollectorProofAuditReceipt,
  parseBoundedShadowCollectorProofAuditReceipt,
  type BoundedShadowCollectorProofAuditDatabase,
  type BoundedShadowCollectorProofAuditRow,
} from "../../lib/bounded-shadow-collector-proof-audit-store";

const now = new Date("2026-07-21T14:30:00.000Z");
const migrationPath =
  "supabase/migrations/20260721000000_create_bounded_shadow_collector_proof_audits.sql";
const executionRoutePath =
  "app/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/route.ts";
const readRoutePath =
  "app/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/audits/route.ts";
const importRoutePath =
  "app/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/audits/import/route.ts";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function receipt(receiptId = "proof-receipt-572") {
  const parsed = parseBoundedShadowCollectorExecutionProofRequest(
    {
      tickers: ["AAPL"],
      interval: "5min",
      start: "2026-07-20T14:00:00.000Z",
      end: "2026-07-20T14:30:00.000Z",
    },
    { now },
  );
  if (!parsed.ok) throw new Error("Expected valid proof receipt fixture.");
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
  const rows = new Map<string, BoundedShadowCollectorProofAuditRow>();
  let insertCount = 0;
  const database: BoundedShadowCollectorProofAuditDatabase = {
    async insert(row) {
      insertCount += 1;
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
  return { database, rows, insertCount: () => insertCount };
}

test("Action 572 migration defines a constrained sanitized audit table without prohibited columns", () => {
  const migration = read(migrationPath);
  expect(migration).toContain(`create table if not exists public.${boundedShadowCollectorProofAuditTableName}`);
  expect(migration).toContain("receipt_id text not null unique");
  expect(migration).toContain("provider_request_count between 0 and 1");
  expect(migration).toContain("execution_ready_reserve_consumed = false");
  expect(migration).toContain("entry_kind in ('bounded_manual_proof', 'scheduled_shadow_collector_canary')");
  expect(migration).toContain("supabase_writes_executed = false");
  expect(migration).toContain("safe_operator_message_check");
  expect(migration).toContain("enable row level security");
  expect(migration).not.toContain("candle_data");
  expect(migration).not.toContain("token_hash");
  expect(migration).not.toContain("raw_payload");
  expect(migration).not.toContain("provider_url");
  expect(migration).not.toContain("stack_trace");
});

test("Action 572 maps only explicit sanitized receipt fields and preserves unknown actual credits", () => {
  const row = mapBoundedShadowCollectorProofAuditReceipt(receipt());
  expect(row).not.toBeNull();
  if (!row) throw new Error("Expected mapped audit row.");
  expect(row).toMatchObject({
    receipt_id: "proof-receipt-572",
    ticker: "AAPL",
    provider_request_count: 1,
    actual_credits: null,
    actual_credits_known: false,
    execution_ready_reserve_consumed: false,
    durable: true,
    process_local_only: false,
    persisted: true,
  });
  const serialized = JSON.stringify(row);
  expect(serialized).not.toContain("candles");
  expect(serialized).not.toContain("token_hash");
  expect(serialized).not.toContain("api_key");
  expect(serialized).not.toContain("provider_url");
  expect(serialized).not.toContain("stack");
  expect(
    mapBoundedShadowCollectorProofAuditReceipt({
      ...receipt("sanitized-blocker"),
      safe_blocker_or_failure_category: "https://provider.example/raw-error",
      safe_operator_message: "raw provider stack text",
    }),
  ).toMatchObject({
    safe_blocker_or_failure_category: "provider_failure",
    safe_operator_message: "Bounded proof provider request failed safely.",
  });
  expect(
    mapBoundedShadowCollectorProofAuditReceipt({
      ...receipt("invalid-reserve"),
      execution_ready_reserve_consumed: true,
    } as never),
  ).toBeNull();
  expect(
    mapBoundedShadowCollectorProofAuditReceipt({
      ...receipt("canary-audit"),
      entry_kind: "scheduled_shadow_collector_canary",
      daily_claim_id: "canary-claim-audit",
      daily_claim_status: "failed",
    }),
  ).toMatchObject({
    entry_kind: "scheduled_shadow_collector_canary",
    daily_claim_id: "canary-claim-audit",
    safe_operator_message: "Scheduled shadow canary provider request failed safely.",
  });
});

test("Action 572 rejects unknown or prohibited receipt payload fields recursively", () => {
  const canonical = receipt();
  expect(parseBoundedShadowCollectorProofAuditReceipt(canonical)).not.toBeNull();
  expect(
    parseBoundedShadowCollectorProofAuditReceipt({
      ...canonical,
      arbitrary_error: "not allowed",
    }),
  ).toBeNull();
  expect(
    parseBoundedShadowCollectorProofAuditReceipt({
      ...canonical,
      planner: { ...canonical.planner, nested: { token: "forbidden" } },
    }),
  ).toBeNull();
});

test("Action 572 persists once, handles exact duplicates idempotently, and rejects conflicting duplicates", async () => {
  const fixture = databaseFixture();
  const store = createBoundedShadowCollectorProofAuditStore(fixture.database);
  const first = receipt("idempotent-proof-receipt");
  expect(await store.persist(first)).toMatchObject({
    status: "persisted",
    durable: true,
    persisted: true,
    idempotent: false,
  });
  expect(await store.persist(first)).toMatchObject({
    status: "already_persisted",
    durable: true,
    persisted: true,
    idempotent: true,
  });
  expect(await store.persist({ ...first, ticker: "MSFT" })).toMatchObject({
    status: "validation_failed",
    durable: false,
    persisted: false,
  });
  expect(await store.persist({
    ...first,
    entry_kind: "scheduled_shadow_collector_canary",
    daily_claim_id: "conflicting-source-claim",
    daily_claim_status: "failed",
  })).toMatchObject({
    status: "validation_failed",
    durable: false,
    persisted: false,
  });
  expect(fixture.rows.size).toBe(1);
  expect(fixture.insertCount()).toBe(4);
});

test("Action 572 sanitizes schema and database failures without retrying", async () => {
  let inserts = 0;
  const failingDatabase: BoundedShadowCollectorProofAuditDatabase = {
    async insert() {
      inserts += 1;
      return { data: null, error: { code: "42P01" } };
    },
    async findByReceiptId() {
      return { data: null, error: null };
    },
    async latest() {
      return { data: null, error: null };
    },
  };
  expect(await createBoundedShadowCollectorProofAuditStore(failingDatabase).persist(receipt())).toEqual({
    status: "schema_unavailable",
    receipt_id: "proof-receipt-572",
    durable: false,
    persisted: false,
    idempotent: false,
    safe_blocker_category: "schema_unavailable",
  });
  expect(inserts).toBe(1);
  expect(await createBoundedShadowCollectorProofAuditStore(null).persist(receipt())).toMatchObject({
    status: "schema_unavailable",
  });
});

test("Action 572 flag is separate and disabled unless explicitly enabled", () => {
  expect(boundedShadowCollectorProofAuditFlagName).toBe("TURE_BOUNDED_PROOF_DURABLE_AUDIT_ENABLED");
  for (const value of [undefined, null, "", "false", "TRUE", "malformed"]) {
    expect(isBoundedShadowCollectorProofAuditEnabled(value)).toBe(false);
  }
  expect(isBoundedShadowCollectorProofAuditEnabled("true")).toBe(true);
  expect(isBoundedShadowCollectorProofAuditEnabled("1")).toBe(true);
});

test("Action 572 routes are authenticated, bounded, and never invoke provider or token actions", () => {
  const executionRoute = read(executionRoutePath);
  const readRoute = read(readRoutePath);
  const importRoute = read(importRoutePath);
  expect(executionRoute.indexOf("boundedShadowCollectorLatestProofReceiptStore.record(receipt)")).toBeLessThan(
    executionRoute.indexOf("persistBoundedShadowCollectorProofAudit(receipt)"),
  );
  expect(executionRoute).toContain("TURE_BOUNDED_PROOF_DURABLE_AUDIT_ENABLED");
  expect(readRoute).toContain("export async function GET");
  expect(readRoute).toContain("x-automation-secret");
  expect(readRoute).toContain('"Cache-Control": "no-store"');
  expect(readRoute).not.toContain("getIntradayCandlesWithDiagnostics");
  expect(importRoute).toContain("export async function POST");
  expect(importRoute).toContain("x-automation-secret");
  expect(importRoute).toContain("parseBoundedShadowCollectorProofAuditReceipt");
  expect(importRoute).not.toContain("boundedShadowCollectorOperatorAuthorizationStore");
  expect(importRoute).not.toContain("getIntradayCandlesWithDiagnostics");
});

test("Action 572 passive diagnostics expose no client-side durable audit activity", () => {
  expect(buildBoundedShadowCollectorProofAuditDiagnostics()).toMatchObject({
    migration_expected: true,
    feature_flag_state_client_side: "unknown",
    status: "not_observed",
    latest_durable_audit: null,
    browser_route_invocation: false,
    durable_readback_route_present: true,
    import_route_present: true,
    provider_call_inferred_by_client: false,
    token_present_in_diagnostics: false,
    candle_payload_persisted: false,
  });
});
