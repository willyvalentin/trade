import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666em-position-version-lineage-projection-contract-additive-migration-package.md";
const evidencePath =
  "docs/evidence/action-666em-position-version-lineage-projection-contract-additive-migration-package.json";
const migrationPath =
  "supabase/migrations/20260824133138_add_position_version_lineage_projection_contract_marker.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666em-position-version-lineage-projection-contract-additive-migration-package.spec.ts";
const evidenceSha256 =
  "f5d9748dc7fd99fc03291f448a83b8f305c7e48a0ec88e9a43618a674324600c";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalized(value: string) {
  return value
    .replaceAll("\r\n", "\n")
    .replaceAll(/--.*$/gm, "")
    .toLowerCase();
}

test("666EM pins the exact green storage-design predecessor and migration bytes", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);

  expect(evidence.predecessor).toEqual({
    protected_main_commit: "58f21634ca0da6d6cc3a10821ddb2de38b4b5728",
    exact_main_ci_run: 32729963024,
    exact_main_ci_conclusion: "success",
    action_666el_storage_design_path:
      "docs/evidence/action-666el-position-version-lineage-projection-contract-storage-design.json",
  });
  expect(sha256(source(migrationPath))).toBe(evidence.migration.sha256);
});

test("666EM adds only the nullable v2 marker and four fail-closed checks", () => {
  const evidence = JSON.parse(source(evidencePath));
  expect(evidence.migration).toMatchObject({
    path: migrationPath,
    created_with_supabase_migration_new: true,
    kind: "nullable_additive_projection_contract_marker_schema",
    column_name: "recommendation_projection_contract",
    column_type: "text",
    relations: ["public.recommendations", "public.positions"],
    allowed_non_null_value:
      "legacy_recommendation_normative_projection_v2",
    existing_action_666ee_constraints_retained: true,
    dml_statements: false,
    runtime_function_added: false,
    grant_or_policy_change: false,
    constraint_validation: false,
    physical_not_null_activation: false,
    default_added: false,
    index_added: false,
    foreign_key_added: false,
  });
  expect(evidence.migration.named_not_valid_constraints).toEqual([
    "recommendations_recommendation_projection_contract_value_check",
    "recommendations_lineage_projection_contract_complete_check",
    "positions_recommendation_projection_contract_value_check",
    "positions_lineage_projection_contract_complete_check",
  ]);

  const sql = normalized(source(migrationPath));
  for (const fragment of [
    "alter table public.recommendations",
    "add column if not exists recommendation_projection_contract text null",
    "alter table public.positions",
    "from pg_catalog.pg_attribute attribute_record",
    "action_666em_projection_contract_marker_shape_mismatch",
    "recommendations_recommendation_projection_contract_value_check",
    "recommendations_lineage_projection_contract_complete_check",
    "positions_recommendation_projection_contract_value_check",
    "positions_lineage_projection_contract_complete_check",
    "legacy_recommendation_normative_projection_v2",
    "not valid",
  ]) {
    expect(sql).toContain(fragment);
  }
  expect((sql.match(/\) not valid;/g) ?? []).length).toBe(4);
  expect(sql).not.toMatch(/\b(?:insert|update|delete)\s+(?:into\s+)?public\./);
  expect(sql).not.toMatch(/(?:^|\n)\s*(?:begin|commit|rollback)\s*;/m);
  expect(sql).not.toMatch(/\b(?:grant|revoke|create function|create policy|drop policy)\b/);
  expect(sql).not.toContain("set not null");
  expect(sql).not.toContain("default ");
  expect(sql).not.toContain("create index");
  expect(sql).not.toContain("foreign key");
});

test("666EM keeps the package source-only and future authority closed", () => {
  const evidence = JSON.parse(source(evidencePath));
  expect(evidence.delivery).toEqual({
    source_migration_added: true,
    database_operations: false,
    isolated_staging_apply: false,
    production_apply: false,
    durable_backfill: false,
    generated_types_refresh: false,
    runtime_wiring: false,
    deployment: false,
  });
  expect(evidence.authority_limits).toEqual({
    database_query_performed: false,
    database_mutation_performed: false,
    schema_mutation_performed: false,
    constraint_validation_performed: false,
    grant_or_policy_change_performed: false,
    provider_or_broker_contact_performed: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_projection_contract_additive_migration_package",
    next_bounded_objective:
      "position_version_lineage_projection_contract_isolated_staging_apply_and_catalog_proof",
    isolated_staging_apply_authorized: false,
    production_apply_authorized: false,
    backfill_authorized: false,
    v2_writer_activation_authorized: false,
  });
});

test("666EM is credential-free and registered exactly once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  expect(documentation).toMatch(/source.*migration|migration.*source/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666em/i);
  expect(source(ledgerPath)).toMatch(/action 666em/i);

  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
