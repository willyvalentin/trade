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
  "action_654h_private_non_reconstituting_readiness_v2" as const;
const requestVersion = "action_654h_private_readiness_request_v1" as const;
const operationIdentity = "action_654h_establish_v5_and_readiness" as const;
const envelopeVersion = "action_654h_private_readiness_envelope_v1" as const;
const v5ContractVersion =
  "action_653s_non_exportable_authority_transaction_v5" as const;
const v5RequestVersion = "action_653s_plain_instruction_request_v1" as const;
const v5Operation = "action_653s_prepare_synthetic_instruction" as const;
const confirmedAt = "2026-07-29T10:00:01.000000000Z" as const;
const sessionExpiresAt = "2026-07-29T10:10:00.000000000Z" as const;

const snapshotBudget = Object.freeze({
  maximum_depth: 8,
  maximum_nodes: 64,
  maximum_properties: 256,
  maximum_string_bytes: 16_384,
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

export type Action654hGate = Readonly<{
  enabled: boolean;
  kill_switch_active: boolean;
}>;

export type Action654hPrivateReadinessInput = Readonly<{
  request_version: typeof requestVersion;
  operation: typeof operationIdentity;
  idempotency_key: string;
  observed_at: string;
  evaluated_at: string;
}>;

export type Action654hReadinessEnvelope = Readonly<{
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
  synthetic_replay_identity: string;
  evaluated_at: string;
  readiness_identity: string;
  v5_result_binding_digest: string;
  transport_attached: false;
  dispatch_permitted: false;
  broker_submission_allowed: false;
  readiness_digest: string;
}>;

export type Action654hPrivateReadinessResult = Readonly<{
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
    | "plain_request_rejected"
    | "temporal_boundary_rejected"
    | "v5_establishment_rejected"
    | "private_capsule_rejected"
    | "readiness_ready"
    | "exact_duplicate_idempotent"
    | "conflicting_readiness_reuse";
  v5_instruction_result: Action653sInstructionResult | null;
  readiness_envelope: Action654hReadinessEnvelope | null;
  observed_input_digest: string | null;
  failure_digest: string | null;
  idempotent_replay: boolean;
  effects: Readonly<{
    input_descriptor_reads: number;
    digest_operations: number;
    v5_invocations: 0 | 1;
    v5_establishments: 0 | 1;
    v5_readbacks: 0;
    v5_reconstitutions: 0;
    capsule_mints: 0 | 1;
    capsule_reads: 0 | 1;
    readiness_classifications: 0 | 1;
    confirmation_consumptions: 0 | 1;
    getter_executions: 0;
    proxy_hooks_executed: 0;
    callback_executions: 0;
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

type ValidatedInput = Readonly<{
  idempotency_key: string;
  v5_idempotency_key: string;
  observed_at: string;
  evaluated_at: string;
  descriptor_reads: number;
}>;

type PrivateReadinessSnapshot = Readonly<{
  v5_result_binding_digest: string;
  execution_identity: string;
  instruction_identity: string;
  risk_admission_identity: string;
  risk_admission_digest: string;
  confirmation_request_digest: string;
  confirmation_consumption_digest: string;
  diagnostic_audit_identity: string;
  idempotency_identity: string;
  session_identity: string;
  instruction_expires_at: string;
  synthetic_replay_identity: string;
  evaluated_at: string;
}>;

type StoredComposition = Readonly<{
  input_digest: string;
  result: Action654hPrivateReadinessResult;
}>;

type DigestCounter = { count: number };

const storedCompositions = new Map<string, StoredComposition>();
const privateCapsuleProvenance = new WeakMap<object, PrivateReadinessSnapshot>();

function deepFreezePlain<T>(value: T): Readonly<T> {
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
      if (
        "value" in descriptor &&
        descriptor.value &&
        typeof descriptor.value === "object"
      ) {
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
  const failed = (
    reason: Extract<SnapshotResult, { ok: false }>["reason"],
  ): SnapshotResult => ({ ok: false, reason, descriptor_reads: descriptorReads });

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
    if (
      nodes > snapshotBudget.maximum_nodes ||
      frame.depth > snapshotBudget.maximum_depth
    ) {
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
          (!memberIsArray &&
            memberPrototype !== Object.prototype &&
            memberPrototype !== null) ||
          (memberIsArray && memberPrototype !== Array.prototype)
        ) {
          return failed("non_plain_data_rejected");
        }
        const child: Record<string, PlainValue> | PlainValue[] = memberIsArray
          ? []
          : {};
        (frame.target as Record<string, PlainValue>)[key] = child;
        stack.push({ source: member, target: child, depth: frame.depth + 1 });
      } else {
        return failed("non_plain_data_rejected");
      }
    }
  }

  return {
    ok: true,
    value: deepFreezePlain(root),
    descriptor_reads: descriptorReads,
  };
}

function exactKeys(value: PlainRecord, expected: readonly string[]) {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  return (
    actual.length === canonical.length &&
    actual.every((key, index) => key === canonical[index])
  );
}

function validateInput(
  snapshot: PlainRecord,
  descriptorReads: number,
): ValidatedInput | null {
  if (
    !exactKeys(snapshot, [
      "request_version",
      "operation",
      "idempotency_key",
      "observed_at",
      "evaluated_at",
    ]) ||
    snapshot.request_version !== requestVersion ||
    snapshot.operation !== operationIdentity ||
    typeof snapshot.idempotency_key !== "string" ||
    !/^action_654h_[a-z0-9_]{1,48}$/.test(snapshot.idempotency_key) ||
    typeof snapshot.observed_at !== "string" ||
    typeof snapshot.evaluated_at !== "string"
  ) {
    return null;
  }
  const observed = canonicalizeAction650uNanosecondInstant(snapshot.observed_at);
  const evaluated = canonicalizeAction650uNanosecondInstant(snapshot.evaluated_at);
  const confirmed = canonicalizeAction650uNanosecondInstant(confirmedAt)!;
  const expires = canonicalizeAction650uNanosecondInstant(sessionExpiresAt)!;
  if (
    !observed ||
    !evaluated ||
    compareAction650uInstants(observed, confirmed) < 0 ||
    compareAction650uInstants(observed, evaluated) > 0 ||
    compareAction650uInstants(observed, expires) >= 0 ||
    compareAction650uInstants(evaluated, expires) >= 0
  ) {
    return null;
  }
  const suffix = snapshot.idempotency_key.slice("action_654h_".length);
  return deepFreezePlain({
    idempotency_key: snapshot.idempotency_key,
    v5_idempotency_key: `action_653s_654h_${suffix}`,
    observed_at: observed.canonical_instant,
    evaluated_at: evaluated.canonical_instant,
    descriptor_reads: descriptorReads,
  }) as ValidatedInput;
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
  input: Partial<Action654hPrivateReadinessResult["effects"]> = {},
): Action654hPrivateReadinessResult["effects"] {
  return deepFreezePlain({
    input_descriptor_reads: input.input_descriptor_reads ?? 0,
    digest_operations: input.digest_operations ?? 0,
    v5_invocations: input.v5_invocations ?? 0,
    v5_establishments: input.v5_establishments ?? 0,
    v5_readbacks: 0 as const,
    v5_reconstitutions: 0 as const,
    capsule_mints: input.capsule_mints ?? 0,
    capsule_reads: input.capsule_reads ?? 0,
    readiness_classifications: input.readiness_classifications ?? 0,
    confirmation_consumptions: input.confirmation_consumptions ?? 0,
    getter_executions: 0 as const,
    proxy_hooks_executed: 0 as const,
    callback_executions: 0 as const,
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
  gateStatus: Action654hPrivateReadinessResult["gate_status"],
  status: Action654hPrivateReadinessResult["readiness_status"],
  reason: Action654hPrivateReadinessResult["terminal_reason"],
  descriptorReads = 0,
): Action654hPrivateReadinessResult {
  return deepFreezePlain({
    contract_version: contractVersion,
    gate_status: gateStatus,
    readiness_status: status,
    terminal_reason: reason,
    v5_instruction_result: null,
    readiness_envelope: null,
    observed_input_digest: null,
    failure_digest: null,
    idempotent_replay: false,
    effects: effects({ input_descriptor_reads: descriptorReads }),
    safety,
    terminal_digest: null,
  }) as Action654hPrivateReadinessResult;
}

const disabledResult = inertResult(
  "disabled",
  "not_eligible",
  "readiness_disabled",
);
const killedResult = inertResult(
  "kill_switch_active",
  "not_eligible",
  "kill_switch_active",
);

function signedResult(
  value: Omit<
    Action654hPrivateReadinessResult,
    "contract_version" | "safety" | "terminal_digest"
  >,
  counter: DigestCounter,
): Action654hPrivateReadinessResult {
  const unsigned = deepFreezePlain({ contract_version: contractVersion, ...value, safety });
  return deepFreezePlain({
    ...unsigned,
    terminal_digest: countedDigest(
      "action_654h_private_readiness_terminal",
      unsigned,
      counter,
    ),
  }) as Action654hPrivateReadinessResult;
}

function privateSnapshotFromEstablishedV5(
  established: Action653sInstructionResult,
  evaluatedAt: string,
  counter: DigestCounter,
): PrivateReadinessSnapshot | null {
  const receipt = established.receipt;
  const instruction = established.instruction;
  const replay = established.synthetic_replay;
  const audit = established.diagnostic_audit_handoff;
  if (
    established.contract_version !== v5ContractVersion ||
    established.instruction_status !== "prepared" ||
    established.terminal_reason !== "instruction_prepared" ||
    established.idempotent_replay !== false ||
    established.effects.private_composition_transactions !== 1 ||
    established.effects.private_confirmation_consumptions !== 1 ||
    !receipt ||
    !instruction ||
    !replay ||
    !audit ||
    established.safety.real_broker_submission !== false ||
    established.safety.avanza_live_access !== false ||
    established.safety.credential_access !== false ||
    established.safety.browser_or_cdp_access !== false ||
    established.safety.automatic_execution !== false ||
    established.safety.trade_mutation !== false ||
    established.safety.production_write !== false ||
    receipt.execution_identity !== instruction.execution_identity ||
    receipt.session_identity !== instruction.session_identity ||
    receipt.risk_admission_digest !== instruction.risk_admission_digest ||
    receipt.confirmation_request_digest !== instruction.confirmation_request_digest ||
    receipt.predecessor_consumption_receipt_digest !==
      instruction.confirmation_consumption_digest ||
    replay.execution_identity !== instruction.execution_identity ||
    replay.instruction_digest !== instruction.instruction_digest ||
    replay.receipt_digest !== receipt.receipt_digest ||
    replay.accepted !== true ||
    replay.synthetic_only !== true ||
    audit.execution_identity !== instruction.execution_identity ||
    audit.instruction_digest !== instruction.instruction_digest ||
    audit.receipt_digest !== receipt.receipt_digest ||
    audit.synthetic_replay_evidence_digest !== replay.evidence_digest ||
    audit.diagnostic_only !== true ||
    audit.real_broker_evidence !== false ||
    audit.performance_eligible !== false ||
    audit.automatic_execution_allowed !== false
  ) {
    return null;
  }

  return deepFreezePlain({
    v5_result_binding_digest: countedDigest(
      "action_654h_established_v5_binding",
      established,
      counter,
    ),
    execution_identity: instruction.execution_identity,
    instruction_identity: instruction.instruction_digest,
    risk_admission_identity: instruction.risk_admission_identity,
    risk_admission_digest: instruction.risk_admission_digest,
    confirmation_request_digest: instruction.confirmation_request_digest,
    confirmation_consumption_digest: instruction.confirmation_consumption_digest,
    diagnostic_audit_identity: audit.handoff_digest,
    idempotency_identity: instruction.idempotency_identity,
    session_identity: instruction.session_identity,
    instruction_expires_at: instruction.instruction_expires_at,
    synthetic_replay_identity: replay.evidence_digest,
    evaluated_at: evaluatedAt,
  }) as PrivateReadinessSnapshot;
}

function mintPrivateCapsule(snapshot: PrivateReadinessSnapshot): object {
  const capsule = Object.freeze(Object.create(null)) as object;
  privateCapsuleProvenance.set(capsule, snapshot);
  return capsule;
}

function classifyPrivateSnapshot(
  capsule: object,
  counter: DigestCounter,
): Action654hReadinessEnvelope {
  // The capsule is created and consumed in one private lexical boundary. It is
  // never accepted from a caller, so lookup is an internal construction
  // invariant rather than a fallible authority-verification operation.
  const snapshot = privateCapsuleProvenance.get(capsule)!;
  const readinessIdentity = countedDigest(
    "action_654h_private_readiness_identity",
    {
      execution_identity: snapshot.execution_identity,
      instruction_identity: snapshot.instruction_identity,
      session_identity: snapshot.session_identity,
      idempotency_identity: snapshot.idempotency_identity,
      evaluated_at: snapshot.evaluated_at,
    },
    counter,
  );
  const unsigned = deepFreezePlain({
    envelope_version: envelopeVersion,
    v5_contract_version: v5ContractVersion,
    execution_identity: snapshot.execution_identity,
    instruction_identity: snapshot.instruction_identity,
    risk_admission_identity: snapshot.risk_admission_identity,
    risk_admission_digest: snapshot.risk_admission_digest,
    manual_confirmation_identity: snapshot.confirmation_request_digest,
    manual_confirmation_consumption_identity:
      snapshot.confirmation_consumption_digest,
    diagnostic_audit_identity: snapshot.diagnostic_audit_identity,
    idempotency_identity: snapshot.idempotency_identity,
    session_identity: snapshot.session_identity,
    instruction_expires_at: snapshot.instruction_expires_at,
    synthetic_replay_identity: snapshot.synthetic_replay_identity,
    evaluated_at: snapshot.evaluated_at,
    readiness_identity: readinessIdentity,
    v5_result_binding_digest: snapshot.v5_result_binding_digest,
    transport_attached: false as const,
    dispatch_permitted: false as const,
    broker_submission_allowed: false as const,
  });
  return deepFreezePlain({
    ...unsigned,
    readiness_digest: countedDigest(
      "action_654h_private_readiness_envelope",
      unsigned,
      counter,
    ),
  }) as Action654hReadinessEnvelope;
}

/**
 * Atomically establishes the V5 synthetic instruction and classifies readiness.
 * The public input is closed plain data. No V5 result, authority handle, capsule,
 * issuer, callback, factory, or registrar is accepted or returned.
 */
export function runAction654hPrivateReadinessComposition(
  gate: Action654hGate,
  input: unknown,
): Action654hPrivateReadinessResult {
  if (gate.enabled !== true) return disabledResult;
  if (gate.kill_switch_active === true) return killedResult;

  const snapshot = snapshotPlainRecord(input);
  if (!snapshot.ok) {
    return inertResult(
      "enabled",
      "unmappable",
      "plain_request_rejected",
      snapshot.descriptor_reads,
    );
  }
  const validated = validateInput(snapshot.value, snapshot.descriptor_reads);
  if (!validated) {
    return inertResult(
      "enabled",
      "not_eligible",
      "plain_request_rejected",
      snapshot.descriptor_reads,
    );
  }

  const counter: DigestCounter = { count: 0 };
  const inputDigest = countedDigest(
    "action_654h_private_readiness_request",
    {
      request_version: requestVersion,
      operation: operationIdentity,
      idempotency_key: validated.idempotency_key,
      observed_at: validated.observed_at,
      evaluated_at: validated.evaluated_at,
    },
    counter,
  );
  const existing = storedCompositions.get(validated.idempotency_key);
  if (existing) {
    if (existing.input_digest !== inputDigest) {
      const failureDigest = countedDigest(
        "action_654h_private_readiness_failure",
        {
          reason: "conflicting_readiness_reuse",
          observed_input_digest: inputDigest,
          existing_input_digest: existing.input_digest,
        },
        counter,
      );
      return signedResult(
        {
          gate_status: "enabled",
          readiness_status: "conflicting",
          terminal_reason: "conflicting_readiness_reuse",
          v5_instruction_result: null,
          readiness_envelope: null,
          observed_input_digest: inputDigest,
          failure_digest: failureDigest,
          idempotent_replay: false,
          effects: effects({
            input_descriptor_reads: validated.descriptor_reads,
            digest_operations: counter.count + 1,
          }),
        },
        counter,
      );
    }
    const prior = existing.result;
    return signedResult(
      {
        gate_status: "enabled",
        readiness_status: "ready",
        terminal_reason: "exact_duplicate_idempotent",
        v5_instruction_result: prior.v5_instruction_result,
        readiness_envelope: prior.readiness_envelope,
        observed_input_digest: inputDigest,
        failure_digest: null,
        idempotent_replay: true,
        effects: effects({
          input_descriptor_reads: validated.descriptor_reads,
          digest_operations: counter.count + 1,
        }),
      },
      counter,
    );
  }

  const established = runAction653sNonExportableAuthorityInstruction(
    { enabled: true, kill_switch_active: false },
    {
      request_version: v5RequestVersion,
      operation: v5Operation,
      idempotency_key: validated.v5_idempotency_key,
      observed_at: validated.observed_at,
    },
  );
  const privateSnapshot = privateSnapshotFromEstablishedV5(
    established,
    validated.evaluated_at,
    counter,
  );
  if (!privateSnapshot) {
    const failureDigest = countedDigest(
      "action_654h_private_readiness_failure",
      {
        reason: "v5_establishment_rejected",
        observed_input_digest: inputDigest,
        v5_terminal_digest: established.terminal_digest,
      },
      counter,
    );
    return signedResult(
      {
        gate_status: "enabled",
        readiness_status:
          established.instruction_status === "expired" ? "expired" : "conflicting",
        terminal_reason: "v5_establishment_rejected",
        v5_instruction_result: null,
        readiness_envelope: null,
        observed_input_digest: inputDigest,
        failure_digest: failureDigest,
        idempotent_replay: false,
        effects: effects({
          input_descriptor_reads: validated.descriptor_reads,
          digest_operations: counter.count + 1,
          v5_invocations: 1,
          confirmation_consumptions:
            established.effects.private_confirmation_consumptions,
        }),
      },
      counter,
    );
  }

  const capsule = mintPrivateCapsule(privateSnapshot);
  const envelope = classifyPrivateSnapshot(capsule, counter);

  const result = signedResult(
    {
      gate_status: "enabled",
      readiness_status: "ready",
      terminal_reason: "readiness_ready",
      v5_instruction_result: established,
      readiness_envelope: envelope,
      observed_input_digest: inputDigest,
      failure_digest: null,
      idempotent_replay: false,
      effects: effects({
        input_descriptor_reads: validated.descriptor_reads,
        digest_operations: counter.count + 1,
        v5_invocations: 1,
        v5_establishments: 1,
        capsule_mints: 1,
        capsule_reads: 1,
        readiness_classifications: 1,
        confirmation_consumptions: 1,
      }),
    },
    counter,
  );
  storedCompositions.set(validated.idempotency_key, {
    input_digest: inputDigest,
    result,
  });
  return result;
}
