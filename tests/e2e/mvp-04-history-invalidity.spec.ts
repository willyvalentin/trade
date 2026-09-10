import { expect, test } from "@playwright/test";

import {
  buildHistoryDashboard,
  buildHistoryTradeSummary,
} from "@/lib/history-dashboard";

function tradeWithRemainingShares(remainingShares: number) {
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
      remaining_shares: remainingShares,
    },
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

  test("keeps an impossible remaining-share record in the invalid history filter", () => {
    const dashboard = buildHistoryDashboard({
      filters: {
        demo: "all",
        outcome: "all",
        partial: "invalid",
        sort: "newest",
      },
      trades: [tradeWithRemainingShares(-1), tradeWithRemainingShares(0)],
    });

    expect(dashboard.filteredTrades).toHaveLength(1);
    expect(dashboard.filteredTrades[0]?.id).toBe("history--1");
  });
});
