import { createHash } from "node:crypto";
import {
  RUNTIME_ADMISSION_VERSION_V1,
  requestCertificationBackedRuntimeAdmissionV1,
  verifyCertificationBackedRuntimeAdmissionV1,
} from "./action-661j5o1-certification-runtime-admission-authority.mjs";

export const RUNTIME_SELECTION_VERSION_V1 =
  "action_661j5p1_certification_gated_runtime_selection_v1";

export const CERTIFIED_RUNTIME_PROFILE_V1 = deepFreeze({
  aggregate_digest:
    "98064a290926d7b2ade45965eec3a21b41819763cb667a3a0c54f618600fe99d",
  family_version: "action_661j5r2_runtime_certification_rebuild_v1",
  policy_version: "action_661j5r2_atomic_policy_registry_rebuild_v1",
  profile_id: "action_661j5p1_certified_rebuild_v1_runtime_profile",
  protocol_version: "action_661j5r2_runtime_result_protocol_rebuild_v1",
  runner_identity_digest:
    "76e4804def6411adaba50f4588248e8beaac88c63e1d6029850410b6c84bd2f7",
  runner_version: "action_661j5r2_runtime_runner_rebuild_v1",
  runtime_execution_allowed: false,
  selection_capabilities: [],
  snapshot_contract: "action_661j5r2_metadata_first_snapshot_rebuild_v1",
});

export const CERTIFIED_RUNTIME_PROFILE_DIGEST_V1 =
  "c030f07347b1890184ee7ce4080c26b609fb1fcd13820bbdde5d8b476e60c95a";

export const RUNTIME_SELECTION_POLICY_V1 = deepFreeze({
  admission_authority_version: RUNTIME_ADMISSION_VERSION_V1,
  default_selection: "off",
  policy_version: "action_661j5p1_runtime_selection_policy_v1",
  privileged_capabilities: [],
  required_admission_identity:
    "b24080e9d746c3fdaf467a622f18db3b8b4b5d0881c3686cdd3df7d78aea1e15",
  required_admission_status: "admitted",
  selected_profile_id: CERTIFIED_RUNTIME_PROFILE_V1.profile_id,
  selection_kind: "decision_only",
  selection_version: RUNTIME_SELECTION_VERSION_V1,
  trust_model: "module_private_provenance",
});

export const RUNTIME_SELECTION_POLICY_DIGEST_V1 =
  "8ad66894e28abe42b4001f2d04f347b0bfdbff316e7be25071092da7bbab8212";

const trustedSelections = new WeakMap();
const selectionsByIdentity = new Map();

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function canonicalJson(value) {
  const active = new Set();
  function project(current) {
    if (
      current === undefined ||
      typeof current === "bigint" ||
      typeof current === "function" ||
      typeof current === "symbol" ||
      (typeof current === "number" && !Number.isFinite(current))
    ) throw new TypeError("unsupported_canonical_value");
    if (current === null || typeof current !== "object") {
      return JSON.stringify(current);
    }
    if (active.has(current)) throw new TypeError("canonical_cycle");
    if (!Array.isArray(current) && !isPlainObject(current)) {
      throw new TypeError("unsupported_non_plain_object");
    }
    active.add(current);
    const result = Array.isArray(current)
      ? `[${current.map(project).join(",")}]`
      : `{${Object.keys(current)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${project(current[key])}`)
        .join(",")}}`;
    active.delete(current);
    return result;
  }
  return project(value);
}

function digestBytes(value, state) {
  state.selection_digests_computed += 1;
  return createHash("sha256").update(value).digest("hex");
}

function digestJson(value, state) {
  return digestBytes(canonicalJson(value), state);
}

function emptyCounts() {
  return {
    admission_requests: 0,
    admission_verifications: 0,
    selection_digests_computed: 0,
    selection_issuances: 0,
  };
}

const OFF_RESULT = deepFreeze({
  counts: emptyCounts(),
  failure_identity_digest: null,
  reason: "runtime_selection_disabled",
  receipt: null,
  selection_identity_digest: null,
  selection_version: RUNTIME_SELECTION_VERSION_V1,
  status: "not_selected",
});

function sanitizedAdmissionFailure(admissionResult) {
  if (!isPlainObject(admissionResult)) {
    return {
      failure_identity_digest: null,
      reason: "admission_result_unavailable",
      status: "rejected",
    };
  }
  return {
    failure_identity_digest:
      typeof admissionResult.failure_identity_digest === "string" &&
      /^[0-9a-f]{64}$/.test(admissionResult.failure_identity_digest)
        ? admissionResult.failure_identity_digest
        : null,
    reason:
      typeof admissionResult.reason === "string" &&
      /^[a-z0-9_]{1,96}$/.test(admissionResult.reason)
        ? admissionResult.reason
        : "admission_reason_unavailable",
    status:
      typeof admissionResult.status === "string" &&
      /^(?:not_admitted|rejected)$/.test(admissionResult.status)
        ? admissionResult.status
        : "rejected",
  };
}

function rejection(
  state,
  reason,
  stage,
  admissionVerification = null,
  admissionResult = null,
  repositoryRootDigest = null,
) {
  const projection = {
    admission_failure: sanitizedAdmissionFailure(admissionResult),
    admission_verification_reason:
      typeof admissionVerification?.reason === "string"
        ? admissionVerification.reason
        : null,
    policy_digest: RUNTIME_SELECTION_POLICY_DIGEST_V1,
    reason,
    repository_root_digest: repositoryRootDigest,
    runtime_profile_digest: CERTIFIED_RUNTIME_PROFILE_DIGEST_V1,
    selection_version: RUNTIME_SELECTION_VERSION_V1,
    stage,
  };
  return deepFreeze({
    counts: { ...state },
    failure_identity_digest: digestJson(projection, state),
    reason,
    receipt: null,
    selection_identity_digest: null,
    selection_version: RUNTIME_SELECTION_VERSION_V1,
    status: "rejected",
  });
}

function bindVerifiedAdmission(admission) {
  if (
    !isPlainObject(admission) ||
    !isPlainObject(admission.binding) ||
    !isPlainObject(admission.binding.admission_policy) ||
    !isPlainObject(admission.binding.certification_manifest) ||
    !isPlainObject(admission.binding.freeze_manifest) ||
    !isPlainObject(admission.binding.full_chain) ||
    !isPlainObject(admission.binding.inventory) ||
    !isPlainObject(admission.binding.recovery_disclosure)
  ) return { error: "verified_admission_shape_invalid" };
  if (
    admission.status !== RUNTIME_SELECTION_POLICY_V1.required_admission_status ||
    admission.admission_version !== RUNTIME_ADMISSION_VERSION_V1 ||
    admission.admission_identity_digest !==
      RUNTIME_SELECTION_POLICY_V1.required_admission_identity
  ) return { error: "verified_admission_identity_mismatch" };

  const binding = admission.binding;
  if (
    binding.inventory.fixture_count !== 28 ||
    binding.inventory.scenario_count !== 14 ||
    binding.inventory.shard_count !== 28 ||
    binding.full_chain.status !== "certified" ||
    binding.recovery_disclosure.partial_recovery_promoted !== false
  ) return { error: "verified_admission_certification_mismatch" };

  return {
    binding: {
      admission: {
        admission_identity_digest: admission.admission_identity_digest,
        admission_policy_digest: binding.admission_policy.policy_digest,
        admission_policy_version: binding.admission_policy.policy_version,
        admission_version: admission.admission_version,
      },
      certification: {
        aggregate_digest:
          binding.certification_manifest.final_aggregate_digest,
        delivery_digest: binding.certification_manifest.delivery_digest,
        freeze_file_digest: binding.freeze_manifest.file_digest,
        freeze_manifest_digest: binding.freeze_manifest.manifest_digest,
        full_chain_result_digest: binding.full_chain.consumer_result_digest,
        recovery_disclosure_file_digest:
          binding.recovery_disclosure.file_digest,
      },
      inventory: {
        fixture_count: binding.inventory.fixture_count,
        scenario_count: binding.inventory.scenario_count,
        shard_count: binding.inventory.shard_count,
      },
      runtime_profile: CERTIFIED_RUNTIME_PROFILE_V1,
      selection_policy: {
        policy_digest: RUNTIME_SELECTION_POLICY_DIGEST_V1,
        policy_version: RUNTIME_SELECTION_POLICY_V1.policy_version,
      },
    },
  };
}

function issueSelection(binding, state) {
  const identityProjection = {
    binding,
    receipt_kind: "runtime_profile_selection_decision",
    selection_version: RUNTIME_SELECTION_VERSION_V1,
    status: "selected",
  };
  const canonicalIdentity = canonicalJson(identityProjection);
  const selectionIdentityDigest = digestBytes(canonicalIdentity, state);
  const existing = selectionsByIdentity.get(selectionIdentityDigest);
  if (existing) {
    if (existing.canonical_identity !== canonicalIdentity) {
      return rejection(state, "selection_identity_conflict", "private_issuance");
    }
    return existing.result;
  }

  state.selection_issuances += 1;
  const receipt = deepFreeze({
    binding,
    receipt_kind: "runtime_profile_selection_decision",
    runtime_authority: false,
    runtime_execution_allowed: false,
    selection_identity_digest: selectionIdentityDigest,
    selection_version: RUNTIME_SELECTION_VERSION_V1,
    status: "selected",
  });
  const result = deepFreeze({
    counts: { ...state },
    failure_identity_digest: null,
    reason: "certified_runtime_profile_selected",
    receipt,
    selection_identity_digest: selectionIdentityDigest,
    selection_version: RUNTIME_SELECTION_VERSION_V1,
    status: "selected",
  });
  const verification = deepFreeze({
    reason: "private_selection_provenance_verified",
    selection_identity_digest: selectionIdentityDigest,
    selection_version: RUNTIME_SELECTION_VERSION_V1,
    status: "selected",
  });
  trustedSelections.set(receipt, verification);
  selectionsByIdentity.set(selectionIdentityDigest, {
    canonical_identity: canonicalIdentity,
    result,
  });
  return result;
}

export function requestCertificationGatedRuntimeSelectionV1(
  enabled = false,
  repositoryRoot,
) {
  if (enabled !== true) return OFF_RESULT;
  const state = emptyCounts();
  if (arguments.length !== 2) {
    return rejection(state, "selection_request_shape_invalid", "request_validation");
  }
  if (typeof repositoryRoot !== "string") {
    return rejection(state, "selection_repository_root_invalid", "request_validation");
  }

  state.admission_requests += 1;
  const admission = requestCertificationBackedRuntimeAdmissionV1(
    true,
    repositoryRoot,
  );
  state.admission_verifications += 1;
  const admissionVerification =
    verifyCertificationBackedRuntimeAdmissionV1(admission);
  if (admissionVerification.status !== "admitted") {
    const repositoryRootDigest = digestBytes(repositoryRoot, state);
    return rejection(
      state,
      "certification_admission_rejected",
      "admission_verification",
      admissionVerification,
      admission,
      repositoryRootDigest,
    );
  }

  const outcome = bindVerifiedAdmission(admission);
  if (outcome.error) {
    return rejection(
      state,
      outcome.error,
      "selection_binding",
      admissionVerification,
    );
  }
  return issueSelection(deepFreeze(outcome.binding), state);
}

export function verifyCertificationGatedRuntimeSelectionV1(candidate) {
  const verification = trustedSelections.get(candidate);
  if (verification) return verification;
  return deepFreeze({
    reason: "private_selection_provenance_missing",
    selection_identity_digest: null,
    selection_version: RUNTIME_SELECTION_VERSION_V1,
    status: "rejected",
  });
}
