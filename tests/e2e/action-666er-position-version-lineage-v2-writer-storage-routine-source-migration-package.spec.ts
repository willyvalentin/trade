import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666er-position-version-lineage-projection-contract-v2-writer-storage-routine-source-migration-package.md";
const evidencePath =
  "docs/evidence/action-666er-position-version-lineage-projection-contract-v2-writer-storage-routine-source-migration-package.json";
const migrationPath =
  "supabase/migrations/20260824195409_position_version_lineage_v2_writer_storage_routine_package.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666er-position-version-lineage-v2-writer-storage-routine-source-migration-package.spec.ts";
const evidenceSha256 =
  "0d92bc9b3b2280d302e7efc34098d687aaa63c4c6a6c8fe10469b5a0b523ea0f";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalized(value: string) {
  return value.replaceAll("\r\n", "\n").replaceAll(/--.*$/gm, "").toLowerCase();
}

test("666ER pins the exact green 666EQ predecessor and Supabase-created source bytes", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "5c016c0f920c4e2b833c3dc94a6d06ddd9750d82",
    exact_main_ci_run: 32767327322,
    exact_main_ci_conclusion: "success",
    action_666eq_package_design_path:
      "docs/evidence/action-666eq-position-version-lineage-projection-contract-v2-writer-storage-routine-package-design.json",
  });
  expect(evidence.migration).toMatchObject({
    path: migrationPath,
    sha256: sha256(source(migrationPath)),
    created_with_supabase_migration_new: true,
    source_bytes_reviewed_only: true,
    private_schema: "private",
    relation_identifier: "owner_bound_position_command_idempotency_v2",
    routine_identifier: "write_owner_bound_recommendation_position_v2",
    routine_signature:
      "private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)",
    database_apply_performed: false,
  });
});

test("666ER uses a private service-role-only routine and a deny-by-default receipt", () => {
  const sql = normalized(source(migrationPath));

  for (const fragment of [
    "create schema if not exists private",
    "revoke all on schema private from public, anon, authenticated",
    "grant usage on schema private to service_role",
    "create table private.owner_bound_position_command_idempotency_v2",
    "primary key (authenticated_server_owner, canonical_command_digest)",
    "unique (authenticated_server_owner, opaque_recommendation_reference)",
    "deferrable initially deferred",
    "enable row level security",
    "from public, anon, authenticated, service_role",
    "create function private.write_owner_bound_recommendation_position_v2(",
    "security definer",
    "set search_path = ''",
    "revoke all on function private.write_owner_bound_recommendation_position_v2(",
    ") from public, anon, authenticated",
    ") to service_role",
  ]) {
    expect(sql).toContain(fragment);
  }

  expect(sql).not.toContain("execute format");
  expect(sql).not.toContain("set search_path = pg_catalog, public");
  expect(sql).not.toContain("grant execute on function private.write_owner_bound_recommendation_position_v2(\n  uuid, uuid, text\n) to anon");
  expect(sql).not.toContain("grant execute on function private.write_owner_bound_recommendation_position_v2(\n  uuid, uuid, text\n) to authenticated");
});

test("666ER derives v2 authority under lock and makes retry effects all-or-nothing", () => {
  const sql = normalized(source(migrationPath));
  const evidence = JSON.parse(source(evidencePath));

  for (const fragment of [
    "from public.recommendations",
    "and owner_user_id = p_authenticated_server_owner",
    "for update",
    "action_666er_recommendation_lineage_not_v2_complete",
    "legacy_recommendation_normative_projection_v2",
    "on conflict (authenticated_server_owner, canonical_command_digest)",
    "do nothing",
    "action_666er_receipt_binding_conflict",
    "insert into public.positions",
    "position_version",
    "durable_recommendation_version",
    "insert into public.position_version_history",
    "extensions.digest(",
    "disposition := 'replayed'",
    "disposition := 'created'",
  ]) {
    expect(sql).toContain(fragment);
  }

  expect(evidence.receipt_contract.complete_binding_fields).toEqual([
    "authenticated_server_owner",
    "opaque_recommendation_reference",
    "recommendation_version",
    "recommendation_identity",
    "recommendation_normative_digest",
    "recommendation_projection_contract",
    "server_generated_position_identity",
    "initial_position_version",
    "canonical_command_digest",
    "committed_outcome",
    "initial_history_identity",
  ]);
  expect(evidence.transaction_contract).toEqual({
    owner_scoped_recommendation_lock_first: true,
    complete_exact_v2_tuple_required_before_receipt_effect: true,
    exact_committed_receipt_replays_only_after_paired_effect_proof: true,
    reservation_precedes_position_effect: true,
    initial_position_version: 1,
    owner_scoped_initial_history_insert: true,
    position_state_digest_algorithm: "sha256",
    exception_rolls_back_receipt_position_recommendation_state_and_history: true,
    second_position_on_retry_or_conflict: false,
  });
});

test("666ER keeps the delivery source-only, secret-free, roadmap-bound and registered once", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.authority_limits).toEqual({
    database_connection_opened: false,
    database_ddl_or_dml_applied: false,
    staging_targeted: false,
    production_targeted: false,
    generated_types_refresh: false,
    runtime_wiring: false,
    route_added: false,
    backfill: false,
    deployment: false,
    provider_or_broker_contact: false,
    v2_writer_activated: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_projection_contract_v2_writer_command_port_storage_and_routine_source_migration_package",
    next_bounded_objective:
      "position_version_lineage_projection_contract_v2_writer_command_port_source_migration_isolated_staging_apply_and_catalog_proof",
    isolated_staging_apply_authorized_by_this_action: false,
    production_apply_authorized_by_this_action: false,
    runtime_activation_authorized: false,
  });
  expect(documentation).toMatch(/source.*migration|migration.*source/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666er/i);
  expect(source(ledgerPath)).toMatch(/action 666er/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
