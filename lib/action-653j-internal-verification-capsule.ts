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

export const action653jContractVersion =
  "action_653j_internal_verification_capsule_v3" as const;
export const action653jCapsulePolicyVersion =
  "action_653j_single_boundary_private_runtime_capsule_v1" as const;
export const action653jSnapshotPolicyVersion =
  "action_653j_iterative_descriptor_snapshot_v1" as const;
export const action653jInstructionSchemaVersion =
  "action_653j_broker_neutral_instruction_schema_v3" as const;
export const action653jSyntheticDestinationIdentity =
  "action_653j_synthetic_replay_only" as const;

export const action653jSnapshotBudget = Object.freeze({
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

export type Action653jInstructionStatus =
  | "prepared"
  | "blocked"
  | "expired"
  | "conflicting"
  | "unmappable";

export type Action653jInstructionReason =
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

export type Action653jExecutionInstructionRequest = Readonly<{
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

type BoundaryHandles = Readonly<{
  prepared: unknown;
  risk_admission: unknown;
  confirmation_boundary: unknown;
  confirmation_capability: unknown;
}>;

export type Action653jInternalVerificationCapsule = Readonly<{
  contract_version: typeof action653jContractVersion;
  capsule_policy_version: typeof action653jCapsulePolicyVersion;
  snapshot_digest: string;
  descriptor_witness_digest: string;
  runtime_provenance_binding_digest: string;
  identity_binding_digest: string;
  instruction_digest: string;
  capsule_digest: string;
}>;

export type Action653jBrokerNeutralInstruction = Readonly<{
  schema_version: typeof action653jInstructionSchemaVersion;
  destination_identity: typeof action653jSyntheticDestinationIdentity;
  capsule_digest: string;
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

type Action653jLineage = Readonly<{
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

type Action653jObservedDigests = Readonly<{
  request_snapshot_digest: string | null;
  preparation_digest: string | null;
  risk_admission_digest: string | null;
  confirmation_digest: string | null;
  rejected_input_digest: string | null;
}>;

export type Action653jInstructionResult = Readonly<{
  contract_version: typeof action653jContractVersion;
  capsule_policy_version: typeof action653jCapsulePolicyVersion;
  snapshot_policy_version: typeof action653jSnapshotPolicyVersion;
  gate_status: "enabled" | "disabled" | "kill_switch_active";
  instruction_status: Action653jInstructionStatus;
  terminal_reason: Action653jInstructionReason;
  snapshot_digest: string | null;
  capsule_digest: string | null;
  lineage: Action653jLineage;
  instruction: Action653jBrokerNeutralInstruction | null;
  observed_input_digests: Action653jObservedDigests;
  failure_provenance: Readonly<{
    terminal_reason: Exclude<
      Action653jInstructionReason,
      "instruction_prepared"
    >;
    observed_rejected_input_digests: Action653jObservedDigests;
    failure_digest: string;
  }> | null;
  envelope_digest: string | null;
  safety: Readonly<{
    diagnostic_only: true;
    synthetic_only: true;
    broker_neutral: true;
    internal_verification_capsule: true;
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
    caller_handle_acquisitions: 0 | 1;
    caller_handle_provenance_verifications: 0 | 1;
    caller_getters_executed: 0;
    recursive_caller_traversals: 0;
    post_snapshot_caller_reads: 0;
    caller_handles_forwarded_downstream: false;
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

export type Action653jSyntheticReplayEvidence = Readonly<{
  contract_version: "action_653j_synthetic_replay_gate_v1";
  destination_identity: typeof action653jSyntheticDestinationIdentity;
  execution_identity: string;
  submission_intent_identity: string;
  instruction_digest: string;
  instruction_envelope_digest: string;
  observed_at: string;
  accepted: true;
  synthetic_only: true;
  evidence_digest: string;
}>;

export type Action653jCapsuleIssue =
  | Readonly<{
      status: "capsule_ready";
      capsule: Action653jInternalVerificationCapsule;
      result: Action653jInstructionResult;
    }>
  | Readonly<{
      status: "terminal_result";
      result: Action653jInstructionResult;
    }>;

type SnapshotBudgetState = {
  nodes: number;
  properties: number;
  string_bytes: number;
};

type SnapshotSuccess = Readonly<{
  ok: true;
  snapshot: RequestSnapshot;
  handles: BoundaryHandles;
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
  result: Action653jInstructionResult;
}>;

type CapsuleRuntimeState = Readonly<{
  result: Action653jInstructionResult;
  runtime_provenance_binding_digest: string;
  identity_binding_digest: string;
}>;

type ValidatedProjection = Readonly<{
  consumed_at: string;
  observed_at: string;
  instruction_expires_at: string;
  confirmation_consumption_digest: string;
  submission_intent_identity: string;
  quantity_units: string;
  price_micros: string;
  notional_micros: string;
}>;

type ValidationFailure = Readonly<{
  ok: false;
  status: Exclude<Action653jInstructionStatus, "prepared">;
  reason: Exclude<Action653jInstructionReason, "instruction_prepared">;
}>;

type ValidationSuccess = Readonly<{
  ok: true;
  projection: ValidatedProjection;
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

const capsuleRuntimeStates =
  new WeakMap<Action653jInternalVerificationCapsule, CapsuleRuntimeState>();
const resultProvenance = new WeakSet<object>();
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
  internal_verification_capsule: true as const,
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
  caller_handle_acquisitions: 0 as const,
  caller_handle_provenance_verifications: 0 as const,
  caller_getters_executed: 0 as const,
  recursive_caller_traversals: 0 as const,
  post_snapshot_caller_reads: 0 as const,
  caller_handles_forwarded_downstream: false as const,
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

const inspectedEffects = freezePlainTree({
  ...zeroEffects,
  request_descriptor_reads: 1 as const,
  caller_handle_acquisitions: 1 as const,
  caller_handle_provenance_verifications: 1 as const,
  digest_operations: 1 as const,
});

const consumedEffects = freezePlainTree({
  ...inspectedEffects,
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
}) as Action653jLineage;

const emptyDigests = freezePlainTree({
  request_snapshot_digest: null,
  preparation_digest: null,
  risk_admission_digest: null,
  confirmation_digest: null,
  rejected_input_digest: null,
}) as Action653jObservedDigests;

function snapshotFailure(
  reason: SnapshotFailureReason,
  path: string,
  budget: SnapshotBudgetState,
): SnapshotFailure {
  return freezePlainTree({
    ok: false as const,
    reason,
    witness_digest: digest("action_653j_snapshot_rejection", {
      policy_version: action653jSnapshotPolicyVersion,
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
): Readonly<{ ok: true; value: PlainValue }> | SnapshotFailure {
  function primitive(
    current: unknown,
    path: string,
  ): PlainValue | SnapshotFailure | undefined {
    if (typeof current === "string") {
      budget.string_bytes += Buffer.byteLength(current, "utf8");
      if (
        budget.string_bytes >
        action653jSnapshotBudget.maximum_string_bytes
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
    return typeof first === "object" &&
      first !== null &&
      "ok" in first &&
      first.ok === false
      ? (first as SnapshotFailure)
      : freezePlainTree({ ok: true as const, value: first as PlainValue });
  }

  type Job = {
    source: object;
    target: PlainValue[] | Record<string, PlainValue>;
    path: string;
    depth: number;
  };

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
  const seen = new WeakSet<object>();
  const stack: Job[] = [
    { source: sourceRoot, target: targetRoot, path: rootPath, depth: 0 },
  ];
  seen.add(sourceRoot);

  while (stack.length > 0) {
    const job = stack.pop()!;
    budget.nodes += 1;
    if (
      job.depth > action653jSnapshotBudget.maximum_depth ||
      budget.nodes > action653jSnapshotBudget.maximum_nodes
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
      action653jSnapshotBudget.maximum_properties
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

function projectBoundary(
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
  const sortedKeys = [...keys].sort();
  if (
    keys.some((key) => typeof key !== "string") ||
    keys.length !== boundaryKeys.length ||
    !boundaryKeys.every((key, index) => key === sortedKeys[index])
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
  if (typeof confirm !== "function" || nodeTypes.isProxy(confirm)) {
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

function captureBoundary(value: unknown): SnapshotSuccess | SnapshotFailure {
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

  const handles = Object.freeze({
    prepared: descriptors.prepared.value,
    risk_admission: descriptors.risk_admission.value,
    confirmation_boundary: descriptors.confirmation_boundary.value,
    confirmation_capability: descriptors.confirmation_capability.value,
  });
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
  const boundary = projectBoundary(
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
    budget.nodes > action653jSnapshotBudget.maximum_nodes ||
    budget.properties > action653jSnapshotBudget.maximum_properties ||
    budget.string_bytes > action653jSnapshotBudget.maximum_string_bytes
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
    handles,
    witness_digest: digest("action_653j_snapshot_witness", {
      policy_version: action653jSnapshotPolicyVersion,
      nodes: budget.nodes,
      properties: budget.properties,
      string_bytes: budget.string_bytes,
      snapshot_digest: digest("action_653j_snapshot", snapshot),
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
  const projectionDigest =
    `action_650u_consumption_projection_${hashAction650sCanonicalValue(
      projection,
    )}`;
  return `action_650u_confirmation_receipt_${hashAction650sCanonicalValue({
    ...projection,
    consumption_projection_digest: projectionDigest,
  })}`;
}

function validateSnapshot(
  snapshot: RequestSnapshot,
): ValidationFailure | ValidationSuccess {
  const prepared = snapshot.prepared;
  const risk = snapshot.risk_admission;
  const capability = snapshot.confirmation_capability;
  if (
    prepared.current_state !== "waiting_for_manual_confirmation" ||
    prepared.handoff.payload.execution_mode !== "semi_automatic" ||
    capability.execution_mode !== "semi_automatic"
  ) {
    return {
      ok: false,
      status: "blocked",
      reason: "automatic_execution_rejected",
    };
  }
  if (
    risk.admission_status !== "admitted" ||
    risk.manual_confirmation_admission === false ||
    !risk.terminal_digest
  ) {
    return {
      ok: false,
      status: "blocked",
      reason: "risk_admission_not_admitted",
    };
  }
  if (!lineageMatches(prepared, risk, capability)) {
    return {
      ok: false,
      status: "conflicting",
      reason: "execution_lineage_mismatch",
    };
  }
  if (
    snapshot.confirmation_boundary.temporal_policy_version !==
      capability.temporal_policy_version ||
    capability.session_identity !==
      risk.predecessor_admission?.lineage?.session_identity
  ) {
    return {
      ok: false,
      status: "conflicting",
      reason: "session_lineage_mismatch",
    };
  }

  const parity = payloadParity(prepared, risk);
  if (!parity.unit) {
    return {
      ok: false,
      status: "unmappable",
      reason: "unit_scale_currency_mismatch",
    };
  }
  if (!parity.matches || !("scaled" in parity)) {
    return {
      ok: false,
      status: "conflicting",
      reason: "quantity_price_notional_mismatch",
    };
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
    return {
      ok: false,
      status: "unmappable",
      reason: "timestamp_unmappable",
    };
  }
  if (
    compareAction650uInstants(consumedAt, confirmedAt) < 0 ||
    compareAction650uInstants(observedAt, consumedAt) < 0
  ) {
    return {
      ok: false,
      status: "unmappable",
      reason: "timestamp_unmappable",
    };
  }
  if (compareAction650uInstants(consumedAt, sessionExpiresAt) >= 0) {
    return {
      ok: false,
      status: "expired",
      reason: "confirmation_expired",
    };
  }
  const expiresAt = instructionExpiresAt(
    consumedAt.canonical_instant,
    sessionExpiresAt.canonical_instant,
  );
  const expiresInstant = expiresAt
    ? canonicalizeAction650uNanosecondInstant(expiresAt)
    : null;
  if (!expiresAt || !expiresInstant) {
    return {
      ok: false,
      status: "unmappable",
      reason: "timestamp_unmappable",
    };
  }
  if (compareAction650uInstants(observedAt, expiresInstant) >= 0) {
    return {
      ok: false,
      status: "expired",
      reason: "instruction_expired",
    };
  }
  if (
    !prepared.handoff.identity.idempotency_identity ||
    snapshot.confirmation_boundary.confirm_present !== true
  ) {
    return {
      ok: false,
      status: "unmappable",
      reason: "instruction_identity_invalid",
    };
  }

  const confirmationConsumptionDigest = predictedConsumptionDigest(
    capability,
    consumedAt.canonical_instant,
  );
  const submissionIntentIdentity =
    `action_653j_submission_intent_${hashAction650sCanonicalValue({
      contract_version: action653jContractVersion,
      execution_identity:
        prepared.runtime_identity_context.execution_identity,
      risk_admission_digest: risk.terminal_digest,
      confirmation_consumption_digest: confirmationConsumptionDigest,
      idempotency_identity: prepared.handoff.identity.idempotency_identity,
      destination_identity: action653jSyntheticDestinationIdentity,
    }).slice(0, 24)}`;

  return freezePlainTree({
    ok: true as const,
    projection: {
      consumed_at: consumedAt.canonical_instant,
      observed_at: observedAt.canonical_instant,
      instruction_expires_at: expiresAt,
      confirmation_consumption_digest: confirmationConsumptionDigest,
      submission_intent_identity: submissionIntentIdentity,
      quantity_units: parity.scaled.quantity_units,
      price_micros: parity.scaled.price_micros,
      notional_micros: parity.scaled.notional_micros,
    },
  });
}

function lineageProjection(
  snapshot: RequestSnapshot | null,
  confirmationConsumptionDigest: string | null,
  submissionIntentIdentity: string | null,
): Action653jLineage {
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
): Action653jObservedDigests {
  if (!snapshot) {
    return freezePlainTree({
      ...emptyDigests,
      rejected_input_digest: rejectedInputDigest,
    });
  }
  return freezePlainTree({
    request_snapshot_digest: snapshotDigest,
    preparation_digest: digest("action_653j_preparation", {
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
  input: Omit<Action653jInstructionResult, "envelope_digest">,
) {
  return {
    contract_version: input.contract_version,
    capsule_policy_version: input.capsule_policy_version,
    snapshot_policy_version: input.snapshot_policy_version,
    gate_status: input.gate_status,
    instruction_status: input.instruction_status,
    terminal_reason: input.terminal_reason,
    snapshot_digest: input.snapshot_digest,
    capsule_digest: input.capsule_digest,
    lineage: input.lineage,
    instruction: input.instruction,
    observed_input_digests: input.observed_input_digests,
    failure_provenance: input.failure_provenance,
    safety: input.safety,
    effects: input.effects,
  };
}

export function rebuildAction653jEnvelopeDigest(
  input: Omit<Action653jInstructionResult, "envelope_digest">,
) {
  return digest("action_653j_instruction_envelope", terminalProjection(input));
}

export function rebuildAction653jFailureDigest(input: {
  terminal_reason: Exclude<
    Action653jInstructionReason,
    "instruction_prepared"
  >;
  observed_rejected_input_digests: Action653jObservedDigests;
  lineage: Action653jLineage;
}) {
  return digest("action_653j_failure", input);
}

function finish(
  gateStatus: "enabled" | "disabled" | "kill_switch_active",
  partial: Omit<
    Action653jInstructionResult,
    | "contract_version"
    | "capsule_policy_version"
    | "snapshot_policy_version"
    | "gate_status"
    | "envelope_digest"
    | "safety"
  >,
): Action653jInstructionResult {
  const withoutEnvelope = {
    contract_version: action653jContractVersion,
    capsule_policy_version: action653jCapsulePolicyVersion,
    snapshot_policy_version: action653jSnapshotPolicyVersion,
    gate_status: gateStatus,
    ...partial,
    safety,
  };
  return freezePlainTree({
    ...withoutEnvelope,
    envelope_digest:
      gateStatus === "enabled"
        ? rebuildAction653jEnvelopeDigest(withoutEnvelope)
        : null,
  }) as Action653jInstructionResult;
}

function fail(
  status: Exclude<Action653jInstructionStatus, "prepared">,
  reason: Exclude<Action653jInstructionReason, "instruction_prepared">,
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
    capsule_digest: null,
    lineage,
    instruction: null,
    observed_input_digests: digests,
    failure_provenance: freezePlainTree({
      ...failureWithoutDigest,
      failure_digest: rebuildAction653jFailureDigest({
        ...failureWithoutDigest,
        lineage,
      }),
    }),
    effects: inspectedEffects,
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
    capsule_digest: null,
    lineage: emptyLineage,
    instruction: null,
    observed_input_digests: emptyDigests,
    failure_provenance: null,
    effects: zeroEffects,
  });
}

const disabledResult = staticGateResult("disabled");
const killedResult = staticGateResult("kill_switch_active");

function preparedArtifacts(
  snapshot: RequestSnapshot,
  snapshotDigest: string,
  witnessDigest: string,
  projection: ValidatedProjection,
) {
  const prepared = snapshot.prepared;
  const risk = snapshot.risk_admission;
  const capability = snapshot.confirmation_capability;
  const runtimeProvenanceBindingDigest = digest(
    "action_653j_private_runtime_provenance",
    {
      capsule_policy_version: action653jCapsulePolicyVersion,
      preparation_trace_identity: prepared.trace_identity,
      risk_admission_digest: risk.terminal_digest,
      confirmation_capability_digest: capability.capability_digest,
      boundary_identity: snapshot.confirmation_boundary.boundary_identity,
      descriptor_witness_digest: witnessDigest,
    },
  );
  const identityBindingDigest = digest("action_653j_identity_binding", {
    execution_identity:
      prepared.runtime_identity_context.execution_identity,
    lifecycle_identity:
      prepared.runtime_identity_context.lifecycle_identity,
    handoff_identity: prepared.handoff.identity.handoff_identity,
    handoff_digest: prepared.handoff.identity.handoff_digest,
    session_identity: capability.session_identity,
    idempotency_identity: prepared.handoff.identity.idempotency_identity,
    risk_admission_digest: risk.terminal_digest,
    confirmation_capability_digest: capability.capability_digest,
    confirmation_consumption_digest:
      projection.confirmation_consumption_digest,
  });
  const capsuleSeed = {
    contract_version: action653jContractVersion,
    capsule_policy_version: action653jCapsulePolicyVersion,
    snapshot_digest: snapshotDigest,
    descriptor_witness_digest: witnessDigest,
    runtime_provenance_binding_digest: runtimeProvenanceBindingDigest,
    identity_binding_digest: identityBindingDigest,
  };
  const capsuleDigest = digest("action_653j_verification_capsule", capsuleSeed);
  const instructionWithoutDigest = {
    schema_version: action653jInstructionSchemaVersion,
    destination_identity: action653jSyntheticDestinationIdentity,
    capsule_digest: capsuleDigest,
    snapshot_digest: snapshotDigest,
    execution_identity:
      prepared.runtime_identity_context.execution_identity,
    lifecycle_identity:
      prepared.runtime_identity_context.lifecycle_identity,
    preparation_trace_identity: prepared.trace_identity,
    handoff_identity: prepared.handoff.identity.handoff_identity,
    handoff_digest: prepared.handoff.identity.handoff_digest,
    risk_admission_identity:
      risk.manual_confirmation_admission === false
        ? ""
        : risk.manual_confirmation_admission.admission_identity,
    risk_admission_digest: risk.terminal_digest!,
    confirmation_request_digest: capability.confirmation_request_digest,
    confirmation_capability_digest: capability.capability_digest,
    confirmation_consumption_digest:
      projection.confirmation_consumption_digest,
    session_identity: capability.session_identity,
    instrument: prepared.handoff.payload.ticker,
    side: prepared.handoff.payload.side,
    quantity: {
      value: projection.quantity_units,
      scale: 0 as const,
      unit: "units" as const,
    },
    limit_price: {
      value: projection.price_micros,
      scale: 6 as const,
      unit: "SEK_micros_per_unit" as const,
      currency: "SEK" as const,
    },
    notional: {
      value: projection.notional_micros,
      scale: 6 as const,
      unit: "SEK_micros" as const,
      currency: "SEK" as const,
    },
    idempotency_identity: prepared.handoff.identity.idempotency_identity,
    submission_intent_identity: projection.submission_intent_identity,
    instruction_created_at: projection.consumed_at,
    instruction_expires_at: projection.instruction_expires_at,
  };
  const instruction = freezePlainTree({
    ...instructionWithoutDigest,
    instruction_digest: digest(
      "action_653j_broker_neutral_instruction",
      instructionWithoutDigest,
    ),
  }) as Action653jBrokerNeutralInstruction;
  const capsule = freezePlainTree({
    ...capsuleSeed,
    instruction_digest: instruction.instruction_digest,
    capsule_digest: capsuleDigest,
  }) as Action653jInternalVerificationCapsule;
  const result = finish("enabled", {
    instruction_status: "prepared",
    terminal_reason: "instruction_prepared",
    snapshot_digest: snapshotDigest,
    capsule_digest: capsuleDigest,
    lineage: lineageProjection(
      snapshot,
      projection.confirmation_consumption_digest,
      projection.submission_intent_identity,
    ),
    instruction,
    observed_input_digests: observedDigests(snapshot, snapshotDigest, null),
    failure_provenance: null,
    effects: consumedEffects,
  });
  return freezePlainTree({
    capsule,
    result,
    runtime_provenance_binding_digest: runtimeProvenanceBindingDigest,
    identity_binding_digest: identityBindingDigest,
  });
}

export function issueAction653jInternalVerificationCapsule(
  gate: Readonly<{ enabled: boolean; kill_switch_active: boolean }>,
  request: unknown,
): Action653jCapsuleIssue {
  if (!gate.enabled) {
    return Object.freeze({ status: "terminal_result", result: disabledResult });
  }
  if (gate.kill_switch_active) {
    return Object.freeze({ status: "terminal_result", result: killedResult });
  }

  const captured = captureBoundary(request);
  if (!captured.ok) {
    return Object.freeze({
      status: "terminal_result",
      result: fail("unmappable", "input_snapshot_rejected", {
        snapshot: null,
        snapshot_digest: null,
        rejected_input_digest: captured.witness_digest,
      }),
    });
  }

  const { handles, snapshot } = captured;
  const snapshotDigest = digest("action_653j_snapshot", snapshot);
  const rejectedDigest = digest("action_653j_rejected_input", {
    snapshot_digest: snapshotDigest,
    descriptor_witness_digest: captured.witness_digest,
  });
  const capabilityHandle = handles.confirmation_capability;

  if (capabilityHandle && typeof capabilityHandle === "object") {
    const prior = consumptionRecords.get(capabilityHandle);
    if (prior) {
      if (prior.request_snapshot_digest === snapshotDigest) {
        return Object.freeze({
          status: "terminal_result",
          result: prior.result,
        });
      }
      return Object.freeze({
        status: "terminal_result",
        result: fail(
          "conflicting",
          snapshot.prepared.runtime_identity_context?.execution_identity !==
            prior.execution_identity
            ? "cross_execution_reuse_rejected"
            : "conflicting_instruction_reuse",
          {
            snapshot,
            snapshot_digest: snapshotDigest,
            rejected_input_digest: rejectedDigest,
          },
        ),
      });
    }
  }

  /*
   * This is the only caller-handle authority boundary. Each provenance
   * verifier is invoked once, all remaining validation uses the immutable
   * snapshot, and the handles never enter a capsule or downstream function.
   */
  if (!hasAction650sPreparedExecutionProvenance(handles.prepared)) {
    return Object.freeze({
      status: "terminal_result",
      result: fail("blocked", "preparation_provenance_unproven", {
        snapshot,
        snapshot_digest: snapshotDigest,
        rejected_input_digest: rejectedDigest,
      }),
    });
  }
  if (!canAction652cProceedToManualConfirmation(handles.risk_admission)) {
    return Object.freeze({
      status: "terminal_result",
      result: fail("blocked", "risk_admission_unproven", {
        snapshot,
        snapshot_digest: snapshotDigest,
        rejected_input_digest: rejectedDigest,
      }),
    });
  }
  if (
    !capabilityHandle ||
    typeof capabilityHandle !== "object" ||
    getAction650uManualConfirmationConsumptionState(capabilityHandle) !==
      "unconsumed" ||
    !verifyAction650uManualConfirmationCapability(
      capabilityHandle as Action650uManualConfirmationCapability,
    )
  ) {
    return Object.freeze({
      status: "terminal_result",
      result: fail("blocked", "confirmation_provenance_unproven", {
        snapshot,
        snapshot_digest: snapshotDigest,
        rejected_input_digest: rejectedDigest,
      }),
    });
  }
  if (
    !handles.confirmation_boundary ||
    typeof handles.confirmation_boundary !== "object"
  ) {
    return Object.freeze({
      status: "terminal_result",
      result: fail("blocked", "confirmation_provenance_unproven", {
        snapshot,
        snapshot_digest: snapshotDigest,
        rejected_input_digest: rejectedDigest,
      }),
    });
  }

  const validated = validateSnapshot(snapshot);
  if (!validated.ok) {
    return Object.freeze({
      status: "terminal_result",
      result: fail(validated.status, validated.reason, {
        snapshot,
        snapshot_digest: snapshotDigest,
        rejected_input_digest: rejectedDigest,
      }),
    });
  }

  const artifacts = preparedArtifacts(
    snapshot,
    snapshotDigest,
    captured.witness_digest,
    validated.projection,
  );

  /*
   * The predecessor consumption is the final fallible boundary operation.
   * A successful return is followed only by no-throw WeakMap/WeakSet
   * registration and returning already-frozen capsule/result bytes.
   */
  const consumed = consumeAction650uManualConfirmation({
    boundary:
      handles.confirmation_boundary as Action650uManualConfirmationBoundary,
    prepared: handles.prepared as Action650sPreparedExecution,
    capability:
      capabilityHandle as Action650uManualConfirmationCapability,
    consumed_at: validated.projection.consumed_at,
  });
  if (!consumed.ok) {
    return Object.freeze({
      status: "terminal_result",
      result: fail(
        consumed.reason === "capability_expired" ? "expired" : "blocked",
        consumed.reason === "capability_expired"
          ? "confirmation_expired"
          : "confirmation_rejected",
        {
          snapshot,
          snapshot_digest: snapshotDigest,
          rejected_input_digest: digest(
            "action_653j_confirmation_rejection",
            { rejected_digest: rejectedDigest, reason: consumed.reason },
          ),
        },
      ),
    });
  }

  capsuleRuntimeStates.set(artifacts.capsule, {
    result: artifacts.result,
    runtime_provenance_binding_digest:
      artifacts.runtime_provenance_binding_digest,
    identity_binding_digest: artifacts.identity_binding_digest,
  });
  resultProvenance.add(artifacts.result);
  consumptionRecords.set(capabilityHandle, {
    request_snapshot_digest: snapshotDigest,
    execution_identity:
      snapshot.prepared.runtime_identity_context.execution_identity,
    result: artifacts.result,
  });
  return Object.freeze({
    status: "capsule_ready",
    capsule: artifacts.capsule,
    result: artifacts.result,
  });
}

export function materializeAction653jVerifiedInstruction(
  capsule: unknown,
): Action653jInstructionResult | null {
  if (!capsule || typeof capsule !== "object") return null;
  const state = capsuleRuntimeStates.get(
    capsule as Action653jInternalVerificationCapsule,
  );
  if (!state) return null;
  const value = capsule as Action653jInternalVerificationCapsule;
  if (
    !Object.isFrozen(value) ||
    value.contract_version !== action653jContractVersion ||
    value.capsule_policy_version !== action653jCapsulePolicyVersion ||
    value.runtime_provenance_binding_digest !==
      state.runtime_provenance_binding_digest ||
    value.identity_binding_digest !== state.identity_binding_digest
  ) {
    return null;
  }
  return state.result;
}

export function runAction653jInternalVerificationCapsule(
  gate: Readonly<{ enabled: boolean; kill_switch_active: boolean }>,
  request: unknown,
): Action653jInstructionResult {
  const issued = issueAction653jInternalVerificationCapsule(gate, request);
  if (issued.status === "terminal_result") return issued.result;
  return issued.result;
}

export function canAction653jProceedToSyntheticReplay(value: unknown) {
  if (
    !value ||
    typeof value !== "object" ||
    !resultProvenance.has(value as object)
  ) {
    return false;
  }
  const result = value as Action653jInstructionResult;
  if (
    !Object.isFrozen(result) ||
    result.instruction_status !== "prepared" ||
    !result.instruction ||
    !result.envelope_digest ||
    result.instruction.destination_identity !==
      action653jSyntheticDestinationIdentity
  ) {
    return false;
  }
  const { envelope_digest: claimed, ...withoutEnvelope } = result;
  return claimed === rebuildAction653jEnvelopeDigest(withoutEnvelope);
}

export function replayAction653jPreparedInstruction(
  value: unknown,
  observedAtValue: unknown,
): Action653jSyntheticReplayEvidence | null {
  if (!canAction653jProceedToSyntheticReplay(value)) return null;
  const result = value as Action653jInstructionResult;
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
    contract_version: "action_653j_synthetic_replay_gate_v1" as const,
    destination_identity: action653jSyntheticDestinationIdentity,
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
      "action_653j_synthetic_replay_evidence",
      withoutDigest,
    ),
  });
}
