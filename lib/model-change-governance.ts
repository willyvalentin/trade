export type TureModelChangeType =
  | "scoring_model"
  | "confidence_calibration"
  | "setup_labeling"
  | "market_regime_labeling"
  | "sector_weighting"
  | "ticker_weighting"
  | "entry_timing"
  | "target_stop_calibration"
  | "trade_quality_decomposition"
  | "recommendation_thresholds"
  | "strategy_selection"
  | "execution_policy"
  | "risk_policy"
  | "diagnostics_only"
  | "unknown";

export type TureModelChangeStatus =
  | "proposed"
  | "advisory_only"
  | "shadow_testing"
  | "active"
  | "paused"
  | "rejected"
  | "rolled_back"
  | "deprecated";

export type TureModelPromotionRequirement =
  | "minimum_outcome_count_100"
  | "minimum_unique_snapshot_count_30"
  | "multi_day_validation_required"
  | "no_severe_diagnostics_warnings"
  | "no_daily_learning_review_regression"
  | "rollback_plan_exists"
  | "manual_approval_required";

export type TureModelChangeRecord = {
  id: string;
  version: string;
  change_type: TureModelChangeType;
  status: TureModelChangeStatus;
  title: string;
  description: string;
  hypothesis: string;
  expected_metric_impact: string[];
  affected_surfaces: string[];
  safety_scope: string;
  rollout_status: string;
  rollback_available: boolean;
  introduced_action_number: number | null;
  introduced_at: string | null;
  minimum_sample_size_before_promotion: number;
  promotion_requirements: TureModelPromotionRequirement[];
  advisory_only: true;
};

export type TureModelGovernanceSummary = {
  advisory_only: true;
  current_engine_version: string | null;
  current_scoring_version: string | null;
  current_confidence_version: string | null;
  current_entry_model_version: string | null;
  current_target_stop_version: string | null;
  active_changes: TureModelChangeRecord[];
  proposed_changes: TureModelChangeRecord[];
  advisory_only_changes: TureModelChangeRecord[];
  shadow_testing_changes: TureModelChangeRecord[];
  rejected_changes: TureModelChangeRecord[];
  rolled_back_changes: TureModelChangeRecord[];
  latest_change: TureModelChangeRecord | null;
  current_intelligence_layers: string[];
  promotion_ready_changes: string[];
  changes_needing_more_data: string[];
  summary: {
    total_changes: number;
    active_count: number;
    advisory_only_count: number;
    shadow_testing_count: number;
    rejected_count: number;
    rolled_back_count: number;
    changes_by_type: Record<string, number>;
    changes_by_status: Record<string, number>;
  };
  safety: {
    live_ranking_changes_enabled: false;
    automatic_model_updates_enabled: false;
    rollback_required_for_live_changes: true;
    minimum_sample_size_required: number;
  };
  reason_codes: string[];
  caution_flags: string[];
  metadata_gaps: string[];
};

export type BuildModelGovernanceSummaryInput = {
  records?: TureModelChangeRecord[] | null;
  current_engine_version?: string | null;
  current_scoring_version?: string | null;
  current_confidence_version?: string | null;
  current_entry_model_version?: string | null;
  current_target_stop_version?: string | null;
  minimum_sample_size_required?: number | null;
};

const defaultPromotionRequirements: TureModelPromotionRequirement[] = [
  "minimum_outcome_count_100",
  "minimum_unique_snapshot_count_30",
  "multi_day_validation_required",
  "no_severe_diagnostics_warnings",
  "no_daily_learning_review_regression",
  "rollback_plan_exists",
  "manual_approval_required",
];

export const staticModelGovernanceRegistry: TureModelChangeRecord[] = [
  {
    id: "setup_labeling_v1_advisory",
    version: "setup_labeling_v1",
    change_type: "setup_labeling",
    status: "advisory_only",
    title: "Strategy / setup labeling foundation",
    description:
      "Classifies evaluated outcomes by deterministic setup family for readback and diagnostics.",
    hypothesis:
      "Setup-family readback will reveal which strategy patterns deserve future tuning.",
    expected_metric_impact: ["setup_outcome_grouping", "strategy_selection_review"],
    affected_surfaces: ["daily_learning_review", "market_diagnostics"],
    safety_scope: "read_only_advisory",
    rollout_status: "advisory_readback_only",
    rollback_available: true,
    introduced_action_number: 234,
    introduced_at: null,
    minimum_sample_size_before_promotion: 100,
    promotion_requirements: defaultPromotionRequirements,
    advisory_only: true,
  },
  {
    id: "daily_learning_review_v2_advisory",
    version: "daily_learning_review_v2",
    change_type: "diagnostics_only",
    status: "advisory_only",
    title: "Daily Learning Review v2",
    description:
      "Summarizes visible, research-only, and unknown outcome performance for the trading day.",
    hypothesis:
      "Daily outcome readback will make engine weaknesses visible before any scoring change.",
    expected_metric_impact: ["learning_review_quality", "sample_split_visibility"],
    affected_surfaces: ["daily_learning_review", "market_diagnostics"],
    safety_scope: "read_only_advisory",
    rollout_status: "advisory_readback_only",
    rollback_available: true,
    introduced_action_number: 235,
    introduced_at: null,
    minimum_sample_size_before_promotion: 100,
    promotion_requirements: defaultPromotionRequirements,
    advisory_only: true,
  },
  {
    id: "sector_industry_mapping_v1_advisory",
    version: "sector_mapping_v1",
    change_type: "sector_weighting",
    status: "advisory_only",
    title: "Sector / industry mapping foundation",
    description:
      "Maps evaluated tickers to sector and industry groups for read-only outcome review.",
    hypothesis:
      "Sector and industry groupings will identify market leadership and weak cohorts.",
    expected_metric_impact: ["sector_outcome_grouping", "sector_rotation_review"],
    affected_surfaces: ["daily_learning_review", "market_diagnostics"],
    safety_scope: "read_only_advisory",
    rollout_status: "advisory_readback_only",
    rollback_available: true,
    introduced_action_number: 236,
    introduced_at: null,
    minimum_sample_size_before_promotion: 100,
    promotion_requirements: defaultPromotionRequirements,
    advisory_only: true,
  },
  {
    id: "ticker_profile_v1_advisory",
    version: "ticker_profile_v1",
    change_type: "ticker_weighting",
    status: "advisory_only",
    title: "Ticker profile foundation",
    description:
      "Builds per-ticker readback profiles from evaluated visible and research-only outcomes.",
    hypothesis:
      "Ticker-level performance profiles will identify candidates needing more evidence or deprioritization.",
    expected_metric_impact: ["ticker_confidence_review", "ticker_followthrough_review"],
    affected_surfaces: ["daily_learning_review", "market_diagnostics"],
    safety_scope: "read_only_advisory",
    rollout_status: "advisory_readback_only",
    rollback_available: true,
    introduced_action_number: 237,
    introduced_at: null,
    minimum_sample_size_before_promotion: 100,
    promotion_requirements: defaultPromotionRequirements,
    advisory_only: true,
  },
  {
    id: "market_regime_labeling_v1_advisory",
    version: "market_regime_v1",
    change_type: "market_regime_labeling",
    status: "advisory_only",
    title: "Market regime label foundation",
    description:
      "Labels evaluated batches with deterministic market regime context for advisory review.",
    hypothesis:
      "Regime readback will show when long setups need stronger confirmation.",
    expected_metric_impact: ["regime_outcome_grouping", "risk_context_review"],
    affected_surfaces: ["daily_learning_review", "market_diagnostics"],
    safety_scope: "read_only_advisory",
    rollout_status: "advisory_readback_only",
    rollback_available: true,
    introduced_action_number: 238,
    introduced_at: null,
    minimum_sample_size_before_promotion: 100,
    promotion_requirements: defaultPromotionRequirements,
    advisory_only: true,
  },
  {
    id: "trade_quality_decomposition_v1_advisory",
    version: "trade_quality_v1",
    change_type: "trade_quality_decomposition",
    status: "advisory_only",
    title: "Trade quality score decomposition",
    description:
      "Decomposes evaluated ideas into advisory setup, entry, risk, volume, trend, sector, ticker, regime, and data quality components.",
    hypothesis:
      "Component-level quality readback will explain why ideas worked or failed.",
    expected_metric_impact: ["quality_component_review", "engine_adjustment_review"],
    affected_surfaces: ["daily_learning_review", "market_diagnostics"],
    safety_scope: "read_only_advisory",
    rollout_status: "advisory_readback_only",
    rollback_available: true,
    introduced_action_number: 239,
    introduced_at: null,
    minimum_sample_size_before_promotion: 100,
    promotion_requirements: defaultPromotionRequirements,
    advisory_only: true,
  },
  {
    id: "confidence_calibration_v1_advisory",
    version: "confidence_calibration_v1",
    change_type: "confidence_calibration",
    status: "advisory_only",
    title: "Confidence calibration buckets",
    description:
      "Groups evaluated outcomes by confidence bucket to test whether higher confidence ideas outperform lower confidence ideas.",
    hypothesis:
      "Confidence buckets will reveal whether recommendation confidence is calibrated.",
    expected_metric_impact: ["confidence_calibration_review", "monotonicity_review"],
    affected_surfaces: ["daily_learning_review", "market_diagnostics"],
    safety_scope: "read_only_advisory",
    rollout_status: "advisory_readback_only",
    rollback_available: true,
    introduced_action_number: 240,
    introduced_at: null,
    minimum_sample_size_before_promotion: 100,
    promotion_requirements: defaultPromotionRequirements,
    advisory_only: true,
  },
];

function increment(record: Record<string, number>, key: string) {
  record[key] = (record[key] ?? 0) + 1;
}

function sortByAction(records: TureModelChangeRecord[]) {
  return [...records].sort(
    (first, second) =>
      (second.introduced_action_number ?? -1) -
      (first.introduced_action_number ?? -1),
  );
}

export function buildModelGovernanceSummary(
  input: BuildModelGovernanceSummaryInput | null | undefined = {},
): TureModelGovernanceSummary {
  const safeInput = input ?? {};
  const records = safeInput.records ?? staticModelGovernanceRegistry;
  const changesByType: Record<string, number> = {};
  const changesByStatus: Record<string, number> = {};
  const minimumSampleSizeRequired =
    safeInput.minimum_sample_size_required ?? 100;

  for (const record of records) {
    increment(changesByType, record.change_type);
    increment(changesByStatus, record.status);
  }

  const activeChanges = records.filter((record) => record.status === "active");
  const proposedChanges = records.filter((record) => record.status === "proposed");
  const advisoryOnlyChanges = records.filter(
    (record) => record.status === "advisory_only",
  );
  const shadowTestingChanges = records.filter(
    (record) => record.status === "shadow_testing",
  );
  const rejectedChanges = records.filter((record) => record.status === "rejected");
  const rolledBackChanges = records.filter(
    (record) => record.status === "rolled_back",
  );
  const latestChange = sortByAction(records)[0] ?? null;
  const promotionReadyChanges = records
    .filter(
      (record) =>
        record.status === "shadow_testing" &&
        record.rollback_available &&
        record.minimum_sample_size_before_promotion <= minimumSampleSizeRequired,
    )
    .map((record) => record.id);
  const changesNeedingMoreData = records
    .filter(
      (record) =>
        record.status === "advisory_only" ||
        record.minimum_sample_size_before_promotion > minimumSampleSizeRequired,
    )
    .map((record) => record.id);
  const metadataGaps = records.some((record) => record.introduced_at === null)
    ? ["missing_introduced_at"]
    : [];

  return {
    advisory_only: true,
    current_engine_version: safeInput.current_engine_version ?? "engine_static_v1",
    current_scoring_version:
      safeInput.current_scoring_version ?? "scoring_static_v1",
    current_confidence_version:
      safeInput.current_confidence_version ?? "confidence_calibration_v1",
    current_entry_model_version:
      safeInput.current_entry_model_version ?? "entry_model_static_v1",
    current_target_stop_version:
      safeInput.current_target_stop_version ?? "target_stop_static_v1",
    active_changes: activeChanges,
    proposed_changes: proposedChanges,
    advisory_only_changes: advisoryOnlyChanges,
    shadow_testing_changes: shadowTestingChanges,
    rejected_changes: rejectedChanges,
    rolled_back_changes: rolledBackChanges,
    latest_change: latestChange,
    current_intelligence_layers: advisoryOnlyChanges.map(
      (record) => record.version,
    ),
    promotion_ready_changes: promotionReadyChanges,
    changes_needing_more_data: changesNeedingMoreData,
    summary: {
      total_changes: records.length,
      active_count: activeChanges.length,
      advisory_only_count: advisoryOnlyChanges.length,
      shadow_testing_count: shadowTestingChanges.length,
      rejected_count: rejectedChanges.length,
      rolled_back_count: rolledBackChanges.length,
      changes_by_type: changesByType,
      changes_by_status: changesByStatus,
    },
    safety: {
      live_ranking_changes_enabled: false,
      automatic_model_updates_enabled: false,
      rollback_required_for_live_changes: true,
      minimum_sample_size_required: minimumSampleSizeRequired,
    },
    reason_codes: [
      "static_governance_registry",
      "manual_approval_required_for_promotion",
      "rollback_required_for_live_changes",
    ],
    caution_flags:
      promotionReadyChanges.length > 0
        ? ["promotion_requires_manual_review"]
        : ["all_changes_advisory_only"],
    metadata_gaps: metadataGaps,
  };
}
