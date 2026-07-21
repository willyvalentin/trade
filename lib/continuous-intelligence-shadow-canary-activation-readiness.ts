export const continuousIntelligenceShadowCanaryActivationReadinessContractVersion =
  "continuous_intelligence_shadow_canary_activation_readiness_v1" as const;
export const continuousIntelligenceShadowCanaryActivationReadinessRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/canary/activation-readiness" as const;
export const continuousIntelligenceShadowCanaryReadinessProbeContractVersion =
  "continuous_intelligence_shadow_canary_readiness_probe_v1" as const;
export const continuousIntelligenceShadowCanaryReadinessProbeRpcName =
  "read_continuous_intelligence_shadow_canary_readiness" as const;

export type ContinuousIntelligenceShadowCanaryReadinessDecision =
  | "not_ready"
  | "ready_for_migration_application"
  | "ready_for_flag_configuration"
  | "ready_for_preflight_observation"
  | "ready_for_one_manual_canary_attempt"
  | "ready_for_schedule_activation_review";

export type ContinuousIntelligenceShadowCanaryReadinessFlagState =
  | "enabled"
  | "disabled"
  | "unresolved";

export type ContinuousIntelligenceShadowCanaryDeploymentState =
  | "present"
  | "absent"
  | "unknown";

export type ContinuousIntelligenceShadowCanarySchemaProbeStatus =
  | "available"
  | "schema_unavailable"
  | "auth_failure"
  | "unknown";

export type ContinuousIntelligenceShadowCanarySchemaFacts = {
  probe_status: ContinuousIntelligenceShadowCanarySchemaProbeStatus;
  probe_contract_version: string | null;
  audit_table_available: boolean | null;
  ledger_table_available: boolean | null;
  claim_table_available: boolean | null;
  claim_rpc_available: boolean | null;
  begin_attempt_rpc_available: boolean | null;
  finalize_attempt_rpc_available: boolean | null;
  lifecycle_rpcs_public_executable: boolean | null;
  lifecycle_rpcs_anon_executable: boolean | null;
  lifecycle_rpcs_authenticated_executable: boolean | null;
  lifecycle_rpcs_service_role_executable: boolean | null;
  audit_canary_entry_kind_constrained: boolean | null;
  audit_no_effect_constraint_available: boolean | null;
  ledger_canary_entry_kind_constrained: boolean | null;
  ledger_zero_reserve_constraint_available: boolean | null;
  claim_status_constraint_available: boolean | null;
};

export type ContinuousIntelligenceShadowCanaryActivationReadinessInput = {
  now: Date | string;
  deployment: {
    audit_route_present: boolean;
    ledger_route_present: boolean;
    ledger_reconcile_route_present: boolean;
    canary_route_present: boolean;
    canary_preflight_route_present: boolean;
    canary_function_foundation_present: boolean;
    expected_contract_versions_present: boolean;
  };
  schema: ContinuousIntelligenceShadowCanarySchemaFacts;
  flags: {
    durable_audit: ContinuousIntelligenceShadowCanaryReadinessFlagState;
    credit_ledger: ContinuousIntelligenceShadowCanaryReadinessFlagState;
    canary: ContinuousIntelligenceShadowCanaryReadinessFlagState;
    kill_switch: ContinuousIntelligenceShadowCanaryReadinessFlagState;
  };
  provider_budget: {
    provider_configured: boolean;
    metadata_status: "within_budget" | "approaching_limit" | "unresolved";
    policy_total_credits: number;
    policy_hard_reserve_credits: number;
    policy_normal_planned_max_credits: number;
    one_credit_normal_allocation_authorized: boolean;
    hard_reserve_preserved: boolean;
    execution_ready_reserve_consumed: boolean;
  };
  market_calendar: {
    source_configured: boolean;
    source_verified: boolean;
    holiday_awareness_available: boolean;
    regular_session_determination_available: boolean;
    latest_completed_30_minute_range_derivable: boolean;
  };
  schedule: {
    function_foundation_present: boolean;
    repository_schedule_declaration: ContinuousIntelligenceShadowCanaryDeploymentState;
    deployment_schedule_declaration: ContinuousIntelligenceShadowCanaryDeploymentState;
    remote_schedule_active: ContinuousIntelligenceShadowCanaryDeploymentState;
    duplicate_schedule_mechanism: ContinuousIntelligenceShadowCanaryDeploymentState;
    future_frequency_selection: ContinuousIntelligenceShadowCanaryDeploymentState;
  };
  manual_canary_evidence_verified?: boolean;
};

export type ContinuousIntelligenceShadowCanaryActivationReadiness = {
  contract_version: typeof continuousIntelligenceShadowCanaryActivationReadinessContractVersion;
  generated_at: string;
  readiness_status: "blocked" | "conditional" | "ready";
  decision: ContinuousIntelligenceShadowCanaryReadinessDecision;
  blockers: string[];
  warnings: string[];
  deployment_facts: ContinuousIntelligenceShadowCanaryActivationReadinessInput["deployment"];
  migration_schema_facts: ContinuousIntelligenceShadowCanarySchemaFacts & {
    all_tables_available: boolean;
    all_lifecycle_rpcs_available: boolean;
    lifecycle_permissions_safe: boolean;
  };
  environment_flag_facts: ContinuousIntelligenceShadowCanaryActivationReadinessInput["flags"];
  market_calendar_facts: ContinuousIntelligenceShadowCanaryActivationReadinessInput["market_calendar"] & {
    verified_calendar_ready: boolean;
  };
  durable_audit_facts: {
    table_reachable: boolean;
    readback_route_present: boolean;
    canary_entry_kind_supported: boolean;
    no_effect_constraint_available: boolean;
    persistence_flag_state: ContinuousIntelligenceShadowCanaryReadinessFlagState;
    writes_executed: false;
  };
  credit_ledger_facts: {
    table_reachable: boolean;
    readback_route_present: boolean;
    reconcile_route_present: boolean;
    canary_entry_kind_supported: boolean;
    zero_reserve_constraint_available: boolean;
    persistence_flag_state: ContinuousIntelligenceShadowCanaryReadinessFlagState;
    actual_credits_may_remain_unknown: true;
    durable_daily_usage_query_expected: true;
    writes_executed: false;
  };
  claim_lifecycle_facts: {
    contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1";
    claim_rpc_available: boolean;
    begin_attempt_rpc_available: boolean;
    finalize_attempt_rpc_available: boolean;
    statuses: ["claimed", "attempted", "completed", "failed"];
    terminal_states_immutable: true;
    deterministic_execution_identity_available: true;
    max_runs_per_utc_day: 2;
    max_estimated_credits_per_utc_day: 2;
    mutations_executed: false;
  };
  route_function_facts: ContinuousIntelligenceShadowCanaryActivationReadinessInput["deployment"] & {
    readiness_route_present: true;
    readiness_route_method: "GET";
    provider_calls_executed: false;
  };
  schedule_facts: ContinuousIntelligenceShadowCanaryActivationReadinessInput["schedule"];
  provider_budget_facts: ContinuousIntelligenceShadowCanaryActivationReadinessInput["provider_budget"] & {
    reserve_credits_used: 0;
    provider_calls_executed: false;
    capacity_reserved: false;
  };
  no_effect_facts: {
    provider_calls_executed: false;
    claims_created: false;
    attempts_begun: false;
    claims_finalized: false;
    audit_writes_executed: false;
    ledger_writes_executed: false;
    flags_changed: false;
    schedule_changed: false;
    recommendation_scanner_ranking_confidence_effects: false;
    position_execution_broker_effects: false;
  };
  recommended_next_action: string;
};

export type ContinuousIntelligenceShadowCanaryActivationReadinessDiagnostics = {
  activation_readiness_route_present: true;
  activation_readiness_status: "not_observed";
  latest_activation_readiness_decision: null;
  migration_readiness: "unknown";
  calendar_readiness: "unknown";
  activation_schedule_active: "unknown";
  activation_readiness_browser_invocation: false;
  activation_readiness_provider_inferred: false;
  activation_readiness_durable_writes_inferred: false;
  activation_readiness_claim_mutation_inferred: false;
};

function normalizedTimestamp(value: Date | string) {
  const parsed = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : new Date(0).toISOString();
}

function unique(values: string[]) {
  return [...new Set(values)];
}

export function normalizeContinuousIntelligenceShadowCanaryReadinessFlag(
  value: unknown,
): ContinuousIntelligenceShadowCanaryReadinessFlagState {
  if (value === "true" || value === "1") return "enabled";
  if (value === "false" || value === "0") return "disabled";
  return "unresolved";
}

export function isContinuousIntelligenceShadowCanaryReadinessAuthenticated(
  expectedSecret: string | undefined,
  suppliedSecret: string | null,
) {
  return Boolean(expectedSecret && suppliedSecret && suppliedSecret === expectedSecret);
}

export function normalizeContinuousIntelligenceShadowCanaryProviderBudgetStatus(
  value: unknown,
): "within_budget" | "approaching_limit" | "unresolved" {
  return value === "within_budget" || value === "approaching_limit"
    ? value
    : "unresolved";
}

export function normalizeContinuousIntelligenceShadowCanaryDeploymentSignal(
  value: unknown,
): ContinuousIntelligenceShadowCanaryDeploymentState {
  if (value === "true" || value === "1") return "present";
  if (value === "false" || value === "0") return "absent";
  return "unknown";
}

function recommendationFor(decision: ContinuousIntelligenceShadowCanaryReadinessDecision) {
  switch (decision) {
    case "ready_for_migration_application":
      return "Apply the approved Actions 572-575 migrations, then repeat the read-only schema probe.";
    case "ready_for_flag_configuration":
      return "Configure durable audit and credit-ledger flags only; keep the canary disabled and kill switch active.";
    case "ready_for_preflight_observation":
      return "Integrate a verified server-side US market calendar before observing production canary preflight.";
    case "ready_for_one_manual_canary_attempt":
      return "Observe production preflight, then separately authorize one manually controlled canary attempt.";
    case "ready_for_schedule_activation_review":
      return "Review the durable manual-canary evidence before any separate schedule activation action.";
    case "not_ready":
      return "Resolve the reported readiness blockers without enabling or invoking the canary.";
  }
}

export function buildContinuousIntelligenceShadowCanaryActivationReadiness(
  input: ContinuousIntelligenceShadowCanaryActivationReadinessInput,
): ContinuousIntelligenceShadowCanaryActivationReadiness {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const deploymentReady = Object.values(input.deployment).every(Boolean);
  if (!deploymentReady) blockers.push("deployment_components_missing");

  const schema = input.schema;
  const allTablesAvailable = schema.audit_table_available === true && schema.ledger_table_available === true && schema.claim_table_available === true;
  const allLifecycleRpcsAvailable = schema.claim_rpc_available === true && schema.begin_attempt_rpc_available === true && schema.finalize_attempt_rpc_available === true;
  const lifecyclePermissionsSafe =
    schema.lifecycle_rpcs_public_executable === false &&
    schema.lifecycle_rpcs_anon_executable === false &&
    schema.lifecycle_rpcs_authenticated_executable === false &&
    schema.lifecycle_rpcs_service_role_executable === true;
  if (schema.probe_status === "auth_failure") blockers.push("schema_probe_auth_failure");
  if (schema.probe_status === "unknown") blockers.push("schema_probe_unavailable");
  if (schema.probe_status === "available" && allLifecycleRpcsAvailable && !lifecyclePermissionsSafe) blockers.push("lifecycle_rpc_permissions_unsafe");
  if (schema.probe_status === "available" && schema.claim_table_available === true && schema.claim_status_constraint_available !== true) blockers.push("claim_status_contract_missing");
  if (schema.probe_status === "available" && schema.audit_table_available === true && schema.audit_canary_entry_kind_constrained !== true) blockers.push("audit_canary_contract_missing");
  if (schema.probe_status === "available" && schema.audit_table_available === true && schema.audit_no_effect_constraint_available !== true) blockers.push("audit_no_effect_contract_missing");
  if (schema.probe_status === "available" && schema.ledger_table_available === true && schema.ledger_canary_entry_kind_constrained !== true) blockers.push("ledger_canary_contract_missing");
  if (schema.probe_status === "available" && schema.ledger_table_available === true && schema.ledger_zero_reserve_constraint_available !== true) blockers.push("ledger_zero_reserve_contract_missing");

  if (input.flags.durable_audit === "unresolved") blockers.push("durable_audit_flag_unresolved");
  if (input.flags.credit_ledger === "unresolved") blockers.push("credit_ledger_flag_unresolved");
  if (input.flags.canary === "unresolved") blockers.push("canary_flag_unresolved");
  if (input.flags.kill_switch === "unresolved") blockers.push("canary_kill_switch_unresolved");
  if (input.flags.canary === "enabled") blockers.push("canary_enabled_during_readiness");
  if (input.flags.kill_switch === "disabled") blockers.push("canary_kill_switch_inactive_during_readiness");
  if (input.flags.durable_audit === "disabled") warnings.push("durable_audit_requires_configuration");
  if (input.flags.credit_ledger === "disabled") warnings.push("credit_ledger_requires_configuration");

  const policyMatches = input.provider_budget.policy_total_credits === 377 && input.provider_budget.policy_hard_reserve_credits === 57 && input.provider_budget.policy_normal_planned_max_credits === 320;
  if (!input.provider_budget.provider_configured) blockers.push("provider_not_configured");
  if (input.provider_budget.metadata_status === "unresolved") blockers.push("provider_budget_metadata_unresolved");
  if (!policyMatches) blockers.push("provider_budget_policy_mismatch");
  if (!input.provider_budget.one_credit_normal_allocation_authorized) blockers.push("normal_capacity_authorization_unavailable");
  if (!input.provider_budget.hard_reserve_preserved || input.provider_budget.execution_ready_reserve_consumed) blockers.push("hard_reserve_not_protected");

  const calendarReady =
    input.market_calendar.source_configured &&
    input.market_calendar.source_verified &&
    input.market_calendar.holiday_awareness_available &&
    input.market_calendar.regular_session_determination_available &&
    input.market_calendar.latest_completed_30_minute_range_derivable;
  if (!calendarReady) warnings.push("verified_market_calendar_required");

  if (!input.schedule.function_foundation_present) blockers.push("canary_function_foundation_missing");
  const unexpectedScheduleState =
    input.schedule.repository_schedule_declaration === "present" ||
    input.schedule.deployment_schedule_declaration === "present" ||
    input.schedule.remote_schedule_active === "present" ||
    input.schedule.duplicate_schedule_mechanism === "present" ||
    input.schedule.future_frequency_selection === "present";
  if (unexpectedScheduleState) {
    blockers.push("unexpected_schedule_activation_state");
  }
  if (input.schedule.deployment_schedule_declaration === "unknown" || input.schedule.remote_schedule_active === "unknown") blockers.push("schedule_state_unverified");
  if (input.schedule.duplicate_schedule_mechanism === "unknown") blockers.push("duplicate_schedule_state_unverified");
  if (input.schedule.future_frequency_selection === "unknown") blockers.push("schedule_frequency_state_unverified");

  const migrationsMissing = schema.probe_status === "schema_unavailable" || !allTablesAvailable || !allLifecycleRpcsAvailable;
  const flagConfigurationRequired = input.flags.durable_audit === "disabled" || input.flags.credit_ledger === "disabled";
  const scheduleVerificationBlockers = new Set(["schedule_state_unverified", "duplicate_schedule_state_unverified", "schedule_frequency_state_unverified"]);
  const criticalBlockers = blockers.filter((blocker) => !scheduleVerificationBlockers.has(blocker));
  const scheduleStateVerified = blockers.every((blocker) => !scheduleVerificationBlockers.has(blocker));
  let decision: ContinuousIntelligenceShadowCanaryReadinessDecision;
  if (criticalBlockers.length > 0) {
    decision = "not_ready";
  } else if (migrationsMissing) {
    decision = "ready_for_migration_application";
  } else if (flagConfigurationRequired) {
    decision = "ready_for_flag_configuration";
  } else if (!calendarReady || !scheduleStateVerified) {
    decision = "ready_for_preflight_observation";
  } else if (input.manual_canary_evidence_verified === true) {
    decision = "ready_for_schedule_activation_review";
  } else {
    decision = "ready_for_one_manual_canary_attempt";
  }
  const readinessStatus = decision === "not_ready" ? "blocked" : decision === "ready_for_one_manual_canary_attempt" || decision === "ready_for_schedule_activation_review" ? "ready" : "conditional";

  return {
    contract_version: continuousIntelligenceShadowCanaryActivationReadinessContractVersion,
    generated_at: normalizedTimestamp(input.now),
    readiness_status: readinessStatus,
    decision,
    blockers: unique(blockers),
    warnings: unique(warnings),
    deployment_facts: structuredClone(input.deployment),
    migration_schema_facts: { ...structuredClone(schema), all_tables_available: allTablesAvailable, all_lifecycle_rpcs_available: allLifecycleRpcsAvailable, lifecycle_permissions_safe: lifecyclePermissionsSafe },
    environment_flag_facts: structuredClone(input.flags),
    market_calendar_facts: { ...structuredClone(input.market_calendar), verified_calendar_ready: calendarReady },
    durable_audit_facts: { table_reachable: schema.audit_table_available === true, readback_route_present: input.deployment.audit_route_present, canary_entry_kind_supported: schema.audit_canary_entry_kind_constrained === true, no_effect_constraint_available: schema.audit_no_effect_constraint_available === true, persistence_flag_state: input.flags.durable_audit, writes_executed: false },
    credit_ledger_facts: { table_reachable: schema.ledger_table_available === true, readback_route_present: input.deployment.ledger_route_present, reconcile_route_present: input.deployment.ledger_reconcile_route_present, canary_entry_kind_supported: schema.ledger_canary_entry_kind_constrained === true, zero_reserve_constraint_available: schema.ledger_zero_reserve_constraint_available === true, persistence_flag_state: input.flags.credit_ledger, actual_credits_may_remain_unknown: true, durable_daily_usage_query_expected: true, writes_executed: false },
    claim_lifecycle_facts: { contract_version: "continuous_intelligence_shadow_canary_daily_claim_v1", claim_rpc_available: schema.claim_rpc_available === true, begin_attempt_rpc_available: schema.begin_attempt_rpc_available === true, finalize_attempt_rpc_available: schema.finalize_attempt_rpc_available === true, statuses: ["claimed", "attempted", "completed", "failed"], terminal_states_immutable: true, deterministic_execution_identity_available: true, max_runs_per_utc_day: 2, max_estimated_credits_per_utc_day: 2, mutations_executed: false },
    route_function_facts: { ...structuredClone(input.deployment), readiness_route_present: true, readiness_route_method: "GET", provider_calls_executed: false },
    schedule_facts: structuredClone(input.schedule),
    provider_budget_facts: { ...structuredClone(input.provider_budget), reserve_credits_used: 0, provider_calls_executed: false, capacity_reserved: false },
    no_effect_facts: { provider_calls_executed: false, claims_created: false, attempts_begun: false, claims_finalized: false, audit_writes_executed: false, ledger_writes_executed: false, flags_changed: false, schedule_changed: false, recommendation_scanner_ranking_confidence_effects: false, position_execution_broker_effects: false },
    recommended_next_action: recommendationFor(decision),
  };
}

export function buildContinuousIntelligenceShadowCanaryActivationReadinessDiagnostics(): ContinuousIntelligenceShadowCanaryActivationReadinessDiagnostics {
  return {
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
  };
}
