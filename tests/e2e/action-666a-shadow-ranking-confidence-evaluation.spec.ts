import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  evaluateCanonicalShadowRankingConfidencePair,
  type CanonicalShadowPairComparisonInput,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";
import {
  action666aCutoffDriftPair,
  action666aDuplicateRankTieBreakPair,
  action666aEvaluatorProviderDriftPair,
  action666aFixtureCases,
  action666aIncompleteNoTradePair,
  action666aMembershipDriftPair,
  action666aMissingRejectedOutcomePair,
  action666aNonReproduciblePair,
  action666aReorderedPair,
  action666aScoreAsProbabilityPair,
  action666aTamperedPair,
  action666aTruncatedBaselinePair,
  action666aValidPair,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation-fixtures";

function evaluate(input: CanonicalShadowPairComparisonInput) {
  return evaluateCanonicalShadowRankingConfidencePair(input);
}

function requireEvaluation(input = action666aValidPair) {
  const result = evaluate(input);
  expect(["evaluable", "probability_semantics_missing"]).toContain(
    result.status,
  );
  if (!result.evaluation) throw new Error(result.reason_codes.join(","));
  return result.evaluation;
}

test.describe("Action 666A paired ranking and confidence shadow evaluation", () => {
  test("golden fixture matrix is fail-closed with explicit statuses", () => {
    for (const fixture of action666aFixtureCases) {
      const result = evaluate(fixture.input);
      expect(result.status, fixture.name).toBe(
        fixture.expected_status,
      );
      expect(result).toMatchObject({
        shadow_only: true,
        live_ranking_effect: false,
        causal_improvement_claimed: false,
      });
    }
  });

  test("valid pair binds exactly one complete Action 665 opportunity set", () => {
    const result = evaluate(action666aValidPair);
    expect(result.status).toBe("evaluable");
    if (!result.evaluation) throw new Error(result.reason_codes.join(","));

    expect(result.evaluation).toMatchObject({
      shadow_only: true,
      live_ranking_effect: false,
      causal_improvement_claimed: false,
      status: "evaluable",
      pairing_evidence: {
        shared_opportunity_set_identity:
          action666aValidPair.baseline.opportunity_set
            .opportunity_set_identity,
        shared_candidate_set_digest:
          action666aValidPair.baseline.opportunity_set
            .full_candidate_set_digest,
        engine_change_intended: false,
      },
    });
    expect(
      result.evaluation.pairing_evidence.pair_semantic_digest,
    ).toMatch(/^[0-9a-f]{64}$/);
    expect(result.evaluation.semantic_digest).toMatch(/^[0-9a-f]{64}$/);
  });

  test("membership drift and truncation are not comparable", () => {
    expect(evaluate(action666aMembershipDriftPair)).toMatchObject({
      status: "not_comparable",
      evaluation: null,
      reason_codes: [
        "candidate_arm_candidate_membership_incomplete_or_drifted",
      ],
    });
    expect(evaluate(action666aTruncatedBaselinePair)).toMatchObject({
      status: "not_comparable",
      evaluation: null,
      reason_codes: [
        "baseline_arm_candidate_membership_incomplete_or_drifted",
      ],
    });
  });

  test("cutoff, evaluator and provider drift fail the pairing gate", () => {
    const cutoff = evaluate(action666aCutoffDriftPair);
    expect(cutoff.status).toBe("not_comparable");
    expect(cutoff.reason_codes).toContain(
      "pair_point_in_time_cutoff_mismatch",
    );

    const contracts = evaluate(action666aEvaluatorProviderDriftPair);
    expect(contracts.status).toBe("not_comparable");
    expect(contracts.reason_codes).toEqual(
      expect.arrayContaining([
        "pair_evaluator_contract_mismatch",
        "pair_provider_contract_mismatch",
      ]),
    );
  });

  test("duplicate rank and tie-break is an explicit conflict", () => {
    expect(evaluate(action666aDuplicateRankTieBreakPair)).toMatchObject({
      status: "conflicting",
      evaluation: null,
      reason_codes: expect.arrayContaining([
        "candidate_rank_tie_break_duplicate",
      ]),
    });
  });

  test("missing rejected outcome and incomplete no-trade stay insufficient", () => {
    const rejected = evaluate(action666aMissingRejectedOutcomePair);
    expect(rejected.status).toBe("insufficient_evidence");
    expect(rejected.reason_codes).toEqual(
      expect.arrayContaining([
        "baseline_complete_evaluable_candidate_outcomes_required",
      ]),
    );

    const noTrade = evaluate(action666aIncompleteNoTradePair);
    expect(noTrade.status).toBe("insufficient_evidence");
    expect(noTrade.evaluation).toBeNull();

    const nonReproducible = evaluate(action666aNonReproduciblePair);
    expect(nonReproducible.status).toBe("non_reproducible");
    expect(nonReproducible.evaluation).toBeNull();
  });

  test("score, tier, evidence strength and labels never become probability", () => {
    const result = evaluate(action666aScoreAsProbabilityPair);
    expect(result.status).toBe("probability_semantics_missing");
    if (!result.evaluation) throw new Error(result.reason_codes.join(","));
    expect(result.evaluation.baseline.calibration).toMatchObject({
      status: "probability_semantics_missing",
      reason_codes: [
        "explicit_calibrated_numeric_probability_required",
        "score_tier_evidence_or_label_not_probability",
      ],
    });
    expect(
      result.evaluation.baseline.calibration.metrics.brier_score.value,
    ).toBeNull();
    expect(result.evaluation.baseline.ranking.status).toBe("evaluable");
  });

  test("explicit numeric probability enables Brier and ECE through Action 664", () => {
    const evaluation = requireEvaluation();
    expect(evaluation.baseline.metrics_policy_version).toBe(
      "canonical_quality_metrics_v1",
    );
    for (const arm of [evaluation.baseline, evaluation.candidate]) {
      expect(arm.calibration.status).toBe("evaluable");
      expect(arm.calibration.metrics.brier_score.value).not.toBeNull();
      expect(
        arm.calibration.metrics.expected_calibration_error.value,
      ).not.toBeNull();
      expect(arm.calibration.metrics.buckets).toHaveLength(5);
    }
    expect(evaluation.calibration_delta.brier_score).not.toBeNull();
    expect(
      evaluation.calibration_delta.expected_calibration_error,
    ).not.toBeNull();
  });

  test("precision@1, @3 and @5 use one identity once without top-K reconstruction", () => {
    const evaluation = requireEvaluation();
    for (const k of ["1", "3", "5"]) {
      expect(
        evaluation.baseline.ranking.precision_at_k[k].value,
      ).not.toBeNull();
      expect(
        evaluation.candidate.ranking.precision_at_k[k].value,
      ).not.toBeNull();
      expect(evaluation.precision_delta_at_k[k]).not.toBeNull();
    }
    expect(evaluation.candidate_displacement).toHaveLength(10);
    expect(
      evaluation.candidate_displacement.some(
        (candidate) => candidate.rank_change !== 0,
      ),
    ).toBe(true);
    expect(evaluation.top_k_displacement.map((item) => item.k)).toEqual([
      1, 3, 5,
    ]);
  });

  test("threshold sweep remains diagnostic and computes explicit coverage", () => {
    const evaluation = requireEvaluation();
    for (const arm of [evaluation.baseline, evaluation.candidate]) {
      expect(arm.threshold_sweep).toHaveLength(3);
      for (const threshold of arm.threshold_sweep) {
        expect(threshold).toMatchObject({
          status: "evaluable",
          expected_candidate_count: 10,
          observed_metric_count: 10,
          coverage_rate: 1,
        });
        expect(threshold.publish_rate).toBeGreaterThanOrEqual(0);
        expect(threshold.publish_rate).toBeLessThanOrEqual(1);
        expect(threshold.trade_rate).toBeGreaterThanOrEqual(0);
        expect(threshold.trade_rate).toBeLessThanOrEqual(1);
      }
      const projectedNoTrade = arm.threshold_sweep.find(
        (threshold) => threshold.projected_no_trade,
      );
      expect(projectedNoTrade).toMatchObject({
        threshold: 0.9,
        no_trade_counterfactual_evaluable: true,
      });
    }
    expect(evaluation.live_ranking_effect).toBe(false);
  });

  test("undeclared version and engine changes are not comparable", () => {
    const undeclared = structuredClone(action666aValidPair);
    undeclared.candidate.versions.ranking_version =
      "ranking-shadow-undisclosed-v9";
    undeclared.declared_version_differences =
      undeclared.declared_version_differences.filter(
        (item) => item !== "ranking_version",
      );
    expect(evaluate(undeclared).reason_codes).toContain(
      "undeclared_ranking_version_difference",
    );

    const engine = structuredClone(action666aValidPair);
    engine.candidate.versions.engine_version = "engine-shadow-candidate-v2";
    engine.declared_version_differences.push("engine_version");
    expect(evaluate(engine).reason_codes).toContain(
      "engine_change_not_explicitly_intended",
    );
  });

  test("input ordering is deterministic and output is deep frozen", () => {
    const ordered = evaluate(action666aValidPair);
    const reordered = evaluate(action666aReorderedPair);
    expect(JSON.stringify(reordered)).toBe(JSON.stringify(ordered));
    if (!ordered.evaluation) throw new Error(ordered.reason_codes.join(","));
    expect(Object.isFrozen(ordered.evaluation)).toBe(true);
    expect(Object.isFrozen(ordered.evaluation.candidate.threshold_sweep)).toBe(
      true,
    );
  });

  test("tampering fails closed and evaluation never mutates input", () => {
    const before = JSON.stringify(action666aValidPair);
    const first = evaluate(action666aValidPair);
    const replay = evaluate(structuredClone(action666aValidPair));
    expect(JSON.stringify(first)).toBe(JSON.stringify(replay));
    expect(JSON.stringify(action666aValidPair)).toBe(before);
    expect(evaluate(action666aTamperedPair)).toMatchObject({
      status: "conflicting",
      evaluation: null,
      reason_codes: expect.arrayContaining([
        "candidate_authoritative_opportunity_set_invalid",
      ]),
    });
  });

  test("golden JSON report matches fixture statuses and synthetic metrics", () => {
    const report = JSON.parse(
      readFileSync(
        path.join(
          process.cwd(),
          "docs",
          "action-666a-golden-shadow-evaluation-report.json",
        ),
        "utf8",
      ),
    ) as {
      fixture_count: number;
      fixture_status_counts: Record<string, number>;
      valid_pair: Record<string, unknown>;
      synthetic_test_evidence_only: boolean;
      production_performance_claimed: boolean;
    };
    const actualCounts = Object.fromEntries(
      [
        "evaluable",
        "probability_semantics_missing",
        "insufficient_evidence",
        "not_comparable",
        "conflicting",
        "non_reproducible",
      ].map((status) => [
        status,
        action666aFixtureCases.filter(
          (fixture) => fixture.expected_status === status,
        ).length,
      ]),
    );
    const evaluation = requireEvaluation();

    expect(report.fixture_count).toBe(action666aFixtureCases.length);
    expect(report.fixture_status_counts).toEqual(actualCounts);
    expect(report.synthetic_test_evidence_only).toBe(true);
    expect(report.production_performance_claimed).toBe(false);
    expect(report.valid_pair).toMatchObject({
      candidate_count: 10,
      precision_at_1: {
        baseline:
          evaluation.baseline.ranking.precision_at_k["1"].value,
        candidate:
          evaluation.candidate.ranking.precision_at_k["1"].value,
      },
      precision_at_3: {
        baseline:
          evaluation.baseline.ranking.precision_at_k["3"].value,
        candidate:
          evaluation.candidate.ranking.precision_at_k["3"].value,
      },
      precision_at_5: {
        baseline:
          evaluation.baseline.ranking.precision_at_k["5"].value,
        candidate:
          evaluation.candidate.ranking.precision_at_k["5"].value,
      },
    });
  });
});
