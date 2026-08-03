import { types as nodeTypes } from "node:util";

import { hashAction650sCanonicalValue } from "@/lib/action-650s-execution-identity";
import {
  canonicalizeAction650uNanosecondInstant,
  compareAction650uInstants,
} from "@/lib/action-650u-temporal-confirmation-policy";
import {
  runAction653sNonExportableAuthorityInstruction,
  type Action653sInstructionResult,
} from "@/lib/action-653s-non-exportable-authority-transaction";

const contractVersion =
  "action_654a_transport_inert_dispatch_readiness_v1" as const;
const envelopeVersion = "action_654a_dispatch_readiness_envelope_v1" as const;
const v5ContractVersion =
  "action_653s_non_exportable_authority_transaction_v5" as const;
const v5RequestVersion = "action_653s_plain_instruction_request_v1" as const;
const v5Operation = "action_653s_prepare_synthetic_instruction" as const;

const snapshotBudget = Object.freeze({
  maximum_depth: 32,
  maximum_nodes: 1_024,
  maximum_properties: 8_192,
  maximum_string_bytes: 262_144,
});

type PlainValue =
  | null
  | boolean
  | number
  | string
  | readonly PlainValue[]
  | { readonly [key: string]: PlainValue };

type PlainRecord = Readonly<Record<string, PlainValue>>;

type SnapshotResult =
  | Readonly<{ ok: true; value: PlainRecord; descriptor_reads: number }>
  | Readonly<{
      ok: false;
      reason:
        | "accessor_rejected"
        | "proxy_rejected"
        | "cycle_rejected"
        | "snapshot_budget_exceeded"
        | "descriptor_inspection_failed"
        | "non_plain_data_rejected";
      descriptor_reads: number;
    }>;

export type Action654aGate = Readonly<{
  enabled: boolean;
  kill_switch_active: boolean;
}>;

export type Action654aReadinessInput = Readonly<{
  v5_instruction_result: Action653sInstructionResult;
  evaluated_at: string;
}>;

export type Action654aDispatchReadinessEnvelope = Readonly<{
  envelope_version: typeof envelopeVersion;
  v5_contract_version: typeof v5ContractVersion;
  execution_identity: string;
  instruction_identity: string;
  risk_admission_identity: string;
  risk_admission_digest: string;
  manual_confirmation_identity: string;
  manual_confirmation_consumption_identity: string;
  diagnostic_audit_identity: string;
  idempotency_identity: string;
  session_identity: string;
  instruction_expires_at: string;
  session_expiry_identity: string;
  synthetic_replay_identity: string;
  evaluated_at: string;
  readiness_identity: string;
  transport_attached: false;
  dispatch_permitted: false;
  broker_submission_allowed: false;
  readiness_digest: string;
}>;

export type Action654aDispatchReadinessResult = Readonly<{
  contract_version: typeof contractVersion;
  gate_status: "disabled" | "kill_switch_active" | "enabled";
  readiness_status:
    | "ready"
    | "not_eligible"
    | "expired"
    | "conflicting"
    | "unmappable";
  terminal_reason:
    | "readiness_disabled"
    | "kill_switch_active"
    | "input_snapshot_rejected"
    | "v5_instruction_not_eligible"
    | "readiness_input_invalid"
    | "instruction_expired"
    | "v5_authority_unverified"
    | "lineage_conflicting"
    | "readiness_ready"
    | "exact_duplicate_idempotent"
    | "conflicting_readiness_reuse";
  envelope: Action654aDispatchReadinessEnvelope | null;
  observed_input_digest: string | null;
  failure_digest: string | null;
  idempotent_replay: boolean;
  effects: Readonly<{
    input_descriptor_reads: number;
    downstream_digest_operations: number;
    v5_authority_readbacks: 0 | 1;
    envelope_constructions: 0 | 1;
    getter_executions: 0;
    proxy_hooks_executed: 0;
    callback_executions: 0;
    iterator_executions: 0;
    caller_handles_received: 0;
    transport_adapters: 0;
    transport_requests: 0;
    broker_submissions: 0;
    provider_calls: 0;
    credential_reads: 0;
    browser_or_cdp_operations: 0;
    database_reads: 0;
    database_writes: 0;
    process_spawns: 0;
    trade_mutations: 0;
  }>;
  safety: Readonly<{
    diagnostic_only: true;
    synthetic_only: true;
    transport_attached: false;
    dispatch_permitted: false;
    broker_submission_allowed: false;
    real_broker_submission: false;
    avanza_live_access: false;
    credential_access: false;
    browser_or_cdp_access: false;
    automatic_execution: false;
    trade_mutation: false;
    production_write: false;
  }>;
  terminal_digest: string | null;
}>;

type DigestCounter = { count: number };

type VerifiedV5 = Readonly<{
  input_digest: string;
  evaluated_at: string;
  execution_identity: string;
  instruction_identity: string;
  risk_admission_identity: string;
  risk_admission_digest: string;
  confirmation_request_digest: string;
  confirmation_capability_digest: string;
  confirmation_consumption_digest: string;
  diagnostic_audit_identity: string;
  idempotency_identity: string;
  session_identity: string;
  instruction_expires_at: string;
  synthetic_replay_identity: string;
}>;

type StoredEnvelope = Readonly<{
  input_digest: string;
  result: Action654aDispatchReadinessResult;
}>;

const storedEnvelopes = new Map<string, StoredEnvelope>();

function deepFreezePlain<T>(value: T): Readonly<T> {
  if (!value || typeof value !== "object") return value as Readonly<T>;
  const stack: object[] = [value as object];
  const seen = new WeakSet<object>();
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (seen.has(current)) continue;
    seen.add(current);
    const descriptors = Object.getOwnPropertyDescriptors(current);
    for (const descriptor of Object.values(descriptors)) {
      if ("value" in descriptor && descriptor.value && typeof descriptor.value === "object") {
        stack.push(descriptor.value as object);
      }
    }
    Object.freeze(current);
  }
  return value as Readonly<T>;
}

function snapshotPlainRecord(value: unknown): SnapshotResult {
  let descriptorReads = 0;
  let nodes = 0;
  let properties = 0;
  let stringBytes = 0;
  const failed = (reason: Extract<SnapshotResult, { ok: false }>["reason"]): SnapshotResult => ({
    ok: false,
    reason,
    descriptor_reads: descriptorReads,
  });

  if (nodeTypes.isProxy(value)) return failed("proxy_rejected");
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return failed("non_plain_data_rejected");
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return failed("non_plain_data_rejected");
  }

  const root: Record<string, PlainValue> = {};
  const seen = new WeakSet<object>();
  const stack: Array<{
    source: object;
    target: Record<string, PlainValue> | PlainValue[];
    depth: number;
  }> = [{ source: value, target: root, depth: 0 }];

  while (stack.length > 0) {
    const frame = stack.pop()!;
    if (seen.has(frame.source)) return failed("cycle_rejected");
    seen.add(frame.source);
    nodes += 1;
    if (nodes > snapshotBudget.maximum_nodes || frame.depth > snapshotBudget.maximum_depth) {
      return failed("snapshot_budget_exceeded");
    }
    if (nodeTypes.isProxy(frame.source)) return failed("proxy_rejected");

    let keys: PropertyKey[];
    let descriptors: PropertyDescriptorMap;
    try {
      keys = Reflect.ownKeys(frame.source);
      descriptors = Object.getOwnPropertyDescriptors(frame.source);
      descriptorReads += 1;
    } catch {
      return failed("descriptor_inspection_failed");
    }
    if (keys.some((key) => typeof key === "symbol")) {
      return failed("non_plain_data_rejected");
    }

    for (const key of keys as string[]) {
      properties += 1;
      if (properties > snapshotBudget.maximum_properties) {
        return failed("snapshot_budget_exceeded");
      }
      const descriptor = descriptors[key];
      if (!descriptor || !("value" in descriptor) || descriptor.get || descriptor.set) {
        return failed("accessor_rejected");
      }
      const member = descriptor.value;
      if (typeof member === "string") {
        stringBytes += Buffer.byteLength(member, "utf8");
        if (stringBytes > snapshotBudget.maximum_string_bytes) {
          return failed("snapshot_budget_exceeded");
        }
        (frame.target as Record<string, PlainValue>)[key] = member;
      } else if (
        member === null ||
        typeof member === "boolean" ||
        (typeof member === "number" && Number.isFinite(member))
      ) {
        (frame.target as Record<string, PlainValue>)[key] = member;
      } else if (member && typeof member === "object") {
        if (nodeTypes.isProxy(member)) return failed("proxy_rejected");
        const memberIsArray = Array.isArray(member);
        const memberPrototype = Object.getPrototypeOf(member);
        if (
          (!memberIsArray && memberPrototype !== Object.prototype && memberPrototype !== null) ||
          (memberIsArray && memberPrototype !== Array.prototype)
        ) {
          return failed("non_plain_data_rejected");
        }
        const child: Record<string, PlainValue> | PlainValue[] = memberIsArray ? [] : {};
        (frame.target as Record<string, PlainValue>)[key] = child;
        stack.push({ source: member, target: child, depth: frame.depth + 1 });
      } else {
        return failed("non_plain_data_rejected");
      }
    }
  }

  return { ok: true, value: deepFreezePlain(root), descriptor_reads: descriptorReads };
}

function record(value: PlainValue | undefined): PlainRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as PlainRecord)
    : null;
}

function exactKeys(value: PlainRecord, expected: readonly string[]) {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  return actual.length === canonical.length && actual.every((key, index) => key === canonical[index]);
}

function countedDigest(prefix: string, value: unknown, counter: DigestCounter) {
  counter.count += 1;
  return `${prefix}_${hashAction650sCanonicalValue(value)}`;
}

const safety = deepFreezePlain({
  diagnostic_only: true as const,
  synthetic_only: true as const,
  transport_attached: false as const,
  dispatch_permitted: false as const,
  broker_submission_allowed: false as const,
  real_broker_submission: false as const,
  avanza_live_access: false as const,
  credential_access: false as const,
  browser_or_cdp_access: false as const,
  automatic_execution: false as const,
  trade_mutation: false as const,
  production_write: false as const,
});

function effects(
  input: Partial<Action654aDispatchReadinessResult["effects"]> = {},
): Action654aDispatchReadinessResult["effects"] {
  return deepFreezePlain({
    input_descriptor_reads: input.input_descriptor_reads ?? 0,
    downstream_digest_operations: input.downstream_digest_operations ?? 0,
    v5_authority_readbacks: input.v5_authority_readbacks ?? 0,
    envelope_constructions: input.envelope_constructions ?? 0,
    getter_executions: 0 as const,
    proxy_hooks_executed: 0 as const,
    callback_executions: 0 as const,
    iterator_executions: 0 as const,
    caller_handles_received: 0 as const,
    transport_adapters: 0 as const,
    transport_requests: 0 as const,
    broker_submissions: 0 as const,
    provider_calls: 0 as const,
    credential_reads: 0 as const,
    browser_or_cdp_operations: 0 as const,
    database_reads: 0 as const,
    database_writes: 0 as const,
    process_spawns: 0 as const,
    trade_mutations: 0 as const,
  });
}

function inertResult(
  gateStatus: Action654aDispatchReadinessResult["gate_status"],
  status: Action654aDispatchReadinessResult["readiness_status"],
  reason: Action654aDispatchReadinessResult["terminal_reason"],
  descriptorReads = 0,
): Action654aDispatchReadinessResult {
  return deepFreezePlain({
    contract_version: contractVersion,
    gate_status: gateStatus,
    readiness_status: status,
    terminal_reason: reason,
    envelope: null,
    observed_input_digest: null,
    failure_digest: null,
    idempotent_replay: false,
    effects: effects({ input_descriptor_reads: descriptorReads }),
    safety,
    terminal_digest: null,
  }) as Action654aDispatchReadinessResult;
}

const disabledResult = inertResult("disabled", "not_eligible", "readiness_disabled");
const killedResult = inertResult("kill_switch_active", "not_eligible", "kill_switch_active");

function signedResult(
  value: Omit<
    Action654aDispatchReadinessResult,
    "contract_version" | "safety" | "terminal_digest"
  >,
  counter: DigestCounter,
): Action654aDispatchReadinessResult {
  const unsigned = deepFreezePlain({ contract_version: contractVersion, ...value, safety });
  return deepFreezePlain({
    ...unsigned,
    terminal_digest: countedDigest("action_654a_readiness_terminal", unsigned, counter),
  }) as Action654aDispatchReadinessResult;
}

function failedAfterEligibility(
  status: Action654aDispatchReadinessResult["readiness_status"],
  reason: Action654aDispatchReadinessResult["terminal_reason"],
  observedInputDigest: string,
  descriptorReads: number,
  authorityReadbacks: 0 | 1,
  counter: DigestCounter,
): Action654aDispatchReadinessResult {
  const failureDigest = countedDigest("action_654a_readiness_failure", {
    reason,
    observed_input_digest: observedInputDigest,
  }, counter);
  return signedResult({
    gate_status: "enabled",
    readiness_status: status,
    terminal_reason: reason,
    envelope: null,
    observed_input_digest: observedInputDigest,
    failure_digest: failureDigest,
    idempotent_replay: false,
    effects: effects({
      input_descriptor_reads: descriptorReads,
      downstream_digest_operations: counter.count + 1,
      v5_authority_readbacks: authorityReadbacks,
    }),
  }, counter);
}

function rebuildAndVerifyV5(
  v5: PlainRecord,
  evaluatedAt: string,
  counter: DigestCounter,
): VerifiedV5 | null {
  const receipt = record(v5.receipt);
  const instruction = record(v5.instruction);
  const replay = record(v5.synthetic_replay);
  const audit = record(v5.diagnostic_audit_handoff);
  const v5Safety = record(v5.safety);
  if (!receipt || !instruction || !replay || !audit || !v5Safety) return null;

  const idempotencyIdentity = instruction.idempotency_identity;
  const instructionCreatedAt = instruction.instruction_created_at;
  if (typeof idempotencyIdentity !== "string" || typeof instructionCreatedAt !== "string") return null;

  const readback = runAction653sNonExportableAuthorityInstruction(
    { enabled: true, kill_switch_active: false },
    {
      request_version: v5RequestVersion,
      operation: v5Operation,
      idempotency_key: idempotencyIdentity,
      observed_at: instructionCreatedAt,
    },
  );
  if (
    readback.instruction_status !== "prepared" ||
    !readback.receipt ||
    !readback.instruction ||
    !readback.synthetic_replay ||
    !readback.diagnostic_audit_handoff
  ) {
    return null;
  }

  const criticalPairs: ReadonlyArray<readonly [unknown, unknown]> = [
    [receipt, readback.receipt],
    [instruction, readback.instruction],
    [replay, readback.synthetic_replay],
    [audit, readback.diagnostic_audit_handoff],
    [v5Safety, readback.safety],
  ];
  for (const [observed, authoritative] of criticalPairs) {
    if (
      countedDigest("action_654a_comparison", observed, counter) !==
      countedDigest("action_654a_comparison", authoritative, counter)
    ) {
      return null;
    }
  }

  const requestUnsigned = {
    request_version: v5RequestVersion,
    operation: v5Operation,
    idempotency_key: idempotencyIdentity,
    observed_at: instructionCreatedAt,
  };
  const requestDigest = countedDigest("action_653s_plain_request", requestUnsigned, counter);
  if (receipt.request_digest !== requestDigest || v5.observed_input_digest !== requestDigest) return null;

  const { receipt_digest: receiptDigest, ...receiptUnsigned } = receipt;
  const { instruction_digest: instructionDigest, ...instructionUnsigned } = instruction;
  const { evidence_digest: evidenceDigest, ...replayUnsigned } = replay;
  const { handoff_digest: auditDigest, ...auditUnsigned } = audit;
  const { terminal_digest: terminalDigest, ...terminalUnsigned } = v5;
  if (
    typeof receiptDigest !== "string" ||
    receiptDigest !== countedDigest("action_653s_plain_consumption_receipt", receiptUnsigned, counter) ||
    typeof instructionDigest !== "string" ||
    instructionDigest !== countedDigest("action_653s_broker_neutral_instruction", instructionUnsigned, counter) ||
    typeof evidenceDigest !== "string" ||
    evidenceDigest !== countedDigest("action_653s_synthetic_replay_evidence", replayUnsigned, counter) ||
    typeof auditDigest !== "string" ||
    auditDigest !== countedDigest("action_653s_diagnostic_audit_handoff", auditUnsigned, counter) ||
    typeof terminalDigest !== "string" ||
    terminalDigest !== countedDigest("action_653s_instruction_terminal", terminalUnsigned, counter)
  ) {
    return null;
  }

  if (
    v5Safety.real_broker_submission !== false ||
    v5Safety.avanza_live_access !== false ||
    v5Safety.credential_access !== false ||
    v5Safety.browser_or_cdp_access !== false ||
    v5Safety.automatic_execution !== false ||
    v5Safety.trade_mutation !== false ||
    v5Safety.production_write !== false ||
    receipt.execution_identity !== instruction.execution_identity ||
    receipt.session_identity !== instruction.session_identity ||
    receipt.risk_admission_digest !== instruction.risk_admission_digest ||
    receipt.confirmation_request_digest !== instruction.confirmation_request_digest ||
    receipt.confirmation_capability_digest !== instruction.confirmation_capability_digest ||
    receipt.predecessor_consumption_receipt_digest !== instruction.confirmation_consumption_digest ||
    replay.execution_identity !== instruction.execution_identity ||
    replay.instruction_digest !== instructionDigest ||
    replay.receipt_digest !== receiptDigest ||
    replay.accepted !== true ||
    replay.synthetic_only !== true ||
    audit.execution_identity !== instruction.execution_identity ||
    audit.instruction_digest !== instructionDigest ||
    audit.receipt_digest !== receiptDigest ||
    audit.synthetic_replay_evidence_digest !== evidenceDigest ||
    audit.diagnostic_only !== true ||
    audit.real_broker_evidence !== false ||
    audit.performance_eligible !== false ||
    audit.automatic_execution_allowed !== false
  ) {
    return null;
  }

  const executionIdentity = instruction.execution_identity;
  const riskAdmissionIdentity = instruction.risk_admission_identity;
  const riskAdmissionDigest = instruction.risk_admission_digest;
  const confirmationRequestDigest = instruction.confirmation_request_digest;
  const confirmationCapabilityDigest = instruction.confirmation_capability_digest;
  const confirmationConsumptionDigest = instruction.confirmation_consumption_digest;
  const sessionIdentity = instruction.session_identity;
  const instructionExpiresAt = instruction.instruction_expires_at;
  if (
    typeof executionIdentity !== "string" ||
    typeof riskAdmissionIdentity !== "string" ||
    typeof riskAdmissionDigest !== "string" ||
    typeof confirmationRequestDigest !== "string" ||
    typeof confirmationCapabilityDigest !== "string" ||
    typeof confirmationConsumptionDigest !== "string" ||
    typeof sessionIdentity !== "string" ||
    typeof instructionExpiresAt !== "string"
  ) {
    return null;
  }

  return deepFreezePlain({
    input_digest: countedDigest("action_654a_verified_v5_input", v5, counter),
    evaluated_at: evaluatedAt,
    execution_identity: executionIdentity,
    instruction_identity: instructionDigest,
    risk_admission_identity: riskAdmissionIdentity,
    risk_admission_digest: riskAdmissionDigest,
    confirmation_request_digest: confirmationRequestDigest,
    confirmation_capability_digest: confirmationCapabilityDigest,
    confirmation_consumption_digest: confirmationConsumptionDigest,
    diagnostic_audit_identity: auditDigest,
    idempotency_identity: idempotencyIdentity,
    session_identity: sessionIdentity,
    instruction_expires_at: instructionExpiresAt,
    synthetic_replay_identity: evidenceDigest,
  });
}

function eligibilityInput(snapshot: PlainRecord): Readonly<{
  v5: PlainRecord;
  evaluated_at: string;
}> | null {
  if (!exactKeys(snapshot, ["v5_instruction_result", "evaluated_at"])) return null;
  const v5 = record(snapshot.v5_instruction_result);
  if (!v5 || typeof snapshot.evaluated_at !== "string") return null;
  if (
    v5.contract_version !== v5ContractVersion ||
    v5.gate_status !== "enabled" ||
    v5.instruction_status !== "prepared" ||
    (v5.terminal_reason !== "instruction_prepared" &&
      v5.terminal_reason !== "exact_duplicate_idempotent") ||
    v5.failure_digest !== null ||
    !record(v5.receipt) ||
    !record(v5.instruction) ||
    !record(v5.synthetic_replay) ||
    !record(v5.diagnostic_audit_handoff)
  ) {
    return null;
  }
  const evaluated = canonicalizeAction650uNanosecondInstant(snapshot.evaluated_at);
  if (!evaluated) return null;
  return deepFreezePlain({ v5, evaluated_at: evaluated.canonical_instant });
}

/**
 * Creates transport-inert readiness evidence from a fully verified Action 653
 * V5 result. This function has no transport, broker, persistence, provider,
 * browser, credential, network, or process surface.
 */
export function runAction654aTransportInertDispatchReadiness(
  gate: Action654aGate,
  input: unknown,
): Action654aDispatchReadinessResult {
  if (gate.enabled !== true) return disabledResult;
  if (gate.kill_switch_active === true) return killedResult;

  const snapshot = snapshotPlainRecord(input);
  if (!snapshot.ok) {
    return inertResult("enabled", "unmappable", "input_snapshot_rejected", snapshot.descriptor_reads);
  }
  const eligible = eligibilityInput(snapshot.value);
  if (!eligible) {
    return inertResult(
      "enabled",
      "not_eligible",
      "v5_instruction_not_eligible",
      snapshot.descriptor_reads,
    );
  }

  const instruction = record(eligible.v5.instruction)!;
  const created = typeof instruction.instruction_created_at === "string"
    ? canonicalizeAction650uNanosecondInstant(instruction.instruction_created_at)
    : null;
  const expires = typeof instruction.instruction_expires_at === "string"
    ? canonicalizeAction650uNanosecondInstant(instruction.instruction_expires_at)
    : null;
  const evaluated = canonicalizeAction650uNanosecondInstant(eligible.evaluated_at)!;
  if (!created || !expires) {
    return inertResult(
      "enabled",
      "not_eligible",
      "readiness_input_invalid",
      snapshot.descriptor_reads,
    );
  }
  if (compareAction650uInstants(evaluated, created) < 0) {
    return inertResult(
      "enabled",
      "not_eligible",
      "readiness_input_invalid",
      snapshot.descriptor_reads,
    );
  }
  if (compareAction650uInstants(evaluated, expires) >= 0) {
    return inertResult("enabled", "expired", "instruction_expired", snapshot.descriptor_reads);
  }

  const counter: DigestCounter = { count: 0 };
  const verified = rebuildAndVerifyV5(eligible.v5, eligible.evaluated_at, counter);
  const observedInputDigest = countedDigest("action_654a_readiness_input", snapshot.value, counter);
  if (!verified) {
    return failedAfterEligibility(
      "conflicting",
      "v5_authority_unverified",
      observedInputDigest,
      snapshot.descriptor_reads,
      1,
      counter,
    );
  }

  const existing = storedEnvelopes.get(verified.idempotency_identity);
  if (existing) {
    if (existing.input_digest !== observedInputDigest) {
      return failedAfterEligibility(
        "conflicting",
        "conflicting_readiness_reuse",
        observedInputDigest,
        snapshot.descriptor_reads,
        1,
        counter,
      );
    }
    const prior = existing.result;
    return signedResult({
      gate_status: "enabled",
      readiness_status: "ready",
      terminal_reason: "exact_duplicate_idempotent",
      envelope: prior.envelope,
      observed_input_digest: observedInputDigest,
      failure_digest: null,
      idempotent_replay: true,
      effects: effects({
        input_descriptor_reads: snapshot.descriptor_reads,
        downstream_digest_operations: counter.count + 1,
        v5_authority_readbacks: 1,
        envelope_constructions: 0,
      }),
    }, counter);
  }

  const sessionExpiryIdentity = countedDigest("action_654a_session_expiry_identity", {
    session_identity: verified.session_identity,
    instruction_expires_at: verified.instruction_expires_at,
  }, counter);
  const readinessIdentity = countedDigest("action_654a_readiness_identity", {
    execution_identity: verified.execution_identity,
    instruction_identity: verified.instruction_identity,
    risk_admission_identity: verified.risk_admission_identity,
    manual_confirmation_identity: verified.confirmation_capability_digest,
    diagnostic_audit_identity: verified.diagnostic_audit_identity,
    idempotency_identity: verified.idempotency_identity,
    session_expiry_identity: sessionExpiryIdentity,
    synthetic_replay_identity: verified.synthetic_replay_identity,
  }, counter);
  const envelopeUnsigned = deepFreezePlain({
    envelope_version: envelopeVersion,
    v5_contract_version: v5ContractVersion,
    execution_identity: verified.execution_identity,
    instruction_identity: verified.instruction_identity,
    risk_admission_identity: verified.risk_admission_identity,
    risk_admission_digest: verified.risk_admission_digest,
    manual_confirmation_identity: verified.confirmation_capability_digest,
    manual_confirmation_consumption_identity: verified.confirmation_consumption_digest,
    diagnostic_audit_identity: verified.diagnostic_audit_identity,
    idempotency_identity: verified.idempotency_identity,
    session_identity: verified.session_identity,
    instruction_expires_at: verified.instruction_expires_at,
    session_expiry_identity: sessionExpiryIdentity,
    synthetic_replay_identity: verified.synthetic_replay_identity,
    evaluated_at: verified.evaluated_at,
    readiness_identity: readinessIdentity,
    transport_attached: false as const,
    dispatch_permitted: false as const,
    broker_submission_allowed: false as const,
  });
  const envelope = deepFreezePlain({
    ...envelopeUnsigned,
    readiness_digest: countedDigest("action_654a_dispatch_readiness_envelope", envelopeUnsigned, counter),
  }) as Action654aDispatchReadinessEnvelope;
  const result = signedResult({
    gate_status: "enabled",
    readiness_status: "ready",
    terminal_reason: "readiness_ready",
    envelope,
    observed_input_digest: observedInputDigest,
    failure_digest: null,
    idempotent_replay: false,
    effects: effects({
      input_descriptor_reads: snapshot.descriptor_reads,
      downstream_digest_operations: counter.count + 1,
      v5_authority_readbacks: 1,
      envelope_constructions: 1,
    }),
  }, counter);
  storedEnvelopes.set(verified.idempotency_identity, {
    input_digest: observedInputDigest,
    result,
  });
  return result;
}
