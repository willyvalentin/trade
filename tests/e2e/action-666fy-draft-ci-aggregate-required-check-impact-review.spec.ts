import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fy-draft-ci-aggregate-required-check-impact-review.md";
const evidencePath =
  "docs/evidence/action-666fy-draft-ci-aggregate-required-check-impact-review.json";
const workflowPath = ".github/workflows/milestone-a-ci.yml";
const governancePath = "docs/roadmap-operating-governance.md";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fy-draft-ci-aggregate-required-check-impact-review.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666FY proves the Draft aggregate cannot safely satisfy the Full CI required context", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);
  const workflow = source(workflowPath);

  expect(evidence.contract_version).toBe(
    "trade.action666fy.draft-ci-aggregate-required-check-impact-review.v1",
  );
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "67dde40e21f668a22e87c41d215213077f960ff1",
    protected_main_tree: "3984d4e39dcd4aea87b26956772e3d261a8abe41",
    exact_main_ci_run: 33067498119,
    exact_main_ci_conclusion: "success",
    focused_verification: thisTest,
  });
  expect(evidence.branch_protection_observation).toEqual({
    branch: "main",
    strict: true,
    required_checks: [{ context: "provider-free-verification", app_id: 15368 }],
    enforce_admins: true,
    allow_force_pushes: false,
    allow_deletions: false,
    required_conversation_resolution: true,
  });
  expect(evidence.workflow_semantics).toMatchObject({
    aggregate_context: "provider-free-verification",
    aggregate_requires_full_matrix_success: true,
    aggregate_runs_with_always: true,
    draft_matrix_result: "skipped",
    draft_aggregate_result: "failure",
  });
  expect(evidence.observed_runs.pr_205_draft).toMatchObject({
    draft_fast_check: "success",
    full_matrix: "skipped",
    aggregate: "failure",
    classification: "expected_workflow_semantic_mismatch",
  });
  expect(evidence.observed_runs.pr_207_ready).toMatchObject({
    six_shards: "success",
    aggregate: "success",
    merge_candidate_poc: "success",
  });
  expect(evidence.observed_runs.pr_207_exact_main.candidate_tree).toBe(
    evidence.observed_runs.pr_207_exact_main.main_tree,
  );
  expect(evidence.decision).toMatchObject({
    type: "retain_current_required_check_binding_and_draft_failure_semantics",
    workflow_change_authorized: false,
    required_check_change_authorized: false,
    branch_protection_change_authorized: false,
    netlify_change_authorized: false,
    full_ci_deduplication_authorized: false,
    runtime_activation_authorized: false,
  });
  expect(workflow).toContain("name: provider-free-verification");
  expect(workflow).toContain("if: ${{ always() }}");
  expect(workflow).toContain("SHARD_RESULT: ${{ needs.provider-free-verification-shard.result }}");
  expect(workflow).toContain('run: test "$SHARD_RESULT" = "success"');
  expect(sha256(raw)).toMatch(/^[a-f0-9]{64}$/);
});

test("666FY retains every CI and protected-runtime safety boundary", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(existsSync(resolve(root, workflowPath))).toBe(true);
  expect(documentation).toMatch(/No workflow/i);
  expect(documentation).toMatch(/No Full CI is deduplicated/i);
  expect(documentation).toMatch(/closed_static_workstream/i);
  expect(source(governancePath)).toMatch(/Action 666FY/);
  expect(source(roadmapPath)).toMatch(/Action 666FY/);
  expect(source(ledgerPath)).toMatch(/Action 666FY/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
