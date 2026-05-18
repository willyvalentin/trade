"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Direction = "Long" | "Short";
type RecommendationStatus = "new" | "watched" | "ignored" | "taken";
type SessionType = "morning" | "midday";
type SessionFilter = "all" | SessionType;
type Tab = "Daily Recommendations" | "Active Positions" | "History";

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
  timeframe: string | null;
  thesis: string | null;
  invalidation: string | null;
  reason_to_avoid: string | null;
  status: string | null;
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
  message?: string;
  error?: string;
};

type MarketRegimeType = "risk_on" | "neutral" | "risk_off";

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
  timeframe: string;
  thesis: string;
  invalidation: string;
  reasonToAvoid: string;
  status: RecommendationStatus;
  createdAt: string;
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
  positionSize: string;
  stopLoss: string;
  target1: string;
  target2: string;
  openedAt: string;
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

type LatestPositionUpdate = {
  positionId: string;
  action: string;
  recommendation: string;
  explanation: string;
  newStop: string;
  currentPrice: string;
  unrealizedR: string;
  updatedAt: string;
};

const tabs: Tab[] = ["Daily Recommendations", "Active Positions", "History"];
const historyStatuses: RecommendationStatus[] = ["ignored", "watched", "taken"];
const sessionFilters: { label: string; value: SessionFilter }[] = [
  { label: "All", value: "all" },
  { label: "Morning", value: "morning" },
  { label: "Midday", value: "midday" },
];

const text = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
};

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

function parseNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function direction(value: string | null | undefined): Direction {
  return value?.toLowerCase() === "short" ? "Short" : "Long";
}

function status(value: string | null | undefined): RecommendationStatus {
  if (value === "watched" || value === "ignored" || value === "taken") {
    return value;
  }

  return "new";
}

function sessionType(value: string | null | undefined): SessionType {
  return value === "midday" ? "midday" : "morning";
}

function sessionLabel(value: SessionType) {
  return value === "midday" ? "Midday" : "Morning";
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

function toRecommendation(row: RecommendationRow): Recommendation {
  const entryLowValue = parseNumber(row.entry_low);
  const entryHighValue = parseNumber(row.entry_high);
  const stopLossValue = parseNumber(row.stop_loss);
  const recommendationSessionType = sessionType(row.session_type);

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
    timeframe: text(row.timeframe),
    thesis: text(row.thesis),
    invalidation: text(row.invalidation),
    reasonToAvoid: text(row.reason_to_avoid),
    status: status(row.status),
    createdAt: formatDate(row.created_at),
  };
}

function toActivePosition(row: PositionRow): ActivePosition {
  return {
    id: row.id,
    ticker: row.ticker,
    companyName: text(row.company_name),
    direction: direction(row.direction),
    entryPrice: money(row.entry_price),
    positionSize: money(row.position_size),
    stopLoss: text(row.current_stop),
    target1: text(row.target_1),
    target2: text(row.target_2),
    openedAt: formatDate(row.created_at),
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

function toLatestPositionUpdate(row: PositionUpdateRow): LatestPositionUpdate {
  return {
    positionId: row.position_id,
    action: text(row.action, "HOLD"),
    recommendation: text(row.recommendation),
    explanation: text(row.explanation),
    newStop: money(row.new_stop),
    currentPrice: "Not available",
    unrealizedR: "Not available",
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
    unrealizedR: formatNumber(update.unrealized_r_multiple, "R"),
    updatedAt: "Just now",
  };
}

export function TradeApp() {
  const [activeTab, setActiveTab] = useState<Tab>("Daily Recommendations");
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
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>("all");
  const [marketRegime, setMarketRegime] = useState<MarketRegime | null>(null);

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
      marketRegimeResult,
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
          .from("market_regime_snapshots")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
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

    if (marketRegimeResult.error) {
      setMessage(marketRegimeResult.error.message);
      setMarketRegime(null);
    } else {
      setMarketRegime(
        toMarketRegime(marketRegimeResult.data as MarketRegimeSnapshotRow | null),
      );
    }

    setIsLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadTradeData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function updateRecommendationStatus(
    recommendation: Recommendation,
    newStatus: RecommendationStatus,
  ) {
    setIsSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("recommendations")
      .update({ status: newStatus })
      .eq("id", recommendation.id);

    if (error) {
      setMessage(error.message);
      setIsSaving(false);
      return;
    }

    setRecommendations((currentRecommendations) =>
      currentRecommendations.map((item) =>
        item.id === recommendation.id ? { ...item, status: newStatus } : item,
      ),
    );
    setIsSaving(false);
  }

  async function generateRecommendations(sessionTypeToGenerate: SessionType) {
    setGeneratingSessionType(sessionTypeToGenerate);
    setMessage("");

    try {
      const response = await fetch("/api/recommendations/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_type: sessionTypeToGenerate }),
      });
      const result = (await response.json().catch(() => null)) as
        | GenerateRecommendationsResult
        | null;

      if (!response.ok) {
        throw new Error(result?.error || "Request failed");
      }

      await loadTradeData();

      if (result?.market_regime) {
        setMarketRegime(result.market_regime);
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
    const positionSizing = calculatePositionSizing(recommendation, userSettings);

    setSelectedRecommendation(recommendation);
    setEntryPrice("");
    setPositionSize(
      positionSizing.suggestedShares === null
        ? ""
        : String(positionSizing.suggestedShares),
    );
    setMessage("");
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
    setActiveTab("Active Positions");
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
    (recommendation) => !historyStatuses.includes(recommendation.status),
  );
  const filteredDailyRecommendations = dailyRecommendations.filter(
    (recommendation) =>
      sessionFilter === "all" || recommendation.sessionType === sessionFilter,
  );
  const historyRecommendations = recommendations.filter((recommendation) =>
    historyStatuses.includes(recommendation.status),
  );
  const watchedCount = recommendations.filter(
    (recommendation) => recommendation.status === "watched",
  ).length;
  const ignoredCount = recommendations.filter(
    (recommendation) => recommendation.status === "ignored",
  ).length;
  const performanceSummary = calculatePerformanceSummary(closedPositions);
  const setupPerformance = calculateSetupPerformance(closedPositions);

  return (
    <main className="min-h-screen bg-[#060707] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              <span>Private app</span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span>AI draft mode</span>
            </div>
            <div>
              <h1 className="font-mono text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                Trade
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                Daily trade ideas, active positions, and decision history in one
                quiet workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center sm:min-w-[420px]">
            <Stat label="Recommendations" value={dailyRecommendations.length} />
            <Stat label="Active" value={activePositions.length} />
            <Stat label="Watched" value={watchedCount} />
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
                  ? "border-emerald-300 bg-emerald-300 text-zinc-950"
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

        {activeTab === "Daily Recommendations" && (
          <section className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-mono text-2xl font-semibold tracking-normal text-white">
                  Daily Recommendations
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {ignoredCount} ignored, {watchedCount} watched, saved in Supabase.
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                  AI-generated draft recommendations based on mock candidate data.
                  Live market data is not connected yet.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:min-w-[360px]">
                <MarketRegimeCard marketRegime={marketRegime} />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => generateRecommendations("morning")}
                    disabled={isLoading || generatingSessionType !== null}
                    className="min-h-11 rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                  >
                    {generatingSessionType === "morning"
                      ? "Generating..."
                      : "Generate Morning Scan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => generateRecommendations("midday")}
                    disabled={isLoading || generatingSessionType !== null}
                    className="min-h-11 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-100 transition hover:border-emerald-200/60 hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-zinc-900 disabled:text-zinc-600"
                  >
                    {generatingSessionType === "midday"
                      ? "Generating..."
                      : "Generate Midday Scan"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {sessionFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSessionFilter(filter.value)}
                  className={`rounded-full border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    sessionFilter === filter.value
                      ? "border-emerald-300 bg-emerald-300 text-zinc-950"
                      : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-zinc-100"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <EmptyState
                title="Loading recommendations"
                message="Trade is reading your Supabase recommendations table."
              />
            ) : dailyRecommendations.length === 0 ? (
              <EmptyState
                title="No recommendations yet"
                message="Add rows to the recommendations table in Supabase. New rows with status new or empty will appear here."
              />
            ) : filteredDailyRecommendations.length === 0 ? (
              <EmptyState
                title={`No ${sessionFilter} recommendations`}
                message="Switch filters or generate a scan for this session."
              />
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {filteredDailyRecommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    positionSizing={calculatePositionSizing(
                      recommendation,
                      userSettings,
                    )}
                    isSaving={isSaving}
                    onTakeTrade={openTradeModal}
                    onWatchOnly={(item) =>
                      updateRecommendationStatus(item, "watched")
                    }
                    onIgnore={(item) => updateRecommendationStatus(item, "ignored")}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "Active Positions" && (
          <section className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-mono text-2xl font-semibold tracking-normal text-white">
                  Active Positions
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Open positions loaded from the positions table.
                </p>
              </div>
              <button
                type="button"
                onClick={updatePositions}
                disabled={isLoading || isUpdatingPositions || activePositions.length === 0}
                className="min-h-11 rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {isUpdatingPositions ? "Updating..." : "Update Positions"}
              </button>
            </div>

            {isLoading ? (
              <EmptyState
                title="Loading positions"
                message="Trade is reading your open Supabase positions."
              />
            ) : activePositions.length === 0 ? (
              <EmptyState
                title="No active positions yet"
                message="Use Took trade on a recommendation to create an open position."
              />
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {activePositions.map((position) => (
                  <ActivePositionCard
                    key={position.id}
                    position={position}
                    latestUpdate={latestPositionUpdates[position.id]}
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
                Closed positions and recommendation decisions.
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

            <HistorySection title="Recommendation History">
              {isLoading ? (
                <EmptyState
                  title="Loading history"
                  message="Trade is reading completed recommendation decisions."
                />
              ) : historyRecommendations.length === 0 ? (
                <EmptyState
                  title="No recommendation history yet"
                  message="Ignored, watched, and taken recommendations will appear here."
                />
              ) : (
                <div className="overflow-hidden rounded-lg border border-white/10">
                  {historyRecommendations.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-3 border-b border-white/10 bg-white/[0.025] p-4 last:border-b-0 sm:grid-cols-[140px_1fr_150px]"
                    >
                      <div className="font-mono text-sm font-semibold text-white">
                        {item.status}
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
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
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
    <section className="mt-5 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.04] p-4">
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
  onWatchOnly,
  onIgnore,
}: {
  recommendation: Recommendation;
  positionSizing: PositionSizing;
  isSaving: boolean;
  onTakeTrade: (recommendation: Recommendation) => void;
  onWatchOnly: (recommendation: Recommendation) => void;
  onIgnore: (recommendation: Recommendation) => void;
}) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-3xl font-semibold tracking-normal text-white">
              {recommendation.ticker}
            </span>
            <DirectionPill direction={recommendation.direction} />
            <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100">
              {recommendation.sessionLabel}
            </span>
          </div>
          <p className="mt-1 break-words text-sm text-zinc-400">
            {recommendation.companyName}
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-left sm:text-right">
          <div className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
            Confidence
          </div>
          <div className="mt-1 font-mono text-sm font-semibold text-white">
            {recommendation.confidence}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Setup" value={recommendation.setupType} />
        <Detail label="Entry Zone" value={recommendation.entryZone} />
        <Detail label="Stop Loss" value={recommendation.stopLoss} />
        <Detail label="Target 1" value={recommendation.target1} />
        <Detail label="Target 2" value={recommendation.target2} />
        <Detail label="Risk/Reward" value={recommendation.riskReward} />
        <Detail label="Timeframe" value={recommendation.timeframe} />
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
          disabled={isSaving}
          className="min-h-11 flex-1 rounded-md bg-emerald-300 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          Took trade
        </button>
        <button
          type="button"
          onClick={() => onWatchOnly(recommendation)}
          disabled={isSaving}
          className="min-h-11 flex-1 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-zinc-900 disabled:text-zinc-600"
        >
          Watch only
        </button>
        <button
          type="button"
          onClick={() => onIgnore(recommendation)}
          disabled={isSaving}
          className="min-h-11 flex-1 rounded-md border border-rose-300/30 bg-rose-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-200/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-zinc-900 disabled:text-zinc-600"
        >
          Ignore
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
              Took trade
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
              Position Size
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
          className="mt-5 min-h-11 w-full rounded-md bg-emerald-300 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
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
  isSaving,
  onClosePosition,
}: {
  position: ActivePosition;
  latestUpdate?: LatestPositionUpdate;
  isSaving: boolean;
  onClosePosition: (position: ActivePosition) => void;
}) {
  return (
    <article className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.045] p-5">
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
        <div className="font-mono text-xs uppercase tracking-[0.12em] text-emerald-200">
          Opened {position.openedAt}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Entry Price" value={position.entryPrice} />
        <Detail label="Position Size" value={position.positionSize} />
        <Detail label="Stop Loss" value={position.stopLoss} />
        <Detail label="Target 1" value={position.target1} />
        <Detail label="Target 2" value={position.target2} />
        {latestUpdate && (
          <>
            <Detail label="Current Price" value={latestUpdate.currentPrice} />
            <Detail label="Unrealized R" value={latestUpdate.unrealizedR} />
            <Detail label="Latest Action" value={latestUpdate.action} />
          </>
        )}
      </div>

      {latestUpdate && (
        <div className="mt-5 rounded-md border border-white/10 bg-black/25 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
              {latestUpdate.action}
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
        </div>
      )}

      <button
        type="button"
        onClick={() => onClosePosition(position)}
        disabled={isSaving}
        className="mt-5 min-h-11 w-full rounded-md border border-rose-300/35 bg-rose-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-200/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-zinc-900 disabled:text-zinc-600"
      >
        Close Position
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
              Close position
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
          <Detail label="Position Size" value={position.positionSize} />
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
          {isSaving ? "Closing position" : "Close position"}
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
    <article className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
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
        <Detail label="Position Size" value={position.positionSize} />
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
    <div className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-4">
      <div className="font-mono text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}

function MarketRegimeCard({
  marketRegime,
}: {
  marketRegime: MarketRegime | null;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
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
          : "No market regime snapshot yet. Run a Morning or Midday scan."}
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
      ? "border-emerald-300/35 bg-emerald-300/10 text-emerald-100"
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
