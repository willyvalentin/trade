import {
  containsAction650sRestrictedMaterial,
  deepFreezeAction650s,
  hashAction650sCanonicalValue,
} from "@/lib/action-650s-execution-identity";
import {
  hasAction650sPreparedExecutionProvenance,
  type Action650sPreparedExecution,
} from "@/lib/action-650s-execution-preparation";
import {
  replayAction650uConfirmedExecution,
  type Action650uConfirmedExecutionReplayResult,
  type Action650uSimulatedBrokerEvent,
} from "@/lib/action-650u-confirmed-execution-replay";
import {
  getAction650uManualConfirmationConsumptionState,
  rebuildAction650uConsumptionProjectionDigest,
  rebuildAction650uConsumptionReceiptDigest,
  verifyAction650uManualConfirmationCapability,
  type Action650uManualConfirmationBoundary,
  type Action650uManualConfirmationCapability,
} from "@/lib/action-650u-manual-confirmation";
import {
  canonicalizeAction650uNanosecondInstant,
  compareAction650uInstants,
  type Action650uCanonicalInstant,
} from "@/lib/action-650u-temporal-confirmation-policy";

export const action651aDiagnosticExecutionQualityContractVersion =
  "action_651a_diagnostic_execution_quality_audit_v1" as const;
export const action651aDiagnosticPolicyVersion =
  "action_651a_diagnostic_execution_quality_policy_v1" as const;

export type Action651aAuditStatus =
  | "audited"
  | "incomplete"
  | "conflicting"
  | "not_point_in_time_safe"
  | "unmappable";

export type Action651aFailureKind =
  | "none"
  | "confirmation_missing"
  | "confirmation_late"
  | "confirmation_expired"
  | "confirmation_conflicting"
  | "confirmed_replay_incomplete"
  | "confirmed_replay_conflicting"
  | "price_observation_not_point_in_time_safe"
  | "diagnostic_input_unmappable";

export type Action651aDiagnosticSafety = Readonly<{
  diagnostic_only: true;
  real_broker_evidence: false;
  performance_eligible: false;
  automatic_execution_allowed: false;
  real_broker_submission: false;
  avanza_live_access: false;
  credential_access: false;
  automatic_execution: false;
  trade_mutation: false;
  production_write: false;
}>;

export type Action651aLineageProjection = Readonly<{
  execution_identity: string;
  lifecycle_identity: string;
  runtime_identity_context_digest: string;
  handoff_identity: string;
  handoff_digest: string;
  canonical_order_payload_digest: string;
  confirmation_request_digest: string | null;
  confirmation_capability_digest: string | null;
  confirmation_receipt_digest: string | null;
  session_identity: string | null;
  idempotency_identity: string;
  correlation_identity: string;
  confirmed_replay_trace_identity: string | null;
  confirmed_replay_evidence_digest: string | null;
  terminal_digest: string | null;
  lineage_digest: string;
}>;

export type Action651aTimingProjection = Readonly<{
  precision: "nanoseconds";
  planned_at: string;
  waiting_for_manual_confirmation_at: string;
  confirmed_at: string;
  simulated_submission_at: string;
  simulated_terminal_at: string;
  planned_to_waiting_nanoseconds: string;
  waiting_to_confirmation_nanoseconds: string;
  confirmation_to_simulated_submission_nanoseconds: string;
  simulated_submission_to_simulated_terminal_nanoseconds: string;
  projection_digest: string;
}>;

export type Action651aPlannedPriceProjection = Readonly<{
  source: "verified_execution_preparation";
  ticker: string;
  side: "BUY" | "SELL";
  quantity: string;
  order_type: "LIMIT" | "MARKET" | "STOP_LIMIT";
  planned_limit_price: string | null;
  planned_stop_price: string | null;
  canonical_order_payload_digest: string;
  projection_digest: string;
}>;

export type Action651aConfirmedPriceProjection = Readonly<{
  source: "synthetic_manual_confirmation_fixture";
  price_micros: string;
  observed_at: string;
  confirmation_capability_digest: string;
  point_in_time_safe: boolean;
  projection_digest: string;
}>;

export type Action651aSyntheticFillProjection = Readonly<{
  source: "synthetic_replay_fixture";
  price_micros: string;
  quantity: string;
  observed_at: string;
  terminal_digest: string;
  signed_slippage_vs_confirmed_micros: string;
  adverse_slippage_vs_confirmed_micros: string;
  calculation:
    | "synthetic_fill_minus_synthetic_confirmed"
    | "synthetic_confirmed_minus_synthetic_fill";
  projection_digest: string;
}>;

export type Action651aFailureProvenance = Readonly<{
  failure_kind: Action651aFailureKind;
  source_reason: string | null;
  evidence_digest: string;
}>;

export type Action651aDiagnosticAuditResult = Readonly<{
  contract_version: typeof action651aDiagnosticExecutionQualityContractVersion;
  policy_version: typeof action651aDiagnosticPolicyVersion;
  gate_status: "enabled" | "disabled" | "kill_switch_active";
  audit_status: Action651aAuditStatus;
  failure_provenance: Action651aFailureProvenance | null;
  lineage: Action651aLineageProjection | null;
  timing_projection: Action651aTimingProjection | null;
  planned_price_projection: Action651aPlannedPriceProjection | null;
  confirmed_price_projection: Action651aConfirmedPriceProjection | null;
  synthetic_fill_projection: Action651aSyntheticFillProjection | null;
  safety: Action651aDiagnosticSafety;
  effects: Readonly<{
    audit_records_persisted: 0;
    provider_calls: 0;
    database_writes: 0;
    order_mutations: 0;
    trade_mutations: 0;
    position_mutations: 0;
    process_spawns: 0;
  }>;
  audit_evidence_digest: string | null;
}>;

export type Action651aConfirmedPriceObservation = Readonly<{
  source: "synthetic_manual_confirmation_fixture";
  price_micros: unknown;
  observed_at: unknown;
}>;

export type Action651aSyntheticFillObservation = Readonly<{
  source: "synthetic_replay_fixture";
  price_micros: unknown;
}>;

export type Action651aDiagnosticAuditInput = Readonly<{
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

const zeroEffects = Object.freeze({
  audit_records_persisted: 0 as const,
  provider_calls: 0 as const,
  database_writes: 0 as const,
  order_mutations: 0 as const,
  trade_mutations: 0 as const,
  position_mutations: 0 as const,
  process_spawns: 0 as const,
});

const disabledResult: Action651aDiagnosticAuditResult = Object.freeze({
  contract_version: action651aDiagnosticExecutionQualityContractVersion,
  policy_version: action651aDiagnosticPolicyVersion,
  gate_status: "disabled",
  audit_status: "incomplete",
  failure_provenance: null,
  lineage: null,
  timing_projection: null,
  planned_price_projection: null,
  confirmed_price_projection: null,
  synthetic_fill_projection: null,
  safety,
  effects: zeroEffects,
  audit_evidence_digest: null,
});

const killedResult: Action651aDiagnosticAuditResult = Object.freeze({
  ...disabledResult,
  gate_status: "kill_switch_active",
});

function canonicalUnsignedInteger(value: unknown, allowZero = false) {
  if (typeof value !== "string") return null;
  const pattern = allowZero ? /^(?:0|[1-9]\d*)$/ : /^[1-9]\d*$/;
  return pattern.test(value) ? value : null;
}

function decimalNumber(value: number | null) {
  return value === null ? null : String(value);
}

function deltaNanoseconds(
  start: Action650uCanonicalInstant,
  end: Action650uCanonicalInstant,
) {
  const delta =
    BigInt(end.epoch_nanoseconds) - BigInt(start.epoch_nanoseconds);
  return delta >= 0 ? delta.toString() : null;
}

function expectedCapabilityBinding(prepared: Action650sPreparedExecution) {
  return {
    execution_identity: prepared.runtime_identity_context.execution_identity,
    lifecycle_identity: prepared.runtime_identity_context.lifecycle_identity,
    runtime_identity_context_digest: prepared.runtime_identity_context_digest,
    handoff_identity: prepared.handoff.identity.handoff_identity,
    handoff_digest: prepared.handoff.identity.handoff_digest,
    canonical_order_payload_digest:
      prepared.handoff.identity.canonical_order_payload_digest,
    broker_request_identity:
      prepared.handoff.identity.broker_request_identity,
    idempotency_identity: prepared.handoff.identity.idempotency_identity,
    correlation_identity: prepared.handoff.identity.correlation_identity,
    ticker: prepared.handoff.payload.ticker,
    side: prepared.handoff.payload.side,
    quantity: prepared.handoff.payload.quantity,
    order_type: prepared.handoff.payload.order_type,
    limit_price: prepared.handoff.payload.limit_price,
    stop_price: prepared.handoff.payload.stop_price,
    execution_mode: prepared.handoff.payload.execution_mode,
  };
}

function capabilityMatchesPrepared(
  capability: Action650uManualConfirmationCapability,
  prepared: Action650sPreparedExecution,
) {
  return Object.entries(expectedCapabilityBinding(prepared)).every(
    ([key, value]) =>
      capability[key as keyof Action650uManualConfirmationCapability] === value,
  );
}

function verifyReplayDigest(replay: Action650uConfirmedExecutionReplayResult) {
  const {
    trace_identity: _trace,
    audit_result_evidence_digest: _evidence,
    ...base
  } = replay;
  void _trace;
  void _evidence;
  const evidence =
    `action_650u_audit_result_evidence_${hashAction650sCanonicalValue(base)}`;
  const trace = `action_650u_confirmed_replay_${hashAction650sCanonicalValue({
    ...base,
    audit_result_evidence_digest: evidence,
  })}`;
  return (
    replay.audit_result_evidence_digest === evidence &&
    replay.trace_identity === trace
  );
}

function normalizeBrokerEvents(
  events: readonly Action650uSimulatedBrokerEvent[],
) {
  const normalized = events.map((event) => {
    const observedAt = canonicalizeAction650uNanosecondInstant(event.observed_at);
    if (!observedAt) return null;
    return {
      event: {
        ...event,
        observed_at: observedAt.canonical_instant,
      } as Action650uSimulatedBrokerEvent,
      observedAt,
      digest: hashAction650sCanonicalValue({
        ...event,
        observed_at: observedAt.canonical_instant,
      }),
    };
  });
  if (normalized.some((entry) => entry === null)) return null;

  return normalized
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort(
      (left, right) =>
        compareAction650uInstants(left.observedAt, right.observedAt) ||
        (left.event.event_type === right.event.event_type
          ? left.digest.localeCompare(right.digest)
          : left.event.event_type === "progress"
            ? -1
            : 1),
    )
    .map(({ event }) => event);
}

function plannedProjection(
  prepared: Action650sPreparedExecution,
): Action651aPlannedPriceProjection {
  const projection = {
    source: "verified_execution_preparation" as const,
    ticker: prepared.handoff.payload.ticker,
    side: prepared.handoff.payload.side,
    quantity: String(prepared.handoff.payload.quantity),
    order_type: prepared.handoff.payload.order_type,
    planned_limit_price: decimalNumber(prepared.handoff.payload.limit_price),
    planned_stop_price: decimalNumber(prepared.handoff.payload.stop_price),
    canonical_order_payload_digest:
      prepared.handoff.identity.canonical_order_payload_digest,
  };
  return deepFreezeAction650s({
    ...projection,
    projection_digest: `action_651a_planned_price_${hashAction650sCanonicalValue(
      projection,
    )}`,
  });
}

function lineageProjection(input: {
  prepared: Action650sPreparedExecution;
  capability: Action650uManualConfirmationCapability | null;
  replay: Action650uConfirmedExecutionReplayResult | null;
  terminalDigest: string | null;
}): Action651aLineageProjection {
  const projection = {
    execution_identity: input.prepared.runtime_identity_context.execution_identity,
    lifecycle_identity: input.prepared.runtime_identity_context.lifecycle_identity,
    runtime_identity_context_digest:
      input.prepared.runtime_identity_context_digest,
    handoff_identity: input.prepared.handoff.identity.handoff_identity,
    handoff_digest: input.prepared.handoff.identity.handoff_digest,
    canonical_order_payload_digest:
      input.prepared.handoff.identity.canonical_order_payload_digest,
    confirmation_request_digest:
      input.capability?.confirmation_request_digest ?? null,
    confirmation_capability_digest:
      input.capability?.capability_digest ?? null,
    confirmation_receipt_digest:
      input.replay?.confirmation_receipt?.receipt_digest ?? null,
    session_identity: input.capability?.session_identity ?? null,
    idempotency_identity:
      input.prepared.handoff.identity.idempotency_identity,
    correlation_identity:
      input.prepared.handoff.identity.correlation_identity,
    confirmed_replay_trace_identity: input.replay?.trace_identity ?? null,
    confirmed_replay_evidence_digest:
      input.replay?.audit_result_evidence_digest ?? null,
    terminal_digest: input.terminalDigest,
  };
  return deepFreezeAction650s({
    ...projection,
    lineage_digest: `action_651a_lineage_${hashAction650sCanonicalValue(
      projection,
    )}`,
  });
}

function finalizeEnabled(input: {
  status: Action651aAuditStatus;
  failureKind: Action651aFailureKind;
  sourceReason: string | null;
  prepared?: Action650sPreparedExecution;
  capability?: Action650uManualConfirmationCapability | null;
  replay?: Action650uConfirmedExecutionReplayResult | null;
  timing?: Action651aTimingProjection | null;
  planned?: Action651aPlannedPriceProjection | null;
  confirmed?: Action651aConfirmedPriceProjection | null;
  fill?: Action651aSyntheticFillProjection | null;
  terminalDigest?: string | null;
}): Action651aDiagnosticAuditResult {
  const failureProjection = {
    failure_kind: input.failureKind,
    source_reason: input.sourceReason,
  };
  const failureProvenance = deepFreezeAction650s({
    ...failureProjection,
    evidence_digest: `action_651a_failure_${hashAction650sCanonicalValue(
      failureProjection,
    )}`,
  });
  const lineage = input.prepared
    ? lineageProjection({
        prepared: input.prepared,
        capability: input.capability ?? null,
        replay: input.replay ?? null,
        terminalDigest: input.terminalDigest ?? null,
      })
    : null;
  const base = {
    contract_version: action651aDiagnosticExecutionQualityContractVersion,
    policy_version: action651aDiagnosticPolicyVersion,
    gate_status: "enabled" as const,
    audit_status: input.status,
    failure_provenance: failureProvenance,
    lineage,
    timing_projection: input.timing ?? null,
    planned_price_projection: input.planned ?? null,
    confirmed_price_projection: input.confirmed ?? null,
    synthetic_fill_projection: input.fill ?? null,
    safety,
    effects: zeroEffects,
  };
  return deepFreezeAction650s({
    ...base,
    audit_evidence_digest: `action_651a_audit_${hashAction650sCanonicalValue(
      base,
    )}`,
  }) as Action651aDiagnosticAuditResult;
}

/**
 * Local, in-memory diagnostic successor. The two gate reads intentionally
 * precede provenance checks, request traversal, cloning, replay authority and
 * digest work.
 */
export function runAction651aDiagnosticExecutionQualityAudit(
  input: Action651aDiagnosticAuditInput,
): Action651aDiagnosticAuditResult {
  if (input.enabled !== true) return disabledResult;
  if (input.kill_switch_active === true) return killedResult;

  if (
    !hasAction650sPreparedExecutionProvenance(input.prepared) ||
    containsAction650sRestrictedMaterial(input)
  ) {
    return finalizeEnabled({
      status: "unmappable",
      failureKind: "diagnostic_input_unmappable",
      sourceReason: "preparation_or_input_provenance_invalid",
    });
  }

  const planned = plannedProjection(input.prepared);
  if (!input.capability || typeof input.capability !== "object") {
    return finalizeEnabled({
      status: "incomplete",
      failureKind: "confirmation_missing",
      sourceReason: "manual_confirmation_capability_missing",
      prepared: input.prepared,
      planned,
    });
  }

  const capability =
    input.capability as Action650uManualConfirmationCapability;
  if (
    getAction650uManualConfirmationConsumptionState(capability) !==
      "unconsumed" ||
    !verifyAction650uManualConfirmationCapability(capability) ||
    !capabilityMatchesPrepared(capability, input.prepared)
  ) {
    return finalizeEnabled({
      status: "conflicting",
      failureKind: "confirmation_conflicting",
      sourceReason: "manual_confirmation_capability_lineage_mismatch",
      prepared: input.prepared,
      capability,
      planned,
    });
  }

  const consumedAt = canonicalizeAction650uNanosecondInstant(input.consumed_at);
  const expiresAt = canonicalizeAction650uNanosecondInstant(
    capability.session_expires_at,
  );
  const maximumConfirmationLatency = canonicalUnsignedInteger(
    input.maximum_confirmation_latency_nanoseconds,
    true,
  );
  const confirmedPriceMicros = canonicalUnsignedInteger(
    input.confirmed_price?.price_micros,
  );
  const confirmedPriceAt = canonicalizeAction650uNanosecondInstant(
    input.confirmed_price?.observed_at,
  );
  const fillPriceMicros = canonicalUnsignedInteger(
    input.synthetic_fill?.price_micros,
  );
  const normalizedEvents = normalizeBrokerEvents(input.broker_events);

  if (
    !consumedAt ||
    !expiresAt ||
    maximumConfirmationLatency === null ||
    !confirmedPriceMicros ||
    !confirmedPriceAt ||
    !fillPriceMicros ||
    input.confirmed_price?.source !==
      "synthetic_manual_confirmation_fixture" ||
    input.synthetic_fill?.source !== "synthetic_replay_fixture" ||
    !normalizedEvents
  ) {
    return finalizeEnabled({
      status: "unmappable",
      failureKind: "diagnostic_input_unmappable",
      sourceReason: "nanosecond_or_synthetic_price_input_invalid",
      prepared: input.prepared,
      capability,
      planned,
    });
  }

  const replay = replayAction650uConfirmedExecution({
    prepared: input.prepared,
    boundary: input.boundary,
    capability,
    consumed_at: consumedAt.canonical_instant,
    broker_events: normalizedEvents,
  });
  const replayTerminalDigest = replay.terminal_result
    ? `action_651a_terminal_${hashAction650sCanonicalValue(
        replay.terminal_result,
      )}`
    : null;

  if (compareAction650uInstants(consumedAt, expiresAt) >= 0) {
    return finalizeEnabled({
      status: "incomplete",
      failureKind: "confirmation_expired",
      sourceReason: "manual_confirmation_session_expired_before_consumption",
      prepared: input.prepared,
      capability,
      replay,
      planned,
      terminalDigest: replayTerminalDigest,
    });
  }

  if (
    replay.safety_decision !== "passed" ||
    !replay.confirmation_receipt ||
    getAction650uManualConfirmationConsumptionState(capability) !== "consumed" ||
    !verifyReplayDigest(replay) ||
    replay.confirmation_receipt.capability_digest !==
      capability.capability_digest ||
    replay.confirmation_receipt.confirmation_request_digest !==
      capability.confirmation_request_digest ||
    replay.confirmation_receipt.execution_identity !==
      input.prepared.runtime_identity_context.execution_identity ||
    replay.confirmation_receipt.lifecycle_identity !==
      input.prepared.runtime_identity_context.lifecycle_identity ||
    replay.confirmation_receipt.handoff_digest !==
      input.prepared.handoff.identity.handoff_digest ||
    rebuildAction650uConsumptionProjectionDigest(replay.confirmation_receipt) !==
      replay.confirmation_receipt.consumption_projection_digest ||
    rebuildAction650uConsumptionReceiptDigest(replay.confirmation_receipt) !==
      replay.confirmation_receipt.receipt_digest
  ) {
    const confirmationConflict =
      replay.blocked_reason === "manual_confirmation_unverified";
    const replayConflict =
      replay.blocked_reason === "conflicting_terminal_result";
    return finalizeEnabled({
      status:
        confirmationConflict || replayConflict ? "conflicting" : "incomplete",
      failureKind: confirmationConflict
        ? "confirmation_conflicting"
        : replayConflict
          ? "confirmed_replay_conflicting"
          : "confirmed_replay_incomplete",
      sourceReason: replay.blocked_reason ?? "confirmed_replay_verification_failed",
      prepared: input.prepared,
      capability,
      replay,
      planned,
      terminalDigest: replayTerminalDigest,
    });
  }

  const plannedEvent = input.prepared.lifecycle_events.find(
    (event) => event.event_type === "prepared",
  );
  const waitingEvent = input.prepared.lifecycle_events.find(
    (event) => event.event_type === "waiting_for_manual_confirmation",
  );
  const submissionEvent = replay.lifecycle_events.find(
    (event) => event.event_type === "simulated_broker_order_submitting",
  );
  const terminal = replay.terminal_result;
  if (!plannedEvent || !waitingEvent || !submissionEvent || !terminal) {
    return finalizeEnabled({
      status: "incomplete",
      failureKind: "confirmed_replay_incomplete",
      sourceReason: "required_lifecycle_or_terminal_evidence_missing",
      prepared: input.prepared,
      capability,
      replay,
      planned,
    });
  }

  const plannedAt = canonicalizeAction650uNanosecondInstant(
    plannedEvent.occurred_at,
  );
  const waitingAt = canonicalizeAction650uNanosecondInstant(
    waitingEvent.occurred_at,
  );
  const confirmedAt = canonicalizeAction650uNanosecondInstant(
    capability.confirmed_at,
  );
  const submissionAt = canonicalizeAction650uNanosecondInstant(
    submissionEvent.occurred_at,
  );
  const terminalAt = canonicalizeAction650uNanosecondInstant(
    terminal.observed_at,
  );
  if (
    !plannedAt ||
    !waitingAt ||
    !confirmedAt ||
    !submissionAt ||
    !terminalAt
  ) {
    return finalizeEnabled({
      status: "unmappable",
      failureKind: "diagnostic_input_unmappable",
      sourceReason: "lifecycle_nanosecond_instant_invalid",
      prepared: input.prepared,
      capability,
      replay,
      planned,
    });
  }

  const durations = {
    plannedToWaiting: deltaNanoseconds(plannedAt, waitingAt),
    waitingToConfirmation: deltaNanoseconds(waitingAt, confirmedAt),
    confirmationToSubmission: deltaNanoseconds(confirmedAt, submissionAt),
    submissionToTerminal: deltaNanoseconds(submissionAt, terminalAt),
  };
  if (Object.values(durations).some((duration) => duration === null)) {
    return finalizeEnabled({
      status: "unmappable",
      failureKind: "diagnostic_input_unmappable",
      sourceReason: "negative_lifecycle_duration",
      prepared: input.prepared,
      capability,
      replay,
      planned,
    });
  }

  const timingBase = {
    precision: "nanoseconds" as const,
    planned_at: plannedAt.canonical_instant,
    waiting_for_manual_confirmation_at: waitingAt.canonical_instant,
    confirmed_at: confirmedAt.canonical_instant,
    simulated_submission_at: submissionAt.canonical_instant,
    simulated_terminal_at: terminalAt.canonical_instant,
    planned_to_waiting_nanoseconds: durations.plannedToWaiting as string,
    waiting_to_confirmation_nanoseconds:
      durations.waitingToConfirmation as string,
    confirmation_to_simulated_submission_nanoseconds:
      durations.confirmationToSubmission as string,
    simulated_submission_to_simulated_terminal_nanoseconds:
      durations.submissionToTerminal as string,
  };
  const timing = deepFreezeAction650s({
    ...timingBase,
    projection_digest: `action_651a_timing_${hashAction650sCanonicalValue(
      timingBase,
    )}`,
  });

  const pointInTimeSafe =
    compareAction650uInstants(confirmedPriceAt, confirmedAt) === 0;
  const confirmedBase = {
    source: "synthetic_manual_confirmation_fixture" as const,
    price_micros: confirmedPriceMicros,
    observed_at: confirmedPriceAt.canonical_instant,
    confirmation_capability_digest: capability.capability_digest,
    point_in_time_safe: pointInTimeSafe,
  };
  const confirmed = deepFreezeAction650s({
    ...confirmedBase,
    projection_digest: `action_651a_confirmed_price_${hashAction650sCanonicalValue(
      confirmedBase,
    )}`,
  });

  const terminalDigest =
    `action_651a_terminal_${hashAction650sCanonicalValue(terminal)}`;
  const signedSlippage =
    BigInt(fillPriceMicros) - BigInt(confirmedPriceMicros);
  const adverseSlippage =
    input.prepared.handoff.payload.side === "BUY"
      ? signedSlippage
      : -signedSlippage;
  const fillBase = {
    source: "synthetic_replay_fixture" as const,
    price_micros: fillPriceMicros,
    quantity: String(input.prepared.handoff.payload.quantity),
    observed_at: terminalAt.canonical_instant,
    terminal_digest: terminalDigest,
    signed_slippage_vs_confirmed_micros: signedSlippage.toString(),
    adverse_slippage_vs_confirmed_micros: adverseSlippage.toString(),
    calculation:
      input.prepared.handoff.payload.side === "BUY"
        ? ("synthetic_fill_minus_synthetic_confirmed" as const)
        : ("synthetic_confirmed_minus_synthetic_fill" as const),
  };
  const fill = deepFreezeAction650s({
    ...fillBase,
    projection_digest: `action_651a_synthetic_fill_${hashAction650sCanonicalValue(
      fillBase,
    )}`,
  });

  if (!pointInTimeSafe) {
    return finalizeEnabled({
      status: "not_point_in_time_safe",
      failureKind: "price_observation_not_point_in_time_safe",
      sourceReason: "confirmed_price_timestamp_differs_from_confirmation",
      prepared: input.prepared,
      capability,
      replay,
      timing,
      planned,
      confirmed,
      fill,
      terminalDigest,
    });
  }

  if (
    BigInt(durations.waitingToConfirmation as string) >
    BigInt(maximumConfirmationLatency)
  ) {
    return finalizeEnabled({
      status: "incomplete",
      failureKind: "confirmation_late",
      sourceReason: "maximum_confirmation_latency_exceeded",
      prepared: input.prepared,
      capability,
      replay,
      timing,
      planned,
      confirmed,
      fill,
      terminalDigest,
    });
  }

  return finalizeEnabled({
    status: "audited",
    failureKind: "none",
    sourceReason: null,
    prepared: input.prepared,
    capability,
    replay,
    timing,
    planned,
    confirmed,
    fill,
    terminalDigest,
  });
}
