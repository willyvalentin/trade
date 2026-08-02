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
  canonicalizeAction650uNanosecondInstant,
  compareAction650uInstants,
} from "@/lib/action-650u-temporal-confirmation-policy";
import {
  createAction652aExternalRiskAuthority,
  rebuildAction652aExternalRiskPolicyDigest,
  runAction652aExecutionIntentAdmission,
  type Action652aAdmissionGate,
  type Action652aAdmissionResult,
  type Action652aExecutionIntent,
  type Action652aExternalRiskAuthority,
  type Action652aExternalRiskAuthorityInput,
} from "@/lib/action-652a-execution-risk-envelope-admission";

export const action652cNonForgeableRiskAuthorityContractVersion =
  "action_652c_non_forgeable_risk_authority_v2" as const;
export const action652cPrivateRegistryRuntimeVersion =
  "action_652c_private_external_registry_runtime_v1" as const;
export const action652cAuthorityCapabilityVersion =
  "action_652c_private_risk_authority_capability_v1" as const;
export const action652cInputSnapshotPolicyVersion =
  "action_652c_atomic_plain_data_snapshot_v1" as const;

type PlainValue =
  | null
  | boolean
  | number
  | string
  | readonly PlainValue[]
  | { readonly [key: string]: PlainValue };

type SnapshotFailure =
  | "accessor_rejected"
  | "proxy_rejected"
  | "cycle_rejected"
  | "non_plain_data_rejected"
  | "snapshot_budget_exceeded"
  | "descriptor_inspection_failed";

export type Action652cAdmissionReason =
  | Action652aAdmissionResult["admission_reason"]
  | "private_authority_membership_mismatch"
  | "private_authority_capability_expired"
  | "private_authority_runtime_unproven"
  | "private_authority_snapshot_rejected"
  | "caller_authority_surface_rejected";

export type Action652cAdmissionRequest = Readonly<{
  prepared: Action650sPreparedExecution;
  intent: Action652aExecutionIntent;
  admission_at: string;
}>;

export type Action652cAuthorityBinding = Readonly<{
  capability_version: typeof action652cAuthorityCapabilityVersion;
  external_registry_owner_identity: string;
  external_registry_owner_digest: string;
  registry_membership_digest: string;
  risk_policy_identity: string;
  risk_policy_version: string;
  risk_policy_digest: string;
  issued_at: string;
  expires_at: string;
  execution_identity: string;
  session_identity: string;
  cash_snapshot_identity: string;
  exposure_snapshot_identity: string;
  open_intent_snapshot_identity: string;
  membership_set: Readonly<{
    instruments: readonly string[];
    sides: readonly ("BUY" | "SELL")[];
  }>;
  exact_limits: Readonly<{
    maximum_quantity_units: string;
    maximum_notional_micros: string;
    reference_price_micros: string;
    maximum_price_deviation_ppm: string;
    maximum_daily_orders: string;
    maximum_daily_notional_micros: string;
    maximum_cash_use_micros: string;
    maximum_exposure_micros: string;
    maximum_open_intents: string;
    maximum_open_intent_notional_micros: string;
    maximum_snapshot_age_nanoseconds: string;
  }>;
  authority_snapshot_digest: string;
  capability_digest: string;
}>;

export type Action652cAdmissionResult = Readonly<{
  contract_version: typeof action652cNonForgeableRiskAuthorityContractVersion;
  gate_status: "enabled" | "disabled" | "kill_switch_active";
  admission_status: Action652aAdmissionResult["admission_status"];
  admission_reason: Action652cAdmissionReason;
  authority_binding: Action652cAuthorityBinding | null;
  predecessor_admission: Action652aAdmissionResult | null;
  manual_confirmation_admission: false | Readonly<{
    permitted: true;
    admission_identity: string;
    admission_digest: string;
  }>;
  observed_input_digest: string | null;
  failure_digest: string | null;
  terminal_digest: string | null;
  safety: Readonly<{
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
    request_reads: 0 | 1;
    private_registry_reads: 0 | 1;
    authority_capabilities_issued: 0 | 1;
    authority_capabilities_exposed: 0;
    digest_operations: 0 | 1;
    broker_requests: 0;
    provider_calls: 0;
    credential_reads: 0;
    database_reads: 0;
    database_writes: 0;
    process_spawns: 0;
    trade_mutations: 0;
  }>;
}>;

type PrivateRegistryRuntime = Readonly<{
  version: typeof action652cPrivateRegistryRuntimeVersion;
}>;

type PrivateRegistryEntry = Readonly<{
  owner: Readonly<{
    identity: string;
    digest: string;
  }>;
  membership: Readonly<{
    execution_identity: string;
    session_identity: string;
    instruments: readonly string[];
    sides: readonly ("BUY" | "SELL")[];
    digest: string;
  }>;
  capability_issued_at: string;
  capability_expires_at: string;
  policy: Omit<Action652aExternalRiskAuthority["policy"], "digest">;
  snapshot: Omit<
    Action652aExternalRiskAuthority["snapshot"],
    "digest" | "policy_digest"
  > & {
    cash_snapshot_identity: string;
    exposure_snapshot_identity: string;
    open_intent_snapshot_identity: string;
  };
  market_authority: Action652aExternalRiskAuthority["market_authority"];
}>;

type PrivateAuthorityCapability = Readonly<{
  kind: "action_652c_private_authority_capability";
}>;

type PrivateAuthorityRecord = Readonly<{
  binding: Action652cAuthorityBinding;
  authority: Action652aExternalRiskAuthority;
  consumed: boolean;
}>;

const privateRuntimeProvenance = new WeakSet<object>();
const privateCapabilityProvenance =
  new WeakMap<object, PrivateAuthorityRecord>();
const admittedResultProvenance = new WeakSet<object>();

const safety = deepFreezeAction650s({
  synthetic_only: true as const,
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
  private_registry_reads: 0 as const,
  authority_capabilities_issued: 0 as const,
  authority_capabilities_exposed: 0 as const,
  digest_operations: 0 as const,
  broker_requests: 0 as const,
  provider_calls: 0 as const,
  credential_reads: 0 as const,
  database_reads: 0 as const,
  database_writes: 0 as const,
  process_spawns: 0 as const,
  trade_mutations: 0 as const,
});

const activeEffects = deepFreezeAction650s({
  request_reads: 1 as const,
  private_registry_reads: 1 as const,
  authority_capabilities_issued: 1 as const,
  authority_capabilities_exposed: 0 as const,
  digest_operations: 1 as const,
  broker_requests: 0 as const,
  provider_calls: 0 as const,
  credential_reads: 0 as const,
  database_reads: 0 as const,
  database_writes: 0 as const,
  process_spawns: 0 as const,
  trade_mutations: 0 as const,
});

const privateRegistryEntries = deepFreezeAction650s([
  {
    owner: {
      identity: "action-652c-external-risk-registry-owner",
      digest:
        "action_652c_registry_owner_8b75bb90c03a195e887c46d82317aaed94171d9ffeb697c13929b9c23bf0ff80",
    },
    membership: {
      execution_identity: "action-651a-execution",
      session_identity: "action-651a-confirmation-session",
      instruments: ["AAPL"],
      sides: ["BUY", "SELL"],
      digest:
        "action_652c_registry_membership_725292a979891501732f6c7c38d20ba3d2aac6ea391e5603b57b3ee1710355b9",
    },
    capability_issued_at: "2026-07-29T09:59:59.750000000Z",
    capability_expires_at: "2026-07-29T10:00:01.000000000Z",
    policy: {
      identity: "action-652c-policy-stockholm-read-only",
      version: "2026-07-29.2",
      effective_at: "2026-07-29T09:00:00.000000000Z",
      expires_at: "2026-07-29T11:00:00.000000000Z",
      symbol_allowlist: ["AAPL"],
      maximum_quantity_units: "5",
      maximum_notional_micros: "895000000",
      reference_price_micros: "179000000",
      maximum_price_deviation_ppm: "0",
      maximum_daily_orders: "10",
      maximum_daily_notional_micros: "10000000000",
      maximum_cash_use_micros: "1000000000",
      maximum_exposure_micros: "5000000000",
      maximum_open_intents: "4",
      maximum_open_intent_notional_micros: "2000000000",
      maximum_snapshot_age_nanoseconds: "1499999999",
      quantity_scale: 0,
      price_scale: 6,
      notional_scale: 6,
      currency: "SEK",
    },
    snapshot: {
      identity: "action-652c-authority-snapshot",
      session_identity: "action-651a-confirmation-session",
      observed_at: "2026-07-29T09:59:59.500000000Z",
      finalized_at: "2026-07-29T09:59:59.750000000Z",
      expires_at: "2026-07-29T10:00:10.000000000Z",
      finalized: true,
      cash_available_micros: "2000000000",
      exposure_micros: "1000000000",
      open_intent_count: "1",
      open_intent_notional_micros: "100000000",
      daily_order_count: "2",
      daily_notional_micros: "1000000000",
      cash_snapshot_identity: "action-652c-cash-snapshot",
      exposure_snapshot_identity: "action-652c-exposure-snapshot",
      open_intent_snapshot_identity: "action-652c-open-intent-snapshot",
    },
    market_authority: {
      identity: "action-652c-market-session-authority",
      digest:
        "action_652c_market_authority_b6dd03efca90187da6302a131855541b659d5628c8ba12fd0bd278401f17e1dd",
      calendar_identity: "action-652c-synthetic-calendar",
      calendar_version: "2026.07.29",
      calendar_digest:
        "action_652c_calendar_f5674042e3a2081016445b36cf235cb4f35d0998f7bd976e4a46cf204bab047a",
      session_identity: "action-651a-confirmation-session",
      session_type: "synthetic_regular",
      session_open_at: "2026-07-29T08:00:00.000000000Z",
      session_close_at: "2026-07-29T16:30:00.000000000Z",
    },
  },
] satisfies readonly PrivateRegistryEntry[]);

function createPrivateRegistryRuntime(): PrivateRegistryRuntime {
  const runtime = Object.freeze({
    version: action652cPrivateRegistryRuntimeVersion,
  });
  privateRuntimeProvenance.add(runtime);
  return runtime;
}

const privateRegistryRuntime = createPrivateRegistryRuntime();

function digest(prefix: string, value: unknown) {
  return `${prefix}_${hashAction650sCanonicalValue(value)}`;
}

function plainSnapshot(value: unknown):
  | Readonly<{ ok: true; value: PlainValue }>
  | Readonly<{
      ok: false;
      reason: SnapshotFailure;
      witness_digest: string;
    }> {
  class InternalSnapshotFailure {
    readonly ok = false as const;

    constructor(
      readonly reason: SnapshotFailure,
      readonly witness_digest: string,
    ) {}
  }
  const seen = new WeakSet<object>();
  let nodes = 0;
  let properties = 0;
  let stringBytes = 0;

  function failed(reason: SnapshotFailure, path: string) {
    return new InternalSnapshotFailure(
      reason,
      digest("action_652c_snapshot_rejection", {
        policy_version: action652cInputSnapshotPolicyVersion,
        reason,
        path,
        nodes,
        properties,
        string_bytes: stringBytes,
      }),
    );
  }

  type VisitResult = PlainValue | ReturnType<typeof failed>;

  function visit(current: unknown, path: string, depth: number): VisitResult {
    if (typeof current === "string") {
      stringBytes += Buffer.byteLength(current, "utf8");
      return stringBytes <= 98_304
        ? current
        : failed("snapshot_budget_exceeded", path);
    }
    if (
      current === null ||
      typeof current === "boolean" ||
      (typeof current === "number" && Number.isFinite(current))
    ) {
      return current;
    }
    if (typeof current !== "object") {
      return failed("non_plain_data_rejected", path);
    }
    if (nodeTypes.isProxy(current)) return failed("proxy_rejected", path);
    if (seen.has(current)) return failed("cycle_rejected", path);
    if (depth > 14) return failed("snapshot_budget_exceeded", path);
    const prototype = Object.getPrototypeOf(current);
    if (
      !Array.isArray(current) &&
      prototype !== Object.prototype &&
      prototype !== null
    ) {
      return failed("non_plain_data_rejected", path);
    }
    nodes += 1;
    if (nodes > 768) return failed("snapshot_budget_exceeded", path);
    seen.add(current);
    let descriptors: PropertyDescriptorMap;
    try {
      descriptors = Object.getOwnPropertyDescriptors(current);
    } catch {
      return failed("descriptor_inspection_failed", path);
    }
    const keys = Reflect.ownKeys(descriptors);
    if (keys.some((key) => typeof key !== "string")) {
      return failed("non_plain_data_rejected", path);
    }
    properties += keys.length;
    if (properties > 3_072) {
      return failed("snapshot_budget_exceeded", path);
    }
    if (Array.isArray(current)) {
      const length = descriptors.length?.value;
      if (!Number.isInteger(length)) {
        return failed("descriptor_inspection_failed", path);
      }
      const result: PlainValue[] = [];
      for (let index = 0; index < length; index += 1) {
        const descriptor = descriptors[String(index)];
        if (!descriptor || descriptor.get || descriptor.set) {
          return failed("accessor_rejected", `${path}[${index}]`);
        }
        const nested = visit(descriptor.value, `${path}[${index}]`, depth + 1);
        if (nested instanceof InternalSnapshotFailure) return nested;
        result.push(nested as PlainValue);
      }
      return result;
    }
    const result: Record<string, PlainValue> = {};
    for (const key of (keys as string[]).sort()) {
      const descriptor = descriptors[key];
      if (!descriptor || descriptor.get || descriptor.set) {
        return failed("accessor_rejected", `${path}.${key}`);
      }
      const nested = visit(descriptor.value, `${path}.${key}`, depth + 1);
      if (nested instanceof InternalSnapshotFailure) return nested;
      result[key] = nested as PlainValue;
    }
    return result;
  }

  const captured = visit(value, "$", 0);
  if (captured instanceof InternalSnapshotFailure) {
    return deepFreezeAction650s({
      ok: false as const,
      reason: captured.reason,
      witness_digest: captured.witness_digest,
    });
  }
  return deepFreezeAction650s({
    ok: true as const,
    value: deepFreezeAction650s(captured) as PlainValue,
  });
}

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
  );
}

function privateRegistryLookup(
  runtime: PrivateRegistryRuntime,
  query: Readonly<{
    execution_identity: string;
    session_identity: string;
    instrument: string;
    side: "BUY" | "SELL";
  }>,
) {
  if (!privateRuntimeProvenance.has(runtime)) return null;
  const entry = privateRegistryEntries.find(
    (candidate) =>
      candidate.membership.execution_identity === query.execution_identity &&
      candidate.membership.session_identity === query.session_identity &&
      candidate.membership.instruments.includes(query.instrument) &&
      candidate.membership.sides.includes(query.side),
  );
  if (!entry) return null;
  const captured = plainSnapshot(entry);
  return captured.ok
    ? (captured.value as unknown as PrivateRegistryEntry)
    : null;
}

function issuePrivateAuthorityCapability(
  runtime: PrivateRegistryRuntime,
  query: Parameters<typeof privateRegistryLookup>[1],
) {
  const entry = privateRegistryLookup(runtime, query);
  if (!entry) return null;

  const policyDigest = rebuildAction652aExternalRiskPolicyDigest(entry.policy);
  const {
    cash_snapshot_identity: cashSnapshotIdentity,
    exposure_snapshot_identity: exposureSnapshotIdentity,
    open_intent_snapshot_identity: openIntentSnapshotIdentity,
    ...snapshot
  } = entry.snapshot;
  const authorityInput: Action652aExternalRiskAuthorityInput = {
    policy: entry.policy,
    snapshot: {
      ...snapshot,
      policy_digest: policyDigest,
    },
    market_authority: entry.market_authority,
  };
  const authority = createAction652aExternalRiskAuthority(authorityInput);
  if (!authority) return null;

  const bindingWithoutDigest = {
    capability_version: action652cAuthorityCapabilityVersion,
    external_registry_owner_identity: entry.owner.identity,
    external_registry_owner_digest: entry.owner.digest,
    registry_membership_digest: entry.membership.digest,
    risk_policy_identity: entry.policy.identity,
    risk_policy_version: entry.policy.version,
    risk_policy_digest: policyDigest,
    issued_at: entry.capability_issued_at,
    expires_at: entry.capability_expires_at,
    execution_identity: entry.membership.execution_identity,
    session_identity: entry.membership.session_identity,
    cash_snapshot_identity: cashSnapshotIdentity,
    exposure_snapshot_identity: exposureSnapshotIdentity,
    open_intent_snapshot_identity: openIntentSnapshotIdentity,
    membership_set: {
      instruments: entry.membership.instruments,
      sides: entry.membership.sides,
    },
    exact_limits: {
      maximum_quantity_units: entry.policy.maximum_quantity_units,
      maximum_notional_micros: entry.policy.maximum_notional_micros,
      reference_price_micros: entry.policy.reference_price_micros,
      maximum_price_deviation_ppm:
        entry.policy.maximum_price_deviation_ppm,
      maximum_daily_orders: entry.policy.maximum_daily_orders,
      maximum_daily_notional_micros:
        entry.policy.maximum_daily_notional_micros,
      maximum_cash_use_micros: entry.policy.maximum_cash_use_micros,
      maximum_exposure_micros: entry.policy.maximum_exposure_micros,
      maximum_open_intents: entry.policy.maximum_open_intents,
      maximum_open_intent_notional_micros:
        entry.policy.maximum_open_intent_notional_micros,
      maximum_snapshot_age_nanoseconds:
        entry.policy.maximum_snapshot_age_nanoseconds,
    },
    authority_snapshot_digest: authority.snapshot.digest,
  };
  const binding = deepFreezeAction650s({
    ...bindingWithoutDigest,
    capability_digest: digest(
      "action_652c_private_authority_capability",
      bindingWithoutDigest,
    ),
  }) as Action652cAuthorityBinding;
  const capability = Object.freeze({
    kind: "action_652c_private_authority_capability" as const,
  });
  privateCapabilityProvenance.set(capability, {
    binding,
    authority,
    consumed: false,
  });
  return capability;
}

function consumePrivateAuthorityCapability(
  capability: PrivateAuthorityCapability,
  admissionAt: string,
  expected: Readonly<{
    execution_identity: string;
    session_identity: string;
  }>,
):
  | Readonly<{
      ok: true;
      binding: Action652cAuthorityBinding;
      authority: Action652aExternalRiskAuthority;
    }>
  | Readonly<{ ok: false; reason: Action652cAdmissionReason }> {
  const stored = privateCapabilityProvenance.get(capability);
  if (!stored || stored.consumed) {
    return { ok: false, reason: "private_authority_runtime_unproven" };
  }
  const decision = canonicalizeAction650uNanosecondInstant(admissionAt);
  const issued = canonicalizeAction650uNanosecondInstant(
    stored.binding.issued_at,
  );
  const expires = canonicalizeAction650uNanosecondInstant(
    stored.binding.expires_at,
  );
  if (!decision || !issued || !expires) {
    return { ok: false, reason: "private_authority_snapshot_rejected" };
  }
  if (
    stored.binding.execution_identity !== expected.execution_identity ||
    stored.binding.session_identity !== expected.session_identity
  ) {
    return { ok: false, reason: "private_authority_membership_mismatch" };
  }
  if (
    compareAction650uInstants(decision, issued) < 0 ||
    compareAction650uInstants(decision, expires) >= 0
  ) {
    return { ok: false, reason: "private_authority_capability_expired" };
  }
  privateCapabilityProvenance.set(capability, {
    ...stored,
    consumed: true,
  });
  return {
    ok: true,
    binding: stored.binding,
    authority: stored.authority,
  };
}

function resultTerminalProjection(
  result: Omit<Action652cAdmissionResult, "terminal_digest">,
) {
  return {
    contract_version: result.contract_version,
    gate_status: result.gate_status,
    admission_status: result.admission_status,
    admission_reason: result.admission_reason,
    authority_binding: result.authority_binding,
    predecessor_admission: result.predecessor_admission,
    manual_confirmation_admission: result.manual_confirmation_admission,
    observed_input_digest: result.observed_input_digest,
    failure_digest: result.failure_digest,
    safety: result.safety,
    effects: result.effects,
  };
}

export function rebuildAction652cAdmissionTerminalDigest(
  result: Omit<Action652cAdmissionResult, "terminal_digest">,
) {
  return digest(
    "action_652c_admission_terminal",
    resultTerminalProjection(result),
  );
}

const disabledResult = deepFreezeAction650s({
  contract_version: action652cNonForgeableRiskAuthorityContractVersion,
  gate_status: "disabled" as const,
  admission_status: "incomplete" as const,
  admission_reason: "admission_disabled" as const,
  authority_binding: null,
  predecessor_admission: null,
  manual_confirmation_admission: false as const,
  observed_input_digest: null,
  failure_digest: null,
  terminal_digest: null,
  safety,
  effects: zeroEffects,
}) as Action652cAdmissionResult;

const killSwitchResult = deepFreezeAction650s({
  ...disabledResult,
  gate_status: "kill_switch_active" as const,
  admission_reason: "kill_switch_active" as const,
}) as Action652cAdmissionResult;

function enabledResult(
  fields: Omit<
    Action652cAdmissionResult,
    "contract_version" | "gate_status" | "safety" | "effects" | "terminal_digest"
  >,
) {
  const withoutTerminal = {
    contract_version: action652cNonForgeableRiskAuthorityContractVersion,
    gate_status: "enabled" as const,
    ...fields,
    safety,
    effects: activeEffects,
  };
  const result = deepFreezeAction650s({
    ...withoutTerminal,
    terminal_digest: rebuildAction652cAdmissionTerminalDigest(withoutTerminal),
  }) as Action652cAdmissionResult;
  if (result.admission_status === "admitted") {
    admittedResultProvenance.add(result);
  }
  return result;
}

function failed(
  reason: Action652cAdmissionReason,
  status: Action652aAdmissionResult["admission_status"],
  observedInputDigest: string | null,
  binding: Action652cAuthorityBinding | null = null,
  predecessor: Action652aAdmissionResult | null = null,
) {
  const failureProjection = {
    reason,
    status,
    observed_input_digest: observedInputDigest,
    authority_capability_digest: binding?.capability_digest ?? null,
    predecessor_terminal_digest: predecessor?.terminal_digest ?? null,
  };
  return enabledResult({
    admission_status: status,
    admission_reason: reason,
    authority_binding: binding,
    predecessor_admission: predecessor,
    manual_confirmation_admission: false,
    observed_input_digest: observedInputDigest,
    failure_digest: digest("action_652c_admission_failure", failureProjection),
  });
}

export function runAction652cExecutionIntentAdmission(
  gate: Action652aAdmissionGate,
  request: unknown,
): Action652cAdmissionResult {
  if (gate.enabled !== true) return disabledResult;
  if (gate.kill_switch_active === true) return killSwitchResult;

  const captured = plainSnapshot(request);
  if (!captured.ok) {
    return failed(
      "private_authority_snapshot_rejected",
      "incomplete",
      captured.witness_digest,
    );
  }
  const root = record(captured.value);
  const originalRoot = record(request);
  if (!root || !originalRoot) {
    return failed(
      "admission_input_incomplete",
      "incomplete",
      digest("action_652c_observed_input", captured.value),
    );
  }
  const observedInputDigest = digest(
    "action_652c_observed_input",
    captured.value,
  );
  if (!exactKeys(root, ["prepared", "intent", "admission_at"])) {
    return failed(
      "caller_authority_surface_rejected",
      "conflicting",
      observedInputDigest,
    );
  }
  const prepared = root.prepared as unknown as Action650sPreparedExecution;
  const intent = record(root.intent);
  const originalPrepared = originalRoot.prepared;
  if (
    !intent ||
    !hasAction650sPreparedExecutionProvenance(originalPrepared) ||
    typeof intent.execution_identity !== "string" ||
    typeof intent.session_identity !== "string" ||
    typeof intent.instrument !== "string" ||
    (intent.side !== "BUY" && intent.side !== "SELL") ||
    intent.execution_identity !==
      prepared.runtime_identity_context.execution_identity ||
    intent.preparation_trace_identity !== prepared.trace_identity ||
    intent.handoff_identity !== prepared.handoff.identity.handoff_identity
  ) {
    return failed(
      "private_authority_membership_mismatch",
      "conflicting",
      observedInputDigest,
    );
  }

  const capability = issuePrivateAuthorityCapability(
    privateRegistryRuntime,
    {
      execution_identity: intent.execution_identity,
      session_identity: intent.session_identity,
      instrument: intent.instrument,
      side: intent.side,
    },
  );
  if (!capability) {
    return failed(
      "private_authority_membership_mismatch",
      "conflicting",
      observedInputDigest,
    );
  }
  const consumed = consumePrivateAuthorityCapability(
    capability,
    String(root.admission_at),
    {
      execution_identity: intent.execution_identity,
      session_identity: intent.session_identity,
    },
  );
  if (!consumed.ok) {
    return failed(
      consumed.reason,
      consumed.reason === "private_authority_capability_expired"
        ? "not_point_in_time_safe"
        : "conflicting",
      observedInputDigest,
    );
  }

  const predecessor = runAction652aExecutionIntentAdmission(
    { enabled: true, kill_switch_active: false },
    {
      prepared: originalPrepared,
      intent: captured.value &&
        typeof captured.value === "object" &&
        "intent" in captured.value
        ? captured.value.intent
        : null,
      external_risk_authority: consumed.authority,
      admission_at: root.admission_at,
    },
  );
  if (predecessor.admission_status !== "admitted") {
    return failed(
      predecessor.admission_reason,
      predecessor.admission_status,
      observedInputDigest,
      consumed.binding,
      predecessor,
    );
  }

  const admissionSeed = {
    authority_capability_digest: consumed.binding.capability_digest,
    predecessor_terminal_digest: predecessor.terminal_digest,
    execution_identity: intent.execution_identity,
    session_identity: intent.session_identity,
  };
  return enabledResult({
    admission_status: "admitted",
    admission_reason: "risk_envelope_satisfied",
    authority_binding: consumed.binding,
    predecessor_admission: predecessor,
    manual_confirmation_admission: {
      permitted: true,
      admission_identity: `action_652c_admission_${hashAction650sCanonicalValue(
        admissionSeed,
      ).slice(0, 24)}`,
      admission_digest: digest(
        "action_652c_manual_confirmation_gate",
        admissionSeed,
      ),
    },
    observed_input_digest: digest("action_652c_canonical_input", {
      preparation_trace_identity: prepared.trace_identity,
      intent: predecessor.intent_projection,
      admission_at: predecessor.temporal_projection?.admission_at ?? null,
    }),
    failure_digest: null,
  });
}

export function canAction652cProceedToManualConfirmation(value: unknown) {
  if (
    !value ||
    typeof value !== "object" ||
    !admittedResultProvenance.has(value as object)
  ) {
    return false;
  }
  const result = value as Action652cAdmissionResult;
  if (
    !Object.isFrozen(result) ||
    result.admission_status !== "admitted" ||
    result.manual_confirmation_admission === false ||
    !result.authority_binding ||
    !result.terminal_digest
  ) {
    return false;
  }
  const { terminal_digest: terminalDigest, ...withoutTerminal } = result;
  return (
    terminalDigest === rebuildAction652cAdmissionTerminalDigest(withoutTerminal)
  );
}
