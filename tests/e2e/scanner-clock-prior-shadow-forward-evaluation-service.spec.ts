import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildRecommendationEvaluationCharterInput,
  type RecommendationEvaluationCharter,
} from "@/lib/recommendation-evaluation-charter";
import type {
  ScannerClockPriorShadowForwardDecisionPlanReceipt,
  ScannerClockPriorShadowForwardDecisionResultReceipt,
} from "@/lib/scanner-clock-prior-shadow-forward-decision-store";
import { scannerClockPriorShadowForwardPlanProfile } from "@/lib/scanner-clock-prior-shadow-forward-plan-profile";
import {
  SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
  SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
} from "@/lib/scanner-ranking-clock-prior-shadow";
import {
  createScannerClockPriorShadowForwardEvaluationService,
  scannerClockPriorShadowForwardEvaluationAuthority,
  type ScannerClockPriorShadowForwardEvaluationDependencies,
} from "@/lib/server/scanner-clock-prior-shadow-forward-evaluation-service";
import {
  buildScannerClockPriorShadowForwardDecisionPlan,
  buildScannerClockPriorShadowPolicyReference,
  SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_SCORECARD_METRICS_VERSION,
  type ScannerClockPriorShadowForwardDecisionResult,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision";
import { scannerClockPriorShadowEvaluationCharterDefinition } from "@/lib/server/scanner-clock-prior-shadow-evaluation-charter";

const ownerUserId = "11111111-1111-4111-8111-111111111111";
const charterId = "22222222-2222-4222-8222-222222222222";
const planId = "33333333-3333-4333-8333-333333333333";
const resultId = "44444444-4444-4444-8444-444444444444";
const segmentKey = "clock-prior:all-us-equities";

const policy = {
  recommendation_publish_policy_version: "recommendation_publish_policy_v1",
  canonical_evaluation_versions: {
    engine_version: "engine_v1",
    scoring_version: "scoring_v1",
    ranking_version: SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
    setup_taxonomy_version: "setup_v1",
    confidence_contract_version: "confidence_v1",
    evaluator_version: "evaluator_v1",
    provider_contract_version: "provider_v1",
    git_commit: "fixture-commit",
    build_identity: "fixture-build",
  },
};

const charterInput = buildRecommendationEvaluationCharterInput({
  ownerUserId,
  segmentKey,
  policy,
  charter: scannerClockPriorShadowEvaluationCharterDefinition,
});
if (!charterInput) throw new Error("charter fixture must build");
const charter: RecommendationEvaluationCharter = {
  ...charterInput,
  charter_id: charterId,
  created_at: "2026-09-27T08:00:00.000Z",
};
const policyReference = buildScannerClockPriorShadowPolicyReference({
  charter,
  createdAt: charter.created_at,
});
if (!policyReference) throw new Error("policy reference fixture must build");
const plan = buildScannerClockPriorShadowForwardDecisionPlan({
  created_at: "2026-09-27T08:01:00.000Z",
  owner_user_id: ownerUserId,
  segment_key: segmentKey,
  hypothesis: charter.charter.hypothesis,
  evaluation_charter_id: charterId,
  evaluation_charter_fingerprint: charter.charter_fingerprint,
  policy_reference: policyReference,
  baseline_ranking_version: SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
  candidate_ranking_version: SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
  primary_k: scannerClockPriorShadowForwardPlanProfile.primary_k,
  windows: scannerClockPriorShadowForwardPlanProfile.windows,
  thresholds: scannerClockPriorShadowForwardPlanProfile.thresholds,
});
if (!plan) throw new Error("plan fixture must build");

const planReceipt: ScannerClockPriorShadowForwardDecisionPlanReceipt = {
  plan_id: planId,
  plan_fingerprint: plan.plan_fingerprint,
  owner_user_id: ownerUserId,
  plan,
  recorded_at: "2026-09-27T08:02:00.000Z",
};

function partition(name: "held_out" | "walk_forward") {
  return {
    scorecard_metrics_version:
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_SCORECARD_METRICS_VERSION,
    partition: name,
    opportunity_set_count: 30,
    no_trade_opportunity_set_count: 2,
    ranked_candidate_count: 84,
    trading_day_count: 8,
    baseline_precision: {
      value: 0.5,
      numerator: 42,
      denominator: 84,
      lower: 0.4,
      upper: 0.6,
    },
    candidate_precision: {
      value: 0.6,
      numerator: 50,
      denominator: 84,
      lower: 0.5,
      upper: 0.7,
    },
    outcome_coverage: {
      value: 1,
      numerator: 84,
      denominator: 84,
      lower: 0.95,
      upper: 1,
    },
    evidence_missingness: {
      value: 0,
      numerator: 0,
      denominator: 84,
      lower: 0,
      upper: 0.05,
    },
    concentration: {
      denominator: 84,
      maximum_single_ticker_share: {
        key: "AAA",
        value: 1 / 7,
        numerator: 12,
        denominator: 84,
      },
      maximum_single_sector_share: {
        key: "Technology",
        value: 1 / 3,
        numerator: 28,
        denominator: 84,
      },
      maximum_single_setup_share: {
        key: "VWAP_HOLD_CONTINUATION",
        value: 0.5,
        numerator: 42,
        denominator: 84,
      },
      maximum_single_regime_share: {
        key: "risk_on",
        value: 2 / 3,
        numerator: 56,
        denominator: 84,
      },
    },
    precision_delta: {
      value: 0.1,
      conservative_lower: 0.04,
      conservative_upper: 0.16,
      interval_method: "seeded_trading_day_cluster_bootstrap_v1" as const,
      bootstrap_iterations: 1_000 as const,
      bootstrap_seed: `fixture:${name}`,
    },
    evidence_complete: true,
    reason_codes: [],
  };
}

const decision: ScannerClockPriorShadowForwardDecisionResult = {
  contract_version: "scanner_clock_prior_shadow_forward_decision_v2",
  status: "decision_ready",
  decision: "continue",
  plan_fingerprint: plan.plan_fingerprint,
  evidence_binding: {
    owner_user_id: ownerUserId,
    segment_key: segmentKey,
    evaluation_charter_id: charterId,
    evaluation_charter_fingerprint: charter.charter_fingerprint,
    policy_reference_fingerprint: policyReference.reference_fingerprint,
  },
  partitions: [partition("held_out"), partition("walk_forward")],
  reason_codes: ["both_partitions_clear_continue_boundary"],
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

const resultReceipt: ScannerClockPriorShadowForwardDecisionResultReceipt = {
  result_id: resultId,
  result_fingerprint: "a".repeat(64),
  owner_user_id: ownerUserId,
  plan_id: planId,
  plan_fingerprint: plan.plan_fingerprint,
  decision_result: decision,
  recorded_at: "2026-10-24T00:01:00.000Z",
};

function harness(overrides: Partial<
  ScannerClockPriorShadowForwardEvaluationDependencies
> = {}) {
  let durableResult: ScannerClockPriorShadowForwardDecisionResultReceipt | null =
    null;
  let recordCalls = 0;
  let observedSeed: string | null = null;
  const implementation: ScannerClockPriorShadowForwardEvaluationDependencies = {
    async readCharters() {
      return { status: "available", charters: [charter], safe_blocker: null };
    },
    async readPlans() {
      return { status: "available", receipts: [planReceipt], safe_blocker: null };
    },
    async readResults() {
      return durableResult
        ? { status: "available", receipts: [durableResult], safe_blocker: null }
        : {
            status: "not_found",
            receipts: [],
            safe_blocker: "clock_prior_forward_decision_result_not_found",
          };
    },
    async readEvidence() {
      return {
        status: "available",
        evidence: {
          scanRuns: [],
          snapshots: [],
          outcomes: [],
          source_counts: {
            window_scan_rows: 30,
            clock_prior_scan_rows: 30,
            linked_snapshot_rows: 84,
            linked_outcome_rows: 252,
          },
        },
        safe_blocker: null,
      };
    },
    async recordResult() {
      recordCalls += 1;
      durableResult = resultReceipt;
      return { status: "recorded", receipt: resultReceipt, safe_blocker: null };
    },
    evaluate(input) {
      observedSeed = input.bootstrapSeed;
      return decision;
    },
    ...overrides,
  };
  return {
    implementation,
    get recordCalls() {
      return recordCalls;
    },
    get observedSeed() {
      return observedSeed;
    },
  };
}

test("reads the exact owner-bound cohort through the frozen evaluator", async () => {
  const testHarness = harness();
  const service = createScannerClockPriorShadowForwardEvaluationService(
    testHarness.implementation,
  );
  const result = await service.read(ownerUserId);

  expect(result).toMatchObject({
    status: "available",
    plan_receipt: { plan_id: planId },
    evaluation: decision,
    durable_result_receipt: null,
    evidence_counts: {
      clock_prior_scan_rows: 30,
      linked_snapshot_rows: 84,
      linked_outcome_rows: 252,
    },
    authority: scannerClockPriorShadowForwardEvaluationAuthority,
  });
  expect(testHarness.observedSeed).toBe(
    `clock-prior-forward:${plan.plan_fingerprint}`,
  );
  expect(Object.values(result.authority).every((value) => value === false)).toBe(
    true,
  );
});

test("refuses finalization before the frozen walk-forward window ends", async () => {
  const testHarness = harness();
  const service = createScannerClockPriorShadowForwardEvaluationService(
    testHarness.implementation,
  );
  const result = await service.finalize({
    ownerUserId,
    now: new Date("2026-10-23T23:59:59.000Z"),
  });

  expect(result.status).toBe("not_ready");
  expect(result.evaluation).toEqual(decision);
  expect(testHarness.recordCalls).toBe(0);
});

test("persists one terminal result only after exact post-write readback", async () => {
  const testHarness = harness();
  const service = createScannerClockPriorShadowForwardEvaluationService(
    testHarness.implementation,
  );
  const result = await service.finalize({
    ownerUserId,
    now: new Date("2026-10-24T00:00:01.000Z"),
  });

  expect(result).toMatchObject({
    status: "finalized",
    receipt: resultReceipt,
    evaluation: decision,
  });
  expect(testHarness.recordCalls).toBe(1);
});

test("fails closed when durable terminal evidence drifts from recomputation", async () => {
  const driftedReceipt = {
    ...resultReceipt,
    decision_result: { ...decision, decision: "narrow" as const },
  };
  const testHarness = harness({
    async readResults() {
      return {
        status: "available",
        receipts: [driftedReceipt],
        safe_blocker: null,
      };
    },
  });
  const service = createScannerClockPriorShadowForwardEvaluationService(
    testHarness.implementation,
  );

  await expect(service.read(ownerUserId)).resolves.toMatchObject({
    status: "conflicting",
    safe_blocker: "clock_prior_forward_evaluation_durable_result_drift",
  });
});

test("the app route is owner-bound and cannot run market or broker work", () => {
  const route = readFileSync(resolve(
    process.cwd(),
    "app/api/app/scanner-clock-prior-shadow-forward-evaluation/route.ts",
  ), "utf8");
  expect(route).toContain("requireApplicationSession");
  expect(route).toContain("applicationMutationForbiddenResponse");
  expect(route).toContain("session.owner_user_id");
  expect(route).toContain('export const dynamic = "force-dynamic"');
  expect(route).toContain('"Cache-Control": "no-store"');
  expect(route).not.toContain("runScan");
  expect(route).not.toContain("provider");
  expect(route).not.toContain("publishCandidate");
  expect(route).not.toContain("broker");
});
