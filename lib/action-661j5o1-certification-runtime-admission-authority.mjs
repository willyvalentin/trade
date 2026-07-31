import { createHash } from "node:crypto";
import {
  CERTIFICATION_AUTHORITIES,
  CERTIFICATION_PATHS,
} from "./action-661j5n1-runtime-certification-consumer.mjs";
import {
  CONSUMER_V2_VERSION,
  consumeRuntimeCertificationV2,
} from "./action-661j5n2a-runtime-certification-consumer-v2.mjs";

export const RUNTIME_ADMISSION_VERSION_V1 =
  "action_661j5o1_certification_backed_runtime_admission_v1";

export const RUNTIME_ADMISSION_POLICY_V1 = deepFreeze({
  admission_default: "off",
  admission_version: RUNTIME_ADMISSION_VERSION_V1,
  approved_consumer: CONSUMER_V2_VERSION,
  expected_fixture_count: 28,
  expected_scenario_count: 14,
  expected_shard_count: 28,
  privileged_capabilities: [],
  policy_version: "action_661j5o1_runtime_admission_policy_v1",
  required_consumer_status: "certified",
  required_reason: "certification_chain_verified",
  trust_model: "module_private_provenance",
});

export const RUNTIME_ADMISSION_POLICY_DIGEST_V1 =
  "5adbd3b5e223ceec6acd83831650f9cd93ca64fd878375901e0c29ac70881b21";

const FINAL_FREEZE_MANIFEST_FILE_SHA256 =
  "2fde89c7906057516d820707c726b7f93005e491c56d80799a2568805d1ce5ce";

export const N2A_CONSUMER_AUTHORITY_V1 = deepFreeze({
  consumer_module_path:
    "lib/action-661j5n2a-runtime-certification-consumer-v2.mjs",
  consumer_module_sha256:
    "110a919401aee396508ba6d393132ed41e400343ea209559cdc1003eba4f69c5",
  consumer_version: CONSUMER_V2_VERSION,
  normative_digest:
    "2793ec54bfdbc15eae21dc587c970e23ac1b5f7f1439a7efed6e6b32055c1636",
  preservation_commit: "ff1fa24abd69efaa754d3f396cdce798962c3044",
  preservation_ref:
    "refs/preservation/action-661j5n2a-descriptor-bound-certification-consumer",
});

const trustedAdmissions = new WeakMap();
const admissionsByIdentity = new Map();

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
  state.admission_digests_computed += 1;
  return createHash("sha256").update(value).digest("hex");
}

function digestJson(value, state) {
  return digestBytes(canonicalJson(value), state);
}

function emptyCounts() {
  return {
    admission_digests_computed: 0,
    admission_issuances: 0,
    consumer_invocations: 0,
  };
}

const OFF_RESULT = deepFreeze({
  admission_identity_digest: null,
  admission_version: RUNTIME_ADMISSION_VERSION_V1,
  binding: null,
  counts: emptyCounts(),
  failure_identity_digest: null,
  reason: "runtime_admission_disabled",
  status: "not_admitted",
});

function sanitizeToken(value, fallback) {
  return typeof value === "string" && /^[A-Za-z0-9_]{1,96}$/.test(value)
    ? value
    : fallback;
}

function rejection(state, reason, stage, consumerResult = null) {
  const provenance = consumerResult?.failure_provenance;
  const projection = {
    admission_version: RUNTIME_ADMISSION_VERSION_V1,
    consumer_failure_identity_digest:
      typeof provenance?.failure_identity_digest === "string"
        ? provenance.failure_identity_digest
        : null,
    consumer_reason: sanitizeToken(
      consumerResult?.reason,
      "consumer_result_unavailable",
    ),
    consumer_status: sanitizeToken(
      consumerResult?.status,
      "incomplete",
    ),
    policy_digest: RUNTIME_ADMISSION_POLICY_DIGEST_V1,
    reason,
    stage,
  };
  const failureIdentityDigest = digestJson(projection, state);
  return deepFreeze({
    admission_identity_digest: null,
    admission_version: RUNTIME_ADMISSION_VERSION_V1,
    binding: null,
    counts: { ...state },
    failure_identity_digest: failureIdentityDigest,
    reason,
    status: "rejected",
  });
}

function verifiedBinding(consumerResult, state) {
  const semantic = consumerResult.semantic_result;
  if (!isPlainObject(semantic) || !isPlainObject(semantic.counts)) {
    return { error: "consumer_semantic_result_invalid" };
  }
  if (
    consumerResult.status !== RUNTIME_ADMISSION_POLICY_V1.required_consumer_status ||
    consumerResult.reason !== RUNTIME_ADMISSION_POLICY_V1.required_reason ||
    semantic.status !== "certified" ||
    semantic.reason !== "certification_chain_verified"
  ) return { error: "consumer_certification_rejected" };
  if (
    semantic.counts.fixtures_verified !== 28 ||
    semantic.counts.shards_verified !== 28 ||
    semantic.counts.scenarios_verified !== 14
  ) return { error: "certification_inventory_mismatch" };

  const observed = semantic.observed;
  if (!isPlainObject(observed) || !isPlainObject(observed.file_digests)) {
    return { error: "consumer_observation_invalid" };
  }
  if (
    observed.aggregate_digest !== CERTIFICATION_AUTHORITIES.final_aggregate_digest ||
    observed.delivery_digest !== CERTIFICATION_AUTHORITIES.delivery_digest ||
    observed.freeze_manifest_digest !==
      CERTIFICATION_AUTHORITIES.final_freeze_manifest_digest
  ) return { error: "full_chain_authority_mismatch" };
  if (
    observed.file_digests[CERTIFICATION_PATHS.freeze_manifest] !==
      FINAL_FREEZE_MANIFEST_FILE_SHA256 ||
    observed.file_digests[CERTIFICATION_PATHS.recovery_disclosure] !==
      CERTIFICATION_AUTHORITIES.recovery_disclosure_file_sha256 ||
    observed.file_digests[CERTIFICATION_PATHS.aggregate] !==
      CERTIFICATION_AUTHORITIES.final_aggregate_file_sha256
  ) return { error: "certification_file_authority_mismatch" };

  const binding = {
    admission_policy: {
      policy_digest: RUNTIME_ADMISSION_POLICY_DIGEST_V1,
      policy_version: RUNTIME_ADMISSION_POLICY_V1.policy_version,
    },
    certification_manifest: {
      delivery_digest: CERTIFICATION_AUTHORITIES.delivery_digest,
      final_aggregate_digest:
        CERTIFICATION_AUTHORITIES.final_aggregate_digest,
      final_aggregate_file_sha256:
        CERTIFICATION_AUTHORITIES.final_aggregate_file_sha256,
    },
    consumer_authority: { ...N2A_CONSUMER_AUTHORITY_V1 },
    freeze_manifest: {
      file_digest:
        observed.file_digests[CERTIFICATION_PATHS.freeze_manifest],
      manifest_digest: observed.freeze_manifest_digest,
      path: CERTIFICATION_PATHS.freeze_manifest,
    },
    full_chain: {
      consumer_result_digest: digestJson(consumerResult, state),
      descriptor_observation_digest: digestJson(
        consumerResult.observed_file_digests,
        state,
      ),
      semantic_observation_digest: digestJson(observed, state),
      status: semantic.status,
    },
    inventory: {
      fixture_count: semantic.counts.fixtures_verified,
      scenario_count: semantic.counts.scenarios_verified,
      shard_count: semantic.counts.shards_verified,
    },
    recovery_disclosure: {
      file_digest:
        observed.file_digests[CERTIFICATION_PATHS.recovery_disclosure],
      path: CERTIFICATION_PATHS.recovery_disclosure,
      partial_recovery_promoted: false,
    },
  };
  return { binding };
}

function issueAdmission(binding, state) {
  const identityProjection = {
    admission_version: RUNTIME_ADMISSION_VERSION_V1,
    binding,
    status: "admitted",
  };
  const canonicalIdentity = canonicalJson(identityProjection);
  const admissionIdentityDigest = digestBytes(canonicalIdentity, state);
  const existing = admissionsByIdentity.get(admissionIdentityDigest);
  if (existing) {
    if (existing.canonical_identity !== canonicalIdentity) {
      return rejection(
        state,
        "admission_identity_conflict",
        "private_issuance",
      );
    }
    return existing.admission;
  }
  state.admission_issuances += 1;
  const admission = deepFreeze({
    admission_identity_digest: admissionIdentityDigest,
    admission_version: RUNTIME_ADMISSION_VERSION_V1,
    binding,
    counts: { ...state },
    failure_identity_digest: null,
    reason: "runtime_certification_admitted",
    status: "admitted",
  });
  const verification = deepFreeze({
    admission_identity_digest: admissionIdentityDigest,
    admission_version: RUNTIME_ADMISSION_VERSION_V1,
    reason: "private_admission_provenance_verified",
    status: "admitted",
  });
  trustedAdmissions.set(admission, verification);
  admissionsByIdentity.set(admissionIdentityDigest, {
    admission,
    canonical_identity: canonicalIdentity,
  });
  return admission;
}

export function requestCertificationBackedRuntimeAdmissionV1(
  enabled = false,
  repositoryRoot,
) {
  if (enabled !== true) return OFF_RESULT;
  const state = emptyCounts();
  if (arguments.length !== 2) {
    return rejection(state, "admission_request_shape_invalid", "request_validation");
  }
  if (typeof repositoryRoot !== "string") {
    return rejection(state, "admission_repository_root_invalid", "request_validation");
  }
  state.consumer_invocations += 1;
  const consumerResult = consumeRuntimeCertificationV2({
    enabled: true,
    repository_root: repositoryRoot,
  });
  if (consumerResult.status !== "certified") {
    return rejection(
      state,
      "descriptor_certification_consumer_rejected",
      "consumer_verification",
      consumerResult,
    );
  }
  const outcome = verifiedBinding(consumerResult, state);
  if (outcome.error) {
    return rejection(state, outcome.error, "authority_binding", consumerResult);
  }
  return issueAdmission(deepFreeze(outcome.binding), state);
}

export function verifyCertificationBackedRuntimeAdmissionV1(candidate) {
  const verification = trustedAdmissions.get(candidate);
  if (verification) return verification;
  return deepFreeze({
    admission_identity_digest: null,
    admission_version: RUNTIME_ADMISSION_VERSION_V1,
    reason: "private_admission_provenance_missing",
    status: "rejected",
  });
}
