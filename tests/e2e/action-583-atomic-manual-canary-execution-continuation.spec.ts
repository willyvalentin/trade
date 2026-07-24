import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

const root = path.resolve(__dirname, "../..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

const admissionMigration = "supabase/migrations/20260722002000_admit_continuous_intelligence_shadow_canary_manual_execution.sql";
const executionRoute = "app/api/automation/continuous-intelligence/shadow-collector/canary/manual-execution/route.ts";
const gateRoute = "app/api/automation/continuous-intelligence/shadow-collector/canary/manual-execution-gate/route.ts";

test("Action 583 atomically admits a consumed authorization only with an attempted claim", () => {
  const migration = read(admissionMigration);
  expect(migration).toContain("admit_continuous_intelligence_shadow_canary_manual_execution");
  expect(migration).toContain("for update");
  expect(migration).toContain("status = 'consumed'");
  expect(migration).toContain("status, provider_attempted");
  expect(migration).toContain("1, 'attempted', false");
  expect(migration.indexOf("insert into public.continuous_intelligence_shadow_canary_daily_claims")).toBeLessThan(
    migration.indexOf("set status = 'consumed'"),
  );
  expect(migration).toContain("authorization_replayed");
  expect(migration).toContain("authorization_expired");
  expect(migration).toContain("daily_limit_reached");
  expect(migration).toContain("grant execute on function public.admit_continuous_intelligence_shadow_canary_manual_execution");
  expect(migration).toContain("to service_role");
  expect(migration).toContain("from public, anon, authenticated");
});

test("Action 583 canonical route finalizes every admitted path before durable receipt writes", () => {
  const route = read(executionRoute);
  expect(route).toContain("admitContinuousIntelligenceShadowCanaryManualExecution");
  expect(route).toContain("attempt_started");
  expect(route).toContain("finalizeContinuousIntelligenceShadowCanaryDailyClaim");
  expect(route.lastIndexOf("finalizeContinuousIntelligenceShadowCanaryDailyClaim(")).toBeLessThan(
    route.lastIndexOf("persistBoundedShadowCollectorProofAudit("),
  );
  expect(route.lastIndexOf("persistBoundedShadowCollectorProofAudit(")).toBeLessThan(
    route.lastIndexOf("persistContinuousIntelligenceCreditLedger("),
  );
  expect(route).toContain("entry_kind: \"bounded_manual_proof\"");
  expect(route).toContain("providerEntered ? 1 : 0");
  expect(route).toContain("recheckContinuousIntelligenceShadowCanaryRuntimeWithManualExecutionLease");
  expect(route).toContain("context.kill_switch_active");
  expect(route).toContain("provider_calls_executed: providerEntered");
  expect(route).not.toContain("console.");
});

test("Action 583 preserves the bounded contract and blocks the legacy consuming handoff", () => {
  const route = read(executionRoute);
  const gate = read(gateRoute);
  expect(route).toContain("raw.authorization_token.length < 32 || raw.authorization_token.length > 256");
  expect(route).toContain("daily_capacity_available");
  expect(route).toContain("provider_budget_resolved");
  expect(route).toContain("auditEnabled || !ledgerEnabled");
  expect(route).not.toContain("Twelve Data API");
  expect(gate).toContain("execution_handoff_unavailable");
  expect(gate).toContain("canonical server-controlled route");
  expect(gate).not.toContain("consumeContinuousIntelligenceShadowCanaryManualAuthorization");
});
