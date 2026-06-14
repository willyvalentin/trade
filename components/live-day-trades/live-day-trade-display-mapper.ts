import {
  dataModeBadgeForExecutionReality,
  dataModeBadgeForMode,
  type DataModeBadge,
} from "@/lib/data-mode-clarity";
import type { LiveSellGuidance } from "@/lib/live-sell-guidance";

export type LiveDayTradeMetric = {
  label: string;
  tone?: number | null;
  value: string;
};

export type LiveDayTradeDisplayInput = {
  actionIsTakeProfit: boolean;
  currentR: number | null;
  currentPrice: string | null | undefined;
  guidanceAction: string;
  isDemo: boolean;
  liveSellGuidance: LiveSellGuidance;
  partialPositionStatus: string;
  positionSize: string;
  remainingShares: number | null | undefined;
  setupLabel: string;
  stopLoss: string;
  target1: string;
  timeInTrade: string;
  ticker: string;
  unrealizedPnl: number | null;
  updatedAt?: string | null;
  entryPrice: string;
};

export type LiveDayTradeDisplayProps = {
  actionPillClassName: string;
  ariaLabel: string;
  cardClassName: string;
  closeButtonLabel: "Prepare Sell Order" | "Close Trade";
  closeButtonTone: "trade-live-close-button--active" | "trade-live-close-button--neutral";
  guidanceNextStep: string;
  guidancePrimaryMessage: string;
  isPartiallyClosed: boolean;
  metrics: LiveDayTradeMetric[];
  partialCloseMessage: string | null;
  profitFadeMessage: string | null;
  realityBadges: DataModeBadge[];
  updatedAtDisplay: string;
};

function displayValue(value: unknown, fallback = "—") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
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

function formatSignedCurrency(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  const formatted = formatCurrency(Math.abs(value));
  return `${value >= 0 ? "+" : "-"}${formatted}`;
}

function formatSignedR(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}R`;
}

export function liveDayTradeActionClassName(value: string) {
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

export function liveDayTradeActionPillClassName(value: string) {
  if (value === "CLOSE_POSITION") return "trade-live-action-pill--close";
  if (value === "TAKE_PROFIT" || value === "TAKE_PARTIAL_PROFIT") {
    return "trade-live-action-pill--profit";
  }

  return "trade-live-action-pill--hold";
}

export function liveDayTradeGuidanceCardClassName(guidance: LiveSellGuidance) {
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

export function buildLiveDayTradeDisplayProps({
  actionIsTakeProfit,
  currentR,
  currentPrice,
  entryPrice,
  guidanceAction,
  isDemo,
  liveSellGuidance,
  partialPositionStatus,
  positionSize,
  remainingShares,
  setupLabel,
  stopLoss,
  target1,
  timeInTrade,
  ticker,
  unrealizedPnl,
  updatedAt,
}: LiveDayTradeDisplayInput): LiveDayTradeDisplayProps {
  const isPartiallyClosed = partialPositionStatus === "partially_closed";
  const actionPillClassName = `${liveDayTradeActionPillClassName(
    guidanceAction,
  )} ${liveDayTradeActionClassName(guidanceAction)}`;
  const closeButtonIsActive =
    liveSellGuidance.should_prepare_sell_handoff || actionIsTakeProfit;

  return {
    actionPillClassName,
    ariaLabel: `${displayValue(ticker)} live day trade, ${displayValue(
      setupLabel,
    )}, in trade ${displayValue(timeInTrade)}`,
    cardClassName: liveDayTradeGuidanceCardClassName(liveSellGuidance),
    closeButtonLabel: liveSellGuidance.should_prepare_sell_handoff
      ? "Prepare Sell Order"
      : "Close Trade",
    closeButtonTone: closeButtonIsActive
      ? "trade-live-close-button--active"
      : "trade-live-close-button--neutral",
    guidanceNextStep: displayValue(liveSellGuidance.next_step),
    guidancePrimaryMessage: displayValue(liveSellGuidance.primary_message),
    isPartiallyClosed,
    metrics: [
      {
        label: "Current",
        value: currentPrice ?? "—",
      },
      {
        label: "Unrealized",
        value: formatSignedCurrency(unrealizedPnl),
        tone: unrealizedPnl,
      },
      { label: "Current R", value: formatSignedR(currentR) },
      { label: "Shares", value: positionSize },
      { label: "Entry", value: entryPrice },
      { label: "Stop", value: stopLoss },
      { label: "Target", value: target1 },
    ],
    partialCloseMessage: isPartiallyClosed
      ? `Partial close recorded. Remaining shares: ${formatShares(
          remainingShares,
        )}.`
      : null,
    profitFadeMessage: liveSellGuidance.is_profit_fading
      ? `Profit fade: ${formatSignedR(
          liveSellGuidance.profit_fade_from_best,
        )} from best known R.`
      : null,
    realityBadges: [
      isDemo
        ? dataModeBadgeForMode("demo")
        : dataModeBadgeForMode("manual_broker_record"),
      dataModeBadgeForExecutionReality(isDemo ? "demo_only" : "manual_only"),
    ],
    updatedAtDisplay: displayValue(updatedAt),
  };
}
