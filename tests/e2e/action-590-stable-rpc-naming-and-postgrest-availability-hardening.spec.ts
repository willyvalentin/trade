import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  continuousIntelligenceShadowCanaryManualAuthorizationConsumeRpcName,
  continuousIntelligenceShadowCanaryManualAuthorizationAdmitExecutionRpcName,
  continuousIntelligenceShadowCanaryManualAuthorizationIssueRpcName,
} from "../../lib/continuous-intelligence-shadow-canary-manual-authorization";
import {
  continuousIntelligenceShadowCanaryManualAuthorizationAdmitExecutionWithLeaseRpcName,
  continuousIntelligenceShadowCanaryManualAuthorizationIssueWithLeaseRpcName,
} from "../../lib/continuous-intelligence-shadow-canary-manual-execution-lease";
import {
  buildContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness,
  continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessProbeRpcName,
  type ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessInput,
} from "../../lib/continuous-intelligence-shadow-canary-manual-authorization-issuance-readiness";
import {
  buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
} from "../../lib/continuous-intelligence-shadow-canary-manual-authorization";
import {
  buildContinuousIntelligenceShadowCanaryLifecycleIdentity,
  buildContinuousIntelligenceShadowCanaryPreflight,
} from "../../lib/continuous-intelligence-shadow-collector-canary";
import {
  buildUsEquityMarketCalendarEvaluation,
  usEquityMarketCalendarValidation,
} from "../../lib/us-equity-market-calendar";

const migrationPath = "supabase/migrations/20260722005000_stabilize_continuous_intelligence_shadow_canary_rpc_names.sql";
const leaseMigrationPath = "supabase/migrations/20260722003000_create_continuous_intelligence_shadow_canary_manual_execution_leases.sql";
const legacyAdmissionMigrationPath = "supabase/migrations/20260722002000_admit_continuous_intelligence_shadow_canary_manual_execution.sql";
const readinessRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization/readiness/route.ts";
const now = new Date("2026-07-22T16:30:00.000Z");

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function input(
  overrides: Partial<ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessInput> = {},
): ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessInput {
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
  const binding = buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding({
    preflight,
    lifecycle_identity: identity,
    calendar_fingerprint: usEquityMarketCalendarValidation.computed_fingerprint,
    deployment_commit: "a".repeat(40),
    deployment_build_marker: "continuous_intelligence_shadow_canary_function_foundation_v1",
  });
  if (!binding) throw new Error("Expected fixture binding.");
  return {
    now,
    request_authenticated: true,
    request_contract_valid: true,
    service_role_configuration_available: true,
    deployment_identity_available: true,
    binding,
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

test("Action 590 gives every PostgREST-called issuance RPC an explicit bounded catalog name", () => {
  const rpcNames = [
    continuousIntelligenceShadowCanaryManualAuthorizationIssueRpcName,
    continuousIntelligenceShadowCanaryManualAuthorizationConsumeRpcName,
    continuousIntelligenceShadowCanaryManualAuthorizationAdmitExecutionRpcName,
    continuousIntelligenceShadowCanaryManualAuthorizationIssueWithLeaseRpcName,
    continuousIntelligenceShadowCanaryManualAuthorizationAdmitExecutionWithLeaseRpcName,
    continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessProbeRpcName,
  ];
  const migration = read(migrationPath);
  const leaseMigration = read(leaseMigrationPath);
  const legacyAdmissionMigration = read(legacyAdmissionMigrationPath);
  for (const name of rpcNames) {
    expect(Buffer.byteLength(name, "utf8")).toBeLessThanOrEqual(63);
    expect(
      migration.includes(name) || leaseMigration.includes(name) || legacyAdmissionMigration.includes(name),
    ).toBe(true);
  }
  expect(migration).toContain("alter function %s rename to %I");
  expect(migration).toContain("notify pgrst, 'reload schema'");
  expect(migration).not.toContain("read_continuous_intelligence_shadow_canary_manual_issuance_readiness() to service_role");
});

test("Action 590 maps a missing stable readiness RPC to a bounded infrastructure category without effects", () => {
  const result = buildContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness(input({
    probe: { ...input().probe, probe_status: "unknown", authorization_issue_rpc_available: null },
  }));
  expect(result.category).toBe("authorization_rpc_unavailable");
  expect(result.no_effect.durable_writes_executed).toBe(false);
  expect(result.no_effect.raw_credentials_generated).toBe(false);
});

test("Action 590 keeps the readiness route read-only and pointed at the stable probe name", () => {
  const route = read(readinessRoutePath);
  expect(route).toContain("readContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness");
  expect(route).not.toContain("generateContinuousIntelligenceShadowCanaryManualAuthorizationToken");
  expect(route).not.toContain("issueContinuousIntelligenceShadowCanaryManualAuthorizationWithLease");
});
