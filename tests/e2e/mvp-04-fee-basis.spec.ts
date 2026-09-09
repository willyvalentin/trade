import { expect, test } from "@playwright/test";
import { buildBrokerExecutionMetadata } from "@/lib/broker-execution-metadata";
import { buildHistoryTradeSummary } from "@/lib/history-dashboard";
import {
  buildPartialPositionState,
  calculateRealizedPnlForExit,
  normalizeEntryFill,
  normalizeExitFill,
} from "@/lib/partial-position-accounting";

test.describe("MVP-04 gross price result and fee-basis safety", () => {
  test("never subtracts SEK fee inputs from a USD price result", () => {
    const entryFill = normalizeEntryFill({
      price: 100,
      shares: 10,
      commission: 25,
      fxFee: 5,
    });
    const exitFill = normalizeExitFill({
      price: 110,
      shares: 10,
      commission: 30,
      fxFee: 6,
    });

    expect(entryFill).not.toBeNull();
    expect(exitFill).not.toBeNull();

    expect(
      calculateRealizedPnlForExit({
        averageEntryPrice: 100,
        exitFill: exitFill!,
      }),
    ).toBe(100);

    const state = buildPartialPositionState({
      entryFills: [entryFill!],
      exitFills: [exitFill!],
    }).state;

    expect(state).toMatchObject({
      status: "fully_closed",
      realized_pnl_from_exits: 100,
      realized_pnl_basis: "gross_price_difference_before_fees",
    });
  });

  test("carries the explicit gross-fee basis into persisted execution metadata", () => {
    const metadata = buildBrokerExecutionMetadata({
      brokerOrderStatus: "filled",
      actualFillPrice: 100,
      actualShares: 10,
      entryFills: [
        {
          price: 100,
          shares: 10,
          commission: 25,
          fx_fee: 5,
        },
      ],
      exitFills: [
        {
          price: 110,
          shares: 10,
          commission: 30,
          fx_fee: 6,
        },
      ],
    });

    expect(metadata).toMatchObject({
      realized_pnl_from_exits: 100,
      realized_pnl_basis: "gross_price_difference_before_fees",
    });

    const history = buildHistoryTradeSummary({
      id: "fee-basis-history",
      ticker: "TURFEE",
      companyName: null,
      setupType: null,
      direction: "Long",
      entryPrice: 100,
      exitPrice: 110,
      shares: 10,
      pnl: 100,
      rMultiple: null,
      openedAt: "2026-09-10T13:00:00.000Z",
      closedAt: "2026-09-10T14:00:00.000Z",
      closeReason: null,
      isDemo: false,
      executionMetadata: metadata,
    });

    expect(history.partial.realized_pnl_basis).toBe(
      "gross_price_difference_before_fees",
    );
    expect(history.warnings).toContain(
      "Gross price result excludes broker fees; review the SEK settlement before treating it as net PnL.",
    );
  });
});
