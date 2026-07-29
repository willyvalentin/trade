import {
  marketContextDiagnosticContextSha256V1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BOUNDARY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_MATERIAL_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1,
  RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
  completeRepositoryOwnedRecommendationOutcomeEvidenceV1,
  type RecommendationOutcomeEvidenceAuthorityV1,
  type RecommendationOutcomeEvidenceCompletionResultV1,
  type RecommendationOutcomeEvidenceGapClosureV1,
  type RecommendationOutcomeEvidenceMaterialV1,
  type RecommendationOutcomeEvidenceRegistryV1,
} from "./recommendation-outcome-evidence-completion-v1";
import type {
  RecommendationOutcomeProjectionInputV1,
} from "./recommendation-outcome-projection-successor-v1";

export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2 =
  "repository_owned_recommendation_outcome_evidence_completion_v2" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V2 =
  "repository_owned_recommendation_outcome_evidence_authority_v2" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_SNAPSHOT_V2 =
  "repository_owned_recommendation_outcome_evidence_authority_snapshot_v2" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_PROVENANCE_V2 =
  "repository_owned_recommendation_outcome_evidence_provenance_v2" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VALIDATOR_V2 =
  "repository_owned_recommendation_outcome_evidence_bounded_validator_v2" as const;

export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BUDGETS_V2 = {
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

export type RecommendationOutcomeEvidenceCompletionRequestV2 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2;
  completion_identity: string;
  expected_repository_row_identity: string;
  expected_evidence_bundle_identity: string;
};

export type RecommendationOutcomeEvidenceAuthorityV2 = {
  authority_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V2;
  expected_registry_anchor: RecommendationOutcomeEvidenceAuthorityV1["expected_registry_anchor"];
  read_completion_material: () => unknown;
};

export type RecommendationOutcomeEvidenceCompletionDependenciesV2 = {
  enabled: boolean;
  kill_switch: boolean;
  authority?: RecommendationOutcomeEvidenceAuthorityV2;
};

export type RecommendationOutcomeEvidenceObservedInputV2 = {
  namespace:
    | "completion_material"
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

export type RecommendationOutcomeEvidenceCompletionResultV2 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2;
  taxonomy:
    | "completed"
    | "incomplete"
    | "conflicting"
    | "not_point_in_time_safe"
    | "unmappable";
  request_digest: string;
  authority_snapshot: {
    snapshot_version:
      typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_SNAPSHOT_V2;
    disposition:
      | "not_read_default_off"
      | "not_read_kill_switch"
      | "verified"
      | "rejected"
      | "lookup_failed";
    snapshot_digest: string;
    registry_identity: string | null;
    registry_digest: string | null;
    trust_root_digest: string | null;
    lineage_root_digest: string | null;
  };
  observed_input_provenance: {
    provenance_version:
      typeof RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_PROVENANCE_V2;
    sections: RecommendationOutcomeEvidenceObservedInputV2[];
    provenance_digest: string;
  };
  completed_projection: Readonly<RecommendationOutcomeProjectionInputV1> | null;
  closed_gap_codes: string[];
  v1_core_result_digest: string | null;
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

type BoundedCanonicalizationV2 = {
  ok: boolean;
  value: PlainValue;
  digest: string;
  reason_codes: string[];
  stats: {
    nodes: number;
    keys: number;
    string_bytes: number;
    maximum_depth: number;
  };
};

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);
const sortedUnique = (values: string[]) =>
  [...new Set(values)].sort((left, right) =>
    left.localeCompare(right),
  );
const nonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;
const isSha256 = (value: unknown): value is string =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);

function record(value: PlainValue | undefined): PlainRecord | null {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? value
    : null;
}

function freezeIterative<T>(value: T): T {
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

export function canonicalizeRecommendationOutcomeEvidencePlainDataV2(
  input: unknown,
): BoundedCanonicalizationV2 {
  const budgets = RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BUDGETS_V2;
  const reasons: string[] = [];
  const seen = new WeakSet<object>();
  const holder: { value: PlainValue } = { value: null };
  const stats = {
    nodes: 0,
    keys: 0,
    string_bytes: 0,
    maximum_depth: 0,
  };
  const stack: Array<{
    input: unknown;
    parent: PlainRecord | PlainValue[] | { value: PlainValue };
    key: string | number | "value";
    path: string;
    depth: number;
  }> = [
    {
      input,
      parent: holder,
      key: "value",
      path: "$",
      depth: 0,
    },
  ];

  const assign = (
    parent: PlainRecord | PlainValue[] | { value: PlainValue },
    key: string | number | "value",
    value: PlainValue,
  ) => {
    if (Array.isArray(parent)) {
      parent[key as number] = value;
    } else {
      (parent as PlainRecord)[key as string] = value;
    }
  };

  while (stack.length > 0) {
    const task = stack.pop()!;
    stats.nodes += 1;
    stats.maximum_depth = Math.max(stats.maximum_depth, task.depth);
    if (stats.nodes > budgets.max_nodes) {
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
    if (
      candidate === null ||
      typeof candidate === "boolean"
    ) {
      assign(task.parent, task.key, candidate);
      continue;
    }
    if (typeof candidate === "string") {
      const bytes = Buffer.byteLength(candidate, "utf8");
      stats.string_bytes += bytes;
      if (stats.string_bytes > budgets.max_string_bytes) {
        reasons.push("bounded_validation:string_budget_exceeded");
        assign(task.parent, task.key, "[string_budget_exceeded]");
      } else {
        assign(task.parent, task.key, candidate);
      }
      continue;
    }
    if (typeof candidate === "number") {
      if (!Number.isFinite(candidate)) {
        reasons.push(`${task.path}:non_finite_number`);
        assign(task.parent, task.key, null);
      } else {
        assign(task.parent, task.key, candidate);
      }
      continue;
    }
    if (
      typeof candidate === "undefined" ||
      typeof candidate === "bigint" ||
      typeof candidate === "symbol" ||
      typeof candidate === "function"
    ) {
      reasons.push(
        `${task.path}:unsupported_runtime_type:${typeof candidate}`,
      );
      assign(task.parent, task.key, null);
      continue;
    }
    if (typeof candidate !== "object") {
      reasons.push(`${task.path}:unsupported_runtime_value`);
      assign(task.parent, task.key, null);
      continue;
    }
    if (seen.has(candidate)) {
      reasons.push(`${task.path}:repeated_or_cyclic_reference`);
      assign(task.parent, task.key, null);
      continue;
    }
    seen.add(candidate);

    let prototype: object | null;
    let ownKeys: (string | symbol)[];
    let descriptors: PropertyDescriptorMap;
    try {
      prototype = Object.getPrototypeOf(candidate);
      ownKeys = Reflect.ownKeys(candidate);
      descriptors = Object.getOwnPropertyDescriptors(candidate);
    } catch {
      reasons.push(`${task.path}:runtime_introspection_failed_sanitized`);
      assign(task.parent, task.key, null);
      continue;
    }
    if (ownKeys.some((key) => typeof key === "symbol")) {
      reasons.push(`${task.path}:symbol_key_not_allowed`);
    }

    if (Array.isArray(candidate)) {
      if (prototype !== Array.prototype) {
        reasons.push(`${task.path}:unexpected_array_prototype`);
      }
      if (candidate.length > budgets.max_array_length) {
        reasons.push("bounded_validation:array_budget_exceeded");
        assign(task.parent, task.key, []);
        continue;
      }
      const numericKeys = Object.keys(descriptors)
        .filter((key) => key !== "length")
        .sort((left, right) => Number(left) - Number(right));
      if (
        numericKeys.length !== candidate.length ||
        numericKeys.some((key, index) => key !== String(index))
      ) {
        reasons.push(`${task.path}:sparse_or_noncanonical_array`);
      }
      const output: PlainValue[] = new Array(candidate.length).fill(null);
      assign(task.parent, task.key, output);
      for (let index = candidate.length - 1; index >= 0; index -= 1) {
        const descriptor = descriptors[String(index)];
        if (!descriptor || !("value" in descriptor)) {
          reasons.push(`${task.path}[${index}]:accessor_or_missing_value`);
          continue;
        }
        stack.push({
          input: descriptor.value,
          parent: output,
          key: index,
          path: `${task.path}[${index}]`,
          depth: task.depth + 1,
        });
      }
      continue;
    }

    if (prototype !== Object.prototype && prototype !== null) {
      reasons.push(`${task.path}:unexpected_object_prototype`);
    }
    const output: PlainRecord = {};
    assign(task.parent, task.key, output);
    const keys = Object.keys(descriptors).sort((left, right) =>
      left.localeCompare(right),
    );
    stats.keys += keys.length;
    if (stats.keys > budgets.max_total_keys) {
      reasons.push("bounded_validation:key_budget_exceeded");
      continue;
    }
    for (let index = keys.length - 1; index >= 0; index -= 1) {
      const key = keys[index];
      stats.string_bytes += Buffer.byteLength(key, "utf8");
      if (stats.string_bytes > budgets.max_string_bytes) {
        reasons.push("bounded_validation:string_budget_exceeded");
        continue;
      }
      const descriptor = descriptors[key];
      if (!descriptor || !("value" in descriptor)) {
        reasons.push(`${task.path}.${key}:accessor_not_allowed`);
        continue;
      }
      stack.push({
        input: descriptor.value,
        parent: output,
        key,
        path: `${task.path}.${key}`,
        depth: task.depth + 1,
      });
    }
  }

  const reasonCodes = sortedUnique(reasons);
  const value = freezeIterative(holder.value);
  return {
    ok: reasonCodes.length === 0,
    value,
    digest: sha({
      validator:
        RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VALIDATOR_V2,
      value,
      reason_codes: reasonCodes,
    }),
    reason_codes: reasonCodes,
    stats,
  };
}

function exactKeys(
  value: PlainValue | undefined,
  expectedKeys: readonly string[],
  reasonCode: string,
  reasons: string[],
) {
  const candidate = record(value);
  const expected = [...expectedKeys].sort();
  const actual = candidate ? Object.keys(candidate).sort() : [];
  if (
    !candidate ||
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    reasons.push(reasonCode);
    return null;
  }
  return candidate;
}

function snapshotAuthority(
  value: unknown,
):
  | {
      ok: true;
      anchor: Readonly<
        RecommendationOutcomeEvidenceAuthorityV1["expected_registry_anchor"]
      >;
      anchor_digest: string;
      callback: () => unknown;
    }
  | {
      ok: false;
      snapshot_digest: string;
      reason_codes: string[];
    } {
  const reasons: string[] = [];
  let descriptors: PropertyDescriptorMap;
  let prototype: object | null;
  try {
    descriptors = Object.getOwnPropertyDescriptors(value as object);
    prototype = Object.getPrototypeOf(value as object);
  } catch {
    return {
      ok: false,
      snapshot_digest: sha({
        snapshot:
          RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_SNAPSHOT_V2,
        reason_codes: ["authority_introspection_failed_sanitized"],
      }),
      reason_codes: ["authority_introspection_failed_sanitized"],
    };
  }
  const keys = Object.keys(descriptors).sort();
  const expectedKeys = [
    "authority_version",
    "expected_registry_anchor",
    "read_completion_material",
  ].sort();
  if (
    prototype !== Object.prototype &&
    prototype !== null
  ) {
    reasons.push("authority_plain_object_required");
  }
  if (
    keys.length !== expectedKeys.length ||
    keys.some((key, index) => key !== expectedKeys[index])
  ) {
    reasons.push("authority_closed_schema_violation");
  }
  for (const key of expectedKeys) {
    if (!descriptors[key] || !("value" in descriptors[key])) {
      reasons.push(`authority_accessor_rejected:${key}`);
    }
  }
  const authorityVersion =
    "value" in (descriptors.authority_version ?? {})
      ? descriptors.authority_version.value
      : null;
  const callback =
    "value" in (descriptors.read_completion_material ?? {})
      ? descriptors.read_completion_material.value
      : null;
  const anchorValue =
    "value" in (descriptors.expected_registry_anchor ?? {})
      ? descriptors.expected_registry_anchor.value
      : null;
  if (
    authorityVersion !==
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V2 ||
    typeof callback !== "function"
  ) {
    reasons.push("authority_version_or_callback_invalid");
  }
  const anchorSnapshot =
    canonicalizeRecommendationOutcomeEvidencePlainDataV2(anchorValue);
  reasons.push(...anchorSnapshot.reason_codes);
  const anchorReasons: string[] = [];
  const anchor = exactKeys(
    anchorSnapshot.value,
    [
      "registry_identity",
      "registry_version",
      "registry_digest",
      "expected_trust_root_digest",
      "expected_lineage_root_digest",
    ],
    "authority_anchor_closed_schema_violation",
    anchorReasons,
  );
  if (
    !anchor ||
    !nonEmpty(anchor.registry_identity) ||
    anchor.registry_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1 ||
    !isSha256(anchor.registry_digest) ||
    !isSha256(anchor.expected_trust_root_digest) ||
    !isSha256(anchor.expected_lineage_root_digest)
  ) {
    anchorReasons.push("authority_anchor_invalid");
  }
  reasons.push(...anchorReasons);
  const reasonCodes = sortedUnique(reasons);
  if (reasonCodes.length > 0 || !anchor || typeof callback !== "function") {
    return {
      ok: false,
      snapshot_digest: sha({
        snapshot:
          RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_SNAPSHOT_V2,
        anchor_digest: anchorSnapshot.digest,
        reason_codes: reasonCodes,
      }),
      reason_codes: reasonCodes,
    };
  }
  const frozenAnchor = freezeIterative(
    structuredClone(
      anchor,
    ) as RecommendationOutcomeEvidenceAuthorityV1["expected_registry_anchor"],
  );
  return {
    ok: true,
    anchor: frozenAnchor,
    anchor_digest: sha({
      snapshot:
        RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_SNAPSHOT_V2,
      anchor: frozenAnchor,
    }),
    callback,
  };
}

function normalizeClosures(material: PlainValue) {
  const reasons: string[] = [];
  const materialRecord = record(material);
  const bundle = record(materialRecord?.observed_evidence_bundle);
  if (!bundle) {
    return { material, reason_codes: reasons };
  }
  const closures = bundle.gap_closures;
  if (!Array.isArray(closures)) {
    reasons.push("v2_gap_closures_array_required");
    return { material, reason_codes: reasons };
  }
  const byGap = new Map<string, PlainRecord>();
  for (const [index, value] of closures.entries()) {
    const closure = exactKeys(
      value,
      [
        "gap_code",
        "evidence_identity",
        "evidence_digest",
        "verifier_identity",
        "verifier_version",
      ],
      `v2_gap_closure_closed_schema_violation:${index}`,
      reasons,
    );
    if (
      !closure ||
      typeof closure.gap_code !== "string" ||
      !RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1.includes(
        closure.gap_code as never,
      ) ||
      !nonEmpty(closure.evidence_identity) ||
      !isSha256(closure.evidence_digest) ||
      closure.verifier_identity !==
        "repository_owned_recommendation_outcome_evidence_verifier_v1" ||
      closure.verifier_version !==
        RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1
    ) {
      reasons.push(`v2_gap_closure_invalid:${index}`);
      continue;
    }
    if (byGap.has(closure.gap_code)) {
      reasons.push(`v2_gap_closure_duplicate:${closure.gap_code}`);
      continue;
    }
    byGap.set(closure.gap_code, closure);
  }
  const expected = [...RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1].sort();
  const actual = [...byGap.keys()].sort();
  if (
    actual.length !== expected.length ||
    actual.some((gap, index) => gap !== expected[index])
  ) {
    reasons.push("v2_all_eighteen_unique_gap_closures_required");
  }
  if (reasons.length === 0) {
    bundle.gap_closures = actual.map(
      (gap) => byGap.get(gap)!,
    ) as unknown as PlainValue;
  }
  return {
    material: freezeIterative(material),
    reason_codes: sortedUnique(reasons),
  };
}

function observedSection(
  namespace: RecommendationOutcomeEvidenceObservedInputV2["namespace"],
  value: PlainValue | undefined,
  disposition: RecommendationOutcomeEvidenceObservedInputV2["disposition"],
  reasonCodes: string[] = [],
): RecommendationOutcomeEvidenceObservedInputV2 {
  return {
    namespace,
    disposition,
    observed_digest:
      value === undefined
        ? sha({ namespace, disposition: "absent" })
        : sha(value),
    reason_codes: sortedUnique(reasonCodes),
  };
}

function provenanceFromMaterial(
  material: PlainValue,
  disposition:
    | "verified"
    | "present_rejected"
    | "malformed",
  reasonCodes: string[] = [],
) {
  const materialRecord = record(material);
  const sections = [
    observedSection(
      "completion_material",
      material,
      disposition,
      reasonCodes,
    ),
    observedSection(
      "completion_registry",
      materialRecord?.registry,
      materialRecord && Object.hasOwn(materialRecord, "registry")
        ? disposition
        : "absent",
      reasonCodes,
    ),
    observedSection(
      "repository_row",
      materialRecord?.observed_repository_row,
      materialRecord &&
        Object.hasOwn(materialRecord, "observed_repository_row")
        ? disposition
        : "absent",
      reasonCodes,
    ),
    observedSection(
      "evidence_bundle",
      materialRecord?.observed_evidence_bundle,
      materialRecord &&
        Object.hasOwn(materialRecord, "observed_evidence_bundle")
        ? disposition
        : "absent",
      reasonCodes,
    ),
  ];
  return {
    provenance_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_PROVENANCE_V2,
    sections,
    provenance_digest: sha(sections),
  };
}

const boundary = RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BOUNDARY_V1;

function resultWithDigest(
  value: Omit<RecommendationOutcomeEvidenceCompletionResultV2, "result_digest">,
) {
  return freezeIterative({
    ...value,
    result_digest: sha(value),
  });
}

function terminalResult(
  taxonomy: Exclude<
    RecommendationOutcomeEvidenceCompletionResultV2["taxonomy"],
    "completed"
  >,
  reasonCodes: string[],
  requestDigest: string,
  authoritySnapshot: RecommendationOutcomeEvidenceCompletionResultV2["authority_snapshot"],
  provenance: RecommendationOutcomeEvidenceCompletionResultV2["observed_input_provenance"],
  v1CoreResultDigest: string | null = null,
) {
  const reasons = sortedUnique(reasonCodes);
  const failureIdentity = sha({
    taxonomy,
    request_digest: requestDigest,
    authority_snapshot: authoritySnapshot,
    observed_input_provenance: provenance,
    reason_codes: reasons,
  });
  return resultWithDigest({
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2,
    taxonomy,
    request_digest: requestDigest,
    authority_snapshot: authoritySnapshot,
    observed_input_provenance: provenance,
    completed_projection: null,
    closed_gap_codes: [],
    v1_core_result_digest: v1CoreResultDigest,
    failure_identity_digest: failureIdentity,
    reason_codes: reasons,
    ...boundary,
  });
}

const emptyProvenance = provenanceFromMaterial(
  {},
  "malformed",
  [],
);
const emptySnapshot = (
  disposition:
    | "not_read_default_off"
    | "not_read_kill_switch",
): RecommendationOutcomeEvidenceCompletionResultV2["authority_snapshot"] => ({
  snapshot_version:
    RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_SNAPSHOT_V2,
  disposition,
  snapshot_digest: sha({ disposition }),
  registry_identity: null,
  registry_digest: null,
  trust_root_digest: null,
  lineage_root_digest: null,
});
const DEFAULT_OFF_RESULT = terminalResult(
  "incomplete",
  ["recommendation_outcome_evidence_completion_v2_disabled"],
  sha({ disposition: "request_not_read_default_off" }),
  emptySnapshot("not_read_default_off"),
  emptyProvenance,
);
const KILL_SWITCH_RESULT = terminalResult(
  "incomplete",
  ["recommendation_outcome_evidence_completion_v2_kill_switch"],
  sha({ disposition: "request_not_read_kill_switch" }),
  emptySnapshot("not_read_kill_switch"),
  emptyProvenance,
);

function requestSnapshot(value: unknown) {
  const snapshot =
    canonicalizeRecommendationOutcomeEvidencePlainDataV2(value);
  const reasons = [...snapshot.reason_codes];
  const request = exactKeys(
    snapshot.value,
    [
      "contract_version",
      "completion_identity",
      "expected_repository_row_identity",
      "expected_evidence_bundle_identity",
    ],
    "v2_request_closed_schema_violation",
    reasons,
  );
  if (
    !request ||
    request.contract_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2 ||
    !nonEmpty(request.completion_identity) ||
    !nonEmpty(request.expected_repository_row_identity) ||
    !nonEmpty(request.expected_evidence_bundle_identity)
  ) {
    reasons.push("v2_request_invalid");
  }
  return {
    request,
    digest: snapshot.digest,
    reason_codes: sortedUnique(reasons),
  };
}

function taxonomyFromV1(
  taxonomy: RecommendationOutcomeEvidenceCompletionResultV1["taxonomy"],
) {
  return taxonomy;
}

export function completeRepositoryOwnedRecommendationOutcomeEvidenceV2(
  requestValue: unknown,
  dependencies: RecommendationOutcomeEvidenceCompletionDependenciesV2,
): RecommendationOutcomeEvidenceCompletionResultV2 {
  if (!dependencies.enabled) return DEFAULT_OFF_RESULT;
  if (dependencies.kill_switch) return KILL_SWITCH_RESULT;

  const requestInspection = requestSnapshot(requestValue);
  if (!requestInspection.request) {
    return terminalResult(
      "unmappable",
      requestInspection.reason_codes,
      requestInspection.digest,
      {
        ...emptySnapshot("not_read_default_off"),
        disposition: "rejected",
      },
      emptyProvenance,
    );
  }

  const authorityInspection = snapshotAuthority(dependencies.authority);
  if (!authorityInspection.ok) {
    return terminalResult(
      "incomplete",
      authorityInspection.reason_codes,
      requestInspection.digest,
      {
        snapshot_version:
          RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_SNAPSHOT_V2,
        disposition: "rejected",
        snapshot_digest: authorityInspection.snapshot_digest,
        registry_identity: null,
        registry_digest: null,
        trust_root_digest: null,
        lineage_root_digest: null,
      },
      emptyProvenance,
    );
  }
  const anchor = authorityInspection.anchor;
  const authoritySnapshot = {
    snapshot_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_SNAPSHOT_V2,
    disposition: "verified" as const,
    snapshot_digest: authorityInspection.anchor_digest,
    registry_identity: anchor.registry_identity,
    registry_digest: anchor.registry_digest,
    trust_root_digest: anchor.expected_trust_root_digest,
    lineage_root_digest: anchor.expected_lineage_root_digest,
  };

  let observedMaterial: unknown;
  try {
    observedMaterial = Reflect.apply(
      authorityInspection.callback,
      undefined,
      [],
    );
  } catch {
    return terminalResult(
      "incomplete",
      ["v2_authority_callback_failed_sanitized"],
      requestInspection.digest,
      {
        ...authoritySnapshot,
        disposition: "lookup_failed",
      },
      emptyProvenance,
    );
  }
  const materialSnapshot =
    canonicalizeRecommendationOutcomeEvidencePlainDataV2(
      observedMaterial,
    );
  if (!materialSnapshot.ok) {
    return terminalResult(
      "unmappable",
      materialSnapshot.reason_codes,
      requestInspection.digest,
      authoritySnapshot,
      provenanceFromMaterial(
        materialSnapshot.value,
        "present_rejected",
        materialSnapshot.reason_codes,
      ),
    );
  }
  const normalized = normalizeClosures(
    structuredClone(materialSnapshot.value),
  );
  if (normalized.reason_codes.length > 0) {
    return terminalResult(
      "incomplete",
      normalized.reason_codes,
      requestInspection.digest,
      authoritySnapshot,
      provenanceFromMaterial(
        normalized.material,
        "present_rejected",
        normalized.reason_codes,
      ),
    );
  }
  const normalizedMaterial = normalized.material;
  const materialRecord = record(normalizedMaterial);
  const provenanceBeforeCore = provenanceFromMaterial(
    normalizedMaterial,
    "present_rejected",
  );
  if (
    !materialRecord ||
    materialRecord.material_version !==
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_MATERIAL_V1
  ) {
    return terminalResult(
      "unmappable",
      ["v2_material_shape_invalid"],
      requestInspection.digest,
      authoritySnapshot,
      provenanceBeforeCore,
    );
  }

  const request = requestInspection.request;
  const v1Request = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1,
    completion_identity: request.completion_identity as string,
    expected_repository_row_identity:
      request.expected_repository_row_identity as string,
    expected_evidence_bundle_identity:
      request.expected_evidence_bundle_identity as string,
  } as const;
  const v1Authority: RecommendationOutcomeEvidenceAuthorityV1 = {
    authority_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V1,
    expected_registry_anchor: structuredClone(anchor),
    read_completion_material: () =>
      structuredClone(
        normalizedMaterial,
      ) as unknown as RecommendationOutcomeEvidenceMaterialV1,
  };
  let core: RecommendationOutcomeEvidenceCompletionResultV1;
  try {
    core = completeRepositoryOwnedRecommendationOutcomeEvidenceV1(
      v1Request,
      {
        enabled: true,
        kill_switch: false,
        authority: v1Authority,
      },
    );
  } catch {
    return terminalResult(
      "unmappable",
      ["v1_core_exception_sanitized"],
      requestInspection.digest,
      authoritySnapshot,
      provenanceBeforeCore,
    );
  }
  if (core.taxonomy !== "completed" || !core.completed_projection) {
    return terminalResult(
      taxonomyFromV1(core.taxonomy) as Exclude<
        RecommendationOutcomeEvidenceCompletionResultV2["taxonomy"],
        "completed"
      >,
      core.reason_codes.map((reason) => `v1_core:${reason}`),
      requestInspection.digest,
      authoritySnapshot,
      provenanceBeforeCore,
      core.result_digest,
    );
  }

  const verifiedProvenance = provenanceFromMaterial(
    normalizedMaterial,
    "verified",
  );
  return resultWithDigest({
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2,
    taxonomy: "completed",
    request_digest: requestInspection.digest,
    authority_snapshot: authoritySnapshot,
    observed_input_provenance: verifiedProvenance,
    completed_projection: freezeIterative(
      structuredClone(core.completed_projection),
    ),
    closed_gap_codes: [
      ...RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
    ],
    v1_core_result_digest: core.result_digest,
    failure_identity_digest: null,
    reason_codes: [
      "all_eighteen_not_bindable_gaps_explicitly_closed_v2",
    ],
    ...boundary,
  });
}

export function independentlyVerifyRecommendationOutcomeEvidenceCompletionV2(
  candidate: RecommendationOutcomeEvidenceCompletionResultV2,
  request: unknown,
  dependencies: RecommendationOutcomeEvidenceCompletionDependenciesV2,
) {
  const rebuilt =
    completeRepositoryOwnedRecommendationOutcomeEvidenceV2(
      request,
      dependencies,
    );
  return JSON.stringify(candidate) === JSON.stringify(rebuilt);
}

export function v2RegistryFromMaterial(
  material: PlainValue,
): RecommendationOutcomeEvidenceRegistryV1 | null {
  const materialRecord = record(material);
  return record(
    materialRecord?.registry,
  ) as unknown as RecommendationOutcomeEvidenceRegistryV1 | null;
}

export type RecommendationOutcomeEvidenceGapClosureV2 =
  RecommendationOutcomeEvidenceGapClosureV1;
