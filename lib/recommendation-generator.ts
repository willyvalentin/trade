import "server-only";
import { hasCompletedInputBudget } from "@/lib/scheduled-scanner-input-policy";
import { REGULAR_SESSION_ANALYSIS_POLICY_VERSION } from "@/lib/continuous-market-scan-admission";

import OpenAI from "openai";

import {
  resolveAiRecommendationPublicationAction,
  resolveSanitizedRecommendationPublicationAction,
  type AiNoTradeDecision,
} from "@/lib/recommendation-publication-policy";

import {
  getMarketRegime,
  COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION,
  marketRegimePromptInput,
  neutralMarketRegimeFallback,
  type MarketRegime,
} from "@/lib/market-regime";
import {
  buildMarketRegimeDecisionContext,
  type MarketRegimeDecisionContext,
} from "@/lib/market-regime-decision-context";
import {
  scanMarket,
  type ScannerCandidate,
} from "@/lib/scanner";
import {
  COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION,
  captureScannerDecisionInputSnapshot,
  isScannerDecisionInputPublishable,
} from "@/lib/scanner-decision-input-snapshot";
import { getUsEquityMarketSession } from "@/lib/us-equity-market-calendar";
import type { ScannerProviderCreditAllocationRuntimeAdmission } from "@/lib/scanner-provider-credit-allocation-runtime-admission";
import {
  getOrRefreshIntradayIndicators,
  SCANNER_INDICATOR_MAX_AGE_MINUTES,
} from "@/lib/intraday-indicator-cache";
import {
  getIntradayScanPolicy,
  getIntradayScanWindowLabel,
  type IntradayScanWindow,
} from "@/lib/intraday-scan-window";
import {
  withAdmissibleCandidateRecentVolume,
  withAdmissibleRecentIntradayVolume,
  type IntradayIndicators,
} from "@/lib/intraday-indicators";
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
import { throwIfAborted } from "@/lib/operation-abort";
import { buildRecommendationOutputEnrichmentMetadata } from "@/lib/recommendation-output-enrichment";
import {
  discoverDynamicMoversDiagnostics,
  type DynamicMoversDiscoverySummary,
} from "@/lib/dynamic-movers-discovery";
import {
  discoverMarketWideDiscovery,
  type MarketWideDiscoverySummary,
} from "@/lib/market-wide-discovery";
import {
  marketWideDiscoveryPreviousAttemptFromUnknown,
  type MarketWideDiscoveryPreviousAttempt,
} from "@/lib/market-wide-discovery-policy";
import {
  buildRealScannerBaseCandidateSelection,
  buildRealScannerCandidateGenerationSummary,
  type RealScannerCandidateGenerationSummary,
} from "@/lib/real-scanner-candidate-generation";
import {
  buildScannerCandidateRankingSummary,
  type ScannerCandidateRankingSummary,
  type ScannerCandidateRankingResult,
} from "@/lib/scanner-candidate-ranking";
import {
  buildScannerIntradayLiquidityShadowComparison,
  type ScannerIntradayLiquidityShadowComparison,
} from "@/lib/scanner-ranking-intraday-liquidity-shadow";
import {
  buildScannerClockPriorShadowComparison,
  type ScannerClockPriorShadowComparison,
} from "@/lib/scanner-ranking-clock-prior-shadow";
import {
  buildCandidateDecisionCapture,
  type CandidateDecisionCapture,
  type CandidateDecisionReasonCode,
} from "@/lib/candidate-decision-record";
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
import { getServerSupabaseClient } from "@/lib/supabase-server";
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
import { recommendationConfidenceMetadataPrefix } from "@/lib/recommendation-inline-metadata";
import {
  buildSelectedCandidateBuildDiagnostic,
  summarizeSelectedCandidateBuildDiagnostics,
  type CandidateBuildRejectionReason,
  type SelectedCandidateBuildDiagnostic,
  type SelectedToBuiltDropOffSummary,
} from "@/lib/recommendation-build-diagnostics";
import {
  refreshSelectedCandidateReferences,
  type ReferenceRefreshDiagnostics,
} from "@/lib/reference-refresh-diagnostics";
import { normalizeApplicationOwnerUserId } from "@/lib/application-session-core";
import { readOwnedCompletedBenchmarkReuse } from "@/lib/completed-benchmark-reuse";
import {
  resolveScheduledScannerProviderCallCap,
  SCHEDULED_REFERENCE_REFRESH_DEFAULT_MAX_ATTEMPTS,
  type ScheduledScanProviderCreditBudget,
} from "@/lib/scheduled-scan-ticker-cap";

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
  ownerUserId: string;
  sessionType: SessionType;
  scanWindow: IntradayScanWindow;
  targetCount?: number;
  source: RecommendationGenerationSource;
  allowPowerHourRecommendationLogging?: boolean;
  powerHourTrialPublishing?: boolean;
  diagnosticMode?: boolean;
  diagnosticRunId?: string | null;
  discoveryInvocationId?: string | null;
  diagnosticMaxTickers?: number | null;
  scheduledMaxTickers?: number | null;
  scheduledProviderCreditBudget?: ScheduledScanProviderCreditBudget | null;
  scheduledProviderCallPacingMs?: number | null;
  providerCreditAllocationRuntimeAdmission?: ScannerProviderCreditAllocationRuntimeAdmission | null;
  scannerInputPolicyVersion?: typeof COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION;
  growMaxLearningMode?: boolean;
  skipOpenAi?: boolean;
  activeScanTrace?: ActiveScanTraceRecorder | null;
  signal?: AbortSignal;
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
  entry_type_metadata?: EntryTypeMetadata | null;
  entry_type?: RecommendationEntryType | null;
  entry_trigger_semantics?: RecommendationEntryTriggerSemantics | null;
  entry_type_source?: RecommendationEntryTypeSource | null;
  entry_type_confidence?: RecommendationEntryTypeConfidence | null;
  entry_type_warnings?: string[] | null;
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
  no_trade_candidate_ticker?: string | null;
  no_trade_confidence_score?: number | null;
  threshold?: number | null;
  candidates_scanned?: number | null;
  skipped_tickers?: number | null;
  pre_market_candidates?: PreMarketCandidate[] | null;
  real_scanner_candidate_generation?: RealScannerCandidateGenerationSummary | null;
  dynamic_movers_discovery?: DynamicMoversDiscoverySummary | null;
  market_wide_discovery?: MarketWideDiscoverySummary | null;
  scanner_candidate_ranking?: ScannerCandidateRankingSummary | null;
  scanner_intraday_liquidity_shadow_comparison?: ScannerIntradayLiquidityShadowComparison | null;
  scanner_clock_prior_shadow_comparison?: ScannerClockPriorShadowComparison | null;
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
  deterministic_fallback_reference_block_count?: number | null;
  deterministic_fallback_reference_block_reasons?: string[] | null;
  reference_refresh?: ReferenceRefreshDiagnostics | null;
  selected_candidate_build_diagnostics?: SelectedCandidateBuildDiagnostic[] | null;
  selected_to_built_drop_off?: SelectedToBuiltDropOffSummary | null;
  recommendation_build_path?: "openai" | "deterministic_fallback" | "no_publish" | null;
  recommendations_built_count?: number | null;
  automation_route_version?: string | null;
  recommendation_publish_policy_version?: string | null;
  build_marker?: string | null;
  no_publish_reason?: string | null;
  analysis_policy_version?: typeof REGULAR_SESSION_ANALYSIS_POLICY_VERSION | null;
  power_hour_trial_enabled?: boolean | null;
  power_hour_publish_allowed?: boolean | null;
  power_hour_publish_block_reason?: string | null;
  candidate_decision_capture?: CandidateDecisionCapture | null;
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
export const DAY_TRADE_SCORING_VERSION = "day_trade_score_v1" as const;
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
  stale: boolean | null | undefined,
): CompactIntradayIndicators | null {
  if (!indicators) {
    return null;
  }

  const currentIndicators = withAdmissibleRecentIntradayVolume(
    indicators,
    stale,
  );

  return {
    isAboveVwap: currentIndicators.isAboveVwap,
    momentumDirection: currentIndicators.momentumDirection,
    volumeTrend: currentIndicators.volumeTrend,
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
  const currentCandidate = withAdmissibleCandidateRecentVolume(candidate);
  const localScore = scoreDayTradeCandidate(currentCandidate, context);
  const setupType = classifyCandidateSetupType(currentCandidate, context.scanWindow);

  return {
    ...currentCandidate,
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
    scannerBaseCandidates,
    {
      source,
      maxFreshProviderCalls: source === "scheduled" ? 2 : 1,
    },
  );
  const detectedAt = new Date().toISOString();
  const candidates = scannerCandidates
    .map((candidate) => {
      const currentCandidate = withAdmissibleCandidateRecentVolume(candidate);
      const preMarketScore = scorePreMarketCandidate(currentCandidate, { marketRegime });
      const setupType = classifyCandidateSetupType(currentCandidate, "pre_market");
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
  options?: Parameters<typeof resolvePlanReferencePriceMetadata>[1],
): PlanReferencePriceMetadata {
  return resolvePlanReferencePriceMetadata(candidate, options);
}

function midpoint(low: number | null, high: number | null) {
  if (low === null && high === null) return null;
  if (low === null) return high;
  if (high === null) return low;
  return (low + high) / 2;
}

function planReferenceBlockReason(
  metadata: PlanReferencePriceMetadata,
  ticker: string,
) {
  const reason =
    metadata.plan_reference_metadata_trace.reference_price_stale_block_reason ??
    (metadata.reference_price_used_for_plan === null
      ? "missing_fresh_reference_price"
      : null);

  return reason
    ? `${ticker}: ${reason} (${metadata.plan_reference_metadata_trace.reference_price_source_attempted ?? "unknown_source"})`
    : null;
}

function buildPlanPricesFromReference(referencePrice: number) {
  const entryLow = Number((referencePrice * 0.99).toFixed(2));
  const entryHigh = Number((referencePrice * 1.01).toFixed(2));
  const stopLoss = Number((referencePrice * 0.96).toFixed(2));
  const riskPerShare = Math.max(entryHigh - stopLoss, referencePrice * 0.01);
  const target1 = Number((entryHigh + riskPerShare * 1.5).toFixed(2));
  const target2 = Number((entryHigh + riskPerShare * 2.25).toFixed(2));

  return {
    entryLow,
    entryHigh,
    stopLoss,
    target1,
    target2,
    riskReward: Number(((target2 - entryHigh) / riskPerShare).toFixed(2)),
  };
}

function buildPlanEntryTypeMetadata(input: {
  side: "long" | "short";
  entry: number | null;
  planReferencePrice: PlanReferencePriceMetadata;
  source: RecommendationEntryTypeSource;
  existingMetadata?: RecommendationEntryTypeMetadata | null;
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

  return candidates.map((rawCandidate): OpenAiRecommendationRealityCandidate & Record<string, unknown> => {
    const candidate = withAdmissibleCandidateRecentVolume(rawCandidate);
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
      ...(candidate.scanner_input_policy_version === COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION ? {
        scanner_input_policy_version: candidate.scanner_input_policy_version,
        historical_context: candidate.daily_context_evidence ?? null,
        current_session: candidate.current_session_evidence ?? null,
      } : {}),
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

function riskGeometryStatus(planPrices: ReturnType<typeof buildPlanPricesFromReference>) {
  if (
    planPrices.entryLow <= 0 ||
    planPrices.entryHigh <= 0 ||
    planPrices.stopLoss <= 0 ||
    planPrices.target1 <= 0 ||
    planPrices.target2 <= 0
  ) {
    return "invalid_non_positive_plan";
  }

  if (
    planPrices.stopLoss >= planPrices.entryLow ||
    planPrices.entryLow > planPrices.entryHigh ||
    planPrices.target1 <= planPrices.entryHigh ||
    planPrices.target2 <= planPrices.target1
  ) {
    return "invalid_long_geometry";
  }

  if (planPrices.riskReward < 1.5) {
    return "weak_risk_reward";
  }

  return "valid";
}

function buildDiagnosticForCandidate(input: {
  candidate: ScoredCandidate;
  ranking: ScannerCandidateRankingResult | null;
  planReferencePrice: PlanReferencePriceMetadata | null;
  riskGeometryStatus?: string | null;
  built: boolean;
  rejectionReason?: CandidateBuildRejectionReason | string | null;
  explanation?: string | null;
}): SelectedCandidateBuildDiagnostic {
  const indicators = input.candidate.intraday_indicators;
  const planReference = input.planReferencePrice;

  return buildSelectedCandidateBuildDiagnostic({
    ticker: input.candidate.ticker,
    side: "long",
    score: input.candidate.local_score,
    tier: input.ranking?.score.tier ?? "unknown",
    setupType: input.candidate.setup_type,
    source: input.ranking?.source_contribution ?? input.candidate.intraday_indicator_source,
    referencePriceStatus: planReference?.plan_reference_metadata_status ?? null,
    referencePriceSource: planReference?.reference_price_source ?? null,
    referencePriceReadPath: planReference?.reference_price_read_path ?? null,
    referencePriceAgeMinutes:
      planReference?.plan_reference_metadata_trace.reference_timestamp_age_minutes ??
      null,
    vwapStatus:
      typeof indicators?.isAboveVwap === "boolean"
        ? indicators.isAboveVwap
          ? "above_vwap"
          : "below_vwap"
        : "unknown",
    momentumStatus: indicators?.momentumDirection ?? "unknown",
    volumeStatus: indicators
      ? withAdmissibleRecentIntradayVolume(
          indicators,
          input.candidate.intraday_indicator_stale,
        ).volumeTrend
      : "unknown",
    riskGeometryStatus: input.riskGeometryStatus ?? "not_checked",
    enoughDataToBuildPlan:
      Boolean(planReference?.reference_price_used_for_plan) &&
      (input.riskGeometryStatus === "valid" || input.built),
    built: input.built,
    rejectionReason: input.rejectionReason,
    explanation: input.explanation,
  });
}

function diagnosticReasonForReferenceBlock(
  planReferencePrice: PlanReferencePriceMetadata,
): CandidateBuildRejectionReason {
  const staleReason =
    planReferencePrice.plan_reference_metadata_trace.reference_price_stale_block_reason;

  if (staleReason === "scanner_cache_reference_too_old") {
    return "scanner_cache_reference_too_old";
  }
  if (staleReason === "stale_reference_price") return "stale_reference_price";
  if (staleReason === "future_reference_timestamp") {
    return "future_reference_timestamp";
  }
  if (planReferencePrice.plan_reference_metadata_status === "price_missing_source") {
    return "missing_reference_source";
  }
  if (
    planReferencePrice.plan_reference_metadata_status === "price_missing_timestamp" ||
    planReferencePrice.plan_reference_metadata_status ===
      "price_missing_source_and_timestamp"
  ) {
    return "missing_reference_timestamp";
  }

  return "missing_fresh_reference_price";
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
}): {
  recommendations: AiRecommendation[];
  skippedReasons: string[];
  buildDiagnostics: SelectedCandidateBuildDiagnostic[];
} {
  const rankingByTicker = new Map(
    rankingSummary.results.map((result) => [result.ticker, result]),
  );
  const recommendations: AiRecommendation[] = [];
  const skippedReasons: string[] = [];
  const buildDiagnostics: SelectedCandidateBuildDiagnostic[] = [];

  for (const candidate of candidates) {
    const ranking = rankingByTicker.get(candidate.ticker) ?? null;
    if (recommendations.length >= maxRecommendations) {
      buildDiagnostics.push(
        buildDiagnosticForCandidate({
          candidate,
          ranking,
          planReferencePrice: null,
          built: false,
          rejectionReason: "fallback_builder_limit_reached",
          explanation:
            "Deterministic fallback reached the configured recommendation limit before this selected candidate.",
        }),
      );
      continue;
    }

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
      buildPlanReferencePriceMetadata(candidate, {
        enforceFreshness: true,
      }),
    );
    const referencePrice = planReferencePrice.reference_price_used_for_plan;
    const staleBlockReason = planReferenceBlockReason(
      planReferencePrice,
      candidate.ticker,
    );

    if (referencePrice === null || staleBlockReason) {
      const diagnosticReason = diagnosticReasonForReferenceBlock(planReferencePrice);
      skippedReasons.push(
        staleBlockReason ??
          `${candidate.ticker}: missing_fresh_reference_price (unknown_source)`,
      );
      buildDiagnostics.push(
        buildDiagnosticForCandidate({
          candidate,
          ranking,
          planReferencePrice,
          built: false,
          rejectionReason: diagnosticReason,
          explanation:
            staleBlockReason ??
            `${candidate.ticker} lacked a fresh reference price for deterministic fallback.`,
        }),
      );
      continue;
    }

    const planPrices = buildPlanPricesFromReference(referencePrice);
    const geometryStatus = riskGeometryStatus(planPrices);

    if (geometryStatus !== "valid") {
      const rejectionReason =
        geometryStatus === "weak_risk_reward"
          ? "weak_risk_reward"
          : "invalid_risk_geometry";
      skippedReasons.push(`${candidate.ticker}: ${rejectionReason}`);
      buildDiagnostics.push(
        buildDiagnosticForCandidate({
          candidate,
          ranking,
          planReferencePrice,
          riskGeometryStatus: geometryStatus,
          built: false,
          rejectionReason,
          explanation: `${candidate.ticker} blocked by ${geometryStatus}.`,
        }),
      );
      continue;
    }

    const entryTypeMetadata = buildPlanEntryTypeMetadata({
      side: "long",
      entry: midpoint(planPrices.entryLow, planPrices.entryHigh),
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

    recommendations.push({
      ticker: candidate.ticker,
      company_name: candidate.company_name,
      direction: "long",
      setup_type: setupType,
      entry_low: planPrices.entryLow,
      entry_high: planPrices.entryHigh,
      stop_loss: planPrices.stopLoss,
      target_1: planPrices.target1,
      target_2: planPrices.target2,
      risk_reward: planPrices.riskReward,
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
      invalidation: `The setup is invalidated if price trades below ${planPrices.stopLoss.toFixed(2)} or intraday momentum and volume confirmation fail.`,
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
    });
    buildDiagnostics.push(
      buildDiagnosticForCandidate({
        candidate,
        ranking,
        planReferencePrice,
        riskGeometryStatus: geometryStatus,
        built: true,
        rejectionReason: "built",
      }),
    );
  }

  return { recommendations, skippedReasons, buildDiagnostics };
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
      // The model may describe a plan, but it cannot attest the price, source,
      // timestamp or provider used to publish it. Only the server-observed
      // candidate can supply a live reference price.
      const candidatePlanReferencePrice = buildPlanReferencePriceMetadata(
        candidate,
        { enforceFreshness: true },
      );
      if (candidatePlanReferencePrice.reference_price_used_for_plan === null) {
        throw new Error(
          `Recommendation ${ticker} lacked a fresh server-observed plan reference.`,
        );
      }
      const retainedPlanReferencePrice = markPlanReferenceRetained(
        candidatePlanReferencePrice,
      );
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
          market_data_timestamp:
            candidate.intraday_indicators?.latestCandleTimestamp ?? null,
          candle_timestamp:
            candidate.intraday_indicators?.latestCandleTimestamp ?? null,
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
          source_provider:
            retainedPlanReferencePrice.reference_price_provider ??
            "provider_unavailable",
          market_data_source:
            candidate.intraday_indicator_source ?? "provider_unavailable",
          market_data_timestamp:
            candidate.intraday_indicators?.latestCandleTimestamp ?? null,
          data_freshness: getDataFreshness(candidate),
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
  const maxRecommendations = Math.min(
    3,
    Math.max(1, settings.max_recommendations_per_session),
  );
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
        ? "For scheduled official scans, publish only Strong or Valid candidates when the ranked candidate data supports a coherent same-day plan. Experimental candidates are research-only and must not become a published recommendation."
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
        ? "Do not fill a batch. Return fewer recommendations, or no_trade, whenever fewer than three Strong or Valid candidates meet the full same-day quality bar."
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
        ? "For scheduled batches, weak volume or momentum should result in no_trade unless the remaining Strong or Valid evidence still supports a coherent same-day plan."
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
      market_regime: marketRegimePromptInput(marketRegime),
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
  ownerUserId,
  sessionType,
  scanWindow,
  targetCount,
  source,
  allowPowerHourRecommendationLogging = false,
  powerHourTrialPublishing = false,
  diagnosticMode = false,
  diagnosticRunId = null,
  discoveryInvocationId = null,
  diagnosticMaxTickers = null,
  scheduledMaxTickers = null,
  scheduledProviderCreditBudget = null,
  scheduledProviderCallPacingMs = null,
  providerCreditAllocationRuntimeAdmission = null,
  scannerInputPolicyVersion,
  growMaxLearningMode = false,
  skipOpenAi = false,
  activeScanTrace = null,
  signal,
}: GenerateRecommendationsInput) {
  try {
    throwIfAborted(signal);
    const inputAttributed = scannerInputPolicyVersion === COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION;
    if (scannerInputPolicyVersion !== undefined && !inputAttributed) {
      throw new Error("scanner_input_policy_invalid");
    }
    if (inputAttributed) {
      const now = new Date(), session = getUsEquityMarketSession(now);
      if (source !== "scheduled" || !hasCompletedInputBudget(scheduledProviderCreditBudget) ||
        process.env.TURE_MARKET_WIDE_DISCOVERY_ENABLED === "true" ||
        diagnosticMode || scanWindow === "pre_market" || scanWindow === "closed" ||
        providerCreditAllocationRuntimeAdmission || session.verification_status !== "verified" ||
        session.freshness_status !== "current" || !session.session_open || !session.session_close ||
        now.getTime() < Date.parse(session.session_open) || now.getTime() >= Date.parse(session.session_close)) {
        throw new Error("completed_context_generator_admission_invalid");
      }
    }
    const owner = normalizeApplicationOwnerUserId(ownerUserId);
    if (!owner) {
      throw new RecommendationGenerationError(
        "Application owner identity is unavailable.",
        503,
        { persistence_error_type: "application_owner_identity_unavailable" },
      );
    }

    const serverSupabase = getServerSupabaseClient();
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
    const closingInputAnalysisOnly =
      inputAttributed && scanWindow === "power_hour" && !powerHourTrial;
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
      !allowPowerHourRecommendationLogging &&
      !closingInputAnalysisOnly
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

    if (!scanPolicy.allowGeneration && !allowPowerHourRecommendationLogging && !closingInputAnalysisOnly) {
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
      latestMarketWideDiscoveryResult,
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
          .eq("owner_user_id", owner)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle(),
        db
          .from("recommendations")
          .select("ticker,session_type")
          .eq("owner_user_id", owner)
          .gte("created_at", todayStart),
        db
          .from("recommendations")
          .select("ticker,status,archived,created_at")
          .eq("owner_user_id", owner)
          .or("status.eq.new,status.is.null")
          .or("archived.eq.false,archived.is.null")
          .gte("created_at", getDefaultRecommendationExpiryCutoff()),
        db.from("positions").select("ticker,status").eq("owner_user_id", owner),
        db
          .from("recommendation_scan_runs")
          .select("id,owner_user_id,run_fingerprint,trading_date,window,status,data_mode,observed_at,completed_at,payload_json")
          .eq("owner_user_id", owner)
          .order("observed_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
    throwIfAborted(signal);

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

    const latestMarketWideDiscoveryPayload = (
      latestMarketWideDiscoveryResult.data as {
        payload_json?: Record<string, unknown> | null;
      } | null
    )?.payload_json?.market_wide_discovery;
    const parsedPreviousMarketWideDiscoveryAttempt =
      marketWideDiscoveryPreviousAttemptFromUnknown(
        latestMarketWideDiscoveryPayload,
      );
    const previousMarketWideDiscoveryAttempt: MarketWideDiscoveryPreviousAttempt | null =
      latestMarketWideDiscoveryResult.error ||
      (latestMarketWideDiscoveryPayload !== undefined &&
        latestMarketWideDiscoveryPayload !== null &&
        !parsedPreviousMarketWideDiscoveryAttempt)
        ? {
            // A database read or persisted receipt that cannot be interpreted
            // is not evidence that a provider retry is safe. Treat both as a
            // failed attempt and let the bounded error backoff fail closed.
            attempted_at: new Date().toISOString(),
            outcome: "provider_error",
          }
        : parsedPreviousMarketWideDiscoveryAttempt;

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

    const useScheduledUniverseRotation =
      source === "scheduled" && !diagnosticMode;
    const requestedScanBudget = diagnosticMode
      ? diagnosticMaxTickers
      : scheduledMaxTickers ?? undefined;
    const marketWideDiscovery = await discoverMarketWideDiscovery({
      scanWindow,
      selectedBudget: requestedScanBudget,
      previousAttempt: previousMarketWideDiscoveryAttempt,
      ownerUserId: owner,
      executionFingerprint: discoveryInvocationId,
      // Diagnostics must stay provider-free even when the deployment enables
      // a real discovery lane. A simulated run is never market evidence.
      runtimeEnabled:
        !diagnosticMode &&
        process.env.TURE_MARKET_WIDE_DISCOVERY_ENABLED === "true",
      signal,
    });
    throwIfAborted(signal);
    const scannerUniverseSelection = buildRealScannerBaseCandidateSelection({
      scanWindow,
      requestedScanBudget,
      selectionMode: useScheduledUniverseRotation
        ? "scheduled_rotating"
        : "default",
      dynamicMovers: marketWideDiscovery.dynamic_movers,
    });
    const scannerBaseCandidates =
      diagnosticMode && typeof diagnosticMaxTickers === "number"
        ? scannerUniverseSelection.candidates.slice(0, diagnosticMaxTickers)
        : typeof scheduledMaxTickers === "number"
          ? scannerUniverseSelection.candidates.slice(0, scheduledMaxTickers)
        : scannerUniverseSelection.candidates;
    const universeCoverage = scannerUniverseSelection.coverage;
    logPipeline(
      "scanner_universe_selection_mode",
      scannerUniverseSelection.selectionMode,
    );
    logPipeline(
      "scanner_universe_rotation_batch",
      scannerUniverseSelection.rotationBatch,
    );
    const dynamicMoversDiscovery = await discoverDynamicMoversDiagnostics({
      source,
      candidates: scannerBaseCandidates,
      maxTickers: diagnosticMode
        ? diagnosticMaxTickers
        : scheduledMaxTickers ?? undefined,
      now: new Date(),
      signal,
    });
    throwIfAborted(signal);

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

    // Existing owner-bound last-run read, never a new global cache or a provider
    // request. Freed credits are available only before any acquisition starts.
    const completedBenchmarkReuse = inputAttributed && !latestMarketWideDiscoveryResult.error
      ? await readOwnedCompletedBenchmarkReuse({ row: latestMarketWideDiscoveryResult.data,
          owner, now: new Date(), signal }) : null;
    throwIfAborted(signal);
    const scannerFreshProviderCallCap = completedBenchmarkReuse ? 8 : diagnosticMode
      ? Math.min(1, scannerBaseCandidates.length)
      : source === "scheduled"
        ? resolveScheduledScannerProviderCallCap({
            budget: scheduledProviderCreditBudget,
            candidateCount: scannerBaseCandidates.length,
          })
        : undefined;
    activeScanTrace?.updateMarketDataFetch({
      provider_credit_policy_version:
        source === "scheduled"
          ? scheduledProviderCreditBudget?.policy_version ?? null
          : null,
      provider_call_cap: scannerFreshProviderCallCap ?? null,
    });
    const contextAbortController = inputAttributed ? new AbortController() : null;
    const contextSignal = contextAbortController
      ? signal ? AbortSignal.any([signal, contextAbortController.signal]) : contextAbortController.signal
      : signal;
    let originalMarketRegimeContext: MarketRegimeDecisionContext | null = null;
    const loadMarketRegime = async () => {
      try {
        throwIfAborted(signal);
        const marketRegime = completedBenchmarkReuse
          ? completedBenchmarkReuse.market_regime
          : await getMarketRegime({ signal: contextSignal,
            ...(inputAttributed ? { inputPolicyVersion: COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION } : {}) });
        // This decision's observed classification/revalidation completion,
        // not candle freshness, scan start or later artifact persistence. The
        // reused capsules retain their original captures/classification clock.
        originalMarketRegimeContext = buildMarketRegimeDecisionContext({
          marketRegime,
          capturedAt: new Date(),
        });
        return marketRegime;
      } catch (error) {
        originalMarketRegimeContext = null;
        console.error("[recommendations/generate] market_regime_error", {
          error: normalizeUnknownError(error),
        });
        // The normalized path requires observed original benchmark inputs.
        // Missing/stale/provider-failed context is a data rejection, not a
        // neutral investment judgment or an evaluated no_trade. Legacy callers
        // keep their previous explicitly unavailable neutral fallback.
        if (inputAttributed) throw error;
        return neutralMarketRegimeFallback;
      }
    };
    const scannerTask = scanMarket(
      scannerBaseCandidates,
      {
        source,
        activeScanTrace,
        maxFreshProviderCalls: scannerFreshProviderCallCap,
        freshProviderCallPacingMs:
          source === "scheduled"
            ? scheduledProviderCallPacingMs ?? undefined
            : undefined,
        providerCreditAllocationRuntimeAdmission,
        completedDailyContextPolicyVersion: scannerInputPolicyVersion,
        ...(completedBenchmarkReuse ? { completedBenchmarkReuse } : {}),
        signal,
      },
    ).then(candidates => {
      // Retain completed acquisition evidence even if the independent context
      // later times out. This trace never grants decision/publication authority.
      if (inputAttributed) updateRawCandidateTrace(activeScanTrace, candidates);
      return candidates;
    }).catch(error => {
      // A terminal scanner failure owns the result. Cancel only its sibling
      // context, then drain it below; do not wait until the route deadline and
      // replace a precise provider failure with a timeout classification.
      contextAbortController?.abort(error);
      throw error;
    });
    let prefetchedMarketRegime: MarketRegime | null = null;
    let scannerCandidates: Awaited<ReturnType<typeof scanMarket>>;
    if (inputAttributed) {
      // Admission fixes the whole reservation at eight: six acquisition plus
      // two SPY/QQQ calls, or eight acquisition calls after validated reuse.
      // Independent reads share the existing abort signal and may overlap;
      // no extra provider allowance is created.
      // Settle both tasks before leaving, including scanner/provider failures.
      // An empty scanner result may still consume the two reserved benchmarks.
      const [scannerResult, contextResult] = await Promise.allSettled([
        scannerTask,
        loadMarketRegime(),
      ]);
      if (scannerResult.status === "rejected") throw scannerResult.reason;
      if (contextResult.status === "rejected") throw contextResult.reason;
      scannerCandidates = scannerResult.value;
      prefetchedMarketRegime = contextResult.value;
    } else {
      // Legacy, manual and unbounded profiles retain their serial behavior.
      scannerCandidates = await scannerTask;
    }
    throwIfAborted(signal);
    const candidateDecisionCaptureTimestamp = new Date().toISOString();
    const candidateEligibilityRejectionCodes = new Map<
      string,
      Set<CandidateDecisionReasonCode>
    >();
    const recordCandidateEligibilityRejection = (
      ticker: string,
      reason: CandidateDecisionReasonCode,
    ) => {
      const normalizedTicker = normalizeTicker(ticker);
      const reasons = candidateEligibilityRejectionCodes.get(normalizedTicker) ??
        new Set<CandidateDecisionReasonCode>();
      reasons.add(reason);
      candidateEligibilityRejectionCodes.set(normalizedTicker, reasons);
    };
    const candidateDecisionCapture = ({
      ranking = null,
      eligibleCandidateTickers = [],
      publishableThreshold = null,
      noPublishReason = null,
      recommendationBuildPath = null,
      builtTickers = [],
      publishedTickers = [],
      selectedBuildDiagnostics = [],
      decisionTimestamp,
    }: {
      ranking?: ScannerCandidateRankingSummary | null;
      eligibleCandidateTickers?: string[];
      publishableThreshold?: number | null;
      noPublishReason?: string | null;
      recommendationBuildPath?: string | null;
      builtTickers?: string[];
      publishedTickers?: string[];
      selectedBuildDiagnostics?: SelectedCandidateBuildDiagnostic[];
      decisionTimestamp?: string;
    } = {}) =>
      buildCandidateDecisionCapture({
        captureTimestamp: candidateDecisionCaptureTimestamp,
        ...(inputAttributed ? { decisionTimestamp: decisionTimestamp ?? new Date().toISOString() } : {}),
        universe: scannerBaseCandidates,
        observedCandidates: scannerCandidates,
        inputPolicyVersion: scannerInputPolicyVersion,
        ranking,
        eligibleCandidateTickers,
        eligibilityRejectionCodes: Object.fromEntries(
          Array.from(candidateEligibilityRejectionCodes.entries()).map(
            ([ticker, reasons]) => [ticker, Array.from(reasons)],
          ),
        ),
        publishableThreshold,
        noPublishReason,
        recommendationBuildPath,
        builtTickers,
        publishedTickers,
        selectedBuildDiagnostics,
      });
    if (!inputAttributed) updateRawCandidateTrace(activeScanTrace, scannerCandidates);
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
    logPipeline("market_wide_discovery", marketWideDiscovery.summary);

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
            market_wide_discovery: marketWideDiscovery.summary,
            candidate_decision_capture: candidateDecisionCapture({
              noPublishReason: "no_raw_candidates",
              recommendationBuildPath: "no_publish",
            }),
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

    const marketRegime = prefetchedMarketRegime ?? await loadMarketRegime();

    throwIfAborted(signal);
    logPipeline("market_regime", marketRegime);
    await saveMarketRegimeSnapshot(marketRegime);
    throwIfAborted(signal);

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
        recordCandidateEligibilityRejection(
          candidate.ticker,
          "daily_candidate_limit",
        );
        removedReasons.push(
          `${candidate.ticker}: recommended ${counts.totalToday} times today`,
        );
        return false;
      }

      if (!allowSameSessionRepeat && counts.sameSessionToday >= 1) {
        recordCandidateEligibilityRejection(
          candidate.ticker,
          "session_candidate_limit",
        );
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
          recordCandidateEligibilityRejection(
            candidate.ticker,
            "cooldown_active_position",
          );
          freshCandidatesRemovedByCooldown.push(
            `${candidate.ticker}: Active position already exists for ticker. Skipping.`,
          );
          return false;
        }

        if (
          !growMaxLearningMode &&
          currentRecommendationTickerSet.has(candidate.ticker)
        ) {
          recordCandidateEligibilityRejection(
            candidate.ticker,
            "current_recommendation_exists",
          );
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
              recordCandidateEligibilityRejection(
                candidate.ticker,
                "cooldown_active_position",
              );
              fallbackCandidatesRemovedByCooldown.push(
                `${candidate.ticker}: Active position already exists for ticker. Skipping.`,
              );
              return false;
            }

            if (
              !growMaxLearningMode &&
              currentRecommendationTickerSet.has(candidate.ticker)
            ) {
              recordCandidateEligibilityRejection(
                candidate.ticker,
                "current_recommendation_exists",
              );
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
        market_regime_context: originalMarketRegimeContext,
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
          market_wide_discovery: marketWideDiscovery.summary,
          candidate_decision_capture: candidateDecisionCapture({
            noPublishReason: "candidate_cooldown_filtered_all",
            recommendationBuildPath: "no_publish",
          }),
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
    const rankingObservedAt = new Date();
    const scannerCandidateRankingSummary =
      buildScannerCandidateRankingSummary({
        candidates: initiallyScoredCandidates,
        scanWindow,
        universeCoverage: scannerUniverseSelection.coverage,
        now: rankingObservedAt,
      });
    const scannerIntradayLiquidityShadowComparison =
      inputAttributed ? null : buildScannerIntradayLiquidityShadowComparison({
        candidates: initiallyScoredCandidates,
        baseline: scannerCandidateRankingSummary,
        scanWindow,
        universeCoverage: scannerUniverseSelection.coverage,
        now: rankingObservedAt,
      });
    const scannerClockPriorShadowComparison =
      inputAttributed ? null : buildScannerClockPriorShadowComparison({
        candidates: initiallyScoredCandidates,
        baseline: scannerCandidateRankingSummary,
        scanWindow,
        universeCoverage: scannerUniverseSelection.coverage,
        now: rankingObservedAt,
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
      topCandidate?.intraday_indicator_stale,
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
    const candidateLimit = Math.min(
      3,
      Math.max(1, settings.max_recommendations_per_session),
    );
    // Observation is not a publication quota. Retain the scored population,
    // but never send a withheld closing-session input to either builder.
    let candidatesForOpenAI = closingInputAnalysisOnly
      ? [] : qualifiedCandidates.slice(0, candidateLimit);
    const referenceRefreshMaxAttempts =
      // A legacy single-price refresh cannot replace the versioned session
      // inputs used for ranking or silently add requests to this challenger.
      inputAttributed ? 0 : source === "scheduled"
        ? scheduledProviderCreditBudget?.enforced
          ? Math.max(
              0,
              Math.min(
                SCHEDULED_REFERENCE_REFRESH_DEFAULT_MAX_ATTEMPTS,
                Math.floor(
                  scheduledProviderCreditBudget.reference_refresh_max_attempts,
                ),
              ),
            )
          : SCHEDULED_REFERENCE_REFRESH_DEFAULT_MAX_ATTEMPTS
        : 3;
    const referenceRefreshResult =
      candidatesForOpenAI.length > 0
        ? await refreshSelectedCandidateReferences({
            candidates: candidatesForOpenAI,
            maxAttempts: referenceRefreshMaxAttempts,
            now: new Date(),
            fetchIntradayIndicators: (ticker) =>
              getOrRefreshIntradayIndicators(ticker, {
                source: source === "scheduled" ? "scheduled" : "manual",
                maxAgeMinutes: SCANNER_INDICATOR_MAX_AGE_MINUTES,
                allowFreshFetch: true,
                signal,
              }),
          })
        : null;
    throwIfAborted(signal);
    const referenceRefreshDiagnostics =
      referenceRefreshResult?.diagnostics ?? null;
    candidatesForOpenAI = referenceRefreshResult?.candidates ?? candidatesForOpenAI;
    const availableCandidateTickers = availableCandidates.map(
      (candidate) => candidate.ticker,
    );
    const candidateTickersForOpenAI = candidatesForOpenAI.map(
      (candidate) => candidate.ticker,
    );
    const candidatesForOpenAiSet = new Set(candidateTickersForOpenAI);
    let selectedCandidateBuildDiagnostics =
      scoredCandidates
        .filter((candidate) => selectedRankingTickerSet.has(candidate.ticker))
        .filter((candidate) => !candidatesForOpenAiSet.has(candidate.ticker))
        .map((candidate) => {
          const ranking = rankingResultByTicker.get(candidate.ticker) ?? null;
          const planReferencePrice = markPlanReferenceRetained(
            buildPlanReferencePriceMetadata(candidate, {
              enforceFreshness: true,
            }),
          );
          const referencePrice = planReferencePrice.reference_price_used_for_plan;
          const planPrices =
            referencePrice === null
              ? null
              : buildPlanPricesFromReference(referencePrice);
          const geometryStatus = planPrices
            ? riskGeometryStatus(planPrices)
            : "not_checked";
          const rankingTier = ranking?.score.tier ?? "unknown";
          const rejectionReason =
            closingInputAnalysisOnly
              ? "power_hour_publication_withheld"
              : candidate.local_score < publishableThreshold
              ? "below_publish_threshold"
              : rankingTier !== "strong" &&
                  rankingTier !== "valid" &&
                  rankingTier !== "experimental"
                ? "ranking_selected_but_not_qualified"
                : "fallback_builder_limit_reached";

          return buildDiagnosticForCandidate({
            candidate,
            ranking,
            planReferencePrice,
            riskGeometryStatus: geometryStatus,
            built: false,
            rejectionReason,
            explanation: `${candidate.ticker} was selected by ranking but not sent to the recommendation builder: ${rejectionReason}.`,
          });
        });
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
      intraday_indicators: compactIntradayIndicators(
        candidate.intraday_indicators,
        candidate.intraday_indicator_stale,
      ),
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
    logPipeline("reference_refresh", referenceRefreshDiagnostics);
    logPipeline("real_scanner_candidate_generation", realScannerCandidateGeneration);
    logPipeline("candidate_tickers_sent_to_openai", candidateTickersForOpenAI);
    logPipeline("final_candidate_tickers_sent_to_openai", candidateTickersForOpenAI);
    logPipeline("duplicate_fallback_used", duplicateFallbackUsed);

    if (candidatesForOpenAI.length === 0) {
      const selectedToBuiltDropOff = summarizeSelectedCandidateBuildDiagnostics(
        selectedCandidateBuildDiagnostics,
        scannerCandidateRankingSummary.target_min,
      );
      const message =
        closingInputAnalysisOnly
          ? "Regular-session analysis completed. Late-session publication remains withheld."
          : qualifiedCandidates.length === 0
          ? "Scan completed. No structurally valid ranked learning candidates were publishable."
          : "Scan completed. Ranked candidates were available but none fit the publication limit.";

      logPipeline("inserted_recommendations_count", 0);
      logPipeline("skip_openai_reason", message);

      return {
        recommendations: [],
        message,
        duplicate_fallback_used: duplicateFallbackUsed,
        market_regime: marketRegime,
        market_regime_context: originalMarketRegimeContext,
        scan_window: scanWindow,
        scan_log: {
          ...publishVersionDetails(),
          result: "no_high_quality_setup",
          ...(closingInputAnalysisOnly
            ? { analysis_policy_version: REGULAR_SESSION_ANALYSIS_POLICY_VERSION } : {}),
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
            closingInputAnalysisOnly
              ? "power_hour_publication_withheld"
              : qualifiedCandidates.length === 0
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
          market_wide_discovery: marketWideDiscovery.summary,
          scanner_candidate_ranking: scannerCandidateRankingSummary,
          scanner_intraday_liquidity_shadow_comparison:
            scannerIntradayLiquidityShadowComparison,
          scanner_clock_prior_shadow_comparison:
            scannerClockPriorShadowComparison,
          grow_max_learning_mode: growMaxLearningMode,
          target_ideas_per_window: growMaxRecommendationTarget,
          reference_refresh: referenceRefreshDiagnostics,
          selected_candidate_build_diagnostics: selectedCandidateBuildDiagnostics,
          selected_to_built_drop_off: selectedToBuiltDropOff,
          candidate_decision_capture: candidateDecisionCapture({
            ranking: scannerCandidateRankingSummary,
            eligibleCandidateTickers: availableCandidateTickers,
            publishableThreshold,
            noPublishReason:
              closingInputAnalysisOnly
                ? "power_hour_publication_withheld"
                : qualifiedCandidates.length === 0
                ? "no_publishable_ranked_candidates"
                : "publish_limit_selected_zero_candidates",
            recommendationBuildPath: "no_publish",
            selectedBuildDiagnostics: selectedCandidateBuildDiagnostics,
          }),
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
    let deterministicFallbackSkippedReasons: string[] = [];
    let aiResponse: AiResponse;
    let explicitNoTrade: AiNoTradeDecision | null = null;
    let modelNoPublish: {
      reason:
        | "openai_zero_recommendations"
        | "openai_recommendation_validation_failed"
        | "current_session_inputs_expired";
      message: string;
    } | null = null;
    let openAiOutputRecommendationCount = 0;
    let openAiRealityGuardSummary: OpenAiRecommendationRealityGuardSummary | null =
      null;

    function deterministicFallback(reason: string): AiResponse {
      deterministicFallbackUsed = true;
      deterministicFallbackReason = reason;
      const deterministic = buildDeterministicLearningRecommendations({
        candidates: candidatesForOpenAI,
        rankingSummary: scannerCandidateRankingSummary,
        scanWindow,
        source,
        maxRecommendations: settings.max_recommendations_per_session,
        powerHourTrial,
      });
      deterministicFallbackSkippedReasons = deterministic.skippedReasons;
      selectedCandidateBuildDiagnostics = [
        ...selectedCandidateBuildDiagnostics.filter(
          (item) => !candidateTickersForOpenAI.includes(item.ticker),
        ),
        ...deterministic.buildDiagnostics,
      ];

      logPipeline("deterministic_fallback_used", true);
      logPipeline("deterministic_fallback_reason", reason);
      logPipeline(
        "deterministic_fallback_recommendations_count",
        deterministic.recommendations.length,
      );
      logPipeline(
        "deterministic_fallback_reference_block_reasons",
        deterministicFallbackSkippedReasons,
      );

      return {
        result: "trade_recommendation",
        recommendations: deterministic.recommendations,
      };
    }

    try {
      throwIfAborted(signal);
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
      throwIfAborted(signal);
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

    const modelPublicationAction =
      resolveAiRecommendationPublicationAction({
        result: aiResponse.result,
        no_trade: aiResponse.no_trade,
        recommendation_count: aiResponse.recommendations.length,
      });
    if (modelPublicationAction.kind === "preserve_no_trade") {
      explicitNoTrade = modelPublicationAction.no_trade;
      const rejectedTicker =
        explicitNoTrade.candidate_ticker ||
        topCandidate?.ticker ||
        candidateTickersForOpenAI[0] ||
        "candidate";
      const rejectedReason = explicitNoTrade.reason;

      logPipeline("openai_no_trade_ticker", rejectedTicker);
      logPipeline("openai_no_trade_reason", rejectedReason);
      logPipeline("openai_no_trade_risk_flags", explicitNoTrade.risk_flags);
      logPipeline(
        "openai_no_trade_confidence_score",
        explicitNoTrade.confidence_score,
      );
      logPipeline("validated_recommendations_count", 0);
      logPipeline("explicit_no_trade_preserved", true);
    }

    if (modelPublicationAction.kind === "preserve_no_publish") {
      modelNoPublish = {
        reason: modelPublicationAction.no_publish_reason,
        message: modelPublicationAction.message,
      };
      logPipeline("validated_recommendations_count", 0);
      logPipeline("openai_no_publish_reason", modelNoPublish.reason);
      logPipeline("openai_no_publish_message", modelNoPublish.message);
    }

    const sanitizedRecommendations = sanitizeRecommendations(
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
    const publicationCheckedAt = new Date();
    const publicationDecisionTimestamp = publicationCheckedAt.toISOString();
    const recommendationsToInsert = sanitizedRecommendations.recommendations.filter(recommendation => {
      if (!inputAttributed) return true;
      const candidate = scannerCandidates.find(candidate => candidate.ticker === recommendation.ticker);
      const usable = candidate !== undefined && isScannerDecisionInputPublishable(
        captureScannerDecisionInputSnapshot(candidate, candidateDecisionCaptureTimestamp),
        recommendation.ticker, publicationCheckedAt,
      );
      if (!usable) {
        recordCandidateEligibilityRejection(recommendation.ticker, "provider_data_stale");
        sanitizedRecommendations.skippedReasons.push(`${recommendation.ticker}: versioned current-session inputs expired or unavailable before publication.`);
      }
      return usable;
    });
    if (inputAttributed && recommendationsToInsert.length === 0 && sanitizedRecommendations.recommendations.length > 0) {
      modelNoPublish = { reason: "current_session_inputs_expired",
        message: "No trade: current-session inputs expired or became unavailable before publication." };
    }

    const sanitizedPublicationAction =
      resolveSanitizedRecommendationPublicationAction({
        model_recommendation_count: aiResponse.recommendations.length,
        sanitized_recommendation_count: recommendationsToInsert.length,
        deterministic_fallback_used: deterministicFallbackUsed,
      });
    if (
      !explicitNoTrade &&
      !modelNoPublish &&
      sanitizedPublicationAction.kind === "preserve_no_publish"
    ) {
      modelNoPublish = {
        reason: sanitizedPublicationAction.no_publish_reason,
        message: sanitizedPublicationAction.message,
      };
      logPipeline("openai_no_publish_reason", modelNoPublish.reason);
      logPipeline(
        "openai_no_publish_rejection_reasons",
        sanitizedRecommendations.skippedReasons,
      );
    }

    if (!deterministicFallbackUsed) {
      const builtTickerSet = new Set(
        recommendationsToInsert.map((recommendation) => recommendation.ticker),
      );
      const openAiBuildDiagnostics = candidatesForOpenAI.map((candidate) => {
        const ranking = rankingResultByTicker.get(candidate.ticker) ?? null;
        const planReferencePrice = markPlanReferenceRetained(
          buildPlanReferencePriceMetadata(candidate, {
            enforceFreshness: true,
          }),
        );
        const referencePrice = planReferencePrice.reference_price_used_for_plan;
        const planPrices =
          referencePrice === null ? null : buildPlanPricesFromReference(referencePrice);
        const geometryStatus = planPrices ? riskGeometryStatus(planPrices) : "not_checked";
        const built = builtTickerSet.has(candidate.ticker);

        return buildDiagnosticForCandidate({
          candidate,
          ranking,
          planReferencePrice,
          riskGeometryStatus: geometryStatus,
          built,
          rejectionReason: built
            ? "built"
            : sanitizedRecommendations.skippedReasons.length > 0
              ? "sanitizer_rejected"
              : "openai_no_trade",
          explanation: built
            ? `${candidate.ticker} was built by the OpenAI recommendation path.`
            : `${candidate.ticker} was selected but not built by the OpenAI recommendation path.`,
        });
      });

      selectedCandidateBuildDiagnostics = [
        ...selectedCandidateBuildDiagnostics.filter(
          (item) => !candidateTickersForOpenAI.includes(item.ticker),
        ),
        ...openAiBuildDiagnostics,
      ];
    }

    const selectedToBuiltDropOff = summarizeSelectedCandidateBuildDiagnostics(
      selectedCandidateBuildDiagnostics,
      scannerCandidateRankingSummary.target_min,
    );

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
      [
        ...sanitizedRecommendations.skippedReasons,
        ...deterministicFallbackSkippedReasons,
      ],
    );
    logPipeline(
      "openai_recommendation_reality_guard_final",
      openAiRealityGuardSummary,
    );

    if (recommendationsToInsert.length === 0) {
      logPipeline("inserted_recommendations_count", 0);
      logPipeline("inserted_recommendation_tickers", []);
      const noPublishReason = explicitNoTrade
        ? "openai_no_trade"
        : (modelNoPublish?.reason ??
          (deterministicFallbackUsed
            ? "deterministic_fallback_validation_failed"
            : "recommendation_validation_failed"));
      const noTradeReason = explicitNoTrade?.reason ?? null;

      return {
        recommendations: [],
        message: explicitNoTrade
          ? `No trade: ${noTradeReason}`
          : (modelNoPublish?.message ??
            (duplicateFallbackUsed
              ? duplicateFallbackMessage
              : "Ranked learning candidates were available but failed recommendation validation.")),
        duplicate_fallback_used: duplicateFallbackUsed,
        market_regime: marketRegime,
        market_regime_context: originalMarketRegimeContext,
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
          no_trade_reason: noTradeReason,
          no_trade_risk_flags: explicitNoTrade?.risk_flags ?? null,
          no_trade_candidate_ticker:
            explicitNoTrade?.candidate_ticker ?? null,
          no_trade_confidence_score:
            explicitNoTrade?.confidence_score ?? null,
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
            noTradeReason ??
            sanitizedRecommendations.skippedReasons[0] ??
            deterministicFallbackSkippedReasons[0] ??
            deterministicFallbackReason ??
            "Publishable candidates failed recommendation validation.",
          no_publish_reason: noPublishReason,
          power_hour_trial_enabled: powerHourTrialPublishing,
          power_hour_publish_allowed: powerHourTrial,
          power_hour_publish_block_reason: null,
          deterministic_fallback_used: deterministicFallbackUsed,
          deterministic_fallback_reference_block_count:
            deterministicFallbackSkippedReasons.length,
          deterministic_fallback_reference_block_reasons:
            deterministicFallbackSkippedReasons,
          reference_refresh: referenceRefreshDiagnostics,
          selected_candidate_build_diagnostics:
            selectedCandidateBuildDiagnostics,
          selected_to_built_drop_off: selectedToBuiltDropOff,
          candidates_scanned: scoredCandidates.length,
          skipped_tickers:
            candidatesRemovedByCooldown.length +
            sanitizedRecommendations.skippedReasons.length +
            deterministicFallbackSkippedReasons.length,
          real_scanner_candidate_generation: realScannerCandidateGeneration,
          dynamic_movers_discovery: dynamicMoversDiscovery,
          market_wide_discovery: marketWideDiscovery.summary,
          scanner_candidate_ranking: scannerCandidateRankingSummary,
          scanner_intraday_liquidity_shadow_comparison:
            scannerIntradayLiquidityShadowComparison,
          scanner_clock_prior_shadow_comparison:
            scannerClockPriorShadowComparison,
          grow_max_learning_mode: growMaxLearningMode,
          target_ideas_per_window: growMaxRecommendationTarget,
          openai_recommendation_reality_guard: openAiRealityGuardSummary,
          candidate_decision_capture: candidateDecisionCapture({
            ranking: scannerCandidateRankingSummary,
            eligibleCandidateTickers: availableCandidateTickers,
            publishableThreshold,
            noPublishReason,
            recommendationBuildPath: "no_publish",
            builtTickers: recommendationsToInsert.map(
              (recommendation) => recommendation.ticker,
            ),
            selectedBuildDiagnostics: selectedCandidateBuildDiagnostics,
          }),
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
        market_regime_context: originalMarketRegimeContext,
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
          deterministic_fallback_reference_block_count:
            deterministicFallbackSkippedReasons.length,
          deterministic_fallback_reference_block_reasons:
            deterministicFallbackSkippedReasons,
          reference_refresh: referenceRefreshDiagnostics,
          selected_candidate_build_diagnostics:
            selectedCandidateBuildDiagnostics,
          selected_to_built_drop_off: selectedToBuiltDropOff,
          candidates_scanned: scoredCandidates.length,
          skipped_tickers:
            candidatesRemovedByCooldown.length +
            sanitizedRecommendations.skippedReasons.length +
            deterministicFallbackSkippedReasons.length,
          real_scanner_candidate_generation: realScannerCandidateGeneration,
          dynamic_movers_discovery: dynamicMoversDiscovery,
          market_wide_discovery: marketWideDiscovery.summary,
          scanner_candidate_ranking: scannerCandidateRankingSummary,
          scanner_intraday_liquidity_shadow_comparison:
            scannerIntradayLiquidityShadowComparison,
          scanner_clock_prior_shadow_comparison:
            scannerClockPriorShadowComparison,
          grow_max_learning_mode: growMaxLearningMode,
          target_ideas_per_window: growMaxRecommendationTarget,
          openai_recommendation_reality_guard: openAiRealityGuardSummary,
          candidate_decision_capture: candidateDecisionCapture({
            ranking: scannerCandidateRankingSummary,
            eligibleCandidateTickers: availableCandidateTickers,
            publishableThreshold,
            recommendationBuildPath,
            builtTickers: recommendationsToInsert.map(
              (recommendation) => recommendation.ticker,
            ),
            selectedBuildDiagnostics: selectedCandidateBuildDiagnostics,
          }),
        } satisfies RecommendationScanLogDetails,
      };
    }

    throwIfAborted(signal);
    const insertResult = await db
      .from("recommendations")
      .insert(
        recommendationsToInsert.map((recommendation) => ({
          ...recommendation,
          owner_user_id: owner,
        })),
      )
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
      market_regime_context: originalMarketRegimeContext,
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
        deterministic_fallback_reference_block_count:
          deterministicFallbackSkippedReasons.length,
        deterministic_fallback_reference_block_reasons:
          deterministicFallbackSkippedReasons,
        reference_refresh: referenceRefreshDiagnostics,
        selected_candidate_build_diagnostics:
          selectedCandidateBuildDiagnostics,
        selected_to_built_drop_off: selectedToBuiltDropOff,
        candidates_scanned: scoredCandidates.length,
        skipped_tickers:
          candidatesRemovedByCooldown.length +
          sanitizedRecommendations.skippedReasons.length +
          deterministicFallbackSkippedReasons.length,
        real_scanner_candidate_generation: realScannerCandidateGeneration,
        dynamic_movers_discovery: dynamicMoversDiscovery,
        market_wide_discovery: marketWideDiscovery.summary,
        scanner_candidate_ranking: scannerCandidateRankingSummary,
        scanner_intraday_liquidity_shadow_comparison:
          scannerIntradayLiquidityShadowComparison,
        scanner_clock_prior_shadow_comparison:
          scannerClockPriorShadowComparison,
        grow_max_learning_mode: growMaxLearningMode,
        target_ideas_per_window: growMaxRecommendationTarget,
        openai_recommendation_reality_guard: openAiRealityGuardSummary,
        candidate_decision_capture: candidateDecisionCapture({
          ranking: scannerCandidateRankingSummary,
          eligibleCandidateTickers: availableCandidateTickers,
          publishableThreshold,
          recommendationBuildPath,
          builtTickers: recommendationsToInsert.map(
            (recommendation) => recommendation.ticker,
          ),
          publishedTickers: insertedRecommendationTickers,
          selectedBuildDiagnostics: selectedCandidateBuildDiagnostics,
          decisionTimestamp: publicationDecisionTimestamp,
        }),
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
