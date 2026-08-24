import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666es-position-version-lineage-v2-writer-staging-apply-catalog-proof.md";
const evidencePath =
  "docs/evidence/action-666es-position-version-lineage-v2-writer-staging-apply-catalog-proof.json";
const migrationPath =
  "supabase/migrations/20260824195409_position_version_lineage_v2_writer_storage_routine_package.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666es-position-version-lineage-v2-writer-staging-apply-catalog-proof.spec.ts";
const evidenceSha256 =
  "071288db8f1f1b34eed8d995bfebf6adbf313883ed67b96eeb2c525c3d0175e3";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666ES pins its exact-green predecessor and applies the reviewed source bytes", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "a365d8357d3996ec90b885a9bdb013e365fb533c",
    exact_main_ci_run: 32777972800,
    exact_main_ci_conclusion: "success",
    action_666er_source_migration_package_path:
      "docs/evidence/action-666er-position-version-lineage-projection-contract-v2-writer-storage-routine-source-migration-package.json",
  });
  expect(sha256(source(migrationPath))).toBe(evidence.source_migration.sha256);
  expect(evidence.source_migration).toMatchObject({
    applied_exact_reviewed_source: true,
    stored_routine_not_invoked: true,
  });
});

test("666ES records the isolated staging preflight and private writer catalog proof", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.isolated_staging.target_identity_published).toBe(false);
  expect(evidence.isolated_staging.target_health_verified).toBe(true);
  expect(evidence.isolated_staging.preflight).toEqual({
    recommendations_table_present: true,
    positions_table_present: true,
    position_version_history_present: true,
    pgcrypto_digest_present: true,
    recommendation_v2_lineage_shapes_present: true,
    receipt_relation_absent_before_apply: true,
    writer_routine_absent_before_apply: true,
  });
  expect(evidence.isolated_staging.remote_migration_registry).toEqual({
    entry_name:
      "action_666er_position_version_lineage_v2_writer_storage_routine_package",
    apply_succeeded: true,
  });
  expect(evidence.isolated_staging.catalog_proof).toEqual({
    private_schema_present: true,
    receipt_relation_present: true,
    receipt_rls_enabled: true,
    receipt_columns_match_contract: true,
    receipt_primary_key_present: true,
    receipt_owner_recommendation_unique_present: true,
    recommendation_owner_foreign_key_present: true,
    deferred_position_owner_foreign_key_present: true,
    receipt_direct_access_revoked: true,
    writer_routine_present: true,
    writer_security_definer: true,
    writer_empty_search_path: true,
    writer_execute_is_service_role_only: true,
  });
});

test("666ES keeps promotion and runtime authority closed pending the index remedy", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.isolated_staging.advisor_classification).toEqual({
    private_receipt_rls_without_policy_is_intentional_default_deny: true,
    receipt_foreign_key_index_remediation_required_before_production: true,
  });
  expect(evidence.authority_limits).toEqual({
    staging_targeted: true,
    production_targeted: false,
    row_values_read: false,
    row_values_written: false,
    writer_invoked: false,
    backfill: false,
    generated_types_refresh: false,
    runtime_wiring: false,
    route_added: false,
    deployment: false,
    provider_or_broker_contact: false,
    v2_writer_activated: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_projection_contract_v2_writer_command_port_source_migration_isolated_staging_apply_and_catalog_proof",
    next_bounded_objective:
      "position_version_lineage_v2_writer_receipt_foreign_key_index_source_migration_package",
    production_apply_authorized: false,
    runtime_activation_authorized: false,
    foreign_key_index_remediation_required_before_production: true,
  });
});

test("666ES is secret-free, roadmap-bound and registered exactly once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(documentation).toMatch(/isolated staging/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666es/i);
  expect(source(ledgerPath)).toMatch(/action 666es/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
