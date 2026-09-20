import { expect, test } from "@playwright/test";

import {
  buildRecommendationEvaluationCharterInput,
  type RecommendationEvaluationCharter,
} from "@/lib/recommendation-evaluation-charter";
import type { RecommendationLearningBaselineFreeze } from "@/lib/recommendation-learning-baseline-freeze-store";
import {
  evaluateRecommendationPolicyComparison,
  type RecommendationPolicyComparisonSample,
} from "@/lib/recommendation-policy-comparison";

const ownerUserId = "7d2e0f9a-43db-4f62-9a78-aec2ae34c6d0";
const segmentKey = '["selective_policy_v1","cohort_v1"]';
const baselinePolicy = {
  recommendation_publish_policy_version: "selective_policy_v1",
  canonical_evaluation_versions: {
    engine_version: "engine_v1",
    scoring_version: "score_v1",
    ranking_version: "ranking_v1",
    setup_taxonomy_version: "setup_v1",
    confidence_contract_version: "confidence_v1",
    evaluator_version: "outcome_v1",
    provider_contract_version: "provider_v1",
    git_commit: "a".repeat(40),
    build_identity: "build_v1",
  },
} as const;
const candidatePolicy = {
  ...baselinePolicy,
  recommendation_publish_policy_version: "selective_policy_v2_shadow",
} as const;

function charter(): RecommendationEvaluationCharter {
  const definition = {
    contract_version: "recommendation_evaluation_charter_v1",
    hypothesis: "The shadow policy improves calibration while preserving complete decision evidence.",
    eligible_universe: "Point-in-time US common-stock decision opportunities with one source cohort.",
    setup_slices: ["breakout", "pullback"],
    regime_slices: ["risk_on", "neutral"],
    outcome_rules: {
      primary_horizon: "60m",
      diagnostic_horizons: ["15m", "30m", "60m"],
      semantics: "One completed decision-bound canonical outcome per paired policy opportunity.",
    },
    evaluation_window: {
      minimum_complete_decisions: 4,
      held_out_decision_count: 2,
      walk_forward_decision_count: 2,
    },
    thresholds: {
      minimum_precision_at_k: 0.4,
      minimum_expectancy_r: -0.5,
      maximum_calibration_error: 0.1,
      minimum_outcome_coverage: 1,
      maximum_missingness: 0,
      maximum_provider_credits_per_decision: 0.75,
      minimum_reliability: 1,
    },
    concentration_limits: {
      maximum_single_ticker_share: 0.6,
      maximum_single_sector_share: 1,
      maximum_single_setup_share: 1,
      maximum_single_regime_share: 1,
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
  const input = buildRecommendationEvaluationCharterInput({
    ownerUserId,
    segmentKey,
    policy: baselinePolicy,
    charter: definition,
  });
  if (!input) throw new Error("fixture charter must be valid");
  return {
    charter_id: "1e98f21d-488a-467a-a1f0-dcc517499835",
    charter_fingerprint: input.charter_fingerprint,
    owner_user_id: ownerUserId,
    segment_key: segmentKey,
    policy_attribution: baselinePolicy,
    charter: definition,
    created_at: "2026-09-20T09:00:00.000Z",
  };
}

function baseline(value = charter()): RecommendationLearningBaselineFreeze {
  return {
    baseline_id: "2f47b8ce-9b99-4b11-9b60-f4ce8c3c6b72",
    baseline_fingerprint: "b".repeat(64),
    owner_user_id: ownerUserId,
    segment_key: segmentKey,
    decision_record_fingerprints: ["c".repeat(64)],
    evaluation_plan: {
      contract_version: "recommendation_learning_evaluation_plan_v1",
      segment_key: segmentKey,
      status: "ready_for_explicit_freeze",
      policy_attribution: baselinePolicy,
      decision_records: { count: 1, scan_run_fingerprints: ["c".repeat(64)] },
      outcome_population: {
        visible_primary_outcome_count: 1,
        research_primary_outcome_count: 0,
        rejected_primary_outcome_count: 0,
        explicit_no_trade_decision_count: 0,
        primary_outcome_by_horizon: { "15m": 0, "30m": 0, "60m": 1 },
      },
      metrics: {
        entry: { known_count: 1, triggered_count: 1, not_triggered_count: 0, unknown_count: 0, triggered_rate: 1 },
        terminal: { target_first_count: 1, stop_first_count: 0, neither_count: 0, unknown_count: 0 },
        horizon_r: { observed_count: 1, mean: 1, median: 1 },
        excursion: {
          contract_version: "recommendation_outcome_entry_bound_excursion_v1",
          status: "entry_bound_excursion_measured_with_explicit_missingness",
          triggered_outcome_count: 1,
          contract_missing_count: 0,
          mfe_r: { observed_count: 1, mean: 1, median: 1 },
          mae_r: { observed_count: 1, mean: 0, median: 0 },
          paired_mfe_mae_count: 1,
          mfe_missing_count: 0,
          mae_missing_count: 0,
        },
      },
      blockers: [],
      notes: [],
    },
    evaluation_charter_fingerprint: value.charter_fingerprint,
    frozen_at: "2026-09-20T09:01:00.000Z",
  };
}

function sample({
  id,
  partition,
  terminal,
  rMultiple,
  decisionAt,
}: {
  id: string;
  partition: "held_out" | "walk_forward";
  terminal: "target_first" | "stop_first";
  rMultiple: number;
  decisionAt: string;
}): RecommendationPolicyComparisonSample {
  const target = terminal === "target_first";
  return {
    opportunity_id: id,
    decision_at: decisionAt,
    outcome_at: new Date(Date.parse(decisionAt) + 60 * 60_000).toISOString(),
    partition,
    source_cohort_key: "twelve_data_regular_accepted_v1",
    ticker: id,
    sector: "Technology",
    setup: "breakout",
    regime: "risk_on",
    outcome: { complete: true, terminal, r_multiple: rMultiple },
    baseline: {
      policy_attribution: baselinePolicy,
      selected: true,
      rank: 1,
      predicted_probability: 0.5,
      provider_cost_credits: 1,
      source_reliable: true,
      feasibility: {
        spread: true,
        liquidity: true,
        volatility: true,
        halt_risk: null,
        trigger_attainment: true,
        conservative_slippage: null,
      },
    },
    candidate: {
      policy_attribution: candidatePolicy,
      selected: true,
      rank: 1,
      predicted_probability: target ? 1 : 0,
      provider_cost_credits: 0.5,
      source_reliable: true,
      feasibility: {
        spread: true,
        liquidity: true,
        volatility: true,
        halt_risk: null,
        trigger_attainment: true,
        conservative_slippage: null,
      },
    },
  };
}

function samples() {
  return [
    sample({ id: "AAA", partition: "held_out", terminal: "target_first", rMultiple: 1, decisionAt: "2026-09-01T14:30:00.000Z" }),
    sample({ id: "BBB", partition: "held_out", terminal: "stop_first", rMultiple: -1, decisionAt: "2026-09-02T14:30:00.000Z" }),
    sample({ id: "CCC", partition: "walk_forward", terminal: "target_first", rMultiple: 1, decisionAt: "2026-09-03T14:30:00.000Z" }),
    sample({ id: "DDD", partition: "walk_forward", terminal: "stop_first", rMultiple: -1, decisionAt: "2026-09-04T14:30:00.000Z" }),
  ];
}

test("supports only a charter-bound, pairwise comparable shadow candidate", () => {
  const value = charter();
  const result = evaluateRecommendationPolicyComparison({
    baseline: baseline(value),
    charter: value,
    candidatePolicy,
    samples: samples(),
  });

  expect(result).toMatchObject({
    status: "shadow_candidate_supported",
    decision: "remain_shadow",
    baseline_fingerprint: "b".repeat(64),
    candidate_policy_version: "selective_policy_v2_shadow",
    authority: {
      can_change_ranking_or_publication: false,
      can_promote_policy: false,
      can_request_provider_data: false,
      can_execute_broker_action: false,
    },
  });
  expect(result.partitions).toEqual(expect.arrayContaining([
    expect.objectContaining({
      partition: "held_out",
      candidate_thresholds: expect.objectContaining({ passed: true }),
      comparison: expect.objectContaining({ candidate_beats_baseline: true }),
    }),
    expect.objectContaining({
      partition: "walk_forward",
      candidate_thresholds: expect.objectContaining({ passed: true }),
      comparison: expect.objectContaining({ strict_quality_improvements: ["calibration_error"] }),
    }),
  ]));
});

test("withholds a shadow verdict when a partition is incomplete or crosses source cohorts", () => {
  const value = charter();
  const incomplete = samples();
  incomplete[3] = {
    ...incomplete[3]!,
    outcome: { complete: false, terminal: null, r_multiple: null },
  };
  const incompleteResult = evaluateRecommendationPolicyComparison({
    baseline: baseline(value),
    charter: value,
    candidatePolicy,
    samples: incomplete,
  });
  expect(incompleteResult.status).toBe("evidence_incomplete");
  expect(incompleteResult.blockers).toEqual(expect.arrayContaining([
    "outcome_coverage_threshold_not_met",
  ]));

  const mixedCohort = samples();
  mixedCohort[1] = { ...mixedCohort[1]!, source_cohort_key: "other_cohort" };
  const mixedResult = evaluateRecommendationPolicyComparison({
    baseline: baseline(value),
    charter: value,
    candidatePolicy,
    samples: mixedCohort,
  });
  expect(mixedResult.status).toBe("evidence_incomplete");
  expect(mixedResult.blockers).toContain("source_cohort_not_homogeneous");
});

test("fails closed for forged baseline bindings, duplicated opportunities, or a non-distinct policy", () => {
  const value = charter();
  const forgedCharter = {
    ...value,
    charter_fingerprint: "f".repeat(64),
  };
  expect(evaluateRecommendationPolicyComparison({
    baseline: baseline(value),
    charter: forgedCharter,
    candidatePolicy,
    samples: samples(),
  })).toMatchObject({ status: "invalid_input", blockers: ["baseline_charter_or_candidate_policy_invalid"] });

  const alternateDefinition = {
    ...value.charter,
    hypothesis: "The shadow policy changes calibration while preserving complete decision evidence.",
  };
  const alternateInput = buildRecommendationEvaluationCharterInput({
    ownerUserId,
    segmentKey,
    policy: baselinePolicy,
    charter: alternateDefinition,
  });
  if (!alternateInput) throw new Error("alternate fixture charter must be valid");
  expect(evaluateRecommendationPolicyComparison({
    baseline: baseline(value),
    charter: {
      ...value,
      charter_fingerprint: alternateInput.charter_fingerprint,
      charter: alternateDefinition,
    },
    candidatePolicy,
    samples: samples(),
  })).toMatchObject({ status: "invalid_input", blockers: ["baseline_and_charter_are_not_bound"] });

  const forgedCharterDefinition = {
    ...value,
    charter: {
      ...value.charter,
      thresholds: {
        ...value.charter.thresholds,
        minimum_precision_at_k: 0,
      },
    },
  };
  expect(evaluateRecommendationPolicyComparison({
    baseline: baseline(value),
    charter: forgedCharterDefinition,
    candidatePolicy,
    samples: samples(),
  })).toMatchObject({ status: "invalid_input", blockers: ["baseline_charter_or_candidate_policy_invalid"] });

  expect(evaluateRecommendationPolicyComparison({
    baseline: baseline(value),
    charter: value,
    candidatePolicy: baselinePolicy,
    samples: samples(),
  })).toMatchObject({ status: "invalid_input", blockers: ["candidate_policy_matches_frozen_baseline"] });

  const ordinalConfidence = samples();
  ordinalConfidence[0] = {
    ...ordinalConfidence[0]!,
    candidate: {
      ...ordinalConfidence[0]!.candidate,
      predicted_probability: 63,
    },
  };
  expect(evaluateRecommendationPolicyComparison({
    baseline: baseline(value),
    charter: value,
    candidatePolicy,
    samples: ordinalConfidence,
  })).toMatchObject({ status: "invalid_input", blockers: ["comparison_sample_invalid"] });

  const duplicate = samples();
  duplicate.push({ ...duplicate[0]!, partition: "walk_forward" });
  expect(evaluateRecommendationPolicyComparison({
    baseline: baseline(value),
    charter: value,
    candidatePolicy,
    samples: duplicate,
  })).toMatchObject({ status: "invalid_input", blockers: ["duplicate_opportunity_id"] });
});

test("compares policy bindings by named versions, rather than object insertion order", () => {
  const reorderedCandidatePolicy = {
    canonical_evaluation_versions: {
      build_identity: candidatePolicy.canonical_evaluation_versions.build_identity,
      git_commit: candidatePolicy.canonical_evaluation_versions.git_commit,
      provider_contract_version: candidatePolicy.canonical_evaluation_versions.provider_contract_version,
      evaluator_version: candidatePolicy.canonical_evaluation_versions.evaluator_version,
      confidence_contract_version: candidatePolicy.canonical_evaluation_versions.confidence_contract_version,
      setup_taxonomy_version: candidatePolicy.canonical_evaluation_versions.setup_taxonomy_version,
      ranking_version: candidatePolicy.canonical_evaluation_versions.ranking_version,
      scoring_version: candidatePolicy.canonical_evaluation_versions.scoring_version,
      engine_version: candidatePolicy.canonical_evaluation_versions.engine_version,
    },
    recommendation_publish_policy_version: candidatePolicy.recommendation_publish_policy_version,
  };
  const reorderedSamples = samples().map((item) => ({
    ...item,
    candidate: { ...item.candidate, policy_attribution: reorderedCandidatePolicy },
  }));
  expect(evaluateRecommendationPolicyComparison({
    baseline: baseline(),
    charter: charter(),
    candidatePolicy: reorderedCandidatePolicy,
    samples: reorderedSamples,
  })).toMatchObject({ status: "shadow_candidate_supported" });
});
