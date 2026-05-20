"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getIntradayScanPolicy,
  getIntradayScanWindow,
  getIntradayScanWindowLabel,
  getLegacySessionTypeForScanWindow,
  isMarketOpenForIntradayTrading,
  type IntradayScanWindow,
} from "@/lib/intraday-scan-window";
import {
  getRecommendationFreshness,
  isRecommendationExpired,
} from "@/lib/recommendation-freshness";
import {
  type DiscardDecisionQuality,
  type DiscardOutcome,
  type DiscardReviewStatus,
} from "@/lib/discard-review-types";
import {
  parseScanLogFromMessage,
  type ScanLogEntry,
  type ScanLogResult,
  type ScanLogRunRow,
} from "@/lib/scan-logs";
import { supabase } from "@/lib/supabase";

type Direction = "Long" | "Short";
type RecommendationStatus =
  | "new"
  | "watched"
  | "ignored"
  | "discarded"
  | "rejected"
  | "taken";
type SessionType = "morning" | "midday";
type Tab = "Recommendations" | "Live Day Trades" | "History" | "Market";

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

type RecommendationRow = {
  id: string;
  session_type: string | null;
  ticker: string;
  company_name: string | null;
  direction: string | null;
  setup_type: string | null;
  entry_low: number | string | null;
  entry_high: number | string | null;
  stop_loss: number | string | null;
  target_1: string | null;
  target_2: string | null;
  risk_reward: string | null;
  confidence: string | null;
  confidence_score?: number | string | null;
  confidence_label?: string | null;
  confidence_breakdown?: ConfidenceBreakdown | string | null;
  confidence_reasoning?: string | null;
  risk_flags?: string[] | string | null;
  discarded_at?: string | null;
  discard_review_status?: DiscardReviewStatus | string | null;
  discard_reviewed_at?: string | null;
  discard_outcome?: DiscardOutcome | string | null;
  discard_theoretical_r?: number | string | null;
  discard_decision_quality?: DiscardDecisionQuality | string | null;
  timeframe: string | null;
  thesis: string | null;
  invalidation: string | null;
  reason_to_avoid: string | null;
  status: string | null;
  archived?: boolean | null;
  expires_at?: string | null;
  scan_window?: string | null;
  created_at?: string | null;
};

type UserSettingsRow = {
  portfolio_size: number | string | null;
  risk_per_trade_percent: number | string | null;
};

type PositionRow = {
  id: string;
  recommendation_id?: string | null;
  recommendations?: { setup_type: string | null } | null;
  ticker: string;
  company_name: string | null;
  direction?: string | null;
  entry_price: number | string | null;
  position_size: number | string | null;
  current_stop: string | null;
  target_1: string | null;
  target_2: string | null;
  status?: string | null;
  exit_price?: number | string | null;
  closed_at?: string | null;
  pnl?: number | string | null;
  pnl_percent?: number | string | null;
  r_multiple?: number | string | null;
  exit_notes?: string | null;
  created_at?: string | null;
};

type PositionUpdateAction =
  | "CLOSE_POSITION"
  | "TAKE_PROFIT"
  | "TAKE_PARTIAL_PROFIT"
  | "MOVE_STOP_TO_BREAKEVEN"
  | "HOLD";

type PositionUpdateRow = {
  id?: string;
  position_id: string;
  action: PositionUpdateAction | string | null;
  recommendation: string | null;
  explanation: string | null;
  new_stop: number | string | null;
  created_at?: string | null;
};

type PositionUpdateResult = {
  position_id: string;
  ticker: string;
  action: PositionUpdateAction;
  recommendation: string;
  explanation: string;
  new_stop: number | null;
  current_price: number;
  unrealized_percent: number;
  risk_per_share: number;
  unrealized_r_multiple: number;
};

type GenerateRecommendationsResult = {
  recommendations?: RecommendationRow[];
  inserted_count?: number;
  inserted_tickers?: string[];
  duplicate_fallback_used?: boolean;
  market_regime?: MarketRegime;
  market_status?: MarketStatus;
  scan_window?: IntradayScanWindow;
  scan_window_label?: string;
  message?: string;
  error?: string;
};

type MarketStatus = {
  isOpenDay: boolean;
  reason: string;
  date: string;
  dayType: "trading_day" | "weekend" | "holiday" | "early_close" | "unknown";
  marketOpenTime: string | null;
  marketCloseTime: string | null;
  provider: string;
  fromCache: boolean;
};

type MarketRegimeType = "risk_on" | "neutral" | "risk_off";

type TopMarketStatus = "open" | "closed" | "closed_today" | "unknown";

type MarketRegimeSymbol = {
  close: number;
  ma20: number;
  ma50: number;
  change_5d_percent: number;
  above_ma20: boolean;
  above_ma50: boolean;
};

type MarketRegime = {
  regime: MarketRegimeType;
  summary: string;
  spy: MarketRegimeSymbol;
  qqq: MarketRegimeSymbol;
};

type MarketRegimeSnapshotRow = {
  regime: string | null;
  summary: string | null;
  spy_close: number | string | null;
  spy_ma20: number | string | null;
  spy_ma50: number | string | null;
  spy_change_5d_percent: number | string | null;
  spy_above_ma20: boolean | null;
  spy_above_ma50: boolean | null;
  qqq_close: number | string | null;
  qqq_ma20: number | string | null;
  qqq_ma50: number | string | null;
  qqq_change_5d_percent: number | string | null;
  qqq_above_ma20: boolean | null;
  qqq_above_ma50: boolean | null;
};

type ScheduledScanRunRow = ScanLogRunRow;

type ScanQualitySummary = {
  totalScans: number;
  recommendationsCreated: number;
  noTradeScans: number;
  skippedScans: number;
  providerErrors: number;
  averageTopCandidateScore: number | null;
  latestScan: ScanLogEntry | null;
};

type Recommendation = {
  id: string;
  sessionType: SessionType;
  sessionLabel: string;
  ticker: string;
  companyName: string;
  direction: Direction;
  setupType: string;
  entryZone: string;
  entryLowValue: number | null;
  entryHighValue: number | null;
  stopLossValue: number | null;
  stopLoss: string;
  target1: string;
  target2: string;
  riskReward: string;
  confidence: string;
  confidenceScore: number | null;
  confidenceLabel: ConfidenceLabel | "Confidence unavailable";
  confidenceBreakdown: ConfidenceBreakdown | null;
  confidenceReasoning: string;
  riskFlags: string[];
  discardedAtRaw: string | null;
  discardReviewStatus: DiscardReviewStatus | null;
  discardReviewedAtRaw: string | null;
  discardOutcome: DiscardOutcome | null;
  discardTheoreticalR: number | null;
  discardDecisionQuality: DiscardDecisionQuality | null;
  discardMaxFavorableR: number | null;
  discardMaxAdverseR: number | null;
  discardReviewNotes: string[];
  timeframe: string;
  thesis: string;
  invalidation: string;
  reasonToAvoid: string;
  status: RecommendationStatus;
  archived: boolean;
  expiresAtRaw: string | null;
  scanWindow: string | null;
  createdAt: string;
  createdAtRaw: string | null;
};

type UserSettings = {
  portfolioSize: number | null;
  riskPerTradePercent: number | null;
};

type PositionSizing = {
  isAvailable: boolean;
  riskAmount: number | null;
  riskPerShare: number | null;
  suggestedShares: number | null;
  suggestedPositionValue: number | null;
  maxLossAtStop: number | null;
};

type ActivePosition = {
  id: string;
  ticker: string;
  companyName: string;
  direction: Direction;
  entryPrice: string;
  entryPriceValue: number | null;
  positionSize: string;
  positionSizeValue: number | null;
  stopLoss: string;
  stopLossValue: number | null;
  target1: string;
  target1Value: number | null;
  target2: string;
  target2Value: number | null;
  openedAt: string;
  openedAtRaw: string | null;
};

type ClosedPosition = ActivePosition & {
  setupType: string;
  exitPrice: string;
  pnl: string;
  pnlPercent: string;
  rMultiple: string;
  closedAt: string;
  exitNotes: string;
  pnlValue: number | null;
  rMultipleValue: number | null;
};

type PerformanceSummary = {
  totalPnl: number | null;
  totalClosedTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number | null;
  averageR: number | null;
  averageWin: number | null;
  averageLoss: number | null;
  bestTrade: number | null;
  worstTrade: number | null;
  profitFactor: number | "infinite" | null;
};

type SetupPerformanceSummary = {
  setupType: string;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number | null;
  totalPnl: number | null;
  totalR: number | null;
  averageR: number | null;
  bestTrade: number | null;
  worstTrade: number | null;
  profitFactor: PerformanceSummary["profitFactor"];
};

type DiscardReviewSummary = {
  reviewedDiscards: number;
  correctDiscards: number;
  missedWinners: number;
  missedOpportunities: number;
  averageTheoreticalR: number | null;
  discardAccuracy: number | null;
};

type LatestPositionUpdate = {
  positionId: string;
  action: string;
  recommendation: string;
  explanation: string;
  newStop: string;
  currentPrice: string;
  currentPriceValue: number | null;
  unrealizedR: string;
  unrealizedRValue: number | null;
  unrealizedPercent: string;
  unrealizedPercentValue: number | null;
  updatedAt: string;
};

type NotificationSoundType = "recommendation" | "position_update";

const tabs: Tab[] = ["Recommendations", "Live Day Trades", "History", "Market"];
const historyStatuses: RecommendationStatus[] = [
  "ignored",
  "discarded",
  "rejected",
  "watched",
  "taken",
];
const confidenceMetadataPrefix = "\n\n[confidence_meta:";
const discardMetadataPrefix = "\n\n[discard_meta:";

const text = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
};

const enableSoundAlerts = true;
// TODO: Persist enable_sound_alerts in user settings.

function playNotificationSound(type: NotificationSoundType) {
  if (typeof window === "undefined" || !enableSoundAlerts) {
    return;
  }

  try {
    const AudioContextConstructor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextConstructor) {
      return;
    }

    const audioContext = new AudioContextConstructor();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    const baseFrequency = type === "recommendation" ? 880 : 660;
    const peakGain = type === "recommendation" ? 0.045 : 0.035;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(baseFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(baseFrequency * 1.35, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
    oscillator.addEventListener("ended", () => {
      void audioContext.close().catch(() => undefined);
    });
  } catch {
    // Browsers can block audio until user interaction. Alerts should never crash UI.
  }
}

function money(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Not set";
  }

  return String(value);
}

function formatNumber(value: number | null | undefined, suffix = "") {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not available";
  }

  return `${value.toFixed(2)}${suffix}`;
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatShares(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPnl(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(2);
}

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}

function formatRMultiple(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(1)}R`;
}

function formatProfitFactor(value: PerformanceSummary["profitFactor"]) {
  if (value === null) {
    return "—";
  }

  if (value === "infinite") {
    return "∞";
  }

  return value.toFixed(2);
}

function marketRegimeLabel(value: MarketRegimeType) {
  if (value === "risk_on") {
    return "Risk On";
  }

  if (value === "risk_off") {
    return "Risk Off";
  }

  return "Neutral";
}

async function fetchMarketStatusForUi() {
  try {
    const response = await fetch("/api/market-calendar/status", {
      cache: "no-store",
    });
    const result = (await response.json().catch(() => null)) as {
      market_status?: MarketStatus;
      error?: string;
    } | null;

    if (!response.ok) {
      throw new Error(result?.error || "Could not load market calendar status.");
    }

    return {
      marketStatus: result?.market_status ?? null,
      error: "",
    };
  } catch (error) {
    console.error("[trade-app] market_status_error", error);

    return {
      marketStatus: null,
      error: "Market calendar status is unavailable right now.",
    };
  }
}

function getNewYorkTimeInMinutes() {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
    timeZone: "America/New_York",
  }).formatToParts(new Date());

  const valueByType = new Map(parts.map((part) => [part.type, part.value]));

  return (
    Number(valueByType.get("hour") ?? "0") * 60 +
    Number(valueByType.get("minute") ?? "0")
  );
}

function timeToMinutes(value: string | null) {
  const match = value?.match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function getTopMarketStatus(marketStatus: MarketStatus | null): TopMarketStatus {
  if (!marketStatus || marketStatus.dayType === "unknown") {
    return "unknown";
  }

  if (!marketStatus.isOpenDay) {
    return "closed_today";
  }

  const openMinutes = timeToMinutes(marketStatus.marketOpenTime) ?? 9 * 60 + 30;
  const closeMinutes = timeToMinutes(marketStatus.marketCloseTime) ?? 16 * 60;
  const nowMinutes = getNewYorkTimeInMinutes();

  return nowMinutes >= openMinutes && nowMinutes < closeMinutes ? "open" : "closed";
}

function topMarketStatusLabel(status: TopMarketStatus) {
  if (status === "open") {
    return "Currently open";
  }

  if (status === "closed") {
    return "Currently closed";
  }

  if (status === "closed_today") {
    return "Closed today";
  }

  return "Status unknown";
}

function topMarketStatusDotStyle(status: TopMarketStatus) {
  if (status === "open") {
    return { backgroundColor: "#00db94" };
  }

  if (status === "closed" || status === "closed_today") {
    return { backgroundColor: "color(display-p3 0.97 0.281 0.281)" };
  }

  return undefined;
}

function getMarketCloseWarning(
  marketStatus: MarketStatus | null,
  nowMinutes = getNewYorkTimeInMinutes(),
) {
  if (!marketStatus || marketStatus.dayType === "unknown") {
    return "";
  }

  if (!marketStatus.isOpenDay || getTopMarketStatus(marketStatus) !== "open") {
    return "Market is closed. Review this day trade.";
  }

  const warningStart = 15 * 60 + 30;
  const finalMinutesStart = 15 * 60 + 45;
  const closeMinutes = timeToMinutes(marketStatus.marketCloseTime) ?? 16 * 60;

  if (nowMinutes >= finalMinutesStart && nowMinutes < closeMinutes) {
    return "Final minutes. Day trades should usually be closed or actively managed.";
  }

  if (nowMinutes >= warningStart && nowMinutes < finalMinutesStart) {
    return "Market close approaching. Prepare exit plan.";
  }

  return "";
}

function marketTrendStatus(symbol: string, trend: MarketRegimeSymbol) {
  if (trend.close === 0 && trend.ma20 === 0 && trend.ma50 === 0) {
    return `${symbol}: unavailable`;
  }

  const ma20Status = trend.above_ma20 ? "above MA20" : "below MA20";
  const ma50Status = trend.above_ma50 ? "above MA50" : "below MA50";

  return `${symbol}: ${ma20Status}, ${ma50Status}, 5D ${formatNumber(
    trend.change_5d_percent,
    "%",
  )}`;
}

function marketRegimeType(value: string | null | undefined): MarketRegimeType {
  if (value === "risk_on" || value === "risk_off") {
    return value;
  }

  return "neutral";
}

function toMarketRegimeSymbol(
  close: number | string | null,
  ma20: number | string | null,
  ma50: number | string | null,
  change5dPercent: number | string | null,
  aboveMa20: boolean | null,
  aboveMa50: boolean | null,
): MarketRegimeSymbol {
  return {
    close: parseNumber(close) ?? 0,
    ma20: parseNumber(ma20) ?? 0,
    ma50: parseNumber(ma50) ?? 0,
    change_5d_percent: parseNumber(change5dPercent) ?? 0,
    above_ma20: aboveMa20 ?? false,
    above_ma50: aboveMa50 ?? false,
  };
}

function toMarketRegime(row: MarketRegimeSnapshotRow | null): MarketRegime | null {
  if (!row) {
    return null;
  }

  return {
    regime: marketRegimeType(row.regime),
    summary: text(row.summary),
    spy: toMarketRegimeSymbol(
      row.spy_close,
      row.spy_ma20,
      row.spy_ma50,
      row.spy_change_5d_percent,
      row.spy_above_ma20,
      row.spy_above_ma50,
    ),
    qqq: toMarketRegimeSymbol(
      row.qqq_close,
      row.qqq_ma20,
      row.qqq_ma50,
      row.qqq_change_5d_percent,
      row.qqq_above_ma20,
      row.qqq_above_ma50,
    ),
  };
}

function setupTypeFromPosition(row: PositionRow) {
  return text(row.recommendations?.setup_type, "Unknown setup") || "Unknown setup";
}

function parseNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function clampConfidenceScore(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

function confidenceLabelFromScore(score: number): ConfidenceLabel {
  if (score >= 85) {
    return "HIGH CONVICTION";
  }

  if (score >= 70) {
    return "GOOD SETUP";
  }

  return "LOWER CONFIDENCE";
}

function inferConfidenceScore(
  confidence: string | null | undefined,
  riskReward: string | null | undefined,
) {
  const explicitScore = parseNumber(confidence);

  if (explicitScore !== null) {
    return clampConfidenceScore(explicitScore);
  }

  const normalizedConfidence = confidence?.trim().toLowerCase();
  const baseScore =
    normalizedConfidence === "high"
      ? 86
      : normalizedConfidence === "medium"
        ? 74
        : normalizedConfidence === "low"
          ? 58
          : null;

  if (baseScore === null) {
    return null;
  }

  const rr = parseNumber(riskReward);
  const rrAdjustment = rr === null ? 0 : rr >= 2 ? 2 : rr < 1.5 ? -4 : 0;

  return clampConfidenceScore(baseScore + rrAdjustment);
}

function parseConfidenceLabel(
  value: string | null | undefined,
  score: number | null,
): ConfidenceLabel | "Confidence unavailable" {
  if (
    value === "HIGH CONVICTION" ||
    value === "GOOD SETUP" ||
    value === "LOWER CONFIDENCE"
  ) {
    return value;
  }

  return score === null ? "Confidence unavailable" : confidenceLabelFromScore(score);
}

function parseConfidenceBreakdown(
  value: ConfidenceBreakdown | string | null | undefined,
) {
  const parsed =
    typeof value === "string" && value.trim()
      ? (() => {
          try {
            return JSON.parse(value) as unknown;
          } catch {
            return null;
          }
        })()
      : value;

  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }

  const candidate = parsed as Record<keyof ConfidenceBreakdown, unknown>;
  const breakdown = {
    setup_quality: parseNumber(candidate.setup_quality),
    momentum_confirmation: parseNumber(candidate.momentum_confirmation),
    volume_confirmation: parseNumber(candidate.volume_confirmation),
    risk_reward_quality: parseNumber(candidate.risk_reward_quality),
    market_regime_alignment: parseNumber(candidate.market_regime_alignment),
    timing_quality: parseNumber(candidate.timing_quality),
  };

  if (Object.values(breakdown).some((score) => score === null)) {
    return null;
  }

  return {
    setup_quality: clampConfidenceScore(breakdown.setup_quality ?? 0),
    momentum_confirmation: clampConfidenceScore(
      breakdown.momentum_confirmation ?? 0,
    ),
    volume_confirmation: clampConfidenceScore(breakdown.volume_confirmation ?? 0),
    risk_reward_quality: clampConfidenceScore(breakdown.risk_reward_quality ?? 0),
    market_regime_alignment: clampConfidenceScore(
      breakdown.market_regime_alignment ?? 0,
    ),
    timing_quality: clampConfidenceScore(breakdown.timing_quality ?? 0),
  };
}

function parseRiskFlags(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.trim());
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === "string" && item.trim());
    }
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function parseDiscardReviewStatus(
  value: DiscardReviewStatus | string | null | undefined,
): DiscardReviewStatus | null {
  if (
    value === "pending" ||
    value === "reviewed" ||
    value === "skipped" ||
    value === "error"
  ) {
    return value;
  }

  return null;
}

function parseDiscardOutcome(
  value: DiscardOutcome | string | null | undefined,
): DiscardOutcome | null {
  if (
    value === "entry_not_triggered" ||
    value === "target_hit" ||
    value === "stop_hit" ||
    value === "partial_move" ||
    value === "sideways" ||
    value === "unknown"
  ) {
    return value;
  }

  return null;
}

function parseDiscardDecisionQuality(
  value: DiscardDecisionQuality | string | null | undefined,
): DiscardDecisionQuality | null {
  if (
    value === "correct_discard" ||
    value === "missed_winner" ||
    value === "missed_opportunity" ||
    value === "neutral" ||
    value === "unknown"
  ) {
    return value;
  }

  return null;
}

function getInlineMetadataEnd(value: string, markerIndex: number) {
  const nextConfidenceMarker = value.indexOf(
    confidenceMetadataPrefix,
    markerIndex + 1,
  );
  const nextDiscardMarker = value.indexOf(discardMetadataPrefix, markerIndex + 1);
  const nextMarkerIndexes = [nextConfidenceMarker, nextDiscardMarker].filter(
    (index) => index !== -1,
  );

  return nextMarkerIndexes.length > 0 ? Math.min(...nextMarkerIndexes) : value.length;
}

function parseInlineMetadata(value: string, prefix: string) {
  const markerIndex = value.lastIndexOf(prefix);

  if (markerIndex === -1) {
    return null;
  }

  const metadataEnd = getInlineMetadataEnd(value, markerIndex);
  const metadataText = value
    .slice(markerIndex + prefix.length, metadataEnd)
    .trim();
  const jsonText = metadataText.endsWith("]")
    ? metadataText.slice(0, -1)
    : metadataText;

  try {
    return JSON.parse(jsonText) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function stripInlineMetadata(value: string) {
  const metadataStarts = [
    value.indexOf(confidenceMetadataPrefix),
    value.indexOf(discardMetadataPrefix),
  ].filter((index) => index !== -1);

  if (metadataStarts.length === 0) {
    return value;
  }

  return value.slice(0, Math.min(...metadataStarts)).trim();
}

function parseConfidenceMetadata(reasonToAvoid: string) {
  const parsed = parseInlineMetadata(reasonToAvoid, confidenceMetadataPrefix);
  const score = parseNumber(parsed?.confidence_score);

  return {
    reasonToAvoid: stripInlineMetadata(reasonToAvoid),
    confidenceScore: score === null ? null : clampConfidenceScore(score),
    confidenceLabel:
      typeof parsed?.confidence_label === "string"
        ? parsed.confidence_label
        : null,
    confidenceBreakdown: parseConfidenceBreakdown(
      parsed?.confidence_breakdown as ConfidenceBreakdown | string | null,
    ),
    confidenceReasoning:
      typeof parsed?.confidence_reasoning === "string"
        ? parsed.confidence_reasoning.trim()
        : "",
    riskFlags: parseRiskFlags(parsed?.risk_flags as string[] | string | null),
  };
}

function parseDiscardMetadata(reasonToAvoid: string) {
  const parsed = parseInlineMetadata(reasonToAvoid, discardMetadataPrefix);

  return {
    discardedAt:
      typeof parsed?.discarded_at === "string" ? parsed.discarded_at : null,
    discardReviewStatus: parseDiscardReviewStatus(
      parsed?.discard_review_status as string | null,
    ),
    discardReviewedAt:
      typeof parsed?.discard_reviewed_at === "string"
        ? parsed.discard_reviewed_at
        : null,
    discardOutcome: parseDiscardOutcome(parsed?.discard_outcome as string | null),
    discardTheoreticalR: parseNumber(parsed?.discard_theoretical_r),
    maxFavorableR: parseNumber(parsed?.max_favorable_r),
    maxAdverseR: parseNumber(parsed?.max_adverse_r),
    reviewNotes: Array.isArray(parsed?.review_notes)
      ? parsed.review_notes.filter((item): item is string => typeof item === "string")
      : [],
    discardDecisionQuality: parseDiscardDecisionQuality(
      parsed?.discard_decision_quality as string | null,
    ),
  };
}

function buildConfidenceMetadata(recommendation: Recommendation) {
  if (recommendation.confidenceScore === null) {
    return "";
  }

  return `${confidenceMetadataPrefix}${JSON.stringify({
    confidence_score: recommendation.confidenceScore,
    confidence_label:
      recommendation.confidenceLabel === "Confidence unavailable"
        ? confidenceLabelFromScore(recommendation.confidenceScore)
        : recommendation.confidenceLabel,
    confidence_breakdown: recommendation.confidenceBreakdown,
    confidence_reasoning: recommendation.confidenceReasoning,
    risk_flags: recommendation.riskFlags,
  })}]`;
}

function buildDiscardMetadata(discardedAt: string) {
  return `${discardMetadataPrefix}${JSON.stringify({
    discarded_at: discardedAt,
    discard_review_status: "pending",
    discard_reviewed_at: null,
    discard_outcome: null,
    discard_theoretical_r: null,
    discard_decision_quality: null,
    archived_reason: "user_discarded",
  })}]`;
}

function direction(value: string | null | undefined): Direction {
  return value?.toLowerCase() === "short" ? "Short" : "Long";
}

function status(value: string | null | undefined): RecommendationStatus {
  if (
    value === "watched" ||
    value === "ignored" ||
    value === "discarded" ||
    value === "rejected" ||
    value === "taken"
  ) {
    return value;
  }

  return "new";
}

function recommendationStatusLabel(value: RecommendationStatus) {
  if (value === "taken") {
    return "added trade";
  }

  if (
    value === "ignored" ||
    value === "discarded" ||
    value === "rejected" ||
    value === "watched"
  ) {
    return "discarded";
  }

  return "current";
}

function positionActionLabel(value: string) {
  if (value === "MOVE_STOP_TO_BREAKEVEN") return "MOVE STOP TO BREAKEVEN";
  if (value === "TAKE_PARTIAL_PROFIT") return "TAKE PARTIAL PROFIT";
  if (value === "TAKE_PROFIT") return "TAKE PROFIT";
  if (value === "CLOSE_POSITION") return "CLOSE POSITION";
  return value || "HOLD";
}

function positionActionClassName(value: string) {
  if (value === "CLOSE_POSITION") {
    return "border-rose-300/40 bg-rose-300/15 text-rose-100";
  }

  if (value === "TAKE_PROFIT" || value === "TAKE_PARTIAL_PROFIT") {
    return "border-emerald-300/35 bg-emerald-300/10 text-emerald-100";
  }

  if (value === "MOVE_STOP_TO_BREAKEVEN") {
    return "border-cyan-300/35 bg-cyan-300/10 text-cyan-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-300";
}

function sessionType(value: string | null | undefined): SessionType {
  return value === "midday" ? "midday" : "morning";
}

function sessionLabel(value: SessionType) {
  return value === "midday" ? "Later session" : "Early session";
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTimeInTrade(value: string | null) {
  if (!value) {
    return "—";
  }

  const openedAt = new Date(value).getTime();

  if (!Number.isFinite(openedAt)) {
    return "—";
  }

  const minutes = Math.max(0, Math.floor((Date.now() - openedAt) / 60000));

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
}

function formatRecommendationTimeframe(value: string | null | undefined) {
  return text(value) === "day_trade" ? "Intraday / day trade" : text(value);
}

function formatEntryZone(
  entryLow: number | string | null | undefined,
  entryHigh: number | string | null | undefined,
) {
  const low = money(entryLow);
  const high = money(entryHigh);

  if (low === "Not set" && high === "Not set") {
    return "Not set";
  }

  if (low === "Not set") {
    return high;
  }

  if (high === "Not set") {
    return low;
  }

  return `${low} - ${high}`;
}

function toUserSettings(row: UserSettingsRow | null): UserSettings | null {
  if (!row) {
    return null;
  }

  return {
    portfolioSize: parseNumber(row.portfolio_size),
    riskPerTradePercent: parseNumber(row.risk_per_trade_percent),
  };
}

function calculatePositionSizing(
  recommendation: Recommendation,
  userSettings: UserSettings | null,
): PositionSizing {
  const unavailableSizing = {
    isAvailable: false,
    riskAmount: null,
    riskPerShare: null,
    suggestedShares: null,
    suggestedPositionValue: null,
    maxLossAtStop: null,
  };

  if (
    !userSettings ||
    userSettings.portfolioSize === null ||
    userSettings.riskPerTradePercent === null ||
    recommendation.entryLowValue === null ||
    recommendation.entryHighValue === null ||
    recommendation.stopLossValue === null
  ) {
    return unavailableSizing;
  }

  const riskAmount =
    userSettings.portfolioSize * (userSettings.riskPerTradePercent / 100);
  const entryMidpoint =
    (recommendation.entryLowValue + recommendation.entryHighValue) / 2;
  const riskPerShare = entryMidpoint - recommendation.stopLossValue;

  if (riskPerShare <= 0 || !Number.isFinite(riskPerShare)) {
    return unavailableSizing;
  }

  const suggestedShares = Math.floor(riskAmount / riskPerShare);
  const suggestedPositionValue = suggestedShares * entryMidpoint;
  const maxLossAtStop = suggestedShares * riskPerShare;

  return {
    isAvailable: true,
    riskAmount,
    riskPerShare,
    suggestedShares,
    suggestedPositionValue,
    maxLossAtStop,
  };
}

function calculateCurrentR({
  entryPrice,
  stopLoss,
  currentPrice,
  direction,
}: {
  entryPrice: number | null;
  stopLoss: number | null;
  currentPrice: number | null;
  direction: Direction;
}) {
  if (entryPrice === null || stopLoss === null || currentPrice === null) {
    return null;
  }

  const riskPerShare =
    direction === "Short" ? stopLoss - entryPrice : entryPrice - stopLoss;
  const currentRewardPerShare =
    direction === "Short" ? entryPrice - currentPrice : currentPrice - entryPrice;

  if (riskPerShare <= 0 || !Number.isFinite(riskPerShare)) {
    return null;
  }

  return currentRewardPerShare / riskPerShare;
}

function calculateUnrealizedPnl({
  entryPrice,
  currentPrice,
  shares,
  direction,
}: {
  entryPrice: number | null;
  currentPrice: number | null;
  shares: number | null;
  direction: Direction;
}) {
  if (entryPrice === null || currentPrice === null) {
    return {
      pnl: null,
      percent: null,
    };
  }

  const priceMove =
    direction === "Short" ? entryPrice - currentPrice : currentPrice - entryPrice;
  const percent = entryPrice !== 0 ? (priceMove / entryPrice) * 100 : null;

  return {
    pnl: shares === null ? null : priceMove * shares,
    percent,
  };
}

function formatSignedCurrency(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  const formatted = formatCurrency(Math.abs(value));
  return `${value >= 0 ? "+" : "-"}${formatted}`;
}

function formatSignedPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatSignedR(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}R`;
}

function toRecommendation(row: RecommendationRow): Recommendation {
  const entryLowValue = parseNumber(row.entry_low);
  const entryHighValue = parseNumber(row.entry_high);
  const stopLossValue = parseNumber(row.stop_loss);
  const recommendationSessionType = sessionType(row.session_type);
  const rawReasonToAvoid = text(row.reason_to_avoid);
  const confidenceMetadata = parseConfidenceMetadata(rawReasonToAvoid);
  const discardMetadata = parseDiscardMetadata(rawReasonToAvoid);
  const explicitConfidenceScore = parseNumber(row.confidence_score);
  const confidenceScore =
    explicitConfidenceScore === null
      ? confidenceMetadata.confidenceScore ??
        inferConfidenceScore(row.confidence, row.risk_reward)
      : clampConfidenceScore(explicitConfidenceScore);
  const confidenceBreakdown =
    parseConfidenceBreakdown(row.confidence_breakdown) ??
    confidenceMetadata.confidenceBreakdown;

  return {
    id: row.id,
    sessionType: recommendationSessionType,
    sessionLabel: sessionLabel(recommendationSessionType),
    ticker: row.ticker,
    companyName: text(row.company_name),
    direction: direction(row.direction),
    setupType: text(row.setup_type),
    entryZone: formatEntryZone(row.entry_low, row.entry_high),
    entryLowValue,
    entryHighValue,
    stopLossValue,
    stopLoss: text(row.stop_loss),
    target1: text(row.target_1),
    target2: text(row.target_2),
    riskReward: text(row.risk_reward),
    confidence: text(row.confidence),
    confidenceScore,
    confidenceLabel: parseConfidenceLabel(
      row.confidence_label ?? confidenceMetadata.confidenceLabel,
      confidenceScore,
    ),
    confidenceBreakdown,
    confidenceReasoning:
      text(row.confidence_reasoning) || confidenceMetadata.confidenceReasoning,
    riskFlags: parseRiskFlags(row.risk_flags).length
      ? parseRiskFlags(row.risk_flags)
      : confidenceMetadata.riskFlags,
    discardedAtRaw: row.discarded_at ?? discardMetadata.discardedAt,
    discardReviewStatus:
      parseDiscardReviewStatus(row.discard_review_status) ??
      discardMetadata.discardReviewStatus,
    discardReviewedAtRaw:
      row.discard_reviewed_at ?? discardMetadata.discardReviewedAt,
    discardOutcome:
      parseDiscardOutcome(row.discard_outcome) ?? discardMetadata.discardOutcome,
    discardTheoreticalR:
      parseNumber(row.discard_theoretical_r) ??
      discardMetadata.discardTheoreticalR,
    discardDecisionQuality:
      parseDiscardDecisionQuality(row.discard_decision_quality) ??
      discardMetadata.discardDecisionQuality,
    discardMaxFavorableR: discardMetadata.maxFavorableR,
    discardMaxAdverseR: discardMetadata.maxAdverseR,
    discardReviewNotes: discardMetadata.reviewNotes,
    timeframe: formatRecommendationTimeframe(row.timeframe),
    thesis: text(row.thesis),
    invalidation: text(row.invalidation),
    reasonToAvoid: confidenceMetadata.reasonToAvoid,
    status: status(row.status),
    archived: row.archived === true,
    expiresAtRaw: row.expires_at ?? null,
    scanWindow: row.scan_window ?? null,
    createdAt: formatDate(row.created_at),
    createdAtRaw: row.created_at ?? null,
  };
}

function toFreshnessInput(recommendation: Recommendation) {
  return {
    created_at: recommendation.createdAtRaw,
    expires_at: recommendation.expiresAtRaw,
    scan_window: recommendation.scanWindow,
  };
}

function toActivePosition(row: PositionRow): ActivePosition {
  const entryPriceValue = parseNumber(row.entry_price);
  const positionSizeValue = parseNumber(row.position_size);
  const stopLossValue = parseNumber(row.current_stop);
  const target1Value = parseNumber(row.target_1);
  const target2Value = parseNumber(row.target_2);

  return {
    id: row.id,
    ticker: row.ticker,
    companyName: text(row.company_name),
    direction: direction(row.direction),
    entryPrice: money(row.entry_price),
    entryPriceValue,
    positionSize: formatShares(positionSizeValue),
    positionSizeValue,
    stopLoss: text(row.current_stop),
    stopLossValue,
    target1: text(row.target_1),
    target1Value,
    target2: text(row.target_2),
    target2Value,
    openedAt: formatDate(row.created_at),
    openedAtRaw: row.created_at ?? null,
  };
}

function toClosedPosition(row: PositionRow): ClosedPosition {
  const pnlValue = parseNumber(row.pnl);
  const pnlPercentValue = parseNumber(row.pnl_percent);
  const rMultipleValue = parseNumber(row.r_multiple);

  return {
    ...toActivePosition(row),
    setupType: setupTypeFromPosition(row),
    exitPrice: money(row.exit_price),
    pnl: formatPnl(pnlValue),
    pnlPercent: formatPercent(pnlPercentValue),
    rMultiple: formatRMultiple(rMultipleValue),
    closedAt: formatDate(row.closed_at),
    exitNotes: text(row.exit_notes),
    pnlValue,
    rMultipleValue,
  };
}

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function calculatePerformanceSummary(
  closedPositions: ClosedPosition[],
): PerformanceSummary {
  const pnlValues = closedPositions
    .map((position) => position.pnlValue)
    .filter((value): value is number => value !== null);
  const rValues = closedPositions
    .map((position) => position.rMultipleValue)
    .filter((value): value is number => value !== null);
  const wins = pnlValues.filter((value) => value > 0);
  const losses = pnlValues.filter((value) => value < 0);
  const totalPnl =
    pnlValues.length > 0 ? pnlValues.reduce((sum, value) => sum + value, 0) : null;
  const grossWin = wins.reduce((sum, value) => sum + value, 0);
  const grossLoss = Math.abs(losses.reduce((sum, value) => sum + value, 0));

  let profitFactor: PerformanceSummary["profitFactor"] = null;

  if (grossLoss > 0) {
    profitFactor = grossWin / grossLoss;
  } else if (grossWin > 0) {
    profitFactor = "infinite";
  }

  return {
    totalPnl,
    totalClosedTrades: closedPositions.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    winRate:
      closedPositions.length > 0
        ? (wins.length / closedPositions.length) * 100
        : null,
    averageR: average(rValues),
    averageWin: average(wins),
    averageLoss: average(losses),
    bestTrade: pnlValues.length > 0 ? Math.max(...pnlValues) : null,
    worstTrade: pnlValues.length > 0 ? Math.min(...pnlValues) : null,
    profitFactor,
  };
}

function calculateSetupPerformance(
  closedPositions: ClosedPosition[],
): SetupPerformanceSummary[] {
  const positionsBySetup: Record<string, ClosedPosition[]> = {};

  for (const position of closedPositions) {
    const setupType = position.setupType || "Unknown setup";
    positionsBySetup[setupType] = positionsBySetup[setupType] || [];
    positionsBySetup[setupType].push(position);
  }

  return Object.entries(positionsBySetup)
    .map(([setupType, positions]) => {
      const pnlValues = positions
        .map((position) => position.pnlValue)
        .filter((value): value is number => value !== null);
      const rValues = positions
        .map((position) => position.rMultipleValue)
        .filter((value): value is number => value !== null);
      const wins = pnlValues.filter((value) => value > 0);
      const losses = pnlValues.filter((value) => value < 0);
      const totalPnl =
        pnlValues.length > 0
          ? pnlValues.reduce((sum, value) => sum + value, 0)
          : null;
      const totalR =
        rValues.length > 0 ? rValues.reduce((sum, value) => sum + value, 0) : null;
      const grossWin = wins.reduce((sum, value) => sum + value, 0);
      const grossLoss = Math.abs(losses.reduce((sum, value) => sum + value, 0));

      let profitFactor: PerformanceSummary["profitFactor"] = null;

      if (grossLoss > 0) {
        profitFactor = grossWin / grossLoss;
      } else if (grossWin > 0) {
        profitFactor = "infinite";
      }

      return {
        setupType,
        closedTrades: positions.length,
        winningTrades: wins.length,
        losingTrades: losses.length,
        winRate: positions.length > 0 ? (wins.length / positions.length) * 100 : null,
        totalPnl,
        totalR,
        averageR: average(rValues),
        bestTrade: rValues.length > 0 ? Math.max(...rValues) : null,
        worstTrade: rValues.length > 0 ? Math.min(...rValues) : null,
        profitFactor,
      };
    })
    .sort((first, second) => (second.totalR ?? -Infinity) - (first.totalR ?? -Infinity));
}

function isUserDiscardedRecommendation(recommendation: Recommendation) {
  return (
    recommendation.status === "ignored" ||
    recommendation.status === "discarded" ||
    recommendation.status === "rejected"
  );
}

function getDiscardedSetupsForHistory(recommendations: Recommendation[]) {
  return recommendations
    .filter(isUserDiscardedRecommendation)
    .sort(
      (first, second) =>
        new Date(second.discardedAtRaw ?? second.createdAtRaw ?? 0).getTime() -
        new Date(first.discardedAtRaw ?? first.createdAtRaw ?? 0).getTime(),
    )
    .slice(0, 50);
}

function calculateDiscardReviewSummary(
  discardedSetups: Recommendation[],
): DiscardReviewSummary {
  const reviewedSetups = discardedSetups.filter(
    (setup) => setup.discardReviewStatus === "reviewed",
  );
  const theoreticalRValues = reviewedSetups
    .map((setup) => setup.discardTheoreticalR)
    .filter((value): value is number => value !== null);
  const correctDiscards = reviewedSetups.filter(
    (setup) => setup.discardDecisionQuality === "correct_discard",
  ).length;

  return {
    reviewedDiscards: reviewedSetups.length,
    correctDiscards,
    missedWinners: reviewedSetups.filter(
      (setup) => setup.discardDecisionQuality === "missed_winner",
    ).length,
    missedOpportunities: reviewedSetups.filter(
      (setup) => setup.discardDecisionQuality === "missed_opportunity",
    ).length,
    averageTheoreticalR: average(theoreticalRValues),
    discardAccuracy:
      reviewedSetups.length > 0
        ? (correctDiscards / reviewedSetups.length) * 100
        : null,
  };
}

function isSkippedScanResult(result: ScanLogResult) {
  return (
    result === "market_closed" ||
    result === "pre_market" ||
    result === "power_hour_blocked" ||
    result === "recommendation_limit_reached" ||
    result === "duplicate_ticker_skipped" ||
    result === "active_position_exists" ||
    result === "skipped"
  );
}

function calculateScanQualitySummary(scanLogs: ScanLogEntry[]): ScanQualitySummary {
  const scoreValues = scanLogs
    .map((log) => log.top_candidate_score ?? null)
    .filter((value): value is number => value !== null);

  return {
    totalScans: scanLogs.length,
    recommendationsCreated: scanLogs.reduce(
      (sum, log) => sum + log.recommendations_created,
      0,
    ),
    noTradeScans: scanLogs.filter((log) => log.result === "no_high_quality_setup")
      .length,
    skippedScans: scanLogs.filter((log) => isSkippedScanResult(log.result)).length,
    providerErrors: scanLogs.filter(
      (log) =>
        log.result === "provider_error" || log.result === "provider_rate_limited",
    ).length,
    averageTopCandidateScore: average(scoreValues),
    latestScan: scanLogs[0] ?? null,
  };
}

function toLatestPositionUpdate(row: PositionUpdateRow): LatestPositionUpdate {
  return {
    positionId: row.position_id,
    action: text(row.action, "HOLD"),
    recommendation: text(row.recommendation),
    explanation: text(row.explanation),
    newStop: money(row.new_stop),
    currentPrice: "Not available",
    currentPriceValue: null,
    unrealizedR: "Not available",
    unrealizedRValue: null,
    unrealizedPercent: "Not available",
    unrealizedPercentValue: null,
    updatedAt: formatDate(row.created_at),
  };
}

function updateResultToLatestPositionUpdate(
  update: PositionUpdateResult,
): LatestPositionUpdate {
  return {
    positionId: update.position_id,
    action: update.action,
    recommendation: update.recommendation,
    explanation: update.explanation,
    newStop: money(update.new_stop),
    currentPrice: formatNumber(update.current_price),
    currentPriceValue: update.current_price,
    unrealizedR: formatNumber(update.unrealized_r_multiple, "R"),
    unrealizedRValue: update.unrealized_r_multiple,
    unrealizedPercent: formatPercent(update.unrealized_percent),
    unrealizedPercentValue: update.unrealized_percent,
    updatedAt: "Just now",
  };
}

export function TradeApp() {
  const [activeTab, setActiveTab] = useState<Tab>("Recommendations");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [activePositions, setActivePositions] = useState<ActivePosition[]>([]);
  const [closedPositions, setClosedPositions] = useState<ClosedPosition[]>([]);
  const [latestPositionUpdates, setLatestPositionUpdates] = useState<
    Record<string, LatestPositionUpdate>
  >({});
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<Recommendation | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<ActivePosition | null>(
    null,
  );
  const [entryPrice, setEntryPrice] = useState("");
  const [positionSize, setPositionSize] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [exitNotes, setExitNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [generatingSessionType, setGeneratingSessionType] =
    useState<SessionType | null>(null);
  const [isUpdatingPositions, setIsUpdatingPositions] = useState(false);
  const [message, setMessage] = useState("");
  const [scanLogs, setScanLogs] = useState<ScanLogEntry[]>([]);
  const [marketRegime, setMarketRegime] = useState<MarketRegime | null>(null);
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [marketStatusError, setMarketStatusError] = useState("");
  const hasLoadedRecommendationsRef = useRef(false);
  const previousRecommendationIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedPositionUpdatesRef = useRef(false);
  const previousPositionUpdateSignaturesRef = useRef<Record<string, string>>({});

  async function loadTradeData() {
    await Promise.resolve();

    setIsLoading(true);
    setMessage("");

    const [
      recommendationsResult,
      userSettingsResult,
      positionsResult,
      closedPositionsResult,
      positionUpdatesResult,
      scanLogsResult,
      marketRegimeResult,
      marketStatusResult,
    ] =
      await Promise.all([
        supabase.from("recommendations").select("*"),
        supabase
          .from("user_settings")
          .select("portfolio_size, risk_per_trade_percent")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle(),
        supabase.from("positions").select("*").eq("status", "open"),
        supabase
          .from("positions")
          .select("*, recommendations(setup_type)")
          .eq("status", "closed")
          .order("closed_at", { ascending: false }),
        supabase
          .from("position_updates")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("scheduled_scan_runs")
          .select(
            "id,created_at,scan_date,session_type,status,recommendations_created,message",
          )
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("market_regime_snapshots")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        fetchMarketStatusForUi(),
      ]);

    if (recommendationsResult.error) {
      setMessage(recommendationsResult.error.message);
    } else {
      setRecommendations(
        (recommendationsResult.data as RecommendationRow[]).map(toRecommendation),
      );
    }

    if (userSettingsResult.error) {
      setMessage(userSettingsResult.error.message);
      setUserSettings(null);
    } else {
      setUserSettings(toUserSettings(userSettingsResult.data as UserSettingsRow | null));
    }

    if (positionsResult.error) {
      setMessage(positionsResult.error.message);
    } else {
      setActivePositions((positionsResult.data as PositionRow[]).map(toActivePosition));
    }

    if (closedPositionsResult.error) {
      setMessage(closedPositionsResult.error.message);
    } else {
      setClosedPositions(
        (closedPositionsResult.data as PositionRow[]).map(toClosedPosition),
      );
    }

    if (positionUpdatesResult.error) {
      setMessage(positionUpdatesResult.error.message);
    } else {
      const updatesByPosition: Record<string, LatestPositionUpdate> = {};

      for (const update of positionUpdatesResult.data as PositionUpdateRow[]) {
        if (!updatesByPosition[update.position_id]) {
          updatesByPosition[update.position_id] = toLatestPositionUpdate(update);
        }
      }

      setLatestPositionUpdates(updatesByPosition);
    }

    if (scanLogsResult.error) {
      console.error(scanLogsResult.error);
      setScanLogs([]);
    } else {
      setScanLogs(
        ((scanLogsResult.data ?? []) as ScheduledScanRunRow[]).map(
          parseScanLogFromMessage,
        ),
      );
    }

    if (marketRegimeResult.error) {
      setMessage(marketRegimeResult.error.message);
      setMarketRegime(null);
    } else {
      setMarketRegime(
        toMarketRegime(marketRegimeResult.data as MarketRegimeSnapshotRow | null),
      );
    }

    setMarketStatus(marketStatusResult.marketStatus);
    setMarketStatusError(marketStatusResult.error);

    setIsLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadTradeData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const nextIds = new Set(recommendations.map((recommendation) => recommendation.id));

    if (!hasLoadedRecommendationsRef.current) {
      previousRecommendationIdsRef.current = nextIds;
      hasLoadedRecommendationsRef.current = true;
      return;
    }

    const hasNewRecommendation = recommendations.some(
      (recommendation) =>
        !previousRecommendationIdsRef.current.has(recommendation.id),
    );

    previousRecommendationIdsRef.current = nextIds;

    if (hasNewRecommendation) {
      playNotificationSound("recommendation");
    }
  }, [isLoading, recommendations]);

  useEffect(() => {
    if (isLoading || isUpdatingPositions) {
      return;
    }

    const nextSignatures = Object.fromEntries(
      Object.entries(latestPositionUpdates).map(([positionId, update]) => [
        positionId,
        [
          update.action,
          update.recommendation,
          update.explanation,
          update.newStop,
          update.updatedAt,
        ].join("|"),
      ]),
    );

    if (!hasLoadedPositionUpdatesRef.current) {
      previousPositionUpdateSignaturesRef.current = nextSignatures;
      hasLoadedPositionUpdatesRef.current = true;
      return;
    }

    const hasNewPositionUpdate = Object.entries(nextSignatures).some(
      ([positionId, signature]) =>
        previousPositionUpdateSignaturesRef.current[positionId] !== signature,
    );

    previousPositionUpdateSignaturesRef.current = nextSignatures;

    if (hasNewPositionUpdate) {
      playNotificationSound("position_update");
    }
  }, [isLoading, isUpdatingPositions, latestPositionUpdates]);

  async function updateRecommendationStatus(
    recommendation: Recommendation,
    newStatus: RecommendationStatus,
  ) {
    setIsSaving(true);
    setMessage("");

    const isUserDiscard = newStatus === "ignored";
    const discardedAt = new Date().toISOString();
    const updatePayload = isUserDiscard
      ? {
          // Existing status value used as user-discarded setup.
          status: newStatus,
          archived: true,
          reason_to_avoid: `${recommendation.reasonToAvoid}${buildConfidenceMetadata(
            recommendation,
          )}${buildDiscardMetadata(discardedAt)}`,
        }
      : { status: newStatus };

    // TODO: Add discard review metadata fields or metadata JSON column.
    const { error } = await supabase
      .from("recommendations")
      .update(updatePayload)
      .eq("id", recommendation.id);

    if (error) {
      setMessage(error.message);
      setIsSaving(false);
      return;
    }

    setRecommendations((currentRecommendations) =>
      currentRecommendations.map((item) =>
        item.id === recommendation.id
          ? {
              ...item,
              status: newStatus,
              archived: isUserDiscard ? true : item.archived,
              discardedAtRaw: isUserDiscard ? discardedAt : item.discardedAtRaw,
              discardReviewStatus: isUserDiscard
                ? "pending"
                : item.discardReviewStatus,
              discardReviewedAtRaw: isUserDiscard
                ? null
                : item.discardReviewedAtRaw,
              discardOutcome: isUserDiscard ? null : item.discardOutcome,
              discardTheoreticalR: isUserDiscard
                ? null
                : item.discardTheoreticalR,
              discardDecisionQuality: isUserDiscard
                ? null
                : item.discardDecisionQuality,
            }
          : item,
      ),
    );
    setIsSaving(false);
  }

  async function generateRecommendations(scanWindowToGenerate: IntradayScanWindow) {
    const sessionTypeToGenerate =
      getLegacySessionTypeForScanWindow(scanWindowToGenerate);

    setGeneratingSessionType(sessionTypeToGenerate);
    setMessage("");

    try {
      const response = await fetch("/api/recommendations/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_type: sessionTypeToGenerate,
          scan_window: scanWindowToGenerate,
          target_count: 1,
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | GenerateRecommendationsResult
        | null;

      if (!response.ok) {
        if (result?.market_status) {
          setMarketStatus(result.market_status);
        }

        throw new Error(result?.error || "Request failed");
      }

      await loadTradeData();

      if (result?.market_regime) {
        setMarketRegime(result.market_regime);
      }

      if (result?.market_status) {
        setMarketStatus(result.market_status);
        setMarketStatusError("");
      }

      const insertedCount =
        typeof result?.inserted_count === "number"
          ? result.inserted_count
          : result?.recommendations?.length;

      if (result?.message) {
        setMessage(result.message);
      } else if (result?.duplicate_fallback_used) {
        setMessage(
          "No fresh tickers were available, so Trade allowed repeat candidates for this scan.",
        );
      } else if (insertedCount !== undefined) {
        setMessage(`Inserted ${insertedCount} recommendations.`);
      }
    } catch (error) {
      const fallbackMessage =
        "Sorry, Trade could not generate more recommendations right now. Please try again.";

      setMessage(
        error instanceof Error && error.message
          ? error.message
          : fallbackMessage,
      );
    } finally {
      setGeneratingSessionType(null);
    }
  }

  async function updatePositions() {
    setIsUpdatingPositions(true);
    setMessage("");

    try {
      const response = await fetch("/api/positions/update", {
        method: "POST",
      });
      const result = (await response.json().catch(() => null)) as {
        updates?: PositionUpdateResult[];
        errors?: { ticker: string; error: string }[];
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.error || "Request failed");
      }

      await loadTradeData();

      const updateResults = result?.updates || [];

      setLatestPositionUpdates((currentUpdates) => {
        const nextUpdates = { ...currentUpdates };

        for (const update of updateResults) {
          nextUpdates[update.position_id] = updateResultToLatestPositionUpdate(update);
        }

        return nextUpdates;
      });

      if (result?.errors?.length) {
        const tickers = result.errors.map((error) => error.ticker).join(", ");
        setMessage(`Some positions could not be updated: ${tickers}.`);
      } else {
        setMessage(`Updated ${updateResults.length} open positions.`);
      }
    } catch (error) {
      const fallbackMessage =
        "Sorry, Trade could not update positions right now. Please try again.";

      setMessage(
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : fallbackMessage,
      );
    }

    setIsUpdatingPositions(false);
  }

  function openTradeModal(recommendation: Recommendation) {
    if (isRecommendationExpired(toFreshnessInput(recommendation))) {
      setMessage(
        "This setup has expired. Generate a fresh recommendation before taking the trade.",
      );
      return;
    }

    const positionSizing = calculatePositionSizing(recommendation, userSettings);

    setSelectedRecommendation(recommendation);
    setEntryPrice("");
    setPositionSize(
      positionSizing.suggestedShares === null
        ? ""
        : String(positionSizing.suggestedShares),
    );
    setMessage(
      recommendation.confidenceScore !== null && recommendation.confidenceScore < 60
        ? "Low confidence setup. Review carefully before adding this trade."
        : "",
    );
  }

  function closeTradeModal() {
    if (isSaving) {
      return;
    }

    setSelectedRecommendation(null);
  }

  function openClosePositionModal(position: ActivePosition) {
    setSelectedPosition(position);
    setExitPrice("");
    setExitNotes("");
    setMessage("");
  }

  function closeClosePositionModal() {
    if (isSaving) {
      return;
    }

    setSelectedPosition(null);
  }

  async function submitTrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedRecommendation) {
      return;
    }

    if (isRecommendationExpired(toFreshnessInput(selectedRecommendation))) {
      setSelectedRecommendation(null);
      setMessage(
        "This setup has expired. Generate a fresh recommendation before taking the trade.",
      );
      return;
    }

    const actualEntryPrice = Number(entryPrice);
    const actualPositionSize = Number(positionSize);

    if (Number.isNaN(actualEntryPrice) || Number.isNaN(actualPositionSize)) {
      setMessage("Entry price and position size must be numbers.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    const { error: insertError } = await supabase.from("positions").insert({
      recommendation_id: selectedRecommendation.id,
      ticker: selectedRecommendation.ticker,
      company_name: selectedRecommendation.companyName,
      entry_price: actualEntryPrice,
      position_size: actualPositionSize,
      current_stop: selectedRecommendation.stopLoss,
      target_1: selectedRecommendation.target1,
      target_2: selectedRecommendation.target2,
      status: "open",
    });

    if (insertError) {
      setMessage(insertError.message);
      setIsSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("recommendations")
      .update({ status: "taken" })
      .eq("id", selectedRecommendation.id);

    if (updateError) {
      setMessage(updateError.message);
      setIsSaving(false);
      return;
    }

    setSelectedRecommendation(null);
    setActiveTab("Live Day Trades");
    await loadTradeData();
    setIsSaving(false);
  }

  async function submitClosePosition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPosition) {
      return;
    }

    const actualExitPrice = Number(exitPrice);
    const entryPriceValue = parseNumber(selectedPosition.entryPrice);
    const positionSizeValue = parseNumber(selectedPosition.positionSize);
    const currentStopValue = parseNumber(selectedPosition.stopLoss);

    if (!Number.isFinite(actualExitPrice)) {
      setMessage("Exit price must be a number.");
      return;
    }

    if (entryPriceValue === null || positionSizeValue === null) {
      setMessage("Entry price and position size must be valid before closing.");
      return;
    }

    const pnl = (actualExitPrice - entryPriceValue) * positionSizeValue;
    const pnlPercent =
      entryPriceValue !== 0
        ? ((actualExitPrice - entryPriceValue) / entryPriceValue) * 100
        : 0;
    const riskPerShare =
      currentStopValue === null ? null : entryPriceValue - currentStopValue;
    const rMultiple =
      riskPerShare !== null && riskPerShare > 0
        ? (actualExitPrice - entryPriceValue) / riskPerShare
        : null;
    const notes = exitNotes.trim() || null;

    setIsSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("positions")
      .update({
        status: "closed",
        exit_price: actualExitPrice,
        closed_at: new Date().toISOString(),
        pnl,
        pnl_percent: pnlPercent,
        r_multiple: rMultiple,
        exit_notes: notes,
      })
      .eq("id", selectedPosition.id);

    if (error) {
      setMessage(error.message);
      setIsSaving(false);
      return;
    }

    setSelectedPosition(null);
    setActiveTab("History");
    await loadTradeData();
    setMessage(`${selectedPosition.ticker} closed manually.`);
    setIsSaving(false);
  }

  const dailyRecommendations = recommendations.filter(
    (recommendation) =>
      !recommendation.archived &&
      !historyStatuses.includes(recommendation.status) &&
      !isRecommendationExpired(toFreshnessInput(recommendation)),
  );
  const historyRecommendations = recommendations.filter((recommendation) =>
    historyStatuses.includes(recommendation.status),
  );
  const discardedSetups = getDiscardedSetupsForHistory(recommendations);
  const discardReviewSummary = calculateDiscardReviewSummary(discardedSetups);
  const currentIntradayScanWindow = getIntradayScanWindow(new Date());
  const currentIntradayScanWindowLabel = getIntradayScanWindowLabel(
    currentIntradayScanWindow,
  );
  const currentIntradayScanPolicy = getIntradayScanPolicy(
    currentIntradayScanWindow,
  );
  const performanceSummary = calculatePerformanceSummary(closedPositions);
  const setupPerformance = calculateSetupPerformance(closedPositions);
  const scanQualitySummary = calculateScanQualitySummary(scanLogs);
  const lastPositionUpdate = Object.values(latestPositionUpdates)
    .map((update) => update.updatedAt)
    .find(Boolean);
  const marketCloseWarning = getMarketCloseWarning(marketStatus);
  const isGenerateDisabled =
    isLoading ||
    generatingSessionType !== null ||
    marketStatus?.isOpenDay === false ||
    (marketStatus ? !isMarketOpenForIntradayTrading(marketStatus) : false) ||
    !currentIntradayScanPolicy.allowGeneration;
  const topMarketStatus = getTopMarketStatus(marketStatus);

  return (
    <main className="min-h-screen bg-[#060707] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              <span>US stock market</span>
              <span
                className="h-1 w-1 rounded-full bg-zinc-600"
                style={topMarketStatusDotStyle(topMarketStatus)}
              />
              <span>{topMarketStatusLabel(topMarketStatus)}</span>
            </div>
            <div>
              <h1 className="font-mono text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                Trade
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                Intraday trade ideas, active positions, and decision history in
                one quiet workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center sm:min-w-[320px]">
            <Stat label="Recommendations" value={dailyRecommendations.length} />
            <Stat label="Live Day Trades" value={activePositions.length} />
          </div>
        </header>

        <nav className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] transition ${
                activeTab === tab
                  ? "border-[#00db94] bg-[#00db94] text-zinc-950"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-zinc-100"
              }`}
            >
              {tab}
            </button>
          ))}
          <Link
            href="/settings"
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400 transition hover:border-white/25 hover:text-zinc-100"
          >
            Settings
          </Link>
        </nav>

        {message && (
          <div className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            {message}
          </div>
        )}

        {activeTab === "Recommendations" && (
          <section className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-mono text-2xl font-semibold tracking-normal text-white">
                  Trade Recommendations
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Current trade setups saved in Supabase.
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                  Day trade-first draft recommendations for intraday, same-day
                  execution. Live market data is not connected yet.
                </p>
                <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
                  Day trade window · {currentIntradayScanWindowLabel}
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:min-w-[360px]">
                <MarketStatusNotice
                  marketStatus={marketStatus}
                  error={marketStatusError}
                />
                <button
                  type="button"
                  onClick={() =>
                    generateRecommendations(currentIntradayScanWindow)
                  }
                  disabled={isGenerateDisabled}
                  className="min-h-11 w-full rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  {generatingSessionType !== null
                    ? "Generating..."
                    : "Generate 1 New Card"}
                </button>
              </div>
            </div>

            {isLoading ? (
              <EmptyState
                title="Loading recommendations"
                message="Trade is reading your Supabase recommendations table."
              />
            ) : dailyRecommendations.length === 0 ? (
              <EmptyState
                title="No current trade recommendations"
                message={
                  topMarketStatus === "open"
                    ? "The scanner will add new setups when high-quality intraday opportunities appear."
                    : "US stock market is currently closed."
                }
              />
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {dailyRecommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    positionSizing={calculatePositionSizing(
                      recommendation,
                      userSettings,
                    )}
                    isSaving={isSaving}
                    onTakeTrade={openTradeModal}
                    onIgnore={(item) => updateRecommendationStatus(item, "ignored")}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "Live Day Trades" && (
          <section className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-mono text-2xl font-semibold tracking-normal text-white">
                  Live Day Trades
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Open intraday trades with latest rule engine context.
                </p>
              </div>
              <button
                type="button"
                onClick={updatePositions}
                disabled={isLoading || isUpdatingPositions || activePositions.length === 0}
                className="min-h-11 rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {isUpdatingPositions ? "Refreshing..." : "Refresh Live Positions"}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <LiveStatus label="Open Day Trades" value={String(activePositions.length)} />
              <LiveStatus
                label="Last Position Update"
                value={lastPositionUpdate || "—"}
              />
              <LiveStatus
                label="Market Status"
                value={topMarketStatusLabel(topMarketStatus)}
              />
            </div>

            {marketCloseWarning && activePositions.length > 0 && (
              <div className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                {marketCloseWarning}
              </div>
            )}

            {isLoading ? (
              <EmptyState
                title="Loading live day trades"
                message="Trade is reading your open Supabase positions."
              />
            ) : activePositions.length === 0 ? (
              <EmptyState
                title="No live day trades"
                message={
                  topMarketStatus === "open"
                    ? "Add a trade from Trade Recommendations when a high-quality intraday setup appears."
                    : "US stock market is currently closed."
                }
              />
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {activePositions.map((position) => (
                  <ActivePositionCard
                    key={position.id}
                    position={position}
                    latestUpdate={latestPositionUpdates[position.id]}
                    marketCloseWarning={marketCloseWarning}
                    isSaving={isSaving}
                    onClosePosition={openClosePositionModal}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "History" && (
          <section className="space-y-8">
            <div>
              <h2 className="font-mono text-2xl font-semibold tracking-normal text-white">
                History
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Closed trades and theoretical discarded setup analytics.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
              <h3 className="font-mono text-lg font-semibold tracking-normal text-white">
                Closed Trades
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Actual positions you took and closed. These metrics are the only
                values counted as trading performance.
              </p>
            </div>

            <HistorySection title="Performance Summary">
              {isLoading ? (
                <EmptyState
                  title="Loading performance"
                  message="Trade is calculating performance from manually closed positions."
                />
              ) : (
                <PerformanceSummaryCards summary={performanceSummary} />
              )}
            </HistorySection>

            <HistorySection title="Setup Performance">
              {isLoading ? (
                <EmptyState
                  title="Loading setup performance"
                  message="Trade is grouping closed positions by setup type."
                />
              ) : (
                <SetupPerformanceTable setupPerformance={setupPerformance} />
              )}
            </HistorySection>

            <HistorySection title="Closed Positions">
              {isLoading ? (
                <EmptyState
                  title="Loading closed positions"
                  message="Trade is reading completed positions."
                />
              ) : closedPositions.length === 0 ? (
                <EmptyState
                  title="No closed positions yet"
                  message="Positions you close manually will appear here."
                />
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {closedPositions.map((position) => (
                    <ClosedPositionCard key={position.id} position={position} />
                  ))}
                </div>
              )}
            </HistorySection>

            <HistorySection title="Discarded Setups">
              {isLoading ? (
                <EmptyState
                  title="Loading discarded setups"
                  message="Trade is reading discarded recommendations and review metadata."
                />
              ) : discardedSetups.length === 0 ? (
                <EmptyState
                  title="No discarded setups yet"
                  message="When you discard trade recommendations, Trade will review them after market close."
                />
              ) : (
                <div className="space-y-4">
                  <p className="text-sm leading-6 text-zinc-500">
                    Discarded setup analytics are theoretical. They do not affect
                    actual PnL.
                  </p>
                  <DiscardReviewSummaryCards summary={discardReviewSummary} />
                  {discardReviewSummary.reviewedDiscards === 0 && (
                    <EmptyState
                      title="Discard reviews pending"
                      message="Reviewed results will appear after market close."
                    />
                  )}
                  <div className="grid gap-4 xl:grid-cols-2">
                    {discardedSetups.map((setup) => (
                      <DiscardedSetupCard key={setup.id} recommendation={setup} />
                    ))}
                  </div>
                </div>
              )}
            </HistorySection>

            {historyRecommendations.some(
              (item) => item.status === "taken" || item.status === "watched",
            ) && (
              <HistorySection title="Recommendation Decisions">
                <div className="overflow-hidden rounded-lg border border-white/10">
                  {historyRecommendations
                    .filter(
                      (item) => item.status === "taken" || item.status === "watched",
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        className="grid gap-3 border-b border-white/10 bg-white/[0.025] p-4 last:border-b-0 sm:grid-cols-[140px_1fr_150px]"
                      >
                        <div className="font-mono text-sm font-semibold text-white">
                          {recommendationStatusLabel(item.status)}
                        </div>
                        <div>
                          <div className="font-mono text-sm text-zinc-200">
                            {item.ticker}{" "}
                            <span className="text-zinc-500">{item.companyName}</span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-zinc-400">
                            {item.thesis}
                          </p>
                        </div>
                        <div className="font-mono text-xs uppercase tracking-[0.12em] text-zinc-500 sm:text-right">
                          {item.createdAt}
                        </div>
                      </div>
                    ))}
                </div>
              </HistorySection>
            )}
          </section>
        )}

        {activeTab === "Market" && (
          <section className="space-y-5">
            <div>
              <h2 className="font-mono text-2xl font-semibold tracking-normal text-white">
                Market
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Market regime context for current day trade decisions.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
              <MarketRegimeCard marketRegime={marketRegime} />
              <MarketStatusNotice
                marketStatus={marketStatus}
                error={marketStatusError}
              />
            </div>

            <HistorySection title="Scan Quality">
              {isLoading ? (
                <EmptyState
                  title="Loading scan quality"
                  message="Trade is reading recent automation scan logs."
                />
              ) : scanLogs.length === 0 ? (
                <EmptyState
                  title="No scan quality data yet"
                  message="Scan results will appear after scheduled or manual scans run."
                />
              ) : (
                <div className="space-y-4">
                  <ScanQualitySummaryCards summary={scanQualitySummary} />
                  <RecentScanLogs scanLogs={scanLogs.slice(0, 20)} />
                </div>
              )}
            </HistorySection>
          </section>
        )}
      </div>

      {selectedRecommendation && (
        <TradeModal
          recommendation={selectedRecommendation}
          positionSizing={calculatePositionSizing(
            selectedRecommendation,
            userSettings,
          )}
          entryPrice={entryPrice}
          positionSize={positionSize}
          isSaving={isSaving}
          onEntryPriceChange={setEntryPrice}
          onPositionSizeChange={setPositionSize}
          onClose={closeTradeModal}
          onSubmit={submitTrade}
        />
      )}

      {selectedPosition && (
        <ClosePositionModal
          position={selectedPosition}
          exitPrice={exitPrice}
          exitNotes={exitNotes}
          isSaving={isSaving}
          onExitPriceChange={setExitPrice}
          onExitNotesChange={setExitNotes}
          onClose={closeClosePositionModal}
          onSubmit={submitClosePosition}
        />
      )}
    </main>
  );
}

function PerformanceSummaryCards({ summary }: { summary: PerformanceSummary }) {
  const hasClosedTrades = summary.totalClosedTrades > 0;

  return (
    <div className="space-y-4">
      {!hasClosedTrades && (
        <EmptyState
          title="No performance data yet"
          message="Close a position manually to start building your trading performance summary."
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total PnL"
          value={formatPnl(summary.totalPnl)}
          tone={summary.totalPnl}
        />
        <SummaryCard
          label="Closed Trades"
          value={String(summary.totalClosedTrades)}
        />
        <SummaryCard label="Winning Trades" value={String(summary.winningTrades)} />
        <SummaryCard label="Losing Trades" value={String(summary.losingTrades)} />
        <SummaryCard label="Win Rate" value={formatPercent(summary.winRate)} />
        <SummaryCard label="Average R" value={formatRMultiple(summary.averageR)} />
        <SummaryCard
          label="Average Win"
          value={formatPnl(summary.averageWin)}
          tone={summary.averageWin}
        />
        <SummaryCard
          label="Average Loss"
          value={formatPnl(summary.averageLoss)}
          tone={summary.averageLoss}
        />
        <SummaryCard
          label="Best Trade"
          value={formatPnl(summary.bestTrade)}
          tone={summary.bestTrade}
        />
        <SummaryCard
          label="Worst Trade"
          value={formatPnl(summary.worstTrade)}
          tone={summary.worstTrade}
        />
        <SummaryCard
          label="Profit Factor"
          value={formatProfitFactor(summary.profitFactor)}
        />
      </div>

      <p className="text-sm leading-6 text-zinc-500">
        Performance is based only on manually closed positions.
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: number | null;
}) {
  const valueClassName =
    tone === undefined || tone === null || tone === 0
      ? "text-white"
      : tone > 0
        ? "text-emerald-100"
        : "text-rose-100";

  return (
    <div className="bg-surface-subtle rounded-lg border border-white/10 p-4">
      <div className={`font-mono text-2xl font-semibold ${valueClassName}`}>
        {value}
      </div>
      <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}

function SetupPerformanceTable({
  setupPerformance,
}: {
  setupPerformance: SetupPerformanceSummary[];
}) {
  if (setupPerformance.length === 0) {
    return (
      <EmptyState
        title="No setup performance yet"
        message="Close a position manually to see which setup types are working best."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/[0.025]">
      <table className="min-w-[980px] w-full border-collapse text-left">
        <thead className="border-b border-white/10 bg-black/25">
          <tr>
            <SetupTableHeader label="Setup" />
            <SetupTableHeader label="Closed" align="right" />
            <SetupTableHeader label="Wins" align="right" />
            <SetupTableHeader label="Losses" align="right" />
            <SetupTableHeader label="Win Rate" align="right" />
            <SetupTableHeader label="Total PnL" align="right" />
            <SetupTableHeader label="Total R" align="right" />
            <SetupTableHeader label="Avg R" align="right" />
            <SetupTableHeader label="Best" align="right" />
            <SetupTableHeader label="Worst" align="right" />
            <SetupTableHeader label="PF" align="right" />
          </tr>
        </thead>
        <tbody>
          {setupPerformance.map((setup) => (
            <tr
              key={setup.setupType}
              className="border-b border-white/10 last:border-b-0"
            >
              <SetupTableCell>
                <span className="font-mono font-semibold text-white">
                  {setup.setupType}
                </span>
              </SetupTableCell>
              <SetupTableCell align="right">{setup.closedTrades}</SetupTableCell>
              <SetupTableCell align="right">{setup.winningTrades}</SetupTableCell>
              <SetupTableCell align="right">{setup.losingTrades}</SetupTableCell>
              <SetupTableCell align="right">
                {formatPercent(setup.winRate)}
              </SetupTableCell>
              <SetupTableCell align="right" tone={setup.totalPnl}>
                {formatPnl(setup.totalPnl)}
              </SetupTableCell>
              <SetupTableCell align="right" tone={setup.totalR}>
                {formatRMultiple(setup.totalR)}
              </SetupTableCell>
              <SetupTableCell align="right">
                {formatRMultiple(setup.averageR)}
              </SetupTableCell>
              <SetupTableCell align="right" tone={setup.bestTrade}>
                {formatRMultiple(setup.bestTrade)}
              </SetupTableCell>
              <SetupTableCell align="right" tone={setup.worstTrade}>
                {formatRMultiple(setup.worstTrade)}
              </SetupTableCell>
              <SetupTableCell align="right">
                {formatProfitFactor(setup.profitFactor)}
              </SetupTableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SetupTableHeader({
  label,
  align = "left",
}: {
  label: string;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {label}
    </th>
  );
}

function SetupTableCell({
  children,
  align = "left",
  tone,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  tone?: number | null;
}) {
  const toneClassName =
    tone === undefined || tone === null || tone === 0
      ? "text-zinc-200"
      : tone > 0
        ? "text-emerald-100"
        : "text-rose-100";

  return (
    <td
      className={`px-4 py-4 font-mono text-sm ${toneClassName} ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}

function PositionSizingSection({
  positionSizing,
}: {
  positionSizing: PositionSizing;
}) {
  return (
    <section className="mt-5 rounded-lg border border-[#00db94]/15 bg-[#00db94]/[0.04] p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
          Position Sizing
        </h3>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
          Helper only
        </p>
      </div>

      {!positionSizing.isAvailable ? (
        <p className="mt-3 text-sm text-zinc-400">Position size unavailable</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Detail label="Risk Amount" value={formatCurrency(positionSizing.riskAmount)} />
          <Detail label="Risk/share" value={formatCurrency(positionSizing.riskPerShare)} />
          <Detail
            label="Suggested Shares"
            value={formatShares(positionSizing.suggestedShares)}
          />
          <Detail
            label="Position Value"
            value={formatCurrency(positionSizing.suggestedPositionValue)}
          />
          <Detail
            label="Max Loss at Stop"
            value={formatCurrency(positionSizing.maxLossAtStop)}
          />
        </div>
      )}
    </section>
  );
}

function RecommendationCard({
  recommendation,
  positionSizing,
  isSaving,
  onTakeTrade,
  onIgnore,
}: {
  recommendation: Recommendation;
  positionSizing: PositionSizing;
  isSaving: boolean;
  onTakeTrade: (recommendation: Recommendation) => void;
  onIgnore: (recommendation: Recommendation) => void;
}) {
  const freshness = getRecommendationFreshness(toFreshnessInput(recommendation));
  const isExpired = freshness === "expired";
  const isLowConfidence =
    recommendation.confidenceScore !== null && recommendation.confidenceScore < 60;
  const confidenceClassName =
    recommendation.confidenceScore === null
      ? "border-white/10 bg-black/30 text-zinc-300"
      : recommendation.confidenceScore >= 85
        ? "border-[#00db94]/35 bg-[#00db94]/10 text-emerald-100"
        : recommendation.confidenceScore >= 70
          ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
          : "border-amber-300/30 bg-amber-300/10 text-amber-100";
  const confidenceBreakdownItems = recommendation.confidenceBreakdown
    ? [
        ["Setup", recommendation.confidenceBreakdown.setup_quality],
        ["Momentum", recommendation.confidenceBreakdown.momentum_confirmation],
        ["Volume", recommendation.confidenceBreakdown.volume_confirmation],
        ["R/R", recommendation.confidenceBreakdown.risk_reward_quality],
        ["Regime", recommendation.confidenceBreakdown.market_regime_alignment],
        ["Timing", recommendation.confidenceBreakdown.timing_quality],
      ]
    : [];

  return (
    <article
      className={`bg-surface-subtle rounded-lg border p-5 transition ${
        freshness === "stale"
          ? "border-amber-300/30 hover:border-amber-200/50"
          : freshness === "aging"
            ? "border-yellow-300/20 hover:border-yellow-200/40"
            : isExpired
              ? "border-rose-300/30 opacity-70"
              : "border-white/10 hover:border-white/20"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-3xl font-semibold tracking-normal text-white">
              {recommendation.ticker}
            </span>
            <DirectionPill direction={recommendation.direction} />
            <span className="rounded-full border border-[#00db94]/25 bg-[#00db94]/10 px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100">
              {recommendation.sessionLabel}
            </span>
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.12em] text-cyan-100">
              DAY TRADE
            </span>
          </div>
          <p className="mt-1 break-words text-sm text-zinc-400">
            {recommendation.companyName}
          </p>
          <p className="mt-2 text-sm text-zinc-300">
            Intraday setup · Same-day execution
          </p>
        </div>
        <div className="grid gap-2 sm:min-w-[150px]">
          <div className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-left sm:text-right">
            <div className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
              Freshness
            </div>
            <div
              className={`mt-1 font-mono text-sm font-semibold uppercase ${
                freshness === "fresh"
                  ? "text-emerald-100"
                  : freshness === "aging"
                    ? "text-yellow-100"
                    : freshness === "stale"
                      ? "text-amber-100"
                      : "text-rose-100"
              }`}
            >
              {freshness}
            </div>
          </div>
          <div
            className={`rounded-md border px-3 py-2 text-left sm:text-right ${confidenceClassName}`}
          >
            <div className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
              Confidence
            </div>
            <div className="mt-1 font-mono text-sm font-semibold">
              {recommendation.confidenceScore === null
                ? "Unavailable"
                : `${recommendation.confidenceScore} / 100`}
            </div>
            <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]">
              {recommendation.confidenceLabel}
            </div>
          </div>
        </div>
      </div>

      {freshness === "aging" && (
        <p className="mt-4 text-sm leading-6 text-yellow-100/85">
          This setup is aging. Confirm price action before taking the trade.
        </p>
      )}
      {freshness === "stale" && (
        <p className="mt-4 text-sm leading-6 text-amber-100">
          This setup is stale. Be selective and prefer a fresh scan if the move has
          changed.
        </p>
      )}
      {isExpired && (
        <p className="mt-4 text-sm leading-6 text-rose-100">
          This setup has expired. Generate a fresh recommendation before taking
          the trade.
        </p>
      )}
      {isLowConfidence && (
        <p className="mt-4 text-sm leading-6 text-amber-100">
          Low confidence setup. Review carefully before adding this trade.
        </p>
      )}
      {recommendation.confidenceBreakdown && (
        <div className="mt-4 rounded-md border border-white/10 bg-black/20 px-3 py-2">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {confidenceBreakdownItems.map(([label, score]) => (
              <span
                key={label}
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-zinc-400"
              >
                {label}{" "}
                <span className="font-semibold text-zinc-100">{score}</span>
              </span>
            ))}
          </div>
          {recommendation.confidenceReasoning && (
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              {recommendation.confidenceReasoning}
            </p>
          )}
          {recommendation.riskFlags.length > 0 && (
            <p className="mt-1 text-xs leading-5 text-amber-100/85">
              {recommendation.riskFlags.join(" · ")}
            </p>
          )}
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Setup" value={recommendation.setupType} />
        <Detail label="Entry Zone" value={recommendation.entryZone} />
        <Detail label="Stop Loss" value={recommendation.stopLoss} />
        <Detail label="Target 1" value={recommendation.target1} />
        <Detail label="Target 2" value={recommendation.target2} />
        <Detail label="Risk/Reward" value={recommendation.riskReward} />
        <Detail label="Execution" value={recommendation.timeframe} />
      </div>

      <PositionSizingSection positionSizing={positionSizing} />

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <TextBlock label="Thesis" value={recommendation.thesis} />
        <TextBlock label="Invalidation" value={recommendation.invalidation} />
        <TextBlock label="Reason to Avoid" value={recommendation.reasonToAvoid} />
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => onTakeTrade(recommendation)}
          disabled={isSaving || isExpired}
          className="min-h-11 flex-1 rounded-md bg-[#00db94] px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-[#00db94]/85 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          Add Trade
        </button>
        <button
          type="button"
          onClick={() => onIgnore(recommendation)}
          disabled={isSaving}
          className="min-h-11 flex-1 rounded-md border border-rose-300/30 bg-rose-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-200/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-zinc-900 disabled:text-zinc-600"
        >
          Discard
        </button>
      </div>
    </article>
  );
}

function TradeModal({
  recommendation,
  positionSizing,
  entryPrice,
  positionSize,
  isSaving,
  onEntryPriceChange,
  onPositionSizeChange,
  onClose,
  onSubmit,
}: {
  recommendation: Recommendation;
  positionSizing: PositionSizing;
  entryPrice: string;
  positionSize: string;
  isSaving: boolean;
  onEntryPriceChange: (value: string) => void;
  onPositionSizeChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg rounded-lg border border-white/10 bg-[#0b0c0c] p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Add trade
            </p>
            <h2 className="mt-2 font-mono text-2xl font-semibold text-white">
              {recommendation.ticker}{" "}
              <span className="text-zinc-500">{recommendation.companyName}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/10 px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-zinc-400 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Actual Entry Price
            </span>
            <input
              required
              type="number"
              step="0.01"
              value={entryPrice}
              onChange={(event) => onEntryPriceChange(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-emerald-300"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Shares
            </span>
            <input
              required
              type="number"
              step="1"
              value={positionSize}
              onChange={(event) => onPositionSizeChange(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-emerald-300"
            />
          </label>
        </div>

        <PositionSizingSection positionSizing={positionSizing} />

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Detail label="Stop Loss" value={recommendation.stopLoss} />
          <Detail label="Target 1" value={recommendation.target1} />
          <Detail label="Target 2" value={recommendation.target2} />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-5 min-h-11 w-full rounded-md bg-[#00db94] px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-[#00db94]/85 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isSaving ? "Saving trade" : "Create active position"}
        </button>
      </form>
    </div>
  );
}

function ActivePositionCard({
  position,
  latestUpdate,
  marketCloseWarning,
  isSaving,
  onClosePosition,
}: {
  position: ActivePosition;
  latestUpdate?: LatestPositionUpdate;
  marketCloseWarning: string;
  isSaving: boolean;
  onClosePosition: (position: ActivePosition) => void;
}) {
  const currentPriceValue = latestUpdate?.currentPriceValue ?? null;
  const calculatedR = calculateCurrentR({
    entryPrice: position.entryPriceValue,
    stopLoss: position.stopLossValue,
    currentPrice: currentPriceValue,
    direction: position.direction,
  });
  const currentR = latestUpdate?.unrealizedRValue ?? calculatedR;
  const unrealizedPnl = calculateUnrealizedPnl({
    entryPrice: position.entryPriceValue,
    currentPrice: currentPriceValue,
    shares: position.positionSizeValue,
    direction: position.direction,
  });
  const action = latestUpdate?.action ?? "HOLD";
  const isCloseAction = action === "CLOSE_POSITION";

  return (
    <article
      className={`rounded-lg border p-5 ${
        isCloseAction
          ? "border-rose-300/35 bg-rose-300/[0.06]"
          : "border-[#00db94]/20 bg-[#00db94]/[0.045]"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-3xl font-semibold tracking-normal text-white">
              {position.ticker}
            </span>
            <DirectionPill direction={position.direction} />
          </div>
          <p className="mt-1 text-sm text-zinc-400">{position.companyName}</p>
        </div>
        <div className="space-y-2 text-left sm:text-right">
          <div
            className={`inline-flex rounded-full border px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.12em] ${positionActionClassName(
              action,
            )}`}
          >
            {positionActionLabel(action)}
          </div>
          <div className="font-mono text-xs uppercase tracking-[0.12em] text-emerald-200">
            Opened {position.openedAt}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Entry Price" value={position.entryPrice} />
        <Detail label="Shares" value={position.positionSize} />
        <Detail label="Stop Loss" value={position.stopLoss} />
        <Detail label="Target 1" value={position.target1} />
        <Detail label="Target 2" value={position.target2} />
        <Detail
          label="Latest Price"
          value={latestUpdate ? latestUpdate.currentPrice : "Waiting for latest price"}
        />
        <Detail label="Current R" value={formatSignedR(currentR)} />
        <Detail label="Unrealized PnL" value={formatSignedCurrency(unrealizedPnl.pnl)} />
        <Detail
          label="Unrealized PnL %"
          value={
            latestUpdate?.unrealizedPercentValue !== null &&
            latestUpdate?.unrealizedPercentValue !== undefined
              ? formatSignedPercent(latestUpdate.unrealizedPercentValue)
              : formatSignedPercent(unrealizedPnl.percent)
          }
        />
        <Detail label="Time In Trade" value={formatTimeInTrade(position.openedAtRaw)} />
        <Detail
          label="Last Updated"
          value={latestUpdate ? latestUpdate.updatedAt : "—"}
        />
      </div>

      {marketCloseWarning && (
        <div className="mt-5 rounded-md border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
          {marketCloseWarning}
        </div>
      )}

      {latestUpdate && (
        <div className="mt-5 rounded-md border border-white/10 bg-black/25 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div
              className={`inline-flex w-fit rounded-full border px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.14em] ${positionActionClassName(
                latestUpdate.action,
              )}`}
            >
              {positionActionLabel(latestUpdate.action)}
            </div>
            <div className="font-mono text-xs uppercase tracking-[0.12em] text-zinc-500">
              {latestUpdate.updatedAt}
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-200">
            {latestUpdate.recommendation}
          </p>
          {latestUpdate.explanation && (
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-400">
              {latestUpdate.explanation}
            </p>
          )}
          {latestUpdate.newStop !== "Not set" && (
            <p className="mt-2 font-mono text-xs text-zinc-400">
              New stop: {latestUpdate.newStop}
            </p>
          )}
          {isCloseAction && (
            <p className="mt-3 text-sm leading-6 text-rose-100">
              Rule engine is calling for exit management. Close manually when you
              decide to act.
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => onClosePosition(position)}
        disabled={isSaving}
        className="mt-5 min-h-11 w-full rounded-md border border-rose-300/35 bg-rose-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-200/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-zinc-900 disabled:text-zinc-600"
      >
        Close Trade
      </button>
    </article>
  );
}

function ClosePositionModal({
  position,
  exitPrice,
  exitNotes,
  isSaving,
  onExitPriceChange,
  onExitNotesChange,
  onClose,
  onSubmit,
}: {
  position: ActivePosition;
  exitPrice: string;
  exitNotes: string;
  isSaving: boolean;
  onExitPriceChange: (value: string) => void;
  onExitNotesChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg rounded-lg border border-white/10 bg-[#0b0c0c] p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Close trade
            </p>
            <h2 className="mt-2 font-mono text-2xl font-semibold text-white">
              {position.ticker}{" "}
              <span className="text-zinc-500">{position.companyName}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/10 px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-zinc-400 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Detail label="Entry Price" value={position.entryPrice} />
          <Detail label="Shares" value={position.positionSize} />
          <Detail label="Current Stop" value={position.stopLoss} />
        </div>

        <label className="mt-5 block">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Exit Price
          </span>
          <input
            required
            type="number"
            step="0.01"
            value={exitPrice}
            onChange={(event) => onExitPriceChange(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-emerald-300"
          />
        </label>

        <label className="mt-4 block">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Exit Notes
          </span>
          <textarea
            rows={4}
            value={exitNotes}
            onChange={(event) => onExitNotesChange(event.target.value)}
            className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-3 text-sm leading-6 text-white outline-none focus:border-emerald-300"
          />
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-5 min-h-11 w-full rounded-md bg-rose-300 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isSaving ? "Closing trade" : "Close trade"}
        </button>
      </form>
    </div>
  );
}

function ClosedPositionCard({ position }: { position: ClosedPosition }) {
  const pnlValue = parseNumber(position.pnl);
  const pnlClassName =
    pnlValue !== null && pnlValue < 0 ? "text-rose-100" : "text-emerald-100";

  return (
    <article className="bg-surface-subtle rounded-lg border border-white/10 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-3xl font-semibold tracking-normal text-white">
              {position.ticker}
            </span>
            <DirectionPill direction={position.direction} />
          </div>
          <p className="mt-1 text-sm text-zinc-400">{position.companyName}</p>
        </div>
        <div className={`font-mono text-sm font-semibold ${pnlClassName}`}>
          {position.pnl}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Entry Price" value={position.entryPrice} />
        <Detail label="Exit Price" value={position.exitPrice} />
        <Detail label="PnL" value={position.pnl} />
        <Detail label="PnL %" value={position.pnlPercent} />
        <Detail label="R Multiple" value={position.rMultiple} />
        <Detail label="Shares" value={position.positionSize} />
        <Detail label="Opened" value={position.openedAt} />
        <Detail label="Closed" value={position.closedAt} />
      </div>

      {position.exitNotes && (
        <div className="mt-5">
          <TextBlock label="Exit Notes" value={position.exitNotes} />
        </div>
      )}
    </article>
  );
}

function discardReviewStatusLabel(value: DiscardReviewStatus | null) {
  if (value === "reviewed") return "REVIEWED";
  if (value === "skipped") return "SKIPPED";
  if (value === "error") return "ERROR";
  return "PENDING REVIEW";
}

function discardOutcomeLabel(value: DiscardOutcome | null) {
  if (value === "entry_not_triggered") return "ENTRY NOT TRIGGERED";
  if (value === "target_hit") return "TARGET HIT";
  if (value === "stop_hit") return "STOP HIT";
  if (value === "partial_move") return "PARTIAL MOVE";
  if (value === "sideways") return "SIDEWAYS";
  return "UNKNOWN";
}

function discardDecisionQualityLabel(value: DiscardDecisionQuality | null) {
  if (value === "correct_discard") return "CORRECT DISCARD";
  if (value === "missed_winner") return "MISSED WINNER";
  if (value === "missed_opportunity") return "MISSED OPPORTUNITY";
  if (value === "neutral") return "NEUTRAL";
  return "UNKNOWN";
}

function discardDecisionQualityClassName(value: DiscardDecisionQuality | null) {
  if (value === "correct_discard") {
    return "border-[#00db94]/30 bg-[#00db94]/10 text-emerald-100";
  }

  if (value === "missed_winner") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-100";
  }

  if (value === "missed_opportunity") {
    return "border-yellow-300/25 bg-yellow-300/10 text-yellow-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

function DiscardReviewSummaryCards({
  summary,
}: {
  summary: DiscardReviewSummary;
}) {
  if (summary.reviewedDiscards < 2) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-zinc-500">
        Not enough reviewed discarded setups yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <SummaryCard label="Reviewed" value={String(summary.reviewedDiscards)} />
      <SummaryCard label="Correct" value={String(summary.correctDiscards)} />
      <SummaryCard label="Missed Winners" value={String(summary.missedWinners)} />
      <SummaryCard
        label="Missed Opps"
        value={String(summary.missedOpportunities)}
      />
      <SummaryCard
        label="Avg Theo R"
        value={formatRMultiple(summary.averageTheoreticalR)}
      />
      <SummaryCard
        label="Accuracy"
        value={formatPercent(summary.discardAccuracy)}
      />
    </div>
  );
}

function DiscardedSetupCard({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const notes = recommendation.discardReviewNotes.slice(0, 2).join(" ");

  return (
    <article className="bg-surface-subtle rounded-lg border border-white/10 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-3xl font-semibold tracking-normal text-white">
              {recommendation.ticker}
            </span>
            <span
              className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${discardDecisionQualityClassName(
                recommendation.discardDecisionQuality,
              )}`}
            >
              {discardDecisionQualityLabel(recommendation.discardDecisionQuality)}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            {recommendation.setupType || "Unknown setup"}
          </p>
        </div>
        <div className="font-mono text-sm font-semibold text-zinc-200">
          {formatRMultiple(recommendation.discardTheoreticalR)}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Detail
          label="Confidence"
          value={
            recommendation.confidenceScore === null
              ? "Unavailable"
              : `${recommendation.confidenceScore} / 100`
          }
        />
        <Detail label="Created" value={recommendation.createdAt} />
        <Detail
          label="Discarded"
          value={formatDate(recommendation.discardedAtRaw)}
        />
        <Detail label="Entry" value={recommendation.entryZone} />
        <Detail label="Stop" value={recommendation.stopLoss} />
        <Detail label="Target" value={recommendation.target1} />
        <Detail
          label="Review"
          value={discardReviewStatusLabel(recommendation.discardReviewStatus)}
        />
        <Detail
          label="Outcome"
          value={discardOutcomeLabel(recommendation.discardOutcome)}
        />
        <Detail
          label="Max Fav R"
          value={formatRMultiple(recommendation.discardMaxFavorableR)}
        />
        <Detail
          label="Max Adv R"
          value={formatRMultiple(recommendation.discardMaxAdverseR)}
        />
      </div>

      {(notes || recommendation.confidenceReasoning) && (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {notes && <TextBlock label="Review Notes" value={notes} />}
          {recommendation.confidenceReasoning && (
            <TextBlock
              label="Original Confidence"
              value={recommendation.confidenceReasoning}
            />
          )}
        </div>
      )}
    </article>
  );
}

function HistorySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h3 className="font-mono text-lg font-semibold tracking-normal text-white">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-subtle rounded-lg border border-white/10 px-3 py-4">
      <div className="font-mono text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}

function LiveStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-subtle rounded-lg border border-white/10 px-4 py-3">
      <div className="font-mono text-sm font-semibold text-white">{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}

function MarketStatusNotice({
  marketStatus,
  error,
}: {
  marketStatus: MarketStatus | null;
  error: string;
}) {
  if (error || !marketStatus) {
    return (
      <div className="rounded-md border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm leading-5 text-amber-100">
        {error || "Market calendar status is unavailable right now."}
      </div>
    );
  }

  if (!marketStatus.isOpenDay) {
    return (
      <div className="rounded-md border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm leading-5 text-amber-100">
        Stock market closed &mdash; {marketStatus.reason}
      </div>
    );
  }

  if (marketStatus.dayType === "early_close") {
    return (
      <div className="rounded-md border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm leading-5 text-amber-100">
        Market early close today &mdash; closes at{" "}
        {marketStatus.marketCloseTime ?? "the scheduled close"} New York time.
      </div>
    );
  }

  if (marketStatus.dayType === "unknown") {
    return (
      <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm leading-5 text-zinc-400">
        Market calendar provider unavailable &mdash; using weekday trading
        status.
      </div>
    );
  }
  return null;
}

function MarketRegimeCard({
  marketRegime,
}: {
  marketRegime: MarketRegime | null;
}) {
  return (
    <div className="bg-surface-subtle rounded-lg border border-white/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Market Regime
        </div>
        <div className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100">
          {marketRegime ? marketRegimeLabel(marketRegime.regime) : "Not scanned"}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        {marketRegime
          ? marketRegime.summary
          : "No market regime snapshot yet. Run an intraday scan."}
      </p>
      {marketRegime && (
        <div className="mt-3 space-y-1 font-mono text-[11px] leading-5 text-zinc-500">
          <div>{marketTrendStatus("SPY", marketRegime.spy)}</div>
          <div>{marketTrendStatus("QQQ", marketRegime.qqq)}</div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-3">
      <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </dt>
      <dd className="mt-2 break-words font-mono text-sm text-zinc-100">{value}</dd>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-300">{value}</p>
    </div>
  );
}

function DirectionPill({ direction }: { direction: Direction }) {
  const className =
    direction === "Long"
      ? "border-[#00db94]/35 bg-[#00db94]/10 text-emerald-100"
      : "border-rose-300/35 bg-rose-300/10 text-rose-100";

  return (
    <span
      className={`rounded-full border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.12em] ${className}`}
    >
      {direction}
    </span>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
      <h3 className="font-mono text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {message}
      </p>
    </div>
  );
}
