import {
  marketContextDiagnosticContextSha256V1,
  stableMarketContextDiagnosticContextJsonV1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BUNDLE_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_MATERIAL_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VERIFIER_V1,
  RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
  computeRecommendationOutcomeEvidenceBundleDigestV1,
  computeRecommendationOutcomeEvidenceLineageRootV1,
  type RecommendationOutcomeEvidenceBundleV1,
} from "./recommendation-outcome-evidence-completion-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_BOUNDARY_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_MATERIAL_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_VERIFIER_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_PRE_DOWNSTREAM_ADMISSION_V2,
  issueRecommendationOutcomeEvidenceV2,
  type RecommendationOutcomeEvidenceIssuanceDependenciesV2,
  type RecommendationOutcomeEvidenceIssuanceResultV2,
  type RecommendationOutcomeEvidenceIssuerAuthorityV2,
} from "./recommendation-outcome-evidence-issuance-v2";
import {
  RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_INPUT_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_MATERIAL_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_VERIFIER_V1,
  computeRecommendationOutcomeProjectionDigestV1,
  projectRepositoryOwnedRecommendationOutcomeV1,
  type RecommendationOutcomeProjectionMaterialV1,
  type RecommendationOutcomeProjectionRegistryV1,
  type RecommendationOutcomeProjectionRequestV1,
} from "./recommendation-outcome-projection-successor-v1";

export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3 =
  "repository_owned_recommendation_outcome_evidence_issuance_v3" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_PRE_ADMISSION_CLASSIFIER_V3 =
  "repository_owned_recommendation_outcome_evidence_pre_admission_classifier_v3" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_PRE_ADMISSION_PROVENANCE_V3 =
  "repository_owned_recommendation_outcome_evidence_pre_admission_provenance_v3" as const;

export const RECOMMENDATION_OUTCOME_EVIDENCE_PRE_ADMISSION_BUDGETS_V3 = {
  max_depth: 64,
  max_nodes: 20_000,
  max_total_keys: 50_000,
  max_array_length: 4_096,
  max_string_bytes: 1_048_576,
} as const;

type PlainValue =
  | null
  | boolean
  | number
  | string
  | PlainValue[]
  | { [key: string]: PlainValue };
type PlainRecord = { [key: string]: PlainValue };
type NonIssued = Exclude<
  RecommendationOutcomeEvidenceIssuanceResultV2["taxonomy"],
  "issued"
>;

export type RecommendationOutcomeEvidenceIssuanceRequestV3 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3;
  issuance_identity: string;
  expected_repository_row_identity: string;
  expected_evidence_bundle_identity: string;
};

export type RecommendationOutcomeEvidenceIssuanceDependenciesV3 = {
  enabled: boolean;
  kill_switch: boolean;
  authority?: RecommendationOutcomeEvidenceIssuerAuthorityV2;
  observe_downstream_step?:
    RecommendationOutcomeEvidenceIssuanceDependenciesV2[
      "observe_downstream_step"
    ];
};

export type RecommendationOutcomeEvidencePreAdmissionResultV3 = {
  classifier_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_PRE_ADMISSION_CLASSIFIER_V3;
  taxonomy: "issued" | NonIssued;
  observed_material_digest: string;
  observed_section_digests: {
    issuance_material: string;
    issuer_registry: string;
    completion_material: string;
    completion_registry: string;
    repository_row: string;
    evidence_bundle: string;
  };
  reason_codes: string[];
  failure_identity_digest: string | null;
  admission_digest: string;
  material: Readonly<PlainRecord> | null;
};

export type RecommendationOutcomeEvidenceIssuanceResultV3 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3;
  taxonomy: "issued" | NonIssued;
  pre_admission: Omit<RecommendationOutcomeEvidencePreAdmissionResultV3, "material">;
  predecessor_result: RecommendationOutcomeEvidenceIssuanceResultV2 | null;
  s2a_request_constructed: boolean;
  s2a_called: boolean;
  downstream_digest_work: boolean;
  failure_identity_digest: string | null;
  s2a_completion_result_digest?: string;
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
const safeSha = (value: unknown, namespace = "observed_input") =>
  value === undefined
    ? sha({ namespace, disposition: "absent" })
    : sha(value);
const sortedUnique = (values: string[]) =>
  [...new Set(values)].sort((left, right) => left.localeCompare(right));
const nonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;
const isSha = (value: unknown): value is string =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const isUnixNs = (value: unknown): value is string =>
  typeof value === "string" && /^(0|[1-9][0-9]*)$/.test(value);

function record(value: PlainValue | undefined): PlainRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value
    : null;
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

function exactKeys(
  value: PlainValue | undefined,
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

type CanonicalResult =
  | { ok: true; value: PlainValue; digest: string }
  | { ok: false; value: PlainValue; digest: string; reason_codes: string[] };

export function canonicalizeRecommendationOutcomeEvidencePreAdmissionV3(
  input: unknown,
): CanonicalResult {
  const budgets = RECOMMENDATION_OUTCOME_EVIDENCE_PRE_ADMISSION_BUDGETS_V3;
  const reasons: string[] = [];
  const seen = new WeakSet<object>();
  const holder: { value: PlainValue } = { value: null };
  let nodes = 0;
  let keys = 0;
  let stringBytes = 0;
  const stack: Array<{
    input: unknown;
    parent: PlainRecord | PlainValue[] | { value: PlainValue };
    key: string | number | "value";
    path: string;
    depth: number;
  }> = [{ input, parent: holder, key: "value", path: "$", depth: 0 }];
  const assign = (
    parent: PlainRecord | PlainValue[] | { value: PlainValue },
    key: string | number | "value",
    value: PlainValue,
  ) => {
    if (Array.isArray(parent)) parent[key as number] = value;
    else (parent as PlainRecord)[key as string] = value;
  };

  while (stack.length > 0) {
    const task = stack.pop()!;
    nodes += 1;
    if (nodes > budgets.max_nodes) {
      reasons.push("bounded_validation:node_budget_exceeded");
      assign(task.parent, task.key, null);
      continue;
    }
    if (task.depth > budgets.max_depth) {
      reasons.push("bounded_validation:depth_budget_exceeded");
      assign(task.parent, task.key, null);
      continue;
    }
    const candidate = task.input;
    if (candidate === null || typeof candidate === "boolean") {
      assign(task.parent, task.key, candidate);
      continue;
    }
    if (typeof candidate === "string") {
      stringBytes += new TextEncoder().encode(candidate).length;
      if (stringBytes > budgets.max_string_bytes) {
        reasons.push("bounded_validation:string_budget_exceeded");
        assign(task.parent, task.key, null);
      } else assign(task.parent, task.key, candidate);
      continue;
    }
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      assign(task.parent, task.key, candidate);
      continue;
    }
    if (candidate === null || typeof candidate !== "object") {
      reasons.push(`bounded_validation:unsupported_runtime_type:${typeof candidate}`);
      assign(task.parent, task.key, null);
      continue;
    }
    if (seen.has(candidate)) {
      reasons.push("bounded_validation:cycle_rejected");
      assign(task.parent, task.key, null);
      continue;
    }
    seen.add(candidate);
    let descriptors: PropertyDescriptorMap;
    let prototype: object | null;
    try {
      descriptors = Object.getOwnPropertyDescriptors(candidate);
      prototype = Object.getPrototypeOf(candidate);
    } catch {
      reasons.push("bounded_validation:introspection_failed_sanitized");
      assign(task.parent, task.key, null);
      continue;
    }
    if (Array.isArray(candidate)) {
      if (prototype !== Array.prototype) {
        reasons.push("bounded_validation:array_prototype_rejected");
      }
      if (candidate.length > budgets.max_array_length) {
        reasons.push("bounded_validation:array_budget_exceeded");
      }
      const output: PlainValue[] = [];
      assign(task.parent, task.key, output);
      const limit = Math.min(candidate.length, budgets.max_array_length);
      for (let index = limit - 1; index >= 0; index -= 1) {
        const descriptor = descriptors[String(index)];
        if (!descriptor || !("value" in descriptor)) {
          reasons.push("bounded_validation:array_accessor_or_hole_rejected");
          output[index] = null;
        } else {
          stack.push({
            input: descriptor.value,
            parent: output,
            key: index,
            path: `${task.path}[${index}]`,
            depth: task.depth + 1,
          });
        }
      }
      continue;
    }
    if (prototype !== Object.prototype && prototype !== null) {
      reasons.push("bounded_validation:object_prototype_rejected");
    }
    const ownKeys = Reflect.ownKeys(descriptors);
    if (ownKeys.some((key) => typeof key === "symbol")) {
      reasons.push("bounded_validation:symbol_key_rejected");
    }
    const names = Object.keys(descriptors).sort((left, right) =>
      left.localeCompare(right)
    );
    keys += names.length;
    if (keys > budgets.max_total_keys) {
      reasons.push("bounded_validation:key_budget_exceeded");
    }
    const output: PlainRecord = {};
    assign(task.parent, task.key, output);
    for (let index = names.length - 1; index >= 0; index -= 1) {
      const name = names[index];
      const descriptor = descriptors[name];
      if (!("value" in descriptor)) {
        reasons.push("bounded_validation:accessor_rejected");
        continue;
      }
      stack.push({
        input: descriptor.value,
        parent: output,
        key: name,
        path: `${task.path}.${name}`,
        depth: task.depth + 1,
      });
    }
  }
  const reasonCodes = sortedUnique(reasons);
  const digest = sha({
    classifier:
      RECOMMENDATION_OUTCOME_EVIDENCE_PRE_ADMISSION_CLASSIFIER_V3,
    projection: holder.value,
    reason_codes: reasonCodes,
  });
  return reasonCodes.length === 0
    ? { ok: true, value: holder.value, digest: sha(holder.value) }
    : { ok: false, value: holder.value, digest, reason_codes: reasonCodes };
}

function normalizeClosures(bundle: PlainRecord) {
  const reasons: string[] = [];
  if (!Array.isArray(bundle.gap_closures)) {
    return { reasons: ["gap_closures_array_required"], closures: [] };
  }
  const byGap = new Map<string, PlainRecord>();
  for (const [index, closureValue] of bundle.gap_closures.entries()) {
    const closure = exactKeys(
      closureValue,
      [
        "gap_code",
        "evidence_identity",
        "evidence_digest",
        "verifier_identity",
        "verifier_version",
      ],
      `gap_closure:${index}`,
      reasons,
    );
    if (
      !closure ||
      typeof closure.gap_code !== "string" ||
      !RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1.includes(
        closure.gap_code as never,
      ) ||
      !nonEmpty(closure.evidence_identity) ||
      !isSha(closure.evidence_digest) ||
      closure.verifier_identity !==
        RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VERIFIER_V1 ||
      closure.verifier_version !== RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1
    ) {
      reasons.push(`gap_closure_invalid:${index}`);
      continue;
    }
    if (byGap.has(closure.gap_code)) {
      reasons.push(`gap_closure_duplicate:${closure.gap_code}`);
    } else byGap.set(closure.gap_code, closure);
  }
  const expected = [...RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1].sort();
  const actual = [...byGap.keys()].sort();
  if (
    actual.length !== expected.length ||
    actual.some((gap, index) => gap !== expected[index])
  ) reasons.push("all_eighteen_gap_closures_required");
  return {
    reasons: sortedUnique(reasons),
    closures: actual.map((gap) => byGap.get(gap)!),
  };
}

const BUNDLE_SCHEMA = [
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
] as const;

function validateBundle(bundle: PlainRecord) {
  const shape: string[] = [];
  const conflict: string[] = [];
  const incomplete: string[] = [];
  exactKeys(bundle, BUNDLE_SCHEMA, "evidence_bundle", shape);
  const source = exactKeys(
    bundle.source_snapshot,
    ["identity", "digest"],
    "evidence_bundle.source_snapshot",
    shape,
  );
  const producer = exactKeys(
    bundle.producer,
    ["owner_identity", "owner_version", "schema_version", "contract_version"],
    "evidence_bundle.producer",
    shape,
  );
  const decision = exactKeys(
    bundle.decision,
    ["recommendation_id", "external_decision_id", "instrument_id"],
    "evidence_bundle.decision",
    shape,
  );
  const opportunity = exactKeys(
    bundle.opportunity_set,
    ["identity", "membership_digest", "immutable"],
    "evidence_bundle.opportunity_set",
    shape,
  );
  const model = exactKeys(
    bundle.model,
    ["identity", "version", "lineage_digest"],
    "evidence_bundle.model",
    shape,
  );
  const evaluator = exactKeys(
    bundle.evaluator,
    ["identity", "version", "lineage_digest"],
    "evidence_bundle.evaluator",
    shape,
  );
  const outcome = exactKeys(
    bundle.outcome,
    ["identity", "lineage_digest"],
    "evidence_bundle.outcome",
    shape,
  );
  const explanation = exactKeys(
    bundle.explanation,
    ["identity", "version", "lineage_digest"],
    "evidence_bundle.explanation",
    shape,
  );
  const lineage = exactKeys(
    bundle.lineage,
    ["identity", "source_lineage_digest", "provider_source", "provider_version"],
    "evidence_bundle.lineage",
    shape,
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
    "evidence_bundle.instants",
    shape,
  );
  const finality = exactKeys(
    bundle.finality,
    ["status", "proof_identity", "proof_digest"],
    "evidence_bundle.finality",
    shape,
  );
  const completeness = exactKeys(
    bundle.completeness,
    ["status", "proof_identity", "proof_digest"],
    "evidence_bundle.completeness",
    shape,
  );
  const closure = normalizeClosures(bundle);
  incomplete.push(...closure.reasons);
  if (closure.reasons.length === 0) bundle.gap_closures = closure.closures;

  const expectedGaps = [...RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1].sort();
  const observedGaps = Array.isArray(bundle.original_not_bindable_gap_codes)
    ? [...bundle.original_not_bindable_gap_codes].sort()
    : [];
  if (
    observedGaps.length !== expectedGaps.length ||
    observedGaps.some((gap, index) => gap !== expectedGaps[index])
  ) incomplete.push("original_not_bindable_gap_list_mismatch");
  if (bundle.bundle_version !== RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BUNDLE_V1) {
    shape.push("evidence_bundle_version_mismatch");
  }
  const strings = [
    bundle.bundle_identity,
    bundle.repository_row_identity,
    source?.identity,
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
  if (strings.some((value) => !nonEmpty(value))) {
    incomplete.push("evidence_bundle_identity_or_version_missing");
  }
  const digests = [
    bundle.repository_row_digest,
    bundle.external_authority_root_digest,
    source?.digest,
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
  if (digests.some((value) => !isSha(value))) {
    incomplete.push("evidence_bundle_proof_or_digest_invalid");
  }
  if (opportunity?.immutable !== true) incomplete.push("immutable_membership_missing");
  if (finality?.status !== "final") incomplete.push("finality_proof_missing");
  if (completeness?.status !== "complete") incomplete.push("completeness_proof_missing");
  if (!instants || Object.values(instants).some((value) => !isUnixNs(value))) {
    incomplete.push("evidence_bundle_nanosecond_instant_invalid");
  }
  const typed = bundle as unknown as RecommendationOutcomeEvidenceBundleV1;
  if (
    isSha(typed.lineage_root_digest) &&
    typed.lineage_root_digest !==
      computeRecommendationOutcomeEvidenceLineageRootV1(typed)
  ) conflict.push("evidence_lineage_root_digest_mismatch");
  if (
    isSha(typed.bundle_digest) &&
    typed.bundle_digest !== computeRecommendationOutcomeEvidenceBundleDigestV1(typed)
  ) conflict.push("evidence_bundle_digest_mismatch");
  return {
    shape: sortedUnique(shape),
    conflict: sortedUnique(conflict),
    incomplete: sortedUnique(incomplete),
    typed,
  };
}

function temporalSafe(instants: RecommendationOutcomeEvidenceBundleV1["instants"]) {
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
    const values = keys.map((key) => BigInt(instants[key]));
    return values[0] < values[1] && values[1] <= values[2] &&
      values[2] <= values[3] && values[3] <= values[4] &&
      values[4] <= values[5] && values[5] <= values[6] &&
      values[6] <= values[7];
  } catch {
    return false;
  }
}

function validateProjectionBindings(bundle: RecommendationOutcomeEvidenceBundleV1) {
  const projection = bundle.completed_projection;
  const reasons: string[] = [];
  if (
    projection.projection_version !== RECOMMENDATION_OUTCOME_PROJECTION_INPUT_V1 ||
    projection.producer_owner.identity !== bundle.producer.owner_identity ||
    projection.producer_owner.version !== bundle.producer.owner_version ||
    projection.source_contract.schema_version !== bundle.producer.schema_version ||
    projection.source_contract.contract_version !== bundle.producer.contract_version ||
    projection.external_authority_root_digest !== bundle.external_authority_root_digest ||
    projection.source_snapshot.identity !== bundle.source_snapshot.identity ||
    projection.source_snapshot.digest !== bundle.source_snapshot.digest ||
    projection.decision.recommendation_id !== bundle.decision.recommendation_id ||
    projection.decision.external_decision_id !== bundle.decision.external_decision_id ||
    projection.decision.instrument_id !== bundle.decision.instrument_id
  ) reasons.push("completed_projection_source_or_decision_binding_mismatch");
  if (
    projection.opportunity_set.identity !== bundle.opportunity_set.identity ||
    projection.opportunity_set.membership_digest !== bundle.opportunity_set.membership_digest ||
    projection.opportunity_set.immutable !== true
  ) reasons.push("completed_projection_membership_binding_mismatch");
  if (
    projection.outcome.identity !== bundle.outcome.identity ||
    projection.outcome.evaluator_identity !== bundle.evaluator.identity ||
    projection.outcome.evaluator_version !== bundle.evaluator.version ||
    projection.lineage.identity !== bundle.lineage.identity ||
    projection.lineage.source_lineage_digest !== bundle.lineage.source_lineage_digest ||
    projection.lineage.evaluator_lineage_digest !== bundle.evaluator.lineage_digest ||
    projection.lineage.outcome_lineage_digest !== bundle.outcome.lineage_digest ||
    projection.lineage.provider_source !== bundle.lineage.provider_source ||
    projection.lineage.provider_version !== bundle.lineage.provider_version ||
    projection.lineage.context_lineage_digest !== bundle.explanation.lineage_digest ||
    projection.point_in_time.predictor_projection_digest !== bundle.model.lineage_digest
  ) reasons.push("completed_projection_lineage_binding_mismatch");
  if (
    projection.instants.decision_unix_ns !== bundle.instants.decision_unix_ns ||
    projection.instants.outcome_start_unix_ns !== bundle.instants.outcome_start_unix_ns ||
    projection.instants.outcome_end_unix_ns !== bundle.instants.outcome_end_unix_ns ||
    projection.instants.outcome_finalization_unix_ns !== bundle.instants.finalization_unix_ns ||
    projection.instants.capture_unix_ns !== bundle.instants.evaluation_unix_ns ||
    projection.instants.evidence_cutoff_unix_ns !== bundle.instants.evidence_cutoff_unix_ns ||
    projection.point_in_time.predictor_cutoff_unix_ns !== bundle.instants.decision_unix_ns ||
    projection.point_in_time.outcome_visible_to_predictor !== false
  ) reasons.push("completed_projection_temporal_binding_mismatch");
  if (
    projection.finality.status !== "final" ||
    projection.finality.proof_identity !== bundle.finality.proof_identity ||
    projection.finality.proof_digest !== bundle.finality.proof_digest ||
    projection.completeness.status !== "complete" ||
    projection.completeness.proof_identity !== bundle.completeness.proof_identity ||
    projection.completeness.proof_digest !== bundle.completeness.proof_digest ||
    sha(projection.q1_interop) !== bundle.q1_interop_digest ||
    computeRecommendationOutcomeProjectionDigestV1(projection) !==
      projection.read_only_projection.projection_digest
  ) reasons.push("completed_projection_proof_or_digest_mismatch");
  return sortedUnique(reasons);
}

function buildR2Verification(
  observed: unknown,
  projectionIdentity: string,
  sourceIdentity: string,
  authorityRoot: string,
) {
  const registry: RecommendationOutcomeProjectionRegistryV1 = {
    registry_version: RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1,
    registry_identity: `t7a-r2-verification:${projectionIdentity}`,
    expected_external_authority_root_digest: authorityRoot,
    projection_entry: {
      projection_identity: projectionIdentity,
      source_snapshot_identity: sourceIdentity,
      observed_input_digest: sha(observed),
      verifier_identity: RECOMMENDATION_OUTCOME_PROJECTION_VERIFIER_V1,
      verifier_version: RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
    },
  };
  const material: RecommendationOutcomeProjectionMaterialV1 = {
    material_version: RECOMMENDATION_OUTCOME_PROJECTION_MATERIAL_V1,
    registry,
    observed_projection_input: observed,
  };
  const request: RecommendationOutcomeProjectionRequestV1 = {
    contract_version: RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
    projection_identity: projectionIdentity,
    expected_source_snapshot_identity: sourceIdentity,
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

function sectionDigests(material: PlainRecord | null) {
  const registry = record(material?.issuer_registry);
  const completion = record(material?.completion_material);
  return {
    issuance_material: safeSha(material, "issuance_material"),
    issuer_registry: safeSha(registry, "issuer_registry"),
    completion_material: safeSha(completion, "completion_material"),
    completion_registry: safeSha(
      record(completion?.registry),
      "completion_registry",
    ),
    repository_row: safeSha(
      completion?.observed_repository_row,
      "repository_row",
    ),
    evidence_bundle: safeSha(
      record(completion?.observed_evidence_bundle),
      "evidence_bundle",
    ),
  };
}

function result(
  taxonomy: RecommendationOutcomeEvidencePreAdmissionResultV3["taxonomy"],
  material: PlainRecord | null,
  reasons: string[],
): RecommendationOutcomeEvidencePreAdmissionResultV3 {
  const reasonCodes = sortedUnique(reasons);
  const observed = sectionDigests(material);
  const failureIdentity = taxonomy === "issued"
    ? null
    : sha({
        classifier:
          RECOMMENDATION_OUTCOME_EVIDENCE_PRE_ADMISSION_CLASSIFIER_V3,
        taxonomy,
        observed_section_digests: observed,
        reason_codes: reasonCodes,
      });
  const core = {
    classifier_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_PRE_ADMISSION_CLASSIFIER_V3,
    taxonomy,
    observed_material_digest: safeSha(material, "issuance_material"),
    observed_section_digests: observed,
    reason_codes: reasonCodes,
    failure_identity_digest: failureIdentity,
  };
  return deepFreeze({
    ...core,
    admission_digest: sha(core),
    material: taxonomy === "issued" && material ? deepFreeze(material) : null,
  });
}

function classifyCanonical(
  request: RecommendationOutcomeEvidenceIssuanceRequestV3,
  anchor: RecommendationOutcomeEvidenceIssuerAuthorityV2["expected_issuer_anchor"],
  material: PlainRecord,
) {
  const shape: string[] = [];
  const conflict: string[] = [];
  const incomplete: string[] = [];
  exactKeys(
    material,
    ["material_version", "issuer_registry", "completion_material"],
    "issuance_material",
    shape,
  );
  const registry = exactKeys(
    material.issuer_registry,
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
    shape,
  );
  const issuer = exactKeys(
    registry?.issuer,
    ["identity", "version", "authority_anchor_digest"],
    "issuer_registry.issuer",
    shape,
  );
  const epoch = exactKeys(
    registry?.epoch,
    ["value", "predecessor_issuance_digest"],
    "issuer_registry.epoch",
    shape,
  );
  const entry = exactKeys(
    registry?.issuance_entry,
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
    shape,
  );
  const admission = exactKeys(
    registry?.pre_downstream_admission,
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
    shape,
  );
  const completion = exactKeys(
    material.completion_material,
    ["material_version", "registry", "observed_repository_row", "observed_evidence_bundle"],
    "completion_material",
    shape,
  );
  const completionRegistry = exactKeys(
    completion?.registry,
    ["registry_version", "registry_identity", "expected_trust_root_digest", "completion_entry"],
    "completion_registry",
    shape,
  );
  const completionEntry = exactKeys(
    completionRegistry?.completion_entry,
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
    "completion_registry.completion_entry",
    shape,
  );
  const bundle = record(completion?.observed_evidence_bundle);
  const row = completion?.observed_repository_row;
  if (material.material_version !== RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_MATERIAL_V2) {
    shape.push("issuance_material_version_mismatch");
  }
  if (completion?.material_version !== RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_MATERIAL_V1) {
    shape.push("completion_material_version_mismatch");
  }
  if (completionRegistry?.registry_version !== RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1) {
    shape.push("completion_registry_version_mismatch");
  }
  if (!bundle) shape.push("evidence_bundle:object_required");

  if (bundle) {
    const validated = validateBundle(bundle);
    shape.push(...validated.shape);
    conflict.push(...validated.conflict);
    incomplete.push(...validated.incomplete);
  }

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
    [entry?.repository_row_digest, safeSha(row, "repository_row"), "repository_row_digest"],
    [entry?.evidence_bundle_digest, safeSha(bundle, "evidence_bundle"), "evidence_bundle_digest"],
    [entry?.completion_registry_identity, completionRegistry?.registry_identity, "completion_registry_identity"],
    [entry?.completion_registry_digest, sha(completionRegistry), "completion_registry_digest"],
    [entry?.repository_row_identity, completionEntry?.repository_row_identity, "completion_repository_row_identity"],
    [entry?.evidence_bundle_identity, completionEntry?.evidence_bundle_identity, "completion_evidence_bundle_identity"],
    [entry?.verifier_identity, RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_VERIFIER_V2, "verifier_identity"],
    [entry?.verifier_version, RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2, "verifier_version"],
    [completionEntry?.verifier_identity, RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VERIFIER_V1, "completion_verifier_identity"],
    [completionEntry?.verifier_version, RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1, "completion_verifier_version"],
  ];
  for (const [observed, expected, name] of equality) {
    if (observed !== expected) conflict.push(`${name}_mismatch`);
  }
  const observedEpoch = typeof epoch?.value === "string" &&
      /^(0|[1-9][0-9]*)$/.test(epoch.value)
    ? BigInt(epoch.value)
    : null;
  const minimumEpoch = /^(0|[1-9][0-9]*)$/.test(anchor.minimum_epoch)
    ? BigInt(anchor.minimum_epoch)
    : null;
  if (observedEpoch === null || minimumEpoch === null) conflict.push("issuer_epoch_invalid");
  else if (observedEpoch < minimumEpoch) conflict.push("issuer_epoch_rollback_detected");

  const closures = bundle ? normalizeClosures(bundle).closures : [];
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
  for (const [observed, expected, name] of admissionEquality) {
    if (observed !== expected) conflict.push(`${name}_mismatch`);
  }

  if (
    completionRegistry &&
    completionEntry &&
    bundle &&
    row !== undefined &&
    shape.length === 0 &&
    conflict.length === 0 &&
    incomplete.length === 0
  ) {
    const rowRecord = record(row);
    const rootEquality: Array<[unknown, unknown, string]> = [
      [completionRegistry.registry_identity, anchor.registry_identity === registry?.registry_identity
        ? entry?.completion_registry_identity
        : completionRegistry.registry_identity, "completion_registry_identity"],
      [completionRegistry.expected_trust_root_digest, anchor.trust_root_digest, "completion_trust_root"],
      [completionEntry.repository_row_identity, rowRecord?.id, "completion_row_identity"],
      [completionEntry.repository_row_digest, safeSha(row, "repository_row"), "completion_row_digest"],
      [completionEntry.evidence_bundle_identity, bundle.bundle_identity, "completion_bundle_identity"],
      [completionEntry.evidence_bundle_digest, safeSha(bundle, "evidence_bundle"), "completion_bundle_digest"],
      [completionEntry.lineage_root_digest, bundle.lineage_root_digest, "completion_lineage_root"],
      [bundle.repository_row_identity, rowRecord?.id, "bundle_row_identity"],
      [bundle.repository_row_digest, safeSha(row, "repository_row"), "bundle_row_digest"],
      [bundle.external_authority_root_digest, completionRegistry.expected_trust_root_digest, "bundle_trust_root"],
    ];
    for (const [observed, expected, name] of rootEquality) {
      if (observed !== expected) conflict.push(`${name}_mismatch`);
    }
    const original = buildR2Verification(
      row,
      String(completionEntry.completion_identity),
      String(record(bundle.source_snapshot)?.identity),
      String(bundle.external_authority_root_digest),
    );
    if (
      original.taxonomy !== "not_bindable" ||
      stableMarketContextDiagnosticContextJsonV1(original.reason_codes) !==
        stableMarketContextDiagnosticContextJsonV1(
          RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
        )
    ) conflict.push("repository_row_original_gap_contract_mismatch");
    const typed = bundle as unknown as RecommendationOutcomeEvidenceBundleV1;
    if (!temporalSafe(typed.instants)) {
      return result(
        "not_point_in_time_safe",
        material,
        [...shape, ...conflict, ...incomplete, "completion_evidence_temporal_order_invalid"],
      );
    }
    conflict.push(...validateProjectionBindings(typed));
    if (conflict.length === 0 && shape.length === 0 && incomplete.length === 0) {
      const projection = typed.completed_projection;
      const completed = buildR2Verification(
        projection,
        projection.read_only_projection.identity,
        projection.source_snapshot.identity,
        typed.external_authority_root_digest,
      );
      if (completed.taxonomy !== "bindable") {
        const mapped = completed.reason_codes.map((reason) =>
          `r2_completion_rejected:${reason}`
        );
        if (completed.taxonomy === "not_point_in_time_safe") {
          return result("not_point_in_time_safe", material, mapped);
        }
        if (completed.taxonomy === "unmappable") {
          return result("unmappable", material, mapped);
        }
        if (completed.taxonomy === "not_bindable") incomplete.push(...mapped);
        else conflict.push(...mapped);
      }
    }
  }
  if (shape.length > 0) return result("unmappable", material, shape);
  if (conflict.length > 0) return result("conflicting", material, conflict);
  if (incomplete.length > 0) return result("incomplete", material, incomplete);
  return result("issued", material, []);
}

function validateRequest(value: unknown) {
  const canonical = canonicalizeRecommendationOutcomeEvidencePreAdmissionV3(value);
  if (!canonical.ok) return { request: null, reasons: canonical.reason_codes };
  const reasons: string[] = [];
  const request = exactKeys(
    canonical.value,
    [
      "contract_version",
      "issuance_identity",
      "expected_repository_row_identity",
      "expected_evidence_bundle_identity",
    ],
    "issuance_request",
    reasons,
  );
  if (request?.contract_version !== RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3) {
    reasons.push("issuance_contract_version_mismatch");
  }
  for (const key of [
    "issuance_identity",
    "expected_repository_row_identity",
    "expected_evidence_bundle_identity",
  ]) {
    if (!nonEmpty(request?.[key])) reasons.push(`issuance_request:${key}:missing`);
  }
  return {
    request: reasons.length === 0
      ? request as unknown as RecommendationOutcomeEvidenceIssuanceRequestV3
      : null,
    reasons: sortedUnique(reasons),
  };
}

function snapshotAuthority(authority: unknown) {
  const reasons: string[] = [];
  if (authority === null || typeof authority !== "object") {
    return { authority: null, callback: null, reasons: ["issuer_authority_missing"] };
  }
  let descriptors: PropertyDescriptorMap;
  let prototype: object | null;
  try {
    descriptors = Object.getOwnPropertyDescriptors(authority);
    prototype = Object.getPrototypeOf(authority);
  } catch {
    return {
      authority: null,
      callback: null,
      reasons: ["issuer_authority_introspection_failed_sanitized"],
    };
  }
  const expected = [
    "authority_version",
    "expected_issuer_anchor",
    "read_issuance_material",
  ].sort();
  if (prototype !== Object.prototype && prototype !== null) {
    reasons.push("issuer_authority_plain_object_required");
  }
  const keys = Object.keys(descriptors).sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    reasons.push("issuer_authority_closed_schema_violation");
  }
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
  const anchorValue = "value" in (descriptors.expected_issuer_anchor ?? {})
    ? descriptors.expected_issuer_anchor.value
    : null;
  const canonical = canonicalizeRecommendationOutcomeEvidencePreAdmissionV3(anchorValue);
  if (!canonical.ok) reasons.push(...canonical.reason_codes);
  const anchor = exactKeys(
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
    reasons,
  );
  if (
    version !== RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V2 ||
    typeof callback !== "function" ||
    anchor?.registry_version !== RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V2 ||
    !nonEmpty(anchor?.registry_identity) ||
    !nonEmpty(anchor?.issuer_identity) ||
    !nonEmpty(anchor?.issuer_version) ||
    !isSha(anchor?.registry_digest) ||
    !isSha(anchor?.authority_anchor_digest) ||
    !isSha(anchor?.trust_root_digest) ||
    !isSha(anchor?.expected_predecessor_issuance_digest) ||
    typeof anchor?.minimum_epoch !== "string"
  ) reasons.push("issuer_authority_invalid");
  return reasons.length === 0 && anchor && typeof callback === "function"
    ? {
        authority: deepFreeze(
          structuredClone(anchor),
        ) as RecommendationOutcomeEvidenceIssuerAuthorityV2["expected_issuer_anchor"],
        callback: callback as () => unknown,
        reasons: [],
      }
    : { authority: null, callback: null, reasons: sortedUnique(reasons) };
}

export function classifyRecommendationOutcomeEvidencePreAdmissionV3(
  requestValue: unknown,
  authorityValue: unknown,
): RecommendationOutcomeEvidencePreAdmissionResultV3 {
  const request = validateRequest(requestValue);
  if (!request.request) return result("unmappable", null, request.reasons);
  const authority = snapshotAuthority(authorityValue);
  if (!authority.authority || !authority.callback) {
    return result("incomplete", null, authority.reasons);
  }
  let observed: unknown;
  try {
    observed = Reflect.apply(authority.callback, undefined, []);
  } catch {
    return result("incomplete", null, ["issuance_material_lookup_failed_sanitized"]);
  }
  const canonical = canonicalizeRecommendationOutcomeEvidencePreAdmissionV3(observed);
  if (!canonical.ok) {
    return result("unmappable", record(canonical.value), canonical.reason_codes);
  }
  const material = record(canonical.value);
  if (!material) return result("unmappable", null, ["issuance_material:object_required"]);
  return classifyCanonical(request.request, authority.authority, material);
}

function terminal(
  admission: RecommendationOutcomeEvidencePreAdmissionResultV3,
  predecessor: RecommendationOutcomeEvidenceIssuanceResultV2 | null,
): RecommendationOutcomeEvidenceIssuanceResultV3 {
  const common = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3,
    taxonomy: admission.taxonomy,
    pre_admission: {
      classifier_version: admission.classifier_version,
      taxonomy: admission.taxonomy,
      observed_material_digest: admission.observed_material_digest,
      observed_section_digests: admission.observed_section_digests,
      reason_codes: admission.reason_codes,
      failure_identity_digest: admission.failure_identity_digest,
      admission_digest: admission.admission_digest,
    },
    predecessor_result: predecessor,
    s2a_request_constructed:
      predecessor?.downstream_activity.s2a_request_construction_count === 1,
    s2a_called: predecessor?.downstream_activity.s2a_call_count === 1,
    downstream_digest_work:
      predecessor?.downstream_activity.s2a_result_digest_work_count === 1,
    failure_identity_digest: admission.failure_identity_digest,
    reason_codes: admission.reason_codes,
    ...RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_BOUNDARY_V2,
  };
  const withDigest = admission.taxonomy === "issued" && predecessor?.taxonomy === "issued"
    ? {
        ...common,
        s2a_completion_result_digest:
          predecessor.s2a_completion_result_digest,
      }
    : common;
  return deepFreeze({
    ...withDigest,
    result_digest: sha(withDigest),
  }) as RecommendationOutcomeEvidenceIssuanceResultV3;
}

const defaultAdmission = (reason: string) =>
  result("incomplete", null, [reason]);

export function issueRecommendationOutcomeEvidenceV3(
  requestValue: unknown,
  dependencies: RecommendationOutcomeEvidenceIssuanceDependenciesV3,
): RecommendationOutcomeEvidenceIssuanceResultV3 {
  if (!dependencies.enabled) {
    return terminal(defaultAdmission("issuance_v3_default_off"), null);
  }
  if (dependencies.kill_switch) {
    return terminal(defaultAdmission("issuance_v3_kill_switch_active"), null);
  }
  const admission = classifyRecommendationOutcomeEvidencePreAdmissionV3(
    requestValue,
    dependencies.authority,
  );
  if (admission.taxonomy !== "issued" || !admission.material) {
    return terminal(admission, null);
  }
  const request = requestValue as RecommendationOutcomeEvidenceIssuanceRequestV3;
  const predecessor = issueRecommendationOutcomeEvidenceV2(
    {
      contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
      issuance_identity: request.issuance_identity,
      expected_repository_row_identity: request.expected_repository_row_identity,
      expected_evidence_bundle_identity: request.expected_evidence_bundle_identity,
    },
    {
      enabled: true,
      kill_switch: false,
      authority: {
        authority_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V2,
        expected_issuer_anchor: structuredClone(
          dependencies.authority!.expected_issuer_anchor,
        ),
        read_issuance_material: () => structuredClone(admission.material),
      },
      observe_downstream_step: dependencies.observe_downstream_step,
    },
  );
  if (predecessor.taxonomy !== "issued") {
    throw new Error("v3_pre_admission_diverged_from_s2a_sanitized");
  }
  return terminal(admission, predecessor);
}
