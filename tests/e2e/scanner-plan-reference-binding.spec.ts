import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  bindScannerPlanReference,
  SCANNER_PLAN_REFERENCE_BINDING_VERSION,
} from "@/lib/scanner-plan-reference-binding";

const fallback = {
  reference_price_used_for_plan: 99,
  reference_price_source: "scanner_candidate_latest_close",
  reference_price_timestamp: "2026-09-29T00:00:00.000Z",
  reference_price_provider: "twelve_data",
  reference_price_read_path: "scanner_candidate.latest_close",
};

test.describe("scanner plan reference binding", () => {
  test("binds a fresh intraday price and its underlying market timestamp", () => {
    expect(SCANNER_PLAN_REFERENCE_BINDING_VERSION).toBe(
      "scanner_plan_reference_binding_v2",
    );
    expect(
      bindScannerPlanReference({
        fallback,
        intraday: {
          source: "fresh",
          stale: false,
          latest_price: 101.25,
          latest_candle_timestamp: "2026-09-29T14:35:00.000Z",
        },
      }),
    ).toEqual({
      reference_price_used_for_plan: 101.25,
      reference_price_source: "scanner_candidate_intraday_latest_price",
      reference_price_timestamp: "2026-09-29T14:35:00.000Z",
      reference_price_provider: "twelve_data",
      reference_price_read_path:
        "scanner_candidate.intraday_indicators.latestPrice",
    });
  });

  test("retains the daily fallback for stale, unavailable, invalid or missing intraday evidence", () => {
    const rejected = [
      {
        source: "cache" as const,
        stale: true,
        latest_price: 101.25,
        latest_candle_timestamp: "2026-09-29T14:35:00.000Z",
      },
      {
        source: "unavailable" as const,
        stale: false,
        latest_price: 101.25,
        latest_candle_timestamp: "2026-09-29T14:35:00.000Z",
      },
      {
        source: "fresh" as const,
        stale: false,
        latest_price: 0,
        latest_candle_timestamp: "2026-09-29T14:35:00.000Z",
      },
      {
        source: "fresh" as const,
        stale: false,
        latest_price: 101.25,
        latest_candle_timestamp: null,
      },
    ];

    for (const intraday of rejected) {
      expect(bindScannerPlanReference({ fallback, intraday })).toEqual(fallback);
    }
  });

  test("normalizes an offset timestamp before binding it", () => {
    expect(
      bindScannerPlanReference({
        fallback,
        intraday: {
          source: "cache",
          stale: false,
          latest_price: 101.25,
          latest_candle_timestamp: "2026-09-29T10:35:00-04:00",
        },
      }).reference_price_timestamp,
    ).toBe("2026-09-29T14:35:00.000Z");
  });

  test("scanner applies the binding after stale-safe intraday normalization", () => {
    const scanner = readFileSync(resolve(process.cwd(), "lib/scanner.ts"), "utf8");
    const normalization = scanner.indexOf(
      "const intradayIndicators = result.indicators",
    );
    const binding = scanner.indexOf("const planReference = bindScannerPlanReference");
    const spread = scanner.indexOf("...planReference", binding);

    expect(normalization).toBeGreaterThan(-1);
    expect(binding).toBeGreaterThan(normalization);
    expect(spread).toBeGreaterThan(binding);
    expect(scanner.slice(binding, spread)).toContain(
      "intradayIndicators?.latestCandleTimestamp",
    );
  });
});
