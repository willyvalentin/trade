import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import type { RecommendationLearningEvaluationPlan } from "@/lib/recommendation-learning-evaluation-plan";
import {
  createRecommendationLearningBaselineFreezeStore,
  type RecommendationLearningBaselineFreezeDatabase,
  type RecommendationLearningBaselineFreezeInput,
} from "@/lib/recommendation-learning-baseline-freeze-store";
import { parseRecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";

const ownerUserId = "7d2e0f9a-43db-4f62-9a78-aec2ae34c6d0";
const baselineId = "1e98f21d-488a-467a-a1f0-dcc517499835";
const baselineFingerprint = "a".repeat(64);
const charterFingerprint = "b".repeat(64);
const segmentKey = '["selective_policy_test_v1","engine_test_v1"]';
const decisionRecordFingerprints = ["scan-fingerprint-one", "scan-fingerprint-two"];
const frozenAt = "2026-09-19T08:00:00.000Z";
const migrationPath =
  "supabase/migrations/20260918224038_if4_durable_learning_baseline_freeze.sql";
const productionPreflightPath =
  "docs/sql/if4-durable-learning-baseline-freeze-production-preflight.sql";
const charterMigrationPath =
  "supabase/migrations/20260919165811_if4_evaluation_charter.sql";
const charterProductionPreflightPath =
  "docs/sql/if4-evaluation-charter-production-preflight.sql";

const evaluationPlan: RecommendationLearningEvaluationPlan = {
  contract_version: "recommendation_learning_evaluation_plan_v1",
  segment_key: segmentKey,
  status: "ready_for_explicit_freeze",
  decision_records: {
    count: decisionRecordFingerprints.length,
    earliest_decision_timestamp: "2026-09-17T14:30:00.000Z",
    latest_decision_timestamp: "2026-09-17T15:30:00.000Z",
    scan_run_fingerprints: decisionRecordFingerprints,
  },
  policy_attribution: {
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
  },
  outcome_population: {
    visible_primary_outcome_count: 2,
    research_primary_outcome_count: 0,
    rejected_primary_outcome_count: 0,
    explicit_no_trade_decision_count: 0,
    primary_outcome_by_horizon: { "15m": 0, "30m": 0, "60m": 2 },
  },
  metrics: {
    entry: {
      known_count: 2,
      triggered_count: 2,
      not_triggered_count: 0,
      unknown_count: 0,
      triggered_rate: 1,
    },
    terminal: {
      target_first_count: 1,
      stop_first_count: 0,
      neither_count: 1,
      unknown_count: 0,
    },
    horizon_r: { observed_count: 2, mean: 1, median: 1 },
    excursion: {
      contract_version: "recommendation_outcome_entry_bound_excursion_v1",
      status: "entry_bound_excursion_measured_with_explicit_missingness",
      triggered_outcome_count: 2,
      contract_missing_count: 0,
      mfe_r: { observed_count: 2, mean: 1, median: 1 },
      mae_r: { observed_count: 2, mean: -0.5, median: -0.5 },
      paired_mfe_mae_count: 2,
      mfe_missing_count: 0,
      mae_missing_count: 0,
    },
  },
  blockers: [],
  notes: [],
};

function input(
  overrides: Partial<RecommendationLearningBaselineFreezeInput> = {},
): RecommendationLearningBaselineFreezeInput {
  return {
    baseline_fingerprint: baselineFingerprint,
    owner_user_id: ownerUserId,
    segment_key: segmentKey,
    decision_record_fingerprints: decisionRecordFingerprints,
    evaluation_plan: evaluationPlan,
    evaluation_charter_fingerprint: charterFingerprint,
    ...overrides,
  };
}

function receipt(
  overrides: Record<string, unknown> = {},
) {
  return {
    baseline_id: baselineId,
    baseline_fingerprint: baselineFingerprint,
    owner_user_id: ownerUserId,
    segment_key: segmentKey,
    decision_record_fingerprints: decisionRecordFingerprints,
    evaluation_plan: evaluationPlan,
    evaluation_charter_fingerprint: charterFingerprint,
    frozen_at: frozenAt,
    ...overrides,
  };
}

function database(
  overrides: Partial<RecommendationLearningBaselineFreezeDatabase> = {},
): RecommendationLearningBaselineFreezeDatabase {
  return {
    async freeze() {
      return {
        data: {
          freeze_status: "baseline_frozen",
          ...receipt(),
          idempotent: false,
          blocker: null,
        },
        error: null,
      };
    },
    async read() {
      return {
        data: { readback_status: "available", ...receipt(), blocker: null },
        error: null,
      };
    },
    ...overrides,
  };
}

test("a durable baseline freeze requires an exact ready server receipt", async () => {
  const unavailable = createRecommendationLearningBaselineFreezeStore(null);
  await expect(unavailable.freeze(input())).resolves.toMatchObject({
    status: "unavailable",
    freeze: null,
  });

  let calls = 0;
  const invalidStore = createRecommendationLearningBaselineFreezeStore(database({
    async freeze() {
      calls += 1;
      throw new Error("invalid input must not persist");
    },
  }));
  await expect(invalidStore.freeze(input({
    evaluation_plan: { ...evaluationPlan, status: "not_freeze_eligible" },
  }))).resolves.toMatchObject({ status: "unavailable" });
  expect(calls).toBe(0);

  const store = createRecommendationLearningBaselineFreezeStore(database());
  await expect(store.freeze(input())).resolves.toMatchObject({
    status: "frozen",
    freeze: receipt(),
  });
});

test("idempotency accepts only the same immutable baseline and rejects changed receipts", async () => {
  const idempotent = createRecommendationLearningBaselineFreezeStore(database({
    async freeze() {
      return {
        data: {
          freeze_status: "baseline_already_frozen",
          ...receipt(),
          idempotent: true,
          blocker: null,
        },
        error: null,
      };
    },
  }));
  await expect(idempotent.freeze(input())).resolves.toMatchObject({
    status: "already_frozen",
    freeze: receipt(),
  });

  const changedReceipt = createRecommendationLearningBaselineFreezeStore(database({
    async freeze() {
      return {
        data: {
          freeze_status: "baseline_frozen",
          ...receipt({ decision_record_fingerprints: ["different-scan"] }),
          idempotent: false,
          blocker: null,
        },
        error: null,
      };
    },
  }));
  await expect(changedReceipt.freeze(input())).resolves.toMatchObject({
    status: "unavailable",
    freeze: null,
  });

  const differentBaseline = createRecommendationLearningBaselineFreezeStore(database({
    async freeze() {
      return {
        data: {
          freeze_status: "different_baseline_already_frozen",
          ...receipt({ baseline_id: null, baseline_fingerprint: null }),
          idempotent: false,
          blocker: "different_baseline_already_frozen",
        },
        error: null,
      };
    },
  }));
  await expect(differentBaseline.freeze(input())).resolves.toMatchObject({
    status: "different_baseline_already_frozen",
    freeze: null,
  });
});

test("readback is owner-bound and does not substitute an absent receipt", async () => {
  const store = createRecommendationLearningBaselineFreezeStore(database({
    async read() {
      return {
        data: {
          readback_status: "not_found",
          baseline_id: null,
          baseline_fingerprint: null,
          owner_user_id: null,
          segment_key: null,
          decision_record_fingerprints: null,
          evaluation_plan: null,
          evaluation_charter_fingerprint: null,
          frozen_at: null,
          blocker: "recommendation_learning_baseline_freeze_not_found",
        },
        error: null,
      };
    },
  }));
  await expect(store.read(ownerUserId)).resolves.toEqual({
    status: "not_found",
    freeze: null,
    safe_blocker: "recommendation_learning_baseline_freeze_not_found",
  });
  await expect(store.read("not-a-user-id")).resolves.toMatchObject({
    status: "unavailable",
    freeze: null,
  });
});

test("a durable baseline refuses malformed persisted decision evidence", () => {
  const completeEmptySource = {
    recommendation_scan_runs: [],
    recommendation_snapshots: [],
    recommendation_outcomes: [],
  };
  expect(parseRecommendationLearningBaselineSource(completeEmptySource)).toEqual({
    scanRuns: [],
    snapshots: [],
    outcomes: [],
  });

  for (const malformedRow of [null, {}]) {
    for (const collection of Object.keys(completeEmptySource)) {
      expect(parseRecommendationLearningBaselineSource({
        ...completeEmptySource,
        [collection]: [malformedRow],
      })).toBeNull();
    }
  }
});

test("migration and authenticated route keep the freeze server-only and immutable", () => {
  const migration = readFileSync(resolve(process.cwd(), migrationPath), "utf8");
  const productionPreflight = readFileSync(
    resolve(process.cwd(), productionPreflightPath),
    "utf8",
  );
  const charterMigration = readFileSync(
    resolve(process.cwd(), charterMigrationPath),
    "utf8",
  );
  const charterProductionPreflight = readFileSync(
    resolve(process.cwd(), charterProductionPreflightPath),
    "utf8",
  );
  const persistence = readFileSync(resolve(
    process.cwd(),
    "lib/server/recommendation-learning-baseline-freeze-persistence.ts",
  ), "utf8");
  const route = readFileSync(resolve(
    process.cwd(),
    "app/api/app/learning-baseline-freeze/route.ts",
  ), "utf8");
  const source = readFileSync(resolve(
    process.cwd(),
    "lib/server/application-data-access.ts",
  ), "utf8");

  expect(migration).toContain("enable row level security");
  expect(migration).toContain("revoke all on table public.recommendation_learning_baseline_freezes");
  expect(migration).toContain("decision_records_not_owned_or_missing");
  expect(migration).toContain("different_baseline_already_frozen");
  expect(charterMigration).toContain("freeze_recommendation_learning_baseline_with_charter");
  expect(charterMigration).toContain("baseline_freeze_evaluation_charter_missing_or_mismatched");
  expect(persistence).toContain('import "server-only"');
  expect(route).toContain("requireApplicationSession");
  expect(route).toContain("applicationMutationForbiddenResponse");
  expect(route).toContain("freezeCurrentRecommendationLearningBaseline");
  expect(source).toContain("count: \"exact\"");
  expect(source).toContain("LEARNING_BASELINE_FREEZE_SOURCE_MAX_ROWS");
  expect(productionPreflight.toLowerCase()).toContain("begin read only");
  expect(productionPreflight.toLowerCase()).toContain("rollback");
  expect(productionPreflight).toContain("eligible_for_exact_additive_apply");
  expect(productionPreflight).toContain("recommendation_learning_baseline_freezes");
  expect(productionPreflight).not.toMatch(
    /\b(insert|update|delete|alter|create|drop|grant|revoke|truncate)\b/i,
  );
  expect(charterProductionPreflight.toLowerCase()).toContain("begin read only");
  expect(charterProductionPreflight.toLowerCase()).toContain("rollback");
  expect(charterProductionPreflight).toContain("recommendation_evaluation_charters");
  expect(charterProductionPreflight).not.toMatch(
    /\b(insert|update|delete|alter|create|drop|grant|revoke|truncate)\b/i,
  );
});
