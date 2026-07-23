import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

import { evaluateContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation } from "../../lib/continuous-intelligence-shadow-canary-historical-manual-usage-reconciliation";
import { evaluateContinuousIntelligenceShadowCanaryScheduledDurableState } from "../../lib/continuous-intelligence-shadow-canary-scheduled-durable-state";
import { buildContinuousIntelligenceShadowCanaryUsageAccounting } from "../../lib/continuous-intelligence-shadow-canary-usage-accounting";

const action609 = {
  claim_id: "manual_claim_action_609",
  attempt_identity: "manual_attempt_action_609",
  provider_usage: "confirmed" as const,
  ledger_contract: "required" as const,
  audit_linkage: "matching" as const,
  ledger_linkage: "identity_collision" as const,
};

const action617 = {
  claim_id: "manual_claim_action_617",
  attempt_identity: "manual_attempt_action_617",
  provider_usage: "confirmed" as const,
  ledger_contract: "required" as const,
  audit_linkage: "matching" as const,
  ledger_linkage: "matching" as const,
};

test("Action 628 leaves balanced distinct manual attempts ready only with matching ledger evidence", () => {
  expect(evaluateContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation({
    claims: [{ ...action609, ledger_linkage: "matching" as const }, action617],
    persisted_ledger_units: 2,
  })).toMatchObject({ category: "balanced", provider_usage_units: 2, claim_capacity_units: 2, persisted_ledger_units: 2 });
});

test("Action 628 separates verified pre-ledger, non-usage, unknown, and audit cases", () => {
  expect(evaluateContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation({
    claims: [{ ...action609, ledger_contract: "pre_ledger", ledger_linkage: "missing" }],
    persisted_ledger_units: 0,
  }).category).toBe("verified_legacy_usage_requires_reconciliation");
  expect(evaluateContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation({
    claims: [{ ...action609, provider_usage: "not_reached", ledger_linkage: "missing" }],
    persisted_ledger_units: 0,
  }).category).toBe("verified_non_usage_claim_excludable");
  expect(evaluateContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation({
    claims: [{ ...action609, provider_usage: "unknown", ledger_linkage: "unknown" }],
    persisted_ledger_units: 0,
  }).category).toBe("missing_ledger_provider_usage_unknown");
  expect(evaluateContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation({
    claims: [{ ...action609, audit_linkage: "missing", ledger_linkage: "missing" }],
    persisted_ledger_units: 0,
  }).category).toBe("audit_ledger_disagreement");
});

test("Action 628 detects duplicate attempts and rejects malformed historical evidence", () => {
  expect(evaluateContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation({
    claims: [action609, { ...action617, attempt_identity: action609.attempt_identity }],
    persisted_ledger_units: 1,
  }).category).toBe("duplicate_attempt_detected");
  expect(evaluateContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation({
    claims: [{ ...action609, claim_id: "not a valid claim id" }],
    persisted_ledger_units: 0,
  }).category).toBe("historical_state_malformed");
});

test("Action 628 classifies the verified current 2-versus-1 production shape as a missing post-provider ledger", () => {
  const result = evaluateContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation({
    claims: [action609, action617],
    persisted_ledger_units: 1,
  });
  expect(result).toEqual({
    category: "missing_ledger_after_verified_provider_usage",
    provider_usage_units: 2,
    claim_capacity_units: 2,
    persisted_ledger_units: 1,
    unmatched_claim_ids: ["manual_claim_action_609"],
    readiness: "blocked",
  });
});

test("Action 628 keeps manual reconciliation isolated from scheduled persistence health", () => {
  const scheduled = evaluateContinuousIntelligenceShadowCanaryScheduledDurableState({
    claims: [{
      claim_id: "canary_claim_canary_execution_20260723_deadbeef",
      execution_id: "canary_execution_20260723_deadbeef",
      request_fingerprint: "AAPL|5min|2026-07-23T14:00:00.000Z|2026-07-23T14:30:00.000Z",
      status: "completed",
      source_receipt_id: "manual_receipt",
    }],
    audits: [],
    ledger: [],
    occurrence_id: null,
    request_fingerprint: null,
  });
  expect(scheduled.persistence_stop).toBe("clear");

  const accounting = buildContinuousIntelligenceShadowCanaryUsageAccounting({
    utc_day: "2026-07-23",
    ledger_rows: [{ entry_kind: "bounded_manual_proof", generated_at: "2026-07-23T14:30:00.000Z", provider_estimated_credits: 1 }],
    claim_rows: [
      { utc_day: "2026-07-23", estimated_credits: 1, status: "completed" },
      { utc_day: "2026-07-23", estimated_credits: 1, status: "completed" },
    ],
  });
  expect(accounting).toMatchObject({ bounded_manual_proof: { attempts: 1 }, scheduled_shadow_collector_canary: { attempts: 0 } });
});

test("Action 628 reconciliation remains pure and does not conceal the public fail-closed budget result", () => {
  const source = readFileSync("lib/continuous-intelligence-shadow-canary-historical-manual-usage-reconciliation.ts", "utf8");
  expect(source).not.toContain(".from(");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("@/lib/server/");
  expect(source).not.toContain("usage_disagreement");
});
