import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
  type Action650uManualConfirmationBoundary,
  type Action650uManualConfirmationCapability,
} from "../../lib/action-650u-manual-confirmation";

const root = resolve(__dirname, "../..");
const waitingAt = "2026-07-29T10:00:00.000000000Z";
const confirmedAt = "2026-07-29T10:01:00.000000000Z";
const consumedAt = "2026-07-29T10:02:00.000000000Z";
const expiresAt = "2026-07-29T10:10:00.000000000Z";

function candidate(
  trigger: Action650sExecutionCandidate["trigger"] = "stop_loss_reached",
): Action650sExecutionCandidate {
  return {
    candidate_identity: `650u-threat-${trigger}`,
    trigger,
    ticker: "AAPL",
    side: trigger === "recommendation_entry" ? "BUY" : "SELL",
    quantity: 5,
    order_type: trigger === "stop_loss_reached" ? "STOP_LIMIT" : "LIMIT",
    limit_price: trigger === "stop_loss_reached" ? 179 : 180,
    stop_price: trigger === "stop_loss_reached" ? 180 : null,
    created_at: "2026-07-29T09:50:00.000Z",
    expires_at:
      trigger === "recommendation_entry"
        ? "2026-07-29T10:30:00.000Z"
        : null,
  };
}

function scenario(execution = "650u-threat-execution") {
  const runtime = createAction650sRuntimeIdentityContext({
    execution_identity: execution,
    runtime_instance_identity: "650u-threat-runtime",
    runtime_session_identity: "650u-threat-runtime-session",
    created_at: "2026-07-29T09:55:00.000Z",
  });
  if (!runtime) throw new Error("Expected runtime.");

  const prepared = prepareAction650sExecution({
    runtime,
    candidates: [candidate()],
    observed_at: waitingAt,
  });
  if (prepared.current_state !== "waiting_for_manual_confirmation") {
    throw new Error("Expected preparation.");
  }

  const boundary = createAction650uManualConfirmationBoundary({
    runtime,
    session_identity: "650u-threat-session",
    session_started_at: "2026-07-29T09:59:00.000000000Z",
    session_expires_at: expiresAt,
  });
  if (!boundary) throw new Error("Expected boundary.");

  return { runtime, prepared, boundary };
}

function issue(
  boundary: Action650uManualConfirmationBoundary,
  prepared: Action650sPreparedExecution,
  instant = confirmedAt,
) {
  return boundary.confirm(prepared, {
    confirmed_at: instant,
    confirming_actor_class: "human_operator",
    session_identity: "650u-threat-session",
  });
}

function terminal(
  prepared: Action650sPreparedExecution,
): Action650uSimulatedBrokerTerminalEvent {
  return {
    ...buildAction650uSimulatedBrokerEventBinding(prepared),
    event_type: "terminal",
    terminal_status: "completed",
    simulated_broker_order_identity: "650u-threat-simulated-order",
    observed_at: "2026-07-29T10:03:00.000000000Z",
  };
}

function replay(input: {
  prepared: Action650sPreparedExecution;
  boundary: Action650uManualConfirmationBoundary;
  capability: Action650uManualConfirmationCapability;
}) {
  return replayAction650uConfirmedExecution({
    ...input,
    consumed_at: consumedAt,
    broker_events: [terminal(input.prepared)],
  });
}

test("Action 650U successor rejects spread, JSON, structured, prototype, and proxy capability substitution", () => {
  const value = scenario();
  const confirmation = issue(value.boundary, value.prepared);
  if (!confirmation.ok) throw new Error(confirmation.reason);

  const substitutions = [
    { ...confirmation.capability },
    JSON.parse(JSON.stringify(confirmation.capability)),
    structuredClone(confirmation.capability),
    Object.create(confirmation.capability),
    new Proxy(confirmation.capability, {}),
  ] as Action650uManualConfirmationCapability[];

  for (const capability of substitutions) {
    expect(replay({ ...value, capability }).blocked_reason).toBe(
      "manual_confirmation_unverified",
    );
  }
});

test("Action 650U successor rejects the exact expiry instant", () => {
  const value = scenario("650u-threat-expiry");

  expect(issue(value.boundary, value.prepared, expiresAt)).toEqual({
    ok: false,
    reason: "manual_confirmation_session_expired",
  });
});

test("Action 650U successor rejects confirmation before the waiting state", () => {
  const value = scenario("650u-threat-before-waiting");

  expect(
    issue(
      value.boundary,
      value.prepared,
      "2026-07-29T09:59:59.999999999Z",
    ),
  ).toEqual({
    ok: false,
    reason: "manual_confirmation_before_waiting_boundary",
  });
});

test("Action 650U successor capability has no accessor hook and blocks reuse", () => {
  const value = scenario("650u-threat-reuse");
  const confirmation = issue(value.boundary, value.prepared);
  if (!confirmation.ok) throw new Error(confirmation.reason);

  for (const descriptor of Object.values(
    Object.getOwnPropertyDescriptors(confirmation.capability),
  )) {
    expect(descriptor.get).toBeUndefined();
    expect(descriptor.set).toBeUndefined();
  }

  expect(
    replay({ ...value, capability: confirmation.capability }).safety_decision,
  ).toBe("passed");
  expect(
    replay({ ...value, capability: confirmation.capability }),
  ).toMatchObject({
    safety_decision: "blocked",
    blocked_reason: "manual_confirmation_unverified",
    broker_progress_events_accepted: 0,
    terminal_result: null,
  });
});

test("Action 650U successor rejects automatic-mode structural substitution", () => {
  const value = scenario("650u-threat-automatic");
  const automatic = structuredClone(value.prepared) as Action650sPreparedExecution;
  Object.assign(automatic.handoff.payload, { execution_mode: "automatic" });

  expect(issue(value.boundary, automatic)).toEqual({
    ok: false,
    reason: "preparation_provenance_unproven",
  });
});

test("Action 650U successor preserves relevant Actions 647-649 contracts", () => {
  const value = scenario("650u-threat-647-649");

  expect(value.prepared.selected_candidate.priority).toBe(1);
  expect(value.prepared.handoff.identity).toMatchObject({
    execution_identity: value.runtime.execution_identity,
    lifecycle_identity: value.runtime.lifecycle_identity,
    runtime_identity_context_digest: value.runtime.context_digest,
  });
  expect(value.prepared.handoff.identity.idempotency_identity).toContain(
    "action_650s_idempotency_",
  );
  expect(value.prepared.effects.broker_requests_submitted).toBe(0);
});

test("Action 650U successor resolves its complete import graph without an indirect dynamic edge", () => {
  const modules = [
    "lib/action-650u-temporal-confirmation-policy.ts",
    "lib/action-650u-manual-confirmation.ts",
    "lib/action-650u-confirmed-execution-replay.ts",
  ];
  const allowed = new Set([
    "@/lib/action-650s-confirmed-execution-replay",
    "@/lib/action-650s-execution-identity",
    "@/lib/action-650s-execution-preparation",
    "@/lib/action-650u-manual-confirmation",
    "@/lib/action-650u-temporal-confirmation-policy",
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
