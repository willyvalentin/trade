"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getIntradayScanPolicy,
  getIntradayScanWindow,
  getIntradayScanWindowLabel,
  getLegacySessionTypeForScanWindow,
  getNewYorkDateString,
  isMarketOpenForIntradayTrading,
  type IntradayScanWindow,
} from "@/lib/intraday-scan-window";
import type { IntradayIndicators } from "@/lib/intraday-indicators";
import {
  getRecommendationFreshness,
  isRecommendationExpired,
} from "@/lib/recommendation-freshness";
import {
  buildTradeExecutionPayload,
  createHandoffSessionId,
  type TradeExecutionPayload,
} from "@/lib/execution-payload";
import {
  brokerOrderStatusLabel,
  buildBrokerOrderPreviewCapture,
  buildBrokerExecutionMetadata,
  calculateBrokerPreviewDifference,
  parseBrokerExecutionMetadata,
  type BrokerExecutionMetadata,
  type BrokerOrderPreviewCapture,
  type BrokerOrderStatus,
} from "@/lib/broker-execution-metadata";
import {
  calculateBrokerCostEstimate,
  readBrokerCostModelFromStorage,
  type BrokerCostEstimate,
  type BrokerCostModel,
} from "@/lib/broker-costs";
import {
  calculateExecutionQuality,
  getExecutionQualityLabel,
  getSlippageDirectionLabel,
  type ExecutionQualityMetrics,
  type ExecutionQualityRating,
} from "@/lib/execution-quality";
import {
  buildExecutionTimeline,
  readTradeManagementEvents,
  type ExecutionTimelineEvent,
} from "@/lib/execution-timeline";
import {
  buildHandoffSessionReplay,
  type HandoffReplayResult,
  type HandoffReplayStepStatus,
} from "@/lib/handoff-session-replay";
import {
  calculateHandoffQuality,
  toHandoffQualitySnapshot,
  type HandoffQualityRating,
  type HandoffQualityFactorImpact,
} from "@/lib/handoff-quality";
import {
  buildExecutionImprovementSuggestions,
  type ExecutionImprovementCategory,
  type ExecutionImprovementPriority,
} from "@/lib/execution-improvement-suggestions";
import {
  buildSetupExecutionFeedback,
  type SetupExecutionBucket,
  type SetupExecutionFeedbackResult,
  type SetupExecutionInsight,
} from "@/lib/setup-execution-feedback";
import {
  buildRecommendationCalibration,
  type CalibrationBucket,
  type CalibrationInsight,
  type RecommendationCalibrationResult,
} from "@/lib/recommendation-calibration";
import {
  buildCalibrationGuardrails,
  type CalibrationGuardrail,
  type CalibrationGuardrailResult,
  type CalibrationGuardrailSeverity,
} from "@/lib/calibration-guardrails";
import {
  explainTradeOutcome,
  type TradeOutcomeClassification,
  type TradeOutcomeDriverImpact,
  type TradeOutcomeExplanation,
  type TradeOutcomePrimaryDriver,
} from "@/lib/trade-outcome-explainer";
import {
  buildSessionCoach,
  type SessionCoachResult,
  type SessionCoachStatus,
  type SessionCoachTheme,
  type SessionCoachTone,
} from "@/lib/session-coach";
import {
  buildCooldownAdvisory,
  type CooldownAdvisoryLevel,
  type CooldownAdvisoryReasonSeverity,
  type CooldownAdvisoryResult,
} from "@/lib/cooldown-advisory";
import {
  calculateSessionQualityScore,
  type SessionQualityFactorImpact,
  type SessionQualityGrade,
  type SessionQualityScoreResult,
} from "@/lib/session-quality-score";
import {
  buildPreTradeRiskContext,
  type PreTradeRiskContextLevel,
  type PreTradeRiskContextResult,
} from "@/lib/pre-trade-risk-context";
import {
  buildTradeEligibility,
  type TradeEligibilityResult,
  type TradeEligibilitySignalImpact,
  type TradeEligibilityStatus,
} from "@/lib/trade-eligibility";
import {
  buildRecommendationDecisionStack,
  type RecommendationDecisionStackResult,
  type RecommendationDecisionStackStatus,
} from "@/lib/recommendation-decision-stack";
import {
  calculateAgentReadiness,
  type AgentReadinessResult,
  type AgentReadinessStatus,
} from "@/lib/agent-readiness";
import {
  runAgentDryRun,
  type AgentDryRunResult,
  type AgentDryRunStatus,
  type AgentDryRunStepStatus,
} from "@/lib/agent-dry-run";
import {
  checkHandoffIntegrity,
  toHandoffIntegritySnapshot,
  type HandoffIntegrityResult,
  type HandoffIntegrityStatus,
  type HandoffIntegrityIssueSeverity,
} from "@/lib/handoff-integrity";
import {
  type DiscardDecisionQuality,
  type DiscardOutcome,
  type DiscardReviewStatus,
} from "@/lib/discard-review-types";
import {
  parseScanLogFromMessage,
  type PreMarketCandidate,
  type ScanLogEntry,
  type ScanLogResult,
  type ScanLogRunRow,
} from "@/lib/scan-logs";
import {
  getSetupTypeDescription,
  getSetupTypeLabel,
  normalizeSetupType,
  type SetupType,
} from "@/lib/setup-types";
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
  recommendations?: { setup_type: string | null; invalidation?: string | null } | null;
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
  execution_metadata?: unknown;
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
  reason?: string;
  warnings?: string[];
  intraday_indicators?: IntradayIndicators | null;
};

type GenerateRecommendationsResult = {
  recommendations?: RecommendationRow[];
  inserted_count?: number;
  inserted_tickers?: string[];
  pre_market_candidates?: PreMarketCandidate[];
  duplicate_fallback_used?: boolean;
  market_regime?: MarketRegime;
  market_status?: MarketStatus;
  scan_window?: IntradayScanWindow;
  scan_window_label?: string;
  scan_log?: {
    result?: string;
    no_trade_reason?: string | null;
  };
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

type DailySessionSummaryStatus = "pending" | "generated" | "skipped" | "error";

type DailySessionSummary = {
  date: string;
  marketStatus: string | null;
  summaryStatus: DailySessionSummaryStatus;
  openDayTradesAfterClose: boolean;
  actualTradesCount: number;
  closedTradesCount: number;
  totalPnl: number | null;
  totalR: number | null;
  winRate: number | null;
  averageR: number | null;
  bestTradeR: number | null;
  worstTradeR: number | null;
  recommendationsCreated: number;
  recommendationsAdded: number;
  recommendationsDiscarded: number;
  recommendationsExpired: number;
  recommendationConversionRate: number | null;
  discardedReviewed: number;
  correctDiscards: number;
  missedWinners: number;
  missedOpportunities: number;
  averageDiscardTheoreticalR: number | null;
  totalScans: number;
  noTradeScans: number;
  skippedScans: number;
  providerErrors: number;
  averageTopCandidateScore: number | null;
  lastScanResult: ScanLogResult | null;
  recommendationSetupBreakdown: SetupTypeBreakdownItem[];
  closedTradeSetupBreakdown: SetupTypeBreakdownItem[];
  discardedSetupBreakdown: SetupTypeBreakdownItem[];
  executionQualitySummary: ExecutionQualitySummary;
  brokerPreviewSummary: BrokerPreviewSummary;
  handoffTimelineSummary: HandoffTimelineSummary;
  tradeOutcomeSummary: TradeOutcomeSummary;
  sessionCoach: SessionCoachResult;
  cooldownAdvisory: CooldownAdvisoryResult;
  sessionQualityScore: SessionQualityScoreResult;
  keyTakeaways: string[];
  warnings: string[];
};

type SetupTypeBreakdownItem = {
  setupType: SetupType;
  label: string;
  count: number;
};

type ExecutionQualityBySetupItem = {
  setupType: SetupType;
  label: string;
  count: number;
  averageSlippagePercent: number | null;
};

type ExecutionQualitySummary = {
  tradesWithMetadata: number;
  averageSlippagePercent: number | null;
  averageSlippageBps: number | null;
  betterFills: number;
  worseFills: number;
  partialFills: number;
  estimatedTotalTradingCosts: number | null;
  estimatedAverageCostPerTrade: number | null;
  estimatedAverageNetR: number | null;
  ratingCounts: Record<ExecutionQualityRating, number>;
  setupBreakdown: ExecutionQualityBySetupItem[];
};

type BrokerPreviewSummary = {
  capturedCount: number;
  warningCount: number;
  buyingPowerIssueCount: number;
  averageTotalCostDifference: number | null;
};

type HandoffTimelineSummary = {
  closedWithExecutionMetadata: number;
  withPayloadEvent: number;
  withBrokerPreviewEvent: number;
  withManualConfirmationEvent: number;
  withActualFillMetadata: number;
  handoffSessionsObserved: number;
  sessionsWithDryRun: number;
  sessionsWithManualConfirmation: number;
  sessionsWithLiveTradeCreated: number;
  agentDryRunsCompleted: number;
  agentDryRunsPassed: number;
  agentDryRunsFailed: number;
  agentDryRunsWithWarnings: number;
  handoffIntegrityChecksCompleted: number;
  handoffIntegrityPassed: number;
  handoffIntegrityWarnings: number;
  handoffIntegrityFailed: number;
  handoffReplaysComplete: number;
  handoffReplaysPartial: number;
  handoffReplaysFailed: number;
  handoffReplaysUnknown: number;
  averageHandoffQualityScore: number | null;
  handoffQualityRatingCounts: Record<HandoffQualityRating, number>;
  handoffQualityTopFactors: { code: string; count: number }[];
  totalImprovementSuggestions: number;
  highPriorityImprovementSuggestions: number;
  topImprovementSuggestionCodes: { code: string; count: number }[];
  topImprovementCategories: { category: ExecutionImprovementCategory; count: number }[];
};

type TradeOutcomeSummary = {
  strongWins: number;
  smallWins: number;
  breakeven: number;
  smallLosses: number;
  hardLosses: number;
  unknown: number;
  mostCommonPrimaryDriver: TradeOutcomePrimaryDriver | null;
  mostCommonNegativeDriver: string | null;
};

type Recommendation = {
  id: string;
  sessionType: SessionType;
  sessionLabel: string;
  ticker: string;
  companyName: string;
  direction: Direction;
  setupType: SetupType;
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
  intradayIndicators: IntradayIndicators | null;
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

type IntradayConfirmationStatus = {
  status: "confirmed" | "mixed" | "weak" | "unknown";
  severity: "none" | "warning" | "block";
  reasons: string[];
};

type AddTradeValidationResult = {
  status: "valid" | "warning" | "blocked" | "unavailable";
  reason: string;
  reasons: string[];
  latestIndicators: IntradayIndicators | null;
  indicatorSource: "cache" | "fresh" | "unavailable";
  stale: boolean;
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

type BrokerFillConfirmation = {
  brokerOrderStatus: BrokerOrderStatus;
  actualFillPrice: number;
  actualShares: number;
  brokerReferenceNote: string | null;
  brokerConfirmedAt: string;
  plannedEntryPrice: number | null;
  plannedShares: number | null;
  plannedStopLoss: number | null;
  plannedTargetPrice: number | null;
  plannedPositionValue: number | null;
  plannedMaxLossAtStop: number | null;
  actualPositionValue: number | null;
  actualMaxLossAtStop: number | null;
  actualRiskPerShare: number | null;
  payloadId: string;
  payloadFingerprint: string;
  handoffSessionId: string;
  setupType: SetupType;
  validationStatus: TradeExecutionPayload["validation_status"];
  executionPayloadVersion: TradeExecutionPayload["payload_version"];
  brokerCostModelSnapshot: BrokerCostModel | null;
  brokerCostEstimate: BrokerCostEstimate | null;
  brokerOrderPreview: BrokerOrderPreviewCapture | null;
  handoffIntegrity: HandoffIntegrityResult;
};

type ActivePosition = {
  id: string;
  recommendationId: string | null;
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
  invalidation: string;
  openedAt: string;
  openedAtRaw: string | null;
  executionMetadata: BrokerExecutionMetadata | null;
};

type ClosedPosition = ActivePosition & {
  setupType: SetupType;
  exitPrice: string;
  pnl: string;
  pnlPercent: string;
  rMultiple: string;
  closedAt: string;
  closedAtRaw: string | null;
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
  estimatedTotalBrokerCosts: number | null;
  estimatedAverageCostPerTrade: number | null;
  estimatedNetPnlAfterCosts: number | null;
};

type SetupPerformanceSummary = {
  setupType: SetupType;
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
  reason: string;
  warnings: string[];
  intradayIndicators: IntradayIndicators | null;
  updatedAt: string;
  updatedAtRaw: string | null;
};

type StalePositionStatus = "fresh" | "stale" | "very_stale";

type EndOfDaySafetyStatus = {
  status: "ok" | "approaching_close" | "review_required" | "overnight_risk";
  severity: "none" | "warning" | "critical";
  message: string;
  reasons: string[];
};

type NotificationSoundType =
  | "recommendation"
  | "position_update"
  | "warning"
  | "critical";

type PositionUpdateUrgency = {
  urgency: "normal" | "warning" | "critical";
  reasons: string[];
  shouldPlaySound: boolean;
  soundType: Exclude<NotificationSoundType, "recommendation">;
};

const primaryTabs: Tab[] = ["Recommendations", "Live Day Trades"];
const secondaryTabs: Tab[] = ["Market", "History"];
const historyStatuses: RecommendationStatus[] = [
  "ignored",
  "discarded",
  "rejected",
  "watched",
  "taken",
];
const confidenceMetadataPrefix = "\n\n[confidence_meta:";
const discardMetadataPrefix = "\n\n[discard_meta:";
const autoRefreshLiveTradesStorageKey = "trade_auto_refresh_live_trades";
const dismissedWarningsStorageKey = "trade-dismissed-warnings";
const liveTradesAutoRefreshIntervalMs = 5 * 60 * 1000;
const liveTradesNearCloseAutoRefreshIntervalMs = 2 * 60 * 1000;

const text = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
};

const enableSoundAlerts = true;
// TODO: Persist enable_sound_alerts in user settings.

function warningDismissKey(parts: Array<string | number | null | undefined>) {
  const normalized = parts
    .map((part) => text(part, "unknown").replace(/\s+/g, "_").toLowerCase())
    .filter(Boolean)
    .join(":");

  return normalized || "unknown-warning";
}

function readDismissedWarnings() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(dismissedWarningsStorageKey) ?? "[]",
    );

    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [],
    );
  } catch {
    return new Set<string>();
  }
}

function writeDismissedWarning(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const dismissedWarnings = readDismissedWarnings();
    dismissedWarnings.add(key);
    window.localStorage.setItem(
      dismissedWarningsStorageKey,
      JSON.stringify(Array.from(dismissedWarnings).slice(-250)),
    );
  } catch {
    // Local UI dismiss only; if storage is unavailable the warning simply stays visible.
  }
}

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
    const now = audioContext.currentTime;
    const notes =
      type === "critical"
        ? [
            { frequency: 740, offset: 0, duration: 0.13, gain: 0.055 },
            { frequency: 980, offset: 0.15, duration: 0.16, gain: 0.055 },
          ]
        : type === "warning"
          ? [
              { frequency: 620, offset: 0, duration: 0.1, gain: 0.04 },
              { frequency: 760, offset: 0.12, duration: 0.1, gain: 0.04 },
            ]
          : [
              {
                frequency: type === "recommendation" ? 880 : 660,
                offset: 0,
                duration: 0.18,
                gain: type === "recommendation" ? 0.045 : 0.035,
              },
            ];

    for (const note of notes) {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const start = now + note.offset;
      const end = start + note.duration;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(note.frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(
        note.frequency * 1.18,
        start + note.duration * 0.45,
      );
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(note.gain, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(end + 0.02);
    }

    window.setTimeout(() => {
      void audioContext.close().catch(() => undefined);
    }, 450);
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

function formatSek(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
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

function getNewYorkTimeInMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
    timeZone: "America/New_York",
  }).formatToParts(date);

  const valueByType = new Map(parts.map((part) => [part.type, part.value]));

  return (
    Number(valueByType.get("hour") ?? "0") * 60 +
    Number(valueByType.get("minute") ?? "0")
  );
}

function getNewYorkDateFromIso(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return getNewYorkDateString(date);
}

function timeToMinutes(value: string | null) {
  const match = value?.match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function getTopMarketStatus(
  marketStatus: MarketStatus | null,
  now = new Date(),
): TopMarketStatus {
  if (!marketStatus || marketStatus.dayType === "unknown") {
    return "unknown";
  }

  if (!marketStatus.isOpenDay) {
    return "closed_today";
  }

  const openMinutes = timeToMinutes(marketStatus.marketOpenTime) ?? 9 * 60 + 30;
  const closeMinutes = timeToMinutes(marketStatus.marketCloseTime) ?? 16 * 60;
  const nowMinutes = getNewYorkTimeInMinutes(now);

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
  now = new Date(),
) {
  const nowMinutes = getNewYorkTimeInMinutes(now);

  if (!marketStatus || marketStatus.dayType === "unknown") {
    return "";
  }

  if (!marketStatus.isOpenDay || getTopMarketStatus(marketStatus, now) !== "open") {
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

function getEndOfDaySafetyStatus(
  position: ActivePosition,
  marketStatus: MarketStatus | null,
  now = new Date(),
): EndOfDaySafetyStatus {
  const nowMinutes = getNewYorkTimeInMinutes(now);
  const warningStart = 15 * 60 + 30;
  const finalMinutesStart = 15 * 60 + 45;
  const closeMinutes = timeToMinutes(marketStatus?.marketCloseTime ?? null) ?? 16 * 60;
  const reasons: string[] = [];
  const today = getNewYorkDateString(now);
  const openedDate = getNewYorkDateFromIso(position.openedAtRaw);
  const isOldPosition =
    openedDate !== null ? openedDate < today : nowMinutes >= finalMinutesStart;

  function result(
    status: EndOfDaySafetyStatus["status"],
    severity: EndOfDaySafetyStatus["severity"],
    message: string,
    nextReasons: string[],
  ): EndOfDaySafetyStatus {
    return { status, severity, message, reasons: nextReasons };
  }

  if (!marketStatus || marketStatus.dayType === "unknown") {
    reasons.push("Market calendar status is unknown.");

    if (isOldPosition || nowMinutes >= finalMinutesStart) {
      return result(
        "review_required",
        "critical",
        "Final minutes of session. Day trade requires manual review.",
        reasons,
      );
    }

    if (nowMinutes >= warningStart) {
      return result(
        "approaching_close",
        "warning",
        "Market close approaching. Prepare exit plan.",
        reasons,
      );
    }

    return result("ok", "none", "EOD safety clear.", reasons);
  }

  if (!marketStatus.isOpenDay) {
    return result(
      "overnight_risk",
      "critical",
      "Day trade is still open after market close. Review immediately.",
      ["Market is closed today."],
    );
  }

  if (getTopMarketStatus(marketStatus, now) !== "open" || nowMinutes >= closeMinutes) {
    return result(
      "overnight_risk",
      "critical",
      "Day trade is still open after market close. Review immediately.",
      ["Market is closed while the day trade is still active."],
    );
  }

  if (nowMinutes >= finalMinutesStart && nowMinutes < closeMinutes) {
    return result(
      "review_required",
      "critical",
      "Final minutes of session. Day trade requires manual review.",
      ["Final minutes of the day trade session."],
    );
  }

  if (nowMinutes >= warningStart && nowMinutes < finalMinutesStart) {
    return result(
      "approaching_close",
      "warning",
      "Market close approaching. Prepare exit plan.",
      ["Market close is approaching."],
    );
  }

  return result("ok", "none", "EOD safety clear.", reasons);
}

function endOfDaySafetyLabel(status: EndOfDaySafetyStatus["status"]) {
  if (status === "approaching_close") return "APPROACHING CLOSE";
  if (status === "review_required") return "REVIEW REQUIRED";
  if (status === "overnight_risk") return "OVERNIGHT RISK";
  return "OK";
}

function eodSafetyPillClassName(status: EndOfDaySafetyStatus) {
  if (status.severity === "critical") {
    return "border-rose-300/45 bg-rose-300/15 text-rose-100";
  }

  if (status.severity === "warning") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-100";
  }

  return "border-[#00db94]/25 bg-[#00db94]/10 text-emerald-100";
}

function eodSafetyPanelClassName(status: EndOfDaySafetyStatus) {
  if (status.severity === "critical") {
    return "border-rose-300/35 bg-rose-300/10 text-rose-100";
  }

  if (status.severity === "warning") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-white/10 bg-black/20 text-zinc-400";
}

function getEndOfDayAcknowledgementKey(positionId: string, date: string) {
  return `eod_acknowledged_${positionId}_${date}`;
}

function readEndOfDayAcknowledgement(positionId: string, date: string) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(
      getEndOfDayAcknowledgementKey(positionId, date),
    ) === "true";
  } catch {
    return false;
  }
}

function writeEndOfDayAcknowledgement(
  positionId: string,
  date: string,
  acknowledged: boolean,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const key = getEndOfDayAcknowledgementKey(positionId, date);

    if (acknowledged) {
      window.localStorage.setItem(key, "true");
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Local acknowledgement is optional and must never hide the EOD risk.
  }
}

function getLiveTradesAutoRefreshIntervalMs(
  marketStatus: MarketStatus | null,
  now = new Date(),
) {
  const nowMinutes = getNewYorkTimeInMinutes(now);
  const warningStart = 15 * 60 + 30;
  const closeMinutes = timeToMinutes(marketStatus?.marketCloseTime ?? null) ?? 16 * 60;

  if (nowMinutes >= warningStart && nowMinutes < closeMinutes) {
    return liveTradesNearCloseAutoRefreshIntervalMs;
  }

  return liveTradesAutoRefreshIntervalMs;
}

function formatIntervalMinutes(intervalMs: number) {
  return `${Math.round(intervalMs / 60000)} min`;
}

function readAutoRefreshLiveTradesPreference() {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    return (
      window.localStorage.getItem(autoRefreshLiveTradesStorageKey) ?? "true"
    ) !== "false";
  } catch {
    return true;
  }
}

function writeAutoRefreshLiveTradesPreference(enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      autoRefreshLiveTradesStorageKey,
      String(enabled),
    );
  } catch {
    // Local UI preference only.
  }
}

function getStalePositionWarning(
  latestUpdate: LatestPositionUpdate | undefined,
  isMarketOpen: boolean,
) {
  const status = getStalePositionStatus(latestUpdate, isMarketOpen);

  if (status === "very_stale") {
    return "Position data is very stale. Do not rely on this signal without refreshing.";
  }

  if (status === "stale") {
    return "Position data is stale. Refresh live positions.";
  }

  return "";
}

function getStalePositionStatus(
  latestUpdate: LatestPositionUpdate | undefined,
  isMarketOpen: boolean,
): StalePositionStatus {
  if (!isMarketOpen) {
    return "fresh";
  }

  if (!latestUpdate?.updatedAtRaw) {
    return "stale";
  }

  const updatedAt = new Date(latestUpdate.updatedAtRaw).getTime();

  if (Number.isNaN(updatedAt)) {
    return "stale";
  }

  const ageMinutes = (Date.now() - updatedAt) / (60 * 1000);

  if (ageMinutes > 30) {
    return "very_stale";
  }

  if (ageMinutes > 15) {
    return "stale";
  }

  return "fresh";
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
  return normalizeSetupType(row.recommendations?.setup_type);
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
    intradayIndicators: parseIntradayIndicators(
      parsed?.intraday_indicators as Partial<IntradayIndicators> | null,
    ),
    setupType: normalizeSetupType(parsed?.setup_type),
  };
}

function parseIntradayIndicators(
  value: Partial<IntradayIndicators> | null | undefined,
): IntradayIndicators | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  return {
    vwap: parseNumber(value.vwap),
    latestPrice: parseNumber(value.latestPrice),
    priceVsVwapPercent: parseNumber(value.priceVsVwapPercent),
    isAboveVwap:
      typeof value.isAboveVwap === "boolean" ? value.isAboveVwap : null,
    recentHigh: parseNumber(value.recentHigh),
    recentLow: parseNumber(value.recentLow),
    recentRangePercent: parseNumber(value.recentRangePercent),
    momentumPercent: parseNumber(value.momentumPercent),
    momentumDirection:
      value.momentumDirection === "up" ||
      value.momentumDirection === "down" ||
      value.momentumDirection === "flat"
        ? value.momentumDirection
        : "unknown",
    volumeTrend:
      value.volumeTrend === "expanding" ||
      value.volumeTrend === "contracting" ||
      value.volumeTrend === "flat"
        ? value.volumeTrend
        : "unknown",
    latestVolume: parseNumber(value.latestVolume),
    averageVolume: parseNumber(value.averageVolume),
    warnings: Array.isArray(value.warnings)
      ? value.warnings.filter((item): item is string => typeof item === "string")
      : [],
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
    setupType: normalizeSetupType(parsed?.setup_type),
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
    intraday_indicators: recommendation.intradayIndicators,
    setup_type: recommendation.setupType,
  })}]`;
}

function buildDiscardMetadata(discardedAt: string, recommendation: Recommendation) {
  return `${discardMetadataPrefix}${JSON.stringify({
    discarded_at: discardedAt,
    discard_review_status: "pending",
    discard_reviewed_at: null,
    discard_outcome: null,
    discard_theoretical_r: null,
    discard_decision_quality: null,
    archived_reason: "user_discarded",
    setup_type: recommendation.setupType,
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
  if (value === "NO_ACTION") return "REVIEW TRADE";
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

function urgencyRank(urgency: PositionUpdateUrgency["urgency"]) {
  if (urgency === "critical") return 3;
  if (urgency === "warning") return 2;
  return 1;
}

function highestUrgency(
  first: PositionUpdateUrgency["urgency"],
  second: PositionUpdateUrgency["urgency"],
) {
  return urgencyRank(second) > urgencyRank(first) ? second : first;
}

function positionUrgencyClassName(urgency: PositionUpdateUrgency["urgency"]) {
  if (urgency === "critical") {
    return "border-rose-300/45 bg-rose-300/[0.075] shadow-[0_0_0_1px_rgba(244,63,94,0.08),0_0_28px_rgba(244,63,94,0.08)]";
  }

  if (urgency === "warning") {
    return "border-amber-300/35 bg-amber-300/[0.055]";
  }

  return "border-[#00db94]/20 bg-[#00db94]/[0.045]";
}

function getPositionUpdateUrgency({
  position,
  latestUpdate,
  warnings,
  staleStatus,
  marketCloseWarning,
  eodSafetyStatus,
}: {
  position: ActivePosition;
  latestUpdate?: LatestPositionUpdate;
  warnings: string[];
  staleStatus: StalePositionStatus;
  marketCloseWarning: string;
  eodSafetyStatus: EndOfDaySafetyStatus;
}): PositionUpdateUrgency {
  const reasons: string[] = [];
  const action = latestUpdate?.action ?? "HOLD";
  let urgency: PositionUpdateUrgency["urgency"] = "normal";
  let soundType: PositionUpdateUrgency["soundType"] = "position_update";
  const currentPrice = latestUpdate?.currentPriceValue ?? null;

  function setUrgency(
    nextUrgency: PositionUpdateUrgency["urgency"],
    reason: string,
  ) {
    urgency = highestUrgency(urgency, nextUrgency);
    soundType =
      urgency === "critical"
        ? "critical"
        : urgency === "warning"
          ? "warning"
          : "position_update";
    if (!reasons.includes(reason)) {
      reasons.push(reason);
    }
  }

  if (action === "CLOSE_POSITION") {
    setUrgency("critical", "Rule engine recommends closing the position.");
  } else if (action === "TAKE_PROFIT") {
    setUrgency("critical", "Target area reached.");
  } else if (action === "TAKE_PARTIAL_PROFIT") {
    setUrgency("warning", "Partial profit management is recommended.");
  } else if (action === "MOVE_STOP_TO_BREAKEVEN" && warnings.length > 0) {
    setUrgency("warning", "Stop management has additional risk warnings.");
  }

  if (staleStatus === "very_stale") {
    setUrgency("critical", "Position data is very stale during market hours.");
  } else if (staleStatus === "stale") {
    setUrgency("warning", "Position data is stale.");
  }

  const normalizedWarnings = warnings.join(" ").toLowerCase();
  if (
    normalizedWarnings.includes("below vwap") ||
    normalizedWarnings.includes("momentum") ||
    normalizedWarnings.includes("invalidation")
  ) {
    setUrgency("warning", "Intraday confirmation is weakening.");
  }

  if (
    normalizedWarnings.includes("stop loss") ||
    normalizedWarnings.includes("breached")
  ) {
    setUrgency("critical", "Stop loss or invalidation warning is active.");
  }

  const normalizedMarketWarning = marketCloseWarning.toLowerCase();
  if (
    normalizedMarketWarning.includes("final minutes") ||
    normalizedMarketWarning.includes("market is closed")
  ) {
    setUrgency("critical", "Session timing requires immediate review.");
  } else if (normalizedMarketWarning.includes("approaching")) {
    setUrgency("warning", "Market close is approaching.");
  }

  if (eodSafetyStatus.status === "overnight_risk") {
    setUrgency("critical", "Day trade remains open after market close.");
  } else if (eodSafetyStatus.status === "review_required") {
    setUrgency("critical", "End-of-day review is required.");
  } else if (eodSafetyStatus.status === "approaching_close") {
    setUrgency("warning", "End-of-day exit planning is needed.");
  }

  if (
    currentPrice !== null &&
    position.stopLossValue !== null &&
    ((position.direction === "Long" && currentPrice <= position.stopLossValue) ||
      (position.direction === "Short" && currentPrice >= position.stopLossValue))
  ) {
    setUrgency("critical", "Latest price is at or beyond the stop area.");
  }

  const invalidationLevel = parseNumber(position.invalidation);
  if (
    currentPrice !== null &&
    invalidationLevel !== null &&
    ((position.direction === "Long" && currentPrice <= invalidationLevel) ||
      (position.direction === "Short" && currentPrice >= invalidationLevel))
  ) {
    setUrgency("critical", "Intraday invalidation level appears breached.");
  }

  return {
    urgency,
    reasons,
    shouldPlaySound: soundType !== "position_update",
    soundType,
  };
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

function getIntradayConfirmationStatus(
  recommendation: Recommendation,
): IntradayConfirmationStatus {
  const indicators = recommendation.intradayIndicators;

  if (!indicators) {
    return {
      status: "unknown",
      severity: "warning",
      reasons: ["Intraday confirmation data is unavailable."],
    };
  }

  const reasons: string[] = [];
  let weakSignals = 0;
  let mixedSignals = 0;

  if (indicators.isAboveVwap === true) {
    reasons.push("Price is above VWAP.");
  } else if (indicators.isAboveVwap === false) {
    weakSignals += 1;
    reasons.push("Price is below VWAP.");
  } else {
    mixedSignals += 1;
    reasons.push("VWAP confirmation is unknown.");
  }

  if (indicators.momentumDirection === "up") {
    reasons.push("Intraday momentum is up.");
  } else if (indicators.momentumDirection === "flat") {
    mixedSignals += 1;
    reasons.push("Intraday momentum is flat.");
  } else if (indicators.momentumDirection === "down") {
    weakSignals += 1;
    reasons.push("Intraday momentum is down.");
  } else {
    mixedSignals += 1;
    reasons.push("Momentum confirmation is unknown.");
  }

  if (indicators.volumeTrend === "expanding") {
    reasons.push("Intraday volume is expanding.");
  } else if (indicators.volumeTrend === "flat") {
    mixedSignals += 1;
    reasons.push("Intraday volume is flat.");
  } else if (indicators.volumeTrend === "contracting") {
    weakSignals += 1;
    reasons.push("Intraday volume is contracting.");
  } else {
    mixedSignals += 1;
    reasons.push("Volume trend is unknown.");
  }

  if (indicators.warnings.length > 1) {
    weakSignals += 1;
    reasons.push("Indicator warnings are present.");
  }

  if (weakSignals >= 2) {
    return { status: "weak", severity: "block", reasons };
  }

  if (weakSignals === 1 || mixedSignals > 0) {
    return { status: "mixed", severity: "warning", reasons };
  }

  return { status: "confirmed", severity: "none", reasons };
}

function getAddTradeGate(
  recommendation: Recommendation,
  freshness: ReturnType<typeof getRecommendationFreshness>,
) {
  const confirmation = getIntradayConfirmationStatus(recommendation);

  if (freshness === "expired") {
    return {
      confirmation,
      blocked: true,
      message:
        "This setup has expired. Generate a fresh recommendation before taking the trade.",
    };
  }

  if (
    freshness === "stale" &&
    (confirmation.status === "weak" || confirmation.status === "mixed")
  ) {
    return {
      confirmation,
      blocked: true,
      message:
        "Setup is stale and intraday confirmation is not clean. Refresh scanner or generate a fresh recommendation before entering.",
    };
  }

  if (confirmation.status === "weak") {
    return {
      confirmation,
      blocked: true,
      message:
        "Setup has weak intraday confirmation. Refresh scanner or generate a fresh recommendation before adding this trade.",
    };
  }

  if (freshness === "stale" && confirmation.status === "confirmed") {
    return {
      confirmation,
      blocked: false,
      message: "Setup is stale. Confirm price action before entering.",
    };
  }

  if (confirmation.status === "mixed") {
    return {
      confirmation,
      blocked: false,
      message:
        "Intraday confirmation is mixed. Review VWAP, momentum, and volume before entering.",
    };
  }

  if (confirmation.status === "unknown") {
    return {
      confirmation,
      blocked: false,
      message:
        "Intraday confirmation data is unavailable. Review manually before entering.",
    };
  }

  return { confirmation, blocked: false, message: "" };
}

function intradayConfirmationLabel(status: IntradayConfirmationStatus["status"]) {
  return status.toUpperCase();
}

function intradayConfirmationClassName(
  status: IntradayConfirmationStatus["status"],
) {
  if (status === "confirmed") {
    return "border-[#00db94]/30 bg-[#00db94]/10 text-emerald-100";
  }

  if (status === "mixed" || status === "unknown") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/35 bg-rose-300/10 text-rose-100";
}

function vwapLabel(indicators: IntradayIndicators | null) {
  if (!indicators || indicators.isAboveVwap === null) return "Unknown";
  return indicators.isAboveVwap ? "Above" : "Below";
}

function titleCaseValue(value: string) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : "Unknown";
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

function formatBasisPoints(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)} bps`;
}

function formatFillRatio(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${(value * 100).toFixed(0)}%`;
}

function formatSignedR(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}R`;
}

function getRecommendationEntryFallback(recommendation: Recommendation) {
  if (
    recommendation.entryLowValue !== null &&
    recommendation.entryHighValue !== null
  ) {
    return (recommendation.entryLowValue + recommendation.entryHighValue) / 2;
  }

  return recommendation.entryHighValue ?? recommendation.entryLowValue;
}

function getPrimaryTargetPrice(recommendation: Recommendation) {
  return parseNumber(recommendation.target1) ?? parseNumber(recommendation.target2);
}

function tradeExecutionPayloadJson(payload: TradeExecutionPayload) {
  return JSON.stringify(payload, null, 2);
}

function getPayloadSecondsUntilExpiry(payload: TradeExecutionPayload, now: Date) {
  const expiresAt = new Date(payload.expires_at).getTime();

  if (!Number.isFinite(expiresAt)) {
    return 0;
  }

  return Math.max(0, Math.ceil((expiresAt - now.getTime()) / 1000));
}

function formatPayloadExpiry(payload: TradeExecutionPayload, now: Date) {
  const seconds = getPayloadSecondsUntilExpiry(payload, now);

  if (seconds <= 0) {
    return "Expired";
  }

  return `${seconds}s`;
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
  const rowSetupType = normalizeSetupType(row.setup_type);
  const metadataSetupType =
    confidenceMetadata.setupType !== "UNKNOWN"
      ? confidenceMetadata.setupType
      : discardMetadata.setupType;

  return {
    id: row.id,
    sessionType: recommendationSessionType,
    sessionLabel: sessionLabel(recommendationSessionType),
    ticker: row.ticker,
    companyName: text(row.company_name),
    direction: direction(row.direction),
    setupType:
      rowSetupType === "UNKNOWN" ? metadataSetupType : rowSetupType,
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
    intradayIndicators: confidenceMetadata.intradayIndicators,
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
    recommendationId: row.recommendation_id ?? null,
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
    invalidation: text(row.recommendations?.invalidation),
    openedAt: formatDate(row.created_at),
    openedAtRaw: row.created_at ?? null,
    executionMetadata: parseBrokerExecutionMetadata(row.execution_metadata),
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
    closedAtRaw: row.closed_at ?? null,
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

function calculateSetupTypeBreakdown(
  items: { setupType: SetupType }[],
): SetupTypeBreakdownItem[] {
  const counts = new Map<SetupType, number>();

  for (const item of items) {
    const setupType = normalizeSetupType(item.setupType);
    counts.set(setupType, (counts.get(setupType) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([setupType, count]) => ({
      setupType,
      label: getSetupTypeLabel(setupType),
      count,
    }))
    .sort((first, second) => second.count - first.count);
}

function formatSetupTypeBreakdown(items: SetupTypeBreakdownItem[]) {
  return items.length === 0
    ? "—"
    : items
        .slice(0, 3)
        .map((item) => `${item.label} ${item.count}`)
        .join(" · ");
}

function calculateExecutionQualitySummary(
  closedTrades: ClosedPosition[],
): ExecutionQualitySummary {
  const metrics = closedTrades
    .map((trade) => calculateExecutionQuality(trade.executionMetadata))
    .filter((metric) => metric.warnings[0] !== "Execution metadata missing.");
  const slippagePercentValues = metrics
    .map((metric) => metric.slippage_percent)
    .filter((value): value is number => value !== null);
  const slippageBpsValues = metrics
    .map((metric) => metric.slippage_bps)
    .filter((value): value is number => value !== null);
  const costValues = metrics
    .map((metric) => metric.estimated_total_trading_cost)
    .filter((value): value is number => value !== null);
  const netRValues = metrics
    .map((metric) => metric.estimated_net_r)
    .filter((value): value is number => value !== null);
  const ratingCounts: Record<ExecutionQualityRating, number> = {
    excellent: 0,
    good: 0,
    acceptable: 0,
    poor: 0,
    unknown: 0,
  };
  const bySetup = new Map<SetupType, ExecutionQualityMetrics[]>();

  for (const metric of metrics) {
    ratingCounts[metric.quality_rating] += 1;
    const setupType = normalizeSetupType(metric.setup_type);
    bySetup.set(setupType, [...(bySetup.get(setupType) ?? []), metric]);
  }

  return {
    tradesWithMetadata: metrics.length,
    averageSlippagePercent: average(slippagePercentValues),
    averageSlippageBps: average(slippageBpsValues),
    betterFills: metrics.filter((metric) => metric.slippage_direction === "better")
      .length,
    worseFills: metrics.filter((metric) => metric.slippage_direction === "worse")
      .length,
    partialFills: metrics.filter((metric) => metric.is_partial_fill).length,
    estimatedTotalTradingCosts:
      costValues.length > 0
        ? costValues.reduce((sum, value) => sum + value, 0)
        : null,
    estimatedAverageCostPerTrade: average(costValues),
    estimatedAverageNetR: average(netRValues),
    ratingCounts,
    setupBreakdown: Array.from(bySetup.entries())
      .map(([setupType, setupMetrics]) => ({
        setupType,
        label: getSetupTypeLabel(setupType),
        count: setupMetrics.length,
        averageSlippagePercent: average(
          setupMetrics
            .map((metric) => metric.slippage_percent)
            .filter((value): value is number => value !== null),
        ),
      }))
      .sort((first, second) => second.count - first.count),
  };
}

function calculateBrokerPreviewSummary(
  closedTrades: ClosedPosition[],
): BrokerPreviewSummary {
  const previews = closedTrades
    .map((trade) => trade.executionMetadata)
    .filter((metadata): metadata is BrokerExecutionMetadata =>
      Boolean(metadata?.broker_order_preview),
    );
  const totalCostDifferences = previews
    .map((metadata) => calculateBrokerPreviewDifference(metadata).total_cost_difference)
    .filter((value): value is number => value !== null);

  return {
    capturedCount: previews.length,
    warningCount: previews.filter(
      (metadata) => metadata.broker_order_preview?.warning_type !== "none",
    ).length,
    buyingPowerIssueCount: previews.filter((metadata) => {
      const status = metadata.broker_order_preview?.buying_power_status;
      return status === "warning" || status === "insufficient";
    }).length,
    averageTotalCostDifference: average(totalCostDifferences),
  };
}

function calculateHandoffTimelineSummary(
  closedTrades: ClosedPosition[],
  localEvents: unknown[],
): HandoffTimelineSummary {
  const timelines = closedTrades.map((trade) =>
    buildExecutionTimeline({
      positionId: trade.id,
      recommendationId: trade.recommendationId,
      ticker: trade.ticker,
      status: "closed",
      openedAt: trade.openedAtRaw,
      closedAt: trade.closedAtRaw,
      executionMetadata: trade.executionMetadata,
      localEvents,
    }),
  );
  const replays = closedTrades.map((trade, index) =>
    buildHandoffSessionReplay({
      executionMetadata: trade.executionMetadata,
      timelineEvents: timelines[index] ?? [],
      openedAt: trade.openedAtRaw,
      closedAt: trade.closedAtRaw,
    }),
  );
  const handoffQualityResults = closedTrades.map((trade, index) =>
    calculateHandoffQuality({
      executionMetadata: trade.executionMetadata,
      executionQualityMetrics: calculateExecutionQuality(trade.executionMetadata),
      handoffReplay: replays[index],
      timelineEvents: timelines[index] ?? [],
      calculatedAt: trade.executionMetadata?.handoff_quality?.calculated_at,
    }),
  );
  const improvementResults = closedTrades.map((trade, index) =>
    buildExecutionImprovementSuggestions({
      brokerExecutionMetadata: trade.executionMetadata,
      handoffQuality: handoffQualityResults[index],
      executionQualityMetrics: calculateExecutionQuality(trade.executionMetadata),
      handoffReplay: replays[index],
      timelineEvents: timelines[index] ?? [],
    }),
  );
  const qualityScoreValues = handoffQualityResults
    .filter((result) => result.rating !== "unknown")
    .map((result) => result.score);
  const handoffQualityRatingCounts: Record<HandoffQualityRating, number> = {
    excellent: 0,
    good: 0,
    acceptable: 0,
    poor: 0,
    unknown: 0,
  };
  const qualityFactorCounts = new Map<string, number>();
  const improvementSuggestionCounts = new Map<string, number>();
  const improvementCategoryCounts = new Map<ExecutionImprovementCategory, number>();

  for (const result of handoffQualityResults) {
    handoffQualityRatingCounts[result.rating] += 1;

    for (const qualityFactor of result.factors) {
      if (
        qualityFactor.impact !== "warning" &&
        qualityFactor.impact !== "negative"
      ) {
        continue;
      }

      qualityFactorCounts.set(
        qualityFactor.code,
        (qualityFactorCounts.get(qualityFactor.code) ?? 0) + 1,
      );
    }
  }

  for (const result of improvementResults) {
    for (const suggestion of result.suggestions) {
      improvementSuggestionCounts.set(
        suggestion.code,
        (improvementSuggestionCounts.get(suggestion.code) ?? 0) + 1,
      );
      improvementCategoryCounts.set(
        suggestion.category,
        (improvementCategoryCounts.get(suggestion.category) ?? 0) + 1,
      );
    }
  }

  function hasEvent(timeline: ExecutionTimelineEvent[], type: ExecutionTimelineEvent["type"]) {
    return timeline.some((event) => event.type === type);
  }

  const dryRunEvents = timelines.flatMap((timeline) =>
    timeline.filter((event) => event.type === "agent_dry_run_completed"),
  );
  const integrityEvents = timelines.flatMap((timeline) =>
    timeline.filter(
      (event) =>
        event.type === "handoff_integrity_checked" ||
        event.type === "handoff_integrity_failed",
    ),
  );
  const eventsBySession = new Map<string, ExecutionTimelineEvent[]>();

  for (const timeline of timelines) {
    for (const event of timeline) {
      if (!event.handoff_session_id) {
        continue;
      }

      eventsBySession.set(event.handoff_session_id, [
        ...(eventsBySession.get(event.handoff_session_id) ?? []),
        event,
      ]);
    }
  }

  for (const trade of closedTrades) {
    const sessionId = trade.executionMetadata?.handoff_session_id;

    if (sessionId && !eventsBySession.has(sessionId)) {
      eventsBySession.set(sessionId, []);
    }
  }

  function metadataArrayLength(
    event: ExecutionTimelineEvent,
    key: "failed_step_ids" | "warning_step_ids",
  ) {
    const value = event.metadata?.[key];
    return Array.isArray(value) ? value.length : 0;
  }

  return {
    closedWithExecutionMetadata: closedTrades.filter(
      (trade) => trade.executionMetadata !== null,
    ).length,
    withPayloadEvent: timelines.filter((timeline) =>
      hasEvent(timeline, "execution_payload_generated"),
    ).length,
    withBrokerPreviewEvent: timelines.filter((timeline) =>
      hasEvent(timeline, "broker_order_preview_captured"),
    ).length,
    withManualConfirmationEvent: timelines.filter((timeline) =>
      hasEvent(timeline, "broker_manual_confirmation_checked"),
    ).length,
    withActualFillMetadata: closedTrades.filter(
      (trade) => trade.executionMetadata?.actual_fill_price !== null,
    ).length,
    handoffSessionsObserved: eventsBySession.size,
    sessionsWithDryRun: Array.from(eventsBySession.values()).filter((events) =>
      events.some((event) => event.type === "agent_dry_run_completed"),
    ).length,
    sessionsWithManualConfirmation: Array.from(eventsBySession.values()).filter(
      (events) =>
        events.some((event) => event.type === "broker_manual_confirmation_checked"),
    ).length,
    sessionsWithLiveTradeCreated: Array.from(eventsBySession.values()).filter(
      (events) =>
        events.some(
          (event) =>
            event.type === "live_day_trade_created_after_broker_confirmation",
        ),
    ).length,
    agentDryRunsCompleted: dryRunEvents.length,
    agentDryRunsPassed: dryRunEvents.filter(
      (event) => event.metadata?.dry_run_passed === true,
    ).length,
    agentDryRunsFailed: dryRunEvents.filter(
      (event) => event.metadata?.dry_run_passed === false,
    ).length,
    agentDryRunsWithWarnings: dryRunEvents.filter(
      (event) => metadataArrayLength(event, "warning_step_ids") > 0,
    ).length,
    handoffIntegrityChecksCompleted: integrityEvents.length,
    handoffIntegrityPassed: integrityEvents.filter(
      (event) =>
        event.metadata?.status === "passed" ||
        event.status === "completed",
    ).length,
    handoffIntegrityWarnings: integrityEvents.filter(
      (event) => event.metadata?.status === "warning",
    ).length,
    handoffIntegrityFailed: integrityEvents.filter(
      (event) =>
        event.metadata?.status === "failed" ||
        event.type === "handoff_integrity_failed",
    ).length,
    handoffReplaysComplete: replays.filter(
      (replay) => replay.overall_status === "complete",
    ).length,
    handoffReplaysPartial: replays.filter(
      (replay) => replay.overall_status === "partial",
    ).length,
    handoffReplaysFailed: replays.filter(
      (replay) => replay.overall_status === "failed",
    ).length,
    handoffReplaysUnknown: replays.filter(
      (replay) => replay.overall_status === "unknown",
    ).length,
    averageHandoffQualityScore: average(qualityScoreValues),
    handoffQualityRatingCounts,
    handoffQualityTopFactors: Array.from(qualityFactorCounts.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((first, second) => second.count - first.count)
      .slice(0, 3),
    totalImprovementSuggestions: improvementResults.reduce(
      (sum, result) => sum + result.suggestions.length,
      0,
    ),
    highPriorityImprovementSuggestions: improvementResults.reduce(
      (sum, result) =>
        sum +
        result.suggestions.filter((suggestion) => suggestion.priority === "high")
          .length,
      0,
    ),
    topImprovementSuggestionCodes: Array.from(improvementSuggestionCounts.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((first, second) => second.count - first.count)
      .slice(0, 3),
    topImprovementCategories: Array.from(improvementCategoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((first, second) => second.count - first.count)
      .slice(0, 3),
  };
}

function buildSetupExecutionFeedbackForHistory(
  closedTrades: ClosedPosition[],
  discardedSetups: Recommendation[],
  localEvents: unknown[],
): SetupExecutionFeedbackResult {
  const normalizedClosedTrades = closedTrades.map((trade) => {
    const timeline = buildExecutionTimeline({
      positionId: trade.id,
      recommendationId: trade.recommendationId,
      ticker: trade.ticker,
      status: "closed",
      openedAt: trade.openedAtRaw,
      closedAt: trade.closedAtRaw,
      executionMetadata: trade.executionMetadata,
      localEvents,
    });
    const replay = buildHandoffSessionReplay({
      executionMetadata: trade.executionMetadata,
      timelineEvents: timeline,
      openedAt: trade.openedAtRaw,
      closedAt: trade.closedAtRaw,
    });
    const executionQuality = calculateExecutionQuality(trade.executionMetadata);
    const handoffQuality = calculateHandoffQuality({
      executionMetadata: trade.executionMetadata,
      executionQualityMetrics: executionQuality,
      handoffReplay: replay,
      timelineEvents: timeline,
      calculatedAt: trade.executionMetadata?.handoff_quality?.calculated_at,
    });
    const suggestions = buildExecutionImprovementSuggestions({
      brokerExecutionMetadata: trade.executionMetadata,
      handoffQuality,
      executionQualityMetrics: executionQuality,
      handoffReplay: replay,
      timelineEvents: timeline,
    });

    return {
      setup_type: trade.setupType,
      pnl: trade.pnlValue,
      r_multiple: trade.rMultipleValue,
      handoff_quality_rating: handoffQuality.rating,
      handoff_quality_score: handoffQuality.score,
      execution_quality_rating: executionQuality.quality_rating,
      execution_slippage_bps: executionQuality.slippage_bps,
      high_priority_suggestion_count: suggestions.suggestions.filter(
        (suggestion) => suggestion.priority === "high",
      ).length,
    };
  });

  return buildSetupExecutionFeedback({
    closedTrades: normalizedClosedTrades,
    discardedSetups: discardedSetups.map((setup) => ({
      setup_type: setup.setupType,
      decision_quality: setup.discardDecisionQuality,
    })),
  });
}

function buildRecommendationCalibrationForHistory({
  recommendations,
  closedTrades,
  discardedSetups,
  scanLogs,
}: {
  recommendations: Recommendation[];
  closedTrades: ClosedPosition[];
  discardedSetups: Recommendation[];
  scanLogs: ScanLogEntry[];
}): RecommendationCalibrationResult {
  const recommendationById = new Map(
    recommendations.map((recommendation) => [recommendation.id, recommendation]),
  );

  return buildRecommendationCalibration({
    recommendations: recommendations.map((recommendation) => ({
      id: recommendation.id,
      setup_type: recommendation.setupType,
      confidence_score: recommendation.confidenceScore,
      status: recommendation.status,
    })),
    closedTrades: closedTrades.map((trade) => {
      const sourceRecommendation = trade.recommendationId
        ? recommendationById.get(trade.recommendationId)
        : null;

      return {
        recommendation_id: trade.recommendationId,
        setup_type:
          sourceRecommendation?.setupType ??
          trade.executionMetadata?.setup_type ??
          trade.setupType,
        confidence_score:
          sourceRecommendation?.confidenceScore ?? null,
        pnl: trade.pnlValue,
        r_multiple: trade.rMultipleValue,
      };
    }),
    discardedSetups: discardedSetups.map((setup) => ({
      id: setup.id,
      recommendation_id: setup.id,
      setup_type: setup.setupType,
      confidence_score: setup.confidenceScore,
      decision_quality: setup.discardDecisionQuality,
    })),
    scanLogs: scanLogs.map((scanLog) => ({
      result: scanLog.result,
      recommendations_created: scanLog.recommendations_created,
    })),
  });
}

function buildTradeOutcomeExplanationForPosition(
  position: ClosedPosition,
): TradeOutcomeExplanation {
  const localEvents = readTradeManagementEvents();
  const timeline = buildExecutionTimeline({
    positionId: position.id,
    recommendationId: position.recommendationId,
    ticker: position.ticker,
    status: "closed",
    openedAt: position.openedAtRaw,
    closedAt: position.closedAtRaw,
    executionMetadata: position.executionMetadata,
    localEvents,
  });
  const replay = buildHandoffSessionReplay({
    executionMetadata: position.executionMetadata,
    timelineEvents: timeline,
    openedAt: position.openedAtRaw,
    closedAt: position.closedAtRaw,
  });
  const executionQuality = calculateExecutionQuality(position.executionMetadata);
  const handoffQuality = calculateHandoffQuality({
    executionMetadata: position.executionMetadata,
    executionQualityMetrics: executionQuality,
    handoffReplay: replay,
    timelineEvents: timeline,
    calculatedAt: position.executionMetadata?.handoff_quality?.calculated_at,
  });
  const suggestions = buildExecutionImprovementSuggestions({
    brokerExecutionMetadata: position.executionMetadata,
    handoffQuality,
    executionQualityMetrics: executionQuality,
    handoffReplay: replay,
    timelineEvents: timeline,
  });

  return explainTradeOutcome({
    setup_type: position.setupType,
    pnl: position.pnlValue,
    r_multiple: position.rMultipleValue,
    entry_price: position.entryPriceValue,
    stop_loss: position.stopLossValue,
    target_price: position.target1Value ?? position.target2Value,
    exit_price: null,
    closed_at: position.closedAtRaw,
    execution_metadata: position.executionMetadata,
    execution_quality_metrics: executionQuality,
    handoff_quality: handoffQuality,
    improvement_suggestions: suggestions.suggestions,
  });
}

function calculateTradeOutcomeSummary(
  closedTrades: ClosedPosition[],
): TradeOutcomeSummary {
  const classificationCounts: Record<TradeOutcomeClassification, number> = {
    strong_win: 0,
    small_win: 0,
    breakeven: 0,
    small_loss: 0,
    hard_loss: 0,
    unknown: 0,
  };
  const primaryDriverCounts = new Map<TradeOutcomePrimaryDriver, number>();
  const negativeDriverCounts = new Map<string, number>();

  for (const trade of closedTrades) {
    const explanation = buildTradeOutcomeExplanationForPosition(trade);
    classificationCounts[explanation.classification] += 1;
    primaryDriverCounts.set(
      explanation.primary_driver,
      (primaryDriverCounts.get(explanation.primary_driver) ?? 0) + 1,
    );

    for (const driver of explanation.drivers) {
      if (driver.impact !== "negative") {
        continue;
      }

      negativeDriverCounts.set(
        driver.label,
        (negativeDriverCounts.get(driver.label) ?? 0) + 1,
      );
    }
  }

  const mostCommonPrimaryDriver =
    Array.from(primaryDriverCounts.entries()).sort(
      (first, second) => second[1] - first[1],
    )[0]?.[0] ?? null;
  const mostCommonNegativeDriver =
    Array.from(negativeDriverCounts.entries()).sort(
      (first, second) => second[1] - first[1],
    )[0]?.[0] ?? null;

  return {
    strongWins: classificationCounts.strong_win,
    smallWins: classificationCounts.small_win,
    breakeven: classificationCounts.breakeven,
    smallLosses: classificationCounts.small_loss,
    hardLosses: classificationCounts.hard_loss,
    unknown: classificationCounts.unknown,
    mostCommonPrimaryDriver,
    mostCommonNegativeDriver,
  };
}

function buildSessionCoachForDaily({
  closedTrades,
  liveTradesCount,
  scanLogs,
  guardrails,
  eodSafetyStatuses,
  marketStatus,
  currentScanWindow,
  localEvents,
}: {
  closedTrades: ClosedPosition[];
  liveTradesCount: number;
  scanLogs: ScanLogEntry[];
  guardrails: CalibrationGuardrail[];
  eodSafetyStatuses: EndOfDaySafetyStatus[];
  marketStatus: TopMarketStatus;
  currentScanWindow: IntradayScanWindow;
  localEvents: unknown[];
}): SessionCoachResult {
  const coachTrades = closedTrades.map((trade) => {
    const timeline = buildExecutionTimeline({
      positionId: trade.id,
      recommendationId: trade.recommendationId,
      ticker: trade.ticker,
      status: "closed",
      openedAt: trade.openedAtRaw,
      closedAt: trade.closedAtRaw,
      executionMetadata: trade.executionMetadata,
      localEvents,
    });
    const replay = buildHandoffSessionReplay({
      executionMetadata: trade.executionMetadata,
      timelineEvents: timeline,
      openedAt: trade.openedAtRaw,
      closedAt: trade.closedAtRaw,
    });
    const executionQuality = calculateExecutionQuality(trade.executionMetadata);
    const handoffQuality = calculateHandoffQuality({
      executionMetadata: trade.executionMetadata,
      executionQualityMetrics: executionQuality,
      handoffReplay: replay,
      timelineEvents: timeline,
      calculatedAt: trade.executionMetadata?.handoff_quality?.calculated_at,
    });
    const suggestions = buildExecutionImprovementSuggestions({
      brokerExecutionMetadata: trade.executionMetadata,
      handoffQuality,
      executionQualityMetrics: executionQuality,
      handoffReplay: replay,
      timelineEvents: timeline,
    });
    const outcome = explainTradeOutcome({
      setup_type: trade.setupType,
      pnl: trade.pnlValue,
      r_multiple: trade.rMultipleValue,
      entry_price: trade.entryPriceValue,
      stop_loss: trade.stopLossValue,
      target_price: trade.target1Value ?? trade.target2Value,
      closed_at: trade.closedAtRaw,
      execution_metadata: trade.executionMetadata,
      execution_quality_metrics: executionQuality,
      handoff_quality: handoffQuality,
      improvement_suggestions: suggestions.suggestions,
    });

    return {
      outcome_classification: outcome.classification,
      primary_driver: outcome.primary_driver,
      r_multiple: trade.rMultipleValue,
      pnl: trade.pnlValue,
      execution_quality_rating: executionQuality.quality_rating,
      handoff_quality_rating: handoffQuality.rating,
      high_priority_suggestion_count: suggestions.suggestions.filter(
        (suggestion) => suggestion.priority === "high",
      ).length,
    };
  });

  return buildSessionCoach({
    closedTrades: coachTrades,
    liveTradesCount,
    scanLogs: scanLogs.map((scanLog) => ({
      result: scanLog.result,
      recommendations_created: scanLog.recommendations_created,
    })),
    guardrails: guardrails.map((guardrail) => ({
      severity: guardrail.severity,
    })),
    eodSafetyStatuses: eodSafetyStatuses.map((status) => ({
      status: status.status,
    })),
    marketStatus,
    currentScanWindow,
  });
}

function buildCooldownAdvisoryForDaily({
  closedTrades,
  liveTradesCount,
  scanLogs,
  guardrails,
  eodSafetyStatuses,
  marketStatus,
  currentScanWindow,
  localEvents,
  sessionCoach,
}: {
  closedTrades: ClosedPosition[];
  liveTradesCount: number;
  scanLogs: ScanLogEntry[];
  guardrails: CalibrationGuardrail[];
  eodSafetyStatuses: EndOfDaySafetyStatus[];
  marketStatus: TopMarketStatus;
  currentScanWindow: IntradayScanWindow;
  localEvents: unknown[];
  sessionCoach: SessionCoachResult;
}): CooldownAdvisoryResult {
  const cooldownTrades = closedTrades.map((trade) => {
    const timeline = buildExecutionTimeline({
      positionId: trade.id,
      recommendationId: trade.recommendationId,
      ticker: trade.ticker,
      status: "closed",
      openedAt: trade.openedAtRaw,
      closedAt: trade.closedAtRaw,
      executionMetadata: trade.executionMetadata,
      localEvents,
    });
    const replay = buildHandoffSessionReplay({
      executionMetadata: trade.executionMetadata,
      timelineEvents: timeline,
      openedAt: trade.openedAtRaw,
      closedAt: trade.closedAtRaw,
    });
    const executionQuality = calculateExecutionQuality(trade.executionMetadata);
    const handoffQuality = calculateHandoffQuality({
      executionMetadata: trade.executionMetadata,
      executionQualityMetrics: executionQuality,
      handoffReplay: replay,
      timelineEvents: timeline,
      calculatedAt: trade.executionMetadata?.handoff_quality?.calculated_at,
    });
    const suggestions = buildExecutionImprovementSuggestions({
      brokerExecutionMetadata: trade.executionMetadata,
      handoffQuality,
      executionQualityMetrics: executionQuality,
      handoffReplay: replay,
      timelineEvents: timeline,
    });
    const outcome = explainTradeOutcome({
      setup_type: trade.setupType,
      pnl: trade.pnlValue,
      r_multiple: trade.rMultipleValue,
      entry_price: trade.entryPriceValue,
      stop_loss: trade.stopLossValue,
      target_price: trade.target1Value ?? trade.target2Value,
      closed_at: trade.closedAtRaw,
      execution_metadata: trade.executionMetadata,
      execution_quality_metrics: executionQuality,
      handoff_quality: handoffQuality,
      improvement_suggestions: suggestions.suggestions,
    });

    return {
      outcome_classification: outcome.classification,
      r_multiple: trade.rMultipleValue,
      execution_quality_rating: executionQuality.quality_rating,
      handoff_quality_rating: handoffQuality.rating,
      high_priority_suggestion_count: suggestions.suggestions.filter(
        (suggestion) => suggestion.priority === "high",
      ).length,
    };
  });

  return buildCooldownAdvisory({
    sessionCoach,
    closedTrades: cooldownTrades,
    liveTradesCount,
    scanLogs: scanLogs.map((scanLog) => ({
      result: scanLog.result,
      recommendations_created: scanLog.recommendations_created,
    })),
    guardrails: guardrails.map((guardrail) => ({
      severity: guardrail.severity,
    })),
    eodSafetyStatuses: eodSafetyStatuses.map((status) => ({
      status: status.status,
    })),
    marketStatus,
    currentScanWindow,
  });
}

function buildSessionQualityScoreForDaily({
  closedTrades,
  liveTradesCount,
  scanLogs,
  guardrails,
  eodSafetyStatuses,
  localEvents,
  sessionCoach,
  cooldownAdvisory,
  totalR,
  totalPnl,
}: {
  closedTrades: ClosedPosition[];
  liveTradesCount: number;
  scanLogs: ScanLogEntry[];
  guardrails: CalibrationGuardrail[];
  eodSafetyStatuses: EndOfDaySafetyStatus[];
  localEvents: unknown[];
  sessionCoach: SessionCoachResult;
  cooldownAdvisory: CooldownAdvisoryResult;
  totalR: number | null;
  totalPnl: number | null;
}): SessionQualityScoreResult {
  const qualityTrades = closedTrades.map((trade) => {
    const timeline = buildExecutionTimeline({
      positionId: trade.id,
      recommendationId: trade.recommendationId,
      ticker: trade.ticker,
      status: "closed",
      openedAt: trade.openedAtRaw,
      closedAt: trade.closedAtRaw,
      executionMetadata: trade.executionMetadata,
      localEvents,
    });
    const replay = buildHandoffSessionReplay({
      executionMetadata: trade.executionMetadata,
      timelineEvents: timeline,
      openedAt: trade.openedAtRaw,
      closedAt: trade.closedAtRaw,
    });
    const executionQuality = calculateExecutionQuality(trade.executionMetadata);
    const handoffQuality = calculateHandoffQuality({
      executionMetadata: trade.executionMetadata,
      executionQualityMetrics: executionQuality,
      handoffReplay: replay,
      timelineEvents: timeline,
      calculatedAt: trade.executionMetadata?.handoff_quality?.calculated_at,
    });
    const suggestions = buildExecutionImprovementSuggestions({
      brokerExecutionMetadata: trade.executionMetadata,
      handoffQuality,
      executionQualityMetrics: executionQuality,
      handoffReplay: replay,
      timelineEvents: timeline,
    });
    const outcome = explainTradeOutcome({
      setup_type: trade.setupType,
      pnl: trade.pnlValue,
      r_multiple: trade.rMultipleValue,
      entry_price: trade.entryPriceValue,
      stop_loss: trade.stopLossValue,
      target_price: trade.target1Value ?? trade.target2Value,
      closed_at: trade.closedAtRaw,
      execution_metadata: trade.executionMetadata,
      execution_quality_metrics: executionQuality,
      handoff_quality: handoffQuality,
      improvement_suggestions: suggestions.suggestions,
    });

    return {
      outcome_classification: outcome.classification,
      r_multiple: trade.rMultipleValue,
      pnl: trade.pnlValue,
      execution_quality_rating: executionQuality.quality_rating,
      handoff_quality_rating: handoffQuality.rating,
      high_priority_suggestion_count: suggestions.suggestions.filter(
        (suggestion) => suggestion.priority === "high",
      ).length,
    };
  });

  return calculateSessionQualityScore({
    sessionCoach,
    cooldownAdvisory,
    closedTrades: qualityTrades,
    liveTradesCount,
    scanLogs: scanLogs.map((scanLog) => ({
      result: scanLog.result,
      recommendations_created: scanLog.recommendations_created,
    })),
    guardrails: guardrails.map((guardrail) => ({
      severity: guardrail.severity,
    })),
    eodSafetyStatuses: eodSafetyStatuses.map((status) => ({
      status: status.status,
    })),
    totalR,
    totalPnl,
  });
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
  const estimatedCosts = closedPositions
    .map((position) => {
      const cost =
        position.executionMetadata?.broker_cost_estimate
          ?.total_estimated_trading_cost;
      const rate =
        position.executionMetadata?.broker_cost_model_snapshot
          ?.estimated_usd_sek_rate;

      return cost !== null &&
        cost !== undefined &&
        rate !== null &&
        rate !== undefined &&
        rate > 0
        ? cost / rate
        : null;
    })
    .filter((value): value is number => value !== null);
  const estimatedTotalBrokerCosts =
    estimatedCosts.length > 0
      ? estimatedCosts.reduce((sum, value) => sum + value, 0)
      : null;
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
    estimatedTotalBrokerCosts,
    estimatedAverageCostPerTrade:
      estimatedTotalBrokerCosts !== null && estimatedCosts.length > 0
        ? estimatedTotalBrokerCosts / estimatedCosts.length
        : null,
    estimatedNetPnlAfterCosts:
      totalPnl !== null && estimatedTotalBrokerCosts !== null
        ? totalPnl - estimatedTotalBrokerCosts
        : null,
  };
}

function calculateSetupPerformance(
  closedPositions: ClosedPosition[],
): SetupPerformanceSummary[] {
  const positionsBySetup: Record<string, ClosedPosition[]> = {};

  for (const position of closedPositions) {
    const setupType = normalizeSetupType(position.setupType);
    positionsBySetup[setupType] = positionsBySetup[setupType] || [];
    positionsBySetup[setupType].push(position);
  }

  return Object.entries(positionsBySetup)
    .map(([setupType, positions]) => {
      const normalizedSetupType = normalizeSetupType(setupType);
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
        setupType: normalizedSetupType,
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
    result === "pre_market_watchlist_updated" ||
    result === "pre_market_no_candidates" ||
    result === "pre_market_skipped_holiday" ||
    result === "power_hour_blocked" ||
    result === "recommendation_limit_reached" ||
    result === "duplicate_ticker_skipped" ||
    result === "active_position_exists" ||
    result === "skipped"
  );
}

function getPreMarketCandidatesForDate(scanLogs: ScanLogEntry[], date: string) {
  const candidatesByTicker = new Map<string, PreMarketCandidate>();

  for (const scanLog of scanLogs) {
    if (getNewYorkDateFromIso(scanLog.created_at) !== date) {
      continue;
    }

    for (const candidate of scanLog.pre_market_candidates ?? []) {
      if (candidate.scan_window !== "pre_market") {
        continue;
      }

      const existing = candidatesByTicker.get(candidate.ticker);

      if (
        !existing ||
        new Date(candidate.detected_at).getTime() >
          new Date(existing.detected_at).getTime()
      ) {
        candidatesByTicker.set(candidate.ticker, candidate);
      }
    }
  }

  return Array.from(candidatesByTicker.values()).sort(
    (first, second) => second.score - first.score,
  );
}

function getPreMarketDisplayStatus(
  candidate: PreMarketCandidate,
  scanWindow: IntradayScanWindow,
  marketStatus: TopMarketStatus,
): PreMarketCandidate["status"] {
  if (candidate.status !== "watching") {
    return candidate.status;
  }

  if (
    marketStatus === "closed" ||
    marketStatus === "closed_today" ||
    scanWindow === "midday" ||
    scanWindow === "afternoon" ||
    scanWindow === "power_hour" ||
    scanWindow === "closed"
  ) {
    return "expired";
  }

  return "watching";
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
    noTradeScans: scanLogs.filter(
      (log) =>
        log.result === "no_high_quality_setup" ||
        log.result === "openai_no_trade",
    ).length,
    skippedScans: scanLogs.filter((log) => isSkippedScanResult(log.result)).length,
    providerErrors: scanLogs.filter(
      (log) =>
        log.result === "provider_error" || log.result === "provider_rate_limited",
    ).length,
    averageTopCandidateScore: average(scoreValues),
    latestScan: scanLogs[0] ?? null,
  };
}

function buildDailySessionSummary({
  date,
  closedTrades,
  recommendations,
  discardedSetups,
  scanLogs,
  marketStatus,
  openDayTradesAfterClose,
  localEvents,
  sessionCoach,
  cooldownAdvisory,
  sessionQualityScore,
}: {
  date: string;
  closedTrades: ClosedPosition[];
  recommendations: Recommendation[];
  discardedSetups: Recommendation[];
  scanLogs: ScanLogEntry[];
  marketStatus: TopMarketStatus;
  openDayTradesAfterClose: boolean;
  localEvents: unknown[];
  sessionCoach: SessionCoachResult;
  cooldownAdvisory: CooldownAdvisoryResult;
  sessionQualityScore: SessionQualityScoreResult;
}): DailySessionSummary {
  const pnlValues = closedTrades
    .map((trade) => trade.pnlValue)
    .filter((value): value is number => value !== null);
  const rValues = closedTrades
    .map((trade) => trade.rMultipleValue)
    .filter((value): value is number => value !== null);
  const winningTrades = pnlValues.filter((value) => value > 0).length;
  const totalPnl =
    pnlValues.length > 0 ? pnlValues.reduce((sum, value) => sum + value, 0) : null;
  const totalR =
    rValues.length > 0 ? rValues.reduce((sum, value) => sum + value, 0) : null;
  const recommendationsAdded = recommendations.filter(
    (recommendation) => recommendation.status === "taken",
  ).length;
  const recommendationsDiscarded = recommendations.filter(
    isUserDiscardedRecommendation,
  ).length;
  const recommendationsExpired = recommendations.filter((recommendation) =>
    isRecommendationExpired(toFreshnessInput(recommendation)),
  ).length;
  const reviewedDiscards = discardedSetups.filter(
    (setup) => setup.discardReviewStatus === "reviewed",
  );
  const theoreticalRValues = reviewedDiscards
    .map((setup) => setup.discardTheoreticalR)
    .filter((value): value is number => value !== null);
  const scanQuality = calculateScanQualitySummary(scanLogs);
  const executionQualitySummary = calculateExecutionQualitySummary(closedTrades);
  const brokerPreviewSummary = calculateBrokerPreviewSummary(closedTrades);
  const handoffTimelineSummary = calculateHandoffTimelineSummary(
    closedTrades,
    localEvents,
  );
  const tradeOutcomeSummary = calculateTradeOutcomeSummary(closedTrades);
  const hasSessionData =
    closedTrades.length > 0 ||
    recommendations.length > 0 ||
    discardedSetups.length > 0 ||
    scanLogs.length > 0 ||
    openDayTradesAfterClose;
  const summaryStatus: DailySessionSummaryStatus =
    marketStatus === "unknown"
      ? "error"
      : marketStatus === "open"
        ? "pending"
        : hasSessionData
          ? "generated"
          : "skipped";
  const correctDiscards = reviewedDiscards.filter(
    (setup) => setup.discardDecisionQuality === "correct_discard",
  ).length;
  const missedWinners = reviewedDiscards.filter(
    (setup) => setup.discardDecisionQuality === "missed_winner",
  ).length;
  const missedOpportunities = reviewedDiscards.filter(
    (setup) => setup.discardDecisionQuality === "missed_opportunity",
  ).length;
  const keyTakeaways: string[] = [];
  const warnings: string[] = [];

  if (scanQuality.totalScans > 0 && recommendations.length === 0) {
    keyTakeaways.push("Scanner found no high-quality setups today.");
  }

  const openAiNoTradeScans = scanLogs.filter(
    (log) => log.result === "openai_no_trade",
  ).length;

  if (openAiNoTradeScans >= 2) {
    keyTakeaways.push(
      "Scanner found candidates, but OpenAI rejected several as not actionable. Consider improving local scanner thresholds or candidate ranking.",
    );
  }

  if (missedWinners > correctDiscards) {
    warnings.push(
      "Several discarded setups later worked. Review confidence thresholds and manual discard behavior.",
    );
  }

  if (scanQuality.providerErrors > 0) {
    warnings.push(
      "Provider errors occurred today. Market data availability may have limited scans.",
    );
  }

  if (
    scanQuality.noTradeScans >= Math.max(2, Math.ceil(scanQuality.totalScans / 2)) &&
    missedWinners === 0 &&
    scanQuality.totalScans > 0
  ) {
    keyTakeaways.push("Selective scanning appears appropriate today.");
  }

  const averageR = average(rValues);

  if (averageR !== null && averageR > 0) {
    keyTakeaways.push("Taken trades were positive on average today.");
  }

  if (averageR !== null && averageR < 0) {
    warnings.push(
      "Taken trades underperformed today. Review entry timing and stop placement.",
    );
  }

  if (closedTrades.length === 0 && recommendations.length > 0) {
    keyTakeaways.push("Recommendations appeared, but no trades were taken.");
  }

  if (reviewedDiscards.length < 2) {
    keyTakeaways.push("Not enough discard review data yet.");
  }

  if (marketStatus === "open") {
    warnings.push("Session summary updates after market close.");
  }

  if (openDayTradesAfterClose) {
    warnings.push("One or more day trades remained open after market close.");
  }

  if (keyTakeaways.length === 0 && hasSessionData) {
    keyTakeaways.push("Session data is available for review.");
  }

  return {
    date,
    marketStatus,
    summaryStatus,
    openDayTradesAfterClose,
    actualTradesCount: closedTrades.length,
    closedTradesCount: closedTrades.length,
    totalPnl,
    totalR,
    winRate:
      closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : null,
    averageR,
    bestTradeR: rValues.length > 0 ? Math.max(...rValues) : null,
    worstTradeR: rValues.length > 0 ? Math.min(...rValues) : null,
    recommendationsCreated: recommendations.length,
    recommendationsAdded,
    recommendationsDiscarded,
    recommendationsExpired,
    recommendationConversionRate:
      recommendations.length > 0
        ? (recommendationsAdded / recommendations.length) * 100
        : null,
    discardedReviewed: reviewedDiscards.length,
    correctDiscards,
    missedWinners,
    missedOpportunities,
    averageDiscardTheoreticalR: average(theoreticalRValues),
    totalScans: scanQuality.totalScans,
    noTradeScans: scanQuality.noTradeScans,
    skippedScans: scanQuality.skippedScans,
    providerErrors: scanQuality.providerErrors,
    averageTopCandidateScore: scanQuality.averageTopCandidateScore,
    lastScanResult: scanQuality.latestScan?.result ?? null,
    recommendationSetupBreakdown: calculateSetupTypeBreakdown(recommendations),
    closedTradeSetupBreakdown: calculateSetupTypeBreakdown(closedTrades),
    discardedSetupBreakdown: calculateSetupTypeBreakdown(discardedSetups),
    executionQualitySummary,
    brokerPreviewSummary,
    handoffTimelineSummary,
    tradeOutcomeSummary,
    sessionCoach,
    cooldownAdvisory,
    sessionQualityScore,
    keyTakeaways,
    warnings,
  };
}

function toLatestPositionUpdate(row: PositionUpdateRow): LatestPositionUpdate {
  return {
    positionId: row.position_id,
    action: text(row.action, "HOLD"),
    recommendation: text(row.recommendation),
    explanation: stripPositionWarnings(row.explanation),
    newStop: money(row.new_stop),
    currentPrice: "Not available",
    currentPriceValue: null,
    unrealizedR: "Not available",
    unrealizedRValue: null,
    unrealizedPercent: "Not available",
    unrealizedPercentValue: null,
    reason: text(row.recommendation),
    warnings: parsePositionWarnings(row.explanation),
    intradayIndicators: null,
    updatedAt: formatDate(row.created_at),
    updatedAtRaw: row.created_at ?? null,
  };
}

function parsePositionWarnings(explanation: string | null) {
  const match = text(explanation).match(/Warnings:\s*([\s\S]+)$/i);

  if (!match) {
    return [];
  }

  return match[1]
    .split(/\s+(?=[A-Z][^.!?]+[.!?])/)
    .map((warning) => warning.trim())
    .filter(Boolean);
}

function stripPositionWarnings(explanation: string | null) {
  return text(explanation).replace(/\n\nWarnings:\s*[\s\S]+$/i, "").trim();
}

function formatIntradayIndicatorValue(value: number | null, suffix = "") {
  return value === null ? "—" : `${formatNumber(value)}${suffix}`;
}

function isCloseRequiredAction(action: string) {
  return action === "TAKE_PROFIT" || action === "CLOSE_POSITION";
}

function logAddTradeValidationEvent(
  recommendation: Recommendation,
  validation: AddTradeValidationResult,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type: "add_trade_validation",
      recommendation_id: recommendation.id,
      ticker: recommendation.ticker,
      status: validation.status,
      indicatorSource: validation.indicatorSource,
      timestamp: new Date().toISOString(),
    };
    const existing = JSON.parse(
      window.localStorage.getItem("trade-management-events") ?? "[]",
    ) as unknown[];
    window.localStorage.setItem(
      "trade-management-events",
      JSON.stringify([event, ...existing].slice(0, 200)),
    );
  } catch {
    // Best-effort local event log only; validation must never block ADD TRADE.
  }
}

function logExecutionPayloadEvent(
  type:
    | "execution_payload_generated"
    | "execution_payload_copied"
    | "execution_payload_ready_for_agent"
    | "agent_handoff_blocked_by_readiness"
    | "broker_manual_confirmation_checked"
    | "broker_plan_match_checked"
    | "agent_prepared_order_form_checked"
    | "live_day_trade_created_after_broker_confirmation",
  payload: TradeExecutionPayload,
  readiness?: AgentReadinessResult,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type,
      handoff_session_id: payload.handoff_session_id,
      payload_id: payload.payload_id,
      payload_fingerprint: payload.payload_fingerprint,
      expires_at: payload.expires_at,
      recommendation_id: payload.recommendation_id,
      ticker: payload.ticker,
      timestamp: new Date().toISOString(),
      payload_version: payload.payload_version,
      validation_status: payload.validation_status,
      setup_type: payload.setup_type,
      handoff_status: payload.handoff_status,
      ...(readiness
        ? {
            agent_readiness_status: readiness.status,
            agent_readiness_score: readiness.score,
            agent_readiness_issues: readiness.issues.map((issue) => issue.code),
          }
        : {}),
    };
    const existing = JSON.parse(
      window.localStorage.getItem("trade-management-events") ?? "[]",
    ) as unknown[];
    window.localStorage.setItem(
      "trade-management-events",
      JSON.stringify([event, ...existing].slice(0, 200)),
    );
  } catch {
    // Best-effort local event log only; payload actions must never block trading UI.
  }
}

function logAgentDryRunCompletedEvent(
  recommendation: Recommendation,
  payload: TradeExecutionPayload,
  readiness: AgentReadinessResult,
  result: AgentDryRunResult,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type: "agent_dry_run_completed",
      recommendation_id: recommendation.id,
      ticker: recommendation.ticker,
      handoff_session_id: payload.handoff_session_id,
      payload_id: payload.payload_id,
      payload_fingerprint: payload.payload_fingerprint,
      dry_run_status: result.status,
      dry_run_passed: result.passed,
      agent_readiness_status: readiness.status,
      agent_readiness_score: readiness.score,
      failed_step_ids: result.steps
        .filter((step) => step.status === "failed")
        .map((step) => step.id),
      warning_step_ids: result.steps
        .filter((step) => step.status === "warning")
        .map((step) => step.id),
      generated_at: result.generated_at,
      timestamp: new Date().toISOString(),
    };
    const existing = JSON.parse(
      window.localStorage.getItem("trade-management-events") ?? "[]",
    ) as unknown[];
    window.localStorage.setItem(
      "trade-management-events",
      JSON.stringify([event, ...existing].slice(0, 200)),
    );
  } catch {
    // Best-effort local event log only; dry run must never block the modal.
  }
}

function logHandoffIntegrityEvent(
  type: "handoff_integrity_checked" | "handoff_integrity_failed",
  recommendation: Recommendation,
  payload: TradeExecutionPayload,
  result: HandoffIntegrityResult,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const warningCodes = result.issues
      .filter((issue) => issue.severity === "warning")
      .map((issue) => issue.code);
    const failedCodes = result.issues
      .filter((issue) => issue.severity === "failed")
      .map((issue) => issue.code);
    const event = {
      type,
      handoff_session_id: payload.handoff_session_id,
      recommendation_id: recommendation.id,
      ticker: recommendation.ticker,
      payload_id: payload.payload_id,
      payload_fingerprint: payload.payload_fingerprint,
      status: result.status,
      score: result.score,
      issue_codes: result.issues.map((issue) => issue.code),
      warning_codes: warningCodes,
      failed_codes: failedCodes,
      reason: failedCodes.join(", ") || null,
      checked_at: result.checked_at,
      timestamp: new Date().toISOString(),
    };
    const existing = JSON.parse(
      window.localStorage.getItem("trade-management-events") ?? "[]",
    ) as unknown[];
    window.localStorage.setItem(
      "trade-management-events",
      JSON.stringify([event, ...existing].slice(0, 200)),
    );
  } catch {
    // Best-effort local event log only; integrity logging must never crash UI.
  }
}

function logLiveDayTradeCreatedAfterBrokerConfirmation(
  recommendation: Recommendation,
  brokerFill: BrokerFillConfirmation,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type: "live_day_trade_created_after_broker_confirmation",
      recommendation_id: recommendation.id,
      ticker: recommendation.ticker,
      handoff_session_id: brokerFill.handoffSessionId,
      payload_id: brokerFill.payloadId,
      payload_fingerprint: brokerFill.payloadFingerprint,
      setup_type: brokerFill.setupType,
      validation_status: brokerFill.validationStatus,
      planned_entry_price: brokerFill.plannedEntryPrice,
      actual_fill_price: brokerFill.actualFillPrice,
      planned_shares: brokerFill.plannedShares,
      actual_shares: brokerFill.actualShares,
      planned_stop_loss: brokerFill.plannedStopLoss,
      planned_target_price: brokerFill.plannedTargetPrice,
      planned_position_value: brokerFill.plannedPositionValue,
      actual_position_value: brokerFill.actualPositionValue,
      planned_max_loss_at_stop: brokerFill.plannedMaxLossAtStop,
      actual_max_loss_at_stop: brokerFill.actualMaxLossAtStop,
      actual_risk_per_share: brokerFill.actualRiskPerShare,
      broker_order_status: brokerFill.brokerOrderStatus,
      broker_reference_note: brokerFill.brokerReferenceNote,
      broker_confirmed_at: brokerFill.brokerConfirmedAt,
      execution_payload_version: brokerFill.executionPayloadVersion,
      handoff_integrity_status: brokerFill.handoffIntegrity.status,
      handoff_integrity_score: brokerFill.handoffIntegrity.score,
      broker_cost_estimate: brokerFill.brokerCostEstimate,
      estimated_total_trading_cost:
        brokerFill.brokerCostEstimate?.total_estimated_trading_cost ?? null,
      estimated_net_r: brokerFill.brokerCostEstimate?.estimated_net_r ?? null,
      estimated_break_even_price:
        brokerFill.brokerCostEstimate?.estimated_break_even_price ?? null,
      broker_order_preview: brokerFill.brokerOrderPreview,
      preview_total_estimated_cost:
        brokerFill.brokerOrderPreview?.preview_total_estimated_cost ?? null,
      buying_power_status:
        brokerFill.brokerOrderPreview?.buying_power_status ?? null,
      warning_type: brokerFill.brokerOrderPreview?.warning_type ?? null,
      timestamp: new Date().toISOString(),
    };
    const existing = JSON.parse(
      window.localStorage.getItem("trade-management-events") ?? "[]",
    ) as unknown[];
    window.localStorage.setItem(
      "trade-management-events",
      JSON.stringify([event, ...existing].slice(0, 200)),
    );
  } catch {
    // Best-effort local audit only; position creation must never depend on it.
  }
}

function logBrokerOrderPreviewCaptured(
  recommendation: Recommendation,
  brokerFill: BrokerFillConfirmation,
) {
  if (typeof window === "undefined" || !brokerFill.brokerOrderPreview) {
    return;
  }

  try {
    const event = {
      type: "broker_order_preview_captured",
      recommendation_id: recommendation.id,
      ticker: recommendation.ticker,
      handoff_session_id: brokerFill.handoffSessionId,
      payload_id: brokerFill.payloadId,
      payload_fingerprint: brokerFill.payloadFingerprint,
      preview_total_estimated_cost:
        brokerFill.brokerOrderPreview.preview_total_estimated_cost,
      buying_power_status: brokerFill.brokerOrderPreview.buying_power_status,
      warning_type: brokerFill.brokerOrderPreview.warning_type,
      timestamp: new Date().toISOString(),
    };
    const existing = JSON.parse(
      window.localStorage.getItem("trade-management-events") ?? "[]",
    ) as unknown[];
    window.localStorage.setItem(
      "trade-management-events",
      JSON.stringify([event, ...existing].slice(0, 200)),
    );
  } catch {
    // Best-effort local audit only.
  }
}

function logTradeClosedEvent({
  position,
  closedAt,
  pnl,
  rMultiple,
}: {
  position: ActivePosition;
  closedAt: string;
  pnl: number;
  rMultiple: number | null;
}) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type: "trade_closed",
      position_id: position.id,
      recommendation_id: position.recommendationId,
      ticker: position.ticker,
      payload_id: position.executionMetadata?.execution_payload_id ?? null,
      payload_fingerprint:
        position.executionMetadata?.execution_payload_fingerprint ?? null,
      handoff_session_id: position.executionMetadata?.handoff_session_id ?? null,
      closed_at: closedAt,
      timestamp: closedAt,
      pnl,
      r_multiple: rMultiple,
    };
    const existing = JSON.parse(
      window.localStorage.getItem("trade-management-events") ?? "[]",
    ) as unknown[];
    window.localStorage.setItem(
      "trade-management-events",
      JSON.stringify([event, ...existing].slice(0, 200)),
    );
  } catch {
    // Best-effort local audit only; closing must never depend on it.
  }
}

function isMissingExecutionMetadataColumn(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const values = Object.values(error as Record<string, unknown>)
    .filter((value): value is string => typeof value === "string")
    .join(" ");

  return values.includes("execution_metadata");
}

function getLatestValidationModalMessage(validation: AddTradeValidationResult) {
  if (validation.status === "warning") {
    return `Latest intraday validation is mixed. Review before entering. ${validation.reason}`;
  }

  if (validation.status === "unavailable") {
    return "Latest validation unavailable. Using original recommendation snapshot. Review manually before entering.";
  }

  return "";
}

function updateResultToLatestPositionUpdate(
  update: PositionUpdateResult,
): LatestPositionUpdate {
  return {
    positionId: update.position_id,
    action: update.action,
    recommendation: update.recommendation,
    explanation: stripPositionWarnings(update.explanation),
    newStop: money(update.new_stop),
    currentPrice: formatNumber(update.current_price),
    currentPriceValue: update.current_price,
    unrealizedR: formatNumber(update.unrealized_r_multiple, "R"),
    unrealizedRValue: update.unrealized_r_multiple,
    unrealizedPercent: formatPercent(update.unrealized_percent),
    unrealizedPercentValue: update.unrealized_percent,
    reason: update.reason || update.recommendation,
    warnings: update.warnings ?? [],
    intradayIndicators: update.intraday_indicators ?? null,
    updatedAt: "Just now",
    updatedAtRaw: new Date().toISOString(),
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
  const [validatingRecommendationId, setValidatingRecommendationId] =
    useState<string | null>(null);
  const [selectedTradeValidationStatus, setSelectedTradeValidationStatus] =
    useState<AddTradeValidationResult["status"] | null>(null);
  const [selectedTradeValidation, setSelectedTradeValidation] =
    useState<AddTradeValidationResult | null>(null);
  const [selectedTradeValidationMessage, setSelectedTradeValidationMessage] =
    useState("");
  const [autoRefreshLiveTrades, setAutoRefreshLiveTrades] = useState(
    readAutoRefreshLiveTradesPreference,
  );
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [lastAutoRefreshAt, setLastAutoRefreshAt] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
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
  const [brokerCostModel, setBrokerCostModel] = useState<BrokerCostModel | null>(
    null,
  );
  const hasLoadedRecommendationsRef = useRef(false);
  const previousRecommendationIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedPositionUpdatesRef = useRef(false);
  const previousPositionUpdateSignaturesRef = useRef<Record<string, string>>({});
  const previousPositionUpdateActionsRef = useRef<Record<string, string>>({});
  const previousPositionUpdateUrgenciesRef = useRef<
    Record<string, PositionUpdateUrgency["urgency"]>
  >({});
  const isUpdatingPositionsRef = useRef(false);
  const updatePositionsRef = useRef<
    (source?: "manual" | "auto") => Promise<void>
  >(async () => undefined);

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
        supabase
          .from("positions")
          .select("*, recommendations(setup_type,invalidation)")
          .eq("status", "open"),
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
      setBrokerCostModel(readBrokerCostModelFromStorage());
      loadTradeData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    writeAutoRefreshLiveTradesPreference(autoRefreshLiveTrades);
  }, [autoRefreshLiveTrades]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsDocumentVisible(document.visibilityState === "visible");
    }

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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

    const activePositionById = new Map(
      activePositions.map((position) => [position.id, position]),
    );
    const currentTopMarketStatus = getTopMarketStatus(marketStatus, currentTime);
    const currentMarketCloseWarning = getMarketCloseWarning(marketStatus, currentTime);
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
    const nextActions = Object.fromEntries(
      Object.entries(latestPositionUpdates).map(([positionId, update]) => [
        positionId,
        update.action,
      ]),
    );
    const nextUrgencies = Object.fromEntries(
      Object.entries(latestPositionUpdates).map(([positionId, update]) => {
        const position = activePositionById.get(positionId);
        const staleStatus = getStalePositionStatus(
          update,
          currentTopMarketStatus === "open",
        );
        const warnings = [
          ...(update.warnings ?? []),
          getStalePositionWarning(update, currentTopMarketStatus === "open"),
        ].filter(Boolean);

        return [
          positionId,
              position
            ? getPositionUpdateUrgency({
                position,
                latestUpdate: update,
                warnings,
                staleStatus,
                marketCloseWarning: currentMarketCloseWarning,
                eodSafetyStatus: getEndOfDaySafetyStatus(
                  position,
                  marketStatus,
                  currentTime,
                ),
              }).urgency
            : "normal",
        ];
      }),
    ) as Record<string, PositionUpdateUrgency["urgency"]>;

    if (!hasLoadedPositionUpdatesRef.current) {
      previousPositionUpdateSignaturesRef.current = nextSignatures;
      previousPositionUpdateActionsRef.current = nextActions;
      previousPositionUpdateUrgenciesRef.current = nextUrgencies;
      hasLoadedPositionUpdatesRef.current = true;
      return;
    }

    let soundTypeToPlay: NotificationSoundType | null = null;

    for (const [positionId, signature] of Object.entries(nextSignatures)) {
      const previousSignature =
        previousPositionUpdateSignaturesRef.current[positionId];
      const previousAction = previousPositionUpdateActionsRef.current[positionId];
      const previousUrgency =
        previousPositionUpdateUrgenciesRef.current[positionId] ?? "normal";
      const nextUrgency = nextUrgencies[positionId] ?? "normal";
      const updateChanged = previousSignature !== signature;
      const actionChanged = previousAction !== nextActions[positionId];
      const urgencyIncreased =
        urgencyRank(nextUrgency) > urgencyRank(previousUrgency);

      if (!updateChanged && !actionChanged && !urgencyIncreased) {
        continue;
      }

      const position = activePositionById.get(positionId);
      const update = latestPositionUpdates[positionId];

      if (!position || !update) {
        continue;
      }

      const staleStatus = getStalePositionStatus(
        update,
        currentTopMarketStatus === "open",
      );
      const warnings = [
        ...(update.warnings ?? []),
        getStalePositionWarning(update, currentTopMarketStatus === "open"),
      ].filter(Boolean);
      const urgencyResult = getPositionUpdateUrgency({
        position,
        latestUpdate: update,
        warnings,
        staleStatus,
        marketCloseWarning: currentMarketCloseWarning,
        eodSafetyStatus: getEndOfDaySafetyStatus(
          position,
          marketStatus,
          currentTime,
        ),
      });

      if (!urgencyResult.shouldPlaySound && !actionChanged) {
        continue;
      }

      const nextSoundType =
        urgencyResult.shouldPlaySound && updateChanged
          ? urgencyResult.soundType
          : actionChanged && nextUrgency !== "normal"
            ? urgencyResult.soundType
            : null;

      if (
        nextSoundType &&
        (!soundTypeToPlay ||
          urgencyRank(nextSoundType === "critical" ? "critical" : "warning") >
            urgencyRank(soundTypeToPlay === "critical" ? "critical" : "warning"))
      ) {
        soundTypeToPlay = nextSoundType;
      }
    }

    previousPositionUpdateSignaturesRef.current = nextSignatures;
    previousPositionUpdateActionsRef.current = nextActions;
    previousPositionUpdateUrgenciesRef.current = nextUrgencies;

    if (soundTypeToPlay) {
      playNotificationSound(soundTypeToPlay);
    }
  }, [
    activePositions,
    currentTime,
    isLoading,
    isUpdatingPositions,
    latestPositionUpdates,
    marketStatus,
  ]);

  useEffect(() => {
    const topStatus = getTopMarketStatus(marketStatus, currentTime);

    if (
      !autoRefreshLiveTrades ||
      activeTab !== "Live Day Trades" ||
      activePositions.length === 0 ||
      topStatus !== "open" ||
      !isDocumentVisible
    ) {
      return;
    }

    const intervalMs = getLiveTradesAutoRefreshIntervalMs(marketStatus, currentTime);
    const interval = window.setInterval(() => {
      if (isUpdatingPositionsRef.current) {
        return;
      }

      void updatePositionsRef.current("auto");
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [
    activePositions.length,
    activeTab,
    autoRefreshLiveTrades,
    currentTime,
    isDocumentVisible,
    marketStatus,
  ]);

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
          )}${buildDiscardMetadata(discardedAt, recommendation)}`,
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

      if (result?.scan_log?.result === "openai_no_trade") {
        const reason =
          result.scan_log.no_trade_reason ||
          result.message?.replace(/^OpenAI rejected candidate[^:]*:\s*/i, "") ||
          "OpenAI did not find an actionable day trade setup.";
        setMessage(`No actionable day trade setup found. ${reason}`);
      } else if (result?.message) {
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

  async function updatePositions(source: "manual" | "auto" = "manual") {
    if (isUpdatingPositionsRef.current) {
      return;
    }

    isUpdatingPositionsRef.current = true;
    setIsUpdatingPositions(true);

    if (source === "manual") {
      setMessage("");
    }

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
        setMessage(
          source === "auto"
            ? `Auto-refresh could not update: ${tickers}. Manual refresh still available.`
            : `Some positions could not be updated: ${tickers}.`,
        );
      } else if (source === "manual") {
        setMessage(`Updated ${updateResults.length} open positions.`);
      }

      if (source === "auto") {
        setLastAutoRefreshAt(new Date().toISOString());
      }
    } catch (error) {
      const fallbackMessage =
        "Sorry, Trade could not update positions right now. Please try again.";

      setMessage(
        source === "auto"
          ? "Auto-refresh failed. Manual refresh still available."
          : process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : fallbackMessage,
      );
    }

    isUpdatingPositionsRef.current = false;
    setIsUpdatingPositions(false);
  }

  useEffect(() => {
    updatePositionsRef.current = updatePositions;
  });

  async function openTradeModal(recommendation: Recommendation) {
    if (validatingRecommendationId === recommendation.id) {
      return;
    }

    const freshness = getRecommendationFreshness(toFreshnessInput(recommendation));
    const addTradeGate = getAddTradeGate(recommendation, freshness);

    if (freshness === "expired") {
      setMessage(addTradeGate.message);
      return;
    }

    setValidatingRecommendationId(recommendation.id);
    setMessage("Validating setup...");

    let latestValidation: AddTradeValidationResult | null = null;

    try {
      const response = await fetch("/api/recommendations/validate-add-trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: recommendation.id,
          ticker: recommendation.ticker,
          direction: recommendation.direction,
          entryLowValue: recommendation.entryLowValue,
          entryHighValue: recommendation.entryHighValue,
          stopLossValue: recommendation.stopLossValue,
          target1: recommendation.target1,
          target2: recommendation.target2,
          createdAtRaw: recommendation.createdAtRaw,
          expiresAtRaw: recommendation.expiresAtRaw,
          scanWindow: recommendation.scanWindow,
          intradayIndicators: recommendation.intradayIndicators,
        }),
      });
      latestValidation = (await response.json().catch(() => null)) as
        | AddTradeValidationResult
        | null;
    } catch {
      latestValidation = null;
    }

    if (latestValidation) {
      logAddTradeValidationEvent(recommendation, latestValidation);
    }

    if (latestValidation?.status === "blocked") {
      setMessage(
        latestValidation.reason ||
          "Setup no longer passes intraday validation. Generate a fresh recommendation.",
      );
      setSelectedTradeValidationStatus(null);
      setSelectedTradeValidation(null);
      setValidatingRecommendationId(null);
      return;
    }

    if (!latestValidation || latestValidation.status === "unavailable") {
      if (addTradeGate.blocked) {
        setMessage(addTradeGate.message);
        setSelectedTradeValidationStatus(null);
        setSelectedTradeValidation(null);
        setValidatingRecommendationId(null);
        return;
      }

      latestValidation =
        latestValidation ?? {
          status: "unavailable",
          reason:
            "Latest validation unavailable. Using original recommendation snapshot.",
          reasons: [
            "Latest validation unavailable. Using original recommendation snapshot.",
          ],
          latestIndicators: null,
          indicatorSource: "unavailable",
          stale: true,
        };
    }

    const positionSizing = calculatePositionSizing(recommendation, userSettings);
    const validationMessage = getLatestValidationModalMessage(latestValidation);

    setSelectedRecommendation(recommendation);
    setSelectedTradeValidationStatus(latestValidation.status);
    setSelectedTradeValidation(latestValidation);
    setSelectedTradeValidationMessage(validationMessage);
    setEntryPrice("");
    setPositionSize(
      positionSizing.suggestedShares === null
        ? ""
        : String(positionSizing.suggestedShares),
    );
    setMessage(
      validationMessage ||
        addTradeGate.message ||
        (recommendation.confidenceScore !== null && recommendation.confidenceScore < 60
          ? "Low confidence setup. Review carefully before adding this trade."
          : ""),
    );
    setValidatingRecommendationId(null);
  }

  function closeTradeModal() {
    if (isSaving) {
      return;
    }

    setSelectedRecommendation(null);
    setSelectedTradeValidationStatus(null);
    setSelectedTradeValidation(null);
    setSelectedTradeValidationMessage("");
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

  async function submitTrade(
    event: FormEvent<HTMLFormElement>,
    brokerFill?: BrokerFillConfirmation,
  ) {
    event.preventDefault();

    if (!selectedRecommendation) {
      return;
    }

    const freshness = getRecommendationFreshness(toFreshnessInput(selectedRecommendation));
    const addTradeGate = getAddTradeGate(selectedRecommendation, freshness);
    const latestValidationAllowsTrade =
      selectedTradeValidationStatus === "valid" ||
      selectedTradeValidationStatus === "warning" ||
      selectedTradeValidationStatus === "unavailable";

    if (freshness === "expired" || (addTradeGate.blocked && !latestValidationAllowsTrade)) {
      setSelectedRecommendation(null);
      setSelectedTradeValidationStatus(null);
      setSelectedTradeValidation(null);
      setSelectedTradeValidationMessage("");
      setMessage(addTradeGate.message);
      return;
    }

    const actualEntryPrice = brokerFill?.actualFillPrice ?? Number(entryPrice);
    const actualPositionSize = brokerFill?.actualShares ?? Number(positionSize);

    if (Number.isNaN(actualEntryPrice) || Number.isNaN(actualPositionSize)) {
      setMessage("Entry price and position size must be numbers.");
      return;
    }

    if (actualEntryPrice <= 0 || actualPositionSize <= 0) {
      setMessage("Actual fill price and actual shares must be greater than zero.");
      return;
    }

    if (
      selectedRecommendation.stopLossValue !== null &&
      selectedRecommendation.stopLossValue >= actualEntryPrice
    ) {
      setMessage("Stop loss must be below actual fill price for a long trade.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    const executionMetadata = brokerFill
      ? (() => {
          const baseMetadata = buildBrokerExecutionMetadata({
            brokerOrderStatus: brokerFill.brokerOrderStatus,
            brokerReferenceNote: brokerFill.brokerReferenceNote,
            brokerConfirmedAt: brokerFill.brokerConfirmedAt,
            plannedEntryPrice: brokerFill.plannedEntryPrice,
            actualFillPrice: brokerFill.actualFillPrice,
            plannedShares: brokerFill.plannedShares,
            actualShares: brokerFill.actualShares,
            plannedStopLoss: brokerFill.plannedStopLoss,
            plannedTargetPrice: brokerFill.plannedTargetPrice,
            plannedPositionValue: brokerFill.plannedPositionValue,
            actualPositionValue: brokerFill.actualPositionValue,
            plannedMaxLossAtStop: brokerFill.plannedMaxLossAtStop,
            actualMaxLossAtStop: brokerFill.actualMaxLossAtStop,
            executionPayloadId: brokerFill.payloadId,
            executionPayloadFingerprint: brokerFill.payloadFingerprint,
            executionPayloadVersion: brokerFill.executionPayloadVersion,
            handoffSessionId: brokerFill.handoffSessionId,
            recommendationId: selectedRecommendation.id,
            setupType: brokerFill.setupType,
            validationStatus: brokerFill.validationStatus,
            brokerCostModelSnapshot: brokerFill.brokerCostModelSnapshot,
            brokerCostEstimate: brokerFill.brokerCostEstimate,
            brokerOrderPreview: brokerFill.brokerOrderPreview,
            handoffIntegrity: toHandoffIntegritySnapshot(
              brokerFill.handoffIntegrity,
            ),
          });
          const quality = calculateHandoffQuality({
            executionMetadata: baseMetadata,
            executionQualityMetrics: calculateExecutionQuality(baseMetadata),
            handoffReplay: buildHandoffSessionReplay({
              executionMetadata: baseMetadata,
              timelineEvents: [],
              openedAt: brokerFill.brokerConfirmedAt,
            }),
          });

          return {
            ...baseMetadata,
            handoff_quality: toHandoffQualitySnapshot(quality),
          };
        })()
      : null;
    const positionInsert = {
      recommendation_id: selectedRecommendation.id,
      ticker: selectedRecommendation.ticker,
      company_name: selectedRecommendation.companyName,
      entry_price: actualEntryPrice,
      position_size: actualPositionSize,
      current_stop: selectedRecommendation.stopLoss,
      target_1: selectedRecommendation.target1,
      target_2: selectedRecommendation.target2,
      status: "open",
      ...(executionMetadata ? { execution_metadata: executionMetadata } : {}),
    };

    let { error: insertError } = await supabase
      .from("positions")
      .insert(positionInsert);

    if (insertError && isMissingExecutionMetadataColumn(insertError)) {
      const fallbackInsert = {
        recommendation_id: positionInsert.recommendation_id,
        ticker: positionInsert.ticker,
        company_name: positionInsert.company_name,
        entry_price: positionInsert.entry_price,
        position_size: positionInsert.position_size,
        current_stop: positionInsert.current_stop,
        target_1: positionInsert.target_1,
        target_2: positionInsert.target_2,
        status: positionInsert.status,
      };
      const fallbackResult = await supabase.from("positions").insert(fallbackInsert);
      insertError = fallbackResult.error;
    }

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

    if (brokerFill) {
      logLiveDayTradeCreatedAfterBrokerConfirmation(
        selectedRecommendation,
        brokerFill,
      );
      logBrokerOrderPreviewCaptured(selectedRecommendation, brokerFill);
    }

    setSelectedRecommendation(null);
    setSelectedTradeValidationStatus(null);
    setSelectedTradeValidation(null);
    setSelectedTradeValidationMessage("");
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

    const closedAt = new Date().toISOString();
    const { error } = await supabase
      .from("positions")
      .update({
        status: "closed",
        exit_price: actualExitPrice,
        closed_at: closedAt,
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

    logTradeClosedEvent({
      position: selectedPosition,
      closedAt,
      pnl,
      rMultiple,
    });

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
  const currentIntradayScanWindow = getIntradayScanWindow(currentTime);
  const currentIntradayScanWindowLabel = getIntradayScanWindowLabel(
    currentIntradayScanWindow,
  );
  const currentIntradayScanPolicy = getIntradayScanPolicy(
    currentIntradayScanWindow,
  );
  const performanceSummary = calculatePerformanceSummary(closedPositions);
  const setupPerformance = calculateSetupPerformance(closedPositions);
  const scanQualitySummary = calculateScanQualitySummary(scanLogs);
  const localTradeManagementEvents = readTradeManagementEvents();
  const setupExecutionFeedback = buildSetupExecutionFeedbackForHistory(
    closedPositions,
    discardedSetups,
    localTradeManagementEvents,
  );
  const recommendationCalibration = buildRecommendationCalibrationForHistory({
    recommendations,
    closedTrades: closedPositions,
    discardedSetups,
    scanLogs,
  });
  const calibrationGuardrailsByRecommendationId = new Map(
    dailyRecommendations.map((recommendation) => [
      recommendation.id,
      buildCalibrationGuardrails({
        currentRecommendation: {
          setup_type: recommendation.setupType,
          confidence_score: recommendation.confidenceScore,
        },
        recommendationCalibration,
        setupExecutionFeedback,
      }),
    ]),
  );
  const calibrationGuardrailSummary = buildCalibrationGuardrails({
    recommendationCalibration,
    setupExecutionFeedback,
  });
  const lastPositionUpdate = Object.values(latestPositionUpdates)
    .map((update) => update.updatedAt)
    .find(Boolean);
  const marketCloseWarning = getMarketCloseWarning(marketStatus, currentTime);
  const topMarketStatus = getTopMarketStatus(marketStatus, currentTime);
  const autoRefreshIntervalMs = getLiveTradesAutoRefreshIntervalMs(
    marketStatus,
    currentTime,
  );
  const eodSafetyStatusesByPositionId = Object.fromEntries(
    activePositions.map((position) => [
      position.id,
      getEndOfDaySafetyStatus(position, marketStatus, currentTime),
    ]),
  ) as Record<string, EndOfDaySafetyStatus>;
  const hasEndOfDayOvernightRisk = Object.values(eodSafetyStatusesByPositionId).some(
    (status) => status.status === "overnight_risk",
  );
  const hasEndOfDayReviewRequired = Object.values(eodSafetyStatusesByPositionId).some(
    (status) =>
      status.status === "review_required" || status.status === "overnight_risk",
  );
  const autoRefreshPausedReason = !autoRefreshLiveTrades
    ? "off"
    : activePositions.length === 0
      ? "no live trades"
      : topMarketStatus !== "open"
        ? "market closed"
        : !isDocumentVisible
          ? "tab hidden"
          : "";
  const hasStaleLiveTradeData = activePositions.some(
    (position) =>
      getStalePositionStatus(
        latestPositionUpdates[position.id],
        topMarketStatus === "open",
      ) !== "fresh",
  );
  const hasCriticalLiveTradeAlert = activePositions.some((position) => {
    const latestUpdate = latestPositionUpdates[position.id];
    const staleStatus = getStalePositionStatus(
      latestUpdate,
      topMarketStatus === "open",
    );
    const warnings = [
      ...(latestUpdate?.warnings ?? []),
      getStalePositionWarning(latestUpdate, topMarketStatus === "open"),
    ].filter(Boolean);

    return (
      getPositionUpdateUrgency({
        position,
        latestUpdate,
        warnings,
        staleStatus,
        marketCloseWarning,
        eodSafetyStatus: eodSafetyStatusesByPositionId[position.id],
      }).urgency === "critical"
    );
  });
  const dailySessionDate = marketStatus?.date ?? getNewYorkDateString(currentTime);
  const dailyClosedPositions = closedPositions.filter(
    (position) => getNewYorkDateFromIso(position.closedAtRaw) === dailySessionDate,
  );
  const dailySessionRecommendations = recommendations.filter(
    (recommendation) =>
      getNewYorkDateFromIso(recommendation.createdAtRaw) === dailySessionDate,
  );
  const dailyDiscardedSetups = recommendations.filter(
    (recommendation) =>
      isUserDiscardedRecommendation(recommendation) &&
      getNewYorkDateFromIso(
        recommendation.discardedAtRaw ?? recommendation.createdAtRaw,
      ) === dailySessionDate,
  );
  const dailyScanLogs = scanLogs.filter(
    (scanLog) => getNewYorkDateFromIso(scanLog.created_at) === dailySessionDate,
  );
  const preMarketCandidates = getPreMarketCandidatesForDate(
    scanLogs,
    dailySessionDate,
  );
  const dailySessionCoach = buildSessionCoachForDaily({
    closedTrades: dailyClosedPositions,
    liveTradesCount: activePositions.length,
    scanLogs: dailyScanLogs,
    guardrails: calibrationGuardrailSummary.guardrails,
    eodSafetyStatuses: Object.values(eodSafetyStatusesByPositionId),
    marketStatus: topMarketStatus,
    currentScanWindow: currentIntradayScanWindow,
    localEvents: localTradeManagementEvents,
  });
  const dailyCooldownAdvisory = buildCooldownAdvisoryForDaily({
    closedTrades: dailyClosedPositions,
    liveTradesCount: activePositions.length,
    scanLogs: dailyScanLogs,
    guardrails: calibrationGuardrailSummary.guardrails,
    eodSafetyStatuses: Object.values(eodSafetyStatusesByPositionId),
    marketStatus: topMarketStatus,
    currentScanWindow: currentIntradayScanWindow,
    localEvents: localTradeManagementEvents,
    sessionCoach: dailySessionCoach,
  });
  const dailyTotalRValues = dailyClosedPositions
    .map((position) => position.rMultipleValue)
    .filter((value): value is number => value !== null);
  const dailyTotalPnlValues = dailyClosedPositions
    .map((position) => position.pnlValue)
    .filter((value): value is number => value !== null);
  const dailySessionQualityScore = buildSessionQualityScoreForDaily({
    closedTrades: dailyClosedPositions,
    liveTradesCount: activePositions.length,
    scanLogs: dailyScanLogs,
    guardrails: calibrationGuardrailSummary.guardrails,
    eodSafetyStatuses: Object.values(eodSafetyStatusesByPositionId),
    localEvents: localTradeManagementEvents,
    sessionCoach: dailySessionCoach,
    cooldownAdvisory: dailyCooldownAdvisory,
    totalR:
      dailyTotalRValues.length > 0
        ? dailyTotalRValues.reduce((sum, value) => sum + value, 0)
        : null,
    totalPnl:
      dailyTotalPnlValues.length > 0
        ? dailyTotalPnlValues.reduce((sum, value) => sum + value, 0)
        : null,
  });
  const showPreMarketWatchlist =
    currentIntradayScanWindow === "pre_market" || preMarketCandidates.length > 0;
  // TODO: Persist daily session summaries and generate them from automation after market close.
  const dailySessionSummary = buildDailySessionSummary({
    date: dailySessionDate,
    closedTrades: dailyClosedPositions,
    recommendations: dailySessionRecommendations,
    discardedSetups: dailyDiscardedSetups,
    scanLogs: dailyScanLogs,
    marketStatus: topMarketStatus,
    openDayTradesAfterClose: hasEndOfDayOvernightRisk,
    localEvents: localTradeManagementEvents,
    sessionCoach: dailySessionCoach,
    cooldownAdvisory: dailyCooldownAdvisory,
    sessionQualityScore: dailySessionQualityScore,
  });
  const preTradeRiskContextByRecommendationId = new Map(
    dailyRecommendations.map((recommendation) => {
      const freshness = getRecommendationFreshness(toFreshnessInput(recommendation));
      const addTradeGate = getAddTradeGate(recommendation, freshness);

      return [
        recommendation.id,
        buildPreTradeRiskContext({
          recommendation: {
            setup_type: recommendation.setupType,
            confidence_score: recommendation.confidenceScore,
            freshness,
            add_trade_gate_blocked: addTradeGate.blocked,
          },
          sessionCoach: dailySessionCoach,
          cooldownAdvisory: dailyCooldownAdvisory,
          sessionQualityScore: dailySessionQualityScore,
          calibrationGuardrails:
            calibrationGuardrailsByRecommendationId.get(recommendation.id) ?? null,
          currentScanWindow: currentIntradayScanWindow,
          marketStatus: topMarketStatus,
          eodSafetyStatuses: Object.values(eodSafetyStatusesByPositionId),
          poorExecutionTodayCount:
            dailySessionSummary.executionQualitySummary.ratingCounts.poor,
          highPrioritySuggestionCount:
            dailySessionSummary.handoffTimelineSummary
              .highPriorityImprovementSuggestions,
        }),
      ];
    }),
  );
  const tradeEligibilityByRecommendationId = new Map(
    dailyRecommendations.map((recommendation) => {
      const freshness = getRecommendationFreshness(toFreshnessInput(recommendation));
      const addTradeGate = getAddTradeGate(recommendation, freshness);
      const hasActivePositionSameTicker = activePositions.some(
        (position) => position.ticker === recommendation.ticker,
      );

      return [
        recommendation.id,
        buildTradeEligibility({
          recommendation: {
            setup_type: recommendation.setupType,
            confidence_score: recommendation.confidenceScore,
            freshness,
            add_trade_gate_blocked: addTradeGate.blocked,
            add_trade_gate_message: addTradeGate.message,
            intraday_confirmation: addTradeGate.confirmation.status,
            has_required_fields:
              (recommendation.entryLowValue !== null ||
                recommendation.entryHighValue !== null) &&
              recommendation.stopLossValue !== null,
            has_active_position_same_ticker: hasActivePositionSameTicker,
          },
          preTradeRiskContext:
            preTradeRiskContextByRecommendationId.get(recommendation.id) ?? null,
          calibrationGuardrails:
            calibrationGuardrailsByRecommendationId.get(recommendation.id) ?? null,
          sessionQualityScore: dailySessionQualityScore,
          cooldownAdvisory: dailyCooldownAdvisory,
          currentScanWindow: currentIntradayScanWindow,
          marketStatus: topMarketStatus,
        }),
      ];
    }),
  );
  const recommendationDecisionStackByRecommendationId = new Map(
    dailyRecommendations.map((recommendation) => {
      const freshness = getRecommendationFreshness(toFreshnessInput(recommendation));
      const addTradeGate = getAddTradeGate(recommendation, freshness);

      return [
        recommendation.id,
        buildRecommendationDecisionStack({
          recommendation: {
            setup_type: recommendation.setupType,
            confidence_score: recommendation.confidenceScore,
            freshness,
            intraday_confirmation: addTradeGate.confirmation.status,
            add_trade_gate_blocked: addTradeGate.blocked,
            add_trade_gate_message: addTradeGate.message,
          },
          tradeEligibility:
            tradeEligibilityByRecommendationId.get(recommendation.id) ?? null,
          preTradeRiskContext:
            preTradeRiskContextByRecommendationId.get(recommendation.id) ?? null,
          calibrationGuardrails:
            calibrationGuardrailsByRecommendationId.get(recommendation.id) ?? null,
          sessionQualityScore: dailySessionQualityScore,
          cooldownAdvisory: dailyCooldownAdvisory,
        }),
      ];
    }),
  );
  const elevatedPreTradeContexts = Array.from(
    preTradeRiskContextByRecommendationId.values(),
  ).filter(
    (context) => context.level === "caution" || context.level === "avoid",
  );
  const isGenerateDisabled =
    isLoading ||
    generatingSessionType !== null ||
    marketStatus?.isOpenDay === false ||
    (marketStatus ? !isMarketOpenForIntradayTrading(marketStatus) : false) ||
    !currentIntradayScanPolicy.allowGeneration;

  return (
    <main className="min-h-screen bg-[#060707] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <nav className="flex flex-wrap gap-2">
              {secondaryTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                    activeTab === tab
                      ? "border-white/20 bg-white/[0.08] text-zinc-100"
                      : "border-white/10 bg-white/[0.025] text-zinc-500 hover:border-white/20 hover:text-zinc-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <Link
                href="/settings"
                className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 transition hover:border-white/20 hover:text-zinc-200"
              >
                Settings
              </Link>
            </nav>
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

        <nav className="flex flex-wrap gap-3 border-b border-white/10 pb-5">
          {primaryTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-5 py-3 font-mono text-sm font-semibold uppercase tracking-[0.11em] transition ${
                activeTab === tab
                  ? "border-[#00db94] bg-[#00db94] text-zinc-950"
                  : "border-white/10 bg-white/[0.035] text-zinc-300 hover:border-white/25 hover:text-zinc-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {message && (
          <DismissibleWarning
            storageKey={warningDismissKey(["global-message", message])}
            className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100"
          >
            {message}
          </DismissibleWarning>
        )}

        {(dailyCooldownAdvisory.level === "pause" ||
          dailyCooldownAdvisory.level === "stop_for_day") && (
          <DismissibleWarning
            storageKey={warningDismissKey([
              "cooldown-advisory",
              dailyCooldownAdvisory.level,
              dailyCooldownAdvisory.generated_at,
            ])}
            className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100"
          >
            Session cooldown advisory is active:{" "}
            {dailyCooldownAdvisory.suggested_action} Advisory only; ADD TRADE is
            not blocked.
          </DismissibleWarning>
        )}

        {(dailySessionQualityScore.grade === "C" ||
          dailySessionQualityScore.grade === "D") && (
          <DismissibleWarning
            storageKey={warningDismissKey([
              "session-quality",
              dailySessionQualityScore.grade,
              dailySessionQualityScore.generated_at,
            ])}
            className={`rounded-lg border p-4 text-sm leading-6 ${
              dailySessionQualityScore.grade === "D"
                ? "border-rose-300/30 bg-rose-300/10 text-rose-100"
                : "border-amber-300/25 bg-amber-300/10 text-amber-100"
            }`}
          >
            Session quality is{" "}
            {dailySessionQualityScore.grade === "D" ? "poor" : "risky"}:{" "}
            {dailySessionQualityScore.summary} Advisory only; ADD TRADE is not
            blocked.
          </DismissibleWarning>
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
                {elevatedPreTradeContexts.length > 0 && (
                  <DismissibleWarning
                    storageKey={warningDismissKey([
                      "elevated-pre-trade-contexts",
                      elevatedPreTradeContexts.length,
                    ])}
                    className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100 xl:col-span-2"
                  >
                    Pre-trade risk context is elevated on{" "}
                    {elevatedPreTradeContexts.length} recommendation
                    {elevatedPreTradeContexts.length === 1 ? "" : "s"}. Review
                    session quality before taking new trades. Advisory only; ADD
                    TRADE is not blocked.
                  </DismissibleWarning>
                )}
                {dailyRecommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    calibrationGuardrails={
                      calibrationGuardrailsByRecommendationId.get(
                        recommendation.id,
                      ) ?? null
                    }
                    preTradeRiskContext={
                      preTradeRiskContextByRecommendationId.get(recommendation.id) ??
                      null
                    }
                    tradeEligibility={
                      tradeEligibilityByRecommendationId.get(recommendation.id) ??
                      null
                    }
                    decisionStack={
                      recommendationDecisionStackByRecommendationId.get(
                        recommendation.id,
                      ) ?? null
                    }
                    positionSizing={calculatePositionSizing(
                      recommendation,
                      userSettings,
	                    )}
	                    isSaving={isSaving}
	                    isValidating={
	                      validatingRecommendationId === recommendation.id
	                    }
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
                onClick={() => updatePositions("manual")}
                disabled={isLoading || isUpdatingPositions || activePositions.length === 0}
                className="min-h-11 rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {isUpdatingPositions ? "Refreshing..." : "Refresh Live Positions"}
              </button>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={autoRefreshLiveTrades}
                    onChange={(event) =>
                      setAutoRefreshLiveTrades(event.target.checked)
                    }
                    className="h-4 w-4 accent-[#00db94]"
                  />
                  <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-200">
                    Auto-refresh live trades
                  </span>
                </label>
                <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                  <span>
                    {autoRefreshPausedReason
                      ? `Paused · ${autoRefreshPausedReason}`
                      : `On · every ${formatIntervalMinutes(autoRefreshIntervalMs)}`}
                  </span>
                  <span>
                    Last auto-refresh{" "}
                    {lastAutoRefreshAt ? formatDate(lastAutoRefreshAt) : "—"}
                  </span>
                </div>
              </div>
              {!autoRefreshLiveTrades && hasStaleLiveTradeData && (
                <p className="mt-3 text-sm leading-6 text-amber-100">
                  Enable auto-refresh to keep live trade data current.
                </p>
              )}
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
              <DismissibleWarning
                storageKey={warningDismissKey([
                  "live-tab-market-close",
                  dailySessionDate,
                  marketCloseWarning,
                ])}
                className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100"
              >
                {marketCloseWarning}
              </DismissibleWarning>
            )}

            {hasEndOfDayReviewRequired && (
              <DismissibleWarning
                storageKey={warningDismissKey([
                  "eod-review-required",
                  dailySessionDate,
                  hasEndOfDayOvernightRisk ? "overnight" : "review",
                ])}
                className="rounded-lg border border-rose-300/35 bg-rose-300/10 p-4 text-sm leading-6 text-rose-100"
              >
                <p className="font-mono text-xs font-bold uppercase tracking-[0.14em]">
                  {hasEndOfDayOvernightRisk
                    ? "End-of-Day Overnight Risk"
                    : "End-of-Day Review Required"}
                </p>
                <p className="mt-1">
                  {hasEndOfDayOvernightRisk
                    ? "A day trade is still open after market close. Review immediately."
                    : "One or more day trades are still open near/after market close."}
                </p>
              </DismissibleWarning>
            )}

            {hasCriticalLiveTradeAlert && (
              <DismissibleWarning
                storageKey={warningDismissKey([
                  "critical-live-trade-alert",
                  dailySessionDate,
                ])}
                className="rounded-lg border border-rose-300/35 bg-rose-300/10 p-4 text-sm leading-6 text-rose-100"
              >
                <p className="font-mono text-xs font-bold uppercase tracking-[0.14em]">
                  Critical Live Trade Alert
                </p>
                <p className="mt-1">
                  One or more trades require manual action.
                </p>
              </DismissibleWarning>
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
                    key={`${position.id}:${dailySessionDate}`}
                    position={position}
                    latestUpdate={latestPositionUpdates[position.id]}
                    marketCloseWarning={marketCloseWarning}
                    eodSafetyStatus={eodSafetyStatusesByPositionId[position.id]}
                    eodSafetyDate={dailySessionDate}
                    isMarketOpen={topMarketStatus === "open"}
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

            <DailySessionSummaryPanel
              summary={dailySessionSummary}
              isLoading={isLoading}
            />

            <SetupExecutionFeedbackPanel feedback={setupExecutionFeedback} />

            <RecommendationCalibrationPanel
              calibration={recommendationCalibration}
            />

            <CalibrationGuardrailSummaryPanel
              guardrails={calibrationGuardrailSummary}
            />

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

            {showPreMarketWatchlist && (
              <PreMarketWatchlistPanel
                candidates={preMarketCandidates}
                scanWindow={currentIntradayScanWindow}
                marketStatus={topMarketStatus}
              />
            )}

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
          key={selectedRecommendation.id}
          recommendation={selectedRecommendation}
          positionSizing={calculatePositionSizing(
            selectedRecommendation,
            userSettings,
          )}
          validation={selectedTradeValidation}
          validationMessage={selectedTradeValidationMessage}
          brokerCostModel={brokerCostModel}
          isSaving={isSaving}
          onClose={closeTradeModal}
          onSubmit={submitTrade}
        />
      )}

      {selectedPosition && (
        <ClosePositionModal
          position={selectedPosition}
          eodSafetyStatus={getEndOfDaySafetyStatus(
            selectedPosition,
            marketStatus,
            currentTime,
          )}
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

function DailySessionSummaryPanel({
  summary,
  isLoading,
}: {
  summary: DailySessionSummary;
  isLoading: boolean;
}) {
  const hasSessionData =
    summary.actualTradesCount > 0 ||
    summary.recommendationsCreated > 0 ||
    summary.totalScans > 0 ||
    summary.recommendationsDiscarded > 0 ||
    summary.discardedReviewed > 0 ||
    summary.openDayTradesAfterClose;

  return (
    <section className="space-y-4 rounded-lg border border-white/10 bg-white/[0.025] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Daily Session Summary
          </p>
          <h3 className="mt-2 font-mono text-xl font-semibold tracking-normal text-white">
            {summary.date}
          </h3>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          {summary.summaryStatus}
        </span>
      </div>

      {isLoading ? (
        <EmptyState
          title="Loading session summary"
          message="Trade is combining closed trades, discarded reviews, and scan quality."
        />
      ) : !hasSessionData ? (
        <EmptyState
          title="No session data yet"
          message="Daily summaries will appear once scans, recommendations, or trades exist."
        />
      ) : (
        <>
          {summary.summaryStatus === "pending" && (
            <div className="rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
              Session still in progress. Final summary will be most useful after
              market close.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            <SummaryCard
              label="Actual PnL"
              value={formatPnl(summary.totalPnl)}
              tone={summary.totalPnl}
            />
            <SummaryCard
              label="Closed Trades"
              value={String(summary.closedTradesCount)}
            />
            <SummaryCard
              label="Average R"
              value={formatRMultiple(summary.averageR)}
              tone={summary.averageR}
            />
            <SummaryCard
              label="Recommendations"
              value={String(summary.recommendationsCreated)}
            />
            <SummaryCard
              label="Correct Discards"
              value={String(summary.correctDiscards)}
            />
            <SummaryCard
              label="Missed Winners"
              value={String(summary.missedWinners)}
            />
            <SummaryCard
              label="Scan Quality"
              value={`${summary.noTradeScans}/${summary.totalScans}`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SessionSummaryList
              title="Key Takeaways"
              items={summary.keyTakeaways}
              emptyText="No takeaways generated yet."
            />
            <SessionSummaryList
              title="Warnings"
              items={summary.warnings}
              emptyText="No warnings for this session."
            />
          </div>

          <SessionCoachPanel coach={summary.sessionCoach} />
          <CooldownAdvisoryPanel advisory={summary.cooldownAdvisory} />
          <SessionQualityScorePanel result={summary.sessionQualityScore} />

          <ExecutionQualitySummaryPanel
            summary={summary.executionQualitySummary}
          />

          <BrokerPreviewSummaryPanel summary={summary.brokerPreviewSummary} />
          <HandoffTimelineSummaryPanel summary={summary.handoffTimelineSummary} />
          <TradeOutcomeSummaryPanel summary={summary.tradeOutcomeSummary} />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Detail
              label="Total R"
              value={formatRMultiple(summary.totalR)}
            />
            <Detail label="Win Rate" value={formatPercent(summary.winRate)} />
            <Detail
              label="Recommendation Conversion"
              value={formatPercent(summary.recommendationConversionRate)}
            />
            <Detail
              label="Added / Discarded"
              value={`${summary.recommendationsAdded} / ${summary.recommendationsDiscarded}`}
            />
            <Detail
              label="Avg Discard Theo R"
              value={formatRMultiple(summary.averageDiscardTheoreticalR)}
            />
            <Detail
              label="Missed Opportunities"
              value={String(summary.missedOpportunities)}
            />
            <Detail
              label="Expired Recommendations"
              value={String(summary.recommendationsExpired)}
            />
            <Detail
              label="Avg Top Score"
              value={
                summary.averageTopCandidateScore === null
                  ? "—"
                  : summary.averageTopCandidateScore.toFixed(0)
              }
            />
            <Detail
              label="Skipped Scans"
              value={String(summary.skippedScans)}
            />
            <Detail
              label="Provider Errors"
              value={String(summary.providerErrors)}
            />
            <Detail
              label="Last Scan"
              value={
                summary.lastScanResult
                  ? scanLogResultLabel(summary.lastScanResult)
                  : "—"
              }
            />
            <Detail
              label="Recs by Setup"
              value={formatSetupTypeBreakdown(summary.recommendationSetupBreakdown)}
            />
            <Detail
              label="Closed by Setup"
              value={formatSetupTypeBreakdown(summary.closedTradeSetupBreakdown)}
            />
            <Detail
              label="Discards by Setup"
              value={formatSetupTypeBreakdown(summary.discardedSetupBreakdown)}
            />
          </div>

          <p className="text-sm leading-6 text-zinc-500">
            Discarded setup R is theoretical feedback only and is never included in
            actual PnL.
          </p>
        </>
      )}
    </section>
  );
}

function SessionSummaryList({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <h4 className="font-mono text-sm font-semibold text-white">{title}</h4>
      {items.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-zinc-500">{emptyText}</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ExecutionQualitySummaryPanel({
  summary,
}: {
  summary: ExecutionQualitySummary;
}) {
  if (summary.tradesWithMetadata === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
        <h4 className="font-mono text-sm font-semibold text-white">
          Execution Quality
        </h4>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          No closed trades with execution metadata yet.
        </p>
      </div>
    );
  }

  const setupText =
    summary.setupBreakdown.length === 0
      ? "Not available"
      : summary.setupBreakdown
          .slice(0, 3)
          .map(
            (item) =>
              `${item.label}: ${formatSignedPercent(
                item.averageSlippagePercent,
              )}, ${item.count} trade${item.count === 1 ? "" : "s"}`,
          )
          .join(" · ");

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <h4 className="font-mono text-sm font-semibold text-white">
        Execution Quality
      </h4>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Detail
          label="Trades With Metadata"
          value={String(summary.tradesWithMetadata)}
        />
        <Detail
          label="Avg Slippage"
          value={`${formatSignedPercent(
            summary.averageSlippagePercent,
          )} / ${formatBasisPoints(summary.averageSlippageBps)}`}
        />
        <Detail label="Better / Worse" value={`${summary.betterFills} / ${summary.worseFills}`} />
        <Detail label="Partial Fills" value={String(summary.partialFills)} />
        <Detail
          label="Ratings"
          value={`Ex ${summary.ratingCounts.excellent} · Good ${summary.ratingCounts.good} · Acc ${summary.ratingCounts.acceptable} · Poor ${summary.ratingCounts.poor}`}
        />
        <Detail
          label="Est. Total Costs"
          value={formatSek(summary.estimatedTotalTradingCosts)}
        />
        <Detail
          label="Est. Avg Cost"
          value={formatSek(summary.estimatedAverageCostPerTrade)}
        />
        <Detail
          label="Est. Avg Net R"
          value={formatRMultiple(summary.estimatedAverageNetR)}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-500">
        Execution by setup type: {setupText}
      </p>
    </div>
  );
}

function BrokerPreviewSummaryPanel({
  summary,
}: {
  summary: BrokerPreviewSummary;
}) {
  if (summary.capturedCount === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <h4 className="font-mono text-sm font-semibold text-white">
        Broker Preview Capture
      </h4>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Captured" value={String(summary.capturedCount)} />
        <Detail label="Warnings" value={String(summary.warningCount)} />
        <Detail
          label="Buying Power Issues"
          value={String(summary.buyingPowerIssueCount)}
        />
        <Detail
          label="Avg Cost Diff"
          value={formatSek(summary.averageTotalCostDifference)}
        />
      </div>
    </div>
  );
}

function formatNullableR(value: number | null) {
  return value === null ? "—" : `${value.toFixed(2)}R`;
}

function formatFeedbackWinRate(value: number | null) {
  return value === null ? "—" : `${value.toFixed(0)}%`;
}

function feedbackInsightClassName(severity: SetupExecutionInsight["severity"]) {
  if (severity === "positive") {
    return "border-[#00db94]/25 bg-[#00db94]/10 text-emerald-100";
  }

  if (severity === "warning") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  if (severity === "negative") {
    return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  }

  return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
}

function FeedbackBucketList({
  title,
  buckets,
}: {
  title: string;
  buckets: SetupExecutionBucket[];
}) {
  const visibleBuckets = buckets
    .filter(
      (bucket) =>
        bucket.closed_trades > 0 ||
        bucket.discarded_setups > 0 ||
        bucket.poor_execution_count > 0,
    )
    .slice(0, 3);

  if (visibleBuckets.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-4">
      <h5 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
        {title}
      </h5>
      <div className="mt-3 space-y-2">
        {visibleBuckets.map((bucket) => (
          <div
            key={bucket.key}
            className="rounded-md border border-white/10 bg-white/[0.025] p-3"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <p className="text-sm font-semibold text-zinc-200">
                {bucket.label}
              </p>
              <span className="font-mono text-xs text-zinc-400">
                {bucket.closed_trades} closed
              </span>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <Detail label="Avg R" value={formatNullableR(bucket.average_r)} />
              <Detail
                label="Win Rate"
                value={formatFeedbackWinRate(bucket.win_rate)}
              />
              <Detail
                label="Poor Exec"
                value={String(bucket.poor_execution_count)}
              />
            </div>
            {(bucket.missed_winners > 0 || bucket.correct_discards > 0) && (
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Discards: {bucket.missed_winners} missed winners ·{" "}
                {bucket.correct_discards} correct.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SetupExecutionFeedbackPanel({
  feedback,
}: {
  feedback: SetupExecutionFeedbackResult;
}) {
  const bestSetup = feedback.buckets_by_setup_type
    .filter((bucket) => bucket.closed_trades > 0)
    .sort((first, second) => (second.average_r ?? -Infinity) - (first.average_r ?? -Infinity))[0];
  const worstSetup = feedback.buckets_by_setup_type
    .filter((bucket) => bucket.closed_trades > 0)
    .sort((first, second) => (first.average_r ?? Infinity) - (second.average_r ?? Infinity))[0];
  const missedWinnerBucket = feedback.buckets_by_setup_type
    .filter((bucket) => bucket.missed_winners > 0)
    .sort((first, second) => second.missed_winners - first.missed_winners)[0];

  return (
    <div className="space-y-4 rounded-lg border border-white/10 bg-white/[0.025] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="font-mono text-lg font-semibold tracking-normal text-white">
            Setup + Execution Feedback
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Rule-based feedback from closed trades, execution metadata, handoff
            quality, execution quality, and discarded setup reviews.
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
          Analytics only
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Detail
          label="Closed Trades"
          value={String(feedback.total_closed_trades)}
        />
        <Detail
          label="Discarded Setups"
          value={String(feedback.total_discarded_setups)}
        />
        <Detail
          label="Best Setup Avg R"
          value={
            bestSetup
              ? `${bestSetup.label} ${formatNullableR(bestSetup.average_r)}`
              : "—"
          }
        />
        <Detail
          label="Worst Setup Avg R"
          value={
            worstSetup
              ? `${worstSetup.label} ${formatNullableR(worstSetup.average_r)}`
              : "—"
          }
        />
        <Detail
          label="Missed Winners"
          value={
            missedWinnerBucket
              ? `${missedWinnerBucket.label} ${missedWinnerBucket.missed_winners}`
              : "—"
          }
        />
        <Detail
          label="Generated"
          value={formatDate(feedback.generated_at)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <FeedbackBucketList
          title="By Setup Type"
          buckets={feedback.buckets_by_setup_type}
        />
        <FeedbackBucketList
          title="By Handoff Quality"
          buckets={feedback.buckets_by_handoff_quality}
        />
        <FeedbackBucketList
          title="By Execution Quality"
          buckets={feedback.buckets_by_execution_quality}
        />
      </div>

      <div className="rounded-md border border-white/10 bg-black/20 p-4">
        <h5 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          Insights
        </h5>
        {feedback.insights.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            No setup execution insights yet.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {feedback.insights.map((insight) => (
              <div
                key={insight.code}
                className="rounded-md border border-white/10 bg-white/[0.025] p-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-sm font-semibold text-zinc-200">
                    {insight.title}
                  </p>
                  <span
                    className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${feedbackInsightClassName(
                      insight.severity,
                    )}`}
                  >
                    {insight.severity}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs leading-5 text-zinc-500">
        Discarded setup theoretical R never affects actual PnL. This feedback
        does not train AI models or change recommendation scoring.
      </p>
    </div>
  );
}

function formatCalibrationConfidence(value: number | null) {
  return value === null ? "—" : `${value.toFixed(0)}/100`;
}

function CalibrationBucketList({
  title,
  buckets,
}: {
  title: string;
  buckets: CalibrationBucket[];
}) {
  const visibleBuckets = buckets
    .filter(
      (bucket) =>
        bucket.total_items > 0 ||
        bucket.closed_trades > 0 ||
        bucket.discarded_setups > 0,
    )
    .slice(0, 3);

  if (visibleBuckets.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-4">
      <h5 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
        {title}
      </h5>
      <div className="mt-3 space-y-2">
        {visibleBuckets.map((bucket) => (
          <div
            key={bucket.key}
            className="rounded-md border border-white/10 bg-white/[0.025] p-3"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <p className="text-sm font-semibold text-zinc-200">
                {bucket.label}
              </p>
              <span className="font-mono text-xs text-zinc-400">
                {bucket.total_items} analyzed
              </span>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <Detail label="Closed" value={String(bucket.closed_trades)} />
              <Detail label="Avg R" value={formatNullableR(bucket.average_r)} />
              <Detail
                label="Win Rate"
                value={formatFeedbackWinRate(bucket.win_rate)}
              />
              <Detail
                label="Avg Confidence"
                value={formatCalibrationConfidence(bucket.average_confidence)}
              />
              <Detail
                label="Discarded"
                value={String(bucket.discarded_setups)}
              />
              <Detail
                label="Avg PnL"
                value={formatPnl(bucket.average_pnl)}
              />
            </div>
            {(bucket.missed_winners > 0 || bucket.correct_discards > 0) && (
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Discard review: {bucket.missed_winners} missed winners ·{" "}
                {bucket.correct_discards} correct discards.
              </p>
            )}
            {bucket.notes.length > 0 && (
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                {bucket.notes.slice(0, 2).join(" ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationCalibrationPanel({
  calibration,
}: {
  calibration: RecommendationCalibrationResult;
}) {
  const bestConfidenceBucket = calibration.confidence_buckets
    .filter((bucket) => bucket.closed_trades > 0 && bucket.average_r !== null)
    .sort((first, second) => (second.average_r ?? 0) - (first.average_r ?? 0))[0];
  const highConfidenceBucket = calibration.confidence_buckets.find(
    (bucket) => bucket.key === "90_100" || bucket.key === "80_89",
  );
  const topSetupBucket = calibration.setup_type_buckets
    .filter((bucket) => bucket.closed_trades > 0 || bucket.total_items > 0)
    .sort(
      (first, second) =>
        second.closed_trades - first.closed_trades ||
        second.total_items - first.total_items,
    )[0];

  return (
    <div className="space-y-4 rounded-lg border border-white/10 bg-white/[0.025] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="font-mono text-lg font-semibold tracking-normal text-white">
            Recommendation Calibration
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Rule-based calibration for confidence buckets, setup types, scan
            decisions, closed outcomes, and discarded setup review.
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
          Analytics only
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Detail
          label="Recommendations Analyzed"
          value={String(calibration.total_recommendations_analyzed)}
        />
        <Detail
          label="Closed Trades"
          value={String(calibration.total_closed_trades)}
        />
        <Detail
          label="Discarded Setups"
          value={String(calibration.total_discarded_setups)}
        />
        <Detail
          label="Scan No-Trade"
          value={String(calibration.total_scan_no_trade)}
        />
        <Detail
          label="Best Confidence Avg R"
          value={
            bestConfidenceBucket
              ? `${bestConfidenceBucket.label} ${formatNullableR(
                  bestConfidenceBucket.average_r,
                )}`
              : "—"
          }
        />
        <Detail
          label="High Confidence Avg R"
          value={formatNullableR(highConfidenceBucket?.average_r ?? null)}
        />
        <Detail
          label="Top Setup Bucket"
          value={
            topSetupBucket
              ? `${topSetupBucket.label} · ${topSetupBucket.total_items}`
              : "—"
          }
        />
        <Detail
          label="Generated"
          value={formatDate(calibration.generated_at)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CalibrationBucketList
          title="Confidence Buckets"
          buckets={calibration.confidence_buckets}
        />
        <CalibrationBucketList
          title="Setup Type Calibration"
          buckets={calibration.setup_type_buckets}
        />
      </div>

      <div className="rounded-md border border-white/10 bg-black/20 p-4">
        <h5 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          Scan Decision Summary
        </h5>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Detail
            label="Created"
            value={String(calibration.scan_decision_summary.recommendation_created)}
          />
          <Detail
            label="No Trade"
            value={String(calibration.scan_decision_summary.no_trade)}
          />
          <Detail
            label="Skipped"
            value={String(calibration.scan_decision_summary.skipped)}
          />
          <Detail
            label="Provider/OpenAI Errors"
            value={String(
              calibration.scan_decision_summary.provider_or_openai_errors,
            )}
          />
        </div>
      </div>

      <div className="rounded-md border border-white/10 bg-black/20 p-4">
        <h5 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          Calibration Insights
        </h5>
        {calibration.insights.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            No calibration insights yet.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {calibration.insights.map((insight: CalibrationInsight) => (
              <div
                key={insight.code}
                className="rounded-md border border-white/10 bg-white/[0.025] p-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-sm font-semibold text-zinc-200">
                    {insight.title}
                  </p>
                  <span
                    className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${feedbackInsightClassName(
                      insight.severity,
                    )}`}
                  >
                    {insight.severity}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs leading-5 text-zinc-500">
        Calibration is analytics only. Discarded setup review can flag missed
        winners or correct discards, but it does not affect actual PnL and does
        not change recommendation scoring or prompts automatically.
      </p>
    </div>
  );
}

function calibrationGuardrailClassName(severity: CalibrationGuardrailSeverity) {
  if (severity === "warning") {
    return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  }

  if (severity === "caution") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
}

function preTradeRiskContextClassName(level: PreTradeRiskContextLevel) {
  if (level === "avoid") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  if (level === "caution") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (level === "watch") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }

  return "border-[#00db94]/30 bg-[#00db94]/10 text-emerald-100";
}

function tradeEligibilityClassName(status: TradeEligibilityStatus) {
  if (status === "not_eligible") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  if (status === "risky") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-100";
  }

  if (status === "mixed") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }

  return "border-[#00db94]/30 bg-[#00db94]/10 text-emerald-100";
}

function tradeEligibilitySignalClassName(impact: TradeEligibilitySignalImpact) {
  if (impact === "blocking") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  if (impact === "negative") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-100";
  }

  if (impact === "warning") {
    return "border-yellow-300/25 bg-yellow-300/10 text-yellow-100";
  }

  if (impact === "positive") {
    return "border-[#00db94]/25 bg-[#00db94]/10 text-emerald-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-300";
}

function recommendationDecisionStackClassName(
  status: RecommendationDecisionStackStatus,
) {
  if (status === "blocked") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  if (status === "weak") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-100";
  }

  if (status === "mixed") {
    return "border-yellow-300/25 bg-yellow-300/10 text-yellow-100";
  }

  if (status === "acceptable") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }

  if (status === "strong") {
    return "border-[#00db94]/30 bg-[#00db94]/10 text-emerald-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-300";
}

function getRecommendationKeyReasons({
  recommendation,
  confirmation,
  decisionStack,
  calibrationGuardrails,
  preTradeRiskContext,
}: {
  recommendation: Recommendation;
  confirmation: IntradayConfirmationStatus;
  decisionStack: RecommendationDecisionStackResult | null;
  calibrationGuardrails: CalibrationGuardrailResult | null;
  preTradeRiskContext: PreTradeRiskContextResult | null;
}) {
  const positive: string[] = [];
  const warnings: string[] = [];

  if (
    recommendation.confidenceScore !== null &&
    recommendation.confidenceScore >= 80
  ) {
    positive.push(`Confidence ${recommendation.confidenceScore}/100`);
  }

  if (confirmation.status === "confirmed") {
    positive.push("Intraday confirmation is clean");
  } else if (confirmation.status === "mixed" || confirmation.status === "weak") {
    warnings.push(`Intraday confirmation is ${confirmation.status}`);
  }

  if (decisionStack?.overall_status === "strong") {
    positive.push("Decision stack looks strong");
  } else if (
    decisionStack?.overall_status === "weak" ||
    decisionStack?.overall_status === "blocked" ||
    decisionStack?.overall_status === "mixed"
  ) {
    warnings.push(decisionStack.primary_warning ?? decisionStack.summary);
  }

  const calibrationWarning = calibrationGuardrails?.guardrails.find(
    (guardrail) => guardrail.severity === "warning",
  );
  const calibrationCaution = calibrationGuardrails?.guardrails.find(
    (guardrail) => guardrail.severity === "caution",
  );

  if (calibrationWarning) {
    warnings.push(calibrationWarning.title);
  } else if (calibrationCaution) {
    warnings.push(calibrationCaution.title);
  }

  if (
    preTradeRiskContext?.level === "clear" ||
    preTradeRiskContext?.level === "watch"
  ) {
    positive.push(preTradeRiskContext.title);
  } else if (preTradeRiskContext) {
    warnings.push(preTradeRiskContext.title);
  }

  if (recommendation.thesis && positive.length < 3) {
    positive.push(recommendation.thesis);
  }

  if (recommendation.reasonToAvoid && warnings.length < 2) {
    warnings.push(recommendation.reasonToAvoid);
  }

  return {
    positive: Array.from(new Set(positive)).slice(0, 3),
    warnings: Array.from(new Set(warnings)).slice(0, 2),
  };
}

function PrimaryDecisionStrip({
  decisionStack,
  tradeEligibility,
  preTradeRiskContext,
  addTradeGateMessage,
}: {
  decisionStack: RecommendationDecisionStackResult | null;
  tradeEligibility: TradeEligibilityResult | null;
  preTradeRiskContext: PreTradeRiskContextResult | null;
  addTradeGateMessage: string;
}) {
  return (
    <section className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Quick Decision
          </p>
          <p className="mt-1 text-sm leading-6 text-zinc-300">
            {decisionStack?.primary_warning ||
              addTradeGateMessage ||
              decisionStack?.summary ||
              "Review the trade plan, then use ADD TRADE for latest validation."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {decisionStack && (
            <span
              className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${recommendationDecisionStackClassName(
                decisionStack.overall_status,
              )}`}
            >
              Stack {decisionStack.overall_status}
            </span>
          )}
          {tradeEligibility && (
            <span
              className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${tradeEligibilityClassName(
                tradeEligibility.status,
              )}`}
            >
              {tradeEligibility.status.replace("_", " ")}
            </span>
          )}
          {preTradeRiskContext && (
            <span
              className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${preTradeRiskContextClassName(
                preTradeRiskContext.level,
              )}`}
            >
              Risk {preTradeRiskContext.level}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

function TradePlanSummary({
  recommendation,
  positionSizing,
}: {
  recommendation: Recommendation;
  positionSizing: PositionSizing;
}) {
  return (
    <section className="mt-4 rounded-lg border border-[#00db94]/15 bg-[#00db94]/[0.04] p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
          Trade Plan
        </h3>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
          {recommendation.timeframe}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Entry / Limit" value={recommendation.entryZone} />
        <Detail label="Stop" value={recommendation.stopLoss} />
        <Detail label="Target" value={recommendation.target1} />
        <Detail label="R/R" value={recommendation.riskReward} />
        <Detail
          label="Shares"
          value={
            positionSizing.suggestedShares === null
              ? "—"
              : formatShares(positionSizing.suggestedShares)
          }
        />
        <Detail
          label="Position Value"
          value={formatCurrency(positionSizing.suggestedPositionValue)}
        />
        <Detail
          label="Max Loss"
          value={formatCurrency(positionSizing.maxLossAtStop)}
        />
        <Detail
          label="Risk/share"
          value={formatCurrency(positionSizing.riskPerShare)}
        />
      </div>
    </section>
  );
}

function KeyReasonsPanel({
  reasons,
}: {
  reasons: { positive: string[]; warnings: string[] };
}) {
  if (reasons.positive.length === 0 && reasons.warnings.length === 0) {
    return null;
  }

  return (
    <section className="mt-4 grid gap-3 lg:grid-cols-2">
      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
          Why This Setup
        </h3>
        {reasons.positive.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            No strong positive reasons surfaced.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
            {reasons.positive.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
          Red Flags
        </h3>
        {reasons.warnings.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            No major red flags surfaced from current advisory layers.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-100">
            {reasons.warnings.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function RecommendationDecisionStackPanel({
  result,
  compact = false,
}: {
  result: RecommendationDecisionStackResult | null;
  compact?: boolean;
}) {
  if (!result) {
    return null;
  }

  return (
    <div
      className={`rounded-md border border-white/10 bg-white/[0.025] p-4 ${
        compact ? "" : "mt-4"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Recommendation Decision Stack
          </p>
          <h4 className="mt-2 font-mono text-sm font-semibold tracking-normal text-white">
            {result.title}
          </h4>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {result.summary}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${recommendationDecisionStackClassName(
            result.overall_status,
          )}`}
        >
          {result.overall_status}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {result.items.map((item) => (
          <div
            key={item.type}
            className="grid gap-2 rounded-md border border-white/10 bg-black/20 p-3 sm:grid-cols-[150px_110px_1fr]"
          >
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">
              {item.label}
            </div>
            <span
              className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${recommendationDecisionStackClassName(
                item.status,
              )}`}
            >
              {item.status}
            </span>
            <div>
              <p className="text-xs leading-5 text-zinc-300">{item.summary}</p>
              {item.detail && (
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  {item.detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {result.primary_warning && (
        <p className="mt-3 text-xs leading-5 text-amber-100">
          {result.primary_warning}
        </p>
      )}
      {!compact && (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Advisory only. ADD TRADE still uses the normal validation gate and this
          stack adds no new blocking rules.
        </p>
      )}
    </div>
  );
}

function TradeEligibilityPanel({
  result,
  compact = false,
}: {
  result: TradeEligibilityResult | null;
  compact?: boolean;
}) {
  if (!result) {
    return null;
  }

  return (
    <div
      className={`rounded-md border border-white/10 bg-white/[0.025] p-4 ${
        compact ? "" : "mt-5"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Trade Eligibility
          </p>
          <h4 className="mt-2 font-mono text-sm font-semibold tracking-normal text-white">
            {result.title}
          </h4>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {result.summary}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${tradeEligibilityClassName(
            result.status,
          )}`}
        >
          {result.status.replace("_", " ")}
        </span>
      </div>

      {!compact && result.signals.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {result.signals.slice(0, 4).map((signal) => (
            <div
              key={signal.code}
              className="rounded-md border border-white/10 bg-black/20 p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-xs font-semibold text-zinc-200">
                  {signal.label}
                </p>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${tradeEligibilitySignalClassName(
                    signal.impact,
                  )}`}
                >
                  {signal.impact}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {signal.description}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        {result.can_attempt_add_trade
          ? "ADD TRADE still runs normal validation."
          : "Existing gate/freshness rules prevent ADD TRADE."}{" "}
        This summary is decision support only and adds no new blocking rules.
      </p>
    </div>
  );
}

function PreTradeRiskContextPanel({
  result,
  compact = false,
}: {
  result: PreTradeRiskContextResult | null;
  compact?: boolean;
}) {
  if (!result) {
    return null;
  }

  return (
    <div
      className={`rounded-md border border-white/10 bg-black/20 p-4 ${
        compact ? "" : "mt-4"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Pre-Trade Risk Context
          </p>
          <h4 className="mt-2 font-mono text-sm font-semibold tracking-normal text-white">
            {result.title}
          </h4>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {result.summary}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${preTradeRiskContextClassName(
            result.level,
          )}`}
        >
          {result.level}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-300">
        {result.suggested_action}
      </p>

      {!compact && result.signals.length > 0 && (
        <div className="mt-3 grid gap-2">
          {result.signals.slice(0, 3).map((signal) => (
            <div
              key={signal.code}
              className="rounded-md border border-white/10 bg-white/[0.025] p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-xs font-semibold text-zinc-200">
                  {signal.title}
                </p>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${preTradeRiskContextClassName(
                    signal.level,
                  )}`}
                >
                  {signal.type.replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {signal.description}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Advisory only. ADD TRADE still uses the normal validation gate and this
        panel does not change scoring, risk settings, or broker flow.
      </p>
    </div>
  );
}

function CalibrationGuardrailItem({
  guardrail,
}: {
  guardrail: CalibrationGuardrail;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.025] p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-200">
            {guardrail.title}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {guardrail.description}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${calibrationGuardrailClassName(
            guardrail.severity,
          )}`}
        >
          {guardrail.severity}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-300">
        {guardrail.suggested_action}
      </p>
      {guardrail.data_points && guardrail.data_points.length > 0 && (
        <p className="mt-2 font-mono text-[11px] leading-5 text-zinc-500">
          {guardrail.data_points
            .slice(0, 3)
            .map((item) => `${item.label}: ${item.value}`)
            .join(" · ")}
        </p>
      )}
    </div>
  );
}

function CalibrationGuardrailsPanel({
  result,
  compact = false,
}: {
  result: CalibrationGuardrailResult | null;
  compact?: boolean;
}) {
  if (!result || result.guardrails.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
            Calibration Guardrails
          </h4>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {result.summary}
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
          Advisory
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {result.guardrails.slice(0, compact ? 3 : 5).map((guardrail) => (
          <CalibrationGuardrailItem
            key={`${guardrail.code}-${guardrail.scope}`}
            guardrail={guardrail}
          />
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Calibration guardrails are advisory only. They do not block trades or
        change recommendation scoring.
      </p>
    </div>
  );
}

function CalibrationGuardrailSummaryPanel({
  guardrails,
}: {
  guardrails: CalibrationGuardrailResult;
}) {
  const warnings = guardrails.guardrails.filter(
    (guardrail) => guardrail.severity === "warning",
  ).length;
  const cautions = guardrails.guardrails.filter(
    (guardrail) => guardrail.severity === "caution",
  ).length;
  const scopeCounts = new Map<string, number>();

  for (const guardrail of guardrails.guardrails) {
    scopeCounts.set(guardrail.scope, (scopeCounts.get(guardrail.scope) ?? 0) + 1);
  }

  const commonScopes = Array.from(scopeCounts.entries())
    .sort((first, second) => second[1] - first[1])
    .slice(0, 3)
    .map(([scope, count]) => `${scope.replaceAll("_", " ")} ${count}`);

  if (guardrails.guardrails.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="font-mono text-lg font-semibold tracking-normal text-white">
            Calibration Guardrail Summary
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Advisory guardrails generated from the same calibration dashboard.
            They do not change scoring, validation, or trade creation.
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
          Non-blocking
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Guardrails" value={String(guardrails.guardrails.length)} />
        <Detail label="Warnings" value={String(warnings)} />
        <Detail label="Cautions" value={String(cautions)} />
        <Detail
          label="Common Scopes"
          value={commonScopes.length === 0 ? "—" : commonScopes.join(" · ")}
        />
      </div>
      <CalibrationGuardrailsPanel result={guardrails} />
    </div>
  );
}

function HandoffTimelineSummaryPanel({
  summary,
}: {
  summary: HandoffTimelineSummary;
}) {
  if (
    summary.closedWithExecutionMetadata === 0 &&
    summary.agentDryRunsCompleted === 0
  ) {
    return null;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <h4 className="font-mono text-sm font-semibold text-white">
        Handoff Timeline Completeness
      </h4>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Detail
          label="Execution Metadata"
          value={String(summary.closedWithExecutionMetadata)}
        />
        <Detail label="Payload Events" value={String(summary.withPayloadEvent)} />
        <Detail
          label="Broker Preview"
          value={String(summary.withBrokerPreviewEvent)}
        />
        <Detail
          label="Manual Confirm"
          value={String(summary.withManualConfirmationEvent)}
        />
        <Detail
          label="Actual Fill"
          value={String(summary.withActualFillMetadata)}
        />
        <Detail
          label="Handoff Sessions"
          value={String(summary.handoffSessionsObserved)}
        />
        <Detail
          label="Sessions Dry Run"
          value={String(summary.sessionsWithDryRun)}
        />
        <Detail
          label="Sessions Confirmed"
          value={String(summary.sessionsWithManualConfirmation)}
        />
        <Detail
          label="Sessions Live Trade"
          value={String(summary.sessionsWithLiveTradeCreated)}
        />
        <Detail
          label="Dry Runs"
          value={String(summary.agentDryRunsCompleted)}
        />
        <Detail
          label="Dry Run Passed"
          value={String(summary.agentDryRunsPassed)}
        />
        <Detail
          label="Dry Run Failed"
          value={String(summary.agentDryRunsFailed)}
        />
        <Detail
          label="Dry Run Warnings"
          value={String(summary.agentDryRunsWithWarnings)}
        />
        <Detail
          label="Integrity Checks"
          value={String(summary.handoffIntegrityChecksCompleted)}
        />
        <Detail
          label="Integrity Passed"
          value={String(summary.handoffIntegrityPassed)}
        />
        <Detail
          label="Integrity Warnings"
          value={String(summary.handoffIntegrityWarnings)}
        />
        <Detail
          label="Integrity Failed"
          value={String(summary.handoffIntegrityFailed)}
        />
        <Detail
          label="Replay Complete"
          value={String(summary.handoffReplaysComplete)}
        />
        <Detail
          label="Replay Partial"
          value={String(summary.handoffReplaysPartial)}
        />
        <Detail
          label="Replay Failed"
          value={String(summary.handoffReplaysFailed)}
        />
        <Detail
          label="Replay Unknown"
          value={String(summary.handoffReplaysUnknown)}
        />
        <Detail
          label="Avg Quality"
          value={
            summary.averageHandoffQualityScore === null
              ? "—"
              : `${summary.averageHandoffQualityScore.toFixed(0)}/100`
          }
        />
        <Detail
          label="Quality Ratings"
          value={`Ex ${summary.handoffQualityRatingCounts.excellent} · Good ${summary.handoffQualityRatingCounts.good} · Acc ${summary.handoffQualityRatingCounts.acceptable} · Poor ${summary.handoffQualityRatingCounts.poor}`}
        />
        <Detail
          label="Top Quality Gaps"
          value={
            summary.handoffQualityTopFactors.length === 0
              ? "—"
              : summary.handoffQualityTopFactors
                  .map((item) => `${item.code.replaceAll("_", " ")} ${item.count}`)
                  .join(" · ")
          }
        />
        <Detail
          label="Improvements"
          value={String(summary.totalImprovementSuggestions)}
        />
        <Detail
          label="High Priority"
          value={String(summary.highPriorityImprovementSuggestions)}
        />
        <Detail
          label="Top Improvements"
          value={
            summary.topImprovementSuggestionCodes.length === 0
              ? "—"
              : summary.topImprovementSuggestionCodes
                  .map((item) => `${item.code.replaceAll("_", " ")} ${item.count}`)
                  .join(" · ")
          }
        />
        <Detail
          label="Top Categories"
          value={
            summary.topImprovementCategories.length === 0
              ? "—"
              : summary.topImprovementCategories
                  .map((item) => `${item.category.replaceAll("_", " ")} ${item.count}`)
                  .join(" · ")
          }
        />
      </div>
      {summary.agentDryRunsCompleted > 0 && (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Dry-run timeline events are audit records only. They do not mean an
          order was submitted or that Avanza was controlled.
        </p>
      )}
    </div>
  );
}

function tradeOutcomePrimaryDriverLabel(value: TradeOutcomePrimaryDriver | null) {
  if (value === "setup_quality") return "Setup quality";
  if (value === "execution_quality") return "Execution quality";
  if (value === "risk_management") return "Risk outcome";
  if (value === "market_follow_through") return "Market follow-through";
  if (value === "handoff_quality") return "Handoff quality";
  if (value === "costs") return "Costs";
  if (value === "eod_discipline") return "EOD discipline";
  if (value === "unknown") return "Unknown";
  return "—";
}

function TradeOutcomeSummaryPanel({
  summary,
}: {
  summary: TradeOutcomeSummary;
}) {
  const total =
    summary.strongWins +
    summary.smallWins +
    summary.breakeven +
    summary.smallLosses +
    summary.hardLosses +
    summary.unknown;

  if (total === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <h4 className="font-mono text-sm font-semibold text-white">
        Trade Outcome Explainer
      </h4>
      <p className="mt-2 text-sm leading-6 text-zinc-500">
        Automatic explanations from closed trade outcomes. No AI calls or manual
        journaling required.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Strong Wins" value={String(summary.strongWins)} />
        <Detail label="Small Wins" value={String(summary.smallWins)} />
        <Detail label="Breakeven" value={String(summary.breakeven)} />
        <Detail label="Small Losses" value={String(summary.smallLosses)} />
        <Detail label="Hard Losses" value={String(summary.hardLosses)} />
        <Detail label="Unknown" value={String(summary.unknown)} />
        <Detail
          label="Common Driver"
          value={tradeOutcomePrimaryDriverLabel(summary.mostCommonPrimaryDriver)}
        />
        <Detail
          label="Common Negative"
          value={summary.mostCommonNegativeDriver ?? "—"}
        />
      </div>
    </div>
  );
}

function sessionCoachToneClassName(value: SessionCoachTone) {
  if (value === "positive") {
    return "border-[#00db94]/25 bg-[#00db94]/10 text-emerald-100";
  }

  if (value === "caution") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  if (value === "warning") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
}

function sessionCoachStatusLabel(value: SessionCoachStatus) {
  if (value === "not_enough_data") return "Not enough data";
  return value.replaceAll("_", " ");
}

function sessionCoachThemeLabel(value: SessionCoachTheme) {
  return value.replaceAll("_", " ");
}

function SessionCoachPanel({ coach }: { coach: SessionCoachResult }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Automatic Session Coach
          </p>
          <h4 className="mt-2 font-mono text-lg font-semibold tracking-normal text-white">
            {coach.title}
          </h4>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {coach.summary}
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
            Theme: {sessionCoachThemeLabel(coach.theme)} · Generated{" "}
            {formatDate(coach.generated_at)}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${sessionCoachToneClassName(
            coach.tone,
          )}`}
        >
          {sessionCoachStatusLabel(coach.status)}
        </span>
      </div>

      {coach.should_be_cautious_taking_more_trades && (
        <div className="mt-4 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
          Be cautious about taking more trades. This is advisory only and does
          not block ADD TRADE.
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-white/10 bg-white/[0.025] p-3">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
            Session Points
          </p>
          <div className="mt-3 space-y-2">
            {coach.points.slice(0, 6).map((point) => (
              <div key={point.code} className="rounded-md border border-white/10 bg-black/20 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-sm font-semibold text-zinc-200">
                    {point.title}
                  </p>
                  <span
                    className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${sessionCoachToneClassName(
                      point.tone,
                    )}`}
                  >
                    {point.tone}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-white/10 bg-white/[0.025] p-3">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
            Coach Recommendations
          </p>
          <div className="mt-3 space-y-2">
            {coach.recommendations.slice(0, 4).map((item) => (
              <div key={item.code} className="rounded-md border border-white/10 bg-black/20 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-sm font-semibold text-zinc-200">
                    {item.title}
                  </p>
                  <span
                    className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${sessionCoachToneClassName(
                      item.tone,
                    )}`}
                  >
                    {item.tone}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Session coaching is generated from structured app data only. It does not
        call AI, block trades, change scoring, or control Avanza.
      </p>
    </div>
  );
}

function cooldownAdvisoryLevelLabel(value: CooldownAdvisoryLevel) {
  if (value === "stop_for_day") return "Stop for day";
  return value.replaceAll("_", " ");
}

function cooldownAdvisoryToneClassName(
  value: CooldownAdvisoryLevel | CooldownAdvisoryReasonSeverity,
) {
  if (value === "none" || value === "info") {
    return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
  }

  if (value === "watch" || value === "caution") {
    return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  }

  if (value === "pause" || value === "warning") {
    return "border-orange-300/25 bg-orange-300/10 text-orange-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function CooldownAdvisoryPanel({
  advisory,
}: {
  advisory: CooldownAdvisoryResult;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Cooldown Advisory
          </p>
          <h4 className="mt-2 font-mono text-lg font-semibold tracking-normal text-white">
            {advisory.title}
          </h4>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {advisory.summary}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {advisory.suggested_action}
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
            Generated {formatDate(advisory.generated_at)}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${cooldownAdvisoryToneClassName(
            advisory.level,
          )}`}
        >
          {cooldownAdvisoryLevelLabel(advisory.level)}
        </span>
      </div>

      {advisory.reasons.length > 0 && (
        <div className="mt-4 grid gap-2 lg:grid-cols-2">
          {advisory.reasons.slice(0, 5).map((reason) => (
            <div
              key={reason.code}
              className="rounded-md border border-white/10 bg-white/[0.025] p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-semibold text-zinc-200">
                  {reason.title}
                </p>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${cooldownAdvisoryToneClassName(
                    reason.severity,
                  )}`}
                >
                  {reason.severity}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Advisory only. This does not block trades, change risk settings, call AI,
        or control Avanza.
      </p>
    </div>
  );
}

function sessionQualityGradeClassName(value: SessionQualityGrade) {
  if (value === "A") {
    return "border-[#00db94]/30 bg-[#00db94]/10 text-emerald-100";
  }

  if (value === "B") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }

  if (value === "C") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (value === "D") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

function sessionQualityFactorClassName(value: SessionQualityFactorImpact) {
  if (value === "positive") {
    return "border-[#00db94]/25 bg-[#00db94]/10 text-emerald-100";
  }

  if (value === "negative") {
    return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  }

  if (value === "warning") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
}

function SessionQualityScorePanel({
  result,
}: {
  result: SessionQualityScoreResult;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Session Quality Score
          </p>
          <h4 className="mt-2 font-mono text-lg font-semibold tracking-normal text-white">
            {result.title}
          </h4>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {result.summary}
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
            Label: {result.label.replaceAll("_", " ")} · Generated{" "}
            {formatDate(result.generated_at)}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-3 py-1.5 font-mono text-sm font-bold uppercase tracking-[0.12em] ${sessionQualityGradeClassName(
            result.grade,
          )}`}
        >
          {result.grade}
          {result.score === null ? "" : ` · ${result.score}/100`}
        </span>
      </div>

      {result.factors.length > 0 && (
        <div className="mt-4 grid gap-2 lg:grid-cols-2">
          {result.factors.slice(0, 5).map((factor) => (
            <div
              key={factor.code}
              className="rounded-md border border-white/10 bg-white/[0.025] p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-semibold text-zinc-200">
                  {factor.label}
                </p>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${sessionQualityFactorClassName(
                    factor.impact,
                  )}`}
                >
                  {factor.points > 0 ? `+${factor.points}` : factor.points}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {factor.description}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Session quality is analytics only. It does not block trades, change
        scoring, change risk settings, call AI, or control Avanza.
      </p>
    </div>
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
        <SummaryCard
          label="Est. Costs"
          value={formatPnl(summary.estimatedTotalBrokerCosts)}
        />
        <SummaryCard
          label="Est. Avg Cost"
          value={formatPnl(summary.estimatedAverageCostPerTrade)}
        />
        <SummaryCard
          label="Est. Net PnL"
          value={formatPnl(summary.estimatedNetPnlAfterCosts)}
          tone={summary.estimatedNetPnlAfterCosts}
        />
      </div>

      <p className="text-sm leading-6 text-zinc-500">
        Performance is based only on manually closed positions. Estimated costs
        use saved broker-cost snapshots when available; gross PnL is unchanged.
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
                  {getSetupTypeLabel(setup.setupType)}
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
  calibrationGuardrails,
  preTradeRiskContext,
  tradeEligibility,
  decisionStack,
  positionSizing,
  isSaving,
  isValidating,
  onTakeTrade,
  onIgnore,
}: {
  recommendation: Recommendation;
  calibrationGuardrails: CalibrationGuardrailResult | null;
  preTradeRiskContext: PreTradeRiskContextResult | null;
  tradeEligibility: TradeEligibilityResult | null;
  decisionStack: RecommendationDecisionStackResult | null;
  positionSizing: PositionSizing;
  isSaving: boolean;
  isValidating: boolean;
  onTakeTrade: (recommendation: Recommendation) => void | Promise<void>;
  onIgnore: (recommendation: Recommendation) => void;
}) {
  const freshness = getRecommendationFreshness(toFreshnessInput(recommendation));
  const isExpired = freshness === "expired";
  const addTradeGate = getAddTradeGate(recommendation, freshness);
  const confirmation = addTradeGate.confirmation;
  const isLowConfidence =
    recommendation.confidenceScore !== null && recommendation.confidenceScore < 60;
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
  const keyReasons = getRecommendationKeyReasons({
    recommendation,
    confirmation,
    decisionStack,
    calibrationGuardrails,
    preTradeRiskContext,
  });

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <CompanyIdentity
              ticker={recommendation.ticker}
              companyName={recommendation.companyName}
            />
            {decisionStack && (
              <span
                className={`w-fit rounded-full border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] ${recommendationDecisionStackClassName(
                  decisionStack.overall_status,
                )}`}
              >
                {decisionStack.overall_status}
              </span>
            )}
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            {getSetupTypeLabel(recommendation.setupType)} ·{" "}
            {recommendation.sessionLabel} · {recommendation.direction} ·{" "}
            {freshness} ·{" "}
            {recommendation.confidenceScore === null
              ? "Confidence n/a"
              : `${recommendation.confidenceScore}/100 confidence`}
          </p>
        </div>
      </div>

      {freshness === "aging" && (
        <DismissibleWarning
          storageKey={warningDismissKey([
            "recommendation-aging",
            recommendation.id,
            recommendation.ticker,
          ])}
          className="mt-4 rounded-md border border-yellow-300/25 bg-yellow-300/10 p-3 text-sm leading-6 text-yellow-100"
        >
          This setup is aging. Confirm price action before taking the trade.
        </DismissibleWarning>
      )}
      {freshness === "stale" && (
        <DismissibleWarning
          storageKey={warningDismissKey([
            "recommendation-stale",
            recommendation.id,
            recommendation.ticker,
          ])}
          className="mt-4 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100"
        >
          This setup is stale. Be selective and prefer a fresh scan if the move has
          changed.
        </DismissibleWarning>
      )}
      {isExpired && (
        <DismissibleWarning
          storageKey={warningDismissKey([
            "recommendation-expired",
            recommendation.id,
            recommendation.ticker,
          ])}
          className="mt-4 rounded-md border border-rose-300/30 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100"
        >
          This setup has expired. Generate a fresh recommendation before taking
          the trade.
        </DismissibleWarning>
      )}
      {isLowConfidence && (
        <DismissibleWarning
          storageKey={warningDismissKey([
            "recommendation-low-confidence",
            recommendation.id,
            recommendation.ticker,
          ])}
          className="mt-4 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100"
        >
          Low confidence setup. Review carefully before adding this trade.
        </DismissibleWarning>
      )}

      <PrimaryDecisionStrip
        decisionStack={decisionStack}
        tradeEligibility={tradeEligibility}
        preTradeRiskContext={preTradeRiskContext}
        addTradeGateMessage={addTradeGate.message}
      />

      <TradePlanSummary
        recommendation={recommendation}
        positionSizing={positionSizing}
      />

      <KeyReasonsPanel reasons={keyReasons} />

      <details className="mt-4 rounded-md border border-white/10 bg-black/20 p-4">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
          Decision details
        </summary>
        <div className="mt-4 space-y-4">
          <RecommendationDecisionStackPanel result={decisionStack} compact />
          <IntradayConfirmationPanel
            recommendation={recommendation}
            confirmation={confirmation}
            compact
          />
          {recommendation.confidenceBreakdown && (
            <div className="rounded-md border border-white/10 bg-black/20 px-3 py-2">
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
        </div>
      </details>

      {(preTradeRiskContext || tradeEligibility || calibrationGuardrails) && (
        <details className="mt-3 rounded-md border border-white/10 bg-black/20 p-4">
          <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
            More trade context
          </summary>
          <div className="mt-4 space-y-4">
            <PreTradeRiskContextPanel result={preTradeRiskContext} compact />
            <TradeEligibilityPanel result={tradeEligibility} compact />
            <CalibrationGuardrailsPanel result={calibrationGuardrails} compact />
          </div>
        </details>
      )}

      <details className="mt-3 rounded-md border border-white/10 bg-black/20 p-4">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
          Full rationale
        </summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <TextBlock
            label="Setup Type"
            value={getSetupTypeDescription(recommendation.setupType)}
          />
          <TextBlock label="Thesis" value={recommendation.thesis} />
          <TextBlock label="Invalidation" value={recommendation.invalidation} />
          <TextBlock label="Reason to Avoid" value={recommendation.reasonToAvoid} />
        </div>
      </details>

      <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-4">
        <div className="mb-3">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Next Action
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Advisory signals do not place trades. ADD TRADE runs latest
            validation before execution preparation.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => onTakeTrade(recommendation)}
          disabled={isSaving || isExpired || isValidating}
          className="min-h-11 flex-1 rounded-md bg-[#00db94] px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-[#00db94]/85 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isValidating
            ? "Validating Setup..."
            : addTradeGate.blocked && !isExpired
              ? "Review Setup"
              : "Add Trade"}
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
      </div>
    </article>
  );
}

function IntradayConfirmationPanel({
  recommendation,
  confirmation,
  compact = false,
}: {
  recommendation: Recommendation;
  confirmation: IntradayConfirmationStatus;
  compact?: boolean;
}) {
  const indicators = recommendation.intradayIndicators;

  return (
    <div
      className={`rounded-md border border-white/10 bg-black/20 px-3 py-2 ${
        compact ? "" : "mt-4"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Intraday Confirmation
        </p>
        <span
          className={`w-fit rounded-full border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${intradayConfirmationClassName(
            confirmation.status,
          )}`}
        >
          {intradayConfirmationLabel(confirmation.status)}
        </span>
      </div>

      {indicators ? (
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          VWAP {vwapLabel(indicators)} · Price vs VWAP{" "}
          {formatSignedPercent(indicators.priceVsVwapPercent)} · Momentum{" "}
          {titleCaseValue(indicators.momentumDirection)} · Volume{" "}
          {titleCaseValue(indicators.volumeTrend)}
        </p>
      ) : (
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Intraday confirmation unavailable.
        </p>
      )}

      {confirmation.severity !== "none" && confirmation.reasons.length > 0 && (
        <p
          className={`mt-2 text-xs leading-5 ${
            confirmation.severity === "block" ? "text-rose-100" : "text-amber-100"
          }`}
        >
          {confirmation.reasons.slice(0, 2).join(" ")}{" "}
          {confirmation.status === "weak" || confirmation.status === "unknown"
            ? "Refresh scanner or generate a fresh recommendation before entering."
            : ""}
        </p>
      )}
    </div>
  );
}

function TradeModal({
  recommendation,
  positionSizing,
  validation,
  validationMessage,
  brokerCostModel,
  isSaving,
  onClose,
  onSubmit,
}: {
  recommendation: Recommendation;
  positionSizing: PositionSizing;
  validation: AddTradeValidationResult | null;
  validationMessage: string;
  brokerCostModel: BrokerCostModel | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    brokerFill: BrokerFillConfirmation,
  ) => void;
}) {
  const freshness = getRecommendationFreshness(toFreshnessInput(recommendation));
  const addTradeGate = getAddTradeGate(recommendation, freshness);
  const payloadEntryPrice = getRecommendationEntryFallback(recommendation);
  const payloadShares = positionSizing.suggestedShares ?? null;
  const plannedStopLoss = recommendation.stopLossValue;
  const plannedTargetPrice = getPrimaryTargetPrice(recommendation);
  const [copyStatus, setCopyStatus] = useState("");
  const [handoffStatus, setHandoffStatus] =
    useState<TradeExecutionPayload["handoff_status"]>("draft");
  const [agentPreparedOrderForm, setAgentPreparedOrderForm] = useState(false);
  const [manualBrokerConfirmed, setManualBrokerConfirmed] = useState(false);
  const [brokerPlanMatches, setBrokerPlanMatches] = useState(false);
  const [brokerOrderStatus, setBrokerOrderStatus] =
    useState<BrokerOrderStatus>("filled");
  const [actualFillPriceInput, setActualFillPriceInput] = useState(() =>
    payloadEntryPrice === null ? "" : String(payloadEntryPrice),
  );
  const [actualSharesInput, setActualSharesInput] = useState(() =>
    payloadShares === null ? "" : String(payloadShares),
  );
  const [brokerReferenceNote, setBrokerReferenceNote] = useState("");
  const [previewCommissionInput, setPreviewCommissionInput] = useState("");
  const [previewFxFeeInput, setPreviewFxFeeInput] = useState("");
  const [previewTotalCostInput, setPreviewTotalCostInput] = useState("");
  const [buyingPowerStatus, setBuyingPowerStatus] =
    useState<BrokerOrderPreviewCapture["buying_power_status"]>("unknown");
  const [previewWarningType, setPreviewWarningType] =
    useState<BrokerOrderPreviewCapture["warning_type"]>("none");
  const [previewWarningText, setPreviewWarningText] = useState("");
  const [screenshotReferenceNote, setScreenshotReferenceNote] = useState("");
  const [agentDryRunResult, setAgentDryRunResult] =
    useState<AgentDryRunResult | null>(null);
  const [createBlockedMessage, setCreateBlockedMessage] = useState("");
  const [payloadNow, setPayloadNow] = useState(() => new Date());
  const generatedPayloadRef = useRef<string | null>(null);
  const [payloadCreatedAt] = useState(() => new Date().toISOString());
  const [handoffSessionId] = useState(() => createHandoffSessionId());
  const plannedBrokerCostEstimate = calculateBrokerCostEstimate({
    model: brokerCostModel,
    plannedEntryPrice: payloadEntryPrice,
    actualFillPrice: payloadEntryPrice,
    plannedShares: payloadShares,
    actualShares: payloadShares,
    stopLoss: plannedStopLoss,
    targetPrice: plannedTargetPrice,
  });
  const payload = buildTradeExecutionPayload({
    recommendationId: recommendation.id,
    ticker: recommendation.ticker,
    direction: recommendation.direction,
    setupType: recommendation.setupType,
    shares: payloadShares,
    entryPrice: payloadEntryPrice,
    limitPrice: payloadEntryPrice,
    stopLoss: recommendation.stopLossValue,
    targetPrice: plannedTargetPrice,
    latestPrice:
      validation?.latestIndicators?.latestPrice ??
      recommendation.intradayIndicators?.latestPrice ??
      null,
    validationStatus:
      validation?.status === "warning" || validation?.status === "unavailable"
        ? validation.status
        : "valid",
    intradayConfirmation: addTradeGate.confirmation.status,
    riskAmount: positionSizing.riskAmount,
    confidenceScore: recommendation.confidenceScore,
    validationReasons: validation?.reasons ?? [],
    now: payloadNow,
    handoffStatus,
    handoffSessionId,
    brokerCostModelSnapshot: brokerCostModel,
    brokerCostEstimate: plannedBrokerCostEstimate,
    notes: [
      "Prepared for future Avanza browser-agent form filling.",
      "Final broker confirmation is manual.",
    ],
    createdAt: payloadCreatedAt,
  });
  const payloadJson = tradeExecutionPayloadJson(payload);
  const payloadExpired = getPayloadSecondsUntilExpiry(payload, payloadNow) <= 0;
  const actualFillPrice = parseNumber(actualFillPriceInput);
  const actualShares = parseNumber(actualSharesInput);
  const normalizedActualShares =
    actualShares === null ? null : Math.floor(actualShares);
  const brokerOrderFilled =
    brokerOrderStatus === "filled" || brokerOrderStatus === "partially_filled";
  const plannedPositionValue =
    payloadEntryPrice !== null && payloadShares !== null
      ? payloadEntryPrice * payloadShares
      : null;
  const actualPositionValue =
    actualFillPrice !== null && normalizedActualShares !== null
      ? actualFillPrice * normalizedActualShares
      : null;
  const plannedRiskPerShare =
    payloadEntryPrice !== null && plannedStopLoss !== null
      ? payloadEntryPrice - plannedStopLoss
      : null;
  const actualRiskPerShare =
    actualFillPrice !== null && plannedStopLoss !== null
      ? actualFillPrice - plannedStopLoss
      : null;
  const plannedMaxLossAtStop =
    plannedRiskPerShare !== null &&
    plannedRiskPerShare > 0 &&
    payloadShares !== null
      ? plannedRiskPerShare * payloadShares
      : null;
  const actualMaxLossAtStop =
    actualRiskPerShare !== null &&
    actualRiskPerShare > 0 &&
    normalizedActualShares !== null
      ? actualRiskPerShare * normalizedActualShares
      : null;
  const actualBrokerCostEstimate = calculateBrokerCostEstimate({
    model: brokerCostModel,
    plannedEntryPrice: payloadEntryPrice,
    actualFillPrice,
    plannedShares: payloadShares,
    actualShares: normalizedActualShares,
    stopLoss: plannedStopLoss,
    targetPrice: plannedTargetPrice,
  });
  const brokerOrderPreview = buildBrokerOrderPreviewCapture({
    previewCommission: parseNumber(previewCommissionInput),
    previewFxFee: parseNumber(previewFxFeeInput),
    previewTotalEstimatedCost: parseNumber(previewTotalCostInput),
    buyingPowerStatus,
    warningType: previewWarningType,
    warningText: previewWarningText,
    screenshotReferenceNote,
  });
  const agentReadiness = calculateAgentReadiness({
    payload,
    now: payloadNow,
    brokerOrderPreview,
  });
  const previewComparison = {
    estimatedCost: actualBrokerCostEstimate.total_estimated_trading_cost,
    previewCost: brokerOrderPreview?.preview_total_estimated_cost ?? null,
    difference:
      brokerOrderPreview?.preview_total_estimated_cost !== null &&
      brokerOrderPreview?.preview_total_estimated_cost !== undefined &&
      actualBrokerCostEstimate.total_estimated_trading_cost !== null
        ? brokerOrderPreview.preview_total_estimated_cost -
          actualBrokerCostEstimate.total_estimated_trading_cost
        : null,
  };
  const actualFillPriceValid = actualFillPrice !== null && actualFillPrice > 0;
  const actualSharesValid =
    normalizedActualShares !== null && normalizedActualShares > 0;
  const actualStopInvalid =
    actualFillPrice !== null &&
    plannedStopLoss !== null &&
    plannedStopLoss >= actualFillPrice;
  const brokerFillReady =
    brokerOrderFilled &&
    actualFillPriceValid &&
    actualSharesValid &&
    !actualStopInvalid;
  const brokerFillBlockMessage =
    brokerOrderStatus === "submitted_not_filled"
      ? "Do not create a Live Day Trade until the broker order is filled."
      : !actualFillPriceValid
        ? "Actual fill price must be greater than zero."
        : !actualSharesValid
          ? "Actual shares must be greater than zero."
          : actualStopInvalid
            ? "Stop loss must be below actual fill price for a long trade."
            : "";
  const canCreateLiveDayTrade =
    !payloadExpired &&
    manualBrokerConfirmed &&
    brokerPlanMatches &&
    brokerFillReady;
  const handoffIntegrity = checkHandoffIntegrity({
    payload,
    handoffSessionId,
    recommendationId: recommendation.id,
    ticker: recommendation.ticker,
    plannedEntry: payloadEntryPrice,
    plannedShares: payloadShares,
    plannedStop: plannedStopLoss,
    plannedTarget: plannedTargetPrice,
    brokerOrderStatus,
    actualFillPrice,
    actualShares: normalizedActualShares,
    manualBrokerConfirmed,
    brokerPlanMatches,
    brokerOrderPreview,
    agentReadiness,
    dryRunResult: agentDryRunResult,
    validationStatus: validation?.status ?? payload.validation_status,
    intradayConfirmation: addTradeGate.confirmation.status,
    now: payloadNow,
  });

  useEffect(() => {
    if (generatedPayloadRef.current === recommendation.id) {
      return;
    }

    generatedPayloadRef.current = recommendation.id;
    logExecutionPayloadEvent("execution_payload_generated", payload);
  }, [payload, recommendation.id]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPayloadNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  async function copyExecutionPayload() {
    setCopyStatus("");

    if (payloadExpired) {
      setCopyStatus(
        "Execution payload expired. Reopen ADD TRADE to regenerate fresh order details.",
      );
      return;
    }

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyStatus("Clipboard unavailable. Select the JSON preview manually.");
      return;
    }

    try {
      const copiedPayload = buildTradeExecutionPayload({
        recommendationId: recommendation.id,
        ticker: recommendation.ticker,
        direction: recommendation.direction,
        setupType: recommendation.setupType,
        shares: payloadShares,
        entryPrice: payloadEntryPrice,
        limitPrice: payloadEntryPrice,
        stopLoss: recommendation.stopLossValue,
        targetPrice: plannedTargetPrice,
        latestPrice:
          validation?.latestIndicators?.latestPrice ??
          recommendation.intradayIndicators?.latestPrice ??
          null,
        validationStatus:
          validation?.status === "warning" || validation?.status === "unavailable"
            ? validation.status
            : "valid",
        intradayConfirmation: addTradeGate.confirmation.status,
        riskAmount: positionSizing.riskAmount,
        confidenceScore: recommendation.confidenceScore,
        validationReasons: validation?.reasons ?? [],
        now: payloadNow,
        handoffStatus: "copied",
        handoffSessionId,
        brokerCostModelSnapshot: brokerCostModel,
        brokerCostEstimate: plannedBrokerCostEstimate,
        notes: [
          "Prepared for future Avanza browser-agent form filling.",
          "Final broker confirmation is manual.",
        ],
        createdAt: payloadCreatedAt,
      });

      await navigator.clipboard.writeText(tradeExecutionPayloadJson(copiedPayload));
      setHandoffStatus("copied");
      logExecutionPayloadEvent("execution_payload_copied", copiedPayload);
      setCopyStatus("Execution payload copied.");
    } catch {
      setCopyStatus("Could not copy payload. Select the JSON preview manually.");
    }
  }

  function markPayloadReadyForAgent() {
    if (payloadExpired) {
      setCopyStatus(
        "Execution payload expired. Reopen ADD TRADE to regenerate fresh order details.",
      );
      return;
    }

    if (agentReadiness.status === "blocked") {
      logExecutionPayloadEvent(
        "agent_handoff_blocked_by_readiness",
        payload,
        agentReadiness,
      );
      setCopyStatus(
        "Agent handoff is blocked until payload readiness issues are resolved.",
      );
      return;
    }

    const readyPayload = buildTradeExecutionPayload({
      recommendationId: recommendation.id,
      ticker: recommendation.ticker,
      direction: recommendation.direction,
      setupType: recommendation.setupType,
      shares: payloadShares,
      entryPrice: payloadEntryPrice,
      limitPrice: payloadEntryPrice,
      stopLoss: recommendation.stopLossValue,
      targetPrice: plannedTargetPrice,
      latestPrice:
        validation?.latestIndicators?.latestPrice ??
        recommendation.intradayIndicators?.latestPrice ??
        null,
      validationStatus:
        validation?.status === "warning" || validation?.status === "unavailable"
          ? validation.status
          : "valid",
      intradayConfirmation: addTradeGate.confirmation.status,
      riskAmount: positionSizing.riskAmount,
      confidenceScore: recommendation.confidenceScore,
      validationReasons: validation?.reasons ?? [],
      now: payloadNow,
      handoffStatus: "ready_for_agent",
      handoffSessionId,
      brokerCostModelSnapshot: brokerCostModel,
      brokerCostEstimate: plannedBrokerCostEstimate,
      notes: [
        "Prepared for future Avanza browser-agent form filling.",
        "Final broker confirmation is manual.",
      ],
      createdAt: payloadCreatedAt,
    });

    setHandoffStatus("ready_for_agent");
    logExecutionPayloadEvent(
      "execution_payload_ready_for_agent",
      readyPayload,
      agentReadiness,
    );
    setCopyStatus(
      agentReadiness.status === "warning"
        ? "Marked ready for future agent handoff with readiness warnings. No browser or broker action was started."
        : "Marked ready for future agent handoff. No browser or broker action was started.",
    );
  }

  function updateManualBrokerConfirmed(checked: boolean) {
    setManualBrokerConfirmed(checked);

    if (checked) {
      logExecutionPayloadEvent("broker_manual_confirmation_checked", payload);
    }
  }

  function updateBrokerPlanMatches(checked: boolean) {
    setBrokerPlanMatches(checked);

    if (checked) {
      logExecutionPayloadEvent("broker_plan_match_checked", payload);
    }
  }

  function updateAgentPreparedOrderForm(checked: boolean) {
    if (checked && agentReadiness.status === "blocked") {
      logExecutionPayloadEvent(
        "agent_handoff_blocked_by_readiness",
        payload,
        agentReadiness,
      );
      setAgentPreparedOrderForm(false);
      setCopyStatus(
        "Agent handoff is blocked until payload readiness issues are resolved.",
      );
      return;
    }

    setAgentPreparedOrderForm(checked);

    if (checked) {
      logExecutionPayloadEvent(
        "agent_prepared_order_form_checked",
        payload,
        agentReadiness,
      );
    }
  }

  function runPreAgentDryRun() {
    const result = runAgentDryRun({
      payload,
      agentReadiness,
      validationStatus: validation?.status ?? payload.validation_status,
      intradayConfirmation: addTradeGate.confirmation.status,
      brokerOrderPreview,
      buyingPowerStatus,
      now: payloadNow,
    });

    setAgentDryRunResult(result);
    logAgentDryRunCompletedEvent(recommendation, payload, agentReadiness, result);
  }

  function handleTradeSubmit(event: FormEvent<HTMLFormElement>) {
    if (payloadExpired) {
      event.preventDefault();
      setCreateBlockedMessage(
        "Execution payload expired. Reopen ADD TRADE to regenerate fresh order details before creating a Live Day Trade.",
      );
      return;
    }

    if (!manualBrokerConfirmed || !brokerPlanMatches) {
      event.preventDefault();
      setCreateBlockedMessage(
        "Confirm the manual Avanza order and broker plan match before creating a Live Day Trade.",
      );
      return;
    }

    if (!brokerFillReady || actualFillPrice === null || normalizedActualShares === null) {
      event.preventDefault();
      setCreateBlockedMessage(
        brokerFillBlockMessage ||
          "Enter valid broker fill details before creating a Live Day Trade.",
      );
      return;
    }

    const integrityResult = checkHandoffIntegrity({
      payload,
      handoffSessionId,
      recommendationId: recommendation.id,
      ticker: recommendation.ticker,
      plannedEntry: payloadEntryPrice,
      plannedShares: payloadShares,
      plannedStop: plannedStopLoss,
      plannedTarget: plannedTargetPrice,
      brokerOrderStatus,
      actualFillPrice,
      actualShares: normalizedActualShares,
      manualBrokerConfirmed,
      brokerPlanMatches,
      brokerOrderPreview,
      agentReadiness,
      dryRunResult: agentDryRunResult,
      validationStatus: validation?.status ?? payload.validation_status,
      intradayConfirmation: addTradeGate.confirmation.status,
      now: payloadNow,
    });

    logHandoffIntegrityEvent(
      "handoff_integrity_checked",
      recommendation,
      payload,
      integrityResult,
    );

    if (integrityResult.status === "failed") {
      event.preventDefault();
      logHandoffIntegrityEvent(
        "handoff_integrity_failed",
        recommendation,
        payload,
        integrityResult,
      );
      setCreateBlockedMessage(integrityResult.summary);
      return;
    }

    onSubmit(event, {
      brokerOrderStatus,
      actualFillPrice,
      actualShares: normalizedActualShares,
      brokerReferenceNote: brokerReferenceNote.trim() || null,
      brokerConfirmedAt: new Date().toISOString(),
      plannedEntryPrice: payloadEntryPrice,
      plannedShares: payloadShares,
      plannedStopLoss,
      plannedTargetPrice,
      plannedPositionValue,
      plannedMaxLossAtStop,
      actualPositionValue,
      actualMaxLossAtStop,
      actualRiskPerShare,
      payloadId: payload.payload_id,
      payloadFingerprint: payload.payload_fingerprint,
      handoffSessionId: payload.handoff_session_id,
      setupType: payload.setup_type,
      validationStatus: payload.validation_status,
      executionPayloadVersion: payload.payload_version,
      brokerCostModelSnapshot: brokerCostModel,
      brokerCostEstimate: actualBrokerCostEstimate,
      brokerOrderPreview,
      handoffIntegrity: integrityResult,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">
      <form
        onSubmit={handleTradeSubmit}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-[#0b0c0c] p-5 shadow-2xl"
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

        {(validationMessage || addTradeGate.message) && (
          <DismissibleWarning
            storageKey={warningDismissKey([
              "trade-modal-validation",
              recommendation.id,
              validationMessage || addTradeGate.message,
            ])}
            className="mt-5 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100"
          >
            {validationMessage || addTradeGate.message}
          </DismissibleWarning>
        )}

        <PositionSizingSection positionSizing={positionSizing} />

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Detail label="Stop Loss" value={recommendation.stopLoss} />
          <Detail label="Target 1" value={recommendation.target1} />
          <Detail label="Target 2" value={recommendation.target2} />
        </div>

        <section className="mt-5 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.045] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
                Broker Order Preparation
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Trade can prepare broker order details, but you must manually
                confirm the final order in Avanza.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
                Manual confirmation required
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-200">
                No automatic order
              </span>
            </div>
          </div>

          <div
            id="trade-execution-payload-json"
            data-agent-readable="true"
            data-handoff-session-id={payload.handoff_session_id}
            data-payload-id={payload.payload_id}
            data-ticker={payload.ticker}
            data-broker-hint={payload.broker_hint}
            data-order-intent={payload.order_intent}
            className="sr-only"
          >
            {payloadJson}
          </div>

          <div className="mt-4 grid gap-2 rounded-md border border-white/10 bg-black/20 p-3 sm:grid-cols-2 lg:grid-cols-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                Handoff Session
              </p>
              <p className="mt-1 break-all font-mono text-xs text-zinc-300">
                {payload.handoff_session_id}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                Payload ID
              </p>
              <p className="mt-1 break-all font-mono text-xs text-zinc-300">
                {payload.payload_id}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                Fingerprint
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-300">
                {payload.payload_fingerprint}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                Expires
              </p>
              <p
                className={`mt-1 font-mono text-xs ${
                  payloadExpired ? "text-amber-100" : "text-zinc-300"
                }`}
              >
                {formatPayloadExpiry(payload, payloadNow)}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                Confirmation
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-300">
                Manual required
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                Mode
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-300">
                Prepare-only · {payload.handoff_status.replaceAll("_", " ")}
              </p>
            </div>
          </div>

          {payloadExpired && (
            <DismissibleWarning
              storageKey={warningDismissKey([
                "payload-expired-preparation",
                recommendation.id,
                payload.payload_id,
              ])}
              className="mt-4 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100"
            >
              Execution payload expired. Reopen ADD TRADE to regenerate fresh
              order details.
            </DismissibleWarning>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Ticker" value={payload.ticker} />
            <Detail label="Direction" value={payload.direction.toUpperCase()} />
            <Detail label="Shares" value={String(payload.shares)} />
            <Detail label="Order Type" value={payload.order_type.toUpperCase()} />
            <Detail label="Limit Price" value={formatCurrency(payload.limit_price)} />
            <Detail label="Stop Loss" value={formatCurrency(payload.stop_loss)} />
            <Detail
              label="Target"
              value={
                payload.target_price === null
                  ? "Not available"
                  : formatCurrency(payload.target_price)
              }
            />
            <Detail
              label="Position Value"
              value={formatCurrency(payload.position_value)}
            />
            <Detail
              label="Max Loss at Stop"
              value={formatCurrency(payload.max_loss_at_stop)}
            />
            <Detail
              label="Estimated R"
              value={
                payload.estimated_r_multiple === null
                  ? "Not available"
                  : `${payload.estimated_r_multiple.toFixed(2)}R`
              }
            />
            <Detail
              label="Validation"
              value={payload.validation_status.toUpperCase()}
            />
            <Detail
              label="Setup Type"
              value={getSetupTypeLabel(payload.setup_type)}
            />
            <Detail
              label="Confidence"
              value={
                payload.confidence_score === null
                  ? "Unavailable"
                  : `${payload.confidence_score} / 100`
              }
            />
          </div>

          {payload.safety_warnings.length > 0 && (
            <DismissibleWarning
              storageKey={warningDismissKey([
                "payload-safety-warnings",
                recommendation.id,
                payload.payload_fingerprint,
              ])}
              className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/10 p-3"
            >
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-amber-100">
                Safety warnings
              </p>
              <ul className="mt-2 space-y-1 text-sm leading-6 text-amber-100/90">
                {payload.safety_warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </DismissibleWarning>
          )}

          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Broker execution is manual. Verify ticker, share count, price, stop,
            target, and buying power in Avanza before confirming. Trade does not
            submit orders.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={copyExecutionPayload}
              disabled={payloadExpired}
              className="min-h-11 flex-1 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/70"
            >
              Copy Execution Payload
            </button>
            <button
              type="button"
              onClick={markPayloadReadyForAgent}
              disabled={payloadExpired || agentReadiness.status === "blocked"}
              className="min-h-11 flex-1 rounded-md border border-emerald-300/25 bg-emerald-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-emerald-100 transition hover:border-emerald-200/60 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-zinc-500"
            >
              Mark Ready For Agent
            </button>
          </div>

          <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
                  Agent Handoff Preview
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Future step: an AI browser-agent may use this payload to prepare
                  the Avanza order form. It must stop before final confirmation.
                </p>
              </div>
              <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                Preview only
              </span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Detail label="Handoff Session" value={payload.handoff_session_id} />
              <Detail label="Payload" value="Agent-readable" />
              <Detail label="Final Confirmation" value="Manual required" />
              <Detail label="Order Submit" value="Agent must not submit" />
              <Detail
                label="Expiry"
                value={payloadExpired ? "Expired - unavailable" : "Fresh payload"}
              />
            </div>

            <AgentReadinessPanel readiness={agentReadiness} />

            <div className="mt-4 rounded-md border border-cyan-300/15 bg-cyan-300/[0.04] p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100">
                    Pre-Agent Dry Run
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    This is a simulation only. No browser will open, no Avanza
                    form will be controlled, and no order will be submitted.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={runPreAgentDryRun}
                  className="min-h-10 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/70"
                >
                  Run Pre-Agent Dry Run
                </button>
              </div>
              {agentDryRunResult && (
                <AgentDryRunPanel result={agentDryRunResult} />
              )}
            </div>

            {payloadExpired ? (
              <DismissibleWarning
                storageKey={warningDismissKey([
                  "agent-payload-expired",
                  recommendation.id,
                  payload.payload_id,
                ])}
                className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100"
              >
                Payload expired. Agent handoff unavailable until ADD TRADE is
                reopened and validation runs again.
              </DismissibleWarning>
            ) : agentReadiness.status === "blocked" ? (
              <DismissibleWarning
                storageKey={warningDismissKey([
                  "agent-readiness-blocked",
                  recommendation.id,
                  payload.payload_id,
                ])}
                className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100"
              >
                Agent handoff is blocked until payload readiness issues are
                resolved.
              </DismissibleWarning>
            ) : agentReadiness.status === "warning" ? (
              <DismissibleWarning
                storageKey={warningDismissKey([
                  "agent-readiness-warning",
                  recommendation.id,
                  payload.payload_id,
                ])}
                className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100"
              >
                Agent handoff is available, but review readiness warnings before
                using this payload.
              </DismissibleWarning>
            ) : (
              <p className="mt-3 text-xs leading-5 text-zinc-500">
                Copy payload and Mark Ready For Agent are handoff signals only.
                They are not execution.
              </p>
            )}

            <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
              <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                View Agent Handoff Instructions
              </summary>
              <div className="mt-3 grid gap-3 text-sm leading-6 text-zinc-400 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100">
                    Agent may
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li>Read the execution payload.</li>
                    <li>Fill the Avanza order form.</li>
                    <li>Stop before final confirmation.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                    Agent must not
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li>Click final KOP/SALJ.</li>
                    <li>Submit orders.</li>
                    <li>Use expired payloads.</li>
                    <li>Invent missing details.</li>
                    <li>Continue through uncertainty.</li>
                  </ul>
                </div>
              </div>
              <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
                Hard stop: If anything differs from the payload or Avanza shows
                unexpected warnings, the agent must stop.
              </p>
            </details>
          </div>

          {copyStatus && (
            <p className="mt-3 text-sm leading-6 text-cyan-100">{copyStatus}</p>
          )}

          <details className="mt-4 rounded-md border border-white/10 bg-black/30 p-3">
            <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
              Payload JSON
            </summary>
            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-300">
              {payloadJson}
            </pre>
          </details>
        </section>

        <section className="mt-5 rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
                Broker Confirmation
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Recommendation validated → Broker order prepared → Manual Avanza
                confirmation required → Create Live Day Trade.
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Even if an agent prepares the form, you must manually verify and
                confirm the final order in Avanza.
              </p>
            </div>
            <span className="w-fit rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              Tracking only
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <BrokerConfirmationRow
              label="I manually confirmed the order in Avanza"
              checked={manualBrokerConfirmed}
              onChange={updateManualBrokerConfirmed}
            />
            <BrokerConfirmationRow
              label="Broker order matches Trade plan"
              checked={brokerPlanMatches}
              onChange={updateBrokerPlanMatches}
            />
          </div>

          <label
            className={`mt-3 flex min-h-11 items-center justify-between gap-3 rounded-md border px-3 py-2 ${
              agentPreparedOrderForm
                ? "border-[#00db94]/25 bg-[#00db94]/10"
                : "border-white/10 bg-black/20"
            } ${
              payloadExpired || agentReadiness.status === "blocked"
                ? "cursor-default opacity-60"
                : "cursor-pointer"
            }`}
          >
            <span className="text-sm leading-5 text-zinc-300">
              Agent prepared order form{" "}
              <span className="text-zinc-500">(optional local note)</span>
            </span>
            <input
              type="checkbox"
              checked={agentPreparedOrderForm}
              disabled={payloadExpired || agentReadiness.status === "blocked"}
              onChange={(event) =>
                updateAgentPreparedOrderForm(event.target.checked)
              }
              className="h-4 w-4 shrink-0 accent-[#00db94]"
            />
          </label>

          <HandoffIntegrityPanel result={handoffIntegrity} />

          <div className="mt-5 rounded-md border border-emerald-300/15 bg-emerald-300/[0.045] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                  Broker Fill Confirmation
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Enter the actual Avanza execution details before creating the
                  Live Day Trade.
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Use the actual fill price and shares from Avanza, not just the
                  planned values.
                </p>
              </div>
              <span className="w-fit rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                Manual entry
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Broker Order Status
                </span>
                <select
                  value={brokerOrderStatus}
                  onChange={(event) =>
                    setBrokerOrderStatus(event.target.value as BrokerOrderStatus)
                  }
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-emerald-300"
                >
                  <option value="filled">Filled</option>
                  <option value="partially_filled">Partially filled</option>
                  <option value="submitted_not_filled">Submitted, not filled</option>
                </select>
              </label>
              <label className="block">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Actual Fill Price
                </span>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={actualFillPriceInput}
                  onChange={(event) => setActualFillPriceInput(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-emerald-300"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Actual Shares
                </span>
                <input
                  required
                  type="number"
                  step="1"
                  min="0"
                  value={actualSharesInput}
                  onChange={(event) => setActualSharesInput(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-emerald-300"
                />
              </label>
            </div>

            <label className="mt-3 block">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Broker Reference / Note
              </span>
              <textarea
                value={brokerReferenceNote}
                onChange={(event) => setBrokerReferenceNote(event.target.value)}
                rows={2}
                placeholder="Optional Avanza reference, fill note, or partial-fill detail."
                className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 focus:border-emerald-300"
              />
            </label>

            <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                Planned vs Actual
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Detail
                  label="Entry"
                  value={`${formatCurrency(payloadEntryPrice)} → ${formatCurrency(
                    actualFillPrice,
                  )}`}
                />
                <Detail
                  label="Shares"
                  value={`${formatShares(payloadShares)} → ${formatShares(
                    normalizedActualShares,
                  )}`}
                />
                <Detail
                  label="Position Value"
                  value={`${formatCurrency(plannedPositionValue)} → ${formatCurrency(
                    actualPositionValue,
                  )}`}
                />
                <Detail
                  label="Max Loss"
                  value={`${formatCurrency(plannedMaxLossAtStop)} → ${formatCurrency(
                    actualMaxLossAtStop,
                  )}`}
                />
              </div>
            </div>

            {brokerOrderStatus === "partially_filled" && (
              <DismissibleWarning
                storageKey={warningDismissKey([
                  "partial-fill",
                  recommendation.id,
                  payload.payload_id,
                ])}
                className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100"
              >
                Partial fill: Live Day Trade will track only the filled shares.
              </DismissibleWarning>
            )}

            {brokerFillBlockMessage && (
              <DismissibleWarning
                storageKey={warningDismissKey([
                  "broker-fill-block",
                  recommendation.id,
                  brokerFillBlockMessage,
                ])}
                className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100"
              >
                {brokerFillBlockMessage}
              </DismissibleWarning>
            )}
          </div>

          <div className="mt-5 rounded-md border border-white/10 bg-black/20 p-4">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
              Broker Order Preview
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Optional: record what Avanza shows before you manually confirm the
              order.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Preview Commission / Courtage
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={previewCommissionInput}
                  onChange={(event) => setPreviewCommissionInput(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-emerald-300"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Preview FX Fee
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={previewFxFeeInput}
                  onChange={(event) => setPreviewFxFeeInput(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-emerald-300"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Preview Total Cost
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={previewTotalCostInput}
                  onChange={(event) => setPreviewTotalCostInput(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-emerald-300"
                />
              </label>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Buying Power Status
                </span>
                <select
                  value={buyingPowerStatus}
                  onChange={(event) =>
                    setBuyingPowerStatus(
                      event.target
                        .value as BrokerOrderPreviewCapture["buying_power_status"],
                    )
                  }
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-emerald-300"
                >
                  <option value="unknown">Unknown</option>
                  <option value="ok">OK</option>
                  <option value="warning">Warning</option>
                  <option value="insufficient">Insufficient</option>
                </select>
              </label>
              <label className="block">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Avanza Warning Shown
                </span>
                <select
                  value={previewWarningType}
                  onChange={(event) =>
                    setPreviewWarningType(
                      event.target.value as BrokerOrderPreviewCapture["warning_type"],
                    )
                  }
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-emerald-300"
                >
                  <option value="none">None</option>
                  <option value="price_warning">Price warning</option>
                  <option value="liquidity_warning">Liquidity warning</option>
                  <option value="buying_power_warning">Buying power warning</option>
                  <option value="instrument_warning">Instrument warning</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Warning / Note Text
                </span>
                <textarea
                  value={previewWarningText}
                  onChange={(event) => setPreviewWarningText(event.target.value)}
                  rows={2}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm leading-6 text-white outline-none focus:border-emerald-300"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Screenshot / Reference Note
                </span>
                <textarea
                  value={screenshotReferenceNote}
                  onChange={(event) =>
                    setScreenshotReferenceNote(event.target.value)
                  }
                  rows={2}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm leading-6 text-white outline-none focus:border-emerald-300"
                />
              </label>
            </div>

            {previewComparison.previewCost === null ? (
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Enter Avanza preview values to compare them with Trade estimates.
              </p>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <Detail
                  label="Trade Estimate"
                  value={formatSek(previewComparison.estimatedCost)}
                />
                <Detail
                  label="Avanza Preview"
                  value={formatSek(previewComparison.previewCost)}
                />
                <Detail
                  label="Difference"
                  value={formatSek(previewComparison.difference)}
                />
              </div>
            )}

            {buyingPowerStatus === "insufficient" && (
              <DismissibleWarning
                storageKey={warningDismissKey([
                  "buying-power-insufficient",
                  recommendation.id,
                  payload.payload_id,
                ])}
                className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100"
              >
                Buying power appears insufficient. Do not create a Live Day Trade
                unless the broker order is actually filled.
              </DismissibleWarning>
            )}
          </div>

          <BrokerCostEstimatePanel estimate={actualBrokerCostEstimate} />

          <DismissibleWarning
            storageKey={warningDismissKey([
              "manual-broker-confirmation-reminder",
              recommendation.id,
              payload.payload_id,
            ])}
            className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100"
          >
            <p>
              Only create the Live Day Trade after the order has been manually
              confirmed in Avanza.
            </p>
            <p className="mt-1">
              Trade does not know whether the broker order was actually
              submitted. You confirm this manually.
            </p>
          </DismissibleWarning>

          {payloadExpired && (
            <DismissibleWarning
              storageKey={warningDismissKey([
                "payload-expired-create",
                recommendation.id,
                payload.payload_id,
              ])}
              className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100"
            >
              Execution payload expired. Reopen ADD TRADE to regenerate fresh
              order details before creating a Live Day Trade.
            </DismissibleWarning>
          )}

          {createBlockedMessage && (
            <p className="mt-3 text-sm leading-6 text-amber-100">
              {createBlockedMessage}
            </p>
          )}
        </section>

        <button
          type="submit"
          disabled={isSaving || !canCreateLiveDayTrade}
          className="mt-5 min-h-11 w-full rounded-md bg-[#00db94] px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-[#00db94]/85 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isSaving
            ? "Saving trade"
            : "Create Live Day Trade After Broker Confirmation"}
        </button>
      </form>
    </div>
  );
}

function BrokerConfirmationRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex min-h-11 items-center justify-between gap-3 rounded-md border px-3 py-2 ${
        checked
          ? "border-[#00db94]/25 bg-[#00db94]/10"
          : "border-white/10 bg-black/20"
      } cursor-pointer`}
    >
      <span className="text-sm leading-5 text-zinc-200">
        {label}
        <span className="ml-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
          Required
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange?.(event.target.checked)}
        className="h-4 w-4 shrink-0 accent-[#00db94]"
      />
    </label>
  );
}

function agentReadinessTone(status: AgentReadinessStatus) {
  if (status === "ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function AgentReadinessPanel({
  readiness,
}: {
  readiness: AgentReadinessResult;
}) {
  const topIssues = readiness.issues.slice(0, 4);

  return (
    <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
            Agent Readiness
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {readiness.summary}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${agentReadinessTone(
            readiness.status,
          )}`}
        >
          {readiness.label} · {readiness.score}/100
        </span>
      </div>

      {topIssues.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {topIssues.map((issue) => (
            <li
              key={issue.code}
              className="rounded-md border border-white/10 bg-white/[0.025] p-2"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-medium text-zinc-200">{issue.label}</p>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${agentReadinessTone(
                    issue.severity === "blocked"
                      ? "blocked"
                      : issue.severity === "warning"
                        ? "warning"
                        : "ready",
                  )}`}
                >
                  {issue.severity}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {issue.description}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          No readiness issues detected.
        </p>
      )}
    </div>
  );
}

function agentDryRunTone(status: AgentDryRunStatus | AgentDryRunStepStatus) {
  if (status === "dry_run_passed" || status === "passed") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (status === "info") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function formatDryRunFieldValue(value: string | number | null) {
  if (value === null || value === "") {
    return "Not available";
  }

  return String(value);
}

function AgentDryRunPanel({ result }: { result: AgentDryRunResult }) {
  const importantSteps = result.steps.filter((step) => step.status !== "passed");
  const visibleSteps =
    importantSteps.length > 0 ? importantSteps : result.steps.slice(0, 4);

  return (
    <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
            Pre-Agent Dry Run Result
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {result.summary}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
            Generated {formatDate(result.generated_at)}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${agentDryRunTone(
            result.status,
          )}`}
        >
          {result.passed ? "Passed" : "Failed"}
        </span>
      </div>

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          Fields the Agent Would Prepare
        </summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {result.fields_to_prepare.map((field) => (
            <div
              key={field.field}
              className="rounded-md border border-white/10 bg-black/20 p-2"
            >
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                {field.field}
              </p>
              <p className="mt-1 break-words font-mono text-xs text-zinc-200">
                {formatDryRunFieldValue(field.value)}
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-600">
                {field.source.replaceAll("_", " ")}
              </p>
              {field.warning && (
                <p className="mt-1 text-xs leading-5 text-amber-100">
                  {field.warning}
                </p>
              )}
            </div>
          ))}
        </div>
      </details>

      <div className="mt-3 space-y-2">
        {visibleSteps.map((step) => (
          <div
            key={step.id}
            className="rounded-md border border-white/10 bg-white/[0.025] p-2"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <p className="text-sm font-medium text-zinc-200">{step.label}</p>
              <span
                className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${agentDryRunTone(
                  step.status,
                )}`}
              >
                {step.status}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {result.hard_stops.length > 0 && (
        <div className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/10 p-3">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-rose-100">
            Hard Stops
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-rose-100/90">
            {result.hard_stops.map((stop) => (
              <li key={stop.id}>{stop.label}: {stop.description}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function handoffIntegrityTone(
  status: HandoffIntegrityStatus | HandoffIntegrityIssueSeverity,
) {
  if (status === "passed" || status === "info") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function HandoffIntegrityPanel({
  result,
}: {
  result: HandoffIntegrityResult;
}) {
  const topIssues = result.issues.slice(0, 4);

  return (
    <div className="mt-5 rounded-md border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
            Handoff Integrity
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {result.summary}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
            Checked {formatDate(result.checked_at)}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${handoffIntegrityTone(
            result.status,
          )}`}
        >
          {result.label} · {result.score}/100
        </span>
      </div>

      {topIssues.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {topIssues.map((issue) => (
            <li
              key={issue.code}
              className="rounded-md border border-white/10 bg-white/[0.025] p-2"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-medium text-zinc-200">{issue.label}</p>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${handoffIntegrityTone(
                    issue.severity,
                  )}`}
                >
                  {issue.severity}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {issue.description}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          No integrity issues detected.
        </p>
      )}

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Integrity checks confirm this handoff session is internally consistent.
        They do not submit orders or control Avanza.
      </p>
    </div>
  );
}

function BrokerCostEstimatePanel({
  estimate,
  title = "Estimated Broker Costs",
}: {
  estimate: BrokerCostEstimate | null;
  title?: string;
}) {
  if (!estimate) {
    return null;
  }

  if (!estimate.enabled) {
    return (
      <div className="mt-5 rounded-md border border-white/10 bg-black/20 p-4">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Broker cost estimates are disabled in Settings.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-md border border-cyan-300/15 bg-cyan-300/[0.04] p-4">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Estimated only. Verify actual fees in Avanza. Gross PnL is unchanged.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Detail
          label="Entry Commission"
          value={formatSek(estimate.entry_commission_estimate)}
        />
        <Detail
          label="Exit Commission"
          value={formatSek(estimate.exit_commission_estimate)}
        />
        <Detail
          label="Total Commission"
          value={formatSek(estimate.total_commission_estimate)}
        />
        <Detail label="FX Fee" value={formatSek(estimate.total_fx_fee_estimate)} />
        <Detail
          label="Total Cost"
          value={formatSek(estimate.total_estimated_trading_cost)}
        />
        <Detail
          label="Gross R"
          value={
            estimate.estimated_gross_r === null
              ? "Not available"
              : `${estimate.estimated_gross_r.toFixed(2)}R`
          }
        />
        <Detail
          label="Net R Est."
          value={
            estimate.estimated_net_r === null
              ? "Not available"
              : `${estimate.estimated_net_r.toFixed(2)}R`
          }
        />
        <Detail
          label="Break-even"
          value={formatCurrency(estimate.estimated_break_even_price)}
        />
      </div>
      {estimate.warnings.length > 0 && (
        <p className="mt-3 text-xs leading-5 text-amber-100">
          {estimate.warnings.slice(0, 2).join(" ")}
        </p>
      )}
    </div>
  );
}

function executionQualityClassName(value: ExecutionQualityRating) {
  if (value === "excellent" || value === "good") {
    return "border-[#00db94]/25 bg-[#00db94]/10 text-emerald-100";
  }

  if (value === "acceptable") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  if (value === "poor") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

function ExecutionQualityPanel({
  metadata,
  compact = false,
}: {
  metadata: BrokerExecutionMetadata | null;
  compact?: boolean;
}) {
  if (!metadata) {
    return null;
  }

  const metrics = calculateExecutionQuality(metadata);

  return (
    <div className="mt-5 rounded-md border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
            Execution Quality
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {getSlippageDirectionLabel(metrics.slippage_direction)}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${executionQualityClassName(
            metrics.quality_rating,
          )}`}
        >
          {getExecutionQualityLabel(metrics.quality_rating)}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Detail
          label="Slippage"
          value={`${formatSignedCurrency(metrics.slippage_amount_usd)} / ${formatSignedPercent(
            metrics.slippage_percent,
          )} / ${formatBasisPoints(metrics.slippage_bps)}`}
        />
        <Detail
          label="Fill"
          value={
            metrics.is_partial_fill
              ? `Partial ${formatFillRatio(metrics.share_fill_ratio)}`
              : formatFillRatio(metrics.share_fill_ratio)
          }
        />
        <Detail
          label="Broker Status"
          value={metrics.broker_order_status?.replaceAll("_", " ") ?? "Unknown"}
        />
        <Detail
          label="Net R Est."
          value={
            metrics.estimated_net_r === null
              ? "Not available"
              : `${metrics.estimated_net_r.toFixed(2)}R`
          }
        />
        {!compact && (
          <Detail
            label="Break-even"
            value={formatCurrency(metrics.estimated_break_even_price)}
          />
        )}
      </div>
    </div>
  );
}

function shortPayloadId(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return value.length > 28 ? `${value.slice(0, 28)}...` : value;
}

function buyingPowerStatusLabel(
  value: BrokerOrderPreviewCapture["buying_power_status"],
) {
  if (value === "ok") return "OK";
  if (value === "warning") return "Warning";
  if (value === "insufficient") return "Insufficient";
  return "Unknown";
}

function brokerWarningTypeLabel(
  value: BrokerOrderPreviewCapture["warning_type"],
) {
  if (value === "price_warning") return "Price";
  if (value === "liquidity_warning") return "Liquidity";
  if (value === "buying_power_warning") return "Buying Power";
  if (value === "instrument_warning") return "Instrument";
  if (value === "other") return "Other";
  return "None";
}

function BrokerOrderPreviewPanel({
  metadata,
  compact = false,
}: {
  metadata: BrokerExecutionMetadata | null;
  compact?: boolean;
}) {
  const preview = metadata?.broker_order_preview;

  if (!preview) {
    return null;
  }

  const difference = calculateBrokerPreviewDifference(metadata);

  return (
    <div className="mt-5 rounded-md border border-white/10 bg-black/20 p-4">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
        Broker Preview
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Detail
          label="Preview Cost"
          value={formatSek(preview.preview_total_estimated_cost)}
        />
        <Detail
          label="Buying Power"
          value={buyingPowerStatusLabel(preview.buying_power_status)}
        />
        <Detail
          label="Warning"
          value={brokerWarningTypeLabel(preview.warning_type)}
        />
        <Detail
          label="Cost Diff"
          value={formatSek(difference.total_cost_difference)}
        />
      </div>
      {!compact && preview.warning_text && (
        <p className="mt-3 text-sm leading-6 text-amber-100">
          {preview.warning_text}
        </p>
      )}
      {!compact && preview.screenshot_reference_note && (
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {preview.screenshot_reference_note}
        </p>
      )}
    </div>
  );
}

function timelineStatusClassName(status: ExecutionTimelineEvent["status"]) {
  if (status === "completed") {
    return "border-[#00db94]/25 bg-[#00db94]/10 text-emerald-100";
  }

  if (status === "warning") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  if (status === "missing") {
    return "border-white/10 bg-white/[0.03] text-zinc-500";
  }

  return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
}

function replayStatusClassName(
  status: HandoffReplayResult["overall_status"] | HandoffReplayStepStatus,
) {
  if (status === "complete" || status === "completed") {
    return "border-[#00db94]/25 bg-[#00db94]/10 text-emerald-100";
  }

  if (status === "partial" || status === "warning") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  if (status === "failed") {
    return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  }

  if (status === "missing") {
    return "border-white/10 bg-white/[0.03] text-zinc-500";
  }

  return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
}

function handoffQualityClassName(
  ratingOrImpact: HandoffQualityRating | HandoffQualityFactorImpact,
) {
  if (ratingOrImpact === "excellent" || ratingOrImpact === "positive") {
    return "border-[#00db94]/25 bg-[#00db94]/10 text-emerald-100";
  }

  if (ratingOrImpact === "good") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }

  if (ratingOrImpact === "acceptable" || ratingOrImpact === "warning") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  if (ratingOrImpact === "poor" || ratingOrImpact === "negative") {
    return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.03] text-zinc-500";
}

function improvementPriorityClassName(priority: ExecutionImprovementPriority) {
  if (priority === "high") {
    return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  }

  if (priority === "medium") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
}

function formatTimelineTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function ExecutionImprovementSuggestionsPanel({
  position,
  closedAt,
  eodSafetyStatus,
}: {
  position: ActivePosition;
  closedAt?: string | null;
  eodSafetyStatus?: EndOfDaySafetyStatus;
}) {
  const timeline = buildExecutionTimeline({
    positionId: position.id,
    recommendationId: position.recommendationId,
    ticker: position.ticker,
    status: closedAt ? "closed" : "open",
    openedAt: position.openedAtRaw,
    closedAt,
    executionMetadata: position.executionMetadata,
    localEvents: readTradeManagementEvents(),
  });
  const replay = buildHandoffSessionReplay({
    executionMetadata: position.executionMetadata,
    timelineEvents: timeline,
    openedAt: position.openedAtRaw,
    closedAt,
  });
  const executionQuality = calculateExecutionQuality(position.executionMetadata);
  const quality = calculateHandoffQuality({
    executionMetadata: position.executionMetadata,
    executionQualityMetrics: executionQuality,
    handoffReplay: replay,
    timelineEvents: timeline,
    calculatedAt: position.executionMetadata?.handoff_quality?.calculated_at,
  });
  const result = buildExecutionImprovementSuggestions({
    brokerExecutionMetadata: position.executionMetadata,
    handoffQuality: quality,
    executionQualityMetrics: executionQuality,
    handoffReplay: replay,
    timelineEvents: timeline,
    eodSafetyStatus,
  });
  const topSuggestions = result.suggestions.slice(0, 5);

  if (!position.executionMetadata && topSuggestions.length === 0) {
    return null;
  }

  return (
    <details className="mt-5 rounded-md border border-white/10 bg-black/20 p-4">
      <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
        Execution Improvement Suggestions
      </summary>
      <p className="mt-4 text-sm leading-6 text-zinc-400">{result.summary}</p>
      {topSuggestions.length > 0 ? (
        <div className="mt-3 space-y-2">
          {topSuggestions.map((suggestion) => (
            <div
              key={suggestion.code}
              className="rounded-md border border-white/10 bg-white/[0.025] p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    {suggestion.title}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                    {suggestion.category.replaceAll("_", " ")}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${improvementPriorityClassName(
                    suggestion.priority,
                  )}`}
                >
                  {suggestion.priority}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                {suggestion.description}
              </p>
              <p className="mt-2 text-xs leading-5 text-zinc-300">
                {suggestion.suggested_action}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          No major execution improvement suggestions.
        </p>
      )}
      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Suggestions are analytics only. They do not block trades, change PnL, or
        control Avanza.
      </p>
    </details>
  );
}

function tradeOutcomeClassificationLabel(value: TradeOutcomeClassification) {
  if (value === "strong_win") return "Strong win";
  if (value === "small_win") return "Small win";
  if (value === "breakeven") return "Breakeven";
  if (value === "small_loss") return "Small loss";
  if (value === "hard_loss") return "Hard loss";
  return "Unknown";
}

function tradeOutcomeClassificationClassName(value: TradeOutcomeClassification) {
  if (value === "strong_win" || value === "small_win") {
    return "border-[#00db94]/25 bg-[#00db94]/10 text-emerald-100";
  }

  if (value === "breakeven") {
    return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
  }

  if (value === "small_loss") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  if (value === "hard_loss") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

function tradeOutcomeDriverClassName(value: TradeOutcomeDriverImpact) {
  if (value === "positive") {
    return "border-[#00db94]/25 bg-[#00db94]/10 text-emerald-100";
  }

  if (value === "negative") {
    return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  }

  if (value === "neutral") {
    return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

function TradeOutcomeExplainerPanel({ position }: { position: ClosedPosition }) {
  const explanation = buildTradeOutcomeExplanationForPosition(position);

  return (
    <details className="mt-5 rounded-md border border-white/10 bg-black/20 p-4">
      <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
        Trade Outcome Explainer
      </summary>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm leading-6 text-zinc-300">
            {explanation.simple_explanation}
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
            Primary driver:{" "}
            {tradeOutcomePrimaryDriverLabel(explanation.primary_driver)} ·
            Confidence {explanation.confidence}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${tradeOutcomeClassificationClassName(
            explanation.classification,
          )}`}
        >
          {tradeOutcomeClassificationLabel(explanation.classification)}
        </span>
      </div>

      {explanation.drivers.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {explanation.drivers.slice(0, 6).map((driver) => (
            <div
              key={driver.code}
              className="rounded-md border border-white/10 bg-white/[0.025] p-3"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-semibold text-zinc-200">
                  {driver.label}
                </p>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${tradeOutcomeDriverClassName(
                    driver.impact,
                  )}`}
                >
                  {driver.impact}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {driver.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {explanation.what_to_watch_next_time.length > 0 && (
        <div className="mt-4 rounded-md border border-white/10 bg-white/[0.025] p-3">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
            What to watch next time
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-400">
            {explanation.what_to_watch_next_time.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Generated {formatDate(explanation.generated_at)} from structured trade
        data only. No AI calls were made.
      </p>
    </details>
  );
}

function HandoffQualityPanel({
  position,
  closedAt,
}: {
  position: ActivePosition;
  closedAt?: string | null;
}) {
  if (!position.executionMetadata) {
    return null;
  }

  const timeline = buildExecutionTimeline({
    positionId: position.id,
    recommendationId: position.recommendationId,
    ticker: position.ticker,
    status: closedAt ? "closed" : "open",
    openedAt: position.openedAtRaw,
    closedAt,
    executionMetadata: position.executionMetadata,
    localEvents: readTradeManagementEvents(),
  });
  const replay = buildHandoffSessionReplay({
    executionMetadata: position.executionMetadata,
    timelineEvents: timeline,
    openedAt: position.openedAtRaw,
    closedAt,
  });
  const quality = calculateHandoffQuality({
    executionMetadata: position.executionMetadata,
    executionQualityMetrics: calculateExecutionQuality(position.executionMetadata),
    handoffReplay: replay,
    timelineEvents: timeline,
    calculatedAt: position.executionMetadata.handoff_quality?.calculated_at,
  });
  const topFactors = quality.factors
    .filter((factor) => factor.impact !== "neutral")
    .slice(0, 6);

  return (
    <details className="mt-5 rounded-md border border-white/10 bg-black/20 p-4">
      <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
        Handoff Quality
      </summary>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm leading-6 text-zinc-400">{quality.summary}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
            Calculated {formatDate(quality.calculated_at)}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${handoffQualityClassName(
            quality.rating,
          )}`}
        >
          {quality.label} · {quality.score}/100
        </span>
      </div>
      {topFactors.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {topFactors.map((factor) => (
            <div
              key={factor.code}
              className="rounded-md border border-white/10 bg-white/[0.025] p-3"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-semibold text-zinc-200">
                  {factor.label}
                </p>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${handoffQualityClassName(
                    factor.impact,
                  )}`}
                >
                  {factor.points > 0 ? `+${factor.points}` : factor.points}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {factor.description}
              </p>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Handoff quality is analytics only. It does not affect PnL, create
        orders, or control Avanza.
      </p>
    </details>
  );
}

function HandoffSessionReplayPanel({
  position,
  closedAt,
}: {
  position: ActivePosition;
  closedAt?: string | null;
}) {
  const timeline = buildExecutionTimeline({
    positionId: position.id,
    recommendationId: position.recommendationId,
    ticker: position.ticker,
    status: closedAt ? "closed" : "open",
    openedAt: position.openedAtRaw,
    closedAt,
    executionMetadata: position.executionMetadata,
    localEvents: readTradeManagementEvents(),
  });
  const replay = buildHandoffSessionReplay({
    executionMetadata: position.executionMetadata,
    timelineEvents: timeline,
    openedAt: position.openedAtRaw,
    closedAt,
  });

  if (replay.overall_status === "unknown" && !position.executionMetadata) {
    return null;
  }

  return (
    <details className="mt-5 rounded-md border border-white/10 bg-black/20 p-4">
      <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
        Handoff Session Replay
      </summary>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm leading-6 text-zinc-400">{replay.summary}</p>
          {replay.handoff_session_id && (
            <p className="mt-1 break-all font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
              Session: {shortPayloadId(replay.handoff_session_id)}
            </p>
          )}
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${replayStatusClassName(
            replay.overall_status,
          )}`}
        >
          {replay.overall_status}
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {replay.steps.map((step) => (
          <div
            key={step.id}
            className="grid gap-2 rounded-md border border-white/10 bg-white/[0.025] p-3 sm:grid-cols-[92px_1fr_auto]"
          >
            <div className="font-mono text-xs text-zinc-500">
              {step.timestamp ? formatTimelineTimestamp(step.timestamp) : "—"}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-200">{step.label}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {step.summary}
              </p>
              {step.detail && (
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  {step.detail}
                </p>
              )}
            </div>
            <span
              className={`w-fit rounded-full border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${replayStatusClassName(
                step.status,
              )}`}
            >
              {step.status}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Replay is an audit view only. It does not mean Avanza was controlled or
        that an order was submitted automatically.
      </p>
    </details>
  );
}

function ExecutionTimelinePanel({
  position,
  closedAt,
}: {
  position: ActivePosition;
  closedAt?: string | null;
}) {
  const timeline = buildExecutionTimeline({
    positionId: position.id,
    recommendationId: position.recommendationId,
    ticker: position.ticker,
    status: closedAt ? "closed" : "open",
    openedAt: position.openedAtRaw,
    closedAt,
    executionMetadata: position.executionMetadata,
    localEvents: readTradeManagementEvents(),
  });

  if (timeline.length === 0 && !position.executionMetadata) {
    return null;
  }

  const hasLocalEvents = timeline.some((event) => event.source === "local_event");

  return (
    <details className="mt-5 rounded-md border border-white/10 bg-black/20 p-4">
      <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
        Execution Timeline
      </summary>
      <div className="mt-4 space-y-2">
        {timeline.slice(0, 8).map((event) => (
          <div
            key={event.id}
            className="grid gap-2 rounded-md border border-white/10 bg-white/[0.025] p-3 sm:grid-cols-[92px_1fr_auto]"
          >
            <div className="font-mono text-xs text-zinc-500">
              {formatTimelineTimestamp(event.timestamp)}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-200">{event.label}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {event.description}
              </p>
              {event.handoff_session_id && (
                <p className="mt-1 break-all font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                  Session: {shortPayloadId(event.handoff_session_id)}
                </p>
              )}
            </div>
            <span
              className={`w-fit rounded-full border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${timelineStatusClassName(
                event.status,
              )}`}
            >
              {event.source.replaceAll("_", " ")}
            </span>
          </div>
        ))}
      </div>
      {!hasLocalEvents && (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Some local handoff events may be unavailable after browser or device
          changes.
        </p>
      )}
    </details>
  );
}

function BrokerExecutionMetadataPanel({
  metadata,
  compact = false,
}: {
  metadata: BrokerExecutionMetadata | null;
  compact?: boolean;
}) {
  if (!metadata) {
    return null;
  }

  return (
    <div className="mt-5 rounded-md border border-emerald-300/15 bg-emerald-300/[0.045] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-100">
            Execution
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Actual fill: {formatCurrency(metadata.actual_fill_price)} · Planned:{" "}
            {formatCurrency(metadata.planned_entry_price)}
          </p>
          <p className="text-sm leading-6 text-zinc-400">
            Shares: actual {formatShares(metadata.actual_shares)} · Planned{" "}
            {formatShares(metadata.planned_shares)}
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
          {brokerOrderStatusLabel(metadata.broker_order_status)}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Broker" value={metadata.broker_hint} />
        <Detail
          label="Handoff Session"
          value={metadata.handoff_session_id ?? "Not recorded"}
        />
        <Detail
          label="Manual Confirmed"
          value={metadata.manual_confirmation_required ? "Recorded" : "Unknown"}
        />
        <Detail
          label="Payload"
          value={
            metadata.execution_payload_fingerprint ??
            shortPayloadId(metadata.execution_payload_id)
          }
        />
        {!compact && (
          <Detail
            label="Confirmed At"
            value={formatDate(metadata.broker_confirmed_at)}
          />
        )}
      </div>

      {!compact && metadata.broker_reference_note && (
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          {metadata.broker_reference_note}
        </p>
      )}

      {metadata.broker_cost_estimate?.enabled && (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Detail
            label="Cost Estimate"
            value={formatSek(metadata.estimated_total_trading_cost)}
          />
          <Detail
            label="Net R Est."
            value={
              metadata.estimated_net_r === null
                ? "Not available"
                : `${metadata.estimated_net_r.toFixed(2)}R`
            }
          />
          <Detail
            label="Break-even"
            value={formatCurrency(metadata.estimated_break_even_price)}
          />
        </div>
      )}

      {metadata.handoff_integrity && (
        <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                Handoff Integrity
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Checked {formatDate(metadata.handoff_integrity.checked_at)}
              </p>
            </div>
            <span
              className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${handoffIntegrityTone(
                metadata.handoff_integrity.status,
              )}`}
            >
              {metadata.handoff_integrity.status} ·{" "}
              {metadata.handoff_integrity.score}/100
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Failed {metadata.handoff_integrity.failed_codes.length} · Warnings{" "}
            {metadata.handoff_integrity.warning_codes.length}
          </p>
        </div>
      )}
    </div>
  );
}

function setupTypeLabelFromActivePosition(position: ActivePosition) {
  return getSetupTypeLabel(position.executionMetadata?.setup_type ?? "UNKNOWN");
}

function ClosedTradeResultStrip({
  position,
  outcome,
}: {
  position: ClosedPosition;
  outcome: TradeOutcomeExplanation;
}) {
  return (
    <section className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Detail label="PnL" value={position.pnl} />
        <Detail label="R Multiple" value={position.rMultiple} />
        <Detail label="Entry" value={position.entryPrice} />
        <Detail label="Exit" value={position.exitPrice} />
        <Detail label="Shares" value={position.positionSize} />
        <Detail
          label="Outcome"
          value={tradeOutcomeClassificationLabel(outcome.classification)}
        />
        <Detail
          label="Net R Est."
          value={
            position.executionMetadata?.estimated_net_r === null ||
            position.executionMetadata?.estimated_net_r === undefined
              ? "Not available"
              : `${position.executionMetadata.estimated_net_r.toFixed(2)}R`
          }
        />
        <Detail
          label="Est. Cost"
          value={formatSek(position.executionMetadata?.estimated_total_trading_cost)}
        />
      </div>
    </section>
  );
}

function ClosedTradeOutcomeSummary({
  explanation,
}: {
  explanation: TradeOutcomeExplanation;
}) {
  const visibleDrivers = explanation.drivers.slice(0, 3);

  return (
    <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Outcome Explainer
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {explanation.simple_explanation}
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
            Primary driver:{" "}
            {tradeOutcomePrimaryDriverLabel(explanation.primary_driver)} ·
            Confidence {explanation.confidence}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${tradeOutcomeClassificationClassName(
            explanation.classification,
          )}`}
        >
          {tradeOutcomeClassificationLabel(explanation.classification)}
        </span>
      </div>

      {visibleDrivers.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {visibleDrivers.map((driver) => (
            <div
              key={driver.code}
              className="rounded-md border border-white/10 bg-white/[0.025] p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-zinc-200">
                  {driver.label}
                </p>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${tradeOutcomeDriverClassName(
                    driver.impact,
                  )}`}
                >
                  {driver.impact}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {driver.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ClosedTradeProcessQualitySummary({
  position,
  executionQuality,
  handoffQuality,
  replay,
}: {
  position: ClosedPosition;
  executionQuality: ExecutionQualityMetrics;
  handoffQuality: ReturnType<typeof calculateHandoffQuality>;
  replay: HandoffReplayResult;
}) {
  const integrity = position.executionMetadata?.handoff_integrity;

  return (
    <section className="mt-4 grid gap-3 lg:grid-cols-2">
      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
              Execution Quality
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {getSlippageDirectionLabel(executionQuality.slippage_direction)}
            </p>
          </div>
          <span
            className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${executionQualityClassName(
              executionQuality.quality_rating,
            )}`}
          >
            {getExecutionQualityLabel(executionQuality.quality_rating)}
          </span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Detail
            label="Slippage"
            value={`${formatSignedCurrency(
              executionQuality.slippage_amount_usd,
            )} / ${formatBasisPoints(executionQuality.slippage_bps)}`}
          />
          <Detail
            label="Net R Est."
            value={
              executionQuality.estimated_net_r === null
                ? "Not available"
                : `${executionQuality.estimated_net_r.toFixed(2)}R`
            }
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
              Handoff Quality
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {handoffQuality.summary}
            </p>
          </div>
          <span
            className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${handoffQualityClassName(
              handoffQuality.rating,
            )}`}
          >
            {handoffQuality.label} · {handoffQuality.score}/100
          </span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Detail label="Replay" value={replay.overall_status} />
          <Detail
            label="Integrity"
            value={
              integrity ? `${integrity.status} · ${integrity.score}/100` : "—"
            }
          />
        </div>
      </div>
    </section>
  );
}

function ClosedTradeKeyLearnings({
  explanation,
  suggestions,
}: {
  explanation: TradeOutcomeExplanation;
  suggestions: ReturnType<typeof buildExecutionImprovementSuggestions>;
}) {
  const items = [
    ...suggestions.suggestions.slice(0, 3).map((suggestion) => ({
      key: suggestion.code,
      title: suggestion.title,
      detail: suggestion.suggested_action,
      tone: suggestion.priority,
    })),
    ...explanation.what_to_watch_next_time.slice(0, 3).map((item, index) => ({
      key: `watch-${index}-${item}`,
      title: "Watch next time",
      detail: item,
      tone: "low" as ExecutionImprovementPriority,
    })),
  ].slice(0, 3);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        Key Learnings
      </p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-md border border-white/10 bg-white/[0.025] p-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <p className="text-sm font-semibold text-zinc-200">{item.title}</p>
              <span
                className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${improvementPriorityClassName(
                  item.tone,
                )}`}
              >
                {item.tone}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-500">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LiveTradePrimaryStatusStrip({
  latestUpdate,
  currentR,
  unrealizedPnl,
  action,
  eodSafetyStatus,
  urgency,
}: {
  latestUpdate?: LatestPositionUpdate;
  currentR: number | null;
  unrealizedPnl: { pnl: number | null; percent: number | null };
  action: string;
  eodSafetyStatus: EndOfDaySafetyStatus;
  urgency: PositionUpdateUrgency;
}) {
  return (
    <section className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Detail
          label="Current"
          value={latestUpdate ? latestUpdate.currentPrice : "Waiting"}
        />
        <Detail
          label="Unrealized PnL"
          value={formatSignedCurrency(unrealizedPnl.pnl)}
        />
        <Detail
          label="PnL %"
          value={
            latestUpdate?.unrealizedPercentValue !== null &&
            latestUpdate?.unrealizedPercentValue !== undefined
              ? formatSignedPercent(latestUpdate.unrealizedPercentValue)
              : formatSignedPercent(unrealizedPnl.percent)
          }
        />
        <Detail label="Current R" value={formatSignedR(currentR)} />
        <Detail label="Rule Action" value={positionActionLabel(action)} />
        <Detail
          label="EOD / Urgency"
          value={`${endOfDaySafetyLabel(eodSafetyStatus.status)} · ${urgency.urgency}`}
        />
      </div>
      {(urgency.urgency !== "normal" || eodSafetyStatus.severity !== "none") && (
        <p
          className={`mt-3 text-sm leading-6 ${
            urgency.urgency === "critical" || eodSafetyStatus.severity === "critical"
              ? "text-rose-100"
              : "text-amber-100"
          }`}
        >
          {latestUpdate?.reason || urgency.reasons[0] || eodSafetyStatus.message}
        </p>
      )}
    </section>
  );
}

function LiveTradeActionGuidance({
  latestUpdate,
  action,
  warnings,
  eodSafetyStatus,
  closeRequiredAction,
}: {
  latestUpdate?: LatestPositionUpdate;
  action: string;
  warnings: string[];
  eodSafetyStatus: EndOfDaySafetyStatus;
  closeRequiredAction: boolean;
}) {
  const isCloseAction = isCloseRequiredAction(action);

  return (
    <section
      className={`mt-4 rounded-lg border p-4 ${
        isCloseAction || eodSafetyStatus.severity === "critical"
          ? "border-rose-300/30 bg-rose-300/[0.055]"
          : "border-white/10 bg-black/20"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Action Guidance
          </p>
          <div
            className={`mt-2 inline-flex w-fit rounded-full border px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.14em] ${positionActionClassName(
              action,
            )}`}
          >
            {positionActionLabel(action)}
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            {latestUpdate?.reason ||
              (closeRequiredAction
                ? "Broker action should be completed manually before closing this trade in app."
                : "No urgent rule-engine action is available yet. Keep the trade monitored.")}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${eodSafetyPillClassName(
            eodSafetyStatus,
          )}`}
        >
          {endOfDaySafetyLabel(eodSafetyStatus.status)}
        </span>
      </div>

      {warnings.length > 0 && (
        <p className="mt-3 text-sm leading-6 text-amber-100">
          {warnings.slice(0, 2).join(" ")}
        </p>
      )}

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Actions are advisory. You must execute broker actions manually.
      </p>
    </section>
  );
}

function LiveTradePricePlan({
  position,
  latestUpdate,
}: {
  position: ActivePosition;
  latestUpdate?: LatestPositionUpdate;
}) {
  return (
    <section className="mt-4 rounded-lg border border-[#00db94]/15 bg-[#00db94]/[0.04] p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
          Price Plan
        </h3>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
          Manual broker management
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Entry" value={position.entryPrice} />
        <Detail
          label="Current"
          value={latestUpdate ? latestUpdate.currentPrice : "Waiting"}
        />
        <Detail label="Stop" value={position.stopLoss} />
        <Detail label="Target" value={position.target1} />
        <Detail label="Shares" value={position.positionSize} />
        <Detail
          label="Position Value"
          value={
            position.entryPriceValue !== null && position.positionSizeValue !== null
              ? formatCurrency(position.entryPriceValue * position.positionSizeValue)
              : "Not available"
          }
        />
        <Detail
          label="Max Loss"
          value={
            position.entryPriceValue !== null &&
            position.stopLossValue !== null &&
            position.positionSizeValue !== null
              ? formatCurrency(
                  Math.abs(position.entryPriceValue - position.stopLossValue) *
                    position.positionSizeValue,
                )
              : "Not available"
          }
        />
        <Detail label="Target 2" value={position.target2} />
      </div>
    </section>
  );
}

function LiveTradeRiskFlags({
  warnings,
  eodSafetyStatus,
  latestUpdate,
  position,
}: {
  warnings: string[];
  eodSafetyStatus: EndOfDaySafetyStatus;
  latestUpdate?: LatestPositionUpdate;
  position: ActivePosition;
}) {
  const preview = position.executionMetadata?.broker_order_preview;
  const flags = [
    eodSafetyStatus.severity !== "none" ? eodSafetyStatus.message : null,
    ...warnings,
    latestUpdate?.intradayIndicators?.isAboveVwap === false
      ? "Price is below VWAP on latest intraday snapshot."
      : null,
    preview && preview.warning_type !== "none"
      ? `Broker preview warning: ${brokerWarningTypeLabel(preview.warning_type)}`
      : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
      <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        Watch This
      </h3>
      {flags.length === 0 ? (
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          No major live risk flags surfaced.
        </p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-100">
          {flags.slice(0, 3).map((flag) => (
            <li key={flag}>{flag}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ActivePositionCard({
  position,
  latestUpdate,
  marketCloseWarning,
  eodSafetyStatus,
  eodSafetyDate,
  isMarketOpen,
  isSaving,
  onClosePosition,
}: {
  position: ActivePosition;
  latestUpdate?: LatestPositionUpdate;
  marketCloseWarning: string;
  eodSafetyStatus: EndOfDaySafetyStatus;
  eodSafetyDate: string;
  isMarketOpen: boolean;
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
  const action = latestUpdate?.action || "NO_ACTION";
  const staleStatus = getStalePositionStatus(latestUpdate, isMarketOpen);
  const warnings = [
    ...(latestUpdate?.warnings ?? []),
    getStalePositionWarning(latestUpdate, isMarketOpen),
  ].filter(Boolean);
  const positionUrgency = getPositionUpdateUrgency({
    position,
    latestUpdate,
    warnings,
    staleStatus,
    marketCloseWarning,
    eodSafetyStatus,
  });
  const closeRequiredAction = isCloseRequiredAction(action);
  const showEodManualReview =
    eodSafetyStatus.status === "review_required" ||
    eodSafetyStatus.status === "overnight_risk";
  const [eodRiskAcknowledged, setEodRiskAcknowledged] = useState(() =>
    readEndOfDayAcknowledgement(position.id, eodSafetyDate),
  );

  function acknowledgeEndOfDayRisk() {
    writeEndOfDayAcknowledgement(position.id, eodSafetyDate, true);
    setEodRiskAcknowledged(true);
  }

  return (
    <article
      className={`rounded-lg border p-5 ${positionUrgencyClassName(
        positionUrgency.urgency,
      )}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <CompanyIdentity
              ticker={position.ticker}
              companyName={position.companyName}
            />
            <span
              className={`w-fit rounded-full border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] ${positionActionClassName(
                action,
              )}`}
            >
              {positionActionLabel(action)}
            </span>
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            {setupTypeLabelFromActivePosition(position)} · {position.direction} ·
            In trade {formatTimeInTrade(position.openedAtRaw)} · Updated{" "}
            {latestUpdate ? latestUpdate.updatedAt : "—"}{" "}
            {eodSafetyStatus.severity !== "none"
              ? `· ${endOfDaySafetyLabel(eodSafetyStatus.status)}`
              : ""}
          </p>
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.12em] text-emerald-200 sm:text-right">
          Opened {position.openedAt}
        </div>
      </div>

      {positionUrgency.urgency === "critical" && (
        <div className="mt-5 rounded-md border border-rose-300/35 bg-rose-300/10 p-4 text-sm leading-6 text-rose-100">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
            Critical · Manual action required
          </p>
          <p className="mt-2">
            {latestUpdate?.reason ||
              positionUrgency.reasons[0] ||
              "Review this live day trade immediately."}
          </p>
        </div>
      )}

      <LiveTradePrimaryStatusStrip
        latestUpdate={latestUpdate}
        currentR={currentR}
        unrealizedPnl={unrealizedPnl}
        action={action}
        eodSafetyStatus={eodSafetyStatus}
        urgency={positionUrgency}
      />

      <LiveTradeActionGuidance
        latestUpdate={latestUpdate}
        action={action}
        warnings={warnings}
        eodSafetyStatus={eodSafetyStatus}
        closeRequiredAction={closeRequiredAction}
      />

      {showEodManualReview && (
        <div
          className={`mt-4 rounded-md border p-4 text-sm leading-6 ${eodSafetyPanelClassName(
            eodSafetyStatus,
          )}`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
                EOD Manual Review Required
              </p>
              <p className="mt-2">
                {eodSafetyStatus.message} Close in broker first, then close trade
                in app.
              </p>
              {eodRiskAcknowledged && (
                <p className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-300">
                  EOD risk acknowledged
                </p>
              )}
            </div>
            {!eodRiskAcknowledged && (
              <button
                type="button"
                onClick={acknowledgeEndOfDayRisk}
                className="rounded-md border border-white/15 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-200 transition hover:border-white/30 hover:text-white"
              >
                Acknowledge EOD Risk
              </button>
            )}
          </div>
        </div>
      )}

      <LiveTradePricePlan position={position} latestUpdate={latestUpdate} />
      <LiveTradeRiskFlags
        warnings={warnings}
        eodSafetyStatus={eodSafetyStatus}
        latestUpdate={latestUpdate}
        position={position}
      />

      {marketCloseWarning && (
        <DismissibleWarning
          storageKey={warningDismissKey([
            "market-close-warning",
            position.id,
            position.ticker,
            marketCloseWarning,
          ])}
          className="mt-5 rounded-md border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100"
        >
          {marketCloseWarning}
        </DismissibleWarning>
      )}

      <div className="mt-5 rounded-md border border-white/10 bg-black/25 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Manual Close
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Broker actions remain manual. Close in the broker first when needed,
              then record the exit in Trade.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onClosePosition(position)}
            disabled={isSaving}
            className="min-h-11 rounded-md border border-rose-300/35 bg-rose-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-200/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-zinc-900 disabled:text-zinc-600"
          >
            Close Trade
          </button>
        </div>
      </div>

      <details className="mt-4 rounded-md border border-white/10 bg-black/20 p-4">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
          Live trade details
        </summary>
        <div className="mt-4 space-y-4">
          {latestUpdate && (
            <div className="rounded-md border border-white/10 bg-black/25 p-4">
              <div className="space-y-2">
                <TextBlock label="Action Reason" value={latestUpdate.reason} />
                {warnings.length > 0 && (
                  <TextBlock label="Warnings" value={warnings.join("\n")} />
                )}
                {position.invalidation && (
                  <TextBlock
                    label="Intraday Invalidation"
                    value={position.invalidation}
                  />
                )}
              </div>
              {latestUpdate.intradayIndicators && (
                <div className="mt-4 rounded-md border border-white/10 bg-white/[0.025] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Intraday Indicators
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Detail
                      label="VWAP"
                      value={
                        latestUpdate.intradayIndicators.isAboveVwap === null
                          ? "Unavailable"
                          : latestUpdate.intradayIndicators.isAboveVwap
                            ? "Above"
                            : "Below"
                      }
                    />
                    <Detail
                      label="Price vs VWAP"
                      value={formatIntradayIndicatorValue(
                        latestUpdate.intradayIndicators.priceVsVwapPercent,
                        "%",
                      )}
                    />
                    <Detail
                      label="Momentum"
                      value={latestUpdate.intradayIndicators.momentumDirection}
                    />
                    <Detail
                      label="Volume"
                      value={latestUpdate.intradayIndicators.volumeTrend}
                    />
                  </div>
                </div>
              )}
              {latestUpdate.explanation && (
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-zinc-400">
                  {latestUpdate.explanation}
                </p>
              )}
              {latestUpdate.newStop !== "Not set" && (
                <p className="mt-2 font-mono text-xs text-zinc-400">
                  New stop: {latestUpdate.newStop}
                </p>
              )}
            </div>
          )}

          {!latestUpdate && (position.invalidation || warnings.length > 0) && (
            <div className="rounded-md border border-white/10 bg-black/25 p-4">
              {position.invalidation && (
                <TextBlock
                  label="Intraday Invalidation"
                  value={position.invalidation}
                />
              )}
              {warnings.length > 0 && (
                <div className="mt-3">
                  <TextBlock label="Warnings" value={warnings.join("\n")} />
                </div>
              )}
            </div>
          )}
        </div>
      </details>

      <details className="mt-4 rounded-md border border-white/10 bg-black/20 p-4">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
          Execution audit details
        </summary>
        <div className="mt-4 space-y-4">
          <BrokerExecutionMetadataPanel metadata={position.executionMetadata} />
          <BrokerOrderPreviewPanel metadata={position.executionMetadata} />
          <ExecutionQualityPanel metadata={position.executionMetadata} />
          <HandoffQualityPanel position={position} />
          <ExecutionImprovementSuggestionsPanel
            position={position}
            eodSafetyStatus={eodSafetyStatus}
          />
          <HandoffSessionReplayPanel position={position} />
          <ExecutionTimelinePanel position={position} />
        </div>
      </details>
    </article>
  );
}

function ClosePositionModal({
  position,
  eodSafetyStatus,
  exitPrice,
  exitNotes,
  isSaving,
  onExitPriceChange,
  onExitNotesChange,
  onClose,
  onSubmit,
}: {
  position: ActivePosition;
  eodSafetyStatus: EndOfDaySafetyStatus;
  exitPrice: string;
  exitNotes: string;
  isSaving: boolean;
  onExitPriceChange: (value: string) => void;
  onExitNotesChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const showEodCloseWarning =
    eodSafetyStatus.status === "review_required" ||
    eodSafetyStatus.status === "overnight_risk";

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

        {showEodCloseWarning && (
          <div className="mt-5 rounded-md border border-rose-300/35 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">
            This day trade is near/after market close. Confirm broker execution
            before closing it in Trade.
          </div>
        )}

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
  const localEvents = readTradeManagementEvents();
  const timeline = buildExecutionTimeline({
    positionId: position.id,
    recommendationId: position.recommendationId,
    ticker: position.ticker,
    status: "closed",
    openedAt: position.openedAtRaw,
    closedAt: position.closedAtRaw,
    executionMetadata: position.executionMetadata,
    localEvents,
  });
  const replay = buildHandoffSessionReplay({
    executionMetadata: position.executionMetadata,
    timelineEvents: timeline,
    openedAt: position.openedAtRaw,
    closedAt: position.closedAtRaw,
  });
  const executionQuality = calculateExecutionQuality(position.executionMetadata);
  const handoffQuality = calculateHandoffQuality({
    executionMetadata: position.executionMetadata,
    executionQualityMetrics: executionQuality,
    handoffReplay: replay,
    timelineEvents: timeline,
    calculatedAt: position.executionMetadata?.handoff_quality?.calculated_at,
  });
  const improvementSuggestions = buildExecutionImprovementSuggestions({
    brokerExecutionMetadata: position.executionMetadata,
    handoffQuality,
    executionQualityMetrics: executionQuality,
    handoffReplay: replay,
    timelineEvents: timeline,
  });
  const outcomeExplanation = explainTradeOutcome({
    setup_type: position.setupType,
    pnl: position.pnlValue,
    r_multiple: position.rMultipleValue,
    entry_price: position.entryPriceValue,
    stop_loss: position.stopLossValue,
    target_price: position.target1Value ?? position.target2Value,
    exit_price: null,
    closed_at: position.closedAtRaw,
    execution_metadata: position.executionMetadata,
    execution_quality_metrics: executionQuality,
    handoff_quality: handoffQuality,
    improvement_suggestions: improvementSuggestions.suggestions,
  });

  return (
    <article className="bg-surface-subtle rounded-lg border border-white/10 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <CompanyIdentity
              ticker={position.ticker}
              companyName={position.companyName}
            />
            <span
              className={`w-fit rounded-full border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] ${tradeOutcomeClassificationClassName(
                outcomeExplanation.classification,
              )}`}
            >
              {tradeOutcomeClassificationLabel(outcomeExplanation.classification)}
            </span>
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            {getSetupTypeLabel(position.setupType)} · {position.direction} ·
            Closed {position.closedAt} · Opened {position.openedAt}
          </p>
        </div>
        <div className={`font-mono text-sm font-semibold ${pnlClassName} sm:text-right`}>
          <div>{position.pnl}</div>
          <div className="mt-1 text-xs text-zinc-500">{position.rMultiple}</div>
        </div>
      </div>

      <ClosedTradeResultStrip
        position={position}
        outcome={outcomeExplanation}
      />
      <ClosedTradeOutcomeSummary explanation={outcomeExplanation} />
      <ClosedTradeProcessQualitySummary
        position={position}
        executionQuality={executionQuality}
        handoffQuality={handoffQuality}
        replay={replay}
      />
      <ClosedTradeKeyLearnings
        explanation={outcomeExplanation}
        suggestions={improvementSuggestions}
      />

      <details className="mt-5 rounded-md border border-white/10 bg-black/20 p-4">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          Audit details
        </summary>
        <div className="mt-4 space-y-4">
          <BrokerExecutionMetadataPanel
            metadata={position.executionMetadata}
            compact
          />
          <BrokerOrderPreviewPanel metadata={position.executionMetadata} compact />
          <ExecutionQualityPanel metadata={position.executionMetadata} compact />
          <HandoffQualityPanel
            position={position}
            closedAt={position.closedAtRaw}
          />
          <ExecutionImprovementSuggestionsPanel
            position={position}
            closedAt={position.closedAtRaw}
          />
          <TradeOutcomeExplainerPanel position={position} />
          <HandoffSessionReplayPanel
            position={position}
            closedAt={position.closedAtRaw}
          />
          <ExecutionTimelinePanel
            position={position}
            closedAt={position.closedAtRaw}
          />
        </div>
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          History explanations are based on available structured data and may be
          incomplete.
        </p>
      </details>

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
            {getSetupTypeLabel(recommendation.setupType)}
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

function scanLogResultLabel(value: ScanLogResult) {
  if (value === "pre_market_watchlist_updated") {
    return "PRE-MARKET WATCHLIST";
  }

  if (value === "pre_market_no_candidates") {
    return "PRE-MARKET NO CANDIDATES";
  }

  if (value === "pre_market_skipped_holiday") {
    return "PRE-MARKET SKIPPED";
  }

  if (value === "openai_no_trade") {
    return "OPENAI NO TRADE";
  }

  return value.replaceAll("_", " ").toUpperCase();
}

function scanLogResultClassName(value: ScanLogResult) {
  if (value === "recommendation_created") {
    return "border-[#00db94]/30 bg-[#00db94]/10 text-emerald-100";
  }

  if (value === "no_high_quality_setup" || value === "openai_no_trade") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }

  if (value === "provider_error" || value === "provider_rate_limited") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-100";
  }

  if (
    value === "pre_market_watchlist_updated" ||
    value === "pre_market_no_candidates" ||
    value === "pre_market_skipped_holiday" ||
    value === "pre_market"
  ) {
    return "border-sky-300/25 bg-sky-300/10 text-sky-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

function preMarketCandidateStatusClassName(status: PreMarketCandidate["status"]) {
  if (status === "watching") {
    return "border-sky-300/30 bg-sky-300/10 text-sky-100";
  }

  if (status === "confirmed_after_open") {
    return "border-[#00db94]/30 bg-[#00db94]/10 text-emerald-100";
  }

  return "border-amber-300/30 bg-amber-300/10 text-amber-100";
}

function PreMarketWatchlistPanel({
  candidates,
  scanWindow,
  marketStatus,
}: {
  candidates: PreMarketCandidate[];
  scanWindow: IntradayScanWindow;
  marketStatus: TopMarketStatus;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-white/10 bg-white/[0.025] p-4">
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Pre-Market Watchlist
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Pre-market watchlist is for preparation only. Trade Recommendations
          require market-open confirmation.
        </p>
      </div>

      {candidates.length === 0 ? (
        <EmptyState
          title="No pre-market candidates yet"
          message="No pre-market candidates yet. The scanner will prepare candidates before market open when conditions are strong enough."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {candidates.map((candidate) => {
            const displayStatus = getPreMarketDisplayStatus(
              candidate,
              scanWindow,
              marketStatus,
            );

            return (
              <article
                key={candidate.id}
                className="rounded-lg border border-white/10 bg-black/20 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-mono text-2xl font-semibold tracking-normal text-white">
                        {candidate.ticker}
                      </h3>
                      <span
                        className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${preMarketCandidateStatusClassName(
                          displayStatus,
                        )}`}
                      >
                        {displayStatus}
                      </span>
                    </div>
                    {typeof candidate.metadata?.company_name === "string" && (
                      <p className="mt-1 text-sm text-zinc-400">
                        {candidate.metadata.company_name}
                      </p>
                    )}
                  </div>
                  <div className="font-mono text-sm font-semibold text-sky-100">
                    {candidate.score}/100
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-zinc-300">
                  {candidate.reason}
                </p>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div>
                    <h4 className="font-mono text-sm font-semibold text-white">
                      Signals
                    </h4>
                    {candidate.signals.length === 0 ? (
                      <p className="mt-2 text-sm leading-6 text-zinc-500">
                        No signals captured.
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-300">
                        {candidate.signals.map((signal) => (
                          <li key={signal}>{signal}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h4 className="font-mono text-sm font-semibold text-white">
                      Warnings
                    </h4>
                    {candidate.warnings.length === 0 ? (
                      <p className="mt-2 text-sm leading-6 text-zinc-500">
                        No warnings captured.
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-300">
                        {candidate.warnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Detail label="Detected" value={formatDate(candidate.detected_at)} />
                  <Detail label="Source" value={candidate.source ?? "scanner"} />
                  <Detail
                    label="Potential Setup"
                    value={getSetupTypeLabel(candidate.metadata?.setup_type)}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="text-sm leading-6 text-zinc-500">
        TODO: Persist pre-market watchlist in Supabase with a dedicated table and
        promote candidates when intraday confirmation appears after open.
      </p>
    </section>
  );
}

function ScanQualitySummaryCards({
  summary,
}: {
  summary: ScanQualitySummary;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total Scans" value={String(summary.totalScans)} />
        <SummaryCard
          label="Recommendations"
          value={String(summary.recommendationsCreated)}
        />
        <SummaryCard label="No-trade Scans" value={String(summary.noTradeScans)} />
        <SummaryCard label="Skipped Scans" value={String(summary.skippedScans)} />
        <SummaryCard
          label="Avg Top Score"
          value={
            summary.averageTopCandidateScore === null
              ? "—"
              : summary.averageTopCandidateScore.toFixed(0)
          }
        />
        <SummaryCard
          label="Provider Errors"
          value={String(summary.providerErrors)}
        />
        <SummaryCard
          label="Last Result"
          value={
            summary.latestScan
              ? scanLogResultLabel(summary.latestScan.result)
              : "—"
          }
        />
        <SummaryCard
          label="Last Window"
          value={summary.latestScan?.scan_window?.replaceAll("_", " ") ?? "—"}
        />
      </div>
      {summary.latestScan && (
        <p className="text-sm leading-6 text-zinc-500">
          Last scan: {summary.latestScan.message}
        </p>
      )}
    </div>
  );
}

function RecentScanLogs({ scanLogs }: { scanLogs: ScanLogEntry[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10">
      {scanLogs.map((scanLog, index) => (
        <div
          key={`${scanLog.id ?? index}-${scanLog.created_at}`}
          className="grid gap-3 border-b border-white/10 bg-white/[0.025] p-4 last:border-b-0 lg:grid-cols-[150px_170px_1fr_130px]"
        >
          <div className="font-mono text-xs uppercase tracking-[0.12em] text-zinc-500">
            {formatDate(scanLog.created_at)}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              {scanLog.source}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              {scanLog.scan_window?.replaceAll("_", " ") ?? "unknown"}
            </span>
          </div>
          <div>
            <span
              className={`inline-flex rounded-full border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${scanLogResultClassName(
                scanLog.result,
              )}`}
            >
              {scanLogResultLabel(scanLog.result)}
            </span>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {scanLog.message}
            </p>
            {(scanLog.top_candidate_ticker ||
              scanLog.top_candidate_score != null ||
              scanLog.threshold != null) && (
              <p className="mt-1 font-mono text-xs text-zinc-500">
                Top {scanLog.top_candidate_ticker ?? "—"} ·{" "}
                {scanLog.top_candidate_score ?? "—"}
                {scanLog.threshold != null ? `/${scanLog.threshold}` : ""}
                {scanLog.top_candidate_setup_type
                  ? ` · ${getSetupTypeLabel(scanLog.top_candidate_setup_type)}`
                  : ""}
              </p>
            )}
          </div>
          <div className="font-mono text-sm text-zinc-200 lg:text-right">
            {scanLog.recommendations_created} created
          </div>
        </div>
      ))}
    </div>
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

function CompanyIdentity({
  ticker,
  companyName,
  size = "normal",
}: {
  ticker: string;
  companyName?: string | null;
  size?: "normal" | "compact";
}) {
  const safeTicker = text(ticker, "—").toUpperCase();
  const safeCompanyName = text(companyName, safeTicker);
  const initials = safeTicker.slice(0, 2) || "T";

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] font-mono font-bold uppercase tracking-[0.08em] text-zinc-200 ${
          size === "compact" ? "h-10 w-10 text-xs" : "h-12 w-12 text-sm"
        }`}
      >
        {initials}
      </div>
      <div className="min-w-0">
        <div
          className={`truncate font-mono font-semibold tracking-normal text-white ${
            size === "compact" ? "text-2xl" : "text-3xl"
          }`}
        >
          {safeTicker}
        </div>
        <div className="mt-0.5 truncate text-sm text-zinc-400">
          {safeCompanyName}
        </div>
      </div>
    </div>
  );
}

function DismissibleWarning({
  storageKey,
  className,
  children,
}: {
  storageKey: string;
  className: string;
  children: React.ReactNode;
}) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsDismissed(readDismissedWarnings().has(storageKey));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [storageKey]);

  if (isDismissed) {
    return null;
  }

  return (
    <div className={`${className} flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between`}>
      <div>{children}</div>
      <button
        type="button"
        onClick={() => {
          writeDismissedWarning(storageKey);
          setIsDismissed(true);
        }}
        className="w-fit shrink-0 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400 transition hover:border-white/20 hover:text-white"
      >
        Hide
      </button>
    </div>
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
