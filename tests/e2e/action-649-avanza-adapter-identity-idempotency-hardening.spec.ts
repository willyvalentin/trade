import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildAvanzaAdapterExecutionIdentity,
  buildAvanzaAdapterRequest,
  canonicalizeAvanzaAdapterPayload,
  fingerprintAvanzaAdapterPayload,
  reconcileAvanzaAdapterTerminalConfirmation,
  toAvanzaAdapterLogSafeRequest,
  validateAvanzaAdapterConfirmation,
  validateAvanzaAdapterProgress,
} from "../../lib/avanza-adapter-identity";
import { createExplicitExecutionRuntimeIdentityContext } from "../../lib/execution-runtime-identity";
import { replayExecutionAgentSafety, type ExecutionSafetyReplayFixture } from "../../lib/execution-agent-deterministic-safety-replay";

const sourcePath = resolve(__dirname, "../../lib/avanza-adapter-identity.ts");

function runtime(executionId = "action-649-execution") {
  return createExplicitExecutionRuntimeIdentityContext({
    now: "2026-07-24T14:00:00.000Z",
    executionId,
  });
}

function payload(overrides: Record<string, unknown> = {}) {
  const value = canonicalizeAvanzaAdapterPayload({
    ticker: "aapl",
    side: "buy",
    quantity: 2,
    order_type: "limit",
    limit_price: 200,
    stop_price: 195,
    position_id: null,
    execution_mode: "semi_automatic",
    authority_scope: "manual_final_confirmation",
    created_at: "2026-07-24T14:00:00+00:00",
    ...overrides,
  });
  expect(value).not.toBeNull();
  return value!;
}

function request(overrides: { executionId?: string; payload?: ReturnType<typeof payload>; automatic?: boolean } = {}) {
  const built = buildAvanzaAdapterRequest({
    runtime: runtime(overrides.executionId),
    payload: overrides.payload ?? payload(),
    automatic_authority_granted: overrides.automatic ?? false,
  });
  expect(built).not.toBeNull();
  return built!;
}

function confirmation(value = request()) {
  return {
    execution_id: value.identity.execution_id,
    payload_fingerprint: value.identity.payload_fingerprint,
    broker_request_id: value.identity.broker_request_id,
    correlation_id: value.identity.correlation_id,
    side: value.payload.side,
    ticker: value.payload.ticker,
    quantity: value.payload.quantity,
    terminal_status: "filled" as const,
    broker_order_id: "avanza-order-649",
  };
}

test("Action 649 canonicalizes equivalent payloads independently of input formatting and key order", () => {
  const first = payload();
  const reordered = canonicalizeAvanzaAdapterPayload({ authority_scope: "manual_final_confirmation", created_at: "2026-07-24T14:00:00.000Z", execution_mode: "semi_automatic", position_id: null, stop_price: 195, limit_price: 200, order_type: "LIMIT", quantity: 2, side: "BUY", ticker: "AAPL" });
  expect(reordered).toEqual(first);
  expect(fingerprintAvanzaAdapterPayload(first)).toBe(fingerprintAvanzaAdapterPayload(reordered!));
});

test("Action 649 changes payload and idempotency identity for every material order change", () => {
  const base = request();
  for (const changed of [
    { ticker: "MSFT" }, { side: "SELL" }, { quantity: 3 }, { limit_price: 201 },
    { stop_price: 194 }, { order_type: "MARKET", limit_price: null }, { position_id: "position-649" },
    { execution_mode: "automatic", authority_scope: "automatic_final_submit" },
  ]) {
    const replacement = request({ payload: payload(changed), automatic: true });
    expect(replacement.identity.payload_fingerprint).not.toBe(base.identity.payload_fingerprint);
    expect(replacement.identity.idempotency_key).not.toBe(base.identity.idempotency_key);
  }
});

test("Action 649 preserves supplied core identity across preparation, retry, and automatic authority checks", () => {
  const semi = request();
  const retry = request();
  expect(semi.identity).toEqual(retry.identity);
  expect(semi.requires_manual_confirmation).toBe(true);
  expect(semi.may_submit).toBe(false);
  const automaticPayload = payload({ execution_mode: "automatic", authority_scope: "automatic_final_submit" });
  expect(request({ payload: automaticPayload, automatic: false }).may_submit).toBe(false);
  expect(request({ payload: automaticPayload, automatic: true }).may_submit).toBe(true);
  expect(buildAvanzaAdapterExecutionIdentity({ ...runtime(), executionId: "", lifecycleId: "" }, payload())).toBeNull();
});

test("Action 649 rejects cross-execution progress and confirmation correlations", () => {
  const current = request();
  const base = confirmation(current);
  expect(validateAvanzaAdapterProgress(current, base)).toEqual({ ok: true, reason: "ok" });
  for (const mismatch of [
    { execution_id: "other-execution" }, { payload_fingerprint: "other-fingerprint" }, { side: "SELL" as const },
    { ticker: "MSFT" }, { quantity: 3 }, { broker_request_id: "other-request" },
  ]) {
    expect(validateAvanzaAdapterConfirmation(current, { ...base, ...mismatch })).toEqual({ ok: false, reason: "confirmation_mismatch" });
  }
});

test("Action 649 keeps duplicate terminal confirmation idempotent and conflicts fail closed", () => {
  const current = request();
  const accepted = confirmation(current);
  expect(reconcileAvanzaAdapterTerminalConfirmation({ request: current, accepted: null, incoming: accepted }).status).toBe("accepted");
  expect(reconcileAvanzaAdapterTerminalConfirmation({ request: current, accepted, incoming: accepted }).status).toBe("duplicate");
  expect(reconcileAvanzaAdapterTerminalConfirmation({ request: current, accepted, incoming: { ...accepted, broker_order_id: "conflict" } }).status).toBe("needs_review");
});

test("Action 649 excludes secrets and has no transport, browser, persistence, or provider path", () => {
  const source = readFileSync(sourcePath, "utf8");
  for (const forbidden of ["fetch(", "http://", "https://", "supabase", "localStorage", "writeFile", "getIntradayCandles", "Date.now", "Math.random", "randomUUID"]) expect(source).not.toContain(forbidden);
  const safe = toAvanzaAdapterLogSafeRequest(request());
  expect(JSON.stringify(safe)).not.toMatch(/cookie|credential|password|secret|session|token|api[_-]?key/i);
});

test("Action 649 replay exposes the hardened adapter identity without altering stop priority or semi-automatic behavior", () => {
  const fixture: ExecutionSafetyReplayFixture = {
    mode: "semi_automatic", automatic_authority_granted: false,
    candidates: [{ identity: "adapter-649", source: "live_position", trigger: "stop_loss_reached", ticker: "AAPL", quantity: 2, limit_price: 200, target_price: 210, stop_price: 195, recommendation_id: null, position_id: "position-649", created_at: "2026-07-24T14:00:00.000Z", expires_at: null }],
    lifecycle_starting_state: "idle", broker_progress_events: [], broker_terminal_result: null,
    previously_recorded_execution_identities: [], timestamps: { created_at: "2026-07-24T14:00:00.000Z", handoff_at: "2026-07-24T14:00:01.000Z", broker_at: "2026-07-24T14:00:02.000Z" },
  };
  const result = replayExecutionAgentSafety(fixture);
  expect(result.selected_candidate).toMatchObject({ action: "sell", priority: 1 });
  expect(result.adapter_request).toMatchObject({ requires_manual_confirmation: true, may_submit: false, identity: { execution_id: "replay_replay_intent_adapter-649" } });
});
