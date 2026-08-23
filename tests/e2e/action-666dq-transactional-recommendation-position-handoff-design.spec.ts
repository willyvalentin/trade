import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666dq-transactional-recommendation-position-handoff-design.md";
const evidencePath = "docs/evidence/action-666dq-transactional-recommendation-position-handoff-design.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666dq-transactional-recommendation-position-handoff-design.spec.ts";
const evidenceSha256 = "3b2f6515d68d9a6a2c0faab224185ca4af4c6726fe38872e124987d70f9046b8";

function source(relativePath: string) { return readFileSync(resolve(root, relativePath), "utf8"); }
function sha256(value: string) { return createHash("sha256").update(value, "utf8").digest("hex"); }

test("666DQ freezes the exact recommendation-to-position transaction contract", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);
  expect(evidence.handoff_design).toEqual({
    command_contract_version: "action_655a2_recommendation_position_command_v2",
    position_initial_version: 1,
    lock_exact_durable_recommendation: true,
    verify_canonical_command_bytes_before_write: true,
    recommendation_identity_alone_authorizes_handoff: false,
    idempotent_repeat_returns_immutable_replay_only: true,
    all_effects_commit_or_roll_back_together: true,
    mutable_position_version_is_durable_fk_target: false,
    exit_queue_created_by_this_handoff: false,
  });
  expect(evidence.delivery).toEqual({
    kind: "source_only_design",
    database_operations: false,
    migration_file_added: false,
    runtime_wiring: false,
    provider_calls: false,
    broker_operations: false,
    deployment: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed: "transactional_recommendation_to_position_handoff_design",
    next_bounded_objective: "transactional_recommendation_to_position_writer_source_contract",
    production_authority_granted: false,
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(source(relativePath))).toBe(expectedHash);
  }
  const manifest = JSON.parse(source("docs/action-655a-server-owned-trade-management-contract-manifest.json"));
  expect(manifest.contracts.recommendation_position_command).toMatchObject({
    contract_version: evidence.handoff_design.command_contract_version,
    result_disposition: ["created", "replayed", "conflict", "recommendation_binding_conflict", "stale_recommendation_version", "refused", "rolled_back"],
    transaction_steps: [
      "lock_exact_durable_recommendation_uuid_for_update",
      "verify_locked_uuid_version_identity_and_normative_digest",
      "verify_eligibility_and_exact_command_bytes",
      "reserve_or_verify_position_identity",
      "create_position_version_1",
      "transition_same_locked_recommendation_row_to_taken",
      "link_matching_snapshots",
      "append_audit_event",
      "commit",
    ],
  });
});

test("666DQ is provider-free, mutation-free and covered by the protected CI plan", () => {
  const action = source(actionPath);
  const evidence = source(evidencePath);
  expect(`${action}\n${evidence}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(action).toContain("There is no implementation");
  expect(action).toContain("does not define its database foreign keys");
  expect(action).toContain("It adds no route");
  expect(source(roadmapPath)).toMatch(/action 666dq/i);
  expect(source(ledgerPath)).toMatch(/action 666dq/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
