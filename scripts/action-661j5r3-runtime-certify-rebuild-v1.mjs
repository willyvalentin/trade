#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";

import {
  buildDiagnosticSidecar,
  buildRuntimeIdentity,
  canonicalJson,
  policyForScenario,
  sha256,
} from "../lib/action-661j5r2-runtime-contracts-rebuild-v1.mjs";
import {
  buildMixedAbAggregateRebuildV1,
  persistMixedAbAggregateRebuildV1,
} from "../lib/action-661j5r2-mixed-ab-aggregate-rebuild-v1.mjs";
import {
  persistRuntimeResultFileRebuildV1,
  verifyPersistedFileRebuildV1,
} from "../lib/action-661j5r2-runtime-result-protocol-rebuild-v1.mjs";
import { runRuntimeScenarioRebuildV1 } from "../lib/action-661j5r2-runtime-runner-rebuild-v1.mjs";
import {
  RUNTIME_COLLECTOR_PATH,
  RUNTIME_COLLECTOR_VERSION,
  collectRuntimeSnapshotRebuildV1,
} from "../lib/action-661j5r3-postgres-runtime-collector-rebuild-v1.mjs";
import {
  POSTGRES_READINESS_POLICY,
  POSTGRES_READINESS_POLICY_DIGEST,
  PostgresReadinessError,
  waitForStablePostgresReadiness,
} from "../lib/action-661j5r3a-postgres-readiness-rebuild-v1.mjs";

const root = resolve(import.meta.dirname, "..");
const image = "postgres:16-alpine";
const runtimeMigrationPath =
  "scripts/action-661j5r3-runtime-migration-rebuild-v1.sql";
const baselineManifestPath =
  "scripts/action-661j5r3-runtime-baseline-rebuild-v1.json";
const outputRoot = resolve(
  process.argv[process.argv.indexOf("--output") + 1] ??
    "docs/recovery/action-661j5r3a/runtime-evidence",
);

const plans = [
  {
    scenario_id: "forbidden_history",
    run_id: "run-a",
    shard_id: "forbidden-history-a",
  },
  {
    scenario_id: "forbidden_history",
    run_id: "run-b",
    shard_id: "forbidden-history-b",
  },
  {
    scenario_id: "missing_target",
    run_id: "run-a",
    shard_id: "missing-target-a",
  },
  {
    scenario_id: "missing_target",
    run_id: "run-b",
    shard_id: "missing-target-b",
  },
];

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function docker(args, options) {
  return run("docker", args, options);
}

function fileSha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function atomicWrite(path, bytes) {
  const temporary = `${path}.tmp`;
  writeFileSync(temporary, bytes, { encoding: "utf8", flag: "wx" });
  renameSync(temporary, path);
}

function psql(container, args) {
  return docker([
    "exec",
    "-e",
    "PGPASSWORD=postgres",
    container,
    "psql",
    "-X",
    "-v",
    "ON_ERROR_STOP=1",
    "-qAt",
    "-U",
    "postgres",
    "-d",
    "postgres",
    ...args,
  ]).trim();
}

function queryJson(container, sql) {
  const output = psql(container, ["-c", sql]);
  try {
    return JSON.parse(output);
  } catch {
    throw new Error("action_661j5r3.runtime_query_json_invalid");
  }
}

function sanitizeReadinessText(value) {
  return String(value ?? "")
    .replaceAll(/\b(?:postgres(?:ql)?:\/\/|password=|user=)\S+/gi, "[redacted]")
    .replaceAll(/\s+/g, " ")
    .trim()
    .slice(0, 4096);
}

function waitReady(container, runDirectory) {
  try {
    return waitForStablePostgresReadiness({
      inspect_container: () =>
        spawnSync(
          "docker",
          ["inspect", "--format", "{{.State.Running}}", container],
          { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
        ).stdout.trim() === "true",
      now: () => Date.now(),
      probe_pg_isready: () =>
        spawnSync(
          "docker",
          [
            "exec",
            container,
            "pg_isready",
            "-q",
            "-U",
            "postgres",
            "-d",
            "postgres",
          ],
          { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
        ).status === 0,
      probe_sql_select_1: () => {
        const result = spawnSync(
          "docker",
          [
            "exec",
            "-e",
            "PGPASSWORD=postgres",
            container,
            "psql",
            "-X",
            "-qAt",
            "-U",
            "postgres",
            "-d",
            "postgres",
            "-c",
            "select 1",
          ],
          { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
        );
        return result.status === 0 && result.stdout.trim() === "1";
      },
      sleep: (milliseconds) =>
        Atomics.wait(
          new Int32Array(new SharedArrayBuffer(4)),
          0,
          0,
          milliseconds,
        ),
    });
  } catch (error) {
    if (error instanceof PostgresReadinessError) {
      const logs = spawnSync("docker", ["logs", container], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      const diagnostic = {
        diagnostic_version:
          "action_661j5r3a_postgres_readiness_diagnostic_rebuild_v1",
        diagnostic_sanitized: true,
        readiness_receipt: error.receipt,
        sanitized_container_logs: sanitizeReadinessText(
          `${logs.stdout ?? ""}\n${logs.stderr ?? ""}`,
        ),
      };
      atomicWrite(
        join(runDirectory, "readiness-diagnostic.json"),
        `${canonicalJson(diagnostic)}\n`,
      );
    }
    throw error;
  }
}

function verifyBaselineManifest() {
  const manifest = JSON.parse(
    readFileSync(resolve(root, baselineManifestPath), "utf8"),
  );
  if (
    manifest.manifest_version !==
      "action_661j5r3_runtime_baseline_rebuild_v1" ||
    manifest.base_commit !== "f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33" ||
    !Array.isArray(manifest.migrations)
  ) {
    throw new Error("action_661j5r3.baseline_manifest_invalid");
  }
  for (const migration of manifest.migrations) {
    if (fileSha256(resolve(root, migration.path)) !== migration.sha256) {
      throw new Error(
        `action_661j5r3.baseline_migration_hash_mismatch:${migration.path}`,
      );
    }
  }
  return manifest;
}

function establishBaseline(container, manifest) {
  psql(container, [
    "-c",
    `
create extension if not exists pgcrypto;
create schema if not exists extensions;
do $roles$
begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end
$roles$;
create schema supabase_migrations;
create table supabase_migrations.schema_migrations(
  version text primary key,
  statements text[] not null,
  name text not null
);
`,
  ]);
  for (const migration of manifest.migrations) {
    const containerPath = `/tmp/${basename(migration.path)}`;
    docker(["cp", resolve(root, migration.path), `${container}:${containerPath}`]);
    psql(container, ["-f", containerPath]);
    const statements = Array.from(
      { length: migration.history_statement_count },
      (_, index) => `local_${index + 1}`,
    );
    const name = basename(migration.path)
      .slice(migration.version.length + 1)
      .replace(/\.sql$/, "");
    psql(container, [
      "-c",
      `insert into supabase_migrations.schema_migrations(version,statements,name)
       values (${sqlLiteral(migration.version)}, array[${statements
         .map(sqlLiteral)
         .join(",")}], ${sqlLiteral(name)});`,
    ]);
  }
}

function establishScenarioPrecondition(container, scenarioId) {
  if (scenarioId === "forbidden_history") {
    psql(container, [
      "-c",
      `insert into supabase_migrations.schema_migrations(version,statements,name)
       values ('20260708000000',array['rebuild_v1_fixture'],'forbidden_fixture');`,
    ]);
    return;
  }
  if (scenarioId === "missing_target") {
    psql(container, ["-c", "drop table public.historical_candles cascade;"]);
    return;
  }
  throw new Error("action_661j5r3.scenario_not_supported");
}

function inspectImage() {
  const inspected = JSON.parse(
    docker(["image", "inspect", image, "--format", "{{json .}}"]),
  );
  if (
    inspected.Os !== "linux" ||
    !["arm64", "amd64"].includes(inspected.Architecture) ||
    typeof inspected.Id !== "string" ||
    !inspected.Id.startsWith("sha256:")
  ) {
    throw new Error("action_661j5r3.image_identity_invalid");
  }
  return inspected;
}

function captureRuntimeIdentity(container, inspectedImage) {
  const collectorPath = resolve(root, RUNTIME_COLLECTOR_PATH);
  const serverVersion = psql(container, ["-c", "show server_version;"]);
  const serverMajor = Number(
    psql(container, [
      "-c",
      "select current_setting('server_version_num')::integer / 10000;",
    ]),
  );
  return buildRuntimeIdentity({
    architecture: inspectedImage.Architecture,
    collector_sha256: fileSha256(collectorPath),
    collector_version: RUNTIME_COLLECTOR_VERSION,
    engine: "postgresql",
    image_digest: inspectedImage.Id,
    image_repository: "postgres",
    image_tag: "16-alpine",
    platform: inspectedImage.Os,
    server_major: serverMajor,
    server_version: serverVersion,
  });
}

function sanitizeMigrationFailure(result, scenarioId) {
  const text = `${result.stderr ?? ""}\n${result.stdout ?? ""}`
    .replaceAll("\r\n", "\n")
    .trim();
  const verbose = text.match(
    /ERROR:\s+([0-9A-Z]{5}):\s+([^\n]+)/,
  );
  const fallback = text.match(/ERROR:\s+([^\n]+)/);
  const observedSqlstate =
    verbose?.[1] ?? (text.includes("does not exist") ? "42P01" : null);
  const reason = verbose?.[2] ?? fallback?.[1] ?? "";
  const policy = policyForScenario(scenarioId);
  if (
    (scenarioId === "forbidden_history" && observedSqlstate !== "P0001") ||
    (scenarioId === "missing_target" && observedSqlstate !== "42P01")
  ) {
    throw new Error(
      `action_661j5r3.observed_sqlstate_mismatch:${observedSqlstate}`,
    );
  }
  const sqlstate =
    scenarioId === "forbidden_history" ? null : observedSqlstate;
  const sidecar = buildDiagnosticSidecar({
    classification: policy.classification,
    diagnostic_sanitized: true,
    migration_applied: false,
    reason,
    safety: {
      connection_string_present: false,
      credential_material_present: false,
      query_text_present: false,
      raw_error_object_present: false,
      stack_trace_present: false,
    },
    scenario_id: scenarioId,
    sidecar_version: "action_661j5r2_diagnostic_sidecar_rebuild_v1",
    sqlstate,
    terminal_state: "controlled_error",
  });
  if (
    sidecar.reason !== policy.terminal_reason ||
    sidecar.sqlstate !== policy.terminal_sqlstate
  ) {
    throw new Error(
      `action_661j5r3.terminal_policy_mismatch:${sqlstate}:${reason}`,
    );
  }
  return sidecar;
}

function attemptMigrationOnce(container, scenarioId) {
  const containerPath = "/tmp/action-661j5r3-runtime-migration-rebuild-v1.sql";
  docker([
    "cp",
    resolve(root, runtimeMigrationPath),
    `${container}:${containerPath}`,
  ]);
  const result = spawnSync(
    "docker",
    [
      "exec",
      "-e",
      "PGPASSWORD=postgres",
      container,
      "psql",
      "-X",
      "-v",
      "ON_ERROR_STOP=1",
      "--set=VERBOSITY=verbose",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-f",
      containerPath,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  if (result.status === 0) {
    throw new Error("action_661j5r3.migration_unexpectedly_succeeded");
  }
  return sanitizeMigrationFailure(result, scenarioId);
}

async function runOne(plan, manifest, inspectedImage) {
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const container = `ture-661j5-r3-${plan.scenario_id}-${plan.run_id}-${suffix}`;
  const runDirectory = join(
    outputRoot,
    `${plan.scenario_id}-${plan.run_id}`,
  );
  mkdirSync(runDirectory, { recursive: false });
  let attemptCount = 0;
  try {
    docker([
      "run",
      "-d",
      "--name",
      container,
      "-e",
      "POSTGRES_PASSWORD=postgres",
      image,
    ]);
    const readinessReceipt = waitReady(container, runDirectory);
    const runtimeIdentity = captureRuntimeIdentity(container, inspectedImage);
    establishBaseline(container, manifest);
    establishScenarioPrecondition(container, plan.scenario_id);
    const pre = collectRuntimeSnapshotRebuildV1({
      query_json: (sql) => queryJson(container, sql),
    });
    const fileIdentity = `${plan.run_id}.${plan.shard_id}.${plan.scenario_id}.rebuild-v1.json`;
    const result = await runRuntimeScenarioRebuildV1({
      output_path: join(runDirectory, fileIdentity),
      persist_diagnostic: async (diagnostic) => {
        const path = join(runDirectory, "diagnostic-sidecar.json");
        atomicWrite(path, `${canonicalJson(diagnostic)}\n`);
      },
      run_id: plan.run_id,
      runtime_attempt: async () => {
        attemptCount += 1;
        if (attemptCount !== 1) {
          throw new Error("action_661j5r3.runtime_attempt_retried");
        }
        const diagnostic = attemptMigrationOnce(container, plan.scenario_id);
        const post = collectRuntimeSnapshotRebuildV1({
          query_json: (sql) => queryJson(container, sql),
        });
        const guardedReads = pre.guarded_reads;
        const runtimeCaptureDigest = sha256({
          diagnostic_digest: diagnostic.diagnostic_digest,
          guarded_reads: guardedReads,
          poststate_combined_digest: post.snapshot.combined_digest,
          prestate_combined_digest: pre.snapshot.combined_digest,
          runtime_identity_digest: runtimeIdentity.identity_digest,
        });
        return {
          diagnostic,
          guarded_reads: guardedReads,
          poststate: post.snapshot,
          prestate: pre.snapshot,
          runtime_capture_digest: runtimeCaptureDigest,
          runtime_identity: runtimeIdentity,
        };
      },
      scenario_id: plan.scenario_id,
      shard_id: plan.shard_id,
    });
    verifyPersistedFileRebuildV1(result.file);
    const idempotent = persistRuntimeResultFileRebuildV1({
      file: result.file,
      output_path: join(runDirectory, fileIdentity),
    });
    if (idempotent.disposition !== "existing_identical") {
      throw new Error("action_661j5r3.persisted_file_not_idempotent");
    }
    return {
      container,
      run_directory: runDirectory,
      attempt_count: attemptCount,
      readiness_receipt: readinessReceipt,
      evidence: result.evidence,
      record: result.record,
      shard: result.shard,
      file: result.file,
      runtime_identity_digest: runtimeIdentity.identity_digest,
    };
  } finally {
    spawnSync("docker", ["rm", "-f", container], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  }
}

function preflight() {
  if (existsSync(outputRoot)) {
    throw new Error("action_661j5r3.output_already_exists");
  }
  const stale = docker([
    "ps",
    "-a",
    "--filter",
    "name=ture-661j5-",
    "--format",
    "{{.Names}}",
  ]).trim();
  if (stale) throw new Error("action_661j5r3.stale_containers_present");
  if (
    fileSha256(
      resolve(
        root,
        "docs/recovery/action-661j5r2/rebuild-manifest.json",
      ),
    ) !== "3ba48a968ab56d71b5d5bfb2fc0938bc9031897d79eabfccc3432cd72b1ab9bd"
  ) {
    throw new Error("action_661j5r3.foundation_manifest_mismatch");
  }
  return {
    baseline: verifyBaselineManifest(),
    image: inspectImage(),
    runtime_migration_sha256: fileSha256(
      resolve(root, runtimeMigrationPath),
    ),
  };
}

async function main() {
  const preflightResult = preflight();
  mkdirSync(outputRoot, { recursive: true });
  const runs = [];
  for (const plan of plans) {
    runs.push(
      await runOne(plan, preflightResult.baseline, preflightResult.image),
    );
  }
  const files = runs.map((entry) => entry.file);
  const aggregate = buildMixedAbAggregateRebuildV1(files);
  const aggregatePath = join(
    outputRoot,
    "action-661j5r2-mixed-ab-aggregate.rebuild-v1.json",
  );
  persistMixedAbAggregateRebuildV1({
    aggregate,
    files,
    output_path: aggregatePath,
  });
  const aggregateRetry = persistMixedAbAggregateRebuildV1({
    aggregate,
    files,
    output_path: aggregatePath,
  });
  if (aggregateRetry.disposition !== "existing_identical") {
    throw new Error("action_661j5r3.aggregate_not_idempotent");
  }
  const report = {
    report_version: "action_661j5r3_runtime_certification_report_v1",
    foundation_commit: "a3914ab82faad49d19366d7a6f93334c6448944f",
    runtime_migration_sha256: preflightResult.runtime_migration_sha256,
    readiness_policy: POSTGRES_READINESS_POLICY,
    readiness_policy_digest: POSTGRES_READINESS_POLICY_DIGEST,
    image_identity: {
      architecture: preflightResult.image.Architecture,
      image_id: preflightResult.image.Id,
      platform: preflightResult.image.Os,
      repository_digests: preflightResult.image.RepoDigests,
      tag: image,
    },
    runs: runs.map((entry) => ({
      attempt_count: entry.attempt_count,
      readiness_attempt_count: entry.readiness_receipt.attempt_count,
      readiness_receipt_digest:
        entry.readiness_receipt.readiness_receipt_digest,
      readiness_terminal_reason: entry.readiness_receipt.terminal_reason,
      evidence_digest: entry.evidence.evidence_digest,
      file_digest: entry.file.canonical_file_digest,
      record_digest: entry.record.record_digest,
      run_id: entry.record.run_id,
      runtime_capture_digest: entry.evidence.runtime_capture_digest,
      runtime_identity_digest: entry.runtime_identity_digest,
      scenario_id: entry.record.scenario_id,
      shard_digest: entry.shard.shard_digest,
      shard_id: entry.record.shard_id,
      snapshot_combined_digest: entry.evidence.prestate.combined_digest,
    })),
    scenario_semantic_digests: aggregate.scenario_comparisons.map((entry) => ({
      scenario_id: entry.scenario_id,
      semantic_digest: entry.semantic_digest,
    })),
    aggregate_digest: aggregate.aggregate_digest,
    fixture_progress: "16/28",
  };
  atomicWrite(
    join(outputRoot, "runtime-certification-report.json"),
    `${canonicalJson(report)}\n`,
  );
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

await main();
