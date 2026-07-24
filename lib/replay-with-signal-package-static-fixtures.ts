import type {
  ReplaySignalPackageInput,
  ReplaySimulationCandle,
  ReplaySimulationInput,
} from "@/lib/replay-with-signal-package-static-simulation";

export type ReplayStaticFixtureKind =
  | "no_entry"
  | "target_hit"
  | "stop_hit"
  | "open_at_window_end"
  | "ambiguous_same_candle";

export const selectedAaplReplaySignalPackageFixture: ReplaySignalPackageInput = {
  candidate_id: "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
  source_type: "recommendation_row",
  source_row_id: "7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
  ticker: "AAPL",
  interval: "5min",
  trading_day: "2026-07-08",
  analysis_cutoff: "2026-07-08T13:49:19.521608+00:00",
  direction: "long",
  planned_entry: 304.86,
  planned_stop: 295.62,
  planned_target: 334.12,
};

export const shortAaplReplaySignalPackageFixture: ReplaySignalPackageInput = {
  ...selectedAaplReplaySignalPackageFixture,
  direction: "short",
  planned_stop: 314.1,
  planned_target: 275.6,
};

const preCutoffExtremeCandle: ReplaySimulationCandle = {
  timestamp: "2026-07-08T13:45:00.000Z",
  open: 304,
  high: 400,
  low: 200,
  close: 310,
  volume: 1000,
};

export const longNoEntryCandlesFixture: ReplaySimulationCandle[] = [
  preCutoffExtremeCandle,
  {
    timestamp: "2026-07-08T13:50:00.000Z",
    open: 302.4,
    high: 304.2,
    low: 301.9,
    close: 303.1,
    volume: 1000,
  },
  {
    timestamp: "2026-07-08T13:55:00.000Z",
    open: 303.1,
    high: 304.5,
    low: 302.8,
    close: 303.6,
    volume: 1000,
  },
];

export const longTargetHitCandlesFixture: ReplaySimulationCandle[] = [
  preCutoffExtremeCandle,
  {
    timestamp: "2026-07-08T13:50:00.000Z",
    open: 303.8,
    high: 306,
    low: 303.2,
    close: 305.1,
    volume: 1000,
  },
  {
    timestamp: "2026-07-08T13:55:00.000Z",
    open: 305.1,
    high: 334.5,
    low: 304.9,
    close: 334.12,
    volume: 1000,
  },
];

export const longStopHitCandlesFixture: ReplaySimulationCandle[] = [
  preCutoffExtremeCandle,
  {
    timestamp: "2026-07-08T13:50:00.000Z",
    open: 303.8,
    high: 306,
    low: 303.2,
    close: 305,
    volume: 1000,
  },
  {
    timestamp: "2026-07-08T13:55:00.000Z",
    open: 305,
    high: 306,
    low: 295.5,
    close: 296,
    volume: 1000,
  },
];

export const longOpenAtWindowEndCandlesFixture: ReplaySimulationCandle[] = [
  preCutoffExtremeCandle,
  {
    timestamp: "2026-07-08T13:50:00.000Z",
    open: 303.8,
    high: 306,
    low: 303.2,
    close: 305,
    volume: 1000,
  },
  {
    timestamp: "2026-07-08T13:55:00.000Z",
    open: 305,
    high: 312,
    low: 304,
    close: 310.4,
    volume: 1000,
  },
];

export const longAmbiguousSameCandleCandlesFixture: ReplaySimulationCandle[] = [
  preCutoffExtremeCandle,
  {
    timestamp: "2026-07-08T13:50:00.000Z",
    open: 304,
    high: 334.5,
    low: 295.5,
    close: 304.5,
    volume: 1000,
  },
];

export const shortNoEntryCandlesFixture: ReplaySimulationCandle[] = [
  preCutoffExtremeCandle,
  {
    timestamp: "2026-07-08T13:50:00.000Z",
    open: 307,
    high: 309,
    low: 305.2,
    close: 306,
    volume: 1000,
  },
  {
    timestamp: "2026-07-08T13:55:00.000Z",
    open: 306,
    high: 307,
    low: 305,
    close: 306.5,
    volume: 1000,
  },
];

export const shortTargetHitCandlesFixture: ReplaySimulationCandle[] = [
  preCutoffExtremeCandle,
  {
    timestamp: "2026-07-08T13:50:00.000Z",
    open: 306,
    high: 307,
    low: 304,
    close: 304.4,
    volume: 1000,
  },
  {
    timestamp: "2026-07-08T13:55:00.000Z",
    open: 304.4,
    high: 305,
    low: 275,
    close: 275.6,
    volume: 1000,
  },
];

export const shortStopHitCandlesFixture: ReplaySimulationCandle[] = [
  preCutoffExtremeCandle,
  {
    timestamp: "2026-07-08T13:50:00.000Z",
    open: 306,
    high: 307,
    low: 304,
    close: 304.4,
    volume: 1000,
  },
  {
    timestamp: "2026-07-08T13:55:00.000Z",
    open: 304.4,
    high: 314.2,
    low: 304,
    close: 313,
    volume: 1000,
  },
];

export const shortOpenAtWindowEndCandlesFixture: ReplaySimulationCandle[] = [
  preCutoffExtremeCandle,
  {
    timestamp: "2026-07-08T13:50:00.000Z",
    open: 306,
    high: 307,
    low: 304,
    close: 304.4,
    volume: 1000,
  },
  {
    timestamp: "2026-07-08T13:55:00.000Z",
    open: 304.4,
    high: 305,
    low: 298,
    close: 300,
    volume: 1000,
  },
];

export const shortAmbiguousSameCandleCandlesFixture: ReplaySimulationCandle[] = [
  preCutoffExtremeCandle,
  {
    timestamp: "2026-07-08T13:50:00.000Z",
    open: 305,
    high: 314.2,
    low: 275,
    close: 304,
    volume: 1000,
  },
];

export const preCutoffIgnoredCandlesFixture: ReplaySimulationCandle[] = [
  preCutoffExtremeCandle,
  {
    timestamp: "2026-07-08T13:49:19.521608+00:00",
    open: 304,
    high: 400,
    low: 200,
    close: 310,
    volume: 1000,
  },
  {
    timestamp: "2026-07-08T13:50:00.000Z",
    open: 302,
    high: 304.2,
    low: 301.5,
    close: 303,
    volume: 1000,
  },
];

const longFixturesByKind: Record<
  ReplayStaticFixtureKind,
  ReplaySimulationCandle[]
> = {
  no_entry: longNoEntryCandlesFixture,
  target_hit: longTargetHitCandlesFixture,
  stop_hit: longStopHitCandlesFixture,
  open_at_window_end: longOpenAtWindowEndCandlesFixture,
  ambiguous_same_candle: longAmbiguousSameCandleCandlesFixture,
};

const shortFixturesByKind: Record<
  ReplayStaticFixtureKind,
  ReplaySimulationCandle[]
> = {
  no_entry: shortNoEntryCandlesFixture,
  target_hit: shortTargetHitCandlesFixture,
  stop_hit: shortStopHitCandlesFixture,
  open_at_window_end: shortOpenAtWindowEndCandlesFixture,
  ambiguous_same_candle: shortAmbiguousSameCandleCandlesFixture,
};

export function buildLongFixtureSimulationInput(
  kind: ReplayStaticFixtureKind,
): ReplaySimulationInput {
  const candles = longFixturesByKind[kind];

  return {
    source_verification: `static_fixture_pack_long_${kind}`,
    signal_package: selectedAaplReplaySignalPackageFixture,
    candles,
    expected_candle_rows: candles.length,
    conservative_same_candle_rule: true,
  };
}

export function buildShortFixtureSimulationInput(
  kind: ReplayStaticFixtureKind,
): ReplaySimulationInput {
  const candles = shortFixturesByKind[kind];

  return {
    source_verification: `static_fixture_pack_short_${kind}`,
    signal_package: shortAaplReplaySignalPackageFixture,
    candles,
    expected_candle_rows: candles.length,
    conservative_same_candle_rule: true,
  };
}
