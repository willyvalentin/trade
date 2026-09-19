import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildRecommendationEvaluationCharterInput,
  parseRecommendationEvaluationCharterDefinition,
  type RecommendationEvaluationCharterInput,
} from "@/lib/recommendation-evaluation-charter";
import {
  createRecommendationEvaluationCharterStore,
  type RecommendationEvaluationCharterDatabase,
} from "@/lib/recommendation-evaluation-charter-store";

const ownerUserId = "7d2e0f9a-43db-4f62-9a78-aec2ae34c6d0";
const charterId = "1e98f21d-488a-467a-a1f0-dcc517499835";
const segmentKey = '["selective_policy_test_v1","engine_test_v1"]';
const policyAttribution = {
  recommendation_publish_policy_version: "selective_policy_test_v1",
  canonical_evaluation_versions: {
    engine_version: "ture_engine_test_v1",
    scoring_version: "score_test_v1",
    ranking_version: "ranking_test_v1",
    setup_taxonomy_version: "setup_taxonomy_test_v1",
    confidence_contract_version: "confidence_test_v1",
    evaluator_version: "evaluator_test_v1",
    provider_contract_version: "provider_test_v1",
    git_commit: "a".repeat(40),
    build_identity: "test-build-v1",
  },
} as const;
const migrationPath = "supabase/migrations/20260919165811_if4_evaluation_charter.sql";
const preflightPath = "docs/sql/if4-evaluation-charter-production-preflight.sql";

function definition() {
  return {
    contract_version: "recommendation_evaluation_charter_v1",
    hypothesis: "The declared policy improves precision without hiding no-trade decisions.",
    eligible_universe: "US common stocks captured in the point-in-time decision record.",
    setup_slices: ["breakout"],
    regime_slices: ["risk_on"],
    outcome_rules: {
      primary_horizon: "60m",
      diagnostic_horizons: ["15m", "30m", "60m"],
      semantics: "One decision-bound canonical outcome after a valid entry trigger.",
    },
    evaluation_window: {
      minimum_complete_decisions: 40,
      held_out_decision_count: 20,
      walk_forward_decision_count: 20,
    },
    thresholds: {
      minimum_precision_at_k: 0.55,
      minimum_expectancy_r: 0.2,
      maximum_calibration_error: 0.15,
      minimum_outcome_coverage: 0.9,
      maximum_missingness: 0.1,
      maximum_provider_credits_per_decision: 1,
      minimum_reliability: 0.95,
    },
    concentration_limits: {
      maximum_single_ticker_share: 0.2,
      maximum_single_sector_share: 0.35,
      maximum_single_setup_share: 0.6,
      maximum_single_regime_share: 0.7,
    },
    feasibility_inputs: {
      spread: "required",
      liquidity: "required",
      volatility: "required",
      halt_risk: "unavailable_disclosed",
      trigger_attainment: "required",
      conservative_slippage: "unavailable_disclosed",
    },
  } as const;
}

function input(
  overrides: Partial<RecommendationEvaluationCharterInput> = {},
): RecommendationEvaluationCharterInput {
  const created = buildRecommendationEvaluationCharterInput({
    ownerUserId,
    segmentKey,
    policy: policyAttribution,
    charter: definition(),
  });
  if (!created) throw new Error("valid fixture must build");
  return { ...created, ...overrides };
}

function receipt(
  overrides: Record<string, unknown> = {},
) {
  const value = input();
  return {
    charter_id: charterId,
    charter_fingerprint: value.charter_fingerprint,
    owner_user_id: ownerUserId,
    segment_key: segmentKey,
    policy_attribution: policyAttribution,
    charter_json: definition(),
    created_at: "2026-09-19T10:00:00.000Z",
    ...overrides,
  };
}

function parsedReceipt(overrides: Record<string, unknown> = {}) {
  const { charter_json, ...metadata } = receipt(overrides);
  return { ...metadata, charter: charter_json };
}

function database(
  overrides: Partial<RecommendationEvaluationCharterDatabase> = {},
): RecommendationEvaluationCharterDatabase {
  return {
    async write() {
      return {
        data: {
          write_status: "evaluation_charter_recorded",
          ...receipt(),
          idempotent: false,
          blocker: null,
        },
        error: null,
      };
    },
    async read() {
      return {
        data: [{ readback_status: "available", ...receipt(), blocker: null }],
        error: null,
      };
    },
    ...overrides,
  };
}

test("a charter requires every threshold and records only the exact durable receipt", async () => {
  expect(parseRecommendationEvaluationCharterDefinition({
    ...definition(),
    thresholds: { ...definition().thresholds, minimum_reliability: "0.95" },
  })).toBeNull();
  expect(parseRecommendationEvaluationCharterDefinition({
    ...definition(),
    setup_slices: ["same", " SAME "],
  })).toBeNull();

  let writes = 0;
  const invalid = createRecommendationEvaluationCharterStore(database({
    async write() {
      writes += 1;
      throw new Error("invalid input must not persist");
    },
  }));
  await expect(invalid.write({ ...input(), charter_fingerprint: "not-a-hash" })).resolves.toMatchObject({
    status: "unavailable",
  });
  expect(writes).toBe(0);

  const store = createRecommendationEvaluationCharterStore(database());
  await expect(store.write(input())).resolves.toMatchObject({
    status: "recorded",
    charter: parsedReceipt(),
  });
});

test("charter readback fails closed for conflicting or malformed immutable evidence", async () => {
  const store = createRecommendationEvaluationCharterStore(database({
    async read() {
      return {
        data: [{
          readback_status: "available",
          ...receipt({ charter_json: { ...definition(), hypothesis: "too short" } }),
          blocker: null,
        }],
        error: null,
      };
    },
  }));
  await expect(store.read(ownerUserId)).resolves.toMatchObject({
    status: "unavailable",
    charters: [],
  });

  const forgedFingerprint = createRecommendationEvaluationCharterStore(database({
    async read() {
      return {
        data: [{
          readback_status: "available",
          ...receipt({ charter_fingerprint: "f".repeat(64) }),
          blocker: null,
        }],
        error: null,
      };
    },
  }));
  await expect(forgedFingerprint.read(ownerUserId)).resolves.toMatchObject({
    status: "unavailable",
    charters: [],
  });

  const different = createRecommendationEvaluationCharterStore(database({
    async write() {
      return {
        data: {
          write_status: "different_evaluation_charter_already_recorded",
          ...receipt({ charter_id: null, charter_fingerprint: null }),
          idempotent: false,
          blocker: "different_evaluation_charter_already_recorded",
        },
        error: null,
      };
    },
  }));
  await expect(different.write(input())).resolves.toMatchObject({
    status: "different_charter_already_recorded",
  });
});

test("the durable route stays owner-bound, immutable, and baseline-gated", () => {
  const migration = readFileSync(resolve(process.cwd(), migrationPath), "utf8");
  const preflight = readFileSync(resolve(process.cwd(), preflightPath), "utf8");
  const route = readFileSync(resolve(
    process.cwd(),
    "app/api/app/recommendation-evaluation-charter/route.ts",
  ), "utf8");
  const baselineService = readFileSync(resolve(
    process.cwd(),
    "lib/server/recommendation-learning-baseline-freeze-service.ts",
  ), "utf8");
  const tradeApp = readFileSync(resolve(process.cwd(), "app/trade-app.tsx"), "utf8");

  expect(migration).toContain("enable row level security");
  expect(migration).toContain("revoke all on table public.recommendation_evaluation_charters");
  expect(migration).toContain("grant execute on function public.record_recommendation_evaluation_charter");
  expect(migration).toContain("baseline_freeze_evaluation_charter_missing_or_mismatched");
  expect(route).toContain("requireApplicationSession");
  expect(route).toContain("applicationMutationForbiddenResponse");
  expect(baselineService).toContain("recommendation_evaluation_charter_not_recorded_or_mismatched");
  expect(tradeApp).toContain("Evaluation Charter");
  expect(tradeApp).toContain("Record immutable charter");
  expect(tradeApp).toContain("Ture will not infer thresholds");
  expect(preflight.toLowerCase()).toContain("begin read only");
  expect(preflight.toLowerCase()).toContain("rollback");
  expect(preflight).not.toMatch(/\b(insert|update|delete|alter|create|drop|grant|revoke|truncate)\b/i);
});
