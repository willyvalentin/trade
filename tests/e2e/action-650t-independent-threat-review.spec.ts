import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildAction650sSimulatedBrokerEventBinding,
  replayAction650sConfirmedExecution,
  type Action650sSimulatedBrokerTerminalEvent,
} from "../../lib/action-650s-confirmed-execution-replay";
import { createAction650sRuntimeIdentityContext } from "../../lib/action-650s-execution-identity";
import {
  prepareAction650sExecution,
  type Action650sExecutionCandidate,
  type Action650sPreparedExecution,
} from "../../lib/action-650s-execution-preparation";
import {
  createAction650sManualConfirmationBoundary,
  type Action650sManualConfirmationBoundary,
  type Action650sManualConfirmationCapability,
} from "../../lib/action-650s-manual-confirmation";

const root = resolve(__dirname, "../..");
const preparedAt = "2026-07-29T10:00:00.000Z";
const confirmedAt = "2026-07-29T10:01:00.000Z";
const consumedAt = "2026-07-29T10:02:00.000Z";
const expiresAt = "2026-07-29T10:10:00.000Z";

function candidate(
  trigger: Action650sExecutionCandidate["trigger"] = "stop_loss_reached",
): Action650sExecutionCandidate {
  const entry = trigger === "recommendation_entry";
  const stop = trigger === "stop_loss_reached";

  return {
    candidate_identity: `review-${trigger}`,
    trigger,
    ticker: "AAPL",
    side: entry ? "BUY" : "SELL",
    quantity: 5,
    order_type: stop ? "STOP_LIMIT" : "LIMIT",
    limit_price: stop ? 179 : entry ? 180 : 195,
    stop_price: stop ? 180 : null,
    created_at: "2026-07-29T09:50:00.000Z",
    expires_at: entry ? "2026-07-29T10:30:00.000Z" : null,
  };
}

function scenario(execution = "review-execution-a") {
  const runtime = createAction650sRuntimeIdentityContext({
    execution_identity: execution,
    runtime_instance_identity: "review-runtime-a",
    runtime_session_identity: "review-runtime-session-a",
    created_at: "2026-07-29T09:55:00.000Z",
  });

  if (!runtime) throw new Error("Expected runtime identity.");
  const preparation = prepareAction650sExecution({
    runtime,
    candidates: [candidate()],
    observed_at: preparedAt,
  });

  if (preparation.current_state !== "waiting_for_manual_confirmation") {
    throw new Error("Expected prepared execution.");
  }

  const boundary = createAction650sManualConfirmationBoundary({
    runtime,
    session_identity: "review-manual-session-a",
    session_started_at: "2026-07-29T09:59:00.000Z",
    session_expires_at: expiresAt,
  });

  if (!boundary) throw new Error("Expected confirmation boundary.");

  return { runtime, prepared: preparation, boundary };
}

function issue(
  boundary: Action650sManualConfirmationBoundary,
  prepared: Action650sPreparedExecution,
  instant = confirmedAt,
) {
  return boundary.confirm(prepared, {
    confirmed_at: instant,
    confirming_actor_class: "human_operator",
    session_identity: "review-manual-session-a",
  });
}

function terminal(
  prepared: Action650sPreparedExecution,
  overrides: Partial<Action650sSimulatedBrokerTerminalEvent> = {},
): Action650sSimulatedBrokerTerminalEvent {
  return {
    ...buildAction650sSimulatedBrokerEventBinding(prepared),
    event_type: "terminal",
    terminal_status: "completed",
    simulated_broker_order_identity: "review-simulated-order-a",
    observed_at: "2026-07-29T10:03:00.000Z",
    ...overrides,
  };
}

function replay(input: {
  prepared: Action650sPreparedExecution;
  boundary: Action650sManualConfirmationBoundary;
  capability: Action650sManualConfirmationCapability;
  events?: readonly Action650sSimulatedBrokerTerminalEvent[];
}) {
  return replayAction650sConfirmedExecution({
    prepared: input.prepared,
    boundary: input.boundary,
    capability: input.capability,
    consumed_at: consumedAt,
    broker_events: input.events ?? [terminal(input.prepared)],
  });
}

test("Action 650T rejects spread, JSON, structured, prototype, and proxy capability substitution", () => {
  const value = scenario();
  const confirmation = issue(value.boundary, value.prepared);
  if (!confirmation.ok) throw new Error(confirmation.reason);
  const capability = confirmation.capability;
  const substitutions = [
    { ...capability },
    JSON.parse(JSON.stringify(capability)),
    structuredClone(capability),
    Object.create(capability),
    new Proxy(capability, {}),
  ] as Action650sManualConfirmationCapability[];

  for (const substitution of substitutions) {
    expect(
      replay({ ...value, capability: substitution }).blocked_reason,
    ).toBe("manual_confirmation_unverified");
  }
});

test("Action 650T exact expiry instant is already outside confirmation authority", () => {
  const value = scenario("review-execution-expiry-boundary");

  expect(issue(value.boundary, value.prepared, expiresAt)).toEqual({
    ok: false,
    reason: "confirmation_expired",
  });
});

test("Action 650T confirmation instant cannot predate the prepared waiting state", () => {
  const value = scenario("review-execution-before-preparation");

  expect(
    issue(value.boundary, value.prepared, "2026-07-29T09:59:30.000Z"),
  ).toEqual({
    ok: false,
    reason: "confirmation_invalid",
  });
});

test("Action 650T one-shot capability has no accessor hook and blocks reentrant reuse", () => {
  const value = scenario("review-execution-reentrant");
  const confirmation = issue(value.boundary, value.prepared);
  if (!confirmation.ok) throw new Error(confirmation.reason);

  for (const descriptor of Object.values(
    Object.getOwnPropertyDescriptors(confirmation.capability),
  )) {
    expect(descriptor.get).toBeUndefined();
    expect(descriptor.set).toBeUndefined();
  }

  expect(replay({ ...value, capability: confirmation.capability }).safety_decision).toBe(
    "passed",
  );
  expect(replay({ ...value, capability: confirmation.capability })).toMatchObject({
    safety_decision: "blocked",
    blocked_reason: "manual_confirmation_unverified",
    broker_progress_events_accepted: 0,
    terminal_result: null,
  });
});

test("Action 650T automatic-mode structural substitution cannot receive confirmation", () => {
  const value = scenario("review-execution-automatic-substitution");
  const automatic = structuredClone(value.prepared) as Action650sPreparedExecution;
  Object.assign(automatic.handoff.payload, { execution_mode: "automatic" });

  expect(issue(value.boundary, automatic)).toEqual({
    ok: false,
    reason: "preparation_provenance_unproven",
  });
});

test("Action 650T preserves the relevant Actions 647-649 successor contracts", () => {
  const runtime = createAction650sRuntimeIdentityContext({
    execution_identity: "review-647-649",
    runtime_instance_identity: "review-runtime-647-649",
    runtime_session_identity: "review-session-647-649",
    created_at: "2026-07-29T09:55:00.000Z",
  });
  if (!runtime) throw new Error("Expected runtime identity.");
  const preparation = prepareAction650sExecution({
    runtime,
    candidates: [
      candidate("recommendation_entry"),
      candidate("target_reached"),
      candidate("stop_loss_reached"),
    ],
    observed_at: preparedAt,
  });
  if (preparation.current_state !== "waiting_for_manual_confirmation") {
    throw new Error("Expected preparation.");
  }

  expect(preparation.selected_candidate.priority).toBe(1);
  expect(preparation.handoff.identity).toMatchObject({
    execution_identity: runtime.execution_identity,
    lifecycle_identity: runtime.lifecycle_identity,
    runtime_identity_context_digest: runtime.context_digest,
  });
  expect(preparation.handoff.identity.idempotency_identity).toContain(
    "action_650s_idempotency_",
  );
  expect(preparation.effects.broker_requests_submitted).toBe(0);
});

test("Action 650T resolves the complete successor import graph and finds no indirect dynamic edge", () => {
  const modules = [
    "lib/action-650s-execution-identity.ts",
    "lib/action-650s-execution-preparation.ts",
    "lib/action-650s-manual-confirmation.ts",
    "lib/action-650s-confirmed-execution-replay.ts",
  ];
  const allowed = new Set([
    "node:crypto",
    "@/lib/action-650s-execution-identity",
    "@/lib/action-650s-execution-preparation",
    "@/lib/action-650s-manual-confirmation",
  ]);

  for (const modulePath of modules) {
    const source = readFileSync(resolve(root, modulePath), "utf8");
    const imports = Array.from(
      source.matchAll(/from\s+["']([^"']+)["']/g),
      (match) => match[1],
    );

    expect(source, modulePath).not.toMatch(/\bimport\s*\(|\brequire\s*\(/);
    expect(source, modulePath).not.toMatch(
      /\bfetch\s*\(|\bWebSocket\b|\bprocess\.(?:env|argv|cwd)\b/,
    );
    for (const imported of imports) {
      expect(allowed.has(imported), `${modulePath}: ${imported}`).toBe(true);
    }
  }
});
