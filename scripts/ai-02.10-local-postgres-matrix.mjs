#!/usr/bin/env node
/**
 * AI-02.10 disposable PostgreSQL acceptance matrix.
 *
 * It starts one local Docker PostgreSQL container, establishes a minimal v1
 * sentinel, applies only the local v2 migration, and verifies catalog,
 * privileges, append-only behavior, constraint rejection and rollback. It
 * never links to or contacts Supabase, staging, production, or a provider.
 */
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const migrationName =
  "20260906180346_create_canonical_active_evaluation_evidence.sql";
const migrationPath = resolve(root, "supabase/migrations", migrationName);
const migrationSql = readFileSync(migrationPath, "utf8");
const relation = "public.canonical_active_evaluation_evidence";
const container = `ture-ai-02-10-${randomUUID().slice(0, 12)}`;
const matrix = [];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} failed: ${(result.stderr || result.stdout || "unknown error").trim()}`,
    );
  }
  return result.stdout;
}

function sql(statement, allowFailure = false) {
  const result = spawnSync(
    "docker",
    [
      "exec",
      "-i",
      container,
      "psql",
      "-X",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-qAt",
      "-c",
      statement,
    ],
    { encoding: "utf8" },
  );
  if (!allowFailure && result.status !== 0) {
    throw new Error(
      `SQL failed: ${(result.stderr || result.stdout || "unknown error").trim()}`,
    );
  }
  return result;
}

function applySql(text, label) {
  const result = spawnSync(
    "docker",
    [
      "exec",
      "-i",
      container,
      "psql",
      "-X",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-q",
    ],
    { encoding: "utf8", input: text },
  );
  if (result.status !== 0) {
    throw new Error(
      `${label} failed: ${(result.stderr || result.stdout || "unknown error").trim()}`,
    );
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
}

function assertDenied(statement, label) {
  if (sql(statement, true).status === 0) {
    throw new Error(`${label} unexpectedly succeeded`);
  }
}

function pass(name, details = {}) {
  matrix.push({ name, status: "passed", ...details });
}

function sqlText(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function validRow(suffix = "one") {
  const canonicalIdentity =
    `rec_decision:v1:server_owned:completed-${suffix}:1783517520000`;
  const activeEvidenceIdentity = `active_evidence:v2:${canonicalIdentity}`;
  const receiptIdentity = `server-receipt:${suffix}`;
  const receiptDigest = "a".repeat(64);
  const envelope = {
    contract_version: "canonical_active_evaluation_evidence_v2",
    canonical_identity: canonicalIdentity,
    active_evidence_identity: activeEvidenceIdentity,
    producer_decision_id: `completed-${suffix}`,
    decision_timestamp: "2026-07-08T13:32:00.000Z",
    sample_type: "visible",
    inactive_readiness_only: false,
    source: {
      kind: "server_owned_completed_recommendation_outcome_bundle",
      receipt_identity: receiptIdentity,
      receipt_sha256: receiptDigest,
    },
    evaluation: {
      primary_horizon: "60m",
      primary_outcome_id: `outcome-${suffix}-60m`,
      reproducible: true,
      quality_metrics_eligible: true,
      horizons: [
        { horizon: "15m" },
        { horizon: "30m" },
        { horizon: "60m" },
      ],
    },
  };

  return {
    canonical_identity: canonicalIdentity,
    active_evidence_identity: activeEvidenceIdentity,
    source_receipt_identity: receiptIdentity,
    source_receipt_sha256: receiptDigest,
    primary_outcome_id: `outcome-${suffix}-60m`,
    envelope,
  };
}

function insertSql(row) {
  return `
    insert into ${relation} (
      active_evidence_contract_version,
      storage_contract_version,
      canonical_identity,
      active_evidence_identity,
      semantic_payload_sha256,
      idempotency_key,
      source_kind,
      source_receipt_identity,
      source_receipt_sha256,
      producer_decision_id,
      decision_timestamp,
      sample_type,
      primary_horizon,
      primary_outcome_id,
      diagnostic_outcome_ids,
      reproducible,
      quality_metrics_eligible,
      persistence_envelope
    ) values (
      'canonical_active_evaluation_evidence_v2',
      'canonical_active_evaluation_storage_payload_v2',
      ${sqlText(row.canonical_identity)},
      ${sqlText(row.active_evidence_identity)},
      ${sqlText("b".repeat(64))},
      ${sqlText(`canonical_active_evidence:v2:${row.active_evidence_identity}`)},
      'server_owned_completed_recommendation_outcome_bundle',
      ${sqlText(row.source_receipt_identity)},
      ${sqlText(row.source_receipt_sha256)},
      ${sqlText(row.envelope.producer_decision_id)},
      ${sqlText(row.envelope.decision_timestamp)}::timestamptz,
      'visible',
      '60m',
      ${sqlText(row.primary_outcome_id)},
      array['outcome-${row.envelope.producer_decision_id}-15m', 'outcome-${row.envelope.producer_decision_id}-30m']::text[],
      true,
      true,
      ${sqlText(JSON.stringify(row.envelope))}::jsonb
    );
  `;
}

try {
  run("docker", [
    "run",
    "-d",
    "--rm",
    "--name",
    container,
    "-e",
    "POSTGRES_PASSWORD=postgres",
    "postgres:17-alpine",
  ]);

  let stableReadyChecks = 0;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const acceptsSql =
      spawnSync(
        "docker",
        [
          "exec",
          container,
          "psql",
          "-X",
          "-qAt",
          "-U",
          "postgres",
          "-d",
          "postgres",
          "-c",
          "select 1;",
        ],
        { encoding: "utf8" },
      ).status === 0;
    stableReadyChecks = acceptsSql ? stableReadyChecks + 1 : 0;
    if (stableReadyChecks >= 4) break;
    if (attempt === 39) throw new Error("local PostgreSQL did not become stably ready");
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
  }

  applySql(
    `
      create role anon nologin;
      create role authenticated nologin;
      create role service_role nologin;
      create table public.canonical_evaluation_decisions (
        id bigint primary key,
        v1_marker text not null
      );
      insert into public.canonical_evaluation_decisions values (1, 'preserved');
    `,
    "v1 sentinel",
  );
  const v1Before = sql(
    "select v1_marker from public.canonical_evaluation_decisions where id = 1;",
  ).stdout.trim();

  applySql(migrationSql, migrationName);
  pass("migration_applied_locally");

  assertEqual(
    sql(`
      select n.nspname || '.' || c.relname
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where c.oid = '${relation}'::regclass;
    `).stdout.trim(),
    relation,
    "active evidence relation",
  );
  assertEqual(
    sql("select v1_marker from public.canonical_evaluation_decisions where id = 1;").stdout.trim(),
    v1Before,
    "v1 sentinel",
  );
  pass("v1_relation_preserved");

  assertEqual(
    sql(`
      select relrowsecurity::text || ':' || relforcerowsecurity::text
      from pg_class
      where oid = '${relation}'::regclass;
    `).stdout.trim(),
    "true:true",
    "RLS mode",
  );
  assertEqual(
    sql(`select count(*)::text from pg_policy where polrelid = '${relation}'::regclass;`).stdout.trim(),
    "0",
    "RLS policies",
  );
  assertEqual(
    sql(`select has_table_privilege('service_role', '${relation}', 'select')::text || ':' || has_table_privilege('service_role', '${relation}', 'insert')::text;`).stdout.trim(),
    "false:false",
    "service role privileges",
  );
  pass("rls_and_privileges_default_deny");

  const row = validRow();
  assertDenied(`set role service_role; ${insertSql(row)}`, "service role insert");
  applySql(insertSql(row), "valid v2 insert");
  assertEqual(
    sql(`select count(*)::text from ${relation};`).stdout.trim(),
    "1",
    "valid row count",
  );
  pass("complete_active_evidence_inserted_as_owner_only");

  assertDenied(insertSql(row), "duplicate canonical identity");
  const inactive = validRow("inactive");
  inactive.envelope.inactive_readiness_only = true;
  assertDenied(insertSql(inactive), "inactive evidence relabel");
  const incomplete = validRow("incomplete");
  incomplete.envelope.evaluation.horizons = [{ horizon: "60m" }];
  assertDenied(insertSql(incomplete), "incomplete diagnostic horizons");
  pass("identity_and_completion_constraints_reject_invalid_rows");

  assertDenied(
    `update ${relation} set primary_horizon = primary_horizon;`,
    "append-only update",
  );
  assertDenied(`delete from ${relation};`, "append-only delete");
  pass("append_only_rejects_mutation");

  const rollback = validRow("rollback");
  applySql(`begin; ${insertSql(rollback)} rollback;`, "rollback proof");
  assertEqual(
    sql(`select count(*)::text from ${relation} where canonical_identity = ${sqlText(rollback.canonical_identity)};`).stdout.trim(),
    "0",
    "rollback leaves no row",
  );
  pass("rollback_leaves_no_active_evidence");

  console.log(
    JSON.stringify({
      status: "passed",
      action: "AI-02.10",
      migration: migrationName,
      scenarios_passed: matrix.length,
      matrix,
      external_database_interaction: false,
      staging_interaction: false,
      production_interaction: false,
    }),
  );
} finally {
  spawnSync("docker", ["rm", "-f", container], { encoding: "utf8" });
}
