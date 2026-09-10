import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { buildBrokerExecutionMetadata } from "@/lib/broker-execution-metadata";
import { buildPlanVsActualReview } from "@/lib/plan-vs-actual-review";
import { buildTradePlanningSnapshot } from "@/lib/trade-planning-snapshot";

const repositoryRoot = path.resolve(__dirname, "../..");

function planningSnapshot() {
  return buildTradePlanningSnapshot({
    actualEntryShares: 10,
    capturedAt: "2026-09-10T12:00:00.000Z",
    plannedQuantity: 10,
    ticker: "TURE",
  });
}

function reviewForRemainingShares(remainingShares: number) {
  const snapshot = planningSnapshot();
  const executionMetadata = buildBrokerExecutionMetadata({
    actualEntryShares: 10,
    actualFillPrice: 100,
    actualShares: 10,
    averageExitPrice: 110,
    brokerOrderStatus: "filled",
    partialPositionStatus: "fully_closed",
    plannedQuantity: 10,
    remainingShares,
    realizedPnlFromExits: 100,
    tradePlanningSnapshot: snapshot,
  });

  return buildPlanVsActualReview({
    executionMetadata,
    exitPrice: 110,
    realizedPnl: 100,
    shares: 10,
    snapshot,
    ticker: "TURE",
  });
}

test.describe("MVP-04 plan-vs-actual completeness", () => {
  test("requires review when metadata reports remaining shares despite a closed label", () => {
    const review = reviewForRemainingShares(1);

    expect(review.status).toBe("needs_review");
    expect(review.grade).toBe("C");
    expect(review.deviations).toContainEqual(
      expect.objectContaining({ deviation_id: "partial_close_needs_review" }),
    );
  });

  test("retains a followed-plan result when the closed metadata has no remaining shares", () => {
    const review = reviewForRemainingShares(0);

    expect(review.status).toBe("followed_plan");
    expect(review.grade).toBe("A");
  });

  test("retains the frozen plan prices for a later closed-trade review", () => {
    const snapshot = buildTradePlanningSnapshot({
      capturedAt: "2026-09-10T12:00:00.000Z",
      entryPrice: 100,
      stopPrice: 96,
      targetPrice: 108,
      ticker: "TURE",
    });

    expect(snapshot).toMatchObject({
      captured_at: "2026-09-10T12:00:00.000Z",
      entry_price: 100,
      stop_price: 96,
      target_price: 108,
    });
  });

  test("shows frozen plan prices and capture time beside a closed result", async () => {
    const tradeApp = await readFile(
      path.join(repositoryRoot, "app/trade-app.tsx"),
      "utf8",
    );

    expect(tradeApp).toContain('label="Plan Entry"');
    expect(tradeApp).toContain('label="Plan Stop"');
    expect(tradeApp).toContain('label="Plan Target"');
    expect(tradeApp).toContain('label="Plan Captured"');
    expect(tradeApp).toContain("snapshot.entry_price");
    expect(tradeApp).toContain("snapshot.stop_price");
    expect(tradeApp).toContain("snapshot.target_price");
    expect(tradeApp).toContain("snapshot.captured_at");
  });
});
