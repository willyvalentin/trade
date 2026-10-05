import { expect } from "@playwright/test";
import { buildCandidateDecisionCapture, buildCandidateDecisionRecord } from "@/lib/candidate-decision-record";
import { buildDecisionLineageReceipt } from "@/lib/decision-lineage-receipt";
import { buildRecommendationScanRun } from "@/lib/recommendation-scan-run";
import { buildScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";
import { captureCompletedDailyContext } from "@/lib/scanner-completed-daily-context";
import { captureCurrentSessionContext, currentSessionFeatures } from "@/lib/scanner-current-session-context";
import { calculateIntradayIndicators } from "@/lib/intraday-indicators";
import { getUsEquityMarketSession } from "@/lib/us-equity-market-calendar";
import { getNyMarketTime } from "@/lib/market-session";
import type { ScannerCandidate } from "@/lib/scanner";
import type { CandidateDecisionLearningAttribution } from "@/lib/candidate-decision-learning-attribution";

// Synthetic CLOSED contexts pass the actual raw-context validators. No provider,
// mutable cache, future outcome, broker, or production write is used.
const NOW = new Date("2026-10-02T17:00:00.000Z");
const identity = { contract_version: "twelve_data_response_identity_v1", digest_algorithm: "sha256",
  payload_sha256: `sha256:${"a".repeat(64)}`, payload_byte_length: 12345 };

async function candidate(ticker: string, range = 1, now = NOW, interval: "5min" | "15min" = "5min") {
  const history = [];
  const day = new Date(`${now.toISOString().slice(0, 10)}T00:00:00.000Z`);
  day.setUTCDate(day.getUTCDate() - 1);
  while (history.length < 60) {
    if (getUsEquityMarketSession(day.toISOString().slice(0, 10)).session_close) {
      history.unshift({ timestamp: day.getTime() / 1000, open: 100, high: 103, low: 99, close: 100, volume: 1000 });
    }
    day.setUTCDate(day.getUTCDate() - 1);
  }
  const daily = await captureCompletedDailyContext({ contract_version: "daily_candle_response_v1",
    symbol: ticker, interval: "1day", exchange_timezone: "America/New_York", price_adjustment: "splits",
    captured_at: now.toISOString(), response_identity: identity, candles: history }, ticker, now);
  expect(daily).not.toBeNull();
  const session = getUsEquityMarketSession(now);
  const step = interval === "5min" ? 300 : 900;
  const candles = [];
  for (let timestamp = Date.parse(session.session_open!) / 1000; timestamp <= now.getTime() / 1000; timestamp += step) {
    candles.push({ timestamp, open: 100, high: 100 + range / 2, low: 100 - range / 2, close: 100, volume: 1000 });
  }
  const current = await captureCurrentSessionContext({ symbol: ticker, interval, exchange_timezone: "America/New_York",
    captured_at: now.toISOString(), response_identity: identity, candles }, ticker, now);
  expect(current).not.toBeNull();
  const { candles: dailyBars, ...dailyEvidence } = daily!;
  const { candles: closedBars, ...currentEvidence } = current!;
  expect(dailyBars).toHaveLength(60);
  const indicators = calculateIntradayIndicators(closedBars, { interval, observedAtSeconds: now.getTime() / 1000 });
  const result: ScannerCandidate & { local_score: number } = {
    ticker, company_name: `${ticker} Synthetic`, sector: "Technology",
    mock_current_price: 100, mock_trend: "uptrend", mock_volume_context: "flat",
    mock_support: 97, mock_resistance: 110, mock_news_context: "none",
    ...currentSessionFeatures(current!), latest_close: 100, previous_close: 100,
    ma20: 99, ma50: 98, high_20d: 103, average_range_percent: 4, change_5d_percent: 1,
    proposed_entry_low: 99, proposed_entry_high: 100, proposed_stop_loss: 96,
    proposed_target_1: 108, proposed_target_2: 110, proposed_risk_reward: 2.5,
    intraday_indicators: indicators, intraday_indicator_stale: false,
    intraday_indicator_source: "fresh", intraday_indicator_cached_at: now.toISOString(),
    reference_price_timestamp: current!.latest_bar_started_at,
    reference_price_provider: "twelve_data", local_score: 90,
    daily_context_evidence: dailyEvidence, current_session_evidence: currentEvidence,
    scanner_input_policy_version: "completed_daily_intraday_input_v1",
  };
  return result;
}

export async function relativePlanEvidence(options: { range?: number; now?: Date; interval?: "5min" | "15min"; missing?: boolean; rankedCount?: 4 | 8; buildVersion?: string; learningAttribution?: CandidateDecisionLearningAttribution; publishedTickers?: string[] } = {}) {
  const now = options.now ?? NOW;
  const observed = await Promise.all([candidate("AAA", options.range ?? 1, now, options.interval), candidate("ZZZ", 8, now, options.interval)]);
  if (options.rankedCount === 4 || options.rankedCount === 8) observed.push(...await Promise.all([candidate("BBB", 8, now), candidate("CCC", 8, now)]));
  if (options.rankedCount === 8) observed.push(...await Promise.all(["DDD", "EEE", "FFF", "GGG"].map(ticker => candidate(ticker, 8, now))));
  const missing = Array.from({ length: options.missing === false ? 0 : 8 - observed.length }, (_, i) => ({ ...observed[0], ticker: `MISS${i}` }));
  const ranking = buildScannerCandidateRankingSummary({ candidates: observed, targetMin: 0, targetMax: 3, now });
  const run = buildRecommendationScanRun({ trading_date: getNyMarketTime(now.toISOString()).ny_date, observed_at: now.toISOString(),
    ...(options.buildVersion ? { scheduled_scan_run_id: `synthetic_prospective_${now.toISOString()}` } : {}),
    completed_at: new Date(now.getTime() + 100).toISOString(), window: "midday", source: "supabase",
    scanned_ticker_count: observed.length + missing.length, raw_candidate_count: observed.length });
  const capture = buildCandidateDecisionCapture({ captureTimestamp: now.toISOString(), decisionTimestamp: now.toISOString(),
    universe: [...observed, ...missing], observedCandidates: observed, ranking,
    noPublishReason: "no_trade", eligibleCandidateTickers: observed.map(c => c.ticker),
    publishedTickers: options.publishedTickers });
  const record = buildCandidateDecisionRecord({ scanRun: run, capture, scoringVersion: "synthetic_original_score",
    learningAttribution: options.learningAttribution,
    buildVersion: options.buildVersion ?? "synthetic_closed_shadow_test:synthetic_closed_shadow_test" })!;
  expect(record).not.toBeNull();
  return { record, observed, run: { ...run, payload_json: { ...run.payload_json,
    candidate_decision_record: record, decision_lineage_receipt: buildDecisionLineageReceipt(record) } } };
}
