import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IDEMPOTENCY_BINDING,
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_RESULT_DISPOSITIONS,
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_STATIC_CONTRACT,
} from "@/lib/transactional-recommendation-position-writer-static-contract";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666ds-transactional-recommendation-position-writer-static-implementation-boundary.md";
const evidencePath = "docs/evidence/action-666ds-transactional-recommendation-position-writer-static-implementation-boundary.json";
const modulePath = "lib/transactional-recommendation-position-writer-static-contract.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666ds-transactional-recommendation-position-writer-static-implementation-boundary.spec.ts";
const evidenceSha256 = "044a8aa73d0cd1bfae54003e2bf57eddc8b2487e9f07979537f02e7187563c17";

function source(relativePath: string) { return readFileSync(resolve(root, relativePath), "utf8"); }
function sha256(value: string) { return createHash("sha256").update(value, "utf8").digest("hex"); }

test("666DS exposes only the frozen default-deny static writer contract", () => {
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_STATIC_CONTRACT)).toBe(true);
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IDEMPOTENCY_BINDING)).toBe(true);
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_RESULT_DISPOSITIONS)).toBe(true);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_STATIC_CONTRACT).toEqual({
    contractVersion: "transactional_recommendation_position_writer_static_contract_v1",
    commandContractVersion: "action_655a2_recommendation_position_command_v2",
    authenticatedServerOwnerRequired: true,
    clientOwnerProjectionAuthoritative: false,
    requiresOnePrivateTransactionCapability: true,
    requiresExactLockedRecommendation: true,
    requiresCompleteIdempotencyBindingBeforePositionWrite: true,
    positionInitialHistoryVersion: 1,
    resultAvailableBeforeCommit: false,
    partialWritePermitted: false,
    implementationPresent: false,
    runtimeWiringPresent: false,
    routePresent: false,
    databaseOperationPresent: false,
    providerOperationPresent: false,
    brokerOperationPresent: false,
    deploymentAuthorityGranted: false,
    idempotencyBinding: TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IDEMPOTENCY_BINDING,
    resultDispositions: TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_RESULT_DISPOSITIONS,
  });
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IDEMPOTENCY_BINDING).toEqual([
    "durable_recommendation_uuid",
    "durable_recommendation_version",
    "recommendation_identity",
    "recommendation_normative_digest",
    "position_identity",
    "canonical_command_digest",
  ]);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_RESULT_DISPOSITIONS).toEqual([
    "created", "replayed", "conflict", "recommendation_binding_conflict",
    "stale_recommendation_version", "refused", "rolled_back",
  ]);
});

test("666DS binds the static module to frozen source evidence and protected CI", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);
  expect(evidence.static_contract).toEqual({
    contract_version: "transactional_recommendation_position_writer_static_contract_v1",
    command_contract_version: "action_655a2_recommendation_position_command_v2",
    authenticated_server_owner_required: true,
    client_owner_projection_authoritative: false,
    requires_one_private_transaction_capability: true,
    requires_exact_locked_recommendation: true,
    requires_complete_idempotency_binding_before_position_write: true,
    position_initial_history_version: 1,
    result_available_before_commit: false,
    partial_write_permitted: false,
    idempotency_binding_member_count: 6,
    result_disposition_count: 7,
  });
  expect(evidence.delivery).toEqual({
    kind: "source_only_static_contract",
    writer_implementation: false,
    database_operations: false,
    migration_file_added: false,
    runtime_wiring: false,
    provider_calls: false,
    broker_operations: false,
    deployment: false,
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(source(relativePath))).toBe(expectedHash);
  }
  const manifest = JSON.parse(source("docs/action-655a-server-owned-trade-management-contract-manifest.json"));
  expect(manifest.contracts.recommendation_position_command).toMatchObject({
    contract_version: TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_STATIC_CONTRACT.commandContractVersion,
    idempotency_binding: [...TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IDEMPOTENCY_BINDING],
    result_disposition: [...TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_RESULT_DISPOSITIONS],
  });
  expect(source(modulePath)).not.toMatch(/from\s+['"](?:@\/lib\/supabase|@supabase|next\/server|node:net|node:https|node:http)|\b(?:fetch|createClient|execute_sql|insert|update|delete)\s*\(/);
  expect(source(roadmapPath)).toMatch(/action 666ds/i);
  expect(source(ledgerPath)).toMatch(/action 666ds/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});

test("666DS documentation and evidence are privacy-safe and make no implementation claim", () => {
  const action = source(actionPath);
  const evidence = source(evidencePath);
  expect(`${action}\n${evidence}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(action).toContain("no callable writer");
  expect(action).toContain("cannot itself make a write");
});
