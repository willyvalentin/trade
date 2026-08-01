import {
  buildAction650sSimulatedBrokerEventBinding,
  type Action650sSimulatedBrokerEvent,
  type Action650sSimulatedBrokerProgressEvent,
  type Action650sSimulatedBrokerTerminalEvent,
} from "@/lib/action-650s-confirmed-execution-replay";
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
  action650uTemporalConfirmationPolicyVersion,
  canonicalizeAction650uNanosecondInstant,
  compareAction650uInstants,
} from "@/lib/action-650u-temporal-confirmation-policy";

export const action650uConfirmedExecutionReplayContractVersion =
  "action_650u_confirmed_execution_replay_v1" as const;

export type {
  Action650sSimulatedBrokerEvent as Action650uSimulatedBrokerEvent,
  Action650sSimulatedBrokerProgressEvent as Action650uSimulatedBrokerProgressEvent,
  Action650sSimulatedBrokerTerminalEvent as Action650uSimulatedBrokerTerminalEvent,
};

export type Action650uConfirmedLifecycleState =
  | "manual_confirmation_verified"
  | "simulated_broker_order_submitting"
  | "simulated_completed"
  | "simulated_failed"
  | "simulated_cancelled"
  | "simulated_needs_review";

export type Action650uConfirmedLifecycleEvent = Readonly<{
  event_identity: string;
  sequence: number;
  event_type: Action650uConfirmedLifecycleState;
  execution_identity: string;
  lifecycle_identity: string;
  occurred_at: string;
}>;

export type Action650uTemporalAuditEvidence = Readonly<{
  temporal_policy_version: typeof action650uTemporalConfirmationPolicyVersion;
  confirmation_request_digest: string;
  capability_digest: string;
  consumption_projection_digest: string;
  receipt_digest: string;
  confirmed_at: string;
  waiting_for_manual_confirmation_at: string;
  session_started_at: string;
  session_expires_at: string;
  consumed_at: string;
  evidence_digest: string;
}>;

export type Action650uConfirmedExecutionReplayResult = Readonly<{
  contract_version: typeof action650uConfirmedExecutionReplayContractVersion;
  temporal_policy_version: typeof action650uTemporalConfirmationPolicyVersion;
  safety_decision: "passed" | "blocked";
  blocked_reason:
    | null
    | "preparation_provenance_unproven"
    | "manual_confirmation_unverified"
    | "broker_event_binding_mismatch"
    | "broker_event_timestamp_invalid"
    | "broker_progress_after_terminal"
    | "conflicting_terminal_result";
  confirmation_receipt:
    | Action650uManualConfirmationConsumptionReceipt
    | null;
  temporal_audit_evidence: Action650uTemporalAuditEvidence | null;
  current_state:
    | "blocked"
    | "manual_confirmation_verified"
    | "simulated_broker_order_submitting"
    | "simulated_completed"
    | "simulated_failed"
    | "simulated_cancelled"
    | "simulated_needs_review";
  lifecycle_events: readonly Action650uConfirmedLifecycleEvent[];
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
  audit_result_evidence_digest: string;
  trace_identity: string;
}>;

export function buildAction650uSimulatedBrokerEventBinding(
  prepared: Action650sPreparedExecution,
) {
  return buildAction650sSimulatedBrokerEventBinding(prepared);
}

function eventBindingMatches(
  event: Action650sSimulatedBrokerEvent,
  prepared: Action650sPreparedExecution,
) {
  const binding = buildAction650sSimulatedBrokerEventBinding(prepared);
  return Object.entries(binding).every(
    ([key, value]) =>
      event[key as keyof Action650sSimulatedBrokerEvent] === value,
  );
}

function lifecycleEvent(input: {
  prepared: Action650sPreparedExecution;
  sequence: number;
  event_type: Action650uConfirmedLifecycleState;
  occurred_at: string;
}): Action650uConfirmedLifecycleEvent {
  const executionIdentity =
    input.prepared.runtime_identity_context.execution_identity;
  const lifecycleIdentity =
    input.prepared.runtime_identity_context.lifecycle_identity;
  const projection = {
    temporal_policy_version: action650uTemporalConfirmationPolicyVersion,
    execution_identity: executionIdentity,
    lifecycle_identity: lifecycleIdentity,
    sequence: input.sequence,
    event_type: input.event_type,
    occurred_at: input.occurred_at,
  };

  return {
    event_identity: `action_650u_confirmed_event_${hashAction650sCanonicalValue(
      projection,
    ).slice(0, 24)}`,
    sequence: input.sequence,
    event_type: input.event_type,
    execution_identity: executionIdentity,
    lifecycle_identity: lifecycleIdentity,
    occurred_at: input.occurred_at,
  };
}

function temporalEvidence(
  receipt: Action650uManualConfirmationConsumptionReceipt,
): Action650uTemporalAuditEvidence {
  const projection = {
    temporal_policy_version: receipt.temporal_policy_version,
    confirmation_request_digest: receipt.confirmation_request_digest,
    capability_digest: receipt.capability_digest,
    consumption_projection_digest: receipt.consumption_projection_digest,
    receipt_digest: receipt.receipt_digest,
    confirmed_at: receipt.confirmed_at,
    waiting_for_manual_confirmation_at:
      receipt.waiting_for_manual_confirmation_at,
    session_started_at: receipt.session_started_at,
    session_expires_at: receipt.session_expires_at,
    consumed_at: receipt.consumed_at,
  };

  return deepFreezeAction650s({
    ...projection,
    evidence_digest: `action_650u_temporal_audit_evidence_${hashAction650sCanonicalValue(
      projection,
    )}`,
  });
}

function finalize(
  base: Omit<
    Action650uConfirmedExecutionReplayResult,
    "audit_result_evidence_digest" | "trace_identity"
  >,
): Action650uConfirmedExecutionReplayResult {
  const auditResultEvidenceDigest =
    `action_650u_audit_result_evidence_${hashAction650sCanonicalValue(base)}`;
  const resultWithEvidence = {
    ...base,
    audit_result_evidence_digest: auditResultEvidenceDigest,
  };

  return deepFreezeAction650s({
    ...resultWithEvidence,
    trace_identity: `action_650u_confirmed_replay_${hashAction650sCanonicalValue(
      resultWithEvidence,
    )}`,
  }) as Action650uConfirmedExecutionReplayResult;
}

function blocked(
  reason: Exclude<
    Action650uConfirmedExecutionReplayResult["blocked_reason"],
    null
  >,
  options: {
    prepared?: Action650sPreparedExecution;
    receipt?: Action650uManualConfirmationConsumptionReceipt;
    events?: readonly Action650uConfirmedLifecycleEvent[];
    progress?: number;
    terminal?: Action650sSimulatedBrokerTerminalEvent | null;
  } = {},
) {
  const evidence = options.receipt ? temporalEvidence(options.receipt) : null;
  return finalize({
    contract_version: action650uConfirmedExecutionReplayContractVersion,
    temporal_policy_version: action650uTemporalConfirmationPolicyVersion,
    safety_decision: "blocked",
    blocked_reason: reason,
    confirmation_receipt: options.receipt ?? null,
    temporal_audit_evidence: evidence,
    current_state: "blocked",
    lifecycle_events: options.events ?? [],
    broker_progress_events_accepted: options.progress ?? 0,
    terminal_result: options.terminal ?? null,
    terminal_result_reconciliation:
      reason === "conflicting_terminal_result" ? "needs_review" : "none",
    effects: {
      broker_requests_prepared: options.prepared ? 1 : 0,
      broker_requests_submitted: 0,
      simulated_submission_permitted: options.receipt ? 1 : 0,
      provider_calls: 0,
      database_writes: 0,
      trade_mutations: 0,
      real_trade_mutations: 0,
    },
  });
}

function terminalState(
  status: Action650sSimulatedBrokerTerminalEvent["terminal_status"],
) {
  if (status === "completed") return "simulated_completed" as const;
  if (status === "failed") return "simulated_failed" as const;
  if (status === "cancelled") return "simulated_cancelled" as const;
  return "simulated_needs_review" as const;
}

export function replayAction650uConfirmedExecution(input: {
  prepared: Action650sPreparedExecution;
  boundary: Action650uManualConfirmationBoundary;
  capability: Action650uManualConfirmationCapability;
  consumed_at: string;
  broker_events: readonly Action650sSimulatedBrokerEvent[];
}): Action650uConfirmedExecutionReplayResult {
  if (!hasAction650sPreparedExecutionProvenance(input.prepared)) {
    return blocked("preparation_provenance_unproven");
  }

  const consumption = consumeAction650uManualConfirmation({
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

  const receipt = consumption.receipt;
  const consumedAt = canonicalizeAction650uNanosecondInstant(
    receipt.consumed_at,
  );
  if (!consumedAt) {
    return blocked("manual_confirmation_unverified", {
      prepared: input.prepared,
    });
  }

  const lifecycleEvents: Action650uConfirmedLifecycleEvent[] = [
    lifecycleEvent({
      prepared: input.prepared,
      sequence: 1,
      event_type: "manual_confirmation_verified",
      occurred_at: receipt.consumed_at,
    }),
    lifecycleEvent({
      prepared: input.prepared,
      sequence: 2,
      event_type: "simulated_broker_order_submitting",
      occurred_at: receipt.consumed_at,
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
        receipt,
        events: lifecycleEvents,
        progress,
        terminal: acceptedTerminal,
      });
    }

    const observedAt = canonicalizeAction650uNanosecondInstant(
      event.observed_at,
    );
    if (
      !observedAt ||
      compareAction650uInstants(observedAt, consumedAt) < 0
    ) {
      return blocked("broker_event_timestamp_invalid", {
        prepared: input.prepared,
        receipt,
        events: lifecycleEvents,
        progress,
        terminal: acceptedTerminal,
      });
    }

    if (event.event_type === "progress") {
      if (acceptedTerminal) {
        return blocked("broker_progress_after_terminal", {
          prepared: input.prepared,
          receipt,
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
        receipt,
        events: lifecycleEvents,
        progress,
        terminal: acceptedTerminal,
      });
    }

    const normalizedTerminal = deepFreezeAction650s({
      ...event,
      observed_at: observedAt.canonical_instant,
    }) as Action650sSimulatedBrokerTerminalEvent;
    if (!acceptedTerminal) {
      acceptedTerminal = normalizedTerminal;
      reconciliation = "accepted";
      lifecycleEvents.push(
        lifecycleEvent({
          prepared: input.prepared,
          sequence: lifecycleEvents.length + 1,
          event_type: terminalState(event.terminal_status),
          occurred_at: observedAt.canonical_instant,
        }),
      );
      continue;
    }

    if (
      hashAction650sCanonicalValue(acceptedTerminal) ===
      hashAction650sCanonicalValue(normalizedTerminal)
    ) {
      reconciliation = "duplicate";
      continue;
    }

    lifecycleEvents.push(
      lifecycleEvent({
        prepared: input.prepared,
        sequence: lifecycleEvents.length + 1,
        event_type: "simulated_needs_review",
        occurred_at: observedAt.canonical_instant,
      }),
    );
    return blocked("conflicting_terminal_result", {
      prepared: input.prepared,
      receipt,
      events: lifecycleEvents,
      progress,
      terminal: acceptedTerminal,
    });
  }

  const currentState = acceptedTerminal
    ? terminalState(acceptedTerminal.terminal_status)
    : ("simulated_broker_order_submitting" as const);
  return finalize({
    contract_version: action650uConfirmedExecutionReplayContractVersion,
    temporal_policy_version: action650uTemporalConfirmationPolicyVersion,
    safety_decision: "passed",
    blocked_reason: null,
    confirmation_receipt: receipt,
    temporal_audit_evidence: temporalEvidence(receipt),
    current_state: currentState,
    lifecycle_events: lifecycleEvents,
    broker_progress_events_accepted: progress,
    terminal_result: acceptedTerminal,
    terminal_result_reconciliation: reconciliation,
    effects: {
      broker_requests_prepared: 1,
      broker_requests_submitted: 0,
      simulated_submission_permitted: 1,
      provider_calls: 0,
      database_writes: 0,
      trade_mutations: 0,
      real_trade_mutations: 0,
    },
  });
}
