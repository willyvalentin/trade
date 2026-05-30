import {
  getCurrentTradingWeekRange,
  getLastTradingWeekRange,
} from "@/lib/market-session";
import type { BrokerExecutionMetadata } from "@/lib/broker-execution-metadata";
import {
  buildPlanVsActualReview,
  type PlanVsActualGrade,
  type PlanVsActualReview,
  type PlanVsActualStatus,
} from "@/lib/plan-vs-actual-review";

export type StatisticsTimeRange =
  | "today"
  | "this_week"
  | "this_month"
  | "last_trading_week"
  | "last_7_days"
  | "last_30_days"
  | "all";

export type StatisticsTradeInput = {
  id: string;
  ticker: string | null;
  companyName?: string | null;
  setupType?: string | null;
  entryPrice?: number | null;
  exitPrice?: number | null;
  shares?: number | null;
  pnl: number | null;
  rMultiple: number | null;
  closedAt: string | null;
  openedAt?: string | null;
  closeReason?: string | null;
  isDemo?: boolean;
  executionMetadata?: BrokerExecutionMetadata | null;
  partialPositionStatus?: string | null;
  remainingShares?: number | null;
  averageExitPrice?: number | null;
  realizedPnlFromExits?: number | null;
  exitFillsCount?: number | null;
};

export type StatisticsOpenPositionInput = {
  id: string;
  ticker: string | null;
  unrealizedPnl: number | null;
  lastUpdatedAt: string | null;
  openedAt?: string | null;
  partialPositionStatus?: string | null;
  remainingShares?: number | null;
  realizedPnlFromExits?: number | null;
  isDemo?: boolean;
};

export type StatisticsMetricSummary = {
  realizedPnl: number | null;
  totalR: number | null;
  winRate: number | null;
  trades: number;
  winners: number;
  losers: number;
  breakeven: number;
  averageR: number | null;
  averageWinnerR: number | null;
  averageLoserR: number | null;
  bestTrade: number | null;
  worstTrade: number | null;
  averageWinnerPnl: number | null;
  averageLoserPnl: number | null;
  profitFactor: number | "infinite" | null;
  expectancyPerTrade: number | null;
  averageHoldMinutes: number | null;
  maxDailyGain: number | null;
  maxDailyLoss: number | null;
  tradeFrequencyPerDay: number | null;
};

export type StatisticsProgressSummary = {
  status: "no_trades" | "positive" | "mixed" | "risky";
  title: string;
  message: string;
};

export type StatisticsSeriesPoint = {
  date: string;
  label: string;
  pnl: number;
  r: number;
  count: number;
};

export type StatisticsCumulativePoint = {
  id: string;
  label: string;
  timestamp: string | null;
  pnl: number;
  r: number;
  cumulativePnl: number;
  cumulativeR: number;
};

export type StatisticsOutcomeBreakdown = {
  winners: number;
  losers: number;
  breakeven: number;
  total: number;
};

export type StatisticsSetupTypePerformance = {
  setupType: string;
  count: number;
  totalPnl: number | null;
  totalR: number | null;
  averageR: number | null;
  winRate: number | null;
};

export type StatisticsRecentTrade = {
  id: string;
  ticker: string;
  companyName: string | null;
  outcome: "winner" | "loser" | "breakeven" | "unknown";
  pnl: number | null;
  rMultiple: number | null;
  closedAt: string | null;
  isDemo: boolean;
  partialPositionStatus: string | null;
  planAdherenceStatus: PlanVsActualStatus | null;
  planAdherenceGrade: PlanVsActualGrade | null;
};

export type StatisticsOpenContext = {
  activeCount: number;
  openUnrealizedPnl: number | null;
  lastPositionUpdateAt: string | null;
  realizedPnlFromPartialExits: number | null;
  partiallyClosedOpenCount: number;
  remainingSharesOpen: number | null;
};

export type StatisticsPartialCloseSummary = {
  partialClosedTrades: number;
  openPartiallyClosedTrades: number;
  closedTradesWithExitFills: number;
  realizedPnlFromExitFills: number | null;
  remainingSharesOpen: number | null;
};

export type StatisticsPeriodRiskSummary = {
  trades_opened_today: number;
  trades_closed_today: number;
  realized_pnl_today: number | null;
  realized_r_today: number | null;
  daily_loss_status: "ok" | "loss" | "no_realized_data";
  current_week_summary: {
    trades: number;
    realized_pnl: number | null;
    realized_r: number | null;
  };
  demo_trade_count: number;
  real_trade_count: number;
};

export type PlanAdherenceGradeBreakdown = Record<
  PlanVsActualGrade,
  number
>;

export type PlanAdherenceStatusBreakdown = Record<
  PlanVsActualStatus,
  number
>;

export type PlanAdherenceMetric = {
  metric_id: string;
  label: string;
  value: number | null;
  unit: "count" | "percent" | "r_multiple";
};

export type PlanAdherenceWarning = {
  warning_id: string;
  message: string;
};

export type PlanAdherenceSummary = {
  reviewed_trades: number;
  trades_with_planning_snapshot: number;
  trades_missing_planning_snapshot: number;
  followed_plan_count: number;
  followed_plan_rate: number | null;
  minor_deviation_count: number;
  minor_deviation_rate: number | null;
  major_deviation_count: number;
  major_deviation_rate: number | null;
  needs_review_count: number;
  needs_review_rate: number | null;
  incomplete_count: number;
  incomplete_rate: number | null;
  grade_breakdown: PlanAdherenceGradeBreakdown;
  status_breakdown: PlanAdherenceStatusBreakdown;
  trades_above_recommended_quantity: number;
  trades_above_planned_quantity: number;
  trades_realized_loss_exceeded_planned_risk: number;
  average_planned_risk_reward: number | null;
  average_realized_r_followed_plan: number | null;
  average_realized_r_deviated: number | null;
  average_reward_capture_percent: number | null;
  demo_reviewed_count: number;
  real_reviewed_count: number;
  warnings: PlanAdherenceWarning[];
  reviews: PlanVsActualReview[];
  metrics: PlanAdherenceMetric[];
};

export type StatisticsDashboard = {
  range: StatisticsTimeRange;
  rangeLabel: string;
  rangeDescription: string;
  generatedAt: string;
  filteredTrades: StatisticsTradeInput[];
  metrics: StatisticsMetricSummary;
  progressSummary: StatisticsProgressSummary;
  dailyPnlSeries: StatisticsSeriesPoint[];
  cumulativePnlSeries: StatisticsCumulativePoint[];
  cumulativeRSeries: StatisticsCumulativePoint[];
  outcomeBreakdown: StatisticsOutcomeBreakdown;
  setupTypePerformance: StatisticsSetupTypePerformance[];
  recentTrades: StatisticsRecentTrade[];
  openContext: StatisticsOpenContext;
  partialCloseSummary: StatisticsPartialCloseSummary;
  periodRiskSummary: StatisticsPeriodRiskSummary;
  planAdherenceSummary: PlanAdherenceSummary;
};

export const statisticsTimeRangeOptions: Array<{
  value: StatisticsTimeRange;
  label: string;
}> = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "last_trading_week", label: "Last trading week" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "all", label: "All" },
];

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function average(values: number[]) {
  return values.length === 0 ? null : sum(values) / values.length;
}

function effectivePnl(trade: StatisticsTradeInput) {
  return finiteNumber(trade.realizedPnlFromExits) ?? finiteNumber(trade.pnl);
}

function effectiveR(trade: StatisticsTradeInput) {
  return finiteNumber(trade.rMultiple);
}

function timestampMs(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function dateKey(value: string | null | undefined, fallback: Date) {
  const date = value ? new Date(value) : fallback;

  if (!Number.isFinite(date.getTime())) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(fallback);
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function shortDateLabel(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function tradeTimestamp(trade: StatisticsTradeInput) {
  return timestampMs(trade.closedAt) ?? timestampMs(trade.openedAt);
}

function tradeOutcome(trade: StatisticsTradeInput): StatisticsRecentTrade["outcome"] {
  const value = effectivePnl(trade) ?? effectiveR(trade);

  if (value === null) {
    return "unknown";
  }

  if (Math.abs(value) < 0.000001) {
    return "breakeven";
  }

  return value > 0 ? "winner" : "loser";
}

function rangeBounds(range: StatisticsTimeRange, now: Date) {
  if (range === "all") {
    return null;
  }

  const start = new Date(now);

  if (range === "today") {
    start.setHours(0, 0, 0, 0);
    return { start: start.getTime(), end: now.getTime() };
  }

  if (range === "this_week") {
    const rangeBounds = getCurrentTradingWeekRange({ now });
    return {
      start: new Date(rangeBounds.start_at).getTime(),
      end: Math.min(new Date(rangeBounds.end_at).getTime(), now.getTime()),
    };
  }

  if (range === "this_month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return { start: start.getTime(), end: now.getTime() };
  }

  if (range === "last_trading_week") {
    const lastTradingWeek = getLastTradingWeekRange({ now });
    return {
      start: new Date(lastTradingWeek.start_at).getTime(),
      end: new Date(lastTradingWeek.end_at).getTime(),
    };
  }

  const dayCount = range === "last_30_days" ? 30 : 7;
  start.setDate(start.getDate() - dayCount);

  return { start: start.getTime(), end: now.getTime() };
}

function rangeLabel(range: StatisticsTimeRange) {
  if (range === "today") return "Today";
  if (range === "this_week") return "This week";
  if (range === "this_month") return "This month";
  if (range === "last_trading_week") return "Last trading week";
  if (range === "last_7_days") return "Last 7 days";
  if (range === "last_30_days") return "Last 30 days";
  return "All available";
}

function rangeDescription(range: StatisticsTimeRange) {
  if (range === "today") return "Closed trades from the current US market day.";
  if (range === "this_week") {
    return "Closed trades from the current Monday-Friday US trading week. Holiday awareness depends on market calendar data.";
  }
  if (range === "this_month") return "Closed trades from the current calendar month.";
  if (range === "last_trading_week") {
    return "Closed trades from the previous Monday-Friday US trading week. Holiday awareness depends on market calendar data.";
  }
  if (range === "last_7_days") return "Closed trades from the latest 7 calendar days.";
  if (range === "last_30_days") {
    return "Closed trades from the latest 30 calendar days.";
  }
  return "All closed trades currently loaded in Trade.";
}

export function filterTradesByTimeRange(
  trades: StatisticsTradeInput[],
  range: StatisticsTimeRange,
  now = new Date(),
) {
  if (range === "today") {
    const todayKey = dateKey(now.toISOString(), now);

    return trades.filter((trade) => {
      if (tradeTimestamp(trade) === null) {
        return false;
      }

      return dateKey(trade.closedAt ?? trade.openedAt, now) === todayKey;
    });
  }

  const bounds = rangeBounds(range, now);

  if (bounds === null) {
    return [...trades];
  }

  return trades.filter((trade) => {
    const timestamp = tradeTimestamp(trade);
    return (
      timestamp !== null &&
      timestamp >= bounds.start &&
      timestamp <= bounds.end
    );
  });
}

export function calculateStatisticsMetrics(
  trades: StatisticsTradeInput[],
): StatisticsMetricSummary {
  const pnlValues = trades
    .map(effectivePnl)
    .filter((value): value is number => value !== null);
  const rValues = trades
    .map(effectiveR)
    .filter((value): value is number => value !== null);
  const outcomes = trades.map(tradeOutcome);
  const winners = outcomes.filter((outcome) => outcome === "winner").length;
  const losers = outcomes.filter((outcome) => outcome === "loser").length;
  const breakeven = outcomes.filter((outcome) => outcome === "breakeven").length;
  const winningR = trades
    .filter((trade) => tradeOutcome(trade) === "winner")
    .map(effectiveR)
    .filter((value): value is number => value !== null);
  const losingR = trades
    .filter((trade) => tradeOutcome(trade) === "loser")
    .map(effectiveR)
    .filter((value): value is number => value !== null);
  const winningPnl = trades
    .filter((trade) => tradeOutcome(trade) === "winner")
    .map(effectivePnl)
    .filter((value): value is number => value !== null);
  const losingPnl = trades
    .filter((trade) => tradeOutcome(trade) === "loser")
    .map(effectivePnl)
    .filter((value): value is number => value !== null);
  const grossProfit = sum(pnlValues.filter((value) => value > 0));
  const grossLoss = Math.abs(sum(pnlValues.filter((value) => value < 0)));
  const dailySeries = buildDailyPnlSeries(trades);
  const dailyPnlValues = dailySeries.map((point) => point.pnl);
  const dailyGains = dailyPnlValues.filter((value) => value > 0);
  const dailyLosses = dailyPnlValues.filter((value) => value < 0);
  const holdMinutes = trades
    .map((trade) => {
      const opened = timestampMs(trade.openedAt);
      const closed = timestampMs(trade.closedAt);
      return opened !== null && closed !== null && closed >= opened
        ? (closed - opened) / 60000
        : null;
    })
    .filter((value): value is number => value !== null);
  const uniqueTradeDays = new Set(
    trades
      .filter((trade) => tradeTimestamp(trade) !== null)
      .map((trade) => dateKey(trade.closedAt ?? trade.openedAt, new Date())),
  ).size;

  return {
    realizedPnl: pnlValues.length > 0 ? sum(pnlValues) : null,
    totalR: rValues.length > 0 ? sum(rValues) : null,
    winRate: trades.length > 0 ? (winners / trades.length) * 100 : null,
    trades: trades.length,
    winners,
    losers,
    breakeven,
    averageR: average(rValues),
    averageWinnerR: average(winningR),
    averageLoserR: average(losingR),
    bestTrade: rValues.length > 0 ? Math.max(...rValues) : null,
    worstTrade: rValues.length > 0 ? Math.min(...rValues) : null,
    averageWinnerPnl: average(winningPnl),
    averageLoserPnl: average(losingPnl),
    profitFactor:
      pnlValues.length === 0
        ? null
        : grossLoss === 0
          ? grossProfit > 0
            ? "infinite"
            : null
          : grossProfit / grossLoss,
    expectancyPerTrade: average(pnlValues),
    averageHoldMinutes: average(holdMinutes),
    maxDailyGain: dailyGains.length > 0 ? Math.max(...dailyGains) : null,
    maxDailyLoss: dailyLosses.length > 0 ? Math.min(...dailyLosses) : null,
    tradeFrequencyPerDay:
      uniqueTradeDays > 0 ? trades.length / uniqueTradeDays : null,
  };
}

function buildProgressSummary(
  metrics: StatisticsMetricSummary,
): StatisticsProgressSummary {
  if (metrics.trades === 0) {
    return {
      status: "no_trades",
      title: "No trades yet",
      message: "No closed trades in this period yet.",
    };
  }

  if (
    (metrics.realizedPnl !== null && metrics.realizedPnl < 0) ||
    (metrics.totalR !== null && metrics.totalR < 0)
  ) {
    return {
      status: "risky",
      title: "Risky session",
      message: "Review losses before adding risk.",
    };
  }

  if (
    metrics.realizedPnl !== null &&
    metrics.realizedPnl > 0 &&
    metrics.totalR !== null &&
    metrics.totalR > 0
  ) {
    return {
      status: "positive",
      title: "Positive session",
      message: "Progress is green for the selected period.",
    };
  }

  return {
    status: "mixed",
    title: "Mixed session",
    message: "Results are near flat or split between winners and losers.",
  };
}

export function buildDailyPnlSeries(
  trades: StatisticsTradeInput[],
  now = new Date(),
  maxBars = 30,
): StatisticsSeriesPoint[] {
  const grouped = new Map<string, StatisticsSeriesPoint>();

  for (const trade of trades) {
    const pnl = effectivePnl(trade);
    const r = effectiveR(trade);

    if (pnl === null && r === null) {
      continue;
    }

    const key = dateKey(trade.closedAt, now);
    const existing = grouped.get(key) ?? {
      date: key,
      label: shortDateLabel(key),
      pnl: 0,
      r: 0,
      count: 0,
    };

    existing.pnl += pnl ?? 0;
    existing.r += r ?? 0;
    existing.count += 1;
    grouped.set(key, existing);
  }

  return Array.from(grouped.values())
    .sort((first, second) => first.date.localeCompare(second.date))
    .slice(-maxBars);
}

export function buildCumulativePnlSeries(
  trades: StatisticsTradeInput[],
): StatisticsCumulativePoint[] {
  let cumulativePnl = 0;
  let cumulativeR = 0;

  return trades
    .filter((trade) => effectivePnl(trade) !== null || effectiveR(trade) !== null)
    .sort((first, second) => (tradeTimestamp(first) ?? 0) - (tradeTimestamp(second) ?? 0))
    .map((trade, index) => {
      const pnl = effectivePnl(trade) ?? 0;
      const r = effectiveR(trade) ?? 0;
      cumulativePnl += pnl;
      cumulativeR += r;

      return {
        id: trade.id,
        label: trade.ticker?.trim() || `Trade ${index + 1}`,
        timestamp: trade.closedAt,
        pnl,
        r,
        cumulativePnl,
        cumulativeR,
      };
    });
}

export function buildCumulativeRSeries(
  trades: StatisticsTradeInput[],
): StatisticsCumulativePoint[] {
  let cumulativeR = 0;

  return trades
    .filter((trade) => effectiveR(trade) !== null)
    .sort((first, second) => (tradeTimestamp(first) ?? 0) - (tradeTimestamp(second) ?? 0))
    .map((trade, index) => {
      const r = effectiveR(trade) ?? 0;
      cumulativeR += r;

      return {
        id: trade.id,
        label: trade.ticker?.trim() || `Trade ${index + 1}`,
        timestamp: trade.closedAt,
        pnl: effectivePnl(trade) ?? 0,
        r,
        cumulativePnl: 0,
        cumulativeR,
      };
    });
}

export function buildOutcomeBreakdown(
  trades: StatisticsTradeInput[],
): StatisticsOutcomeBreakdown {
  const outcomes = trades.map(tradeOutcome);

  return {
    winners: outcomes.filter((outcome) => outcome === "winner").length,
    losers: outcomes.filter((outcome) => outcome === "loser").length,
    breakeven: outcomes.filter((outcome) => outcome === "breakeven").length,
    total: trades.length,
  };
}

export function buildSetupTypePerformance(
  trades: StatisticsTradeInput[],
): StatisticsSetupTypePerformance[] {
  const grouped = new Map<string, StatisticsTradeInput[]>();

  for (const trade of trades) {
    const setupType = trade.setupType?.trim() || "UNKNOWN";
    grouped.set(setupType, [...(grouped.get(setupType) ?? []), trade]);
  }

  return Array.from(grouped.entries())
    .map(([setupType, setupTrades]) => {
      const pnlValues = setupTrades
        .map(effectivePnl)
        .filter((value): value is number => value !== null);
      const rValues = setupTrades
        .map(effectiveR)
        .filter((value): value is number => value !== null);
      const winners = setupTrades.filter(
        (trade) => tradeOutcome(trade) === "winner",
      ).length;

      return {
        setupType,
        count: setupTrades.length,
        totalPnl: pnlValues.length > 0 ? sum(pnlValues) : null,
        totalR: rValues.length > 0 ? sum(rValues) : null,
        averageR: average(rValues),
        winRate:
          setupTrades.length > 0 ? (winners / setupTrades.length) * 100 : null,
      };
    })
    .sort((first, second) => {
      if (second.count !== first.count) {
        return second.count - first.count;
      }

      return (second.totalR ?? Number.NEGATIVE_INFINITY) -
        (first.totalR ?? Number.NEGATIVE_INFINITY);
    })
    .slice(0, 6);
}

function buildRecentTrades(trades: StatisticsTradeInput[]) {
  return [...trades]
    .sort((first, second) => (tradeTimestamp(second) ?? 0) - (tradeTimestamp(first) ?? 0))
    .slice(0, 8)
    .map((trade): StatisticsRecentTrade => {
      const review = buildPlanVsActualReviewForTrade(trade);

      return {
        id: trade.id,
        ticker: trade.ticker?.trim() || "—",
        companyName: trade.companyName?.trim() || null,
        outcome: tradeOutcome(trade),
        pnl: effectivePnl(trade),
        rMultiple: effectiveR(trade),
        closedAt: trade.closedAt,
        isDemo: trade.isDemo === true,
        partialPositionStatus: trade.partialPositionStatus ?? null,
        planAdherenceStatus: review.status,
        planAdherenceGrade: review.grade,
      };
    });
}

function buildOpenContext(openPositions: StatisticsOpenPositionInput[]) {
  const pnlValues = openPositions
    .map((position) => finiteNumber(position.unrealizedPnl))
    .filter((value): value is number => value !== null);
  const realizedPartialValues = openPositions
    .map((position) => finiteNumber(position.realizedPnlFromExits))
    .filter((value): value is number => value !== null);
  const remainingShares = openPositions
    .map((position) => finiteNumber(position.remainingShares))
    .filter((value): value is number => value !== null);
  const lastPositionUpdateAt = openPositions.reduce<string | null>(
    (latest, position) => {
      const latestMs = timestampMs(latest);
      const nextMs = timestampMs(position.lastUpdatedAt);

      if (nextMs === null) {
        return latest;
      }

      return latestMs === null || nextMs > latestMs
        ? position.lastUpdatedAt
        : latest;
    },
    null,
  );

  return {
    activeCount: openPositions.length,
    openUnrealizedPnl: pnlValues.length > 0 ? sum(pnlValues) : null,
    lastPositionUpdateAt,
    realizedPnlFromPartialExits:
      realizedPartialValues.length > 0 ? sum(realizedPartialValues) : null,
    partiallyClosedOpenCount: openPositions.filter(
      (position) => position.partialPositionStatus === "partially_closed",
    ).length,
    remainingSharesOpen:
      remainingShares.length > 0 ? sum(remainingShares) : null,
  };
}

function buildPartialCloseSummary({
  filteredTrades,
  openPositions,
}: {
  filteredTrades: StatisticsTradeInput[];
  openPositions: StatisticsOpenPositionInput[];
}): StatisticsPartialCloseSummary {
  const realizedFromClosedExitFills = filteredTrades
    .filter((trade) => (trade.exitFillsCount ?? 0) > 0)
    .map((trade) => finiteNumber(trade.realizedPnlFromExits))
    .filter((value): value is number => value !== null);
  const realizedFromOpenPartialExits = openPositions
    .map((position) => finiteNumber(position.realizedPnlFromExits))
    .filter((value): value is number => value !== null);
  const remainingShares = openPositions
    .filter((position) => position.partialPositionStatus === "partially_closed")
    .map((position) => finiteNumber(position.remainingShares))
    .filter((value): value is number => value !== null);

  return {
    partialClosedTrades: filteredTrades.filter(
      (trade) => trade.partialPositionStatus === "partially_closed",
    ).length,
    openPartiallyClosedTrades: openPositions.filter(
      (position) => position.partialPositionStatus === "partially_closed",
    ).length,
    closedTradesWithExitFills: filteredTrades.filter(
      (trade) => (trade.exitFillsCount ?? 0) > 0,
    ).length,
    realizedPnlFromExitFills:
      realizedFromClosedExitFills.length + realizedFromOpenPartialExits.length > 0
        ? sum([...realizedFromClosedExitFills, ...realizedFromOpenPartialExits])
        : null,
    remainingSharesOpen:
      remainingShares.length > 0 ? sum(remainingShares) : null,
  };
}

function buildPeriodRiskSummary({
  allClosedTrades,
  filteredTrades,
  openPositions,
  now,
}: {
  allClosedTrades: StatisticsTradeInput[];
  filteredTrades: StatisticsTradeInput[];
  openPositions: StatisticsOpenPositionInput[];
  now: Date;
}): StatisticsPeriodRiskSummary {
  const todayKey = dateKey(now.toISOString(), now);
  const todayClosedTrades = allClosedTrades.filter(
    (trade) => dateKey(trade.closedAt ?? trade.openedAt, now) === todayKey,
  );
  const todayOpenedTrades =
    allClosedTrades.filter((trade) => dateKey(trade.openedAt, now) === todayKey)
      .length +
    openPositions.filter((position) => dateKey(position.openedAt, now) === todayKey)
      .length;
  const todayPnlValues = todayClosedTrades
    .map(effectivePnl)
    .filter((value): value is number => value !== null);
  const todayRValues = todayClosedTrades
    .map(effectiveR)
    .filter((value): value is number => value !== null);
  const weekTrades = filterTradesByTimeRange(allClosedTrades, "this_week", now);
  const weekPnlValues = weekTrades
    .map(effectivePnl)
    .filter((value): value is number => value !== null);
  const weekRValues = weekTrades
    .map(effectiveR)
    .filter((value): value is number => value !== null);
  const realizedPnlToday = todayPnlValues.length > 0 ? sum(todayPnlValues) : null;

  return {
    trades_opened_today: todayOpenedTrades,
    trades_closed_today: todayClosedTrades.length,
    realized_pnl_today: realizedPnlToday,
    realized_r_today: todayRValues.length > 0 ? sum(todayRValues) : null,
    daily_loss_status:
      realizedPnlToday === null
        ? "no_realized_data"
        : realizedPnlToday < 0
          ? "loss"
          : "ok",
    current_week_summary: {
      trades: weekTrades.length,
      realized_pnl: weekPnlValues.length > 0 ? sum(weekPnlValues) : null,
      realized_r: weekRValues.length > 0 ? sum(weekRValues) : null,
    },
    demo_trade_count: filteredTrades.filter((trade) => trade.isDemo === true)
      .length,
    real_trade_count: filteredTrades.filter((trade) => trade.isDemo !== true)
      .length,
  };
}

function emptyGradeBreakdown(): PlanAdherenceGradeBreakdown {
  return {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
    unknown: 0,
  };
}

function emptyStatusBreakdown(): PlanAdherenceStatusBreakdown {
  return {
    followed_plan: 0,
    minor_deviation: 0,
    major_deviation: 0,
    needs_review: 0,
    incomplete: 0,
  };
}

function rate(count: number, total: number) {
  return total > 0 ? (count / total) * 100 : null;
}

function metric(
  metricId: string,
  label: string,
  value: number | null,
  unit: PlanAdherenceMetric["unit"],
): PlanAdherenceMetric {
  return {
    metric_id: metricId,
    label,
    value,
    unit,
  };
}

function buildPlanVsActualReviewForTrade(
  trade: StatisticsTradeInput,
): PlanVsActualReview {
  return buildPlanVsActualReview({
    ticker: trade.ticker,
    snapshot: trade.executionMetadata?.trade_planning_snapshot ?? null,
    executionMetadata: trade.executionMetadata ?? null,
    entryPrice: trade.entryPrice ?? null,
    exitPrice: trade.exitPrice ?? trade.averageExitPrice ?? null,
    shares: trade.shares ?? null,
    realizedPnl: effectivePnl(trade),
    realizedR: effectiveR(trade),
    closeReason: trade.closeReason ?? null,
    isDemo: trade.isDemo === true,
  });
}

function buildPlanAdherenceSummary(
  trades: StatisticsTradeInput[],
): PlanAdherenceSummary {
  const reviews = trades.map(buildPlanVsActualReviewForTrade);
  const reviewedTrades = reviews.length;
  const gradeBreakdown = emptyGradeBreakdown();
  const statusBreakdown = emptyStatusBreakdown();

  for (const review of reviews) {
    gradeBreakdown[review.grade] += 1;
    statusBreakdown[review.status] += 1;
  }

  const tradesWithPlanningSnapshot = trades.filter(
    (trade) => trade.executionMetadata?.trade_planning_snapshot,
  ).length;
  const tradesAboveRecommendedQuantity = trades.filter((trade) => {
    const snapshot = trade.executionMetadata?.trade_planning_snapshot;
    const recommended = finiteNumber(snapshot?.recommended_quantity);
    const actual =
      finiteNumber(snapshot?.actual_entry_shares) ??
      finiteNumber(trade.executionMetadata?.actual_entry_shares) ??
      finiteNumber(trade.executionMetadata?.actual_shares);
    return recommended !== null && actual !== null && actual > recommended;
  }).length;
  const tradesAbovePlannedQuantity = trades.filter((trade) => {
    const snapshot = trade.executionMetadata?.trade_planning_snapshot;
    const planned = finiteNumber(snapshot?.planned_quantity);
    const actual =
      finiteNumber(snapshot?.actual_entry_shares) ??
      finiteNumber(trade.executionMetadata?.actual_entry_shares) ??
      finiteNumber(trade.executionMetadata?.actual_shares);
    return planned !== null && actual !== null && actual > planned;
  }).length;
  const tradesRiskExceeded = reviews.filter((review) =>
    review.deviations.some(
      (item) => item.deviation_id === "realized_loss_exceeded_planned_risk",
    ),
  ).length;
  const plannedRiskRewardValues = trades
    .map((trade) =>
      finiteNumber(trade.executionMetadata?.trade_planning_snapshot?.risk_reward_ratio),
    )
    .filter((value): value is number => value !== null);
  const followedPlanRealizedR = trades
    .map((trade, index) =>
      reviews[index]?.status === "followed_plan" ? effectiveR(trade) : null,
    )
    .filter((value): value is number => value !== null);
  const deviatedRealizedR = trades
    .map((trade, index) =>
      reviews[index]?.status === "minor_deviation" ||
      reviews[index]?.status === "major_deviation"
        ? effectiveR(trade)
        : null,
    )
    .filter((value): value is number => value !== null);
  const rewardCaptureValues = reviews
    .map((review) => finiteNumber(review.reward_capture_percent))
    .filter((value): value is number => value !== null);
  const warnings: PlanAdherenceWarning[] = [];
  const missingSnapshots = reviewedTrades - tradesWithPlanningSnapshot;

  if (reviewedTrades === 0) {
    warnings.push({
      warning_id: "no_reviewed_trades",
      message: "No closed trades are available for plan-adherence review in this range.",
    });
  }

  if (missingSnapshots > 0) {
    warnings.push({
      warning_id: "missing_planning_snapshots",
      message: `${missingSnapshots} closed trade${
        missingSnapshots === 1 ? "" : "s"
      } lack a creation-time planning snapshot.`,
    });
  }

  if (statusBreakdown.needs_review > 0) {
    warnings.push({
      warning_id: "needs_review_trades",
      message: `${statusBreakdown.needs_review} trade${
        statusBreakdown.needs_review === 1 ? "" : "s"
      } need process review, often due to partial fills/exits or incomplete context.`,
    });
  }

  return {
    reviewed_trades: reviewedTrades,
    trades_with_planning_snapshot: tradesWithPlanningSnapshot,
    trades_missing_planning_snapshot: missingSnapshots,
    followed_plan_count: statusBreakdown.followed_plan,
    followed_plan_rate: rate(statusBreakdown.followed_plan, reviewedTrades),
    minor_deviation_count: statusBreakdown.minor_deviation,
    minor_deviation_rate: rate(statusBreakdown.minor_deviation, reviewedTrades),
    major_deviation_count: statusBreakdown.major_deviation,
    major_deviation_rate: rate(statusBreakdown.major_deviation, reviewedTrades),
    needs_review_count: statusBreakdown.needs_review,
    needs_review_rate: rate(statusBreakdown.needs_review, reviewedTrades),
    incomplete_count: statusBreakdown.incomplete,
    incomplete_rate: rate(statusBreakdown.incomplete, reviewedTrades),
    grade_breakdown: gradeBreakdown,
    status_breakdown: statusBreakdown,
    trades_above_recommended_quantity: tradesAboveRecommendedQuantity,
    trades_above_planned_quantity: tradesAbovePlannedQuantity,
    trades_realized_loss_exceeded_planned_risk: tradesRiskExceeded,
    average_planned_risk_reward: average(plannedRiskRewardValues),
    average_realized_r_followed_plan: average(followedPlanRealizedR),
    average_realized_r_deviated: average(deviatedRealizedR),
    average_reward_capture_percent: average(rewardCaptureValues),
    demo_reviewed_count: trades.filter((trade) => trade.isDemo === true).length,
    real_reviewed_count: trades.filter((trade) => trade.isDemo !== true).length,
    warnings,
    reviews,
    metrics: [
      metric("plan_adherence_rate", "Plan adherence rate", rate(statusBreakdown.followed_plan, reviewedTrades), "percent"),
      metric("reviewed_trades", "Reviewed trades", reviewedTrades, "count"),
      metric("avg_planned_rr", "Avg planned R/R", average(plannedRiskRewardValues), "r_multiple"),
      metric("above_recommended_size", "Above recommended size", tradesAboveRecommendedQuantity, "count"),
      metric("risk_exceeded", "Risk exceeded", tradesRiskExceeded, "count"),
      metric("missing_snapshots", "Missing snapshots", missingSnapshots, "count"),
    ],
  };
}

export function buildStatisticsDashboard(input: {
  closedTrades: StatisticsTradeInput[];
  openPositions?: StatisticsOpenPositionInput[];
  range: StatisticsTimeRange;
  now?: Date;
}): StatisticsDashboard {
  const now = input.now ?? new Date();
  const filteredTrades = filterTradesByTimeRange(
    input.closedTrades,
    input.range,
    now,
  );
  const metrics = calculateStatisticsMetrics(filteredTrades);

  return {
    range: input.range,
    rangeLabel: rangeLabel(input.range),
    rangeDescription: rangeDescription(input.range),
    generatedAt: now.toISOString(),
    filteredTrades,
    metrics,
    progressSummary: buildProgressSummary(metrics),
    dailyPnlSeries: buildDailyPnlSeries(filteredTrades, now),
    cumulativePnlSeries: buildCumulativePnlSeries(filteredTrades),
    cumulativeRSeries: buildCumulativeRSeries(filteredTrades),
    outcomeBreakdown: buildOutcomeBreakdown(filteredTrades),
    setupTypePerformance: buildSetupTypePerformance(filteredTrades),
    recentTrades: buildRecentTrades(filteredTrades),
    openContext: buildOpenContext(input.openPositions ?? []),
    partialCloseSummary: buildPartialCloseSummary({
      filteredTrades,
      openPositions: input.openPositions ?? [],
    }),
    periodRiskSummary: buildPeriodRiskSummary({
      allClosedTrades: input.closedTrades,
      filteredTrades,
      openPositions: input.openPositions ?? [],
      now,
    }),
    planAdherenceSummary: buildPlanAdherenceSummary(filteredTrades),
  };
}
