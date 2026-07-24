import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { resolveContinuousIntelligenceShadowCanaryRuntimeDeploymentCommit } from "../../lib/continuous-intelligence-shadow-canary-runtime-deployment-identity";
import {
  buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-admission";
import {
  buildContinuousIntelligenceShadowCanaryScheduledDryRunRequest,
  evaluateContinuousIntelligenceShadowCanaryScheduledDryRun,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-dry-run";
import {
  continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
  evaluateContinuousIntelligenceShadowCanaryScheduledBudget,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-execution-safety";
import { buildContinuousIntelligenceShadowCanaryUsageAccounting } from "../../lib/continuous-intelligence-shadow-canary-usage-accounting";

const root = resolve(__dirname, "../..");
const staleConfiguredCommit = "7eb1f42440d7555041f68697a2d05157f3a640f5";
const deployedCommit = "1182f172fc85c0bf38e4b49adbf36ec4358ad6fe";

function scheduledRequest() {
  const request = buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest({
    deployment_commit: deployedCommit,
    market_date: "2026-07-23",
    market_window: {
      start: "2026-07-23T14:00:00.000Z",
      end: "2026-07-23T14:30:00.000Z",
    },
    requested_at: "2026-07-23T14:31:00.000Z",
  });
  if (!request) throw new Error("Expected a canonical scheduled request.");
  const dryRun = buildContinuousIntelligenceShadowCanaryScheduledDryRunRequest(request);
  if (!dryRun) throw new Error("Expected a canonical scheduled dry-run request.");
  return dryRun;
}

test("Action 626 reproduces the stale explicit runtime deployment binding without normalizing it away", () => {
  const resolved = resolveContinuousIntelligenceShadowCanaryRuntimeDeploymentCommit({
    TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT: staleConfiguredCommit,
    COMMIT_REF: deployedCommit,
    NETLIFY_COMMIT_REF: deployedCommit,
  });

  expect(resolved).toBe(staleConfiguredCommit);
  expect(resolved).not.toBe(deployedCommit);
  expect(resolveContinuousIntelligenceShadowCanaryRuntimeDeploymentCommit({
    TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT: "invalid",
    COMMIT_REF: deployedCommit,
  })).toBe(deployedCommit);
});

test("Action 626 preserves deployment mismatch and persistence stop as separate typed dry-run blockers", () => {
  const evidence = evaluateContinuousIntelligenceShadowCanaryScheduledDryRun({
    authentication: "scheduler_auth_ready",
    request: scheduledRequest(),
    dependencies: {
      deployment: "mismatch",
      scheduled_execution_enabled: false,
      canary: "blocked",
      kill_switch: "blocked",
      schedule: "blocked",
      calendar_window: "blocked",
      provider_planner: "ready",
      audit_ledger: "ready",
      historical_usage: "ready",
      budget: "usage_disagreement",
      persistence: "unresolved_audit_failure",
      active_claim: "clear",
      retry: "ineligible",
      correlation: "consistent",
    },
    now: new Date("2026-07-23T14:31:00.000Z"),
  });

  expect(evidence.first_blocker).toBe("deployment_identity_mismatch");
  expect(evidence.blockers).toEqual(expect.arrayContaining([
    "deployment_identity_mismatch",
    "scheduled_budget_blocked",
    "persistence_stop_active",
  ]));
  expect(evidence.execution_barrier).toBe("dry_run_only");
  expect(evidence.provider_calls).toBe(0);
  expect(evidence.claims_created).toBe(0);
  expect(evidence.audit_writes).toBe(0);
  expect(evidence.ledger_writes).toBe(0);
  expect(evidence.usage_mutations).toBe(0);
});

test("Action 626 reproduces the independent manual-ledger and claim-capacity disagreement", () => {
  const usage = buildContinuousIntelligenceShadowCanaryUsageAccounting({
    utc_day: "2026-07-23",
    ledger_rows: [{
      entry_kind: "bounded_manual_proof",
      generated_at: "2026-07-23T14:30:00.000Z",
      provider_estimated_credits: 1,
    }],
    claim_rows: [
      { utc_day: "2026-07-23", estimated_credits: 1, status: "completed" },
      { utc_day: "2026-07-23", estimated_credits: 1, status: "completed" },
    ],
  });

  expect(usage).toMatchObject({
    status: "available",
    scheduled_shadow_collector_canary: { attempts: 0, estimated_credits: 0 },
    bounded_manual_proof: { attempts: 1, estimated_credits: 1 },
    total_ledger: { attempts: 1, estimated_credits: 1 },
    claim_capacity: { attempts: 2, estimated_credits: 2 },
  });
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledBudget({
    policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
    usage,
    invocation: {
      provider_calls: 1,
      estimated_credits: 1,
      active_scheduled_claims: 0,
      scheduled_claims_for_market_window: 0,
    },
  })).toBe("usage_disagreement");
});

test("Action 626 root-cause coverage remains isolated after the scheduled scope repair", () => {
  const reader = readFileSync(resolve(root, "lib/server/continuous-intelligence-shadow-canary-scheduled-admission-context.ts"), "utf8");
  const scheduledContract = readFileSync(resolve(root, "lib/continuous-intelligence-shadow-canary-scheduled-admission.ts"), "utf8");
  const auditMapper = readFileSync(resolve(root, "lib/bounded-shadow-collector-proof-audit-store.ts"), "utf8");

  expect(reader).toContain("evaluateContinuousIntelligenceShadowCanaryScheduledDurableState");
  expect(reader).not.toContain('value.startsWith("canary_execution_")');
  expect(scheduledContract).toContain("scheduled_canary_execution_${canonical.occurrence_id}");
  expect(auditMapper).toContain("const legacyMatch = /^canary_execution_");
  expect(auditMapper).toContain("const manualMatch = /^manual_canary_execution_");
});

test("Action 626 preserves dry-run structural containment while diagnostics remain local", () => {
  const route = readFileSync(resolve(root, "app/api/automation/continuous-intelligence/shadow-collector/canary/scheduled-dry-run/route.ts"), "utf8");
  const handler = readFileSync(resolve(root, "lib/server/continuous-intelligence-shadow-canary-scheduled-dry-run-handler.ts"), "utf8");

  for (const forbidden of [
    "claimContinuous",
    "beginContinuous",
    "finalizeContinuous",
    "persistBounded",
    "persistContinuous",
    "getIntradayCandlesWithDiagnostics",
  ]) {
    expect(route).not.toContain(forbidden);
    expect(handler).not.toContain(forbidden);
  }
  expect(handler).toContain("evaluateContinuousIntelligenceShadowCanaryScheduledDryRun");
});
