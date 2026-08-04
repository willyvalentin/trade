import {
  parseDatabentoExplicitNanosecondInstantV1,
} from "./databento-explicit-nanosecond-instant-v1";
import {
  marketContextDiagnosticContextSha256V1,
  stableMarketContextDiagnosticContextJsonV1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2,
  DIAGNOSTIC_OUTCOME_AUTHORITY_MATERIAL_V2,
  DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2,
  DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V2,
  canonicalizeDiagnosticOutcomeAuthorityPlainDataV2,
  snapshotDiagnosticOutcomeAuthorityMaterialV2,
  type DiagnosticDecisionOutcomeCaptureRequestV2,
  type DiagnosticOutcomeAuthorityMaterialV2,
  type DiagnosticOutcomeSourceAuthorityV2,
} from "./diagnostic-decision-outcome-handoff-capture-v2";

export const MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1 =
  "market_context_diagnostic_outcome_source_admission_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1 =
  "market_context_diagnostic_outcome_source_registry_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1 =
  "market_context_diagnostic_outcome_source_authority_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_MATERIAL_V1 =
  "market_context_diagnostic_outcome_source_material_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_PAYLOAD_V1 =
  "market_context_diagnostic_outcome_source_payload_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_FAILURE_PROVENANCE_V1 =
  "market_context_diagnostic_outcome_source_failure_provenance_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_VERIFIER_V1 =
  "market_context_diagnostic_outcome_source_verifier_v1" as const;

export const MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_TAXONOMY_V1 = [
  "ready",
  "incomplete",
  "conflicting",
  "not_point_in_time_safe",
  "unmappable",
] as const;

export type MarketContextDiagnosticOutcomeSourceTaxonomyV1 =
  (typeof MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_TAXONOMY_V1)[number];

export const MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_BOUNDARY_V1 = {
  diagnostic_only: true,
  shadow_only: true,
  read_only: true,
  official_ohlcv: false,
  canonical_performance_eligible: false,
  automatic_model_input_allowed: false,
  automatic_training_allowed: false,
  automatic_promotion_allowed: false,
  probability_claimed: false,
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

export type MarketContextDiagnosticOutcomeSourceAdmissionRequestV1 = {
  contract_version: typeof MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1;
  admission_identity: string;
  expected_source_identity: string;
  period: string;
  cohort: string;
};

export type MarketContextDiagnosticOutcomeSourceRegistryV1 = {
  registry_version: typeof MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1;
  registry_identity: string;
  producer: {
    identity: string;
    version: string;
  };
  expected_trust_root_digest: string;
  validity: {
    effective_from_unix_ns: string;
    effective_until_unix_ns: string;
  };
  source: {
    namespace: "diagnostic_outcome_source";
    schema_version: string;
    contract_version: string;
    payload_identity: string;
    payload_digest: string;
    verifier_identity: string;
    verifier_version: string;
  };
};

export type MarketContextDiagnosticOutcomeSourcePayloadV1 = {
  payload_version: typeof MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_PAYLOAD_V1;
  source_identity: string;
  schema_version: string;
  contract_version: string;
  producer: {
    identity: string;
    version: string;
  };
  decision_identity: {
    external_decision_id: string;
    instrument_id: string;
  };
  opportunity_set: {
    identity: string;
    membership_digest: string;
  };
  outcome: {
    identity: string;
    evaluator_identity: string;
    evaluator_version: string;
  };
  lineage: {
    identity: string;
    provider_source: string;
    provider_version: string;
    evaluator_lineage_digest: string;
    outcome_lineage_digest: string;
  };
  instants: {
    decision_unix_ns: string;
    outcome_start_unix_ns: string;
    outcome_end_unix_ns: string;
    outcome_finalization_unix_ns: string;
    capture_unix_ns: string;
    cutoff_unix_ns: string;
  };
  finality: {
    status: "final" | "pending";
    proof_identity: string;
    proof_digest: string;
  };
  completeness: {
    status: "complete" | "incomplete";
    evidence_digest: string;
  };
  point_in_time: {
    predictor_cutoff_unix_ns: string;
    context_snapshot_digest: string;
    predictor_projection_digest: string;
    outcome_visible_to_predictor: false;
  };
  access: {
    mode: "read_only";
    writes_permitted: false;
    persistence_permitted: false;
  };
  p2a_capture_request: DiagnosticDecisionOutcomeCaptureRequestV2;
  p2a_registry_anchor:
    DiagnosticOutcomeSourceAuthorityV2["expected_registry_anchor"];
  p2a_authority_material: DiagnosticOutcomeAuthorityMaterialV2;
};

export type MarketContextDiagnosticOutcomeSourceMaterialV1 = {
  material_version: typeof MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_MATERIAL_V1;
  registry: MarketContextDiagnosticOutcomeSourceRegistryV1;
  observed_source_payload: MarketContextDiagnosticOutcomeSourcePayloadV1;
};

export type MarketContextDiagnosticOutcomeSourceAuthorityV1 = {
  authority_version: typeof MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1;
  expected_registry_anchor: {
    registry_identity: string;
    registry_version:
      typeof MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1;
    registry_digest: string;
  };
  read_admission_material: () => unknown;
};

export type MarketContextDiagnosticOutcomeSourceDependenciesV1 = {
  enabled: boolean;
  kill_switch: boolean;
  authority?: MarketContextDiagnosticOutcomeSourceAuthorityV1;
};

export type MarketContextDiagnosticOutcomeSourceObservedSectionV1 = {
  namespace:
    | "admission_request"
    | "admission_material"
    | "source_registry"
    | "source_payload";
  schema_version: string | null;
  observed_identity: string | null;
  observed_digest: string;
  disposition: "absent" | "malformed" | "verified" | "rejected";
  expected_identity: string | null;
  expected_digest: string | null;
  verifier_identity: string;
  verifier_version: string;
  reason_codes: string[];
};

export type MarketContextDiagnosticOutcomeSourceReadyHandoffV1 = {
  source_identity: string;
  source_payload_digest: string;
  source_registry_identity: string;
  source_registry_digest: string;
  trust_root_digest: string;
  p2a_capture_request: DiagnosticDecisionOutcomeCaptureRequestV2;
  p2a_authority: {
    authority_version: typeof DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2;
    expected_registry_anchor:
      DiagnosticOutcomeSourceAuthorityV2["expected_registry_anchor"];
    authority_material: DiagnosticOutcomeAuthorityMaterialV2;
  };
  handoff_digest: string;
};

export type MarketContextDiagnosticOutcomeSourceAdmissionResultV1 = {
  contract_version: typeof MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1;
  taxonomy: MarketContextDiagnosticOutcomeSourceTaxonomyV1;
  request_identity: {
    admission_identity: string;
    request_digest: string;
  };
  authority_binding: {
    authority_version:
      | typeof MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1
      | null;
    verification_status:
      | "verified"
      | "not_read_default_off"
      | "not_read_kill_switch"
      | "missing"
      | "invalid"
      | "lookup_failed"
      | "mismatch";
  };
  registry_binding: {
    registry_identity: string | null;
    registry_version:
      | typeof MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1
      | null;
    observed_registry_digest: string | null;
    expected_registry_digest: string | null;
    source_payload_digest: string | null;
    trust_root_digest: string | null;
  };
  observed_input_provenance: {
    provenance_version:
      typeof MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_FAILURE_PROVENANCE_V1;
    sections: MarketContextDiagnosticOutcomeSourceObservedSectionV1[];
    provenance_digest: string;
  };
  ready_handoff: MarketContextDiagnosticOutcomeSourceReadyHandoffV1 | null;
  failure_identity_digest: string | null;
  reason_codes: string[];
  diagnostic_only: true;
  shadow_only: true;
  read_only: true;
  official_ohlcv: false;
  canonical_performance_eligible: false;
  automatic_model_input_allowed: false;
  automatic_training_allowed: false;
  automatic_promotion_allowed: false;
  probability_claimed: false;
  causal_claimed: false;
  live_ranking_effect: false;
  result_digest: string;
};

type Inspection = {
  material: Readonly<MarketContextDiagnosticOutcomeSourceMaterialV1> | null;
  registry: Readonly<MarketContextDiagnosticOutcomeSourceRegistryV1> | null;
  payload: Readonly<MarketContextDiagnosticOutcomeSourcePayloadV1> | null;
  material_digest: string;
  registry_digest: string | null;
  payload_digest: string | null;
  registry_disposition: "absent" | "malformed" | "verified" | "rejected";
  payload_disposition: "absent" | "malformed" | "verified" | "rejected";
  reasons: string[];
};

const ZERO_DIGEST = marketContextDiagnosticContextSha256V1({
  disposition: "absent",
});

function sha(value: unknown) {
  return marketContextDiagnosticContextSha256V1(value);
}

function sortedUnique(values: string[]) {
  return [...new Set(values)].sort((left, right) =>
    left.localeCompare(right),
  );
}

function record(value: unknown): PlainRecord | null {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as PlainRecord)
    : null;
}

function exactKeys(
  value: unknown,
  keys: readonly string[],
  path: string,
  reasons: string[],
) {
  const candidate = record(value);
  if (!candidate) {
    reasons.push(`object_required:${path}`);
    return null;
  }
  const actual = Object.keys(candidate).sort();
  const expected = [...keys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    reasons.push(`closed_schema_violation:${path}`);
    return null;
  }
  return candidate;
}

function nonEmpty(value: unknown) {
  return typeof value === "string" && value.length > 0;
}

function isSha256(value: unknown) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function isUnixNs(value: unknown) {
  return typeof value === "string" && /^(0|[1-9][0-9]*)$/.test(value);
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function section(
  namespace: MarketContextDiagnosticOutcomeSourceObservedSectionV1["namespace"],
  overrides: Partial<MarketContextDiagnosticOutcomeSourceObservedSectionV1>,
): MarketContextDiagnosticOutcomeSourceObservedSectionV1 {
  return {
    namespace,
    schema_version: null,
    observed_identity: null,
    observed_digest: ZERO_DIGEST,
    disposition: "absent",
    expected_identity: null,
    expected_digest: null,
    verifier_identity: MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_VERIFIER_V1,
    verifier_version: MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1,
    ...overrides,
    reason_codes: sortedUnique(overrides.reason_codes ?? []),
  };
}

function requestCheck(value: unknown) {
  const canonical = canonicalizeDiagnosticOutcomeAuthorityPlainDataV2(value);
  if (!canonical.ok) {
    return {
      request: null,
      digest: canonical.sanitized_projection_digest,
      reasons: canonical.reason_codes,
    };
  }
  const reasons: string[] = [];
  const candidate = exactKeys(
    canonical.value,
    [
      "contract_version",
      "admission_identity",
      "expected_source_identity",
      "period",
      "cohort",
    ],
    "$request",
    reasons,
  );
  if (
    candidate?.contract_version !==
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1 ||
    !nonEmpty(candidate?.admission_identity) ||
    !nonEmpty(candidate?.expected_source_identity) ||
    !nonEmpty(candidate?.period) ||
    !nonEmpty(candidate?.cohort)
  ) {
    reasons.push("admission_request_invalid");
  }
  return {
    request:
      reasons.length === 0
        ? (canonical.value as MarketContextDiagnosticOutcomeSourceAdmissionRequestV1)
        : null,
    digest: sha(canonical.value),
    reasons: sortedUnique(reasons),
  };
}

function validateRegistry(
  value: unknown,
  reasons: string[],
): MarketContextDiagnosticOutcomeSourceRegistryV1 | null {
  const registry = exactKeys(
    value,
    [
      "registry_version",
      "registry_identity",
      "producer",
      "expected_trust_root_digest",
      "validity",
      "source",
    ],
    "$material.registry",
    reasons,
  );
  const producer = exactKeys(
    registry?.producer,
    ["identity", "version"],
    "$material.registry.producer",
    reasons,
  );
  const validity = exactKeys(
    registry?.validity,
    ["effective_from_unix_ns", "effective_until_unix_ns"],
    "$material.registry.validity",
    reasons,
  );
  const source = exactKeys(
    registry?.source,
    [
      "namespace",
      "schema_version",
      "contract_version",
      "payload_identity",
      "payload_digest",
      "verifier_identity",
      "verifier_version",
    ],
    "$material.registry.source",
    reasons,
  );
  if (
    registry?.registry_version !==
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1 ||
    !nonEmpty(registry?.registry_identity) ||
    !nonEmpty(producer?.identity) ||
    !nonEmpty(producer?.version) ||
    !isSha256(registry?.expected_trust_root_digest) ||
    !isUnixNs(validity?.effective_from_unix_ns) ||
    !isUnixNs(validity?.effective_until_unix_ns) ||
    (isUnixNs(validity?.effective_from_unix_ns) &&
      isUnixNs(validity?.effective_until_unix_ns) &&
      BigInt(String(validity?.effective_from_unix_ns)) >=
        BigInt(String(validity?.effective_until_unix_ns))) ||
    source?.namespace !== "diagnostic_outcome_source" ||
    !nonEmpty(source?.schema_version) ||
    !nonEmpty(source?.contract_version) ||
    !nonEmpty(source?.payload_identity) ||
    !isSha256(source?.payload_digest) ||
    !nonEmpty(source?.verifier_identity) ||
    !nonEmpty(source?.verifier_version)
  ) {
    reasons.push("source_registry_contract_invalid");
  }
  return reasons.length === 0
    ? (value as MarketContextDiagnosticOutcomeSourceRegistryV1)
    : null;
}

function validatePayloadShape(
  value: unknown,
  reasons: string[],
): MarketContextDiagnosticOutcomeSourcePayloadV1 | null {
  const payload = exactKeys(
    value,
    [
      "payload_version",
      "source_identity",
      "schema_version",
      "contract_version",
      "producer",
      "decision_identity",
      "opportunity_set",
      "outcome",
      "lineage",
      "instants",
      "finality",
      "completeness",
      "point_in_time",
      "access",
      "p2a_capture_request",
      "p2a_registry_anchor",
      "p2a_authority_material",
    ],
    "$material.observed_source_payload",
    reasons,
  );
  const producer = exactKeys(
    payload?.producer,
    ["identity", "version"],
    "$payload.producer",
    reasons,
  );
  const decision = exactKeys(
    payload?.decision_identity,
    ["external_decision_id", "instrument_id"],
    "$payload.decision_identity",
    reasons,
  );
  const opportunity = exactKeys(
    payload?.opportunity_set,
    ["identity", "membership_digest"],
    "$payload.opportunity_set",
    reasons,
  );
  const outcome = exactKeys(
    payload?.outcome,
    ["identity", "evaluator_identity", "evaluator_version"],
    "$payload.outcome",
    reasons,
  );
  const lineage = exactKeys(
    payload?.lineage,
    [
      "identity",
      "provider_source",
      "provider_version",
      "evaluator_lineage_digest",
      "outcome_lineage_digest",
    ],
    "$payload.lineage",
    reasons,
  );
  const instants = exactKeys(
    payload?.instants,
    [
      "decision_unix_ns",
      "outcome_start_unix_ns",
      "outcome_end_unix_ns",
      "outcome_finalization_unix_ns",
      "capture_unix_ns",
      "cutoff_unix_ns",
    ],
    "$payload.instants",
    reasons,
  );
  const finality = exactKeys(
    payload?.finality,
    ["status", "proof_identity", "proof_digest"],
    "$payload.finality",
    reasons,
  );
  const completeness = exactKeys(
    payload?.completeness,
    ["status", "evidence_digest"],
    "$payload.completeness",
    reasons,
  );
  const pointInTime = exactKeys(
    payload?.point_in_time,
    [
      "predictor_cutoff_unix_ns",
      "context_snapshot_digest",
      "predictor_projection_digest",
      "outcome_visible_to_predictor",
    ],
    "$payload.point_in_time",
    reasons,
  );
  const access = exactKeys(
    payload?.access,
    ["mode", "writes_permitted", "persistence_permitted"],
    "$payload.access",
    reasons,
  );
  const p2aRequest = exactKeys(
    payload?.p2a_capture_request,
    [
      "contract_version",
      "capture_identity",
      "period",
      "cohort",
      "source_references",
    ],
    "$payload.p2a_capture_request",
    reasons,
  );
  const p2aReferences = exactKeys(
    p2aRequest?.source_references,
    [
      "decision_source_identity",
      "opportunity_set_source_identity",
      "evaluator_outcome_source_identity",
      "provider_context_source_identity",
      "cost_slippage_source_identity",
    ],
    "$payload.p2a_capture_request.source_references",
    reasons,
  );
  const p2aAnchor = exactKeys(
    payload?.p2a_registry_anchor,
    [
      "registry_identity",
      "registry_version",
      "registry_snapshot_digest",
    ],
    "$payload.p2a_registry_anchor",
    reasons,
  );
  if (
    payload?.payload_version !==
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_PAYLOAD_V1 ||
    !nonEmpty(payload?.source_identity) ||
    !nonEmpty(payload?.schema_version) ||
    !nonEmpty(payload?.contract_version) ||
    !nonEmpty(producer?.identity) ||
    !nonEmpty(producer?.version) ||
    !nonEmpty(decision?.external_decision_id) ||
    !nonEmpty(decision?.instrument_id) ||
    !nonEmpty(opportunity?.identity) ||
    !isSha256(opportunity?.membership_digest) ||
    !nonEmpty(outcome?.identity) ||
    !nonEmpty(outcome?.evaluator_identity) ||
    !nonEmpty(outcome?.evaluator_version) ||
    !nonEmpty(lineage?.identity) ||
    !nonEmpty(lineage?.provider_source) ||
    !nonEmpty(lineage?.provider_version) ||
    !isSha256(lineage?.evaluator_lineage_digest) ||
    !isSha256(lineage?.outcome_lineage_digest) ||
    !Object.values(instants ?? {}).every(isUnixNs) ||
    !["final", "pending"].includes(String(finality?.status)) ||
    !nonEmpty(finality?.proof_identity) ||
    !isSha256(finality?.proof_digest) ||
    !["complete", "incomplete"].includes(String(completeness?.status)) ||
    !isSha256(completeness?.evidence_digest) ||
    !isUnixNs(pointInTime?.predictor_cutoff_unix_ns) ||
    !isSha256(pointInTime?.context_snapshot_digest) ||
    !isSha256(pointInTime?.predictor_projection_digest) ||
    pointInTime?.outcome_visible_to_predictor !== false ||
    access?.mode !== "read_only" ||
    access?.writes_permitted !== false ||
    access?.persistence_permitted !== false ||
    p2aRequest?.contract_version !==
      DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2 ||
    !nonEmpty(p2aRequest?.capture_identity) ||
    !nonEmpty(p2aRequest?.period) ||
    !nonEmpty(p2aRequest?.cohort) ||
    ![
      p2aReferences?.decision_source_identity,
      p2aReferences?.opportunity_set_source_identity,
      p2aReferences?.evaluator_outcome_source_identity,
      p2aReferences?.provider_context_source_identity,
      p2aReferences?.cost_slippage_source_identity,
    ].every(nonEmpty) ||
    !nonEmpty(p2aAnchor?.registry_identity) ||
    p2aAnchor?.registry_version !== DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V2 ||
    !isSha256(p2aAnchor?.registry_snapshot_digest)
  ) {
    reasons.push("source_payload_contract_invalid");
  }
  return reasons.length === 0
    ? (value as MarketContextDiagnosticOutcomeSourcePayloadV1)
    : null;
}

function inspectMaterial(
  observed: unknown,
  anchor: MarketContextDiagnosticOutcomeSourceAuthorityV1["expected_registry_anchor"],
): Inspection {
  const canonical = canonicalizeDiagnosticOutcomeAuthorityPlainDataV2(observed);
  if (!canonical.ok) {
    return {
      material: null,
      registry: null,
      payload: null,
      material_digest: canonical.sanitized_projection_digest,
      registry_digest: null,
      payload_digest: null,
      registry_disposition: "malformed",
      payload_disposition: "absent",
      reasons: canonical.reason_codes,
    };
  }
  const reasons: string[] = [];
  const material = exactKeys(
    canonical.value,
    ["material_version", "registry", "observed_source_payload"],
    "$material",
    reasons,
  );
  if (
    material?.material_version !==
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_MATERIAL_V1
  ) {
    reasons.push("admission_material_contract_invalid");
  }
  const registryReasons: string[] = [];
  const registry = validateRegistry(material?.registry, registryReasons);
  const payloadReasons: string[] = [];
  const payload = validatePayloadShape(
    material?.observed_source_payload,
    payloadReasons,
  );
  reasons.push(...registryReasons, ...payloadReasons);
  const registryDigest = material?.registry ? sha(material.registry) : null;
  const payloadDigest = material?.observed_source_payload
    ? sha(material.observed_source_payload)
    : null;
  let registryDisposition: Inspection["registry_disposition"] = registry
    ? "verified"
    : material?.registry
      ? "rejected"
      : "absent";
  let payloadDisposition: Inspection["payload_disposition"] = payload
    ? "verified"
    : material?.observed_source_payload
      ? "rejected"
      : "absent";
  if (
    registry &&
    (anchor.registry_identity !== registry.registry_identity ||
      anchor.registry_version !== registry.registry_version ||
      anchor.registry_digest !== registryDigest)
  ) {
    reasons.push("external_registry_anchor_mismatch");
    registryDisposition = "rejected";
  }
  if (
    registry &&
    payload &&
    (registry.source.payload_identity !== payload.source_identity ||
      registry.source.payload_digest !== payloadDigest ||
      registry.source.schema_version !== payload.schema_version ||
      registry.source.contract_version !== payload.contract_version)
  ) {
    reasons.push("observed_source_payload_binding_mismatch");
    payloadDisposition = "rejected";
  }
  if (reasons.length > 0) {
    return {
      material: null,
      registry,
      payload,
      material_digest: sha(canonical.value),
      registry_digest: registryDigest,
      payload_digest: payloadDigest,
      registry_disposition: registryDisposition,
      payload_disposition: payloadDisposition,
      reasons: sortedUnique(reasons),
    };
  }
  const frozen = deepFreeze(
    canonical.value as MarketContextDiagnosticOutcomeSourceMaterialV1,
  );
  return {
    material: frozen,
    registry: frozen.registry,
    payload: frozen.observed_source_payload,
    material_digest: sha(frozen),
    registry_digest: registryDigest,
    payload_digest: payloadDigest,
    registry_disposition: "verified",
    payload_disposition: "verified",
    reasons: [],
  };
}

function parsedUnixNs(value: unknown) {
  if (!nonEmpty(value)) return null;
  const parsed = parseDatabentoExplicitNanosecondInstantV1(
    value,
    "diagnostic_outcome_source_admission",
  );
  return parsed.ok ? parsed.unix_nanoseconds : null;
}

function validateReadyMaterial(
  request: MarketContextDiagnosticOutcomeSourceAdmissionRequestV1,
  inspection: Inspection,
) {
  const conflicting: string[] = [];
  const incomplete: string[] = [];
  const notSafe: string[] = [];
  const unmappable: string[] = [];
  const registry = inspection.registry;
  const payload = inspection.payload;
  if (!registry || !payload || !inspection.material) {
    return {
      taxonomy: "conflicting" as const,
      reasons: ["verified_admission_material_unavailable"],
      ready_handoff: null,
    };
  }
  if (request.expected_source_identity !== payload.source_identity) {
    unmappable.push("requested_source_identity_mismatch");
  }
  if (
    registry.producer.identity !== payload.producer.identity ||
    registry.producer.version !== payload.producer.version ||
    registry.source.verifier_identity !==
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_VERIFIER_V1 ||
    registry.source.verifier_version !==
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1
  ) {
    conflicting.push("producer_or_verifier_identity_drift");
  }
  if (payload.finality.status !== "final") {
    incomplete.push("outcome_not_final");
  }
  if (payload.completeness.status !== "complete") {
    incomplete.push("outcome_source_incomplete");
  }
  const instants = payload.instants;
  const values = Object.values(instants);
  if (!values.every(isUnixNs)) {
    notSafe.push("nanosecond_instant_invalid");
  } else {
    const decision = BigInt(instants.decision_unix_ns);
    const outcomeStart = BigInt(instants.outcome_start_unix_ns);
    const outcomeEnd = BigInt(instants.outcome_end_unix_ns);
    const finalization = BigInt(instants.outcome_finalization_unix_ns);
    const capture = BigInt(instants.capture_unix_ns);
    const cutoff = BigInt(instants.cutoff_unix_ns);
    if (
      !(
        decision < outcomeStart &&
        outcomeStart <= outcomeEnd &&
        outcomeEnd <= finalization &&
        finalization <= capture &&
        capture <= cutoff
      )
    ) {
      notSafe.push("outcome_temporal_finality_order_invalid");
    }
    if (
      payload.point_in_time.predictor_cutoff_unix_ns !==
        instants.decision_unix_ns ||
      payload.point_in_time.outcome_visible_to_predictor !== false
    ) {
      notSafe.push("predictor_outcome_separation_invalid");
    }
    if (
      decision < BigInt(registry.validity.effective_from_unix_ns) ||
      cutoff >= BigInt(registry.validity.effective_until_unix_ns)
    ) {
      notSafe.push("observation_outside_registry_validity");
    }
  }
  const p2aSnapshot = snapshotDiagnosticOutcomeAuthorityMaterialV2(
    payload.p2a_authority_material,
    payload.p2a_registry_anchor,
  );
  if (!p2aSnapshot.ok) {
    conflicting.push(
      ...p2aSnapshot.reason_codes.map((reason) => `p2a_material:${reason}`),
    );
  } else {
    const p2aRequest = payload.p2a_capture_request;
    if (
      p2aRequest.contract_version !==
        DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2 ||
      p2aRequest.period !== request.period ||
      p2aRequest.cohort !== request.cohort ||
      p2aSnapshot.snapshot.material_version !==
        DIAGNOSTIC_OUTCOME_AUTHORITY_MATERIAL_V2 ||
      p2aSnapshot.snapshot.registry.registry_version !==
        DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V2
    ) {
      conflicting.push("p2a_contract_version_mismatch");
    }
    const decision = record(
      p2aSnapshot.snapshot.source_payloads.decision_source,
    );
    const opportunity = record(
      p2aSnapshot.snapshot.source_payloads.opportunity_set_source,
    );
    const evaluator = record(
      p2aSnapshot.snapshot.source_payloads.evaluator_outcome_source,
    );
    const provider = record(
      p2aSnapshot.snapshot.source_payloads.provider_context_source,
    );
    const membership = Array.isArray(opportunity?.membership)
      ? opportunity.membership
          .map((entry) => record(entry))
          .filter((entry): entry is PlainRecord => entry !== null)
          .map((entry) => ({
            instrument_id: String(entry.instrument_id),
            ordinal: Number(entry.ordinal),
          }))
          .sort(
            (left, right) =>
              left.ordinal - right.ordinal ||
              left.instrument_id.localeCompare(right.instrument_id),
          )
      : [];
    const outcomeWindow = record(evaluator?.outcome_window);
    const completion = record(evaluator?.completion);
    const p2aInstants = {
      decision: parsedUnixNs(decision?.decision_timestamp),
      outcomeStart: parsedUnixNs(outcomeWindow?.start_timestamp),
      outcomeEnd: parsedUnixNs(outcomeWindow?.end_timestamp),
      completion:
        completion?.status === "completed"
          ? parsedUnixNs(completion.completion_timestamp)
          : instants.outcome_finalization_unix_ns,
      capture: parsedUnixNs(evaluator?.capture_timestamp),
      decisionSource: parsedUnixNs(decision?.source_timestamp),
      provider: parsedUnixNs(provider?.source_timestamp),
    };
    if (Object.values(p2aInstants).some((value) => value === null)) {
      notSafe.push("p2a_explicit_instant_invalid");
    } else {
      const expected = [
        ["decision", instants.decision_unix_ns],
        ["outcomeStart", instants.outcome_start_unix_ns],
        ["outcomeEnd", instants.outcome_end_unix_ns],
        ["completion", instants.outcome_finalization_unix_ns],
        ["capture", instants.capture_unix_ns],
      ] as const;
      if (
        expected.some(
          ([key, value]) => p2aInstants[key] !== value,
        ) ||
        BigInt(String(p2aInstants.decisionSource)) >
          BigInt(instants.decision_unix_ns) ||
        BigInt(String(p2aInstants.provider)) >
          BigInt(instants.capture_unix_ns)
      ) {
        notSafe.push("p2a_temporal_projection_mismatch");
      }
    }
    if (
      decision?.external_decision_id !==
        payload.decision_identity.external_decision_id ||
      decision?.instrument_id !== payload.decision_identity.instrument_id ||
      opportunity?.opportunity_set_identity !==
        payload.opportunity_set.identity ||
      sha(membership) !== payload.opportunity_set.membership_digest ||
      evaluator?.outcome_identity !== payload.outcome.identity ||
      evaluator?.evaluator_identity !==
        payload.outcome.evaluator_identity ||
      evaluator?.evaluator_version !==
        payload.outcome.evaluator_version ||
      completion?.evidence_digest !== payload.finality.proof_digest
    ) {
      conflicting.push("decision_opportunity_outcome_identity_drift");
    }
    if (
      provider?.provider_source !== payload.lineage.provider_source ||
      provider?.provider_version !== payload.lineage.provider_version ||
      provider?.evaluator_lineage_digest !==
        payload.lineage.evaluator_lineage_digest ||
      provider?.outcome_lineage_digest !==
        payload.lineage.outcome_lineage_digest
    ) {
      conflicting.push("evaluator_outcome_lineage_drift");
    }
    const sourceReferences = p2aRequest.source_references;
    if (
      sourceReferences.decision_source_identity !==
        p2aSnapshot.snapshot.registry.sources.decision_source
          .payload_identity ||
      sourceReferences.opportunity_set_source_identity !==
        p2aSnapshot.snapshot.registry.sources.opportunity_set_source
          .payload_identity ||
      sourceReferences.evaluator_outcome_source_identity !==
        p2aSnapshot.snapshot.registry.sources.evaluator_outcome_source
          .payload_identity ||
      sourceReferences.provider_context_source_identity !==
        p2aSnapshot.snapshot.registry.sources.provider_context_source
          .payload_identity ||
      sourceReferences.cost_slippage_source_identity !==
        p2aSnapshot.snapshot.registry.sources.cost_slippage_source
          .payload_identity
    ) {
      conflicting.push("p2a_request_source_binding_drift");
    }
  }
  const taxonomy: MarketContextDiagnosticOutcomeSourceTaxonomyV1 =
    conflicting.length > 0
      ? "conflicting"
      : notSafe.length > 0
        ? "not_point_in_time_safe"
        : incomplete.length > 0
          ? "incomplete"
          : unmappable.length > 0
            ? "unmappable"
            : "ready";
  const reasons = sortedUnique([
    ...conflicting,
    ...notSafe,
    ...incomplete,
    ...unmappable,
  ]);
  if (taxonomy !== "ready") {
    return { taxonomy, reasons, ready_handoff: null };
  }
  const handoffMaterial = {
    source_identity: payload.source_identity,
    source_payload_digest: String(inspection.payload_digest),
    source_registry_identity: registry.registry_identity,
    source_registry_digest: String(inspection.registry_digest),
    trust_root_digest: registry.expected_trust_root_digest,
    p2a_capture_request: payload.p2a_capture_request,
    p2a_authority: {
      authority_version: DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2,
      expected_registry_anchor: payload.p2a_registry_anchor,
      authority_material: payload.p2a_authority_material,
    },
  };
  return {
    taxonomy,
    reasons: ["diagnostic_outcome_source_ready"],
    ready_handoff: deepFreeze({
      ...handoffMaterial,
      handoff_digest: sha(handoffMaterial),
    }),
  };
}

function buildProvenance(
  request: MarketContextDiagnosticOutcomeSourceAdmissionRequestV1 | null,
  requestDigest: string,
  inspection: Inspection | null,
  anchor:
    | MarketContextDiagnosticOutcomeSourceAuthorityV1["expected_registry_anchor"]
    | null,
  reasons: string[],
) {
  const registry = inspection?.registry ?? null;
  const payload = inspection?.payload ?? null;
  const sections = [
    section("admission_request", {
      schema_version: request?.contract_version ?? null,
      observed_identity: request?.admission_identity ?? null,
      observed_digest: requestDigest,
      disposition: request ? "verified" : "malformed",
      reason_codes: request ? [] : reasons,
    }),
    section("admission_material", {
      schema_version: inspection?.material?.material_version ?? null,
      observed_identity: registry?.registry_identity ?? null,
      observed_digest: inspection?.material_digest ?? ZERO_DIGEST,
      disposition: inspection
        ? inspection.material
          ? "verified"
          : "rejected"
        : "absent",
      expected_identity: anchor?.registry_identity ?? null,
      expected_digest: anchor?.registry_digest ?? null,
      reason_codes: inspection?.reasons ?? [],
    }),
    section("source_registry", {
      schema_version: registry?.registry_version ?? null,
      observed_identity: registry?.registry_identity ?? null,
      observed_digest: inspection?.registry_digest ?? ZERO_DIGEST,
      disposition: inspection?.registry_disposition ?? "absent",
      expected_identity: anchor?.registry_identity ?? null,
      expected_digest: anchor?.registry_digest ?? null,
      reason_codes: inspection?.reasons ?? [],
    }),
    section("source_payload", {
      schema_version: payload?.schema_version ?? null,
      observed_identity: payload?.source_identity ?? null,
      observed_digest: inspection?.payload_digest ?? ZERO_DIGEST,
      disposition: inspection?.payload_disposition ?? "absent",
      expected_identity: registry?.source.payload_identity ?? null,
      expected_digest: registry?.source.payload_digest ?? null,
      reason_codes: inspection?.reasons ?? [],
    }),
  ].sort((left, right) => left.namespace.localeCompare(right.namespace));
  const material = {
    provenance_version:
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_FAILURE_PROVENANCE_V1,
    sections,
  };
  return {
    ...material,
    provenance_digest: sha(material),
  };
}

function buildResult(
  request: MarketContextDiagnosticOutcomeSourceAdmissionRequestV1 | null,
  requestDigest: string,
  taxonomy: MarketContextDiagnosticOutcomeSourceTaxonomyV1,
  authorityStatus:
    MarketContextDiagnosticOutcomeSourceAdmissionResultV1["authority_binding"]["verification_status"],
  inspection: Inspection | null,
  anchor:
    | MarketContextDiagnosticOutcomeSourceAuthorityV1["expected_registry_anchor"]
    | null,
  reasonCodes: string[],
  readyHandoff: MarketContextDiagnosticOutcomeSourceReadyHandoffV1 | null,
) {
  const reasons = sortedUnique(reasonCodes);
  const provenance = buildProvenance(
    request,
    requestDigest,
    inspection,
    anchor,
    reasons,
  );
  const failureMaterial =
    taxonomy === "ready"
      ? null
      : {
          contract_version:
            MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1,
          taxonomy,
          request_digest: requestDigest,
          observed_input_provenance_digest: provenance.provenance_digest,
          expected_registry_digest: anchor?.registry_digest ?? null,
          reason_codes: reasons,
        };
  const material = {
    contract_version:
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1,
    taxonomy,
    request_identity: {
      admission_identity: request?.admission_identity ?? "invalid",
      request_digest: requestDigest,
    },
    authority_binding: {
      authority_version:
        authorityStatus === "verified"
          ? MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1
          : null,
      verification_status: authorityStatus,
    },
    registry_binding: {
      registry_identity: inspection?.registry?.registry_identity ?? null,
      registry_version: inspection?.registry?.registry_version ?? null,
      observed_registry_digest: inspection?.registry_digest ?? null,
      expected_registry_digest: anchor?.registry_digest ?? null,
      source_payload_digest: inspection?.payload_digest ?? null,
      trust_root_digest:
        inspection?.registry?.expected_trust_root_digest ?? null,
    },
    observed_input_provenance: provenance,
    ready_handoff: readyHandoff,
    failure_identity_digest: failureMaterial ? sha(failureMaterial) : null,
    reason_codes: reasons,
    ...MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_BOUNDARY_V1,
  };
  return deepFreeze({
    ...material,
    result_digest: sha(material),
  }) satisfies MarketContextDiagnosticOutcomeSourceAdmissionResultV1;
}

const defaultOffResult = buildResult(
  null,
  ZERO_DIGEST,
  "incomplete",
  "not_read_default_off",
  null,
  null,
  ["admission_default_off"],
  null,
);

const killSwitchResult = buildResult(
  null,
  ZERO_DIGEST,
  "conflicting",
  "not_read_kill_switch",
  null,
  null,
  ["admission_kill_switch_active"],
  null,
);

export function admitMarketContextDiagnosticOutcomeSourceV1(
  value: unknown,
  dependencies: MarketContextDiagnosticOutcomeSourceDependenciesV1,
): MarketContextDiagnosticOutcomeSourceAdmissionResultV1 {
  if (!dependencies.enabled) return defaultOffResult;
  if (dependencies.kill_switch) return killSwitchResult;

  const checkedRequest = requestCheck(value);
  if (!checkedRequest.request) {
    return buildResult(
      null,
      checkedRequest.digest,
      "conflicting",
      "invalid",
      null,
      null,
      checkedRequest.reasons,
      null,
    );
  }
  const request = checkedRequest.request;
  const authority = dependencies.authority;
  if (
    !authority ||
    authority.authority_version !==
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1
  ) {
    return buildResult(
      request,
      checkedRequest.digest,
      "conflicting",
      "missing",
      null,
      null,
      ["external_source_authority_missing_or_invalid"],
      null,
    );
  }
  let anchorValue: unknown;
  try {
    anchorValue = authority.expected_registry_anchor;
  } catch {
    return buildResult(
      request,
      checkedRequest.digest,
      "conflicting",
      "invalid",
      null,
      null,
      ["external_registry_anchor_read_exception_sanitized"],
      null,
    );
  }
  const canonicalAnchor =
    canonicalizeDiagnosticOutcomeAuthorityPlainDataV2(anchorValue);
  const anchorReasons: string[] = [];
  const anchorRecord = canonicalAnchor.ok
    ? exactKeys(
        canonicalAnchor.value,
        ["registry_identity", "registry_version", "registry_digest"],
        "$authority.expected_registry_anchor",
        anchorReasons,
      )
    : null;
  if (!canonicalAnchor.ok) {
    anchorReasons.push(...canonicalAnchor.reason_codes);
  }
  if (
    !anchorRecord ||
    !nonEmpty(anchorRecord.registry_identity) ||
    anchorRecord.registry_version !==
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1 ||
    !isSha256(anchorRecord.registry_digest)
  ) {
    anchorReasons.push("external_registry_anchor_invalid");
  }
  if (anchorReasons.length > 0 || !anchorRecord) {
    return buildResult(
      request,
      checkedRequest.digest,
      "conflicting",
      "invalid",
      null,
      null,
      anchorReasons,
      null,
    );
  }
  const anchor = deepFreeze({
    registry_identity: String(anchorRecord.registry_identity),
    registry_version:
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1,
    registry_digest: String(anchorRecord.registry_digest),
  });
  let observed: unknown;
  try {
    observed = authority.read_admission_material();
  } catch {
    const inspection: Inspection = {
      material: null,
      registry: null,
      payload: null,
      material_digest: sha({
        disposition: "absent",
        reason: "admission_material_lookup_exception_sanitized",
      }),
      registry_digest: null,
      payload_digest: null,
      registry_disposition: "absent",
      payload_disposition: "absent",
      reasons: ["admission_material_lookup_exception_sanitized"],
    };
    return buildResult(
      request,
      checkedRequest.digest,
      "conflicting",
      "lookup_failed",
      inspection,
      anchor,
      inspection.reasons,
      null,
    );
  }
  const inspection = inspectMaterial(observed, anchor);
  if (!inspection.material) {
    return buildResult(
      request,
      checkedRequest.digest,
      "conflicting",
      inspection.reasons.includes("external_registry_anchor_mismatch")
        ? "mismatch"
        : "invalid",
      inspection,
      anchor,
      inspection.reasons,
      null,
    );
  }
  const validated = validateReadyMaterial(request, inspection);
  const terminalInspection: Inspection =
    validated.taxonomy === "ready" ||
    validated.taxonomy === "incomplete"
      ? inspection
      : {
          ...inspection,
          payload_disposition: "rejected",
          reasons: sortedUnique([
            ...inspection.reasons,
            ...validated.reasons,
          ]),
        };
  return buildResult(
    request,
    checkedRequest.digest,
    validated.taxonomy,
    "verified",
    terminalInspection,
    anchor,
    validated.reasons,
    validated.ready_handoff,
  );
}

function conflictFromResult(
  source: MarketContextDiagnosticOutcomeSourceAdmissionResultV1,
  reason: string,
) {
  const reasons = sortedUnique([...source.reason_codes, reason]);
  const material = {
    ...source,
    taxonomy: "conflicting" as const,
    ready_handoff: null,
    reason_codes: reasons,
    failure_identity_digest: sha({
      taxonomy: "conflicting",
      prior_result_digest: source.result_digest,
      reason,
    }),
  };
  const digestMaterial = Object.fromEntries(
    Object.entries(material).filter(([key]) => key !== "result_digest"),
  );
  return deepFreeze({
    ...material,
    result_digest: sha(digestMaterial),
  });
}

export function admitMarketContextDiagnosticOutcomeSourceBatchV1(
  values: unknown[],
  dependencies: MarketContextDiagnosticOutcomeSourceDependenciesV1,
) {
  if (!dependencies.enabled) return [defaultOffResult];
  if (dependencies.kill_switch) return [killSwitchResult];
  const results = values.map((value) =>
    admitMarketContextDiagnosticOutcomeSourceV1(value, dependencies),
  );
  const requestCounts = new Map<string, number>();
  const outcomeCounts = new Map<string, number>();
  for (const result of results) {
    const requestIdentity = result.request_identity.admission_identity;
    requestCounts.set(
      requestIdentity,
      (requestCounts.get(requestIdentity) ?? 0) + 1,
    );
    const outcomeIdentity =
      result.ready_handoff?.p2a_authority.authority_material.source_payloads
        .evaluator_outcome_source;
    const outcome = record(outcomeIdentity)?.outcome_identity;
    if (typeof outcome === "string") {
      outcomeCounts.set(outcome, (outcomeCounts.get(outcome) ?? 0) + 1);
    }
  }
  return results
    .map((result) => {
      let classified = result;
      if (
        (requestCounts.get(result.request_identity.admission_identity) ?? 0) >
        1
      ) {
        classified = conflictFromResult(
          classified,
          "duplicate_admission_identity",
        );
      }
      const evaluator =
        result.ready_handoff?.p2a_authority.authority_material
          .source_payloads.evaluator_outcome_source;
      const outcome = record(evaluator)?.outcome_identity;
      if (
        typeof outcome === "string" &&
        (outcomeCounts.get(outcome) ?? 0) > 1
      ) {
        classified = conflictFromResult(
          classified,
          "duplicate_outcome_identity",
        );
      }
      return classified;
    })
    .sort((left, right) =>
      left.request_identity.admission_identity.localeCompare(
        right.request_identity.admission_identity,
      ),
    );
}

export function verifyMarketContextDiagnosticOutcomeSourceAdmissionV1(
  candidate: MarketContextDiagnosticOutcomeSourceAdmissionResultV1,
  value: unknown,
  dependencies: MarketContextDiagnosticOutcomeSourceDependenciesV1,
) {
  return (
    stableMarketContextDiagnosticContextJsonV1(candidate) ===
    stableMarketContextDiagnosticContextJsonV1(
      admitMarketContextDiagnosticOutcomeSourceV1(value, dependencies),
    )
  );
}

export const MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_COMPATIBILITY_V1 = {
  p2a_capture_contract: DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2,
  p2a_authority_contract: DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2,
  o2a_join_contract:
    "market_context_diagnostic_context_outcome_join_v2",
  special_case_adapter_required: false,
  real_outcome_source_accessed: false,
  real_outcome_capture_performed: false,
  real_outcome_join_performed: false,
  canonical_binding_ready: false,
  automatic_model_input_allowed: false,
  live_ranking_effect: false,
} as const;
