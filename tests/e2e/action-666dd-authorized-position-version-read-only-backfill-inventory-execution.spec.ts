import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const canonicalRevision = "981fcb3acc59030ce6531042ff5e0e0b27542501";
const actionPath =
  "docs/action-666dd-authorized-position-version-read-only-backfill-inventory-execution.md";
const evidencePath =
  "docs/evidence/action-666dd-authorized-position-version-read-only-backfill-inventory-execution.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666dd-authorized-position-version-read-only-backfill-inventory-execution.spec.ts";
const evidenceSha256 =
  "972c51db190b13784010d7893edd72639d46b153adc20e8be0215d9ea6aeec1d";

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function canonicalSource(relativePath: string) {
  return execFileSync("git", ["show", `${canonicalRevision}:${relativePath}`], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function gitGrep(pattern: string, paths: string[]) {
  try {
    return execFileSync("git", ["grep", "-l", pattern, "--", ...paths], {
      cwd: repositoryRoot,
      encoding: "utf8",
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 1
    ) {
      return "";
    }
    throw error;
  }
}

type Evidence = {
  contract_version: string;
  action_id: string;
  evidence_captured_at: string;
  authority: Record<string, unknown>;
  source_authority: Record<string, unknown>;
  execution: Record<string, unknown>;
  inventory: {
    row_counts: Record<string, number>;
    link_integrity: Record<string, number>;
    backfill_classes: Record<string, number>;
    catalog_guards: Record<string, boolean>;
    privacy: Record<string, boolean>;
  };
  reconciliation: Record<string, unknown>;
  source_document_sha256: Record<string, string>;
  decision: Record<string, unknown>;
};

test("pins exact execution authority, source and one-row read-only result", async () => {
  const raw = await source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw) as Evidence;

  expect(Object.keys(evidence)).toEqual([
    "contract_version",
    "action_id",
    "evidence_captured_at",
    "authority",
    "source_authority",
    "execution",
    "inventory",
    "reconciliation",
    "source_document_sha256",
    "decision",
  ]);
  expect(evidence.contract_version).toBe(
    "trade.action666dd.authorized-position-version-read-only-backfill-inventory-execution.v1",
  );
  expect(evidence.action_id).toBe("ACTION_666DD");
  expect(evidence.authority).toEqual({
    operator_approval_received: true,
    approved_sql_sha256:
      "eeec737109347a48d5bceaa4f1ab4ee5dcaa4303d9aaa884ef5ece94cfdff173",
    target_project_name: "Trade",
    target_project_id: "ekdyopdrrkphlrsilyoo",
    credential_boundary: "project_scoped_supabase_mcp_oauth",
    aggregate_only_output_required: true,
    evidence_destination: evidencePath,
    ddl_authorized: false,
    dml_authorized: false,
    migration_authorized: false,
    production_deploy_authorized: false,
    other_mutation_authorized: false,
  });
  expect(evidence.source_authority).toEqual({
    main_commit: "cb501d3ad3626be1bb13429a9791574a2040b64e",
    main_tree: "3f4a962de0f8ee49e86e096a21b7084dedf0b27b",
    reviewed_head: "c69aa68e08100de1df1092a0a07c75a4ce6c8daf",
    exact_main_ci_run: 32419997618,
    sql_path:
      "scripts/action-666dc-position-version-read-only-backfill-preflight.sql",
    sql_sha256:
      "eeec737109347a48d5bceaa4f1ab4ee5dcaa4303d9aaa884ef5ece94cfdff173",
  });
  expect(evidence.execution).toEqual({
    execution_count: 1,
    execution_channel: "supabase_mcp_execute_sql",
    query_result_rows: 1,
    contract_version: "position_version_read_only_backfill_preflight_v1",
    transaction_read_only: true,
    transaction_isolation: "repeatable read",
    row_security_fail_closed: true,
    rollback_statement_bound_in_approved_sql: true,
    database_mutation_performed: false,
    schema_mutation_performed: false,
    production_deploy_performed: false,
  });
});

test("reconciles every aggregate and leaves every inventory blocker at zero", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  const { row_counts, link_integrity, backfill_classes, catalog_guards } =
    evidence.inventory;

  expect(row_counts).toEqual({
    recommendations: 1049,
    positions: 8,
    recommendations_created_at_null: 0,
    positions_created_at_null: 0,
  });
  expect(link_integrity).toEqual({
    positions_recommendation_id_null: 0,
    positions_recommendation_id_present: 8,
    positions_orphaned_recommendation: 0,
    positions_owner_mismatch: 0,
    positions_owner_bound: 8,
    duplicate_owner_bound_link_groups: 0,
    duplicate_owner_bound_link_rows: 0,
    recommendations_without_position: 1041,
  });
  expect(backfill_classes).toEqual({
    recommendations_identity_seed_eligible: 1049,
    positions_lineage_copy_eligible: 8,
    positions_lineage_copy_blocked: 0,
  });
  expect(catalog_guards).toEqual({
    owner_bound_foreign_key_valid: true,
    recommendation_owner_unique_index_valid: true,
    position_owner_reference_index_valid: true,
    recommendations_rls_enabled: true,
    positions_rls_enabled: true,
  });
  expect(
    link_integrity.positions_recommendation_id_null +
      link_integrity.positions_recommendation_id_present,
  ).toBe(row_counts.positions);
  expect(link_integrity.positions_owner_bound).toBe(row_counts.positions);
  expect(backfill_classes.positions_lineage_copy_eligible).toBe(
    row_counts.positions,
  );
  expect(
    link_integrity.recommendations_without_position +
      link_integrity.positions_owner_bound,
  ).toBe(row_counts.recommendations);
  expect(evidence.reconciliation).toEqual({
    all_positions_linked: true,
    all_linked_positions_owner_bound: true,
    all_positions_lineage_copy_eligible: true,
    all_recommendations_identity_seed_eligible: true,
    position_totals_reconcile: true,
    recommendation_totals_reconcile: true,
    inventory_blocker_count: 0,
    inventory_clean: true,
  });
});

test("binds aggregate-only privacy and rejects evidence byte drift", async () => {
  const raw = await source(evidencePath);
  const evidence = JSON.parse(raw) as Evidence;
  expect(evidence.inventory.privacy).toEqual({
    aggregate_counts_and_booleans_only: true,
    row_contents_returned: false,
    row_identifiers_returned: false,
    owner_identifiers_returned: false,
    connection_identifier_returned: false,
    credential_returned: false,
  });

  const mutations = [
    raw.replace('"positions": 8', '"positions": 9'),
    raw.replace('"positions_owner_mismatch": 0', '"positions_owner_mismatch": 1'),
    raw.replace('"positions_lineage_copy_blocked": 0', '"positions_lineage_copy_blocked": 1'),
    raw.replace('"transaction_read_only": true', '"transaction_read_only": false'),
    raw.replace('"row_security_fail_closed": true', '"row_security_fail_closed": false'),
    raw.replace('"row_identifiers_returned": false', '"row_identifiers_returned": true'),
    raw.replace('"database_write_authorized": false', '"database_write_authorized": true'),
    raw.replace('\n  "decision": {', '\n  "unexpected": true,\n  "decision": {'),
  ];
  for (const mutation of mutations) {
    expect(mutation).not.toBe(raw);
    expect(sha256(mutation)).not.toBe(evidenceSha256);
  }
});

test("binds exact source documents and keeps later authority closed", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  for (const [relativePath, expectedHash] of Object.entries(
    evidence.source_document_sha256,
  )) {
    expect(sha256(canonicalSource(relativePath))).toBe(expectedHash);
  }
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "authorized_position_version_read_only_backfill_inventory_execution",
    next_bounded_objective:
      "deterministic_recommendation_lineage_backfill_contract",
    backfill_execution_authorized: false,
    migration_authorized: false,
    runtime_wiring_authorized: false,
    database_write_authorized: false,
    production_deploy_authorized: false,
    broker_or_automatic_execution_authorized: false,
  });

  const [action, roadmap, ledger] = await Promise.all([
    source(actionPath),
    source(roadmapPath),
    source(ledgerPath),
  ]);
  for (const document of [action, roadmap, ledger]) {
    expect(document).toMatch(/Action 666DD/i);
    expect(document).toContain(
      "deterministic_recommendation_lineage_backfill_contract",
    );
    expect(document).toContain(
      "cb501d3ad3626be1bb13429a9791574a2040b64e",
    );
    expect(document).toContain(
      "dbeed25f2074bff4dba8cee7f6d511cb17992efc",
    );
    expect(document).not.toMatch(
      /(?:github_pat_|ghp_|postgres(?:ql)?:\/\/|begin (?:rsa |ec |openssh )?private key)/i,
    );
  }
});

test("registers once in provider-free CI and remains runtime-unwired", async () => {
  const [registrationRaw, runner] = await Promise.all([
    source(registrationPath),
    source(runnerPath),
  ]);
  const registration = JSON.parse(registrationRaw) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(runner.split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(
    gitGrep("action666dd.authorized-position-version", [
      "app",
      "components",
      "lib",
    ]),
  ).toBe("");
  expect(
    gitGrep("deterministic_recommendation_lineage_backfill_contract", [
      "app",
      "components",
      "lib",
    ]),
  ).toBe("");
});
