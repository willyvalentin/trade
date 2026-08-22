import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

const repositoryRoot = path.resolve(__dirname, "../..");
const predecessorRevision = "1b1d903142be6413049d12b8078a110fc29dbd12";
const deliveryRevision = "0ce325d49ad3951cc898070b005fa1d224ef118a";
const actionPath =
  "docs/action-666dk-position-version-history-authorized-production-apply-and-catalog-proof.md";
const evidencePath =
  "docs/evidence/action-666dk-position-version-history-authorized-production-apply-and-catalog-proof.json";
const migrationPath =
  "supabase/migrations/20260821194333_create_position_version_history.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planOracleTest =
  "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const predecessorTest =
  "tests/e2e/action-666dj-position-version-history-isolated-staging-apply-and-catalog-proof.spec.ts";
const thisTest =
  "tests/e2e/action-666dk-position-version-history-authorized-production-apply-and-catalog-proof.spec.ts";
const evidenceSha256 = "c0c9e62e1c68bf2ad1b4ca8e0091d7a38a72394e3e24111517e913b9ff5dcf5f";

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function deliveredSource(relativePath: string) {
  return execFileSync(
    "git",
    ["show", `${deliveryRevision}:${relativePath}`],
    { cwd: repositoryRoot, encoding: "utf8" },
  );
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

type Evidence = {
  contract_version: string;
  action_id: string;
  observed_at: string;
  predecessor: Record<string, unknown>;
  production_execution: Record<string, unknown>;
  source_document_sha256: Record<string, string>;
  authority_limits: Record<string, boolean>;
  decision: Record<string, unknown>;
};

test("freezes the privacy-preserving production migration receipt", async () => {
  const raw = await source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  expect(raw).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  expect(raw).not.toContain("ekdyopdrrkphlrsilyoo");
  expect(raw).not.toContain("pdvzyuhykomwfqyyztru");

  const evidence = JSON.parse(raw) as Evidence;
  expect(Object.keys(evidence)).toEqual([
    "contract_version",
    "action_id",
    "observed_at",
    "predecessor",
    "production_execution",
    "source_document_sha256",
    "authority_limits",
    "decision",
  ]);
  expect(evidence.contract_version).toBe(
    "trade.action666dk.position-version-history-authorized-production-apply-and-catalog-proof.v1",
  );
  expect(evidence.action_id).toBe("ACTION_666DK");
  expect(evidence.observed_at).toBe("2026-08-22T12:37:53Z");
  expect(evidence.predecessor).toEqual({
    main_commit: predecessorRevision,
    main_tree: "634a75e7446192af6978fe472d1a76c141068010",
    main_parents: [
      "16bf7504a7651bcbd0e1991e46580298cc6f03d0",
      "2500d35ee29a3892e4bd83fb088c1f0c3bd6067c",
    ],
    exact_main_ci_run: 32571560062,
    action_666dj_path:
      "docs/action-666dj-position-version-history-isolated-staging-apply-and-catalog-proof.md",
    action_666di_migration_sha256:
      "aaf0d677da73316355e30bb3d613d0274244ed896fb4c3bf266bb8b045fd177f",
  });
});

test("requires the exact migration and aggregate-only production catalog proof", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  expect(sha256(await source(migrationPath))).toBe(
    evidence.predecessor.action_666di_migration_sha256,
  );
  expect(evidence.production_execution).toEqual({
    environment_label: "Trade",
    staging_targeted: false,
    source_migration_path: migrationPath,
    source_migration_sha256:
      "aaf0d677da73316355e30bb3d613d0274244ed896fb4c3bf266bb8b045fd177f",
    provider_migration_record: {
      version: "20260822123246",
      name: "20260821194333_create_position_version_history",
    },
    migration_apply_succeeded: true,
    aggregate_only_results: true,
    row_owner_connection_identifiers_excluded: true,
    preflight: {
      history_relation_absent: true,
      append_only_trigger_absent: true,
      append_only_function_absent: true,
      positions_owner_parent_target_eligible: true,
      recommendations_owner_parent_target_eligible: true,
    },
    postflight: {
      history_relation_exists: true,
      history_row_count: 0,
      rls_enabled: true,
      client_policies_absent: true,
      anon_and_authenticated_read_denied: true,
      anon_and_authenticated_write_denied: true,
      primary_key_valid: true,
      restrictive_owner_foreign_keys_valid: true,
      safety_check_count: 6,
      recommendation_owner_index_valid: true,
      append_only_trigger_enabled: true,
      security_invoker_function_with_fixed_path: true,
    },
    advisories: {
      new_relation_security_info: "rls_enabled_no_policy",
      new_relation_performance_info: "unused_index",
      new_relation_warning_or_error: false,
    },
    privacy: {
      row_contents_returned: false,
      row_identifiers_returned: false,
      owner_identifiers_returned: false,
      connection_identifiers_returned: false,
      credentials_embedded: false,
    },
  });
});

test("binds delivered source, exactly-once CI registration and consumed authority", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  expect(() =>
    execFileSync(
      "git",
      ["merge-base", "--is-ancestor", predecessorRevision, deliveryRevision],
      { cwd: repositoryRoot, encoding: "utf8" },
    ),
  ).not.toThrow();
  for (const [relativePath, expectedHash] of Object.entries(
    evidence.source_document_sha256,
  )) {
    expect(sha256(deliveredSource(relativePath)), relativePath).toBe(expectedHash);
  }
  expect(evidence.authority_limits).toEqual({
    production_database_query_performed: true,
    production_database_mutation_performed: true,
    production_migration_apply_performed: true,
    backfill_performed: false,
    generated_types_refresh_performed: false,
    runtime_wiring_performed: false,
    provider_configuration_mutation_performed: false,
    production_deployment_performed: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_history_authorized_production_apply_and_catalog_proof",
    next_bounded_objective:
      "position_version_history_generated_types_and_ma09_provenance_refresh",
    production_authority_consumed_for_exact_migration_only: true,
    production_deployment_authorized: false,
  });

  const [action, roadmap, ledger, registrationRaw, runner] = await Promise.all([
    deliveredSource(actionPath),
    deliveredSource(roadmapPath),
    deliveredSource(ledgerPath),
    source(registrationPath),
    source(runnerPath),
  ]);
  for (const document of [action, roadmap, ledger]) {
    expect(document).toMatch(/action 666dk/i);
    expect(document).toContain(predecessorRevision);
  }
  expect(action).not.toContain("ekdyopdrrkphlrsilyoo");
  expect(action).not.toContain("pdvzyuhykomwfqyyztru");
  expect(action).toContain("does not backfill legacy data");
  expect(Object.hasOwn(evidence.source_document_sha256, planOracleTest)).toBe(true);
  expect(Object.hasOwn(evidence.source_document_sha256, predecessorTest)).toBe(true);
  const registration = JSON.parse(registrationRaw) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(runner.split(JSON.stringify(thisTest)).length - 1).toBe(1);
});

test("fails closed for altered production, mutation or privacy claims", async () => {
  const raw = await source(evidencePath);
  const expected = JSON.parse(raw) as Evidence;
  for (const mutation of [
    raw.replace('"migration_apply_succeeded": true', '"migration_apply_succeeded": false'),
    raw.replace('"history_row_count": 0', '"history_row_count": 1'),
    raw.replace('"backfill_performed": false', '"backfill_performed": true'),
    raw.replace('"production_deployment_performed": false', '"production_deployment_performed": true'),
  ]) {
    expect(mutation).not.toBe(raw);
    expect(JSON.parse(mutation)).not.toEqual(expected);
  }
});
