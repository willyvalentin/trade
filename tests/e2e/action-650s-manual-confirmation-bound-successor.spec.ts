import { expect, test } from "@playwright/test";

import {
  buildAction650sSimulatedBrokerEventBinding,
  replayAction650sConfirmedExecution,
  type Action650sSimulatedBrokerEvent,
  type Action650sSimulatedBrokerTerminalEvent,
} from "../../lib/action-650s-confirmed-execution-replay";
import {
  createAction650sRuntimeIdentityContext,
  hashAction650sCanonicalValue,
} from "../../lib/action-650s-execution-identity";
import {
  prepareAction650sExecution,
  rejectAction650sBrokerEventBeforeConfirmation,
  type Action650sExecutionCandidate,
  type Action650sPreparedExecution,
} from "../../lib/action-650s-execution-preparation";
import {
  createAction650sManualConfirmationBoundary,
  getAction650sManualConfirmationConsumptionState,
  type Action650sManualConfirmationBoundary,
  type Action650sManualConfirmationCapability,
} from "../../lib/action-650s-manual-confirmation";

const observedAt = "2026-07-29T10:00:00.000Z";
const confirmedAt = "2026-07-29T10:01:00.000Z";
const consumedAt = "2026-07-29T10:02:00.000Z";
const brokerAt = "2026-07-29T10:03:00.000Z";

function runtime(
  input: {
    execution?: string;
    instance?: string;
    session?: string;
    createdAt?: string;
  } = {},
) {
  const value = createAction650sRuntimeIdentityContext({
    execution_identity: input.execution ?? "execution-650s-a",
    runtime_instance_identity: input.instance ?? "runtime-instance-a",
    runtime_session_identity: input.session ?? "runtime-session-a",
    created_at: input.createdAt ?? "2026-07-29T09:55:00.000Z",
  });

  if (!value) throw new Error("Expected runtime identity.");
  return value;
}

function candidate(
  trigger: Action650sExecutionCandidate["trigger"],
  overrides: Partial<Action650sExecutionCandidate> = {},
): Action650sExecutionCandidate {
  const isEntry = trigger === "recommendation_entry";
  const isStop = trigger === "stop_loss_reached";

  return {
    candidate_identity: `candidate-${trigger}`,
    trigger,
    ticker: "AAPL",
    side: isEntry ? "BUY" : "SELL",
    quantity: 5,
    order_type: isStop ? "STOP_LIMIT" : "LIMIT",
    limit_price: isStop ? 179 : isEntry ? 180 : 195,
    stop_price: isStop ? 180 : null,
    created_at: "2026-07-29T09:50:00.000Z",
    expires_at: isEntry ? "2026-07-29T10:30:00.000Z" : null,
    ...overrides,
  };
}

function preparedScenario(input: {
  execution?: string;
  candidates?: readonly Action650sExecutionCandidate[];
  runtimeCreatedAt?: string;
  observed?: string;
} = {}) {
  const runtimeContext = runtime({
    execution: input.execution,
    createdAt: input.runtimeCreatedAt,
  });
  const result = prepareAction650sExecution({
    runtime: runtimeContext,
    candidates: input.candidates ?? [candidate("stop_loss_reached")],
    observed_at: input.observed ?? observedAt,
  });

  if (result.current_state !== "waiting_for_manual_confirmation") {
    throw new Error(`Expected prepared execution: ${result.blocked_reason}`);
  }

  return { runtime: runtimeContext, prepared: result };
}

function confirmedScenario(input: { execution?: string } = {}) {
  const scenario = preparedScenario(input);
  const boundary = createAction650sManualConfirmationBoundary({
    runtime: scenario.runtime,
    session_identity: "manual-session-a",
    session_started_at: "2026-07-29T09:59:00.000Z",
    session_expires_at: "2026-07-29T10:10:00.000Z",
  });

  if (!boundary) throw new Error("Expected confirmation boundary.");
  const confirmation = boundary.confirm(scenario.prepared, {
    confirmed_at: confirmedAt,
    confirming_actor_class: "human_operator",
    session_identity: "manual-session-a",
  });

  if (!confirmation.ok) throw new Error(confirmation.reason);

  return {
    ...scenario,
    boundary,
    capability: confirmation.capability,
  };
}

function progressEvent(
  prepared: Action650sPreparedExecution,
  overrides: Partial<Action650sSimulatedBrokerEvent> = {},
): Action650sSimulatedBrokerEvent {
  return {
    ...buildAction650sSimulatedBrokerEventBinding(prepared),
    event_type: "progress",
    progress_status: "submitting",
    observed_at: brokerAt,
    ...overrides,
  } as Action650sSimulatedBrokerEvent;
}

function terminalEvent(
  prepared: Action650sPreparedExecution,
  status: Action650sSimulatedBrokerTerminalEvent["terminal_status"] = "completed",
  overrides: Partial<Action650sSimulatedBrokerTerminalEvent> = {},
): Action650sSimulatedBrokerTerminalEvent {
  return {
    ...buildAction650sSimulatedBrokerEventBinding(prepared),
    event_type: "terminal",
    terminal_status: status,
    simulated_broker_order_identity: "simulated-order-a",
    observed_at: brokerAt,
    ...overrides,
  };
}

function replay(input: {
  prepared: Action650sPreparedExecution;
  boundary: Action650sManualConfirmationBoundary;
  capability: Action650sManualConfirmationCapability;
  events?: readonly Action650sSimulatedBrokerEvent[];
  consumed?: string;
}) {
  return replayAction650sConfirmedExecution({
    prepared: input.prepared,
    boundary: input.boundary,
    capability: input.capability,
    consumed_at: input.consumed ?? consumedAt,
    broker_events:
      input.events ?? [progressEvent(input.prepared), terminalEvent(input.prepared)],
  });
}

test("Action 650S preserves stop-loss then target then entry priority", () => {
  const input = [
    candidate("recommendation_entry"),
    candidate("target_reached"),
    candidate("stop_loss_reached"),
  ];
  const stop = preparedScenario({ candidates: input }).prepared;
  const target = preparedScenario({ candidates: input.slice(0, 2) }).prepared;
  const entry = preparedScenario({ candidates: input.slice(0, 1) }).prepared;

  expect(stop.selected_candidate).toMatchObject({
    trigger: "stop_loss_reached",
    priority: 1,
  });
  expect(target.selected_candidate).toMatchObject({
    trigger: "target_reached",
    priority: 4,
  });
  expect(entry.selected_candidate).toMatchObject({
    trigger: "recommendation_entry",
    priority: 6,
  });
});

test("Action 650S prepares stop-loss, target, and entry only in semi-automatic mode", () => {
  for (const trigger of [
    "stop_loss_reached",
    "target_reached",
    "recommendation_entry",
  ] as const) {
    const prepared = preparedScenario({ candidates: [candidate(trigger)] }).prepared;

    expect(prepared.current_state).toBe("waiting_for_manual_confirmation");
    expect(prepared.handoff.payload.execution_mode).toBe("semi_automatic");
    expect(prepared.handoff.requires_manual_confirmation).toBe(true);
    expect(prepared.handoff.permits_real_submission).toBe(false);
    expect(prepared.lifecycle_events.map((event) => event.event_type)).toEqual([
      "prepared",
      "waiting_for_manual_confirmation",
    ]);
  }
});

test("Action 650S accepts no broker progress or terminal result before confirmation", () => {
  const { prepared } = preparedScenario();

  expect(rejectAction650sBrokerEventBeforeConfirmation(prepared)).toEqual({
    accepted: false,
    reason: "manual_confirmation_not_verified",
    broker_progress_accepted: false,
    terminal_result_accepted: false,
  });
  expect(prepared.effects).toMatchObject({
    broker_requests_submitted: 0,
    provider_calls: 0,
    database_writes: 0,
    trade_mutations: 0,
  });
});

test("Action 650S preparation is input-order and timezone deterministic", () => {
  const candidates = [
    candidate("recommendation_entry", {
      created_at: "2026-07-29T11:50:00.000+02:00",
      expires_at: "2026-07-29T12:30:00.000+02:00",
    }),
    candidate("target_reached", {
      created_at: "2026-07-29T11:50:00.000+02:00",
    }),
  ];
  const first = preparedScenario({
    candidates,
    runtimeCreatedAt: "2026-07-29T11:55:00.000+02:00",
    observed: "2026-07-29T12:00:00.000+02:00",
  }).prepared;
  const second = preparedScenario({
    candidates: [...candidates].reverse(),
    runtimeCreatedAt: "2026-07-29T09:55:00.000Z",
    observed: "2026-07-29T10:00:00.000Z",
  }).prepared;

  expect(first.trace_identity).toBe(second.trace_identity);
  expect(first.handoff.identity).toEqual(second.handoff.identity);
});

test("Action 650S runtime identity changes trace identity but not safety decision", () => {
  const first = preparedScenario({ execution: "execution-a" }).prepared;
  const second = preparedScenario({ execution: "execution-b" }).prepared;

  expect(first.trace_identity).not.toBe(second.trace_identity);
  expect(first.safety_decision).toBe(second.safety_decision);
  expect(first.selected_candidate).toEqual(second.selected_candidate);
  expect(first.handoff.identity.canonical_order_payload_digest).toBe(
    second.handoff.identity.canonical_order_payload_digest,
  );
});

test("Action 650S runtime, payload, handoff, request, idempotency, and correlation identities are explicit", () => {
  const first = preparedScenario().prepared;
  const second = preparedScenario().prepared;

  expect(first.runtime_identity_context.context_digest).toBe(
    second.runtime_identity_context.context_digest,
  );
  expect(first.handoff.identity).toEqual(second.handoff.identity);
  expect(first.handoff.identity).toMatchObject({
    execution_identity: "execution-650s-a",
    lifecycle_identity: first.runtime_identity_context.lifecycle_identity,
    runtime_identity_context_digest:
      first.runtime_identity_context.context_digest,
  });
  expect(first.handoff.identity.handoff_digest).toContain(
    "action_650s_handoff_digest_",
  );
  expect(first.handoff.identity.broker_request_identity).toContain(
    "action_650s_broker_request_",
  );
  expect(first.handoff.identity.idempotency_identity).toContain(
    "action_650s_idempotency_",
  );
  expect(first.handoff.identity.correlation_identity).toContain(
    "action_650s_correlation_",
  );
});

test("Action 650S rejects caller-asserted runtime provenance and automatic substitution", () => {
  const proven = runtime();
  const clonedRuntime = structuredClone(proven);
  const callerClaim = prepareAction650sExecution({
    runtime: clonedRuntime,
    candidates: [candidate("stop_loss_reached")],
    observed_at: observedAt,
  });
  const automatic = prepareAction650sExecution({
    runtime: proven,
    candidates: [
      {
        ...candidate("stop_loss_reached"),
        execution_mode: "automatic",
      } as Action650sExecutionCandidate,
    ],
    observed_at: observedAt,
  });

  expect(callerClaim).toMatchObject({
    current_state: "blocked",
    blocked_reason: "runtime_identity_unproven",
  });
  expect(automatic).toMatchObject({
    current_state: "blocked",
    blocked_reason: "no_valid_candidate",
  });
});

test("Action 650S issues a deep-frozen capability bound to every required identity", () => {
  const { prepared, capability } = confirmedScenario();

  expect(Object.isFrozen(capability)).toBe(true);
  expect(Object.isFrozen(prepared)).toBe(true);
  expect(Object.isFrozen(prepared.handoff)).toBe(true);
  expect(capability).toMatchObject({
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
    ticker: "AAPL",
    side: "SELL",
    quantity: 5,
    order_type: "STOP_LIMIT",
    execution_mode: "semi_automatic",
    confirming_actor_class: "human_operator",
    session_identity: "manual-session-a",
    consumption_state: "unconsumed",
    authority_scope: "simulated_broker_progress_and_terminal_result",
  });
  expect(JSON.stringify(capability)).not.toMatch(
    /credential|bankid|cookie|broker.?session|password|secret/i,
  );
});

test("Action 650S rejects caller-asserted and cloned confirmation capabilities", () => {
  const first = confirmedScenario();
  const asserted = {
    ...first.capability,
    capability_digest: `action_650s_manual_confirmation_${hashAction650sCanonicalValue(
      first.capability,
    )}`,
  } as Action650sManualConfirmationCapability;
  const assertedResult = replay({
    ...first,
    capability: asserted,
  });

  const second = confirmedScenario({ execution: "execution-clone" });
  const cloneResult = replay({
    ...second,
    capability: structuredClone(second.capability),
  });

  expect(assertedResult.blocked_reason).toBe("manual_confirmation_unverified");
  expect(cloneResult.blocked_reason).toBe("manual_confirmation_unverified");
  expect(assertedResult.broker_progress_events_accepted).toBe(0);
  expect(cloneResult.terminal_result).toBeNull();
});

test("Action 650S rejects capability substitution across execution and handoff", () => {
  const first = confirmedScenario({ execution: "execution-first" });
  const second = confirmedScenario({ execution: "execution-second" });
  const result = replay({
    prepared: second.prepared,
    boundary: second.boundary,
    capability: first.capability,
  });

  expect(result.blocked_reason).toBe("manual_confirmation_unverified");
  expect(result.effects.simulated_submission_permitted).toBe(0);
});

test("Action 650S rejects wrong session, expiry, and capability renewal", () => {
  const { runtime: runtimeContext, prepared } = preparedScenario();
  const boundary = createAction650sManualConfirmationBoundary({
    runtime: runtimeContext,
    session_identity: "manual-session-a",
    session_started_at: "2026-07-29T09:59:00.000Z",
    session_expires_at: "2026-07-29T10:10:00.000Z",
  });

  if (!boundary) throw new Error("Expected confirmation boundary.");

  expect(
    boundary.confirm(prepared, {
      confirmed_at: confirmedAt,
      confirming_actor_class: "human_operator",
      session_identity: "wrong-session",
    }),
  ).toEqual({ ok: false, reason: "session_mismatch" });
  expect(
    boundary.confirm(prepared, {
      confirmed_at: confirmedAt,
      confirming_actor_class: "service_account",
      session_identity: "manual-session-a",
    }),
  ).toEqual({ ok: false, reason: "confirmation_invalid" });
  expect(
    boundary.confirm(prepared, {
      confirmed_at: "2026-07-29T10:11:00.000Z",
      confirming_actor_class: "human_operator",
      session_identity: "manual-session-a",
    }),
  ).toEqual({ ok: false, reason: "confirmation_expired" });

  const accepted = boundary.confirm(prepared, {
    confirmed_at: confirmedAt,
    confirming_actor_class: "human_operator",
    session_identity: "manual-session-a",
  });
  expect(accepted.ok).toBe(true);
  expect(
    boundary.confirm(prepared, {
      confirmed_at: confirmedAt,
      confirming_actor_class: "human_operator",
      session_identity: "manual-session-a",
    }),
  ).toEqual({ ok: false, reason: "confirmation_already_issued" });
});

test("Action 650S consumes confirmation exactly once", () => {
  const scenario = confirmedScenario();
  const first = replay(scenario);
  const second = replay(scenario);

  expect(first.safety_decision).toBe("passed");
  expect(getAction650sManualConfirmationConsumptionState(scenario.capability)).toBe(
    "consumed",
  );
  expect(second.blocked_reason).toBe("manual_confirmation_unverified");
  expect(second.broker_progress_events_accepted).toBe(0);
});

test("Action 650S rejects consumption before confirmation and after capability expiry", () => {
  const before = confirmedScenario({ execution: "execution-before-confirmation" });
  const beforeResult = replay({
    ...before,
    consumed: "2026-07-29T10:00:30.000Z",
  });
  const expired = confirmedScenario({ execution: "execution-after-expiry" });
  const expiredResult = replay({
    ...expired,
    consumed: "2026-07-29T10:11:00.000Z",
  });

  expect(beforeResult.blocked_reason).toBe("manual_confirmation_unverified");
  expect(expiredResult.blocked_reason).toBe("manual_confirmation_unverified");
  expect(beforeResult.effects.simulated_submission_permitted).toBe(0);
  expect(expiredResult.effects.simulated_submission_permitted).toBe(0);
});

test("Action 650S rejects confirmation after a terminal state", () => {
  const scenario = confirmedScenario();
  const terminal = replay(scenario);

  expect(
    scenario.boundary.confirm(terminal, {
      confirmed_at: brokerAt,
      confirming_actor_class: "human_operator",
      session_identity: "manual-session-a",
    }),
  ).toEqual({ ok: false, reason: "preparation_provenance_unproven" });
});

test("Action 650S models completed, failed, cancelled, and needs-review outcomes", () => {
  const expected = {
    completed: "simulated_completed",
    failed: "simulated_failed",
    cancelled: "simulated_cancelled",
    needs_review: "simulated_needs_review",
  } as const;

  for (const [status, state] of Object.entries(expected)) {
    const scenario = confirmedScenario({ execution: `execution-${status}` });
    const result = replay({
      ...scenario,
      events: [
        terminalEvent(
          scenario.prepared,
          status as Action650sSimulatedBrokerTerminalEvent["terminal_status"],
        ),
      ],
    });

    expect(result.current_state).toBe(state);
    expect(result.safety_decision).toBe("passed");
    expect(result.effects).toMatchObject({
      broker_requests_submitted: 0,
      provider_calls: 0,
      database_writes: 0,
      trade_mutations: 0,
      real_trade_mutations: 0,
    });
  }
});

test("Action 650S accepts progress only after verified manual confirmation", () => {
  const scenario = confirmedScenario();
  const result = replay({
    ...scenario,
    events: [
      progressEvent(scenario.prepared, { progress_status: "preparing" }),
      progressEvent(scenario.prepared, { progress_status: "submitting" }),
      terminalEvent(scenario.prepared),
    ],
  });

  expect(result.broker_progress_events_accepted).toBe(2);
  expect(result.lifecycle_events.map((event) => event.event_type)).toEqual([
    "manual_confirmation_verified",
    "simulated_broker_order_submitting",
    "simulated_completed",
  ]);
});

test("Action 650S treats an exact duplicate terminal result as idempotent", () => {
  const scenario = confirmedScenario();
  const terminal = terminalEvent(scenario.prepared);
  const result = replay({
    ...scenario,
    events: [terminal, structuredClone(terminal)],
  });

  expect(result.safety_decision).toBe("passed");
  expect(result.terminal_result_reconciliation).toBe("duplicate");
  expect(
    result.lifecycle_events.filter((event) =>
      event.event_type.startsWith("simulated_completed"),
    ),
  ).toHaveLength(1);
});

test("Action 650S routes conflicting terminal results to needs review", () => {
  const scenario = confirmedScenario();
  const result = replay({
    ...scenario,
    events: [
      terminalEvent(scenario.prepared, "completed"),
      terminalEvent(scenario.prepared, "failed", {
        observed_at: "2026-07-29T10:04:00.000Z",
      }),
    ],
  });

  expect(result.safety_decision).toBe("blocked");
  expect(result.blocked_reason).toBe("conflicting_terminal_result");
  expect(result.terminal_result_reconciliation).toBe("needs_review");
  expect(result.current_state).toBe("blocked");
});

test("Action 650S rejects cross-execution, idempotency, and correlation drift", () => {
  for (const overrides of [
    { execution_identity: "other-execution" },
    { lifecycle_identity: "other-lifecycle" },
    { handoff_identity: "other-handoff" },
    { canonical_order_payload_digest: "other-payload" },
    { broker_request_identity: "other-request" },
    { idempotency_identity: "other-idempotency" },
    { correlation_identity: "other-correlation" },
  ]) {
    const scenario = confirmedScenario({
      execution: `execution-${Object.keys(overrides)[0]}`,
    });
    const result = replay({
      ...scenario,
      events: [terminalEvent(scenario.prepared, "completed", overrides)],
    });

    expect(result.blocked_reason).toBe("broker_event_binding_mismatch");
    expect(result.terminal_result).toBeNull();
  }
});

test("Action 650S rejects changed ticker, side, quantity, price, order type, and payload identity", () => {
  const mutations: Partial<Action650sSimulatedBrokerTerminalEvent>[] = [
    { ticker: "MSFT" },
    { side: "BUY" },
    { quantity: 6 },
    { limit_price: 178 },
    { stop_price: 181 },
    { order_type: "LIMIT" },
    { canonical_order_payload_digest: "self-consistent-recomputed-payload" },
    { handoff_digest: "self-consistent-recomputed-handoff" },
  ];

  for (const [index, mutation] of mutations.entries()) {
    const scenario = confirmedScenario({ execution: `execution-mutation-${index}` });
    const result = replay({
      ...scenario,
      events: [terminalEvent(scenario.prepared, "completed", mutation)],
    });

    expect(result.blocked_reason).toBe("broker_event_binding_mismatch");
  }
});

test("Action 650S rejects a self-consistently recomputed structural preparation", () => {
  const scenario = confirmedScenario();
  const structuralClone = structuredClone(scenario.prepared);
  const tampered = {
    ...structuralClone,
    handoff: {
      ...structuralClone.handoff,
      payload: { ...structuralClone.handoff.payload, ticker: "MSFT" },
    },
  };
  const recomputed = {
    ...tampered,
    trace_identity: `action_650s_preparation_${hashAction650sCanonicalValue(
      tampered,
    )}`,
  } as Action650sPreparedExecution;
  const result = replayAction650sConfirmedExecution({
    prepared: recomputed,
    boundary: scenario.boundary,
    capability: scenario.capability,
    consumed_at: consumedAt,
    broker_events: [],
  });

  expect(result.blocked_reason).toBe("preparation_provenance_unproven");
});

test("Action 650S retry or restart with the same explicit identity has identical preparation trace", () => {
  const first = preparedScenario().prepared;
  const restarted = preparedScenario().prepared;

  expect(restarted).toEqual(first);
  expect(restarted.trace_identity).toBe(first.trace_identity);
});

test("Action 650S restart with fresh provenance and the same identities has identical confirmed trace", () => {
  const first = confirmedScenario();
  const restarted = confirmedScenario();
  const firstResult = replay(first);
  const restartedResult = replay(restarted);

  expect(restarted.capability).toEqual(first.capability);
  expect(restartedResult).toEqual(firstResult);
  expect(restartedResult.trace_identity).toBe(firstResult.trace_identity);
});
