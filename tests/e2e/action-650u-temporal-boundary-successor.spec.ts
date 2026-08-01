import { expect, test } from "@playwright/test";

import {
  buildAction650uSimulatedBrokerEventBinding,
  replayAction650uConfirmedExecution,
  type Action650uSimulatedBrokerTerminalEvent,
} from "../../lib/action-650u-confirmed-execution-replay";
import { createAction650sRuntimeIdentityContext } from "../../lib/action-650s-execution-identity";
import {
  prepareAction650sExecution,
  type Action650sExecutionCandidate,
  type Action650sPreparedExecution,
} from "../../lib/action-650s-execution-preparation";
import {
  createAction650uManualConfirmationBoundary,
  getAction650uManualConfirmationConsumptionState,
  rebuildAction650uConfirmationRequestDigest,
  rebuildAction650uConsumptionProjectionDigest,
  rebuildAction650uConsumptionReceiptDigest,
  rebuildAction650uManualConfirmationCapabilityDigest,
  verifyAction650uManualConfirmationCapability,
  type Action650uManualConfirmationBoundary,
  type Action650uManualConfirmationCapability,
} from "../../lib/action-650u-manual-confirmation";
import {
  action650uTemporalConfirmationPolicyVersion,
  canonicalizeAction650uNanosecondInstant,
  evaluateAction650uTemporalConfirmationPolicy,
} from "../../lib/action-650u-temporal-confirmation-policy";

const waitingAt = "2026-07-29T10:00:00.000000000Z";
const expiryAt = "2026-07-29T10:10:00.000000000Z";
const consumedAt = "2026-07-29T10:05:00.000000000Z";

function candidate(): Action650sExecutionCandidate {
  return {
    candidate_identity: "action-650u-candidate",
    trigger: "stop_loss_reached",
    ticker: "AAPL",
    side: "SELL",
    quantity: 5,
    order_type: "STOP_LIMIT",
    limit_price: 179,
    stop_price: 180,
    created_at: "2026-07-29T09:50:00.000Z",
    expires_at: null,
  };
}

function scenario(input: {
  execution?: string;
  sessionStart?: string;
  sessionExpiry?: string;
  observedAt?: string;
} = {}) {
  const runtime = createAction650sRuntimeIdentityContext({
    execution_identity: input.execution ?? "action-650u-execution",
    runtime_instance_identity: "action-650u-runtime",
    runtime_session_identity: "action-650u-runtime-session",
    created_at: "2026-07-29T09:55:00.000Z",
  });
  if (!runtime) throw new Error("Expected proven runtime.");

  const prepared = prepareAction650sExecution({
    runtime,
    candidates: [candidate()],
    observed_at: input.observedAt ?? waitingAt,
  });
  if (prepared.current_state !== "waiting_for_manual_confirmation") {
    throw new Error("Expected prepared waiting state.");
  }

  const boundary = createAction650uManualConfirmationBoundary({
    runtime,
    session_identity: "action-650u-manual-session",
    session_started_at:
      input.sessionStart ?? "2026-07-29T09:59:00.000000000Z",
    session_expires_at: input.sessionExpiry ?? expiryAt,
  });
  if (!boundary) throw new Error("Expected temporal boundary.");

  return { runtime, prepared, boundary };
}

function confirm(
  boundary: Action650uManualConfirmationBoundary,
  prepared: Action650sPreparedExecution,
  confirmedAt: string,
) {
  return boundary.confirm(prepared, {
    confirmed_at: confirmedAt,
    confirming_actor_class: "human_operator",
    session_identity: "action-650u-manual-session",
  });
}

function confirmedScenario(
  confirmedAt = "2026-07-29T10:01:00.000000000Z",
  execution = `action-650u-confirmed-${confirmedAt}`,
) {
  const value = scenario({ execution });
  const confirmation = confirm(value.boundary, value.prepared, confirmedAt);
  if (!confirmation.ok) throw new Error(confirmation.reason);
  return { ...value, capability: confirmation.capability };
}

function terminal(
  prepared: Action650sPreparedExecution,
  overrides: Partial<Action650uSimulatedBrokerTerminalEvent> = {},
): Action650uSimulatedBrokerTerminalEvent {
  return {
    ...buildAction650uSimulatedBrokerEventBinding(prepared),
    event_type: "terminal",
    terminal_status: "completed",
    simulated_broker_order_identity: "action-650u-simulated-order",
    observed_at: "2026-07-29T10:06:00.000000000Z",
    ...overrides,
  };
}

function replay(value: {
  prepared: Action650sPreparedExecution;
  boundary: Action650uManualConfirmationBoundary;
  capability: Action650uManualConfirmationCapability;
  events?: readonly Action650uSimulatedBrokerTerminalEvent[];
  consumed?: string;
}) {
  return replayAction650uConfirmedExecution({
    prepared: value.prepared,
    boundary: value.boundary,
    capability: value.capability,
    consumed_at: value.consumed ?? consumedAt,
    broker_events: value.events ?? [terminal(value.prepared)],
  });
}

test("Action 650U preserves predecessor digest inputs without rewriting them", async () => {
  const crypto = await import("node:crypto");
  const fs = await import("node:fs");
  const predecessorPaths = [
    "docs/action-650s-manual-confirmation-bound-execution-foundation-successor.md",
    "lib/action-650s-confirmed-execution-replay.ts",
    "lib/action-650s-execution-identity.ts",
    "lib/action-650s-execution-preparation.ts",
    "lib/action-650s-manual-confirmation.ts",
    "tests/e2e/action-650s-manual-confirmation-bound-successor.spec.ts",
    "tests/e2e/action-650s-static-capability-boundary.spec.ts",
  ];
  const lines = predecessorPaths
    .map((path) => {
      const digest = crypto
        .createHash("sha256")
        .update(fs.readFileSync(path))
        .digest("hex");
      return `${digest}  ${path}`;
    })
    .sort();
  const combined = crypto
    .createHash("sha256")
    .update(`${lines.join("\n")}\n`)
    .digest("hex");

  expect(combined).toBe(
    "328a41a7015dfd6dd13bd5a338edd2ff244a151834d7c1123d3490d3f683589c",
  );
});

test("Action 650U canonicalizes equivalent timezone instants at nanosecond precision", () => {
  expect(
    canonicalizeAction650uNanosecondInstant(
      "2026-07-29T12:00:00.123456789+02:00",
    ),
  ).toEqual(
    canonicalizeAction650uNanosecondInstant(
      "2026-07-29T10:00:00.123456789Z",
    ),
  );
});

test("Action 650U accepts expiry minus one nanosecond", () => {
  const value = scenario({ execution: "action-650u-expiry-minus-one" });
  const result = confirm(
    value.boundary,
    value.prepared,
    "2026-07-29T10:09:59.999999999Z",
  );

  expect(result.ok).toBe(true);
});

test("Action 650U rejects the exact expiry instant with the closed reason code", () => {
  const value = scenario({ execution: "action-650u-expiry-exact" });

  expect(confirm(value.boundary, value.prepared, expiryAt)).toEqual({
    ok: false,
    reason: "manual_confirmation_session_expired",
  });
});

test("Action 650U rejects expiry plus one nanosecond", () => {
  const value = scenario({ execution: "action-650u-expiry-plus-one" });

  expect(
    confirm(
      value.boundary,
      value.prepared,
      "2026-07-29T10:10:00.000000001Z",
    ),
  ).toEqual({
    ok: false,
    reason: "manual_confirmation_session_expired",
  });
});

test("Action 650U rejects waiting minus one nanosecond", () => {
  const value = scenario({ execution: "action-650u-waiting-minus-one" });

  expect(
    confirm(
      value.boundary,
      value.prepared,
      "2026-07-29T09:59:59.999999999Z",
    ),
  ).toEqual({
    ok: false,
    reason: "manual_confirmation_before_waiting_boundary",
  });
});

test("Action 650U accepts the exact waiting instant", () => {
  const value = scenario({ execution: "action-650u-waiting-exact" });

  expect(confirm(value.boundary, value.prepared, waitingAt).ok).toBe(true);
});

test("Action 650U accepts waiting plus one nanosecond", () => {
  const value = scenario({ execution: "action-650u-waiting-plus-one" });

  expect(
    confirm(
      value.boundary,
      value.prepared,
      "2026-07-29T10:00:00.000000001Z",
    ).ok,
  ).toBe(true);
});

test("Action 650U closes missing, malformed, and wrong-type temporal inputs", () => {
  for (const waiting of [undefined, null, 17, "not-an-instant"]) {
    expect(
      evaluateAction650uTemporalConfirmationPolicy({
        current_lifecycle_state: "waiting_for_manual_confirmation",
        waiting_for_manual_confirmation_at: waiting,
        confirmed_at: waitingAt,
        session_started_at: "2026-07-29T09:59:00.000000000Z",
        session_expires_at: expiryAt,
      }),
    ).toMatchObject({
      accepted: false,
      reason: "manual_confirmation_waiting_timestamp_invalid",
    });
  }

  for (const instant of [undefined, null, 17, "2026-02-30T10:00:00Z"]) {
    expect(
      evaluateAction650uTemporalConfirmationPolicy({
        current_lifecycle_state: "waiting_for_manual_confirmation",
        waiting_for_manual_confirmation_at: waitingAt,
        confirmed_at: instant,
        session_started_at: "2026-07-29T09:59:00.000000000Z",
        session_expires_at: expiryAt,
      }),
    ).toMatchObject({
      accepted: false,
      reason: "manual_confirmation_timestamp_invalid",
    });
  }
});

test("Action 650U rejects non-waiting lifecycle state with its closed reason", () => {
  const value = scenario({ execution: "action-650u-state-mismatch" });

  expect(
    value.boundary.confirm(
      { current_state: "simulated_completed" },
      {
        confirmed_at: waitingAt,
        confirming_actor_class: "human_operator",
        session_identity: "action-650u-manual-session",
      },
    ),
  ).toEqual({
    ok: false,
    reason: "manual_confirmation_lifecycle_state_mismatch",
  });
});

test("Action 650U rejects confirmation before lifecycle creation", () => {
  const value = scenario({ execution: "action-650u-before-creation" });

  expect(
    confirm(
      value.boundary,
      value.prepared,
      "2026-07-29T09:50:00.000000000Z",
    ),
  ).toMatchObject({
    ok: false,
    reason: "manual_confirmation_before_waiting_boundary",
  });
});

test("Action 650U preserves the session-start lower bound", () => {
  const value = scenario({
    execution: "action-650u-before-session-start",
    sessionStart: "2026-07-29T10:02:00.000000000Z",
  });

  expect(confirm(value.boundary, value.prepared, waitingAt)).toEqual({
    ok: false,
    reason: "manual_confirmation_session_not_started",
  });
});

test("Action 650U rejects expiry before the waiting timestamp", () => {
  const value = scenario({
    execution: "action-650u-expiry-before-waiting",
    sessionStart: "2026-07-29T09:00:00.000000000Z",
    sessionExpiry: "2026-07-29T09:59:59.999999999Z",
  });

  expect(confirm(value.boundary, value.prepared, waitingAt)).toEqual({
    ok: false,
    reason: "manual_confirmation_session_expired",
  });
});

test("Action 650U binds policy and temporal projections through capability, consumption, replay, and audit evidence", () => {
  const value = confirmedScenario();

  expect(value.capability).toMatchObject({
    contract_version: "action_650u_manual_confirmation_capability_v1",
    temporal_policy_version: action650uTemporalConfirmationPolicyVersion,
    confirmed_lifecycle_state: "waiting_for_manual_confirmation",
    waiting_for_manual_confirmation_at: waitingAt,
    session_expires_at: expiryAt,
  });
  expect(rebuildAction650uConfirmationRequestDigest(value.capability)).toBe(
    value.capability.confirmation_request_digest,
  );
  expect(
    rebuildAction650uManualConfirmationCapabilityDigest(value.capability),
  ).toBe(value.capability.capability_digest);
  expect(verifyAction650uManualConfirmationCapability(value.capability)).toBe(
    true,
  );

  const result = replay(value);
  const receipt = result.confirmation_receipt;
  if (!receipt) throw new Error("Expected consumption receipt.");
  expect(rebuildAction650uConsumptionProjectionDigest(receipt)).toBe(
    receipt.consumption_projection_digest,
  );
  expect(rebuildAction650uConsumptionReceiptDigest(receipt)).toBe(
    receipt.receipt_digest,
  );
  expect(result.temporal_audit_evidence).toMatchObject({
    temporal_policy_version: action650uTemporalConfirmationPolicyVersion,
    confirmation_request_digest:
      value.capability.confirmation_request_digest,
    waiting_for_manual_confirmation_at: waitingAt,
  });
  expect(result.audit_result_evidence_digest).toContain(
    "action_650u_audit_result_evidence_",
  );
  expect(result.trace_identity).toContain("action_650u_confirmed_replay_");
});

test("Action 650U rejects caller-supplied derived temporal validity", () => {
  const value = scenario({ execution: "action-650u-derived-caller-input" });

  expect(
    value.boundary.confirm(value.prepared, {
      confirmed_at: waitingAt,
      confirming_actor_class: "human_operator",
      session_identity: "action-650u-manual-session",
      temporal_valid: true,
      temporal_policy_version: action650uTemporalConfirmationPolicyVersion,
    } as never),
  ).toEqual({
    ok: false,
    reason: "confirmation_request_shape_invalid",
  });
});

test("Action 650U rejects session, payload, identity, and recomputed temporal substitution", () => {
  const wrongSession = scenario({ execution: "action-650u-wrong-session" });
  expect(
    wrongSession.boundary.confirm(wrongSession.prepared, {
      confirmed_at: waitingAt,
      confirming_actor_class: "human_operator",
      session_identity: "substituted-session",
    }),
  ).toEqual({ ok: false, reason: "session_mismatch" });

  const value = confirmedScenario(
    "2026-07-29T10:01:00.000000000Z",
    "action-650u-recomputed-tampering",
  );
  const structuralRequest = {
    ...structuredClone(value.capability),
    waiting_for_manual_confirmation_at:
      "2026-07-29T09:00:00.000000000Z",
  } as Action650uManualConfirmationCapability;
  const structuralWithRequest = {
    ...structuralRequest,
    confirmation_request_digest:
      rebuildAction650uConfirmationRequestDigest(structuralRequest),
  } as Action650uManualConfirmationCapability;
  const structural = {
    ...structuralWithRequest,
    capability_digest:
      rebuildAction650uManualConfirmationCapabilityDigest(
        structuralWithRequest,
      ),
  } as Action650uManualConfirmationCapability;

  const result = replay({ ...value, capability: structural });
  expect(result.blocked_reason).toBe("manual_confirmation_unverified");

  const drift = confirmedScenario(
    "2026-07-29T10:01:00.000000000Z",
    "action-650u-broker-binding-drift",
  );
  expect(
    replay({
      ...drift,
      events: [
        terminal(drift.prepared, {
          canonical_order_payload_digest: "substituted-payload",
          execution_identity: "substituted-execution",
        }),
      ],
    }).blocked_reason,
  ).toBe("broker_event_binding_mismatch");
});

test("Action 650U preserves one-shot use after a successful exact boundary", () => {
  const value = confirmedScenario(
    waitingAt,
    "action-650u-exact-boundary-one-shot",
  );

  expect(replay(value).safety_decision).toBe("passed");
  expect(getAction650uManualConfirmationConsumptionState(value.capability)).toBe(
    "consumed",
  );
  expect(replay(value).blocked_reason).toBe(
    "manual_confirmation_unverified",
  );
});

test("Action 650U rejects confirmation after terminal state", () => {
  const value = confirmedScenario(
    "2026-07-29T10:01:00.000000000Z",
    "action-650u-after-terminal",
  );
  const terminalResult = replay(value);

  expect(
    value.boundary.confirm(terminalResult, {
      confirmed_at: "2026-07-29T10:07:00.000000000Z",
      confirming_actor_class: "human_operator",
      session_identity: "action-650u-manual-session",
    }),
  ).toEqual({
    ok: false,
    reason: "manual_confirmation_lifecycle_state_mismatch",
  });
});

test("Action 650U remains deterministic under reverse input order and timezone-equivalent inputs", () => {
  const first = scenario({ execution: "action-650u-timezone-determinism" });
  const target = {
    ...candidate(),
    candidate_identity: "action-650u-target-candidate",
    trigger: "target_reached" as const,
    order_type: "LIMIT" as const,
    limit_price: 195,
    stop_price: null,
  };
  const entry = {
    ...candidate(),
    candidate_identity: "action-650u-entry-candidate",
    trigger: "recommendation_entry" as const,
    side: "BUY" as const,
    order_type: "LIMIT" as const,
    limit_price: 180,
    stop_price: null,
    expires_at: "2026-07-29T10:30:00.000Z",
  };
  const forward = prepareAction650sExecution({
    runtime: first.runtime,
    candidates: [entry, target, candidate()],
    observed_at: waitingAt,
  });
  const reversed = prepareAction650sExecution({
    runtime: first.runtime,
    candidates: [candidate(), target, entry],
    observed_at: "2026-07-29T12:00:00.000000000+02:00",
  });
  if (
    forward.current_state !== "waiting_for_manual_confirmation" ||
    reversed.current_state !== "waiting_for_manual_confirmation"
  ) {
    throw new Error("Expected deterministic preparations.");
  }
  expect(reversed).toEqual(forward);

  const firstBoundary = createAction650uManualConfirmationBoundary({
    runtime: first.runtime,
    session_identity: "action-650u-manual-session",
    session_started_at: "2026-07-29T09:59:00.000000000Z",
    session_expires_at: expiryAt,
  });
  const secondBoundary = createAction650uManualConfirmationBoundary({
    runtime: first.runtime,
    session_identity: "action-650u-manual-session",
    session_started_at: "2026-07-29T11:59:00.000000000+02:00",
    session_expires_at: "2026-07-29T12:10:00.000000000+02:00",
  });
  if (!firstBoundary || !secondBoundary) {
    throw new Error("Expected timezone boundaries.");
  }

  const zulu = confirm(
    firstBoundary,
    forward,
    "2026-07-29T10:01:00.123456789Z",
  );
  const offset = secondBoundary.confirm(reversed, {
    confirmed_at: "2026-07-29T12:01:00.123456789+02:00",
    confirming_actor_class: "human_operator",
    session_identity: "action-650u-manual-session",
  });
  if (!zulu.ok || !offset.ok) throw new Error("Expected confirmations.");

  expect(offset.capability).toEqual(zulu.capability);
  expect(secondBoundary.boundary_identity).toBe(
    firstBoundary.boundary_identity,
  );
});

test("Action 650U preserves automatic-mode and pre-confirmation broker blocks", () => {
  const value = scenario({ execution: "action-650u-preserved-blocks" });
  const automatic = structuredClone(value.prepared) as Action650sPreparedExecution;
  Object.assign(automatic.handoff.payload, { execution_mode: "automatic" });

  expect(
    value.boundary.confirm(automatic, {
      confirmed_at: waitingAt,
      confirming_actor_class: "human_operator",
      session_identity: "action-650u-manual-session",
    }),
  ).toMatchObject({
    ok: false,
    reason: "preparation_provenance_unproven",
  });
  expect(value.prepared.effects).toMatchObject({
    broker_requests_submitted: 0,
    database_writes: 0,
    trade_mutations: 0,
    real_trade_mutations: 0,
  });
});
