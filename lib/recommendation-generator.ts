import "server-only";

import OpenAI from "openai";

import {
  getMarketRegime,
  neutralMarketRegimeFallback,
  type MarketRegime,
} from "@/lib/market-regime";
import {
  scanMarket,
  type ScannerCandidate,
} from "@/lib/scanner";
import {
  getIntradayScanPolicy,
  getIntradayScanWindowLabel,
  type IntradayScanWindow,
} from "@/lib/intraday-scan-window";
import type { IntradayIndicators } from "@/lib/intraday-indicators";
import { getDefaultRecommendationExpiryCutoff } from "@/lib/recommendation-freshness";
import type { PreMarketCandidate } from "@/lib/scan-logs";
import {
  SETUP_TYPE_OPTIONS,
  SETUP_TYPES,
  classifySetupTypeFromSignals,
  getSetupTypeDescription,
  getSetupTypeLabel,
  normalizeSetupType,
  type SetupType,
} from "@/lib/setup-types";
import { normalizeUnknownError } from "@/lib/error-logging";
import { buildRecommendationOutputEnrichmentMetadata } from "@/lib/recommendation-output-enrichment";
import {
  discoverDynamicMoversDiagnostics,
  type DynamicMoversDiscoverySummary,
} from "@/lib/dynamic-movers-discovery";
import {
  buildRealScannerBaseCandidateSelection,
  buildRealScannerCandidateGenerationSummary,
  type RealScannerCandidateGenerationSummary,
} from "@/lib/real-scanner-candidate-generation";
import {
  buildScannerCandidateRankingSummary,
  type ScannerCandidateRankingSummary,
} from "@/lib/scanner-candidate-ranking";
import {
  buildOpenAiRecommendationRealityGuardSummary,
  finalizeOpenAiRecommendationRealityGuardSummary,
  type OpenAiRecommendationRealityCandidate,
  type OpenAiRecommendationRealityGuardSummary,
} from "@/lib/openai-recommendation-reality-guard";
import {
  errorType,
  type ActiveScanTraceRecorder,
} from "@/lib/active-scan-trace";
import {
  AUTOMATION_ROUTE_VERSION,
  BUILD_MARKER,
  RECOMMENDATION_PUBLISH_POLICY_VERSION,
} from "@/lib/publish-path-versions";
import {
  getServerSupabaseClient,
  getServerSupabaseReadClient,
} from "@/lib/supabase-server";
import {
  inferRecommendationEntryTypeMetadata,
  type RecommendationEntryTypeConfidence,
  type RecommendationEntryTypeMetadata,
  type RecommendationEntryTypeSource,
  type RecommendationEntryTriggerSemantics,
  type RecommendationEntryType,
} from "@/lib/recommendation-entry-type";
import {
  markPlanReferenceRetained,
  resolvePlanReferencePriceMetadata,
  type PlanReferenceMetadataStatus,
  type PlanReferencePriceMetadata,
} from "@/lib/recommendation-plan-reference";

export type SessionType = "morning" | "midday";
export type RecommendationGenerationSource = "manual" | "scheduled";
type Confidence = "Low" | "Medium" | "High";
type ConfidenceLabel =
  | "HIGH CONVICTION"
  | "GOOD SETUP"
  | "LOWER CONFIDENCE";

type ConfidenceBreakdown = {
  setup_quality: number;
  momentum_confirmation: number;
  volume_confirmation: number;
  risk_reward_quality: number;
  market_regime_alignment: number;
  timing_quality: number;
};

type EntryTypeMetadata = RecommendationEntryTypeMetadata;

export type GenerateRecommendationsInput = {
  sessionType: SessionType;
  scanWindow: IntradayScanWindow;
  targetCount?: number;
  source: RecommendationGenerationSource;
  allowPowerHourRecommendationLogging?: boolean;
  powerHourTrialPublishing?: boolean;
  diagnosticMode?: boolean;
  diagnosticRunId?: string | null;
  diagnosticMaxTickers?: number | null;
  scheduledMaxTickers?: number | null;
  growMaxLearningMode?: boolean;
  skipOpenAi?: boolean;
  activeScanTrace?: ActiveScanTraceRecorder | null;
};

export class RecommendationGenerationError extends Error {
  status: number;
  details: Record<string, unknown>;

  constructor(
    message: string,
    status = 500,
    details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "RecommendationGenerationError";
    this.status = status;
    this.details = details;
  }
}

type RecommendationInsert = {
  session_type: SessionType;
  ticker: string;
  company_name: string;
  direction: "long";
  setup_type: SetupType;
  entry_low: number;
  entry_high: number;
  stop_loss: number;
  target_1: number;
  target_2: number;
  risk_reward: number;
  confidence: Confidence;
  timeframe: string;
  thesis: string;
  invalidation: string;
  reason_to_avoid: string;
  status: "new";
};

type MockCandidate = ScannerCandidate;

type AiRecommendation = Omit<RecommendationInsert, "session_type" | "status"> & {
  confidence_score: number;
  confidence_label: ConfidenceLabel;
  confidence_breakdown: ConfidenceBreakdown;
  confidence_reasoning: string;
  risk_flags: string[];
  tier:
    | "strong"
    | "valid"
    | "experimental"
    | "incomplete"
    | "rejected"
    | "unknown";
  source_provider: string;
  market_data_source: string;
  market_data_timestamp: string | null;
  data_freshness:
    | "fresh"
    | "cached"
    | "stale"
    | "provider_unavailable"
    | "unknown";
  warning_summary: string[];
  gap_summary: string[];
  ranking_rank: number | null;
  ranking_reason: string;
  batch_window: string;
  batch_type: string;
  batch_status: string;
  reference_price_used_for_plan?: number | null;
  reference_price_source?: string | null;
  reference_price_timestamp?: string | null;
  reference_price_symbol?: string | null;
  reference_price_provider?: string | null;
  reference_price_read_path?: string | null;
  plan_reference_price?: PlanReferencePriceMetadata | null;
  plan_reference_metadata_status?: PlanReferenceMetadataStatus | null;
  recommendation_build_path?: "openai" | "deterministic_fallback" | "no_publish" | null;
  entry_type?: RecommendationEntryType | null;
  entry_trigger_semantics?: RecommendationEntryTriggerSemantics | null;
  entry_type_source?: RecommendationEntryTypeSource | null;
  entry_type_confidence?: RecommendationEntryTypeConfidence | null;
  entry_type_warnings?: string[] | null;
};

type AiNoTradeDecision = {
  reason: string;
  confidence_score: number | null;
  risk_flags: string[];
  candidate_ticker: string | null;
};

type AiResponse = {
  result: "trade_recommendation" | "no_trade";
  recommendations: AiRecommendation[];
  no_trade?: AiNoTradeDecision;
};

type SanitizedRecommendationsResult = {
  recommendations: RecommendationInsert[];
  skippedReasons: string[];
};

export type RecommendationScanLogDetails = {
  result?: string;
  top_candidate_ticker?: string | null;
  top_candidate_score?: number | null;
  top_candidate_setup_type?: SetupType | null;
  top_candidate_breakdown?: CandidateScoreBreakdown | null;
  top_candidate_reasons?: string[] | null;
  top_candidate_warnings?: string[] | null;
  top_candidate_indicators?: CompactIntradayIndicators | null;
  indicator_source?: string | null;
  indicator_cached_at?: string | null;
  indicator_stale?: boolean | null;
  no_trade_reason?: string | null;
  no_trade_risk_flags?: string[] | null;
  threshold?: number | null;
  candidates_scanned?: number | null;
  skipped_tickers?: number | null;
  pre_market_candidates?: PreMarketCandidate[] | null;
  real_scanner_candidate_generation?: RealScannerCandidateGenerationSummary | null;
  dynamic_movers_discovery?: DynamicMoversDiscoverySummary | null;
  scanner_candidate_ranking?: ScannerCandidateRankingSummary | null;
  openai_recommendation_reality_guard?: OpenAiRecommendationRealityGuardSummary | null;
  grow_max_learning_mode?: boolean | null;
  target_ideas_per_window?: number | null;
  recommendation_limit_status?: string | null;
  ranked_candidates_count?: number | null;
  recommendations_published_count?: number | null;
  strong_count?: number | null;
  valid_count?: number | null;
  experimental_count?: number | null;
  ranked_candidates_not_published_reason?: string | null;
  strong_threshold?: number | null;
  publishable_threshold?: number | null;
  deterministic_fallback_used?: boolean | null;
  recommendation_build_path?: "openai" | "deterministic_fallback" | "no_publish" | null;
  recommendations_built_count?: number | null;
  automation_route_version?: string | null;
  recommendation_publish_policy_version?: string | null;
  build_marker?: string | null;
  no_publish_reason?: string | null;
  power_hour_trial_enabled?: boolean | null;
  power_hour_publish_allowed?: boolean | null;
  power_hour_publish_block_reason?: string | null;
};

function publishVersionDetails() {
  return {
    automation_route_version: AUTOMATION_ROUTE_VERSION,
    recommendation_publish_policy_version: RECOMMENDATION_PUBLISH_POLICY_VERSION,
    build_marker: BUILD_MARKER,
  } satisfies Pick<
    RecommendationScanLogDetails,
    | "automation_route_version"
    | "recommendation_publish_policy_version"
    | "build_marker"
  >;
}

type CompactIntradayIndicators = {
  isAboveVwap: boolean | null;
  momentumDirection: IntradayIndicators["momentumDirection"];
  volumeTrend: IntradayIndicators["volumeTrend"];
};

type UserSettings = {
  portfolio_size: number;
  risk_per_trade_percent: number;
  max_recommendations_per_session: number;
  max_open_positions: number;
  preferred_timeframe: string;
  long_only: boolean;
};

type UserSettingsRow = {
  portfolio_size: number | string | null;
  risk_per_trade_percent: number | string | null;
  max_recommendations_per_session: number | string | null;
  max_open_positions: number | string | null;
  preferred_timeframe: string | null;
  long_only: boolean | null;
};

type PositionStatusRow = {
  ticker: string | null;
  status?: string | null;
};

type RecommendationTickerRow = {
  ticker: string | null;
  session_type?: string | null;
  status?: string | null;
  archived?: boolean | null;
  created_at?: string | null;
};

type TickerRecommendationCounts = {
  totalToday: number;
  sameSessionToday: number;
};

type CandidateScore = {
  score: number;
  reasons: string[];
  warnings: string[];
  breakdown: CandidateScoreBreakdown;
};

export type CandidateScoreBreakdown = {
  momentum: number;
  volume: number;
  volatility: number;
  trend: number;
  riskReward: number;
  marketRegime: number;
  timing: number;
};

type ScoredCandidate = MockCandidate & {
  local_score: number;
  local_score_reasons: string[];
  local_score_warnings: string[];
  local_score_breakdown: CandidateScoreBreakdown;
  setup_type: SetupType;
  setup_type_label: string;
  setup_type_description: string;
};

const dayTradeHorizon = "day_trade";
const dayTradeTimeframe = "Intraday / day trade";
const DEFAULT_DAY_TRADE_SCORE_THRESHOLD = 70;
const MANUAL_DAY_TRADE_SCORE_THRESHOLD = 62;
const LEARNING_RECOMMENDATION_SCORE_THRESHOLD = 60;
const MAX_CURRENT_RECOMMENDATIONS = 3;
const ALLOW_POWER_HOUR_NEW_RECOMMENDATIONS = false;
const POWER_HOUR_TRIAL_RECOMMENDATION_TARGET = { min: 3, max: 6 };
const POWER_HOUR_TRIAL_WARNINGS = [
  "Power Hour increases execution and overnight risk.",
  "Use for pipeline validation and learning data unless manually reviewed.",
];
const POWER_HOUR_TRIAL_COPY = [
  "Power Hour trial publishing is enabled for observation and learning.",
  "Late-day recommendations carry higher EOD risk.",
  "Execution remains human-confirmed.",
  "This does not enable broker automation.",
];
const MINIMUM_OPENAI_CONFIDENCE_SCORE = 55;
const confidenceMetadataPrefix = recommendationConfidenceMetadataPrefix;
const SETUP_TYPE_OPTIONS_FOR_PROMPT = SETUP_TYPE_OPTIONS.map((option) => ({
  setup_type: option.value,
  label: option.label,
  description: option.description,
}));
// Thresholds are intentionally strict for scheduled scans because the new
// breakdown rewards stronger local confirmation before spending an OpenAI call.

const scannerCacheWarmingMessage =
  "Market data cache is still warming up. Try again in a few minutes.";

const defaultUserSettings: UserSettings = {
  portfolio_size: 100000,
  risk_per_trade_percent: 0.5,
  max_recommendations_per_session: 5,
  max_open_positions: 5,
  preferred_timeframe: dayTradeTimeframe,
  long_only: true,
};

function getDayTradeScoreThreshold(
  scanWindow: IntradayScanWindow,
  source: RecommendationGenerationSource,
) {
  if (source === "manual") {
    return MANUAL_DAY_TRADE_SCORE_THRESHOLD;
  }

  if (scanWindow === "opening") return 80;
  if (scanWindow === "morning_momentum") return DEFAULT_DAY_TRADE_SCORE_THRESHOLD;
  if (scanWindow === "midday") return 82;
  if (scanWindow === "afternoon") return 75;
  if (scanWindow === "power_hour") return 85;

  return Number.POSITIVE_INFINITY;
}

function getPublishableLearningScoreThreshold(
  source: RecommendationGenerationSource,
) {
  return source === "scheduled"
    ? LEARNING_RECOMMENDATION_SCORE_THRESHOLD
    : MANUAL_DAY_TRADE_SCORE_THRESHOLD;
}

function isPowerHourTrialRun(input: {
  scanWindow: IntradayScanWindow;
  source: RecommendationGenerationSource;
  powerHourTrialPublishing?: boolean;
}) {
  return (
    input.scanWindow === "power_hour" &&
    input.source === "scheduled" &&
    input.powerHourTrialPublishing === true
  );
}

function powerHourTrialTarget(value: number | null | undefined) {
  const requested =
    typeof value === "number" && Number.isFinite(value)
      ? Math.round(value)
      : POWER_HOUR_TRIAL_RECOMMENDATION_TARGET.min;

  return clamp(
    requested,
    POWER_HOUR_TRIAL_RECOMMENDATION_TARGET.min,
    POWER_HOUR_TRIAL_RECOMMENDATION_TARGET.max,
  );
}

function buildDiagnosticRecommendationRows({
  recommendations,
  scanWindow,
  diagnosticRunId,
}: {
  recommendations: RecommendationInsert[];
  scanWindow: IntradayScanWindow;
  diagnosticRunId: string | null;
}) {
  const createdAt = new Date().toISOString();
  const runId = diagnosticRunId ?? `diagnostic_${createdAt.replace(/[^0-9]/g, "")}`;

  return recommendations.map((recommendation, index) => ({
    ...recommendation,
    id: `${runId}_${index + 1}_${recommendation.ticker}`,
    created_at: createdAt,
    scan_window: scanWindow,
    diagnostic_mode: true,
    source_mode: "diagnostic",
    not_live_trade_signal: true,
    visible_in_primary_recommendations: false,
  }));
}

function parseCandidateNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function calculateRiskReward(candidate: MockCandidate) {
  const entryHigh = parseCandidateNumber(candidate.proposed_entry_high);
  const stopLoss = parseCandidateNumber(candidate.proposed_stop_loss);
  const target2 = parseCandidateNumber(candidate.proposed_target_2);
  const explicitRiskReward = parseCandidateNumber(candidate.proposed_risk_reward);

  if (explicitRiskReward !== null) {
    return { riskReward: explicitRiskReward, invalidRisk: false };
  }

  // TODO: improve pre-AI risk/reward estimation.
  if (entryHigh === null || stopLoss === null || target2 === null) {
    return { riskReward: null, invalidRisk: false };
  }

  const risk = entryHigh - stopLoss;

  if (risk <= 0) {
    return { riskReward: null, invalidRisk: true };
  }

  return {
    riskReward: (target2 - entryHigh) / risk,
    invalidRisk: false,
  };
}

function compactIntradayIndicators(
  indicators: IntradayIndicators | null | undefined,
): CompactIntradayIndicators | null {
  if (!indicators) {
    return null;
  }

  return {
    isAboveVwap: indicators.isAboveVwap,
    momentumDirection: indicators.momentumDirection,
    volumeTrend: indicators.volumeTrend,
  };
}

function updateRawCandidateTrace(
  activeScanTrace: ActiveScanTraceRecorder | null | undefined,
  candidates: MockCandidate[],
) {
  if (!activeScanTrace) return;

  let structurallyValidCount = 0;
  let invalidPricePlanCount = 0;
  let missingRequiredFieldsCount = 0;
  const rejectionReasons: string[] = [];

  for (const candidate of candidates) {
    const latestPrice = parseCandidateNumber(
      candidate.latest_close ?? candidate.mock_current_price,
    );
    const entryLow = parseCandidateNumber(candidate.proposed_entry_low);
    const entryHigh = parseCandidateNumber(candidate.proposed_entry_high);
    const stopLoss = parseCandidateNumber(candidate.proposed_stop_loss);
    const target1 = parseCandidateNumber(candidate.proposed_target_1);
    const target2 = parseCandidateNumber(candidate.proposed_target_2);
    const missingRequired =
      latestPrice === null ||
      entryLow === null ||
      entryHigh === null ||
      stopLoss === null ||
      target1 === null ||
      target2 === null;

    if (missingRequired) {
      missingRequiredFieldsCount += 1;
      rejectionReasons.push(`${candidate.ticker}: missing required price fields`);
      continue;
    }

    const invalidPlan =
      entryHigh <= 0 ||
      stopLoss <= 0 ||
      target1 <= 0 ||
      target2 <= 0 ||
      stopLoss >= entryHigh ||
      target2 <= entryHigh;

    if (invalidPlan) {
      invalidPricePlanCount += 1;
      rejectionReasons.push(`${candidate.ticker}: invalid price plan`);
      continue;
    }

    structurallyValidCount += 1;
  }

  activeScanTrace.markStage("raw_candidates", "completed");
  activeScanTrace.updateRawCandidates({
    raw_candidate_count: candidates.length,
    structurally_valid_count: structurallyValidCount,
    invalid_price_plan_count: invalidPricePlanCount,
    missing_required_fields_count: missingRequiredFieldsCount,
    top_rejection_reasons: rejectionReasons.slice(0, 8),
  });
}

function scoreDayTradeCandidate(
  candidate: MockCandidate,
  context: {
    marketRegime: MarketRegime;
    scanWindow: IntradayScanWindow;
  },
): CandidateScore {
  const reasons: string[] = [];
  const warnings: string[] = [];

  const volumeRatio = parseCandidateNumber(candidate.volume_ratio);
  const recentVolumeRatio = parseCandidateNumber(candidate.recent_volume_ratio);
  const change5dPercent = parseCandidateNumber(candidate.change_5d_percent);
  const recentChangePercent = parseCandidateNumber(candidate.recent_change_percent);
  const latestClose = parseCandidateNumber(
    candidate.latest_close ?? candidate.mock_current_price,
  );
  const sessionOpen = parseCandidateNumber(candidate.session_open);
  const ma20 = parseCandidateNumber(candidate.ma20);
  const ma50 = parseCandidateNumber(candidate.ma50);
  const distanceTo20dHigh = parseCandidateNumber(candidate.distance_to_20d_high);
  const recentRangePosition = parseCandidateNumber(candidate.recent_range_position);
  const higherHighs = parseCandidateNumber(candidate.recent_higher_highs_count);
  const higherLows = parseCandidateNumber(candidate.recent_higher_lows_count);
  const bullishCandles = parseCandidateNumber(candidate.recent_bullish_candles);
  const averageRangePercent = parseCandidateNumber(candidate.average_range_percent);
  const latestRangePercent = parseCandidateNumber(candidate.latest_range_percent);
  const rangeExpansionRatio = parseCandidateNumber(candidate.range_expansion_ratio);
  const intradayIndicators = candidate.intraday_indicators ?? null;
  const setupType = classifyCandidateSetupType(candidate, context.scanWindow);
  const { riskReward, invalidRisk } = calculateRiskReward(candidate);

  let momentum = 50;
  let volume = 50;
  let volatility = 50;
  let trend = 50;
  let riskRewardScore = 50;
  let marketRegime = 50;
  let timing = 50;

  if (recentChangePercent === null && change5dPercent === null) {
    warnings.push("Recent momentum confirmation unavailable.");
    momentum -= 8;
  } else {
    const momentumPercent = recentChangePercent ?? change5dPercent ?? 0;

    if (momentumPercent >= 1 && momentumPercent <= 6) {
      momentum += 22;
      reasons.push(`Strong recent momentum at ${momentumPercent.toFixed(2)}%.`);
    } else if (momentumPercent > 6) {
      momentum += 8;
      warnings.push(
        `Recent move may be extended after ${momentumPercent.toFixed(2)}%.`,
      );
    } else if (momentumPercent >= 0) {
      momentum += 10;
      reasons.push(`Price is holding positive recent momentum at ${momentumPercent.toFixed(2)}%.`);
    } else {
      momentum -= 18;
      warnings.push(`Negative momentum for a long setup at ${momentumPercent.toFixed(2)}%.`);
    }
  }

  if (latestClose !== null && sessionOpen !== null && sessionOpen > 0) {
    const sessionChange = ((latestClose - sessionOpen) / sessionOpen) * 100;

    if (sessionChange > 0.4) {
      momentum += 10;
      reasons.push(`Price is above session open by ${sessionChange.toFixed(2)}%.`);
    } else if (sessionChange < -0.4) {
      momentum -= 12;
      warnings.push(`Price is below session open by ${Math.abs(sessionChange).toFixed(2)}%.`);
    }
  }

  if (recentRangePosition !== null) {
    if (recentRangePosition >= 75) {
      momentum += 12;
      reasons.push("Strong recent momentum: price closed near recent high.");
    } else if (recentRangePosition < 35) {
      momentum -= 10;
      warnings.push("Price is not closing near the recent high.");
    }
  }

  if (intradayIndicators) {
    if (intradayIndicators.isAboveVwap === true) {
      trend += 8;
      reasons.push("Price is above VWAP.");
    } else if (intradayIndicators.isAboveVwap === false) {
      trend -= 14;
      warnings.push("Price is below VWAP for a long setup.");
    }

    if (intradayIndicators.momentumDirection === "up") {
      momentum += 10;
      reasons.push("Intraday momentum is up.");
    } else if (intradayIndicators.momentumDirection === "down") {
      momentum -= 14;
      warnings.push("Intraday momentum is weakening.");
    }

    if (intradayIndicators.volumeTrend === "expanding") {
      volume += 10;
      reasons.push("Intraday volume trend is expanding.");
    } else if (intradayIndicators.volumeTrend === "contracting") {
      volume -= 10;
      warnings.push("Intraday volume trend is contracting.");
    }

    if (
      intradayIndicators.recentHigh !== null &&
      intradayIndicators.latestPrice !== null &&
      intradayIndicators.recentHigh > 0
    ) {
      const distanceToRecentHigh =
        ((intradayIndicators.recentHigh - intradayIndicators.latestPrice) /
          intradayIndicators.recentHigh) *
        100;

      if (distanceToRecentHigh >= 0 && distanceToRecentHigh <= 0.5) {
        trend += 6;
        reasons.push("Price is near recent intraday high.");
      }
    }

    if (
      intradayIndicators.recentRangePercent !== null &&
      intradayIndicators.recentRangePercent < 0.4
    ) {
      volatility -= 8;
      warnings.push("Recent intraday range is tight and may be choppy.");
    }
  }

  if ((higherHighs ?? 0) >= 3 && (higherLows ?? 0) >= 3) {
    momentum += 8;
    reasons.push("Recent candles show higher highs and higher lows.");
  }

  if ((bullishCandles ?? 0) >= 4) {
    momentum += 6;
    reasons.push("Bullish candle sequence detected.");
  }

  const bestVolumeRatio = Math.max(volumeRatio ?? 0, recentVolumeRatio ?? 0);

  if (volumeRatio === null && recentVolumeRatio === null) {
    warnings.push("Volume confirmation unavailable.");
    volume -= 8;
  } else if (bestVolumeRatio >= 1.5) {
    volume += 28;
    reasons.push("Volume expansion detected versus recent candles.");
  } else if (bestVolumeRatio >= 1.1) {
    volume += 18;
    reasons.push(`Volume is above average at ${bestVolumeRatio.toFixed(2)}x.`);
  } else if (bestVolumeRatio >= 0.8) {
    volume += 6;
    reasons.push(`Volume is near average at ${bestVolumeRatio.toFixed(2)}x.`);
  } else if (bestVolumeRatio > 0) {
    volume -= bestVolumeRatio < 0.5 ? 26 : 14;
    warnings.push(`Light volume at ${bestVolumeRatio.toFixed(2)}x average.`);
    if (bestVolumeRatio < 0.5) {
      warnings.push("Extremely low liquidity; skip unless confirmation improves.");
    }
  }

  if (averageRangePercent === null || latestRangePercent === null) {
    warnings.push("Volatility/range confirmation unavailable.");
    volatility -= 6;
  } else if (averageRangePercent < 1) {
    volatility -= 18;
    warnings.push("Recent range is too tight for a clean day trade target.");
  } else if (averageRangePercent > 7 || latestRangePercent > 9) {
    volatility -= 14;
    warnings.push("Range is unusually wide; intraday risk may be erratic.");
  } else {
    volatility += 16;
    reasons.push("Recent range is sufficient for day trade target potential.");

    if (rangeExpansionRatio !== null && rangeExpansionRatio >= 1.15) {
      volatility += 8;
      reasons.push("Current range is expanding versus recent average.");
    }
  }

  if (latestClose === null || ma20 === null || ma50 === null) {
    warnings.push("Trend moving-average data unavailable.");
    trend -= 8;
  } else if (latestClose > ma20 && ma20 > ma50) {
    trend += 28;
    reasons.push("Clean uptrend above MA20 and MA50.");
  } else if (latestClose > ma50 && (change5dPercent ?? 0) >= 0) {
    trend += 16;
    reasons.push("Constructive recovery above MA50.");
  } else if (latestClose > ma20) {
    trend += 10;
    reasons.push("Short-term strength above MA20.");
  } else {
    trend -= 20;
    warnings.push("Bearish or choppy trend structure for a long day trade.");
  }

  if ((higherHighs ?? 0) >= 3 || (distanceTo20dHigh !== null && distanceTo20dHigh <= 3)) {
    trend += 10;
    reasons.push("Breakout structure is close to recent highs.");
  } else if (distanceTo20dHigh !== null && distanceTo20dHigh > 10) {
    trend -= 8;
    warnings.push(`Far from 20-day high at ${distanceTo20dHigh}%.`);
  }

  if (invalidRisk) {
    riskRewardScore = 0;
    warnings.push("Invalid pre-AI trade plan: risk per share is not positive.");
  } else if (riskReward === null) {
    warnings.push("Estimated risk/reward unavailable.");
  } else {
    const roundedRiskReward = riskReward.toFixed(2);

    if (riskReward >= 2) {
      riskRewardScore += 30;
      reasons.push(`Estimated risk/reward is ${roundedRiskReward}.`);
    } else if (riskReward >= 1.5) {
      riskRewardScore += 18;
      reasons.push(`Acceptable estimated risk/reward at ${roundedRiskReward}.`);
    } else {
      riskRewardScore -= 22;
      warnings.push("Risk/reward below preferred threshold.");
    }
  }

  if (context.marketRegime.regime === "risk_on") {
    marketRegime += 18;
    reasons.push("Market regime is risk_on, supportive for long day trades.");
  } else if (context.marketRegime.regime === "risk_off") {
    marketRegime -= 22;
    warnings.push("Market regime is risk_off; long setups require stronger confirmation.");
  } else {
    marketRegime += context.marketRegime.summary.includes("unavailable") ? 0 : 6;
    if (context.marketRegime.summary.includes("unavailable")) {
      warnings.push("Market regime unavailable; treating alignment as neutral.");
    } else {
      reasons.push("Market regime is neutral.");
    }
  }

  if (context.scanWindow === "opening") {
    timing += 4;
    warnings.push("Opening window has higher volatility; require confirmation.");
  } else if (context.scanWindow === "morning_momentum") {
    timing += 22;
    reasons.push("Morning momentum window supports intraday continuation.");
  } else if (context.scanWindow === "midday") {
    timing -= 18;
    warnings.push("Midday window increases chop risk.");
  } else if (context.scanWindow === "afternoon") {
    timing += 10;
    reasons.push("Afternoon window can support continuation if structure is clear.");
  } else if (context.scanWindow === "power_hour") {
    timing -= 25;
    warnings.push("Power hour requires very strict confirmation.");
  } else {
    timing = 0;
    warnings.push("Pre-market or closed window is not eligible for trade recommendations.");
  }

  if (setupType !== "UNKNOWN") {
    const setupLabel = getSetupTypeLabel(setupType);

    trend += 3;
    reasons.push(`Setup classified as ${setupLabel}.`);

    if (setupType === "OPENING_RANGE_BREAKOUT" && context.scanWindow === "opening") {
      timing += 5;
      reasons.push("Setup type aligns with the opening scan window.");
    } else if (
      setupType === "VWAP_HOLD_CONTINUATION" &&
      (context.scanWindow === "morning_momentum" ||
        context.scanWindow === "midday" ||
        context.scanWindow === "afternoon") &&
      intradayIndicators?.isAboveVwap === true &&
      intradayIndicators.momentumDirection !== "down"
    ) {
      timing += 4;
      reasons.push("VWAP continuation setup aligns with this intraday window.");
    } else if (
      (setupType === "HIGH_OF_DAY_BREAKOUT" ||
        setupType === "BREAKOUT_CONTINUATION") &&
      (context.scanWindow === "morning_momentum" ||
        context.scanWindow === "afternoon") &&
      riskReward !== null &&
      riskReward >= 1.5
    ) {
      timing += 3;
      reasons.push("Breakout setup has acceptable timing and risk/reward.");
    } else if (context.scanWindow === "power_hour") {
      timing -= 3;
      warnings.push("Setup type boost withheld during restrictive power hour.");
    }
  }

  const breakdown = {
    momentum: clampScore(momentum),
    volume: clampScore(volume),
    volatility: clampScore(volatility),
    trend: clampScore(trend),
    riskReward: clampScore(riskRewardScore),
    marketRegime: clampScore(marketRegime),
    timing: clampScore(timing),
  };
  const weightedScore =
    breakdown.momentum * 0.2 +
    breakdown.volume * 0.15 +
    breakdown.volatility * 0.12 +
    breakdown.trend * 0.18 +
    breakdown.riskReward * 0.15 +
    breakdown.marketRegime * 0.1 +
    breakdown.timing * 0.1;

  return {
    score: clampScore(weightedScore),
    reasons,
    warnings,
    breakdown,
  };
}

function classifyCandidateSetupType(
  candidate: MockCandidate,
  scanWindow: IntradayScanWindow,
) {
  return classifySetupTypeFromSignals({
    scanWindow,
    intradayIndicators: candidate.intraday_indicators,
    latestPrice: parseCandidateNumber(
      candidate.latest_close ?? candidate.mock_current_price,
    ),
    recentHigh: candidate.intraday_indicators?.recentHigh ?? null,
    recentLow: candidate.intraday_indicators?.recentLow ?? null,
    recentRangePosition: parseCandidateNumber(candidate.recent_range_position),
    distanceTo20dHigh: parseCandidateNumber(candidate.distance_to_20d_high),
    volumeRatio: parseCandidateNumber(candidate.volume_ratio),
    recentVolumeRatio: parseCandidateNumber(candidate.recent_volume_ratio),
    momentumDirection: candidate.intraday_indicators?.momentumDirection ?? null,
    reasonText: [
      candidate.mock_trend,
      candidate.mock_volume_context,
      candidate.mock_news_context,
    ],
  });
}

function toScoredCandidate(
  candidate: MockCandidate,
  context: {
    marketRegime: MarketRegime;
    scanWindow: IntradayScanWindow;
  },
): ScoredCandidate {
  const localScore = scoreDayTradeCandidate(candidate, context);
  const setupType = classifyCandidateSetupType(candidate, context.scanWindow);

  return {
    ...candidate,
    local_score: localScore.score,
    local_score_reasons: localScore.reasons,
    local_score_warnings: localScore.warnings,
    local_score_breakdown: localScore.breakdown,
    setup_type: setupType,
    setup_type_label: getSetupTypeLabel(setupType),
    setup_type_description: getSetupTypeDescription(setupType),
  };
}

function scorePreMarketCandidate(
  candidate: MockCandidate,
  context: {
    marketRegime: MarketRegime;
  },
) {
  const signals: string[] = [];
  const warnings: string[] = [];
  let score = 45;

  const recentChangePercent = parseCandidateNumber(candidate.recent_change_percent);
  const change5dPercent = parseCandidateNumber(candidate.change_5d_percent);
  const latestClose = parseCandidateNumber(
    candidate.latest_close ?? candidate.mock_current_price,
  );
  const sessionOpen = parseCandidateNumber(candidate.session_open);
  const ma20 = parseCandidateNumber(candidate.ma20);
  const ma50 = parseCandidateNumber(candidate.ma50);
  const distanceTo20dHigh = parseCandidateNumber(candidate.distance_to_20d_high);
  const volumeRatio = parseCandidateNumber(candidate.volume_ratio);
  const recentVolumeRatio = parseCandidateNumber(candidate.recent_volume_ratio);
  const averageRangePercent = parseCandidateNumber(candidate.average_range_percent);
  const recentRangePosition = parseCandidateNumber(candidate.recent_range_position);

  if (latestClose !== null && sessionOpen !== null && sessionOpen > 0) {
    const sessionChange = ((latestClose - sessionOpen) / sessionOpen) * 100;

    if (Math.abs(sessionChange) >= 0.5) {
      score += sessionChange > 0 ? 12 : 4;
      signals.push(`Pre/open reference move ${sessionChange.toFixed(2)}%.`);
    }
  } else {
    warnings.push("Limited price movement data.");
  }

  const momentumPercent = recentChangePercent ?? change5dPercent;

  if (momentumPercent === null) {
    warnings.push("Prior momentum data unavailable.");
    score -= 4;
  } else if (momentumPercent >= 1 && momentumPercent <= 7) {
    score += 16;
    signals.push(`Constructive prior momentum at ${momentumPercent.toFixed(2)}%.`);
  } else if (momentumPercent > 7) {
    score += 5;
    warnings.push(`Move may be extended after ${momentumPercent.toFixed(2)}%.`);
  } else if (momentumPercent < 0) {
    score -= 12;
    warnings.push(`Negative prior momentum at ${momentumPercent.toFixed(2)}%.`);
  }

  const bestVolumeRatio = Math.max(volumeRatio ?? 0, recentVolumeRatio ?? 0);

  if (volumeRatio === null && recentVolumeRatio === null) {
    warnings.push("Missing pre-market volume data.");
    score -= 6;
  } else if (bestVolumeRatio >= 1.25) {
    score += 14;
    signals.push(`Volume interest at ${bestVolumeRatio.toFixed(2)}x average.`);
  } else if (bestVolumeRatio >= 0.8) {
    score += 5;
    signals.push("Volume is at least near average.");
  } else if (bestVolumeRatio > 0) {
    score -= 12;
    warnings.push(`Low liquidity: ${bestVolumeRatio.toFixed(2)}x average.`);
  }

  if (latestClose === null || ma20 === null || ma50 === null) {
    warnings.push("Moving-average trend data unavailable.");
    score -= 4;
  } else if (latestClose > ma20 && ma20 > ma50) {
    score += 14;
    signals.push("Trend is constructive above MA20 and MA50.");
  } else if (latestClose > ma50) {
    score += 8;
    signals.push("Price is holding above MA50.");
  } else {
    score -= 10;
    warnings.push("Trend structure is not clean yet.");
  }

  if (distanceTo20dHigh !== null && distanceTo20dHigh <= 5) {
    score += 8;
    signals.push("Ticker is near its 20-day high.");
  }

  if (recentRangePosition !== null && recentRangePosition >= 70) {
    score += 6;
    signals.push("Recent closes are near the upper range.");
  }

  if (averageRangePercent === null) {
    warnings.push("Range data unavailable.");
  } else if (averageRangePercent < 1) {
    score -= 8;
    warnings.push("Recent range may be too tight for intraday opportunity.");
  } else if (averageRangePercent <= 7) {
    score += 6;
    signals.push("Average range can support intraday monitoring.");
  } else {
    score -= 5;
    warnings.push("Range is wide; risk may be erratic after open.");
  }

  if (context.marketRegime.regime === "risk_on") {
    score += 8;
    signals.push("Market regime is supportive.");
  } else if (context.marketRegime.regime === "risk_off") {
    score -= 10;
    warnings.push("Market regime is risk_off; require stronger confirmation after open.");
  } else if (context.marketRegime.summary.includes("unavailable")) {
    warnings.push("Market regime unavailable.");
  }

  signals.push("Ticker is in the scanner universe.");

  return {
    score: clampScore(score),
    signals,
    warnings,
  };
}

async function generatePreMarketWatchlist({
  source,
}: {
  source: RecommendationGenerationSource;
}) {
  let marketRegime = neutralMarketRegimeFallback;

  try {
    marketRegime = await getMarketRegime();
  } catch (error) {
    console.error("[recommendations/generate] pre_market_regime_error", {
      error: normalizeUnknownError(error),
    });
  }

  await saveMarketRegimeSnapshot(marketRegime);

  const scannerUniverseSelection = buildRealScannerBaseCandidateSelection({
    scanWindow: "pre_market",
  });
  const scannerBaseCandidates = scannerUniverseSelection.candidates;
  const scannerCandidates = await scanMarket(
    scannerBaseCandidates.length > 0 ? scannerBaseCandidates : mockCandidates,
    {
      source,
      maxFreshProviderCalls: source === "scheduled" ? 2 : 1,
    },
  );
  const detectedAt = new Date().toISOString();
  const candidates = scannerCandidates
    .map((candidate) => {
      const preMarketScore = scorePreMarketCandidate(candidate, { marketRegime });
      const setupType = classifyCandidateSetupType(candidate, "pre_market");
      const primarySignal =
        preMarketScore.signals[0] ??
        "Potential watchlist candidate. Wait for market-open confirmation.";

      return {
        id: `${candidate.ticker}-${detectedAt}`,
        ticker: candidate.ticker,
        detected_at: detectedAt,
        reason: primarySignal,
        score: preMarketScore.score,
        signals: preMarketScore.signals.slice(0, 5),
        warnings: preMarketScore.warnings.slice(0, 5),
        status: "watching",
        scan_window: "pre_market",
        source: "scanner",
        metadata: {
          company_name: candidate.company_name,
          potential_setup_type: setupType,
          setup_type: setupType,
          setup_type_label: getSetupTypeLabel(setupType),
        },
      } satisfies PreMarketCandidate;
    })
    .filter((candidate) => candidate.score >= 55)
    .sort((first, second) => second.score - first.score)
    .slice(0, 5);
  const realScannerCandidateGeneration =
    buildRealScannerCandidateGenerationSummary({
      universe: scannerBaseCandidates,
      candidates: scannerCandidates,
      scanWindow: "pre_market",
      source,
      visibleCandidateTickers: candidates.map((candidate) => candidate.ticker),
      providerSource: "twelve_data",
      universeSelection: scannerUniverseSelection.selection,
      now: new Date(detectedAt),
    });
  const result =
    candidates.length > 0
      ? "pre_market_watchlist_updated"
      : "pre_market_no_candidates";
  const message =
    candidates.length > 0
      ? `Pre-market watchlist updated. ${candidates.length} candidates to monitor after open.`
      : "Pre-market scan completed. No candidates to monitor after open.";

  return {
    recommendations: [],
    inserted_count: 0,
    pre_market_candidates: candidates,
    message,
    duplicate_fallback_used: false,
    market_regime: marketRegime,
    scan_window: "pre_market" as const,
    scan_log: {
      ...publishVersionDetails(),
      result,
      no_publish_reason: "pre_market_watchlist_only",
      power_hour_trial_enabled: false,
      power_hour_publish_allowed: false,
      power_hour_publish_block_reason: "not_power_hour",
      top_candidate_ticker: candidates[0]?.ticker ?? null,
      top_candidate_score: candidates[0]?.score ?? null,
      top_candidate_reasons: candidates[0]?.signals ?? null,
      top_candidate_warnings: candidates[0]?.warnings ?? null,
      candidates_scanned: scannerCandidates.length,
      pre_market_candidates: candidates,
      real_scanner_candidate_generation: realScannerCandidateGeneration,
    } satisfies RecommendationScanLogDetails,
  };
}

const mockCandidates: MockCandidate[] = [
  {
    ticker: "AAPL",
    company_name: "Apple Inc.",
    sector: "Technology",
    mock_current_price: 184.5,
    mock_trend: "Orderly pullback inside a broader uptrend",
    mock_volume_context: "Volume has been near average with heavier demand on green days",
    mock_support: 181,
    mock_resistance: 190,
    mock_news_context: "Mock context: product-cycle sentiment is steady, with no live news used",
  },
  {
    ticker: "MSFT",
    company_name: "Microsoft Corporation",
    sector: "Technology",
    mock_current_price: 423.2,
    mock_trend: "Tight consolidation near recent highs",
    mock_volume_context: "Volume is slightly above average during advances",
    mock_support: 416,
    mock_resistance: 432,
    mock_news_context: "Mock context: cloud and AI software narrative remains constructive",
  },
  {
    ticker: "NVDA",
    company_name: "NVIDIA Corporation",
    sector: "Technology",
    mock_current_price: 118.4,
    mock_trend: "Momentum reset after a shallow dip",
    mock_volume_context: "Volume expands on upside pushes and cools on pullbacks",
    mock_support: 113,
    mock_resistance: 124,
    mock_news_context: "Mock context: semiconductor demand theme remains supportive",
  },
  {
    ticker: "AMZN",
    company_name: "Amazon.com, Inc.",
    sector: "Consumer Discretionary",
    mock_current_price: 180.1,
    mock_trend: "Compression below range resistance",
    mock_volume_context: "Volume is balanced, with no clear distribution signal",
    mock_support: 174,
    mock_resistance: 184,
    mock_news_context: "Mock context: retail and cloud sentiment are mixed but stable",
  },
  {
    ticker: "GOOGL",
    company_name: "Alphabet Inc.",
    sector: "Communication Services",
    mock_current_price: 168.8,
    mock_trend: "Testing a prior demand zone",
    mock_volume_context: "Volume is average, with buyers appearing near support",
    mock_support: 164,
    mock_resistance: 176,
    mock_news_context: "Mock context: digital advertising narrative remains neutral-positive",
  },
  {
    ticker: "META",
    company_name: "Meta Platforms, Inc.",
    sector: "Communication Services",
    mock_current_price: 497.5,
    mock_trend: "Bull flag after a strong advance",
    mock_volume_context: "Volume is drying up during the flag",
    mock_support: 484,
    mock_resistance: 508,
    mock_news_context: "Mock context: platform engagement and AI capex themes are balanced",
  },
  {
    ticker: "TSLA",
    company_name: "Tesla, Inc.",
    sector: "Consumer Discretionary",
    mock_current_price: 178.2,
    mock_trend: "Volatile rebound into overhead supply",
    mock_volume_context: "Volume is choppy and higher than average",
    mock_support: 169,
    mock_resistance: 187,
    mock_news_context: "Mock context: EV sentiment remains volatile; no live headlines used",
  },
  {
    ticker: "JPM",
    company_name: "JPMorgan Chase & Co.",
    sector: "Financials",
    mock_current_price: 201.3,
    mock_trend: "Relative strength breakout attempt",
    mock_volume_context: "Volume has been steady during the recent rise",
    mock_support: 195,
    mock_resistance: 207,
    mock_news_context: "Mock context: large-bank sentiment is firm in this mock dataset",
  },
  {
    ticker: "XOM",
    company_name: "Exxon Mobil Corporation",
    sector: "Energy",
    mock_current_price: 114.4,
    mock_trend: "Higher-low structure with sector support",
    mock_volume_context: "Volume is average, with demand on dips",
    mock_support: 110,
    mock_resistance: 120,
    mock_news_context: "Mock context: energy complex is treated as stable, not live",
  },
  {
    ticker: "COST",
    company_name: "Costco Wholesale Corporation",
    sector: "Consumer Staples",
    mock_current_price: 846.7,
    mock_trend: "Controlled pullback in a defensive leader",
    mock_volume_context: "Volume is lighter on the pullback",
    mock_support: 828,
    mock_resistance: 870,
    mock_news_context: "Mock context: defensive retail demand remains resilient",
  },
  {
    ticker: "AVGO",
    company_name: "Broadcom Inc.",
    sector: "Technology",
    mock_current_price: 139.6,
    mock_trend: "Sideways base after trend advance",
    mock_volume_context: "Volume is contracting inside the base",
    mock_support: 134,
    mock_resistance: 146,
    mock_news_context: "Mock context: chip infrastructure demand remains supportive",
  },
  {
    ticker: "AMD",
    company_name: "Advanced Micro Devices, Inc.",
    sector: "Technology",
    mock_current_price: 157.4,
    mock_trend: "Reclaiming short-term moving averages",
    mock_volume_context: "Volume improved on the reclaim attempt",
    mock_support: 150,
    mock_resistance: 166,
    mock_news_context: "Mock context: AI accelerator sentiment is constructive",
  },
  {
    ticker: "NFLX",
    company_name: "Netflix, Inc.",
    sector: "Communication Services",
    mock_current_price: 640.2,
    mock_trend: "High tight range near resistance",
    mock_volume_context: "Volume is modest but consistent",
    mock_support: 620,
    mock_resistance: 660,
    mock_news_context: "Mock context: subscriber and ad-tier narrative is positive",
  },
  {
    ticker: "CRM",
    company_name: "Salesforce, Inc.",
    sector: "Technology",
    mock_current_price: 276.3,
    mock_trend: "Attempting to turn up from support",
    mock_volume_context: "Volume is mixed, improving on up days",
    mock_support: 268,
    mock_resistance: 290,
    mock_news_context: "Mock context: enterprise software sentiment is stabilizing",
  },
  {
    ticker: "ORCL",
    company_name: "Oracle Corporation",
    sector: "Technology",
    mock_current_price: 126.9,
    mock_trend: "Pullback toward rising support",
    mock_volume_context: "Volume is lighter than average on the pullback",
    mock_support: 122,
    mock_resistance: 134,
    mock_news_context: "Mock context: cloud infrastructure demand theme is constructive",
  },
  {
    ticker: "ADBE",
    company_name: "Adobe Inc.",
    sector: "Technology",
    mock_current_price: 512.8,
    mock_trend: "Basing after a prior selloff",
    mock_volume_context: "Volume is drying up as price stabilizes",
    mock_support: 498,
    mock_resistance: 535,
    mock_news_context: "Mock context: creative software sentiment is neutral",
  },
  {
    ticker: "INTC",
    company_name: "Intel Corporation",
    sector: "Technology",
    mock_current_price: 35.6,
    mock_trend: "Early reversal attempt from support",
    mock_volume_context: "Volume is elevated but inconsistent",
    mock_support: 33.5,
    mock_resistance: 39,
    mock_news_context: "Mock context: turnaround narrative remains speculative",
  },
  {
    ticker: "QCOM",
    company_name: "QUALCOMM Incorporated",
    sector: "Technology",
    mock_current_price: 188.4,
    mock_trend: "Trend continuation above a prior base",
    mock_volume_context: "Volume has been above average during the advance",
    mock_support: 181,
    mock_resistance: 198,
    mock_news_context: "Mock context: handset and edge-AI sentiment is supportive",
  },
  {
    ticker: "SHOP",
    company_name: "Shopify Inc.",
    sector: "Technology",
    mock_current_price: 76.3,
    mock_trend: "Rounded base with improving momentum",
    mock_volume_context: "Volume is gradually improving",
    mock_support: 72,
    mock_resistance: 82,
    mock_news_context: "Mock context: ecommerce software sentiment is improving",
  },
  {
    ticker: "UBER",
    company_name: "Uber Technologies, Inc.",
    sector: "Industrials",
    mock_current_price: 71.8,
    mock_trend: "Constructive consolidation above support",
    mock_volume_context: "Volume is near average with no distribution cluster",
    mock_support: 68,
    mock_resistance: 77,
    mock_news_context: "Mock context: mobility demand narrative is stable",
  },
  {
    ticker: "BA",
    company_name: "The Boeing Company",
    sector: "Industrials",
    mock_current_price: 184.7,
    mock_trend: "Basing below a key resistance shelf",
    mock_volume_context: "Volume is uneven and event-sensitive",
    mock_support: 176,
    mock_resistance: 195,
    mock_news_context: "Mock context: industrial sentiment is cautious",
  },
  {
    ticker: "CAT",
    company_name: "Caterpillar Inc.",
    sector: "Industrials",
    mock_current_price: 332.4,
    mock_trend: "Higher lows with cyclical leadership",
    mock_volume_context: "Volume is steady on advances",
    mock_support: 320,
    mock_resistance: 348,
    mock_news_context: "Mock context: machinery demand theme is constructive",
  },
  {
    ticker: "GE",
    company_name: "GE Aerospace",
    sector: "Industrials",
    mock_current_price: 164.9,
    mock_trend: "Strong trend pausing above short-term support",
    mock_volume_context: "Volume is average after prior accumulation",
    mock_support: 158,
    mock_resistance: 173,
    mock_news_context: "Mock context: aerospace demand theme remains supportive",
  },
  {
    ticker: "HD",
    company_name: "The Home Depot, Inc.",
    sector: "Consumer Discretionary",
    mock_current_price: 356.7,
    mock_trend: "Base breakout attempt",
    mock_volume_context: "Volume is slightly above average near resistance",
    mock_support: 344,
    mock_resistance: 368,
    mock_news_context: "Mock context: housing-related demand is treated as mixed",
  },
  {
    ticker: "MCD",
    company_name: "McDonald's Corporation",
    sector: "Consumer Discretionary",
    mock_current_price: 287.1,
    mock_trend: "Defensive uptrend with a shallow pullback",
    mock_volume_context: "Volume is light but stable",
    mock_support: 280,
    mock_resistance: 296,
    mock_news_context: "Mock context: restaurant traffic sentiment is steady",
  },
  {
    ticker: "NKE",
    company_name: "NIKE, Inc.",
    sector: "Consumer Discretionary",
    mock_current_price: 92.4,
    mock_trend: "Attempting to recover from a low base",
    mock_volume_context: "Volume is improving but still uneven",
    mock_support: 88,
    mock_resistance: 99,
    mock_news_context: "Mock context: consumer brand sentiment is cautious",
  },
  {
    ticker: "WMT",
    company_name: "Walmart Inc.",
    sector: "Consumer Staples",
    mock_current_price: 67.8,
    mock_trend: "Steady defensive trend near highs",
    mock_volume_context: "Volume is consistent with mild accumulation",
    mock_support: 65,
    mock_resistance: 70.5,
    mock_news_context: "Mock context: value retail sentiment remains resilient",
  },
  {
    ticker: "PEP",
    company_name: "PepsiCo, Inc.",
    sector: "Consumer Staples",
    mock_current_price: 171.5,
    mock_trend: "Support bounce inside a wide range",
    mock_volume_context: "Volume is average and defensive",
    mock_support: 166,
    mock_resistance: 179,
    mock_news_context: "Mock context: staples demand is steady",
  },
  {
    ticker: "LLY",
    company_name: "Eli Lilly and Company",
    sector: "Health Care",
    mock_current_price: 784.3,
    mock_trend: "Power trend with a controlled pause",
    mock_volume_context: "Volume remains supportive on advances",
    mock_support: 755,
    mock_resistance: 815,
    mock_news_context: "Mock context: obesity-drug demand theme remains strong",
  },
  {
    ticker: "UNH",
    company_name: "UnitedHealth Group Incorporated",
    sector: "Health Care",
    mock_current_price: 508.6,
    mock_trend: "Recovering from a higher low",
    mock_volume_context: "Volume is stable, not aggressive",
    mock_support: 492,
    mock_resistance: 530,
    mock_news_context: "Mock context: managed-care sentiment is stabilizing",
  },
  {
    ticker: "ABBV",
    company_name: "AbbVie Inc.",
    sector: "Health Care",
    mock_current_price: 169.2,
    mock_trend: "Defensive consolidation above support",
    mock_volume_context: "Volume is slightly below average",
    mock_support: 164,
    mock_resistance: 176,
    mock_news_context: "Mock context: pharma sentiment is steady",
  },
  {
    ticker: "MRK",
    company_name: "Merck & Co., Inc.",
    sector: "Health Care",
    mock_current_price: 128.4,
    mock_trend: "Trend continuation attempt after a pause",
    mock_volume_context: "Volume is balanced with mild accumulation",
    mock_support: 123,
    mock_resistance: 134,
    mock_news_context: "Mock context: large-cap pharma demand is stable",
  },
  {
    ticker: "V",
    company_name: "Visa Inc.",
    sector: "Financials",
    mock_current_price: 279.6,
    mock_trend: "Shallow pullback in a steady trend",
    mock_volume_context: "Volume is quiet but constructive",
    mock_support: 271,
    mock_resistance: 290,
    mock_news_context: "Mock context: payments volume sentiment is constructive",
  },
  {
    ticker: "MA",
    company_name: "Mastercard Incorporated",
    sector: "Financials",
    mock_current_price: 456.2,
    mock_trend: "Base building near highs",
    mock_volume_context: "Volume is normal and calm",
    mock_support: 442,
    mock_resistance: 472,
    mock_news_context: "Mock context: consumer payments sentiment remains positive",
  },
  {
    ticker: "GS",
    company_name: "The Goldman Sachs Group, Inc.",
    sector: "Financials",
    mock_current_price: 414.8,
    mock_trend: "Financial-sector strength with higher lows",
    mock_volume_context: "Volume is stronger on upside moves",
    mock_support: 400,
    mock_resistance: 430,
    mock_news_context: "Mock context: capital markets sentiment is improving",
  },
  {
    ticker: "CVX",
    company_name: "Chevron Corporation",
    sector: "Energy",
    mock_current_price: 158.1,
    mock_trend: "Range support bounce",
    mock_volume_context: "Volume is average with no clear pressure",
    mock_support: 153,
    mock_resistance: 166,
    mock_news_context: "Mock context: integrated energy sentiment is stable",
  },
];

function createRecommendationSchema(maxRecommendations: number) {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "result",
      "recommendations",
      "reason",
      "confidence_score",
      "risk_flags",
      "candidate_ticker",
    ],
    properties: {
      result: {
        type: "string",
        enum: ["trade_recommendation", "no_trade"],
      },
      recommendations: {
        type: "array",
        minItems: 0,
        maxItems: maxRecommendations,
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "ticker",
            "company_name",
            "direction",
            "setup_type",
            "entry_low",
            "entry_high",
            "stop_loss",
            "target_1",
            "target_2",
            "risk_reward",
            "confidence",
            "confidence_score",
            "confidence_label",
            "confidence_breakdown",
            "confidence_reasoning",
            "risk_flags",
            "timeframe",
            "thesis",
            "invalidation",
            "reason_to_avoid",
            "tier",
            "source_provider",
            "market_data_source",
            "market_data_timestamp",
            "data_freshness",
            "warning_summary",
            "gap_summary",
            "ranking_rank",
            "ranking_reason",
            "batch_window",
            "batch_type",
            "batch_status",
          ],
          properties: {
            ticker: { type: "string" },
            company_name: { type: "string" },
            direction: { type: "string", enum: ["long"] },
            setup_type: { type: "string", enum: SETUP_TYPES },
            entry_low: { type: "number" },
            entry_high: { type: "number" },
            stop_loss: { type: "number" },
            target_1: { type: "number" },
            target_2: { type: "number" },
            risk_reward: { type: "number" },
            confidence: { type: "string", enum: ["Low", "Medium", "High"] },
            confidence_score: { type: "number", minimum: 0, maximum: 100 },
            confidence_label: {
              type: "string",
              enum: ["HIGH CONVICTION", "GOOD SETUP", "LOWER CONFIDENCE"],
            },
            confidence_breakdown: {
              type: "object",
              additionalProperties: false,
              required: [
                "setup_quality",
                "momentum_confirmation",
                "volume_confirmation",
                "risk_reward_quality",
                "market_regime_alignment",
                "timing_quality",
              ],
              properties: {
                setup_quality: { type: "number", minimum: 0, maximum: 100 },
                momentum_confirmation: {
                  type: "number",
                  minimum: 0,
                  maximum: 100,
                },
                volume_confirmation: {
                  type: "number",
                  minimum: 0,
                  maximum: 100,
                },
                risk_reward_quality: {
                  type: "number",
                  minimum: 0,
                  maximum: 100,
                },
                market_regime_alignment: {
                  type: "number",
                  minimum: 0,
                  maximum: 100,
                },
                timing_quality: { type: "number", minimum: 0, maximum: 100 },
              },
            },
            confidence_reasoning: { type: "string" },
            risk_flags: {
              type: "array",
              items: { type: "string" },
            },
            timeframe: { type: "string" },
            thesis: { type: "string" },
            invalidation: { type: "string" },
            reason_to_avoid: { type: "string" },
            tier: {
              type: "string",
              enum: [
                "strong",
                "valid",
                "experimental",
                "incomplete",
                "rejected",
                "unknown",
              ],
            },
            source_provider: { type: "string" },
            market_data_source: { type: "string" },
            market_data_timestamp: { type: ["string", "null"] },
            data_freshness: {
              type: "string",
              enum: [
                "fresh",
                "cached",
                "stale",
                "provider_unavailable",
                "unknown",
              ],
            },
            warning_summary: {
              type: "array",
              items: { type: "string" },
            },
            gap_summary: {
              type: "array",
              items: { type: "string" },
            },
            ranking_rank: { type: ["number", "null"] },
            ranking_reason: { type: "string" },
            batch_window: { type: "string" },
            batch_type: { type: "string" },
            batch_status: { type: "string" },
          },
        },
      },
      reason: {
        type: ["string", "null"],
      },
      confidence_score: {
        type: ["number", "null"],
        minimum: 0,
        maximum: 100,
      },
      risk_flags: {
        type: "array",
        items: { type: "string" },
      },
      candidate_ticker: {
        type: ["string", "null"],
      },
    },
  };
}

function getStartOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

function normalizeTicker(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function text(value: unknown, fieldName: string) {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string.`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${fieldName} cannot be empty.`);
  }

  return trimmed;
}

function fallbackText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function number(value: unknown, fieldName: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a finite number.`);
  }

  return Number(value.toFixed(2));
}

function confidenceScore(value: unknown, fieldName: string) {
  return clamp(Math.round(number(value, fieldName)), 0, 100);
}

function confidenceFromScore(score: number): Confidence {
  if (score >= 85) {
    return "High";
  }

  if (score >= 70) {
    return "Medium";
  }

  return "Low";
}

function confidenceLabelFromScore(score: number): ConfidenceLabel {
  if (score >= 85) return "HIGH CONVICTION";
  if (score >= 70) return "GOOD SETUP";
  return "LOWER CONFIDENCE";
}

function validateConfidenceLabel(value: unknown, ticker: string) {
  if (
    value !== "HIGH CONVICTION" &&
    value !== "GOOD SETUP" &&
    value !== "LOWER CONFIDENCE"
  ) {
    throw new Error(`Recommendation ${ticker} confidence_label is invalid.`);
  }
}

function validateConfidenceBreakdown(value: unknown, ticker: string) {
  if (typeof value !== "object" || value === null) {
    throw new Error(`Recommendation ${ticker} confidence_breakdown is invalid.`);
  }

  const breakdown = value as Record<keyof ConfidenceBreakdown, unknown>;
  const fields: (keyof ConfidenceBreakdown)[] = [
    "setup_quality",
    "momentum_confirmation",
    "volume_confirmation",
    "risk_reward_quality",
    "market_regime_alignment",
    "timing_quality",
  ];

  for (const field of fields) {
    confidenceScore(breakdown[field], `${ticker}.confidence_breakdown.${field}`);
  }
}

function nullableConfidenceScore(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return clamp(Math.round(value), 0, 100);
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      )
    : [];
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function nullableNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function buildPlanReferencePriceMetadata(
  candidate: MockCandidate,
): PlanReferencePriceMetadata {
  const scannerReferencePrice = nullableNumber(
    candidate.reference_price_used_for_plan,
  );
  if (scannerReferencePrice !== null && scannerReferencePrice > 0) {
    return {
      reference_price_used_for_plan: scannerReferencePrice,
      reference_price_source:
        nullableString(candidate.reference_price_source) ?? "fallback_last_price",
      reference_price_timestamp:
        nullableString(candidate.reference_price_timestamp) ?? null,
      reference_price_symbol:
        nullableString(candidate.reference_price_symbol) ??
        normalizeTicker(candidate.ticker) ??
        null,
      reference_price_provider:
        nullableString(candidate.reference_price_provider) ?? null,
      reference_price_read_path:
        nullableString(candidate.reference_price_read_path) ??
        "candidate.reference_price_used_for_plan",
    };
  }

  const latestClose = nullableNumber(candidate.latest_close);
  if (latestClose !== null && latestClose > 0) {
    return {
      reference_price_used_for_plan: latestClose,
      reference_price_source: "fallback_last_price",
      reference_price_timestamp: null,
      reference_price_symbol: normalizeTicker(candidate.ticker) || null,
      reference_price_provider: null,
      reference_price_read_path: "candidate.latest_close",
    };
  }

  const intradayLatestPrice = nullableNumber(
    candidate.intraday_indicators?.latestPrice,
  );
  if (intradayLatestPrice !== null && intradayLatestPrice > 0) {
    return {
      reference_price_used_for_plan: intradayLatestPrice,
      reference_price_source: "latest_intraday_candle_close",
      reference_price_timestamp:
        nullableString(candidate.intraday_indicator_cached_at) ?? null,
      reference_price_symbol: normalizeTicker(candidate.ticker) || null,
      reference_price_provider:
        candidate.intraday_indicator_source === "fresh" ||
        candidate.intraday_indicator_source === "cache"
          ? "twelve_data"
          : null,
      reference_price_read_path: "candidate.intraday_indicators.latestPrice",
    };
  }

  const mockCurrentPrice = nullableNumber(candidate.mock_current_price);
  if (mockCurrentPrice !== null && mockCurrentPrice > 0) {
    return {
      reference_price_used_for_plan: mockCurrentPrice,
      reference_price_source: "current_price",
      reference_price_timestamp: null,
      reference_price_symbol: normalizeTicker(candidate.ticker) || null,
      reference_price_provider: "mock",
      reference_price_read_path: "candidate.mock_current_price",
    };
  }

  return {
    reference_price_used_for_plan: null,
    reference_price_source: "unknown",
    reference_price_timestamp: null,
    reference_price_symbol: normalizeTicker(candidate.ticker) || null,
    reference_price_provider: null,
    reference_price_read_path: null,
  };
}

function midpoint(low: number | null, high: number | null) {
  if (low === null && high === null) return null;
  if (low === null) return high;
  if (high === null) return low;
  return (low + high) / 2;
}

function buildPlanEntryTypeMetadata(input: {
  side: "long" | "short";
  entry: number | null;
  planReferencePrice: PlanReferencePriceMetadata;
  source: RecommendationEntryTypeSource;
  existingMetadata?: Record<string, unknown> | null;
}): EntryTypeMetadata {
  return inferRecommendationEntryTypeMetadata({
    side: input.side,
    entry: input.entry,
    referencePrice: input.planReferencePrice.reference_price_used_for_plan,
    referencePriceSource: input.planReferencePrice.reference_price_source,
    referencePriceReadPath: input.planReferencePrice.reference_price_read_path,
    source: input.source,
    existingMetadata: input.existingMetadata ?? null,
  });
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function planReferenceMetadataTraceOrNull(
  value: unknown,
): PlanReferencePriceMetadata["plan_reference_metadata_trace"] | null {
  const trace = objectOrNull(value);
  if (!trace) return null;

  return {
    candidate_price_available_before_generation:
      trace.candidate_price_available_before_generation === true,
    generated_recommendation_retained_reference_price:
      typeof trace.generated_recommendation_retained_reference_price === "boolean"
        ? trace.generated_recommendation_retained_reference_price
        : null,
    price_read_path: nullableString(trace.price_read_path),
    source_read_path: nullableString(trace.source_read_path),
    timestamp_read_path: nullableString(trace.timestamp_read_path),
    provider_read_path: nullableString(trace.provider_read_path),
  };
}

function buildPlanReferencePriceMetadata(
  candidate: MockCandidate,
): PlanReferencePriceMetadata {
  return resolvePlanReferencePriceMetadata(candidate);
}

function midpoint(low: number, high: number) {
  return (low + high) / 2;
}

function buildPlanEntryTypeMetadata(input: {
  side: "long" | "short";
  entry: number;
  planReferencePrice: PlanReferencePriceMetadata;
  source: RecommendationEntryTypeSource;
}): EntryTypeMetadata {
  return inferRecommendationEntryTypeMetadata({
    side: input.side,
    entry: input.entry,
    referencePrice: input.planReferencePrice.reference_price_used_for_plan,
    referencePriceSource: input.planReferencePrice.reference_price_source,
    referencePriceReadPath: input.planReferencePrice.reference_price_read_path,
    source: input.source,
  });
}

function buildOpenAiBatchContext(input: {
  scanWindow: IntradayScanWindow;
  source: RecommendationGenerationSource;
  targetCount: number;
  openPositionCount?: number;
  maxOpenPositions?: number;
  powerHourTrial?: boolean;
}) {
  const powerHourTrial = input.powerHourTrial === true;

  return {
    scan_window: input.scanWindow,
    batch_window: input.scanWindow,
    batch_type: powerHourTrial
      ? "observation_trial"
      : input.source === "scheduled"
        ? "official_scan"
        : "manual_scan",
    batch_status: powerHourTrial
      ? "observation_learning"
      : "candidate_validation",
    power_hour_trial: powerHourTrial,
    eod_risk: powerHourTrial ? "high" : null,
    recommendation_intent: powerHourTrial ? "learning_observation" : "day_trade",
    target_count: input.targetCount,
    daily_trade_capacity:
      typeof input.openPositionCount === "number" &&
      typeof input.maxOpenPositions === "number"
        ? {
            open_positions: input.openPositionCount,
            max_open_positions: input.maxOpenPositions,
            remaining_capacity: Math.max(
              0,
              input.maxOpenPositions - input.openPositionCount,
            ),
          }
        : null,
    tradable_now:
      input.scanWindow !== "closed" && input.scanWindow !== "pre_market",
  };
}

function getDataFreshness(candidate: ScoredCandidate) {
  if (candidate.intraday_indicator_stale === true) return "stale";
  if (candidate.intraday_indicator_source === "fresh") return "fresh";
  if (candidate.intraday_indicator_source === "cache") return "cached";
  if (candidate.intraday_indicator_source === "unavailable") {
    return "provider_unavailable";
  }

  return "unknown";
}

function buildOpenAiCandidatePayloads({
  candidates,
  rankingSummary,
}: {
  candidates: ScoredCandidate[];
  rankingSummary: ScannerCandidateRankingSummary;
}) {
  const rankingByTicker = new Map(
    rankingSummary.results.map((result) => [result.ticker, result]),
  );

  return candidates.map((candidate): OpenAiRecommendationRealityCandidate & Record<string, unknown> => {
    const ranking = rankingByTicker.get(candidate.ticker) ?? null;
    const marketDataSource =
      candidate.intraday_indicator_source === "fresh" ||
      candidate.intraday_indicator_source === "cache"
        ? candidate.intraday_indicator_source
        : "provider_unavailable";
    const marketDataProvider =
      candidate.intraday_indicator_source === "fresh" ||
      candidate.intraday_indicator_source === "cache"
        ? "twelve_data"
        : "provider_unavailable";
    const gaps = [
      ...(ranking?.score.gaps ?? []),
      ...(candidate.intraday_indicators ? [] : ["intraday_indicators_unavailable"]),
      ...(candidate.intraday_indicator_cached_at
        ? []
        : ["market_data_timestamp_unavailable"]),
      ...(candidate.proposed_entry_low === undefined
        ? ["proposed_entry_low_unavailable"]
        : []),
      ...(candidate.proposed_entry_high === undefined
        ? ["proposed_entry_high_unavailable"]
        : []),
      ...(candidate.proposed_stop_loss === undefined
        ? ["proposed_stop_loss_unavailable"]
        : []),
      ...(candidate.proposed_target_1 === undefined
        ? ["proposed_target_1_unavailable"]
        : []),
    ];

    return {
      ticker: candidate.ticker,
      company_name: candidate.company_name,
      sector: candidate.sector,
      latest_price:
        nullableNumber(candidate.latest_close) ??
        nullableNumber(candidate.intraday_indicators?.latestPrice),
      ma20: nullableNumber(candidate.ma20),
      ma50: nullableNumber(candidate.ma50),
      high_20d: nullableNumber(candidate.high_20d),
      volume_ratio: nullableNumber(candidate.volume_ratio),
      distance_to_20d_high: nullableNumber(candidate.distance_to_20d_high),
      change_5d_percent: nullableNumber(candidate.change_5d_percent),
      proposed_entry_low: nullableNumber(candidate.proposed_entry_low),
      proposed_entry_high: nullableNumber(candidate.proposed_entry_high),
      proposed_stop_loss: nullableNumber(candidate.proposed_stop_loss),
      proposed_target_1: nullableNumber(candidate.proposed_target_1),
      proposed_target_2: nullableNumber(candidate.proposed_target_2),
      proposed_risk_reward: nullableNumber(candidate.proposed_risk_reward),
      session_open: nullableNumber(candidate.session_open),
      session_high: nullableNumber(candidate.session_high),
      session_low: nullableNumber(candidate.session_low),
      previous_close: nullableNumber(candidate.previous_close),
      recent_change_percent: nullableNumber(candidate.recent_change_percent),
      recent_range_position: nullableNumber(candidate.recent_range_position),
      recent_higher_highs_count: nullableNumber(
        candidate.recent_higher_highs_count,
      ),
      recent_higher_lows_count: nullableNumber(candidate.recent_higher_lows_count),
      recent_bullish_candles: nullableNumber(candidate.recent_bullish_candles),
      recent_volume_ratio: nullableNumber(candidate.recent_volume_ratio),
      average_range_percent: nullableNumber(candidate.average_range_percent),
      latest_range_percent: nullableNumber(candidate.latest_range_percent),
      range_expansion_ratio: nullableNumber(candidate.range_expansion_ratio),
      intraday_indicators: candidate.intraday_indicators ?? null,
      candidate_score: candidate.local_score,
      candidate_score_breakdown: candidate.local_score_breakdown,
      candidate_score_reasons: candidate.local_score_reasons,
      candidate_score_warnings: candidate.local_score_warnings,
      setup_type: candidate.setup_type,
      setup_type_label: candidate.setup_type_label,
      setup_type_description: candidate.setup_type_description,
      rank: ranking?.rank ?? null,
      tier: ranking?.score.tier ?? "unknown",
      rank_reason: ranking?.rank_reason ?? null,
      ranking_components: ranking?.score.components ?? [],
      ranking_warnings: ranking?.score.warnings ?? [],
      market_data_source: marketDataSource,
      market_data_provider: marketDataProvider,
      market_data_timestamp: candidate.intraday_indicator_cached_at ?? null,
      market_data_stale: candidate.intraday_indicator_stale ?? null,
      data_freshness: getDataFreshness(candidate),
      warnings: [
        ...candidate.local_score_warnings,
        ...(ranking?.score.warnings.map((warning) => warning.message) ?? []),
        ...(candidate.intraday_indicators?.warnings ?? []),
      ],
      gaps: Array.from(new Set(gaps)),
    };
  });
}

function buildDeterministicLearningRecommendations({
  candidates,
  rankingSummary,
  scanWindow,
  source,
  maxRecommendations,
  powerHourTrial,
}: {
  candidates: ScoredCandidate[];
  rankingSummary: ScannerCandidateRankingSummary;
  scanWindow: IntradayScanWindow;
  source: RecommendationGenerationSource;
  maxRecommendations: number;
  powerHourTrial?: boolean;
}): AiRecommendation[] {
  const rankingByTicker = new Map(
    rankingSummary.results.map((result) => [result.ticker, result]),
  );

  return candidates.slice(0, maxRecommendations).map((candidate) => {
    const ranking = rankingByTicker.get(candidate.ticker) ?? null;
    const tier = ranking?.score.tier ?? "unknown";
    const localScore = clamp(
      candidate.local_score,
      tier === "strong" ? 82 : tier === "valid" ? 65 : 55,
      tier === "strong" ? 90 : tier === "valid" ? 78 : 68,
    );
    const warningSummary = [
      ...(candidate.local_score_warnings ?? []),
      ...(ranking?.score.warnings.map((warning) => warning.message) ?? []),
      ...(powerHourTrial ? POWER_HOUR_TRIAL_WARNINGS : []),
    ].slice(0, 5);
    const gapSummary = [
      ...(ranking?.score.gaps ?? []),
      ...(candidate.intraday_indicators ? [] : ["Intraday indicators unavailable."]),
      ...(candidate.intraday_indicator_stale
        ? ["Market data is stale."]
        : []),
    ].slice(0, 5);
    const reasons = candidate.local_score_reasons.slice(0, 3);
    const setupType = normalizeSetupType(candidate.setup_type);
    const setupLabel = getSetupTypeLabel(setupType);
    const planReferencePrice = markPlanReferenceRetained(
      buildPlanReferencePriceMetadata(candidate),
    );
    const entryTypeMetadata = buildPlanEntryTypeMetadata({
      side: "long",
      entry: midpoint(
        Number(candidate.proposed_entry_low),
        Number(candidate.proposed_entry_high),
      ),
      planReferencePrice,
      source: "deterministic_plan_builder",
    });
    const confidenceBreakdown: ConfidenceBreakdown = {
      setup_quality: candidate.local_score_breakdown.trend,
      momentum_confirmation: candidate.local_score_breakdown.momentum,
      volume_confirmation: candidate.local_score_breakdown.volume,
      risk_reward_quality: candidate.local_score_breakdown.riskReward,
      market_regime_alignment: candidate.local_score_breakdown.marketRegime,
      timing_quality: candidate.local_score_breakdown.timing,
    };

    return {
      ticker: candidate.ticker,
      company_name: candidate.company_name,
      direction: "long",
      setup_type: setupType,
      entry_low: Number(candidate.proposed_entry_low),
      entry_high: Number(candidate.proposed_entry_high),
      stop_loss: Number(candidate.proposed_stop_loss),
      target_1: Number(candidate.proposed_target_1),
      target_2: Number(candidate.proposed_target_2),
      risk_reward: Number(candidate.proposed_risk_reward),
      confidence: confidenceFromScore(localScore),
      confidence_score: localScore,
      confidence_label: confidenceLabelFromScore(localScore),
      confidence_breakdown: confidenceBreakdown,
      confidence_reasoning: [
        "Deterministic scanner-derived fallback recommendation; OpenAI narrative generation was not used for this row.",
        `${tier} ranked learning candidate from scanner output.`,
        powerHourTrial
          ? "Power Hour trial publishing is enabled for observation and learning."
          : null,
        ranking?.rank_reason ?? null,
        warningSummary.length > 0
          ? `Warnings: ${warningSummary.join(" ")}`
          : null,
      ]
        .filter(Boolean)
        .join(" "),
      risk_flags: warningSummary,
      timeframe: dayTradeHorizon,
      thesis:
        reasons.length > 0
          ? reasons.join(" ")
          : `${candidate.ticker} is a ${tier} ranked ${setupLabel} learning candidate with a defined intraday plan.`,
      invalidation: `The setup is invalidated if price trades below ${Number(
        candidate.proposed_stop_loss,
      ).toFixed(2)} or intraday momentum and volume confirmation fail.`,
      reason_to_avoid:
        warningSummary.length > 0
          ? warningSummary.join(" ")
          : "Avoid if price action invalidates the entry trigger, volume fades, or the market backdrop weakens.",
      tier,
      source_provider:
        candidate.intraday_indicator_source === "fresh" ||
        candidate.intraday_indicator_source === "cache"
          ? "twelve_data"
          : "provider_unavailable",
      market_data_source: candidate.intraday_indicator_source ?? "unknown",
      market_data_timestamp: candidate.intraday_indicator_cached_at ?? null,
      data_freshness: getDataFreshness(candidate),
      warning_summary: warningSummary,
      gap_summary: gapSummary,
      ranking_rank: ranking?.rank ?? null,
      ranking_reason:
        ranking?.rank_reason ??
        "Scanner ranking selected this structurally valid learning candidate.",
      batch_window: scanWindow,
      batch_type: powerHourTrial
        ? "observation_trial"
        : source === "scheduled"
          ? "official_scan"
          : "manual_scan",
      batch_status: powerHourTrial
        ? "observation_learning"
        : "learning_candidate",
      recommendation_build_path: "deterministic_fallback",
      plan_reference_price: planReferencePrice,
      entry_type_metadata: entryTypeMetadata,
      ...entryTypeMetadata,
      ...planReferencePrice,
    };
  });
}

function parseSettingNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isOpenPositionStatus(value: string | null | undefined) {
  return value?.trim().toLowerCase() === "open";
}

function logPipeline(label: string, value: unknown) {
  console.log(`[recommendations/generate] ${label}`, value);
}

async function saveMarketRegimeSnapshot(marketRegime: MarketRegime) {
  const serverSupabase = getServerSupabaseClient();

  if (!serverSupabase.client) {
    console.warn("[recommendations/generate] market_regime_snapshot_skipped", {
      reason: serverSupabase.unavailable_reason,
    });
    return;
  }

  const { error } = await serverSupabase.client.from("market_regime_snapshots").insert({
    regime: marketRegime.regime,
    summary: marketRegime.summary,
    spy_close: marketRegime.spy.close,
    spy_ma20: marketRegime.spy.ma20,
    spy_ma50: marketRegime.spy.ma50,
    spy_change_5d_percent: marketRegime.spy.change_5d_percent,
    spy_above_ma20: marketRegime.spy.above_ma20,
    spy_above_ma50: marketRegime.spy.above_ma50,
    qqq_close: marketRegime.qqq.close,
    qqq_ma20: marketRegime.qqq.ma20,
    qqq_ma50: marketRegime.qqq.ma50,
    qqq_change_5d_percent: marketRegime.qqq.change_5d_percent,
    qqq_above_ma20: marketRegime.qqq.above_ma20,
    qqq_above_ma50: marketRegime.qqq.above_ma50,
  });

  if (error) {
    console.error("[recommendations/generate] market_regime_snapshot_insert_error", {
      source: "supabase.market_regime_snapshots",
      operation: "insert",
      error: normalizeUnknownError(error),
    });
  }
}

function normalizeUserSettings(row?: UserSettingsRow | null): UserSettings {
  return {
    portfolio_size: parseSettingNumber(
      row?.portfolio_size,
      defaultUserSettings.portfolio_size,
    ),
    risk_per_trade_percent: parseSettingNumber(
      row?.risk_per_trade_percent,
      defaultUserSettings.risk_per_trade_percent,
    ),
    max_recommendations_per_session: clamp(
      Math.round(
        parseSettingNumber(
          row?.max_recommendations_per_session,
          defaultUserSettings.max_recommendations_per_session,
        ),
      ),
      1,
      10,
    ),
    max_open_positions: Math.max(
      1,
      Math.round(
        parseSettingNumber(
          row?.max_open_positions,
          defaultUserSettings.max_open_positions,
        ),
      ),
    ),
    preferred_timeframe:
      typeof row?.preferred_timeframe === "string" &&
      row.preferred_timeframe.trim()
        ? row.preferred_timeframe.trim()
        : defaultUserSettings.preferred_timeframe,
    long_only: row?.long_only ?? defaultUserSettings.long_only,
  };
}

function parseAiResponse(outputText: string): AiResponse {
  try {
    const parsed = JSON.parse(outputText) as unknown;

    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Response JSON was not an object.");
    }

    const response = parsed as {
      result?: unknown;
      recommendations?: unknown;
      reason?: unknown;
      confidence_score?: unknown;
      risk_flags?: unknown;
      candidate_ticker?: unknown;
    };

    if (response.result === "no_trade") {
      return {
        result: "no_trade",
        recommendations: [],
        no_trade: {
          reason: fallbackText(
            response.reason,
            "OpenAI did not find an actionable day trade setup.",
          ),
          confidence_score: nullableConfidenceScore(response.confidence_score),
          risk_flags: stringArray(response.risk_flags),
          candidate_ticker: normalizeTicker(response.candidate_ticker) || null,
        },
      };
    }

    if (
      response.result !== undefined &&
      response.result !== "trade_recommendation"
    ) {
      throw new Error("Response JSON result was not recognized.");
    }

    if (!Array.isArray(response.recommendations)) {
      throw new Error("Response JSON did not include a recommendations array.");
    }

    return {
      result: "trade_recommendation",
      recommendations: response.recommendations as AiRecommendation[],
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Unknown JSON parsing error.";

    throw new Error(`OpenAI returned invalid JSON: ${message}`);
  }
}

function sanitizeRecommendations(
  aiRecommendations: AiRecommendation[],
  availableCandidates: ScoredCandidate[],
  sessionType: SessionType,
  scanWindow: IntradayScanWindow,
  source: RecommendationGenerationSource,
  maxRecommendations: number,
  powerHourTrial = false,
): SanitizedRecommendationsResult {
  const candidatesByTicker = new Map(
    availableCandidates.map((candidate) => [candidate.ticker, candidate]),
  );
  const seenTickers = new Set<string>();
  const recommendations: RecommendationInsert[] = [];
  const skippedReasons: string[] = [];

  for (const [index, recommendation] of aiRecommendations
    .slice(0, maxRecommendations)
    .entries()) {
    try {
      const ticker = normalizeTicker(recommendation.ticker);
      const candidate = candidatesByTicker.get(ticker);

      if (!candidate) {
        throw new Error(
          `Recommendation ${index + 1} used ticker ${ticker || "(empty)"}, which was not an available candidate.`,
        );
      }

      if (seenTickers.has(ticker)) {
        throw new Error(`OpenAI returned duplicate ticker ${ticker}.`);
      }

      const companyName = text(candidate.company_name, `${ticker}.company_name`);
      text(recommendation.company_name, `${ticker}.company_name`);

      if (recommendation.direction !== "long") {
        throw new Error(`Recommendation ${ticker} direction must be long.`);
      }

      const finalConfidenceScore = confidenceScore(
        recommendation.confidence_score,
        `${ticker}.confidence_score`,
      );
      const setupType = normalizeSetupType(recommendation.setup_type);

      if (finalConfidenceScore < MINIMUM_OPENAI_CONFIDENCE_SCORE) {
        throw new Error(
          `Recommendation ${ticker} confidence_score ${finalConfidenceScore} is below ${MINIMUM_OPENAI_CONFIDENCE_SCORE}.`,
        );
      }

      validateConfidenceLabel(recommendation.confidence_label, ticker);
      validateConfidenceBreakdown(recommendation.confidence_breakdown, ticker);
      text(recommendation.confidence_reasoning, `${ticker}.confidence_reasoning`);

      if (!Array.isArray(recommendation.risk_flags)) {
        throw new Error(`Recommendation ${ticker} risk_flags must be an array.`);
      }

      for (const [riskFlagIndex, riskFlag] of recommendation.risk_flags.entries()) {
        text(riskFlag, `${ticker}.risk_flags.${riskFlagIndex}`);
      }

      const entryLow = number(recommendation.entry_low, `${ticker}.entry_low`);
      const entryHigh = number(recommendation.entry_high, `${ticker}.entry_high`);
      const stopLoss = number(recommendation.stop_loss, `${ticker}.stop_loss`);
      const target1 = number(recommendation.target_1, `${ticker}.target_1`);
      const target2 = number(recommendation.target_2, `${ticker}.target_2`);
      const riskReward = number(recommendation.risk_reward, `${ticker}.risk_reward`);

      if (entryLow > entryHigh) {
        throw new Error(`Recommendation ${ticker} entry_low is above entry_high.`);
      }

      if (stopLoss >= entryLow) {
        throw new Error(`Recommendation ${ticker} stop_loss must be below entry_low.`);
      }

      if (target1 <= entryHigh) {
        throw new Error(`Recommendation ${ticker} target_1 must be above entry_high.`);
      }

      if (target2 < target1) {
        throw new Error(`Recommendation ${ticker} target_2 must be at or above target_1.`);
      }

      if (riskReward <= 0) {
        throw new Error(`Recommendation ${ticker} risk_reward must be positive.`);
      }

      const warningSummary = stringArray(recommendation.warning_summary);
      const mergedWarningSummary = Array.from(
        new Set([
          ...warningSummary,
          ...(powerHourTrial ? POWER_HOUR_TRIAL_WARNINGS : []),
        ]),
      );
      const gapSummary = stringArray(recommendation.gap_summary);
      const riskFlags = Array.from(
        new Set([
          ...recommendation.risk_flags,
          ...(powerHourTrial ? POWER_HOUR_TRIAL_WARNINGS : []),
        ]),
      );
      const candidatePlanReferencePrice = buildPlanReferencePriceMetadata(candidate);
      const recommendationPlanReferencePrice = objectOrNull(
        recommendation.plan_reference_price,
      );
      const planReferencePrice: PlanReferencePriceMetadata = {
        reference_price_used_for_plan:
          nullableNumber(recommendation.reference_price_used_for_plan) ??
          nullableNumber(
            recommendationPlanReferencePrice?.reference_price_used_for_plan,
          ) ??
          candidatePlanReferencePrice.reference_price_used_for_plan,
        reference_price_source:
          nullableString(recommendation.reference_price_source) ??
          nullableString(recommendationPlanReferencePrice?.reference_price_source) ??
          candidatePlanReferencePrice.reference_price_source ??
          "unknown",
        reference_price_timestamp:
          nullableString(recommendation.reference_price_timestamp) ??
          nullableString(
            recommendationPlanReferencePrice?.reference_price_timestamp,
          ) ??
          candidatePlanReferencePrice.reference_price_timestamp,
        reference_price_symbol:
          nullableString(recommendation.reference_price_symbol) ??
          nullableString(recommendationPlanReferencePrice?.reference_price_symbol) ??
          candidatePlanReferencePrice.reference_price_symbol,
        reference_price_provider:
          nullableString(recommendation.reference_price_provider) ??
          nullableString(recommendationPlanReferencePrice?.reference_price_provider) ??
          candidatePlanReferencePrice.reference_price_provider,
        reference_price_read_path:
          nullableString(recommendation.reference_price_read_path) ??
          nullableString(recommendationPlanReferencePrice?.reference_price_read_path) ??
          candidatePlanReferencePrice.reference_price_read_path,
        plan_reference_metadata_status:
          recommendation.plan_reference_metadata_status ??
          (recommendationPlanReferencePrice?.plan_reference_metadata_status as
            | PlanReferenceMetadataStatus
            | undefined) ??
          candidatePlanReferencePrice.plan_reference_metadata_status,
        plan_reference_metadata_trace:
          planReferenceMetadataTraceOrNull(
            recommendationPlanReferencePrice?.plan_reference_metadata_trace,
          ) ??
          candidatePlanReferencePrice.plan_reference_metadata_trace,
      };
      const retainedPlanReferencePrice = markPlanReferenceRetained(planReferencePrice);
      const entryTypeMetadata = buildPlanEntryTypeMetadata({
        side: "long",
        entry: midpoint(entryLow, entryHigh),
        planReferencePrice: retainedPlanReferencePrice,
        source:
          nullableString(recommendation.entry_type_source) ===
          "deterministic_plan_builder"
            ? "deterministic_plan_builder"
            : "metadata_inference",
      });

      seenTickers.add(ticker);
      const confidenceMetadata = `${confidenceMetadataPrefix}${JSON.stringify({
        confidence_score: finalConfidenceScore,
        confidence_label: recommendation.confidence_label,
        confidence_breakdown: recommendation.confidence_breakdown,
        confidence_reasoning: recommendation.confidence_reasoning,
        risk_flags: riskFlags,
        plan_reference_price: retainedPlanReferencePrice,
        recommendation_build_path:
          recommendation.recommendation_build_path ??
          (recommendation.entry_type_source === "deterministic_plan_builder"
            ? "deterministic_fallback"
            : null),
        entry_type_metadata: entryTypeMetadata,
        ...entryTypeMetadata,
        ...retainedPlanReferencePrice,
        power_hour_trial: powerHourTrial,
        eod_risk: powerHourTrial ? "high" : null,
        recommendation_intent: powerHourTrial
          ? "learning_observation"
          : "day_trade",
        trial_copy: powerHourTrial ? POWER_HOUR_TRIAL_COPY : [],
        intraday_indicators: candidate.intraday_indicators ?? null,
        output_enrichment: buildRecommendationOutputEnrichmentMetadata({
          recommendation_source_mode:
            candidate.intraday_indicator_source === "fresh" ||
            candidate.intraday_indicator_source === "cache"
              ? "real"
              : "mixed",
          provider_source:
            candidate.intraday_indicator_source === "fresh" ||
            candidate.intraday_indicator_source === "cache"
              ? "twelve_data"
              : null,
          provider_status:
            candidate.intraday_indicator_source === "fresh" ||
            candidate.intraday_indicator_source === "cache"
              ? "observed"
              : "unavailable",
          market_data_source: candidate.intraday_indicator_source ?? null,
          market_data_timestamp: candidate.intraday_indicator_cached_at ?? null,
          candle_timestamp: candidate.intraday_indicator_cached_at ?? null,
          quote_timestamp: null,
          intraday_indicator_source: candidate.intraday_indicator_source ?? null,
          intraday_indicator_stale: candidate.intraday_indicator_stale ?? null,
          scanner_source: source,
          scan_window: scanWindow,
          build_marker: BUILD_MARKER,
          recommendation_publish_policy_version:
            RECOMMENDATION_PUBLISH_POLICY_VERSION,
        }),
        local_setup_type: candidate.setup_type,
        setup_type: setupType,
        openai_reality_contract: {
          tier: fallbackText(recommendation.tier, "unknown"),
          source_provider: fallbackText(
            recommendation.source_provider,
            "provider_unavailable",
          ),
          market_data_source: fallbackText(
            recommendation.market_data_source,
            "provider_unavailable",
          ),
          market_data_timestamp:
            nullableString(recommendation.market_data_timestamp) ??
            candidate.intraday_indicator_cached_at ??
            null,
          data_freshness: fallbackText(
            recommendation.data_freshness,
            getDataFreshness(candidate),
          ),
          warning_summary: mergedWarningSummary,
          gap_summary: gapSummary,
          ranking_rank: nullableNumber(recommendation.ranking_rank),
          ranking_reason: fallbackText(
            recommendation.ranking_reason,
            "Scanner ranking reason unavailable.",
          ),
          batch_window: fallbackText(recommendation.batch_window, scanWindow),
          batch_type: powerHourTrial
            ? "observation_trial"
            : fallbackText(recommendation.batch_type, source),
          batch_status: powerHourTrial
            ? "observation_learning"
            : fallbackText(recommendation.batch_status, "validated"),
        },
      })}]`;

      recommendations.push({
        session_type: sessionType,
        ticker,
        company_name: companyName,
        direction: "long",
        setup_type: setupType,
        entry_low: entryLow,
        entry_high: entryHigh,
        stop_loss: stopLoss,
        target_1: target1,
        target_2: target2,
        risk_reward: riskReward,
        // TODO: Persist confidence_score and confidence_breakdown in recommendations table.
        confidence: confidenceFromScore(finalConfidenceScore),
        // TODO: Future migration can add trade_horizon: "day_trade" | "swing_trade".
        // Until then, the existing timeframe column carries the day_trade horizon safely.
        timeframe: dayTradeHorizon,
        thesis: fallbackText(
          recommendation.thesis,
          "The intraday setup passed the scanner filters and has a defined same-day entry, stop, and target structure.",
        ),
        invalidation: fallbackText(
          recommendation.invalidation,
          "The setup is invalidated intraday if price breaks below the stop loss or volume and momentum fail before execution.",
        ),
        reason_to_avoid: `${[
          fallbackText(
            recommendation.reason_to_avoid,
            "Avoid if the setup loses intraday momentum, market conditions weaken, or price action invalidates the same-day trade plan.",
          ),
          ...(powerHourTrial ? POWER_HOUR_TRIAL_COPY : []),
        ].join(" ")}${confidenceMetadata}`,
        status: "new",
      });
    } catch (error) {
      skippedReasons.push(
        error instanceof Error && error.message
          ? error.message
          : `Recommendation ${index + 1} did not pass validation.`,
      );
    }
  }

  return { recommendations, skippedReasons };
}

function getScanWindowPrompt(
  scanWindow: IntradayScanWindow,
  preferredTimeframe: string,
) {
  const sharedRules = [
    `Current intraday scan window: ${scanWindow} (${getIntradayScanWindowLabel(scanWindow)}).`,
    `Treat the user's preferred timeframe (${preferredTimeframe}) as overridden by the app's day_trade horizon.`,
    "Generate only intraday day trade recommendations suitable for same-day execution.",
    "Avoid forcing trades. Return fewer recommendations or none when the candidates are weak.",
  ];

  if (scanWindow === "opening") {
    return [
      ...sharedRules,
      "Opening window: be very selective because opening volatility can create false moves.",
      "Require confirmation before entry, avoid chasing extended opening candles, and use tight intraday invalidation.",
    ].join("\n");
  }

  if (scanWindow === "morning_momentum") {
    return [
      ...sharedRules,
      "Morning momentum window: prefer clean momentum, breakout, VWAP-hold, and relative-strength setups.",
      "Require volume confirmation, a clear trigger, and realistic same-day target.",
    ].join("\n");
  }

  if (scanWindow === "midday") {
    return [
      ...sharedRules,
      "Midday window: avoid chop and lower-liquidity drift.",
      "Require exceptional quality; prefer no trade over a marginal setup.",
    ].join("\n");
  }

  if (scanWindow === "afternoon") {
    return [
      ...sharedRules,
      "Afternoon window: consider continuation or reversal only when the structure is clear.",
      "Reject vague setups and anything that needs overnight follow-through.",
    ].join("\n");
  }

  if (scanWindow === "power_hour") {
    return [
      ...sharedRules,
      "Power hour window: avoid new trades unless the setup is unusually strong and quick to manage.",
      "Any recommendation must include a warning that it must be managed before the close.",
    ].join("\n");
  }

  return [
    ...sharedRules,
    "This window is not suitable for new active day trade recommendations.",
  ].join("\n");
}

function getMarketRegimePrompt(marketRegime: MarketRegime) {
  if (marketRegime.regime === "risk_on") {
    return [
      "Market regime is risk_on.",
      "Use normal selectivity.",
      "Trend continuation and breakout setups are acceptable.",
    ].join("\n");
  }

  if (marketRegime.regime === "risk_off") {
    return [
      "Market regime is risk_off.",
      "Be very selective.",
      "Prefer fewer recommendations.",
      "Require strong relative strength and clean risk/reward.",
      "It is acceptable to return no recommendations.",
    ].join("\n");
  }

  return [
    "Market regime is neutral.",
    "Be selective.",
    "Prefer cleaner setups.",
    "Avoid marginal trades.",
  ].join("\n");
}

async function generateRecommendationsWithOpenAI(
  availableCandidates: ScoredCandidate[],
  sessionType: SessionType,
  scanWindow: IntradayScanWindow,
  settings: UserSettings,
  duplicateFallbackUsed: boolean,
  marketRegime: MarketRegime,
  scannerCandidateRankingSummary: ScannerCandidateRankingSummary,
  source: RecommendationGenerationSource,
  openPositionCount: number,
  powerHourTrial: boolean,
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Add it to .env.local.");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const maxRecommendations = settings.max_recommendations_per_session;
  const allowedDirections = ["long"];
  const batchContext = buildOpenAiBatchContext({
    scanWindow,
    source,
    targetCount: maxRecommendations,
    openPositionCount,
    maxOpenPositions: settings.max_open_positions,
    powerHourTrial,
  });
  const candidatePayloads = buildOpenAiCandidatePayloads({
    candidates: availableCandidates,
    rankingSummary: scannerCandidateRankingSummary,
  });
  const instructions = [
      "You generate intraday day trade recommendation candidates for a private trading app from structured scanner data.",
      "Some candidates include cached or fresh market data. Use provider, source, and timestamp fields when present.",
      "Only use the provided candidate data. Do not add facts from memory or broad market commentary.",
      "Do not fabricate missing values, catalysts, headlines, liquidity, spread, volume, or market facts.",
      "If provider/source/timestamp data is unavailable, say provider_unavailable or unknown in the required output fields.",
      "Do not pretend missing or stale data is real-time. Preserve candidate warnings and gaps.",
      "Treat the provided scanner fields as structured inputs. Do not invent missing prices, volume, liquidity, spread, or news.",
      "Do not alter entry, stop, or target levels unless the structured candidate fields support the change; prefer no_trade when levels are missing or invalid.",
      "Generate only intraday day trade recommendations.",
      "You are not required to create a trade recommendation.",
      source === "scheduled"
        ? "For scheduled official scans, publish structurally valid strong, valid, or experimental learning candidates when the ranked candidate data supports a coherent same-day plan."
        : "Prefer result=no_trade over a weak or unclear setup.",
      powerHourTrial ? POWER_HOUR_TRIAL_COPY.join(" ") : "",
      powerHourTrial
        ? "For this Power Hour trial, recommendations are observation/learning candidates, not high-confidence trade signals."
        : "",
      powerHourTrial
        ? `Every Power Hour trial recommendation must include these warnings: ${POWER_HOUR_TRIAL_WARNINGS.join(" ")}`
        : "",
      "Return no or limited recommendations when the provided candidate data is insufficient.",
      "Every trade must be suitable for same-day execution.",
      "Do not recommend swing trades or multi-day holds.",
      "If the setup requires holding overnight, reject it.",
      "Prioritize liquid US stocks, intraday momentum, volume confirmation, a clean entry trigger, tight invalidation, a realistic same-day target, and clear risk/reward.",
      source === "scheduled"
        ? "Do not require every recommendation to be a high-confidence trade signal; Valid and Experimental candidates are allowed as learning recommendations when clearly labeled by tier."
        : "Prefer no recommendation over a weak recommendation.",
      "Do not force a recommendation.",
      "Candidate passed local scan, but you must still reject it if risk/reward or intraday structure is weak.",
      "Use candidate_score, candidate_score_breakdown, candidate_score_reasons, candidate_score_warnings, scan_window, and market_regime as inputs to final confidence scoring.",
      "Each candidate includes a local setup_type guess. You may accept it, refine it to another allowed setup_type, or return UNKNOWN when unclear.",
      `Allowed setup_type values: ${SETUP_TYPES.join(", ")}.`,
      "setup_type must be exactly one allowed enum value, never free text.",
      "Use VWAP, intraday momentum, and volume trend as confirmation context when intraday_indicators are present.",
      "Do not recommend long day trades if price is clearly below VWAP and momentum is weakening unless there is a clear reclaim setup.",
      "Prefer no_trade when intraday indicators conflict with the setup.",
      "A trade recommendation may become invalid if VWAP, momentum, or volume confirmation weakens after generation.",
      "If indicators are weak at generation time, prefer no_trade.",
      "Include intraday confirmation notes in thesis, confidence_reasoning, risk_flags, or reason_to_avoid when indicator context is available.",
      "Use local scanner score as context, not as final truth.",
      "Respect scanner ranking order unless a visible validation issue explains demoting a higher-ranked candidate.",
      "Every returned recommendation must include tier, source_provider, market_data_source, market_data_timestamp, data_freshness, warning_summary, gap_summary, ranking_rank, ranking_reason, batch_window, batch_type, and batch_status.",
      "Copy tier/ranking/source/window metadata from the candidate and batch context when applicable; use unknown/provider_unavailable instead of inventing unavailable metadata.",
      "Reject the setup if the structure does not support an actionable same-day trade.",
      "Return result=no_trade if entry trigger is unclear, stop loss/invalidation is unclear, same-day target is unrealistic, risk/reward is below threshold, setup is too late, too choppy, not actionable, market regime conflicts with the trade, or the candidate requires holding overnight.",
      source === "scheduled"
        ? "For scheduled learning batches, weak volume or momentum should lower confidence and add warnings for Valid/Experimental candidates unless it makes the same-day plan structurally invalid."
        : "For manual generation, prefer no_trade when volume or momentum confirmation is weak.",
      "Only return result=trade_recommendation if the setup is actionable as an intraday day trade.",
      "If scan_window is pre_market or closed, do not return fresh active trade recommendations as tradable now.",
      powerHourTrial
        ? "If scan_window is power_hour, keep the recommendation intent as learning/observation and flag EOD risk as high."
        : "",
      "For no_trade, return an empty recommendations array plus reason, confidence_score or null, risk_flags, and candidate_ticker.",
      "For trade_recommendation, set reason and candidate_ticker to null and risk_flags to an empty array at the top level; keep per-trade risk_flags inside each recommendation.",
      "Explain if confidence differs from local scanner score.",
      "The local candidate_score is only a pre-filter. Your confidence_score is the final trade-quality score.",
      "You may lower confidence when the full setup is weak. Do not raise a weak candidate into a strong setup without clear confidence_reasoning.",
      "Prefer lower confidence on incomplete, stale, unavailable, or warning-heavy candidate data.",
      `If final confidence_score is below ${MINIMUM_OPENAI_CONFIDENCE_SCORE}, return result=no_trade for that candidate.`,
      "confidence_score must be 0-100. Use 85-100 for HIGH CONVICTION, 70-84 for GOOD SETUP, and 55-69 for LOWER CONFIDENCE.",
      "confidence_breakdown must score setup_quality, momentum_confirmation, volume_confirmation, risk_reward_quality, market_regime_alignment, and timing_quality from 0-100.",
      "A known setup_type may slightly support setup_quality or timing_quality only when the candidate's signals align. UNKNOWN should not receive a setup-type boost.",
      "OPENING_RANGE_BREAKOUT fits the opening window. VWAP_HOLD_CONTINUATION fits morning_momentum, midday, or afternoon only when VWAP and momentum align. HIGH_OF_DAY_BREAKOUT and BREAKOUT_CONTINUATION require clean momentum, risk/reward, and enough time left in the session.",
      "When data is missing, assign neutral or lower confidence and mention the missing data in confidence_reasoning or risk_flags.",
      "Each recommendation must include an entry trigger, stop loss / intraday invalidation, target, risk/reward, reason for the same-day opportunity, what would invalidate the setup intraday, and a time sensitivity / freshness note.",
      "Never imply guaranteed profitability, certainty, or risk-free outcomes.",
      `Choose up to ${maxRecommendations} recommendations, or fewer if quality is weak.`,
      `Set timeframe to ${dayTradeHorizon}.`,
      settings.long_only
        ? "The user's settings are long-only. Only return direction = long."
        : [
            "The user's settings may allow more directions later, but shorts are not implemented yet.",
            "For now, only return direction = long.",
          ].join(" "),
      getScanWindowPrompt(scanWindow, settings.preferred_timeframe),
      getMarketRegimePrompt(marketRegime),
      `Market regime summary: ${marketRegime.summary}`,
      "Use only tickers from the provided candidates.",
      duplicateFallbackUsed
        ? "Some candidates may have been recommended earlier today. Only repeat a ticker if the setup remains high quality."
        : "",
      "Make entry, stop, and target levels coherent with each candidate's proposed entry, stop, target, and latest price fields.",
      "risk_reward must be a JSON number such as 2.2, never a string such as 2.2R or 1:2.2.",
      "Only output JSON. Do not include markdown. Do not include explanations outside JSON.",
    ].join("\n");
  const inputPayload = {
      session_type: sessionType,
      scan_window: scanWindow,
      serving_batch: batchContext,
      max_recommendations: maxRecommendations,
      target_count_for_window: maxRecommendations,
      preferred_timeframe: settings.preferred_timeframe,
      allowed_directions: allowedDirections,
      market_regime: marketRegime,
      trade_horizon: dayTradeHorizon,
      scanner_ranking_summary: {
        generated_at: scannerCandidateRankingSummary.generated_at,
        candidates_ranked: scannerCandidateRankingSummary.candidates_ranked,
        selected_count: scannerCandidateRankingSummary.selected_count,
        target_min: scannerCandidateRankingSummary.target_min,
        target_max: scannerCandidateRankingSummary.target_max,
        target_status: scannerCandidateRankingSummary.target_status,
        top_ranking_reasons: scannerCandidateRankingSummary.top_ranking_reasons,
        top_penalty_reasons: scannerCandidateRankingSummary.top_penalty_reasons,
      },
      local_scoring: {
        threshold_note:
          "Candidates include candidate_score, candidate_score_breakdown, candidate_score_reasons, candidate_score_warnings, setup_type, setup_type_label, setup_type_description, ranking tier, and optional intraday_indicators from the app's scanner. Strong threshold is a tier label, not the only scheduled publication threshold.",
        setup_type_taxonomy: SETUP_TYPE_OPTIONS_FOR_PROMPT,
      },
      candidates: candidatePayloads,
    };

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    instructions,
    input: JSON.stringify(inputPayload),
    text: {
      format: {
        type: "json_schema",
        name: "trade_recommendations",
        strict: true,
        schema: createRecommendationSchema(maxRecommendations),
      },
    },
    temperature: 0.3,
    max_output_tokens: Math.max(3000, maxRecommendations * 650),
    store: false,
  });

  if (!response.output_text) {
    throw new Error("OpenAI returned an empty response.");
  }

  const parsedResponse = parseAiResponse(response.output_text);
  const realityGuard = buildOpenAiRecommendationRealityGuardSummary({
    instructionsText: instructions,
    inputPayload,
    scanWindow,
    batchWindow: batchContext.batch_window,
    batchType: batchContext.batch_type,
    batchStatus: batchContext.batch_status,
    targetCount: maxRecommendations,
    candidates: candidatePayloads,
    outputRecommendations: parsedResponse.recommendations,
    outputResult: parsedResponse.result,
    noTradeReason: parsedResponse.no_trade?.reason ?? null,
  });

  return {
    response: parsedResponse,
    realityGuard,
  };
}

export async function generateRecommendations({
  sessionType,
  scanWindow,
  targetCount,
  source,
  allowPowerHourRecommendationLogging = false,
  powerHourTrialPublishing = false,
  diagnosticMode = false,
  diagnosticRunId = null,
  diagnosticMaxTickers = null,
  scheduledMaxTickers = null,
  growMaxLearningMode = false,
  skipOpenAi = false,
  activeScanTrace = null,
}: GenerateRecommendationsInput) {
  try {
    const serverSupabase = diagnosticMode
      ? getServerSupabaseReadClient()
      : getServerSupabaseClient();
    const db = serverSupabase.client;

    if (!db) {
      throw new RecommendationGenerationError(
        `Server Supabase client unavailable: ${serverSupabase.unavailable_reason ?? "unknown"}`,
        500,
        {
          persistence_error_type:
            serverSupabase.unavailable_reason ?? "server_supabase_unavailable",
        },
      );
    }

    const todayStart = getStartOfToday();
    const scanPolicy = getIntradayScanPolicy(scanWindow);
    const powerHourTrial = isPowerHourTrialRun({
      scanWindow,
      source,
      powerHourTrialPublishing,
    });
    const effectiveScanPolicyMaxRecommendations = powerHourTrial
      ? POWER_HOUR_TRIAL_RECOMMENDATION_TARGET.max
      : scanPolicy.maxRecommendations;

    logPipeline("scan_window", scanWindow);
    logPipeline("scan_window_policy", scanPolicy);
    logPipeline("power_hour_trial_publishing", powerHourTrial);
    logPipeline("diagnostic_mode", diagnosticMode);
    logPipeline("diagnostic_max_tickers", diagnosticMaxTickers);
    logPipeline("scheduled_max_tickers", scheduledMaxTickers);
    logPipeline("grow_max_learning_mode", growMaxLearningMode);
    logPipeline("skip_openai", skipOpenAi);

    if (scanWindow === "pre_market") {
      logPipeline("pre_market_mode", "watchlist_only");
      logPipeline("inserted_recommendations_count", 0);

      return generatePreMarketWatchlist({ source });
    }

    if (
      scanWindow === "power_hour" &&
      !ALLOW_POWER_HOUR_NEW_RECOMMENDATIONS &&
      !allowPowerHourRecommendationLogging
    ) {
      logPipeline("inserted_recommendations_count", 0);

      return {
        recommendations: [],
        message:
          "Power hour: new recommendations disabled. Focus on managing active positions.",
        scan_window: scanWindow,
        scan_log: {
          ...publishVersionDetails(),
          result: "power_hour_blocked",
          no_publish_reason: "power_hour_disabled",
          power_hour_trial_enabled: powerHourTrialPublishing,
          power_hour_publish_allowed: false,
          power_hour_publish_block_reason: "power_hour_trial_not_allowed",
          candidates_scanned: 0,
        } satisfies RecommendationScanLogDetails,
      };
    }

    if (!scanPolicy.allowGeneration && !allowPowerHourRecommendationLogging) {
      logPipeline("inserted_recommendations_count", 0);

      return {
        recommendations: [],
        message: scanPolicy.message,
        scan_window: scanWindow,
        scan_log: {
          ...publishVersionDetails(),
          result: "skipped",
          no_publish_reason: "outside_generation_window",
          power_hour_trial_enabled: powerHourTrialPublishing,
          power_hour_publish_allowed: powerHourTrial,
          power_hour_publish_block_reason: null,
          candidates_scanned: 0,
        } satisfies RecommendationScanLogDetails,
      };
    }

    const [
      settingsResult,
      todaysRecommendationsResult,
      currentRecommendationsResult,
      openPositionsResult,
    ] = await Promise.all([
        db
          .from("user_settings")
          .select(
            [
              "portfolio_size",
              "risk_per_trade_percent",
              "max_recommendations_per_session",
              "max_open_positions",
              "preferred_timeframe",
              "long_only",
            ].join(","),
          )
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle(),
        db
          .from("recommendations")
          .select("ticker,session_type")
          .gte("created_at", todayStart),
        db
          .from("recommendations")
          .select("ticker,status,archived,created_at")
          .or("status.eq.new,status.is.null")
          .or("archived.eq.false,archived.is.null")
          .gte("created_at", getDefaultRecommendationExpiryCutoff()),
        db.from("positions").select("ticker,status"),
      ]);

    if (settingsResult.error) {
      console.error("[recommendations/generate] settings_load_error", {
        source: "supabase.user_settings",
        operation: "select_latest_settings",
        error: normalizeUnknownError(settingsResult.error),
      });
      throw new RecommendationGenerationError(
        settingsResult.error.message ?? "Unknown error",
        500,
      );
    }

    if (todaysRecommendationsResult.error) {
      console.error("[recommendations/generate] todays_recommendations_load_error", {
        source: "supabase.recommendations",
        operation: "select_todays_recommendations",
        error: normalizeUnknownError(todaysRecommendationsResult.error),
      });
      throw new RecommendationGenerationError(
        todaysRecommendationsResult.error.message ?? "Unknown error",
        500,
      );
    }

    if (currentRecommendationsResult.error) {
      console.error("[recommendations/generate] current_recommendations_load_error", {
        source: "supabase.recommendations",
        operation: "select_current_recommendations",
        error: normalizeUnknownError(currentRecommendationsResult.error),
      });
      throw new RecommendationGenerationError(
        currentRecommendationsResult.error.message ?? "Unknown error",
        500,
      );
    }

    if (openPositionsResult.error) {
      console.error("[recommendations/generate] open_positions_load_error", {
        source: "supabase.positions",
        operation: "select_open_positions",
        error: normalizeUnknownError(openPositionsResult.error),
      });
      throw new RecommendationGenerationError(
        openPositionsResult.error.message ?? "Unknown error",
        500,
      );
    }

    const settingsRow = settingsResult.data as UserSettingsRow | null;
    const baseSettings = normalizeUserSettings(settingsRow);
    const growMaxRecommendationTarget =
      growMaxLearningMode && typeof scheduledMaxTickers === "number"
        ? Math.max(1, scheduledMaxTickers)
        : null;
    const requestedMaxRecommendations =
      typeof targetCount === "number" && Number.isFinite(targetCount)
        ? clamp(Math.round(targetCount), 1, effectiveScanPolicyMaxRecommendations)
        : growMaxRecommendationTarget !== null
          ? growMaxRecommendationTarget
        : Math.min(
            baseSettings.max_recommendations_per_session,
            effectiveScanPolicyMaxRecommendations,
          );
    const maxRecommendationsForRun =
      powerHourTrial
        ? powerHourTrialTarget(targetCount)
        : source === "scheduled"
        ? requestedMaxRecommendations
        : requestedMaxRecommendations;
    const settings = {
      ...baseSettings,
      max_recommendations_per_session: maxRecommendationsForRun,
    };
    const openPositions = ((openPositionsResult.data ?? []) as PositionStatusRow[])
      .filter((position) => isOpenPositionStatus(position.status));
    const openPositionCount = openPositions.length;
    const isGenerationBlocked = openPositionCount >= settings.max_open_positions;

    const tickerRecommendationCounts: Record<string, TickerRecommendationCounts> =
      {};
    const todaysRecommendations =
      (todaysRecommendationsResult.data ?? []) as RecommendationTickerRow[];
    const currentRecommendations =
      (currentRecommendationsResult.data ?? []) as RecommendationTickerRow[];
    const currentRecommendationTickers = currentRecommendations
      .map((recommendation) => normalizeTicker(recommendation.ticker))
      .filter(Boolean);

    for (const recommendation of todaysRecommendations) {
      const ticker = normalizeTicker(recommendation.ticker);

      if (!ticker) {
        continue;
      }

      tickerRecommendationCounts[ticker] = tickerRecommendationCounts[ticker] || {
        totalToday: 0,
        sameSessionToday: 0,
      };
      tickerRecommendationCounts[ticker].totalToday += 1;

      if (recommendation.session_type === sessionType) {
        tickerRecommendationCounts[ticker].sameSessionToday += 1;
      }
    }

    const alreadyRecommendedTickers = Object.entries(tickerRecommendationCounts)
      .filter(([, counts]) => counts.sameSessionToday > 0)
      .map(([ticker]) => ticker);
    const openPositionTickers = openPositions
      .map((position) => normalizeTicker(position.ticker))
      .filter(Boolean);
    const currentRecommendationTickerSet = new Set(currentRecommendationTickers);

    logPipeline("source", source);
    logPipeline("session_type", sessionType);
    logPipeline("target_count", targetCount ?? null);
    logPipeline(
      "max_recommendations_per_session",
      settings.max_recommendations_per_session,
    );
    logPipeline("open_positions_count", openPositionCount);
    logPipeline("max_open_positions", settings.max_open_positions);
    logPipeline(
      "tickers_already_recommended_for_same_session_today",
      alreadyRecommendedTickers,
    );
    logPipeline("ticker_recommendation_counts_today", tickerRecommendationCounts);
    logPipeline("current_recommendations_count", currentRecommendations.length);
    logPipeline("current_recommendation_tickers", currentRecommendationTickers);
    logPipeline("open_position_tickers", openPositionTickers);
    logPipeline("generation_blocked", isGenerationBlocked);

    if (
      source === "scheduled" &&
      !diagnosticMode &&
      !growMaxLearningMode &&
      currentRecommendations.length >= MAX_CURRENT_RECOMMENDATIONS
    ) {
      const message =
        "Current recommendation limit reached. Waiting for existing setups to resolve or expire.";

      logPipeline("scheduled_skip_reason", message);
      logPipeline("inserted_recommendations_count", 0);

      return {
        recommendations: [],
        message,
        scan_window: scanWindow,
        scan_log: {
          ...publishVersionDetails(),
          result: "recommendation_limit_reached",
          no_publish_reason: "recommendation_limit_reached",
          recommendation_limit_status: "same_window_limit_reached",
          power_hour_trial_enabled: powerHourTrialPublishing,
          power_hour_publish_allowed: powerHourTrial,
          power_hour_publish_block_reason: null,
          candidates_scanned: 0,
        } satisfies RecommendationScanLogDetails,
      };
    }

    if (isGenerationBlocked) {
      throw new RecommendationGenerationError(
        "Max open positions reached. Close or reduce positions before generating new recommendations.",
        400,
        {
          open_positions_count: openPositionCount,
          max_open_positions: settings.max_open_positions,
        },
      );
    }

    const scannerUniverseSelection = buildRealScannerBaseCandidateSelection({
      scanWindow,
      requestedScanBudget: diagnosticMode
        ? diagnosticMaxTickers
        : scheduledMaxTickers ?? undefined,
    });
    const scannerBaseCandidates =
      diagnosticMode && typeof diagnosticMaxTickers === "number"
        ? scannerUniverseSelection.candidates.slice(0, diagnosticMaxTickers)
        : typeof scheduledMaxTickers === "number"
          ? scannerUniverseSelection.candidates.slice(0, scheduledMaxTickers)
        : scannerUniverseSelection.candidates;
    const universeCoverage = scannerUniverseSelection.coverage;
    const dynamicMoversDiscovery = await discoverDynamicMoversDiagnostics({
      candidates: scannerBaseCandidates,
      maxTickers: diagnosticMode
        ? diagnosticMaxTickers
        : scheduledMaxTickers ?? undefined,
      now: new Date(),
    });

    activeScanTrace?.markStage("universe", "completed");
    activeScanTrace?.updateUniverse({
      total_enabled:
        universeCoverage?.enabled_tickers ?? scannerBaseCandidates.length,
      selected_tickers_count:
        universeCoverage?.selected_tickers ?? scannerBaseCandidates.length,
      selected_tickers_sample: scannerBaseCandidates
        .map((candidate) => candidate.ticker)
        .slice(0, 12),
      scan_budget:
        typeof universeCoverage?.scan_budget?.selected_tickers === "number"
          ? universeCoverage.scan_budget.selected_tickers
          : null,
    });

    const scannerCandidates = await scanMarket(
      scannerBaseCandidates.length > 0 ? scannerBaseCandidates : mockCandidates,
      {
        source,
        activeScanTrace,
        maxFreshProviderCalls: diagnosticMode
          ? Math.min(1, scannerBaseCandidates.length)
          : typeof scheduledMaxTickers === "number"
            ? Math.min(1, scannerBaseCandidates.length)
          : undefined,
      },
    );
    updateRawCandidateTrace(activeScanTrace, scannerCandidates);
    const initialRealScannerCandidateGeneration =
      buildRealScannerCandidateGenerationSummary({
        universe: scannerBaseCandidates,
        candidates: scannerCandidates,
        scanWindow,
        source,
        providerSource: "twelve_data",
        universeSelection: scannerUniverseSelection.selection,
      });

    logPipeline(
      "total_scanner_candidates_before_filtering",
      scannerCandidates.length,
    );
    logPipeline(
      "real_scanner_candidate_generation",
      initialRealScannerCandidateGeneration,
    );
    logPipeline("dynamic_movers_discovery", dynamicMoversDiscovery);

    if (scannerCandidates.length === 0) {
      if (source === "scheduled") {
        return {
          recommendations: [],
          message: "Scan completed. No high-quality day trade setup found.",
          scan_window: scanWindow,
          scan_log: {
            ...publishVersionDetails(),
            result: "no_high_quality_setup",
            no_publish_reason: "no_raw_candidates",
            power_hour_trial_enabled: powerHourTrialPublishing,
            power_hour_publish_allowed: powerHourTrial,
            power_hour_publish_block_reason: null,
            candidates_scanned: 0,
            real_scanner_candidate_generation:
              initialRealScannerCandidateGeneration,
            dynamic_movers_discovery: dynamicMoversDiscovery,
          } satisfies RecommendationScanLogDetails,
        };
      }

      throw new RecommendationGenerationError(
        scannerCacheWarmingMessage,
        400,
      );
    }

    const openPositionTickerSet = new Set<string>();

    for (const ticker of openPositionTickers) {
      openPositionTickerSet.add(ticker);
    }

    let marketRegime = neutralMarketRegimeFallback;

    try {
      marketRegime = await getMarketRegime();
    } catch (error) {
      console.error("[recommendations/generate] market_regime_error", {
        error: normalizeUnknownError(error),
      });
    }

    logPipeline("market_regime", marketRegime);
    await saveMarketRegimeSnapshot(marketRegime);

    const scannerRankByTicker = new Map(
      scannerCandidates.map((candidate, index) => [candidate.ticker, index]),
    );

    function getTickerCounts(ticker: string): TickerRecommendationCounts {
      return (
        tickerRecommendationCounts[ticker] || {
          totalToday: 0,
          sameSessionToday: 0,
        }
      );
    }

    function isAllowedByCooldown(
      candidate: MockCandidate,
      allowSameSessionRepeat: boolean,
      removedReasons: string[],
    ) {
      const counts = getTickerCounts(candidate.ticker);
      const maxTickerRecommendationsToday = growMaxLearningMode ? 3 : 2;

      if (counts.totalToday >= maxTickerRecommendationsToday) {
        removedReasons.push(
          `${candidate.ticker}: recommended ${counts.totalToday} times today`,
        );
        return false;
      }

      if (!allowSameSessionRepeat && counts.sameSessionToday >= 1) {
        removedReasons.push(
          `${candidate.ticker}: already recommended in ${sessionType} today`,
        );
        return false;
      }

      return true;
    }

    function sortCandidatesByDiversity(
      firstCandidate: MockCandidate,
      secondCandidate: MockCandidate,
    ) {
      const firstCounts = getTickerCounts(firstCandidate.ticker);
      const secondCounts = getTickerCounts(secondCandidate.ticker);
      const totalCountDifference =
        firstCounts.totalToday - secondCounts.totalToday;

      if (totalCountDifference !== 0) {
        return totalCountDifference;
      }

      const sameSessionDifference =
        firstCounts.sameSessionToday - secondCounts.sameSessionToday;

      if (sameSessionDifference !== 0) {
        return sameSessionDifference;
      }

      return (
        (scannerRankByTicker.get(firstCandidate.ticker) ?? Number.MAX_SAFE_INTEGER) -
        (scannerRankByTicker.get(secondCandidate.ticker) ?? Number.MAX_SAFE_INTEGER)
      );
    }

    const freshCandidatesRemovedByCooldown: string[] = [];
    const freshCandidates = scannerCandidates
      .filter((candidate) => {
        if (openPositionTickerSet.has(candidate.ticker)) {
          freshCandidatesRemovedByCooldown.push(
            `${candidate.ticker}: Active position already exists for ticker. Skipping.`,
          );
          return false;
        }

        if (
          !growMaxLearningMode &&
          currentRecommendationTickerSet.has(candidate.ticker)
        ) {
          freshCandidatesRemovedByCooldown.push(
            `${candidate.ticker}: Existing current setup found for ticker. Skipping duplicate.`,
          );
          return false;
        }

        return true;
      })
      .filter((candidate) =>
        isAllowedByCooldown(candidate, false, freshCandidatesRemovedByCooldown),
      )
      .sort(sortCandidatesByDiversity);
    const duplicateFallbackUsed = freshCandidates.length === 0;
    const duplicateFallbackMessage =
      "No fresh tickers were available, so Trade allowed repeat candidates for this scan.";
    const fallbackCandidatesRemovedByCooldown: string[] = [];
    const availableCandidates = duplicateFallbackUsed
      ? scannerCandidates
          .filter((candidate) => {
            if (openPositionTickerSet.has(candidate.ticker)) {
              fallbackCandidatesRemovedByCooldown.push(
                `${candidate.ticker}: Active position already exists for ticker. Skipping.`,
              );
              return false;
            }

            if (
              !growMaxLearningMode &&
              currentRecommendationTickerSet.has(candidate.ticker)
            ) {
              fallbackCandidatesRemovedByCooldown.push(
                `${candidate.ticker}: Existing current setup found for ticker. Skipping duplicate.`,
              );
              return false;
            }

            return true;
          })
          .filter((candidate) =>
            isAllowedByCooldown(
              candidate,
              true,
              fallbackCandidatesRemovedByCooldown,
            ),
          )
          .sort(sortCandidatesByDiversity)
      : freshCandidates;
    const candidatesRemovedByCooldown = duplicateFallbackUsed
      ? fallbackCandidatesRemovedByCooldown
      : freshCandidatesRemovedByCooldown;
    if (availableCandidates.length === 0) {
      logPipeline("scanner_candidates_after_filtering", 0);
      logPipeline("candidates_removed_by_cooldown", candidatesRemovedByCooldown);
      logPipeline("candidate_tickers_sent_to_openai", []);
      logPipeline("final_candidate_tickers_sent_to_openai", []);
      logPipeline("duplicate_fallback_used", duplicateFallbackUsed);

      return {
        recommendations: [],
        message:
          candidatesRemovedByCooldown.find((reason) =>
            reason.includes("Active position already exists"),
          ) ??
          candidatesRemovedByCooldown.find((reason) =>
            reason.includes("Existing current setup"),
          ) ??
          (source === "manual"
            ? scannerCacheWarmingMessage
            : "Scan completed. No high-quality day trade setup found."),
        duplicate_fallback_used: duplicateFallbackUsed,
        market_regime: marketRegime,
        scan_window: scanWindow,
        scan_log: {
          ...publishVersionDetails(),
          result: candidatesRemovedByCooldown.some((reason) =>
            reason.includes("Active position already exists"),
          )
            ? "active_position_exists"
            : candidatesRemovedByCooldown.some((reason) =>
                  reason.includes("Existing current setup"),
                )
              ? "duplicate_ticker_skipped"
              : "no_high_quality_setup",
          no_publish_reason: "candidate_cooldown_filtered_all",
          recommendation_build_path: "no_publish",
          recommendations_built_count: 0,
          power_hour_trial_enabled: powerHourTrialPublishing,
          power_hour_publish_allowed: powerHourTrial,
          power_hour_publish_block_reason: null,
          candidates_scanned: scannerCandidates.length,
          skipped_tickers: candidatesRemovedByCooldown.length,
          real_scanner_candidate_generation:
            initialRealScannerCandidateGeneration,
          dynamic_movers_discovery: dynamicMoversDiscovery,
        } satisfies RecommendationScanLogDetails,
      };
    }

    const initiallyScoredCandidates = availableCandidates
      .map((candidate) =>
        toScoredCandidate(candidate, {
          marketRegime,
          scanWindow,
        }),
      )
      .sort(
        (first, second) =>
          second.local_score - first.local_score ||
          sortCandidatesByDiversity(first, second),
      );
    const scannerCandidateRankingSummary =
      buildScannerCandidateRankingSummary({
        candidates: initiallyScoredCandidates,
        scanWindow,
        universeCoverage: scannerUniverseSelection.coverage,
        targetMin:
          growMaxRecommendationTarget !== null
            ? growMaxRecommendationTarget
            : undefined,
        targetMax:
          growMaxRecommendationTarget !== null
            ? growMaxRecommendationTarget
            : undefined,
      });
    activeScanTrace?.markStage("ranking", "completed");
    activeScanTrace?.updateRanking({
      ranking_attempted: true,
      ranked_count: scannerCandidateRankingSummary.candidates_ranked,
      selected_count: scannerCandidateRankingSummary.selected_count,
      top_score: scannerCandidateRankingSummary.score_range.max,
      average_score: scannerCandidateRankingSummary.average_score,
      top_penalties: scannerCandidateRankingSummary.top_penalty_reasons.slice(0, 8),
    });
    const rankingRankByTicker = new Map(
      scannerCandidateRankingSummary.results.map((result) => [
        result.ticker,
        result.rank,
      ]),
    );
    const rankingResultByTicker = new Map(
      scannerCandidateRankingSummary.results.map((result) => [
        result.ticker,
        result,
      ]),
    );
    const scoredCandidates = [...initiallyScoredCandidates].sort(
      (first, second) =>
        (rankingRankByTicker.get(first.ticker) ?? Number.MAX_SAFE_INTEGER) -
          (rankingRankByTicker.get(second.ticker) ?? Number.MAX_SAFE_INTEGER) ||
        second.local_score - first.local_score ||
        sortCandidatesByDiversity(first, second),
    );
    const strongThreshold = getDayTradeScoreThreshold(scanWindow, source);
    const publishableThreshold = getPublishableLearningScoreThreshold(source);
    const topCandidate = scoredCandidates[0] ?? null;
    const topCandidateScore = topCandidate?.local_score ?? 0;
    const topCandidateSetupType = topCandidate?.setup_type ?? null;
    const topCandidateBreakdown = topCandidate?.local_score_breakdown ?? null;
    const topCandidateReasons = topCandidate?.local_score_reasons.slice(0, 3) ?? null;
    const topCandidateWarnings =
      topCandidate?.local_score_warnings.slice(0, 3) ?? null;
    const topCandidateIndicators = compactIntradayIndicators(
      topCandidate?.intraday_indicators,
    );
    const topCandidateIndicatorSource =
      topCandidate?.intraday_indicator_source ?? null;
    const topCandidateIndicatorCachedAt =
      topCandidate?.intraday_indicator_cached_at ?? null;
    const topCandidateIndicatorStale =
      typeof topCandidate?.intraday_indicator_stale === "boolean"
        ? topCandidate.intraday_indicator_stale
        : null;
    const selectedRankingTickerSet = new Set(
      scannerCandidateRankingSummary.selection.selected_tickers,
    );
    const qualifiedCandidates = scoredCandidates.filter((candidate) => {
      const ranking = rankingResultByTicker.get(candidate.ticker);

      return (
        selectedRankingTickerSet.has(candidate.ticker) &&
        candidate.local_score >= publishableThreshold &&
        (ranking?.score.tier === "strong" ||
          ranking?.score.tier === "valid" ||
          ranking?.score.tier === "experimental")
      );
    });
    const strongQualifiedCount = qualifiedCandidates.filter(
      (candidate) => rankingResultByTicker.get(candidate.ticker)?.score.tier === "strong",
    ).length;
    const validQualifiedCount = qualifiedCandidates.filter(
      (candidate) => rankingResultByTicker.get(candidate.ticker)?.score.tier === "valid",
    ).length;
    const experimentalQualifiedCount = qualifiedCandidates.filter(
      (candidate) =>
        rankingResultByTicker.get(candidate.ticker)?.score.tier === "experimental",
    ).length;
    const candidateLimit =
      source === "scheduled"
        ? Math.max(1, settings.max_recommendations_per_session)
        : Math.max(6, settings.max_recommendations_per_session * 3);
    const candidatesForOpenAI = qualifiedCandidates.slice(0, candidateLimit);
    const availableCandidateTickers = availableCandidates.map(
      (candidate) => candidate.ticker,
    );
    const candidateTickersForOpenAI = candidatesForOpenAI.map(
      (candidate) => candidate.ticker,
    );
    const realScannerCandidateGeneration =
      buildRealScannerCandidateGenerationSummary({
        universe: scannerBaseCandidates,
        candidates: scoredCandidates,
        scanWindow,
        source,
        visibleCandidateTickers: candidateTickersForOpenAI,
        providerSource: "twelve_data",
        universeSelection: scannerUniverseSelection.selection,
        scannerCandidateRanking: scannerCandidateRankingSummary,
      });
    const scoredCandidateSummary = scoredCandidates.slice(0, 8).map((candidate) => ({
      ticker: candidate.ticker,
      score: candidate.local_score,
      setup_type: candidate.setup_type,
      breakdown: candidate.local_score_breakdown,
      reasons: candidate.local_score_reasons,
      warnings: candidate.local_score_warnings,
      intraday_indicators: compactIntradayIndicators(candidate.intraday_indicators),
    }));

    logPipeline("scanner_candidates_after_filtering", availableCandidates.length);
    logPipeline("scanner_candidate_tickers_after_filtering", availableCandidateTickers);
    logPipeline("candidates_removed_by_cooldown", candidatesRemovedByCooldown);
    logPipeline("strong_day_trade_score_threshold", strongThreshold);
    logPipeline("publishable_learning_score_threshold", publishableThreshold);
    logPipeline("top_scored_candidate", topCandidate?.ticker ?? null);
    logPipeline("top_scored_candidate_score", topCandidateScore);
    logPipeline("top_scored_candidate_setup_type", topCandidateSetupType);
    logPipeline("scored_candidates", scoredCandidateSummary);
    logPipeline("scanner_candidate_ranking", scannerCandidateRankingSummary);
    logPipeline("real_scanner_candidate_generation", realScannerCandidateGeneration);
    logPipeline("candidate_tickers_sent_to_openai", candidateTickersForOpenAI);
    logPipeline("final_candidate_tickers_sent_to_openai", candidateTickersForOpenAI);
    logPipeline("duplicate_fallback_used", duplicateFallbackUsed);

    if (candidatesForOpenAI.length === 0) {
      const message =
        qualifiedCandidates.length === 0
          ? "Scan completed. No structurally valid ranked learning candidates were publishable."
          : "Scan completed. Ranked candidates were available but none fit the publication limit.";

      logPipeline("inserted_recommendations_count", 0);
      logPipeline("skip_openai_reason", message);

      return {
        recommendations: [],
        message,
        duplicate_fallback_used: duplicateFallbackUsed,
        market_regime: marketRegime,
        scan_window: scanWindow,
        scan_log: {
          ...publishVersionDetails(),
          result: "no_high_quality_setup",
          top_candidate_ticker: topCandidate?.ticker ?? null,
          top_candidate_score: topCandidateScore,
          top_candidate_setup_type: topCandidateSetupType,
          top_candidate_breakdown: topCandidateBreakdown,
          top_candidate_reasons: topCandidateReasons,
          top_candidate_warnings: topCandidateWarnings,
          top_candidate_indicators: topCandidateIndicators,
          indicator_source: topCandidateIndicatorSource,
          indicator_cached_at: topCandidateIndicatorCachedAt,
          indicator_stale: topCandidateIndicatorStale,
          threshold: strongThreshold,
          strong_threshold: strongThreshold,
          publishable_threshold: publishableThreshold,
          ranked_candidates_count: scannerCandidateRankingSummary.selected_count,
          recommendations_published_count: 0,
          recommendation_build_path: "no_publish",
          recommendations_built_count: 0,
          strong_count: strongQualifiedCount,
          valid_count: validQualifiedCount,
          experimental_count: experimentalQualifiedCount,
          ranked_candidates_not_published_reason: message,
          no_publish_reason:
            qualifiedCandidates.length === 0
              ? "no_publishable_ranked_candidates"
              : "publish_limit_selected_zero_candidates",
          power_hour_trial_enabled: powerHourTrialPublishing,
          power_hour_publish_allowed: powerHourTrial,
          power_hour_publish_block_reason: null,
          deterministic_fallback_used: false,
          candidates_scanned: scoredCandidates.length,
          skipped_tickers: candidatesRemovedByCooldown.length,
          real_scanner_candidate_generation: realScannerCandidateGeneration,
          dynamic_movers_discovery: dynamicMoversDiscovery,
          scanner_candidate_ranking: scannerCandidateRankingSummary,
          grow_max_learning_mode: growMaxLearningMode,
          target_ideas_per_window: growMaxRecommendationTarget,
        } satisfies RecommendationScanLogDetails,
      };
    }

    activeScanTrace?.markStage("openai", "started");
    activeScanTrace?.updateOpenAi({
      openai_attempted: true,
      input_candidate_count: candidatesForOpenAI.length,
    });

    let deterministicFallbackUsed = false;
    let deterministicFallbackReason: string | null = null;
    let aiResponse: AiResponse;
    let openAiOutputRecommendationCount = 0;
    let openAiRealityGuardSummary: OpenAiRecommendationRealityGuardSummary | null =
      null;

    function deterministicFallback(reason: string): AiResponse {
      deterministicFallbackUsed = true;
      deterministicFallbackReason = reason;
      const recommendations = buildDeterministicLearningRecommendations({
        candidates: candidatesForOpenAI,
        rankingSummary: scannerCandidateRankingSummary,
        scanWindow,
        source,
        maxRecommendations: settings.max_recommendations_per_session,
        powerHourTrial,
      });

      logPipeline("deterministic_fallback_used", true);
      logPipeline("deterministic_fallback_reason", reason);
      logPipeline(
        "deterministic_fallback_recommendations_count",
        recommendations.length,
      );

      return {
        result: "trade_recommendation",
        recommendations,
      };
    }

    try {
      if (skipOpenAi) {
        activeScanTrace?.markStage("openai", "skipped");
        activeScanTrace?.updateOpenAi({
          openai_attempted: false,
          input_candidate_count: candidatesForOpenAI.length,
          output_recommendation_count: 0,
        });
        aiResponse = deterministicFallback("Diagnostic run skipped OpenAI.");
      } else {
        const openAiResult = await generateRecommendationsWithOpenAI(
          candidatesForOpenAI,
          sessionType,
          scanWindow,
          settings,
          duplicateFallbackUsed,
          marketRegime,
          scannerCandidateRankingSummary,
          source,
          openPositionCount,
          powerHourTrial,
        );
        aiResponse = openAiResult.response;
        openAiOutputRecommendationCount = aiResponse.recommendations.length;
        openAiRealityGuardSummary = openAiResult.realityGuard;
      }
    } catch (openAiError) {
      activeScanTrace?.markStage("openai", "failed");
      activeScanTrace?.updateOpenAi({
        openai_error_type: errorType(openAiError),
      });
      aiResponse = deterministicFallback(`OpenAI error: ${errorType(openAiError)}`);
    }

    activeScanTrace?.markStage("openai", skipOpenAi ? "skipped" : "completed");
    activeScanTrace?.updateOpenAi({
      output_recommendation_count: openAiOutputRecommendationCount,
    });
    logPipeline("raw_openai_recommendations_count", openAiOutputRecommendationCount);
    logPipeline(
      "openai_recommendation_reality_guard",
      openAiRealityGuardSummary,
    );

    if (aiResponse.result === "no_trade") {
      const noTrade = aiResponse.no_trade;
      const rejectedTicker =
        noTrade?.candidate_ticker ||
        topCandidate?.ticker ||
        candidateTickersForOpenAI[0] ||
        "candidate";
      const rejectedReason =
        noTrade?.reason || "OpenAI did not find an actionable day trade setup.";
      const message = `OpenAI rejected candidate ${rejectedTicker}: ${rejectedReason}`;

      logPipeline("openai_no_trade_ticker", rejectedTicker);
      logPipeline("openai_no_trade_reason", rejectedReason);
      logPipeline("validated_recommendations_count", 0);
      aiResponse = deterministicFallback(message);
    }

    if (aiResponse.recommendations.length === 0) {
      logPipeline("validated_recommendations_count", 0);
      logPipeline("skipped_recommendations_count", 0);
      logPipeline("skipped_recommendation_reasons", []);
      aiResponse = deterministicFallback("OpenAI returned zero recommendations.");
    }

    let sanitizedRecommendations = sanitizeRecommendations(
      aiResponse.recommendations,
      candidatesForOpenAI,
      sessionType,
      scanWindow,
      source,
      settings.max_recommendations_per_session,
      powerHourTrial,
    );
    activeScanTrace?.updateOpenAi({
      parser_rejected_count: sanitizedRecommendations.skippedReasons.length,
    });
    let recommendationsToInsert = sanitizedRecommendations.recommendations;

    if (recommendationsToInsert.length === 0 && !deterministicFallbackUsed) {
      aiResponse = deterministicFallback(
        `OpenAI recommendations rejected by sanitizer: ${sanitizedRecommendations.skippedReasons
          .slice(0, 3)
          .join(" ")}`,
      );
      sanitizedRecommendations = sanitizeRecommendations(
        aiResponse.recommendations,
        candidatesForOpenAI,
        sessionType,
        scanWindow,
        source,
        settings.max_recommendations_per_session,
        powerHourTrial,
      );
      recommendationsToInsert = sanitizedRecommendations.recommendations;
      activeScanTrace?.updateOpenAi({
        parser_rejected_count: sanitizedRecommendations.skippedReasons.length,
      });
    }

    if (openAiRealityGuardSummary) {
      openAiRealityGuardSummary = finalizeOpenAiRecommendationRealityGuardSummary(
        openAiRealityGuardSummary,
        {
        validatedRecommendationTickers: recommendationsToInsert.map(
          (recommendation) => recommendation.ticker,
        ),
        sanitizerSkippedReasons: sanitizedRecommendations.skippedReasons,
      },
      );
    }

    logPipeline("validated_recommendations_count", recommendationsToInsert.length);
    const recommendationBuildPath =
      recommendationsToInsert.length === 0
        ? "no_publish"
        : deterministicFallbackUsed
          ? "deterministic_fallback"
          : "openai";
    logPipeline("recommendation_build_path", recommendationBuildPath);
    logPipeline("recommendations_built_count", recommendationsToInsert.length);
    logPipeline(
      "skipped_recommendations_count",
      sanitizedRecommendations.skippedReasons.length,
    );
    logPipeline(
      "skipped_recommendation_reasons",
      sanitizedRecommendations.skippedReasons,
    );
    logPipeline(
      "openai_recommendation_reality_guard_final",
      openAiRealityGuardSummary,
    );

    if (recommendationsToInsert.length === 0) {
      logPipeline("inserted_recommendations_count", 0);
      logPipeline("inserted_recommendation_tickers", []);

      return {
        recommendations: [],
        message: duplicateFallbackUsed
          ? duplicateFallbackMessage
          : "Ranked learning candidates were available but failed recommendation validation.",
        duplicate_fallback_used: duplicateFallbackUsed,
        market_regime: marketRegime,
        scan_window: scanWindow,
        scan_log: {
          ...publishVersionDetails(),
          result: "no_high_quality_setup",
          top_candidate_ticker: topCandidate?.ticker ?? null,
          top_candidate_score: topCandidateScore,
          top_candidate_setup_type: topCandidateSetupType,
          top_candidate_breakdown: topCandidateBreakdown,
          top_candidate_reasons: topCandidateReasons,
          top_candidate_warnings: topCandidateWarnings,
          top_candidate_indicators: topCandidateIndicators,
          indicator_source: topCandidateIndicatorSource,
          indicator_cached_at: topCandidateIndicatorCachedAt,
          indicator_stale: topCandidateIndicatorStale,
          threshold: strongThreshold,
          strong_threshold: strongThreshold,
          publishable_threshold: publishableThreshold,
          ranked_candidates_count: scannerCandidateRankingSummary.selected_count,
          recommendations_published_count: 0,
          recommendation_build_path: "no_publish",
          recommendations_built_count: 0,
          strong_count: strongQualifiedCount,
          valid_count: validQualifiedCount,
          experimental_count: experimentalQualifiedCount,
          ranked_candidates_not_published_reason:
            sanitizedRecommendations.skippedReasons[0] ??
            deterministicFallbackReason ??
            "Publishable candidates failed recommendation validation.",
          no_publish_reason: deterministicFallbackUsed
            ? "deterministic_fallback_validation_failed"
            : "recommendation_validation_failed",
          power_hour_trial_enabled: powerHourTrialPublishing,
          power_hour_publish_allowed: powerHourTrial,
          power_hour_publish_block_reason: null,
          deterministic_fallback_used: deterministicFallbackUsed,
          candidates_scanned: scoredCandidates.length,
          skipped_tickers:
            candidatesRemovedByCooldown.length +
            sanitizedRecommendations.skippedReasons.length,
          real_scanner_candidate_generation: realScannerCandidateGeneration,
          dynamic_movers_discovery: dynamicMoversDiscovery,
          scanner_candidate_ranking: scannerCandidateRankingSummary,
          grow_max_learning_mode: growMaxLearningMode,
          target_ideas_per_window: growMaxRecommendationTarget,
          openai_recommendation_reality_guard: openAiRealityGuardSummary,
        } satisfies RecommendationScanLogDetails,
      };
    }

    if (diagnosticMode) {
      const diagnosticRecommendations = buildDiagnosticRecommendationRows({
        recommendations: recommendationsToInsert,
        scanWindow,
        diagnosticRunId,
      });
      const diagnosticRecommendationTickers = diagnosticRecommendations
        .map((recommendation) => normalizeTicker(recommendation.ticker))
        .filter(Boolean);

      logPipeline(
        "diagnostic_recommendations_built_count",
        diagnosticRecommendations.length,
      );
      logPipeline(
        "diagnostic_recommendation_tickers",
        diagnosticRecommendationTickers,
      );

      return {
        recommendations: diagnosticRecommendations,
        inserted_count: 0,
        diagnostic_mode: true,
        diagnostic_built_count: diagnosticRecommendations.length,
        inserted_tickers: [],
        duplicate_fallback_used: duplicateFallbackUsed,
        market_regime: marketRegime,
        scan_window: scanWindow,
        message:
          "Diagnostic scan built recommendations without publishing live recommendation rows.",
        scan_log: {
          ...publishVersionDetails(),
          result: "diagnostic_recommendations_built",
          top_candidate_ticker: topCandidate?.ticker ?? null,
          top_candidate_score: topCandidateScore,
          top_candidate_setup_type: topCandidateSetupType,
          top_candidate_breakdown: topCandidateBreakdown,
          top_candidate_reasons: topCandidateReasons,
          top_candidate_warnings: topCandidateWarnings,
          top_candidate_indicators: topCandidateIndicators,
          indicator_source: topCandidateIndicatorSource,
          indicator_cached_at: topCandidateIndicatorCachedAt,
          indicator_stale: topCandidateIndicatorStale,
          threshold: strongThreshold,
          strong_threshold: strongThreshold,
          publishable_threshold: publishableThreshold,
          ranked_candidates_count: scannerCandidateRankingSummary.selected_count,
          recommendations_published_count: 0,
          recommendation_build_path: recommendationBuildPath,
          recommendations_built_count: recommendationsToInsert.length,
          strong_count: strongQualifiedCount,
          valid_count: validQualifiedCount,
          experimental_count: experimentalQualifiedCount,
          ranked_candidates_not_published_reason: null,
          no_publish_reason: null,
          power_hour_trial_enabled: powerHourTrialPublishing,
          power_hour_publish_allowed: powerHourTrial,
          power_hour_publish_block_reason: null,
          deterministic_fallback_used: deterministicFallbackUsed,
          candidates_scanned: scoredCandidates.length,
          skipped_tickers:
            candidatesRemovedByCooldown.length +
            sanitizedRecommendations.skippedReasons.length,
          real_scanner_candidate_generation: realScannerCandidateGeneration,
          dynamic_movers_discovery: dynamicMoversDiscovery,
          scanner_candidate_ranking: scannerCandidateRankingSummary,
          grow_max_learning_mode: growMaxLearningMode,
          target_ideas_per_window: growMaxRecommendationTarget,
          openai_recommendation_reality_guard: openAiRealityGuardSummary,
        } satisfies RecommendationScanLogDetails,
      };
    }

    const insertResult = await db
      .from("recommendations")
      .insert(recommendationsToInsert)
      .select("*");

    if (insertResult.error) {
      console.error("[recommendations/generate] recommendation_insert_error", {
        source: "supabase.recommendations",
        operation: "insert_recommendations",
        tickers: recommendationsToInsert.map((recommendation) => recommendation.ticker),
        error: normalizeUnknownError(insertResult.error),
      });
      throw new RecommendationGenerationError(
        insertResult.error.message ?? "Unknown error",
        500,
        {
          persistence_error_type:
            insertResult.error.code ??
            insertResult.error.name ??
            "recommendation_insert_error",
        },
      );
    }

    const insertedRecommendations = insertResult.data ?? [];
    const insertedRecommendationTickers = insertedRecommendations
      .map((recommendation) => normalizeTicker(recommendation.ticker))
      .filter(Boolean);

    logPipeline("inserted_recommendations_count", insertedRecommendations.length);
    logPipeline("inserted_recommendation_tickers", insertedRecommendationTickers);

    if (insertedRecommendations.length === 0) {
      throw new RecommendationGenerationError(
        "Recommendations were generated but not inserted into Supabase.",
        500,
        { persistence_error_type: "recommendation_insert_returned_zero_rows" },
      );
    }

    return {
      recommendations: insertedRecommendations,
      inserted_count: insertedRecommendations.length,
      inserted_tickers: insertedRecommendationTickers,
      duplicate_fallback_used: duplicateFallbackUsed,
      market_regime: marketRegime,
      scan_window: scanWindow,
      scan_log: {
        ...publishVersionDetails(),
        result: "recommendation_created",
        top_candidate_ticker: topCandidate?.ticker ?? null,
        top_candidate_score: topCandidateScore,
        top_candidate_setup_type: topCandidateSetupType,
        top_candidate_breakdown: topCandidateBreakdown,
        top_candidate_reasons: topCandidateReasons,
        top_candidate_warnings: topCandidateWarnings,
        top_candidate_indicators: topCandidateIndicators,
        indicator_source: topCandidateIndicatorSource,
        indicator_cached_at: topCandidateIndicatorCachedAt,
        indicator_stale: topCandidateIndicatorStale,
        threshold: strongThreshold,
        strong_threshold: strongThreshold,
        publishable_threshold: publishableThreshold,
        ranked_candidates_count: scannerCandidateRankingSummary.selected_count,
        recommendations_published_count: insertedRecommendations.length,
        recommendation_build_path: recommendationBuildPath,
        recommendations_built_count: recommendationsToInsert.length,
        strong_count: strongQualifiedCount,
        valid_count: validQualifiedCount,
        experimental_count: experimentalQualifiedCount,
        ranked_candidates_not_published_reason: null,
        no_publish_reason: null,
        power_hour_trial_enabled: powerHourTrialPublishing,
        power_hour_publish_allowed: powerHourTrial,
        power_hour_publish_block_reason: null,
        deterministic_fallback_used: deterministicFallbackUsed,
        candidates_scanned: scoredCandidates.length,
        skipped_tickers:
          candidatesRemovedByCooldown.length +
          sanitizedRecommendations.skippedReasons.length,
        real_scanner_candidate_generation: realScannerCandidateGeneration,
        dynamic_movers_discovery: dynamicMoversDiscovery,
        scanner_candidate_ranking: scannerCandidateRankingSummary,
        grow_max_learning_mode: growMaxLearningMode,
        target_ideas_per_window: growMaxRecommendationTarget,
        openai_recommendation_reality_guard: openAiRealityGuardSummary,
      } satisfies RecommendationScanLogDetails,
      ...(duplicateFallbackUsed ? { message: duplicateFallbackMessage } : {}),
    };
  } catch (error) {
    console.error("[recommendations/generate] generation_error", {
      sessionType,
      scanWindow,
      source,
      error: normalizeUnknownError(error),
    });
    if (error instanceof RecommendationGenerationError) {
      throw error;
    }

    throw new RecommendationGenerationError(
      error instanceof Error && error.message ? error.message : "Unknown error",
      500,
    );
  }
}
