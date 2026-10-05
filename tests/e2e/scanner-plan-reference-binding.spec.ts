import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";
import type { ScannerCandidate } from "@/lib/scanner";

import {
  bindScannerPlanReference,
  SCANNER_PLAN_REFERENCE_BINDING_VERSION,
} from "@/lib/scanner-plan-reference-binding";

const fallback = {
  reference_price_used_for_plan: 99,
  reference_price_source: "scanner_candidate_latest_close",
  reference_price_timestamp: "2026-09-29T00:00:00.000Z",
  reference_price_provider: "twelve_data",
  reference_price_read_path: "scanner_candidate.latest_close",
};

type PlanFields = { entry_low:number; entry_high:number; stop_loss:number;
  target_1:number; target_2:number; risk_reward:number };
type GeneratorPlanTestApi = {
  buildDeterministicLearningRecommendations:(input:unknown)=>{
    recommendations:(PlanFields & Record<string,unknown>)[]; skippedReasons:string[] };
  sanitizeRecommendations:(recommendations:unknown[],candidates:unknown[],sessionType:string,
    scanWindow:string,source:string,maxRecommendations:number,powerHourTrial:boolean)=>{
      recommendations:(PlanFields & Record<string,unknown>)[]; skippedReasons:string[] };
};
let generatorPlanTestApi:Promise<GeneratorPlanTestApi> | undefined;
function loadActualGeneratorPlanFunctions() {
  return generatorPlanTestApi ??= (async () => {
    // Export the actual private functions only from this in-memory test bundle.
    // No replacement scanner, planner, sanitizer, SDK or persistence component.
    const root=process.cwd();
    const bundle=await build({stdin:{resolveDir:resolve(root,"lib"),loader:"ts",
      contents:readFileSync(resolve(root,"lib/recommendation-generator.ts"),"utf8")+
        "\nexport { buildDeterministicLearningRecommendations, sanitizeRecommendations };"},
      absWorkingDir:root,bundle:true,write:false,platform:"node",format:"cjs",conditions:["react-server"]});
    const loaded={exports:{}};
    new Function("require","module","exports",bundle.outputFiles[0].text)(
      createRequire(resolve(root,"package.json")),loaded,loaded.exports);
    return loaded.exports as GeneratorPlanTestApi;
  })();
}
function originalPlanCandidate():ScannerCandidate & Record<string,unknown> {
  const price=236.8;
  return { ticker:"NVDA",company_name:"Synthetic NVDA",sector:"Synthetic",
    mock_current_price:price,mock_trend:"",mock_volume_context:"",mock_support:223.79,
    mock_resistance:262.24,mock_news_context:"",latest_close:price,
    scanner_input_policy_version:"completed_daily_intraday_input_v1",
    proposed_entry_low:234.43,proposed_entry_high:239.17,proposed_stop_loss:223.79,
    proposed_target_1:262.24,proposed_target_2:273.77,proposed_risk_reward:2.25,
    intraday_indicators:{latestPrice:price,latestCandleTimestamp:new Date(Date.now()-120000).toISOString()},
    intraday_indicator_source:"fresh",intraday_indicator_stale:false,
    local_score:85,local_score_reasons:["Synthetic original support"],local_score_warnings:[],
    local_score_breakdown:{trend:20,momentum:15,volume:10,riskReward:20,marketRegime:10,timing:10},
    setup_type:"UNKNOWN",setup_type_label:"Unknown",setup_type_description:"Synthetic" } as unknown as ScannerCandidate & Record<string,unknown>;
}
function buildActualPlan(api:GeneratorPlanTestApi,candidate:ScannerCandidate) {
  return api.buildDeterministicLearningRecommendations({candidates:[candidate],rankingSummary:{results:[]},
    scanWindow:"midday_scan",source:"scheduled",maxRecommendations:1,powerHourTrial:false});
}

test("actual completed-input fallback retains the original support plan while legacy fallback stays percentage-based", async () => {
  const api=await loadActualGeneratorPlanFunctions(), candidate=originalPlanCandidate();
  const original=structuredClone(candidate);
  const actual=buildActualPlan(api,candidate);
  expect(actual.recommendations).toHaveLength(1);
  expect(actual.recommendations[0]).toMatchObject({entry_low:234.43,entry_high:239.17,stop_loss:223.79,
    target_1:262.24,target_2:273.77,risk_reward:2.25});
  const legacy={...candidate,scanner_input_policy_version:undefined};
  const old=buildActualPlan(api,legacy);
  expect(old.recommendations[0]).toMatchObject({entry_low:234.43,entry_high:239.17,stop_loss:227.33,
    target_1:256.93,target_2:265.81,risk_reward:2.25});
  expect(candidate).toEqual(original);
});

test("actual publication sanitizer rejects every changed original plan field, including sub-cent aliases", async () => {
  const api=await loadActualGeneratorPlanFunctions(),candidate=originalPlanCandidate();
  const recommendation=buildActualPlan(api,candidate).recommendations[0];
  const sanitize=(row:unknown,c=candidate)=>api.sanitizeRecommendations([row],[c],"midday","midday_scan","scheduled",1,false);
  const accepted=sanitize(recommendation);
  expect(accepted.recommendations).toHaveLength(1);
  expect(accepted.recommendations[0].reason_to_avoid).toContain("completed_input_original_plan_binding_v1");
  for(const field of ["entry_low","entry_high","stop_loss","target_1","target_2","risk_reward"] as const) {
    for(const delta of [0.01,0.0001]) {
      const rejected=sanitize({...recommendation,[field]:recommendation[field]+delta});
      expect(rejected.recommendations,`${field} + ${delta}`).toEqual([]);
      expect(rejected.skippedReasons[0]).toContain("original completed-input plan");
    }
  }
  const original=structuredClone(candidate);
  expect(sanitize({...recommendation,stop_loss:227.33,target_1:256.93,target_2:265.81},
    {...candidate,scanner_input_policy_version:undefined}).recommendations).toHaveLength(1);
  expect(candidate).toEqual(original);
});

test("actual completed-input fallback cannot invent absent plans or publish weak, invalid or stale original evidence", async () => {
  const api=await loadActualGeneratorPlanFunctions(),candidate=originalPlanCandidate();
  for(const field of ["proposed_entry_low","proposed_entry_high","proposed_stop_loss",
    "proposed_target_1","proposed_target_2","proposed_risk_reward"]) {
    for(const value of [undefined,null,NaN,Infinity,"223.79"]) {
      expect(buildActualPlan(api,{...candidate,[field]:value}).recommendations,`${field}: ${value}`).toEqual([]);
    }
  }
  for(const patch of [{proposed_stop_loss:235},{proposed_target_2:260},{proposed_risk_reward:1.49},
    {intraday_indicator_stale:true},{intraday_indicators:{latestPrice:236.8}},
    {intraday_indicators:{latestPrice:236.8,latestCandleTimestamp:new Date(Date.now()+1000).toISOString()}}]) {
    expect(buildActualPlan(api,{...candidate,...patch} as ScannerCandidate).recommendations).toEqual([]);
  }
  const recommendation=buildActualPlan(api,candidate).recommendations[0];
  expect(api.sanitizeRecommendations([recommendation],[{...candidate,intraday_indicator_stale:true}],
    "midday","midday_scan","scheduled",1,false).recommendations).toEqual([]);
});

test.describe("scanner plan reference binding", () => {
  test("binds a fresh intraday price and its underlying market timestamp", () => {
    expect(SCANNER_PLAN_REFERENCE_BINDING_VERSION).toBe(
      "scanner_plan_reference_binding_v2",
    );
    expect(
      bindScannerPlanReference({
        fallback,
        intraday: {
          source: "fresh",
          stale: false,
          latest_price: 101.25,
          latest_candle_timestamp: "2026-09-29T14:35:00.000Z",
        },
      }),
    ).toEqual({
      reference_price_used_for_plan: 101.25,
      reference_price_source: "scanner_candidate_intraday_latest_price",
      reference_price_timestamp: "2026-09-29T14:35:00.000Z",
      reference_price_provider: "twelve_data",
      reference_price_read_path:
        "scanner_candidate.intraday_indicators.latestPrice",
    });
  });

  test("retains the daily fallback for stale, unavailable, invalid or missing intraday evidence", () => {
    const rejected = [
      {
        source: "cache" as const,
        stale: true,
        latest_price: 101.25,
        latest_candle_timestamp: "2026-09-29T14:35:00.000Z",
      },
      {
        source: "unavailable" as const,
        stale: false,
        latest_price: 101.25,
        latest_candle_timestamp: "2026-09-29T14:35:00.000Z",
      },
      {
        source: "fresh" as const,
        stale: false,
        latest_price: 0,
        latest_candle_timestamp: "2026-09-29T14:35:00.000Z",
      },
      {
        source: "fresh" as const,
        stale: false,
        latest_price: 101.25,
        latest_candle_timestamp: null,
      },
    ];

    for (const intraday of rejected) {
      expect(bindScannerPlanReference({ fallback, intraday })).toEqual(fallback);
    }
  });

  test("normalizes an offset timestamp before binding it", () => {
    expect(
      bindScannerPlanReference({
        fallback,
        intraday: {
          source: "cache",
          stale: false,
          latest_price: 101.25,
          latest_candle_timestamp: "2026-09-29T10:35:00-04:00",
        },
      }).reference_price_timestamp,
    ).toBe("2026-09-29T14:35:00.000Z");
  });

  test("scanner applies the binding after stale-safe intraday normalization", () => {
    const scanner = readFileSync(resolve(process.cwd(), "lib/scanner.ts"), "utf8");
    const originalClock = scanner.indexOf(
      "const indicatorObservedAtMs = completedContextMode",
    );
    const originalNormalization = scanner.indexOf(
      "const originalIndicators = indicatorObservedAtMs !== undefined && result.session_context",
      originalClock,
    );
    const volumeClock = scanner.indexOf(
      "const volumeObservedAtMs = indicatorObservedAtMs !== undefined ? Date.now() : undefined",
      originalNormalization,
    );
    const normalization = scanner.indexOf(
      "const intradayIndicators = originalIndicators",
      originalNormalization,
    );
    const staleSafeNormalization = scanner.indexOf(
      "withAdmissibleRecentIntradayVolume(originalIndicators, result.stale,",
      normalization,
    );
    const binding = scanner.indexOf("const planReference = bindScannerPlanReference");
    const spread = scanner.indexOf("...planReference", binding);

    expect(originalClock).toBeGreaterThan(-1);
    expect(originalNormalization).toBeGreaterThan(originalClock);
    expect(volumeClock).toBeGreaterThan(originalNormalization);
    expect(normalization).toBeGreaterThan(volumeClock);
    expect(staleSafeNormalization).toBeGreaterThan(normalization);
    expect(binding).toBeGreaterThan(staleSafeNormalization);
    expect(spread).toBeGreaterThan(binding);
    expect(scanner.slice(originalClock, originalNormalization)).toContain(
      "completedContextMode && !result.stale && result.session_context",
    );
    expect(scanner.slice(originalNormalization, volumeClock)).toContain(
      "observedAtSeconds: indicatorObservedAtMs / 1000",
    );
    expect(scanner.slice(staleSafeNormalization, binding)).toContain(
      "volumeObservedAtMs !== undefined ? volumeObservedAtMs / 1000 : undefined",
    );
    expect(scanner.slice(binding, spread)).toContain(
      "intradayIndicators?.latestCandleTimestamp",
    );
  });
});

test("real scanner cache read never substitutes write time for missing market time", async () => {
  const root = process.cwd();
  const bundled = await build({
    stdin: {
      contents: "export {scanMarket} from './lib/scanner'; export {resolvePlanReferencePriceMetadata} from './lib/recommendation-plan-reference'; export {calculateIntradayIndicators} from './lib/intraday-indicators';",
      resolveDir: root,
      loader: "ts",
    },
    absWorkingDir: root, bundle: true, write: false, platform: "node", format: "cjs",
    external: ["@supabase/supabase-js"],
    plugins: [{ name: "server-only-marker", setup(builder) {
      builder.onResolve({ filter: /^server-only$/ }, () => ({ path: "server-only", namespace: "marker" }));
      builder.onLoad({ filter: /.*/, namespace: "marker" }, () => ({ contents: "", loader: "js" }));
    } }],
  });
  const load = () => {
    const loaded = { exports: {} };
    new Function("require", "module", "exports", bundled.outputFiles[0].text)(
      createRequire(resolve(root, "package.json")), loaded, loaded.exports,
    );
    return loaded.exports as {
      scanMarket: typeof import("@/lib/scanner").scanMarket;
      resolvePlanReferencePriceMetadata: typeof import("@/lib/recommendation-plan-reference").resolvePlanReferencePriceMetadata;
      calculateIntradayIndicators: typeof import("@/lib/intraday-indicators").calculateIntradayIndicators;
    };
  };
  const RealDate = globalThis.Date;
  const observedAt = RealDate.parse("2026-10-01T15:50:00.000Z");
  class FixtureDate extends RealDate {
    constructor(value?: string | number | Date) {
      super(value instanceof RealDate ? value.getTime() : value ?? observedAt);
    }
    static now() { return observedAt; }
  }
  const originalFetch = globalThis.fetch;
  const originalLog = console.log;
  const keys = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_ROLE", "SUPABASE_SERVICE_ROLE_SECRET"];
  const saved = keys.map(key => [key, process.env[key]] as const);
  keys.forEach(key => delete process.env[key]);
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://synthetic-cache-fixture.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_synthetic_local_only";
  globalThis.Date = FixtureDate as DateConstructor;
  console.log = () => {};
  try {
    const cases: {
      name: string; timestamp: string | null | undefined;
      expected: string | null; accepted: boolean;
      cacheOverride?: Record<string, unknown>; rejectedCache?: boolean;
    }[] = [
      { name: "missing", timestamp: undefined, expected: null, accepted: false },
      { name: "null", timestamp: null, expected: null, accepted: false },
      { name: "invalid", timestamp: "not-market-time", expected: null, accepted: false },
      { name: "old daily", timestamp: "2026-10-01T00:00:00.000Z", expected: "2026-10-01T00:00:00.000Z", accepted: false },
      { name: "future", timestamp: "2026-10-01T15:51:00.000Z", expected: "2026-10-01T15:51:00.000Z", accepted: false },
      { name: "real source time", timestamp: "2026-10-01T15:49:00.000Z", expected: "2026-10-01T15:49:00.000Z", accepted: true },
      { name: "fresh intraday rescue", timestamp: undefined, expected: "2026-10-01T15:45:00.000Z", accepted: true },
      ...["latest_close", "ma20", "ma50", "high_20d", "volume_ratio",
        "distance_to_20d_high", "change_5d_percent", "proposed_entry_low",
        "proposed_entry_high", "proposed_stop_loss", "proposed_target_1",
        "proposed_target_2", "proposed_risk_reward"].map(field => ({
          name: `missing numeric cache field: ${field}`,
          timestamp: "2026-10-01T15:49:00.000Z", expected: null, accepted: false,
          cacheOverride: { [field]: null }, rejectedCache: true,
        })),
      ...["", "  ", false, [], "not-numeric"].map(value => ({
        name: `invalid numeric cache field: ${JSON.stringify(value)}`,
        timestamp: "2026-10-01T15:49:00.000Z", expected: null, accepted: false,
        cacheOverride: { proposed_entry_low: value }, rejectedCache: true,
      })),
      { name: "valid zero metrics and numeric strings",
        timestamp: "2026-10-01T15:49:00.000Z", expected: "2026-10-01T15:49:00.000Z", accepted: true,
        cacheOverride: { latest_close: "99", proposed_entry_low: "98", proposed_target_1: "108",
          volume_ratio: 0, distance_to_20d_high: "0", change_5d_percent: 0 } },
    ];
    for (const [index, scenario] of cases.entries()) {
      const actual = load(); // Isolate the real indicator memory cache per case.
      const ticker = `SYNTH${index}`;
      const raw: Record<string, unknown> = {
        scanner_values: { reference_price_timestamp: scenario.timestamp },
      };
      if (scenario.name === "fresh intraday rescue") {
        const candles = Array.from({ length: 6 }, (_, candleIndex) => ({
          timestamp: observedAt / 1000 - (6 - candleIndex) * 300,
          open: 100, high: 102, low: 99, close: 101.25, volume: 1000,
        }));
        raw.intraday_indicator_cache = {
          cached_at: "2026-10-01T15:49:00.000Z", interval: "5min",
          indicators: actual.calculateIntradayIndicators(candles, {
            interval: "5min", observedAtSeconds: observedAt / 1000,
          }),
        };
      }
      const row = {
        ticker, updated_at: "2026-10-01T15:49:00.000Z",
        latest_close: 99, ma20: 98, ma50: 97, high_20d: 105, volume_ratio: 1,
        distance_to_20d_high: 5.71, change_5d_percent: 2,
        proposed_entry_low: 98, proposed_entry_high: 100, proposed_stop_loss: 95,
        proposed_target_1: 108, proposed_target_2: 112, proposed_risk_reward: 2.4,
        trend_context: "Synthetic history", volume_context: "Synthetic volume", raw,
        ...scenario.cacheOverride,
      };
      let reads = 0;
      globalThis.fetch = async (input, init) => {
        const request = new Request(input, init);
        const url = new URL(request.url);
        expect(url.origin).toBe("https://synthetic-cache-fixture.invalid");
        expect(url.pathname).toBe("/rest/v1/scanner_cache");
        expect(request.method).toBe("GET");
        expect(++reads).toBe(1);
        return new Response(JSON.stringify([row]), { headers: { "Content-Type": "application/json" } });
      };
      const candidates = await actual.scanMarket([{
        ticker, company_name: "Synthetic", sector: "Synthetic", mock_current_price: 99,
        mock_trend: "", mock_volume_context: "", mock_support: 95,
        mock_resistance: 108, mock_news_context: "",
      }], { source: "scheduled", maxFreshProviderCalls: 0, freshProviderCallPacingMs: 0 });
      expect(reads).toBe(1);
      if (scenario.rejectedCache) {
        expect(candidates, scenario.name).toHaveLength(0);
        continue;
      }
      expect(candidates).toHaveLength(1);
      if (scenario.cacheOverride) {
        expect(candidates[0]).toMatchObject({ latest_close: 99, proposed_entry_low: 98,
          proposed_target_1: 108, volume_ratio: 0, distance_to_20d_high: 0, change_5d_percent: 0 });
      }
      expect(candidates[0].reference_price_timestamp, scenario.name).toBe(scenario.expected);
      const metadata = actual.resolvePlanReferencePriceMetadata(candidates[0], {
        enforceFreshness: true, now: new FixtureDate(),
      });
      expect(metadata.reference_price_used_for_plan !== null, scenario.name).toBe(scenario.accepted);
      if (scenario.name === "fresh intraday rescue") {
        expect(metadata.reference_price_used_for_plan).toBe(101.25);
        expect(candidates[0].intraday_indicator_stale).toBe(false);
      } else {
        expect(candidates[0].intraday_indicator_source).toBe("unavailable");
      }
    }
  } finally {
    globalThis.Date = RealDate;
    globalThis.fetch = originalFetch;
    console.log = originalLog;
    for (const [key, value] of saved) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
