export type ContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness = Readonly<{
  release_scope_complete: boolean;
  migration_locally_accepted: boolean;
  production_schema_dependencies: "confirmed" | "unknown" | "mismatch";
  deployment_identity_plan: "resolved" | "unresolved" | "conflict";
  migration_state: "not_deployed" | "deployed_unverified" | "verified";
  rpc_state: "unverified" | "verified";
  safe_production_state: "confirmed" | "unknown" | "unsafe";
  target_state: "exact" | "unknown" | "mismatch";
  operator_approval: "missing" | "exact" | "wrong_target" | "expired";
  authorization_state: "absent" | "issued" | "consumed" | "unknown";
  reconciliation_state: "not_applied" | "complete" | "failed" | "unknown";
}>;

export type ContinuousIntelligenceHistoricalUsageReconciliationProductionReadinessResult = Readonly<{
  status:
    | "not_ready_release_uncommitted"
    | "not_ready_schema_dependency_unknown"
    | "not_ready_deployment_configuration_unresolved"
    | "not_ready_migration_not_deployed"
    | "not_ready_rpc_not_verified"
    | "not_ready_target_state_mismatch"
    | "not_ready_operator_approval_missing"
    | "ready_for_authorization_issuance"
    | "ready_for_single_reconciliation"
    | "reconciliation_complete"
    | "reconciliation_state_unknown"
    | "reconciliation_failed_closed";
  production_mutation_performed: false;
}>;

/**
 * This evaluates evidence supplied by a future production operator. It is
 * deliberately pure: it never reads production state or authorizes a write.
 */
export function evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(
  input: ContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness,
): ContinuousIntelligenceHistoricalUsageReconciliationProductionReadinessResult {
  if (!input.release_scope_complete || !input.migration_locally_accepted) return result("not_ready_release_uncommitted");
  if (input.production_schema_dependencies !== "confirmed") return result("not_ready_schema_dependency_unknown");
  if (input.deployment_identity_plan !== "resolved") return result("not_ready_deployment_configuration_unresolved");
  if (input.migration_state === "not_deployed") return result("not_ready_migration_not_deployed");
  if (input.migration_state !== "verified" || input.rpc_state !== "verified") return result("not_ready_rpc_not_verified");
  if (input.safe_production_state !== "confirmed" || input.target_state !== "exact") return result("not_ready_target_state_mismatch");
  if (input.reconciliation_state === "complete") return result("reconciliation_complete");
  if (input.reconciliation_state === "failed") return result("reconciliation_failed_closed");
  if (input.reconciliation_state === "unknown" || input.authorization_state === "unknown") return result("reconciliation_state_unknown");
  if (input.operator_approval !== "exact") return result("not_ready_operator_approval_missing");
  if (input.authorization_state === "absent") return result("ready_for_authorization_issuance");
  if (input.authorization_state === "issued") return result("ready_for_single_reconciliation");
  return result("reconciliation_state_unknown");
}

function result(
  status: ContinuousIntelligenceHistoricalUsageReconciliationProductionReadinessResult["status"],
): ContinuousIntelligenceHistoricalUsageReconciliationProductionReadinessResult {
  return Object.freeze({ status, production_mutation_performed: false });
}
