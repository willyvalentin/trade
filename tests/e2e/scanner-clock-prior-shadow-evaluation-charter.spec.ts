import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildRecommendationEvaluationCharterInput,
  parseRecommendationEvaluationCharterDefinition,
  type RecommendationEvaluationCharter,
} from "@/lib/recommendation-evaluation-charter";
import type { RecommendationLearningBaselineSegment } from "@/lib/recommendation-learning-baseline-segments";
import {
  SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
} from "@/lib/scanner-ranking-clock-prior-shadow";
import {
  createScannerClockPriorShadowEvaluationCharterService,
  type ScannerClockPriorShadowEvaluationCharterDependencies,
} from "@/lib/server/scanner-clock-prior-shadow-evaluation-charter-service";
import {
  SCANNER_CLOCK_PRIOR_SHADOW_EVALUATION_CHARTER_PROFILE_VERSION,
  scannerClockPriorShadowEvaluationCharterDefinition,
} from "@/lib/server/scanner-clock-prior-shadow-evaluation-charter";

const ownerUserId = "7d2e0f9a-43db-4f62-9a78-aec2ae34c6d0";
const charterId = "1e98f21d-488a-467a-a1f0-dcc517499835";
const segmentKey = '["clock-prior-baseline"]';
const policyAttribution = {
  recommendation_publish_policy_version: "selective_publish_v1",
  canonical_evaluation_versions: {
    engine_version: "engine_v1",
    scoring_version: "scoring_v1",
    ranking_version: SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
    setup_taxonomy_version: "setup_v1",
    confidence_contract_version: "confidence_v1",
    evaluator_version: "evaluator_v1",
    provider_contract_version: "provider_v1",
    git_commit: "a".repeat(40),
    build_identity: "build-v1",
  },
} as const;

function segment(
  rankingVersion: string = SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
): RecommendationLearningBaselineSegment {
  return {
    segment_key: segmentKey,
    policy_attribution: {
      ...policyAttribution,
      canonical_evaluation_versions: {
        ...policyAttribution.canonical_evaluation_versions,
        ranking_version: rankingVersion,
      },
    },
  } as RecommendationLearningBaselineSegment;
}

function charter(): RecommendationEvaluationCharter {
  const input = buildRecommendationEvaluationCharterInput({
    ownerUserId,
    segmentKey,
    policy: policyAttribution,
    charter: scannerClockPriorShadowEvaluationCharterDefinition,
  });
  if (!input) throw new Error("canonical charter must build");
  return {
    ...input,
    charter_id: charterId,
    created_at: "2026-09-27T08:00:00.000Z",
  };
}

function dependencies(overrides: Partial<ScannerClockPriorShadowEvaluationCharterDependencies> = {}) {
  const recorded = charter();
  let readCount = 0;
  const base: ScannerClockPriorShadowEvaluationCharterDependencies = {
    readSegments: async () => ({ status: "available", segments: [segment()] }),
    readCharters: async () => {
      readCount += 1;
      return readCount === 1
        ? {
            status: "not_found",
            charters: [],
            safe_blocker: "recommendation_evaluation_charter_not_found",
          }
        : { status: "available", charters: [recorded], safe_blocker: null };
    },
    recordCharter: async () => ({
      status: "recorded",
      charter: recorded,
      safe_blocker: null,
    }),
  };
  return { ...base, ...overrides };
}

test("freezes an ambitious server-owned clock-neutral charter profile", () => {
  expect(SCANNER_CLOCK_PRIOR_SHADOW_EVALUATION_CHARTER_PROFILE_VERSION).toBe(
    "scanner_clock_prior_shadow_evaluation_charter_profile_v1",
  );
  expect(
    parseRecommendationEvaluationCharterDefinition(
      scannerClockPriorShadowEvaluationCharterDefinition,
    ),
  ).toEqual(scannerClockPriorShadowEvaluationCharterDefinition);
  expect(
    scannerClockPriorShadowEvaluationCharterDefinition.evaluation_window,
  ).toEqual({
    minimum_complete_decisions: 60,
    held_out_decision_count: 30,
    walk_forward_decision_count: 30,
  });
  expect(scannerClockPriorShadowEvaluationCharterDefinition.thresholds).toEqual({
    minimum_precision_at_k: 0.55,
    minimum_expectancy_r: 0.2,
    maximum_calibration_error: 0.15,
    minimum_outcome_coverage: 0.9,
    maximum_missingness: 0.1,
    maximum_provider_credits_per_decision: 8,
    minimum_reliability: 0.95,
  });
  expect(
    scannerClockPriorShadowEvaluationCharterDefinition.feasibility_inputs,
  ).toMatchObject({
    spread: "unavailable_disclosed",
    liquidity: "required",
    trigger_attainment: "required",
    conservative_slippage: "unavailable_disclosed",
  });
});

test("records and re-reads the exact canonical charter", async () => {
  const service = createScannerClockPriorShadowEvaluationCharterService(
    dependencies(),
  );
  const result = await service.activate({
    ownerUserId,
    request: { segment_key: segmentKey },
  });
  expect(result.status).toBe("recorded");
  expect(result.charter?.charter_fingerprint).toBe(charter().charter_fingerprint);
  expect(result.authority).toEqual({
    can_request_provider_data: false,
    can_reserve_provider_credits: false,
    can_change_ranking_or_publication: false,
    can_promote_policy: false,
    can_publish_candidate: false,
    can_create_paper_position: false,
    can_execute_broker_action: false,
  });
});

test("returns the one exact existing charter idempotently", async () => {
  const existing = charter();
  let writes = 0;
  const service = createScannerClockPriorShadowEvaluationCharterService(
    dependencies({
      readCharters: async () => ({
        status: "available",
        charters: [existing],
        safe_blocker: null,
      }),
      recordCharter: async (input) => {
        writes += 1;
        return { status: "recorded", charter: { ...input, charter_id: charterId, created_at: existing.created_at }, safe_blocker: null };
      },
    }),
  );
  const result = await service.activate({
    ownerUserId,
    request: { segment_key: segmentKey },
  });
  expect(result.status).toBe("already_recorded");
  expect(writes).toBe(0);
});

test("rejects caller-owned charter fields and a non-baseline ranking", async () => {
  let writes = 0;
  const service = createScannerClockPriorShadowEvaluationCharterService(
    dependencies({
      recordCharter: async () => {
        writes += 1;
        return { status: "unavailable", charter: null, safe_blocker: "unexpected" };
      },
    }),
  );
  const forged = await service.activate({
    ownerUserId,
    request: {
      segment_key: segmentKey,
      charter: { thresholds: { minimum_precision_at_k: 0 } },
    },
  });
  expect(forged.status).toBe("invalid_request");

  const wrongRanking = createScannerClockPriorShadowEvaluationCharterService(
    dependencies({
      readSegments: async () => ({
        status: "available",
        segments: [segment("another_ranking_v1")],
      }),
    }),
  );
  const rejected = await wrongRanking.activate({
    ownerUserId,
    request: { segment_key: segmentKey },
  });
  expect(rejected.status).toBe("not_ready");
  expect(writes).toBe(0);
});

test("keeps the route authenticated, origin-guarded and no-store", () => {
  const route = readFileSync(
    resolve(
      process.cwd(),
      "app/api/app/scanner-clock-prior-shadow-evaluation-charter/route.ts",
    ),
    "utf8",
  );
  expect(route).toContain("requireApplicationSession");
  expect(route).toContain("applicationMutationForbiddenResponse");
  expect(route).toContain('"Cache-Control": "no-store"');
  expect(route).not.toContain("fetch(");
});
