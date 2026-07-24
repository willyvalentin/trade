export type TureIntelligenceLayerStatus =
  | "active"
  | "inactive"
  | "missing"
  | "needs_data";

export type TureIntelligenceSampleConfidence = "low" | "medium" | "high";

export type TureIntelligenceOverview = {
  advisory_only: true;
  active_layers: string[];
  inactive_layers: string[];
  layer_status: Record<
    string,
    {
      status: TureIntelligenceLayerStatus;
      advisory_only: boolean;
      summary: string;
      caution_flags: string[];
    }
  >;
  latest_batch_fingerprint: string | null;
  latest_evaluated_batch_fingerprint: string | null;
  data_readiness: {
    outcome_count: number;
    unique_snapshot_count: number;
    sample_confidence: TureIntelligenceSampleConfidence;
    enough_for_observation: boolean;
    enough_for_model_change: boolean;
    enough_for_live_ranking_change: false;
  };
  latest_signals: {
    market_regime: string | null;
    setup_mix: Record<string, number>;
    sector_mix: Record<string, number>;
    ticker_profile_status_mix: Record<string, number>;
    trade_quality_mix: Record<string, number>;
    confidence_bucket_mix: Record<string, number>;
  };
  primary_learning_signal: string | null;
  recommended_learning_focus: string[];
  recommended_next_action: string | null;
  safety: {
    automatic_model_updates_enabled: false;
    live_ranking_changes_enabled: false;
    broker_automation_enabled: false;
    requires_manual_review: true;
  };
  reason_codes: string[];
  caution_flags: string[];
  metadata_gaps: string[];
};

export type BuildIntelligenceOverviewInput = {
  latest_batch_fingerprint?: string | null;
  latest_evaluated_batch_fingerprint?: string | null;
  outcome_count?: number | null;
  unique_snapshot_count?: number | null;
  setup_labeling?: {
    advisory_mode?: boolean | null;
    known_setup_label_count?: number | null;
    unknown_setup_label_count?: number | null;
    setup_mix?: Record<string, number> | null;
  } | null;
  sector_industry_mapping?: {
    advisory_mode?: boolean | null;
    sector_mix?: Record<string, number> | null;
    low_confidence_mapping_count?: number | null;
  } | null;
  sector_group_breakdowns?: Array<{
    sample_confidence?: TureIntelligenceSampleConfidence | string | null;
  }> | null;
  ticker_profile_summary?: {
    advisory_mode?: boolean | null;
    profiles_built_count?: number | null;
    new_count?: number | null;
    observed_count?: number | null;
    trusted_count?: number | null;
    deprioritized_count?: number | null;
    unknown_count?: number | null;
    sample_confidence_low_count?: number | null;
    sample_confidence_medium_count?: number | null;
    sample_confidence_high_count?: number | null;
  } | null;
  market_regime?: {
    advisory_mode?: boolean | null;
    latest_evaluated_batch_regime_label?: string | null;
    latest_evaluated_batch_regime_confidence?: string | null;
  } | null;
  trade_quality_summary?: {
    advisory_mode?: boolean | null;
    overall_quality_mix?: Record<string, number> | null;
    most_common_weak_components?: Record<string, number> | null;
  } | null;
  confidence_calibration?: {
    advisory_only?: boolean | null;
    buckets?: Array<{ bucket: string; outcome_count: number }> | null;
    monotonicity_check?: {
      higher_confidence_outperforms_lower?: boolean | null;
      caution_flags?: string[] | null;
    } | null;
    sample_confidence?: TureIntelligenceSampleConfidence | string | null;
  } | null;
  model_governance?: {
    advisory_only?: boolean | null;
    current_intelligence_layers?: string[] | null;
    promotion_ready_changes?: string[] | null;
    safety?: {
      automatic_model_updates_enabled?: boolean | null;
      live_ranking_changes_enabled?: boolean | null;
      minimum_sample_size_required?: number | null;
    } | null;
  } | null;
  engine_adjustment_candidates?: Array<{
    candidate?: string | null;
    confidence?: string | null;
  }> | null;
  broker_automation_enabled?: boolean | null;
};

const expectedLayers = [
  "setup_labeling",
  "daily_learning_review",
  "sector_mapping",
  "ticker_profiles",
  "market_regime",
  "trade_quality",
  "confidence_calibration",
  "model_governance",
] as const;

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function sampleConfidence(outcomeCount: number): TureIntelligenceSampleConfidence {
  if (outcomeCount >= 100) return "high";
  if (outcomeCount >= 30) return "medium";
  return "low";
}

function recordFrom(value: Record<string, number> | null | undefined) {
  return Object.fromEntries(
    Object.entries(value ?? {}).filter(
      ([, count]) => typeof count === "number" && Number.isFinite(count),
    ),
  );
}

function confidenceBucketMix(
  buckets: Array<{ bucket: string; outcome_count: number }> | null | undefined,
) {
  const mix: Record<string, number> = {};

  for (const bucket of buckets ?? []) {
    if (bucket.outcome_count > 0) {
      mix[bucket.bucket] = bucket.outcome_count;
    }
  }

  return mix;
}

function addFocus(values: string[], focus: string) {
  if (!values.includes(focus)) values.push(focus);
}

function layerStatus(input: {
  present: boolean;
  hasData: boolean;
  summary: string;
  cautionFlags?: string[];
}): TureIntelligenceOverview["layer_status"][string] {
  const status: TureIntelligenceLayerStatus = !input.present
    ? "missing"
    : input.hasData
      ? "active"
      : "needs_data";

  return {
    status,
    advisory_only: true,
    summary: input.summary,
    caution_flags: input.cautionFlags ?? [],
  };
}

function topWeakComponent(
  components: Record<string, number> | null | undefined,
) {
  return Object.entries(components ?? {}).sort(
    (first, second) => second[1] - first[1],
  )[0]?.[0] ?? null;
}

function confidenceCalibrationStatus(
  value: boolean | null | undefined,
) {
  if (value === true) return "aligned";
  if (value === false) return "underperforming";
  return "inconclusive";
}

export function buildIntelligenceOverview(
  input: BuildIntelligenceOverviewInput | null | undefined = {},
): TureIntelligenceOverview {
  const safeInput = input ?? {};
  const outcomeCount = finiteNumber(safeInput.outcome_count) ?? 0;
  const uniqueSnapshotCount =
    finiteNumber(safeInput.unique_snapshot_count) ?? outcomeCount;
  const sample = sampleConfidence(outcomeCount);
  const confidenceMonotonicity =
    safeInput.confidence_calibration?.monotonicity_check
      ?.higher_confidence_outperforms_lower ?? null;
  const readinessMinimum =
    safeInput.model_governance?.safety?.minimum_sample_size_required ?? 100;
  const governancePromotionReady =
    (safeInput.model_governance?.promotion_ready_changes ?? []).length > 0;
  const enoughForModelChange =
    outcomeCount >= readinessMinimum && governancePromotionReady;
  const tickerStatusMix = {
    new: safeInput.ticker_profile_summary?.new_count ?? 0,
    observed: safeInput.ticker_profile_summary?.observed_count ?? 0,
    trusted: safeInput.ticker_profile_summary?.trusted_count ?? 0,
    deprioritized: safeInput.ticker_profile_summary?.deprioritized_count ?? 0,
    unknown: safeInput.ticker_profile_summary?.unknown_count ?? 0,
  };
  const setupMix = recordFrom(safeInput.setup_labeling?.setup_mix);
  const sectorMix = recordFrom(safeInput.sector_industry_mapping?.sector_mix);
  const tradeQualityMix = recordFrom(
    safeInput.trade_quality_summary?.overall_quality_mix,
  );
  const confidenceMix = confidenceBucketMix(
    safeInput.confidence_calibration?.buckets,
  );
  const weakComponent = topWeakComponent(
    safeInput.trade_quality_summary?.most_common_weak_components,
  );
  const focus: string[] = [];
  const reasonCodes: string[] = ["read_only_intelligence_overview"];
  const cautionFlags: string[] = [];
  const metadataGaps: string[] = [];

  if (outcomeCount === 0) {
    addFocus(focus, "collect_more_data");
    cautionFlags.push("no_evaluated_outcomes");
  } else if (sample === "low") {
    addFocus(focus, "collect_more_data");
    cautionFlags.push("insufficient_sample_size");
  }

  if (weakComponent === "market_regime_support") {
    addFocus(focus, "review_market_regime_support");
  }
  if (confidenceMonotonicity === null) {
    addFocus(focus, "collect_more_confidence_calibration_data");
  } else if (confidenceMonotonicity === false) {
    addFocus(focus, "review_confidence_calibration");
  }

  if (
    (safeInput.ticker_profile_summary?.profiles_built_count ?? 0) > 0 &&
    (safeInput.ticker_profile_summary?.sample_confidence_low_count ?? 0) >=
      (safeInput.ticker_profile_summary?.profiles_built_count ?? 0)
  ) {
    addFocus(focus, "collect_more_ticker_profile_data");
  }

  if (
    (safeInput.sector_group_breakdowns ?? []).length > 0 &&
    (safeInput.sector_group_breakdowns ?? []).every(
      (item) => item.sample_confidence === "low",
    )
  ) {
    addFocus(focus, "collect_more_sector_outcomes");
  }

  if ((safeInput.setup_labeling?.unknown_setup_label_count ?? 0) > 0) {
    addFocus(focus, "improve_setup_label_metadata");
  }

  for (const item of safeInput.engine_adjustment_candidates ?? []) {
    if (item.candidate === "entry_not_triggering") {
      addFocus(focus, "review_entry_timing");
    }
    if (item.candidate === "weak_follow_through") {
      addFocus(focus, "review_follow_through_filters");
    }
  }

  if (!safeInput.setup_labeling) metadataGaps.push("missing_setup_labeling");
  if (!safeInput.sector_industry_mapping) metadataGaps.push("missing_sector_mapping");
  if (!safeInput.ticker_profile_summary) metadataGaps.push("missing_ticker_profiles");
  if (!safeInput.market_regime) metadataGaps.push("missing_market_regime");
  if (!safeInput.trade_quality_summary) metadataGaps.push("missing_trade_quality");
  if (!safeInput.confidence_calibration) metadataGaps.push("missing_confidence_calibration");
  if (!safeInput.model_governance) metadataGaps.push("missing_model_governance");

  const layer_status = {
    setup_labeling: layerStatus({
      present: Boolean(safeInput.setup_labeling),
      hasData: (safeInput.setup_labeling?.known_setup_label_count ?? 0) > 0,
      summary: `${safeInput.setup_labeling?.known_setup_label_count ?? 0} known / ${safeInput.setup_labeling?.unknown_setup_label_count ?? 0} unknown`,
      cautionFlags:
        (safeInput.setup_labeling?.unknown_setup_label_count ?? 0) > 0
          ? ["unknown_setup_labels_present"]
          : [],
    }),
    daily_learning_review: layerStatus({
      present: true,
      hasData: outcomeCount > 0,
      summary: `${outcomeCount} outcomes analyzed`,
      cautionFlags: outcomeCount === 0 ? ["no_outcomes_analyzed"] : [],
    }),
    sector_mapping: layerStatus({
      present: Boolean(safeInput.sector_industry_mapping),
      hasData: Object.keys(sectorMix).length > 0,
      summary: `${Object.keys(sectorMix).length} sectors present`,
      cautionFlags:
        (safeInput.sector_industry_mapping?.low_confidence_mapping_count ?? 0) >
        0
          ? ["low_confidence_sector_mapping"]
          : [],
    }),
    ticker_profiles: layerStatus({
      present: Boolean(safeInput.ticker_profile_summary),
      hasData: (safeInput.ticker_profile_summary?.profiles_built_count ?? 0) > 0,
      summary: `${safeInput.ticker_profile_summary?.profiles_built_count ?? 0} profiles built`,
      cautionFlags:
        (safeInput.ticker_profile_summary?.sample_confidence_low_count ?? 0) > 0
          ? ["low_sample_ticker_profiles"]
          : [],
    }),
    market_regime: layerStatus({
      present: Boolean(safeInput.market_regime),
      hasData: Boolean(safeInput.market_regime?.latest_evaluated_batch_regime_label),
      summary:
        safeInput.market_regime?.latest_evaluated_batch_regime_label ??
        "unknown",
    }),
    trade_quality: layerStatus({
      present: Boolean(safeInput.trade_quality_summary),
      hasData: Object.keys(tradeQualityMix).some(
        (key) => (tradeQualityMix[key] ?? 0) > 0,
      ),
      summary: `quality mix ${Object.keys(tradeQualityMix).length} labels`,
      cautionFlags: weakComponent ? [`weak_${weakComponent}`] : [],
    }),
    confidence_calibration: layerStatus({
      present: Boolean(safeInput.confidence_calibration),
      hasData: Object.keys(confidenceMix).length > 0,
      summary: confidenceCalibrationStatus(confidenceMonotonicity),
      cautionFlags:
        safeInput.confidence_calibration?.monotonicity_check?.caution_flags ??
        [],
    }),
    model_governance: layerStatus({
      present: Boolean(safeInput.model_governance),
      hasData: Boolean(safeInput.model_governance?.advisory_only),
      summary: "advisory-only / live ranking disabled",
    }),
  } satisfies TureIntelligenceOverview["layer_status"];

  const activeLayers = expectedLayers.filter(
    (layer) => layer_status[layer].status === "active",
  );
  const inactiveLayers = expectedLayers.filter(
    (layer) => layer_status[layer].status !== "active",
  );
  const primaryLearningSignal = focus[0] ?? null;

  return {
    advisory_only: true,
    active_layers: activeLayers,
    inactive_layers: inactiveLayers,
    layer_status,
    latest_batch_fingerprint: safeInput.latest_batch_fingerprint ?? null,
    latest_evaluated_batch_fingerprint:
      safeInput.latest_evaluated_batch_fingerprint ?? null,
    data_readiness: {
      outcome_count: outcomeCount,
      unique_snapshot_count: uniqueSnapshotCount,
      sample_confidence: sample,
      enough_for_observation: outcomeCount > 0,
      enough_for_model_change: enoughForModelChange,
      enough_for_live_ranking_change: false,
    },
    latest_signals: {
      market_regime:
        safeInput.market_regime?.latest_evaluated_batch_regime_label ?? null,
      setup_mix: setupMix,
      sector_mix: sectorMix,
      ticker_profile_status_mix: tickerStatusMix,
      trade_quality_mix: tradeQualityMix,
      confidence_bucket_mix: confidenceMix,
    },
    primary_learning_signal: primaryLearningSignal,
    recommended_learning_focus: focus,
    recommended_next_action:
      primaryLearningSignal === null
        ? "continue_collecting_learning_samples"
        : primaryLearningSignal,
    safety: {
      automatic_model_updates_enabled: false,
      live_ranking_changes_enabled: false,
      broker_automation_enabled: false,
      requires_manual_review: true,
    },
    reason_codes: reasonCodes,
    caution_flags: Array.from(new Set(cautionFlags)),
    metadata_gaps: metadataGaps,
  };
}
