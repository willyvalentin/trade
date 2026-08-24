import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666ep-position-version-lineage-projection-contract-v2-writer-command-port-admission-preflight.md";
const evidencePath =
  "docs/evidence/action-666ep-position-version-lineage-projection-contract-v2-writer-command-port-admission-preflight.json";
const queryPath =
  "docs/sql/action-666ep-position-version-lineage-projection-contract-v2-writer-command-port-admission-preflight.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666ep-position-version-lineage-v2-writer-command-port-admission-preflight.spec.ts";
const evidenceSha256 = "6371386fce765572b70a0705a2fc2fd6bae8aad5d15a77b247f7c74f5e9693b3";
const querySha256 = "cbe72e6b4f3f123278863770d610f6a94dd189b97bee6b0a9a6670ddbd4cb61d";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EP pins the exact green 666EO delivery before its independent preflight", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);

  const evidence = JSON.parse(raw);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "e19ee99de3359ed6f46571b9496dccae4ae4eaf4",
    exact_main_ci_run: 32753120497,
    exact_main_ci_conclusion: "success",
    action_666eo_design_path:
      "docs/evidence/action-666eo-position-version-lineage-projection-contract-v2-writer-command-port-design.json",
  });
});

test("666EP preserves the catalog foundation while refusing a v2 writer admission", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.isolated_staging_catalog_preflight).toEqual({
    scope: "catalog_boolean_only",
    query_path: queryPath,
    query_sha256: querySha256,
    application_row_contents_or_identifiers_returned: false,
    v2_source_and_target_columns_are_nullable_expected_types: true,
    v2_marker_constraints_are_present_not_valid: true,
    history_relation_is_owner_scoped_rls_append_only: true,
    target_tables_deny_anon_and_authenticated_table_privileges: true,
    existing_v1_private_boundary_retained: true,
    v2_marker_aware_writer_routine_present: false,
    proven_complete_v2_idempotency_storage_present: false,
  });
  expect(evidence.current_supabase_security_guidance).toEqual({
    security_definer_requires_fixed_search_path: true,
    function_execution_requires_explicit_restriction: true,
    relevant_breaking_change_detected_for_catalog_only_query: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_projection_contract_v2_writer_command_port_admission_preflight",
    next_bounded_objective:
      "position_version_lineage_projection_contract_v2_writer_command_port_storage_and_routine_package_design",
    concrete_v2_command_port_admitted: false,
    reason: "marker_aware_routine_and_complete_idempotency_storage_are_not_proven",
    production_change_authorized: false,
    backfill_authorized: false,
    runtime_activation_authorized: false,
  });
});

test("666EP query is a one-row catalog boolean receipt without a mutation primitive", () => {
  const query = source(queryPath);

  expect(sha256(query)).toBe(querySha256);
  expect(query).toMatch(/^-- Action 666EP[\s\S]*?^with[\s\S]*?^select jsonb_build_object\(/m);
  expect(query).toContain("isolated_staging_catalog_boolean_only");
  expect(query).toContain("v2_marker_aware_writer_routine_present");
  expect(query).toContain("proven_complete_v2_idempotency_storage_present");
  expect(query).toContain("'database_ddl_or_dml_executed', false");
  expect(query).toContain("'production_targeted', false");
  expect(query).not.toMatch(
    /^\s*(?:alter|create|drop|insert|update|delete|merge|grant|revoke|truncate|call)\b/im,
  );
});

test("666EP stays secret-free, source-bound, and registered exactly once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");

  expect(documentation).toMatch(/not admitted/i);
  expect(documentation).toMatch(/does not target production/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666ep/i);
  expect(source(ledgerPath)).toMatch(/action 666ep/i);

  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
