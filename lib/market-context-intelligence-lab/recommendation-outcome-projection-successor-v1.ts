import {
  marketContextDiagnosticContextSha256V1,
  stableMarketContextDiagnosticContextJsonV1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2,
  canonicalizeDiagnosticOutcomeAuthorityPlainDataV2,
  snapshotDiagnosticOutcomeAuthorityMaterialV2,
  type DiagnosticDecisionOutcomeCaptureRequestV2,
  type DiagnosticOutcomeAuthorityMaterialV2,
  type DiagnosticOutcomeSourceAuthorityV2,
} from "./diagnostic-decision-outcome-handoff-capture-v2";
import {
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_PAYLOAD_V1,
  type MarketContextDiagnosticOutcomeSourcePayloadV1,
} from "./diagnostic-outcome-source-admission-v1";

export const RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1 =
  "repository_owned_recommendation_outcome_projection_successor_v1" as const;
export const RECOMMENDATION_OUTCOME_PROJECTION_INPUT_V1 =
  "repository_owned_recommendation_outcome_projection_input_v1" as const;
export const RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1 =
  "repository_owned_recommendation_outcome_projection_registry_v1" as const;
export const RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1 =
  "repository_owned_recommendation_outcome_projection_authority_v1" as const;
export const RECOMMENDATION_OUTCOME_PROJECTION_MATERIAL_V1 =
  "repository_owned_recommendation_outcome_projection_material_v1" as const;
export const RECOMMENDATION_OUTCOME_PROJECTION_VERIFIER_V1 =
  "repository_owned_recommendation_outcome_projection_verifier_v1" as const;
export const RECOMMENDATION_OUTCOME_PROJECTION_FAILURE_PROVENANCE_V1 =
  "repository_owned_recommendation_outcome_projection_failure_provenance_v1" as const;

export const RECOMMENDATION_OUTCOME_PROJECTION_TAXONOMY_V1 = [
  "bindable",
  "not_bindable",
  "conflicting",
  "not_point_in_time_safe",
  "unmappable",
] as const;

export type RecommendationOutcomeProjectionTaxonomyV1 =
  (typeof RECOMMENDATION_OUTCOME_PROJECTION_TAXONOMY_V1)[number];

export const RECOMMENDATION_OUTCOME_PROJECTION_BOUNDARY_V1 = {
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

export type RecommendationOutcomeProjectionRequestV1 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1;
  projection_identity: string;
  expected_source_snapshot_identity: string;
};

export type RecommendationOutcomeProjectionInputV1 = {
  projection_version: typeof RECOMMENDATION_OUTCOME_PROJECTION_INPUT_V1;
  producer_owner: {
    identity: string;
    version: string;
  };
  source_contract: {
    schema_version: string;
    contract_version: string;
  };
  external_authority_root_digest: string;
  source_snapshot: {
    identity: string;
    digest: string;
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
  outcome: {
    identity: string;
    evaluator_identity: string;
    evaluator_version: string;
  };
  lineage: {
    identity: string;
    source_lineage_digest: string;
    evaluator_lineage_digest: string;
    outcome_lineage_digest: string;
    provider_source: string;
    provider_version: string;
    context_lineage_digest: string;
  };
  instants: {
    decision_unix_ns: string;
    outcome_start_unix_ns: string;
    outcome_end_unix_ns: string;
    outcome_finalization_unix_ns: string;
    capture_unix_ns: string;
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
  read_only_projection: {
    identity: string;
    projection_digest: string;
    mode: "read_only";
    writes_permitted: false;
    persistence_permitted: false;
  };
  point_in_time: {
    predictor_cutoff_unix_ns: string;
    context_snapshot_digest: string;
    predictor_projection_digest: string;
    outcome_visible_to_predictor: false;
  };
  q1_interop: {
    p2a_capture_request: DiagnosticDecisionOutcomeCaptureRequestV2;
    p2a_registry_anchor:
      DiagnosticOutcomeSourceAuthorityV2["expected_registry_anchor"];
    p2a_authority_material: DiagnosticOutcomeAuthorityMaterialV2;
  };
};

export type RecommendationOutcomeProjectionRegistryV1 = {
  registry_version: typeof RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1;
  registry_identity: string;
  expected_external_authority_root_digest: string;
  projection_entry: {
    projection_identity: string;
    source_snapshot_identity: string;
    observed_input_digest: string;
    verifier_identity: typeof RECOMMENDATION_OUTCOME_PROJECTION_VERIFIER_V1;
    verifier_version: typeof RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1;
  };
};

export type RecommendationOutcomeProjectionMaterialV1 = {
  material_version: typeof RECOMMENDATION_OUTCOME_PROJECTION_MATERIAL_V1;
  registry: RecommendationOutcomeProjectionRegistryV1;
  observed_projection_input: unknown;
};

export type RecommendationOutcomeProjectionAuthorityV1 = {
  authority_version: typeof RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1;
  expected_registry_anchor: {
    registry_identity: string;
    registry_version: typeof RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1;
    registry_digest: string;
  };
  read_projection_material: () => unknown;
};

export type RecommendationOutcomeProjectionDependenciesV1 = {
  enabled: boolean;
  kill_switch: boolean;
  authority?: RecommendationOutcomeProjectionAuthorityV1;
};

export type RecommendationOutcomeProjectionObservedInputV1 = {
  namespace: "projection_material" | "projection_registry" | "projection_input";
  disposition: "absent" | "malformed" | "verified" | "rejected";
  observed_identity: string | null;
  observed_digest: string;
  expected_identity: string | null;
  expected_digest: string | null;
  verifier_identity: typeof RECOMMENDATION_OUTCOME_PROJECTION_VERIFIER_V1;
  verifier_version: typeof RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1;
  reason_codes: string[];
};

export type RecommendationOutcomeBindableProjectionV1 = {
  projection_identity: string;
  projection_digest: string;
  source_snapshot_identity: string;
  source_snapshot_digest: string;
  q1_source_payload: MarketContextDiagnosticOutcomeSourcePayloadV1;
  q1_source_payload_digest: string;
};

export type RecommendationOutcomeProjectionResultV1 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1;
  taxonomy: RecommendationOutcomeProjectionTaxonomyV1;
  request_identity: {
    projection_identity: string | null;
    request_digest: string;
  };
  authority_binding: {
    authority_version:
      | typeof RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1
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
  };
  observed_input_provenance: {
    provenance_version:
      typeof RECOMMENDATION_OUTCOME_PROJECTION_FAILURE_PROVENANCE_V1;
    sections: RecommendationOutcomeProjectionObservedInputV1[];
    provenance_digest: string;
  };
  bindable_projection: RecommendationOutcomeBindableProjectionV1 | null;
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
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as PlainRecord)
    : null;
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function hasOwn(value: PlainRecord | null, key: string) {
  return value !== null && Object.hasOwn(value, key);
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function isUnixNs(value: unknown): value is string {
  return typeof value === "string" && /^(0|[1-9][0-9]*)$/.test(value);
}

function exactKeys(
  value: unknown,
  expected: readonly string[],
  path: string,
  reasons: string[],
) {
  const candidate = record(value);
  if (!candidate) {
    reasons.push(`${path}:object_required`);
    return null;
  }
  const actual = Object.keys(candidate).sort();
  const required = [...expected].sort();
  if (
    actual.length !== required.length ||
    actual.some((key, index) => key !== required[index])
  ) {
    reasons.push(`${path}:closed_schema_violation`);
    return null;
  }
  return candidate;
}

function currentRepositoryRowShape(value: PlainRecord) {
  return (
    nonEmpty(value.id) &&
    nonEmpty(value.horizon) &&
    nonEmpty(value.status) &&
    nonEmpty(value.evaluated_at) &&
    Object.hasOwn(value, "snapshot_fingerprint") &&
    Object.hasOwn(value, "recommendation_id")
  );
}

function projectionDigestBasis(
  input: RecommendationOutcomeProjectionInputV1,
) {
  return {
    ...input,
    read_only_projection: {
      identity: input.read_only_projection.identity,
      mode: input.read_only_projection.mode,
      writes_permitted: input.read_only_projection.writes_permitted,
      persistence_permitted:
        input.read_only_projection.persistence_permitted,
    },
  };
}

export function computeRecommendationOutcomeProjectionDigestV1(
  input: RecommendationOutcomeProjectionInputV1,
) {
  return sha(projectionDigestBasis(input));
}

type InputInspection = {
  input: Readonly<RecommendationOutcomeProjectionInputV1> | null;
  taxonomy: RecommendationOutcomeProjectionTaxonomyV1;
  reason_codes: string[];
};

function inspectProjectionInput(value: unknown): InputInspection {
  const candidate = record(value);
  if (!candidate) {
    return {
      input: null,
      taxonomy: "unmappable",
      reason_codes: ["observed_projection_input_unmappable"],
    };
  }

  if (
    candidate.projection_version !==
    RECOMMENDATION_OUTCOME_PROJECTION_INPUT_V1
  ) {
    if (currentRepositoryRowShape(candidate)) {
      return {
        input: null,
        taxonomy: "not_bindable",
        reason_codes: [
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
          "recommendation_decision_identity_missing",
          "read_only_projection_missing",
          "source_contract_version_missing",
          "source_snapshot_identity_digest_missing",
        ],
      };
    }
    return {
      input: null,
      taxonomy: "unmappable",
      reason_codes: ["projection_contract_version_unmappable"],
    };
  }

  const reasons: string[] = [];
  exactKeys(
    candidate,
    [
      "projection_version",
      "producer_owner",
      "source_contract",
      "external_authority_root_digest",
      "source_snapshot",
      "decision",
      "opportunity_set",
      "outcome",
      "lineage",
      "instants",
      "finality",
      "completeness",
      "read_only_projection",
      "point_in_time",
      "q1_interop",
    ],
    "$projection",
    reasons,
  );
  const top = candidate;
  const producer = exactKeys(
    top?.producer_owner,
    ["identity", "version"],
    "$projection.producer_owner",
    reasons,
  );
  const sourceContract = exactKeys(
    top?.source_contract,
    ["schema_version", "contract_version"],
    "$projection.source_contract",
    reasons,
  );
  const sourceSnapshot = exactKeys(
    top?.source_snapshot,
    ["identity", "digest"],
    "$projection.source_snapshot",
    reasons,
  );
  const decision = exactKeys(
    top?.decision,
    ["recommendation_id", "external_decision_id", "instrument_id"],
    "$projection.decision",
    reasons,
  );
  const opportunity = exactKeys(
    top?.opportunity_set,
    ["identity", "membership_digest", "immutable"],
    "$projection.opportunity_set",
    reasons,
  );
  const outcome = exactKeys(
    top?.outcome,
    ["identity", "evaluator_identity", "evaluator_version"],
    "$projection.outcome",
    reasons,
  );
  const lineage = exactKeys(
    top?.lineage,
    [
      "identity",
      "source_lineage_digest",
      "evaluator_lineage_digest",
      "outcome_lineage_digest",
      "provider_source",
      "provider_version",
      "context_lineage_digest",
    ],
    "$projection.lineage",
    reasons,
  );
  const instants = exactKeys(
    top?.instants,
    [
      "decision_unix_ns",
      "outcome_start_unix_ns",
      "outcome_end_unix_ns",
      "outcome_finalization_unix_ns",
      "capture_unix_ns",
      "evidence_cutoff_unix_ns",
    ],
    "$projection.instants",
    reasons,
  );
  const finality = exactKeys(
    top?.finality,
    ["status", "proof_identity", "proof_digest"],
    "$projection.finality",
    reasons,
  );
  const completeness = exactKeys(
    top?.completeness,
    ["status", "proof_identity", "proof_digest"],
    "$projection.completeness",
    reasons,
  );
  const readOnly = exactKeys(
    top?.read_only_projection,
    [
      "identity",
      "projection_digest",
      "mode",
      "writes_permitted",
      "persistence_permitted",
    ],
    "$projection.read_only_projection",
    reasons,
  );
  const pointInTime = exactKeys(
    top?.point_in_time,
    [
      "predictor_cutoff_unix_ns",
      "context_snapshot_digest",
      "predictor_projection_digest",
      "outcome_visible_to_predictor",
    ],
    "$projection.point_in_time",
    reasons,
  );
  const q1 = exactKeys(
    top?.q1_interop,
    [
      "p2a_capture_request",
      "p2a_registry_anchor",
      "p2a_authority_material",
    ],
    "$projection.q1_interop",
    reasons,
  );

  if (!hasOwn(candidate, "producer_owner")) {
    reasons.push("producer_owner_missing");
  } else if (
    !producer ||
    !nonEmpty(producer.identity) ||
    !nonEmpty(producer.version)
  ) {
    reasons.push("producer_owner_invalid");
  }
  if (!hasOwn(candidate, "source_contract")) {
    reasons.push("source_contract_version_missing");
  } else if (
    !sourceContract ||
    !nonEmpty(sourceContract.schema_version) ||
    !nonEmpty(sourceContract.contract_version)
  ) {
    reasons.push("source_contract_version_invalid");
  }
  if (!hasOwn(candidate, "external_authority_root_digest")) {
    reasons.push("external_authority_root_missing");
  } else if (!isSha256(candidate.external_authority_root_digest)) {
    reasons.push("external_authority_root_invalid");
  }
  if (!hasOwn(candidate, "source_snapshot")) {
    reasons.push("source_snapshot_identity_digest_missing");
  } else if (
    !sourceSnapshot ||
    !nonEmpty(sourceSnapshot.identity) ||
    !isSha256(sourceSnapshot.digest)
  ) {
    reasons.push("source_snapshot_identity_digest_invalid");
  }
  if (!hasOwn(candidate, "decision")) {
    reasons.push("recommendation_decision_identity_missing");
  } else if (
    !decision ||
    !nonEmpty(decision.recommendation_id) ||
    !nonEmpty(decision.external_decision_id) ||
    !nonEmpty(decision.instrument_id)
  ) {
    reasons.push("recommendation_decision_identity_invalid");
  }
  if (!hasOwn(candidate, "opportunity_set")) {
    reasons.push("immutable_membership_missing");
  } else if (
    !opportunity ||
    !nonEmpty(opportunity.identity) ||
    !isSha256(opportunity.membership_digest) ||
    opportunity.immutable !== true
  ) {
    reasons.push("immutable_membership_invalid");
  }
  if (!hasOwn(candidate, "outcome")) {
    reasons.push("evaluator_identity_version_missing");
  } else if (
    !outcome ||
    !nonEmpty(outcome.identity) ||
    !nonEmpty(outcome.evaluator_identity) ||
    !nonEmpty(outcome.evaluator_version)
  ) {
    reasons.push("outcome_evaluator_identity_invalid");
  }
  if (!hasOwn(candidate, "lineage")) {
    reasons.push("cryptographic_lineage_missing");
  } else if (
    !lineage ||
    !nonEmpty(lineage.identity) ||
    !isSha256(lineage.source_lineage_digest) ||
    !isSha256(lineage.evaluator_lineage_digest) ||
    !isSha256(lineage.outcome_lineage_digest) ||
    !nonEmpty(lineage.provider_source) ||
    !nonEmpty(lineage.provider_version) ||
    !isSha256(lineage.context_lineage_digest)
  ) {
    reasons.push("cryptographic_lineage_invalid");
  }
  const instantValues = instants
    ? [
        instants.decision_unix_ns,
        instants.outcome_start_unix_ns,
        instants.outcome_end_unix_ns,
        instants.outcome_finalization_unix_ns,
        instants.capture_unix_ns,
        instants.evidence_cutoff_unix_ns,
      ]
    : [];
  if (!hasOwn(candidate, "instants")) {
    reasons.push(
      "nanosecond_capture_instant_missing",
      "nanosecond_decision_instant_missing",
      "nanosecond_evidence_cutoff_missing",
      "nanosecond_outcome_finalization_instant_missing",
      "nanosecond_outcome_interval_missing",
    );
  } else if (
    !instants ||
    instantValues.length !== 6 ||
    instantValues.some((entry) => !isUnixNs(entry))
  ) {
    if (instants && !hasOwn(instants, "decision_unix_ns")) {
      reasons.push("nanosecond_decision_instant_missing");
    }
    if (instants && !hasOwn(instants, "outcome_finalization_unix_ns")) {
      reasons.push("nanosecond_outcome_finalization_instant_missing");
    }
    if (instants && !hasOwn(instants, "capture_unix_ns")) {
      reasons.push("nanosecond_capture_instant_missing");
    }
    if (instants && !hasOwn(instants, "evidence_cutoff_unix_ns")) {
      reasons.push("nanosecond_evidence_cutoff_missing");
    }
    reasons.push("nanosecond_temporal_projection_invalid");
  }
  if (!hasOwn(candidate, "finality")) {
    reasons.push("finality_proof_missing");
  } else if (
    !finality ||
    finality.status !== "final" ||
    !nonEmpty(finality.proof_identity) ||
    !isSha256(finality.proof_digest)
  ) {
    reasons.push("finality_proof_invalid");
  }
  if (!hasOwn(candidate, "completeness")) {
    reasons.push("completeness_proof_missing");
  } else if (
    !completeness ||
    completeness.status !== "complete" ||
    !nonEmpty(completeness.proof_identity) ||
    !isSha256(completeness.proof_digest)
  ) {
    reasons.push("completeness_proof_invalid");
  }
  if (!hasOwn(candidate, "read_only_projection")) {
    reasons.push("read_only_projection_missing");
  } else if (
    !readOnly ||
    !nonEmpty(readOnly.identity) ||
    !isSha256(readOnly.projection_digest) ||
    readOnly.mode !== "read_only" ||
    readOnly.writes_permitted !== false ||
    readOnly.persistence_permitted !== false
  ) {
    reasons.push("read_only_projection_invalid");
  }
  if (!hasOwn(candidate, "point_in_time")) {
    reasons.push("predictor_point_in_time_binding_missing");
  } else if (
    !pointInTime ||
    !isUnixNs(pointInTime.predictor_cutoff_unix_ns) ||
    !isSha256(pointInTime.context_snapshot_digest) ||
    !isSha256(pointInTime.predictor_projection_digest) ||
    pointInTime.outcome_visible_to_predictor !== false
  ) {
    reasons.push("predictor_point_in_time_binding_invalid");
  }
  if (!hasOwn(candidate, "q1_interop")) {
    reasons.push("q1_interop_material_missing");
  } else if (!q1) {
    reasons.push("q1_interop_material_invalid");
  } else {
    const p2aRequest = record(q1.p2a_capture_request);
    const p2aAnchor = record(q1.p2a_registry_anchor);
    if (
      !p2aRequest ||
      p2aRequest.contract_version !==
        DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2 ||
      !p2aAnchor
    ) {
      reasons.push("q1_interop_contract_invalid");
    } else {
      const p2aSnapshot = snapshotDiagnosticOutcomeAuthorityMaterialV2(
        q1.p2a_authority_material,
        p2aAnchor as unknown as DiagnosticOutcomeSourceAuthorityV2["expected_registry_anchor"],
      );
      if (!p2aSnapshot.ok) {
        reasons.push(
          ...p2aSnapshot.reason_codes.map(
            (reason) => `q1_interop_material:${reason}`,
          ),
        );
      }
    }
  }

  if (reasons.length > 0) {
    return {
      input: null,
      taxonomy: "not_bindable",
      reason_codes: sortedUnique(reasons),
    };
  }

  const input = candidate as unknown as RecommendationOutcomeProjectionInputV1;
  if (
    computeRecommendationOutcomeProjectionDigestV1(input) !==
    input.read_only_projection.projection_digest
  ) {
    return {
      input: null,
      taxonomy: "conflicting",
      reason_codes: ["read_only_projection_digest_mismatch"],
    };
  }
  if (
    input.point_in_time.predictor_cutoff_unix_ns !==
    input.instants.decision_unix_ns
  ) {
    return {
      input: null,
      taxonomy: "not_point_in_time_safe",
      reason_codes: ["predictor_cutoff_decision_mismatch"],
    };
  }
  const times = input.instants;
  if (
    !(
      BigInt(times.decision_unix_ns) <
        BigInt(times.outcome_start_unix_ns) &&
      BigInt(times.outcome_start_unix_ns) <=
        BigInt(times.outcome_end_unix_ns) &&
      BigInt(times.outcome_end_unix_ns) <=
        BigInt(times.outcome_finalization_unix_ns) &&
      BigInt(times.outcome_finalization_unix_ns) <=
        BigInt(times.capture_unix_ns) &&
      BigInt(times.capture_unix_ns) <=
        BigInt(times.evidence_cutoff_unix_ns)
    )
  ) {
    return {
      input: null,
      taxonomy: "not_point_in_time_safe",
      reason_codes: ["outcome_projection_temporal_order_invalid"],
    };
  }
  return {
    input: deepFreeze(structuredClone(input)),
    taxonomy: "bindable",
    reason_codes: [],
  };
}

function validateRegistry(value: unknown) {
  const reasons: string[] = [];
  const registry = exactKeys(
    value,
    [
      "registry_version",
      "registry_identity",
      "expected_external_authority_root_digest",
      "projection_entry",
    ],
    "$registry",
    reasons,
  );
  const entry = exactKeys(
    registry?.projection_entry,
    [
      "projection_identity",
      "source_snapshot_identity",
      "observed_input_digest",
      "verifier_identity",
      "verifier_version",
    ],
    "$registry.projection_entry",
    reasons,
  );
  if (
    registry?.registry_version !==
      RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1 ||
    !nonEmpty(registry?.registry_identity) ||
    !isSha256(registry?.expected_external_authority_root_digest) ||
    !entry ||
    !nonEmpty(entry.projection_identity) ||
    !nonEmpty(entry.source_snapshot_identity) ||
    !isSha256(entry.observed_input_digest) ||
    entry.verifier_identity !==
      RECOMMENDATION_OUTCOME_PROJECTION_VERIFIER_V1 ||
    entry.verifier_version !==
      RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1
  ) {
    reasons.push("projection_registry_invalid");
  }
  return {
    registry:
      reasons.length === 0
        ? (registry as unknown as RecommendationOutcomeProjectionRegistryV1)
        : null,
    reason_codes: sortedUnique(reasons),
  };
}

function validateRequest(value: unknown) {
  const canonical = canonicalizeDiagnosticOutcomeAuthorityPlainDataV2(value);
  if (!canonical.ok) {
    return {
      request: null,
      request_digest: canonical.sanitized_projection_digest,
      reason_codes: canonical.reason_codes,
    };
  }
  const reasons: string[] = [];
  const request = exactKeys(
    canonical.value,
    [
      "contract_version",
      "projection_identity",
      "expected_source_snapshot_identity",
    ],
    "$request",
    reasons,
  );
  if (
    request?.contract_version !==
      RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1 ||
    !nonEmpty(request?.projection_identity) ||
    !nonEmpty(request?.expected_source_snapshot_identity)
  ) {
    reasons.push("projection_request_invalid");
  }
  return {
    request:
      reasons.length === 0
        ? (request as unknown as RecommendationOutcomeProjectionRequestV1)
        : null,
    request_digest: sha(canonical.value),
    reason_codes: sortedUnique(reasons),
  };
}

const ABSENT_DIGEST = sha({
  disposition: "absent",
  namespace: "recommendation_outcome_projection",
});

function observedSection(
  namespace: RecommendationOutcomeProjectionObservedInputV1["namespace"],
  overrides: Partial<RecommendationOutcomeProjectionObservedInputV1> = {},
): RecommendationOutcomeProjectionObservedInputV1 {
  return {
    namespace,
    disposition: "absent",
    observed_identity: null,
    observed_digest: ABSENT_DIGEST,
    expected_identity: null,
    expected_digest: null,
    verifier_identity: RECOMMENDATION_OUTCOME_PROJECTION_VERIFIER_V1,
    verifier_version: RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
    reason_codes: [],
    ...overrides,
  };
}

function buildQ1Payload(
  input: RecommendationOutcomeProjectionInputV1,
): MarketContextDiagnosticOutcomeSourcePayloadV1 {
  return {
    payload_version: MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_PAYLOAD_V1,
    source_identity: input.source_snapshot.identity,
    schema_version: input.source_contract.schema_version,
    contract_version: input.source_contract.contract_version,
    producer: structuredClone(input.producer_owner),
    decision_identity: {
      external_decision_id: input.decision.external_decision_id,
      instrument_id: input.decision.instrument_id,
    },
    opportunity_set: {
      identity: input.opportunity_set.identity,
      membership_digest: input.opportunity_set.membership_digest,
    },
    outcome: structuredClone(input.outcome),
    lineage: {
      identity: input.lineage.identity,
      provider_source: input.lineage.provider_source,
      provider_version: input.lineage.provider_version,
      evaluator_lineage_digest:
        input.lineage.evaluator_lineage_digest,
      outcome_lineage_digest: input.lineage.outcome_lineage_digest,
    },
    instants: {
      decision_unix_ns: input.instants.decision_unix_ns,
      outcome_start_unix_ns: input.instants.outcome_start_unix_ns,
      outcome_end_unix_ns: input.instants.outcome_end_unix_ns,
      outcome_finalization_unix_ns:
        input.instants.outcome_finalization_unix_ns,
      capture_unix_ns: input.instants.capture_unix_ns,
      cutoff_unix_ns: input.instants.evidence_cutoff_unix_ns,
    },
    finality: {
      status: "final",
      proof_identity: input.finality.proof_identity,
      proof_digest: input.finality.proof_digest,
    },
    completeness: {
      status: "complete",
      evidence_digest: input.completeness.proof_digest,
    },
    point_in_time: structuredClone(input.point_in_time),
    access: {
      mode: "read_only",
      writes_permitted: false,
      persistence_permitted: false,
    },
    p2a_capture_request: structuredClone(
      input.q1_interop.p2a_capture_request,
    ),
    p2a_registry_anchor: structuredClone(
      input.q1_interop.p2a_registry_anchor,
    ),
    p2a_authority_material: structuredClone(
      input.q1_interop.p2a_authority_material,
    ),
  };
}

function resultWithDigest(
  value: Omit<RecommendationOutcomeProjectionResultV1, "result_digest">,
) {
  return deepFreeze({
    ...value,
    result_digest: sha(value),
  }) as RecommendationOutcomeProjectionResultV1;
}

function baseResult(
  taxonomy: RecommendationOutcomeProjectionTaxonomyV1,
  verificationStatus:
    RecommendationOutcomeProjectionResultV1["authority_binding"]["verification_status"],
  reasonCodes: string[],
  overrides: Partial<
    Omit<RecommendationOutcomeProjectionResultV1, "result_digest">
  > = {},
) {
  const sections =
    overrides.observed_input_provenance?.sections ??
    [
      observedSection("projection_material"),
      observedSection("projection_registry"),
      observedSection("projection_input"),
    ];
  const reasons = sortedUnique(reasonCodes);
  const provenance = {
    provenance_version:
      RECOMMENDATION_OUTCOME_PROJECTION_FAILURE_PROVENANCE_V1,
    sections,
    provenance_digest: sha(sections),
  } as const;
  const requestIdentity = overrides.request_identity ?? {
    projection_identity: null,
    request_digest: ABSENT_DIGEST,
  };
  const authorityBinding = overrides.authority_binding ?? {
    authority_version: null,
    verification_status: verificationStatus,
    expected_registry_digest: null,
    observed_registry_digest: null,
  };
  const failureIdentity =
    taxonomy === "bindable"
      ? null
      : sha({
          taxonomy,
          request_identity: requestIdentity,
          authority_binding: authorityBinding,
          observed_input_provenance: provenance,
          reason_codes: reasons,
        });
  return resultWithDigest({
    contract_version: RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
    taxonomy,
    request_identity: requestIdentity,
    authority_binding: authorityBinding,
    observed_input_provenance: provenance,
    bindable_projection: null,
    failure_identity_digest: failureIdentity,
    reason_codes: reasons,
    ...RECOMMENDATION_OUTCOME_PROJECTION_BOUNDARY_V1,
    ...overrides,
  });
}

const DEFAULT_OFF_RESULT = baseResult(
  "not_bindable",
  "not_read_default_off",
  ["projection_successor_default_off"],
);
const KILL_SWITCH_RESULT = baseResult(
  "not_bindable",
  "not_read_kill_switch",
  ["projection_successor_kill_switch"],
);

export function projectRepositoryOwnedRecommendationOutcomeV1(
  requestValue: unknown,
  dependencies: RecommendationOutcomeProjectionDependenciesV1,
): RecommendationOutcomeProjectionResultV1 {
  if (!dependencies.enabled) return DEFAULT_OFF_RESULT;
  if (dependencies.kill_switch) return KILL_SWITCH_RESULT;

  const requestCheck = validateRequest(requestValue);
  if (!requestCheck.request) {
    return baseResult("unmappable", "invalid", requestCheck.reason_codes, {
      request_identity: {
        projection_identity: null,
        request_digest: requestCheck.request_digest,
      },
    });
  }
  const request = requestCheck.request;
  const requestIdentity = {
    projection_identity: request.projection_identity,
    request_digest: requestCheck.request_digest,
  };
  const authority = dependencies.authority;
  if (
    !authority ||
    authority.authority_version !==
      RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1
  ) {
    return baseResult("not_bindable", "missing", [
      "external_projection_authority_missing",
    ], { request_identity: requestIdentity });
  }

  let anchor: RecommendationOutcomeProjectionAuthorityV1["expected_registry_anchor"];
  let observed: unknown;
  try {
    anchor = structuredClone(authority.expected_registry_anchor);
    observed = authority.read_projection_material();
  } catch {
    return baseResult("not_bindable", "lookup_failed", [
      "projection_authority_lookup_failed_sanitized",
    ], {
      request_identity: requestIdentity,
      authority_binding: {
        authority_version:
          RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
        verification_status: "lookup_failed",
        expected_registry_digest: null,
        observed_registry_digest: null,
      },
    });
  }

  const canonical = canonicalizeDiagnosticOutcomeAuthorityPlainDataV2(
    observed,
  );
  if (!canonical.ok) {
    const sections = [
      observedSection("projection_material", {
        disposition: "malformed",
        observed_digest: canonical.sanitized_projection_digest,
        expected_identity: anchor.registry_identity,
        expected_digest: anchor.registry_digest,
        reason_codes: canonical.reason_codes,
      }),
      observedSection("projection_registry"),
      observedSection("projection_input"),
    ];
    return baseResult("unmappable", "invalid", canonical.reason_codes, {
      request_identity: requestIdentity,
      authority_binding: {
        authority_version:
          RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
        verification_status: "invalid",
        expected_registry_digest: anchor.registry_digest,
        observed_registry_digest: null,
      },
      observed_input_provenance: {
        provenance_version:
          RECOMMENDATION_OUTCOME_PROJECTION_FAILURE_PROVENANCE_V1,
        sections,
        provenance_digest: sha(sections),
      },
    });
  }
  const materialDigest = sha(canonical.value);
  const materialReasons: string[] = [];
  const material = exactKeys(
    canonical.value,
    ["material_version", "registry", "observed_projection_input"],
    "$material",
    materialReasons,
  );
  if (
    material?.material_version !==
    RECOMMENDATION_OUTCOME_PROJECTION_MATERIAL_V1
  ) {
    materialReasons.push("projection_material_version_invalid");
  }
  const registryCheck = validateRegistry(material?.registry);
  materialReasons.push(...registryCheck.reason_codes);
  const registry = registryCheck.registry;
  const registryDigest = registry ? sha(registry) : null;
  const inputDigest = sha(material?.observed_projection_input ?? null);
  const baseSections = [
    observedSection("projection_material", {
      disposition:
        materialReasons.length === 0 ? "verified" : "rejected",
      observed_identity: registry?.registry_identity ?? null,
      observed_digest: materialDigest,
      expected_identity: anchor.registry_identity,
      expected_digest: anchor.registry_digest,
      reason_codes: sortedUnique(materialReasons),
    }),
    observedSection("projection_registry", {
      disposition: registry ? "verified" : "rejected",
      observed_identity: registry?.registry_identity ?? null,
      observed_digest: registryDigest ?? ABSENT_DIGEST,
      expected_identity: anchor.registry_identity,
      expected_digest: anchor.registry_digest,
      reason_codes: registryCheck.reason_codes,
    }),
    observedSection("projection_input", {
      disposition: "rejected",
      observed_identity:
        record(material?.observed_projection_input)?.source_snapshot &&
        record(record(material?.observed_projection_input)?.source_snapshot)
          ?.identity
          ? String(
              record(record(material?.observed_projection_input)?.source_snapshot)
                ?.identity,
            )
          : null,
      observed_digest: inputDigest,
      expected_identity:
        registry?.projection_entry.source_snapshot_identity ?? null,
      expected_digest:
        registry?.projection_entry.observed_input_digest ?? null,
    }),
  ];

  if (materialReasons.length > 0 || !registry || !material) {
    return baseResult("unmappable", "invalid", materialReasons, {
      request_identity: requestIdentity,
      authority_binding: {
        authority_version:
          RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
        verification_status: "invalid",
        expected_registry_digest: anchor.registry_digest,
        observed_registry_digest: registryDigest,
      },
      observed_input_provenance: {
        provenance_version:
          RECOMMENDATION_OUTCOME_PROJECTION_FAILURE_PROVENANCE_V1,
        sections: baseSections,
        provenance_digest: sha(baseSections),
      },
    });
  }

  if (
    anchor.registry_identity !== registry.registry_identity ||
    anchor.registry_version !== registry.registry_version ||
    anchor.registry_digest !== registryDigest
  ) {
    return baseResult("conflicting", "mismatch", [
      "external_registry_anchor_mismatch",
    ], {
      request_identity: requestIdentity,
      authority_binding: {
        authority_version:
          RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
        verification_status: "mismatch",
        expected_registry_digest: anchor.registry_digest,
        observed_registry_digest: registryDigest,
      },
      observed_input_provenance: {
        provenance_version:
          RECOMMENDATION_OUTCOME_PROJECTION_FAILURE_PROVENANCE_V1,
        sections: baseSections,
        provenance_digest: sha(baseSections),
      },
    });
  }
  const conflicts: string[] = [];
  if (
    registry.projection_entry.observed_input_digest !== inputDigest
  ) {
    conflicts.push("observed_projection_input_digest_mismatch");
  }
  if (
    registry.projection_entry.projection_identity !==
    request.projection_identity
  ) {
    conflicts.push("projection_identity_mismatch");
  }
  if (
    registry.projection_entry.source_snapshot_identity !==
    request.expected_source_snapshot_identity
  ) {
    conflicts.push("source_snapshot_identity_mismatch");
  }
  if (conflicts.length > 0) {
    baseSections[2] = {
      ...baseSections[2],
      disposition: "rejected",
      reason_codes: sortedUnique(conflicts),
    };
    return baseResult("conflicting", "verified", conflicts, {
      request_identity: requestIdentity,
      authority_binding: {
        authority_version:
          RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
        verification_status: "verified",
        expected_registry_digest: anchor.registry_digest,
        observed_registry_digest: registryDigest,
      },
      observed_input_provenance: {
        provenance_version:
          RECOMMENDATION_OUTCOME_PROJECTION_FAILURE_PROVENANCE_V1,
        sections: baseSections,
        provenance_digest: sha(baseSections),
      },
    });
  }

  const inputInspection = inspectProjectionInput(
    material.observed_projection_input,
  );
  if (!inputInspection.input) {
    baseSections[2] = {
      ...baseSections[2],
      disposition: "rejected",
      reason_codes: inputInspection.reason_codes,
    };
    return baseResult(
      inputInspection.taxonomy,
      "verified",
      inputInspection.reason_codes,
      {
        request_identity: requestIdentity,
        authority_binding: {
          authority_version:
            RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
          verification_status: "verified",
          expected_registry_digest: anchor.registry_digest,
          observed_registry_digest: registryDigest,
        },
        observed_input_provenance: {
          provenance_version:
            RECOMMENDATION_OUTCOME_PROJECTION_FAILURE_PROVENANCE_V1,
          sections: baseSections,
          provenance_digest: sha(baseSections),
        },
      },
    );
  }
  const input = inputInspection.input;
  if (
    input.external_authority_root_digest !==
    registry.expected_external_authority_root_digest
  ) {
    const reasons = ["external_authority_root_mismatch"];
    baseSections[2] = {
      ...baseSections[2],
      disposition: "rejected",
      reason_codes: reasons,
    };
    return baseResult("conflicting", "verified", reasons, {
      request_identity: requestIdentity,
      authority_binding: {
        authority_version:
          RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
        verification_status: "verified",
        expected_registry_digest: anchor.registry_digest,
        observed_registry_digest: registryDigest,
      },
      observed_input_provenance: {
        provenance_version:
          RECOMMENDATION_OUTCOME_PROJECTION_FAILURE_PROVENANCE_V1,
        sections: baseSections,
        provenance_digest: sha(baseSections),
      },
    });
  }

  const q1Payload = deepFreeze(buildQ1Payload(input));
  const bindableProjection = deepFreeze({
    projection_identity: input.read_only_projection.identity,
    projection_digest: input.read_only_projection.projection_digest,
    source_snapshot_identity: input.source_snapshot.identity,
    source_snapshot_digest: input.source_snapshot.digest,
    q1_source_payload: q1Payload,
    q1_source_payload_digest: sha(q1Payload),
  });
  baseSections[2] = {
    ...baseSections[2],
    disposition: "verified",
    reason_codes: [],
  };
  const provenance = {
    provenance_version:
      RECOMMENDATION_OUTCOME_PROJECTION_FAILURE_PROVENANCE_V1,
    sections: baseSections,
    provenance_digest: sha(baseSections),
  } as const;
  return resultWithDigest({
    contract_version: RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
    taxonomy: "bindable",
    request_identity: requestIdentity,
    authority_binding: {
      authority_version: RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
      verification_status: "verified",
      expected_registry_digest: anchor.registry_digest,
      observed_registry_digest: registryDigest,
    },
    observed_input_provenance: provenance,
    bindable_projection: bindableProjection,
    failure_identity_digest: null,
    reason_codes: ["repository_owned_outcome_projection_bindable"],
    ...RECOMMENDATION_OUTCOME_PROJECTION_BOUNDARY_V1,
  });
}

export function independentlyVerifyRecommendationOutcomeProjectionV1(
  candidate: RecommendationOutcomeProjectionResultV1,
  request: unknown,
  dependencies: RecommendationOutcomeProjectionDependenciesV1,
) {
  const rebuilt = projectRepositoryOwnedRecommendationOutcomeV1(
    request,
    dependencies,
  );
  return (
    stableMarketContextDiagnosticContextJsonV1(candidate) ===
    stableMarketContextDiagnosticContextJsonV1(rebuilt)
  );
}
