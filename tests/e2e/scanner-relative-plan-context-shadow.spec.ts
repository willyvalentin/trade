import { expect, test } from "@playwright/test";
import { buildCandidateDecisionCapture, buildCandidateDecisionRecord } from "@/lib/candidate-decision-record";
import { buildDecisionLineageReceipt } from "@/lib/decision-lineage-receipt";
import { buildRecommendationScanRun } from "@/lib/recommendation-scan-run";
import { buildRecommendationLearningBaselineReadiness } from "@/lib/recommendation-learning-baseline-readiness";
import { buildScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";
import { captureCompletedDailyContext } from "@/lib/scanner-completed-daily-context";
import { captureCurrentSessionContext, currentSessionFeatures } from "@/lib/scanner-current-session-context";
import { calculateIntradayIndicators } from "@/lib/intraday-indicators";
import { getUsEquityMarketSession } from "@/lib/us-equity-market-calendar";
import { buildRelativePlanContextShadow } from "@/lib/scanner-relative-plan-context-shadow";
import type { ScannerCandidate } from "@/lib/scanner";

// Synthetic CLOSED contexts pass the actual raw-context validators. No provider,
// mutable cache, future outcome, broker, or production write is used.
const NOW = new Date("2026-10-02T17:00:00.000Z");
const identity = { contract_version: "twelve_data_response_identity_v1", digest_algorithm: "sha256",
  payload_sha256: `sha256:${"a".repeat(64)}`, payload_byte_length: 12345 };

async function candidate(ticker: string, range = 1, now = NOW, interval: "5min" | "15min" = "5min") {
  const history = [];
  const day = new Date("2026-10-01T00:00:00.000Z");
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

async function evidence(options: { range?: number; now?: Date; interval?: "5min" | "15min"; missing?: boolean; rankedCount?: 4 } = {}) {
  const now = options.now ?? NOW;
  const observed = await Promise.all([candidate("AAA", options.range ?? 1, now, options.interval), candidate("ZZZ", 8, now, options.interval)]);
  if (options.rankedCount === 4) observed.push(...await Promise.all([candidate("BBB", 8, now), candidate("CCC", 8, now)]));
  const missing = Array.from({ length: options.missing === false ? 0 : 8 - observed.length }, (_, i) => ({ ...observed[0], ticker: `MISS${i}` }));
  const ranking = buildScannerCandidateRankingSummary({ candidates: observed, targetMin: 0, targetMax: 3, now });
  const run = buildRecommendationScanRun({ trading_date: "2026-10-02", observed_at: now.toISOString(),
    completed_at: new Date(now.getTime() + 100).toISOString(), window: "midday", source: "supabase",
    scanned_ticker_count: observed.length + missing.length, raw_candidate_count: observed.length });
  const capture = buildCandidateDecisionCapture({ captureTimestamp: now.toISOString(), decisionTimestamp: now.toISOString(),
    universe: [...observed, ...missing], observedCandidates: observed, ranking,
    noPublishReason: "no_trade", eligibleCandidateTickers: observed.map(c => c.ticker) });
  const record = buildCandidateDecisionRecord({ scanRun: run, capture, scoringVersion: "synthetic_original_score",
    buildVersion: "synthetic_closed_shadow_test" })!;
  expect(record).not.toBeNull();
  return { record, run: { ...run, payload_json: { ...run.payload_json,
    candidate_decision_record: record, decision_lineage_receipt: buildDecisionLineageReceipt(record) } } };
}

test("relative context changes only the retained plan component and keeps every original member", async () => {
  const { record } = await evidence();
  const original = JSON.stringify(record);
  const result = buildRelativePlanContextShadow(record);
  expect(result).toMatchObject({ status: "partial", original_population_count: 8, assessed_count: 2,
    unassessed_count: 6, live_ranking_effect: false, publication_effect: false, quality_improvement_claimed: false });
  expect(result.candidates).toHaveLength(8);
  const narrow = result.candidates.find(c => c.ticker === "AAA")!;
  const broad = result.candidates.find(c => c.ticker === "ZZZ")!;
  expect(narrow).toMatchObject({ context_status: "assessed", first_target_distance_percent: 8,
    observed_60m_range_percent: 1, relative_range_multiple: 8, component_penalty: 40 });
  expect(narrow.shadow_plan_score).toBe(narrow.baseline_plan_score! - 40);
  expect(broad.component_penalty).toBe(0);
  expect(result.baseline_top_k[0]).toBe(narrow.candidate_id);
  expect(result.shadow_top_k[0]).toBe(broad.candidate_id);
  expect(result.candidates.slice(2).every(c => c.reason === "original_candidate_unranked" && c.shadow_score === null)).toBe(true);
  expect(JSON.stringify(record)).toBe(original);
  expect(buildRelativePlanContextShadow(JSON.parse(original))).toEqual(result);
});

test("missing, zero, short and 15-minute windows remain unassessed rather than rescaled or dropped", async () => {
  for (const options of [{ range: 0 }, { now: new Date("2026-10-02T14:00:00.000Z") }, { interval: "15min" as const }]) {
    const { record } = await evidence(options);
    const result = buildRelativePlanContextShadow(record);
    const first = result.candidates[0];
    expect(first.context_status).toBe("unassessed");
    expect(first.shadow_score).toBe(first.baseline_score);
    expect(first.shadow_plan_score).toBe(first.baseline_plan_score);
    expect(result.original_population_count).toBe(8);
    expect(result.candidates).toHaveLength(8);
  }
});

test("baseline drift, inconsistent range and cross-bound or future input cannot produce an accepted comparison", async () => {
  const { record } = await evidence();
  for (const change of [
    (r: typeof record) => { r.candidates[0].ranking!.components[0].weight = 0.9; },
    (r: typeof record) => { r.candidates[0].ranking!.components[0].contribution = NaN; },
    (r: typeof record) => { (r.candidates[0].ranking as unknown as Record<string, unknown>).components = null; },
    (r: typeof record) => { (r.candidates[0].ranking as unknown as Record<string, unknown>).warnings = null; },
    (r: typeof record) => { r.candidates[0].candidate_id = r.candidates[1].candidate_id; },
    (r: typeof record) => { r.candidates[0].ranking!.rank = 9; },
    (r: typeof record) => { r.candidates[0].data.input_snapshot!.features.proposed_stop_loss = 999; },
    (r: typeof record) => { r.candidates[0].data.input_snapshot!.features.proposed_risk_reward = 99; },
    (r: typeof record) => {
      const f=r.candidates[0].data.input_snapshot!.features;
      f.proposed_entry_low=1e-300; f.proposed_entry_high=1e-300; f.proposed_stop_loss=0.5e-300;
      f.proposed_target_1=1; f.proposed_target_2=2; f.proposed_risk_reward=4e300;
    },
    (r: typeof record) => { r.candidates[0].data.input_snapshot!.intraday_indicators!.recentRangePercent = 99; },
    (r: typeof record) => { r.candidates[0].data.input_snapshot!.current_session!.symbol = "OTHER"; },
    (r: typeof record) => { r.candidates[0].data.input_snapshot!.captured_at = "2026-10-02T17:01:00.000Z"; },
  ]) {
    const changed = structuredClone(record);
    change(changed);
    expect(["conflicting", "unavailable"]).toContain(buildRelativePlanContextShadow(changed).status);
  }
});

test("the actual learning reader exposes shadow diagnostics without granting baseline readiness", async () => {
  const { record, run } = await evidence();
  const read = () => buildRecommendationLearningBaselineReadiness({ scanRuns: [run], snapshots: [], outcomes: [] });
  const result = read();
  expect(result.relative_plan_context_shadow).toEqual([buildRelativePlanContextShadow(record)]);
  expect(result.status).not.toBe("ready");
  expect(read()).toEqual(result);
  const missing = structuredClone(run);
  delete (missing.payload_json as Record<string, unknown>).decision_lineage_receipt;
  const rejected = buildRecommendationLearningBaselineReadiness({ scanRuns: [missing], snapshots: [], outcomes: [] });
  expect(rejected.relative_plan_context_shadow?.[0]).toMatchObject({ status: "conflicting",
    reason_codes: expect.arrayContaining(["original_decision_lineage_unavailable"]) });
  expect(rejected.status).not.toBe("ready");
});

test("older clocks retain their original population without acquiring shadow authority", async () => {
  const { record } = await evidence();
  const older = structuredClone(record);
  delete older.decision_clock;
  const result = buildRelativePlanContextShadow(older);
  expect(result.status).toBe("unavailable");
  expect(result.candidates).toHaveLength(8);
  expect(result.assessed_count).toBe(0);
});

test("the frozen curve has a neutral region and bounded penalty, never a target-attainment claim", async () => {
  for (const [range, penalty] of [[8, 0], [4, 0], [2, 20], [1, 40], [0.25, 60]]) {
    const { record } = await evidence({ range });
    const comparison = buildRelativePlanContextShadow(record);
    expect(comparison.candidates[0].component_penalty).toBe(penalty);
    expect(comparison.candidates[0].shadow_score).toBeLessThanOrEqual(comparison.candidates[0].baseline_score!);
    expect(comparison.quality_evidence_status).toBe("not_evaluated");
  }
});

test("the same-population challenger changes diagnostic K=3 membership when more than three are rankable", async () => {
  const { record } = await evidence({ rankedCount: 4 });
  const comparison = buildRelativePlanContextShadow(record);
  const id = (ticker: string) => comparison.candidates.find(c => c.ticker === ticker)!.candidate_id;
  expect(comparison.baseline_top_k).toEqual([id("AAA"), id("BBB"), id("CCC")]);
  expect(comparison.shadow_top_k).toEqual([id("BBB"), id("CCC"), id("ZZZ")]);
  expect(comparison).toMatchObject({ original_population_count: 8, assessed_count: 4, unassessed_count: 4,
    publication_effect: false, quality_improvement_claimed: false });
  expect(record.final_decision.disposition).toBe("no_trade");
});
