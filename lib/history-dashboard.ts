export type HistoryTradeOutcome =
  | "winner"
  | "loser"
  | "breakeven"
  | "partial"
  | "needs_review"
  | "invalid";

export type HistorySortMode =
  | "newest"
  | "oldest"
  | "best_pnl"
  | "worst_pnl"
  | "best_r"
  | "worst_r";

export type HistoryOutcomeFilter =
  | "all"
  | HistoryTradeOutcome;

export type HistoryDemoFilter = "all" | "demo" | "real";
export type HistoryPartialFilter = "all" | "partial" | "full" | "invalid";

export type HistoryFilterState = {
  outcome: HistoryOutcomeFilter;
  demo: HistoryDemoFilter;
  partial: HistoryPartialFilter;
  sort: HistorySortMode;
};

export type HistoryExecutionMetadataSnapshot = {
  broker_order_status?: string | null;
  broker_confirmed_at?: string | null;
  broker_reference_note?: string | null;
  actual_fill_price?: number | null;
  actual_shares?: number | null;
  planned_entry_price?: number | null;
  planned_shares?: number | null;
  broker_exit_confirmation?: {
    exit_status?: string | null;
    actual_exit_price?: number | null;
    actual_sold_shares?: number | null;
    broker_reference_note?: string | null;
    broker_confirmed_at?: string | null;
    user_manually_confirmed_sell?: boolean | null;
    broker_order_matches_trade_plan?: boolean | null;
  } | null;
  entry_fills?: Array<{
    status?: string | null;
    price?: number | null;
    shares?: number | null;
    filled_at?: string | null;
    reference_note?: string | null;
  }> | null;
  exit_fills?: Array<{
    status?: string | null;
    price?: number | null;
    shares?: number | null;
    filled_at?: string | null;
    reference_note?: string | null;
  }> | null;
  partial_position_status?: string | null;
  average_exit_price?: number | null;
  realized_pnl_from_exits?: number | null;
  remaining_shares?: number | null;
  trade_planning_snapshot?: {
    snapshot_id?: string | null;
    captured_at?: string | null;
    planned_quantity?: number | null;
    actual_entry_shares?: number | null;
    recommended_quantity?: number | null;
    estimated_risk_amount?: number | null;
    estimated_reward_amount?: number | null;
    risk_reward_ratio?: number | null;
    trade_plan_quality_status?: string | null;
    trade_plan_quality_grade?: string | null;
    risk_controls_status?: string | null;
    risk_controls_mode?: string | null;
    preflight_status?: string | null;
    market_session_phase?: string | null;
    market_session_risk?: string | null;
    broker_fill_status?: string | null;
    broker_reference?: string | null;
    demo_or_real_source?: string | null;
  } | null;
};

export type HistoryTradeInput = {
  id: string;
  ticker: string;
  companyName: string | null;
  setupType: string | null;
  direction: string | null;
  entryPrice: number | null;
  exitPrice: number | null;
  shares: number | null;
  pnl: number | null;
  rMultiple: number | null;
  openedAt: string | null;
  closedAt: string | null;
  closeReason: string | null;
  isDemo: boolean;
  executionMetadata?: HistoryExecutionMetadataSnapshot | null;
};

export type HistoryExecutionQuality = {
  entry_slippage: number | null;
  exit_price_source: "average_exit_fill" | "closed_trade_exit" | "unknown";
  entry_fill_status: string;
  exit_fill_status: string;
  manual_buy_confirmation_recorded: boolean;
  manual_sell_confirmation_recorded: boolean;
  broker_or_mock_source: "mock" | "broker" | "unknown";
};

export type HistoryPartialCloseSummary = {
  status: string;
  entry_fills_count: number;
  exit_fills_count: number;
  had_partial_exits: boolean;
  remaining_shares: number | null;
  average_exit_price: number | null;
  realized_pnl_from_exits: number | null;
};

export type HistoryLearningInsight = {
  id: string;
  label: string;
  detail: string;
};

export type HistoryTradeSummary = {
  id: string;
  ticker: string;
  companyName: string | null;
  outcome: HistoryTradeOutcome;
  effective_pnl: number | null;
  effective_r: number | null;
  entry_price: number | null;
  exit_price: number | null;
  shares: number | null;
  setup_type: string | null;
  close_reason: string | null;
  holding_minutes: number | null;
  is_demo: boolean;
  partial: HistoryPartialCloseSummary;
  execution_quality: HistoryExecutionQuality;
  learning_insights: HistoryLearningInsight[];
  warnings: string[];
  sort_timestamp: number;
};

export type HistoryDashboard = {
  trades: HistoryTradeSummary[];
  filteredTrades: HistoryTradeSummary[];
  filters: HistoryFilterState;
  counts: {
    total: number;
    visible: number;
    winners: number;
    losers: number;
    breakeven: number;
    partial: number;
    needs_review: number;
    invalid: number;
    demo: number;
    real: number;
  };
};

export const defaultHistoryFilterState: HistoryFilterState = {
  outcome: "all",
  demo: "all",
  partial: "all",
  sort: "newest",
};

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function timestampMs(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function effectivePnl(trade: HistoryTradeInput) {
  return (
    finiteNumber(trade.executionMetadata?.realized_pnl_from_exits) ??
    finiteNumber(trade.pnl)
  );
}

function effectiveR(trade: HistoryTradeInput) {
  return finiteNumber(trade.rMultiple);
}

function isPartialStatus(status: string | null | undefined) {
  return status === "partially_closed";
}

function deriveOutcome(trade: HistoryTradeInput): HistoryTradeOutcome {
  const metadata = trade.executionMetadata;
  const partialStatus = metadata?.partial_position_status ?? null;

  if (partialStatus === "invalid") {
    return "invalid";
  }

  if (isPartialStatus(partialStatus) || (finiteNumber(metadata?.remaining_shares) ?? 0) > 0) {
    return "partial";
  }

  const value = effectivePnl(trade) ?? effectiveR(trade);

  if (value === null) {
    return "needs_review";
  }

  if (Math.abs(value) < 0.000001) {
    return "breakeven";
  }

  return value > 0 ? "winner" : "loser";
}

function buildExecutionQuality(
  trade: HistoryTradeInput,
): HistoryExecutionQuality {
  const metadata = trade.executionMetadata;
  const plannedEntry = finiteNumber(metadata?.planned_entry_price);
  const actualEntry = finiteNumber(metadata?.actual_fill_price);
  const averageExit = finiteNumber(metadata?.average_exit_price);
  const exitStatus =
    metadata?.broker_exit_confirmation?.exit_status ??
    metadata?.exit_fills?.[metadata.exit_fills.length - 1]?.status ??
    "unknown";
  const referenceNotes = [
    metadata?.broker_reference_note,
    metadata?.broker_exit_confirmation?.broker_reference_note,
    ...(metadata?.entry_fills ?? []).map((fill) => fill.reference_note),
    ...(metadata?.exit_fills ?? []).map((fill) => fill.reference_note),
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return {
    entry_slippage:
      plannedEntry !== null && actualEntry !== null ? actualEntry - plannedEntry : null,
    exit_price_source:
      averageExit !== null
        ? "average_exit_fill"
        : trade.exitPrice !== null
          ? "closed_trade_exit"
          : "unknown",
    entry_fill_status: metadata?.broker_order_status ?? "unknown",
    exit_fill_status: exitStatus,
    manual_buy_confirmation_recorded: Boolean(metadata?.broker_confirmed_at),
    manual_sell_confirmation_recorded: Boolean(
      metadata?.broker_exit_confirmation?.user_manually_confirmed_sell ||
        metadata?.broker_exit_confirmation?.broker_confirmed_at,
    ),
    broker_or_mock_source: referenceNotes.includes("mock") ? "mock" : metadata ? "broker" : "unknown",
  };
}

function buildWarnings(trade: HistoryTradeInput) {
  const warnings: string[] = [];
  const metadata = trade.executionMetadata;

  if (!metadata) {
    warnings.push("Missing execution metadata.");
  }

  if (deriveOutcome(trade) === "needs_review") {
    warnings.push("Missing realized PnL/R outcome data.");
  }

  if (metadata?.partial_position_status === "invalid") {
    warnings.push("Partial position accounting is invalid.");
  }

  if ((finiteNumber(metadata?.remaining_shares) ?? 0) > 0) {
    warnings.push("Remaining shares are recorded after this history entry.");
  }

  if ((metadata?.exit_fills?.length ?? 0) === 0 && !metadata?.broker_exit_confirmation) {
    warnings.push("No broker exit-fill snapshot is recorded.");
  }

  return warnings;
}

function buildLearningInsights(
  trade: HistoryTradeInput,
  outcome: HistoryTradeOutcome,
  warnings: string[],
): HistoryLearningInsight[] {
  const insights: HistoryLearningInsight[] = [];

  if (trade.isDemo) {
    insights.push({
      id: "demo_trade",
      label: "Demo trade",
      detail: "This history item came from the local demo/mock flow.",
    });
  }

  if (outcome === "partial") {
    insights.push({
      id: "partial_close",
      label: "Partial close",
      detail: "Review remaining shares and exit-fill accounting before judging the full setup.",
    });
  }

  if (outcome === "winner") {
    insights.push({
      id: "plan_followed",
      label: "Plan followed",
      detail: "Closed performance is positive based on available realized data.",
    });
  }

  if (outcome === "loser") {
    insights.push({
      id: "stopped_or_loss",
      label: "Loss review",
      detail: "Review whether the exit matched the planned risk and stop logic.",
    });
  }

  if (warnings.length > 0) {
    insights.push({
      id: "manual_review_required",
      label: "Manual review required",
      detail: warnings[0],
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "descriptive_review",
      label: "Descriptive review",
      detail: "No special lifecycle warning was detected for this history item.",
    });
  }

  return insights.slice(0, 4);
}

export function buildHistoryTradeSummary(
  trade: HistoryTradeInput,
): HistoryTradeSummary {
  const metadata = trade.executionMetadata;
  const outcome = deriveOutcome(trade);
  const warnings = buildWarnings(trade);
  const opened = timestampMs(trade.openedAt);
  const closed = timestampMs(trade.closedAt);

  return {
    id: trade.id,
    ticker: trade.ticker,
    companyName: trade.companyName,
    outcome,
    effective_pnl: effectivePnl(trade),
    effective_r: effectiveR(trade),
    entry_price: finiteNumber(trade.entryPrice),
    exit_price: finiteNumber(metadata?.average_exit_price) ?? finiteNumber(trade.exitPrice),
    shares: finiteNumber(trade.shares),
    setup_type: trade.setupType,
    close_reason: trade.closeReason,
    holding_minutes:
      opened !== null && closed !== null && closed >= opened
        ? (closed - opened) / 60000
        : null,
    is_demo: trade.isDemo,
    partial: {
      status: metadata?.partial_position_status ?? "fully_closed",
      entry_fills_count: metadata?.entry_fills?.length ?? 0,
      exit_fills_count: metadata?.exit_fills?.length ?? 0,
      had_partial_exits:
        (metadata?.exit_fills?.length ?? 0) > 1 ||
        metadata?.exit_fills?.some((fill) => fill.status === "partially_filled") ===
          true,
      remaining_shares: finiteNumber(metadata?.remaining_shares),
      average_exit_price: finiteNumber(metadata?.average_exit_price),
      realized_pnl_from_exits: finiteNumber(metadata?.realized_pnl_from_exits),
    },
    execution_quality: buildExecutionQuality(trade),
    learning_insights: [],
    warnings,
    sort_timestamp: closed ?? opened ?? 0,
  };
}

function hydrateInsights(summary: HistoryTradeSummary) {
  return {
    ...summary,
    learning_insights: buildLearningInsights(
      {
        id: summary.id,
        ticker: summary.ticker,
        companyName: summary.companyName,
        setupType: summary.setup_type,
        direction: null,
        entryPrice: summary.entry_price,
        exitPrice: summary.exit_price,
        shares: summary.shares,
        pnl: summary.effective_pnl,
        rMultiple: summary.effective_r,
        openedAt: null,
        closedAt: null,
        closeReason: summary.close_reason,
        isDemo: summary.is_demo,
      },
      summary.outcome,
      summary.warnings,
    ),
  };
}

function filterTrade(summary: HistoryTradeSummary, filters: HistoryFilterState) {
  if (filters.outcome !== "all" && summary.outcome !== filters.outcome) {
    return false;
  }

  if (filters.demo === "demo" && !summary.is_demo) {
    return false;
  }

  if (filters.demo === "real" && summary.is_demo) {
    return false;
  }

  if (filters.partial === "partial" && summary.outcome !== "partial") {
    return false;
  }

  if (
    filters.partial === "full" &&
    (summary.outcome === "partial" ||
      summary.outcome === "invalid" ||
      summary.partial.status === "invalid")
  ) {
    return false;
  }

  if (filters.partial === "invalid" && summary.partial.status !== "invalid") {
    return false;
  }

  return true;
}

function sortTrades(
  trades: HistoryTradeSummary[],
  sort: HistorySortMode,
) {
  return [...trades].sort((first, second) => {
    if (sort === "oldest") {
      return first.sort_timestamp - second.sort_timestamp;
    }

    if (sort === "best_pnl") {
      return (second.effective_pnl ?? Number.NEGATIVE_INFINITY) -
        (first.effective_pnl ?? Number.NEGATIVE_INFINITY);
    }

    if (sort === "worst_pnl") {
      return (first.effective_pnl ?? Number.POSITIVE_INFINITY) -
        (second.effective_pnl ?? Number.POSITIVE_INFINITY);
    }

    if (sort === "best_r") {
      return (second.effective_r ?? Number.NEGATIVE_INFINITY) -
        (first.effective_r ?? Number.NEGATIVE_INFINITY);
    }

    if (sort === "worst_r") {
      return (first.effective_r ?? Number.POSITIVE_INFINITY) -
        (second.effective_r ?? Number.POSITIVE_INFINITY);
    }

    return second.sort_timestamp - first.sort_timestamp;
  });
}

export function buildHistoryDashboard(input: {
  trades: HistoryTradeInput[];
  filters?: Partial<HistoryFilterState>;
}): HistoryDashboard {
  const filters = {
    ...defaultHistoryFilterState,
    ...input.filters,
  };
  const trades = input.trades.map(buildHistoryTradeSummary).map(hydrateInsights);
  const filteredTrades = sortTrades(
    trades.filter((trade) => filterTrade(trade, filters)),
    filters.sort,
  );

  return {
    trades,
    filteredTrades,
    filters,
    counts: {
      total: trades.length,
      visible: filteredTrades.length,
      winners: trades.filter((trade) => trade.outcome === "winner").length,
      losers: trades.filter((trade) => trade.outcome === "loser").length,
      breakeven: trades.filter((trade) => trade.outcome === "breakeven").length,
      partial: trades.filter((trade) => trade.outcome === "partial").length,
      needs_review: trades.filter((trade) => trade.outcome === "needs_review").length,
      invalid: trades.filter((trade) => trade.outcome === "invalid").length,
      demo: trades.filter((trade) => trade.is_demo).length,
      real: trades.filter((trade) => !trade.is_demo).length,
    },
  };
}
