import { expect, test } from "@playwright/test";

import { buildRealScannerBaseCandidateSelection } from "@/lib/real-scanner-candidate-generation";
import {
  getScheduledScannerUniverseRotationBatch,
  scannerUniverseSelectionToBaseCandidates,
  scannerUniverseTickers,
  selectScannerUniverse,
  scheduledScannerUniverseRotationCadenceMinutes,
} from "@/lib/scanner-universe";
import { buildDynamicMarketMoversSelection } from "@/lib/dynamic-market-movers";

const rotationStart = new Date("2026-09-14T13:30:00.000Z");
const scheduledBudget = 10;

function rotatedSelection(batchOffset: number) {
  const now = new Date(
    rotationStart.getTime() +
      batchOffset *
        scheduledScannerUniverseRotationCadenceMinutes *
        60 *
        1000,
  );

  return buildRealScannerBaseCandidateSelection({
    scanWindow: "midday",
    requestedScanBudget: scheduledBudget,
    selectionMode: "scheduled_rotating",
    now,
  });
}

test.describe("scheduled scanner universe rotation", () => {
  test("retains fetched movers but selects none when their allocated budget is zero", () => {
    for (const limits of [
      { selectedBudget: 0 },
      { selectedBudget: scheduledBudget, dynamicBudgetShare: 0 },
      { selectedBudget: scheduledBudget, maxDynamicTickers: 0 },
      { selectedBudget: scheduledBudget, maxDynamicTickers: -1 },
      { selectedBudget: scheduledBudget, maxDynamicTickers: 0.5 },
    ]) {
      const selection = buildDynamicMarketMoversSelection({
        scanWindow: "midday",
        ...limits,
        now: rotationStart,
        providerResult: {
          provider: "synthetic_closed_fixture",
          status: "available",
          fetched_at: rotationStart.toISOString(),
          movers: [{ ticker: "NEWM", source: "top_gainer", tradable: true }],
        },
      });

      expect(selection.fetched_movers.map((mover) => mover.ticker)).toEqual(["NEWM"]);
      expect(selection.selected_movers).toEqual([]);
      expect(selection.summary).toMatchObject({
        fetched_count: 1,
        selected_count: 0,
        selected_tickers: [],
        budget_limit: 0,
      });
    }
  });

  test("keeps malformed and fractional dynamic caps inside the allocated whole slots", () => {
    for (const [maxDynamicTickers, expectedCount] of [
      [1, 1], [2.9, 2], [100, 4], [Number.NaN, 4], [Number.POSITIVE_INFINITY, 4],
    ]) {
      const selection = buildDynamicMarketMoversSelection({
        scanWindow: "midday",
        selectedBudget: scheduledBudget,
        maxDynamicTickers,
        now: rotationStart,
        providerResult: {
          provider: "synthetic_closed_fixture",
          status: "available",
          fetched_at: rotationStart.toISOString(),
          movers: Array.from({ length: 25 }, (_, index) => ({
            ticker: `MOVER${index}`,
            source: "top_gainer" as const,
            source_rank: index + 1,
            tradable: true,
          })),
        },
      });
      expect(selection.fetched_movers).toHaveLength(25);
      expect(selection.selected_movers).toHaveLength(expectedCount);
      expect(selection.summary.budget_limit).toBe(expectedCount);
    }
  });

  test("applies the current allow/block lists to an already selected dynamic population", () => {
    const dynamicMovers = buildDynamicMarketMoversSelection({
      scanWindow: "midday",
      selectedBudget: scheduledBudget,
      now: rotationStart,
      providerResult: {
        provider: "synthetic_closed_fixture",
        status: "available",
        fetched_at: rotationStart.toISOString(),
        movers: ["DROP", "OUTSIDE", "NEWM"].map((ticker, index) => ({
          ticker,
          source: "top_gainer" as const,
          source_rank: index + 1,
          tradable: true,
        })),
      },
    });
    const originalSelection = structuredClone(dynamicMovers);
    const selection = selectScannerUniverse({
      scanWindow: "midday",
      requestedScanBudget: scheduledBudget,
      dynamicMovers,
      riskControlsSettings: {
        allowed_tickers: [" drop ", "newm", "aapl"],
        blocked_tickers: ["drop"],
      },
      now: rotationStart,
    });

    expect(scannerUniverseSelectionToBaseCandidates(selection).map((candidate) => candidate.ticker))
      .toEqual(["NEWM", "AAPL"]);
    expect(selection.coverage_summary).toMatchObject({
      selected_ticker_symbols: ["NEWM", "AAPL"],
      selected_tickers: 2,
      dynamic_mover_selected_count: 1,
      scan_budget: { effective_tickers: scheduledBudget, selected_tickers: 2 },
      risk_controls: { allowed_tickers_matched: 3, blocked_tickers_removed: 1 },
    });
    // The upstream receipt is retained, not rewritten to erase excluded inputs.
    expect(dynamicMovers).toEqual(originalSelection);
    expect(selection.coverage_summary.dynamic_movers?.selected_tickers)
      .toEqual(["DROP", "OUTSIDE", "NEWM"]);
  });

  test("moves each scheduled batch through the full tradable universe without raising the per-run budget", () => {
    const batches = Array.from({ length: 10 }, (_, index) =>
      rotatedSelection(index),
    );
    const selectedTickers = batches.flatMap((selection) =>
      selection.candidates.map((candidate) => candidate.ticker),
    );
    const tradableTickers = scannerUniverseTickers
      .filter((ticker) => ticker.enabled && ticker.tradable)
      .map((ticker) => ticker.ticker);

    expect(batches.every((selection) => selection.candidates.length === scheduledBudget)).toBe(
      true,
    );
    expect(
      batches.every(
        (selection) =>
          selection.coverage?.scan_budget.effective_tickers === scheduledBudget,
      ),
    ).toBe(true);
    expect(new Set(selectedTickers)).toEqual(new Set(tradableTickers));
    expect(new Set(batches[0].candidates.map((candidate) => candidate.ticker))).not.toEqual(
      new Set(batches[1].candidates.map((candidate) => candidate.ticker)),
    );
  });

  test("keeps manual selection stable and gives one rotation batch to a repeated scheduled slot", () => {
    const sameSlot = new Date(rotationStart);
    const nextSlot = new Date(
      rotationStart.getTime() +
        scheduledScannerUniverseRotationCadenceMinutes * 60 * 1000,
    );
    const manualAtStart = buildRealScannerBaseCandidateSelection({
      scanWindow: "midday",
      requestedScanBudget: scheduledBudget,
      now: sameSlot,
    });
    const manualAtNextSlot = buildRealScannerBaseCandidateSelection({
      scanWindow: "midday",
      requestedScanBudget: scheduledBudget,
      now: nextSlot,
    });
    const firstScheduled = rotatedSelection(0);
    const repeatedScheduled = buildRealScannerBaseCandidateSelection({
      scanWindow: "midday",
      requestedScanBudget: scheduledBudget,
      selectionMode: "scheduled_rotating",
      now: sameSlot,
    });

    expect(manualAtStart.candidates.map((candidate) => candidate.ticker)).toEqual(
      manualAtNextSlot.candidates.map((candidate) => candidate.ticker),
    );
    expect(repeatedScheduled.rotationBatch).toBe(firstScheduled.rotationBatch);
    expect(repeatedScheduled.candidates.map((candidate) => candidate.ticker)).toEqual(
      firstScheduled.candidates.map((candidate) => candidate.ticker),
    );
    expect(getScheduledScannerUniverseRotationBatch(nextSlot)).toBe(
      getScheduledScannerUniverseRotationBatch(sameSlot) + 1,
    );
  });

  test("admits a dynamic symbol beyond the static universe without increasing the scan budget", () => {
    const dynamicMovers = buildDynamicMarketMoversSelection({
      scanWindow: "midday",
      selectedBudget: scheduledBudget,
      providerResult: {
        provider: "twelve_data",
        status: "available",
        fetched_at: rotationStart.toISOString(),
        movers: [
          {
            ticker: "NEWM",
            company_name: "New Mover, Inc.",
            source: "top_gainer",
            source_rank: 1,
            percent_change: 12.4,
            volume: 1_200_000,
            price: 24.5,
            tradable: true,
          },
        ],
      },
      now: rotationStart,
    });
    const selection = buildRealScannerBaseCandidateSelection({
      scanWindow: "midday",
      requestedScanBudget: scheduledBudget,
      dynamicMovers,
      now: rotationStart,
    });

    expect(selection.candidates).toHaveLength(scheduledBudget);
    expect(selection.candidates.map((candidate) => candidate.ticker)).toContain(
      "NEWM",
    );
    expect(selection.coverage?.dynamic_mover_selected_count).toBe(1);
    expect(selection.coverage?.scan_budget.effective_tickers).toBe(scheduledBudget);
  });

  test("withholds stale and future mover receipts from the scan universe", () => {
    const selection = buildDynamicMarketMoversSelection({
      scanWindow: "midday",
      selectedBudget: scheduledBudget,
      now: rotationStart,
      providerResult: {
        provider: "twelve_data",
        status: "available",
        movers: [
          {
            ticker: "FRESH",
            source: "top_gainer",
            fetched_at: rotationStart.toISOString(),
          },
          {
            ticker: "FUTURE",
            source: "top_gainer",
            fetched_at: new Date(rotationStart.getTime() + 60_000).toISOString(),
          },
          {
            ticker: "STALE",
            source: "top_gainer",
            fetched_at: new Date(
              rotationStart.getTime() - 31 * 60_000,
            ).toISOString(),
          },
        ],
      },
    });

    expect(selection.summary).toMatchObject({
      status: "available",
      fetched_count: 3,
      selected_count: 1,
      stale_count: 2,
      selected_tickers: ["FRESH"],
      last_updated_at: rotationStart.toISOString(),
    });

    const futureOnly = buildDynamicMarketMoversSelection({
      scanWindow: "midday",
      selectedBudget: scheduledBudget,
      now: rotationStart,
      providerResult: {
        provider: "twelve_data",
        status: "available",
        movers: [
          {
            ticker: "FUTURE",
            source: "top_gainer",
            fetched_at: new Date(rotationStart.getTime() + 60_000).toISOString(),
          },
        ],
      },
    });

    expect(futureOnly.summary).toMatchObject({
      status: "stale",
      selected_count: 0,
      stale_count: 1,
      selected_tickers: [],
      last_updated_at: null,
    });

    const staleDuplicateBeforeFresh = buildDynamicMarketMoversSelection({
      scanWindow: "midday",
      selectedBudget: scheduledBudget,
      now: rotationStart,
      providerResult: {
        provider: "twelve_data",
        status: "available",
        movers: [
          {
            ticker: "RECOVER",
            source: "top_volume",
            fetched_at: new Date(
              rotationStart.getTime() - 31 * 60_000,
            ).toISOString(),
          },
          {
            ticker: "RECOVER",
            source: "top_gainer",
            fetched_at: rotationStart.toISOString(),
          },
        ],
      },
    });

    expect(staleDuplicateBeforeFresh.summary).toMatchObject({
      status: "available",
      selected_count: 1,
      stale_count: 1,
      selected_tickers: ["RECOVER"],
      last_updated_at: rotationStart.toISOString(),
    });
  });

  test("withholds an entire mover payload when its provider declares failure", () => {
    for (const status of ["error", "unavailable"] as const) {
      const selection = buildDynamicMarketMoversSelection({
        scanWindow: "midday",
        selectedBudget: scheduledBudget,
        now: rotationStart,
        providerResult: {
          provider: "twelve_data",
          status,
          fetched_at: rotationStart.toISOString(),
          movers: [
            {
              ticker: "UNTRUSTED",
              source: "top_gainer",
              fetched_at: rotationStart.toISOString(),
            },
          ],
        },
      });

      expect(selection.summary).toMatchObject({
        status: "provider_unavailable",
        fetched_count: 0,
        selected_count: 0,
        stale_count: 0,
        selected_tickers: [],
        last_updated_at: null,
      });
      expect(selection.fetched_movers).toEqual([]);
      expect(selection.selected_movers).toEqual([]);
      expect(selection.summary.warnings.map((warning) => warning.warning_id)).toContain(
        "provider_unavailable",
      );
    }
  });
});
