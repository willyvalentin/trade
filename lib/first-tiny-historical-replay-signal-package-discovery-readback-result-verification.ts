export const firstTinyHistoricalReplaySignalPackageDiscoveryReadbackResultVerificationMarker =
  "action_304_first_tiny_signal_package_discovery_readback_result_verification";

export type FirstTinySignalPackageDiscoveryReadbackResultVerificationStatus =
  "signal_package_discovery_readback_verified";

export type FirstTinySignalPackageDiscoveryReadbackCandidate = {
  candidate_id: string;
  source_type: "recommendation_row" | "recommendation_snapshot";
  generated_at: string;
  analysis_cutoff: string;
  direction: "long";
  entry: number;
  stop: number;
  target: number;
  confidence_or_tier: string | number | null;
  setup_label: string | null;
};

export type FirstTinySignalPackageDiscoveryReadbackCandidateGroup = {
  group_id: "early_generation_group" | "later_generation_group";
  cutoff_label: "2026-07-08T13:49:19Z" | "2026-07-08T16:47:52Z";
  source_types: string[];
  candidate_ids: string[];
  direction: "long";
  entry_range: {
    min: number;
    max: number;
  };
  stop: number;
  target: number;
  confidence_or_tier_values: Array<string | number | null>;
  confidence_or_tier_available: boolean;
  completeness: "complete";
  replay_suitability_notes: string[];
};

export type FirstTinySignalPackageDiscoveryReadbackResultVerificationSummary = {
  verification_marker: typeof firstTinyHistoricalReplaySignalPackageDiscoveryReadbackResultVerificationMarker;
  verification_status: FirstTinySignalPackageDiscoveryReadbackResultVerificationStatus;
  conclusion: "first_tiny_signal_package_discovery_readback_verified";
  discovery_status: "compatible_signal_package_found";
  source_verification: "first_tiny_replay_dry_run_input_verified_no_signal_package";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  recommendation_rows_checked: 2;
  recommendation_snapshots_checked: 7;
  candidates_found: 9;
  compatible_candidates: 9;
  best_candidate_available: true;
  signal_package_available_now: true;
  signal_package_created_now: false;
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
  ready_for_signal_package_selection_plan: true;
  replay_allowed_now: false;
  synthetic_outcome_persistence_allowed_now: false;
  scanner_use_allowed_now: false;
  ranking_change_allowed_now: false;
  candidate_groups: FirstTinySignalPackageDiscoveryReadbackCandidateGroup[];
  candidates: FirstTinySignalPackageDiscoveryReadbackCandidate[];
  candidate_group_count: 2;
  early_group_cutoff: "2026-07-08T13:49:19Z";
  later_group_cutoff: "2026-07-08T16:47:52Z";
  final_candidate_selected: false;
  separate_selection_plan_required: true;
  blockers: [];
  warnings: [];
  recommended_next_steps: [
    "review_signal_package_candidates",
    "create_signal_package_selection_plan",
    "keep_synthetic_outcomes_scanner_and_ranking_disabled",
  ];
};

const candidates = [
  {
    candidate_id:
      "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
    source_type: "recommendation_row",
    generated_at: "2026-07-08T13:49:19.521608+00:00",
    analysis_cutoff: "2026-07-08T13:49:19.521608+00:00",
    direction: "long",
    entry: 304.86,
    stop: 295.62,
    target: 334.12,
    confidence_or_tier: "Low",
    setup_label: "UNKNOWN",
  },
  {
    candidate_id:
      "recommendation_row:f87978f3-9ffa-4105-9823-040c8497d55b",
    source_type: "recommendation_row",
    generated_at: "2026-07-08T16:47:52.441246+00:00",
    analysis_cutoff: "2026-07-08T16:47:52.441246+00:00",
    direction: "long",
    entry: 309.31,
    stop: 299.93,
    target: 338.98,
    confidence_or_tier: "Low",
    setup_label: "UNKNOWN",
  },
  {
    candidate_id: "recommendation_snapshot:rec_snap_g6m5eg",
    source_type: "recommendation_snapshot",
    generated_at: "2026-07-08T13:49:19.521+00:00",
    analysis_cutoff: "2026-07-08T13:49:19.521+00:00",
    direction: "long",
    entry: 307.94,
    stop: 295.62,
    target: 334.12,
    confidence_or_tier: null,
    setup_label: null,
  },
  {
    candidate_id: "recommendation_snapshot:rec_snap_74idsa",
    source_type: "recommendation_snapshot",
    generated_at: "2026-07-08T13:49:19.521+00:00",
    analysis_cutoff: "2026-07-08T13:49:19.521+00:00",
    direction: "long",
    entry: 307.94,
    stop: 295.62,
    target: 334.12,
    confidence_or_tier: 64,
    setup_label: null,
  },
  {
    candidate_id: "recommendation_snapshot:rec_snap_1vtsd7u",
    source_type: "recommendation_snapshot",
    generated_at: "2026-07-08T13:49:19.521+00:00",
    analysis_cutoff: "2026-07-08T13:49:19.521+00:00",
    direction: "long",
    entry: 307.94,
    stop: 295.62,
    target: 334.12,
    confidence_or_tier: 64,
    setup_label: null,
  },
  {
    candidate_id: "recommendation_snapshot:rec_snap_1viofd0",
    source_type: "recommendation_snapshot",
    generated_at: "2026-07-08T16:47:52.441+00:00",
    analysis_cutoff: "2026-07-08T16:47:52.441+00:00",
    direction: "long",
    entry: 312.43,
    stop: 299.93,
    target: 338.98,
    confidence_or_tier: null,
    setup_label: null,
  },
  {
    candidate_id: "recommendation_snapshot:rec_snap_g2fltu",
    source_type: "recommendation_snapshot",
    generated_at: "2026-07-08T16:47:52.441+00:00",
    analysis_cutoff: "2026-07-08T16:47:52.441+00:00",
    direction: "long",
    entry: 312.43,
    stop: 299.93,
    target: 338.98,
    confidence_or_tier: 60,
    setup_label: null,
  },
  {
    candidate_id: "recommendation_snapshot:rec_snap_1xkdli2",
    source_type: "recommendation_snapshot",
    generated_at: "2026-07-08T16:47:52.441+00:00",
    analysis_cutoff: "2026-07-08T16:47:52.441+00:00",
    direction: "long",
    entry: 312.43,
    stop: 299.93,
    target: 338.98,
    confidence_or_tier: 60,
    setup_label: null,
  },
  {
    candidate_id: "recommendation_snapshot:rec_snap_hz0rjq",
    source_type: "recommendation_snapshot",
    generated_at: "2026-07-08T16:47:52.441+00:00",
    analysis_cutoff: "2026-07-08T16:47:52.441+00:00",
    direction: "long",
    entry: 312.43,
    stop: 299.93,
    target: 338.98,
    confidence_or_tier: 60,
    setup_label: null,
  },
] satisfies FirstTinySignalPackageDiscoveryReadbackCandidate[];

const candidateGroups = [
  {
    group_id: "early_generation_group",
    cutoff_label: "2026-07-08T13:49:19Z",
    source_types: ["recommendation_row", "recommendation_snapshot"],
    candidate_ids: [
      "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
      "recommendation_snapshot:rec_snap_g6m5eg",
      "recommendation_snapshot:rec_snap_74idsa",
      "recommendation_snapshot:rec_snap_1vtsd7u",
    ],
    direction: "long",
    entry_range: {
      min: 304.86,
      max: 307.94,
    },
    stop: 295.62,
    target: 334.12,
    confidence_or_tier_values: ["Low", null, 64],
    confidence_or_tier_available: true,
    completeness: "complete",
    replay_suitability_notes: [
      "complete_entry_stop_target_direction",
      "multiple_snapshot_duplicates_require_selection_plan",
      "do_not_execute_replay_from_verification_step",
    ],
  },
  {
    group_id: "later_generation_group",
    cutoff_label: "2026-07-08T16:47:52Z",
    source_types: ["recommendation_row", "recommendation_snapshot"],
    candidate_ids: [
      "recommendation_row:f87978f3-9ffa-4105-9823-040c8497d55b",
      "recommendation_snapshot:rec_snap_1viofd0",
      "recommendation_snapshot:rec_snap_g2fltu",
      "recommendation_snapshot:rec_snap_1xkdli2",
      "recommendation_snapshot:rec_snap_hz0rjq",
    ],
    direction: "long",
    entry_range: {
      min: 309.31,
      max: 312.43,
    },
    stop: 299.93,
    target: 338.98,
    confidence_or_tier_values: ["Low", null, 60],
    confidence_or_tier_available: true,
    completeness: "complete",
    replay_suitability_notes: [
      "complete_entry_stop_target_direction",
      "multiple_snapshot_duplicates_require_selection_plan",
      "do_not_execute_replay_from_verification_step",
    ],
  },
] satisfies FirstTinySignalPackageDiscoveryReadbackCandidateGroup[];

export function buildFirstTinyHistoricalReplaySignalPackageDiscoveryReadbackResultVerification(): FirstTinySignalPackageDiscoveryReadbackResultVerificationSummary {
  return {
    verification_marker:
      firstTinyHistoricalReplaySignalPackageDiscoveryReadbackResultVerificationMarker,
    verification_status: "signal_package_discovery_readback_verified",
    conclusion: "first_tiny_signal_package_discovery_readback_verified",
    discovery_status: "compatible_signal_package_found",
    source_verification:
      "first_tiny_replay_dry_run_input_verified_no_signal_package",
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    recommendation_rows_checked: 2,
    recommendation_snapshots_checked: 7,
    candidates_found: 9,
    compatible_candidates: 9,
    best_candidate_available: true,
    signal_package_available_now: true,
    signal_package_created_now: false,
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
    ready_for_signal_package_selection_plan: true,
    replay_allowed_now: false,
    synthetic_outcome_persistence_allowed_now: false,
    scanner_use_allowed_now: false,
    ranking_change_allowed_now: false,
    candidate_groups: [...candidateGroups],
    candidates: [...candidates],
    candidate_group_count: 2,
    early_group_cutoff: "2026-07-08T13:49:19Z",
    later_group_cutoff: "2026-07-08T16:47:52Z",
    final_candidate_selected: false,
    separate_selection_plan_required: true,
    blockers: [],
    warnings: [],
    recommended_next_steps: [
      "review_signal_package_candidates",
      "create_signal_package_selection_plan",
      "keep_synthetic_outcomes_scanner_and_ranking_disabled",
    ],
  };
}
