import { expect, test } from "@playwright/test";

import {
  evaluateContinuousIntelligenceShadowCanaryScheduledDeploymentBinding,
  resolveContinuousIntelligenceShadowCanaryScheduledRuntimeDeploymentIdentity,
} from "../../lib/continuous-intelligence-shadow-canary-runtime-deployment-identity";
import {
  isContinuousIntelligenceShadowCanaryScheduledExecutionIdentity,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-admission";
import {
  evaluateContinuousIntelligenceShadowCanaryScheduledDurableState,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-durable-state";
import {
  buildContinuousIntelligenceShadowCanaryScheduledDryRunRequest,
  evaluateContinuousIntelligenceShadowCanaryScheduledDryRun,
  type ScheduledDryRunDependencies,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-dry-run";
import {
  continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
  evaluateContinuousIntelligenceShadowCanaryScheduledBudget,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-execution-safety";
import { buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest } from "../../lib/continuous-intelligence-shadow-canary-scheduled-admission";
import { buildContinuousIntelligenceShadowCanaryUsageAccounting } from "../../lib/continuous-intelligence-shadow-canary-usage-accounting";
import { createContinuousIntelligenceShadowCanaryScheduledDryRunHandler } from "../../lib/server/continuous-intelligence-shadow-canary-scheduled-dry-run-handler";

const deployedCommit = "1182f172fc85c0bf38e4b49adbf36ec4358ad6fe";
const staleCommit = "7eb1f42440d7555041f68697a2d05157f3a640f5";
const occurrenceId = "scheduled_canary_occurrence_20260723_1430_deadbeef";
const scheduledExecutionId = `scheduled_canary_execution_${occurrenceId}`;
const scheduledClaimId = `canary_claim_${scheduledExecutionId}`;
const scheduledReceiptId = `scheduled_canary_receipt_${occurrenceId}`;
const fingerprint = "AAPL|5min|2026-07-23T14:00:00.000Z|2026-07-23T14:30:00.000Z";

function request() {
  const scheduled = buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest({
    deployment_commit: deployedCommit,
    market_date: "2026-07-23",
    market_window: { start: "2026-07-23T14:00:00.000Z", end: "2026-07-23T14:30:00.000Z" },
    requested_at: "2026-07-23T14:31:00.000Z",
  });
  if (!scheduled) throw new Error("Expected a canonical scheduled request.");
  const dryRun = buildContinuousIntelligenceShadowCanaryScheduledDryRunRequest(scheduled);
  if (!dryRun) throw new Error("Expected a canonical dry-run request.");
  return dryRun;
}

function readyDependencies(overrides: Partial<ScheduledDryRunDependencies> = {}): ScheduledDryRunDependencies {
  return {
    deployment: "exact",
    scheduled_execution_enabled: false,
    canary: "blocked",
    kill_switch: "blocked",
    schedule: "blocked",
    calendar_window: "ready",
    provider_planner: "ready",
    audit_ledger: "ready",
    historical_usage: "ready",
    budget: "scheduled_budget_ready",
    persistence: "clean",
    active_claim: "clear",
    retry: "eligible",
    correlation: "consistent",
    ...overrides,
  };
}

test("Action 627 accepts only canonical scheduled execution identities", () => {
  expect(isContinuousIntelligenceShadowCanaryScheduledExecutionIdentity(scheduledExecutionId)).toBe(true);
  expect(isContinuousIntelligenceShadowCanaryScheduledExecutionIdentity("canary_execution_20260723_deadbeef")).toBe(false);
  expect(isContinuousIntelligenceShadowCanaryScheduledExecutionIdentity(`manual_${scheduledExecutionId}`)).toBe(false);
  expect(isContinuousIntelligenceShadowCanaryScheduledExecutionIdentity(`${scheduledExecutionId}_suffix`)).toBe(false);
  expect(isContinuousIntelligenceShadowCanaryScheduledExecutionIdentity("scheduled_canary_execution_fixture")).toBe(false);
});

test("Action 627 keeps manual-only history out of scheduled persistence health", () => {
  const state = evaluateContinuousIntelligenceShadowCanaryScheduledDurableState({
    claims: [{
      claim_id: "canary_claim_canary_execution_20260723_deadbeef",
      execution_id: "canary_execution_20260723_deadbeef",
      request_fingerprint: fingerprint,
      status: "completed",
      source_receipt_id: "legacy_manual_receipt",
    }],
    audits: [],
    ledger: [],
    occurrence_id: null,
    request_fingerprint: null,
  });

  expect(state).toEqual({
    active_claims: "clear",
    persistence_stop: "clear",
    active_scheduled_claims: 0,
    scheduled_claims_for_market_window: null,
  });
});

test("Action 627 retains every real scheduled persistence failure and healthy completion", () => {
  const claim = {
    claim_id: scheduledClaimId,
    execution_id: scheduledExecutionId,
    request_fingerprint: fingerprint,
    status: "completed",
    source_receipt_id: scheduledReceiptId,
  };
  const input = { occurrence_id: occurrenceId, request_fingerprint: fingerprint };

  expect(evaluateContinuousIntelligenceShadowCanaryScheduledDurableState({ claims: [], audits: [], ledger: [], ...input }).persistence_stop)
    .toBe("clear");
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledDurableState({ claims: [claim], audits: [], ledger: [], ...input }).persistence_stop)
    .toBe("audit_failed");
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledDurableState({
    claims: [claim], audits: [{ daily_claim_id: scheduledClaimId }], ledger: [], ...input,
  }).persistence_stop).toBe("ledger_failed");
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledDurableState({
    claims: [claim],
    audits: [{ daily_claim_id: scheduledClaimId }],
    ledger: [{ source_receipt_id: scheduledReceiptId }],
    ...input,
  }).persistence_stop).toBe("clear");
});

test("Action 627 treats malformed scheduled namespace entries as unavailable rather than healthy", () => {
  const state = evaluateContinuousIntelligenceShadowCanaryScheduledDurableState({
    claims: [{
      claim_id: "canary_claim_scheduled_canary_execution_bad",
      execution_id: "scheduled_canary_execution_bad",
      request_fingerprint: fingerprint,
      status: "completed",
      source_receipt_id: "scheduled_canary_receipt_bad",
    }],
    audits: [],
    ledger: [],
    occurrence_id: null,
    request_fingerprint: null,
  });

  expect(state).toMatchObject({ active_claims: "unavailable", persistence_stop: "unavailable" });
});

test("Action 627 uses platform identity as canonical and surfaces explicit conflicts", async () => {
  const matching = resolveContinuousIntelligenceShadowCanaryScheduledRuntimeDeploymentIdentity({
    TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT: deployedCommit,
    COMMIT_REF: deployedCommit,
    NETLIFY_COMMIT_REF: deployedCommit,
  });
  expect(matching).toMatchObject({ status: "available", deployment_commit: deployedCommit, source: "platform_commit_ref" });
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledDeploymentBinding({ runtime: matching, request_deployment_commit: deployedCommit }))
    .toBe("exact");

  const conflict = resolveContinuousIntelligenceShadowCanaryScheduledRuntimeDeploymentIdentity({
    TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT: staleCommit,
    COMMIT_REF: deployedCommit,
    NETLIFY_COMMIT_REF: deployedCommit,
  });
  expect(conflict).toMatchObject({
    status: "explicit_configuration_conflict",
    deployment_commit: deployedCommit,
    source: "platform_commit_ref",
    explicit_commit: staleCommit,
  });
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledDeploymentBinding({ runtime: conflict, request_deployment_commit: deployedCommit }))
    .toBe("explicit_configuration_conflict");

  const fallback = resolveContinuousIntelligenceShadowCanaryScheduledRuntimeDeploymentIdentity({
    TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT: deployedCommit,
  });
  expect(fallback).toMatchObject({ status: "available", deployment_commit: deployedCommit, source: "explicit_fallback" });
  expect(resolveContinuousIntelligenceShadowCanaryScheduledRuntimeDeploymentIdentity({
    TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT: "short",
    COMMIT_REF: deployedCommit,
  }).status).toBe("explicit_configuration_malformed");

  const handler = createContinuousIntelligenceShadowCanaryScheduledDryRunHandler({
    expected_secret: () => "fixture-secret",
    dependencies: async () => readyDependencies({ deployment: "explicit_configuration_conflict" }),
  });
  const response = await handler(new Request("http://local", {
    method: "POST",
    headers: { "x-automation-secret": "fixture-secret" },
    body: JSON.stringify(request()),
  }));
  const body = await response.json();
  expect(response.status).toBe(409);
  expect(body).toMatchObject({ result: "scheduled_dry_run_deployment_configuration_conflict" });
  expect(body.evidence.first_blocker).toBe("deployment_configuration_conflict");
});

test("Action 627 leaves the historical manual claim and ledger disagreement fail-closed", () => {
  const usage = buildContinuousIntelligenceShadowCanaryUsageAccounting({
    utc_day: "2026-07-23",
    ledger_rows: [{ entry_kind: "bounded_manual_proof", generated_at: "2026-07-23T14:30:00.000Z", provider_estimated_credits: 1 }],
    claim_rows: [
      { utc_day: "2026-07-23", estimated_credits: 1, status: "completed" },
      { utc_day: "2026-07-23", estimated_credits: 1, status: "completed" },
    ],
  });
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledBudget({
    policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
    usage,
    invocation: { provider_calls: 1, estimated_credits: 1, active_scheduled_claims: 0, scheduled_claims_for_market_window: 0 },
  })).toBe("usage_disagreement");

  const evidence = evaluateContinuousIntelligenceShadowCanaryScheduledDryRun({
    authentication: "scheduler_auth_ready",
    request: request(),
    dependencies: readyDependencies({ budget: "usage_disagreement", persistence: "clean" }),
    now: new Date("2026-07-23T14:31:00.000Z"),
  });
  expect(evidence.blockers).toContain("scheduled_budget_blocked");
  expect(evidence.provider_calls).toBe(0);
  expect(evidence.claims_created).toBe(0);
  expect(evidence.audit_writes).toBe(0);
  expect(evidence.ledger_writes).toBe(0);
});
