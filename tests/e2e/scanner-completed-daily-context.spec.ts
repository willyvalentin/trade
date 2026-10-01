import { expect, test } from "@playwright/test";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { createHmac, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import {
  getUsEquityMarketSession,
  usEquityMarketCalendarDataset,
} from "@/lib/us-equity-market-calendar";

// Synthetic CLOSED fixtures. No market data, credentials or production writes.
const at = new Date("2026-10-01T15:50:00.000Z");
function bars(last = "2026-09-30", count = 60) {
  const result = [];
  const day = new Date(`${last}T00:00:00.000Z`);
  while (result.length < count) {
    const date = day.toISOString().slice(0, 10);
    if (getUsEquityMarketSession(date).session_close) {
      result.unshift({ timestamp: day.getTime() / 1000, open: 100, high: 103,
        low: 99, close: 101, volume: 1000 });
    }
    day.setUTCDate(day.getUTCDate() - 1);
  }
  return result;
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
    docker(["exec", "-i", database, "psql", "-X", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-q"],
      "create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;\n" +
      readFileSync("supabase/migrations/20260519000000_create_legacy_baseline_schema_draft.sql", "utf8"));
    const secret = "synthetic-local-postgrest-jwt-fixture-only";
    docker(["run", "-d", "--rm", "--network", network, "--name", rest,
      "-p", "127.0.0.1::3000", "-e", `PGRST_DB_URI=postgres://postgres:postgres@${database}:5432/postgres`,
      "-e", "PGRST_DB_SCHEMAS=public", "-e", "PGRST_DB_ANON_ROLE=anon", "-e", `PGRST_JWT_SECRET=${secret}`,
      "public.ecr.aws/supabase/postgrest:v16.1"]);
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
    "export {scanMarket} from './lib/scanner'; export {createActiveScanTrace} from './lib/active-scan-trace';",
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
      createActiveScanTrace: typeof import("@/lib/active-scan-trace").createActiveScanTrace };
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
  const keys = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_ROLE", "SUPABASE_SERVICE_ROLE_SECRET", "TWELVE_DATA_API_KEY"];
  const saved = keys.map(key => [key, process.env[key]] as const);
  keys.forEach(key => delete process.env[key]);
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://synthetic-history-fixture.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = database?.token ?? "sb_secret_synthetic_local_only";
  process.env.TWELVE_DATA_API_KEY = "synthetic_local_only";
  globalThis.Date = FixtureDate as DateConstructor;
  console.log = () => {}; console.error = () => {};
  const rows = new Map<string, Record<string, unknown>>();
  let daily = 0, intraday = 0, wrongIntradayIdentity = false, gapIntraday = false;
  const base = Array.from({ length: 8 }, (_, i) => ({ ticker: `SYNTH${i}`, company_name: "Synthetic",
    sector: "Synthetic", mock_current_price: 99, mock_trend: "", mock_volume_context: "",
    mock_support: 95, mock_resistance: 108, mock_news_context: "" }));
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init), url = new URL(request.url);
    if (url.origin === "https://synthetic-history-fixture.invalid") {
      expect(url.pathname).toBe("/rest/v1/scanner_cache");
      if (database) {
        // Only the Supabase gateway prefix is removed. Query parsing, JSONB
        // persistence, unique upsert and restart readback run in real PostgREST/PG.
        const path = url.pathname.slice("/rest/v1".length) + url.search;
        const response = await originalFetch(database.origin + path, {
          method: request.method, headers: request.headers,
          ...(request.method !== "GET" ? { body: await request.text() } : {}),
        });
        expect(response.ok, await response.clone().text()).toBe(true);
        const persisted = await originalFetch(database.origin + "/scanner_cache?select=*", {
          headers: { Authorization: `Bearer ${database.token}` } });
        expect(persisted.ok).toBe(true);
        rows.clear();
        for (const row of await persisted.json()) rows.set(row.ticker, row);
        return response;
      }
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
      expect(candidate.intraday_indicator_stale).toBe(true);
    }
    expect(trace.trace.market_data_fetch.provider_credit_allocation_shadow).toBeNull();
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
