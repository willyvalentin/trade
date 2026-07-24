import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
  evaluateContinuousIntelligenceShadowCanaryManualExecutionGate,
  matchesContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
  parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord,
} from "../../lib/continuous-intelligence-shadow-canary-manual-authorization";
import { buildContinuousIntelligenceShadowCanaryManualExecutionLeaseRecord } from "../../lib/continuous-intelligence-shadow-canary-manual-execution-lease";
import {
  buildContinuousIntelligenceShadowCanaryLifecycleIdentity,
  buildContinuousIntelligenceShadowCanaryPreflight,
} from "../../lib/continuous-intelligence-shadow-collector-canary";
import {
  areContinuousIntelligenceShadowCanaryTimestampsEqual,
  normalizeContinuousIntelligenceShadowCanaryTimestamp,
} from "../../lib/continuous-intelligence-shadow-canary-timestamp";
import {
  buildUsEquityMarketCalendarEvaluation,
  usEquityMarketCalendarValidation,
} from "../../lib/us-equity-market-calendar";

const now = new Date("2026-07-22T15:00:00.000Z");
const executionRoute = "app/api/automation/continuous-intelligence/shadow-collector/canary/manual-execution/route.ts";

function binding() {
  const preflight = buildContinuousIntelligenceShadowCanaryPreflight({
    now,
    calendar: buildUsEquityMarketCalendarEvaluation(now),
    enabled_flag: "false",
    kill_switch: "true",
    provider_configured: true,
    provider_metadata_status: "within_budget",
    daily_usage: { status: "available", run_count: 0, estimated_credits: 0 },
  });
  const identity = buildContinuousIntelligenceShadowCanaryLifecycleIdentity({ preflight, now });
  if (!identity || !usEquityMarketCalendarValidation.computed_fingerprint) throw new Error("Expected fixture identity.");
  const result = buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding({
    preflight,
    lifecycle_identity: identity,
    calendar_fingerprint: usEquityMarketCalendarValidation.computed_fingerprint,
    deployment_commit: "a".repeat(40),
    deployment_build_marker: "continuous_intelligence_shadow_canary_function_foundation_v1",
  });
  if (!result) throw new Error("Expected fixture binding.");
  return result;
}

function postgrestAuthorizationRow(overrides: Record<string, unknown> = {}) {
  const bound = binding();
  return {
    ...bound,
    authorization_id: "manual_canary_authorization_fixture",
    authorization_status: "issued",
    market_interval: "5min",
    issued_at: "2026-07-22T15:00:00.000000+00:00",
    expires_at: "2026-07-22T15:01:00.000000+00:00",
    consumed_at: null,
    requested_start: bound.requested_start.replace(".000Z", ".000000+00:00"),
    requested_end: bound.requested_end.replace(".000Z", ".000000+00:00"),
    ...overrides,
  };
}

test("Action 595 canonicalizes PostgreSQL and PostgREST timestamps without changing their represented instant", () => {
  expect(normalizeContinuousIntelligenceShadowCanaryTimestamp("2026-07-22T15:00:00+00:00")).toBe("2026-07-22T15:00:00.000Z");
  expect(normalizeContinuousIntelligenceShadowCanaryTimestamp("2026-07-22T15:00:00.123000+00:00")).toBe("2026-07-22T15:00:00.123Z");
  expect(normalizeContinuousIntelligenceShadowCanaryTimestamp("2026-07-22T15:00:00.123Z")).toBe("2026-07-22T15:00:00.123Z");
  expect(areContinuousIntelligenceShadowCanaryTimestampsEqual("2026-07-22T17:00:00+02:00", "2026-07-22T15:00:00.000Z")).toBe(true);
  expect(areContinuousIntelligenceShadowCanaryTimestampsEqual("2026-07-22T15:00:00.000Z", "2026-07-22T15:00:00.001Z")).toBe(false);
});

test("Action 595 rejects incomplete, malformed, lossy, and out-of-range timestamp input", () => {
  for (const value of [
    "2026-07-22T15:00:00",
    "2026-07-22 15:00:00Z",
    "2026-07-22T15:00:00.1234567Z",
    "2026-07-22T15:00:00.123456Z",
    "2026-02-30T15:00:00Z",
    "10000-07-22T15:00:00Z",
    "2026-07-22T15:00:00+24:00",
  ]) {
    expect(normalizeContinuousIntelligenceShadowCanaryTimestamp(value)).toBeNull();
  }
});

test("Action 595 normalizes persisted authorization fields before binding and rejects a genuinely different instant", () => {
  const expected = binding();
  const parsed = parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord(postgrestAuthorizationRow());
  expect(parsed).not.toBeNull();
  expect(parsed).toMatchObject({
    issued_at: "2026-07-22T15:00:00.000Z",
    expires_at: "2026-07-22T15:01:00.000Z",
    requested_start: expected.requested_start,
    requested_end: expected.requested_end,
  });
  if (!parsed) throw new Error("Expected normalized authorization.");
  expect(matchesContinuousIntelligenceShadowCanaryManualAuthorizationBinding(parsed, expected)).toBe(true);

  const unequal = parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord(postgrestAuthorizationRow({
    requested_start: new Date(Date.parse(expected.requested_start) - 5 * 60_000).toISOString(),
    requested_end: new Date(Date.parse(expected.requested_end) - 5 * 60_000).toISOString(),
  }));
  expect(unequal).not.toBeNull();
  if (!unequal) throw new Error("Expected unequal fixture authorization.");
  expect(matchesContinuousIntelligenceShadowCanaryManualAuthorizationBinding(unequal, expected)).toBe(false);

  const lease = buildContinuousIntelligenceShadowCanaryManualExecutionLeaseRecord({
    binding: {
      ...expected,
      requested_start: expected.requested_start.replace(".000Z", ".000000+00:00"),
      requested_end: expected.requested_end.replace(".000Z", ".000000+00:00"),
    },
    authorization_id: "manual_canary_authorization_fixture",
    execution_lease_id: "manual_canary_execution_lease_fixture",
    issued_at: "2026-07-22T15:00:00.000000+00:00",
    expires_at: "2026-07-22T15:01:00.000000+00:00",
    status: "issued",
  });
  expect(lease).toMatchObject({
    issued_at: "2026-07-22T15:00:00.000Z",
    expires_at: "2026-07-22T15:01:00.000Z",
    requested_start: expected.requested_start,
    requested_end: expected.requested_end,
  });
});

test("Action 595 keeps malformed normalization failures before atomic admission and provider execution", () => {
  expect(parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord(postgrestAuthorizationRow({
    requested_start: "2026-07-22T15:00:00",
  }))).toBeNull();

  const route = readFileSync(resolve(process.cwd(), executionRoute), "utf8");
  expect(route.indexOf("const authorizationRead =")).toBeLessThan(
    route.indexOf("const admission ="),
  );
  expect(route.indexOf("const admission =")).toBeLessThan(
    route.indexOf("const execution = await executeContinuousIntelligenceShadowCanary"),
  );
});

test("Action 595 permits exactly one atomic-admission handoff after normalized binding verification", () => {
  const expected = binding();
  const parsed = parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord(postgrestAuthorizationRow());
  if (!parsed) throw new Error("Expected normalized authorization.");
  let atomicAdmissionHandoffs = 0;
  expect(matchesContinuousIntelligenceShadowCanaryManualAuthorizationBinding(parsed, expected)).toBe(true);
  atomicAdmissionHandoffs += 1;
  expect(atomicAdmissionHandoffs).toBe(1);
});

test("Action 595 preserves expiry enforcement after normalization", () => {
  const expected = binding();
  const expired = parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord(postgrestAuthorizationRow({
    issued_at: "2026-07-22T14:58:59.000000+00:00",
    expires_at: "2026-07-22T14:59:59.000000+00:00",
  }));
  expect(expired).not.toBeNull();
  expect(evaluateContinuousIntelligenceShadowCanaryManualExecutionGate({
    authorization: expired,
    expected_binding: expected,
    facts: {
      readiness_decision: "ready_for_one_manual_canary_attempt",
      canary_disabled: true,
      kill_switch_active: true,
      schedule_absent: true,
      daily_capacity_available: true,
      provider_budget_resolved: true,
      active_claim_conflict: false,
    },
    now,
  })).toBe("authorization_expired");
});
