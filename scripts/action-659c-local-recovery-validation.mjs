#!/usr/bin/env node
/** Local-only Action 659C recovery round-trip and failure-safety harness. */
import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const container = `ture-action-659c-${randomUUID().slice(0, 12)}`;
const temporarySql = join(tmpdir(), `ture-action-659c-${process.pid}.sql`);
const requestedMode = process.argv[2] ?? "all";
const explicitPath = process.argv[4] ?? null;
const runPath = requestedMode === "run-a" ? "source" : requestedMode === "run-b" ? "bundle" : null;
const executionPath = runPath ?? (explicitPath === "source" || explicitPath === "bundle" ? explicitPath : null);
const group = runPath ? "all" : requestedMode;
const scenarioId = runPath ? null : process.argv[3] ?? null;
const resultPath = join(tmpdir(), `ture-action-659c-${requestedMode}-${scenarioId ?? "all"}-result.json`);
const paths = {
  containment: "supabase/migrations/20260724002000_contain_production_trading_data_access.sql",
  recovery: "supabase/incident-recovery/20260724003000-action-650-containment/recovery.sql",
  bundle: "supabase/incident-recovery/20260724003000-action-650-containment/sql-editor-bundle.sql",
  containmentReadback: "scripts/action-654-production-containment-readback.sql",
  recoveryReadback: "supabase/incident-recovery/20260724003000-action-650-containment/readback.sql",
};
const expectedDigests = {
  recovery: "6acc1d44fc588f2d8d1e3fa631e83f1233994a7821c15cff92aa0efe40e10ac6",
  bundle: "f996ec6a12b0a0f8956218dd473049a4746419afc6b7aff549d57ee588f34675",
  recoveryReadback: "6edc4a6b169b04e8d65b6bb4a227a7ec5c5c2f96724c7aa45c126f08da95046d",
};
const baselineMigrations = [
  "20260519000000_create_legacy_baseline_schema_draft.sql", "20260520000000_add_execution_metadata_to_positions.sql",
  "20260528000000_create_recommendation_snapshots.sql", "20260528001000_create_recommendation_outcomes.sql",
  "20260528002000_create_recommendation_scan_runs.sql", "20260528003000_create_recommendation_batches.sql",
  "20260610000000_execution_audit_foundation.sql", "20260614000000_create_execution_records.sql",
  "20260615000000_create_execution_record_audit_events.sql", "20260615001000_enable_rls_execution_record_audit_events.sql",
  "20260625000000_create_scheduled_scan_attempts.sql", "20260702000000_create_symbol_metadata.sql",
  "20260724001500_create_transactional_open_position_command.sql", "20260724001600_create_shared_login_abuse_control.sql",
];
const targetTables = [
  "recommendations", "positions", "position_updates", "user_settings", "scanner_cache", "market_calendar_cache",
  "market_regime_snapshots", "recommendation_batches", "recommendation_outcomes", "recommendation_scan_runs",
  "recommendation_snapshots", "scheduled_scan_runs", "scheduled_scan_attempts", "symbol_metadata", "execution_records",
  "execution_agent_runs", "execution_agent_progress_events", "execution_lifecycle_events", "execution_record_audit_events",
];
const productionShapedOutOfScopeTables = [
  "continuous_intelligence_credit_ledger", "ci_hur_reconciliations", "continuous_intelligence_shadow_canary_claims",
  "continuous_intelligence_shadow_canary_audit", "continuous_intelligence_shadow_canary_usage",
  "continuous_intelligence_scheduled_occurrences", "continuous_intelligence_scheduled_outcomes", "historical_candle_bars",
  "historical_candle_sync_runs", "historical_candle_symbols",
];
const unrelatedOutOfScopeTable = "action_661c_unrelated_public_table";
const outOfScopeTables = [...productionShapedOutOfScopeTables, unrelatedOutOfScopeTable];
const productionShapedOutOfScopeSetup = outOfScopeTables.map((tableName, index) => [
  `create table public.${tableName}(id bigint primary key, marker text not null)`,
  `insert into public.${tableName}(id, marker) values (${index + 1}, '${tableName}')`,
  `alter table public.${tableName} enable row level security`,
  `create policy action_661c_out_of_scope_${index + 1} on public.${tableName} for select using (true)`,
].join("; ")).join("; ");
const bundle = readFileSync(resolve(root, paths.bundle), "utf8");
const source = readFileSync(resolve(root, paths.recovery), "utf8");
const containment = readFileSync(resolve(root, paths.containment), "utf8");
const containmentReadback = readFileSync(resolve(root, paths.containmentReadback), "utf8");
const recoveryReadback = readFileSync(resolve(root, paths.recoveryReadback), "utf8");

function command(binary, args, options = {}) {
  return execFileSync(binary, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...options });
}
function docker(...args) { return command("docker", args); }
function sql(statement, expectedFailure = false) {
  writeFileSync(temporarySql, statement, "utf8");
  docker("cp", temporarySql, `${container}:/tmp/action-659c.sql`);
  try {
    const output = docker("exec", "-e", "PGPASSWORD=postgres", container, "psql", "-X", "-v", "ON_ERROR_STOP=1", "-qAt", "-U", "postgres", "-d", "postgres", "-f", "/tmp/action-659c.sql");
    if (expectedFailure) throw new Error("expected failure but SQL succeeded");
    return output.trim();
  } catch (error) {
    if (!expectedFailure) throw error;
    return "failed_as_expected";
  }
}
function assert(condition, label) { if (!condition) throw new Error(label); }
function migration(name) { return readFileSync(resolve(root, "supabase/migrations", name), "utf8"); }
function digest(value) { return createHash("sha256").update(value).digest("hex"); }
function assertReadOnly(sqlText) {
  const withoutComments = sqlText.replace(/--.*$/gm, "");
  const withoutStrings = withoutComments
    .replace(/\$[A-Za-z_][A-Za-z0-9_]*\$[\s\S]*?\$[A-Za-z_][A-Za-z0-9_]*\$/g, "$$")
    .replace(/'(?:''|[^'])*'/g, "''");
  const statements = withoutStrings.split(";").map((statement) => statement.trim()).filter(Boolean);
  assert(statements.length === 1 && /^(with|select)\b/i.test(statements[0]), "readback contains an executable mutation statement");
}
function assertRecoveryStructure() {
  for (const artifact of [source, bundle]) {
    assert(/begin;[\s\S]*pg_advisory_xact_lock\(65920260724003000\)[\s\S]*commit;/i.test(artifact), "recovery transaction/advisory-lock contract missing");
    assert(!/create\s+or\s+replace/i.test(artifact), "recovery artifact contains CREATE OR REPLACE");
    assert(!/grant\s+.*\s+to\s+(anon|authenticated|public)/i.test(artifact), "recovery artifact restores browser access");
  }
  assert(bundle.indexOf("insert into supabase_migrations.schema_migrations") > bundle.indexOf("Action 659B postcondition failed"), "bundle history precedes postconditions");
}
function applyRecovery(kind, mutatedBundle = bundle) {
  if (kind === "bundle") return sql(mutatedBundle);
  sql(source);
  sql("insert into supabase_migrations.schema_migrations(version, statements, name) values ('20260724003000', array['repair_contained_trading_data_access_acl_rls'], 'repair_contained_trading_data_access_acl_rls');");
  return "source_applied";
}
function snapshot() {
  return sql(`
    with targets(table_name) as (values ${targetTables.map((name) => `('${name}')`).join(",")})
    select md5(
      coalesce((select string_agg(targets.table_name || ':' || coalesce(classes.relowner::text, 'missing') || ':' || coalesce(classes.relrowsecurity::text, 'missing') || ':' || coalesce(classes.relacl::text, ''), '|' order by targets.table_name) from targets left join pg_class classes on classes.oid = to_regclass(format('public.%I', targets.table_name))), '') ||
      coalesce((select string_agg(classes.relname || '.' || attributes.attname || ':' || coalesce(attributes.attacl::text, ''), '|' order by classes.relname, attributes.attnum) from pg_class classes join pg_namespace namespaces on namespaces.oid = classes.relnamespace join pg_attribute attributes on attributes.attrelid = classes.oid where namespaces.nspname = 'public' and classes.relname = any(array[${targetTables.map((name) => `'${name}'`).join(",")}]) and attributes.attnum > 0 and not attributes.attisdropped), '') ||
      coalesce((select string_agg(roleid::text || ':' || member::text || ':' || admin_option::text, '|' order by roleid, member) from pg_auth_members), '') ||
      coalesce((select string_agg(schemaname || ':' || tablename || ':' || policyname || ':' || permissive || ':' || roles::text || ':' || cmd || ':' || coalesce(qual, '') || ':' || coalesce(with_check, ''), '|' order by schemaname, tablename, policyname) from pg_policies where schemaname = 'public'), '') ||
      coalesce((select string_agg(version || ':' || name || ':' || cardinality(statements)::text, '|' order by version) from supabase_migrations.schema_migrations), '') ||
      coalesce((select string_agg(tgrelid::regclass::text || ':' || tgname || ':' || tgfoid::regprocedure::text || ':' || tgtype::text || ':' || tgenabled::text, '|' order by tgrelid, tgname) from pg_trigger where not tgisinternal), '') ||
      coalesce((select string_agg(oid::regprocedure::text || ':' || proowner::text || ':' || prosecdef::text || ':' || coalesce(array_to_string(proconfig, ','), '') || ':' || md5(prosrc), '|' order by oid) from pg_proc where oid in (to_regprocedure('public.action_650_reject_execution_audit_mutation()'), to_regprocedure('public.app_open_position_transaction(uuid,text,text,numeric,numeric,numeric,numeric,numeric,jsonb,text)'), to_regprocedure('public.app_login_abuse_reserve(text)'), to_regprocedure('public.app_login_abuse_finalize_success(text)'))), '')
    );
  `);
}
function outOfScopeSnapshot() {
  const relationNames = outOfScopeTables.map((name) => `'${name}'`).join(",");
  const dataRows = outOfScopeTables.map((name) => `select '${name}'::text as table_name, id, marker from public.${name}`).join(" union all ");
  return sql(`
    with relations as (
      select coalesce(string_agg(
        classes.relname || ':' || classes.relkind::text || ':' || classes.relowner::text || ':' || classes.relrowsecurity::text || ':' || coalesce(classes.relacl::text, ''),
        '|' order by classes.relname
      ), '') as value
      from pg_class classes
      join pg_namespace namespaces on namespaces.oid = classes.relnamespace
      where namespaces.nspname = 'public' and classes.relname = any(array[${relationNames}])
    ), policies as (
      select coalesce(string_agg(policyname || ':' || tablename || ':' || cmd || ':' || coalesce(qual, ''), '|' order by tablename, policyname), '') as value
      from pg_policies where schemaname = 'public' and tablename = any(array[${relationNames}])
    ), rows as (
      select coalesce(string_agg(table_name || ':' || id::text || ':' || marker, '|' order by table_name, id), '') as value
      from (${dataRows}) out_of_scope_rows
    )
    select md5(relations.value || policies.value || rows.value) from relations, policies, rows;
  `);
}
function assertContained(label) {
  assert(sql(containmentReadback) === "action_650_containment_verified", `${label}: Action 650 readback`);
  assert(sql(recoveryReadback) === "action_659b_recovery_verified", `${label}: Action 659B readback`);
  assert(sql("select count(*)::text from supabase_migrations.schema_migrations where version = '20260724003000' and name = 'repair_contained_trading_data_access_acl_rls' and cardinality(statements) = 1;") === "1", `${label}: recovery history`);
}
async function reset() {
  try { docker("rm", "-f", container); } catch {}
  docker("run", "-d", "--rm", "--name", container, "-e", "POSTGRES_PASSWORD=postgres", "postgres:16-alpine");
  let consecutiveReadyProbes = 0;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      docker("exec", container, "pg_isready", "-U", "postgres", "-d", "postgres");
      const probe = docker("exec", "-e", "PGPASSWORD=postgres", container, "psql", "-X", "-qAt", "-U", "postgres", "-d", "postgres", "-c", "select 1;").trim();
      if (probe !== "1") throw new Error("unexpected PostgreSQL readiness response");
      consecutiveReadyProbes += 1;
      if (consecutiveReadyProbes === 2) break;
    } catch {
      consecutiveReadyProbes = 0;
    }
    if (attempt === 79) throw new Error("PostgreSQL readiness timeout");
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  sql("create extension if not exists pgcrypto; create role anon login; create role authenticated login; create role service_role login bypassrls; create role authenticator login; grant anon, authenticated, service_role to authenticator with inherit false, set true, admin false; grant anon, authenticated, service_role to postgres with inherit true, set true, admin true; create schema supabase_migrations; create table supabase_migrations.schema_migrations(version text primary key, statements text[] not null, name text not null);");
  for (const name of baselineMigrations) sql(migration(name));
  sql("insert into supabase_migrations.schema_migrations(version, statements, name) values ('20260724001500', array['reviewed'], 'create_transactional_open_position_command'), ('20260724001600', array['reviewed'], 'create_shared_login_abuse_control');");
  sql(containment);
  sql("insert into supabase_migrations.schema_migrations(version, statements, name) values ('20260724002000', array['one','two','three','four','five','six'], 'contain_production_trading_data_access');");
  assert(sql(containmentReadback) === "action_650_containment_verified", "canonical post-02000 baseline");
}

const supported = [
  ["missing_service_role_dml", "revoke select on public.positions from service_role;", "bundle"],
  ["broad_service_role_access", "grant truncate on public.positions to service_role;", "bundle"],
  ["anon_access_restored", "grant select on public.positions to anon;", "bundle"],
  ["authenticated_access_restored", "grant select on public.positions to authenticated;", "bundle"],
  ["public_access_restored", "grant select on public.positions to public;", "bundle"],
  ["rls_disabled", "alter table public.positions disable row level security;", "bundle"],
  ["combined_acl_rls_drift", "grant select on public.positions to anon; grant truncate on public.positions to service_role; alter table public.positions disable row level security;", "source"],
];
const failures = [
  ["missing_02000_history", "delete from supabase_migrations.schema_migrations where version = '20260724002000';"],
  ["03000_history_present", "insert into supabase_migrations.schema_migrations(version, statements, name) values ('20260724003000', array['marker'], 'repair_contained_trading_data_access_acl_rls');"],
  ["forbidden_history", "insert into supabase_migrations.schema_migrations(version, statements, name) values ('20260708000000', array['forbidden'], 'forbidden');"],
  ["recovery_not_required", ""],
  ["missing_target_table", "drop table public.symbol_metadata;"],
  ["renamed_target_table", "alter table public.positions rename to action_661c_positions_renamed;"],
  ["owner_drift", "alter table public.positions owner to service_role; grant select on public.positions to anon;"],
  ["policy_drift", "create policy action_659c_unexpected_policy on public.positions for select using (false);"],
  ["missing_append_only_function", "drop trigger action_650_append_only on public.execution_record_audit_events; drop trigger action_650_append_only on public.execution_lifecycle_events; drop trigger action_650_append_only on public.execution_agent_progress_events; drop function public.action_650_reject_execution_audit_mutation();"],
  ["missing_append_only_trigger", "drop trigger action_650_append_only on public.execution_lifecycle_events;"],
  ["altered_append_only_trigger", "drop trigger action_650_append_only on public.execution_lifecycle_events; create trigger action_650_append_only before update on public.execution_lifecycle_events for each row execute function public.action_650_reject_execution_audit_mutation();"],
  ["action_652_rpc_drift", "alter function public.app_login_abuse_reserve(text) set search_path = pg_catalog;"],
  ["forced_postcondition_failure", "grant select on public.positions to anon;"],
  ["forced_bundle_pre_history_failure", "grant select on public.positions to anon;"],
];
const expectedFailures = new Set(failures.map(([id]) => id));
const unknownDriftFailures = [
  ["altered_append_only_function", "create or replace function public.action_650_reject_execution_audit_mutation() returns trigger language plpgsql security invoker set search_path = pg_catalog as $$ begin raise exception 'Action 650 append-only containment rejects % on %.%', tg_op, tg_table_schema, tg_table_name; perform 1; end; $$; grant select on public.positions to anon;"],
  ["altered_append_only_function_source", "create or replace function public.action_650_reject_execution_audit_mutation() returns trigger language plpgsql security invoker set search_path = pg_catalog as $$ begin raise exception 'Action 650 append-only containment rejects % on %.%', tg_op, tg_table_schema, tg_table_name; perform 1; end; $$; grant select on public.positions to anon;", "source"],
  ["unknown_append_only_trigger", "create function public.action_659c_unknown_trigger() returns trigger language plpgsql as $$ begin return new; end; $$; create trigger action_659c_unknown_trigger before update on public.execution_lifecycle_events for each row execute function public.action_659c_unknown_trigger(); grant select on public.positions to anon;"],
  ["unknown_append_only_trigger_source", "create function public.action_659c_unknown_trigger() returns trigger language plpgsql as $$ begin return new; end; $$; create trigger action_659c_unknown_trigger before update on public.execution_lifecycle_events for each row execute function public.action_659c_unknown_trigger(); grant select on public.positions to anon;", "source"],
  ["unknown_role_select_bundle", "create role action_659c_unknown_select login; grant select on public.positions to action_659c_unknown_select; grant select on public.positions to anon;", "bundle"],
  ["unknown_role_select_source", "create role action_659c_unknown_select login; grant select on public.positions to action_659c_unknown_select; grant select on public.positions to anon;", "source"],
  ["unknown_role_dml", "create role action_659c_unknown_dml login; grant update on public.positions to action_659c_unknown_dml; grant select on public.positions to anon;"],
  ["unknown_role_column_privilege", "create role action_659c_unknown_column login; grant select (id) on public.positions to action_659c_unknown_column; grant select on public.positions to anon;"],
  ["unknown_role_column_privilege_source", "create role action_659c_unknown_column login; grant select (id) on public.positions to action_659c_unknown_column; grant select on public.positions to anon;", "source"],
  ["known_role_column_privilege", "grant select (id) on public.positions to anon; grant select on public.positions to service_role;"],
  ["unknown_runtime_membership", "create role action_659c_unknown_member login; grant service_role to action_659c_unknown_member; grant select on public.positions to anon;"],
  ["unknown_runtime_membership_noinherit", "create role action_661c_unknown_noinherit noinherit login; grant service_role to action_661c_unknown_noinherit with inherit false, set true, admin false; grant select on public.positions to anon;"],
  ["unknown_runtime_membership_inherit", "create role action_661c_unknown_inherit inherit login; grant service_role to action_661c_unknown_inherit with inherit true, set false, admin false; grant select on public.positions to anon;"],
];
const unknownAclSuccess = [
  ["verified_platform_memberships", "grant select on public.positions to anon;", "bundle"],
  ["production_shaped_intelligence_tables", `${productionShapedOutOfScopeSetup}; grant select on public.positions to anon;`, "bundle"],
  ["production_shaped_intelligence_tables_source", `${productionShapedOutOfScopeSetup}; grant select on public.positions to anon;`, "source"],
  ["unknown_role_without_privileges", "create role action_659c_unknown_no_acl login; grant select on public.positions to anon;", "bundle"],
  ["table_owner_column_privilege", "grant select (id) on public.positions to postgres; grant select on public.positions to anon;", "bundle"],
  ["table_owner_column_privilege_source", "grant select (id) on public.positions to postgres; grant select on public.positions to anon;", "source"],
  ["irrelevant_schema_table", "create schema action_659c_irrelevant; create table action_659c_irrelevant.supporting_state(id bigint); grant select on public.positions to anon;", "bundle"],
  ["whitespace_equivalent_append_only_function", "create or replace function public.action_650_reject_execution_audit_mutation() returns trigger language plpgsql security invoker set search_path = pg_catalog as $$ begin    raise exception 'Action 650 append-only containment rejects % on %.%', tg_op, tg_table_schema, tg_table_name using errcode = '55000'; end; $$; grant select on public.positions to anon;", "bundle"],
  ["internal_constraint_trigger", "alter table public.execution_lifecycle_events add constraint action_659c_internal_fk foreign key (id) references public.execution_lifecycle_events(id); grant select on public.positions to anon;", "bundle"],
  ["public_view_sequence_extension", "create view public.action_659c_scope_view as select 1 as id; create sequence public.action_659c_scope_sequence; create extension if not exists pgcrypto; grant select on public.positions to anon;", "bundle"],
  ["documented_login_limiter_exception", "grant select on public.positions to anon;", "bundle"],
];

function artifactForFailure(id, kind) {
  if (id === "forced_postcondition_failure") {
    return kind === "source"
      ? source.replace("\nend\n$action_659b$;", "\n  raise exception 'forced Action 659C postcondition failure';\nend\n$action_659b$;")
      : bundle.replace("  insert into supabase_migrations", "  raise exception 'forced Action 659C postcondition failure';\n  insert into supabase_migrations");
  }
  if (id === "forced_bundle_pre_history_failure") {
    return kind === "source"
      ? source.replace("\nend\n$action_659b$;", "\n  raise exception 'forced Action 659C source pre-history failure';\nend\n$action_659b$;")
      : bundle.replace("  insert into supabase_migrations", "  raise exception 'forced Action 659C bundle pre-history failure';\n  insert into supabase_migrations");
  }
  return kind === "source" ? source : bundle;
}

const results = [];
try {
  assert(digest(source) === expectedDigests.recovery, "frozen recovery source digest changed");
  assert(digest(bundle) === expectedDigests.bundle, "frozen recovery bundle digest changed");
  assert(digest(recoveryReadback) === expectedDigests.recoveryReadback, "frozen recovery readback digest changed");
  assertReadOnly(recoveryReadback);
  assertRecoveryStructure();

  const dedupeForPath = (entries) => executionPath ? entries.filter(([id]) => !id.endsWith("_source")) : entries;
  const selectedSupported = group === "all" || group === "supported" ? dedupeForPath(supported) : [];
  const selectedFailures = group === "all" || group === "failures" ? dedupeForPath(failures) : [];
  const selectedUnknownFailures = group === "all" || group === "unknown" ? dedupeForPath(unknownDriftFailures) : [];
  const selectedUnknownSuccess = group === "all" || group === "unknown" ? dedupeForPath(unknownAclSuccess) : [];
  assert(["all", "supported", "failures", "unknown"].includes(group), `unknown validation group ${group}`);
  const matches = (entry) => scenarioId === null || entry[0] === scenarioId;
  const selected = [
    ...selectedSupported.filter(matches),
    ...selectedFailures.filter(matches),
    ...selectedUnknownFailures.filter(matches),
    ...selectedUnknownSuccess.filter(matches),
  ];
  assert(selected.length > 0, `unknown scenario ${scenarioId}`);
  for (const [id, injection, kind] of selectedSupported.filter(matches)) {
    await reset(); sql(injection); assert(sql(recoveryReadback) === "action_659b_acl_rls_recovery_ready", `${id}: ready readback`); applyRecovery(executionPath ?? kind); assertContained(id); results.push({ id, expected: "repaired", actual: "repaired", pass: true });
  }
  for (const [id, injection] of selectedFailures.filter(matches)) {
    await reset(); if (injection) sql(injection); const before = snapshot(); sql(artifactForFailure(id, executionPath ?? "bundle"), true); const after = snapshot(); const history = sql("select count(*)::text from supabase_migrations.schema_migrations where version = '20260724003000';"); assert(before === after, `${id}: partial state changed`); assert(history === (id === "03000_history_present" ? "1" : "0"), `${id}: history changed`); results.push({ id, expected: "rejected", actual: "rejected", pass: true });
  }
  for (const [id, injection, kind = "bundle"] of selectedUnknownFailures.filter(matches)) {
    await reset(); sql(injection); const before = snapshot(); const outcome = sql((executionPath ?? kind) === "source" ? source : bundle, true); const after = snapshot(); const history = sql("select count(*)::text from supabase_migrations.schema_migrations where version = '20260724003000';"); const accepted = outcome !== "failed_as_expected" || history === "1" || before !== after; results.push({ id, expected: "rejected", actual: accepted ? "accepted" : "rejected", pass: !accepted });
  }
  for (const [id, injection, kind] of selectedUnknownSuccess.filter(matches)) {
    await reset(); sql(injection); const beforeOutOfScope = id.startsWith("production_shaped_intelligence_tables") ? outOfScopeSnapshot() : null; assert(sql(recoveryReadback) === "action_659b_acl_rls_recovery_ready", `${id}: ready readback`); applyRecovery(executionPath ?? kind); assertContained(id); if (beforeOutOfScope !== null) assert(outOfScopeSnapshot() === beforeOutOfScope, `${id}: out-of-scope relations changed`); results.push({ id, expected: "repaired", actual: "repaired", pass: true });
  }

  const failed = results.filter((result) => !result.pass);
  const report = {
    status: failed.length === 0 ? "passed" : "failed",
    group: requestedMode,
    scenario_id: scenarioId,
    scenario_count: results.length,
    assertions: results.length * 4 + supported.length * 3,
    supported: supported.length,
    expected_failure_scenarios: expectedFailures.size,
    unknown_drift_scenarios: unknownDriftFailures.length + unknownAclSuccess.length,
    execution_path: executionPath ?? "mixed",
    results,
    result_set_digest: digest(JSON.stringify(results)),
    failed_ids: failed.map((result) => result.id),
    production_interaction: false,
  };
  writeFileSync(resultPath, JSON.stringify(report), "utf8");
  console.log(JSON.stringify(report));
  process.exitCode = failed.length === 0 ? 0 : 1;
} finally {
  try { docker("rm", "-f", container); } catch {}
  rmSync(temporarySql, { force: true });
}
