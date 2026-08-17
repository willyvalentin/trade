import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function sectionBetween(text: string, start: string, end: string) {
  const lines = text.split("\n");
  const startIndexes = lines.flatMap((line, index) =>
    line === start ? [index] : [],
  );
  const endIndexes = lines.flatMap((line, index) =>
    line === end ? [index] : [],
  );
  if (
    startIndexes.length !== 1 ||
    endIndexes.length !== 1 ||
    endIndexes[0] <= startIndexes[0]
  ) {
    throw new Error(`Missing or reordered contract section: ${start} -> ${end}`);
  }
  return lines.slice(startIndexes[0] + 1, endIndexes[0]).join("\n");
}

const governedHeadings = [
  "## Mandatory manual control",
  "### Before merge",
  "### After merge",
  "## Operational effect",
  "## Delivery condition",
  "## Scope limits",
];

function assertExactHeadingOrder(text: string) {
  const lines = text.split("\n");
  let previousLineIndex = -1;
  for (const heading of governedHeadings) {
    const indexes = lines.flatMap((line, index) =>
      line === heading ? [index] : [],
    );
    if (indexes.length !== 1 || indexes[0] <= previousLineIndex) {
      throw new Error(`Missing, duplicated or reordered heading: ${heading}`);
    }
    previousLineIndex = indexes[0];
  }
}

function taggedRequirementIds(
  text: string,
  tag: "PRE" | "POST" | "CAN",
  firstDocumentNumber: number,
) {
  const commonMarkNumberedLines = text
    .split("\n")
    .filter((line) => /^ {0,3}\d{1,9}[.)][ \t]+/.test(line));
  const requirementPattern = new RegExp(
    "^(\\d+)\\. `\\[" + tag + "-(\\d{2}): ([a-z0-9_]+)\\]`(?: .*)?$",
  );

  return commonMarkNumberedLines.map((line, index) => {
    const match = line.match(requirementPattern);
    if (!match) {
      throw new Error(`${tag} contains an untagged or malformed requirement`);
    }
    const expectedDocumentNumber = firstDocumentNumber + index;
    if (match[1] !== String(expectedDocumentNumber)) {
      throw new Error(`${tag} document numbering is not contiguous`);
    }
    const expectedOrdinal = String(index + 1).padStart(2, "0");
    if (match[2] !== expectedOrdinal) {
      throw new Error(`${tag} requirement sequence is not contiguous`);
    }
    return match[3];
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
  assertExactHeadingOrder(contract);
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
  if (
    !Object.prototype.hasOwnProperty.call(
      evidence.candidate_canonicalization_conditions,
      "all_satisfied",
    ) ||
    evidence.candidate_canonicalization_conditions.all_satisfied !== false ||
    Object.values(evidence.candidate_canonicalization_conditions).some(
      (value) => value !== false,
    )
  ) {
    throw new Error("candidate canonicalization must be explicitly fail-closed");
  }

  requireExactIds(
    taggedRequirementIds(beforeMerge, "PRE", 1),
    evidence.manual_control.pre_merge_steps,
    "pre-merge",
  );
  requireExactIds(
    taggedRequirementIds(afterMerge, "POST", 9),
    evidence.manual_control.post_merge_steps,
    "post-merge",
  );
  requireExactIds(
    taggedRequirementIds(delivery, "CAN", 1),
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

const manualControlMainCommit =
  "7662d3f863f8f921b816670363431df8e1ebcdea";
const manualControlMainTree = "86a59f234b69e63b07a60833224015018be41568";
const currentMainCommit = "cdf03e545cf25c0988627ef192d50acb1d72ba72";
const currentMainTree = "f39ffe5f27d707b804f06273bd1732bb136e05b5";
const lastVerifiedProductionCommit =
  "f463644ddeb7f49fa8b80924d9103ea8970ccae4";

test("manual MA13 control preserves the historical accepted gap without gate credit", async () => {
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
    main_commit: manualControlMainCommit,
    main_tree: manualControlMainTree,
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
    "| MA-13 branch protection/required-check policy | verified_current |",
  );
  expect(ledger).toContain("MA-13 is `verified_current`");
  expect(ledger).toContain("| known_gap | none |");
  expect(roadmap).toContain("The former Action 660H");

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
    `production \`${lastVerifiedProductionCommit}\` is the first-parent ancestor of protected pre-delivery main \`${currentMainCommit}\`; the commits are not equal because PRs #99, #100 and #109 advanced governance and PRs #101 through #108 and #110 through #113 delivered provider-free, runtime-unwired source without a production publish`,
  );
  expect(roadmap).toContain(
    `The protected GitHub \`main\` base\nis \`${currentMainCommit}\`; the production commit is its\nfirst-parent ancestor and is not equal to it because PRs #99, #100 and #109\nadvanced governance and PRs #101 through #108 and #110 through #113 delivered\nprovider-free, runtime-unwired Track 2 source without a production publish.`,
  );
  expect(roadmap).toMatch(
    new RegExp(
      `then by\\s+\`f463644ddeb7f49fa8b80924d9103ea8970ccae4\` /\\s+\`b0c8eae01c22d3f720e4cc5fc4ed5424a24bdcad\`, then by\\s+\`${manualControlMainCommit}\` /\\s+\`${manualControlMainTree}\`, then by[\\s\\S]+and now by the protected\\s+pre-delivery main base \`${currentMainCommit}\` /\\s+tree \`${currentMainTree}\``,
    ),
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

  for (const [heading, extra] of [
    ["### After merge", "9. An extra mandatory untagged step."],
    [
      "## Operational effect",
      "13. An extra mandatory untagged post-merge step.",
    ],
    ["## Scope limits", "14. An extra mandatory untagged condition."],
  ] as const) {
    expect(() =>
      validateContractRequirementBinding(
        contract.replace(heading, `${extra}\n\n${heading}`),
        evidence,
      ),
    ).toThrow();
  }

  const operationalIndex = contract.indexOf("## Operational effect");
  const deliveryIndex = contract.indexOf("## Delivery condition");
  const scopeIndex = contract.indexOf("## Scope limits");
  const deliveryBlock = contract.slice(deliveryIndex, scopeIndex);
  const deliveryBeforeOperational =
    contract.slice(0, operationalIndex) +
    deliveryBlock +
    contract.slice(operationalIndex, deliveryIndex) +
    contract.slice(scopeIndex);
  expect(() =>
    validateContractRequirementBinding(deliveryBeforeOperational, evidence),
  ).toThrow();

  for (const heading of governedHeadings) {
    expect(() =>
      validateContractRequirementBinding(
        contract.replace(`${heading}\n`, `${heading}s\n`),
        evidence,
      ),
    ).toThrow();
  }

  for (const extra of [
    "  9. An indented untagged requirement.",
    "9.\tA tab-separated untagged requirement.",
    "9) A parenthesized untagged requirement.",
  ]) {
    for (const heading of ["### After merge", "## Scope limits"]) {
      expect(() =>
        validateContractRequirementBinding(
          contract.replace(heading, `${extra}\n\n${heading}`),
          evidence,
        ),
      ).toThrow();
    }
  }

  const missingAllSatisfied = structuredClone(evidence);
  delete missingAllSatisfied.candidate_canonicalization_conditions
    .all_satisfied;
  expect(() =>
    validateContractRequirementBinding(contract, missingAllSatisfied),
  ).toThrow();

  const trueAllSatisfied = structuredClone(evidence);
  trueAllSatisfied.candidate_canonicalization_conditions.all_satisfied = true;
  expect(() =>
    validateContractRequirementBinding(contract, trueAllSatisfied),
  ).toThrow();

  const trueIndividualCondition = structuredClone(evidence);
  trueIndividualCondition.candidate_canonicalization_conditions.exact_head_ci_success =
    true;
  expect(() =>
    validateContractRequirementBinding(contract, trueIndividualCondition),
  ).toThrow();
});
