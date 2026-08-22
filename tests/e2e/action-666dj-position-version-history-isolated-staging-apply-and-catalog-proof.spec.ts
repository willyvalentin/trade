import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

const repositoryRoot = path.resolve(__dirname, "../..");
const predecessorRevision = "16bf7504a7651bcbd0e1991e46580298cc6f03d0";
const actionPath =
  "docs/action-666dj-position-version-history-isolated-staging-apply-and-catalog-proof.md";
const evidencePath =
  "docs/evidence/action-666dj-position-version-history-isolated-staging-apply-and-catalog-proof.json";
const migrationPath =
  "supabase/migrations/20260821194333_create_position_version_history.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const predecessorTest =
  "tests/e2e/action-666di-position-version-history-source-migration-bytes.spec.ts";
const thisTest =
  "tests/e2e/action-666dj-position-version-history-isolated-staging-apply-and-catalog-proof.spec.ts";
const evidenceSha256 = "3987a998a6ae23ff8f9eede207d15ca20a25cb97533cb8407154357ee9ccbeb2";

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

type Evidence = {
  contract_version: string;
  action_id: string;
  observed_at: string;
  predecessor: Record<string, unknown>;
  staging_execution: Record<string, unknown>;
  source_document_sha256: Record<string, string>;
  authority_limits: Record<string, boolean>;
  decision: Record<string, unknown>;
};

test("freezes the privacy-preserving isolated staging receipt", async () => {
  const raw = await source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  expect(raw).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  expect(raw).not.toContain("pdvzyuhykomwfqyyztru");
  expect(raw).not.toContain("ekdyopdrrkphlrsilyoo");

  const evidence = JSON.parse(raw) as Evidence;
  expect(Object.keys(evidence)).toEqual([
    "contract_version",
    "action_id",
    "observed_at",
    "predecessor",
    "staging_execution",
    "source_document_sha256",
    "authority_limits",
    "decision",
  ]);
  expect(evidence.contract_version).toBe(
    "trade.action666dj.position-version-history-isolated-staging-apply-and-catalog-proof.v1",
  );
  expect(evidence.action_id).toBe("ACTION_666DJ");
  expect(evidence.observed_at).toMatch(/^2026-08-22T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/);
  expect(evidence.predecessor).toEqual({
    main_commit: predecessorRevision,
    main_tree: "8409ee13dd81e8d8bc1374c1801c5701040b1fca",
    main_parents: [
      "b80584dca0c2b2f1c7f2dd8793d59ac63dbafe6b",
      "0e2e4defb6679e25a71466aee40fd3824e3862f0",
    ],
    exact_main_ci_run: 32566129762,
    action_666di_path:
      "docs/action-666di-position-version-history-source-migration-bytes.md",
    action_666di_migration_sha256:
      "aaf0d677da73316355e30bb3d613d0274244ed896fb4c3bf266bb8b045fd177f",
  });
});

test("requires the exact migration, aggregate-only catalog proof and rollback proof", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  expect(sha256(await source(migrationPath))).toBe(
    evidence.predecessor.action_666di_migration_sha256,
  );
  expect(evidence.staging_execution).toEqual({
    environment_label: "ture-staging",
    production_targeted: false,
    source_migration_path: migrationPath,
    source_migration_sha256:
      "aaf0d677da73316355e30bb3d613d0274244ed896fb4c3bf266bb8b045fd177f",
    migration_apply_succeeded: true,
    aggregate_only_results: true,
    row_owner_connection_identifiers_excluded: true,
    preflight: {
      row_security_off: true,
      positions_exists: true,
      recommendations_exists: true,
      history_absent_before_apply: true,
      positions_owner_target_eligible: true,
      recommendations_owner_target_eligible: true,
    },
    catalog_proof: {
      history_table_exists: true,
      history_row_count_after_apply: 0,
      rls_enabled: true,
      client_policy_count: 0,
      anon_table_privileges_all_revoked: true,
      authenticated_table_privileges_all_revoked: true,
      primary_key_exact: true,
      restrictive_foreign_keys_exact: true,
      safety_check_count: 6,
      recommendation_owner_index_exact: true,
      append_only_trigger_exact: true,
      append_only_function_execute_revoked: true,
    },
    rollback_behavioral_proof: {
      rollback_only: true,
      check_count: 14,
      all_checks_passed: true,
      valid_insert_accepted: true,
      duplicate_primary_key_rejected: true,
      cross_owner_foreign_key_rejected: true,
      minimum_version_enforced: true,
      maximum_version_enforced: true,
      digest_format_enforced: true,
      state_object_enforced: true,
      higher_version_retry_accepted: true,
      update_rejected_by_append_only_trigger: true,
      delete_rejected_by_append_only_trigger: true,
      position_parent_delete_restricted: true,
      recommendation_parent_delete_restricted: true,
      anon_read_denied: true,
      authenticated_read_denied: true,
    },
    post_rollback: {
      history_row_count: 0,
      rls_still_enabled: true,
    },
  });
});

test("binds current source bytes, exactly-once CI registration and closed production authority", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  for (const [relativePath, expectedHash] of Object.entries(
    evidence.source_document_sha256,
  )) {
    expect(sha256(await source(relativePath)), relativePath).toBe(expectedHash);
  }
  expect(evidence.authority_limits).toEqual({
    staging_migration_apply_performed: true,
    staging_fixture_writes_rolled_back: true,
    production_database_query_performed: false,
    production_database_mutation_performed: false,
    production_migration_apply_performed: false,
    backfill_performed: false,
    generated_types_refresh_performed: false,
    runtime_wiring_performed: false,
    provider_configuration_mutation_performed: false,
    production_deployment_performed: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_history_isolated_staging_apply_and_catalog_proof",
    next_bounded_objective: "separate_production_apply_or_backfill_decision",
    production_authority_granted: false,
  });

  const [action, roadmap, ledger, registrationRaw, runner] = await Promise.all([
    source(actionPath),
    source(roadmapPath),
    source(ledgerPath),
    source(registrationPath),
    source(runnerPath),
  ]);
  for (const document of [action, roadmap, ledger]) {
    expect(document).toMatch(/action 666dj/i);
    expect(document).toContain(predecessorRevision);
  }
  expect(action).not.toContain("pdvzyuhykomwfqyyztru");
  expect(action).not.toContain("ekdyopdrrkphlrsilyoo");
  expect(action).toContain("14/14 checks");
  expect(action).toContain("post-rollback row count is zero");
  expect(action).toContain("not a production authorization");
  expect(roadmap).toContain("PRs #126 through #133");
  expect(ledger).toContain("PRs #126–#133");
  expect(Object.hasOwn(evidence.source_document_sha256, predecessorTest)).toBe(true);
  const registration = JSON.parse(registrationRaw) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(runner.split(JSON.stringify(thisTest)).length - 1).toBe(1);
});

test("fails closed for altered staging, proof or production-boundary claims", async () => {
  const raw = await source(evidencePath);
  const expected = JSON.parse(raw) as Evidence;
  for (const mutation of [
    raw.replace('"environment_label": "ture-staging"', '"environment_label": "production"'),
    raw.replace('"all_checks_passed": true', '"all_checks_passed": false'),
    raw.replace('"history_row_count": 0', '"history_row_count": 1'),
    raw.replace('"production_migration_apply_performed": false', '"production_migration_apply_performed": true'),
  ]) {
    expect(mutation).not.toBe(raw);
    expect(JSON.parse(mutation)).not.toEqual(expected);
  }
});
