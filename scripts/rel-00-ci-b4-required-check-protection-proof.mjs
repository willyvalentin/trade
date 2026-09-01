const expectedShards = Object.freeze([
  "foundation",
  "replay-lineage",
  "snapshot-admission",
  "snapshot-issuance",
  "non-forgeable-authority",
  "lossless-scalar",
]);

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const key of Reflect.ownKeys(value)) {
    deepFreeze(value[key], seen);
  }
  return Object.freeze(value);
}

export const requiredCheckProtectionProofPolicy = deepFreeze({
  contract_version: "trade.rel00.ci-b4.required-check-protection-proof.v1",
  source_only: true,
  fresh_authenticated_readback_required: true,
  expected_repository: "willyvalentin/trade",
  expected_branch: "main",
  expected_workflow: {
    path: ".github/workflows/milestone-a-ci.yml",
    sha256: "f41f286a04b0027438aa328afe118ab6a0b8287c609807fc919c9a8ab6cf7bb5",
    blob_sha: "29969e9dba4c909ae9b4695b2cd90725b0569e0e",
  },
  protected_aggregate: {
    context: "provider-free-verification",
    app_id: 15368,
    app_slug: "github-actions",
  },
  exact_shards: expectedShards,
  protection_profile: {
    strict_required_status_checks: true,
    required_checks: [
      {
        context: "provider-free-verification",
        app_id: 15368,
      },
    ],
    contexts: ["provider-free-verification"],
    admin_enforcement: true,
    pull_request_required: true,
    required_approving_review_count: 0,
    dismiss_stale_reviews: true,
    require_code_owner_reviews: false,
    require_last_push_approval: false,
    conversation_resolution_required: true,
    force_pushes_allowed: false,
    deletions_allowed: false,
    linear_history_required: false,
    branch_locked: false,
    rulesets: "must_be_empty",
  },
  fresh_readback_protocol: [
    "GET /repos/{owner}/{repo}/branches/{branch}",
    "GET /repos/{owner}/{repo}/branches/{branch}/protection",
    "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
    "GET /repos/{owner}/{repo}/rulesets",
    "GET /repos/{owner}/{repo}/pulls/{pr_number}",
    "GET /repos/{owner}/{repo}/commits/{candidate_sha}",
    "GET /repos/{owner}/{repo}/contents/{workflow_path}?ref={candidate_sha}",
    "GET /repos/{owner}/{repo}/actions/runs/{run_id}",
    "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt}",
    "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt}/jobs?per_page=100",
    "GET /repos/{owner}/{repo}/check-runs/{job_id}",
  ],
  authority: {
    workflow_change: false,
    required_check_change: false,
    branch_protection_change: false,
    selector_activation: false,
    execution_plan_emitted: false,
    mergeability_decision: false,
    ci_deduplication_authorized: false,
    runtime_or_deployment_authority: false,
  },
});

function sameStrings(actual, expected) {
  if (!Array.isArray(actual) || actual.length !== expected.length) {
    return false;
  }
  for (let index = 0; index < expected.length; index += 1) {
    if (actual[index] !== expected[index]) {
      return false;
    }
  }
  return true;
}

function hasExactKeys(value, expected) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const keys = Object.keys(value).sort();
  return sameStrings(keys, [...expected].sort());
}

function sameRequiredChecks(actual) {
  return (
    Array.isArray(actual) &&
    actual.length === 1 &&
    hasExactKeys(actual[0], ["context", "app_id"]) &&
    actual[0].context === requiredCheckProtectionProofPolicy.protected_aggregate.context &&
    actual[0].app_id === requiredCheckProtectionProofPolicy.protected_aggregate.app_id
  );
}

function readContractProposal(proposal) {
  if (!proposal || typeof proposal !== "object") {
    return { ok: false, reason: "proof_contract_not_object" };
  }

  try {
    if (
      Array.isArray(proposal) ||
      !hasExactKeys(proposal, [
        "contract_version",
        "source_only",
        "fresh_authenticated_readback_required",
        "repository",
        "branch",
        "workflow",
        "protected_aggregate",
        "exact_shards",
        "protection_profile",
        "fresh_readback_protocol",
        "authority",
      ])
    ) {
      return { ok: false, reason: "proof_contract_not_object" };
    }

    return {
      ok: true,
      value: {
        contract_version: proposal.contract_version,
        source_only: proposal.source_only,
        fresh_authenticated_readback_required:
          proposal.fresh_authenticated_readback_required,
        repository: proposal.repository,
        branch: proposal.branch,
        workflow: proposal.workflow,
        protected_aggregate: proposal.protected_aggregate,
        exact_shards: proposal.exact_shards,
        protection_profile: proposal.protection_profile,
        fresh_readback_protocol: proposal.fresh_readback_protocol,
        authority: proposal.authority,
      },
    };
  } catch {
    return { ok: false, reason: "proof_contract_property_access_failed" };
  }
}

function matchesExpectedContract(snapshot) {
  try {
    const { protection_profile: profile, workflow, protected_aggregate: aggregate } =
      snapshot;
    const authority = snapshot.authority;
    if (
      !hasExactKeys(snapshot, [
        "contract_version",
        "source_only",
        "fresh_authenticated_readback_required",
        "repository",
        "branch",
        "workflow",
        "protected_aggregate",
        "exact_shards",
        "protection_profile",
        "fresh_readback_protocol",
        "authority",
      ]) ||
      snapshot.contract_version !== requiredCheckProtectionProofPolicy.contract_version ||
      snapshot.source_only !== true ||
      snapshot.fresh_authenticated_readback_required !== true ||
      snapshot.repository !== requiredCheckProtectionProofPolicy.expected_repository ||
      snapshot.branch !== requiredCheckProtectionProofPolicy.expected_branch ||
      !hasExactKeys(workflow, ["path", "sha256", "blob_sha"]) ||
      workflow.path !== requiredCheckProtectionProofPolicy.expected_workflow.path ||
      workflow.sha256 !== requiredCheckProtectionProofPolicy.expected_workflow.sha256 ||
      workflow.blob_sha !== requiredCheckProtectionProofPolicy.expected_workflow.blob_sha ||
      !hasExactKeys(aggregate, ["context", "app_id", "app_slug"]) ||
      aggregate.context !== requiredCheckProtectionProofPolicy.protected_aggregate.context ||
      aggregate.app_id !== requiredCheckProtectionProofPolicy.protected_aggregate.app_id ||
      aggregate.app_slug !== requiredCheckProtectionProofPolicy.protected_aggregate.app_slug ||
      !sameStrings(snapshot.exact_shards, requiredCheckProtectionProofPolicy.exact_shards) ||
      !hasExactKeys(profile, [
        "strict_required_status_checks",
        "required_checks",
        "contexts",
        "admin_enforcement",
        "pull_request_required",
        "required_approving_review_count",
        "dismiss_stale_reviews",
        "require_code_owner_reviews",
        "require_last_push_approval",
        "conversation_resolution_required",
        "force_pushes_allowed",
        "deletions_allowed",
        "linear_history_required",
        "branch_locked",
        "rulesets",
      ]) ||
      profile.strict_required_status_checks !== true ||
      !sameRequiredChecks(profile.required_checks) ||
      !sameStrings(profile.contexts, [
        requiredCheckProtectionProofPolicy.protected_aggregate.context,
      ]) ||
      profile.admin_enforcement !== true ||
      profile.pull_request_required !== true ||
      profile.required_approving_review_count !== 0 ||
      profile.dismiss_stale_reviews !== true ||
      profile.require_code_owner_reviews !== false ||
      profile.require_last_push_approval !== false ||
      profile.conversation_resolution_required !== true ||
      profile.force_pushes_allowed !== false ||
      profile.deletions_allowed !== false ||
      profile.linear_history_required !== false ||
      profile.branch_locked !== false ||
      profile.rulesets !== "must_be_empty" ||
      !sameStrings(
        snapshot.fresh_readback_protocol,
        requiredCheckProtectionProofPolicy.fresh_readback_protocol,
      ) ||
      !hasExactKeys(authority, [
        "workflow_change",
        "required_check_change",
        "branch_protection_change",
        "selector_activation",
        "execution_plan_emitted",
        "mergeability_decision",
        "ci_deduplication_authorized",
        "runtime_or_deployment_authority",
      ]) ||
      authority.workflow_change !== false ||
      authority.required_check_change !== false ||
      authority.branch_protection_change !== false ||
      authority.selector_activation !== false ||
      authority.execution_plan_emitted !== false ||
      authority.mergeability_decision !== false ||
      authority.ci_deduplication_authorized !== false ||
      authority.runtime_or_deployment_authority !== false
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function broadContainment(reason) {
  return deepFreeze({
    contract_version: requiredCheckProtectionProofPolicy.contract_version,
    outcome: "broad_containment_required",
    reason,
    policy_binding: null,
    effective_tier: 3,
    effective_disposition: "broad_containment",
    manual_review_required: true,
    external_state_verified: false,
    metadata_verified: false,
    reference_verified: false,
    activation_eligible: false,
    selector_connected: false,
    execution_plan_emitted: false,
    mergeability_decision: false,
  });
}

function policyBinding() {
  return {
    repository: requiredCheckProtectionProofPolicy.expected_repository,
    branch: requiredCheckProtectionProofPolicy.expected_branch,
    workflow: {
      path: requiredCheckProtectionProofPolicy.expected_workflow.path,
      sha256: requiredCheckProtectionProofPolicy.expected_workflow.sha256,
      blob_sha: requiredCheckProtectionProofPolicy.expected_workflow.blob_sha,
    },
    protected_aggregate: {
      context: requiredCheckProtectionProofPolicy.protected_aggregate.context,
      app_id: requiredCheckProtectionProofPolicy.protected_aggregate.app_id,
      app_slug: requiredCheckProtectionProofPolicy.protected_aggregate.app_slug,
    },
    exact_shards: [...requiredCheckProtectionProofPolicy.exact_shards],
    fresh_readback_protocol: [
      ...requiredCheckProtectionProofPolicy.fresh_readback_protocol,
    ],
  };
}

/**
 * Checks only a static, non-authoritative description of the future readback
 * protocol. It does not read a repository, invoke GitHub, or decide whether a
 * check, protection rule, selector, workflow, merge, deployment or runtime
 * transition is allowed.
 */
export function buildRequiredCheckProtectionProof(proposal) {
  const captured = readContractProposal(proposal);
  if (!captured.ok) {
    return broadContainment(captured.reason);
  }
  if (!matchesExpectedContract(captured.value)) {
    return broadContainment("proof_contract_drift_or_invalid_shape");
  }

  return deepFreeze({
    contract_version: requiredCheckProtectionProofPolicy.contract_version,
    outcome: "contract_only_fresh_readback_required",
    reason: null,
    policy_binding: policyBinding(),
    effective_tier: 3,
    effective_disposition: "broad_containment",
    manual_review_required: true,
    external_state_verified: false,
    metadata_verified: false,
    reference_verified: false,
    activation_eligible: false,
    selector_connected: false,
    execution_plan_emitted: false,
    mergeability_decision: false,
  });
}
