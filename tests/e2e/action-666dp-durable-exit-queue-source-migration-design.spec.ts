import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666dp-durable-exit-queue-source-migration-design.md";
const evidencePath = "docs/evidence/action-666dp-durable-exit-queue-source-migration-design.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666dp-durable-exit-queue-source-migration-design.spec.ts";
const evidenceSha256 = "18f3b01dd9e40e29b7875ef3144d6ff64e046ec7e41220e91d99caddc03df49e";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666DP freezes an owner-bound durable exit-queue design without a migration", () => {
  const evidenceRaw = source(evidencePath);
  expect(sha256(evidenceRaw)).toBe(evidenceSha256);
  const evidence = JSON.parse(evidenceRaw);
  expect(evidence).toEqual({
    contract_version: "trade.action666dp.durable-exit-queue-source-migration-design.v1",
    action_id: "ACTION_666DP",
    predecessor: {
      protected_main_commit: "a351b114aa8a1e96357036216db9ee1e1a21dc78",
      protected_main_tree: "08eabafbee40781b131297c0b584328e229d719e",
    },
    source_artifact_sha256: {
      "docs/action-655a-server-owned-trade-management-contract-manifest.json": "15b689bab4451ee6adf1cb5d215f4d331101ebf27ab20f1c0dd7d31591430cde",
      "docs/action-655a-server-owned-trade-management-threat-model.md": "b5512f2571ae37bcf8e73e22cf5c59a00a0d477080224a4c26323e382e13970b",
      "docs/action-655b-canonical-exit-evaluator-contract.md": "47574fe1fefa015622b6f48c9902ce85761ee6c24e5e3d5bb6860e88b5078873",
      "docs/action-666do-market-price-attestation-boundary.md": "b2cc5ebbd90f13105ba45569eacfd6dbb668117da1abe4ca5f1bc396eba8dfc2",
    },
    schema_design: {
      logical_relations: [
        "public.exit_queue_items",
        "public.exit_queue_attempts",
        "public.exit_queue_attempt_outcomes",
        "public.exit_queue_cancellations",
      ],
      queue_states: ["pending", "leased", "retry_wait", "succeeded", "failed_terminal", "cancelled"],
      history_key: "public.position_version_history(position_id, owner_user_id, position_version)",
      mutable_position_version_is_durable_fk_target: false,
      creation_requires_atomic_position_transition: true,
      attempt_outcome_is_append_only: true,
      cancellation_is_immutable: true,
    },
    security: {
      rls_required: true,
      anon_authenticated_direct_grants: false,
      client_policies: false,
      runtime_authority_granted: false,
    },
    delivery: {
      kind: "source_only_design",
      migration_file_added: false,
      database_operations: false,
      provider_calls: false,
      broker_operations: false,
      deployment: false,
    },
    decision: {
      bounded_objective_closed: "durable_exit_queue_source_migration_design",
      next_bounded_objective: "durable_exit_queue_source_migration_bytes",
      production_authority_granted: false,
    },
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(source(relativePath))).toBe(expectedHash);
  }
});

test("666DP remains a privacy-safe design and is protected by the full CI plan", () => {
  const action = source(actionPath);
  const evidence = source(evidencePath);
  expect(`${action}\n${evidence}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(action).toContain("does not add migration bytes");
  expect(action).toContain("No source design authorizes a service-role bypass");
  expect(action).toContain("append-only");
  expect(action).toContain("compare-and-swap predicate only");
  expect(source(roadmapPath)).toMatch(/action 666dp/i);
  expect(source(ledgerPath)).toMatch(/action 666dp/i);

  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
