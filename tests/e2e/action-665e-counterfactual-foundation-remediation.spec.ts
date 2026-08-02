import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import {
  action665bCompleteBundle,
  action665bContradictoryNoTradeFallbackBundle,
  action665bExplicitNoTradeBundle,
} from "@/lib/completed-scanner-bundle-opportunity-set-fixtures";
import {
  buildPreTruncationCandidateCaptureEvidence,
  verifyPreTruncationCandidateCaptureEvidence,
} from "@/lib/pre-truncation-candidate-capture-evidence";
import {
  action665cCompleteRecommendationInput,
  action665cExplicitNoTradeInput,
  action665cMissingNoTradeEvidenceInput,
  action665cReadyResult,
  action665cSameDecisionDifferentDigestInput,
} from "@/lib/server/complete-opportunity-set-evidence-builder-fixtures";
import {
  createCompleteOpportunitySetEvidenceBuilder,
  type CompleteOpportunitySetPreviousBindingLookup,
} from "@/lib/server/complete-opportunity-set-evidence-builder";
import {
  completedScannerOutcomeEvaluationDigest,
  projectCompletedScannerBundleToOpportunitySet,
} from "@/lib/server/completed-scanner-bundle-opportunity-set-adapter";

function builder(
  lookup: CompleteOpportunitySetPreviousBindingLookup["lookup"] = () => null,
) {
  const handle = createCompleteOpportunitySetEvidenceBuilder({
    enabled: true,
    previous_binding_lookup: { lookup },
  });
  if (!handle.enabled) throw new Error("Fixture builder must be enabled.");
  return handle.build;
}

function diagnostics(
  result: ReturnType<typeof projectCompletedScannerBundleToOpportunitySet>,
) {
  return result.diagnostics.map((item) => item.reason_code);
}

test.describe("Action 665E finding remediation", () => {
  test("Major 1: capture evidence binds the authoritative identity set and rejects self-consistent omission", () => {
    const positive = action665cCompleteRecommendationInput
      .pre_truncation_capture_evidence;
    expect(positive.evidence_version).toBe(
      "pre_truncation_candidate_capture_evidence_v1",
    );
    expect(verifyPreTruncationCandidateCaptureEvidence(positive)).toEqual({
      valid: true,
      reason_codes: [],
    });

    const omitted = structuredClone(action665cCompleteRecommendationInput);
    omitted.candidates.pop();
    omitted.expected_candidate_count = omitted.candidates.length;
    omitted.observed_candidate_count = omitted.candidates.length;
    const result = builder()(omitted);
    expect(result.status).toBe("incomplete_membership");
    expect(result.reason_codes).toContain(
      "pre_truncation_membership_evidence_conflict",
    );
  });

  test("Major 1: tampered capture evidence fails its own digest before projection", () => {
    const tampered = structuredClone(action665cCompleteRecommendationInput);
    tampered.pre_truncation_capture_evidence.sorted_candidate_identities[0] =
      "candidate-tampered";
    const result = builder()(tampered);
    expect(result.status).toBe("incomplete_membership");
    expect(result.reason_codes).toEqual(
      expect.arrayContaining([
        "capture_evidence_semantic_digest_invalid",
        "pre_truncation_membership_evidence_conflict",
      ]),
    );

    const rebuilt = buildPreTruncationCandidateCaptureEvidence({
      scan_identity: tampered.stable_scan_identity,
      producer_decision_id: tampered.producer_decision_id,
      capture_stage_identity: "scanner-full-ranking-boundary",
      capture_stage_version: "scanner-full-ranking-boundary-v1",
      candidate_identities: tampered.candidates.map(
        (candidate) => candidate.candidate_identity,
      ),
      capture_timestamp: tampered.decision_timestamp,
      point_in_time_cutoff: tampered.point_in_time_cutoff,
      scanner_version: tampered.versions.scanner_version,
      universe_version: tampered.versions.universe_version,
      provider_contract_version:
        tampered.versions.provider_contract_version,
    });
    expect(rebuilt.ok).toBe(true);
  });

  test("Major 2: disposition is exclusive and no-trade plus fallback conflicts", () => {
    expect(builder()(action665cExplicitNoTradeInput).status).toBe("ready");
    expect(
      projectCompletedScannerBundleToOpportunitySet(
        action665bExplicitNoTradeBundle,
      ).status,
    ).toBe("mapped");

    const contradiction = projectCompletedScannerBundleToOpportunitySet(
      action665bContradictoryNoTradeFallbackBundle,
    );
    expect(contradiction.status).toBe("conflicting");
    expect(diagnostics(contradiction)).toContain(
      "no_trade_and_fallback_are_mutually_exclusive",
    );
    expect(builder()(action665cMissingNoTradeEvidenceInput)).toMatchObject({
      status: "no_trade_evidence_missing",
      reason_codes: ["no_trade_and_fallback_are_mutually_exclusive"],
    });
  });

  test("Major 3: expected evaluator and horizon contracts are decision-bound", () => {
    const evaluatorMismatch = structuredClone(
      action665cCompleteRecommendationInput,
    );
    evaluatorMismatch.candidates[0].expected_outcome_lineage.evaluator_version =
      "other-evaluator-v2";
    expect(builder()(evaluatorMismatch)).toMatchObject({
      status: "identity_conflict",
      reason_codes: expect.arrayContaining([
        "expected_outcome_lineage_identity_invalid",
      ]),
    });

    const horizonMismatch = structuredClone(
      action665cCompleteRecommendationInput,
    );
    (
      horizonMismatch.candidates[0].expected_outcome_lineage as {
        intended_horizon_policy: string;
      }
    ).intended_horizon_policy = "future_horizon_policy";
    expect(builder()(horizonMismatch)).toMatchObject({
      status: "identity_conflict",
    });
  });

  test("Major 3: future actual outcomes bind only to evaluation digest, never decision evidence", () => {
    const baseline = projectCompletedScannerBundleToOpportunitySet(
      action665bCompleteBundle,
    );
    const laterOutcome = structuredClone(action665bCompleteBundle);
    const candidate = laterOutcome.candidates[0];
    if (!candidate.outcome || !candidate.outcome_lineage) {
      throw new Error("Outcome fixture required.");
    }
    const priorEvaluationDigest = candidate.outcome_lineage.evaluation_digest;
    candidate.outcome.r_result = 2.5;
    const lineagePayload = {
      candidate_identity: candidate.outcome_lineage.candidate_identity,
      outcome_identity: candidate.outcome_lineage.outcome_identity,
      evaluator_input_identity:
        candidate.outcome_lineage.evaluator_input_identity,
      recommendation_decision_identity:
        candidate.outcome_lineage.recommendation_decision_identity,
      snapshot_identity: candidate.outcome_lineage.snapshot_identity,
    };
    candidate.outcome_lineage.evaluation_digest =
      completedScannerOutcomeEvaluationDigest({
        expected_outcome_lineage: candidate.expected_outcome_lineage,
        outcome: candidate.outcome,
        outcome_lineage: lineagePayload,
      });
    const replay = projectCompletedScannerBundleToOpportunitySet(laterOutcome);

    expect(replay.status).toBe("mapped");
    expect(replay.opportunity_set?.full_candidate_set_digest).toBe(
      baseline.opportunity_set?.full_candidate_set_digest,
    );
    expect(replay.opportunity_set?.decision_evidence_digest).toBe(
      baseline.opportunity_set?.decision_evidence_digest,
    );
    expect(candidate.outcome_lineage.evaluation_digest).not.toBe(
      priorEvaluationDigest,
    );

    const unbound = structuredClone(laterOutcome);
    unbound.candidates[0].outcome!.r_result = 3;
    const rejected =
      projectCompletedScannerBundleToOpportunitySet(unbound);
    expect(rejected.status).toBe("conflicting");
    expect(diagnostics(rejected)).toContain(
      "outcome_evaluation_digest_conflict",
    );
  });

  test("Major 4: complete lineage maps and orphaned batch or snapshot nodes conflict", () => {
    expect(
      projectCompletedScannerBundleToOpportunitySet(
        action665bCompleteBundle,
      ).status,
    ).toBe("mapped");

    const orphanedBatch = structuredClone(action665bCompleteBundle);
    orphanedBatch.candidates[0].batch_identity = "orphaned-batch";
    expect(
      diagnostics(
        projectCompletedScannerBundleToOpportunitySet(orphanedBatch),
      ),
    ).toContain("candidate_batch_lineage_conflict");

    const orphanedSnapshot = structuredClone(action665bCompleteBundle);
    orphanedSnapshot.batch!.recommendation_snapshot_ids = [
      "orphaned-snapshot",
    ];
    const snapshotResult =
      projectCompletedScannerBundleToOpportunitySet(orphanedSnapshot);
    expect(snapshotResult.status).toBe("conflicting");
    expect(diagnostics(snapshotResult)).toEqual(
      expect.arrayContaining([
        "batch_snapshot_membership_conflict",
        "selected_candidate_snapshot_lineage_conflict",
      ]),
    );

    const orphanedDecision = structuredClone(action665bCompleteBundle);
    orphanedDecision.decision_lineage_nodes[1].decision_identity =
      "orphaned-rejection-decision";
    const decisionResult =
      projectCompletedScannerBundleToOpportunitySet(orphanedDecision);
    expect(decisionResult.status).toBe("conflicting");
    expect(diagnostics(decisionResult)).toEqual(
      expect.arrayContaining([
        "candidate_decision_lineage_node_conflict",
        "decision_lineage_node_orphaned",
      ]),
    );
  });

  test("Major 5: positive versioned provider coverage is required for nonempty membership", () => {
    expect(builder()(action665cCompleteRecommendationInput).status).toBe(
      "ready",
    );
    const zeroCoverage = structuredClone(
      action665cCompleteRecommendationInput,
    );
    zeroCoverage.provider_context.expected_observation_count = 0;
    zeroCoverage.provider_context.observed_observation_count = 0;
    const result = builder()(zeroCoverage);
    expect(result.status).toBe("provider_coverage_incomplete");
    expect(result.reason_codes).toContain("provider_coverage_not_complete");
  });

  test("Minor 1: only the closed versioned reason taxonomy is accepted", () => {
    const known = builder()(action665cCompleteRecommendationInput);
    expect(known.status).toBe("ready");

    const unknown = structuredClone(action665cCompleteRecommendationInput);
    unknown.candidates[1].rejection_reason_codes = [
      "well_formed_but_unknown_reason",
    ];
    const result = builder()(unknown);
    expect(result.status).toBe("reason_code_conflict");
    expect(result.reason_codes).toContain("canonical_reason_code_invalid");
  });

  test("Minor 2: enabled builder requires lookup and same identity cannot change semantics", () => {
    expect(
      createCompleteOpportunitySetEvidenceBuilder({ enabled: true }),
    ).toEqual({ enabled: false, build: null });
    const collision = builder(
      () => action665cReadyResult.decision_binding!,
    )(action665cSameDecisionDifferentDigestInput);
    expect(collision).toMatchObject({
      status: "identity_conflict",
      reason_codes: ["same_decision_identity_different_evidence"],
    });
  });

  test("Nit: invalid presentation top-K fails before adapter projection", () => {
    const invalid = structuredClone(action665cCompleteRecommendationInput);
    invalid.presentation_top_k = 0;
    const result = builder()(invalid);
    expect(result).toMatchObject({
      status: "incomplete_membership",
      round_trip: {
        first_status: null,
        replay_status: null,
      },
      reason_codes: ["presentation_top_k_invalid"],
    });
    const source = readFileSync(
      path.join(
        process.cwd(),
        "lib/server/complete-opportunity-set-evidence-builder.ts",
      ),
      "utf8",
    );
    expect(source.indexOf("presentationReasons(input)")).toBeLessThan(
      source.indexOf("projectCompletedScannerBundleToOpportunitySet(bundle)"),
    );
  });
});
