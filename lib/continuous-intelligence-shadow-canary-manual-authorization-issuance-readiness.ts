import {
  parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord,
  type ContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
} from "@/lib/continuous-intelligence-shadow-canary-manual-authorization";
import {
  buildContinuousIntelligenceShadowCanaryManualExecutionLeaseRecord,
} from "@/lib/continuous-intelligence-shadow-canary-manual-execution-lease";

export const continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessContractVersion =
  "continuous_intelligence_shadow_canary_manual_authorization_issuance_readiness_v1" as const;
export const continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization/readiness" as const;
export const continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessProbeRpcName =
  "read_continuous_intelligence_shadow_canary_manual_issuance_readiness" as const;

export type ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessCategory =
  | "diagnostic_ready"
  | "request_auth_invalid"
  | "request_contract_invalid"
  | "readiness_blocked"
  | "authorization_rpc_unavailable"
  | "lease_rpc_unavailable"
  | "rpc_permission_invalid"
  | "rpc_signature_mismatch"
  | "environment_configuration_missing"
  | "response_mapping_incompatible"
  | "transaction_prerequisite_failed"
  | "concurrent_issuance_guard_active"
  | "unknown_sanitized_failure";

export type ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessProbe = {
  probe_status: "available" | "environment_configuration_missing" | "unknown";
  authorization_table_available: boolean | null;
  lease_table_available: boolean | null;
  authorization_table_rls_enabled: boolean | null;
  lease_table_rls_enabled: boolean | null;
  authorization_issue_rpc_available: boolean | null;
  authorization_issue_rpc_signature_valid: boolean | null;
  authorization_issue_rpc_service_role_executable: boolean | null;
  authorization_issue_rpc_public_executable: boolean | null;
  authorization_issue_rpc_anon_executable: boolean | null;
  authorization_issue_rpc_authenticated_executable: boolean | null;
  lease_issue_rpc_available: boolean | null;
  lease_issue_rpc_signature_valid: boolean | null;
  lease_issue_rpc_service_role_executable: boolean | null;
  lease_issue_rpc_public_executable: boolean | null;
  lease_issue_rpc_anon_executable: boolean | null;
  lease_issue_rpc_authenticated_executable: boolean | null;
  transaction_prerequisites_valid: boolean | null;
  active_issued_authorization_count: number | null;
  active_issued_lease_count: number | null;
};

export type ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessInput = {
  now: Date;
  request_authenticated: boolean;
  request_contract_valid: boolean;
  service_role_configuration_available: boolean;
  deployment_identity_available: boolean;
  binding: ContinuousIntelligenceShadowCanaryManualAuthorizationBinding | null;
  readiness_decision: string;
  canary_disabled: boolean;
  kill_switch_active: boolean;
  schedule_absent: boolean;
  daily_capacity_available: boolean;
  provider_budget_resolved: boolean;
  preflight_static_blockers_are_only_disabled_state: boolean;
  probe: ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessProbe;
};

export type ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness = {
  contract_version: typeof continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessContractVersion;
  generated_at: string;
  category: ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessCategory;
  ready: boolean;
  checks: {
    request_authenticated: boolean;
    request_contract_valid: boolean;
    production_readiness: boolean;
    global_safe_defaults: boolean;
    schedule_inactive: boolean;
    required_environment_configuration: boolean;
    authorization_table_and_rpc_available: boolean;
    lease_table_and_rpc_available: boolean;
    rpc_signatures_valid: boolean;
    rpc_permissions_safe: boolean;
    transaction_prerequisites_valid: boolean;
    response_mapping_compatible: boolean;
    concurrent_issuance_guard_clear: boolean;
  };
  no_effect: {
    raw_credentials_generated: false;
    durable_writes_executed: false;
    claims_created: false;
    provider_calls_executed: false;
    audit_or_ledger_writes_executed: false;
    flags_or_schedule_changed: false;
  };
};

function safeTimestamp(now: Date) {
  const value = now.toISOString();
  return Number.isFinite(Date.parse(value)) ? value : new Date(0).toISOString();
}

function responseMappingCompatible(
  binding: ContinuousIntelligenceShadowCanaryManualAuthorizationBinding | null,
  now: Date,
) {
  if (!binding) return false;
  const issuedAt = safeTimestamp(now);
  const expiresAt = new Date(now.getTime() + 60_000).toISOString();
  const authorization = parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord({
    ...binding,
    authorization_id: "diagnostic_authorization",
    issued_at: issuedAt,
    expires_at: expiresAt,
    consumed_at: null,
    authorization_status: "issued",
    market_interval: "5min",
  });
  const lease = buildContinuousIntelligenceShadowCanaryManualExecutionLeaseRecord({
    binding,
    authorization_id: "diagnostic_authorization",
    execution_lease_id: "diagnostic_lease",
    issued_at: issuedAt,
    expires_at: expiresAt,
    status: "issued",
  });
  return authorization !== null && lease !== null;
}

export function buildContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness(
  input: ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessInput,
): ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness {
  const probe = input.probe;
  const productionReadiness =
    input.readiness_decision === "ready_for_one_manual_canary_attempt" &&
    input.daily_capacity_available &&
    input.provider_budget_resolved &&
    input.preflight_static_blockers_are_only_disabled_state;
  const globalSafeDefaults = input.canary_disabled && input.kill_switch_active;
  const authorizationAvailable =
    probe.authorization_table_available === true &&
    probe.authorization_table_rls_enabled === true &&
    probe.authorization_issue_rpc_available === true;
  const leaseAvailable =
    probe.lease_table_available === true &&
    probe.lease_table_rls_enabled === true &&
    probe.lease_issue_rpc_available === true;
  const signaturesValid =
    probe.authorization_issue_rpc_signature_valid === true &&
    probe.lease_issue_rpc_signature_valid === true;
  const permissionsSafe =
    probe.authorization_issue_rpc_service_role_executable === true &&
    probe.lease_issue_rpc_service_role_executable === true &&
    probe.authorization_issue_rpc_public_executable === false &&
    probe.authorization_issue_rpc_anon_executable === false &&
    probe.authorization_issue_rpc_authenticated_executable === false &&
    probe.lease_issue_rpc_public_executable === false &&
    probe.lease_issue_rpc_anon_executable === false &&
    probe.lease_issue_rpc_authenticated_executable === false;
  const mappingCompatible = responseMappingCompatible(input.binding, input.now);
  const guardClear =
    probe.active_issued_authorization_count === 0 && probe.active_issued_lease_count === 0;
  const requiredEnvironment =
    input.service_role_configuration_available && input.deployment_identity_available;
  const checks = {
    request_authenticated: input.request_authenticated,
    request_contract_valid: input.request_contract_valid,
    production_readiness: productionReadiness,
    global_safe_defaults: globalSafeDefaults,
    schedule_inactive: input.schedule_absent,
    required_environment_configuration: requiredEnvironment,
    authorization_table_and_rpc_available: authorizationAvailable,
    lease_table_and_rpc_available: leaseAvailable,
    rpc_signatures_valid: signaturesValid,
    rpc_permissions_safe: permissionsSafe,
    transaction_prerequisites_valid: probe.transaction_prerequisites_valid === true,
    response_mapping_compatible: mappingCompatible,
    concurrent_issuance_guard_clear: guardClear,
  } as const;

  let category: ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessCategory =
    "diagnostic_ready";
  if (!checks.request_authenticated) category = "request_auth_invalid";
  else if (!checks.request_contract_valid) category = "request_contract_invalid";
  else if (!checks.required_environment_configuration || probe.probe_status === "environment_configuration_missing") category = "environment_configuration_missing";
  else if (!checks.authorization_table_and_rpc_available) category = "authorization_rpc_unavailable";
  else if (!checks.lease_table_and_rpc_available) category = "lease_rpc_unavailable";
  else if (!checks.rpc_signatures_valid) category = "rpc_signature_mismatch";
  else if (!checks.rpc_permissions_safe) category = "rpc_permission_invalid";
  else if (!checks.transaction_prerequisites_valid) category = "transaction_prerequisite_failed";
  else if (!checks.concurrent_issuance_guard_clear) category = "concurrent_issuance_guard_active";
  else if (!checks.response_mapping_compatible) category = "response_mapping_incompatible";
  else if (!checks.production_readiness || !checks.global_safe_defaults || !checks.schedule_inactive) category = "readiness_blocked";
  else if (probe.probe_status !== "available") category = "unknown_sanitized_failure";

  return {
    contract_version: continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessContractVersion,
    generated_at: safeTimestamp(input.now),
    category,
    ready: category === "diagnostic_ready",
    checks,
    no_effect: {
      raw_credentials_generated: false,
      durable_writes_executed: false,
      claims_created: false,
      provider_calls_executed: false,
      audit_or_ledger_writes_executed: false,
      flags_or_schedule_changed: false,
    },
  };
}
