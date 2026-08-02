import { createHash } from "node:crypto";
import {
  BOUNDED_INVOCATION_PLAN_POLICY_DIGEST_V1,
  BOUNDED_INVOCATION_PLAN_VERSION_V1,
  requestCertificationSelectedBoundedInvocationPlanV1,
  verifyCertificationSelectedBoundedInvocationPlanV1,
} from "./action-661j5q1-certification-selected-bounded-invocation-plan.mjs";

export const BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1 =
  "action_661j5r1_transport_inert_bounded_invocation_authorization_v1";

export const BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1 = deepFreeze({
  authorization_kind: "transport_inert_bounded_invocation_decision",
  authorization_version: BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
  default_authorization: "off",
  executable_capabilities: [],
  max_attempt_ordinal: 4,
  max_freshness_ms: 120000,
  max_invocation_budget: 8,
  min_attempt_ordinal: 1,
  min_freshness_ms: 1,
  min_invocation_budget: 1,
  planning_authority_version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
  privileged_capabilities: [],
  receipt_runtime_authority: false,
  required_admission_identity:
    "b24080e9d746c3fdaf467a622f18db3b8b4b5d0881c3686cdd3df7d78aea1e15",
  required_planning_policy_digest:
    BOUNDED_INVOCATION_PLAN_POLICY_DIGEST_V1,
  required_runtime_family:
    "action_661j5r2_runtime_certification_rebuild_v1",
  required_runner_identity:
    "76e4804def6411adaba50f4588248e8beaac88c63e1d6029850410b6c84bd2f7",
  required_selection_identity:
    "754a7e781f14ae5731ddbac2444b8c7c3182e95c10913ea640e49855610c54ea",
  runtime_execution_allowed: false,
  transport_access_allowed: false,
  trust_model: "module_private_provenance",
});

export const BOUNDED_INVOCATION_AUTHORIZATION_POLICY_DIGEST_V1 =
  "3e385ab82fdccafb7e75ba5d77a2b55be71b51d056a30c68c27f6f35a1fc37f2";

const trustedAuthorizations = new WeakMap();
const authorizationsByAttemptIdentity = new Map();

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
  state.authorization_digests_computed += 1;
  return createHash("sha256").update(value).digest("hex");
}

function digestJson(value, state) {
  return digestBytes(canonicalJson(value), state);
}

function emptyCounts() {
  return {
    authorization_digests_computed: 0,
    authorization_issuances: 0,
    plan_requests: 0,
    plan_verifications: 0,
  };
}

const OFF_RESULT = deepFreeze({
  authorization_identity_digest: null,
  authorization_version: BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
  counts: emptyCounts(),
  failure_identity_digest: null,
  reason: "bounded_invocation_authorization_disabled",
  receipt: null,
  status: "not_authorized",
});

function valueType(value) {
  if (value === null) return "null";
  return typeof value;
}

function sanitizedPlanFailure(planResult) {
  if (!isPlainObject(planResult)) {
    return {
      failure_identity_digest: null,
      reason: "plan_result_unavailable",
      status: "rejected",
    };
  }
  return {
    failure_identity_digest:
      typeof planResult.failure_identity_digest === "string" &&
      /^[0-9a-f]{64}$/.test(planResult.failure_identity_digest)
        ? planResult.failure_identity_digest
        : null,
    reason:
      typeof planResult.reason === "string" &&
      /^[a-z0-9_]{1,96}$/.test(planResult.reason)
        ? planResult.reason
        : "plan_reason_unavailable",
    status:
      typeof planResult.status === "string" &&
      /^(?:not_planned|rejected)$/.test(planResult.status)
        ? planResult.status
        : "rejected",
  };
}

function rejection(
  state,
  reason,
  stage,
  observation = null,
  planVerification = null,
  planResult = null,
) {
  const projection = {
    authorization_policy_digest:
      BOUNDED_INVOCATION_AUTHORIZATION_POLICY_DIGEST_V1,
    authorization_version: BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
    observation,
    plan_failure: sanitizedPlanFailure(planResult),
    plan_verification_reason:
      typeof planVerification?.reason === "string"
        ? planVerification.reason
        : null,
    reason,
    stage,
  };
  return deepFreeze({
    authorization_identity_digest: null,
    authorization_version: BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
    counts: { ...state },
    failure_identity_digest: digestJson(projection, state),
    reason,
    receipt: null,
    status: "rejected",
  });
}

function capturePrimitiveRequest(
  repositoryRoot,
  requestIdentity,
  requestValue,
  createdAtEpochMs,
  expiresAtEpochMs,
  evaluatedAtEpochMs,
  invocationBudget,
  attemptOrdinal,
) {
  if (typeof repositoryRoot !== "string") {
    return {
      error: "authorization_repository_root_invalid",
      observation: { repository_root_type: valueType(repositoryRoot) },
    };
  }
  if (typeof requestIdentity !== "string") {
    return {
      error: "authorization_request_identity_type_invalid",
      observation: { request_identity_type: valueType(requestIdentity) },
    };
  }
  const requestIdentityBytes = Buffer.byteLength(requestIdentity, "utf8");
  if (
    requestIdentityBytes === 0 ||
    requestIdentityBytes > 128 ||
    !/^[a-z0-9][a-z0-9._:-]*$/.test(requestIdentity)
  ) {
    return {
      error: "authorization_request_identity_invalid",
      observation: { request_identity_byte_length: requestIdentityBytes },
    };
  }
  if (typeof requestValue !== "string") {
    return {
      error: "authorization_request_type_invalid",
      observation: { request_type: valueType(requestValue) },
    };
  }
  const requestBytes = Buffer.byteLength(requestValue, "utf8");
  if (requestBytes === 0 || requestBytes > 512) {
    return {
      error: "authorization_request_byte_budget_exceeded",
      observation: { request_byte_length: requestBytes },
    };
  }
  if (
    requestValue !== requestValue.normalize("NFC") ||
    /[\u0000-\u001f\u007f]/.test(requestValue) ||
    /[\ud800-\udfff]/.test(requestValue)
  ) {
    return {
      error: "authorization_request_not_canonical",
      observation: { request_byte_length: requestBytes },
    };
  }
  if (
    ![createdAtEpochMs, expiresAtEpochMs, evaluatedAtEpochMs].every(
      (value) => Number.isSafeInteger(value) && value >= 0,
    )
  ) {
    return {
      error: "authorization_time_boundary_invalid",
      observation: {
        created_at_type: valueType(createdAtEpochMs),
        evaluated_at_type: valueType(evaluatedAtEpochMs),
        expires_at_type: valueType(expiresAtEpochMs),
      },
    };
  }
  const freshnessMs = expiresAtEpochMs - evaluatedAtEpochMs;
  if (
    evaluatedAtEpochMs < createdAtEpochMs ||
    freshnessMs < BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1.min_freshness_ms ||
    freshnessMs > BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1.max_freshness_ms
  ) {
    return {
      error: "authorization_freshness_boundary_invalid",
      observation: { freshness_ms: freshnessMs },
    };
  }
  if (
    !Number.isSafeInteger(invocationBudget) ||
    invocationBudget <
      BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1.min_invocation_budget ||
    invocationBudget >
      BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1.max_invocation_budget
  ) {
    return {
      error: "authorization_budget_boundary_invalid",
      observation: {
        invocation_budget_type: valueType(invocationBudget),
        invocation_budget_value: Number.isSafeInteger(invocationBudget)
          ? invocationBudget
          : null,
      },
    };
  }
  if (
    !Number.isSafeInteger(attemptOrdinal) ||
    attemptOrdinal <
      BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1.min_attempt_ordinal ||
    attemptOrdinal >
      BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1.max_attempt_ordinal
  ) {
    return {
      error: "authorization_attempt_ordinal_invalid",
      observation: {
        attempt_ordinal_type: valueType(attemptOrdinal),
        attempt_ordinal_value: Number.isSafeInteger(attemptOrdinal)
          ? attemptOrdinal
          : null,
      },
    };
  }
  return {
    captured: {
      attempt_ordinal: attemptOrdinal,
      created_at_epoch_ms: createdAtEpochMs,
      evaluated_at_epoch_ms: evaluatedAtEpochMs,
      expires_at_epoch_ms: expiresAtEpochMs,
      freshness_ms: freshnessMs,
      invocation_budget: invocationBudget,
      repository_root: repositoryRoot,
      request_identity: requestIdentity,
      request_value: requestValue,
    },
  };
}

function bindVerifiedPlan(plan, captured) {
  if (
    !isPlainObject(plan) ||
    !isPlainObject(plan.binding) ||
    !isPlainObject(plan.binding.admission) ||
    !isPlainObject(plan.binding.certification) ||
    !isPlainObject(plan.binding.inventory) ||
    !isPlainObject(plan.binding.invocation_request) ||
    !isPlainObject(plan.binding.planning_policy) ||
    !isPlainObject(plan.binding.runtime_profile) ||
    !isPlainObject(plan.binding.selection)
  ) return { error: "verified_plan_shape_invalid" };

  const binding = plan.binding;
  const request = binding.invocation_request;
  const profile = binding.runtime_profile;
  if (
    plan.status !== "planned" ||
    plan.planning_version !== BOUNDED_INVOCATION_PLAN_VERSION_V1 ||
    plan.plan_kind !== "bounded_invocation_decision" ||
    plan.runtime_authority !== false ||
    plan.runtime_execution_allowed !== false ||
    !Array.isArray(plan.privileged_capabilities) ||
    plan.privileged_capabilities.length !== 0 ||
    typeof plan.plan_identity_digest !== "string" ||
    !/^[0-9a-f]{64}$/.test(plan.plan_identity_digest)
  ) return { error: "verified_plan_identity_mismatch" };

  if (
    binding.admission.admission_identity_digest !==
      BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1.required_admission_identity ||
    binding.selection.selection_identity_digest !==
      BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1.required_selection_identity ||
    binding.planning_policy.policy_digest !==
      BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1.required_planning_policy_digest
  ) return { error: "verified_plan_authority_chain_mismatch" };

  if (
    profile.family_version !==
      BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1.required_runtime_family ||
    profile.runner_identity_digest !==
      BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1.required_runner_identity ||
    profile.runner_version !==
      "action_661j5r2_runtime_runner_rebuild_v1"
  ) return { error: "verified_plan_runtime_identity_mismatch" };

  if (
    request.created_at_epoch_ms !== captured.created_at_epoch_ms ||
    request.evaluated_at_epoch_ms !== captured.evaluated_at_epoch_ms ||
    request.expires_at_epoch_ms !== captured.expires_at_epoch_ms ||
    request.request_byte_length !==
      Buffer.byteLength(captured.request_value, "utf8") ||
    typeof request.canonical_request_digest !== "string" ||
    !/^[0-9a-f]{64}$/.test(request.canonical_request_digest) ||
    typeof request.request_identity_digest !== "string" ||
    !/^[0-9a-f]{64}$/.test(request.request_identity_digest)
  ) return { error: "verified_plan_request_binding_mismatch" };

  return {
    binding: {
      admission: {
        admission_identity_digest:
          binding.admission.admission_identity_digest,
        admission_version: binding.admission.admission_version,
      },
      certification: binding.certification,
      inventory: binding.inventory,
      invocation_request: {
        canonical_request_digest: request.canonical_request_digest,
        request_byte_length: request.request_byte_length,
        request_identity_digest: request.request_identity_digest,
      },
      planning: {
        plan_identity_digest: plan.plan_identity_digest,
        planning_policy_digest: binding.planning_policy.policy_digest,
        planning_policy_version: binding.planning_policy.policy_version,
        planning_version: plan.planning_version,
      },
      runtime_profile: {
        family_version: profile.family_version,
        policy_version: profile.policy_version,
        profile_digest: profile.profile_digest,
        profile_id: profile.profile_id,
        protocol_version: profile.protocol_version,
        runner_identity_digest: profile.runner_identity_digest,
        runner_version: profile.runner_version,
      },
      selection: {
        selection_identity_digest:
          binding.selection.selection_identity_digest,
        selection_version: binding.selection.selection_version,
      },
    },
  };
}

function issueAuthorization(planBinding, captured, state) {
  const attemptIdentityDigest = digestJson(
    {
      attempt_ordinal: captured.attempt_ordinal,
      authorization_version: BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
      request_identity_digest:
        planBinding.invocation_request.request_identity_digest,
    },
    state,
  );
  const binding = deepFreeze({
    ...planBinding,
    attempt: {
      attempt_identity_digest: attemptIdentityDigest,
      attempt_ordinal: captured.attempt_ordinal,
    },
    authorization_policy: {
      policy_digest: BOUNDED_INVOCATION_AUTHORIZATION_POLICY_DIGEST_V1,
      policy_version:
        "action_661j5r1_bounded_invocation_authorization_policy_v1",
    },
    freshness: {
      created_at_epoch_ms: captured.created_at_epoch_ms,
      evaluated_at_epoch_ms: captured.evaluated_at_epoch_ms,
      expires_at_epoch_ms: captured.expires_at_epoch_ms,
      freshness_ms: captured.freshness_ms,
    },
    invocation_budget: {
      max_operations: captured.invocation_budget,
      unit: "bounded_operation_v1",
    },
  });
  const identityProjection = {
    authorization_kind:
      BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1.authorization_kind,
    authorization_version: BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
    binding,
    status: "authorized",
  };
  const canonicalIdentity = canonicalJson(identityProjection);
  const authorizationIdentityDigest = digestBytes(canonicalIdentity, state);
  const existing = authorizationsByAttemptIdentity.get(attemptIdentityDigest);
  if (existing) {
    if (existing.canonical_identity !== canonicalIdentity) {
      return rejection(
        state,
        "authorization_attempt_identity_conflict",
        "private_issuance",
        { attempt_identity_digest: attemptIdentityDigest },
      );
    }
    return existing.result;
  }

  state.authorization_issuances += 1;
  const receipt = deepFreeze({
    authorization_identity_digest: authorizationIdentityDigest,
    authorization_kind:
      BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1.authorization_kind,
    authorization_version: BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
    binding,
    executable_capabilities: [],
    privileged_capabilities: [],
    runtime_authority: false,
    runtime_execution_allowed: false,
    status: "authorized",
    transport_access_allowed: false,
  });
  const result = deepFreeze({
    authorization_identity_digest: authorizationIdentityDigest,
    authorization_version: BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
    counts: { ...state },
    failure_identity_digest: null,
    reason: "bounded_invocation_privately_authorized",
    receipt,
    status: "authorized",
  });
  const verification = deepFreeze({
    authorization_identity_digest: authorizationIdentityDigest,
    authorization_version: BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
    reason: "private_authorization_provenance_verified",
    runtime_authority: false,
    runtime_execution_allowed: false,
    status: "authorized",
    transport_access_allowed: false,
  });
  trustedAuthorizations.set(receipt, verification);
  authorizationsByAttemptIdentity.set(attemptIdentityDigest, {
    canonical_identity: canonicalIdentity,
    result,
  });
  return result;
}

export function requestTransportInertBoundedInvocationAuthorizationV1(
  enabled = false,
  repositoryRoot,
  requestIdentity,
  requestValue,
  createdAtEpochMs,
  expiresAtEpochMs,
  evaluatedAtEpochMs,
  invocationBudget,
  attemptOrdinal,
) {
  if (enabled !== true) return OFF_RESULT;
  const state = emptyCounts();
  if (arguments.length !== 9) {
    return rejection(
      state,
      "authorization_request_shape_invalid",
      "request_validation",
      { argument_count: arguments.length },
    );
  }

  const validation = capturePrimitiveRequest(
    repositoryRoot,
    requestIdentity,
    requestValue,
    createdAtEpochMs,
    expiresAtEpochMs,
    evaluatedAtEpochMs,
    invocationBudget,
    attemptOrdinal,
  );
  if (validation.error) {
    return rejection(
      state,
      validation.error,
      "request_validation",
      validation.observation,
    );
  }
  const captured = validation.captured;

  let planResult;
  let planVerification;
  try {
    state.plan_requests += 1;
    planResult = requestCertificationSelectedBoundedInvocationPlanV1(
      true,
      captured.repository_root,
      captured.request_identity,
      captured.request_value,
      captured.created_at_epoch_ms,
      captured.expires_at_epoch_ms,
      captured.evaluated_at_epoch_ms,
    );
    state.plan_verifications += 1;
    planVerification = verifyCertificationSelectedBoundedInvocationPlanV1(
      planResult.plan,
    );
  } catch {
    return rejection(
      state,
      "planning_authority_internal_error",
      "plan_verification",
    );
  }

  if (planVerification.status !== "planned") {
    return rejection(
      state,
      "bounded_invocation_plan_rejected",
      "plan_verification",
      null,
      planVerification,
      planResult,
    );
  }
  const outcome = bindVerifiedPlan(planResult.plan, captured);
  if (outcome.error) {
    return rejection(
      state,
      outcome.error,
      "plan_binding",
      null,
      planVerification,
    );
  }
  return issueAuthorization(outcome.binding, captured, state);
}

export function verifyTransportInertBoundedInvocationAuthorizationV1(candidate) {
  const verification = trustedAuthorizations.get(candidate);
  if (verification) return verification;
  return deepFreeze({
    authorization_identity_digest: null,
    authorization_version: BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
    reason: "private_authorization_provenance_missing",
    runtime_authority: false,
    runtime_execution_allowed: false,
    status: "rejected",
    transport_access_allowed: false,
  });
}
