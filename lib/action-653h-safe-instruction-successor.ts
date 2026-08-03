import { types as nodeTypes } from "node:util";

import {
  hashAction650sCanonicalValue,
} from "@/lib/action-650s-execution-identity";
import {
  hasAction650sPreparedExecutionProvenance,
  type Action650sPreparedExecution,
} from "@/lib/action-650s-execution-preparation";
import {
  action650uManualConfirmationAuthorityScope,
  consumeAction650uManualConfirmation,
  getAction650uManualConfirmationConsumptionState,
  verifyAction650uManualConfirmationCapability,
  type Action650uManualConfirmationBoundary,
  type Action650uManualConfirmationCapability,
} from "@/lib/action-650u-manual-confirmation";
import {
  action650uTemporalConfirmationPolicyVersion,
  canonicalizeAction650uNanosecondInstant,
  compareAction650uInstants,
} from "@/lib/action-650u-temporal-confirmation-policy";
import {
  canAction652cProceedToManualConfirmation,
  type Action652cAdmissionResult,
} from "@/lib/action-652c-non-forgeable-risk-authority";

export const action653hContractVersion =
  "action_653h_safe_instruction_successor_v2" as const;
export const action653hSnapshotPolicyVersion =
  "action_653h_iterative_descriptor_snapshot_v1" as const;
export const action653hPreConsumptionPolicyVersion =
  "action_653h_all_fallible_validation_before_consumption_v1" as const;
export const action653hInstructionSchemaVersion =
  "action_653h_broker_neutral_instruction_schema_v2" as const;
export const action653hSyntheticDestinationIdentity =
  "action_653h_synthetic_replay_only" as const;

export const action653hSnapshotBudget = Object.freeze({
  maximum_depth: 48,
  maximum_nodes: 6_144,
  maximum_properties: 32_768,
  maximum_string_bytes: 1_048_576,
});

type PlainValue =
  | null
  | boolean
  | number
  | string
  | readonly PlainValue[]
  | { readonly [key: string]: PlainValue };

type SnapshotFailureReason =
  | "accessor_rejected"
  | "proxy_rejected"
  | "cycle_rejected"
  | "snapshot_budget_exceeded"
  | "descriptor_inspection_failed"
  | "non_plain_data_rejected"
  | "request_shape_rejected";

export type Action653hInstructionStatus =
  | "prepared"
  | "blocked"
  | "expired"
  | "conflicting"
  | "unmappable";

export type Action653hInstructionReason =
  | "instruction_prepared"
  | "instruction_disabled"
  | "kill_switch_active"
  | "input_snapshot_rejected"
  | "preparation_provenance_unproven"
  | "risk_admission_unproven"
  | "risk_admission_not_admitted"
  | "confirmation_provenance_unproven"
  | "confirmation_rejected"
  | "confirmation_expired"
  | "execution_lineage_mismatch"
  | "session_lineage_mismatch"
  | "automatic_execution_rejected"
  | "quantity_price_notional_mismatch"
  | "unit_scale_currency_mismatch"
  | "instruction_identity_invalid"
  | "instruction_expired"
  | "conflicting_instruction_reuse"
  | "cross_execution_reuse_rejected"
  | "timestamp_unmappable";

export type Action653hExecutionInstructionRequest = Readonly<{
  prepared: Action650sPreparedExecution;
  risk_admission: Action652cAdmissionResult;
  confirmation_boundary: Action650uManualConfirmationBoundary;
  confirmation_capability: Action650uManualConfirmationCapability;
  consumed_at: string;
  observed_at: string;
}>;

type RequestSnapshot = Readonly<{
  prepared: Action650sPreparedExecution;
  risk_admission: Action652cAdmissionResult;
  confirmation_boundary: Readonly<{
    boundary_identity: string;
    temporal_policy_version: string;
    confirm_present: true;
  }>;
  confirmation_capability: Action650uManualConfirmationCapability;
  consumed_at: string;
  observed_at: string;
}>;

type RequestHandles = Readonly<{
  prepared: unknown;
  risk_admission: unknown;
  confirmation_boundary: unknown;
  confirmation_capability: unknown;
}>;

export type Action653hBrokerNeutralInstruction = Readonly<{
  schema_version: typeof action653hInstructionSchemaVersion;
  destination_identity: typeof action653hSyntheticDestinationIdentity;
  snapshot_digest: string;
  execution_identity: string;
  lifecycle_identity: string;
  preparation_trace_identity: string;
  handoff_identity: string;
  handoff_digest: string;
  risk_admission_identity: string;
  risk_admission_digest: string;
  confirmation_request_digest: string;
  confirmation_capability_digest: string;
  confirmation_consumption_digest: string;
  session_identity: string;
  instrument: string;
  side: "BUY" | "SELL";
  quantity: Readonly<{ value: string; scale: 0; unit: "units" }>;
  limit_price: Readonly<{
    value: string;
    scale: 6;
    unit: "SEK_micros_per_unit";
    currency: "SEK";
  }>;
  notional: Readonly<{
    value: string;
    scale: 6;
    unit: "SEK_micros";
    currency: "SEK";
  }>;
  idempotency_identity: string;
  submission_intent_identity: string;
  instruction_created_at: string;
  instruction_expires_at: string;
  instruction_digest: string;
}>;

type Action653hLineage = Readonly<{
  execution_identity: string | null;
  lifecycle_identity: string | null;
  preparation_trace_identity: string | null;
  handoff_identity: string | null;
  handoff_digest: string | null;
  risk_admission_identity: string | null;
  risk_admission_digest: string | null;
  confirmation_request_digest: string | null;
  confirmation_capability_digest: string | null;
  confirmation_consumption_digest: string | null;
  session_identity: string | null;
  idempotency_identity: string | null;
  submission_intent_identity: string | null;
}>;

type Action653hObservedDigests = Readonly<{
  request_snapshot_digest: string | null;
  preparation_digest: string | null;
  risk_admission_digest: string | null;
  confirmation_digest: string | null;
  rejected_input_digest: string | null;
}>;

export type Action653hInstructionResult = Readonly<{
  contract_version: typeof action653hContractVersion;
  snapshot_policy_version: typeof action653hSnapshotPolicyVersion;
  pre_consumption_policy_version: typeof action653hPreConsumptionPolicyVersion;
  gate_status: "enabled" | "disabled" | "kill_switch_active";
  instruction_status: Action653hInstructionStatus;
  terminal_reason: Action653hInstructionReason;
  snapshot_digest: string | null;
  lineage: Action653hLineage;
  instruction: Action653hBrokerNeutralInstruction | null;
  observed_input_digests: Action653hObservedDigests;
  failure_provenance: Readonly<{
    terminal_reason: Exclude<
      Action653hInstructionReason,
      "instruction_prepared"
    >;
    observed_rejected_input_digests: Action653hObservedDigests;
    failure_digest: string;
  }> | null;
  envelope_digest: string | null;
  safety: Readonly<{
    diagnostic_only: true;
    synthetic_only: true;
    broker_neutral: true;
    real_broker_submission: false;
    avanza_live_access: false;
    credential_access: false;
    browser_or_cdp_access: false;
    automatic_execution: false;
    trade_mutation: false;
    production_write: false;
  }>;
  effects: Readonly<{
    request_descriptor_reads: 0 | 1;
    caller_getters_executed: 0;
    recursive_caller_traversals: 0;
    digest_operations: 0 | 1;
    manual_confirmation_consumptions: 0 | 1;
    synthetic_replay_admissions: 0;
    transport_requests: 0;
    provider_calls: 0;
    credential_reads: 0;
    database_reads: 0;
    database_writes: 0;
    process_spawns: 0;
    trade_mutations: 0;
  }>;
}>;

export type Action653hSyntheticReplayEvidence = Readonly<{
  contract_version: "action_653h_synthetic_replay_gate_v1";
  destination_identity: typeof action653hSyntheticDestinationIdentity;
  execution_identity: string;
  submission_intent_identity: string;
  instruction_digest: string;
  instruction_envelope_digest: string;
  observed_at: string;
  accepted: true;
  synthetic_only: true;
  evidence_digest: string;
}>;

type SnapshotBudgetState = {
  nodes: number;
  properties: number;
  string_bytes: number;
};

type SnapshotSuccess = Readonly<{
  ok: true;
  snapshot: RequestSnapshot;
  handles: RequestHandles;
  witness_digest: string;
}>;

type SnapshotFailure = Readonly<{
  ok: false;
  reason: SnapshotFailureReason;
  witness_digest: string;
}>;

type DuplicateRecord = Readonly<{
  request_snapshot_digest: string;
  execution_identity: string;
  result: Action653hInstructionResult;
}>;

const requestKeys = [
  "confirmation_boundary",
  "confirmation_capability",
  "consumed_at",
  "observed_at",
  "prepared",
  "risk_admission",
] as const;

const boundaryKeys = [
  "boundary_identity",
  "confirm",
  "temporal_policy_version",
] as const;

const preparedResultProvenance = new WeakSet<object>();
const consumptionRecords = new WeakMap<object, DuplicateRecord>();

function digest(label: string, value: unknown) {
  return `${label}_${hashAction650sCanonicalValue(value)}`;
}

function freezePlainTree<T>(value: T): Readonly<T> {
  if (!value || typeof value !== "object") return value;
  const stack: object[] = [value as object];
  const order: object[] = [];
  const seen = new WeakSet<object>();
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (seen.has(current)) continue;
    seen.add(current);
    order.push(current);
    const descriptors = Object.getOwnPropertyDescriptors(current);
    for (const descriptor of Object.values(descriptors)) {
      if (
        "value" in descriptor &&
        descriptor.value &&
        typeof descriptor.value === "object"
      ) {
        stack.push(descriptor.value as object);
      }
    }
  }
  for (let index = order.length - 1; index >= 0; index -= 1) {
    Object.freeze(order[index]);
  }
  return value;
}

const safety = freezePlainTree({
  diagnostic_only: true as const,
  synthetic_only: true as const,
  broker_neutral: true as const,
  real_broker_submission: false as const,
  avanza_live_access: false as const,
  credential_access: false as const,
  browser_or_cdp_access: false as const,
  automatic_execution: false as const,
  trade_mutation: false as const,
  production_write: false as const,
});

const zeroEffects = freezePlainTree({
  request_descriptor_reads: 0 as const,
  caller_getters_executed: 0 as const,
  recursive_caller_traversals: 0 as const,
  digest_operations: 0 as const,
  manual_confirmation_consumptions: 0 as const,
  synthetic_replay_admissions: 0 as const,
  transport_requests: 0 as const,
  provider_calls: 0 as const,
  credential_reads: 0 as const,
  database_reads: 0 as const,
  database_writes: 0 as const,
  process_spawns: 0 as const,
  trade_mutations: 0 as const,
});

const nonConsumptionEffects = freezePlainTree({
  ...zeroEffects,
  request_descriptor_reads: 1 as const,
  digest_operations: 1 as const,
});

const consumedEffects = freezePlainTree({
  ...nonConsumptionEffects,
  manual_confirmation_consumptions: 1 as const,
});

const emptyLineage = freezePlainTree({
  execution_identity: null,
  lifecycle_identity: null,
  preparation_trace_identity: null,
  handoff_identity: null,
  handoff_digest: null,
  risk_admission_identity: null,
  risk_admission_digest: null,
  confirmation_request_digest: null,
  confirmation_capability_digest: null,
  confirmation_consumption_digest: null,
  session_identity: null,
  idempotency_identity: null,
  submission_intent_identity: null,
}) as Action653hLineage;

const emptyDigests = freezePlainTree({
  request_snapshot_digest: null,
  preparation_digest: null,
  risk_admission_digest: null,
  confirmation_digest: null,
  rejected_input_digest: null,
}) as Action653hObservedDigests;

function snapshotFailure(
  reason: SnapshotFailureReason,
  path: string,
  budget: SnapshotBudgetState,
): SnapshotFailure {
  return freezePlainTree({
    ok: false as const,
    reason,
    witness_digest: digest("action_653h_snapshot_rejection", {
      policy_version: action653hSnapshotPolicyVersion,
      reason,
      path,
      nodes: budget.nodes,
      properties: budget.properties,
      string_bytes: budget.string_bytes,
    }),
  });
}

function clonePlainIteratively(
  value: unknown,
  rootPath: string,
  budget: SnapshotBudgetState,
):
  | Readonly<{ ok: true; value: PlainValue }>
  | SnapshotFailure {
  function primitive(
    current: unknown,
    path: string,
  ): PlainValue | SnapshotFailure | undefined {
    if (typeof current === "string") {
      budget.string_bytes += Buffer.byteLength(current, "utf8");
      if (
        budget.string_bytes >
        action653hSnapshotBudget.maximum_string_bytes
      ) {
        return snapshotFailure("snapshot_budget_exceeded", path, budget);
      }
      return current;
    }
    if (
      current === null ||
      typeof current === "boolean" ||
      (typeof current === "number" && Number.isFinite(current))
    ) {
      return current;
    }
    if (typeof current !== "object") {
      return snapshotFailure("non_plain_data_rejected", path, budget);
    }
    return undefined;
  }

  const first = primitive(value, rootPath);
  if (first !== undefined) {
    return "ok" in Object(first) && (first as SnapshotFailure).ok === false
      ? (first as SnapshotFailure)
      : freezePlainTree({ ok: true as const, value: first as PlainValue });
  }

  type Job = {
    source: object;
    target: PlainValue[] | Record<string, PlainValue>;
    path: string;
    depth: number;
  };

  const seen = new WeakSet<object>();
  const sourceRoot = value as object;
  if (nodeTypes.isProxy(sourceRoot)) {
    return snapshotFailure("proxy_rejected", rootPath, budget);
  }
  const rootPrototype = Object.getPrototypeOf(sourceRoot);
  if (
    !Array.isArray(sourceRoot) &&
    rootPrototype !== Object.prototype &&
    rootPrototype !== null
  ) {
    return snapshotFailure("non_plain_data_rejected", rootPath, budget);
  }
  const targetRoot: PlainValue[] | Record<string, PlainValue> =
    Array.isArray(sourceRoot) ? [] : Object.create(null);
  const stack: Job[] = [
    { source: sourceRoot, target: targetRoot, path: rootPath, depth: 0 },
  ];
  seen.add(sourceRoot);

  while (stack.length > 0) {
    const job = stack.pop()!;
    budget.nodes += 1;
    if (
      job.depth > action653hSnapshotBudget.maximum_depth ||
      budget.nodes > action653hSnapshotBudget.maximum_nodes
    ) {
      return snapshotFailure("snapshot_budget_exceeded", job.path, budget);
    }

    let descriptors: PropertyDescriptorMap;
    try {
      descriptors = Object.getOwnPropertyDescriptors(job.source);
    } catch {
      return snapshotFailure(
        "descriptor_inspection_failed",
        job.path,
        budget,
      );
    }
    const ownKeys = Reflect.ownKeys(descriptors);
    if (ownKeys.some((key) => typeof key !== "string")) {
      return snapshotFailure("non_plain_data_rejected", job.path, budget);
    }
    budget.properties += ownKeys.length;
    if (
      budget.properties >
      action653hSnapshotBudget.maximum_properties
    ) {
      return snapshotFailure("snapshot_budget_exceeded", job.path, budget);
    }

    let keys: string[];
    if (Array.isArray(job.source)) {
      const lengthDescriptor = descriptors.length;
      const length = lengthDescriptor?.value;
      if (
        !lengthDescriptor ||
        "get" in lengthDescriptor ||
        "set" in lengthDescriptor ||
        !Number.isSafeInteger(length) ||
        length < 0
      ) {
        return snapshotFailure(
          "descriptor_inspection_failed",
          `${job.path}.length`,
          budget,
        );
      }
      keys = [];
      for (let index = 0; index < length; index += 1) {
        keys.push(String(index));
      }
      const expected = new Set([...keys, "length"]);
      if (
        (ownKeys as string[]).some((key) => !expected.has(key)) ||
        ownKeys.length !== expected.size
      ) {
        return snapshotFailure("non_plain_data_rejected", job.path, budget);
      }
    } else {
      keys = (ownKeys as string[]).sort();
    }

    for (const key of keys) {
      const descriptor = descriptors[key];
      const childPath = Array.isArray(job.source)
        ? `${job.path}[${key}]`
        : `${job.path}.${key}`;
      if (
        !descriptor ||
        "get" in descriptor ||
        "set" in descriptor
      ) {
        return snapshotFailure("accessor_rejected", childPath, budget);
      }
      if (!descriptor.enumerable) {
        return snapshotFailure("non_plain_data_rejected", childPath, budget);
      }

      const primitiveValue = primitive(descriptor.value, childPath);
      if (primitiveValue !== undefined) {
        if (
          typeof primitiveValue === "object" &&
          primitiveValue !== null &&
          "ok" in primitiveValue &&
          primitiveValue.ok === false
        ) {
          return primitiveValue as SnapshotFailure;
        }
        (job.target as Record<string, PlainValue>)[key] =
          primitiveValue as PlainValue;
        continue;
      }

      const sourceChild = descriptor.value as object;
      if (nodeTypes.isProxy(sourceChild)) {
        return snapshotFailure("proxy_rejected", childPath, budget);
      }
      if (seen.has(sourceChild)) {
        return snapshotFailure("cycle_rejected", childPath, budget);
      }
      const prototype = Object.getPrototypeOf(sourceChild);
      if (
        !Array.isArray(sourceChild) &&
        prototype !== Object.prototype &&
        prototype !== null
      ) {
        return snapshotFailure(
          "non_plain_data_rejected",
          childPath,
          budget,
        );
      }
      const targetChild: PlainValue[] | Record<string, PlainValue> =
        Array.isArray(sourceChild) ? [] : Object.create(null);
      (job.target as Record<string, PlainValue>)[key] = targetChild;
      seen.add(sourceChild);
      stack.push({
        source: sourceChild,
        target: targetChild,
        path: childPath,
        depth: job.depth + 1,
      });
    }
  }

  return freezePlainTree({ ok: true as const, value: targetRoot });
}

function boundaryProjection(
  value: unknown,
  budget: SnapshotBudgetState,
):
  | Readonly<{
      boundary_identity: string;
      temporal_policy_version: string;
      confirm_present: true;
    }>
  | SnapshotFailure {
  const path = "$.confirmation_boundary";
  if (!value || typeof value !== "object") {
    return snapshotFailure("non_plain_data_rejected", path, budget);
  }
  if (nodeTypes.isProxy(value)) {
    return snapshotFailure("proxy_rejected", path, budget);
  }
  if (Object.getPrototypeOf(value) !== Object.prototype) {
    return snapshotFailure("non_plain_data_rejected", path, budget);
  }
  let descriptors: PropertyDescriptorMap;
  try {
    descriptors = Object.getOwnPropertyDescriptors(value);
  } catch {
    return snapshotFailure("descriptor_inspection_failed", path, budget);
  }
  budget.nodes += 1;
  const keys = Reflect.ownKeys(descriptors);
  budget.properties += keys.length;
  if (
    keys.some((key) => typeof key !== "string") ||
    keys.length !== boundaryKeys.length ||
    !boundaryKeys.every((key, index) => key === [...keys].sort()[index])
  ) {
    return snapshotFailure("request_shape_rejected", path, budget);
  }
  for (const key of boundaryKeys) {
    const descriptor = descriptors[key];
    if (
      !descriptor ||
      "get" in descriptor ||
      "set" in descriptor ||
      !descriptor.enumerable
    ) {
      return snapshotFailure("accessor_rejected", `${path}.${key}`, budget);
    }
  }
  const confirm = descriptors.confirm.value;
  if (
    typeof confirm !== "function" ||
    nodeTypes.isProxy(confirm)
  ) {
    return snapshotFailure(
      "non_plain_data_rejected",
      `${path}.confirm`,
      budget,
    );
  }
  const boundaryIdentity = descriptors.boundary_identity.value;
  const temporalPolicyVersion =
    descriptors.temporal_policy_version.value;
  if (
    typeof boundaryIdentity !== "string" ||
    typeof temporalPolicyVersion !== "string"
  ) {
    return snapshotFailure("non_plain_data_rejected", path, budget);
  }
  budget.string_bytes +=
    Buffer.byteLength(boundaryIdentity, "utf8") +
    Buffer.byteLength(temporalPolicyVersion, "utf8");
  return freezePlainTree({
    boundary_identity: boundaryIdentity,
    temporal_policy_version: temporalPolicyVersion,
    confirm_present: true as const,
  });
}

function captureRequest(value: unknown): SnapshotSuccess | SnapshotFailure {
  const budget: SnapshotBudgetState = {
    nodes: 0,
    properties: 0,
    string_bytes: 0,
  };
  if (!value || typeof value !== "object") {
    return snapshotFailure("request_shape_rejected", "$", budget);
  }
  if (nodeTypes.isProxy(value)) {
    return snapshotFailure("proxy_rejected", "$", budget);
  }
  if (
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    return snapshotFailure("request_shape_rejected", "$", budget);
  }

  let descriptors: PropertyDescriptorMap;
  try {
    descriptors = Object.getOwnPropertyDescriptors(value);
  } catch {
    return snapshotFailure("descriptor_inspection_failed", "$", budget);
  }
  budget.nodes += 1;
  const keys = Reflect.ownKeys(descriptors);
  budget.properties += keys.length;
  const sortedKeys = [...keys].sort();
  if (
    keys.some((key) => typeof key !== "string") ||
    keys.length !== requestKeys.length ||
    !requestKeys.every((key, index) => key === sortedKeys[index])
  ) {
    return snapshotFailure("request_shape_rejected", "$", budget);
  }
  for (const key of requestKeys) {
    const descriptor = descriptors[key];
    if (
      !descriptor ||
      "get" in descriptor ||
      "set" in descriptor ||
      !descriptor.enumerable
    ) {
      return snapshotFailure("accessor_rejected", `$.${key}`, budget);
    }
  }

  const handles: RequestHandles = {
    prepared: descriptors.prepared.value,
    risk_admission: descriptors.risk_admission.value,
    confirmation_boundary: descriptors.confirmation_boundary.value,
    confirmation_capability: descriptors.confirmation_capability.value,
  };
  const prepared = clonePlainIteratively(
    handles.prepared,
    "$.prepared",
    budget,
  );
  if (!prepared.ok) return prepared;
  const risk = clonePlainIteratively(
    handles.risk_admission,
    "$.risk_admission",
    budget,
  );
  if (!risk.ok) return risk;
  const capability = clonePlainIteratively(
    handles.confirmation_capability,
    "$.confirmation_capability",
    budget,
  );
  if (!capability.ok) return capability;
  const boundary = boundaryProjection(
    handles.confirmation_boundary,
    budget,
  );
  if ("ok" in boundary && boundary.ok === false) return boundary;
  const consumedAt = descriptors.consumed_at.value;
  const observedAt = descriptors.observed_at.value;
  if (typeof consumedAt !== "string" || typeof observedAt !== "string") {
    return snapshotFailure("non_plain_data_rejected", "$.timestamps", budget);
  }
  const canonicalConsumedAt =
    canonicalizeAction650uNanosecondInstant(consumedAt)?.canonical_instant ??
    consumedAt;
  const canonicalObservedAt =
    canonicalizeAction650uNanosecondInstant(observedAt)?.canonical_instant ??
    observedAt;
  budget.string_bytes +=
    Buffer.byteLength(canonicalConsumedAt, "utf8") +
    Buffer.byteLength(canonicalObservedAt, "utf8");
  if (
    budget.nodes > action653hSnapshotBudget.maximum_nodes ||
    budget.properties > action653hSnapshotBudget.maximum_properties ||
    budget.string_bytes > action653hSnapshotBudget.maximum_string_bytes
  ) {
    return snapshotFailure("snapshot_budget_exceeded", "$", budget);
  }

  const snapshot = freezePlainTree({
    prepared: prepared.value,
    risk_admission: risk.value,
    confirmation_boundary: boundary,
    confirmation_capability: capability.value,
    consumed_at: canonicalConsumedAt,
    observed_at: canonicalObservedAt,
  }) as RequestSnapshot;
  return Object.freeze({
    ok: true as const,
    snapshot,
    handles: Object.freeze(handles),
    witness_digest: digest("action_653h_snapshot_witness", {
      policy_version: action653hSnapshotPolicyVersion,
      nodes: budget.nodes,
      properties: budget.properties,
      string_bytes: budget.string_bytes,
      snapshot_digest: digest("action_653h_snapshot", snapshot),
    }),
  });
}

function addNanoseconds(canonicalInstant: string, amount: bigint) {
  const matched =
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.(\d{9})Z$/.exec(
      canonicalInstant,
    );
  if (!matched) return null;
  const seconds =
    BigInt(Date.parse(`${matched[1]}Z`)) * BigInt(1_000_000);
  const nanoseconds = seconds + BigInt(matched[2]) + amount;
  const milliseconds = Number(nanoseconds / BigInt(1_000_000));
  const remainder = nanoseconds % BigInt(1_000_000_000);
  return `${new Date(milliseconds).toISOString().slice(0, 19)}.${remainder
    .toString()
    .padStart(9, "0")}Z`;
}

function instructionExpiresAt(createdAt: string, sessionExpiresAt: string) {
  const ttl = addNanoseconds(createdAt, BigInt(30_000_000_000));
  if (!ttl) return null;
  const ttlInstant = canonicalizeAction650uNanosecondInstant(ttl);
  const sessionInstant =
    canonicalizeAction650uNanosecondInstant(sessionExpiresAt);
  if (!ttlInstant || !sessionInstant) return null;
  return compareAction650uInstants(ttlInstant, sessionInstant) <= 0
    ? ttlInstant.canonical_instant
    : sessionInstant.canonical_instant;
}

function scaledPayload(prepared: Action650sPreparedExecution) {
  const quantity = prepared.handoff.payload.quantity;
  const price = prepared.handoff.payload.limit_price;
  if (
    !Number.isSafeInteger(quantity) ||
    quantity <= 0 ||
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return null;
  }
  const priceMicrosNumber = price * 1_000_000;
  if (!Number.isSafeInteger(priceMicrosNumber)) return null;
  const quantityUnits = BigInt(quantity);
  const priceMicros = BigInt(priceMicrosNumber);
  return freezePlainTree({
    quantity_units: quantityUnits.toString(),
    price_micros: priceMicros.toString(),
    notional_micros: (quantityUnits * priceMicros).toString(),
  });
}

function lineageMatches(
  prepared: Action650sPreparedExecution,
  risk: Action652cAdmissionResult,
  capability: Action650uManualConfirmationCapability,
) {
  const lineage = risk.predecessor_admission?.lineage;
  const intent = risk.predecessor_admission?.intent_projection;
  const payload = prepared.handoff.payload;
  return Boolean(
    lineage &&
      intent &&
      risk.admission_status === "admitted" &&
      risk.manual_confirmation_admission !== false &&
      lineage.execution_identity ===
        prepared.runtime_identity_context.execution_identity &&
      lineage.lifecycle_identity ===
        prepared.runtime_identity_context.lifecycle_identity &&
      lineage.preparation_trace_identity === prepared.trace_identity &&
      lineage.handoff_identity === prepared.handoff.identity.handoff_identity &&
      lineage.handoff_digest === prepared.handoff.identity.handoff_digest &&
      lineage.canonical_order_payload_digest ===
        prepared.handoff.identity.canonical_order_payload_digest &&
      lineage.idempotency_identity ===
        prepared.handoff.identity.idempotency_identity &&
      capability.execution_identity === lineage.execution_identity &&
      capability.lifecycle_identity === lineage.lifecycle_identity &&
      capability.runtime_identity_context_digest ===
        prepared.runtime_identity_context_digest &&
      capability.handoff_identity === lineage.handoff_identity &&
      capability.handoff_digest === lineage.handoff_digest &&
      capability.canonical_order_payload_digest ===
        lineage.canonical_order_payload_digest &&
      capability.idempotency_identity === lineage.idempotency_identity &&
      capability.session_identity === lineage.session_identity &&
      capability.ticker === payload.ticker &&
      capability.side === payload.side &&
      capability.quantity === payload.quantity &&
      capability.order_type === payload.order_type &&
      capability.limit_price === payload.limit_price &&
      capability.stop_price === payload.stop_price &&
      intent.instrument === payload.ticker &&
      intent.side === payload.side,
  );
}

function payloadParity(
  prepared: Action650sPreparedExecution,
  risk: Action652cAdmissionResult,
) {
  const intent = risk.predecessor_admission?.intent_projection;
  const scaled = scaledPayload(prepared);
  if (!intent || !scaled) {
    return freezePlainTree({ unit: false as const, matches: false as const });
  }
  const unit =
    intent.quantity.scale === 0 &&
    intent.quantity.unit === "units" &&
    intent.limit_price.scale === 6 &&
    intent.limit_price.unit === "SEK_micros_per_unit" &&
    intent.notional.scale === 6 &&
    intent.notional.unit === "SEK_micros";
  return freezePlainTree({
    unit,
    matches:
      unit &&
      intent.quantity.value === scaled.quantity_units &&
      intent.limit_price.value === scaled.price_micros &&
      intent.notional.value === scaled.notional_micros,
    scaled,
  });
}

function lineageProjection(
  snapshot: RequestSnapshot | null,
  confirmationConsumptionDigest: string | null,
  submissionIntentIdentity: string | null,
): Action653hLineage {
  if (!snapshot) return emptyLineage;
  const prepared = snapshot.prepared;
  const risk = snapshot.risk_admission;
  const capability = snapshot.confirmation_capability;
  return freezePlainTree({
    execution_identity:
      prepared.runtime_identity_context?.execution_identity ?? null,
    lifecycle_identity:
      prepared.runtime_identity_context?.lifecycle_identity ?? null,
    preparation_trace_identity: prepared.trace_identity ?? null,
    handoff_identity: prepared.handoff?.identity?.handoff_identity ?? null,
    handoff_digest: prepared.handoff?.identity?.handoff_digest ?? null,
    risk_admission_identity:
      risk.manual_confirmation_admission === false
        ? null
        : (risk.manual_confirmation_admission?.admission_identity ?? null),
    risk_admission_digest: risk.terminal_digest ?? null,
    confirmation_request_digest:
      capability.confirmation_request_digest ?? null,
    confirmation_capability_digest: capability.capability_digest ?? null,
    confirmation_consumption_digest: confirmationConsumptionDigest,
    session_identity: capability.session_identity ?? null,
    idempotency_identity:
      prepared.handoff?.identity?.idempotency_identity ?? null,
    submission_intent_identity: submissionIntentIdentity,
  });
}

function observedDigests(
  snapshot: RequestSnapshot | null,
  snapshotDigest: string | null,
  rejectedInputDigest: string | null,
): Action653hObservedDigests {
  if (!snapshot) {
    return freezePlainTree({
      ...emptyDigests,
      rejected_input_digest: rejectedInputDigest,
    });
  }
  return freezePlainTree({
    request_snapshot_digest: snapshotDigest,
    preparation_digest: digest("action_653h_preparation", {
      trace_identity: snapshot.prepared.trace_identity,
      runtime_identity_context_digest:
        snapshot.prepared.runtime_identity_context_digest,
      handoff_digest: snapshot.prepared.handoff.identity.handoff_digest,
    }),
    risk_admission_digest: snapshot.risk_admission.terminal_digest,
    confirmation_digest:
      snapshot.confirmation_capability.capability_digest,
    rejected_input_digest: rejectedInputDigest,
  });
}

function terminalProjection(
  input: Omit<Action653hInstructionResult, "envelope_digest">,
) {
  return {
    contract_version: input.contract_version,
    snapshot_policy_version: input.snapshot_policy_version,
    pre_consumption_policy_version: input.pre_consumption_policy_version,
    gate_status: input.gate_status,
    instruction_status: input.instruction_status,
    terminal_reason: input.terminal_reason,
    snapshot_digest: input.snapshot_digest,
    lineage: input.lineage,
    instruction: input.instruction,
    observed_input_digests: input.observed_input_digests,
    failure_provenance: input.failure_provenance,
    safety: input.safety,
    effects: input.effects,
  };
}

export function rebuildAction653hEnvelopeDigest(
  input: Omit<Action653hInstructionResult, "envelope_digest">,
) {
  return digest("action_653h_instruction_envelope", terminalProjection(input));
}

export function rebuildAction653hFailureDigest(input: {
  terminal_reason: Exclude<
    Action653hInstructionReason,
    "instruction_prepared"
  >;
  observed_rejected_input_digests: Action653hObservedDigests;
  lineage: Action653hLineage;
}) {
  return digest("action_653h_failure", input);
}

function finish(
  gateStatus: "enabled" | "disabled" | "kill_switch_active",
  partial: Omit<
    Action653hInstructionResult,
    | "contract_version"
    | "snapshot_policy_version"
    | "pre_consumption_policy_version"
    | "gate_status"
    | "envelope_digest"
    | "safety"
  >,
): Action653hInstructionResult {
  const withoutEnvelope = {
    contract_version: action653hContractVersion,
    snapshot_policy_version: action653hSnapshotPolicyVersion,
    pre_consumption_policy_version:
      action653hPreConsumptionPolicyVersion,
    gate_status: gateStatus,
    ...partial,
    safety,
  };
  return freezePlainTree({
    ...withoutEnvelope,
    envelope_digest:
      gateStatus === "enabled"
        ? rebuildAction653hEnvelopeDigest(withoutEnvelope)
        : null,
  }) as Action653hInstructionResult;
}

function fail(
  status: Exclude<Action653hInstructionStatus, "prepared">,
  reason: Exclude<Action653hInstructionReason, "instruction_prepared">,
  input: {
    snapshot: RequestSnapshot | null;
    snapshot_digest: string | null;
    rejected_input_digest: string;
  },
) {
  const digests = observedDigests(
    input.snapshot,
    input.snapshot_digest,
    input.rejected_input_digest,
  );
  const lineage = lineageProjection(input.snapshot, null, null);
  const failureWithoutDigest = {
    terminal_reason: reason,
    observed_rejected_input_digests: digests,
  };
  return finish("enabled", {
    instruction_status: status,
    terminal_reason: reason,
    snapshot_digest: input.snapshot_digest,
    lineage,
    instruction: null,
    observed_input_digests: digests,
    failure_provenance: freezePlainTree({
      ...failureWithoutDigest,
      failure_digest: rebuildAction653hFailureDigest({
        ...failureWithoutDigest,
        lineage,
      }),
    }),
    effects: nonConsumptionEffects,
  });
}

function staticGateResult(
  gateStatus: "disabled" | "kill_switch_active",
) {
  return finish(gateStatus, {
    instruction_status: "blocked",
    terminal_reason:
      gateStatus === "disabled" ? "instruction_disabled" : "kill_switch_active",
    snapshot_digest: null,
    lineage: emptyLineage,
    instruction: null,
    observed_input_digests: emptyDigests,
    failure_provenance: null,
    effects: zeroEffects,
  });
}

const disabledResult = staticGateResult("disabled");
const killedResult = staticGateResult("kill_switch_active");

function predictedConsumptionDigest(
  capability: Action650uManualConfirmationCapability,
  consumedAt: string,
) {
  const projection = {
    contract_version:
      "action_650u_manual_confirmation_consumption_receipt_v1" as const,
    temporal_policy_version: action650uTemporalConfirmationPolicyVersion,
    confirmation_request_digest: capability.confirmation_request_digest,
    capability_digest: capability.capability_digest,
    execution_identity: capability.execution_identity,
    lifecycle_identity: capability.lifecycle_identity,
    handoff_digest: capability.handoff_digest,
    confirmed_at: capability.confirmed_at,
    waiting_for_manual_confirmation_at:
      capability.waiting_for_manual_confirmation_at,
    session_started_at: capability.session_started_at,
    session_expires_at: capability.session_expires_at,
    consumed_at: consumedAt,
    consumption_state: "consumed" as const,
    authority_scope: action650uManualConfirmationAuthorityScope,
  };
  const consumptionProjectionDigest =
    `action_650u_consumption_projection_${hashAction650sCanonicalValue(
      projection,
    )}`;
  return `action_650u_confirmation_receipt_${hashAction650sCanonicalValue({
    ...projection,
    consumption_projection_digest: consumptionProjectionDigest,
  })}`;
}

export function runAction653hSafeInstructionSuccessor(
  gate: Readonly<{ enabled: boolean; kill_switch_active: boolean }>,
  request: unknown,
): Action653hInstructionResult {
  if (!gate.enabled) return disabledResult;
  if (gate.kill_switch_active) return killedResult;

  const captured = captureRequest(request);
  if (!captured.ok) {
    return fail("unmappable", "input_snapshot_rejected", {
      snapshot: null,
      snapshot_digest: null,
      rejected_input_digest: captured.witness_digest,
    });
  }

  const snapshot = captured.snapshot;
  const handles = captured.handles;
  const snapshotDigest = digest("action_653h_snapshot", snapshot);
  const rejectedDigest = digest("action_653h_rejected_input", {
    snapshot_digest: snapshotDigest,
    descriptor_witness_digest: captured.witness_digest,
  });
  const prepared = snapshot.prepared;
  const risk = snapshot.risk_admission;
  const capability = snapshot.confirmation_capability;

  if (
    handles.confirmation_capability &&
    typeof handles.confirmation_capability === "object"
  ) {
    const prior = consumptionRecords.get(handles.confirmation_capability);
    if (prior) {
      if (prior.request_snapshot_digest === snapshotDigest) {
        return prior.result;
      }
      return fail(
        "conflicting",
        prepared.runtime_identity_context?.execution_identity !==
          prior.execution_identity
          ? "cross_execution_reuse_rejected"
          : "conflicting_instruction_reuse",
        {
          snapshot,
          snapshot_digest: snapshotDigest,
          rejected_input_digest: rejectedDigest,
        },
      );
    }
  }

  if (!hasAction650sPreparedExecutionProvenance(handles.prepared)) {
    return fail("blocked", "preparation_provenance_unproven", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (!canAction652cProceedToManualConfirmation(handles.risk_admission)) {
    return fail("blocked", "risk_admission_unproven", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (
    !handles.confirmation_capability ||
    typeof handles.confirmation_capability !== "object" ||
    getAction650uManualConfirmationConsumptionState(
      handles.confirmation_capability,
    ) !== "unconsumed" ||
    !verifyAction650uManualConfirmationCapability(
      handles.confirmation_capability as Action650uManualConfirmationCapability,
    )
  ) {
    return fail("blocked", "confirmation_provenance_unproven", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (
    !handles.confirmation_boundary ||
    typeof handles.confirmation_boundary !== "object"
  ) {
    return fail("blocked", "confirmation_provenance_unproven", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (
    prepared.current_state !== "waiting_for_manual_confirmation" ||
    prepared.handoff.payload.execution_mode !== "semi_automatic" ||
    capability.execution_mode !== "semi_automatic"
  ) {
    return fail("blocked", "automatic_execution_rejected", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (
    risk.admission_status !== "admitted" ||
    risk.manual_confirmation_admission === false ||
    !risk.terminal_digest
  ) {
    return fail("blocked", "risk_admission_not_admitted", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (!lineageMatches(prepared, risk, capability)) {
    return fail("conflicting", "execution_lineage_mismatch", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (
    snapshot.confirmation_boundary.temporal_policy_version !==
      capability.temporal_policy_version ||
    capability.session_identity !==
      risk.predecessor_admission?.lineage?.session_identity
  ) {
    return fail("conflicting", "session_lineage_mismatch", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }

  const parity = payloadParity(prepared, risk);
  if (!parity.unit) {
    return fail("unmappable", "unit_scale_currency_mismatch", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (!parity.matches || !("scaled" in parity)) {
    return fail("conflicting", "quantity_price_notional_mismatch", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }

  const consumedAt =
    canonicalizeAction650uNanosecondInstant(snapshot.consumed_at);
  const observedAt =
    canonicalizeAction650uNanosecondInstant(snapshot.observed_at);
  const confirmedAt =
    canonicalizeAction650uNanosecondInstant(capability.confirmed_at);
  const sessionExpiresAt =
    canonicalizeAction650uNanosecondInstant(capability.session_expires_at);
  if (!consumedAt || !observedAt || !confirmedAt || !sessionExpiresAt) {
    return fail("unmappable", "timestamp_unmappable", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (
    compareAction650uInstants(consumedAt, confirmedAt) < 0 ||
    compareAction650uInstants(observedAt, consumedAt) < 0
  ) {
    return fail("unmappable", "timestamp_unmappable", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (compareAction650uInstants(consumedAt, sessionExpiresAt) >= 0) {
    return fail("expired", "confirmation_expired", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }
  const expiresAt = instructionExpiresAt(
    consumedAt.canonical_instant,
    sessionExpiresAt.canonical_instant,
  );
  const expiresInstant = expiresAt
    ? canonicalizeAction650uNanosecondInstant(expiresAt)
    : null;
  if (!expiresAt || !expiresInstant) {
    return fail("unmappable", "timestamp_unmappable", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (compareAction650uInstants(observedAt, expiresInstant) >= 0) {
    return fail("expired", "instruction_expired", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (
    !prepared.handoff.identity.idempotency_identity ||
    snapshot.confirmation_boundary.confirm_present !== true
  ) {
    return fail("unmappable", "instruction_identity_invalid", {
      snapshot,
      snapshot_digest: snapshotDigest,
      rejected_input_digest: rejectedDigest,
    });
  }

  const confirmationConsumptionDigest = predictedConsumptionDigest(
    capability,
    consumedAt.canonical_instant,
  );
  const submissionIntentSeed = {
    contract_version: action653hContractVersion,
    snapshot_digest: snapshotDigest,
    execution_identity:
      prepared.runtime_identity_context.execution_identity,
    risk_admission_digest: risk.terminal_digest,
    confirmation_consumption_digest: confirmationConsumptionDigest,
    idempotency_identity: prepared.handoff.identity.idempotency_identity,
    destination_identity: action653hSyntheticDestinationIdentity,
  };
  const submissionIntentIdentity =
    `action_653h_submission_intent_${hashAction650sCanonicalValue(
      submissionIntentSeed,
    ).slice(0, 24)}`;
  const instructionWithoutDigest = {
    schema_version: action653hInstructionSchemaVersion,
    destination_identity: action653hSyntheticDestinationIdentity,
    snapshot_digest: snapshotDigest,
    execution_identity:
      prepared.runtime_identity_context.execution_identity,
    lifecycle_identity:
      prepared.runtime_identity_context.lifecycle_identity,
    preparation_trace_identity: prepared.trace_identity,
    handoff_identity: prepared.handoff.identity.handoff_identity,
    handoff_digest: prepared.handoff.identity.handoff_digest,
    risk_admission_identity:
      risk.manual_confirmation_admission.admission_identity,
    risk_admission_digest: risk.terminal_digest,
    confirmation_request_digest: capability.confirmation_request_digest,
    confirmation_capability_digest: capability.capability_digest,
    confirmation_consumption_digest: confirmationConsumptionDigest,
    session_identity: capability.session_identity,
    instrument: prepared.handoff.payload.ticker,
    side: prepared.handoff.payload.side,
    quantity: {
      value: parity.scaled.quantity_units,
      scale: 0 as const,
      unit: "units" as const,
    },
    limit_price: {
      value: parity.scaled.price_micros,
      scale: 6 as const,
      unit: "SEK_micros_per_unit" as const,
      currency: "SEK" as const,
    },
    notional: {
      value: parity.scaled.notional_micros,
      scale: 6 as const,
      unit: "SEK_micros" as const,
      currency: "SEK" as const,
    },
    idempotency_identity: prepared.handoff.identity.idempotency_identity,
    submission_intent_identity: submissionIntentIdentity,
    instruction_created_at: consumedAt.canonical_instant,
    instruction_expires_at: expiresAt,
  };
  const instruction = freezePlainTree({
    ...instructionWithoutDigest,
    instruction_digest: digest(
      "action_653h_broker_neutral_instruction",
      instructionWithoutDigest,
    ),
  }) as Action653hBrokerNeutralInstruction;
  const lineage = lineageProjection(
    snapshot,
    confirmationConsumptionDigest,
    submissionIntentIdentity,
  );
  const preparedResult = finish("enabled", {
    instruction_status: "prepared",
    terminal_reason: "instruction_prepared",
    snapshot_digest: snapshotDigest,
    lineage,
    instruction,
    observed_input_digests: observedDigests(
      snapshot,
      snapshotDigest,
      null,
    ),
    failure_provenance: null,
    effects: consumedEffects,
  });

  const consumed = consumeAction650uManualConfirmation({
    boundary:
      handles.confirmation_boundary as Action650uManualConfirmationBoundary,
    prepared: handles.prepared as Action650sPreparedExecution,
    capability:
      handles.confirmation_capability as Action650uManualConfirmationCapability,
    consumed_at: consumedAt.canonical_instant,
  });
  if (!consumed.ok) {
    return fail(
      consumed.reason === "capability_expired" ? "expired" : "blocked",
      consumed.reason === "capability_expired"
        ? "confirmation_expired"
        : "confirmation_rejected",
      {
        snapshot,
        snapshot_digest: snapshotDigest,
        rejected_input_digest: digest(
          "action_653h_confirmation_rejection",
          { rejected_digest: rejectedDigest, reason: consumed.reason },
        ),
      },
    );
  }

  preparedResultProvenance.add(preparedResult);
  consumptionRecords.set(
    handles.confirmation_capability as object,
    {
      request_snapshot_digest: snapshotDigest,
      execution_identity:
        prepared.runtime_identity_context.execution_identity,
      result: preparedResult,
    },
  );
  return preparedResult;
}

export function canAction653hProceedToSyntheticReplay(value: unknown) {
  if (
    !value ||
    typeof value !== "object" ||
    !preparedResultProvenance.has(value as object)
  ) {
    return false;
  }
  const result = value as Action653hInstructionResult;
  if (
    !Object.isFrozen(result) ||
    result.instruction_status !== "prepared" ||
    !result.instruction ||
    !result.envelope_digest ||
    result.instruction.destination_identity !==
      action653hSyntheticDestinationIdentity
  ) {
    return false;
  }
  const { envelope_digest: claimed, ...withoutEnvelope } = result;
  return claimed === rebuildAction653hEnvelopeDigest(withoutEnvelope);
}

export function replayAction653hPreparedInstruction(
  value: unknown,
  observedAtValue: unknown,
): Action653hSyntheticReplayEvidence | null {
  if (!canAction653hProceedToSyntheticReplay(value)) return null;
  const result = value as Action653hInstructionResult;
  const instruction = result.instruction!;
  const observedAt =
    canonicalizeAction650uNanosecondInstant(observedAtValue);
  const expiresAt = canonicalizeAction650uNanosecondInstant(
    instruction.instruction_expires_at,
  );
  if (
    !observedAt ||
    !expiresAt ||
    compareAction650uInstants(observedAt, expiresAt) >= 0
  ) {
    return null;
  }
  const withoutDigest = {
    contract_version: "action_653h_synthetic_replay_gate_v1" as const,
    destination_identity: action653hSyntheticDestinationIdentity,
    execution_identity: instruction.execution_identity,
    submission_intent_identity: instruction.submission_intent_identity,
    instruction_digest: instruction.instruction_digest,
    instruction_envelope_digest: result.envelope_digest!,
    observed_at: observedAt.canonical_instant,
    accepted: true as const,
    synthetic_only: true as const,
  };
  return freezePlainTree({
    ...withoutDigest,
    evidence_digest: digest(
      "action_653h_synthetic_replay_evidence",
      withoutDigest,
    ),
  });
}
