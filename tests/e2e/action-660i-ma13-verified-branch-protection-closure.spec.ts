import { expect, test } from "@playwright/test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const evidencePath =
  "docs/evidence/action-660i-ma13-verified-branch-protection-closure.json";
const evidenceSha256 =
  "085e2065a5a5af30b96fbaad86493bfdb8c871d760be1e347b3c420f36b06fc4";
const protectedMain = "cdf03e545cf25c0988627ef192d50acb1d72ba72";
const protectedMainTree = "f39ffe5f27d707b804f06273bd1732bb136e05b5";
const pr113Head = "daab530de6e512ae21b9aa38913fc176495774c0";

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function validateEvidence(value: unknown) {
  assert.ok(value && typeof value === "object" && !Array.isArray(value));
  const evidence = value as Record<string, unknown>;
  assert.deepStrictEqual(Object.keys(evidence).sort(),
    [
      "authority",
      "authorized_mutation",
      "before",
      "candidate_canonicalization_conditions",
      "contract_version",
      "evidence_status",
      "fail_closed_readback",
      "gate_reconciliation",
      "manual_control",
      "observed_at",
      "protection_observed_at",
      "protected_delivery_proof",
      "scope_limits",
      "source_document_sha256",
      "track_2",
      "verified_protection",
    ].sort(),
  );
  assert.equal(
    evidence.contract_version,
    "trade.action660i.ma13-verified-branch-protection-closure.v2",
  );
  assert.equal(
    evidence.evidence_status,
    "technical_enforcement_verified_repository_closure_candidate",
  );
  assert.equal(evidence.observed_at, "2026-08-17T21:04:06Z");
  assert.equal(evidence.protection_observed_at, "2026-08-17T15:15:05Z");
  assert.deepStrictEqual(evidence.authority, {
    repository: "willyvalentin/trade",
    default_branch: "main",
    repository_visibility: "private",
    pre_delivery_main_commit: protectedMain,
    pre_delivery_main_tree: protectedMainTree,
    pre_delivery_main_parents: [
      "8eb9c57c83d449042515e5184bae136bb6d827d0",
      pr113Head,
    ],
    pre_delivery_main_pull_request: 113,
    pre_delivery_exact_main_ci_run: 32045093016,
    pre_delivery_exact_main_ci_conclusion: "success",
  });
  assert.deepStrictEqual(evidence.before, {
    branch_protection_endpoint_status: 404,
    branch_protection_message: "Branch not protected",
    branch_protected: false,
    rulesets_endpoint_status: 200,
    repository_rulesets: [],
    graphql_branch_protection_rule_count: 0,
  });
  assert.deepStrictEqual(evidence.authorized_mutation, {
    explicit_operator_instruction_to_close_ma13: true,
    github_repository_configuration_mutation_performed: true,
    branch_protection_put_succeeded: true,
    production_deployment_performed: false,
    application_source_mutation_performed: false,
    database_or_supabase_mutation_performed: false,
    runtime_or_broker_mutation_performed: false,
  });
  assert.deepStrictEqual(evidence.verified_protection, {
    branch_protection_endpoint_status: 200,
    branch_protected: true,
    graphql_branch_protection_rule_count: 1,
    pattern: "main",
    pull_request_required: true,
    required_approving_review_count: 0,
    dismiss_stale_reviews: true,
    require_code_owner_reviews: false,
    require_last_push_approval: false,
    required_status_checks: [
      {
        context: "provider-free-verification",
        app_id: 15368,
        app_slug: "github-actions",
      },
    ],
    strict_required_status_checks: true,
    admin_enforcement: true,
    enforcement_level: "everyone",
    force_pushes_allowed: false,
    deletions_allowed: false,
    conversation_resolution_required: true,
    linear_history_required: false,
    branch_locked: false,
  });
  assert.deepStrictEqual(evidence.fail_closed_readback, {
    pull_request: 113,
    exact_head: pr113Head,
    exact_base: "8eb9c57c83d449042515e5184bae136bb6d827d0",
    is_draft: true,
    mergeable: "MERGEABLE",
    merge_state_status: "BLOCKED",
  });
  assert.deepStrictEqual(evidence.protected_delivery_proof, {
    pull_request: 113,
    exact_reviewed_head: pr113Head,
    merged_at: "2026-08-17T16:19:27Z",
    merge_commit: protectedMain,
    merge_tree: protectedMainTree,
    ordinary_pull_request_merge: true,
    reviewed_head_tree_equals_merge_tree: true,
    exact_main_ci_run: 32045093016,
    exact_main_ci_conclusion: "success",
    exact_main_ci_completed_at: "2026-08-17T18:22:10Z",
    post_merge_protection_observed_at: "2026-08-17T21:04:06Z",
    post_merge_protection_profile_unchanged: true,
    production_deployment_performed: false,
  });
  const protectedDelivery = evidence.protected_delivery_proof as Record<
    string,
    unknown
  >;
  const protectionObservedAt = Date.parse(
    String(evidence.protection_observed_at),
  );
  const mergedAt = Date.parse(String(protectedDelivery.merged_at));
  const exactMainCiCompletedAt = Date.parse(
    String(protectedDelivery.exact_main_ci_completed_at),
  );
  const postMergeProtectionObservedAt = Date.parse(
    String(protectedDelivery.post_merge_protection_observed_at),
  );
  const observedAt = Date.parse(String(evidence.observed_at));
  for (const timestamp of [
    protectionObservedAt,
    mergedAt,
    exactMainCiCompletedAt,
    postMergeProtectionObservedAt,
    observedAt,
  ]) {
    assert.ok(Number.isFinite(timestamp));
  }
  assert.ok(protectionObservedAt < mergedAt);
  assert.ok(mergedAt < exactMainCiCompletedAt);
  assert.ok(exactMainCiCompletedAt <= postMergeProtectionObservedAt);
  assert.equal(postMergeProtectionObservedAt, observedAt);
  assert.deepStrictEqual(evidence.gate_reconciliation, {
    previous_ma13_classification: "known_gap",
    technical_ma13_classification: "verified_current",
    verified_before: 14,
    verified_after_technical_enforcement: 15,
    total: 15,
    percentage: 100,
    canonical_roadmap_ledger_delivery_pending: true,
    milestone_a_complete_after_exact_main_delivery: true,
  });
  assert.deepStrictEqual(evidence.manual_control, {
    action_660h_remains_defense_in_depth: true,
    independent_read_only_review_still_required: true,
    explicit_operator_pr_and_sha_approval_still_required: true,
    ordinary_pull_request_merge_still_required: true,
    exact_main_ci_still_required: true,
    technical_branch_protection_now_enforced: true,
  });
  assert.deepStrictEqual(evidence.track_2, {
    delivered_current_main_actions: [
      "666CJ", "666CK", "666CL", "666CM", "666CN", "666CO",
      "666CP", "666CQ", "666CS", "666CT", "666CU", "666CV",
    ],
    next_bounded_objective:
      "current_main_integrity_provenance_separated_observation_authority_successor",
    default_off: true,
    runtime_unwired: true,
  });
  assert.deepStrictEqual(evidence.candidate_canonicalization_conditions, {
    current_protected_main_base_reconciled: false,
    roadmap_and_ledger_currentness_verified: false,
    exact_head_ci_success: false,
    independent_read_only_review_no_blocking_findings: false,
    explicit_operator_approval_of_pr_and_exact_head: false,
    protected_ordinary_pr_merge_verified: false,
    exact_reviewed_scope_merged: false,
    exact_main_ci_success: false,
    post_merge_protection_readback_exact: false,
    all_satisfied: false,
  });
  assert.deepStrictEqual(evidence.scope_limits, {
    github_repository_configuration_mutation_already_completed: true,
    github_repository_configuration_mutation_by_this_candidate: false,
    application_source_mutation: false,
    database_or_supabase_mutation: false,
    auth_or_runtime_mutation: false,
    production_deployment: false,
    netlify_configuration_mutation: false,
    broker_or_execution_authority: false,
    canonical_owner_uuid_disclosure: false,
    application_row_disclosure: false,
  });
  const sourceHashes = evidence.source_document_sha256 as Record<string, unknown>;
  assert.deepStrictEqual(Object.keys(sourceHashes).sort(), [
    "docs/action-660i-ma13-verified-branch-protection-closure.md",
    "docs/ture-current-state-ledger.md",
    "docs/ture-master-roadmap.md",
  ]);
  for (const digest of Object.values(sourceHashes)) {
    assert.match(String(digest), /^[0-9a-f]{64}$/);
  }
}

type MutableEvidence = Record<string, unknown> & {
  authority: Record<string, unknown>;
  verified_protection: Record<string, unknown> & {
    required_status_checks: Array<Record<string, unknown>>;
  };
  fail_closed_readback: Record<string, unknown>;
  protected_delivery_proof: Record<string, unknown>;
  gate_reconciliation: Record<string, unknown>;
  manual_control: Record<string, unknown>;
  track_2: Record<string, unknown> & {
    delivered_current_main_actions: string[];
  };
  candidate_canonicalization_conditions: Record<string, unknown>;
  scope_limits: Record<string, unknown>;
  source_document_sha256: Record<string, string>;
};

test("closes MA13 only through the exact protected-main evidence chain", async () => {
  const [rawEvidence, action, roadmap, ledger, workflow] = await Promise.all([
    source(evidencePath),
    source("docs/action-660i-ma13-verified-branch-protection-closure.md"),
    source("docs/ture-master-roadmap.md"),
    source("docs/ture-current-state-ledger.md"),
    source(".github/workflows/milestone-a-ci.yml"),
  ]);
  const evidence = JSON.parse(rawEvidence);

  expect(createHash("sha256").update(rawEvidence).digest("hex")).toBe(
    evidenceSha256,
  );
  expect(() => validateEvidence(evidence)).not.toThrow();

  const documents: Record<string, string> = {
    "docs/action-660i-ma13-verified-branch-protection-closure.md": action,
    "docs/ture-current-state-ledger.md": ledger,
    "docs/ture-master-roadmap.md": roadmap,
  };
  expect(Object.keys(evidence.source_document_sha256).sort()).toEqual(
    Object.keys(documents).sort(),
  );
  for (const [relativePath, text] of Object.entries(documents)) {
    expect(createHash("sha256").update(text).digest("hex")).toBe(
      evidence.source_document_sha256[relativePath],
    );
  }

  expect(action).toContain("15/15 = 100%");
  expect(action).toContain("required approval count is zero");
  expect(action).toContain("single-owner repository");
  expect(action).toMatch(/No\s+production deployment is authorized or required/);
  expect(roadmap).toContain(
    "| MA-13 branch protection/required-check policy | verified_current |",
  );
  expect(roadmap).toContain("15 of 15 required gates verified (100%)");
  expect(ledger).toContain("| known_gap | none |");
  expect(ledger).toContain("15/15 = 100%");
  expect(workflow).toContain(
    "tests/e2e/action-660i-ma13-verified-branch-protection-closure.spec.ts",
  );

  for (const text of [rawEvidence, action, roadmap, ledger]) {
    expect(text).not.toMatch(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    );
  }
});

test("rejects every protection, gate, delivery and shape drift", async () => {
  const evidence = JSON.parse(await source(evidencePath));
  const mutations: Array<(candidate: MutableEvidence) => void> = [
    (candidate) => { candidate.extra = true; },
    (candidate) => { delete candidate.protection_observed_at; },
    (candidate) => { candidate.observed_at = "2026-08-17T15:15:05Z"; },
    (candidate) => { delete candidate.authority.pre_delivery_main_commit; },
    (candidate) => { candidate.authority.pre_delivery_main_tree = "0".repeat(40); },
    (candidate) => { candidate.verified_protection.branch_protection_endpoint_status = 404; },
    (candidate) => { candidate.verified_protection.branch_protected = false; },
    (candidate) => { candidate.verified_protection.graphql_branch_protection_rule_count = 0; },
    (candidate) => { candidate.verified_protection.pull_request_required = false; },
    (candidate) => { candidate.verified_protection.required_status_checks[0].context = "forged"; },
    (candidate) => { candidate.verified_protection.required_status_checks[0].app_id = 0; },
    (candidate) => { candidate.verified_protection.required_status_checks.push({ context: "extra", app_id: 1, app_slug: "extra" }); },
    (candidate) => { candidate.verified_protection.strict_required_status_checks = false; },
    (candidate) => { candidate.verified_protection.admin_enforcement = false; },
    (candidate) => { candidate.verified_protection.required_approving_review_count = 1; },
    (candidate) => { candidate.verified_protection.force_pushes_allowed = true; },
    (candidate) => { candidate.verified_protection.deletions_allowed = true; },
    (candidate) => { candidate.verified_protection.conversation_resolution_required = false; },
    (candidate) => { candidate.fail_closed_readback.merge_state_status = "CLEAN"; },
    (candidate) => { candidate.protected_delivery_proof.ordinary_pull_request_merge = false; },
    (candidate) => { candidate.protected_delivery_proof.merged_at = "2026-08-17T15:00:00Z"; },
    (candidate) => { candidate.protected_delivery_proof.exact_main_ci_conclusion = "failure"; },
    (candidate) => { candidate.protected_delivery_proof.exact_main_ci_completed_at = "2026-08-17T16:00:00Z"; },
    (candidate) => { candidate.protected_delivery_proof.post_merge_protection_observed_at = "2026-08-17T18:00:00Z"; },
    (candidate) => { candidate.gate_reconciliation.technical_ma13_classification = "known_gap"; },
    (candidate) => { candidate.gate_reconciliation.verified_after_technical_enforcement = 14; },
    (candidate) => { candidate.gate_reconciliation.percentage = 93.3; },
    (candidate) => { candidate.manual_control.action_660h_remains_defense_in_depth = false; },
    (candidate) => { candidate.track_2.delivered_current_main_actions.pop(); },
    (candidate) => { candidate.candidate_canonicalization_conditions.all_satisfied = true; },
    (candidate) => { candidate.scope_limits.production_deployment = true; },
    (candidate) => { delete candidate.source_document_sha256["docs/ture-master-roadmap.md"]; },
  ];

  for (const mutate of mutations) {
    const candidate = structuredClone(evidence) as MutableEvidence;
    mutate(candidate);
    expect(() => validateEvidence(candidate)).toThrow();
  }
});
