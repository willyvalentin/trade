function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

export const BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1 = deepFreeze({
  admission_identity_digest:
    "b24080e9d746c3fdaf467a622f18db3b8b4b5d0881c3686cdd3df7d78aea1e15",
  canonical_request_digest:
    "99cef77b0957aee2401c4ddbf58ffd3f511d63fc95f6375ad97a400803d4e932",
  family_version: "action_661j5r2_runtime_certification_rebuild_v1",
  plan_identity_digest:
    "80503eb2c83764ee02520ac9e62c1533a7252bd2ecb260b690191428d7090db2",
  planning_policy_digest:
    "0510aaa58f31e6522c878fa9d32f798f8ad9bc6bc0cb615e379ceba621cf15ce",
  planning_policy_version: "action_661j5q1_bounded_invocation_plan_policy_v1",
  planning_version:
    "action_661j5q1_certification_selected_bounded_invocation_plan_v1",
  profile_digest:
    "c030f07347b1890184ee7ce4080c26b609fb1fcd13820bbdde5d8b476e60c95a",
  profile_id: "action_661j5p1_certified_rebuild_v1_runtime_profile",
  request_identity_digest:
    "1b8814da08957e4641b28d0137fdae644d6a9dccf5d9a7459639edfcd4c7039d",
  runner_identity_digest:
    "76e4804def6411adaba50f4588248e8beaac88c63e1d6029850410b6c84bd2f7",
  runner_version: "action_661j5r2_runtime_runner_rebuild_v1",
  selection_identity_digest:
    "754a7e781f14ae5731ddbac2444b8c7c3182e95c10913ea640e49855610c54ea",
  selection_version: "action_661j5p1_certification_gated_runtime_selection_v1",
});

export const VALID_BOUNDED_INVOCATION_REQUEST_V1 = deepFreeze({
  created_at_epoch_ms: 1785580800000,
  evaluated_at_epoch_ms: 1785580801000,
  expires_at_epoch_ms: 1785580920000,
  request_identity: "missing-target-runtime-certification",
  request_value: "invoke:missing_target:certified_rebuild_v1",
});

export const CALLER_PLANNING_TRUST_ATTACKS_V1 = deepFreeze([
  { attack_id: "caller_admission", claim: { admission: { status: "admitted" } } },
  { attack_id: "caller_selection", claim: { selection: { status: "selected" } } },
  { attack_id: "caller_runner", claim: { runner: { status: "trusted" } } },
  { attack_id: "caller_certificate", claim: { certificate: { status: "certified" } } },
  { attack_id: "caller_capsule", claim: { capsule: { status: "trusted" } } },
  { attack_id: "caller_verified", claim: { verified: true } },
]);

export const PLAN_SUBSTITUTIONS_V1 = deepFreeze([
  {
    attack_id: "runtime_family_substitution",
    field: "family_version",
    value: "action_661j5r2_runtime_certification_rebuild_v2",
  },
  {
    attack_id: "runner_identity_substitution",
    field: "runner_identity_digest",
    value: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  },
  {
    attack_id: "runner_version_substitution",
    field: "runner_version",
    value: "action_661j5r2_runtime_runner_rebuild_v2",
  },
  {
    attack_id: "policy_substitution",
    field: "policy_version",
    value: "action_661j5r9_trigger_success_policy_registry_rebuild_v1",
  },
]);

export const INVALID_PRIMITIVE_REQUESTS_V1 = deepFreeze([
  { attack_id: "empty_request", request_value: "" },
  { attack_id: "control_character", request_value: "invoke:\u0000missing_target" },
  { attack_id: "non_canonical_unicode", request_value: "invoke:cafe\u0301" },
  { attack_id: "oversized_request", request_value: "x".repeat(513) },
]);
