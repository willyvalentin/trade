import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_FAILURE_ATOMICITY_CONTRACT,
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_FAILURE_ATOMICITY_REQUIREMENTS,
} from "@/lib/transactional-recommendation-position-writer-failure-atomicity-contract";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666dz-transactional-recommendation-position-writer-failure-atomicity-contract.md";
const evidencePath = "docs/evidence/action-666dz-transactional-recommendation-position-writer-failure-atomicity-contract.json";
const modulePath = "lib/transactional-recommendation-position-writer-failure-atomicity-contract.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666dz-transactional-recommendation-position-writer-failure-atomicity-contract.spec.ts";
const evidenceSha256 = "bb31685f10b3631c0a48966bc59cffd2cb2539e522be9ad6fb9c6ae31eb6ced2";

function source(relativePath: string) { return readFileSync(resolve(root, relativePath), "utf8"); }
function sha256(value: string) { return createHash("sha256").update(value, "utf8").digest("hex"); }

test("666DZ exposes immutable default-deny failure-atomicity metadata", () => {
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_FAILURE_ATOMICITY_CONTRACT)).toBe(true);
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_FAILURE_ATOMICITY_REQUIREMENTS)).toBe(true);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_FAILURE_ATOMICITY_REQUIREMENTS).toEqual([
    "rejected_or_aborted_command_has_no_position_effect", "rejected_or_aborted_command_has_no_history_effect",
    "failed_reservation_never_claims_created_or_replayed_result", "transaction_failure_is_contained_before_result_visibility",
    "retry_cannot_materialize_a_prior_partial_effect", "failure_projection_preserves_owner_boundary",
  ]);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_FAILURE_ATOMICITY_CONTRACT).toEqual({
    contractVersion: "transactional_recommendation_position_writer_failure_atomicity_contract_v1",
    requirements: TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_FAILURE_ATOMICITY_REQUIREMENTS,
    rejectedCommandChecked: false, abortedCommandChecked: false,
    noPositionEffectVerified: false, noHistoryEffectVerified: false,
    failedReservationContained: false, retryPartialEffectRejected: false,
    ownerBoundFailureProjectionAdmitted: false, databaseOperationPresent: false,
    runtimeWiringPresent: false, productionAuthorityGranted: false,
  });
});

test("666DZ binds frozen evidence and protected CI without failure-path authority", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "8a2577929823fdcf8a792afb78dd87e14c6c9a84",
    protected_main_tree: "a149e07ec56bbb5dea1c401ba193982cb654cc26",
    exact_main_ci_run: 32643860630, exact_main_ci_conclusion: "success",
  });
  expect(evidence.failure_atomicity_contract).toEqual({
    requirement_count: 6, rejected_command_checked: false, aborted_command_checked: false,
    no_position_effect_verified: false, no_history_effect_verified: false,
    failed_reservation_contained: false, retry_partial_effect_rejected: false,
    owner_bound_failure_projection_admitted: false,
  });
  expect(evidence.delivery).toEqual({
    kind: "source_only_failure_atomicity_contract", database_operations: false,
    migration_file_added: false, runtime_wiring: false, provider_calls: false,
    broker_operations: false, deployment: false,
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(source(relativePath))).toBe(expectedHash);
  }
  const contractSource = source(modulePath);
  expect(contractSource).not.toMatch(/\b(?:fetch|createClient|execute_sql|insert|update|delete|select)\s*\(/);
  expect(contractSource).not.toMatch(/from\s+['"](?:@\/lib\/supabase|@supabase|next\/server|node:net|node:https|node:http)/);
  expect(source(roadmapPath)).toMatch(/action 666dz/i);
  expect(source(ledgerPath)).toMatch(/action 666dz/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});

test("666DZ documentation and evidence are privacy-safe and deny failure-path operations", () => {
  const action = source(actionPath);
  const evidence = source(evidencePath);
  expect(`${action}\n${evidence}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(action).toMatch(/no\s+database\s+client/);
  expect(action).toMatch(/does\s+not\s+itself\s+create,\s+alter,\s+delete,\s+restore\s+or\s+reveal\s+any\s+writer\s+state/);
});
