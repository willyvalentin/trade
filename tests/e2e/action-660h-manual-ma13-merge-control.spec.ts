import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function sectionBetween(text: string, start: string, end: string) {
  const startIndex = text.indexOf(start);
  const endIndex = text.indexOf(end, startIndex + start.length);
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error(`Missing or reordered contract section: ${start} -> ${end}`);
  }
  return text.slice(startIndex + start.length, endIndex);
}

function taggedRequirementIds(text: string, tag: "PRE" | "POST" | "CAN") {
  const matches = [
    ...text.matchAll(
      new RegExp(
        "^\\d+\\. `\\[" + tag + "-(\\d{2}): ([a-z0-9_]+)\\]`",
        "gm",
      ),
    ),
  ];
  return matches.map((match, index) => {
    const expectedOrdinal = String(index + 1).padStart(2, "0");
    if (match[1] !== expectedOrdinal) {
      throw new Error(`${tag} requirement sequence is not contiguous`);
    }
    return match[2];
  });
}

function requireExactIds(actual: string[], expected: string[], label: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} requirements differ from evidence`);
  }
}

function validateContractRequirementBinding(
  contract: string,
  evidence: {
    manual_control: {
      pre_merge_steps: string[];
      post_merge_steps: string[];
    };
    candidate_canonicalization_conditions: Record<string, boolean>;
  },
) {
  const beforeMerge = sectionBetween(
    contract,
    "### Before merge",
    "### After merge",
  );
  const afterMerge = sectionBetween(
    contract,
    "### After merge",
    "## Operational effect",
  );
  const delivery = sectionBetween(
    contract,
    "## Delivery condition",
    "## Scope limits",
  );
  const canonicalizationIds = Object.keys(
    evidence.candidate_canonicalization_conditions,
  ).filter((key) => key !== "all_satisfied");

  requireExactIds(
    taggedRequirementIds(beforeMerge, "PRE"),
    evidence.manual_control.pre_merge_steps,
    "pre-merge",
  );
  requireExactIds(
    taggedRequirementIds(afterMerge, "POST"),
    evidence.manual_control.post_merge_steps,
    "post-merge",
  );
  requireExactIds(
    taggedRequirementIds(delivery, "CAN"),
    canonicalizationIds,
    "canonicalization",
  );
}

const preMergeSteps = [
  "dedicated_branch_from_current_main",
  "draft_until_bounded_scope_frozen",
  "record_exact_head_sha",
  "exact_head_provider_free_verification_success",
  "independent_read_only_review_no_blocking_findings",
  "reconfirm_main_target_clean_mergeability_and_exact_scope",
  "explicit_operator_approval_of_pr_and_exact_head",
  "ordinary_pr_merge_no_direct_or_force_push",
];

const postMergeSteps = [
  "record_merge_and_verify_reviewed_scope_main_reachability",
  "exact_main_ci_success",
  "exact_deploy_identity_and_production_smoke_when_published",
  "preserve_bounded_delivery_evidence",
];

const templateChecklistItems = [
  "Work started from the current immutable `main` commit on a dedicated branch.",
  "The PR remained Draft until its bounded scope was complete and frozen.",
  "The PR targets `main` and contains only the intended bounded scope.",
  "The exact head SHA is recorded after the scope is frozen.",
  "`provider-free-verification` is successful for that exact head SHA.",
  "Independent read-only review has no unresolved blocking finding.",
  "The PR is cleanly mergeable and its base is current.",
  "The operator has explicitly approved this PR number and exact head SHA.",
  "The merge will use an ordinary PR merge; no direct push or force-push.",
];

const evidenceSha256 =
  "47bcbfbd6da71b8f7f812c4177160b5d80da3372771622a7ad027a0b94ef07be";

const currentMainCommit = "7662d3f863f8f921b816670363431df8e1ebcdea";
const lastVerifiedProductionCommit =
  "f463644ddeb7f49fa8b80924d9103ea8970ccae4";

test("manual MA13 control records the accepted gap without gate credit", async () => {
  const [contract, roadmap, ledger, template, workflow, rawEvidence] =
    await Promise.all([
      source("docs/action-660h-manual-ma13-merge-control.md"),
      source("docs/ture-master-roadmap.md"),
      source("docs/ture-current-state-ledger.md"),
      source(".github/PULL_REQUEST_TEMPLATE.md"),
      source(".github/workflows/milestone-a-ci.yml"),
      source("docs/evidence/action-660h-manual-ma13-merge-control.json"),
    ]);
  const evidence = JSON.parse(rawEvidence);

  expect(createHash("sha256").update(rawEvidence).digest("hex")).toBe(
    evidenceSha256,
  );

  expect(Object.keys(evidence).sort()).toEqual(
    [
      "authority",
      "candidate_canonicalization_conditions",
      "contract_version",
      "evidence_status",
      "gate_reconciliation",
      "github_readback",
      "manual_control",
      "observed_at",
      "operator_decision",
      "scope_limits",
    ].sort(),
  );

  expect(evidence.authority).toEqual({
    repository: "willyvalentin/trade",
    main_commit: currentMainCommit,
    main_tree: "86a59f234b69e63b07a60833224015018be41568",
    main_parents: [
      lastVerifiedProductionCommit,
      "3dcded2aab304a9e7a748a78de17f03f293d0ec5",
    ],
    main_pull_request: 99,
    exact_main_ci_run: 31543202986,
    repository_visibility: "private",
    repository_plan: "free",
  });

  expect(evidence.github_readback).toEqual({
    branch_protection_endpoint_status: 403,
    rulesets_endpoint_status: 403,
    branch_protection_rule_count: 0,
    plan_boundary_message:
      "Upgrade to GitHub Pro or make this repository public to enable this feature.",
    github_enforcement_available: false,
    branch_protection_verified: false,
  });
  expect(evidence.operator_decision).toEqual({
    selected_path: "continue_private_without_pro",
    repository_remains_private: true,
    billing_or_plan_mutation: false,
    manual_compensation_accepted: true,
    ma13_credit_accepted: false,
  });
  expect(evidence.manual_control).toEqual({
    control_version: "trade.manual-main-merge.v1",
    github_enforced: false,
    operator_enforced: true,
    pre_merge_steps: preMergeSteps,
    post_merge_steps: postMergeSteps,
    fail_closed_on_missing_or_stale_step: true,
    equivalent_to_branch_protection: false,
  });

  expect(evidence.gate_reconciliation).toEqual({
    previous_ma13_classification: "unknown_current",
    current_ma13_classification: "known_gap",
    manual_control_classification: "accepted_compensating_control",
    verified_before: 14,
    verified_after: 14,
    total: 15,
    percentage: 93.3,
    ma13_credit_awarded: false,
    milestone_a_complete: false,
  });
  expect(evidence.candidate_canonicalization_conditions).toEqual({
    dedicated_branch_from_current_main: false,
    draft_until_bounded_scope_frozen: false,
    exact_head_sha_recorded_after_scope_freeze: false,
    exact_head_ci_success: false,
    independent_read_only_review_no_blocking_findings: false,
    base_current_cleanly_mergeable_and_exact_scope_reconfirmed: false,
    explicit_operator_approval_of_pr_and_exact_head: false,
    ordinary_pr_merge_verified: false,
    exact_reviewed_scope_merged: false,
    exact_main_ci_success: false,
    resulting_netlify_github_identity_exact_if_published: false,
    resulting_production_smoke_green_if_published: false,
    bounded_delivery_evidence_preserved: false,
    all_satisfied: false,
  });
  expect(evidence.scope_limits).toEqual({
    application_source_mutation: false,
    database_mutation: false,
    auth_mutation: false,
    provider_mutation: false,
    runtime_mutation: false,
    deployment_triggered_by_this_candidate: false,
    broker_or_execution_authority: false,
    canonical_owner_uuid_disclosure: false,
    application_row_disclosure: false,
  });

  expect(contract).toContain("14/15 = 93.3%");
  expect(contract).toContain("It is not `verified_current`");
  expect(roadmap).toContain(
    "| MA-13 branch protection/required-check policy | known_gap |",
  );
  expect(ledger).toContain("| known_gap | MA-13 |");
  expect(roadmap).not.toContain(
    "| MA-13 branch protection/required-check policy | verified_current |",
  );
  expect(ledger).not.toContain("| verified_current | MA-13 |");

  expect(template).toContain("Manual merge safety checklist");
  const templateChecklist = template
    .split("\n")
    .filter((line) => line.startsWith("- [ ] "))
    .map((line) => line.slice("- [ ] ".length));
  expect(templateChecklist).toEqual(templateChecklistItems);
  expect(workflow).toContain(
    "tests/e2e/action-660h-manual-ma13-merge-control.spec.ts",
  );
  expect(workflow).toContain(
    "ref: ${{ github.event_name == 'pull_request' && github.event.pull_request.head.sha || github.sha }}",
  );
  expect(workflow).toContain("name: Verify exact revision identity");
  expect(workflow).toContain(
    "EXPECTED_REVISION: ${{ github.event_name == 'pull_request' && github.event.pull_request.head.sha || github.sha }}",
  );
  expect(workflow).toContain(
    'run: test "$(git rev-parse HEAD)" = "$EXPECTED_REVISION"',
  );
  expect(contract).toMatch(
    /No subset of these\s+conditions may set `all_satisfied` to true\./,
  );
  validateContractRequirementBinding(contract, evidence);

  expect(lastVerifiedProductionCommit).not.toBe(currentMainCommit);
  expect(evidence.authority.main_parents[0]).toBe(
    lastVerifiedProductionCommit,
  );
  expect(ledger).toContain(
    `production \`${lastVerifiedProductionCommit}\` is the first-parent ancestor of current main \`${currentMainCommit}\`; the commits are not equal because governance-only PR #99 advanced main without a production publish`,
  );
  expect(roadmap).toContain(
    `Current GitHub \`main\` is\n\`${currentMainCommit}\`; the production commit is its\nfirst-parent ancestor and is not equal to it because governance-only PR #99\nadvanced \`main\` without a production publish.`,
  );
  for (const text of [roadmap, ledger]) {
    expect(text).not.toContain("production and main are the same commit");
    expect(text).not.toContain("current exact production/main identity");
  }

  for (const text of [contract, roadmap, ledger, template, rawEvidence]) {
    expect(text).not.toMatch(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    );
  }
});

test("manual requirement IDs reject every deletion, mutation and extra", async () => {
  const [contract, rawEvidence] = await Promise.all([
    source("docs/action-660h-manual-ma13-merge-control.md"),
    source("docs/evidence/action-660h-manual-ma13-merge-control.json"),
  ]);
  const evidence = JSON.parse(rawEvidence);
  const groups = [
    { tag: "PRE", ids: preMergeSteps },
    { tag: "POST", ids: postMergeSteps },
    {
      tag: "CAN",
      ids: Object.keys(evidence.candidate_canonicalization_conditions).filter(
        (key) => key !== "all_satisfied",
      ),
    },
  ] as const;

  for (const { tag, ids } of groups) {
    for (const [index, id] of ids.entries()) {
      const marker = `\`[${tag}-${String(index + 1).padStart(2, "0")}: ${id}]\``;
      expect(() =>
        validateContractRequirementBinding(
          contract.replace(marker, "`[removed_requirement]`"),
          evidence,
        ),
      ).toThrow();
      expect(() =>
        validateContractRequirementBinding(
          contract.replace(marker, `${marker}\n${index + 20}. ${marker}`),
          evidence,
        ),
      ).toThrow();
      expect(() =>
        validateContractRequirementBinding(
          contract.replace(marker, marker.replace(id, `unexpected_${id}`)),
          evidence,
        ),
      ).toThrow();
    }
  }
});
