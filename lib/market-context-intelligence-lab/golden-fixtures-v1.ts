import {
  buildMarketContextIntelligenceV1,
  type MarketBreadthInput,
  type MarketContextBenchmarkInput,
  type MarketContextIntelligenceV1Input,
  type MarketContextIntelligenceV1Output,
  type MarketContextMetricPoint,
  type MarketContextProviderMetadata,
  type MarketContextRegimeClassification,
  type MarketSectorBenchmarkInput,
  type SectorStrengthClassification,
} from "./contract-v1";

export const MARKET_CONTEXT_GOLDEN_DECISION_TIMESTAMP =
  "2026-07-24T20:00:00.000Z";

const freshTimestamp = "2026-07-24T19:55:00.000Z";
const staleTimestamp = "2026-07-21T19:55:00.000Z";

function provider(
  overrides: Partial<MarketContextProviderMetadata> = {},
): MarketContextProviderMetadata {
  return {
    provider: "fixture_provider",
    source_timestamp: freshTimestamp,
    received_timestamp: "2026-07-24T19:56:00.000Z",
    expected_points: 60,
    observed_points: 60,
    missing_points: 0,
    coverage: 1,
    ...overrides,
  };
}

function point(
  overrides: Partial<MarketContextMetricPoint> = {},
): MarketContextMetricPoint {
  return {
    timestamp: freshTimestamp,
    close: 100,
    return_pct: 0,
    moving_average_short: 100,
    moving_average_long: 100,
    momentum_pct: 0,
    trend_slope_pct: 0,
    realized_volatility_pct: 1,
    range_pct: 1,
    ...overrides,
  };
}

function bullishPoint(
  close: number,
  overrides: Partial<MarketContextMetricPoint> = {},
) {
  return point({
    close,
    return_pct: 3,
    moving_average_short: close - 4,
    moving_average_long: close - 8,
    momentum_pct: 1.5,
    trend_slope_pct: 0.2,
    realized_volatility_pct: 1.1,
    range_pct: 1.4,
    ...overrides,
  });
}

function bearishPoint(
  close: number,
  overrides: Partial<MarketContextMetricPoint> = {},
) {
  return point({
    close,
    return_pct: -3,
    moving_average_short: close + 4,
    moving_average_long: close + 8,
    momentum_pct: -1.5,
    trend_slope_pct: -0.2,
    realized_volatility_pct: 1.2,
    range_pct: 1.5,
    ...overrides,
  });
}

function benchmark(
  symbol: "SPY" | "QQQ",
  multiDay: MarketContextMetricPoint,
  intraday: MarketContextMetricPoint = multiDay,
  providerOverrides: Partial<MarketContextProviderMetadata> = {},
): MarketContextBenchmarkInput {
  return {
    symbol,
    intraday: [intraday],
    multi_day: [multiDay],
    provider: provider(providerOverrides),
  };
}

function breadth(
  advancingFraction: number,
  aboveAverageFraction: number,
  overrides: Partial<MarketBreadthInput> = {},
): MarketBreadthInput {
  return {
    timestamp: freshTimestamp,
    advancing_fraction: advancingFraction,
    above_short_average_fraction: aboveAverageFraction,
    expected_constituents: 500,
    observed_constituents: 500,
    coverage: 1,
    provider: provider({
      expected_points: 500,
      observed_points: 500,
    }),
    ...overrides,
  };
}

function sector(
  sectorId: string,
  symbol: string,
  shortRelative: number,
  mediumRelative: number,
  overrides: Partial<MarketSectorBenchmarkInput> = {},
): MarketSectorBenchmarkInput {
  return {
    context_level: "sector",
    sector_id: sectorId,
    industry_id: null,
    benchmark_symbol: symbol,
    short_horizon: [
      {
        timestamp: freshTimestamp,
        return_pct: shortRelative + 0.5,
        spy_return_pct: 0.5,
        relative_return_vs_spy_pct: shortRelative,
        trend_slope_pct: shortRelative === 0 ? 0 : Math.sign(shortRelative) * 0.2,
        realized_volatility_pct: 1.2,
      },
    ],
    medium_horizon: [
      {
        timestamp: freshTimestamp,
        return_pct: mediumRelative + 1,
        spy_return_pct: 1,
        relative_return_vs_spy_pct: mediumRelative,
        trend_slope_pct:
          mediumRelative === 0 ? 0 : Math.sign(mediumRelative) * 0.15,
        realized_volatility_pct: 1.3,
      },
    ],
    provider: provider(),
    ...overrides,
  };
}

function riskOnInput(): MarketContextIntelligenceV1Input {
  return {
    decision_timestamp: MARKET_CONTEXT_GOLDEN_DECISION_TIMESTAMP,
    benchmarks: [
      benchmark("SPY", bullishPoint(110), bullishPoint(110, { return_pct: 1 })),
      benchmark("QQQ", bullishPoint(120), bullishPoint(120, { return_pct: 1.2 })),
    ],
    breadth: breadth(0.72, 0.7),
    sectors: [
      sector("financials", "XLF", -0.6, -1.7),
      sector("technology", "XLK", 1.1, 2.4),
    ],
    sector_universe: {
      expected_sector_ids: ["technology", "financials"],
    },
  };
}

function riskOffInput(): MarketContextIntelligenceV1Input {
  return {
    decision_timestamp: MARKET_CONTEXT_GOLDEN_DECISION_TIMESTAMP,
    benchmarks: [
      benchmark("SPY", bearishPoint(90), bearishPoint(90, { return_pct: -1 })),
      benchmark("QQQ", bearishPoint(85), bearishPoint(85, { return_pct: -1.2 })),
    ],
    breadth: breadth(0.28, 0.3),
    sectors: [],
    sector_universe: null,
  };
}

function fixture(
  id: string,
  input: MarketContextIntelligenceV1Input,
  expectedRegime: MarketContextRegimeClassification,
  expected?: {
    sector_id?: string;
    sector_classification?: SectorStrengthClassification;
    rank_status?: "ranked" | "not_rankable";
  },
) {
  return {
    id,
    input,
    expected: {
      regime_classification: expectedRegime,
      ...expected,
    },
  };
}

export const marketContextIntelligenceV1GoldenFixtures = [
  fixture("clear_risk_on_trend", riskOnInput(), "risk_on_trending"),
  fixture("clear_risk_off_trend", riskOffInput(), "risk_off_orderly"),
  fixture(
    "spy_qqq_disagreement",
    {
      ...riskOnInput(),
      benchmarks: [
        benchmark("SPY", bullishPoint(110)),
        benchmark("QQQ", bearishPoint(90)),
      ],
    },
    "conflicting_context",
  ),
  fixture(
    "choppy_high_volatility",
    {
      ...riskOnInput(),
      benchmarks: [
        benchmark(
          "SPY",
          point({ realized_volatility_pct: 3.2, range_pct: 3.8 }),
        ),
        benchmark(
          "QQQ",
          point({ realized_volatility_pct: 3.6, range_pct: 4.2 }),
        ),
      ],
      breadth: breadth(0.51, 0.49),
    },
    "choppy_high_volatility",
  ),
  fixture(
    "low_volatility_neutral_market",
    {
      ...riskOnInput(),
      benchmarks: [
        benchmark("SPY", point({ realized_volatility_pct: 0.5 })),
        benchmark("QQQ", point({ realized_volatility_pct: 0.6 })),
      ],
      breadth: breadth(0.52, 0.51),
    },
    "neutral_balanced",
  ),
  fixture(
    "stale_index_data",
    {
      ...riskOnInput(),
      benchmarks: riskOnInput().benchmarks.map((item) => ({
        ...item,
        provider: provider({ source_timestamp: staleTimestamp }),
      })),
    },
    "insufficient_data",
  ),
  fixture(
    "missing_candles",
    {
      ...riskOnInput(),
      benchmarks: riskOnInput().benchmarks.map((item) =>
        item.symbol === "QQQ"
          ? {
              ...item,
              multi_day: [],
              provider: provider({
                expected_points: 60,
                observed_points: 45,
                missing_points: 15,
                coverage: 0.75,
              }),
            }
          : item,
      ),
    },
    "insufficient_data",
  ),
  fixture(
    "insufficient_breadth",
    {
      ...riskOnInput(),
      breadth: breadth(0.7, 0.68, {
        expected_constituents: 500,
        observed_constituents: 250,
        coverage: 0.5,
        provider: provider({
          expected_points: 500,
          observed_points: 250,
          missing_points: 250,
          coverage: 0.5,
        }),
      }),
    },
    "risk_on_fragile",
  ),
  fixture(
    "strong_sector_relative_to_weak_market",
    {
      ...riskOffInput(),
      sectors: [sector("technology", "XLK", 1.2, 3)],
      sector_universe: { expected_sector_ids: ["technology"] },
    },
    "risk_off_orderly",
    {
      sector_id: "technology",
      sector_classification: "strong",
      rank_status: "ranked",
    },
  ),
  fixture(
    "weak_sector_in_strong_market",
    {
      ...riskOnInput(),
      sectors: [sector("energy", "XLE", -1.2, -3)],
      sector_universe: { expected_sector_ids: ["energy"] },
    },
    "risk_on_trending",
    {
      sector_id: "energy",
      sector_classification: "weak",
      rank_status: "ranked",
    },
  ),
  fixture(
    "incomplete_sector_universe",
    {
      ...riskOnInput(),
      sectors: [sector("technology", "XLK", 1.2, 2.5)],
      sector_universe: {
        expected_sector_ids: ["technology", "financials"],
      },
    },
    "risk_on_trending",
    {
      sector_id: "technology",
      sector_classification: "strong",
      rank_status: "not_rankable",
    },
  ),
  fixture(
    "input_order_determinism",
    {
      ...riskOnInput(),
      benchmarks: [...riskOnInput().benchmarks].reverse(),
      sectors: [...(riskOnInput().sectors ?? [])].reverse(),
      sector_universe: {
        expected_sector_ids: ["financials", "technology"],
      },
    },
    "risk_on_trending",
  ),
  fixture(
    "future_point_after_decision_timestamp",
    {
      ...riskOnInput(),
      benchmarks: riskOnInput().benchmarks.map((item) => ({
        ...item,
        multi_day: [
          bearishPoint(70, {
            timestamp: "2026-07-24T20:05:00.000Z",
            realized_volatility_pct: 4,
          }),
          ...item.multi_day,
        ],
      })),
    },
    "risk_on_trending",
  ),
  fixture(
    "provider_gap",
    {
      ...riskOnInput(),
      benchmarks: riskOnInput().benchmarks.map((item) =>
        item.symbol === "QQQ"
          ? {
              ...item,
              provider: provider({
                source_timestamp: null,
                expected_points: 60,
                observed_points: 0,
                missing_points: 60,
                coverage: 0,
              }),
            }
          : item,
      ),
    },
    "insufficient_data",
  ),
] as const;

export type MarketContextIntelligenceV1GoldenFixture =
  (typeof marketContextIntelligenceV1GoldenFixtures)[number];

export function evaluateMarketContextIntelligenceV1GoldenFixtures(): Array<{
  id: string;
  passed: boolean;
  output: MarketContextIntelligenceV1Output;
}> {
  return marketContextIntelligenceV1GoldenFixtures.map((goldenFixture) => {
    const output = buildMarketContextIntelligenceV1(goldenFixture.input);
    const sectorExpectation =
      "sector_id" in goldenFixture.expected
        ? output.sectors.find(
            (sectorOutput) =>
              sectorOutput.sector_id === goldenFixture.expected.sector_id,
          )
        : null;
    const sectorPassed =
      !("sector_id" in goldenFixture.expected) ||
      (sectorExpectation?.classification ===
        goldenFixture.expected.sector_classification &&
        sectorExpectation?.rank_status === goldenFixture.expected.rank_status);

    return {
      id: goldenFixture.id,
      passed:
        output.regime_classification ===
          goldenFixture.expected.regime_classification && sectorPassed,
      output,
    };
  });
}
