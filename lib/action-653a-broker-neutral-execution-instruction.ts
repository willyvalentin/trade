import { types as nodeTypes } from "node:util";

import {
  deepFreezeAction650s,
  hashAction650sCanonicalValue,
} from "@/lib/action-650s-execution-identity";
import {
  hasAction650sPreparedExecutionProvenance,
  type Action650sPreparedExecution,
} from "@/lib/action-650s-execution-preparation";
import {
  consumeAction650uManualConfirmation,
  type Action650uManualConfirmationBoundary,
  type Action650uManualConfirmationCapability,
  type Action650uManualConfirmationConsumptionReceipt,
} from "@/lib/action-650u-manual-confirmation";
import {
  canonicalizeAction650uNanosecondInstant,
  compareAction650uInstants,
} from "@/lib/action-650u-temporal-confirmation-policy";
import {
  canAction652cProceedToManualConfirmation,
  type Action652cAdmissionResult,
} from "@/lib/action-652c-non-forgeable-risk-authority";

export const action653aExecutionInstructionContractVersion =
  "action_653a_broker_neutral_execution_instruction_v1" as const;
export const action653aInstructionSchemaVersion =
  "action_653a_broker_neutral_instruction_schema_v1" as const;
export const action653aInputSnapshotPolicyVersion =
  "action_653a_single_read_plain_root_snapshot_v1" as const;
export const action653aInstructionExpiryPolicyVersion =
  "action_653a_instruction_expiry_min_session_or_30_seconds_v1" as const;
export const action653aSyntheticDestinationIdentity =
  "action_653a_synthetic_replay_only" as const;

export type Action653aInstructionStatus =
  | "prepared"
  | "blocked"
  | "expired"
  | "conflicting"
  | "unmappable";

export type Action653aInstructionReason =
  | "instruction_prepared"
  | "instruction_disabled"
  | "kill_switch_active"
  | "input_snapshot_rejected"
  | "preparation_provenance_unproven"
  | "risk_admission_unproven"
  | "risk_admission_not_admitted"
  | "execution_lineage_mismatch"
  | "session_lineage_mismatch"
  | "automatic_execution_rejected"
  | "quantity_price_notional_mismatch"
  | "unit_scale_currency_mismatch"
  | "confirmation_rejected"
  | "confirmation_expired"
  | "instruction_expired"
  | "conflicting_instruction_reuse"
  | "cross_execution_reuse_rejected"
  | "timestamp_unmappable";

export type Action653aExecutionInstructionRequest = Readonly<{
  prepared: Action650sPreparedExecution;
  risk_admission: Action652cAdmissionResult;
  confirmation_boundary: Action650uManualConfirmationBoundary;
  confirmation_capability: Action650uManualConfirmationCapability;
  consumed_at: string;
  observed_at: string;
}>;

export type Action653aBrokerNeutralInstruction = Readonly<{
  schema_version: typeof action653aInstructionSchemaVersion;
  destination_identity: typeof action653aSyntheticDestinationIdentity;
  execution_identity: string;
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

export type Action653aInstructionResult = Readonly<{
  contract_version: typeof action653aExecutionInstructionContractVersion;
  snapshot_policy_version: typeof action653aInputSnapshotPolicyVersion;
  expiry_policy_version: typeof action653aInstructionExpiryPolicyVersion;
  gate_status: "enabled" | "disabled" | "kill_switch_active";
  instruction_status: Action653aInstructionStatus;
  terminal_reason: Action653aInstructionReason;
  lineage: Readonly<{
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
  instruction: Action653aBrokerNeutralInstruction | null;
  observed_input_digests: Readonly<{
    request_digest: string | null;
    preparation_digest: string | null;
    risk_admission_digest: string | null;
    confirmation_digest: string | null;
    rejected_input_digest: string | null;
  }>;
  failure_provenance: Readonly<{
    terminal_reason: Exclude<Action653aInstructionReason, "instruction_prepared">;
    observed_rejected_input_digests: Action653aInstructionResult["observed_input_digests"];
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
    request_reads: 0 | 1;
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

export type Action653aSyntheticReplayEvidence = Readonly<{
  contract_version: "action_653a_synthetic_replay_gate_v1";
  destination_identity: typeof action653aSyntheticDestinationIdentity;
  execution_identity: string;
  submission_intent_identity: string;
  instruction_digest: string;
  instruction_envelope_digest: string;
  observed_at: string;
  accepted: true;
  synthetic_only: true;
  evidence_digest: string;
}>;

type CapturedRequest = Readonly<{
  prepared: unknown;
  risk_admission: unknown;
  confirmation_boundary: unknown;
  confirmation_capability: unknown;
  consumed_at: unknown;
  observed_at: unknown;
}>;

type DuplicateRecord = Readonly<{
  request_digest: string;
  prepared: unknown;
  risk_admission: unknown;
  confirmation_boundary: unknown;
  result: Action653aInstructionResult;
}>;

const requestKeys = [
  "confirmation_boundary",
  "confirmation_capability",
  "consumed_at",
  "observed_at",
  "prepared",
  "risk_admission",
] as const;

const preparedResultProvenance = new WeakSet<object>();
const consumptionRecords = new WeakMap<object, DuplicateRecord>();

const safety = deepFreezeAction650s({
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

const zeroEffects = deepFreezeAction650s({
  request_reads: 0 as const,
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

const activeEffects = deepFreezeAction650s({
  request_reads: 1 as const,
  digest_operations: 1 as const,
  manual_confirmation_consumptions: 1 as const,
  synthetic_replay_admissions: 0 as const,
  transport_requests: 0 as const,
  provider_calls: 0 as const,
  credential_reads: 0 as const,
  database_reads: 0 as const,
  database_writes: 0 as const,
  process_spawns: 0 as const,
  trade_mutations: 0 as const,
});

const nonConsumptionEffects = deepFreezeAction650s({
  ...activeEffects,
  manual_confirmation_consumptions: 0 as const,
});

const emptyLineage: Action653aInstructionResult["lineage"] =
  deepFreezeAction650s({
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
  });

const emptyDigests: Action653aInstructionResult["observed_input_digests"] =
  deepFreezeAction650s({
    request_digest: null,
    preparation_digest: null,
    risk_admission_digest: null,
    confirmation_digest: null,
    rejected_input_digest: null,
  });

function digest(label: string, value: unknown) {
  return `${label}_${hashAction650sCanonicalValue(value)}`;
}

function staticGateResult(
  gateStatus: "disabled" | "kill_switch_active",
): Action653aInstructionResult {
  return deepFreezeAction650s({
    contract_version: action653aExecutionInstructionContractVersion,
    snapshot_policy_version: action653aInputSnapshotPolicyVersion,
    expiry_policy_version: action653aInstructionExpiryPolicyVersion,
    gate_status: gateStatus,
    instruction_status: "blocked" as const,
    terminal_reason:
      gateStatus === "disabled" ? "instruction_disabled" : "kill_switch_active",
    lineage: emptyLineage,
    instruction: null,
    observed_input_digests: emptyDigests,
    failure_provenance: null,
    envelope_digest: null,
    safety,
    effects: zeroEffects,
  });
}

const disabledResult = staticGateResult("disabled");
const killedResult = staticGateResult("kill_switch_active");

function captureRequest(value: unknown):
  | Readonly<{ ok: true; value: CapturedRequest; witness_digest: string }>
  | Readonly<{ ok: false; witness_digest: string }> {
  const witness = {
    value_type: value === null ? "null" : typeof value,
    is_array: Array.isArray(value),
    is_proxy:
      Boolean(value) && typeof value === "object"
        ? nodeTypes.isProxy(value as object)
        : false,
  };
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    nodeTypes.isProxy(value)
  ) {
    return {
      ok: false,
      witness_digest: digest("action_653a_rejected_root", witness),
    };
  }

  try {
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const keys = Object.keys(descriptors).sort();
    const symbols = Object.getOwnPropertySymbols(value);
    const descriptorWitness = Object.fromEntries(
      keys.map((key) => [
        key,
        {
          accessor:
            "get" in descriptors[key] || "set" in descriptors[key],
          enumerable: descriptors[key].enumerable,
        },
      ]),
    );
    const witnessDigest = digest("action_653a_root_descriptors", {
      keys,
      symbol_count: symbols.length,
      descriptors: descriptorWitness,
    });
    if (
      symbols.length !== 0 ||
      keys.length !== requestKeys.length ||
      !requestKeys.every((key, index) => key === keys[index]) ||
      keys.some(
        (key) =>
          "get" in descriptors[key] || "set" in descriptors[key],
      )
    ) {
      return { ok: false, witness_digest: witnessDigest };
    }

    const captured = Object.fromEntries(
      requestKeys.map((key) => [key, descriptors[key].value]),
    ) as CapturedRequest;
    if (
      captured.prepared === value ||
      captured.risk_admission === value ||
      captured.confirmation_boundary === value ||
      captured.confirmation_capability === value
    ) {
      return { ok: false, witness_digest: witnessDigest };
    }
    return {
      ok: true,
      value: deepFreezeAction650s({ ...captured }),
      witness_digest: witnessDigest,
    };
  } catch {
    return {
      ok: false,
      witness_digest: digest("action_653a_descriptor_exception", witness),
    };
  }
}

function isPlainTrustedObject(value: unknown): value is object {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !nodeTypes.isProxy(value as object) &&
    Object.isFrozen(value)
  );
}

function ownDataString(value: unknown, key: string) {
  if (
    !value ||
    typeof value !== "object" ||
    nodeTypes.isProxy(value)
  ) {
    return null;
  }
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return (
      descriptor &&
      !("get" in descriptor) &&
      !("set" in descriptor) &&
      typeof descriptor.value === "string"
        ? descriptor.value
        : null
    );
  } catch {
    return null;
  }
}

function canonicalRequestDigest(root: CapturedRequest) {
  const consumedAt = canonicalizeAction650uNanosecondInstant(root.consumed_at);
  const observedAt = canonicalizeAction650uNanosecondInstant(root.observed_at);
  return digest("action_653a_request", {
    preparation_trace_identity: ownDataString(
      root.prepared,
      "trace_identity",
    ),
    risk_admission_digest: ownDataString(
      root.risk_admission,
      "terminal_digest",
    ),
    confirmation_capability_digest: ownDataString(
      root.confirmation_capability,
      "capability_digest",
    ),
    consumed_at: consumedAt?.canonical_instant ?? null,
    observed_at: observedAt?.canonical_instant ?? null,
  });
}

function observedDigests(
  requestDigest: string | null,
  prepared: Action650sPreparedExecution | null,
  risk: Action652cAdmissionResult | null,
  capability: Action650uManualConfirmationCapability | null,
  rejectedInputDigest: string | null,
): Action653aInstructionResult["observed_input_digests"] {
  return deepFreezeAction650s({
    request_digest: requestDigest,
    preparation_digest: prepared
      ? digest("action_653a_preparation", {
          trace_identity: prepared.trace_identity,
          runtime_identity_context_digest:
            prepared.runtime_identity_context_digest,
          handoff_digest: prepared.handoff.identity.handoff_digest,
        })
      : null,
    risk_admission_digest: risk?.terminal_digest ?? null,
    confirmation_digest: capability?.capability_digest ?? null,
    rejected_input_digest: rejectedInputDigest,
  });
}

function lineageProjection(
  prepared: Action650sPreparedExecution | null,
  risk: Action652cAdmissionResult | null,
  capability: Action650uManualConfirmationCapability | null,
  receipt: Action650uManualConfirmationConsumptionReceipt | null,
  submissionIntentIdentity: string | null,
): Action653aInstructionResult["lineage"] {
  return deepFreezeAction650s({
    execution_identity:
      prepared?.runtime_identity_context.execution_identity ?? null,
    lifecycle_identity:
      prepared?.runtime_identity_context.lifecycle_identity ?? null,
    preparation_trace_identity: prepared?.trace_identity ?? null,
    handoff_identity:
      prepared?.handoff.identity.handoff_identity ?? null,
    handoff_digest: prepared?.handoff.identity.handoff_digest ?? null,
    risk_admission_identity:
      risk?.manual_confirmation_admission === false
        ? null
        : (risk?.manual_confirmation_admission.admission_identity ?? null),
    risk_admission_digest: risk?.terminal_digest ?? null,
    confirmation_request_digest:
      capability?.confirmation_request_digest ?? null,
    confirmation_capability_digest: capability?.capability_digest ?? null,
    confirmation_consumption_digest: receipt?.receipt_digest ?? null,
    session_identity: capability?.session_identity ?? null,
    idempotency_identity:
      prepared?.handoff.identity.idempotency_identity ?? null,
    submission_intent_identity: submissionIntentIdentity,
  });
}

function terminalWithoutDigest(
  input: Omit<Action653aInstructionResult, "envelope_digest">,
) {
  return {
    contract_version: input.contract_version,
    snapshot_policy_version: input.snapshot_policy_version,
    expiry_policy_version: input.expiry_policy_version,
    gate_status: input.gate_status,
    instruction_status: input.instruction_status,
    terminal_reason: input.terminal_reason,
    lineage: input.lineage,
    instruction: input.instruction,
    observed_input_digests: input.observed_input_digests,
    failure_provenance: input.failure_provenance,
    safety: input.safety,
    effects: input.effects,
  };
}

export function rebuildAction653aInstructionEnvelopeDigest(
  input: Omit<Action653aInstructionResult, "envelope_digest">,
) {
  return digest(
    "action_653a_instruction_envelope",
    terminalWithoutDigest(input),
  );
}

export function rebuildAction653aFailureDigest(input: {
  terminal_reason: Exclude<
    Action653aInstructionReason,
    "instruction_prepared"
  >;
  observed_rejected_input_digests:
    Action653aInstructionResult["observed_input_digests"];
  lineage: Action653aInstructionResult["lineage"];
}) {
  return digest("action_653a_failure", input);
}

function finish(
  partial: Omit<
    Action653aInstructionResult,
    | "contract_version"
    | "snapshot_policy_version"
    | "expiry_policy_version"
    | "gate_status"
    | "envelope_digest"
    | "safety"
  >,
): Action653aInstructionResult {
  const withoutEnvelope = {
    contract_version: action653aExecutionInstructionContractVersion,
    snapshot_policy_version: action653aInputSnapshotPolicyVersion,
    expiry_policy_version: action653aInstructionExpiryPolicyVersion,
    gate_status: "enabled" as const,
    ...partial,
    safety,
  };
  const result = deepFreezeAction650s({
    ...withoutEnvelope,
    envelope_digest:
      rebuildAction653aInstructionEnvelopeDigest(withoutEnvelope),
  }) as Action653aInstructionResult;
  if (result.instruction_status === "prepared") {
    preparedResultProvenance.add(result);
  }
  return result;
}

function fail(
  status: Exclude<Action653aInstructionStatus, "prepared">,
  reason: Exclude<Action653aInstructionReason, "instruction_prepared">,
  input: {
    request_digest: string | null;
    prepared: Action650sPreparedExecution | null;
    risk: Action652cAdmissionResult | null;
    capability: Action650uManualConfirmationCapability | null;
    receipt?: Action650uManualConfirmationConsumptionReceipt | null;
    rejected_input_digest: string;
    effects?: typeof nonConsumptionEffects | typeof activeEffects;
  },
) {
  const digests = observedDigests(
    input.request_digest,
    input.prepared,
    input.risk,
    input.capability,
    input.rejected_input_digest,
  );
  const lineage = lineageProjection(
    input.prepared,
    input.risk,
    input.capability,
    input.receipt ?? null,
    null,
  );
  const failureWithoutDigest = {
    terminal_reason: reason,
    observed_rejected_input_digests: digests,
  };
  return finish({
    instruction_status: status,
    terminal_reason: reason,
    lineage,
    instruction: null,
    observed_input_digests: digests,
    failure_provenance: deepFreezeAction650s({
      ...failureWithoutDigest,
      failure_digest: rebuildAction653aFailureDigest({
        ...failureWithoutDigest,
        lineage,
      }),
    }),
    effects: input.effects ?? nonConsumptionEffects,
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
  const nanos = seconds + BigInt(matched[2]) + amount;
  const milliseconds = Number(nanos / BigInt(1_000_000));
  const remainder = nanos % BigInt(1_000_000_000);
  const prefix = new Date(milliseconds).toISOString().slice(0, 19);
  return `${prefix}.${remainder.toString().padStart(9, "0")}Z`;
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

function preparedMicros(prepared: Action650sPreparedExecution) {
  const quantity = prepared.handoff.payload.quantity;
  const limitPrice = prepared.handoff.payload.limit_price;
  if (
    !Number.isSafeInteger(quantity) ||
    quantity <= 0 ||
    typeof limitPrice !== "number" ||
    !Number.isFinite(limitPrice) ||
    limitPrice <= 0
  ) {
    return null;
  }
  const priceMicrosNumber = limitPrice * 1_000_000;
  if (!Number.isSafeInteger(priceMicrosNumber)) return null;
  const quantityUnits = BigInt(quantity);
  const priceMicros = BigInt(priceMicrosNumber);
  return {
    quantity_units: quantityUnits.toString(),
    price_micros: priceMicros.toString(),
    notional_micros: (quantityUnits * priceMicros).toString(),
  };
}

function trustedInputs(root: CapturedRequest) {
  const prepared =
    isPlainTrustedObject(root.prepared) &&
    hasAction650sPreparedExecutionProvenance(root.prepared)
      ? (root.prepared as Action650sPreparedExecution)
      : null;
  const riskCandidate =
    isPlainTrustedObject(root.risk_admission)
      ? (root.risk_admission as Action652cAdmissionResult)
      : null;
  const capabilityCandidate =
    isPlainTrustedObject(root.confirmation_capability)
      ? (root.confirmation_capability as Action650uManualConfirmationCapability)
      : null;
  const boundaryCandidate =
    isPlainTrustedObject(root.confirmation_boundary)
      ? (root.confirmation_boundary as Action650uManualConfirmationBoundary)
      : null;
  return {
    prepared,
    riskCandidate,
    capabilityCandidate,
    boundaryCandidate,
  };
}

function lineageMatches(
  prepared: Action650sPreparedExecution,
  risk: Action652cAdmissionResult,
  capability: Action650uManualConfirmationCapability,
) {
  const predecessor = risk.predecessor_admission;
  const lineage = predecessor?.lineage;
  const intent = predecessor?.intent_projection;
  const payload = prepared.handoff.payload;
  return Boolean(
    lineage &&
      intent &&
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
      capability.handoff_identity === lineage.handoff_identity &&
      capability.handoff_digest === lineage.handoff_digest &&
      capability.canonical_order_payload_digest ===
        lineage.canonical_order_payload_digest &&
      capability.idempotency_identity === lineage.idempotency_identity &&
      capability.session_identity === lineage.session_identity &&
      intent.instrument === payload.ticker &&
      intent.side === payload.side,
  );
}

function payloadMatches(
  prepared: Action650sPreparedExecution,
  risk: Action652cAdmissionResult,
) {
  const intent = risk.predecessor_admission?.intent_projection;
  const scaled = preparedMicros(prepared);
  if (!intent || !scaled) return { ok: false as const, unit: false };
  const unit =
    intent.quantity.scale === 0 &&
    intent.quantity.unit === "units" &&
    intent.limit_price.scale === 6 &&
    intent.limit_price.unit === "SEK_micros_per_unit" &&
    intent.notional.scale === 6 &&
    intent.notional.unit === "SEK_micros";
  return {
    ok:
      unit &&
      intent.quantity.value === scaled.quantity_units &&
      intent.limit_price.value === scaled.price_micros &&
      intent.notional.value === scaled.notional_micros,
    unit,
    scaled,
  };
}

export function runAction653aBrokerNeutralExecutionInstruction(
  gate: Readonly<{ enabled: boolean; kill_switch_active: boolean }>,
  request: unknown,
): Action653aInstructionResult {
  if (!gate.enabled) return disabledResult;
  if (gate.kill_switch_active) return killedResult;

  const captured = captureRequest(request);
  if (!captured.ok) {
    return fail("unmappable", "input_snapshot_rejected", {
      request_digest: null,
      prepared: null,
      risk: null,
      capability: null,
      rejected_input_digest: captured.witness_digest,
    });
  }

  const root = captured.value;
  const requestDigest = canonicalRequestDigest(root);
  const {
    prepared,
    riskCandidate,
    capabilityCandidate,
    boundaryCandidate,
  } = trustedInputs(root);
  const risk =
    riskCandidate &&
    canAction652cProceedToManualConfirmation(riskCandidate)
      ? riskCandidate
      : null;
  const rejectedDigest = digest("action_653a_rejected_input", {
    request_digest: requestDigest,
    descriptor_witness_digest: captured.witness_digest,
  });

  if (
    capabilityCandidate &&
    typeof capabilityCandidate === "object"
  ) {
    const prior = consumptionRecords.get(capabilityCandidate);
    if (prior) {
      if (
        prior.request_digest === requestDigest &&
        prior.prepared === root.prepared &&
        prior.risk_admission === root.risk_admission &&
        prior.confirmation_boundary === root.confirmation_boundary
      ) {
        return prior.result;
      }
      return fail(
        "conflicting",
        prepared &&
          prior.prepared !== root.prepared &&
          prepared.runtime_identity_context.execution_identity !==
            (
              prior.prepared as Action650sPreparedExecution
            ).runtime_identity_context.execution_identity
          ? "cross_execution_reuse_rejected"
          : "conflicting_instruction_reuse",
        {
          request_digest: requestDigest,
          prepared,
          risk,
          capability: capabilityCandidate,
          rejected_input_digest: rejectedDigest,
        },
      );
    }
  }

  if (!prepared) {
    return fail("blocked", "preparation_provenance_unproven", {
      request_digest: requestDigest,
      prepared: null,
      risk,
      capability: null,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (!risk) {
    return fail(
      "blocked",
      "risk_admission_unproven",
      {
        request_digest: requestDigest,
        prepared,
        risk: null,
        capability: null,
        rejected_input_digest: rejectedDigest,
      },
    );
  }
  if (!capabilityCandidate || !boundaryCandidate) {
    return fail("blocked", "confirmation_rejected", {
      request_digest: requestDigest,
      prepared,
      risk,
      capability: null,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (
    prepared.handoff.payload.execution_mode !== "semi_automatic"
  ) {
    return fail("blocked", "automatic_execution_rejected", {
      request_digest: requestDigest,
      prepared,
      risk,
      capability: null,
      rejected_input_digest: rejectedDigest,
    });
  }
  const parity = payloadMatches(prepared, risk);
  if (!parity.unit) {
    return fail("unmappable", "unit_scale_currency_mismatch", {
      request_digest: requestDigest,
      prepared,
      risk,
      capability: null,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (!parity.ok || !parity.scaled) {
    return fail("conflicting", "quantity_price_notional_mismatch", {
      request_digest: requestDigest,
      prepared,
      risk,
      capability: null,
      rejected_input_digest: rejectedDigest,
    });
  }

  const consumedAt = canonicalizeAction650uNanosecondInstant(root.consumed_at);
  const observedAt = canonicalizeAction650uNanosecondInstant(root.observed_at);
  if (!consumedAt || !observedAt) {
    return fail("unmappable", "timestamp_unmappable", {
      request_digest: requestDigest,
      prepared,
      risk,
      capability: null,
      rejected_input_digest: rejectedDigest,
    });
  }
  if (compareAction650uInstants(observedAt, consumedAt) < 0) {
    return fail("unmappable", "timestamp_unmappable", {
      request_digest: requestDigest,
      prepared,
      risk,
      capability: null,
      rejected_input_digest: rejectedDigest,
    });
  }

  const consumed = consumeAction650uManualConfirmation({
    boundary: boundaryCandidate,
    prepared,
    capability: capabilityCandidate,
    consumed_at: consumedAt.canonical_instant,
  });
  if (!consumed.ok) {
    return fail(
      consumed.reason === "capability_expired" ? "expired" : "blocked",
      consumed.reason === "capability_expired"
        ? "confirmation_expired"
        : "confirmation_rejected",
      {
        request_digest: requestDigest,
        prepared,
        risk,
        capability: null,
        rejected_input_digest: digest("action_653a_confirmation_rejection", {
          rejectedDigest,
          reason: consumed.reason,
        }),
      },
    );
  }

  const capability = capabilityCandidate;
  const receipt = consumed.receipt;
  if (
    capability.execution_mode !== "semi_automatic"
  ) {
    return fail("blocked", "automatic_execution_rejected", {
      request_digest: requestDigest,
      prepared,
      risk,
      capability,
      receipt,
      rejected_input_digest: rejectedDigest,
      effects: activeEffects,
    });
  }
  if (!lineageMatches(prepared, risk, capability)) {
    return fail("conflicting", "execution_lineage_mismatch", {
      request_digest: requestDigest,
      prepared,
      risk,
      capability,
      receipt,
      rejected_input_digest: rejectedDigest,
      effects: activeEffects,
    });
  }
  if (receipt.session_expires_at !== capability.session_expires_at) {
    return fail("conflicting", "session_lineage_mismatch", {
      request_digest: requestDigest,
      prepared,
      risk,
      capability,
      receipt,
      rejected_input_digest: rejectedDigest,
      effects: activeEffects,
    });
  }
  const expiresAt = instructionExpiresAt(
    consumedAt.canonical_instant,
    receipt.session_expires_at,
  );
  if (!expiresAt) {
    return fail("unmappable", "timestamp_unmappable", {
      request_digest: requestDigest,
      prepared,
      risk,
      capability,
      receipt,
      rejected_input_digest: rejectedDigest,
      effects: activeEffects,
    });
  }
  if (
    compareAction650uInstants(
      observedAt,
      canonicalizeAction650uNanosecondInstant(expiresAt)!,
    ) >= 0
  ) {
    const expiredResult = fail("expired", "instruction_expired", {
      request_digest: requestDigest,
      prepared,
      risk,
      capability,
      receipt,
      rejected_input_digest: rejectedDigest,
      effects: activeEffects,
    });
    consumptionRecords.set(capabilityCandidate, {
      request_digest: requestDigest,
      prepared: root.prepared,
      risk_admission: root.risk_admission,
      confirmation_boundary: root.confirmation_boundary,
      result: expiredResult,
    });
    return expiredResult;
  }

  const riskGate = risk.manual_confirmation_admission;
  if (riskGate === false || !risk.terminal_digest) {
    return fail("blocked", "risk_admission_not_admitted", {
      request_digest: requestDigest,
      prepared,
      risk,
      capability,
      receipt,
      rejected_input_digest: rejectedDigest,
      effects: activeEffects,
    });
  }
  const submissionIntentSeed = {
    execution_identity:
      prepared.runtime_identity_context.execution_identity,
    risk_admission_digest: risk.terminal_digest,
    confirmation_consumption_digest: receipt.receipt_digest,
    idempotency_identity:
      prepared.handoff.identity.idempotency_identity,
    destination_identity: action653aSyntheticDestinationIdentity,
  };
  const submissionIntentIdentity =
    `action_653a_submission_intent_${hashAction650sCanonicalValue(
      submissionIntentSeed,
    ).slice(0, 24)}`;
  const instructionWithoutDigest = {
    schema_version: action653aInstructionSchemaVersion,
    destination_identity: action653aSyntheticDestinationIdentity,
    execution_identity:
      prepared.runtime_identity_context.execution_identity,
    preparation_trace_identity: prepared.trace_identity,
    handoff_identity: prepared.handoff.identity.handoff_identity,
    handoff_digest: prepared.handoff.identity.handoff_digest,
    risk_admission_identity: riskGate.admission_identity,
    risk_admission_digest: risk.terminal_digest,
    confirmation_request_digest:
      capability.confirmation_request_digest,
    confirmation_capability_digest: capability.capability_digest,
    confirmation_consumption_digest: receipt.receipt_digest,
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
    idempotency_identity:
      prepared.handoff.identity.idempotency_identity,
    submission_intent_identity: submissionIntentIdentity,
    instruction_created_at: consumedAt.canonical_instant,
    instruction_expires_at: expiresAt,
  };
  const instruction = deepFreezeAction650s({
    ...instructionWithoutDigest,
    instruction_digest: digest(
      "action_653a_broker_neutral_instruction",
      instructionWithoutDigest,
    ),
  }) as Action653aBrokerNeutralInstruction;
  const result = finish({
    instruction_status: "prepared",
    terminal_reason: "instruction_prepared",
    lineage: lineageProjection(
      prepared,
      risk,
      capability,
      receipt,
      submissionIntentIdentity,
    ),
    instruction,
    observed_input_digests: observedDigests(
      requestDigest,
      prepared,
      risk,
      capability,
      null,
    ),
    failure_provenance: null,
    effects: activeEffects,
  });
  consumptionRecords.set(capabilityCandidate, {
    request_digest: requestDigest,
    prepared: root.prepared,
    risk_admission: root.risk_admission,
    confirmation_boundary: root.confirmation_boundary,
    result,
  });
  return result;
}

export function canAction653aProceedToSyntheticReplay(value: unknown) {
  if (
    !value ||
    typeof value !== "object" ||
    !preparedResultProvenance.has(value as object)
  ) {
    return false;
  }
  const result = value as Action653aInstructionResult;
  if (
    result.instruction_status !== "prepared" ||
    !result.instruction ||
    !result.envelope_digest ||
    !Object.isFrozen(result)
  ) {
    return false;
  }
  const { envelope_digest: envelopeDigest, ...withoutEnvelope } = result;
  return (
    envelopeDigest ===
    rebuildAction653aInstructionEnvelopeDigest(withoutEnvelope)
  );
}

export function replayAction653aPreparedInstruction(
  result: unknown,
  observedAtValue: unknown,
): Action653aSyntheticReplayEvidence | null {
  if (!canAction653aProceedToSyntheticReplay(result)) return null;
  const prepared = result as Action653aInstructionResult;
  const instruction = prepared.instruction!;
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
    contract_version: "action_653a_synthetic_replay_gate_v1" as const,
    destination_identity: action653aSyntheticDestinationIdentity,
    execution_identity: instruction.execution_identity,
    submission_intent_identity: instruction.submission_intent_identity,
    instruction_digest: instruction.instruction_digest,
    instruction_envelope_digest: prepared.envelope_digest!,
    observed_at: observedAt.canonical_instant,
    accepted: true as const,
    synthetic_only: true as const,
  };
  return deepFreezeAction650s({
    ...withoutDigest,
    evidence_digest: digest(
      "action_653a_synthetic_replay_evidence",
      withoutDigest,
    ),
  });
}
