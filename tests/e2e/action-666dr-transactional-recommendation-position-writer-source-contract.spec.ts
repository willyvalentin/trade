import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666dr-transactional-recommendation-position-writer-source-contract.md";
const evidencePath = "docs/evidence/action-666dr-transactional-recommendation-position-writer-source-contract.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666dr-transactional-recommendation-position-writer-source-contract.spec.ts";
const evidenceSha256 = "ba8892899a33abb093ec01ff3b53ef6594a91c7c99cc40e0d8b82f1d5ead72b5";

function source(relativePath: string) { return readFileSync(resolve(root, relativePath), "utf8"); }
function sha256(value: string) { return createHash("sha256").update(value, "utf8").digest("hex"); }

test("666DR freezes the private transaction-writer source contract", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);
  expect(evidence.writer_contract).toEqual({
    command_contract_version: "action_655a2_recommendation_position_command_v2",
    authenticated_server_owner_required: true,
    client_owner_projection_authoritative: false,
    recommendation_identity_alone_authorizes_handoff: false,
    requires_one_transaction_capability: true,
    requires_exact_locked_recommendation: true,
    requires_complete_idempotency_binding_before_position_write: true,
    position_initial_history_version: 1,
    same_transaction_effects: [
      "append_position_version_1",
      "transition_same_locked_recommendation_to_taken",
      "link_matching_snapshots",
      "append_audit_event",
    ],
    result_available_before_commit: false,
    exact_retry_returns_immutable_original_result: true,
    partial_write_permitted: false,
  });
  expect(evidence.delivery).toEqual({
    kind: "source_only_contract",
    implementation_file_added: false,
    database_operations: false,
    migration_file_added: false,
    runtime_wiring: false,
    provider_calls: false,
    broker_operations: false,
    deployment: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed: "transactional_recommendation_to_position_writer_source_contract",
    next_bounded_objective: "transactional_recommendation_to_position_writer_static_implementation_boundary",
    production_authority_granted: false,
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(source(relativePath))).toBe(expectedHash);
  }
  const command = JSON.parse(source("docs/action-655a-server-owned-trade-management-contract-manifest.json"))
    .contracts.recommendation_position_command;
  expect(command).toMatchObject({
    contract_version: evidence.writer_contract.command_contract_version,
    idempotency_binding: [
      "durable_recommendation_uuid",
      "durable_recommendation_version",
      "recommendation_identity",
      "recommendation_normative_digest",
      "position_identity",
      "canonical_command_digest",
    ],
    lock_identity: [
      "durable_recommendation_uuid",
      "durable_recommendation_version",
      "recommendation_identity",
      "recommendation_normative_digest",
    ],
    result_disposition: ["created", "replayed", "conflict", "recommendation_binding_conflict", "stale_recommendation_version", "refused", "rolled_back"],
  });
});

test("666DR remains provider-free, implementation-free and registered in protected CI", () => {
  const action = source(actionPath);
  const evidence = source(evidencePath);
  expect(`${action}\n${evidence}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(action).toContain("It adds no implementation");
  expect(action).toContain("not a client import");
  expect(action).toContain("There is no persistence implementation");
  expect(source(roadmapPath)).toMatch(/action 666dr/i);
  expect(source(ledgerPath)).toMatch(/action 666dr/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
