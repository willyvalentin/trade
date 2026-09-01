import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const baselinePath = "docs/rel-00-ci-b0-baseline-and-admission.md";
const evidencePath =
  "docs/evidence/rel-00-ci-b0-baseline-and-admission.json";
const workflowPath = ".github/workflows/milestone-a-ci.yml";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const thisTest = "tests/e2e/rel-00-ci-b0-baseline-and-charter.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("REL-00 CI-B0 freezes the baseline without weakening protected CI", () => {
  const evidenceRaw = source(evidencePath);
  const evidence = JSON.parse(evidenceRaw);
  const baseline = source(baselinePath);
  const workflow = source(workflowPath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence).toMatchObject({
    contract_version: "trade.rel00.ci-b0-baseline-and-charter.v1",
    workstream: "REL-00",
    substage: "CI-B0",
    reviewed_baseline: {
      protected_main_commit: "7814f677c5992535957e8e2765660fafa894db80",
      protected_main_tree: "7221ee7a8a130bb4db2ac60f8d77597b9cf56d0e",
      merged_pr_number: 289,
      ready_full_ci: {
        run_id: 33520256853,
        conclusion: "success",
        aggregate: "provider-free-verification",
      },
      exact_main_full_ci: {
        run_id: 33523670033,
        conclusion: "success",
        post_merge_provenance_status: "matched",
        post_merge_provenance_mismatches: [],
      },
    },
    qualified_milestone_b_context: {
      disposition: "complete_under_local_sandbox_acceptance_profile_v1",
      live_runtime_disposition: "deferred_not_verified",
      remote_staging_admission: "not_admitted",
    },
    transition_status: {
      ci_b0_baseline_and_charter: "verified_on_exact_main",
      ci_b1_through_ci_b6: "in_progress",
      ci_b7_activation: "requires_separate_explicit_authorization",
      ci_b8_observation: "requires_declared_measurement_window",
      full_rel00_transition: "in_progress_not_complete",
    },
  });
  expect(evidence.preserved_workflow_contract).toMatchObject({
    workflow_path: workflowPath,
    draft_job: "draft-provider-free-verification",
    strict_required_aggregate: "provider-free-verification",
    ready_and_main_full_ci_shard_count: 6,
    exact_sha_checkout: true,
    clean_tree_verification: true,
    lockfile_bound_npm_download_cache: true,
    locked_npm_ci_ignore_scripts: true,
    concurrency_cancellation: true,
    full_ci_deduplication_authorized: false,
  });
  expect(evidence.ci_b0_completion_evidence).toMatchObject({
    merged_pr_number: 290,
    merge_commit: "8127c4d294a36d0e442fa1b10df451f15cdf0c28",
    merged_tree: "399b03831c5a2de9c5121e29603e6aeb79747505",
    ready_full_ci_run_id: 33532291412,
    exact_main_full_ci_run_id: 33535472128,
    exact_main_full_ci_conclusion: "success",
    post_merge_provenance_status: "matched",
    post_merge_provenance_mismatches: [],
    full_ci_deduplication_authorized: false,
  });
  expect(
    evidence.preserved_workflow_contract.ready_and_main_full_ci_shards,
  ).toEqual([
    "foundation",
    "replay-lineage",
    "snapshot-admission",
    "snapshot-issuance",
    "non-forgeable-authority",
    "lossless-scalar",
  ]);
  expect(workflow).toContain("name: draft-provider-free-verification");
  expect(workflow).toContain("name: provider-free-verification");
  expect(workflow).toContain("github.event.pull_request.draft == false");
  expect(workflow).toContain("github.event_name == 'push'");
  for (const shard of evidence.preserved_workflow_contract
    .ready_and_main_full_ci_shards) {
    expect(workflow).toContain(`- ${shard}`);
  }

  expect(baseline).toContain("CI-B0 is verified on exact main");
  expect(baseline).toContain("CI-B7 requires an");
  expect(source(roadmapPath)).toContain("CI-B0 is verified on exact main");
  expect(source(ledgerPath)).toContain("CI-B0 is verified on exact main");
  expect(`${baseline}\n${evidenceRaw}`).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);
});
