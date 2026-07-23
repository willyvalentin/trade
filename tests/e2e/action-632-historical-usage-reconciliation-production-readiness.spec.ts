import { expect, test } from "@playwright/test";

import {
  evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness,
  type ContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness,
} from "../../lib/continuous-intelligence-historical-usage-reconciliation-production-readiness";

function readiness(
  overrides: Partial<ContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness> = {},
): ContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness {
  return {
    release_scope_complete: true,
    migration_locally_accepted: true,
    production_schema_dependencies: "confirmed",
    deployment_identity_plan: "resolved",
    migration_state: "verified",
    rpc_state: "verified",
    safe_production_state: "confirmed",
    target_state: "exact",
    operator_approval: "exact",
    authorization_state: "absent",
    reconciliation_state: "not_applied",
    ...overrides,
  };
}

test("Action 632 blocks incomplete release scope, local acceptance, and critical schema assumptions", () => {
  expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(readiness({ release_scope_complete: false })).status)
    .toBe("not_ready_release_uncommitted");
  expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(readiness({ migration_locally_accepted: false })).status)
    .toBe("not_ready_release_uncommitted");
  expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(readiness({ production_schema_dependencies: "unknown" })).status)
    .toBe("not_ready_schema_dependency_unknown");
  expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(readiness({ migration_state: "not_deployed" })).status)
    .toBe("not_ready_migration_not_deployed");
});

test("Action 632 blocks stale deployment planning, unverified RPCs, and mismatched targets", () => {
  expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(readiness({ deployment_identity_plan: "conflict" })).status)
    .toBe("not_ready_deployment_configuration_unresolved");
  expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(readiness({ migration_state: "deployed_unverified" })).status)
    .toBe("not_ready_rpc_not_verified");
  expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(readiness({ target_state: "mismatch" })).status)
    .toBe("not_ready_target_state_mismatch");
});

test("Action 632 requires exact current approval before modeled issuance or reconciliation", () => {
  expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(readiness({ operator_approval: "missing" })).status)
    .toBe("not_ready_operator_approval_missing");
  expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(readiness({ operator_approval: "wrong_target" })).status)
    .toBe("not_ready_operator_approval_missing");
  expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(readiness({ operator_approval: "expired" })).status)
    .toBe("not_ready_operator_approval_missing");
  expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(readiness()).status)
    .toBe("ready_for_authorization_issuance");
  expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(readiness({ authorization_state: "issued" })).status)
    .toBe("ready_for_single_reconciliation");
});

test("Action 632 preserves fail-closed terminal states and never performs a mutation", () => {
  for (const input of [
    readiness({ reconciliation_state: "complete" }),
    readiness({ reconciliation_state: "failed" }),
    readiness({ reconciliation_state: "unknown" }),
  ]) expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(input).production_mutation_performed).toBe(false);
  expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(readiness({ reconciliation_state: "complete" })).status)
    .toBe("reconciliation_complete");
  expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(readiness({ reconciliation_state: "failed" })).status)
    .toBe("reconciliation_failed_closed");
  expect(evaluateContinuousIntelligenceHistoricalUsageReconciliationProductionReadiness(readiness({ reconciliation_state: "unknown" })).status)
    .toBe("reconciliation_state_unknown");
});
