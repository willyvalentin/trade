import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

const repositoryRoot = path.resolve(__dirname, "../..");
const predecessorRevision = "b80584dca0c2b2f1c7f2dd8793d59ac63dbafe6b";
const actionPath =
  "docs/action-666di-position-version-history-source-migration-bytes.md";
const evidencePath =
  "docs/evidence/action-666di-position-version-history-source-migration-bytes.json";
const migrationPath =
  "supabase/migrations/20260821194333_create_position_version_history.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666di-position-version-history-source-migration-bytes.spec.ts";
const evidenceSha256 = "23a15fd768b5cae8d14e9968e139d9b689a47b8584ac1e206d145a1efd93e778";

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function historicalSource(relativePath: string) {
  return execFileSync("git", ["show", `${predecessorRevision}:${relativePath}`], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalized(value: string) {
  return value.replaceAll("\r\n", "\n").toLowerCase();
}

function hasRequiredMigrationBoundary(sql: string) {
  const value = normalized(sql);
  return [
    "create table public.position_version_history",
    "primary key (position_id, owner_user_id, position_version)",
    "foreign key (position_id, owner_user_id)",
    "references public.positions (id, owner_user_id)",
    "foreign key (recommendation_id, owner_user_id)",
    "references public.recommendations (id, owner_user_id)",
    "on delete restrict",
    "position_version_history_position_version_safe_range_check",
    "position_version between 1 and 9007199254740991",
    "position_version_history_position_state_digest_format_check",
    "position_state_digest ~ '^[0-9a-f]{64}$'",
    "position_version_history_position_state_frame_present_check",
    "jsonb_typeof(position_state_frame) = 'object'",
    "default now()",
    "index_record.indrelid = 'public.position_version_history'::regclass",
    "array['recommendation_id', 'owner_user_id']::name[]",
    "alter table public.position_version_history enable row level security",
    "revoke all privileges on table public.position_version_history\n  from public, anon, authenticated",
    "pg_catalog.pg_policies",
    "create function public.action_666di_reject_position_version_history_mutation()",
    "security invoker",
    "set search_path = pg_catalog",
    "before update or delete on public.position_version_history",
  ].every((fragment) => value.includes(fragment));
}

type Evidence = {
  contract_version: string;
  action_id: string;
  predecessor: Record<string, unknown>;
  migration: Record<string, unknown>;
  source_document_sha256: Record<string, string>;
  authority_limits: Record<string, boolean>;
  decision: Record<string, unknown>;
};

test("pins the exact Action 666DH predecessor and reviewed migration bytes", async () => {
  const raw = await source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw) as Evidence;

  expect(Object.keys(evidence)).toEqual([
    "contract_version",
    "action_id",
    "predecessor",
    "migration",
    "source_document_sha256",
    "authority_limits",
    "decision",
  ]);
  expect(evidence.contract_version).toBe(
    "trade.action666di.position-version-history-source-migration-bytes.v1",
  );
  expect(evidence.action_id).toBe("ACTION_666DI");
  expect(evidence.predecessor).toEqual({
    main_commit: predecessorRevision,
    main_tree: "f108d74ea13206ab7e37dbab14f48ad8bbd18211",
    reviewed_head: "5572286f2545c7cc81e83534f4060a5a2ae280ac",
    exact_main_ci_run: 32515918303,
    action_666dh_path:
      "docs/action-666dh-position-version-history-source-migration-design.md",
    action_666dh_sha256:
      "eaed92f949989a144ccd645bc7cfdea541630f9bbf243900b4bc187e3ac36bbf",
  });
  expect(
    sha256(historicalSource(evidence.predecessor.action_666dh_path as string)),
  ).toBe(evidence.predecessor.action_666dh_sha256);
  expect(sha256(await source(migrationPath))).toBe(evidence.migration.sha256);
});

test("freezes the owner-bound, append-only schema boundary", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  expect(evidence.migration).toEqual({
    path: migrationPath,
    sha256: "157197f30250af99621bd82c737ba4e87800252742c62f60dd29fe41e4b3fa81",
    relation: "public.position_version_history",
    explicit_transaction_control: false,
    create_index_concurrently: false,
    dml_statements: false,
    runtime_writer_added: false,
    durable_identity_columns: ["position_id", "owner_user_id", "position_version"],
    parent_reference: "public.positions(id, owner_user_id)",
    recommendation_reference: "public.recommendations(id, owner_user_id)",
    restrictive_deletes: true,
    safe_integer_range: [1, 9007199254740991],
    sha256_lowercase_hex_required: true,
    state_frame_json_object_required: true,
    recorded_at_server_default: true,
    append_only_trigger: true,
    rls_enabled: true,
    client_grants: false,
    client_policies: false,
    mutable_current_position_version_fk_target: false,
  });

  const sql = await source(migrationPath);
  expect(hasRequiredMigrationBoundary(sql)).toBe(true);
  expect(normalized(sql)).not.toContain("create index concurrently");
  expect(normalized(sql)).not.toMatch(/\binsert\s+into\b/);
  expect(normalized(sql)).not.toMatch(/\bupdate\s+public\.positions\b/);
  expect(normalized(sql)).not.toMatch(/\bdelete\s+from\s+public\./);
  expect(normalized(sql)).not.toContain(
    "foreign key (position_id, owner_user_id, position_version)",
  );
});

test("rejects source drift that removes catalog, RLS or append-only proofs", async () => {
  const sql = await source(migrationPath);
  for (const mutation of [
    sql.replaceAll("on delete restrict", "on delete cascade"),
    sql.replace("index_record.indrelid = 'public.position_version_history'::regclass", ""),
    sql.replace("alter table public.position_version_history enable row level security;", ""),
    sql.replace(
      "revoke all privileges on table public.position_version_history\n  from public, anon, authenticated;",
      "revoke all privileges on table public.position_version_history\n  from public;",
    ),
    sql.replace("before update or delete on public.position_version_history", "before update on public.position_version_history"),
    sql.replace("position_state_digest ~ '^[0-9a-f]{64}$'", "position_state_digest is not null"),
  ]) {
    expect(mutation).not.toBe(sql);
    expect(hasRequiredMigrationBoundary(mutation)).toBe(false);
  }
});

test("binds all current source bytes and leaves application authority closed", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  for (const [relativePath, expectedHash] of Object.entries(
    evidence.source_document_sha256,
  )) {
    expect(sha256(await source(relativePath)), relativePath).toBe(expectedHash);
  }
  expect(evidence.authority_limits).toEqual({
    database_query_authorized: false,
    database_write_authorized: false,
    migration_apply_authorized: false,
    staging_apply_authorized: false,
    production_apply_authorized: false,
    generated_types_refresh_authorized: false,
    runtime_wiring_authorized: false,
    provider_mutation_authorized: false,
    production_deploy_authorized: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed: "position_version_history_source_migration_bytes",
    next_bounded_objective:
      "position_version_history_isolated_staging_apply_and_catalog_proof",
    production_authority_granted: false,
  });

  const [action, roadmap, ledger, registrationRaw, runner] = await Promise.all([
    source(actionPath),
    source(roadmapPath),
    source(ledgerPath),
    source(registrationPath),
    source(runnerPath),
  ]);
  for (const document of [action, roadmap, ledger]) {
    expect(document).toMatch(/action 666di/i);
    expect(document).toContain("position_version_history_source_migration_bytes");
    expect(document).toContain(predecessorRevision);
  }
  expect(action).toContain(migrationPath);
  expect(action).toContain("does not execute that SQL");
  const registration = JSON.parse(registrationRaw) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(runner.split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
