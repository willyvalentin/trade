import "server-only";

import {
  type CanonicalCompletedImprovementCaptureAuthority,
} from "@/lib/server/canonical-completed-improvement-evidence-capture";
import {
  CANONICAL_BINDING_BACKED_REPLAY_REQUEST_VERSION,
  CANONICAL_BINDING_SNAPSHOT_OWNER_BOUNDARY_VERSION,
  CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY,
  CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_DIGEST,
  CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION,
  createCanonicalBindingBackedImprovementReplayHarness,
  createCanonicalBindingSnapshotJsonSource,
  createCanonicalBindingSnapshotAdmissionAuthority,
  createCanonicalExternalImprovementBindingEntry,
  createCanonicalExternalImprovementBindingSnapshot,
  validateCanonicalBoundedSnapshotPayload,
  verifyCanonicalBindingBackedImprovementReplayResult,
  type CanonicalBindingBackedReplayRequest,
  type CanonicalBindingBackedReplayResult,
  type CanonicalExternalImprovementBindingEntry,
  type CanonicalExternalImprovementBindingSnapshot,
} from "@/lib/server/canonical-governed-binding-snapshot-admission";
import {
  CANONICAL_IMPROVEMENT_BINDING_OWNER_BOUNDARY_VERSION,
  createCanonicalImprovementBindingStoreHarness,
  type CanonicalImprovementBindingOwnerDependency,
  type CanonicalImprovementBindingLookupResult,
} from "@/lib/server/canonical-improvement-binding-store";
import {
  canonicalModelImprovementDigest,
} from "@/lib/server/canonical-model-improvement-proposal";
import {
  parseCanonicalExplicitInstant,
} from "@/lib/server/canonical-model-improvement-upstream-verification";

export const CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_SUCCESSOR_VERSION =
  "canonical_governed_binding_snapshot_issuance_successor_v3" as const;
export const CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUER_AUTHORITY_VERSION =
  "canonical_governed_binding_snapshot_issuer_authority_v3" as const;
export const CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_REQUEST_VERSION =
  "canonical_governed_binding_snapshot_issuance_request_v3" as const;
export const CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_OBSERVATION_VERSION =
  "canonical_governed_binding_snapshot_issuance_observation_v3" as const;
export const CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_VALIDATOR_VERSION =
  "canonical_governed_binding_snapshot_issuance_validator_v3" as const;
export const CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_BUDGET_VERSION =
  "canonical_governed_binding_snapshot_issuance_budget_v3" as const;
export const CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_STATUSES = [
  "issued",
  "incomplete",
  "conflicting",
  "not_point_in_time_safe",
  "rollback_rejected",
] as const;
export const DEFAULT_OFF_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_ENABLED = false;
export const DEFAULT_OFF_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_KILL_SWITCH =
  true;
export const CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_ARTIFACT_ROLES =
  Object.freeze({
    "lib/server/canonical-governed-binding-snapshot-issuance-successor.ts":
      "implementation",
    "lib/server/canonical-governed-binding-snapshot-issuance-successor-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666bq-governed-binding-snapshot-issuance-successor.spec.ts":
      "focused_tests",
    "docs/action-666bq-governed-binding-snapshot-issuance-successor.md":
      "contract_documentation",
    "docs/action-666bq-golden-binding-snapshot-issuance-successor-report.json":
      "synthetic_golden_report",
  } as const);

export const CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_BUDGETS =
  Object.freeze({
    policy_version:
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_BUDGET_VERSION,
    issuance_validator_version:
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_VALIDATOR_VERSION,
    inherited_snapshot_validator_version:
      CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION,
    inherited_snapshot_budget_policy:
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY,
    inherited_snapshot_budget_policy_digest:
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_DIGEST,
  });

export const CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_BUDGET_DIGEST =
  canonicalModelImprovementDigest(
    CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_BUDGETS,
  );

const shaPattern = /^[a-f0-9]{64}$/;
const identityPattern = /^[A-Za-z0-9][A-Za-z0-9._:/-]{2,255}$/;

function canonicalSnapshotJsonBytes(
  snapshot: CanonicalExternalImprovementBindingSnapshot,
) {
  const canonicalize = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value === null || typeof value !== "object") return value;
    return Object.fromEntries(
      Object.keys(value)
        .sort((first, second) =>
          first === second ? 0 : first < second ? -1 : 1,
        )
        .map((key) => [
          key,
          canonicalize((value as Record<string, unknown>)[key]),
        ]),
    );
  };
  return JSON.stringify(canonicalize(snapshot));
}

const safety = {
  shadow_only: true,
  live_ranking_effect: false,
  live_impact: false,
  persistence_performed: false,
  automatic_training_allowed: false,
  automatic_parameter_change_allowed: false,
  automatic_threshold_change_allowed: false,
  automatic_model_change_allowed: false,
  automatic_promotion_allowed: false,
  external_ai_canonical_truth_authority: false,
  causal_improvement_claimed: false,
  synthetic_evidence: true,
  not_publishable: true,
} as const;

type Safety = typeof safety;
type IssuanceStatus =
  (typeof CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_STATUSES)[number];
type BindingPlanItem = {
  entry_type: "previous_binding" | "capture_binding";
  bound_identity_type: "proposal" | "experiment" | "capture";
  bound_identity: string;
  expected_binding_digest: string;
  source_evidence_namespace:
    | "canonical_previous_binding_evidence"
    | "canonical_capture_binding_evidence";
  source_section_digest: string;
};

export type CanonicalGovernedBindingSnapshotIssuerAuthority = {
  authority_version:
    typeof CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUER_AUTHORITY_VERSION;
  authority_identity: string;
  owner_boundary_identity: string;
  external_owner_identity: string;
  issuer_identity: string;
  issuer_implementation_version: string;
  issuer_authority_anchor: string;
  registry_authority_identity: string;
  authority_manifest_digest: string;
  authority_root_digest: string;
  publication_sequence: number;
  publication_epoch: number;
  predecessor: CanonicalExternalImprovementBindingSnapshot["predecessor"];
  issued_at: string;
  evidence_cutoff: string;
  effective_at: string;
  binding_plan: BindingPlanItem[];
  binding_plan_digest: string;
  semantic_scope_digest: string;
  expected_request_identity: string;
  authority_digest_algorithm: "sha256_canonical_json_v1";
  authority_digest: string;
};

export type CanonicalGovernedBindingSnapshotIssuerAuthorityDependency = {
  owner_boundary_version:
    "canonical_governed_binding_snapshot_issuer_owner_boundary_v3";
  owner_boundary_identity: string;
  minimum_publication_epoch: number;
  read_expected_authority: () => CanonicalGovernedBindingSnapshotIssuerAuthority;
};

export type CanonicalGovernedBindingSnapshotIssuanceRequest = {
  request_version:
    typeof CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_REQUEST_VERSION;
  source_namespace: "completed_governed_binding_snapshot_issuance";
  issuance_identity: string;
  binding_backed_replay_request: CanonicalBindingBackedReplayRequest;
};

export type CanonicalGovernedBindingLookupObservation = {
  observation_version:
    typeof CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_OBSERVATION_VERSION;
  entry_type: "previous_binding" | "capture_binding";
  bound_identity_type: "proposal" | "experiment" | "capture";
  bound_identity: string;
  expected_binding_digest: string;
  observed_status:
    | "absent"
    | "matching"
    | "conflicting"
    | "not_effective"
    | "invalid_snapshot";
  observed_binding_digest: string | null;
  observed_snapshot_identity: string | null;
  observed_snapshot_digest: string;
  lookup_result_digest: string;
  observation_digest_algorithm: "sha256_canonical_json_v1";
  observation_digest: string;
};

export type CanonicalGovernedBindingInvalidRequestObservation = {
  observation_version:
    "canonical_governed_binding_invalid_request_observation_v3";
  observation_status: "complete" | "truncated" | "inaccessible";
  observed_top_level_type: string;
  available_issuance_identity: string | null;
  rejection_stage: "preclone_bounded_validation" | "request_schema";
  reason_codes: string[];
  budget_policy_digest: string;
  first_rejected_path: string | null;
  observed_depth: number;
  observed_nodes: number;
  observed_own_keys: number;
  observed_array_length: number | null;
  observed_string_bytes: number | null;
  observed_total_string_bytes: number;
  bounded_structural_digest: string;
  bounded_observation_digest_algorithm: "sha256_canonical_json_v1";
  bounded_observation_digest: string;
  full_request_digest_computed: boolean;
  full_request_digest: string | null;
};

export type CanonicalGovernedBindingSnapshotIssuanceCounters = {
  request_reads: number;
  clones: number;
  authority_reads: number;
  authority_verifications: number;
  store_constructions: number;
  entry_lookups: number;
  snapshot_constructions: number;
  bd_replay_executions: number;
  independent_rebuilds: number;
  digest_operations: number;
};

export type CanonicalGovernedBindingSnapshotIssuanceResult = {
  issuance_version:
    typeof CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_SUCCESSOR_VERSION;
  status: IssuanceStatus;
  issuance_identity: string | null;
  request_digest: string;
  authority_identity: string | null;
  authority_digest: string | null;
  authority_root_digest: string | null;
  issuer_identity: string | null;
  issuer_implementation_version: string | null;
  publication_sequence: number | null;
  publication_epoch: number | null;
  predecessor_digest: string | null;
  semantic_scope_digest: string | null;
  budget_policy_digest: string;
  invalid_request_observation:
    | CanonicalGovernedBindingInvalidRequestObservation
    | null;
  lookup_observations: CanonicalGovernedBindingLookupObservation[];
  lookup_observation_inventory_digest: string;
  external_snapshot: CanonicalExternalImprovementBindingSnapshot | null;
  admission_authority_digest: string | null;
  binding_backed_replay_result: CanonicalBindingBackedReplayResult | null;
  binding_backed_replay_verified: boolean;
  reason_codes: string[];
  issuance_digest_algorithm: "sha256_canonical_json_v1";
  issuance_digest: string;
} & Safety;

export type CanonicalGovernedBindingSnapshotIssuanceDependencies = {
  issuer_authority_dependency:
    CanonicalGovernedBindingSnapshotIssuerAuthorityDependency;
  ax_owner_dependency: CanonicalImprovementBindingOwnerDependency;
  capture_authority: CanonicalCompletedImprovementCaptureAuthority;
  counters?: CanonicalGovernedBindingSnapshotIssuanceCounters;
};

const recognizedAuthorities = new WeakSet<object>();

function digest(
  value: unknown,
  counters?: CanonicalGovernedBindingSnapshotIssuanceCounters,
) {
  if (counters) counters.digest_operations += 1;
  return canonicalModelImprovementDigest(value);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value;
}

function exactKeys(value: Record<string, unknown>, expected: string[]) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return (
    actual.length === wanted.length &&
    wanted.every((key, index) => key === actual[index])
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validIdentity(value: unknown): value is string {
  return typeof value === "string" && identityPattern.test(value);
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort();
}

function canonicalInstant(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = parseCanonicalExplicitInstant(value);
  if (!parsed) return null;
  const billion = BigInt(1_000_000_000);
  let seconds = parsed.epoch_nanoseconds / billion;
  let fraction = parsed.epoch_nanoseconds % billion;
  if (fraction < BigInt(0)) {
    seconds -= BigInt(1);
    fraction += billion;
  }
  const milliseconds = Number(seconds * BigInt(1_000));
  if (!Number.isSafeInteger(milliseconds)) return null;
  return {
    canonical: `${new Date(milliseconds).toISOString().slice(0, 19)}.${fraction
      .toString()
      .padStart(9, "0")}Z`,
    epoch_nanoseconds: parsed.epoch_nanoseconds,
  };
}

function emptyCounters(): CanonicalGovernedBindingSnapshotIssuanceCounters {
  return {
    request_reads: 0,
    clones: 0,
    authority_reads: 0,
    authority_verifications: 0,
    store_constructions: 0,
    entry_lookups: 0,
    snapshot_constructions: 0,
    bd_replay_executions: 0,
    independent_rebuilds: 0,
    digest_operations: 0,
  };
}

function bindingPlanDigest(plan: BindingPlanItem[]) {
  return canonicalModelImprovementDigest({
    inventory_version: "canonical_governed_binding_plan_inventory_v3",
    entries: [...plan]
      .sort((first, second) =>
        `${first.entry_type}:${first.bound_identity_type}:${first.bound_identity}`.localeCompare(
          `${second.entry_type}:${second.bound_identity_type}:${second.bound_identity}`,
        ),
      )
      .map((entry) => ({
        entry_type: entry.entry_type,
        bound_identity_type: entry.bound_identity_type,
        bound_identity: entry.bound_identity,
        expected_binding_digest: entry.expected_binding_digest,
        source_evidence_namespace: entry.source_evidence_namespace,
        source_section_digest: entry.source_section_digest,
      })),
  });
}

export function canonicalGovernedBindingSnapshotIssuanceSemanticScopeDigest(
  request: CanonicalGovernedBindingSnapshotIssuanceRequest,
) {
  return canonicalModelImprovementDigest({
    scope_version: "canonical_governed_binding_issuance_scope_v3",
    issuance_identity: request.issuance_identity,
    admission_identity:
      request.binding_backed_replay_request.admission_identity,
    lookup_as_of: request.binding_backed_replay_request.lookup_as_of,
    completed_upstream_evidence:
      request.binding_backed_replay_request.end_to_end_request
        .completed_capture_request,
  });
}

export function createCanonicalGovernedBindingSnapshotIssuerAuthority(input: {
  authority_identity: string;
  owner_boundary_identity: string;
  external_owner_identity: string;
  issuer_identity: string;
  issuer_implementation_version: string;
  issuer_authority_anchor: string;
  registry_authority_identity: string;
  authority_manifest_digest: string;
  authority_root_digest: string;
  publication_sequence: number;
  publication_epoch: number;
  predecessor: CanonicalExternalImprovementBindingSnapshot["predecessor"];
  issued_at: string;
  evidence_cutoff: string;
  effective_at: string;
  binding_plan: BindingPlanItem[];
  semantic_scope_digest: string;
  expected_request_identity: string;
}): CanonicalGovernedBindingSnapshotIssuerAuthority {
  const instants = [
    canonicalInstant(input.issued_at),
    canonicalInstant(input.evidence_cutoff),
    canonicalInstant(input.effective_at),
  ];
  if (
    !validIdentity(input.authority_identity) ||
    !validIdentity(input.owner_boundary_identity) ||
    !validIdentity(input.external_owner_identity) ||
    !validIdentity(input.issuer_identity) ||
    !validIdentity(input.issuer_implementation_version) ||
    !validIdentity(input.registry_authority_identity) ||
    !validIdentity(input.expected_request_identity) ||
    !shaPattern.test(input.issuer_authority_anchor) ||
    !shaPattern.test(input.authority_manifest_digest) ||
    !shaPattern.test(input.authority_root_digest) ||
    !shaPattern.test(input.semantic_scope_digest) ||
    !Number.isSafeInteger(input.publication_sequence) ||
    input.publication_sequence < 1 ||
    !Number.isSafeInteger(input.publication_epoch) ||
    input.publication_epoch < 1 ||
    instants.some((instant) => !instant)
  ) {
    throw new Error("governed_issuance_authority_invalid");
  }
  const bindingPlan = [...input.binding_plan]
    .map((entry) => ({ ...entry }))
    .sort((first, second) =>
      `${first.entry_type}:${first.bound_identity_type}:${first.bound_identity}`.localeCompare(
        `${second.entry_type}:${second.bound_identity_type}:${second.bound_identity}`,
      ),
    );
  const uniqueKeys = new Set(
    bindingPlan.map(
      (entry) =>
        `${entry.entry_type}:${entry.bound_identity_type}:${entry.bound_identity}`,
    ),
  );
  if (
    uniqueKeys.size !== bindingPlan.length ||
    bindingPlan.some(
      (entry) =>
        !validIdentity(entry.bound_identity) ||
        !shaPattern.test(entry.expected_binding_digest) ||
        !shaPattern.test(entry.source_section_digest) ||
        (entry.entry_type === "capture_binding"
          ? entry.bound_identity_type !== "capture" ||
            entry.source_evidence_namespace !==
              "canonical_capture_binding_evidence"
          : (entry.bound_identity_type !== "proposal" &&
              entry.bound_identity_type !== "experiment") ||
            entry.source_evidence_namespace !==
              "canonical_previous_binding_evidence"),
    )
  ) {
    throw new Error("governed_issuance_binding_plan_invalid");
  }
  const genesis =
    input.publication_sequence === 1 && input.publication_epoch === 1;
  if (
    (genesis &&
      (input.predecessor.state !== "genesis" ||
        input.predecessor.previous_snapshot_digest !== null)) ||
    (!genesis &&
      (input.predecessor.state !== "linked" ||
        !shaPattern.test(
          input.predecessor.previous_snapshot_digest ?? "",
        ) ||
        input.predecessor.previous_publication_sequence !==
          input.publication_sequence - 1 ||
        input.predecessor.previous_publication_epoch === null ||
        input.predecessor.previous_publication_epoch >=
          input.publication_epoch))
  ) {
    throw new Error("governed_issuance_predecessor_invalid");
  }
  const payload = {
    authority_version:
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUER_AUTHORITY_VERSION,
    authority_identity: input.authority_identity,
    owner_boundary_identity: input.owner_boundary_identity,
    external_owner_identity: input.external_owner_identity,
    issuer_identity: input.issuer_identity,
    issuer_implementation_version: input.issuer_implementation_version,
    issuer_authority_anchor: input.issuer_authority_anchor,
    registry_authority_identity: input.registry_authority_identity,
    authority_manifest_digest: input.authority_manifest_digest,
    authority_root_digest: input.authority_root_digest,
    publication_sequence: input.publication_sequence,
    publication_epoch: input.publication_epoch,
    predecessor: structuredClone(input.predecessor),
    issued_at: instants[0]!.canonical,
    evidence_cutoff: instants[1]!.canonical,
    effective_at: instants[2]!.canonical,
    binding_plan: bindingPlan,
    binding_plan_digest: bindingPlanDigest(bindingPlan),
    semantic_scope_digest: input.semantic_scope_digest,
    expected_request_identity: input.expected_request_identity,
    authority_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  const authority = deepFreeze({
    ...payload,
    authority_digest: digest(payload),
  });
  recognizedAuthorities.add(authority);
  return authority;
}

function safeTopLevelObservation(value: unknown) {
  const type =
    value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  let identity: string | null = null;
  if (isRecord(value)) {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(
        value,
        "issuance_identity",
      );
      if (
        descriptor &&
        "value" in descriptor &&
        validIdentity(descriptor.value)
      ) {
        identity = descriptor.value;
      }
    } catch {
      identity = null;
    }
  }
  return { type, identity };
}

function boundedStructuralDigest(value: unknown) {
  const tokens: string[] = [];
  const seen = new WeakMap<object, number>();
  let seenCount = 0;
  const queue: Array<{ value: unknown; path: string }> = [
    { value, path: "$" },
  ];
  while (queue.length > 0 && tokens.length < 256) {
    const current = queue.shift()!;
    if (
      current.value === null ||
      typeof current.value === "boolean" ||
      typeof current.value === "number" ||
      typeof current.value === "string"
    ) {
      tokens.push(
        `${current.path}:${typeof current.value}:${String(current.value).slice(0, 128)}`,
      );
      continue;
    }
    if (
      typeof current.value !== "object" ||
      current.value === null
    ) {
      tokens.push(`${current.path}:${typeof current.value}`);
      continue;
    }
    const object = current.value as object;
    const prior = seen.get(object);
    if (prior !== undefined) {
      tokens.push(`${current.path}:cycle:${prior}`);
      continue;
    }
    seen.set(object, seenCount);
    seenCount += 1;
    let keys: (string | symbol)[];
    try {
      keys = Reflect.ownKeys(object).sort((first, second) =>
        String(first).localeCompare(String(second)),
      );
    } catch {
      tokens.push(`${current.path}:inaccessible`);
      break;
    }
    tokens.push(
      `${current.path}:${Array.isArray(object) ? "array" : "object"}:${keys.length}`,
    );
    for (const key of keys.slice(0, 64)) {
      let descriptor: PropertyDescriptor | undefined;
      try {
        descriptor = Object.getOwnPropertyDescriptor(object, key);
      } catch {
        tokens.push(`${current.path}.${String(key)}:inaccessible`);
        continue;
      }
      if (!descriptor || !("value" in descriptor)) {
        tokens.push(`${current.path}.${String(key)}:accessor`);
        continue;
      }
      queue.push({
        value: descriptor.value,
        path: `${current.path}.${String(key)}`,
      });
    }
  }
  return canonicalModelImprovementDigest({
    prefix_version: "canonical_bounded_issuance_structural_prefix_v3",
    truncated: queue.length > 0,
    tokens,
  });
}

function invalidRequestObservation(input: {
  raw: unknown;
  validation: ReturnType<
    typeof validateCanonicalBoundedSnapshotPayload
  >;
  stage: "preclone_bounded_validation" | "request_schema";
  reasonCodes: string[];
  fullDigest: string | null;
  counters: CanonicalGovernedBindingSnapshotIssuanceCounters;
}): CanonicalGovernedBindingInvalidRequestObservation {
  const top = safeTopLevelObservation(input.raw);
  const rejected =
    input.validation.status === "valid"
      ? null
      : input.validation.first_rejected_path;
  const payload = {
    observation_version:
      "canonical_governed_binding_invalid_request_observation_v3" as const,
    observation_status:
      input.validation.status === "valid"
        ? ("complete" as const)
        : input.validation.status === "budget_exceeded"
          ? ("truncated" as const)
          : ("inaccessible" as const),
    observed_top_level_type: top.type,
    available_issuance_identity: top.identity,
    rejection_stage: input.stage,
    reason_codes: uniqueSorted(input.reasonCodes),
    budget_policy_digest:
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_BUDGET_DIGEST,
    first_rejected_path: rejected,
    observed_depth: input.validation.observed_depth,
    observed_nodes: input.validation.observed_nodes,
    observed_own_keys: input.validation.observed_own_keys,
    observed_array_length: input.validation.observed_array_length,
    observed_string_bytes: input.validation.observed_string_bytes,
    observed_total_string_bytes:
      input.validation.observed_total_string_bytes,
    bounded_structural_digest: boundedStructuralDigest(input.raw),
    full_request_digest_computed: input.fullDigest !== null,
    full_request_digest: input.fullDigest,
    bounded_observation_digest_algorithm:
      "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    ...payload,
    bounded_observation_digest: digest(payload, input.counters),
  });
}

function result(input: {
  status: IssuanceStatus;
  request: CanonicalGovernedBindingSnapshotIssuanceRequest | null;
  requestDigest: string;
  authority: CanonicalGovernedBindingSnapshotIssuerAuthority | null;
  invalidObservation?: CanonicalGovernedBindingInvalidRequestObservation;
  observations?: CanonicalGovernedBindingLookupObservation[];
  snapshot?: CanonicalExternalImprovementBindingSnapshot;
  admissionAuthorityDigest?: string;
  replay?: CanonicalBindingBackedReplayResult;
  replayVerified?: boolean;
  reasons: string[];
  counters: CanonicalGovernedBindingSnapshotIssuanceCounters;
}): CanonicalGovernedBindingSnapshotIssuanceResult {
  const observations = [...(input.observations ?? [])].sort((first, second) =>
    `${first.entry_type}:${first.bound_identity_type}:${first.bound_identity}`.localeCompare(
      `${second.entry_type}:${second.bound_identity_type}:${second.bound_identity}`,
    ),
  );
  const observationInventoryDigest = digest(
    {
      inventory_version:
        "canonical_governed_binding_lookup_observation_inventory_v3",
      observations: observations.map((observation) => ({
        observation_digest: observation.observation_digest,
      })),
    },
    input.counters,
  );
  const payload = {
    issuance_version:
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_SUCCESSOR_VERSION,
    status: input.status,
    issuance_identity: input.request?.issuance_identity ?? null,
    request_digest: input.requestDigest,
    authority_identity: input.authority?.authority_identity ?? null,
    authority_digest: input.authority?.authority_digest ?? null,
    authority_root_digest:
      input.authority?.authority_root_digest ?? null,
    issuer_identity: input.authority?.issuer_identity ?? null,
    issuer_implementation_version:
      input.authority?.issuer_implementation_version ?? null,
    publication_sequence:
      input.authority?.publication_sequence ?? null,
    publication_epoch: input.authority?.publication_epoch ?? null,
    predecessor_digest:
      input.authority?.predecessor.previous_snapshot_digest ?? null,
    semantic_scope_digest:
      input.authority?.semantic_scope_digest ?? null,
    budget_policy_digest:
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_BUDGET_DIGEST,
    invalid_request_observation: input.invalidObservation ?? null,
    lookup_observations: observations,
    lookup_observation_inventory_digest: observationInventoryDigest,
    external_snapshot: input.snapshot ?? null,
    admission_authority_digest:
      input.admissionAuthorityDigest ?? null,
    binding_backed_replay_result: input.replay ?? null,
    binding_backed_replay_verified: input.replayVerified ?? false,
    reason_codes: uniqueSorted(input.reasons),
    issuance_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...payload,
    issuance_digest: digest(payload, input.counters),
  });
}

function observationFromLookup(input: {
  plan: BindingPlanItem;
  lookup: CanonicalImprovementBindingLookupResult;
  counters: CanonicalGovernedBindingSnapshotIssuanceCounters;
}): CanonicalGovernedBindingLookupObservation {
  const status =
    input.lookup.status === "found"
      ? input.lookup.observed_binding_digest ===
        input.plan.expected_binding_digest
        ? "matching"
        : "conflicting"
      : input.lookup.status;
  const payload = {
    observation_version:
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_OBSERVATION_VERSION,
    entry_type: input.plan.entry_type,
    bound_identity_type: input.plan.bound_identity_type,
    bound_identity: input.plan.bound_identity,
    expected_binding_digest: input.plan.expected_binding_digest,
    observed_status: status as CanonicalGovernedBindingLookupObservation["observed_status"],
    observed_binding_digest: input.lookup.observed_binding_digest,
    observed_snapshot_identity: input.lookup.snapshot_identity,
    observed_snapshot_digest: input.lookup.snapshot_digest,
    lookup_result_digest: input.lookup.result_digest,
    observation_digest_algorithm:
      "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    ...payload,
    observation_digest: digest(payload, input.counters),
  });
}

function execute(input: {
  rawRequest: unknown;
  dependencies: CanonicalGovernedBindingSnapshotIssuanceDependencies;
  counters: CanonicalGovernedBindingSnapshotIssuanceCounters;
}) {
  input.counters.request_reads += 1;
  const validation = validateCanonicalBoundedSnapshotPayload(
    input.rawRequest,
  );
  if (validation.status !== "valid") {
    const reasons =
      validation.status === "budget_exceeded"
        ? [
            "issuance_request_validation_budget_exceeded",
            `issuance_budget:${validation.budget_kind}`,
          ]
        : ["issuance_request_payload_invalid"];
    const observed = invalidRequestObservation({
      raw: input.rawRequest,
      validation,
      stage: "preclone_bounded_validation",
      reasonCodes: reasons,
      fullDigest: null,
      counters: input.counters,
    });
    return result({
      status: "incomplete",
      request: null,
      requestDigest: observed.bounded_observation_digest,
      invalidObservation: observed,
      reasons,
      counters: input.counters,
      authority: null,
    });
  }
  input.counters.clones += 1;
  let cloned: unknown;
  try {
    cloned = structuredClone(input.rawRequest);
  } catch {
    const reasons = ["issuance_request_clone_failed"];
    const observed = invalidRequestObservation({
      raw: input.rawRequest,
      validation,
      stage: "preclone_bounded_validation",
      reasonCodes: reasons,
      fullDigest: null,
      counters: input.counters,
    });
    return result({
      status: "incomplete",
      request: null,
      requestDigest: observed.bounded_observation_digest,
      invalidObservation: observed,
      reasons,
      counters: input.counters,
      authority: null,
    });
  }
  const fullDigest = digest(cloned, input.counters);
  const requestKeys = [
    "binding_backed_replay_request",
    "issuance_identity",
    "request_version",
    "source_namespace",
  ];
  if (
    !isRecord(cloned) ||
    !exactKeys(cloned, requestKeys) ||
    cloned.request_version !==
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_REQUEST_VERSION ||
    cloned.source_namespace !==
      "completed_governed_binding_snapshot_issuance" ||
    !validIdentity(cloned.issuance_identity) ||
    !isRecord(cloned.binding_backed_replay_request) ||
    cloned.binding_backed_replay_request.request_version !==
      CANONICAL_BINDING_BACKED_REPLAY_REQUEST_VERSION
  ) {
    const reasons = ["issuance_request_schema_invalid"];
    const observed = invalidRequestObservation({
      raw: cloned,
      validation,
      stage: "request_schema",
      reasonCodes: reasons,
      fullDigest,
      counters: input.counters,
    });
    return result({
      status: "incomplete",
      request: null,
      requestDigest: fullDigest,
      invalidObservation: observed,
      reasons,
      counters: input.counters,
      authority: null,
    });
  }
  const request =
    cloned as CanonicalGovernedBindingSnapshotIssuanceRequest;
  input.counters.authority_reads += 1;
  let authority: CanonicalGovernedBindingSnapshotIssuerAuthority;
  try {
    authority =
      input.dependencies.issuer_authority_dependency.read_expected_authority();
  } catch {
    return result({
      status: "conflicting",
      request,
      requestDigest: fullDigest,
      authority: null,
      reasons: ["issuance_external_authority_read_failed"],
      counters: input.counters,
    });
  }
  input.counters.authority_verifications += 1;
  if (
    !recognizedAuthorities.has(authority) ||
    authority.authority_version !==
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUER_AUTHORITY_VERSION ||
    authority.owner_boundary_identity !==
      input.dependencies.issuer_authority_dependency
        .owner_boundary_identity ||
    authority.expected_request_identity !== request.issuance_identity ||
    authority.binding_plan_digest !==
      bindingPlanDigest(authority.binding_plan)
  ) {
    return result({
      status: "conflicting",
      request,
      requestDigest: fullDigest,
      authority: null,
      reasons: ["issuance_external_authority_unrecognized"],
      counters: input.counters,
    });
  }
  if (
    authority.semantic_scope_digest !==
    canonicalGovernedBindingSnapshotIssuanceSemanticScopeDigest(request)
  ) {
    return result({
      status: "conflicting",
      request,
      requestDigest: fullDigest,
      authority,
      reasons: ["issuance_semantic_scope_authority_mismatch"],
      counters: input.counters,
    });
  }
  if (
    authority.publication_epoch <
    input.dependencies.issuer_authority_dependency
      .minimum_publication_epoch
  ) {
    return result({
      status: "rollback_rejected",
      request,
      requestDigest: fullDigest,
      authority,
      reasons: ["issuance_owner_epoch_rollback_rejected"],
      counters: input.counters,
    });
  }
  const authorityPayload = structuredClone(authority);
  delete (
    authorityPayload as Partial<CanonicalGovernedBindingSnapshotIssuerAuthority>
  ).authority_digest;
  if (
    authority.authority_digest !== digest(authorityPayload, input.counters)
  ) {
    return result({
      status: "conflicting",
      request,
      requestDigest: fullDigest,
      authority,
      reasons: ["issuance_external_authority_digest_mismatch"],
      counters: input.counters,
    });
  }
  const issued = canonicalInstant(authority.issued_at);
  const cutoff = canonicalInstant(authority.evidence_cutoff);
  const effective = canonicalInstant(authority.effective_at);
  const asOf = canonicalInstant(
    request.binding_backed_replay_request.lookup_as_of,
  );
  if (!issued || !cutoff || !effective || !asOf) {
    return result({
      status: "not_point_in_time_safe",
      request,
      requestDigest: fullDigest,
      authority,
      reasons: ["issuance_explicit_instant_invalid"],
      counters: input.counters,
    });
  }
  if (
    cutoff.epoch_nanoseconds > issued.epoch_nanoseconds ||
    effective.epoch_nanoseconds > issued.epoch_nanoseconds ||
    issued.epoch_nanoseconds > asOf.epoch_nanoseconds
  ) {
    return result({
      status: "not_point_in_time_safe",
      request,
      requestDigest: fullDigest,
      authority,
      reasons: ["issuance_future_or_post_cutoff_evidence"],
      counters: input.counters,
    });
  }
  const genesis =
    authority.publication_sequence === 1 &&
    authority.publication_epoch === 1;
  if (
    (genesis && authority.predecessor.state !== "genesis") ||
    (!genesis &&
      (authority.predecessor.state !== "linked" ||
        authority.predecessor.previous_publication_sequence !==
          authority.publication_sequence - 1 ||
        authority.predecessor.previous_publication_epoch === null ||
        authority.predecessor.previous_publication_epoch >=
          authority.publication_epoch))
  ) {
    return result({
      status: "rollback_rejected",
      request,
      requestDigest: fullDigest,
      authority,
      reasons: ["issuance_epoch_predecessor_rollback_rejected"],
      counters: input.counters,
    });
  }
  input.counters.store_constructions += 1;
  const storeHarness = createCanonicalImprovementBindingStoreHarness({
    enabled: true,
    kill_switch_engaged: false,
    owner_dependency: input.dependencies.ax_owner_dependency,
  });
  if (!storeHarness.store) {
    return result({
      status: "incomplete",
      request,
      requestDigest: fullDigest,
      authority,
      reasons: ["issuance_ax_read_only_store_unavailable"],
      counters: input.counters,
    });
  }
  const observations = authority.binding_plan.map((plan) => {
    input.counters.entry_lookups += 1;
    const lookup =
      plan.entry_type === "capture_binding"
        ? storeHarness.store!.lookup_capture_binding({
            capture_identity: plan.bound_identity,
            as_of: authority.evidence_cutoff,
          })
        : storeHarness.store!.lookup_previous_binding({
            binding_identity_type:
              plan.bound_identity_type as "proposal" | "experiment",
            binding_identity: plan.bound_identity,
            as_of: authority.evidence_cutoff,
          });
    return observationFromLookup({ plan, lookup, counters: input.counters });
  });
  if (
    observations.some(
      (observation) => observation.observed_status === "conflicting",
    )
  ) {
    return result({
      status: "conflicting",
      request,
      requestDigest: fullDigest,
      authority,
      observations,
      reasons: ["issuance_ax_binding_collision"],
      counters: input.counters,
    });
  }
  if (
    observations.some(
      (observation) =>
        observation.observed_status === "invalid_snapshot" ||
        observation.observed_status === "not_effective",
    )
  ) {
    return result({
      status: "incomplete",
      request,
      requestDigest: fullDigest,
      authority,
      observations,
      reasons: ["issuance_ax_lookup_not_usable"],
      counters: input.counters,
    });
  }
  const entries: CanonicalExternalImprovementBindingEntry[] = observations
    .filter(
      (observation) => observation.observed_status === "matching",
    )
    .map((observation) =>
      createCanonicalExternalImprovementBindingEntry({
        entry_type: observation.entry_type,
        bound_identity_type: observation.bound_identity_type,
        bound_identity: observation.bound_identity,
        observed_binding_digest:
          observation.observed_binding_digest!,
        expected_binding_digest: observation.expected_binding_digest,
        source_evidence_namespace:
          observation.entry_type === "capture_binding"
            ? "canonical_capture_binding_evidence"
            : "canonical_previous_binding_evidence",
        source_section_digest:
          authority.binding_plan.find(
            (plan) =>
              plan.entry_type === observation.entry_type &&
              plan.bound_identity === observation.bound_identity,
          )!.source_section_digest,
        effective_at: authority.evidence_cutoff,
      }),
    );
  input.counters.snapshot_constructions += 1;
  const snapshot = createCanonicalExternalImprovementBindingSnapshot({
    owner_authority_identity: authority.external_owner_identity,
    registry_authority_identity:
      authority.registry_authority_identity,
    authority_manifest_digest: authority.authority_manifest_digest,
    authority_root_digest: authority.authority_root_digest,
    publication_sequence: authority.publication_sequence,
    publication_epoch: authority.publication_epoch,
    predecessor: authority.predecessor,
    captured_at: authority.issued_at,
    evidence_cutoff: authority.evidence_cutoff,
    effective_at: authority.effective_at,
    entry_inventory: entries,
  });
  const admissionAuthority =
    createCanonicalBindingSnapshotAdmissionAuthority({
      authority_identity: `${authority.authority_identity}:bd`,
      owner_boundary_identity:
        CANONICAL_BINDING_SNAPSHOT_OWNER_BOUNDARY_VERSION,
      snapshot,
    });
  const bdDependencies = {
    authority_dependency: {
      owner_boundary_version:
        CANONICAL_BINDING_SNAPSHOT_OWNER_BOUNDARY_VERSION,
      owner_boundary_identity:
        CANONICAL_BINDING_SNAPSHOT_OWNER_BOUNDARY_VERSION,
      expected_authority_identity: admissionAuthority.authority_identity,
      expected_authority_digest: admissionAuthority.authority_digest,
      read_expected_authority: () => admissionAuthority,
    },
    snapshot_dependency: createCanonicalBindingSnapshotJsonSource(
      canonicalSnapshotJsonBytes(snapshot),
    ),
    capture_authority: input.dependencies.capture_authority,
    expected_capture_authority_identity:
      input.dependencies.capture_authority.authority_identity,
    expected_capture_authority_digest:
      input.dependencies.capture_authority.authority_digest,
  };
  const bdHarness =
    createCanonicalBindingBackedImprovementReplayHarness({
      enabled: true,
      kill_switch_engaged: false,
      dependencies: bdDependencies,
    });
  if (!bdHarness.replay) {
    return result({
      status: "incomplete",
      request,
      requestDigest: fullDigest,
      authority,
      observations,
      snapshot,
      admissionAuthorityDigest: admissionAuthority.authority_digest,
      reasons: ["issuance_bd_replay_unavailable"],
      counters: input.counters,
    });
  }
  input.counters.bd_replay_executions += 1;
  const replay = bdHarness.replay(
    request.binding_backed_replay_request,
  );
  input.counters.independent_rebuilds += 1;
  const verification =
    verifyCanonicalBindingBackedImprovementReplayResult({
      request: request.binding_backed_replay_request,
      result: replay,
      harness: bdHarness,
    });
  if (!verification.valid || replay.status !== "admitted") {
    return result({
      status: replay.status === "conflicting" ? "conflicting" : "incomplete",
      request,
      requestDigest: fullDigest,
      authority,
      observations,
      snapshot,
      admissionAuthorityDigest: admissionAuthority.authority_digest,
      replay,
      replayVerified: verification.valid,
      reasons: verification.valid
        ? replay.reason_codes
        : ["issuance_bd_replay_independent_rebuild_failed"],
      counters: input.counters,
    });
  }
  return result({
    status: "issued",
    request,
    requestDigest: fullDigest,
    authority,
    observations,
    snapshot,
    admissionAuthorityDigest: admissionAuthority.authority_digest,
    replay,
    replayVerified: true,
    reasons: [],
    counters: input.counters,
  });
}

export function createCanonicalGovernedBindingSnapshotIssuanceHarness(
  input: {
    enabled?: boolean;
    kill_switch_engaged?: boolean;
    dependencies?: CanonicalGovernedBindingSnapshotIssuanceDependencies;
    counters?: CanonicalGovernedBindingSnapshotIssuanceCounters;
  } = {},
) {
  const enabled =
    input.enabled ??
    DEFAULT_OFF_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_ENABLED;
  const killSwitch =
    input.kill_switch_engaged ??
    DEFAULT_OFF_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_KILL_SWITCH;
  const counters = input.counters ?? emptyCounters();
  if (!enabled || killSwitch) {
    return deepFreeze({
      enabled: false as const,
      status: !enabled
        ? ("disabled" as const)
        : ("kill_switch_engaged" as const),
      issue: null,
      counters,
      ...safety,
    });
  }
  const dependencies = input.dependencies;
  if (
    !dependencies ||
    dependencies.issuer_authority_dependency.owner_boundary_version !==
      "canonical_governed_binding_snapshot_issuer_owner_boundary_v3" ||
    !Number.isSafeInteger(
      dependencies.issuer_authority_dependency
        .minimum_publication_epoch,
    ) ||
    dependencies.issuer_authority_dependency.minimum_publication_epoch < 1 ||
    dependencies.ax_owner_dependency.owner_boundary_version !==
      CANONICAL_IMPROVEMENT_BINDING_OWNER_BOUNDARY_VERSION
  ) {
    return deepFreeze({
      enabled: true as const,
      status: "unavailable" as const,
      issue: null,
      counters,
      reason_codes: ["issuance_dependencies_missing_or_invalid"],
      ...safety,
    });
  }
  return {
    enabled: true as const,
    status: "ready" as const,
    issue: (request: unknown) =>
      execute({ rawRequest: request, dependencies, counters }),
    counters,
    ...safety,
  };
}

export function verifyCanonicalGovernedBindingSnapshotIssuanceResult(input: {
  request: unknown;
  result: CanonicalGovernedBindingSnapshotIssuanceResult;
  dependencies: CanonicalGovernedBindingSnapshotIssuanceDependencies;
}) {
  const harness = createCanonicalGovernedBindingSnapshotIssuanceHarness({
    enabled: true,
    kill_switch_engaged: false,
    dependencies: input.dependencies,
  });
  if (!harness.issue) {
    return deepFreeze({
      valid: false,
      canonical_result: null,
      reason_codes: ["issuance_rebuild_unavailable"],
    });
  }
  const canonicalResult = harness.issue(input.request);
  const valid =
    canonicalResult.issuance_digest === input.result.issuance_digest &&
    digest(canonicalResult) === digest(input.result);
  return deepFreeze({
    valid,
    canonical_result: valid ? canonicalResult : null,
    reason_codes: valid
      ? []
      : ["governed_binding_snapshot_issuance_result_tampered"],
  });
}

export function canonicalGovernedBindingSnapshotIssuanceDigest(
  value: unknown,
) {
  return digest(value);
}
