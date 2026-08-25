import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666ex-projection-marker-production-apply-and-catalog-proof.md";
const evidencePath =
  "docs/evidence/action-666ex-projection-marker-production-apply-and-catalog-proof.json";
const queryPath =
  "docs/sql/action-666ex-projection-marker-production-apply-and-catalog-proof.sql";
const migrationPath =
  "supabase/migrations/20260824133138_add_position_version_lineage_projection_contract_marker.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666ex-projection-marker-production-apply-and-catalog-proof.spec.ts";
const evidenceSha256 = "4e857f5dfd5f439e001ee10fd2b3bfbe5c67a64c8f9955568760f13c2a0551a9";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EX pins the exact-green predecessor and additive marker migration", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "cee2889c4d3a3e0576d79f13b2d0fcc0a37f2cb6",
    exact_main_ci_run: 32807378805,
    exact_main_ci_conclusion: "success",
    action_666ew_evidence_path:
      "docs/evidence/action-666ew-projection-marker-production-apply-decision-and-preflight.json",
  });
  expect(sha256(source(migrationPath))).toBe(evidence.source_migration.sha256);
});

test("666EX records exactly the bounded production application and aggregate proof", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.source_migration).toMatchObject({
    path: migrationPath,
    preflight_registry_entry_absent: true,
    migration_apply_succeeded: true,
    postapply_registry_entry_present: true,
    dml_statements: false,
    default_added: false,
    index_added: false,
    runtime_function_added: false,
    grant_or_policy_change: false,
    constraint_validation: false,
    physical_not_null_activation: false,
  });
  expect(evidence.production_proofs.preflight).toMatchObject({
    transaction_read_only: true,
    aggregate_only_results: true,
    recommendation_projection_marker_absent: true,
    position_projection_marker_absent: true,
    public_client_select_denied: true,
  });
  expect(evidence.production_proofs.postflight).toMatchObject({
    query_path: queryPath,
    transaction_read_only: true,
    aggregate_only_results: true,
    target_relations_present: true,
    marker_columns_nullable_text_without_defaults_exact: true,
    marker_checks_present_not_valid: true,
    base_checks_remain_present_not_valid: true,
    legacy_all_null_tuple_remains_catalog_admissible: true,
    rls_enabled: true,
    client_select_denied: true,
  });
  expect(sha256(source(queryPath))).toBe(
    evidence.production_proofs.postflight.query_sha256,
  );
});

test("666EX fails closed for broader authority and query mutation", () => {
  const evidence = JSON.parse(source(evidencePath));
  const query = source(queryPath).toLowerCase();

  expect(evidence.authority_limits).toEqual({
    production_database_query_performed: true,
    production_database_mutation_performed: true,
    production_migration_apply_performed: true,
    backfill_performed: false,
    constraint_validation_performed: false,
    physical_not_null_activation: false,
    generated_types_refresh_performed: false,
    runtime_wiring_performed: false,
    writer_invoked: false,
    provider_or_broker_contact_performed: false,
    production_deployment_performed: false,
  });
  expect(query).toContain("begin read only");
  expect(query).toContain("rollback");
  expect(query).toContain("jsonb_build_object");
  expect(query).not.toMatch(
    /\b(insert|update|delete|alter|create|drop|grant|revoke|truncate)\b/,
  );
});

test("666EX is secret-free, roadmap-bound and registered exactly once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(documentation).toMatch(/production.*catalog|catalog.*production/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666ex/i);
  expect(source(ledgerPath)).toMatch(/action 666ex/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
