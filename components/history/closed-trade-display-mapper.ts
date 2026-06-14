import {
  dataModeBadgeForExecutionReality,
  dataModeBadgeForMode,
  type DataMode,
  type DataModeBadge,
  type DataModeSurface,
  type ExecutionRealityStatus,
} from "@/lib/data-mode-clarity";
import type { HistoryTradeSummary } from "@/lib/history-dashboard";

export type ClosedTradeDisplayMetric = {
  label: string;
  value: string;
};

export type ClosedTradeDisplayPosition = {
  direction: string;
  executionMetadata?: unknown | null;
  pnl: string;
};

export type ClosedTradeDisplayProps = {
  firstLearning: string;
  metrics: ClosedTradeDisplayMetric[];
  outcomeLabel: string;
  outcomePillClassName: string;
  pnlClassName: string;
  pnlDisplay: string;
  rDisplay: string;
  realityBadges: DataModeBadge[];
  realityMode: DataMode;
  surfaceNotice: DataModeSurface;
};

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

function formatStatisticsStatusLabel(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return value.replace(/_/g, " ").toUpperCase();
}

export function closedTradeOutcomeLabel(value: string) {
  return value.replace(/_/g, " ").toUpperCase();
}

export function closedTradeOutcomeTone(value: string) {
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

export function buildClosedTradeDisplayProps({
  firstLearningFallback,
  isDemo,
  position,
  summary,
}: {
  firstLearningFallback: string;
  isDemo: boolean;
  position: ClosedTradeDisplayPosition;
  summary: HistoryTradeSummary;
}): ClosedTradeDisplayProps {
  const pnlValue = summary.effective_pnl ?? parseNumber(position.pnl);
  const outcomeLabel = closedTradeOutcomeLabel(summary.outcome);
  const realityMode: DataMode = isDemo
    ? "demo"
    : summary.execution_quality.broker_or_mock_source === "mock"
      ? "mock_broker"
      : position.executionMetadata
        ? "manual_broker_record"
        : "supabase_record";
  const executionReality: ExecutionRealityStatus = isDemo
    ? "demo_only"
    : summary.execution_quality.broker_or_mock_source === "mock"
      ? "mock_only"
      : "manual_only";
  const realityBadges = [
    dataModeBadgeForMode(realityMode),
    dataModeBadgeForExecutionReality(executionReality),
  ];

  return {
    firstLearning:
      summary.learning_insights[0]?.detail ??
      (firstLearningFallback ||
        "History explanations are based on available structured data and may be incomplete."),
    metrics: [
      { label: "PnL", value: formatSignedCurrency(summary.effective_pnl) },
      { label: "R", value: formatSignedR(summary.effective_r) },
      { label: "Entry", value: formatCurrency(summary.entry_price) },
      { label: "Exit", value: formatCurrency(summary.exit_price) },
      { label: "Shares", value: formatShares(summary.shares) },
      {
        label: "Partial Status",
        value: summary.partial.had_partial_exits
          ? "FULLY CLOSED AFTER PARTIAL"
          : formatStatisticsStatusLabel(summary.partial.status),
      },
      {
        label: "Hold Time",
        value: formatStatisticsDurationMinutes(summary.holding_minutes),
      },
      {
        label: "Source",
        value: summary.execution_quality.broker_or_mock_source.toUpperCase(),
      },
    ],
    outcomeLabel,
    outcomePillClassName: closedTradeOutcomeTone(summary.outcome),
    pnlClassName:
      pnlValue !== null && pnlValue < 0 ? "text-rose-100" : "text-emerald-100",
    pnlDisplay: formatSignedCurrency(summary.effective_pnl),
    rDisplay: formatSignedR(summary.effective_r),
    realityBadges,
    realityMode,
    surfaceNotice: {
      surface_id: "history_and_statistics",
      label: "History / Statistics",
      mode: realityMode,
      source_kind: isDemo ? "local_storage" : "supabase",
      freshness_status: "not_applicable",
      execution_reality: executionReality,
      badges: realityBadges,
      warnings:
        summary.execution_quality.broker_or_mock_source === "mock"
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
    },
  };
}
