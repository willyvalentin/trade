import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666ev-position-version-lineage-v2-writer-production-apply-decision-and-preflight.md";
const evidencePath =
  "docs/evidence/action-666ev-position-version-lineage-v2-writer-production-apply-decision-and-preflight.json";
const queryPath =
  "docs/sql/action-666ev-position-version-lineage-v2-writer-production-apply-decision-preflight.sql";
const writerMigrationPath =
  "supabase/migrations/20260824195409_position_version_lineage_v2_writer_storage_routine_package.sql";
const indexMigrationPath =
  "supabase/migrations/20260824230454_position_version_lineage_v2_writer_receipt_foreign_key_indexes.sql";
const markerMigrationPath =
  "supabase/migrations/20260824133138_add_position_version_lineage_projection_contract_marker.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666ev-position-version-lineage-v2-writer-production-apply-decision-and-preflight.spec.ts";
const evidenceSha256 = "d9040fa2e8dfaa5d40ae5b26788e9897ac33155a22d0d303a085fb4ead43cf9c";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EV pins its exact-green predecessor, source bytes and read-only query", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "9221a15141629f7e48e89b63fb9e928648be2213",
    exact_main_ci_run: 32795454927,
    exact_main_ci_conclusion: "success",
    action_666eu_staging_catalog_proof_path:
      "docs/evidence/action-666eu-position-version-lineage-v2-writer-receipt-foreign-key-index-staging-apply-catalog-proof.json",
  });
  expect(sha256(source(writerMigrationPath))).toBe(
    evidence.reviewed_source_packages.writer_storage_routine.sha256,
  );
  expect(sha256(source(indexMigrationPath))).toBe(
    evidence.reviewed_source_packages.receipt_foreign_key_indexes.sha256,
  );
  expect(sha256(source(markerMigrationPath))).toBe(
    evidence.reviewed_source_packages.projection_contract_marker_prerequisite.sha256,
  );
  expect(sha256(source(queryPath))).toBe(
    evidence.production_read_only_preflight.query_sha256,
  );
});

test("666EV identifies the missing marker as a fail-closed production dependency", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.production_read_only_preflight).toMatchObject({
    transaction_read_only: true,
    aggregate_only_results: true,
    recommendations_relation_present: true,
    positions_relation_present: true,
    position_version_history_relation_present: true,
    base_lineage_prerequisite_columns_exact: true,
    history_writer_columns_exact: true,
    recommendation_projection_marker_present: false,
    position_projection_marker_present: false,
    receipt_relation_absent: true,
    writer_routine_absent: true,
    recommendation_owner_index_absent: true,
    position_owner_index_absent: true,
    pgcrypto_digest_dependency_present: true,
    recommendations_rls_enabled: true,
    positions_rls_enabled: true,
    public_client_select_denied: true,
    row_contents_or_identifiers_returned: false,
  });
  expect(evidence.reviewed_source_packages).toEqual({
    writer_storage_routine: {
      path: writerMigrationPath,
      sha256: "c9564854dcb81989afd2ff3de2279cc0309a8366592835b56d842fc736ab9196",
      production_migration_registry_entry_present: false,
    },
    receipt_foreign_key_indexes: {
      path: indexMigrationPath,
      sha256: "715a30b645e92347349125164c28a5c3288a28789b34865067ae778239ee87ad",
      production_migration_registry_entry_present: false,
    },
    projection_contract_marker_prerequisite: {
      path: markerMigrationPath,
      sha256: "f35a0a367354103fda9e3f68c6f085f998c4520f0eacde4e0d8c7bcbc18a2d13",
      production_migration_registry_entry_present: false,
    },
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_v2_writer_storage_and_foreign_key_index_production_apply_decision_and_preflight",
    blocking_dependency: "production_projection_contract_marker_absent",
    writer_storage_and_index_package_eligible_for_next_production_apply_gate: false,
    next_bounded_objective:
      "position_version_lineage_projection_contract_marker_production_apply_decision_and_preflight",
    production_apply_authorized_by_this_action: false,
    runtime_activation_authorized: false,
  });
});

test("666EV keeps production mutation and every broader authority closed", () => {
  const evidence = JSON.parse(source(evidencePath));
  const sql = source(queryPath).toLowerCase();

  expect(evidence.authority_limits).toEqual({
    production_database_query_performed: true,
    production_database_mutation_performed: false,
    production_migration_apply_performed: false,
    writer_invoked: false,
    backfill_performed: false,
    generated_types_refresh_performed: false,
    runtime_wiring_performed: false,
    grant_or_rls_change_performed: false,
    provider_or_broker_contact_performed: false,
    production_deployment_performed: false,
  });
  expect(sql).toContain("begin read only");
  expect(sql).toContain("rollback");
  expect(sql).toContain("jsonb_build_object");
  expect(sql).not.toMatch(
    /\b(insert|update|delete|alter|create|drop|grant|revoke|truncate)\b/,
  );
});

test("666EV is secret-free, roadmap-bound and registered exactly once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(documentation).toMatch(/production.*preflight|preflight.*production/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666ev/i);
  expect(source(ledgerPath)).toMatch(/action 666ev/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
