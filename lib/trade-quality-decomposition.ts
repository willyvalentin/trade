export type TureTradeQualityLabel =
  | "weak"
  | "fair"
  | "good"
  | "strong"
  | "unknown";

export type TureTradeQualityComponentName =
  | "setup_quality"
  | "entry_quality"
  | "risk_reward_quality"
  | "volume_quality"
  | "trend_quality"
  | "sector_support"
  | "ticker_confidence_support"
  | "market_regime_support"
  | "data_quality";

export type TureTradeQualityComponent = {
  score: number | null;
  label: TureTradeQualityLabel;
  reason_codes: string[];
  caution_flags: string[];
};

export type TureTradeQualityScore = {
  score: number | null;
  label: TureTradeQualityLabel;
};

export type TureTradeQualityDecomposition = {
  ticker: string;
  snapshot_identity: string | null;
  overall_quality_label: TureTradeQualityLabel;
  overall_quality_score: number | null;
  components: Record<TureTradeQualityComponentName, TureTradeQualityComponent>;
  strongest_components: TureTradeQualityComponentName[];
  weakest_components: TureTradeQualityComponentName[];
  reason_codes: string[];
  caution_flags: string[];
  metadata_gaps: string[];
  advisory_only: true;
};

export type TureTradeQualityGroupSummary = {
  key: string;
  outcome_count: number;
  average_quality_score: number | null;
  average_quality_label: TureTradeQualityLabel;
  quality_mix: Record<TureTradeQualityLabel, number>;
};

export type TureTradeQualityDecompositionSummary = {
  advisory_mode: true;
  current_batch_decomposed_count: number;
  current_batch_total_count: number;
  overall_quality_mix: Record<TureTradeQualityLabel, number>;
  component_average_scores: Partial<Record<TureTradeQualityComponentName, number | null>>;
  most_common_weak_components: Record<TureTradeQualityComponentName, number>;
  most_common_strong_components: Record<TureTradeQualityComponentName, number>;
  metadata_gaps: Record<string, number>;
  reason_codes: Record<string, number>;
  caution_flags: Record<string, number>;
  quality_by_setup_family: TureTradeQualityGroupSummary[];
  quality_by_sector: TureTradeQualityGroupSummary[];
  quality_by_ticker: TureTradeQualityGroupSummary[];
  quality_by_market_regime: TureTradeQualityGroupSummary[];
  low_confidence_quality_rows: number;
};

export type BuildTradeQualityDecompositionInput = {
  ticker?: string | null;
  snapshot_identity?: string | null;
  side?: string | null;
  visibility?: string | null;
  tier?: string | null;
  confidence?: number | null;
  setup_family?: string | null;
  setup_confidence?: string | null;
  entry_type?: string | null;
  entry_trigger_semantics?: string | null;
  entry_triggered?: boolean | null;
  entry_not_triggered?: boolean | null;
  entry?: number | null;
  entry_low?: number | null;
  entry_high?: number | null;
  stop?: number | null;
  target?: number | null;
  planned_risk_reward?: number | null;
  plan_freshness_classification?: string | null;
  volume_context?: string | null;
  trend_context?: string | null;
  sector_group?: string | null;
  sector_mapping_source?: string | null;
  ticker_status?: string | null;
  ticker_confidence?: string | null;
  ticker_caution_flags?: string[];
  market_regime_label?: string | null;
  market_regime_confidence?: string | null;
  market_regime_caution_flags?: string[];
  provider?: string | null;
  source?: string | null;
  data_timestamp?: string | null;
  reference_timestamp?: string | null;
  reference_price_present?: boolean | null;
  metadata_gap_flags?: string[];
};

export type TradeQualitySummaryInputRow = {
  decomposition: TureTradeQualityDecomposition;
  setup_family?: string | null;
  sector_group?: string | null;
  ticker?: string | null;
  market_regime_label?: string | null;
  current_batch?: boolean;
};

const componentNames: TureTradeQualityComponentName[] = [
  "setup_quality",
  "entry_quality",
  "risk_reward_quality",
  "volume_quality",
  "trend_quality",
  "sector_support",
  "ticker_confidence_support",
  "market_regime_support",
  "data_quality",
];

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 ? ticker : "UNKNOWN";
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function labelForScore(score: number | null): TureTradeQualityLabel {
  if (score === null) return "unknown";
  if (score >= 85) return "strong";
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  return "weak";
}

function component(
  score: number | null,
  reasonCodes: string[] = [],
  cautionFlags: string[] = [],
): TureTradeQualityComponent {
  return {
    score,
    label: labelForScore(score),
    reason_codes: reasonCodes,
    caution_flags: cautionFlags,
  };
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function average(values: Array<number | null | undefined>) {
  const finiteValues = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );

  return finiteValues.length > 0
    ? finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length
    : null;
}

function plannedRiskReward(input: BuildTradeQualityDecompositionInput) {
  const explicit = finiteNumber(input.planned_risk_reward);
  if (explicit !== null) return explicit;

  const entry =
    finiteNumber(input.entry) ??
    average([finiteNumber(input.entry_low), finiteNumber(input.entry_high)]);
  const stop = finiteNumber(input.stop);
  const target = finiteNumber(input.target);
  const side = normalizeText(input.side || "long");

  if (entry === null || stop === null || target === null) return null;

  const risk = side === "short" ? stop - entry : entry - stop;
  const reward = side === "short" ? entry - target : target - entry;

  if (risk <= 0 || reward <= 0) return null;
  return reward / risk;
}

function setupQuality(input: BuildTradeQualityDecompositionInput) {
  const family = normalizeText(input.setup_family);
  const confidence = normalizeText(input.setup_confidence);

  if (!family || family === "unknown") {
    return component(null, [], ["insufficient_setup_metadata"]);
  }

  if (confidence === "high") {
    return component(90, ["known_setup_family", "high_setup_label_confidence"]);
  }
  if (confidence === "medium") {
    return component(78, ["known_setup_family", "medium_setup_label_confidence"]);
  }

  return component(60, ["known_setup_family"], ["low_setup_label_confidence"]);
}

function entryQuality(input: BuildTradeQualityDecompositionInput) {
  const entryType = normalizeText(input.entry_type);
  const freshness = normalizeText(input.plan_freshness_classification);
  const reasons: string[] = [];
  const cautions: string[] = [];

  if (!entryType || entryType === "unknown") {
    cautions.push("missing_entry_type_metadata");
  } else {
    reasons.push("known_entry_type");
  }

  if (input.entry_not_triggered === true) {
    return component(35, reasons, [...cautions, "entry_not_triggered"]);
  }

  if (freshness === "fresh") {
    reasons.push("fresh_plan_price");
  } else if (freshness === "slightly_stale") {
    reasons.push("slightly_stale_plan_price");
  } else if (freshness === "stale" || freshness === "severe" || freshness === "severe_stale") {
    cautions.push("stale_plan_price");
  } else {
    cautions.push("missing_plan_freshness");
  }

  if (!entryType || entryType === "unknown") {
    return component(null, reasons, cautions);
  }

  if (cautions.includes("stale_plan_price")) return component(45, reasons, cautions);
  if (freshness === "fresh") return component(82, reasons, cautions);
  if (freshness === "slightly_stale") return component(70, reasons, cautions);
  return component(62, reasons, cautions);
}

function riskRewardQuality(input: BuildTradeQualityDecompositionInput) {
  const rr = plannedRiskReward(input);
  const entry =
    finiteNumber(input.entry) ??
    average([finiteNumber(input.entry_low), finiteNumber(input.entry_high)]);
  const stop = finiteNumber(input.stop);
  const target = finiteNumber(input.target);
  const reasons: string[] = [];

  if (entry === null || stop === null || target === null) {
    return component(null, [], ["missing_entry_stop_target"]);
  }
  if (rr === null) {
    return component(25, [], ["invalid_risk_geometry"]);
  }

  reasons.push("valid_risk_geometry");
  if (rr >= 2) return component(85, [...reasons, "strong_planned_risk_reward"]);
  if (rr >= 1.5) return component(72, [...reasons, "acceptable_planned_risk_reward"]);
  if (rr >= 1) return component(50, reasons, ["thin_planned_risk_reward"]);
  return component(35, reasons, ["poor_planned_risk_reward"]);
}

function volumeQuality(input: BuildTradeQualityDecompositionInput) {
  const volume = normalizeText(input.volume_context);

  if (!volume) return component(null, [], ["volume_context_missing"]);
  if (includesAny(volume, ["high volume", "relative volume", "rvol", "unusual volume", "expanding"])) {
    return component(80, ["supportive_volume_context"]);
  }
  if (includesAny(volume, ["contracting", "low volume", "thin"])) {
    return component(40, [], ["weak_volume_context"]);
  }
  return component(62, ["volume_context_present"]);
}

function trendQuality(input: BuildTradeQualityDecompositionInput) {
  const trend = normalizeText(input.trend_context);
  const side = normalizeText(input.side || "long");

  if (!trend) return component(null, [], ["trend_context_missing"]);
  if (
    side !== "short" &&
    includesAny(trend, ["negative momentum", "bearish", "risk_off", "choppy"])
  ) {
    return component(35, [], ["negative_trend_for_long"]);
  }
  if (includesAny(trend, ["positive momentum", "strong trend", "clean uptrend", "above ma20", "above ma50"])) {
    return component(82, ["supportive_trend_context"]);
  }
  return component(58, ["trend_context_present"]);
}

function sectorSupport(input: BuildTradeQualityDecompositionInput) {
  const source = normalizeText(input.sector_mapping_source);
  const sector = normalizeText(input.sector_group);

  if (!sector || sector === "unknown" || source === "unknown") {
    return component(null, [], ["unknown_sector_mapping"]);
  }

  return component(68, ["known_sector_mapping"]);
}

function tickerConfidenceSupport(input: BuildTradeQualityDecompositionInput) {
  const status = normalizeText(input.ticker_status);
  const confidence = normalizeText(input.ticker_confidence);
  const cautions = input.ticker_caution_flags ?? [];

  if (!status || status === "unknown") {
    return component(null, [], ["unknown_ticker_profile"]);
  }
  if (status === "trusted" && confidence === "high") {
    return component(88, ["trusted_ticker_profile"]);
  }
  if (status === "observed" && (confidence === "medium" || confidence === "high")) {
    return component(74, ["observed_ticker_profile"]);
  }
  if (status === "deprioritized") {
    return component(30, [], ["deprioritized_ticker_profile"]);
  }
  if (cautions.includes("insufficient_outcome_history") || status === "new") {
    return component(52, ["new_ticker_profile"], ["insufficient_outcome_history"]);
  }

  return component(60, ["ticker_profile_available"]);
}

function marketRegimeSupport(input: BuildTradeQualityDecompositionInput) {
  const regime = normalizeText(input.market_regime_label);
  const side = normalizeText(input.side || "long");

  if (!regime || regime === "unknown") {
    return component(null, [], ["unknown_market_regime"]);
  }
  if (side !== "short" && (regime === "risk_off" || regime === "choppy")) {
    return component(35, [], [`${regime}_long_requires_confirmation`]);
  }
  if (side !== "short" && (regime === "risk_on" || regime === "trend_day_candidate")) {
    return component(82, ["market_regime_supports_long"]);
  }
  if (regime === "sector_rotation" || regime === "mixed") {
    return component(58, ["mixed_market_regime_context"]);
  }

  return component(60, ["market_regime_available"]);
}

function dataQuality(input: BuildTradeQualityDecompositionInput) {
  const reasons: string[] = [];
  const cautions: string[] = [];

  if (normalizeText(input.provider) || normalizeText(input.source)) {
    reasons.push("provider_source_present");
  } else {
    cautions.push("missing_provider_source");
  }
  if (normalizeText(input.data_timestamp) || normalizeText(input.reference_timestamp)) {
    reasons.push("provider_timestamp_present");
  } else {
    cautions.push("missing_data_timestamp");
  }
  if (input.reference_price_present === true) {
    reasons.push("reference_price_present");
  } else if (input.reference_price_present === false) {
    cautions.push("missing_reference_price");
  }

  for (const gap of input.metadata_gap_flags ?? []) {
    cautions.push(gap);
  }

  if (reasons.length === 0 && cautions.length > 0) return component(35, reasons, cautions);
  if (cautions.length === 0 && reasons.length >= 2) return component(86, reasons);
  if (reasons.length > 0) return component(68, reasons, cautions);
  return component(null, reasons, ["data_quality_metadata_missing"]);
}

function strongestWeakest(
  components: Record<TureTradeQualityComponentName, TureTradeQualityComponent>,
  direction: "strongest" | "weakest",
) {
  return componentNames
    .filter((name) => components[name].score !== null)
    .sort((first, second) =>
      direction === "strongest"
        ? (components[second].score ?? 0) - (components[first].score ?? 0)
        : (components[first].score ?? 0) - (components[second].score ?? 0),
    )
    .slice(0, 3);
}

export function buildTradeQualityDecomposition(
  input: BuildTradeQualityDecompositionInput | null | undefined = {},
): TureTradeQualityDecomposition {
  const safeInput = input ?? {};
  const components = {
    setup_quality: setupQuality(safeInput),
    entry_quality: entryQuality(safeInput),
    risk_reward_quality: riskRewardQuality(safeInput),
    volume_quality: volumeQuality(safeInput),
    trend_quality: trendQuality(safeInput),
    sector_support: sectorSupport(safeInput),
    ticker_confidence_support: tickerConfidenceSupport(safeInput),
    market_regime_support: marketRegimeSupport(safeInput),
    data_quality: dataQuality(safeInput),
  } satisfies Record<TureTradeQualityComponentName, TureTradeQualityComponent>;
  const overallScore = average(componentNames.map((name) => components[name].score));
  const reasonCodes = unique(
    componentNames.flatMap((name) => components[name].reason_codes),
  );
  const cautionFlags = unique(
    componentNames.flatMap((name) => components[name].caution_flags),
  );
  const metadataGaps = cautionFlags.filter(
    (flag) =>
      flag.includes("missing") ||
      flag.includes("unknown") ||
      flag.includes("insufficient"),
  );

  return {
    ticker: normalizeTicker(safeInput.ticker),
    snapshot_identity: safeInput.snapshot_identity ?? null,
    overall_quality_label: labelForScore(overallScore),
    overall_quality_score: overallScore,
    components,
    strongest_components: strongestWeakest(components, "strongest"),
    weakest_components: strongestWeakest(components, "weakest"),
    reason_codes: reasonCodes,
    caution_flags: cautionFlags,
    metadata_gaps: unique(metadataGaps),
    advisory_only: true,
  };
}

function increment<T extends string>(record: Record<T, number>, key: T, amount = 1) {
  record[key] = (record[key] ?? 0) + amount;
}

function emptyQualityMix() {
  return {
    weak: 0,
    fair: 0,
    good: 0,
    strong: 0,
    unknown: 0,
  } satisfies Record<TureTradeQualityLabel, number>;
}

function groupSummaries(
  rows: TradeQualitySummaryInputRow[],
  keySelector: (row: TradeQualitySummaryInputRow) => string | null | undefined,
) {
  const groups = new Map<string, TradeQualitySummaryInputRow[]>();

  for (const row of rows) {
    const key = normalizeText(keySelector(row)) || "unknown";
    const current = groups.get(key) ?? [];
    current.push(row);
    groups.set(key, current);
  }

  return Array.from(groups.entries())
    .map(([key, group]) => {
      const qualityMix = emptyQualityMix();
      for (const row of group) {
        increment(qualityMix, row.decomposition.overall_quality_label);
      }
      const averageQualityScore = average(
        group.map((row) => row.decomposition.overall_quality_score),
      );

      return {
        key,
        outcome_count: group.length,
        average_quality_score: averageQualityScore,
        average_quality_label: labelForScore(averageQualityScore),
        quality_mix: qualityMix,
      };
    })
    .sort((first, second) => second.outcome_count - first.outcome_count)
    .slice(0, 8);
}

export function buildTradeQualityDecompositionSummary(
  rows: TradeQualitySummaryInputRow[],
): TureTradeQualityDecompositionSummary {
  const currentBatchRows = rows.filter((row) => row.current_batch);
  const qualityMix = emptyQualityMix();
  const weakComponents = {} as Record<TureTradeQualityComponentName, number>;
  const strongComponents = {} as Record<TureTradeQualityComponentName, number>;
  const metadataGaps: Record<string, number> = {};
  const reasonCodes: Record<string, number> = {};
  const cautionFlags: Record<string, number> = {};

  for (const row of rows) {
    increment(qualityMix, row.decomposition.overall_quality_label);
    for (const name of componentNames) {
      const componentValue = row.decomposition.components[name];
      if (componentValue.label === "weak") increment(weakComponents, name);
      if (componentValue.label === "good" || componentValue.label === "strong") {
        increment(strongComponents, name);
      }
    }
    for (const gap of row.decomposition.metadata_gaps) {
      metadataGaps[gap] = (metadataGaps[gap] ?? 0) + 1;
    }
    for (const reason of row.decomposition.reason_codes) {
      reasonCodes[reason] = (reasonCodes[reason] ?? 0) + 1;
    }
    for (const caution of row.decomposition.caution_flags) {
      cautionFlags[caution] = (cautionFlags[caution] ?? 0) + 1;
    }
  }

  return {
    advisory_mode: true,
    current_batch_decomposed_count: currentBatchRows.length,
    current_batch_total_count: currentBatchRows.length,
    overall_quality_mix: qualityMix,
    component_average_scores: Object.fromEntries(
      componentNames.map((name) => [
        name,
        average(rows.map((row) => row.decomposition.components[name].score)),
      ]),
    ) as Partial<Record<TureTradeQualityComponentName, number | null>>,
    most_common_weak_components: weakComponents,
    most_common_strong_components: strongComponents,
    metadata_gaps: metadataGaps,
    reason_codes: reasonCodes,
    caution_flags: cautionFlags,
    quality_by_setup_family: groupSummaries(rows, (row) => row.setup_family),
    quality_by_sector: groupSummaries(rows, (row) => row.sector_group),
    quality_by_ticker: groupSummaries(rows, (row) => row.ticker),
    quality_by_market_regime: groupSummaries(rows, (row) => row.market_regime_label),
    low_confidence_quality_rows: rows.filter((row) =>
      row.decomposition.metadata_gaps.some(
        (gap) => gap.includes("missing") || gap.includes("unknown"),
      ),
    ).length,
  };
}
