import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_TRANSACTION_CAPABILITY_CONTRACT,
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_TRANSACTION_PHASES,
} from "@/lib/transactional-recommendation-position-writer-transaction-capability-contract";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666du-transactional-recommendation-position-writer-transaction-capability-contract.md";
const evidencePath = "docs/evidence/action-666du-transactional-recommendation-position-writer-transaction-capability-contract.json";
const modulePath = "lib/transactional-recommendation-position-writer-transaction-capability-contract.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666du-transactional-recommendation-position-writer-transaction-capability-contract.spec.ts";
const evidenceSha256 = "93c8f1cb5bb2fc656d67901d488bd15ea6c06ce63e356a1f011468270a980e9d";

function source(relativePath: string) { return readFileSync(resolve(root, relativePath), "utf8"); }
function sha256(value: string) { return createHash("sha256").update(value, "utf8").digest("hex"); }

test("666DU exposes only an immutable default-deny transaction-capability contract", () => {
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_TRANSACTION_CAPABILITY_CONTRACT)).toBe(true);
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_TRANSACTION_PHASES)).toBe(true);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_TRANSACTION_PHASES).toEqual([
    "authenticated_server_owner_context", "single_private_transaction_capability",
    "durable_recommendation_lock", "durable_idempotency_binding_check",
    "owner_bound_position_and_history_mutation", "commit_before_result_observation",
    "closed_rollback_on_failure",
  ]);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_TRANSACTION_CAPABILITY_CONTRACT).toEqual({
    contractVersion: "transactional_recommendation_position_writer_transaction_capability_contract_v1",
    phases: TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_TRANSACTION_PHASES,
    adapterSelected: false, adapterInvocationPresent: false,
    authenticatedServerOwnerContextAdmitted: false, transactionCapabilityAdmitted: false,
    transactionBeginAdmitted: false, durableRecommendationLockAdmitted: false,
    durableIdempotencyReadAdmitted: false, ownerBoundPositionMutationAdmitted: false,
    ownerBoundHistoryAppendAdmitted: false, transactionCommitAdmitted: false,
    rollbackResultMayBeObserved: false, individualEffectOperationPresent: false,
    databaseOperationPresent: false, runtimeWiringPresent: false, productionAuthorityGranted: false,
  });
});

test("666DU binds frozen source evidence and protected CI without operational authority", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "a33e27b3d94a20ce7cd1a61cf26caa9c52fc2776",
    protected_main_tree: "65c40032c258f925bad11e1c5e054b6333247b9b",
    exact_main_ci_run: 32623411457,
    exact_main_ci_conclusion: "success",
  });
  expect(evidence.transaction_capability_contract).toEqual({
    phase_count: 7, adapter_selected: false, adapter_invocation_present: false,
    authenticated_server_owner_context_admitted: false, transaction_capability_admitted: false,
    transaction_begin_admitted: false, durable_recommendation_lock_admitted: false,
    durable_idempotency_read_admitted: false, owner_bound_position_mutation_admitted: false,
    owner_bound_history_append_admitted: false, transaction_commit_admitted: false,
    rollback_result_may_be_observed: false, individual_effect_operation_present: false,
  });
  expect(evidence.delivery).toEqual({
    kind: "source_only_transaction_capability_contract", database_operations: false,
    migration_file_added: false, runtime_wiring: false, provider_calls: false,
    broker_operations: false, deployment: false,
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(source(relativePath))).toBe(expectedHash);
  }
  const contractSource = source(modulePath);
  expect(contractSource).not.toMatch(/\b(?:fetch|createClient|execute_sql|insert|update|delete|begin|commit|rollback)\s*\(/);
  expect(contractSource).not.toMatch(/from\s+['"](?:@\/lib\/supabase|@supabase|next\/server|node:net|node:https|node:http)/);
  expect(source(roadmapPath)).toMatch(/action 666du/i);
  expect(source(ledgerPath)).toMatch(/action 666du/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});

test("666DU documentation and evidence are privacy-safe and deny live operations", () => {
  const action = source(actionPath);
  const evidence = source(evidencePath);
  expect(`${action}\n${evidence}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(action).toContain("does not select an adapter");
  expect(action).toContain("neither invokes nor authorizes a transaction");
});
