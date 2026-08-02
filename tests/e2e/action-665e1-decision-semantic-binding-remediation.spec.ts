import { expect, test } from "@playwright/test";

import { buildCanonicalRejectedCandidateDecision } from "@/lib/canonical-counterfactual-opportunity-set";
import { action665aExplicitNoTradeOpportunitySet } from "@/lib/canonical-counterfactual-opportunity-set-fixtures";
import {
  action665cCompleteRecommendationInput,
  action665cExplicitNoTradeInput,
  action665cSameDecisionDifferentDigestInput,
} from "@/lib/server/complete-opportunity-set-evidence-builder-fixtures";
import {
  createCompleteOpportunitySetEvidenceBuilder,
  type CompleteOpportunitySetEvidenceBuilderInput,
  type CompleteOpportunitySetEvidenceBuilderResult,
  type CompleteOpportunitySetPriorBinding,
} from "@/lib/server/complete-opportunity-set-evidence-builder";
import {
  completedScannerOutcomeEvaluationDigest,
  projectCompletedScannerBundleToOpportunitySet,
} from "@/lib/server/completed-scanner-bundle-opportunity-set-adapter";

type ReadyResult = CompleteOpportunitySetEvidenceBuilderResult & {
  status: "ready";
  decision_binding: CompleteOpportunitySetPriorBinding;
  completed_bundle: NonNullable<
    CompleteOpportunitySetEvidenceBuilderResult["completed_bundle"]
  >;
};

function build(
  input: CompleteOpportunitySetEvidenceBuilderInput,
  previous: CompleteOpportunitySetPriorBinding | null = null,
) {
  const handle = createCompleteOpportunitySetEvidenceBuilder({
    enabled: true,
    previous_binding_lookup: { lookup: () => previous },
  });
  if (!handle.enabled) throw new Error("Fixture builder must be enabled.");
  return handle.build(input);
}

function requireReady(
  result: CompleteOpportunitySetEvidenceBuilderResult,
): ReadyResult {
  expect(result.status).toBe("ready");
  if (result.status !== "ready" || !result.decision_binding) {
    throw new Error(result.reason_codes.join(","));
  }
  return result as ReadyResult;
}

function expectSemanticConflict(
  result: CompleteOpportunitySetEvidenceBuilderResult,
) {
  expect(result).toMatchObject({
    status: "identity_conflict",
    reason_codes: ["same_decision_identity_different_evidence"],
  });
}

function recomputeOutcomeEvaluationDigest(
  input: CompleteOpportunitySetEvidenceBuilderInput,
  candidateIndex: number,
) {
  const candidate = input.candidates[candidateIndex];
  if (!candidate.outcome || !candidate.outcome_lineage) {
    throw new Error("Completed outcome lineage fixture required.");
  }
  const {
    evaluation_digest: _evaluationDigest,
    evaluation_digest_algorithm: _evaluationDigestAlgorithm,
    ...outcomeLineage
  } = candidate.outcome_lineage;
  void _evaluationDigest;
  void _evaluationDigestAlgorithm;
  candidate.outcome_lineage.evaluation_digest =
    completedScannerOutcomeEvaluationDigest({
      expected_outcome_lineage: candidate.expected_outcome_lineage,
      outcome: candidate.outcome,
      outcome_lineage: outcomeLineage,
    });
}

test.describe("Action 665E.1 decision semantic binding remediation", () => {
  test("identical retry is byte-identical and remains an idempotent no-effect", () => {
    const first = requireReady(
      build(action665cCompleteRecommendationInput),
    );
    const retry = requireReady(
      build(
        structuredClone(action665cCompleteRecommendationInput),
        first.decision_binding,
      ),
    );

    expect(retry.decision_binding).toEqual(first.decision_binding);
    expect(retry.decision_evidence_digest).toBe(
      first.decision_evidence_digest,
    );
    expect(retry.decision_semantic_binding_digest).toBe(
      first.decision_semantic_binding_digest,
    );
    expect(JSON.stringify(retry)).toBe(JSON.stringify(first));
  });

  test("publish, fallback, no-trade, rejection and membership terminals are cryptographically distinct", () => {
    const published = requireReady(
      build(action665cCompleteRecommendationInput),
    );
    const fallbackInput = structuredClone(
      action665cCompleteRecommendationInput,
    );
    fallbackInput.decision_disposition = "deterministic_fallback";
    const fallback = requireReady(build(fallbackInput));
    const noTrade = requireReady(build(action665cExplicitNoTradeInput));
    const publishedProjection =
      projectCompletedScannerBundleToOpportunitySet(
        published.completed_bundle,
      );
    const fallbackProjection =
      projectCompletedScannerBundleToOpportunitySet(
        fallback.completed_bundle,
      );
    const noTradeProjection =
      projectCompletedScannerBundleToOpportunitySet(
        noTrade.completed_bundle,
      );

    expect(published.full_candidate_set_digest).toBe(
      fallback.full_candidate_set_digest,
    );
    expect(
      new Set([
        published.decision_evidence_digest,
        fallback.decision_evidence_digest,
        noTrade.decision_evidence_digest,
      ]).size,
    ).toBe(3);
    expect(
      published.completed_bundle &&
        published.decision_binding &&
        published.completed_bundle.decision_disposition,
    ).toBe("publish_recommendations");
    const publishProjectionBinding = published.decision_binding;
    expect(publishProjectionBinding.decision_disposition).toBe(
      "publish_recommendations",
    );
    expect(
      publishedProjection.opportunity_set?.decision_semantic_binding
        .terminal_dispositions.map((item) => item.terminal_disposition),
    ).toEqual([
      "published_recommendation",
      "under_threshold_candidate",
      "rejected_candidate",
      "overflow_candidate",
    ]);
    expect(
      fallbackProjection.opportunity_set?.decision_semantic_binding
        .terminal_dispositions.find(
          (item) => item.candidate_identity === "candidate-aapl",
        )?.terminal_disposition,
    ).toBe("deterministic_fallback_recommendation");
    expect(
      noTradeProjection.opportunity_set?.decision_semantic_binding
        .terminal_dispositions.every(
          (item) =>
            item.terminal_disposition === "explicit_no_trade_candidate",
        ),
    ).toBe(true);
    const replayHandle = createCompleteOpportunitySetEvidenceBuilder({
      enabled: true,
      previous_binding_lookup: { lookup: () => null },
    });
    if (!replayHandle.enabled) throw new Error("Builder required.");
    const replay = requireReady(
      replayHandle.build(action665cCompleteRecommendationInput),
    );
    expect(replay.decision_binding).toEqual(published.decision_binding);

    const rejectedCandidate =
      action665aExplicitNoTradeOpportunitySet.candidates.find(
        (candidate) => candidate.membership_status === "rejected",
      );
    if (!rejectedCandidate) {
      throw new Error("Rejected candidate fixture required.");
    }
    expect(
      buildCanonicalRejectedCandidateDecision({
        source_namespace:
          action665aExplicitNoTradeOpportunitySet.source_namespace,
        producer_decision_id:
          action665aExplicitNoTradeOpportunitySet.decision_identity,
        decision_timestamp:
          action665aExplicitNoTradeOpportunitySet.decision_timestamp,
        opportunity_set: action665aExplicitNoTradeOpportunitySet,
        rejected_candidate_identity:
          rejectedCandidate.canonical_candidate_identity,
        decision_reason_code: "cooldown_active_position",
        decision_reason_detail: null,
        decision_source: "scanner_policy_v1",
      }),
    ).toMatchObject({
      status: "conflicting",
      reason_codes: expect.arrayContaining([
        "rejected_candidate_terminal_disposition_mismatch",
      ]),
    });
  });

  test("same identity cannot transition publish to fallback or no-trade", () => {
    const published = requireReady(
      build(action665cCompleteRecommendationInput),
    );
    const fallbackInput = structuredClone(
      action665cCompleteRecommendationInput,
    );
    fallbackInput.decision_disposition = "deterministic_fallback";

    expectSemanticConflict(
      build(fallbackInput, published.decision_binding),
    );
    expectSemanticConflict(
      build(action665cExplicitNoTradeInput, published.decision_binding),
    );
  });

  test("same identity cannot transition no-trade to publish or fallback to no-trade", () => {
    const noTrade = requireReady(build(action665cExplicitNoTradeInput));
    expectSemanticConflict(
      build(
        action665cCompleteRecommendationInput,
        noTrade.decision_binding,
      ),
    );

    const fallbackInput = structuredClone(
      action665cCompleteRecommendationInput,
    );
    fallbackInput.decision_disposition = "deterministic_fallback";
    const fallback = requireReady(build(fallbackInput));
    expectSemanticConflict(
      build(action665cExplicitNoTradeInput, fallback.decision_binding),
    );
  });

  test("changed explicit no-trade producer identity fails closed", () => {
    const changed = structuredClone(action665cExplicitNoTradeInput);
    changed.no_trade_evidence!.producer_decision_id =
      "different-no-trade-producer";

    expect(build(changed)).toMatchObject({
      status: "no_trade_evidence_missing",
      reason_codes: ["explicit_no_trade_decision_evidence_missing"],
    });

    const baseline = requireReady(build(action665cExplicitNoTradeInput));
    const changedSemantics = structuredClone(
      action665cExplicitNoTradeInput,
    );
    changedSemantics.no_trade_evidence!.decision_reason_code =
      "cooldown_active_position";
    const unbound = requireReady(build(changedSemantics));
    expect(unbound.decision_evidence_digest).not.toBe(
      baseline.decision_evidence_digest,
    );
    expectSemanticConflict(
      build(changedSemantics, baseline.decision_binding),
    );
  });

  test("coordinated no-trade lineage renaming cannot detach the producer decision", () => {
    const renamed = structuredClone(action665cExplicitNoTradeInput);
    const detachedIdentity = "detached-no-trade-lineage";
    renamed.decision_lineage_nodes[0].decision_identity = detachedIdentity;
    for (let index = 0; index < renamed.candidates.length; index += 1) {
      const candidate = renamed.candidates[index];
      candidate.recommendation_decision_identity = detachedIdentity;
      candidate.expected_outcome_lineage.recommendation_decision_identity =
        detachedIdentity;
      if (candidate.outcome_lineage) {
        candidate.outcome_lineage.recommendation_decision_identity =
          detachedIdentity;
        recomputeOutcomeEvaluationDigest(renamed, index);
      }
    }

    const result = build(renamed);
    expect(result.status).toBe("identity_conflict");
    expect(result.reason_codes).toContain(
      "explicit_no_trade_lineage_identity_conflict",
    );
  });

  test("changed evaluator lineage is decision-bound and conflicts with its prior tuple", () => {
    const baseline = requireReady(
      build(action665cCompleteRecommendationInput),
    );
    const changed = structuredClone(action665cCompleteRecommendationInput);
    changed.candidates[0].expected_outcome_lineage.evaluator_contract_version =
      "canonical-outcome-evaluator-contract-v2";
    recomputeOutcomeEvaluationDigest(changed, 0);

    const changedUnbound = requireReady(build(changed));
    expect(changedUnbound.full_candidate_set_digest).not.toBe(
      baseline.full_candidate_set_digest,
    );
    expect(changedUnbound.decision_binding?.lineage_graph_digest).not.toBe(
      baseline.decision_binding.lineage_graph_digest,
    );
    expectSemanticConflict(build(changed, baseline.decision_binding));
  });

  test("unchanged disposition rejects changed candidate membership and version bundle", () => {
    const baseline = requireReady(
      build(action665cCompleteRecommendationInput),
    );
    expectSemanticConflict(
      build(
        action665cSameDecisionDifferentDigestInput,
        baseline.decision_binding,
      ),
    );

    const changedVersion = structuredClone(
      action665cCompleteRecommendationInput,
    );
    changedVersion.versions.engine_version = "engine-shadow-a-v2";
    for (const candidate of changedVersion.candidates) {
      candidate.producer_versions.engine_version = "engine-shadow-a-v2";
    }
    const versionResult = requireReady(build(changedVersion));
    expect(versionResult.decision_binding?.version_bundle_digest).not.toBe(
      baseline.decision_binding.version_bundle_digest,
    );
    expectSemanticConflict(
      build(changedVersion, baseline.decision_binding),
    );
  });
});
