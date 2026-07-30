import {
  marketContextDiagnosticContextSha256V1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V2,
  type RecommendationOutcomeEvidenceIssuerAuthorityV2,
} from "./recommendation-outcome-evidence-issuance-v2";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3,
  canonicalizeRecommendationOutcomeEvidencePreAdmissionV3,
  classifyRecommendationOutcomeEvidencePreAdmissionV3,
  issueRecommendationOutcomeEvidenceV3,
  type RecommendationOutcomeEvidenceIssuanceRequestV3,
  type RecommendationOutcomeEvidenceIssuanceResultV3,
} from "./recommendation-outcome-evidence-issuance-v3";

export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4 =
  "repository_owned_recommendation_outcome_evidence_issuance_v4" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_VERIFIED_SNAPSHOT_V4 =
  "repository_owned_recommendation_outcome_evidence_verified_snapshot_v4" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_VERIFIED_SNAPSHOT_AUDIT_V4 =
  "repository_owned_recommendation_outcome_evidence_verified_snapshot_audit_v4" as const;

type NonIssued = Exclude<
  RecommendationOutcomeEvidenceIssuanceResultV3["taxonomy"],
  "issued"
>;
type Taxonomy = "issued" | NonIssued;
type PlainRecord = Record<string, unknown>;
type IssuerAnchor =
  RecommendationOutcomeEvidenceIssuerAuthorityV2["expected_issuer_anchor"];

export type RecommendationOutcomeEvidenceIssuanceRequestV4 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4;
  issuance_identity: string;
  expected_repository_row_identity: string;
  expected_evidence_bundle_identity: string;
};

export type RecommendationOutcomeEvidenceIssuanceDependenciesV4 = {
  enabled: boolean;
  kill_switch: boolean;
  authority?: RecommendationOutcomeEvidenceIssuerAuthorityV2;
  observe_downstream_step?: (step:
    | "s2a_request_constructed"
    | "s2a_called"
    | "s2a_result_digest_bound") => void;
};

export type RecommendationOutcomeEvidenceSnapshotAuditV4 = {
  audit_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_VERIFIED_SNAPSHOT_AUDIT_V4;
  caller_request_snapshot_count: 0 | 1;
  caller_authority_snapshot_count: 0 | 1;
  caller_material_read_count: 0 | 1;
  caller_input_reread_count: 0;
  request_snapshot_digest: string;
  authority_snapshot_digest: string;
  material_snapshot_digest: string;
  snapshot_bundle_digest: string;
  request_snapshot_deep_frozen: boolean;
  authority_snapshot_deep_frozen: boolean;
  material_snapshot_deep_frozen: boolean;
  snapshot_input_separated: boolean;
  verified_snapshot_only_downstream: true;
};

export type RecommendationOutcomeEvidenceIssuanceResultV4 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4;
  taxonomy: Taxonomy;
  snapshot_audit: RecommendationOutcomeEvidenceSnapshotAuditV4;
  v3_pre_admission_digest: string | null;
  predecessor_result: RecommendationOutcomeEvidenceIssuanceResultV3 | null;
  s2a_request_constructed: boolean;
  s2a_called: boolean;
  downstream_digest_work: boolean;
  downstream_steps: string[];
  failure_identity_digest: string | null;
  reason_codes: string[];
  s2a_completion_result_digest?: string;
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

type VerifiedSnapshot = {
  snapshot_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_VERIFIED_SNAPSHOT_V4;
  request: Readonly<RecommendationOutcomeEvidenceIssuanceRequestV4>;
  request_v3: Readonly<RecommendationOutcomeEvidenceIssuanceRequestV3>;
  authority_anchor: Readonly<IssuerAnchor>;
  material: Readonly<PlainRecord>;
  audit: RecommendationOutcomeEvidenceSnapshotAuditV4;
};

type SnapshotResult =
  | { ok: true; snapshot: Readonly<VerifiedSnapshot>; reason_codes: [] }
  | {
      ok: false;
      taxonomy: NonIssued;
      audit: RecommendationOutcomeEvidenceSnapshotAuditV4;
      reason_codes: string[];
    };

const BOUNDARY = {
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

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);
const sortedUnique = (values: string[]) =>
  [...new Set(values)].sort((left, right) => left.localeCompare(right));
const nonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;
const isSha = (value: unknown): value is string =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const absentDigest = (namespace: string) =>
  sha({ namespace, disposition: "absent" });

function deepFreeze<T>(value: T): T {
  const stack: unknown[] = [value];
  const seen = new WeakSet<object>();
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === null || typeof current !== "object" || seen.has(current)) {
      continue;
    }
    seen.add(current);
    Object.freeze(current);
    for (const child of Object.values(current)) stack.push(child);
  }
  return value;
}

function isDeepFrozen(value: unknown): boolean {
  const stack: unknown[] = [value];
  const seen = new WeakSet<object>();
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === null || typeof current !== "object" || seen.has(current)) {
      continue;
    }
    seen.add(current);
    if (!Object.isFrozen(current)) return false;
    for (const child of Object.values(current)) stack.push(child);
  }
  return true;
}

function isPlainRecord(value: unknown): value is PlainRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(
  value: PlainRecord,
  expectedKeys: readonly string[],
  namespace: string,
) {
  const expected = [...expectedKeys].sort();
  const observed = Object.keys(value).sort();
  return observed.length === expected.length &&
      observed.every((key, index) => key === expected[index])
    ? []
    : [`${namespace}:closed_schema_violation`];
}

function emptyAudit(): RecommendationOutcomeEvidenceSnapshotAuditV4 {
  const request = absentDigest("caller_request");
  const authority = absentDigest("caller_authority");
  const material = absentDigest("caller_material");
  return deepFreeze({
    audit_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_VERIFIED_SNAPSHOT_AUDIT_V4,
    caller_request_snapshot_count: 0,
    caller_authority_snapshot_count: 0,
    caller_material_read_count: 0,
    caller_input_reread_count: 0,
    request_snapshot_digest: request,
    authority_snapshot_digest: authority,
    material_snapshot_digest: material,
    snapshot_bundle_digest: sha({
      request_snapshot_digest: request,
      authority_snapshot_digest: authority,
      material_snapshot_digest: material,
    }),
    request_snapshot_deep_frozen: false,
    authority_snapshot_deep_frozen: false,
    material_snapshot_deep_frozen: false,
    snapshot_input_separated: false,
    verified_snapshot_only_downstream: true,
  });
}

function audit(
  request: unknown,
  authority: unknown,
  material: unknown,
  counts: {
    request: 0 | 1;
    authority: 0 | 1;
    material: 0 | 1;
  },
): RecommendationOutcomeEvidenceSnapshotAuditV4 {
  const requestDigest = counts.request === 1
    ? sha(request)
    : absentDigest("caller_request");
  const authorityDigest = counts.authority === 1
    ? sha(authority)
    : absentDigest("caller_authority");
  const materialDigest = counts.material === 1
    ? sha(material)
    : absentDigest("caller_material");
  const output = {
    audit_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_VERIFIED_SNAPSHOT_AUDIT_V4,
    caller_request_snapshot_count: counts.request,
    caller_authority_snapshot_count: counts.authority,
    caller_material_read_count: counts.material,
    caller_input_reread_count: 0 as const,
    request_snapshot_digest: requestDigest,
    authority_snapshot_digest: authorityDigest,
    material_snapshot_digest: materialDigest,
    snapshot_bundle_digest: sha({
      snapshot_version:
        RECOMMENDATION_OUTCOME_EVIDENCE_VERIFIED_SNAPSHOT_V4,
      request_snapshot_digest: requestDigest,
      authority_snapshot_digest: authorityDigest,
      material_snapshot_digest: materialDigest,
    }),
    request_snapshot_deep_frozen: counts.request === 1 &&
      isDeepFrozen(request),
    authority_snapshot_deep_frozen: counts.authority === 1 &&
      isDeepFrozen(authority),
    material_snapshot_deep_frozen: counts.material === 1 &&
      isDeepFrozen(material),
    snapshot_input_separated: counts.request === 1 &&
      counts.authority === 1 &&
      counts.material === 1,
    verified_snapshot_only_downstream: true as const,
  };
  return deepFreeze(output);
}

function snapshotRequest(input: unknown) {
  const canonical =
    canonicalizeRecommendationOutcomeEvidencePreAdmissionV3(input);
  const reasons = canonical.ok ? [] : [...canonical.reason_codes];
  if (!isPlainRecord(canonical.value)) {
    reasons.push("issuance_request:object_required");
    return { request: null, reasons: sortedUnique(reasons) };
  }
  reasons.push(...exactKeys(
    canonical.value,
    [
      "contract_version",
      "issuance_identity",
      "expected_repository_row_identity",
      "expected_evidence_bundle_identity",
    ],
    "issuance_request",
  ));
  if (
    canonical.value.contract_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4
  ) reasons.push("issuance_contract_version_mismatch");
  for (
    const key of [
      "issuance_identity",
      "expected_repository_row_identity",
      "expected_evidence_bundle_identity",
    ] as const
  ) {
    if (!nonEmpty(canonical.value[key])) {
      reasons.push(`issuance_request:${key}:missing`);
    }
  }
  const snapshot = deepFreeze(
    canonical.value as RecommendationOutcomeEvidenceIssuanceRequestV4,
  );
  return {
    request: reasons.length === 0 ? snapshot : null,
    observed: snapshot,
    reasons: sortedUnique(reasons),
  };
}

function snapshotAuthority(input: unknown) {
  const reasons: string[] = [];
  if (input === null || typeof input !== "object") {
    return {
      anchor: null,
      callback: null,
      observed: null,
      reasons: ["issuer_authority_missing"],
    };
  }
  let descriptors: PropertyDescriptorMap;
  let prototype: object | null;
  try {
    descriptors = Object.getOwnPropertyDescriptors(input);
    prototype = Object.getPrototypeOf(input);
  } catch {
    return {
      anchor: null,
      callback: null,
      observed: null,
      reasons: ["issuer_authority_introspection_failed_sanitized"],
    };
  }
  if (prototype !== Object.prototype && prototype !== null) {
    reasons.push("issuer_authority_plain_object_required");
  }
  const expected = [
    "authority_version",
    "expected_issuer_anchor",
    "read_issuance_material",
  ].sort();
  const keys = Object.keys(descriptors).sort();
  if (
    keys.length !== expected.length ||
    keys.some((key, index) => key !== expected[index])
  ) reasons.push("issuer_authority_closed_schema_violation");
  for (const key of expected) {
    if (!descriptors[key] || !("value" in descriptors[key])) {
      reasons.push(`issuer_authority_accessor_rejected:${key}`);
    }
  }
  const version = "value" in (descriptors.authority_version ?? {})
    ? descriptors.authority_version.value
    : null;
  const callback = "value" in (descriptors.read_issuance_material ?? {})
    ? descriptors.read_issuance_material.value
    : null;
  const anchorInput = "value" in (descriptors.expected_issuer_anchor ?? {})
    ? descriptors.expected_issuer_anchor.value
    : null;
  const canonical =
    canonicalizeRecommendationOutcomeEvidencePreAdmissionV3(anchorInput);
  if (!canonical.ok) reasons.push(...canonical.reason_codes);
  if (!isPlainRecord(canonical.value)) {
    reasons.push("issuer_authority_anchor:object_required");
    return {
      anchor: null,
      callback: null,
      observed: canonical.value,
      reasons: sortedUnique(reasons),
    };
  }
  reasons.push(...exactKeys(
    canonical.value,
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
  ));
  if (
    version !== RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V2 ||
    canonical.value.registry_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V2 ||
    typeof callback !== "function" ||
    !nonEmpty(canonical.value.registry_identity) ||
    !nonEmpty(canonical.value.issuer_identity) ||
    !nonEmpty(canonical.value.issuer_version) ||
    !isSha(canonical.value.registry_digest) ||
    !isSha(canonical.value.authority_anchor_digest) ||
    !isSha(canonical.value.trust_root_digest) ||
    !isSha(canonical.value.expected_predecessor_issuance_digest) ||
    typeof canonical.value.minimum_epoch !== "string"
  ) reasons.push("issuer_authority_invalid");
  const anchor = deepFreeze(canonical.value as IssuerAnchor);
  return {
    anchor: reasons.length === 0 ? anchor : null,
    callback: reasons.length === 0 ? callback as () => unknown : null,
    observed: anchor,
    reasons: sortedUnique(reasons),
  };
}

function snapshotInputs(
  requestInput: unknown,
  authorityInput: unknown,
): SnapshotResult {
  const requestSnapshot = snapshotRequest(requestInput);
  if (!requestSnapshot.request) {
    return {
      ok: false,
      taxonomy: "unmappable",
      audit: audit(
        requestSnapshot.observed ?? null,
        null,
        null,
        { request: 1, authority: 0, material: 0 },
      ),
      reason_codes: requestSnapshot.reasons,
    };
  }
  const authoritySnapshot = snapshotAuthority(authorityInput);
  if (!authoritySnapshot.anchor || !authoritySnapshot.callback) {
    return {
      ok: false,
      taxonomy: "incomplete",
      audit: audit(
        requestSnapshot.request,
        authoritySnapshot.observed,
        null,
        { request: 1, authority: 1, material: 0 },
      ),
      reason_codes: authoritySnapshot.reasons,
    };
  }
  let observedMaterial: unknown;
  try {
    observedMaterial = Reflect.apply(
      authoritySnapshot.callback,
      undefined,
      [],
    );
  } catch {
    return {
      ok: false,
      taxonomy: "incomplete",
      audit: audit(
        requestSnapshot.request,
        authoritySnapshot.anchor,
        null,
        { request: 1, authority: 1, material: 1 },
      ),
      reason_codes: ["issuance_material_lookup_failed_sanitized"],
    };
  }
  const canonicalMaterial =
    canonicalizeRecommendationOutcomeEvidencePreAdmissionV3(observedMaterial);
  const material = isPlainRecord(canonicalMaterial.value)
    ? deepFreeze(canonicalMaterial.value)
    : null;
  if (!canonicalMaterial.ok || !material) {
    return {
      ok: false,
      taxonomy: "unmappable",
      audit: audit(
        requestSnapshot.request,
        authoritySnapshot.anchor,
        material ?? canonicalMaterial.value,
        { request: 1, authority: 1, material: 1 },
      ),
      reason_codes: sortedUnique([
        ...(canonicalMaterial.ok ? [] : canonicalMaterial.reason_codes),
        ...(material ? [] : ["issuance_material:object_required"]),
      ]),
    };
  }
  const requestV3 = deepFreeze({
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3,
    issuance_identity: requestSnapshot.request.issuance_identity,
    expected_repository_row_identity:
      requestSnapshot.request.expected_repository_row_identity,
    expected_evidence_bundle_identity:
      requestSnapshot.request.expected_evidence_bundle_identity,
  } satisfies RecommendationOutcomeEvidenceIssuanceRequestV3);
  const snapshotCore = {
    snapshot_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_VERIFIED_SNAPSHOT_V4,
    request: requestSnapshot.request,
    request_v3: requestV3,
    authority_anchor: authoritySnapshot.anchor,
    material,
  };
  const snapshotAudit = audit(
    requestSnapshot.request,
    authoritySnapshot.anchor,
    material,
    { request: 1, authority: 1, material: 1 },
  );
  return {
    ok: true,
    snapshot: deepFreeze({
      ...snapshotCore,
      audit: snapshotAudit,
    }),
    reason_codes: [],
  };
}

function terminal(
  taxonomy: Taxonomy,
  snapshotAudit: RecommendationOutcomeEvidenceSnapshotAuditV4,
  reasonCodes: string[],
  predecessor: RecommendationOutcomeEvidenceIssuanceResultV3 | null,
  v3PreAdmissionDigest: string | null,
  downstreamSteps: string[],
): RecommendationOutcomeEvidenceIssuanceResultV4 {
  const reasons = sortedUnique(reasonCodes);
  const failureIdentity = taxonomy === "issued"
    ? null
    : sha({
        contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
        taxonomy,
        snapshot_bundle_digest: snapshotAudit.snapshot_bundle_digest,
        v3_pre_admission_digest: v3PreAdmissionDigest,
        reason_codes: reasons,
      });
  const core = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
    taxonomy,
    snapshot_audit: snapshotAudit,
    v3_pre_admission_digest: v3PreAdmissionDigest,
    predecessor_result: predecessor,
    s2a_request_constructed:
      predecessor?.s2a_request_constructed === true,
    s2a_called: predecessor?.s2a_called === true,
    downstream_digest_work:
      predecessor?.downstream_digest_work === true,
    downstream_steps: [...downstreamSteps],
    failure_identity_digest: failureIdentity,
    reason_codes: reasons,
    ...BOUNDARY,
  };
  const withDigest = taxonomy === "issued" &&
      predecessor?.taxonomy === "issued" &&
      predecessor.s2a_completion_result_digest
    ? {
        ...core,
        s2a_completion_result_digest:
          predecessor.s2a_completion_result_digest,
      }
    : core;
  return deepFreeze({
    ...withDigest,
    result_digest: sha(withDigest),
  }) as RecommendationOutcomeEvidenceIssuanceResultV4;
}

function internalAuthority(snapshot: Readonly<VerifiedSnapshot>) {
  return {
    authority_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V2,
    expected_issuer_anchor: structuredClone(snapshot.authority_anchor),
    read_issuance_material: () => structuredClone(snapshot.material),
  } satisfies RecommendationOutcomeEvidenceIssuerAuthorityV2;
}

export function issueRecommendationOutcomeEvidenceV4(
  requestInput: unknown,
  dependencies: RecommendationOutcomeEvidenceIssuanceDependenciesV4,
): RecommendationOutcomeEvidenceIssuanceResultV4 {
  if (!dependencies.enabled) {
    return terminal(
      "incomplete",
      emptyAudit(),
      ["issuance_v4_default_off"],
      null,
      null,
      [],
    );
  }
  if (dependencies.kill_switch) {
    return terminal(
      "incomplete",
      emptyAudit(),
      ["issuance_v4_kill_switch_active"],
      null,
      null,
      [],
    );
  }

  const callerAuthority = dependencies.authority;
  const snapshotResult = snapshotInputs(requestInput, callerAuthority);
  if (!snapshotResult.ok) {
    return terminal(
      snapshotResult.taxonomy,
      snapshotResult.audit,
      snapshotResult.reason_codes,
      null,
      null,
      [],
    );
  }

  const snapshot = snapshotResult.snapshot;
  const admission = classifyRecommendationOutcomeEvidencePreAdmissionV3(
    snapshot.request_v3,
    internalAuthority(snapshot),
  );
  if (admission.taxonomy !== "issued") {
    return terminal(
      admission.taxonomy,
      snapshot.audit,
      admission.reason_codes,
      null,
      admission.admission_digest,
      [],
    );
  }

  const downstreamSteps: string[] = [];
  const externalObserver = dependencies.observe_downstream_step;
  const predecessor = issueRecommendationOutcomeEvidenceV3(
    snapshot.request_v3,
    {
      enabled: true,
      kill_switch: false,
      authority: internalAuthority(snapshot),
      observe_downstream_step: (step) => {
        downstreamSteps.push(step);
        externalObserver?.(step);
      },
    },
  );
  if (predecessor.taxonomy !== "issued") {
    return terminal(
      "conflicting",
      snapshot.audit,
      ["verified_snapshot_v3_divergence_sanitized"],
      predecessor,
      admission.admission_digest,
      downstreamSteps,
    );
  }
  return terminal(
    "issued",
    snapshot.audit,
    [],
    predecessor,
    admission.admission_digest,
    downstreamSteps,
  );
}

export function computeRecommendationOutcomeEvidenceIssuanceResultDigestV4(
  result: RecommendationOutcomeEvidenceIssuanceResultV4,
) {
  const core = { ...result } as Partial<
    RecommendationOutcomeEvidenceIssuanceResultV4
  >;
  delete core.result_digest;
  return sha(core);
}

export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4_PREDECESSOR =
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4_S2A_PREDECESSOR =
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2;
