import { expect, test } from "@playwright/test";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { createHmac, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { buildCandidateDecisionCapture, buildCandidateDecisionRecord } from "@/lib/candidate-decision-record";
import { candidateDecisionRecordFromUnknown, candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { buildDecisionLineageReceipt, decisionLineageReceiptFromScanRun } from "@/lib/decision-lineage-receipt";
import { buildRecommendationScanRun, recommendationScanRunFromPersistenceRow } from "@/lib/recommendation-scan-run";
import { isScannerDecisionInputPublishable } from "@/lib/scanner-decision-input-snapshot";
import { scheduledScannerInputPolicy } from "@/lib/scheduled-scanner-input-policy";
import { resolveScheduledScanProviderCreditBudget } from "@/lib/scheduled-scan-ticker-cap";
import type { ScheduledScanInvocationReceipt } from "@/lib/scheduled-scan-invocation-receipt";
import type { MarketRegime } from "@/lib/market-regime";
import {
  buildMarketRegimeDecisionContext,
  retainMarketRegimeDecisionContext,
} from "@/lib/market-regime-decision-context";
import {
  getUsEquityMarketSession,
  usEquityMarketCalendarDataset,
} from "@/lib/us-equity-market-calendar";

// Synthetic CLOSED fixtures. No market data, credentials or production writes.
const at = new Date("2026-10-01T15:50:00.000Z");
for (const staleCache of [false, true]) {
  test(`scheduled intraday quota rejection propagates with ${staleCache ? "stale" : "missing"} cache`, async () => {
    const bundle = await build({ entryPoints: [resolve(process.cwd(), "lib/intraday-indicator-cache.ts")],
      bundle: true, write: false, platform: "node", format: "cjs", conditions: ["react-server"] });
    const loaded = { exports: {} };
    new Function("require", "module", "exports", bundle.outputFiles[0].text)(
      createRequire(resolve(process.cwd(), "package.json")), loaded, loaded.exports);
    const { getOrRefreshIntradayIndicators } = loaded.exports as typeof import("@/lib/intraday-indicator-cache");
    const originalFetch = globalThis.fetch, originalKey = process.env.TWELVE_DATA_API_KEY;
    process.env.TWELVE_DATA_API_KEY = "synthetic-closed-quota-test";
    const calls: string[] = [];
    let message = "You have run out of API credits for the current minute.";
    let status = 429;
    globalThis.fetch = async input => {
      const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
      // Any DB, other provider or unexpected route fails the CLOSED test.
      expect(url.origin).toBe("https://api.twelvedata.com");
      expect(url.pathname).toBe("/time_series");
      calls.push(url.searchParams.get("symbol")!);
      return Response.json({ status: "error", code: status, message }, { status });
    };
    const preloadedScannerCacheRaw = staleCache ? { intraday_indicator_cache: {
      interval: "5min", cached_at: "2026-01-01T14:00:00.000Z",
      indicators: { latestPrice: 100, latestCandleTimestamp: "2026-01-01T13:55:00.000Z" },
    } } : null;
    try {
      const fresh = await getOrRefreshIntradayIndicators("SYNTH_FRESH", { source: "scheduled",
        preloadedScannerCacheRaw: { intraday_indicator_cache: { interval: "5min",
          cached_at: new Date().toISOString(), indicators: { latestPrice: 100,
            latestCandleTimestamp: new Date(Date.now() - 120000).toISOString() } } } });
      expect(fresh.source).toBe("cache"); expect(fresh.stale).toBe(false);
      expect(calls).toEqual([]);
      await expect(getOrRefreshIntradayIndicators("SYNTH", { source: "scheduled", preloadedScannerCacheRaw }))
        .rejects.toThrow(message);
      expect(calls).toEqual(["SYNTH"]);
      // Non-scheduled consumers retain their explicit stale/unavailable result.
      const manual = await getOrRefreshIntradayIndicators("SYNTH", { source: "manual", preloadedScannerCacheRaw });
      expect(manual.stale).toBe(true);
      expect(manual.source).toBe(staleCache ? "cache" : "unavailable");
      message = "Invalid candle payload.";
      status = 400;
      const ordinary = await getOrRefreshIntradayIndicators("SYNTH", { source: "scheduled", preloadedScannerCacheRaw });
      expect(ordinary.stale).toBe(true);
      expect(ordinary.warnings.at(-1)).toContain(message);
      const controller = new AbortController(); controller.abort();
      await expect(getOrRefreshIntradayIndicators("SYNTH", {
        source: "scheduled", signal: controller.signal, preloadedScannerCacheRaw,
      })).rejects.toThrow("time budget");
      expect(calls).toEqual(["SYNTH", "SYNTH", "SYNTH"]);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalKey === undefined) delete process.env.TWELVE_DATA_API_KEY;
      else process.env.TWELVE_DATA_API_KEY = originalKey;
    }
  });
}
test("packaged original scanner retains valid fractional provider prices without losing its input population", () => {
  test.setTimeout(90000);
  const proof = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold", "--fractional-price"],
    { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
  expect(proof.status, `${proof.stdout}\n${proof.stderr}`).toBe(0);
  const rows = proof.stdout.trim().split("\n").map(line => JSON.parse(line));
  expect(rows.find(row => row.fractional_price_fitness)).toMatchObject({ fractional_price_fitness: "passed",
    original_population_count: 8, fresh_inputs: 3, retained_latest_price: 100.0041, scheduled_synthetic_requests: 8,
    fresh_cache_and_restart_exact_price: true, cache_rows_unchanged: true, stale_reuse_blocked: true,
    actual_provider_requests: 0, production_actions: 0, quality_improvement_claimed: false });
  expect(rows.at(-1)).toMatchObject({ attempts: 1, claims: 1, decision_version: "candidate_decision_record_v4",
    fresh_inputs: 3, publications: 0, actual_provider_requests: 0, production_actions: 0, broker_actions: 0, cleanup: "inert" });
});
for (const strongInput of [false, true]) {
test(`closing regular-session analysis retains ${strongInput ? "directional" : "flat"} original decisions without late publication`, () => {
  test.setTimeout(90000);
  const proof=spawnSync(process.execPath,["scripts/completed-input-runtime-proof.mjs","--cold","--closing",...(strongInput ? ["--publication-clock"] : [])],
    {cwd:process.cwd(),encoding:"utf8",timeout:80000});
  expect(proof.status,`${proof.stdout}\n${proof.stderr}`).toBe(0);
  const evidence=JSON.parse(proof.stdout.trim().split("\n").at(-1)!);
  expect(evidence).toMatchObject({scenario:"closing_research_only",scheduled_synthetic_requests:8,
    attempts:1,claims:1,decision_version:"candidate_decision_record_v4",fresh_inputs:3,
    late_publication_withheld:true,original_research_sources:3,publications:0,
    actual_provider_requests:0,production_actions:0,broker_actions:0,cleanup:"inert"});
});
}
for (const [bounded, selected] of [[true,false],[true,true],[false,false]]) {
test(`market context ${bounded ? "drains owned transports" : "preserves unbounded legacy rejection"}${selected ? " with completed inputs" : ""} on benchmark failure`, async () => {
  const bundle = await build({ entryPoints: [resolve(process.cwd(), "lib/market-regime.ts")],
    bundle: true, write: false, platform: "node", format: "cjs", conditions: ["react-server"] });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", bundle.outputFiles[0].text)(
    createRequire(resolve(process.cwd(), "package.json")), loaded, loaded.exports);
  const { getMarketRegime, COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION } = loaded.exports as typeof import("@/lib/market-regime");
  const originalFetch = globalThis.fetch, originalKey = process.env.TWELVE_DATA_API_KEY;
  process.env.TWELVE_DATA_API_KEY = "synthetic-closed-boundary-only";
  let release!: () => void, settled = false;
  const pending = new Promise<void>(resolve => { release = resolve; });
  const symbols: string[] = [];
  globalThis.fetch = async (input) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
    expect(url.origin).toBe("https://api.twelvedata.com");
    const symbol = url.searchParams.get("symbol")!; symbols.push(symbol);
    if (symbol === "SPY") throw new Error("synthetic benchmark failure");
    await pending;
    return Response.json({ values: bars().map(bar => ({datetime:new Date(bar.timestamp*1000).toISOString().slice(0,10),
      open:"100",high:"103",low:"99",close:"101",volume:"1000"})) });
  };
  const running = getMarketRegime(bounded ? {signal:new AbortController().signal,
    ...(selected ? {inputPolicyVersion:COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION} : {})} : {})
    .then(() => { settled = true; return null; }, error => { settled = true; return error; });
  try {
    await new Promise(resolve => setImmediate(resolve));
    expect(symbols.sort()).toEqual(["QQQ","SPY"]);
    expect(settled).toBe(!bounded);
    release();
    expect(await running).toBeInstanceOf(Error);
  } finally {
    release(); await running;
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.TWELVE_DATA_API_KEY;
    else process.env.TWELVE_DATA_API_KEY = originalKey;
  }
});
}

test("normalized benchmark inputs reject stale or misidentified history without changing legacy evidence", async () => {
  const bundle = await build({ entryPoints: [resolve(process.cwd(), "lib/market-regime.ts")],
    bundle: true, write: false, platform: "node", format: "cjs", conditions: ["react-server"] });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", bundle.outputFiles[0].text)(
    createRequire(resolve(process.cwd(), "package.json")), loaded, loaded.exports);
  const { getMarketRegime, marketRegimePromptInput, COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION } = loaded.exports as typeof import("@/lib/market-regime");
  const OriginalDate = globalThis.Date, originalFetch = globalThis.fetch, originalKey = process.env.TWELVE_DATA_API_KEY;
  const clock = new OriginalDate("2026-10-01T17:30:00.000Z").getTime();
  globalThis.Date = class extends OriginalDate {
    constructor(...args: ConstructorParameters<typeof Date>) { super(...(args.length ? args : [clock]) as ConstructorParameters<typeof Date>); }
    static now() { return clock; }
  } as typeof Date;
  process.env.TWELVE_DATA_API_KEY = "synthetic-closed-boundary-only";
  let scenario = "stale", requests = 0;
  globalThis.fetch = async (input) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
    expect(url.origin).toBe("https://api.twelvedata.com"); expect(url.pathname).toBe("/time_series");
    expect(url.searchParams.get("outputsize")).toBe("60"); requests++;
    const values = bars(scenario === "stale" ? "2026-05-26" : "2026-09-30").map(bar => ({
      datetime:new OriginalDate(bar.timestamp*1000).toISOString().slice(0,10),
      open:"100",high:"103",low:"99",close:"101",volume:"1000" }));
    if (scenario === "partial") {
      values.shift(); values.push({datetime:"2026-10-01",open:"100",high:"1001",low:"99",close:"1000",volume:"1000"});
    }
    if (scenario === "missing_session") values.splice(58,1);
    if (scenario === "future") { values.shift(); values.push({...values.at(-1)!,datetime:"2026-10-02"}); }
    if (scenario === "duplicate") values[58] = {...values[57]};
    return Response.json({meta:{symbol:scenario === "wrong_symbol" ? "OTHER" : url.searchParams.get("symbol"),
      interval:"1day",exchange_timezone:scenario === "wrong_timezone" ? "UTC" : "America/New_York"},values});
  };
  try {
    const selected = () => getMarketRegime({signal:new AbortController().signal,
      inputPolicyVersion:COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION});
    const legacy = await getMarketRegime();
    expect(legacy.spy.close).toBe(101); expect(legacy.input_evidence).toBeUndefined();
    expect(JSON.stringify(marketRegimePromptInput(legacy))).toBe(JSON.stringify(legacy));
    await expect(selected()).rejects.toThrow("market_regime_completed_daily_input_unavailable");
    for (scenario of ["wrong_symbol","wrong_timezone","missing_session","future","duplicate"]) await expect(selected()).rejects.toThrow();
    scenario = "partial";
    const observed = await selected();
    expect(observed.regime).toBe("risk_off"); expect(observed.spy.close).toBe(101);
    expect(observed.input_evidence).toMatchObject({policy_version:COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION,
      role:"completed_historical_daily_only",evaluated_at:"2026-10-01T17:30:00.000Z",
      spy:{symbol:"SPY",latest_completed_market_date:"2026-09-30",latest_completed_at:"2026-09-30T20:00:00.000Z"},
      qqq:{symbol:"QQQ",latest_completed_market_date:"2026-09-30"}});
    expect(observed.input_evidence!.spy.candles).toHaveLength(59);
    expect(observed.input_evidence!.spy.response_identity.payload_byte_length).toBeGreaterThan(0);
    expect(observed.input_evidence!.spy.content_sha256).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(marketRegimePromptInput(observed)).toEqual({regime:observed.regime,summary:observed.summary,spy:observed.spy,qqq:observed.qqq});
    expect(JSON.stringify(marketRegimePromptInput(observed))).not.toContain("candles");
    expect(JSON.stringify(marketRegimePromptInput(observed))).not.toContain("response_identity");
    expect((await getMarketRegime()).spy.close).toBe(1000);
    expect(requests).toBe(18); // Exactly two original reads per call; no fallback/retry.
    await expect(getMarketRegime({inputPolicyVersion:"unknown" as never})).rejects.toThrow("market_regime_input_policy_unavailable");
    expect(requests).toBe(18);
  } finally {
    globalThis.Date = OriginalDate; globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.TWELVE_DATA_API_KEY; else process.env.TWELVE_DATA_API_KEY = originalKey;
  }
});

for (const scenario of ["stale", "partial"]) {
test(`packaged ${scenario} benchmark evidence reaches the actual data gate and retained source`, () => {
  test.setTimeout(90000);
  const proof = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold", `--benchmark-${scenario}`],
    {cwd:process.cwd(),encoding:"utf8",timeout:80000});
  expect(proof.status, `${proof.stdout}\n${proof.stderr}`).toBe(0);
  const evidence = JSON.parse(proof.stdout.trim().split("\n").at(-1)!);
  expect(evidence).toMatchObject({scheduled_synthetic_requests:8,attempts:1,claims:1,
    benchmark_input_fitness:scenario === "stale" ? "stale_rejected_not_no_trade" : "partial_current_bar_discarded",
    terminal_reservation_status:scenario === "stale" ? "failed" : "completed",
    decision_count:scenario === "stale" ? 0 : 1,
    retained_market_regime_input_policy:scenario === "stale" ? null : "completed_daily_market_regime_input_v1",
    actual_provider_requests:0,production_actions:0,publications:0,broker_actions:0,cleanup:"inert"});
});
}

test("packaged bounded input pipeline overlaps independent context without changing its budget or clocks", () => {
  test.setTimeout(90000);
  const proof=spawnSync(process.execPath,["scripts/completed-input-runtime-proof.mjs","--cold","--publication-clock","--context-latency"],
    {cwd:process.cwd(),encoding:"utf8",timeout:80000});
  expect(proof.status,`${proof.stdout}\n${proof.stderr}`).toBe(0);
  const evidence=proof.stdout.trim().split("\n").map(line=>JSON.parse(line)).at(-1);
  expect(evidence).toMatchObject({context_latency_proof:"completed",scheduled_synthetic_requests:8,
    route_budget_ms:23000,cleanup_reserve_ms:3000,fresh_inputs:3,actual_provider_requests:0,production_actions:0,cleanup:"inert"});
  expect(evidence.bounded_duration_ms).toBeLessThan(19000);
  expect(evidence.publications).toBeGreaterThan(0);
});

for (const scenario of ["published", "no_trade", "closing_research"] as const) {
test(`packaged ${scenario} retains original pre-decision context in its run and any actual snapshots`, () => {
  test.setTimeout(90000);
  const proof = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold",
    "--point-in-time-context", ...(scenario !== "no_trade" ? ["--publication-clock", "--context-latency"] : []),
    ...(scenario === "closing_research" ? ["--closing"] : [])],
    { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
  expect(proof.status, `${proof.stdout}\n${proof.stderr}`).toBe(0);
  const rows = proof.stdout.trim().split("\n").map(line => JSON.parse(line));
  const original = rows.find(row => row.point_in_time_market_context_proof === "passed");
  expect(original).toMatchObject({ actual_provider_requests: 0, production_actions: 0 });
  expect(Date.parse(original.context_captured_at)).toBeLessThanOrEqual(Date.parse(original.original_decision_at));
  if (scenario === "no_trade") expect(original.snapshot_count).toBe(0);
  else expect(original.snapshot_count).toBeGreaterThan(0);
  expect(original.final_disposition).toBe(scenario === "published" ? "recommendations_published" : "no_trade");
  expect(rows.at(-1)).toMatchObject({ scheduled_synthetic_requests: 8, fresh_inputs: 3, cleanup: "inert" });
  if (scenario !== "no_trade") expect(rows.at(-1)).toMatchObject({ route_budget_ms: 23000, cleanup_reserve_ms: 3000 });
});
}

test("context transport retains its original instant but cannot invent observed evidence", () => {
  const symbol = { close: 101, ma20: 100, ma50: 99, change_5d_percent: 1,
    above_ma20: true, above_ma50: true };
  const marketRegime: MarketRegime = { regime: "risk_on", summary: "Synthetic CLOSED context",
    spy: symbol, qqq: symbol };
  const context = buildMarketRegimeDecisionContext({ marketRegime, capturedAt: at });
  expect(retainMarketRegimeDecisionContext({ marketRegime, capturedContext: context })).toEqual(context);
  for (const capturedContext of [null, undefined, {}, { ...context, regime: "risk_off" },
    { ...context, captured_at: "not a date" }, { ...context, classifier_version: "unknown" }]) {
    expect(retainMarketRegimeDecisionContext({ marketRegime, capturedContext })).toBeNull();
  }
  expect(retainMarketRegimeDecisionContext({ marketRegime: null, capturedContext: context })).toBeNull();
  expect(retainMarketRegimeDecisionContext({ marketRegime: { ...marketRegime, spy: { ...symbol, close: 0 } },
    capturedContext: context })).toBeNull();
  expect(retainMarketRegimeDecisionContext({ marketRegime: { ...marketRegime, qqq: { ...symbol, above_ma20: false } },
    capturedContext: context })).toBeNull();
});

test("overlapped context still aborts at the unchanged deadline and drains every transport", () => {
  test.setTimeout(90000);
  const proof=spawnSync(process.execPath,["scripts/completed-input-runtime-proof.mjs","--cold","--publication-clock",
    "--context-latency","--context-budget-timeout"],{cwd:process.cwd(),encoding:"utf8",timeout:80000});
  expect(proof.status,`${proof.stdout}\n${proof.stderr}`).toBe(0);
  const evidence=JSON.parse(proof.stdout.trim().split("\n").at(-1)!);
  expect(evidence).toMatchObject({context_latency_proof:"reproduced_timeout",scheduled_synthetic_requests:8,
    publications:0,pending_synthetic_transports:0,route_budget_ms:23000,cleanup_reserve_ms:3000,
    actual_provider_requests:0,production_actions:0,cleanup:"inert"});
  // Real monotonic duration, not only the hardcoded contract labels. Allow
  // bounded database finalization after the 20-second acquisition cutoff.
  expect(evidence.bounded_duration_ms).toBeGreaterThanOrEqual(19500);
  expect(evidence.bounded_duration_ms).toBeLessThan(24000);
});

test("early scanner rate limit cancels context without becoming a timeout", () => {
  test.setTimeout(90000);
  const proof=spawnSync(process.execPath,["scripts/completed-input-runtime-proof.mjs","--cold","--publication-clock",
    "--context-latency","--scanner-rate-limit"],{cwd:process.cwd(),encoding:"utf8",timeout:80000});
  expect(proof.status,`${proof.stdout}\n${proof.stderr}`).toBe(0);
  const evidence=JSON.parse(proof.stdout.trim().split("\n").at(-1)!);
  expect(evidence).toMatchObject({context_latency_proof:"preserved_scanner_rate_limit",scheduled_synthetic_requests:3,
    publications:0,pending_synthetic_transports:0,actual_provider_requests:0,production_actions:0,cleanup:"inert"});
  expect(evidence.bounded_duration_ms).toBeLessThan(10000);
});

test("intraday quota rejection stops subsequent acquisitions and drains benchmarks", () => {
  test.setTimeout(90000);
  const proof=spawnSync(process.execPath,["scripts/completed-input-runtime-proof.mjs","--cold","--publication-clock",
    "--context-latency","--intraday-rate-limit"],{cwd:process.cwd(),encoding:"utf8",timeout:80000});
  expect(proof.status,`${proof.stdout}\n${proof.stderr}`).toBe(0);
  const evidence=JSON.parse(proof.stdout.trim().split("\n").at(-1)!);
  expect(evidence).toMatchObject({context_latency_proof:"preserved_intraday_rate_limit",scheduled_synthetic_requests:4,
    attempts:1,claims:1,publications:0,pending_synthetic_transports:0,actual_provider_requests:0,
    production_actions:0,broker_actions:0,cleanup:"inert"});
  expect(evidence.bounded_duration_ms).toBeLessThan(10000);
});

test("provider parsing preserves observed zero but never converts missing volume into zero", async () => {
  // Foundation intentionally collects without the server condition. Load the
  // actual SDK only in this server-facing bundle; keep its production marker
  // and the default-condition containment checks unchanged.
  const bundle = await build({ entryPoints: [resolve(process.cwd(), "lib/market-data.ts")],
    bundle: true, write: false, platform: "node", format: "cjs", conditions: ["react-server"] });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", bundle.outputFiles[0].text)(
    createRequire(resolve(process.cwd(), "package.json")), loaded, loaded.exports);
  const { getIntradayCandlesWithDiagnostics } = loaded.exports as {
    getIntradayCandlesWithDiagnostics: typeof import("@/lib/market-data").getIntradayCandlesWithDiagnostics;
  };
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.TWELVE_DATA_API_KEY;
  process.env.TWELVE_DATA_API_KEY = "synthetic-closed-boundary-only";
  let volume: unknown = "0";
  globalThis.fetch = async (input) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
    expect(url.origin).toBe("https://api.twelvedata.com");
    expect(url.pathname).toBe("/time_series");
    return Response.json({ meta: { symbol: "SYNTH", interval: "5min", exchange_timezone: "America/New_York" },
      values: [{ datetime: "2026-10-01 09:30:00", open: "100", high: "101", low: "99", close: "100", volume }] });
  };
  try {
    const read = () => getIntradayCandlesWithDiagnostics("SYNTH", "5min",
      new Date("2026-10-01T13:30:00Z"), new Date("2026-10-01T13:35:00Z"), { requireResponseIdentity: true });
    expect((await read()).candles[0].volume).toBe(0);
    for (volume of ["", " ", "\t", null, undefined]) {
      await expect(read()).rejects.toThrow(/invalid.*volume/i);
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.TWELVE_DATA_API_KEY;
    else process.env.TWELVE_DATA_API_KEY = originalKey;
  }
});
test("scheduled input selection stays default-off and requires a matching claim and exact bounded budget", () => {
  const policy = "completed_daily_intraday_input_v1";
  const receipt = { durable_invocation_payload: { scanner_input_policy_version: policy } } as unknown as ScheduledScanInvocationReceipt;
  const input = { configuredVersion: policy, receipt, requestSource: "netlify_scheduled_function",
    force: false, budget: resolveScheduledScanProviderCreditBudget({ planMode: "free" }),
    allocationExperimentEnabled: false, marketWideDiscoveryEnabled: false };
  expect(scheduledScannerInputPolicy(input)).toBe(policy);
  expect(scheduledScannerInputPolicy({ ...input, configuredVersion: undefined, receipt: null })).toBeUndefined();
  for (const patch of [ { configuredVersion: "unknown" }, { configuredVersion: undefined },
    { receipt: null }, { requestSource: "manual" }, { force: true }, { allocationExperimentEnabled: true },
    { marketWideDiscoveryEnabled: true }, { budget: null },
    { budget: { ...input.budget, scanner_credits_reserved: 7 } },
    { budget: { ...input.budget, reference_refresh_max_attempts: 1 } },
    { budget: { ...input.budget, max_known_credits_per_scan: 9 } },
  ]) expect(() => scheduledScannerInputPolicy({ ...input, ...patch })).toThrow("scheduled_scanner_input_policy_unavailable");
});
function bars(last = "2026-09-30", count = 60) {
  const result = [];
  const day = new Date(`${last}T00:00:00.000Z`);
  let inspected = 0;
  while (result.length < count && inspected++ < 200) {
    const date = day.toISOString().slice(0, 10);
    if (getUsEquityMarketSession(date).session_close) {
      result.unshift({ timestamp: day.getTime() / 1000, open: 100, high: 103,
        low: 99, close: 101, volume: 1000 });
    }
    day.setUTCDate(day.getUTCDate() - 1);
  }
  if (result.length !== count) throw new Error("Synthetic history exceeds verified calendar coverage");
  return result;
}

test("packaged scheduled input policy reaches the real isolated database and owner readback", () => {
  test.setTimeout(180000);
  for (const arguments_ of [[], ["--cold"], ["--wrong-policy"], ["--cold", "--zero-latest-volume"],
    ["--cold", "--opening", "--zero-latest-volume"]]) {
    const proof = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", ...arguments_],
      { cwd: process.cwd(), encoding: "utf8", timeout: 55000 });
    expect(proof.status, `${proof.stdout}\n${proof.stderr}`).toBe(0);
    const evidence = JSON.parse(proof.stdout.trim().split("\n").at(-1)!);
    expect(evidence.evidence_mode).toBe("synthetic_closed_packaged_input_runtime_actual_source_schema");
    expect(evidence.actual_provider_requests).toBe(0);
    expect(evidence.production_actions).toBe(0);
    expect(evidence.cleanup).toBe("inert");
    if (arguments_.includes("--zero-latest-volume")) {
      expect(evidence.zero_latest_volume_inputs).toBe(3);
      expect(evidence.scheduled_synthetic_requests).toBe(8);
      expect(evidence.publications).toBe(0);
      expect(evidence.broker_actions).toBe(0);
    }
  }
});

test("packaged missing volume stays unavailable through persisted decision and owner readback", () => {
  test.setTimeout(90000);
  const proof = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold", "--missing-latest-volume"],
    { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
  expect(proof.status, `${proof.stdout}\n${proof.stderr}`).toBe(0);
  const evidence = JSON.parse(proof.stdout.trim().split("\n").at(-1)!);
  expect(evidence).toMatchObject({fresh_inputs:0,missing_volume_research_sources:0,
    actual_provider_requests:0,production_actions:0,publications:0,broker_actions:0,cleanup:"inert"});
});

test("packaged normal publication binds its decision before actual database persistence", () => {
  test.setTimeout(90000);
  const proof=spawnSync(process.execPath,["scripts/completed-input-runtime-proof.mjs","--cold","--publication-clock"],
    {cwd:process.cwd(),encoding:"utf8",timeout:80000});
  expect(proof.status,`${proof.stdout}\n${proof.stderr}`).toBe(0);
  const evidence=proof.stdout.trim().split("\n").map(line=>JSON.parse(line))
    .find(row=>row.publication_clock_proof==="passed");
  expect(evidence).toMatchObject({actual_provider_requests:0,production_actions:0});
  expect(evidence.synthetic_publication_count).toBeGreaterThan(0);
});

test("packaged publication preserves support-anchored original plans through canonical outcome learning", () => {
  test.setTimeout(90000);
  const proof=spawnSync(process.execPath,["scripts/completed-input-runtime-proof.mjs","--cold","--publication-clock",
    "--original-plan-geometry","--published-original-learning"],{cwd:process.cwd(),encoding:"utf8",timeout:80000});
  expect(proof.status,`${proof.stdout}\n${proof.stderr}`).toBe(0);
  const rows=proof.stdout.trim().split("\n").map(line=>JSON.parse(line));
  expect(rows.find(row=>row.original_plan_geometry_proof)).toMatchObject({ original_plan_geometry_proof:"passed",
    original_plan_field_count:6,support_anchored_publication_count:3,original_population_count:8,
    actual_provider_requests:0,production_actions:0 });
  expect(rows.find(row=>row.published_original_learning_proof)).toMatchObject({ published_original_learning_proof:"passed",
    original_population:8,canonical_published_outcomes:3,missing_original_members:5,
    original_publications_unchanged:true,completed_repeat_requests:0,quality_improvement_claimed:false });
});

test("packaged power-hour publication admits the active original-plan policy before the closing cutoff", () => {
  test.setTimeout(90000);
  const proof=spawnSync(process.execPath,["scripts/completed-input-runtime-proof.mjs","--cold","--publication-clock",
    "--original-plan-geometry","--power-hour-publication"],{cwd:process.cwd(),encoding:"utf8",timeout:80000});
  expect(proof.status,`${proof.stdout}\n${proof.stderr}`).toBe(0);
  const rows=proof.stdout.trim().split("\n").map(line=>JSON.parse(line));
  expect(rows.find(row=>row.power_hour_publication_proof)).toMatchObject({power_hour_publication_proof:"passed",
    target_slot:"2026-10-01T19:00:00.000Z",power_hour_publish_allowed:true,
    original_plan_field_count:6,original_population_count:8,actual_provider_requests:0,production_actions:0});
  expect(rows.at(-1)).toMatchObject({attempts:1,claims:1,scheduled_synthetic_requests:8,
    publications:3,broker_actions:0,cleanup:"inert"});
});

test("packaged published original inputs survive SQL restart and canonical outcome learning without changing the population", () => {
  test.setTimeout(90000);
  const proof = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold", "--publication-clock", "--published-original-learning"],
    { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
  expect(proof.status, `${proof.stdout}\n${proof.stderr}`).toBe(0);
  const evidence = proof.stdout.trim().split("\n").map(line => JSON.parse(line))
    .find(row => row.published_original_learning_proof === "passed");
  expect(evidence).toMatchObject({ original_population: 8, canonical_published_outcomes: 3,
    missing_original_members: 5, separate_synthetic_outcome_requests: 3, completed_repeat_requests: 0,
    distinct_original_publication_clocks: true, restarted_owned_read: true, original_publications_unchanged: true,
    actual_provider_requests: 0, production_actions: 0, broker_actions: 0, quality_improvement_claimed: false });
});

test("ordinary scheduled outcomes recover only budget-deferred original sources after a weekend", () => {
  test.setTimeout(90000);
  const proof = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--diagnose-outcomes", "--next-session-outcomes"],
    { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
  expect(proof.status, `${proof.stdout}\n${proof.stderr}`).toBe(0);
  const evidence = JSON.parse(proof.stdout.trim().split("\n").at(-1)!);
  expect(evidence.outcome_chain_evidence.resumption.next_session).toEqual({
    policy_version: "trailing_seven_ny_dates_v1", original_date: "2026-10-01", evaluation_date: "2026-10-05",
    scheduled_attempts: 3, reserved_credits: 4, synthetic_requests: 2,
    previous_outcomes_unchanged: true, repeat_requests: 0, completed_next_slot_requests: 0,
    original_horizon_retained: true, late_label_clock_retained: true, original_members: 8,
  });
  expect(evidence.outcome_chain_evidence.cross_date_source_controls).toEqual({
    same_day_predecessor_missing_sources: 2, other_owner_excluded: true,
    expired_original_source_excluded: true, future_source_excluded: true, invalid_scope_requests: 0,
    rejected_scopes: ["unknown_scope", "direct_call", "frozen_one_shot", "frozen_series", "global_disabled"],
    concurrent_delivery_claims: 1, invalid_original_outcome_rejected: true,
    late_labels_excluded_from_original_cutoff: true,
  });
  expect(evidence).toMatchObject({ actual_provider_requests: 0, production_actions: 0, publications: 0, broker_actions: 0 });
});

test("capped database pages recover the complete original population without reacquiring completed labels", () => {
  test.setTimeout(90000);
  const proof = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--diagnose-outcomes", "--next-session-outcomes", "--paged-outcome-reads"],
    { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
  expect(proof.status, `${proof.stdout}\n${proof.stderr}`).toBe(0);
  const evidence = JSON.parse(proof.stdout.trim().split("\n").at(-1)!);
  expect(evidence.outcome_chain_evidence.resumption.next_session).toMatchObject({
    scheduled_attempts: 3, reserved_credits: 4, synthetic_requests: 2,
    previous_outcomes_unchanged: true, repeat_requests: 0, completed_next_slot_requests: 0,
    original_horizon_retained: true, original_members: 8,
  });
  expect(evidence.outcome_chain_evidence.cross_date_source_controls).toMatchObject({
    complete_capped_outcome_read: true, capped_learning_read_complete: true, concurrent_delivery_claims: 1,
    other_owner_excluded: true, late_labels_excluded_from_original_cutoff: true,
  });
  expect(evidence).toMatchObject({actual_provider_requests:0,production_actions:0,publications:0,broker_actions:0});
});

test("actual official route and restarted SQL/SDK resume early original canonical outcomes", () => {
  test.setTimeout(90000);
  const proof = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--diagnose-outcomes",
    "--relative-plan-60m", "--partial-horizon-resumption"],
    { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
  expect(proof.status, `${proof.stdout}\n${proof.stderr}`).toBe(0);
  const evidence = JSON.parse(proof.stdout.trim().split("\n").at(-1)!);
  expect(evidence.outcome_chain_evidence.partial_horizon_resumption).toMatchObject({
    early_synthetic_requests: 4, early_canonical_outcomes_qualified: 0, early_horizon_r_available: false,
    mature_synthetic_requests: 4, original_ids_preserved: true, mature_canonical_outcomes: 4,
  });
  expect(evidence.outcome_chain_evidence.partial_horizon_resumption.early_persisted_original_ids).toHaveLength(4);
  expect(evidence.outcome_chain_evidence.resumption).toMatchObject({persisted_outcomes:6,
    additional_synthetic_outcome_requests:2,completed_repeat_requests:0,prior_outcomes_unchanged:true});
  expect(evidence.outcome_chain_evidence.learning_admission.relative_plan_context_outcomes).toMatchObject({
    original_population_count:8,selected_60m_receipt_count:6,resolved_60m_outcomes:6,missing_outcomes:2});
  expect(evidence).toMatchObject({actual_provider_requests:0,production_actions:0,publications:0,broker_actions:0});
});

for (const scenario of ["cold", "warm", "opening", "opening_zero"]) {
  test(`packaged ${scenario} inputs retain hidden research plans and real isolated outcome persistence`, () => {
    test.setTimeout(90000);
    const proof = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--diagnose-outcomes",
      ...(scenario !== "warm" ? ["--cold"] : []), ...(scenario.startsWith("opening") ? ["--opening"] : []),
      ...(scenario === "opening_zero" ? ["--zero-latest-volume"] : [])],
      { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
    expect(proof.status, `${proof.stdout}\n${proof.stderr}`).toBe(0);
    const evidence = JSON.parse(proof.stdout.trim().split("\n").at(-1)!);
    expect(evidence.outcome_chain_evidence).toMatchObject({
      research_sources: scenario === "warm" ? 6 : 3,
      persisted_outcomes: scenario === "warm" ? 4 : 3,
      unobservable_population_members: scenario === "warm" ? 2 : 5,
      outcome_budget_pending_sources: scenario === "warm" ? 2 : 0,
      learning_admission: {
        readiness_version: "recommendation_learning_baseline_readiness_v4",
        plan_version: "recommendation_learning_evaluation_plan_v2",
        relative_plan_context_shadow: {
          comparison_version: "relative_plan_context_shadow_v1",
          status: scenario.startsWith("opening") ? "unavailable" : "partial",
          original_population_count: 8,
          assessed_count: scenario.startsWith("opening") ? 0 : scenario === "warm" ? 6 : 3,
          unassessed_count: scenario.startsWith("opening") ? 8 : scenario === "warm" ? 2 : 5,
          restart_stable: true,
          actual_provider_requests: 0,
          live_ranking_effect: false,
          publication_effect: false,
          quality_improvement_claimed: false,
        },
        canonical_research_outcomes: scenario === "warm" ? 6 : 3,
        retained_intake_assessments: scenario === "warm" ? 6 : 3,
        intake_assessment_provenance: "complete",
        intake_assessment_versions: ["1.2"],
        intake_assessment_statuses: ["incomplete"],
        intake_assessment_grades: ["unknown"],
        original_intake_assessments_unchanged: true,
        contradictory_intake_assessments_rejected: true,
        assessment_key_order_preserved: true,
        mixed_assessment_versions_segmented: true,
        upstream_provider_version_unavailable: scenario === "warm" ? 6 : 3,
        unresolved_population_members: scenario === "warm" ? 2 : 5,
        freeze_status: "not_ready",
        actual_provider_requests: 0,
        legacy_source_gate_unchanged: true,
        tampered_source_and_lineage_admitted: 0,
      },
      resumption: {
        persisted_outcomes: scenario === "warm" ? 6 : 3,
        additional_synthetic_outcome_requests: scenario === "warm" ? 2 : 0,
        completed_repeat_requests: 0,
        prior_outcomes_unchanged: true,
      },
    });
    expect(evidence.scheduled_synthetic_requests).toBe(8);
    if(scenario === "opening_zero") expect(evidence.zero_latest_volume_inputs).toBe(3);
    expect(evidence.actual_provider_requests).toBe(0);
    expect(evidence.production_actions).toBe(0);
    expect(evidence.publications).toBe(0);
    expect(evidence.cleanup).toBe("inert");
  });
}
function receipt(last = "2026-09-30", capturedAt = at.toISOString()) {
  return {
    contract_version: "daily_candle_response_v1", symbol: "SYNTH",
    interval: "1day", exchange_timezone: "America/New_York",
    price_adjustment: "splits", captured_at: capturedAt, candles: bars(last),
    response_identity: { contract_version: "twelve_data_response_identity_v1",
      digest_algorithm: "sha256", payload_sha256: `sha256:${"a".repeat(64)}`,
      payload_byte_length: 12345 },
  };
}
type ContextApi = {
  captureCompletedDailyContext: (value: unknown, ticker: string, now: Date,
    calendar?: unknown) => Promise<Record<string, unknown> | null>;
  readCompletedDailyContext: (value: unknown, ticker: string, now: Date,
    calendar?: unknown) => Promise<Record<string, unknown> | null>;
  captureCurrentSessionContext: (value: unknown, ticker: string, now: Date,
    calendar?: unknown) => Promise<Record<string, unknown> | null>;
  readCurrentSessionContext: (value: unknown, ticker: string, now: Date) => Promise<Record<string, unknown> | null>;
  currentSessionFeatures: (value: unknown) => Record<string, unknown>;
};
let api: ContextApi;
test.beforeAll(async () => {
  const bundle = await build({ stdin: { contents:
    "export * from './lib/scanner-completed-daily-context'; export * from './lib/scanner-current-session-context';",
    resolveDir: process.cwd(), loader: "ts" }, bundle: true, write: false,
    platform: "node", format: "cjs" });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", bundle.outputFiles[0].text)(
    createRequire(resolve(process.cwd(), "package.json")), loaded, loaded.exports);
  api = loaded.exports as ContextApi;
});

test("captures closed daily dates as historical context, not a current price", async () => {
  const context = await api.captureCompletedDailyContext(receipt(), "SYNTH", at);
  expect(context).toMatchObject({ contract_version: "completed_daily_context_v1",
    role: "completed_historical_daily", latest_completed_market_date: "2026-09-30",
    latest_completed_at: "2026-09-30T20:00:00.000Z" });
  expect(context).not.toHaveProperty("current_price");
  expect(context).not.toHaveProperty("reference_price_timestamp");
  expect(await api.readCompletedDailyContext(JSON.parse(JSON.stringify(context)),
    "SYNTH", new Date("2026-10-01T18:00:00.000Z"))).toEqual(context);
});

test("original completed daily capture rejects future microseconds and noncanonical aliases before normalization", async () => {
  const baseline = receipt();
  const original = JSON.stringify(baseline);
  const context = await api.captureCompletedDailyContext(baseline, "SYNTH", at);
  expect(context).not.toBeNull();
  for (const captured_at of ["2026-10-01T15:50:00.000001Z", "2026-09-31T15:50:00.000Z",
    "2026-10-01 15:50:00.000Z", "2026-10-01T15:50:00Z", "2026-10-01T15:50:00.000+00:00"]) {
    expect(await api.captureCompletedDailyContext({ ...baseline, captured_at }, "SYNTH", at)).toBeNull();
    expect(await api.readCompletedDailyContext({ ...context, captured_at }, "SYNTH", at)).toBeNull();
  }
  expect(await api.readCompletedDailyContext(JSON.parse(JSON.stringify(context)), "SYNTH", at)).toEqual(context);
  expect(JSON.stringify(baseline)).toBe(original);
});

// Captured from the actual pre-optimization implementation at 6adebd0, not
// recomputed expectations. Reusing UTC arithmetic must preserve every raw
// candle and the exact archived digest across DST history and a half-day.
for (const [last, capturedAt, digest] of [
  ["2026-09-30", "2026-10-01T15:50:00.000Z", "sha256:3f110bcb72e3f076fea84eef6062e179d2e0b780bb91cc11b4b2641dcf3be502"],
  ["2026-03-31", "2026-04-01T15:50:00.000Z", "sha256:7ce7304a32da108f25a547e894863bde4c9f65f35ad51cf88715b752d00c724e"],
  ["2026-11-27", "2026-11-27T18:01:00.000Z", "sha256:f0a9dc82bb2f7216b1b2492d6a6f18e5f45250dffed70d37729210d15977c7fe"],
]) {
  test(`original daily context keeps its pre-optimization bytes at ${capturedAt}`, async () => {
    const input = receipt(last, capturedAt), now = new Date(capturedAt);
    const before = JSON.stringify(input);
    const context = await api.captureCompletedDailyContext(input, "SYNTH", now);
    expect(context).toMatchObject({ content_sha256: digest, candles: input.candles });
    expect(await api.readCompletedDailyContext(JSON.parse(JSON.stringify(context)), "SYNTH", now)).toEqual(context);
    expect(JSON.stringify(input)).toBe(before);
  });
}

test("legacy daily response retention preserves candles and request shape while strict history stays fail closed", async () => {
  const bundle=await build({entryPoints:[resolve(process.cwd(),"lib/market-data.ts")],bundle:true,
    write:false,platform:"node",format:"cjs",conditions:["react-server"]});
  const loaded={exports:{}};
  new Function("require","module","exports",bundle.outputFiles[0].text)(
    createRequire(resolve(process.cwd(),"package.json")),loaded,loaded.exports);
  const runtime=loaded.exports as typeof import("@/lib/market-data");
  const OriginalDate=globalThis.Date,originalFetch=globalThis.fetch,originalKey=process.env.TWELVE_DATA_API_KEY;
  globalThis.Date=class extends OriginalDate {
    constructor(...args:ConstructorParameters<typeof Date>) {super(...(args.length?args:[at.getTime()]) as ConstructorParameters<typeof Date>);}
    static now(){return at.getTime();}
  } as typeof Date;
  process.env.TWELVE_DATA_API_KEY="synthetic-legacy-retention-only";
  let scenario="valid",requests=0;
  const params:string[]=[];
  globalThis.fetch=async input=>{
    const url=new URL(typeof input==="string"||input instanceof URL?input:input.url);
    expect(url.origin).toBe("https://api.twelvedata.com");expect(url.pathname).toBe("/time_series");
    requests++;url.searchParams.delete("apikey");params.push(url.search);
    expect(url.searchParams.has("adjust")).toBe(false);
    const values=bars().map(bar=>({datetime:new OriginalDate(bar.timestamp*1000).toISOString().slice(0,10),
      open:String(bar.open),high:String(bar.high),low:String(bar.low),close:String(bar.close),volume:String(bar.volume)}));
    const meta={symbol:scenario==="wrong_symbol"?"OTHER":"SYNTH",interval:"1day",
      exchange_timezone:scenario==="wrong_timezone"?"UTC":"America/New_York"};
    if(scenario==="partial"||scenario==="future"){
      values.shift();values.push({...values.at(-1)!,datetime:scenario==="partial"?"2026-10-01":"2026-10-02",close:"1000",high:"1001"});
    }
    if(scenario==="duplicate") values[58]={...values[57]};
    if(scenario==="blank_volume")values[58].volume="";
    if(scenario==="dated_timestamp")values[58].datetime+="T00:00:00Z";
    return Response.json({...(scenario!=="missing_meta"?{meta}:{}),values});
  };
  try {
    for(scenario of ["valid","partial","future","duplicate","blank_volume","dated_timestamp","wrong_symbol","wrong_timezone","missing_meta"]){
      if(scenario==="blank_volume"){
        await expect(runtime.getDailyCandles("synth",60)).rejects.toThrow("invalid candle 59 volume");
        await expect(runtime.getDailyCandlesWithRetainedHistory("synth",60)).rejects.toThrow("invalid candle 59 volume");
        continue;
      }
      const legacy=await runtime.getDailyCandles("synth",60);
      const retained=await runtime.getDailyCandlesWithRetainedHistory("synth",60);
      expect(retained.candles).toEqual(legacy);expect(params.at(-1)).toBe(params.at(-2));
      const history=await api.captureCompletedDailyContext(retained.completed_response,"SYNTH",at);
      if(scenario==="valid"||scenario==="partial"){
        expect(history).toMatchObject({role:"completed_historical_daily",captured_at:at.toISOString(),
          latest_completed_market_date:"2026-09-30",price_adjustment:"splits"});
        expect(history!.candles).toHaveLength(scenario==="partial"?59:60);
        expect(history).not.toHaveProperty("reference_price_timestamp");
        expect(await api.readCompletedDailyContext(history,"SYNTH",new OriginalDate("2026-10-02T15:50:00Z"))).toBeNull();
      } else expect(history).toBeNull();
    }
    expect(requests).toBe(18); // One existing request per API, never supplemental/fallback reads.
    const controller=new AbortController();controller.abort();
    await expect(runtime.getDailyCandlesWithRetainedHistory("SYNTH",60,{signal:controller.signal})).rejects.toThrow();
    expect(requests).toBe(18);
  } finally {
    globalThis.Date=OriginalDate;globalThis.fetch=originalFetch;
    if(originalKey===undefined)delete process.env.TWELVE_DATA_API_KEY;else process.env.TWELVE_DATA_API_KEY=originalKey;
  }
});

test("excludes today's unfinished bar and never upgrades it after close", async () => {
  const context = await api.captureCompletedDailyContext(receipt("2026-10-01"), "SYNTH", at);
  expect(context?.latest_completed_market_date).toBe("2026-09-30");
  expect((context?.candles as unknown[])?.length).toBe(59);
  expect(await api.readCompletedDailyContext(context, "SYNTH",
    new Date("2026-10-01T20:01:00.000Z"))).toBeNull();
});

test("uses the early close cutoff and skips Labor Day/weekends", async () => {
  const earlyAt = new Date("2026-11-27T18:01:00.000Z");
  const early = await api.captureCompletedDailyContext(receipt("2026-11-27", earlyAt.toISOString()), "SYNTH", earlyAt);
  expect(early?.latest_completed_at).toBe("2026-11-27T18:00:00.000Z");
  const before = new Date("2026-11-27T17:59:00.000Z");
  expect((await api.captureCompletedDailyContext(receipt("2026-11-27", before.toISOString()), "SYNTH", before))?.latest_completed_market_date).toBe("2026-11-25");
  const monday = new Date("2026-09-07T16:00:00.000Z");
  expect((await api.captureCompletedDailyContext(receipt("2026-09-04", monday.toISOString()), "SYNTH", monday))?.latest_completed_market_date).toBe("2026-09-04");
});

test("fails closed on wrong identity, missing calendar, malformed and gapped history", async () => {
  const baseline = receipt();
  const variants = [
    { ...baseline, symbol: "OTHER" },
    { ...baseline, interval: "5min" },
    { ...baseline, exchange_timezone: "UTC" },
    { ...baseline, response_identity: null },
    { ...baseline, captured_at: "2026-10-01T15:51:00.000Z" },
    { ...baseline, candles: baseline.candles.slice(0, -1) },
    { ...baseline, candles: baseline.candles.filter((_, i) => i !== 45) },
    { ...baseline, candles: baseline.candles.slice(-49) },
    { ...baseline, candles: [...baseline.candles, baseline.candles.at(-1)] },
    { ...baseline, candles: baseline.candles.map((c, i) => i === 55 ? { ...c, high: 0 } : c) },
    { ...baseline, candles: bars("2026-10-02") },
    { ...baseline, candles: baseline.candles.map((c, i) => i === 55 ? { ...c, timestamp: 86400 * 1000000000 } : c) },
  ];
  for (const value of variants) expect(await api.captureCompletedDailyContext(value, "SYNTH", at)).toBeNull();
  expect(await api.captureCompletedDailyContext(baseline, "SYNTH", at, null)).toBeNull();
  expect(await api.captureCompletedDailyContext(baseline, "SYNTH", at,
    { ...usEquityMarketCalendarDataset, dataset_fingerprint: "drift" })).toBeNull();
});

test("detects persisted data mutation and does not admit legacy derived caches", async () => {
  const context = await api.captureCompletedDailyContext(receipt(), "SYNTH", at);
  const changed = JSON.parse(JSON.stringify(context));
  changed.candles[5].close = 102;
  expect(await api.readCompletedDailyContext(changed, "SYNTH", at)).toBeNull();
  expect(await api.readCompletedDailyContext({ scanner_values: { latest_close: 101 },
    updated_at: at.toISOString() }, "SYNTH", at)).toBeNull();
  expect(await api.readCompletedDailyContext(context, "OTHER", at)).toBeNull();
  const friday = new Date("2026-10-02T20:01:00.000Z");
  const fridayContext = await api.captureCompletedDailyContext(receipt("2026-10-02", friday.toISOString()), "SYNTH", friday);
  expect(fridayContext).not.toBeNull();
  // Monday still has Friday as its last completed session, but the split basis
  // must be reacquired on Monday, not silently reused across the NY-day boundary.
  expect(await api.readCompletedDailyContext(fridayContext, "SYNTH", new Date("2026-10-05T16:00:00.000Z"))).toBeNull();
});

function sessionReceipt(now: Date, interval: "5min" | "15min" = "5min") {
  const session = getUsEquityMarketSession(now);
  const step = interval === "5min" ? 300 : 900;
  const candles = [];
  for (let timestamp = Date.parse(session.session_open!) / 1000; timestamp <= now.getTime() / 1000; timestamp += step) {
    candles.push({ timestamp, open: 104, high: 106, low: 103, close: 105, volume: 1000 });
  }
  return { symbol: "SYNTH", interval, exchange_timezone: "America/New_York",
    captured_at: now.toISOString(), response_identity: receipt().response_identity, candles };
}

test("closed current-session bars retain real OHLC and cannot upgrade a partial spike", async () => {
  const now = new Date("2026-10-01T15:52:00.000Z");
  const input = sessionReceipt(now);
  input.candles.at(-1)!.high = 999; input.candles.at(-1)!.close = 900;
  const context = await api.captureCurrentSessionContext(input, "SYNTH", now);
  expect(context).toMatchObject({ contract_version: "current_session_intraday_v1",
    latest_bar_started_at: "2026-10-01T15:45:00.000Z", latest_bar_closed_at: "2026-10-01T15:50:00.000Z" });
  expect(api.currentSessionFeatures(context)).toMatchObject({ session_open: 104,
    session_high: 106, session_low: 103, recent_range_position: 67, range_expansion_ratio: 1 });
  expect(await api.readCurrentSessionContext(context, "SYNTH", new Date("2026-10-01T15:54:00.000Z"))).toEqual(context);
  expect(await api.readCurrentSessionContext(context, "SYNTH", new Date("2026-10-01T15:56:00.000Z"))).toBeNull();
});

test("current session rejects gaps, future bars, metadata drift, mutations and missing calendar", async () => {
  const input = sessionReceipt(at);
  for (const value of [ { ...input, symbol: "OTHER" }, { ...input, exchange_timezone: "UTC" },
    { ...input, response_identity: null }, { ...input, captured_at: "2026-10-01T15:51:00.000Z" },
    { ...input, candles: input.candles.slice(1) },
    { ...input, candles: input.candles.filter((_, index) => index !== 3) },
    { ...input, candles: [...input.candles, { ...input.candles.at(-1)!, timestamp: at.getTime() / 1000 + 300 }] },
  ]) expect(await api.captureCurrentSessionContext(value, "SYNTH", at)).toBeNull();
  expect(await api.captureCurrentSessionContext(input, "SYNTH", at, null)).toBeNull();
  const context = await api.captureCurrentSessionContext(input, "SYNTH", at);
  const changed = structuredClone(context)!;
  (changed.candles as { close: number }[])[0].close = 104;
  expect(await api.readCurrentSessionContext(changed, "SYNTH", at)).toBeNull();
  expect(await api.readCurrentSessionContext(context, "OTHER", at)).toBeNull();
  expect(await api.readCurrentSessionContext({ ...context, session_close_at: "2026-10-01T21:00:00.000Z" }, "SYNTH", at)).toBeNull();
  expect(await api.readCurrentSessionContext(context, "SYNTH", new Date("2026-10-01T20:00:00.000Z"))).toBeNull();
});

test("current source capture and restart reject future microseconds and noncanonical clock aliases", async () => {
  const input = sessionReceipt(at);
  const original = JSON.stringify(input);
  const context = await api.captureCurrentSessionContext(input, "SYNTH", at);
  expect(context).not.toBeNull();
  for (const captured_at of ["2026-10-01T15:50:00.000001Z", "2026-09-31T15:50:00.000Z",
    "2026-10-01 15:50:00.000Z", "2026-10-01T15:50:00Z", "2026-10-01T15:50:00.000+00:00"]) {
    expect(await api.captureCurrentSessionContext({ ...input, captured_at }, "SYNTH", at)).toBeNull();
    expect(await api.readCurrentSessionContext({ ...context, captured_at }, "SYNTH", at)).toBeNull();
  }
  expect(await api.readCurrentSessionContext(JSON.parse(JSON.stringify(context)), "SYNTH", at)).toEqual(context);
  expect(JSON.stringify(input)).toBe(original);
});

test("fifteen-minute current context respects early close and leaves short lookbacks unknown", async () => {
  const now = new Date("2026-11-27T14:45:00.000Z");
  const context = await api.captureCurrentSessionContext(sessionReceipt(now, "15min"), "SYNTH", now);
  expect(context).toMatchObject({ market_date: "2026-11-27", session_close_at: "2026-11-27T18:00:00.000Z",
    latest_bar_started_at: "2026-11-27T14:30:00.000Z", latest_bar_closed_at: "2026-11-27T14:45:00.000Z" });
  expect(api.currentSessionFeatures(context).recent_bullish_candles).toBeUndefined();
  expect(api.currentSessionFeatures(context).range_expansion_ratio).toBeUndefined();
  // A closed 15min bar five minutes later is already beyond the unchanged
  // maximum source-start age. Do not loosen freshness to admit this fixture.
  expect(await api.readCurrentSessionContext(context, "SYNTH", new Date("2026-11-27T14:50:00.000Z"))).toBeNull();
  expect(await api.readCurrentSessionContext(context, "SYNTH", new Date("2026-11-27T18:00:00.000Z"))).toBeNull();
});

function disposableCacheDatabase() {
  const prefix = `ture-daily-context-${randomUUID().slice(0, 8)}`;
  const database = `${prefix}-db`, rest = `${prefix}-rest`, network = `${prefix}-net`;
  const docker = (args: string[], input?: string) => {
    const result = spawnSync("docker", args, { encoding: "utf8", input, timeout: 30000 });
    if (result.status !== 0) throw new Error(result.stderr || "isolated Docker operation failed");
    return result.stdout.trim();
  };
  const cleanup = () => {
    for (const name of [rest, database]) spawnSync("docker", ["rm", "-f", name], { encoding: "utf8", timeout: 30000 });
    spawnSync("docker", ["network", "rm", network], { encoding: "utf8", timeout: 30000 });
  };
  try {
    // A dedicated bridge with a loopback-only REST port: Docker Desktop's
    // internal/isolated network does not expose the required host readback port.
    docker(["network", "create", network]);
    docker(["run", "-d", "--rm", "--network", network, "--name", database,
      "-e", "POSTGRES_PASSWORD=postgres", "postgres:16-alpine"]);
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const result = spawnSync("docker", ["exec", database, "pg_isready", "-h", "127.0.0.1", "-U", "postgres"], { encoding: "utf8" });
      if (result.status === 0) { ready = true; break; }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
    if (!ready) throw new Error("isolated PostgreSQL TCP startup failed");
    const migrationFiles = [
      "20260519000000_create_legacy_baseline_schema_draft.sql",
      "20260528000000_create_recommendation_snapshots.sql",
      "20260528001000_create_recommendation_outcomes.sql",
      "20260528002000_create_recommendation_scan_runs.sql",
      "20260528003000_create_recommendation_batches.sql",
      "20260614000000_create_execution_records.sql",
      "20260724001500_create_transactional_open_position_command.sql",
      "20260811163228_add_fail_closed_application_owner_foundation.sql",
    ];
    // Actual source migrations and owner constraints, not a JSON-store mock.
    // Minimal auth fixtures are local-only; no broker/position command is called.
    docker(["exec", "-i", database, "psql", "-X", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-q"],
      "create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;\n" +
      "create schema auth; create table auth.users (id uuid primary key);\n" +
      "create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub', '')::uuid $$;\n" +
      "insert into auth.users values ('00000000-0000-4000-8000-000000000001'), ('00000000-0000-4000-8000-000000000002');\n" +
      migrationFiles.map(file => readFileSync(`supabase/migrations/${file}`, "utf8")).join("\n") +
      "\ngrant select, insert, update on public.recommendation_scan_runs to service_role;\n" +
      "grant select on public.recommendation_snapshots, public.recommendation_outcomes, public.user_settings, public.positions, public.recommendations to service_role;\n" +
      "grant insert on public.market_regime_snapshots to service_role;\n");
    const secret = "synthetic-local-postgrest-jwt-fixture-only";
    docker(["run", "-d", "--rm", "--network", network, "--name", rest,
      "-p", "127.0.0.1::3000", "-e", `PGRST_DB_URI=postgres://postgres:postgres@${database}:5432/postgres`,
      "-e", "PGRST_DB_SCHEMAS=public", "-e", "PGRST_DB_ANON_ROLE=anon", "-e", `PGRST_JWT_SECRET=${secret}`,
      "ghcr.io/postgrest/postgrest@sha256:5922bde07147b82b1c9d8f749e48c1e5b99ebb233f3888bb7ab65f07cf4ac82d"]);
    const port = docker(["port", rest, "3000/tcp"]).match(/^127\.0\.0\.1:(\d+)$/)?.[1];
    if (!port) throw new Error("isolated PostgREST loopback mapping unavailable");
    const head = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(JSON.stringify({ role: "service_role", exp: 1900000000 })).toString("base64url");
    const token = `${head}.${body}.${createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url")}`;
    return { origin: `http://127.0.0.1:${port}`, token, cleanup };
  } catch (error) { cleanup(); throw error; }
}

for (const storage of ["synthetic HTTP boundary", "isolated PostgreSQL/PostgREST"] as const) {
test(`real scanner acquires raw history then reuses it after restart with ${storage}`, async () => {
  test.setTimeout(120000);
  const bundled = await build({ stdin: { contents:
    "export {scanMarket} from './lib/scanner'; export {createActiveScanTrace} from './lib/active-scan-trace';" +
    "export {getServerSupabaseClient} from './lib/supabase-server'; export {persistRecommendationScanRun} from './lib/server/recommendation-scan-run-persistence';" +
    "export {readRecommendationLearningBaselineSource} from './lib/server/application-data-access';" +
    "export {generateRecommendations} from './lib/recommendation-generator';" +
    "export {buildRealScannerBaseCandidateSelection} from './lib/real-scanner-candidate-generation';" +
    "export {resolveScheduledScanProviderCreditBudget} from './lib/scheduled-scan-ticker-cap';",
    resolveDir: process.cwd(), loader: "ts" }, absWorkingDir: process.cwd(),
    bundle: true, write: false, platform: "node", format: "cjs",
    external: ["@supabase/supabase-js"], plugins: [{ name: "framework-marker", setup(builder) {
      builder.onResolve({ filter: /^server-only$/ }, () => ({ path: "server-only", namespace: "marker" }));
      builder.onLoad({ filter: /.*/, namespace: "marker" }, () => ({ contents: "", loader: "js" }));
    } }],
  });
  const load = () => {
    const loaded = { exports: {} };
    new Function("require", "module", "exports", bundled.outputFiles[0].text)(
      createRequire(resolve(process.cwd(), "package.json")), loaded, loaded.exports);
    return loaded.exports as { scanMarket: typeof import("@/lib/scanner").scanMarket;
      createActiveScanTrace: typeof import("@/lib/active-scan-trace").createActiveScanTrace;
      getServerSupabaseClient: typeof import("@/lib/supabase-server").getServerSupabaseClient;
      persistRecommendationScanRun: typeof import("@/lib/server/recommendation-scan-run-persistence").persistRecommendationScanRun;
      generateRecommendations: typeof import("@/lib/recommendation-generator").generateRecommendations;
      buildRealScannerBaseCandidateSelection: typeof import("@/lib/real-scanner-candidate-generation").buildRealScannerBaseCandidateSelection;
      resolveScheduledScanProviderCreditBudget: typeof import("@/lib/scheduled-scan-ticker-cap").resolveScheduledScanProviderCreditBudget;
      readRecommendationLearningBaselineSource: typeof import("@/lib/server/application-data-access").readRecommendationLearningBaselineSource };
  };
  const RealDate = globalThis.Date;
  const database = storage === "isolated PostgreSQL/PostgREST" ? disposableCacheDatabase() : null;
  let clock = at.getTime();
  class FixtureDate extends RealDate {
    constructor(value?: string | number | Date) { super(value instanceof RealDate ? value.getTime() : value ?? clock); }
    static now() { return clock; }
  }
  const originalFetch = globalThis.fetch, originalLog = console.log, originalError = console.error;
  if (database) {
    let ready = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      try {
        const response = await originalFetch(database.origin + "/scanner_cache?select=ticker", {
          headers: { Authorization: `Bearer ${database.token}` }, signal: AbortSignal.timeout(1000) });
        if (response.ok) { ready = true; break; }
      } catch { /* bounded startup check, not a provider retry */ }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!ready) { database.cleanup(); throw new Error("isolated PostgREST startup failed"); }
  }
  const keys = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_ROLE", "SUPABASE_SERVICE_ROLE_SECRET", "TWELVE_DATA_API_KEY", "TURE_APPLICATION_OWNER_USER_ID", "TURE_MARKET_WIDE_DISCOVERY_ENABLED", "TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED"];
  const saved = keys.map(key => [key, process.env[key]] as const);
  keys.forEach(key => delete process.env[key]);
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://synthetic-history-fixture.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = database?.token ?? "sb_secret_synthetic_local_only";
  process.env.TWELVE_DATA_API_KEY = "synthetic_local_only";
  const owner = "00000000-0000-4000-8000-000000000001", otherOwner = "00000000-0000-4000-8000-000000000002";
  process.env.TURE_APPLICATION_OWNER_USER_ID = owner;
  globalThis.Date = FixtureDate as DateConstructor;
  console.log = () => {}; console.error = () => {};
  const rows = new Map<string, Record<string, unknown>>();
  let daily = 0, intraday = 0, wrongIntradayIdentity = false, gapIntraday = false;
  let delayAfterScanner = false;
  const base = Array.from({ length: 8 }, (_, i) => ({ ticker: `SYNTH${i}`, company_name: "Synthetic",
    sector: "Synthetic", mock_current_price: 99, mock_trend: "", mock_volume_context: "",
    mock_support: 95, mock_resistance: 108, mock_news_context: "" }));
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init), url = new URL(request.url);
    if (url.origin === "https://synthetic-history-fixture.invalid") {
      expect(["/rest/v1/scanner_cache", "/rest/v1/recommendation_scan_runs", "/rest/v1/recommendation_snapshots", "/rest/v1/recommendation_outcomes",
        "/rest/v1/user_settings", "/rest/v1/positions", "/rest/v1/recommendations", "/rest/v1/market_regime_snapshots"]).toContain(url.pathname);
      if (["/rest/v1/recommendations", "/rest/v1/positions"].includes(url.pathname)) expect(request.method).toBe("GET");
      // Context acquisition now overlaps the scanner. Advance the clock at the
      // real context-persistence boundary, after both acquisitions have settled,
      // to keep this an expiry-before-publication test rather than an ordering
      // assumption about which provider request starts last.
      if (delayAfterScanner && url.pathname === "/rest/v1/market_regime_snapshots" && request.method === "POST") {
        clock += 360001; delayAfterScanner = false;
      }
      if (database) {
        // Only the Supabase gateway prefix is removed. Query parsing, JSONB
        // persistence, unique upsert and restart readback run in real PostgREST/PG.
        const path = url.pathname.slice("/rest/v1".length) + url.search;
        const response = await originalFetch(database.origin + path, {
          method: request.method, headers: request.headers,
          ...(!["GET", "HEAD"].includes(request.method) ? { body: await request.text() } : {}),
        });
        expect(response.ok, await response.clone().text()).toBe(true);
        const persisted = await originalFetch(database.origin + "/scanner_cache?select=*", {
          headers: { Authorization: `Bearer ${database.token}` } });
        expect(persisted.ok).toBe(true);
        rows.clear();
        for (const row of await persisted.json()) rows.set(row.ticker, row);
        return response;
      }
      expect(url.pathname).toBe("/rest/v1/scanner_cache");
      const filter = url.searchParams.get("ticker");
      if (request.method === "GET") {
        const matched = [...rows.values()].filter(row => !filter ||
          (filter.startsWith("eq.") ? row.ticker === filter.slice(3) : filter.includes(String(row.ticker))));
        return new Response(JSON.stringify(matched), { headers: { "Content-Type": "application/json" } });
      }
      const body = await request.json();
      if (request.method === "POST") {
        const row = Array.isArray(body) ? body[0] : body;
        rows.set(row.ticker, structuredClone(row));
      } else {
        expect(request.method).toBe("PATCH");
        const ticker = filter!.slice(3);
        rows.set(ticker, { ...rows.get(ticker), ...structuredClone(body) });
      }
      return new Response(null, { status: 204 });
    }
    expect(url.origin).toBe("https://api.twelvedata.com");
    expect(url.pathname).toBe("/time_series");
    const symbol = url.searchParams.get("symbol"), interval = url.searchParams.get("interval");
    let values;
    if (interval === "1day") {
      daily++;
      expect(url.searchParams.get("adjust")).toBe("splits");
      values = bars().map(candle => ({ ...candle, datetime: new RealDate(candle.timestamp * 1000).toISOString().slice(0, 10) }));
    } else {
      intraday++;
      expect(interval).toBe("5min");
      // Full synthetic regular-session sequence, latest candle five minutes old.
      values = [];
      for (let time = RealDate.parse("2026-10-01T13:30:00.000Z"); time < clock; time += 300000) {
        const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/New_York",
          year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new RealDate(time));
        values.push({ datetime: parts, open: "104", high: "106", low: "103", close: "105", volume: "1000" });
      }
      if (gapIntraday) values.splice(3, 1);
    }
    return new Response(JSON.stringify({ meta: { symbol: wrongIntradayIdentity && interval === "5min" ? "OTHER" : symbol,
      interval, exchange_timezone: "America/New_York" }, values }),
      { headers: { "Content-Type": "application/json" } });
  };
  try {
    const options = { source: "scheduled" as const, maxFreshProviderCalls: 2,
      freshProviderCallPacingMs: 0, completedDailyContextPolicyVersion: "completed_daily_intraday_input_v1" as const };
    if (database) {
      // A zero candidate budget is an empty original population, not authority
      // to acquire fixed demo tickers. Benchmark acquisition remains separately
      // reserved: two synthetic daily requests, no ticker/intraday acquisition.
      const empty = await load().generateRecommendations({ ownerUserId: owner,
        sessionType: "midday", scanWindow: "midday", source: "scheduled", scheduledMaxTickers: 0,
        scheduledProviderCreditBudget: load().resolveScheduledScanProviderCreditBudget({ planMode: "free" }),
        scheduledProviderCallPacingMs: 0, scannerInputPolicyVersion: "completed_daily_intraday_input_v1", skipOpenAi: true });
      expect([daily, intraday]).toEqual([2, 0]);
      expect(empty.recommendations).toEqual([]);
      const emptyLog = empty.scan_log as import("@/lib/recommendation-generator").RecommendationScanLogDetails;
      expect(emptyLog.no_publish_reason).toBe("no_raw_candidates");
      expect(emptyLog.candidate_decision_capture?.observed_candidates).toEqual([]);
      expect(emptyLog.real_scanner_candidate_generation?.universe.tickers).toEqual([]);
      expect(emptyLog.real_scanner_candidate_generation?.universe.coverage?.selected_tickers).toBe(0);
      // Remove only local request counters; no source/candidate row is erased.
      daily = 0; intraday = 0;
    }
    // Acquire each history through real scanner/provider/Supabase SDK, within
    // each run's two-credit fixture cap. No raw history is seeded by the test.
    for (const candidate of base) {
      expect(await load().scanMarket([candidate], options)).toHaveLength(1);
      expect((rows.get(candidate.ticker)!.raw as Record<string, unknown>).completed_daily_context).toBeTruthy();
    }
    expect([daily, intraday]).toEqual([8, 8]);
    clock = RealDate.parse("2026-10-01T16:50:00.000Z"); // Old 45min derived cache expired.
    daily = 0; intraday = 0;
    const restarted = load();
    const trace = restarted.createActiveScanTrace({ routeReceivedAt: new FixtureDate().toISOString() });
    const candidates = await restarted.scanMarket(base, { ...options, maxFreshProviderCalls: 6, activeScanTrace: trace });
    expect([daily, intraday]).toEqual([0, 6]);
    expect(candidates).toHaveLength(8);
    expect(trace.trace.market_data_fetch.candidate_observation_summary).toMatchObject({
      summary_version: "scan_provider_candidate_observation_summary_v2",
      expected_candidate_count: 8, fully_observed_candidate_count: 6, total_reserved_credits: 6 });
    for (const candidate of candidates.slice(0, 6)) {
      expect(candidate.latest_close).toBe(105);
      expect(candidate.daily_context_latest_close).toBe(101);
      expect(candidate.reference_price_timestamp).toBe("2026-10-01T16:45:00.000Z");
      expect(candidate.daily_context_evidence?.latest_completed_market_date).toBe("2026-09-30");
      expect(candidate.session_open).toBe(104); // Today's first closed intraday bar, not yesterday's 100.
      expect(candidate.session_high).toBe(106);
      expect(candidate.session_low).toBe(103);
      expect(candidate.recent_range_position).toBe(67);
      expect(candidate.recent_bullish_candles).toBe(5);
      expect(candidate.recent_higher_highs_count).toBe(0);
      expect(candidate.recent_higher_lows_count).toBe(0);
    }
    for (const candidate of candidates.slice(6)) {
      expect(candidate.latest_close).toBeUndefined();
      expect(candidate.intraday_indicators).toBeNull();
      expect(candidate.recent_volume_ratio).toBeUndefined();
      expect(candidate.intraday_indicator_stale).toBe(true);
    }
    expect(trace.trace.market_data_fetch.provider_credit_allocation_shadow).toBeNull();
    const capturedAt = new FixtureDate().toISOString();
    const capture = buildCandidateDecisionCapture({ captureTimestamp: capturedAt,
      universe: base, observedCandidates: candidates, noPublishReason: "no_trade" });
    const run = buildRecommendationScanRun({ trading_date: "2026-10-01", observed_at: capturedAt,
      completed_at: capturedAt, window: "midday", source: "supabase",
      scheduled_scan_run_id: "synthetic_scanner_restart_occurrence",
      scanned_ticker_count: 8, raw_candidate_count: 8 });
    const decision = buildCandidateDecisionRecord({ scanRun: run, capture,
      scoringVersion: "unchanged-local-scoring", buildVersion: "local-synthetic-input-proof" })!;
    expect(capture.capture_version).toBe("candidate_decision_capture_v2");
    expect(decision.record_version).toBe("candidate_decision_record_v4");
    expect(decision.versions.scanner_version).toBe("scanner_v3_completed_daily_intraday_inputs");
    expect(decision.candidates).toHaveLength(8);
    const decidedAt=new RealDate(clock+100).toISOString();
    const completedAt=new RealDate(clock+436).toISOString();
    const explicitCapture={...capture,decision_timestamp:decidedAt,
      decision_clock_version:"pre_publication_decision_clock_v1" as const};
    const explicitRun={...run,completed_at:completedAt};
    const explicitDecision=buildCandidateDecisionRecord({scanRun:explicitRun,capture:explicitCapture,
      scoringVersion:"unchanged-local-scoring",buildVersion:"local-synthetic-input-proof"})!;
    expect(explicitDecision.decision_timestamp).toBe(decidedAt);
    expect(explicitDecision.decision_clock).toEqual({contract_version:"pre_publication_decision_clock_v1",
      input_capture_timestamp:capturedAt,decision_timestamp:decidedAt});
    expect(candidateDecisionRecordFromUnknown(JSON.parse(JSON.stringify(explicitDecision)))).toEqual(explicitDecision);
    // Archives lacking this new clock keep their existing completed-at semantics.
    expect(buildCandidateDecisionRecord({scanRun:explicitRun,capture,
      scoringVersion:"unchanged-local-scoring",buildVersion:"local-synthetic-input-proof"})?.decision_timestamp).toBe(completedAt);
    for(const invalidClock of ["not-a-date",new RealDate(clock-1).toISOString(),new RealDate(clock+437).toISOString()]) {
      expect(()=>buildCandidateDecisionRecord({scanRun:explicitRun,
        capture:{...explicitCapture,decision_timestamp:invalidClock},
        scoringVersion:"unchanged-local-scoring",buildVersion:"local-synthetic-input-proof"})).toThrow("candidate_decision_explicit_clock_invalid");
    }
    expect(()=>buildCandidateDecisionCapture({captureTimestamp:capturedAt,decisionTimestamp:"not-a-date",
      universe:base,observedCandidates:candidates})).toThrow("candidate_decision_explicit_clock_invalid");
    expect(()=>buildCandidateDecisionCapture({captureTimestamp:capturedAt,decisionTimestamp:new RealDate(clock-1).toISOString(),
      universe:base,observedCandidates:candidates})).toThrow("candidate_decision_explicit_clock_invalid");
    expect(()=>buildCandidateDecisionRecord({scanRun:explicitRun,
      capture:{...explicitCapture,decision_clock_version:undefined},
      scoringVersion:"unchanged-local-scoring",buildVersion:"local-synthetic-input-proof"})).toThrow("candidate_decision_explicit_clock_invalid");
    for (const malformedRun of [{...explicitRun,started_at:"not-a-date"}, {...explicitRun,completed_at:"not-a-date"}]) {
      expect(()=>buildCandidateDecisionRecord({scanRun:malformedRun,capture:explicitCapture,
        scoringVersion:"unchanged-local-scoring",buildVersion:"local-synthetic-input-proof"})).toThrow("candidate_decision_explicit_clock_invalid");
    }
    expect(()=>buildCandidateDecisionCapture({captureTimestamp:capturedAt,decisionTimestamp:decidedAt,
      universe:base,observedCandidates:[]})).toThrow("candidate_decision_explicit_clock_invalid");
    expect(decision.candidates.slice(0, 6).every(candidate => candidate.data.freshness === "fresh")).toBe(true);
    const encoded = JSON.parse(JSON.stringify(decision));
    expect(candidateDecisionRecordFromUnknown(encoded)).toEqual(decision);
    const snapshot = encoded.candidates[0].data.input_snapshot;
    expect(snapshot).toMatchObject({ input_policy_version: "completed_daily_intraday_input_v1",
      historical_context: { role: "completed_historical_daily", latest_completed_market_date: "2026-09-30" },
      current_session: { role: "current_regular_session_closed_bars", latest_bar_started_at: "2026-10-01T16:45:00.000Z" },
      features: { latest_close: 105, previous_close: 101, session_open: 104, session_high: 106, session_low: 103 } });
    expect(encoded.candidates.slice(6).every((candidate: { data: { input_snapshot: { current_session: unknown; features: { latest_close: unknown } } } }) =>
      candidate.data.input_snapshot.current_session === null && candidate.data.input_snapshot.features.latest_close === null)).toBe(true);
    expect(isScannerDecisionInputPublishable(snapshot, base[0].ticker, new FixtureDate())).toBe(true);
    expect(isScannerDecisionInputPublishable(snapshot, base[0].ticker, new RealDate("2026-10-01T16:55:00.001Z"))).toBe(false);
    expect(isScannerDecisionInputPublishable(encoded.candidates[7].data.input_snapshot, base[7].ticker, new FixtureDate())).toBe(false);
    expect(isScannerDecisionInputPublishable(snapshot, "OTHER", new FixtureDate())).toBe(false);
    expect(isScannerDecisionInputPublishable(snapshot, base[0].ticker, new RealDate("2026-10-01T16:49:59.000Z"))).toBe(false);
    expect(isScannerDecisionInputPublishable(snapshot, base[0].ticker, new RealDate("2026-10-01T20:00:00.000Z"))).toBe(false);
    const receipt = buildDecisionLineageReceipt(decision);
    const persisted = { ...run, payload_json: { ...run.payload_json,
      candidate_decision_record: encoded, decision_lineage_receipt: JSON.parse(JSON.stringify(receipt)) } };
    expect(candidateDecisionRecordFromScanRun(persisted)).toEqual(decision);
    expect(decisionLineageReceiptFromScanRun(persisted, decision)).toEqual(receipt);
    let expectedScanRunCount = 1;
    const readDurableDecision = async () => {
      const result = await load().readRecommendationLearningBaselineSource(owner);
      expect(result.status).toBe("available");
      if (result.status !== "available") throw new Error("local authoritative readback unavailable");
      expect(result.data.recommendation_scan_runs).toHaveLength(expectedScanRunCount);
      const row = (result.data.recommendation_scan_runs as Record<string, unknown>[]).find(row => row.id === run.id)!;
      expect(row.owner_user_id).toBe(owner);
      const restored = recommendationScanRunFromPersistenceRow(row)!;
      expect(candidateDecisionRecordFromScanRun(restored)).toEqual(decision);
      expect(decisionLineageReceiptFromScanRun(restored, decision)).toEqual(receipt);
    };
    if (database) {
      const runtime = load(), client = runtime.getServerSupabaseClient().client;
      expect((await runtime.persistRecommendationScanRun(persisted, { supabaseClient: client })).status).toBe("saved");
      await readDurableDecision();
      // Duplicate persistence cannot overwrite the original used-feature snapshot.
      const changed = structuredClone(persisted);
      (changed.payload_json.candidate_decision_record as typeof encoded).candidates[0].data.input_snapshot.features.latest_close = 999;
      expect((await runtime.persistRecommendationScanRun(changed, { supabaseClient: client })).status).toBe("saved");
      await readDurableDecision();
      const other = await load().readRecommendationLearningBaselineSource(otherOwner);
      expect(other.status === "available" && other.data.recommendation_scan_runs).toEqual([]);
      expect((await load().readRecommendationLearningBaselineSource("invalid-owner")).status).toBe("unavailable");
      const denied = await originalFetch(database.origin + "/recommendation_scan_runs?select=id");
      expect([401, 403]).toContain(denied.status);
      // The actual generator owns universe selection, scoring and no-trade;
      // neither scanner nor generator internals are substituted. Warm-up is
      // explicitly separate, synthetic setup (sixteen requests, not free data).
      const resumedClock = clock;
      const generatorAt = new RealDate("2026-10-01T17:50:00.000Z");
      const selected = runtime.buildRealScannerBaseCandidateSelection({ scanWindow: "midday",
        requestedScanBudget: 8, selectionMode: "scheduled_rotating", now: generatorAt }).candidates;
      expect(selected).toHaveLength(8);
      daily = 0; intraday = 0;
      for (const candidate of selected) await runtime.scanMarket([candidate], options);
      expect([daily, intraday]).toEqual([8, 8]);
      clock = generatorAt.getTime(); daily = 0; intraday = 0; delayAfterScanner = true;
      const generated = await load().generateRecommendations({ ownerUserId: owner,
        sessionType: "midday", scanWindow: "midday", source: "scheduled", scheduledMaxTickers: 8,
        scheduledProviderCreditBudget: runtime.resolveScheduledScanProviderCreditBudget({ planMode: "free" }),
        scheduledProviderCallPacingMs: 0, scannerInputPolicyVersion: "completed_daily_intraday_input_v1", skipOpenAi: true });
      expect([daily, intraday]).toEqual([2, 6]);
      expect(generated.recommendations).toEqual([]);
      const generatedLog = generated.scan_log as import("@/lib/recommendation-generator").RecommendationScanLogDetails;
      expect(generatedLog.scanner_clock_prior_shadow_comparison ?? null).toBeNull();
      expect(generatedLog.scanner_intraday_liquidity_shadow_comparison ?? null).toBeNull();
      expect(generatedLog.no_publish_reason).toBe("current_session_inputs_expired");
      expect(generatedLog.ranked_candidates_not_published_reason).toContain("versioned current-session inputs expired");
      const generatedCapture = generatedLog.candidate_decision_capture!;
      expect(generatedCapture.capture_version).toBe("candidate_decision_capture_v2");
      expect(generatedCapture.observed_candidates).toHaveLength(8);
      const generatedRun = buildRecommendationScanRun({ trading_date: "2026-10-01",
        observed_at: generatorAt.toISOString(), completed_at: new FixtureDate().toISOString(), window: "midday",
        scheduled_scan_run_id: "synthetic_generator_expiry_occurrence",
        source: "supabase", scanned_ticker_count: 8, raw_candidate_count: 8 });
      const generatedDecision = buildCandidateDecisionRecord({ scanRun: generatedRun, capture: generatedCapture,
        scoringVersion: "unchanged-local-scoring", buildVersion: "local-synthetic-generator-proof" })!;
      expect(generatedDecision.candidates).toHaveLength(8);
      expect(generatedDecision.candidates.filter(candidate => candidate.data.freshness === "fresh")).toHaveLength(0);
      expect(generatedDecision.candidates.every(candidate => candidate.data.freshness === "stale")).toBe(true);
      expect(generatedDecision.final_decision.disposition).toBe("no_trade");
      const generatedEnvelope = { ...generatedRun, payload_json: { ...generatedRun.payload_json,
        candidate_decision_record: generatedDecision, decision_lineage_receipt: buildDecisionLineageReceipt(generatedDecision) } };
      expect((await runtime.persistRecommendationScanRun(generatedEnvelope, { supabaseClient: client })).status).toBe("saved");
      expectedScanRunCount = 2;
      const generatorReadback = await load().readRecommendationLearningBaselineSource(owner);
      expect(generatorReadback.status).toBe("available");
      if (generatorReadback.status !== "available") throw new Error("generator authoritative readback unavailable");
      const generatedRow = (generatorReadback.data.recommendation_scan_runs as Record<string, unknown>[]).find(row => row.id === generatedRun.id)!;
      const generatedRestored = recommendationScanRunFromPersistenceRow(generatedRow)!;
      expect(candidateDecisionRecordFromScanRun(generatedRestored)).toEqual(generatedDecision);
      expect(decisionLineageReceiptFromScanRun(generatedRestored, generatedDecision)).toEqual(buildDecisionLineageReceipt(generatedDecision));
      const publishedRows = await originalFetch(database.origin + "/recommendations?select=id", { headers: { Authorization: `Bearer ${database.token}` } });
      expect(await publishedRows.json()).toEqual([]);
      daily = 0; intraday = 0;
      await expect(load().generateRecommendations({ ownerUserId: owner, sessionType: "midday", scanWindow: "pre_market",
        source: "scheduled", scannerInputPolicyVersion: "completed_daily_intraday_input_v1", skipOpenAi: true })).rejects.toThrow("completed_context_generator_admission_invalid");
      expect([daily, intraday]).toEqual([0, 0]);
      clock = resumedClock;
    }
    for (const mutate of [
      (value: typeof encoded) => { value.versions.scanner_version = "scanner_v2_fresh_cache_before_refresh"; },
      (value: typeof encoded) => { delete value.candidates[0].data.input_snapshot; },
      (value: typeof encoded) => { value.candidates[0].data.input_snapshot.current_session.symbol = "OTHER"; },
      (value: typeof encoded) => { value.candidates[0].data.input_snapshot.historical_context.latest_completed_at = capturedAt; },
      (value: typeof encoded) => { value.candidates[0].data.input_snapshot.current_session.captured_at = "2026-10-01T17:00:00.000Z"; },
      (value: typeof encoded) => { value.candidates[0].data.source_timestamp = "2026-10-01T16:40:00.000Z"; },
      (value: typeof encoded) => { value.candidates[7].data.input_snapshot.features.latest_close = 105; },
      (value: typeof encoded) => { value.candidates[0].data.input_snapshot.historical_context.calendar_fingerprint = "drift"; },
      (value: typeof encoded) => { value.coverage.observed_candidate_count = 6; },
      (value: typeof encoded) => { value.record_version = "candidate_decision_record_v3"; delete value.versions.input_policy_version; },
    ]) {
      const changed = structuredClone(encoded); mutate(changed);
      expect(candidateDecisionRecordFromUnknown(changed)).toBeNull();
    }
    const emptyCapture = buildCandidateDecisionCapture({ captureTimestamp: capturedAt, universe: base,
      observedCandidates: [], inputPolicyVersion: "completed_daily_intraday_input_v1", noPublishReason: "no_trade" });
    const emptyDecision = buildCandidateDecisionRecord({ scanRun: run, capture: emptyCapture,
      scoringVersion: "unchanged-local-scoring", buildVersion: "local-synthetic-input-proof" })!;
    expect(emptyDecision.coverage).toMatchObject({ expected_candidate_count: 8, observed_candidate_count: 0 });
    expect(emptyDecision.candidates.every(candidate => candidate.disposition === "not_evaluated" && candidate.data.input_snapshot === null)).toBe(true);
    expect(candidateDecisionRecordFromUnknown(JSON.parse(JSON.stringify(emptyDecision)))).toEqual(emptyDecision);
    expect(() => buildCandidateDecisionCapture({ captureTimestamp: capturedAt, universe: base,
      observedCandidates: [candidates[0], base[1]] })).toThrow("mixed_or_unknown_input_policy");
    const lateRun = { ...run, completed_at: "2026-10-01T17:06:00.000Z" };
    const lateDecision = buildCandidateDecisionRecord({ scanRun: lateRun, capture,
      scoringVersion: "unchanged-local-scoring", buildVersion: "local-synthetic-input-proof" })!;
    expect(lateDecision.candidates[0].data).toMatchObject({ freshness: "stale", gap_codes: ["provider_data_stale"] });
    expect(candidateDecisionRecordFromUnknown(JSON.parse(JSON.stringify(lateDecision)))).toEqual(lateDecision);
    const publishCapture = { ...capture, published_tickers: [base[0].ticker], eligible_candidate_tickers: [base[0].ticker] };
    expect(() => buildCandidateDecisionRecord({ scanRun: lateRun, capture: publishCapture,
      scoringVersion: "unchanged-local-scoring", buildVersion: "local-synthetic-input-proof" })).toThrow("publication_input_incomplete");
    const originalValue = decision.candidates[0].data.input_snapshot!.features.latest_close;
    candidates[0].latest_close = 999;
    expect(decision.candidates[0].data.input_snapshot!.features.latest_close).toBe(originalValue);
    // Persisted derived fields are not authoritative in the new policy. The
    // exact raw bars and digest must survive restart and drive recomputation.
    const savedRaw = structuredClone(rows.get(base[0].ticker)!.raw) as Record<string, unknown>;
    const cache = savedRaw.intraday_indicator_cache as { indicators: { latestPrice: number } };
    cache.indicators.latestPrice = 777;
    const replaceRaw = async (raw: unknown) => {
      if (database) {
        const response = await originalFetch(database.origin + `/scanner_cache?ticker=eq.${base[0].ticker}`, {
          method: "PATCH", headers: { Authorization: `Bearer ${database.token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ raw }),
        });
        expect(response.ok).toBe(true);
      } else rows.get(base[0].ticker)!.raw = raw;
    };
    await replaceRaw(savedRaw);
    if (database) await readDurableDecision(); // Used features do not change with later mutable-cache contents.
    expect((await load().scanMarket([base[0]], { ...options, maxFreshProviderCalls: 0 }))[0].latest_close).toBe(105);
    const mutatedRaw = structuredClone(savedRaw) as { intraday_indicator_cache: { session_context: { candles: { close: number }[] } } };
    mutatedRaw.intraday_indicator_cache.session_context.candles[0].close = 104;
    await replaceRaw(mutatedRaw);
    expect((await load().scanMarket([base[0]], { ...options, maxFreshProviderCalls: 0 }))[0].latest_close).toBeUndefined();
    mutatedRaw.intraday_indicator_cache.session_context.candles[0].close = 105;
    await replaceRaw(mutatedRaw);
    daily = 0; intraday = 0;
    expect(await load().scanMarket(base, { ...options, maxFreshProviderCalls: 0 })).toHaveLength(8);
    expect([daily, intraday]).toEqual([0, 0]); // Fresh durable cache needs no reservation.
    // The same cache does not expand legacy TTL or its three-refresh cap.
    daily = 0; intraday = 0;
    clock += 3600000;
    await load().scanMarket(base, { source: "scheduled", maxFreshProviderCalls: 6, freshProviderCallPacingMs: 0 });
    expect([daily, intraday]).toEqual([3, 3]);
    // A real nullable numeric column is missing evidence, not numeric zero.
    // Restart the actual scanner/SDK for each read, including genuine SQL NULL
    // round trips in the native fixture. Never spend an unallocated refresh.
    const cacheRow = structuredClone(rows.get(base[0].ticker)!);
    const numericFields = ["latest_close", "ma20", "ma50", "high_20d", "volume_ratio",
      "distance_to_20d_high", "change_5d_percent", "proposed_entry_low", "proposed_entry_high",
      "proposed_stop_loss", "proposed_target_1", "proposed_target_2", "proposed_risk_reward"];
    const patchCacheNumbers = async (patch: Record<string, unknown>) => {
      if (database) {
        const response = await originalFetch(database.origin + `/scanner_cache?ticker=eq.${base[0].ticker}`, {
          method: "PATCH", headers: { Authorization: `Bearer ${database.token}`, "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        expect(response.ok, await response.text()).toBe(true);
      } else Object.assign(rows.get(base[0].ticker)!, patch);
    };
    const noRefresh = { source: "scheduled" as const, maxFreshProviderCalls: 0, freshProviderCallPacingMs: 0 };
    daily = 0; intraday = 0;
    for (const field of numericFields) {
      await patchCacheNumbers({ [field]: null });
      const scanner = load();
      const missingTrace = scanner.createActiveScanTrace({ routeReceivedAt: new FixtureDate().toISOString() });
      const missingCandidates = await scanner.scanMarket([base[0]], { ...noRefresh, activeScanTrace: missingTrace });
      expect(missingCandidates, `${storage}: missing ${field}`).toHaveLength(0);
      expect(missingTrace.trace.market_data_fetch.candidate_observation_summary).toMatchObject({
        expected_candidate_count: 1, rankable_candidate_count: 0,
        not_rankable_candidate_count: 1, total_reserved_credits: 0 });
      const missingAt = new FixtureDate().toISOString();
      const missingRun = buildRecommendationScanRun({ trading_date: "2026-10-01", observed_at: missingAt,
        completed_at: missingAt, window: "midday", source: "supabase",
        scheduled_scan_run_id: `synthetic_missing_cache_${field}`, scanned_ticker_count: 1, raw_candidate_count: 0 });
      const missingDecision = buildCandidateDecisionRecord({ scanRun: missingRun,
        capture: buildCandidateDecisionCapture({ captureTimestamp: missingAt,
          universe: [base[0]], observedCandidates: missingCandidates }),
        scoringVersion: "unchanged-local-scoring", buildVersion: "local-synthetic-input-proof" })!;
      expect(missingDecision.coverage).toMatchObject({ expected_candidate_count: 1, observed_candidate_count: 0 });
      expect(missingDecision.candidates).toHaveLength(1);
      expect(missingDecision.candidates[0]).toMatchObject({ ticker: base[0].ticker, disposition: "not_evaluated" });
      expect(rows.get(base[0].ticker)![field]).toBeNull();
      expect([daily, intraday]).toEqual([0, 0]);
      await patchCacheNumbers({ [field]: cacheRow[field] });
    }
    await patchCacheNumbers({ volume_ratio: 0, distance_to_20d_high: "0", change_5d_percent: 0 });
    expect((await load().scanMarket([base[0]], noRefresh))[0]).toMatchObject({
      volume_ratio: 0, distance_to_20d_high: 0, change_5d_percent: 0 });
    expect([daily, intraday]).toEqual([0, 0]);
    await patchCacheNumbers(Object.fromEntries(numericFields.map(field => [field, cacheRow[field]])));
    if (database) await readDurableDecision(); // Mutable missingness cannot rewrite the sealed original decision.
    clock += 3600000;
    daily = 0; intraday = 0; wrongIntradayIdentity = true;
    const rejected = await load().scanMarket([base[0]], options);
    expect([daily, intraday]).toEqual([0, 1]); // Failed request still consumes its credit.
    expect(rejected[0].latest_close).toBeUndefined();
    expect(rejected[0].intraday_indicator_stale).toBe(true);
    daily = 0; intraday = 0; wrongIntradayIdentity = false; gapIntraday = true;
    expect((await load().scanMarket([base[0]], options))[0].latest_close).toBeUndefined();
    expect([daily, intraday]).toEqual([0, 1]);
    daily = 0; intraday = 0;
    await expect(load().scanMarket(base, { ...options, maxFreshProviderCalls: -1 })).rejects.toThrow("completed_context_credit_cap_invalid");
    expect([daily, intraday]).toEqual([0, 0]);
    const aborted = new AbortController(); aborted.abort();
    await expect(load().scanMarket(base, { ...options, signal: aborted.signal })).rejects.toThrow();
    expect([daily, intraday]).toEqual([0, 0]);
    clock = RealDate.parse("2026-10-01T20:00:00.000Z");
    await expect(load().scanMarket(base, options)).rejects.toThrow("completed_context_current_session_unavailable");
    expect([daily, intraday]).toEqual([0, 0]);
  } finally {
    globalThis.Date = RealDate; globalThis.fetch = originalFetch;
    console.log = originalLog; console.error = originalError;
    for (const [key, value] of saved) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
    database?.cleanup();
  }
});
}
