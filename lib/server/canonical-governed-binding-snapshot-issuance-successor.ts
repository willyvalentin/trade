import "server-only";

import { createHash } from "node:crypto";
import { types as nodeTypes } from "node:util";

import {
  CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_REQUEST_VERSION,
  type CanonicalCompletedImprovementCaptureAuthority,
} from "@/lib/server/canonical-completed-improvement-evidence-capture";
import {
  CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_REQUEST_VERSION,
} from "@/lib/server/canonical-governed-improvement-end-to-end-replay";
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

const intrinsicStructuredClone = structuredClone;
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
const intrinsicObjectPrototype = Object.prototype;
const intrinsicArrayIsArray = Array.isArray;
const intrinsicArrayEvery = Array.prototype.every;
const intrinsicArrayJoin = Array.prototype.join;
const intrinsicArrayMap = Array.prototype.map;
const intrinsicArrayPop = Array.prototype.pop;
const intrinsicArrayPush = Array.prototype.push;
const intrinsicArraySome = Array.prototype.some;
const intrinsicArraySort = Array.prototype.sort;
const IntrinsicArray = Array;
const IntrinsicSet = Set;
const intrinsicSetAdd = Set.prototype.add;
const intrinsicSetHas = Set.prototype.has;
const IntrinsicWeakMap = WeakMap;
const intrinsicWeakMapGet = WeakMap.prototype.get;
const intrinsicWeakMapSet = WeakMap.prototype.set;
const IntrinsicWeakSet = WeakSet;
const intrinsicWeakSetAdd = WeakSet.prototype.add;
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
const intrinsicMathTrunc = Math.trunc;
const intrinsicBigIntToString = BigInt.prototype.toString;
const intrinsicString = String;
const intrinsicStringCharCodeAt = String.prototype.charCodeAt;
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

function arrayMap<T, U>(
  values: readonly T[],
  mapper: (value: T, index: number, values: readonly T[]) => U,
) {
  return intrinsicReflectApply(intrinsicArrayMap, values, [
    mapper,
  ]) as U[];
}

function arrayJoin(values: readonly string[], separator: string) {
  return intrinsicReflectApply(intrinsicArrayJoin, values, [
    separator,
  ]) as string;
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
  intrinsicObjectFreeze({
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
  intrinsicObjectFreeze({
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
  digest(
    CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_BUDGETS,
  );

const explicitInstantPattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/;

type CanonicalJsonFrame =
  | { kind: "token"; value: string }
  | { kind: "value"; value: unknown };

function canonicalSnapshotJsonBytes(
  snapshot: CanonicalExternalImprovementBindingSnapshot,
) {
  const output: string[] = [];
  const pending: CanonicalJsonFrame[] = [
    { kind: "value", value: snapshot },
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
        throw new Error("governed_issuance_snapshot_json_invalid");
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
  expected_authority_identity: string;
  expected_authority_digest: string;
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
};

const recognizedAuthorities = new IntrinsicWeakSet<object>();
type IssuanceHarnessAuthority = {
  rebuild: (
    request: unknown,
  ) => CanonicalGovernedBindingSnapshotIssuanceResult;
};
const issuanceHarnessAuthorities =
  new IntrinsicWeakMap<object, IssuanceHarnessAuthority | null>();

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
      if (entry[1] !== undefined) arrayPush(entries, entry);
    }
    arraySort(
      entries,
      ([first], [second]) => compareCanonicalStrings(first, second),
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

function digest(
  value: unknown,
  counters?: CanonicalGovernedBindingSnapshotIssuanceCounters,
) {
  if (counters) counters.digest_operations += 1;
  return hardenedCanonicalDigest(value);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    const pending: object[] = [value];
    const seen = new IntrinsicWeakSet<object>();
    while (pending.length > 0) {
      const current = arrayPop(pending)!;
      if (weakSetHas(seen, current)) continue;
      weakSetAdd(seen, current);
      const nestedValues = intrinsicObjectValues(
        current as Record<string, unknown>,
      );
      for (let index = 0; index < nestedValues.length; index += 1) {
        const nested = nestedValues[index];
        if (nested !== null && typeof nested === "object") {
          arrayPush(pending, nested);
        }
      }
      if (!intrinsicObjectIsFrozen(current)) intrinsicObjectFreeze(current);
    }
  }
  return value;
}

function exactKeys(value: Record<string, unknown>, expected: string[]) {
  if (isProxy(value)) return false;
  const actual = arraySort(intrinsicReflectOwnKeys(value), (first, second) =>
    compareCanonicalStrings(intrinsicString(first), intrinsicString(second)),
  );
  const wanted = arraySort(arrayMap(expected, (key) => key));
  return actual.length === wanted.length && arrayEvery(actual, (key, index) => {
    if (typeof key !== "string" || key !== wanted[index]) return false;
    const descriptor = intrinsicObjectGetOwnPropertyDescriptor(value, key);
    return !!(
      descriptor &&
      "value" in descriptor &&
      descriptor.enumerable
    );
  });
}

function optionalKeys(value: Record<string, unknown>, allowed: string[]) {
  if (isProxy(value)) return false;
  const keys = intrinsicReflectOwnKeys(value);
  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    if (
      typeof key !== "string" ||
      !arraySome(allowed, (allowedKey) => allowedKey === key)
    ) {
      return false;
    }
    const descriptor = intrinsicObjectGetOwnPropertyDescriptor(value, key);
    if (!(descriptor && "value" in descriptor && descriptor.enumerable)) {
      return false;
    }
  }
  return true;
}

function ownDataValue(value: object, key: PropertyKey) {
  try {
    const descriptor = intrinsicObjectGetOwnPropertyDescriptor(value, key);
    return descriptor && "value" in descriptor && descriptor.enumerable
      ? { present: true as const, value: descriptor.value }
      : { present: false as const, value: undefined };
  } catch {
    return { present: false as const, value: undefined };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!(
    value !== null &&
    typeof value === "object" &&
    !intrinsicArrayIsArray(value) &&
    !isProxy(value) &&
    intrinsicObjectGetPrototypeOf(value) === intrinsicObjectPrototype
  );
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

const counterKeys = [
  "authority_reads",
  "authority_verifications",
  "bd_replay_executions",
  "clones",
  "digest_operations",
  "entry_lookups",
  "independent_rebuilds",
  "request_reads",
  "snapshot_constructions",
  "store_constructions",
] as const;

function validCallerCounters(value: unknown) {
  if (!isRecord(value) || !exactKeys(value, [...counterKeys])) return false;
  return arrayEvery(counterKeys, (key) =>
    typeof value[key] === "number" &&
    intrinsicNumberIsSafeInteger(value[key]) &&
    value[key] >= 0,
  );
}

function snapshotAxOwnerDependency(
  value: unknown,
): CanonicalImprovementBindingOwnerDependency | null {
  if (
    !isRecord(value) ||
    !exactKeys(value, [
      "expected_authority_digest",
      "expected_authority_identity",
      "owner_boundary_identity",
      "owner_boundary_version",
      "read_expected_authority",
      "read_verified_snapshot",
    ]) ||
    value.owner_boundary_version !==
      CANONICAL_IMPROVEMENT_BINDING_OWNER_BOUNDARY_VERSION ||
    !validIdentity(value.owner_boundary_identity) ||
    !validIdentity(value.expected_authority_identity) ||
    !validFullSha(value.expected_authority_digest)
  ) {
    return null;
  }
  const readAuthority = ownDataValue(value, "read_expected_authority");
  const readSnapshot = ownDataValue(value, "read_verified_snapshot");
  if (
    !readAuthority.present ||
    typeof readAuthority.value !== "function" ||
    !readSnapshot.present ||
    typeof readSnapshot.value !== "function"
  ) {
    return null;
  }
  return intrinsicObjectFreeze({
    owner_boundary_version:
      CANONICAL_IMPROVEMENT_BINDING_OWNER_BOUNDARY_VERSION,
    owner_boundary_identity: value.owner_boundary_identity,
    expected_authority_identity: value.expected_authority_identity,
    expected_authority_digest: value.expected_authority_digest,
    read_expected_authority: () =>
      intrinsicReflectApply(
        readAuthority.value as () => unknown,
        value,
        [],
      ) as ReturnType<
        CanonicalImprovementBindingOwnerDependency["read_expected_authority"]
      >,
    read_verified_snapshot: () =>
      intrinsicReflectApply(
        readSnapshot.value as () => unknown,
        value,
        [],
      ),
  });
}

function snapshotIssuanceDependencies(
  value: unknown,
): CanonicalGovernedBindingSnapshotIssuanceDependencies | null {
  try {
    if (
      !isRecord(value) ||
      !exactKeys(value, [
        "ax_owner_dependency",
        "capture_authority",
        "issuer_authority_dependency",
      ])
    ) {
      return null;
    }
    const issuer = ownDataValue(value, "issuer_authority_dependency");
    const axOwner = ownDataValue(value, "ax_owner_dependency");
    const captureAuthority = ownDataValue(value, "capture_authority");
    const axOwnerSnapshot = axOwner.present
      ? snapshotAxOwnerDependency(axOwner.value)
      : null;
    if (
      !issuer.present ||
      !axOwner.present ||
      !captureAuthority.present ||
      !isRecord(issuer.value) ||
      !exactKeys(issuer.value, [
        "expected_authority_digest",
        "expected_authority_identity",
        "minimum_publication_epoch",
        "owner_boundary_identity",
        "owner_boundary_version",
        "read_expected_authority",
      ]) ||
      issuer.value.owner_boundary_version !==
        "canonical_governed_binding_snapshot_issuer_owner_boundary_v3" ||
      !validIdentity(issuer.value.owner_boundary_identity) ||
      !validIdentity(issuer.value.expected_authority_identity) ||
      !validFullSha(issuer.value.expected_authority_digest) ||
      typeof issuer.value.minimum_publication_epoch !== "number" ||
      !intrinsicNumberIsSafeInteger(issuer.value.minimum_publication_epoch) ||
      issuer.value.minimum_publication_epoch < 1 ||
      !axOwnerSnapshot ||
      !isRecord(captureAuthority.value)
    ) {
      return null;
    }
    const readAuthority = ownDataValue(
      issuer.value,
      "read_expected_authority",
    );
    if (!readAuthority.present || typeof readAuthority.value !== "function") {
      return null;
    }
    const issuerSnapshot = intrinsicObjectFreeze({
      owner_boundary_version:
        "canonical_governed_binding_snapshot_issuer_owner_boundary_v3" as const,
      owner_boundary_identity: issuer.value.owner_boundary_identity as string,
      expected_authority_identity:
        issuer.value.expected_authority_identity as string,
      expected_authority_digest:
        issuer.value.expected_authority_digest as string,
      minimum_publication_epoch:
        issuer.value.minimum_publication_epoch as number,
      read_expected_authority: () =>
        intrinsicReflectApply(readAuthority.value as () => unknown, issuer.value, []) as
          CanonicalGovernedBindingSnapshotIssuerAuthority,
    });
    return intrinsicObjectFreeze({
      issuer_authority_dependency: issuerSnapshot,
      ax_owner_dependency: axOwnerSnapshot,
      capture_authority:
        captureAuthority.value as CanonicalCompletedImprovementCaptureAuthority,
    });
  } catch {
    return null;
  }
}

function bindingPlanDigest(plan: BindingPlanItem[]) {
  const entries = arraySort(
    arrayMap(plan, (entry) => ({ ...entry })),
    (first, second) =>
      compareCanonicalStrings(
        `${first.entry_type}:${first.bound_identity_type}:${first.bound_identity}`,
        `${second.entry_type}:${second.bound_identity_type}:${second.bound_identity}`,
      ),
  );
  return digest({
    inventory_version: "canonical_governed_binding_plan_inventory_v3",
    entries: arrayMap(entries, (entry) => ({
        entry_type: entry.entry_type,
        bound_identity_type: entry.bound_identity_type,
        bound_identity: entry.bound_identity,
        expected_binding_digest: entry.expected_binding_digest,
        source_evidence_namespace: entry.source_evidence_namespace,
        source_section_digest: entry.source_section_digest,
      })),
  });
}

function isCanonicalIssuanceScopeRequest(
  value: unknown,
): value is CanonicalGovernedBindingSnapshotIssuanceRequest {
  if (
    !isRecord(value) ||
    !exactKeys(value, [
      "binding_backed_replay_request",
      "issuance_identity",
      "request_version",
      "source_namespace",
    ]) ||
    value.request_version !==
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_REQUEST_VERSION ||
    value.source_namespace !==
      "completed_governed_binding_snapshot_issuance" ||
    !validIdentity(value.issuance_identity) ||
    !isRecord(value.binding_backed_replay_request) ||
    !exactKeys(value.binding_backed_replay_request, [
      "admission_identity",
      "end_to_end_request",
      "lookup_as_of",
      "request_version",
      "source_namespace",
    ]) ||
    value.binding_backed_replay_request.request_version !==
      CANONICAL_BINDING_BACKED_REPLAY_REQUEST_VERSION ||
    value.binding_backed_replay_request.source_namespace !==
      "binding_backed_governed_improvement_replay" ||
    !validIdentity(value.binding_backed_replay_request.admission_identity) ||
    !canonicalInstant(value.binding_backed_replay_request.lookup_as_of)
  ) {
    return false;
  }
  const endToEndRequest =
    value.binding_backed_replay_request.end_to_end_request;
  if (
    !isRecord(endToEndRequest) ||
    !exactKeys(endToEndRequest, [
      "completed_capture_request",
      "request_version",
      "source_namespace",
    ]) ||
    endToEndRequest.request_version !==
      CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_REQUEST_VERSION ||
    endToEndRequest.source_namespace !==
      "completed_governed_improvement_replay_input" ||
    !isRecord(endToEndRequest.completed_capture_request) ||
    !exactKeys(endToEndRequest.completed_capture_request, [
      "completed_at",
      "declared_bindings",
      "expected_registry_root_digest",
      "producer_capture_identity",
      "request_version",
      "source_artifact_digests",
      "source_namespace",
      "trusted_input_digest",
      "trusted_input_identity",
      "upstream_sources",
    ]) ||
    endToEndRequest.completed_capture_request.request_version !==
      CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_REQUEST_VERSION ||
    endToEndRequest.completed_capture_request.source_namespace !==
      "completed_improvement_capture_inputs"
  ) {
    return false;
  }
  return validateCanonicalBoundedSnapshotPayload(value).status === "valid";
}

export function canonicalGovernedBindingSnapshotIssuanceSemanticScopeDigest(
  request: CanonicalGovernedBindingSnapshotIssuanceRequest,
) {
  if (!isCanonicalIssuanceScopeRequest(request)) {
    throw new Error("governed_binding_snapshot_issuance_scope_invalid");
  }
  return digest({
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
  if (
    !isRecord(input) ||
    !exactKeys(input, [
      "authority_identity",
      "authority_manifest_digest",
      "authority_root_digest",
      "binding_plan",
      "effective_at",
      "evidence_cutoff",
      "expected_request_identity",
      "external_owner_identity",
      "issued_at",
      "issuer_authority_anchor",
      "issuer_identity",
      "issuer_implementation_version",
      "owner_boundary_identity",
      "predecessor",
      "publication_epoch",
      "publication_sequence",
      "registry_authority_identity",
      "semantic_scope_digest",
    ]) ||
    validateCanonicalBoundedSnapshotPayload(input).status !== "valid"
  ) {
    throw new Error("governed_issuance_authority_invalid");
  }
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
    !validFullSha(input.issuer_authority_anchor) ||
    !validFullSha(input.authority_manifest_digest) ||
    !validFullSha(input.authority_root_digest) ||
    !validFullSha(input.semantic_scope_digest) ||
    !intrinsicNumberIsSafeInteger(input.publication_sequence) ||
    input.publication_sequence < 1 ||
    !intrinsicNumberIsSafeInteger(input.publication_epoch) ||
    input.publication_epoch < 1 ||
    arraySome(instants, (instant) => !instant) ||
    !intrinsicArrayIsArray(input.binding_plan) ||
    !isRecord(input.predecessor) ||
    !exactKeys(input.predecessor, [
      "previous_publication_epoch",
      "previous_publication_sequence",
      "previous_snapshot_digest",
      "state",
    ])
  ) {
    throw new Error("governed_issuance_authority_invalid");
  }
  if (
    instants[1]!.epoch_nanoseconds > instants[0]!.epoch_nanoseconds ||
    instants[2]!.epoch_nanoseconds !== instants[0]!.epoch_nanoseconds
  ) {
    throw new Error("governed_issuance_authority_invalid");
  }
  const bindingPlan = arraySort(
    arrayMap(input.binding_plan, (entry) => ({ ...entry })),
    (first, second) =>
      compareCanonicalStrings(
        `${first.entry_type}:${first.bound_identity_type}:${first.bound_identity}`,
        `${second.entry_type}:${second.bound_identity_type}:${second.bound_identity}`,
      ),
  );
  const uniqueKeys = new IntrinsicSet<string>();
  for (let index = 0; index < bindingPlan.length; index += 1) {
    setAdd(
      uniqueKeys,
      `${bindingPlan[index].entry_type}:${bindingPlan[index].bound_identity_type}:${bindingPlan[index].bound_identity}`,
    );
  }
  if (
    uniqueKeys.size !== bindingPlan.length ||
    arraySome(
      bindingPlan,
      (entry) =>
        !isRecord(entry) ||
        !exactKeys(entry, [
          "bound_identity",
          "bound_identity_type",
          "entry_type",
          "expected_binding_digest",
          "source_evidence_namespace",
          "source_section_digest",
        ]) ||
        !validIdentity(entry.bound_identity) ||
        !validFullSha(entry.expected_binding_digest) ||
        !validFullSha(entry.source_section_digest) ||
        (entry.entry_type === "capture_binding"
          ? entry.bound_identity_type !== "capture" ||
            entry.source_evidence_namespace !==
              "canonical_capture_binding_evidence"
          : entry.entry_type !== "previous_binding" ||
            (entry.bound_identity_type !== "proposal" &&
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
        input.predecessor.previous_snapshot_digest !== null ||
        input.predecessor.previous_publication_sequence !== null ||
        input.predecessor.previous_publication_epoch !== null)) ||
    (!genesis &&
      (input.predecessor.state !== "linked" ||
        !validFullSha(input.predecessor.previous_snapshot_digest) ||
        input.predecessor.previous_publication_sequence !==
          input.publication_sequence - 1 ||
        typeof input.predecessor.previous_publication_epoch !== "number" ||
        !intrinsicNumberIsSafeInteger(
          input.predecessor.previous_publication_epoch,
        ) ||
        input.predecessor.previous_publication_epoch < 1 ||
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
    predecessor: intrinsicStructuredClone(input.predecessor),
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
  weakSetAdd(recognizedAuthorities, authority);
  return authority;
}

function safeTopLevelObservation(value: unknown) {
  const type =
    value === null
      ? "null"
      : intrinsicArrayIsArray(value)
        ? "array"
        : typeof value;
  let identity: string | null = null;
  if (isRecord(value)) {
    const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
      value,
      "issuance_identity",
    );
    if (
      descriptor &&
      "value" in descriptor &&
      descriptor.enumerable &&
      validIdentity(descriptor.value)
    ) {
      identity = descriptor.value;
    }
  }
  return { type, identity };
}

function boundedStructuralDigest(input: {
  top: ReturnType<typeof safeTopLevelObservation>;
  validation: ReturnType<typeof validateCanonicalBoundedSnapshotPayload>;
  stage: "preclone_bounded_validation" | "request_schema";
  reasonCodes: string[];
}) {
  return digest({
    prefix_version: "canonical_bounded_issuance_structural_prefix_v3",
    top_level_type: input.top.type,
    available_issuance_identity: input.top.identity,
    rejection_stage: input.stage,
    reason_codes: uniqueSorted(input.reasonCodes),
    validation_status: input.validation.status,
    first_rejected_path:
      input.validation.status === "valid"
        ? null
        : input.validation.first_rejected_path,
    observed_depth: input.validation.observed_depth,
    observed_nodes: input.validation.observed_nodes,
    observed_own_keys: input.validation.observed_own_keys,
    observed_array_length: input.validation.observed_array_length,
    observed_string_bytes: input.validation.observed_string_bytes,
    observed_total_string_bytes:
      input.validation.observed_total_string_bytes,
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
    bounded_structural_digest: boundedStructuralDigest({
      top,
      validation: input.validation,
      stage: input.stage,
      reasonCodes: input.reasonCodes,
    }),
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
  const observations = arraySort(
    arrayMap(input.observations ?? [], (observation) => observation),
    (first, second) =>
      compareCanonicalStrings(
        `${first.entry_type}:${first.bound_identity_type}:${first.bound_identity}`,
        `${second.entry_type}:${second.bound_identity_type}:${second.bound_identity}`,
      ),
  );
  const observationInventoryDigest = digest(
    {
      inventory_version:
        "canonical_governed_binding_lookup_observation_inventory_v3",
      observations: arrayMap(observations, (observation) => ({
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
    cloned = intrinsicStructuredClone(input.rawRequest);
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
  if (!isCanonicalIssuanceScopeRequest(cloned)) {
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
  let observedAuthority: CanonicalGovernedBindingSnapshotIssuerAuthority;
  try {
    observedAuthority =
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
    !weakSetHas(recognizedAuthorities, observedAuthority) ||
    observedAuthority.authority_identity !==
      input.dependencies.issuer_authority_dependency
        .expected_authority_identity ||
    observedAuthority.authority_digest !==
      input.dependencies.issuer_authority_dependency
        .expected_authority_digest
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
  let authority: CanonicalGovernedBindingSnapshotIssuerAuthority;
  try {
    authority = deepFreeze(intrinsicStructuredClone(observedAuthority));
  } catch {
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
    !isRecord(authority) ||
    !exactKeys(authority, [
      "authority_digest",
      "authority_digest_algorithm",
      "authority_identity",
      "authority_manifest_digest",
      "authority_root_digest",
      "authority_version",
      "binding_plan",
      "binding_plan_digest",
      "effective_at",
      "evidence_cutoff",
      "expected_request_identity",
      "external_owner_identity",
      "issued_at",
      "issuer_authority_anchor",
      "issuer_identity",
      "issuer_implementation_version",
      "owner_boundary_identity",
      "predecessor",
      "publication_epoch",
      "publication_sequence",
      "registry_authority_identity",
      "semantic_scope_digest",
    ]) ||
    validateCanonicalBoundedSnapshotPayload(authority).status !== "valid" ||
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
  const authorityPayload = intrinsicStructuredClone(authority);
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
    effective.epoch_nanoseconds !== issued.epoch_nanoseconds ||
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
    (genesis &&
      (authority.predecessor.state !== "genesis" ||
        authority.predecessor.previous_snapshot_digest !== null ||
        authority.predecessor.previous_publication_sequence !== null ||
        authority.predecessor.previous_publication_epoch !== null)) ||
    (!genesis &&
      (authority.predecessor.state !== "linked" ||
        !validFullSha(authority.predecessor.previous_snapshot_digest) ||
        authority.predecessor.previous_publication_sequence !==
          authority.publication_sequence - 1 ||
        typeof authority.predecessor.previous_publication_epoch !== "number" ||
        !intrinsicNumberIsSafeInteger(
          authority.predecessor.previous_publication_epoch,
        ) ||
        authority.predecessor.previous_publication_epoch < 1 ||
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
  const observations = arrayMap(authority.binding_plan, (plan) => {
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
    arraySome(
      observations,
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
    arraySome(
      observations,
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
  const entries: CanonicalExternalImprovementBindingEntry[] = [];
  for (let index = 0; index < observations.length; index += 1) {
    const observation = observations[index];
    if (observation.observed_status !== "matching") continue;
    let sourceSectionDigest: string | null = null;
    for (
      let planIndex = 0;
      planIndex < authority.binding_plan.length;
      planIndex += 1
    ) {
      const plan = authority.binding_plan[planIndex];
      if (
        plan.entry_type === observation.entry_type &&
        plan.bound_identity === observation.bound_identity
      ) {
        sourceSectionDigest = plan.source_section_digest;
        break;
      }
    }
    if (!sourceSectionDigest) {
      return result({
        status: "conflicting",
        request,
        requestDigest: fullDigest,
        authority,
        observations,
        reasons: ["issuance_binding_plan_projection_conflicting"],
        counters: input.counters,
      });
    }
    arrayPush(
      entries,
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
        source_section_digest: sourceSectionDigest,
        effective_at: authority.evidence_cutoff,
      }),
    );
  }
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
  const counters = emptyCounters();
  const publish = <T extends object>(
    shell: T,
    authority: IssuanceHarnessAuthority | null,
  ) => {
    const harness = intrinsicObjectFreeze({
      ...shell,
      get counters() {
        return deepFreeze(intrinsicStructuredClone(counters));
      },
    });
    weakMapSet(issuanceHarnessAuthorities, harness, authority);
    return harness;
  };
  let inputRecord: Record<string, unknown> | null = null;
  try {
    inputRecord = isRecord(input) && optionalKeys(input, [
      "counters",
      "dependencies",
      "enabled",
      "kill_switch_engaged",
    ])
      ? input
      : null;
  } catch {
    inputRecord = null;
  }
  const enabledInput = inputRecord
    ? ownDataValue(inputRecord, "enabled")
    : { present: false as const, value: undefined };
  const killSwitchInput = inputRecord
    ? ownDataValue(inputRecord, "kill_switch_engaged")
    : { present: false as const, value: undefined };
  const enabled = enabledInput.present && enabledInput.value === true;
  const killSwitchClear =
    killSwitchInput.present && killSwitchInput.value === false;
  if (!enabled || !killSwitchClear) {
    return publish({
      enabled: false as const,
      status: !enabled
        ? ("disabled" as const)
        : ("kill_switch_engaged" as const),
      issue: null,
      ...safety,
    }, null);
  }
  const dependenciesInput = ownDataValue(inputRecord!, "dependencies");
  const callerCounters = ownDataValue(inputRecord!, "counters");
  const dependencies = dependenciesInput.present
    ? snapshotIssuanceDependencies(dependenciesInput.value)
    : null;
  if (
    !dependencies ||
    (callerCounters.present && !validCallerCounters(callerCounters.value)) ||
    dependencies.ax_owner_dependency.owner_boundary_version !==
      CANONICAL_IMPROVEMENT_BINDING_OWNER_BOUNDARY_VERSION
  ) {
    return publish({
      enabled: true as const,
      status: "unavailable" as const,
      issue: null,
      reason_codes: ["issuance_dependencies_missing_or_invalid"],
      ...safety,
    }, null);
  }
  const run = (
    request: unknown,
    runCounters: CanonicalGovernedBindingSnapshotIssuanceCounters,
  ) => {
    try {
      return execute({
        rawRequest: request,
        dependencies,
        counters: runCounters,
      });
    } catch {
      return result({
        status: "incomplete",
        request: null,
        requestDigest: digest({
          failure_version:
            "canonical_governed_binding_issuance_execution_failure_v1",
          reason_code: "issuance_internal_execution_failed",
        }),
        authority: null,
        reasons: ["issuance_internal_execution_failed"],
        counters: runCounters,
      });
    }
  };
  const issue = (request: unknown) => run(request, counters);
  const rebuild = (request: unknown) => run(request, emptyCounters());
  return publish({
    enabled: true as const,
    status: "ready" as const,
    issue,
    ...safety,
  }, { rebuild });
}

export function verifyCanonicalGovernedBindingSnapshotIssuanceResult(input: {
  request: unknown;
  result: CanonicalGovernedBindingSnapshotIssuanceResult;
  harness: object;
}) {
  try {
    if (
      !isRecord(input) ||
      !exactKeys(input, ["harness", "request", "result"])
    ) {
      throw new Error("issuance_verifier_input_invalid");
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
      throw new Error("issuance_verifier_input_invalid");
    }
    const authority = weakMapGet(
      issuanceHarnessAuthorities,
      harnessInput.value,
    );
    if (!authority) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: [
          authority === null
            ? "issuance_rebuild_unavailable"
            : "issuance_harness_unrecognized",
        ],
      });
    }
    if (
      validateCanonicalBoundedSnapshotPayload(requestInput.value).status !==
        "valid" ||
      validateCanonicalBoundedSnapshotPayload(resultInput.value).status !==
        "valid"
    ) {
      throw new Error("issuance_verifier_payload_invalid");
    }
    const request = intrinsicStructuredClone(requestInput.value);
    const result = intrinsicStructuredClone(resultInput.value) as
      CanonicalGovernedBindingSnapshotIssuanceResult;
    const canonicalResult = authority.rebuild(request);
    const valid = digest(canonicalResult) === digest(result);
    return deepFreeze({
      valid,
      canonical_result: valid ? canonicalResult : null,
      reason_codes: valid
        ? []
        : ["governed_binding_snapshot_issuance_result_tampered"],
    });
  } catch {
    return deepFreeze({
      valid: false,
      canonical_result: null,
      reason_codes: ["issuance_verifier_payload_invalid"],
    });
  }
}

export function canonicalGovernedBindingSnapshotIssuanceDigest(
  value: unknown,
) {
  if (validateCanonicalBoundedSnapshotPayload(value).status !== "valid") {
    throw new Error("governed_binding_snapshot_issuance_digest_input_invalid");
  }
  return digest(intrinsicStructuredClone(value));
}
