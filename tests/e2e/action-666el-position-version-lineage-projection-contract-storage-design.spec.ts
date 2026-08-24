import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666el-position-version-lineage-projection-contract-storage-design.md";
const evidencePath =
  "docs/evidence/action-666el-position-version-lineage-projection-contract-storage-design.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666el-position-version-lineage-projection-contract-storage-design.spec.ts";
const evidenceSha256 =
  "953979c926eb3aa873e62efcc05fed8dd8efc31babd02881112da5b5d4c10cea";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EL pins the exact green v2-successor predecessor and existing lineage bytes", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);

  expect(evidence.predecessor).toEqual({
    protected_main_commit: "e0f7e29b53ca4e8cf3ad928c19b2b7c0ac3dbdbe",
    exact_main_ci_run: 32723117665,
    exact_main_ci_conclusion: "success",
    action_666ek_contract_path:
      "docs/evidence/action-666ek-position-version-lineage-versioned-projection-successor-contract.json",
    action_666ee_migration_path:
      "supabase/migrations/20260824000000_add_position_version_lineage_columns.sql",
    action_666ee_migration_sha256:
      "66fa75933f341fb672b223e2699e558c33e8b9c934e9765ba1ef70e15fbc77a0",
  });
  expect(sha256(source(evidence.predecessor.action_666ee_migration_path))).toBe(
    evidence.predecessor.action_666ee_migration_sha256,
  );
});

test("666EL designs exactly one nullable v2 marker on both durable tuples", () => {
  const evidence = JSON.parse(source(evidencePath));
  expect(evidence.additive_marker_storage).toEqual({
    column_name: "recommendation_projection_contract",
    column_type: "text",
    nullable_until_separate_validation: true,
    relations: ["public.recommendations", "public.positions"],
    allowed_non_null_values: [
      "legacy_recommendation_normative_projection_v2",
    ],
    null_marker_means: "no_admissible_durable_lineage_result",
    default_allowed: false,
    in_place_v1_to_v2_upgrade_allowed: false,
  });
  expect(evidence.future_constraint_transition).toMatchObject({
    execution_authorized: false,
    atomic_schema_transaction_required: true,
    catalog_shape_preflight_required: true,
    constraint_validation_in_package_allowed: false,
    existing_action_666ee_constraints_retained: true,
    new_non_null_tuple_required_marker:
      "legacy_recommendation_normative_projection_v2",
    mixed_or_unknown_marker_disposition: "blocked_projection_contract_mismatch",
  });
  expect(evidence.future_constraint_transition.named_not_valid_constraints).toEqual([
    "recommendations_recommendation_projection_contract_value_check",
    "recommendations_lineage_projection_contract_complete_check",
    "positions_recommendation_projection_contract_value_check",
    "positions_lineage_projection_contract_complete_check",
  ]);
  expect(evidence.future_constraint_transition.recommendation_complete_tuple_members).toEqual([
    "recommendation_version",
    "recommendation_identity",
    "recommendation_normative_digest",
    "recommendation_projection_contract",
  ]);
  expect(evidence.future_constraint_transition.position_complete_tuple_members).toEqual([
    "position_version",
    "durable_recommendation_version",
    "recommendation_identity",
    "recommendation_normative_digest",
    "recommendation_projection_contract",
  ]);
});

test("666EL preserves server-only owner binding and stays design-only", () => {
  const evidence = JSON.parse(source(evidencePath));
  expect(evidence.future_writer_boundary).toEqual({
    execution_authorized: false,
    owner_matching_locked_recommendation_required: true,
    marker_copy_must_be_server_written: true,
    retry_requires_exact_marker_identity_digest_and_versions: true,
    row_local_check_authorizes_cross_relation_copy: false,
    unmarked_or_v1_complete_tuple_disposition:
      "stop_requires_separate_remediation_decision",
  });
  expect(evidence.authority_limits).toEqual({
    database_query_performed: false,
    database_mutation_performed: false,
    schema_mutation_performed: false,
    migration_source_added: false,
    durable_backfill_performed: false,
    constraint_validation_performed: false,
    generated_types_refresh_performed: false,
    runtime_wiring_performed: false,
    grant_or_policy_change_performed: false,
    production_deployment_performed: false,
    provider_or_broker_contact_performed: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_projection_contract_storage_design",
    next_bounded_objective:
      "position_version_lineage_projection_contract_additive_migration_package",
    staging_apply_authorized: false,
    production_apply_authorized: false,
    backfill_authorized: false,
    v2_writer_activation_authorized: false,
  });
});

test("666EL is credential-free and registered exactly once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  expect(documentation).toMatch(/additive.*marker|marker.*additive/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666el/i);
  expect(source(ledgerPath)).toMatch(/action 666el/i);

  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
