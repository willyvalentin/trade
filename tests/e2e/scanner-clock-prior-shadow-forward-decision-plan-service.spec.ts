import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildRecommendationEvaluationCharterInput,
  type RecommendationEvaluationCharter,
} from "@/lib/recommendation-evaluation-charter";
import type { ScannerClockPriorShadowForwardDecisionPlanReceipt } from "@/lib/scanner-clock-prior-shadow-forward-decision-store";
import { scannerClockPriorShadowForwardPlanProfile } from "@/lib/scanner-clock-prior-shadow-forward-plan-profile";
import {
  SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
  SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
} from "@/lib/scanner-ranking-clock-prior-shadow";
import {
  createScannerClockPriorShadowForwardPlanActivationService,
  scannerClockPriorShadowForwardPlanActivationAuthority,
  type ScannerClockPriorShadowForwardPlanActivationDependencies,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision-plan-service";
import type { ScannerClockPriorShadowForwardDecisionPlan } from "@/lib/server/scanner-clock-prior-shadow-forward-decision";
import { scannerClockPriorShadowEvaluationCharterDefinition } from "@/lib/server/scanner-clock-prior-shadow-evaluation-charter";

const ownerUserId = "11111111-1111-4111-8111-111111111111";
const charterId = "22222222-2222-4222-8222-222222222222";
const planId = "44444444-4444-4444-8444-444444444444";
const segmentKey = "clock-prior:all-us-equities";
const baselineRankingVersion = SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION;
const candidateRankingVersion = SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION;
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

const charterInput = buildRecommendationEvaluationCharterInput({
  ownerUserId,
  segmentKey,
  policy,
  charter: scannerClockPriorShadowEvaluationCharterDefinition,
});
if (!charterInput) throw new Error("canonical charter fixture must build");
const charterFingerprint = charterInput.charter_fingerprint;
const hypothesis = charterInput.charter.hypothesis;
const charter: RecommendationEvaluationCharter = {
  ...charterInput,
  charter_id: charterId,
  created_at: "2026-09-27T08:00:00.000Z",
};

const activationRequest = {
  segment_key: segmentKey,
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
  expect(result.receipt?.plan.candidate_ranking_version).toBe(
    candidateRankingVersion,
  );
  expect(result.receipt?.plan.primary_k).toBe(3);
  expect(result.receipt?.plan.windows).toEqual(
    scannerClockPriorShadowForwardPlanProfile.windows,
  );
  expect(result.receipt?.plan.thresholds).toEqual({
    continue_minimum_precision_delta: 0.03,
    reject_maximum_precision_delta: 0,
  });
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

test("rejects caller-owned plan fields and activation after sampling starts", async () => {
  const harness = dependencies();
  const service = createScannerClockPriorShadowForwardPlanActivationService(
    harness.implementation,
  );
  const forgedPlan = await service.activate({
    ownerUserId,
    request: {
      ...activationRequest,
      thresholds: {
        continue_minimum_precision_delta: 0,
        reject_maximum_precision_delta: -1,
      },
    },
    now: new Date("2026-09-27T08:00:00.000Z"),
  });
  const lateActivation = await service.activate({
    ownerUserId,
    request: activationRequest,
    now: new Date("2026-09-28T13:30:00.000Z"),
  });

  expect(forgedPlan.status).toBe("invalid_request");
  expect(lateActivation.status).toBe("not_ready");
  expect(lateActivation.safe_blocker).toBe(
    "clock_prior_forward_decision_plan_profile_window_already_started",
  );
  expect(harness.recordCalls).toBe(0);
});

test("rejects a baseline charter that does not match the server-owned profile", async () => {
  const differentInput = buildRecommendationEvaluationCharterInput({
    ownerUserId,
    segmentKey,
    policy,
    charter: {
      ...scannerClockPriorShadowEvaluationCharterDefinition,
      thresholds: {
        ...scannerClockPriorShadowEvaluationCharterDefinition.thresholds,
        minimum_precision_at_k: 0.5,
      },
    },
  });
  if (!differentInput) throw new Error("different charter fixture must build");
  const harness = dependencies({
    async readCharters() {
      return {
        status: "available",
        charters: [{
          ...differentInput,
          charter_id: charterId,
          created_at: charter.created_at,
        }],
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
