import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
} from "../../lib/continuous-intelligence-shadow-canary-manual-authorization";
import {
  buildContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness,
  continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessProbeRpcName,
  continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessRoutePath,
  type ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessInput,
} from "../../lib/continuous-intelligence-shadow-canary-manual-authorization-issuance-readiness";
import {
  buildContinuousIntelligenceShadowCanaryLifecycleIdentity,
  buildContinuousIntelligenceShadowCanaryPreflight,
} from "../../lib/continuous-intelligence-shadow-collector-canary";
import {
  buildUsEquityMarketCalendarEvaluation,
  usEquityMarketCalendarValidation,
} from "../../lib/us-equity-market-calendar";
import {
  continuousIntelligenceShadowCanaryRuntimeDeploymentCommitEnvironmentVariable,
  resolveContinuousIntelligenceShadowCanaryRuntimeDeploymentCommit,
} from "../../lib/continuous-intelligence-shadow-canary-runtime-deployment-identity";

const routePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization/readiness/route.ts";
const migrationPath = "supabase/migrations/20260722005000_stabilize_continuous_intelligence_shadow_canary_rpc_names.sql";
const issuanceRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization/route.ts";
const now = new Date("2026-07-22T16:30:00.000Z");

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function binding() {
  const preflight = buildContinuousIntelligenceShadowCanaryPreflight({
    now,
    calendar: buildUsEquityMarketCalendarEvaluation(now),
    enabled_flag: "true",
    kill_switch: "false",
    provider_configured: true,
    provider_metadata_status: "within_budget",
    daily_usage: { status: "available", run_count: 0, estimated_credits: 0 },
  });
  const identity = buildContinuousIntelligenceShadowCanaryLifecycleIdentity({ preflight, now });
  if (!identity || !usEquityMarketCalendarValidation.computed_fingerprint) throw new Error("Expected fixture binding.");
  const result = buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding({
    preflight,
    lifecycle_identity: identity,
    calendar_fingerprint: usEquityMarketCalendarValidation.computed_fingerprint,
    deployment_commit: "a".repeat(40),
    deployment_build_marker: "continuous_intelligence_shadow_canary_function_foundation_v1",
  });
  if (!result) throw new Error("Expected immutable fixture binding.");
  return result;
}

function input(
  overrides: Partial<ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessInput> = {},
): ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessInput {
  return {
    now,
    request_authenticated: true,
    request_contract_valid: true,
    service_role_configuration_available: true,
    deployment_identity_available: true,
    binding: binding(),
    readiness_decision: "ready_for_one_manual_canary_attempt",
    canary_disabled: true,
    kill_switch_active: true,
    schedule_absent: true,
    daily_capacity_available: true,
    provider_budget_resolved: true,
    preflight_static_blockers_are_only_disabled_state: true,
    probe: {
      probe_status: "available",
      authorization_table_available: true,
      lease_table_available: true,
      authorization_table_rls_enabled: true,
      lease_table_rls_enabled: true,
      authorization_issue_rpc_available: true,
      authorization_issue_rpc_signature_valid: true,
      authorization_issue_rpc_service_role_executable: true,
      authorization_issue_rpc_public_executable: false,
      authorization_issue_rpc_anon_executable: false,
      authorization_issue_rpc_authenticated_executable: false,
      lease_issue_rpc_available: true,
      lease_issue_rpc_signature_valid: true,
      lease_issue_rpc_service_role_executable: true,
      lease_issue_rpc_public_executable: false,
      lease_issue_rpc_anon_executable: false,
      lease_issue_rpc_authenticated_executable: false,
      transaction_prerequisites_valid: true,
      active_issued_authorization_count: 0,
      active_issued_lease_count: 0,
    },
    ...overrides,
  };
}

test("Action 589 maps production-equivalent issuance facts to diagnostic ready without durable effects", () => {
  const result = buildContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness(input());
  expect(result.category).toBe("diagnostic_ready");
  expect(result.ready).toBe(true);
  expect(result.no_effect).toEqual({
    raw_credentials_generated: false,
    durable_writes_executed: false,
    claims_created: false,
    provider_calls_executed: false,
    audit_or_ledger_writes_executed: false,
    flags_or_schedule_changed: false,
  });
  expect(JSON.stringify(result)).not.toContain("token");
});

test("Action 589 fails malformed and unauthorized requests before any issuance-ready result", () => {
  expect(buildContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness(input({ request_authenticated: false })).category)
    .toBe("request_auth_invalid");
  expect(buildContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness(input({ request_contract_valid: false })).category)
    .toBe("request_contract_invalid");
});

test("Action 589 maps each persistence readiness failure to one bounded category", () => {
  const cases: Array<[string, Partial<ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessInput>] > = [
    ["environment_configuration_missing", { service_role_configuration_available: false }],
    ["authorization_rpc_unavailable", { probe: { ...input().probe, authorization_issue_rpc_available: false } }],
    ["lease_rpc_unavailable", { probe: { ...input().probe, lease_issue_rpc_available: false } }],
    ["rpc_signature_mismatch", { probe: { ...input().probe, lease_issue_rpc_signature_valid: false } }],
    ["rpc_permission_invalid", { probe: { ...input().probe, authorization_issue_rpc_anon_executable: true } }],
    ["transaction_prerequisite_failed", { probe: { ...input().probe, transaction_prerequisites_valid: false } }],
    ["concurrent_issuance_guard_active", { probe: { ...input().probe, active_issued_authorization_count: 1 } }],
    ["response_mapping_incompatible", { binding: null }],
    ["readiness_blocked", { provider_budget_resolved: false }],
  ];
  for (const [expected, overrides] of cases) {
    expect(buildContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness(input(overrides)).category).toBe(expected);
  }
});

test("Action 591 accepts only a canonical configured runtime deployment commit", () => {
  const commit = "a".repeat(40);
  expect(resolveContinuousIntelligenceShadowCanaryRuntimeDeploymentCommit({
    [continuousIntelligenceShadowCanaryRuntimeDeploymentCommitEnvironmentVariable]: commit,
  })).toBe(commit);
  expect(resolveContinuousIntelligenceShadowCanaryRuntimeDeploymentCommit({
    [continuousIntelligenceShadowCanaryRuntimeDeploymentCommitEnvironmentVariable]: "not-a-commit",
    COMMIT_REF: "B".repeat(40),
  })).toBe("b".repeat(40));
  expect(resolveContinuousIntelligenceShadowCanaryRuntimeDeploymentCommit({
    [continuousIntelligenceShadowCanaryRuntimeDeploymentCommitEnvironmentVariable]: "not-a-commit",
    COMMIT_REF: "too-short",
    NETLIFY_COMMIT_REF: "still-not-a-commit",
  })).toBeNull();
});

test("Action 589 adds a service-role-only read probe and a GET-only route without touching issuance behavior", () => {
  const migration = read(migrationPath);
  const route = read(routePath);
  const issuance = read(issuanceRoutePath);
  expect(migration).toContain(continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessProbeRpcName);
  expect(migration).toContain("security invoker");
  expect(migration).toContain("grant execute on function public.ci_mca_readiness() to service_role");
  expect(migration).toContain("revoke all on function public.ci_mca_readiness() from public, anon, authenticated");
  expect(migration).not.toContain("insert into public.continuous_intelligence_shadow_canary_manual_authorizations");
  expect(migration).not.toContain("insert into public.continuous_intelligence_shadow_canary_manual_execution_leases");
  expect(route).toContain("export async function GET");
  expect(continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessRoutePath)
    .toBe("/api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization/readiness");
  expect(route).not.toContain("generateContinuousIntelligenceShadowCanaryManualAuthorizationToken");
  expect(route).not.toContain("issueContinuousIntelligenceShadowCanaryManualAuthorizationWithLease");
  expect(issuance).toContain("issueContinuousIntelligenceShadowCanaryManualAuthorizationWithLease");
});
