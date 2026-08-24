import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666eh-position-version-lineage-authorized-production-apply-and-catalog-proof.md";
const evidencePath =
  "docs/evidence/action-666eh-position-version-lineage-authorized-production-apply-and-catalog-proof.json";
const migrationPath =
  "supabase/migrations/20260824000000_add_position_version_lineage_columns.sql";
const ownerFoundationMigrationPath =
  "supabase/migrations/20260811163228_add_fail_closed_application_owner_foundation.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666eh-position-version-lineage-authorized-production-apply-and-catalog-proof.spec.ts";
const evidenceSha256 = "afb9a66b106e737d0f2d64806aac5aa188ceb24f3ece821c472e7faeb12e581a";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EH pins the green 666EG main delivery and exact production migration bytes", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);

  expect(evidence.predecessor).toEqual({
    protected_main_commit: "cfc8ba6d1ad859005774ac46ddf2eb1ce6d99a56",
    exact_main_ci_run: 32686495539,
    exact_main_ci_conclusion: "success",
    action_666eg_path:
      "docs/action-666eg-position-version-lineage-production-apply-decision-and-preflight.md",
    action_666ee_migration_sha256:
      "66fa75933f341fb672b223e2699e558c33e8b9c934e9765ba1ef70e15fbc77a0",
  });
  expect(sha256(source(migrationPath))).toBe(
    evidence.production_execution.source_migration_sha256,
  );
});

test("666EH proves only the additive production schema application and rollback-only v1 compatibility", () => {
  const evidence = JSON.parse(source(evidencePath));
  expect(evidence.production_execution).toMatchObject({
    production_targeted: true,
    source_migration_path: migrationPath,
    provider_assigned_migration_version: "20260824040107",
    migration_apply_succeeded: true,
    aggregate_only_results: true,
    row_owner_connection_identifiers_excluded: true,
    preflight: {
      target_migration_ledger_entry_absent: true,
      relations_present: true,
      target_lineage_column_count: 0,
      target_lineage_constraint_count: 0,
      recommendation_count: 1068,
      position_count: 8,
      position_version_history_count: 0,
      v1_boundary_preserved: true,
      relations_rls_and_client_select_denied: true,
    },
    catalog_proof: {
      all_seven_lineage_columns_exact_nullable: true,
      all_nine_checks_exist_not_valid: true,
      recommendation_rows_with_any_lineage_value: 0,
      position_rows_with_any_lineage_value: 0,
      existing_rls_preserved: true,
      client_select_denied: true,
      v1_security_definer_preserved: true,
      v1_fixed_search_path_preserved: true,
      v1_execute_boundary_preserved: true,
    },
    rollback_only_v1_fixture: {
      v1_fixture_created_all_null: true,
      recommendation_fixture_rolled_back: true,
      position_fixture_rolled_back: true,
    },
    post_apply_advisors: {
      security_target_lint_count: 0,
      performance_target_lint_count: 2,
      performance_target_lints_added_by_action_666ee: false,
    },
  });
  expect(evidence.authority_limits).toMatchObject({
    production_database_mutation_performed: true,
    production_migration_apply_performed: true,
    rollback_only_fixture_writes_performed: true,
    rollback_only_fixture_writes_persisted: false,
    backfill_performed: false,
    not_valid_constraints_validated: false,
    physical_not_null_activation: false,
    generated_types_refresh_performed: false,
    runtime_wiring_performed: false,
    grant_or_policy_change_performed: false,
    provider_or_broker_contact_performed: false,
    production_deployment_performed: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_authorized_production_apply_and_catalog_proof",
    next_bounded_objective:
      "position_version_lineage_owner_bound_backfill_admission_preflight",
    durable_backfill_authorized_by_this_action: false,
    constraint_validation_authorized_by_this_action: false,
    v2_writer_activation_authorized_by_this_action: false,
  });
});

test("666EH keeps the two target performance advisories outside the migration scope", () => {
  const evidence = JSON.parse(source(evidencePath));
  expect(evidence.production_execution.post_apply_advisors.performance_target_lints).toEqual([
    "positions_owner_status_created_at_idx",
    "positions_recommendation_owner_idx",
  ]);
  const ownerFoundation = source(ownerFoundationMigrationPath);
  for (const indexName of evidence.production_execution.post_apply_advisors
    .performance_target_lints) {
    expect(ownerFoundation).toContain(indexName);
  }
  expect(source(migrationPath)).not.toMatch(/\b(create\s+(?:unique\s+)?index|drop\s+index)\b/i);
});

test("666EH remains privacy-preserving and registered once in the foundation shard", () => {
  const documentation = `${source(actionPath)}\n${source(evidencePath)}`;
  expect(documentation).toMatch(/rollback-only/i);
  expect(documentation).toMatch(/backfill[\s\S]*separate|separate[\s\S]*backfill/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666eh/i);
  expect(source(ledgerPath)).toMatch(/action 666eh/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
