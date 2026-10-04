import { expect, test } from "@playwright/test";
import { buildRecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { runRecommendationOutcomeEvaluation } from "@/lib/recommendation-outcome-evaluation-runner";
import { canonicalOutcomeProviderCoverageQuality } from "@/lib/recommendation-outcome-canonical-coverage";
import { hasIncompleteCanonicalOutcomeCoverage } from "@/lib/canonical-outcome-acquisition-readiness";
import { hasBetterOutcomeCoverage } from "@/lib/recommendation-outcome-coverage";

async function matureSource() {
  const snapshot = buildRecommendationSnapshot({ recommendation_id: "synthetic_complete",
    ticker: "AAPL", recommended_at: "2026-10-02T14:30:00Z", side: "long", entry: 100, stop: 95, target: 110 });
  const candles = Array.from({ length: 12 }, (_, i) => ({
    timestamp: new Date(Date.parse(snapshot.recommended_at!) + i * 300000).toISOString(),
    open: 100, high: 102, low: 99, close: 101, volume: 1000,
  }));
  const fetchCandles = async (request: Parameters<NonNullable<Parameters<typeof runRecommendationOutcomeEvaluation>[0]["fetchCandles"]>>[0]) =>
    ({ request, status: "available" as const, provider: "twelve_data", candles, error: null, warnings: [] });
  const run = await runRecommendationOutcomeEvaluation({ snapshots: [snapshot], horizons: ["60m"],
    now: "2026-10-02T15:35:00Z", maxCandleRequests: 1, fetchCandles });
  return { snapshot, candles, fetchCandles, outcome: run.outcomes[0] };
}

test("zero acquisition budget preserves an incomplete canonical identity without requests or writes", async () => {
  const { snapshot, outcome } = await matureSource();
  const partial = { ...outcome, payload_json: { ...outcome.payload_json,
    canonical_provider_coverage: { ...(outcome.payload_json.canonical_provider_coverage as object), freshness: "unknown" } } };
  const before = JSON.stringify(partial);
  expect(hasIncompleteCanonicalOutcomeCoverage(partial)).toBe(true);
  const run = await runRecommendationOutcomeEvaluation({ snapshots: [snapshot], existingOutcomes: [partial],
    horizons: ["60m"], now: "2026-10-02T15:35:00Z", maxCandleRequests: 0,
    fetchCandles: async () => { throw new Error("budget_must_stop_acquisition"); },
    persistOutcome: async () => { throw new Error("budget_must_stop_writes"); } });
  expect(run.candle_requests_executed).toBe(0);
  expect(run.pending_provider_budget_count).toBe(1);
  expect(run.outcomes).toEqual([]);
  expect(JSON.stringify(partial)).toBe(before);
});

test("completed canonical and receipt-free legacy outcomes keep zero-request skip semantics", async () => {
  const { snapshot, outcome } = await matureSource();
  const legacy = structuredClone(outcome);
  delete legacy.payload_json.canonical_provider_coverage;
  for (const existing of [outcome, legacy]) {
    expect(hasIncompleteCanonicalOutcomeCoverage(existing)).toBe(false);
    const run = await runRecommendationOutcomeEvaluation({ snapshots: [snapshot], existingOutcomes: [existing],
      horizons: ["60m"], now: "2026-10-02T15:35:00Z", maxCandleRequests: 1,
      fetchCandles: async () => { throw new Error("completed_identity_must_not_be_bought_again"); } });
    expect(run.candle_requests_executed).toBe(0);
    expect(run.outcomes).toEqual([]);
  }
});

test("a completed valid horizon replaces a larger duplicate-bar response for the same original identity", async () => {
  const { snapshot, candles, outcome, fetchCandles } = await matureSource();
  const broken = await runRecommendationOutcomeEvaluation({ snapshots: [snapshot], horizons: ["60m"],
    now: "2026-10-02T15:35:00Z", maxCandleRequests: 1, fetchCandles: async request => ({ request,
      status: "available", provider: "twelve_data", candles: [...candles, candles[11]], error: null, warnings: [] }) });
  expect(hasIncompleteCanonicalOutcomeCoverage(broken.outcomes[0])).toBe(true);
  const second = await runRecommendationOutcomeEvaluation({ snapshots: [snapshot], existingOutcomes: broken.outcomes,
    horizons: ["60m"], now: "2026-10-02T15:40:00Z", maxCandleRequests: 1, fetchCandles });
  expect(second.candle_requests_executed).toBe(1);
  expect(second.outcomes[0].id).toBe(outcome.id);
  expect(canonicalOutcomeProviderCoverageQuality(second.outcomes[0].payload_json.canonical_provider_coverage)).toBe(3);
  expect(hasBetterOutcomeCoverage(second.outcomes[0], broken.outcomes[0])).toBe(true);
  expect(hasBetterOutcomeCoverage(broken.outcomes[0], second.outcomes[0])).toBe(false);
});

test("an early candle-backed neither outcome is resumed after its original horizon closes", async () => {
  const snapshot = buildRecommendationSnapshot({ recommendation_id: "synthetic_resumption",
    ticker: "AAPL", recommended_at: "2026-10-02T14:30:00Z", side: "long",
    entry: 100, stop: 95, target: 110 });
  const candles = Array.from({ length: 12 }, (_, i) => ({
    timestamp: new Date(Date.parse(snapshot.recommended_at!) + i * 300000).toISOString(),
    open: 100, high: 102, low: 99, close: i === 11 ? 101 : 100, volume: 1000,
  }));
  const first = await runRecommendationOutcomeEvaluation({ snapshots: [snapshot], horizons: ["60m"],
    now: "2026-10-02T14:45:00Z", maxCandleRequests: 1,
    fetchCandles: async request => ({ request, status: "available", provider: "twelve_data",
      candles: candles.slice(0, 3), error: null, warnings: [] }) });
  expect(first.outcomes[0].status).toBe("neither_hit");
  expect(canonicalOutcomeProviderCoverageQuality(first.outcomes[0].payload_json.canonical_provider_coverage)).toBeLessThan(3);
  expect(first.outcomes[0].current_r).toBeNull();
  const original = JSON.stringify(first.outcomes);
  let requests = 0;
  const second = await runRecommendationOutcomeEvaluation({ snapshots: [snapshot], horizons: ["60m"],
    existingOutcomes: JSON.parse(original), now: "2026-10-02T15:35:00Z", maxCandleRequests: 1,
    fetchCandles: async request => { requests++; return { request, status: "available", provider: "twelve_data",
      candles, error: null, warnings: [] }; } });
  expect(requests).toBe(1);
  expect(second.outcomes).toHaveLength(1);
  expect(second.outcomes[0].id).toBe(first.outcomes[0].id);
  expect(second.outcomes[0].snapshot_fingerprint).toBe(snapshot.snapshot_fingerprint);
  expect(canonicalOutcomeProviderCoverageQuality(second.outcomes[0].payload_json.canonical_provider_coverage)).toBe(3);
  expect(second.outcomes[0].current_r).toBeCloseTo(0.2);
  expect(JSON.stringify(first.outcomes)).toBe(original);
});
