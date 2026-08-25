import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666eu-position-version-lineage-v2-writer-receipt-foreign-key-index-staging-apply-catalog-proof.md";
const evidencePath =
  "docs/evidence/action-666eu-position-version-lineage-v2-writer-receipt-foreign-key-index-staging-apply-catalog-proof.json";
const migrationPath =
  "supabase/migrations/20260824230454_position_version_lineage_v2_writer_receipt_foreign_key_indexes.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666eu-position-version-lineage-v2-writer-receipt-foreign-key-index-staging-apply-catalog-proof.spec.ts";
const evidenceSha256 =
  "d658d5fd7887694f3540671788927d771586de5a53c71e30dfd136edf6a506e1";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EU pins the exact-green predecessor and exact staged index bytes", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "1da62cf59a7218a20dd6657432d218ca13b92d22",
    exact_main_ci_run: 32790553157,
    exact_main_ci_conclusion: "success",
    action_666et_source_migration_package_path:
      "docs/evidence/action-666et-position-version-lineage-v2-writer-receipt-foreign-key-index-source-migration-package.json",
  });
  expect(sha256(source(migrationPath))).toBe(evidence.source_migration.sha256);
  expect(evidence.source_migration.applied_exact_reviewed_source).toBe(true);
});

test("666EU records minimal staging application and exact two-index catalog proof", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.isolated_staging.target_identity_published).toBe(false);
  expect(evidence.isolated_staging.target_health_verified).toBe(true);
  expect(evidence.isolated_staging.preflight).toEqual({
    receipt_relation_present: true,
    receipt_rls_enabled: true,
    recommendation_owner_foreign_key_present: true,
    deferred_position_owner_foreign_key_present: true,
    recommendation_owner_index_absent_before_apply: true,
    position_owner_index_absent_before_apply: true,
  });
  expect(evidence.isolated_staging.remote_migration_registry).toEqual({
    entry_name:
      "action_666et_position_version_lineage_v2_writer_receipt_foreign_key_indexes",
    apply_succeeded: true,
  });
  expect(evidence.isolated_staging.catalog_proof).toEqual({
    receipt_relation_present: true,
    receipt_rls_enabled: true,
    receipt_direct_access_revoked: true,
    recommendation_owner_index_exact: true,
    position_owner_index_exact: true,
  });
});

test("666EU classifies advisor output while retaining closed production and runtime authority", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.isolated_staging.advisor_classification).toEqual({
    receipt_unindexed_foreign_key_advisory_remediated: true,
    new_index_unused_advisory_expected_before_writer_workload: true,
    private_receipt_rls_without_policy_is_intentional_default_deny: true,
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
    grant_or_rls_change: false,
    deployment: false,
    provider_or_broker_contact: false,
    v2_writer_activated: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_v2_writer_receipt_foreign_key_index_isolated_staging_apply_and_catalog_proof",
    next_bounded_objective:
      "position_version_lineage_v2_writer_storage_and_foreign_key_index_production_apply_decision_and_preflight",
    production_apply_authorized: false,
    runtime_activation_authorized: false,
  });
});

test("666EU is secret-free, roadmap-bound and registered exactly once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(documentation).toMatch(/isolated staging/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666eu/i);
  expect(source(ledgerPath)).toMatch(/action 666eu/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
