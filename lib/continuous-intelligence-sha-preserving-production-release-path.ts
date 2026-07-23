export type ContinuousIntelligenceShaPreservingProductionReleasePathInput = Readonly<{
  candidate_matches_pr_head: boolean;
  candidate_scope_validated: boolean;
  production_head_unchanged: boolean;
  production_head_is_ancestor: boolean;
  candidate_is_direct_child: boolean;
  github_administration_access: "available" | "insufficient_scope" | "not_authenticated" | "unknown";
  github_metadata: "verified" | "unavailable";
  direct_ref_update_allowed: "allowed" | "blocked" | "unknown";
  github_ref_update_policy: "allowed" | "pr_merge_required" | "admin_bypass_required" | "unknown";
  required_checks: "passed" | "missing" | "unknown";
  assertion_matches_candidate: boolean;
  netlify_administration_access: "available" | "insufficient_scope" | "not_authenticated" | "site_unknown" | "unknown";
  netlify_metadata: "verified" | "unavailable";
  netlify_production_branch: "matches" | "mismatch" | "unknown";
  production_deploy_trigger: "single_git_push" | "unknown" | "multiple_or_unsafe";
  environment_update_behavior: "no_deploy" | "triggers_deploy" | "unknown";
  explicit_branch_write_approval: boolean;
}>;

export type ContinuousIntelligenceShaPreservingProductionReleasePathResult = Readonly<{
  status:
    | "sha_preserving_fast_forward_available"
    | "blocked_by_branch_protection"
    | "blocked_by_changed_production_head"
    | "blocked_by_unknown_netlify_trigger"
    | "blocked_by_assertion_mismatch"
    | "blocked_by_release_policy"
    | "blocked_by_missing_github_metadata"
    | "blocked_by_missing_netlify_metadata"
    | "blocked_by_pr_merge_required"
    | "blocked_by_required_checks"
    | "blocked_by_netlify_production_branch"
    | "blocked_by_netlify_multi_deploy_risk"
    | "blocked_by_env_update_deploy"
    | "blocked_by_insufficient_github_administration_access"
    | "blocked_by_insufficient_netlify_access"
    | "blocked_by_missing_authenticated_administration_context"
    | "ready_for_explicit_sha_preserving_release_approval";
  production_mutation_performed: false;
  exact_candidate_sha_preserved: false;
}>;

/**
 * Purely classifies evidence for a non-force, immutable-SHA production ref update.
 * The caller owns all GitHub and Netlify reads; this helper never releases anything.
 */
export function evaluateContinuousIntelligenceShaPreservingProductionReleasePath(
  input: ContinuousIntelligenceShaPreservingProductionReleasePathInput,
): ContinuousIntelligenceShaPreservingProductionReleasePathResult {
  if (!input.candidate_matches_pr_head || !input.candidate_scope_validated) return result("blocked_by_release_policy");
  if (!input.production_head_unchanged || !input.production_head_is_ancestor || !input.candidate_is_direct_child) {
    return result("blocked_by_changed_production_head");
  }
  if (input.github_administration_access !== "available" && input.netlify_administration_access !== "available") {
    return result("blocked_by_missing_authenticated_administration_context");
  }
  if (input.github_administration_access !== "available") return result("blocked_by_insufficient_github_administration_access");
  if (input.github_metadata !== "verified") return result("blocked_by_missing_github_metadata");
  if (!input.assertion_matches_candidate) return result("blocked_by_assertion_mismatch");
  if (input.github_ref_update_policy === "pr_merge_required") return result("blocked_by_pr_merge_required");
  if (input.github_ref_update_policy === "admin_bypass_required" || input.github_ref_update_policy === "unknown") {
    return result("blocked_by_release_policy");
  }
  if (input.direct_ref_update_allowed === "blocked") return result("blocked_by_branch_protection");
  if (input.direct_ref_update_allowed !== "allowed") return result("blocked_by_release_policy");
  if (input.required_checks !== "passed") return result("blocked_by_required_checks");
  if (input.netlify_administration_access !== "available") return result("blocked_by_insufficient_netlify_access");
  if (input.netlify_metadata !== "verified") return result("blocked_by_missing_netlify_metadata");
  if (input.netlify_production_branch !== "matches") return result("blocked_by_netlify_production_branch");
  if (input.environment_update_behavior === "triggers_deploy") return result("blocked_by_env_update_deploy");
  if (input.environment_update_behavior !== "no_deploy") return result("blocked_by_unknown_netlify_trigger");
  if (input.production_deploy_trigger === "multiple_or_unsafe") return result("blocked_by_netlify_multi_deploy_risk");
  if (input.production_deploy_trigger !== "single_git_push") return result("blocked_by_unknown_netlify_trigger");
  if (!input.explicit_branch_write_approval) return result("ready_for_explicit_sha_preserving_release_approval");
  return result("sha_preserving_fast_forward_available");
}

function result(
  status: ContinuousIntelligenceShaPreservingProductionReleasePathResult["status"],
): ContinuousIntelligenceShaPreservingProductionReleasePathResult {
  return Object.freeze({
    status,
    production_mutation_performed: false,
    exact_candidate_sha_preserved: false,
  });
}
