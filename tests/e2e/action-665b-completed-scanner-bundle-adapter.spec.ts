import { expect, test } from "@playwright/test";

import {
  action665bAiNoTradeFallbackBundle,
  action665bCompleteBundle,
  action665bContradictoryNoTradeFallbackBundle,
  action665bCounterfactualReadyBundle,
  action665bDuplicateCandidateBundle,
  action665bExplicitNoTradeBundle,
  action665bFixtureCases,
  action665bFreeRejectionTextBundle,
  action665bMissingOutcomeLineageBundle,
  action665bMissingScanIdentityBundle,
  action665bMixedVersionsBundle,
  action665bProviderGapBundle,
  action665bRankGapBundle,
  action665bReorderedBundle,
  action665bStaleProviderBundle,
  action665bTieWithBreakBundle,
  action665bTieWithoutBreakBundle,
  action665bTruncatedSummaryBundle,
  action665bUnderThresholdBundle,
} from "@/lib/completed-scanner-bundle-opportunity-set-fixtures";
import {
  aggregateCompletedScannerBundleCoverage,
  projectCompletedScannerBundleToOpportunitySet,
} from "@/lib/server/completed-scanner-bundle-opportunity-set-adapter";
import fixtureCoverageReport from "@/docs/action-665b-fixture-coverage-report.json";

function project(
  input: Parameters<typeof projectCompletedScannerBundleToOpportunitySet>[0],
) {
  return projectCompletedScannerBundleToOpportunitySet(input);
}

function reasonCodes(
  result: ReturnType<typeof projectCompletedScannerBundleToOpportunitySet>,
) {
  return result.diagnostics.map((item) => item.reason_code);
}

test.describe("Action 665B completed scanner bundle adapter", () => {
  test("complete completed bundle maps every candidate into one in-memory 665A envelope", () => {
    const result = project(action665bCompleteBundle);

    expect(result.status).toBe("mapped");
    expect(result.opportunity_set_complete).toBe(true);
    expect(result.opportunity_set?.candidates).toHaveLength(4);
    expect(
      result.opportunity_set?.candidates.map(
        (candidate) => candidate.membership_status,
      ),
    ).toEqual(["selected", "rejected", "overflow", "under_threshold"]);
    expect(result.opportunity_set?.readiness.status).toBe("evaluable");
    expect(result.diagnostics).toEqual([]);
  });

  test("truncated summary and top-K evidence are never treated as a full opportunity set", () => {
    const result = project(action665bTruncatedSummaryBundle);

    expect(result.status).toBe("unmappable");
    expect(result.opportunity_set).toBeNull();
    expect(reasonCodes(result)).toContain("ranking_summary_truncated");
  });

  test("missing stable scan identity is unmappable and never synthesized", () => {
    const result = project(action665bMissingScanIdentityBundle);

    expect(result.status).toBe("unmappable");
    expect(reasonCodes(result)).toContain("stable_scan_identity_missing");
  });

  test("duplicate candidate identity is an explicit conflict", () => {
    const result = project(action665bDuplicateCandidateBundle);

    expect(result.status).toBe("conflicting");
    expect(reasonCodes(result)).toContain("candidate_identity_duplicate");
  });

  test("rank gaps conflict with complete-ranking claims", () => {
    const result = project(action665bRankGapBundle);

    expect(result.status).toBe("conflicting");
    expect(reasonCodes(result)).toContain("candidate_rank_sequence_gap");
  });

  test("rank ties require unique explicit tie-break keys", () => {
    const missing = project(action665bTieWithoutBreakBundle);
    const explicit = project(action665bTieWithBreakBundle);

    expect(missing.status).toBe("conflicting");
    expect(reasonCodes(missing)).toContain(
      "rank_tie_without_unique_tie_break",
    );
    expect(explicit.status).toBe("mapped");
    expect(
      explicit.opportunity_set?.candidates
        .filter((candidate) => candidate.original_rank === 2)
        .map((candidate) => candidate.tie_break_key),
    ).toEqual(["rank-2:a", "rank-2:b"]);
  });

  test("selected, rejected, overflow, and under-threshold membership remains exclusive", () => {
    const result = project(action665bUnderThresholdBundle);

    expect(result.status).toBe("mapped");
    expect(
      result.opportunity_set?.candidates.filter(
        (candidate) => candidate.membership_status === "under_threshold",
      ),
    ).toHaveLength(1);
    expect(
      result.opportunity_set?.candidates.find(
        (candidate) => candidate.membership_status === "overflow",
      )?.rejection_reason_codes,
    ).toEqual(["selection_capacity_exceeded"]);
  });

  test("free rejection text is not normalized into a canonical reason code", () => {
    const result = project(action665bFreeRejectionTextBundle);

    expect(result.status).toBe("unmappable");
    expect(reasonCodes(result)).toContain(
      "free_text_rejection_reason_not_canonical",
    );
  });

  test("exclusive disposition maps no-trade and fallback without conflating them", () => {
    const explicit = project(action665bExplicitNoTradeBundle);
    const fallback = project(action665bAiNoTradeFallbackBundle);
    const contradictory = project(
      action665bContradictoryNoTradeFallbackBundle,
    );

    expect(explicit.status).toBe("mapped");
    expect(explicit.no_trade_decision).toMatchObject({
      decision_kind: "no_trade",
      explicit_no_trade_decision: true,
      decision_reason_code: "no_publishable_candidate",
    });
    expect(fallback.status).toBe("mapped");
    expect(fallback.no_trade_decision).toBeNull();
    expect(contradictory.status).toBe("conflicting");
    expect(reasonCodes(contradictory)).toContain(
      "no_trade_and_fallback_are_mutually_exclusive",
    );
  });

  test("provider gaps and stale data map as explicit non-evaluable readiness, not performance", () => {
    const gap = project(action665bProviderGapBundle);
    const stale = project(action665bStaleProviderBundle);

    expect(gap.status).toBe("mapped");
    expect(stale.status).toBe("mapped");
    expect(gap.counterfactual_evaluable).toBe(false);
    expect(stale.counterfactual_evaluable).toBe(false);
    expect(gap.opportunity_set?.readiness.status).toBe("provider_gap");
    expect(stale.opportunity_set?.readiness.status).toBe("provider_gap");
  });

  test("mixed producer versions conflict", () => {
    const result = project(action665bMixedVersionsBundle);

    expect(result.status).toBe("conflicting");
    expect(reasonCodes(result)).toContain("mixed_ranking_versions");
  });

  test("requested counterfactual evaluation requires joinable outcome lineage", () => {
    const missing = project(action665bMissingOutcomeLineageBundle);
    const ready = project(action665bCounterfactualReadyBundle);

    expect(missing.status).toBe("unmappable");
    expect(reasonCodes(missing)).toContain(
      "counterfactual_outcome_lineage_missing",
    );
    expect(ready.status).toBe("mapped");
    expect(ready.counterfactual_evaluable).toBe(true);
  });

  test("input ordering does not change canonical identity or semantic digest", () => {
    const baseline = project(action665bCompleteBundle);
    const reordered = project(action665bReorderedBundle);

    expect(baseline.status).toBe("mapped");
    expect(reordered.status).toBe("mapped");
    expect(reordered.opportunity_set?.opportunity_set_identity).toBe(
      baseline.opportunity_set?.opportunity_set_identity,
    );
    expect(reordered.opportunity_set?.full_candidate_set_digest).toBe(
      baseline.opportunity_set?.full_candidate_set_digest,
    );
    expect(reordered.opportunity_set?.semantic_digest).toBe(
      baseline.opportunity_set?.semantic_digest,
    );
  });

  test("fixture coverage reports only mapping/readiness counts and source reason codes", () => {
    const results = action665bFixtureCases.map((fixture) => {
      const result = project(fixture.input);
      expect(result.status, fixture.name).toBe(fixture.expected_status);
      return result;
    });
    const coverage = aggregateCompletedScannerBundleCoverage(results);

    expect(coverage).toEqual({
      adapter_version:
        "completed_scanner_bundle_opportunity_set_adapter_v1",
      total: 18,
      mapped: 9,
      conflicting: 5,
      unmappable: 4,
      complete_opportunity_sets: 9,
      evaluable_counterfactual_sets: 7,
      reason_codes_by_source: expect.any(Array),
    });
    expect(coverage.reason_codes_by_source).toEqual(
      expect.arrayContaining([
        {
          source: "scanner_candidate_ranking",
          reason_counts: expect.objectContaining({
            candidate_rank_sequence_gap: 1,
            ranking_summary_truncated: 1,
            rank_tie_without_unique_tie_break: 2,
          }),
        },
        {
          source: "no_trade_decision",
          reason_counts: {
            no_trade_and_fallback_are_mutually_exclusive: 1,
          },
        },
        {
          source: "outcome_lineage",
          reason_counts: expect.objectContaining({
            counterfactual_outcome_lineage_missing: 1,
          }),
        },
        {
          source: "provider_context",
          reason_counts: {
            provider_candle_gap: 1,
            provider_data_stale: 1,
          },
        },
      ]),
    );
    expect({
      adapter_version: fixtureCoverageReport.adapter_version,
      total: fixtureCoverageReport.total,
      mapped: fixtureCoverageReport.mapped,
      conflicting: fixtureCoverageReport.conflicting,
      unmappable: fixtureCoverageReport.unmappable,
      complete_opportunity_sets:
        fixtureCoverageReport.complete_opportunity_sets,
      evaluable_counterfactual_sets:
        fixtureCoverageReport.evaluable_counterfactual_sets,
      reason_codes_by_source: fixtureCoverageReport.reason_codes_by_source,
    }).toEqual(coverage);
    expect(JSON.stringify(coverage)).not.toMatch(
      /win_rate|expectancy|performance_value/,
    );
  });
});
