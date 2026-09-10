import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  aggregateRealizedPnlExplanation,
  aggregateRealizedPnlLabel,
  determineAggregateRealizedPnlBasis,
} from "../../lib/aggregate-realized-pnl-basis";
import { buildBrokerExecutionMetadata } from "../../lib/broker-execution-metadata";
import { calculateStatisticsMetrics } from "../../lib/statistics-dashboard";

const repositoryRoot = path.resolve(__dirname, "../..");

function grossExecutionMetadata() {
  return buildBrokerExecutionMetadata({
    actualFillPrice: 100,
    actualShares: 10,
    brokerOrderStatus: "filled",
    entryFills: [{ price: 100, shares: 10 }],
    exitFills: [{ price: 110, shares: 10 }],
  });
}

test.describe("MVP-04 aggregate PnL fee-basis clarity", () => {
  test("labels an aggregate as gross only when every included result has the explicit gross basis", () => {
    expect(
      determineAggregateRealizedPnlBasis([
        {
          pnl: 100,
          realizedPnlBasis: "gross_price_difference_before_fees",
        },
        {
          pnl: -25,
          realizedPnlBasis: "gross_price_difference_before_fees",
        },
      ]),
    ).toBe("gross_price_difference_before_fees");

    expect(
      determineAggregateRealizedPnlBasis([
        {
          pnl: 100,
          realizedPnlBasis: "gross_price_difference_before_fees",
        },
        { pnl: -25, realizedPnlBasis: null },
      ]),
    ).toBe("fee_basis_needs_review");

    expect(determineAggregateRealizedPnlBasis([{ pnl: null }])).toBe(
      "not_available",
    );
  });

  test("keeps historic or undocumented PnL out of a gross claim in statistics", () => {
    const grossMetrics = calculateStatisticsMetrics([
      {
        id: "gross-result",
        ticker: "TURE",
        pnl: 100,
        rMultiple: 1,
        closedAt: "2026-09-10T14:00:00.000Z",
        realizedPnlFromExits: 100,
        executionMetadata: grossExecutionMetadata(),
      },
    ]);
    const undocumentedMetrics = calculateStatisticsMetrics([
      {
        id: "legacy-result",
        ticker: "TURE",
        pnl: 100,
        rMultiple: 1,
        closedAt: "2026-09-10T14:00:00.000Z",
      },
    ]);

    expect(grossMetrics.realizedPnlBasis).toBe(
      "gross_price_difference_before_fees",
    );
    expect(undocumentedMetrics.realizedPnlBasis).toBe("fee_basis_needs_review");
    expect(
      aggregateRealizedPnlLabel(grossMetrics.realizedPnlBasis),
    ).toBe("Gross Price PnL");
    expect(
      aggregateRealizedPnlExplanation(undocumentedMetrics.realizedPnlBasis),
    ).toContain("settlements");
  });

  test("keeps summary surfaces from calling modeled costs a net result", async () => {
    const tradeApp = await readFile(
      path.join(repositoryRoot, "app/trade-app.tsx"),
      "utf8",
    );

    expect(tradeApp).toContain("aggregateRealizedPnlLabel");
    expect(tradeApp).toContain("label={realizedPnlLabel}");
    expect(tradeApp).toContain("Est. PnL After Modeled Costs");
    expect(tradeApp).not.toContain('label="Est. Net PnL"');
  });
});
