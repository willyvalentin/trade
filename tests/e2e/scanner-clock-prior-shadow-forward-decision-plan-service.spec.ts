import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import type { RecommendationEvaluationCharter } from "@/lib/recommendation-evaluation-charter";
import type { ScannerClockPriorShadowForwardDecisionPlanReceipt } from "@/lib/scanner-clock-prior-shadow-forward-decision-store";
import {
  createScannerClockPriorShadowForwardPlanActivationService,
  scannerClockPriorShadowForwardPlanActivationAuthority,
  type ScannerClockPriorShadowForwardPlanActivationDependencies,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision-plan-service";
import type { ScannerClockPriorShadowForwardDecisionPlan } from "@/lib/server/scanner-clock-prior-shadow-forward-decision";

const ownerUserId = "11111111-1111-4111-8111-111111111111";
const charterId = "22222222-2222-4222-8222-222222222222";
const planId = "44444444-4444-4444-8444-444444444444";
const charterFingerprint = "a".repeat(64);
const segmentKey = "clock-prior:all-us-equities";
const baselineRankingVersion = "scanner_candidate_ranking_v1.2";
const candidateRankingVersion = "scanner_candidate_ranking_clock_neutral_v1";
const hypothesis =
  "Removing named clock priors improves canonical top-one ranking precision without changing the eligible population.";
const recordedAt = "2026-09-27T08:00:01.000Z";

const policy = {
  recommendation_publish_policy_version: "recommendation_publish_policy_v1",
  canonical_evaluation_versions: {
    engine_version: "engine_v1",
    scoring_version: "scoring_v1",
    ranking_version: baselineRankingVersion,
    setup_taxonomy_version: "setup_v1",
    confidence_contract_version: "confidence_v1",
    evaluator_version: "evaluator_v1",
    provider_contract_version: "provider_v1",
    git_commit: "fixture-commit",
    build_identity: "fixture-build",
  },
};

const charter: RecommendationEvaluationCharter = {
  charter_id: charterId,
  charter_fingerprint: charterFingerprint,
  owner_user_id: ownerUserId,
  segment_key: segmentKey,
  policy_attribution: policy,
  charter: {
    contract_version: "recommendation_evaluation_charter_v1",
    hypothesis,
    eligible_universe: "US equities admitted by the canonical discovery policy.",
    setup_slices: ["all_setups"],
    regime_slices: ["all_regimes"],
    outcome_rules: {
      primary_horizon: "60m",
      diagnostic_horizons: ["15m", "30m", "60m"],
      semantics: "Compare canonical terminal outcomes without changing live ranking.",
    },
    evaluation_window: {
      minimum_complete_decisions: 10,
      held_out_decision_count: 5,
      walk_forward_decision_count: 5,
    },
    thresholds: {
      minimum_precision_at_k: 0.5,
      minimum_expectancy_r: 0,
      maximum_calibration_error: 0.2,
      minimum_outcome_coverage: 0.9,
      maximum_missingness: 0.1,
      maximum_provider_credits_per_decision: 8,
      minimum_reliability: 0.9,
    },
    concentration_limits: {
      maximum_single_ticker_share: 0.25,
      maximum_single_sector_share: 0.5,
      maximum_single_setup_share: 1,
      maximum_single_regime_share: 1,
    },
    feasibility_inputs: {
      spread: "required",
      liquidity: "required",
      volatility: "required",
      halt_risk: "required",
      trigger_attainment: "required",
      conservative_slippage: "required",
    },
  },
  created_at: "2026-09-26T08:00:00.000Z",
};

const activationRequest = {
  segment_key: segmentKey,
  candidate_ranking_version: candidateRankingVersion,
  primary_k: 1,
  windows: {
    held_out: {
      start_at: "2026-09-28T13:30:00.000Z",
      end_at: "2026-10-05T00:00:00.000Z",
      minimum_opportunity_sets: 5,
      minimum_ranked_candidates: 10,
      minimum_trading_days: 5,
    },
    walk_forward: {
      start_at: "2026-10-05T13:30:00.000Z",
      end_at: "2026-10-12T00:00:00.000Z",
      minimum_opportunity_sets: 5,
      minimum_ranked_candidates: 10,
      minimum_trading_days: 5,
    },
  },
  thresholds: {
    continue_minimum_precision_delta: 0.01,
    reject_maximum_precision_delta: -0.01,
  },
};

function receipt(plan: ScannerClockPriorShadowForwardDecisionPlan) {
  return {
    plan_id: planId,
    plan_fingerprint: plan.plan_fingerprint,
    owner_user_id: ownerUserId,
    plan,
    recorded_at: recordedAt,
  } satisfies ScannerClockPriorShadowForwardDecisionPlanReceipt;
}

function dependencies(overrides: Partial<
  ScannerClockPriorShadowForwardPlanActivationDependencies
> = {}) {
  let stored: ScannerClockPriorShadowForwardDecisionPlanReceipt[] = [];
  let recordCalls = 0;
  const implementation: ScannerClockPriorShadowForwardPlanActivationDependencies = {
    async readCharters() {
      return { status: "available", charters: [charter], safe_blocker: null };
    },
    async readPlans() {
      return stored.length > 0
        ? { status: "available", receipts: stored, safe_blocker: null }
        : {
            status: "not_found",
            receipts: [],
            safe_blocker: "clock_prior_forward_decision_plan_not_found",
          };
    },
    async recordPlan(plan) {
      recordCalls += 1;
      const durableReceipt = receipt(plan);
      stored = [durableReceipt];
      return {
        status: "recorded",
        receipt: durableReceipt,
        safe_blocker: null,
      };
    },
    ...overrides,
  };
  return {
    implementation,
    get recordCalls() {
      return recordCalls;
    },
    get stored() {
      return stored;
    },
  };
}

test("activates one server-bound plan only after exact durable readback", async () => {
  const harness = dependencies();
  const service = createScannerClockPriorShadowForwardPlanActivationService(
    harness.implementation,
  );
  const result = await service.activate({
    ownerUserId,
    request: activationRequest,
    now: new Date("2026-09-27T08:00:00.000Z"),
  });

  expect(result.status).toBe("activated");
  expect(result.receipt?.plan.owner_user_id).toBe(ownerUserId);
  expect(result.receipt?.plan.evaluation_charter_id).toBe(charterId);
  expect(result.receipt?.plan.evaluation_charter_fingerprint).toBe(
    charterFingerprint,
  );
  expect(result.receipt?.plan.policy_reference.evidence_classification).toBe(
    "semantic_identity_not_quality_baseline",
  );
  expect(
    result.receipt?.plan.policy_reference
      .generic_learning_baseline_required_for_promotion,
  ).toBe(true);
  expect(result.receipt?.plan.policy_reference.quality_evidence_status).toBe(
    "not_evaluated",
  );
  expect(
    result.receipt?.plan.policy_reference.version_difference_set.differences,
  ).toEqual(["ranking_version"]);
  expect(result.receipt?.plan.baseline_ranking_version).toBe(
    baselineRankingVersion,
  );
  expect(result.receipt?.plan.hypothesis).toBe(hypothesis);
  expect(result.authority).toEqual(
    scannerClockPriorShadowForwardPlanActivationAuthority,
  );
  expect(Object.values(result.authority).every((value) => value === false)).toBe(
    true,
  );
  expect(harness.recordCalls).toBe(1);
});

test("replays the same activation idempotently without another write", async () => {
  const harness = dependencies();
  const service = createScannerClockPriorShadowForwardPlanActivationService(
    harness.implementation,
  );
  await service.activate({
    ownerUserId,
    request: activationRequest,
    now: new Date("2026-09-27T08:00:00.000Z"),
  });
  const replay = await service.activate({
    ownerUserId,
    request: activationRequest,
    now: new Date("2026-09-27T08:10:00.000Z"),
  });

  expect(replay.status).toBe("already_activated");
  expect(replay.receipt?.plan_fingerprint).toBe(
    harness.stored[0]?.plan_fingerprint,
  );
  expect(harness.recordCalls).toBe(1);
});

test("rejects caller-supplied ownership or durable evidence authority", async () => {
  const harness = dependencies();
  const service = createScannerClockPriorShadowForwardPlanActivationService(
    harness.implementation,
  );
  const result = await service.activate({
    ownerUserId,
    request: {
      ...activationRequest,
      owner_user_id: "99999999-9999-4999-8999-999999999999",
    },
    now: new Date("2026-09-27T08:00:00.000Z"),
  });

  expect(result.status).toBe("invalid_request");
  expect(harness.recordCalls).toBe(0);
});

test("rejects another candidate policy or a cohort weaker than the charter", async () => {
  const harness = dependencies();
  const service = createScannerClockPriorShadowForwardPlanActivationService(
    harness.implementation,
  );
  const wrongPolicy = await service.activate({
    ownerUserId,
    request: {
      ...activationRequest,
      candidate_ranking_version: "another_shadow_policy",
    },
    now: new Date("2026-09-27T08:00:00.000Z"),
  });
  const weakCohort = await service.activate({
    ownerUserId,
    request: {
      ...activationRequest,
      windows: {
        ...activationRequest.windows,
        held_out: {
          ...activationRequest.windows.held_out,
          minimum_opportunity_sets: 2,
        },
      },
    },
    now: new Date("2026-09-27T08:00:00.000Z"),
  });

  expect(wrongPolicy.status).toBe("invalid_request");
  expect(weakCohort.status).toBe("invalid_request");
  expect(weakCohort.safe_blocker).toBe(
    "clock_prior_forward_decision_plan_weakens_evaluation_charter",
  );
  expect(harness.recordCalls).toBe(0);
});

test("fails closed when the matching charter is ambiguous", async () => {
  const harness = dependencies({
    async readCharters() {
      return {
        status: "available",
        charters: [charter, { ...charter, charter_id: "33333333-3333-4333-8333-333333333333" }],
        safe_blocker: null,
      };
    },
  });
  const service = createScannerClockPriorShadowForwardPlanActivationService(
    harness.implementation,
  );
  const result = await service.activate({
    ownerUserId,
    request: activationRequest,
    now: new Date("2026-09-27T08:00:00.000Z"),
  });

  expect(result.status).toBe("not_ready");
  expect(result.safe_blocker).toBe(
    "clock_prior_forward_decision_plan_charter_binding_missing_or_ambiguous",
  );
  expect(harness.recordCalls).toBe(0);
});

test("does not claim activation when post-write readback is missing", async () => {
  let reads = 0;
  const harness = dependencies({
    async readPlans() {
      reads += 1;
      return {
        status: "not_found",
        receipts: [],
        safe_blocker: "clock_prior_forward_decision_plan_not_found",
      };
    },
  });
  const service = createScannerClockPriorShadowForwardPlanActivationService(
    harness.implementation,
  );
  const result = await service.activate({
    ownerUserId,
    request: activationRequest,
    now: new Date("2026-09-27T08:00:00.000Z"),
  });

  expect(reads).toBe(2);
  expect(result.status).toBe("unavailable");
  expect(result.safe_blocker).toBe(
    "clock_prior_forward_decision_plan_activation_readback_unavailable",
  );
});

test("the deployed route requires owner session and mutation-origin checks", () => {
  const route = readFileSync(
    resolve(
      process.cwd(),
      "app/api/app/scanner-clock-prior-shadow-forward-decision-plan/route.ts",
    ),
    "utf8",
  );
  expect(route).toContain("requireApplicationSession");
  expect(route).toContain("applicationMutationForbiddenResponse");
  expect(route).toContain("session.owner_user_id");
  expect(route).toContain('export const dynamic = "force-dynamic"');
  expect(route).toContain('"Cache-Control": "no-store"');
  expect(route).not.toContain("runScan");
  expect(route).not.toContain("publishCandidate");
  expect(route).not.toContain("broker");
});
