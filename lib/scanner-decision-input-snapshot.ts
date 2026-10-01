import type { ScannerCandidate } from "@/lib/scanner";
import type { CompletedDailyContext } from "@/lib/scanner-completed-daily-context";
import type { CurrentSessionContext } from "@/lib/scanner-current-session-context";
import type { IntradayIndicators } from "@/lib/intraday-indicators";
import { intradayIndicatorsFromUnknown } from "@/lib/intraday-indicators";
import { twelveDataResponseIdentityFromUnknown } from "@/lib/twelve-data-response-identity";
import { getUsEquityMarketSession, usEquityMarketCalendarDataset } from "@/lib/us-equity-market-calendar";
import { isFreshLiveReferenceMarketTime } from "@/lib/live-reference-freshness-policy";

// Shared with the browser reader without importing the server-only scanner.
export const COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION = "completed_daily_intraday_input_v1" as const;
export const COMPLETED_DAILY_DECISION_SCANNER_VERSION = "scanner_v3_completed_daily_intraday_inputs" as const;
export const SCANNER_DECISION_INPUT_SNAPSHOT_VERSION = "scanner_decision_input_snapshot_v1" as const;
const historicalFeatures = ["ma20", "ma50", "high_20d", "change_5d_percent", "average_range_percent", "previous_close"] as const;
const currentFeatures = ["latest_close", "distance_to_20d_high", "session_open", "session_high", "session_low",
  "recent_change_percent", "recent_range_position", "recent_higher_highs_count", "recent_higher_lows_count",
  "recent_bullish_candles", "recent_volume_ratio", "latest_range_percent", "range_expansion_ratio",
  "proposed_entry_low", "proposed_entry_high", "proposed_stop_loss", "proposed_target_1", "proposed_target_2",
  "proposed_risk_reward"] as const;
const featureKeys = [...historicalFeatures, ...currentFeatures] as const;
type FeatureKey = typeof featureKeys[number];
export type ScannerDecisionInputSnapshot = {
  snapshot_version: typeof SCANNER_DECISION_INPUT_SNAPSHOT_VERSION;
  input_policy_version: typeof COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION;
  captured_at: string;
  // These are identities of validated raw contexts, NOT claims that history is
  // a current quote. Exact used features are archived separately from mutable cache.
  historical_context: Omit<CompletedDailyContext, "candles">;
  current_session: Omit<CurrentSessionContext, "candles"> | null;
  features: Record<FeatureKey, number | null>;
  intraday_indicators: IntradayIndicators | null;
};

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
function instant(value: unknown): number {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) ? Date.parse(value) : NaN;
}
function validContextIdentity(context: Record<string, unknown>, ticker: string, captured: number) {
  const identity = twelveDataResponseIdentityFromUnknown(context.response_identity);
  return context.symbol === ticker && Number.isFinite(instant(context.captured_at)) &&
    instant(context.captured_at) <= captured && identity !== null && identity.payload_byte_length > 0 &&
    typeof context.calendar_fingerprint === "string" &&
    context.calendar_fingerprint === usEquityMarketCalendarDataset?.dataset_fingerprint &&
    typeof context.content_sha256 === "string" && /^sha256:[a-f0-9]{64}$/.test(context.content_sha256) &&
    !("candles" in context);
}

/** Structural and point-in-time readback of immutable used features, not raw-bar
 * revalidation or permission to refresh/publish. Source digests identify the raw
 * contexts already validated by the scanner; this reader never reads live cache. */
export function scannerDecisionInputSnapshotFromUnknown(value: unknown, ticker: string, decisionTimestamp: string) {
  const snapshot = object(value), historical = object(snapshot?.historical_context);
  const current = snapshot?.current_session === null ? null : object(snapshot?.current_session);
  const features = object(snapshot?.features);
  const captured = instant(snapshot?.captured_at), decision = instant(decisionTimestamp);
  if (!snapshot || !historical || !features || !Number.isFinite(captured) || !Number.isFinite(decision) || captured > decision ||
    snapshot.snapshot_version !== SCANNER_DECISION_INPUT_SNAPSHOT_VERSION ||
    snapshot.input_policy_version !== COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION ||
    (snapshot.current_session !== null && !current) ||
    Object.keys(features).length !== featureKeys.length || featureKeys.some(key =>
      !(key in features) || !(features[key] === null || typeof features[key] === "number" && Number.isFinite(features[key])))) return null;
  const session = getUsEquityMarketSession(new Date(captured));
  const historicalSession = getUsEquityMarketSession(String(historical.latest_completed_market_date ?? ""));
  const historyCapturedSession = getUsEquityMarketSession(new Date(instant(historical.captured_at)));
  if (session.verification_status !== "verified" || session.freshness_status !== "current" ||
    !session.session_open || !session.session_close || !session.market_date ||
    captured < Date.parse(session.session_open) || captured >= Date.parse(session.session_close) ||
    !validContextIdentity(historical, ticker, captured) || historical.contract_version !== "completed_daily_context_v1" ||
    historical.role !== "completed_historical_daily" || historical.interval !== "1day" ||
    historical.exchange_timezone !== "America/New_York" || historical.price_adjustment !== "splits" ||
    historyCapturedSession.market_date !== session.market_date || !historicalSession.session_close ||
    historical.latest_completed_at !== historicalSession.session_close ||
    instant(historical.latest_completed_at) >= Date.parse(session.session_open) ||
    instant(historical.latest_completed_at) > instant(historical.captured_at)) return null;
  // The latest completed session must be the immediate prior trading session,
  // including exchange holidays, not an arbitrary old but correctly dated bar.
  const day = new Date(`${session.market_date}T00:00:00.000Z`);
  let previousClose: string | null = null;
  for (let lookback = 0; lookback < 10 && !previousClose; lookback++) {
    day.setUTCDate(day.getUTCDate() - 1);
    previousClose = getUsEquityMarketSession(day.toISOString().slice(0, 10)).session_close;
  }
  if (historical.latest_completed_at !== previousClose) return null;
  if (current) {
    const step = current.interval === "5min" ? 300000 : current.interval === "15min" ? 900000 : NaN;
    if (!validContextIdentity(current, ticker, captured) || current.contract_version !== "current_session_intraday_v1" ||
      current.role !== "current_regular_session_closed_bars" || !Number.isFinite(step) ||
      current.market_date !== session.market_date || current.session_open_at !== session.session_open ||
      current.session_close_at !== session.session_close || current.calendar_fingerprint !== historical.calendar_fingerprint ||
      instant(current.latest_bar_started_at) < Date.parse(session.session_open) ||
      (instant(current.latest_bar_started_at) - Date.parse(session.session_open)) % step !== 0 ||
      instant(current.latest_bar_closed_at) !== instant(current.latest_bar_started_at) + step ||
      instant(current.latest_bar_closed_at) > instant(current.captured_at) ||
      captured - instant(current.latest_bar_closed_at) > step ||
      !isFreshLiveReferenceMarketTime(current.latest_bar_started_at as string, captured) ||
      features.latest_close === null || features.session_open === null || features.session_high === null || features.session_low === null ||
      Math.min(features.latest_close as number, features.session_open as number, features.session_low as number) <= 0 ||
      (features.session_low as number) > (features.session_open as number) ||
      (features.session_high as number) < (features.session_open as number) ||
      (features.session_low as number) > (features.latest_close as number) ||
      (features.session_high as number) < (features.latest_close as number)) return null;
    const indicators = intradayIndicatorsFromUnknown(snapshot.intraday_indicators);
    if (!indicators || indicators.latestCandleTimestamp !== current.latest_bar_started_at || indicators.latestPrice !== features.latest_close) return null;
  } else if (snapshot.intraday_indicators !== null || currentFeatures.some(key => features[key] !== null)) return null;
  return snapshot as unknown as ScannerDecisionInputSnapshot;
}

export function captureScannerDecisionInputSnapshot(candidate: ScannerCandidate, capturedAt: string): ScannerDecisionInputSnapshot {
  const hasCurrent = candidate.intraday_indicator_stale === false && candidate.current_session_evidence !== undefined;
  const features = Object.fromEntries(featureKeys.map(key => [key,
    !hasCurrent && (currentFeatures as readonly string[]).includes(key) ? null : candidate[key] ?? null])) as ScannerDecisionInputSnapshot["features"];
  if (Object.values(features).some(value => value !== null && !Number.isFinite(value))) {
    throw new Error("scanner_decision_input_feature_invalid");
  }
  const snapshot = JSON.parse(JSON.stringify({ snapshot_version: SCANNER_DECISION_INPUT_SNAPSHOT_VERSION,
    input_policy_version: COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION, captured_at: capturedAt,
    historical_context: candidate.daily_context_evidence,
    current_session: hasCurrent ? candidate.current_session_evidence : null,
    features, intraday_indicators: hasCurrent ? candidate.intraday_indicators : null }));
  const validated = scannerDecisionInputSnapshotFromUnknown(snapshot, candidate.ticker.trim().toUpperCase(), capturedAt);
  if (!validated) throw new Error("scanner_decision_input_snapshot_invalid");
  return validated;
}

/** A historical capture may remain readable after expiry, but may not publish.
 * No refresh, cache write-time fallback or new provider request is authorized. */
export function isScannerDecisionInputPublishable(snapshot: unknown, ticker: string, now: Date): boolean {
  const value = object(snapshot);
  const validated = scannerDecisionInputSnapshotFromUnknown(snapshot, ticker, String(value?.captured_at ?? ""));
  const current = validated?.current_session;
  const session = getUsEquityMarketSession(now);
  if (!validated || !current || !Number.isFinite(now.getTime()) ||
    instant(validated.captured_at) > now.getTime() || session.verification_status !== "verified" ||
    session.freshness_status !== "current" || !session.session_open || !session.session_close ||
    current.market_date !== session.market_date || now.getTime() < Date.parse(session.session_open) ||
    now.getTime() >= Date.parse(session.session_close)) return false;
  const step = current.interval === "5min" ? 300000 : 900000;
  return now.getTime() - instant(current.latest_bar_closed_at) <= step &&
    isFreshLiveReferenceMarketTime(current.latest_bar_started_at, now.getTime());
}
