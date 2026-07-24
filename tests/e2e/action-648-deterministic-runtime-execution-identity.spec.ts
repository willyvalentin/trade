import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { buildAvanzaExecutionHandoff } from "../../lib/avanza-execution-handoff";
import { buildTureExecutionRecord } from "../../lib/broker-execution-capture";
import {
  getExecutionAuthorityForMode,
  getExecutionTriggerPriority,
  type ExecutionIntent,
} from "../../lib/execution";
import {
  runExecutionOrchestratorWithIdentity,
} from "../../lib/execution-orchestrator";
import {
  createExplicitExecutionRuntimeIdentityContext,
} from "../../lib/execution-runtime-identity";
import { createExecutionLifecycleSnapshot } from "../../lib/execution-state-machine";
import { replayExecutionAgentSafety, type ExecutionSafetyReplayFixture } from "../../lib/execution-agent-deterministic-safety-replay";

const root = resolve(__dirname, "../..");
const corePaths = [
  "lib/execution-orchestrator.ts",
  "lib/execution-state-machine.ts",
  "lib/avanza-execution-handoff.ts",
  "lib/broker-execution-capture.ts",
];

function intent(mode: "semi_automatic" | "automatic" = "semi_automatic"): ExecutionIntent {
  return {
    intent_version: "1.0",
    intent_id: "action-648-intent",
    created_at: "2026-07-24T14:00:00.000Z",
    mode,
    authority: getExecutionAuthorityForMode(mode),
    action: "buy",
    trigger_type: "entry_recommendation_ready",
    trigger_priority: getExecutionTriggerPriority("entry_recommendation_ready"),
    broker_hint: "AVANZA",
    source: "recommendation",
    trading_package: {
      package_version: "1.0",
      recommendation_id: "rec-action-648",
      live_position_id: null,
      ticker: "AAPL",
      market: "US",
      quantity: 1,
      order_type: "limit",
      limit_price: 200,
      stop_loss: 195,
      target_price: 210,
      expires_at: "2026-07-24T15:00:00.000Z",
      payload_id: "payload-action-648",
      payload_fingerprint: "payload-fingerprint-action-648",
    },
    safety_warnings: [],
    broker_result: null,
  };
}

function identity(executionId = "action-648-execution", now = "2026-07-24T14:00:00.000Z") {
  return createExplicitExecutionRuntimeIdentityContext({ executionId, now });
}

function replayFixture(overrides: Partial<ExecutionSafetyReplayFixture> = {}): ExecutionSafetyReplayFixture {
  return {
    mode: "semi_automatic",
    automatic_authority_granted: false,
    candidates: [{ identity: "action-648-aapl", source: "recommendation", trigger: "recommendation_entry", ticker: "AAPL", quantity: 1, limit_price: 200, target_price: 210, stop_price: 195, recommendation_id: "rec-action-648", position_id: null, created_at: "2026-07-24T14:00:00.000Z", expires_at: "2026-07-24T15:00:00.000Z" }],
    lifecycle_starting_state: "idle",
    broker_progress_events: [],
    broker_terminal_result: null,
    previously_recorded_execution_identities: [],
    timestamps: { created_at: "2026-07-24T14:00:00.000Z", handoff_at: "2026-07-24T14:00:01.000Z", broker_at: "2026-07-24T14:00:02.000Z" },
    ...overrides,
  };
}

test("Action 648 execution-critical core has no direct clock or random fallback", () => {
  for (const path of corePaths) {
    const source = readFileSync(resolve(root, path), "utf8");
    for (const forbidden of ["Date.now", "Math.random", "randomUUID", "new Date("]) {
      expect(source, `${path} contains ${forbidden}`).not.toContain(forbidden);
    }
  }
});

test("Action 648 fails closed when lifecycle, handoff, or record identity is absent", () => {
  expect(() => createExecutionLifecycleSnapshot({ createdAt: "2026-07-24T14:00:00.000Z" })).toThrow("identity context");
  expect(buildAvanzaExecutionHandoff(intent())).toMatchObject({ status: "blocked", blockedReason: "Execution runtime identity context is required." });
  expect(buildTureExecutionRecord(intent(), { broker: "avanza", action: "buy", ticker: "AAPL", quantity: 1, status: "filled" }, { createdAt: "2026-07-24T14:00:02.000Z" }).captureStatus).toBe("identity_context_missing");
});

test("Action 648 explicit context makes the core orchestration trace deterministic", () => {
  const input = { candidateIntents: [intent()], mode: "semi_automatic" as const };
  const first = runExecutionOrchestratorWithIdentity(input, identity());
  const second = runExecutionOrchestratorWithIdentity(input, identity());
  expect(first).toEqual(second);
  expect(first.lifecycle.events.map((event) => event.eventId)).toEqual([
    "execution_event_action-648-execution_001_create_intent",
    "execution_event_action-648-execution_002_select_candidate",
    "execution_event_action-648-execution_003_create_handoff",
  ]);
});

test("Action 648 context changes never change authority, candidate priority, or semi-automatic prohibition", () => {
  const input = { candidateIntents: [intent()], mode: "semi_automatic" as const };
  const first = runExecutionOrchestratorWithIdentity(input, identity("identity-one", "2026-07-24T14:00:00.000Z"));
  const second = runExecutionOrchestratorWithIdentity(input, identity("identity-two", "2026-07-24T14:01:00.000Z"));
  expect(first.selectedIntent?.intent_id).toBe(second.selectedIntent?.intent_id);
  expect(first.selectedIntent?.trigger_priority).toBe(second.selectedIntent?.trigger_priority);
  expect(first.handoff?.authority).toEqual(second.handoff?.authority);
  expect(first.handoff?.canSubmitFinalOrder).toBe(false);
  expect(first.lifecycle.lifecycleId).not.toBe(second.lifecycle.lifecycleId);
});

test("Action 648 reuses the same identity contract for Action 647 replay", () => {
  const fixture = replayFixture();
  const first = replayExecutionAgentSafety(fixture);
  const resumed = replayExecutionAgentSafety(fixture);
  const stop = replayExecutionAgentSafety(replayFixture({ candidates: [{ ...fixture.candidates[0]!, identity: "action-648-stop", source: "live_position", trigger: "stop_loss_reached", recommendation_id: null, position_id: "position-action-648", expires_at: null }] }));
  expect(first).toEqual(resumed);
  expect(first.audit_events[0]?.audit_event_id).toContain("execution_audit_replay_replay_intent_action-648-aapl");
  expect(stop.selected_candidate).toMatchObject({ action: "sell", priority: 1 });
  expect(stop.submission_permitted).toBe(false);
});
