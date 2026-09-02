const expectedShards = Object.freeze([
  "foundation",
  "replay-lineage",
  "snapshot-admission",
  "snapshot-issuance",
  "non-forgeable-authority",
  "lossless-scalar",
]);

const expectedCheckRunTargetNames = Object.freeze([
  ...expectedShards.map((shard) => `provider-free-verification / ${shard}`),
  "provider-free-verification",
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
  contract_version: "trade.rel00.ci-b4.required-check-protection-proof.v2",
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
  readback_source_topology: {
    default_mode: "single_source_individual_job_endpoint",
    fallback_mode: "cross_bound_two_authorized_get_only_sources",
    policy_source_required_capability: "Administration:read",
    collection_source_access:
      "GET-only_check-run_collection_access_scope_not_introspected",
    policy_source_observations:
      "branch_protection_required_checks_rulesets_and_ready_pr_before_after",
    collection_source_observations:
      "ready_pr_before_after_merge_candidate_workflow_run_attempt_jobs_artifact_and_pr_head_check_runs",
    cross_source_ready_pr_binding:
      "same_repository_open_ready_pr_number_base_sha_head_sha_before_and_after",
    source_labels_required: true,
  },
  check_run_collection_fallback: {
    source_selection: "exactly_one_evidence_source_for_all_target_jobs",
    fallback_precondition:
      "direct_per_check_run_endpoint_403_for_one_attempt_job_bound_check_run_to_policy_source",
    direct_per_check_run_endpoint:
      "GET /repos/{owner}/{repo}/check-runs/{check_run_id}",
    pr_head_collection_endpoint:
      "GET /repos/{owner}/{repo}/commits/{pr_head_sha}/check-runs?filter=all&per_page=100&page=1",
    collection_ref: "pr_head_sha_only",
    collection_response:
      "http_200_total_count_equals_returned_count_and_is_at_most_100",
    target_check_run_names: expectedCheckRunTargetNames,
    target_selection:
      "exactly_one_collection_record_per_target_name_and_that_record_is_completed_success",
    non_target_records:
      "allowed_only_when_counted_but_never_selected_as_target_evidence",
    run_attempt: "must_equal_1",
    job_check_run_url_binding:
      "attempt_job_check_run_url_equals_collection_check_run_url",
    job_details_url_binding:
      "attempt_job_html_url_equals_collection_check_run_details_url",
    canonical_check_run_url:
      "https://api.github.com/repos/{owner}/{repo}/check-runs/{check_run_id}",
    canonical_details_url:
      "https://github.com/{owner}/{repo}/actions/runs/{run_id}/job/{job_id}",
    record_binding:
      "pr_head_sha_check_run_check_suite_app_and_terminal_state_must_match_bound_run",
    historical_scope: "current_pr_head_and_bound_run_only",
  },
  fresh_readback_protocol: [
    "before GET /repos/{owner}/{repo}/branches/{branch}",
    "before GET /repos/{owner}/{repo}/branches/{branch}/protection",
    "before GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
    "before GET /repos/{owner}/{repo}/rulesets",
    "before GET /repos/{owner}/{repo}/pulls/{pr_number}",
    "GET /repos/{owner}/{repo}/git/ref/pulls/{pr_number}/merge",
    "GET /repos/{owner}/{repo}/commits/{candidate_sha}",
    "GET /repos/{owner}/{repo}/contents/{workflow_path}?ref={candidate_sha}",
    "GET /repos/{owner}/{repo}/actions/runs/{run_id}",
    "GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts",
    "GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}",
    "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt}",
    "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt}/jobs?per_page=100&page=1",
    "GET-only check-run evidence under check_run_collection_fallback",
    "after GET /repos/{owner}/{repo}/branches/{branch}",
    "after GET /repos/{owner}/{repo}/branches/{branch}/protection",
    "after GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
    "after GET /repos/{owner}/{repo}/rulesets",
    "after GET /repos/{owner}/{repo}/pulls/{pr_number}",
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
  if (actual.length !== expected.length) {
    return false;
  }
  for (let index = 0; index < expected.length; index += 1) {
    if (actual[index] !== expected[index]) {
      return false;
    }
  }
  return true;
}

function hasOwnDataProperty(value, key, enumerable) {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  return (
    descriptor !== undefined &&
    Object.prototype.hasOwnProperty.call(descriptor, "value") &&
    descriptor.enumerable === enumerable
  );
}

function hasExactOwnDataKeys(value, expected) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  try {
    const keys = Reflect.ownKeys(value);
    if (
      keys.some((key) => typeof key !== "string") ||
      !sameStrings([...keys].sort(), [...expected].sort())
    ) {
      return false;
    }
    return keys.every((key) => hasOwnDataProperty(value, key, true));
  } catch {
    return false;
  }
}

function hasExactDenseArray(value, expectedLength) {
  if (!Array.isArray(value) || value.length !== expectedLength) {
    return false;
  }
  try {
    const keys = Reflect.ownKeys(value);
    const expectedKeys = [
      ...Array.from({ length: expectedLength }, (_, index) => String(index)),
      "length",
    ];
    if (
      keys.some((key) => typeof key !== "string") ||
      !sameStrings([...keys].sort(), expectedKeys.sort()) ||
      !hasOwnDataProperty(value, "length", false)
    ) {
      return false;
    }
    return Array.from({ length: expectedLength }, (_, index) =>
      hasOwnDataProperty(value, String(index), true),
    ).every(Boolean);
  } catch {
    return false;
  }
}

function sameExactStringArray(actual, expected) {
  if (!hasExactDenseArray(actual, expected.length)) {
    return false;
  }
  for (let index = 0; index < expected.length; index += 1) {
    if (actual[index] !== expected[index]) {
      return false;
    }
  }
  return true;
}

function sameRequiredChecks(actual) {
  return (
    Array.isArray(actual) &&
    actual.length === 1 &&
    hasExactDenseArray(actual, 1) &&
    hasExactOwnDataKeys(actual[0], ["context", "app_id"]) &&
    actual[0].context === requiredCheckProtectionProofPolicy.protected_aggregate.context &&
    actual[0].app_id === requiredCheckProtectionProofPolicy.protected_aggregate.app_id
  );
}

function sameExactFlatObject(actual, expected) {
  try {
    if (!hasExactOwnDataKeys(actual, Object.keys(expected))) {
      return false;
    }
    return Object.entries(expected).every(([key, expectedValue]) => {
      if (Array.isArray(expectedValue)) {
        return sameExactStringArray(actual[key], expectedValue);
      }
      return actual[key] === expectedValue;
    });
  } catch {
    return false;
  }
}

function readContractProposal(proposal) {
  if (!proposal || typeof proposal !== "object") {
    return { ok: false, reason: "proof_contract_not_object" };
  }

  try {
    if (
      Array.isArray(proposal) ||
      !hasExactOwnDataKeys(proposal, [
        "contract_version",
        "source_only",
        "fresh_authenticated_readback_required",
        "repository",
        "branch",
        "workflow",
        "protected_aggregate",
        "exact_shards",
        "protection_profile",
        "readback_source_topology",
        "check_run_collection_fallback",
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
        readback_source_topology: proposal.readback_source_topology,
        check_run_collection_fallback: proposal.check_run_collection_fallback,
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
    const {
      protection_profile: profile,
      workflow,
      protected_aggregate: aggregate,
      readback_source_topology: sourceTopology,
      check_run_collection_fallback: checkRunCollectionFallback,
    } = snapshot;
    const authority = snapshot.authority;
    if (
      !hasExactOwnDataKeys(snapshot, [
        "contract_version",
        "source_only",
        "fresh_authenticated_readback_required",
        "repository",
        "branch",
        "workflow",
        "protected_aggregate",
        "exact_shards",
        "protection_profile",
        "readback_source_topology",
        "check_run_collection_fallback",
        "fresh_readback_protocol",
        "authority",
      ]) ||
      snapshot.contract_version !== requiredCheckProtectionProofPolicy.contract_version ||
      snapshot.source_only !== true ||
      snapshot.fresh_authenticated_readback_required !== true ||
      snapshot.repository !== requiredCheckProtectionProofPolicy.expected_repository ||
      snapshot.branch !== requiredCheckProtectionProofPolicy.expected_branch ||
      !hasExactOwnDataKeys(workflow, ["path", "sha256", "blob_sha"]) ||
      workflow.path !== requiredCheckProtectionProofPolicy.expected_workflow.path ||
      workflow.sha256 !== requiredCheckProtectionProofPolicy.expected_workflow.sha256 ||
      workflow.blob_sha !== requiredCheckProtectionProofPolicy.expected_workflow.blob_sha ||
      !hasExactOwnDataKeys(aggregate, ["context", "app_id", "app_slug"]) ||
      aggregate.context !== requiredCheckProtectionProofPolicy.protected_aggregate.context ||
      aggregate.app_id !== requiredCheckProtectionProofPolicy.protected_aggregate.app_id ||
      aggregate.app_slug !== requiredCheckProtectionProofPolicy.protected_aggregate.app_slug ||
      !sameExactStringArray(
        snapshot.exact_shards,
        requiredCheckProtectionProofPolicy.exact_shards,
      ) ||
      !hasExactOwnDataKeys(profile, [
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
      !sameExactStringArray(profile.contexts, [
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
      !sameExactFlatObject(
        sourceTopology,
        requiredCheckProtectionProofPolicy.readback_source_topology,
      ) ||
      !sameExactFlatObject(
        checkRunCollectionFallback,
        requiredCheckProtectionProofPolicy.check_run_collection_fallback,
      ) ||
      !sameExactStringArray(
        snapshot.fresh_readback_protocol,
        requiredCheckProtectionProofPolicy.fresh_readback_protocol,
      ) ||
      !hasExactOwnDataKeys(authority, [
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
    readback_source_topology: {
      ...requiredCheckProtectionProofPolicy.readback_source_topology,
    },
    check_run_collection_fallback: {
      ...requiredCheckProtectionProofPolicy.check_run_collection_fallback,
      target_check_run_names: [
        ...requiredCheckProtectionProofPolicy.check_run_collection_fallback
          .target_check_run_names,
      ],
    },
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
