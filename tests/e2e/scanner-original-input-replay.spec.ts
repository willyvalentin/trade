import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { calculateIntradayIndicators, withAdmissibleRecentIntradayVolume,
  PROVIDER_CLOSED_BAR_PRICE_BASIS } from "@/lib/intraday-indicators";
import { captureCurrentSessionContext } from "@/lib/scanner-current-session-context";
import { twelveDataResponseIdentityFromPayloadBytes } from "@/lib/twelve-data-response-identity";

test("the actual original-input audit reproduces current features as well as historical features", () => {
  test.setTimeout(90000);
  const proof = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold", "--original-feature-replay"],
    { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
  expect(proof.status, `${proof.stdout}\n${proof.stderr}`).toBe(0);
  const rows = proof.stdout.trim().split("\n").map(line => JSON.parse(line));
  const historical = rows.find(row => row.historical_feature_replay);
  expect(historical.current_session_features_checked).toBe(false);
  const original = rows.find(row => row.original_input_replay);
  expect(original).toMatchObject({ original_population_count: 8, matched: 3, missing: 5,
    features_per_matched_member: 25, current_feature_count: 19, current_session_features_checked: true,
    indicators_reproduced: true, reader_clock_independent: true, authenticated_http_readback: true,
    original_decision_unchanged: true, extra_requests: 0, actual_provider_requests: 0, production_actions: 0,
    input_fitness_proven: false, recommendation_quality_proven: false, original_provider_json_reproduced: false });
  expect(original.fail_closed_controls).toHaveLength(40);
  expect(rows.at(-1)).toMatchObject({ attempts: 1, claims: 1, scheduled_synthetic_requests: 8,
    decision_version: "candidate_decision_record_v4", fresh_inputs: 3, publications: 0,
    actual_provider_requests: 0, production_actions: 0, broker_actions: 0, cleanup: "inert" });
});

test("the actual shared producer preserves original missing windows and distinct volume-clock expiry", async () => {
  const bundle = await build({ entryPoints: [resolve(process.cwd(), "lib/scanner.ts")],
    bundle: true, write: false, platform: "node", format: "cjs", conditions: ["react-server"] });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", bundle.outputFiles[0].text)(
    createRequire(resolve(process.cwd(), "package.json")), loaded, loaded.exports);
  const { calculateCompletedCurrentInputFeatures } = loaded.exports as typeof import("@/lib/scanner");
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("Pure producer arithmetic must not call any transport"); };
  try {
    for (const count of [2, 23, 24]) {
      const bars = Array.from({ length: count }, (_, index) => ({
        timestamp: Date.UTC(2026, 9, 1, 13, 30) / 1000 + index * 300,
        open: 100.0041, high: 101, low: 99, close: 100.0041, volume: index < 12 ? 100 : 200,
      }));
      const closedAt = bars.at(-1)!.timestamp + 300;
      const observedAt = new Date(closedAt * 1000);
      const context = await captureCurrentSessionContext({ symbol: "SYNTH", interval: "5min",
        exchange_timezone: "America/New_York", captured_at: observedAt.toISOString(), candles: bars,
        response_identity: await twelveDataResponseIdentityFromPayloadBytes(new TextEncoder().encode(JSON.stringify(bars))),
      }, "SYNTH", observedAt);
      expect(context).not.toBeNull();
      const original = JSON.stringify(context);
      const indicators = calculateIntradayIndicators(bars, { interval: "5min", observedAtSeconds: closedAt,
        priceBasis: PROVIDER_CLOSED_BAR_PRICE_BASIS });
      const admitted = withAdmissibleRecentIntradayVolume(indicators, false, closedAt + 300);
      const expired = withAdmissibleRecentIntradayVolume(indicators, false, closedAt + 300.001);
      const used = calculateCompletedCurrentInputFeatures({ ma20: 100, high_20d: 103 }, admitted,
        indicators.latestPrice!, context, false);
      const later = calculateCompletedCurrentInputFeatures({ ma20: 100, high_20d: 103 }, expired,
        indicators.latestPrice!, context, false);
      expect(Object.keys(used)).toHaveLength(19);
      expect(used.latest_close).toBe(100.0041);
      expect(used.recent_volume_ratio ?? null).toBe(count === 24 ? 2 : null);
      expect(later.recent_volume_ratio ?? null).toBeNull();
      if (count === 2) {
        expect(used.recent_higher_highs_count ?? null).toBeNull();
        expect(used.range_expansion_ratio ?? null).toBeNull();
      }
      expect(JSON.stringify(context)).toBe(original);
    }
    const missing = calculateCompletedCurrentInputFeatures({}, null, undefined, null, true);
    expect(Object.values(missing).every(value => value === undefined)).toBe(true);
  } finally { globalThis.fetch = previousFetch; }
});
