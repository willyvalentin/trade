import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repositoryRoot = path.resolve(__dirname, "../..");
const workflowPath = ".github/workflows/milestone-a-ci.yml";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const shardRunnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const draftRunnerPath = "scripts/action-660k-run-draft-ci.mjs";
const contractPath =
  "docs/action-660k-cost-bounded-provider-free-verification.md";
const evidencePath =
  "docs/evidence/action-660k-cost-bounded-provider-free-verification.json";
const ledgerPath = "docs/ture-current-state-ledger.md";
const roadmapPath = "docs/ture-master-roadmap.md";

const sourcePaths = [
  workflowPath,
  registrationPath,
  shardRunnerPath,
  draftRunnerPath,
  "docs/action-660j-parallel-provider-free-verification.md",
  contractPath,
  ledgerPath,
  roadmapPath,
] as const;

type Evidence = {
  contract_version: string;
  authority: {
    base_main_commit: string;
    base_main_tree: string;
    base_exact_main_ci_run: number;
    required_check: string;
    required_check_app_id: number;
    branch_protection_change: boolean;
    production_deployment_authority: boolean;
  };
  billing_baseline: Record<string, number | string | boolean>;
  draft_route: {
    event: string;
    draft_required: boolean;
    job_name: string;
    protected_job_name_used: boolean;
    exact_head_checkout: boolean;
    merge_base_diff: boolean;
    always_run_labels: string[];
    changed_registered_groups_added: boolean;
    clean_tree_required: boolean;
    full_matrix_result: string;
    protected_aggregate_result: string;
  };
  ready_route: {
    ready_for_review_event_required: boolean;
    ready_synchronize_event_required: boolean;
    full_shards: string[];
    fail_fast: boolean;
    all_shards_run_to_completion: boolean;
    protected_aggregate_success_requires_full_matrix_success: boolean;
  };
  main_route: Record<string, string | boolean>;
  fail_closed: Record<string, boolean>;
  sources: Record<string, string>;
  delivery: Record<string, boolean>;
};

type DraftRunnerModule = {
  isFullSha: (value: unknown) => boolean;
  selectDraftCommands: (changedPaths: unknown) => Array<{ label: string }>;
};

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

async function draftRunnerModule() {
  return import(
    pathToFileURL(path.join(repositoryRoot, draftRunnerPath)).href
  ) as Promise<DraftRunnerModule>;
}

function blockBetween(text: string, start: string, end?: string) {
  const startMarker = `  ${start}:`;
  const endMarker = end ? `  ${end}:` : null;
  const startIndex = text.indexOf(startMarker);
  const endIndex = endMarker ? text.indexOf(endMarker) : text.length;
  if (startIndex < 0 || endIndex <= startIndex) {
    throw new Error(`Missing or reordered job block: ${start}`);
  }
  return text.slice(startIndex, endIndex);
}

function aggregateStatus(result: string) {
  return spawnSync(
    "/bin/sh",
    ["-c", 'test "$SHARD_RESULT" = "success"'],
    { env: { ...process.env, SHARD_RESULT: result } },
  ).status;
}

test("routes Draft, Ready and main without allowing quick CI to authorize merge", async () => {
  const workflow = await source(workflowPath);
  expect(workflow).toContain("pull_request:\n    types:");
  for (const eventType of [
    "opened",
    "reopened",
    "synchronize",
    "ready_for_review",
    "converted_to_draft",
  ]) {
    expect(workflow).toContain(`      - ${eventType}`);
  }
  expect(workflow).toContain("push:\n    branches:\n      - main");

  const draftJob = blockBetween(
    workflow,
    "draft-provider-free-verification",
    "provider-free-verification-shard",
  );
  const shardJob = blockBetween(
    workflow,
    "provider-free-verification-shard",
    "provider-free-verification",
  );
  const aggregateJob = blockBetween(workflow, "provider-free-verification");

  expect(draftJob).toContain("name: draft-provider-free-verification");
  expect(draftJob).toContain(
    "if: ${{ github.event_name == 'pull_request' && github.event.pull_request.draft == true }}",
  );
  expect(draftJob).toContain(
    "ref: ${{ github.event.pull_request.head.sha }}",
  );
  expect(draftJob).toContain(
    "EXPECTED_REVISION: ${{ github.event.pull_request.head.sha }}",
  );
  expect(draftJob).toContain("fetch-depth: 0");
  expect(draftJob).toContain("persist-credentials: false");
  expect(draftJob).toContain(
    'run: node scripts/action-660k-run-draft-ci.mjs "$BASE_REVISION" "$EXPECTED_REVISION"',
  );
  expect(draftJob).toContain("git diff --exit-code");
  expect(draftJob).toContain("git diff --cached --exit-code");
  expect(draftJob).not.toContain("name: provider-free-verification\n");

  expect(shardJob).toContain(
    "if: ${{ github.event_name == 'push' || github.event.pull_request.draft == false }}",
  );
  expect(shardJob).toContain("fail-fast: false");
  expect(shardJob).toContain(
    "ref: ${{ github.event_name == 'pull_request' && github.event.pull_request.head.sha || github.sha }}",
  );
  expect(shardJob).toContain(
    "EXPECTED_REVISION: ${{ github.event_name == 'pull_request' && github.event.pull_request.head.sha || github.sha }}",
  );

  expect(aggregateJob).toContain("name: provider-free-verification");
  expect(aggregateJob).toContain("if: ${{ always() }}");
  expect(aggregateJob).toContain("- provider-free-verification-shard");
  expect(aggregateJob).not.toContain("draft-provider-free-verification");
  expect(aggregateJob).toContain(
    "SHARD_RESULT: ${{ needs.provider-free-verification-shard.result }}",
  );
  expect(aggregateJob).toContain(
    'run: test "$SHARD_RESULT" = "success"',
  );
  expect(aggregateJob).not.toContain("continue-on-error");

  expect(aggregateStatus("success")).toBe(0);
  for (const result of [
    "skipped",
    "failure",
    "cancelled",
    "timed_out",
    "",
  ]) {
    expect(aggregateStatus(result)).not.toBe(0);
  }
});

test("selects a closed cost-bounded Draft plan from exact registered test paths", async () => {
  const { isFullSha, selectDraftCommands } = await draftRunnerModule();
  const validSha = "a".repeat(40);
  expect(isFullSha(validSha)).toBe(true);
  for (const invalid of [
    validSha.toUpperCase(),
    "a".repeat(39),
    "a".repeat(41),
    "g".repeat(40),
    "",
    null,
    undefined,
    1,
  ]) {
    expect(isFullSha(invalid)).toBe(false);
  }

  const baselineLabels = [
    "Lint",
    "TypeScript",
    "Browser and server containment",
  ];
  expect(selectDraftCommands([]).map((entry) => entry.label)).toEqual(
    baselineLabels,
  );
  expect(
    selectDraftCommands(["docs/readme-only.md"]).map((entry) => entry.label),
  ).toEqual(baselineLabels);

  const admissionPath =
    "tests/e2e/action-666bd-governed-binding-snapshot-admission.spec.ts";
  expect(
    selectDraftCommands([admissionPath]).map((entry) => entry.label),
  ).toEqual([...baselineLabels, "Governed binding snapshot admission"]);
  expect(
    selectDraftCommands([admissionPath, admissionPath]).map(
      (entry) => entry.label,
    ),
  ).toEqual([...baselineLabels, "Governed binding snapshot admission"]);

  expect(
    selectDraftCommands([
      "tests/e2e/action-660-ma09-generated-types-provenance-v2.spec.mjs",
    ]).map((entry) => entry.label),
  ).toEqual([...baselineLabels, "Generated-types provenance V2"]);

  expect(() => selectDraftCommands("not-an-array")).toThrow(
    "changedPaths must be an array of strings",
  );
  expect(() => selectDraftCommands(["ok", 1])).toThrow(
    "changedPaths must be an array of strings",
  );

  const registration = JSON.parse(await source(registrationPath)) as string[];
  expect(registration).toContain(
    "tests/e2e/action-660k-cost-bounded-provider-free-verification.spec.ts",
  );
  expect(new Set(registration).size).toBe(registration.length);
});

test("keeps the Draft runner provider-free, shell-free and revision-bound", async () => {
  const runner = await source(draftRunnerPath);
  for (const required of [
    'spawnSync("git", args',
    'shell: false',
    '"merge-base"',
    '"diff"',
    '"--diff-filter=ACMR"',
    'checkedGit(["rev-parse", "HEAD"]) !== expectedRevision',
    "providerFreeVerificationPlan",
  ]) {
    expect(runner).toContain(required);
  }
  expect(runner).not.toMatch(/\b(?:fetch|curl|wget)\s*\(/);
  expect(runner).not.toMatch(/SUPABASE|NETLIFY|AUTOMATION_SECRET|TRADE_APP_PASSWORD/);
  expect(runner).not.toContain("shell: true");
  expect(runner).not.toContain("execSync");
  expect(runner).not.toContain("execFileSync");
});

test("binds exact governance evidence and forbids release authority", async () => {
  const contract = await source(contractPath);
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  const sourceHashes = Object.fromEntries(
    await Promise.all(
      sourcePaths.map(async (sourcePath) => [
        sourcePath,
        createHash("sha256").update(await source(sourcePath)).digest("hex"),
      ]),
    ),
  );

  expect(evidence).toEqual({
    contract_version: "action_660k_cost_bounded_provider_free_ci_v1",
    authority: {
      base_main_commit: "466e95318a6feb1418ec60bfced98703183ccc54",
      base_main_tree: "cdd83c876aee0096fd7d903c20e8e3b7ef4f6d82",
      base_exact_main_ci_run: 32359092838,
      required_check: "provider-free-verification",
      required_check_app_id: 15368,
      branch_protection_change: false,
      production_deployment_authority: false,
    },
    billing_baseline: {
      observed_date: "2026-08-19",
      workflow_runs: 15,
      runner_jobs: 105,
      rounded_billable_ubuntu_minutes: 1825,
      ubuntu_two_core_usd_per_minute: 0.006,
      estimated_usd: 10.95,
      cancelled_runs: 4,
      cancelled_rounded_minutes: 403,
      cancelled_estimated_usd: 2.42,
      exact_main_runs: 5,
      exact_main_rounded_minutes: 640,
      exact_main_estimated_usd: 3.84,
      operator_budget_ceiling_usd: 30,
      budget_ceiling_is_spending_target: false,
    },
    draft_route: {
      event: "pull_request",
      draft_required: true,
      job_name: "draft-provider-free-verification",
      protected_job_name_used: false,
      exact_head_checkout: true,
      merge_base_diff: true,
      always_run_labels: [
        "Lint",
        "TypeScript",
        "Browser and server containment",
      ],
      changed_registered_groups_added: true,
      clean_tree_required: true,
      full_matrix_result: "skipped",
      protected_aggregate_result: "failure",
    },
    ready_route: {
      ready_for_review_event_required: true,
      ready_synchronize_event_required: true,
      full_shards: [
        "foundation",
        "replay-lineage",
        "snapshot-admission",
        "snapshot-issuance",
        "non-forgeable-authority",
        "lossless-scalar",
      ],
      fail_fast: false,
      all_shards_run_to_completion: true,
      protected_aggregate_success_requires_full_matrix_success: true,
    },
    main_route: {
      event: "push",
      branch: "main",
      exact_github_sha: true,
      full_matrix_required: true,
      fail_fast: false,
      all_shards_run_to_completion: true,
      protected_aggregate_required: true,
    },
    fail_closed: {
      draft_quick_check_can_authorize_merge: false,
      skipped_full_matrix_can_authorize_merge: false,
      failed_full_matrix_can_authorize_merge: false,
      cancelled_full_matrix_can_authorize_merge: false,
      timed_out_full_matrix_can_authorize_merge: false,
      incomplete_full_matrix_can_authorize_merge: false,
      ready_head_full_ci_required: true,
      exact_main_full_ci_required: true,
    },
    sources: sourceHashes,
    delivery: {
      draft_quick_observed_green: false,
      draft_protected_aggregate_observed_failure: false,
      ready_exact_head_full_ci_observed_green: false,
      independent_review_no_findings: false,
      operator_approval_exact_pr_and_head: false,
      ordinary_protected_merge: false,
      exact_main_full_ci_observed_green: false,
      production_deployment_authorized: false,
    },
  });

  for (const text of [
    contract,
    await source(evidencePath),
    await source(draftRunnerPath),
  ]) {
    expect(text).not.toMatch(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    );
    expect(text).not.toMatch(/(?:github_pat_|ghp_|postgres(?:ql)?:\/\/)/i);
  }
  expect(contract).toContain("`production_deployment_authority:false`");
  expect(contract).toContain(
    "Production deployment is neither required nor authorized.",
  );
  expect(evidence.authority.production_deployment_authority).toBe(false);
  expect(evidence.delivery.production_deployment_authorized).toBe(false);
});
