#!/usr/bin/env node
/**
 * Disposable effective-role validation for Action 650.
 *
 * The harness uses only a local Docker PostgreSQL instance. It deliberately
 * checks the full table ACL matrix rather than relying on a successful
 * migration replay as evidence of browser-role containment.
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
const privileges = ["select", "insert", "update", "delete", "truncate", "references", "trigger"];
const containedRoles = ["anon", "authenticated"];
const serviceRolePrivileges = new Set(["select", "insert", "update", "delete"]);
const container = `ture-action-650-${randomUUID().slice(0, 12)}`;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", ...options });
  if (result.status !== 0) {
    throw new Error(`${command} failed: ${(result.stderr || result.stdout || "unknown error").trim()}`);
  }
  return result.stdout;
}

function sql(statement, allowFailure = false) {
  const result = spawnSync(
    "docker",
    ["exec", "-i", container, "psql", "-X", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-qAt", "-c", statement],
    { encoding: "utf8" },
  );
  if (!allowFailure && result.status !== 0) {
    throw new Error(`SQL failed: ${(result.stderr || result.stdout || "unknown error").trim()}`);
  }
  return result;
}

function apply(file) {
  const path = resolve(root, "supabase/migrations", file);
  if (!existsSync(path)) throw new Error(`missing migration ${file}`);
  run(
    "docker",
    ["exec", "-i", container, "psql", "-X", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres"],
    { input: readFileSync(path, "utf8") },
  );
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, received ${actual}`);
}

function assertDenied(statement, label) {
  if (sql(statement, true).status === 0) throw new Error(`${label} unexpectedly succeeded`);
}

try {
  run("docker", ["run", "-d", "--rm", "--name", container, "-e", "POSTGRES_PASSWORD=postgres", "postgres:16-alpine"]);
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (sql("select 1;", true).status === 0) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
      if (sql("select 1;", true).status === 0) break;
    }
    if (attempt === 39) throw new Error("local PostgreSQL did not become ready");
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
  }

  sql("create extension if not exists pgcrypto; create role anon login; create role authenticated login; create role service_role login bypassrls;");
  for (const file of migrations) apply(file);

  let catalogChecks = 0;
  let effectiveChecks = 0;
  for (const table of tables) {
    const relation = `public.${table}`;
    assertEqual(sql(`select relrowsecurity::text from pg_class where oid = '${relation}'::regclass;`).stdout.trim(), "true", `RLS ${table}`);
    catalogChecks += 1;

    for (const privilege of privileges) {
      const publicGrant = sql(`
        select exists (
          select 1
          from pg_class classes
          cross join lateral aclexplode(coalesce(classes.relacl, acldefault('r', classes.relowner))) acl
          where classes.oid = '${relation}'::regclass
            and acl.grantee = 0
            and acl.privilege_type = upper('${privilege}')
        )::text;
      `).stdout.trim();
      assertEqual(publicGrant, "false", `PUBLIC ${privilege} ${table}`);
      catalogChecks += 1;

      for (const role of containedRoles) {
        assertEqual(sql(`select has_table_privilege('${role}', '${relation}', '${privilege}')::text;`).stdout.trim(), "false", `${role} ${privilege} ${table}`);
        assertEqual(sql(`set local role ${role}; select has_table_privilege(current_user, '${relation}', '${privilege}')::text;`).stdout.trim(), "false", `effective ${role} ${privilege} ${table}`);
        catalogChecks += 1;
        effectiveChecks += 1;
      }

      const expectedService = serviceRolePrivileges.has(privilege) ? "true" : "false";
      assertEqual(sql(`select has_table_privilege('service_role', '${relation}', '${privilege}')::text;`).stdout.trim(), expectedService, `service_role ${privilege} ${table}`);
      assertEqual(sql(`set local role service_role; select has_table_privilege(current_user, '${relation}', '${privilege}')::text;`).stdout.trim(), expectedService, `effective service_role ${privilege} ${table}`);
      catalogChecks += 1;
      effectiveChecks += 1;
    }

    assertEqual(sql(`select count(*)::text from pg_policies where schemaname = 'public' and tablename = '${table}';`).stdout.trim(), "0", `policies ${table}`);
    catalogChecks += 1;
    for (const statement of [
      `set role anon; select 1 from ${relation} limit 1;`,
      `set role anon; insert into ${relation} default values;`,
      `set role anon; update ${relation} set created_at = created_at;`,
      `set role anon; delete from ${relation};`,
      `set role authenticated; select 1 from ${relation} limit 1;`,
      `set role authenticated; insert into ${relation} default values;`,
      `set role authenticated; update ${relation} set created_at = created_at;`,
      `set role authenticated; delete from ${relation};`,
    ]) {
      assertDenied(statement, `DML containment ${table}`);
      effectiveChecks += 1;
    }
  }

  sql("set role service_role; select 1 from public.recommendations limit 1;");
  sql("set role service_role; insert into public.execution_lifecycle_events (event_type) values ('action_650_test'); insert into public.execution_agent_progress_events (event_type) values ('action_650_test');");
  assertDenied("set role service_role; update public.execution_lifecycle_events set message = 'mutated';", "append-only lifecycle update");
  assertDenied("set role service_role; delete from public.execution_agent_progress_events;", "append-only progress delete");

  console.log(JSON.stringify({
    status: "passed",
    tables_tested: tables.length,
    roles_tested: 4,
    privileges_tested: privileges.length,
    catalog_checks: catalogChecks,
    effective_checks: effectiveChecks,
    skipped_checks: 0,
    production_interaction: false,
  }));
} finally {
  spawnSync("docker", ["rm", "-f", container], { encoding: "utf8" });
}
