import {
  marketContextDiagnosticContextSha256V1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2,
  canonicalizeRecommendationOutcomeEvidencePlainDataV2,
  completeRepositoryOwnedRecommendationOutcomeEvidenceV2,
  type RecommendationOutcomeEvidenceCompletionRequestV2,
} from "./recommendation-outcome-evidence-completion-v2";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_MATERIAL_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VERIFIER_V1,
  RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
  computeRecommendationOutcomeEvidenceBundleDigestV1,
  computeRecommendationOutcomeEvidenceLineageRootV1,
  type RecommendationOutcomeEvidenceBundleV1,
  type RecommendationOutcomeEvidenceMaterialV1,
} from "./recommendation-outcome-evidence-completion-v1";

export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2 =
  "repository_owned_recommendation_outcome_evidence_issuance_v2" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V2 =
  "repository_owned_recommendation_outcome_evidence_issuer_authority_v2" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V2 =
  "repository_owned_recommendation_outcome_evidence_issuer_registry_v2" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_MATERIAL_V2 =
  "repository_owned_recommendation_outcome_evidence_issuance_material_v2" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_ENVELOPE_V2 =
  "repository_owned_recommendation_outcome_evidence_issuance_envelope_v2" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_PROVENANCE_V2 =
  "repository_owned_recommendation_outcome_evidence_issuance_provenance_v2" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_VERIFIER_V2 =
  "repository_owned_recommendation_outcome_evidence_issuance_verifier_v2" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_PRE_DOWNSTREAM_ADMISSION_V2 =
  "repository_owned_recommendation_outcome_evidence_pre_downstream_admission_v2" as const;

export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_TAXONOMY_V2 = [
  "issued",
  "incomplete",
  "conflicting",
  "not_point_in_time_safe",
  "unmappable",
] as const;

export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_BOUNDARY_V2 = {
  diagnostic_only: true,
  shadow_only: true,
  read_only: true,
  real_outcome_source_accessed: false,
  canonical_performance_eligible: false,
  automatic_model_input_allowed: false,
  automatic_training_allowed: false,
  automatic_promotion_allowed: false,
  causal_claimed: false,
  live_ranking_effect: false,
} as const;

type Taxonomy =
  (typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_TAXONOMY_V2)[number];
type PlainRecord = Record<string, unknown>;

export type RecommendationOutcomeEvidenceIssuanceRequestV2 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2;
  issuance_identity: string;
  expected_repository_row_identity: string;
  expected_evidence_bundle_identity: string;
};

export type RecommendationOutcomeEvidencePreDownstreamAdmissionV2 = {
  admission_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_PRE_DOWNSTREAM_ADMISSION_V2;
  completion_material_digest: string;
  gap_closure_set_digest: string;
  expected_s2a_taxonomy: "completed";
  verifier_identity:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_VERIFIER_V2;
  verifier_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2;
  admission_digest: string;
};

export type RecommendationOutcomeEvidenceIssuerRegistryV2 = {
  registry_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V2;
  registry_identity: string;
  issuer: {
    identity: string;
    version: string;
    authority_anchor_digest: string;
  };
  epoch: {
    value: string;
    predecessor_issuance_digest: string;
  };
  trust_root_digest: string;
  issuance_entry: {
    issuance_identity: string;
    repository_row_identity: string;
    repository_row_digest: string;
    evidence_bundle_identity: string;
    evidence_bundle_digest: string;
    completion_registry_identity: string;
    completion_registry_digest: string;
    verifier_identity:
      typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_VERIFIER_V2;
    verifier_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2;
  };
  pre_downstream_admission:
    RecommendationOutcomeEvidencePreDownstreamAdmissionV2;
};

export type RecommendationOutcomeEvidenceIssuanceMaterialV2 = {
  material_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_MATERIAL_V2;
  issuer_registry: RecommendationOutcomeEvidenceIssuerRegistryV2;
  completion_material: RecommendationOutcomeEvidenceMaterialV1;
};

export type RecommendationOutcomeEvidenceIssuerAuthorityV2 = {
  authority_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V2;
  expected_issuer_anchor: {
    registry_identity: string;
    registry_version:
      typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V2;
    registry_digest: string;
    issuer_identity: string;
    issuer_version: string;
    authority_anchor_digest: string;
    trust_root_digest: string;
    minimum_epoch: string;
    expected_predecessor_issuance_digest: string;
  };
  read_issuance_material: () => unknown;
};

export type RecommendationOutcomeEvidenceDownstreamActivityV2 = {
  s2a_request_construction_count: number;
  s2a_call_count: number;
  s2a_result_digest_work_count: number;
};

export type RecommendationOutcomeEvidenceIssuanceDependenciesV2 = {
  enabled: boolean;
  kill_switch: boolean;
  authority?: RecommendationOutcomeEvidenceIssuerAuthorityV2;
  observe_downstream_step?: (
    step:
      | "s2a_request_constructed"
      | "s2a_called"
      | "s2a_result_digest_bound",
  ) => void;
};

type AuthoritySnapshotV2 = {
  authority_version:
    | typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V2
    | null;
  disposition:
    | "not_read_default_off"
    | "not_read_kill_switch"
    | "verified"
    | "rejected"
    | "lookup_failed";
  snapshot_digest: string;
  registry_identity: string | null;
  registry_digest: string | null;
  issuer_identity: string | null;
  issuer_version: string | null;
  authority_anchor_digest: string | null;
  trust_root_digest: string | null;
  minimum_epoch: string | null;
  expected_predecessor_issuance_digest: string | null;
};

export type RecommendationOutcomeEvidenceObservedIssuanceInputV2 = {
  namespace:
    | "issuance_material"
    | "issuer_registry"
    | "completion_registry"
    | "repository_row"
    | "evidence_bundle";
  disposition:
    | "absent"
    | "malformed"
    | "verified"
    | "present_rejected";
  observed_digest: string;
  reason_codes: string[];
};

export type RecommendationOutcomeEvidenceIssuanceEnvelopeV2 = {
  envelope_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_ENVELOPE_V2;
  issuance_identity: string;
  issuer_identity: string;
  issuer_version: string;
  issuer_epoch: string;
  predecessor_issuance_digest: string;
  repository_row_identity: string;
  repository_row_digest: string;
  evidence_bundle_identity: string;
  evidence_bundle_digest: string;
  source_digest: string;
  bundle_digest: string;
  trust_root_digest: string;
  pre_downstream_admission_digest: string;
  completion_material: Readonly<RecommendationOutcomeEvidenceMaterialV1>;
  issuance_digest: string;
};

type ResultCommonV2 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2;
  request_digest: string;
  issuer_authority_snapshot: AuthoritySnapshotV2;
  observed_input_provenance: {
    provenance_version:
      typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_PROVENANCE_V2;
    sections: RecommendationOutcomeEvidenceObservedIssuanceInputV2[];
    provenance_digest: string;
  };
  downstream_activity: RecommendationOutcomeEvidenceDownstreamActivityV2;
  reason_codes: string[];
  diagnostic_only: true;
  shadow_only: true;
  read_only: true;
  real_outcome_source_accessed: false;
  canonical_performance_eligible: false;
  automatic_model_input_allowed: false;
  automatic_training_allowed: false;
  automatic_promotion_allowed: false;
  causal_claimed: false;
  live_ranking_effect: false;
  result_digest: string;
};

export type RecommendationOutcomeEvidenceIssuanceResultV2 =
  | (ResultCommonV2 & {
      taxonomy: "issued";
      issuance_envelope:
        Readonly<RecommendationOutcomeEvidenceIssuanceEnvelopeV2>;
      s2a_completion_result_digest: string;
      failure_identity_digest: null;
    })
  | (ResultCommonV2 & {
      taxonomy: Exclude<Taxonomy, "issued">;
      issuance_envelope: null;
      failure_identity_digest: string;
    });

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);
const ABSENT_DIGEST = sha({ canonical_absent: true });
const ZERO_ACTIVITY: RecommendationOutcomeEvidenceDownstreamActivityV2 = {
  s2a_request_construction_count: 0,
  s2a_call_count: 0,
  s2a_result_digest_work_count: 0,
};
const record = (value: unknown): PlainRecord | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as PlainRecord
    : null;
const nonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;
const isSha = (value: unknown): value is string =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const isUnixNs = (value: unknown): value is string =>
  typeof value === "string" && /^(0|[1-9][0-9]*)$/.test(value);
const sortedUnique = (values: string[]) =>
  [...new Set(values)].sort((left, right) => left.localeCompare(right));

function deepFreeze<T>(value: T): T {
  const pending: unknown[] = [value];
  const seen = new WeakSet<object>();
  while (pending.length > 0) {
    const current = pending.pop();
    if (current === null || typeof current !== "object") continue;
    if (seen.has(current)) continue;
    seen.add(current);
    Object.freeze(current);
    pending.push(...Object.values(current));
  }
  return value;
}

function canonical(value: unknown) {
  const inspected =
    canonicalizeRecommendationOutcomeEvidencePlainDataV2(value);
  return {
    ok: inspected.ok,
    value: inspected.value,
    digest: inspected.ok ? sha(inspected.value) : inspected.digest,
    reason_codes: inspected.reason_codes,
  };
}

function exactKeys(
  value: PlainRecord | null,
  expected: readonly string[],
  namespace: string,
  reasons: string[],
) {
  if (!value) {
    reasons.push(`${namespace}:object_required`);
    return;
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (
    actual.length !== wanted.length ||
    actual.some((key, index) => key !== wanted[index])
  ) reasons.push(`${namespace}:closed_schema_mismatch`);
}

function normalizedClosures(value: unknown) {
  if (!Array.isArray(value)) return [];
  return structuredClone(value).sort((left, right) => {
    const leftRecord = record(left);
    const rightRecord = record(right);
    return [
      leftRecord?.gap_code,
      leftRecord?.evidence_identity,
      leftRecord?.evidence_digest,
    ].map(String).join(":").localeCompare(
      [
        rightRecord?.gap_code,
        rightRecord?.evidence_identity,
        rightRecord?.evidence_digest,
      ].map(String).join(":"),
    );
  });
}

function snapshotAuthority(authority: unknown) {
  const reasons: string[] = [];
  if (authority === null || typeof authority !== "object") {
    return {
      ok: false,
      anchor: null,
      callback: null,
      reasons: ["issuer_authority_missing"],
    };
  }
  let descriptors: PropertyDescriptorMap;
  let keys: (string | symbol)[];
  try {
    descriptors = Object.getOwnPropertyDescriptors(authority);
    keys = Reflect.ownKeys(authority);
  } catch {
    return {
      ok: false,
      anchor: null,
      callback: null,
      reasons: ["issuer_authority_introspection_failed_sanitized"],
    };
  }
  if (
    keys.some((key) => typeof key === "symbol") ||
    keys.map(String).sort().join(",") !==
      [
        "authority_version",
        "expected_issuer_anchor",
        "read_issuance_material",
      ].sort().join(",")
  ) reasons.push("issuer_authority:closed_schema_mismatch");
  const version = descriptors.authority_version;
  const anchorDescriptor = descriptors.expected_issuer_anchor;
  const callbackDescriptor = descriptors.read_issuance_material;
  if (
    !version || !("value" in version) ||
    version.value !== RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V2
  ) reasons.push("issuer_authority_version_mismatch");
  if (!anchorDescriptor || !("value" in anchorDescriptor)) {
    reasons.push("issuer_authority_anchor_missing_or_accessor");
  }
  if (
    !callbackDescriptor || !("value" in callbackDescriptor) ||
    typeof callbackDescriptor.value !== "function"
  ) reasons.push("issuer_authority_callback_missing_or_accessor");
  const anchorCanonical = canonical(
    anchorDescriptor && "value" in anchorDescriptor
      ? anchorDescriptor.value
      : null,
  );
  if (!anchorCanonical.ok) {
    reasons.push(
      ...anchorCanonical.reason_codes.map((reason) =>
        `issuer_authority_anchor:${reason}`
      ),
    );
  }
  const anchor = record(anchorCanonical.value);
  exactKeys(
    anchor,
    [
      "registry_identity",
      "registry_version",
      "registry_digest",
      "issuer_identity",
      "issuer_version",
      "authority_anchor_digest",
      "trust_root_digest",
      "minimum_epoch",
      "expected_predecessor_issuance_digest",
    ],
    "issuer_authority_anchor",
    reasons,
  );
  if (anchor) {
    if (
      anchor.registry_version !==
        RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V2
    ) reasons.push("issuer_registry_version_mismatch");
    for (
      const key of [
        "registry_digest",
        "authority_anchor_digest",
        "trust_root_digest",
        "expected_predecessor_issuance_digest",
      ] as const
    ) {
      if (!isSha(anchor[key])) {
        reasons.push(`issuer_authority_anchor:${key}:invalid_sha256`);
      }
    }
    for (
      const key of [
        "registry_identity",
        "issuer_identity",
        "issuer_version",
        "minimum_epoch",
      ] as const
    ) {
      if (!nonEmpty(anchor[key])) {
        reasons.push(`issuer_authority_anchor:${key}:missing`);
      }
    }
  }
  return {
    ok: reasons.length === 0,
    anchor,
    callback:
      callbackDescriptor && "value" in callbackDescriptor &&
        typeof callbackDescriptor.value === "function"
        ? callbackDescriptor.value as () => unknown
        : null,
    reasons: sortedUnique(reasons),
  };
}

function authoritySnapshot(
  disposition: AuthoritySnapshotV2["disposition"],
  anchor: PlainRecord | null,
): AuthoritySnapshotV2 {
  const core = {
    authority_version:
      disposition === "verified"
        ? RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V2
        : null,
    disposition,
    registry_identity: nonEmpty(anchor?.registry_identity)
      ? anchor.registry_identity
      : null,
    registry_digest: isSha(anchor?.registry_digest)
      ? anchor.registry_digest
      : null,
    issuer_identity: nonEmpty(anchor?.issuer_identity)
      ? anchor.issuer_identity
      : null,
    issuer_version: nonEmpty(anchor?.issuer_version)
      ? anchor.issuer_version
      : null,
    authority_anchor_digest: isSha(anchor?.authority_anchor_digest)
      ? anchor.authority_anchor_digest
      : null,
    trust_root_digest: isSha(anchor?.trust_root_digest)
      ? anchor.trust_root_digest
      : null,
    minimum_epoch: typeof anchor?.minimum_epoch === "string"
      ? anchor.minimum_epoch
      : null,
    expected_predecessor_issuance_digest:
      isSha(anchor?.expected_predecessor_issuance_digest)
        ? anchor.expected_predecessor_issuance_digest
        : null,
  };
  return deepFreeze({
    ...core,
    snapshot_digest: sha(core),
  });
}

function emptySections(
  reason: string,
): RecommendationOutcomeEvidenceObservedIssuanceInputV2[] {
  return [
    "issuance_material",
    "issuer_registry",
    "completion_registry",
    "repository_row",
    "evidence_bundle",
  ].map((namespace) => ({
    namespace:
      namespace as RecommendationOutcomeEvidenceObservedIssuanceInputV2[
        "namespace"
      ],
    disposition: "absent" as const,
    observed_digest: ABSENT_DIGEST,
    reason_codes: [reason],
  }));
}

function malformedMaterialSections(
  digest: string,
  reasons: string[],
): RecommendationOutcomeEvidenceObservedIssuanceInputV2[] {
  return [
    {
      namespace: "issuance_material",
      disposition: "malformed",
      observed_digest: digest,
      reason_codes: sortedUnique(reasons),
    },
    ...emptySections("nested_section_unavailable_after_material_rejection")
      .filter((section) => section.namespace !== "issuance_material"),
  ];
}

function observedSections(
  material: PlainRecord,
): RecommendationOutcomeEvidenceObservedIssuanceInputV2[] {
  const completion = record(material.completion_material);
  const values: Array<
    [RecommendationOutcomeEvidenceObservedIssuanceInputV2["namespace"], unknown]
  > = [
    ["issuance_material", material],
    ["issuer_registry", material.issuer_registry],
    ["completion_registry", completion?.registry],
    ["repository_row", completion?.observed_repository_row],
    ["evidence_bundle", completion?.observed_evidence_bundle],
  ];
  return values.map(([namespace, value]) => {
    if (value === undefined || value === null) {
      return {
        namespace,
        disposition: "absent",
        observed_digest: ABSENT_DIGEST,
        reason_codes: [`${namespace}:absent`],
      };
    }
    const inspected = canonical(value);
    return {
      namespace,
      disposition: inspected.ok ? "present_rejected" : "malformed",
      observed_digest: inspected.digest,
      reason_codes: inspected.ok
        ? [`${namespace}:pending_verification`]
        : inspected.reason_codes,
    };
  });
}

function normalizedSections(
  sections: RecommendationOutcomeEvidenceObservedIssuanceInputV2[],
  verified: boolean,
  reasons: string[],
) {
  return sections.map((section) => ({
    ...section,
    disposition:
      section.disposition === "absent" || section.disposition === "malformed"
        ? section.disposition
        : verified ? "verified" as const : "present_rejected" as const,
    reason_codes:
      section.disposition === "absent" || section.disposition === "malformed"
        ? sortedUnique(section.reason_codes)
        : verified ? [] : sortedUnique(reasons),
  })).sort((left, right) => left.namespace.localeCompare(right.namespace));
}

function buildProvenance(
  sections: RecommendationOutcomeEvidenceObservedIssuanceInputV2[],
) {
  return {
    provenance_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_PROVENANCE_V2,
    sections,
    provenance_digest: sha(sections),
  };
}

function nonIssued(
  taxonomy: Exclude<Taxonomy, "issued">,
  requestDigest: string,
  snapshot: AuthoritySnapshotV2,
  sections: RecommendationOutcomeEvidenceObservedIssuanceInputV2[],
  reasons: string[],
) {
  const reasonCodes = sortedUnique(reasons);
  const provenance = buildProvenance(
    normalizedSections(sections, false, reasonCodes),
  );
  const failureIdentity = sha({
    taxonomy,
    request_digest: requestDigest,
    authority_snapshot_digest: snapshot.snapshot_digest,
    provenance_digest: provenance.provenance_digest,
    reason_codes: reasonCodes,
  });
  const core = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
    taxonomy,
    request_digest: requestDigest,
    issuer_authority_snapshot: snapshot,
    observed_input_provenance: provenance,
    downstream_activity: ZERO_ACTIVITY,
    issuance_envelope: null,
    failure_identity_digest: failureIdentity,
    reason_codes: reasonCodes,
    ...RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_BOUNDARY_V2,
  };
  return deepFreeze({
    ...core,
    result_digest: sha(core),
  }) as RecommendationOutcomeEvidenceIssuanceResultV2;
}

function defaultOff(
  disposition: "not_read_default_off" | "not_read_kill_switch",
) {
  const reason = disposition === "not_read_default_off"
    ? "issuance_default_off"
    : "issuance_kill_switch_active";
  return nonIssued(
    "incomplete",
    ABSENT_DIGEST,
    authoritySnapshot(disposition, null),
    emptySections(reason),
    [reason],
  );
}

function parseEpoch(value: unknown) {
  if (typeof value !== "string" || !/^(0|[1-9][0-9]*)$/.test(value)) {
    return null;
  }
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

function temporalOrderIsSafe(instants: PlainRecord | null) {
  if (!instants) return false;
  const keys = [
    "decision_unix_ns",
    "outcome_start_unix_ns",
    "outcome_end_unix_ns",
    "source_unix_ns",
    "receive_unix_ns",
    "finalization_unix_ns",
    "evaluation_unix_ns",
    "evidence_cutoff_unix_ns",
  ] as const;
  if (keys.some((key) => !isUnixNs(instants[key]))) return false;
  try {
    const values = keys.map((key) => BigInt(instants[key] as string));
    return values[0] < values[1] &&
      values[1] <= values[2] &&
      values[2] <= values[3] &&
      values[3] <= values[4] &&
      values[4] <= values[5] &&
      values[5] <= values[6] &&
      values[6] <= values[7];
  } catch {
    return false;
  }
}

function validatePreDownstream(
  request: RecommendationOutcomeEvidenceIssuanceRequestV2,
  anchor: PlainRecord,
  material: PlainRecord,
) {
  const shapeReasons: string[] = [];
  const conflictReasons: string[] = [];
  const incompleteReasons: string[] = [];
  exactKeys(
    material,
    ["material_version", "issuer_registry", "completion_material"],
    "issuance_material",
    shapeReasons,
  );
  if (
    material.material_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_MATERIAL_V2
  ) shapeReasons.push("issuance_material_version_mismatch");
  const registry = record(material.issuer_registry);
  const completion = record(material.completion_material);
  exactKeys(
    registry,
    [
      "registry_version",
      "registry_identity",
      "issuer",
      "epoch",
      "trust_root_digest",
      "issuance_entry",
      "pre_downstream_admission",
    ],
    "issuer_registry",
    shapeReasons,
  );
  const issuer = record(registry?.issuer);
  const epoch = record(registry?.epoch);
  const entry = record(registry?.issuance_entry);
  const admission = record(registry?.pre_downstream_admission);
  const completionRegistry = record(completion?.registry);
  const completionEntry = record(completionRegistry?.completion_entry);
  const row = completion?.observed_repository_row;
  const bundle = record(completion?.observed_evidence_bundle);
  exactKeys(
    issuer,
    ["identity", "version", "authority_anchor_digest"],
    "issuer_registry.issuer",
    shapeReasons,
  );
  exactKeys(
    epoch,
    ["value", "predecessor_issuance_digest"],
    "issuer_registry.epoch",
    shapeReasons,
  );
  exactKeys(
    entry,
    [
      "issuance_identity",
      "repository_row_identity",
      "repository_row_digest",
      "evidence_bundle_identity",
      "evidence_bundle_digest",
      "completion_registry_identity",
      "completion_registry_digest",
      "verifier_identity",
      "verifier_version",
    ],
    "issuer_registry.issuance_entry",
    shapeReasons,
  );
  exactKeys(
    admission,
    [
      "admission_version",
      "completion_material_digest",
      "gap_closure_set_digest",
      "expected_s2a_taxonomy",
      "verifier_identity",
      "verifier_version",
      "admission_digest",
    ],
    "issuer_registry.pre_downstream_admission",
    shapeReasons,
  );
  if (!registry || !issuer || !epoch || !entry || !admission || !completion) {
    shapeReasons.push("issuance_material_nested_shape_invalid");
  }
  if (
    completion?.material_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_MATERIAL_V1
  ) shapeReasons.push("completion_material_version_mismatch");
  if (
    completionRegistry?.registry_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1
  ) shapeReasons.push("completion_registry_version_mismatch");

  const equality: Array<[unknown, unknown, string]> = [
    [registry?.registry_version, RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V2, "issuer_registry_version"],
    [registry?.registry_identity, anchor.registry_identity, "registry_identity"],
    [sha(registry), anchor.registry_digest, "issuer_registry_digest"],
    [issuer?.identity, anchor.issuer_identity, "issuer_identity"],
    [issuer?.version, anchor.issuer_version, "issuer_version"],
    [issuer?.authority_anchor_digest, anchor.authority_anchor_digest, "authority_anchor_digest"],
    [registry?.trust_root_digest, anchor.trust_root_digest, "trust_root_digest"],
    [epoch?.predecessor_issuance_digest, anchor.expected_predecessor_issuance_digest, "predecessor_issuance_digest"],
    [entry?.issuance_identity, request.issuance_identity, "issuance_identity"],
    [entry?.repository_row_identity, request.expected_repository_row_identity, "repository_row_identity"],
    [entry?.evidence_bundle_identity, request.expected_evidence_bundle_identity, "evidence_bundle_identity"],
    [entry?.repository_row_digest, sha(row), "repository_row_digest"],
    [entry?.evidence_bundle_digest, sha(bundle), "evidence_bundle_digest"],
    [entry?.completion_registry_identity, completionRegistry?.registry_identity, "completion_registry_identity"],
    [entry?.completion_registry_digest, sha(completionRegistry), "completion_registry_digest"],
    [entry?.repository_row_identity, completionEntry?.repository_row_identity, "completion_repository_row_identity"],
    [entry?.evidence_bundle_identity, completionEntry?.evidence_bundle_identity, "completion_evidence_bundle_identity"],
    [entry?.verifier_identity, RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_VERIFIER_V2, "verifier_identity"],
    [entry?.verifier_version, RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2, "verifier_version"],
  ];
  for (const [observed, expected, field] of equality) {
    if (observed !== expected) conflictReasons.push(`${field}_mismatch`);
  }
  const observedEpoch = parseEpoch(epoch?.value);
  const minimumEpoch = parseEpoch(anchor.minimum_epoch);
  if (observedEpoch === null || minimumEpoch === null) {
    conflictReasons.push("issuer_epoch_invalid");
  } else if (observedEpoch < minimumEpoch) {
    conflictReasons.push("issuer_epoch_rollback_detected");
  }

  const closures = normalizedClosures(bundle?.gap_closures);
  const gapCodes = closures.map((closure) => record(closure)?.gap_code);
  const expectedGaps = [...RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1].sort();
  if (
    gapCodes.length !== expectedGaps.length ||
    new Set(gapCodes).size !== expectedGaps.length ||
    [...gapCodes].sort().some((gap, index) => gap !== expectedGaps[index])
  ) incompleteReasons.push("all_eighteen_gap_closures_required");
  for (const closure of closures) {
    const item = record(closure);
    exactKeys(
      item,
      [
        "gap_code",
        "evidence_identity",
        "evidence_digest",
        "verifier_identity",
        "verifier_version",
      ],
      "gap_closure",
      incompleteReasons,
    );
    if (
      !nonEmpty(item?.gap_code) || !nonEmpty(item?.evidence_identity) ||
      !isSha(item?.evidence_digest) ||
      item?.verifier_identity !==
        RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VERIFIER_V1 ||
      item?.verifier_version !==
        RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1
    ) incompleteReasons.push("gap_closure_invalid");
  }
  if (
    bundle?.finality && record(bundle.finality)?.status !== "final"
  ) incompleteReasons.push("finality_proof_missing");
  if (
    bundle?.completeness && record(bundle.completeness)?.status !== "complete"
  ) incompleteReasons.push("completeness_proof_missing");

  const admissionCore = admission
    ? {
        admission_version: admission.admission_version,
        completion_material_digest: admission.completion_material_digest,
        gap_closure_set_digest: admission.gap_closure_set_digest,
        expected_s2a_taxonomy: admission.expected_s2a_taxonomy,
        verifier_identity: admission.verifier_identity,
        verifier_version: admission.verifier_version,
      }
    : null;
  const admissionEquality: Array<[unknown, unknown, string]> = [
    [admission?.admission_version, RECOMMENDATION_OUTCOME_EVIDENCE_PRE_DOWNSTREAM_ADMISSION_V2, "pre_downstream_admission_version"],
    [admission?.completion_material_digest, sha(completion), "pre_downstream_completion_material_digest"],
    [admission?.gap_closure_set_digest, sha(closures), "pre_downstream_gap_closure_set_digest"],
    [admission?.expected_s2a_taxonomy, "completed", "pre_downstream_expected_s2a_taxonomy"],
    [admission?.verifier_identity, RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_VERIFIER_V2, "pre_downstream_verifier_identity"],
    [admission?.verifier_version, RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2, "pre_downstream_verifier_version"],
    [admission?.admission_digest, sha(admissionCore), "pre_downstream_admission_digest"],
  ];
  for (const [observed, expected, field] of admissionEquality) {
    if (observed !== expected) conflictReasons.push(`${field}_mismatch`);
  }

  if (bundle) {
    const typedBundle = bundle as unknown as RecommendationOutcomeEvidenceBundleV1;
    if (
      isSha(typedBundle.lineage_root_digest) &&
      typedBundle.lineage_root_digest !==
        computeRecommendationOutcomeEvidenceLineageRootV1(typedBundle)
    ) conflictReasons.push("evidence_lineage_root_digest_mismatch");
    if (
      isSha(typedBundle.bundle_digest) &&
      typedBundle.bundle_digest !==
        computeRecommendationOutcomeEvidenceBundleDigestV1(typedBundle)
    ) conflictReasons.push("evidence_bundle_digest_mismatch");
  }
  return {
    shape_reasons: sortedUnique(shapeReasons),
    conflict_reasons: sortedUnique(conflictReasons),
    incomplete_reasons: sortedUnique(incompleteReasons),
    temporal_safe: temporalOrderIsSafe(record(bundle?.instants)),
    registry,
    completion,
    bundle,
  };
}

function validateRequest(value: unknown) {
  const inspected = canonical(value);
  const reasons = [...inspected.reason_codes];
  const request = record(inspected.value);
  exactKeys(
    request,
    [
      "contract_version",
      "issuance_identity",
      "expected_repository_row_identity",
      "expected_evidence_bundle_identity",
    ],
    "issuance_request",
    reasons,
  );
  if (
    request?.contract_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2
  ) reasons.push("issuance_contract_version_mismatch");
  for (
    const key of [
      "issuance_identity",
      "expected_repository_row_identity",
      "expected_evidence_bundle_identity",
    ] as const
  ) {
    if (!nonEmpty(request?.[key])) {
      reasons.push(`issuance_request:${key}:missing`);
    }
  }
  return {
    ok: inspected.ok && reasons.length === 0,
    request:
      request as unknown as RecommendationOutcomeEvidenceIssuanceRequestV2,
    digest: inspected.digest,
    reasons: sortedUnique(reasons),
  };
}

export function issueRecommendationOutcomeEvidenceV2(
  requestValue: unknown,
  dependencies: RecommendationOutcomeEvidenceIssuanceDependenciesV2,
): RecommendationOutcomeEvidenceIssuanceResultV2 {
  if (!dependencies.enabled) return defaultOff("not_read_default_off");
  if (dependencies.kill_switch) return defaultOff("not_read_kill_switch");

  const requestInspection = validateRequest(requestValue);
  if (!requestInspection.ok) {
    return nonIssued(
      "unmappable",
      requestInspection.digest,
      authoritySnapshot("rejected", null),
      emptySections("issuance_request_rejected_before_authority_read"),
      requestInspection.reasons,
    );
  }
  const authority = snapshotAuthority(dependencies.authority);
  if (!authority.ok || !authority.anchor || !authority.callback) {
    return nonIssued(
      "incomplete",
      requestInspection.digest,
      authoritySnapshot("rejected", authority.anchor),
      emptySections("issuer_authority_rejected_before_material_read"),
      authority.reasons,
    );
  }
  const snapshot = authoritySnapshot("verified", authority.anchor);
  let observed: unknown;
  try {
    observed = Reflect.apply(authority.callback, undefined, []);
  } catch {
    return nonIssued(
      "incomplete",
      requestInspection.digest,
      { ...snapshot, disposition: "lookup_failed" },
      emptySections("issuance_material_lookup_failed_sanitized"),
      ["issuance_material_lookup_failed_sanitized"],
    );
  }
  const materialInspection = canonical(observed);
  const materialRecord = record(materialInspection.value);
  if (!materialInspection.ok || !materialRecord) {
    const reasons = sortedUnique([
      "issuance_material_malformed",
      ...materialInspection.reason_codes,
    ]);
    return nonIssued(
      "unmappable",
      requestInspection.digest,
      snapshot,
      malformedMaterialSections(materialInspection.digest, reasons),
      reasons,
    );
  }
  const material = structuredClone(materialRecord);
  const completion = record(material.completion_material);
  const bundle = record(completion?.observed_evidence_bundle);
  if (Array.isArray(bundle?.gap_closures)) {
    bundle.gap_closures = normalizedClosures(bundle.gap_closures);
  }
  const sections = observedSections(material);
  const admission = validatePreDownstream(
    requestInspection.request,
    authority.anchor,
    material,
  );

  // This is the mandatory T-native status boundary. No S.2A request,
  // invocation, or result digest exists above this point.
  if (admission.shape_reasons.length > 0) {
    return nonIssued(
      "unmappable",
      requestInspection.digest,
      snapshot,
      sections,
      admission.shape_reasons,
    );
  }
  if (admission.conflict_reasons.length > 0) {
    return nonIssued(
      "conflicting",
      requestInspection.digest,
      snapshot,
      sections,
      admission.conflict_reasons,
    );
  }
  if (admission.incomplete_reasons.length > 0) {
    return nonIssued(
      "incomplete",
      requestInspection.digest,
      snapshot,
      sections,
      admission.incomplete_reasons,
    );
  }
  if (!admission.temporal_safe) {
    return nonIssued(
      "not_point_in_time_safe",
      requestInspection.digest,
      snapshot,
      sections,
      ["completion_evidence_temporal_order_invalid"],
    );
  }

  const completionRegistry = record(admission.completion?.registry)!;
  const completionEntry = record(completionRegistry.completion_entry)!;
  const activity: RecommendationOutcomeEvidenceDownstreamActivityV2 = {
    ...ZERO_ACTIVITY,
  };
  activity.s2a_request_construction_count += 1;
  dependencies.observe_downstream_step?.("s2a_request_constructed");
  const completionRequest: RecommendationOutcomeEvidenceCompletionRequestV2 = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2,
    completion_identity: String(completionEntry.completion_identity),
    expected_repository_row_identity:
      String(completionEntry.repository_row_identity),
    expected_evidence_bundle_identity:
      String(completionEntry.evidence_bundle_identity),
  };
  activity.s2a_call_count += 1;
  dependencies.observe_downstream_step?.("s2a_called");
  const s2a = completeRepositoryOwnedRecommendationOutcomeEvidenceV2(
    completionRequest,
    {
      enabled: true,
      kill_switch: false,
      authority: {
        authority_version:
          RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V2,
        expected_registry_anchor: {
          registry_identity: String(completionRegistry.registry_identity),
          registry_version:
            RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1,
          registry_digest: sha(completionRegistry),
          expected_trust_root_digest:
            String(completionRegistry.expected_trust_root_digest),
          expected_lineage_root_digest:
            String(admission.bundle?.lineage_root_digest),
        },
        read_completion_material: () =>
          structuredClone(admission.completion),
      },
    },
  );
  if (s2a.taxonomy !== "completed") {
    throw new Error(
      "issued_pre_downstream_admission_diverged_from_s2a_sanitized",
    );
  }
  activity.s2a_result_digest_work_count += 1;
  dependencies.observe_downstream_step?.("s2a_result_digest_bound");

  const registry = admission.registry!;
  const entry = record(registry.issuance_entry)!;
  const issuer = record(registry.issuer)!;
  const epoch = record(registry.epoch)!;
  const preAdmission = record(registry.pre_downstream_admission)!;
  const envelopeCore = {
    envelope_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_ENVELOPE_V2,
    issuance_identity: String(entry.issuance_identity),
    issuer_identity: String(issuer.identity),
    issuer_version: String(issuer.version),
    issuer_epoch: String(epoch.value),
    predecessor_issuance_digest:
      String(epoch.predecessor_issuance_digest),
    repository_row_identity: String(entry.repository_row_identity),
    repository_row_digest: String(entry.repository_row_digest),
    evidence_bundle_identity: String(entry.evidence_bundle_identity),
    evidence_bundle_digest: String(entry.evidence_bundle_digest),
    source_digest: String(record(admission.bundle?.source_snapshot)?.digest),
    bundle_digest: String(admission.bundle?.bundle_digest),
    trust_root_digest: String(registry.trust_root_digest),
    pre_downstream_admission_digest:
      String(preAdmission.admission_digest),
    completion_material:
      structuredClone(
        admission.completion,
      ) as unknown as RecommendationOutcomeEvidenceMaterialV1,
  };
  const envelope = deepFreeze({
    ...envelopeCore,
    issuance_digest: sha(envelopeCore),
  });
  const provenance = buildProvenance(
    normalizedSections(sections, true, []),
  );
  const core = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
    taxonomy: "issued" as const,
    request_digest: requestInspection.digest,
    issuer_authority_snapshot: snapshot,
    observed_input_provenance: provenance,
    downstream_activity: activity,
    issuance_envelope: envelope,
    s2a_completion_result_digest: s2a.result_digest,
    failure_identity_digest: null,
    reason_codes: [] as string[],
    ...RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_BOUNDARY_V2,
  };
  return deepFreeze({
    ...core,
    result_digest: sha(core),
  });
}

export function completionMaterialFromIssuedEvidenceV2(
  result: RecommendationOutcomeEvidenceIssuanceResultV2,
) {
  return result.taxonomy === "issued"
    ? result.issuance_envelope.completion_material
    : null;
}

export function independentlyVerifyRecommendationOutcomeEvidenceIssuanceV2(
  candidate: RecommendationOutcomeEvidenceIssuanceResultV2,
) {
  const inspected = canonical(candidate);
  const value = record(inspected.value);
  if (!inspected.ok || !value) {
    return {
      verified: false,
      reason_codes: inspected.reason_codes,
      rebuilt_result_digest: null,
    };
  }
  const reasons: string[] = [];
  const suppliedDigest = value.result_digest;
  const core = { ...value };
  delete core.result_digest;
  const rebuilt = sha(core);
  if (suppliedDigest !== rebuilt) {
    reasons.push("issuance_result_digest_mismatch");
  }
  const activity = record(value.downstream_activity);
  if (value.taxonomy === "issued") {
    const envelope = record(value.issuance_envelope);
    const envelopeCore = envelope ? { ...envelope } : null;
    const suppliedEnvelopeDigest = envelopeCore?.issuance_digest;
    if (envelopeCore) delete envelopeCore.issuance_digest;
    if (
      !envelope ||
      !isSha(value.s2a_completion_result_digest) ||
      suppliedEnvelopeDigest !== sha(envelopeCore) ||
      activity?.s2a_request_construction_count !== 1 ||
      activity?.s2a_call_count !== 1 ||
      activity?.s2a_result_digest_work_count !== 1
    ) reasons.push("issued_downstream_binding_invalid");
  } else {
    if ("s2a_completion_result_digest" in value) {
      reasons.push("non_issued_s2a_result_field_present");
    }
    if (
      activity?.s2a_request_construction_count !== 0 ||
      activity?.s2a_call_count !== 0 ||
      activity?.s2a_result_digest_work_count !== 0
    ) reasons.push("non_issued_downstream_activity_nonzero");
  }
  return {
    verified: reasons.length === 0,
    reason_codes: sortedUnique(reasons),
    rebuilt_result_digest: rebuilt,
  };
}
