import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import readinessReportEvidence from "@/docs/action-665c-fixture-readiness-report.json";
import {
  action665cAllMembershipStatusesInput,
  action665cCompleteRecommendationInput,
  action665cDuplicateCandidateIdentityInput,
  action665cDuplicateRankInput,
  action665cExplicitNoTradeInput,
  action665cFixtureCases,
  action665cFreeReasonTextInput,
  action665cFutureCutoffInput,
  action665cInputImmutabilityInput,
  action665cMissingNoTradeEvidenceInput,
  action665cMissingRankInput,
  action665cMixedVersionsInput,
  action665cProviderGapInput,
  action665cReadyResult,
  action665cReorderedInput,
  action665cRoundTripInput,
  action665cSameDecisionDifferentDigestInput,
  action665cTieWithoutBreakInput,
  action665cTopKPresentationInput,
  action665cTruncatedInput,
} from "@/lib/server/complete-opportunity-set-evidence-builder-fixtures";
import {
  aggregateCompleteOpportunitySetReadiness,
  compareCompleteOpportunitySetDecisionEvidence,
  completeOpportunitySetInputDigest,
  createCompleteOpportunitySetEvidenceBuilder,
} from "@/lib/server/complete-opportunity-set-evidence-builder";
import { projectCompletedScannerBundleToOpportunitySet } from "@/lib/server/completed-scanner-bundle-opportunity-set-adapter";

const enabledBuilder = createCompleteOpportunitySetEvidenceBuilder({
  enabled: true,
  previous_binding_lookup: { lookup: () => null },
});
if (!enabledBuilder.enabled) {
  throw new Error("Action 665C test builder was not explicitly enabled.");
}
const enabledBuild = enabledBuilder.build;

function build(
  input: Parameters<typeof enabledBuild>[0],
) {
  return enabledBuild(input);
}

test.describe("Action 665C complete opportunity-set evidence builder", () => {
  test("builder is server-only and default-off with no callable build path", () => {
    const defaultHandle = createCompleteOpportunitySetEvidenceBuilder();
    const source = readFileSync(
      path.join(
        process.cwd(),
        "lib/server/complete-opportunity-set-evidence-builder.ts",
      ),
      "utf8",
    );

    expect(defaultHandle).toEqual({ enabled: false, build: null });
    expect(
      createCompleteOpportunitySetEvidenceBuilder({ enabled: true }),
    ).toEqual({ enabled: false, build: null });
    expect(source.startsWith('import "server-only";')).toBe(true);
    expect(source).toContain(
      "COMPLETE_OPPORTUNITY_SET_EVIDENCE_BUILDER_DEFAULT_ENABLED = false",
    );
    expect(source).not.toMatch(/createClient|supabase|fetch\(|insert\(|update\(|delete\(/);
  });

  test("complete recommendation set becomes a deep-frozen exact 665B bundle with canonical digests", () => {
    const result = build(action665cCompleteRecommendationInput);

    expect(result.status).toBe("ready");
    expect(result.full_candidate_set_digest).toMatch(/^[0-9a-f]{64}$/);
    expect(result.decision_evidence_digest).toMatch(/^[0-9a-f]{64}$/);
    expect(result.completed_bundle?.ranking_summary?.results).toHaveLength(4);
    expect(result.completed_bundle?.candidates).toHaveLength(4);
    expect(Object.isFrozen(result.completed_bundle)).toBe(true);
    expect(Object.isFrozen(result.completed_bundle?.candidates)).toBe(true);
    expect(Object.isFrozen(result.completed_bundle?.candidates[0])).toBe(true);
    expect(result.round_trip).toEqual({
      first_status: "mapped",
      replay_status: "mapped",
      canonical_identity_stable: true,
      candidate_set_digest_stable: true,
      decision_evidence_digest_stable: true,
      decision_semantic_binding_digest_stable: true,
    });
  });

  test("full ranking survives a smaller presentation top-K without changing denominator", () => {
    const result = build(action665cTopKPresentationInput);

    expect(result.status).toBe("ready");
    expect(result.presentation).toEqual({
      top_k: 2,
      full_candidate_count: 4,
      full_ranking_preserved: true,
    });
    expect(result.completed_bundle?.ranking_summary?.results).toHaveLength(4);
    expect(result.completed_bundle?.expected_candidate_count).toBe(4);
  });

  test("truncated or partial membership fails before 665B projection", () => {
    const result = build(action665cTruncatedInput);

    expect(result.status).toBe("incomplete_membership");
    expect(result.completed_bundle).toBeNull();
    expect(result.reason_codes).toEqual([
      "candidate_membership_truncated_or_partial",
      "full_membership_not_declared",
      "pre_truncation_membership_evidence_conflict",
    ]);
    expect(result.round_trip.first_status).toBeNull();
  });

  test("missing, duplicate, or tied ranks fail closed with explicit rank diagnostics", () => {
    const duplicate = build(action665cDuplicateRankInput);
    const missing = build(action665cMissingRankInput);
    const tie = build(action665cTieWithoutBreakInput);

    expect(duplicate.status).toBe("rank_conflict");
    expect(duplicate.reason_codes).toContain("rank_sequence_gap");
    expect(missing.status).toBe("rank_conflict");
    expect(missing.reason_codes).toContain("original_rank_missing_or_invalid");
    expect(tie.status).toBe("rank_conflict");
    expect(tie.reason_codes).toEqual(
      expect.arrayContaining([
        "explicit_tie_break_missing",
        "rank_tie_without_unique_tie_break",
        "tie_break_not_unique",
      ]),
    );
  });

  test("ranking selection remains separate from exclusive opportunity membership", () => {
    const result = build(action665cAllMembershipStatusesInput);

    expect(result.status).toBe("ready");
    expect(
      result.completed_bundle?.candidates.map(
        (candidate) => candidate.membership_status,
      ),
    ).toEqual(["selected", "rejected", "overflow", "under_threshold"]);
    expect(
      result.completed_bundle?.ranking_summary?.selection.selected_tickers,
    ).toEqual(["AAPL", "MSFT"]);
    expect(
      result.completed_bundle?.candidates.find(
        (candidate) => candidate.ranking?.ticker === "MSFT",
      )?.membership_status,
    ).toBe("rejected");
  });

  test("free reason text cannot replace canonical rejection reason codes", () => {
    const result = build(action665cFreeReasonTextInput);

    expect(result.status).toBe("reason_code_conflict");
    expect(result.reason_codes).toEqual([
      "canonical_rejection_reason_missing",
      "free_text_reason_without_canonical_code",
    ]);
  });

  test("mixed scanner-to-setup version evidence is rejected", () => {
    const result = build(action665cMixedVersionsInput);

    expect(result.status).toBe("version_conflict");
    expect(result.reason_codes).toEqual(["mixed_candidate_versions"]);
  });

  test("provider gaps and evidence after cutoff remain distinct readiness failures", () => {
    const gap = build(action665cProviderGapInput);
    const future = build(action665cFutureCutoffInput);

    expect(gap.status).toBe("provider_coverage_incomplete");
    expect(gap.reason_codes).toEqual([
      "provider_coverage_not_complete",
      "provider_coverage_reason_present",
    ]);
    expect(future.status).toBe("not_point_in_time_safe");
    expect(future.reason_codes).toEqual(["candidate_source_after_cutoff"]);
  });

  test("duplicate candidate identity and one decision with new evidence conflict", () => {
    const duplicate = build(action665cDuplicateCandidateIdentityInput);
    const changedUnboundInput = structuredClone(
      action665cSameDecisionDifferentDigestInput,
    );
    const changedUnbound = build(changedUnboundInput);
    const collisionBuilder = createCompleteOpportunitySetEvidenceBuilder({
      enabled: true,
      previous_binding_lookup: {
        lookup: () => ({
          ...action665cReadyResult.decision_binding!,
        }),
      },
    });
    if (!collisionBuilder.enabled) {
      throw new Error("Collision lookup builder must be enabled.");
    }
    const changedBound = collisionBuilder.build(
      action665cSameDecisionDifferentDigestInput,
    );

    expect(duplicate.status).toBe("identity_conflict");
    expect(duplicate.reason_codes).toContain("candidate_identity_duplicate");
    expect(changedUnbound.status).toBe("ready");
    expect(changedBound).toMatchObject({
      status: "identity_conflict",
      reason_codes: ["same_decision_identity_different_evidence"],
    });
    expect(
      compareCompleteOpportunitySetDecisionEvidence(
        action665cReadyResult,
        changedUnbound,
      ),
    ).toEqual({
      status: "identity_conflict",
      reason_codes: ["same_decision_identity_different_evidence"],
    });
  });

  test("no-trade is emitted only from explicit matching decision evidence", () => {
    const explicit = build(action665cExplicitNoTradeInput);
    const fallback = build(action665cMissingNoTradeEvidenceInput);

    expect(explicit.status).toBe("ready");
    expect(explicit.completed_bundle?.decision_disposition).toBe(
      "explicit_no_trade",
    );
    expect(
      projectCompletedScannerBundleToOpportunitySet(
        explicit.completed_bundle!,
      ).no_trade_decision,
    ).toMatchObject({
      decision_kind: "no_trade",
      explicit_no_trade_decision: true,
    });
    expect(fallback.status).toBe("no_trade_evidence_missing");
    expect(fallback.reason_codes).toEqual([
      "no_trade_and_fallback_are_mutually_exclusive",
    ]);
  });

  test("input order does not change full ranking, candidate digest, or decision evidence", () => {
    const baseline = build(action665cCompleteRecommendationInput);
    const reordered = build(action665cReorderedInput);

    expect(reordered.status).toBe("ready");
    expect(reordered.full_candidate_set_digest).toBe(
      baseline.full_candidate_set_digest,
    );
    expect(reordered.decision_evidence_digest).toBe(
      baseline.decision_evidence_digest,
    );
    expect(
      reordered.completed_bundle?.ranking_summary?.results.map(
        (candidate) => candidate.ticker,
      ),
    ).toEqual(["AAPL", "MSFT", "NVDA", "AMD"]);
  });

  test("the frozen completed bundle round-trips through 665B with exact digest parity", () => {
    const result = build(action665cRoundTripInput);
    expect(result.status).toBe("ready");
    const projection = projectCompletedScannerBundleToOpportunitySet(
      result.completed_bundle!,
    );

    expect(projection.status).toBe("mapped");
    expect(projection.opportunity_set?.full_candidate_set_digest).toBe(
      result.full_candidate_set_digest,
    );
    expect(projection.opportunity_set?.decision_evidence_digest).toBe(
      result.decision_evidence_digest,
    );
  });

  test("builder does not mutate input and replay remains deterministic", () => {
    const input = structuredClone(action665cInputImmutabilityInput);
    const before = completeOpportunitySetInputDigest(input);
    const first = build(input);
    const afterFirst = completeOpportunitySetInputDigest(input);
    const replay = build(input);

    expect(afterFirst).toBe(before);
    expect(completeOpportunitySetInputDigest(input)).toBe(before);
    expect(replay).toEqual(first);
  });

  test("fixture readiness report covers every status without performance values", () => {
    const results = action665cFixtureCases.map((fixture) => {
      const result = build(fixture.input);
      expect(result.status, fixture.name).toBe(fixture.expected_status);
      return result;
    });
    const report = aggregateCompleteOpportunitySetReadiness(results);

    expect(report).toEqual({
      builder_version: "complete_opportunity_set_evidence_builder_v1",
      evidence_class: "synthetic_fixture_only",
      performance_values_included: false,
      total: 18,
      status_counts: {
        ready: 8,
        incomplete_membership: 1,
        rank_conflict: 3,
        identity_conflict: 1,
        version_conflict: 1,
        reason_code_conflict: 1,
        not_point_in_time_safe: 1,
        provider_coverage_incomplete: 1,
        no_trade_evidence_missing: 1,
      },
      round_trip_mapped: 8,
      full_ranking_preserved: 8,
      reason_counts: expect.any(Object),
    });
    expect(report).toEqual(readinessReportEvidence);
    expect(JSON.stringify(report)).not.toMatch(
      /"(?:win_rate|expectancy|precision_at|performance_value)":/,
    );
  });
});
