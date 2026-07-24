import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const migrationFile = "20260724002000_contain_production_trading_data_access.sql";
const migrationPath = resolve(process.cwd(), "supabase/migrations", migrationFile);
const migration = readFileSync(migrationPath, "utf8").replace(/\r\n/g, "\n");
const localRoleTest = readFileSync(
  resolve(process.cwd(), "scripts/action-650-local-db-security-test.mjs"),
  "utf8",
);
const catalogInspection = readFileSync(
  resolve(process.cwd(), "scripts/action-650-production-catalog-readonly.sql"),
  "utf8",
);
const tables = [
  "recommendations", "positions", "position_updates", "user_settings",
  "scanner_cache", "market_calendar_cache", "market_regime_snapshots",
  "recommendation_batches", "recommendation_outcomes", "recommendation_scan_runs",
  "recommendation_snapshots", "scheduled_scan_runs", "scheduled_scan_attempts",
  "symbol_metadata", "execution_records", "execution_agent_runs",
  "execution_agent_progress_events", "execution_lifecycle_events",
  "execution_record_audit_events",
];
const forbiddenMigrations = [
  "20260708000000_post_trade_persistence_schema_draft.sql",
  "20260708001000_harden_post_trade_execution_grants_draft.sql",
  "20260710000000_create_execution_authorization_consumptions.sql",
];

test("Action 650 contains every exposed trading table behind a server-only boundary", () => {
  for (const table of tables) {
    expect(migration).toContain(`'${table}'`);
    expect(migration).toContain("revoke all privileges on table public.%I from public, anon, authenticated");
    expect(migration).toContain("grant all privileges on table public.%I to service_role");
    expect(migration).toContain("alter table public.%I enable row level security");
  }
  expect(migration).toContain("drop policy %I on public.%I");
  expect(migration).not.toMatch(/using\s*\(\s*true\s*\)|with\s+check\s*\(\s*true\s*\)/iu);
});

test("Action 650 structurally enforces append-only execution event tables", () => {
  expect(migration).toContain("action_650_reject_execution_audit_mutation");
  for (const table of [
    "execution_record_audit_events",
    "execution_lifecycle_events",
    "execution_agent_progress_events",
  ]) {
    expect(migration).toContain(`'${table}'`);
  }
  expect(migration).toContain("before update or delete");
  expect(migration).toContain("security invoker");
  expect(migration).toContain("set search_path = pg_catalog");
});

test("the disposable local behavior harness uses only the intended migration subset", () => {
  expect(localRoleTest).toContain('"postgres:16-alpine"');
  expect(localRoleTest).toContain("has_table_privilege('anon'");
  expect(localRoleTest).toContain("set role anon");
  expect(localRoleTest).toContain("set role authenticated");
  expect(localRoleTest).toContain("set role service_role");
  expect(localRoleTest).toContain("production_interaction: false");
  for (const migrationName of forbiddenMigrations) {
    expect(localRoleTest).not.toContain(migrationName);
  }
  expect(localRoleTest).not.toMatch(/supabase\s+db\s+push|fetch\s*\(|https?:\/\//iu);
});

test("Action 650 is a new forward migration and does not alter prohibited local-only drafts", () => {
  const migrationFiles = readdirSync(resolve(process.cwd(), "supabase/migrations"));
  expect(migrationFiles).toContain(migrationFile);
  for (const migrationName of forbiddenMigrations) {
    expect(migration).not.toContain(migrationName);
  }
});

test("the production inventory query is catalog-only and contains no data mutation", () => {
  expect(catalogInspection).toContain("pg_class");
  expect(catalogInspection).toContain("pg_policies");
  expect(catalogInspection).toContain("has_table_privilege");
  expect(catalogInspection).not.toMatch(/\b(insert|update|delete|alter|create|drop|grant|revoke)\b/iu);
});
