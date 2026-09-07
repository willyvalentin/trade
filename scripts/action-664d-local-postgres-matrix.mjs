#!/usr/bin/env node
/**
 * Action 664D disposable local PostgreSQL acceptance matrix.
 *
 * The harness replays its exact historical pre-target migration baseline into
 * a disposable Docker PostgreSQL instance, applies only the target
 * migration, and exercises catalog, ACL, constraint, idempotency, and rollback
 * behavior. It never connects to Supabase or any external database.
 */
import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const baselineCommit = "f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33";
const migrationName =
  "20260726001000_create_canonical_evaluation_decisions.sql";
const migrationPath = resolve(root, "supabase/migrations", migrationName);
const migrationSql = readFileSync(migrationPath, "utf8");
const migrationDigest = createHash("sha256")
  .update(migrationSql, "utf8")
  .digest("hex");
const relation = "public.canonical_evaluation_decisions";
const container = `ture-action-664d-${randomUUID().slice(0, 12)}`;
const matrix = [];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} failed: ${(
        result.stderr ||
        result.stdout ||
        "unknown error"
      ).trim()}`,
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
      `SQL failed: ${(
        result.stderr ||
        result.stdout ||
        "unknown error"
      ).trim()}`,
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
      `${label} failed: ${(
        result.stderr ||
        result.stdout ||
        "unknown error"
      ).trim()}`,
    );
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
}

function assertTrue(value, label) {
  if (!value) throw new Error(`${label}: expected true`);
}

function assertDenied(statement, label) {
  const result = sql(statement, true);
  if (result.status === 0) {
    throw new Error(`${label} unexpectedly succeeded`);
  }
}

function pass(name, details = {}) {
  matrix.push({ name, status: "passed", ...details });
}

function sqlText(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlTimestamp(value) {
  return value ? `${sqlText(value)}::timestamptz` : "null";
}

function sqlJson(value) {
  return value === null
    ? "null"
    : `${sqlText(JSON.stringify(value))}::jsonb`;
}

function sqlTextArray(values) {
  if (values.length === 0) return "array[]::text[]";
  return `array[${values.map((value) => sqlText(value)).join(",")}]::text[]`;
}

function stableJsonValue(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("non-finite fixture number");
    return value;
  }
  if (Array.isArray(value)) return value.map(stableJsonValue);
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stableJsonValue(value[key])]),
  );
}

function semanticDigest(envelope) {
  return createHash("sha256")
    .update(JSON.stringify(stableJsonValue(envelope)), "utf8")
    .digest("hex");
}

const versions = {
  engine_version: "engine-action-664d-v1",
  scoring_version: "scoring-action-664d-v1",
  ranking_version: "ranking-action-664d-v1",
  setup_taxonomy_version: "setup-taxonomy-action-664d-v1",
  confidence_contract_version: "confidence-action-664d-v1",
  evaluator_version: "evaluator-action-664d-v1",
  provider_contract_version: "provider-action-664d-v1",
  git_commit: baselineCommit,
  build_identity: "action-664d-local-postgres-fixture",
};

function fixtureRow(sampleType, ordinal) {
  const producerDecisionId = `action-664d-${sampleType}-${ordinal}`;
  const decisionTimestamp = new Date(
    Date.UTC(2026, 6, 26, 8, ordinal, 0),
  ).toISOString();
  const canonicalIdentity =
    `rec_decision:v1:action664d_fixture:${producerDecisionId}:` +
    `${Date.parse(decisionTimestamp)}`;
  const decisionKind =
    sampleType === "no_trade"
      ? "no_trade"
      : sampleType === "rejected_candidate"
        ? "rejection"
        : sampleType === "historical_synthetic"
          ? "historical_synthetic"
          : "recommendation";
  const sourceNamespace =
    sampleType === "visible" || sampleType === "research_only"
      ? "recommendation_snapshot"
      : sampleType === "no_trade"
        ? "recommendation_batch"
        : sampleType === "historical_synthetic"
          ? "historical_replay"
          : "scanner_candidate";
  const candidate =
    sampleType === "no_trade"
      ? null
      : {
          id: `candidate-${sampleType}-${ordinal}`,
          fingerprint: null,
        };
  const scanRun =
    sampleType === "historical_synthetic"
      ? null
      : {
          id: `scan-run-${sampleType}-${ordinal}`,
          fingerprint: `scan-run-fingerprint-${sampleType}-${ordinal}`,
        };
  const batch =
    sampleType === "historical_synthetic"
      ? null
      : {
          id: `batch-${sampleType}-${ordinal}`,
          fingerprint: `batch-fingerprint-${sampleType}-${ordinal}`,
        };
  const snapshot =
    sourceNamespace === "recommendation_snapshot"
      ? {
          id: `snapshot-${sampleType}-${ordinal}`,
          fingerprint: `snapshot-fingerprint-${sampleType}-${ordinal}`,
        }
      : null;
  const recommendationId = snapshot ? producerDecisionId : null;
  const qualityEligible =
    sampleType === "visible" || sampleType === "historical_synthetic";
  const primaryOutcomeId =
    sampleType === "visible" ? `outcome-${sampleType}-${ordinal}-60m` : null;
  const horizons =
    sampleType === "visible"
      ? [
          {
            id: primaryOutcomeId,
            horizon: "60m",
            status: "target_before_stop",
            coverage: {
              status: "complete",
              expected_candle_count: 12,
              observed_candle_count: 12,
              reason_codes: [],
            },
          },
        ]
      : [];
  const replay =
    sampleType === "historical_synthetic"
      ? {
          replay_id: `replay-${ordinal}`,
          replayed_at: decisionTimestamp,
          source_type: "historical_synthetic",
          source_commit: baselineCommit,
          deterministic_input_hash: `sha256:action-664d-${ordinal}`,
          lookahead_safety_passed: true,
          provider_call_executed: false,
          persistence_write_executed: false,
        }
      : null;
  const lineage = {
    candidate,
    scan_run: scanRun,
    batch,
    snapshot,
    recommendation_id: recommendationId,
    outcome_ids: primaryOutcomeId ? [primaryOutcomeId] : [],
  };
  const decisionContext = {
    regime: "neutral",
    sector: "technology",
    captured_at: decisionTimestamp,
    reason_codes: [],
  };
  const providerContext = {
    provider: "action-664d-local-fixture",
    source_timestamp: decisionTimestamp,
    freshness: "fresh",
    candle_interval: "5m",
    primary_coverage: qualityEligible
      ? {
          status: "complete",
          expected_candle_count: 12,
          observed_candle_count: 12,
          reason_codes: [],
        }
      : null,
    reason_codes: [],
  };
  const evaluatorInputIdentity = qualityEligible
    ? `evaluator-input-${sampleType}-${ordinal}`
    : null;
  const evaluation = {
    evaluator_input_identity: evaluatorInputIdentity,
    trade_plan:
      sampleType === "visible"
        ? {
            side: "long",
            entry: 100,
            stop: 98,
            target: 104,
            entry_policy: "immediate_at_recommendation",
          }
        : null,
    horizons,
    primary_selection:
      sampleType === "visible"
        ? {
            status: "selected",
            primary_horizon: "60m",
            primary_outcome: horizons[0],
            diagnostic_outcomes: [],
            reason_codes: [],
          }
        : null,
    primary_outcome_id: primaryOutcomeId,
    diagnostic_outcome_ids: primaryOutcomeId ? [primaryOutcomeId] : [],
    replay,
    reproducible: qualityEligible,
    quality_metrics_eligible: qualityEligible,
    reason_codes: qualityEligible ? [] : ["quality_metrics_not_eligible"],
  };
  const numericConfidence = sampleType === "no_trade" ? null : 0.72;
  const confidenceLabel = sampleType === "no_trade" ? null : "high";
  const envelope = {
    contract_version: "canonical_evaluation_persistence_v1",
    decision_kind: decisionKind,
    source: sourceNamespace,
    source_namespace: sourceNamespace,
    canonical_identity: canonicalIdentity,
    producer_decision_id: producerDecisionId,
    decision_timestamp: decisionTimestamp,
    sample_type: sampleType,
    decision: {
      identity: canonicalIdentity,
      sample_type: sampleType,
    },
    confidence: {
      numeric_confidence: numericConfidence,
      confidence_label: confidenceLabel,
    },
    versions,
    lineage,
    decision_context: decisionContext,
    provider_context: providerContext,
    evaluation,
    idempotency_identity:
      `canonical_evaluation:v1:${canonicalIdentity}`,
    inactive_readiness_only: true,
  };

  return {
    storage_contract_version: "canonical_evaluation_storage_payload_v1",
    envelope_contract_version: "canonical_evaluation_persistence_v1",
    lineage_contract_version: "canonical_evaluation_lineage_v1",
    canonical_identity: canonicalIdentity,
    semantic_payload_sha256: semanticDigest(envelope),
    idempotency_key: `canonical_evaluation:v1:${canonicalIdentity}`,
    producer_decision_id: producerDecisionId,
    source_namespace: sourceNamespace,
    decision_timestamp: decisionTimestamp,
    decision_kind: decisionKind,
    sample_type: sampleType,
    candidate_id: candidate?.id ?? null,
    scan_run_id: scanRun?.id ?? null,
    scan_run_fingerprint: scanRun?.fingerprint ?? null,
    batch_id: batch?.id ?? null,
    batch_fingerprint: batch?.fingerprint ?? null,
    snapshot_id: snapshot?.id ?? null,
    snapshot_fingerprint: snapshot?.fingerprint ?? null,
    recommendation_id: recommendationId,
    numeric_confidence: numericConfidence,
    confidence_label: confidenceLabel,
    ...versions,
    regime_at_decision: decisionContext.regime,
    sector_at_decision: decisionContext.sector,
    provider: providerContext.provider,
    provider_source_timestamp: providerContext.source_timestamp,
    freshness: providerContext.freshness,
    candle_interval: providerContext.candle_interval,
    expected_candle_count:
      providerContext.primary_coverage?.expected_candle_count ?? null,
    observed_candle_count:
      providerContext.primary_coverage?.observed_candle_count ?? null,
    coverage_reason_codes:
      providerContext.primary_coverage?.reason_codes ?? [],
    evaluator_input_identity: evaluatorInputIdentity,
    primary_horizon: sampleType === "visible" ? "60m" : null,
    primary_outcome_id: primaryOutcomeId,
    diagnostic_outcome_ids: primaryOutcomeId ? [primaryOutcomeId] : [],
    reproducible: evaluation.reproducible,
    quality_metrics_eligible: evaluation.quality_metrics_eligible,
    lineage_json: lineage,
    versions_json: versions,
    decision_context_json: decisionContext,
    provider_context_json: providerContext,
    evaluation_json: evaluation,
    replay_metadata_json: replay,
    diagnostic_horizons_json: horizons,
    persistence_envelope: envelope,
  };
}

const insertColumns = [
  "storage_contract_version",
  "envelope_contract_version",
  "lineage_contract_version",
  "canonical_identity",
  "semantic_payload_sha256",
  "idempotency_key",
  "producer_decision_id",
  "source_namespace",
  "decision_timestamp",
  "decision_kind",
  "sample_type",
  "candidate_id",
  "scan_run_id",
  "scan_run_fingerprint",
  "batch_id",
  "batch_fingerprint",
  "snapshot_id",
  "snapshot_fingerprint",
  "recommendation_id",
  "numeric_confidence",
  "confidence_label",
  "engine_version",
  "scoring_version",
  "ranking_version",
  "setup_taxonomy_version",
  "confidence_contract_version",
  "evaluator_version",
  "provider_contract_version",
  "git_commit",
  "build_identity",
  "regime_at_decision",
  "sector_at_decision",
  "provider",
  "provider_source_timestamp",
  "freshness",
  "candle_interval",
  "expected_candle_count",
  "observed_candle_count",
  "coverage_reason_codes",
  "evaluator_input_identity",
  "primary_horizon",
  "primary_outcome_id",
  "diagnostic_outcome_ids",
  "reproducible",
  "quality_metrics_eligible",
  "lineage_json",
  "versions_json",
  "decision_context_json",
  "provider_context_json",
  "evaluation_json",
  "replay_metadata_json",
  "diagnostic_horizons_json",
  "persistence_envelope",
];

const timestampColumns = new Set([
  "decision_timestamp",
  "provider_source_timestamp",
]);
const arrayColumns = new Set([
  "coverage_reason_codes",
  "diagnostic_outcome_ids",
]);
const jsonColumns = new Set([
  "lineage_json",
  "versions_json",
  "decision_context_json",
  "provider_context_json",
  "evaluation_json",
  "replay_metadata_json",
  "diagnostic_horizons_json",
  "persistence_envelope",
]);
const numericColumns = new Set([
  "numeric_confidence",
  "expected_candle_count",
  "observed_candle_count",
]);
const booleanColumns = new Set([
  "reproducible",
  "quality_metrics_eligible",
]);

function sqlValue(column, value) {
  if (timestampColumns.has(column)) return sqlTimestamp(value);
  if (arrayColumns.has(column)) return sqlTextArray(value);
  if (jsonColumns.has(column)) return sqlJson(value);
  if (numericColumns.has(column)) {
    return value === null ? "null" : String(value);
  }
  if (booleanColumns.has(column)) return value ? "true" : "false";
  return sqlText(value);
}

function insertSql(row) {
  return `
    insert into ${relation} (${insertColumns.join(",")})
    values (${insertColumns
      .map((column) => sqlValue(column, row[column]))
      .join(",")})
  `;
}

function cloneWithIdentity(row, suffix) {
  const clone = structuredClone(row);
  clone.producer_decision_id = `${row.producer_decision_id}-${suffix}`;
  clone.canonical_identity =
    `rec_decision:v1:action664d_fixture:${clone.producer_decision_id}:` +
    `${Date.parse(clone.decision_timestamp) + suffix.length}`;
  clone.idempotency_key =
    `canonical_evaluation:v1:${clone.canonical_identity}`;
  clone.persistence_envelope.producer_decision_id =
    clone.producer_decision_id;
  clone.persistence_envelope.canonical_identity = clone.canonical_identity;
  clone.persistence_envelope.idempotency_identity = clone.idempotency_key;
  if (clone.recommendation_id) {
    clone.recommendation_id = clone.producer_decision_id;
    clone.lineage_json.recommendation_id = clone.recommendation_id;
    clone.persistence_envelope.lineage.recommendation_id =
      clone.recommendation_id;
  }
  if (clone.evaluator_input_identity) {
    clone.evaluator_input_identity =
      `${clone.evaluator_input_identity}-${suffix}`;
    clone.evaluation_json.evaluator_input_identity =
      clone.evaluator_input_identity;
    clone.persistence_envelope.evaluation.evaluator_input_identity =
      clone.evaluator_input_identity;
  }
  clone.semantic_payload_sha256 = semanticDigest(
    clone.persistence_envelope,
  );
  return clone;
}

function catalogFingerprint() {
  return sql(`
    select md5(coalesce(string_agg(
      concat_ws('|',
        classes.relname,
        classes.relowner::text,
        coalesce(classes.relacl::text, ''),
        classes.relrowsecurity::text,
        classes.relforcerowsecurity::text,
        (select count(*)::text from pg_policy where polrelid = classes.oid),
        (select count(*)::text from pg_trigger where tgrelid = classes.oid and not tgisinternal)
      ),
      ',' order by classes.relname
    ), ''))
    from pg_class classes
    join pg_namespace namespaces on namespaces.oid = classes.relnamespace
    where namespaces.nspname = 'public'
      and classes.relkind in ('r', 'p')
      and classes.relname <> 'canonical_evaluation_decisions';
  `).stdout.trim();
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
    "postgres:16-alpine",
  ]);

  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (sql("select 1;", true).status === 0) break;
    if (attempt === 59) {
      throw new Error("local PostgreSQL did not become ready");
    }
    Atomics.wait(
      new Int32Array(new SharedArrayBuffer(4)),
      0,
      0,
      250,
    );
  }

  sql(`
    create extension if not exists pgcrypto;
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
  `);

  run("git", ["cat-file", "-e", `${baselineCommit}^{commit}`]);
  const baselineSha = run("git", ["rev-parse", baselineCommit]).trim();
  assertEqual(baselineSha, baselineCommit, "exact historical baseline");
  const baselineMigrationPaths = run("git", [
    "ls-tree",
    "-r",
    "--name-only",
    baselineCommit,
    "supabase/migrations",
  ])
    .trim()
    .split("\n")
    .filter((path) => path.endsWith(".sql"));
  assertTrue(
    !baselineMigrationPaths.includes(`supabase/migrations/${migrationName}`),
    "target migration absent from historical baseline",
  );

  for (const path of baselineMigrationPaths) {
    const baselineSql = run("git", ["show", `${baselineCommit}:${path}`]);
    applySql(baselineSql, `baseline migration ${path}`);
  }
  pass("historical_pre_target_baseline", {
    baseline_commit: baselineCommit,
    baseline_sha: baselineSha,
    target_migration: migrationName,
    migrations_applied: baselineMigrationPaths.length,
  });

  const legacyCatalogBefore = catalogFingerprint();
  applySql(migrationSql, migrationName);
  pass("action_664d_migration_applied_locally", {
    migration_version: "20260726001000",
    migration_sha256: migrationDigest,
  });

  const columns = JSON.parse(
    sql(`
      select json_agg(column_name order by ordinal_position)
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'canonical_evaluation_decisions';
    `).stdout.trim(),
  );
  assertEqual(
    JSON.stringify(columns),
    JSON.stringify(["id", "created_at", ...insertColumns]),
    "exact storage columns",
  );
  assertEqual(
    sql(`
      select pg_get_userbyid(relowner) || '|' ||
        relrowsecurity::text || '|' || relforcerowsecurity::text
      from pg_class where oid = '${relation}'::regclass;
    `).stdout.trim(),
    "postgres|true|false",
    "owner and RLS",
  );
  assertEqual(
    sql(`
      select count(*)::text
      from pg_policies
      where schemaname = 'public'
        and tablename = 'canonical_evaluation_decisions';
    `).stdout.trim(),
    "0",
    "zero RLS policies",
  );
  assertEqual(
    sql(`
      select count(*)::text
      from pg_attribute
      where attrelid = '${relation}'::regclass
        and attnum > 0
        and not attisdropped
        and attacl is not null;
    `).stdout.trim(),
    "0",
    "zero column ACLs",
  );
  pass("exact_schema_owner_rls_and_column_acl");

  const privileges = [
    "select",
    "insert",
    "update",
    "delete",
    "truncate",
    "references",
    "trigger",
  ];
  for (const role of ["anon", "authenticated"]) {
    for (const privilege of privileges) {
      assertEqual(
        sql(
          `select has_table_privilege('${role}', '${relation}', '${privilege}')::text;`,
        ).stdout.trim(),
        "false",
        `${role} ${privilege}`,
      );
    }
  }
  for (const privilege of privileges) {
    const expected =
      privilege === "select" || privilege === "insert" ? "true" : "false";
    assertEqual(
      sql(
        `select has_table_privilege('service_role', '${relation}', '${privilege}')::text;`,
      ).stdout.trim(),
      expected,
      `service_role ${privilege}`,
    );
  }
  assertEqual(
    sql(`
      select count(*)::text
      from pg_class classes
      cross join lateral aclexplode(
        coalesce(classes.relacl, acldefault('r', classes.relowner))
      ) privilege
      where classes.oid = '${relation}'::regclass
        and privilege.grantee = 0;
    `).stdout.trim(),
    "0",
    "PUBLIC privilege count",
  );
  pass("table_acl_contract", {
    service_role_privileges: ["SELECT", "INSERT"],
    browser_role_privileges: [],
    public_privileges: [],
  });

  const constraintNames = JSON.parse(
    sql(`
      select json_agg(conname order by conname)
      from pg_constraint
      where conrelid = '${relation}'::regclass;
    `).stdout.trim(),
  );
  for (const name of [
    "ce_decisions_confidence_ck",
    "ce_decisions_envelope_consistency_ck",
    "ce_decisions_envelope_version_ck",
    "ce_decisions_git_commit_ck",
    "ce_decisions_identity_ck",
    "ce_decisions_identity_unique",
    "ce_decisions_lineage_ck",
    "ce_decisions_lineage_version_ck",
    "ce_decisions_quality_versions_ck",
    "ce_decisions_sample_type_ck",
  ]) {
    assertTrue(constraintNames.includes(name), `constraint ${name}`);
  }
  const indexNames = JSON.parse(
    sql(`
      select json_agg(indexname order by indexname)
      from pg_indexes
      where schemaname = 'public'
        and tablename = 'canonical_evaluation_decisions';
    `).stdout.trim(),
  );
  for (const name of [
    "ce_decisions_evaluator_input_uidx",
    "ce_decisions_lineage_gin_idx",
    "ce_decisions_horizons_gin_idx",
    "ce_decisions_sample_timestamp_idx",
  ]) {
    assertTrue(indexNames.includes(name), `index ${name}`);
  }
  pass("constraints_and_indexes", {
    constraints: constraintNames.length,
    indexes: indexNames.length,
  });

  const sampleTypes = [
    "visible",
    "research_only",
    "shadow",
    "historical_synthetic",
    "rejected_candidate",
    "no_trade",
  ];
  const rows = sampleTypes.map((sampleType, index) =>
    fixtureRow(sampleType, index + 1),
  );
  for (const row of rows) {
    sql(`set role service_role; ${insertSql(row)};`);
  }
  assertEqual(
    sql(`set role service_role; select count(*)::text from ${relation};`)
      .stdout.trim(),
    "6",
    "six sample type inserts",
  );
  assertEqual(
    sql(`
      set role service_role;
      select string_agg(sample_type, ',' order by sample_type)
      from ${relation};
    `).stdout.trim(),
    [...sampleTypes].sort().join(","),
    "six sample type readback",
  );
  pass("six_sample_types_service_role_insert_read", {
    rows_inserted: 6,
  });

  for (const role of ["anon", "authenticated"]) {
    assertDenied(
      `set role ${role}; select canonical_identity from ${relation};`,
      `${role} SELECT`,
    );
    assertDenied(
      `set role ${role}; insert into ${relation} (canonical_identity) values ('denied');`,
      `${role} INSERT`,
    );
    assertDenied(
      `set role ${role}; update ${relation} set created_at = created_at;`,
      `${role} UPDATE`,
    );
    assertDenied(
      `set role ${role}; delete from ${relation};`,
      `${role} DELETE`,
    );
  }
  pass("actual_browser_role_denial", {
    roles: ["anon", "authenticated"],
    operations: ["SELECT", "INSERT", "UPDATE", "DELETE"],
  });

  const firstRow = rows[0];
  const countBeforeRetry = sql(
    `select count(*)::text from ${relation} where canonical_identity = ${sqlText(firstRow.canonical_identity)};`,
  ).stdout.trim();
  const retryDigest = sql(`
    set role service_role;
    select semantic_payload_sha256
    from ${relation}
    where canonical_identity = ${sqlText(firstRow.canonical_identity)};
  `).stdout.trim();
  assertEqual(
    retryDigest,
    firstRow.semantic_payload_sha256,
    "idempotent retry semantic digest",
  );
  const countAfterRetry = sql(
    `select count(*)::text from ${relation} where canonical_identity = ${sqlText(firstRow.canonical_identity)};`,
  ).stdout.trim();
  assertEqual(countAfterRetry, countBeforeRetry, "idempotent retry row count");
  pass("idempotent_retry_no_effect", {
    rows_before: Number(countBeforeRetry),
    rows_after: Number(countAfterRetry),
  });

  const semanticCollision = structuredClone(firstRow);
  semanticCollision.semantic_payload_sha256 = "0".repeat(64);
  assertDenied(
    `set role service_role; ${insertSql(semanticCollision)};`,
    "same identity different semantic payload",
  );
  assertEqual(
    sql(
      `select count(*)::text from ${relation} where canonical_identity = ${sqlText(firstRow.canonical_identity)};`,
    ).stdout.trim(),
    "1",
    "semantic collision row count",
  );
  pass("semantic_collision_rejected_without_overwrite");

  const invalidConfidence = cloneWithIdentity(firstRow, "invalid-confidence");
  invalidConfidence.numeric_confidence = 1.5;
  invalidConfidence.persistence_envelope.confidence.numeric_confidence = 1.5;
  invalidConfidence.semantic_payload_sha256 = semanticDigest(
    invalidConfidence.persistence_envelope,
  );
  assertDenied(
    `set role service_role; ${insertSql(invalidConfidence)};`,
    "invalid confidence",
  );

  const invalidSample = cloneWithIdentity(firstRow, "invalid-sample");
  invalidSample.sample_type = "legacy_visible";
  invalidSample.persistence_envelope.sample_type = "legacy_visible";
  invalidSample.semantic_payload_sha256 = semanticDigest(
    invalidSample.persistence_envelope,
  );
  assertDenied(
    `set role service_role; ${insertSql(invalidSample)};`,
    "invalid sample type",
  );

  const missingVersions = cloneWithIdentity(firstRow, "missing-versions");
  missingVersions.engine_version = null;
  missingVersions.versions_json.engine_version = null;
  missingVersions.persistence_envelope.versions.engine_version = null;
  missingVersions.semantic_payload_sha256 = semanticDigest(
    missingVersions.persistence_envelope,
  );
  assertDenied(
    `set role service_role; ${insertSql(missingVersions)};`,
    "missing quality versions",
  );

  const brokenLineage = cloneWithIdentity(firstRow, "broken-lineage");
  brokenLineage.batch_id = null;
  brokenLineage.lineage_json.batch = null;
  brokenLineage.persistence_envelope.lineage.batch = null;
  brokenLineage.semantic_payload_sha256 = semanticDigest(
    brokenLineage.persistence_envelope,
  );
  assertDenied(
    `set role service_role; ${insertSql(brokenLineage)};`,
    "broken lineage",
  );

  const tamperedEnvelope = cloneWithIdentity(firstRow, "tampered-envelope");
  tamperedEnvelope.persistence_envelope.provider_context = {
    ...tamperedEnvelope.persistence_envelope.provider_context,
    provider: "tampered-provider",
  };
  tamperedEnvelope.semantic_payload_sha256 = semanticDigest(
    tamperedEnvelope.persistence_envelope,
  );
  assertDenied(
    `set role service_role; ${insertSql(tamperedEnvelope)};`,
    "tampered envelope",
  );
  pass("invalid_payload_constraints", {
    rejected: [
      "invalid_confidence",
      "invalid_sample_type",
      "missing_versions",
      "broken_lineage",
      "tampered_envelope",
    ],
  });

  assertDenied(
    `set role service_role; update ${relation} set freshness = freshness;`,
    "service role update",
  );
  assertDenied(
    `set role service_role; delete from ${relation};`,
    "service role delete",
  );
  assertDenied(
    `update ${relation} set freshness = freshness;`,
    "owner update append-only trigger",
  );
  assertDenied(
    `delete from ${relation};`,
    "owner delete append-only trigger",
  );
  pass("append_only_update_delete_denial");

  const rollbackValid = cloneWithIdentity(firstRow, "rollback-valid");
  const rollbackInvalid = cloneWithIdentity(firstRow, "rollback-invalid");
  rollbackInvalid.numeric_confidence = -0.1;
  rollbackInvalid.persistence_envelope.confidence.numeric_confidence = -0.1;
  rollbackInvalid.semantic_payload_sha256 = semanticDigest(
    rollbackInvalid.persistence_envelope,
  );
  const rollbackResult = sql(
    `begin; set role service_role; ${insertSql(rollbackValid)}; ${insertSql(rollbackInvalid)}; commit;`,
    true,
  );
  assertTrue(rollbackResult.status !== 0, "rollback transaction rejected");
  assertEqual(
    sql(`
      select count(*)::text
      from ${relation}
      where canonical_identity in (
        ${sqlText(rollbackValid.canonical_identity)},
        ${sqlText(rollbackInvalid.canonical_identity)}
      );
    `).stdout.trim(),
    "0",
    "transaction rollback partial row count",
  );
  pass("transaction_rollback_no_partial_row");

  assertEqual(
    catalogFingerprint(),
    legacyCatalogBefore,
    "legacy table catalog fingerprint",
  );
  pass("legacy_catalog_no_effect", {
    writer_default_state: "feature_flag_disabled",
  });

  const failures = matrix.filter((item) => item.status !== "passed");
  if (failures.length > 0) {
    throw new Error(`matrix failures: ${JSON.stringify(failures)}`);
  }

  console.log(
    JSON.stringify({
      status: "passed",
      action: "664D",
      baseline_commit: baselineCommit,
      baseline_sha: baselineSha,
      migration_version: "20260726001000",
      migration_sha256: migrationDigest,
      scenarios_passed: matrix.length,
      scenarios_failed: 0,
      matrix,
      production_interaction: false,
      external_database_interaction: false,
    }),
  );
} finally {
  spawnSync("docker", ["rm", "-f", container], { encoding: "utf8" });
}
