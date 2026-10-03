import "server-only";

import {
  getDailyCandles,
  getDailyCandlesWithIdentity,
  MarketDataProviderResponseError,
  type DailyCandle,
} from "@/lib/market-data";
import { captureCompletedDailyContext, readCompletedDailyContext, type CompletedDailyContext } from "@/lib/scanner-completed-daily-context";
import { throwIfAborted } from "@/lib/operation-abort";

export const COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION =
  "completed_daily_market_regime_input_v1" as const;

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
  // Additive original input evidence, not a claim of a current benchmark quote.
  // Legacy classifications intentionally retain their original shape/semantics.
  input_evidence?: {
    policy_version: typeof COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION;
    role: "completed_historical_daily_only";
    evaluated_at: string;
    spy: CompletedDailyContext;
    qqq: CompletedDailyContext;
    reuse?: {
      policy_version: "completed_benchmark_reuse_allocation_v1" | "completed_benchmark_regular_session_reuse_v2";
      source_window?: "morning" | "midday" | "power_hour" | "outside_window";
      source_regular_session_verified?: true;
      source_scan_run_id: string;
      source_scan_run_fingerprint: string;
      source_decision_timestamp: string;
      original_classified_at: string;
      revalidated_at: string;
      benchmark_provider_calls: 0;
      scanner_provider_call_cap: 8;
      whole_scan_provider_call_cap: 8;
    };
  };
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

/** Keep original provenance in durable evidence, not model input/token spend.
 * Legacy payload shape/order is unchanged and no evidence-derived score is
 * added to the existing AI interface. */
export function marketRegimePromptInput(value: MarketRegime) {
  return { regime: value.regime, summary: value.summary, spy: value.spy, qqq: value.qqq };
}

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

/** Replay both exact original histories at the new as-of instant. A cached
 * summary, classification clock or derived MA alone never grants reuse. */
export async function readCompletedMarketRegime(value: unknown, now: Date): Promise<MarketRegime | null> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const input = raw.input_evidence as MarketRegime["input_evidence"] | undefined;
  if (!input || input.policy_version !== COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION ||
    input.role !== "completed_historical_daily_only" || typeof input.evaluated_at !== "string" ||
    !Number.isFinite(Date.parse(input.evaluated_at)) || Date.parse(input.evaluated_at) > now.getTime()) return null;
  const [spyContext, qqqContext] = await Promise.all([
    readCompletedDailyContext(input.spy, "SPY", now), readCompletedDailyContext(input.qqq, "QQQ", now),
  ]);
  if (!spyContext || !qqqContext ||
    [spyContext, qqqContext].some(context => Date.parse(context.captured_at) > Date.parse(input.evaluated_at))) return null;
  const spy = analyzeSymbol(spyContext.candles), qqq = analyzeSymbol(qqqContext.candles);
  const regime = classifyRegime(spy, qqq);
  const summary = `Completed daily history only; not a current benchmark quote. ${buildSummary(regime, spy, qqq)}`;
  if (raw.regime !== regime || raw.summary !== summary ||
    !["spy", "qqq"].every(symbol => {
      const retained = raw[symbol];
      const rebuilt = symbol === "spy" ? spy : qqq;
      return retained !== null && typeof retained === "object" && !Array.isArray(retained) &&
        Object.entries(rebuilt).every(([key, field]) => (retained as Record<string, unknown>)[key] === field);
    })) return null;
  // No recursive reuse history: preserve the original two capsules and clock,
  // while the caller adds only the direct source-run binding for this decision.
  return { regime, summary, spy, qqq, input_evidence: {
    policy_version: COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION,
    role: "completed_historical_daily_only", evaluated_at: input.evaluated_at,
    spy: spyContext, qqq: qqqContext,
  } };
}

export async function getMarketRegime(options: {
  signal?: AbortSignal;
  inputPolicyVersion?: typeof COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION;
} = {}): Promise<MarketRegime> {
  if (options.inputPolicyVersion !== undefined &&
    options.inputPolicyVersion !== COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION) {
    throw new Error("market_regime_input_policy_unavailable");
  }
  throwIfAborted(options.signal);
  const completedInputs = options.inputPolicyVersion === COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION;
  const requests = [
    completedInputs ? getDailyCandlesWithIdentity("SPY", 60, options) : getDailyCandles("SPY", 60, options),
    completedInputs ? getDailyCandlesWithIdentity("QQQ", 60, options) : getDailyCandles("QQQ", 60, options),
  ];
  // Abortable callers retain ownership until both reads settle. Calls without
  // an owned signal retain legacy early rejection, rather than introducing an
  // unbounded wait for a sibling transport that cannot be cancelled here.
  const [spyResult, qqqResult] = options.signal
    ? await Promise.allSettled(requests)
    : (await Promise.all(requests)).map(value => ({ status: "fulfilled" as const, value }));
  if (spyResult.status === "rejected") throw spyResult.reason;
  if (qqqResult.status === "rejected") throw qqqResult.reason;
  throwIfAborted(options.signal);
  let inputEvidence: MarketRegime["input_evidence"];
  let spyCandles: DailyCandle[], qqqCandles: DailyCandle[];
  if (completedInputs) {
    // Both original transport captures are checked against one as-of instant.
    // The validator requires the latest 50 consecutive verified closed sessions
    // and discards only a current unfinished bar. A new fetch clock alone cannot
    // turn an old/missing/misidentified daily series into an observed context.
    const evaluatedAt = new Date();
    const [spyContext, qqqContext] = await Promise.all([
      captureCompletedDailyContext(spyResult.value, "SPY", evaluatedAt),
      captureCompletedDailyContext(qqqResult.value, "QQQ", evaluatedAt),
    ]);
    throwIfAborted(options.signal);
    if (!spyContext || !qqqContext) {
      throw new MarketDataProviderResponseError("market_regime_completed_daily_input_unavailable", true);
    }
    spyCandles = spyContext.candles;
    qqqCandles = qqqContext.candles;
    inputEvidence = { policy_version: COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION,
      role: "completed_historical_daily_only", evaluated_at: evaluatedAt.toISOString(),
      spy: spyContext, qqq: qqqContext };
  } else {
    spyCandles = spyResult.value as DailyCandle[];
    qqqCandles = qqqResult.value as DailyCandle[];
  }

  const spy = analyzeSymbol(spyCandles);
  const qqq = analyzeSymbol(qqqCandles);
  const regime = classifyRegime(spy, qqq);

  return {
    regime,
    summary: `${inputEvidence ? "Completed daily history only; not a current benchmark quote. " : ""}${buildSummary(regime, spy, qqq)}`,
    spy,
    qqq,
    ...(inputEvidence ? { input_evidence: inputEvidence } : {}),
  };
}
