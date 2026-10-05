import type { IntradayCandle } from "@/lib/market-data";
import { isFreshLiveReferenceMarketTime } from "@/lib/live-reference-freshness-policy";
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

export const CURRENT_SESSION_CONTEXT_VERSION = "current_session_intraday_v1" as const;
export type CurrentSessionContext = {
  contract_version: typeof CURRENT_SESSION_CONTEXT_VERSION;
  role: "current_regular_session_closed_bars";
  symbol: string;
  interval: "5min" | "15min";
  market_date: string;
  session_open_at: string;
  session_close_at: string;
  captured_at: string;
  calendar_fingerprint: string;
  latest_bar_started_at: string;
  latest_bar_closed_at: string;
  response_identity: TwelveDataResponseIdentity;
  candles: IntradayCandle[];
  content_sha256: string;
};

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Full-session, closed-bar evidence; partial bars never become final on restart. */
export async function captureCurrentSessionContext(
  value: unknown,
  ticker: string,
  now: Date,
  calendar: unknown = usEquityMarketCalendarDataset,
): Promise<CurrentSessionContext | null> {
  if (!record(value) || !ticker.trim() || !Number.isFinite(now.getTime())) return null;
  const validation = validateUsEquityMarketCalendarDataset(calendar);
  if (!validation.dataset || !validation.computed_fingerprint) return null;
  const session = getUsEquityMarketSession(now, validation.dataset);
  // The producer records Date.toISOString(), not an arbitrary parseable alias.
  // Validate the original encoding before parsing can round a future fraction
  // down to the decision clock or normalize a different retained source.
  const rawCaptured = value.captured_at;
  const captured = typeof rawCaptured === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(rawCaptured)
    ? Date.parse(rawCaptured) : NaN;
  const identity = twelveDataResponseIdentityFromUnknown(value.response_identity);
  if (session.verification_status !== "verified" || session.freshness_status !== "current" ||
    !session.session_open || !session.session_close || !session.market_date ||
    value.symbol !== ticker.trim().toUpperCase() ||
    (value.interval !== "5min" && value.interval !== "15min") ||
    value.exchange_timezone !== "America/New_York" || !identity || identity.payload_byte_length === 0 ||
    !Number.isFinite(captured) || new Date(captured).toISOString() !== rawCaptured || captured > now.getTime() ||
    captured < Date.parse(session.session_open) || now.getTime() >= Date.parse(session.session_close) ||
    !Array.isArray(value.candles) || value.candles.length === 0) return null;
  const step = value.interval === "5min" ? 300 : 900;
  const open = Date.parse(session.session_open) / 1000;
  const close = Date.parse(session.session_close) / 1000;
  if (value.candles.length > (close - open) / step) return null;
  const candles: IntradayCandle[] = [];
  for (const [index, raw] of value.candles.entries()) {
    if (!record(raw)) return null;
    const keys = ["timestamp", "open", "high", "low", "close", "volume"] as const;
    if (keys.some(key => typeof raw[key] !== "number" || !Number.isFinite(raw[key]))) return null;
    const bar = Object.fromEntries(keys.map(key => [key, raw[key]])) as IntradayCandle;
    if (bar.timestamp !== open + index * step || bar.timestamp * 1000 > captured ||
      Math.min(bar.open, bar.high, bar.low, bar.close) <= 0 || bar.volume < 0 ||
      bar.low > Math.min(bar.open, bar.close) || bar.high < Math.max(bar.open, bar.close) ||
      bar.high < bar.low) return null;
    if ((bar.timestamp + step) * 1000 <= captured) candles.push(bar);
  }
  const latest = candles.at(-1);
  if (!latest || now.getTime() - (latest.timestamp + step) * 1000 > step * 1000 ||
    !isFreshLiveReferenceMarketTime(new Date(latest.timestamp * 1000).toISOString(), now.getTime())) return null;
  const context: Omit<CurrentSessionContext, "content_sha256"> = {
    contract_version: CURRENT_SESSION_CONTEXT_VERSION,
    role: "current_regular_session_closed_bars" as const,
    symbol: ticker.trim().toUpperCase(), interval: value.interval,
    market_date: session.market_date, session_open_at: session.session_open,
    session_close_at: session.session_close, captured_at: new Date(captured).toISOString(),
    calendar_fingerprint: validation.computed_fingerprint,
    latest_bar_started_at: new Date(latest.timestamp * 1000).toISOString(),
    latest_bar_closed_at: new Date((latest.timestamp + step) * 1000).toISOString(),
    response_identity: identity, candles,
  };
  const digest = await twelveDataResponseIdentityFromPayloadBytes(new TextEncoder().encode(JSON.stringify(context)));
  return { ...context, content_sha256: digest.payload_sha256 };
}

export async function readCurrentSessionContext(
  value: unknown,
  ticker: string,
  now: Date,
): Promise<CurrentSessionContext | null> {
  if (!record(value) || value.contract_version !== CURRENT_SESSION_CONTEXT_VERSION ||
    value.role !== "current_regular_session_closed_bars") return null;
  const context = await captureCurrentSessionContext({ ...value,
    exchange_timezone: "America/New_York" }, ticker, now);
  return context && context.content_sha256 === value.content_sha256 &&
    context.calendar_fingerprint === value.calendar_fingerprint &&
    context.market_date === value.market_date && context.session_open_at === value.session_open_at &&
    context.session_close_at === value.session_close_at &&
    context.latest_bar_started_at === value.latest_bar_started_at &&
    context.latest_bar_closed_at === value.latest_bar_closed_at ? context : null;
}

/** Same-unit features from the last five closed intraday bars, never daily bars. */
export function currentSessionFeatures(context: CurrentSessionContext) {
  const bars = context.candles;
  const latest = bars.at(-1)!;
  const recent = bars.slice(-5);
  const high = Math.max(...recent.map(bar => bar.high));
  const low = Math.min(...recent.map(bar => bar.low));
  const round = (number: number) => Number(number.toFixed(2));
  const priorRanges = bars.slice(-21, -1).map(bar => (bar.high - bar.low) / bar.close * 100);
  const averageRange = priorRanges.length === 20
    ? priorRanges.reduce((total, range) => total + range, 0) / 20 : null;
  const latestRange = (latest.high - latest.low) / latest.close * 100;
  return {
    session_open: bars[0].open,
    session_high: Math.max(...bars.map(bar => bar.high)),
    session_low: Math.min(...bars.map(bar => bar.low)),
    recent_range_position: high > low ? Math.round((latest.close - low) / (high - low) * 100) : 50,
    recent_higher_highs_count: recent.length === 5
      ? recent.slice(1).filter((bar, index) => bar.high > recent[index].high).length : undefined,
    recent_higher_lows_count: recent.length === 5
      ? recent.slice(1).filter((bar, index) => bar.low > recent[index].low).length : undefined,
    recent_bullish_candles: recent.length === 5 ? recent.filter(bar => bar.close > bar.open).length : undefined,
    latest_range_percent: round(latestRange),
    range_expansion_ratio: averageRange !== null && averageRange > 0 ? round(latestRange / averageRange) : undefined,
  };
}
