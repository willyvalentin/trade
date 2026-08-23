import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_ADMISSION_BUNDLE_CONTRACT,
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_ADMISSION_BUNDLE_PREDECESSOR_VERSIONS,
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_ADMISSION_BUNDLE_REQUIREMENTS,
} from "@/lib/transactional-recommendation-position-writer-admission-bundle-contract";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666ea-transactional-recommendation-position-writer-admission-bundle-contract.md";
const evidencePath = "docs/evidence/action-666ea-transactional-recommendation-position-writer-admission-bundle-contract.json";
const modulePath = "lib/transactional-recommendation-position-writer-admission-bundle-contract.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666ea-transactional-recommendation-position-writer-admission-bundle-contract.spec.ts";
const evidenceSha256 = "cd1d257fd1f675cd368f8dba90c3ffd0f5453f8111cae79532d2f08d665af6bd";

function source(relativePath: string) { return readFileSync(resolve(root, relativePath), "utf8"); }
function sha256(value: string) { return createHash("sha256").update(value, "utf8").digest("hex"); }

test("666EA exposes an immutable, default-deny seven-contract admission bundle", () => {
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_ADMISSION_BUNDLE_CONTRACT)).toBe(true);
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_ADMISSION_BUNDLE_REQUIREMENTS)).toBe(true);
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_ADMISSION_BUNDLE_PREDECESSOR_VERSIONS)).toBe(true);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_ADMISSION_BUNDLE_REQUIREMENTS).toEqual([
    "all_seven_predecessor_contract_versions_are_bound", "authenticated_owner_context_precedes_transaction_capability",
    "durable_idempotency_precedes_owner_bound_paired_effect", "commit_confirmation_precedes_created_or_replayed_result",
    "failure_atomicity_rejects_partial_effect_materialization", "separate_implementation_authority_is_required_before_operation",
  ]);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_ADMISSION_BUNDLE_PREDECESSOR_VERSIONS).toEqual({
    staticContract: "transactional_recommendation_position_writer_static_contract_v1",
    transactionCapability: "transactional_recommendation_position_writer_transaction_capability_contract_v1",
    authenticatedServerOwnerContext: "transactional_recommendation_position_writer_authenticated_server_owner_context_contract_v1",
    durableIdempotencyStorage: "transactional_recommendation_position_writer_durable_idempotency_storage_contract_v1",
    ownerBoundPositionEffect: "transactional_recommendation_position_writer_owner_bound_position_effect_contract_v1",
    commitVisibleResult: "transactional_recommendation_position_writer_commit_visible_result_contract_v1",
    failureAtomicity: "transactional_recommendation_position_writer_failure_atomicity_contract_v1",
  });
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_ADMISSION_BUNDLE_CONTRACT).toEqual({
    contractVersion: "transactional_recommendation_position_writer_admission_bundle_contract_v1",
    requirements: TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_ADMISSION_BUNDLE_REQUIREMENTS,
    predecessorVersions: TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_ADMISSION_BUNDLE_PREDECESSOR_VERSIONS,
    sourceManifestPresent: true, predecessorContractsOperationallyVerified: false,
    orderedAdmissionSequenceVerified: false, implementationAuthorityGranted: false,
    commandEvaluationAdmitted: false, durableStateInspectionAdmitted: false,
    transactionInvocationAdmitted: false, positionOrHistoryEffectAdmitted: false,
    resultExposureAdmitted: false, databaseOperationPresent: false,
    runtimeWiringPresent: false, productionAuthorityGranted: false,
  });
});

test("666EA binds frozen predecessor evidence and protected CI without implementation authority", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "3c72ece474dad62af2419a632849661576ebd836",
    protected_main_tree: "f8f91ee5d34c5316243b759d9efd57a51901e1a1",
    exact_main_ci_run: 32654878870, exact_main_ci_conclusion: "success",
  });
  expect(evidence.admission_bundle_contract).toEqual({
    predecessor_contract_count: 7, source_manifest_present: true,
    predecessor_contracts_operationally_verified: false,
    ordered_admission_sequence_verified: false, implementation_authority_granted: false,
    command_evaluation_admitted: false, durable_state_inspection_admitted: false,
    transaction_invocation_admitted: false, position_or_history_effect_admitted: false,
    result_exposure_admitted: false,
  });
  expect(evidence.delivery).toEqual({
    kind: "source_only_admission_bundle_contract", database_operations: false,
    migration_file_added: false, runtime_wiring: false, provider_calls: false,
    broker_operations: false, deployment: false,
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(source(relativePath))).toBe(expectedHash);
  }
  const contractSource = source(modulePath);
  expect(contractSource).not.toMatch(/\b(?:fetch|createClient|execute_sql|insert|update|delete|select)\s*\(/);
  expect(contractSource).not.toMatch(/from\s+['"](?:@\/lib\/supabase|@supabase|next\/server|node:net|node:https|node:http)/);
  expect(source(roadmapPath)).toMatch(/action 666ea/i);
  expect(source(ledgerPath)).toMatch(/action 666ea/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});

test("666EA documentation and evidence are privacy-safe and deny operations", () => {
  const action = source(actionPath);
  const evidence = source(evidencePath);
  expect(`${action}\n${evidence}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(action).toMatch(/no\s+database\s+client/);
  expect(action).toMatch(/does\s+not\s+evaluate\s+a\s+command,\s+inspect\s+durable\s+state,\s+invoke\s+a\s+transaction/);
});
