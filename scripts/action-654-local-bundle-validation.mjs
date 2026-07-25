#!/usr/bin/env node
/** Local-only Action 654 SQL Editor bundle and failure-safety validation. */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const container = `ture-action-654-${process.pid}`;
const temporarySql = join(tmpdir(), `ture-action-654-${process.pid}.sql`);
const bundle = readFileSync(resolve(root, "scripts/action-654-apply-20260724002000.sql"), "utf8");
const readback = readFileSync(resolve(root, "scripts/action-654-production-containment-readback.sql"), "utf8");
const baselineMigrations = [
  "20260519000000_create_legacy_baseline_schema_draft.sql", "20260520000000_add_execution_metadata_to_positions.sql",
  "20260528000000_create_recommendation_snapshots.sql", "20260528001000_create_recommendation_outcomes.sql",
  "20260528002000_create_recommendation_scan_runs.sql", "20260528003000_create_recommendation_batches.sql",
  "20260610000000_execution_audit_foundation.sql", "20260614000000_create_execution_records.sql",
  "20260615000000_create_execution_record_audit_events.sql", "20260615001000_enable_rls_execution_record_audit_events.sql",
  "20260625000000_create_scheduled_scan_attempts.sql", "20260702000000_create_symbol_metadata.sql",
];
const action652Migrations = [
  "20260724001500_create_transactional_open_position_command.sql",
  "20260724001600_create_shared_login_abuse_control.sql",
];

function command(binary, args, options = {}) {
  return execFileSync(binary, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...options });
}
function docker(...args) { return command("docker", args); }
function writeAndApply(sql, expectFailure = false) {
  writeFileSync(temporarySql, sql, "utf8");
  docker("cp", temporarySql, `${container}:/tmp/action-654.sql`);
  try {
    const output = docker("exec", "-e", "PGPASSWORD=postgres", container, "psql", "-X", "-v", "ON_ERROR_STOP=1", "-qAt", "-U", "postgres", "-d", "postgres", "-f", "/tmp/action-654.sql");
    if (expectFailure) throw new Error("expected SQL failure but command succeeded");
    return output.trim();
  } catch (error) {
    if (!expectFailure) throw error;
    return "failed_as_expected";
  }
}
function query(sql) { return writeAndApply(sql); }
function source(path) { return command("git", ["show", `origin/main:supabase/migrations/${path}`]); }
function assert(condition, label) { if (!condition) throw new Error(label); }

async function reset() {
  try { docker("rm", "-f", container); } catch {}
  docker("run", "-d", "--rm", "--name", container, "-e", "POSTGRES_PASSWORD=postgres", "postgres:16-alpine");
  let consecutiveReadyProbes = 0;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      docker("exec", container, "pg_isready", "-U", "postgres", "-d", "postgres");
      const probe = docker("exec", "-e", "PGPASSWORD=postgres", container, "psql", "-X", "-qAt", "-U", "postgres", "-d", "postgres", "-c", "select 1;").trim();
      if (probe !== "1") throw new Error("unexpected PostgreSQL readiness response");
      consecutiveReadyProbes += 1;
      if (consecutiveReadyProbes === 3) break;
    } catch {
      consecutiveReadyProbes = 0;
    }
    if (attempt === 39) throw new Error("PostgreSQL readiness failed");
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  writeAndApply("create extension if not exists pgcrypto; create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls; create schema supabase_migrations; create table supabase_migrations.schema_migrations(version text primary key, statements text[] not null, name text not null);");
  for (const migration of baselineMigrations) writeAndApply(readFileSync(resolve(root, "supabase/migrations", migration), "utf8"));
  for (const migration of action652Migrations) writeAndApply(source(migration));
  writeAndApply("insert into supabase_migrations.schema_migrations(version, statements, name) values ('20260724001500', array['reviewed'], 'create_transactional_open_position_command'), ('20260724001600', array['reviewed'], 'create_shared_login_abuse_control');");
}
async function expectBundleFailure(id, setup) {
  await reset();
  setup();
  const before = query("select relrowsecurity::text from pg_class where oid = 'public.recommendations'::regclass;");
  writeAndApply(bundle, true);
  const after = query("select relrowsecurity::text || ':' || (not exists (select 1 from supabase_migrations.schema_migrations where version = '20260724002000'))::text from pg_class where oid = 'public.recommendations'::regclass;");
  assert(after === `${before}:true`, `partial containment state detected: ${after}`);
  return id;
}

const scenarios = [];
try {
  await reset();
  writeAndApply(bundle);
  assert(query(readback) === "action_650_containment_verified", "happy-path readback failed");
  scenarios.push("happy_path");
  writeAndApply(bundle, true);
  assert(query(readback) === "action_650_containment_verified", "duplicate bundle changed state");
  scenarios.push("duplicate_execution", "duplicate_history_row");

  scenarios.push(await expectBundleFailure("conflicting_function_same_signature", () => query("create function public.action_650_reject_execution_audit_mutation() returns trigger language plpgsql as $$ begin return new; end $$;")));
  scenarios.push(await expectBundleFailure("conflicting_function_wrong_signature", () => query("create function public.action_650_reject_execution_audit_mutation(text) returns text language sql as $$ select $1 $$;")));
  scenarios.push(await expectBundleFailure("conflicting_trigger_same_name", () => query("create function public.action_654_wrong_trigger() returns trigger language plpgsql as $$ begin return new; end $$; create trigger action_650_append_only before update on public.execution_lifecycle_events for each row execute function public.action_654_wrong_trigger();")));
  scenarios.push(await expectBundleFailure("trigger_bound_to_wrong_function", () => query("create function public.action_654_wrong_trigger() returns trigger language plpgsql as $$ begin return new; end $$; create trigger action_650_append_only before delete on public.execution_record_audit_events for each row execute function public.action_654_wrong_trigger();")));
  scenarios.push(await expectBundleFailure("missing_target_table", () => query("drop table public.symbol_metadata;")));
  scenarios.push(await expectBundleFailure("preexisting_action_650_policy", () => query("alter table public.positions enable row level security; create policy action_650_conflict on public.positions for select using (false);")));
  scenarios.push(await expectBundleFailure("forbidden_migration_history", () => query("insert into supabase_migrations.schema_migrations values ('20260708000000', array['forbidden'], 'forbidden');")));
  scenarios.push(await expectBundleFailure("migration_02000_history_present", () => query("insert into supabase_migrations.schema_migrations values ('20260724002000', array['conflict'], 'conflict');")));

  await reset(); writeAndApply(bundle); query("grant select on public.positions to public;"); assert(query(readback) === "blocked_by_browser_role_privilege_contract", "PUBLIC readback detection failed"); scenarios.push("public_privilege_readback");
  await reset(); writeAndApply(bundle); query("grant insert on public.positions to anon;"); assert(query(readback) === "blocked_by_browser_role_privilege_contract", "anon readback detection failed"); scenarios.push("anon_privilege_readback");
  await reset(); writeAndApply(bundle); query("grant update on public.positions to authenticated;"); assert(query(readback) === "blocked_by_browser_role_privilege_contract", "authenticated readback detection failed"); scenarios.push("authenticated_privilege_readback");
  await reset(); writeAndApply(bundle); query("revoke select on public.positions from service_role;"); assert(query(readback) === "blocked_by_service_role_privilege_contract", "service role readback detection failed"); scenarios.push("service_role_privilege_readback");
  await reset(); writeAndApply(bundle); query("alter table public.positions disable row level security;"); assert(query(readback) === "blocked_by_table_or_rls_contract", "RLS readback detection failed"); scenarios.push("rls_readback");
  await reset(); writeAndApply(bundle); query("update supabase_migrations.schema_migrations set statements = array['wrong'] where version = '20260724002000';"); assert(query(readback) === "blocked_by_history_contract", "history count detection failed"); scenarios.push("history_statement_count_readback");
  await reset(); const beforeRollback = query("select relrowsecurity::text from pg_class where oid = 'public.recommendations'::regclass;"); writeAndApply(bundle.replace("  insert into supabase_migrations", "  raise exception 'postcondition injection';\n  insert into supabase_migrations"), true); assert(query("select relrowsecurity::text || ':' || (not exists (select 1 from supabase_migrations.schema_migrations where version = '20260724002000'))::text from pg_class where oid = 'public.recommendations'::regclass;") === `${beforeRollback}:true`, "postcondition rollback changed containment"); scenarios.push("postcondition_rollback");

  console.log(JSON.stringify({ status: "passed", scenarios: scenarios.length, scenario_ids: scenarios, production_interaction: false }));
} finally {
  try { docker("rm", "-f", container); } catch {}
  rmSync(temporarySql, { force: true });
}
