#!/usr/bin/env node
/**
 * Disposable PostgreSQL behavior test for Action 650.
 *
 * It starts a local Docker PostgreSQL instance, applies only the migration
 * subset that owns the contained tables, then proves actual role behavior.
 * It has no Supabase, network, provider, broker, or production code path.
 */
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const migrations = [
  "20260519000000_create_legacy_baseline_schema_draft.sql",
  "20260520000000_add_execution_metadata_to_positions.sql",
  "20260528000000_create_recommendation_snapshots.sql",
  "20260528001000_create_recommendation_outcomes.sql",
  "20260528002000_create_recommendation_scan_runs.sql",
  "20260528003000_create_recommendation_batches.sql",
  "20260610000000_execution_audit_foundation.sql",
  "20260614000000_create_execution_records.sql",
  "20260615000000_create_execution_record_audit_events.sql",
  "20260615001000_enable_rls_execution_record_audit_events.sql",
  "20260625000000_create_scheduled_scan_attempts.sql",
  "20260702000000_create_symbol_metadata.sql",
  "20260724002000_contain_production_trading_data_access.sql",
];

const tables = [
  "recommendations", "positions", "position_updates", "user_settings",
  "scanner_cache", "market_calendar_cache", "market_regime_snapshots",
  "recommendation_batches", "recommendation_outcomes", "recommendation_scan_runs",
  "recommendation_snapshots", "scheduled_scan_runs", "scheduled_scan_attempts",
  "symbol_metadata", "execution_records", "execution_agent_runs",
  "execution_agent_progress_events", "execution_lifecycle_events",
  "execution_record_audit_events",
];

const container = `ture-action-650-${randomUUID().slice(0, 12)}`;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", ...options });
  if (result.status !== 0) {
    throw new Error(`${command} failed: ${(result.stderr || result.stdout || "unknown error").trim()}`);
  }
  return result.stdout;
}

function sql(statement) {
  return run("docker", ["exec", "-i", container, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-c", statement]);
}

function apply(file) {
  const path = resolve(root, "supabase/migrations", file);
  if (!existsSync(path)) throw new Error(`missing migration ${file}`);
  run("docker", ["exec", "-i", container, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres"], { input: readFileSync(path, "utf8") });
}

function expectDenied(statement, label) {
  const result = spawnSync("docker", ["exec", "-i", container, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-c", statement], { encoding: "utf8" });
  if (result.status === 0) throw new Error(`${label} unexpectedly succeeded`);
}

try {
  run("docker", ["run", "-d", "--rm", "--name", container, "-e", "POSTGRES_PASSWORD=postgres", "postgres:16-alpine"]);
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const ready = spawnSync("docker", ["exec", container, "pg_isready", "-U", "postgres"], { encoding: "utf8" });
    if (ready.status === 0) break;
    if (attempt === 29) throw new Error("local PostgreSQL did not become ready");
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
  }

  sql("create extension if not exists pgcrypto; create role anon login; create role authenticated login; create role service_role login bypassrls;");
  for (const file of migrations) apply(file);
  run(
    "docker",
    ["exec", "-i", container, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres"],
    { input: readFileSync(resolve(root, "scripts/action-650-production-catalog-readonly.sql"), "utf8") },
  );

  for (const table of tables) {
    const privileges = sql(`
      select
        has_table_privilege('anon', 'public.${table}', 'select'),
        has_table_privilege('authenticated', 'public.${table}', 'insert'),
        not exists (
          select 1
          from pg_class c
          cross join lateral aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) acl
          where c.oid = 'public.${table}'::regclass
            and acl.grantee = 0
        ),
        has_table_privilege('service_role', 'public.${table}', 'select');
    `);
    if (!/f\s*\|\s*f\s*\|\s*t\s*\|\s*t/u.test(privileges)) {
      throw new Error(`unexpected effective privilege matrix for ${table}`);
    }
    const rls = sql(`select relrowsecurity from pg_class where oid = 'public.${table}'::regclass;`);
    if (!/t/u.test(rls)) throw new Error(`RLS not enabled for ${table}`);
    expectDenied(`set role anon; select 1 from public.${table} limit 1;`, `anon select ${table}`);
    expectDenied(`set role anon; insert into public.${table} default values;`, `anon insert ${table}`);
    expectDenied(`set role anon; update public.${table} set created_at = created_at;`, `anon update ${table}`);
    expectDenied(`set role anon; delete from public.${table};`, `anon delete ${table}`);
    expectDenied(`set role authenticated; select 1 from public.${table} limit 1;`, `authenticated select ${table}`);
    expectDenied(`set role authenticated; insert into public.${table} default values;`, `authenticated insert ${table}`);
    expectDenied(`set role authenticated; update public.${table} set created_at = created_at;`, `authenticated update ${table}`);
    expectDenied(`set role authenticated; delete from public.${table};`, `authenticated delete ${table}`);
  }

  sql("set role service_role; select 1 from public.recommendations limit 1;");
  sql("set role service_role; insert into public.execution_lifecycle_events (event_type) values ('action_650_test'); insert into public.execution_agent_progress_events (event_type) values ('action_650_test');");
  expectDenied("set role service_role; update public.execution_lifecycle_events set message = 'mutated';", "append-only lifecycle update");
  expectDenied("set role service_role; delete from public.execution_agent_progress_events;", "append-only progress delete");

  console.log(JSON.stringify({ status: "passed", tables_tested: tables.length, production_interaction: false }));
} finally {
  spawnSync("docker", ["rm", "-f", container], { encoding: "utf8" });
}
