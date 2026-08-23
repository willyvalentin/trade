import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_COMMIT_VISIBLE_RESULT_CONTRACT,
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_COMMIT_VISIBLE_RESULT_REQUIREMENTS,
} from "@/lib/transactional-recommendation-position-writer-commit-visible-result-contract";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666dy-transactional-recommendation-position-writer-commit-visible-result-contract.md";
const evidencePath = "docs/evidence/action-666dy-transactional-recommendation-position-writer-commit-visible-result-contract.json";
const modulePath = "lib/transactional-recommendation-position-writer-commit-visible-result-contract.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666dy-transactional-recommendation-position-writer-commit-visible-result-contract.spec.ts";
const evidenceSha256 = "d940bb438e930e2c242c2ede4f43dbaec2e9b2f001fbd4aa98242d3e4369753b";

function source(relativePath: string) { return readFileSync(resolve(root, relativePath), "utf8"); }
function sha256(value: string) { return createHash("sha256").update(value, "utf8").digest("hex"); }

test("666DY exposes immutable default-deny commit-visible-result metadata", () => {
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_COMMIT_VISIBLE_RESULT_CONTRACT)).toBe(true);
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_COMMIT_VISIBLE_RESULT_REQUIREMENTS)).toBe(true);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_COMMIT_VISIBLE_RESULT_REQUIREMENTS).toEqual([
    "exact_durable_idempotency_decision", "commit_confirmation_before_created_or_replayed_result",
    "owner_bound_six_member_command_result_binding", "paired_position_and_history_effect_result_binding",
    "conflict_never_claims_created_or_replayed_effect", "minimal_privacy_safe_result_projection",
  ]);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_COMMIT_VISIBLE_RESULT_CONTRACT).toEqual({
    contractVersion: "transactional_recommendation_position_writer_commit_visible_result_contract_v1",
    requirements: TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_COMMIT_VISIBLE_RESULT_REQUIREMENTS,
    durableDecisionObserved: false, transactionCommitConfirmed: false,
    ownerBoundCommandResultVerified: false, pairedEffectResultVerified: false,
    createdResultAdmitted: false, replayedResultAdmitted: false,
    conflictResultAdmitted: false, privacySafeResultProjectionAdmitted: false,
    databaseOperationPresent: false, runtimeWiringPresent: false, productionAuthorityGranted: false,
  });
});

test("666DY binds frozen evidence and protected CI without result authority", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "094e06e566823f367a482c466027a1b3b5ba9ebf",
    protected_main_tree: "695ff03d5cbb318af4fdbe6cafb43730e69aa236",
    exact_main_ci_run: 32638759351, exact_main_ci_conclusion: "success_after_targeted_retry",
  });
  expect(evidence.commit_visible_result_contract).toEqual({
    requirement_count: 6, durable_decision_observed: false,
    transaction_commit_confirmed: false, owner_bound_command_result_verified: false,
    paired_effect_result_verified: false, created_result_admitted: false,
    replayed_result_admitted: false, conflict_result_admitted: false,
    privacy_safe_result_projection_admitted: false,
  });
  expect(evidence.delivery).toEqual({
    kind: "source_only_commit_visible_result_contract", database_operations: false,
    migration_file_added: false, runtime_wiring: false, provider_calls: false,
    broker_operations: false, deployment: false,
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(source(relativePath))).toBe(expectedHash);
  }
  const contractSource = source(modulePath);
  expect(contractSource).not.toMatch(/\b(?:fetch|createClient|execute_sql|insert|update|delete|select)\s*\(/);
  expect(contractSource).not.toMatch(/from\s+['"](?:@\/lib\/supabase|@supabase|next\/server|node:net|node:https|node:http)/);
  expect(source(roadmapPath)).toMatch(/action 666dy/i);
  expect(source(ledgerPath)).toMatch(/action 666dy/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});

test("666DY documentation and evidence are privacy-safe and deny result operations", () => {
  const action = source(actionPath);
  const evidence = source(evidencePath);
  expect(`${action}\n${evidence}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(action).toMatch(/no\s+database\s+client/);
  expect(action).toMatch(/does\s+not\s+itself\s+inspect,\s+create,\s+replay,\s+reject\s+or\s+expose\s+a\s+writer\s+result/);
});
