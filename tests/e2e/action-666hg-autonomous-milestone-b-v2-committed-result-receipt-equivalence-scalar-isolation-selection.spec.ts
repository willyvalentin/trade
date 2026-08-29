import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666hg-autonomous-milestone-b-v2-committed-result-receipt-equivalence-scalar-isolation-selection.md";
const evidencePath =
  "docs/evidence/action-666hg-autonomous-milestone-b-v2-committed-result-receipt-equivalence-scalar-isolation-selection.json";
const comparatorPath =
  "lib/server/position-version-lineage-v2-writer-immutable-committed-result-receipt-equivalence-comparator.ts";
const sourceContractPath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const preflightPath =
  "lib/position-version-lineage-v2-writer-private-command-port-runtime-binding-admission-preflight.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const thisTest =
  "tests/e2e/action-666hg-autonomous-milestone-b-v2-committed-result-receipt-equivalence-scalar-isolation-selection.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("666HG selects only the immutable receipt scalar-isolation and symmetry review", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.contract_version).toBe(
    "trade.action666hg.position-version-lineage-v2-committed-result-receipt-equivalence-scalar-isolation-selection.v1",
  );
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "7e326f1c4fb9d255c76cc4ed10b08c355aef9e66",
    protected_main_tree: "49cc48c99ad643e20bbcc3d2fc2308d124f66f26",
    exact_main_ci_run: 33272866589,
    exact_main_ci_conclusion: "success",
    receipt_equivalence_comparator_review_action: "ACTION_666HF",
  });
  expect(evidence.candidates).toEqual({
    v2_receipt_consumer_storage_or_transport_binding:
      "rejected_no_runtime_or_durable_authority",
    v2_receipt_owner_resolution_or_writer_invocation:
      "rejected_no_caller_or_execution_authority",
    required_ci_branch_protection_or_netlify_change:
      "rejected_unchanged_six_shard_full_ci",
    v2_immutable_receipt_equivalence_scalar_isolation_and_symmetry_review:
      "selected",
  });
  expect(evidence.selected_outcome).toMatchObject({
    identifier:
      "v2_immutable_receipt_equivalence_scalar_isolation_and_symmetry_review",
    review_action: "ACTION_666HH",
    comparator_source_changed: false,
    server_only: true,
    runtime_unwired: true,
    execution_authority: false,
    fixed_fail_closed_scalar_requirement: "positionVersion:1",
  });
  expect(evidence.selected_outcome.validly_varying_scalar_fields).toEqual([
    "canonicalCommandDigest",
    "disposition",
    "initialHistoryIdentity",
    "positionId",
  ]);
  expect(evidence.selected_outcome.required_observations).toEqual([
    "each_non_equivalent_pair_differs_in_exactly_one_validly_varying_scalar",
    "swapping_inputs_preserves_equivalence_boolean",
    "each_verdict_is_new_frozen_and_scalar_only",
  ]);
  expect(evidence.decision).toMatchObject({
    type: "select_one_source_only_milestone_b_receipt_equivalence_scalar_isolation_review",
    workflow_change_authorized: false,
    required_check_change_authorized: false,
    branch_protection_change_authorized: false,
    netlify_change_authorized: false,
    full_ci_deduplication_authorized: false,
    runtime_activation_authorized: false,
  });
});

test("666HG retains the comparator boundary without authorizing a consumer or runtime", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");

  expect(source(comparatorPath)).toMatch(/^import "server-only";/);
  expect(source(comparatorPath)).not.toMatch(/fetch\(|postgres|supabase|process\.env/i);
  expect(source(sourceContractPath)).toContain("committedResultDecoderPresent: false");
  expect(source(preflightPath)).toContain("exactPrivateRoutineResultDecoderImplemented: false");
  expect(documentation).toMatch(/source-only selection/i);
  expect(documentation).toMatch(/no CI deduplication is\s+authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666HG/);
  expect(source(ledgerPath)).toMatch(/ACTION 666HG/);
});

test("666HG is registered once without changing the six-shard verification plan", () => {
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
