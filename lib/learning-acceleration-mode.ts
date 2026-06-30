import type { IntradayScanWindow } from "@/lib/intraday-scan-window";
import type {
  RealScannerCandidate,
  RealScannerCandidateTier,
} from "@/lib/real-scanner-candidate-generation";
import type {
  SelectedCandidateBuildDiagnostic,
  SelectedToBuiltDropOffSummary,
} from "@/lib/recommendation-build-diagnostics";
import type {
  ScannerCandidateRankingResult,
  ScannerCandidateRankingSummary,
} from "@/lib/scanner-candidate-ranking";

export type LearningAccelerationEnabledSource =
  | "server_env"
  | "grow_max_compat"
  | "client_unavailable"
  | "none";

export type LearningAccelerationEnvValueCategory =
  | "true"
  | "false"
  | "empty"
  | "other"
  | "missing"
  | "client_unavailable";

export type LearningAccelerationRuntimeEnvironment =
  | "production"
  | "development"
  | "test"
  | "other"
  | "missing"
  | "client_unavailable";

export type LearningAccelerationModeEvaluation = {
  learning_acceleration_enabled: boolean;
  learning_acceleration_requested: boolean;
  learning_acceleration_enabled_source: LearningAccelerationEnabledSource;
  learning_acceleration_env_raw_present: boolean;
  learning_acceleration_env_raw_value_category: LearningAccelerationEnvValueCategory;
  learning_acceleration_env_raw_value_normalized: boolean;
  learning_acceleration_runtime_environment: LearningAccelerationRuntimeEnvironment;
  learning_acceleration_mode: "disabled" | "research_only";
};

export type LearningAccelerationResearchSample = {
  ticker: string;
  company_name: string;
  tier: RealScannerCandidateTier | "unknown";
  score: number;
  rank: number | null;
  entry_low: number;
  entry_high: number;
  entry: number;
  stop: number;
  target: number;
  target_2: number | null;
  risk_reward: number | null;
  provider_source: string | null;
  market_data_source: string | null;
  market_data_timestamp: string | null;
  rejection_publish_reason: string;
  sample_quality: "good" | "usable";
  ranking_reason: string;
  ranking_warnings: string[];
  explicit_metadata_gaps: string[];
};

export type LearningAccelerationResearchSelectionSummary = {
  enabled: boolean;
  mode: "disabled" | "research_only";
  max_samples: number;
  visible_tickers: string[];
  samples: LearningAccelerationResearchSample[];
  samples_collected_count: number;
  selected_below_threshold_count: number;
  selected_below_threshold_readback_count: number;
  selected_below_threshold_passed_count: number;
  selected_below_threshold_matched_by_ticker_count: number;
  selected_below_threshold_unmatched_by_ticker_count: number;
  learning_acceleration_input_mismatch: boolean;
  research_only_persisted_count: number;
  skipped_due_to_budget_count: number;
  skipped_due_to_duplicate_count: number;
  skipped_due_to_invalid_risk_count: number;
  skipped_due_to_stale_reference_count: number;
  skipped_due_to_missing_critical_fields_count: number;
  skipped_due_to_sanitizer_count: number;
  top_research_sample_tickers: string[];
  sample_quality_summary: {
    good: number;
    usable: number;
  };
};

export function shouldIncludeLearningAccelerationOutcomeSample({
  growMaxLearningModeEnabled = false,
  learningAccelerationEnabled = false,
  researchOnly = false,
  learningOnly = false,
}: {
  growMaxLearningModeEnabled?: boolean;
  learningAccelerationEnabled?: boolean;
  researchOnly?: boolean;
  learningOnly?: boolean;
}) {
  if (!researchOnly && !learningOnly) return true;

  return growMaxLearningModeEnabled || learningAccelerationEnabled;
}

export function normalizeLearningAccelerationBoolean(value: string | undefined) {
  if (value === undefined || value.trim().length === 0) return false;

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;

  return false;
}

export function learningAccelerationEnvValueCategory(
  value: string | undefined,
): LearningAccelerationEnvValueCategory {
  if (value === undefined) return "missing";
  if (value.trim().length === 0) return "empty";

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) return "true";
  if (["0", "false", "no", "off"].includes(normalized)) return "false";

  return "other";
}

function safeRuntimeEnvironment(
  value: string | undefined,
): LearningAccelerationRuntimeEnvironment {
  if (value === undefined || value.trim().length === 0) return "missing";

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "production" ||
    normalized === "development" ||
    normalized === "test"
  ) {
    return normalized;
  }

  return "other";
}

export function evaluateLearningAccelerationMode({
  env = process.env,
  growMaxLearningModeEnabled = false,
}: {
  env?: Record<string, string | undefined>;
  growMaxLearningModeEnabled?: boolean;
} = {}): LearningAccelerationModeEvaluation {
  const rawServerValue = env.TURE_LEARNING_ACCELERATION_ENABLED;
  const serverPresent = rawServerValue !== undefined;
  const serverValue = normalizeLearningAccelerationBoolean(rawServerValue);
  const serverValueCategory =
    learningAccelerationEnvValueCategory(rawServerValue);
  const requested = serverValue === true || growMaxLearningModeEnabled;
  const enabledSource: LearningAccelerationEnabledSource =
    serverValue === true
      ? "server_env"
      : growMaxLearningModeEnabled
        ? "grow_max_compat"
        : "none";
  const enabled = requested;

  return {
    learning_acceleration_enabled: enabled,
    learning_acceleration_requested: requested,
    learning_acceleration_enabled_source: enabled ? enabledSource : "none",
    learning_acceleration_env_raw_present: serverPresent,
    learning_acceleration_env_raw_value_category: serverValueCategory,
    learning_acceleration_env_raw_value_normalized: serverValue,
    learning_acceleration_runtime_environment: safeRuntimeEnvironment(
      env.NODE_ENV,
    ),
    learning_acceleration_mode: enabled ? "research_only" : "disabled",
  };
}

export function getLearningAccelerationConfig({
  env = process.env,
  growMaxLearningModeEnabled = false,
}: {
  env?: Record<string, string | undefined>;
  growMaxLearningModeEnabled?: boolean;
} = {}) {
  return evaluateLearningAccelerationMode({
    env,
    growMaxLearningModeEnabled,
  });
}

export function clientUnavailableLearningAccelerationConfig(): LearningAccelerationModeEvaluation {
  return {
    learning_acceleration_enabled: false,
    learning_acceleration_requested: false,
    learning_acceleration_enabled_source: "client_unavailable",
    learning_acceleration_env_raw_present: false,
    learning_acceleration_env_raw_value_category: "client_unavailable",
    learning_acceleration_env_raw_value_normalized: false,
    learning_acceleration_runtime_environment: "client_unavailable",
    learning_acceleration_mode: "disabled",
  };
}

function finiteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function tickerKey(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

function rankingTier(
  value: ScannerCandidateRankingResult["score"]["tier"] | RealScannerCandidate["tier"],
): LearningAccelerationResearchSample["tier"] | null {
  if (
    value === "strong" ||
    value === "valid" ||
    value === "experimental" ||
    value === "incomplete" ||
    value === "rejected"
  ) {
    return value;
  }

  return "unknown";
}

function isOfficialWindow(scanWindow: IntradayScanWindow | "unknown") {
  return (
    scanWindow === "morning_momentum" ||
    scanWindow === "midday" ||
    scanWindow === "power_hour"
  );
}

function buildCandidateByTicker(candidates: RealScannerCandidate[]) {
  return new Map(candidates.map((candidate) => [tickerKey(candidate.ticker), candidate]));
}

function candidateRiskGeometry(candidate: RealScannerCandidate) {
  const entryLow = finiteNumber(candidate.entry_low);
  const entryHigh = finiteNumber(candidate.entry_high);
  const stop = finiteNumber(candidate.stop_loss);
  const target = finiteNumber(candidate.target_1);
  const target2 = finiteNumber(candidate.target_2);
  const entry =
    entryLow !== null && entryHigh !== null
      ? (entryLow + entryHigh) / 2
      : entryHigh ?? entryLow;

  if (
    entryLow === null ||
    entryHigh === null ||
    entry === null ||
    stop === null ||
    target === null
  ) {
    return { status: "missing_critical_fields" as const };
  }

  if (stop >= entry || entryLow > entryHigh || target <= entry) {
    return { status: "invalid_risk" as const };
  }

  return {
    status: "valid" as const,
    entryLow,
    entryHigh,
    entry,
    stop,
    target,
    target2,
  };
}

export function buildLearningAccelerationResearchSelection({
  enabled,
  candidates,
  ranking,
  selectedBuildDiagnostics = [],
  selectedToBuiltDropOff = null,
  visibleTickers = [],
  scanWindow = "unknown",
  maxSamples = 25,
}: {
  enabled: boolean;
  candidates: RealScannerCandidate[];
  ranking: ScannerCandidateRankingSummary | null;
  selectedBuildDiagnostics?: SelectedCandidateBuildDiagnostic[] | null;
  selectedToBuiltDropOff?: SelectedToBuiltDropOffSummary | null;
  visibleTickers?: string[];
  scanWindow?: IntradayScanWindow | "unknown";
  maxSamples?: number;
}): LearningAccelerationResearchSelectionSummary {
  const visibleTickerSet = new Set(visibleTickers.map(tickerKey));
  const explicitBelowThresholdDiagnostics = (selectedBuildDiagnostics ?? []).filter(
    (diagnostic) =>
      diagnostic.rejection_reason === "below_publish_threshold" &&
      diagnostic.built !== true,
  );
  const explicitBelowThresholdTickerSet = new Set(
    explicitBelowThresholdDiagnostics.map((diagnostic) =>
      tickerKey(diagnostic.ticker),
    ),
  );
  const dropOffBelowThresholdExamples =
    selectedToBuiltDropOff?.examples_by_reason.below_publish_threshold ?? [];
  const fallbackBelowThresholdDiagnostics = dropOffBelowThresholdExamples
    .map((ticker) => tickerKey(ticker))
    .filter(
      (ticker) => ticker && !explicitBelowThresholdTickerSet.has(ticker),
    )
    .map(
      (ticker): SelectedCandidateBuildDiagnostic => ({
        ticker,
        side: "long",
        score: null,
        tier: null,
        setup_type: null,
        source: "selected_to_built_drop_off",
        reference_price_status: null,
        reference_price_source: null,
        reference_price_read_path: null,
        reference_price_age_minutes: null,
        vwap_status: null,
        momentum_status: null,
        volume_status: null,
        risk_geometry_status: null,
        enough_data_to_build_plan: true,
        built: false,
        rejection_reason: "below_publish_threshold",
        rejection_category: "quality",
        explanation:
          `${ticker} appeared in selected-to-built drop-off as below publish threshold.`,
      }),
    );
  const belowThresholdDiagnostics = [
    ...explicitBelowThresholdDiagnostics,
    ...fallbackBelowThresholdDiagnostics,
  ];
  const selectedBelowThresholdReadbackCount =
    selectedToBuiltDropOff?.rejection_counts.below_publish_threshold ??
    belowThresholdDiagnostics.length;
  const selectedBelowThresholdMatchedByTickerCount =
    belowThresholdDiagnostics.filter((diagnostic) =>
      candidates.some(
        (candidate) => tickerKey(candidate.ticker) === tickerKey(diagnostic.ticker),
      ),
    ).length;
  const selectedBelowThresholdUnmatchedByTickerCount = Math.max(
    0,
    belowThresholdDiagnostics.length - selectedBelowThresholdMatchedByTickerCount,
  );
  const learningAccelerationInputMismatch =
    selectedBelowThresholdReadbackCount > 0 &&
    (belowThresholdDiagnostics.length === 0 ||
      belowThresholdDiagnostics.length !== selectedBelowThresholdReadbackCount);
  const belowThresholdByTicker = new Map(
    belowThresholdDiagnostics.map((diagnostic) => [
      tickerKey(diagnostic.ticker),
      diagnostic,
    ]),
  );
  const max = Math.max(0, Math.min(25, Math.floor(maxSamples)));
  const disabledSummary = {
    enabled,
    mode: enabled ? ("research_only" as const) : ("disabled" as const),
    max_samples: max,
    visible_tickers: Array.from(visibleTickerSet).sort(),
    samples: [],
    samples_collected_count: 0,
    selected_below_threshold_count: selectedBelowThresholdReadbackCount,
    selected_below_threshold_readback_count: selectedBelowThresholdReadbackCount,
    selected_below_threshold_passed_count: belowThresholdDiagnostics.length,
    selected_below_threshold_matched_by_ticker_count:
      selectedBelowThresholdMatchedByTickerCount,
    selected_below_threshold_unmatched_by_ticker_count:
      selectedBelowThresholdUnmatchedByTickerCount,
    learning_acceleration_input_mismatch: learningAccelerationInputMismatch,
    research_only_persisted_count: 0,
    skipped_due_to_budget_count: 0,
    skipped_due_to_duplicate_count: 0,
    skipped_due_to_invalid_risk_count: 0,
    skipped_due_to_stale_reference_count: 0,
    skipped_due_to_missing_critical_fields_count: 0,
    skipped_due_to_sanitizer_count: 0,
    top_research_sample_tickers: [],
    sample_quality_summary: { good: 0, usable: 0 },
  };

  if (!enabled || !isOfficialWindow(scanWindow) || max === 0) {
    return disabledSummary;
  }

  const candidateByTicker = buildCandidateByTicker(candidates);
  const fallbackRankedResults = candidates.map(
    (candidate, index): ScannerCandidateRankingResult => ({
      ticker: candidate.ticker,
      company_name: candidate.company_name,
      rank: index + 1,
      selected: false,
      selection_bucket: "not_selected",
      rank_reason: candidate.score.reasons[0] ?? "Research candidate.",
      source_contribution: "unknown",
      score: {
        total_score: candidate.score.value,
        normalized_score: candidate.score.value,
        tier: candidate.tier,
        components: [],
        warnings: candidate.warnings.map((warning) => ({
          warning_id: warning.code,
          severity: warning.severity,
          message: warning.message,
        })),
        gaps: [],
      },
    }),
  );
  const rankedResultByTicker = new Map(
    (ranking?.results ?? fallbackRankedResults).map((result) => [
      tickerKey(result.ticker),
      result,
    ]),
  );
  const rankedResults =
    belowThresholdByTicker.size > 0
      ? Array.from(belowThresholdByTicker.values()).map((diagnostic, index) => {
          const ticker = tickerKey(diagnostic.ticker);
          const candidate = candidateByTicker.get(ticker);
          const ranked = rankedResultByTicker.get(ticker);

          return (
            ranked ?? {
              ticker,
              company_name: candidate?.company_name ?? ticker,
              rank: index + 1,
              selected: true,
              selection_bucket: "not_selected",
              rank_reason: diagnostic.explanation,
              source_contribution: "unknown",
              score: {
                total_score: diagnostic.score ?? candidate?.score.value ?? 0,
                normalized_score:
                  diagnostic.score ?? candidate?.score.value ?? 0,
                tier: candidate?.tier ?? "rejected",
                components: [],
                warnings: [],
                gaps: [],
              },
            }
          );
        })
      : selectedBelowThresholdReadbackCount > 0
        ? []
      : ranking?.results ?? fallbackRankedResults;
  const seen = new Set<string>();
  const samples: LearningAccelerationResearchSample[] = [];
  let skippedDuplicate = 0;
  let skippedInvalidRisk = 0;
  let skippedStaleReference = 0;
  let skippedMissingCriticalFields = 0;
  let skippedSanitizer = 0;

  for (const result of rankedResults) {
    const ticker = tickerKey(result.ticker);

    if (!ticker || visibleTickerSet.has(ticker)) {
      continue;
    }

    if (seen.has(ticker)) {
      skippedDuplicate += 1;
      continue;
    }
    seen.add(ticker);

    const tier = rankingTier(result.score.tier);
    const candidate = candidateByTicker.get(ticker);
    const buildDiagnostic = belowThresholdByTicker.get(ticker) ?? null;

    if (!candidate || tier === null) {
      skippedSanitizer += 1;
      continue;
    }

    if (
      buildDiagnostic &&
      (!buildDiagnostic.enough_data_to_build_plan ||
        buildDiagnostic.risk_geometry_status?.includes("invalid") === true)
    ) {
      skippedInvalidRisk += 1;
      continue;
    }

    if (candidate.stale) {
      skippedStaleReference += 1;
      continue;
    }

    const geometry = candidateRiskGeometry(candidate);

    if (geometry.status === "missing_critical_fields") {
      skippedMissingCriticalFields += 1;
      continue;
    }

    if (geometry.status === "invalid_risk") {
      skippedInvalidRisk += 1;
      continue;
    }

    const explicitMetadataGaps = Array.from(
      new Set([
        ...(candidate.market_data_timestamp ? [] : ["missing_data_timestamp"]),
        ...(candidate.provider_source ? [] : ["provider_source_unavailable"]),
        ...(candidate.data_source ? [] : ["market_data_source_unavailable"]),
      ]),
    );
    const sampleQuality =
      candidate.provider_source && candidate.market_data_timestamp ? "good" : "usable";

    samples.push({
      ticker,
      company_name: candidate.company_name,
      tier,
      score: result.score.normalized_score,
      rank: result.rank,
      entry_low: geometry.entryLow,
      entry_high: geometry.entryHigh,
      entry: geometry.entry,
      stop: geometry.stop,
      target: geometry.target,
      target_2: geometry.target2,
      risk_reward: finiteNumber(candidate.risk_reward),
      provider_source: textOrNull(candidate.provider_source),
      market_data_source: textOrNull(candidate.data_source),
      market_data_timestamp: textOrNull(candidate.market_data_timestamp),
      rejection_publish_reason:
        buildDiagnostic?.rejection_reason ??
        (result.selected
          ? "below_visible_publish_path_or_builder_limit"
          : "research_overflow_not_visible_selected"),
      sample_quality: sampleQuality,
      ranking_reason: buildDiagnostic?.explanation ?? result.rank_reason,
      ranking_warnings: result.score.warnings.map((warning) => warning.message),
      explicit_metadata_gaps: explicitMetadataGaps,
    });

    if (samples.length >= max) {
      break;
    }
  }

  const eligibleRemainder = Math.max(
    0,
    rankedResults.length -
      visibleTickerSet.size -
      samples.length -
      skippedDuplicate -
      skippedInvalidRisk -
      skippedStaleReference -
      skippedMissingCriticalFields -
      skippedSanitizer,
  );

  return {
    ...disabledSummary,
    samples,
    samples_collected_count: samples.length,
    research_only_persisted_count: samples.length,
    skipped_due_to_budget_count: eligibleRemainder,
    skipped_due_to_duplicate_count: skippedDuplicate,
    skipped_due_to_invalid_risk_count: skippedInvalidRisk,
    skipped_due_to_stale_reference_count: skippedStaleReference,
    skipped_due_to_missing_critical_fields_count: skippedMissingCriticalFields,
    skipped_due_to_sanitizer_count: skippedSanitizer,
    top_research_sample_tickers: samples.map((sample) => sample.ticker).slice(0, 8),
    sample_quality_summary: {
      good: samples.filter((sample) => sample.sample_quality === "good").length,
      usable: samples.filter((sample) => sample.sample_quality === "usable").length,
    },
  };
}
