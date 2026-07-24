import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryPreflight,
  recheckContinuousIntelligenceShadowCanaryRuntime,
  recheckContinuousIntelligenceShadowCanaryRuntimeWithManualExecutionLease,
} from "../../lib/continuous-intelligence-shadow-collector-canary";
import {
  buildContinuousIntelligenceShadowCanaryManualExecutionLeaseRecord,
  continuousIntelligenceShadowCanaryManualExecutionLeaseContractVersion,
} from "../../lib/continuous-intelligence-shadow-canary-manual-execution-lease";
import { buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding } from "../../lib/continuous-intelligence-shadow-canary-manual-authorization";
import { buildContinuousIntelligenceShadowCanaryLifecycleIdentity } from "../../lib/continuous-intelligence-shadow-collector-canary";
import { buildUsEquityMarketCalendarEvaluation, usEquityMarketCalendarValidation } from "../../lib/us-equity-market-calendar";

const root = path.resolve(__dirname, "../..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");
const migrationPath = "supabase/migrations/20260722003000_create_continuous_intelligence_shadow_canary_manual_execution_leases.sql";
const manualAuthorizationRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization/route.ts";
const manualExecutionRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/manual-execution/route.ts";
const now = new Date("2026-07-22T15:00:00.000Z");

function disabledDefaultPreflight(overrides: Partial<Parameters<typeof buildContinuousIntelligenceShadowCanaryPreflight>[0]> = {}) {
  return buildContinuousIntelligenceShadowCanaryPreflight({
    now,
    calendar: buildUsEquityMarketCalendarEvaluation(now),
    enabled_flag: "false",
    kill_switch: "true",
    provider_configured: true,
    provider_metadata_status: "within_budget",
    daily_usage: { status: "available", run_count: 0, estimated_credits: 0 },
    ...overrides,
  });
}

function binding() {
  const preflight = disabledDefaultPreflight();
  const identity = buildContinuousIntelligenceShadowCanaryLifecycleIdentity({ preflight, now });
  if (!identity || !usEquityMarketCalendarValidation.computed_fingerprint) throw new Error("Expected fixture identity.");
  const value = buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding({
    preflight,
    lifecycle_identity: identity,
    calendar_fingerprint: usEquityMarketCalendarValidation.computed_fingerprint,
    deployment_commit: "a".repeat(40),
    deployment_build_marker: "continuous_intelligence_shadow_canary_function_foundation_v1",
  });
  if (!value) throw new Error("Expected fixture binding.");
  return value;
}

test("Action 585 permits only the two global default blockers after a valid lease is atomically admitted", () => {
  const preflight = disabledDefaultPreflight();
  expect(preflight.blockers).toEqual(["canary_disabled", "canary_kill_switch_active"]);
  expect(recheckContinuousIntelligenceShadowCanaryRuntime(preflight).eligible).toBe(false);
  expect(recheckContinuousIntelligenceShadowCanaryRuntimeWithManualExecutionLease(preflight).eligible).toBe(true);

  const scheduleOrProviderBlocked = disabledDefaultPreflight({ provider_configured: false });
  expect(scheduleOrProviderBlocked.blockers).toContain("provider_not_configured");
  expect(recheckContinuousIntelligenceShadowCanaryRuntimeWithManualExecutionLease(scheduleOrProviderBlocked).eligible).toBe(false);
});

test("Action 585 lease records are non-secret, exact-bound, and cannot outlive the authorization window", () => {
  const lease = buildContinuousIntelligenceShadowCanaryManualExecutionLeaseRecord({
    binding: binding(),
    authorization_id: "manual_canary_authorization_fixture",
    execution_lease_id: "manual_canary_execution_lease_fixture",
    issued_at: now.toISOString(),
    expires_at: new Date(now.getTime() + 60_000).toISOString(),
    status: "issued",
  });
  expect(lease).toMatchObject({
    contract_version: expect.any(String),
    ticker: "AAPL",
    interval: "5min",
    policy_total_credits: 377,
    policy_hard_reserve_credits: 57,
    policy_normal_planned_max_credits: 320,
  });
  expect(JSON.stringify(lease)).not.toContain("token_hash");
  expect(buildContinuousIntelligenceShadowCanaryManualExecutionLeaseRecord({
    binding: binding(),
    authorization_id: "manual_canary_authorization_fixture",
    execution_lease_id: "manual_canary_execution_lease_fixture",
    issued_at: now.toISOString(),
    expires_at: new Date(now.getTime() + 60_001).toISOString(),
    status: "issued",
  })).toBeNull();
  expect(continuousIntelligenceShadowCanaryManualExecutionLeaseContractVersion).toBe(
    "continuous_intelligence_shadow_canary_manual_execution_lease_v1",
  );
});

test("Action 585 migration makes authorization, lease, and attempted claim one service-role-only admission", () => {
  const migration = read(migrationPath);
  expect(migration).toContain("continuous_intelligence_shadow_canary_manual_execution_leases");
  expect(migration).not.toContain("lease_token_hash");
  expect(migration).toContain("issue_ci_shadow_canary_manual_lease");
  expect(migration).toContain("admit_ci_shadow_canary_manual_lease");
  expect(migration).toContain("authorization_row.authorization_id <> lease_row.authorization_id");
  expect(migration).toContain("authorization_row.status = 'consumed' and lease_row.status = 'consumed'");
  expect(migration).toContain("authorization_row.status <> 'issued' or lease_row.status <> 'issued'");
  expect(migration.indexOf("insert into public.continuous_intelligence_shadow_canary_daily_claims")).toBeLessThan(
    migration.indexOf("set status = 'consumed', consumed_at = now()"),
  );
  expect(migration).toContain("from service_role");
  expect(migration).toContain("to service_role");
  expect(migration).not.toContain("grant execute on function public.admit_ci_shadow_canary_manual_lease(text, text, text, text, text, text, date) to anon");
});

test("Action 585 routes require the opaque lease and leave global defaults unchanged", () => {
  const issuance = read(manualAuthorizationRoutePath);
  const execution = read(manualExecutionRoutePath);
  expect(issuance).toContain("issueContinuousIntelligenceShadowCanaryManualAuthorizationWithLease");
  expect(issuance).toContain("execution_lease: sanitizeContinuousIntelligenceShadowCanaryManualExecutionLease");
  expect(execution).toContain("execution_lease_id");
  expect(execution).toContain("admitContinuousIntelligenceShadowCanaryManualExecutionWithLease");
  expect(execution).toContain("preflight_static_blockers_are_only_disabled_state");
  expect(execution).toContain("context.canary_disabled");
  expect(execution).toContain("context.kill_switch_active");
  expect(execution).toContain("allow_disabled_default_override: true");
  expect(execution).not.toContain("process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED =");
  expect(execution).not.toContain("process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH =");
});

test("Action 585 leaves all malformed, mismatched, replayed, expired, policy, and schedule cases fail-closed before provider entry", () => {
  const migration = read(migrationPath);
  const execution = read(manualExecutionRoutePath);
  for (const status of ["identity_mismatch", "authorization_expired", "authorization_replayed", "daily_limit_reached", "daily_usage_unavailable"]) {
    expect(migration).toContain(status);
  }
  for (const contractFact of ["ticker <> 'AAPL'", "interval <> '5min'", "interval '30 minutes'", "policy_total_credits <> 377", "policy_hard_reserve_credits <> 57", "policy_normal_planned_max_credits <> 320"]) {
    expect(migration).toContain(contractFact);
  }
  expect(execution).toContain("provider_calls_executed: false");
  expect(execution).toContain("if (admission.status !== \"attempt_started\")");
});
