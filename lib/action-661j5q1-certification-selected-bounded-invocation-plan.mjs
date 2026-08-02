import { createHash } from "node:crypto";
import {
  CERTIFIED_RUNTIME_PROFILE_DIGEST_V1,
  RUNTIME_SELECTION_VERSION_V1,
  requestCertificationGatedRuntimeSelectionV1,
  verifyCertificationGatedRuntimeSelectionV1,
} from "./action-661j5p1-certification-gated-runtime-selection.mjs";

export const BOUNDED_INVOCATION_PLAN_VERSION_V1 =
  "action_661j5q1_certification_selected_bounded_invocation_plan_v1";

export const BOUNDED_INVOCATION_PLAN_POLICY_V1 = deepFreeze({
  canonical_request_encoding: "utf8_primitive_v1",
  default_planning: "off",
  max_request_bytes: 512,
  max_request_identity_bytes: 128,
  max_ttl_ms: 300000,
  min_ttl_ms: 1000,
  plan_kind: "bounded_invocation_decision",
  planning_version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
  privileged_capabilities: [],
  required_runtime_profile_digest: CERTIFIED_RUNTIME_PROFILE_DIGEST_V1,
  required_selection_identity:
    "754a7e781f14ae5731ddbac2444b8c7c3182e95c10913ea640e49855610c54ea",
  required_selection_version: RUNTIME_SELECTION_VERSION_V1,
  runtime_authority: false,
  runtime_execution_allowed: false,
  trust_model: "module_private_provenance",
});

export const BOUNDED_INVOCATION_PLAN_POLICY_DIGEST_V1 =
  "0510aaa58f31e6522c878fa9d32f798f8ad9bc6bc0cb615e379ceba621cf15ce";

const trustedPlans = new WeakMap();
const plansByRequestIdentity = new Map();

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

function digestBytes(value, state, kind) {
  if (kind === "request") state.request_digests_computed += 1;
  else state.plan_digests_computed += 1;
  return createHash("sha256").update(value).digest("hex");
}

function digestJson(value, state, kind) {
  return digestBytes(canonicalJson(value), state, kind);
}

function emptyCounts() {
  return {
    plan_digests_computed: 0,
    plan_issuances: 0,
    request_digests_computed: 0,
    selection_requests: 0,
    selection_verifications: 0,
  };
}

const OFF_RESULT = deepFreeze({
  counts: emptyCounts(),
  failure_identity_digest: null,
  plan: null,
  plan_identity_digest: null,
  planning_version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
  reason: "bounded_invocation_planning_disabled",
  status: "not_planned",
});

function valueType(value) {
  if (value === null) return "null";
  return typeof value;
}

function sanitizedSelectionFailure(selectionResult) {
  if (!isPlainObject(selectionResult)) {
    return {
      failure_identity_digest: null,
      reason: "selection_result_unavailable",
      status: "rejected",
    };
  }
  return {
    failure_identity_digest:
      typeof selectionResult.failure_identity_digest === "string" &&
      /^[0-9a-f]{64}$/.test(selectionResult.failure_identity_digest)
        ? selectionResult.failure_identity_digest
        : null,
    reason:
      typeof selectionResult.reason === "string" &&
      /^[a-z0-9_]{1,96}$/.test(selectionResult.reason)
        ? selectionResult.reason
        : "selection_reason_unavailable",
    status:
      typeof selectionResult.status === "string" &&
      /^(?:not_selected|rejected)$/.test(selectionResult.status)
        ? selectionResult.status
        : "rejected",
  };
}

function rejection(
  state,
  reason,
  stage,
  observation = null,
  selectionVerification = null,
  selectionResult = null,
) {
  const projection = {
    observation,
    planning_policy_digest: BOUNDED_INVOCATION_PLAN_POLICY_DIGEST_V1,
    planning_version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
    reason,
    selection_failure: sanitizedSelectionFailure(selectionResult),
    selection_verification_reason:
      typeof selectionVerification?.reason === "string"
        ? selectionVerification.reason
        : null,
    stage,
  };
  return deepFreeze({
    counts: { ...state },
    failure_identity_digest: digestJson(projection, state, "plan"),
    plan: null,
    plan_identity_digest: null,
    planning_version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
    reason,
    status: "rejected",
  });
}

function validatePrimitiveRequest(
  repositoryRoot,
  requestIdentity,
  requestValue,
  createdAtEpochMs,
  expiresAtEpochMs,
  evaluatedAtEpochMs,
) {
  if (typeof repositoryRoot !== "string") {
    return {
      error: "planning_repository_root_invalid",
      observation: { repository_root_type: valueType(repositoryRoot) },
    };
  }
  if (typeof requestIdentity !== "string") {
    return {
      error: "invocation_request_identity_type_invalid",
      observation: { request_identity_type: valueType(requestIdentity) },
    };
  }
  const requestIdentityBytes = Buffer.byteLength(requestIdentity, "utf8");
  if (
    requestIdentityBytes === 0 ||
    requestIdentityBytes >
      BOUNDED_INVOCATION_PLAN_POLICY_V1.max_request_identity_bytes ||
    !/^[a-z0-9][a-z0-9._:-]*$/.test(requestIdentity)
  ) {
    return {
      error: "invocation_request_identity_invalid",
      observation: { request_identity_byte_length: requestIdentityBytes },
    };
  }
  if (typeof requestValue !== "string") {
    return {
      error: "invocation_request_type_invalid",
      observation: { request_type: valueType(requestValue) },
    };
  }
  const requestBytes = Buffer.byteLength(requestValue, "utf8");
  if (
    requestBytes === 0 ||
    requestBytes > BOUNDED_INVOCATION_PLAN_POLICY_V1.max_request_bytes
  ) {
    return {
      error: "invocation_request_byte_budget_exceeded",
      observation: { request_byte_length: requestBytes },
    };
  }
  if (
    requestValue !== requestValue.normalize("NFC") ||
    /[\u0000-\u001f\u007f]/.test(requestValue) ||
    /[\ud800-\udfff]/.test(requestValue)
  ) {
    return {
      error: "invocation_request_not_canonical",
      observation: { request_byte_length: requestBytes },
    };
  }
  const timeValues = [createdAtEpochMs, expiresAtEpochMs, evaluatedAtEpochMs];
  if (!timeValues.every((value) => Number.isSafeInteger(value) && value >= 0)) {
    return {
      error: "invocation_time_boundary_invalid",
      observation: {
        created_at_type: valueType(createdAtEpochMs),
        evaluated_at_type: valueType(evaluatedAtEpochMs),
        expires_at_type: valueType(expiresAtEpochMs),
      },
    };
  }
  const ttlMs = expiresAtEpochMs - createdAtEpochMs;
  if (
    ttlMs < BOUNDED_INVOCATION_PLAN_POLICY_V1.min_ttl_ms ||
    ttlMs > BOUNDED_INVOCATION_PLAN_POLICY_V1.max_ttl_ms
  ) {
    return {
      error: "invocation_ttl_boundary_invalid",
      observation: { ttl_ms: ttlMs },
    };
  }
  if (evaluatedAtEpochMs < createdAtEpochMs) {
    return {
      error: "invocation_request_not_yet_valid",
      observation: {
        created_at_epoch_ms: createdAtEpochMs,
        evaluated_at_epoch_ms: evaluatedAtEpochMs,
      },
    };
  }
  if (evaluatedAtEpochMs >= expiresAtEpochMs) {
    return {
      error: "invocation_request_expired",
      observation: {
        evaluated_at_epoch_ms: evaluatedAtEpochMs,
        expires_at_epoch_ms: expiresAtEpochMs,
      },
    };
  }
  return {
    captured: {
      created_at_epoch_ms: createdAtEpochMs,
      evaluated_at_epoch_ms: evaluatedAtEpochMs,
      expires_at_epoch_ms: expiresAtEpochMs,
      request_byte_length: requestBytes,
      request_identity: requestIdentity,
      request_value: requestValue,
      ttl_ms: ttlMs,
    },
  };
}

function bindVerifiedSelection(receipt) {
  if (
    !isPlainObject(receipt) ||
    !isPlainObject(receipt.binding) ||
    !isPlainObject(receipt.binding.admission) ||
    !isPlainObject(receipt.binding.certification) ||
    !isPlainObject(receipt.binding.inventory) ||
    !isPlainObject(receipt.binding.runtime_profile) ||
    !isPlainObject(receipt.binding.selection_policy)
  ) return { error: "verified_selection_shape_invalid" };

  if (
    receipt.status !== "selected" ||
    receipt.selection_version !==
      BOUNDED_INVOCATION_PLAN_POLICY_V1.required_selection_version ||
    receipt.selection_identity_digest !==
      BOUNDED_INVOCATION_PLAN_POLICY_V1.required_selection_identity ||
    receipt.runtime_authority !== false ||
    receipt.runtime_execution_allowed !== false
  ) return { error: "verified_selection_identity_mismatch" };

  const profile = receipt.binding.runtime_profile;
  if (
    profile.profile_id !==
      "action_661j5p1_certified_rebuild_v1_runtime_profile" ||
    profile.family_version !==
      "action_661j5r2_runtime_certification_rebuild_v1" ||
    profile.runner_identity_digest !==
      "76e4804def6411adaba50f4588248e8beaac88c63e1d6029850410b6c84bd2f7" ||
    profile.runner_version !== "action_661j5r2_runtime_runner_rebuild_v1" ||
    profile.runtime_execution_allowed !== false
  ) return { error: "verified_runtime_profile_mismatch" };

  return {
    binding: {
      admission: receipt.binding.admission,
      certification: receipt.binding.certification,
      inventory: receipt.binding.inventory,
      runtime_profile: {
        aggregate_digest: profile.aggregate_digest,
        family_version: profile.family_version,
        policy_version: profile.policy_version,
        profile_digest: CERTIFIED_RUNTIME_PROFILE_DIGEST_V1,
        profile_id: profile.profile_id,
        protocol_version: profile.protocol_version,
        runner_identity_digest: profile.runner_identity_digest,
        runner_version: profile.runner_version,
        snapshot_contract: profile.snapshot_contract,
      },
      selection: {
        selection_identity_digest: receipt.selection_identity_digest,
        selection_policy_digest: receipt.binding.selection_policy.policy_digest,
        selection_policy_version: receipt.binding.selection_policy.policy_version,
        selection_version: receipt.selection_version,
      },
    },
  };
}

function issuePlan(selectionBinding, captured, state) {
  const requestIdentityDigest = digestJson(
    {
      request_identity: captured.request_identity,
      version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
    },
    state,
    "request",
  );
  const canonicalRequestDigest = digestJson(
    {
      encoding: BOUNDED_INVOCATION_PLAN_POLICY_V1.canonical_request_encoding,
      value: captured.request_value,
    },
    state,
    "request",
  );
  const binding = deepFreeze({
    ...selectionBinding,
    invocation_request: {
      canonical_request_digest: canonicalRequestDigest,
      created_at_epoch_ms: captured.created_at_epoch_ms,
      encoding: BOUNDED_INVOCATION_PLAN_POLICY_V1.canonical_request_encoding,
      evaluated_at_epoch_ms: captured.evaluated_at_epoch_ms,
      expires_at_epoch_ms: captured.expires_at_epoch_ms,
      request_byte_length: captured.request_byte_length,
      request_identity_digest: requestIdentityDigest,
      ttl_ms: captured.ttl_ms,
    },
    planning_policy: {
      policy_digest: BOUNDED_INVOCATION_PLAN_POLICY_DIGEST_V1,
      policy_version: "action_661j5q1_bounded_invocation_plan_policy_v1",
    },
  });
  const identityProjection = {
    binding,
    plan_kind: BOUNDED_INVOCATION_PLAN_POLICY_V1.plan_kind,
    planning_version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
    status: "planned",
  };
  const canonicalIdentity = canonicalJson(identityProjection);
  const planIdentityDigest = digestBytes(canonicalIdentity, state, "plan");
  const existing = plansByRequestIdentity.get(requestIdentityDigest);
  if (existing) {
    if (existing.canonical_identity !== canonicalIdentity) {
      return rejection(
        state,
        "invocation_identity_conflict",
        "private_issuance",
        { request_identity_digest: requestIdentityDigest },
      );
    }
    return existing.result;
  }

  state.plan_issuances += 1;
  const plan = deepFreeze({
    binding,
    plan_identity_digest: planIdentityDigest,
    plan_kind: BOUNDED_INVOCATION_PLAN_POLICY_V1.plan_kind,
    privileged_capabilities: [],
    runtime_authority: false,
    runtime_execution_allowed: false,
    status: "planned",
    planning_version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
  });
  const result = deepFreeze({
    counts: { ...state },
    failure_identity_digest: null,
    plan,
    plan_identity_digest: planIdentityDigest,
    planning_version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
    reason: "certification_selected_invocation_plan_created",
    status: "planned",
  });
  const verification = deepFreeze({
    plan_identity_digest: planIdentityDigest,
    planning_version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
    reason: "private_planning_provenance_verified",
    runtime_authority: false,
    runtime_execution_allowed: false,
    status: "planned",
  });
  trustedPlans.set(plan, verification);
  plansByRequestIdentity.set(requestIdentityDigest, {
    canonical_identity: canonicalIdentity,
    result,
  });
  return result;
}

export function requestCertificationSelectedBoundedInvocationPlanV1(
  enabled = false,
  repositoryRoot,
  requestIdentity,
  requestValue,
  createdAtEpochMs,
  expiresAtEpochMs,
  evaluatedAtEpochMs,
) {
  if (enabled !== true) return OFF_RESULT;
  const state = emptyCounts();
  if (arguments.length !== 7) {
    return rejection(state, "planning_request_shape_invalid", "request_validation", {
      argument_count: arguments.length,
    });
  }

  const validation = validatePrimitiveRequest(
    repositoryRoot,
    requestIdentity,
    requestValue,
    createdAtEpochMs,
    expiresAtEpochMs,
    evaluatedAtEpochMs,
  );
  if (validation.error) {
    return rejection(
      state,
      validation.error,
      "request_validation",
      validation.observation,
    );
  }

  let selectionResult;
  let selectionVerification;
  try {
    state.selection_requests += 1;
    selectionResult = requestCertificationGatedRuntimeSelectionV1(
      true,
      repositoryRoot,
    );
    state.selection_verifications += 1;
    selectionVerification = verifyCertificationGatedRuntimeSelectionV1(
      selectionResult.receipt,
    );
  } catch {
    return rejection(
      state,
      "runtime_selection_internal_error",
      "selection_verification",
    );
  }

  if (selectionVerification.status !== "selected") {
    return rejection(
      state,
      "runtime_selection_rejected",
      "selection_verification",
      null,
      selectionVerification,
      selectionResult,
    );
  }
  const outcome = bindVerifiedSelection(selectionResult.receipt);
  if (outcome.error) {
    return rejection(
      state,
      outcome.error,
      "selection_binding",
      null,
      selectionVerification,
    );
  }
  return issuePlan(outcome.binding, validation.captured, state);
}

export function verifyCertificationSelectedBoundedInvocationPlanV1(candidate) {
  const verification = trustedPlans.get(candidate);
  if (verification) return verification;
  return deepFreeze({
    plan_identity_digest: null,
    planning_version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
    reason: "private_planning_provenance_missing",
    runtime_authority: false,
    runtime_execution_allowed: false,
    status: "rejected",
  });
}
