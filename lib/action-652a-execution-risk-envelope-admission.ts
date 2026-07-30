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
  type Action650uCanonicalInstant,
} from "@/lib/action-650u-temporal-confirmation-policy";

export const action652aExecutionRiskEnvelopeContractVersion =
  "action_652a_execution_risk_envelope_admission_v1" as const;
export const action652aExternalRiskAuthorityPolicyVersion =
  "action_652a_external_read_only_risk_authority_v1" as const;
export const action652aSnapshotPolicyVersion =
  "action_652a_bounded_single_read_snapshot_v1" as const;

const snapshotBudget = Object.freeze({
  maximum_depth: 14,
  maximum_nodes: 768,
  maximum_properties: 3_072,
  maximum_string_bytes: 98_304,
});
const signedI128Maximum = BigInt("170141183460469231731687303715884105727");
const ppmScale = BigInt(1_000_000);

export type Action652aAdmissionStatus =
  | "admitted"
  | "rejected"
  | "incomplete"
  | "conflicting"
  | "not_point_in_time_safe";

export type Action652aAdmissionReason =
  | "risk_envelope_satisfied"
  | "admission_input_incomplete"
  | "admission_input_shape_conflicting"
  | "input_snapshot_rejected"
  | "preparation_provenance_unproven"
  | "risk_authority_provenance_unproven"
  | "risk_authority_digest_conflicting"
  | "execution_lineage_conflicting"
  | "intent_scale_or_unit_conflicting"
  | "intent_notional_conflicting"
  | "numeric_value_invalid"
  | "numeric_overflow"
  | "instrument_not_allowed"
  | "quantity_limit_exceeded"
  | "notional_limit_exceeded"
  | "price_deviation_limit_exceeded"
  | "daily_order_limit_exceeded"
  | "daily_notional_limit_exceeded"
  | "cash_limit_exceeded"
  | "exposure_limit_exceeded"
  | "open_intent_limit_exceeded"
  | "risk_policy_not_effective"
  | "risk_policy_expired"
  | "intent_not_effective"
  | "intent_expired"
  | "market_session_closed"
  | "session_identity_conflicting"
  | "snapshot_not_finalized"
  | "snapshot_from_future"
  | "snapshot_expired"
  | "snapshot_too_old";

export type Action652aScaledInteger = Readonly<{
  value: string;
  scale: number;
  unit: string;
}>;

export type Action652aExecutionIntent = Readonly<{
  execution_identity: string;
  preparation_trace_identity: string;
  handoff_identity: string;
  instrument: string;
  side: "BUY" | "SELL";
  quantity: Action652aScaledInteger;
  limit_price: Action652aScaledInteger;
  notional: Action652aScaledInteger;
  session_identity: string;
  intent_created_at: string;
  intent_expires_at: string;
}>;

export type Action652aExternalRiskAuthority = Readonly<{
  contract_version: typeof action652aExternalRiskAuthorityPolicyVersion;
  policy: Readonly<{
    identity: string;
    version: string;
    effective_at: string;
    expires_at: string;
    symbol_allowlist: readonly string[];
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
    quantity_scale: 0;
    price_scale: 6;
    notional_scale: 6;
    currency: "SEK";
    digest: string;
  }>;
  snapshot: Readonly<{
    identity: string;
    policy_digest: string;
    session_identity: string;
    observed_at: string;
    finalized_at: string;
    expires_at: string;
    finalized: boolean;
    cash_available_micros: string;
    exposure_micros: string;
    open_intent_count: string;
    open_intent_notional_micros: string;
    daily_order_count: string;
    daily_notional_micros: string;
    digest: string;
  }>;
  market_authority: Readonly<{
    identity: string;
    digest: string;
    calendar_identity: string;
    calendar_version: string;
    calendar_digest: string;
    session_identity: string;
    session_type: "synthetic_regular";
    session_open_at: string;
    session_close_at: string;
  }>;
  envelope_digest: string;
}>;

export type Action652aExternalRiskAuthorityInput = Readonly<{
  policy: Omit<Action652aExternalRiskAuthority["policy"], "digest">;
  snapshot: Omit<Action652aExternalRiskAuthority["snapshot"], "digest">;
  market_authority: Action652aExternalRiskAuthority["market_authority"];
}>;

export type Action652aAdmissionRequest = Readonly<{
  prepared: Action650sPreparedExecution;
  intent: Action652aExecutionIntent;
  external_risk_authority: Action652aExternalRiskAuthority;
  admission_at: string;
}>;

export type Action652aAdmissionGate = Readonly<{
  enabled: boolean;
  kill_switch_active: boolean;
}>;

type SnapshotFailureReason =
  | "accessor_rejected"
  | "proxy_rejected"
  | "cycle_rejected"
  | "snapshot_budget_exceeded"
  | "descriptor_inspection_failed"
  | "non_plain_data_rejected";

type PlainValue =
  | null
  | boolean
  | number
  | string
  | readonly PlainValue[]
  | { readonly [key: string]: PlainValue };

export type Action652aAdmissionResult = Readonly<{
  contract_version: typeof action652aExecutionRiskEnvelopeContractVersion;
  gate_status: "enabled" | "disabled" | "kill_switch_active";
  admission_status: Action652aAdmissionStatus;
  admission_reason: Action652aAdmissionReason | "admission_disabled" | "kill_switch_active";
  lineage: Readonly<{
    execution_identity: string | null;
    lifecycle_identity: string | null;
    preparation_trace_identity: string | null;
    handoff_identity: string | null;
    handoff_digest: string | null;
    canonical_order_payload_digest: string | null;
    idempotency_identity: string | null;
    session_identity: string | null;
  }> | null;
  intent_projection: Readonly<{
    instrument: string;
    side: "BUY" | "SELL";
    quantity: Action652aScaledInteger;
    limit_price: Action652aScaledInteger;
    notional: Action652aScaledInteger;
    intent_created_at: string;
    intent_expires_at: string;
  }> | null;
  risk_authority_projection: Readonly<{
    policy_identity: string;
    policy_version: string;
    policy_digest: string;
    snapshot_identity: string;
    snapshot_digest: string;
    market_authority_identity: string;
    market_authority_digest: string;
    calendar_identity: string;
    calendar_version: string;
    calendar_digest: string;
    envelope_digest: string;
  }> | null;
  temporal_projection: Readonly<{
    admission_at: string;
    policy_effective_at: string;
    policy_expires_at: string;
    intent_created_at: string;
    intent_expires_at: string;
    snapshot_observed_at: string;
    snapshot_finalized_at: string;
    snapshot_expires_at: string;
    session_open_at: string;
    session_close_at: string;
    snapshot_age_nanoseconds: string;
  }> | null;
  observed_input_digests: Readonly<{
    request_digest: string | null;
    preparation_digest: string | null;
    intent_digest: string | null;
    authority_digest: string | null;
    rejected_input_digest: string | null;
  }>;
  failure_provenance: Readonly<{
    reason: Action652aAdmissionReason;
    observed_rejected_input_digests: Action652aAdmissionResult["observed_input_digests"];
    failure_digest: string;
  }> | null;
  manual_confirmation_admission: false | Readonly<{
    permitted: true;
    admission_identity: string;
    admission_digest: string;
  }>;
  terminal_digest: string | null;
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
    request_reads: 0 | 1;
    authority_reads: 0 | 1;
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

const authorityProvenance = new WeakSet<object>();
const admittedResultProvenance = new WeakSet<object>();

const safety = deepFreezeAction650s({
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

const zeroEffects = deepFreezeAction650s({
  request_reads: 0 as const,
  authority_reads: 0 as const,
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
  authority_reads: 1 as const,
  digest_operations: 1 as const,
  broker_requests: 0 as const,
  provider_calls: 0 as const,
  credential_reads: 0 as const,
  database_reads: 0 as const,
  database_writes: 0 as const,
  process_spawns: 0 as const,
  trade_mutations: 0 as const,
});

const disabledResult = deepFreezeAction650s({
  contract_version: action652aExecutionRiskEnvelopeContractVersion,
  gate_status: "disabled" as const,
  admission_status: "incomplete" as const,
  admission_reason: "admission_disabled" as const,
  lineage: null,
  intent_projection: null,
  risk_authority_projection: null,
  temporal_projection: null,
  observed_input_digests: {
    request_digest: null,
    preparation_digest: null,
    intent_digest: null,
    authority_digest: null,
    rejected_input_digest: null,
  },
  failure_provenance: null,
  manual_confirmation_admission: false as const,
  terminal_digest: null,
  safety,
  effects: zeroEffects,
}) as Action652aAdmissionResult;

const killSwitchResult = deepFreezeAction650s({
  ...disabledResult,
  gate_status: "kill_switch_active" as const,
  admission_reason: "kill_switch_active" as const,
}) as Action652aAdmissionResult;

function prefixedDigest(prefix: string, value: unknown) {
  return `${prefix}_${hashAction650sCanonicalValue(value)}`;
}

function snapshotPlainData(value: unknown):
  | Readonly<{ ok: true; value: PlainValue; digest: string }>
  | Readonly<{
      ok: false;
      reason: SnapshotFailureReason;
      path: string;
      witness_digest: string;
    }> {
  class SnapshotFailure {
    readonly ok = false as const;

    constructor(
      readonly reason: SnapshotFailureReason,
      readonly path: string,
      readonly witness_digest: string,
    ) {}
  }
  const seen = new WeakSet<object>();
  let nodes = 0;
  let properties = 0;
  let stringBytes = 0;

  function failure(reason: SnapshotFailureReason, path: string) {
    return new SnapshotFailure(
      reason,
      path,
      prefixedDigest("action_652a_snapshot_rejection", {
        policy_version: action652aSnapshotPolicyVersion,
        reason,
        path,
        nodes,
        properties,
        string_bytes: stringBytes,
      }),
    );
  }

  function visit(
    current: unknown,
    path: string,
    depth: number,
  ): PlainValue | ReturnType<typeof failure> {
    if (typeof current === "string") {
      stringBytes += Buffer.byteLength(current, "utf8");
      if (stringBytes > snapshotBudget.maximum_string_bytes) {
        return failure("snapshot_budget_exceeded", path);
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
      return failure("non_plain_data_rejected", path);
    }
    if (nodeTypes.isProxy(current)) return failure("proxy_rejected", path);
    if (seen.has(current)) return failure("cycle_rejected", path);
    if (depth > snapshotBudget.maximum_depth) {
      return failure("snapshot_budget_exceeded", path);
    }

    const prototype = Object.getPrototypeOf(current);
    if (
      !Array.isArray(current) &&
      prototype !== Object.prototype &&
      prototype !== null
    ) {
      return failure("non_plain_data_rejected", path);
    }

    nodes += 1;
    if (nodes > snapshotBudget.maximum_nodes) {
      return failure("snapshot_budget_exceeded", path);
    }
    seen.add(current);

    let descriptors: PropertyDescriptorMap;
    try {
      descriptors = Object.getOwnPropertyDescriptors(current);
    } catch {
      return failure("descriptor_inspection_failed", path);
    }
    const keys = Reflect.ownKeys(descriptors);
    if (keys.some((key) => typeof key !== "string")) {
      return failure("non_plain_data_rejected", path);
    }
    properties += keys.length;
    if (properties > snapshotBudget.maximum_properties) {
      return failure("snapshot_budget_exceeded", path);
    }

    if (Array.isArray(current)) {
      const lengthDescriptor = descriptors.length;
      if (
        !lengthDescriptor ||
        "get" in lengthDescriptor ||
        typeof lengthDescriptor.value !== "number"
      ) {
        return failure("descriptor_inspection_failed", path);
      }
      const result: PlainValue[] = [];
      for (let index = 0; index < lengthDescriptor.value; index += 1) {
        const descriptor = descriptors[String(index)];
        if (!descriptor || descriptor.get || descriptor.set) {
          return failure("accessor_rejected", `${path}[${index}]`);
        }
        const nested = visit(descriptor.value, `${path}[${index}]`, depth + 1);
        if (nested instanceof SnapshotFailure) return nested;
        result.push(nested as PlainValue);
      }
      return result;
    }

    const result: Record<string, PlainValue> = {};
    for (const key of (keys as string[]).sort()) {
      const descriptor = descriptors[key];
      if (!descriptor || descriptor.get || descriptor.set) {
        return failure("accessor_rejected", `${path}.${key}`);
      }
      const nested = visit(descriptor.value, `${path}.${key}`, depth + 1);
      if (nested instanceof SnapshotFailure) return nested;
      result[key] = nested as PlainValue;
    }
    return result;
  }

  const result = visit(value, "$", 0);
  if (result instanceof SnapshotFailure) {
    return deepFreezeAction650s({
      ok: false as const,
      reason: result.reason,
      path: result.path,
      witness_digest: result.witness_digest,
    });
  }
  const frozen = deepFreezeAction650s(result) as PlainValue;
  return deepFreezeAction650s({
    ok: true as const,
    value: frozen,
    digest: prefixedDigest("action_652a_snapshot", {
      policy_version: action652aSnapshotPolicyVersion,
      value: frozen,
    }),
  });
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return (
    actual.length === wanted.length &&
    actual.every((key, index) => key === wanted[index])
  );
}

function integer(value: unknown, options: { positive?: boolean } = {}) {
  if (typeof value !== "string" || !/^(?:0|[1-9]\d*)$/.test(value)) return null;
  try {
    const parsed = BigInt(value);
    if ((options.positive && parsed <= 0) || parsed > signedI128Maximum) return null;
    return parsed;
  } catch {
    return null;
  }
}

function instant(value: unknown) {
  return canonicalizeAction650uNanosecondInstant(value);
}

function canonicalAuthorityProjection(
  authority: Omit<Action652aExternalRiskAuthority, "envelope_digest">,
) {
  return {
    contract_version: authority.contract_version,
    policy: authority.policy,
    snapshot: authority.snapshot,
    market_authority: authority.market_authority,
  };
}

export function rebuildAction652aExternalRiskPolicyDigest(
  policy: Omit<Action652aExternalRiskAuthority["policy"], "digest">,
) {
  return prefixedDigest("action_652a_risk_policy", policy);
}

export function rebuildAction652aExternalRiskSnapshotDigest(
  snapshot: Omit<Action652aExternalRiskAuthority["snapshot"], "digest">,
) {
  return prefixedDigest("action_652a_risk_snapshot", snapshot);
}

export function rebuildAction652aRiskEnvelopeDigest(
  authority: Omit<Action652aExternalRiskAuthority, "envelope_digest">,
) {
  return prefixedDigest(
    "action_652a_risk_envelope",
    canonicalAuthorityProjection(authority),
  );
}

/**
 * External-owner boundary. Admission callers can only pass the opaque returned
 * handle; supplying or cloning policy/limit fields does not grant provenance.
 */
export function createAction652aExternalRiskAuthority(
  input: Action652aExternalRiskAuthorityInput,
): Action652aExternalRiskAuthority | null {
  const captured = snapshotPlainData(input);
  if (!captured.ok) return null;
  const root = objectValue(captured.value);
  const policyInput = objectValue(root?.policy);
  const snapshotInput = objectValue(root?.snapshot);
  const marketInput = objectValue(root?.market_authority);
  if (
    !root ||
    !policyInput ||
    !snapshotInput ||
    !marketInput ||
    !exactKeys(root, ["policy", "snapshot", "market_authority"])
  ) {
    return null;
  }

  const allowlist = Array.isArray(policyInput.symbol_allowlist)
    ? [...new Set(policyInput.symbol_allowlist)]
        .filter((symbol): symbol is string => typeof symbol === "string" && Boolean(symbol.trim()))
        .map((symbol) => symbol.trim().toUpperCase())
        .sort()
    : [];
  const policyInstants = [
    instant(policyInput.effective_at),
    instant(policyInput.expires_at),
  ];
  const snapshotInstants = [
    instant(snapshotInput.observed_at),
    instant(snapshotInput.finalized_at),
    instant(snapshotInput.expires_at),
  ];
  const marketInstants = [
    instant(marketInput.session_open_at),
    instant(marketInput.session_close_at),
  ];
  const numericPolicyKeys = [
    "maximum_quantity_units",
    "maximum_notional_micros",
    "reference_price_micros",
    "maximum_daily_orders",
    "maximum_daily_notional_micros",
    "maximum_cash_use_micros",
    "maximum_exposure_micros",
    "maximum_open_intents",
    "maximum_open_intent_notional_micros",
    "maximum_snapshot_age_nanoseconds",
  ] as const;
  const numericSnapshotKeys = [
    "cash_available_micros",
    "exposure_micros",
    "open_intent_count",
    "open_intent_notional_micros",
    "daily_order_count",
    "daily_notional_micros",
  ] as const;

  if (
    allowlist.length === 0 ||
    policyInstants.some((value) => !value) ||
    snapshotInstants.some((value) => !value) ||
    marketInstants.some((value) => !value) ||
    numericPolicyKeys.some((key) => integer(policyInput[key], { positive: true }) === null) ||
    integer(policyInput.maximum_price_deviation_ppm) === null ||
    numericSnapshotKeys.some((key) => integer(snapshotInput[key]) === null) ||
    policyInput.quantity_scale !== 0 ||
    policyInput.price_scale !== 6 ||
    policyInput.notional_scale !== 6 ||
    policyInput.currency !== "SEK" ||
    typeof snapshotInput.finalized !== "boolean" ||
    marketInput.session_type !== "synthetic_regular"
  ) {
    return null;
  }

  const policyWithoutDigest = {
    ...(policyInput as Omit<Action652aExternalRiskAuthority["policy"], "digest">),
    symbol_allowlist: allowlist,
    effective_at: policyInstants[0]!.canonical_instant,
    expires_at: policyInstants[1]!.canonical_instant,
  };
  const policy = {
    ...policyWithoutDigest,
    digest: rebuildAction652aExternalRiskPolicyDigest(policyWithoutDigest),
  };
  if (snapshotInput.policy_digest !== policy.digest) return null;

  const snapshotWithoutDigest = {
    ...(snapshotInput as Omit<Action652aExternalRiskAuthority["snapshot"], "digest">),
    observed_at: snapshotInstants[0]!.canonical_instant,
    finalized_at: snapshotInstants[1]!.canonical_instant,
    expires_at: snapshotInstants[2]!.canonical_instant,
  };
  const snapshot = {
    ...snapshotWithoutDigest,
    digest: rebuildAction652aExternalRiskSnapshotDigest(snapshotWithoutDigest),
  };
  const marketAuthority = {
    ...(marketInput as Action652aExternalRiskAuthority["market_authority"]),
    session_open_at: marketInstants[0]!.canonical_instant,
    session_close_at: marketInstants[1]!.canonical_instant,
  };
  const withoutEnvelope = {
    contract_version: action652aExternalRiskAuthorityPolicyVersion,
    policy,
    snapshot,
    market_authority: marketAuthority,
  };
  const authority = deepFreezeAction650s({
    ...withoutEnvelope,
    envelope_digest: rebuildAction652aRiskEnvelopeDigest(withoutEnvelope),
  }) as Action652aExternalRiskAuthority;
  authorityProvenance.add(authority);
  return authority;
}

function authorityDigestIsValid(authority: Action652aExternalRiskAuthority) {
  const { digest: policyDigest, ...policy } = authority.policy;
  const { digest: snapshotDigest, ...snapshot } = authority.snapshot;
  const { envelope_digest: envelopeDigest, ...withoutEnvelope } = authority;
  return (
    policyDigest === rebuildAction652aExternalRiskPolicyDigest(policy) &&
    snapshotDigest === rebuildAction652aExternalRiskSnapshotDigest(snapshot) &&
    snapshot.policy_digest === policyDigest &&
    envelopeDigest === rebuildAction652aRiskEnvelopeDigest(withoutEnvelope)
  );
}

function toPreparedScaledValues(prepared: Action650sPreparedExecution) {
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
  const notional = quantityUnits * priceMicros;
  if (notional > signedI128Maximum) return null;
  return { quantityUnits, priceMicros, notional };
}

function classifyTemporal(
  admissionAt: Action650uCanonicalInstant,
  intentCreated: Action650uCanonicalInstant,
  intentExpires: Action650uCanonicalInstant,
  authority: Action652aExternalRiskAuthority,
): Readonly<
  | { ok: false; reason: Action652aAdmissionReason }
  | {
      ok: true;
      projection: NonNullable<Action652aAdmissionResult["temporal_projection"]>;
    }
> {
  const policyEffective = instant(authority.policy.effective_at)!;
  const policyExpires = instant(authority.policy.expires_at)!;
  const snapshotObserved = instant(authority.snapshot.observed_at)!;
  const snapshotFinalized = instant(authority.snapshot.finalized_at)!;
  const snapshotExpires = instant(authority.snapshot.expires_at)!;
  const sessionOpen = instant(authority.market_authority.session_open_at)!;
  const sessionClose = instant(authority.market_authority.session_close_at)!;
  if (compareAction650uInstants(admissionAt, policyEffective) < 0) {
    return { ok: false, reason: "risk_policy_not_effective" };
  }
  if (compareAction650uInstants(admissionAt, policyExpires) >= 0) {
    return { ok: false, reason: "risk_policy_expired" };
  }
  if (compareAction650uInstants(admissionAt, intentCreated) < 0) {
    return { ok: false, reason: "intent_not_effective" };
  }
  if (compareAction650uInstants(admissionAt, intentExpires) >= 0) {
    return { ok: false, reason: "intent_expired" };
  }
  if (
    compareAction650uInstants(admissionAt, sessionOpen) < 0 ||
    compareAction650uInstants(admissionAt, sessionClose) >= 0
  ) {
    return { ok: false, reason: "market_session_closed" };
  }
  if (!authority.snapshot.finalized) {
    return { ok: false, reason: "snapshot_not_finalized" };
  }
  if (
    compareAction650uInstants(snapshotObserved, admissionAt) > 0 ||
    compareAction650uInstants(snapshotFinalized, admissionAt) > 0 ||
    compareAction650uInstants(snapshotObserved, snapshotFinalized) > 0
  ) {
    return { ok: false, reason: "snapshot_from_future" };
  }
  if (compareAction650uInstants(admissionAt, snapshotExpires) >= 0) {
    return { ok: false, reason: "snapshot_expired" };
  }
  const age =
    BigInt(admissionAt.epoch_nanoseconds) -
    BigInt(snapshotObserved.epoch_nanoseconds);
  if (age > BigInt(authority.policy.maximum_snapshot_age_nanoseconds)) {
    return { ok: false, reason: "snapshot_too_old" };
  }
  return {
    ok: true,
    projection: {
      admission_at: admissionAt.canonical_instant,
      policy_effective_at: policyEffective.canonical_instant,
      policy_expires_at: policyExpires.canonical_instant,
      intent_created_at: intentCreated.canonical_instant,
      intent_expires_at: intentExpires.canonical_instant,
      snapshot_observed_at: snapshotObserved.canonical_instant,
      snapshot_finalized_at: snapshotFinalized.canonical_instant,
      snapshot_expires_at: snapshotExpires.canonical_instant,
      session_open_at: sessionOpen.canonical_instant,
      session_close_at: sessionClose.canonical_instant,
      snapshot_age_nanoseconds: age.toString(),
    },
  };
}

function statusForReason(reason: Action652aAdmissionReason): Action652aAdmissionStatus {
  if (
    reason === "risk_policy_not_effective" ||
    reason === "risk_policy_expired" ||
    reason === "intent_not_effective" ||
    reason === "intent_expired" ||
    reason === "market_session_closed" ||
    reason === "snapshot_not_finalized" ||
    reason === "snapshot_from_future" ||
    reason === "snapshot_expired" ||
    reason === "snapshot_too_old"
  ) {
    return "not_point_in_time_safe";
  }
  if (
    reason === "instrument_not_allowed" ||
    reason.endsWith("_limit_exceeded")
  ) {
    return "rejected";
  }
  if (
    reason === "admission_input_incomplete" ||
    reason === "input_snapshot_rejected" ||
    reason === "numeric_value_invalid" ||
    reason === "numeric_overflow"
  ) {
    return "incomplete";
  }
  return "conflicting";
}

function terminalProjection(
  result: Omit<Action652aAdmissionResult, "terminal_digest">,
) {
  return {
    contract_version: result.contract_version,
    gate_status: result.gate_status,
    admission_status: result.admission_status,
    admission_reason: result.admission_reason,
    lineage: result.lineage,
    intent_projection: result.intent_projection,
    risk_authority_projection: result.risk_authority_projection,
    temporal_projection: result.temporal_projection,
    observed_input_digests: result.observed_input_digests,
    failure_provenance: result.failure_provenance,
    manual_confirmation_admission: result.manual_confirmation_admission,
    safety: result.safety,
    effects: result.effects,
  };
}

export function rebuildAction652aAdmissionTerminalDigest(
  result: Omit<Action652aAdmissionResult, "terminal_digest">,
) {
  return prefixedDigest("action_652a_admission_terminal", terminalProjection(result));
}

function finish(
  fields: Omit<
    Action652aAdmissionResult,
    "contract_version" | "gate_status" | "safety" | "effects" | "terminal_digest"
  >,
) {
  const withoutTerminal = {
    contract_version: action652aExecutionRiskEnvelopeContractVersion,
    gate_status: "enabled" as const,
    ...fields,
    safety,
    effects: activeEffects,
  };
  const result = deepFreezeAction650s({
    ...withoutTerminal,
    terminal_digest: rebuildAction652aAdmissionTerminalDigest(withoutTerminal),
  }) as Action652aAdmissionResult;
  if (result.admission_status === "admitted") admittedResultProvenance.add(result);
  return result;
}

function failure(
  reason: Action652aAdmissionReason,
  observed: Action652aAdmissionResult["observed_input_digests"],
  partial: Partial<
    Pick<
      Action652aAdmissionResult,
      "lineage" | "intent_projection" | "risk_authority_projection" | "temporal_projection"
    >
  > = {},
) {
  const failureCore = {
    reason,
    observed_rejected_input_digests: observed,
  };
  return finish({
    admission_status: statusForReason(reason),
    admission_reason: reason,
    lineage: partial.lineage ?? null,
    intent_projection: partial.intent_projection ?? null,
    risk_authority_projection: partial.risk_authority_projection ?? null,
    temporal_projection: partial.temporal_projection ?? null,
    observed_input_digests: observed,
    failure_provenance: {
      ...failureCore,
      failure_digest: prefixedDigest("action_652a_admission_failure", failureCore),
    },
    manual_confirmation_admission: false,
  });
}

function observedDigests(
  snapshotDigest: string | null,
  request: Record<string, unknown> | null,
  rejection: string | null = null,
): Action652aAdmissionResult["observed_input_digests"] {
  return deepFreezeAction650s({
    request_digest: snapshotDigest,
    preparation_digest: request?.prepared
      ? prefixedDigest("action_652a_observed_preparation", request.prepared)
      : null,
    intent_digest: request?.intent
      ? prefixedDigest("action_652a_observed_intent", request.intent)
      : null,
    authority_digest: request?.external_risk_authority
      ? prefixedDigest(
          "action_652a_observed_authority",
          request.external_risk_authority,
        )
      : null,
    rejected_input_digest: rejection,
  });
}

export function runAction652aExecutionIntentAdmission(
  gate: Action652aAdmissionGate,
  request: unknown,
): Action652aAdmissionResult {
  if (gate.enabled !== true) return disabledResult;
  if (gate.kill_switch_active === true) return killSwitchResult;

  const captured = snapshotPlainData(request);
  if (!captured.ok) {
    return failure(
      "input_snapshot_rejected",
      observedDigests(null, null, captured.witness_digest),
    );
  }
  const root = objectValue(captured.value);
  const originalRoot = objectValue(request);
  if (!root || !originalRoot) {
    return failure(
      "admission_input_incomplete",
      observedDigests(captured.digest, root),
    );
  }
  if (
    !exactKeys(root, [
      "prepared",
      "intent",
      "external_risk_authority",
      "admission_at",
    ])
  ) {
    return failure(
      "admission_input_shape_conflicting",
      observedDigests(captured.digest, root),
    );
  }

  const preparedSnapshot = root.prepared as unknown as Action650sPreparedExecution;
  const intentSnapshot = objectValue(root.intent);
  const authoritySnapshot =
    root.external_risk_authority as unknown as Action652aExternalRiskAuthority;
  const originalPrepared = originalRoot.prepared;
  const originalAuthority = originalRoot.external_risk_authority;
  const observed = observedDigests(captured.digest, root);
  if (!intentSnapshot || !objectValue(preparedSnapshot) || !objectValue(authoritySnapshot)) {
    return failure("admission_input_incomplete", observed);
  }
  if (!hasAction650sPreparedExecutionProvenance(originalPrepared)) {
    return failure("preparation_provenance_unproven", observed);
  }
  if (
    !originalAuthority ||
    typeof originalAuthority !== "object" ||
    !authorityProvenance.has(originalAuthority)
  ) {
    return failure("risk_authority_provenance_unproven", observed);
  }
  if (!authorityDigestIsValid(authoritySnapshot)) {
    return failure("risk_authority_digest_conflicting", observed);
  }

  const lineage = deepFreezeAction650s({
    execution_identity:
      preparedSnapshot.runtime_identity_context.execution_identity ?? null,
    lifecycle_identity:
      preparedSnapshot.runtime_identity_context.lifecycle_identity ?? null,
    preparation_trace_identity: preparedSnapshot.trace_identity ?? null,
    handoff_identity: preparedSnapshot.handoff.identity.handoff_identity ?? null,
    handoff_digest: preparedSnapshot.handoff.identity.handoff_digest ?? null,
    canonical_order_payload_digest:
      preparedSnapshot.handoff.identity.canonical_order_payload_digest ?? null,
    idempotency_identity:
      preparedSnapshot.handoff.identity.idempotency_identity ?? null,
    session_identity:
      typeof intentSnapshot.session_identity === "string"
        ? intentSnapshot.session_identity
        : null,
  });
  const authorityProjection = deepFreezeAction650s({
    policy_identity: authoritySnapshot.policy.identity,
    policy_version: authoritySnapshot.policy.version,
    policy_digest: authoritySnapshot.policy.digest,
    snapshot_identity: authoritySnapshot.snapshot.identity,
    snapshot_digest: authoritySnapshot.snapshot.digest,
    market_authority_identity: authoritySnapshot.market_authority.identity,
    market_authority_digest: authoritySnapshot.market_authority.digest,
    calendar_identity: authoritySnapshot.market_authority.calendar_identity,
    calendar_version: authoritySnapshot.market_authority.calendar_version,
    calendar_digest: authoritySnapshot.market_authority.calendar_digest,
    envelope_digest: authoritySnapshot.envelope_digest,
  });

  if (
    intentSnapshot.execution_identity !== lineage.execution_identity ||
    intentSnapshot.preparation_trace_identity !== lineage.preparation_trace_identity ||
    intentSnapshot.handoff_identity !== lineage.handoff_identity ||
    intentSnapshot.instrument !== preparedSnapshot.handoff.payload.ticker ||
    intentSnapshot.side !== preparedSnapshot.handoff.payload.side
  ) {
    return failure("execution_lineage_conflicting", observed, {
      lineage,
      risk_authority_projection: authorityProjection,
    });
  }
  if (
    intentSnapshot.session_identity !== authoritySnapshot.snapshot.session_identity ||
    intentSnapshot.session_identity !==
      authoritySnapshot.market_authority.session_identity
  ) {
    return failure("session_identity_conflicting", observed, {
      lineage,
      risk_authority_projection: authorityProjection,
    });
  }

  const quantity = objectValue(intentSnapshot.quantity);
  const limitPrice = objectValue(intentSnapshot.limit_price);
  const notional = objectValue(intentSnapshot.notional);
  if (!quantity || !limitPrice || !notional) {
    return failure("admission_input_incomplete", observed, {
      lineage,
      risk_authority_projection: authorityProjection,
    });
  }
  if (
    quantity.scale !== 0 ||
    quantity.unit !== "units" ||
    limitPrice.scale !== 6 ||
    limitPrice.unit !== "SEK_micros_per_unit" ||
    notional.scale !== 6 ||
    notional.unit !== "SEK_micros"
  ) {
    return failure("intent_scale_or_unit_conflicting", observed, {
      lineage,
      risk_authority_projection: authorityProjection,
    });
  }
  const quantityValue = integer(quantity.value, { positive: true });
  const priceValue = integer(limitPrice.value, { positive: true });
  const notionalValue = integer(notional.value, { positive: true });
  if (quantityValue === null || priceValue === null || notionalValue === null) {
    const rawValues = [quantity.value, limitPrice.value, notional.value];
    const overflow = rawValues.some(
      (value) =>
        typeof value === "string" &&
        /^(?:0|[1-9]\d*)$/.test(value) &&
        (() => {
          try {
            return BigInt(value) > signedI128Maximum;
          } catch {
            return false;
          }
        })(),
    );
    return failure(overflow ? "numeric_overflow" : "numeric_value_invalid", observed, {
      lineage,
      risk_authority_projection: authorityProjection,
    });
  }
  const recomputedNotional = quantityValue * priceValue;
  if (recomputedNotional > signedI128Maximum) {
    return failure("numeric_overflow", observed, {
      lineage,
      risk_authority_projection: authorityProjection,
    });
  }
  if (recomputedNotional !== notionalValue) {
    return failure("intent_notional_conflicting", observed, {
      lineage,
      risk_authority_projection: authorityProjection,
    });
  }
  const preparedValues = toPreparedScaledValues(preparedSnapshot);
  if (
    !preparedValues ||
    preparedValues.quantityUnits !== quantityValue ||
    preparedValues.priceMicros !== priceValue ||
    preparedValues.notional !== notionalValue
  ) {
    return failure("execution_lineage_conflicting", observed, {
      lineage,
      risk_authority_projection: authorityProjection,
    });
  }

  const intentCreated = instant(intentSnapshot.intent_created_at);
  const intentExpires = instant(intentSnapshot.intent_expires_at);
  const admissionAt = instant(root.admission_at);
  if (!intentCreated || !intentExpires || !admissionAt) {
    return failure("admission_input_incomplete", observed, {
      lineage,
      risk_authority_projection: authorityProjection,
    });
  }
  const temporal = classifyTemporal(
    admissionAt,
    intentCreated,
    intentExpires,
    authoritySnapshot,
  );
  if (!temporal.ok) {
    return failure(temporal.reason, observed, {
      lineage,
      risk_authority_projection: authorityProjection,
    });
  }

  const intentProjection = deepFreezeAction650s({
    instrument: intentSnapshot.instrument as string,
    side: intentSnapshot.side as "BUY" | "SELL",
    quantity: {
      value: quantityValue.toString(),
      scale: 0,
      unit: "units",
    },
    limit_price: {
      value: priceValue.toString(),
      scale: 6,
      unit: "SEK_micros_per_unit",
    },
    notional: {
      value: notionalValue.toString(),
      scale: 6,
      unit: "SEK_micros",
    },
    intent_created_at: intentCreated.canonical_instant,
    intent_expires_at: intentExpires.canonical_instant,
  });
  const policy = authoritySnapshot.policy;
  const account = authoritySnapshot.snapshot;
  const referencePrice = BigInt(policy.reference_price_micros);
  const checks: readonly [boolean, Action652aAdmissionReason][] = [
    [
      policy.symbol_allowlist.includes(intentProjection.instrument),
      "instrument_not_allowed",
    ],
    [quantityValue <= BigInt(policy.maximum_quantity_units), "quantity_limit_exceeded"],
    [notionalValue <= BigInt(policy.maximum_notional_micros), "notional_limit_exceeded"],
    [
      (priceValue > referencePrice ? priceValue - referencePrice : referencePrice - priceValue) *
        ppmScale <=
        referencePrice * BigInt(policy.maximum_price_deviation_ppm),
      "price_deviation_limit_exceeded",
    ],
    [
      BigInt(account.daily_order_count) + BigInt(1) <=
        BigInt(policy.maximum_daily_orders),
      "daily_order_limit_exceeded",
    ],
    [
      BigInt(account.daily_notional_micros) + notionalValue <=
        BigInt(policy.maximum_daily_notional_micros),
      "daily_notional_limit_exceeded",
    ],
    [
      intentProjection.side !== "BUY" ||
        (notionalValue <= BigInt(account.cash_available_micros) &&
          notionalValue <= BigInt(policy.maximum_cash_use_micros)),
      "cash_limit_exceeded",
    ],
    [
      BigInt(account.exposure_micros) + notionalValue <=
        BigInt(policy.maximum_exposure_micros),
      "exposure_limit_exceeded",
    ],
    [
      BigInt(account.open_intent_count) + BigInt(1) <=
        BigInt(policy.maximum_open_intents),
      "open_intent_limit_exceeded",
    ],
    [
      BigInt(account.open_intent_notional_micros) + notionalValue <=
        BigInt(policy.maximum_open_intent_notional_micros),
      "open_intent_limit_exceeded",
    ],
  ];
  const failed = checks.find(([accepted]) => !accepted);
  if (failed) {
    return failure(failed[1], observed, {
      lineage,
      intent_projection: intentProjection,
      risk_authority_projection: authorityProjection,
      temporal_projection: temporal.projection,
    });
  }

  const canonicalObserved = deepFreezeAction650s({
    ...observed,
    request_digest: prefixedDigest("action_652a_observed_request", {
      preparation: preparedSnapshot,
      intent: intentProjection,
      external_risk_authority: authoritySnapshot,
      admission_at: temporal.projection.admission_at,
    }),
    intent_digest: prefixedDigest(
      "action_652a_observed_intent",
      intentProjection,
    ),
  });
  const admissionSeed = {
    lineage,
    intent_projection: intentProjection,
    risk_authority_projection: authorityProjection,
    temporal_projection: temporal.projection,
    observed_input_digests: canonicalObserved,
  };
  const admissionDigest = prefixedDigest("action_652a_manual_confirmation_gate", admissionSeed);
  return finish({
    admission_status: "admitted",
    admission_reason: "risk_envelope_satisfied",
    lineage,
    intent_projection: intentProjection,
    risk_authority_projection: authorityProjection,
    temporal_projection: temporal.projection,
    observed_input_digests: canonicalObserved,
    failure_provenance: null,
    manual_confirmation_admission: {
      permitted: true,
      admission_identity: `action_652a_admission_${hashAction650sCanonicalValue(
        admissionSeed,
      ).slice(0, 24)}`,
      admission_digest: admissionDigest,
    },
  });
}

export function canAction652aProceedToManualConfirmation(value: unknown) {
  if (
    !value ||
    typeof value !== "object" ||
    !admittedResultProvenance.has(value as object)
  ) {
    return false;
  }
  const result = value as Action652aAdmissionResult;
  if (
    !Object.isFrozen(result) ||
    result.admission_status !== "admitted" ||
    result.manual_confirmation_admission === false ||
    result.terminal_digest === null
  ) {
    return false;
  }
  const { terminal_digest: terminalDigest, ...withoutTerminal } = result;
  return (
    terminalDigest === rebuildAction652aAdmissionTerminalDigest(withoutTerminal)
  );
}
