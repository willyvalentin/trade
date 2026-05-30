"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
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
  type PreTradeRiskContextResult,
} from "@/lib/pre-trade-risk-context";
import {
  buildTradeEligibility,
  type TradeEligibilityResult,
  type TradeEligibilityStatus,
} from "@/lib/trade-eligibility";
import {
  buildRecommendationDecisionStack,
  type RecommendationDecisionStackResult,
  type RecommendationDecisionStackStatus,
} from "@/lib/recommendation-decision-stack";
import {
  buildRecommendationIntakeQualityResult,
  type RecommendationIntakeQualityResult,
  type RecommendationIntakeQualityStatus,
} from "@/lib/recommendation-intake-quality";
import {
  buildScanPipelineObservabilitySummary,
  scanPipelineObservabilitySummaryJson,
  type ScanPipelineObservabilityStatus,
  type ScanPipelineObservabilitySummary,
} from "@/lib/scan-pipeline-observability";
import {
  buildRecommendationEmptyStateSummary,
  recommendationEmptyStateSummaryJson,
  type RecommendationEmptyStateReason,
  type RecommendationEmptyStateSeverity,
  type RecommendationEmptyStateSummary,
} from "@/lib/recommendation-empty-state";
import {
  buildDataModeClaritySummary,
  dataModeBadgeForExecutionReality,
  dataModeBadgeForMode,
  dataModeClaritySummaryJson,
  type DataModeBadge,
  type DataModeBadgeTone,
  type DataModeClaritySummary,
  type DataModeSurface,
} from "@/lib/data-mode-clarity";
import {
  buildLiveTestReadinessSummary,
  liveTestReadinessSummaryJson,
  type LiveTestReadinessCategory,
  type LiveTestReadinessCheckStatus,
  type LiveTestReadinessMode,
  type LiveTestReadinessStatus,
  type LiveTestReadinessSummary,
} from "@/lib/live-test-readiness";
import {
  buildPaperSessionProtocolSummary,
  createDefaultPaperSessionProtocolState,
  normalizePaperSessionProtocolState,
  paperSessionProtocolStorageKey,
  paperSessionProtocolSummaryJson,
  type PaperSessionProtocolLocalState,
  type PaperSessionProtocolMode,
  type PaperSessionProtocolOutcome,
  type PaperSessionProtocolStatus,
  type PaperSessionProtocolStepStatus,
  type PaperSessionProtocolSummary,
} from "@/lib/paper-session-protocol";
import {
  buildRecommendationSnapshot,
  markRecommendationSnapshotTaken,
  persistRecommendationSnapshot,
  recommendationSnapshotsJson,
  readRecommendationSnapshotsFromLocalStorage,
  type RecommendationSnapshot,
  type RecommendationSnapshotInput,
  type RecommendationSnapshotPersistenceResult,
  type RecommendationSnapshotWindow,
} from "@/lib/recommendation-snapshot";
import {
  computeRecommendationOutcome,
  persistRecommendationOutcome,
  recommendationOutcomesJson,
  readRecommendationOutcomesFromLocalStorage,
  type RecommendationOutcome,
  type RecommendationOutcomePersistenceResult,
} from "@/lib/recommendation-outcome-tracker";
import {
  recommendationOutcomeEvaluationRunJson,
  writeRecommendationOutcomeEvaluationRunToLocalStorage,
  type RecommendationOutcomeEvaluationRun,
  type RecommendationOutcomeEvaluationRunStatus,
} from "@/lib/recommendation-outcome-evaluation-runner";
import {
  buildRecommendationPerformanceStatistics,
  recommendationPerformanceStatisticsJson,
  type RecommendationPerformanceBucket,
  type RecommendationPerformanceStatistics,
} from "@/lib/recommendation-performance-statistics";
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
  buildAgentHandoffCommand,
  toAgentHandoffCommandMetadataSnapshot,
  type AgentHandoffCommand,
  type AgentHandoffStatus,
} from "@/lib/agent-handoff-command";
import {
  evaluateAgentHardStopContract,
  toAgentHardStopContractMetadataSnapshot,
  type AgentHardStopContract,
  type AgentHardStopOverallStatus,
} from "@/lib/agent-hard-stop-contract";
import {
  buildAgentFormMappingPreview,
  toAgentFormMappingPreviewMetadataSnapshot,
  type AgentFormMappingPreview,
  type AgentFormMappingStatus,
  type AgentFormMappingConfidence,
} from "@/lib/agent-form-mapping-preview";
import {
  buildBuyOrderHandoffProgress,
  type BuyOrderHandoffProgress,
  type BuyOrderHandoffStatus,
} from "@/lib/buy-order-handoff-progress";
import {
  buildTradeExitExecutionPayload,
  getExitPayloadSecondsUntilExpiry,
  tradeExitExecutionPayloadJson,
  type TradeExitExecutionPayload,
} from "@/lib/exit-execution-payload";
import {
  buildSellAgentHandoffCommand,
  sellAgentHandoffCommandJson,
  type SellAgentHandoffCommand,
  type SellAgentHandoffStatus,
} from "@/lib/sell-agent-handoff-command";
import {
  evaluateSellHardStopContract,
  type SellHardStopContract,
  type SellHardStopOverallStatus,
  type SellHardStopStatus,
} from "@/lib/sell-hard-stop-contract";
import {
  buildSellFormMappingPreview,
  getSellFormMappingFieldCounts,
  sellFormMappingPreviewJson,
  type SellFormMappingConfidence,
  type SellFormMappingPreview,
  type SellFormMappingStatus,
} from "@/lib/sell-form-mapping-preview";
import {
  brokerExitStatusLabel,
  buildBrokerExitConfirmation,
  validateBrokerExitConfirmation,
  type BrokerExitConfirmation,
  type BrokerExitStatus,
} from "@/lib/broker-exit-confirmation";
import {
  brokerFillCaptureAgentSpecJson,
  buildBuyBrokerFillCaptureAgentSpec,
  buildSellBrokerFillCaptureAgentSpec,
  type BrokerFillCaptureAgentSpec,
} from "@/lib/broker-fill-capture-agent-spec";
import {
  buildBuyTureFillAutofillContract,
  buildSellTureFillAutofillContract,
  tureFillAutofillContractJson,
  type TureFillAutofillContract,
} from "@/lib/ture-fill-autofill-contract";
import {
  buildStatisticsDashboard,
  statisticsTimeRangeOptions,
  type StatisticsDashboard,
  type StatisticsProgressSummary,
  type StatisticsTimeRange,
} from "@/lib/statistics-dashboard";
import {
  buildHistoryDashboard,
  defaultHistoryFilterState,
  type HistoryDashboard,
  type HistoryDemoFilter,
  type HistoryOutcomeFilter,
  type HistoryPartialFilter,
  type HistorySortMode,
  type HistoryTradeSummary,
} from "@/lib/history-dashboard";
import {
  buildMarketSessionEvaluation,
  marketSessionEvaluationJson,
  type MarketSessionEvaluation,
  type MarketSessionPhase,
  type MarketSessionRiskLevel,
} from "@/lib/market-session";
import {
  buildLiveSellGuidance,
  type LiveSellAction,
  type LiveSellGuidance,
  type LiveSellUrgency,
} from "@/lib/live-sell-guidance";
import {
  buildPartialPositionState,
  normalizeExitFill,
} from "@/lib/partial-position-accounting";
import {
  avanzaFieldVerificationReportJson,
  buildBuyAvanzaFieldVerificationReport,
  buildSellAvanzaFieldVerificationReport,
  type AvanzaFieldVerificationReport,
} from "@/lib/avanza-field-verification";
import {
  AVANZA_VERIFICATION_NOTES_STORAGE_KEY,
  normalizeAvanzaVerificationNotesState,
  type AvanzaVerificationNotesState,
} from "@/lib/avanza-field-verification-notes";
import {
  buildBuyFillCaptureReview,
  buildSellFillCaptureReview,
  fillCaptureReviewJson,
  type FillCaptureReview,
  type FillCaptureReviewStatus,
} from "@/lib/fill-capture-review";
import {
  buildBuyTureAgentCompletionPolicy,
  buildSellTureAgentCompletionPolicy,
  tureAgentCompletionPolicyJson,
  type TureAgentCompletionDecision,
  type TureAgentCompletionPolicy,
} from "@/lib/ture-agent-completion-policy";
import {
  createDefaultRiskControlsSettings,
  evaluateRiskControlsForLiveTrade,
  evaluateRiskControlsForNewTrade,
  normalizeRiskControlsSettings,
  riskControlsEvaluationJson,
  RISK_CONTROLS_STORAGE_KEY,
  type RiskControlsEvaluation,
  type RiskControlsSettings,
  type RiskControlsStatus,
} from "@/lib/risk-controls";
import {
  buildPositionSizingResult,
  positionSizingResultJson,
  type PositionSizingResult,
  type PositionSizingStatus,
} from "@/lib/position-sizing";
import {
  buildTradePlanQualityResult,
  tradePlanQualityResultJson,
  type TradePlanQualityResult,
  type TradePlanQualityStatus,
} from "@/lib/trade-plan-quality";
import {
  addTradePreflightSummaryJson,
  buildAddTradePreflightSummary,
  type AddTradePreflightCheckStatus,
  type AddTradePreflightStatus,
  type AddTradePreflightSummary,
} from "@/lib/add-trade-preflight-summary";
import {
  buildTradePlanningSnapshot,
  tradePlanningSnapshotJson,
  type TradePlanningSnapshot,
} from "@/lib/trade-planning-snapshot";
import {
  buildPlanVsActualReview,
  planVsActualReviewJson,
  type PlanVsActualReview,
  type PlanVsActualStatus,
} from "@/lib/plan-vs-actual-review";
import {
  mapMockFillToBrokerExitConfirmation,
  mapMockFillToBrokerFillConfirmation,
  validateMockBrokerFillForTureBuy,
  validateMockBrokerFillForTureSell,
  type MockBrokerFillImportResult,
} from "@/lib/mock-broker-fill-import";
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
type Tab =
  | "Recommendations"
  | "Live Day Trades"
  | "Statistics"
  | "History"
  | "Market";

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

type RecommendationSnapshotDiagnostics = {
  snapshotsStoredToday: number;
  lastSnapshotTimestamp: string | null;
  duplicateSkippedCount: number;
  persistenceStatus: RecommendationSnapshotPersistenceResult["status"] | "idle";
  persistenceMode: RecommendationSnapshotPersistenceResult["mode"] | "unknown";
  lastError: string | null;
};

type RecommendationOutcomeDiagnostics = {
  trackedSnapshotsCount: number;
  pendingOutcomes: number;
  completedOutcomes: number;
  incompleteOutcomes: number;
  unknownOutcomes: number;
  lastOutcomeEvaluationTimestamp: string | null;
  persistenceStatus: RecommendationOutcomePersistenceResult["status"] | "idle";
  persistenceMode: RecommendationOutcomePersistenceResult["mode"] | "unknown";
  lastError: string | null;
};

type RecommendationOutcomeEvaluationDiagnostics = {
  status: RecommendationOutcomeEvaluationRunStatus | "idle";
  eligibleSnapshots: number;
  evaluatedSnapshots: number;
  incompleteDueToMissingCandles: number;
  providerErrors: number;
  lastRunTimestamp: string | null;
  horizonsEvaluated: string[];
  persistenceMode: RecommendationOutcomePersistenceResult["mode"] | "unknown";
  snapshotOnly: boolean;
  summary: string;
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
  agentHandoffCommand: AgentHandoffCommand;
  agentHardStopContract: AgentHardStopContract;
  agentFormMappingPreview: AgentFormMappingPreview;
  tradePlanningSnapshot: TradePlanningSnapshot;
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

const primaryTabs: Tab[] = ["Recommendations", "Live Day Trades", "Statistics"];
const secondaryTabs: Tab[] = ["Market", "History"];
const historyStatuses: RecommendationStatus[] = [
  "ignored",
  "discarded",
  "rejected",
  "watched",
  "taken",
];
const shouldUseDevPreviewData =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_TRADE_DEV_PREVIEW_DATA !== "false";
const demoTradingFlowEnabled =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ENABLE_DEMO_TRADING_FLOW === "true";
const demoStorageKeys = {
  recommendations: "trade-demo-recommendations-v1",
  activePositions: "trade-demo-active-positions-v1",
  closedPositions: "trade-demo-closed-positions-v1",
  lastAction: "trade-demo-last-action-v1",
};
const latestMockBrokerFillStorageKey = "trade-mock-broker-latest-fill";
const demoIdPrefix = "demo-";
const confidenceMetadataPrefix = "\n\n[confidence_meta:";
const discardMetadataPrefix = "\n\n[discard_meta:";

function buildDevPreviewRecommendations(now = new Date()): Recommendation[] {
  const createdAtRaw = now.toISOString();
  const expiresAtRaw = new Date(now.getTime() + 45 * 60 * 1000).toISOString();

  return [
    {
      id: "dev-preview-recommendation-nvda",
      sessionType: "morning",
      sessionLabel: "Morning",
      ticker: "NVDA",
      companyName: "NVIDIA Corp.",
      direction: "Long",
      setupType: "VWAP_HOLD_CONTINUATION",
      entryZone: "$1,128.20 - $1,131.40",
      entryLowValue: 1128.2,
      entryHighValue: 1131.4,
      stopLossValue: 1119.6,
      stopLoss: "1119.60",
      target1: "1147.80",
      target2: "1158.20",
      riskReward: "2.1",
      confidence: "High",
      confidenceScore: 87,
      confidenceLabel: "HIGH CONVICTION",
      confidenceBreakdown: {
        setup_quality: 88,
        momentum_confirmation: 84,
        volume_confirmation: 82,
        risk_reward_quality: 90,
        market_regime_alignment: 86,
        timing_quality: 88,
      },
      confidenceReasoning:
        "Dev preview: clean VWAP hold with controlled continuation and favorable risk/reward.",
      riskFlags: ["Dev preview data", "Confirm live price before any action"],
      intradayIndicators: {
        vwap: 1124.4,
        latestPrice: 1130.6,
        priceVsVwapPercent: 0.55,
        isAboveVwap: true,
        recentHigh: 1133.2,
        recentLow: 1121.8,
        recentRangePercent: 1.02,
        momentumPercent: 0.68,
        momentumDirection: "up",
        volumeTrend: "expanding",
        latestVolume: 1250000,
        averageVolume: 910000,
        warnings: ["Dev preview data only"],
      },
      discardedAtRaw: null,
      discardReviewStatus: null,
      discardReviewedAtRaw: null,
      discardOutcome: null,
      discardTheoreticalR: null,
      discardDecisionQuality: null,
      discardMaxFavorableR: null,
      discardMaxAdverseR: null,
      discardReviewNotes: [],
      timeframe: "Intraday",
      thesis:
        "Dev preview setup for UI review: price is holding above VWAP while momentum stays constructive.",
      invalidation: "Lose VWAP and trade below 1119.60 with expanding sell volume.",
      reasonToAvoid:
        "Skip if price rejects VWAP or momentum rolls over before entry.",
      status: "new",
      archived: false,
      expiresAtRaw,
      scanWindow: "morning_momentum",
      createdAt: "Just now",
      createdAtRaw,
    },
    {
      id: "dev-preview-recommendation-msft",
      sessionType: "midday",
      sessionLabel: "Midday",
      ticker: "MSFT",
      companyName: "Microsoft Corp.",
      direction: "Long",
      setupType: "BREAKOUT_CONTINUATION",
      entryZone: "$432.40 - $433.10",
      entryLowValue: 432.4,
      entryHighValue: 433.1,
      stopLossValue: 428.9,
      stopLoss: "428.90",
      target1: "440.20",
      target2: "444.80",
      riskReward: "2.0",
      confidence: "Medium",
      confidenceScore: 76,
      confidenceLabel: "GOOD SETUP",
      confidenceBreakdown: {
        setup_quality: 78,
        momentum_confirmation: 75,
        volume_confirmation: 72,
        risk_reward_quality: 80,
        market_regime_alignment: 74,
        timing_quality: 77,
      },
      confidenceReasoning:
        "Dev preview: breakout continuation card for layout and interaction review.",
      riskFlags: ["Dev preview data"],
      intradayIndicators: {
        vwap: 430.7,
        latestPrice: 432.8,
        priceVsVwapPercent: 0.49,
        isAboveVwap: true,
        recentHigh: 433.25,
        recentLow: 428.75,
        recentRangePercent: 1.04,
        momentumPercent: 0.42,
        momentumDirection: "up",
        volumeTrend: "flat",
        latestVolume: 820000,
        averageVolume: 790000,
        warnings: [],
      },
      discardedAtRaw: null,
      discardReviewStatus: null,
      discardReviewedAtRaw: null,
      discardOutcome: null,
      discardTheoreticalR: null,
      discardDecisionQuality: null,
      discardMaxFavorableR: null,
      discardMaxAdverseR: null,
      discardReviewNotes: [],
      timeframe: "Intraday",
      thesis:
        "Dev preview setup for UI review: price is pressing a tight range high with stable breadth.",
      invalidation: "Break back under 428.90 or lose breakout level on volume.",
      reasonToAvoid: "Skip if the breakout fails to hold above the range.",
      status: "new",
      archived: false,
      expiresAtRaw,
      scanWindow: "midday",
      createdAt: "Just now",
      createdAtRaw,
    },
  ];
}
const dismissedWarningsStorageKey = "trade-dismissed-warnings";
const liveTradesAutoRefreshIntervalMs = 5 * 60 * 1000;
const liveTradesNearCloseAutoRefreshIntervalMs = 2 * 60 * 1000;

const text = (value: unknown, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  const normalized = String(value).trim();

  if (
    normalized === "" ||
    normalized.toLowerCase() === "null" ||
    normalized.toLowerCase() === "undefined"
  ) {
    return fallback;
  }

  return normalized;
};

const displayValue = (value: unknown, fallback = "—") => text(value, fallback);

function isDemoId(value: string | null | undefined) {
  return typeof value === "string" && value.startsWith(demoIdPrefix);
}

function isDemoRecommendation(recommendation: Recommendation | null | undefined) {
  return isDemoId(recommendation?.id);
}

function isDemoPosition(position: ActivePosition | ClosedPosition | null | undefined) {
  return isDemoId(position?.id) || isDemoId(position?.recommendationId);
}

function readDemoList<T>(key: string): T[] {
  if (!demoTradingFlowEnabled || typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeDemoList<T>(key: string, value: T[]) {
  if (!demoTradingFlowEnabled || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value.slice(0, 25)));
  } catch {
    // Demo tools are best-effort local UI only.
  }
}

function readDemoRecommendations() {
  return readDemoList<Recommendation>(demoStorageKeys.recommendations).filter(
    isDemoRecommendation,
  );
}

function writeDemoRecommendations(recommendations: Recommendation[]) {
  writeDemoList(
    demoStorageKeys.recommendations,
    recommendations.filter(isDemoRecommendation),
  );
}

function readDemoActivePositions() {
  return readDemoList<ActivePosition>(demoStorageKeys.activePositions).filter(
    isDemoPosition,
  );
}

function writeDemoActivePositions(positions: ActivePosition[]) {
  writeDemoList(
    demoStorageKeys.activePositions,
    positions.filter(isDemoPosition),
  );
}

function readDemoClosedPositions() {
  return readDemoList<ClosedPosition>(demoStorageKeys.closedPositions).filter(
    isDemoPosition,
  );
}

function writeDemoClosedPositions(positions: ClosedPosition[]) {
  writeDemoList(
    demoStorageKeys.closedPositions,
    positions.filter(isDemoPosition),
  );
}

function clearStoredDemoTradeData() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(demoStorageKeys.recommendations);
    window.localStorage.removeItem(demoStorageKeys.activePositions);
    window.localStorage.removeItem(demoStorageKeys.closedPositions);
    window.localStorage.removeItem(demoStorageKeys.lastAction);
    window.localStorage.removeItem(latestMockBrokerFillStorageKey);
  } catch {
    // Demo clear must never affect normal app behavior.
  }
}

function readDemoLastAction() {
  if (!demoTradingFlowEnabled || typeof window === "undefined") {
    return "No demo action yet.";
  }

  try {
    return text(
      window.localStorage.getItem(demoStorageKeys.lastAction),
      "No demo action yet.",
    );
  } catch {
    return "No demo action yet.";
  }
}

function writeDemoLastAction(value: string) {
  if (!demoTradingFlowEnabled || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(demoStorageKeys.lastAction, value);
  } catch {
    // Demo status is best-effort local UI only.
  }
}

function buildDemoRecommendation(now = new Date()): Recommendation {
  const createdAtRaw = now.toISOString();
  const expiresAtRaw = new Date(now.getTime() + 45 * 60 * 1000).toISOString();

  return {
    id: `${demoIdPrefix}rec-${now.getTime()}`,
    sessionType: "morning",
    sessionLabel: "Demo",
    ticker: "DEMO",
    companyName: "Demo Trade Corp.",
    direction: "Long",
    setupType: "VWAP_HOLD_CONTINUATION",
    entryZone: "$100.00 - $101.00",
    entryLowValue: 100,
    entryHighValue: 101,
    stopLossValue: 96,
    stopLoss: "96.00",
    target1: "108.00",
    target2: "112.00",
    riskReward: "2.0",
    confidence: "Demo",
    confidenceScore: 88,
    confidenceLabel: "HIGH CONVICTION",
    confidenceBreakdown: {
      setup_quality: 88,
      momentum_confirmation: 84,
      volume_confirmation: 82,
      risk_reward_quality: 90,
      market_regime_alignment: 86,
      timing_quality: 88,
    },
    confidenceReasoning:
      "DEMO ONLY: local test setup for manually clicking through the trade lifecycle. No broker order is created.",
    riskFlags: ["DEMO", "TEST ONLY", "NO BROKER ORDER"],
    intradayIndicators: {
      vwap: 99.4,
      latestPrice: 100.5,
      priceVsVwapPercent: 1.11,
      isAboveVwap: true,
      recentHigh: 101.3,
      recentLow: 98.9,
      recentRangePercent: 2.42,
      momentumPercent: 0.65,
      momentumDirection: "up",
      volumeTrend: "expanding",
      latestVolume: 250000,
      averageVolume: 180000,
      warnings: ["DEMO ONLY - no broker order submitted"],
    },
    discardedAtRaw: null,
    discardReviewStatus: null,
    discardReviewedAtRaw: null,
    discardOutcome: null,
    discardTheoreticalR: null,
    discardDecisionQuality: null,
    discardMaxFavorableR: null,
    discardMaxAdverseR: null,
    discardReviewNotes: [],
    timeframe: "Intraday demo",
    thesis:
      "DEMO ONLY: clean simulated VWAP hold intended to exercise ADD TRADE, broker fill capture, Live Day Trade, Close Trade, History, and Statistics.",
    invalidation: "Demo invalidation below 96.00.",
    reasonToAvoid:
      "DEMO ONLY. This is local test data and must not be treated as a real trading signal.",
    status: "new",
    archived: false,
    expiresAtRaw,
    scanWindow: "demo_flow",
    createdAt: formatDate(createdAtRaw),
    createdAtRaw,
  };
}

function buildDemoLatestPositionUpdate(
  position: ActivePosition,
): LatestPositionUpdate {
  const currentPrice =
    position.target1Value ??
    (position.entryPriceValue === null ? null : position.entryPriceValue * 1.08);
  const currentR = calculateCurrentR({
    entryPrice: position.entryPriceValue,
    stopLoss: position.stopLossValue,
    currentPrice,
    direction: position.direction,
  });
  const unrealized = calculateUnrealizedPnl({
    entryPrice: position.entryPriceValue,
    currentPrice,
    shares: position.positionSizeValue,
    direction: position.direction,
  });
  const updatedAtRaw = new Date().toISOString();

  return {
    positionId: position.id,
    action: "TAKE_PROFIT",
    recommendation: "Demo take-profit review",
    explanation:
      "DEMO ONLY: simulated live state for testing Close Trade and sell handoff.",
    newStop: position.stopLoss,
    currentPrice: formatCurrency(currentPrice),
    currentPriceValue: currentPrice,
    unrealizedR: formatNumber(currentR, "R"),
    unrealizedRValue: currentR,
    unrealizedPercent: formatPercent(unrealized.percent),
    unrealizedPercentValue: unrealized.percent,
    reason:
      "DEMO ONLY: price is near target so you can test the manual sell confirmation flow.",
    warnings: ["DEMO ONLY - no broker order submitted"],
    intradayIndicators: null,
    updatedAt: "Demo now",
    updatedAtRaw,
  };
}

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
    return { backgroundColor: "#00B899" };
  }

  if (status === "closed" || status === "closed_today") {
    return { backgroundColor: "#D84646" };
  }

  return undefined;
}

function getMarketCloseWarning(
  marketStatus: MarketStatus | null,
  now = new Date(),
) {
  const evaluation = buildMarketSessionEvaluation({ now, marketStatus });

  if (evaluation.phase === "holiday" || evaluation.phase === "closed") {
    return "Market is closed. Review this day trade.";
  }

  if (evaluation.phase === "after_hours") {
    return "Market is closed. Review this day trade.";
  }

  if (
    evaluation.phase === "closing_soon" &&
    evaluation.minutes_to_close !== null &&
    evaluation.minutes_to_close <= 15
  ) {
    return "Final minutes. Day trades should usually be closed or actively managed.";
  }

  if (evaluation.phase === "closing_soon") {
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

function positionActionClassName(value: string) {
  if (value === "REVIEW_REQUIRED") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-100";
  }

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

function positionActionPillClassName(value: string) {
  if (value === "CLOSE_POSITION") return "trade-live-action-pill--close";
  if (value === "TAKE_PROFIT" || value === "TAKE_PARTIAL_PROFIT") {
    return "trade-live-action-pill--profit";
  }

  return "trade-live-action-pill--hold";
}

function liveSellActionToLegacyAction(action: LiveSellAction) {
  if (action === "take_profit") return "TAKE_PROFIT";
  if (action === "close_position") return "CLOSE_POSITION";
  if (action === "review_required") return "REVIEW_REQUIRED";
  if (action === "watch") return "WATCH";
  return "HOLD";
}

function liveSellUrgencyTone(
  urgency: LiveSellUrgency,
): "positive" | "warning" | "danger" | "neutral" {
  if (urgency === "critical") return "danger";
  if (urgency === "high" || urgency === "medium") return "warning";
  if (urgency === "low") return "positive";
  return "neutral";
}

function liveSellGuidanceCardClassName(guidance: LiveSellGuidance) {
  if (guidance.urgency === "critical") {
    return "border-rose-300/45 bg-rose-300/[0.075] shadow-[0_0_0_1px_rgba(244,63,94,0.08),0_0_28px_rgba(244,63,94,0.08)]";
  }

  if (guidance.urgency === "high" || guidance.action === "review_required") {
    return "border-amber-300/35 bg-amber-300/[0.055]";
  }

  if (guidance.action === "take_profit") {
    return "border-emerald-300/35 bg-emerald-300/[0.055]";
  }

  if (guidance.action === "watch") {
    return "border-cyan-300/25 bg-cyan-300/[0.04]";
  }

  return "border-[#00db94]/20 bg-[#00db94]/[0.045]";
}

function isTakeProfitAction(value: string) {
  return value === "TAKE_PROFIT" || value === "TAKE_PARTIAL_PROFIT";
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

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

function getValidTimestampMs(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function getLatestIsoTimestamp(values: Array<string | null | undefined>) {
  const latestTimestamp = values.reduce<number | null>((latest, value) => {
    const timestamp = getValidTimestampMs(value);

    if (timestamp === null) {
      return latest;
    }

    return latest === null || timestamp > latest ? timestamp : latest;
  }, null);

  return latestTimestamp === null ? null : new Date(latestTimestamp).toISOString();
}

function formatStatusbarUpdatedAt(
  value: string | null | undefined,
  now: Date,
) {
  const timestamp = getValidTimestampMs(value);

  if (timestamp === null) {
    return "—";
  }

  const elapsedSeconds = Math.max(
    0,
    Math.floor((now.getTime() - timestamp) / 1000),
  );

  if (elapsedSeconds < 60) {
    return "JUST NOW";
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  if (elapsedMinutes < 60) {
    return elapsedMinutes === 1 ? "1 MINUTE AGO" : `${elapsedMinutes} MINUTES AGO`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return elapsedHours === 1 ? "1 HOUR AGO" : `${elapsedHours} HOURS AGO`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
    .format(new Date(timestamp))
    .toUpperCase();
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

function getRecommendationSnapshotWindow(
  value: string | null | undefined,
): RecommendationSnapshotWindow {
  if (value === "opening" || value === "morning_momentum" || value === "morning") {
    return "morning";
  }

  if (value === "midday" || value === "afternoon") {
    return "midday";
  }

  if (value === "power_hour") {
    return "power_hour";
  }

  return "unknown";
}

function getRecommendationSnapshotSource(recommendation: Recommendation) {
  if (isDemoRecommendation(recommendation)) {
    return "demo" as const;
  }

  if (recommendation.id.startsWith("dev-preview-recommendation-")) {
    return "dev_preview" as const;
  }

  return "supabase" as const;
}

function getRecommendationSnapshotDataMode(
  recommendation: Recommendation,
  dataModeClaritySummary: DataModeClaritySummary,
) {
  if (isDemoRecommendation(recommendation)) {
    return "demo";
  }

  if (recommendation.id.startsWith("dev-preview-recommendation-")) {
    return "local_dev";
  }

  return dataModeClaritySummary.overall_mode;
}

function buildVisibleRecommendationSnapshotInput({
  recommendation,
  now,
  currentScanWindow,
  scanRunId,
  marketSession,
  dataModeClaritySummary,
  intakeQuality,
  scanObservability,
  emptyState,
  riskControls,
  preTradeRiskContext,
  tradeEligibility,
  decisionStack,
  positionSizing,
}: {
  recommendation: Recommendation;
  now: Date;
  currentScanWindow: IntradayScanWindow;
  scanRunId: string | null;
  marketSession: {
    phase: string | null;
    risk_level: string | null;
    source: string | null;
  };
  dataModeClaritySummary: DataModeClaritySummary;
  intakeQuality: RecommendationIntakeQualityResult | null;
  scanObservability: ScanPipelineObservabilitySummary | null;
  emptyState: RecommendationEmptyStateSummary | null;
  riskControls: unknown;
  preTradeRiskContext: PreTradeRiskContextResult | null;
  tradeEligibility: TradeEligibilityResult | null;
  decisionStack: RecommendationDecisionStackResult | null;
  positionSizing: unknown;
}): RecommendationSnapshotInput {
  const entry = getRecommendationEntryFallback(recommendation);
  const target = getPrimaryTargetPrice(recommendation);
  const stop = recommendation.stopLossValue;
  const side = recommendation.direction === "Short" ? "short" : "long";
  const riskPerShare =
    entry !== null && stop !== null
      ? side === "short"
        ? stop - entry
        : entry - stop
      : null;
  const rewardPerShare =
    entry !== null && target !== null
      ? side === "short"
        ? entry - target
        : target - entry
      : null;
  const rationale = [
    recommendation.thesis,
    recommendation.confidenceReasoning,
    recommendation.invalidation,
    recommendation.reasonToAvoid,
  ]
    .filter(Boolean)
    .join(" ");
  const sourceMode = getRecommendationSnapshotSource(recommendation);

  return {
    recommendation_id: recommendation.id,
    scan_run_id: scanRunId,
    ticker: recommendation.ticker,
    company_name: recommendation.companyName,
    recommended_at: recommendation.createdAtRaw,
    app_timestamp: now,
    window: getRecommendationSnapshotWindow(
      recommendation.scanWindow ?? currentScanWindow,
    ),
    market_session_phase: marketSession.phase,
    market_session_risk: marketSession.risk_level,
    market_session_source: marketSession.source,
    source_mode: sourceMode,
    data_mode: getRecommendationSnapshotDataMode(
      recommendation,
      dataModeClaritySummary,
    ),
    is_visible: true,
    is_demo: sourceMode === "demo",
    is_mock: false,
    is_real: sourceMode === "supabase",
    entry,
    entry_low: recommendation.entryLowValue,
    entry_high: recommendation.entryHighValue,
    stop,
    target,
    side,
    risk_per_share:
      riskPerShare !== null && riskPerShare > 0 ? riskPerShare : null,
    reward_per_share:
      rewardPerShare !== null && rewardPerShare > 0 ? rewardPerShare : null,
    planned_risk_reward: parseNumber(recommendation.riskReward),
    confidence: recommendation.confidenceScore ?? recommendation.confidence,
    score: recommendation.confidenceScore,
    rating: recommendation.confidence,
    label: recommendation.confidenceLabel,
    type: recommendation.setupType,
    rationale,
    reason: recommendation.thesis,
    catalyst: recommendation.confidenceReasoning || null,
    primary_risk:
      recommendation.riskFlags[0] ??
      recommendation.invalidation ??
      recommendation.reasonToAvoid ??
      null,
    market_data_snapshot: recommendation.intradayIndicators,
    quote_price: recommendation.intradayIndicators?.latestPrice ?? null,
    volume: recommendation.intradayIndicators?.latestVolume ?? null,
    liquidity: null,
    spread: null,
    freshness: getRecommendationFreshness(toFreshnessInput(recommendation)),
    data_age_minutes: scanObservability?.run_context.data_age_minutes ?? null,
    quality: {
      intake_quality_result: intakeQuality,
      scan_observability_summary: scanObservability,
      empty_state_summary: emptyState,
      data_mode_clarity_summary: dataModeClaritySummary,
      risk_controls_context: riskControls,
      pre_trade_risk_context: preTradeRiskContext,
      trade_eligibility_context: tradeEligibility,
      decision_stack_context: decisionStack,
      position_sizing_summary: positionSizing,
    },
    was_taken: recommendation.status === "taken",
    linked_position_id: null,
    payload: {
      recommendation: {
        id: recommendation.id,
        ticker: recommendation.ticker,
        company_name: recommendation.companyName,
        direction: recommendation.direction,
        setup_type: recommendation.setupType,
        entry_low: recommendation.entryLowValue,
        entry_high: recommendation.entryHighValue,
        stop_loss: recommendation.stopLossValue,
        target_1: recommendation.target1,
        target_2: recommendation.target2,
        risk_reward: recommendation.riskReward,
        confidence: recommendation.confidence,
        confidence_score: recommendation.confidenceScore,
        confidence_label: recommendation.confidenceLabel,
        risk_flags: recommendation.riskFlags,
        status: recommendation.status,
        scan_window: recommendation.scanWindow,
        expires_at: recommendation.expiresAtRaw,
        created_at: recommendation.createdAtRaw,
      },
      market_session: marketSession,
      source: {
        source_mode: sourceMode,
        data_mode: getRecommendationSnapshotDataMode(
          recommendation,
          dataModeClaritySummary,
        ),
        is_demo: sourceMode === "demo",
        is_dev_preview: sourceMode === "dev_preview",
      },
    },
    created_at: now,
    updated_at: now,
  };
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
    | "buy_order_ready_for_agent"
    | "agent_handoff_blocked_by_readiness"
    | "broker_manual_confirmation_checked"
    | "broker_plan_match_checked"
    | "agent_prepared_order_form_checked"
    | "broker_buy_form_prepared_checked"
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

function logTradePlanningSnapshotCapturedEvent(
  recommendation: Recommendation,
  snapshot: TradePlanningSnapshot,
  handoff: {
    handoffSessionId: string | null;
    payloadId: string | null;
    payloadFingerprint: string | null;
  },
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type: "trade_planning_snapshot_captured",
      snapshot_id: snapshot.snapshot_id,
      snapshot_version: snapshot.snapshot_version,
      captured_at: snapshot.captured_at,
      recommendation_id: recommendation.id,
      ticker: recommendation.ticker,
      handoff_session_id: handoff.handoffSessionId,
      payload_id: handoff.payloadId,
      payload_fingerprint: handoff.payloadFingerprint,
      preflight_status: snapshot.preflight_status,
      position_sizing_status: snapshot.position_sizing_status,
      trade_plan_quality_status: snapshot.trade_plan_quality_status,
      risk_controls_status: snapshot.risk_controls_status,
      market_session_phase: snapshot.market_session_phase,
      broker_fill_status: snapshot.broker_fill_status,
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
    // Best-effort local event log only; planning metadata must never block trade creation.
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

function logMockBrokerFillImportEvent(
  type:
    | "mock_broker_fill_import_loaded"
    | "mock_broker_buy_fill_imported"
    | "mock_broker_sell_fill_imported"
    | "mock_broker_fill_import_blocked",
  payload: {
    side?: "BUY" | "SELL";
    ticker?: string | null;
    status?: string | null;
    blockerCount?: number;
    warningCount?: number;
    confirmationId?: string | null;
    actualPrice?: number | null;
    actualShares?: number | null;
    positionId?: string | null;
    recommendationId?: string | null;
  },
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type,
      source: "mock_broker_fill_import",
      mock_only: true,
      avanza_not_contacted: true,
      no_real_order_submitted: true,
      side: payload.side ?? null,
      ticker: payload.ticker ?? null,
      status: payload.status ?? null,
      blocker_count: payload.blockerCount ?? 0,
      warning_count: payload.warningCount ?? 0,
      confirmation_id: payload.confirmationId ?? null,
      actual_price: payload.actualPrice ?? null,
      actual_shares: payload.actualShares ?? null,
      position_id: payload.positionId ?? null,
      recommendation_id: payload.recommendationId ?? null,
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
    // Mock import audit is local diagnostic state only.
  }
}

function logAgentHandoffCommandEvent(
  type: "agent_handoff_command_generated" | "agent_handoff_command_copied",
  command: AgentHandoffCommand,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type,
      command_id: command.command_id,
      command_version: command.command_version,
      handoff_session_id: command.handoff_session_id,
      payload_id: command.payload_id,
      status: command.status,
      hard_stop_failed_count: command.hard_stop_rules.filter(
        (rule) => rule.status === "failed",
      ).length,
      hard_stop_warning_count: command.hard_stop_rules.filter(
        (rule) => rule.status === "warning",
      ).length,
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
    // Best-effort local event log only; command audit must never block the UI.
  }
}

function logAgentHardStopContractEvent(
  contract: AgentHardStopContract,
  payload: TradeExecutionPayload,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type: "agent_hard_stop_contract_evaluated",
      contract_version: contract.contract_version,
      overall_status: contract.overall_status,
      failed_count: contract.failed_count,
      warning_count: contract.warning_count,
      unknown_count: contract.unknown_count,
      top_blocker_ids: contract.machine_summary.top_blocker_ids,
      handoff_session_id: payload.handoff_session_id,
      payload_id: payload.payload_id,
      evaluated_at: contract.evaluated_at,
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
    // Best-effort local event log only; hard-stop audit must never block the UI.
  }
}

function getAgentFormMappingFieldCounts(preview: AgentFormMappingPreview) {
  return {
    field_count: preview.field_mappings.length,
    ready_count: preview.field_mappings.filter(
      (field) => field.status === "ready",
    ).length,
    warning_count: preview.field_mappings.filter(
      (field) => field.status === "warning",
    ).length,
    blocked_count: preview.field_mappings.filter(
      (field) => field.status === "blocked",
    ).length,
    missing_count: preview.field_mappings.filter(
      (field) => field.status === "missing",
    ).length,
  };
}

function logAgentFormMappingPreviewEvent(
  type:
    | "agent_form_mapping_preview_generated"
    | "agent_form_mapping_preview_copied",
  preview: AgentFormMappingPreview,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const counts = getAgentFormMappingFieldCounts(preview);
    const event = {
      type,
      preview_id: preview.preview_id,
      preview_version: preview.preview_version,
      status: preview.overall_status,
      ...counts,
      handoff_session_id: preview.handoff_session_id,
      payload_id: preview.payload_id,
      command_id: preview.command_id,
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
    // Best-effort local event log only; form mapping audit must never block the UI.
  }
}

function logBuyOrderHandoffProgressEvent(
  progress: BuyOrderHandoffProgress,
  payload: TradeExecutionPayload,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type: "buy_order_handoff_progress_generated",
      handoff_session_id: payload.handoff_session_id,
      payload_id: payload.payload_id,
      recommendation_id: payload.recommendation_id,
      ticker: payload.ticker,
      overall_status: progress.overall_status,
      next_action_label: progress.next_action_label,
      can_mark_ready_for_agent: progress.can_mark_ready_for_agent,
      can_create_live_trade: progress.can_create_live_trade,
      step_statuses: progress.steps.map((step) => ({
        id: step.id,
        status: step.status,
      })),
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
    // Best-effort local event log only; progress display must never block the UI.
  }
}

function logSellExecutionPayloadEvent(
  type: "sell_execution_payload_generated" | "sell_execution_payload_copied",
  payload: TradeExitExecutionPayload,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type,
      payload_id: payload.payload_id,
      payload_version: payload.payload_version,
      payload_kind: payload.payload_kind,
      payload_fingerprint: payload.payload_fingerprint,
      handoff_session_id: payload.handoff_session_id,
      position_id: payload.exit_context.position_id,
      ticker: payload.exit_context.ticker,
      quantity_to_sell: payload.order_intent.quantity_to_sell,
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
    // Best-effort local event log only; sell payload actions must never block close flow.
  }
}

function logSellAgentHandoffCommandEvent(
  type:
    | "sell_agent_handoff_command_generated"
    | "sell_agent_handoff_command_copied",
  command: SellAgentHandoffCommand,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type,
      command_id: command.command_id,
      command_version: command.command_version,
      command_kind: command.command_kind,
      handoff_session_id: command.handoff_session_id,
      payload_id: command.payload_id,
      position_id: command.exit_context.position_id,
      ticker: command.instrument.ticker_symbol,
      status: command.status,
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
    // Best-effort local event log only; sell command actions must never block close flow.
  }
}

function logSellHardStopContractEvent(
  contract: SellHardStopContract,
  payload: TradeExitExecutionPayload,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type: "sell_hard_stop_contract_evaluated",
      contract_version: contract.contract_version,
      overall_status: contract.overall_status,
      failed_count: contract.failed_count,
      warning_count: contract.warning_count,
      unknown_count: contract.unknown_count,
      top_blocker_ids: contract.machine_summary.top_blocker_ids,
      handoff_session_id: payload.handoff_session_id,
      payload_id: payload.payload_id,
      position_id: payload.exit_context.position_id,
      ticker: payload.exit_context.ticker,
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
    // Best-effort local event log only; sell hard stops must never block close flow.
  }
}

function logSellFormMappingPreviewEvent(
  type:
    | "sell_form_mapping_preview_generated"
    | "sell_form_mapping_preview_copied",
  preview: SellFormMappingPreview,
  payload: TradeExitExecutionPayload,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const counts = getSellFormMappingFieldCounts(preview);
    const event = {
      type,
      preview_id: preview.preview_id,
      preview_version: preview.preview_version,
      preview_kind: preview.preview_kind,
      overall_status: preview.overall_status,
      ...counts,
      handoff_session_id: preview.handoff_session_id,
      payload_id: preview.payload_id,
      command_id: preview.command_id,
      position_id: payload.exit_context.position_id,
      ticker: payload.exit_context.ticker,
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
    // Best-effort local event log only; sell mapping preview must never block close flow.
  }
}

function logBrokerFillCaptureAgentSpecEvent(
  type:
    | "broker_fill_capture_agent_spec_generated"
    | "broker_fill_capture_agent_spec_copied"
    | "broker_exit_capture_agent_spec_generated"
    | "broker_exit_capture_agent_spec_copied",
  spec: BrokerFillCaptureAgentSpec,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type,
      spec_id: spec.spec_id,
      spec_version: spec.spec_version,
      spec_kind: spec.spec_kind,
      side: spec.side,
      broker: spec.broker,
      mode: spec.mode,
      handoff_session_id: spec.handoff_session_id,
      payload_id: spec.source_payload_id,
      payload_fingerprint: spec.source_payload_fingerprint,
      ticker: spec.expected_instrument.ticker,
      required_field_count: spec.required_fields.length,
      optional_field_count: spec.optional_fields.length,
      hard_stop_count: spec.hard_stops.length,
      forbidden_action_count: spec.forbidden_agent_actions.length,
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
    // Best-effort local event log only; capture specs must never block the UI.
  }
}

function logTureFillAutofillContractEvent(
  type:
    | "ture_fill_autofill_contract_generated"
    | "ture_fill_autofill_contract_copied"
    | "ture_exit_autofill_contract_generated"
    | "ture_exit_autofill_contract_copied",
  contract: TureFillAutofillContract,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type,
      contract_id: contract.contract_id,
      contract_version: contract.contract_version,
      contract_kind: contract.contract_kind,
      side: contract.side,
      broker: contract.broker,
      mode: contract.mode,
      target_form: contract.target_form,
      handoff_session_id: contract.handoff_session_id,
      payload_id: contract.source_payload_id,
      payload_fingerprint: contract.source_payload_fingerprint,
      capture_spec_id: contract.capture_spec_id,
      required_field_count: contract.required_autofill_fields.length,
      optional_field_count: contract.optional_autofill_fields.length,
      review_context_field_count: contract.review_only_context_fields.length,
      hard_stop_count: contract.hard_stops.length,
      forbidden_action_count: contract.forbidden_agent_actions.length,
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
    // Best-effort local event log only; autofill contracts must never block the UI.
  }
}

function logAvanzaFieldVerificationEvent(
  type:
    | "avanza_buy_field_verification_generated"
    | "avanza_buy_field_verification_copied"
    | "avanza_sell_field_verification_generated"
    | "avanza_sell_field_verification_copied"
    | "avanza_verification_notes_applied_to_report",
  report: AvanzaFieldVerificationReport,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type,
      report_id: report.report_id,
      report_version: report.report_version,
      report_kind: report.report_kind,
      side: report.side,
      broker: report.broker,
      overall_status: report.overall_status,
      verified_count: report.verified_count,
      assumed_count: report.assumed_count,
      unknown_count: report.unknown_count,
      blocked_count: report.blocked_count,
      blocker_ids: report.blockers.map((blocker) => blocker.blocker_id),
      warning_ids: report.warnings.map((warning) => warning.warning_id),
      can_future_agent_prepare_form: report.can_future_agent_prepare_form,
      can_future_agent_submit_order: report.can_future_agent_submit_order,
      manual_notes_applied: report.manual_notes_applied,
      notes_source: report.notes_source,
      notes_updated_at: report.notes_updated_at,
      verified_from_manual_notes_count:
        report.verified_from_manual_notes_count,
      handoff_session_id: report.handoff_session_id,
      payload_id: report.payload_id,
      command_id: report.command_id,
      form_mapping_preview_id: report.form_mapping_preview_id,
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
    // Best-effort local event log only; verification reports are read-only.
  }
}

function readManualAvanzaVerificationNotesForReport():
  | AvanzaVerificationNotesState
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(
      AVANZA_VERIFICATION_NOTES_STORAGE_KEY,
    );

    return stored
      ? normalizeAvanzaVerificationNotesState(JSON.parse(stored))
      : null;
  } catch {
    return null;
  }
}

function readRiskControlsSettingsForTradeApp(): RiskControlsSettings {
  if (typeof window === "undefined") {
    return createDefaultRiskControlsSettings();
  }

  try {
    const stored = window.localStorage.getItem(RISK_CONTROLS_STORAGE_KEY);

    return stored
      ? normalizeRiskControlsSettings(JSON.parse(stored))
      : createDefaultRiskControlsSettings();
  } catch {
    return createDefaultRiskControlsSettings();
  }
}

function readPaperSessionProtocolState(): PaperSessionProtocolLocalState {
  if (typeof window === "undefined") {
    return createDefaultPaperSessionProtocolState();
  }

  try {
    const stored = window.localStorage.getItem(paperSessionProtocolStorageKey);

    return stored
      ? normalizePaperSessionProtocolState(JSON.parse(stored))
      : createDefaultPaperSessionProtocolState();
  } catch {
    return createDefaultPaperSessionProtocolState();
  }
}

function logRiskControlsEvaluationEvent(
  type:
    | "risk_controls_evaluated_for_new_trade"
    | "risk_controls_blocked_new_trade"
    | "risk_controls_warning_new_trade",
  evaluation: RiskControlsEvaluation,
  context: {
    recommendationId?: string | null;
    positionId?: string | null;
  } = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type,
      evaluation_id: evaluation.evaluation_id,
      evaluation_kind: evaluation.evaluation_kind,
      status: evaluation.status,
      mode: evaluation.mode,
      enabled: evaluation.enabled,
      ticker: evaluation.ticker,
      blocks_new_trade: evaluation.blocks_new_trade,
      blocker_ids: evaluation.blockers.map((blocker) => blocker.blocker_id),
      warning_ids: evaluation.warnings.map((warning) => warning.warning_id),
      recommendation_id: context.recommendationId ?? null,
      position_id: context.positionId ?? null,
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
    // Local risk-control audit must never block trading UI.
  }
}

function logFillCaptureReviewEvent(
  type: "fill_capture_review_generated" | "exit_capture_review_generated",
  review: FillCaptureReview,
  context: {
    payloadId?: string | null;
    payloadFingerprint?: string | null;
    handoffSessionId?: string | null;
    recommendationId?: string | null;
    positionId?: string | null;
    ticker?: string | null;
  },
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type,
      review_id: review.review_id,
      review_version: review.review_version,
      review_kind: review.review_kind,
      side: review.side,
      status: review.status,
      confidence_score: review.confidence_score,
      confidence_label: review.confidence_label,
      blocker_count: review.blockers.length,
      warning_count: review.warnings.length,
      blocker_ids: review.blockers.map((blocker) => blocker.blocker_id),
      warning_ids: review.warnings.map((warning) => warning.warning_id),
      payload_id: context.payloadId ?? null,
      payload_fingerprint: context.payloadFingerprint ?? null,
      handoff_session_id: context.handoffSessionId ?? null,
      recommendation_id: context.recommendationId ?? null,
      position_id: context.positionId ?? null,
      ticker: context.ticker ?? null,
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
    // Best-effort local event log only; review display must never block the UI.
  }
}

function logTureAgentCompletionPolicyEvent(
  type:
    | "ture_agent_completion_policy_generated"
    | "ture_exit_completion_policy_generated",
  policy: TureAgentCompletionPolicy,
  context: {
    recommendationId?: string | null;
    positionId?: string | null;
  } = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type,
      policy_id: policy.policy_id,
      policy_version: policy.policy_version,
      policy_kind: policy.policy_kind,
      side: policy.side,
      target_action: policy.target_action,
      decision: policy.decision,
      review_id: policy.review_id,
      review_status: policy.review_status,
      autofill_contract_id: policy.autofill_contract_id,
      blocker_count: policy.blockers.length,
      warning_count: policy.warnings.length,
      blocker_ids: policy.blockers.map((blocker) => blocker.blocker_id),
      warning_ids: policy.warnings.map((warning) => warning.warning_id),
      payload_id: policy.source_payload_id,
      payload_fingerprint: policy.source_payload_fingerprint,
      handoff_session_id: policy.handoff_session_id,
      recommendation_id: context.recommendationId ?? null,
      position_id: context.positionId ?? policy.position_id,
      ticker: policy.ticker,
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
    // Best-effort local event log only; completion policy is read-only.
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

function logBrokerExitConfirmationEvent(
  type:
    | "broker_sell_manual_confirmation_checked"
    | "broker_sell_plan_match_checked"
    | "broker_exit_fill_captured"
    | "live_day_trade_closed_after_broker_exit_confirmation",
  position: ActivePosition,
  confirmation: BrokerExitConfirmation,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const event = {
      type,
      position_id: position.id,
      recommendation_id: position.recommendationId,
      ticker: position.ticker,
      exit_status: confirmation.exit_status,
      actual_exit_price: confirmation.actual_exit_price,
      actual_sold_shares: confirmation.actual_sold_shares,
      broker_confirmed_at: confirmation.broker_confirmed_at,
      sell_payload_id: confirmation.sell_payload_id,
      sell_payload_fingerprint: confirmation.sell_payload_fingerprint,
      sell_command_id: confirmation.sell_command_id,
      handoff_session_id: confirmation.sell_handoff_session_id,
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
    // Best-effort local audit only; broker exit confirmation must never block close flow.
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
  const [selectedStatisticsRange, setSelectedStatisticsRange] =
    useState<StatisticsTimeRange>("today");
  const [historyOutcomeFilter, setHistoryOutcomeFilter] =
    useState<HistoryOutcomeFilter>(defaultHistoryFilterState.outcome);
  const [historyDemoFilter, setHistoryDemoFilter] =
    useState<HistoryDemoFilter>(defaultHistoryFilterState.demo);
  const [historyPartialFilter, setHistoryPartialFilter] =
    useState<HistoryPartialFilter>(defaultHistoryFilterState.partial);
  const [historySortMode, setHistorySortMode] =
    useState<HistorySortMode>(defaultHistoryFilterState.sort);
  const [liveTestReadinessMode, setLiveTestReadinessMode] =
    useState<LiveTestReadinessMode>("real_market_paper");
  const [paperSessionProtocolState, setPaperSessionProtocolState] =
    useState<PaperSessionProtocolLocalState>(() =>
      createDefaultPaperSessionProtocolState(),
    );
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
  const autoRefreshLiveTrades = true;
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [lastAutoRefreshAt, setLastAutoRefreshAt] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [generatingSessionType, setGeneratingSessionType] =
    useState<SessionType | null>(null);
  const [isUpdatingPositions, setIsUpdatingPositions] = useState(false);
  const [message, setMessage] = useState("");
  const [lastDemoAction, setLastDemoAction] = useState("No demo action yet.");
  const [scanLogs, setScanLogs] = useState<ScanLogEntry[]>([]);
  const [marketRegime, setMarketRegime] = useState<MarketRegime | null>(null);
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [marketStatusError, setMarketStatusError] = useState("");
  const [brokerCostModel, setBrokerCostModel] = useState<BrokerCostModel | null>(
    null,
  );
  const [riskControlsSettings, setRiskControlsSettings] = useState(() =>
    createDefaultRiskControlsSettings(),
  );
  const [storedRecommendationSnapshots, setStoredRecommendationSnapshots] =
    useState<RecommendationSnapshot[]>([]);
  const [storedRecommendationOutcomes, setStoredRecommendationOutcomes] =
    useState<RecommendationOutcome[]>([]);
  const [recommendationSnapshotDiagnostics, setRecommendationSnapshotDiagnostics] =
    useState<RecommendationSnapshotDiagnostics>({
      snapshotsStoredToday: 0,
      lastSnapshotTimestamp: null,
      duplicateSkippedCount: 0,
      persistenceStatus: "idle",
      persistenceMode: "unknown",
      lastError: null,
    });
  const [recommendationOutcomeDiagnostics, setRecommendationOutcomeDiagnostics] =
    useState<RecommendationOutcomeDiagnostics>({
      trackedSnapshotsCount: 0,
      pendingOutcomes: 0,
      completedOutcomes: 0,
      incompleteOutcomes: 0,
      unknownOutcomes: 0,
      lastOutcomeEvaluationTimestamp: null,
      persistenceStatus: "idle",
      persistenceMode: "unknown",
      lastError: null,
    });
  const [
    recommendationOutcomeEvaluationRun,
    setRecommendationOutcomeEvaluationRun,
  ] = useState<RecommendationOutcomeEvaluationRun | null>(null);
  const [
    recommendationOutcomeEvaluationDiagnostics,
    setRecommendationOutcomeEvaluationDiagnostics,
  ] = useState<RecommendationOutcomeEvaluationDiagnostics>({
    status: "idle",
    eligibleSnapshots: 0,
    evaluatedSnapshots: 0,
    incompleteDueToMissingCandles: 0,
    providerErrors: 0,
    lastRunTimestamp: null,
    horizonsEvaluated: [],
    persistenceMode: "unknown",
    snapshotOnly: true,
    summary: "Outcome evaluation has not run yet.",
  });
  const [isEvaluatingRecommendationOutcomes, setIsEvaluatingRecommendationOutcomes] =
    useState(false);
  const hasLoadedRecommendationsRef = useRef(false);
  const hasLoadedPaperSessionProtocolRef = useRef(false);
  const previousRecommendationIdsRef = useRef<Set<string>>(new Set());
  const persistedRecommendationSnapshotFingerprintsRef = useRef<Set<string>>(
    new Set(),
  );
  const persistedRecommendationOutcomeIdsRef = useRef<Set<string>>(new Set());
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
    const demoRecommendations = readDemoRecommendations();
    const demoActivePositions = readDemoActivePositions();
    const demoClosedPositions = readDemoClosedPositions();

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
      const loadedRecommendations = (recommendationsResult.data as RecommendationRow[])
        .map(toRecommendation);
      const hasCurrentLoadedRecommendations = loadedRecommendations.some(
        (recommendation) =>
          !recommendation.archived &&
          !historyStatuses.includes(recommendation.status) &&
          !isRecommendationExpired(toFreshnessInput(recommendation)),
      );

      const baseRecommendations =
        shouldUseDevPreviewData && !hasCurrentLoadedRecommendations
          ? [...buildDevPreviewRecommendations(), ...loadedRecommendations]
          : loadedRecommendations;

      setRecommendations([
        ...demoRecommendations,
        ...baseRecommendations.filter(
          (recommendation) => !isDemoRecommendation(recommendation),
        ),
      ]);
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
      setActivePositions([
        ...demoActivePositions,
        ...(positionsResult.data as PositionRow[]).map(toActivePosition),
      ]);
    }

    if (closedPositionsResult.error) {
      setMessage(closedPositionsResult.error.message);
    } else {
      setClosedPositions([
        ...demoClosedPositions,
        ...(closedPositionsResult.data as PositionRow[]).map(toClosedPosition),
      ]);
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

      for (const position of demoActivePositions) {
        updatesByPosition[position.id] = buildDemoLatestPositionUpdate(position);
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
      setRiskControlsSettings(readRiskControlsSettingsForTradeApp());
      const storedPaperSessionProtocol = readPaperSessionProtocolState();
      setPaperSessionProtocolState(storedPaperSessionProtocol);
      if (storedPaperSessionProtocol.selected_mode === "demo_rehearsal") {
        setLiveTestReadinessMode("demo_rehearsal");
      } else if (storedPaperSessionProtocol.selected_mode === "real_market_paper") {
        setLiveTestReadinessMode("real_market_paper");
      }
      hasLoadedPaperSessionProtocolRef.current = true;
      setLastDemoAction(readDemoLastAction());
      setStoredRecommendationSnapshots(readRecommendationSnapshotsFromLocalStorage());
      setStoredRecommendationOutcomes(readRecommendationOutcomesFromLocalStorage());
      loadTradeData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasLoadedPaperSessionProtocolRef.current) {
      return;
    }

    try {
      window.localStorage.setItem(
        paperSessionProtocolStorageKey,
        JSON.stringify(paperSessionProtocolState),
      );
    } catch {
      // Local paper-session checklist state should never block the app.
    }
  }, [paperSessionProtocolState]);

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

    if (isDemoRecommendation(recommendation)) {
      const positionSizing = calculatePositionSizing(recommendation, userSettings);
      const demoValidation: AddTradeValidationResult = {
        status: "valid",
        reason: "DEMO ONLY: local validation passed for manual E2E testing.",
        reasons: [
          "DEMO ONLY: local validation passed for manual E2E testing.",
          "No broker is contacted and no order is submitted.",
        ],
        latestIndicators: recommendation.intradayIndicators,
        indicatorSource: "cache",
        stale: false,
      };

      setSelectedRecommendation(recommendation);
      setSelectedTradeValidationStatus(demoValidation.status);
      setSelectedTradeValidation(demoValidation);
      setSelectedTradeValidationMessage("");
      setEntryPrice("");
      setPositionSize(
        positionSizing.suggestedShares === null
          ? "10"
          : String(positionSizing.suggestedShares),
      );
      setMessage(
        "Demo ADD TRADE opened. This flow uses local test data only and cannot submit broker orders.",
      );
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

  function createDemoRecommendation() {
    if (!demoTradingFlowEnabled) {
      return;
    }

    const demoRecommendation = buildDemoRecommendation();
    const nextDemoRecommendations = [
      demoRecommendation,
      ...readDemoRecommendations().filter(
        (recommendation) => recommendation.id !== demoRecommendation.id,
      ),
    ];

    writeDemoRecommendations(nextDemoRecommendations);
    writeDemoLastAction("Demo recommendation created.");
    setLastDemoAction("Demo recommendation created.");
    setRecommendations((currentRecommendations) => [
      demoRecommendation,
      ...currentRecommendations.filter(
        (recommendation) => recommendation.id !== demoRecommendation.id,
      ),
    ]);
    setActiveTab("Recommendations");
    setMessage(
      "Demo recommendation created locally. It will not contact Avanza or submit orders.",
    );
  }

  function clearDemoTradeData() {
    if (!demoTradingFlowEnabled) {
      return;
    }

    clearStoredDemoTradeData();
    setLastDemoAction("No demo action yet.");
    setRecommendations((currentRecommendations) =>
      currentRecommendations.filter(
        (recommendation) => !isDemoRecommendation(recommendation),
      ),
    );
    setActivePositions((currentPositions) =>
      currentPositions.filter((position) => !isDemoPosition(position)),
    );
    setClosedPositions((currentPositions) =>
      currentPositions.filter((position) => !isDemoPosition(position)),
    );
    setLatestPositionUpdates((currentUpdates) => {
      const nextUpdates = { ...currentUpdates };

      for (const positionId of Object.keys(nextUpdates)) {
        if (isDemoId(positionId)) {
          delete nextUpdates[positionId];
        }
      }

      return nextUpdates;
    });

    if (isDemoRecommendation(selectedRecommendation)) {
      setSelectedRecommendation(null);
      setSelectedTradeValidationStatus(null);
      setSelectedTradeValidation(null);
      setSelectedTradeValidationMessage("");
      setEntryPrice("");
      setPositionSize("");
    }

    if (isDemoPosition(selectedPosition)) {
      setSelectedPosition(null);
      setExitPrice("");
      setExitNotes("");
    }

    setMessage("Demo recommendations, live trades, and history cleared locally.");
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
            agentHandoffCommand: toAgentHandoffCommandMetadataSnapshot(
              brokerFill.agentHandoffCommand,
            ),
            agentHardStopContract: toAgentHardStopContractMetadataSnapshot(
              brokerFill.agentHardStopContract,
            ),
            agentFormMappingPreview: toAgentFormMappingPreviewMetadataSnapshot(
              brokerFill.agentFormMappingPreview,
            ),
            tradePlanningSnapshot: brokerFill.tradePlanningSnapshot,
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

    if (isDemoRecommendation(selectedRecommendation)) {
      const openedAt = new Date().toISOString();
      const demoPosition: ActivePosition = {
        id: `${demoIdPrefix}pos-${Date.now()}`,
        recommendationId: selectedRecommendation.id,
        ticker: selectedRecommendation.ticker,
        companyName: selectedRecommendation.companyName,
        direction: selectedRecommendation.direction,
        entryPrice: money(actualEntryPrice),
        entryPriceValue: actualEntryPrice,
        positionSize: formatShares(actualPositionSize),
        positionSizeValue: actualPositionSize,
        stopLoss: selectedRecommendation.stopLoss,
        stopLossValue: selectedRecommendation.stopLossValue,
        target1: selectedRecommendation.target1,
        target1Value: parseNumber(selectedRecommendation.target1),
        target2: selectedRecommendation.target2,
        target2Value: parseNumber(selectedRecommendation.target2),
        invalidation: selectedRecommendation.invalidation,
        openedAt: formatDate(openedAt),
        openedAtRaw: openedAt,
        executionMetadata,
      };
      const nextDemoRecommendations = readDemoRecommendations().map(
        (recommendation) =>
          recommendation.id === selectedRecommendation.id
            ? { ...recommendation, status: "taken" as const }
            : recommendation,
      );
      const nextDemoActivePositions = [
        demoPosition,
        ...readDemoActivePositions().filter(
          (position) => position.id !== demoPosition.id,
        ),
      ];

      writeDemoRecommendations(nextDemoRecommendations);
      writeDemoActivePositions(nextDemoActivePositions);
      writeDemoLastAction("Demo Live Day Trade created.");
      void markRecommendationSnapshotTaken(
        {
          recommendation_id: selectedRecommendation.id,
          linked_position_id: demoPosition.id,
          taken_at: openedAt,
        },
        { storage: typeof window === "undefined" ? undefined : window.localStorage },
      );

      if (brokerFill) {
        logLiveDayTradeCreatedAfterBrokerConfirmation(
          selectedRecommendation,
          brokerFill,
        );
        logBrokerOrderPreviewCaptured(selectedRecommendation, brokerFill);
        logTradePlanningSnapshotCapturedEvent(
          selectedRecommendation,
          brokerFill.tradePlanningSnapshot,
          {
            handoffSessionId: brokerFill.handoffSessionId,
            payloadId: brokerFill.payloadId,
            payloadFingerprint: brokerFill.payloadFingerprint,
          },
        );
      }

      setRecommendations((currentRecommendations) =>
        currentRecommendations.map((recommendation) =>
          recommendation.id === selectedRecommendation.id
            ? { ...recommendation, status: "taken" }
            : recommendation,
        ),
      );
      setActivePositions((currentPositions) => [
        demoPosition,
        ...currentPositions.filter((position) => position.id !== demoPosition.id),
      ]);
      setLatestPositionUpdates((currentUpdates) => ({
        ...currentUpdates,
        [demoPosition.id]: buildDemoLatestPositionUpdate(demoPosition),
      }));
      setLastDemoAction("Demo Live Day Trade created.");
      setSelectedRecommendation(null);
      setSelectedTradeValidationStatus(null);
      setSelectedTradeValidation(null);
      setSelectedTradeValidationMessage("");
      setActiveTab("Live Day Trades");
      setMessage(
        `${selectedRecommendation.ticker} demo Live Day Trade created locally from broker fill. No broker order was submitted.`,
      );
      setIsSaving(false);
      return;
    }

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
    void markRecommendationSnapshotTaken(
      {
        recommendation_id: selectedRecommendation.id,
        linked_position_id: null,
        taken_at: new Date().toISOString(),
      },
      { supabaseClient: supabase },
    );

    if (brokerFill) {
      logLiveDayTradeCreatedAfterBrokerConfirmation(
        selectedRecommendation,
        brokerFill,
      );
      logBrokerOrderPreviewCaptured(selectedRecommendation, brokerFill);
      logTradePlanningSnapshotCapturedEvent(
        selectedRecommendation,
        brokerFill.tradePlanningSnapshot,
        {
          handoffSessionId: brokerFill.handoffSessionId,
          payloadId: brokerFill.payloadId,
          payloadFingerprint: brokerFill.payloadFingerprint,
        },
      );
    }

    setSelectedRecommendation(null);
    setSelectedTradeValidationStatus(null);
    setSelectedTradeValidation(null);
    setSelectedTradeValidationMessage("");
    setActiveTab("Live Day Trades");
    await loadTradeData();
    setIsSaving(false);
  }

  async function submitClosePosition(
    event: FormEvent<HTMLFormElement>,
    brokerExitConfirmation?: BrokerExitConfirmation,
  ) {
    event.preventDefault();

    if (!selectedPosition) {
      return;
    }

    const entryPriceValue = parseNumber(selectedPosition.entryPrice);
    const positionSizeValue = parseNumber(selectedPosition.positionSize);
    const currentStopValue = parseNumber(selectedPosition.stopLoss);
    const confirmationValidation = brokerExitConfirmation
      ? validateBrokerExitConfirmation(brokerExitConfirmation, positionSizeValue)
      : {
          can_close_trade: false,
          message: "Broker exit confirmation is required before closing.",
          warnings: [],
        };
    const actualExitPrice =
      brokerExitConfirmation?.actual_exit_price ?? Number(exitPrice);

    if (!confirmationValidation.can_close_trade) {
      setMessage(confirmationValidation.message);
      return;
    }

    if (!Number.isFinite(actualExitPrice) || actualExitPrice <= 0) {
      setMessage("Exit price must be a number.");
      return;
    }

    if (entryPriceValue === null || positionSizeValue === null) {
      setMessage("Entry price and position size must be valid before closing.");
      return;
    }

    const riskPerShare =
      currentStopValue === null ? null : entryPriceValue - currentStopValue;
    const notes = exitNotes.trim() || null;
    const currentExitFill = brokerExitConfirmation
      ? normalizeExitFill({
          fillId: brokerExitConfirmation.sell_payload_id
            ? `exit_${brokerExitConfirmation.sell_payload_id}`
            : null,
          status: brokerExitConfirmation.exit_status,
          price: brokerExitConfirmation.actual_exit_price,
          shares: brokerExitConfirmation.actual_sold_shares,
          filledAt: brokerExitConfirmation.broker_confirmed_at,
          referenceNote: brokerExitConfirmation.broker_reference_note,
          commission: brokerExitConfirmation.exit_commission,
          fxFee: brokerExitConfirmation.exit_fx_fee,
        })
      : null;
    const existingExitFills = selectedPosition.executionMetadata?.exit_fills ?? [];
    const nextExitFills = currentExitFill
      ? [
          ...existingExitFills.filter(
            (fill) => fill.fill_id !== currentExitFill.fill_id,
          ),
          currentExitFill,
        ]
      : existingExitFills;
    const partialAccounting = buildPartialPositionState({
      entryFills: selectedPosition.executionMetadata?.entry_fills ?? [],
      exitFills: nextExitFills,
      fallbackEntryPrice:
        selectedPosition.executionMetadata?.actual_fill_price ?? entryPriceValue,
      fallbackEntryShares:
        selectedPosition.executionMetadata?.actual_entry_shares ??
        selectedPosition.executionMetadata?.actual_shares ??
        positionSizeValue,
      plannedShares:
        selectedPosition.executionMetadata?.planned_quantity ??
        selectedPosition.executionMetadata?.planned_shares ??
        positionSizeValue,
    });
    const partialState = partialAccounting.state;

    if (partialAccounting.blockers.length > 0) {
      setMessage(partialAccounting.blockers[0]?.message ?? "Partial accounting is invalid.");
      return;
    }

    const isPartialClose =
      partialState.status === "partially_closed" &&
      partialState.remaining_shares !== null &&
      partialState.remaining_shares > 0;
    const pnl =
      partialState.realized_pnl_from_exits ??
      (actualExitPrice - entryPriceValue) * positionSizeValue;
    const pnlPercent =
      entryPriceValue !== 0
        ? (pnl / (entryPriceValue * (partialState.entry_shares ?? positionSizeValue))) *
          100
        : 0;
    const rMultiple =
      riskPerShare !== null && riskPerShare > 0
        ? pnl / (riskPerShare * (partialState.entry_shares ?? positionSizeValue))
        : null;

    setIsSaving(true);
    setMessage("");

    const closedAt = new Date().toISOString();
    const exitMetadata = brokerExitConfirmation
      ? {
          ...(selectedPosition.executionMetadata ?? {}),
          broker_exit_confirmation: brokerExitConfirmation,
          entry_fills: partialState.entry_fills,
          exit_fills: partialState.exit_fills,
          planned_quantity:
            selectedPosition.executionMetadata?.planned_quantity ??
            selectedPosition.executionMetadata?.planned_shares ??
            positionSizeValue,
          actual_entry_shares:
            selectedPosition.executionMetadata?.actual_entry_shares ??
            partialState.entry_shares,
          remaining_shares: partialState.remaining_shares,
          partial_position_status: partialState.status,
          average_exit_price: partialState.average_exit_price,
          realized_pnl_from_exits: partialState.realized_pnl_from_exits,
        }
      : selectedPosition.executionMetadata;

    if (isPartialClose && partialState.remaining_shares !== null) {
      if (isDemoPosition(selectedPosition)) {
        const updatedDemoPosition: ActivePosition = {
          ...selectedPosition,
          positionSize: formatShares(partialState.remaining_shares),
          positionSizeValue: partialState.remaining_shares,
          executionMetadata: exitMetadata
            ? (exitMetadata as BrokerExecutionMetadata)
            : selectedPosition.executionMetadata,
        };
        const nextDemoActivePositions = [
          updatedDemoPosition,
          ...readDemoActivePositions().filter(
            (position) => position.id !== selectedPosition.id,
          ),
        ];

        writeDemoActivePositions(nextDemoActivePositions);
        writeDemoLastAction("Demo partial exit recorded; position remains open.");

        if (brokerExitConfirmation) {
          logBrokerExitConfirmationEvent(
            "broker_exit_fill_captured",
            selectedPosition,
            brokerExitConfirmation,
          );
        }

        setActivePositions((currentPositions) =>
          currentPositions.map((position) =>
            position.id === selectedPosition.id ? updatedDemoPosition : position,
          ),
        );
        setLatestPositionUpdates((currentUpdates) => ({
          ...currentUpdates,
          [updatedDemoPosition.id]: buildDemoLatestPositionUpdate(
            updatedDemoPosition,
          ),
        }));
        setLastDemoAction("Demo partial exit recorded; position remains open.");
        setSelectedPosition(null);
        setActiveTab("Live Day Trades");
        setMessage(
          `${selectedPosition.ticker} partial exit recorded locally. ${formatShares(
            partialState.remaining_shares,
          )} shares remain open.`,
        );
        setIsSaving(false);
        return;
      }

      let { error: partialUpdateError } = await supabase
        .from("positions")
        .update({
          status: "open",
          position_size: partialState.remaining_shares,
          ...(exitMetadata ? { execution_metadata: exitMetadata } : {}),
        })
        .eq("id", selectedPosition.id);

      if (
        partialUpdateError &&
        isMissingExecutionMetadataColumn(partialUpdateError)
      ) {
        const fallbackResult = await supabase
          .from("positions")
          .update({
            status: "open",
            position_size: partialState.remaining_shares,
          })
          .eq("id", selectedPosition.id);
        partialUpdateError = fallbackResult.error;
      }

      if (partialUpdateError) {
        setMessage(partialUpdateError.message);
        setIsSaving(false);
        return;
      }

      if (brokerExitConfirmation) {
        logBrokerExitConfirmationEvent(
          "broker_exit_fill_captured",
          selectedPosition,
          brokerExitConfirmation,
        );
      }

      setSelectedPosition(null);
      setActiveTab("Live Day Trades");
      await loadTradeData();
      setMessage(
        `${selectedPosition.ticker} partial exit recorded. ${formatShares(
          partialState.remaining_shares,
        )} shares remain open.`,
      );
      setIsSaving(false);
      return;
    }

    const updatePayload = {
      status: "closed",
      exit_price: actualExitPrice,
      closed_at: closedAt,
      pnl,
      pnl_percent: pnlPercent,
      r_multiple: rMultiple,
      exit_notes: notes,
      ...(exitMetadata ? { execution_metadata: exitMetadata } : {}),
    };

    if (isDemoPosition(selectedPosition)) {
      const demoClosedPosition: ClosedPosition = {
        ...selectedPosition,
        setupType: normalizeSetupType(selectedPosition.executionMetadata?.setup_type),
        exitPrice: money(actualExitPrice),
        pnl: formatPnl(pnl),
        pnlPercent: formatPercent(pnlPercent),
        rMultiple: formatRMultiple(rMultiple),
        closedAt: formatDate(closedAt),
        closedAtRaw: closedAt,
        exitNotes: notes ?? "",
        pnlValue: pnl,
        rMultipleValue: rMultiple,
        executionMetadata: exitMetadata
          ? (exitMetadata as BrokerExecutionMetadata)
          : null,
      };
      const nextDemoActivePositions = readDemoActivePositions().filter(
        (position) => position.id !== selectedPosition.id,
      );
      const nextDemoClosedPositions = [
        demoClosedPosition,
        ...readDemoClosedPositions().filter(
          (position) => position.id !== selectedPosition.id,
        ),
      ];

      writeDemoActivePositions(nextDemoActivePositions);
      writeDemoClosedPositions(nextDemoClosedPositions);
      writeDemoLastAction("Demo trade closed into History.");
      logTradeClosedEvent({
        position: selectedPosition,
        closedAt,
        pnl,
        rMultiple,
      });

      if (brokerExitConfirmation) {
        logBrokerExitConfirmationEvent(
          "broker_exit_fill_captured",
          selectedPosition,
          brokerExitConfirmation,
        );
        logBrokerExitConfirmationEvent(
          "live_day_trade_closed_after_broker_exit_confirmation",
          selectedPosition,
          brokerExitConfirmation,
        );
      }

      setActivePositions((currentPositions) =>
        currentPositions.filter((position) => position.id !== selectedPosition.id),
      );
      setClosedPositions((currentPositions) => [
        demoClosedPosition,
        ...currentPositions.filter(
          (position) => position.id !== selectedPosition.id,
        ),
      ]);
      setLatestPositionUpdates((currentUpdates) => {
        const nextUpdates = { ...currentUpdates };
        delete nextUpdates[selectedPosition.id];
        return nextUpdates;
      });
      setLastDemoAction("Demo trade closed into History.");
      setSelectedPosition(null);
      setActiveTab("History");
      setMessage(
        confirmationValidation.warnings.length > 0
          ? `${selectedPosition.ticker} demo trade closed locally from broker exit fill. ${confirmationValidation.warnings[0]}`
          : `${selectedPosition.ticker} demo trade closed locally from broker exit fill.`,
      );
      setIsSaving(false);
      return;
    }

    let { error } = await supabase
      .from("positions")
      .update(updatePayload)
      .eq("id", selectedPosition.id);

    if (error && isMissingExecutionMetadataColumn(error)) {
      const fallbackResult = await supabase
        .from("positions")
        .update({
          status: updatePayload.status,
          exit_price: updatePayload.exit_price,
          closed_at: updatePayload.closed_at,
          pnl: updatePayload.pnl,
          pnl_percent: updatePayload.pnl_percent,
          r_multiple: updatePayload.r_multiple,
          exit_notes: updatePayload.exit_notes,
        })
        .eq("id", selectedPosition.id);
      error = fallbackResult.error;
    }

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
    if (brokerExitConfirmation) {
      logBrokerExitConfirmationEvent(
        "broker_exit_fill_captured",
        selectedPosition,
        brokerExitConfirmation,
      );
      logBrokerExitConfirmationEvent(
        "live_day_trade_closed_after_broker_exit_confirmation",
        selectedPosition,
        brokerExitConfirmation,
      );
    }

    setSelectedPosition(null);
    setActiveTab("History");
    await loadTradeData();
    setMessage(
      confirmationValidation.warnings.length > 0
        ? `${selectedPosition.ticker} closed from broker exit fill. ${confirmationValidation.warnings[0]}`
        : `${selectedPosition.ticker} closed from broker exit fill.`,
    );
    setIsSaving(false);
  }

  const dailyRecommendations = recommendations.filter(
    (recommendation) =>
      !recommendation.archived &&
      !historyStatuses.includes(recommendation.status) &&
      !isRecommendationExpired(toFreshnessInput(recommendation)),
  );
  const demoRecommendationCount = recommendations.filter(isDemoRecommendation).length;
  const demoActivePositionCount = activePositions.filter(isDemoPosition).length;
  const demoClosedPositionCount = closedPositions.filter(isDemoPosition).length;
  const hasDevPreviewRecommendations = recommendations.some((recommendation) =>
    recommendation.id.startsWith("dev-preview-recommendation-"),
  );
  const showDevPreviewPositiveAlert =
    shouldUseDevPreviewData && hasDevPreviewRecommendations;
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
  const currentMarketSessionEvaluation = buildMarketSessionEvaluation({
    now: currentTime,
    marketStatus,
  });
  const recommendationIntakeQualityResults = dailyRecommendations.map(
    (recommendation) =>
      buildRecommendationIntakeQualityResult({
        recommendation_id: recommendation.id,
        ticker: recommendation.ticker,
        company_name: recommendation.companyName,
        entry_price: getRecommendationEntryFallback(recommendation),
        entry_low: recommendation.entryLowValue,
        entry_high: recommendation.entryHighValue,
        stop_price: recommendation.stopLossValue,
        target_price: getPrimaryTargetPrice(recommendation),
        current_price: recommendation.intradayIndicators?.latestPrice ?? null,
        confidence_score: recommendation.confidenceScore,
        setup_type: recommendation.setupType,
        reason_text: [
          recommendation.thesis,
          recommendation.confidenceReasoning,
          recommendation.invalidation,
          recommendation.reasonToAvoid,
        ]
          .filter(Boolean)
          .join(" "),
        generated_at: recommendation.createdAtRaw,
        market_data_timestamp: null,
        latest_volume: recommendation.intradayIndicators?.latestVolume ?? null,
        average_volume: recommendation.intradayIndicators?.averageVolume ?? null,
        market_session: {
          phase: currentMarketSessionEvaluation.phase,
          risk_level: currentMarketSessionEvaluation.risk_level,
          source: currentMarketSessionEvaluation.source,
          is_market_open: currentMarketSessionEvaluation.market_is_open,
        },
        existing_recommendations: dailyRecommendations.map((item) => ({
          id: item.id,
          ticker: item.ticker,
          setup_type: item.setupType,
          status: item.status,
          archived: item.archived,
        })),
        risk_controls: {
          enabled: riskControlsSettings.enabled,
          mode: riskControlsSettings.mode,
          allowed_tickers: riskControlsSettings.allowed_tickers,
          blocked_tickers: riskControlsSettings.blocked_tickers,
        },
        now: currentTime,
      }),
  );
  const marketCloseWarning = getMarketCloseWarning(marketStatus, currentTime);
  const topMarketStatus = getTopMarketStatus(marketStatus, currentTime);
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
  const livePositionItems = activePositions
    .map((position, index) => {
      const latestUpdate = latestPositionUpdates[position.id];
      const unrealizedPnl = calculateUnrealizedPnl({
        entryPrice: position.entryPriceValue,
        currentPrice: latestUpdate?.currentPriceValue ?? null,
        shares: position.positionSizeValue,
        direction: position.direction,
      });

      return {
        index,
        position,
        latestUpdate,
        action: latestUpdate?.action || "NO_ACTION",
        unrealizedPnl: unrealizedPnl.pnl ?? Number.NEGATIVE_INFINITY,
      };
    })
    .sort((first, second) => {
      if (second.unrealizedPnl !== first.unrealizedPnl) {
        return second.unrealizedPnl - first.unrealizedPnl;
      }

      return first.index - second.index;
    });
  const takeProfitLivePositionItems = livePositionItems.filter(
    (item) => isTakeProfitAction(item.action),
  );
  const otherLivePositionItems = livePositionItems.filter(
    (item) => !isTakeProfitAction(item.action),
  );
  const statisticsDashboard = buildStatisticsDashboard({
    closedTrades: closedPositions.map((position) => ({
      id: position.id,
      ticker: position.ticker,
      companyName: position.companyName,
      setupType: position.setupType,
      entryPrice: position.entryPriceValue,
      exitPrice:
        position.executionMetadata?.average_exit_price ?? parseNumber(position.exitPrice),
      shares: position.positionSizeValue,
      pnl: position.pnlValue,
      rMultiple: position.rMultipleValue,
      closedAt: position.closedAtRaw,
      openedAt: position.openedAtRaw,
      closeReason: position.exitNotes,
      isDemo: isDemoPosition(position),
      executionMetadata: position.executionMetadata,
      partialPositionStatus:
        position.executionMetadata?.partial_position_status ?? null,
      remainingShares: position.executionMetadata?.remaining_shares ?? null,
      averageExitPrice: position.executionMetadata?.average_exit_price ?? null,
      realizedPnlFromExits:
        position.executionMetadata?.realized_pnl_from_exits ?? null,
      exitFillsCount: position.executionMetadata?.exit_fills?.length ?? null,
    })),
    openPositions: activePositions.map((position) => {
      const latestUpdate = latestPositionUpdates[position.id];
      const unrealizedPnl = calculateUnrealizedPnl({
        entryPrice: position.entryPriceValue,
        currentPrice: latestUpdate?.currentPriceValue ?? null,
        shares: position.positionSizeValue,
        direction: position.direction,
      });

      return {
        id: position.id,
        ticker: position.ticker,
        unrealizedPnl: unrealizedPnl.pnl,
        lastUpdatedAt: latestUpdate?.updatedAtRaw ?? position.openedAtRaw,
        openedAt: position.openedAtRaw,
        partialPositionStatus:
          position.executionMetadata?.partial_position_status ?? null,
        remainingShares: position.executionMetadata?.remaining_shares ?? null,
        realizedPnlFromExits:
          position.executionMetadata?.realized_pnl_from_exits ?? null,
        isDemo: isDemoPosition(position),
      };
    }),
    range: selectedStatisticsRange,
    now: currentTime,
  });
  const historyDashboard = buildHistoryDashboard({
    trades: closedPositions.map((position) => ({
      id: position.id,
      ticker: position.ticker,
      companyName: position.companyName,
      setupType: position.setupType,
      direction: position.direction,
      entryPrice: position.entryPriceValue,
      exitPrice:
        position.executionMetadata?.average_exit_price ?? parseNumber(position.exitPrice),
      shares: position.positionSizeValue,
      pnl: position.pnlValue,
      rMultiple: position.rMultipleValue,
      openedAt: position.openedAtRaw,
      closedAt: position.closedAtRaw,
      closeReason: position.exitNotes,
      isDemo: isDemoPosition(position),
      executionMetadata: position.executionMetadata,
    })),
    filters: {
      outcome: historyOutcomeFilter,
      demo: historyDemoFilter,
      partial: historyPartialFilter,
      sort: historySortMode,
    },
  });
  const historyPositionById = new Map(
    closedPositions.map((position) => [position.id, position]),
  );
  const dailySessionDate =
    marketStatus?.date ?? currentMarketSessionEvaluation.ny_date;
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
  const recommendationsLastUpdatedAt = getLatestIsoTimestamp([
    ...dailyRecommendations.map((recommendation) => recommendation.createdAtRaw),
    ...dailyScanLogs.map((scanLog) => scanLog.created_at),
  ]);
  const scanPipelineObservabilitySummary =
    buildScanPipelineObservabilitySummary({
      visible_recommendations: dailyRecommendations.map((recommendation) => ({
        id: recommendation.id,
        ticker: recommendation.ticker,
        created_at: recommendation.createdAtRaw,
        status: recommendation.status,
        archived: recommendation.archived,
        is_demo: isDemoRecommendation(recommendation),
      })),
      intake_results: recommendationIntakeQualityResults,
      scan_logs: dailyScanLogs,
      market_session: {
        phase: currentMarketSessionEvaluation.phase,
        risk_level: currentMarketSessionEvaluation.risk_level,
        source: currentMarketSessionEvaluation.source,
      },
      latest_recommendation_at: recommendationsLastUpdatedAt,
      now: currentTime,
    });
  const recommendationEmptyStateSummary =
    buildRecommendationEmptyStateSummary({
      visible_recommendations: dailyRecommendations.map((recommendation) => ({
        id: recommendation.id,
        ticker: recommendation.ticker,
        is_demo: isDemoRecommendation(recommendation),
      })),
      intake_results: recommendationIntakeQualityResults,
      observability_summary: scanPipelineObservabilitySummary,
      market_session: {
        phase: currentMarketSessionEvaluation.phase,
        risk_level: currentMarketSessionEvaluation.risk_level,
        market_is_open: currentMarketSessionEvaluation.market_is_open,
        next_recommended_action:
          currentMarketSessionEvaluation.next_recommended_action,
      },
      risk_controls: {
        enabled: riskControlsSettings.enabled,
        mode: riskControlsSettings.mode,
        blocked_tickers: riskControlsSettings.blocked_tickers,
        allowed_tickers: riskControlsSettings.allowed_tickers,
      },
      demo_mode: demoTradingFlowEnabled,
      has_refresh_control: true,
      now: currentTime,
    });
  const activePositionsWithStaleUpdates = activePositions.filter(
    (position) =>
      getStalePositionStatus(
        latestPositionUpdates[position.id],
        topMarketStatus === "open",
      ) !== "fresh",
  ).length;
  const closedPositionsWithMockSource = closedPositions.filter((position) => {
    const reference = [
      position.executionMetadata?.broker_reference_note,
      position.executionMetadata?.broker_exit_confirmation?.broker_reference_note,
      position.exitNotes,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return reference.includes("mock");
  }).length;
  const dataModeClaritySummary = buildDataModeClaritySummary({
    environment: process.env.NODE_ENV,
    demo_mode_enabled: demoTradingFlowEnabled,
    recommendations: {
      total: dailyRecommendations.length,
      demo: dailyRecommendations.filter(isDemoRecommendation).length,
      expired: recommendations.filter((recommendation) =>
        isRecommendationExpired(toFreshnessInput(recommendation)),
      ).length,
      stale: scanPipelineObservabilitySummary.stale_candidate_count,
    },
    scan_observability: {
      status: scanPipelineObservabilitySummary.status,
      data_age_minutes:
        scanPipelineObservabilitySummary.run_context.data_age_minutes,
      unknown_metrics: scanPipelineObservabilitySummary.unknown_metrics,
    },
    active_positions: {
      total: activePositions.length,
      demo: activePositions.filter(isDemoPosition).length,
      stale_updates: activePositionsWithStaleUpdates,
      with_broker_metadata: activePositions.filter(
        (position) => position.executionMetadata !== null,
      ).length,
    },
    closed_positions: {
      total: closedPositions.length,
      demo: closedPositions.filter(isDemoPosition).length,
      with_broker_metadata: closedPositions.filter(
        (position) => position.executionMetadata !== null,
      ).length,
      mock_broker_records: closedPositionsWithMockSource,
    },
    future_agent_packages: {
      available: true,
      count: dailyRecommendations.length + activePositions.length,
    },
    mock_broker_tools_enabled: demoTradingFlowEnabled,
    supabase_connected: true,
    now: currentTime,
  });
  function buildLiveTestReadinessSummaryForMode(mode: LiveTestReadinessMode) {
    return buildLiveTestReadinessSummary({
      mode,
      data_mode_clarity: dataModeClaritySummary,
      scan_observability: scanPipelineObservabilitySummary,
      intake_results: recommendationIntakeQualityResults,
      empty_state_summary: recommendationEmptyStateSummary,
      risk_controls: riskControlsSettings,
      market_session: currentMarketSessionEvaluation,
      position_sizing: {
        account_size:
          riskControlsSettings.account_size ?? userSettings?.portfolioSize ?? null,
        default_risk_amount: riskControlsSettings.default_risk_amount_per_trade,
        default_risk_percent: riskControlsSettings.default_risk_percent_per_trade,
        max_position_value: riskControlsSettings.max_position_value,
        mode: riskControlsSettings.position_sizing_mode,
      },
      open_positions: {
        count: activePositions.length,
        demo_count: activePositions.filter(isDemoPosition).length,
      },
      closed_trades_today_count: dailyClosedPositions.length,
      execution_safety: {
        broker_automation_enabled: false,
        browser_control_enabled: false,
        avanza_automation_enabled: false,
        credential_handling_enabled: false,
        order_submission_enabled: false,
        automatic_trade_create_or_close_enabled: false,
        human_confirmation_required: true,
        agent_packages_read_only: true,
      },
      now: currentTime,
    });
  }

  const liveTestReadinessSummary =
    buildLiveTestReadinessSummaryForMode(liveTestReadinessMode);
  const paperProtocolReadinessMode: LiveTestReadinessMode =
    paperSessionProtocolState.selected_mode === "demo_rehearsal"
      ? "demo_rehearsal"
      : "real_market_paper";
  const paperProtocolLiveTestReadinessSummary =
    buildLiveTestReadinessSummaryForMode(paperProtocolReadinessMode);
  const paperSessionProtocolSummary = buildPaperSessionProtocolSummary({
    mode: paperSessionProtocolState.selected_mode,
    protocol_state: paperSessionProtocolState,
    live_test_readiness: paperProtocolLiveTestReadinessSummary,
    data_mode_clarity: dataModeClaritySummary,
    scan_observability: scanPipelineObservabilitySummary,
    intake_results: recommendationIntakeQualityResults,
    empty_state_summary: recommendationEmptyStateSummary,
    market_session: currentMarketSessionEvaluation,
    risk_controls: riskControlsSettings,
    live_positions_count: activePositions.length,
    closed_trades_today_count: dailyClosedPositions.length,
    mock_broker_available: demoTradingFlowEnabled,
    demo_mode_enabled: demoTradingFlowEnabled,
    now: currentTime,
  });

  function updatePaperSessionMode(mode: PaperSessionProtocolMode) {
    setPaperSessionProtocolState((current) => ({
      ...current,
      selected_mode: mode,
    }));

    if (mode === "demo_rehearsal") {
      setLiveTestReadinessMode("demo_rehearsal");
    } else if (mode === "real_market_paper") {
      setLiveTestReadinessMode("real_market_paper");
    }
  }

  function startPaperSessionProtocol() {
    const startedAt = new Date().toISOString();

    setPaperSessionProtocolState((current) => ({
      ...current,
      session_started_at: current.session_started_at ?? startedAt,
      session_ended_at: null,
      session_outcome: "not_set",
    }));
  }

  function updatePaperSessionStep(stepId: string, checked: boolean) {
    setPaperSessionProtocolState((current) => {
      const next = new Set(current.completed_step_ids);

      if (checked) {
        next.add(stepId);
      } else {
        next.delete(stepId);
      }

      return {
        ...current,
        completed_step_ids: Array.from(next),
      };
    });
  }

  function updatePaperSessionOutcome(outcome: PaperSessionProtocolOutcome) {
    setPaperSessionProtocolState((current) => ({
      ...current,
      session_outcome: outcome,
    }));
  }

  function updatePaperSessionNotes(notes: string) {
    setPaperSessionProtocolState((current) => ({
      ...current,
      notes: notes.slice(0, 2000),
    }));
  }

  function endPaperSessionProtocol() {
    setPaperSessionProtocolState((current) => ({
      ...current,
      session_ended_at: current.session_ended_at ?? new Date().toISOString(),
      session_outcome:
        current.session_outcome === "not_set"
          ? paperSessionProtocolSummary.paper_trade_allowed_by_protocol
            ? "paper_trade_completed"
            : "no_trade_valid"
          : current.session_outcome,
    }));
  }

  function resetPaperSessionProtocol() {
    setPaperSessionProtocolState((current) =>
      createDefaultPaperSessionProtocolState(current.selected_mode),
    );
  }
  const liveTradesLastUpdatedAt = getLatestIsoTimestamp([
    ...Object.values(latestPositionUpdates).map((update) => update.updatedAtRaw),
    lastAutoRefreshAt,
    ...activePositions.map((position) => position.openedAtRaw),
  ]);
  const statisticsLastUpdatedAt = getLatestIsoTimestamp([
    ...closedPositions.map((position) => position.closedAtRaw),
    ...recommendations.map(
      (recommendation) =>
        recommendation.discardReviewedAtRaw ??
        recommendation.discardedAtRaw ??
        recommendation.createdAtRaw,
    ),
    ...Object.values(latestPositionUpdates).map((update) => update.updatedAtRaw),
    ...scanLogs.map((scanLog) => scanLog.created_at),
  ]);
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
  const dailyRealizedR =
    dailyTotalRValues.length > 0
      ? dailyTotalRValues.reduce((sum, value) => sum + value, 0)
      : null;
  const dailyRealizedPnl =
    dailyTotalPnlValues.length > 0
      ? dailyTotalPnlValues.reduce((sum, value) => sum + value, 0)
      : null;
  const lastLossClosedAt =
    dailyClosedPositions.find((position) => (position.pnlValue ?? 0) < 0)
      ?.closedAtRaw ?? null;
  const dailySessionQualityScore = buildSessionQualityScoreForDaily({
    closedTrades: dailyClosedPositions,
    liveTradesCount: activePositions.length,
    scanLogs: dailyScanLogs,
    guardrails: calibrationGuardrailSummary.guardrails,
    eodSafetyStatuses: Object.values(eodSafetyStatusesByPositionId),
    localEvents: localTradeManagementEvents,
    sessionCoach: dailySessionCoach,
    cooldownAdvisory: dailyCooldownAdvisory,
    totalR: dailyRealizedR,
    totalPnl: dailyRealizedPnl,
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
  const recommendationIntakeQualityById = new Map(
    recommendationIntakeQualityResults.map((result) => [
      result.recommendation_id,
      result,
    ]),
  );
  const latestScanRunId =
    dailyScanLogs[0]?.id === null || dailyScanLogs[0]?.id === undefined
      ? null
      : String(dailyScanLogs[0].id);
  const visibleRecommendationSnapshots = dailyRecommendations.map(
    (recommendation) =>
      buildRecommendationSnapshot(
        buildVisibleRecommendationSnapshotInput({
          recommendation,
          now: currentTime,
          currentScanWindow: currentIntradayScanWindow,
          scanRunId: latestScanRunId,
          marketSession: {
            phase: currentMarketSessionEvaluation.phase,
            risk_level: currentMarketSessionEvaluation.risk_level,
            source: currentMarketSessionEvaluation.source,
          },
          dataModeClaritySummary,
          intakeQuality:
            recommendationIntakeQualityById.get(recommendation.id) ?? null,
          scanObservability: scanPipelineObservabilitySummary,
          emptyState: recommendationEmptyStateSummary,
          riskControls: riskControlsSettings,
          preTradeRiskContext:
            preTradeRiskContextByRecommendationId.get(recommendation.id) ?? null,
          tradeEligibility:
            tradeEligibilityByRecommendationId.get(recommendation.id) ?? null,
          decisionStack:
            recommendationDecisionStackByRecommendationId.get(recommendation.id) ??
            null,
          positionSizing: calculatePositionSizing(recommendation, userSettings),
        }),
      ),
  );
  const visibleRecommendationSnapshotsJson = recommendationSnapshotsJson(
    visibleRecommendationSnapshots,
  );
  const visibleRecommendationOutcomes = visibleRecommendationSnapshots.map(
    (snapshot) =>
      computeRecommendationOutcome({
        snapshot,
        horizon: "unknown",
        evaluated_at: currentTime,
        source: "snapshot_only",
        provider: null,
        data_completeness: "none",
      }).outcome,
  );
  const visibleRecommendationOutcomesJson = recommendationOutcomesJson(
    visibleRecommendationOutcomes,
  );
  const recommendationPerformanceSnapshots = Array.from(
    new Map(
      [...storedRecommendationSnapshots, ...visibleRecommendationSnapshots].map(
        (snapshot) => [snapshot.snapshot_fingerprint, snapshot],
      ),
    ).values(),
  );
  const recommendationPerformanceOutcomes = Array.from(
    new Map(
      [...storedRecommendationOutcomes, ...visibleRecommendationOutcomes].map(
        (outcome) => [`${outcome.snapshot_fingerprint}:${outcome.horizon}`, outcome],
      ),
    ).values(),
  );
  const recommendationPerformanceStatistics =
    buildRecommendationPerformanceStatistics({
      snapshots: recommendationPerformanceSnapshots,
      outcomes: recommendationPerformanceOutcomes,
      range: selectedStatisticsRange,
      now: currentTime,
      source_scope:
        storedRecommendationSnapshots.length > 0 ||
        storedRecommendationOutcomes.length > 0
          ? "mixed"
          : "current_visible",
    });
  const recommendationPerformanceStatisticsJsonText =
    recommendationPerformanceStatisticsJson(recommendationPerformanceStatistics);
  const recommendationOutcomeEvaluationRunJsonText =
    recommendationOutcomeEvaluationRun === null
      ? JSON.stringify(
          {
            status: recommendationOutcomeEvaluationDiagnostics.status,
            summary: recommendationOutcomeEvaluationDiagnostics.summary,
            eligible_snapshot_count:
              recommendationOutcomeEvaluationDiagnostics.eligibleSnapshots,
            evaluated_snapshot_count:
              recommendationOutcomeEvaluationDiagnostics.evaluatedSnapshots,
            missing_candle_count:
              recommendationOutcomeEvaluationDiagnostics.incompleteDueToMissingCandles,
            provider_error_count:
              recommendationOutcomeEvaluationDiagnostics.providerErrors,
            horizons:
              recommendationOutcomeEvaluationDiagnostics.horizonsEvaluated,
            completed_at:
              recommendationOutcomeEvaluationDiagnostics.lastRunTimestamp,
          },
          null,
          2,
        )
      : recommendationOutcomeEvaluationRunJson(recommendationOutcomeEvaluationRun);

  useEffect(() => {
    if (isLoading || visibleRecommendationSnapshots.length === 0) {
      return;
    }

    const pendingSnapshots = visibleRecommendationSnapshots.filter((snapshot) => {
      if (
        persistedRecommendationSnapshotFingerprintsRef.current.has(
          snapshot.snapshot_fingerprint,
        )
      ) {
        return false;
      }

      persistedRecommendationSnapshotFingerprintsRef.current.add(
        snapshot.snapshot_fingerprint,
      );
      return true;
    });

    if (pendingSnapshots.length === 0) {
      return;
    }

    let isCancelled = false;

    async function persistVisibleSnapshots() {
      let savedCount = 0;
      let duplicateCount = 0;
      let failedCount = 0;
      let lastResult: RecommendationSnapshotPersistenceResult | null = null;

      for (const snapshot of pendingSnapshots) {
        const result = await persistRecommendationSnapshot(snapshot, {
          supabaseClient: supabase,
        });
        lastResult = result;

        if (result.status === "saved") {
          savedCount += 1;
        } else if (result.status === "duplicate") {
          duplicateCount += 1;
        } else {
          failedCount += 1;
        }
      }

      if (isCancelled) {
        return;
      }

      const storedSnapshots = readRecommendationSnapshotsFromLocalStorage();
      const today = getNewYorkDateString(currentTime);
      const localSnapshotsStoredToday = storedSnapshots.filter(
        (snapshot) => getNewYorkDateFromIso(snapshot.created_at) === today,
      ).length;
      const lastSnapshotTimestamp =
        pendingSnapshots[pendingSnapshots.length - 1]?.created_at ?? null;

      setStoredRecommendationSnapshots(storedSnapshots);
      setRecommendationSnapshotDiagnostics((current) => ({
        snapshotsStoredToday: Math.max(
          localSnapshotsStoredToday,
          current.snapshotsStoredToday + savedCount,
        ),
        lastSnapshotTimestamp:
          lastSnapshotTimestamp ?? current.lastSnapshotTimestamp,
        duplicateSkippedCount: current.duplicateSkippedCount + duplicateCount,
        persistenceStatus:
          failedCount > 0 && savedCount === 0
            ? "failed"
            : lastResult?.status ?? current.persistenceStatus,
        persistenceMode: lastResult?.mode ?? current.persistenceMode,
        lastError: lastResult?.error ?? null,
      }));
    }

    void persistVisibleSnapshots();

    return () => {
      isCancelled = true;
    };
  }, [currentTime, isLoading, visibleRecommendationSnapshots]);

  useEffect(() => {
    if (isLoading || visibleRecommendationOutcomes.length === 0) {
      return;
    }

    const pendingOutcomes = visibleRecommendationOutcomes.filter((outcome) => {
      if (persistedRecommendationOutcomeIdsRef.current.has(outcome.id)) {
        return false;
      }

      persistedRecommendationOutcomeIdsRef.current.add(outcome.id);
      return true;
    });

    if (pendingOutcomes.length === 0) {
      return;
    }

    let isCancelled = false;

    async function persistVisibleOutcomes() {
      let lastResult: RecommendationOutcomePersistenceResult | null = null;

      for (const outcome of pendingOutcomes) {
        lastResult = await persistRecommendationOutcome(outcome, {
          supabaseClient: supabase,
        });
      }

      if (isCancelled) {
        return;
      }

      const storedOutcomes = readRecommendationOutcomesFromLocalStorage();
      setStoredRecommendationOutcomes(storedOutcomes);
      const diagnosticsOutcomes =
        storedOutcomes.length > 0 ? storedOutcomes : visibleRecommendationOutcomes;
      const completedStatuses = new Set([
        "entry_not_triggered",
        "target_hit",
        "stop_hit",
        "target_before_stop",
        "stop_before_target",
        "neither_hit",
        "expired",
      ]);
      const lastOutcomeEvaluationTimestamp =
        pendingOutcomes[pendingOutcomes.length - 1]?.evaluated_at ?? null;

      setRecommendationOutcomeDiagnostics({
        trackedSnapshotsCount: new Set(
          diagnosticsOutcomes.map((outcome) => outcome.snapshot_fingerprint),
        ).size,
        pendingOutcomes: diagnosticsOutcomes.filter(
          (outcome) => outcome.status === "pending",
        ).length,
        completedOutcomes: diagnosticsOutcomes.filter((outcome) =>
          completedStatuses.has(outcome.status),
        ).length,
        incompleteOutcomes: diagnosticsOutcomes.filter(
          (outcome) =>
            outcome.status === "incomplete" || outcome.status === "invalid",
        ).length,
        unknownOutcomes: diagnosticsOutcomes.filter(
          (outcome) => outcome.status === "unknown",
        ).length,
        lastOutcomeEvaluationTimestamp,
        persistenceStatus: lastResult?.status ?? "idle",
        persistenceMode: lastResult?.mode ?? "unknown",
        lastError: lastResult?.error ?? null,
      });
    }

    void persistVisibleOutcomes();

    return () => {
      isCancelled = true;
    };
  }, [isLoading, visibleRecommendationOutcomes]);

  async function evaluateRecentRecommendationOutcomes() {
    if (isEvaluatingRecommendationOutcomes) {
      return;
    }

    setIsEvaluatingRecommendationOutcomes(true);
    setRecommendationOutcomeEvaluationDiagnostics((current) => ({
      ...current,
      status: "running",
      summary: "Evaluating recent recommendation outcomes with intraday candles.",
    }));

    try {
      const response = await fetch("/api/recommendations/evaluate-outcomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshots: visibleRecommendationSnapshots,
          existing_outcomes: [
            ...readRecommendationOutcomesFromLocalStorage(),
            ...visibleRecommendationOutcomes,
          ],
          horizons: ["15m", "30m", "60m"],
          max_snapshots: 6,
        }),
      });
      const run = (await response.json().catch(() => null)) as
        | RecommendationOutcomeEvaluationRun
        | null;

      if (!response.ok || !run) {
        throw new Error("Outcome evaluation runner returned an invalid response.");
      }

      for (const outcome of run.outcomes) {
        await persistRecommendationOutcome(outcome);
      }

      setStoredRecommendationOutcomes(readRecommendationOutcomesFromLocalStorage());
      writeRecommendationOutcomeEvaluationRunToLocalStorage(run);
      setRecommendationOutcomeEvaluationRun(run);
      setRecommendationOutcomeEvaluationDiagnostics({
        status: run.status,
        eligibleSnapshots: run.eligible_snapshot_count,
        evaluatedSnapshots: run.evaluated_snapshot_count,
        incompleteDueToMissingCandles: run.missing_candle_count,
        providerErrors: run.provider_error_count,
        lastRunTimestamp: run.completed_at ?? run.started_at,
        horizonsEvaluated: run.horizons,
        persistenceMode:
          run.candidates.find((candidate) => candidate.persistence_mode !== "unknown")
            ?.persistence_mode ?? "localStorage",
        snapshotOnly: run.evaluated_snapshot_count === 0,
        summary: run.summary,
      });
    } catch (error) {
      setRecommendationOutcomeEvaluationDiagnostics((current) => ({
        ...current,
        status: "failed",
        lastRunTimestamp: new Date().toISOString(),
        summary:
          error instanceof Error
            ? error.message
            : "Outcome evaluation failed.",
      }));
    } finally {
      setIsEvaluatingRecommendationOutcomes(false);
    }
  }

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
  const selectedRecommendationPositionSizing = selectedRecommendation
    ? calculatePositionSizing(selectedRecommendation, userSettings)
    : null;
  const selectedRecommendationRiskControlsEvaluation =
    selectedRecommendation && selectedRecommendationPositionSizing
      ? evaluateRiskControlsForNewTrade({
          settings: riskControlsSettings,
          ticker: selectedRecommendation.ticker,
          plannedRiskAmount: selectedRecommendationPositionSizing.maxLossAtStop,
          plannedRiskPercent: userSettings?.riskPerTradePercent ?? null,
          openPositionsCount: activePositions.length,
          closedTradesTodayCount: dailyClosedPositions.length,
          dailyRealizedPnl,
          dailyRealizedR,
          lastLossClosedAt,
          isDemo: isDemoRecommendation(selectedRecommendation),
          now: currentTime,
        })
      : null;
  const selectedPositionRiskControlsEvaluation = selectedPosition
    ? evaluateRiskControlsForLiveTrade({
        settings: riskControlsSettings,
        ticker: selectedPosition.ticker,
        openPositionsCount: activePositions.length,
        closedTradesTodayCount: dailyClosedPositions.length,
        dailyRealizedPnl,
        dailyRealizedR,
        currentUnrealizedPnl: calculateUnrealizedPnl({
          entryPrice: selectedPosition.entryPriceValue,
          currentPrice:
            latestPositionUpdates[selectedPosition.id]?.currentPriceValue ?? null,
          shares: selectedPosition.positionSizeValue,
          direction: selectedPosition.direction,
        }).pnl,
        currentR:
          latestPositionUpdates[selectedPosition.id]?.unrealizedRValue ??
          calculateCurrentR({
            entryPrice: selectedPosition.entryPriceValue,
            stopLoss: selectedPosition.stopLossValue,
            currentPrice:
              latestPositionUpdates[selectedPosition.id]?.currentPriceValue ?? null,
            direction: selectedPosition.direction,
          }),
        lastLossClosedAt,
        now: currentTime,
      })
    : null;

  return (
    <main className="trade-page">
      <header className="trade-topbar">
        <Link
          href="/"
          className="trade-topbar__logo"
          aria-label="Go to Trade Recommendations"
          onClick={() => setActiveTab("Recommendations")}
        >
          <Image
            src="/trade-assets/ture-logo.svg"
            alt="Trade"
            width={102}
            height={40}
          />
        </Link>
        <div className="trade-market-strip">
          <Image
            src="/trade-assets/us-market-flag.png"
            alt=""
            aria-hidden="true"
            width={26}
            height={26}
            className="trade-market-strip__flag"
          />
          <span>US stock market</span>
          <span
            className="trade-market-strip__dot"
            style={topMarketStatusDotStyle(topMarketStatus)}
          />
          <span>{topMarketStatusLabel(topMarketStatus)}</span>
        </div>
        <nav className="trade-secondary-nav" aria-label="Secondary navigation">
          {secondaryTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`trade-topbar-link ${
                activeTab === tab ? "trade-topbar-link--active" : ""
              }`}
            >
              {tab}
            </button>
          ))}
          <Link href="/settings" className="trade-topbar-link">
            Settings
          </Link>
        </nav>
      </header>

      <div className="trade-stage">
        <nav className="trade-primary-tabs" aria-label="Primary navigation">
          {primaryTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`trade-primary-tab ${
                activeTab === tab ? "trade-primary-tab--active" : ""
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeTab === "Recommendations" && (
          <section className="trade-recommendations-section">
            <TradePrimaryStatusbar
              updateLabel="Recommendations updated"
              updatedAt={recommendationsLastUpdatedAt}
              currentTime={currentTime}
              scanWindowLabel={currentIntradayScanWindowLabel}
              onRefresh={() => {
                if (isGenerateDisabled) {
                  void loadTradeData();
                  return;
                }

                void generateRecommendations(currentIntradayScanWindow);
              }}
              isRefreshing={generatingSessionType !== null || isLoading}
              isDisabled={isLoading || generatingSessionType !== null}
            />

            <DataModeClarityBanner
              summary={dataModeClaritySummary}
              surfaceIds={["recommendations", "add_trade_buy_handoff", "mock_broker_tools"]}
            />

            <LiveTestReadinessBanner summary={liveTestReadinessSummary} />

            <MarketSessionSummaryPanel
              evaluation={currentMarketSessionEvaluation}
              title="Market Session Check"
              compact
            />

            {demoTradingFlowEnabled && (
              <RecommendationIntakeQualityDiagnostics
                results={recommendationIntakeQualityResults}
                observabilitySummary={scanPipelineObservabilitySummary}
              />
            )}

            {demoTradingFlowEnabled && (
              <DemoTradingFlowTools
                recommendationCount={demoRecommendationCount}
                activePositionCount={demoActivePositionCount}
                closedPositionCount={demoClosedPositionCount}
                lastAction={lastDemoAction}
                onCreateDemoRecommendation={createDemoRecommendation}
                onClearDemoData={clearDemoTradeData}
              />
            )}

            {demoTradingFlowEnabled && (
              <RecommendationOutcomeEvaluationRunnerPanel
                diagnostics={recommendationOutcomeEvaluationDiagnostics}
                isRunning={isEvaluatingRecommendationOutcomes}
                onEvaluate={evaluateRecentRecommendationOutcomes}
              />
            )}

            <pre
              id="trade-recommendation-snapshots-json"
              className="sr-only"
              data-snapshots-stored-today={
                recommendationSnapshotDiagnostics.snapshotsStoredToday
              }
              data-last-snapshot-timestamp={
                recommendationSnapshotDiagnostics.lastSnapshotTimestamp ?? ""
              }
              data-duplicate-skipped-count={
                recommendationSnapshotDiagnostics.duplicateSkippedCount
              }
              data-persistence-status={
                recommendationSnapshotDiagnostics.persistenceStatus
              }
              data-persistence-mode={
                recommendationSnapshotDiagnostics.persistenceMode
              }
              data-persistence-error={
                recommendationSnapshotDiagnostics.lastError ?? ""
              }
            >
              {visibleRecommendationSnapshotsJson}
            </pre>

            <pre
              id="trade-recommendation-outcomes-json"
              className="sr-only"
              data-tracked-snapshots-count={
                recommendationOutcomeDiagnostics.trackedSnapshotsCount
              }
              data-pending-outcomes={
                recommendationOutcomeDiagnostics.pendingOutcomes
              }
              data-completed-outcomes={
                recommendationOutcomeDiagnostics.completedOutcomes
              }
              data-incomplete-outcomes={
                recommendationOutcomeDiagnostics.incompleteOutcomes
              }
              data-unknown-outcomes={
                recommendationOutcomeDiagnostics.unknownOutcomes
              }
              data-last-outcome-evaluation-timestamp={
                recommendationOutcomeDiagnostics.lastOutcomeEvaluationTimestamp ??
                ""
              }
              data-persistence-status={
                recommendationOutcomeDiagnostics.persistenceStatus
              }
              data-persistence-mode={
                recommendationOutcomeDiagnostics.persistenceMode
              }
              data-persistence-error={
                recommendationOutcomeDiagnostics.lastError ?? ""
              }
            >
              {visibleRecommendationOutcomesJson}
            </pre>

            <pre
              id="trade-recommendation-outcome-evaluation-run-json"
              className="sr-only"
              data-run-status={recommendationOutcomeEvaluationDiagnostics.status}
              data-eligible-snapshots={
                recommendationOutcomeEvaluationDiagnostics.eligibleSnapshots
              }
              data-evaluated-snapshots={
                recommendationOutcomeEvaluationDiagnostics.evaluatedSnapshots
              }
              data-missing-candles={
                recommendationOutcomeEvaluationDiagnostics.incompleteDueToMissingCandles
              }
              data-provider-errors={
                recommendationOutcomeEvaluationDiagnostics.providerErrors
              }
              data-last-run-timestamp={
                recommendationOutcomeEvaluationDiagnostics.lastRunTimestamp ?? ""
              }
              data-horizons-evaluated={
                recommendationOutcomeEvaluationDiagnostics.horizonsEvaluated.join(",")
              }
              data-persistence-mode={
                recommendationOutcomeEvaluationDiagnostics.persistenceMode
              }
              data-snapshot-only={
                recommendationOutcomeEvaluationDiagnostics.snapshotOnly
                  ? "true"
                  : "false"
              }
            >
              {recommendationOutcomeEvaluationRunJsonText}
            </pre>

            {isLoading ? (
              <EmptyState
                title="Loading recommendations"
                message="Trade is reading your Supabase recommendations table."
              />
            ) : recommendationEmptyStateSummary.show_dominant_empty_state ? (
              <RecommendationEmptyStatePanel
                summary={recommendationEmptyStateSummary}
                mode="dominant"
              />
            ) : (
              <div className="trade-recommendation-grid">
                {recommendationEmptyStateSummary.show_supporting_empty_state && (
                  <RecommendationEmptyStatePanel
                    summary={recommendationEmptyStateSummary}
                    mode="supporting"
                  />
                )}
                {elevatedPreTradeContexts.length > 0 && (
                  <DismissibleWarning
                    storageKey={warningDismissKey([
                      "elevated-pre-trade-contexts",
                      elevatedPreTradeContexts.length,
                    ])}
                    className="trade-recommendation-grid__notice rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100"
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
          <section className="trade-live-section">
            <TradePrimaryStatusbar
              updateLabel="Trades updated"
              updatedAt={liveTradesLastUpdatedAt}
              currentTime={currentTime}
              scanWindowLabel={currentIntradayScanWindowLabel}
              onRefresh={() => {
                if (activePositions.length === 0) {
                  void loadTradeData();
                  return;
                }

                void updatePositions("manual");
              }}
              isRefreshing={isUpdatingPositions || isLoading}
              isDisabled={isLoading}
            />

            <DataModeClarityBanner
              summary={dataModeClaritySummary}
              surfaceIds={["live_day_trades", "sell_handoff_and_exit_capture"]}
              compact
            />

            <MarketSessionSummaryPanel
              evaluation={currentMarketSessionEvaluation}
              title="Live Session / EOD Context"
              compact
            />

            <div className="trade-session-notifications">
              {showDevPreviewPositiveAlert && (
                <DismissibleWarning
                  storageKey={warningDismissKey([
                    "dev-preview-positive-alert",
                    dailySessionDate,
                  ])}
                  className="trade-session-notification trade-session-notification--positive"
                  actionLabel="DISMISS"
                >
                  <p>Dev preview data is active for UI review.</p>
                  <span>Sample recommendations loaded</span>
                </DismissibleWarning>
              )}

              {message && (
                <DismissibleWarning
                  storageKey={warningDismissKey(["global-message", message])}
                  className="trade-session-notification trade-session-notification--positive"
                  actionLabel="DISMISS"
                >
                  <p>{message}</p>
                  <span>Just now</span>
                </DismissibleWarning>
              )}

            </div>

            {!autoRefreshLiveTrades && hasStaleLiveTradeData && (
              <p className="trade-live-help">
                Enable auto-refresh to keep live trade data current.
              </p>
            )}

            {marketCloseWarning && activePositions.length > 0 && (
              <div className="trade-session-notice trade-session-notice--warning">
                {marketCloseWarning}
              </div>
            )}

            {hasEndOfDayReviewRequired && (
              <div className="trade-session-notice trade-session-notice--danger">
                <p className="trade-session-notice__label">
                  {hasEndOfDayOvernightRisk
                    ? "End-of-Day Overnight Risk"
                    : "End-of-Day Review Required"}
                </p>
                <p>
                  {hasEndOfDayOvernightRisk
                    ? "A day trade is still open after market close. Review immediately."
                    : "One or more day trades are still open near/after market close."}
                </p>
              </div>
            )}

            {hasCriticalLiveTradeAlert && (
              <div className="trade-session-notice trade-session-notice--danger">
                <p className="trade-session-notice__label">
                  Critical Live Trade Alert
                </p>
                <p>One or more trades require manual action.</p>
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
              <>
                <div className="trade-live-grid">
                  {(takeProfitLivePositionItems.length > 0
                    ? takeProfitLivePositionItems
                    : livePositionItems
                  ).map(({ position, latestUpdate }) => (
                    <ActivePositionCard
                      key={`${position.id}:${dailySessionDate}`}
                      position={position}
                      latestUpdate={latestUpdate}
                      marketCloseWarning={marketCloseWarning}
                      eodSafetyStatus={eodSafetyStatusesByPositionId[position.id]}
                      eodSafetyDate={dailySessionDate}
                      isMarketOpen={topMarketStatus === "open"}
                      currentTime={currentTime}
                      riskControlsEvaluation={evaluateRiskControlsForLiveTrade({
                        settings: riskControlsSettings,
                        ticker: position.ticker,
                        openPositionsCount: activePositions.length,
                        closedTradesTodayCount: dailyClosedPositions.length,
                        dailyRealizedPnl,
                        dailyRealizedR,
                        currentUnrealizedPnl: calculateUnrealizedPnl({
                          entryPrice: position.entryPriceValue,
                          currentPrice: latestUpdate?.currentPriceValue ?? null,
                          shares: position.positionSizeValue,
                          direction: position.direction,
                        }).pnl,
                        currentR:
                          latestUpdate?.unrealizedRValue ??
                          calculateCurrentR({
                            entryPrice: position.entryPriceValue,
                            stopLoss: position.stopLossValue,
                            currentPrice: latestUpdate?.currentPriceValue ?? null,
                            direction: position.direction,
                          }),
                        lastLossClosedAt,
                        now: currentTime,
                      })}
                      isSaving={isSaving}
                      onClosePosition={openClosePositionModal}
                    />
                  ))}
                </div>

                {takeProfitLivePositionItems.length > 0 &&
                  otherLivePositionItems.length > 0 && (
                  <>
                    <div className="trade-live-divider" aria-hidden="true" />
                    <div className="trade-live-grid trade-live-grid--continued">
                      {otherLivePositionItems.map(({ position, latestUpdate }) => (
                        <ActivePositionCard
                          key={`${position.id}:${dailySessionDate}`}
                          position={position}
                          latestUpdate={latestUpdate}
                          marketCloseWarning={marketCloseWarning}
                          eodSafetyStatus={
                            eodSafetyStatusesByPositionId[position.id]
                          }
                          eodSafetyDate={dailySessionDate}
                          isMarketOpen={topMarketStatus === "open"}
                          currentTime={currentTime}
                          riskControlsEvaluation={evaluateRiskControlsForLiveTrade({
                            settings: riskControlsSettings,
                            ticker: position.ticker,
                            openPositionsCount: activePositions.length,
                            closedTradesTodayCount: dailyClosedPositions.length,
                            dailyRealizedPnl,
                            dailyRealizedR,
                            currentUnrealizedPnl: calculateUnrealizedPnl({
                              entryPrice: position.entryPriceValue,
                              currentPrice: latestUpdate?.currentPriceValue ?? null,
                              shares: position.positionSizeValue,
                              direction: position.direction,
                            }).pnl,
                            currentR:
                              latestUpdate?.unrealizedRValue ??
                              calculateCurrentR({
                                entryPrice: position.entryPriceValue,
                                stopLoss: position.stopLossValue,
                                currentPrice:
                                  latestUpdate?.currentPriceValue ?? null,
                                direction: position.direction,
                              }),
                            lastLossClosedAt,
                            now: currentTime,
                          })}
                          isSaving={isSaving}
                          onClosePosition={openClosePositionModal}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        )}

        {activeTab === "Statistics" && (
          <section className="trade-statistics-section space-y-6">
            <TradePrimaryStatusbar
              updateLabel="Stats updated"
              updatedAt={statisticsLastUpdatedAt}
              currentTime={currentTime}
              scanWindowLabel={currentIntradayScanWindowLabel}
              onRefresh={() => {
                void loadTradeData();
              }}
              isRefreshing={isLoading}
            />

            <DataModeClarityBanner
              summary={dataModeClaritySummary}
              surfaceIds={["history_and_statistics"]}
              compact
            />

            <StatisticsDashboardPanel
              dashboard={statisticsDashboard}
              selectedRange={selectedStatisticsRange}
              onRangeChange={setSelectedStatisticsRange}
              isLoading={isLoading}
              onViewHistory={() => setActiveTab("History")}
            />
          </section>
        )}

        {activeTab === "History" && (
          <section className="trade-statistics-section space-y-8">
            <div>
              <h2 className="font-mono text-2xl font-semibold tracking-normal text-white">
                History
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Closed trades and theoretical discarded setup analytics.
              </p>
            </div>

            <DataModeClarityBanner
              summary={dataModeClaritySummary}
              surfaceIds={["history_and_statistics", "mock_broker_tools"]}
              compact
            />

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
                Trade Journal
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Closed trades with realized outcome, partial-close accounting,
                execution quality, and learning-loop context. History is
                descriptive only and never triggers trades.
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
                <div className="space-y-4">
                  <HistoryJournalControls
                    dashboard={historyDashboard}
                    outcomeFilter={historyOutcomeFilter}
                    demoFilter={historyDemoFilter}
                    partialFilter={historyPartialFilter}
                    sortMode={historySortMode}
                    onOutcomeFilterChange={setHistoryOutcomeFilter}
                    onDemoFilterChange={setHistoryDemoFilter}
                    onPartialFilterChange={setHistoryPartialFilter}
                    onSortModeChange={setHistorySortMode}
                  />
                  {historyDashboard.filteredTrades.length === 0 ? (
                    <EmptyState
                      title="No trades match these filters"
                      message="Adjust the History filters to show more closed positions."
                    />
                  ) : (
                    <div className="grid gap-4 xl:grid-cols-2">
                      {historyDashboard.filteredTrades.map((summary) => {
                        const position = historyPositionById.get(summary.id);

                        if (!position) {
                          return null;
                        }

                        return (
                          <ClosedPositionCard
                            key={position.id}
                            position={position}
                            historySummary={summary}
                          />
                        );
                      })}
                    </div>
                  )}
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

            <LiveTestReadinessPanel
              summary={liveTestReadinessSummary}
              selectedMode={liveTestReadinessMode}
              onModeChange={setLiveTestReadinessMode}
            />

            <PaperSessionProtocolPanel
              summary={paperSessionProtocolSummary}
              state={paperSessionProtocolState}
              onModeChange={updatePaperSessionMode}
              onStart={startPaperSessionProtocol}
              onStepChange={updatePaperSessionStep}
              onOutcomeChange={updatePaperSessionOutcome}
              onNotesChange={updatePaperSessionNotes}
              onEnd={endPaperSessionProtocol}
              onReset={resetPaperSessionProtocol}
            />

            <div className="trade-session-notifications">
              {(dailyCooldownAdvisory.level === "pause" ||
                dailyCooldownAdvisory.level === "stop_for_day") && (
                <DismissibleWarning
                  storageKey={warningDismissKey([
                    "cooldown-advisory",
                    dailyCooldownAdvisory.level,
                    dailyCooldownAdvisory.generated_at,
                  ])}
                  className="trade-session-notification trade-session-notification--warning"
                  actionLabel="DISMISS"
                >
                  <p>
                    Session cooldown advisory is active:{" "}
                    {dailyCooldownAdvisory.suggested_action}
                  </p>
                  <span>Advisory only</span>
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
                  className={`trade-session-notification ${
                    dailySessionQualityScore.grade === "D"
                      ? "trade-session-notification--danger"
                      : "trade-session-notification--warning"
                  }`}
                  actionLabel="DISMISS"
                >
                  <p>
                    Session quality is{" "}
                    {dailySessionQualityScore.grade === "D" ? "poor" : "risky"}:{" "}
                    {dailySessionQualityScore.summary}
                  </p>
                  <span>Advisory only</span>
                </DismissibleWarning>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
              <MarketRegimeCard marketRegime={marketRegime} />
              <div className="space-y-3">
                <MarketSessionSummaryPanel
                  evaluation={currentMarketSessionEvaluation}
                  title="US Market Session"
                  domId="trade-market-session-evaluation-json"
                />
                <MarketStatusNotice
                  marketStatus={marketStatus}
                  error={marketStatusError}
                />
              </div>
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
          positionSizing={
            selectedRecommendationPositionSizing ??
            calculatePositionSizing(selectedRecommendation, userSettings)
          }
          validation={selectedTradeValidation}
          validationMessage={selectedTradeValidationMessage}
          brokerCostModel={brokerCostModel}
          riskControlsSettings={riskControlsSettings}
          riskControlsEvaluation={selectedRecommendationRiskControlsEvaluation}
          marketSessionEvaluation={currentMarketSessionEvaluation}
          isSaving={isSaving}
          onClose={closeTradeModal}
          onSubmit={submitTrade}
        />
      )}

      {selectedPosition && (
        <ClosePositionModal
          key={selectedPosition.id}
          position={selectedPosition}
          latestUpdate={latestPositionUpdates[selectedPosition.id]}
          eodSafetyStatus={getEndOfDaySafetyStatus(
            selectedPosition,
            marketStatus,
            currentTime,
          )}
          exitPrice={exitPrice}
          exitNotes={exitNotes}
          riskControlsEvaluation={selectedPositionRiskControlsEvaluation}
          marketSessionEvaluation={currentMarketSessionEvaluation}
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

function statisticsProgressTone(status: StatisticsProgressSummary["status"]) {
  if (status === "positive") {
    return "border-[#00db94]/30 bg-[#00db94]/10 text-emerald-100";
  }

  if (status === "mixed" || status === "no_trades") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function statisticsOutcomeTone(outcome: string) {
  if (outcome === "winner") {
    return "border-[#00db94]/25 bg-[#00db94]/10 text-emerald-100";
  }

  if (outcome === "loser") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

function formatStatisticsProfitFactor(value: number | "infinite" | null) {
  if (value === null) {
    return "—";
  }

  if (value === "infinite") {
    return "∞";
  }

  return value.toFixed(2);
}

function formatStatisticsDurationMinutes(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  const minutes = Math.max(0, Math.round(value));

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
}

function formatStatisticsCount(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatStatisticsStatusLabel(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return value.replace(/_/g, " ").toUpperCase();
}

function StatisticsDashboardPanel({
  dashboard,
  selectedRange,
  onRangeChange,
  isLoading,
  onViewHistory,
}: {
  dashboard: StatisticsDashboard;
  selectedRange: StatisticsTimeRange;
  onRangeChange: (range: StatisticsTimeRange) => void;
  isLoading: boolean;
  onViewHistory: () => void;
}) {
  const metrics = dashboard.metrics;
  const hasClosedTrades = metrics.trades > 0;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-black/25 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Statistics
            </p>
            <h2 className="mt-2 font-mono text-2xl font-semibold tracking-normal text-white">
              Progress Dashboard
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Realized performance, R curves, daily rhythm, and partial-close
              context for the selected period. Performance analytics are
              descriptive, not predictions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {statisticsTimeRangeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onRangeChange(option.value)}
                className={`min-h-9 rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition ${
                  selectedRange === option.value
                    ? "border-[#00db94]/45 bg-[#00db94]/15 text-emerald-100"
                    : "border-white/10 bg-white/[0.035] text-zinc-500 hover:border-white/20 hover:text-zinc-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-md border border-white/10 bg-white/[0.025] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-200">
              {dashboard.rangeLabel}
            </p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              {dashboard.rangeDescription}
            </p>
            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Demo trades: {dashboard.periodRiskSummary.demo_trade_count} · Real
              trades: {dashboard.periodRiskSummary.real_trade_count}
            </p>
          </div>
          <span
            className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${statisticsProgressTone(
              dashboard.progressSummary.status,
            )}`}
          >
            {dashboard.progressSummary.title}
          </span>
        </div>
      </div>

      {isLoading ? (
        <EmptyState
          title="Loading statistics"
          message="Trade is calculating progress from manually closed positions."
        />
      ) : (
        <>
          <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Progress Summary
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {dashboard.progressSummary.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-zinc-400">
                  {dashboard.progressSummary.message}
                </p>
              </div>
              <button
                type="button"
                onClick={onViewHistory}
                className="min-h-10 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/25 hover:text-white"
              >
                View Full History
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              label="Realized PnL"
              value={formatSignedCurrency(metrics.realizedPnl)}
              tone={metrics.realizedPnl}
            />
            <SummaryCard
              label="Total R"
              value={formatSignedR(metrics.totalR)}
              tone={metrics.totalR}
            />
            <SummaryCard
              label="Win Rate"
              value={formatPercent(metrics.winRate)}
            />
            <SummaryCard label="Trades" value={String(metrics.trades)} />
            <SummaryCard
              label="Average R"
              value={formatSignedR(metrics.averageR)}
              tone={metrics.averageR}
            />
            <SummaryCard
              label="Profit Factor"
              value={formatStatisticsProfitFactor(metrics.profitFactor)}
            />
            <SummaryCard
              label="Expectancy"
              value={formatSignedCurrency(metrics.expectancyPerTrade)}
              tone={metrics.expectancyPerTrade}
            />
            <SummaryCard label="Winners" value={String(metrics.winners)} />
            <SummaryCard label="Losers" value={String(metrics.losers)} />
            <SummaryCard label="Breakeven" value={String(metrics.breakeven)} />
            <SummaryCard
              label="Avg Winner"
              value={formatSignedCurrency(metrics.averageWinnerPnl)}
              tone={metrics.averageWinnerPnl}
            />
            <SummaryCard
              label="Avg Loser"
              value={formatSignedCurrency(metrics.averageLoserPnl)}
              tone={metrics.averageLoserPnl}
            />
            <SummaryCard
              label="Avg Winner R"
              value={formatSignedR(metrics.averageWinnerR)}
              tone={metrics.averageWinnerR}
            />
            <SummaryCard
              label="Avg Loser R"
              value={formatSignedR(metrics.averageLoserR)}
              tone={metrics.averageLoserR}
            />
            <SummaryCard
              label="Best Trade"
              value={formatSignedR(metrics.bestTrade)}
              tone={metrics.bestTrade}
            />
            <SummaryCard
              label="Worst Trade"
              value={formatSignedR(metrics.worstTrade)}
              tone={metrics.worstTrade}
            />
            <SummaryCard
              label="Max Daily Gain"
              value={formatSignedCurrency(metrics.maxDailyGain)}
              tone={metrics.maxDailyGain}
            />
            <SummaryCard
              label="Max Daily Loss"
              value={formatSignedCurrency(metrics.maxDailyLoss)}
              tone={metrics.maxDailyLoss}
            />
            <SummaryCard
              label="Avg Hold"
              value={formatStatisticsDurationMinutes(metrics.averageHoldMinutes)}
            />
            <SummaryCard
              label="Trades / Day"
              value={formatStatisticsCount(metrics.tradeFrequencyPerDay)}
            />
          </div>

          <PlanAdherenceStatisticsSummary dashboard={dashboard} />

          {!hasClosedTrades && (
            <EmptyState
              title="No closed trades in this period yet"
              message="Close trades manually and they will appear in this progress dashboard."
            />
          )}

          <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
            <StatisticsChartPanel title="Cumulative PnL">
              <CumulativePnlChart dashboard={dashboard} />
            </StatisticsChartPanel>
            <StatisticsChartPanel title="Cumulative R">
              <CumulativeRChart dashboard={dashboard} />
            </StatisticsChartPanel>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <StatisticsChartPanel title="Daily PnL">
              <DailyPnlBars dashboard={dashboard} />
            </StatisticsChartPanel>
            <StatisticsChartPanel title="Daily R">
              <DailyRBars dashboard={dashboard} />
            </StatisticsChartPanel>
            <StatisticsChartPanel title="Trade Count / Day">
              <DailyTradeCountBars dashboard={dashboard} />
            </StatisticsChartPanel>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <StatisticsChartPanel title="Trade Outcomes">
              <OutcomeBreakdownChart dashboard={dashboard} />
            </StatisticsChartPanel>
            <StatisticsChartPanel title="Setup Type Performance">
              <SetupTypePerformanceList dashboard={dashboard} />
            </StatisticsChartPanel>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <RecentStatisticsTrades dashboard={dashboard} />
            <OpenPositionsStatisticsContext dashboard={dashboard} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <PartialCloseStatisticsSummary dashboard={dashboard} />
            <PeriodRiskStatisticsSummary dashboard={dashboard} />
          </div>
        </>
      )}
    </div>
  );
}

function StatisticsChartPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function PlanAdherenceStatisticsSummary({
  dashboard,
}: {
  dashboard: StatisticsDashboard;
}) {
  const summary = dashboard.planAdherenceSummary;
  const statusRows = [
    {
      label: "Followed plan",
      value: summary.status_breakdown.followed_plan,
      className: "bg-[#00B899]",
    },
    {
      label: "Minor deviation",
      value: summary.status_breakdown.minor_deviation,
      className: "bg-cyan-300",
    },
    {
      label: "Needs review",
      value: summary.status_breakdown.needs_review,
      className: "bg-amber-300",
    },
    {
      label: "Major deviation",
      value: summary.status_breakdown.major_deviation,
      className: "bg-[#D84646]",
    },
    {
      label: "Incomplete",
      value: summary.status_breakdown.incomplete,
      className: "bg-zinc-500",
    },
  ];
  const gradeRows = [
    { label: "A", value: summary.grade_breakdown.A, className: "bg-[#00B899]" },
    { label: "B", value: summary.grade_breakdown.B, className: "bg-cyan-300" },
    { label: "C", value: summary.grade_breakdown.C, className: "bg-amber-300" },
    { label: "D", value: summary.grade_breakdown.D, className: "bg-orange-300" },
    { label: "F", value: summary.grade_breakdown.F, className: "bg-[#D84646]" },
    {
      label: "Unknown",
      value: summary.grade_breakdown.unknown,
      className: "bg-zinc-500",
    },
  ];

  return (
    <section className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100">
            Plan Adherence
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Plan adherence measures process quality. A losing trade can still
            follow the plan if risk was respected.
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Demo reviewed: {summary.demo_reviewed_count} · Real reviewed:{" "}
            {summary.real_reviewed_count}
          </p>
        </div>
        <span className="w-fit rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
          {summary.reviewed_trades} reviewed
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard
          label="Plan Adherence"
          value={formatPercent(summary.followed_plan_rate)}
        />
        <SummaryCard
          label="Reviewed Trades"
          value={String(summary.reviewed_trades)}
        />
        <SummaryCard
          label="Avg Planned R/R"
          value={formatIntradayIndicatorValue(
            summary.average_planned_risk_reward,
            "R/R",
          )}
        />
        <SummaryCard
          label="Above Rec. Size"
          value={String(summary.trades_above_recommended_quantity)}
        />
        <SummaryCard
          label="Risk Exceeded"
          value={String(summary.trades_realized_loss_exceeded_planned_risk)}
        />
        <SummaryCard
          label="Missing Snapshots"
          value={String(summary.trades_missing_planning_snapshot)}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <PlanAdherenceBreakdown
          title="Status Breakdown"
          rows={statusRows}
          total={summary.reviewed_trades}
        />
        <PlanAdherenceBreakdown
          title="Grade Breakdown"
          rows={gradeRows}
          total={summary.reviewed_trades}
        />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Detail
          label="Actual > Planned Qty"
          value={String(summary.trades_above_planned_quantity)}
        />
        <Detail
          label="Followed Plan Avg R"
          value={formatSignedR(summary.average_realized_r_followed_plan)}
        />
        <Detail
          label="Deviation Avg R"
          value={formatSignedR(summary.average_realized_r_deviated)}
        />
        <Detail
          label="Avg Reward Capture"
          value={formatPercent(summary.average_reward_capture_percent)}
        />
      </div>

      {summary.warnings.length > 0 && (
        <div className="mt-4 rounded-md border border-amber-300/15 bg-amber-300/[0.045] p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
            Plan Review Notes
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-50/80">
            {summary.warnings.slice(0, 3).map((warning) => (
              <li key={warning.warning_id}>{warning.message}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function PlanAdherenceBreakdown({
  title,
  rows,
  total,
}: {
  title: string;
  rows: Array<{ label: string; value: number; className: string }>;
  total: number;
}) {
  if (total === 0) {
    return (
      <div className="rounded-md border border-white/10 bg-black/20 p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          No reviewed trades in this range.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
        {title}
      </p>
      <div className="mt-3 space-y-3">
        {rows.map((row) => {
          const width = total > 0 ? (row.value / total) * 100 : 0;

          return (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-zinc-300">{row.label}</span>
                <span className="font-mono text-zinc-500">
                  {row.value} / {total}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={`h-full rounded-full ${row.className}`}
                  style={{ width: `${Math.max(0, width)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CumulativePnlChart({ dashboard }: { dashboard: StatisticsDashboard }) {
  const series = dashboard.cumulativePnlSeries;

  if (series.length === 0) {
    return (
      <p className="min-h-40 rounded-md border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-zinc-500">
        No PnL points yet for this period.
      </p>
    );
  }

  const values = series.map((point) => point.cumulativePnl);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = max - min || 1;
  const width = 100;
  const height = 48;
  const points = series
    .map((point, index) => {
      const x = series.length === 1 ? width / 2 : (index / (series.length - 1)) * width;
      const y = height - ((point.cumulativePnl - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const latest = series[series.length - 1];

  return (
    <div>
      <svg
        aria-label="Cumulative PnL chart"
        className="h-44 w-full overflow-visible"
        preserveAspectRatio="none"
        viewBox={`0 0 ${width} ${height}`}
      >
        <line
          x1="0"
          x2={width}
          y1={height - ((0 - min) / range) * height}
          y2={height - ((0 - min) / range) * height}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.5"
        />
        <polyline
          fill="none"
          points={points}
          stroke={latest.cumulativePnl >= 0 ? "#00B899" : "#D84646"}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
        <span>{series[0]?.label ?? "—"}</span>
        <span className="font-mono text-zinc-300">
          {formatSignedCurrency(latest.cumulativePnl)}
        </span>
        <span>{latest.label}</span>
      </div>
    </div>
  );
}

function CumulativeRChart({ dashboard }: { dashboard: StatisticsDashboard }) {
  const series = dashboard.cumulativeRSeries;

  if (series.length === 0) {
    return (
      <p className="min-h-40 rounded-md border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-zinc-500">
        No R points yet for this period.
      </p>
    );
  }

  const values = series.map((point) => point.cumulativeR);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = max - min || 1;
  const width = 100;
  const height = 48;
  const points = series
    .map((point, index) => {
      const x = series.length === 1 ? width / 2 : (index / (series.length - 1)) * width;
      const y = height - ((point.cumulativeR - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const latest = series[series.length - 1];

  return (
    <div>
      <svg
        aria-label="Cumulative R chart"
        className="h-44 w-full overflow-visible"
        preserveAspectRatio="none"
        viewBox={`0 0 ${width} ${height}`}
      >
        <line
          x1="0"
          x2={width}
          y1={height - ((0 - min) / range) * height}
          y2={height - ((0 - min) / range) * height}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.5"
        />
        <polyline
          fill="none"
          points={points}
          stroke={latest.cumulativeR >= 0 ? "#00B899" : "#D84646"}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
        <span>{series[0]?.label ?? "—"}</span>
        <span className="font-mono text-zinc-300">
          {formatSignedR(latest.cumulativeR)}
        </span>
        <span>{latest.label}</span>
      </div>
    </div>
  );
}

function DailyPnlBars({ dashboard }: { dashboard: StatisticsDashboard }) {
  const series = dashboard.dailyPnlSeries;

  if (series.length === 0) {
    return (
      <p className="min-h-40 rounded-md border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-zinc-500">
        No daily realized PnL bars yet.
      </p>
    );
  }

  const maxAbs = Math.max(...series.map((point) => Math.abs(point.pnl)), 1);

  return (
    <div>
      <div className="flex min-h-44 items-end gap-1.5 border-b border-white/10 pb-2">
        {series.map((point) => {
          const height = Math.max(8, (Math.abs(point.pnl) / maxAbs) * 150);
          const tone =
            point.pnl > 0
              ? "bg-[#00B899]"
              : point.pnl < 0
                ? "bg-[#D84646]"
                : "bg-zinc-500";

          return (
            <div
              key={point.date}
              className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
              title={`${point.label}: ${formatSignedCurrency(point.pnl)}`}
            >
              <div
                className={`w-full max-w-8 rounded-t-sm ${tone}`}
                style={{ height }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between gap-3 text-xs text-zinc-500">
        <span>{series[0]?.label ?? "—"}</span>
        <span>{series[series.length - 1]?.label ?? "—"}</span>
      </div>
    </div>
  );
}

function DailyRBars({ dashboard }: { dashboard: StatisticsDashboard }) {
  const series = dashboard.dailyPnlSeries;

  if (series.length === 0) {
    return (
      <p className="min-h-40 rounded-md border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-zinc-500">
        No daily R bars yet.
      </p>
    );
  }

  const maxAbs = Math.max(...series.map((point) => Math.abs(point.r)), 1);

  return (
    <div>
      <div className="flex min-h-44 items-end gap-1.5 border-b border-white/10 pb-2">
        {series.map((point) => {
          const height = Math.max(8, (Math.abs(point.r) / maxAbs) * 150);
          const tone =
            point.r > 0
              ? "bg-[#00B899]"
              : point.r < 0
                ? "bg-[#D84646]"
                : "bg-zinc-500";

          return (
            <div
              key={point.date}
              className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
              title={`${point.label}: ${formatSignedR(point.r)}`}
            >
              <div
                className={`w-full max-w-8 rounded-t-sm ${tone}`}
                style={{ height }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between gap-3 text-xs text-zinc-500">
        <span>{series[0]?.label ?? "—"}</span>
        <span>{series[series.length - 1]?.label ?? "—"}</span>
      </div>
    </div>
  );
}

function DailyTradeCountBars({
  dashboard,
}: {
  dashboard: StatisticsDashboard;
}) {
  const series = dashboard.dailyPnlSeries;

  if (series.length === 0) {
    return (
      <p className="min-h-40 rounded-md border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-zinc-500">
        No daily trade-count bars yet.
      </p>
    );
  }

  const maxCount = Math.max(...series.map((point) => point.count), 1);

  return (
    <div>
      <div className="flex min-h-44 items-end gap-1.5 border-b border-white/10 pb-2">
        {series.map((point) => {
          const height = Math.max(8, (point.count / maxCount) * 150);

          return (
            <div
              key={point.date}
              className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
              title={`${point.label}: ${point.count} trade${
                point.count === 1 ? "" : "s"
              }`}
            >
              <div
                className="w-full max-w-8 rounded-t-sm bg-cyan-300/70"
                style={{ height }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between gap-3 text-xs text-zinc-500">
        <span>{series[0]?.label ?? "—"}</span>
        <span>{series[series.length - 1]?.label ?? "—"}</span>
      </div>
    </div>
  );
}

function OutcomeBreakdownChart({
  dashboard,
}: {
  dashboard: StatisticsDashboard;
}) {
  const breakdown = dashboard.outcomeBreakdown;
  const rows = [
    {
      label: "Winners",
      value: breakdown.winners,
      className: "bg-[#00B899]",
    },
    {
      label: "Losers",
      value: breakdown.losers,
      className: "bg-[#D84646]",
    },
    {
      label: "Breakeven",
      value: breakdown.breakeven,
      className: "bg-zinc-500",
    },
  ];

  if (breakdown.total === 0) {
    return (
      <p className="rounded-md border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-zinc-500">
        No outcomes to summarize yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const width = breakdown.total > 0 ? (row.value / breakdown.total) * 100 : 0;

        return (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-zinc-300">{row.label}</span>
              <span className="font-mono text-zinc-500">
                {row.value} / {breakdown.total}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full ${row.className}`}
                style={{ width: `${Math.max(0, width)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SetupTypePerformanceList({
  dashboard,
}: {
  dashboard: StatisticsDashboard;
}) {
  if (dashboard.setupTypePerformance.length === 0) {
    return (
      <p className="rounded-md border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-zinc-500">
        Setup type performance appears after closed trades have setup data.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {dashboard.setupTypePerformance.map((setup) => (
        <div
          key={setup.setupType}
          className="grid gap-2 rounded-md border border-white/10 bg-white/[0.025] p-3 sm:grid-cols-[1fr_auto_auto_auto]"
        >
          <div>
            <p className="text-sm font-semibold text-zinc-200">
              {getSetupTypeLabel(normalizeSetupType(setup.setupType))}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
              {setup.count} trade{setup.count === 1 ? "" : "s"}
            </p>
          </div>
          <Detail label="Avg R" value={formatSignedR(setup.averageR)} />
          <Detail label="Total R" value={formatSignedR(setup.totalR)} />
          <Detail label="Win Rate" value={formatPercent(setup.winRate)} />
        </div>
      ))}
    </div>
  );
}

function RecentStatisticsTrades({
  dashboard,
}: {
  dashboard: StatisticsDashboard;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
        Recent Closed Trades
      </p>
      {dashboard.recentTrades.length === 0 ? (
        <p className="mt-4 rounded-md border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-zinc-500">
          No recent closed trades in this range.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {dashboard.recentTrades.map((trade) => (
            <div
              key={trade.id}
              className="grid gap-2 rounded-md border border-white/10 bg-white/[0.025] p-3 sm:grid-cols-[1fr_auto_auto_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-sm font-semibold text-zinc-100">
                    {trade.ticker}
                  </p>
                  {trade.isDemo && (
                    <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-100">
                      Demo
                    </span>
                  )}
                  {trade.partialPositionStatus && (
                    <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-amber-100">
                      {formatStatisticsStatusLabel(trade.partialPositionStatus)}
                    </span>
                  )}
                  {trade.planAdherenceGrade && (
                    <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-100">
                      Plan {trade.planAdherenceGrade}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {trade.closedAt ? formatDate(trade.closedAt) : "—"}
                </p>
              </div>
              <span
                className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${statisticsOutcomeTone(
                  trade.outcome,
                )}`}
              >
                {trade.outcome}
              </span>
              <Detail label="PnL" value={formatSignedCurrency(trade.pnl)} />
              <Detail label="R" value={formatSignedR(trade.rMultiple)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OpenPositionsStatisticsContext({
  dashboard,
}: {
  dashboard: StatisticsDashboard;
}) {
  const context = dashboard.openContext;

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
        Open Positions
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">
        Live context only. Unrealized PnL is not mixed into realized statistics.
      </p>
      <div className="mt-4 grid gap-2">
        <Detail label="Active Trades" value={String(context.activeCount)} />
        <Detail
          label="Open Unrealized PnL"
          value={formatSignedCurrency(context.openUnrealizedPnl)}
        />
        <Detail
          label="Last Position Update"
          value={
            context.lastPositionUpdateAt
              ? formatDate(context.lastPositionUpdateAt)
              : "—"
          }
        />
        <Detail
          label="Partial Exit Realized PnL"
          value={formatSignedCurrency(context.realizedPnlFromPartialExits)}
        />
        <Detail
          label="Partially Closed Open"
          value={String(context.partiallyClosedOpenCount)}
        />
        <Detail
          label="Remaining Shares Open"
          value={formatShares(context.remainingSharesOpen)}
        />
      </div>
    </div>
  );
}

function PartialCloseStatisticsSummary({
  dashboard,
}: {
  dashboard: StatisticsDashboard;
}) {
  const summary = dashboard.partialCloseSummary;

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
        Partial Close Accounting
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">
        Realized exit-fill PnL is included when present. Open remaining shares
        stay separate from closed performance.
      </p>
      <div className="mt-4 grid gap-2">
        <Detail
          label="Partial Closed Trades"
          value={String(summary.partialClosedTrades)}
        />
        <Detail
          label="Open Partially Closed"
          value={String(summary.openPartiallyClosedTrades)}
        />
        <Detail
          label="Closed With Exit Fills"
          value={String(summary.closedTradesWithExitFills)}
        />
        <Detail
          label="Exit-Fill Realized PnL"
          value={formatSignedCurrency(summary.realizedPnlFromExitFills)}
        />
        <Detail
          label="Remaining Shares Open"
          value={formatShares(summary.remainingSharesOpen)}
        />
      </div>
    </div>
  );
}

function PeriodRiskStatisticsSummary({
  dashboard,
}: {
  dashboard: StatisticsDashboard;
}) {
  const summary = dashboard.periodRiskSummary;
  const dailyLossCopy =
    summary.daily_loss_status === "loss"
      ? "Today is currently net negative."
      : summary.daily_loss_status === "ok"
        ? "Today is currently not net negative."
        : "No realized daily PnL is available yet.";

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
        Risk Controls Context
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">
        Period metrics exposed for risk review. They do not trigger trades or
        block closing risk-reducing exits.
      </p>
      <div className="mt-4 grid gap-2">
        <Detail
          label="Trades Opened Today"
          value={String(summary.trades_opened_today)}
        />
        <Detail
          label="Trades Closed Today"
          value={String(summary.trades_closed_today)}
        />
        <Detail
          label="Realized PnL Today"
          value={formatSignedCurrency(summary.realized_pnl_today)}
        />
        <Detail
          label="Realized R Today"
          value={formatSignedR(summary.realized_r_today)}
        />
        <Detail
          label="Daily Loss Status"
          value={formatStatisticsStatusLabel(summary.daily_loss_status)}
        />
        <Detail
          label="This Week"
          value={`${summary.current_week_summary.trades} trades · ${formatSignedCurrency(
            summary.current_week_summary.realized_pnl,
          )} · ${formatSignedR(summary.current_week_summary.realized_r)}`}
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-600">{dailyLossCopy}</p>
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

function AddTradeSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="trade-add-modal-section">
      <div className="trade-add-modal-section__title">
        <span aria-hidden="true" className="trade-recommendation-details-section__icon">
          <Image
            src="/trade-assets/chevron-icn.svg"
            alt=""
            width={10}
            height={10}
          />
        </span>
        <h3>{title}</h3>
      </div>
      <div className="trade-add-modal-section__body">{children}</div>
    </section>
  );
}

function AddTradeWorkflowGroup({
  title,
  description,
  children,
  defaultOpen = true,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="mt-5 rounded-lg border border-white/10 bg-white/[0.025] p-4"
    >
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-100">
              {title}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {description}
            </p>
          </div>
          <span className="w-fit rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
            Review
          </span>
        </div>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function AddTradeMetricGrid({
  metrics,
  className = "",
}: {
  metrics: Array<{ label: string; value: string }>;
  className?: string;
}) {
  return (
    <div className={`trade-add-modal-metrics ${className}`}>
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={`trade-add-modal-metric ${
            metric.label === "Setup Type" ? "trade-add-modal-metric--long" : ""
          }`}
        >
          <div className="trade-add-modal-metric__label">
            {recommendationDetailsValue(metric.label).toUpperCase()}
          </div>
          <div className="trade-add-modal-metric__value">
            {recommendationDetailsValue(metric.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

function AddTradeBrokerOrderRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="trade-add-broker-order-row">
      <p className="trade-add-broker-order-row__label">
        {recommendationDetailsValue(label).toUpperCase()}
      </p>
      <p className="trade-add-broker-order-row__value">
        {recommendationDetailsValue(value)}
      </p>
    </div>
  );
}

function PositionSizingSection({
  positionSizing,
  entryPrice,
}: {
  positionSizing: PositionSizing;
  entryPrice: string;
}) {
  return (
    <AddTradeSection title="Position Sizing">
      {!positionSizing.isAvailable ? (
        <p className="trade-add-modal-empty">Position size unavailable</p>
      ) : (
        <AddTradeMetricGrid
          metrics={[
            {
              label: "Suggested Shares",
              value: recommendationDetailsShares(positionSizing.suggestedShares),
            },
            { label: "Entry Price", value: recommendationDetailsValue(entryPrice) },
            {
              label: "Position Value",
              value: recommendationDetailsCurrency(positionSizing.suggestedPositionValue),
            },
            {
              label: "Risk/share",
              value: recommendationDetailsCurrency(positionSizing.riskPerShare),
            },
            {
              label: "Risk Amount",
              value: recommendationDetailsCurrency(positionSizing.riskAmount),
            },
          ]}
        />
      )}
    </AddTradeSection>
  );
}

function PositionSizingResultPanel({
  result,
}: {
  result: PositionSizingResult;
}) {
  const visibleBlockers = result.blockers.slice(0, 3);
  const visibleWarnings = result.warnings.slice(0, 3);

  return (
    <AddTradeSection title="Position Sizing v1">
      <div className="rounded-md border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
              Risk-Based Planning
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Read-only sizing from entry, stop, target, and local Risk Controls.
              It does not change the broker handoff quantity.
            </p>
          </div>
          <span
            className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${positionSizingTone(
              result.status,
            )}`}
          >
            {result.status.replaceAll("_", " ")}
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Entry" value={formatCurrency(result.entry_price)} />
          <Detail label="Stop" value={formatCurrency(result.stop_price)} />
          <Detail label="Target" value={formatCurrency(result.target_price)} />
          <Detail
            label="Risk / Share"
            value={formatCurrency(result.risk_per_share)}
          />
          <Detail
            label="Reward / Share"
            value={formatCurrency(result.reward_per_share)}
          />
          <Detail
            label="R/R"
            value={
              result.risk_reward_ratio === null
                ? "—"
                : `${result.risk_reward_ratio.toFixed(2)}R`
            }
          />
          <Detail
            label="Recommended Qty"
            value={
              result.recommended_quantity === null
                ? "—"
                : String(result.recommended_quantity)
            }
          />
          <Detail
            label="Planned Qty"
            value={
              result.planned_quantity === null ? "—" : String(result.planned_quantity)
            }
          />
          <Detail
            label="Planned Risk"
            value={formatCurrency(result.estimated_risk_at_planned_quantity)}
          />
          <Detail
            label="Planned Reward"
            value={formatCurrency(result.estimated_reward_at_planned_quantity)}
          />
          <Detail
            label="Position Value"
            value={formatCurrency(result.estimated_position_value)}
          />
          <Detail
            label="Risk Budget"
            value={formatCurrency(result.risk_budget_amount)}
          />
        </div>

        {(visibleBlockers.length > 0 || visibleWarnings.length > 0) && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.035] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                Blockers
              </p>
              {visibleBlockers.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                  {visibleBlockers.map((blockerItem) => (
                    <li key={blockerItem.blocker_id}>{blockerItem.message}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
              )}
            </div>
            <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                Warnings
              </p>
              {visibleWarnings.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                  {visibleWarnings.map((warningItem) => (
                    <li key={warningItem.warning_id}>{warningItem.message}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Next Action
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {result.next_action}
          </p>
        </div>

        <div
          id="trade-position-sizing-result-json"
          data-agent-readable="true"
          className="sr-only"
        >
          {positionSizingResultJson(result)}
        </div>
      </div>
    </AddTradeSection>
  );
}

function positionSizingTone(status: PositionSizingStatus) {
  if (status === "ok") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning" || status === "incomplete") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/25 bg-rose-300/10 text-rose-100";
}

function TradePlanQualityPanel({
  result,
}: {
  result: TradePlanQualityResult;
}) {
  const visibleChecks = result.checks.slice(0, 5);
  const visibleBlockers = result.blockers.slice(0, 3);
  const visibleWarnings = result.warnings.slice(0, 3);

  return (
    <AddTradeSection title="Trade Plan Quality">
      <div className="rounded-md border border-emerald-300/15 bg-emerald-300/[0.03] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
              Entry Validation v1
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Read-only plan check for entry, stop, target, R/R, and context.
              It does not change recommendation or broker handoff values.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${tradePlanQualityTone(
                result.status,
              )}`}
            >
              {result.status.replaceAll("_", " ")}
            </span>
            <span className="w-fit rounded-full border border-white/10 bg-black/25 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              Grade {result.grade}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Entry" value={formatCurrency(result.entry_price)} />
          <Detail label="Stop" value={formatCurrency(result.stop_price)} />
          <Detail label="Target" value={formatCurrency(result.target_price)} />
          <Detail
            label="Current"
            value={formatCurrency(result.current_price)}
          />
          <Detail
            label="Risk / Share"
            value={formatCurrency(result.risk_per_share)}
          />
          <Detail
            label="Reward / Share"
            value={formatCurrency(result.reward_per_share)}
          />
          <Detail
            label="R/R"
            value={
              result.risk_reward_ratio === null
                ? "—"
                : `${result.risk_reward_ratio.toFixed(2)}R`
            }
          />
          <Detail
            label="Stop Distance"
            value={formatPercent(result.stop_distance_percent)}
          />
          <Detail
            label="Target Distance"
            value={formatPercent(result.target_distance_percent)}
          />
          <Detail
            label="Market Risk"
            value={result.market_session_risk ?? "—"}
          />
          <Detail
            label="Planned Qty"
            value={
              result.planned_quantity === null ? "—" : String(result.planned_quantity)
            }
          />
          <Detail
            label="Blocks Create"
            value={result.blocks_create_live_trade ? "Yes" : "No"}
          />
        </div>

        <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Checks
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {visibleChecks.map((check) => (
              <div
                key={check.check_id}
                className="rounded-md border border-white/10 bg-white/[0.025] px-3 py-2"
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                  {check.label} · {check.status}
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-300">
                  {check.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {(visibleBlockers.length > 0 || visibleWarnings.length > 0) && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.035] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                Blockers
              </p>
              {visibleBlockers.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                  {visibleBlockers.map((blockerItem) => (
                    <li key={blockerItem.blocker_id}>{blockerItem.message}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
              )}
            </div>
            <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                Warnings
              </p>
              {visibleWarnings.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                  {visibleWarnings.map((warningItem) => (
                    <li key={warningItem.warning_id}>{warningItem.message}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Next Action
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {result.next_action}
          </p>
        </div>

        <div
          id="trade-plan-quality-result-json"
          data-agent-readable="true"
          className="sr-only"
        >
          {tradePlanQualityResultJson(result)}
        </div>
      </div>
    </AddTradeSection>
  );
}

function tradePlanQualityTone(status: TradePlanQualityStatus) {
  if (status === "excellent" || status === "ok") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning" || status === "incomplete") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/25 bg-rose-300/10 text-rose-100";
}

function AddTradePreflightSummaryPanel({
  summary,
}: {
  summary: AddTradePreflightSummary;
}) {
  const visibleChecks = summary.checks;
  const visibleBlockers = summary.blockers.slice(0, 3);
  const visibleWarnings = summary.warnings.slice(0, 3);

  return (
    <AddTradeSection title="Preflight Summary">
      <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-100">
              ADD TRADE Readiness
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {summary.primary_message}
            </p>
          </div>
          <span
            className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${addTradePreflightTone(
              summary.status,
            )}`}
          >
            {summary.status.replaceAll("_", " ")}
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visibleChecks.map((checkItem) => (
            <div
              key={checkItem.check_id}
              className="rounded-md border border-white/10 bg-black/25 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                  {checkItem.label}
                </p>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] ${addTradePreflightCheckTone(
                    checkItem.status,
                  )}`}
                >
                  {checkItem.status.replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-300">
                {checkItem.message}
              </p>
            </div>
          ))}
        </div>

        {(visibleBlockers.length > 0 || visibleWarnings.length > 0) && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.035] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                Top Blockers
              </p>
              {visibleBlockers.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                  {visibleBlockers.map((blockerItem) => (
                    <li key={blockerItem.blocker_id}>{blockerItem.message}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
              )}
            </div>
            <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                Top Warnings
              </p>
              {visibleWarnings.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                  {visibleWarnings.map((warningItem) => (
                    <li key={warningItem.warning_id}>{warningItem.message}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Next Safe Action
          </p>
          <p className="mt-2 text-sm font-semibold text-zinc-100">
            {summary.next_action.label}
          </p>
          <p className="mt-1 text-sm leading-6 text-zinc-400">
            {summary.next_action.description}
          </p>
        </div>

        <div
          id="trade-add-trade-preflight-summary-json"
          data-agent-readable="true"
          className="sr-only"
        >
          {addTradePreflightSummaryJson(summary)}
        </div>
      </div>
    </AddTradeSection>
  );
}

function addTradePreflightTone(status: AddTradePreflightStatus) {
  if (status === "ready") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "needs_review" || status === "incomplete") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/25 bg-rose-300/10 text-rose-100";
}

function addTradePreflightCheckTone(status: AddTradePreflightCheckStatus) {
  if (status === "pass") {
    return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning" || status === "incomplete") {
    return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  }

  if (status === "blocked") {
    return "border-rose-300/20 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

function recommendationConfidenceTier(recommendation: Recommendation) {
  const score = recommendation.confidenceScore;

  if (score !== null) {
    if (score >= 85) return "strong";
    if (score >= 70) return "medium";
    return "low";
  }

  if (recommendation.confidenceLabel === "HIGH CONVICTION") return "strong";
  if (recommendation.confidenceLabel === "GOOD SETUP") return "medium";
  if (recommendation.confidenceLabel === "LOWER CONFIDENCE") return "low";

  return "medium";
}

function recommendationConfidenceLabel(recommendation: Recommendation) {
  const tier = recommendationConfidenceTier(recommendation);

  if (tier === "strong") return "HIGH CONFIDENCE";
  if (tier === "low") return "LOW CONFIDENCE";
  return "MEDIUM CONFIDENCE";
}

function RecommendationMetricGrid({
  metrics,
}: {
  metrics: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="trade-recommendation-metrics">
      {metrics.map((metric) => (
        <div key={metric.label} className="trade-recommendation-metric">
          <div className="trade-recommendation-metric__label">
            {displayValue(metric.label).toUpperCase()}
          </div>
          <div className="trade-recommendation-metric__value">
            {displayValue(metric.value)}
          </div>
        </div>
      ))}
    </div>
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
  onIgnore: (recommendation: Recommendation) => void | Promise<void>;
}) {
  const freshness = getRecommendationFreshness(toFreshnessInput(recommendation));
  const isExpired = freshness === "expired";
  const addTradeGate = getAddTradeGate(recommendation, freshness);
  const confirmation = addTradeGate.confirmation;
  const confidenceBreakdownItems: Array<[string, number]> =
    recommendation.confidenceBreakdown
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);
  const cardSummary =
    decisionStack?.primary_warning ||
    decisionStack?.summary ||
    keyReasons.positive[0] ||
    recommendation.thesis;
  const confidenceTier = recommendationConfidenceTier(recommendation);
  const recommendationSourceBadge = isDemoRecommendation(recommendation)
    ? dataModeBadgeForMode("demo")
    : freshness === "stale" || freshness === "expired"
      ? dataModeBadgeForMode("stale_market_data")
      : dataModeBadgeForMode("supabase_record");

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => setIsDetailsOpen(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setIsDetailsOpen(true);
        }
      }}
      className="trade-recommendation-card"
    >
      <div className="trade-recommendation-card__eyebrow">
        TRADE RECOMMENDATION
      </div>
      <div className="mt-2">
        <DataModePill badge={recommendationSourceBadge} />
      </div>

      <div className="trade-recommendation-card__header">
        <CompanyIdentity
          ticker={recommendation.ticker}
          companyName={recommendation.companyName}
          size="live"
        />
        <span
          className={`trade-recommendation-confidence-pill trade-recommendation-confidence-pill--${confidenceTier}`}
        >
          {recommendationConfidenceLabel(recommendation)}
        </span>
      </div>

      <RecommendationMetricGrid
        metrics={[
          { label: "Entry", value: recommendation.entryZone },
          { label: "Stop", value: recommendation.stopLoss },
          { label: "Target", value: recommendation.target1 },
          { label: "Reward : Risk", value: recommendation.riskReward },
          {
            label: "Confidence",
            value:
              recommendation.confidenceScore === null
                ? "—"
                : `${recommendation.confidenceScore}/100`,
          },
        ]}
      />

      <div className="trade-recommendation-guidance">
        <p>{displayValue(cardSummary)}</p>
        <span>Updated {displayValue(recommendation.createdAt)}</span>
      </div>

      <div className="trade-recommendation-card__footer">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onTakeTrade(recommendation);
          }}
          disabled={isSaving || isExpired || isValidating}
          className="trade-recommendation-action trade-recommendation-action--primary"
        >
          {isValidating
            ? "Validating Setup"
            : addTradeGate.blocked && !isExpired
              ? "Review Setup"
              : "ADD TRADE"}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsDiscardConfirmOpen(true);
          }}
          disabled={isSaving}
          className="trade-recommendation-action trade-recommendation-action--secondary"
        >
          Discard
        </button>
      </div>

      {isDiscardConfirmOpen && (
        <DiscardRecommendationModal
          ticker={recommendation.ticker}
          companyName={recommendation.companyName}
          isSaving={isSaving || isConfirmingDiscard}
          onCancel={() => setIsDiscardConfirmOpen(false)}
          onConfirm={async () => {
            setIsConfirmingDiscard(true);
            try {
              await onIgnore(recommendation);
              setIsDiscardConfirmOpen(false);
            } finally {
              setIsConfirmingDiscard(false);
            }
          }}
        />
      )}

      {isDetailsOpen && (
        <RecommendationDetailsModal
          recommendation={recommendation}
          calibrationGuardrails={calibrationGuardrails}
          preTradeRiskContext={preTradeRiskContext}
          tradeEligibility={tradeEligibility}
          decisionStack={decisionStack}
          positionSizing={positionSizing}
          freshness={freshness}
          addTradeGateMessage={addTradeGate.message}
          confirmation={confirmation}
          confidenceBreakdownItems={confidenceBreakdownItems}
          keyReasons={keyReasons}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </article>
  );
}

function recommendationDetailsToneFromDecisionStatus(
  status: RecommendationDecisionStackStatus | null | undefined,
) {
  if (status === "strong") return "positive";
  if (status === "blocked" || status === "weak") return "danger";
  if (status === "mixed") return "warning";
  return "neutral";
}

function recommendationDetailsToneFromEligibility(
  status: TradeEligibilityStatus | null | undefined,
) {
  if (status === "eligible") return "positive";
  if (status === "not_eligible" || status === "risky") return "danger";
  if (status === "mixed") return "warning";
  return "neutral";
}

function recommendationQuickDecisionToneFromEligibility(
  status: TradeEligibilityStatus | null | undefined,
) {
  if (status === "eligible") return "positive";
  if (status === "not_eligible") return "danger";
  if (status === "mixed" || status === "risky") return "warning";
  return "neutral";
}

function recommendationDetailsToneFromRiskContext(
  level: PreTradeRiskContextResult["level"] | null | undefined,
) {
  if (level === "clear") return "positive";
  if (level === "avoid") return "danger";
  if (level === "caution") return "warning";
  return "neutral";
}

function recommendationDetailsToneFromConfirmation(
  status: IntradayConfirmationStatus["status"] | null | undefined,
) {
  if (status === "confirmed") return "positive";
  if (status === "weak") return "danger";
  if (status === "mixed") return "warning";
  return "neutral";
}

function recommendationDetailsToneFromCalibration(
  severity: CalibrationGuardrail["severity"] | null | undefined,
) {
  if (severity === "warning") return "danger";
  if (severity === "caution") return "warning";
  return "neutral";
}

function recommendationDetailsToneFromConfidence(score: number | null) {
  if (score === null) return "neutral";
  if (score >= 85) return "positive";
  if (score >= 70) return "warning";
  return "danger";
}

function recommendationDetailsToneClassName(
  tone: "positive" | "warning" | "danger" | "neutral",
) {
  return `trade-recommendation-details-pill--${tone}`;
}

function DemoBadge() {
  return (
    <span className="w-fit rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
      DEMO · TEST ONLY · NO BROKER ORDER
    </span>
  );
}

function dataModeBadgeClassName(tone: DataModeBadgeTone) {
  if (tone === "positive") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (tone === "warning") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (tone === "danger") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  if (tone === "info") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-300";
}

function DataModePill({ badge }: { badge: DataModeBadge }) {
  return (
    <span
      title={badge.message}
      className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${dataModeBadgeClassName(
        badge.tone,
      )}`}
    >
      {badge.label}
    </span>
  );
}

function DataModePillRow({ badges }: { badges: DataModeBadge[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges.map((badge) => (
        <DataModePill key={badge.badge_id} badge={badge} />
      ))}
    </div>
  );
}

function DataModeSurfaceNotice({
  surface,
  compact = false,
}: {
  surface: DataModeSurface | undefined;
  compact?: boolean;
}) {
  if (!surface) {
    return null;
  }

  return (
    <div
      className={`rounded-md border border-cyan-300/15 bg-cyan-300/[0.035] ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100">
            {surface.label} reality
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {surface.summary}
          </p>
        </div>
        <DataModePillRow badges={surface.badges.slice(0, compact ? 2 : 4)} />
      </div>
      {surface.warnings.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {surface.warnings.slice(0, 2).map((item) => (
            <p
              key={item.warning_id}
              className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2 text-xs leading-5 text-amber-100"
            >
              {item.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function DataModeClarityBanner({
  summary,
  surfaceIds,
  compact = false,
}: {
  summary: DataModeClaritySummary;
  surfaceIds?: string[];
  compact?: boolean;
}) {
  const surfaces = surfaceIds
    ? summary.surfaces.filter((surface) => surfaceIds.includes(surface.surface_id))
    : summary.surfaces.slice(0, compact ? 2 : 4);

  return (
    <section className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Data / execution reality
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Ture does not send broker orders. Real market data does not mean
            automated execution.
          </p>
        </div>
        <DataModePillRow badges={summary.global_badges.slice(0, compact ? 3 : 5)} />
      </div>

      {!compact && (
        <div className="mt-3 grid gap-2 lg:grid-cols-3">
          {surfaces.slice(0, 3).map((surface) => (
            <div
              key={surface.surface_id}
              className="rounded-md border border-white/10 bg-white/[0.025] p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  {surface.label}
                </p>
                <DataModePill badge={surface.badges[0]} />
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                {surface.summary}
              </p>
            </div>
          ))}
        </div>
      )}

      <div
        id="trade-data-mode-clarity-json"
        data-agent-readable="true"
        className="sr-only"
      >
        {dataModeClaritySummaryJson(summary)}
      </div>
    </section>
  );
}

const liveTestReadinessModeOptions: Array<{
  value: LiveTestReadinessMode;
  label: string;
}> = [
  { value: "demo_rehearsal", label: "Demo rehearsal" },
  { value: "real_market_paper", label: "Real-market paper" },
  { value: "real_prep_manual", label: "Real prep manual" },
  { value: "tiny_live_manual", label: "Tiny live manual" },
];

function liveTestReadinessStatusLabel(status: LiveTestReadinessStatus) {
  return status.replaceAll("_", " ");
}

function liveTestReadinessModeLabel(mode: LiveTestReadinessMode) {
  return mode.replaceAll("_", " ");
}

function liveTestReadinessCategoryLabel(category: LiveTestReadinessCategory) {
  if (category === "data_source") return "Data/source clarity";
  if (category === "scan_health") return "Scan health";
  if (category === "recommendation_quality") return "Recommendation quality";
  if (category === "market_session") return "Market session";
  if (category === "risk_controls") return "Risk controls";
  if (category === "position_sizing") return "Position sizing";
  if (category === "execution_safety") return "Execution safety";
  if (category === "demo_mock_state") return "Demo/mock state";
  return "Open positions";
}

function liveTestReadinessStatusTone(
  status: LiveTestReadinessStatus | LiveTestReadinessCheckStatus,
) {
  if (
    status === "ready_for_paper_test" ||
    status === "ready_for_real_prep" ||
    status === "ready_for_tiny_live_test" ||
    status === "pass"
  ) {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "needs_review" || status === "warning") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (status === "blocked") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-300";
}

function LiveTestReadinessBanner({
  summary,
}: {
  summary: LiveTestReadinessSummary;
}) {
  const primaryIssue = summary.blockers[0] ?? summary.warnings[0] ?? null;

  return (
    <section className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Live test readiness
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {primaryIssue
              ? primaryIssue.message
              : "Readiness checks pass for the selected mode. Ture does not send broker orders."}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${liveTestReadinessStatusTone(
            summary.status,
          )}`}
        >
          {liveTestReadinessStatusLabel(summary.status)}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-500">
        A no-trade session can still be a successful test.
      </p>
    </section>
  );
}

function LiveTestReadinessPanel({
  summary,
  selectedMode,
  onModeChange,
}: {
  summary: LiveTestReadinessSummary;
  selectedMode: LiveTestReadinessMode;
  onModeChange: (mode: LiveTestReadinessMode) => void;
}) {
  const categories = Array.from(new Set(summary.checks.map((item) => item.category)));

  return (
    <section className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100">
            Live Test Readiness
          </p>
          <h3 className="mt-2 font-mono text-2xl font-semibold tracking-normal text-white">
            {liveTestReadinessStatusLabel(summary.status)}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">
            Readiness checks reduce operational risk. They do not predict trade
            profitability. Tiny live mode still requires manual Avanza
            confirmation. Ture does not send broker orders.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Intended test mode
          </label>
          <select
            value={selectedMode}
            onChange={(event) =>
              onModeChange(event.target.value as LiveTestReadinessMode)
            }
            className="min-h-11 rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-cyan-200"
          >
            {liveTestReadinessModeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span
            className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${liveTestReadinessStatusTone(
              summary.status,
            )}`}
          >
            {liveTestReadinessModeLabel(summary.mode)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Blockers"
          value={String(summary.blockers.length)}
          tone={summary.blockers.length > 0 ? -1 : 0}
        />
        <SummaryCard
          label="Warnings"
          value={String(summary.warnings.length)}
          tone={summary.warnings.length > 0 ? -1 : 0}
        />
        <SummaryCard
          label="Trade Entry"
          value={summary.trade_entry_allowed_by_readiness ? "Allowed" : "Blocked"}
          tone={summary.trade_entry_allowed_by_readiness ? 1 : -1}
        />
      </div>

      {(summary.blockers.length > 0 || summary.warnings.length > 0) && (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.045] p-3">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-rose-100">
              Key blockers
            </p>
            {summary.blockers.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-300">
                {summary.blockers.slice(0, 4).map((item) => (
                  <li key={item.blocker_id}>{item.message}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                No readiness blockers.
              </p>
            )}
          </div>

          <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.045] p-3">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-amber-100">
              Key warnings
            </p>
            {summary.warnings.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-300">
                {summary.warnings.slice(0, 4).map((item) => (
                  <li key={item.warning_id}>{item.message}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                No readiness warnings.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {categories.map((category) => {
          const checks = summary.checks.filter((item) => item.category === category);

          return (
            <div
              key={category}
              className="rounded-md border border-white/10 bg-black/20 p-4"
            >
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                {liveTestReadinessCategoryLabel(category)}
              </p>
              <div className="mt-3 grid gap-2">
                {checks.map((item) => (
                  <div
                    key={item.check_id}
                    className="flex flex-col gap-2 rounded-md border border-white/10 bg-white/[0.025] p-3 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-zinc-500">
                        {item.message}
                      </p>
                    </div>
                    <span
                      className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${liveTestReadinessStatusTone(
                        item.status,
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {summary.next_actions.length > 0 && (
        <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Recommended next action
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {summary.next_actions.map((item) => (
              <span
                key={item.action_id}
                title={item.message}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  item.priority === "primary"
                    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                    : "border-white/10 bg-white/[0.04] text-zinc-300"
                }`}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-zinc-500">
        A no-trade session can still be a successful test. Closing/selling flows
        remain risk-reducing and are not blocked by new-trade readiness.
      </p>

      <div
        id="trade-live-test-readiness-json"
        data-agent-readable="true"
        className="sr-only"
      >
        {liveTestReadinessSummaryJson(summary)}
      </div>
    </section>
  );
}

const paperSessionProtocolModeOptions: Array<{
  value: PaperSessionProtocolMode;
  label: string;
}> = [
  { value: "real_market_paper", label: "Real-market paper" },
  { value: "demo_rehearsal", label: "Demo rehearsal" },
  { value: "mock_broker_rehearsal", label: "Mock broker rehearsal" },
];

const paperSessionProtocolOutcomeOptions: Array<{
  value: PaperSessionProtocolOutcome;
  label: string;
}> = [
  { value: "not_set", label: "Outcome not set" },
  { value: "no_trade_valid", label: "No-trade valid" },
  { value: "paper_trade_completed", label: "Paper trade completed" },
  { value: "blocked", label: "Blocked" },
  { value: "needs_review", label: "Needs review" },
];

function paperSessionProtocolStatusLabel(status: PaperSessionProtocolStatus) {
  if (status === "ready_to_start") return "Ready to start";
  if (status === "in_progress") return "In progress";
  if (status === "completed") return "Completed";
  if (status === "blocked") return "Blocked";
  if (status === "needs_review") return "Needs review";
  return "Not started";
}

function paperSessionProtocolModeLabel(mode: PaperSessionProtocolMode) {
  if (mode === "demo_rehearsal") return "Demo rehearsal";
  if (mode === "mock_broker_rehearsal") return "Mock broker rehearsal";
  return "Real-market paper";
}

function paperSessionProtocolOutcomeLabel(outcome: PaperSessionProtocolOutcome) {
  if (outcome === "no_trade_valid") return "No-trade valid";
  if (outcome === "paper_trade_completed") return "Paper trade completed";
  if (outcome === "blocked") return "Blocked";
  if (outcome === "needs_review") return "Needs review";
  return "Not set";
}

function paperSessionProtocolTone(
  status: PaperSessionProtocolStatus | PaperSessionProtocolStepStatus,
) {
  if (
    status === "ready_to_start" ||
    status === "completed" ||
    status === "complete"
  ) {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "in_progress" || status === "active") {
    return "border-cyan-300/35 bg-cyan-300/10 text-cyan-100";
  }

  if (status === "needs_review" || status === "warning") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-100";
  }

  if (status === "blocked") {
    return "border-rose-300/35 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

function PaperSessionProtocolPanel({
  summary,
  state,
  onModeChange,
  onStart,
  onStepChange,
  onOutcomeChange,
  onNotesChange,
  onEnd,
  onReset,
}: {
  summary: PaperSessionProtocolSummary;
  state: PaperSessionProtocolLocalState;
  onModeChange: (mode: PaperSessionProtocolMode) => void;
  onStart: () => void;
  onStepChange: (stepId: string, checked: boolean) => void;
  onOutcomeChange: (outcome: PaperSessionProtocolOutcome) => void;
  onNotesChange: (notes: string) => void;
  onEnd: () => void;
  onReset: () => void;
}) {
  const primaryIssue = summary.blockers[0] ?? summary.warnings[0] ?? null;
  const canStart =
    !summary.started_at &&
    !summary.ended_at &&
    summary.status !== "blocked";
  const canEnd = Boolean(summary.started_at && !summary.ended_at);

  return (
    <section className="rounded-lg border border-white/10 bg-black/20 p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Paper Session Protocol
          </p>
          <h3 className="mt-2 font-mono text-2xl font-semibold tracking-normal text-white">
            {paperSessionProtocolStatusLabel(summary.status)}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">
            Paper mode tests process quality, not profitability. Do not place
            real Avanza orders during paper testing. Ture does not send broker
            orders.
          </p>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            A no-trade session can still be a successful test.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:min-w-[260px]">
          <label className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Protocol mode
          </label>
          <select
            value={summary.mode}
            onChange={(event) =>
              onModeChange(event.target.value as PaperSessionProtocolMode)
            }
            className="min-h-11 rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-cyan-200"
          >
            {paperSessionProtocolModeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span
            className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${paperSessionProtocolTone(
              summary.status,
            )}`}
          >
            {paperSessionProtocolModeLabel(summary.mode)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Checklist"
          value={`${summary.completed_step_count}/${summary.total_step_count}`}
          tone={summary.completed_step_count > 0 ? 1 : 0}
        />
        <SummaryCard
          label="Blockers"
          value={String(summary.blockers.length)}
          tone={summary.blockers.length > 0 ? -1 : 0}
        />
        <SummaryCard
          label="Warnings"
          value={String(summary.warnings.length)}
          tone={summary.warnings.length > 0 ? -1 : 0}
        />
        <SummaryCard
          label="Paper Trade"
          value={summary.paper_trade_allowed_by_protocol ? "Allowed" : "Manual gate"}
          tone={summary.paper_trade_allowed_by_protocol ? 1 : 0}
        />
      </div>

      {primaryIssue && (
        <div
          className={`mt-4 rounded-md border p-3 ${
            summary.blockers.length > 0
              ? "border-rose-300/20 bg-rose-300/[0.045]"
              : "border-amber-300/20 bg-amber-300/[0.045]"
          }`}
        >
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
            Current gate
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {primaryIssue.message}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-zinc-600"
        >
          Start local session
        </button>
        <button
          type="button"
          onClick={onEnd}
          disabled={!canEnd}
          className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-zinc-600"
        >
          End session
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-white/20"
        >
          Reset local checklist
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {summary.steps.map((step) => (
          <label
            key={step.step_id}
            className="grid gap-3 rounded-md border border-white/10 bg-white/[0.025] p-3 sm:grid-cols-[24px_1fr_auto]"
          >
            <input
              type="checkbox"
              checked={step.user_completed}
              disabled={!summary.started_at || !step.can_mark_complete}
              onChange={(event) =>
                onStepChange(step.step_id, event.target.checked)
              }
              className="mt-1 h-4 w-4 accent-cyan-300 disabled:opacity-30"
            />
            <span>
              <span className="block text-sm font-semibold text-zinc-100">
                {step.order}. {step.label}
              </span>
              <span className="mt-1 block text-sm leading-6 text-zinc-500">
                {step.summary}
              </span>
            </span>
            <span
              className={`h-fit w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${paperSessionProtocolTone(
                step.status,
              )}`}
            >
              {step.status}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[280px_1fr]">
        <div>
          <label className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Session outcome
          </label>
          <select
            value={state.session_outcome}
            onChange={(event) =>
              onOutcomeChange(event.target.value as PaperSessionProtocolOutcome)
            }
            className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-cyan-200"
          >
            {paperSessionProtocolOutcomeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Current outcome:{" "}
            {paperSessionProtocolOutcomeLabel(summary.outcome)}.
          </p>
        </div>
        <div>
          <label className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Local notes
          </label>
          <textarea
            value={state.notes}
            onChange={(event) => onNotesChange(event.target.value)}
            maxLength={2000}
            rows={4}
            className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm leading-6 text-white outline-none focus:border-cyan-200"
            placeholder="Optional local notes for this paper session."
          />
        </div>
      </div>

      {summary.next_actions.length > 0 && (
        <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Next recommended action
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {summary.next_actions.map((item) => (
              <span
                key={item.action_id}
                title={item.message}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  item.priority === "primary"
                    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                    : "border-white/10 bg-white/[0.04] text-zinc-300"
                }`}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        id="trade-paper-session-protocol-json"
        data-agent-readable="true"
        className="sr-only"
      >
        {paperSessionProtocolSummaryJson(summary)}
      </div>
    </section>
  );
}

type LifecycleStepTone = "ready" | "current" | "pending" | "warning" | "blocked";

function lifecycleStepToneClassName(tone: LifecycleStepTone) {
  if (tone === "ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (tone === "current") {
    return "border-cyan-300/35 bg-cyan-300/10 text-cyan-100";
  }

  if (tone === "warning") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-100";
  }

  if (tone === "blocked") {
    return "border-rose-300/35 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-black/20 text-zinc-400";
}

function lifecycleToneFromPackageStatus(
  status: string | null | undefined,
): LifecycleStepTone {
  if (status === "ready" || status === "passed" || status === "valid") {
    return "ready";
  }
  if (status === "warning" || status === "unknown" || status === "unavailable") {
    return "warning";
  }
  if (status === "blocked" || status === "failed") return "blocked";
  return "pending";
}

function LifecycleProgressStrip({
  title,
  steps,
  safetyNote,
}: {
  title: string;
  steps: Array<{
    label: string;
    detail: string;
    tone: LifecycleStepTone;
  }>;
  safetyNote: string;
}) {
  return (
    <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{safetyNote}</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
          Prepare-only
        </span>
      </div>

      <div className="mt-4 grid gap-2 lg:grid-cols-5">
        {steps.map((step, index) => (
          <div
            key={`${step.label}-${index}`}
            className={`rounded-md border p-3 ${lifecycleStepToneClassName(
              step.tone,
            )}`}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
              Step {index + 1}
            </p>
            <p className="mt-1 text-sm font-semibold">{step.label}</p>
            <p className="mt-1 text-xs leading-5 opacity-80">{step.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function fillCaptureReviewTone(status: FillCaptureReviewStatus) {
  if (status === "ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "needs_review") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (status === "blocked") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.035] text-zinc-400";
}

function mockBrokerFillImportTone(status: MockBrokerFillImportResult["status"]) {
  if (status === "ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "needs_review") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function mockBrokerFillImportLabel(status: MockBrokerFillImportResult["status"]) {
  if (status === "needs_review") return "Needs review";
  if (status === "blocked") return "Blocked";
  if (status === "invalid") return "Invalid";
  return "Ready";
}

function MockBrokerFillImportPanel({
  title,
  actionLabel,
  value,
  onChange,
  onLoadLatest,
  onImport,
  result,
}: {
  title: string;
  actionLabel: string;
  value: string;
  onChange: (value: string) => void;
  onLoadLatest: () => void;
  onImport: () => void;
  result: MockBrokerFillImportResult | null;
}) {
  return (
    <div className="mt-4 rounded-md border border-cyan-300/20 bg-cyan-300/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Mock broker fills are test data. This does not prove Avanza execution and does not
            create, close, or save any Ture trade automatically.
          </p>
        </div>
        <DataModePillRow
          badges={[
            dataModeBadgeForMode("mock_broker"),
            dataModeBadgeForExecutionReality("mock_only"),
          ]}
        />
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        placeholder="Paste mock broker fill confirmation JSON..."
        className="mt-4 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs leading-5 text-white outline-none placeholder:text-zinc-600 focus:border-cyan-200"
      />

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onLoadLatest();
          }}
          className="min-h-10 flex-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/25 hover:text-white"
        >
          LOAD LATEST MOCK FILL FROM LOCALSTORAGE
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onImport();
          }}
          className="min-h-10 flex-1 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/70"
        >
          {actionLabel}
        </button>
      </div>

      {result && (
        <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                Import status
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {result.next_action}
              </p>
            </div>
            <span
              className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${mockBrokerFillImportTone(
                result.status,
              )}`}
            >
              {mockBrokerFillImportLabel(result.status)}
            </span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Detail label="Side" value={result.side} />
            <Detail
              label="Blockers"
              value={String(result.blockers.length)}
            />
            <Detail
              label="Warnings"
              value={String(result.warnings.length)}
            />
          </div>

          {(result.blockers.length > 0 || result.warnings.length > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.035] p-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                  Blockers
                </p>
                {result.blockers.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                    {result.blockers.map((blocker) => (
                      <li key={blocker.id}>{blocker.message}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
                )}
              </div>
              <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                  Warnings
                </p>
                {result.warnings.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                    {result.warnings.map((warning) => (
                      <li key={warning.id}>{warning.message}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function fillCaptureReviewLabel(status: FillCaptureReviewStatus) {
  if (status === "needs_review") return "Needs review";
  if (status === "blocked") return "Blocked";
  if (status === "incomplete") return "Incomplete";
  return "Ready";
}

function FillCaptureReviewPanel({
  title,
  review,
}: {
  title: string;
  review: FillCaptureReview;
}) {
  const visibleFields = review.fields.filter(
    (field) => field.required || field.value !== "—",
  );
  const visibleChecks = review.checks.slice(0, 6);

  return (
    <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Read-only review of the broker data currently entered in Ture. It
            does not change fields or submit anything.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${fillCaptureReviewTone(
            review.status,
          )}`}
        >
          {fillCaptureReviewLabel(review.status)}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Detail
          label="Confidence"
          value={`${review.confidence_label.toUpperCase()} · ${review.confidence_score}/100`}
        />
        <Detail
          label="Blockers"
          value={String(review.blockers.length)}
        />
        <Detail
          label="Warnings"
          value={String(review.warnings.length)}
        />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {visibleFields.map((field) => (
          <div
            key={field.field_id}
            className={`rounded-md border p-3 ${fillCaptureReviewTone(
              field.status === "blocked"
                ? "blocked"
                : field.status === "warning"
                  ? "needs_review"
                  : field.status === "missing"
                    ? "incomplete"
                    : "ready",
            )}`}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
              {field.label}
            </p>
            <p className="mt-1 truncate text-sm font-semibold">{field.value}</p>
          </div>
        ))}
      </div>

      {(review.blockers.length > 0 || review.warnings.length > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
              Blockers
            </p>
            {review.blockers.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                {review.blockers.map((blocker) => (
                  <li key={blocker.blocker_id}>{blocker.message}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
            )}
          </div>
          <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
              Warnings
            </p>
            {review.warnings.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                {review.warnings.map((warning) => (
                  <li key={warning.warning_id}>{warning.message}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
          Next Action
        </p>
        <p className="mt-2 text-sm font-semibold text-zinc-100">
          {review.next_action_label}
        </p>
        <p className="mt-1 text-sm leading-6 text-zinc-400">
          {review.next_action_description}
        </p>
      </div>

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          View review checks
        </summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {visibleChecks.map((check) => (
            <Detail
              key={check.check_id}
              label={check.label}
              value={`${check.status.replaceAll("_", " ")} · ${check.message}`}
            />
          ))}
        </div>
      </details>
    </div>
  );
}

function tureCompletionPolicyTone(decision: TureAgentCompletionDecision) {
  if (decision === "allowed_future_agent_completion") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (decision === "human_review_required") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (decision === "blocked") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.035] text-zinc-400";
}

function tureCompletionPolicyLabel(decision: TureAgentCompletionDecision) {
  if (decision === "allowed_future_agent_completion") {
    return "Future allowed";
  }

  if (decision === "human_review_required") {
    return "Human review";
  }

  if (decision === "blocked") {
    return "Blocked";
  }

  return "Not applicable";
}

function TureAgentCompletionPolicyPanel({
  title,
  policy,
}: {
  title: string;
  policy: TureAgentCompletionPolicy;
}) {
  const visibleConditions = policy.conditions.slice(0, 6);
  const missingConditions = policy.conditions.filter(
    (condition) =>
      condition.status === "blocked" || condition.status === "warning",
  );

  return (
    <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            This is policy only. Automatic Ture completion is not enabled.
            Avanza final KÖP/SÄLJ confirmation remains human-only.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${tureCompletionPolicyTone(
            policy.decision,
          )}`}
        >
          {tureCompletionPolicyLabel(policy.decision)}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <Detail
          label="Target Action"
          value={policy.target_action.replaceAll("_", " ")}
        />
        <Detail label="Conditions Met" value={String(policy.machine_summary.met_count)} />
        <Detail label="Blockers" value={String(policy.blockers.length)} />
        <Detail label="Warnings" value={String(policy.warnings.length)} />
      </div>

      <p className="mt-4 rounded-md border border-white/10 bg-black/25 p-3 text-sm leading-6 text-zinc-300">
        {policy.human_summary}
      </p>

      {missingConditions.length > 0 && (
        <div className="mt-4 rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
            Conditions Requiring Attention
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
            {missingConditions.slice(0, 4).map((condition) => (
              <li key={condition.condition_id}>{condition.message}</li>
            ))}
          </ul>
        </div>
      )}

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          View policy conditions
        </summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {visibleConditions.map((condition) => (
            <Detail
              key={condition.condition_id}
              label={condition.label}
              value={`${condition.status.replaceAll("_", " ")} · ${
                condition.message
              }`}
            />
          ))}
        </div>
      </details>
    </div>
  );
}

function AvanzaFieldVerificationPanel({
  title,
  report,
  onCopy,
}: {
  title: string;
  report: AvanzaFieldVerificationReport;
  onCopy: () => void;
}) {
  const statusClassName =
    report.overall_status === "ready"
      ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
      : report.overall_status === "warning"
        ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
        : "border-rose-300/30 bg-rose-300/10 text-rose-100";

  return (
    <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Manual verification notes can improve prepare-only readiness, but
            never order submission. Future agents must stop before final
            confirmation.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${statusClassName}`}
        >
          {report.overall_status}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Verified" value={String(report.verified_count)} />
        <Detail label="Assumed" value={String(report.assumed_count)} />
        <Detail label="Unknown" value={String(report.unknown_count)} />
        <Detail label="Blocked" value={String(report.blocked_count)} />
        <Detail
          label="Manual Notes"
          value={report.manual_notes_applied ? "Applied" : "Not applied"}
        />
        <Detail
          label="Verified From Notes"
          value={String(report.verified_from_manual_notes_count)}
        />
        <Detail
          label="Notes Updated"
          value={recommendationDetailsValue(report.notes_updated_at)}
        />
        <Detail
          label="Can Prepare"
          value={report.can_future_agent_prepare_form ? "Yes" : "No"}
        />
        <Detail label="Can Submit" value="No" />
        <Detail label="Human Final Confirmation" value="Required" />
        <Detail
          label="Critical Blockers"
          value={String(report.blockers.length)}
        />
      </div>

      <p className="mt-3 rounded-md border border-cyan-300/15 bg-cyan-300/[0.045] p-3 text-sm leading-6 text-cyan-100/90">
        {report.can_future_agent_prepare_form
          ? "Prepare-only readiness is available from manual notes. Final Avanza confirmation remains human-only."
          : "Prepare-only readiness is still blocked until required manual Avanza notes are verified."}
      </p>

      {(report.blockers.length > 0 || report.warnings.length > 0) && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
              Blockers
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
              {report.blockers.slice(0, 4).map((blocker) => (
                <li key={blocker.blocker_id}>{blocker.message}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
              Warnings
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
              {report.warnings.slice(0, 4).map((warning) => (
                <li key={warning.warning_id}>{warning.message}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onCopy();
          }}
          className="min-h-10 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/70"
        >
          {report.side === "BUY"
            ? "COPY AVANZA BUY FIELD VERIFICATION JSON"
            : "COPY AVANZA SELL FIELD VERIFICATION JSON"}
        </button>
      </div>

      <details className="mt-3 rounded-md border border-white/10 bg-black/30 p-3">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          View Avanza field verification JSON
        </summary>
        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-300">
          {avanzaFieldVerificationReportJson(report)}
        </pre>
      </details>
    </div>
  );
}

function riskControlsTone(status: RiskControlsStatus) {
  if (status === "ok") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (status === "blocked") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.035] text-zinc-400";
}

function RiskControlsEvaluationPanel({
  title,
  evaluation,
}: {
  title: string;
  evaluation: RiskControlsEvaluation | null;
}) {
  if (!evaluation) {
    return null;
  }

  const visibleWarnings = evaluation.warnings.slice(0, 4);
  const visibleBlockers = evaluation.blockers.slice(0, 4);

  return (
    <div className="mt-4 rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-amber-100">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Risk controls are advisory unless strict mode blocks new trade
            creation. They never block closing or selling a live trade.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${riskControlsTone(
            evaluation.status,
          )}`}
        >
          {evaluation.status}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Mode" value={evaluation.mode.replaceAll("_", " ")} />
        <Detail
          label="Open Positions"
          value={
            evaluation.snapshot.open_positions_count === null
              ? "—"
              : String(evaluation.snapshot.open_positions_count)
          }
        />
        <Detail
          label="Daily PnL"
          value={formatSignedCurrency(evaluation.snapshot.daily_realized_pnl)}
        />
        <Detail
          label="Daily R"
          value={formatSignedR(evaluation.snapshot.daily_realized_r)}
        />
        <Detail
          label="Planned Risk"
          value={formatCurrency(evaluation.snapshot.planned_risk_amount)}
        />
        <Detail
          label="Blocks New Trade"
          value={evaluation.blocks_new_trade ? "Yes" : "No"}
        />
        <Detail
          label="Warnings"
          value={String(evaluation.warnings.length)}
        />
        <Detail
          label="Blockers"
          value={String(evaluation.blockers.length)}
        />
      </div>

      {(visibleBlockers.length > 0 || visibleWarnings.length > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
              Blockers
            </p>
            {visibleBlockers.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                {visibleBlockers.map((blocker) => (
                  <li key={blocker.blocker_id}>{blocker.message}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
            )}
          </div>
          <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
              Warnings
            </p>
            {visibleWarnings.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                {visibleWarnings.map((warning) => (
                  <li key={warning.warning_id}>{warning.message}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
          Next Action
        </p>
        <p className="mt-2 text-sm font-semibold text-zinc-100">
          {evaluation.next_action_label}
        </p>
        <p className="mt-1 text-sm leading-6 text-zinc-400">
          {evaluation.next_action_description}
        </p>
      </div>
    </div>
  );
}

function DemoTradingFlowTools({
  recommendationCount,
  activePositionCount,
  closedPositionCount,
  lastAction,
  onCreateDemoRecommendation,
  onClearDemoData,
}: {
  recommendationCount: number;
  activePositionCount: number;
  closedPositionCount: number;
  lastAction: string;
  onCreateDemoRecommendation: () => void;
  onClearDemoData: () => void;
}) {
  return (
    <details className="rounded-lg border border-amber-300/20 bg-amber-300/[0.045] p-4">
      <summary className="cursor-pointer font-mono text-xs font-bold uppercase tracking-[0.16em] text-amber-100">
        Developer / Demo Tools
      </summary>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <DemoBadge />
            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              LocalStorage only
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            Demo tools create local/test trade data only. They do not contact
            brokers, control a browser, or submit orders.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Detail
              label="Demo Recommendations"
              value={String(recommendationCount)}
            />
            <Detail label="Demo Live Trades" value={String(activePositionCount)} />
            <Detail label="Demo History" value={String(closedPositionCount)} />
            <Detail label="Last Demo Action" value={lastAction} />
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCreateDemoRecommendation();
              }}
              className="min-h-10 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-100 transition hover:border-emerald-200/70"
            >
              CREATE DEMO RECOMMENDATION
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClearDemoData();
              }}
              className="min-h-10 rounded-md border border-rose-300/30 bg-rose-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-200/70"
            >
              CLEAR DEMO DATA
            </button>
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/20 p-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
            Manual E2E Test
          </p>
          <ol className="mt-3 space-y-1 text-sm leading-6 text-zinc-400">
            <li>1. Create demo recommendation</li>
            <li>2. Open demo recommendation</li>
            <li>3. Click ADD TRADE</li>
            <li>4. Prefill demo buy fill</li>
            <li>5. Create Live Day Trade</li>
            <li>6. Open Live Day Trades</li>
            <li>7. Confirm live guidance</li>
            <li>8. Click Prepare Sell Order / Close Trade</li>
            <li>9. Prefill demo sell exit</li>
            <li>10. Close trade from broker exit fill</li>
            <li>11. Verify History</li>
            <li>12. Verify Statistics</li>
          </ol>
          <p className="mt-3 rounded-md border border-white/10 bg-black/25 p-3 text-xs leading-5 text-zinc-500">
            After completing the demo lifecycle, verify the closed demo trade
            appears in History and Statistics. Demo data is localStorage-only: no
            Avanza contact, no broker order, no order submission.
          </p>
        </div>
      </div>
    </details>
  );
}

function recommendationOutcomeEvaluationStatusTone(
  status: RecommendationOutcomeEvaluationDiagnostics["status"],
) {
  if (status === "completed") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "running" || status === "partial") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }

  if (status === "failed" || status === "blocked") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

function RecommendationOutcomeEvaluationRunnerPanel({
  diagnostics,
  isRunning,
  onEvaluate,
}: {
  diagnostics: RecommendationOutcomeEvaluationDiagnostics;
  isRunning: boolean;
  onEvaluate: () => void;
}) {
  return (
    <details className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
      <summary className="cursor-pointer font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
        Recommendation Outcome Evaluation
      </summary>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.75fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${recommendationOutcomeEvaluationStatusTone(
                diagnostics.status,
              )}`}
            >
              {diagnostics.status}
            </span>
            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              {diagnostics.persistenceMode}
            </span>
            {diagnostics.snapshotOnly && (
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
                snapshot-only
              </span>
            )}
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            {diagnostics.summary}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Detail
              label="Eligible"
              value={String(diagnostics.eligibleSnapshots)}
            />
            <Detail
              label="Evaluated"
              value={String(diagnostics.evaluatedSnapshots)}
            />
            <Detail
              label="Missing Candles"
              value={String(diagnostics.incompleteDueToMissingCandles)}
            />
            <Detail
              label="Provider Errors"
              value={String(diagnostics.providerErrors)}
            />
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/20 p-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
            Runner
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Horizons:{" "}
            {diagnostics.horizonsEvaluated.length > 0
              ? diagnostics.horizonsEvaluated.join(", ")
              : "15m, 30m, 60m"}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Last run:{" "}
            {diagnostics.lastRunTimestamp
              ? formatDate(diagnostics.lastRunTimestamp)
              : "—"}
          </p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEvaluate();
            }}
            disabled={isRunning}
            className="mt-4 min-h-10 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? "Evaluating" : "Evaluate recent recommendation outcomes"}
          </button>
          <p className="mt-3 text-xs leading-5 text-zinc-500">
            Uses existing intraday market data only. No scoring, filtering, trade
            creation, broker contact, or order submission is changed.
          </p>
        </div>
      </div>
    </details>
  );
}

function recommendationDetailsValue(value: unknown) {
  const normalized = displayValue(value);
  return normalized === "Not available" || normalized === "Not set"
    ? "—"
    : normalized;
}

function recommendationDetailsCurrency(value: number | null | undefined) {
  return recommendationDetailsValue(formatCurrency(value));
}

function recommendationDetailsShares(value: number | null | undefined) {
  return recommendationDetailsValue(formatShares(value));
}

function RecommendationDetailsPill({
  label,
  tone,
}: {
  label: string;
  tone: "positive" | "warning" | "danger" | "neutral";
}) {
  return (
    <span
      className={`trade-recommendation-details-pill ${recommendationDetailsToneClassName(
        tone,
      )}`}
    >
      {recommendationDetailsValue(label)}
    </span>
  );
}

function RecommendationDetailsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="trade-recommendation-details-section">
      <div className="trade-recommendation-details-section__title">
        <span aria-hidden="true" className="trade-recommendation-details-section__icon">
          <Image
            src="/trade-assets/chevron-icn.svg"
            alt=""
            width={10}
            height={10}
          />
        </span>
        <h3>{title}</h3>
      </div>
      <div className="trade-recommendation-details-section__body">{children}</div>
    </section>
  );
}

function RecommendationDetailsMetricGrid({
  metrics,
  variant = "default",
}: {
  metrics: Array<{ label: string; value: string; tone?: number | null }>;
  variant?: "default" | "wide";
}) {
  return (
    <div
      className={`trade-recommendation-details-metrics ${
        variant === "wide" ? "trade-recommendation-details-metrics--wide" : ""
      }`}
    >
      {metrics.map((metric) => (
        <div key={metric.label} className="trade-recommendation-details-metric">
          <div className="trade-recommendation-details-metric__label">
            {recommendationDetailsValue(metric.label).toUpperCase()}
          </div>
          <div
            className={`trade-recommendation-details-metric__value ${
              metric.tone === undefined || metric.tone === null || metric.tone === 0
                ? ""
                : metric.tone > 0
                  ? "trade-recommendation-details-metric__value--positive"
                  : "trade-recommendation-details-metric__value--negative"
            }`}
          >
            {recommendationDetailsValue(metric.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

function RecommendationDetailsTextCard({
  label,
  children,
  pill,
}: {
  label: string;
  children: React.ReactNode;
  pill?: React.ReactNode;
}) {
  return (
    <div className="trade-recommendation-details-text-card">
      <div className="trade-recommendation-details-text-card__header">
        <span className="trade-recommendation-details-text-card__label">
          {recommendationDetailsValue(label).toUpperCase()}
        </span>
        {pill}
      </div>
      <div className="trade-recommendation-details-text-card__content">
        {children}
      </div>
    </div>
  );
}

function recommendationQuickRiskLabel(
  level: PreTradeRiskContextResult["level"],
) {
  if (level === "avoid") return "Risky avoid";
  if (level === "caution") return "Risky";
  return `Risk ${level}`;
}

function RecommendationDetailsTextStack({
  items,
  empty,
  tone = "neutral",
}: {
  items: string[];
  empty: string;
  tone?: "neutral" | "warning";
}) {
  const visibleItems = items.map((item) => recommendationDetailsValue(item)).filter(
    (item) => item !== "—",
  );

  if (visibleItems.length === 0) {
    return <p>{empty}</p>;
  }

  return (
    <div
      className={`trade-recommendation-details-text-stack ${
        tone === "warning" ? "trade-recommendation-details-text-stack--warning" : ""
      }`}
    >
      {visibleItems.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  );
}

function RecommendationDetailsDecisionItem({
  label,
  summary,
  detail,
  pill,
}: {
  label: string;
  summary: string;
  detail?: string;
  pill?: React.ReactNode;
}) {
  return (
    <div className="trade-recommendation-details-decision-item">
      <div>
        <h4>{recommendationDetailsValue(label)}</h4>
        <p className="trade-recommendation-details-decision-item__copy">
          {recommendationDetailsValue(summary)}
        </p>
        {detail && (
          <span className="trade-recommendation-details-decision-item__copy">
            {recommendationDetailsValue(detail)}
          </span>
        )}
      </div>
      {pill}
    </div>
  );
}

function RecommendationDetailsContextCard({
  label,
  pill,
  children,
  rows,
  footer,
}: {
  label: string;
  pill?: React.ReactNode;
  children: React.ReactNode;
  rows?: React.ReactNode;
  footer?: string;
}) {
  return (
    <div className="trade-recommendation-details-context-card">
      <div className="trade-recommendation-details-context-card__header">
        <span className="trade-recommendation-details-context-card__label">
          {recommendationDetailsValue(label).toUpperCase()}
        </span>
        {pill}
      </div>
      <div className="trade-recommendation-details-context-card__content">
        {children}
      </div>
      {rows ? (
        <div className="trade-recommendation-details-context-rows">{rows}</div>
      ) : null}
      {footer ? (
        <p className="trade-recommendation-details-context-card__footer">
          {recommendationDetailsValue(footer)}
        </p>
      ) : null}
    </div>
  );
}

function RecommendationDetailsContextRow({
  label,
  summary,
  detail,
  pill,
}: {
  label: string;
  summary: string;
  detail?: string;
  pill?: React.ReactNode;
}) {
  return (
    <div className="trade-recommendation-details-context-row">
      <div>
        <h4>{recommendationDetailsValue(label)}</h4>
        <p className="trade-recommendation-details-context-row__copy">
          {recommendationDetailsValue(summary)}
        </p>
        {detail && (
          <span className="trade-recommendation-details-context-row__copy">
            {recommendationDetailsValue(detail)}
          </span>
        )}
      </div>
      {pill}
    </div>
  );
}

function RecommendationDetailsModal({
  recommendation,
  calibrationGuardrails,
  preTradeRiskContext,
  tradeEligibility,
  decisionStack,
  positionSizing,
  freshness,
  addTradeGateMessage,
  confirmation,
  confidenceBreakdownItems,
  keyReasons,
  onClose,
}: {
  recommendation: Recommendation;
  calibrationGuardrails: CalibrationGuardrailResult | null;
  preTradeRiskContext: PreTradeRiskContextResult | null;
  tradeEligibility: TradeEligibilityResult | null;
  decisionStack: RecommendationDecisionStackResult | null;
  positionSizing: PositionSizing;
  freshness: string;
  addTradeGateMessage: string;
  confirmation: IntradayConfirmationStatus;
  confidenceBreakdownItems: Array<[string, number]>;
  keyReasons: { positive: string[]; warnings: string[] };
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const quickDecision =
    decisionStack?.primary_warning ||
    addTradeGateMessage ||
    decisionStack?.summary ||
    keyReasons.positive[0] ||
    recommendation.thesis ||
    "Review the trade plan, then use Make Trade for the existing validation flow.";
  const indicators = recommendation.intradayIndicators;
  const confidenceScoreLabel =
    recommendation.confidenceScore === null
      ? "—"
      : `${recommendation.confidenceScore}/100`;
  const calibrationSeverity =
    calibrationGuardrails?.guardrails.some(
      (guardrail) => guardrail.severity === "warning",
    )
      ? "warning"
      : calibrationGuardrails?.guardrails.some(
            (guardrail) => guardrail.severity === "caution",
          )
        ? "caution"
        : "info";
  const recommendationSourceBadges = [
    isDemoRecommendation(recommendation)
      ? dataModeBadgeForMode("demo")
      : freshness === "stale" || freshness === "expired"
        ? dataModeBadgeForMode("stale_market_data")
        : dataModeBadgeForMode("supabase_record"),
    dataModeBadgeForExecutionReality(
      isDemoRecommendation(recommendation)
        ? "demo_only"
        : "human_confirmed_required",
    ),
  ];

  return (
    <div
      className="trade-recommendation-details-backdrop"
      role="presentation"
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <section
        aria-labelledby="trade-recommendation-details-title"
        aria-modal="true"
        className="trade-recommendation-details-modal"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="trade-recommendation-details-titlebar">
          <h2 id="trade-recommendation-details-title">Recommendation Details</h2>
          <button
            type="button"
            aria-label="Close recommendation details"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className="trade-recommendation-details-close"
          >
            <Image
              src="/trade-assets/x-icn.svg"
              alt=""
              aria-hidden="true"
              width={29}
              height={29}
            />
          </button>
        </div>

        <div className="trade-recommendation-details-scroll">
          <header className="trade-recommendation-details-header">
            <CompanyIdentity
              ticker={recommendation.ticker}
              companyName={recommendation.companyName}
              size="live"
            />
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <DataModePillRow badges={recommendationSourceBadges} />
              <span
                className={`trade-recommendation-confidence-pill trade-recommendation-confidence-pill--${recommendationConfidenceTier(
                  recommendation,
                )}`}
              >
                {recommendationConfidenceLabel(recommendation)}
              </span>
            </div>
          </header>

          <RecommendationDetailsSection title="Quick Decision">
            <div className="trade-recommendation-details-quick-decision">
              <div className="trade-recommendation-details-guidance">
                <div>
                  <p>{recommendationDetailsValue(quickDecision)}</p>
                  <span className="trade-recommendation-details-guidance__timestamp">
                    Updated {recommendationDetailsValue(recommendation.createdAt)}
                  </span>
                </div>
                <div className="trade-recommendation-details-pill-row trade-recommendation-details-pill-row--quick">
                  {decisionStack && (
                    <RecommendationDetailsPill
                      label={`Stack ${decisionStack.overall_status}`}
                      tone={recommendationDetailsToneFromDecisionStatus(
                        decisionStack.overall_status,
                      )}
                    />
                  )}
                  {tradeEligibility && (
                    <RecommendationDetailsPill
                      label={tradeEligibility.status.replaceAll("_", " ")}
                      tone={recommendationQuickDecisionToneFromEligibility(
                        tradeEligibility.status,
                      )}
                    />
                  )}
                  {preTradeRiskContext && (
                    <RecommendationDetailsPill
                      label={recommendationQuickRiskLabel(preTradeRiskContext.level)}
                      tone={recommendationDetailsToneFromRiskContext(
                        preTradeRiskContext.level,
                      )}
                    />
                  )}
                </div>
              </div>
              <div className="trade-recommendation-details-two-column">
                <RecommendationDetailsTextCard label="Why This Setup">
                  <RecommendationDetailsTextStack
                    items={keyReasons.positive}
                    empty="No strong positive reasons surfaced."
                  />
                </RecommendationDetailsTextCard>
                <RecommendationDetailsTextCard label="Main Risk / Red Flags">
                  <RecommendationDetailsTextStack
                    items={keyReasons.warnings}
                    empty="No major red flags surfaced from current advisory layers."
                    tone="warning"
                  />
                </RecommendationDetailsTextCard>
              </div>
            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="Trade Plan">
            <div className="trade-recommendation-details-trade-plan">
              <RecommendationDetailsMetricGrid
                metrics={[
                  { label: "Entry", value: recommendation.entryZone },
                  { label: "Stop", value: recommendation.stopLoss },
                  { label: "Target", value: recommendation.target1 },
                  { label: "Reward : Risk", value: recommendation.riskReward },
                  {
                    label: "Shares",
                    value: recommendationDetailsShares(
                      positionSizing.suggestedShares,
                    ),
                  },
                  {
                    label: "Position Value",
                    value: recommendationDetailsCurrency(
                      positionSizing.suggestedPositionValue,
                    ),
                  },
                  {
                    label: "Max Loss",
                    value: recommendationDetailsCurrency(
                      positionSizing.maxLossAtStop,
                    ),
                  },
                  {
                    label: "Risk/share",
                    value: recommendationDetailsCurrency(positionSizing.riskPerShare),
                  },
                ]}
              />
              <div
                className="trade-recommendation-details-trade-plan__divider"
                aria-hidden="true"
              />
              <RecommendationDetailsMetricGrid
                variant="wide"
                metrics={[
                  { label: "Direction", value: recommendation.direction },
                  {
                    label: "Setup Type",
                    value: getSetupTypeLabel(recommendation.setupType),
                  },
                  { label: "Freshness", value: freshness },
                  {
                    label: "Confidence",
                    value: confidenceScoreLabel,
                  },
                ]}
              />
            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="Decision Details">
            <div className="trade-recommendation-details-stack trade-recommendation-details-stack--decision">
              <RecommendationDetailsTextCard
                label="Recommendation Decision Stack"
                pill={
                  decisionStack ? (
                    <RecommendationDetailsPill
                      label={decisionStack.overall_status}
                      tone={recommendationDetailsToneFromDecisionStatus(
                        decisionStack.overall_status,
                      )}
                    />
                  ) : undefined
                }
              >
                <p>
                  {recommendationDetailsValue(
                    decisionStack?.summary ?? "Decision stack is unavailable.",
                  )}
                </p>
                {decisionStack?.title && <p>{recommendationDetailsValue(decisionStack.title)}</p>}
              </RecommendationDetailsTextCard>

              {decisionStack?.items.map((item) => (
                <RecommendationDetailsDecisionItem
                  key={item.type}
                  label={item.label}
                  summary={item.summary}
                  detail={item.detail}
                  pill={
                    <RecommendationDetailsPill
                      label={item.status}
                      tone={recommendationDetailsToneFromDecisionStatus(item.status)}
                    />
                  }
                />
              ))}

              <div
                className="trade-recommendation-details-dashed-divider"
                aria-hidden="true"
              />

              <RecommendationDetailsTextCard
                label="Intraday Confirmation"
                pill={
                  <RecommendationDetailsPill
                    label={intradayConfirmationLabel(confirmation.status)}
                    tone={recommendationDetailsToneFromConfirmation(
                      confirmation.status,
                    )}
                  />
                }
              >
                <p>
                  {indicators
                    ? `VWAP ${vwapLabel(indicators)}, Price vs VWAP ${formatSignedPercent(
                        indicators.priceVsVwapPercent,
                      )}, Momentum ${titleCaseValue(
                        indicators.momentumDirection,
                      )}, Volume ${titleCaseValue(indicators.volumeTrend)}`
                    : "Intraday confirmation unavailable."}
                </p>
                {confirmation.reasons.length > 0 && (
                  <p>{confirmation.reasons.slice(0, 3).join(" ")}</p>
                )}
              </RecommendationDetailsTextCard>

              {recommendation.confidenceBreakdown && (
                <div className="trade-recommendation-details-score-grid">
                  {confidenceBreakdownItems.map(([label, score]) => (
                    <div
                      key={label}
                      className="trade-recommendation-details-score"
                    >
                      <span>{label}</span>
                      <strong
                        className={`trade-recommendation-details-score__value trade-recommendation-details-score__value--${recommendationDetailsToneFromConfidence(
                          score,
                        )}`}
                      >
                        {score}
                      </strong>
                    </div>
                  ))}
                </div>
              )}

              {(recommendation.confidenceReasoning ||
                recommendation.riskFlags.length > 0) && (
                <>
                  <div
                    className="trade-recommendation-details-dashed-divider"
                    aria-hidden="true"
                  />
                  <div className="trade-recommendation-details-two-column trade-recommendation-details-two-column--flush">
                    {recommendation.confidenceReasoning && (
                      <RecommendationDetailsTextCard label="Confidence Reasoning">
                        <p>
                          {recommendationDetailsValue(
                            recommendation.confidenceReasoning,
                          )}
                        </p>
                      </RecommendationDetailsTextCard>
                    )}
                    {recommendation.riskFlags.length > 0 && (
                      <RecommendationDetailsTextCard label="Risk Flags">
                        <RecommendationDetailsTextStack
                          items={recommendation.riskFlags}
                          empty="—"
                          tone="warning"
                        />
                      </RecommendationDetailsTextCard>
                    )}
                  </div>
                </>
              )}
            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="More Trade Context">
            <div className="trade-recommendation-details-context-stack">
              {preTradeRiskContext ? (
                <RecommendationDetailsContextCard
                  label="Pre-Trade Risk Context"
                  pill={
                    <RecommendationDetailsPill
                      label={preTradeRiskContext.level}
                      tone={recommendationDetailsToneFromRiskContext(
                        preTradeRiskContext.level,
                      )}
                    />
                  }
                  rows={
                    preTradeRiskContext.signals.length > 0
                      ? preTradeRiskContext.signals.slice(0, 5).map((signal) => (
                          <RecommendationDetailsContextRow
                            key={signal.code}
                            label={signal.title}
                            summary={signal.description}
                            pill={
                              <RecommendationDetailsPill
                                label={signal.level}
                                tone={recommendationDetailsToneFromRiskContext(
                                  signal.level,
                                )}
                              />
                            }
                          />
                        ))
                      : undefined
                  }
                  footer="Advisory only. Making the trade still uses the normal validation gate and this panel does not change scoring, risk settings, or broker flow."
                >
                  <p>{recommendationDetailsValue(preTradeRiskContext.title)}</p>
                  <p>{recommendationDetailsValue(preTradeRiskContext.summary)}</p>
                  <p>
                    {recommendationDetailsValue(
                      preTradeRiskContext.suggested_action,
                    )}
                  </p>
                </RecommendationDetailsContextCard>
              ) : (
                <RecommendationDetailsContextCard label="Pre-Trade Risk Context">
                  <p>—</p>
                </RecommendationDetailsContextCard>
              )}

              {tradeEligibility ? (
                <RecommendationDetailsContextCard
                  label="Trade Eligibility"
                  pill={
                    <RecommendationDetailsPill
                      label={tradeEligibility.status.replaceAll("_", " ")}
                      tone={recommendationDetailsToneFromEligibility(
                        tradeEligibility.status,
                      )}
                    />
                  }
                  rows={
                    tradeEligibility.signals.length > 0
                      ? tradeEligibility.signals.slice(0, 5).map((signal) => (
                          <RecommendationDetailsContextRow
                            key={signal.code}
                            label={signal.label}
                            summary={signal.description}
                            pill={
                              <RecommendationDetailsPill
                                label={signal.impact}
                                tone={
                                  signal.impact === "positive"
                                    ? "positive"
                                    : signal.impact === "neutral"
                                      ? "neutral"
                                      : signal.impact === "warning"
                                        ? "warning"
                                        : "danger"
                                }
                              />
                            }
                          />
                        ))
                      : undefined
                  }
                  footer={`${
                    tradeEligibility.can_attempt_add_trade
                      ? "Making the trade still runs normal validation."
                      : "Existing gate/freshness rules prevent ADD TRADE."
                  } This summary is decision support only and adds no new blocking rules.`}
                >
                  <p>{recommendationDetailsValue(tradeEligibility.title)}</p>
                  <p>{recommendationDetailsValue(tradeEligibility.summary)}</p>
                  <p>
                    {tradeEligibility.can_attempt_add_trade
                      ? "Making the trade still runs normal validation."
                      : "Existing gate/freshness rules prevent ADD TRADE."}{" "}
                    This summary is decision support only and adds no new blocking
                    rules.
                  </p>
                </RecommendationDetailsContextCard>
              ) : (
                <RecommendationDetailsContextCard label="Trade Eligibility">
                  <p>—</p>
                </RecommendationDetailsContextCard>
              )}

              {calibrationGuardrails && calibrationGuardrails.guardrails.length > 0 ? (
                <RecommendationDetailsContextCard
                  label="Calibration Guardrails"
                  pill={
                    <RecommendationDetailsPill
                      label={calibrationSeverity === "info" ? "advisory" : calibrationSeverity}
                      tone={recommendationDetailsToneFromCalibration(
                        calibrationSeverity,
                      )}
                    />
                  }
                  rows={calibrationGuardrails.guardrails
                    .slice(0, 5)
                    .map((guardrail) => (
                      <RecommendationDetailsContextRow
                        key={`${guardrail.code}-${guardrail.scope}`}
                        label={guardrail.title}
                        summary={guardrail.description}
                        detail={
                          guardrail.data_points && guardrail.data_points.length > 0
                            ? guardrail.data_points
                                .slice(0, 4)
                                .map((item) => `${item.label}: ${item.value}`)
                                .join(" · ")
                            : guardrail.suggested_action
                        }
                        pill={
                          <RecommendationDetailsPill
                            label={guardrail.severity}
                            tone={recommendationDetailsToneFromCalibration(
                              guardrail.severity,
                            )}
                          />
                        }
                      />
                    ))}
                  footer="Calibration guardrails are advisory only. They do not block trades or change recommendation scoring."
                >
                  <p>{recommendationDetailsValue(calibrationGuardrails.summary)}</p>
                </RecommendationDetailsContextCard>
              ) : (
                <RecommendationDetailsContextCard label="Calibration Guardrails">
                  <p>No calibration guardrails active.</p>
                </RecommendationDetailsContextCard>
              )}
            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="Full Rationale">
            <div className="trade-recommendation-details-rationale-grid">
              <RecommendationDetailsTextCard label="Setup Type">
                <p>
                  {recommendationDetailsValue(
                    getSetupTypeDescription(recommendation.setupType),
                  )}
                </p>
              </RecommendationDetailsTextCard>
              <RecommendationDetailsTextCard label="Thesis">
                <p>{recommendationDetailsValue(recommendation.thesis)}</p>
              </RecommendationDetailsTextCard>
              <RecommendationDetailsTextCard label="Invalidation">
                <p>{recommendationDetailsValue(recommendation.invalidation)}</p>
              </RecommendationDetailsTextCard>
              <RecommendationDetailsTextCard label="Reason to Avoid">
                <p>{recommendationDetailsValue(recommendation.reasonToAvoid)}</p>
              </RecommendationDetailsTextCard>
            </div>
            <div className="trade-recommendation-details-brand-mark" aria-hidden="true">
              <Image
                src="/trade-assets/ture-logo-mark.svg"
                alt=""
                width={72}
                height={72}
              />
            </div>
          </RecommendationDetailsSection>
        </div>
      </section>
    </div>
  );
}

function TradeModal({
  recommendation,
  positionSizing,
  validation,
  validationMessage,
  brokerCostModel,
  riskControlsSettings,
  riskControlsEvaluation,
  marketSessionEvaluation,
  isSaving,
  onClose,
  onSubmit,
}: {
  recommendation: Recommendation;
  positionSizing: PositionSizing;
  validation: AddTradeValidationResult | null;
  validationMessage: string;
  brokerCostModel: BrokerCostModel | null;
  riskControlsSettings: RiskControlsSettings;
  riskControlsEvaluation: RiskControlsEvaluation | null;
  marketSessionEvaluation: MarketSessionEvaluation;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    brokerFill: BrokerFillConfirmation,
  ) => void;
}) {
  const isDemoTrade = isDemoRecommendation(recommendation);
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
    useState<BrokerOrderStatus>("submitted_not_filled");
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
  const [mockBrokerFillJson, setMockBrokerFillJson] = useState("");
  const [mockBrokerFillImportResult, setMockBrokerFillImportResult] =
    useState<MockBrokerFillImportResult | null>(null);
  const [payloadNow, setPayloadNow] = useState(() => new Date());
  const generatedPayloadRef = useRef<string | null>(null);
  const generatedAgentCommandRef = useRef<string | null>(null);
  const evaluatedHardStopContractRef = useRef<string | null>(null);
  const generatedFormMappingPreviewRef = useRef<string | null>(null);
  const generatedBuyHandoffProgressRef = useRef<string | null>(null);
  const generatedBrokerFillCaptureSpecRef = useRef<string | null>(null);
  const generatedTureFillAutofillContractRef = useRef<string | null>(null);
  const generatedFillCaptureReviewRef = useRef<string | null>(null);
  const generatedTureAgentCompletionPolicyRef = useRef<string | null>(null);
  const generatedAvanzaBuyFieldVerificationRef = useRef<string | null>(null);
  const generatedRiskControlsEvaluationRef = useRef<string | null>(null);
  const [manualAvanzaVerificationNotes] = useState(() =>
    readManualAvanzaVerificationNotesForReport(),
  );
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
  const positionSizingResult = buildPositionSizingResult({
    ticker: recommendation.ticker,
    side: recommendation.direction === "Short" ? "short" : "long",
    entryPrice: payloadEntryPrice,
    stopPrice: plannedStopLoss,
    targetPrice: plannedTargetPrice,
    plannedQuantity: payloadShares,
    accountSize: riskControlsSettings.account_size,
    maxRiskPerTradeAmount: riskControlsSettings.max_risk_per_trade_amount,
    maxRiskPerTradePercent: riskControlsSettings.max_risk_per_trade_percent,
    defaultRiskAmountPerTrade:
      riskControlsSettings.default_risk_amount_per_trade,
    defaultRiskPercentPerTrade:
      riskControlsSettings.default_risk_percent_per_trade,
    maxPositionValue: riskControlsSettings.max_position_value,
    mode: riskControlsSettings.position_sizing_mode,
    riskControlsMode: riskControlsSettings.mode,
    currency: "USD",
    now: payloadNow,
  });
  const tradePlanQualityResult = buildTradePlanQualityResult({
    ticker: recommendation.ticker,
    side: recommendation.direction === "Short" ? "short" : "long",
    entryPrice: payloadEntryPrice,
    stopPrice: plannedStopLoss,
    targetPrice: plannedTargetPrice,
    currentPrice:
      validation?.latestIndicators?.latestPrice ??
      recommendation.intradayIndicators?.latestPrice ??
      null,
    plannedQuantity: payloadShares,
    setupType: recommendation.setupType,
    confidenceScore: recommendation.confidenceScore,
    marketSessionPhase: marketSessionEvaluation.phase,
    marketSessionRisk: marketSessionEvaluation.risk_level,
    positionSizingStatus: positionSizingResult.status,
    positionSizingBlocksCreate: positionSizingResult.blocks_create_live_trade,
    riskControlsStatus: riskControlsEvaluation?.status ?? null,
    riskControlsBlocksNewTrade:
      riskControlsEvaluation?.blocks_new_trade ?? false,
    riskControlsMode: riskControlsSettings.mode,
    now: payloadNow,
  });
  const brokerFillBlockMessage = (() => {
    if (riskControlsEvaluation?.blocks_new_trade) {
      return "Strict risk controls block creating a new Live Day Trade.";
    }

    if (positionSizingResult.blocks_create_live_trade) {
      return (
        positionSizingResult.blockers[0]?.message ??
        "Strict position sizing blocks creating a new Live Day Trade."
      );
    }

    if (tradePlanQualityResult.blocks_create_live_trade) {
      return (
        tradePlanQualityResult.blockers[0]?.message ??
        "Trade Plan Quality blocks creating a new Live Day Trade."
      );
    }

    if (brokerOrderStatus === "submitted_not_filled") {
      return "Do not create a Live Day Trade until the broker order is filled.";
    }

    if (!actualFillPriceValid) {
      return "Actual fill price must be greater than zero.";
    }

    if (!actualSharesValid) {
      return "Actual shares must be greater than zero.";
    }

    if (actualStopInvalid) {
      return "Stop loss must be below actual fill price for a long trade.";
    }

    return "";
  })();
  const canCreateLiveDayTrade =
    !payloadExpired &&
    manualBrokerConfirmed &&
    brokerPlanMatches &&
    brokerFillReady &&
    !riskControlsEvaluation?.blocks_new_trade &&
    !positionSizingResult.blocks_create_live_trade &&
    !tradePlanQualityResult.blocks_create_live_trade;
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
  const agentHardStopContract = evaluateAgentHardStopContract({
    payload,
    agentReadiness,
    dryRunResult: agentDryRunResult,
    handoffIntegrity,
    validationStatus: validation?.status ?? payload.validation_status,
    intradayConfirmation: addTradeGate.confirmation.status,
    brokerExecutionMode: "prepare_only",
    brokerUiState: "not_applicable",
    credentialsRequiredOrDetected: false,
    unsafeToContinue: false,
    liveTradeCreationRelevant: true,
    existingCanCreateLiveTrade: canCreateLiveDayTrade,
    now: payloadNow,
  });
  const agentHandoffCommand = buildAgentHandoffCommand({
    payload,
    companyName: recommendation.companyName,
    agentReadiness,
    dryRunResult: agentDryRunResult,
    handoffIntegrity,
    validationStatus: validation?.status ?? payload.validation_status,
    intradayConfirmation: addTradeGate.confirmation.status,
    hardStopContract: agentHardStopContract,
    now: payloadNow,
    createdAt: payloadCreatedAt,
  });
  const agentFormMappingPreview = buildAgentFormMappingPreview({
    payload,
    command: agentHandoffCommand,
    hardStopContract: agentHardStopContract,
    recommendation: {
      ticker: recommendation.ticker,
      companyName: recommendation.companyName,
    },
    dryRunResult: agentDryRunResult,
    now: payloadNow,
    createdAt: payloadCreatedAt,
  });
  const agentHardStopContractJson = JSON.stringify(agentHardStopContract, null, 2);
  const agentHandoffCommandJson = JSON.stringify(agentHandoffCommand, null, 2);
  const agentFormMappingPreviewJson = JSON.stringify(
    agentFormMappingPreview,
    null,
  2,
  );
  const avanzaBuyFieldVerificationReport =
    buildBuyAvanzaFieldVerificationReport({
      handoffSessionId: payload.handoff_session_id,
      payloadId: payload.payload_id,
      commandId: agentHandoffCommand.command_id,
      formMappingPreviewId: agentFormMappingPreview.preview_id,
      createdAt: payloadCreatedAt,
      manualVerificationNotes: manualAvanzaVerificationNotes,
    });
  const avanzaBuyFieldVerificationJsonText =
    avanzaFieldVerificationReportJson(avanzaBuyFieldVerificationReport);
  const brokerFillCaptureAgentSpec = buildBuyBrokerFillCaptureAgentSpec({
    payload,
    companyName: recommendation.companyName,
    createdAt: payloadCreatedAt,
  });
  const brokerFillCaptureAgentSpecJsonText = brokerFillCaptureAgentSpecJson(
    brokerFillCaptureAgentSpec,
  );
  const tureFillAutofillContract = buildBuyTureFillAutofillContract({
    payload,
    captureSpec: brokerFillCaptureAgentSpec,
    companyName: recommendation.companyName,
    createdAt: payloadCreatedAt,
  });
  const tureFillAutofillContractJsonText = tureFillAutofillContractJson(
    tureFillAutofillContract,
  );
  const agentCommandFailedCount = agentHandoffCommand.hard_stop_rules.filter(
    (rule) => rule.status === "failed",
  ).length;
  const agentCommandWarningCount = agentHandoffCommand.hard_stop_rules.filter(
    (rule) => rule.status === "warning",
  ).length;
  const agentCommandBlockedReasons = agentHandoffCommand.hard_stop_rules
    .filter((rule) => rule.status === "failed" && rule.blocks_agent)
    .map((rule) => rule.label);
  const agentFormMappingFieldCounts = getAgentFormMappingFieldCounts(
    agentFormMappingPreview,
  );
  const buyOrderHandoffProgress = buildBuyOrderHandoffProgress({
    validationStatus: validation?.status ?? payload.validation_status,
    validationBlocked: addTradeGate.blocked,
    executionPayload: payload,
    payloadExpired,
    hardStopContract: agentHardStopContract,
    agentHandoffCommand,
    formMappingPreview: agentFormMappingPreview,
    readinessResult: agentReadiness,
    dryRunResult: agentDryRunResult,
    brokerFormPrepared: agentPreparedOrderForm,
    manualBrokerConfirmed,
    brokerPlanMatches,
    brokerOrderStatus,
    brokerFillReady,
    brokerFillBlockMessage,
    canCreateLiveTrade: canCreateLiveDayTrade,
  });
  const fillCaptureReview = buildBuyFillCaptureReview({
    payloadId: payload.payload_id,
    ticker: payload.ticker,
    brokerStatus: brokerOrderStatus,
    actualFillPrice,
    actualFilledShares: normalizedActualShares,
    brokerReferenceNote,
    manualAvanzaBuyConfirmed: manualBrokerConfirmed,
    brokerOrderMatchesTradePlan: brokerPlanMatches,
    plannedQuantity: payloadShares,
    commission: parseNumber(previewCommissionInput),
    fxFee: parseNumber(previewFxFeeInput),
    createdAt: payloadCreatedAt,
  });
  const fillCaptureReviewJsonText = fillCaptureReviewJson(fillCaptureReview);
  const tureAgentCompletionPolicy = buildBuyTureAgentCompletionPolicy({
    review: fillCaptureReview,
    autofillContract: tureFillAutofillContract,
    ticker: payload.ticker,
    payloadId: payload.payload_id,
    payloadFingerprint: payload.payload_fingerprint,
    handoffSessionId: payload.handoff_session_id,
    brokerStatus: brokerOrderStatus,
    actualFillPrice,
    actualFilledShares: normalizedActualShares,
    manualAvanzaBuyConfirmed: manualBrokerConfirmed,
    brokerOrderMatchesTradePlan: brokerPlanMatches,
    createdAt: payloadCreatedAt,
  });
  const tureAgentCompletionPolicyJsonText = tureAgentCompletionPolicyJson(
    tureAgentCompletionPolicy,
  );
  const addTradePreflightSummary = buildAddTradePreflightSummary({
    marketSession: marketSessionEvaluation,
    riskControls: riskControlsEvaluation,
    positionSizing: positionSizingResult,
    tradePlanQuality: tradePlanQualityResult,
    executionPayload: payload,
    payloadExpired,
    hardStopContract: agentHardStopContract,
    agentReadiness,
    formMappingPreview: agentFormMappingPreview,
    avanzaFieldVerification: avanzaBuyFieldVerificationReport,
    brokerOrderStatus,
    brokerFillReady,
    manualBrokerConfirmed,
    brokerPlanMatches,
    brokerFillBlockMessage,
    now: payloadNow,
  });
  const tradePlanningSnapshotPreview = buildTradePlanningSnapshot({
    ticker: recommendation.ticker,
    side: recommendation.direction,
    entryPrice: payloadEntryPrice,
    stopPrice: plannedStopLoss,
    targetPrice: plannedTargetPrice,
    plannedQuantity: payloadShares,
    actualEntryShares: normalizedActualShares,
    positionSizing: positionSizingResult,
    tradePlanQuality: tradePlanQualityResult,
    riskControls: riskControlsEvaluation,
    marketSession: marketSessionEvaluation,
    preflight: addTradePreflightSummary,
    brokerFillStatus: brokerOrderStatus,
    brokerReference: brokerReferenceNote,
    demoOrRealSource: isDemoTrade
      ? "demo"
      : brokerReferenceNote.toLowerCase().includes("mock")
        ? "mock"
        : "real",
    capturedAt: payloadCreatedAt,
  });
  const tradePlanningSnapshotPreviewJson = tradePlanningSnapshotJson(
    tradePlanningSnapshotPreview,
  );

  useEffect(() => {
    if (generatedPayloadRef.current === recommendation.id) {
      return;
    }

    generatedPayloadRef.current = recommendation.id;
    logExecutionPayloadEvent("execution_payload_generated", payload);
  }, [payload, recommendation.id]);

  useEffect(() => {
    const contractAuditKey = [
      payload.payload_id,
      agentHardStopContract.overall_status,
      agentHardStopContract.failed_count,
      agentHardStopContract.warning_count,
      agentHardStopContract.unknown_count,
      agentHardStopContract.machine_summary.top_blocker_ids.join(","),
    ].join(":");

    if (evaluatedHardStopContractRef.current === contractAuditKey) {
      return;
    }

    evaluatedHardStopContractRef.current = contractAuditKey;
    logAgentHardStopContractEvent(agentHardStopContract, payload);
  }, [agentHardStopContract, payload]);

  useEffect(() => {
    if (generatedAgentCommandRef.current === agentHandoffCommand.command_id) {
      return;
    }

    generatedAgentCommandRef.current = agentHandoffCommand.command_id;
    logAgentHandoffCommandEvent(
      "agent_handoff_command_generated",
      agentHandoffCommand,
    );
  }, [agentHandoffCommand]);

  useEffect(() => {
    const previewAuditKey = [
      agentFormMappingPreview.preview_id,
      agentFormMappingPreview.overall_status,
      agentFormMappingFieldCounts.ready_count,
      agentFormMappingFieldCounts.warning_count,
      agentFormMappingFieldCounts.blocked_count,
      agentFormMappingFieldCounts.missing_count,
    ].join(":");

    if (generatedFormMappingPreviewRef.current === previewAuditKey) {
      return;
    }

    generatedFormMappingPreviewRef.current = previewAuditKey;
    logAgentFormMappingPreviewEvent(
      "agent_form_mapping_preview_generated",
      agentFormMappingPreview,
    );
  }, [agentFormMappingFieldCounts, agentFormMappingPreview]);

  useEffect(() => {
    const progressAuditKey = [
      payload.payload_id,
      buyOrderHandoffProgress.overall_status,
      buyOrderHandoffProgress.next_action_label,
      buyOrderHandoffProgress.steps
        .map((step) => `${step.id}:${step.status}`)
        .join(","),
    ].join(":");

    if (generatedBuyHandoffProgressRef.current === progressAuditKey) {
      return;
    }

    generatedBuyHandoffProgressRef.current = progressAuditKey;
    logBuyOrderHandoffProgressEvent(buyOrderHandoffProgress, payload);
  }, [buyOrderHandoffProgress, payload]);

  useEffect(() => {
    if (
      generatedBrokerFillCaptureSpecRef.current ===
      brokerFillCaptureAgentSpec.spec_id
    ) {
      return;
    }

    generatedBrokerFillCaptureSpecRef.current =
      brokerFillCaptureAgentSpec.spec_id;
    logBrokerFillCaptureAgentSpecEvent(
      "broker_fill_capture_agent_spec_generated",
      brokerFillCaptureAgentSpec,
    );
  }, [brokerFillCaptureAgentSpec]);

  useEffect(() => {
    if (
      generatedTureFillAutofillContractRef.current ===
      tureFillAutofillContract.contract_id
    ) {
      return;
    }

    generatedTureFillAutofillContractRef.current =
      tureFillAutofillContract.contract_id;
    logTureFillAutofillContractEvent(
      "ture_fill_autofill_contract_generated",
      tureFillAutofillContract,
    );
  }, [tureFillAutofillContract]);

  useEffect(() => {
    const reviewAuditKey = [
      fillCaptureReview.review_id,
      fillCaptureReview.status,
      fillCaptureReview.blockers.map((blocker) => blocker.blocker_id).join(","),
      fillCaptureReview.warnings.map((warning) => warning.warning_id).join(","),
    ].join(":");

    if (generatedFillCaptureReviewRef.current === reviewAuditKey) {
      return;
    }

    generatedFillCaptureReviewRef.current = reviewAuditKey;
    logFillCaptureReviewEvent("fill_capture_review_generated", fillCaptureReview, {
      payloadId: payload.payload_id,
      payloadFingerprint: payload.payload_fingerprint,
      handoffSessionId: payload.handoff_session_id,
      recommendationId: recommendation.id,
      ticker: payload.ticker,
    });
  }, [fillCaptureReview, payload, recommendation.id]);

  useEffect(() => {
    const policyAuditKey = [
      tureAgentCompletionPolicy.policy_id,
      tureAgentCompletionPolicy.decision,
      tureAgentCompletionPolicy.blockers
        .map((blocker) => blocker.blocker_id)
        .join(","),
      tureAgentCompletionPolicy.warnings
        .map((warning) => warning.warning_id)
        .join(","),
    ].join(":");

    if (generatedTureAgentCompletionPolicyRef.current === policyAuditKey) {
      return;
    }

    generatedTureAgentCompletionPolicyRef.current = policyAuditKey;
    logTureAgentCompletionPolicyEvent(
      "ture_agent_completion_policy_generated",
      tureAgentCompletionPolicy,
      {
        recommendationId: recommendation.id,
      },
    );
  }, [recommendation.id, tureAgentCompletionPolicy]);

  useEffect(() => {
    const verificationAuditKey = [
      avanzaBuyFieldVerificationReport.report_id,
      avanzaBuyFieldVerificationReport.overall_status,
      avanzaBuyFieldVerificationReport.verified_count,
      avanzaBuyFieldVerificationReport.assumed_count,
      avanzaBuyFieldVerificationReport.unknown_count,
      avanzaBuyFieldVerificationReport.blocked_count,
    ].join(":");

    if (generatedAvanzaBuyFieldVerificationRef.current === verificationAuditKey) {
      return;
    }

    generatedAvanzaBuyFieldVerificationRef.current = verificationAuditKey;
    logAvanzaFieldVerificationEvent(
      "avanza_buy_field_verification_generated",
      avanzaBuyFieldVerificationReport,
    );
    if (avanzaBuyFieldVerificationReport.manual_notes_applied) {
      logAvanzaFieldVerificationEvent(
        "avanza_verification_notes_applied_to_report",
        avanzaBuyFieldVerificationReport,
      );
    }
  }, [avanzaBuyFieldVerificationReport]);

  useEffect(() => {
    if (!riskControlsEvaluation) {
      return;
    }

    const riskAuditKey = [
      riskControlsEvaluation.evaluation_id,
      riskControlsEvaluation.status,
      riskControlsEvaluation.blocks_new_trade,
      riskControlsEvaluation.blockers.map((blocker) => blocker.blocker_id).join(","),
      riskControlsEvaluation.warnings.map((warning) => warning.warning_id).join(","),
    ].join(":");

    if (generatedRiskControlsEvaluationRef.current === riskAuditKey) {
      return;
    }

    generatedRiskControlsEvaluationRef.current = riskAuditKey;
    logRiskControlsEvaluationEvent(
      riskControlsEvaluation.blocks_new_trade
        ? "risk_controls_blocked_new_trade"
        : riskControlsEvaluation.status === "warning" ||
            riskControlsEvaluation.status === "blocked"
          ? "risk_controls_warning_new_trade"
          : "risk_controls_evaluated_for_new_trade",
      riskControlsEvaluation,
      { recommendationId: recommendation.id },
    );
  }, [recommendation.id, riskControlsEvaluation]);

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

  async function copyAgentHandoffCommand() {
    setCopyStatus("");

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyStatus("Clipboard unavailable. Select the command JSON manually.");
      return;
    }

    try {
      await navigator.clipboard.writeText(agentHandoffCommandJson);
      logAgentHandoffCommandEvent(
        "agent_handoff_command_copied",
        agentHandoffCommand,
      );
      setCopyStatus("Agent handoff command JSON copied.");
    } catch {
      setCopyStatus("Could not copy command JSON. Select it manually.");
    }
  }

  async function copyAgentFormMappingPreview() {
    setCopyStatus("");

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyStatus(
        "Clipboard unavailable. Select the form mapping JSON manually.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(agentFormMappingPreviewJson);
      logAgentFormMappingPreviewEvent(
        "agent_form_mapping_preview_copied",
        agentFormMappingPreview,
      );
      setCopyStatus("Agent form mapping JSON copied.");
    } catch {
      setCopyStatus("Could not copy form mapping JSON. Select it manually.");
    }
  }

  async function copyBrokerFillCaptureAgentSpec() {
    setCopyStatus("");

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyStatus(
        "Clipboard unavailable. Select the broker fill capture spec JSON manually.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(brokerFillCaptureAgentSpecJsonText);
      logBrokerFillCaptureAgentSpecEvent(
        "broker_fill_capture_agent_spec_copied",
        brokerFillCaptureAgentSpec,
      );
      setCopyStatus("Broker fill capture spec JSON copied.");
    } catch {
      setCopyStatus("Could not copy broker fill capture spec JSON.");
    }
  }

  async function copyTureFillAutofillContract() {
    setCopyStatus("");

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyStatus(
        "Clipboard unavailable. Select the Ture fill autofill contract JSON manually.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(tureFillAutofillContractJsonText);
      logTureFillAutofillContractEvent(
        "ture_fill_autofill_contract_copied",
        tureFillAutofillContract,
      );
      setCopyStatus("Ture fill autofill contract JSON copied.");
    } catch {
      setCopyStatus("Could not copy Ture fill autofill contract JSON.");
    }
  }

  async function copyAvanzaBuyFieldVerification() {
    setCopyStatus("");

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyStatus(
        "Clipboard unavailable. Select the Avanza field verification JSON manually.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(avanzaBuyFieldVerificationJsonText);
      logAvanzaFieldVerificationEvent(
        "avanza_buy_field_verification_copied",
        avanzaBuyFieldVerificationReport,
      );
      setCopyStatus("Avanza buy field verification JSON copied.");
    } catch {
      setCopyStatus("Could not copy Avanza buy field verification JSON.");
    }
  }

  function markPayloadReadyForAgent() {
    if (payloadExpired) {
      setCopyStatus(
        "Execution payload expired. Reopen ADD TRADE to regenerate fresh order details.",
      );
      return;
    }

    if (!buyOrderHandoffProgress.can_mark_ready_for_agent) {
      logExecutionPayloadEvent(
        "agent_handoff_blocked_by_readiness",
        payload,
        agentReadiness,
      );
      setCopyStatus(
        agentCommandBlockedReasons.length > 0
          ? `Agent handoff command is blocked: ${agentCommandBlockedReasons
              .slice(0, 3)
              .join(", ")}.`
          : "Agent handoff command is blocked until hard stops are resolved.",
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
    logExecutionPayloadEvent(
      "buy_order_ready_for_agent",
      readyPayload,
      agentReadiness,
    );
    setCopyStatus(
      agentHandoffCommand.status === "warning"
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
    if (checked && !agentHardStopContract.can_prepare_broker_form) {
      logExecutionPayloadEvent(
        "agent_handoff_blocked_by_readiness",
        payload,
        agentReadiness,
      );
      setAgentPreparedOrderForm(false);
      setCopyStatus(
        "Agent handoff command is blocked until hard stops are resolved.",
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
      logExecutionPayloadEvent(
        "broker_buy_form_prepared_checked",
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

  function prefillDemoBuyFill() {
    if (!isDemoTrade) {
      return;
    }

    const demoFillPrice = payloadEntryPrice ?? recommendation.entryLowValue ?? 100;
    const demoShares = payloadShares ?? 10;

    setAgentPreparedOrderForm(true);
    setManualBrokerConfirmed(true);
    setBrokerPlanMatches(true);
    setBrokerOrderStatus("filled");
    setActualFillPriceInput(String(demoFillPrice));
    setActualSharesInput(String(demoShares));
    setBrokerReferenceNote("DEMO FILL - no broker order submitted");
    setBuyingPowerStatus("ok");
    setPreviewWarningType("none");
    setPreviewWarningText("");
    setScreenshotReferenceNote("DEMO ONLY - no broker or browser was contacted");
    setCreateBlockedMessage("");
    setCopyStatus("Demo buy fill populated. No broker order was submitted.");
  }

  function loadLatestMockBuyFill() {
    try {
      const stored = window.localStorage.getItem(latestMockBrokerFillStorageKey);
      if (!stored) {
        setCopyStatus("No latest mock broker fill found in localStorage.");
        return;
      }

      setMockBrokerFillJson(stored);
      const result = validateMockBrokerFillForTureBuy({
        rawJson: stored,
        expectedTicker: recommendation.ticker,
        plannedQuantity: payloadShares,
      });
      setMockBrokerFillImportResult(result);
      logMockBrokerFillImportEvent("mock_broker_fill_import_loaded", {
        side: "BUY",
        ticker: recommendation.ticker,
        status: result.status,
        blockerCount: result.blockers.length,
        warningCount: result.warnings.length,
        confirmationId: result.fill?.confirmation_id ?? null,
        actualPrice: result.fill?.actual_price ?? null,
        actualShares: result.fill?.actual_shares ?? null,
        recommendationId: recommendation.id,
      });
      setCopyStatus("Latest mock fill loaded for review.");
    } catch {
      setCopyStatus("Could not load latest mock fill from localStorage.");
    }
  }

  function importMockBuyFill() {
    const result = validateMockBrokerFillForTureBuy({
      rawJson: mockBrokerFillJson,
      expectedTicker: recommendation.ticker,
      plannedQuantity: payloadShares,
    });
    setMockBrokerFillImportResult(result);

    if (!result.fill || result.status === "blocked" || result.status === "invalid") {
      logMockBrokerFillImportEvent("mock_broker_fill_import_blocked", {
        side: "BUY",
        ticker: recommendation.ticker,
        status: result.status,
        blockerCount: result.blockers.length,
        warningCount: result.warnings.length,
        recommendationId: recommendation.id,
      });
      setCopyStatus(
        result.blockers[0]?.message ??
          "Mock buy fill import is blocked. Review the import panel.",
      );
      return;
    }

    const mapped = mapMockFillToBrokerFillConfirmation(result.fill);
    setAgentPreparedOrderForm(true);
    setManualBrokerConfirmed(mapped.manualMockConfirmation);
    setBrokerPlanMatches(mapped.brokerPlanMatches);
    setBrokerOrderStatus(mapped.brokerOrderStatus);
    setActualFillPriceInput(mapped.actualFillPrice);
    setActualSharesInput(mapped.actualShares);
    setBrokerReferenceNote(mapped.brokerReferenceNote);
    setPreviewCommissionInput(mapped.previewCommission);
    setPreviewFxFeeInput(mapped.previewFxFee);
    setBuyingPowerStatus("ok");
    setPreviewWarningType("none");
    setPreviewWarningText("");
    setScreenshotReferenceNote(
      "MOCK IMPORT ONLY - Avanza was not contacted and no real broker order was submitted",
    );
    setCreateBlockedMessage("");
    logMockBrokerFillImportEvent("mock_broker_buy_fill_imported", {
      side: "BUY",
      ticker: recommendation.ticker,
      status: result.status,
      blockerCount: result.blockers.length,
      warningCount: result.warnings.length,
      confirmationId: result.fill.confirmation_id,
      actualPrice: result.fill.actual_price,
      actualShares: result.fill.actual_shares,
      recommendationId: recommendation.id,
    });
    setCopyStatus(
      result.status === "needs_review"
        ? "Mock buy fill imported with review warnings. No Live Day Trade was created."
        : "Mock buy fill imported. No Live Day Trade was created.",
    );
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

    if (riskControlsEvaluation?.blocks_new_trade) {
      event.preventDefault();
      logRiskControlsEvaluationEvent(
        "risk_controls_blocked_new_trade",
        riskControlsEvaluation,
        { recommendationId: recommendation.id },
      );
      setCreateBlockedMessage(
        riskControlsEvaluation.blockers[0]?.message ??
          "Strict risk controls block creating a new Live Day Trade.",
      );
      return;
    }

    if (positionSizingResult.blocks_create_live_trade) {
      event.preventDefault();
      setCreateBlockedMessage(
        positionSizingResult.blockers[0]?.message ??
          "Strict position sizing blocks creating a new Live Day Trade.",
      );
      return;
    }

    if (tradePlanQualityResult.blocks_create_live_trade) {
      event.preventDefault();
      setCreateBlockedMessage(
        tradePlanQualityResult.blockers[0]?.message ??
          "Trade Plan Quality blocks creating a new Live Day Trade.",
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

    const brokerConfirmedAt = new Date().toISOString();
    const tradePlanningSnapshot = buildTradePlanningSnapshot({
      ticker: recommendation.ticker,
      side: recommendation.direction,
      entryPrice: payloadEntryPrice,
      stopPrice: plannedStopLoss,
      targetPrice: plannedTargetPrice,
      plannedQuantity: payloadShares,
      actualEntryShares: normalizedActualShares,
      positionSizing: positionSizingResult,
      tradePlanQuality: tradePlanQualityResult,
      riskControls: riskControlsEvaluation,
      marketSession: marketSessionEvaluation,
      preflight: addTradePreflightSummary,
      brokerFillStatus: brokerOrderStatus,
      brokerReference: brokerReferenceNote,
      demoOrRealSource: isDemoTrade
        ? "demo"
        : brokerReferenceNote.toLowerCase().includes("mock")
          ? "mock"
          : "real",
      capturedAt: brokerConfirmedAt,
    });

    onSubmit(event, {
      brokerOrderStatus,
      actualFillPrice,
      actualShares: normalizedActualShares,
      brokerReferenceNote: brokerReferenceNote.trim() || null,
      brokerConfirmedAt,
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
      agentHandoffCommand,
      agentHardStopContract,
      agentFormMappingPreview,
      tradePlanningSnapshot,
    });
  }

  const confidenceTier = recommendationConfidenceTier(recommendation);
  const addTradeGuidance =
    validationMessage ||
    addTradeGate.message ||
    "Latest intraday validation is clean. Prepare the buy order handoff, then manually confirm KÖP in Avanza before recording the broker fill.";
  const buyLifecycleSteps = [
    {
      label: "Review setup",
      detail:
        payload.validation_status === "valid"
          ? "Setup validation is ready."
          : "Review validation status before handoff.",
      tone: lifecycleToneFromPackageStatus(payload.validation_status),
    },
    {
      label: "Prepare buy order",
      detail: "Generate the prepare-only buy handoff package.",
      tone: lifecycleToneFromPackageStatus(buyOrderHandoffProgress.overall_status),
    },
    {
      label: "Manual Avanza KÖP",
      detail: manualBrokerConfirmed
        ? "Manual broker confirmation recorded."
        : "You manually review and click final KÖP.",
      tone: manualBrokerConfirmed
        ? "ready"
        : agentPreparedOrderForm
          ? "current"
          : "pending",
    },
    {
      label: "Capture broker fill",
      detail: brokerFillReady
        ? "Actual fill data is captured."
        : "Enter Avanza fill price and shares.",
      tone: brokerFillReady
        ? "ready"
        : manualBrokerConfirmed
          ? "current"
          : "pending",
    },
    {
      label: "Create Live Day Trade",
      detail: canCreateLiveDayTrade
        ? "Ready to create from broker fill."
        : "Ture recordkeeping happens after fill capture.",
      tone: canCreateLiveDayTrade ? "ready" : "pending",
    },
  ] satisfies Array<{
    label: string;
    detail: string;
    tone: LifecycleStepTone;
  }>;
  const buyPrimaryCtaLabel = isSaving
    ? "SAVING TRADE"
    : canCreateLiveDayTrade
      ? "CREATE LIVE DAY TRADE"
      : !manualBrokerConfirmed || !brokerPlanMatches
        ? "MANUAL KÖP CONFIRMATION REQUIRED"
        : !brokerFillReady
          ? "CAPTURE BROKER FILL TO CONTINUE"
          : "CREATE LIVE DAY TRADE FROM BROKER FILL";
  const addTradeRealityBadges = [
    isDemoTrade
      ? dataModeBadgeForMode("demo")
      : freshness === "stale" || freshness === "expired"
        ? dataModeBadgeForMode("stale_market_data")
        : dataModeBadgeForMode("supabase_record"),
    dataModeBadgeForExecutionReality("human_confirmed_required"),
    dataModeBadgeForMode("future_agent_package"),
  ];

  return (
    <div className="trade-recommendation-details-backdrop trade-add-modal-backdrop">
      <form
        onSubmit={handleTradeSubmit}
        className="trade-add-modal"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="trade-recommendation-details-titlebar trade-add-modal__titlebar">
          <div className="flex flex-col gap-2">
            <h2>ADD TRADE — PREPARE BUY ORDER</h2>
            <DataModePillRow badges={addTradeRealityBadges} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="trade-recommendation-details-close"
            aria-label="Close add trade modal"
          >
            <Image
              src="/trade-assets/x-icn.svg"
              alt=""
              aria-hidden="true"
              width={29}
              height={29}
            />
          </button>
        </div>

        <div className="trade-add-modal__scroll">
          <header className="trade-recommendation-details-header trade-add-modal__header">
            <CompanyIdentity
              ticker={recommendation.ticker}
              companyName={recommendation.companyName}
              size="live"
            />
            <span
              className={`trade-recommendation-confidence-pill trade-recommendation-confidence-pill--${confidenceTier}`}
            >
              {recommendationConfidenceLabel(recommendation)}
            </span>
          </header>

          <div className="trade-recommendation-guidance">
            <p>{recommendationDetailsValue(addTradeGuidance)}</p>
            <span>Updated {recommendationDetailsValue(recommendation.createdAt)}</span>
          </div>

          <DataModeSurfaceNotice
            surface={{
              surface_id: "add_trade_buy_handoff",
              label: "ADD TRADE / Buy Handoff",
              mode: "future_agent_package",
              source_kind: "agent_package",
              freshness_status: "not_applicable",
              execution_reality: "human_confirmed_required",
              badges: addTradeRealityBadges,
              warnings: isDemoTrade
                ? [
                    {
                      surface_id: "add_trade_buy_handoff",
                      warning_id: "demo_recommendation_not_signal",
                      label: "Demo recommendation",
                      message: "Demo recommendations are not real trade signals.",
                      severity: "warning",
                    },
                  ]
                : [],
              summary:
                "Ture does not send broker orders. Avanza KÖP is always human-confirmed, and this package is prepare/read-only.",
            }}
            compact
          />

          <LifecycleProgressStrip
            title="Buy Lifecycle"
            safetyNote="Ture and a future agent may prepare the Avanza buy form only. You must manually review and click final KÖP. Create the Live Day Trade only after Avanza reports a fill."
            steps={buyLifecycleSteps}
          />

          <AddTradePreflightSummaryPanel summary={addTradePreflightSummary} />

          <section className="mt-5 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.035] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                  What you need to do next
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Prepare the buy order, manually confirm KÖP in Avanza, then
                  capture the actual broker fill in Ture.
                </p>
              </div>
              <span className="w-fit rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                {buyPrimaryCtaLabel}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Ture and a future agent may prepare forms only. You must manually
              click final KÖP in Avanza. Ture recordkeeping happens after manual
              broker confirmation.
            </p>
          </section>

          <AddTradeWorkflowGroup
            title="Trade Decision Checks"
            description="Planning checks for the setup, session, risk, sizing, and trade plan. These explain whether the trade deserves review before broker fill capture."
          >
          <AddTradeSection title="Market Session Check">
            <MarketSessionSummaryPanel
              evaluation={marketSessionEvaluation}
              title="US Market Session"
              compact
            />
          </AddTradeSection>

          <PositionSizingSection
            positionSizing={positionSizing}
            entryPrice={recommendation.entryZone}
          />

          <PositionSizingResultPanel result={positionSizingResult} />

          <TradePlanQualityPanel result={tradePlanQualityResult} />

          <AddTradeSection title="Selling Strategy">
            <AddTradeMetricGrid
              metrics={[
                { label: "Stop Loss", value: recommendation.stopLoss },
                { label: "Target 1", value: recommendation.target1 },
                { label: "Target 2", value: recommendation.target2 },
              ]}
            />
          </AddTradeSection>
          </AddTradeWorkflowGroup>

          <AddTradeWorkflowGroup
            title="Execution Safety"
            description="Prepare-only execution package and future-agent safety checks. Critical blockers are surfaced in Preflight Summary; full technical detail is secondary."
            defaultOpen={false}
          >
          <AddTradeSection title="Prepare Buy Order">
            <div className="trade-add-broker-order-card">
              <p className="trade-add-broker-order-card__title">
                Buy Order Handoff
              </p>

              <div className="trade-add-broker-order-rows">
                <AddTradeBrokerOrderRow
                  label="Handoff Session"
                  value={payload.handoff_session_id}
                />
                <AddTradeBrokerOrderRow
                  label="Payload ID"
                  value={payload.payload_id}
                />
                <AddTradeBrokerOrderRow
                  label="Fingerprint"
                  value={payload.payload_fingerprint}
                />
                <AddTradeBrokerOrderRow
                  label="Expires"
                  value={formatPayloadExpiry(payload, payloadNow)}
                />
                <AddTradeBrokerOrderRow
                  label="Confirmation"
                  value="Manual required"
                />
                <AddTradeBrokerOrderRow
                  label="Handoff"
                  value={`Prepare-only · ${payload.handoff_status.replaceAll(
                    "_",
                    " ",
                  )}`}
                />
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

          <div
            id="trade-agent-handoff-command-json"
            data-agent-readable="true"
            data-handoff-session-id={agentHandoffCommand.handoff_session_id ?? ""}
            data-payload-id={agentHandoffCommand.payload_id ?? ""}
            data-command-id={agentHandoffCommand.command_id}
            data-command-status={agentHandoffCommand.status}
            data-broker={agentHandoffCommand.broker}
            data-task={agentHandoffCommand.task}
            className="sr-only"
          >
            {agentHandoffCommandJson}
          </div>

          <div
            id="trade-agent-hard-stop-contract-json"
            data-agent-readable="true"
            data-handoff-session-id={payload.handoff_session_id}
            data-payload-id={payload.payload_id}
            data-contract-version={agentHardStopContract.contract_version}
            data-contract-status={agentHardStopContract.overall_status}
            className="sr-only"
          >
            {agentHardStopContractJson}
          </div>

          <div
            id="trade-agent-form-mapping-preview-json"
            data-agent-readable="true"
            data-handoff-session-id={agentFormMappingPreview.handoff_session_id ?? ""}
            data-payload-id={agentFormMappingPreview.payload_id ?? ""}
            data-command-id={agentFormMappingPreview.command_id ?? ""}
            data-preview-id={agentFormMappingPreview.preview_id}
            data-preview-status={agentFormMappingPreview.overall_status}
            data-broker={agentFormMappingPreview.broker}
            data-mode={agentFormMappingPreview.mode}
            className="sr-only"
          >
            {agentFormMappingPreviewJson}
          </div>

          <div
            id="trade-avanza-buy-field-verification-json"
            data-agent-readable="true"
            data-report-id={avanzaBuyFieldVerificationReport.report_id}
            data-report-status={avanzaBuyFieldVerificationReport.overall_status}
            data-handoff-session-id={
              avanzaBuyFieldVerificationReport.handoff_session_id ?? ""
            }
            data-payload-id={avanzaBuyFieldVerificationReport.payload_id ?? ""}
            data-side={avanzaBuyFieldVerificationReport.side}
            data-broker={avanzaBuyFieldVerificationReport.broker}
            className="sr-only"
          >
            {avanzaBuyFieldVerificationJsonText}
          </div>

          <div
            id="trade-broker-fill-capture-agent-spec-json"
            data-agent-readable="true"
            data-handoff-session-id={brokerFillCaptureAgentSpec.handoff_session_id}
            data-payload-id={brokerFillCaptureAgentSpec.source_payload_id}
            data-spec-id={brokerFillCaptureAgentSpec.spec_id}
            data-side={brokerFillCaptureAgentSpec.side}
            data-broker={brokerFillCaptureAgentSpec.broker}
            className="sr-only"
          >
            {brokerFillCaptureAgentSpecJsonText}
          </div>

          <div
            id="trade-ture-fill-autofill-contract-json"
            data-agent-readable="true"
            data-handoff-session-id={tureFillAutofillContract.handoff_session_id}
            data-payload-id={tureFillAutofillContract.source_payload_id}
            data-contract-id={tureFillAutofillContract.contract_id}
            data-side={tureFillAutofillContract.side}
            data-target-form={tureFillAutofillContract.target_form}
            className="sr-only"
          >
            {tureFillAutofillContractJsonText}
          </div>

          <div
            id="trade-fill-capture-review-json"
            data-agent-readable="true"
            data-review-id={fillCaptureReview.review_id}
            data-review-status={fillCaptureReview.status}
            data-payload-id={payload.payload_id}
            data-side={fillCaptureReview.side}
            className="sr-only"
          >
            {fillCaptureReviewJsonText}
          </div>

          <div
            id="trade-ture-agent-completion-policy-json"
            data-agent-readable="true"
            data-policy-id={tureAgentCompletionPolicy.policy_id}
            data-decision={tureAgentCompletionPolicy.decision}
            data-target-action={tureAgentCompletionPolicy.target_action}
            data-review-id={tureAgentCompletionPolicy.review_id}
            data-payload-id={tureAgentCompletionPolicy.source_payload_id}
            data-side={tureAgentCompletionPolicy.side}
            className="sr-only"
          >
            {tureAgentCompletionPolicyJsonText}
          </div>

          {payloadExpired && (
            <p className="mt-4 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
              Execution payload expired. Reopen ADD TRADE to regenerate fresh
              order details.
            </p>
          )}

          <BuyOrderHandoffProgressPanel progress={buyOrderHandoffProgress} />

          <RiskControlsEvaluationPanel
            title="Risk Controls Check"
            evaluation={riskControlsEvaluation}
          />

          {riskControlsEvaluation && (
            <div
              id="trade-risk-controls-new-trade-evaluation-json"
              data-agent-readable="true"
              data-evaluation-id={riskControlsEvaluation.evaluation_id}
              data-evaluation-status={riskControlsEvaluation.status}
              data-mode={riskControlsEvaluation.mode}
              data-blocks-new-trade={String(
                riskControlsEvaluation.blocks_new_trade,
              )}
              className="sr-only"
            >
              {riskControlsEvaluationJson(riskControlsEvaluation)}
            </div>
          )}

          <AddTradeMetricGrid
            className="trade-add-broker-order-metrics"
            metrics={[
              { label: "Ticker", value: payload.ticker },
              { label: "Direction", value: payload.direction.toUpperCase() },
              { label: "Shares", value: String(payload.shares) },
              { label: "Order Type", value: payload.order_type.toUpperCase() },
              {
                label: "Limit Price",
                value: recommendationDetailsCurrency(payload.limit_price),
              },
              {
                label: "Stop Loss",
                value: recommendationDetailsCurrency(payload.stop_loss),
              },
              {
                label: "Target",
                value: recommendationDetailsCurrency(payload.target_price),
              },
              {
                label: "Position Value",
                value: recommendationDetailsCurrency(payload.position_value),
              },
              {
                label: "Max Loss at Stop",
                value: recommendationDetailsCurrency(payload.max_loss_at_stop),
              },
              {
                label: "Estimated R",
                value:
                  payload.estimated_r_multiple === null
                    ? "—"
                    : `${payload.estimated_r_multiple.toFixed(2)}R`,
              },
              { label: "Validation", value: payload.validation_status.toUpperCase() },
              { label: "Setup Type", value: getSetupTypeLabel(payload.setup_type) },
              {
                label: "Confidence",
                value:
                  payload.confidence_score === null
                    ? "—"
                    : `${payload.confidence_score}/100`,
              },
            ]}
          />

          {payload.safety_warnings.length > 0 && (
            <div className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/10 p-3">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-amber-100">
                Safety warnings
              </p>
              <ul className="mt-2 space-y-1 text-sm leading-6 text-amber-100/90">
                {payload.safety_warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Agent may prepare the buy order form only. It must stop before final
            Avanza confirmation. You must manually click KÖP.
          </p>

          <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
              Next Action
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-100">
              {buyOrderHandoffProgress.next_action_label}
            </p>
            <p className="mt-1 text-sm leading-6 text-zinc-400">
              {buyOrderHandoffProgress.next_action_description}
            </p>
          </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={markPayloadReadyForAgent}
              disabled={
                payloadExpired || !buyOrderHandoffProgress.can_mark_ready_for_agent
              }
              className="min-h-11 flex-1 rounded-md border border-emerald-300/25 bg-emerald-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-emerald-100 transition hover:border-emerald-200/60 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-zinc-500"
            >
              MARK BUY ORDER READY FOR AGENT
            </button>
          </div>
          {!buyOrderHandoffProgress.can_mark_ready_for_agent && (
            <p className="mt-2 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
              {agentCommandBlockedReasons.length > 0
                ? `Blocked: ${agentCommandBlockedReasons.slice(0, 3).join(", ")}.`
                : buyOrderHandoffProgress.next_action_description}
            </p>
          )}

          <details className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
                  Advanced Agent Package
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Export package for prepare-only buy handoff. These copy actions
                  do not execute trades, control Avanza, or submit orders.
                </p>
              </div>
              <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                Handoff export
              </span>
            </div>
            </summary>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Detail label="Handoff Session" value={payload.handoff_session_id} />
              <Detail label="Payload" value="Agent-readable" />
              <Detail label="Final Confirmation" value="Manual required" />
              <Detail label="Order Submit" value="Agent must not submit" />
              <Detail
                label="Expiry"
                value={payloadExpired ? "Expired - unavailable" : "Fresh payload"}
              />
            </div>

            <div className="mt-4 grid gap-2 lg:grid-cols-3">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void copyExecutionPayload();
                }}
                disabled={payloadExpired}
                className="min-h-10 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-zinc-500"
              >
                COPY EXECUTION PAYLOAD
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void copyAgentHandoffCommand();
                }}
                className="min-h-10 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/70"
              >
                COPY AGENT COMMAND JSON
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void copyAgentFormMappingPreview();
                }}
                className="min-h-10 rounded-md border border-violet-300/30 bg-violet-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-violet-100 transition hover:border-violet-200/70"
              >
                COPY FORM MAPPING JSON
              </button>
            </div>

            <AvanzaFieldVerificationPanel
              title="Avanza Buy Field Verification"
              report={avanzaBuyFieldVerificationReport}
              onCopy={copyAvanzaBuyFieldVerification}
            />

            <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                    Broker Fill Capture Agent Spec
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Post-KÖP recordkeeping contract only. A future agent may help
                    fill Ture broker fill fields after you manually confirmed
                    KÖP in Avanza; it must never click KÖP or submit orders.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void copyBrokerFillCaptureAgentSpec();
                  }}
                  className="min-h-10 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/70"
                >
                  COPY BROKER FILL CAPTURE SPEC JSON
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Side"
                  value={brokerFillCaptureAgentSpec.side}
                />
                <Detail
                  label="Mode"
                  value="Recordkeeping only"
                />
                <Detail
                  label="Required Fields"
                  value={String(brokerFillCaptureAgentSpec.required_fields.length)}
                />
                <Detail
                  label="Hard Stops"
                  value={String(brokerFillCaptureAgentSpec.hard_stops.length)}
                />
              </div>
              <details className="mt-3 rounded-md border border-white/10 bg-black/30 p-3">
                <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                  View broker fill capture spec JSON
                </summary>
                <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-300">
                  {brokerFillCaptureAgentSpecJsonText}
                </pre>
              </details>
            </div>

            <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                    Ture Fill Autofill Contract
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Ture-side recordkeeping contract only. A future agent may
                    fill broker fill fields from verified captured data, but it
                    must not save, create the Live Day Trade, or mark
                    confirmations without evidence.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void copyTureFillAutofillContract();
                  }}
                  className="min-h-10 rounded-md border border-violet-300/30 bg-violet-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-violet-100 transition hover:border-violet-200/70"
                >
                  COPY TURE FILL AUTOFILL CONTRACT JSON
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Target Form"
                  value="Broker fill confirmation"
                />
                <Detail
                  label="Required Fields"
                  value={String(
                    tureFillAutofillContract.required_autofill_fields.length,
                  )}
                />
                <Detail
                  label="Review Context"
                  value={String(
                    tureFillAutofillContract.review_only_context_fields.length,
                  )}
                />
                <Detail
                  label="Auto Save"
                  value="Forbidden"
                />
              </div>
              <details className="mt-3 rounded-md border border-white/10 bg-black/30 p-3">
                <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                  View Ture fill autofill contract JSON
                </summary>
                <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-300">
                  {tureFillAutofillContractJsonText}
                </pre>
              </details>
            </div>

            <details className="mt-4 rounded-md border border-white/10 bg-white/[0.025] p-3">
              <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                Review advanced agent package details
              </summary>
              <AgentHardStopContractPanel contract={agentHardStopContract} />

              <AgentFormMappingPreviewPanel
                preview={agentFormMappingPreview}
                previewJson={agentFormMappingPreviewJson}
                fieldCounts={agentFormMappingFieldCounts}
              />

              <AgentHandoffCommandPanel
                command={agentHandoffCommand}
                commandJson={agentHandoffCommandJson}
                failedCount={agentCommandFailedCount}
                warningCount={agentCommandWarningCount}
              />

              <AgentReadinessPanel readiness={agentReadiness} />
            </details>

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
              <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
                Payload expired. Agent handoff unavailable until ADD TRADE is
                reopened and validation runs again.
              </p>
            ) : agentHandoffCommand.status === "blocked" ? (
              <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">
                Agent handoff command is blocked until hard stops are resolved.
              </p>
            ) : agentHandoffCommand.status === "warning" ? (
              <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
                Agent handoff command is available for review, but warnings must
                be checked before use.
              </p>
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
                    <li>Click final KÖP/SÄLJ.</li>
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
          </details>

          {copyStatus && (
            <p className="mt-3 text-sm leading-6 text-cyan-100">{copyStatus}</p>
          )}

          <details className="mt-4 rounded-md border border-white/10 bg-black/30 p-3">
            <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
              View execution payload JSON
            </summary>
            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-300">
              {payloadJson}
            </pre>
          </details>
          </AddTradeSection>
          </AddTradeWorkflowGroup>

        <section className="mt-5 rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
                Primary Action Area
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Setup validated → buy order handoff ready → Avanza form prepared
                → manual KÖP confirmation → broker fill captured → Live Day
                Trade.
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Even if an agent prepares the form, you must manually verify it
                and click the final KÖP confirmation in Avanza.
              </p>
            </div>
            <span className="w-fit rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              Tracking only
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <BrokerConfirmationRow
              label="I manually clicked KÖP in Avanza"
              checked={manualBrokerConfirmed}
              onChange={updateManualBrokerConfirmed}
            />
            <BrokerConfirmationRow
              label="Broker order form matches Trade plan"
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
              payloadExpired || !agentHardStopContract.can_prepare_broker_form
                ? "cursor-default opacity-60"
                : "cursor-pointer"
            }`}
          >
            <span className="text-sm leading-5 text-zinc-300">
              Broker form prepared — final confirmation pending{" "}
              <span className="text-zinc-500">(local state only)</span>
            </span>
            <input
              type="checkbox"
              checked={agentPreparedOrderForm}
              disabled={
                payloadExpired || !agentHardStopContract.can_prepare_broker_form
              }
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
                  Only create the Live Day Trade after you manually confirmed KÖP
                  in Avanza and the order was filled or partially filled.
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

            {(isDemoTrade || demoTradingFlowEnabled) && (
              <details className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/[0.04] p-3">
                <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-amber-100">
                  Mock / Dry Run Tools
                </summary>
                <div className="mt-3">
                  <DataModePillRow
                    badges={[
                      dataModeBadgeForMode("mock_broker"),
                      dataModeBadgeForExecutionReality("mock_only"),
                    ]}
                  />
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Demo/mock helpers fill local Ture fields only. They do not
                  contact Avanza, control a browser, or submit orders.
                </p>

                {isDemoTrade && (
                  <div className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/[0.045] p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <DemoBadge />
                        <p className="mt-2 text-sm leading-6 text-zinc-300">
                          Prefill safe test values for the manual broker fill
                          fields.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          prefillDemoBuyFill();
                        }}
                        className="min-h-10 rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-200/70"
                      >
                        PREFILL DEMO BUY FILL
                      </button>
                    </div>
                  </div>
                )}

                {demoTradingFlowEnabled && (
                  <MockBrokerFillImportPanel
                    title="Import Mock Broker Fill"
                    actionLabel="IMPORT MOCK BUY FILL"
                    value={mockBrokerFillJson}
                    onChange={setMockBrokerFillJson}
                    onLoadLatest={loadLatestMockBuyFill}
                    onImport={importMockBuyFill}
                    result={mockBrokerFillImportResult}
                  />
                )}
              </details>
            )}

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

            <FillCaptureReviewPanel
              title="Fill Capture Review"
              review={fillCaptureReview}
            />

            <TureAgentCompletionPolicyPanel
              title="Ture Agent Completion Policy"
              policy={tureAgentCompletionPolicy}
            />

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
              <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
                Partial fill: Live Day Trade can be created, but it will track
                only the filled shares.
              </p>
            )}

            {brokerFillBlockMessage && (
              <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
                {brokerFillBlockMessage}
              </p>
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
              <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
                Buying power appears insufficient. Do not create a Live Day Trade
                unless the broker order is actually filled.
              </p>
            )}
          </div>

          <BrokerCostEstimatePanel estimate={actualBrokerCostEstimate} />

          <div className="mt-4 rounded-md border border-cyan-300/15 bg-cyan-300/[0.035] p-3">
            <div
              id="trade-planning-snapshot-preview-json"
              data-agent-readable="true"
              data-snapshot-id={tradePlanningSnapshotPreview.snapshot_id}
              data-preflight-status={
                tradePlanningSnapshotPreview.preflight_status ?? ""
              }
              data-ticker={tradePlanningSnapshotPreview.ticker ?? ""}
              className="sr-only"
            >
              {tradePlanningSnapshotPreviewJson}
            </div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100">
              Planning Snapshot
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              A read-only snapshot of position sizing, trade plan quality, risk
              controls, market session, preflight status, and broker fill state
              will be saved with this trade for History and Statistics.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Detail
                label="Preflight"
                value={displayValue(tradePlanningSnapshotPreview.preflight_status)}
              />
              <Detail
                label="Plan Grade"
                value={displayValue(
                  tradePlanningSnapshotPreview.trade_plan_quality_grade,
                )}
              />
              <Detail
                label="Recommended Qty"
                value={formatShares(
                  tradePlanningSnapshotPreview.recommended_quantity,
                )}
              />
              <Detail
                label="Planned R/R"
                value={formatIntradayIndicatorValue(
                  tradePlanningSnapshotPreview.risk_reward_ratio,
                  "R/R",
                )}
              />
            </div>
          </div>

          <div className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
            <p>
              Only create the Live Day Trade after you manually confirmed KÖP in
              Avanza and the order was filled or partially filled.
            </p>
            <p className="mt-1">
              Trade does not know whether the broker order was actually
              submitted. You confirm this manually.
            </p>
          </div>

          {payloadExpired && (
            <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
              Execution payload expired. Reopen ADD TRADE to regenerate fresh
              order details before creating a Live Day Trade.
            </p>
          )}

          {createBlockedMessage && (
            <p className="mt-3 text-sm leading-6 text-amber-100">
              {createBlockedMessage}
            </p>
          )}
        </section>

        </div>

        <div className="trade-add-modal__footer">
          <button
            type="submit"
            disabled={isSaving || !canCreateLiveDayTrade}
            className="trade-add-modal__cta"
          >
            {buyPrimaryCtaLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function buyOrderHandoffTone(status: BuyOrderHandoffStatus) {
  if (status === "ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (status === "blocked") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.035] text-zinc-400";
}

function BuyOrderHandoffProgressPanel({
  progress,
}: {
  progress: BuyOrderHandoffProgress;
}) {
  return (
    <div className="mt-4 rounded-md border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
            Buy Order Handoff Progress
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only workflow status for prepare-only buy handoff. No broker
            automation or order submission is started here.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${buyOrderHandoffTone(
            progress.overall_status,
          )}`}
        >
          {progress.overall_status}
        </span>
      </div>

      <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
          Next Action
        </p>
        <p className="mt-2 text-sm font-semibold text-zinc-100">
          {progress.next_action_label}
        </p>
        <p className="mt-1 text-sm leading-6 text-zinc-400">
          {progress.next_action_description}
        </p>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {progress.steps.map((item) => (
          <div
            key={item.id}
            className="rounded-md border border-white/10 bg-black/20 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-zinc-200">{item.label}</p>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${buyOrderHandoffTone(
                  item.status,
                )}`}
              >
                {item.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
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

function agentHandoffTone(status: AgentHandoffStatus) {
  if (status === "ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function agentHardStopTone(status: AgentHardStopOverallStatus) {
  if (status === "ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function agentHardStopRuleTone(status: AgentHardStopContract["rules"][number]["status"]) {
  if (status === "passed") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning" || status === "unknown") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (status === "failed") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.035] text-zinc-400";
}

function agentFormMappingTone(
  status: AgentFormMappingPreview["overall_status"] | AgentFormMappingStatus,
) {
  if (status === "ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (status === "not_applicable") {
    return "border-white/10 bg-white/[0.035] text-zinc-400";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function agentFormMappingConfidenceTone(
  confidence: AgentFormMappingConfidence,
) {
  if (confidence === "high") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  if (confidence === "medium") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }

  if (confidence === "low") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-white/10 bg-white/[0.035] text-zinc-400";
}

function agentCommandValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value).replaceAll("_", " ");
}

function agentCommandLabel(value: string) {
  return value.replaceAll("_", " ").toUpperCase();
}

function AgentHardStopContractPanel({
  contract,
}: {
  contract: AgentHardStopContract;
}) {
  const visibleBlockers = contract.top_blockers.slice(0, 3);
  const visibleWarnings = contract.top_warnings.slice(0, 3);

  return (
    <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
            Agent Hard Stop Contract
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {contract.human_summary}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${agentHardStopTone(
            contract.overall_status,
          )}`}
        >
          {contract.overall_status}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Detail
          label="Failed"
          value={agentCommandValue(contract.failed_count)}
        />
        <Detail
          label="Warnings"
          value={agentCommandValue(contract.warning_count)}
        />
        <Detail
          label="Unknown"
          value={agentCommandValue(contract.unknown_count)}
        />
      </div>

      {(visibleBlockers.length > 0 || visibleWarnings.length > 0) && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
              Top blockers
            </p>
            {visibleBlockers.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                {visibleBlockers.map((rule) => (
                  <li key={rule.id}>{rule.label}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
            )}
          </div>
          <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
              Top warnings
            </p>
            {visibleWarnings.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                {visibleWarnings.map((rule) => (
                  <li key={rule.id}>{rule.label}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
            )}
          </div>
        </div>
      )}

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          View hard stop rules
        </summary>
        <div className="mt-3 space-y-2">
          {contract.rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-md border border-white/10 bg-black/20 p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    {rule.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {rule.message}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${agentHardStopRuleTone(
                    rule.status,
                  )}`}
                >
                  {agentCommandValue(rule.status)}
                </span>
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                {agentCommandValue(rule.category)} ·{" "}
                {rule.blocks_agent ? "blocks agent" : "review only"}
              </p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function AgentFormMappingPreviewPanel({
  preview,
  previewJson,
  fieldCounts,
  onCopy,
}: {
  preview: AgentFormMappingPreview;
  previewJson: string;
  fieldCounts: ReturnType<typeof getAgentFormMappingFieldCounts>;
  onCopy?: () => void;
}) {
  const visibleBlockers = preview.blocking_reasons.slice(0, 3);
  const visibleWarnings = preview.warning_reasons.slice(0, 3);

  return (
    <div className="mt-4 rounded-md border border-violet-300/15 bg-violet-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-violet-100">
            Agent Form Mapping Preview
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            This is a simulation-only form mapping preview. No browser is
            controlled and no order is submitted. A future agent must stop
            before final broker confirmation.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${agentFormMappingTone(
            preview.overall_status,
          )}`}
        >
          {preview.overall_status}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Broker" value={agentCommandValue(preview.broker)} />
        <Detail label="Mode" value={agentCommandValue(preview.mode)} />
        <Detail
          label="Can Prepare Form"
          value={agentCommandValue(preview.can_prepare_form)}
        />
        <Detail
          label="Fields"
          value={`${fieldCounts.field_count} total`}
        />
        <Detail
          label="Ready"
          value={agentCommandValue(fieldCounts.ready_count)}
        />
        <Detail
          label="Warnings"
          value={agentCommandValue(fieldCounts.warning_count)}
        />
        <Detail
          label="Blocked"
          value={agentCommandValue(fieldCounts.blocked_count)}
        />
        <Detail
          label="Missing"
          value={agentCommandValue(fieldCounts.missing_count)}
        />
      </div>

      {(visibleBlockers.length > 0 || visibleWarnings.length > 0) && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
              Blocking reasons
            </p>
            {visibleBlockers.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                {visibleBlockers.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
            )}
          </div>
          <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
              Warning reasons
            </p>
            {visibleWarnings.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                {visibleWarnings.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-md border border-white/10 bg-black/20">
        <div className="hidden grid-cols-[1.15fr_1.05fr_80px_88px_1fr] gap-2 border-b border-white/10 px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500 sm:grid">
          <span>Avanza Field</span>
          <span>Trade Value</span>
          <span>Confidence</span>
          <span>Status</span>
          <span>Source</span>
        </div>
        <div className="divide-y divide-white/10">
          {preview.field_mappings.map((field) => (
            <div
              key={field.field_id}
              className="grid gap-2 px-3 py-3 text-xs leading-5 text-zinc-300 sm:grid-cols-[1.15fr_1.05fr_80px_88px_1fr]"
            >
              <span className="font-medium text-zinc-200">
                {field.broker_field_label}
              </span>
              <span>{field.display_value}</span>
              <span
                className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${agentFormMappingConfidenceTone(
                  field.confidence,
                )}`}
              >
                {field.confidence}
              </span>
              <span
                className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${agentFormMappingTone(
                  field.status,
                )}`}
              >
                {agentCommandValue(field.status)}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500">
                {agentCommandValue(field.source)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {onCopy && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onCopy();
            }}
            className="min-h-10 flex-1 rounded-md border border-violet-300/30 bg-violet-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-violet-100 transition hover:border-violet-200/70"
          >
            COPY FORM MAPPING JSON
          </button>
        </div>
      )}

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          View mapping details
        </summary>
        <div className="mt-3 space-y-2">
          {preview.field_mappings.map((field) => (
            <div
              key={field.field_id}
              className="rounded-md border border-white/10 bg-black/20 p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    {field.broker_field_label}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                    {agentCommandValue(field.source_path)}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${agentFormMappingTone(
                    field.status,
                  )}`}
                >
                  {agentCommandValue(field.status)}
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Detail label="Value" value={field.display_value} />
                <Detail
                  label="Required"
                  value={agentCommandValue(field.required)}
                />
                <Detail
                  label="Agent Editable"
                  value={agentCommandValue(field.editable_by_agent)}
                />
                <Detail
                  label="Broker Match"
                  value={agentCommandValue(field.must_match_broker_ui)}
                />
                <Detail
                  label="Related Hard Stops"
                  value={
                    field.related_hard_stop_ids.length > 0
                      ? field.related_hard_stop_ids.join(", ")
                      : "—"
                  }
                />
              </div>
              {field.notes.length > 0 && (
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {field.notes.join(" ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </details>

      <details className="mt-3 rounded-md border border-white/10 bg-black/30 p-3">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          View form mapping JSON
        </summary>
        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-300">
          {previewJson}
        </pre>
      </details>
    </div>
  );
}

function AgentHandoffCommandPanel({
  command,
  commandJson,
  failedCount,
  warningCount,
  onCopy,
}: {
  command: AgentHandoffCommand;
  commandJson: string;
  failedCount: number;
  warningCount: number;
  onCopy?: () => void;
}) {
  const reviewRules = command.hard_stop_rules
    .filter((rule) => rule.status !== "passed")
    .slice(0, 5);
  const formFieldRows = Object.entries(command.form_fields);

  return (
    <div className="mt-4 rounded-md border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
            Agent Handoff Command
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Agent may prepare the broker form only. It must stop before final
            buy/sell confirmation. Human confirmation is always required.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${agentHandoffTone(
            command.status,
          )}`}
        >
          {command.status}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Detail label="Task" value={agentCommandValue(command.task)} />
        <Detail label="Broker" value={agentCommandValue(command.broker)} />
        <Detail
          label="Mode"
          value={agentCommandValue(command.broker_execution_mode)}
        />
        <Detail
          label="Stop Before"
          value={command.stop_before.map(agentCommandValue).join(" / ")}
        />
        <Detail label="Command ID" value={agentCommandValue(command.command_id)} />
        <Detail label="Expires" value={agentCommandValue(command.expires_at)} />
        <Detail
          label="Hard Stops"
          value={`${failedCount} failed / ${warningCount} warning`}
        />
        <Detail
          label="Forbidden Actions"
          value={String(command.forbidden_actions.length)}
        />
      </div>

      {onCopy && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onCopy();
            }}
            className="min-h-10 flex-1 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/70"
          >
            COPY AGENT COMMAND JSON
          </button>
        </div>
      )}

      {reviewRules.length > 0 && (
        <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
            Active hard stops / warnings
          </p>
          <ul className="mt-2 space-y-2">
            {reviewRules.map((rule) => (
              <li key={rule.id} className="text-sm leading-6 text-zinc-300">
                <span
                  className={`mr-2 inline-flex rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${
                    rule.status === "failed"
                      ? "border-rose-300/30 bg-rose-300/10 text-rose-100"
                      : "border-amber-300/30 bg-amber-300/10 text-amber-100"
                  }`}
                >
                  {rule.status}
                </span>
                {rule.label}: {rule.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          View command fields
        </summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {formFieldRows.map(([field, value]) => (
            <Detail
              key={field}
              label={agentCommandLabel(field)}
              value={agentCommandValue(value)}
            />
          ))}
        </div>
      </details>

      <details className="mt-3 rounded-md border border-white/10 bg-black/30 p-3">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          View command JSON
        </summary>
        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-300">
          {commandJson}
        </pre>
      </details>
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
      <span className="text-sm leading-5 text-zinc-200">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 accent-[#00db94]"
      />
    </label>
  );
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
    return recommendationDetailsValue(value);
  }

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function auditTrailToneFromStatus(
  status:
    | ExecutionTimelineEvent["status"]
    | HandoffReplayResult["overall_status"]
    | HandoffReplayStepStatus
    | ExecutionImprovementPriority
    | string,
): "positive" | "warning" | "danger" | "neutral" {
  if (status === "completed" || status === "complete" || status === "low") {
    return "positive";
  }

  if (status === "warning" || status === "partial" || status === "medium") {
    return "warning";
  }

  if (status === "failed" || status === "high") {
    return "danger";
  }

  return "neutral";
}

function auditTrailLabel(value: string) {
  return recommendationDetailsValue(value.replaceAll("_", " "));
}

function FullAuditTrailCard({
  label,
  summary,
  pill,
  children,
  footer,
}: {
  label: string;
  summary?: string;
  pill?: React.ReactNode;
  children?: React.ReactNode;
  footer?: string;
}) {
  return (
    <section className="trade-live-audit-card">
      <div className="trade-live-audit-card__header">
        <div>
          <p className="trade-live-audit-card__label">
            {recommendationDetailsValue(label)}
          </p>
          {summary ? (
            <p className="trade-live-audit-card__summary">
              {recommendationDetailsValue(summary)}
            </p>
          ) : null}
        </div>
        {pill}
      </div>
      {children ? <div className="trade-live-audit-card__rows">{children}</div> : null}
      {footer ? (
        <p className="trade-live-audit-card__footer">
          {recommendationDetailsValue(footer)}
        </p>
      ) : null}
    </section>
  );
}

function FullAuditTrailRow({
  timestamp,
  label,
  category,
  summary,
  detail,
  pill,
}: {
  timestamp?: string | null;
  label: string;
  category?: string;
  summary: string;
  detail?: string | null;
  pill?: React.ReactNode;
}) {
  return (
    <div className="trade-live-audit-row">
      <span className="trade-live-audit-row__time">
        {timestamp ? formatTimelineTimestamp(timestamp) : "—"}
      </span>
      <div className="trade-live-audit-row__content">
        <h4>{recommendationDetailsValue(label)}</h4>
        {category ? (
          <span className="trade-live-audit-row__category">
            {auditTrailLabel(category)}
          </span>
        ) : null}
        <p>{recommendationDetailsValue(summary)}</p>
        {detail ? <p>{recommendationDetailsValue(detail)}</p> : null}
      </div>
      {pill}
    </div>
  );
}

function FullAuditTrail({
  timeline,
  replay,
  suggestions,
}: {
  timeline: ExecutionTimelineEvent[];
  replay: HandoffReplayResult;
  suggestions: ReturnType<typeof buildExecutionImprovementSuggestions>;
}) {
  const visibleSuggestions = suggestions.suggestions.slice(0, 4);
  const highPriorityCount = suggestions.suggestions.filter(
    (suggestion) => suggestion.priority === "high",
  ).length;
  const hasLocalEvents = timeline.some((event) => event.source === "local_event");

  return (
    <div className="trade-live-audit-trail">
      <FullAuditTrailCard
        label="Execution Improvement Suggestions"
        summary={`${suggestions.suggestions.length} improvement suggestions found, including ${highPriorityCount} high priority.`}
        footer="Suggestions are analytics only. They do not block trades, change PnL, or control Avanza."
      >
        {visibleSuggestions.length > 0 ? (
          visibleSuggestions.map((suggestion) => (
            <FullAuditTrailRow
              key={suggestion.code}
              label={suggestion.title}
              category={suggestion.category}
              summary={suggestion.suggested_action}
              detail={suggestion.description}
              pill={
                <RecommendationDetailsPill
                  label={suggestion.priority}
                  tone={auditTrailToneFromStatus(suggestion.priority)}
                />
              }
            />
          ))
        ) : (
          <FullAuditTrailRow
            label="No Major Suggestions"
            category="Audit Trail"
            summary="No major execution improvement suggestions surfaced."
            pill={<RecommendationDetailsPill label="Info" tone="neutral" />}
          />
        )}
      </FullAuditTrailCard>

      <FullAuditTrailCard
        label="Handoff Session Replay"
        summary={replay.summary}
        pill={
          <RecommendationDetailsPill
            label={replay.overall_status}
            tone={auditTrailToneFromStatus(replay.overall_status)}
          />
        }
        footer="Replay is an audit view only. It does not mean Avanza was controlled or that an order was submitted automatically."
      >
        {replay.steps.length > 0 ? (
          replay.steps.map((step) => (
            <FullAuditTrailRow
              key={step.id}
              timestamp={step.timestamp}
              label={step.label}
              summary={step.summary}
              detail={step.detail}
              pill={
                <RecommendationDetailsPill
                  label={step.status}
                  tone={auditTrailToneFromStatus(step.status)}
                />
              }
            />
          ))
        ) : (
          <FullAuditTrailRow
            label="No Replay Events"
            summary="No handoff session replay events are available."
            pill={<RecommendationDetailsPill label="Missing" tone="neutral" />}
          />
        )}
      </FullAuditTrailCard>

      <FullAuditTrailCard
        label="Execution Timeline"
        footer={
          hasLocalEvents
            ? "Execution timeline is assembled from available broker metadata and local handoff events."
            : "Some local handoff events may be unavailable after browser or device changes."
        }
      >
        {timeline.length > 0 ? (
          timeline.slice(0, 8).map((event) => (
            <FullAuditTrailRow
              key={event.id}
              timestamp={event.timestamp}
              label={event.label}
              summary={event.description}
              detail={
                event.handoff_session_id
                  ? `Session ${shortPayloadId(event.handoff_session_id)}`
                  : undefined
              }
              pill={
                <RecommendationDetailsPill
                  label={auditTrailLabel(event.source)}
                  tone={auditTrailToneFromStatus(event.status)}
                />
              }
            />
          ))
        ) : (
          <FullAuditTrailRow
            label="No Timeline Events"
            summary="No execution timeline events are available."
            pill={<RecommendationDetailsPill label="Missing" tone="neutral" />}
          />
        )}
      </FullAuditTrailCard>
    </div>
  );
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

      {metadata.agent_handoff_command && (
        <div className="mt-3 rounded-md border border-cyan-300/15 bg-cyan-300/[0.035] p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100">
                Agent Handoff Command
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                {metadata.agent_handoff_command.task.replaceAll("_", " ")} ·{" "}
                {metadata.agent_handoff_command.broker}
              </p>
            </div>
            <span
              className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${agentHandoffTone(
                metadata.agent_handoff_command.status,
              )}`}
            >
              {metadata.agent_handoff_command.status}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Failed {metadata.agent_handoff_command.hard_stop_failed_count} ·
            Warnings {metadata.agent_handoff_command.hard_stop_warning_count}
          </p>
        </div>
      )}

      {metadata.agent_hard_stop_contract && (
        <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                Hard Stop Contract
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                v{metadata.agent_hard_stop_contract.contract_version} · Evaluated{" "}
                {formatDate(metadata.agent_hard_stop_contract.evaluated_at)}
              </p>
            </div>
            <span
              className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${agentHardStopTone(
                metadata.agent_hard_stop_contract.overall_status,
              )}`}
            >
              {metadata.agent_hard_stop_contract.overall_status}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Failed {metadata.agent_hard_stop_contract.failed_count} · Warnings{" "}
            {metadata.agent_hard_stop_contract.warning_count} · Unknown{" "}
            {metadata.agent_hard_stop_contract.unknown_count}
          </p>
        </div>
      )}

      {metadata.agent_form_mapping_preview && (
        <div className="mt-3 rounded-md border border-violet-300/15 bg-violet-300/[0.035] p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-violet-100">
                Form Mapping Preview
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                v{metadata.agent_form_mapping_preview.preview_version} · Generated{" "}
                {formatDate(metadata.agent_form_mapping_preview.generated_at)}
              </p>
            </div>
            <span
              className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${agentFormMappingTone(
                metadata.agent_form_mapping_preview.overall_status,
              )}`}
            >
              {metadata.agent_form_mapping_preview.overall_status}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Fields {metadata.agent_form_mapping_preview.field_count} · Ready{" "}
            {metadata.agent_form_mapping_preview.ready_count} · Warnings{" "}
            {metadata.agent_form_mapping_preview.warning_count} · Blocked{" "}
            {metadata.agent_form_mapping_preview.blocked_count} · Missing{" "}
            {metadata.agent_form_mapping_preview.missing_count}
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

function ClosedTradeJournalSummary({
  position,
  summary,
}: {
  position: ClosedPosition;
  summary: HistoryTradeSummary;
}) {
  const warnings = summary.warnings.slice(0, 3);
  const insights = summary.learning_insights.slice(0, 4);

  return (
    <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Trade Journal Summary
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {getSetupTypeLabel(position.setupType)} ·{" "}
            {historyOutcomeLabel(summary.outcome)} ·{" "}
            {summary.is_demo ? "DEMO" : "REAL"} ·{" "}
            {formatStatisticsDurationMinutes(summary.holding_minutes)}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${historyOutcomeTone(
            summary.outcome,
          )}`}
        >
          {historyOutcomeLabel(summary.outcome)}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Realized PnL" value={formatSignedCurrency(summary.effective_pnl)} />
        <Detail label="Realized R" value={formatSignedR(summary.effective_r)} />
        <Detail label="Average Exit" value={formatCurrency(summary.partial.average_exit_price)} />
        <Detail label="Close Reason" value={displayValue(summary.close_reason)} />
      </div>

      {insights.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="rounded-md border border-white/10 bg-white/[0.025] p-3"
            >
              <p className="text-sm font-semibold text-zinc-200">
                {insight.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {insight.detail}
              </p>
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
            Review Notes
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-50/80">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function ClosedTradePlanningSnapshotPanel({
  position,
}: {
  position: ClosedPosition;
}) {
  const snapshot = position.executionMetadata?.trade_planning_snapshot;

  if (!snapshot) {
    return (
      <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
          Planning Snapshot
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          No creation-time planning snapshot is stored for this trade.
        </p>
      </section>
    );
  }

  const warnings = [
    ...snapshot.position_sizing_warnings,
    ...snapshot.trade_plan_quality_warnings,
    ...snapshot.risk_controls_warnings,
    ...snapshot.preflight_warnings,
  ].slice(0, 4);
  const blockers = [
    ...snapshot.position_sizing_blockers,
    ...snapshot.trade_plan_quality_blockers,
    ...snapshot.risk_controls_blockers,
    ...snapshot.preflight_blockers,
  ].slice(0, 4);

  return (
    <section className="mt-4 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100">
            Planning Snapshot
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Frozen at Live Day Trade creation for post-trade review. Later
            settings or market-state changes do not recalculate this snapshot.
          </p>
        </div>
        <span className="w-fit rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
          {displayValue(snapshot.preflight_status)}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Detail
          label="Planned / Actual Shares"
          value={`${formatShares(snapshot.planned_quantity)} → ${formatShares(
            snapshot.actual_entry_shares,
          )}`}
        />
        <Detail
          label="Recommended Qty"
          value={formatShares(snapshot.recommended_quantity)}
        />
        <Detail
          label="Planned Risk"
          value={formatCurrency(snapshot.estimated_risk_amount)}
        />
        <Detail
          label="Planned Reward"
          value={formatCurrency(snapshot.estimated_reward_amount)}
        />
        <Detail
          label="Planned R/R"
          value={formatIntradayIndicatorValue(snapshot.risk_reward_ratio, "R/R")}
        />
        <Detail
          label="Plan Quality"
          value={`${displayValue(snapshot.trade_plan_quality_grade)} · ${displayValue(
            snapshot.trade_plan_quality_status,
          )}`}
        />
        <Detail
          label="Risk Controls"
          value={`${displayValue(snapshot.risk_controls_mode)} · ${displayValue(
            snapshot.risk_controls_status,
          )}`}
        />
        <Detail
          label="Market Session"
          value={`${displayValue(snapshot.market_session_phase)} · ${displayValue(
            snapshot.market_session_risk,
          )}`}
        />
        <Detail
          label="Broker Fill"
          value={`${displayValue(snapshot.broker_fill_status)} · ${displayValue(
            snapshot.broker_reference,
          )}`}
        />
        <Detail
          label="Source"
          value={displayValue(snapshot.demo_or_real_source)}
        />
      </div>

      {(blockers.length > 0 || warnings.length > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100">
              Creation-time blockers
            </p>
            {blockers.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs leading-5 text-rose-50/80">
                {blockers.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs leading-5 text-zinc-500">—</p>
            )}
          </div>
          <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
              Creation-time warnings
            </p>
            {warnings.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-50/80">
                {warnings.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs leading-5 text-zinc-500">—</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function planVsActualTone(status: PlanVsActualStatus) {
  if (status === "followed_plan") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "minor_deviation") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  if (status === "needs_review" || status === "incomplete") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function formatPlanVsActualMetricValue(
  value: number | string | null,
  unit: PlanVsActualReview["metrics"][number]["unit"],
) {
  if (typeof value === "string") {
    return displayValue(value);
  }

  if (unit === "shares") {
    return formatShares(value);
  }

  if (unit === "currency") {
    return formatSignedCurrency(value);
  }

  if (unit === "percent") {
    return formatPercent(value);
  }

  if (unit === "r_multiple") {
    return formatSignedR(value);
  }

  if (unit === "ratio") {
    return formatIntradayIndicatorValue(value, "R/R");
  }

  return displayValue(value);
}

function ClosedTradePlanVsActualReviewPanel({
  position,
}: {
  position: ClosedPosition;
}) {
  const review = buildPlanVsActualReview({
    ticker: position.ticker,
    snapshot: position.executionMetadata?.trade_planning_snapshot ?? null,
    executionMetadata: position.executionMetadata,
    entryPrice: position.entryPriceValue,
    exitPrice: parseNumber(position.exitPrice),
    shares: position.positionSizeValue,
    realizedPnl: position.pnlValue,
    realizedR: position.rMultipleValue,
    closeReason: position.exitNotes,
    isDemo: isDemoPosition(position),
  });
  const visibleDeviations = review.deviations.slice(0, 4);
  const visibleWarnings = review.warnings.slice(0, 4);
  const reviewJson = planVsActualReviewJson(review);

  return (
    <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
      <div
        id="trade-plan-vs-actual-review-json"
        data-agent-readable="true"
        data-review-id={review.review_id}
        data-review-status={review.status}
        data-review-grade={review.grade}
        data-snapshot-id={review.snapshot_id ?? ""}
        data-ticker={position.ticker}
        className="sr-only"
      >
        {reviewJson}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Plan vs Actual Review
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {review.process_summary}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            A losing trade can still follow the plan if the loss stayed within
            planned risk. This review is descriptive, not predictive.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${planVsActualTone(
            review.status,
          )}`}
        >
          {formatStatisticsStatusLabel(review.status)} · {review.grade}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Detail
          label="Quantity Deviation"
          value={formatPercent(review.quantity_deviation_percent)}
        />
        <Detail
          label="Risk Deviation"
          value={formatPercent(review.risk_deviation_percent)}
        />
        <Detail
          label="Reward Capture"
          value={formatPercent(review.reward_capture_percent)}
        />
        <Detail
          label="Realized vs Planned R"
          value={formatIntradayIndicatorValue(review.realized_vs_planned_r, "x")}
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-md border border-white/10 bg-black/20">
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 border-b border-white/10 px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
          <span>Metric</span>
          <span>Planned</span>
          <span>Actual</span>
        </div>
        <div className="divide-y divide-white/10">
          {review.metrics.map((metric) => (
            <div
              key={metric.metric_id}
              className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-3 py-2 text-xs leading-5 text-zinc-300"
            >
              <span className="font-medium text-zinc-200">{metric.label}</span>
              <span>
                {formatPlanVsActualMetricValue(
                  metric.planned_value,
                  metric.unit,
                )}
              </span>
              <span>
                {formatPlanVsActualMetricValue(metric.actual_value, metric.unit)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {(visibleDeviations.length > 0 || visibleWarnings.length > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100">
              Deviations
            </p>
            {visibleDeviations.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs leading-5 text-rose-50/80">
                {visibleDeviations.map((item) => (
                  <li key={item.deviation_id}>{item.message}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs leading-5 text-zinc-500">—</p>
            )}
          </div>
          <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
              Review Warnings
            </p>
            {visibleWarnings.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-50/80">
                {visibleWarnings.map((item) => (
                  <li key={item.warning_id}>{item.message}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs leading-5 text-zinc-500">—</p>
            )}
          </div>
        </div>
      )}

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          View plan-vs-actual checks
        </summary>
        <div className="mt-3 space-y-2">
          {review.checks.map((item) => (
            <div
              key={item.check_id}
              className="rounded-md border border-white/10 bg-black/20 p-3"
            >
              <p className="text-sm font-semibold text-zinc-200">
                {item.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {item.message}
              </p>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}

function ClosedTradeExecutionReview({
  summary,
}: {
  summary: HistoryTradeSummary;
}) {
  const quality = summary.execution_quality;

  return (
    <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        Entry / Exit Execution Review
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">
        Read-only execution context from stored broker/mock confirmation metadata.
        Missing values stay unknown.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Detail
          label="Entry Slippage"
          value={formatSignedCurrency(quality.entry_slippage)}
        />
        <Detail
          label="Entry Fill Status"
          value={formatStatisticsStatusLabel(quality.entry_fill_status)}
        />
        <Detail
          label="Exit Fill Status"
          value={formatStatisticsStatusLabel(quality.exit_fill_status)}
        />
        <Detail
          label="Exit Price Source"
          value={formatStatisticsStatusLabel(quality.exit_price_source)}
        />
        <Detail
          label="Manual KÖP Recorded"
          value={quality.manual_buy_confirmation_recorded ? "YES" : "UNKNOWN"}
        />
        <Detail
          label="Manual SÄLJ Recorded"
          value={quality.manual_sell_confirmation_recorded ? "YES" : "UNKNOWN"}
        />
        <Detail
          label="Broker / Mock Source"
          value={formatStatisticsStatusLabel(quality.broker_or_mock_source)}
        />
        <Detail
          label="Outcome"
          value={historyOutcomeLabel(summary.outcome)}
        />
      </div>
    </section>
  );
}

function ClosedTradePartialFillReview({
  position,
  summary,
}: {
  position: ClosedPosition;
  summary: HistoryTradeSummary;
}) {
  const metadata = position.executionMetadata;
  const exitFills = metadata?.exit_fills ?? [];
  const entryFills = metadata?.entry_fills ?? [];

  return (
    <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Partial Fills / Exits
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Exit-fill realized PnL is preferred when present. Remaining shares
            are shown separately to avoid double-counting.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${historyOutcomeTone(
            summary.outcome,
          )}`}
        >
          {formatStatisticsStatusLabel(summary.partial.status)}
          {summary.partial.had_partial_exits ? " · HAD PARTIAL EXIT" : ""}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Detail label="Entry Fills" value={String(summary.partial.entry_fills_count)} />
        <Detail label="Exit Fills" value={String(summary.partial.exit_fills_count)} />
        <Detail label="Remaining Shares" value={formatShares(summary.partial.remaining_shares)} />
        <Detail label="Average Exit" value={formatCurrency(summary.partial.average_exit_price)} />
        <Detail
          label="Exit-Fill PnL"
          value={formatSignedCurrency(summary.partial.realized_pnl_from_exits)}
        />
      </div>

      {entryFills.length + exitFills.length === 0 ? (
        <p className="mt-4 rounded-md border border-white/10 bg-white/[0.025] p-3 text-xs leading-5 text-zinc-500">
          No structured entry/exit fill rows are stored for this trade.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <FillRows title="Entry fills" fills={entryFills} />
          <FillRows title="Exit fills" fills={exitFills} />
        </div>
      )}
    </section>
  );
}

function FillRows({
  title,
  fills,
}: {
  title: string;
  fills: Array<{
    fill_id?: string | null;
    status?: string | null;
    price?: number | null;
    shares?: number | null;
    filled_at?: string | null;
    reference_note?: string | null;
  }>;
}) {
  if (fills.length === 0) {
    return (
      <div className="rounded-md border border-white/10 bg-white/[0.025] p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
          {title}
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-500">No fill rows.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-white/10 bg-white/[0.025] p-3">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
        {title}
      </p>
      <div className="mt-3 space-y-2">
        {fills.map((fill, index) => (
          <div
            key={fill.fill_id ?? `${title}-${index}`}
            className="grid gap-2 rounded-md border border-white/10 bg-black/20 p-2 sm:grid-cols-4"
          >
            <Detail label="Status" value={formatStatisticsStatusLabel(fill.status)} />
            <Detail label="Price" value={formatCurrency(fill.price ?? null)} />
            <Detail label="Shares" value={formatShares(fill.shares ?? null)} />
            <Detail
              label="Filled"
              value={fill.filled_at ? formatDate(fill.filled_at) : "—"}
            />
          </div>
        ))}
      </div>
    </div>
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

function liveDetailsToneFromAction(
  action: string,
): "positive" | "warning" | "danger" | "neutral" {
  if (isCloseRequiredAction(action)) return "danger";
  if (isTakeProfitAction(action)) return "positive";
  if (action === "NO_ACTION" || action === "HOLD") return "neutral";
  if (action === "REVIEW_REQUIRED" || action === "WATCH") return "warning";
  return "warning";
}

function liveDetailsToneFromSeverity(
  severity: EndOfDaySafetyStatus["severity"] | PositionUpdateUrgency["urgency"],
): "positive" | "warning" | "danger" | "neutral" {
  if (severity === "critical") return "danger";
  if (severity === "warning") return "warning";
  if (severity === "normal" || severity === "none") return "positive";
  return "neutral";
}

function buildLiveTradeRiskFlags({
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
  return [
    eodSafetyStatus.severity !== "none" ? eodSafetyStatus.message : null,
    ...warnings,
    latestUpdate?.intradayIndicators?.isAboveVwap === false
      ? "Price is below VWAP on latest intraday snapshot."
      : null,
    preview && preview.warning_type !== "none"
      ? `Broker preview warning: ${brokerWarningTypeLabel(preview.warning_type)}`
      : null,
  ].filter((value): value is string => Boolean(value));
}

function LiveTradeDetailsModal({
  position,
  latestUpdate,
  currentR,
  unrealizedPnl,
  liveSellGuidance,
  warnings,
  eodSafetyStatus,
  positionUrgency,
  riskControlsEvaluation,
  showEodManualReview,
  eodRiskAcknowledged,
  status,
  realityBadges,
  onAcknowledgeEndOfDayRisk,
  onClose,
}: {
  position: ActivePosition;
  latestUpdate?: LatestPositionUpdate;
  currentR: number | null;
  unrealizedPnl: { pnl: number | null; percent: number | null };
  liveSellGuidance: LiveSellGuidance;
  warnings: string[];
  eodSafetyStatus: EndOfDaySafetyStatus;
  positionUrgency: PositionUpdateUrgency;
  riskControlsEvaluation: RiskControlsEvaluation;
  showEodManualReview: boolean;
  eodRiskAcknowledged: boolean;
  status: React.ReactNode;
  realityBadges: DataModeBadge[];
  onAcknowledgeEndOfDayRisk: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const intradayIndicators = latestUpdate?.intradayIndicators;
  const riskFlags = buildLiveTradeRiskFlags({
    warnings,
    eodSafetyStatus,
    latestUpdate,
    position,
  });
  const guidance = liveSellGuidance.primary_message;
  const guidanceAction = liveSellActionToLegacyAction(liveSellGuidance.action);
  const updatedAt = latestUpdate ? latestUpdate.updatedAt : position.openedAt;
  const positionValue =
    position.entryPriceValue !== null && position.positionSizeValue !== null
      ? formatCurrency(position.entryPriceValue * position.positionSizeValue)
      : "—";
  const riskPerShare =
    position.entryPriceValue !== null && position.stopLossValue !== null
      ? formatCurrency(Math.abs(position.entryPriceValue - position.stopLossValue))
      : "—";
  const maxLoss =
    position.entryPriceValue !== null &&
    position.stopLossValue !== null &&
    position.positionSizeValue !== null
      ? formatCurrency(
          Math.abs(position.entryPriceValue - position.stopLossValue) *
            position.positionSizeValue,
        )
      : "—";
  const currentPercent =
    latestUpdate?.unrealizedPercentValue !== null &&
    latestUpdate?.unrealizedPercentValue !== undefined
      ? formatSignedPercent(latestUpdate.unrealizedPercentValue)
      : formatSignedPercent(unrealizedPnl.percent);
  const executionQuality = calculateExecutionQuality(position.executionMetadata);
  const auditTimeline = buildExecutionTimeline({
    positionId: position.id,
    recommendationId: position.recommendationId,
    ticker: position.ticker,
    status: "open",
    openedAt: position.openedAtRaw,
    executionMetadata: position.executionMetadata,
    localEvents: readTradeManagementEvents(),
  });
  const auditReplay = buildHandoffSessionReplay({
    executionMetadata: position.executionMetadata,
    timelineEvents: auditTimeline,
    openedAt: position.openedAtRaw,
  });
  const auditHandoffQuality = calculateHandoffQuality({
    executionMetadata: position.executionMetadata,
    executionQualityMetrics: executionQuality,
    handoffReplay: auditReplay,
    timelineEvents: auditTimeline,
    calculatedAt: position.executionMetadata?.handoff_quality?.calculated_at,
  });
  const auditSuggestions = buildExecutionImprovementSuggestions({
    brokerExecutionMetadata: position.executionMetadata,
    handoffQuality: auditHandoffQuality,
    executionQualityMetrics: executionQuality,
    handoffReplay: auditReplay,
    timelineEvents: auditTimeline,
    eodSafetyStatus,
  });
  const preview = position.executionMetadata?.broker_order_preview;
  const auditSummary =
    position.executionMetadata
      ? `Actual fill ${formatCurrency(
          position.executionMetadata.actual_fill_price,
        )}, planned ${formatCurrency(
          position.executionMetadata.planned_entry_price,
        )}. Handoff quality ${auditHandoffQuality.label} at ${
          auditHandoffQuality.score
        }/100.`
      : "No broker execution metadata has been recorded for this live trade yet.";

  return (
    <div
      className="trade-recommendation-details-backdrop"
      role="presentation"
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <section
        aria-labelledby="trade-live-details-title"
        aria-modal="true"
        className="trade-recommendation-details-modal trade-live-details-modal"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="trade-recommendation-details-titlebar">
          <h2 id="trade-live-details-title">Live Day Trade Details</h2>
          <button
            type="button"
            aria-label="Close live day trade details"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className="trade-recommendation-details-close"
          >
            <Image
              src="/trade-assets/x-icn.svg"
              alt=""
              aria-hidden="true"
              width={29}
              height={29}
            />
          </button>
        </div>

        <div className="trade-recommendation-details-scroll">
          <header className="trade-recommendation-details-header">
            <CompanyIdentity
              ticker={position.ticker}
              companyName={position.companyName}
              size="live"
            />
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <DataModePillRow badges={realityBadges} />
              {status}
            </div>
          </header>

          <DataModeSurfaceNotice
            surface={{
              surface_id: "live_day_trades",
              label: "Live Day Trades",
              mode: isDemoPosition(position) ? "demo" : "manual_broker_record",
              source_kind: isDemoPosition(position) ? "local_storage" : "manual_broker",
              freshness_status: latestUpdate ? "unknown" : "stale",
              execution_reality: isDemoPosition(position) ? "demo_only" : "manual_only",
              badges: realityBadges,
              warnings: [],
              summary:
                "This live trade is a Ture record. Broker execution is user-entered or human-confirmed; Ture cannot submit Avanza orders.",
            }}
            compact
          />

          <RecommendationDetailsSection title="Quick Decision">
            <div className="trade-recommendation-details-quick-decision">
              <div className="trade-recommendation-details-guidance">
                <div>
                  <p>{recommendationDetailsValue(guidance)}</p>
                  <span className="trade-recommendation-details-guidance__timestamp">
                    Updated {recommendationDetailsValue(updatedAt)}
                  </span>
                </div>
                <div className="trade-recommendation-details-pill-row trade-recommendation-details-pill-row--quick">
                  <RecommendationDetailsPill
                    label={liveSellGuidance.primary_label}
                    tone={liveDetailsToneFromAction(guidanceAction)}
                  />
                  <RecommendationDetailsPill
                    label={liveSellGuidance.urgency}
                    tone={liveSellUrgencyTone(liveSellGuidance.urgency)}
                  />
                  <RecommendationDetailsPill
                    label={liveSellGuidance.trigger}
                    tone={liveSellUrgencyTone(liveSellGuidance.urgency)}
                  />
                </div>
              </div>

              <div className="trade-recommendation-details-two-column">
                <RecommendationDetailsTextCard label="Live Sell Guidance">
                  <p>{recommendationDetailsValue(liveSellGuidance.next_step)}</p>
                  <p>{recommendationDetailsValue(liveSellGuidance.why_now)}</p>
                  <p>
                    Guidance is advisory only. Trade cannot submit orders or click
                    Avanza SÄLJ.
                  </p>
                </RecommendationDetailsTextCard>
                <RecommendationDetailsTextCard label="Watch This">
                  <RecommendationDetailsTextStack
                    items={[
                      ...liveSellGuidance.blockers,
                      ...liveSellGuidance.warnings,
                      ...riskFlags,
                    ].slice(0, 4)}
                    empty="No major live risk flags surfaced."
                    tone="warning"
                  />
                </RecommendationDetailsTextCard>
              </div>

              <RecommendationDetailsMetricGrid
                variant="wide"
                metrics={[
                  {
                    label: "Trigger",
                    value: liveSellGuidance.trigger,
                  },
                  {
                    label: "Confidence",
                    value: liveSellGuidance.confidence,
                  },
                  {
                    label: "Distance to Target",
                    value: formatCurrency(liveSellGuidance.distance_to_target),
                  },
                  {
                    label: "Distance to Stop",
                    value: formatCurrency(liveSellGuidance.distance_to_stop),
                  },
                  {
                    label: "Current R",
                    value: formatSignedR(liveSellGuidance.current_r),
                  },
                  {
                    label: "Best Known Price",
                    value: formatCurrency(liveSellGuidance.best_price),
                  },
                  {
                    label: "Best Known R",
                    value: formatSignedR(liveSellGuidance.best_r),
                  },
                  {
                    label: "Fade From Best",
                    value: formatSignedR(liveSellGuidance.profit_fade_from_best),
                  },
                  {
                    label: "Evaluated",
                    value: formatDate(liveSellGuidance.evaluated_at),
                  },
                ]}
              />
            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="Trade Plan">
            <div className="trade-recommendation-details-trade-plan">
              <RecommendationDetailsMetricGrid
                metrics={[
                  {
                    label: "Current",
                    value: latestUpdate ? latestUpdate.currentPrice : "—",
                  },
                  {
                    label: "Unrealized",
                    value: formatSignedCurrency(unrealizedPnl.pnl),
                    tone: unrealizedPnl.pnl,
                  },
                  { label: "PnL %", value: currentPercent },
                  { label: "Current R", value: formatSignedR(currentR) },
                  { label: "Entry", value: position.entryPrice },
                  { label: "Stop", value: position.stopLoss },
                  { label: "Target", value: position.target1 },
                  { label: "Shares", value: position.positionSize },
                ]}
              />
              <div
                className="trade-recommendation-details-trade-plan__divider"
                aria-hidden="true"
              />
              <RecommendationDetailsMetricGrid
                variant="wide"
                metrics={[
                  { label: "Direction", value: position.direction },
                  {
                    label: "Setup Type",
                    value: setupTypeLabelFromActivePosition(position),
                  },
                  { label: "Position Value", value: positionValue },
                  { label: "Max Loss", value: maxLoss },
                  { label: "Risk/share", value: riskPerShare },
                  {
                    label: "Partial Status",
                    value:
                      position.executionMetadata?.partial_position_status?.replaceAll(
                        "_",
                        " ",
                      ) ?? "fully open",
                  },
                  {
                    label: "Realized From Exits",
                    value: formatSignedCurrency(
                      position.executionMetadata?.realized_pnl_from_exits ?? null,
                    ),
                    tone:
                      position.executionMetadata?.realized_pnl_from_exits ?? null,
                  },
                  { label: "Time In Trade", value: formatTimeInTrade(position.openedAtRaw) },
                ]}
              />
            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="Live Trade Context">
            <div className="trade-recommendation-details-stack">
              <RiskControlsEvaluationPanel
                title="Live Risk Controls"
                evaluation={riskControlsEvaluation}
              />
              <div
                id="trade-risk-controls-live-trade-evaluation-json"
                data-agent-readable="true"
                data-evaluation-id={riskControlsEvaluation.evaluation_id}
                data-evaluation-status={riskControlsEvaluation.status}
                data-mode={riskControlsEvaluation.mode}
                className="sr-only"
              >
                {riskControlsEvaluationJson(riskControlsEvaluation)}
              </div>

              {positionUrgency.urgency === "critical" && (
                <RecommendationDetailsTextCard
                  label="Critical Manual Action Required"
                  pill={<RecommendationDetailsPill label="Critical" tone="danger" />}
                >
                  <p>{recommendationDetailsValue(guidance)}</p>
                </RecommendationDetailsTextCard>
              )}

              {showEodManualReview && (
                <RecommendationDetailsTextCard
                  label="EOD Manual Review Required"
                  pill={
                    <RecommendationDetailsPill
                      label={
                        eodRiskAcknowledged
                          ? "Acknowledged"
                          : endOfDaySafetyLabel(eodSafetyStatus.status)
                      }
                      tone={
                        eodRiskAcknowledged
                          ? "neutral"
                          : liveDetailsToneFromSeverity(eodSafetyStatus.severity)
                      }
                    />
                  }
                >
                  <p>
                    {recommendationDetailsValue(
                      `${eodSafetyStatus.message} Close in broker first, then close trade in app.`,
                    )}
                  </p>
                  {!eodRiskAcknowledged && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onAcknowledgeEndOfDayRisk();
                      }}
                      className="trade-live-details-ack-button"
                    >
                      Acknowledge EOD Risk
                    </button>
                  )}
                </RecommendationDetailsTextCard>
              )}

              {(liveSellGuidance.why_now ||
                liveSellGuidance.protective_action_reason ||
                liveSellGuidance.is_profit_fading) && (
                <RecommendationDetailsTextCard
                  label="Why Now?"
                  pill={
                    liveSellGuidance.is_profit_fading ? (
                      <RecommendationDetailsPill label="Profit Fade" tone="warning" />
                    ) : undefined
                  }
                >
                  <p>{recommendationDetailsValue(liveSellGuidance.why_now)}</p>
                  {liveSellGuidance.protective_action_reason && (
                    <p>
                      {recommendationDetailsValue(
                        liveSellGuidance.protective_action_reason,
                      )}
                    </p>
                  )}
                  {liveSellGuidance.is_profit_fading && (
                    <p>
                      Best known R {formatSignedR(liveSellGuidance.best_r)} has
                      faded by{" "}
                      {formatSignedR(liveSellGuidance.profit_fade_from_best)}.
                    </p>
                  )}
                </RecommendationDetailsTextCard>
              )}

            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="Live Trade Details">
            <div className="trade-recommendation-details-stack">
              <RecommendationDetailsTextCard
                label="Intraday Confirmation"
                pill={
                  <RecommendationDetailsPill
                    label={
                      intradayIndicators?.isAboveVwap === false
                        ? "Below VWAP"
                        : intradayIndicators
                          ? "Live Data"
                          : "Waiting"
                    }
                    tone={
                      intradayIndicators?.isAboveVwap === false
                        ? "danger"
                        : intradayIndicators
                          ? "positive"
                          : "neutral"
                    }
                  />
                }
              >
                <p>
                  {intradayIndicators
                    ? `VWAP ${
                        intradayIndicators.isAboveVwap === null
                          ? "Unavailable"
                          : intradayIndicators.isAboveVwap
                            ? "Above"
                            : "Below"
                      }, Price vs VWAP ${formatIntradayIndicatorValue(
                        intradayIndicators.priceVsVwapPercent,
                        "%",
                      )}, Momentum ${recommendationDetailsValue(
                        intradayIndicators.momentumDirection,
                      )}, Volume ${recommendationDetailsValue(
                        intradayIndicators.volumeTrend,
                      )}`
                    : "Intraday indicators are waiting for the next live update."}
                </p>
              </RecommendationDetailsTextCard>

              <div className="trade-recommendation-details-two-column trade-recommendation-details-two-column--flush">
                <RecommendationDetailsTextCard label="Action Reason">
                  <p>{recommendationDetailsValue(latestUpdate?.reason)}</p>
                  {latestUpdate?.explanation && (
                    <p>{recommendationDetailsValue(latestUpdate.explanation)}</p>
                  )}
                </RecommendationDetailsTextCard>
                <RecommendationDetailsTextCard label="Invalidation / Warnings">
                  <RecommendationDetailsTextStack
                    items={[
                      position.invalidation,
                      ...warnings,
                      latestUpdate?.newStop && latestUpdate.newStop !== "Not set"
                        ? `New stop: ${latestUpdate.newStop}`
                        : null,
                    ].filter((item): item is string => Boolean(item))}
                    empty="—"
                    tone="warning"
                  />
                </RecommendationDetailsTextCard>
              </div>
            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="Execution Audit">
            <div className="trade-recommendation-details-stack">
              <RecommendationDetailsTextCard
                label="Audit Summary"
                pill={
                  <RecommendationDetailsPill
                    label={
                      position.executionMetadata
                        ? getExecutionQualityLabel(executionQuality.quality_rating)
                        : "Not Recorded"
                    }
                    tone={
                      position.executionMetadata
                        ? executionQuality.quality_rating === "poor"
                          ? "danger"
                          : executionQuality.quality_rating === "acceptable"
                            ? "warning"
                            : "positive"
                        : "neutral"
                    }
                  />
                }
              >
                <p>{recommendationDetailsValue(auditSummary)}</p>
                <p>
                  Execution audit is analytics only. It does not create orders,
                  submit broker actions, or control Avanza.
                </p>
              </RecommendationDetailsTextCard>

              <RecommendationDetailsMetricGrid
                variant="wide"
                metrics={[
                  {
                    label: "Broker Status",
                    value:
                      position.executionMetadata?.broker_order_status
                        ? brokerOrderStatusLabel(
                            position.executionMetadata.broker_order_status,
                          )
                        : "—",
                  },
                  {
                    label: "Handoff",
                    value: `${auditHandoffQuality.label} · ${auditHandoffQuality.score}/100`,
                  },
                  {
                    label: "Replay",
                    value: auditReplay.overall_status,
                  },
                  {
                    label: "Timeline Events",
                    value: String(auditTimeline.length),
                  },
                  {
                    label: "Preview Warning",
                    value: preview
                      ? brokerWarningTypeLabel(preview.warning_type)
                      : "—",
                  },
                  {
                    label: "Suggestions",
                    value: String(auditSuggestions.suggestions.length),
                  },
                ]}
              />

              <div
                className="trade-recommendation-details-dashed-divider"
                aria-hidden="true"
              />

              <RecommendationDetailsContextCard
                label="Execution Trail"
                pill={
                  <RecommendationDetailsPill
                    label={auditReplay.overall_status}
                    tone={
                      auditReplay.overall_status === "complete"
                        ? "positive"
                        : auditReplay.overall_status === "failed"
                          ? "danger"
                          : auditReplay.overall_status === "partial"
                            ? "warning"
                            : "neutral"
                    }
                  />
                }
                rows={[
                  <RecommendationDetailsContextRow
                    key="broker-execution"
                    label="Broker Execution"
                    summary={
                      position.executionMetadata
                        ? `Actual shares ${formatShares(
                            position.executionMetadata.actual_shares,
                          )}, planned ${formatShares(
                            position.executionMetadata.planned_shares,
                          )}.`
                        : "No broker execution metadata recorded."
                    }
                    detail={
                      position.executionMetadata?.broker_confirmed_at
                        ? `Confirmed ${formatDate(
                            position.executionMetadata.broker_confirmed_at,
                          )}`
                        : undefined
                    }
                    pill={
                      <RecommendationDetailsPill
                        label={
                          position.executionMetadata?.broker_order_status
                            ? brokerOrderStatusLabel(
                                position.executionMetadata.broker_order_status,
                              )
                            : "Unknown"
                        }
                        tone={position.executionMetadata ? "positive" : "neutral"}
                      />
                    }
                  />,
                  <RecommendationDetailsContextRow
                    key="handoff-quality"
                    label="Handoff Quality"
                    summary={auditHandoffQuality.summary}
                    detail={`Calculated ${formatDate(
                      auditHandoffQuality.calculated_at,
                    )}`}
                    pill={
                      <RecommendationDetailsPill
                        label={`${auditHandoffQuality.score}/100`}
                        tone={
                          auditHandoffQuality.rating === "poor"
                            ? "danger"
                            : auditHandoffQuality.rating === "acceptable"
                              ? "warning"
                              : "positive"
                        }
                      />
                    }
                  />,
                  <RecommendationDetailsContextRow
                    key="handoff-replay"
                    label="Handoff Replay"
                    summary={auditReplay.summary}
                    detail={
                      auditReplay.handoff_session_id
                        ? `Session ${shortPayloadId(auditReplay.handoff_session_id)}`
                        : undefined
                    }
                    pill={
                      <RecommendationDetailsPill
                        label={auditReplay.overall_status}
                        tone={
                          auditReplay.overall_status === "complete"
                            ? "positive"
                            : auditReplay.overall_status === "failed"
                              ? "danger"
                              : auditReplay.overall_status === "partial"
                                ? "warning"
                                : "neutral"
                        }
                      />
                    }
                  />,
                  <RecommendationDetailsContextRow
                    key="improvements"
                    label="Improvement Suggestions"
                    summary={
                      auditSuggestions.suggestions[0]?.suggested_action ||
                      "No execution improvement suggestions surfaced."
                    }
                    detail={`Open suggestions: ${auditSuggestions.suggestions.length}`}
                    pill={
                      <RecommendationDetailsPill
                        label={
                          auditSuggestions.suggestions[0]?.priority || "None"
                        }
                        tone={
                          auditSuggestions.suggestions[0]?.priority === "high"
                            ? "danger"
                            : auditSuggestions.suggestions[0]?.priority === "medium"
                              ? "warning"
                              : "neutral"
                        }
                      />
                    }
                  />,
                ]}
                footer="Full audit details stay available below for traceability, but they do not affect trading logic or broker flow."
              >
                <p>
                  {recommendationDetailsValue(
                    auditTimeline[0]?.description ||
                      "Audit trail is based on available execution metadata and local handoff events.",
                  )}
                </p>
              </RecommendationDetailsContextCard>
            </div>

            <FullAuditTrail
              timeline={auditTimeline}
              replay={auditReplay}
              suggestions={auditSuggestions}
            />
            <div className="trade-recommendation-details-brand-mark" aria-hidden="true">
              <Image
                src="/trade-assets/ture-logo-mark.svg"
                alt=""
                width={72}
                height={72}
              />
            </div>
          </RecommendationDetailsSection>
        </div>
      </section>
    </div>
  );
}

function ActivePositionCard({
  position,
  latestUpdate,
  marketCloseWarning,
  eodSafetyStatus,
  eodSafetyDate,
  isMarketOpen,
  currentTime,
  riskControlsEvaluation,
  isSaving,
  onClosePosition,
}: {
  position: ActivePosition;
  latestUpdate?: LatestPositionUpdate;
  marketCloseWarning: string;
  eodSafetyStatus: EndOfDaySafetyStatus;
  eodSafetyDate: string;
  isMarketOpen: boolean;
  currentTime: Date;
  riskControlsEvaluation: RiskControlsEvaluation;
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
  const previousBestPrice =
    position.direction === "Short"
      ? latestUpdate?.intradayIndicators?.recentLow ?? null
      : latestUpdate?.intradayIndicators?.recentHigh ?? null;
  const liveSellGuidance = buildLiveSellGuidance({
    position_id: position.id,
    ticker: position.ticker,
    direction: position.direction,
    current_price: currentPriceValue,
    entry_price: position.entryPriceValue,
    stop_price: position.stopLossValue,
    target_price: position.target1Value ?? position.target2Value,
    position_size: position.positionSizeValue,
    opened_at: position.openedAtRaw,
    last_updated_at: latestUpdate?.updatedAtRaw ?? null,
    is_market_open: isMarketOpen,
    eod_safety_status: eodSafetyStatus,
    rule_action: action,
    previous_best_price: previousBestPrice,
    is_demo: isDemoPosition(position),
    now: currentTime,
  });
  const guidanceAction = liveSellActionToLegacyAction(liveSellGuidance.action);
  const partialPositionStatus =
    position.executionMetadata?.partial_position_status ?? "fully_open";
  const isPartiallyClosed = partialPositionStatus === "partially_closed";
  const closeButtonTone =
    liveSellGuidance.should_prepare_sell_handoff || isTakeProfitAction(action)
      ? "trade-live-close-button--active"
      : "trade-live-close-button--neutral";
  const showEodManualReview =
    eodSafetyStatus.status === "review_required" ||
    eodSafetyStatus.status === "overnight_risk";
  const [eodRiskAcknowledged, setEodRiskAcknowledged] = useState(() =>
    readEndOfDayAcknowledgement(position.id, eodSafetyDate),
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const activePositionRealityBadges = [
    isDemoPosition(position)
      ? dataModeBadgeForMode("demo")
      : dataModeBadgeForMode("manual_broker_record"),
    dataModeBadgeForExecutionReality(
      isDemoPosition(position) ? "demo_only" : "manual_only",
    ),
  ];
  const liveActionPill = (
    <span
      className={`trade-live-action-pill ${positionActionPillClassName(
        guidanceAction,
      )} ${positionActionClassName(guidanceAction)}`}
    >
      {liveSellGuidance.primary_label}
    </span>
  );

  function acknowledgeEndOfDayRisk() {
    writeEndOfDayAcknowledgement(position.id, eodSafetyDate, true);
    setEodRiskAcknowledged(true);
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${displayValue(position.ticker)} live day trade, ${displayValue(
        setupTypeLabelFromActivePosition(position),
      )}, in trade ${displayValue(formatTimeInTrade(position.openedAtRaw))}`}
      onClick={() => setIsDetailsOpen(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setIsDetailsOpen(true);
        }
      }}
      className={`trade-live-card ${liveSellGuidanceCardClassName(
        liveSellGuidance,
      )}`}
    >
      <div className="trade-live-card__header">
        <CompanyIdentity
          ticker={position.ticker}
          companyName={position.companyName}
          size="live"
        />
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <DataModePillRow badges={activePositionRealityBadges.slice(0, 1)} />
          {isPartiallyClosed && (
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
              Partially Closed
            </span>
          )}
          <span
            className={`trade-live-action-pill ${positionActionPillClassName(
              guidanceAction,
            )} ${positionActionClassName(guidanceAction)}`}
          >
            {liveSellGuidance.primary_label}
          </span>
        </div>
      </div>

      <LiveMetricGrid
        metrics={[
          {
            label: "Current",
            value: latestUpdate ? latestUpdate.currentPrice : "—",
          },
          {
            label: "Unrealized",
            value: formatSignedCurrency(unrealizedPnl.pnl),
            tone: unrealizedPnl.pnl,
          },
          { label: "Current R", value: formatSignedR(currentR) },
          { label: "Shares", value: position.positionSize },
          { label: "Entry", value: position.entryPrice },
          { label: "Stop", value: position.stopLoss },
          { label: "Target", value: position.target1 },
        ]}
      />

      <div className="trade-live-guidance">
        <p>
          {displayValue(liveSellGuidance.primary_message)}
          <span className="mt-1 block text-xs leading-5 text-zinc-500">
            {displayValue(liveSellGuidance.next_step)}
          </span>
          {isPartiallyClosed && (
            <span className="mt-1 block text-xs leading-5 text-cyan-100">
              Partial close recorded. Remaining shares:{" "}
              {formatShares(position.executionMetadata?.remaining_shares)}.
            </span>
          )}
          {liveSellGuidance.is_profit_fading && (
            <span className="mt-1 block text-xs leading-5 text-amber-100">
              Profit fade: {formatSignedR(liveSellGuidance.profit_fade_from_best)} from best known R.
            </span>
          )}
        </p>
        <span>
          Updated{" "}
          {displayValue(latestUpdate ? latestUpdate.updatedAt : position.openedAt)}
        </span>
      </div>

      <div className="trade-live-card__footer">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClosePosition(position);
          }}
          disabled={isSaving}
          className={`trade-live-close-button ${closeButtonTone}`}
        >
          {liveSellGuidance.should_prepare_sell_handoff
            ? "Prepare Sell Order"
            : "Close Trade"}
        </button>
      </div>

      {isDetailsOpen && (
        <LiveTradeDetailsModal
          position={position}
          latestUpdate={latestUpdate}
          currentR={currentR}
          unrealizedPnl={unrealizedPnl}
          liveSellGuidance={liveSellGuidance}
          warnings={warnings}
          eodSafetyStatus={eodSafetyStatus}
          positionUrgency={positionUrgency}
          riskControlsEvaluation={riskControlsEvaluation}
          showEodManualReview={showEodManualReview}
          eodRiskAcknowledged={eodRiskAcknowledged}
          status={liveActionPill}
          realityBadges={activePositionRealityBadges}
          onAcknowledgeEndOfDayRisk={acknowledgeEndOfDayRisk}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </article>
  );
}

function sellAgentCommandTone(status: SellAgentHandoffStatus) {
  if (status === "ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function sellHardStopTone(status: SellHardStopOverallStatus) {
  if (status === "ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function sellHardStopRuleTone(status: SellHardStopStatus) {
  if (status === "passed" || status === "not_applicable") {
    return "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-100";
  }

  if (status === "warning" || status === "unknown") {
    return "border-amber-300/20 bg-amber-300/[0.06] text-amber-100";
  }

  return "border-rose-300/20 bg-rose-300/[0.06] text-rose-100";
}

function sellFormMappingTone(status: SellFormMappingStatus) {
  if (status === "ready") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning" || status === "missing") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  if (status === "blocked") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.035] text-zinc-400";
}

function sellFormMappingConfidenceTone(confidence: SellFormMappingConfidence) {
  if (confidence === "high") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  if (confidence === "medium") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }

  if (confidence === "low") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-white/10 bg-white/[0.035] text-zinc-400";
}

function SellHardStopContractPanel({
  contract,
  contractJson,
  payload,
}: {
  contract: SellHardStopContract;
  contractJson: string;
  payload: TradeExitExecutionPayload;
}) {
  const visibleBlockers = contract.top_blockers.slice(0, 3);
  const visibleWarnings = contract.top_warnings.slice(0, 3);

  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-4">
      <div
        id="trade-sell-hard-stop-contract-json"
        data-agent-readable="true"
        data-handoff-session-id={payload.handoff_session_id}
        data-payload-id={payload.payload_id}
        data-contract-version={contract.contract_version}
        data-contract-status={contract.overall_status}
        data-position-id={payload.exit_context.position_id}
        data-ticker={payload.exit_context.ticker}
        className="sr-only"
      >
        {contractJson}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
            Sell Hard Stop Contract
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {contract.human_summary}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${sellHardStopTone(
            contract.overall_status,
          )}`}
        >
          {agentCommandValue(contract.overall_status)}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Failed" value={agentCommandValue(contract.failed_count)} />
        <Detail
          label="Warnings"
          value={agentCommandValue(contract.warning_count)}
        />
        <Detail
          label="Unknown"
          value={agentCommandValue(contract.unknown_count)}
        />
        <Detail
          label="Can Prepare Sell Form"
          value={agentCommandValue(contract.can_prepare_sell_form)}
        />
        <Detail
          label="Can Mark Ready"
          value={agentCommandValue(contract.can_mark_sell_ready_for_agent)}
        />
        <Detail
          label="Manual Review"
          value={agentCommandValue(contract.can_continue_to_manual_review)}
        />
      </div>

      {(visibleBlockers.length > 0 || visibleWarnings.length > 0) && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
              Top blockers
            </p>
            {visibleBlockers.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                {visibleBlockers.map((rule) => (
                  <li key={rule.id}>{rule.label}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
            )}
          </div>
          <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
              Top warnings
            </p>
            {visibleWarnings.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                {visibleWarnings.map((rule) => (
                  <li key={rule.id}>{rule.label}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
            )}
          </div>
        </div>
      )}

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          View sell hard stop rules
        </summary>
        <div className="mt-3 space-y-2">
          {contract.rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-md border border-white/10 bg-black/20 p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    {rule.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {rule.message}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${sellHardStopRuleTone(
                    rule.status,
                  )}`}
                >
                  {agentCommandValue(rule.status)}
                </span>
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                {agentCommandValue(rule.category)} ·{" "}
                {rule.blocks_sell_handoff ? "blocks sell handoff" : "review only"}
              </p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function SellFormMappingPreviewPanel({
  preview,
  previewJson,
  payload,
  onCopy,
}: {
  preview: SellFormMappingPreview;
  previewJson: string;
  payload: TradeExitExecutionPayload;
  onCopy: () => void;
}) {
  const fieldCounts = getSellFormMappingFieldCounts(preview);
  const visibleBlockers = preview.blocking_reasons.slice(0, 3);
  const visibleWarnings = preview.warning_reasons.slice(0, 3);

  return (
    <div className="rounded-md border border-violet-300/15 bg-violet-300/[0.035] p-4">
      <div
        id="trade-sell-form-mapping-preview-json"
        data-agent-readable="true"
        data-handoff-session-id={preview.handoff_session_id ?? ""}
        data-payload-id={preview.payload_id ?? ""}
        data-command-id={preview.command_id ?? ""}
        data-preview-id={preview.preview_id}
        data-preview-kind={preview.preview_kind}
        data-preview-status={preview.overall_status}
        data-position-id={payload.exit_context.position_id}
        data-ticker={payload.exit_context.ticker}
        className="sr-only"
      >
        {previewJson}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-violet-100">
            Sell Form Mapping Preview
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            This is a simulation-only sell form mapping preview. No browser is
            controlled and no order is submitted. A future agent must stop before
            final Avanza confirmation.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${sellFormMappingTone(
            preview.overall_status,
          )}`}
        >
          {agentCommandValue(preview.overall_status)}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Broker" value={agentCommandValue(preview.broker)} />
        <Detail label="Mode" value={agentCommandValue(preview.mode)} />
        <Detail
          label="Can Prepare Sell Form"
          value={agentCommandValue(preview.can_prepare_sell_form)}
        />
        <Detail label="Fields" value={`${fieldCounts.field_count} total`} />
        <Detail
          label="Ready"
          value={agentCommandValue(fieldCounts.ready_count)}
        />
        <Detail
          label="Warnings"
          value={agentCommandValue(fieldCounts.warning_count)}
        />
        <Detail
          label="Blocked"
          value={agentCommandValue(fieldCounts.blocked_count)}
        />
        <Detail
          label="Missing"
          value={agentCommandValue(fieldCounts.missing_count)}
        />
      </div>

      {(visibleBlockers.length > 0 || visibleWarnings.length > 0) && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
              Blocking reasons
            </p>
            {visibleBlockers.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                {visibleBlockers.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
            )}
          </div>
          <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
              Warning reasons
            </p>
            {visibleWarnings.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                {visibleWarnings.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-md border border-white/10 bg-black/20">
        <div className="hidden grid-cols-[1.15fr_1.05fr_80px_88px_1fr] gap-2 border-b border-white/10 px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500 sm:grid">
          <span>Avanza Field</span>
          <span>Trade Value</span>
          <span>Confidence</span>
          <span>Status</span>
          <span>Source</span>
        </div>
        <div className="divide-y divide-white/10">
          {preview.field_mappings.map((field) => (
            <div
              key={field.field_id}
              className="grid gap-2 px-3 py-3 text-xs leading-5 text-zinc-300 sm:grid-cols-[1.15fr_1.05fr_80px_88px_1fr]"
            >
              <span className="font-medium text-zinc-200">
                {field.broker_field_label}
              </span>
              <span>{field.display_value}</span>
              <span
                className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${sellFormMappingConfidenceTone(
                  field.confidence,
                )}`}
              >
                {field.confidence}
              </span>
              <span
                className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${sellFormMappingTone(
                  field.status,
                )}`}
              >
                {agentCommandValue(field.status)}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500">
                {agentCommandValue(field.source)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onCopy();
          }}
          className="min-h-10 flex-1 rounded-md border border-violet-300/30 bg-violet-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-violet-100 transition hover:border-violet-200/70"
        >
          COPY SELL FORM MAPPING JSON
        </button>
      </div>

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          View sell mapping details
        </summary>
        <div className="mt-3 space-y-2">
          {preview.field_mappings.map((field) => (
            <div
              key={field.field_id}
              className="rounded-md border border-white/10 bg-black/20 p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    {field.broker_field_label}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                    {agentCommandValue(field.source_path)}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${sellFormMappingTone(
                    field.status,
                  )}`}
                >
                  {agentCommandValue(field.status)}
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Detail label="Value" value={field.display_value} />
                <Detail
                  label="Confidence"
                  value={agentCommandValue(field.confidence)}
                />
                <Detail
                  label="Required"
                  value={agentCommandValue(field.required)}
                />
                <Detail
                  label="Agent Editable"
                  value={agentCommandValue(field.editable_by_agent)}
                />
                <Detail
                  label="Broker Match"
                  value={agentCommandValue(field.must_match_broker_ui)}
                />
                <Detail
                  label="Related Hard Stops"
                  value={
                    field.related_hard_stop_ids.length > 0
                      ? field.related_hard_stop_ids.join(", ")
                      : "—"
                  }
                />
              </div>
              {field.notes.length > 0 && (
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {field.notes.join(" ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </details>

      <details className="mt-3 rounded-md border border-white/10 bg-black/30 p-3">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          View sell form mapping JSON
        </summary>
        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-300">
          {previewJson}
        </pre>
      </details>
    </div>
  );
}

function ClosePositionModal({
  position,
  latestUpdate,
  eodSafetyStatus,
  exitPrice,
  exitNotes,
  riskControlsEvaluation,
  marketSessionEvaluation,
  isSaving,
  onExitPriceChange,
  onExitNotesChange,
  onClose,
  onSubmit,
}: {
  position: ActivePosition;
  latestUpdate?: LatestPositionUpdate;
  eodSafetyStatus: EndOfDaySafetyStatus;
  exitPrice: string;
  exitNotes: string;
  riskControlsEvaluation: RiskControlsEvaluation | null;
  marketSessionEvaluation: MarketSessionEvaluation;
  isSaving: boolean;
  onExitPriceChange: (value: string) => void;
  onExitNotesChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    brokerExitConfirmation: BrokerExitConfirmation,
  ) => void;
}) {
  const isDemoTrade = isDemoPosition(position);
  const [copyStatus, setCopyStatus] = useState("");
  const [commandCopyStatus, setCommandCopyStatus] = useState("");
  const [formMappingCopyStatus, setFormMappingCopyStatus] = useState("");
  const [exitStatus, setExitStatus] =
    useState<BrokerExitStatus>("submitted_not_filled");
  const [actualSoldShares, setActualSoldShares] = useState(() =>
    position.positionSizeValue === null ? "" : String(position.positionSizeValue),
  );
  const [brokerReferenceNote, setBrokerReferenceNote] = useState("");
  const [exitCommission, setExitCommission] = useState("");
  const [exitFxFee, setExitFxFee] = useState("");
  const [userManuallyConfirmedSell, setUserManuallyConfirmedSell] =
    useState(false);
  const [brokerOrderMatchesTradePlan, setBrokerOrderMatchesTradePlan] =
    useState(false);
  const [exitConfirmationMessage, setExitConfirmationMessage] = useState("");
  const [mockBrokerExitFillJson, setMockBrokerExitFillJson] = useState("");
  const [mockBrokerExitImportResult, setMockBrokerExitImportResult] =
    useState<MockBrokerFillImportResult | null>(null);
  const [payloadNow, setPayloadNow] = useState(() => new Date());
  const [payloadCreatedAt] = useState(() => new Date().toISOString());
  const generatedSellPayloadRef = useRef<string | null>(null);
  const generatedSellHardStopContractRef = useRef<string | null>(null);
  const generatedSellCommandRef = useRef<string | null>(null);
  const generatedSellFormMappingPreviewRef = useRef<string | null>(null);
  const generatedBrokerExitCaptureSpecRef = useRef<string | null>(null);
  const generatedTureExitAutofillContractRef = useRef<string | null>(null);
  const generatedExitCaptureReviewRef = useRef<string | null>(null);
  const generatedTureExitCompletionPolicyRef = useRef<string | null>(null);
  const generatedAvanzaSellFieldVerificationRef = useRef<string | null>(null);
  const [manualAvanzaVerificationNotes] = useState(() =>
    readManualAvanzaVerificationNotesForReport(),
  );
  const showEodCloseWarning =
    eodSafetyStatus.status === "review_required" ||
    eodSafetyStatus.status === "overnight_risk";
  const guidance = showEodCloseWarning
    ? "Confirm broker execution before closing this day trade in Ture."
    : "Close this trade only after the broker exit has been manually confirmed.";
  const parsedExitPrice = parseNumber(exitPrice);
  const priceReference = latestUpdate?.currentPriceValue ?? parsedExitPrice;
  const currentR =
    latestUpdate?.unrealizedRValue ??
    calculateCurrentR({
      entryPrice: position.entryPriceValue,
      stopLoss: position.stopLossValue,
      currentPrice: priceReference,
      direction: position.direction,
    });
  const unrealizedPnl = calculateUnrealizedPnl({
    entryPrice: position.entryPriceValue,
    currentPrice: priceReference,
    shares: position.positionSizeValue,
    direction: position.direction,
  });
  const sellPayload = buildTradeExitExecutionPayload({
    positionId: position.id,
    ticker: position.ticker,
    companyName: position.companyName,
    recommendationId: position.recommendationId,
    setupType: position.executionMetadata?.setup_type ?? "UNKNOWN",
    direction: position.direction,
    entryPrice: position.entryPriceValue,
    currentPrice: priceReference,
    positionSize: position.positionSizeValue,
    remainingShares: position.positionSizeValue,
    openedAt: position.openedAtRaw,
    stopPrice: position.stopLossValue,
    targetPrice: position.target1Value ?? position.target2Value,
    closeReason: showEodCloseWarning ? eodSafetyStatus.status : "user_requested_close",
    exitReason: exitNotes,
    ruleAction: latestUpdate?.action ?? null,
    appRecommendedAction: latestUpdate?.recommendation ?? null,
    unrealizedPnl: unrealizedPnl.pnl,
    unrealizedPnlPercent:
      latestUpdate?.unrealizedPercentValue ?? unrealizedPnl.percent,
    currentR,
    createdAt: payloadCreatedAt,
    now: payloadNow,
  });
  const sellPayloadJson = tradeExitExecutionPayloadJson(sellPayload);
  const sellPayloadExpired =
    getExitPayloadSecondsUntilExpiry(sellPayload, payloadNow) <= 0;
  const sellPayloadExpiry = sellPayloadExpired
    ? "Expired"
    : `${getExitPayloadSecondsUntilExpiry(sellPayload, payloadNow)}s`;
  const sellHardStopContract = evaluateSellHardStopContract({
    payload: sellPayload,
    positionStatus: "open",
    brokerUiState: "not_applicable",
    credentialsRequiredOrDetected: false,
    unsafeToContinue: false,
    exactBrokerLabelsVerified: false,
    existingCanCloseTradeNow: true,
    now: payloadNow,
  });
  const sellHardStopContractJson = JSON.stringify(sellHardStopContract, null, 2);
  const sellAgentCommand = buildSellAgentHandoffCommand({
    payload: sellPayload,
    hardStopContract: sellHardStopContract,
    now: payloadNow,
    createdAt: payloadCreatedAt,
  });
  const sellAgentCommandJson = sellAgentHandoffCommandJson(sellAgentCommand);
  const sellFormMappingPreview = buildSellFormMappingPreview({
    payload: sellPayload,
    command: sellAgentCommand,
    hardStopContract: sellHardStopContract,
    now: payloadNow,
    createdAt: payloadCreatedAt,
  });
  const sellFormMappingJson = sellFormMappingPreviewJson(sellFormMappingPreview);
  const sellFormMappingFieldCounts = getSellFormMappingFieldCounts(
    sellFormMappingPreview,
  );
  const avanzaSellFieldVerificationReport =
    buildSellAvanzaFieldVerificationReport({
      handoffSessionId: sellPayload.handoff_session_id,
      payloadId: sellPayload.payload_id,
      commandId: sellAgentCommand.command_id,
      formMappingPreviewId: sellFormMappingPreview.preview_id,
      createdAt: payloadCreatedAt,
      manualVerificationNotes: manualAvanzaVerificationNotes,
    });
  const avanzaSellFieldVerificationJsonText =
    avanzaFieldVerificationReportJson(avanzaSellFieldVerificationReport);
  const brokerExitCaptureAgentSpec = buildSellBrokerFillCaptureAgentSpec({
    payload: sellPayload,
    createdAt: payloadCreatedAt,
  });
  const brokerExitCaptureAgentSpecJsonText = brokerFillCaptureAgentSpecJson(
    brokerExitCaptureAgentSpec,
  );
  const tureExitAutofillContract = buildSellTureFillAutofillContract({
    payload: sellPayload,
    captureSpec: brokerExitCaptureAgentSpec,
    createdAt: payloadCreatedAt,
  });
  const tureExitAutofillContractJsonText = tureFillAutofillContractJson(
    tureExitAutofillContract,
  );
  const brokerExitConfirmation = buildBrokerExitConfirmation({
    exitStatus,
    actualExitPrice: exitPrice,
    actualSoldShares,
    brokerReferenceNote,
    exitCommission,
    exitFxFee,
    userManuallyConfirmedSell,
    brokerOrderMatchesTradePlan,
    sellPayloadId: sellPayload.payload_id,
    sellPayloadFingerprint: sellPayload.payload_fingerprint,
    sellHandoffSessionId: sellPayload.handoff_session_id,
    sellCommandId: sellAgentCommand.command_id,
    sellHardStopStatus: sellHardStopContract.overall_status,
    sellFormMappingStatus: sellFormMappingPreview.overall_status,
  });
  const brokerExitValidation = validateBrokerExitConfirmation(
    brokerExitConfirmation,
    position.positionSizeValue,
  );
  const brokerExitWarning = brokerExitValidation.warnings[0] ?? "";
  const parsedActualSoldShares = parseNumber(actualSoldShares);
  const willRemainOpenAfterPartialExit =
    exitStatus === "partially_filled" &&
    parsedActualSoldShares !== null &&
    position.positionSizeValue !== null &&
    parsedActualSoldShares > 0 &&
    parsedActualSoldShares < position.positionSizeValue;
  const exitCaptureReview = buildSellFillCaptureReview({
    payloadId: sellPayload.payload_id,
    positionId: position.id,
    ticker: position.ticker,
    exitStatus,
    actualExitPrice: parsedExitPrice,
    actualSoldShares: parsedActualSoldShares,
    brokerReferenceNote,
    manualAvanzaSellConfirmed: userManuallyConfirmedSell,
    brokerOrderMatchesTurePosition: brokerOrderMatchesTradePlan,
    openPositionSize: position.positionSizeValue,
    exitCommission: parseNumber(exitCommission),
    exitFxFee: parseNumber(exitFxFee),
    createdAt: payloadCreatedAt,
  });
  const exitCaptureReviewJsonText = fillCaptureReviewJson(exitCaptureReview);
  const tureExitCompletionPolicy = buildSellTureAgentCompletionPolicy({
    review: exitCaptureReview,
    autofillContract: tureExitAutofillContract,
    ticker: position.ticker,
    payloadId: sellPayload.payload_id,
    payloadFingerprint: sellPayload.payload_fingerprint,
    handoffSessionId: sellPayload.handoff_session_id,
    positionId: position.id,
    exitStatus,
    actualExitPrice: parsedExitPrice,
    actualSoldShares: parseNumber(actualSoldShares),
    openPositionSize: position.positionSizeValue,
    manualAvanzaSellConfirmed: userManuallyConfirmedSell,
    brokerOrderMatchesTurePosition: brokerOrderMatchesTradePlan,
    createdAt: payloadCreatedAt,
  });
  const tureExitCompletionPolicyJsonText = tureAgentCompletionPolicyJson(
    tureExitCompletionPolicy,
  );

  function buildCurrentBrokerExitConfirmation(
    overrides: Partial<{
      userManuallyConfirmedSell: boolean;
      brokerOrderMatchesTradePlan: boolean;
    }> = {},
  ) {
    return buildBrokerExitConfirmation({
      exitStatus,
      actualExitPrice: exitPrice,
      actualSoldShares,
      brokerReferenceNote,
      exitCommission,
      exitFxFee,
      userManuallyConfirmedSell:
        overrides.userManuallyConfirmedSell ?? userManuallyConfirmedSell,
      brokerOrderMatchesTradePlan:
        overrides.brokerOrderMatchesTradePlan ?? brokerOrderMatchesTradePlan,
      sellPayloadId: sellPayload.payload_id,
      sellPayloadFingerprint: sellPayload.payload_fingerprint,
      sellHandoffSessionId: sellPayload.handoff_session_id,
      sellCommandId: sellAgentCommand.command_id,
      sellHardStopStatus: sellHardStopContract.overall_status,
      sellFormMappingStatus: sellFormMappingPreview.overall_status,
    });
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPayloadNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (generatedSellPayloadRef.current === sellPayload.payload_id) {
      return;
    }

    generatedSellPayloadRef.current = sellPayload.payload_id;
    logSellExecutionPayloadEvent("sell_execution_payload_generated", sellPayload);
  }, [sellPayload]);

  useEffect(() => {
    const contractAuditKey = [
      sellPayload.payload_id,
      sellHardStopContract.overall_status,
      sellHardStopContract.failed_count,
      sellHardStopContract.warning_count,
      sellHardStopContract.unknown_count,
      sellHardStopContract.machine_summary.top_blocker_ids.join(","),
    ].join(":");

    if (generatedSellHardStopContractRef.current === contractAuditKey) {
      return;
    }

    generatedSellHardStopContractRef.current = contractAuditKey;
    logSellHardStopContractEvent(sellHardStopContract, sellPayload);
  }, [sellHardStopContract, sellPayload]);

  useEffect(() => {
    const commandAuditKey = [
      sellAgentCommand.command_id,
      sellAgentCommand.status,
      sellAgentCommand.status_reasons.join(","),
      sellAgentCommand.warning_reasons.join(","),
    ].join(":");

    if (generatedSellCommandRef.current === commandAuditKey) {
      return;
    }

    generatedSellCommandRef.current = commandAuditKey;
    logSellAgentHandoffCommandEvent(
      "sell_agent_handoff_command_generated",
      sellAgentCommand,
    );
  }, [sellAgentCommand]);

  useEffect(() => {
    const previewAuditKey = [
      sellFormMappingPreview.preview_id,
      sellFormMappingPreview.overall_status,
      sellFormMappingFieldCounts.ready_count,
      sellFormMappingFieldCounts.warning_count,
      sellFormMappingFieldCounts.blocked_count,
      sellFormMappingFieldCounts.missing_count,
    ].join(":");

    if (generatedSellFormMappingPreviewRef.current === previewAuditKey) {
      return;
    }

    generatedSellFormMappingPreviewRef.current = previewAuditKey;
    logSellFormMappingPreviewEvent(
      "sell_form_mapping_preview_generated",
      sellFormMappingPreview,
      sellPayload,
    );
  }, [sellFormMappingFieldCounts, sellFormMappingPreview, sellPayload]);

  useEffect(() => {
    if (
      generatedBrokerExitCaptureSpecRef.current ===
      brokerExitCaptureAgentSpec.spec_id
    ) {
      return;
    }

    generatedBrokerExitCaptureSpecRef.current =
      brokerExitCaptureAgentSpec.spec_id;
    logBrokerFillCaptureAgentSpecEvent(
      "broker_exit_capture_agent_spec_generated",
      brokerExitCaptureAgentSpec,
    );
  }, [brokerExitCaptureAgentSpec]);

  useEffect(() => {
    if (
      generatedTureExitAutofillContractRef.current ===
      tureExitAutofillContract.contract_id
    ) {
      return;
    }

    generatedTureExitAutofillContractRef.current =
      tureExitAutofillContract.contract_id;
    logTureFillAutofillContractEvent(
      "ture_exit_autofill_contract_generated",
      tureExitAutofillContract,
    );
  }, [tureExitAutofillContract]);

  useEffect(() => {
    const reviewAuditKey = [
      exitCaptureReview.review_id,
      exitCaptureReview.status,
      exitCaptureReview.blockers.map((blocker) => blocker.blocker_id).join(","),
      exitCaptureReview.warnings.map((warning) => warning.warning_id).join(","),
    ].join(":");

    if (generatedExitCaptureReviewRef.current === reviewAuditKey) {
      return;
    }

    generatedExitCaptureReviewRef.current = reviewAuditKey;
    logFillCaptureReviewEvent("exit_capture_review_generated", exitCaptureReview, {
      payloadId: sellPayload.payload_id,
      payloadFingerprint: sellPayload.payload_fingerprint,
      handoffSessionId: sellPayload.handoff_session_id,
      recommendationId: position.recommendationId,
      positionId: position.id,
      ticker: position.ticker,
    });
  }, [exitCaptureReview, position, sellPayload]);

  useEffect(() => {
    const policyAuditKey = [
      tureExitCompletionPolicy.policy_id,
      tureExitCompletionPolicy.decision,
      tureExitCompletionPolicy.blockers
        .map((blocker) => blocker.blocker_id)
        .join(","),
      tureExitCompletionPolicy.warnings
        .map((warning) => warning.warning_id)
        .join(","),
    ].join(":");

    if (generatedTureExitCompletionPolicyRef.current === policyAuditKey) {
      return;
    }

    generatedTureExitCompletionPolicyRef.current = policyAuditKey;
    logTureAgentCompletionPolicyEvent(
      "ture_exit_completion_policy_generated",
      tureExitCompletionPolicy,
      {
        recommendationId: position.recommendationId,
        positionId: position.id,
      },
    );
  }, [position.id, position.recommendationId, tureExitCompletionPolicy]);

  useEffect(() => {
    const verificationAuditKey = [
      avanzaSellFieldVerificationReport.report_id,
      avanzaSellFieldVerificationReport.overall_status,
      avanzaSellFieldVerificationReport.verified_count,
      avanzaSellFieldVerificationReport.assumed_count,
      avanzaSellFieldVerificationReport.unknown_count,
      avanzaSellFieldVerificationReport.blocked_count,
    ].join(":");

    if (
      generatedAvanzaSellFieldVerificationRef.current === verificationAuditKey
    ) {
      return;
    }

    generatedAvanzaSellFieldVerificationRef.current = verificationAuditKey;
    logAvanzaFieldVerificationEvent(
      "avanza_sell_field_verification_generated",
      avanzaSellFieldVerificationReport,
    );
    if (avanzaSellFieldVerificationReport.manual_notes_applied) {
      logAvanzaFieldVerificationEvent(
        "avanza_verification_notes_applied_to_report",
        avanzaSellFieldVerificationReport,
      );
    }
  }, [avanzaSellFieldVerificationReport]);

  async function copySellExecutionPayload() {
    setCopyStatus("");

    if (sellPayloadExpired) {
      setCopyStatus(
        "Sell execution payload expired. Reopen Close Trade to regenerate fresh sell details.",
      );
      return;
    }

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyStatus("Clipboard unavailable. Select the sell payload JSON manually.");
      return;
    }

    try {
      await navigator.clipboard.writeText(sellPayloadJson);
      logSellExecutionPayloadEvent("sell_execution_payload_copied", sellPayload);
      setCopyStatus("Sell execution payload copied.");
    } catch {
      setCopyStatus("Could not copy sell payload. Select the JSON manually.");
    }
  }

  async function copyBrokerExitCaptureAgentSpec() {
    setCopyStatus("");

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyStatus(
        "Clipboard unavailable. Select the broker exit capture spec JSON manually.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(brokerExitCaptureAgentSpecJsonText);
      logBrokerFillCaptureAgentSpecEvent(
        "broker_exit_capture_agent_spec_copied",
        brokerExitCaptureAgentSpec,
      );
      setCopyStatus("Broker exit capture spec JSON copied.");
    } catch {
      setCopyStatus("Could not copy broker exit capture spec JSON.");
    }
  }

  async function copyTureExitAutofillContract() {
    setCopyStatus("");

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyStatus(
        "Clipboard unavailable. Select the Ture exit autofill contract JSON manually.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(tureExitAutofillContractJsonText);
      logTureFillAutofillContractEvent(
        "ture_exit_autofill_contract_copied",
        tureExitAutofillContract,
      );
      setCopyStatus("Ture exit autofill contract JSON copied.");
    } catch {
      setCopyStatus("Could not copy Ture exit autofill contract JSON.");
    }
  }

  async function copySellAgentCommand() {
    setCommandCopyStatus("");

    if (sellAgentCommand.status === "blocked") {
      setCommandCopyStatus(
        sellAgentCommand.status_reasons.length > 0
          ? `Sell command blocked: ${sellAgentCommand.status_reasons
              .slice(0, 3)
              .join(", ")}.`
          : "Sell command is blocked until payload issues are resolved.",
      );
      return;
    }

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCommandCopyStatus(
        "Clipboard unavailable. Select the sell command JSON manually.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(sellAgentCommandJson);
      logSellAgentHandoffCommandEvent(
        "sell_agent_handoff_command_copied",
        sellAgentCommand,
      );
      setCommandCopyStatus("Sell agent command JSON copied.");
    } catch {
      setCommandCopyStatus("Could not copy sell command JSON. Select it manually.");
    }
  }

  async function copySellFormMappingPreview() {
    setFormMappingCopyStatus("");

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setFormMappingCopyStatus(
        "Clipboard unavailable. Select the sell form mapping JSON manually.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(sellFormMappingJson);
      logSellFormMappingPreviewEvent(
        "sell_form_mapping_preview_copied",
        sellFormMappingPreview,
        sellPayload,
      );
      setFormMappingCopyStatus("Sell form mapping JSON copied.");
    } catch {
      setFormMappingCopyStatus(
        "Could not copy sell form mapping JSON. Select it manually.",
      );
    }
  }

  async function copyAvanzaSellFieldVerification() {
    setCopyStatus("");

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyStatus(
        "Clipboard unavailable. Select the Avanza sell field verification JSON manually.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(avanzaSellFieldVerificationJsonText);
      logAvanzaFieldVerificationEvent(
        "avanza_sell_field_verification_copied",
        avanzaSellFieldVerificationReport,
      );
      setCopyStatus("Avanza sell field verification JSON copied.");
    } catch {
      setCopyStatus("Could not copy Avanza sell field verification JSON.");
    }
  }

  function handleManualSellConfirmationChange(checked: boolean) {
    setUserManuallyConfirmedSell(checked);

    if (checked) {
      logBrokerExitConfirmationEvent(
        "broker_sell_manual_confirmation_checked",
        position,
        buildCurrentBrokerExitConfirmation({
          userManuallyConfirmedSell: true,
        }),
      );
    }
  }

  function handleBrokerPlanMatchChange(checked: boolean) {
    setBrokerOrderMatchesTradePlan(checked);

    if (checked) {
      logBrokerExitConfirmationEvent(
        "broker_sell_plan_match_checked",
        position,
        buildCurrentBrokerExitConfirmation({
          brokerOrderMatchesTradePlan: true,
        }),
      );
    }
  }

  function prefillDemoSellExit() {
    if (!isDemoTrade) {
      return;
    }

    const demoExitPrice =
      latestUpdate?.currentPriceValue ??
      position.target1Value ??
      (position.entryPriceValue === null ? 108 : position.entryPriceValue * 1.08);

    setExitStatus("filled");
    onExitPriceChange(String(demoExitPrice));
    setActualSoldShares(
      position.positionSizeValue === null ? "10" : String(position.positionSizeValue),
    );
    setBrokerReferenceNote("DEMO EXIT - no broker order submitted");
    setExitCommission("");
    setExitFxFee("");
    setUserManuallyConfirmedSell(true);
    setBrokerOrderMatchesTradePlan(true);
    setExitConfirmationMessage(
      "Demo sell exit populated. No broker order was submitted.",
    );
  }

  function loadLatestMockSellFill() {
    try {
      const stored = window.localStorage.getItem(latestMockBrokerFillStorageKey);
      if (!stored) {
        setExitConfirmationMessage(
          "No latest mock broker fill found in localStorage.",
        );
        return;
      }

      setMockBrokerExitFillJson(stored);
      const result = validateMockBrokerFillForTureSell({
        rawJson: stored,
        expectedTicker: position.ticker,
        openPositionSize: position.positionSizeValue,
      });
      setMockBrokerExitImportResult(result);
      logMockBrokerFillImportEvent("mock_broker_fill_import_loaded", {
        side: "SELL",
        ticker: position.ticker,
        status: result.status,
        blockerCount: result.blockers.length,
        warningCount: result.warnings.length,
        confirmationId: result.fill?.confirmation_id ?? null,
        actualPrice: result.fill?.actual_price ?? null,
        actualShares: result.fill?.actual_shares ?? null,
        positionId: position.id,
        recommendationId: position.recommendationId,
      });
      setExitConfirmationMessage("Latest mock exit fill loaded for review.");
    } catch {
      setExitConfirmationMessage(
        "Could not load latest mock fill from localStorage.",
      );
    }
  }

  function importMockSellFill() {
    const result = validateMockBrokerFillForTureSell({
      rawJson: mockBrokerExitFillJson,
      expectedTicker: position.ticker,
      openPositionSize: position.positionSizeValue,
    });
    setMockBrokerExitImportResult(result);

    if (!result.fill || result.status === "blocked" || result.status === "invalid") {
      logMockBrokerFillImportEvent("mock_broker_fill_import_blocked", {
        side: "SELL",
        ticker: position.ticker,
        status: result.status,
        blockerCount: result.blockers.length,
        warningCount: result.warnings.length,
        positionId: position.id,
        recommendationId: position.recommendationId,
      });
      setExitConfirmationMessage(
        result.blockers[0]?.message ??
          "Mock sell fill import is blocked. Review the import panel.",
      );
      return;
    }

    const mapped = mapMockFillToBrokerExitConfirmation(result.fill);
    setExitStatus(mapped.exitStatus);
    onExitPriceChange(mapped.actualExitPrice);
    setActualSoldShares(mapped.actualSoldShares);
    setBrokerReferenceNote(mapped.brokerReferenceNote);
    setExitCommission(mapped.exitCommission);
    setExitFxFee(mapped.exitFxFee);
    setUserManuallyConfirmedSell(mapped.manualMockConfirmation);
    setBrokerOrderMatchesTradePlan(mapped.brokerOrderMatchesTradePlan);
    logMockBrokerFillImportEvent("mock_broker_sell_fill_imported", {
      side: "SELL",
      ticker: position.ticker,
      status: result.status,
      blockerCount: result.blockers.length,
      warningCount: result.warnings.length,
      confirmationId: result.fill.confirmation_id,
      actualPrice: result.fill.actual_price,
      actualShares: result.fill.actual_shares,
      positionId: position.id,
      recommendationId: position.recommendationId,
    });
    setExitConfirmationMessage(
      result.status === "needs_review"
        ? "Mock sell exit imported with review warnings. The trade was not closed."
        : "Mock sell exit imported. The trade was not closed.",
    );
  }

  function handleCloseSubmit(event: FormEvent<HTMLFormElement>) {
    const confirmation = buildCurrentBrokerExitConfirmation();
    const validation = validateBrokerExitConfirmation(
      confirmation,
      position.positionSizeValue,
    );

    if (!validation.can_close_trade) {
      event.preventDefault();
      setExitConfirmationMessage(validation.message);
      return;
    }

    setExitConfirmationMessage("");
    onSubmit(event, confirmation);
  }

  const sellPackageStatuses = [
    sellHardStopContract.overall_status,
    sellAgentCommand.status,
    sellFormMappingPreview.overall_status,
  ];
  const sellPackageTone: LifecycleStepTone = sellPackageStatuses.includes("blocked")
    ? "blocked"
    : sellPackageStatuses.includes("warning")
      ? "warning"
      : "ready";
  const sellLifecycleSteps = [
    {
      label: "Review sell guidance",
      detail: guidance,
      tone: "ready",
    },
    {
      label: "Prepare sell order",
      detail: "Review the prepare-only sell agent package.",
      tone: sellPackageTone,
    },
    {
      label: "Manual Avanza SÄLJ",
      detail: userManuallyConfirmedSell
        ? "Manual broker confirmation recorded."
        : "You manually review and click final SÄLJ.",
      tone: userManuallyConfirmedSell
        ? "ready"
        : sellPackageTone === "blocked"
          ? "pending"
          : "current",
    },
    {
      label: "Capture exit fill",
      detail: brokerExitValidation.can_close_trade
        ? "Broker exit fill is ready."
        : "Enter Avanza exit fill details.",
      tone: brokerExitValidation.can_close_trade
        ? "ready"
        : userManuallyConfirmedSell
          ? "current"
          : "pending",
    },
    {
      label: "Close trade in Ture",
      detail: brokerExitValidation.can_close_trade
        ? "Ready to close from broker exit fill."
        : "Ture recordkeeping happens after broker confirmation.",
      tone: brokerExitValidation.can_close_trade ? "ready" : "pending",
    },
  ] satisfies Array<{
    label: string;
    detail: string;
    tone: LifecycleStepTone;
  }>;
  const sellPrimaryCtaLabel = isSaving
    ? "CLOSING TRADE"
    : brokerExitValidation.can_close_trade
      ? "CLOSE TRADE IN TURE"
      : "CAPTURE BROKER EXIT FILL TO CLOSE";
  const sellRealityBadges = [
    isDemoTrade
      ? dataModeBadgeForMode("demo")
      : dataModeBadgeForMode("manual_broker_record"),
    dataModeBadgeForExecutionReality("human_confirmed_required"),
    dataModeBadgeForMode("future_agent_package"),
  ];

  return (
    <div
      className="trade-recommendation-details-backdrop trade-close-modal-backdrop"
      role="presentation"
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <form
        onSubmit={handleCloseSubmit}
        className="trade-add-modal trade-close-modal"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="trade-recommendation-details-titlebar trade-close-modal__titlebar">
          <div className="flex flex-col gap-2">
            <h2>PREPARE SELL ORDER — CLOSE TRADE</h2>
            <DataModePillRow badges={sellRealityBadges} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="trade-recommendation-details-close"
            aria-label="Close close trade modal"
          >
            <Image
              src="/trade-assets/x-icn.svg"
              alt=""
              aria-hidden="true"
              width={29}
              height={29}
            />
          </button>
        </div>

        <div className="trade-add-modal__scroll">
          <header className="trade-recommendation-details-header trade-close-modal__header">
            <CompanyIdentity
              ticker={position.ticker}
              companyName={position.companyName}
              size="live"
            />
            <RecommendationDetailsPill label="Close Position" tone="danger" />
          </header>

          <div className="trade-recommendation-guidance trade-close-modal__guidance">
            <p>{guidance}</p>
            <span>Opened {recommendationDetailsValue(position.openedAt)}</span>
          </div>

          <DataModeSurfaceNotice
            surface={{
              surface_id: "sell_handoff_and_exit_capture",
              label: "Sell Handoff / Exit Capture",
              mode: "future_agent_package",
              source_kind: "agent_package",
              freshness_status: "not_applicable",
              execution_reality: "human_confirmed_required",
              badges: sellRealityBadges,
              warnings: isDemoTrade
                ? [
                    {
                      surface_id: "sell_handoff_and_exit_capture",
                      warning_id: "demo_exit_test_data",
                      label: "Demo exit",
                      message: "Demo exit fills are local test data.",
                      severity: "warning",
                    },
                  ]
                : [],
              summary:
                "Ture does not send broker orders. Avanza SÄLJ is always human-confirmed, and sell packages are prepare/read-only.",
            }}
            compact
          />

          <LifecycleProgressStrip
            title="Sell Lifecycle"
            safetyNote="Ture and a future agent may prepare the Avanza sell form only. You must manually review and click final SÄLJ. Close the trade in Ture only after Avanza reports a fill."
            steps={sellLifecycleSteps}
          />

          <div className="mt-5 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.055] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                  What you need to do next
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Prepare or review the sell order, manually confirm SÄLJ in
                  Avanza, then capture the actual broker exit fill in Ture.
                  Ture recordkeeping happens after manual broker confirmation.
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  A future agent may prepare the sell form only. It must stop
                  before final Avanza confirmation; you must manually click
                  SÄLJ.
                </p>
              </div>
              <span className="w-fit rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                {sellPrimaryCtaLabel}
              </span>
            </div>
            {willRemainOpenAfterPartialExit && (
              <p className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] p-3 text-sm leading-6 text-cyan-100">
                Partial exit detected: Ture will record this exit fill, reduce
                remaining shares, and keep the rest of the position live.
              </p>
            )}
          </div>

          <AddTradeWorkflowGroup
            title="Sell Decision Context"
            description="Review why Ture is suggesting a sell-side action. Session and risk context are advisory here and never block a risk-reducing close."
          >
            <AddTradeSection title="Live Sell Guidance v2">
              <div className="rounded-md border border-white/10 bg-black/20 p-4">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
                  Why now?
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {guidance}
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Detail label="Current R" value={formatSignedR(currentR)} />
                  <Detail
                    label="Current / Reference"
                    value={formatCurrency(priceReference)}
                  />
                  <Detail
                    label="Unrealized PnL"
                    value={formatSignedCurrency(unrealizedPnl.pnl)}
                  />
                  <Detail
                    label="Unrealized %"
                    value={formatPercent(unrealizedPnl.percent)}
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  Closing or selling is risk-reducing. Market session and risk
                  controls should inform review, not prevent an exit.
                </p>
              </div>
            </AddTradeSection>

            <AddTradeSection title="Market Session / EOD Check">
              <MarketSessionSummaryPanel
                evaluation={marketSessionEvaluation}
                title="US Market Session"
                compact
              />
              <p className="mt-3 text-xs leading-5 text-zinc-500">
                Market session checks never block closing or selling a
                risk-reducing trade.
              </p>
            </AddTradeSection>

            <AddTradeSection title="Position Snapshot">
              <AddTradeMetricGrid
                metrics={[
                  { label: "Entry Price", value: position.entryPrice },
                  { label: "Shares", value: position.positionSize },
                  { label: "Current Stop", value: position.stopLoss },
                  { label: "Target 1", value: position.target1 },
                  { label: "Target 2", value: position.target2 },
                  { label: "Direction", value: position.direction.toUpperCase() },
                ]}
              />
            </AddTradeSection>

            <AddTradeSection title="Live Risk Controls">
              <RiskControlsEvaluationPanel
                title="Live Risk Controls"
                evaluation={riskControlsEvaluation}
              />
              {riskControlsEvaluation && (
                <div
                  id="trade-risk-controls-live-trade-evaluation-json"
                  data-agent-readable="true"
                  data-evaluation-id={riskControlsEvaluation.evaluation_id}
                  data-evaluation-status={riskControlsEvaluation.status}
                  data-mode={riskControlsEvaluation.mode}
                  className="sr-only"
                >
                  {riskControlsEvaluationJson(riskControlsEvaluation)}
                </div>
              )}
            </AddTradeSection>
          </AddTradeWorkflowGroup>

          <AddTradeWorkflowGroup
            title="Execution Safety"
            description="Prepare-only sell payloads, hard stops, command status, form mapping, and Avanza verification. Critical blockers remain visible in their summaries."
            defaultOpen={false}
          >
            <div className="mb-4 rounded-md border border-white/10 bg-black/20 p-3">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                Advanced Sell Agent Package
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Technical handoff/export details are available here for review
                and copy. They remain prepare-only and do not submit broker
                orders.
              </p>
            </div>

          <AddTradeSection title="Sell Execution Payload">
            <div
              id="trade-sell-execution-payload-json"
              data-agent-readable="true"
              data-handoff-session-id={sellPayload.handoff_session_id}
              data-payload-id={sellPayload.payload_id}
              data-payload-kind={sellPayload.payload_kind}
              data-position-id={sellPayload.exit_context.position_id}
              data-ticker={sellPayload.exit_context.ticker}
              data-side={sellPayload.order_intent.side}
              data-broker-hint={sellPayload.broker_hint}
              data-order-intent={sellPayload.order_intent.action}
              className="sr-only"
            >
              {sellPayloadJson}
            </div>

            <div
              id="trade-broker-exit-capture-agent-spec-json"
              data-agent-readable="true"
              data-handoff-session-id={brokerExitCaptureAgentSpec.handoff_session_id}
              data-payload-id={brokerExitCaptureAgentSpec.source_payload_id}
              data-spec-id={brokerExitCaptureAgentSpec.spec_id}
              data-side={brokerExitCaptureAgentSpec.side}
              data-broker={brokerExitCaptureAgentSpec.broker}
              className="sr-only"
            >
              {brokerExitCaptureAgentSpecJsonText}
            </div>

            <div
              id="trade-ture-exit-autofill-contract-json"
              data-agent-readable="true"
              data-handoff-session-id={tureExitAutofillContract.handoff_session_id}
              data-payload-id={tureExitAutofillContract.source_payload_id}
              data-contract-id={tureExitAutofillContract.contract_id}
              data-side={tureExitAutofillContract.side}
              data-target-form={tureExitAutofillContract.target_form}
              className="sr-only"
            >
              {tureExitAutofillContractJsonText}
            </div>

            <div
              id="trade-exit-capture-review-json"
              data-agent-readable="true"
              data-review-id={exitCaptureReview.review_id}
              data-review-status={exitCaptureReview.status}
              data-payload-id={sellPayload.payload_id}
              data-side={exitCaptureReview.side}
              className="sr-only"
            >
              {exitCaptureReviewJsonText}
            </div>

            <div
              id="trade-ture-exit-completion-policy-json"
              data-agent-readable="true"
              data-policy-id={tureExitCompletionPolicy.policy_id}
              data-decision={tureExitCompletionPolicy.decision}
              data-target-action={tureExitCompletionPolicy.target_action}
              data-review-id={tureExitCompletionPolicy.review_id}
              data-payload-id={tureExitCompletionPolicy.source_payload_id}
              data-side={tureExitCompletionPolicy.side}
              className="sr-only"
            >
              {tureExitCompletionPolicyJsonText}
            </div>

            <div
              id="trade-avanza-sell-field-verification-json"
              data-agent-readable="true"
              data-report-id={avanzaSellFieldVerificationReport.report_id}
              data-report-status={avanzaSellFieldVerificationReport.overall_status}
              data-handoff-session-id={
                avanzaSellFieldVerificationReport.handoff_session_id ?? ""
              }
              data-payload-id={
                avanzaSellFieldVerificationReport.payload_id ?? ""
              }
              data-side={avanzaSellFieldVerificationReport.side}
              data-broker={avanzaSellFieldVerificationReport.broker}
              className="sr-only"
            >
              {avanzaSellFieldVerificationJsonText}
            </div>

            <div className="rounded-md border border-white/10 bg-black/25 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
                    Sell Execution Payload
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    This sell payload is prepare-only. A future agent may prepare
                    the Avanza sell form, but it must stop before final
                    confirmation. You must manually click SÄLJ.
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
                    sellPayloadExpired
                      ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                      : "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                  }`}
                >
                  {sellPayloadExpired ? "Expired" : "Prepare-only"}
                </span>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Ticker" value={sellPayload.exit_context.ticker} />
                <Detail label="Side" value={sellPayload.order_intent.side} />
                <Detail
                  label="Quantity"
                  value={formatShares(sellPayload.order_intent.quantity_to_sell)}
                />
                <Detail
                  label="Price Reference"
                  value={formatCurrency(sellPayload.order_intent.price_reference)}
                />
                <Detail label="Broker" value={sellPayload.broker_hint} />
                <Detail label="Expires" value={sellPayloadExpiry} />
                <Detail
                  label="Handoff Session"
                  value={sellPayload.handoff_session_id}
                />
                <Detail label="Submit Guard" value="Do not submit order" />
                <Detail label="Final Confirmation" value="Manual SÄLJ required" />
              </div>

              {sellPayload.safety_warnings.length > 0 && (
                <div className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-3">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-amber-100">
                    Safety warnings
                  </p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-amber-100/90">
                    {sellPayload.safety_warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void copySellExecutionPayload();
                  }}
                  disabled={sellPayloadExpired}
                  className="min-h-10 flex-1 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-zinc-500"
                >
                  COPY SELL EXECUTION PAYLOAD
                </button>
              </div>

              <AvanzaFieldVerificationPanel
                title="Avanza Sell Field Verification"
                report={avanzaSellFieldVerificationReport}
                onCopy={copyAvanzaSellFieldVerification}
              />

              <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                      Broker Exit Capture Agent Spec
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      Post-SÄLJ recordkeeping contract only. A future agent may
                      help fill Ture broker exit fields after you manually
                      confirmed SÄLJ in Avanza; it must never click SÄLJ or
                      submit orders.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void copyBrokerExitCaptureAgentSpec();
                    }}
                    className="min-h-10 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/70"
                  >
                    COPY BROKER EXIT CAPTURE SPEC JSON
                  </button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Detail
                    label="Side"
                    value={brokerExitCaptureAgentSpec.side}
                  />
                  <Detail
                    label="Mode"
                    value="Recordkeeping only"
                  />
                  <Detail
                    label="Required Fields"
                    value={String(brokerExitCaptureAgentSpec.required_fields.length)}
                  />
                  <Detail
                    label="Hard Stops"
                    value={String(brokerExitCaptureAgentSpec.hard_stops.length)}
                  />
                </div>
                <details className="mt-3 rounded-md border border-white/10 bg-black/30 p-3">
                  <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                    View broker exit capture spec JSON
                  </summary>
                  <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-300">
                    {brokerExitCaptureAgentSpecJsonText}
                  </pre>
                </details>
              </div>

              <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                      Ture Exit Autofill Contract
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      Ture-side recordkeeping contract only. A future agent may
                      fill broker exit fields from verified captured data, but
                      it must not save, close the trade, or mark confirmations
                      without evidence.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void copyTureExitAutofillContract();
                    }}
                    className="min-h-10 rounded-md border border-violet-300/30 bg-violet-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-violet-100 transition hover:border-violet-200/70"
                  >
                    COPY TURE EXIT AUTOFILL CONTRACT JSON
                  </button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Detail
                    label="Target Form"
                    value="Broker exit confirmation"
                  />
                  <Detail
                    label="Required Fields"
                    value={String(
                      tureExitAutofillContract.required_autofill_fields.length,
                    )}
                  />
                  <Detail
                    label="Review Context"
                    value={String(
                      tureExitAutofillContract.review_only_context_fields.length,
                    )}
                  />
                  <Detail
                    label="Auto Close"
                    value="Forbidden"
                  />
                </div>
                <details className="mt-3 rounded-md border border-white/10 bg-black/30 p-3">
                  <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                    View Ture exit autofill contract JSON
                  </summary>
                  <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-300">
                    {tureExitAutofillContractJsonText}
                  </pre>
                </details>
              </div>

              {copyStatus && (
                <p className="mt-3 text-sm leading-6 text-cyan-100">
                  {copyStatus}
                </p>
              )}

              <details className="mt-3 rounded-md border border-white/10 bg-black/30 p-3">
                <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                  View sell payload JSON
                </summary>
                <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-300">
                  {sellPayloadJson}
                </pre>
              </details>
            </div>
          </AddTradeSection>

          <AddTradeSection title="Sell Hard Stop Contract">
            <SellHardStopContractPanel
              contract={sellHardStopContract}
              contractJson={sellHardStopContractJson}
              payload={sellPayload}
            />
          </AddTradeSection>

          <AddTradeSection title="Sell Agent Handoff Command">
            <div
              id="trade-sell-agent-handoff-command-json"
              data-agent-readable="true"
              data-handoff-session-id={sellAgentCommand.handoff_session_id ?? ""}
              data-payload-id={sellAgentCommand.payload_id ?? ""}
              data-command-id={sellAgentCommand.command_id}
              data-command-kind={sellAgentCommand.command_kind}
              data-command-status={sellAgentCommand.status}
              data-position-id={sellAgentCommand.exit_context.position_id ?? ""}
              data-ticker={sellAgentCommand.instrument.ticker_symbol ?? ""}
              data-broker={sellAgentCommand.broker}
              data-task={sellAgentCommand.task}
              className="sr-only"
            >
              {sellAgentCommandJson}
            </div>

            <div className="rounded-md border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
                    Sell Agent Handoff Command
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    Agent may prepare the sell order form only. It must stop
                    before final Avanza confirmation. You must manually click
                    SÄLJ.
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${sellAgentCommandTone(
                    sellAgentCommand.status,
                  )}`}
                >
                  {sellAgentCommand.status}
                </span>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Task" value={agentCommandValue(sellAgentCommand.task)} />
                <Detail label="Broker" value={sellAgentCommand.broker} />
                <Detail
                  label="Mode"
                  value={agentCommandValue(sellAgentCommand.broker_execution_mode)}
                />
                <Detail
                  label="Stop Before"
                  value={sellAgentCommand.stop_before
                    .map(agentCommandValue)
                    .join(" / ")}
                />
                <Detail
                  label="Command ID"
                  value={agentCommandValue(sellAgentCommand.command_id)}
                />
                <Detail
                  label="Expires"
                  value={agentCommandValue(sellAgentCommand.expires_at)}
                />
                <Detail
                  label="Forbidden Actions"
                  value={String(sellAgentCommand.forbidden_actions.length)}
                />
                <Detail
                  label="Required Human Actions"
                  value={String(sellAgentCommand.required_human_actions.length)}
                />
                <Detail
                  label="Payload"
                  value={agentCommandValue(sellAgentCommand.payload_id)}
                />
              </div>

              {(sellAgentCommand.status_reasons.length > 0 ||
                sellAgentCommand.warning_reasons.length > 0) && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.035] p-3">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                      Blocking reasons
                    </p>
                    {sellAgentCommand.status_reasons.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                        {sellAgentCommand.status_reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
                    )}
                  </div>
                  <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                      Warning reasons
                    </p>
                    {sellAgentCommand.warning_reasons.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-300">
                        {sellAgentCommand.warning_reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-zinc-500">—</p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void copySellAgentCommand();
                  }}
                  disabled={sellAgentCommand.status === "blocked"}
                  className="min-h-10 flex-1 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-zinc-500"
                >
                  COPY SELL AGENT COMMAND JSON
                </button>
              </div>

              {commandCopyStatus && (
                <p className="mt-3 text-sm leading-6 text-cyan-100">
                  {commandCopyStatus}
                </p>
              )}

              <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
                <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                  View sell command fields
                </summary>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {Object.entries(sellAgentCommand.form_fields).map(
                    ([field, value]) => (
                      <Detail
                        key={field}
                        label={agentCommandLabel(field)}
                        value={agentCommandValue(value)}
                      />
                    ),
                  )}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {Object.entries(sellAgentCommand.review_fields).map(
                    ([field, value]) => (
                      <Detail
                        key={field}
                        label={agentCommandLabel(field)}
                        value={agentCommandValue(value)}
                      />
                    ),
                  )}
                </div>
              </details>

              <details className="mt-3 rounded-md border border-white/10 bg-black/30 p-3">
                <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                  View sell command JSON
                </summary>
                <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-300">
                  {sellAgentCommandJson}
                </pre>
              </details>
            </div>
          </AddTradeSection>

          <AddTradeSection title="Sell Form Mapping Preview">
            <SellFormMappingPreviewPanel
              preview={sellFormMappingPreview}
              previewJson={sellFormMappingJson}
              payload={sellPayload}
              onCopy={copySellFormMappingPreview}
            />

            {formMappingCopyStatus && (
              <p className="mt-3 text-sm leading-6 text-violet-100">
                {formMappingCopyStatus}
              </p>
            )}
          </AddTradeSection>
          </AddTradeWorkflowGroup>

          <AddTradeSection title="Primary Action Area — Broker Exit Confirmation">
            <div className="rounded-md border border-emerald-300/15 bg-emerald-300/[0.035] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                    Broker Exit Confirmation
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    Only close the trade after you manually confirmed SÄLJ in
                    Avanza and the order was filled or partially filled.
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
                    brokerExitValidation.can_close_trade
                      ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                      : "border-amber-300/30 bg-amber-300/10 text-amber-100"
                  }`}
                >
                  {brokerExitValidation.can_close_trade ? "Ready" : "Pending"}
                </span>
              </div>

              {(isDemoTrade || demoTradingFlowEnabled) && (
                <details className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/[0.045] p-3">
                  <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-amber-100">
                    Mock / Dry Run Tools
                  </summary>
                  <div className="mt-3">
                    <DataModePillRow
                      badges={[
                        dataModeBadgeForMode("mock_broker"),
                        dataModeBadgeForExecutionReality("mock_only"),
                      ]}
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    Mock-only helpers fill local Ture exit fields for testing.
                    They do not contact Avanza, control a browser, or submit an
                    order.
                  </p>

                  {isDemoTrade && (
                    <div className="mt-3 rounded-md border border-amber-300/20 bg-black/20 p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <DemoBadge />
                          <p className="mt-2 text-sm leading-6 text-zinc-300">
                            Prefill safe test values for the manual sell exit
                            fields. This does not contact Avanza or submit an
                            order.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            prefillDemoSellExit();
                          }}
                          className="min-h-10 rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-200/70"
                        >
                          PREFILL DEMO SELL EXIT
                        </button>
                      </div>
                    </div>
                  )}

                  {demoTradingFlowEnabled && (
                    <MockBrokerFillImportPanel
                      title="Import Mock Broker Exit Fill"
                      actionLabel="IMPORT MOCK SELL FILL"
                      value={mockBrokerExitFillJson}
                      onChange={setMockBrokerExitFillJson}
                      onLoadLatest={loadLatestMockSellFill}
                      onImport={importMockSellFill}
                      result={mockBrokerExitImportResult}
                    />
                  )}
                </details>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="trade-close-modal-field">
                  <span>Exit status</span>
                  <select
                    value={exitStatus}
                    onChange={(event) =>
                      setExitStatus(event.target.value as BrokerExitStatus)
                    }
                    className="cursor-pointer"
                  >
                    <option value="filled">
                      {brokerExitStatusLabel("filled")}
                    </option>
                    <option value="partially_filled">
                      {brokerExitStatusLabel("partially_filled")}
                    </option>
                    <option value="submitted_not_filled">
                      {brokerExitStatusLabel("submitted_not_filled")}
                    </option>
                    <option value="cancelled_or_rejected">
                      {brokerExitStatusLabel("cancelled_or_rejected")}
                    </option>
                  </select>
                </label>

                <label className="trade-close-modal-field">
                  <span>Actual exit price</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={exitPrice}
                    onChange={(event) => onExitPriceChange(event.target.value)}
                  />
                </label>

                <label className="trade-close-modal-field">
                  <span>Actual sold shares</span>
                  <input
                    required
                    type="number"
                    step="1"
                    min="0"
                    value={actualSoldShares}
                    onChange={(event) => setActualSoldShares(event.target.value)}
                  />
                </label>

                <label className="trade-close-modal-field">
                  <span>Exit commission</span>
                  <input
                    type="number"
                    step="0.01"
                    value={exitCommission}
                    onChange={(event) => setExitCommission(event.target.value)}
                    placeholder="Optional"
                  />
                </label>

                <label className="trade-close-modal-field">
                  <span>Exit FX fee</span>
                  <input
                    type="number"
                    step="0.01"
                    value={exitFxFee}
                    onChange={(event) => setExitFxFee(event.target.value)}
                    placeholder="Optional"
                  />
                </label>

                <label className="trade-close-modal-field trade-close-modal-field--wide">
                  <span>Broker reference / note</span>
                  <textarea
                    rows={3}
                    value={brokerReferenceNote}
                    onChange={(event) => setBrokerReferenceNote(event.target.value)}
                    placeholder="Order id, Avanza note, or manual reference"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
                  <input
                    type="checkbox"
                    checked={userManuallyConfirmedSell}
                    onChange={(event) =>
                      handleManualSellConfirmationChange(event.target.checked)
                    }
                    className="mt-1 cursor-pointer"
                  />
                  <span>I manually confirmed SÄLJ in Avanza</span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
                  <input
                    type="checkbox"
                    checked={brokerOrderMatchesTradePlan}
                    onChange={(event) =>
                      handleBrokerPlanMatchChange(event.target.checked)
                    }
                    className="mt-1 cursor-pointer"
                  />
                  <span>Broker order matches this Trade position</span>
                </label>
              </div>

              <FillCaptureReviewPanel
                title="Exit Capture Review"
                review={exitCaptureReview}
              />

              <TureAgentCompletionPolicyPanel
                title="Ture Exit Completion Policy"
                policy={tureExitCompletionPolicy}
              />

              {brokerExitWarning && (
                <p className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
                  {brokerExitWarning}
                </p>
              )}

              {willRemainOpenAfterPartialExit && (
                <p className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] p-3 text-sm leading-6 text-cyan-100">
                  Partial close foundation is active: Ture will record this exit
                  fill, reduce remaining shares, and keep the position live.
                </p>
              )}

              {(exitConfirmationMessage || !brokerExitValidation.can_close_trade) && (
                <p className="mt-3 text-sm leading-6 text-amber-100">
                  {exitConfirmationMessage || brokerExitValidation.message}
                </p>
              )}
            </div>
          </AddTradeSection>

          <AddTradeSection title="Close Details">
            {showEodCloseWarning && (
              <div className="trade-close-modal-warning">
                <p>
                  This day trade is near/after market close. Confirm broker
                  execution before closing it in Ture.
                </p>
              </div>
            )}

            <div className="trade-close-modal-fields">
              <label className="trade-close-modal-field trade-close-modal-field--wide">
                <span>Exit Notes</span>
                <textarea
                  rows={4}
                  value={exitNotes}
                  onChange={(event) => onExitNotesChange(event.target.value)}
                />
              </label>
            </div>
          </AddTradeSection>
        </div>

        <div className="trade-add-modal__footer trade-close-modal__footer">
          <button
            type="submit"
            disabled={isSaving || !brokerExitValidation.can_close_trade}
            className="trade-add-modal__cta trade-close-modal__cta"
          >
            {sellPrimaryCtaLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

const historyOutcomeFilterOptions: Array<{
  value: HistoryOutcomeFilter;
  label: string;
}> = [
  { value: "all", label: "All outcomes" },
  { value: "winner", label: "Winners" },
  { value: "loser", label: "Losers" },
  { value: "breakeven", label: "Breakeven" },
  { value: "partial", label: "Partial" },
  { value: "needs_review", label: "Needs review" },
  { value: "invalid", label: "Invalid" },
];

const historyDemoFilterOptions: Array<{
  value: HistoryDemoFilter;
  label: string;
}> = [
  { value: "all", label: "Demo + real" },
  { value: "real", label: "Real only" },
  { value: "demo", label: "Demo only" },
];

const historyPartialFilterOptions: Array<{
  value: HistoryPartialFilter;
  label: string;
}> = [
  { value: "all", label: "All close states" },
  { value: "full", label: "Full closes" },
  { value: "partial", label: "Partial closes" },
  { value: "invalid", label: "Invalid partials" },
];

const historySortModeOptions: Array<{
  value: HistorySortMode;
  label: string;
}> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "best_pnl", label: "Best PnL" },
  { value: "worst_pnl", label: "Worst PnL" },
  { value: "best_r", label: "Best R" },
  { value: "worst_r", label: "Worst R" },
];

function historyOutcomeLabel(value: string) {
  return value.replace(/_/g, " ").toUpperCase();
}

function historyOutcomeTone(value: string) {
  if (value === "winner") {
    return "border-[#00db94]/25 bg-[#00db94]/10 text-emerald-100";
  }

  if (value === "loser" || value === "invalid") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  if (value === "partial" || value === "needs_review") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

function HistoryJournalControls({
  dashboard,
  outcomeFilter,
  demoFilter,
  partialFilter,
  sortMode,
  onOutcomeFilterChange,
  onDemoFilterChange,
  onPartialFilterChange,
  onSortModeChange,
}: {
  dashboard: HistoryDashboard;
  outcomeFilter: HistoryOutcomeFilter;
  demoFilter: HistoryDemoFilter;
  partialFilter: HistoryPartialFilter;
  sortMode: HistorySortMode;
  onOutcomeFilterChange: (value: HistoryOutcomeFilter) => void;
  onDemoFilterChange: (value: HistoryDemoFilter) => void;
  onPartialFilterChange: (value: HistoryPartialFilter) => void;
  onSortModeChange: (value: HistorySortMode) => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            History v2 Journal
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Showing {dashboard.counts.visible} of {dashboard.counts.total} closed
            trades. Demo {dashboard.counts.demo} · Real {dashboard.counts.real} ·
            Partial {dashboard.counts.partial} · Needs review{" "}
            {dashboard.counts.needs_review + dashboard.counts.invalid}.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <HistorySelect
            label="Outcome"
            value={outcomeFilter}
            options={historyOutcomeFilterOptions}
            onChange={(value) => onOutcomeFilterChange(value as HistoryOutcomeFilter)}
          />
          <HistorySelect
            label="Source"
            value={demoFilter}
            options={historyDemoFilterOptions}
            onChange={(value) => onDemoFilterChange(value as HistoryDemoFilter)}
          />
          <HistorySelect
            label="Partial"
            value={partialFilter}
            options={historyPartialFilterOptions}
            onChange={(value) => onPartialFilterChange(value as HistoryPartialFilter)}
          />
          <HistorySelect
            label="Sort"
            value={sortMode}
            options={historySortModeOptions}
            onChange={(value) => onSortModeChange(value as HistorySortMode)}
          />
        </div>
      </div>
    </div>
  );
}

function HistorySelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.13em] text-zinc-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-10 w-full cursor-pointer rounded-md border border-white/10 bg-[#090a0a] px-3 py-2 text-sm text-zinc-200 outline-none transition hover:border-white/20 focus:border-[#00db94]/40"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ClosedPositionCard({
  position,
  historySummary,
}: {
  position: ClosedPosition;
  historySummary: HistoryTradeSummary;
}) {
  const pnlValue = historySummary.effective_pnl ?? parseNumber(position.pnl);
  const pnlClassName =
    pnlValue !== null && pnlValue < 0 ? "text-rose-100" : "text-emerald-100";
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
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
  const outcomePill = (
    <span
      className={`w-fit rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${historyOutcomeTone(
        historySummary.outcome,
      )}`}
    >
      {historyOutcomeLabel(historySummary.outcome)}
    </span>
  );
  const firstLearning =
    outcomeExplanation.what_to_watch_next_time[0] ||
    improvementSuggestions.suggestions[0]?.suggested_action ||
    "History explanations are based on available structured data and may be incomplete.";
  const closedTradeRealityMode = isDemoPosition(position)
    ? "demo"
    : historySummary.execution_quality.broker_or_mock_source === "mock"
      ? "mock_broker"
      : position.executionMetadata
        ? "manual_broker_record"
        : "supabase_record";
  const closedTradeRealityBadges = [
    dataModeBadgeForMode(closedTradeRealityMode),
    dataModeBadgeForExecutionReality(
      isDemoPosition(position)
        ? "demo_only"
        : historySummary.execution_quality.broker_or_mock_source === "mock"
          ? "mock_only"
          : "manual_only",
    ),
  ];

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => setIsDetailsOpen(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setIsDetailsOpen(true);
        }
      }}
      className="bg-surface-subtle cursor-pointer rounded-lg border border-white/10 p-5 transition hover:border-white/20"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <CompanyIdentity
              ticker={position.ticker}
              companyName={position.companyName}
            />
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <DataModePillRow badges={closedTradeRealityBadges.slice(0, 1)} />
              {outcomePill}
            </div>
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            {getSetupTypeLabel(position.setupType)} · {position.direction} ·
            Closed {position.closedAt} · Opened {position.openedAt}
          </p>
        </div>
        <div className={`text-right font-mono text-sm font-semibold ${pnlClassName}`}>
          {formatSignedCurrency(historySummary.effective_pnl)}
          <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
            {formatSignedR(historySummary.effective_r)}
          </div>
        </div>
      </div>

      <MiniMetricGrid
        metrics={[
          { label: "PnL", value: formatSignedCurrency(historySummary.effective_pnl) },
          { label: "R", value: formatSignedR(historySummary.effective_r) },
          { label: "Entry", value: formatCurrency(historySummary.entry_price) },
          { label: "Exit", value: formatCurrency(historySummary.exit_price) },
          { label: "Shares", value: formatShares(historySummary.shares) },
          {
            label: "Partial Status",
            value: historySummary.partial.had_partial_exits
              ? "FULLY CLOSED AFTER PARTIAL"
              : formatStatisticsStatusLabel(historySummary.partial.status),
          },
          {
            label: "Hold Time",
            value: formatStatisticsDurationMinutes(historySummary.holding_minutes),
          },
          {
            label: "Source",
            value: historySummary.execution_quality.broker_or_mock_source.toUpperCase(),
          },
        ]}
      />

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-300">
        {outcomeExplanation.simple_explanation}
      </p>
      <p className="mt-2 line-clamp-1 text-xs leading-5 text-zinc-500">
        Journal note: {historySummary.learning_insights[0]?.detail ?? firstLearning}
      </p>

      <div className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        View details
      </div>

      {isDetailsOpen && (
        <TradingDetailsModal
          kind="Closed Trade"
          ticker={position.ticker}
          companyName={position.companyName}
          status={outcomePill}
          onClose={() => setIsDetailsOpen(false)}
        >
          <div className="space-y-4">
            <DataModeSurfaceNotice
              surface={{
                surface_id: "history_and_statistics",
                label: "History / Statistics",
                mode: closedTradeRealityMode,
                source_kind: isDemoPosition(position)
                  ? "local_storage"
                  : "supabase",
                freshness_status: "not_applicable",
                execution_reality: isDemoPosition(position)
                  ? "demo_only"
                  : historySummary.execution_quality.broker_or_mock_source === "mock"
                    ? "mock_only"
                    : "manual_only",
                badges: closedTradeRealityBadges,
                warnings:
                  historySummary.execution_quality.broker_or_mock_source === "mock"
                    ? [
                        {
                          surface_id: "history_and_statistics",
                          warning_id: "mock_history_record",
                          label: "Mock record",
                          message: "This history item includes mock broker test data.",
                          severity: "warning",
                        },
                      ]
                    : [],
                summary:
                  "History and Statistics summarize stored Ture records. They do not prove that Ture controlled Avanza or sent an order.",
              }}
              compact
            />
            <ClosedTradeResultStrip
              position={position}
              outcome={outcomeExplanation}
            />
            <ClosedTradeJournalSummary
              position={position}
              summary={historySummary}
            />
            <ClosedTradePlanningSnapshotPanel position={position} />
            <ClosedTradePlanVsActualReviewPanel position={position} />
            <ClosedTradeExecutionReview summary={historySummary} />
            <ClosedTradePartialFillReview
              position={position}
              summary={historySummary}
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

            <details className="rounded-md border border-white/10 bg-black/20 p-4">
              <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                Audit details
              </summary>
              <div className="mt-4 space-y-4">
                <BrokerExecutionMetadataPanel
                  metadata={position.executionMetadata}
                  compact
                />
                <BrokerOrderPreviewPanel
                  metadata={position.executionMetadata}
                  compact
                />
                <ExecutionQualityPanel
                  metadata={position.executionMetadata}
                  compact
                />
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
                History explanations are based on available structured data and may
                be incomplete.
              </p>
            </details>

            {position.exitNotes && (
              <TextBlock label="Exit Notes" value={position.exitNotes} />
            )}
          </div>
        </TradingDetailsModal>
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

function recommendationIntakeQualityStatusLabel(
  status: RecommendationIntakeQualityStatus,
) {
  if (status === "needs_review") {
    return "Needs review";
  }

  return status.replaceAll("_", " ");
}

function recommendationIntakeQualityStatusTone(
  status: RecommendationIntakeQualityStatus,
): "positive" | "warning" | "danger" | "neutral" {
  if (status === "accepted") {
    return "positive";
  }

  if (status === "needs_review" || status === "incomplete") {
    return "warning";
  }

  return "danger";
}

function recommendationEmptyStateSeverityClassName(
  severity: RecommendationEmptyStateSeverity,
) {
  if (severity === "critical") {
    return "border-rose-300/30 bg-rose-300/[0.07] text-rose-100";
  }

  if (severity === "warning") {
    return "border-amber-300/25 bg-amber-300/[0.07] text-amber-100";
  }

  return "border-cyan-300/20 bg-cyan-300/[0.055] text-cyan-100";
}

function recommendationEmptyStateReasonLabel(
  reason: RecommendationEmptyStateReason,
) {
  return reason.count && reason.count > 1
    ? `${reason.label} x${reason.count}`
    : reason.label;
}

function RecommendationEmptyStatePanel({
  summary,
  mode,
}: {
  summary: RecommendationEmptyStateSummary;
  mode: "dominant" | "supporting";
}) {
  const supportingReasons = summary.supporting_reasons.slice(0, 4);
  const notes = [
    summary.market_session_note
      ? ["Market/session", summary.market_session_note]
      : null,
    summary.data_freshness_note ? ["Data freshness", summary.data_freshness_note] : null,
    summary.risk_controls_note ? ["Risk controls", summary.risk_controls_note] : null,
  ].filter((item): item is string[] => item !== null);
  const panelClassName =
    mode === "supporting"
      ? "trade-recommendation-grid__notice rounded-lg border border-cyan-300/20 bg-cyan-300/[0.045] p-5"
      : "rounded-lg border border-cyan-300/20 bg-cyan-300/[0.045] p-6 sm:p-8";

  return (
    <section className={panelClassName} aria-labelledby="recommendation-empty-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100">
            No-trade decision
          </p>
          <h3
            id="recommendation-empty-title"
            className="mt-2 font-mono text-lg font-semibold text-white"
          >
            {summary.title}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
            {summary.body}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${recommendationEmptyStateSeverityClassName(
            summary.severity,
          )}`}
        >
          {summary.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="mt-5 rounded-md border border-white/10 bg-black/20 p-4">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Primary reason
        </p>
        <p className="mt-2 text-sm font-semibold text-zinc-100">
          {recommendationEmptyStateReasonLabel(summary.primary_reason)}
        </p>
        <p className="mt-1 text-sm leading-6 text-zinc-400">
          {summary.primary_reason.message}
        </p>
      </div>

      {supportingReasons.length > 0 && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {supportingReasons.map((reason) => (
            <div
              key={reason.reason_id}
              className="rounded-md border border-white/10 bg-black/20 p-3"
            >
              <p className="text-sm font-semibold text-zinc-100">
                {recommendationEmptyStateReasonLabel(reason)}
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                {reason.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {notes.map(([label, value]) => (
            <Detail key={label} label={label} value={value} />
          ))}
        </div>
      )}

      {summary.suggested_actions.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Suggested next actions
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {summary.suggested_actions.map((item) => (
              <span
                key={item.action_id}
                title={item.message}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  item.priority === "primary"
                    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                    : "border-white/10 bg-white/[0.04] text-zinc-300"
                }`}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        id="trade-recommendation-empty-state-json"
        data-agent-readable="true"
        className="sr-only"
      >
        {recommendationEmptyStateSummaryJson(summary)}
      </div>
    </section>
  );
}

function scanPipelineObservabilityStatusLabel(
  status: ScanPipelineObservabilityStatus,
) {
  return status.replaceAll("_", " ");
}

function scanPipelineObservabilityStatusTone(
  status: ScanPipelineObservabilityStatus,
): "positive" | "warning" | "danger" | "neutral" {
  if (status === "healthy") {
    return "positive";
  }

  if (status === "degraded" || status === "stale") {
    return "warning";
  }

  if (status === "incomplete" || status === "unknown") {
    return "neutral";
  }

  return "danger";
}

function RecommendationIntakeQualityDiagnostics({
  results,
  observabilitySummary,
}: {
  results: RecommendationIntakeQualityResult[];
  observabilitySummary: ScanPipelineObservabilitySummary;
}) {
  const topReasons = observabilitySummary.top_reasons.slice(0, 5);
  const elevatedResults = results.filter(
    (result) => result.status !== "accepted",
  );

  return (
    <details className="rounded-lg border border-white/10 bg-black/20 p-4">
      <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
        Scan Pipeline Observability
      </summary>
      <div className="mt-4 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm leading-6 text-zinc-400">
              Scan observability explains pipeline health and data coherence. It
              does not predict profit. Unavailable metrics are shown as unknown
              rather than guessed.
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {observabilitySummary.summary} Recommendation cards stay unchanged.
            </p>
          </div>
          <RecommendationDetailsPill
            label={scanPipelineObservabilityStatusLabel(
              observabilitySummary.status,
            )}
            tone={scanPipelineObservabilityStatusTone(
              observabilitySummary.status,
            )}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            label="Visible"
            value={String(observabilitySummary.visible_recommendation_count)}
          />
          <SummaryCard
            label="Accepted"
            value={String(observabilitySummary.intake_counts.accepted)}
          />
          <SummaryCard
            label="Needs Review"
            value={String(observabilitySummary.intake_counts.needs_review)}
          />
          <SummaryCard
            label="Rejected"
            value={String(observabilitySummary.intake_counts.rejected)}
          />
          <SummaryCard
            label="Accepted Rate"
            value={formatPercent(observabilitySummary.accepted_rate)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Elevated"
            value={String(observabilitySummary.elevated_candidate_count)}
          />
          <SummaryCard
            label="Stale"
            value={String(observabilitySummary.stale_candidate_count)}
          />
          <SummaryCard
            label="Incomplete"
            value={String(observabilitySummary.incomplete_data_candidate_count)}
          />
          <SummaryCard
            label="Tickers"
            value={
              observabilitySummary.tickers_represented.length === 0
                ? "—"
                : observabilitySummary.tickers_represented.join(", ")
            }
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-white/[0.025] p-3">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
              Source / freshness
            </h4>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Detail
                label="Latest Scan"
                value={formatDate(
                  observabilitySummary.run_context.latest_scan_at,
                )}
              />
              <Detail
                label="Latest Recommendation"
                value={formatDate(
                  observabilitySummary.run_context.latest_recommendation_at,
                )}
              />
              <Detail
                label="Data Age"
                value={
                  observabilitySummary.run_context.data_age_minutes === null
                    ? "Unknown"
                    : `${observabilitySummary.run_context.data_age_minutes}m`
                }
              />
              <Detail
                label="Market Context"
                value={`${observabilitySummary.run_context.market_session_phase ?? "unknown"} / ${
                  observabilitySummary.run_context.market_session_risk ?? "unknown"
                }`}
              />
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.025] p-3">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
              Unknown / unavailable
            </h4>
            {observabilitySummary.unknown_metrics.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
                {observabilitySummary.unknown_metrics.map((metric) => (
                  <li key={metric}>{metric}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                No unknown observability metrics surfaced.
              </p>
            )}
          </div>
        </div>

        {topReasons.length > 0 ? (
          <div className="rounded-md border border-white/10 bg-white/[0.025] p-3">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
              Top intake reasons
            </h4>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
              {topReasons.map((reason) => (
                <li key={reason.label}>
                  <span className="font-semibold text-zinc-100">
                    {reason.label}
                  </span>{" "}
                  <span className="text-zinc-500">x{reason.count}</span>
                  <span className="text-zinc-500"> — {reason.message}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm leading-6 text-zinc-500">
            No intake warnings or blockers found.
          </p>
        )}

        {elevatedResults.length > 0 && (
          <div className="grid gap-3 lg:grid-cols-2">
            {elevatedResults.slice(0, 4).map((result) => (
              <div
                key={result.result_id}
                className="rounded-md border border-white/10 bg-white/[0.025] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-mono text-sm font-semibold text-white">
                    {result.ticker ?? "—"}
                  </h4>
                  <RecommendationDetailsPill
                    label={recommendationIntakeQualityStatusLabel(result.status)}
                    tone={recommendationIntakeQualityStatusTone(result.status)}
                  />
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {result.summary}
                </p>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs leading-5 text-zinc-500">
          TODO: Wire this pure helper into the server-side scan pipeline before
          filtering generated recommendations. Current UI keeps visible
          recommendation behavior unchanged.
        </p>
        <div
          id="trade-scan-pipeline-observability-json"
          data-agent-readable="true"
          className="sr-only"
        >
          {scanPipelineObservabilitySummaryJson(observabilitySummary)}
        </div>
      </div>
    </details>
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
  size?: "normal" | "compact" | "live";
}) {
  const safeTicker = text(ticker, "—").toUpperCase();
  const safeCompanyName = text(companyName, safeTicker);
  const initials = safeTicker.slice(0, 2) || "T";
  const avatarClassName =
    size === "live"
      ? "trade-company-identity__avatar trade-company-identity__avatar--live"
      : `flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] font-mono font-bold uppercase tracking-[0.08em] text-zinc-200 ${
          size === "compact" ? "h-10 w-10 text-xs" : "h-12 w-12 text-sm"
        }`;
  const tickerClassName =
    size === "live"
      ? "trade-company-identity__ticker trade-company-identity__ticker--live"
      : `truncate font-mono font-semibold tracking-normal text-white ${
          size === "compact" ? "text-2xl" : "text-3xl"
        }`;
  const nameClassName =
    size === "live"
      ? "trade-company-identity__name trade-company-identity__name--live"
      : "mt-0.5 truncate text-sm text-zinc-400";

  return (
    <div className="trade-company-identity flex min-w-0 items-center gap-3">
      <div
        aria-hidden="true"
        className={avatarClassName}
      >
        {initials}
      </div>
      <div className="min-w-0">
        <div className={tickerClassName}>
          {safeTicker}
        </div>
        <div className={nameClassName}>
          {safeCompanyName}
        </div>
      </div>
    </div>
  );
}

function DismissibleWarning({
  storageKey,
  className,
  actionLabel = "Hide",
  children,
}: {
  storageKey: string;
  className: string;
  actionLabel?: string;
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

  const actionClassName = className.includes("trade-session-notification--danger")
    ? "trade-session-notification__button--danger"
    : className.includes("trade-session-notification--warning")
      ? "trade-session-notification__button--warning"
      : "trade-session-notification__button--positive";

  return (
    <div className={`${className} flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between`}>
      <div>{children}</div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          writeDismissedWarning(storageKey);
          setIsDismissed(true);
        }}
        className={`trade-session-notification__button ${actionClassName}`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function TradingDetailsModal({
  kind,
  ticker,
  companyName,
  status,
  onClose,
  children,
}: {
  kind: "Recommendation" | "Live Day Trade" | "Closed Trade";
  ticker: string;
  companyName?: string | null;
  status?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-5"
      onMouseDown={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-white/10 bg-[#0b0c0c] p-5 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {kind} details
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <CompanyIdentity ticker={ticker} companyName={companyName} />
              {status && <div className="shrink-0">{status}</div>}
            </div>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            X
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function DiscardRecommendationModal({
  ticker,
  companyName,
  isSaving,
  onCancel,
  onConfirm,
}: {
  ticker: string;
  companyName?: string | null;
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="trade-discard-modal-backdrop"
      role="presentation"
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <section
        aria-describedby="trade-discard-modal-description"
        aria-labelledby="trade-discard-modal-title"
        aria-modal="true"
        className="trade-discard-modal"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="trade-discard-modal-title">Discard Recommendation</h2>
        <p id="trade-discard-modal-description">
          Are you sure about discarding this trade recommendation?
        </p>
        <div className="trade-discard-modal__divider" />
        <div className="trade-discard-modal__actions">
          <button
            type="button"
            className="trade-discard-modal__button trade-discard-modal__button--danger"
            disabled={isSaving}
            onClick={async (event) => {
              event.stopPropagation();
              await onConfirm();
            }}
            title={`Discard ${displayValue(ticker)} ${displayValue(companyName)}`}
          >
            Discard
          </button>
          <button
            type="button"
            className="trade-discard-modal__button trade-discard-modal__button--neutral"
            disabled={isSaving}
            onClick={(event) => {
              event.stopPropagation();
              onCancel();
            }}
          >
            No
          </button>
        </div>
      </section>
    </div>
  );
}

function MiniMetricGrid({
  metrics,
}: {
  metrics: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={`${metric.label}:${metric.value}`}
          className="rounded-md border border-white/10 bg-black/20 px-3 py-2"
        >
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-zinc-500">
            {metric.label}
          </div>
          <div className="mt-1 truncate font-mono text-sm font-semibold text-zinc-100">
            {metric.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function LiveMetricGrid({
  metrics,
}: {
  metrics: Array<{ label: string; value: string; tone?: number | null }>;
}) {
  return (
    <div className="trade-live-metrics">
      {metrics.map((metric) => (
        <div key={metric.label} className="trade-live-metric">
          <div className="trade-live-metric__label">
            {displayValue(metric.label).toUpperCase()}
          </div>
          <div
            className={`trade-live-metric__value ${
              metric.tone !== undefined && metric.tone !== null
                ? metric.tone < 0
                  ? "trade-live-metric__value--negative"
                  : metric.tone > 0
                    ? "trade-live-metric__value--positive"
                    : ""
                : ""
            }`}
          >
            {displayValue(metric.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

function TradePrimaryStatusbar({
  updateLabel,
  updatedAt,
  currentTime,
  scanWindowLabel,
  onRefresh,
  isRefreshing,
  isDisabled = false,
}: {
  updateLabel: string;
  updatedAt: string | null | undefined;
  currentTime: Date;
  scanWindowLabel: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  isDisabled?: boolean;
}) {
  return (
    <div className="trade-primary-statusbar">
      <div className="trade-primary-statusbar__analysis">
        <Image
          src="/trade-assets/ture-logo-mark.svg"
          alt=""
          aria-hidden="true"
          width={20}
          height={20}
        />
        <span>Auto analyzing trades</span>
      </div>

      <div className="trade-primary-statusbar__meta">
        <span>Day trade window</span>
        <span aria-hidden="true">·</span>
        <span>{scanWindowLabel}</span>
      </div>

      <div className="trade-primary-statusbar__meta">
        <span>{updateLabel}</span>
        <span aria-hidden="true">·</span>
        <span>{formatStatusbarUpdatedAt(updatedAt, currentTime)}</span>
      </div>

      <button
        type="button"
        className="trade-primary-statusbar__refresh"
        onClick={onRefresh}
        disabled={isDisabled || isRefreshing}
      >
        {isRefreshing ? "Refreshing" : "Refresh"}
      </button>
    </div>
  );
}

function marketSessionPhaseLabel(value: MarketSessionPhase) {
  if (value === "pre_market") return "PRE-MARKET";
  if (value === "regular") return "REGULAR";
  if (value === "power_hour") return "POWER HOUR";
  if (value === "closing_soon") return "CLOSING SOON";
  if (value === "after_hours") return "AFTER HOURS";
  if (value === "closed") return "CLOSED";
  if (value === "holiday") return "HOLIDAY";
  return "UNKNOWN";
}

function marketSessionRiskTone(value: MarketSessionRiskLevel) {
  if (value === "low") {
    return "border-[#00db94]/25 bg-[#00db94]/10 text-emerald-100";
  }

  if (value === "medium") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }

  if (value === "high" || value === "critical") {
    return value === "critical"
      ? "border-rose-300/30 bg-rose-300/10 text-rose-100"
      : "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

function formatMarketSessionMinutes(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  if (value < 60) {
    return `${Math.max(0, Math.round(value))}m`;
  }

  const hours = Math.floor(value / 60);
  const minutes = Math.round(value % 60);
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

function MarketSessionSummaryPanel({
  evaluation,
  title,
  compact = false,
  domId,
}: {
  evaluation: MarketSessionEvaluation;
  title: string;
  compact?: boolean;
  domId?: string;
}) {
  const visibleWarnings = evaluation.warnings.slice(0, compact ? 2 : 4);
  const visibleBlockers = evaluation.blockers.slice(0, compact ? 2 : 4);

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {marketSessionPhaseLabel(evaluation.phase)} · NY{" "}
            {evaluation.ny_time} · {evaluation.source.replace(/_/g, " ")}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${marketSessionRiskTone(
            evaluation.risk_level,
          )}`}
        >
          {evaluation.risk_level}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Detail
          label="Market Open"
          value={evaluation.market_is_open ? "YES" : "NO"}
        />
        <Detail
          label="Open / Close"
          value={`${evaluation.window.open_time ?? "—"} / ${
            evaluation.window.close_time ?? "—"
          } ET`}
        />
        <Detail
          label="To Close"
          value={formatMarketSessionMinutes(evaluation.minutes_to_close)}
        />
        <Detail
          label="To Open"
          value={formatMarketSessionMinutes(evaluation.minutes_to_open)}
        />
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-400">
        {evaluation.next_recommended_action}
      </p>

      {(visibleBlockers.length > 0 || visibleWarnings.length > 0) && (
        <div className="mt-3 space-y-2">
          {visibleBlockers.map((item) => (
            <p
              key={item.blocker_id}
              className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] px-3 py-2 text-xs leading-5 text-rose-100"
            >
              {item.message}
            </p>
          ))}
          {visibleWarnings.map((item) => (
            <p
              key={item.warning_id}
              className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2 text-xs leading-5 text-amber-100"
            >
              {item.message}
            </p>
          ))}
        </div>
      )}

      {evaluation.approximation_note && (
        <p className="mt-3 text-xs leading-5 text-zinc-600">
          {evaluation.approximation_note}
        </p>
      )}

      {domId && (
        <div
          id={domId}
          data-agent-readable="true"
          data-market-session-phase={evaluation.phase}
          data-market-session-risk={evaluation.risk_level}
          className="sr-only"
        >
          {marketSessionEvaluationJson(evaluation)}
        </div>
      )}
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
