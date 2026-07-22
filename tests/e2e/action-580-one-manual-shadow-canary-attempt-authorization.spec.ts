import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
  buildContinuousIntelligenceShadowCanaryManualExecutionHandoff,
  continuousIntelligenceShadowCanaryAction581ContinuationRequirement,
  continuousIntelligenceShadowCanaryManualAuthorizationConsumeRpcName,
  continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
  continuousIntelligenceShadowCanaryManualAuthorizationIssueRpcName,
  continuousIntelligenceShadowCanaryManualAuthorizationPurpose,
  continuousIntelligenceShadowCanaryManualAuthorizationTtlSeconds,
  evaluateContinuousIntelligenceShadowCanaryManualExecutionGate,
  sanitizeContinuousIntelligenceShadowCanaryManualAuthorization,
  type ContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
  type ContinuousIntelligenceShadowCanaryManualAuthorizationRecord,
} from "../../lib/continuous-intelligence-shadow-canary-manual-authorization";
import {
  buildContinuousIntelligenceShadowCanaryLifecycleIdentity,
  buildContinuousIntelligenceShadowCanaryPreflight,
} from "../../lib/continuous-intelligence-shadow-collector-canary";
import {
  buildUsEquityMarketCalendarEvaluation,
  usEquityMarketCalendarValidation,
} from "../../lib/us-equity-market-calendar";

const issuanceRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization/route.ts";
const gateRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/manual-execution-gate/route.ts";
const executionRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/route.ts";
const migrationPath = "supabase/migrations/20260722001000_create_continuous_intelligence_shadow_canary_manual_authorizations.sql";
const persistencePath = "lib/server/continuous-intelligence-shadow-canary-manual-authorization-persistence.ts";
const now = new Date("2026-07-22T15:00:00.000Z");

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function binding(overrides: Partial<ContinuousIntelligenceShadowCanaryManualAuthorizationBinding> = {}) {
  const preflight = buildContinuousIntelligenceShadowCanaryPreflight({
    now,
    calendar: buildUsEquityMarketCalendarEvaluation(now),
    enabled_flag: "true",
    kill_switch: "false",
    provider_configured: true,
    provider_metadata_status: "within_budget",
    daily_usage: { status: "available", run_count: 0, estimated_credits: 0 },
  });
  expect(preflight.eligible).toBe(true);
  const identity = buildContinuousIntelligenceShadowCanaryLifecycleIdentity({ preflight, now });
  if (!identity || !usEquityMarketCalendarValidation.computed_fingerprint) throw new Error("Expected canary fixture identity.");
  const result = buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding({
    preflight,
    lifecycle_identity: identity,
    calendar_fingerprint: usEquityMarketCalendarValidation.computed_fingerprint,
    deployment_commit: "a".repeat(40),
    deployment_build_marker: "continuous_intelligence_shadow_canary_function_foundation_v1",
  });
  if (!result) throw new Error("Expected manual authorization fixture binding.");
  return { ...result, ...overrides };
}

function authorization(
  bound = binding(),
  overrides: Partial<ContinuousIntelligenceShadowCanaryManualAuthorizationRecord> = {},
): ContinuousIntelligenceShadowCanaryManualAuthorizationRecord {
  return {
    ...bound,
    authorization_id: "manual_canary_authorization_fixture",
    issued_at: now.toISOString(),
    expires_at: new Date(now.getTime() + 60_000).toISOString(),
    consumed_at: null,
    status: "issued",
    ...overrides,
  };
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function fakeDatabase() {
  const records = new Map<string, ContinuousIntelligenceShadowCanaryManualAuthorizationRecord & { token_hash: string }>();
  const observed: { issue_inputs: unknown[]; consume_inputs: unknown[] } = { issue_inputs: [], consume_inputs: [] };
  return {
    records,
    observed,
    issue(input: { binding: ContinuousIntelligenceShadowCanaryManualAuthorizationBinding; authorization_id: string; raw_token: string }) {
      const durableInput = { ...input.binding, authorization_id: input.authorization_id, token_hash: tokenHash(input.raw_token) };
      observed.issue_inputs.push(structuredClone(durableInput));
      const active = [...records.values()].find((item) => item.status === "issued" && Date.parse(item.expires_at) > now.getTime());
      if (active) {
        const equal = active.request_fingerprint === input.binding.request_fingerprint && active.execution_id === input.binding.execution_id && active.claim_id === input.binding.claim_id && active.deployment_commit === input.binding.deployment_commit && active.deployment_build_marker === input.binding.deployment_build_marker;
        return { status: equal ? "already_issued" as const : "conflicting_active_authorization" as const, authorization: equal ? active : null };
      }
      const created: ContinuousIntelligenceShadowCanaryManualAuthorizationRecord & { token_hash: string } = {
        ...input.binding,
        authorization_id: input.authorization_id,
        token_hash: durableInput.token_hash,
        issued_at: now.toISOString(),
        expires_at: new Date(now.getTime() + 60_000).toISOString(),
        consumed_at: null,
        status: "issued",
      };
      records.set(created.authorization_id, created);
      return { status: "issued" as const, authorization: created };
    },
    consume(input: { authorization_id: string; raw_token: string; request_fingerprint: string; execution_id: string; claim_id: string }) {
      observed.consume_inputs.push(structuredClone(input));
      const found = records.get(input.authorization_id);
      if (!found || found.token_hash !== tokenHash(input.raw_token)) return { status: "invalid_token" as const, authorization: null };
      if (found.request_fingerprint !== input.request_fingerprint || found.execution_id !== input.execution_id || found.claim_id !== input.claim_id) return { status: "identity_mismatch" as const, authorization: found };
      if (found.status === "consumed") return { status: "already_consumed" as const, authorization: found };
      if (Date.parse(found.expires_at) <= now.getTime()) {
        found.status = "expired";
        return { status: "expired" as const, authorization: found };
      }
      if (found.status === "revoked") return { status: "revoked" as const, authorization: found };
      found.status = "consumed";
      found.consumed_at = now.toISOString();
      return { status: "consumed" as const, authorization: found };
    },
  };
}

function facts() {
  return {
    readiness_decision: "ready_for_one_manual_canary_attempt",
    canary_disabled: true,
    kill_switch_active: true,
    schedule_absent: true,
    daily_capacity_available: true,
    provider_budget_resolved: true,
    active_claim_conflict: false,
  };
}

test("Action 580 binds a single AAPL 5min completed range to the deployed calendar, policy, and lifecycle identity", () => {
  const bound = binding();
  expect(bound).toMatchObject({
    contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
    purpose: continuousIntelligenceShadowCanaryManualAuthorizationPurpose,
    ticker: "AAPL",
    interval: "5min",
    policy_total_credits: 377,
    policy_hard_reserve_credits: 57,
    policy_normal_planned_max_credits: 320,
    estimated_credits: 1,
  });
  expect(Date.parse(bound.requested_end) - Date.parse(bound.requested_start)).toBe(30 * 60 * 1000);
  expect(bound.claim_id).toContain(bound.execution_id);
  expect(buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding({
    preflight: { ...buildContinuousIntelligenceShadowCanaryPreflight({ now, calendar: buildUsEquityMarketCalendarEvaluation(now), enabled_flag: "true", kill_switch: "false", provider_configured: true, provider_metadata_status: "within_budget", daily_usage: { status: "available", run_count: 0, estimated_credits: 0 } }), request: { ticker: "AAPL", interval: "5min", start: bound.requested_start, end: new Date(Date.parse(bound.requested_end) + 60_000).toISOString() } },
    lifecycle_identity: { claim_id: bound.claim_id, execution_id: bound.execution_id, request_fingerprint: bound.request_fingerprint, expected_contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1", utc_day: "2026-07-22", source_receipt_id: "fixture" },
    calendar_fingerprint: bound.calendar_fingerprint,
    deployment_commit: bound.deployment_commit,
    deployment_build_marker: bound.deployment_build_marker,
  })).toBeNull();
});

test("Action 580 issuance persists a SHA-256 hash only, bounds TTL, and returns raw token only to the immediate authenticated response", async () => {
  const fixture = fakeDatabase();
  const token = "t".repeat(43);
  const issued = fixture.issue({ binding: binding(), authorization_id: "manual_canary_authorization_one", raw_token: token });
  expect(issued.status).toBe("issued");
  if (issued.status !== "issued") throw new Error("Expected issuance.");
  expect(Date.parse(issued.authorization.expires_at) - Date.parse(issued.authorization.issued_at)).toBeLessThanOrEqual(continuousIntelligenceShadowCanaryManualAuthorizationTtlSeconds * 1000);
  const input = fixture.observed.issue_inputs[0] as Record<string, unknown>;
  expect((fixture.records.get("manual_canary_authorization_one") ?? {}).token_hash).toBe(tokenHash(token));
  expect(JSON.stringify(input)).not.toContain(token);
  expect(JSON.stringify(sanitizeContinuousIntelligenceShadowCanaryManualAuthorization(issued.authorization))).not.toContain("token_hash");
});

test("Action 580 issuance is single-active, duplicate-idempotent, and conflicts fail closed", async () => {
  const fixture = fakeDatabase();
  const first = fixture.issue({ binding: binding(), authorization_id: "manual_canary_authorization_one", raw_token: "a".repeat(43) });
  const duplicate = fixture.issue({ binding: binding(), authorization_id: "manual_canary_authorization_two", raw_token: "b".repeat(43) });
  const conflict = fixture.issue({ binding: binding({ deployment_commit: "b".repeat(40) }), authorization_id: "manual_canary_authorization_three", raw_token: "c".repeat(43) });
  expect(first.status).toBe("issued");
  expect(duplicate.status).toBe("already_issued");
  expect(conflict.status).toBe("conflicting_active_authorization");
});

test("Action 580 durable consumption is exact-identity, single-use, expiry-aware, and has one concurrent winner", async () => {
  const fixture = fakeDatabase();
  const bound = binding();
  const token = "d".repeat(43);
  const issued = fixture.issue({ binding: bound, authorization_id: "manual_canary_authorization_consume", raw_token: token });
  if (issued.status !== "issued") throw new Error("Expected issuance.");
  const common = { authorization_id: issued.authorization.authorization_id, raw_token: token, request_fingerprint: bound.request_fingerprint, execution_id: bound.execution_id, claim_id: bound.claim_id };
  expect(fixture.consume({ ...common, claim_id: "wrong" }).status).toBe("identity_mismatch");
  expect(fixture.consume({ ...common, raw_token: "e".repeat(43) }).status).toBe("invalid_token");
  const results = await Promise.all([Promise.resolve(fixture.consume(common)), Promise.resolve(fixture.consume(common))]);
  expect(results.map((item) => item.status).sort()).toEqual(["already_consumed", "consumed"]);
  expect(fixture.consume(common).status).toBe("already_consumed");
});

test("Action 580 gate maps all changed static state to a conservative canonical outcome without provider work", () => {
  const bound = binding();
  const issued = authorization(bound);
  const gate = (overrides: Partial<ReturnType<typeof facts>> = {}) => evaluateContinuousIntelligenceShadowCanaryManualExecutionGate({ authorization: issued, expected_binding: bound, facts: { ...facts(), ...overrides }, now });
  expect(gate()).toBe("ready_for_one_manual_execution");
  expect(gate({ schedule_absent: false })).toBe("schedule_state_changed");
  expect(gate({ canary_disabled: false })).toBe("canary_state_changed");
  expect(gate({ kill_switch_active: false })).toBe("canary_state_changed");
  expect(gate({ daily_capacity_available: false })).toBe("daily_limit_reached");
  expect(gate({ provider_budget_resolved: false })).toBe("provider_budget_changed");
  expect(gate({ active_claim_conflict: true })).toBe("daily_limit_reached");
  expect(evaluateContinuousIntelligenceShadowCanaryManualExecutionGate({ authorization: authorization(bound, { expires_at: new Date(now.getTime() - 1).toISOString() }), expected_binding: bound, facts: facts(), now })).toBe("authorization_expired");
  expect(evaluateContinuousIntelligenceShadowCanaryManualExecutionGate({ authorization: authorization({ ...bound, deployment_commit: "z".repeat(40) }), expected_binding: bound, facts: facts(), now })).toBe("deployment_changed");
  expect(evaluateContinuousIntelligenceShadowCanaryManualExecutionGate({ authorization: authorization({ ...bound, calendar_fingerprint: "fnv1a32:00000000" }), expected_binding: bound, facts: facts(), now })).toBe("calendar_changed");
});

test("Action 580 records consumed-gate handoff as not-started only and never produces a client execution permit", () => {
  const bound = binding();
  const consumed = authorization(bound, { status: "consumed", consumed_at: now.toISOString() });
  const handoff = buildContinuousIntelligenceShadowCanaryManualExecutionHandoff({
    authorization: consumed,
    gate_outcome: "ready_for_one_manual_execution",
    gate_evaluated_at: now,
    dry_run: false,
  });
  expect(handoff).toMatchObject({
    authorization_id: consumed.authorization_id,
    consumed_at: now.toISOString(),
    execution_handoff_status: "gate_consumed_execution_not_started",
    provider_execution_occurred: false,
    client_continuation_allowed: false,
    required_action_581_design: continuousIntelligenceShadowCanaryAction581ContinuationRequirement,
  });
  expect(buildContinuousIntelligenceShadowCanaryManualExecutionHandoff({ authorization: consumed, gate_outcome: "ready_for_one_manual_execution", gate_evaluated_at: now, dry_run: true })).toBeNull();
  expect(buildContinuousIntelligenceShadowCanaryManualExecutionHandoff({ authorization: authorization(bound), gate_outcome: "ready_for_one_manual_execution", gate_evaluated_at: now, dry_run: false })).toBeNull();
  expect(JSON.stringify(handoff)).not.toContain("authorization_token");
});

test("Action 580 route and migration boundaries are authenticated, parameter-bounded, no-store, service-role-only, and provider-free", () => {
  const issuanceRoute = read(issuanceRoutePath);
  const gateRoute = read(gateRoutePath);
  const executionRoute = read(executionRoutePath);
  const migration = read(migrationPath);
  const persistence = read(persistencePath);
  expect(issuanceRoute).toContain("x-automation-secret");
  expect(gateRoute).toContain("x-automation-secret");
  expect(issuanceRoute).toContain('dynamic = "force-dynamic"');
  expect(gateRoute).toContain('"Cache-Control": "no-store"');
  expect(issuanceRoute).not.toContain("getIntradayCandlesWithDiagnostics");
  expect(gateRoute).not.toContain("getIntradayCandlesWithDiagnostics");
  expect(issuanceRoute).not.toContain("claimContinuousIntelligenceShadowCanaryDailyCapacity");
  expect(gateRoute).not.toContain("beginContinuousIntelligenceShadowCanaryAttempt");
  expect(executionRoute).toContain("manual_authorization_id");
  expect(executionRoute).toContain("manual_authorization_token");
  expect(executionRoute).toContain("manual_execution_continuation_not_implemented");
  expect(executionRoute).toContain('"authorization_id"');
  expect(executionRoute).toContain('"authorization_token"');
  expect(executionRoute).toContain('"execution_handoff"');
  const continuationBlocker = executionRoute.indexOf('manualAuthorization === "manual_continuation_not_implemented"');
  expect(continuationBlocker).toBeGreaterThan(-1);
  expect(continuationBlocker).toBeLessThan(executionRoute.indexOf("const preflight = buildContinuousIntelligenceShadowCanaryPreflight"));
  expect(continuationBlocker).toBeLessThan(executionRoute.indexOf("const claim = await claimContinuousIntelligenceShadowCanaryDailyCapacity"));
  expect(continuationBlocker).toBeLessThan(executionRoute.indexOf("const response = await getIntradayCandlesWithDiagnostics"));
  expect(executionRoute).not.toContain("consumeContinuousIntelligenceShadowCanaryManualAuthorization");
  expect(migration).toContain("token_hash text not null unique");
  expect(migration).not.toContain("raw_token");
  expect(migration).toContain(continuousIntelligenceShadowCanaryManualAuthorizationIssueRpcName);
  expect(migration).toContain(continuousIntelligenceShadowCanaryManualAuthorizationConsumeRpcName);
  expect(migration).toContain("grant execute on function public.issue_continuous_intelligence_shadow_canary_manual_authorization");
  expect(migration).toContain("to service_role");
  expect(migration).toContain("enable row level security");
  expect(persistence).toContain("client.rpc(");
  expect(persistence).toContain("p_authorization_token");
});
