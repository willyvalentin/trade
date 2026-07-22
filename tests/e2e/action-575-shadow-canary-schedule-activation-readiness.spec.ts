import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryActivationReadiness,
  buildContinuousIntelligenceShadowCanaryActivationReadinessDiagnostics,
  continuousIntelligenceShadowCanaryActivationReadinessContractVersion,
  continuousIntelligenceShadowCanaryActivationReadinessRoutePath,
  continuousIntelligenceShadowCanaryReadinessProbeContractVersion,
  isContinuousIntelligenceShadowCanaryReadinessAuthenticated,
  normalizeContinuousIntelligenceShadowCanaryDeploymentSignal,
  normalizeContinuousIntelligenceShadowCanaryProviderBudgetStatus,
  normalizeContinuousIntelligenceShadowCanaryReadinessFlag,
  type ContinuousIntelligenceShadowCanaryActivationReadinessInput,
} from "../../lib/continuous-intelligence-shadow-canary-activation-readiness";

const secret = "action-575-test-automation-secret";
const routePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/activation-readiness/route.ts";
const serverProbePath = "lib/server/continuous-intelligence-shadow-canary-activation-readiness.ts";
const migrationPath = "supabase/migrations/20260722000000_create_continuous_intelligence_shadow_canary_readiness_probe.sql";
const functionPath = "netlify/functions/scheduled-shadow-collector-canary.ts";
const tradeAppPath = "app/trade-app.tsx";
const marketDiagnosticsPath = "lib/market-diagnostics-console.ts";
const deploymentManifestPath = "lib/server/continuous-intelligence-deployment-manifest.ts";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function completeSchema(): ContinuousIntelligenceShadowCanaryActivationReadinessInput["schema"] {
  return {
    probe_status: "available",
    probe_contract_version: continuousIntelligenceShadowCanaryReadinessProbeContractVersion,
    audit_table_available: true,
    ledger_table_available: true,
    claim_table_available: true,
    claim_rpc_available: true,
    begin_attempt_rpc_available: true,
    finalize_attempt_rpc_available: true,
    lifecycle_rpcs_public_executable: false,
    lifecycle_rpcs_anon_executable: false,
    lifecycle_rpcs_authenticated_executable: false,
    lifecycle_rpcs_service_role_executable: true,
    audit_canary_entry_kind_constrained: true,
    audit_no_effect_constraint_available: true,
    ledger_canary_entry_kind_constrained: true,
    ledger_zero_reserve_constraint_available: true,
    claim_status_constraint_available: true,
  };
}

function calendar(
  overrides: Partial<ContinuousIntelligenceShadowCanaryActivationReadinessInput["market_calendar"]> = {},
): ContinuousIntelligenceShadowCanaryActivationReadinessInput["market_calendar"] {
  return {
    contract_version: "us_equity_market_calendar_v1",
    source_category: "repository_pinned_official_exchange_calendar",
    verification_status: "unavailable",
    source_configured: false,
    source_verified: false,
    provenance_available: false,
    coverage_includes_current_date: false,
    coverage_status: "after_coverage",
    freshness_status: "expired",
    source_freshness_valid: false,
    holiday_awareness_available: false,
    early_close_awareness_available: false,
    regular_session_determination_available: false,
    latest_completed_30_minute_range_derivable: false,
    market_date: "2026-07-22",
    session_type: "unknown",
    selected_range: null,
    ...overrides,
  };
}

function verifiedCalendar(): ContinuousIntelligenceShadowCanaryActivationReadinessInput["market_calendar"] {
  return calendar({
    verification_status: "verified",
    source_configured: true,
    source_verified: true,
    provenance_available: true,
    coverage_includes_current_date: true,
    coverage_status: "covered",
    freshness_status: "current",
    source_freshness_valid: true,
    holiday_awareness_available: true,
    early_close_awareness_available: true,
    regular_session_determination_available: true,
    latest_completed_30_minute_range_derivable: true,
    session_type: "regular_session",
    selected_range: {
      start: "2026-07-22T13:30:00.000Z",
      end: "2026-07-22T14:00:00.000Z",
    },
  });
}

function input(overrides: Partial<ContinuousIntelligenceShadowCanaryActivationReadinessInput> = {}): ContinuousIntelligenceShadowCanaryActivationReadinessInput {
  return {
    now: "2026-07-22T14:30:00.000Z",
    deployment: {
      audit_route_present: true,
      ledger_route_present: true,
      ledger_reconcile_route_present: true,
      canary_route_present: true,
      canary_preflight_route_present: true,
      canary_function_foundation_present: true,
      expected_contract_versions_present: true,
    },
    schema: completeSchema(),
    flags: {
      durable_audit: "enabled",
      credit_ledger: "enabled",
      canary: "disabled",
      kill_switch: "enabled",
    },
    provider_budget: {
      provider_configured: true,
      metadata_status: "within_budget",
      policy_total_credits: 377,
      policy_hard_reserve_credits: 57,
      policy_normal_planned_max_credits: 320,
      one_credit_normal_allocation_authorized: true,
      hard_reserve_preserved: true,
      execution_ready_reserve_consumed: false,
    },
    market_calendar: calendar(),
    schedule: {
      function_foundation_present: true,
      repository_schedule_declaration: "absent",
      deployment_schedule_declaration: "absent",
      remote_schedule_active: "absent",
      duplicate_schedule_mechanism: "absent",
      future_frequency_selection: "absent",
    },
    manual_canary_evidence_verified: false,
    ...overrides,
  };
}

test("Action 575 has deterministic staged readiness decisions", () => {
  const missingDeployment = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({
    deployment: { ...input().deployment, audit_route_present: false },
  }));
  expect(missingDeployment).toMatchObject({ readiness_status: "blocked", decision: "not_ready", blockers: ["deployment_components_missing"] });

  const missingAudit = completeSchema();
  missingAudit.audit_table_available = false;
  missingAudit.audit_canary_entry_kind_constrained = false;
  missingAudit.audit_no_effect_constraint_available = false;
  expect(buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ schema: missingAudit })).decision).toBe("ready_for_migration_application");

  const missingLedger = completeSchema();
  missingLedger.ledger_table_available = false;
  missingLedger.ledger_canary_entry_kind_constrained = false;
  missingLedger.ledger_zero_reserve_constraint_available = false;
  expect(buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ schema: missingLedger })).decision).toBe("ready_for_migration_application");

  const missingClaims = completeSchema();
  missingClaims.claim_table_available = false;
  missingClaims.claim_status_constraint_available = false;
  expect(buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ schema: missingClaims })).decision).toBe("ready_for_migration_application");

  const missingRpc = completeSchema();
  missingRpc.finalize_attempt_rpc_available = false;
  expect(buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ schema: missingRpc })).decision).toBe("ready_for_migration_application");

  const complete = buildContinuousIntelligenceShadowCanaryActivationReadiness(input());
  expect(complete.migration_schema_facts).toMatchObject({ all_tables_available: true, all_lifecycle_rpcs_available: true, lifecycle_permissions_safe: true });
  expect(complete.decision).toBe("ready_for_preflight_observation");
  expect(complete.recommended_next_action).toContain("Refresh the pinned verified US market calendar");
});

test("Action 575 keeps readiness-phase flags fail closed", () => {
  const canaryEnabled = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ flags: { ...input().flags, canary: "enabled" } }));
  const killSwitchOff = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ flags: { ...input().flags, kill_switch: "disabled" } }));
  const auditDisabled = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ flags: { ...input().flags, durable_audit: "disabled" } }));
  const ledgerDisabled = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ flags: { ...input().flags, credit_ledger: "disabled" } }));
  const unresolved = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ flags: { ...input().flags, canary: "unresolved" } }));
  expect(canaryEnabled.blockers).toContain("canary_enabled_during_readiness");
  expect(killSwitchOff.blockers).toContain("canary_kill_switch_inactive_during_readiness");
  expect(auditDisabled).toMatchObject({ decision: "ready_for_flag_configuration", warnings: ["durable_audit_requires_configuration", "verified_market_calendar_required"] });
  expect(ledgerDisabled.decision).toBe("ready_for_flag_configuration");
  expect(unresolved).toMatchObject({ decision: "not_ready", blockers: ["canary_flag_unresolved"] });
  expect(normalizeContinuousIntelligenceShadowCanaryReadinessFlag(undefined)).toBe("unresolved");
  expect(normalizeContinuousIntelligenceShadowCanaryReadinessFlag("true")).toBe("enabled");
});

test("Action 575 blocks unresolved provider metadata and policy or reserve mismatches", () => {
  const unresolved = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ provider_budget: { ...input().provider_budget, metadata_status: "unresolved", one_credit_normal_allocation_authorized: false } }));
  const policyMismatch = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ provider_budget: { ...input().provider_budget, policy_total_credits: 376 } }));
  const reserveUsed = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ provider_budget: { ...input().provider_budget, execution_ready_reserve_consumed: true } }));
  expect(unresolved.blockers).toEqual(expect.arrayContaining(["provider_budget_metadata_unresolved", "normal_capacity_authorization_unavailable"]));
  expect(policyMismatch.blockers).toContain("provider_budget_policy_mismatch");
  expect(reserveUsed.blockers).toContain("hard_reserve_not_protected");
  expect(normalizeContinuousIntelligenceShadowCanaryProviderBudgetStatus("budget_unknown")).toBe("unresolved");
});

test("Action 575 blocks unsafe lifecycle permissions and unavailable service-role probing", () => {
  const publicGrant = completeSchema();
  publicGrant.lifecycle_rpcs_public_executable = true;
  const missingServiceGrant = completeSchema();
  missingServiceGrant.lifecycle_rpcs_service_role_executable = false;
  const authFailure = completeSchema();
  authFailure.probe_status = "auth_failure";
  expect(buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ schema: publicGrant })).blockers).toContain("lifecycle_rpc_permissions_unsafe");
  expect(buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ schema: missingServiceGrant })).blockers).toContain("lifecycle_rpc_permissions_unsafe");
  expect(buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ schema: authFailure }))).toMatchObject({ decision: "not_ready", blockers: ["schema_probe_auth_failure"] });
});

test("Action 575 requires a verified market calendar before manual execution readiness", () => {
  const verified = verifiedCalendar();
  const manual = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ market_calendar: verified }));
  const laterReview = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ market_calendar: verified, manual_canary_evidence_verified: true }));
  expect(manual).toMatchObject({ readiness_status: "ready", decision: "ready_for_one_manual_canary_attempt" });
  expect(laterReview.decision).toBe("ready_for_schedule_activation_review");
});

test("Action 575 treats absent schedule metadata as safe and unexpected scheduling as blocked", () => {
  const safe = buildContinuousIntelligenceShadowCanaryActivationReadiness(input());
  const scheduled = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({ schedule: { ...input().schedule, remote_schedule_active: "present" } }));
  expect(safe.schedule_facts).toMatchObject({ repository_schedule_declaration: "absent", deployment_schedule_declaration: "absent", remote_schedule_active: "absent", duplicate_schedule_mechanism: "absent" });
  expect(scheduled).toMatchObject({ decision: "not_ready", blockers: ["unexpected_schedule_activation_state"] });
  const fn = read(functionPath);
  expect(fn).not.toContain("schedule:");
  expect(fn).not.toContain("cron");
});

test("Action 575 never promotes unknown remote deployment state to safe absence", () => {
  const verified = verifiedCalendar();
  const remoteUnknown = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({
    market_calendar: verified,
    schedule: { ...input().schedule, repository_schedule_declaration: "absent", remote_schedule_active: "unknown" },
  }));
  const duplicateUnknown = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({
    market_calendar: verified,
    schedule: { ...input().schedule, duplicate_schedule_mechanism: "unknown" },
  }));
  const duplicatePresent = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({
    schedule: { ...input().schedule, duplicate_schedule_mechanism: "present" },
  }));
  expect(remoteUnknown).toMatchObject({ decision: "ready_for_preflight_observation", blockers: ["schedule_state_unverified"] });
  expect(duplicateUnknown).toMatchObject({ decision: "ready_for_preflight_observation", blockers: ["duplicate_schedule_state_unverified"] });
  expect(duplicatePresent).toMatchObject({ decision: "not_ready", blockers: ["unexpected_schedule_activation_state"] });
  expect(normalizeContinuousIntelligenceShadowCanaryDeploymentSignal(undefined)).toBe("unknown");
  expect(normalizeContinuousIntelligenceShadowCanaryDeploymentSignal("malformed")).toBe("unknown");
  expect(normalizeContinuousIntelligenceShadowCanaryDeploymentSignal("false")).toBe("absent");
  expect(normalizeContinuousIntelligenceShadowCanaryDeploymentSignal("true")).toBe("present");
});

test("Action 575 requires trusted route, function, and contract manifest facts", () => {
  const functionMissing = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({
    deployment: { ...input().deployment, canary_function_foundation_present: false },
    schedule: { ...input().schedule, function_foundation_present: false },
  }));
  const contractMismatch = buildContinuousIntelligenceShadowCanaryActivationReadiness(input({
    deployment: { ...input().deployment, expected_contract_versions_present: false },
  }));
  expect(functionMissing.blockers).toEqual(expect.arrayContaining(["deployment_components_missing", "canary_function_foundation_missing"]));
  expect(contractMismatch.blockers).toContain("deployment_components_missing");
  const manifest = read(deploymentManifestPath);
  expect(manifest).toContain('repository_schedule_declaration: "absent"');
  expect(manifest).toContain("Repository declaration absence does not prove");
  expect(manifest).toContain("continuous_intelligence_shadow_canary_function_foundation_v1");
});

test("Action 575 readiness is deterministic, deduplicated, and entirely non-mutating", () => {
  const first = buildContinuousIntelligenceShadowCanaryActivationReadiness(input());
  const second = buildContinuousIntelligenceShadowCanaryActivationReadiness(input());
  expect(first).toEqual(second);
  expect(new Set(first.blockers).size).toBe(first.blockers.length);
  expect(new Set(first.warnings).size).toBe(first.warnings.length);
  expect(first.no_effect_facts).toEqual({
    provider_calls_executed: false,
    claims_created: false,
    attempts_begun: false,
    claims_finalized: false,
    audit_writes_executed: false,
    ledger_writes_executed: false,
    flags_changed: false,
    schedule_changed: false,
    recommendation_scanner_ranking_confidence_effects: false,
    position_execution_broker_effects: false,
  });
  expect(first.generated_at).toBe("2026-07-22T14:30:00.000Z");
});

test("Action 575 route is authenticated GET-only, parameterless, no-store, and sanitized", () => {
  expect(isContinuousIntelligenceShadowCanaryReadinessAuthenticated(undefined, null)).toBe(false);
  expect(isContinuousIntelligenceShadowCanaryReadinessAuthenticated(secret, null)).toBe(false);
  expect(isContinuousIntelligenceShadowCanaryReadinessAuthenticated(secret, "invalid-secret")).toBe(false);
  expect(isContinuousIntelligenceShadowCanaryReadinessAuthenticated(secret, secret)).toBe(true);
  const route = read(routePath);
  expect(route).toContain("export async function GET");
  expect(route).not.toContain("export async function POST");
  expect(route).toContain('dynamic = "force-dynamic"');
  expect(route).toContain('"Cache-Control": "no-store"');
  expect(route).toContain("isContinuousIntelligenceShadowCanaryReadinessAuthenticated");
  expect(route).toContain("new URL(request.url).search.length > 0");
  expect(route).toContain("request.body !== null");
  expect(route).not.toMatch(/claimContinuous|beginContinuous|finalizeContinuous|persistBounded|persistContinuous|getIntradayCandles/);
  expect(route).not.toContain("fetch(");
  expect(route).not.toMatch(/audit_route_present:\s*true|canary_route_present:\s*true|remote_schedule_active:\s*false|duplicate_schedule_mechanism:\s*false/);
  expect(route).toContain("continuousIntelligenceDeploymentManifest.route_paths");
  expect(route).toContain("TURE_SHADOW_CANARY_REMOTE_SCHEDULE_ACTIVE");
  expect(route).not.toContain("invalid-secret");
  expect(continuousIntelligenceShadowCanaryActivationReadinessRoutePath).toBe("/api/automation/continuous-intelligence/shadow-collector/canary/activation-readiness");
});

test("Action 575 schema probe is fixed, read-only, service-role-only, and exposes no raw errors", () => {
  const adapter = read(serverProbePath);
  const migration = read(migrationPath);
  expect(adapter).toContain("continuousIntelligenceShadowCanaryReadinessProbeRpcName");
  expect(adapter).not.toContain(".from(");
  expect(adapter).not.toMatch(/\.insert\(|\.update\(|\.upsert\(|\.delete\(/);
  expect(adapter).not.toMatch(/claim_continuous|begin_continuous|finalize_continuous/);
  expect(adapter).not.toContain("error.message");
  expect(migration).toContain("read_continuous_intelligence_shadow_canary_readiness");
  expect(migration).toContain("stable");
  expect(migration).toContain("security definer");
  expect(migration).toContain("revoke all on function public.read_continuous_intelligence_shadow_canary_readiness() from public, anon, authenticated");
  expect(migration).toContain("grant execute on function public.read_continuous_intelligence_shadow_canary_readiness() to service_role");
  expect(migration).not.toMatch(/\binsert\s+into\b|\bupdate\s+public\.|\bdelete\s+from\b/i);
});

test("Action 575 passive diagnostics never imply browser activity, writes, claims, providers, or schedules", () => {
  expect(buildContinuousIntelligenceShadowCanaryActivationReadinessDiagnostics()).toEqual({
    activation_readiness_route_present: true,
    activation_readiness_status: "not_observed",
    latest_activation_readiness_decision: null,
    migration_readiness: "unknown",
    calendar_readiness: "unknown",
    activation_schedule_active: "unknown",
    activation_readiness_browser_invocation: false,
    activation_readiness_provider_inferred: false,
    activation_readiness_durable_writes_inferred: false,
    activation_readiness_claim_mutation_inferred: false,
  });
  const tradeApp = read(tradeAppPath);
  const marketDiagnostics = read(marketDiagnosticsPath);
  expect(tradeApp).toContain("buildContinuousIntelligenceShadowCanaryDiagnostics()");
  expect(tradeApp).not.toContain(continuousIntelligenceShadowCanaryActivationReadinessRoutePath);
  expect(marketDiagnostics).toContain("Activation readiness status");
  expect(marketDiagnostics).toContain("Activation readiness claim mutation inferred");
  expect(continuousIntelligenceShadowCanaryActivationReadinessContractVersion).toBe("continuous_intelligence_shadow_canary_activation_readiness_v1");
});
