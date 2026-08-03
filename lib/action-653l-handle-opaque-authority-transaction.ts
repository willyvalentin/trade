import { types as nodeTypes } from "node:util";

import {
  hashAction650sCanonicalValue,
} from "@/lib/action-650s-execution-identity";
import {
  hasAction650sPreparedExecutionProvenance,
  type Action650sPreparedExecution,
} from "@/lib/action-650s-execution-preparation";
import {
  consumeAction650uManualConfirmation,
  getAction650uManualConfirmationConsumptionState,
  verifyAction650uManualConfirmationCapability,
  type Action650uManualConfirmationBoundary,
  type Action650uManualConfirmationCapability,
} from "@/lib/action-650u-manual-confirmation";
import {
  canonicalizeAction650uNanosecondInstant,
  compareAction650uInstants,
} from "@/lib/action-650u-temporal-confirmation-policy";
import {
  canAction652cProceedToManualConfirmation,
  type Action652cAdmissionResult,
} from "@/lib/action-652c-non-forgeable-risk-authority";

export const action653lContractVersion =
  "action_653l_handle_opaque_instruction_v4" as const;
export const action653lAuthorityTransactionVersion =
  "action_653l_private_atomic_authority_transaction_v1" as const;
export const action653lProjectionVersion =
  "action_653l_authority_plain_projection_v1" as const;
export const action653lReceiptVersion =
  "action_653l_private_consumption_receipt_v1" as const;
export const action653lInstructionSchemaVersion =
  "action_653l_broker_neutral_instruction_schema_v4" as const;
export const action653lSyntheticDestinationIdentity =
  "action_653l_synthetic_replay_only" as const;

export const action653lSnapshotBudget = Object.freeze({
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

type SnapshotBudgetState = {
  nodes: number;
  properties: number;
  string_bytes: number;
};

type SnapshotFailureReason =
  | "accessor_rejected"
  | "proxy_rejected"
  | "cycle_rejected"
  | "snapshot_budget_exceeded"
  | "descriptor_inspection_failed"
  | "non_plain_data_rejected"
  | "request_shape_rejected";

type SnapshotFailure = Readonly<{
  ok: false;
  reason: SnapshotFailureReason;
  witness_digest: string;
}>;

type PlainCloneSuccess = Readonly<{
  ok: true;
  value: PlainValue;
}>;

export type Action653lAuthorityTicket = Readonly<{
  ticket_version: "action_653l_private_authority_ticket_v1";
  ticket_digest: string;
}>;

export type Action653lAuthorityProjection = Readonly<{
  projection_version: typeof action653lProjectionVersion;
  destination_identity: typeof action653lSyntheticDestinationIdentity;
  execution_mode: "semi_automatic";
  execution_identity: string;
  lifecycle_identity: string;
  preparation_trace_identity: string;
  preparation_runtime_digest: string;
  handoff_identity: string;
  handoff_digest: string;
  canonical_order_payload_digest: string;
  risk_admission_identity: string;
  risk_admission_digest: string;
  confirmation_request_digest: string;
  confirmation_capability_digest: string;
  temporal_policy_version: string;
  session_identity: string;
  session_started_at: string;
  session_expires_at: string;
  confirmed_at: string;
  instrument: string;
  side: "BUY" | "SELL";
  order_type: string;
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
  projection_digest: string;
}>;

export type Action653lPrivateAuthorityGrant = Readonly<{
  authority_ticket: Action653lAuthorityTicket;
  projection: Action653lAuthorityProjection;
}>;

export type Action653lInstructionRequest = Readonly<{
  authority_ticket: Action653lAuthorityTicket;
  projection: Action653lAuthorityProjection;
  consumed_at: string;
  observed_at: string;
}>;

export type Action653lConsumptionReceipt = Readonly<{
  receipt_version: typeof action653lReceiptVersion;
  transaction_version: typeof action653lAuthorityTransactionVersion;
  ticket_digest: string;
  projection_digest: string;
  request_digest: string;
  execution_identity: string;
  session_identity: string;
  confirmation_request_digest: string;
  confirmation_capability_digest: string;
  predecessor_consumption_receipt_digest: string;
  consumed_at: string;
  consumption_count: 1;
  receipt_digest: string;
}>;

export type Action653lBrokerNeutralInstruction = Readonly<{
  schema_version: typeof action653lInstructionSchemaVersion;
  destination_identity: typeof action653lSyntheticDestinationIdentity;
  snapshot_digest: string;
  capsule_digest: string;
  authority_receipt_digest: string;
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
  order_type: string;
  quantity: Action653lAuthorityProjection["quantity"];
  limit_price: Action653lAuthorityProjection["limit_price"];
  notional: Action653lAuthorityProjection["notional"];
  idempotency_identity: string;
  submission_intent_identity: string;
  instruction_created_at: string;
  instruction_expires_at: string;
  instruction_digest: string;
}>;

export type Action653lInstructionStatus =
  | "prepared"
  | "blocked"
  | "expired"
  | "conflicting"
  | "unmappable";

export type Action653lInstructionReason =
  | "instruction_prepared"
  | "instruction_disabled"
  | "kill_switch_active"
  | "input_snapshot_rejected"
  | "plain_projection_invalid"
  | "authority_ticket_unproven"
  | "authority_projection_mismatch"
  | "authority_provenance_unproven"
  | "confirmation_rejected"
  | "confirmation_expired"
  | "instruction_expired"
  | "conflicting_instruction_reuse"
  | "cross_execution_reuse_rejected"
  | "timestamp_unmappable";

type Action653lLineage = Readonly<{
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

export type Action653lInstructionResult = Readonly<{
  contract_version: typeof action653lContractVersion;
  transaction_version: typeof action653lAuthorityTransactionVersion;
  gate_status: "enabled" | "disabled" | "kill_switch_active";
  instruction_status: Action653lInstructionStatus;
  terminal_reason: Action653lInstructionReason;
  snapshot_digest: string | null;
  capsule_digest: string | null;
  authority_receipt: Action653lConsumptionReceipt | null;
  lineage: Action653lLineage;
  instruction: Action653lBrokerNeutralInstruction | null;
  failure_digest: string | null;
  envelope_digest: string | null;
  safety: Readonly<{
    diagnostic_only: true;
    synthetic_only: true;
    broker_neutral: true;
    handle_opaque: true;
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
    caller_predecessor_handles_received: 0;
    caller_predecessor_handles_stored: 0;
    caller_predecessor_handles_forwarded: 0;
    private_authority_lookups: 0 | 1;
    private_confirmation_consumptions: 0 | 1;
    post_transaction_caller_reads: 0;
    synthetic_replay_admissions: 0;
    transport_requests: 0;
    credential_reads: 0;
    database_reads: 0;
    database_writes: 0;
    process_spawns: 0;
    trade_mutations: 0;
  }>;
}>;

export type Action653lSyntheticReplayEvidence = Readonly<{
  contract_version: "action_653l_synthetic_replay_gate_v1";
  destination_identity: typeof action653lSyntheticDestinationIdentity;
  execution_identity: string;
  submission_intent_identity: string;
  instruction_digest: string;
  instruction_envelope_digest: string;
  authority_receipt_digest: string;
  observed_at: string;
  accepted: true;
  synthetic_only: true;
  evidence_digest: string;
}>;

type PrivateAuthorityRecord = {
  preparation_authority: Action650sPreparedExecution;
  risk_authority: Action652cAdmissionResult;
  confirmation_boundary_authority: Action650uManualConfirmationBoundary;
  confirmation_capability_authority: Action650uManualConfirmationCapability;
  projection: Action653lAuthorityProjection;
  projection_digest: string;
  execution_identity: string;
  session_identity: string;
  consumed_request_digest: string | null;
  receipt: Action653lConsumptionReceipt | null;
};

type CapturedRequest = Readonly<{
  ok: true;
  authority_ticket: unknown;
  projection: Action653lAuthorityProjection;
  consumed_at: string;
  observed_at: string;
  witness_digest: string;
}>;

type ValidatedRequest = Readonly<{
  projection: Action653lAuthorityProjection;
  consumed_at: string;
  observed_at: string;
  instruction_expires_at: string;
  request_digest: string;
  snapshot_digest: string;
}>;

type TransactionSuccess = Readonly<{
  ok: true;
  receipt: Action653lConsumptionReceipt;
}>;

type TransactionFailure = Readonly<{
  ok: false;
  reason:
    | "authority_ticket_unproven"
    | "authority_projection_mismatch"
    | "authority_provenance_unproven"
    | "confirmation_rejected"
    | "confirmation_expired"
    | "conflicting_instruction_reuse"
    | "cross_execution_reuse_rejected";
}>;

type ResultRecord = Readonly<{
  request_digest: string;
  result: Action653lInstructionResult;
}>;

const privateTicketStates =
  new WeakMap<Action653lAuthorityTicket, PrivateAuthorityRecord>();
const privateReceiptProvenance =
  new WeakSet<Action653lConsumptionReceipt>();
const preparedResultProvenance = new WeakSet<object>();
const receiptResults = new WeakMap<Action653lConsumptionReceipt, ResultRecord>();

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
    for (const descriptor of Object.values(
      Object.getOwnPropertyDescriptors(current),
    )) {
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

function snapshotFailure(
  reason: SnapshotFailureReason,
  path: string,
  budget: SnapshotBudgetState,
): SnapshotFailure {
  return freezePlainTree({
    ok: false as const,
    reason,
    witness_digest: digest("action_653l_snapshot_rejection", {
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
): PlainCloneSuccess | SnapshotFailure {
  function primitive(
    current: unknown,
    path: string,
  ): PlainValue | SnapshotFailure | undefined {
    if (typeof current === "string") {
      budget.string_bytes += Buffer.byteLength(current, "utf8");
      if (
        budget.string_bytes >
        action653lSnapshotBudget.maximum_string_bytes
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
      job.depth > action653lSnapshotBudget.maximum_depth ||
      budget.nodes > action653lSnapshotBudget.maximum_nodes
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
      action653lSnapshotBudget.maximum_properties
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

function unsignedProjection(projection: Action653lAuthorityProjection) {
  const { projection_digest: _projectionDigest, ...unsigned } = projection;
  void _projectionDigest;
  return unsigned;
}

export function rebuildAction653lProjectionDigest(
  projection: Action653lAuthorityProjection,
) {
  return digest("action_653l_authority_projection", unsignedProjection(projection));
}

function scaledPayload(preparation: Action650sPreparedExecution) {
  const quantity = preparation.handoff.payload.quantity;
  const price = preparation.handoff.payload.limit_price;
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
  return {
    quantity_units: quantityUnits.toString(),
    price_micros: priceMicros.toString(),
    notional_micros: (quantityUnits * priceMicros).toString(),
  };
}

function deriveAuthorityProjection(
  preparation: Action650sPreparedExecution,
  admission: Action652cAdmissionResult,
  capability: Action650uManualConfirmationCapability,
): Action653lAuthorityProjection | null {
  const lineage = admission.predecessor_admission?.lineage;
  const intent = admission.predecessor_admission?.intent_projection;
  const gate = admission.manual_confirmation_admission;
  const payload = preparation.handoff.payload;
  const scaled = scaledPayload(preparation);
  if (
    !lineage ||
    !intent ||
    !scaled ||
    admission.admission_status !== "admitted" ||
    gate === false ||
    !admission.terminal_digest ||
    preparation.current_state !== "waiting_for_manual_confirmation" ||
    payload.execution_mode !== "semi_automatic" ||
    capability.execution_mode !== "semi_automatic" ||
    lineage.execution_identity !==
      preparation.runtime_identity_context.execution_identity ||
    lineage.lifecycle_identity !==
      preparation.runtime_identity_context.lifecycle_identity ||
    lineage.preparation_trace_identity !== preparation.trace_identity ||
    lineage.handoff_identity !== preparation.handoff.identity.handoff_identity ||
    lineage.handoff_digest !== preparation.handoff.identity.handoff_digest ||
    lineage.idempotency_identity !==
      preparation.handoff.identity.idempotency_identity ||
    capability.execution_identity !== lineage.execution_identity ||
    capability.lifecycle_identity !== lineage.lifecycle_identity ||
    capability.handoff_identity !== lineage.handoff_identity ||
    capability.handoff_digest !== lineage.handoff_digest ||
    capability.session_identity !== lineage.session_identity ||
    capability.ticker !== payload.ticker ||
    capability.side !== payload.side ||
    capability.quantity !== payload.quantity ||
    capability.order_type !== payload.order_type ||
    capability.limit_price !== payload.limit_price ||
    intent.instrument !== payload.ticker ||
    intent.side !== payload.side ||
    intent.quantity.value !== scaled.quantity_units ||
    intent.quantity.scale !== 0 ||
    intent.quantity.unit !== "units" ||
    intent.limit_price.value !== scaled.price_micros ||
    intent.limit_price.scale !== 6 ||
    intent.limit_price.unit !== "SEK_micros_per_unit" ||
    intent.notional.value !== scaled.notional_micros ||
    intent.notional.scale !== 6 ||
    intent.notional.unit !== "SEK_micros"
  ) {
    return null;
  }

  const unsigned = {
    projection_version: action653lProjectionVersion,
    destination_identity: action653lSyntheticDestinationIdentity,
    execution_mode: "semi_automatic" as const,
    execution_identity: lineage.execution_identity,
    lifecycle_identity: lineage.lifecycle_identity,
    preparation_trace_identity: lineage.preparation_trace_identity,
    preparation_runtime_digest: preparation.runtime_identity_context_digest,
    handoff_identity: lineage.handoff_identity,
    handoff_digest: lineage.handoff_digest,
    canonical_order_payload_digest:
      lineage.canonical_order_payload_digest,
    risk_admission_identity: gate.admission_identity,
    risk_admission_digest: admission.terminal_digest,
    confirmation_request_digest: capability.confirmation_request_digest,
    confirmation_capability_digest: capability.capability_digest,
    temporal_policy_version: capability.temporal_policy_version,
    session_identity: capability.session_identity,
    session_started_at: capability.session_started_at,
    session_expires_at: capability.session_expires_at,
    confirmed_at: capability.confirmed_at,
    instrument: payload.ticker,
    side: payload.side,
    order_type: payload.order_type,
    quantity: {
      value: scaled.quantity_units,
      scale: 0 as const,
      unit: "units" as const,
    },
    limit_price: {
      value: scaled.price_micros,
      scale: 6 as const,
      unit: "SEK_micros_per_unit" as const,
      currency: "SEK" as const,
    },
    notional: {
      value: scaled.notional_micros,
      scale: 6 as const,
      unit: "SEK_micros" as const,
      currency: "SEK" as const,
    },
    idempotency_identity: lineage.idempotency_identity,
  };
  return freezePlainTree({
    ...unsigned,
    projection_digest: digest("action_653l_authority_projection", unsigned),
  }) as Action653lAuthorityProjection;
}

/*
 * PRIVATE_AUTHORITY_MODULE_BEGIN
 *
 * Only this issuance boundary accepts predecessor authority handles. The
 * instruction request type and every downstream instruction function are
 * handle-opaque.
 */
export function issueAction653lPrivateAuthorityTicket(input: Readonly<{
  preparation_authority: Action650sPreparedExecution;
  risk_authority: Action652cAdmissionResult;
  confirmation_boundary_authority: Action650uManualConfirmationBoundary;
  confirmation_capability_authority: Action650uManualConfirmationCapability;
}>): Action653lPrivateAuthorityGrant | null {
  const budget: SnapshotBudgetState = {
    nodes: 0,
    properties: 0,
    string_bytes: 0,
  };
  const preparationSnapshot = clonePlainIteratively(
    input.preparation_authority,
    "$.private.preparation",
    budget,
  );
  const riskSnapshot = clonePlainIteratively(
    input.risk_authority,
    "$.private.risk",
    budget,
  );
  const confirmationSnapshot = clonePlainIteratively(
    input.confirmation_capability_authority,
    "$.private.confirmation",
    budget,
  );
  if (
    !preparationSnapshot.ok ||
    !riskSnapshot.ok ||
    !confirmationSnapshot.ok ||
    nodeTypes.isProxy(input.confirmation_boundary_authority) ||
    !hasAction650sPreparedExecutionProvenance(input.preparation_authority) ||
    !canAction652cProceedToManualConfirmation(input.risk_authority) ||
    getAction650uManualConfirmationConsumptionState(
      input.confirmation_capability_authority,
    ) !== "unconsumed" ||
    !verifyAction650uManualConfirmationCapability(
      input.confirmation_capability_authority,
    )
  ) {
    return null;
  }

  const projection = deriveAuthorityProjection(
    preparationSnapshot.value as Action650sPreparedExecution,
    riskSnapshot.value as Action652cAdmissionResult,
    confirmationSnapshot.value as Action650uManualConfirmationCapability,
  );
  if (!projection) return null;

  const ticketWithoutDigest = {
    ticket_version: "action_653l_private_authority_ticket_v1" as const,
    projection_digest: projection.projection_digest,
    execution_identity: projection.execution_identity,
    session_identity: projection.session_identity,
    issuer_identity: "action_653l_private_runtime_authority",
  };
  const ticket = Object.freeze({
    ticket_version: ticketWithoutDigest.ticket_version,
    ticket_digest: digest("action_653l_private_authority_ticket", ticketWithoutDigest),
  });
  privateTicketStates.set(ticket, {
    preparation_authority: input.preparation_authority,
    risk_authority: input.risk_authority,
    confirmation_boundary_authority:
      input.confirmation_boundary_authority,
    confirmation_capability_authority:
      input.confirmation_capability_authority,
    projection,
    projection_digest: projection.projection_digest,
    execution_identity: projection.execution_identity,
    session_identity: projection.session_identity,
    consumed_request_digest: null,
    receipt: null,
  });
  return freezePlainTree({
    authority_ticket: ticket,
    projection,
  }) as Action653lPrivateAuthorityGrant;
}

function rebuildAction653lReceiptDigest(
  receipt: Action653lConsumptionReceipt,
) {
  const { receipt_digest: _receiptDigest, ...unsigned } = receipt;
  void _receiptDigest;
  return digest("action_653l_private_consumption_receipt", unsigned);
}

function executePrivateAtomicAuthorityTransaction(
  authorityTicket: unknown,
  validated: ValidatedRequest,
): TransactionSuccess | TransactionFailure {
  if (!authorityTicket || typeof authorityTicket !== "object") {
    return { ok: false, reason: "authority_ticket_unproven" };
  }
  const record = privateTicketStates.get(
    authorityTicket as Action653lAuthorityTicket,
  );
  if (!record) {
    return { ok: false, reason: "authority_ticket_unproven" };
  }
  if (
    record.projection_digest !== validated.projection.projection_digest ||
    record.execution_identity !== validated.projection.execution_identity ||
    record.session_identity !== validated.projection.session_identity
  ) {
    return {
      ok: false,
      reason:
        record.execution_identity !== validated.projection.execution_identity
          ? "cross_execution_reuse_rejected"
          : "authority_projection_mismatch",
    };
  }
  if (record.consumed_request_digest) {
    if (
      record.consumed_request_digest === validated.request_digest &&
      record.receipt
    ) {
      return { ok: true, receipt: record.receipt };
    }
    return { ok: false, reason: "conflicting_instruction_reuse" };
  }

  if (
    !hasAction650sPreparedExecutionProvenance(record.preparation_authority) ||
    !canAction652cProceedToManualConfirmation(record.risk_authority) ||
    getAction650uManualConfirmationConsumptionState(
      record.confirmation_capability_authority,
    ) !== "unconsumed" ||
    !verifyAction650uManualConfirmationCapability(
      record.confirmation_capability_authority,
    )
  ) {
    return { ok: false, reason: "authority_provenance_unproven" };
  }

  const consumed = consumeAction650uManualConfirmation({
    boundary: record.confirmation_boundary_authority,
    prepared: record.preparation_authority,
    capability: record.confirmation_capability_authority,
    consumed_at: validated.consumed_at,
  });
  if (!consumed.ok) {
    return {
      ok: false,
      reason:
        consumed.reason === "capability_expired"
          ? "confirmation_expired"
          : "confirmation_rejected",
    };
  }

  const unsignedReceipt = {
    receipt_version: action653lReceiptVersion,
    transaction_version: action653lAuthorityTransactionVersion,
    ticket_digest: (
      authorityTicket as Action653lAuthorityTicket
    ).ticket_digest,
    projection_digest: validated.projection.projection_digest,
    request_digest: validated.request_digest,
    execution_identity: validated.projection.execution_identity,
    session_identity: validated.projection.session_identity,
    confirmation_request_digest:
      validated.projection.confirmation_request_digest,
    confirmation_capability_digest:
      validated.projection.confirmation_capability_digest,
    predecessor_consumption_receipt_digest: consumed.receipt.receipt_digest,
    consumed_at: validated.consumed_at,
    consumption_count: 1 as const,
  };
  const receipt = freezePlainTree({
    ...unsignedReceipt,
    receipt_digest: digest(
      "action_653l_private_consumption_receipt",
      unsignedReceipt,
    ),
  }) as Action653lConsumptionReceipt;
  privateReceiptProvenance.add(receipt);
  record.consumed_request_digest = validated.request_digest;
  record.receipt = receipt;
  return { ok: true, receipt };
}
/* PRIVATE_AUTHORITY_MODULE_END */

const publicRequestKeys = [
  "authority_ticket",
  "consumed_at",
  "observed_at",
  "projection",
] as const;

function capturePublicRequest(
  value: unknown,
): CapturedRequest | SnapshotFailure {
  const budget: SnapshotBudgetState = {
    nodes: 0,
    properties: 0,
    string_bytes: 0,
  };
  if (
    !value ||
    typeof value !== "object" ||
    nodeTypes.isProxy(value) ||
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
  const sortedKeys = [...keys].sort();
  if (
    keys.some((key) => typeof key !== "string") ||
    keys.length !== publicRequestKeys.length ||
    !publicRequestKeys.every((key, index) => key === sortedKeys[index])
  ) {
    return snapshotFailure("request_shape_rejected", "$", budget);
  }
  for (const key of publicRequestKeys) {
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
  const projection = clonePlainIteratively(
    descriptors.projection.value,
    "$.projection",
    budget,
  );
  if (!projection.ok) return projection;
  const consumedAt = descriptors.consumed_at.value;
  const observedAt = descriptors.observed_at.value;
  if (typeof consumedAt !== "string" || typeof observedAt !== "string") {
    return snapshotFailure("non_plain_data_rejected", "$.timestamps", budget);
  }
  budget.string_bytes +=
    Buffer.byteLength(consumedAt, "utf8") +
    Buffer.byteLength(observedAt, "utf8");
  return Object.freeze({
    ok: true as const,
    authority_ticket: descriptors.authority_ticket.value,
    projection: projection.value as Action653lAuthorityProjection,
    consumed_at: consumedAt,
    observed_at: observedAt,
    witness_digest: digest("action_653l_public_snapshot_witness", {
      nodes: budget.nodes,
      properties: budget.properties,
      string_bytes: budget.string_bytes,
      projection: projection.value,
      consumed_at: consumedAt,
      observed_at: observedAt,
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

function isScaledInteger(value: unknown) {
  return typeof value === "string" && /^(?:0|[1-9]\d*)$/.test(value);
}

function validatePublicSnapshot(
  captured: CapturedRequest,
): ValidatedRequest | null {
  const projection = captured.projection;
  if (
    projection.projection_version !== action653lProjectionVersion ||
    projection.destination_identity !== action653lSyntheticDestinationIdentity ||
    projection.execution_mode !== "semi_automatic" ||
    !projection.execution_identity ||
    !projection.lifecycle_identity ||
    !projection.session_identity ||
    !projection.idempotency_identity ||
    projection.projection_digest !==
      rebuildAction653lProjectionDigest(projection) ||
    !isScaledInteger(projection.quantity?.value) ||
    projection.quantity.scale !== 0 ||
    projection.quantity.unit !== "units" ||
    !isScaledInteger(projection.limit_price?.value) ||
    projection.limit_price.scale !== 6 ||
    projection.limit_price.unit !== "SEK_micros_per_unit" ||
    projection.limit_price.currency !== "SEK" ||
    !isScaledInteger(projection.notional?.value) ||
    projection.notional.scale !== 6 ||
    projection.notional.unit !== "SEK_micros" ||
    projection.notional.currency !== "SEK"
  ) {
    return null;
  }
  try {
    if (
      BigInt(projection.quantity.value) *
        BigInt(projection.limit_price.value) !==
      BigInt(projection.notional.value)
    ) {
      return null;
    }
  } catch {
    return null;
  }

  const consumedAt =
    canonicalizeAction650uNanosecondInstant(captured.consumed_at);
  const observedAt =
    canonicalizeAction650uNanosecondInstant(captured.observed_at);
  const confirmedAt =
    canonicalizeAction650uNanosecondInstant(projection.confirmed_at);
  const sessionStartedAt =
    canonicalizeAction650uNanosecondInstant(projection.session_started_at);
  const sessionExpiresAt =
    canonicalizeAction650uNanosecondInstant(projection.session_expires_at);
  if (
    !consumedAt ||
    !observedAt ||
    !confirmedAt ||
    !sessionStartedAt ||
    !sessionExpiresAt ||
    compareAction650uInstants(confirmedAt, sessionStartedAt) < 0 ||
    compareAction650uInstants(consumedAt, confirmedAt) < 0 ||
    compareAction650uInstants(consumedAt, sessionExpiresAt) >= 0 ||
    compareAction650uInstants(observedAt, consumedAt) < 0
  ) {
    return null;
  }
  const expiresAt = instructionExpiresAt(
    consumedAt.canonical_instant,
    sessionExpiresAt.canonical_instant,
  );
  const expiresInstant = expiresAt
    ? canonicalizeAction650uNanosecondInstant(expiresAt)
    : null;
  if (
    !expiresAt ||
    !expiresInstant ||
    compareAction650uInstants(observedAt, expiresInstant) >= 0
  ) {
    return null;
  }
  const requestProjection = {
    projection_digest: projection.projection_digest,
    execution_identity: projection.execution_identity,
    session_identity: projection.session_identity,
    consumed_at: consumedAt.canonical_instant,
    observed_at: observedAt.canonical_instant,
    instruction_expires_at: expiresAt,
  };
  return freezePlainTree({
    projection,
    consumed_at: consumedAt.canonical_instant,
    observed_at: observedAt.canonical_instant,
    instruction_expires_at: expiresAt,
    request_digest: digest("action_653l_transaction_request", requestProjection),
    snapshot_digest: digest("action_653l_public_snapshot", requestProjection),
  }) as ValidatedRequest;
}

const safety = freezePlainTree({
  diagnostic_only: true as const,
  synthetic_only: true as const,
  broker_neutral: true as const,
  handle_opaque: true as const,
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
  caller_predecessor_handles_received: 0 as const,
  caller_predecessor_handles_stored: 0 as const,
  caller_predecessor_handles_forwarded: 0 as const,
  private_authority_lookups: 0 as const,
  private_confirmation_consumptions: 0 as const,
  post_transaction_caller_reads: 0 as const,
  synthetic_replay_admissions: 0 as const,
  transport_requests: 0 as const,
  credential_reads: 0 as const,
  database_reads: 0 as const,
  database_writes: 0 as const,
  process_spawns: 0 as const,
  trade_mutations: 0 as const,
});

const validationFailureEffects = freezePlainTree({
  ...zeroEffects,
  request_descriptor_reads: 1 as const,
});

const transactionFailureEffects = freezePlainTree({
  ...validationFailureEffects,
  private_authority_lookups: 1 as const,
});

const consumedEffects = freezePlainTree({
  ...transactionFailureEffects,
  private_confirmation_consumptions: 1 as const,
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
}) as Action653lLineage;

function lineage(
  projection: Action653lAuthorityProjection | null,
  receipt: Action653lConsumptionReceipt | null,
  submissionIntentIdentity: string | null,
): Action653lLineage {
  if (!projection) return emptyLineage;
  return freezePlainTree({
    execution_identity: projection.execution_identity,
    lifecycle_identity: projection.lifecycle_identity,
    preparation_trace_identity: projection.preparation_trace_identity,
    handoff_identity: projection.handoff_identity,
    handoff_digest: projection.handoff_digest,
    risk_admission_identity: projection.risk_admission_identity,
    risk_admission_digest: projection.risk_admission_digest,
    confirmation_request_digest: projection.confirmation_request_digest,
    confirmation_capability_digest: projection.confirmation_capability_digest,
    confirmation_consumption_digest:
      receipt?.predecessor_consumption_receipt_digest ?? null,
    session_identity: projection.session_identity,
    idempotency_identity: projection.idempotency_identity,
    submission_intent_identity: submissionIntentIdentity,
  });
}

function envelopeProjection(
  input: Omit<Action653lInstructionResult, "envelope_digest">,
) {
  return {
    contract_version: input.contract_version,
    transaction_version: input.transaction_version,
    gate_status: input.gate_status,
    instruction_status: input.instruction_status,
    terminal_reason: input.terminal_reason,
    snapshot_digest: input.snapshot_digest,
    capsule_digest: input.capsule_digest,
    authority_receipt: input.authority_receipt,
    lineage: input.lineage,
    instruction: input.instruction,
    failure_digest: input.failure_digest,
    safety: input.safety,
    effects: input.effects,
  };
}

export function rebuildAction653lEnvelopeDigest(
  input: Omit<Action653lInstructionResult, "envelope_digest">,
) {
  return digest("action_653l_instruction_envelope", envelopeProjection(input));
}

function finish(
  gateStatus: "enabled" | "disabled" | "kill_switch_active",
  partial: Omit<
    Action653lInstructionResult,
    | "contract_version"
    | "transaction_version"
    | "gate_status"
    | "envelope_digest"
    | "safety"
  >,
) {
  const withoutEnvelope = {
    contract_version: action653lContractVersion,
    transaction_version: action653lAuthorityTransactionVersion,
    gate_status: gateStatus,
    ...partial,
    safety,
  };
  return freezePlainTree({
    ...withoutEnvelope,
    envelope_digest:
      gateStatus === "enabled"
        ? rebuildAction653lEnvelopeDigest(withoutEnvelope)
        : null,
  }) as Action653lInstructionResult;
}

function staticResult(gateStatus: "disabled" | "kill_switch_active") {
  return finish(gateStatus, {
    instruction_status: "blocked",
    terminal_reason:
      gateStatus === "disabled" ? "instruction_disabled" : "kill_switch_active",
    snapshot_digest: null,
    capsule_digest: null,
    authority_receipt: null,
    lineage: emptyLineage,
    instruction: null,
    failure_digest: null,
    effects: zeroEffects,
  });
}

const disabledResult = staticResult("disabled");
const killedResult = staticResult("kill_switch_active");

function failure(
  status: Exclude<Action653lInstructionStatus, "prepared">,
  reason: Exclude<Action653lInstructionReason, "instruction_prepared">,
  input: {
    projection: Action653lAuthorityProjection | null;
    snapshot_digest: string | null;
    rejected_digest: string;
    transaction_attempted: boolean;
  },
) {
  const failureLineage = lineage(input.projection, null, null);
  return finish("enabled", {
    instruction_status: status,
    terminal_reason: reason,
    snapshot_digest: input.snapshot_digest,
    capsule_digest: null,
    authority_receipt: null,
    lineage: failureLineage,
    instruction: null,
    failure_digest: digest("action_653l_failure", {
      terminal_reason: reason,
      snapshot_digest: input.snapshot_digest,
      rejected_digest: input.rejected_digest,
      lineage: failureLineage,
    }),
    effects: input.transaction_attempted
      ? transactionFailureEffects
      : validationFailureEffects,
  });
}

function transactionFailureStatus(
  reason: TransactionFailure["reason"],
): Exclude<Action653lInstructionStatus, "prepared"> {
  if (reason === "confirmation_expired") return "expired";
  if (
    reason === "authority_projection_mismatch" ||
    reason === "conflicting_instruction_reuse" ||
    reason === "cross_execution_reuse_rejected"
  ) {
    return "conflicting";
  }
  return "blocked";
}

/*
 * PUBLIC_HANDLE_OPAQUE_INSTRUCTION_SUCCESSOR_BEGIN
 *
 * The public request has no predecessor authority handle fields. After the
 * private atomic transaction returns, only frozen projection, receipt,
 * capsule, instruction, and result bytes are used.
 */
export function runAction653lHandleOpaqueInstruction(
  gate: Readonly<{ enabled: boolean; kill_switch_active: boolean }>,
  request: unknown,
): Action653lInstructionResult {
  if (!gate.enabled) return disabledResult;
  if (gate.kill_switch_active) return killedResult;

  const captured = capturePublicRequest(request);
  if (!captured.ok) {
    return failure("unmappable", "input_snapshot_rejected", {
      projection: null,
      snapshot_digest: null,
      rejected_digest: captured.witness_digest,
      transaction_attempted: false,
    });
  }
  const validated = validatePublicSnapshot(captured);
  if (!validated) {
    return failure("unmappable", "plain_projection_invalid", {
      projection: captured.projection,
      snapshot_digest: null,
      rejected_digest: digest("action_653l_invalid_projection", {
        witness_digest: captured.witness_digest,
        projection: captured.projection,
      }),
      transaction_attempted: false,
    });
  }

  const transaction = executePrivateAtomicAuthorityTransaction(
    captured.authority_ticket,
    validated,
  );
  if (!transaction.ok) {
    return failure(
      transactionFailureStatus(transaction.reason),
      transaction.reason,
      {
        projection: validated.projection,
        snapshot_digest: validated.snapshot_digest,
        rejected_digest: digest("action_653l_transaction_rejection", {
          request_digest: validated.request_digest,
          reason: transaction.reason,
        }),
        transaction_attempted: true,
      },
    );
  }

  const prior = receiptResults.get(transaction.receipt);
  if (prior) {
    if (prior.request_digest === validated.request_digest) return prior.result;
    return failure("conflicting", "conflicting_instruction_reuse", {
      projection: validated.projection,
      snapshot_digest: validated.snapshot_digest,
      rejected_digest: digest("action_653l_result_conflict", {
        request_digest: validated.request_digest,
        prior_request_digest: prior.request_digest,
      }),
      transaction_attempted: true,
    });
  }
  if (
    !privateReceiptProvenance.has(transaction.receipt) ||
    !Object.isFrozen(transaction.receipt) ||
    transaction.receipt.receipt_digest !==
      rebuildAction653lReceiptDigest(transaction.receipt)
  ) {
    return failure("blocked", "authority_provenance_unproven", {
      projection: validated.projection,
      snapshot_digest: validated.snapshot_digest,
      rejected_digest: digest("action_653l_receipt_rejection", {
        request_digest: validated.request_digest,
      }),
      transaction_attempted: true,
    });
  }

  const submissionIntentIdentity =
    `action_653l_submission_intent_${hashAction650sCanonicalValue({
      request_digest: validated.request_digest,
      receipt_digest: transaction.receipt.receipt_digest,
      idempotency_identity: validated.projection.idempotency_identity,
      destination_identity: action653lSyntheticDestinationIdentity,
    }).slice(0, 24)}`;
  const capsuleWithoutDigest = {
    contract_version: action653lContractVersion,
    transaction_version: action653lAuthorityTransactionVersion,
    snapshot_digest: validated.snapshot_digest,
    projection_digest: validated.projection.projection_digest,
    authority_receipt_digest: transaction.receipt.receipt_digest,
    execution_identity: validated.projection.execution_identity,
    session_identity: validated.projection.session_identity,
    request_digest: validated.request_digest,
  };
  const capsuleDigest = digest(
    "action_653l_handle_opaque_capsule",
    capsuleWithoutDigest,
  );
  const instructionWithoutDigest = {
    schema_version: action653lInstructionSchemaVersion,
    destination_identity: action653lSyntheticDestinationIdentity,
    snapshot_digest: validated.snapshot_digest,
    capsule_digest: capsuleDigest,
    authority_receipt_digest: transaction.receipt.receipt_digest,
    execution_identity: validated.projection.execution_identity,
    lifecycle_identity: validated.projection.lifecycle_identity,
    preparation_trace_identity:
      validated.projection.preparation_trace_identity,
    handoff_identity: validated.projection.handoff_identity,
    handoff_digest: validated.projection.handoff_digest,
    risk_admission_identity:
      validated.projection.risk_admission_identity,
    risk_admission_digest: validated.projection.risk_admission_digest,
    confirmation_request_digest:
      validated.projection.confirmation_request_digest,
    confirmation_capability_digest:
      validated.projection.confirmation_capability_digest,
    confirmation_consumption_digest:
      transaction.receipt.predecessor_consumption_receipt_digest,
    session_identity: validated.projection.session_identity,
    instrument: validated.projection.instrument,
    side: validated.projection.side,
    order_type: validated.projection.order_type,
    quantity: validated.projection.quantity,
    limit_price: validated.projection.limit_price,
    notional: validated.projection.notional,
    idempotency_identity: validated.projection.idempotency_identity,
    submission_intent_identity: submissionIntentIdentity,
    instruction_created_at: validated.consumed_at,
    instruction_expires_at: validated.instruction_expires_at,
  };
  const instruction = freezePlainTree({
    ...instructionWithoutDigest,
    instruction_digest: digest(
      "action_653l_broker_neutral_instruction",
      instructionWithoutDigest,
    ),
  }) as Action653lBrokerNeutralInstruction;
  const prepared = finish("enabled", {
    instruction_status: "prepared",
    terminal_reason: "instruction_prepared",
    snapshot_digest: validated.snapshot_digest,
    capsule_digest: capsuleDigest,
    authority_receipt: transaction.receipt,
    lineage: lineage(
      validated.projection,
      transaction.receipt,
      submissionIntentIdentity,
    ),
    instruction,
    failure_digest: null,
    effects: consumedEffects,
  });
  preparedResultProvenance.add(prepared);
  receiptResults.set(transaction.receipt, {
    request_digest: validated.request_digest,
    result: prepared,
  });
  return prepared;
}
/* PUBLIC_HANDLE_OPAQUE_INSTRUCTION_SUCCESSOR_END */

export function canAction653lProceedToSyntheticReplay(value: unknown) {
  if (
    !value ||
    typeof value !== "object" ||
    !preparedResultProvenance.has(value as object)
  ) {
    return false;
  }
  const result = value as Action653lInstructionResult;
  if (
    !Object.isFrozen(result) ||
    result.instruction_status !== "prepared" ||
    !result.instruction ||
    !result.authority_receipt ||
    !result.envelope_digest ||
    result.instruction.destination_identity !==
      action653lSyntheticDestinationIdentity ||
    !privateReceiptProvenance.has(result.authority_receipt)
  ) {
    return false;
  }
  const { envelope_digest: claimed, ...withoutEnvelope } = result;
  return claimed === rebuildAction653lEnvelopeDigest(withoutEnvelope);
}

export function replayAction653lPreparedInstruction(
  value: unknown,
  observedAtValue: unknown,
): Action653lSyntheticReplayEvidence | null {
  if (!canAction653lProceedToSyntheticReplay(value)) return null;
  const result = value as Action653lInstructionResult;
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
    contract_version: "action_653l_synthetic_replay_gate_v1" as const,
    destination_identity: action653lSyntheticDestinationIdentity,
    execution_identity: instruction.execution_identity,
    submission_intent_identity: instruction.submission_intent_identity,
    instruction_digest: instruction.instruction_digest,
    instruction_envelope_digest: result.envelope_digest!,
    authority_receipt_digest: result.authority_receipt!.receipt_digest,
    observed_at: observedAt.canonical_instant,
    accepted: true as const,
    synthetic_only: true as const,
  };
  return freezePlainTree({
    ...withoutDigest,
    evidence_digest: digest(
      "action_653l_synthetic_replay_evidence",
      withoutDigest,
    ),
  });
}
