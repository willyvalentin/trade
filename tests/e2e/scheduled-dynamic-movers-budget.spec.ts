import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";
import { build } from "esbuild";

import { buildDynamicMarketMoversSelection } from "@/lib/dynamic-market-movers";
import { scannerUniverseSelectionToBaseCandidates, selectScannerUniverse } from "@/lib/scanner-universe";

const rotationStart = new Date("2026-09-14T13:30:00.000Z");
const scheduledBudget = 10;

test.describe("dynamic discovery admission", () => {
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
      dynamic_mover_source_breakdown: { top_gainer: 1 },
      scan_budget: { effective_tickers: scheduledBudget, selected_tickers: 2 },
      risk_controls: { allowed_tickers_matched: 3, blocked_tickers_removed: 1 },
    });
    // The upstream receipt is retained, not rewritten to erase excluded inputs.
    expect(dynamicMovers).toEqual(originalSelection);
    expect(selection.coverage_summary.dynamic_movers?.selected_tickers)
      .toEqual(["DROP", "OUTSIDE", "NEWM"]);
    expect(Object.values(selection.coverage_summary.dynamic_mover_source_breakdown)
      .reduce((total, count) => total + count, 0)).toBe(1);

    for (const window of ["midday", "closed", "unknown"] as const) {
      const empty = selectScannerUniverse({
        scanWindow: window,
        requestedScanBudget: window === "midday" ? 0 : scheduledBudget,
        dynamicMovers,
        now: rotationStart,
      });
      expect(empty.selected_tickers).toEqual([]);
      expect(Object.values(empty.coverage_summary.dynamic_mover_source_breakdown)
        .reduce((total, count) => total + count, 0)).toBe(0);
      expect(empty.coverage_summary.dynamic_movers).toEqual(dynamicMovers.summary);
    }
  });
});

test("scheduled generation cannot spend unreserved dynamic-mover quote credits", async () => {
  const directory = mkdtempSync(resolve(tmpdir(), "ture-scheduled-movers-"));
  const output = resolve(directory, "dynamic-movers.cjs");
  const priorEnabled = process.env.TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED;
  const priorKey = process.env.TWELVE_DATA_API_KEY;
  const quoteCounter = globalThis as typeof globalThis & {
    __tureMoverQuoteCalls?: number;
  };

  try {
    await build({
      entryPoints: [resolve(process.cwd(), "lib/dynamic-movers-discovery.ts")],
      outfile: output,
      bundle: true,
      platform: "node",
      format: "cjs",
      conditions: ["react-server"],
      plugins: [
        {
          name: "no-provider-test-double",
          setup(builder) {
            builder.onResolve(
              { filter: /^@\/lib\/market-data$/ },
              () => ({ path: "market-data", namespace: "test-double" }),
            );
            builder.onLoad(
              { filter: /^market-data$/, namespace: "test-double" },
              () => ({
                contents: `export async function getQuote() {
                  globalThis.__tureMoverQuoteCalls += 1;
                  return {
                    current_price: 102, open: 100, previous_close: 99,
                    high: 103, low: 98, percent_change: 3, volume: 1000000
                  };
                }`,
                loader: "js",
              }),
            );
          },
        },
      ],
    });

    const runtime = (await import(pathToFileURL(output).href)) as {
      discoverDynamicMoversDiagnostics: (input: {
        source: "manual" | "scheduled";
        candidates: Array<{ ticker: string }>;
      }) => Promise<{
        discovery_enabled: boolean;
        provider_attempted: string | null;
        provider_error_type: string;
        returned_count: number;
      }>;
    };
    quoteCounter.__tureMoverQuoteCalls = 0;
    process.env.TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED = "true";
    process.env.TWELVE_DATA_API_KEY = "test-only-never-used";

    const scheduled = await runtime.discoverDynamicMoversDiagnostics({
      source: "scheduled",
      candidates: [{ ticker: "AAPL" }, { ticker: "MSFT" }],
    });
    expect(scheduled).toMatchObject({
      discovery_enabled: false,
      provider_attempted: null,
      provider_error_type: "disabled",
      returned_count: 0,
    });
    expect(quoteCounter.__tureMoverQuoteCalls).toBe(0);

    const manual = await runtime.discoverDynamicMoversDiagnostics({
      source: "manual",
      candidates: [{ ticker: "AAPL" }],
    });
    expect(manual).toMatchObject({
      discovery_enabled: true,
      provider_attempted: "twelve_data",
      returned_count: 1,
    });
    expect(quoteCounter.__tureMoverQuoteCalls).toBe(1);

    const generator = readFileSync(
      resolve(process.cwd(), "lib/recommendation-generator.ts"),
      "utf8",
    );
    expect(generator).toMatch(
      /discoverDynamicMoversDiagnostics\(\{\s*source,\s*candidates: scannerBaseCandidates/,
    );
  } finally {
    if (priorEnabled === undefined) {
      delete process.env.TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED;
    } else {
      process.env.TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED = priorEnabled;
    }
    if (priorKey === undefined) {
      delete process.env.TWELVE_DATA_API_KEY;
    } else {
      process.env.TWELVE_DATA_API_KEY = priorKey;
    }
    delete quoteCounter.__tureMoverQuoteCalls;
    rmSync(directory, { recursive: true, force: true });
  }
});
