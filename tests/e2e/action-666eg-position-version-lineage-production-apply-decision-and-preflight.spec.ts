import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666eg-position-version-lineage-production-apply-decision-and-preflight.md";
const evidencePath =
  "docs/evidence/action-666eg-position-version-lineage-production-apply-decision-and-preflight.json";
const queryPath =
  "docs/sql/action-666eg-position-version-lineage-production-preflight.sql";
const migrationPath =
  "supabase/migrations/20260824000000_add_position_version_lineage_columns.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666eg-position-version-lineage-production-apply-decision-and-preflight.spec.ts";
const evidenceSha256 = "ba09713ac621b56df8272abf19faf5a81c7ae2dd83a1a78c0bac91fdc47c2c0c";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EG pins the green 666EF main delivery and exact read-only preflight", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);

  expect(evidence.predecessor).toEqual({
    protected_main_commit: "dfd377f63b0b47a0ff4e80de0c02ccb4929f1380",
    exact_main_ci_run: 32682369515,
    exact_main_ci_conclusion: "success",
    action_666ef_path:
      "docs/action-666ef-position-version-lineage-isolated-staging-apply-and-catalog-proof.md",
    action_666ee_migration_sha256:
      "66fa75933f341fb672b223e2699e558c33e8b9c934e9765ba1ef70e15fbc77a0",
  });
  expect(sha256(source(queryPath))).toBe(
    evidence.production_read_only_preflight.query_sha256,
  );
  expect(sha256(source(migrationPath))).toBe(
    evidence.exact_next_apply_scope.migration_sha256,
  );
});

test("666EG permits only an aggregate-only readback and a later independent DDL gate", () => {
  const evidence = JSON.parse(source(evidencePath));
  expect(evidence.production_read_only_preflight).toMatchObject({
    transaction_read_only: true,
    aggregate_only_results: true,
    target_migration_ledger_entry_absent: true,
    recommendations_exists: true,
    positions_exists: true,
    position_version_history_exists: true,
    target_lineage_column_count: 0,
    target_lineage_constraint_count: 0,
    recommendation_count: 1068,
    position_count: 8,
    positions_without_recommendation_count: 0,
    position_version_history_count: 0,
    v1_command_present: true,
    v1_security_definer: true,
    v1_fixed_search_path: true,
    v1_anon_execute_denied: true,
    v1_authenticated_execute_denied: true,
    v1_service_role_execute_granted: true,
    recommendations_rls_enabled: true,
    positions_rls_enabled: true,
    anon_and_authenticated_select_denied: true,
    row_contents_or_identifiers_returned: false,
  });
  expect(evidence.exact_next_apply_scope).toMatchObject({
    migration_path: migrationPath,
    nullable_columns_added: 7,
    not_valid_constraints_added: 9,
    dml_statements: false,
    grant_or_policy_change: false,
    runtime_function_added: false,
    physical_not_null_activation: false,
    backfill: false,
    generated_types_refresh: false,
    runtime_wiring: false,
    production_deployment: false,
  });
  expect(evidence.authority_limits).toMatchObject({
    production_database_query_performed: true,
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
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_production_apply_decision_and_preflight",
    next_bounded_objective:
      "position_version_lineage_authorized_production_apply_and_catalog_proof",
    exact_additive_migration_eligible_for_next_independent_gate: true,
    production_migration_apply_performed_by_this_action: false,
  });
});

test("666EG preflight SQL fails closed for mutation and privacy drift", () => {
  const sql = source(queryPath).toLowerCase();
  expect(sql).toContain("begin read only");
  expect(sql).toContain("rollback");
  expect(sql).toContain("jsonb_build_object");
  expect(sql).not.toMatch(/\b(insert|update|delete|alter|create|drop|grant|revoke|truncate)\b/);
  const documentation = `${source(actionPath)}\n${source(evidencePath)}`;
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
});

test("666EG remains registered once in the required foundation shard", () => {
  expect(source(roadmapPath)).toMatch(/action 666eg/i);
  expect(source(ledgerPath)).toMatch(/action 666eg/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
