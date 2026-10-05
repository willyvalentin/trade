import { expect, test } from "@playwright/test";
import { buildRecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { runRecommendationOutcomeEvaluation } from "@/lib/recommendation-outcome-evaluation-runner";
import { canonicalOutcomeProviderCoverageQuality } from "@/lib/recommendation-outcome-canonical-coverage";
import { hasIncompleteCanonicalOutcomeCoverage } from "@/lib/canonical-outcome-acquisition-readiness";
import { hasBetterOutcomeCoverage } from "@/lib/recommendation-outcome-coverage";
import { deferObservedCanonicalOutcomeWindow } from "@/lib/canonical-outcome-acquisition-readiness";
import { build } from "esbuild";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

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

async function loadOfficialSelector() {
  const path = resolve(process.cwd(), "app/api/recommendations/evaluate-outcomes/route.ts");
  // Expose the unchanged actual selector only in this in-memory test bundle.
  const bundle = await build({ stdin: { contents: readFileSync(path, "utf8") +
    "\nexport { filterOfficialSnapshotsNeedingOutcomeEvaluation as testSelector };", resolveDir: dirname(path), loader: "ts" },
    bundle: true, write: false, platform: "node", format: "cjs", conditions: ["react-server"], external: ["next", "next/*"] });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", bundle.outputFiles[0].text)(
    createRequire(resolve(process.cwd(), "package.json")), loaded, loaded.exports);
  return (loaded.exports as { testSelector: (input: {
    existingOutcomes: Awaited<ReturnType<typeof matureSource>>["outcome"][];
    horizons: ["60m"]; maxBatchesPerRun: number; now: Date;
    snapshots: Awaited<ReturnType<typeof matureSource>>["snapshot"][];
    snapshotBatchFingerprints: Record<string, string>;
  }) => Awaited<ReturnType<typeof matureSource>>["snapshot"][] }).testSelector;
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

test("an observed incomplete canonical window defers only within its valid retained bar clock", async () => {
  const { outcome } = await matureSource();
  const partial = { ...outcome, payload_json: { ...outcome.payload_json,
    canonical_provider_coverage: { ...(outcome.payload_json.canonical_provider_coverage as object), freshness: "unknown" } } };
  const original = JSON.stringify(partial);
  expect(deferObservedCanonicalOutcomeWindow(partial, new Date("2026-10-02T15:39:59.999Z"))).toBe(true);
  expect(deferObservedCanonicalOutcomeWindow(partial, new Date("2026-10-02T15:40:00.000Z"))).toBe(false);
  expect(deferObservedCanonicalOutcomeWindow(outcome, new Date("2026-10-02T15:35:00.000Z"))).toBe(false);
  for (const evaluated_at of [null, "bad", "2026-09-31T15:35:00.000Z", "2026-10-02T15:36:00.000Z"]) {
    expect(deferObservedCanonicalOutcomeWindow({ ...partial, evaluated_at } as unknown as typeof outcome,
      new Date("2026-10-02T15:35:00.000Z"))).toBe(false);
  }
  expect(deferObservedCanonicalOutcomeWindow(partial, new Date(NaN))).toBe(false);
  const legacy: typeof outcome = structuredClone(partial); delete legacy.payload_json.canonical_provider_coverage;
  expect(deferObservedCanonicalOutcomeWindow(legacy, new Date("2026-10-02T15:35:00.000Z"))).toBe(false);
  expect(JSON.stringify(partial)).toBe(original);
});

test("official opt-in retains pending canonical identity without requests or writes in its observed window", async () => {
  const { snapshot, outcome, fetchCandles } = await matureSource();
  const partial = { ...outcome, payload_json: { ...outcome.payload_json,
    canonical_provider_coverage: { ...(outcome.payload_json.canonical_provider_coverage as object), freshness: "unknown" } } };
  const before = JSON.stringify(partial);
  const deferred = await runRecommendationOutcomeEvaluation({ snapshots: [snapshot], existingOutcomes: [partial],
    horizons: ["60m"], now: "2026-10-02T15:35:00.000Z", deferObservedCanonicalWindow: true,
    fetchCandles: async () => { throw new Error("same_window_request_not_allowed"); },
    persistOutcome: async () => { throw new Error("same_window_write_not_allowed"); } });
  expect(deferred).toMatchObject({ status: "partial", eligible_snapshot_count: 1,
    candle_requests_executed: 0, persisted_outcome_count: 0, missing_candle_count: 1, outcomes: [] });
  expect(deferred.candidates[0]).toMatchObject({ status: "pending_candles", outcome_id: partial.id });
  expect(JSON.stringify(partial)).toBe(before);
  for (const options of [{}, { deferObservedCanonicalWindow: true, now: "2026-10-02T15:40:00.000Z" }]) {
    const resumed = await runRecommendationOutcomeEvaluation({ snapshots: [snapshot], existingOutcomes: [partial],
      horizons: ["60m"], now: "2026-10-02T15:35:00.000Z", maxCandleRequests: 1, fetchCandles, ...options });
    expect(resumed.candle_requests_executed).toBe(1);
    expect(resumed.outcomes[0].id).toBe(partial.id);
    expect(canonicalOutcomeProviderCoverageQuality(resumed.outcomes[0].payload_json.canonical_provider_coverage)).toBe(3);
  }
});

test("early incomplete original coverage waits only its current bar, not its future whole horizon", async () => {
  const { outcome } = await matureSource();
  const early = { ...outcome, payload_json: { ...outcome.payload_json,
    canonical_provider_coverage: { ...(outcome.payload_json.canonical_provider_coverage as object),
      freshness: "unknown", horizon_elapsed: false } } };
  expect(deferObservedCanonicalOutcomeWindow(early, new Date("2026-10-02T15:35:00.000Z"))).toBe(true);
  expect(deferObservedCanonicalOutcomeWindow(early, new Date("2026-10-02T15:40:00.000Z"))).toBe(false);
});

test("actual official selector reaches unobserved later batches before elapsed incomplete retries in a new bar window", async () => {
  const { snapshot, outcome } = await matureSource();
  const partial = { ...outcome, payload_json: { ...outcome.payload_json,
    canonical_provider_coverage: { ...(outcome.payload_json.canonical_provider_coverage as object), freshness: "unknown" } } };
  const later = buildRecommendationSnapshot({ recommendation_id: "synthetic_later", ticker: "AMD",
    recommended_at: "2026-10-02T15:00:00Z", side: "long", entry: 100, stop: 95, target: 110 });
  const testSelector = await loadOfficialSelector();
  const selected = testSelector({ snapshots: [snapshot, later], existingOutcomes: [partial], horizons: ["60m"],
    maxBatchesPerRun: 1, now: new Date("2026-10-02T15:40:00.000Z"),
    snapshotBatchFingerprints: { [snapshot.snapshot_fingerprint!]: "older", [later.snapshot_fingerprint!]: "later" } });
  expect(selected.map(row => row.snapshot_fingerprint)).toEqual([later.snapshot_fingerprint]);
  expect(hasIncompleteCanonicalOutcomeCoverage(partial)).toBe(true);
});

test("same-window deferred early members cannot occupy the snapshot cap ahead of an unobserved batch member", async () => {
  const { snapshot, outcome, fetchCandles } = await matureSource();
  const earlyPartial = { ...outcome, payload_json: { ...outcome.payload_json,
    canonical_provider_coverage: { ...(outcome.payload_json.canonical_provider_coverage as object),
      freshness: "unknown", horizon_elapsed: false } } };
  const original = JSON.stringify(earlyPartial);
  const unobserved = buildRecommendationSnapshot({ recommendation_id: "synthetic_unobserved_member", ticker: "AMD",
    recommended_at: snapshot.recommended_at, side: "long", entry: 100, stop: 95, target: 110 });
  const select = await loadOfficialSelector();
  const selected = select({ snapshots: [snapshot, unobserved], existingOutcomes: [earlyPartial], horizons: ["60m"],
    maxBatchesPerRun: 1, now: new Date("2026-10-02T15:35:00.000Z"),
    snapshotBatchFingerprints: { [snapshot.snapshot_fingerprint!]: "same", [unobserved.snapshot_fingerprint!]: "same" } });
  expect(new Set(selected.map(row => row.snapshot_fingerprint))).toEqual(
    new Set([snapshot.snapshot_fingerprint, unobserved.snapshot_fingerprint]));
  const run = await runRecommendationOutcomeEvaluation({ snapshots: selected, existingOutcomes: [earlyPartial],
    horizons: ["60m"], now: "2026-10-02T15:35:00.000Z", snapshotOrder: "input", maxSnapshots: 1,
    maxCandleRequests: 1, deferObservedCanonicalWindow: true, fetchCandles });
  expect(run.candle_requests_executed).toBe(1);
  expect(run.outcomes[0].snapshot_fingerprint).toBe(unobserved.snapshot_fingerprint);
  expect(JSON.stringify(earlyPartial)).toBe(original);
});
