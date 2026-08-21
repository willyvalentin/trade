import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

const repositoryRoot = path.resolve(__dirname, "../..");
const predecessorRevision = "adff18009490e8ac3d079a8ef0fd47209fef0424";
const actionRevision = "5572286f2545c7cc81e83534f4060a5a2ae280ac";
const actionPath =
  "docs/action-666dh-position-version-history-source-migration-design.md";
const evidencePath =
  "docs/evidence/action-666dh-position-version-history-source-migration-design.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666dh-position-version-history-source-migration-design.spec.ts";
const evidenceSha256 = "e819f08de8bd7c1c9019132c46282f9b9db8f12bfde37d75099414a32166a303";

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

type Evidence = {
  contract_version: string;
  action_id: string;
  predecessor: Record<string, unknown>;
  migration_design: Record<string, unknown>;
  required_proofs: string[];
  source_document_sha256: Record<string, string>;
  authority_limits: Record<string, boolean>;
  decision: Record<string, unknown>;
};

test("pins the exact source-migration design and its Action 666DG predecessor", async () => {
  const raw = await source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw) as Evidence;
  expect(Object.keys(evidence)).toEqual([
    "contract_version",
    "action_id",
    "predecessor",
    "migration_design",
    "required_proofs",
    "source_document_sha256",
    "authority_limits",
    "decision",
  ]);
  expect(evidence.contract_version).toBe(
    "trade.action666dh.position-version-history-source-migration-design.v1",
  );
  expect(evidence.action_id).toBe("ACTION_666DH");
  expect(evidence.predecessor).toEqual({
    main_commit: predecessorRevision,
    main_tree: "cb2b72b098db6d3cfac6c7116cc5a3343324fcfe",
    reviewed_head: "8d43939285d9ab7a3f6b629db97bf439e197d0db",
    exact_main_ci_run: 32504982516,
    action_666dg_path:
      "docs/action-666dg-append-only-position-version-history-decision.md",
    action_666dg_sha256:
      "46f1d3c627e8f28e5d57d1e1a654a416f1252af9ec503003e6bd39759c7cf4eb",
  });
  expect(
    sha256(historicalSource(evidence.predecessor.action_666dg_path as string)),
  ).toBe(evidence.predecessor.action_666dg_sha256);
});

test("freezes the composite-key, append-only and RLS migration boundary", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  expect(evidence.migration_design).toEqual({
    relation: "public.position_version_history",
    migration_file_added_by_this_action: false,
    durable_identity_columns: ["position_id", "owner_user_id", "position_version"],
    position_version_safe_range: [1, 9007199254740991],
    owner_bound_parent_target: "public.positions(id, owner_user_id)",
    on_delete: "restrict",
    position_state_frame_required: true,
    position_state_digest_algorithm: "sha256_lowercase_hex_64",
    append_only_trigger_required: true,
    rls_enabled: true,
    anon_authenticated_grants: false,
    client_policies: false,
    mutable_current_position_version_is_fk_target: false,
    concurrent_index_inside_transaction_allowed: false,
  });
  expect(evidence.required_proofs).toEqual([
    "duplicate_key_rejection", "cross_owner_rejection", "stale_version_rejection",
    "maximum_version_refusal", "atomic_rollback_and_retry", "update_delete_refusal",
    "cascade_refusal", "rls_and_grant_denial", "post_apply_catalog_assertions",
  ]);
});

test("binds source bytes, stays source-only and registers exactly once", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_document_sha256)) {
    expect(sha256(historicalSourceAtAction(relativePath)), relativePath).toBe(expectedHash);
  }
  expect(evidence.authority_limits).toEqual({
    database_query_authorized: false, database_write_authorized: false,
    migration_file_authorized: false, staging_apply_authorized: false,
    production_apply_authorized: false, generated_types_refresh_authorized: false,
    runtime_wiring_authorized: false, provider_mutation_authorized: false,
    production_deploy_authorized: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed: "position_version_history_source_migration_design",
    next_bounded_objective: "position_version_history_source_migration_bytes",
    production_authority_granted: false,
  });
  const [registrationRaw, runner] = await Promise.all([
    source(registrationPath), source(runnerPath),
  ]);
  for (const document of [
    historicalSourceAtAction(actionPath),
    historicalSourceAtAction(roadmapPath),
    historicalSourceAtAction(ledgerPath),
  ]) {
    expect(document).toMatch(/action 666dh/i);
    expect(document).toContain("position_version_history_source_migration_design");
    expect(document).toContain(predecessorRevision);
  }
  expect(historicalSourceAtAction(actionPath)).not.toMatch(
    /create\s+table|alter\s+table|insert\s+into/i,
  );
  const registration = JSON.parse(registrationRaw) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(runner.split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
