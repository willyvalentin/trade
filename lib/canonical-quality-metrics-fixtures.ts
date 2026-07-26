import {
  computeCanonicalQualityMetrics,
  type CanonicalCounterfactualOpportunitySet,
  type CanonicalRankingOpportunitySet,
} from "@/lib/canonical-quality-metrics";
import { action664fVisibleRow } from "@/lib/canonical-evaluation-quality-read-model-fixtures";
import {
  buildCanonicalEvaluationQualityReadModel,
  type CanonicalEvaluationMetricsCandidate,
} from "@/lib/server/canonical-evaluation-quality-read-model";

export const action664gBootstrapSeed = "action-664g-golden-seed-v1";

const baseVisibleCandidate = buildCanonicalEvaluationQualityReadModel([
  action664fVisibleRow,
]).candidates[0];

function visibleCandidate(input: {
  index: number;
  terminal_outcome:
    | "target_before_stop"
    | "stop_before_target"
    | "no_entry";
  r_result: number;
  confidence: number;
  mfe_r: number;
  mae_r: number;
}): CanonicalEvaluationMetricsCandidate {
  const dayIndex = input.index % 5;
  const tickerIndex = Math.floor(input.index / 2) % 4;
  const decisionDay = `2026-07-${String(7 + dayIndex).padStart(2, "0")}`;
  return {
    ...structuredClone(baseVisibleCandidate),
    canonical_identity: `rec_decision:v1:golden_visible:quality-${String(input.index).padStart(3, "0")}:178000000000${input.index}`,
    terminal_outcome: input.terminal_outcome,
    r_result: input.r_result,
    mfe_r: input.mfe_r,
    mae_r: input.mae_r,
    max_favorable_excursion: input.mfe_r * 3,
    max_adverse_excursion: input.mae_r * 3,
    target_before_stop:
      input.terminal_outcome === "target_before_stop"
        ? "yes"
        : input.terminal_outcome === "stop_before_target"
          ? "no"
          : "not_applicable",
    numeric_confidence: input.confidence,
    confidence_probability_semantics: "probability_0_1",
    ticker: ["AAPL", "MSFT", "NVDA", "AMD"][tickerIndex],
    decision_timestamp: `${decisionDay}T14:30:00.000Z`,
    decision_day: decisionDay,
    setup: input.index % 2 === 0 ? "breakout" : "pullback",
    window:
      input.index % 3 === 0
        ? "morning"
        : input.index % 3 === 1
          ? "midday"
          : "power_hour",
    eligibility_status: "eligible",
    parity_verified: true,
    reproducible: true,
    cohort_quality_eligible: true,
    standard_visible_quality_eligible: true,
    reason_codes: [],
  };
}

export const action664gVisiblePerformanceCohort =
  Array.from({ length: 20 }, (_, index) => {
    const win = index % 2 === 0;
    return visibleCandidate({
      index,
      terminal_outcome: win
        ? "target_before_stop"
        : "stop_before_target",
      r_result: win ? 2 : -1,
      confidence: win ? 0.85 : 0.15,
      mfe_r: win ? 2.4 : 0.4,
      mae_r: win ? -0.3 : -1.2,
    });
  });

export const action664gResearchPerformanceCohort =
  action664gVisiblePerformanceCohort.map((candidate, index) => ({
    ...structuredClone(candidate),
    canonical_identity: `rec_decision:v1:golden_research:quality-${String(index).padStart(3, "0")}:179000000000${index}`,
    sample_type: "research_only" as const,
    cohort: "research_only_recommendation_quality" as const,
    standard_visible_quality_eligible: false,
  }));

export const action664gMiscalibratedVisibleCohort =
  action664gVisiblePerformanceCohort.map((candidate) => ({
    ...structuredClone(candidate),
    numeric_confidence:
      candidate.terminal_outcome === "target_before_stop" ? 0.1 : 0.9,
  }));

export const action664gMissingProbabilitySemanticsCohort =
  action664gVisiblePerformanceCohort.map((candidate) => ({
    ...structuredClone(candidate),
    confidence_probability_semantics: null,
  }));

export const action664gNoEntryCandidate = visibleCandidate({
  index: 30,
  terminal_outcome: "no_entry",
  r_result: 0,
  confidence: 0.45,
  mfe_r: 0.2,
  mae_r: -0.1,
});

export const action664gAmbiguousCandidate: CanonicalEvaluationMetricsCandidate =
  {
    ...visibleCandidate({
      index: 31,
      terminal_outcome: "target_before_stop",
      r_result: 0,
      confidence: 0.55,
      mfe_r: 1,
      mae_r: -1,
    }),
    terminal_outcome: "ambiguous_same_candle",
    r_result: null,
    target_before_stop: "ambiguous",
    eligibility_status: "ambiguous",
    cohort_quality_eligible: false,
    standard_visible_quality_eligible: false,
    reason_codes: ["target_and_stop_same_candle_ambiguous"],
  };

export const action664gIncompleteCandidate: CanonicalEvaluationMetricsCandidate =
  {
    ...structuredClone(action664gVisiblePerformanceCohort[0]),
    canonical_identity:
      "rec_decision:v1:golden_visible:incomplete:1800000000000",
    eligibility_status: "incomplete",
    cohort_quality_eligible: false,
    standard_visible_quality_eligible: false,
    r_result: null,
    reason_codes: ["no_complete_primary_horizon"],
  };

export const action664gNonReproducibleCandidate: CanonicalEvaluationMetricsCandidate =
  {
    ...structuredClone(action664gVisiblePerformanceCohort[1]),
    canonical_identity:
      "rec_decision:v1:golden_visible:non-reproducible:1800000000001",
    eligibility_status: "non_reproducible",
    cohort_quality_eligible: false,
    standard_visible_quality_eligible: false,
    reproducible: false,
    r_result: null,
    reason_codes: ["missing_mfe_r"],
  };

export const action664gCompleteRankingOpportunitySets:
  CanonicalRankingOpportunitySet[] = Array.from(
  { length: 3 },
  (_, setIndex) => ({
    opportunity_set_id: `ranking-set-${setIndex + 1}`,
    cohort: "visible_recommendation_quality",
    decision_day: `2026-07-${String(8 + setIndex).padStart(2, "0")}`,
    ranking_version: "ranking-v1",
    complete: true,
    candidates: Array.from({ length: 5 }, (__, rankIndex) => ({
      canonical_identity: `ranking:${setIndex + 1}:${rankIndex + 1}`,
      ticker: ["AAPL", "MSFT", "NVDA", "AMD", "META"][rankIndex],
      rank: rankIndex + 1,
      selection_status:
        rankIndex < 2
          ? ("selected" as const)
          : rankIndex === 2
            ? ("rejected" as const)
            : ("not_selected" as const),
      outcome_evaluable: true,
      positive_outcome:
        rankIndex === 0 || rankIndex === 2 || rankIndex === 4,
    })),
  }),
);

export const action664gIncompleteRankingOpportunitySets:
  CanonicalRankingOpportunitySet[] = [
  {
    ...structuredClone(action664gCompleteRankingOpportunitySets[0]),
    opportunity_set_id: "ranking-set-incomplete",
    complete: false,
    candidates: action664gCompleteRankingOpportunitySets[0].candidates.map(
      (candidate, index) => ({
        ...candidate,
        rank: index === 1 ? null : candidate.rank,
        outcome_evaluable: index !== 3,
        positive_outcome: index === 3 ? null : candidate.positive_outcome,
      }),
    ),
  },
];

export const action664gCompleteNoTradeOpportunitySets:
  CanonicalCounterfactualOpportunitySet[] = [
  {
    opportunity_set_id: "no-trade-set-1",
    decision_canonical_identity:
      "rec_decision:v1:golden_no_trade:decision-1:1810000000000",
    cohort: "no_trade_counterfactual",
    decision_day: "2026-07-08",
    complete: true,
    candidates: [
      {
        canonical_identity: "no-trade:1:a",
        ticker: "AAPL",
        outcome_evaluable: true,
        r_result: 1.5,
      },
      {
        canonical_identity: "no-trade:1:b",
        ticker: "MSFT",
        outcome_evaluable: true,
        r_result: -1,
      },
    ],
  },
  {
    opportunity_set_id: "no-trade-set-2",
    decision_canonical_identity:
      "rec_decision:v1:golden_no_trade:decision-2:1810000000001",
    cohort: "no_trade_counterfactual",
    decision_day: "2026-07-09",
    complete: true,
    candidates: [
      {
        canonical_identity: "no-trade:2:a",
        ticker: "NVDA",
        outcome_evaluable: true,
        r_result: 2,
      },
      {
        canonical_identity: "no-trade:2:b",
        ticker: "AMD",
        outcome_evaluable: true,
        r_result: 0.25,
      },
    ],
  },
  {
    opportunity_set_id: "no-trade-set-3",
    decision_canonical_identity:
      "rec_decision:v1:golden_no_trade:decision-3:1810000000002",
    cohort: "no_trade_counterfactual",
    decision_day: "2026-07-10",
    complete: true,
    candidates: [
      {
        canonical_identity: "no-trade:3:a",
        ticker: "META",
        outcome_evaluable: true,
        r_result: 0.5,
      },
      {
        canonical_identity: "no-trade:3:b",
        ticker: "AAPL",
        outcome_evaluable: true,
        r_result: -0.5,
      },
    ],
  },
];

export const action664gIncompleteNoTradeOpportunitySets:
  CanonicalCounterfactualOpportunitySet[] = [
  {
    opportunity_set_id: "no-trade-set-missing",
    decision_canonical_identity:
      "rec_decision:v1:golden_no_trade:missing:1810000000003",
    cohort: "no_trade_counterfactual",
    decision_day: "2026-07-11",
    complete: false,
    candidates: [],
  },
];

export const action664gNoTradeCohortCandidates:
  CanonicalEvaluationMetricsCandidate[] =
  action664gCompleteNoTradeOpportunitySets.map((set, index) => ({
    ...structuredClone(action664gVisiblePerformanceCohort[0]),
    canonical_identity: set.decision_canonical_identity,
    sample_type: "no_trade",
    cohort: "no_trade_counterfactual",
    decision_day: set.decision_day,
    decision_timestamp: `${set.decision_day}T14:30:00.000Z`,
    ticker: ["AAPL", "NVDA", "META"][index],
    terminal_outcome: "incomplete",
    r_result: null,
    target_before_stop: "not_applicable",
    standard_visible_quality_eligible: false,
    cohort_quality_eligible: false,
    eligibility_status: "counterfactual_not_evaluable",
    reason_codes: ["counterfactual_opportunity_set_not_evaluable"],
  }));

export const action664gNoTradeCohortCandidate =
  action664gNoTradeCohortCandidates[0];

export const action664gGoldenVisibleScorecard =
  computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: action664gVisiblePerformanceCohort,
    ranking_opportunity_sets: action664gCompleteRankingOpportunitySets,
    bootstrap_seed: action664gBootstrapSeed,
  });

export const action664gGoldenResearchScorecard =
  computeCanonicalQualityMetrics({
    cohort: "research_only_recommendation_quality",
    candidates: action664gResearchPerformanceCohort,
    bootstrap_seed: action664gBootstrapSeed,
  });

export const action664gGoldenNoTradeScorecard =
  computeCanonicalQualityMetrics({
    cohort: "no_trade_counterfactual",
    candidates: action664gNoTradeCohortCandidates,
    counterfactual_opportunity_sets:
      action664gCompleteNoTradeOpportunitySets,
    bootstrap_seed: action664gBootstrapSeed,
  });
