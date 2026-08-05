import {
  marketContextDiagnosticContextSha256V1,
  stableMarketContextDiagnosticContextJsonV1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BUNDLE_V1,
  RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
  type RecommendationOutcomeEvidenceBundleV1,
} from "./recommendation-outcome-evidence-completion-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1,
} from "./recommendation-outcome-evidence-issuance-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V2,
  type RecommendationOutcomeEvidenceIssuanceMaterialV2,
  type RecommendationOutcomeEvidenceIssuerAuthorityV2,
} from "./recommendation-outcome-evidence-issuance-v2";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3,
  canonicalizeRecommendationOutcomeEvidencePreAdmissionV3,
} from "./recommendation-outcome-evidence-issuance-v3";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
  computeRecommendationOutcomeEvidenceIssuanceResultDigestV4,
  issueRecommendationOutcomeEvidenceV4,
  type RecommendationOutcomeEvidenceIssuanceRequestV4,
  type RecommendationOutcomeEvidenceIssuanceResultV4,
} from "./recommendation-outcome-evidence-issuance-v4";

export const RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V1 =
  "repository_owned_recommendation_outcome_evidence_admission_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_ENVELOPE_V1 =
  "repository_owned_recommendation_outcome_evidence_admission_envelope_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_AUTHORITY_V1 =
  "repository_owned_recommendation_outcome_evidence_admission_authority_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_SNAPSHOT_V1 =
  "repository_owned_recommendation_outcome_evidence_admission_snapshot_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_VERIFIER_V1 =
  "repository_owned_recommendation_outcome_evidence_admission_verifier_v1" as const;

export const RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_TAXONOMY_V1 = [
  "admitted",
  "rejected",
  "conflicting",
  "not_point_in_time_safe",
  "unmappable",
] as const;

export type RecommendationOutcomeEvidenceAdmissionTaxonomyV1 =
  (typeof RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_TAXONOMY_V1)[number];

type PlainRecord = Record<string, unknown>;
type IssuerAnchor =
  RecommendationOutcomeEvidenceIssuerAuthorityV2["expected_issuer_anchor"];

export type RecommendationOutcomeEvidenceAdmissionEnvelopeV1 = {
  envelope_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_ENVELOPE_V1;
  evidence_identity: string;
  t_v4_contract_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4;
  t_v4_request: RecommendationOutcomeEvidenceIssuanceRequestV4;
  t_v4_authority_anchor: IssuerAnchor;
  t_v4_material: RecommendationOutcomeEvidenceIssuanceMaterialV2;
  t_v4_result: RecommendationOutcomeEvidenceIssuanceResultV4;
};

export type RecommendationOutcomeEvidenceAdmissionAuthorityV1 = {
  authority_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_AUTHORITY_V1;
  registry_identity: string;
  registry_version: string;
  registry_digest: string;
  issuer_identity: string;
  issuer_version: string;
  authority_anchor_digest: string;
  trust_root_digest: string;
  minimum_epoch: string;
  expected_predecessor_issuance_digest: string;
};

export type RecommendationOutcomeEvidenceAdmissionDependenciesV1 = {
  enabled: boolean;
  kill_switch: boolean;
  trusted_authority_json?: string;
};

export type RecommendationOutcomeEvidenceAdmissionAuditV1 = {
  snapshot_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_SNAPSHOT_V1;
  candidate_input_read_count: 0 | 1;
  candidate_descriptor_pass_count: 0 | 1;
  candidate_getter_execution_count: 0;
  candidate_proxy_hook_execution_count: 0;
  candidate_callback_execution_count: 0;
  trusted_authority_read_count: 0 | 1;
  caller_input_reread_count: 0;
  candidate_snapshot_deep_frozen: boolean;
  candidate_snapshot_digest: string;
  trusted_authority_snapshot_digest: string;
  verified_snapshot_only_downstream: true;
};

export type RecommendationOutcomeEvidenceAdmissionResultV1 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V1;
  taxonomy: RecommendationOutcomeEvidenceAdmissionTaxonomyV1;
  evidence_identity: string | null;
  audit: RecommendationOutcomeEvidenceAdmissionAuditV1;
  t_v4_result_digest: string | null;
  eighteen_gap_binding_digest: string | null;
  admitted_snapshot_digest: string | null;
  admission_request_constructed: boolean;
  t_v4_rebuild_called: boolean;
  downstream_digest_work: boolean;
  failure_identity_digest: string | null;
  reason_codes: string[];
  diagnostic_only: true;
  shadow_only: true;
  read_only: true;
  real_outcome_source_accessed: false;
  official_ohlcv: false;
  canonical_performance_eligible: false;
  automatic_model_input_allowed: false;
  automatic_training_allowed: false;
  automatic_promotion_allowed: false;
  causal_claimed: false;
  live_ranking_effect: false;
  result_digest: string;
};

const BOUNDARY = {
  diagnostic_only: true,
  shadow_only: true,
  read_only: true,
  real_outcome_source_accessed: false,
  official_ohlcv: false,
  canonical_performance_eligible: false,
  automatic_model_input_allowed: false,
  automatic_training_allowed: false,
  automatic_promotion_allowed: false,
  causal_claimed: false,
  live_ranking_effect: false,
} as const;

const MAX_CANDIDATE_JSON_BYTES = 1_500_000;
const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);
const stable = (value: unknown) =>
  stableMarketContextDiagnosticContextJsonV1(value);
const sortedUnique = (values: string[]) =>
  [...new Set(values)].sort((left, right) => left.localeCompare(right));
const isRecord = (value: unknown): value is PlainRecord =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const isSha = (value: unknown): value is string =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const nonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;
const absentDigest = (namespace: string) =>
  sha({ namespace, disposition: "absent" });

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

function isDeepFrozen(value: unknown) {
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

function emptyAudit(): RecommendationOutcomeEvidenceAdmissionAuditV1 {
  return deepFreeze({
    snapshot_version: RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_SNAPSHOT_V1,
    candidate_input_read_count: 0,
    candidate_descriptor_pass_count: 0,
    candidate_getter_execution_count: 0,
    candidate_proxy_hook_execution_count: 0,
    candidate_callback_execution_count: 0,
    trusted_authority_read_count: 0,
    caller_input_reread_count: 0,
    candidate_snapshot_deep_frozen: false,
    candidate_snapshot_digest: absentDigest("admission_candidate"),
    trusted_authority_snapshot_digest: absentDigest(
      "admission_trusted_authority",
    ),
    verified_snapshot_only_downstream: true,
  });
}

function observedAudit(
  candidate: unknown,
  trustedAuthority: unknown,
  authorityRead: 0 | 1,
): RecommendationOutcomeEvidenceAdmissionAuditV1 {
  return deepFreeze({
    snapshot_version: RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_SNAPSHOT_V1,
    candidate_input_read_count: 1,
    candidate_descriptor_pass_count: isRecord(candidate) ? 1 : 0,
    candidate_getter_execution_count: 0,
    candidate_proxy_hook_execution_count: 0,
    candidate_callback_execution_count: 0,
    trusted_authority_read_count: authorityRead,
    caller_input_reread_count: 0,
    candidate_snapshot_deep_frozen: isDeepFrozen(candidate),
    candidate_snapshot_digest: sha(candidate),
    trusted_authority_snapshot_digest: authorityRead === 1
      ? sha(trustedAuthority)
      : absentDigest("admission_trusted_authority"),
    verified_snapshot_only_downstream: true,
  });
}

function terminal(
  taxonomy: RecommendationOutcomeEvidenceAdmissionTaxonomyV1,
  audit: RecommendationOutcomeEvidenceAdmissionAuditV1,
  reasons: string[],
  details: Partial<Pick<
    RecommendationOutcomeEvidenceAdmissionResultV1,
    | "evidence_identity"
    | "t_v4_result_digest"
    | "eighteen_gap_binding_digest"
    | "admitted_snapshot_digest"
    | "admission_request_constructed"
    | "t_v4_rebuild_called"
    | "downstream_digest_work"
  >> = {},
): RecommendationOutcomeEvidenceAdmissionResultV1 {
  const reasonCodes = sortedUnique(reasons);
  const evidenceIdentity = details.evidence_identity ?? null;
  const failureIdentity = taxonomy === "admitted"
    ? null
    : sha({
        contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V1,
        taxonomy,
        evidence_identity: evidenceIdentity,
        candidate_snapshot_digest: audit.candidate_snapshot_digest,
        trusted_authority_snapshot_digest:
          audit.trusted_authority_snapshot_digest,
        reason_codes: reasonCodes,
      });
  const core = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V1,
    taxonomy,
    evidence_identity: evidenceIdentity,
    audit,
    t_v4_result_digest: details.t_v4_result_digest ?? null,
    eighteen_gap_binding_digest:
      details.eighteen_gap_binding_digest ?? null,
    admitted_snapshot_digest: details.admitted_snapshot_digest ?? null,
    admission_request_constructed:
      details.admission_request_constructed ?? false,
    t_v4_rebuild_called: details.t_v4_rebuild_called ?? false,
    downstream_digest_work: details.downstream_digest_work ?? false,
    failure_identity_digest: failureIdentity,
    reason_codes: reasonCodes,
    ...BOUNDARY,
  };
  return deepFreeze({
    ...core,
    result_digest: sha(core),
  });
}

function parseCandidate(input: unknown) {
  if (typeof input !== "string") {
    return {
      value: null,
      reasons: ["admission_candidate:canonical_json_string_required"],
    };
  }
  if (new TextEncoder().encode(input).byteLength > MAX_CANDIDATE_JSON_BYTES) {
    return {
      value: null,
      reasons: ["admission_candidate:string_budget_exceeded"],
    };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return {
      value: null,
      reasons: ["admission_candidate:malformed_json_sanitized"],
    };
  }
  const canonical =
    canonicalizeRecommendationOutcomeEvidencePreAdmissionV3(parsed);
  if (!canonical.ok || !isRecord(canonical.value)) {
    return {
      value: canonical.value,
      reasons: sortedUnique([
        ...(canonical.ok ? [] : canonical.reason_codes),
        ...(isRecord(canonical.value)
          ? []
          : ["admission_candidate:object_required"]),
      ]),
    };
  }
  const snapshot = deepFreeze(canonical.value);
  const reasons = exactKeys(
    snapshot,
    [
      "envelope_version",
      "evidence_identity",
      "t_v4_contract_version",
      "t_v4_request",
      "t_v4_authority_anchor",
      "t_v4_material",
      "t_v4_result",
    ],
    "admission_candidate",
  );
  if (
    snapshot.envelope_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_ENVELOPE_V1
  ) reasons.push("admission_envelope_version_mismatch");
  if (!nonEmpty(snapshot.evidence_identity)) {
    reasons.push("admission_evidence_identity_missing");
  }
  return {
    value: snapshot,
    reasons: sortedUnique(reasons),
  };
}

function parseTrustedAuthority(input: unknown) {
  if (typeof input !== "string") {
    return {
      value: null,
      reasons: ["trusted_admission_authority_missing"],
    };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return {
      value: null,
      reasons: ["trusted_admission_authority_malformed_sanitized"],
    };
  }
  const canonical =
    canonicalizeRecommendationOutcomeEvidencePreAdmissionV3(parsed);
  if (!canonical.ok || !isRecord(canonical.value)) {
    return {
      value: canonical.value,
      reasons: sortedUnique([
        ...(canonical.ok ? [] : canonical.reason_codes),
        "trusted_admission_authority_invalid",
      ]),
    };
  }
  const snapshot = deepFreeze(canonical.value);
  const reasons = exactKeys(
    snapshot,
    [
      "authority_version",
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
    "trusted_admission_authority",
  );
  if (
    snapshot.authority_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_AUTHORITY_V1 ||
    !nonEmpty(snapshot.registry_identity) ||
    !nonEmpty(snapshot.registry_version) ||
    !nonEmpty(snapshot.issuer_identity) ||
    !nonEmpty(snapshot.issuer_version) ||
    !nonEmpty(snapshot.minimum_epoch) ||
    !isSha(snapshot.registry_digest) ||
    !isSha(snapshot.authority_anchor_digest) ||
    !isSha(snapshot.trust_root_digest) ||
    !isSha(snapshot.expected_predecessor_issuance_digest)
  ) reasons.push("trusted_admission_authority_invalid");
  return {
    value: snapshot,
    reasons: sortedUnique(reasons),
  };
}

function authorityAnchorFromTrusted(
  trusted: PlainRecord,
): IssuerAnchor {
  return {
    registry_identity: trusted.registry_identity as string,
    registry_version:
      trusted.registry_version as IssuerAnchor["registry_version"],
    registry_digest: trusted.registry_digest as string,
    issuer_identity: trusted.issuer_identity as string,
    issuer_version: trusted.issuer_version as string,
    authority_anchor_digest: trusted.authority_anchor_digest as string,
    trust_root_digest: trusted.trust_root_digest as string,
    minimum_epoch: trusted.minimum_epoch as string,
    expected_predecessor_issuance_digest:
      trusted.expected_predecessor_issuance_digest as string,
  };
}

function mapNonIssuedTaxonomy(
  taxonomy: unknown,
): RecommendationOutcomeEvidenceAdmissionTaxonomyV1 {
  if (taxonomy === "conflicting") return "conflicting";
  if (taxonomy === "not_point_in_time_safe") {
    return "not_point_in_time_safe";
  }
  if (taxonomy === "unmappable") return "unmappable";
  return "rejected";
}

function gapBinding(material: PlainRecord) {
  const completionMaterial = material.completion_material;
  if (!isRecord(completionMaterial)) {
    return {
      digest: null,
      reasons: ["completion_material_missing"],
    };
  }
  const bundle = completionMaterial.observed_evidence_bundle;
  if (!isRecord(bundle)) {
    return {
      digest: null,
      reasons: ["completion_evidence_bundle_missing"],
    };
  }
  if (
    bundle.bundle_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BUNDLE_V1 ||
    !Array.isArray(bundle.gap_closures)
  ) {
    return {
      digest: null,
      reasons: ["completion_evidence_bundle_invalid"],
    };
  }
  const codes = bundle.gap_closures.map((entry) =>
    isRecord(entry) && typeof entry.gap_code === "string"
      ? entry.gap_code
      : null
  );
  const expected = [...RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1].sort();
  const observed = codes.filter((entry): entry is string => entry !== null)
    .sort();
  if (
    observed.length !== expected.length ||
    new Set(observed).size !== expected.length ||
    observed.some((entry, index) => entry !== expected[index])
  ) {
    return {
      digest: null,
      reasons: ["all_eighteen_gap_bindings_required_without_inference"],
    };
  }
  return {
    digest: sha(
      [...(bundle.gap_closures as RecommendationOutcomeEvidenceBundleV1[
        "gap_closures"
      ])].sort((left, right) =>
        [
          left.gap_code,
          left.evidence_identity,
          left.evidence_digest,
        ].join(":").localeCompare(
          [
            right.gap_code,
            right.evidence_identity,
            right.evidence_digest,
          ].join(":"),
        )
      ),
    ),
    reasons: [],
  };
}

function internalAuthority(
  anchor: IssuerAnchor,
  material: PlainRecord,
): RecommendationOutcomeEvidenceIssuerAuthorityV2 {
  return {
    authority_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V2,
    expected_issuer_anchor: structuredClone(anchor),
    read_issuance_material: () => structuredClone(material),
  };
}

export function admitRecommendationOutcomeEvidenceV1(
  candidateInput: unknown,
  dependencies: RecommendationOutcomeEvidenceAdmissionDependenciesV1,
): RecommendationOutcomeEvidenceAdmissionResultV1 {
  if (!dependencies.enabled) {
    return terminal(
      "rejected",
      emptyAudit(),
      ["outcome_evidence_admission_default_off"],
    );
  }
  if (dependencies.kill_switch) {
    return terminal(
      "rejected",
      emptyAudit(),
      ["outcome_evidence_admission_kill_switch_active"],
    );
  }

  // The public candidate boundary is canonical JSON. Object/proxy/accessor
  // inputs are rejected by typeof without reflection, hooks, getters, or
  // callbacks. Descriptor inspection then applies only to parser-owned data.
  const parsed = parseCandidate(candidateInput);
  const earlyAudit = observedAudit(parsed.value, null, 0);
  if (!parsed.value || parsed.reasons.length > 0) {
    return terminal("unmappable", earlyAudit, parsed.reasons);
  }
  const candidate = parsed.value as PlainRecord;
  const evidenceIdentity = candidate.evidence_identity as string;
  const suppliedResult = candidate.t_v4_result;
  if (!isRecord(suppliedResult)) {
    return terminal(
      "unmappable",
      earlyAudit,
      ["t_v4_result_missing"],
      { evidence_identity: evidenceIdentity },
    );
  }
  if (
    candidate.t_v4_contract_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4 ||
    suppliedResult.contract_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4
  ) {
    const observed = String(
      suppliedResult.contract_version ??
        candidate.t_v4_contract_version ??
        "absent",
    );
    const historical = [
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1,
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3,
    ].includes(observed as never);
    return terminal(
      "unmappable",
      earlyAudit,
      [historical
        ? "historical_t_v1_v2_v3_evidence_rejected"
        : "unknown_t_evidence_version_rejected"],
      { evidence_identity: evidenceIdentity },
    );
  }
  if (suppliedResult.taxonomy !== "issued") {
    return terminal(
      mapNonIssuedTaxonomy(suppliedResult.taxonomy),
      earlyAudit,
      [
        `t_v4_non_issued:${String(suppliedResult.taxonomy)}`,
        ...(
          Array.isArray(suppliedResult.reason_codes)
            ? suppliedResult.reason_codes.filter(
              (entry): entry is string => typeof entry === "string",
            )
            : ["t_v4_reason_codes_invalid"]
        ),
      ],
      { evidence_identity: evidenceIdentity },
    );
  }

  const trustedAuthorityInput = dependencies.trusted_authority_json;
  const trusted = parseTrustedAuthority(trustedAuthorityInput);
  const fullAudit = observedAudit(candidate, trusted.value, 1);
  if (!trusted.value || trusted.reasons.length > 0) {
    return terminal(
      "conflicting",
      fullAudit,
      trusted.reasons,
      { evidence_identity: evidenceIdentity },
    );
  }

  const trustedAnchor = authorityAnchorFromTrusted(
    trusted.value as PlainRecord,
  );
  if (stable(candidate.t_v4_authority_anchor) !== stable(trustedAnchor)) {
    return terminal(
      "conflicting",
      fullAudit,
      ["external_t_v4_authority_anchor_mismatch"],
      { evidence_identity: evidenceIdentity },
    );
  }
  if (!isRecord(candidate.t_v4_request) || !isRecord(candidate.t_v4_material)) {
    return terminal(
      "unmappable",
      fullAudit,
      ["t_v4_rebuild_material_invalid"],
      { evidence_identity: evidenceIdentity },
    );
  }

  const gaps = gapBinding(candidate.t_v4_material);
  if (!gaps.digest) {
    return terminal(
      "conflicting",
      fullAudit,
      gaps.reasons,
      { evidence_identity: evidenceIdentity },
    );
  }

  const rebuilt = issueRecommendationOutcomeEvidenceV4(
    candidate.t_v4_request,
    {
      enabled: true,
      kill_switch: false,
      authority: internalAuthority(
        trustedAnchor,
        candidate.t_v4_material,
      ),
    },
  );
  if (rebuilt.taxonomy !== "issued") {
    return terminal(
      mapNonIssuedTaxonomy(rebuilt.taxonomy),
      fullAudit,
      [
        "independent_t_v4_rebuild_not_issued",
        ...rebuilt.reason_codes,
      ],
      {
        evidence_identity: evidenceIdentity,
        admission_request_constructed: true,
        t_v4_rebuild_called: true,
      },
    );
  }
  if (
    computeRecommendationOutcomeEvidenceIssuanceResultDigestV4(
      suppliedResult as RecommendationOutcomeEvidenceIssuanceResultV4,
    ) !== suppliedResult.result_digest ||
    stable(rebuilt) !== stable(suppliedResult)
  ) {
    return terminal(
      "conflicting",
      fullAudit,
      ["independent_t_v4_digest_rebuild_mismatch"],
      {
        evidence_identity: evidenceIdentity,
        admission_request_constructed: true,
        t_v4_rebuild_called: true,
      },
    );
  }

  const admittedSnapshot = deepFreeze({
    admission_version: RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V1,
    evidence_identity: evidenceIdentity,
    t_v4_contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
    t_v4_result_digest: rebuilt.result_digest,
    t_v4_snapshot_bundle_digest:
      rebuilt.snapshot_audit.snapshot_bundle_digest,
    eighteen_gap_binding_digest: gaps.digest,
    authority_snapshot_digest:
      fullAudit.trusted_authority_snapshot_digest,
    candidate_snapshot_digest: fullAudit.candidate_snapshot_digest,
    verifier_identity:
      RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_VERIFIER_V1,
  });
  return terminal("admitted", fullAudit, [], {
    evidence_identity: evidenceIdentity,
    t_v4_result_digest: rebuilt.result_digest,
    eighteen_gap_binding_digest: gaps.digest,
    admitted_snapshot_digest: sha(admittedSnapshot),
    admission_request_constructed: true,
    t_v4_rebuild_called: true,
    downstream_digest_work: true,
  });
}

export function canonicalRecommendationOutcomeEvidenceAdmissionJsonV1(
  value: unknown,
) {
  return stable(value);
}

export function computeRecommendationOutcomeEvidenceAdmissionResultDigestV1(
  result: RecommendationOutcomeEvidenceAdmissionResultV1,
) {
  const core = { ...result } as Partial<
    RecommendationOutcomeEvidenceAdmissionResultV1
  >;
  delete core.result_digest;
  return sha(core);
}
