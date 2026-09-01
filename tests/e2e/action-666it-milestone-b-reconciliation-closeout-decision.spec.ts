import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666it-milestone-b-reconciliation-closeout-decision.md";
const evidencePath =
  "docs/evidence/action-666it-milestone-b-reconciliation-closeout-decision.json";
const predecessorPath =
  "docs/action-666is-position-version-lineage-v2-committed-result-receipt-undefined-disposition-own-data-rejection-review.md";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const governancePath = "docs/roadmap-operating-governance.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const thisTest =
  "tests/e2e/action-666it-milestone-b-reconciliation-closeout-decision.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("666IT closes automatic receipt-chain extension without claiming Milestone B completion", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.contract_version).toBe(
    "trade.action666it.milestone-b-capability-reconciliation-closeout-decision.v1",
  );
  expect(evidence.action_id).toBe("ACTION_666IT");
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "0ff18bf8a37fa8af407bc157a7843ab4bb7ed603",
    protected_main_tree: "57e7f28592b83d3630c047f1156920fd966d6443",
    merged_pr_number: 284,
    exact_main_ci_run: 33465854910,
    exact_main_ci_conclusion: "success",
    post_merge_poc_job: 99730685308,
    post_merge_poc_status: "matched",
    post_merge_poc_mismatches: [],
    candidate_commit: "b260e757eb33fc26934a73ba497a1a22fa1f092f",
    candidate_tree: "57e7f28592b83d3630c047f1156920fd966d6443",
  });
  expect(evidence.program_tracking_snapshot).toEqual({
    notion_is_program_tracking_only: true,
    complete_foundations: ["B-02", "B-04"],
    in_progress_capability_gates: ["B-01", "B-03"],
    blocked_capability_gates: ["B-05", "B-06", "B-07", "B-08"],
    planned_capability_gates: ["B-09", "B-10", "B-11", "B-12"],
  });
  expect(evidence.decision).toEqual({
    type: "milestone_b_capability_reconciliation_closeout",
    completed_source_chain: "ACTION_666GS_THROUGH_ACTION_666IS",
    source_chain_disposition: "closed_for_automatic_extension",
    milestone_b_disposition: "not_complete",
    runtime_disposition: "closed",
    decision: "redesign_or_stop",
    receipt_variant_successor_selected: false,
    required_next_product_outcome: "one_policy_admitted_runtime_capability_slice",
    future_runtime_slice_requires: [
      "canonical_recommendation_position_identity_and_lineage",
      "transactional_recommendation_to_position_handoff",
      "protected_secret_management",
      "least_privileged_runtime_identity",
      "private_server_transport_and_concrete_command_port",
      "runtime_writer_binding_and_invocation",
      "durable_queue_and_retry_behavior",
      "server_owned_runtime_integration",
      "client_projection_not_truth",
      "bounded_owner_bound_recoverable_runtime_trial",
    ],
  });
  expect(evidence.milestone_b_definition_of_done).toEqual({
    server_owned_live_trade_model: false,
    deterministic_exit_and_observation_runtime_contracts: false,
    durable_exit_queue: false,
    transactional_recommendation_to_position_handoff: false,
    client_projection_not_truth: false,
    policy_admitted_activation_boundary: false,
    bounded_runtime_trial: false,
  });
  expect(evidence.containment).toEqual({
    runtime_unwired: true,
    credential_operation_present: false,
    provider_or_broker_operation_present: false,
    transport_or_writer_invocation_present: false,
    database_query_or_mutation_present: false,
    receipt_persistence_present: false,
    route_ui_or_deployment_authority_present: false,
    branch_protection_change_authorized: false,
    netlify_change_authorized: false,
    required_check_change_authorized: false,
    full_ci_deduplication_authorized: false,
  });

  expect(source(predecessorPath)).toContain(
    "Only a separately bounded decision may follow.",
  );
  expect(source(roadmapPath)).toMatch(/Action 666IT/i);
  expect(source(ledgerPath)).toMatch(/ACTION 666IT/);
  expect(source(governancePath)).toContain("Milestone B runtime capability");
  expect(source(governancePath)).toContain("redesign_or_stop");
  expect(documentation).toContain("Notion is program tracking only");
  expect(documentation).toContain("Another omitted-key, undefined-value");
  expect(documentation).toContain("It creates no authority");

  expect(registration.filter((entry) => entry === thisTest)).toHaveLength(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);
});
