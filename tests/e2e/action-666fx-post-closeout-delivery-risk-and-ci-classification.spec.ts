import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fx-post-closeout-delivery-risk-and-ci-classification.md";
const evidencePath =
  "docs/evidence/action-666fx-post-closeout-delivery-risk-and-ci-classification.json";
const governancePath = "docs/roadmap-operating-governance.md";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fx-post-closeout-delivery-risk-and-ci-classification.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666FX records the first post-closeout risk review against green exact main", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(evidence.contract_version).toBe(
    "trade.action666fx.post-closeout-delivery-risk-and-ci-classification.v1",
  );
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "02070e5ec9fc09564afb0da476c8d5769f85399f",
    protected_main_tree: "8c9a9a3e47b70948856109b6e9fcf57a52f81691",
    exact_main_ci_run: 33059631761,
    exact_main_ci_conclusion: "success",
    focused_verification: thisTest,
  });
  expect(evidence.autonomous_controls).toEqual({
    governance_controller: "codex_autonomous_governance_controller",
    delivery_automation: "codex_delivery_automation",
    independent_machine_verification:
      "github_exact_run_status_and_saved_merge_candidate_provenance_artifact",
    decision_policy: "current_protected_main_autonomous_closeout_policy",
  });
  expect(evidence.risk_register_review).toEqual({
    "RG-01": "mitigated_by_action_666fw_close_static_workstream",
    "RG-02": "unchanged_fail_closed",
    "RG-03": "draft_aggregate_expected_workflow_semantic_mismatch_classified",
    "RG-04": "main_candidate_tree_reconciled_on_action_666fw_merge",
  });
  expect(evidence.observed_runs.draft).toMatchObject({
    draft_fast_check: "success",
    full_matrix: "skipped",
    normal_aggregate: "failure",
    classification: "expected_workflow_semantic_mismatch",
    rerun_initiated: false,
  });
  expect(evidence.observed_runs.ready_full_ci.candidate_tree).toBe(
    evidence.observed_runs.exact_main_full_ci.main_tree,
  );
  expect(evidence.decision).toMatchObject({
    type: "defer_draft_aggregate_semantics_change_pending_required_check_impact_review",
    workflow_change_authorized: false,
    required_check_change_authorized: false,
    branch_protection_change_authorized: false,
    full_ci_deduplication_authorized: false,
    runtime_activation_authorized: false,
  });
  expect(sha256(raw)).toMatch(/^[a-f0-9]{64}$/);
});

test("666FX keeps the closed witness workstream and all protected boundaries fail-closed", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(existsSync(resolve(root, ".github/workflows/milestone-a-ci.yml"))).toBe(
    true,
  );
  expect(documentation).toMatch(/no workflow/i);
  expect(documentation).toMatch(/closed_static_workstream/i);
  expect(source(governancePath)).toMatch(/Action 666FW/);
  expect(source(roadmapPath)).toMatch(/Action 666FX/);
  expect(source(ledgerPath)).toMatch(/Action 666FX/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
