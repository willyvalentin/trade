import {
  buildFirstTinyHistoricalReplaySignalPackageDiscoveryReadbackResultVerification,
  type FirstTinySignalPackageDiscoveryReadbackCandidate,
  type FirstTinySignalPackageDiscoveryReadbackResultVerificationSummary,
} from "@/lib/first-tiny-historical-replay-signal-package-discovery-readback-result-verification";

export const firstTinyHistoricalReplaySignalPackageSelectionPlanMarker =
  "action_305_first_tiny_signal_package_selection_plan";

export type FirstTinySignalPackageSelectionPlanStatus = "planned";

export type FirstTinySignalPackageSelectionCandidateSummary = {
  candidate_id: string;
  source_type: "recommendation_row" | "recommendation_snapshot";
  analysis_cutoff: string;
  direction: "long";
  entry: number;
  stop: number;
  target: number;
  selection_rank: number;
  selection_reason: string;
  selected_by_plan: boolean;
  requires_operator_approval_before_execution: true;
};

export type FirstTinySignalPackageSelectionGroupSummary = {
  group_label: "early" | "later";
  analysis_cutoff: "2026-07-08T13:49:19Z" | "2026-07-08T16:47:52Z";
  candidates_count: number;
  preferred_source_candidate: string;
  entry_stop_target_summary: string;
  selection_notes: string[];
};

export type FirstTinySignalPackageSelectionRecommendedCandidate = {
  candidate_id: "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557";
  source_type: "recommendation_row";
  source_row_id: "7dd59e66-7e54-4d35-92f9-5cc1ae11c557";
  analysis_cutoff: "2026-07-08T13:49:19.521608+00:00";
  direction: "long";
  entry: 304.86;
  stop: 295.62;
  target: 334.12;
  confidence_or_tier: "Low";
  setup_label: "UNKNOWN";
};

export type FirstTinySignalPackageSelectionPlanInput = {
  readback_result_verification?: FirstTinySignalPackageDiscoveryReadbackResultVerificationSummary | null;
};

export type FirstTinySignalPackageSelectionPlanSummary = {
  plan_marker: typeof firstTinyHistoricalReplaySignalPackageSelectionPlanMarker;
  selection_plan_status: FirstTinySignalPackageSelectionPlanStatus;
  source_verification: "signal_package_discovery_readback_verified";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  compatible_candidates: 9;
  candidate_groups: 2;
  selected_candidate_now: false;
  recommended_candidate_available: true;
  recommended_candidate: FirstTinySignalPackageSelectionRecommendedCandidate;
  deterministic_selection_rules: [
    "prefer_recommendation_row_over_snapshot_for_same_generation_event",
    "prefer_earliest_valid_analysis_cutoff_for_first_replay",
    "prefer_complete_entry_stop_target_geometry",
    "prefer_explicit_confidence_tier_setup_metadata_as_tiebreaker_only",
    "reject_missing_entry_stop_target",
    "reject_unvalidated_or_out_of_window_analysis_cutoff",
    "require_separate_approval_before_executable_selection",
  ];
  candidate_group_summaries: FirstTinySignalPackageSelectionGroupSummary[];
  candidate_selection_summaries: FirstTinySignalPackageSelectionCandidateSummary[];
  recommendation_reasoning: [
    "original_recommendation_row",
    "earliest_generation_group",
    "complete_direction_entry_stop_target",
    "explicit_confidence_tier_and_setup_fields",
    "longest_subsequent_candle_window",
    "avoids_snapshot_duplication",
  ];
  replay_executed: false;
  synthetic_outcomes_persisted: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  provider_call_executed: false;
  provider_call_attempted: false;
  candles_persisted: false;
  raw_response_persisted: false;
  fetch_run_persisted: false;
  recommendation_rows_mutated: false;
  supabase_write_executed: false;
  scanner_universe_changed: false;
  thresholds_changed: false;
  outcome_evaluation_persistence_changed: false;
  learning_acceleration_changed: false;
  add_trade_affected: false;
  broker_execution_affected: false;
  risk_changed: false;
  ready_for_selection_approval_gate: true;
  replay_allowed_now: false;
  synthetic_outcome_persistence_allowed_now: false;
  scanner_use_allowed_now: false;
  ranking_change_allowed_now: false;
  blockers: [];
  warnings: [];
  recommended_next_steps: [
    "review_recommended_signal_package",
    "add_selection_approval_gate",
    "keep_synthetic_outcomes_scanner_and_ranking_disabled",
  ];
};

const recommendedCandidateId =
  "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557" as const;

const deterministicSelectionRules = [
  "prefer_recommendation_row_over_snapshot_for_same_generation_event",
  "prefer_earliest_valid_analysis_cutoff_for_first_replay",
  "prefer_complete_entry_stop_target_geometry",
  "prefer_explicit_confidence_tier_setup_metadata_as_tiebreaker_only",
  "reject_missing_entry_stop_target",
  "reject_unvalidated_or_out_of_window_analysis_cutoff",
  "require_separate_approval_before_executable_selection",
] as const;

const recommendationReasoning = [
  "original_recommendation_row",
  "earliest_generation_group",
  "complete_direction_entry_stop_target",
  "explicit_confidence_tier_and_setup_fields",
  "longest_subsequent_candle_window",
  "avoids_snapshot_duplication",
] as const;

function sourcePriority(sourceType: FirstTinySignalPackageDiscoveryReadbackCandidate["source_type"]) {
  return sourceType === "recommendation_row" ? 0 : 1;
}

function metadataPriority(candidate: FirstTinySignalPackageDiscoveryReadbackCandidate) {
  return candidate.confidence_or_tier !== null || candidate.setup_label !== null
    ? 0
    : 1;
}

function selectionReason(candidate: FirstTinySignalPackageDiscoveryReadbackCandidate) {
  if (candidate.candidate_id === recommendedCandidateId) {
    return "earliest_original_recommendation_row_complete_geometry_longest_forward_window";
  }
  if (candidate.source_type === "recommendation_snapshot") {
    return "compatible_snapshot_duplicate_not_preferred_for_first_replay";
  }
  return "compatible_later_recommendation_row_not_preferred_for_first_replay";
}

function buildSelectionSummaries(
  candidates: FirstTinySignalPackageDiscoveryReadbackCandidate[],
): FirstTinySignalPackageSelectionCandidateSummary[] {
  return [...candidates]
    .sort(
      (left, right) =>
        Date.parse(left.analysis_cutoff) - Date.parse(right.analysis_cutoff) ||
        sourcePriority(left.source_type) - sourcePriority(right.source_type) ||
        metadataPriority(left) - metadataPriority(right) ||
        left.candidate_id.localeCompare(right.candidate_id),
    )
    .map((candidate, index) => ({
      candidate_id: candidate.candidate_id,
      source_type: candidate.source_type,
      analysis_cutoff: candidate.analysis_cutoff,
      direction: candidate.direction,
      entry: candidate.entry,
      stop: candidate.stop,
      target: candidate.target,
      selection_rank: index + 1,
      selection_reason: selectionReason(candidate),
      selected_by_plan: candidate.candidate_id === recommendedCandidateId,
      requires_operator_approval_before_execution: true,
    }));
}

export function buildFirstTinyHistoricalReplaySignalPackageSelectionPlan(
  input: FirstTinySignalPackageSelectionPlanInput = {},
): FirstTinySignalPackageSelectionPlanSummary {
  const verification =
    input.readback_result_verification ??
    buildFirstTinyHistoricalReplaySignalPackageDiscoveryReadbackResultVerification();
  return {
    plan_marker: firstTinyHistoricalReplaySignalPackageSelectionPlanMarker,
    selection_plan_status: "planned",
    source_verification: verification.verification_status,
    ticker: verification.ticker,
    interval: verification.interval,
    trading_day: verification.trading_day,
    compatible_candidates: verification.compatible_candidates,
    candidate_groups: verification.candidate_group_count,
    selected_candidate_now: false,
    recommended_candidate_available: true,
    recommended_candidate: {
      candidate_id: recommendedCandidateId,
      source_type: "recommendation_row",
      source_row_id: "7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
      analysis_cutoff: "2026-07-08T13:49:19.521608+00:00",
      direction: "long",
      entry: 304.86,
      stop: 295.62,
      target: 334.12,
      confidence_or_tier: "Low",
      setup_label: "UNKNOWN",
    },
    deterministic_selection_rules: [...deterministicSelectionRules],
    candidate_group_summaries: [
      {
        group_label: "early",
        analysis_cutoff: verification.early_group_cutoff,
        candidates_count: 4,
        preferred_source_candidate: recommendedCandidateId,
        entry_stop_target_summary: "entry 304.86-307.94 / stop 295.62 / target 334.12",
        selection_notes: [
          "earliest_generation_group",
          "recommendation_row_preferred_over_snapshot_duplicates",
          "longest_forward_candle_window_for_first_replay",
        ],
      },
      {
        group_label: "later",
        analysis_cutoff: verification.later_group_cutoff,
        candidates_count: 5,
        preferred_source_candidate:
          "recommendation_row:f87978f3-9ffa-4105-9823-040c8497d55b",
        entry_stop_target_summary: "entry 309.31-312.43 / stop 299.93 / target 338.98",
        selection_notes: [
          "compatible_but_later_generation_group",
          "not_preferred_for_first_replay",
          "retained_for_future_comparison_plan",
        ],
      },
    ],
    candidate_selection_summaries: buildSelectionSummaries(
      verification.candidates,
    ),
    recommendation_reasoning: [...recommendationReasoning],
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    provider_call_executed: false,
    provider_call_attempted: false,
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    recommendation_rows_mutated: false,
    supabase_write_executed: false,
    scanner_universe_changed: false,
    thresholds_changed: false,
    outcome_evaluation_persistence_changed: false,
    learning_acceleration_changed: false,
    add_trade_affected: false,
    broker_execution_affected: false,
    risk_changed: false,
    ready_for_selection_approval_gate: true,
    replay_allowed_now: false,
    synthetic_outcome_persistence_allowed_now: false,
    scanner_use_allowed_now: false,
    ranking_change_allowed_now: false,
    blockers: [],
    warnings: [],
    recommended_next_steps: [
      "review_recommended_signal_package",
      "add_selection_approval_gate",
      "keep_synthetic_outcomes_scanner_and_ranking_disabled",
    ],
  };
}
