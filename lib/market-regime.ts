import "server-only";

import { getDailyCandles, type DailyCandle } from "@/lib/market-data";

export type MarketRegimeType = "risk_on" | "neutral" | "risk_off";

export type MarketRegimeSymbol = {
  close: number;
  ma20: number;
  ma50: number;
  change_5d_percent: number;
  above_ma20: boolean;
  above_ma50: boolean;
};

export type MarketRegime = {
  regime: MarketRegimeType;
  summary: string;
  spy: MarketRegimeSymbol;
  qqq: MarketRegimeSymbol;
};

const neutralSymbolFallback: MarketRegimeSymbol = {
  close: 0,
  ma20: 0,
  ma50: 0,
  change_5d_percent: 0,
  above_ma20: false,
  above_ma50: false,
};

export const neutralMarketRegimeFallback: MarketRegime = {
  regime: "neutral",
  summary: "Market regime unavailable, defaulting to neutral.",
  spy: neutralSymbolFallback,
  qqq: neutralSymbolFallback,
};

function round(value: number) {
  return Number(value.toFixed(2));
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function movingAverage(candles: DailyCandle[], length: number) {
  const closes = candles.slice(-length).map((candle) => candle.close);
  return round(average(closes));
}

function analyzeSymbol(candles: DailyCandle[]): MarketRegimeSymbol {
  if (candles.length < 50) {
    throw new Error("Market regime needs at least 50 daily candles.");
  }

  const latestCandle = candles[candles.length - 1];
  const fiveDaysAgoCandle = candles[candles.length - 6];

  if (!latestCandle || !fiveDaysAgoCandle || fiveDaysAgoCandle.close === 0) {
    throw new Error("Market regime received incomplete candle history.");
  }

  const close = round(latestCandle.close);
  const ma20 = movingAverage(candles, 20);
  const ma50 = movingAverage(candles, 50);
  const change5dPercent = round(
    ((latestCandle.close - fiveDaysAgoCandle.close) / fiveDaysAgoCandle.close) *
      100,
  );

  return {
    close,
    ma20,
    ma50,
    change_5d_percent: change5dPercent,
    above_ma20: close > ma20,
    above_ma50: close > ma50,
  };
}

function classifyRegime(spy: MarketRegimeSymbol, qqq: MarketRegimeSymbol) {
  const averageFiveDayChange = (spy.change_5d_percent + qqq.change_5d_percent) / 2;

  if (
    spy.above_ma20 &&
    spy.above_ma50 &&
    qqq.above_ma20 &&
    qqq.above_ma50 &&
    averageFiveDayChange >= 0
  ) {
    return "risk_on";
  }

  if (!spy.above_ma50 || !qqq.above_ma50 || averageFiveDayChange <= -2) {
    return "risk_off";
  }

  return "neutral";
}

function buildSummary(
  regime: MarketRegimeType,
  spy: MarketRegimeSymbol,
  qqq: MarketRegimeSymbol,
) {
  const averageFiveDayChange = round(
    (spy.change_5d_percent + qqq.change_5d_percent) / 2,
  );

  if (regime === "risk_on") {
    return `SPY and QQQ are above MA20 and MA50, with average 5-day change ${averageFiveDayChange}%.`;
  }

  if (regime === "risk_off") {
    return `Broad market risk is elevated: SPY/QQQ trend or 5-day momentum is weak. Average 5-day change ${averageFiveDayChange}%.`;
  }

  return `Broad market conditions are mixed. Average SPY/QQQ 5-day change is ${averageFiveDayChange}%.`;
}

export async function getMarketRegime(): Promise<MarketRegime> {
  const [spyCandles, qqqCandles] = await Promise.all([
    getDailyCandles("SPY", 60),
    getDailyCandles("QQQ", 60),
  ]);

  const spy = analyzeSymbol(spyCandles);
  const qqq = analyzeSymbol(qqqCandles);
  const regime = classifyRegime(spy, qqq);

  return {
    regime,
    summary: buildSummary(regime, spy, qqq),
    spy,
    qqq,
  };
}
