import { expect, test } from "@playwright/test";

import {
  buildHistoryDashboard,
  buildHistoryTradeSummary,
} from "@/lib/history-dashboard";
import {
  buildCumulativePnlSeries,
  buildDailyPnlSeries,
  buildStatisticsDashboard,
  buildOutcomeBreakdown,
  calculateStatisticsMetrics,
} from "@/lib/statistics-dashboard";

function tradeWithRemainingShares(
  remainingShares: number,
  actualEntryShares = 10,
) {
  return {
    id: `history-${remainingShares}`,
    ticker: "TURE",
    companyName: null,
    setupType: null,
    direction: "Long",
    entryPrice: 100,
    exitPrice: 110,
    shares: 10,
    pnl: 100,
    rMultiple: 1,
    openedAt: "2026-09-10T13:00:00.000Z",
    closedAt: "2026-09-10T14:00:00.000Z",
    closeReason: null,
    isDemo: false,
    executionMetadata: {
      actual_entry_shares: actualEntryShares,
      remaining_shares: remainingShares,
      trade_planning_snapshot: {
        actual_entry_shares: 10,
      },
    },
  };
}

function statisticsTradeWithRemainingShares(
  id: string,
  remainingShares: number | null,
  partialPositionStatus: string | null = null,
) {
  return {
    id,
    ticker: "TURE",
    pnl: 100,
    rMultiple: 1,
    closedAt: "2026-09-10T14:00:00.000Z",
    openedAt: "2026-09-10T13:00:00.000Z",
    partialPositionStatus,
    remainingShares,
    realizedPnlFromExits: 100,
  };
}

test.describe("MVP-04 invalid history containment", () => {
  test("does not classify impossible negative remaining shares as a winning close", () => {
    const history = buildHistoryTradeSummary(tradeWithRemainingShares(-1));

    expect(history.outcome).toBe("invalid");
    expect(history.partial).toMatchObject({
      remaining_shares: -1,
      status: "invalid",
    });
    expect(history.warnings).toContain("Remaining shares cannot be negative.");
  });

  test("keeps valid zero-share closes in the ordinary full-close path", () => {
    const history = buildHistoryTradeSummary(tradeWithRemainingShares(0));

    expect(history.outcome).toBe("winner");
    expect(history.partial.status).toBe("fully_closed");
    expect(history.warnings).not.toContain("Remaining shares cannot be negative.");
  });

  test("does not present more remaining shares than the recorded entry as a partial close", () => {
    const history = buildHistoryTradeSummary(tradeWithRemainingShares(11));

    expect(history.outcome).toBe("invalid");
    expect(history.partial).toMatchObject({
      remaining_shares: 11,
      status: "invalid",
    });
    expect(history.warnings).toContain(
      "Remaining shares exceed the recorded entry shares.",
    );
  });

  test("uses the stored actual entry ahead of a conflicting planning snapshot", () => {
    const history = buildHistoryTradeSummary(tradeWithRemainingShares(9, 8));

    expect(history.outcome).toBe("invalid");
    expect(history.warnings).toContain(
      "Remaining shares exceed the recorded entry shares.",
    );
  });

  test("keeps a smaller remaining quantity in the ordinary partial-close path", () => {
    const history = buildHistoryTradeSummary(tradeWithRemainingShares(1));

    expect(history.outcome).toBe("partial");
    expect(history.partial.status).toBe("partially_closed");
    expect(history.warnings).toContain(
      "Remaining shares are recorded after this history entry.",
    );
  });

  test("keeps an impossible remaining-share record in the invalid history filter", () => {
    const dashboard = buildHistoryDashboard({
      filters: {
        demo: "all",
        outcome: "all",
        partial: "invalid",
        sort: "newest",
      },
      trades: [
        tradeWithRemainingShares(-1),
        tradeWithRemainingShares(11),
        tradeWithRemainingShares(0),
      ],
    });

    expect(dashboard.filteredTrades).toHaveLength(2);
    expect(dashboard.filteredTrades.map((trade) => trade.id)).toEqual([
      "history--1",
      "history-11",
    ]);
  });

  test("keeps incomplete or contradictory close rows out of aggregate performance", () => {
    const complete = statisticsTradeWithRemainingShares("complete", 0);
    const partial = statisticsTradeWithRemainingShares("partial", 1);
    const invalid = statisticsTradeWithRemainingShares("invalid", -1, "invalid");

    expect(calculateStatisticsMetrics([complete, partial, invalid])).toMatchObject({
      realizedPnl: 100,
      totalR: 1,
      trades: 1,
      winners: 1,
      winRate: 100,
    });
    expect(buildDailyPnlSeries([complete, partial, invalid])).toEqual([
      expect.objectContaining({ count: 1, pnl: 100, r: 1 }),
    ]);
    expect(buildCumulativePnlSeries([complete, partial, invalid])).toEqual([
      expect.objectContaining({ id: "complete", cumulativePnl: 100, cumulativeR: 1 }),
    ]);
    expect(buildOutcomeBreakdown([complete, partial, invalid])).toEqual({
      winners: 1,
      losers: 0,
      breakeven: 0,
      total: 1,
    });

    const dashboard = buildStatisticsDashboard({
      closedTrades: [complete, partial, invalid],
      range: "all",
      now: new Date("2026-09-10T15:00:00.000Z"),
    });

    expect(dashboard.filteredTrades).toHaveLength(3);
    expect(dashboard.recentTrades.map((trade) => trade.id)).toEqual(["complete"]);
    expect(dashboard.periodRiskSummary).toMatchObject({
      trades_closed_today: 1,
      realized_pnl_today: 100,
      current_week_summary: { trades: 1, realized_pnl: 100 },
    });
  });
});
