import { expect, test } from "@playwright/test";

import {
  evaluateContinuousIntelligenceShaPreservingProductionReleasePath,
  type ContinuousIntelligenceShaPreservingProductionReleasePathInput,
} from "../../lib/continuous-intelligence-sha-preserving-production-release-path";

function path(
  overrides: Partial<ContinuousIntelligenceShaPreservingProductionReleasePathInput> = {},
): ContinuousIntelligenceShaPreservingProductionReleasePathInput {
  return {
    candidate_matches_pr_head: true,
    candidate_scope_validated: true,
    production_head_unchanged: true,
    production_head_is_ancestor: true,
    candidate_is_direct_child: true,
    github_administration_access: "available",
    github_metadata: "verified",
    direct_ref_update_allowed: "allowed",
    github_ref_update_policy: "allowed",
    required_checks: "passed",
    assertion_matches_candidate: true,
    netlify_administration_access: "available",
    netlify_metadata: "verified",
    netlify_production_branch: "matches",
    production_deploy_trigger: "single_git_push",
    environment_update_behavior: "no_deploy",
    explicit_branch_write_approval: false,
    ...overrides,
  };
}

test("Action 634 models a direct-child fast-forward as awaiting explicit branch-write approval", () => {
  const result = evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path());
  expect(result.status).toBe("ready_for_explicit_sha_preserving_release_approval");
  expect(result.production_mutation_performed).toBe(false);
  expect(result.exact_candidate_sha_preserved).toBe(false);
});

test("Action 634 blocks descendants that are not the exact direct-child production release", () => {
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ candidate_is_direct_child: false })).status)
    .toBe("blocked_by_changed_production_head");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ production_head_is_ancestor: false })).status)
    .toBe("blocked_by_changed_production_head");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ production_head_unchanged: false })).status)
    .toBe("blocked_by_changed_production_head");
});

test("Action 634 rejects scope, candidate, assertion, and required-check uncertainty", () => {
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ candidate_matches_pr_head: false })).status)
    .toBe("blocked_by_release_policy");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ candidate_scope_validated: false })).status)
    .toBe("blocked_by_release_policy");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ assertion_matches_candidate: false })).status)
    .toBe("blocked_by_assertion_mismatch");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ required_checks: "missing" })).status)
    .toBe("blocked_by_required_checks");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ required_checks: "unknown" })).status)
    .toBe("blocked_by_required_checks");
});

test("Action 634 treats branch rules and unverified deployment triggers as hard release gates", () => {
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ direct_ref_update_allowed: "blocked" })).status)
    .toBe("blocked_by_branch_protection");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ direct_ref_update_allowed: "unknown" })).status)
    .toBe("blocked_by_release_policy");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ production_deploy_trigger: "unknown" })).status)
    .toBe("blocked_by_unknown_netlify_trigger");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ production_deploy_trigger: "multiple_or_unsafe" })).status)
    .toBe("blocked_by_netlify_multi_deploy_risk");
});

test("Action 634 only models fast-forward availability after all gates and explicit approval", () => {
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ explicit_branch_write_approval: true })).status)
    .toBe("sha_preserving_fast_forward_available");
});

test("Action 635 keeps authenticated GitHub and Netlify controls as distinct release gates", () => {
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ github_metadata: "unavailable" })).status)
    .toBe("blocked_by_missing_github_metadata");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ github_ref_update_policy: "pr_merge_required" })).status)
    .toBe("blocked_by_pr_merge_required");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ github_ref_update_policy: "admin_bypass_required" })).status)
    .toBe("blocked_by_release_policy");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ netlify_metadata: "unavailable" })).status)
    .toBe("blocked_by_missing_netlify_metadata");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ netlify_production_branch: "mismatch" })).status)
    .toBe("blocked_by_netlify_production_branch");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({ environment_update_behavior: "triggers_deploy" })).status)
    .toBe("blocked_by_env_update_deploy");
});

test("Action 636 fails closed when release administration access is missing or insufficient", () => {
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({
    github_administration_access: "not_authenticated",
    netlify_administration_access: "not_authenticated",
  })).status).toBe("blocked_by_missing_authenticated_administration_context");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({
    github_administration_access: "insufficient_scope",
  })).status).toBe("blocked_by_insufficient_github_administration_access");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({
    netlify_administration_access: "insufficient_scope",
  })).status).toBe("blocked_by_insufficient_netlify_access");
  expect(evaluateContinuousIntelligenceShaPreservingProductionReleasePath(path({
    netlify_administration_access: "site_unknown",
  })).status).toBe("blocked_by_insufficient_netlify_access");
});
