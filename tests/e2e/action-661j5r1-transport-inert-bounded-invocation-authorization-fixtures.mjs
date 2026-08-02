function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

export const BOUNDED_INVOCATION_AUTHORIZATION_EXPECTATIONS_V1 = deepFreeze({
  admission_identity_digest:
    "b24080e9d746c3fdaf467a622f18db3b8b4b5d0881c3686cdd3df7d78aea1e15",
  attempt_identity_digest:
    "70bc330ff302ce60cbacea6cea2b2538f2df5eb9a0afd8d32d6ecea2b4da8e84",
  authorization_identity_digest:
    "4801eefde4ba1675004723f086cee3e937ac3d1b78201c2708edbc0c29f5f21d",
  authorization_policy_digest:
    "3e385ab82fdccafb7e75ba5d77a2b55be71b51d056a30c68c27f6f35a1fc37f2",
  canonical_request_digest:
    "99cef77b0957aee2401c4ddbf58ffd3f511d63fc95f6375ad97a400803d4e932",
  plan_identity_digest:
    "250529f2619eb4e16f764170e96b1dbaa8339bc13c40c8e041f40c7a9a2c67b6",
  planning_policy_digest:
    "0510aaa58f31e6522c878fa9d32f798f8ad9bc6bc0cb615e379ceba621cf15ce",
  request_identity_digest:
    "0599c4bca6dd2682b1984410ad0e544ce2af2f5fc79136f04abff350c04caafb",
  runtime_family: "action_661j5r2_runtime_certification_rebuild_v1",
  runner_identity_digest:
    "76e4804def6411adaba50f4588248e8beaac88c63e1d6029850410b6c84bd2f7",
  selection_identity_digest:
    "754a7e781f14ae5731ddbac2444b8c7c3182e95c10913ea640e49855610c54ea",
});

export const VALID_BOUNDED_INVOCATION_AUTHORIZATION_REQUEST_V1 = deepFreeze({
  attempt_ordinal: 1,
  created_at_epoch_ms: 1785580800000,
  evaluated_at_epoch_ms: 1785580801000,
  expires_at_epoch_ms: 1785580920000,
  invocation_budget: 4,
  request_identity: "missing-target-runtime-authorization",
  request_value: "invoke:missing_target:certified_rebuild_v1",
});

export const CALLER_AUTHORIZATION_TRUST_ATTACKS_V1 = deepFreeze([
  { attack_id: "caller_plan", claim: { plan: { status: "planned" } } },
  { attack_id: "caller_admission", claim: { admission: { status: "admitted" } } },
  { attack_id: "caller_selection", claim: { selection: { status: "selected" } } },
  { attack_id: "caller_runner", claim: { runner: { status: "trusted" } } },
  { attack_id: "caller_capsule", claim: { capsule: { status: "trusted" } } },
  { attack_id: "caller_authority", claim: { authority: true } },
]);

export const AUTHORIZATION_SUBSTITUTIONS_V1 = deepFreeze([
  ["binding.runtime_profile.family_version", "action_661j5r2_runtime_certification_rebuild_v2"],
  ["binding.runtime_profile.runner_identity_digest", "a".repeat(64)],
  ["binding.invocation_budget.max_operations", 8],
  ["binding.freshness.expires_at_epoch_ms", 1785580920001],
  ["binding.attempt.attempt_ordinal", 2],
]);

export const INVALID_AUTHORIZATION_BOUNDARIES_V1 = deepFreeze([
  { attack_id: "budget_below", budget: 0, attempt: 1, evaluated: 1785580801000, expires: 1785580920000 },
  { attack_id: "budget_above", budget: 9, attempt: 1, evaluated: 1785580801000, expires: 1785580920000 },
  { attack_id: "attempt_below", budget: 4, attempt: 0, evaluated: 1785580801000, expires: 1785580920000 },
  { attack_id: "attempt_above", budget: 4, attempt: 5, evaluated: 1785580801000, expires: 1785580920000 },
  { attack_id: "expired", budget: 4, attempt: 1, evaluated: 1785580920000, expires: 1785580920000 },
  { attack_id: "freshness_above", budget: 4, attempt: 1, evaluated: 1785580801000, expires: 1785580921001 },
]);
