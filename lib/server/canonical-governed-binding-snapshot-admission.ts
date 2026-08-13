import "server-only";

import { createHash } from "node:crypto";
import { types as nodeTypes } from "node:util";

import {
  CANONICAL_COUNTERFACTUAL_REASON_CODES,
} from "@/lib/canonical-counterfactual-opportunity-set";
import {
  canonicalQualityCalibrationBuckets,
  canonicalQualityPublishabilityPolicy,
  canonicalQualityRankingKValues,
} from "@/lib/canonical-quality-metrics";
import {
  canonicalScorecardComparabilityPolicy,
  canonicalShadowModelChangePolicy,
} from "@/lib/canonical-quality-scorecard";

import {
  CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_AUTHORITY_VERSION,
  CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_STATUSES,
  createCanonicalCompletedImprovementCaptureHarness,
  type CanonicalCompletedImprovementCaptureAuthority,
} from "@/lib/server/canonical-completed-improvement-evidence-capture";
import {
  CANONICAL_GOVERNED_IMPROVEMENT_COMPLETED_PROPOSAL_STATUSES,
  CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_STATUSES,
  createCanonicalGovernedImprovementEndToEndReplayHarness,
  verifyCanonicalGovernedImprovementEndToEndResult,
  type CanonicalGovernedImprovementEndToEndRequest,
  type CanonicalGovernedImprovementEndToEndResult,
} from "@/lib/server/canonical-governed-improvement-end-to-end-replay";
import {
  CANONICAL_IMPROVEMENT_BINDING_ENTRY_TYPES,
  CANONICAL_IMPROVEMENT_BINDING_LOOKUP_STATUSES,
  CANONICAL_IMPROVEMENT_BINDING_OWNER_BOUNDARY_VERSION,
  CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION,
  createCanonicalImprovementBindingEntry,
  createCanonicalImprovementBindingLookupAdapters,
  createCanonicalImprovementBindingSnapshot,
  createCanonicalImprovementBindingSnapshotAuthority,
  createCanonicalImprovementBindingStoreHarness,
  type CanonicalImprovementBindingEntry,
  type CanonicalImprovementBindingSnapshot,
} from "@/lib/server/canonical-improvement-binding-store";
import {
  CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_CLASSES,
  CANONICAL_MODEL_IMPROVEMENT_METRICS,
  CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_TYPES,
  canonicalModelImprovementPolicy,
} from "@/lib/server/canonical-model-improvement-proposal";
import {
  CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_NAMESPACES,
} from "@/lib/server/canonical-model-improvement-upstream-verification";
export const CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_ADMISSION_VERSION =
  "canonical_improvement_binding_snapshot_admission_v1" as const;
export const CANONICAL_BINDING_BACKED_IMPROVEMENT_REPLAY_VERSION =
  "canonical_binding_backed_improvement_replay_v1" as const;
export const CANONICAL_EXTERNAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION =
  "canonical_external_improvement_binding_snapshot_v1" as const;
export const CANONICAL_EXTERNAL_IMPROVEMENT_BINDING_ENTRY_VERSION =
  "canonical_external_improvement_binding_entry_v1" as const;
export const CANONICAL_BINDING_SNAPSHOT_AUTHORITY_VERSION =
  "canonical_binding_snapshot_admission_authority_v1" as const;
export const CANONICAL_BINDING_SNAPSHOT_OWNER_BOUNDARY_VERSION =
  "canonical_binding_snapshot_admission_owner_boundary_v1" as const;
export const CANONICAL_BINDING_BACKED_REPLAY_REQUEST_VERSION =
  "canonical_binding_backed_improvement_replay_request_v1" as const;
export const CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION =
  "canonical_bounded_snapshot_validator_v1" as const;
export const CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_VERSION =
  "canonical_bounded_snapshot_budget_policy_v1" as const;
export const CANONICAL_BINDING_SNAPSHOT_ADMISSION_STATUSES = Object.freeze([
  "admitted",
  "incomplete",
  "conflicting",
  "not_point_in_time_safe",
  "unmappable",
] as const);
export const DEFAULT_OFF_BINDING_SNAPSHOT_ADMISSION_ENABLED = false;
export const DEFAULT_OFF_BINDING_SNAPSHOT_ADMISSION_KILL_SWITCH_ENGAGED =
  true;

type AdmissionStatus =
  (typeof CANONICAL_BINDING_SNAPSHOT_ADMISSION_STATUSES)[number];
type EntryType = "previous_binding" | "capture_binding";
type BoundIdentityType = "proposal" | "experiment" | "capture";

const explicitInstantPattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/;
const intrinsicStructuredClone = structuredClone;
const intrinsicJsonParse = JSON.parse;
const intrinsicJsonStringify = JSON.stringify;
const intrinsicObjectFreeze = Object.freeze;
const intrinsicObjectIsFrozen = Object.isFrozen;
const intrinsicObjectIs = Object.is;
const intrinsicObjectKeys = Object.keys;
const intrinsicObjectValues = Object.values;
const intrinsicObjectEntries = Object.entries;
const intrinsicObjectFromEntries = Object.fromEntries;
const intrinsicObjectGetOwnPropertyDescriptor =
  Object.getOwnPropertyDescriptor;
const intrinsicObjectGetPrototypeOf = Object.getPrototypeOf;
const intrinsicObjectHasOwn = Object.hasOwn;
const intrinsicObjectPrototype = Object.prototype;
const intrinsicArrayIsArray = Array.isArray;
const intrinsicArrayFrom = Array.from;
const intrinsicArrayPrototype = Array.prototype;
const intrinsicArrayEvery = Array.prototype.every;
const intrinsicArrayFilter = Array.prototype.filter;
const intrinsicArrayIncludes = Array.prototype.includes;
const intrinsicArrayJoin = Array.prototype.join;
const intrinsicArrayMap = Array.prototype.map;
const intrinsicArrayPop = Array.prototype.pop;
const intrinsicArrayPush = Array.prototype.push;
const intrinsicArraySome = Array.prototype.some;
const intrinsicArraySort = Array.prototype.sort;
const IntrinsicArray = Array;
const IntrinsicMap = Map;
const intrinsicMapGet = Map.prototype.get;
const intrinsicMapSet = Map.prototype.set;
const IntrinsicSet = Set;
const intrinsicSetAdd = Set.prototype.add;
const intrinsicSetHas = Set.prototype.has;
const IntrinsicWeakMap = WeakMap;
const intrinsicWeakMapGet = WeakMap.prototype.get;
const intrinsicWeakMapHas = WeakMap.prototype.has;
const intrinsicWeakMapSet = WeakMap.prototype.set;
const IntrinsicWeakSet = WeakSet;
const intrinsicWeakSetAdd = WeakSet.prototype.add;
const intrinsicWeakSetDelete = WeakSet.prototype.delete;
const intrinsicWeakSetHas = WeakSet.prototype.has;
const intrinsicNumberIsFinite = Number.isFinite;
const intrinsicNumberIsSafeInteger = Number.isSafeInteger;
const intrinsicReflectApply = Reflect.apply;
const intrinsicReflectOwnKeys = Reflect.ownKeys;
const intrinsicNodeIsProxy = nodeTypes.isProxy;
const intrinsicRegExpExec = RegExp.prototype.exec;
const IntrinsicDate = Date;
const intrinsicDateUtc = Date.UTC;
const intrinsicDateGetUTCFullYear = Date.prototype.getUTCFullYear;
const intrinsicDateGetUTCMonth = Date.prototype.getUTCMonth;
const intrinsicDateGetUTCDate = Date.prototype.getUTCDate;
const intrinsicDateGetUTCHours = Date.prototype.getUTCHours;
const intrinsicDateGetUTCMinutes = Date.prototype.getUTCMinutes;
const intrinsicDateGetUTCSeconds = Date.prototype.getUTCSeconds;
const intrinsicDateToISOString = Date.prototype.toISOString;
const intrinsicNumber = Number;
const intrinsicBigInt = BigInt;
const intrinsicMathMax = Math.max;
const intrinsicMathMin = Math.min;
const intrinsicMathTrunc = Math.trunc;
const intrinsicBigIntToString = BigInt.prototype.toString;
const intrinsicString = String;
const intrinsicStringCharCodeAt = String.prototype.charCodeAt;
const intrinsicStringIncludes = String.prototype.includes;
const intrinsicStringPadEnd = String.prototype.padEnd;
const intrinsicStringPadStart = String.prototype.padStart;
const intrinsicStringSlice = String.prototype.slice;
const intrinsicHashUpdate = createHash("sha256").update;
const intrinsicHashDigest = createHash("sha256").digest;

function arrayEvery<T>(
  values: readonly T[],
  predicate: (value: T, index: number, values: readonly T[]) => boolean,
) {
  return intrinsicReflectApply(intrinsicArrayEvery, values, [
    predicate,
  ]) as boolean;
}

function arrayFilter<T, S extends T>(
  values: readonly T[],
  predicate: (value: T, index: number, values: readonly T[]) => value is S,
): S[];
function arrayFilter<T>(
  values: readonly T[],
  predicate: (value: T, index: number, values: readonly T[]) => boolean,
): T[];
function arrayFilter<T>(
  values: readonly T[],
  predicate: (value: T, index: number, values: readonly T[]) => boolean,
) {
  return intrinsicReflectApply(intrinsicArrayFilter, values, [
    predicate,
  ]) as T[];
}

function arrayIncludes<T>(values: readonly T[], expected: T) {
  return intrinsicReflectApply(intrinsicArrayIncludes, values, [
    expected,
  ]) as boolean;
}

function arrayJoin(values: readonly string[], separator: string) {
  return intrinsicReflectApply(intrinsicArrayJoin, values, [
    separator,
  ]) as string;
}

function arrayMap<T, U>(
  values: readonly T[],
  mapper: (value: T, index: number, values: readonly T[]) => U,
) {
  return intrinsicReflectApply(intrinsicArrayMap, values, [
    mapper,
  ]) as U[];
}

function arrayPop<T>(values: T[]) {
  return intrinsicReflectApply(intrinsicArrayPop, values, []) as
    | T
    | undefined;
}

function arrayPush<T>(values: T[], ...added: T[]) {
  return intrinsicReflectApply(intrinsicArrayPush, values, added) as number;
}

function arraySome<T>(
  values: readonly T[],
  predicate: (value: T, index: number, values: readonly T[]) => boolean,
) {
  return intrinsicReflectApply(intrinsicArraySome, values, [
    predicate,
  ]) as boolean;
}

function arraySort<T>(
  values: T[],
  comparator?: (first: T, second: T) => number,
) {
  intrinsicReflectApply(
    intrinsicArraySort,
    values,
    comparator ? [comparator] : [],
  );
  return values;
}

function copyArray<T>(values: readonly T[]) {
  const copied = new IntrinsicArray<T>(values.length);
  for (let index = 0; index < values.length; index += 1) {
    copied[index] = values[index];
  }
  return copied;
}

function mapGet<K, V>(map: Map<K, V>, key: K) {
  return intrinsicReflectApply(intrinsicMapGet, map, [key]) as
    | V
    | undefined;
}

function mapSet<K, V>(map: Map<K, V>, key: K, value: V) {
  intrinsicReflectApply(intrinsicMapSet, map, [key, value]);
}

function setAdd<T>(set: Set<T>, value: T) {
  intrinsicReflectApply(intrinsicSetAdd, set, [value]);
}

function setHas<T>(set: Set<T>, value: T) {
  return intrinsicReflectApply(intrinsicSetHas, set, [value]) as boolean;
}

function weakMapGet<K extends object, V>(map: WeakMap<K, V>, key: K) {
  return intrinsicReflectApply(intrinsicWeakMapGet, map, [key]) as
    | V
    | undefined;
}

function weakMapHas<K extends object, V>(map: WeakMap<K, V>, key: K) {
  return intrinsicReflectApply(intrinsicWeakMapHas, map, [key]) as boolean;
}

function weakMapSet<K extends object, V>(
  map: WeakMap<K, V>,
  key: K,
  value: V,
) {
  intrinsicReflectApply(intrinsicWeakMapSet, map, [key, value]);
}

function weakSetAdd<T extends object>(set: WeakSet<T>, value: T) {
  intrinsicReflectApply(intrinsicWeakSetAdd, set, [value]);
}

function weakSetDelete<T extends object>(set: WeakSet<T>, value: T) {
  return intrinsicReflectApply(intrinsicWeakSetDelete, set, [value]) as boolean;
}

function weakSetHas<T extends object>(set: WeakSet<T>, value: T) {
  return intrinsicReflectApply(intrinsicWeakSetHas, set, [value]) as boolean;
}

function isProxy(value: object) {
  return intrinsicReflectApply(intrinsicNodeIsProxy, nodeTypes, [
    value,
  ]) as boolean;
}

function compareCanonicalStrings(first: string, second: string) {
  if (first === second) return 0;
  return first < second ? -1 : 1;
}

function regexExec(pattern: RegExp, value: string) {
  return intrinsicReflectApply(intrinsicRegExpExec, pattern, [
    value,
  ]) as RegExpExecArray | null;
}

function stringCharCodeAt(value: string, index: number) {
  return intrinsicReflectApply(intrinsicStringCharCodeAt, value, [
    index,
  ]) as number;
}

function stringSlice(value: string, start: number, end?: number) {
  return intrinsicReflectApply(
    intrinsicStringSlice,
    value,
    end === undefined ? [start] : [start, end],
  ) as string;
}

function stringPadStart(value: string, length: number, fill: string) {
  return intrinsicReflectApply(intrinsicStringPadStart, value, [
    length,
    fill,
  ]) as string;
}

function stringPadEnd(value: string, length: number, fill: string) {
  return intrinsicReflectApply(intrinsicStringPadEnd, value, [
    length,
    fill,
  ]) as string;
}

function bigintToString(value: bigint) {
  return intrinsicReflectApply(intrinsicBigIntToString, value, []) as string;
}

function stringIncludes(value: string, expected: string) {
  return intrinsicReflectApply(intrinsicStringIncludes, value, [
    expected,
  ]) as boolean;
}

type IntrinsicDescriptorSurface = {
  target: object;
  keys: PropertyKey[];
  descriptors: PropertyDescriptor[];
};

function captureDescriptorSurface(target: object): IntrinsicDescriptorSurface {
  const keys = intrinsicReflectOwnKeys(target);
  const copiedKeys = new IntrinsicArray<PropertyKey>(keys.length);
  const descriptors = new IntrinsicArray<PropertyDescriptor>(keys.length);
  for (let index = 0; index < keys.length; index += 1) {
    copiedKeys[index] = keys[index];
    descriptors[index] =
      intrinsicObjectGetOwnPropertyDescriptor(target, keys[index])!;
  }
  return { target, keys: copiedKeys, descriptors };
}

function captureSelectedDescriptorSurface(
  target: object,
  keys: readonly PropertyKey[],
): IntrinsicDescriptorSurface {
  const copiedKeys = new IntrinsicArray<PropertyKey>(keys.length);
  const descriptors = new IntrinsicArray<PropertyDescriptor>(keys.length);
  for (let index = 0; index < keys.length; index += 1) {
    copiedKeys[index] = keys[index];
    descriptors[index] =
      intrinsicObjectGetOwnPropertyDescriptor(target, keys[index])!;
  }
  return { target, keys: copiedKeys, descriptors };
}

function captureRecursiveDescriptorSurfaces(roots: readonly object[]) {
  const surfaces: IntrinsicDescriptorSurface[] = [];
  const pending = copyArray(roots);
  const seen = new IntrinsicWeakSet<object>();
  while (pending.length > 0) {
    const current = arrayPop(pending)!;
    if (weakSetHas(seen, current)) continue;
    weakSetAdd(seen, current);
    const surface = captureDescriptorSurface(current);
    arrayPush(surfaces, surface);
    for (let index = 0; index < surface.descriptors.length; index += 1) {
      const nested = surface.descriptors[index].value;
      if (nested !== null && typeof nested === "object") {
        arrayPush(pending, nested);
      }
    }
  }
  return surfaces;
}

function sameDescriptor(
  first: PropertyDescriptor,
  second: PropertyDescriptor,
) {
  return (
    first.configurable === second.configurable &&
    first.enumerable === second.enumerable &&
    first.writable === second.writable &&
    intrinsicObjectIs(first.value, second.value) &&
    intrinsicObjectIs(first.get, second.get) &&
    intrinsicObjectIs(first.set, second.set)
  );
}

function descriptorSurfaceIntact(
  surface: IntrinsicDescriptorSurface,
  requireExactKeys: boolean,
) {
  try {
    if (requireExactKeys) {
      const currentKeys = intrinsicReflectOwnKeys(surface.target);
      if (currentKeys.length !== surface.keys.length) return false;
      for (let index = 0; index < currentKeys.length; index += 1) {
        if (!intrinsicObjectIs(currentKeys[index], surface.keys[index])) {
          return false;
        }
      }
    }
    for (let index = 0; index < surface.keys.length; index += 1) {
      const current = intrinsicObjectGetOwnPropertyDescriptor(
        surface.target,
        surface.keys[index],
      );
      if (
        current === undefined ||
        !sameDescriptor(current, surface.descriptors[index])
      ) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

const downstreamGlobalSurface = captureSelectedDescriptorSurface(
  globalThis,
  [
    "structuredClone",
    "encodeURIComponent",
    "JSON",
    "Object",
    "Function",
    "Array",
    "String",
    "Number",
    "Boolean",
    "BigInt",
    "Math",
    "Date",
    "RegExp",
    "Map",
    "Set",
    "WeakMap",
    "WeakSet",
    "Reflect",
  ],
);
const downstreamIntrinsicSurfaces = [
  captureDescriptorSurface(JSON),
  captureDescriptorSurface(Object),
  captureDescriptorSurface(Object.prototype),
  captureDescriptorSurface(
    intrinsicObjectGetOwnPropertyDescriptor(
      Object.prototype,
      "hasOwnProperty",
    )!.value as object,
  ),
  captureDescriptorSurface(Function),
  captureDescriptorSurface(Function.prototype),
  captureDescriptorSurface(Array),
  captureDescriptorSurface(Array.prototype),
  captureDescriptorSurface(String),
  captureDescriptorSurface(String.prototype),
  captureDescriptorSurface(Number),
  captureDescriptorSurface(Number.prototype),
  captureDescriptorSurface(Boolean),
  captureDescriptorSurface(Boolean.prototype),
  captureDescriptorSurface(BigInt),
  captureDescriptorSurface(BigInt.prototype),
  captureDescriptorSurface(Math),
  captureDescriptorSurface(Date),
  captureDescriptorSurface(Date.prototype),
  captureDescriptorSurface(RegExp),
  captureDescriptorSurface(RegExp.prototype),
  captureDescriptorSurface(Map),
  captureDescriptorSurface(Map.prototype),
  captureDescriptorSurface(Set),
  captureDescriptorSurface(Set.prototype),
  captureDescriptorSurface(WeakMap),
  captureDescriptorSurface(WeakMap.prototype),
  captureDescriptorSurface(WeakSet),
  captureDescriptorSurface(WeakSet.prototype),
  captureDescriptorSurface(Reflect),
  captureDescriptorSurface(nodeTypes),
  captureDescriptorSurface(
    intrinsicObjectGetPrototypeOf(createHash("sha256")) as object,
  ),
];
const downstreamSemanticSurfaces = captureRecursiveDescriptorSurfaces([
  CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_STATUSES,
  CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_STATUSES,
  CANONICAL_GOVERNED_IMPROVEMENT_COMPLETED_PROPOSAL_STATUSES,
  CANONICAL_IMPROVEMENT_BINDING_ENTRY_TYPES,
  CANONICAL_IMPROVEMENT_BINDING_LOOKUP_STATUSES,
  CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_TYPES,
  CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_CLASSES,
  CANONICAL_MODEL_IMPROVEMENT_METRICS,
  CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_NAMESPACES,
  canonicalModelImprovementPolicy,
  canonicalQualityCalibrationBuckets,
  canonicalQualityRankingKValues,
  canonicalQualityPublishabilityPolicy,
  canonicalShadowModelChangePolicy,
  canonicalScorecardComparabilityPolicy,
  CANONICAL_COUNTERFACTUAL_REASON_CODES,
]);

function downstreamIntrinsicSurfacesIntact() {
  if (!descriptorSurfaceIntact(downstreamGlobalSurface, false)) {
    return false;
  }
  for (
    let index = 0;
    index < downstreamIntrinsicSurfaces.length;
    index += 1
  ) {
    if (!descriptorSurfaceIntact(downstreamIntrinsicSurfaces[index], true)) {
      return false;
    }
  }
  for (
    let index = 0;
    index < downstreamSemanticSurfaces.length;
    index += 1
  ) {
    if (!descriptorSurfaceIntact(downstreamSemanticSurfaces[index], true)) {
      return false;
    }
  }
  return true;
}

function canonicalizeForDigest(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    if (!intrinsicNumberIsFinite(value)) {
      throw new Error("non_finite_canonical_value");
    }
    return intrinsicObjectIs(value, -0) ? 0 : value;
  }
  if (intrinsicArrayIsArray(value)) {
    const canonical = new IntrinsicArray<unknown>(value.length);
    for (let index = 0; index < value.length; index += 1) {
      canonical[index] = canonicalizeForDigest(value[index]);
    }
    return canonical;
  }
  if (typeof value === "object") {
    const observedEntries = intrinsicObjectEntries(
      value as Record<string, unknown>,
    );
    const entries: [string, unknown][] = [];
    for (let index = 0; index < observedEntries.length; index += 1) {
      const entry = observedEntries[index];
      if (entry[1] !== undefined) entries[entries.length] = entry;
    }
    arraySort(
      entries,
      ([first]: [string, unknown], [second]: [string, unknown]) =>
        compareCanonicalStrings(first, second),
    );
    const canonicalEntries: [string, unknown][] = new IntrinsicArray(
      entries.length,
    );
    for (let index = 0; index < entries.length; index += 1) {
      canonicalEntries[index] = [
        entries[index][0],
        canonicalizeForDigest(entries[index][1]),
      ];
    }
    return intrinsicObjectFromEntries(canonicalEntries);
  }
  throw new Error("unsupported_canonical_value");
}

function hardenedCanonicalDigest(value: unknown) {
  const hash = createHash("sha256");
  intrinsicReflectApply(intrinsicHashUpdate, hash, [
    intrinsicJsonStringify(canonicalizeForDigest(value)),
  ]);
  return intrinsicReflectApply(intrinsicHashDigest, hash, [
    "hex",
  ]) as string;
}

export const CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY =
  intrinsicObjectFreeze({
    policy_version: CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_VERSION,
    max_depth: 128,
    max_nodes: 131_072,
    max_keys_per_container: 4_096,
    max_array_length: 2_048,
    max_string_bytes: 65_536,
    max_total_string_bytes: 8_388_608,
  });

export const CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_DIGEST =
  hardenedCanonicalDigest(
    CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY,
  );
export const CANONICAL_EXTERNAL_SNAPSHOT_MAX_JSON_BYTES = 1_048_576;

export type CanonicalBoundedSnapshotBudgetKind =
  | "max_depth"
  | "max_nodes"
  | "max_keys"
  | "max_array_length"
  | "max_string_bytes"
  | "max_total_string_bytes";

export type CanonicalBoundedSnapshotValidationFailure = {
  validator_version: typeof CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION;
  budget_policy_version:
    typeof CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_VERSION;
  budget_policy_digest: string;
  reason: "snapshot_validation_budget_exceeded";
  budget_kind: CanonicalBoundedSnapshotBudgetKind;
  first_rejected_path: string;
  observed_depth: number;
  observed_nodes: number;
  observed_own_keys: number;
  observed_array_length: number | null;
  observed_string_bytes: number | null;
  observed_total_string_bytes: number;
  bounded_observation_digest_algorithm: "sha256_canonical_json_v1";
  bounded_observation_digest: string;
  full_snapshot_digest_computed: false;
  full_snapshot_digest: null;
};

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

export type CanonicalExternalImprovementBindingEntry = {
  entry_version: typeof CANONICAL_EXTERNAL_IMPROVEMENT_BINDING_ENTRY_VERSION;
  entry_identity: string;
  entry_type: EntryType;
  bound_identity_type: BoundIdentityType;
  bound_identity: string;
  observed_status: "matching";
  observed_binding_digest: string;
  expected_binding_digest: string;
  source_evidence_namespace:
    | "canonical_previous_binding_evidence"
    | "canonical_capture_binding_evidence";
  source_section_digest: string;
  effective_at: string;
  entry_digest_algorithm: "sha256_canonical_json_v1";
  entry_digest: string;
};

export type CanonicalExternalImprovementBindingSnapshot = {
  snapshot_version:
    typeof CANONICAL_EXTERNAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION;
  snapshot_identity: string;
  owner_authority_identity: string;
  registry_authority_identity: string;
  authority_manifest_digest: string;
  authority_root_digest: string;
  publication_sequence: number;
  publication_epoch: number;
  predecessor: CanonicalImprovementBindingSnapshot["predecessor"];
  captured_at: string;
  evidence_cutoff: string;
  effective_at: string;
  entry_inventory: CanonicalExternalImprovementBindingEntry[];
  entry_inventory_digest: string;
  snapshot_digest_algorithm: "sha256_canonical_json_v1";
  snapshot_digest: string;
} & Safety;

export type CanonicalBindingSnapshotAdmissionAuthority = {
  authority_version: typeof CANONICAL_BINDING_SNAPSHOT_AUTHORITY_VERSION;
  authority_identity: string;
  owner_boundary_identity: string;
  registry_authority_identity: string;
  frozen_manifest_digest: string;
  expected_authority_root_digest: string;
  expected_snapshot_identity: string;
  expected_snapshot_digest: string;
  expected_publication_sequence: number;
  expected_publication_epoch: number;
  expected_predecessor_digest: string | null;
  authority_digest_algorithm: "sha256_canonical_json_v1";
  authority_digest: string;
};

export type CanonicalBindingSnapshotAuthorityDependency = {
  owner_boundary_version:
    typeof CANONICAL_BINDING_SNAPSHOT_OWNER_BOUNDARY_VERSION;
  owner_boundary_identity: string;
  expected_authority_identity: string;
  expected_authority_digest: string;
  read_expected_authority: () => CanonicalBindingSnapshotAdmissionAuthority;
};

export type CanonicalBindingSnapshotSourceDependency = {
  source_contract_version: "canonical_external_binding_snapshot_source_v1";
};

export type CanonicalBindingBackedReplayRequest = {
  request_version: typeof CANONICAL_BINDING_BACKED_REPLAY_REQUEST_VERSION;
  source_namespace: "binding_backed_governed_improvement_replay";
  admission_identity: string;
  lookup_as_of: string;
  end_to_end_request: CanonicalGovernedImprovementEndToEndRequest;
};

export type CanonicalBindingSnapshotAdmissionCounters = {
  request_reads: number;
  snapshot_reads: number;
  clones: number;
  authority_reads: number;
  authority_verifications: number;
  digest_operations: number;
  admission_rebuilds: number;
  store_constructions: number;
  store_rebuilds: number;
  lookup_adapter_constructions: number;
  end_to_end_executions: number;
  end_to_end_rebuilds: number;
};

export type CanonicalBindingSnapshotAdmissionProjection = {
  projection_version:
    typeof CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_ADMISSION_VERSION;
  admission_identity: string;
  authority_identity: string;
  authority_digest: string;
  authority_root_digest: string;
  source_snapshot_identity: string;
  source_snapshot_digest: string;
  source_snapshot_projection_digest: string;
  source_snapshot: CanonicalExternalImprovementBindingSnapshot;
  ax_snapshot_version: typeof CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION;
  ax_snapshot: CanonicalImprovementBindingSnapshot;
  ax_snapshot_digest: string;
  projection_digest_algorithm: "sha256_canonical_json_v1";
  projection_digest: string;
};

export type CanonicalBindingSnapshotAdmissionResult = {
  admission_version:
    typeof CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_ADMISSION_VERSION;
  status: AdmissionStatus;
  admission_identity: string | null;
  observed_snapshot_identity: string | null;
  observed_snapshot_digest: string;
  expected_snapshot_identity: string | null;
  expected_snapshot_digest: string | null;
  authority_identity: string | null;
  authority_digest: string | null;
  authority_root_digest: string | null;
  snapshot_validator_version:
    typeof CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION;
  snapshot_budget_policy_version:
    typeof CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_VERSION;
  snapshot_budget_policy_digest: string;
  validation_failure: CanonicalBoundedSnapshotValidationFailure | null;
  projection: CanonicalBindingSnapshotAdmissionProjection | null;
  reason_codes: string[];
  admission_digest_algorithm: "sha256_canonical_json_v1";
  admission_digest: string;
} & Safety;

export type CanonicalBindingBackedReplayLineage = {
  lineage_version: "canonical_binding_backed_improvement_lineage_v1";
  request_digest: string;
  admission_identity: string | null;
  admission_digest: string;
  snapshot_identity: string | null;
  snapshot_digest: string;
  authority_identity: string | null;
  authority_digest: string | null;
  authority_root_digest: string | null;
  ax_store_version: string | null;
  ax_store_snapshot_identity: string | null;
  ax_store_snapshot_digest: string | null;
  ax_store_observation_digest: string | null;
  admission_rebuild_verified: boolean;
  store_rebuild_verified: boolean;
  end_to_end_rebuild_verified: boolean;
  end_to_end_replay_version: string | null;
  end_to_end_digest: string | null;
  proposal_status: CanonicalGovernedImprovementEndToEndResult["proposal_status"];
  lineage_digest_algorithm: "sha256_canonical_json_v1";
  lineage_digest: string;
};

export type CanonicalBindingBackedReplayResult = {
  replay_version: typeof CANONICAL_BINDING_BACKED_IMPROVEMENT_REPLAY_VERSION;
  status: AdmissionStatus;
  proposal_status: CanonicalGovernedImprovementEndToEndResult["proposal_status"];
  admission_result: CanonicalBindingSnapshotAdmissionResult;
  end_to_end_result: CanonicalGovernedImprovementEndToEndResult | null;
  lineage: CanonicalBindingBackedReplayLineage;
  reason_codes: string[];
  replay_digest_algorithm: "sha256_canonical_json_v1";
  replay_digest: string;
} & Safety;

export type CanonicalBindingSnapshotAdmissionDependencies = {
  authority_dependency: CanonicalBindingSnapshotAuthorityDependency;
  snapshot_dependency: CanonicalBindingSnapshotSourceDependency;
  capture_authority: CanonicalCompletedImprovementCaptureAuthority;
  expected_capture_authority_identity: string;
  expected_capture_authority_digest: string;
};

const recognizedAuthorities = new IntrinsicWeakSet<object>();
const recognizedSnapshotSources = new IntrinsicWeakMap<object, () => unknown>();
const recognizedJsonSnapshots = new IntrinsicWeakSet<object>();
type CanonicalBindingBackedReplayAuthority = {
  replay: (
    request: CanonicalBindingBackedReplayRequest,
  ) => CanonicalBindingBackedReplayResult;
  snapshot_request: (
    value: unknown,
  ) => CanonicalBindingBackedReplayRequest | null;
  snapshot_result: (
    value: unknown,
  ) => CanonicalBindingBackedReplayResult | null;
};
const canonicalBindingBackedReplayAuthorities = new IntrinsicWeakMap<
  object,
  CanonicalBindingBackedReplayAuthority | null
>();

function deepFreeze<T>(value: T): T {
  if (
    value &&
    typeof value === "object" &&
    !intrinsicObjectIsFrozen(value)
  ) {
    intrinsicObjectFreeze(value);
    const nestedValues = intrinsicObjectValues(
      value as Record<string, unknown>,
    );
    for (let index = 0; index < nestedValues.length; index += 1) {
      deepFreeze(nestedValues[index]);
    }
  }
  return value;
}

function deepFreezeJsonSnapshot<T extends object>(value: T): T {
  const pending: object[] = [value];
  const seen = new IntrinsicWeakSet<object>();
  while (pending.length > 0) {
    const current = arrayPop(pending)!;
    if (weakSetHas(seen, current)) continue;
    weakSetAdd(seen, current);
    const nestedValues = intrinsicObjectValues(current);
    for (let index = 0; index < nestedValues.length; index += 1) {
      const nested = nestedValues[index];
      if (nested !== null && typeof nested === "object") {
        arrayPush(pending, nested);
      }
    }
    intrinsicObjectFreeze(current);
  }
  return value;
}

type JsonSerializationFrame =
  | { kind: "token"; value: string }
  | { kind: "value"; value: unknown };

function serializeCanonicalJsonIteratively(value: unknown) {
  const output: string[] = [];
  const pending: JsonSerializationFrame[] = [
    { kind: "value", value },
  ];
  while (pending.length > 0) {
    const frame = arrayPop(pending)!;
    if (frame.kind === "token") {
      arrayPush(output, frame.value);
      continue;
    }
    const current = frame.value;
    if (current === null || typeof current !== "object") {
      const serialized = intrinsicJsonStringify(current);
      if (serialized === undefined) {
        throw new Error("canonical_binding_snapshot_json_source_invalid");
      }
      arrayPush(output, serialized);
      continue;
    }
    if (intrinsicArrayIsArray(current)) {
      arrayPush(pending, { kind: "token", value: "]" });
      for (let index = current.length - 1; index >= 0; index -= 1) {
        arrayPush(pending, { kind: "value", value: current[index] });
        if (index > 0) arrayPush(pending, { kind: "token", value: "," });
      }
      arrayPush(pending, { kind: "token", value: "[" });
      continue;
    }
    const keys = arraySort(
      intrinsicObjectKeys(current),
      compareCanonicalStrings,
    );
    arrayPush(pending, { kind: "token", value: "}" });
    for (let index = keys.length - 1; index >= 0; index -= 1) {
      const key = keys[index];
      arrayPush(pending, {
        kind: "value",
        value: (current as Record<string, unknown>)[key],
      });
      arrayPush(pending, { kind: "token", value: ":" });
      arrayPush(pending, {
        kind: "token",
        value: intrinsicJsonStringify(key),
      });
      if (index > 0) arrayPush(pending, { kind: "token", value: "," });
    }
    arrayPush(pending, { kind: "token", value: "{" });
  }
  return arrayJoin(output, "");
}

function uniqueSorted(values: string[]) {
  const unique: string[] = [];
  const observed = new IntrinsicSet<string>();
  for (let index = 0; index < values.length; index += 1) {
    if (setHas(observed, values[index])) continue;
    setAdd(observed, values[index]);
    arrayPush(unique, values[index]);
  }
  return arraySort(unique, compareCanonicalStrings);
}

function exact(first: unknown, second: unknown) {
  return digest(first) === digest(second);
}

function digest(
  value: unknown,
  counters?: CanonicalBindingSnapshotAdmissionCounters,
) {
  if (counters) counters.digest_operations += 1;
  return hardenedCanonicalDigest(value);
}

function emptyCounters(): CanonicalBindingSnapshotAdmissionCounters {
  return {
    request_reads: 0,
    snapshot_reads: 0,
    clones: 0,
    authority_reads: 0,
    authority_verifications: 0,
    digest_operations: 0,
    admission_rebuilds: 0,
    store_constructions: 0,
    store_rebuilds: 0,
    lookup_adapter_constructions: 0,
    end_to_end_executions: 0,
    end_to_end_rebuilds: 0,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (
    value === null ||
    typeof value !== "object" ||
    intrinsicArrayIsArray(value) ||
    isProxy(value)
  ) {
    return false;
  }
  try {
    return (
      intrinsicObjectGetPrototypeOf(value) === intrinsicObjectPrototype
    );
  } catch {
    return false;
  }
}

function exactKeys(value: Record<string, unknown>, expected: string[]) {
  try {
    const actual = arraySort(
      intrinsicReflectOwnKeys(value),
      (first, second) =>
        compareCanonicalStrings(
          intrinsicString(first),
          intrinsicString(second),
        ),
    );
    const sortedExpected = arraySort(
      copyArray(expected),
      compareCanonicalStrings,
    );
    return (
      actual.length === sortedExpected.length &&
      arrayEvery(
        actual,
        (key, index) =>
          typeof key === "string" && key === sortedExpected[index],
      ) &&
      arrayEvery(actual, (key) => {
        const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
          value,
          key,
        );
        return !!(
          descriptor &&
            "value" in descriptor &&
            descriptor.enumerable
        );
      })
    );
  } catch {
    return false;
  }
}

function ownDataValue(value: object, key: PropertyKey) {
  try {
    const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
      value,
      key,
    );
    return descriptor &&
      "value" in descriptor &&
      descriptor.enumerable
      ? { present: true as const, value: descriptor.value }
      : { present: false as const, value: undefined };
  } catch {
    return { present: false as const, value: undefined };
  }
}

function validIdentity(value: unknown): value is string {
  if (typeof value !== "string" || value.length < 3 || value.length > 256) {
    return false;
  }
  for (let index = 0; index < value.length; index += 1) {
    const code = stringCharCodeAt(value, index);
    const alphaNumeric =
      (code >= 48 && code <= 57) ||
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122);
    if (alphaNumeric) continue;
    if (
      index > 0 &&
      (code === 46 ||
        code === 47 ||
        code === 58 ||
        code === 95 ||
        code === 45)
    ) {
      continue;
    }
    return false;
  }
  return true;
}

function validFullSha(value: unknown): value is string {
  if (typeof value !== "string" || value.length !== 64) return false;
  for (let index = 0; index < value.length; index += 1) {
    const code = stringCharCodeAt(value, index);
    if ((code >= 48 && code <= 57) || (code >= 97 && code <= 102)) {
      continue;
    }
    return false;
  }
  return true;
}

function validPositiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    intrinsicNumberIsSafeInteger(value) &&
    value > 0
  );
}

function parseExplicitInstant(value: string) {
  const match = regexExec(explicitInstantPattern, value);
  if (!match) return null;
  const year = intrinsicNumber(match[1]);
  const month = intrinsicNumber(match[2]);
  const day = intrinsicNumber(match[3]);
  const hour = intrinsicNumber(match[4]);
  const minute = intrinsicNumber(match[5]);
  const second = intrinsicNumber(match[6]);
  const fraction = match[7] ?? "";
  const zone = match[8];
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return null;
  }
  const localMilliseconds = intrinsicReflectApply(
    intrinsicDateUtc,
    IntrinsicDate,
    [year, month - 1, day, hour, minute, second],
  ) as number;
  const check = new IntrinsicDate(localMilliseconds);
  const datePart = (method: (this: Date) => number) =>
    intrinsicReflectApply(method, check, []) as number;
  if (
    datePart(intrinsicDateGetUTCFullYear) !== year ||
    datePart(intrinsicDateGetUTCMonth) !== month - 1 ||
    datePart(intrinsicDateGetUTCDate) !== day ||
    datePart(intrinsicDateGetUTCHours) !== hour ||
    datePart(intrinsicDateGetUTCMinutes) !== minute ||
    datePart(intrinsicDateGetUTCSeconds) !== second
  ) {
    return null;
  }
  let offsetSeconds = 0;
  if (zone !== "Z") {
    const sign = zone[0] === "+" ? 1 : -1;
    const offsetHour = intrinsicNumber(stringSlice(zone, 1, 3));
    const offsetMinute = intrinsicNumber(stringSlice(zone, 4, 6));
    if (offsetHour > 23 || offsetMinute > 59) return null;
    offsetSeconds = sign * (offsetHour * 3_600 + offsetMinute * 60);
  }
  const wholeSeconds = intrinsicBigInt(
    intrinsicMathTrunc(localMilliseconds / 1_000) - offsetSeconds,
  );
  const fractionalNanoseconds = intrinsicBigInt(
    stringPadEnd(fraction, 9, "0") || "0",
  );
  return {
    epoch_nanoseconds:
      wholeSeconds * intrinsicBigInt(1_000_000_000) +
      fractionalNanoseconds,
  };
}

function canonicalInstant(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = parseExplicitInstant(value);
  if (!parsed) return null;
  const billion = intrinsicBigInt(1_000_000_000);
  let seconds = parsed.epoch_nanoseconds / billion;
  let fraction = parsed.epoch_nanoseconds % billion;
  if (fraction < intrinsicBigInt(0)) {
    seconds -= intrinsicBigInt(1);
    fraction += billion;
  }
  const milliseconds = intrinsicNumber(seconds * intrinsicBigInt(1_000));
  if (!intrinsicNumberIsSafeInteger(milliseconds)) return null;
  const iso = intrinsicReflectApply(
    intrinsicDateToISOString,
    new IntrinsicDate(milliseconds),
    [],
  ) as string;
  const fractionText = stringPadStart(bigintToString(fraction), 9, "0");
  return {
    canonical: `${stringSlice(iso, 0, 19)}.${fractionText}Z`,
    epoch_nanoseconds: parsed.epoch_nanoseconds,
  };
}

type BoundedTraversalStats = {
  observed_depth: number;
  observed_nodes: number;
  observed_own_keys: number;
  observed_array_length: number | null;
  observed_string_bytes: number | null;
  observed_total_string_bytes: number;
};

type BoundedValidationResult =
  | ({
      status: "valid";
      reason_codes: [];
    } & BoundedTraversalStats)
  | ({
      status: "invalid";
      reason_codes: string[];
      first_rejected_path: string;
    } & BoundedTraversalStats)
  | ({
      status: "budget_exceeded";
      reason_codes: ["snapshot_validation_budget_exceeded"];
      budget_kind: CanonicalBoundedSnapshotBudgetKind;
      first_rejected_path: string;
    } & BoundedTraversalStats);

type TraversalFrame =
  | {
      kind: "enter";
      value: unknown;
      path: string;
      depth: number;
    }
  | {
      kind: "exit";
      value: object;
    };

type BoundedUtf8ByteLength =
  | { exceeded: false; bytes: number }
  | { exceeded: true; bytes: number };

function boundedUtf8ByteLength(
  value: string,
  maximumBytes: number,
): BoundedUtf8ByteLength {
  let bytes = 0;
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = stringCharCodeAt(value, index);
    if (codeUnit <= 0x7f) {
      bytes += 1;
    } else if (codeUnit <= 0x7ff) {
      bytes += 2;
    } else if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const followingCodeUnit = stringCharCodeAt(value, index + 1);
      if (
        followingCodeUnit >= 0xdc00 &&
        followingCodeUnit <= 0xdfff
      ) {
        bytes += 4;
        index += 1;
      } else {
        bytes += 3;
      }
    } else {
      bytes += 3;
    }
    if (bytes > maximumBytes) {
      return { exceeded: true, bytes };
    }
  }
  return { exceeded: false, bytes };
}

function traversalStats(input: {
  observedDepth: number;
  observedNodes: number;
  observedOwnKeys?: number;
  observedArrayLength?: number | null;
  observedStringBytes?: number | null;
  observedTotalStringBytes: number;
}): BoundedTraversalStats {
  return {
    observed_depth: input.observedDepth,
    observed_nodes: input.observedNodes,
    observed_own_keys: input.observedOwnKeys ?? 0,
    observed_array_length: input.observedArrayLength ?? null,
    observed_string_bytes: input.observedStringBytes ?? null,
    observed_total_string_bytes: input.observedTotalStringBytes,
  };
}

function boundedChildPath(
  parentPath: string,
  key: string,
  sortedKeyIndex: number,
  keyUtf8Bytes: number,
) {
  if (keyUtf8Bytes <= 128) return `${parentPath}.${key}`;
  return `${parentPath}.[key_index:${sortedKeyIndex};utf8_bytes:${keyUtf8Bytes}]`;
}

export function validateCanonicalBoundedSnapshotPayload(
  value: unknown,
): BoundedValidationResult {
  const policy = CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY;
  const ancestors = new IntrinsicWeakSet<object>();
  const stack: TraversalFrame[] = [
    { kind: "enter", value, path: "$", depth: 0 },
  ];
  let observedDepth = 0;
  let observedNodes = 0;
  let observedTotalStringBytes = 0;

  const invalid = (
    reason: string,
    path: string,
    details: Partial<BoundedTraversalStats> = {},
  ): BoundedValidationResult => ({
    status: "invalid",
    reason_codes: [reason],
    first_rejected_path: path,
    ...traversalStats({
      observedDepth,
      observedNodes,
      observedTotalStringBytes,
      observedOwnKeys: details.observed_own_keys,
      observedArrayLength: details.observed_array_length,
      observedStringBytes: details.observed_string_bytes,
    }),
  });
  const exceeded = (
    budgetKind: CanonicalBoundedSnapshotBudgetKind,
    path: string,
    details: Partial<BoundedTraversalStats> = {},
  ): BoundedValidationResult => ({
    status: "budget_exceeded",
    reason_codes: ["snapshot_validation_budget_exceeded"],
    budget_kind: budgetKind,
    first_rejected_path: path,
    ...traversalStats({
      observedDepth,
      observedNodes,
      observedTotalStringBytes,
      observedOwnKeys: details.observed_own_keys,
      observedArrayLength: details.observed_array_length,
      observedStringBytes: details.observed_string_bytes,
    }),
  });

  while (stack.length > 0) {
    const frame = arrayPop(stack)!;
    if (frame.kind === "exit") {
      weakSetDelete(ancestors, frame.value);
      continue;
    }
    observedNodes += 1;
    observedDepth = intrinsicMathMax(observedDepth, frame.depth);
    if (frame.depth > policy.max_depth) {
      return exceeded("max_depth", frame.path);
    }
    if (observedNodes > policy.max_nodes) {
      return exceeded("max_nodes", frame.path);
    }
    const current = frame.value;
    if (
      current === null ||
      typeof current === "boolean" ||
      (typeof current === "number" && intrinsicNumberIsFinite(current))
    ) {
      continue;
    }
    if (typeof current === "string") {
      const remainingTotalBytes =
        policy.max_total_string_bytes - observedTotalStringBytes;
      const activeLimit = intrinsicMathMin(
        policy.max_string_bytes,
        remainingTotalBytes,
      );
      const measured = boundedUtf8ByteLength(current, activeLimit);
      observedTotalStringBytes += measured.bytes;
      if (measured.exceeded) {
        return exceeded(
          activeLimit === policy.max_string_bytes
            ? "max_string_bytes"
            : "max_total_string_bytes",
          frame.path,
          { observed_string_bytes: measured.bytes },
        );
      }
      continue;
    }
    if (typeof current !== "object") {
      return invalid("snapshot_payload_value_unsupported", frame.path);
    }

    const object = current as object;
    if (isProxy(object)) {
      return invalid(
        `snapshot_payload_proxy_forbidden:${frame.path}`,
        frame.path,
      );
    }
    if (weakSetHas(ancestors, object)) {
      return invalid(`snapshot_payload_cycle:${frame.path}`, frame.path);
    }

    let array: boolean;
    let prototype: object | null;
    try {
      array = intrinsicArrayIsArray(current);
      prototype = intrinsicObjectGetPrototypeOf(object);
    } catch {
      return invalid(
        "snapshot_payload_introspection_failed",
        frame.path,
      );
    }
    if (
      (array && prototype !== intrinsicArrayPrototype) ||
      (!array &&
        prototype !== intrinsicObjectPrototype &&
        prototype !== null)
    ) {
      return invalid(
        `snapshot_payload_prototype_forbidden:${frame.path}`,
        frame.path,
      );
    }
    let arrayLength: number | null = null;
    if (array) {
      let lengthDescriptor: PropertyDescriptor | undefined;
      try {
        lengthDescriptor = intrinsicObjectGetOwnPropertyDescriptor(
          object,
          "length",
        );
      } catch {
        return invalid(
          "snapshot_payload_introspection_failed",
          frame.path,
        );
      }
      if (
        !lengthDescriptor ||
        !("value" in lengthDescriptor) ||
        !intrinsicNumberIsSafeInteger(lengthDescriptor.value) ||
        lengthDescriptor.value < 0
      ) {
        return invalid(
          "snapshot_payload_array_length_invalid",
          frame.path,
        );
      }
      const validatedArrayLength = lengthDescriptor.value as number;
      arrayLength = validatedArrayLength;
      if (validatedArrayLength > policy.max_array_length) {
        return exceeded("max_array_length", frame.path, {
          observed_array_length: validatedArrayLength,
          observed_own_keys: 0,
        });
      }
    }

    const enumerableStringKeys: string[] = [];
    const boundedKeyBytes = new IntrinsicMap<string, number>();
    const containerStartingStringBytes = observedTotalStringBytes;
    let enumerableKeyBytes = 0;
    let oversizedKeyObserved = false;
    try {
      for (const key in object) {
        if (!intrinsicObjectHasOwn(object, key)) continue;
        const observedEnumerableKeys = enumerableStringKeys.length + 1;
        arrayPush(enumerableStringKeys, key);
        if (
          observedEnumerableKeys > policy.max_keys_per_container
        ) {
          observedTotalStringBytes = containerStartingStringBytes;
          return exceeded("max_keys", frame.path, {
            observed_array_length: arrayLength,
            observed_own_keys: observedEnumerableKeys,
          });
        }
        const measured = boundedUtf8ByteLength(
          key,
          policy.max_string_bytes,
        );
        if (measured.exceeded) {
          oversizedKeyObserved = true;
          continue;
        }
        enumerableKeyBytes += measured.bytes;
        mapSet(boundedKeyBytes, key, measured.bytes);
      }
    } catch {
      return invalid(
        "snapshot_payload_introspection_failed",
        frame.path,
        { observed_array_length: arrayLength },
      );
    }
    if (oversizedKeyObserved) {
      observedTotalStringBytes =
        containerStartingStringBytes + policy.max_string_bytes + 1;
      return exceeded("max_string_bytes", frame.path, {
        observed_array_length: arrayLength,
        observed_own_keys: 0,
        observed_string_bytes: policy.max_string_bytes + 1,
      });
    }
    if (
      containerStartingStringBytes + enumerableKeyBytes >
      policy.max_total_string_bytes
    ) {
      observedTotalStringBytes = policy.max_total_string_bytes + 1;
      return exceeded("max_total_string_bytes", frame.path, {
        observed_array_length: arrayLength,
        observed_own_keys: 0,
        observed_string_bytes: null,
      });
    }
    observedTotalStringBytes += enumerableKeyBytes;

    let ownKeys: (string | symbol)[];
    try {
      ownKeys = intrinsicReflectOwnKeys(object);
    } catch {
      return invalid(
        "snapshot_payload_introspection_failed",
        frame.path,
        { observed_array_length: arrayLength },
      );
    }
    const canonicalArrayLength = arrayLength;
    if (canonicalArrayLength !== null) {
      let canonicalArrayShape =
        ownKeys.length === canonicalArrayLength + 1;
      for (
        let index = 0;
        canonicalArrayShape && index < canonicalArrayLength;
        index += 1
      ) {
        canonicalArrayShape = ownKeys[index] === intrinsicString(index);
      }
      canonicalArrayShape =
        canonicalArrayShape &&
        ownKeys[canonicalArrayLength] === "length";
      if (!canonicalArrayShape) {
        return invalid(
          `snapshot_payload_array_shape_invalid:${frame.path}`,
          frame.path,
          {
            observed_array_length: arrayLength,
            observed_own_keys: ownKeys.length,
          },
        );
      }
    }
    if (ownKeys.length > policy.max_keys_per_container) {
      return exceeded("max_keys", frame.path, {
        observed_array_length: arrayLength,
        observed_own_keys: ownKeys.length,
      });
    }
    if (arraySome(ownKeys, (key) => typeof key === "symbol")) {
      return invalid(
        `snapshot_payload_symbol_key_forbidden:${frame.path}`,
        frame.path,
        {
          observed_array_length: arrayLength,
          observed_own_keys: ownKeys.length,
        },
      );
    }
    if (
      arrayLength === null &&
      ownKeys.length !== enumerableStringKeys.length
    ) {
      return invalid(
        `snapshot_payload_descriptor_invalid:${frame.path}`,
        frame.path,
        { observed_own_keys: ownKeys.length },
      );
    }

    if (arrayLength !== null) {
      const arrayLengthKeyBytes = 6;
      observedTotalStringBytes += arrayLengthKeyBytes;
      if (
        observedTotalStringBytes > policy.max_total_string_bytes
      ) {
        return exceeded("max_total_string_bytes", frame.path, {
          observed_array_length: arrayLength,
          observed_own_keys: ownKeys.length,
          observed_string_bytes: arrayLengthKeyBytes,
        });
      }
      mapSet(boundedKeyBytes, "length", arrayLengthKeyBytes);
    }

    const stringKeys = copyArray(enumerableStringKeys);
    if (arrayLength !== null) arrayPush(stringKeys, "length");
    arraySort(stringKeys, compareCanonicalStrings);
    const keyPaths = new IntrinsicMap<string, string>();
    for (let index = 0; index < stringKeys.length; index += 1) {
      const key = stringKeys[index];
      mapSet(
        keyPaths,
        key,
        boundedChildPath(
          frame.path,
          key,
          index,
          mapGet(boundedKeyBytes, key) ?? 0,
        ),
      );
    }

    const descriptors: {
      key: string;
      path: string;
      descriptor: PropertyDescriptor;
    }[] = [];
    try {
      for (let index = 0; index < stringKeys.length; index += 1) {
        const key = stringKeys[index];
        const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
          object,
          key,
        );
        if (!descriptor) {
          return invalid(
            "snapshot_payload_descriptor_missing",
            mapGet(keyPaths, key) ?? frame.path,
          );
        }
        arrayPush(descriptors, {
          key,
          path: mapGet(keyPaths, key) ?? frame.path,
          descriptor,
        });
      }
    } catch {
      return invalid(
        "snapshot_payload_introspection_failed",
        frame.path,
        {
          observed_array_length: arrayLength,
          observed_own_keys: ownKeys.length,
        },
      );
    }
    for (let index = 0; index < descriptors.length; index += 1) {
      const { path, descriptor } = descriptors[index];
      if ("get" in descriptor || "set" in descriptor) {
        return invalid(
          `snapshot_payload_accessor_forbidden:${path}`,
          path,
        );
      }
      const isArrayLength =
        array && path === mapGet(keyPaths, "length");
      if (
        (!isArrayLength && !descriptor.enumerable) ||
        (isArrayLength && descriptor.enumerable)
      ) {
        return invalid(
          `snapshot_payload_descriptor_invalid:${path}`,
          path,
        );
      }
    }

    weakSetAdd(ancestors, object);
    arrayPush(stack, { kind: "exit", value: object });
    for (let index = descriptors.length - 1; index >= 0; index -= 1) {
      const { path, descriptor } = descriptors[index];
      if (!("value" in descriptor)) continue;
      arrayPush(stack, {
        kind: "enter",
        value: descriptor.value,
        path,
        depth: frame.depth + 1,
      });
    }
  }

  return {
    status: "valid",
    reason_codes: [],
    ...traversalStats({
      observedDepth,
      observedNodes,
      observedTotalStringBytes,
    }),
  };
}

export function createCanonicalBindingSnapshotJsonSource(
  snapshotJson: string,
): CanonicalBindingSnapshotSourceDependency {
  if (typeof snapshotJson !== "string") {
    throw new Error("canonical_binding_snapshot_json_source_invalid");
  }
  const rawBytes = boundedUtf8ByteLength(
    snapshotJson,
    CANONICAL_EXTERNAL_SNAPSHOT_MAX_JSON_BYTES,
  );
  if (rawBytes.exceeded) {
    throw new Error("canonical_binding_snapshot_json_source_too_large");
  }
  let snapshot: unknown;
  try {
    snapshot = intrinsicJsonParse(snapshotJson) as unknown;
  } catch {
    throw new Error("canonical_binding_snapshot_json_source_invalid");
  }
  if (
    snapshot === null ||
    typeof snapshot !== "object" ||
    intrinsicArrayIsArray(snapshot)
  ) {
    throw new Error("canonical_binding_snapshot_json_source_invalid");
  }
  if (serializeCanonicalJsonIteratively(snapshot) !== snapshotJson) {
    throw new Error("canonical_binding_snapshot_json_source_noncanonical");
  }
  const frozenSnapshot = deepFreezeJsonSnapshot(snapshot);
  weakSetAdd(recognizedJsonSnapshots, frozenSnapshot);
  const source = intrinsicObjectFreeze({
    source_contract_version:
      "canonical_external_binding_snapshot_source_v1" as const,
  });
  weakMapSet(recognizedSnapshotSources, source, () => frozenSnapshot);
  return source;
}

function plainDataReasons(value: unknown) {
  return validateCanonicalBoundedSnapshotPayload(value).reason_codes;
}

function forensicObservedDigest(
  value: unknown,
  plainReasons: string[],
  counters: CanonicalBindingSnapshotAdmissionCounters,
) {
  if (plainReasons.length === 0) return digest(value, counters);
  return digest(
    {
      forensic_projection_version:
        "canonical_binding_admission_forensic_projection_v1",
      value_type: typeof value,
      reason_codes: plainReasons,
    },
    counters,
  );
}

function observedSnapshotIdentity(value: unknown) {
  let descriptor: PropertyDescriptor | undefined;
  try {
    if (
      value === null ||
      typeof value !== "object" ||
      intrinsicArrayIsArray(value)
    ) {
      return null;
    }
    descriptor = intrinsicObjectGetOwnPropertyDescriptor(
      value,
      "snapshot_identity",
    );
  } catch {
    return null;
  }
  return descriptor &&
    "value" in descriptor &&
    typeof descriptor.value === "string"
    ? descriptor.value
    : null;
}

const entryKeys = arraySort([
  "bound_identity",
  "bound_identity_type",
  "effective_at",
  "entry_digest",
  "entry_digest_algorithm",
  "entry_identity",
  "entry_type",
  "entry_version",
  "expected_binding_digest",
  "observed_binding_digest",
  "observed_status",
  "source_evidence_namespace",
  "source_section_digest",
]);

const snapshotKeys = intrinsicObjectKeys(safety);
arrayPush(snapshotKeys,
  "authority_manifest_digest",
  "authority_root_digest",
  "captured_at",
  "effective_at",
  "entry_inventory",
  "entry_inventory_digest",
  "evidence_cutoff",
  "owner_authority_identity",
  "predecessor",
  "publication_epoch",
  "publication_sequence",
  "registry_authority_identity",
  "snapshot_digest",
  "snapshot_digest_algorithm",
  "snapshot_identity",
  "snapshot_version",
);
arraySort(snapshotKeys, compareCanonicalStrings);

const authorityKeys = arraySort([
  "authority_digest",
  "authority_digest_algorithm",
  "authority_identity",
  "authority_version",
  "expected_authority_root_digest",
  "expected_predecessor_digest",
  "expected_publication_epoch",
  "expected_publication_sequence",
  "expected_snapshot_digest",
  "expected_snapshot_identity",
  "frozen_manifest_digest",
  "owner_boundary_identity",
  "registry_authority_identity",
]);

const requestKeys = arraySort([
  "admission_identity",
  "end_to_end_request",
  "lookup_as_of",
  "request_version",
  "source_namespace",
]);

const captureAuthorityKeys = arraySort([
  "authority_digest",
  "authority_digest_algorithm",
  "authority_identity",
  "authority_version",
  "proposal_registry_authority_identity",
  "proposal_registry_manifest_digest",
  "proposal_registry_root_digest",
  "trust_boundary",
  "upstream_verifier_version",
]);

function captureMethod(
  value: unknown,
  expectedKeys: string[],
  key: string,
) {
  if (!isRecord(value) || !exactKeys(value, expectedKeys)) return null;
  const method = ownDataValue(value, key);
  if (!method.present || typeof method.value !== "function") return null;
  return (...args: unknown[]) =>
    intrinsicReflectApply(method.value, undefined, args);
}

function snapshotRuntimeValue<T>(value: unknown): T | null {
  try {
    if (validateCanonicalBoundedSnapshotPayload(value).status !== "valid") {
      return null;
    }
    const snapshot = intrinsicStructuredClone(value);
    return validateCanonicalBoundedSnapshotPayload(snapshot).status ===
      "valid"
      ? (snapshot as T)
      : null;
  } catch {
    return null;
  }
}

function hasCanonicalRuntimeSurface(
  value: unknown,
  seen: readonly object[] = [],
): boolean {
  if (
    value === undefined ||
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") {
    return intrinsicNumberIsFinite(value);
  }
  if (
    typeof value !== "object" ||
    isProxy(value) ||
    arrayIncludes(seen, value)
  ) {
    return false;
  }
  const nextSeen = copyArray(seen);
  arrayPush(nextSeen, value);
  try {
    if (intrinsicArrayIsArray(value)) {
      const keys = intrinsicReflectOwnKeys(value);
      const expected = intrinsicArrayFrom(
        { length: value.length },
        (_, index) => intrinsicString(index),
      );
      arrayPush(expected, "length");
      if (
        intrinsicObjectGetPrototypeOf(value) !== intrinsicArrayPrototype ||
        keys.length !== expected.length ||
        arraySome(keys, (key, index) => key !== expected[index])
      ) {
        return false;
      }
      return arrayEvery(
        intrinsicArrayFrom(
          { length: value.length },
          (_, index) => index,
        ),
        (index) => {
          const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
            value,
            intrinsicString(index),
          );
          return !!(
            descriptor &&
              "value" in descriptor &&
              descriptor.enumerable &&
              hasCanonicalRuntimeSurface(descriptor.value, nextSeen)
          );
        },
      );
    }
    if (
      intrinsicObjectGetPrototypeOf(value) !== intrinsicObjectPrototype
    ) {
      return false;
    }
    return arrayEvery(intrinsicReflectOwnKeys(value), (key) => {
      if (typeof key !== "string") return false;
      const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
        value,
        key,
      );
      return !!(
        descriptor &&
          "value" in descriptor &&
          descriptor.enumerable &&
          hasCanonicalRuntimeSurface(descriptor.value, nextSeen)
      );
    });
  } catch {
    return false;
  }
}

function snapshotDependencies(
  value: unknown,
): CanonicalBindingSnapshotAdmissionDependencies | null {
  try {
    if (
      !isRecord(value) ||
      !exactKeys(value, [
        "authority_dependency",
        "capture_authority",
        "expected_capture_authority_digest",
        "expected_capture_authority_identity",
        "snapshot_dependency",
      ])
    ) {
      return null;
    }
    const authorityDependency = ownDataValue(
      value,
      "authority_dependency",
    );
    const snapshotDependency = ownDataValue(
      value,
      "snapshot_dependency",
    );
    const captureAuthority = ownDataValue(value, "capture_authority");
    const expectedCaptureIdentity = ownDataValue(
      value,
      "expected_capture_authority_identity",
    );
    const expectedCaptureDigest = ownDataValue(
      value,
      "expected_capture_authority_digest",
    );
    if (
      !authorityDependency.present ||
      !snapshotDependency.present ||
      !captureAuthority.present ||
      !expectedCaptureIdentity.present ||
      !expectedCaptureDigest.present ||
      !isRecord(authorityDependency.value) ||
      !exactKeys(authorityDependency.value, [
        "expected_authority_digest",
        "expected_authority_identity",
        "owner_boundary_identity",
        "owner_boundary_version",
        "read_expected_authority",
      ]) ||
      !isRecord(snapshotDependency.value) ||
      !weakMapHas(recognizedSnapshotSources, snapshotDependency.value) ||
      authorityDependency.value.owner_boundary_version !==
        CANONICAL_BINDING_SNAPSHOT_OWNER_BOUNDARY_VERSION ||
      !validIdentity(
        authorityDependency.value.owner_boundary_identity,
      ) ||
      !validIdentity(
        authorityDependency.value.expected_authority_identity,
      ) ||
      !validFullSha(
        authorityDependency.value.expected_authority_digest,
      ) ||
      !validIdentity(expectedCaptureIdentity.value) ||
      !validFullSha(expectedCaptureDigest.value) ||
      !isRecord(captureAuthority.value) ||
      !exactKeys(captureAuthority.value, captureAuthorityKeys) ||
      !hasCanonicalRuntimeSurface(captureAuthority.value) ||
      captureAuthority.value.authority_version !==
        CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_AUTHORITY_VERSION ||
      captureAuthority.value.authority_digest_algorithm !==
        "sha256_canonical_json_v1" ||
      captureAuthority.value.authority_identity !==
        expectedCaptureIdentity.value ||
      captureAuthority.value.authority_digest !==
        expectedCaptureDigest.value ||
      !validIdentity(captureAuthority.value.authority_identity) ||
      !validIdentity(
        captureAuthority.value.proposal_registry_authority_identity,
      ) ||
      !validFullSha(
        captureAuthority.value.proposal_registry_manifest_digest,
      ) ||
      !validFullSha(
        captureAuthority.value.proposal_registry_root_digest,
      ) ||
      !validFullSha(captureAuthority.value.authority_digest)
    ) {
      return null;
    }
    const readAuthority = captureMethod(
      authorityDependency.value,
      [
        "expected_authority_digest",
        "expected_authority_identity",
        "owner_boundary_identity",
        "owner_boundary_version",
        "read_expected_authority",
      ],
      "read_expected_authority",
    );
    const readSnapshot = weakMapGet(
      recognizedSnapshotSources,
      snapshotDependency.value,
    );
    if (!readAuthority || !readSnapshot) return null;
    const capturePayload = intrinsicStructuredClone(
      captureAuthority.value,
    );
    delete (
      capturePayload as Partial<CanonicalCompletedImprovementCaptureAuthority>
    ).authority_digest;
    if (
      hardenedCanonicalDigest(capturePayload) !==
      expectedCaptureDigest.value
    ) {
      return null;
    }
    const captureAuthorityRecognition =
      createCanonicalCompletedImprovementCaptureHarness({
        enabled: true,
        kill_switch_engaged: false,
        authority:
          captureAuthority.value as CanonicalCompletedImprovementCaptureAuthority,
        previous_binding_lookup: {
          lookup_proposal_binding: () => null,
          lookup_experiment_binding: () => null,
        },
        capture_binding_lookup: {
          lookup_capture_binding: () => null,
        },
      });
    if (captureAuthorityRecognition.status !== "ready") return null;
    return {
      authority_dependency: {
        owner_boundary_version:
          CANONICAL_BINDING_SNAPSHOT_OWNER_BOUNDARY_VERSION,
        owner_boundary_identity:
          authorityDependency.value.owner_boundary_identity as string,
        expected_authority_identity:
          authorityDependency.value.expected_authority_identity as string,
        expected_authority_digest:
          authorityDependency.value.expected_authority_digest as string,
        read_expected_authority:
          readAuthority as () => CanonicalBindingSnapshotAdmissionAuthority,
      },
      snapshot_dependency:
        snapshotDependency.value as CanonicalBindingSnapshotSourceDependency,
      capture_authority:
        captureAuthority.value as CanonicalCompletedImprovementCaptureAuthority,
      expected_capture_authority_identity:
        expectedCaptureIdentity.value,
      expected_capture_authority_digest: expectedCaptureDigest.value,
    };
  } catch {
    return null;
  }
}

function entryIdentity(input: {
  entry_type: EntryType;
  bound_identity_type: BoundIdentityType;
  bound_identity: string;
}) {
  return `admission-entry:${input.entry_type}:${input.bound_identity_type}:${input.bound_identity}`;
}

function entryPayload(
  entry: Omit<CanonicalExternalImprovementBindingEntry, "entry_digest">,
) {
  return entry;
}

export function createCanonicalExternalImprovementBindingEntry(input: {
  entry_type: EntryType;
  bound_identity_type: BoundIdentityType;
  bound_identity: string;
  observed_binding_digest: string;
  expected_binding_digest: string;
  source_evidence_namespace:
    | "canonical_previous_binding_evidence"
    | "canonical_capture_binding_evidence";
  source_section_digest: string;
  effective_at: string;
}): CanonicalExternalImprovementBindingEntry {
  if (
    !isRecord(input) ||
    !exactKeys(input, [
      "bound_identity",
      "bound_identity_type",
      "effective_at",
      "entry_type",
      "expected_binding_digest",
      "observed_binding_digest",
      "source_evidence_namespace",
      "source_section_digest",
    ]) ||
    validateCanonicalBoundedSnapshotPayload(input).status !== "valid"
  ) {
    throw new Error("canonical_external_binding_entry_invalid");
  }
  const expectedIdentityTypes =
    input.entry_type === "capture_binding"
      ? ["capture"]
      : ["proposal", "experiment"];
  const instant = canonicalInstant(input.effective_at);
  if (
    (input.entry_type !== "previous_binding" &&
      input.entry_type !== "capture_binding") ||
    !arrayIncludes(expectedIdentityTypes, input.bound_identity_type) ||
    !validIdentity(input.bound_identity) ||
    !validFullSha(input.observed_binding_digest) ||
    !validFullSha(input.expected_binding_digest) ||
    input.observed_binding_digest !== input.expected_binding_digest ||
    !validFullSha(input.source_section_digest) ||
    !instant ||
    (input.entry_type === "capture_binding" &&
      input.source_evidence_namespace !==
        "canonical_capture_binding_evidence") ||
    (input.entry_type === "previous_binding" &&
      input.source_evidence_namespace !==
        "canonical_previous_binding_evidence")
  ) {
    throw new Error("canonical_external_binding_entry_invalid");
  }
  const payload = {
    entry_version: CANONICAL_EXTERNAL_IMPROVEMENT_BINDING_ENTRY_VERSION,
    entry_identity: entryIdentity(input),
    entry_type: input.entry_type,
    bound_identity_type: input.bound_identity_type,
    bound_identity: input.bound_identity,
    observed_status: "matching" as const,
    observed_binding_digest: input.observed_binding_digest,
    expected_binding_digest: input.expected_binding_digest,
    source_evidence_namespace: input.source_evidence_namespace,
    source_section_digest: input.source_section_digest,
    effective_at: instant.canonical,
    entry_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    ...payload,
    entry_digest: digest(entryPayload(payload)),
  });
}

function inventoryDigest(
  entries: CanonicalExternalImprovementBindingEntry[],
) {
  return digest({
    inventory_version: "canonical_external_binding_inventory_v1",
    entries: arrayMap(entries, (entry) => ({
      entry_identity: entry.entry_identity,
      entry_digest: entry.entry_digest,
    })),
  });
}

export function createCanonicalExternalImprovementBindingSnapshot(input: {
  owner_authority_identity: string;
  registry_authority_identity: string;
  authority_manifest_digest: string;
  authority_root_digest: string;
  publication_sequence: number;
  publication_epoch: number;
  predecessor: CanonicalImprovementBindingSnapshot["predecessor"];
  captured_at: string;
  evidence_cutoff: string;
  effective_at: string;
  entry_inventory: CanonicalExternalImprovementBindingEntry[];
}): CanonicalExternalImprovementBindingSnapshot {
  if (
    !isRecord(input) ||
    !exactKeys(input, [
      "authority_manifest_digest",
      "authority_root_digest",
      "captured_at",
      "effective_at",
      "entry_inventory",
      "evidence_cutoff",
      "owner_authority_identity",
      "predecessor",
      "publication_epoch",
      "publication_sequence",
      "registry_authority_identity",
    ]) ||
    validateCanonicalBoundedSnapshotPayload(input).status !== "valid"
  ) {
    throw new Error("canonical_external_binding_snapshot_invalid");
  }
  const captured = canonicalInstant(input.captured_at);
  const cutoff = canonicalInstant(input.evidence_cutoff);
  const effective = canonicalInstant(input.effective_at);
  if (
    !validIdentity(input.owner_authority_identity) ||
    !validIdentity(input.registry_authority_identity) ||
    !validFullSha(input.authority_manifest_digest) ||
    !validFullSha(input.authority_root_digest) ||
    !validPositiveInteger(input.publication_sequence) ||
    !validPositiveInteger(input.publication_epoch) ||
    !captured ||
    !cutoff ||
    !effective ||
    cutoff.epoch_nanoseconds > captured.epoch_nanoseconds ||
    effective.epoch_nanoseconds !== captured.epoch_nanoseconds ||
    !intrinsicArrayIsArray(input.entry_inventory) ||
    !isRecord(input.predecessor) ||
    !exactKeys(input.predecessor, [
      "previous_publication_epoch",
      "previous_publication_sequence",
      "previous_snapshot_digest",
      "state",
    ])
  ) {
    throw new Error("canonical_external_binding_snapshot_invalid");
  }
  const genesis =
    input.publication_sequence === 1 || input.publication_epoch === 1;
  if (
    (genesis &&
      (input.publication_sequence !== 1 ||
        input.publication_epoch !== 1 ||
        input.predecessor.state !== "genesis" ||
        input.predecessor.previous_snapshot_digest !== null ||
        input.predecessor.previous_publication_sequence !== null ||
        input.predecessor.previous_publication_epoch !== null)) ||
    (!genesis &&
      (input.predecessor.state !== "linked" ||
        !validFullSha(input.predecessor.previous_snapshot_digest) ||
        input.predecessor.previous_publication_sequence !==
          input.publication_sequence - 1 ||
        !validPositiveInteger(
          input.predecessor.previous_publication_epoch,
        ) ||
        input.predecessor.previous_publication_epoch >=
          input.publication_epoch))
  ) {
    throw new Error("canonical_external_binding_snapshot_invalid");
  }
  const entryReasons: string[] = [];
  const validatedEntries = arrayMap(
    input.entry_inventory,
    (entry) =>
      validateEntry(entry, cutoff.epoch_nanoseconds, entryReasons),
  );
  const presentEntries = arrayFilter(
    validatedEntries,
      (entry): entry is CanonicalExternalImprovementBindingEntry =>
        entry !== null,
  );
  const entries = arraySort(
    arrayMap(presentEntries, (entry) => intrinsicStructuredClone(entry)),
    (first, second) =>
      compareCanonicalStrings(
        first.entry_identity,
        second.entry_identity,
      ),
  );
  const identities = new IntrinsicSet<string>();
  const typedKeys = new IntrinsicSet<string>();
  const crossTypes = new IntrinsicMap<string, EntryType>();
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const typedKey = `${entry.entry_type}:${entry.bound_identity_type}:${entry.bound_identity}`;
    const priorType = mapGet(crossTypes, entry.bound_identity);
    if (
      setHas(identities, entry.entry_identity) ||
      setHas(typedKeys, typedKey) ||
      (priorType !== undefined && priorType !== entry.entry_type)
    ) {
      arrayPush(
        entryReasons,
        "binding_admission_entry_inventory_conflicting",
      );
    }
    setAdd(identities, entry.entry_identity);
    setAdd(typedKeys, typedKey);
    mapSet(crossTypes, entry.bound_identity, entry.entry_type);
  }
  if (
    entryReasons.length > 0 ||
    entries.length !== input.entry_inventory.length
  ) {
    throw new Error("canonical_external_binding_snapshot_invalid");
  }
  const identity = `external-binding-snapshot:${input.owner_authority_identity}:${input.publication_epoch}:${input.publication_sequence}`;
  const payload = {
    snapshot_version:
      CANONICAL_EXTERNAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION,
    snapshot_identity: identity,
    owner_authority_identity: input.owner_authority_identity,
    registry_authority_identity: input.registry_authority_identity,
    authority_manifest_digest: input.authority_manifest_digest,
    authority_root_digest: input.authority_root_digest,
    publication_sequence: input.publication_sequence,
    publication_epoch: input.publication_epoch,
    predecessor: intrinsicStructuredClone(input.predecessor),
    captured_at: captured.canonical,
    evidence_cutoff: cutoff.canonical,
    effective_at: effective.canonical,
    entry_inventory: entries,
    entry_inventory_digest: inventoryDigest(entries),
    snapshot_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...payload,
    snapshot_digest: digest(payload),
  });
}

export function createCanonicalBindingSnapshotAdmissionAuthority(input: {
  authority_identity: string;
  owner_boundary_identity: string;
  snapshot: CanonicalExternalImprovementBindingSnapshot;
}): CanonicalBindingSnapshotAdmissionAuthority {
  if (
    !isRecord(input) ||
    !exactKeys(input, [
      "authority_identity",
      "owner_boundary_identity",
      "snapshot",
    ]) ||
    validateCanonicalBoundedSnapshotPayload(input).status !== "valid" ||
    !validIdentity(input.authority_identity) ||
    !validIdentity(input.owner_boundary_identity) ||
    !isRecord(input.snapshot) ||
    !exactKeys(input.snapshot, snapshotKeys) ||
    input.snapshot.snapshot_version !==
      CANONICAL_EXTERNAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION ||
    !validIdentity(input.snapshot.snapshot_identity) ||
    !validFullSha(input.snapshot.snapshot_digest) ||
    !validFullSha(input.snapshot.authority_manifest_digest) ||
    !validFullSha(input.snapshot.authority_root_digest)
  ) {
    throw new Error("canonical_binding_admission_authority_invalid");
  }
  const snapshotPayload = intrinsicStructuredClone(input.snapshot);
  delete (
    snapshotPayload as Partial<CanonicalExternalImprovementBindingSnapshot>
  ).snapshot_digest;
  if (input.snapshot.snapshot_digest !== digest(snapshotPayload)) {
    throw new Error("canonical_binding_admission_authority_invalid");
  }
  let rebuiltSnapshot: CanonicalExternalImprovementBindingSnapshot;
  try {
    rebuiltSnapshot = createCanonicalExternalImprovementBindingSnapshot({
      owner_authority_identity:
        input.snapshot.owner_authority_identity,
      registry_authority_identity:
        input.snapshot.registry_authority_identity,
      authority_manifest_digest:
        input.snapshot.authority_manifest_digest,
      authority_root_digest: input.snapshot.authority_root_digest,
      publication_sequence: input.snapshot.publication_sequence,
      publication_epoch: input.snapshot.publication_epoch,
      predecessor: input.snapshot.predecessor,
      captured_at: input.snapshot.captured_at,
      evidence_cutoff: input.snapshot.evidence_cutoff,
      effective_at: input.snapshot.effective_at,
      entry_inventory: input.snapshot.entry_inventory,
    });
  } catch {
    throw new Error("canonical_binding_admission_authority_invalid");
  }
  if (!exact(input.snapshot, rebuiltSnapshot)) {
    throw new Error("canonical_binding_admission_authority_invalid");
  }
  const payload = {
    authority_version: CANONICAL_BINDING_SNAPSHOT_AUTHORITY_VERSION,
    authority_identity: input.authority_identity,
    owner_boundary_identity: input.owner_boundary_identity,
    registry_authority_identity:
      input.snapshot.registry_authority_identity,
    frozen_manifest_digest: input.snapshot.authority_manifest_digest,
    expected_authority_root_digest:
      input.snapshot.authority_root_digest,
    expected_snapshot_identity: input.snapshot.snapshot_identity,
    expected_snapshot_digest: input.snapshot.snapshot_digest,
    expected_publication_sequence:
      input.snapshot.publication_sequence,
    expected_publication_epoch: input.snapshot.publication_epoch,
    expected_predecessor_digest:
      input.snapshot.predecessor.previous_snapshot_digest,
    authority_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  const authority = deepFreeze({
    ...payload,
    authority_digest: digest(payload),
  });
  weakSetAdd(recognizedAuthorities, authority);
  return authority;
}

function validateAuthority(input: {
  value: unknown;
  ownerBoundaryIdentity: string;
  expectedAuthorityIdentity: string;
  expectedAuthorityDigest: string;
  captureAuthority: CanonicalCompletedImprovementCaptureAuthority;
}) {
  const reasons: string[] = [];
  if (
    !isRecord(input.value) ||
    !weakSetHas(recognizedAuthorities, input.value) ||
    !exactKeys(input.value, authorityKeys)
  ) {
    return {
      authority: null,
      reasons: ["binding_admission_external_authority_unrecognized"],
    };
  }
  const authority =
    input.value as CanonicalBindingSnapshotAdmissionAuthority;
  if (
    authority.authority_version !==
      CANONICAL_BINDING_SNAPSHOT_AUTHORITY_VERSION ||
    authority.authority_digest_algorithm !== "sha256_canonical_json_v1" ||
    authority.owner_boundary_identity !== input.ownerBoundaryIdentity ||
    authority.authority_identity !== input.expectedAuthorityIdentity ||
    authority.authority_digest !== input.expectedAuthorityDigest ||
    !validIdentity(authority.authority_identity) ||
    !validIdentity(authority.registry_authority_identity) ||
    !validIdentity(authority.owner_boundary_identity) ||
    !validPositiveInteger(authority.expected_publication_sequence) ||
    !validPositiveInteger(authority.expected_publication_epoch)
  ) {
    arrayPush(reasons, "binding_admission_authority_contract_mismatch");
  }
  if (
    !validFullSha(authority.frozen_manifest_digest) ||
    !validFullSha(authority.expected_authority_root_digest) ||
    !validFullSha(authority.expected_snapshot_digest) ||
    (authority.expected_predecessor_digest !== null &&
      !validFullSha(authority.expected_predecessor_digest))
  ) {
    arrayPush(reasons, "binding_admission_authority_digest_format_invalid");
  }
  const payload = intrinsicStructuredClone(authority);
  delete (
    payload as Partial<CanonicalBindingSnapshotAdmissionAuthority>
  ).authority_digest;
  if (authority.authority_digest !== digest(payload)) {
    arrayPush(reasons, "binding_admission_authority_digest_mismatch");
  }
  if (
    input.captureAuthority.authority_version !==
      CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_AUTHORITY_VERSION ||
    !validIdentity(input.captureAuthority.authority_identity) ||
    !validIdentity(
      input.captureAuthority.proposal_registry_authority_identity,
    ) ||
    !validFullSha(
      input.captureAuthority.proposal_registry_manifest_digest,
    ) ||
    !validFullSha(input.captureAuthority.proposal_registry_root_digest) ||
    !validFullSha(input.captureAuthority.authority_digest) ||
    authority.expected_authority_root_digest !==
      input.captureAuthority.proposal_registry_root_digest ||
    authority.registry_authority_identity !==
      input.captureAuthority.proposal_registry_authority_identity ||
    authority.frozen_manifest_digest !==
      input.captureAuthority.proposal_registry_manifest_digest
  ) {
    arrayPush(reasons, "binding_admission_replay_authority_mismatch");
  }
  return {
    authority: reasons.length === 0 ? authority : null,
    reasons: uniqueSorted(reasons),
  };
}

function validateEntry(
  value: unknown,
  cutoffNanoseconds: bigint,
  reasons: string[],
) {
  if (!isRecord(value) || !exactKeys(value, entryKeys)) {
    arrayPush(reasons, "binding_admission_entry_schema_invalid");
    return null;
  }
  const entry = value as CanonicalExternalImprovementBindingEntry;
  if (
    entry.entry_version !==
      CANONICAL_EXTERNAL_IMPROVEMENT_BINDING_ENTRY_VERSION ||
    (entry.entry_type !== "previous_binding" &&
      entry.entry_type !== "capture_binding") ||
    entry.observed_status !== "matching"
  ) {
    arrayPush(reasons, "binding_admission_entry_contract_invalid");
  }
  const expectedTypes =
    entry.entry_type === "capture_binding"
      ? ["capture"]
      : ["proposal", "experiment"];
  if (
    !arrayIncludes(expectedTypes, entry.bound_identity_type) ||
    !validIdentity(entry.bound_identity) ||
    entry.entry_identity !== entryIdentity(entry)
  ) {
    arrayPush(reasons, "binding_admission_entry_identity_invalid");
  }
  if (
    !validFullSha(entry.observed_binding_digest) ||
    !validFullSha(entry.expected_binding_digest) ||
    !validFullSha(entry.source_section_digest) ||
    entry.observed_binding_digest !== entry.expected_binding_digest
  ) {
    arrayPush(reasons, "binding_admission_entry_status_digest_conflict");
  }
  if (
    (entry.entry_type === "previous_binding" &&
      entry.source_evidence_namespace !==
        "canonical_previous_binding_evidence") ||
    (entry.entry_type === "capture_binding" &&
      entry.source_evidence_namespace !==
        "canonical_capture_binding_evidence")
  ) {
    arrayPush(
      reasons,
      "binding_admission_entry_source_namespace_mismatch",
    );
  }
  const effective = canonicalInstant(entry.effective_at);
  if (
    !effective ||
    effective.canonical !== entry.effective_at ||
    effective.epoch_nanoseconds > cutoffNanoseconds
  ) {
    arrayPush(reasons, "binding_admission_entry_after_evidence_cutoff");
  }
  if (
    entry.entry_digest_algorithm !== "sha256_canonical_json_v1" ||
    entry.entry_digest !==
      digest(
        intrinsicObjectFromEntries(
          arrayFilter(
            intrinsicObjectEntries(entry),
            ([key]) => key !== "entry_digest",
          ),
        ),
      )
  ) {
    arrayPush(reasons, "binding_admission_entry_digest_mismatch");
  }
  return entry;
}

function predecessorReasons(
  snapshot: CanonicalExternalImprovementBindingSnapshot,
  authority: CanonicalBindingSnapshotAdmissionAuthority,
) {
  const reasons: string[] = [];
  const genesis =
    snapshot.publication_sequence === 1 ||
    snapshot.publication_epoch === 1;
  if (genesis) {
    if (
      snapshot.publication_sequence !== 1 ||
      snapshot.publication_epoch !== 1 ||
      snapshot.predecessor.state !== "genesis" ||
      snapshot.predecessor.previous_snapshot_digest !== null ||
      snapshot.predecessor.previous_publication_sequence !== null ||
      snapshot.predecessor.previous_publication_epoch !== null
    ) {
      arrayPush(reasons, "binding_admission_genesis_contract_invalid");
    }
  } else if (
    snapshot.predecessor.state !== "linked" ||
    !validFullSha(
      snapshot.predecessor.previous_snapshot_digest ?? "",
    ) ||
    snapshot.predecessor.previous_publication_sequence !==
      snapshot.publication_sequence - 1 ||
    snapshot.predecessor.previous_publication_epoch === null ||
    snapshot.predecessor.previous_publication_epoch >=
      snapshot.publication_epoch
  ) {
    arrayPush(reasons, "binding_admission_predecessor_mismatch");
  }
  if (
    snapshot.publication_sequence !==
      authority.expected_publication_sequence ||
    snapshot.publication_epoch !== authority.expected_publication_epoch ||
    snapshot.predecessor.previous_snapshot_digest !==
      authority.expected_predecessor_digest
  ) {
    arrayPush(
      reasons,
      "binding_admission_epoch_rollback_or_predecessor_drift",
    );
  }
  return reasons;
}

function buildBoundedValidationFailure(input: {
  request: CanonicalBindingBackedReplayRequest | null;
  authority: CanonicalBindingSnapshotAdmissionAuthority | null;
  validation: Extract<
    BoundedValidationResult,
    { status: "budget_exceeded" }
  >;
  counters: CanonicalBindingSnapshotAdmissionCounters;
}): CanonicalBoundedSnapshotValidationFailure {
  const boundedPayload = {
    validator_version: CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION,
    budget_policy_version:
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_VERSION,
    budget_policy: CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY,
    budget_policy_digest:
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_DIGEST,
    request_identity: input.request?.admission_identity ?? null,
    authority_root_digest:
      input.authority?.expected_authority_root_digest ?? null,
    expected_snapshot_identity:
      input.authority?.expected_snapshot_identity ?? null,
    expected_snapshot_digest:
      input.authority?.expected_snapshot_digest ?? null,
    reason: "snapshot_validation_budget_exceeded" as const,
    budget_kind: input.validation.budget_kind,
    first_rejected_path: input.validation.first_rejected_path,
    counters: {
      observed_depth: input.validation.observed_depth,
      observed_nodes: input.validation.observed_nodes,
      observed_own_keys: input.validation.observed_own_keys,
      observed_array_length:
        input.validation.observed_array_length,
      observed_string_bytes:
        input.validation.observed_string_bytes,
      observed_total_string_bytes:
        input.validation.observed_total_string_bytes,
    },
    full_snapshot_digest_computed: false as const,
    full_snapshot_digest: null,
    bounded_observation_digest_algorithm:
      "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    validator_version: boundedPayload.validator_version,
    budget_policy_version: boundedPayload.budget_policy_version,
    budget_policy_digest: boundedPayload.budget_policy_digest,
    reason: boundedPayload.reason,
    budget_kind: boundedPayload.budget_kind,
    first_rejected_path: boundedPayload.first_rejected_path,
    ...boundedPayload.counters,
    bounded_observation_digest_algorithm:
      boundedPayload.bounded_observation_digest_algorithm,
    bounded_observation_digest: digest(
      boundedPayload,
      input.counters,
    ),
    full_snapshot_digest_computed: false,
    full_snapshot_digest: null,
  });
}

function failureResult(input: {
  status: Exclude<AdmissionStatus, "admitted">;
  request: CanonicalBindingBackedReplayRequest | null;
  observedSnapshot: unknown;
  observedSnapshotIdentity: string | null;
  observedSnapshotDigest: string;
  authority: CanonicalBindingSnapshotAdmissionAuthority | null;
  reasonCodes: string[];
  counters: CanonicalBindingSnapshotAdmissionCounters;
  validationFailure?: Extract<
    BoundedValidationResult,
    { status: "budget_exceeded" }
  >;
}) {
  const validationFailure = input.validationFailure
    ? buildBoundedValidationFailure({
        request: input.request,
        authority: input.authority,
        validation: input.validationFailure,
        counters: input.counters,
      })
    : null;
  const payload = {
    admission_version:
      CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_ADMISSION_VERSION,
    status: input.status,
    admission_identity: input.request?.admission_identity ?? null,
    observed_snapshot_identity: input.observedSnapshotIdentity,
    observed_snapshot_digest:
      validationFailure?.bounded_observation_digest ??
      input.observedSnapshotDigest,
    expected_snapshot_identity:
      input.authority?.expected_snapshot_identity ?? null,
    expected_snapshot_digest:
      input.authority?.expected_snapshot_digest ?? null,
    authority_identity: input.authority?.authority_identity ?? null,
    authority_digest: input.authority?.authority_digest ?? null,
    authority_root_digest:
      input.authority?.expected_authority_root_digest ?? null,
    snapshot_validator_version:
      CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION,
    snapshot_budget_policy_version:
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_VERSION,
    snapshot_budget_policy_digest:
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_DIGEST,
    validation_failure: validationFailure,
    projection: null,
    reason_codes: uniqueSorted(input.reasonCodes),
    admission_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...payload,
    admission_digest: digest(payload, input.counters),
  });
}

function projectAxSnapshot(
  snapshot: CanonicalExternalImprovementBindingSnapshot,
) {
  const entries: CanonicalImprovementBindingEntry[] =
    arrayMap(snapshot.entry_inventory, (entry) =>
      createCanonicalImprovementBindingEntry({
        entry_type: entry.entry_type,
        bound_identity_type: entry.bound_identity_type,
        bound_identity: entry.bound_identity,
        observed_binding_digest: entry.observed_binding_digest,
        source_evidence_namespace: entry.source_evidence_namespace,
        source_evidence_digest: entry.source_section_digest,
        effective_at: entry.effective_at,
      }),
    );
  return createCanonicalImprovementBindingSnapshot({
    owner_authority_identity: snapshot.owner_authority_identity,
    publication_sequence: snapshot.publication_sequence,
    publication_epoch: snapshot.publication_epoch,
    predecessor: snapshot.predecessor,
    published_at: snapshot.captured_at,
    effective_at: snapshot.effective_at,
    entry_inventory: entries,
    expected_external_trust_root: snapshot.authority_root_digest,
  });
}

function admitFrozenSnapshot(input: {
  request: CanonicalBindingBackedReplayRequest;
  authority: CanonicalBindingSnapshotAdmissionAuthority;
  rawSnapshot: unknown;
  counters: CanonicalBindingSnapshotAdmissionCounters;
}) {
  const validation = validateCanonicalBoundedSnapshotPayload(
    input.rawSnapshot,
  );
  const observedIdentity = observedSnapshotIdentity(
    input.rawSnapshot,
  );
  if (validation.status !== "valid") {
    const observedDigest = forensicObservedDigest(
      input.rawSnapshot,
      validation.reason_codes,
      input.counters,
    );
    return failureResult({
      status: "unmappable",
      request: input.request,
      observedSnapshot: input.rawSnapshot,
      observedSnapshotIdentity: observedIdentity,
      observedSnapshotDigest: observedDigest,
      authority: input.authority,
      reasonCodes: validation.reason_codes,
      counters: input.counters,
      validationFailure:
        validation.status === "budget_exceeded"
          ? validation
          : undefined,
    });
  }
  input.counters.clones += 1;
  let snapshot: CanonicalExternalImprovementBindingSnapshot;
  try {
    snapshot = intrinsicStructuredClone(
      input.rawSnapshot,
    ) as CanonicalExternalImprovementBindingSnapshot;
  } catch {
    const reasons = ["snapshot_payload_clone_failed"];
    return failureResult({
      status: "unmappable",
      request: input.request,
      observedSnapshot: null,
      observedSnapshotIdentity: observedIdentity,
      observedSnapshotDigest: forensicObservedDigest(
        null,
        reasons,
        input.counters,
      ),
      authority: input.authority,
      reasonCodes: reasons,
      counters: input.counters,
    });
  }
  const observedDigest = digest(snapshot, input.counters);
  if (!isRecord(snapshot) || !exactKeys(snapshot, snapshotKeys)) {
    return failureResult({
      status: "incomplete",
      request: input.request,
      observedSnapshot: snapshot,
      observedSnapshotIdentity: observedIdentity,
      observedSnapshotDigest: observedDigest,
      authority: input.authority,
      reasonCodes: ["binding_admission_snapshot_schema_incomplete"],
      counters: input.counters,
    });
  }
  const reasons: string[] = [];
  if (
    snapshot.snapshot_version !==
      CANONICAL_EXTERNAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION ||
    snapshot.snapshot_digest_algorithm !== "sha256_canonical_json_v1" ||
    snapshot.snapshot_identity !==
      `external-binding-snapshot:${snapshot.owner_authority_identity}:${snapshot.publication_epoch}:${snapshot.publication_sequence}`
  ) {
    arrayPush(reasons, "binding_admission_snapshot_contract_invalid");
  }
  if (
    snapshot.snapshot_identity !==
      input.authority.expected_snapshot_identity ||
    snapshot.snapshot_digest !==
      input.authority.expected_snapshot_digest ||
    snapshot.registry_authority_identity !==
      input.authority.registry_authority_identity ||
    snapshot.authority_manifest_digest !==
      input.authority.frozen_manifest_digest ||
    snapshot.authority_root_digest !==
      input.authority.expected_authority_root_digest
  ) {
    arrayPush(reasons, "binding_admission_authority_snapshot_conflict");
  }
  if (
    !arrayEvery(
      intrinsicObjectEntries(safety),
      ([key, expected]) =>
        (snapshot as unknown as Record<string, unknown>)[key] ===
        expected,
    )
  ) {
    arrayPush(reasons, "binding_admission_safety_contract_conflict");
  }
  const captured = canonicalInstant(snapshot.captured_at);
  const cutoff = canonicalInstant(snapshot.evidence_cutoff);
  const effective = canonicalInstant(snapshot.effective_at);
  const asOf = canonicalInstant(input.request.lookup_as_of);
  if (!captured || !cutoff || !effective || !asOf) {
    arrayPush(reasons, "binding_admission_explicit_instant_invalid");
  } else if (
    captured.canonical !== snapshot.captured_at ||
    cutoff.canonical !== snapshot.evidence_cutoff ||
    effective.canonical !== snapshot.effective_at ||
    asOf.canonical !== input.request.lookup_as_of ||
    cutoff.epoch_nanoseconds > captured.epoch_nanoseconds ||
    effective.epoch_nanoseconds !== captured.epoch_nanoseconds ||
    captured.epoch_nanoseconds > asOf.epoch_nanoseconds
  ) {
    arrayPush(reasons, "binding_admission_not_point_in_time_safe");
  }
  const predecessorReasonCodes = predecessorReasons(
    snapshot,
    input.authority,
  );
  for (
    let index = 0;
    index < predecessorReasonCodes.length;
    index += 1
  ) {
    arrayPush(reasons, predecessorReasonCodes[index]);
  }
  if (!intrinsicArrayIsArray(snapshot.entry_inventory)) {
    arrayPush(reasons, "binding_admission_entry_inventory_missing");
  } else if (cutoff) {
    const entries = arrayFilter(
      arrayMap(snapshot.entry_inventory, (entry) =>
        validateEntry(entry, cutoff.epoch_nanoseconds, reasons),
      ),
      (entry): entry is CanonicalExternalImprovementBindingEntry =>
        entry !== null,
    );
    const identities = new IntrinsicMap<string, string>();
    const typedKeys = new IntrinsicMap<string, string>();
    const crossTypes = new IntrinsicMap<string, EntryType>();
    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      const priorIdentity = mapGet(identities, entry.entry_identity);
      if (priorIdentity) {
        arrayPush(
          reasons,
          priorIdentity === entry.entry_digest
            ? "binding_admission_duplicate_entry_identity"
            : "binding_admission_conflicting_entry_identity",
        );
      }
      mapSet(identities, entry.entry_identity, entry.entry_digest);
      const typedKey = `${entry.entry_type}:${entry.bound_identity_type}:${entry.bound_identity}`;
      const priorKey = mapGet(typedKeys, typedKey);
      if (priorKey) {
        arrayPush(
          reasons,
          priorKey === entry.entry_digest
            ? "binding_admission_duplicate_lookup_identity"
            : "binding_admission_conflicting_lookup_identity",
        );
      }
      mapSet(typedKeys, typedKey, entry.entry_digest);
      const priorType = mapGet(crossTypes, entry.bound_identity);
      if (priorType && priorType !== entry.entry_type) {
        arrayPush(reasons, "binding_admission_cross_type_collision");
      }
      mapSet(crossTypes, entry.bound_identity, entry.entry_type);
    }
    const ordered = arraySort(copyArray(entries), (first, second) =>
      compareCanonicalStrings(
        first.entry_identity,
        second.entry_identity,
      ),
    );
    if (!exact(entries, ordered)) {
      arrayPush(reasons, "binding_admission_entry_order_noncanonical");
    }
    if (
      snapshot.entry_inventory_digest !== inventoryDigest(ordered)
    ) {
      arrayPush(reasons, "binding_admission_inventory_digest_mismatch");
    }
  }
  const snapshotPayload = intrinsicStructuredClone(snapshot);
  delete (
    snapshotPayload as Partial<CanonicalExternalImprovementBindingSnapshot>
  ).snapshot_digest;
  if (snapshot.snapshot_digest !== digest(snapshotPayload)) {
    arrayPush(reasons, "binding_admission_snapshot_digest_mismatch");
  }
  if (reasons.length > 0) {
    const status = arraySome(reasons, (reason) =>
      stringIncludes(reason, "not_point_in_time"),
    )
      ? "not_point_in_time_safe"
      : arraySome(
            reasons,
            (reason) =>
              stringIncludes(reason, "missing") ||
              stringIncludes(reason, "incomplete"),
          )
        ? "incomplete"
        : "conflicting";
    return failureResult({
      status,
      request: input.request,
      observedSnapshot: snapshot,
      observedSnapshotIdentity: observedIdentity,
      observedSnapshotDigest: observedDigest,
      authority: input.authority,
      reasonCodes: reasons,
      counters: input.counters,
    });
  }
  const frozenSnapshot = deepFreeze(intrinsicStructuredClone(snapshot));
  const axSnapshot = deepFreeze(projectAxSnapshot(frozenSnapshot));
  const projectionPayload = {
    projection_version:
      CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_ADMISSION_VERSION,
    admission_identity: input.request.admission_identity,
    authority_identity: input.authority.authority_identity,
    authority_digest: input.authority.authority_digest,
    authority_root_digest:
      input.authority.expected_authority_root_digest,
    source_snapshot_identity: frozenSnapshot.snapshot_identity,
    source_snapshot_digest: frozenSnapshot.snapshot_digest,
    source_snapshot_projection_digest: digest(frozenSnapshot),
    source_snapshot: frozenSnapshot,
    ax_snapshot_version: CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION,
    ax_snapshot: axSnapshot,
    ax_snapshot_digest: axSnapshot.snapshot_digest,
    projection_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  const projection = deepFreeze({
    ...projectionPayload,
    projection_digest: digest(projectionPayload),
  });
  const payload = {
    admission_version:
      CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_ADMISSION_VERSION,
    status: "admitted" as const,
    admission_identity: input.request.admission_identity,
    observed_snapshot_identity: frozenSnapshot.snapshot_identity,
    observed_snapshot_digest: frozenSnapshot.snapshot_digest,
    expected_snapshot_identity:
      input.authority.expected_snapshot_identity,
    expected_snapshot_digest:
      input.authority.expected_snapshot_digest,
    authority_identity: input.authority.authority_identity,
    authority_digest: input.authority.authority_digest,
    authority_root_digest:
      input.authority.expected_authority_root_digest,
    snapshot_validator_version:
      CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION,
    snapshot_budget_policy_version:
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_VERSION,
    snapshot_budget_policy_digest:
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_DIGEST,
    validation_failure: null,
    projection,
    reason_codes: [] as string[],
    admission_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...payload,
    admission_digest: digest(payload, input.counters),
  });
}

function buildStore(input: {
  projection: CanonicalBindingSnapshotAdmissionProjection;
  authority: CanonicalBindingSnapshotAdmissionAuthority;
  counters: CanonicalBindingSnapshotAdmissionCounters;
}) {
  const axAuthority = createCanonicalImprovementBindingSnapshotAuthority({
    authority_identity: input.authority.authority_identity,
    owner_boundary_identity: input.authority.owner_boundary_identity,
    snapshot: input.projection.ax_snapshot,
  });
  const dependency = {
    owner_boundary_version:
      CANONICAL_IMPROVEMENT_BINDING_OWNER_BOUNDARY_VERSION,
    owner_boundary_identity: input.authority.owner_boundary_identity,
    expected_authority_identity: axAuthority.authority_identity,
    expected_authority_digest: axAuthority.authority_digest,
    read_expected_authority: () => axAuthority,
    read_verified_snapshot: () => input.projection.ax_snapshot,
  };
  input.counters.store_constructions += 1;
  const harness = createCanonicalImprovementBindingStoreHarness({
    enabled: true,
    kill_switch_engaged: false,
    owner_dependency: dependency,
  });
  if (!harness.store) return null;
  const store = harness.store;
  const observationPayload = {
    observation_version: "canonical_ax_store_observation_v1",
    store_version: store.store_version,
    validation_status: store.validation_status,
    validation_reason_codes: store.validation_reason_codes,
    snapshot_identity: store.snapshot_identity,
    snapshot_digest: store.snapshot_digest,
    owner_boundary_identity: store.owner_boundary_identity,
    authority_identity: store.authority_identity,
    authority_digest: store.authority_digest,
    expected_external_trust_root:
      store.expected_external_trust_root,
  };
  return {
    store,
    observation: deepFreeze({
      ...observationPayload,
      observation_digest: digest(observationPayload),
    }),
  };
}

function buildLineage(input: {
  requestDigest: string;
  admission: CanonicalBindingSnapshotAdmissionResult;
  storeObservation?: ReturnType<typeof buildStore> extends infer R
    ? R extends { observation: infer O }
      ? O
      : never
    : never;
  admissionRebuildVerified: boolean;
  storeRebuildVerified: boolean;
  endToEndRebuildVerified: boolean;
  endToEndResult: CanonicalGovernedImprovementEndToEndResult | null;
}) {
  const payload = {
    lineage_version:
      "canonical_binding_backed_improvement_lineage_v1" as const,
    request_digest: input.requestDigest,
    admission_identity: input.admission.admission_identity,
    admission_digest: input.admission.admission_digest,
    snapshot_identity: input.admission.observed_snapshot_identity,
    snapshot_digest: input.admission.observed_snapshot_digest,
    authority_identity: input.admission.authority_identity,
    authority_digest: input.admission.authority_digest,
    authority_root_digest: input.admission.authority_root_digest,
    ax_store_version: input.storeObservation?.store_version ?? null,
    ax_store_snapshot_identity:
      input.storeObservation?.snapshot_identity ?? null,
    ax_store_snapshot_digest:
      input.storeObservation?.snapshot_digest ?? null,
    ax_store_observation_digest:
      input.storeObservation?.observation_digest ?? null,
    admission_rebuild_verified: input.admissionRebuildVerified,
    store_rebuild_verified: input.storeRebuildVerified,
    end_to_end_rebuild_verified: input.endToEndRebuildVerified,
    end_to_end_replay_version:
      input.endToEndResult?.replay_version ?? null,
    end_to_end_digest:
      input.endToEndResult?.end_to_end_digest ?? null,
    proposal_status: input.endToEndResult?.proposal_status ?? null,
    lineage_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    ...payload,
    lineage_digest: digest(payload),
  });
}

function replayResult(input: {
  status: AdmissionStatus;
  proposalStatus: CanonicalGovernedImprovementEndToEndResult["proposal_status"];
  admission: CanonicalBindingSnapshotAdmissionResult;
  endToEndResult: CanonicalGovernedImprovementEndToEndResult | null;
  lineage: CanonicalBindingBackedReplayLineage;
  reasonCodes: string[];
  counters: CanonicalBindingSnapshotAdmissionCounters;
}) {
  const payload = {
    replay_version: CANONICAL_BINDING_BACKED_IMPROVEMENT_REPLAY_VERSION,
    status: input.status,
    proposal_status: input.proposalStatus,
    admission_result: input.admission,
    end_to_end_result: input.endToEndResult,
    lineage: input.lineage,
    reason_codes: uniqueSorted(input.reasonCodes),
    replay_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...payload,
    replay_digest: digest(payload, input.counters),
  });
}

function downstreamExecutionFailure(
  request: CanonicalBindingBackedReplayRequest,
  counters: CanonicalBindingSnapshotAdmissionCounters,
  reasonCode:
    | "binding_backed_replay_downstream_execution_failed"
    | "binding_backed_replay_downstream_intrinsic_drift",
) {
  const reasonCodes = [reasonCode];
  const requestPlainReasons = plainDataReasons(request);
  const requestDigest = forensicObservedDigest(
    request,
    requestPlainReasons,
    counters,
  );
  const admission = failureResult({
    status: "unmappable",
    request,
    observedSnapshot: null,
    observedSnapshotIdentity: null,
    observedSnapshotDigest: digest(
      { downstream_failure_reason: reasonCode },
      counters,
    ),
    authority: null,
    reasonCodes,
    counters,
  });
  const lineage = buildLineage({
    requestDigest,
    admission,
    admissionRebuildVerified: false,
    storeRebuildVerified: false,
    endToEndRebuildVerified: false,
    endToEndResult: null,
  });
  return replayResult({
    status: "unmappable",
    proposalStatus: null,
    admission,
    endToEndResult: null,
    lineage,
    reasonCodes,
    counters,
  });
}

function structuralRequestReasons(value: unknown) {
  if (!isRecord(value) || !exactKeys(value, requestKeys)) {
    return ["binding_backed_replay_request_schema_invalid"];
  }
  const reasons: string[] = [];
  if (
    value.request_version !==
      CANONICAL_BINDING_BACKED_REPLAY_REQUEST_VERSION ||
    value.source_namespace !==
      "binding_backed_governed_improvement_replay"
  ) {
    arrayPush(reasons, "binding_backed_replay_request_contract_invalid");
  }
  if (!validIdentity(value.admission_identity)) {
    arrayPush(reasons, "binding_backed_replay_admission_identity_invalid");
  }
  if (!canonicalInstant(value.lookup_as_of)) {
    arrayPush(reasons, "binding_backed_replay_lookup_instant_invalid");
  }
  return reasons;
}

function execute(input: {
  request: CanonicalBindingBackedReplayRequest;
  dependencies: CanonicalBindingSnapshotAdmissionDependencies;
  counters: CanonicalBindingSnapshotAdmissionCounters;
  intrinsicDriftFallback: CanonicalBindingBackedReplayResult;
}) {
  input.counters.request_reads += 1;
  const requestPlainReasons = plainDataReasons(input.request);
  const requestDigest = forensicObservedDigest(
    input.request,
    requestPlainReasons,
    input.counters,
  );
  const structural =
    requestPlainReasons.length > 0
      ? requestPlainReasons
      : structuralRequestReasons(input.request);
  if (structural.length > 0) {
    const admission = failureResult({
      status: "unmappable",
      request:
        requestPlainReasons.length === 0 && isRecord(input.request)
        ? input.request
        : null,
      observedSnapshot: null,
      observedSnapshotIdentity: null,
      observedSnapshotDigest: digest(
        { snapshot_not_read: true, structural },
        input.counters,
      ),
      authority: null,
      reasonCodes: structural,
      counters: input.counters,
    });
    const lineage = buildLineage({
      requestDigest,
      admission,
      admissionRebuildVerified: false,
      storeRebuildVerified: false,
      endToEndRebuildVerified: false,
      endToEndResult: null,
    });
    return replayResult({
      status: "unmappable",
      proposalStatus: null,
      admission,
      endToEndResult: null,
      lineage,
      reasonCodes: structural,
      counters: input.counters,
    });
  }
  const request = input.request;
  let authorityValue: unknown;
  try {
    input.counters.authority_reads += 1;
    authorityValue =
      input.dependencies.authority_dependency.read_expected_authority();
    if (!downstreamIntrinsicSurfacesIntact()) {
      return input.intrinsicDriftFallback;
    }
  } catch {
    if (!downstreamIntrinsicSurfacesIntact()) {
      return input.intrinsicDriftFallback;
    }
    const admission = failureResult({
      status: "incomplete",
      request,
      observedSnapshot: null,
      observedSnapshotIdentity: null,
      observedSnapshotDigest: digest(
        { authority_read_failed: true, snapshot_not_read: true },
        input.counters,
      ),
      authority: null,
      reasonCodes: ["binding_admission_authority_read_failed"],
      counters: input.counters,
    });
    const lineage = buildLineage({
      requestDigest,
      admission,
      admissionRebuildVerified: false,
      storeRebuildVerified: false,
      endToEndRebuildVerified: false,
      endToEndResult: null,
    });
    return replayResult({
      status: "incomplete",
      proposalStatus: null,
      admission,
      endToEndResult: null,
      lineage,
      reasonCodes: admission.reason_codes,
      counters: input.counters,
    });
  }
  input.counters.authority_verifications += 1;
  const authorityValidation = validateAuthority({
    value: authorityValue,
    ownerBoundaryIdentity:
      input.dependencies.authority_dependency.owner_boundary_identity,
    expectedAuthorityIdentity:
      input.dependencies.authority_dependency.expected_authority_identity,
    expectedAuthorityDigest:
      input.dependencies.authority_dependency.expected_authority_digest,
    captureAuthority: input.dependencies.capture_authority,
  });
  if (!authorityValidation.authority) {
    const admission = failureResult({
      status: "conflicting",
      request,
      observedSnapshot: null,
      observedSnapshotIdentity: null,
      observedSnapshotDigest: digest(
        {
          authority_validation_failed: true,
          snapshot_not_read: true,
          reasons: authorityValidation.reasons,
        },
        input.counters,
      ),
      authority: null,
      reasonCodes: authorityValidation.reasons,
      counters: input.counters,
    });
    const lineage = buildLineage({
      requestDigest,
      admission,
      admissionRebuildVerified: false,
      storeRebuildVerified: false,
      endToEndRebuildVerified: false,
      endToEndResult: null,
    });
    return replayResult({
      status: "conflicting",
      proposalStatus: null,
      admission,
      endToEndResult: null,
      lineage,
      reasonCodes: admission.reason_codes,
      counters: input.counters,
    });
  }
  const authority = authorityValidation.authority;
  let rawSnapshot: unknown;
  try {
    input.counters.snapshot_reads += 1;
    const readSnapshot = weakMapGet(
      recognizedSnapshotSources,
      input.dependencies.snapshot_dependency,
    );
    if (!readSnapshot) {
      throw new Error("binding_admission_snapshot_source_unrecognized");
    }
    rawSnapshot = readSnapshot();
    if (
      rawSnapshot === null ||
      typeof rawSnapshot !== "object" ||
      !weakSetHas(recognizedJsonSnapshots, rawSnapshot)
    ) {
      throw new Error("binding_admission_snapshot_source_unrecognized");
    }
  } catch {
    const admission = failureResult({
      status: "incomplete",
      request,
      observedSnapshot: null,
      observedSnapshotIdentity: null,
      observedSnapshotDigest: digest(
        { snapshot_read_failed: true },
        input.counters,
      ),
      authority,
      reasonCodes: ["binding_admission_snapshot_read_failed"],
      counters: input.counters,
    });
    const lineage = buildLineage({
      requestDigest,
      admission,
      admissionRebuildVerified: false,
      storeRebuildVerified: false,
      endToEndRebuildVerified: false,
      endToEndResult: null,
    });
    return replayResult({
      status: "incomplete",
      proposalStatus: null,
      admission,
      endToEndResult: null,
      lineage,
      reasonCodes: admission.reason_codes,
      counters: input.counters,
    });
  }
  const admission = admitFrozenSnapshot({
    request,
    authority,
    rawSnapshot,
    counters: input.counters,
  });
  input.counters.admission_rebuilds += 1;
  const rebuiltAdmission = admitFrozenSnapshot({
    request,
    authority,
    rawSnapshot:
      admission.projection?.source_snapshot ?? rawSnapshot,
    counters: input.counters,
  });
  const admissionRebuildVerified = exact(admission, rebuiltAdmission);
  if (
    admission.status !== "admitted" ||
    !admission.projection ||
    !admissionRebuildVerified
  ) {
    const status = admissionRebuildVerified
      ? admission.status
      : "conflicting";
    const reasons = admissionRebuildVerified
      ? admission.reason_codes
      : ["binding_admission_independent_rebuild_mismatch"];
    const lineage = buildLineage({
      requestDigest,
      admission,
      admissionRebuildVerified,
      storeRebuildVerified: false,
      endToEndRebuildVerified: false,
      endToEndResult: null,
    });
    return replayResult({
      status,
      proposalStatus: null,
      admission,
      endToEndResult: null,
      lineage,
      reasonCodes: reasons,
      counters: input.counters,
    });
  }
  const builtStore = buildStore({
    projection: admission.projection,
    authority,
    counters: input.counters,
  });
  input.counters.store_rebuilds += 1;
  const rebuiltStore = buildStore({
    projection: admission.projection,
    authority,
    counters: input.counters,
  });
  const storeRebuildVerified =
    builtStore !== null &&
    rebuiltStore !== null &&
    exact(builtStore.observation, rebuiltStore.observation);
  if (!builtStore || !storeRebuildVerified) {
    const lineage = buildLineage({
      requestDigest,
      admission,
      storeObservation: builtStore?.observation,
      admissionRebuildVerified,
      storeRebuildVerified,
      endToEndRebuildVerified: false,
      endToEndResult: null,
    });
    return replayResult({
      status: "unmappable",
      proposalStatus: null,
      admission,
      endToEndResult: null,
      lineage,
      reasonCodes: ["binding_admission_ax_store_rebuild_failed"],
      counters: input.counters,
    });
  }
  input.counters.lookup_adapter_constructions += 1;
  const adapters = createCanonicalImprovementBindingLookupAdapters({
    store: builtStore.store,
    as_of: request.lookup_as_of,
  });
  const dependencies = {
    capture_authority: input.dependencies.capture_authority,
    capture_previous_binding_lookup: adapters.previous_binding_lookup,
    adapter_previous_binding_lookup: adapters.previous_binding_lookup,
    proposal_previous_binding_lookup: adapters.previous_binding_lookup,
    capture_binding_lookup: adapters.capture_binding_lookup,
  };
  const aqHarness =
    createCanonicalGovernedImprovementEndToEndReplayHarness({
      enabled: true,
      kill_switch_engaged: false,
      dependencies,
    });
  if (!aqHarness.replay) {
    const lineage = buildLineage({
      requestDigest,
      admission,
      storeObservation: builtStore.observation,
      admissionRebuildVerified,
      storeRebuildVerified,
      endToEndRebuildVerified: false,
      endToEndResult: null,
    });
    return replayResult({
      status: "unmappable",
      proposalStatus: null,
      admission,
      endToEndResult: null,
      lineage,
      reasonCodes: ["binding_backed_aq_replay_unavailable"],
      counters: input.counters,
    });
  }
  input.counters.end_to_end_executions += 1;
  const endToEndResult = aqHarness.replay(request.end_to_end_request);
  input.counters.end_to_end_rebuilds += 1;
  const verification =
    verifyCanonicalGovernedImprovementEndToEndResult({
      request: request.end_to_end_request,
      result: endToEndResult,
      harness: aqHarness,
    });
  const endToEndRebuildVerified = verification.valid;
  const status: AdmissionStatus = !verification.valid
    ? "conflicting"
    : endToEndResult.status === "completed"
      ? "admitted"
      : endToEndResult.status === "conflicting"
        ? "conflicting"
        : endToEndResult.status === "incomplete"
          ? "incomplete"
          : "unmappable";
  const reasonCodes = verification.valid
    ? endToEndResult.reason_codes
    : verification.reason_codes;
  const lineage = buildLineage({
    requestDigest,
    admission,
    storeObservation: builtStore.observation,
    admissionRebuildVerified,
    storeRebuildVerified,
    endToEndRebuildVerified,
    endToEndResult,
  });
  return replayResult({
    status,
    proposalStatus: endToEndResult.proposal_status,
    admission,
    endToEndResult,
    lineage,
    reasonCodes,
    counters: input.counters,
  });
}

export function createCanonicalBindingBackedImprovementReplayHarness(
  input: {
    enabled?: boolean;
    kill_switch_engaged?: boolean;
    dependencies?: CanonicalBindingSnapshotAdmissionDependencies;
    counters?: CanonicalBindingSnapshotAdmissionCounters;
  } = {},
) {
  const counters = emptyCounters();
  const publish = <T extends object>(
    shell: T,
    authority: CanonicalBindingBackedReplayAuthority | null,
  ) => {
    const harness = intrinsicObjectFreeze({
      ...shell,
      get counters() {
        return deepFreeze(intrinsicStructuredClone(counters));
      },
    });
    weakMapSet(canonicalBindingBackedReplayAuthorities, harness, authority);
    return harness;
  };
  let enabled = false;
  let killSwitchClear = false;
  try {
    if (!isRecord(input)) {
      throw new Error("binding_admission_options_not_plain");
    }
    const enabledInput = ownDataValue(input, "enabled");
    const killSwitchInput = ownDataValue(
      input,
      "kill_switch_engaged",
    );
    enabled = enabledInput.present && enabledInput.value === true;
    killSwitchClear =
      killSwitchInput.present && killSwitchInput.value === false;
  } catch {
    enabled = false;
    killSwitchClear = false;
  }
  if (!enabled || !killSwitchClear) {
    return publish({
      enabled: false as const,
      status: !enabled
        ? ("disabled" as const)
        : ("kill_switch_engaged" as const),
      replay: null,
      ...safety,
    }, null);
  }
  let dependencies: CanonicalBindingSnapshotAdmissionDependencies | null =
    null;
  try {
    const optionKeys = ["dependencies", "enabled", "kill_switch_engaged"];
    const optionKeysWithCounters = copyArray(optionKeys);
    arrayPush(optionKeysWithCounters, "counters");
    if (
      !exactKeys(input, optionKeys) &&
      !exactKeys(input, optionKeysWithCounters)
    ) {
      throw new Error("binding_admission_options_shape_conflicting");
    }
    const countersInput = ownDataValue(input, "counters");
    if (
      countersInput.present &&
      (!isRecord(countersInput.value) ||
        !exactKeys(
          countersInput.value,
          intrinsicObjectKeys(emptyCounters()),
        ) ||
        arraySome(intrinsicObjectKeys(emptyCounters()), (key) => {
          const observed = ownDataValue(countersInput.value as object, key);
          return (
            !observed.present ||
            typeof observed.value !== "number" ||
            !intrinsicNumberIsSafeInteger(observed.value) ||
            observed.value < 0
          );
        }))
    ) {
      throw new Error("binding_admission_counter_shape_conflicting");
    }
    const dependenciesInput = ownDataValue(input, "dependencies");
    if (!dependenciesInput.present) {
      throw new Error("binding_admission_dependencies_missing");
    }
    dependencies = snapshotDependencies(dependenciesInput.value);
  } catch {
    dependencies = null;
  }
  if (!dependencies) {
    return publish({
      enabled: true as const,
      status: "unavailable" as const,
      replay: null,
      reason_codes: ["binding_admission_dependencies_missing_or_invalid"],
      ...safety,
    }, null);
  }
  const snapshotRequest = (
    value: unknown,
  ): CanonicalBindingBackedReplayRequest | null => {
    const snapshot =
      snapshotRuntimeValue<CanonicalBindingBackedReplayRequest>(value);
    return snapshot && structuralRequestReasons(snapshot).length === 0
      ? snapshot
      : null;
  };
  const snapshotResult = (
    value: unknown,
  ): CanonicalBindingBackedReplayResult | null =>
    snapshotRuntimeValue<CanonicalBindingBackedReplayResult>(value);
  const intrinsicDriftFallback = downstreamExecutionFailure(
    {
      invalid_binding_backed_replay_request: true,
    } as unknown as CanonicalBindingBackedReplayRequest,
    emptyCounters(),
    "binding_backed_replay_downstream_intrinsic_drift",
  );
  const replay = (requestValue: CanonicalBindingBackedReplayRequest) => {
    if (!downstreamIntrinsicSurfacesIntact()) {
      return intrinsicDriftFallback;
    }
    const request = snapshotRequest(requestValue);
    const executableRequest =
      request ??
      ({
        invalid_binding_backed_replay_request: true,
      } as unknown as CanonicalBindingBackedReplayRequest);
    try {
      return execute({
        request: executableRequest,
        dependencies,
        counters,
        intrinsicDriftFallback,
      });
    } catch {
      return downstreamExecutionFailure(
        executableRequest,
        counters,
        "binding_backed_replay_downstream_execution_failed",
      );
    }
  };
  return publish({
    enabled: true as const,
    status: "ready" as const,
    replay,
    ...safety,
  }, { replay, snapshot_request: snapshotRequest, snapshot_result: snapshotResult });
}

export function verifyCanonicalBindingBackedImprovementReplayResult(input: {
  request: CanonicalBindingBackedReplayRequest;
  result: CanonicalBindingBackedReplayResult;
  harness: object;
}) {
  try {
    if (!isRecord(input) || !exactKeys(input, [
      "harness",
      "request",
      "result",
    ])) {
      throw new Error("binding_backed_replay_verifier_input_conflicting");
    }
    const harnessInput = ownDataValue(input, "harness");
    const requestInput = ownDataValue(input, "request");
    const resultInput = ownDataValue(input, "result");
    if (
      !harnessInput.present ||
      !requestInput.present ||
      !resultInput.present ||
      !harnessInput.value ||
      typeof harnessInput.value !== "object"
    ) {
      throw new Error("binding_backed_replay_verifier_input_conflicting");
    }
    const authority = weakMapGet(
      canonicalBindingBackedReplayAuthorities,
      harnessInput.value,
    );
    if (!authority) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: [
          authority === null
            ? "binding_backed_replay_rebuild_unavailable"
            : "binding_backed_replay_harness_unrecognized",
        ],
      });
    }
    const request = authority.snapshot_request(requestInput.value);
    const result = authority.snapshot_result(resultInput.value);
    if (!request || !result) {
      throw new Error("binding_backed_replay_verifier_shape_conflicting");
    }
    const canonicalResult = authority.replay(request);
    const valid = exact(canonicalResult, result);
    return deepFreeze({
      valid,
      canonical_result: valid ? canonicalResult : null,
      reason_codes: valid
        ? []
        : ["canonical_binding_backed_replay_result_tampered"],
    });
  } catch {
    return deepFreeze({
      valid: false,
      canonical_result: null,
      reason_codes: [
        "canonical_binding_backed_replay_result_tampered",
      ],
    });
  }
}

export function canonicalBindingBackedReplayDigest(value: unknown) {
  return digest(value);
}
