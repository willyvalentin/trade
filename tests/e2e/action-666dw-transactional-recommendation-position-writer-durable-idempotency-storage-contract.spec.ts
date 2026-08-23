import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_DURABLE_IDEMPOTENCY_REQUIREMENTS,
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_DURABLE_IDEMPOTENCY_STORAGE_CONTRACT,
} from "@/lib/transactional-recommendation-position-writer-durable-idempotency-storage-contract";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666dw-transactional-recommendation-position-writer-durable-idempotency-storage-contract.md";
const evidencePath = "docs/evidence/action-666dw-transactional-recommendation-position-writer-durable-idempotency-storage-contract.json";
const modulePath = "lib/transactional-recommendation-position-writer-durable-idempotency-storage-contract.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666dw-transactional-recommendation-position-writer-durable-idempotency-storage-contract.spec.ts";
const evidenceSha256 = "2209d1612fcc24ca23ee06f821709f5e87980930b36fe58c724476d005111048";

function source(relativePath: string) { return readFileSync(resolve(root, relativePath), "utf8"); }
function sha256(value: string) { return createHash("sha256").update(value, "utf8").digest("hex"); }

test("666DW exposes immutable default-deny durable-idempotency metadata", () => {
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_DURABLE_IDEMPOTENCY_STORAGE_CONTRACT)).toBe(true);
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_DURABLE_IDEMPOTENCY_REQUIREMENTS)).toBe(true);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_DURABLE_IDEMPOTENCY_REQUIREMENTS).toEqual([
    "immutable_durable_idempotency_record", "complete_six_member_command_binding",
    "owner_bound_recommendation_scope", "same_transaction_replay_or_conflict_decision",
    "commit_before_created_or_replayed_result",
  ]);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_DURABLE_IDEMPOTENCY_STORAGE_CONTRACT).toEqual({
    contractVersion: "transactional_recommendation_position_writer_durable_idempotency_storage_contract_v1",
    requirements: TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_DURABLE_IDEMPOTENCY_REQUIREMENTS,
    storageAdapterSelected: false, durableStorageReadPresent: false,
    durableStorageWritePresent: false, immutableRecordAdmitted: false,
    completeCommandBindingAdmitted: false, ownerBoundRecommendationScopeAdmitted: false,
    replayDecisionAdmitted: false, conflictDecisionAdmitted: false,
    sameTransactionReservationAdmitted: false, resultObservationAdmitted: false,
    databaseOperationPresent: false, runtimeWiringPresent: false, productionAuthorityGranted: false,
  });
});

test("666DW binds frozen evidence and protected CI without storage authority", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "0da9b32fbc810969011686f31e7a6d6239723d0f",
    protected_main_tree: "387ab15ccd305bbd4a835113b467040d47485793",
    exact_main_ci_run: 32630534563,
    exact_main_ci_conclusion: "success",
  });
  expect(evidence.durable_idempotency_storage_contract).toEqual({
    requirement_count: 5, storage_adapter_selected: false,
    durable_storage_read_present: false, durable_storage_write_present: false,
    immutable_record_admitted: false, complete_command_binding_admitted: false,
    owner_bound_recommendation_scope_admitted: false, replay_decision_admitted: false,
    conflict_decision_admitted: false, same_transaction_reservation_admitted: false,
    result_observation_admitted: false,
  });
  expect(evidence.delivery).toEqual({
    kind: "source_only_durable_idempotency_storage_contract", database_operations: false,
    migration_file_added: false, runtime_wiring: false, provider_calls: false,
    broker_operations: false, deployment: false,
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(source(relativePath))).toBe(expectedHash);
  }
  const contractSource = source(modulePath);
  expect(contractSource).not.toMatch(/\b(?:fetch|createClient|execute_sql|insert|update|delete|select)\s*\(/);
  expect(contractSource).not.toMatch(/from\s+['"](?:@\/lib\/supabase|@supabase|next\/server|node:net|node:https|node:http)/);
  expect(source(roadmapPath)).toMatch(/action 666dw/i);
  expect(source(ledgerPath)).toMatch(/action 666dw/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});

test("666DW documentation and evidence are privacy-safe and deny storage operations", () => {
  const action = source(actionPath);
  const evidence = source(evidencePath);
  expect(`${action}\n${evidence}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(action).toContain("selects no storage adapter");
  expect(action).toMatch(/does not itself store, reserve,\s*replay or reject any command/);
});
