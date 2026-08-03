import { types as nodeTypes } from "node:util";

import {
  hashAction650sCanonicalValue,
  createAction650sRuntimeIdentityContext,
} from "@/lib/action-650s-execution-identity";
import {
  hasAction650sPreparedExecutionProvenance,
  prepareAction650sExecution,
  type Action650sPreparedExecution,
} from "@/lib/action-650s-execution-preparation";
import {
  consumeAction650uManualConfirmation,
  createAction650uManualConfirmationBoundary,
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
  runAction652cExecutionIntentAdmission,
  type Action652cAdmissionResult,
} from "@/lib/action-652c-non-forgeable-risk-authority";

const contractVersion =
  "action_653s_non_exportable_authority_transaction_v5" as const;
const requestVersion = "action_653s_plain_instruction_request_v1" as const;
const operationIdentity = "action_653s_prepare_synthetic_instruction" as const;
const transactionVersion =
  "action_653s_private_atomic_authority_transaction_v1" as const;
const instructionSchemaVersion =
  "action_653s_broker_neutral_instruction_schema_v5" as const;
const receiptVersion = "action_653s_plain_consumption_receipt_v1" as const;
const syntheticDestinationIdentity =
  "action_653s_module_owned_synthetic_replay_only" as const;
const executionIdentity = "action-651a-execution" as const;
const sessionIdentity = "action-651a-confirmation-session" as const;
const sessionExpiresAt = "2026-07-29T10:10:00.000000000Z" as const;
const confirmedAt = "2026-07-29T10:00:01.000000000Z" as const;

const snapshotBudget = Object.freeze({
  maximum_depth: 24,
  maximum_nodes: 512,
  maximum_properties: 2_048,
  maximum_string_bytes: 131_072,
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
  | "non_plain_data_rejected";

type SnapshotResult =
  | Readonly<{ ok: true; value: PlainValue; descriptor_reads: number }>
  | Readonly<{
      ok: false;
      reason: SnapshotFailureReason;
      witness_digest: string;
      descriptor_reads: number;
    }>;

export type Action653sGate = Readonly<{
  enabled: boolean;
  kill_switch_active: boolean;
}>;

export type Action653sPublicInstructionInput = Readonly<{
  request_version: typeof requestVersion;
  operation: typeof operationIdentity;
  idempotency_key: string;
  observed_at: string;
}>;

export type Action653sPlainConsumptionReceipt = Readonly<{
  receipt_version: typeof receiptVersion;
  transaction_version: typeof transactionVersion;
  request_digest: string;
  execution_identity: typeof executionIdentity;
  session_identity: typeof sessionIdentity;
  preparation_trace_identity: string;
  handoff_digest: string;
  risk_admission_digest: string;
  confirmation_request_digest: string;
  confirmation_capability_digest: string;
  predecessor_consumption_receipt_digest: string;
  consumed_at: string;
  consumption_count: 1;
  receipt_digest: string;
}>;

export type Action653sBrokerNeutralInstruction = Readonly<{
  schema_version: typeof instructionSchemaVersion;
  destination_identity: typeof syntheticDestinationIdentity;
  execution_identity: typeof executionIdentity;
  lifecycle_identity: string;
  preparation_trace_identity: string;
  handoff_identity: string;
  handoff_digest: string;
  risk_admission_identity: string;
  risk_admission_digest: string;
  confirmation_request_digest: string;
  confirmation_capability_digest: string;
  confirmation_consumption_digest: string;
  session_identity: typeof sessionIdentity;
  instrument: "AAPL";
  side: "SELL";
  order_type: "STOP_LIMIT";
  quantity: Readonly<{ value: "5"; scale: 0; unit: "units" }>;
  limit_price: Readonly<{
    value: "179000000";
    scale: 6;
    unit: "SEK_micros_per_unit";
    currency: "SEK";
  }>;
  notional: Readonly<{
    value: "895000000";
    scale: 6;
    unit: "SEK_micros";
    currency: "SEK";
  }>;
  idempotency_identity: string;
  instruction_created_at: string;
  instruction_expires_at: typeof sessionExpiresAt;
  instruction_digest: string;
}>;

export type Action653sSyntheticReplayEvidence = Readonly<{
  evidence_version: "action_653s_synthetic_replay_evidence_v1";
  destination_identity: typeof syntheticDestinationIdentity;
  execution_identity: typeof executionIdentity;
  instruction_digest: string;
  receipt_digest: string;
  observed_at: string;
  accepted: true;
  synthetic_only: true;
  evidence_digest: string;
}>;

export type Action653sDiagnosticAuditHandoff = Readonly<{
  handoff_version: "action_653s_to_action_651c_diagnostic_audit_v1";
  execution_identity: typeof executionIdentity;
  instruction_digest: string;
  receipt_digest: string;
  synthetic_replay_evidence_digest: string;
  diagnostic_only: true;
  real_broker_evidence: false;
  performance_eligible: false;
  automatic_execution_allowed: false;
  handoff_digest: string;
}>;

export type Action653sInstructionResult = Readonly<{
  contract_version: typeof contractVersion;
  gate_status: "disabled" | "kill_switch_active" | "enabled";
  instruction_status:
    | "prepared"
    | "blocked"
    | "expired"
    | "conflicting"
    | "unmappable";
  terminal_reason:
    | "instruction_disabled"
    | "kill_switch_active"
    | "input_snapshot_rejected"
    | "plain_request_invalid"
    | "instruction_expired"
    | "private_composition_failed"
    | "authority_provenance_unproven"
    | "confirmation_rejected"
    | "instruction_prepared"
    | "exact_duplicate_idempotent"
    | "conflicting_instruction_reuse";
  observed_input_digest: string | null;
  failure_digest: string | null;
  receipt: Action653sPlainConsumptionReceipt | null;
  instruction: Action653sBrokerNeutralInstruction | null;
  synthetic_replay: Action653sSyntheticReplayEvidence | null;
  diagnostic_audit_handoff: Action653sDiagnosticAuditHandoff | null;
  safety: Readonly<{
    diagnostic_only: true;
    synthetic_only: true;
    real_broker_submission: false;
    avanza_live_access: false;
    credential_access: false;
    browser_or_cdp_access: false;
    automatic_execution: false;
    trade_mutation: false;
    production_write: false;
  }>;
  effects: Readonly<{
    request_descriptor_reads: number;
    private_composition_transactions: 0 | 1;
    private_confirmation_consumptions: 0 | 1;
    total_confirmation_consumptions: 0 | 1;
    caller_handles_received: 0;
    caller_authority_selections: 0;
    broker_requests: 0;
    provider_calls: 0;
    credential_reads: 0;
    browser_or_cdp_operations: 0;
    database_reads: 0;
    database_writes: 0;
    process_spawns: 0;
    trade_mutations: 0;
  }>;
  idempotent_replay: boolean;
  terminal_digest: string | null;
}>;

type ValidatedRequest = Readonly<{
  idempotency_key: string;
  observed_at: string;
  request_digest: string;
  descriptor_reads: number;
}>;

type PrivateComposition = Readonly<{
  prepared: Action650sPreparedExecution;
  risk_admission: Action652cAdmissionResult;
  boundary: Action650uManualConfirmationBoundary;
  capability: Action650uManualConfirmationCapability;
}>;

type StoredResult = Readonly<{
  request_digest: string;
  result: Action653sInstructionResult;
}>;

const storedResults = new Map<string, StoredResult>();

function digest(prefix: string, value: unknown) {
  return `${prefix}_${hashAction650sCanonicalValue(value)}`;
}

function freezePlain<T>(value: T): Readonly<T> {
  if (!value || typeof value !== "object") return value as Readonly<T>;
  const stack: object[] = [value as object];
  const seen = new WeakSet<object>();
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (seen.has(current)) continue;
    seen.add(current);
    for (const descriptor of Object.values(
      Object.getOwnPropertyDescriptors(current),
    )) {
      if ("value" in descriptor && descriptor.value && typeof descriptor.value === "object") {
        stack.push(descriptor.value as object);
      }
    }
    Object.freeze(current);
  }
  return value as Readonly<T>;
}

function snapshotPlain(value: unknown): SnapshotResult {
  let descriptorReads = 0;
  let nodes = 0;
  let properties = 0;
  let stringBytes = 0;
  const failure = (reason: SnapshotFailureReason, path: string): SnapshotResult => ({
    ok: false,
    reason,
    witness_digest: digest("action_653s_snapshot_failure", { reason, path }),
    descriptor_reads: descriptorReads,
  });
  if (nodeTypes.isProxy(value)) return failure("proxy_rejected", "$");
  if (!value || typeof value !== "object") {
    return failure("non_plain_data_rejected", "$");
  }
  const rootPrototype = Object.getPrototypeOf(value);
  if (rootPrototype !== Object.prototype && rootPrototype !== null) {
    return failure("non_plain_data_rejected", "$");
  }
  const root: Record<string, PlainValue> = {};
  const seen = new WeakSet<object>();
  const stack: Array<{
    source: object;
    target: Record<string, PlainValue> | PlainValue[];
    path: string;
    depth: number;
  }> = [{ source: value, target: root, path: "$", depth: 0 }];

  while (stack.length > 0) {
    const frame = stack.pop()!;
    if (seen.has(frame.source)) return failure("cycle_rejected", frame.path);
    seen.add(frame.source);
    nodes += 1;
    if (
      nodes > snapshotBudget.maximum_nodes ||
      frame.depth > snapshotBudget.maximum_depth
    ) {
      return failure("snapshot_budget_exceeded", frame.path);
    }
    if (nodeTypes.isProxy(frame.source)) return failure("proxy_rejected", frame.path);

    let keys: PropertyKey[];
    let descriptors: PropertyDescriptorMap;
    try {
      keys = Reflect.ownKeys(frame.source);
      descriptors = Object.getOwnPropertyDescriptors(frame.source);
      descriptorReads += 1;
    } catch {
      return failure("descriptor_inspection_failed", frame.path);
    }
    if (keys.some((key) => typeof key === "symbol")) {
      return failure("non_plain_data_rejected", frame.path);
    }
    for (const key of keys as string[]) {
      properties += 1;
      if (properties > snapshotBudget.maximum_properties) {
        return failure("snapshot_budget_exceeded", `${frame.path}.${key}`);
      }
      const descriptor = descriptors[key];
      if (!descriptor || !("value" in descriptor) || descriptor.get || descriptor.set) {
        return failure("accessor_rejected", `${frame.path}.${key}`);
      }
      const member = descriptor.value;
      if (typeof member === "string") {
        stringBytes += Buffer.byteLength(member, "utf8");
        if (stringBytes > snapshotBudget.maximum_string_bytes) {
          return failure("snapshot_budget_exceeded", `${frame.path}.${key}`);
        }
        (frame.target as Record<string, PlainValue>)[key] = member;
      } else if (
        member === null ||
        typeof member === "boolean" ||
        (typeof member === "number" && Number.isFinite(member))
      ) {
        (frame.target as Record<string, PlainValue>)[key] = member;
      } else if (member && typeof member === "object") {
        if (nodeTypes.isProxy(member)) {
          return failure("proxy_rejected", `${frame.path}.${key}`);
        }
        const prototype = Object.getPrototypeOf(member);
        if (prototype !== Object.prototype && prototype !== null) {
          return failure("non_plain_data_rejected", `${frame.path}.${key}`);
        }
        const child: Record<string, PlainValue> = {};
        (frame.target as Record<string, PlainValue>)[key] = child;
        stack.push({
          source: member,
          target: child,
          path: `${frame.path}.${key}`,
          depth: frame.depth + 1,
        });
      } else {
        return failure("non_plain_data_rejected", `${frame.path}.${key}`);
      }
    }
  }
  return { ok: true, value: freezePlain(root), descriptor_reads: descriptorReads };
}

function record(value: PlainValue): Readonly<Record<string, PlainValue>> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Readonly<Record<string, PlainValue>>)
    : null;
}

function exactKeys(value: Readonly<Record<string, PlainValue>>, expected: string[]) {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  return actual.length === canonical.length && actual.every((key, index) => key === canonical[index]);
}

const safety = freezePlain({
  diagnostic_only: true as const,
  synthetic_only: true as const,
  real_broker_submission: false as const,
  avanza_live_access: false as const,
  credential_access: false as const,
  browser_or_cdp_access: false as const,
  automatic_execution: false as const,
  trade_mutation: false as const,
  production_write: false as const,
});

function effects(input: Partial<Action653sInstructionResult["effects"]> = {}) {
  return freezePlain({
    request_descriptor_reads: input.request_descriptor_reads ?? 0,
    private_composition_transactions: input.private_composition_transactions ?? 0,
    private_confirmation_consumptions: input.private_confirmation_consumptions ?? 0,
    total_confirmation_consumptions: input.total_confirmation_consumptions ?? 0,
    caller_handles_received: 0 as const,
    caller_authority_selections: 0 as const,
    broker_requests: 0 as const,
    provider_calls: 0 as const,
    credential_reads: 0 as const,
    browser_or_cdp_operations: 0 as const,
    database_reads: 0 as const,
    database_writes: 0 as const,
    process_spawns: 0 as const,
    trade_mutations: 0 as const,
  });
}

function terminal(
  value: Omit<Action653sInstructionResult, "contract_version" | "safety" | "terminal_digest">,
): Action653sInstructionResult {
  const unsigned = freezePlain({ contract_version: contractVersion, ...value, safety });
  return freezePlain({
    ...unsigned,
    terminal_digest: digest("action_653s_instruction_terminal", unsigned),
  }) as Action653sInstructionResult;
}

const disabledResult = freezePlain({
  contract_version: contractVersion,
  gate_status: "disabled" as const,
  instruction_status: "blocked" as const,
  terminal_reason: "instruction_disabled" as const,
  observed_input_digest: null,
  failure_digest: null,
  receipt: null,
  instruction: null,
  synthetic_replay: null,
  diagnostic_audit_handoff: null,
  safety,
  effects: effects(),
  idempotent_replay: false,
  terminal_digest: null,
}) as Action653sInstructionResult;

const killedResult = freezePlain({
  ...disabledResult,
  gate_status: "kill_switch_active" as const,
  terminal_reason: "kill_switch_active" as const,
}) as Action653sInstructionResult;

function failed(
  reason: Action653sInstructionResult["terminal_reason"],
  status: Action653sInstructionResult["instruction_status"],
  observedInputDigest: string | null,
  descriptorReads: number,
): Action653sInstructionResult {
  return terminal({
    gate_status: "enabled",
    instruction_status: status,
    terminal_reason: reason,
    observed_input_digest: observedInputDigest,
    failure_digest: digest("action_653s_instruction_failure", {
      reason,
      observed_input_digest: observedInputDigest,
    }),
    receipt: null,
    instruction: null,
    synthetic_replay: null,
    diagnostic_audit_handoff: null,
    effects: effects({ request_descriptor_reads: descriptorReads }),
    idempotent_replay: false,
  });
}

function validateRequest(value: PlainValue, descriptorReads: number): ValidatedRequest | null {
  const input = record(value);
  if (!input || !exactKeys(input, ["request_version", "operation", "idempotency_key", "observed_at"])) {
    return null;
  }
  if (
    input.request_version !== requestVersion ||
    input.operation !== operationIdentity ||
    typeof input.idempotency_key !== "string" ||
    !/^action_653s_[a-z0-9_]{1,64}$/.test(input.idempotency_key) ||
    typeof input.observed_at !== "string"
  ) {
    return null;
  }
  const observed = canonicalizeAction650uNanosecondInstant(input.observed_at);
  if (!observed) return null;
  const canonical = freezePlain({
    request_version: requestVersion,
    operation: operationIdentity,
    idempotency_key: input.idempotency_key,
    observed_at: observed.canonical_instant,
  });
  return freezePlain({
    idempotency_key: input.idempotency_key,
    observed_at: observed.canonical_instant,
    request_digest: digest("action_653s_plain_request", canonical),
    descriptor_reads: descriptorReads,
  });
}

function composePrivateAuthority(): PrivateComposition | null {
  const runtime = createAction650sRuntimeIdentityContext({
    execution_identity: executionIdentity,
    runtime_instance_identity: "action-653s-private-runtime",
    runtime_session_identity: "action-653s-private-runtime-session",
    created_at: "2026-07-29T09:55:00.000000000Z",
  });
  if (!runtime) return null;
  const prepared = prepareAction650sExecution({
    runtime,
    observed_at: "2026-07-29T10:00:00.000000000Z",
    candidates: [{
      candidate_identity: "action-653s-private-candidate",
      trigger: "stop_loss_reached",
      ticker: "AAPL",
      side: "SELL",
      quantity: 5,
      order_type: "STOP_LIMIT",
      limit_price: 179,
      stop_price: 180,
      created_at: "2026-07-29T09:50:00.000000000Z",
      expires_at: null,
    }],
  });
  if (prepared.current_state !== "waiting_for_manual_confirmation") return null;

  const riskAdmission = runAction652cExecutionIntentAdmission(
    { enabled: true, kill_switch_active: false },
    {
      prepared,
      intent: {
        execution_identity: executionIdentity,
        preparation_trace_identity: prepared.trace_identity,
        handoff_identity: prepared.handoff.identity.handoff_identity,
        instrument: "AAPL",
        side: "SELL",
        quantity: { value: "5", scale: 0, unit: "units" },
        limit_price: { value: "179000000", scale: 6, unit: "SEK_micros_per_unit" },
        notional: { value: "895000000", scale: 6, unit: "SEK_micros" },
        session_identity: sessionIdentity,
        intent_created_at: "2026-07-29T09:59:59.000000000Z",
        intent_expires_at: "2026-07-29T10:00:01.000000000Z",
      },
      admission_at: "2026-07-29T10:00:00.000000000Z",
    },
  );
  if (!canAction652cProceedToManualConfirmation(riskAdmission)) return null;

  const boundary = createAction650uManualConfirmationBoundary({
    runtime,
    session_identity: sessionIdentity,
    session_started_at: "2026-07-29T09:59:00.000000000Z",
    session_expires_at: sessionExpiresAt,
  });
  if (!boundary) return null;
  const issued = boundary.confirm(prepared, {
    confirmed_at: confirmedAt,
    confirming_actor_class: "human_operator",
    session_identity: sessionIdentity,
  });
  if (!issued.ok) return null;
  return { prepared, risk_admission: riskAdmission, boundary, capability: issued.capability };
}

function executePrivateAtomicTransaction(
  validated: ValidatedRequest,
): Action653sInstructionResult {
  const existing = storedResults.get(validated.idempotency_key);
  if (existing) {
    if (existing.request_digest !== validated.request_digest) {
      return terminal({
        gate_status: "enabled",
        instruction_status: "conflicting",
        terminal_reason: "conflicting_instruction_reuse",
        observed_input_digest: validated.request_digest,
        failure_digest: digest("action_653s_instruction_failure", {
          reason: "conflicting_instruction_reuse",
          observed_input_digest: validated.request_digest,
          existing_request_digest: existing.request_digest,
        }),
        receipt: null,
        instruction: null,
        synthetic_replay: null,
        diagnostic_audit_handoff: null,
        effects: effects({
          request_descriptor_reads: validated.descriptor_reads,
          total_confirmation_consumptions: 1,
        }),
        idempotent_replay: false,
      });
    }
    const prior = existing.result;
    return terminal({
      gate_status: "enabled",
      instruction_status: "prepared",
      terminal_reason: "exact_duplicate_idempotent",
      observed_input_digest: validated.request_digest,
      failure_digest: null,
      receipt: prior.receipt,
      instruction: prior.instruction,
      synthetic_replay: prior.synthetic_replay,
      diagnostic_audit_handoff: prior.diagnostic_audit_handoff,
      effects: effects({
        request_descriptor_reads: validated.descriptor_reads,
        total_confirmation_consumptions: 1,
      }),
      idempotent_replay: true,
    });
  }

  const composition = composePrivateAuthority();
  if (!composition) {
    return failed(
      "private_composition_failed",
      "blocked",
      validated.request_digest,
      validated.descriptor_reads,
    );
  }
  if (
    !hasAction650sPreparedExecutionProvenance(composition.prepared) ||
    !canAction652cProceedToManualConfirmation(composition.risk_admission) ||
    getAction650uManualConfirmationConsumptionState(composition.capability) !== "unconsumed" ||
    !verifyAction650uManualConfirmationCapability(composition.capability)
  ) {
    return failed(
      "authority_provenance_unproven",
      "blocked",
      validated.request_digest,
      validated.descriptor_reads,
    );
  }

  const consumed = consumeAction650uManualConfirmation({
    boundary: composition.boundary,
    prepared: composition.prepared,
    capability: composition.capability,
    consumed_at: validated.observed_at,
  });
  if (!consumed.ok) {
    return failed(
      "confirmation_rejected",
      consumed.reason === "capability_expired" ? "expired" : "blocked",
      validated.request_digest,
      validated.descriptor_reads,
    );
  }

  // No fallible authority, validation, lookup, or consumption work occurs below.
  const riskIdentity = composition.risk_admission.manual_confirmation_admission;
  const unsignedReceipt = {
    receipt_version: receiptVersion,
    transaction_version: transactionVersion,
    request_digest: validated.request_digest,
    execution_identity: executionIdentity,
    session_identity: sessionIdentity,
    preparation_trace_identity: composition.prepared.trace_identity,
    handoff_digest: composition.prepared.handoff.identity.handoff_digest,
    risk_admission_digest: riskIdentity && riskIdentity.admission_digest,
    confirmation_request_digest: composition.capability.confirmation_request_digest,
    confirmation_capability_digest: composition.capability.capability_digest,
    predecessor_consumption_receipt_digest: consumed.receipt.receipt_digest,
    consumed_at: validated.observed_at,
    consumption_count: 1 as const,
  };
  const receipt = freezePlain({
    ...unsignedReceipt,
    receipt_digest: digest("action_653s_plain_consumption_receipt", unsignedReceipt),
  }) as Action653sPlainConsumptionReceipt;
  const instructionUnsigned = {
    schema_version: instructionSchemaVersion,
    destination_identity: syntheticDestinationIdentity,
    execution_identity: executionIdentity,
    lifecycle_identity: composition.prepared.runtime_identity_context.lifecycle_identity,
    preparation_trace_identity: composition.prepared.trace_identity,
    handoff_identity: composition.prepared.handoff.identity.handoff_identity,
    handoff_digest: composition.prepared.handoff.identity.handoff_digest,
    risk_admission_identity: riskIdentity && riskIdentity.admission_identity,
    risk_admission_digest: riskIdentity && riskIdentity.admission_digest,
    confirmation_request_digest: composition.capability.confirmation_request_digest,
    confirmation_capability_digest: composition.capability.capability_digest,
    confirmation_consumption_digest: consumed.receipt.receipt_digest,
    session_identity: sessionIdentity,
    instrument: "AAPL" as const,
    side: "SELL" as const,
    order_type: "STOP_LIMIT" as const,
    quantity: { value: "5" as const, scale: 0 as const, unit: "units" as const },
    limit_price: {
      value: "179000000" as const,
      scale: 6 as const,
      unit: "SEK_micros_per_unit" as const,
      currency: "SEK" as const,
    },
    notional: {
      value: "895000000" as const,
      scale: 6 as const,
      unit: "SEK_micros" as const,
      currency: "SEK" as const,
    },
    idempotency_identity: validated.idempotency_key,
    instruction_created_at: validated.observed_at,
    instruction_expires_at: sessionExpiresAt,
  };
  const instruction = freezePlain({
    ...instructionUnsigned,
    instruction_digest: digest("action_653s_broker_neutral_instruction", instructionUnsigned),
  }) as Action653sBrokerNeutralInstruction;
  const replayUnsigned = {
    evidence_version: "action_653s_synthetic_replay_evidence_v1" as const,
    destination_identity: syntheticDestinationIdentity,
    execution_identity: executionIdentity,
    instruction_digest: instruction.instruction_digest,
    receipt_digest: receipt.receipt_digest,
    observed_at: validated.observed_at,
    accepted: true as const,
    synthetic_only: true as const,
  };
  const syntheticReplay = freezePlain({
    ...replayUnsigned,
    evidence_digest: digest("action_653s_synthetic_replay_evidence", replayUnsigned),
  }) as Action653sSyntheticReplayEvidence;
  const auditUnsigned = {
    handoff_version: "action_653s_to_action_651c_diagnostic_audit_v1" as const,
    execution_identity: executionIdentity,
    instruction_digest: instruction.instruction_digest,
    receipt_digest: receipt.receipt_digest,
    synthetic_replay_evidence_digest: syntheticReplay.evidence_digest,
    diagnostic_only: true as const,
    real_broker_evidence: false as const,
    performance_eligible: false as const,
    automatic_execution_allowed: false as const,
  };
  const diagnosticAuditHandoff = freezePlain({
    ...auditUnsigned,
    handoff_digest: digest("action_653s_diagnostic_audit_handoff", auditUnsigned),
  }) as Action653sDiagnosticAuditHandoff;
  const result = terminal({
    gate_status: "enabled",
    instruction_status: "prepared",
    terminal_reason: "instruction_prepared",
    observed_input_digest: validated.request_digest,
    failure_digest: null,
    receipt,
    instruction,
    synthetic_replay: syntheticReplay,
    diagnostic_audit_handoff: diagnosticAuditHandoff,
    effects: effects({
      request_descriptor_reads: validated.descriptor_reads,
      private_composition_transactions: 1,
      private_confirmation_consumptions: 1,
      total_confirmation_consumptions: 1,
    }),
    idempotent_replay: false,
  });
  storedResults.set(validated.idempotency_key, {
    request_digest: validated.request_digest,
    result,
  });
  return result;
}

/**
 * The sole V5 runtime export. The caller supplies only a closed plain-data
 * request; all authority acquisition, handle lookup, validation, and one-shot
 * consumption remain inside this module-owned composition boundary.
 */
export function runAction653sNonExportableAuthorityInstruction(
  gate: Action653sGate,
  request: unknown,
): Action653sInstructionResult {
  if (gate.enabled !== true) return disabledResult;
  if (gate.kill_switch_active === true) return killedResult;

  const snapshot = snapshotPlain(request);
  if (!snapshot.ok) {
    return failed(
      "input_snapshot_rejected",
      "unmappable",
      snapshot.witness_digest,
      snapshot.descriptor_reads,
    );
  }
  const validated = validateRequest(snapshot.value, snapshot.descriptor_reads);
  if (!validated) {
    return failed(
      "plain_request_invalid",
      "conflicting",
      digest("action_653s_observed_input", snapshot.value),
      snapshot.descriptor_reads,
    );
  }
  const observed = canonicalizeAction650uNanosecondInstant(validated.observed_at)!;
  const confirmed = canonicalizeAction650uNanosecondInstant(confirmedAt)!;
  const expires = canonicalizeAction650uNanosecondInstant(sessionExpiresAt)!;
  if (compareAction650uInstants(observed, confirmed) < 0) {
    return failed(
      "plain_request_invalid",
      "conflicting",
      validated.request_digest,
      validated.descriptor_reads,
    );
  }
  if (compareAction650uInstants(observed, expires) >= 0) {
    return failed(
      "instruction_expired",
      "expired",
      validated.request_digest,
      validated.descriptor_reads,
    );
  }
  return executePrivateAtomicTransaction(validated);
}
