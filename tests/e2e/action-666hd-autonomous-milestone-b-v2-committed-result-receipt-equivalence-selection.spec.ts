import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666hd-autonomous-milestone-b-v2-committed-result-receipt-equivalence-selection.md";
const evidencePath =
  "docs/evidence/action-666hd-autonomous-milestone-b-v2-committed-result-receipt-equivalence-selection.json";
const receiptPath =
  "lib/server/position-version-lineage-v2-writer-immutable-committed-result-receipt.ts";
const sourceContractPath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const preflightPath =
  "lib/position-version-lineage-v2-writer-private-command-port-runtime-binding-admission-preflight.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666hd-autonomous-milestone-b-v2-committed-result-receipt-equivalence-selection.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("666HD selects only the immutable receipt equivalence comparator", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.contract_version).toBe(
    "trade.action666hd.position-version-lineage-v2-committed-result-receipt-equivalence-selection.v1",
  );
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "acba47bc9e3b28b26e60dac259c0c2108a86eb71",
    protected_main_tree: "383cc2f3ed4cbb37793b7e2c4a410f02d4db4fb1",
    exact_main_ci_run: 33261002199,
    exact_main_ci_conclusion: "success",
    receipt_cross_result_detachment_review_action: "ACTION_666HC",
  });
  expect(evidence.candidates).toEqual({
    v2_receipt_consumer_storage_or_transport_binding:
      "rejected_no_runtime_or_durable_authority",
    v2_receipt_owner_resolution_or_writer_invocation:
      "rejected_no_caller_or_execution_authority",
    required_ci_branch_protection_or_netlify_change:
      "rejected_unchanged_six_shard_full_ci",
    v2_immutable_committed_result_receipt_equivalence_comparator: "selected",
  });
  expect(evidence.selected_outcome).toMatchObject({
    identifier: "v2_immutable_committed_result_receipt_equivalence_comparator",
    implementation_action: "ACTION_666HE",
    implementation_source_changed: false,
    server_only: true,
    runtime_unwired: true,
    execution_authority: false,
    returned_value: "new_frozen_scalar_only_equivalence_verdict",
  });
  expect(evidence.selected_outcome.accepted_inputs).toEqual([
    "two_already_immutable_v2_committed_result_receipts",
  ]);
  expect(evidence.selected_outcome.compared_scalar_fields).toEqual([
    "canonicalCommandDigest",
    "disposition",
    "initialHistoryIdentity",
    "positionId",
    "positionVersion",
  ]);
  expect(evidence.decision).toMatchObject({
    type: "select_one_source_only_milestone_b_receipt_equivalence_dependency",
    workflow_change_authorized: false,
    required_check_change_authorized: false,
    branch_protection_change_authorized: false,
    netlify_change_authorized: false,
    full_ci_deduplication_authorized: false,
    runtime_activation_authorized: false,
  });
});

test("666HD retains the receipt boundary without authorizing a consumer or runtime", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");

  expect(source(receiptPath)).toMatch(/^import "server-only";/);
  expect(source(receiptPath)).not.toMatch(/fetch\(|postgres|supabase|process\.env/i);
  expect(source(sourceContractPath)).toContain("committedResultDecoderPresent: false");
  expect(source(preflightPath)).toContain("exactPrivateRoutineResultDecoderImplemented: false");
  expect(documentation).toMatch(/source-only selection/i);
  expect(documentation).toMatch(/no CI deduplication is\s+authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666HD/);
  expect(source(ledgerPath)).toMatch(/ACTION 666HD/);
});

test("666HD is registered once without changing the six-shard verification plan", () => {
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
