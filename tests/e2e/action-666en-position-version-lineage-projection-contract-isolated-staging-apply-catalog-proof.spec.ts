import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666en-position-version-lineage-projection-contract-isolated-staging-apply-catalog-proof.md";
const evidencePath =
  "docs/evidence/action-666en-position-version-lineage-projection-contract-isolated-staging-apply-catalog-proof.json";
const migrationPath =
  "supabase/migrations/20260824133138_add_position_version_lineage_projection_contract_marker.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666en-position-version-lineage-projection-contract-isolated-staging-apply-catalog-proof.spec.ts";
const evidenceSha256 =
  "2fcb7c9c80c5191c9738359396400ceb4d6337c9b6def70a28717c8a60f8dc10";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EN pins the exact green 666EM predecessor and exact staged source bytes", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);

  expect(evidence.predecessor).toEqual({
    protected_main_commit: "77be5d14bcbb3883049a601700d186dc68866667",
    exact_main_ci_run: 32737039472,
    exact_main_ci_conclusion: "success",
    action_666em_migration_package_path:
      "docs/evidence/action-666em-position-version-lineage-projection-contract-additive-migration-package.json",
  });
  expect(sha256(source(migrationPath))).toBe(evidence.source_migration.sha256);
  expect(evidence.source_migration.applied_exact_reviewed_source).toBe(true);
});

test("666EN records a minimal isolated-staging apply and exact catalog proof", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.isolated_staging.target_identity_published).toBe(false);
  expect(evidence.isolated_staging.target_health_verified).toBe(true);
  expect(evidence.isolated_staging.preflight).toEqual({
    recommendations_table_present: true,
    positions_table_present: true,
    recommendation_predecessor_columns_present: true,
    position_predecessor_columns_present: true,
    recommendation_predecessor_columns_expected_shape: true,
    position_predecessor_columns_expected_shape: true,
    projection_marker_absent_before_apply: true,
  });
  expect(evidence.isolated_staging.remote_migration_registry).toEqual({
    entry_name:
      "action_666em_add_position_version_lineage_projection_contract_marker",
    entry_version: "20260824144605",
    apply_succeeded: true,
  });
  expect(evidence.isolated_staging.catalog_proof).toEqual({
    marker_columns_are_nullable_text_without_defaults: true,
    four_new_constraints_are_present_not_valid: true,
    new_constraints_reference_marker: true,
    new_constraints_pin_v2_marker: true,
  });
});

test("666EN keeps all non-staging and writer authority closed", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.source_migration).toMatchObject({
    dml_statements: false,
    runtime_function_added: false,
    grant_or_policy_change: false,
    constraint_validation: false,
    physical_not_null_activation: false,
    default_added: false,
    index_added: false,
    foreign_key_added: false,
  });
  expect(evidence.authority_limits).toEqual({
    production_targeted: false,
    row_values_read: false,
    row_values_written: false,
    durable_backfill: false,
    constraint_validation_performed: false,
    grant_or_policy_change_performed: false,
    generated_types_refresh: false,
    runtime_wiring: false,
    deployment: false,
    provider_or_broker_contact: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_projection_contract_isolated_staging_apply_and_catalog_proof",
    next_bounded_objective:
      "position_version_lineage_projection_contract_v2_writer_command_port_design",
    production_apply_authorized: false,
    backfill_authorized: false,
    v2_writer_activation_authorized: false,
  });
});

test("666EN is secret-free, roadmap-bound and registered exactly once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  expect(documentation).toMatch(/isolated staging/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666en/i);
  expect(source(ledgerPath)).toMatch(/action 666en/i);

  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
