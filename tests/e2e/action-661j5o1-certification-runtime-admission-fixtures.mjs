function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

export const ADMISSION_AUTHORITY_EXPECTATIONS_V1 = deepFreeze({
  admission_version:
    "action_661j5o1_certification_backed_runtime_admission_v1",
  consumer_module_sha256:
    "110a919401aee396508ba6d393132ed41e400343ea209559cdc1003eba4f69c5",
  consumer_normative_digest:
    "2793ec54bfdbc15eae21dc587c970e23ac1b5f7f1439a7efed6e6b32055c1636",
  consumer_version:
    "action_661j5n2a_descriptor_bound_certification_consumer_v2",
  delivery_digest:
    "80024a817857603d508d094e2e53616dfab48ba60ac661211ff3fa2672ad5d0e",
  final_aggregate_digest:
    "98064a290926d7b2ade45965eec3a21b41819763cb667a3a0c54f618600fe99d",
  final_freeze_manifest_digest:
    "9e6f8237a5f760c0ef34b2783eca69d7d1496a935d984bc8f07a92493982a4a6",
  final_freeze_manifest_file_sha256:
    "2fde89c7906057516d820707c726b7f93005e491c56d80799a2568805d1ce5ce",
  fixture_count: 28,
  recovery_disclosure_file_sha256:
    "06efa3ca53af693e8478a068f4e2202c942300346d208511d921b0eec2993aeb",
  scenario_count: 14,
  shard_count: 28,
  policy_digest:
    "5adbd3b5e223ceec6acd83831650f9cd93ca64fd878375901e0c29ac70881b21",
});

export const CALLER_TRUST_ATTACKS_V1 = deepFreeze([
  {
    attack_id: "caller_verified_flag",
    claim: { verified: true },
  },
  {
    attack_id: "caller_certified_flag",
    claim: { certified: true },
  },
  {
    attack_id: "caller_capsule",
    claim: { capsule: { status: "certified" } },
  },
  {
    attack_id: "caller_receipt",
    claim: { receipt: { status: "admitted" } },
  },
  {
    attack_id: "caller_authority",
    claim: { authority: { status: "trusted" } },
  },
  {
    attack_id: "recomputed_public_digest",
    claim: {
      admission_identity_digest:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      status: "admitted",
    },
  },
]);

export const CERTIFICATION_SCOPE_ATTACKS_V1 = deepFreeze([
  {
    attack_id: "missing_path",
    certification_paths: [],
  },
  {
    attack_id: "extra_path",
    certification_paths: ["unexpected/certification.json"],
  },
  {
    attack_id: "duplicate_path",
    certification_paths: [
      "docs/recovery/action-661j5r10/final-freeze-manifest.json",
      "docs/recovery/action-661j5r10/final-freeze-manifest.json",
    ],
  },
  {
    attack_id: "renamed_path",
    certification_paths: [
      "docs/recovery/action-661j5r10/final-freeze-manifest-renamed.json",
    ],
  },
  {
    attack_id: "manifest_substitution",
    manifest_digest:
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  },
  {
    attack_id: "root_substitution",
    repository_root: "/caller-selected-certification-root",
  },
]);

export const INVALID_ENABLED_ROOTS_V1 = deepFreeze([
  null,
  0,
  false,
  [],
  {},
]);
