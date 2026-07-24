import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { replayExecutionAgentSafety, type ExecutionSafetyReplayFixture } from "../../lib/execution-agent-deterministic-safety-replay";

const root = resolve(__dirname, "../..");
const sourcePath = resolve(root, "lib/execution-agent-deterministic-safety-replay.ts");
const times = { created_at: "2026-07-24T14:00:00.000Z", handoff_at: "2026-07-24T14:00:01.000Z", broker_at: "2026-07-24T14:00:02.000Z" } as const;

function candidate(overrides: Partial<ExecutionSafetyReplayFixture["candidates"][number]> = {}) {
  return { identity: "candidate-aapl", source: "recommendation" as const, trigger: "recommendation_entry" as const, ticker: "AAPL", quantity: 2, limit_price: 200, target_price: 210, stop_price: 195, recommendation_id: "rec-aapl", position_id: null, created_at: times.created_at, expires_at: "2026-07-24T15:00:00.000Z", ...overrides };
}

function fixture(overrides: Partial<ExecutionSafetyReplayFixture> = {}): ExecutionSafetyReplayFixture {
  return { mode: "semi_automatic", automatic_authority_granted: false, candidates: [candidate()], lifecycle_starting_state: "idle", broker_progress_events: [], broker_terminal_result: null, previously_recorded_execution_identities: [], timestamps: times, ...overrides };
}

function broker(status: "filled" | "rejected" | "cancelled" | "unknown", overrides: Partial<NonNullable<ExecutionSafetyReplayFixture["broker_terminal_result"]>> = {}) {
  return { execution_identity: "replay_intent_candidate-aapl", status, broker_order_id: "order-aapl", captured_at: times.broker_at, quantity: 2, executed_price: 200, ticker: "AAPL", action: "buy" as const, ...overrides };
}

test("Action 647 preserves semi-automatic buy and stop-loss sell handoffs without submission", () => {
  const entry = replayExecutionAgentSafety(fixture());
  const stop = replayExecutionAgentSafety(fixture({ candidates: [candidate({ identity: "position-aapl", source: "live_position", trigger: "stop_loss_reached", recommendation_id: null, position_id: "position-aapl", expires_at: null })] }));
  expect(entry.handoff_request?.action).toBe("buy");
  expect(entry.lifecycle.currentState).toBe("waiting_for_manual_confirmation");
  expect(entry.submission_permitted).toBe(false);
  expect(stop.handoff_request?.action).toBe("sell");
  expect(stop.lifecycle.currentState).toBe("waiting_for_manual_confirmation");
  expect(stop.effects.broker_requests_submitted).toBe(0);
});

test("Action 647 blocks automatic entry without authority and allows only authorized automatic submission state", () => {
  const blocked = replayExecutionAgentSafety(fixture({ mode: "automatic", automatic_authority_granted: false }));
  const authorized = replayExecutionAgentSafety(fixture({ mode: "automatic", automatic_authority_granted: true }));
  expect(blocked.blocked_reason).toBe("automatic_authority_missing");
  expect(blocked.lifecycle.currentState).not.toBe("broker_order_submitting");
  expect(authorized.lifecycle.currentState).toBe("broker_order_submitting");
  expect(authorized.submission_permitted).toBe(true);
  expect(authorized.effects.broker_requests_submitted).toBe(0);
});

test("Action 647 gives stop loss precedence over target and new entry", () => {
  const result = replayExecutionAgentSafety(fixture({ candidates: [candidate(), candidate({ identity: "target", source: "live_position", trigger: "target_reached", recommendation_id: null, position_id: "position-target", expires_at: null }), candidate({ identity: "stop", source: "live_position", trigger: "target_and_stop_reached", recommendation_id: null, position_id: "position-stop", expires_at: null })] }));
  expect(result.selected_candidate).toMatchObject({ identity: "stop", action: "sell", priority: 1, trigger: "target_and_stop_reached" });
});

test("Action 647 gives target exits priority over entries and records only the selected sell position", () => {
  const position = candidate({ identity: "position-target", source: "live_position", trigger: "target_reached", recommendation_id: null, position_id: "position-target", expires_at: null });
  const result = replayExecutionAgentSafety(fixture({
    mode: "automatic",
    automatic_authority_granted: true,
    candidates: [candidate(), position],
    broker_terminal_result: broker("filled", { execution_identity: "replay_intent_position-target", broker_order_id: "order-target", ticker: "AAPL", action: "sell" }),
  }));
  expect(result.selected_candidate).toMatchObject({ identity: "position-target", action: "sell", priority: 4 });
  expect(result.execution_record).toMatchObject({ positionId: "position-target", action: "sell", captureStatus: "captured" });
  expect(result.effects.trade_mutations).toBe(1);
});

test("Action 647 permits an authorized automatic stop-loss SÄLJ simulation without a real broker request", () => {
  const stop = candidate({ identity: "position-stop", source: "live_position", trigger: "stop_loss_reached", recommendation_id: null, position_id: "position-stop", expires_at: null });
  const result = replayExecutionAgentSafety(fixture({ mode: "automatic", automatic_authority_granted: true, candidates: [stop] }));
  expect(result.handoff_request).toMatchObject({ action: "sell", canSubmitFinalOrder: true });
  expect(result.lifecycle.currentState).toBe("broker_order_submitting");
  expect(result.effects).toMatchObject({ broker_requests_submitted: 0, simulated_submission_permitted: 1 });
});

test("Action 647 blocks stale recommendations and invalid quantities", () => {
  expect(replayExecutionAgentSafety(fixture({ candidates: [candidate({ expires_at: "2026-07-24T13:59:59.000Z" })] })).blocked_reason).toBe("recommendation_stale");
  expect(replayExecutionAgentSafety(fixture({ candidates: [candidate({ quantity: null })] })).safety_check_result).toBe("blocked");
});

test("Action 647 normalizes terminal broker outcomes with an exact lifecycle and audit trace", () => {
  const successful = replayExecutionAgentSafety(fixture({ mode: "automatic", automatic_authority_granted: true, broker_terminal_result: broker("filled") }));
  const rejected = replayExecutionAgentSafety(fixture({ mode: "automatic", automatic_authority_granted: true, broker_terminal_result: broker("rejected") }));
  const cancelled = replayExecutionAgentSafety(fixture({ mode: "automatic", automatic_authority_granted: true, broker_terminal_result: broker("cancelled") }));
  const unknown = replayExecutionAgentSafety(fixture({ mode: "automatic", automatic_authority_granted: true, broker_terminal_result: broker("unknown") }));
  expect(successful.lifecycle_transitions.map((event) => event.type)).toEqual(["create_intent", "select_candidate", "create_handoff", "start_broker_preparation", "submit_broker_order", "capture_broker_result", "complete_execution"]);
  expect(successful.audit_events.map((event) => event.type)).toEqual(["simulated_submission_permitted", "execution_completed"]);
  expect(successful.execution_record?.captureStatus).toBe("captured");
  expect(rejected.lifecycle.currentState).toBe("failed");
  expect(cancelled.lifecycle.currentState).toBe("cancelled");
  expect(unknown.lifecycle.currentState).toBe("unknown");
});

test("Action 647 rejects duplicate, conflicting, partial, and cross-trade broker outcomes", () => {
  const duplicate = replayExecutionAgentSafety(fixture({ mode: "automatic", automatic_authority_granted: true, broker_terminal_result: broker("filled"), previously_recorded_execution_identities: [{ execution_identity: "replay_intent_candidate-aapl", broker_order_id: "order-aapl", terminal_status: "completed" }] }));
  const conflict = replayExecutionAgentSafety(fixture({ mode: "automatic", automatic_authority_granted: true, broker_terminal_result: broker("filled"), previously_recorded_execution_identities: [{ execution_identity: "replay_intent_candidate-aapl", broker_order_id: "other-order", terminal_status: "completed" }] }));
  const partial = replayExecutionAgentSafety(fixture({ mode: "automatic", automatic_authority_granted: true, broker_progress_events: ["preparing", "submitting"] }));
  const crossTrade = replayExecutionAgentSafety(fixture({ mode: "automatic", automatic_authority_granted: true, broker_terminal_result: broker("filled", { execution_identity: "replay_intent_other" }) }));
  expect(duplicate.blocked_reason).toBe("duplicate_broker_confirmation");
  expect(duplicate.effects.execution_records_created).toBe(0);
  expect(conflict.blocked_reason).toBe("conflicting_broker_confirmation");
  expect(partial.lifecycle.currentState).toBe("broker_order_submitting");
  expect(partial.audit_events.map((event) => event.type)).toEqual(["simulated_submission_permitted", "broker_progress_preparing", "broker_progress_submitting"]);
  expect(crossTrade.blocked_reason).toBe("broker_result_cross_execution_mismatch");
});

test("Action 647 replay is deterministic, restart-safe, and has no network or write path", () => {
  const input = fixture({ mode: "automatic", automatic_authority_granted: true, broker_terminal_result: broker("filled") });
  const first = replayExecutionAgentSafety(input);
  const restarted = replayExecutionAgentSafety(input);
  const changed = replayExecutionAgentSafety({ ...input, candidates: [candidate({ quantity: 3 })] });
  expect(first).toEqual(restarted);
  expect(first.replay_fingerprint).not.toBe(changed.replay_fingerprint);
  expect(first.effects).toMatchObject({ provider_calls: 0, database_writes: 0, broker_requests_submitted: 0, real_trade_mutations: 0 });
  const source = readFileSync(sourcePath, "utf8");
  for (const forbidden of ["fetch(", "http://", "https://", "process.env", "Date.now", "Math.random", "localStorage", "writeFile", "supabase", "getIntradayCandles"]) expect(source).not.toContain(forbidden);
});
