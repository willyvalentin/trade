import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

const repositoryRoot = path.resolve(__dirname, "../..");
const predecessorRevision = "a8b94861e53d2aff6fb7ceb5afa3f415a6363b7b";
const actionRevision = "adff18009490e8ac3d079a8ef0fd47209fef0424";
const actionPath =
  "docs/action-666dg-append-only-position-version-history-decision.md";
const evidencePath =
  "docs/evidence/action-666dg-append-only-position-version-history-decision.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666dg-append-only-position-version-history-decision.spec.ts";
const evidenceSha256 =
  "2ae25cf3369758362df0996fb6e1b9910cdfa3cafea47829d4e43bbf53a07f67";

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function historicalSource(relativePath: string) {
  return execFileSync("git", ["show", `${predecessorRevision}:${relativePath}`], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
}

function historicalSourceAtAction(relativePath: string) {
  return execFileSync("git", ["show", `${actionRevision}:${relativePath}`], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function gitGrepAtAction(pattern: string, paths: string[]) {
  try {
    return execFileSync(
      "git",
      ["grep", "-l", pattern, actionRevision, "--", ...paths],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
      },
    );
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && error.status === 1) {
      return "";
    }
    throw error;
  }
}

type Evidence = {
  contract_version: string;
  action_id: string;
  predecessor: Record<string, unknown>;
  history_contract: Record<string, unknown>;
  transition_contract: Record<string, unknown>;
  security_contract: Record<string, unknown>;
  source_document_sha256: Record<string, string>;
  authority_limits: Record<string, boolean>;
  decision: Record<string, unknown>;
};

test("pins the exact append-only position-version history decision", async () => {
  const raw = await source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw) as Evidence;

  expect(Object.keys(evidence)).toEqual([
    "contract_version",
    "action_id",
    "predecessor",
    "history_contract",
    "transition_contract",
    "security_contract",
    "source_document_sha256",
    "authority_limits",
    "decision",
  ]);
  expect(evidence.contract_version).toBe(
    "trade.action666dg.append-only-position-version-history-decision.v1",
  );
  expect(evidence.action_id).toBe("ACTION_666DG");
  expect(evidence.predecessor).toEqual({
    main_commit: predecessorRevision,
    main_tree: "cdc2e3b013c8c023b1a3b42a0ac31367a781e583",
    reviewed_head: "48fa88f592816b579777ed02b5cfeb3a8d29a889",
    exact_main_ci_run: 32492244739,
    action_666df_path:
      "docs/action-666df-canonical-recommendation-identity-reconciliation.md",
    action_666df_sha256:
      "b741cef3b4ccecd8e086ee73f9e00c05cf7e211a5d69c65c820721a96b5ff338",
    action_666df_evidence_path:
      "docs/evidence/action-666df-canonical-recommendation-identity-reconciliation.json",
    action_666df_evidence_sha256:
      "173b46cf3197065d18902e0af8f2bebad10892da5cc61a2002382933f778c045",
  });
  expect(
    sha256(historicalSource(evidence.predecessor.action_666df_path as string)),
  ).toBe(evidence.predecessor.action_666df_sha256);
  expect(
    sha256(
      historicalSource(evidence.predecessor.action_666df_evidence_path as string),
    ),
  ).toBe(evidence.predecessor.action_666df_evidence_sha256);
});

test("freezes the history key, append-only restriction and atomic transition", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  expect(evidence.history_contract).toEqual({
    contract_id: "position_version_history_v1",
    relation: "public.position_version_history",
    relation_created_by_this_action: false,
    durable_identity_columns: [
      "position_id",
      "owner_user_id",
      "position_version",
    ],
    position_version_sql_type: "bigint",
    minimum_position_version: 1,
    maximum_position_version: 9007199254740991,
    owner_bound_parent_reference: {
      source_columns: ["position_id", "owner_user_id"],
      target_relation: "public.positions",
      target_columns: ["id", "owner_user_id"],
    },
    version_bound_references_target_history_only: true,
    current_position_version_is_cas_only: true,
    locked_recommendation_tuple_columns: [
      "recommendation_id",
      "owner_user_id",
      "durable_recommendation_version",
      "recommendation_identity",
      "recommendation_normative_digest",
    ],
    separately_frozen_position_state_frame_required: true,
    position_state_digest_required: true,
    position_state_digest_algorithm: "sha256",
    parent_or_recommendation_cascade_delete_allowed: false,
    append_only_trigger_required: true,
    updates_or_deletes_allowed: false,
  });
  expect(evidence.transition_contract).toEqual({
    legacy_backfill_initial_version: 1,
    fresh_clean_inventory_required_before_backfill: true,
    deterministic_lineage_contract_required_before_backfill: true,
    owner_scoped_current_position_lock_required: true,
    expected_current_version_required: true,
    successor_increment: 1,
    maximum_version_refused: true,
    current_row_update_and_history_insert_atomic: true,
    history_insert_failure_rolls_back_current_row: true,
    stale_owner_or_recommendation_tuple_rolls_back: true,
    exact_retry_must_not_duplicate_history_identity: true,
    global_cross_position_order_claimed: false,
  });
  expect(evidence.security_contract).toEqual({
    rls_required: true,
    new_anon_or_authenticated_grants: false,
    client_write_policy_allowed: false,
    server_owned_writer_required: true,
    security_definer_search_path_fixed: true,
    public_anon_authenticated_execute_revoked: true,
    runtime_or_data_api_wiring_added_by_this_action: false,
  });
});

test("pins Action 666DG source bytes at its delivered main revision", async () => {
  const raw = await source(evidencePath);
  const evidence = JSON.parse(raw) as Evidence;
  for (const [relativePath, expectedHash] of Object.entries(
    evidence.source_document_sha256,
  )) {
    expect(sha256(historicalSourceAtAction(relativePath)), relativePath).toBe(expectedHash);
  }
  for (const mutation of [
    raw.replace('"position_version_history_v1"', '"position_version_history_v2"'),
    raw.replace('"version_bound_references_target_history_only": true', '"version_bound_references_target_history_only": false'),
    raw.replace('"updates_or_deletes_allowed": false', '"updates_or_deletes_allowed": true'),
    raw.replace('"current_row_update_and_history_insert_atomic": true', '"current_row_update_and_history_insert_atomic": false'),
    raw.replace('"database_write_authorized": false', '"database_write_authorized": true'),
    raw.replace('\n  "decision": {', '\n  "unexpected": true,\n  "decision": {'),
  ]) {
    expect(mutation).not.toBe(raw);
    expect(sha256(mutation)).not.toBe(evidenceSha256);
  }
});

test("keeps database and runtime authority closed while registering once", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  expect(evidence.authority_limits).toEqual({
    database_query_authorized: false,
    database_write_authorized: false,
    migration_authorized: false,
    staging_apply_authorized: false,
    production_apply_authorized: false,
    generated_types_refresh_authorized: false,
    runtime_wiring_authorized: false,
    provider_mutation_authorized: false,
    production_deploy_authorized: false,
    broker_or_automatic_execution_authorized: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed: "append_only_position_version_history_decision",
    next_bounded_objective: "position_version_history_source_migration_design",
    production_authority_granted: false,
  });
  const [registrationRaw, runner] = await Promise.all([
    source(registrationPath),
    source(runnerPath),
  ]);
  for (const document of [
    historicalSourceAtAction(actionPath),
    historicalSourceAtAction(roadmapPath),
    historicalSourceAtAction(ledgerPath),
  ]) {
    expect(document).toContain("Action 666DG");
    expect(document).toContain("append_only_position_version_history_decision");
    expect(document).toContain(predecessorRevision);
    expect(document).not.toMatch(
      /(?:github_pat_|ghp_|postgres(?:ql)?:\/\/|begin (?:rsa |ec |openssh )?private key)/i,
    );
  }
  expect(
    gitGrepAtAction("position_version_history", [
      "app",
      "components",
      "lib",
      "supabase/migrations",
    ]),
  ).toBe("");
  const registration = JSON.parse(registrationRaw) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(runner.split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
