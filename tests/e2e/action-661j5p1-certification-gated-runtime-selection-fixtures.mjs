function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

export const RUNTIME_SELECTION_EXPECTATIONS_V1 = deepFreeze({
  admission_identity_digest:
    "b24080e9d746c3fdaf467a622f18db3b8b4b5d0881c3686cdd3df7d78aea1e15",
  aggregate_digest:
    "98064a290926d7b2ade45965eec3a21b41819763cb667a3a0c54f618600fe99d",
  family_version: "action_661j5r2_runtime_certification_rebuild_v1",
  fixture_count: 28,
  policy_digest:
    "8ad66894e28abe42b4001f2d04f347b0bfdbff316e7be25071092da7bbab8212",
  policy_version: "action_661j5r2_atomic_policy_registry_rebuild_v1",
  profile_digest:
    "c030f07347b1890184ee7ce4080c26b609fb1fcd13820bbdde5d8b476e60c95a",
  profile_id: "action_661j5p1_certified_rebuild_v1_runtime_profile",
  protocol_version: "action_661j5r2_runtime_result_protocol_rebuild_v1",
  runner_identity_digest:
    "76e4804def6411adaba50f4588248e8beaac88c63e1d6029850410b6c84bd2f7",
  runner_version: "action_661j5r2_runtime_runner_rebuild_v1",
  scenario_count: 14,
  selection_version: "action_661j5p1_certification_gated_runtime_selection_v1",
  shard_count: 28,
  snapshot_contract: "action_661j5r2_metadata_first_snapshot_rebuild_v1",
});

export const CALLER_SELECTION_TRUST_ATTACKS_V1 = deepFreeze([
  { attack_id: "caller_admission", claim: { admission: { status: "admitted" } } },
  { attack_id: "caller_certificate", claim: { certificate: { status: "certified" } } },
  { attack_id: "caller_authority", claim: { authority: { status: "trusted" } } },
  { attack_id: "caller_capsule", claim: { capsule: { status: "selected" } } },
  { attack_id: "caller_verified_result", claim: { verified: true } },
  {
    attack_id: "caller_selection_receipt",
    claim: {
      receipt: { status: "selected" },
      selection_identity_digest:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    },
  },
]);

export const RUNTIME_PROFILE_SUBSTITUTIONS_V1 = deepFreeze([
  {
    attack_id: "runtime_family_substitution",
    field: "family_version",
    value: "action_661j5r2_runtime_certification_rebuild_v2",
  },
  {
    attack_id: "runtime_protocol_substitution",
    field: "protocol_version",
    value: "action_661j5r9_trigger_success_result_protocol_rebuild_v1",
  },
  {
    attack_id: "runner_identity_substitution",
    field: "runner_identity_digest",
    value: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  },
  {
    attack_id: "policy_substitution",
    field: "policy_version",
    value: "action_661j5r9_trigger_success_policy_registry_rebuild_v1",
  },
]);

export const INVALID_SELECTION_ROOTS_V1 = deepFreeze([
  null,
  0,
  false,
  [],
  {},
]);
