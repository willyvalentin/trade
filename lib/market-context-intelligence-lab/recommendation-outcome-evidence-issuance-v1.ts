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
  type RecommendationOutcomeEvidenceMaterialV1,
} from "./recommendation-outcome-evidence-completion-v1";

export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1 =
  "repository_owned_recommendation_outcome_evidence_issuance_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V1 =
  "repository_owned_recommendation_outcome_evidence_issuer_authority_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V1 =
  "repository_owned_recommendation_outcome_evidence_issuer_registry_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_MATERIAL_V1 =
  "repository_owned_recommendation_outcome_evidence_issuance_material_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_ENVELOPE_V1 =
  "repository_owned_recommendation_outcome_evidence_issuance_envelope_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_PROVENANCE_V1 =
  "repository_owned_recommendation_outcome_evidence_issuance_provenance_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_VERIFIER_V1 =
  "repository_owned_recommendation_outcome_evidence_issuance_verifier_v1" as const;

export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_TAXONOMY_V1 = [
  "issued",
  "incomplete",
  "conflicting",
  "not_point_in_time_safe",
  "unmappable",
] as const;

export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_BOUNDARY_V1 = {
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

export type RecommendationOutcomeEvidenceIssuanceTaxonomyV1 =
  (typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_TAXONOMY_V1)[number];

export type RecommendationOutcomeEvidenceIssuanceRequestV1 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1;
  issuance_identity: string;
  expected_repository_row_identity: string;
  expected_evidence_bundle_identity: string;
};

export type RecommendationOutcomeEvidenceIssuerRegistryV1 = {
  registry_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V1;
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
      typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_VERIFIER_V1;
    verifier_version:
      typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1;
  };
};

export type RecommendationOutcomeEvidenceIssuanceMaterialV1 = {
  material_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_MATERIAL_V1;
  issuer_registry: RecommendationOutcomeEvidenceIssuerRegistryV1;
  completion_material: RecommendationOutcomeEvidenceMaterialV1;
};

export type RecommendationOutcomeEvidenceIssuerAuthorityV1 = {
  authority_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V1;
  expected_issuer_anchor: {
    registry_identity: string;
    registry_version:
      typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V1;
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

export type RecommendationOutcomeEvidenceIssuanceDependenciesV1 = {
  enabled: boolean;
  kill_switch: boolean;
  authority?: RecommendationOutcomeEvidenceIssuerAuthorityV1;
};

export type RecommendationOutcomeEvidenceIssuanceEnvelopeV1 = {
  envelope_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_ENVELOPE_V1;
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
  completion_material: Readonly<RecommendationOutcomeEvidenceMaterialV1>;
  issuance_digest: string;
};

export type RecommendationOutcomeEvidenceObservedIssuanceInputV1 = {
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

export type RecommendationOutcomeEvidenceIssuanceResultV1 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1;
  taxonomy: RecommendationOutcomeEvidenceIssuanceTaxonomyV1;
  request_digest: string;
  issuer_authority_snapshot: {
    authority_version:
      | typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V1
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
  observed_input_provenance: {
    provenance_version:
      typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_PROVENANCE_V1;
    sections: RecommendationOutcomeEvidenceObservedIssuanceInputV1[];
    provenance_digest: string;
  };
  issuance_envelope:
    | Readonly<RecommendationOutcomeEvidenceIssuanceEnvelopeV1>
    | null;
  s2a_completion_result_digest: string | null;
  failure_identity_digest: string | null;
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

type PlainRecord = Record<string, unknown>;

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);
const EMPTY_DIGEST = sha({ canonical_absent: true });
const sortedUnique = (values: string[]) =>
  [...new Set(values)].sort((left, right) =>
    left.localeCompare(right),
  );
const isSha256 = (value: unknown): value is string =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const nonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;
const record = (value: unknown): PlainRecord | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as PlainRecord
    : null;

function exactKeys(
  value: PlainRecord,
  expected: readonly string[],
  namespace: string,
  reasons: string[],
) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (
    actual.length !== wanted.length ||
    actual.some((key, index) => key !== wanted[index])
  ) {
    reasons.push(`${namespace}:closed_schema_mismatch`);
  }
}

function deepFreezeIterative<T>(value: T): T {
  const stack: unknown[] = [value];
  const seen = new WeakSet<object>();
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === null || typeof current !== "object") continue;
    if (seen.has(current)) continue;
    seen.add(current);
    Object.freeze(current);
    for (const child of Object.values(current)) stack.push(child);
  }
  return value;
}

function canonicalObserved(value: unknown) {
  const canonical =
    canonicalizeRecommendationOutcomeEvidencePlainDataV2(value);
  return {
    ok: canonical.ok,
    value: canonical.value,
    digest: canonical.ok ? sha(canonical.value) : canonical.digest,
    reason_codes: canonical.reason_codes,
  };
}

function emptySections(
  reasonCode: string,
): RecommendationOutcomeEvidenceObservedIssuanceInputV1[] {
  return [
    "issuance_material",
    "issuer_registry",
    "completion_registry",
    "repository_row",
    "evidence_bundle",
  ].map((namespace) => ({
    namespace:
      namespace as RecommendationOutcomeEvidenceObservedIssuanceInputV1["namespace"],
    disposition: "absent" as const,
    observed_digest: EMPTY_DIGEST,
    reason_codes: [reasonCode],
  }));
}

function authoritySnapshot(
  disposition:
    RecommendationOutcomeEvidenceIssuanceResultV1["issuer_authority_snapshot"]["disposition"],
  anchor: PlainRecord | null,
) {
  const material = {
    authority_version:
      disposition === "verified"
        ? RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V1
        : null,
    disposition,
    snapshot_digest: sha({
      disposition,
      anchor: anchor ?? { canonical_absent: true },
    }),
    registry_identity:
      nonEmpty(anchor?.registry_identity)
        ? anchor.registry_identity
        : null,
    registry_digest:
      isSha256(anchor?.registry_digest)
        ? anchor.registry_digest
        : null,
    issuer_identity:
      nonEmpty(anchor?.issuer_identity) ? anchor.issuer_identity : null,
    issuer_version:
      nonEmpty(anchor?.issuer_version) ? anchor.issuer_version : null,
    authority_anchor_digest:
      isSha256(anchor?.authority_anchor_digest)
        ? anchor.authority_anchor_digest
        : null,
    trust_root_digest:
      isSha256(anchor?.trust_root_digest)
        ? anchor.trust_root_digest
        : null,
    minimum_epoch:
      typeof anchor?.minimum_epoch === "string"
        ? anchor.minimum_epoch
        : null,
    expected_predecessor_issuance_digest:
      isSha256(anchor?.expected_predecessor_issuance_digest)
        ? anchor.expected_predecessor_issuance_digest
        : null,
  };
  return deepFreezeIterative(material);
}

function terminal(
  taxonomy: RecommendationOutcomeEvidenceIssuanceTaxonomyV1,
  requestDigest: string,
  snapshot: RecommendationOutcomeEvidenceIssuanceResultV1["issuer_authority_snapshot"],
  sections: RecommendationOutcomeEvidenceObservedIssuanceInputV1[],
  reasons: string[],
  envelope: RecommendationOutcomeEvidenceIssuanceEnvelopeV1 | null = null,
  s2aDigest: string | null = null,
) {
  const reasonCodes = sortedUnique(reasons);
  const normalizedSections = sections
    .map((section) => ({
      ...section,
      reason_codes: sortedUnique(section.reason_codes),
    }))
    .sort((left, right) => left.namespace.localeCompare(right.namespace));
  const provenance = {
    provenance_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_PROVENANCE_V1,
    sections: normalizedSections,
    provenance_digest: sha(normalizedSections),
  };
  const failureIdentity = taxonomy === "issued"
    ? null
    : sha({
        request_digest: requestDigest,
        authority_snapshot_digest: snapshot.snapshot_digest,
        provenance_digest: provenance.provenance_digest,
        taxonomy,
        reason_codes: reasonCodes,
      });
  const core = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1,
    taxonomy,
    request_digest: requestDigest,
    issuer_authority_snapshot: snapshot,
    observed_input_provenance: provenance,
    issuance_envelope: envelope,
    s2a_completion_result_digest: s2aDigest,
    failure_identity_digest: failureIdentity,
    reason_codes: reasonCodes,
    ...RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_BOUNDARY_V1,
  };
  return deepFreezeIterative({
    ...core,
    result_digest: sha(core),
  }) as RecommendationOutcomeEvidenceIssuanceResultV1;
}

function defaultOff(
  disposition: "not_read_default_off" | "not_read_kill_switch",
) {
  const reason = disposition === "not_read_default_off"
    ? "issuance_default_off"
    : "issuance_kill_switch_active";
  return terminal(
    "incomplete",
    EMPTY_DIGEST,
    authoritySnapshot(disposition, null),
    emptySections(reason),
    [reason],
  );
}

function snapshotAuthority(
  authority: unknown,
): {
  ok: boolean;
  anchor: PlainRecord | null;
  callback: (() => unknown) | null;
  reasons: string[];
} {
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
  ) {
    reasons.push("issuer_authority:closed_schema_mismatch");
  }
  const versionDescriptor = descriptors.authority_version;
  const anchorDescriptor = descriptors.expected_issuer_anchor;
  const callbackDescriptor = descriptors.read_issuance_material;
  if (
    !versionDescriptor ||
    !("value" in versionDescriptor) ||
    versionDescriptor.value !==
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V1
  ) {
    reasons.push("issuer_authority_version_mismatch");
  }
  if (!anchorDescriptor || !("value" in anchorDescriptor)) {
    reasons.push("issuer_authority_anchor_missing_or_accessor");
  }
  if (
    !callbackDescriptor ||
    !("value" in callbackDescriptor) ||
    typeof callbackDescriptor.value !== "function"
  ) {
    reasons.push("issuer_authority_callback_missing_or_accessor");
  }
  const canonical = canonicalObserved(
    anchorDescriptor && "value" in anchorDescriptor
      ? anchorDescriptor.value
      : null,
  );
  if (!canonical.ok) {
    reasons.push(
      ...canonical.reason_codes.map((code) =>
        `issuer_authority_anchor:${code}`
      ),
    );
  }
  const anchor = record(canonical.value);
  if (anchor) {
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
    if (
      anchor.registry_version !==
        RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V1
    ) {
      reasons.push("issuer_registry_version_mismatch");
    }
    for (
      const key of [
        "registry_digest",
        "authority_anchor_digest",
        "trust_root_digest",
        "expected_predecessor_issuance_digest",
      ] as const
    ) {
      if (!isSha256(anchor[key])) {
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
  } else {
    reasons.push("issuer_authority_anchor_malformed");
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

function observedSections(
  material: PlainRecord | null,
  canonicalMaterial: {
    ok: boolean;
    value: unknown;
    digest: string;
    reason_codes: string[];
  },
): RecommendationOutcomeEvidenceObservedIssuanceInputV1[] {
  const issuerRegistry = material?.issuer_registry;
  const completionMaterial = record(material?.completion_material);
  const completionRegistry = completionMaterial?.registry;
  const row = completionMaterial?.observed_repository_row;
  const bundle = completionMaterial?.observed_evidence_bundle;
  const values: Array<
    [
      RecommendationOutcomeEvidenceObservedIssuanceInputV1["namespace"],
      unknown,
    ]
  > = [
    ["issuance_material", canonicalMaterial.value],
    ["issuer_registry", issuerRegistry],
    ["completion_registry", completionRegistry],
    ["repository_row", row],
    ["evidence_bundle", bundle],
  ];
  return values.map(([namespace, value]) => {
    if (value === undefined || value === null) {
      return {
        namespace,
        disposition: "absent",
        observed_digest: EMPTY_DIGEST,
        reason_codes: [`${namespace}:absent`],
      };
    }
    const canonical = canonicalObserved(value);
    return {
      namespace,
      disposition: canonical.ok ? "present_rejected" : "malformed",
      observed_digest: canonical.digest,
      reason_codes: canonical.ok
        ? [`${namespace}:pending_verification`]
        : canonical.reason_codes,
    };
  });
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

function canonicalizeIssuanceSemanticSets(
  material: PlainRecord,
) {
  const normalized = structuredClone(material);
  const completionMaterial = record(normalized.completion_material);
  const bundle = record(completionMaterial?.observed_evidence_bundle);
  if (Array.isArray(bundle?.gap_closures)) {
    bundle.gap_closures.sort((left, right) => {
      const leftRecord = record(left);
      const rightRecord = record(right);
      const leftKey = [
        leftRecord?.gap_code,
        leftRecord?.evidence_identity,
        leftRecord?.evidence_digest,
      ].map(String).join(":");
      const rightKey = [
        rightRecord?.gap_code,
        rightRecord?.evidence_identity,
        rightRecord?.evidence_digest,
      ].map(String).join(":");
      return leftKey.localeCompare(rightKey);
    });
  }
  return normalized;
}

function validateIssuerRegistry(
  registry: PlainRecord | null,
  anchor: PlainRecord,
  request: RecommendationOutcomeEvidenceIssuanceRequestV1,
  completionMaterial: PlainRecord | null,
) {
  const reasons: string[] = [];
  if (!registry) return ["issuer_registry_malformed"];
  exactKeys(
    registry,
    [
      "registry_version",
      "registry_identity",
      "issuer",
      "epoch",
      "trust_root_digest",
      "issuance_entry",
    ],
    "issuer_registry",
    reasons,
  );
  const issuer = record(registry.issuer);
  const epoch = record(registry.epoch);
  const entry = record(registry.issuance_entry);
  if (!issuer || !epoch || !entry) {
    reasons.push("issuer_registry_nested_schema_malformed");
    return reasons;
  }
  exactKeys(
    issuer,
    ["identity", "version", "authority_anchor_digest"],
    "issuer_registry.issuer",
    reasons,
  );
  exactKeys(
    epoch,
    ["value", "predecessor_issuance_digest"],
    "issuer_registry.epoch",
    reasons,
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
    reasons,
  );
  if (
    registry.registry_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V1
  ) reasons.push("issuer_registry_version_mismatch");
  const equality: Array<[unknown, unknown, string]> = [
    [registry.registry_identity, anchor.registry_identity, "registry_identity"],
    [issuer.identity, anchor.issuer_identity, "issuer_identity"],
    [issuer.version, anchor.issuer_version, "issuer_version"],
    [
      issuer.authority_anchor_digest,
      anchor.authority_anchor_digest,
      "authority_anchor_digest",
    ],
    [registry.trust_root_digest, anchor.trust_root_digest, "trust_root_digest"],
    [
      epoch.predecessor_issuance_digest,
      anchor.expected_predecessor_issuance_digest,
      "predecessor_issuance_digest",
    ],
    [
      entry.issuance_identity,
      request.issuance_identity,
      "issuance_identity",
    ],
    [
      entry.repository_row_identity,
      request.expected_repository_row_identity,
      "repository_row_identity",
    ],
    [
      entry.evidence_bundle_identity,
      request.expected_evidence_bundle_identity,
      "evidence_bundle_identity",
    ],
    [
      entry.verifier_identity,
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_VERIFIER_V1,
      "verifier_identity",
    ],
    [
      entry.verifier_version,
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1,
      "verifier_version",
    ],
  ];
  for (const [observed, expected, field] of equality) {
    if (observed !== expected) reasons.push(`${field}_mismatch`);
  }
  const observedEpoch = parseEpoch(epoch.value);
  const minimumEpoch = parseEpoch(anchor.minimum_epoch);
  if (observedEpoch === null || minimumEpoch === null) {
    reasons.push("issuer_epoch_invalid");
  } else if (observedEpoch < minimumEpoch) {
    reasons.push("issuer_epoch_rollback_detected");
  }
  if (completionMaterial) {
    const completionRegistry = record(completionMaterial.registry);
    const row = completionMaterial.observed_repository_row;
    const bundle = record(completionMaterial.observed_evidence_bundle);
    const rowCanonical = canonicalObserved(row);
    const bundleCanonical = canonicalObserved(bundle);
    const completionRegistryCanonical =
      canonicalObserved(completionRegistry);
    const completionEntry = record(completionRegistry?.completion_entry);
    const materialEquality: Array<[unknown, unknown, string]> = [
      [entry.repository_row_digest, rowCanonical.digest, "repository_row_digest"],
      [entry.evidence_bundle_digest, bundleCanonical.digest, "evidence_bundle_digest"],
      [
        entry.completion_registry_identity,
        completionRegistry?.registry_identity,
        "completion_registry_identity",
      ],
      [
        entry.completion_registry_digest,
        completionRegistryCanonical.digest,
        "completion_registry_digest",
      ],
      [
        entry.repository_row_identity,
        completionEntry?.repository_row_identity,
        "completion_repository_row_identity",
      ],
      [
        entry.evidence_bundle_identity,
        completionEntry?.evidence_bundle_identity,
        "completion_evidence_bundle_identity",
      ],
    ];
    for (const [observed, expected, field] of materialEquality) {
      if (observed !== expected) reasons.push(`${field}_mismatch`);
    }
  }
  return sortedUnique(reasons);
}

function markSections(
  sections: RecommendationOutcomeEvidenceObservedIssuanceInputV1[],
  verified: boolean,
  reasons: string[],
) {
  return sections.map((section) => ({
    ...section,
    disposition:
      section.disposition === "malformed" || section.disposition === "absent"
        ? section.disposition
        : verified ? "verified" as const : "present_rejected" as const,
    reason_codes:
      section.disposition === "malformed" || section.disposition === "absent"
        ? section.reason_codes
        : verified ? [] : reasons,
  }));
}

export function issueRecommendationOutcomeEvidenceV1(
  request: RecommendationOutcomeEvidenceIssuanceRequestV1,
  dependencies: RecommendationOutcomeEvidenceIssuanceDependenciesV1,
): RecommendationOutcomeEvidenceIssuanceResultV1 {
  if (!dependencies.enabled) return defaultOff("not_read_default_off");
  if (dependencies.kill_switch) return defaultOff("not_read_kill_switch");

  const canonicalRequest = canonicalObserved(request);
  const requestRecord = record(canonicalRequest.value);
  const requestReasons = [...canonicalRequest.reason_codes];
  if (requestRecord) {
    exactKeys(
      requestRecord,
      [
        "contract_version",
        "issuance_identity",
        "expected_repository_row_identity",
        "expected_evidence_bundle_identity",
      ],
      "issuance_request",
      requestReasons,
    );
    if (
      requestRecord.contract_version !==
        RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1
    ) requestReasons.push("issuance_contract_version_mismatch");
    for (
      const key of [
        "issuance_identity",
        "expected_repository_row_identity",
        "expected_evidence_bundle_identity",
      ] as const
    ) {
      if (!nonEmpty(requestRecord[key])) {
        requestReasons.push(`issuance_request:${key}:missing`);
      }
    }
  } else {
    requestReasons.push("issuance_request_malformed");
  }
  if (requestReasons.length > 0) {
    return terminal(
      "unmappable",
      canonicalRequest.digest,
      authoritySnapshot("rejected", null),
      emptySections("issuance_request_rejected_before_authority_read"),
      requestReasons,
    );
  }

  const authority = snapshotAuthority(dependencies.authority);
  const snapshot = authoritySnapshot(
    authority.ok ? "verified" : "rejected",
    authority.anchor,
  );
  if (!authority.ok || !authority.anchor || !authority.callback) {
    return terminal(
      "incomplete",
      canonicalRequest.digest,
      snapshot,
      emptySections("issuer_authority_rejected_before_material_read"),
      authority.reasons,
    );
  }

  let rawMaterial: unknown;
  try {
    rawMaterial = authority.callback();
  } catch {
    return terminal(
      "incomplete",
      canonicalRequest.digest,
      authoritySnapshot("lookup_failed", authority.anchor),
      emptySections("issuance_material_lookup_failed_sanitized"),
      ["issuance_material_lookup_failed_sanitized"],
    );
  }
  const canonicalMaterial = canonicalObserved(rawMaterial);
  const observedMaterial = record(canonicalMaterial.value);
  if (!canonicalMaterial.ok || !observedMaterial) {
    const sections = observedSections(observedMaterial, canonicalMaterial);
    const reasons = [
      "issuance_material_malformed",
      ...canonicalMaterial.reason_codes,
    ];
    return terminal(
      "unmappable",
      canonicalRequest.digest,
      snapshot,
      markSections(sections, false, reasons),
      reasons,
    );
  }
  const material = canonicalizeIssuanceSemanticSets(observedMaterial);
  const normalizedCanonicalMaterial = {
    ...canonicalMaterial,
    value: material,
    digest: sha(material),
  };
  let sections = observedSections(
    material,
    normalizedCanonicalMaterial,
  );
  const reasons: string[] = [];
  exactKeys(
    material,
    ["material_version", "issuer_registry", "completion_material"],
    "issuance_material",
    reasons,
  );
  if (
    material.material_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_MATERIAL_V1
  ) reasons.push("issuance_material_version_mismatch");
  const registry = record(material.issuer_registry);
  const completionMaterial = record(material.completion_material);
  reasons.push(
    ...validateIssuerRegistry(
      registry,
      authority.anchor,
      request,
      completionMaterial,
    ),
  );
  if (sha(registry) !== authority.anchor.registry_digest) {
    reasons.push("issuer_registry_digest_mismatch");
  }
  if (
    !completionMaterial ||
    completionMaterial.material_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_MATERIAL_V1
  ) reasons.push("completion_material_version_mismatch");
  const completionRegistry = record(completionMaterial?.registry);
  if (
    !completionRegistry ||
    completionRegistry.registry_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1
  ) reasons.push("completion_registry_version_mismatch");
  if (reasons.length > 0) {
    sections = markSections(sections, false, reasons);
    return terminal(
      "conflicting",
      canonicalRequest.digest,
      snapshot,
      sections,
      reasons,
    );
  }

  const completionEntry = record(completionRegistry!.completion_entry)!;
  const completionRequest: RecommendationOutcomeEvidenceCompletionRequestV2 = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2,
    completion_identity: String(completionEntry.completion_identity),
    expected_repository_row_identity:
      String(completionEntry.repository_row_identity),
    expected_evidence_bundle_identity:
      String(completionEntry.evidence_bundle_identity),
  };
  const s2a = completeRepositoryOwnedRecommendationOutcomeEvidenceV2(
    completionRequest,
    {
      enabled: true,
      kill_switch: false,
      authority: {
        authority_version:
          RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V2,
        expected_registry_anchor: {
          registry_identity: String(completionRegistry!.registry_identity),
          registry_version:
            RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1,
          registry_digest: sha(completionRegistry),
          expected_trust_root_digest:
            String(completionRegistry!.expected_trust_root_digest),
          expected_lineage_root_digest:
            String(
              record(
                completionMaterial!.observed_evidence_bundle,
              )?.lineage_root_digest,
            ),
        },
        read_completion_material: () =>
          structuredClone(completionMaterial),
      },
    },
  );
  if (s2a.taxonomy !== "completed") {
    sections = markSections(sections, false, s2a.reason_codes);
    const mappedTaxonomy =
      s2a.taxonomy === "not_point_in_time_safe"
        ? "not_point_in_time_safe"
        : s2a.taxonomy === "conflicting"
          ? "conflicting"
          : s2a.taxonomy === "unmappable"
            ? "unmappable"
            : "incomplete";
    return terminal(
      mappedTaxonomy,
      canonicalRequest.digest,
      snapshot,
      sections,
      s2a.reason_codes,
      null,
      s2a.result_digest,
    );
  }

  const entry = record(registry!.issuance_entry)!;
  const issuer = record(registry!.issuer)!;
  const epoch = record(registry!.epoch)!;
  const bundle = record(completionMaterial!.observed_evidence_bundle)!;
  const envelopeCore = {
    envelope_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_ENVELOPE_V1,
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
    source_digest: String(bundle.source_snapshot &&
      record(bundle.source_snapshot)?.digest),
    bundle_digest: String(bundle.bundle_digest),
    trust_root_digest: String(registry!.trust_root_digest),
    completion_material:
      structuredClone(
        completionMaterial,
      ) as unknown as RecommendationOutcomeEvidenceMaterialV1,
  };
  const envelope: RecommendationOutcomeEvidenceIssuanceEnvelopeV1 = {
    ...envelopeCore,
    issuance_digest: sha(envelopeCore),
  };
  sections = markSections(sections, true, []);
  return terminal(
    "issued",
    canonicalRequest.digest,
    snapshot,
    sections,
    [],
    deepFreezeIterative(envelope),
    s2a.result_digest,
  );
}

export function completionMaterialFromIssuedEvidenceV1(
  result: RecommendationOutcomeEvidenceIssuanceResultV1,
) {
  if (result.taxonomy !== "issued" || !result.issuance_envelope) {
    return null;
  }
  return result.issuance_envelope.completion_material;
}

export function independentlyVerifyRecommendationOutcomeEvidenceIssuanceV1(
  result: RecommendationOutcomeEvidenceIssuanceResultV1,
) {
  const canonical = canonicalObserved(result);
  if (!canonical.ok) {
    return {
      verified: false,
      reason_codes: canonical.reason_codes,
      rebuilt_result_digest: null,
    };
  }
  const value = record(canonical.value);
  if (!value) {
    return {
      verified: false,
      reason_codes: ["issuance_result_malformed"],
      rebuilt_result_digest: null,
    };
  }
  const suppliedDigest = value.result_digest;
  const core = { ...value };
  delete core.result_digest;
  const rebuilt = sha(core);
  const reasons: string[] = [];
  if (suppliedDigest !== rebuilt) {
    reasons.push("issuance_result_digest_mismatch");
  }
  const envelope = record(value.issuance_envelope);
  if (value.taxonomy === "issued") {
    if (!envelope) {
      reasons.push("issued_envelope_missing");
    } else {
      const issuanceDigest = envelope.issuance_digest;
      const envelopeCore = { ...envelope };
      delete envelopeCore.issuance_digest;
      if (issuanceDigest !== sha(envelopeCore)) {
        reasons.push("issuance_envelope_digest_mismatch");
      }
    }
  } else if (envelope !== null) {
    reasons.push("non_issued_envelope_present");
  }
  return {
    verified: reasons.length === 0,
    reason_codes: sortedUnique(reasons),
    rebuilt_result_digest: rebuilt,
  };
}
