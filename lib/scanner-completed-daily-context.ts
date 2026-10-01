import type { DailyCandle, DailyCandleResponse } from "@/lib/market-data";
import {
  getUsEquityMarketSession,
  usEquityMarketCalendarDataset,
  validateUsEquityMarketCalendarDataset,
} from "@/lib/us-equity-market-calendar";
import {
  twelveDataResponseIdentityFromPayloadBytes,
  twelveDataResponseIdentityFromUnknown,
  type TwelveDataResponseIdentity,
} from "@/lib/twelve-data-response-identity";

export const COMPLETED_DAILY_CONTEXT_VERSION = "completed_daily_context_v1" as const;
export type CompletedDailyContext = {
  contract_version: typeof COMPLETED_DAILY_CONTEXT_VERSION;
  role: "completed_historical_daily";
  symbol: string;
  interval: "1day";
  exchange_timezone: "America/New_York";
  price_adjustment: "splits";
  captured_at: string;
  calendar_fingerprint: string;
  latest_completed_market_date: string;
  latest_completed_at: string;
  response_identity: TwelveDataResponseIdentity;
  candles: DailyCandle[];
  content_sha256: string;
};

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function priorDate(date: string) {
  const day = new Date(`${date}T00:00:00.000Z`);
  day.setUTCDate(day.getUTCDate() - 1);
  return day.toISOString().slice(0, 10);
}
function candleFromUnknown(value: unknown): DailyCandle | null {
  if (!record(value)) return null;
  const fields = ["timestamp", "open", "high", "low", "close", "volume"] as const;
  if (fields.some(key => typeof value[key] !== "number" || !Number.isFinite(value[key]))) return null;
  const candle = Object.fromEntries(fields.map(key => [key, value[key]])) as DailyCandle;
  // Daily timestamps encode an exchange DATE LABEL, not a current quote instant.
  if (!Number.isSafeInteger(candle.timestamp) || candle.timestamp <= 0 ||
    !Number.isFinite(new Date(candle.timestamp * 1000).getTime()) ||
    candle.timestamp % 86400 !== 0 || candle.volume < 0 ||
    Math.min(candle.open, candle.high, candle.low, candle.close) <= 0 ||
    candle.low > Math.min(candle.open, candle.close) ||
    candle.high < Math.max(candle.open, candle.close) || candle.low > candle.high) return null;
  return candle;
}

/**
 * Validates RAW, attributable daily history independently of the legacy 45min
 * derived-price cache. This grants only historical-context reuse, never price
 * freshness, publication permission or extra provider budget.
 */
export async function captureCompletedDailyContext(
  value: unknown,
  ticker: string,
  now: Date,
  calendar: unknown = usEquityMarketCalendarDataset,
): Promise<CompletedDailyContext | null> {
  if (!record(value) || !Number.isFinite(now.getTime()) || !ticker.trim()) return null;
  const validatedCalendar = validateUsEquityMarketCalendarDataset(calendar);
  const dataset = validatedCalendar.dataset;
  if (!dataset || !validatedCalendar.computed_fingerprint) return null;
  const today = getUsEquityMarketSession(now, dataset);
  const identity = twelveDataResponseIdentityFromUnknown(value.response_identity);
  const captured = typeof value.captured_at === "string" ? Date.parse(value.captured_at) : NaN;
  if (today.verification_status !== "verified" || today.freshness_status !== "current" || !today.market_date ||
    value.contract_version !== "daily_candle_response_v1" ||
    value.symbol !== ticker.trim().toUpperCase() || value.interval !== "1day" ||
    value.exchange_timezone !== "America/New_York" || value.price_adjustment !== "splits" ||
    !identity || identity.payload_byte_length === 0 || !Number.isFinite(captured) ||
    captured > now.getTime() || !Array.isArray(value.candles) ||
    value.candles.length < 50 || value.candles.length > 60) return null;

  const completed: DailyCandle[] = [];
  let previousTimestamp = 0;
  for (const raw of value.candles) {
    const candle = candleFromUnknown(raw);
    if (!candle || candle.timestamp <= previousTimestamp) return null;
    previousTimestamp = candle.timestamp;
    const marketDate = new Date(candle.timestamp * 1000).toISOString().slice(0, 10);
    const session = getUsEquityMarketSession(marketDate, dataset);
    if (session.verification_status !== "verified" || session.freshness_status !== "current" ||
      !session.session_close || marketDate > today.market_date) return null;
    if (Date.parse(session.session_close) > captured) {
      // Only a current, unfinished daily bar is allowed to be discarded. It is
      // never persisted, so a later restart cannot turn this partial bar final.
      if (marketDate !== getUsEquityMarketSession(new Date(captured), dataset).market_date) return null;
      continue;
    }
    completed.push(candle);
  }
  if (completed.length < 50) return null;

  // Require the latest 50 consecutive verified CLOSED trading sessions, not
  // merely fifty arbitrary dates. Holidays and early closes come from calendar.
  let marketDate = today.market_date;
  const expectedDates: string[] = [];
  for (let days = 0; days < 130 && expectedDates.length < 50; days++) {
    const session = getUsEquityMarketSession(marketDate, dataset);
    if (session.verification_status !== "verified" || session.freshness_status !== "current") return null;
    if (session.session_close && Date.parse(session.session_close) <= now.getTime()) expectedDates.unshift(marketDate);
    marketDate = priorDate(marketDate);
  }
  if (expectedDates.length !== 50 || completed.slice(-50).some((candle, index) =>
    new Date(candle.timestamp * 1000).toISOString().slice(0, 10) !== expectedDates[index])) return null;

  const latestDate = expectedDates.at(-1)!;
  const latestClose = getUsEquityMarketSession(latestDate, dataset).session_close!;
  if (captured < Date.parse(latestClose)) return null;
  const context = {
    contract_version: COMPLETED_DAILY_CONTEXT_VERSION,
    role: "completed_historical_daily" as const,
    symbol: ticker.trim().toUpperCase(), interval: "1day" as const,
    exchange_timezone: "America/New_York" as const, price_adjustment: "splits" as const,
    captured_at: new Date(captured).toISOString(),
    calendar_fingerprint: validatedCalendar.computed_fingerprint,
    latest_completed_market_date: latestDate, latest_completed_at: latestClose,
    response_identity: identity, candles: completed,
  };
  const digest = await twelveDataResponseIdentityFromPayloadBytes(new TextEncoder().encode(JSON.stringify(context)));
  return { ...context, content_sha256: digest.payload_sha256 };
}

/** Revalidate persisted raw data and its digest at decision time, after restart. */
export async function readCompletedDailyContext(
  value: unknown,
  ticker: string,
  now: Date,
  calendar: unknown = usEquityMarketCalendarDataset,
): Promise<CompletedDailyContext | null> {
  if (!record(value) || value.contract_version !== COMPLETED_DAILY_CONTEXT_VERSION ||
    value.role !== "completed_historical_daily") return null;
  // The provider applies split adjustments. Revalidate that basis once per NY
  // day instead of assuming a cached pre-action history matches tomorrow's price.
  const captured = typeof value.captured_at === "string" ? new Date(value.captured_at) : new Date(NaN);
  if (!Number.isFinite(captured.getTime()) ||
    getUsEquityMarketSession(captured).market_date !== getUsEquityMarketSession(now).market_date) return null;
  const context = await captureCompletedDailyContext({
    ...value, contract_version: "daily_candle_response_v1",
  } satisfies Partial<DailyCandleResponse>, ticker, now, calendar);
  return context && context.content_sha256 === value.content_sha256 &&
    context.calendar_fingerprint === value.calendar_fingerprint &&
    context.latest_completed_market_date === value.latest_completed_market_date &&
    context.latest_completed_at === value.latest_completed_at ? context : null;
}
