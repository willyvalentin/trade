import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  INTERNAL_PAPER_OBSERVER_VERSION,
  internalPaperObserverFromUnknown,
} from "@/lib/internal-paper-observer";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const ACCOUNT_ID = "22222222-2222-4222-8222-222222222222";

function observer() {
  return {
    observer_version: INTERNAL_PAPER_OBSERVER_VERSION,
    observed_at: "2026-09-22T15:03:00+00:00",
    owner_user_id: OWNER_ID,
    account_id: ACCOUNT_ID,
    account: {
      status: "ready",
      base_currency: "USD",
      config_version: "pilot-v1",
      state_version: 7,
      strategy_id: "pilot-strategy",
      strategy_version: "1.0.0",
      eligible_symbols: ["AAPL"],
      updated_at: "2026-09-22T15:02:59+00:00",
    },
    engine_health: {
      status: "blocked",
      queued_count: 0,
      leased_count: 0,
      completed_count: 2,
      no_trade_count: 1,
      blocked_count: 1,
      latest_activity_at: "2026-09-22T15:02:59+00:00",
    },
    freshness: {
      latest_activity_at: "2026-09-22T15:02:59+00:00",
      age_seconds: 1,
      classification: "unclassified",
      threshold_seconds: null,
    },
    latest_decision: { decision_kind: "no_trade", no_trade_reason: "insufficient_coverage" },
    pending_orders: [],
    positions: [{ ticker: "AAPL", status: "closed" }],
    accounting: {
      currency: "USD",
      starting_cash: 100_000,
      cash_balance: 99_947.55,
      open_position_cost_basis: 0,
      book_value: 99_947.55,
      marked_equity: null,
      equity_status: "unavailable_without_current_mark",
      realized_gross_pnl: -50,
      realized_net_pnl: -52.45,
      total_commission_paid: 2,
      ledger_entry_count: 5,
      ledger_balance: -52.45,
    },
    latest_realized_result: { ticker: "AAPL", net_pnl: -52.45 },
  };
}

test.describe("SV-D1 read-only internal paper observer", () => {
  test("accepts only the exact owner/account/version and preserves honest unavailable equity", () => {
    const value = observer();
    expect(internalPaperObserverFromUnknown(value, {
      owner_user_id: OWNER_ID,
      account_id: ACCOUNT_ID,
    })).toMatchObject({
      observer_version: INTERNAL_PAPER_OBSERVER_VERSION,
      owner_user_id: OWNER_ID,
      account_id: ACCOUNT_ID,
      accounting: {
        marked_equity: null,
        equity_status: "unavailable_without_current_mark",
      },
      freshness: { classification: "unclassified", threshold_seconds: null },
    });

    expect(internalPaperObserverFromUnknown(
      { ...value, owner_user_id: "33333333-3333-4333-8333-333333333333" },
      { owner_user_id: OWNER_ID, account_id: ACCOUNT_ID },
    )).toBeNull();
    expect(internalPaperObserverFromUnknown(
      { ...value, accounting: { ...value.accounting, marked_equity: 100_001 } },
      { owner_user_id: OWNER_ID, account_id: ACCOUNT_ID },
    )).toBeNull();
    expect(internalPaperObserverFromUnknown(
      { ...value, freshness: { ...value.freshness, classification: "fresh" } },
      { owner_user_id: OWNER_ID, account_id: ACCOUNT_ID },
    )).toBeNull();
    expect(internalPaperObserverFromUnknown(
      { ...value, accounting: { ...value.accounting, cash_balance: null } },
      { owner_user_id: OWNER_ID, account_id: ACCOUNT_ID },
    )).toBeNull();
    expect(internalPaperObserverFromUnknown(
      { ...value, accounting: { ...value.accounting, book_value: 100_000 } },
      { owner_user_id: OWNER_ID, account_id: ACCOUNT_ID },
    )).toBeNull();
  });

  test("keeps the database read model service-role-only, stable and mutation-free", () => {
    const source = readFileSync(resolve(
      process.cwd(),
      "supabase/migrations/20260922073013_sv_d1_internal_paper_observer_read_model.sql",
    ), "utf8").toLowerCase();
    const executableSource = source.replace(/^--.*$/gm, "");

    expect(source).toContain("app_read_internal_paper_observer_v1");
    expect(source).toContain("p_observer_version is distinct from");
    expect(source).toContain("stable");
    expect(source).toContain("security definer");
    expect(source).toContain("set search_path = pg_catalog, public");
    expect(source).toContain("from public, anon, authenticated");
    expect(source).toContain("to service_role");
    expect(source).toContain("'marked_equity', null");
    expect(source).toContain("'threshold_seconds', null");
    expect(executableSource).not.toMatch(/\b(insert|update|delete)\b/);
    expect(executableSource).not.toContain("twelve_data");
    expect(executableSource).not.toContain("broker");
  });

  test("exposes only an authenticated no-store GET and labels unavailable evidence in the UI", () => {
    const route = readFileSync(
      resolve(process.cwd(), "app/api/app/internal-paper-observer/route.ts"),
      "utf8",
    );
    expect(route).toContain("requireApplicationSession()");
    expect(route).toContain('"Cache-Control": "no-store"');
    expect(route).toContain("export async function GET()");
    expect(route).not.toMatch(/export async function (POST|PUT|PATCH|DELETE)/);

    const page = readFileSync(
      resolve(process.cwd(), "app/internal-paper/page.tsx"),
      "utf8",
    );
    expect(page).toContain("requireApplicationPageSession()");
    expect(page).toContain('value="Unavailable"');
    expect(page).toContain("Ture does not invent equity");
    expect(page).toContain("No approved freshness threshold exists");
    expect(page).toContain("Pilot scope");
    expect(page).toContain("cannot place orders");
  });
});
