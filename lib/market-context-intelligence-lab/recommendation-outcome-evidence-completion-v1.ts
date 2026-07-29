import {
  marketContextDiagnosticContextSha256V1,
  stableMarketContextDiagnosticContextJsonV1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  canonicalizeDiagnosticOutcomeAuthorityPlainDataV2,
} from "./diagnostic-decision-outcome-handoff-capture-v2";
import {
  RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_INPUT_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_MATERIAL_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_VERIFIER_V1,
  computeRecommendationOutcomeProjectionDigestV1,
  projectRepositoryOwnedRecommendationOutcomeV1,
  type RecommendationOutcomeProjectionInputV1,
  type RecommendationOutcomeProjectionMaterialV1,
  type RecommendationOutcomeProjectionRegistryV1,
  type RecommendationOutcomeProjectionRequestV1,
} from "./recommendation-outcome-projection-successor-v1";

export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1 =
  "repository_owned_recommendation_outcome_evidence_completion_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BUNDLE_V1 =
  "repository_owned_recommendation_outcome_evidence_bundle_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1 =
  "repository_owned_recommendation_outcome_evidence_registry_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_MATERIAL_V1 =
  "repository_owned_recommendation_outcome_evidence_material_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V1 =
  "repository_owned_recommendation_outcome_evidence_authority_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VERIFIER_V1 =
  "repository_owned_recommendation_outcome_evidence_verifier_v1" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_PROVENANCE_V1 =
  "repository_owned_recommendation_outcome_evidence_provenance_v1" as const;

export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_TAXONOMY_V1 = [
  "completed",
  "incomplete",
  "conflicting",
  "not_point_in_time_safe",
  "unmappable",
] as const;

export type RecommendationOutcomeEvidenceCompletionTaxonomyV1 =
  (typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_TAXONOMY_V1)[number];

export const RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1 = [
  "completeness_proof_missing",
  "cryptographic_lineage_missing",
  "evaluator_identity_version_missing",
  "external_authority_root_missing",
  "finality_proof_missing",
  "immutable_membership_missing",
  "nanosecond_capture_instant_missing",
  "nanosecond_decision_instant_missing",
  "nanosecond_evidence_cutoff_missing",
  "nanosecond_outcome_finalization_instant_missing",
  "nanosecond_outcome_interval_missing",
  "predictor_point_in_time_binding_missing",
  "producer_owner_missing",
  "q1_interop_material_missing",
  "read_only_projection_missing",
  "recommendation_decision_identity_missing",
  "source_contract_version_missing",
  "source_snapshot_identity_digest_missing",
] as const;

export type RecommendationOutcomeNotBindableGapV1 =
  (typeof RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1)[number];

export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BOUNDARY_V1 = {
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

type PlainValue =
  | null
  | boolean
  | number
  | string
  | PlainValue[]
  | { [key: string]: PlainValue };
type PlainRecord = { [key: string]: PlainValue };

export type RecommendationOutcomeEvidenceCompletionRequestV1 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1;
  completion_identity: string;
  expected_repository_row_identity: string;
  expected_evidence_bundle_identity: string;
};

export type RecommendationOutcomeEvidenceGapClosureV1 = {
  gap_code: RecommendationOutcomeNotBindableGapV1;
  evidence_identity: string;
  evidence_digest: string;
  verifier_identity: typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VERIFIER_V1;
  verifier_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1;
};

export type RecommendationOutcomeEvidenceBundleV1 = {
  bundle_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BUNDLE_V1;
  bundle_identity: string;
  repository_row_identity: string;
  repository_row_digest: string;
  original_not_bindable_gap_codes: RecommendationOutcomeNotBindableGapV1[];
  gap_closures: RecommendationOutcomeEvidenceGapClosureV1[];
  external_authority_root_digest: string;
  source_snapshot: {
    identity: string;
    digest: string;
  };
  producer: {
    owner_identity: string;
    owner_version: string;
    schema_version: string;
    contract_version: string;
  };
  decision: {
    recommendation_id: string;
    external_decision_id: string;
    instrument_id: string;
  };
  opportunity_set: {
    identity: string;
    membership_digest: string;
    immutable: true;
  };
  model: {
    identity: string;
    version: string;
    lineage_digest: string;
  };
  evaluator: {
    identity: string;
    version: string;
    lineage_digest: string;
  };
  outcome: {
    identity: string;
    lineage_digest: string;
  };
  explanation: {
    identity: string;
    version: string;
    lineage_digest: string;
  };
  lineage: {
    identity: string;
    source_lineage_digest: string;
    provider_source: string;
    provider_version: string;
  };
  instants: {
    decision_unix_ns: string;
    outcome_start_unix_ns: string;
    outcome_end_unix_ns: string;
    source_unix_ns: string;
    receive_unix_ns: string;
    finalization_unix_ns: string;
    evaluation_unix_ns: string;
    evidence_cutoff_unix_ns: string;
  };
  finality: {
    status: "final";
    proof_identity: string;
    proof_digest: string;
  };
  completeness: {
    status: "complete";
    proof_identity: string;
    proof_digest: string;
  };
  q1_interop_digest: string;
  completed_projection: RecommendationOutcomeProjectionInputV1;
  lineage_root_digest: string;
  bundle_digest: string;
};

export type RecommendationOutcomeEvidenceRegistryV1 = {
  registry_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1;
  registry_identity: string;
  expected_trust_root_digest: string;
  completion_entry: {
    completion_identity: string;
    repository_row_identity: string;
    repository_row_digest: string;
    evidence_bundle_identity: string;
    evidence_bundle_digest: string;
    lineage_root_digest: string;
    verifier_identity: typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VERIFIER_V1;
    verifier_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1;
  };
};

export type RecommendationOutcomeEvidenceMaterialV1 = {
  material_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_MATERIAL_V1;
  registry: RecommendationOutcomeEvidenceRegistryV1;
  observed_repository_row: unknown;
  observed_evidence_bundle: unknown;
};

export type RecommendationOutcomeEvidenceAuthorityV1 = {
  authority_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V1;
  expected_registry_anchor: {
    registry_identity: string;
    registry_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1;
    registry_digest: string;
    expected_trust_root_digest: string;
    expected_lineage_root_digest: string;
  };
  read_completion_material: () => unknown;
};

export type RecommendationOutcomeEvidenceCompletionDependenciesV1 = {
  enabled: boolean;
  kill_switch: boolean;
  authority?: RecommendationOutcomeEvidenceAuthorityV1;
};

export type RecommendationOutcomeEvidenceObservedInputV1 = {
  namespace:
    | "completion_material"
    | "completion_registry"
    | "repository_row"
    | "evidence_bundle";
  disposition: "absent" | "malformed" | "verified" | "rejected";
  observed_identity: string | null;
  observed_digest: string;
  expected_identity: string | null;
  expected_digest: string | null;
  verifier_identity: typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VERIFIER_V1;
  verifier_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1;
  reason_codes: string[];
};

export type RecommendationOutcomeEvidenceCompletionResultV1 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1;
  taxonomy: RecommendationOutcomeEvidenceCompletionTaxonomyV1;
  request_identity: {
    completion_identity: string | null;
    repository_row_identity: string | null;
    evidence_bundle_identity: string | null;
    request_digest: string;
  };
  authority_binding: {
    authority_version:
      | typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V1
      | null;
    verification_status:
      | "verified"
      | "not_read_default_off"
      | "not_read_kill_switch"
      | "missing"
      | "invalid"
      | "lookup_failed"
      | "mismatch";
    expected_registry_digest: string | null;
    observed_registry_digest: string | null;
    expected_trust_root_digest: string | null;
    observed_trust_root_digest: string | null;
    expected_lineage_root_digest: string | null;
    observed_lineage_root_digest: string | null;
  };
  observed_input_provenance: {
    provenance_version:
      typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_PROVENANCE_V1;
    sections: RecommendationOutcomeEvidenceObservedInputV1[];
    provenance_digest: string;
  };
  completed_projection: Readonly<RecommendationOutcomeProjectionInputV1> | null;
  closed_gap_codes: RecommendationOutcomeNotBindableGapV1[];
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

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);

function sortedUnique(values: string[]) {
  return [...new Set(values)].sort((left, right) =>
    left.localeCompare(right),
  );
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function record(value: unknown): PlainRecord | null {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }
  return value as PlainRecord;
}

function exactKeys(
  value: unknown,
  keys: readonly string[],
  namespace: string,
  reasons: string[],
) {
  const candidate = record(value);
  if (!candidate) {
    reasons.push(`${namespace}:object_required`);
    return null;
  }
  const expected = [...keys].sort();
  const actual = Object.keys(candidate).sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    reasons.push(`${namespace}:closed_schema_violation`);
  }
  return candidate;
}

const nonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;
const isSha256 = (value: unknown): value is string =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const isUnixNs = (value: unknown): value is string =>
  typeof value === "string" && /^(0|[1-9][0-9]*)$/.test(value);

function canonicalObservation(value: unknown) {
  const canonical = canonicalizeDiagnosticOutcomeAuthorityPlainDataV2(value);
  if (!canonical.ok) {
    return {
      value: null,
      digest: canonical.sanitized_projection_digest,
      reason_codes: canonical.reason_codes,
    };
  }
  return {
    value: canonical.value,
    digest: sha(canonical.value),
    reason_codes: [] as string[],
  };
}

const ABSENT_DIGEST = sha({
  disposition: "absent",
  namespace: "recommendation_outcome_evidence_completion",
});

function observedSection(
  namespace: RecommendationOutcomeEvidenceObservedInputV1["namespace"],
  overrides: Partial<RecommendationOutcomeEvidenceObservedInputV1> = {},
): RecommendationOutcomeEvidenceObservedInputV1 {
  return {
    namespace,
    disposition: "absent",
    observed_identity: null,
    observed_digest: ABSENT_DIGEST,
    expected_identity: null,
    expected_digest: null,
    verifier_identity:
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VERIFIER_V1,
    verifier_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1,
    reason_codes: [],
    ...overrides,
  };
}

function canonicalResult(
  value: Omit<RecommendationOutcomeEvidenceCompletionResultV1, "result_digest">,
) {
  return deepFreeze({
    ...value,
    result_digest: sha(value),
  });
}

function failureResult(
  taxonomy: Exclude<
    RecommendationOutcomeEvidenceCompletionTaxonomyV1,
    "completed"
  >,
  reasonCodes: string[],
  overrides: Partial<
    Omit<RecommendationOutcomeEvidenceCompletionResultV1, "result_digest">
  > = {},
) {
  const reasons = sortedUnique(reasonCodes);
  const base = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1,
    taxonomy,
    request_identity: {
      completion_identity: null,
      repository_row_identity: null,
      evidence_bundle_identity: null,
      request_digest: ABSENT_DIGEST,
    },
    authority_binding: {
      authority_version: null,
      verification_status: "missing" as const,
      expected_registry_digest: null,
      observed_registry_digest: null,
      expected_trust_root_digest: null,
      observed_trust_root_digest: null,
      expected_lineage_root_digest: null,
      observed_lineage_root_digest: null,
    },
    observed_input_provenance: {
      provenance_version:
        RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_PROVENANCE_V1,
      sections: [
        observedSection("completion_material"),
        observedSection("completion_registry"),
        observedSection("repository_row"),
        observedSection("evidence_bundle"),
      ],
      provenance_digest: ABSENT_DIGEST,
    },
    completed_projection: null,
    closed_gap_codes: [] as RecommendationOutcomeNotBindableGapV1[],
    failure_identity_digest: null as string | null,
    reason_codes: reasons,
    ...RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BOUNDARY_V1,
    ...overrides,
  };
  const failureIdentity = sha({
    taxonomy,
    request_identity: base.request_identity,
    authority_binding: base.authority_binding,
    provenance_digest:
      base.observed_input_provenance.provenance_digest,
    reason_codes: reasons,
  });
  return canonicalResult({
    ...base,
    failure_identity_digest: failureIdentity,
  });
}

const DEFAULT_OFF_RESULT = failureResult(
  "incomplete",
  ["recommendation_outcome_evidence_completion_disabled"],
  {
    authority_binding: {
      authority_version: null,
      verification_status: "not_read_default_off",
      expected_registry_digest: null,
      observed_registry_digest: null,
      expected_trust_root_digest: null,
      observed_trust_root_digest: null,
      expected_lineage_root_digest: null,
      observed_lineage_root_digest: null,
    },
  },
);

const KILL_SWITCH_RESULT = failureResult(
  "incomplete",
  ["recommendation_outcome_evidence_completion_kill_switch"],
  {
    authority_binding: {
      authority_version: null,
      verification_status: "not_read_kill_switch",
      expected_registry_digest: null,
      observed_registry_digest: null,
      expected_trust_root_digest: null,
      observed_trust_root_digest: null,
      expected_lineage_root_digest: null,
      observed_lineage_root_digest: null,
    },
  },
);

function validateRequest(value: unknown) {
  const observed = canonicalObservation(value);
  if (!observed.value) {
    return {
      request: null,
      request_digest: observed.digest,
      reason_codes: observed.reason_codes,
    };
  }
  const reasons: string[] = [];
  const request = exactKeys(
    observed.value,
    [
      "contract_version",
      "completion_identity",
      "expected_repository_row_identity",
      "expected_evidence_bundle_identity",
    ],
    "$request",
    reasons,
  );
  if (
    request?.contract_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1 ||
    !nonEmpty(request?.completion_identity) ||
    !nonEmpty(request?.expected_repository_row_identity) ||
    !nonEmpty(request?.expected_evidence_bundle_identity)
  ) {
    reasons.push("completion_request_invalid");
  }
  return {
    request:
      reasons.length === 0
        ? (request as unknown as RecommendationOutcomeEvidenceCompletionRequestV1)
        : null,
    request_digest: observed.digest,
    reason_codes: sortedUnique(reasons),
  };
}

function validateRegistry(value: unknown) {
  const reasons: string[] = [];
  const registry = exactKeys(
    value,
    [
      "registry_version",
      "registry_identity",
      "expected_trust_root_digest",
      "completion_entry",
    ],
    "$registry",
    reasons,
  );
  const entry = exactKeys(
    registry?.completion_entry,
    [
      "completion_identity",
      "repository_row_identity",
      "repository_row_digest",
      "evidence_bundle_identity",
      "evidence_bundle_digest",
      "lineage_root_digest",
      "verifier_identity",
      "verifier_version",
    ],
    "$registry.completion_entry",
    reasons,
  );
  if (
    registry?.registry_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1 ||
    !nonEmpty(registry?.registry_identity) ||
    !isSha256(registry?.expected_trust_root_digest) ||
    !entry ||
    !nonEmpty(entry.completion_identity) ||
    !nonEmpty(entry.repository_row_identity) ||
    !isSha256(entry.repository_row_digest) ||
    !nonEmpty(entry.evidence_bundle_identity) ||
    !isSha256(entry.evidence_bundle_digest) ||
    !isSha256(entry.lineage_root_digest) ||
    entry.verifier_identity !==
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VERIFIER_V1 ||
    entry.verifier_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1
  ) {
    reasons.push("completion_registry_invalid");
  }
  return {
    registry:
      reasons.length === 0
        ? (registry as unknown as RecommendationOutcomeEvidenceRegistryV1)
        : null,
    reason_codes: sortedUnique(reasons),
  };
}

function evidenceBundleDigestBasis(
  bundle: RecommendationOutcomeEvidenceBundleV1,
) {
  const basis = {
    ...bundle,
  } as Partial<RecommendationOutcomeEvidenceBundleV1>;
  delete basis.bundle_digest;
  return basis;
}

export function computeRecommendationOutcomeEvidenceBundleDigestV1(
  bundle: RecommendationOutcomeEvidenceBundleV1,
) {
  return sha(evidenceBundleDigestBasis(bundle));
}

export function computeRecommendationOutcomeEvidenceLineageRootV1(
  bundle: Pick<
    RecommendationOutcomeEvidenceBundleV1,
    "model" | "evaluator" | "outcome" | "explanation" | "lineage"
  >,
) {
  return sha({
    model: bundle.model,
    evaluator: bundle.evaluator,
    outcome: bundle.outcome,
    explanation: bundle.explanation,
    lineage: bundle.lineage,
  });
}

function validateGapClosures(
  value: unknown,
  reasons: string[],
) {
  if (!Array.isArray(value)) {
    reasons.push("gap_closures_array_required");
    return [] as RecommendationOutcomeEvidenceGapClosureV1[];
  }
  const closures: RecommendationOutcomeEvidenceGapClosureV1[] = [];
  for (const [index, item] of value.entries()) {
    const closure = exactKeys(
      item,
      [
        "gap_code",
        "evidence_identity",
        "evidence_digest",
        "verifier_identity",
        "verifier_version",
      ],
      `$bundle.gap_closures.${index}`,
      reasons,
    );
    if (
      !closure ||
      !RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1.includes(
        closure.gap_code as RecommendationOutcomeNotBindableGapV1,
      ) ||
      !nonEmpty(closure.evidence_identity) ||
      !isSha256(closure.evidence_digest) ||
      closure.verifier_identity !==
        RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VERIFIER_V1 ||
      closure.verifier_version !==
        RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1
    ) {
      reasons.push(`gap_closure_invalid:${index}`);
      continue;
    }
    closures.push(
      closure as unknown as RecommendationOutcomeEvidenceGapClosureV1,
    );
  }
  const actual = closures.map((closure) => closure.gap_code).sort();
  const expected = [...RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1].sort();
  if (
    actual.length !== expected.length ||
    actual.some((gap, index) => gap !== expected[index])
  ) {
    reasons.push("all_eighteen_gap_closures_required");
  }
  return closures;
}

function validateEvidenceBundle(value: unknown) {
  const reasons: string[] = [];
  const bundle = exactKeys(
    value,
    [
      "bundle_version",
      "bundle_identity",
      "repository_row_identity",
      "repository_row_digest",
      "original_not_bindable_gap_codes",
      "gap_closures",
      "external_authority_root_digest",
      "source_snapshot",
      "producer",
      "decision",
      "opportunity_set",
      "model",
      "evaluator",
      "outcome",
      "explanation",
      "lineage",
      "instants",
      "finality",
      "completeness",
      "q1_interop_digest",
      "completed_projection",
      "lineage_root_digest",
      "bundle_digest",
    ],
    "$bundle",
    reasons,
  );
  if (!bundle) {
    return {
      bundle: null,
      reason_codes: sortedUnique(reasons),
    };
  }
  const sourceSnapshot = exactKeys(
    bundle.source_snapshot,
    ["identity", "digest"],
    "$bundle.source_snapshot",
    reasons,
  );
  const producer = exactKeys(
    bundle.producer,
    [
      "owner_identity",
      "owner_version",
      "schema_version",
      "contract_version",
    ],
    "$bundle.producer",
    reasons,
  );
  const decision = exactKeys(
    bundle.decision,
    ["recommendation_id", "external_decision_id", "instrument_id"],
    "$bundle.decision",
    reasons,
  );
  const opportunity = exactKeys(
    bundle.opportunity_set,
    ["identity", "membership_digest", "immutable"],
    "$bundle.opportunity_set",
    reasons,
  );
  const model = exactKeys(
    bundle.model,
    ["identity", "version", "lineage_digest"],
    "$bundle.model",
    reasons,
  );
  const evaluator = exactKeys(
    bundle.evaluator,
    ["identity", "version", "lineage_digest"],
    "$bundle.evaluator",
    reasons,
  );
  const outcome = exactKeys(
    bundle.outcome,
    ["identity", "lineage_digest"],
    "$bundle.outcome",
    reasons,
  );
  const explanation = exactKeys(
    bundle.explanation,
    ["identity", "version", "lineage_digest"],
    "$bundle.explanation",
    reasons,
  );
  const lineage = exactKeys(
    bundle.lineage,
    [
      "identity",
      "source_lineage_digest",
      "provider_source",
      "provider_version",
    ],
    "$bundle.lineage",
    reasons,
  );
  const instants = exactKeys(
    bundle.instants,
    [
      "decision_unix_ns",
      "outcome_start_unix_ns",
      "outcome_end_unix_ns",
      "source_unix_ns",
      "receive_unix_ns",
      "finalization_unix_ns",
      "evaluation_unix_ns",
      "evidence_cutoff_unix_ns",
    ],
    "$bundle.instants",
    reasons,
  );
  const finality = exactKeys(
    bundle.finality,
    ["status", "proof_identity", "proof_digest"],
    "$bundle.finality",
    reasons,
  );
  const completeness = exactKeys(
    bundle.completeness,
    ["status", "proof_identity", "proof_digest"],
    "$bundle.completeness",
    reasons,
  );
  const originalGaps = Array.isArray(
    bundle.original_not_bindable_gap_codes,
  )
    ? bundle.original_not_bindable_gap_codes
    : [];
  const expectedGaps = [...RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1];
  if (
    originalGaps.length !== expectedGaps.length ||
    [...originalGaps]
      .sort()
      .some((gap, index) => gap !== [...expectedGaps].sort()[index])
  ) {
    reasons.push("original_not_bindable_gap_list_mismatch");
  }
  validateGapClosures(bundle.gap_closures, reasons);
  const stringFields = [
    bundle.bundle_identity,
    bundle.repository_row_identity,
    producer?.owner_identity,
    producer?.owner_version,
    producer?.schema_version,
    producer?.contract_version,
    decision?.recommendation_id,
    decision?.external_decision_id,
    decision?.instrument_id,
    opportunity?.identity,
    model?.identity,
    model?.version,
    evaluator?.identity,
    evaluator?.version,
    outcome?.identity,
    explanation?.identity,
    explanation?.version,
    lineage?.identity,
    lineage?.provider_source,
    lineage?.provider_version,
    finality?.proof_identity,
    completeness?.proof_identity,
  ];
  if (stringFields.some((field) => !nonEmpty(field))) {
    reasons.push("evidence_bundle_identity_or_version_missing");
  }
  const digestFields = [
    bundle.repository_row_digest,
    bundle.external_authority_root_digest,
    sourceSnapshot?.digest,
    opportunity?.membership_digest,
    model?.lineage_digest,
    evaluator?.lineage_digest,
    outcome?.lineage_digest,
    explanation?.lineage_digest,
    lineage?.source_lineage_digest,
    finality?.proof_digest,
    completeness?.proof_digest,
    bundle.q1_interop_digest,
    bundle.lineage_root_digest,
    bundle.bundle_digest,
  ];
  if (
    !nonEmpty(sourceSnapshot?.identity) ||
    digestFields.some((field) => !isSha256(field)) ||
    opportunity?.immutable !== true ||
    finality?.status !== "final" ||
    completeness?.status !== "complete"
  ) {
    reasons.push("evidence_bundle_proof_or_digest_invalid");
  }
  if (
    !instants ||
    Object.values(instants).some((instant) => !isUnixNs(instant))
  ) {
    reasons.push("evidence_bundle_nanosecond_instant_invalid");
  }
  const candidate =
    bundle as unknown as RecommendationOutcomeEvidenceBundleV1;
  if (
    isSha256(candidate.lineage_root_digest) &&
    candidate.lineage_root_digest !==
      computeRecommendationOutcomeEvidenceLineageRootV1(candidate)
  ) {
    reasons.push("evidence_lineage_root_digest_mismatch");
  }
  if (
    isSha256(candidate.bundle_digest) &&
    candidate.bundle_digest !==
      computeRecommendationOutcomeEvidenceBundleDigestV1(candidate)
  ) {
    reasons.push("evidence_bundle_digest_mismatch");
  }
  return {
    bundle: reasons.length === 0 ? candidate : null,
    reason_codes: sortedUnique(reasons),
  };
}

function temporalOrderIsSafe(
  instants: RecommendationOutcomeEvidenceBundleV1["instants"],
) {
  try {
    return (
      BigInt(instants.decision_unix_ns) <
        BigInt(instants.outcome_start_unix_ns) &&
      BigInt(instants.outcome_start_unix_ns) <=
        BigInt(instants.outcome_end_unix_ns) &&
      BigInt(instants.outcome_end_unix_ns) <=
        BigInt(instants.source_unix_ns) &&
      BigInt(instants.source_unix_ns) <=
        BigInt(instants.receive_unix_ns) &&
      BigInt(instants.receive_unix_ns) <=
        BigInt(instants.finalization_unix_ns) &&
      BigInt(instants.finalization_unix_ns) <=
        BigInt(instants.evaluation_unix_ns) &&
      BigInt(instants.evaluation_unix_ns) <=
        BigInt(instants.evidence_cutoff_unix_ns)
    );
  } catch {
    return false;
  }
}

function buildR2Verification(
  observedInput: unknown,
  completionIdentity: string,
  sourceSnapshotIdentity: string,
  expectedExternalAuthorityRootDigest: string,
) {
  const registry: RecommendationOutcomeProjectionRegistryV1 = {
    registry_version: RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1,
    registry_identity: `s1-r2-verification:${completionIdentity}`,
    expected_external_authority_root_digest:
      expectedExternalAuthorityRootDigest,
    projection_entry: {
      projection_identity: completionIdentity,
      source_snapshot_identity: sourceSnapshotIdentity,
      observed_input_digest: sha(observedInput),
      verifier_identity: RECOMMENDATION_OUTCOME_PROJECTION_VERIFIER_V1,
      verifier_version: RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
    },
  };
  const material: RecommendationOutcomeProjectionMaterialV1 = {
    material_version: RECOMMENDATION_OUTCOME_PROJECTION_MATERIAL_V1,
    registry,
    observed_projection_input: observedInput,
  };
  const request: RecommendationOutcomeProjectionRequestV1 = {
    contract_version: RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
    projection_identity: completionIdentity,
    expected_source_snapshot_identity: sourceSnapshotIdentity,
  };
  return projectRepositoryOwnedRecommendationOutcomeV1(request, {
    enabled: true,
    kill_switch: false,
    authority: {
      authority_version: RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
      expected_registry_anchor: {
        registry_identity: registry.registry_identity,
        registry_version: RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1,
        registry_digest: sha(registry),
      },
      read_projection_material: () => structuredClone(material),
    },
  });
}

function validateProjectionBindings(
  bundle: RecommendationOutcomeEvidenceBundleV1,
) {
  const projection = bundle.completed_projection;
  const reasons: string[] = [];
  if (
    projection.projection_version !==
      RECOMMENDATION_OUTCOME_PROJECTION_INPUT_V1 ||
    projection.producer_owner.identity !== bundle.producer.owner_identity ||
    projection.producer_owner.version !== bundle.producer.owner_version ||
    projection.source_contract.schema_version !==
      bundle.producer.schema_version ||
    projection.source_contract.contract_version !==
      bundle.producer.contract_version ||
    projection.external_authority_root_digest !==
      bundle.external_authority_root_digest ||
    projection.source_snapshot.identity !== bundle.source_snapshot.identity ||
    projection.source_snapshot.digest !== bundle.source_snapshot.digest ||
    projection.decision.recommendation_id !==
      bundle.decision.recommendation_id ||
    projection.decision.external_decision_id !==
      bundle.decision.external_decision_id ||
    projection.decision.instrument_id !== bundle.decision.instrument_id
  ) {
    reasons.push("completed_projection_source_or_decision_binding_mismatch");
  }
  if (
    projection.opportunity_set.identity !==
      bundle.opportunity_set.identity ||
    projection.opportunity_set.membership_digest !==
      bundle.opportunity_set.membership_digest ||
    projection.opportunity_set.immutable !== true
  ) {
    reasons.push("completed_projection_membership_binding_mismatch");
  }
  if (
    projection.outcome.identity !== bundle.outcome.identity ||
    projection.outcome.evaluator_identity !== bundle.evaluator.identity ||
    projection.outcome.evaluator_version !== bundle.evaluator.version ||
    projection.lineage.identity !== bundle.lineage.identity ||
    projection.lineage.source_lineage_digest !==
      bundle.lineage.source_lineage_digest ||
    projection.lineage.evaluator_lineage_digest !==
      bundle.evaluator.lineage_digest ||
    projection.lineage.outcome_lineage_digest !==
      bundle.outcome.lineage_digest ||
    projection.lineage.provider_source !==
      bundle.lineage.provider_source ||
    projection.lineage.provider_version !==
      bundle.lineage.provider_version ||
    projection.lineage.context_lineage_digest !==
      bundle.explanation.lineage_digest ||
    projection.point_in_time.predictor_projection_digest !==
      bundle.model.lineage_digest
  ) {
    reasons.push("completed_projection_lineage_binding_mismatch");
  }
  if (
    projection.instants.decision_unix_ns !==
      bundle.instants.decision_unix_ns ||
    projection.instants.outcome_start_unix_ns !==
      bundle.instants.outcome_start_unix_ns ||
    projection.instants.outcome_end_unix_ns !==
      bundle.instants.outcome_end_unix_ns ||
    projection.instants.outcome_finalization_unix_ns !==
      bundle.instants.finalization_unix_ns ||
    projection.instants.capture_unix_ns !==
      bundle.instants.evaluation_unix_ns ||
    projection.instants.evidence_cutoff_unix_ns !==
      bundle.instants.evidence_cutoff_unix_ns ||
    projection.point_in_time.predictor_cutoff_unix_ns !==
      bundle.instants.decision_unix_ns ||
    projection.point_in_time.outcome_visible_to_predictor !== false
  ) {
    reasons.push("completed_projection_temporal_binding_mismatch");
  }
  if (
    projection.finality.status !== "final" ||
    projection.finality.proof_identity !== bundle.finality.proof_identity ||
    projection.finality.proof_digest !== bundle.finality.proof_digest ||
    projection.completeness.status !== "complete" ||
    projection.completeness.proof_identity !==
      bundle.completeness.proof_identity ||
    projection.completeness.proof_digest !==
      bundle.completeness.proof_digest ||
    sha(projection.q1_interop) !== bundle.q1_interop_digest ||
    computeRecommendationOutcomeProjectionDigestV1(projection) !==
      projection.read_only_projection.projection_digest
  ) {
    reasons.push("completed_projection_proof_or_digest_mismatch");
  }
  return sortedUnique(reasons);
}

function materialShape(value: unknown) {
  const reasons: string[] = [];
  const material = exactKeys(
    value,
    [
      "material_version",
      "registry",
      "observed_repository_row",
      "observed_evidence_bundle",
    ],
    "$material",
    reasons,
  );
  if (
    material?.material_version !==
    RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_MATERIAL_V1
  ) {
    reasons.push("completion_material_invalid");
  }
  return {
    material:
      reasons.length === 0
        ? (material as unknown as RecommendationOutcomeEvidenceMaterialV1)
        : null,
    reason_codes: sortedUnique(reasons),
  };
}

function resultOverrides(
  request: RecommendationOutcomeEvidenceCompletionRequestV1,
  requestDigest: string,
  authority: RecommendationOutcomeEvidenceAuthorityV1,
  registryDigest: string | null,
  registry: RecommendationOutcomeEvidenceRegistryV1 | null,
  sections: RecommendationOutcomeEvidenceObservedInputV1[],
) {
  return {
    request_identity: {
      completion_identity: request.completion_identity,
      repository_row_identity: request.expected_repository_row_identity,
      evidence_bundle_identity: request.expected_evidence_bundle_identity,
      request_digest: requestDigest,
    },
    authority_binding: {
      authority_version:
        RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V1,
      verification_status: "verified" as const,
      expected_registry_digest:
        authority.expected_registry_anchor.registry_digest,
      observed_registry_digest: registryDigest,
      expected_trust_root_digest:
        authority.expected_registry_anchor.expected_trust_root_digest,
      observed_trust_root_digest:
        registry?.expected_trust_root_digest ?? null,
      expected_lineage_root_digest:
        authority.expected_registry_anchor.expected_lineage_root_digest,
      observed_lineage_root_digest:
        registry?.completion_entry.lineage_root_digest ?? null,
    },
    observed_input_provenance: {
      provenance_version:
        RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_PROVENANCE_V1,
      sections,
      provenance_digest: sha(sections),
    },
  };
}

export function completeRepositoryOwnedRecommendationOutcomeEvidenceV1(
  requestValue: unknown,
  dependencies: RecommendationOutcomeEvidenceCompletionDependenciesV1,
): RecommendationOutcomeEvidenceCompletionResultV1 {
  if (!dependencies.enabled) return DEFAULT_OFF_RESULT;
  if (dependencies.kill_switch) return KILL_SWITCH_RESULT;

  const requestInspection = validateRequest(requestValue);
  if (!requestInspection.request) {
    return failureResult(
      "unmappable",
      requestInspection.reason_codes,
      {
        request_identity: {
          completion_identity: null,
          repository_row_identity: null,
          evidence_bundle_identity: null,
          request_digest: requestInspection.request_digest,
        },
      },
    );
  }
  const request = requestInspection.request;
  const authority = dependencies.authority;
  if (
    !authority ||
    authority.authority_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V1 ||
    authority.expected_registry_anchor.registry_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1 ||
    !nonEmpty(authority.expected_registry_anchor.registry_identity) ||
    !isSha256(authority.expected_registry_anchor.registry_digest) ||
    !isSha256(
      authority.expected_registry_anchor.expected_trust_root_digest,
    ) ||
    !isSha256(
      authority.expected_registry_anchor.expected_lineage_root_digest,
    )
  ) {
    return failureResult("incomplete", ["external_completion_authority_missing"], {
      request_identity: {
        completion_identity: request.completion_identity,
        repository_row_identity: request.expected_repository_row_identity,
        evidence_bundle_identity: request.expected_evidence_bundle_identity,
        request_digest: requestInspection.request_digest,
      },
    });
  }

  let observedMaterial: unknown;
  try {
    observedMaterial = authority.read_completion_material();
  } catch {
    return failureResult(
      "incomplete",
      ["completion_authority_lookup_failed_sanitized"],
      {
        request_identity: {
          completion_identity: request.completion_identity,
          repository_row_identity: request.expected_repository_row_identity,
          evidence_bundle_identity: request.expected_evidence_bundle_identity,
          request_digest: requestInspection.request_digest,
        },
        authority_binding: {
          authority_version:
            RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V1,
          verification_status: "lookup_failed",
          expected_registry_digest:
            authority.expected_registry_anchor.registry_digest,
          observed_registry_digest: null,
          expected_trust_root_digest:
            authority.expected_registry_anchor.expected_trust_root_digest,
          observed_trust_root_digest: null,
          expected_lineage_root_digest:
            authority.expected_registry_anchor.expected_lineage_root_digest,
          observed_lineage_root_digest: null,
        },
      },
    );
  }
  const materialObservation = canonicalObservation(observedMaterial);
  const sections = [
    observedSection("completion_material", {
      disposition: materialObservation.value ? "verified" : "malformed",
      observed_digest: materialObservation.digest,
      expected_identity:
        authority.expected_registry_anchor.registry_identity,
      expected_digest:
        authority.expected_registry_anchor.registry_digest,
      reason_codes: materialObservation.reason_codes,
    }),
    observedSection("completion_registry"),
    observedSection("repository_row", {
      expected_identity: request.expected_repository_row_identity,
    }),
    observedSection("evidence_bundle", {
      expected_identity: request.expected_evidence_bundle_identity,
    }),
  ];
  if (!materialObservation.value) {
    return failureResult(
      "unmappable",
      materialObservation.reason_codes,
      resultOverrides(
        request,
        requestInspection.request_digest,
        authority,
        null,
        null,
        sections,
      ),
    );
  }
  const materialInspection = materialShape(materialObservation.value);
  if (!materialInspection.material) {
    return failureResult(
      "unmappable",
      materialInspection.reason_codes,
      resultOverrides(
        request,
        requestInspection.request_digest,
        authority,
        null,
        null,
        sections,
      ),
    );
  }
  const material = materialInspection.material;
  const registryObservation = canonicalObservation(material.registry);
  const registryInspection = validateRegistry(registryObservation.value);
  sections[1] = observedSection("completion_registry", {
    disposition: registryInspection.registry ? "verified" : "malformed",
    observed_identity:
      record(registryObservation.value)?.registry_identity as string ?? null,
    observed_digest: registryObservation.digest,
    expected_identity:
      authority.expected_registry_anchor.registry_identity,
    expected_digest: authority.expected_registry_anchor.registry_digest,
    reason_codes: registryInspection.reason_codes,
  });
  if (!registryInspection.registry) {
    return failureResult(
      "unmappable",
      registryInspection.reason_codes,
      resultOverrides(
        request,
        requestInspection.request_digest,
        authority,
        registryObservation.digest,
        null,
        sections,
      ),
    );
  }
  const registry = registryInspection.registry;
  if (
    registry.registry_identity !==
      authority.expected_registry_anchor.registry_identity ||
    registryObservation.digest !==
      authority.expected_registry_anchor.registry_digest
  ) {
    sections[1] = {
      ...sections[1],
      disposition: "rejected",
      reason_codes: ["external_completion_registry_anchor_mismatch"],
    };
    return failureResult(
      "conflicting",
      ["external_completion_registry_anchor_mismatch"],
      resultOverrides(
        request,
        requestInspection.request_digest,
        authority,
        registryObservation.digest,
        registry,
        sections,
      ),
    );
  }
  if (
    registry.expected_trust_root_digest !==
      authority.expected_registry_anchor.expected_trust_root_digest ||
    registry.completion_entry.lineage_root_digest !==
      authority.expected_registry_anchor.expected_lineage_root_digest
  ) {
    sections[1] = {
      ...sections[1],
      disposition: "rejected",
      reason_codes: ["external_trust_or_lineage_root_mismatch"],
    };
    return failureResult(
      "conflicting",
      ["external_trust_or_lineage_root_mismatch"],
      resultOverrides(
        request,
        requestInspection.request_digest,
        authority,
        registryObservation.digest,
        registry,
        sections,
      ),
    );
  }
  const rowObservation = canonicalObservation(
    material.observed_repository_row,
  );
  const bundleObservation = canonicalObservation(
    material.observed_evidence_bundle,
  );
  const rowIdentity =
    record(rowObservation.value)?.id as string | undefined;
  const bundleIdentity =
    record(bundleObservation.value)?.bundle_identity as string | undefined;
  sections[2] = observedSection("repository_row", {
    disposition: rowObservation.value ? "verified" : "malformed",
    observed_identity: rowIdentity ?? null,
    observed_digest: rowObservation.digest,
    expected_identity: request.expected_repository_row_identity,
    expected_digest: registry.completion_entry.repository_row_digest,
    reason_codes: rowObservation.reason_codes,
  });
  sections[3] = observedSection("evidence_bundle", {
    disposition: bundleObservation.value ? "verified" : "malformed",
    observed_identity: bundleIdentity ?? null,
    observed_digest: bundleObservation.digest,
    expected_identity: request.expected_evidence_bundle_identity,
    expected_digest: registry.completion_entry.evidence_bundle_digest,
    reason_codes: bundleObservation.reason_codes,
  });
  if (!rowObservation.value || !bundleObservation.value) {
    return failureResult(
      "unmappable",
      [...rowObservation.reason_codes, ...bundleObservation.reason_codes],
      resultOverrides(
        request,
        requestInspection.request_digest,
        authority,
        registryObservation.digest,
        registry,
        sections,
      ),
    );
  }
  const identityConflicts: string[] = [];
  if (
    request.completion_identity !==
      registry.completion_entry.completion_identity
  ) {
    identityConflicts.push("completion_identity_mismatch");
  }
  if (
    rowIdentity !== request.expected_repository_row_identity ||
    rowIdentity !== registry.completion_entry.repository_row_identity ||
    rowObservation.digest !==
      registry.completion_entry.repository_row_digest
  ) {
    identityConflicts.push("repository_row_identity_or_digest_mismatch");
  }
  if (
    bundleIdentity !== request.expected_evidence_bundle_identity ||
    bundleIdentity !== registry.completion_entry.evidence_bundle_identity ||
    bundleObservation.digest !==
      registry.completion_entry.evidence_bundle_digest
  ) {
    identityConflicts.push("evidence_bundle_identity_or_digest_mismatch");
  }
  if (identityConflicts.length > 0) {
    sections[2] = {
      ...sections[2],
      disposition: "rejected",
      reason_codes: identityConflicts,
    };
    sections[3] = {
      ...sections[3],
      disposition: "rejected",
      reason_codes: identityConflicts,
    };
    return failureResult(
      "conflicting",
      identityConflicts,
      resultOverrides(
        request,
        requestInspection.request_digest,
        authority,
        registryObservation.digest,
        registry,
        sections,
      ),
    );
  }
  const bundleInspection = validateEvidenceBundle(bundleObservation.value);
  if (!bundleInspection.bundle) {
    sections[3] = {
      ...sections[3],
      disposition: "rejected",
      reason_codes: bundleInspection.reason_codes,
    };
    const taxonomy = bundleInspection.reason_codes.some((reason) =>
      reason.includes("gap"),
    )
      ? "incomplete"
      : "conflicting";
    return failureResult(
      taxonomy,
      bundleInspection.reason_codes,
      resultOverrides(
        request,
        requestInspection.request_digest,
        authority,
        registryObservation.digest,
        registry,
        sections,
      ),
    );
  }
  const bundle = bundleInspection.bundle;
  const rootConflicts: string[] = [];
  if (
    bundle.repository_row_identity !== rowIdentity ||
    bundle.repository_row_digest !== rowObservation.digest ||
    bundleObservation.digest !==
      registry.completion_entry.evidence_bundle_digest ||
    bundle.external_authority_root_digest !==
      registry.expected_trust_root_digest ||
    bundle.lineage_root_digest !==
      registry.completion_entry.lineage_root_digest
  ) {
    rootConflicts.push("evidence_bundle_registry_binding_mismatch");
  }
  if (rootConflicts.length > 0) {
    sections[3] = {
      ...sections[3],
      disposition: "rejected",
      reason_codes: rootConflicts,
    };
    return failureResult(
      "conflicting",
      rootConflicts,
      resultOverrides(
        request,
        requestInspection.request_digest,
        authority,
        registryObservation.digest,
        registry,
        sections,
      ),
    );
  }
  const originalR2 = buildR2Verification(
    rowObservation.value,
    request.completion_identity,
    bundle.source_snapshot.identity,
    bundle.external_authority_root_digest,
  );
  if (
    originalR2.taxonomy !== "not_bindable" ||
    stableMarketContextDiagnosticContextJsonV1(originalR2.reason_codes) !==
      stableMarketContextDiagnosticContextJsonV1(
        RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
      )
  ) {
    sections[2] = {
      ...sections[2],
      disposition: "rejected",
      reason_codes: ["repository_row_original_gap_contract_mismatch"],
    };
    return failureResult(
      "conflicting",
      ["repository_row_original_gap_contract_mismatch"],
      resultOverrides(
        request,
        requestInspection.request_digest,
        authority,
        registryObservation.digest,
        registry,
        sections,
      ),
    );
  }
  if (!temporalOrderIsSafe(bundle.instants)) {
    sections[3] = {
      ...sections[3],
      disposition: "rejected",
      reason_codes: ["completion_evidence_temporal_order_invalid"],
    };
    return failureResult(
      "not_point_in_time_safe",
      ["completion_evidence_temporal_order_invalid"],
      resultOverrides(
        request,
        requestInspection.request_digest,
        authority,
        registryObservation.digest,
        registry,
        sections,
      ),
    );
  }
  const projectionBindingReasons = validateProjectionBindings(bundle);
  if (projectionBindingReasons.length > 0) {
    sections[3] = {
      ...sections[3],
      disposition: "rejected",
      reason_codes: projectionBindingReasons,
    };
    return failureResult(
      "conflicting",
      projectionBindingReasons,
      resultOverrides(
        request,
        requestInspection.request_digest,
        authority,
        registryObservation.digest,
        registry,
        sections,
      ),
    );
  }
  const r2 = buildR2Verification(
    bundle.completed_projection,
    bundle.completed_projection.read_only_projection.identity,
    bundle.completed_projection.source_snapshot.identity,
    bundle.external_authority_root_digest,
  );
  if (r2.taxonomy !== "bindable") {
    sections[3] = {
      ...sections[3],
      disposition: "rejected",
      reason_codes: r2.reason_codes.map(
        (reason) => `r2_completion_rejected:${reason}`,
      ),
    };
    const taxonomy =
      r2.taxonomy === "not_point_in_time_safe"
        ? "not_point_in_time_safe"
        : r2.taxonomy === "unmappable"
          ? "unmappable"
          : r2.taxonomy === "not_bindable"
            ? "incomplete"
            : "conflicting";
    return failureResult(
      taxonomy,
      sections[3].reason_codes,
      resultOverrides(
        request,
        requestInspection.request_digest,
        authority,
        registryObservation.digest,
        registry,
        sections,
      ),
    );
  }
  sections[2] = { ...sections[2], disposition: "verified", reason_codes: [] };
  sections[3] = { ...sections[3], disposition: "verified", reason_codes: [] };
  const provenance = {
    provenance_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_PROVENANCE_V1,
    sections,
    provenance_digest: sha(sections),
  } as const;
  return canonicalResult({
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1,
    taxonomy: "completed",
    request_identity: {
      completion_identity: request.completion_identity,
      repository_row_identity: request.expected_repository_row_identity,
      evidence_bundle_identity: request.expected_evidence_bundle_identity,
      request_digest: requestInspection.request_digest,
    },
    authority_binding: {
      authority_version:
        RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V1,
      verification_status: "verified",
      expected_registry_digest:
        authority.expected_registry_anchor.registry_digest,
      observed_registry_digest: registryObservation.digest,
      expected_trust_root_digest:
        authority.expected_registry_anchor.expected_trust_root_digest,
      observed_trust_root_digest:
        registry.expected_trust_root_digest,
      expected_lineage_root_digest:
        authority.expected_registry_anchor.expected_lineage_root_digest,
      observed_lineage_root_digest:
        registry.completion_entry.lineage_root_digest,
    },
    observed_input_provenance: provenance,
    completed_projection: deepFreeze(
      structuredClone(bundle.completed_projection),
    ),
    closed_gap_codes: [
      ...RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
    ],
    failure_identity_digest: null,
    reason_codes: ["all_eighteen_not_bindable_gaps_explicitly_closed"],
    ...RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BOUNDARY_V1,
  });
}

export function independentlyVerifyRecommendationOutcomeEvidenceCompletionV1(
  candidate: RecommendationOutcomeEvidenceCompletionResultV1,
  request: unknown,
  dependencies: RecommendationOutcomeEvidenceCompletionDependenciesV1,
) {
  const rebuilt = completeRepositoryOwnedRecommendationOutcomeEvidenceV1(
    request,
    dependencies,
  );
  return (
    stableMarketContextDiagnosticContextJsonV1(candidate) ===
    stableMarketContextDiagnosticContextJsonV1(rebuilt)
  );
}
