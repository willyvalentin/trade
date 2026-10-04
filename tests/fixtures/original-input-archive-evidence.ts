import { expect } from "@playwright/test";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { captureCompletedDailyContext } from "@/lib/scanner-completed-daily-context";
import { captureCurrentSessionContext } from "@/lib/scanner-current-session-context";
import { getUsEquityMarketSession } from "@/lib/us-equity-market-calendar";
import { relativePlanEvidence } from "./relative-plan-context-evidence";
import { calculateScannerValues, calculateCompletedCurrentInputFeatures } from "@/lib/scanner";
import { calculateIntradayIndicators, withAdmissibleRecentIntradayVolume, PROVIDER_CLOSED_BAR_PRICE_BASIS } from "@/lib/intraday-indicators";
import { buildScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";
import { buildCandidateDecisionCapture, buildCandidateDecisionRecord } from "@/lib/candidate-decision-record";
import { buildDecisionLineageReceipt } from "@/lib/decision-lineage-receipt";
import { buildScannerHistoricalInputArchive } from "@/lib/server/scanner-historical-input-archive";
import { buildScannerCurrentInputArchive } from "@/lib/server/scanner-current-input-archive";

/** Recover ONLY the exact synthetic bars from relativePlanEvidence. Its used
 * features are deliberately hand chosen; this exposes their contradiction,
 * never changes their immutable identities, plans, outcomes or old goldens. */
export async function appendSyntheticOriginalArchives(run: RecommendationScanRun) {
  const record = candidateDecisionRecordFromScanRun(run)!;
  const historical = [], current = [];
  for (const member of record.candidates) {
    const snapshot = member.data.input_snapshot!;
    const now = new Date(snapshot.captured_at), bars = [];
    const day = new Date(`${now.toISOString().slice(0, 10)}T00:00:00.000Z`);
    day.setUTCDate(day.getUTCDate() - 1);
    while (bars.length < 60) {
      if (getUsEquityMarketSession(day.toISOString().slice(0, 10)).session_close)
        bars.unshift({ timestamp: day.getTime() / 1000, open: 100, high: 103, low: 99, close: 100, volume: 1000 });
      day.setUTCDate(day.getUTCDate() - 1);
    }
    const daily = await captureCompletedDailyContext({ contract_version: "daily_candle_response_v1",
      symbol: member.ticker, interval: "1day", exchange_timezone: "America/New_York", price_adjustment: "splits",
      captured_at: now.toISOString(), response_identity: snapshot.historical_context!.response_identity,
      candles: bars }, member.ticker, now);
    const session = getUsEquityMarketSession(now), sessionBars = [], range = member.ticker === "AAA" ? 1 : 8;
    for (let timestamp = Date.parse(session.session_open!) / 1000; timestamp <= now.getTime() / 1000; timestamp += 300)
      sessionBars.push({ timestamp, open: 100, high: 100 + range / 2, low: 100 - range / 2, close: 100, volume: 1000 });
    const intraday = await captureCurrentSessionContext({ symbol: member.ticker, interval: "5min",
      exchange_timezone: "America/New_York", captured_at: now.toISOString(),
      response_identity: snapshot.current_session!.response_identity, candles: sessionBars }, member.ticker, now);
    expect(daily?.content_sha256).toBe(snapshot.historical_context!.content_sha256);
    expect(intraday?.content_sha256).toBe(snapshot.current_session!.content_sha256);
    historical.push({ candidate_id: member.candidate_id, ticker: member.ticker, historical_context: daily! });
    current.push({ candidate_id: member.candidate_id, ticker: member.ticker, current_context: intraday!,
      calculation_clock: { indicator_observed_at: now.toISOString(), volume_observed_at: now.toISOString() } });
  }
  const identity = { scan_run_id: record.scan_run_id, scan_run_fingerprint: record.scan_run_fingerprint,
    decision_timestamp: record.decision_timestamp };
  const dailyArchive = { ...identity, archive_version: "scanner_historical_input_archive_v1",
    calculator_version: "scanner_historical_feature_calculator_v1", entries: historical };
  const currentArchive = { ...identity, archive_version: "scanner_current_input_archive_v1",
    calculator_version: "scanner_current_input_calculator_v1", entries: current };
  Object.assign(run.payload_json, { scanner_historical_input_archive: dailyArchive, scanner_current_input_archive: currentArchive });
  return { dailyArchive, currentArchive };
}

/** Separate producer-arithmetic fixture, never substituting or rewriting the
 * manually chosen scores/plans in retained charter or model goldens. */
export async function reproducibleOriginalRun(fault?: "current_feature" | "indicator") {
  const evidence = await relativePlanEvidence({ rankedCount: 8, missing: false });
  const archives = await appendSyntheticOriginalArchives(evidence.run);
  const now = new Date(evidence.record.decision_timestamp);
  for (const candidate of evidence.observed) {
    const history = archives.dailyArchive.entries.find(row => row.ticker === candidate.ticker)!.historical_context;
    const current = archives.currentArchive.entries.find(row => row.ticker === candidate.ticker)!.current_context;
    const indicators = withAdmissibleRecentIntradayVolume(calculateIntradayIndicators(current.candles, {
      interval: current.interval, observedAtSeconds: now.getTime() / 1000, priceBasis: PROVIDER_CLOSED_BAR_PRICE_BASIS,
    }), false, now.getTime() / 1000);
    const historical = calculateScannerValues(history.candles);
    Object.assign(candidate, historical, calculateCompletedCurrentInputFeatures(historical, indicators,
      indicators.latestPrice ?? undefined, current, false), { previous_close: history.candles.at(-1)!.close,
      intraday_indicators: indicators, historical_input_context: history, current_input_context: current,
      reference_price_timestamp: current.latest_bar_started_at, reference_price_provider: "twelve_data",
      current_input_calculation_clock: { indicator_observed_at: now.toISOString(), volume_observed_at: now.toISOString() } });
    if (candidate.ticker === "GGG" && fault === "current_feature") candidate.session_high! += 1;
    if (candidate.ticker === "GGG" && fault === "indicator") candidate.intraday_indicators!.recentVolumeRatio! += 1;
  }
  const ranking = buildScannerCandidateRankingSummary({ candidates: evidence.observed, targetMin: 0, targetMax: 3, now });
  const capture = buildCandidateDecisionCapture({ captureTimestamp: now.toISOString(), decisionTimestamp: now.toISOString(),
    universe: evidence.observed, observedCandidates: evidence.observed, ranking, noPublishReason: "no_trade",
    eligibleCandidateTickers: evidence.observed.map(row => row.ticker) });
  const record = buildCandidateDecisionRecord({ scanRun: evidence.run, capture, scoringVersion: "synthetic_original_score",
    learningAttribution: evidence.record.learning_attribution,
    buildVersion: "synthetic_closed_shadow_test:synthetic_closed_shadow_test" })!;
  return { ...evidence.run, payload_json: { ...evidence.run.payload_json, candidate_decision_record: record,
    decision_lineage_receipt: buildDecisionLineageReceipt(record),
    scanner_historical_input_archive: buildScannerHistoricalInputArchive(capture, record),
    scanner_current_input_archive: buildScannerCurrentInputArchive(capture, record) } };
}
