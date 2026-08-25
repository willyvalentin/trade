import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666dt-transactional-recommendation-position-writer-implementation-preflight.md";
const evidencePath = "docs/evidence/action-666dt-transactional-recommendation-position-writer-implementation-preflight.json";
const typesPath = "lib/supabase-database.types.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666dt-transactional-recommendation-position-writer-implementation-preflight.spec.ts";
const evidenceSha256 = "076a55f6a96317cffe490d2794999098db10c02f5a0d553b0bebf4dc41dbf744";

function source(relativePath: string) { return readFileSync(resolve(root, relativePath), "utf8"); }
function historicalSource(revision: string, relativePath: string) {
  return execFileSync("git", ["show", `${revision}:${relativePath}`], {
    cwd: root,
    encoding: "utf8",
  });
}
function sha256(value: string) { return createHash("sha256").update(value, "utf8").digest("hex"); }

test("666DT freezes unresolved writer admissions and source-only history shape", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);
  expect(evidence.implementation_preflight).toEqual({
    authenticated_server_owner_context_admitted: false,
    transaction_capability_contract_admitted: false,
    idempotency_storage_admission_complete: false,
    history_shape_source_verified: true,
    history_row_member_count: 10,
    history_owner_bound_relationship_count: 2,
    result_before_commit_permitted: false,
    individual_effect_write_permitted: false,
    writer_implementation_admitted: false,
  });
  expect(evidence.delivery).toEqual({
    kind: "source_only_implementation_preflight",
    database_operations: false,
    migration_file_added: false,
    runtime_wiring: false,
    provider_calls: false,
    broker_operations: false,
    deployment: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed: "transactional_recommendation_to_position_writer_implementation_preflight",
    next_bounded_objective: "transactional_recommendation_to_position_writer_database_transaction_capability_contract",
    production_authority_granted: false,
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(historicalSource(evidence.predecessor.protected_main_commit, relativePath))).toBe(expectedHash);
  }
  const types = source(typesPath);
  const table = types.match(/position_version_history:\s*\{([\s\S]*?)\n\s*positions:/)?.[1] ?? "";
  const rowShape = table.match(/Row:\s*\{([\s\S]*?)\n\s{8}\}\n\s{8}Insert:/)?.[1] ?? "";
  expect(rowShape.match(/^\s{10}[a-z_]+:/gm)).toHaveLength(10);
  expect(table).toContain('foreignKeyName: "position_version_history_position_owner_fkey"');
  expect(table).toContain('foreignKeyName: "position_version_history_recommendation_owner_fkey"');
});

test("666DT remains provider-free and exactly once registered in protected CI", () => {
  const action = source(actionPath);
  const evidence = source(evidencePath);
  expect(`${action}\n${evidence}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(action).toContain("neither selects nor invokes an adapter");
  expect(action).toContain("cannot invoke a transaction");
  expect(source(roadmapPath)).toMatch(/action 666dt/i);
  expect(source(ledgerPath)).toMatch(/action 666dt/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
