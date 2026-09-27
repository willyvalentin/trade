import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  createScannerClockPriorShadowForwardDecisionReceiptStore,
  scannerClockPriorShadowForwardDecisionResultFingerprint,
  type ScannerClockPriorShadowForwardDecisionReceiptDatabase,
} from "@/lib/scanner-clock-prior-shadow-forward-decision-store";
import {
  buildScannerClockPriorShadowForwardDecisionPlan,
  type ScannerClockPriorShadowForwardDecisionResult,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision";

const ownerUserId = "7d2e0f9a-43db-4f62-9a78-aec2ae34c6d0";
const planId = "1e98f21d-488a-467a-a1f0-dcc517499835";
const resultId = "2e98f21d-488a-467a-a1f0-dcc517499835";
const charterId = "3e98f21d-488a-467a-a1f0-dcc517499835";
const baselineId = "4e98f21d-488a-467a-a1f0-dcc517499835";
const charterFingerprint = "a".repeat(64);
const baselineFingerprint = "b".repeat(64);
const recordedAt = "2026-01-20T12:00:00.000Z";
const migrationPath =
  "supabase/migrations/20260927041020_if4_clock_prior_forward_decision_receipts.sql";
const preflightPath =
  "docs/sql/if4-clock-prior-forward-decision-receipts-production-preflight.sql";
const localDbHarnessPath =
  "scripts/if4-clock-prior-forward-decision-receipts-local-db-test.mjs";

const builtPlan = buildScannerClockPriorShadowForwardDecisionPlan({
  created_at: "2026-01-01T12:00:00.000Z",
  owner_user_id: ownerUserId,
  segment_key: "clock-prior:all-us-equities",
  hypothesis:
    "Removing named clock priors improves canonical top-one ranking precision without changing the eligible population.",
  evaluation_charter_id: charterId,
  evaluation_charter_fingerprint: charterFingerprint,
  baseline_id: baselineId,
  baseline_fingerprint: baselineFingerprint,
  baseline_ranking_version: "scanner_candidate_ranking_v1.2",
  candidate_ranking_version: "scanner_candidate_ranking_clock_neutral_v1",
  primary_k: 1,
  windows: {
    held_out: {
      start_at: "2026-01-02T14:30:00.000Z",
      end_at: "2026-01-08T21:00:00.000Z",
      minimum_opportunity_sets: 2,
      minimum_ranked_candidates: 10,
      minimum_trading_days: 3,
    },
    walk_forward: {
      start_at: "2026-01-09T14:30:00.000Z",
      end_at: "2026-01-16T21:00:00.000Z",
      minimum_opportunity_sets: 2,
      minimum_ranked_candidates: 10,
      minimum_trading_days: 3,
    },
  },
  thresholds: {
    continue_minimum_precision_delta: 0.03,
    reject_maximum_precision_delta: -0.02,
  },
});

if (!builtPlan) throw new Error("valid forward plan fixture must build");
const plan = builtPlan as NonNullable<typeof builtPlan>;

function proportion(value: number, numerator: number, denominator: number) {
  return { value, numerator, denominator, lower: value - 0.1, upper: value + 0.1 };
}

function partition(name: "held_out" | "walk_forward") {
  return {
    partition: name,
    opportunity_set_count: 4,
    no_trade_opportunity_set_count: 0,
    ranked_candidate_count: 12,
    trading_day_count: 4,
    baseline_precision: proportion(0.5, 6, 12),
    candidate_precision: proportion(2 / 3, 8, 12),
    precision_delta: {
      value: 1 / 6,
      conservative_lower: 0.05,
      conservative_upper: 0.3,
      interval_method: "seeded_trading_day_cluster_bootstrap_v1" as const,
      bootstrap_iterations: 1_000 as const,
      bootstrap_seed: `clock-prior-${name}`,
    },
    evidence_complete: true,
    reason_codes: [],
  };
}

const result: ScannerClockPriorShadowForwardDecisionResult = {
  contract_version: "scanner_clock_prior_shadow_forward_decision_v1",
  status: "decision_ready",
  decision: "continue",
  plan_fingerprint: plan.plan_fingerprint,
  evidence_binding: {
    owner_user_id: ownerUserId,
    segment_key: plan.segment_key,
    evaluation_charter_id: charterId,
    evaluation_charter_fingerprint: charterFingerprint,
    baseline_id: baselineId,
    baseline_fingerprint: baselineFingerprint,
  },
  partitions: [partition("held_out"), partition("walk_forward")],
  reason_codes: [],
  shadow_only: true,
  live_ranking_effect: false,
  publication_effect: false,
  causal_improvement_claimed: false,
  authority: {
    can_change_ranking_or_publication: false,
    can_promote_policy: false,
    can_request_provider_data: false,
    can_execute_broker_action: false,
  },
};

const resultFingerprint = scannerClockPriorShadowForwardDecisionResultFingerprint({
  owner_user_id: ownerUserId,
  plan_id: planId,
  decision_result: result,
});

if (!resultFingerprint) throw new Error("valid result fixture must fingerprint");

function database(
  overrides: Partial<ScannerClockPriorShadowForwardDecisionReceiptDatabase> = {},
): ScannerClockPriorShadowForwardDecisionReceiptDatabase {
  return {
    async recordPlan() {
      return {
        data: {
          write_status: "plan_recorded",
          plan_id: planId,
          plan_fingerprint: plan.plan_fingerprint,
          owner_user_id: ownerUserId,
          plan_json: plan,
          recorded_at: recordedAt,
          idempotent: false,
          blocker: null,
        },
        error: null,
      };
    },
    async readPlans() {
      return {
        data: [{
          readback_status: "available",
          plan_id: planId,
          plan_fingerprint: plan.plan_fingerprint,
          owner_user_id: ownerUserId,
          plan_json: plan,
          recorded_at: recordedAt,
          blocker: null,
        }],
        error: null,
      };
    },
    async recordResult(input) {
      return {
        data: {
          write_status: "result_recorded",
          result_id: resultId,
          result_fingerprint: input.result_fingerprint,
          owner_user_id: ownerUserId,
          plan_id: planId,
          plan_fingerprint: plan.plan_fingerprint,
          decision_result: result,
          recorded_at: recordedAt,
          idempotent: false,
          blocker: null,
        },
        error: null,
      };
    },
    async readResults() {
      return {
        data: [{
          readback_status: "available",
          result_id: resultId,
          result_fingerprint: resultFingerprint,
          owner_user_id: ownerUserId,
          plan_id: planId,
          plan_fingerprint: plan.plan_fingerprint,
          decision_result: result,
          recorded_at: recordedAt,
          blocker: null,
        }],
        error: null,
      };
    },
    ...overrides,
  };
}

test("records and reads only the exact immutable forward plan", async () => {
  const store = createScannerClockPriorShadowForwardDecisionReceiptStore(database());
  await expect(store.recordPlan(plan)).resolves.toMatchObject({
    status: "recorded",
    receipt: { plan_id: planId, plan_fingerprint: plan.plan_fingerprint, plan },
  });
  await expect(store.readPlans(ownerUserId)).resolves.toMatchObject({
    status: "available",
    receipts: [{ plan_id: planId, plan }],
  });

  let calls = 0;
  const forged = createScannerClockPriorShadowForwardDecisionReceiptStore(database({
    async recordPlan() {
      calls += 1;
      throw new Error("invalid plan must not persist");
    },
  }));
  await expect(forged.recordPlan({ ...plan, plan_fingerprint: "c".repeat(64) }))
    .resolves.toMatchObject({ status: "unavailable" });
  expect(calls).toBe(0);
});

test("records a terminal shadow-only decision and rejects authority or receipt drift", async () => {
  const store = createScannerClockPriorShadowForwardDecisionReceiptStore(database());
  await expect(store.recordResult({
    owner_user_id: ownerUserId,
    plan_id: planId,
    decision_result: result,
  })).resolves.toMatchObject({
    status: "recorded",
    receipt: { result_id: resultId, result_fingerprint: resultFingerprint },
  });
  await expect(store.readResults(ownerUserId)).resolves.toMatchObject({
    status: "available",
    receipts: [{ result_id: resultId, decision_result: result }],
  });

  const authorityDrift = {
    ...result,
    authority: { ...result.authority, can_promote_policy: true },
  } as unknown as ScannerClockPriorShadowForwardDecisionResult;
  await expect(store.recordResult({
    owner_user_id: ownerUserId,
    plan_id: planId,
    decision_result: authorityDrift,
  })).resolves.toMatchObject({ status: "unavailable" });

  const forgedReceipt = createScannerClockPriorShadowForwardDecisionReceiptStore(database({
    async readResults() {
      return {
        data: [{
          readback_status: "available",
          result_id: resultId,
          result_fingerprint: "d".repeat(64),
          owner_user_id: ownerUserId,
          plan_id: planId,
          plan_fingerprint: plan.plan_fingerprint,
          decision_result: result,
          recorded_at: recordedAt,
          blocker: null,
        }],
        error: null,
      };
    },
  }));
  await expect(forgedReceipt.readResults(ownerUserId)).resolves.toMatchObject({
    status: "unavailable",
    receipts: [],
  });
});

test("migration keeps plans and results owner-bound, append-only and server-only", () => {
  const migration = readFileSync(resolve(process.cwd(), migrationPath), "utf8");
  const preflight = readFileSync(resolve(process.cwd(), preflightPath), "utf8");
  const localDbHarness = readFileSync(
    resolve(process.cwd(), localDbHarnessPath),
    "utf8",
  );

  expect(migration).toContain(
    "create table public.scanner_clock_prior_shadow_forward_decision_plans",
  );
  expect(migration).toContain(
    "create table public.scanner_clock_prior_shadow_forward_decision_results",
  );
  expect(migration).toContain("enable row level security");
  expect(migration).toContain("before update or delete");
  expect(migration).toContain("set search_path = ''");
  expect(migration).toContain("from public, anon, authenticated, service_role");
  expect(migration).toContain("to service_role");
  expect(migration).toContain("clock_prior_forward_decision_result_window_not_complete");
  expect(migration).toContain("different_clock_prior_forward_decision_plan_already_recorded");
  expect(migration).toContain("different_clock_prior_forward_decision_result_already_recorded");
  expect(preflight.toLowerCase()).toContain("begin read only");
  expect(preflight.toLowerCase()).toContain("rollback");
  expect(preflight).not.toMatch(
    /\b(insert|update|delete|alter|create|drop|grant|revoke|truncate)\b/i,
  );
  expect(localDbHarness).toContain('"postgres:17-alpine"');
  expect(localDbHarness).toContain("durable forward receipt lifecycle did not match contract");
  expect(localDbHarness).toContain("immutable plan update unexpectedly succeeded");
});
