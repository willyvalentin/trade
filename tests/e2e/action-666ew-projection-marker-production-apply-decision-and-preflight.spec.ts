import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666ew-projection-marker-production-apply-decision-and-preflight.md";
const evidencePath =
  "docs/evidence/action-666ew-projection-marker-production-apply-decision-and-preflight.json";
const queryPath =
  "docs/sql/action-666ew-projection-marker-production-apply-decision-and-preflight.sql";
const migrationPath =
  "supabase/migrations/20260824133138_add_position_version_lineage_projection_contract_marker.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666ew-projection-marker-production-apply-decision-and-preflight.spec.ts";
const evidenceSha256 = "586f54ff39b68769823ab4c7249fb04cd0d1e91a3ffab916b7482f79f93da1d4";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EW pins the exact-green predecessor, source migration and preflight", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "727be4e2ca7ff7d570363aa1033bddd9e53fe92e",
    exact_main_ci_run: 32800439603,
    exact_main_ci_conclusion: "success",
    action_666ev_preflight_path:
      "docs/evidence/action-666ev-position-version-lineage-v2-writer-production-apply-decision-and-preflight.json",
  });
  expect(sha256(source(migrationPath))).toBe(evidence.source_migration.sha256);
  expect(sha256(source(queryPath))).toBe(
    evidence.production_read_only_preflight.query_sha256,
  );
});

test("666EW establishes clean marker-application readiness without applying it", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.source_migration).toMatchObject({
    path: migrationPath,
    production_migration_registry_entry_present: false,
    nullable_text_markers_added: 2,
    not_valid_constraints_added: 4,
    dml_statements: false,
    default_added: false,
    index_added: false,
    runtime_function_added: false,
    grant_or_policy_change: false,
    constraint_validation: false,
    physical_not_null_activation: false,
    generated_types_refresh: false,
    runtime_wiring: false,
    production_deployment: false,
  });
  expect(evidence.production_read_only_preflight).toMatchObject({
    transaction_read_only: true,
    aggregate_only_results: true,
    recommendations_relation_present: true,
    positions_relation_present: true,
    base_lineage_columns_nullable_exact_without_defaults: true,
    base_lineage_constraints_present_not_valid: true,
    recommendation_projection_marker_absent: true,
    position_projection_marker_absent: true,
    recommendations_rls_enabled: true,
    positions_rls_enabled: true,
    public_client_select_denied: true,
    row_contents_or_identifiers_returned: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_projection_contract_marker_production_apply_decision_and_preflight",
    next_bounded_objective:
      "position_version_lineage_projection_contract_marker_authorized_production_apply_and_catalog_proof",
    exact_marker_migration_eligible_for_next_independent_gate: true,
    production_migration_apply_performed_by_this_action: false,
    v2_writer_activation_authorized: false,
  });
});

test("666EW fails closed for mutation and broader authority", () => {
  const evidence = JSON.parse(source(evidencePath));
  const sql = source(queryPath).toLowerCase();

  expect(evidence.authority_limits).toEqual({
    production_database_query_performed: true,
    production_database_mutation_performed: false,
    production_migration_apply_performed: false,
    backfill_performed: false,
    constraint_validation_performed: false,
    physical_not_null_activation: false,
    generated_types_refresh_performed: false,
    runtime_wiring_performed: false,
    writer_invoked: false,
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

test("666EW is secret-free, roadmap-bound and registered exactly once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(documentation).toMatch(/production.*preflight|preflight.*production/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666ew/i);
  expect(source(ledgerPath)).toMatch(/action 666ew/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
