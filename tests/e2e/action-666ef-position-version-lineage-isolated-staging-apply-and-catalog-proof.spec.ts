import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666ef-position-version-lineage-isolated-staging-apply-and-catalog-proof.md";
const evidencePath =
  "docs/evidence/action-666ef-position-version-lineage-isolated-staging-apply-and-catalog-proof.json";
const migrationPath =
  "supabase/migrations/20260824000000_add_position_version_lineage_columns.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666ef-position-version-lineage-isolated-staging-apply-and-catalog-proof.spec.ts";
const evidenceSha256 = "289ebef2ac74cb5d001fb2c94c972db42b961e14a3319225aef53c6d7076134b";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EF pins the green 666EE main delivery and exact staging migration bytes", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);

  expect(evidence.predecessor).toEqual({
    protected_main_commit: "7dea60d4dd70a49ca59abf11e6288a4964023520",
    exact_main_ci_run: 32677913942,
    exact_main_ci_conclusion: "success",
    action_666ee_path:
      "docs/action-666ee-position-version-lineage-additive-migration-package.md",
    action_666ee_migration_sha256:
      "66fa75933f341fb672b223e2699e558c33e8b9c934e9765ba1ef70e15fbc77a0",
  });
  expect(sha256(source(migrationPath))).toBe(
    evidence.staging_execution.source_migration_sha256,
  );
});

test("666EF proves only nullable schema shape and rollback-only v1 compatibility", () => {
  const evidence = JSON.parse(source(evidencePath));
  expect(evidence.staging_execution).toMatchObject({
    environment_label: "ture-staging",
    production_targeted: false,
    source_migration_path: migrationPath,
    applied_migration_version: "20260824012555",
    migration_apply_succeeded: true,
    aggregate_only_results: true,
    row_owner_connection_identifiers_excluded: true,
    preflight: {
      recommendations_exists: true,
      positions_exists: true,
      existing_target_column_count: 0,
      existing_target_constraint_count: 0,
      v1_command_present: true,
      v1_command_security_definer: true,
    },
    catalog_proof: {
      all_seven_lineage_columns_exact_nullable: true,
      all_nine_checks_exist_not_valid: true,
      recommendations_empty_after_apply: true,
      positions_empty_after_apply: true,
      existing_rls_preserved: true,
      client_select_denied: true,
      v1_security_definer_preserved: true,
      v1_execute_boundary_preserved: true,
    },
    rollback_only_v1_fixture: {
      v1_fixture_created_all_null: true,
      recommendation_fixture_rolled_back: true,
      position_fixture_rolled_back: true,
    },
    post_apply_advisors: {
      security_target_lint_count: 0,
      performance_target_lint_count: 0,
    },
  });
  expect(evidence.authority_limits).toMatchObject({
    staging_migration_apply_performed: true,
    staging_fixture_writes_rolled_back: true,
    production_database_mutation_performed: false,
    production_migration_apply_performed: false,
    backfill_performed: false,
    not_valid_constraints_validated: false,
    physical_not_null_activation: false,
    generated_types_refresh_performed: false,
    runtime_wiring_performed: false,
    provider_or_broker_contact_performed: false,
    production_deployment_performed: false,
  });
});

test("666EF stays privacy-preserving and registered once in the foundation shard", () => {
  const documentation = `${source(actionPath)}\n${source(evidencePath)}`;
  expect(documentation).toMatch(/rollback-only/i);
  expect(documentation).toMatch(/production.*separate/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666ef/i);
  expect(source(ledgerPath)).toMatch(/action 666ef/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
