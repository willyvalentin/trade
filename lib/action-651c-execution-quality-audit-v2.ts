import { types as nodeTypes } from "node:util";

import {
  deepFreezeAction650s,
  hashAction650sCanonicalValue,
} from "@/lib/action-650s-execution-identity";
import type { Action650sPreparedExecution } from "@/lib/action-650s-execution-preparation";
import type { Action650uSimulatedBrokerEvent } from "@/lib/action-650u-confirmed-execution-replay";
import type {
  Action650uManualConfirmationBoundary,
} from "@/lib/action-650u-manual-confirmation";
import {
  canonicalizeAction650uNanosecondInstant,
  compareAction650uInstants,
} from "@/lib/action-650u-temporal-confirmation-policy";
import {
  runAction651aDiagnosticExecutionQualityAudit,
  type Action651aAuditStatus,
  type Action651aConfirmedPriceObservation,
  type Action651aConfirmedPriceProjection,
  type Action651aDiagnosticAuditInput,
  type Action651aDiagnosticAuditResult,
  type Action651aDiagnosticSafety,
  type Action651aFailureKind,
  type Action651aPlannedPriceProjection,
  type Action651aSyntheticFillObservation,
  type Action651aSyntheticFillProjection,
  type Action651aTimingProjection,
} from "@/lib/action-651a-diagnostic-execution-quality-audit";

export const action651cExecutionQualityContractVersion =
  "action_651c_execution_quality_audit_v2" as const;
export const action651cFailureLineagePolicyVersion =
  "action_651c_failure_lineage_policy_v2" as const;
export const action651cSnapshotPolicyVersion =
  "action_651c_bounded_plain_data_snapshot_v1" as const;

const snapshotLimits = Object.freeze({
  maximum_depth: 12,
  maximum_nodes: 512,
  maximum_properties: 2048,
  maximum_string_bytes: 65_536,
});

export type Action651cSnapshotFailureReason =
  | "accessor_rejected"
  | "proxy_rejected"
  | "cycle_rejected"
  | "snapshot_budget_exceeded"
  | "descriptor_inspection_failed"
  | "non_plain_data_rejected"
  | "input_shape_rejected"
  | "downstream_exception";

export type Action651cObservedInputDigests = Readonly<{
  preparation_input_digest: string | null;
  handoff_input_digest: string | null;
  boundary_input_digest: string | null;
  confirmation_capability_input_digest: string | null;
  confirmation_observation_input_digest: string | null;
  synthetic_fill_input_digest: string | null;
  broker_events_input_digest: string | null;
  temporal_input_digest: string | null;
  rejection_witness_digest: string | null;
}>;

export type Action651cSnapshotEvidence = Readonly<{
  policy_version: typeof action651cSnapshotPolicyVersion;
  status: "verified" | "rejected";
  failure_reason: Action651cSnapshotFailureReason | null;
  failure_path: string | null;
  observed_input_digests: Action651cObservedInputDigests;
  observed_nodes: number;
  observed_properties: number;
  observed_string_bytes: number;
  snapshot_digest: string;
}>;

export type Action651cFailureLineage = Readonly<{
  policy_version: typeof action651cFailureLineagePolicyVersion;
  execution_identity: string | null;
  lifecycle_identity: string | null;
  runtime_identity_context_digest: string | null;
  preparation_trace_identity: string | null;
  preparation_input_digest: string | null;
  handoff_identity: string | null;
  handoff_digest: string | null;
  canonical_order_payload_digest: string | null;
  confirmation_request_digest: string | null;
  confirmation_capability_digest: string | null;
  confirmation_consumption_state: string | null;
  confirmation_receipt_digest: string | null;
  session_identity: string | null;
  session_started_at: string | null;
  session_expires_at: string | null;
  temporal_policy_version: string | null;
  confirmed_at: string | null;
  consumed_at: string | null;
  idempotency_identity: string | null;
  correlation_identity: string | null;
  confirmed_replay_trace_identity: string | null;
  confirmed_replay_evidence_digest: string | null;
  terminal_digest: string | null;
  observed_rejected_input_digests: Action651cObservedInputDigests;
  lineage_digest: string;
}>;

export type Action651cFailureProvenance = Readonly<{
  failure_kind: Action651aFailureKind;
  source_reason: string | null;
  snapshot_failure_reason: Action651cSnapshotFailureReason | null;
  failure_lineage: Action651cFailureLineage;
  evidence_digest: string;
}>;

export type Action651cDiagnosticAuditResult = Readonly<{
  contract_version: typeof action651cExecutionQualityContractVersion;
  predecessor_contract_version:
    | "action_651a_diagnostic_execution_quality_audit_v1"
    | null;
  gate_status: "enabled" | "disabled" | "kill_switch_active";
  audit_status: Action651aAuditStatus;
  snapshot_evidence: Action651cSnapshotEvidence | null;
  failure_provenance: Action651cFailureProvenance | null;
  timing_projection: Action651aTimingProjection | null;
  planned_price_projection: Action651aPlannedPriceProjection | null;
  confirmed_price_projection: Action651aConfirmedPriceProjection | null;
  synthetic_fill_projection: Action651aSyntheticFillProjection | null;
  predecessor_audit_evidence_digest: string | null;
  safety: Action651aDiagnosticSafety;
  effects: Action651aDiagnosticAuditResult["effects"];
  audit_evidence_digest: string | null;
}>;

export type Action651cDiagnosticAuditInput = Readonly<{
  enabled: unknown;
  kill_switch_active: unknown;
  prepared: Action650sPreparedExecution;
  boundary: Action650uManualConfirmationBoundary;
  capability: unknown;
  consumed_at: unknown;
  broker_events: readonly Action650uSimulatedBrokerEvent[];
  confirmed_price: Action651aConfirmedPriceObservation;
  synthetic_fill: Action651aSyntheticFillObservation;
  maximum_confirmation_latency_nanoseconds: unknown;
}>;

type PlainValue =
  | null
  | boolean
  | number
  | string
  | readonly PlainValue[]
  | Readonly<{ [key: string]: PlainValue }>;

type SnapshotCounters = {
  nodes: number;
  properties: number;
  stringBytes: number;
};

type SnapshotFailure = Readonly<{
  reason: Action651cSnapshotFailureReason;
  path: string;
  witnessDigest: string;
}>;

type SnapshotAttempt =
  | Readonly<{ ok: true; value: PlainValue }>
  | Readonly<{ ok: false; failure: SnapshotFailure }>;

type SnapshotParts = {
  prepared: PlainValue | null;
  capability: PlainValue | null;
  boundary: PlainValue | null;
  confirmedPrice: PlainValue | null;
  syntheticFill: PlainValue | null;
  brokerEvents: PlainValue | null;
  consumedAt: PlainValue | null;
  maximumLatency: PlainValue | null;
};

type VerifiedSnapshot = Readonly<{
  prepared_handle: Action650sPreparedExecution;
  boundary_handle: Action650uManualConfirmationBoundary;
  capability_handle: unknown;
  prepared: PlainValue;
  capability: PlainValue;
  boundary: PlainValue;
  confirmed_price: PlainValue;
  synthetic_fill: PlainValue;
  broker_events: PlainValue;
  consumed_at: PlainValue;
  maximum_confirmation_latency_nanoseconds: PlainValue;
}>;

const resultProvenance = new WeakSet<object>();

const safety: Action651aDiagnosticSafety = Object.freeze({
  diagnostic_only: true,
  real_broker_evidence: false,
  performance_eligible: false,
  automatic_execution_allowed: false,
  real_broker_submission: false,
  avanza_live_access: false,
  credential_access: false,
  automatic_execution: false,
  trade_mutation: false,
  production_write: false,
});

const zeroEffects: Action651aDiagnosticAuditResult["effects"] = Object.freeze({
  audit_records_persisted: 0,
  provider_calls: 0,
  database_writes: 0,
  order_mutations: 0,
  trade_mutations: 0,
  position_mutations: 0,
  process_spawns: 0,
});

const disabledResult: Action651cDiagnosticAuditResult = Object.freeze({
  contract_version: action651cExecutionQualityContractVersion,
  predecessor_contract_version: null,
  gate_status: "disabled",
  audit_status: "incomplete",
  snapshot_evidence: null,
  failure_provenance: null,
  timing_projection: null,
  planned_price_projection: null,
  confirmed_price_projection: null,
  synthetic_fill_projection: null,
  predecessor_audit_evidence_digest: null,
  safety,
  effects: zeroEffects,
  audit_evidence_digest: null,
});

const killedResult: Action651cDiagnosticAuditResult = Object.freeze({
  ...disabledResult,
  gate_status: "kill_switch_active",
});
resultProvenance.add(disabledResult);
resultProvenance.add(killedResult);

function sanitizedFailure(
  reason: Action651cSnapshotFailureReason,
  path: string,
  counters: SnapshotCounters,
): SnapshotFailure {
  const boundedPath = path.slice(0, 256);
  return Object.freeze({
    reason,
    path: boundedPath,
    witnessDigest: `action_651c_snapshot_rejection_${hashAction650sCanonicalValue(
      {
        policy_version: action651cSnapshotPolicyVersion,
        reason,
        path: boundedPath,
        observed_nodes: counters.nodes,
        observed_properties: counters.properties,
        observed_string_bytes: counters.stringBytes,
      },
    )}`,
  });
}

function snapshotPlainData(
  value: unknown,
  path: string,
  counters: SnapshotCounters,
  ancestors = new WeakSet<object>(),
  depth = 0,
): SnapshotAttempt {
  if (depth > snapshotLimits.maximum_depth) {
    return {
      ok: false,
      failure: sanitizedFailure(
        "snapshot_budget_exceeded",
        path,
        counters,
      ),
    };
  }

  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    counters.nodes += 1;
    if (typeof value === "string") {
      counters.stringBytes += new TextEncoder().encode(value).byteLength;
    }
    if (
      counters.nodes > snapshotLimits.maximum_nodes ||
      counters.stringBytes > snapshotLimits.maximum_string_bytes
    ) {
      return {
        ok: false,
        failure: sanitizedFailure(
          "snapshot_budget_exceeded",
          path,
          counters,
        ),
      };
    }
    return { ok: true, value };
  }

  if (typeof value !== "object") {
    return {
      ok: false,
      failure: sanitizedFailure("non_plain_data_rejected", path, counters),
    };
  }

  if (nodeTypes.isProxy(value)) {
    return {
      ok: false,
      failure: sanitizedFailure("proxy_rejected", path, counters),
    };
  }
  if (ancestors.has(value)) {
    return {
      ok: false,
      failure: sanitizedFailure("cycle_rejected", path, counters),
    };
  }

  let prototype: object | null;
  let descriptors: Record<string, PropertyDescriptor>;
  try {
    prototype = Object.getPrototypeOf(value);
    descriptors = Object.getOwnPropertyDescriptors(value);
  } catch {
    return {
      ok: false,
      failure: sanitizedFailure(
        "descriptor_inspection_failed",
        path,
        counters,
      ),
    };
  }

  if (
    !Array.isArray(value) &&
    prototype !== Object.prototype &&
    prototype !== null
  ) {
    return {
      ok: false,
      failure: sanitizedFailure("non_plain_data_rejected", path, counters),
    };
  }

  const keys = Object.keys(descriptors).filter((key) => key !== "length");
  counters.nodes += 1;
  counters.properties += keys.length;
  if (
    counters.nodes > snapshotLimits.maximum_nodes ||
    counters.properties > snapshotLimits.maximum_properties
  ) {
    return {
      ok: false,
      failure: sanitizedFailure("snapshot_budget_exceeded", path, counters),
    };
  }

  ancestors.add(value);
  if (Array.isArray(value)) {
    const lengthDescriptor = descriptors.length;
    if (
      !lengthDescriptor ||
      !("value" in lengthDescriptor) ||
      typeof lengthDescriptor.value !== "number" ||
      lengthDescriptor.value !== keys.length
    ) {
      ancestors.delete(value);
      return {
        ok: false,
        failure: sanitizedFailure("input_shape_rejected", path, counters),
      };
    }
    const output: PlainValue[] = [];
    for (let index = 0; index < lengthDescriptor.value; index += 1) {
      const descriptor = descriptors[String(index)];
      if (!descriptor || !("value" in descriptor)) {
        ancestors.delete(value);
        return {
          ok: false,
          failure: sanitizedFailure(
            descriptor ? "accessor_rejected" : "input_shape_rejected",
            `${path}[${index}]`,
            counters,
          ),
        };
      }
      const child = snapshotPlainData(
        descriptor.value,
        `${path}[${index}]`,
        counters,
        ancestors,
        depth + 1,
      );
      if (!child.ok) {
        ancestors.delete(value);
        return child;
      }
      output.push(child.value);
    }
    ancestors.delete(value);
    return { ok: true, value: Object.freeze(output) };
  }

  const output: Record<string, PlainValue> = {};
  for (const key of keys.sort()) {
    const descriptor = descriptors[key];
    if (!descriptor || !("value" in descriptor)) {
      ancestors.delete(value);
      return {
        ok: false,
        failure: sanitizedFailure(
          "accessor_rejected",
          `${path}.${key}`,
          counters,
        ),
      };
    }
    const child = snapshotPlainData(
      descriptor.value,
      `${path}.${key}`,
      counters,
      ancestors,
      depth + 1,
    );
    if (!child.ok) {
      ancestors.delete(value);
      return child;
    }
    output[key] = child.value;
  }
  ancestors.delete(value);
  return { ok: true, value: Object.freeze(output) };
}

function snapshotBoundary(
  value: unknown,
  counters: SnapshotCounters,
): SnapshotAttempt {
  if (!value || typeof value !== "object" || nodeTypes.isProxy(value)) {
    return {
      ok: false,
      failure: sanitizedFailure(
        nodeTypes.isProxy(value) ? "proxy_rejected" : "input_shape_rejected",
        "$.boundary",
        counters,
      ),
    };
  }
  let descriptors: Record<string, PropertyDescriptor>;
  try {
    descriptors = Object.getOwnPropertyDescriptors(value);
  } catch {
    return {
      ok: false,
      failure: sanitizedFailure(
        "descriptor_inspection_failed",
        "$.boundary",
        counters,
      ),
    };
  }
  for (const key of [
    "boundary_identity",
    "temporal_policy_version",
    "confirm",
  ]) {
    if (!descriptors[key] || !("value" in descriptors[key])) {
      return {
        ok: false,
        failure: sanitizedFailure(
          "accessor_rejected",
          `$.boundary.${key}`,
          counters,
        ),
      };
    }
  }
  if (
    typeof descriptors.boundary_identity.value !== "string" ||
    typeof descriptors.temporal_policy_version.value !== "string" ||
    typeof descriptors.confirm.value !== "function" ||
    !Object.isFrozen(value)
  ) {
    return {
      ok: false,
      failure: sanitizedFailure(
        "input_shape_rejected",
        "$.boundary",
        counters,
      ),
    };
  }
  counters.nodes += 1;
  counters.properties += 3;
  const projection = Object.freeze({
    boundary_identity: descriptors.boundary_identity.value as string,
    temporal_policy_version:
      descriptors.temporal_policy_version.value as string,
  });
  return { ok: true, value: projection };
}

function componentDigest(prefix: string, value: PlainValue | null) {
  return value === null
    ? null
    : `${prefix}_${hashAction650sCanonicalValue(value)}`;
}

function canonicalizeVerifiedParts(parts: SnapshotParts): SnapshotParts {
  const confirmedPrice = plainObject(parts.confirmedPrice);
  const confirmedAt = canonicalizeAction650uNanosecondInstant(
    confirmedPrice?.observed_at,
  );
  if (confirmedPrice && confirmedAt) {
    parts.confirmedPrice = Object.freeze({
      ...confirmedPrice,
      observed_at: confirmedAt.canonical_instant,
    });
  }

  const consumedAt = canonicalizeAction650uNanosecondInstant(parts.consumedAt);
  if (consumedAt) parts.consumedAt = consumedAt.canonical_instant;

  if (Array.isArray(parts.brokerEvents)) {
    const normalized = parts.brokerEvents.map((event) => {
      const object = plainObject(event);
      const observedAt = canonicalizeAction650uNanosecondInstant(
        object?.observed_at,
      );
      return object && observedAt
        ? {
            event: Object.freeze({
              ...object,
              observed_at: observedAt.canonical_instant,
            }),
            observedAt,
          }
        : null;
    });
    if (normalized.every((entry) => entry !== null)) {
      parts.brokerEvents = Object.freeze(
        normalized
          .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
          .sort(
            (left, right) =>
              compareAction650uInstants(left.observedAt, right.observedAt) ||
              hashAction650sCanonicalValue(left.event).localeCompare(
                hashAction650sCanonicalValue(right.event),
              ),
          )
          .map(({ event }) => event),
      );
    }
  }
  return parts;
}

function measureCanonicalPlainValue(
  value: PlainValue | null,
  counters: SnapshotCounters,
) {
  if (value === null || typeof value !== "object") {
    counters.nodes += 1;
    if (typeof value === "string") {
      counters.stringBytes += new TextEncoder().encode(value).byteLength;
    }
    return;
  }
  counters.nodes += 1;
  if (Array.isArray(value)) {
    counters.properties += value.length;
    for (const item of value) measureCanonicalPlainValue(item, counters);
    return;
  }
  const object = value as Readonly<Record<string, PlainValue>>;
  const keys = Object.keys(object);
  counters.properties += keys.length;
  for (const key of keys.sort()) {
    measureCanonicalPlainValue(object[key], counters);
  }
}

function measureCanonicalParts(parts: SnapshotParts): SnapshotCounters {
  const counters: SnapshotCounters = {
    nodes: 0,
    properties: 0,
    stringBytes: 0,
  };
  for (const value of [
    parts.prepared,
    parts.capability,
    parts.boundary,
    parts.confirmedPrice,
    parts.syntheticFill,
    parts.brokerEvents,
    parts.consumedAt,
    parts.maximumLatency,
  ]) {
    measureCanonicalPlainValue(value, counters);
  }
  return counters;
}

function observedDigests(
  parts: SnapshotParts,
  failure: SnapshotFailure | null,
): Action651cObservedInputDigests {
  const prepared = componentDigest(
    "action_651c_observed_preparation",
    parts.prepared,
  );
  const preparedObject = plainObject(parts.prepared);
  return deepFreezeAction650s({
    preparation_input_digest: prepared,
    handoff_input_digest: componentDigest(
      "action_651c_observed_handoff",
      preparedObject?.handoff ?? null,
    ),
    boundary_input_digest: componentDigest(
      "action_651c_observed_boundary",
      parts.boundary,
    ),
    confirmation_capability_input_digest: componentDigest(
      "action_651c_observed_capability",
      parts.capability,
    ),
    confirmation_observation_input_digest: componentDigest(
      "action_651c_observed_confirmation_price",
      parts.confirmedPrice,
    ),
    synthetic_fill_input_digest: componentDigest(
      "action_651c_observed_synthetic_fill",
      parts.syntheticFill,
    ),
    broker_events_input_digest: componentDigest(
      "action_651c_observed_broker_events",
      parts.brokerEvents,
    ),
    temporal_input_digest: componentDigest(
      "action_651c_observed_temporal_input",
      parts.consumedAt === null && parts.maximumLatency === null
        ? null
        : Object.freeze({
            consumed_at: parts.consumedAt,
            maximum_confirmation_latency_nanoseconds: parts.maximumLatency,
          }),
    ),
    rejection_witness_digest: failure?.witnessDigest ?? null,
  });
}

function snapshotEvidence(
  parts: SnapshotParts,
  counters: SnapshotCounters,
  failure: SnapshotFailure | null,
): Action651cSnapshotEvidence {
  const base = {
    policy_version: action651cSnapshotPolicyVersion,
    status: failure ? ("rejected" as const) : ("verified" as const),
    failure_reason: failure?.reason ?? null,
    failure_path: failure?.path ?? null,
    observed_input_digests: observedDigests(parts, failure),
    observed_nodes: counters.nodes,
    observed_properties: counters.properties,
    observed_string_bytes: counters.stringBytes,
  };
  return deepFreezeAction650s({
    ...base,
    snapshot_digest: `action_651c_snapshot_${hashAction650sCanonicalValue(
      base,
    )}`,
  });
}

function plainObject(
  value: PlainValue | null | undefined,
): Readonly<Record<string, PlainValue>> | null {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Readonly<Record<string, PlainValue>>)
    : null;
}

function textAt(
  value: PlainValue | null | undefined,
  ...path: string[]
): string | null {
  let cursor: PlainValue | null | undefined = value;
  for (const segment of path) {
    cursor = plainObject(cursor)?.[segment];
  }
  return typeof cursor === "string" ? cursor : null;
}

function buildFailureLineage(input: {
  parts: SnapshotParts;
  snapshot: Action651cSnapshotEvidence;
  predecessor: Action651aDiagnosticAuditResult | null;
}): Action651cFailureLineage {
  const predecessorLineage = input.predecessor?.lineage;
  const prepared = input.parts.prepared;
  const capability = input.parts.capability;
  const projection = {
    policy_version: action651cFailureLineagePolicyVersion,
    execution_identity:
      predecessorLineage?.execution_identity ??
      textAt(prepared, "runtime_identity_context", "execution_identity"),
    lifecycle_identity:
      predecessorLineage?.lifecycle_identity ??
      textAt(prepared, "runtime_identity_context", "lifecycle_identity"),
    runtime_identity_context_digest:
      predecessorLineage?.runtime_identity_context_digest ??
      textAt(prepared, "runtime_identity_context_digest"),
    preparation_trace_identity: textAt(prepared, "trace_identity"),
    preparation_input_digest:
      input.snapshot.observed_input_digests.preparation_input_digest,
    handoff_identity:
      predecessorLineage?.handoff_identity ??
      textAt(prepared, "handoff", "identity", "handoff_identity"),
    handoff_digest:
      predecessorLineage?.handoff_digest ??
      textAt(prepared, "handoff", "identity", "handoff_digest"),
    canonical_order_payload_digest:
      predecessorLineage?.canonical_order_payload_digest ??
      textAt(
        prepared,
        "handoff",
        "identity",
        "canonical_order_payload_digest",
      ),
    confirmation_request_digest:
      predecessorLineage?.confirmation_request_digest ??
      textAt(capability, "confirmation_request_digest"),
    confirmation_capability_digest:
      predecessorLineage?.confirmation_capability_digest ??
      textAt(capability, "capability_digest"),
    confirmation_consumption_state:
      input.predecessor?.lineage?.confirmation_receipt_digest
        ? "consumed"
        : textAt(capability, "consumption_state"),
    confirmation_receipt_digest:
      predecessorLineage?.confirmation_receipt_digest ?? null,
    session_identity:
      predecessorLineage?.session_identity ??
      textAt(capability, "session_identity"),
    session_started_at: textAt(capability, "session_started_at"),
    session_expires_at: textAt(capability, "session_expires_at"),
    temporal_policy_version:
      textAt(capability, "temporal_policy_version") ??
      textAt(input.parts.boundary, "temporal_policy_version"),
    confirmed_at: textAt(capability, "confirmed_at"),
    consumed_at:
      typeof input.parts.consumedAt === "string"
        ? input.parts.consumedAt
        : null,
    idempotency_identity:
      predecessorLineage?.idempotency_identity ??
      textAt(prepared, "handoff", "identity", "idempotency_identity"),
    correlation_identity:
      predecessorLineage?.correlation_identity ??
      textAt(prepared, "handoff", "identity", "correlation_identity"),
    confirmed_replay_trace_identity:
      predecessorLineage?.confirmed_replay_trace_identity ?? null,
    confirmed_replay_evidence_digest:
      predecessorLineage?.confirmed_replay_evidence_digest ?? null,
    terminal_digest: predecessorLineage?.terminal_digest ?? null,
    observed_rejected_input_digests:
      input.snapshot.observed_input_digests,
  };
  return deepFreezeAction650s({
    ...projection,
    lineage_digest: `action_651c_failure_lineage_${hashAction650sCanonicalValue(
      projection,
    )}`,
  });
}

function attemptSnapshot(input: Action651cDiagnosticAuditInput): Readonly<{
  snapshot: VerifiedSnapshot | null;
  evidence: Action651cSnapshotEvidence;
  parts: SnapshotParts;
}> {
  const counters: SnapshotCounters = {
    nodes: 0,
    properties: 0,
    stringBytes: 0,
  };
  const parts: SnapshotParts = {
    prepared: null,
    capability: null,
    boundary: null,
    confirmedPrice: null,
    syntheticFill: null,
    brokerEvents: null,
    consumedAt: null,
    maximumLatency: null,
  };

  if (nodeTypes.isProxy(input)) {
    const failure = sanitizedFailure("proxy_rejected", "$", counters);
    return {
      snapshot: null,
      evidence: snapshotEvidence(parts, counters, failure),
      parts,
    };
  }

  let descriptors: Record<string, PropertyDescriptor>;
  try {
    descriptors = Object.getOwnPropertyDescriptors(input);
  } catch {
    const failure = sanitizedFailure(
      "descriptor_inspection_failed",
      "$",
      counters,
    );
    return {
      snapshot: null,
      evidence: snapshotEvidence(parts, counters, failure),
      parts,
    };
  }

  const requiredKeys = [
    "prepared",
    "boundary",
    "capability",
    "consumed_at",
    "broker_events",
    "confirmed_price",
    "synthetic_fill",
    "maximum_confirmation_latency_nanoseconds",
  ] as const;
  for (const key of requiredKeys) {
    const descriptor = descriptors[key];
    if (!descriptor || !("value" in descriptor)) {
      const failure = sanitizedFailure(
        descriptor ? "accessor_rejected" : "input_shape_rejected",
        `$.${key}`,
        counters,
      );
      return {
        snapshot: null,
        evidence: snapshotEvidence(parts, counters, failure),
        parts,
      };
    }
  }

  const values = Object.fromEntries(
    requiredKeys.map((key) => [key, descriptors[key].value]),
  ) as Record<(typeof requiredKeys)[number], unknown>;

  const sequence: readonly [
    keyof SnapshotParts,
    string,
    unknown,
  ][] = [
    ["prepared", "$.prepared", values.prepared],
    ["capability", "$.capability", values.capability],
    ["confirmedPrice", "$.confirmed_price", values.confirmed_price],
    ["syntheticFill", "$.synthetic_fill", values.synthetic_fill],
    ["brokerEvents", "$.broker_events", values.broker_events],
    ["consumedAt", "$.consumed_at", values.consumed_at],
    [
      "maximumLatency",
      "$.maximum_confirmation_latency_nanoseconds",
      values.maximum_confirmation_latency_nanoseconds,
    ],
  ];

  for (const [part, path, value] of sequence) {
    const attempt = snapshotPlainData(value, path, counters);
    if (!attempt.ok) {
      return {
        snapshot: null,
        evidence: snapshotEvidence(parts, counters, attempt.failure),
        parts,
      };
    }
    parts[part] = attempt.value;
  }

  const boundaryAttempt = snapshotBoundary(values.boundary, counters);
  if (!boundaryAttempt.ok) {
    return {
      snapshot: null,
      evidence: snapshotEvidence(parts, counters, boundaryAttempt.failure),
      parts,
    };
  }
  parts.boundary = boundaryAttempt.value;
  canonicalizeVerifiedParts(parts);
  const evidence = snapshotEvidence(
    parts,
    measureCanonicalParts(parts),
    null,
  );
  const snapshot = deepFreezeAction650s({
    prepared_handle: values.prepared as Action650sPreparedExecution,
    boundary_handle: values.boundary as Action650uManualConfirmationBoundary,
    capability_handle: values.capability,
    prepared: parts.prepared as PlainValue,
    capability: parts.capability as PlainValue,
    boundary: parts.boundary,
    confirmed_price: parts.confirmedPrice as PlainValue,
    synthetic_fill: parts.syntheticFill as PlainValue,
    broker_events: parts.brokerEvents as PlainValue,
    consumed_at: parts.consumedAt as PlainValue,
    maximum_confirmation_latency_nanoseconds:
      parts.maximumLatency as PlainValue,
  }) as VerifiedSnapshot;
  return { snapshot, evidence, parts };
}

function finalize(input: {
  status: Action651aAuditStatus;
  snapshot: Action651cSnapshotEvidence;
  parts: SnapshotParts;
  predecessor: Action651aDiagnosticAuditResult | null;
  failureKind: Action651aFailureKind;
  sourceReason: string | null;
  snapshotFailureReason: Action651cSnapshotFailureReason | null;
}): Action651cDiagnosticAuditResult {
  const failureLineage = buildFailureLineage({
    parts: input.parts,
    snapshot: input.snapshot,
    predecessor: input.predecessor,
  });
  const failureBase = {
    failure_kind: input.failureKind,
    source_reason: input.sourceReason,
    snapshot_failure_reason: input.snapshotFailureReason,
    failure_lineage: failureLineage,
  };
  const failureProvenance = deepFreezeAction650s({
    ...failureBase,
    evidence_digest: `action_651c_failure_${hashAction650sCanonicalValue(
      failureBase,
    )}`,
  });
  const base = {
    contract_version: action651cExecutionQualityContractVersion,
    predecessor_contract_version:
      input.predecessor?.contract_version ?? null,
    gate_status: "enabled" as const,
    audit_status: input.status,
    snapshot_evidence: input.snapshot,
    failure_provenance: failureProvenance,
    timing_projection: input.predecessor?.timing_projection ?? null,
    planned_price_projection:
      input.predecessor?.planned_price_projection ?? null,
    confirmed_price_projection:
      input.predecessor?.confirmed_price_projection ?? null,
    synthetic_fill_projection:
      input.predecessor?.synthetic_fill_projection ?? null,
    predecessor_audit_evidence_digest:
      input.predecessor?.audit_evidence_digest ?? null,
    safety,
    effects: zeroEffects,
  };
  const result = deepFreezeAction650s({
    ...base,
    audit_evidence_digest: `action_651c_audit_${hashAction650sCanonicalValue(
      base,
    )}`,
  }) as Action651cDiagnosticAuditResult;
  resultProvenance.add(result);
  return result;
}

export function rebuildAction651cFailureLineageDigest(
  lineage: Action651cFailureLineage,
) {
  const { lineage_digest: _claimed, ...projection } = lineage;
  void _claimed;
  return `action_651c_failure_lineage_${hashAction650sCanonicalValue(
    projection,
  )}`;
}

export function rebuildAction651cFailureEvidenceDigest(
  failure: Action651cFailureProvenance,
) {
  const { evidence_digest: _claimed, ...projection } = failure;
  void _claimed;
  return `action_651c_failure_${hashAction650sCanonicalValue(projection)}`;
}

export function rebuildAction651cSnapshotDigest(
  snapshot: Action651cSnapshotEvidence,
) {
  const { snapshot_digest: _claimed, ...projection } = snapshot;
  void _claimed;
  return `action_651c_snapshot_${hashAction650sCanonicalValue(projection)}`;
}

export function rebuildAction651cAuditEvidenceDigest(
  result: Action651cDiagnosticAuditResult,
) {
  const { audit_evidence_digest: _claimed, ...projection } = result;
  void _claimed;
  return `action_651c_audit_${hashAction650sCanonicalValue(projection)}`;
}

export function verifyAction651cDiagnosticAuditResult(
  value: unknown,
): value is Action651cDiagnosticAuditResult {
  if (
    !value ||
    typeof value !== "object" ||
    !resultProvenance.has(value) ||
    !Object.isFrozen(value)
  ) {
    return false;
  }
  const result = value as Action651cDiagnosticAuditResult;
  if (
    result.gate_status !== "enabled" ||
    !result.failure_provenance ||
    !result.snapshot_evidence ||
    !result.audit_evidence_digest
  ) {
    return value === disabledResult || value === killedResult;
  }
  return (
    rebuildAction651cFailureLineageDigest(
      result.failure_provenance.failure_lineage,
    ) === result.failure_provenance.failure_lineage.lineage_digest &&
    rebuildAction651cFailureEvidenceDigest(result.failure_provenance) ===
      result.failure_provenance.evidence_digest &&
    rebuildAction651cSnapshotDigest(result.snapshot_evidence) ===
      result.snapshot_evidence.snapshot_digest &&
    rebuildAction651cAuditEvidenceDigest(result) ===
      result.audit_evidence_digest
  );
}

/**
 * Additive V2 wrapper. Gate reads happen before descriptor inspection. The
 * enabled path snapshots all plain data exactly once and invokes V1 only with
 * the frozen snapshot values plus the original frozen provenance handles.
 */
export function runAction651cExecutionQualityAuditV2(
  input: Action651cDiagnosticAuditInput,
): Action651cDiagnosticAuditResult {
  const enabled = input.enabled;
  if (enabled !== true) return disabledResult;
  const killSwitchActive = input.kill_switch_active;
  if (killSwitchActive === true) return killedResult;

  const attempted = attemptSnapshot(input);
  if (!attempted.snapshot) {
    return finalize({
      status: "unmappable",
      snapshot: attempted.evidence,
      parts: attempted.parts,
      predecessor: null,
      failureKind: "diagnostic_input_unmappable",
      sourceReason: `v2_snapshot_${attempted.evidence.failure_reason}`,
      snapshotFailureReason: attempted.evidence.failure_reason,
    });
  }

  let predecessor: Action651aDiagnosticAuditResult;
  try {
    predecessor = runAction651aDiagnosticExecutionQualityAudit({
      enabled: true,
      kill_switch_active: false,
      prepared: attempted.snapshot.prepared_handle,
      boundary: attempted.snapshot.boundary_handle,
      capability: attempted.snapshot.capability_handle,
      consumed_at: attempted.snapshot.consumed_at,
      broker_events:
        attempted.snapshot.broker_events as unknown as readonly Action650uSimulatedBrokerEvent[],
      confirmed_price:
        attempted.snapshot.confirmed_price as unknown as Action651aConfirmedPriceObservation,
      synthetic_fill:
        attempted.snapshot.synthetic_fill as unknown as Action651aSyntheticFillObservation,
      maximum_confirmation_latency_nanoseconds:
        attempted.snapshot.maximum_confirmation_latency_nanoseconds,
    } satisfies Action651aDiagnosticAuditInput);
  } catch {
    const failure = sanitizedFailure(
      "downstream_exception",
      "$.predecessor",
      {
        nodes: attempted.evidence.observed_nodes,
        properties: attempted.evidence.observed_properties,
        stringBytes: attempted.evidence.observed_string_bytes,
      },
    );
    const rejectedSnapshot = snapshotEvidence(
      attempted.parts,
      {
        nodes: attempted.evidence.observed_nodes,
        properties: attempted.evidence.observed_properties,
        stringBytes: attempted.evidence.observed_string_bytes,
      },
      failure,
    );
    return finalize({
      status: "unmappable",
      snapshot: rejectedSnapshot,
      parts: attempted.parts,
      predecessor: null,
      failureKind: "diagnostic_input_unmappable",
      sourceReason: "v2_snapshot_downstream_exception",
      snapshotFailureReason: "downstream_exception",
    });
  }

  return finalize({
    status: predecessor.audit_status,
    snapshot: attempted.evidence,
    parts: attempted.parts,
    predecessor,
    failureKind:
      predecessor.failure_provenance?.failure_kind ??
      ("diagnostic_input_unmappable" as const),
    sourceReason: predecessor.failure_provenance?.source_reason ?? null,
    snapshotFailureReason: null,
  });
}
