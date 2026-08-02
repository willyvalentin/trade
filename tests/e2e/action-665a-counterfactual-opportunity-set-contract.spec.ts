import { expect, test } from "@playwright/test";

import {
  buildCanonicalCounterfactualOpportunitySet,
  buildCanonicalNoTradeDecision,
  compareCanonicalOpportunitySetIdentityBinding,
  projectCanonicalCounterfactualOpportunitySet,
  verifyCanonicalCounterfactualOpportunitySet,
} from "@/lib/canonical-counterfactual-opportunity-set";
import {
  action665aCompleteOpportunitySet,
  action665aCompleteRankedScanInput,
  action665aDuplicateRankInput,
  action665aExplicitNoTradeDecision,
  action665aExplicitNoTradeOpportunitySet,
  action665aExplicitNoTradeOpportunitySetInput,
  action665aExplicitTieBreakInput,
  action665aFutureLeakInput,
  action665aMissingOutcomeInput,
  action665aMissingRankInput,
  action665aMixedRankingVersionInput,
  action665aProviderGapInput,
  action665aRejectedCandidateDecision,
  action665aReorderedInput,
  action665aSameIdentityDifferentSetInput,
  action665aStaleProviderInput,
} from "@/lib/canonical-counterfactual-opportunity-set-fixtures";

function requireSet(
  input: Parameters<typeof buildCanonicalCounterfactualOpportunitySet>[0],
) {
  const result = buildCanonicalCounterfactualOpportunitySet(input);
  expect(result.status).toBe("built");
  if (result.status !== "built") throw new Error(result.reason_codes.join(","));
  return result.opportunity_set;
}

test.describe("Action 665A counterfactual opportunity-set contract", () => {
  test("complete ranked scan preserves selected and rejected membership with stable identities", () => {
    const set = action665aCompleteOpportunitySet;

    expect(set.readiness).toEqual({
      status: "evaluable",
      counterfactual_evaluation_eligible: true,
      reason_codes: [],
    });
    expect(set.expected_candidate_count).toBe(4);
    expect(set.observed_candidate_count).toBe(4);
    expect(set.candidates.map((candidate) => candidate.membership_status)).toEqual([
      "selected",
      "rejected",
      "overflow",
      "under_threshold",
    ]);
    expect(set.candidates.map((candidate) => candidate.canonical_order)).toEqual([
      1, 2, 3, 4,
    ]);
    expect(set.full_candidate_set_digest).toMatch(/^[0-9a-f]{64}$/);
    expect(verifyCanonicalCounterfactualOpportunitySet(set)).toEqual({
      valid: true,
      reason_codes: [],
    });
  });

  test("explicit no-trade with a complete opportunity set maps to isolated canonical metrics contracts", () => {
    expect(action665aExplicitNoTradeDecision.decision_reason_code).toBe(
      "no_publishable_candidate",
    );
    expect(
      action665aExplicitNoTradeDecision.counterfactual_readiness
        .counterfactual_evaluation_eligible,
    ).toBe(true);

    const projection = projectCanonicalCounterfactualOpportunitySet({
      opportunity_set: action665aExplicitNoTradeOpportunitySet,
      decision: action665aExplicitNoTradeDecision,
    });
    expect(projection.status).toBe("mapped");
    if (projection.status !== "mapped") {
      throw new Error(projection.reason_codes.join(","));
    }
    expect(
      projection.projection.canonical_evaluation_decision.sample_type,
    ).toBe("no_trade");
    expect(
      projection.projection.canonical_evaluation_decision.versions,
    ).not.toHaveProperty("scanner_version");
    expect(projection.projection.ranking_opportunity_set.cohort).toBe(
      "no_trade_counterfactual",
    );
    expect(
      projection.projection.counterfactual_opportunity_set.cohort,
    ).toBe("no_trade_counterfactual");
    expect(
      projection.projection.counterfactual_opportunity_set.candidates,
    ).toHaveLength(4);
    expect(
      projection.projection.counterfactual_opportunity_set.complete,
    ).toBe(true);
  });

  test("truncated top-K membership is incomplete and cannot project measurable counterfactuals", () => {
    const truncatedNoTrade = structuredClone(
      action665aExplicitNoTradeOpportunitySetInput,
    );
    truncatedNoTrade.expected_candidate_count = 6;
    const set = requireSet(truncatedNoTrade);
    expect(set.readiness.status).toBe("incomplete_opportunity_set");
    expect(set.readiness.counterfactual_evaluation_eligible).toBe(false);

    const boundNoTrade =
      set.decision_semantic_binding.no_trade_semantics;
    if (!boundNoTrade) {
      throw new Error("Explicit no-trade semantics must be bound.");
    }
    const decision = buildCanonicalNoTradeDecision({
      explicit_no_trade_decision: true,
      source_namespace: set.source_namespace,
      producer_decision_id: set.decision_identity,
      decision_timestamp: set.decision_timestamp,
      opportunity_set: set,
      decision_reason_code: boundNoTrade.decision_reason_code,
      decision_reason_detail: boundNoTrade.decision_reason_detail,
      decision_source: boundNoTrade.decision_source,
    });
    expect(decision.status).toBe("built");
    if (decision.status !== "built") {
      throw new Error(decision.reason_codes.join(","));
    }
    expect(
      projectCanonicalCounterfactualOpportunitySet({
        opportunity_set: set,
        decision: decision.decision,
      }),
    ).toMatchObject({
      status: "not_evaluable",
      projection: null,
    });
  });

  test("missing and duplicate ranks fail closed as rank gaps", () => {
    const missing = requireSet(action665aMissingRankInput);
    const duplicate = requireSet(action665aDuplicateRankInput);

    expect(missing.readiness.status).toBe("rank_gap");
    expect(missing.readiness.reason_codes).toContain("candidate_rank_missing");
    expect(duplicate.readiness.status).toBe("rank_gap");
    expect(duplicate.readiness.reason_codes).toContain(
      "duplicate_rank_without_explicit_tie_break",
    );
  });

  test("rank ties are evaluable only with explicit deterministic tie-break keys", () => {
    const set = requireSet(action665aExplicitTieBreakInput);

    expect(set.readiness.status).toBe("evaluable");
    expect(
      set.candidates
        .filter((candidate) => candidate.original_rank === 2)
        .map((candidate) => candidate.tie_break_key),
    ).toEqual(["rank-2:a", "rank-2:b"]);
    expect(set.candidates.map((candidate) => candidate.canonical_order)).toEqual([
      1, 2, 3, 4,
    ]);
  });

  test("overflow and under-threshold candidates retain status, reasons, and lineage", () => {
    const overflow = action665aCompleteOpportunitySet.candidates.find(
      (candidate) => candidate.membership_status === "overflow",
    );
    const underThreshold = action665aCompleteOpportunitySet.candidates.find(
      (candidate) => candidate.membership_status === "under_threshold",
    );

    expect(overflow).toMatchObject({
      ticker: "NVDA",
      rejection_reason_codes: ["selection_capacity_exceeded"],
      threshold_version: "recommendation-publish-policy-v1",
    });
    expect(underThreshold).toMatchObject({
      ticker: "AMD",
      rejection_reason_codes: ["below_publish_threshold"],
      threshold_version: "recommendation-publish-policy-v1",
    });
    expect(overflow?.lineage.scan_identity).toBe(
      action665aCompleteOpportunitySet.scan_identity,
    );
  });

  test("missing candidate outcomes make opportunity cost non-measurable", () => {
    const set = requireSet(action665aMissingOutcomeInput);
    expect(set.readiness).toMatchObject({
      status: "candidate_outcome_missing",
      counterfactual_evaluation_eligible: false,
    });
    expect(set.readiness.reason_codes).toContain(
      "complete_candidate_outcomes_missing",
    );
  });

  test("provider gaps and stale market data remain explicit readiness failures", () => {
    const providerGap = requireSet(action665aProviderGapInput);
    const stale = requireSet(action665aStaleProviderInput);

    expect(providerGap.readiness.status).toBe("provider_gap");
    expect(stale.readiness.status).toBe("provider_gap");
    expect(providerGap.provider_context.coverage_reason_codes).toEqual([
      "provider_candle_gap",
    ]);
    expect(stale.provider_context.coverage_reason_codes).toEqual([
      "provider_data_stale",
    ]);
  });

  test("future decision evidence is rejected as not point-in-time safe", () => {
    const set = requireSet(action665aFutureLeakInput);
    expect(set.readiness.status).toBe("not_point_in_time_safe");
    expect(set.readiness.reason_codes).toContain(
      "candidate_source_after_cutoff",
    );
  });

  test("mixed ranking versions are conflicting and never projected", () => {
    const set = requireSet(action665aMixedRankingVersionInput);
    expect(set.readiness.status).toBe("conflicting");
    expect(set.readiness.reason_codes).toContain("mixed_ranking_versions");
    expect(set.readiness.counterfactual_evaluation_eligible).toBe(false);
  });

  test("input order does not change identity, membership digest, or replay digest", () => {
    const reordered = requireSet(action665aReorderedInput);

    expect(reordered.opportunity_set_identity).toBe(
      action665aCompleteOpportunitySet.opportunity_set_identity,
    );
    expect(reordered.full_candidate_set_digest).toBe(
      action665aCompleteOpportunitySet.full_candidate_set_digest,
    );
    expect(reordered.semantic_digest).toBe(
      action665aCompleteOpportunitySet.semantic_digest,
    );
    expect(reordered.candidates.map((candidate) => candidate.ticker)).toEqual(
      action665aCompleteOpportunitySet.candidates.map(
        (candidate) => candidate.ticker,
      ),
    );
  });

  test("one identity with another full candidate-set digest is an explicit conflict", () => {
    const changed = requireSet(action665aSameIdentityDifferentSetInput);
    expect(changed.opportunity_set_identity).toBe(
      action665aCompleteOpportunitySet.opportunity_set_identity,
    );
    expect(changed.full_candidate_set_digest).not.toBe(
      action665aCompleteOpportunitySet.full_candidate_set_digest,
    );
    expect(
      compareCanonicalOpportunitySetIdentityBinding(
        action665aCompleteOpportunitySet,
        changed,
      ),
    ).toEqual({
      status: "conflicting",
      reason_codes: ["same_opportunity_set_identity_different_semantics"],
    });
  });

  test("absence of an explicit no-trade decision is never inferred from zero publication", () => {
    const result = buildCanonicalNoTradeDecision({
      explicit_no_trade_decision: false,
      source_namespace: action665aCompleteOpportunitySet.source_namespace,
      producer_decision_id: action665aCompleteOpportunitySet.decision_identity,
      decision_timestamp: action665aCompleteOpportunitySet.decision_timestamp,
      opportunity_set: action665aCompleteOpportunitySet,
      decision_reason_code: "no_publishable_candidate",
      decision_reason_detail: null,
      decision_source: "scanner_policy_v1",
    });

    expect(result).toEqual({
      status: "unmappable",
      decision: null,
      reason_codes: ["explicit_no_trade_decision_missing"],
    });
  });

  test("rejected candidate projection stays in its own canonical cohort", () => {
    const projection = projectCanonicalCounterfactualOpportunitySet({
      opportunity_set: action665aCompleteOpportunitySet,
      decision: action665aRejectedCandidateDecision,
    });
    expect(projection.status).toBe("mapped");
    if (projection.status !== "mapped") {
      throw new Error(projection.reason_codes.join(","));
    }
    expect(
      projection.projection.canonical_evaluation_decision.sample_type,
    ).toBe("rejected_candidate");
    expect(
      projection.projection.counterfactual_opportunity_set.cohort,
    ).toBe("rejected_candidate_counterfactual");
    expect(
      projection.projection.counterfactual_opportunity_set
        .decision_canonical_identity,
    ).toBe(
      projection.projection.canonical_evaluation_decision.identity.value,
    );
  });

  test("tampering and non-reproducible outcomes fail closed", () => {
    const tampered = structuredClone(action665aCompleteOpportunitySet);
    tampered.candidates[0].original_score = 999;
    const tamperedProjection = projectCanonicalCounterfactualOpportunitySet({
      opportunity_set: tampered,
      decision: action665aExplicitNoTradeDecision,
    });
    expect(tamperedProjection.status).toBe("conflicting");

    const nonReproducibleInput = structuredClone(
      action665aCompleteRankedScanInput,
    );
    if (!nonReproducibleInput.candidates[0].outcome) {
      throw new Error("Fixture outcome is required.");
    }
    nonReproducibleInput.candidates[0].outcome.reproducible = false;
    const nonReproducible = requireSet(nonReproducibleInput);
    expect(nonReproducible.readiness.status).toBe("non_reproducible");
  });

  test("builders are deterministic and do not mutate fixture inputs", () => {
    const input = structuredClone(action665aCompleteRankedScanInput);
    const before = structuredClone(input);
    const first = requireSet(input);
    const second = requireSet(input);

    expect(input).toEqual(before);
    expect(first).toEqual(second);
  });
});
