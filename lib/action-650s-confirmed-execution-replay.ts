import {
  canonicalizeAction650sTimestamp,
  containsAction650sRestrictedMaterial,
  deepFreezeAction650s,
  hashAction650sCanonicalValue,
} from "@/lib/action-650s-execution-identity";
import {
  hasAction650sPreparedExecutionProvenance,
  type Action650sPreparedExecution,
} from "@/lib/action-650s-execution-preparation";
import {
  consumeAction650sManualConfirmation,
  type Action650sManualConfirmationBoundary,
  type Action650sManualConfirmationCapability,
  type Action650sManualConfirmationConsumptionReceipt,
} from "@/lib/action-650s-manual-confirmation";

export const action650sConfirmedExecutionReplayContractVersion =
  "action_650s_confirmed_execution_replay_v1" as const;

type Action650sBrokerEventBinding = Readonly<{
  execution_identity: string;
  lifecycle_identity: string;
  runtime_identity_context_digest: string;
  handoff_identity: string;
  handoff_digest: string;
  canonical_order_payload_digest: string;
  broker_request_identity: string;
  idempotency_identity: string;
  correlation_identity: string;
  ticker: string;
  side: "BUY" | "SELL";
  quantity: number;
  order_type: "LIMIT" | "MARKET" | "STOP_LIMIT";
  limit_price: number | null;
  stop_price: number | null;
}>;

export type Action650sSimulatedBrokerProgressEvent =
  Action650sBrokerEventBinding &
    Readonly<{
      event_type: "progress";
      progress_status: "preparing" | "submitting";
      observed_at: string;
    }>;

export type Action650sSimulatedBrokerTerminalEvent =
  Action650sBrokerEventBinding &
    Readonly<{
      event_type: "terminal";
      terminal_status: "completed" | "failed" | "cancelled" | "needs_review";
      simulated_broker_order_identity: string;
      observed_at: string;
    }>;

export type Action650sSimulatedBrokerEvent =
  | Action650sSimulatedBrokerProgressEvent
  | Action650sSimulatedBrokerTerminalEvent;

export type Action650sConfirmedLifecycleState =
  | "manual_confirmation_verified"
  | "simulated_broker_order_submitting"
  | "simulated_completed"
  | "simulated_failed"
  | "simulated_cancelled"
  | "simulated_needs_review";

export type Action650sConfirmedLifecycleEvent = Readonly<{
  event_identity: string;
  sequence: number;
  event_type: Action650sConfirmedLifecycleState;
  execution_identity: string;
  lifecycle_identity: string;
  occurred_at: string;
}>;

export type Action650sConfirmedExecutionReplayResult = Readonly<{
  contract_version: typeof action650sConfirmedExecutionReplayContractVersion;
  safety_decision: "passed" | "blocked";
  blocked_reason:
    | null
    | "preparation_provenance_unproven"
    | "restricted_material_rejected"
    | "manual_confirmation_unverified"
    | "broker_event_binding_mismatch"
    | "broker_event_timestamp_invalid"
    | "broker_progress_after_terminal"
    | "conflicting_terminal_result";
  confirmation_receipt: Action650sManualConfirmationConsumptionReceipt | null;
  current_state:
    | "blocked"
    | "manual_confirmation_verified"
    | "simulated_broker_order_submitting"
    | "simulated_completed"
    | "simulated_failed"
    | "simulated_cancelled"
    | "simulated_needs_review";
  lifecycle_events: readonly Action650sConfirmedLifecycleEvent[];
  broker_progress_events_accepted: number;
  terminal_result: Action650sSimulatedBrokerTerminalEvent | null;
  terminal_result_reconciliation:
    | "none"
    | "accepted"
    | "duplicate"
    | "needs_review";
  effects: Readonly<{
    broker_requests_prepared: 1 | 0;
    broker_requests_submitted: 0;
    simulated_submission_permitted: 1 | 0;
    provider_calls: 0;
    database_writes: 0;
    trade_mutations: 0;
    real_trade_mutations: 0;
  }>;
  trace_identity: string;
}>;

function bindingFromPrepared(
  prepared: Action650sPreparedExecution,
): Action650sBrokerEventBinding {
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
  };
}

export function buildAction650sSimulatedBrokerEventBinding(
  prepared: Action650sPreparedExecution,
) {
  return deepFreezeAction650s(bindingFromPrepared(prepared));
}

function eventBindingMatches(
  event: Action650sSimulatedBrokerEvent,
  prepared: Action650sPreparedExecution,
) {
  const binding = bindingFromPrepared(prepared);

  return Object.entries(binding).every(
    ([key, value]) =>
      event[key as keyof Action650sSimulatedBrokerEvent] === value,
  );
}

function lifecycleEvent(input: {
  prepared: Action650sPreparedExecution;
  sequence: number;
  event_type: Action650sConfirmedLifecycleState;
  occurred_at: string;
}): Action650sConfirmedLifecycleEvent {
  const executionIdentity =
    input.prepared.runtime_identity_context.execution_identity;
  const lifecycleIdentity =
    input.prepared.runtime_identity_context.lifecycle_identity;
  const digest = hashAction650sCanonicalValue({
    execution_identity: executionIdentity,
    lifecycle_identity: lifecycleIdentity,
    sequence: input.sequence,
    event_type: input.event_type,
    occurred_at: input.occurred_at,
  });

  return {
    event_identity: `action_650s_confirmed_event_${digest.slice(0, 24)}`,
    sequence: input.sequence,
    event_type: input.event_type,
    execution_identity: executionIdentity,
    lifecycle_identity: lifecycleIdentity,
    occurred_at: input.occurred_at,
  };
}

function blocked(
  reason: Exclude<
    Action650sConfirmedExecutionReplayResult["blocked_reason"],
    null
  >,
  options: {
    prepared?: Action650sPreparedExecution;
    receipt?: Action650sManualConfirmationConsumptionReceipt;
    events?: readonly Action650sConfirmedLifecycleEvent[];
    progress?: number;
    terminal?: Action650sSimulatedBrokerTerminalEvent | null;
  } = {},
): Action650sConfirmedExecutionReplayResult {
  const base = {
    contract_version: action650sConfirmedExecutionReplayContractVersion,
    safety_decision: "blocked" as const,
    blocked_reason: reason,
    confirmation_receipt: options.receipt ?? null,
    current_state: "blocked" as const,
    lifecycle_events: options.events ?? [],
    broker_progress_events_accepted: options.progress ?? 0,
    terminal_result: options.terminal ?? null,
    terminal_result_reconciliation:
      reason === "conflicting_terminal_result"
        ? ("needs_review" as const)
        : ("none" as const),
    effects: {
      broker_requests_prepared: options.prepared ? (1 as const) : (0 as const),
      broker_requests_submitted: 0 as const,
      simulated_submission_permitted: options.receipt
        ? (1 as const)
        : (0 as const),
      provider_calls: 0 as const,
      database_writes: 0 as const,
      trade_mutations: 0 as const,
      real_trade_mutations: 0 as const,
    },
  };

  return deepFreezeAction650s({
    ...base,
    trace_identity: `action_650s_confirmed_replay_${hashAction650sCanonicalValue(
      base,
    )}`,
  }) as Action650sConfirmedExecutionReplayResult;
}

function terminalState(
  status: Action650sSimulatedBrokerTerminalEvent["terminal_status"],
) {
  if (status === "completed") return "simulated_completed" as const;
  if (status === "failed") return "simulated_failed" as const;
  if (status === "cancelled") return "simulated_cancelled" as const;
  return "simulated_needs_review" as const;
}

/**
 * Consumes one runtime-proven capability, then models broker progress and a
 * terminal outcome. Every effect remains synthetic and in-memory.
 */
export function replayAction650sConfirmedExecution(input: {
  prepared: Action650sPreparedExecution;
  boundary: Action650sManualConfirmationBoundary;
  capability: Action650sManualConfirmationCapability;
  consumed_at: string;
  broker_events: readonly Action650sSimulatedBrokerEvent[];
}): Action650sConfirmedExecutionReplayResult {
  if (!hasAction650sPreparedExecutionProvenance(input.prepared)) {
    return blocked("preparation_provenance_unproven");
  }

  if (containsAction650sRestrictedMaterial(input.broker_events)) {
    return blocked("restricted_material_rejected", {
      prepared: input.prepared,
    });
  }

  const consumption = consumeAction650sManualConfirmation({
    boundary: input.boundary,
    prepared: input.prepared,
    capability: input.capability,
    consumed_at: input.consumed_at,
  });

  if (!consumption.ok) {
    return blocked("manual_confirmation_unverified", {
      prepared: input.prepared,
    });
  }

  const consumedAt = consumption.receipt.consumed_at;
  const lifecycleEvents: Action650sConfirmedLifecycleEvent[] = [
    lifecycleEvent({
      prepared: input.prepared,
      sequence: 1,
      event_type: "manual_confirmation_verified",
      occurred_at: consumedAt,
    }),
    lifecycleEvent({
      prepared: input.prepared,
      sequence: 2,
      event_type: "simulated_broker_order_submitting",
      occurred_at: consumedAt,
    }),
  ];
  let progress = 0;
  let acceptedTerminal: Action650sSimulatedBrokerTerminalEvent | null = null;
  let reconciliation:
    | "none"
    | "accepted"
    | "duplicate"
    | "needs_review" = "none";

  for (const event of input.broker_events) {
    if (!eventBindingMatches(event, input.prepared)) {
      return blocked("broker_event_binding_mismatch", {
        prepared: input.prepared,
        receipt: consumption.receipt,
        events: lifecycleEvents,
        progress,
        terminal: acceptedTerminal,
      });
    }

    const observedAt = canonicalizeAction650sTimestamp(event.observed_at);

    if (!observedAt || Date.parse(observedAt) < Date.parse(consumedAt)) {
      return blocked("broker_event_timestamp_invalid", {
        prepared: input.prepared,
        receipt: consumption.receipt,
        events: lifecycleEvents,
        progress,
        terminal: acceptedTerminal,
      });
    }

    if (event.event_type === "progress") {
      if (acceptedTerminal) {
        return blocked("broker_progress_after_terminal", {
          prepared: input.prepared,
          receipt: consumption.receipt,
          events: lifecycleEvents,
          progress,
          terminal: acceptedTerminal,
        });
      }

      progress += 1;
      continue;
    }

    if (!event.simulated_broker_order_identity.trim()) {
      return blocked("broker_event_binding_mismatch", {
        prepared: input.prepared,
        receipt: consumption.receipt,
        events: lifecycleEvents,
        progress,
        terminal: acceptedTerminal,
      });
    }

    if (!acceptedTerminal) {
      acceptedTerminal = deepFreezeAction650s({
        ...event,
        observed_at: observedAt,
      }) as Action650sSimulatedBrokerTerminalEvent;
      reconciliation = "accepted";
      lifecycleEvents.push(
        lifecycleEvent({
          prepared: input.prepared,
          sequence: lifecycleEvents.length + 1,
          event_type: terminalState(event.terminal_status),
          occurred_at: observedAt,
        }),
      );
      continue;
    }

    if (
      hashAction650sCanonicalValue(acceptedTerminal) ===
      hashAction650sCanonicalValue({ ...event, observed_at: observedAt })
    ) {
      reconciliation = "duplicate";
      continue;
    }

    lifecycleEvents.push(
      lifecycleEvent({
        prepared: input.prepared,
        sequence: lifecycleEvents.length + 1,
        event_type: "simulated_needs_review",
        occurred_at: observedAt,
      }),
    );

    return blocked("conflicting_terminal_result", {
      prepared: input.prepared,
      receipt: consumption.receipt,
      events: lifecycleEvents,
      progress,
      terminal: acceptedTerminal,
    });
  }

  const currentState = acceptedTerminal
    ? terminalState(acceptedTerminal.terminal_status)
    : ("simulated_broker_order_submitting" as const);
  const base = {
    contract_version: action650sConfirmedExecutionReplayContractVersion,
    safety_decision: "passed" as const,
    blocked_reason: null,
    confirmation_receipt: consumption.receipt,
    current_state: currentState,
    lifecycle_events: lifecycleEvents,
    broker_progress_events_accepted: progress,
    terminal_result: acceptedTerminal,
    terminal_result_reconciliation: reconciliation,
    effects: {
      broker_requests_prepared: 1 as const,
      broker_requests_submitted: 0 as const,
      simulated_submission_permitted: 1 as const,
      provider_calls: 0 as const,
      database_writes: 0 as const,
      trade_mutations: 0 as const,
      real_trade_mutations: 0 as const,
    },
  };

  return deepFreezeAction650s({
    ...base,
    trace_identity: `action_650s_confirmed_replay_${hashAction650sCanonicalValue(
      base,
    )}`,
  }) as Action650sConfirmedExecutionReplayResult;
}
