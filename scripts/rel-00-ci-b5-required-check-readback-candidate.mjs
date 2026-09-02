import {
  buildRequiredCheckProtectionProof,
  requiredCheckProtectionProofPolicy,
} from "./rel-00-ci-b4-required-check-protection-proof.mjs";

const expectedIdentityBindingFields = Object.freeze([
  "pr_number",
  "pr_base_sha",
  "pr_head_sha",
  "candidate_sha",
  "candidate_tree_sha",
  "candidate_parent_shas",
  "workflow_blob_sha",
  "run_id",
  "run_attempt",
  "check_suite_id",
  "job_id",
  "artifact_id",
  "artifact_sha256",
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

export const requiredCheckReadbackCandidatePolicy = deepFreeze({
  contract_version: "trade.rel00.ci-b5.required-check-readback-candidate.v1",
  source_only: true,
  external_readback_performed: false,
  serialized_input: {
    format: "strict_json_text",
    max_characters: 65536,
    object_input_accepted: false,
  },
  expected_b4_contract_version:
    requiredCheckProtectionProofPolicy.contract_version,
  readback_shape: {
    schema_version: "trade.rel00.ci-b5.readback-shape.v1",
    required_reader_capability: "Administration:read",
    mode: "fresh_authenticated_read_only",
    raw_api_response_allowed: false,
    mutation_methods_allowed: false,
    protocol: [...requiredCheckProtectionProofPolicy.fresh_readback_protocol],
    identity_binding_fields: [...expectedIdentityBindingFields],
    terminal_check_result: "completed_success_only",
    pagination: "must_be_complete",
    rulesets: "must_be_empty",
  },
  rollback: {
    activation_state: "unactivated_not_connected",
    on_readback_drift:
      "discard_unexecuted_candidate_and_require_fresh_readback",
    one_step: true,
    external_state_mutated: false,
    preserve_current_ready_main_full_ci: true,
    preserve_current_required_check: true,
    preserve_current_branch_protection: true,
    ci_deduplication_authorized: false,
  },
  authority: {
    workflow_change: false,
    required_check_change: false,
    branch_protection_change: false,
    selector_activation: false,
    execution_plan_emitted: false,
    mergeability_decision: false,
    ci_deduplication_authorized: false,
    runtime_or_deployment_authority: false,
    reader_invocation: false,
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
  try {
    for (let index = 0; index < expected.length; index += 1) {
      if (actual[index] !== expected[index]) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

function readCandidateProposal(proposal) {
  if (!proposal || typeof proposal !== "object") {
    return { ok: false, reason: "readback_candidate_not_object" };
  }
  try {
    if (
      Array.isArray(proposal) ||
      !hasExactOwnDataKeys(proposal, [
        "contract_version",
        "source_only",
        "external_readback_performed",
        "proof_contract",
        "readback_shape",
        "rollback",
        "authority",
      ])
    ) {
      return { ok: false, reason: "readback_candidate_not_object" };
    }
    return {
      ok: true,
      value: {
        contract_version: proposal.contract_version,
        source_only: proposal.source_only,
        external_readback_performed: proposal.external_readback_performed,
        proof_contract: proposal.proof_contract,
        readback_shape: proposal.readback_shape,
        rollback: proposal.rollback,
        authority: proposal.authority,
      },
    };
  } catch {
    return { ok: false, reason: "readback_candidate_property_access_failed" };
  }
}

function parseStaticCandidate(serializedCandidate) {
  if (typeof serializedCandidate !== "string") {
    return { ok: false, reason: "serialized_candidate_not_string" };
  }
  if (
    serializedCandidate.length === 0 ||
    serializedCandidate.length >
      requiredCheckReadbackCandidatePolicy.serialized_input.max_characters
  ) {
    return { ok: false, reason: "serialized_candidate_length_invalid" };
  }
  try {
    return {
      ok: true,
      value: JSON.parse(serializedCandidate),
    };
  } catch {
    return {
      ok: false,
      reason: "serialized_candidate_invalid_json",
    };
  }
}

function matchesReadbackShape(shape) {
  try {
    if (
      !hasExactOwnDataKeys(shape, [
        "schema_version",
        "required_reader_capability",
        "mode",
        "raw_api_response_allowed",
        "mutation_methods_allowed",
        "protocol",
        "identity_binding_fields",
        "terminal_check_result",
        "pagination",
        "rulesets",
      ]) ||
      shape.schema_version !==
        requiredCheckReadbackCandidatePolicy.readback_shape.schema_version ||
      shape.required_reader_capability !==
        requiredCheckReadbackCandidatePolicy.readback_shape.required_reader_capability ||
      shape.mode !== requiredCheckReadbackCandidatePolicy.readback_shape.mode ||
      shape.raw_api_response_allowed !== false ||
      shape.mutation_methods_allowed !== false ||
      !sameExactStringArray(
        shape.protocol,
        requiredCheckReadbackCandidatePolicy.readback_shape.protocol,
      ) ||
      !sameExactStringArray(
        shape.identity_binding_fields,
        requiredCheckReadbackCandidatePolicy.readback_shape.identity_binding_fields,
      ) ||
      shape.terminal_check_result !==
        requiredCheckReadbackCandidatePolicy.readback_shape.terminal_check_result ||
      shape.pagination !==
        requiredCheckReadbackCandidatePolicy.readback_shape.pagination ||
      shape.rulesets !== requiredCheckReadbackCandidatePolicy.readback_shape.rulesets
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function matchesRollback(rollback) {
  try {
    if (
      !hasExactOwnDataKeys(rollback, [
        "activation_state",
        "on_readback_drift",
        "one_step",
        "external_state_mutated",
        "preserve_current_ready_main_full_ci",
        "preserve_current_required_check",
        "preserve_current_branch_protection",
        "ci_deduplication_authorized",
      ]) ||
      rollback.activation_state !==
        requiredCheckReadbackCandidatePolicy.rollback.activation_state ||
      rollback.on_readback_drift !==
        requiredCheckReadbackCandidatePolicy.rollback.on_readback_drift ||
      rollback.one_step !== true ||
      rollback.external_state_mutated !== false ||
      rollback.preserve_current_ready_main_full_ci !== true ||
      rollback.preserve_current_required_check !== true ||
      rollback.preserve_current_branch_protection !== true ||
      rollback.ci_deduplication_authorized !== false
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function matchesAuthority(authority) {
  try {
    const expected = requiredCheckReadbackCandidatePolicy.authority;
    return (
      hasExactOwnDataKeys(authority, Object.keys(expected)) &&
      Object.entries(expected).every(([key, value]) => authority[key] === value)
    );
  } catch {
    return false;
  }
}

function requiredProofBinding() {
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

function readbackRequirement() {
  return {
    required_reader_capability:
      requiredCheckReadbackCandidatePolicy.readback_shape.required_reader_capability,
    mode: requiredCheckReadbackCandidatePolicy.readback_shape.mode,
    raw_api_response_allowed: false,
    mutation_methods_allowed: false,
    identity_binding_fields: [
      ...requiredCheckReadbackCandidatePolicy.readback_shape.identity_binding_fields,
    ],
    terminal_check_result:
      requiredCheckReadbackCandidatePolicy.readback_shape.terminal_check_result,
    pagination: requiredCheckReadbackCandidatePolicy.readback_shape.pagination,
    rulesets: requiredCheckReadbackCandidatePolicy.readback_shape.rulesets,
  };
}

function rollbackRequirement() {
  return {
    activation_state: requiredCheckReadbackCandidatePolicy.rollback.activation_state,
    on_readback_drift:
      requiredCheckReadbackCandidatePolicy.rollback.on_readback_drift,
    one_step: true,
    external_state_mutated: false,
    preserve_current_ready_main_full_ci: true,
    preserve_current_required_check: true,
    preserve_current_branch_protection: true,
    ci_deduplication_authorized: false,
  };
}

function broadContainment(reason) {
  return deepFreeze({
    contract_version: requiredCheckReadbackCandidatePolicy.contract_version,
    outcome: "broad_containment_required",
    reason,
    proof_binding: null,
    readback_requirement: null,
    rollback_requirement: null,
    candidate_status: "unactivated_not_connected",
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
    workflow_change: false,
    required_check_change: false,
    branch_protection_change: false,
    ci_deduplication_authorized: false,
    runtime_or_deployment_authority: false,
    reader_invocation: false,
    rollback_executed: false,
  });
}

function matchesCandidateProposal(value) {
  try {
    const proof = buildRequiredCheckProtectionProof(value.proof_contract);
    return (
      value.contract_version ===
        requiredCheckReadbackCandidatePolicy.contract_version &&
      value.source_only === true &&
      value.external_readback_performed === false &&
      proof.outcome === "contract_only_fresh_readback_required" &&
      proof.external_state_verified === false &&
      proof.activation_eligible === false &&
      matchesReadbackShape(value.readback_shape) &&
      matchesRollback(value.rollback) &&
      matchesAuthority(value.authority)
    );
  } catch {
    return false;
  }
}

/**
 * Validates only inert serialized JSON for a static candidate shape for a
 * future, separately authorized fresh readback. It performs no readback and
 * cannot change a workflow, selector, required check, branch-protection
 * setting or runtime state.
 */
export function buildRequiredCheckReadbackCandidateReceipt(serializedCandidate) {
  const parsed = parseStaticCandidate(serializedCandidate);
  if (!parsed.ok) {
    return broadContainment(parsed.reason);
  }

  const captured = readCandidateProposal(parsed.value);
  if (!captured.ok) {
    return broadContainment(captured.reason);
  }

  if (!matchesCandidateProposal(captured.value)) {
    return broadContainment("readback_candidate_drift_or_invalid_shape");
  }

  return deepFreeze({
    contract_version: requiredCheckReadbackCandidatePolicy.contract_version,
    outcome: "shadow_readback_shape_valid",
    reason: null,
    proof_binding: requiredProofBinding(),
    readback_requirement: readbackRequirement(),
    rollback_requirement: rollbackRequirement(),
    candidate_status: "unactivated_not_connected",
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
    workflow_change: false,
    required_check_change: false,
    branch_protection_change: false,
    ci_deduplication_authorized: false,
    runtime_or_deployment_authority: false,
    reader_invocation: false,
    rollback_executed: false,
  });
}
