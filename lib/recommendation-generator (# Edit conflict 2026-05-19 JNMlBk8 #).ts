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
import { getDefaultRecommendationExpiryCutoff } from "@/lib/recommendation-freshness";
import { supabase } from "@/lib/supabase";

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

export type GenerateRecommendationsInput = {
  sessionType: SessionType;
  scanWindow: IntradayScanWindow;
  targetCount?: number;
  source: RecommendationGenerationSource;
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
  setup_type: string;
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
};

type AiResponse = {
  recommendations: AiRecommendation[];
};

type SanitizedRecommendationsResult = {
  recommendations: RecommendationInsert[];
  skippedReasons: string[];
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
};

type ScoredCandidate = MockCandidate & {
  local_score: number;
  local_score_reasons: string[];
  local_score_warnings: string[];
};

const dayTradeHorizon = "day_trade";
const dayTradeTimeframe = "Intraday / day trade";
const DEFAULT_DAY_TRADE_SCORE_THRESHOLD = 70;
const MANUAL_DAY_TRADE_SCORE_THRESHOLD = 62;
const MAX_SCHEDULED_RECOMMENDATIONS_PER_SCAN = 1;
const MAX_CURRENT_RECOMMENDATIONS = 3;
const ALLOW_POWER_HOUR_NEW_RECOMMENDATIONS = false;
const MINIMUM_OPENAI_CONFIDENCE_SCORE = 55;

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

function parseCandidateNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function scoreDayTradeCandidate(
  candidate: MockCandidate,
  context: {
    marketRegime: MarketRegime;
    scanWindow: IntradayScanWindow;
  },
): CandidateScore {
  let score = 0;
  const reasons: string[] = [];
  const warnings: string[] = [];

  const volumeRatio = parseCandidateNumber(candidate.volume_ratio);
  const change5dPercent = parseCandidateNumber(candidate.change_5d_percent);
  const latestClose = parseCandidateNumber(
    candidate.latest_close ?? candidate.mock_current_price,
  );
  const ma20 = parseCandidateNumber(candidate.ma20);
  const ma50 = parseCandidateNumber(candidate.ma50);
  const distanceTo20dHigh = parseCandidateNumber(candidate.distance_to_20d_high);
  const riskReward = parseCandidateNumber(candidate.proposed_risk_reward);

  if (volumeRatio === null) {
    warnings.push("Volume ratio unavailable.");
  } else if (volumeRatio >= 1.5) {
    score += 20;
    reasons.push(`Elevated volume at ${volumeRatio}x average.`);
  } else if (volumeRatio >= 1.05) {
    score += 15;
    reasons.push(`Volume is above average at ${volumeRatio}x.`);
  } else if (volumeRatio >= 0.8) {
    score += 8;
    reasons.push(`Volume is near average at ${volumeRatio}x.`);
  } else {
    warnings.push(`Light volume at ${volumeRatio}x average.`);
  }

  if (change5dPercent === null) {
    warnings.push("5-day price change unavailable.");
  } else if (change5dPercent >= 1 && change5dPercent <= 8) {
    score += 20;
    reasons.push(`Constructive 5-day momentum at ${change5dPercent}%.`);
  } else if (change5dPercent > 8) {
    score += 10;
    warnings.push(`Move may be extended after ${change5dPercent}% in 5 days.`);
  } else if (change5dPercent >= 0) {
    score += 10;
    reasons.push(`Price is holding positive 5-day momentum at ${change5dPercent}%.`);
  } else {
    warnings.push(`Negative 5-day momentum at ${change5dPercent}%.`);
  }

  if (latestClose === null || ma20 === null || ma50 === null) {
    warnings.push("Trend moving-average data unavailable.");
  } else if (latestClose > ma20 && ma20 > ma50) {
    score += 20;
    reasons.push("Clean uptrend above MA20 and MA50.");
  } else if (latestClose > ma50 && change5dPercent !== null && change5dPercent >= 0) {
    score += 12;
    reasons.push("Constructive recovery above MA50.");
  } else if (latestClose > ma20) {
    score += 8;
    reasons.push("Short-term strength above MA20.");
  } else {
    warnings.push("Trend is not clean enough for an easy day trade setup.");
  }

  if (riskReward === null) {
    warnings.push("Estimated risk/reward unavailable.");
  } else if (riskReward >= 2) {
    score += 15;
    reasons.push(`Estimated risk/reward is ${riskReward}.`);
  } else if (riskReward >= 1.5) {
    score += 10;
    reasons.push(`Acceptable estimated risk/reward at ${riskReward}.`);
  } else {
    warnings.push(`Weak estimated risk/reward at ${riskReward}.`);
  }

  if (distanceTo20dHigh === null) {
    warnings.push("Distance to 20-day high unavailable.");
  } else if (distanceTo20dHigh <= 3) {
    score += 10;
    reasons.push(`Trading close to 20-day high, ${distanceTo20dHigh}% away.`);
  } else if (distanceTo20dHigh <= 8) {
    score += 6;
    reasons.push(`Within range of 20-day high, ${distanceTo20dHigh}% away.`);
  } else {
    warnings.push(`Far from 20-day high at ${distanceTo20dHigh}% away.`);
  }

  if (context.marketRegime.regime === "risk_on") {
    score += 5;
    reasons.push("Market regime is risk on.");
  } else if (context.marketRegime.regime === "risk_off") {
    score -= 8;
    warnings.push("Market regime is risk off.");
  }

  if (context.scanWindow === "midday") {
    score -= 5;
    warnings.push("Midday setups need extra selectivity.");
  }

  // TODO: Add true intraday relative volume, VWAP/ORB structure, spread, and
  // real-time liquidity once the scanner captures intraday fields.
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    reasons,
    warnings,
  };
}

function toScoredCandidate(
  candidate: MockCandidate,
  context: {
    marketRegime: MarketRegime;
    scanWindow: IntradayScanWindow;
  },
): ScoredCandidate {
  const localScore = scoreDayTradeCandidate(candidate, context);

  return {
    ...candidate,
    local_score: localScore.score,
    local_score_reasons: localScore.reasons,
    local_score_warnings: localScore.warnings,
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
    required: ["recommendations"],
    properties: {
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
          ],
          properties: {
            ticker: { type: "string" },
            company_name: { type: "string" },
            direction: { type: "string", enum: ["long"] },
            setup_type: { type: "string" },
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
          },
        },
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
  const { error } = await supabase.from("market_regime_snapshots").insert({
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
    console.error("[recommendations/generate] market_regime_snapshot_insert_error", error);
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

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !Array.isArray((parsed as { recommendations?: unknown }).recommendations)
    ) {
      throw new Error("Response JSON did not include a recommendations array.");
    }

    return parsed as AiResponse;
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
  availableCandidates: MockCandidate[],
  sessionType: SessionType,
  maxRecommendations: number,
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

      seenTickers.add(ticker);

      recommendations.push({
        session_type: sessionType,
        ticker,
        company_name: companyName,
        direction: "long",
        setup_type: fallbackText(
          recommendation.setup_type,
          "Scanner-based setup",
        ),
        entry_low: number(recommendation.entry_low, `${ticker}.entry_low`),
        entry_high: number(recommendation.entry_high, `${ticker}.entry_high`),
        stop_loss: number(recommendation.stop_loss, `${ticker}.stop_loss`),
        target_1: number(recommendation.target_1, `${ticker}.target_1`),
        target_2: number(recommendation.target_2, `${ticker}.target_2`),
        risk_reward: number(
          recommendation.risk_reward,
          `${ticker}.risk_reward`,
        ),
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
        reason_to_avoid: fallbackText(
          recommendation.reason_to_avoid,
          "Avoid if the setup loses intraday momentum, market conditions weaken, or price action invalidates the same-day trade plan.",
        ),
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
  availableCandidates: MockCandidate[],
  sessionType: SessionType,
  scanWindow: IntradayScanWindow,
  settings: UserSettings,
  duplicateFallbackUsed: boolean,
  marketRegime: MarketRegime,
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Add it to .env.local.");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const maxRecommendations = settings.max_recommendations_per_session;
  const allowedDirections = ["long"];

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    instructions: [
      "You generate mock trade recommendation cards for a private trading app.",
      "You are not using live market data.",
      "You must not pretend the recommendations are based on real-time prices.",
      "Treat the provided candidates as mock structured inputs only.",
      "Generate only intraday day trade recommendations.",
      "Every trade must be suitable for same-day execution.",
      "Do not recommend swing trades or multi-day holds.",
      "If the setup requires holding overnight, reject it.",
      "Prioritize liquid US stocks, intraday momentum, volume confirmation, a clean entry trigger, tight invalidation, a realistic same-day target, and clear risk/reward.",
      "Prefer no recommendation over a weak recommendation.",
      "Do not force a recommendation.",
      "Candidate passed local scan, but you must still reject it if risk/reward or intraday structure is weak.",
      "Each recommendation must include an entry trigger, stop loss / intraday invalidation, target, risk/reward, reason for the same-day opportunity, what would invalidate the setup intraday, and a time sensitivity / freshness note.",
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
      "Make entry, stop, and target levels coherent with each candidate's mock support, mock resistance, and mock_current_price.",
      "risk_reward must be a JSON number such as 2.2, never a string such as 2.2R or 1:2.2.",
      "Only output JSON. Do not include markdown. Do not include explanations outside JSON.",
    ].join("\n"),
    input: JSON.stringify({
      session_type: sessionType,
      scan_window: scanWindow,
      max_recommendations: maxRecommendations,
      preferred_timeframe: settings.preferred_timeframe,
      allowed_directions: allowedDirections,
      market_regime: marketRegime,
      trade_horizon: dayTradeHorizon,
      local_scoring: {
        threshold_note:
          "Candidates include local_score, local_score_reasons, and local_score_warnings from the app's scanner.",
      },
      candidates: availableCandidates,
    }),
    text: {
      format: {
        type: "json_schema",
        name: "trade_recommendations",
        strict: true,
        schema: createRecommendationSchema(maxRecommendations),
      },
    },
    temperature: 0.3,
    max_output_tokens: Math.max(3600, maxRecommendations * 900),
    store: false,
  });

  if (!response.output_text) {
    throw new Error("OpenAI returned an empty response.");
  }

  return parseAiResponse(response.output_text);
}

export async function generateRecommendations({
  sessionType,
  scanWindow,
  targetCount,
  source,
}: GenerateRecommendationsInput) {
  try {
    const todayStart = getStartOfToday();
    const scanPolicy = getIntradayScanPolicy(scanWindow);

    logPipeline("scan_window", scanWindow);
    logPipeline("scan_window_policy", scanPolicy);

    if (scanWindow === "power_hour" && !ALLOW_POWER_HOUR_NEW_RECOMMENDATIONS) {
      logPipeline("inserted_recommendations_count", 0);

      return {
        recommendations: [],
        message:
          "Power hour: new recommendations disabled. Focus on managing active positions.",
        scan_window: scanWindow,
      };
    }

    if (!scanPolicy.allowGeneration) {
      logPipeline("inserted_recommendations_count", 0);

      return {
        recommendations: [],
        message: scanPolicy.message,
        scan_window: scanWindow,
      };
    }

    const [
      settingsResult,
      todaysRecommendationsResult,
      currentRecommendationsResult,
      openPositionsResult,
    ] = await Promise.all([
        supabase
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
        supabase
          .from("recommendations")
          .select("ticker,session_type")
          .gte("created_at", todayStart),
        supabase
          .from("recommendations")
          .select("ticker,status,archived,created_at")
          .or("status.eq.new,status.is.null")
          .or("archived.eq.false,archived.is.null")
          .gte("created_at", getDefaultRecommendationExpiryCutoff()),
        supabase.from("positions").select("ticker,status"),
      ]);

    if (settingsResult.error) {
      console.error(settingsResult.error);
      throw new RecommendationGenerationError(
        settingsResult.error.message ?? "Unknown error",
        500,
      );
    }

    if (todaysRecommendationsResult.error) {
      console.error(todaysRecommendationsResult.error);
      throw new RecommendationGenerationError(
        todaysRecommendationsResult.error.message ?? "Unknown error",
        500,
      );
    }

    if (currentRecommendationsResult.error) {
      console.error(currentRecommendationsResult.error);
      throw new RecommendationGenerationError(
        currentRecommendationsResult.error.message ?? "Unknown error",
        500,
      );
    }

    if (openPositionsResult.error) {
      console.error(openPositionsResult.error);
      throw new RecommendationGenerationError(
        openPositionsResult.error.message ?? "Unknown error",
        500,
      );
    }

    const settingsRow = settingsResult.data as UserSettingsRow | null;
    const baseSettings = normalizeUserSettings(settingsRow);
    const requestedMaxRecommendations =
      typeof targetCount === "number" && Number.isFinite(targetCount)
        ? clamp(Math.round(targetCount), 1, scanPolicy.maxRecommendations)
        : Math.min(
            baseSettings.max_recommendations_per_session,
            scanPolicy.maxRecommendations,
          );
    const maxRecommendationsForRun =
      source === "scheduled"
        ? Math.min(requestedMaxRecommendations, MAX_SCHEDULED_RECOMMENDATIONS_PER_SCAN)
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

    const scannerCandidates = await scanMarket(mockCandidates, { source });

    logPipeline(
      "total_scanner_candidates_before_filtering",
      scannerCandidates.length,
    );

    if (scannerCandidates.length === 0) {
      if (source === "scheduled") {
        return {
          recommendations: [],
          message: "Scan completed. No high-quality day trade setup found.",
          scan_window: scanWindow,
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
      console.error("[recommendations/generate] market_regime_error", error);
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

      if (counts.totalToday >= 2) {
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

        if (currentRecommendationTickerSet.has(candidate.ticker)) {
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

            if (currentRecommendationTickerSet.has(candidate.ticker)) {
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
      };
    }

    const scoredCandidates = availableCandidates
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
    const threshold = getDayTradeScoreThreshold(scanWindow, source);
    const topCandidate = scoredCandidates[0] ?? null;
    const topCandidateScore = topCandidate?.local_score ?? 0;
    const qualifiedCandidates = scoredCandidates.filter(
      (candidate) => candidate.local_score >= threshold,
    );
    const candidateLimit =
      source === "scheduled"
        ? Math.max(1, settings.max_recommendations_per_session * 3)
        : Math.max(6, settings.max_recommendations_per_session * 3);
    const candidatesForOpenAI = qualifiedCandidates.slice(0, candidateLimit);
    const availableCandidateTickers = availableCandidates.map(
      (candidate) => candidate.ticker,
    );
    const candidateTickersForOpenAI = candidatesForOpenAI.map(
      (candidate) => candidate.ticker,
    );
    const scoredCandidateSummary = scoredCandidates.slice(0, 8).map((candidate) => ({
      ticker: candidate.ticker,
      score: candidate.local_score,
      reasons: candidate.local_score_reasons,
      warnings: candidate.local_score_warnings,
    }));

    logPipeline("scanner_candidates_after_filtering", availableCandidates.length);
    logPipeline("scanner_candidate_tickers_after_filtering", availableCandidateTickers);
    logPipeline("candidates_removed_by_cooldown", candidatesRemovedByCooldown);
    logPipeline("day_trade_score_threshold", threshold);
    logPipeline("top_scored_candidate", topCandidate?.ticker ?? null);
    logPipeline("top_scored_candidate_score", topCandidateScore);
    logPipeline("scored_candidates", scoredCandidateSummary);
    logPipeline("candidate_tickers_sent_to_openai", candidateTickersForOpenAI);
    logPipeline("final_candidate_tickers_sent_to_openai", candidateTickersForOpenAI);
    logPipeline("duplicate_fallback_used", duplicateFallbackUsed);

    if (!topCandidate || topCandidateScore < threshold) {
      const message = `Scan completed. Candidate below threshold: ${topCandidateScore}/${threshold}.`;

      logPipeline("inserted_recommendations_count", 0);
      logPipeline("skip_openai_reason", message);

      return {
        recommendations: [],
        message:
          topCandidateScore === 0
            ? "Scan completed. No high-quality day trade setup found."
            : message,
        duplicate_fallback_used: duplicateFallbackUsed,
        market_regime: marketRegime,
        scan_window: scanWindow,
      };
    }

    if (candidatesForOpenAI.length === 0) {
      const message = "Scan completed. No high-quality day trade setup found.";

      logPipeline("inserted_recommendations_count", 0);
      logPipeline("skip_openai_reason", message);

      return {
        recommendations: [],
        message,
        duplicate_fallback_used: duplicateFallbackUsed,
        market_regime: marketRegime,
        scan_window: scanWindow,
      };
    }

    const aiResponse = await generateRecommendationsWithOpenAI(
      candidatesForOpenAI,
      sessionType,
      scanWindow,
      settings,
      duplicateFallbackUsed,
      marketRegime,
    );
    logPipeline("raw_openai_recommendations_count", aiResponse.recommendations.length);

    if (aiResponse.recommendations.length === 0) {
      logPipeline("validated_recommendations_count", 0);
      logPipeline("skipped_recommendations_count", 0);
      logPipeline("skipped_recommendation_reasons", []);
      logPipeline("inserted_recommendations_count", 0);
      logPipeline("inserted_recommendation_tickers", []);

      return {
        recommendations: [],
        message: duplicateFallbackUsed
          ? duplicateFallbackMessage
          : "No high-quality day trade setup found for this scan window.",
        duplicate_fallback_used: duplicateFallbackUsed,
        market_regime: marketRegime,
        scan_window: scanWindow,
      };
    }

    const sanitizedRecommendations = sanitizeRecommendations(
      aiResponse.recommendations,
      candidatesForOpenAI,
      sessionType,
      settings.max_recommendations_per_session,
    );
    const recommendationsToInsert = sanitizedRecommendations.recommendations;

    logPipeline("validated_recommendations_count", recommendationsToInsert.length);
    logPipeline(
      "skipped_recommendations_count",
      sanitizedRecommendations.skippedReasons.length,
    );
    logPipeline(
      "skipped_recommendation_reasons",
      sanitizedRecommendations.skippedReasons,
    );

    if (recommendationsToInsert.length === 0) {
      logPipeline("inserted_recommendations_count", 0);
      logPipeline("inserted_recommendation_tickers", []);

      return {
        recommendations: [],
        message: duplicateFallbackUsed
          ? duplicateFallbackMessage
          : "No high-quality day trade setup found for this scan window.",
        duplicate_fallback_used: duplicateFallbackUsed,
        market_regime: marketRegime,
        scan_window: scanWindow,
      };
    }

    const insertResult = await supabase
      .from("recommendations")
      .insert(recommendationsToInsert)
      .select("*");

    if (insertResult.error) {
      console.error(insertResult.error);
      throw new RecommendationGenerationError(
        insertResult.error.message ?? "Unknown error",
        500,
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
      );
    }

    return {
      recommendations: insertedRecommendations,
      inserted_count: insertedRecommendations.length,
      inserted_tickers: insertedRecommendationTickers,
      duplicate_fallback_used: duplicateFallbackUsed,
      market_regime: marketRegime,
      scan_window: scanWindow,
      ...(duplicateFallbackUsed ? { message: duplicateFallbackMessage } : {}),
    };
  } catch (error) {
    console.error(error);
    if (error instanceof RecommendationGenerationError) {
      throw error;
    }

    throw new RecommendationGenerationError(
      error instanceof Error && error.message ? error.message : "Unknown error",
      500,
    );
  }
}
