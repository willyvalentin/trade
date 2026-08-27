import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fz-autonomous-milestone-b-product-outcome-selection.md";
const evidencePath =
  "docs/evidence/action-666fz-autonomous-milestone-b-product-outcome-selection.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const governancePath = "docs/roadmap-operating-governance.md";
const evaluatorPath = "lib/action-655b-canonical-exit-evaluator.ts";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fz-autonomous-milestone-b-product-outcome-selection.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666FZ selects one pure product outcome while rejecting every runtime path", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(evidence.contract_version).toBe(
    "trade.action666fz.autonomous-milestone-b-product-outcome-selection.v1",
  );
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "52e4659bb5c97bba1845fc4a38cc30bc128ca1e4",
    protected_main_tree: "98f78c5b9ebe6b7e7c111834119b89fa2ceb7a47",
    exact_main_ci_run: 33073808497,
    exact_main_ci_conclusion: "success",
    focused_verification: thisTest,
  });
  expect(evidence.candidates).toEqual({
    v2_writer_transport_reopen: "rejected_blocked_runtime_prerequisites",
    draft_required_check_semantics_change:
      "rejected_action_666fy_strict_context_proof",
    read_write_position_queue_or_observation_capability:
      "rejected_runtime_database_admission_required",
    provider_free_exit_decision_explanation_projection: "selected",
  });
  expect(evidence.selected_outcome).toMatchObject({
    identifier: "provider_free_exit_decision_explanation_projection",
    implementation_action: "ACTION_666GA",
    default_off: true,
    runtime_unwired: true,
    execution_authority: false,
  });
  expect(evidence.selected_outcome.accepted_input_fields).toEqual([
    "decision_status",
    "decision_reason",
    "decision_priority",
  ]);
  expect(evidence.selected_outcome.forbidden_input_categories).toContain(
    "position_identity",
  );
  expect(evidence.decision).toMatchObject({
    type: "select_one_provider_free_product_implementation",
    workflow_change_authorized: false,
    required_check_change_authorized: false,
    branch_protection_change_authorized: false,
    full_ci_deduplication_authorized: false,
    runtime_activation_authorized: false,
  });
  expect(sha256(raw)).toMatch(/^[a-f0-9]{64}$/);
});

test("666FZ preserves the evaluator boundary and all protected controls", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(existsSync(resolve(root, evaluatorPath))).toBe(true);
  expect(source(evaluatorPath)).toContain(
    "export function evaluateAction655bCanonicalExitDecision",
  );
  expect(documentation).toMatch(/does not import or invoke the exit evaluator/i);
  expect(documentation).toMatch(/No application runtime/i);
  expect(documentation).toMatch(/default-off and runtime-unwired/i);
  expect(source(governancePath)).toMatch(/Codex autonomous governance controller/);
  expect(source(roadmapPath)).toMatch(/Action 666FZ/);
  expect(source(ledgerPath)).toMatch(/Action 666FZ/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
