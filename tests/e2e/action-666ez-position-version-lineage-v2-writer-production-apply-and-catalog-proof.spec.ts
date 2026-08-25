import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666ez-position-version-lineage-v2-writer-production-apply-and-catalog-proof.md";
const evidencePath =
  "docs/evidence/action-666ez-position-version-lineage-v2-writer-production-apply-and-catalog-proof.json";
const queryPath =
  "docs/sql/action-666ez-v2-writer-production-apply-and-catalog-proof.sql";
const writerMigrationPath =
  "supabase/migrations/20260824195409_position_version_lineage_v2_writer_storage_routine_package.sql";
const indexMigrationPath =
  "supabase/migrations/20260824230454_position_version_lineage_v2_writer_receipt_foreign_key_indexes.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666ez-position-version-lineage-v2-writer-production-apply-and-catalog-proof.spec.ts";
const evidenceSha256 = "8a49c4f90349e64e705ce3cfa835daad948480ead29944a3941df434d5838c83";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EZ pins the exact-green predecessor and both reviewed writer migrations", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "bcda2dc10fd16dc75d1a96870213349306da5b83",
    exact_main_ci_run: 32816847379,
    exact_main_ci_conclusion: "success",
    action_666ey_evidence_path:
      "docs/evidence/action-666ey-position-version-lineage-v2-writer-production-apply-decision-and-preflight.json",
  });
  expect(sha256(source(writerMigrationPath))).toBe(
    evidence.reviewed_source_migrations.writer_storage_routine.sha256,
  );
  expect(sha256(source(indexMigrationPath))).toBe(
    evidence.reviewed_source_migrations.receipt_foreign_key_indexes.sha256,
  );
});

test("666EZ records only the ordered production apply and aggregate catalog proof", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.reviewed_source_migrations).toMatchObject({
    writer_storage_routine: {
      path: writerMigrationPath,
      preflight_registry_entry_absent: true,
      migration_apply_succeeded: true,
      postapply_registry_entry_present: true,
    },
    receipt_foreign_key_indexes: {
      path: indexMigrationPath,
      preflight_registry_entry_absent: true,
      migration_apply_succeeded: true,
      postapply_registry_entry_present: true,
    },
  });
  expect(evidence.production_proofs.preflight).toMatchObject({
    transaction_read_only: true,
    aggregate_only_results: true,
    projection_markers_nullable_text_without_defaults_exact: true,
    receipt_relation_absent: true,
    writer_routine_absent: true,
    receipt_foreign_key_indexes_absent: true,
    parent_rls_and_client_select_denial_intact: true,
  });
  expect(evidence.production_proofs.postflight).toMatchObject({
    query_path: queryPath,
    transaction_read_only: true,
    aggregate_only_results: true,
    private_schema_exists: true,
    service_role_private_usage_only: true,
    receipt_relation_exact_columns: true,
    receipt_rls_without_policies: true,
    receipt_client_privileges_denied: true,
    receipt_constraint_shape_and_validation: true,
    foreign_keys_target_expected_parents: true,
    position_owner_fk_deferred: true,
    receipt_foreign_key_indexes_valid: true,
    writer_routine_hardened: true,
    writer_routine_execute_restricted: true,
    parent_rls_and_client_select_denial_intact: true,
  });
  expect(sha256(source(queryPath))).toBe(
    evidence.production_proofs.postflight.query_sha256,
  );
});

test("666EZ fails closed for invocation, runtime and query mutation", () => {
  const evidence = JSON.parse(source(evidencePath));
  const query = source(queryPath).toLowerCase();

  expect(evidence.authority_limits).toEqual({
    production_database_query_performed: true,
    production_database_mutation_performed: true,
    production_migration_apply_performed: true,
    writer_invoked: false,
    backfill_performed: false,
    generated_types_refresh_performed: false,
    runtime_wiring_performed: false,
    reviewed_private_grant_or_rls_boundary_applied: true,
    unreviewed_grant_or_rls_change_performed: false,
    provider_or_broker_contact_performed: false,
    production_deployment_performed: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_v2_writer_storage_and_foreign_key_index_authorized_production_apply_and_catalog_proof",
    next_bounded_objective:
      "position_version_lineage_v2_writer_generated_types_provenance_refresh_and_runtime_binding_decision",
    production_migration_authority_consumed_for_exact_sources_only: true,
    writer_runtime_activation_authorized: false,
  });
  expect(query).toContain("begin read only");
  expect(query).toContain("rollback");
  expect(query).toContain("jsonb_build_object");
  const executableQuery = query.replace(/'(?:''|[^'])*'/g, "");
  expect(executableQuery).not.toMatch(
    /\b(insert|update|delete|alter|create|drop|grant|revoke|truncate)\b/,
  );
});

test("666EZ is secret-free, roadmap-bound and registered exactly once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(documentation).toMatch(/writer.*production|production.*writer/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666ez/i);
  expect(source(ledgerPath)).toMatch(/action 666ez/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
