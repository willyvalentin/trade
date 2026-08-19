import "server-only";

import { createHash as nodeCreateHash } from "node:crypto";
import { types as nodeTypes } from "node:util";

import {
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_READBACK_VERSION,
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
  runCanonicalLosslessImmutableByteSnapshot as runSnapshot,
} from "@/lib/server/canonical-lossless-immutable-byte-snapshot";

const intrinsicArrayIsArray = Array.isArray;
const intrinsicArrayPop = Array.prototype.pop;
const intrinsicArrayPush = Array.prototype.push;
const IntrinsicArray = Array;
const intrinsicCreateHash = nodeCreateHash;
const intrinsicJsonStringify = JSON.stringify;
const intrinsicNodeIsProxy = nodeTypes.isProxy;
const intrinsicObjectFreeze = Object.freeze;
const intrinsicObjectGetOwnPropertyDescriptor =
  Object.getOwnPropertyDescriptor;
const intrinsicObjectGetPrototypeOf = Object.getPrototypeOf;
const intrinsicObjectIs = Object.is;
const intrinsicObjectPrototype = Object.prototype;
const intrinsicObjectSetPrototypeOf = Object.setPrototypeOf;
const intrinsicReflectApply = Reflect.apply;
const intrinsicReflectOwnKeys = Reflect.ownKeys;
const intrinsicRunSnapshot = runSnapshot;
const IntrinsicWeakMap = WeakMap;
const intrinsicWeakMapGet = WeakMap.prototype.get;
const intrinsicWeakMapSet = WeakMap.prototype.set;
const IntrinsicWeakSet = WeakSet;
const intrinsicWeakSetAdd = WeakSet.prototype.add;
const intrinsicWeakSetHas = WeakSet.prototype.has;
const intrinsicHashPrototype = intrinsicObjectGetPrototypeOf(
  intrinsicCreateHash("sha256"),
);
const intrinsicHashUpdate = intrinsicHashPrototype.update as (
  value: string,
) => unknown;
const intrinsicHashDigest = intrinsicHashPrototype.digest as (
  encoding: "hex",
) => string;

export const CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_VERSION =
  "canonical_lossless_immutable_byte_snapshot_authority_v2" as const;
export const CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_EVIDENCE_VERSION =
  "canonical_lossless_immutable_byte_snapshot_authority_evidence_v2" as const;
export const CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_RESULT_VERSION =
  "canonical_lossless_immutable_byte_snapshot_authority_result_v2" as const;
export const CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_READBACK_VERSION =
  "canonical_lossless_immutable_byte_snapshot_authority_readback_v2" as const;
export const DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_ENABLED =
  false;
export const DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_KILL_SWITCH =
  true;

function safeArray<T>() {
  const values = new IntrinsicArray<T>();
  intrinsicReflectApply(intrinsicObjectSetPrototypeOf, null, [values, null]);
  return values;
}

function arrayPush<T>(values: T[], value: T) {
  return intrinsicReflectApply(intrinsicArrayPush, values, [value]) as number;
}

function arrayPop<T>(values: T[]) {
  return intrinsicReflectApply(intrinsicArrayPop, values, []) as T | undefined;
}

function reasons(...values: string[]) {
  const copied = safeArray<string>();
  for (let index = 0; index < values.length; index += 1) {
    arrayPush(copied, values[index]);
  }
  return copied;
}

function frozenList<T extends string>(values: readonly T[]) {
  const copied = safeArray<T>();
  for (let index = 0; index < values.length; index += 1) {
    arrayPush(copied, values[index]);
  }
  return intrinsicObjectFreeze(copied) as readonly T[];
}

export const CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_STATUSES =
  frozenList(["verified", "rejected"] as const);
export const CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_READBACK_STATUSES =
  frozenList(["integrity_only", "rejected"] as const);
export const CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_ARTIFACT_ROLES =
  intrinsicObjectFreeze({
    "lib/server/canonical-lossless-immutable-byte-snapshot-authority.ts":
      "implementation",
    "lib/server/canonical-lossless-immutable-byte-snapshot-authority-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666cz-current-main-lossless-immutable-byte-snapshot-authority.spec.ts":
      "focused_tests",
    "docs/action-666cz-current-main-lossless-immutable-byte-snapshot-authority.md":
      "contract_documentation",
    "docs/action-666cz-golden-lossless-immutable-byte-snapshot-authority-report.json":
      "synthetic_golden_report",
  } as const);

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

export type CanonicalLosslessImmutableByteSnapshotAuthorityCounters = {
  request_reads: number;
  predecessor_executions: number;
  predecessor_rebuilds: number;
  private_authority_checks: number;
  private_results_registered: number;
  readback_projections: number;
  digest_operations: number;
};

export type CanonicalLosslessImmutableByteSnapshotAuthorityEvidence = {
  evidence_version: typeof CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_EVIDENCE_VERSION;
  authority_version: typeof CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_VERSION;
  status: "verified";
  provenance_verified: true;
  provenance_scope: "current_process_only";
  trusted: true;
  admitted: false;
  source_snapshot_version: typeof CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION;
  source_readback_version: typeof CANONICAL_LOSSLESS_IMMUTABLE_BYTE_READBACK_VERSION;
  source_raw_byte_sha256: string;
  source_raw_byte_observation_digest: string;
  source_terminal_identity: string;
  source_readback_digest: string;
  content_identity_claimed: true;
  reason_codes: string[];
  evidence_digest_algorithm: "sha256_canonical_json_v1";
  evidence_digest: string;
} & typeof safety;

export type CanonicalLosslessImmutableByteSnapshotAuthorityReadback = {
  readback_version: typeof CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_READBACK_VERSION;
  status: "integrity_only" | "rejected";
  source_snapshot_version: typeof CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION;
  source_readback_version:
    | typeof CANONICAL_LOSSLESS_IMMUTABLE_BYTE_READBACK_VERSION
    | null;
  source_raw_byte_observation_digest: string | null;
  source_terminal_identity: string | null;
  source_readback_digest: string | null;
  integrity_verified: boolean;
  provenance_verified: false;
  verifier_authority_granted: false;
  trusted: false;
  admitted: false;
  content_identity_claimed: boolean;
  reason_codes: string[];
  readback_digest_algorithm: "sha256_canonical_json_v1";
  readback_digest: string;
} & typeof safety;

export type CanonicalLosslessImmutableByteSnapshotAuthorityResult = {
  result_version: typeof CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_RESULT_VERSION;
  status: "verified" | "rejected";
  source_snapshot_verified: boolean;
  runtime_authority_status: "provenance_verified" | "none";
  serialized_authority_status: "integrity_only" | "none";
  evidence: CanonicalLosslessImmutableByteSnapshotAuthorityEvidence | null;
  public_readback: CanonicalLosslessImmutableByteSnapshotAuthorityReadback;
  content_identity_claimed: boolean;
  reason_codes: string[];
  result_digest_algorithm: "sha256_canonical_json_v1";
  result_digest: string;
} & typeof safety;

type HarnessAuthority = {
  session: object;
  rebuild: (request: unknown) => CanonicalLosslessImmutableByteSnapshotAuthorityResult;
};

type ResultRecord = { session: object };

const harnessAuthorities = new IntrinsicWeakMap<
  object,
  HarnessAuthority | null
>();
const resultRecords = new IntrinsicWeakMap<object, ResultRecord>();

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

function isProxy(value: object) {
  return intrinsicReflectApply(intrinsicNodeIsProxy, nodeTypes, [
    value,
  ]) as boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  try {
    if (isProxy(value)) return false;
    const prototype = intrinsicObjectGetPrototypeOf(value);
    return prototype === intrinsicObjectPrototype || prototype === null;
  } catch {
    return false;
  }
}

function exactDataKeys(value: object, expected: readonly string[]) {
  try {
    if (isProxy(value)) return false;
    const prototype = intrinsicObjectGetPrototypeOf(value);
    if (prototype !== intrinsicObjectPrototype && prototype !== null) {
      return false;
    }
    const keys = intrinsicReflectOwnKeys(value);
    if (keys.length !== expected.length) return false;
    for (let index = 0; index < keys.length; index += 1) {
      if (keys[index] !== expected[index]) return false;
      const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
        value,
        keys[index],
      );
      if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

function ownDataValue(value: object, key: PropertyKey) {
  try {
    const descriptor = intrinsicObjectGetOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
      return { present: false as const, value: undefined };
    }
    return { present: true as const, value: descriptor.value as unknown };
  } catch {
    return { present: false as const, value: undefined };
  }
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  const pending = safeArray<object>();
  arrayPush(pending, value);
  const seen = new IntrinsicWeakSet<object>();
  while (pending.length > 0) {
    const current = arrayPop(pending)!;
    if (
      intrinsicReflectApply(intrinsicWeakSetHas, seen, [current]) as boolean
    ) {
      continue;
    }
    intrinsicReflectApply(intrinsicWeakSetAdd, seen, [current]);
    const keys = intrinsicReflectOwnKeys(current);
    for (let index = 0; index < keys.length; index += 1) {
      const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
        current,
        keys[index],
      );
      if (
        descriptor &&
        "value" in descriptor &&
        descriptor.value !== null &&
        typeof descriptor.value === "object"
      ) {
        arrayPush(pending, descriptor.value);
      }
    }
    intrinsicObjectFreeze(current);
  }
  return value;
}

function canonicalJson(value: unknown): string {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    const serialized = intrinsicJsonStringify(value);
    if (serialized === undefined) throw new Error("unsupported_json_value");
    return serialized;
  }
  if (intrinsicArrayIsArray(value)) {
    let serialized = "[";
    for (let index = 0; index < value.length; index += 1) {
      const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
        value,
        `${index}`,
      );
      if (!descriptor || !("value" in descriptor)) {
        throw new Error("non_canonical_json_array");
      }
      if (index > 0) serialized += ",";
      serialized += canonicalJson(descriptor.value);
    }
    return `${serialized}]`;
  }
  if (value !== null && typeof value === "object") {
    const keys = intrinsicReflectOwnKeys(value);
    let serialized = "{";
    let emitted = 0;
    for (let index = 0; index < keys.length; index += 1) {
      const key = keys[index];
      if (typeof key !== "string") throw new Error("symbol_key_rejected");
      const descriptor = intrinsicObjectGetOwnPropertyDescriptor(value, key);
      if (!descriptor || !descriptor.enumerable) continue;
      if (!("value" in descriptor)) throw new Error("accessor_rejected");
      if (emitted > 0) serialized += ",";
      serialized += `${intrinsicJsonStringify(key)}:${canonicalJson(
        descriptor.value,
      )}`;
      emitted += 1;
    }
    return `${serialized}}`;
  }
  throw new Error("unsupported_json_value");
}

function exactDeepEqual(first: unknown, second: unknown) {
  const pending = safeArray<{ first: unknown; second: unknown }>();
  arrayPush(pending, { first, second });
  while (pending.length > 0) {
    const pair = arrayPop(pending)!;
    if (intrinsicObjectIs(pair.first, pair.second)) continue;
    if (
      pair.first === null ||
      pair.second === null ||
      typeof pair.first !== "object" ||
      typeof pair.second !== "object" ||
      isProxy(pair.first) ||
      isProxy(pair.second)
    ) {
      return false;
    }
    if (
      intrinsicObjectGetPrototypeOf(pair.first) !==
      intrinsicObjectGetPrototypeOf(pair.second)
    ) {
      return false;
    }
    const firstKeys = intrinsicReflectOwnKeys(pair.first);
    const secondKeys = intrinsicReflectOwnKeys(pair.second);
    if (firstKeys.length !== secondKeys.length) return false;
    for (let index = 0; index < firstKeys.length; index += 1) {
      if (firstKeys[index] !== secondKeys[index]) return false;
      const firstDescriptor = intrinsicObjectGetOwnPropertyDescriptor(
        pair.first,
        firstKeys[index],
      );
      const secondDescriptor = intrinsicObjectGetOwnPropertyDescriptor(
        pair.second,
        secondKeys[index],
      );
      if (!firstDescriptor || !secondDescriptor) return false;
      if (
        firstDescriptor.enumerable !== secondDescriptor.enumerable ||
        firstDescriptor.configurable !== secondDescriptor.configurable ||
        ("value" in firstDescriptor) !== ("value" in secondDescriptor)
      ) {
        return false;
      }
      if ("value" in firstDescriptor && "value" in secondDescriptor) {
        if (firstDescriptor.writable !== secondDescriptor.writable) return false;
        arrayPush(pending, {
          first: firstDescriptor.value,
          second: secondDescriptor.value,
        });
      } else if (
        !("value" in firstDescriptor) &&
        !("value" in secondDescriptor) &&
        (firstDescriptor.get !== secondDescriptor.get ||
          firstDescriptor.set !== secondDescriptor.set)
      ) {
        return false;
      }
    }
  }
  return true;
}

function sha256(value: string) {
  const hash = intrinsicCreateHash("sha256");
  intrinsicReflectApply(intrinsicHashUpdate, hash, [value]);
  return intrinsicReflectApply(intrinsicHashDigest, hash, ["hex"]) as string;
}

function emptyCounters(): CanonicalLosslessImmutableByteSnapshotAuthorityCounters {
  return {
    request_reads: 0,
    predecessor_executions: 0,
    predecessor_rebuilds: 0,
    private_authority_checks: 0,
    private_results_registered: 0,
    readback_projections: 0,
    digest_operations: 0,
  };
}

function countersSnapshot(
  counters: CanonicalLosslessImmutableByteSnapshotAuthorityCounters,
) {
  return deepFreeze({ ...counters });
}

function digest(
  value: unknown,
  counters: CanonicalLosslessImmutableByteSnapshotAuthorityCounters,
) {
  counters.digest_operations += 1;
  return sha256(canonicalJson(value));
}

function buildReadback(
  input: {
    status: "integrity_only" | "rejected";
    source_readback_version:
      | typeof CANONICAL_LOSSLESS_IMMUTABLE_BYTE_READBACK_VERSION
      | null;
    source_raw_byte_observation_digest: string | null;
    source_terminal_identity: string | null;
    source_readback_digest: string | null;
    integrity_verified: boolean;
    content_identity_claimed: boolean;
    reason_codes: string[];
  },
  counters: CanonicalLosslessImmutableByteSnapshotAuthorityCounters,
) {
  const projection = {
    readback_version:
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_READBACK_VERSION,
    status: input.status,
    source_snapshot_version:
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
    source_readback_version: input.source_readback_version,
    source_raw_byte_observation_digest:
      input.source_raw_byte_observation_digest,
    source_terminal_identity: input.source_terminal_identity,
    source_readback_digest: input.source_readback_digest,
    integrity_verified: input.integrity_verified,
    provenance_verified: false as const,
    verifier_authority_granted: false as const,
    trusted: false as const,
    admitted: false as const,
    content_identity_claimed: input.content_identity_claimed,
    reason_codes: input.reason_codes,
    readback_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...projection,
    readback_digest: digest(projection, counters),
  });
}

function rejectedResult(
  reason: string,
  counters: CanonicalLosslessImmutableByteSnapshotAuthorityCounters,
) {
  const reasonCodes = reasons(reason);
  const publicReadback = buildReadback(
    {
      status: "rejected",
      source_readback_version: null,
      source_raw_byte_observation_digest: null,
      source_terminal_identity: null,
      source_readback_digest: null,
      integrity_verified: false,
      content_identity_claimed: false,
      reason_codes: reasonCodes,
    },
    counters,
  );
  const projection = {
    result_version:
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_RESULT_VERSION,
    status: "rejected" as const,
    source_snapshot_verified: false,
    runtime_authority_status: "none" as const,
    serialized_authority_status: "none" as const,
    evidence: null,
    public_readback: publicReadback,
    content_identity_claimed: false,
    reason_codes: reasonCodes,
    result_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...projection,
    result_digest: digest(projection, counters),
  });
}

function execute(
  request: unknown,
  counters: CanonicalLosslessImmutableByteSnapshotAuthorityCounters,
) {
  counters.request_reads += 1;
  counters.predecessor_executions += 1;
  const execution = intrinsicRunSnapshot(request, true, false);
  const terminal = execution.terminal_result;
  if (
    execution.status !== "completed" ||
    terminal === null ||
    terminal.terminal_status !== "integrity_only" ||
    terminal.integrity_verified !== true ||
    terminal.provenance_verified !== false ||
    terminal.trusted !== false ||
    terminal.admitted !== false ||
    terminal.raw_byte_observation === null
  ) {
    return rejectedResult("snapshot_authority_source_not_verified", counters);
  }
  counters.private_authority_checks += 1;
  const evidenceProjection = {
    evidence_version:
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_EVIDENCE_VERSION,
    authority_version:
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_VERSION,
    status: "verified" as const,
    provenance_verified: true as const,
    provenance_scope: "current_process_only" as const,
    trusted: true as const,
    admitted: false as const,
    source_snapshot_version:
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
    source_readback_version:
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_READBACK_VERSION,
    source_raw_byte_sha256: terminal.raw_byte_observation.raw_byte_sha256,
    source_raw_byte_observation_digest:
      terminal.raw_byte_observation.observation_digest,
    source_terminal_identity: terminal.terminal_identity,
    source_readback_digest: terminal.readback_digest,
    content_identity_claimed: true as const,
    reason_codes: reasons(),
    evidence_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  const evidence = deepFreeze({
    ...evidenceProjection,
    evidence_digest: digest(evidenceProjection, counters),
  });
  const publicReadback = buildReadback(
    {
      status: "integrity_only",
      source_readback_version:
        CANONICAL_LOSSLESS_IMMUTABLE_BYTE_READBACK_VERSION,
      source_raw_byte_observation_digest:
        terminal.raw_byte_observation.observation_digest,
      source_terminal_identity: terminal.terminal_identity,
      source_readback_digest: terminal.readback_digest,
      integrity_verified: true,
      content_identity_claimed: true,
      reason_codes: reasons(),
    },
    counters,
  );
  const projection = {
    result_version:
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_RESULT_VERSION,
    status: "verified" as const,
    source_snapshot_verified: true,
    runtime_authority_status: "provenance_verified" as const,
    serialized_authority_status: "integrity_only" as const,
    evidence,
    public_readback: publicReadback,
    content_identity_claimed: true,
    reason_codes: reasons(),
    result_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...projection,
    result_digest: digest(projection, counters),
  });
}

function registerResult(
  result: CanonicalLosslessImmutableByteSnapshotAuthorityResult,
  session: object,
  counters: CanonicalLosslessImmutableByteSnapshotAuthorityCounters,
) {
  weakMapSet(resultRecords, result, { session });
  counters.private_results_registered += 1;
  return result;
}

export function createCanonicalLosslessImmutableByteSnapshotAuthorityHarness(
  input: unknown = {},
) {
  const counters = emptyCounters();
  const publish = <T extends object>(
    shell: T,
    authority: HarnessAuthority | null,
  ) => {
    const harness = deepFreeze({
      ...shell,
      get counters() {
        return countersSnapshot(counters);
      },
    });
    weakMapSet(harnessAuthorities, harness, authority);
    return harness;
  };
  const options =
    isRecord(input) &&
    exactDataKeys(input, ["enabled", "kill_switch_engaged"])
      ? input
      : null;
  const enabled = options ? ownDataValue(options, "enabled") : null;
  const killed = options
    ? ownDataValue(options, "kill_switch_engaged")
    : null;
  if (!enabled?.present || enabled.value !== true) {
    return publish(
      {
        enabled: false as const,
        status: "disabled" as const,
        observe: null,
        readback: null,
        ...safety,
      },
      null,
    );
  }
  if (!killed?.present || killed.value !== false) {
    return publish(
      {
        enabled: true as const,
        status: "kill_switch_engaged" as const,
        observe: null,
        readback: null,
        ...safety,
      },
      null,
    );
  }
  const session = intrinsicObjectFreeze({});
  const run = (
    request: unknown,
    runCounters: CanonicalLosslessImmutableByteSnapshotAuthorityCounters,
  ) => {
    try {
      return execute(request, runCounters);
    } catch {
      return rejectedResult("snapshot_authority_execution_failed", runCounters);
    }
  };
  const observe = (request: unknown) =>
    registerResult(run(request, counters), session, counters);
  const rebuild = (request: unknown) => {
    counters.predecessor_rebuilds += 1;
    return run(request, emptyCounters());
  };
  const readback = (candidate: unknown) => {
    try {
      if (
        candidate === null ||
        (typeof candidate !== "object" && typeof candidate !== "function")
      ) {
        throw new Error("snapshot_authority_readback_invalid");
      }
      const record = weakMapGet(resultRecords, candidate as object);
      if (!record || record.session !== session || !isRecord(candidate)) {
        throw new Error("snapshot_authority_readback_invalid");
      }
      const projection = ownDataValue(candidate, "public_readback");
      if (!projection.present || !isRecord(projection.value)) {
        throw new Error("snapshot_authority_readback_invalid");
      }
      counters.readback_projections += 1;
      return projection.value;
    } catch {
      return buildReadback(
        {
          status: "rejected",
          source_readback_version: null,
          source_raw_byte_observation_digest: null,
          source_terminal_identity: null,
          source_readback_digest: null,
          integrity_verified: false,
          content_identity_claimed: false,
          reason_codes: reasons("snapshot_authority_readback_invalid"),
        },
        counters,
      );
    }
  };
  return publish(
    {
      enabled: true as const,
      status: "ready" as const,
      observe,
      readback,
      ...safety,
    },
    { session, rebuild },
  );
}

export function verifyCanonicalLosslessImmutableByteSnapshotAuthorityResult(
  input: unknown,
) {
  try {
    if (
      !isRecord(input) ||
      !exactDataKeys(input, ["harness", "request", "result"])
    ) {
      throw new Error("snapshot_authority_verifier_input_invalid");
    }
    const harness = ownDataValue(input, "harness");
    const request = ownDataValue(input, "request");
    const provided = ownDataValue(input, "result");
    if (
      !harness.present ||
      !request.present ||
      !provided.present ||
      harness.value === null ||
      typeof harness.value !== "object"
    ) {
      throw new Error("snapshot_authority_verifier_input_invalid");
    }
    const authority = weakMapGet(harnessAuthorities, harness.value);
    if (!authority) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: reasons(
          authority === null
            ? "snapshot_authority_rebuild_unavailable"
            : "snapshot_authority_harness_unrecognized",
        ),
      });
    }
    if (
      provided.value === null ||
      (typeof provided.value !== "object" &&
        typeof provided.value !== "function")
    ) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: reasons("snapshot_authority_result_unrecognized"),
      });
    }
    const record = weakMapGet(resultRecords, provided.value as object);
    if (!record) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: reasons("snapshot_authority_result_unrecognized"),
      });
    }
    if (record.session !== authority.session) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: reasons("snapshot_authority_originating_harness_mismatch"),
      });
    }
    const canonical = authority.rebuild(request.value);
    const valid =
      canonical.status === "verified" &&
      exactDeepEqual(canonical, provided.value);
    return deepFreeze({
      valid,
      canonical_result: canonical,
      reason_codes: valid
        ? reasons()
        : reasons("snapshot_authority_result_rebuild_mismatch"),
    });
  } catch {
    return deepFreeze({
      valid: false,
      canonical_result: null,
      reason_codes: reasons("snapshot_authority_verifier_input_invalid"),
    });
  }
}
