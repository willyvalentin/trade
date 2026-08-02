import "server-only";

import { action665aVersions } from "@/lib/canonical-counterfactual-opportunity-set-fixtures";
import {
  action665bCompleteBundle,
  action665bExplicitNoTradeBundle,
} from "@/lib/completed-scanner-bundle-opportunity-set-fixtures";
import {
  createCompleteOpportunitySetEvidenceBuilder,
  type CompleteOpportunitySetCandidateInput,
  type CompleteOpportunitySetEvidenceBuilderInput,
  type CompleteOpportunitySetEvidenceStatus,
} from "@/lib/server/complete-opportunity-set-evidence-builder";

const enabledBuilder = createCompleteOpportunitySetEvidenceBuilder({
  enabled: true,
  previous_binding_lookup: { lookup: () => null },
});
if (!enabledBuilder.enabled) {
  throw new Error("Action 665C fixture builder was not explicitly enabled.");
}

function requireCompleteBundle() {
  const source = action665bCompleteBundle;
  if (
    !source.source_namespace ||
    !source.scan_run ||
    !source.ranking_summary ||
    !source.stable_scan_identity ||
    !source.producer_decision_id ||
    !source.decision_timestamp ||
    !source.point_in_time_cutoff ||
    !source.versions ||
    !source.provider_context
  ) {
    throw new Error("Action 665B complete fixture is unexpectedly incomplete.");
  }
  return source;
}

function candidateFrom665b(
  source: (typeof action665bCompleteBundle.candidates)[number],
): CompleteOpportunitySetCandidateInput {
  if (
    !source.candidate_identity ||
    !source.ranking ||
    !source.membership_status ||
    !source.rejection_reason_codes ||
    !source.threshold_version ||
    !source.ranking_version ||
    !source.provider_source_timestamp ||
    !source.outcome_lineage
  ) {
    throw new Error("Action 665B candidate fixture is unexpectedly incomplete.");
  }
  return {
    ...structuredClone(source),
    candidate_identity: source.candidate_identity,
    ranking: structuredClone(source.ranking),
    tie_break_key: `rank-${source.ranking.rank}:${source.ranking.ticker.toLowerCase()}`,
    membership_status: source.membership_status,
    rejection_reason_codes: [...source.rejection_reason_codes],
    threshold_version: source.threshold_version,
    ranking_version: source.ranking_version,
    provider_source_timestamp: source.provider_source_timestamp,
    producer_versions: {
      scanner_version: action665aVersions.scanner_version,
      universe_version: action665aVersions.universe_version,
      threshold_version: action665aVersions.threshold_version,
      engine_version: action665aVersions.engine_version,
      scoring_version: action665aVersions.scoring_version,
      ranking_version: action665aVersions.ranking_version,
      setup_taxonomy_version: action665aVersions.setup_taxonomy_version,
    },
  };
}

function completeBuilderInput(
  source = requireCompleteBundle(),
): CompleteOpportunitySetEvidenceBuilderInput {
  return {
    source_namespace: source.source_namespace as string,
    stable_scan_identity: source.stable_scan_identity as string,
    producer_decision_id: source.producer_decision_id as string,
    decision_timestamp: source.decision_timestamp as string,
    point_in_time_cutoff: source.point_in_time_cutoff as string,
    full_membership_declared: true,
    expected_candidate_count: source.candidates.length,
    observed_candidate_count: source.candidates.length,
    pre_truncation_capture_evidence: structuredClone(
      source.pre_truncation_capture_evidence!,
    ),
    presentation_top_k: null,
    versions: structuredClone(source.versions!),
    provider_context: structuredClone(source.provider_context!),
    scan_run: structuredClone(source.scan_run!),
    batch: source.batch ? structuredClone(source.batch) : null,
    ranking_context: {
      summary_version: source.ranking_summary!.summary_version,
      summary_kind: source.ranking_summary!.summary_kind,
      generated_at: source.ranking_summary!.generated_at,
      scan_window: source.ranking_summary!.scan_window,
      target_min: source.ranking_summary!.target_min,
      target_max: source.ranking_summary!.target_max,
      top_ranking_reasons: [
        ...source.ranking_summary!.top_ranking_reasons,
      ],
      top_penalty_reasons: [
        ...source.ranking_summary!.top_penalty_reasons,
      ],
      warnings: structuredClone(source.ranking_summary!.warnings),
    },
    build_diagnostics: structuredClone(source.build_diagnostics),
    candidates: source.candidates.map(candidateFrom665b),
    decision_lineage_nodes: structuredClone(
      source.decision_lineage_nodes,
    ),
    decision_disposition: source.decision_disposition,
    no_trade_evidence: structuredClone(source.no_trade_evidence),
    counterfactual_evaluation_requested: false,
  };
}

export const action665cCompleteRecommendationInput = completeBuilderInput();

export const action665cExplicitNoTradeInput = completeBuilderInput(
  action665bExplicitNoTradeBundle,
);

export const action665cTopKPresentationInput = completeBuilderInput();
action665cTopKPresentationInput.presentation_top_k = 2;

export const action665cTruncatedInput = completeBuilderInput();
action665cTruncatedInput.full_membership_declared = false;
action665cTruncatedInput.expected_candidate_count = 6;

export const action665cDuplicateRankInput = completeBuilderInput();
action665cDuplicateRankInput.candidates[2].ranking.rank = 2;

export const action665cMissingRankInput = completeBuilderInput();
(
  action665cMissingRankInput.candidates[2].ranking as {
    rank: number | null;
  }
).rank = null;

export const action665cTieWithoutBreakInput = completeBuilderInput();
action665cTieWithoutBreakInput.candidates[1].ranking.rank = 2;
action665cTieWithoutBreakInput.candidates[2].ranking.rank = 2;
action665cTieWithoutBreakInput.candidates[3].ranking.rank = 3;
action665cTieWithoutBreakInput.candidates[1].tie_break_key = null;
action665cTieWithoutBreakInput.candidates[2].tie_break_key = null;

export const action665cAllMembershipStatusesInput = completeBuilderInput();

export const action665cFreeReasonTextInput = completeBuilderInput();
action665cFreeReasonTextInput.candidates[1].rejection_reason_codes = [];
action665cFreeReasonTextInput.candidates[1].raw_rejection_reason =
  "Skipped because an active position already existed.";

export const action665cMixedVersionsInput = completeBuilderInput();
action665cMixedVersionsInput.candidates[1].producer_versions.engine_version =
  "engine-shadow-b-v2";

export const action665cProviderGapInput = completeBuilderInput();
action665cProviderGapInput.provider_context.freshness = "gap";
action665cProviderGapInput.provider_context.observed_observation_count = 3;
action665cProviderGapInput.provider_context.coverage_reason_codes = [
  "provider_candle_gap",
];

export const action665cFutureCutoffInput = completeBuilderInput();
action665cFutureCutoffInput.candidates[1].provider_source_timestamp =
  "2026-07-26T12:00:01.000Z";

export const action665cDuplicateCandidateIdentityInput = completeBuilderInput();
action665cDuplicateCandidateIdentityInput.candidates[1].candidate_identity =
  action665cDuplicateCandidateIdentityInput.candidates[0].candidate_identity;
action665cDuplicateCandidateIdentityInput.candidates[1].expected_outcome_lineage
  .candidate_identity =
  action665cDuplicateCandidateIdentityInput.candidates[0].candidate_identity;

export const action665cMissingNoTradeEvidenceInput = completeBuilderInput();
action665cMissingNoTradeEvidenceInput.decision_disposition =
  "explicit_no_trade";
action665cMissingNoTradeEvidenceInput.no_trade_evidence = {
  explicit_decision_recorded: false,
  producer_decision_id: null,
  decision_timestamp: null,
  decision_reason_code: null,
  decision_reason_detail: null,
  decision_source: null,
  ai_no_trade_observed: true,
  deterministic_fallback_used: true,
};

export const action665cReorderedInput = completeBuilderInput();
action665cReorderedInput.candidates.reverse();
action665cReorderedInput.build_diagnostics.reverse();

export const action665cReadyResult = enabledBuilder.build(
  action665cCompleteRecommendationInput,
);
if (
  action665cReadyResult.status !== "ready" ||
  !action665cReadyResult.completed_bundle ||
  !action665cReadyResult.full_candidate_set_digest ||
  !action665cReadyResult.decision_evidence_digest ||
  !action665cReadyResult.decision_semantic_binding_digest ||
  !action665cReadyResult.decision_binding
) {
  throw new Error(
    `Action 665C ready fixture failed: ${action665cReadyResult.reason_codes.join(",")}`,
  );
}

export const action665cSameDecisionDifferentDigestInput =
  completeBuilderInput();
action665cSameDecisionDifferentDigestInput.candidates[0].ranking.score
  .normalized_score = 91;
action665cSameDecisionDifferentDigestInput.candidates[0].ranking.score
  .total_score = 91;

export const action665cRoundTripInput = completeBuilderInput();
export const action665cInputImmutabilityInput = completeBuilderInput();

export type Action665cFixtureCase = {
  name: string;
  input: CompleteOpportunitySetEvidenceBuilderInput;
  expected_status: CompleteOpportunitySetEvidenceStatus;
};

export const action665cFixtureCases: Action665cFixtureCase[] = [
  {
    name: "complete_recommendation_set",
    input: action665cCompleteRecommendationInput,
    expected_status: "ready",
  },
  {
    name: "complete_explicit_no_trade",
    input: action665cExplicitNoTradeInput,
    expected_status: "ready",
  },
  {
    name: "full_set_with_top_k_presentation",
    input: action665cTopKPresentationInput,
    expected_status: "ready",
  },
  {
    name: "truncated_input",
    input: action665cTruncatedInput,
    expected_status: "incomplete_membership",
  },
  {
    name: "duplicate_rank",
    input: action665cDuplicateRankInput,
    expected_status: "rank_conflict",
  },
  {
    name: "missing_rank",
    input: action665cMissingRankInput,
    expected_status: "rank_conflict",
  },
  {
    name: "tie_without_tie_break",
    input: action665cTieWithoutBreakInput,
    expected_status: "rank_conflict",
  },
  {
    name: "all_membership_statuses",
    input: action665cAllMembershipStatusesInput,
    expected_status: "ready",
  },
  {
    name: "free_reason_text",
    input: action665cFreeReasonTextInput,
    expected_status: "reason_code_conflict",
  },
  {
    name: "mixed_versions",
    input: action665cMixedVersionsInput,
    expected_status: "version_conflict",
  },
  {
    name: "provider_gap",
    input: action665cProviderGapInput,
    expected_status: "provider_coverage_incomplete",
  },
  {
    name: "future_cutoff_violation",
    input: action665cFutureCutoffInput,
    expected_status: "not_point_in_time_safe",
  },
  {
    name: "duplicate_candidate_identity",
    input: action665cDuplicateCandidateIdentityInput,
    expected_status: "identity_conflict",
  },
  {
    name: "same_decision_identity_different_candidate_digest",
    input: action665cSameDecisionDifferentDigestInput,
    expected_status: "ready",
  },
  {
    name: "missing_explicit_no_trade_evidence",
    input: action665cMissingNoTradeEvidenceInput,
    expected_status: "no_trade_evidence_missing",
  },
  {
    name: "input_order_determinism",
    input: action665cReorderedInput,
    expected_status: "ready",
  },
  {
    name: "action_665b_round_trip",
    input: action665cRoundTripInput,
    expected_status: "ready",
  },
  {
    name: "input_immutability",
    input: action665cInputImmutabilityInput,
    expected_status: "ready",
  },
];
