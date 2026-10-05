import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";
import { build } from "esbuild";

import { buildDynamicMarketMoversSelection } from "@/lib/dynamic-market-movers";
import { scannerUniverseSelectionToBaseCandidates, selectScannerUniverse } from "@/lib/scanner-universe";

const rotationStart = new Date("2026-09-14T13:30:00.000Z");
const scheduledBudget = 10;

// Exercise the real quote decoder and consumers, mocking only external I/O.
const quoteClock = Date.parse("2026-10-02T15:30:00.000Z");
type QuoteBoundary = {
  lastQuoteAt: unknown;
  price: number;
  calls: number;
  indicators: number;
  commentary: number;
  inserts: Array<Record<string, unknown>>;
  stops: Array<Record<string, unknown>>;
  filters: Array<[string, unknown]>;
  authenticated: boolean;
};
const quoteGlobal = globalThis as typeof globalThis & { __tureQuoteBoundary?: QuoteBoundary };

async function quoteRuntime(entry: string, positionRoute = false) {
  const boundaryModules: Record<string, string> = {
    "@/lib/intraday-indicator-cache": `export const MAX_FRESH_INDICATOR_FETCHES_PER_RUN=2;
      export const POSITION_UPDATE_INDICATOR_MAX_AGE_MINUTES=15;
      export async function getOrRefreshIntradayIndicators(){
        globalThis.__tureQuoteBoundary.indicators++;
        return {indicators:null,source:'unavailable',stale:false,cached_at:null};
      }`,
    "openai": `export default class OpenAI { constructor(){
      globalThis.__tureQuoteBoundary.commentary++; throw new Error('Synthetic commentary boundary');
    } }`,
    "@/lib/supabase-server": `export function getServerSupabaseClient(){
      const state=globalThis.__tureQuoteBoundary;
      const query={eq(key,value){state.filters.push([key,value]);return query},
        select(){return query},maybeSingle:async()=>({data:{id:'synthetic-position'},error:null}),
        then(resolve){return Promise.resolve({data:[{id:'synthetic-position',ticker:'SYNTH',
          entry_price:100,current_stop:95,target_1:120,target_2:130}],error:null}).then(resolve)}};
      return {client:{from(table){return {select:()=>query,
        insert:async(value)=>{state.inserts.push(value);return {error:null}},
        update(value){state.stops.push(value);return query}}}}};
    }`,
    "@/lib/server/application-session": `import {NextResponse} from 'next/server';
      import {evaluateApplicationMutationOrigin} from '@/lib/application-mutation-guard-core';
      export async function requireApplicationSession(){return globalThis.__tureQuoteBoundary.authenticated
        ? {owner_user_id:'synthetic-owner'} : null}
      export function applicationSessionUnauthorizedResponse(){return NextResponse.json({}, {status:401})}
      export function applicationMutationForbiddenResponse(request){
        const result=evaluateApplicationMutationOrigin(request);
        return result.status==='allowed'?null:NextResponse.json({}, {status:403});
      }`,
  };
  const bundle = await build({entryPoints:[resolve(process.cwd(),entry)],bundle:true,write:false,
    platform:"node",format:"cjs",conditions:["react-server"],external:["next/server"],
    plugins:positionRoute?[{name:"quote-external-boundaries",setup(builder){
      builder.onResolve({filter:/^(?:@\/lib\/(?:intraday-indicator-cache|supabase-server|server\/application-session)|openai)$/},
        ({path})=>({path,namespace:"quote-boundary"}));
      builder.onLoad({filter:/.*/,namespace:"quote-boundary"},({path})=>({contents:boundaryModules[path],
        loader:"js",resolveDir:process.cwd()}));
    }}]:[]});
  const loaded = {exports:{}};
  new Function("require","module","exports",bundle.outputFiles[0].text)(
    createRequire(resolve(process.cwd(),"package.json")),loaded,loaded.exports);
  return loaded.exports;
}

async function withQuoteBoundary(run: (state: QuoteBoundary) => Promise<void>) {
  const originalFetch=globalThis.fetch;
  const OriginalDate=Date;
  const originalState=quoteGlobal.__tureQuoteBoundary;
  const keys=["TWELVE_DATA_API_KEY","TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED","OPENAI_API_KEY"];
  const prior=keys.map(key=>process.env[key]);
  const state:QuoteBoundary={lastQuoteAt:quoteClock/1000-1800,price:106,calls:0,indicators:0,
    commentary:0,inserts:[],stops:[],filters:[],authenticated:true};
  quoteGlobal.__tureQuoteBoundary=state;
  globalThis.Date=class extends OriginalDate {
    constructor(value?: string | number){super(value??quoteClock)}
    static now(){return quoteClock}
  } as typeof Date;
  process.env.TWELVE_DATA_API_KEY="synthetic-closed-boundary-only";
  process.env.TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED="true";
  process.env.OPENAI_API_KEY="synthetic-no-provider-call";
  globalThis.fetch=async(input)=>{
    const url=new URL(typeof input==="string"||input instanceof URL?input:input.url);
    expect(url.origin).toBe("https://api.twelvedata.com");
    expect(url.pathname).toBe("/quote");
    expect(url.searchParams.get("symbol")).toBe("SYNTH");
    state.calls++;
    return Response.json({symbol:"SYNTH",close:String(state.price),change:"6",percent_change:"6",
      open:"100",high:"110",low:"98",previous_close:"100",volume:"1000000",
      datetime:"2026-10-02",timestamp:quoteClock/1000,last_quote_at:state.lastQuoteAt});
  };
  try {await run(state)} finally {
    globalThis.fetch=originalFetch;globalThis.Date=OriginalDate;
    quoteGlobal.__tureQuoteBoundary=originalState;
    keys.forEach((key,index)=>{if(prior[index]===undefined)delete process.env[key];else process.env[key]=prior[index]});
  }
}

test("actual quote diagnostics reject stale or absent minute time instead of labeling fetch time fresh",async()=>{
  const runtime=await quoteRuntime("lib/dynamic-movers-discovery.ts") as typeof import("@/lib/dynamic-movers-discovery");
  await withQuoteBoundary(async state=>{
    for(state.lastQuoteAt of [quoteClock/1000-901,undefined,null,"",0,true,-1,1e20,quoteClock/1000+1]){
      const result=await runtime.discoverDynamicMoversDiagnostics({source:"manual",candidates:[{ticker:"SYNTH"}],now:new Date()});
      expect(result.selected_preview_count).toBe(0);
      expect(result.stale_invalid_mover_count).toBe(1);
      expect(result.top_dynamic_movers).toEqual([]);
    }
    for(state.lastQuoteAt of [quoteClock/1000-900,quoteClock/1000-60,quoteClock/1000]){
      const result=await runtime.discoverDynamicMoversDiagnostics({source:"manual",candidates:[{ticker:"SYNTH"}],now:new Date()});
      expect(result.top_dynamic_movers).toHaveLength(1);
      expect(result.top_dynamic_movers[0]).toMatchObject({stale:false,would_have_fresh_price:true,
        freshness_timestamp:new Date(Number(state.lastQuoteAt)*1000).toISOString()});
    }
    expect(state.calls).toBe(12);
    await runtime.discoverDynamicMoversDiagnostics({source:"scheduled",candidates:[{ticker:"SYNTH"}]});
    expect(state.calls).toBe(12);
  });
});

test("actual positions handler refuses unfit quote before indicator, commentary or advisory/stop writes",async()=>{
  const runtime=await quoteRuntime("app/api/positions/update/route.ts",true) as typeof import("@/app/api/positions/update/route");
  await withQuoteBoundary(async state=>{
    const request=(origin="http://localhost")=>new Request("http://localhost/api/positions/update",{method:"POST",headers:{origin}});
    for(state.lastQuoteAt of [quoteClock/1000-901,undefined,null,quoteClock/1000+1]){
      const response=await runtime.POST(request());
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({updates:[],errors:[{position_id:"synthetic-position"}]});
      expect(state.indicators).toBe(0);expect(state.commentary).toBe(0);
      expect(state.inserts).toEqual([]);expect(state.stops).toEqual([]);
    }
    state.lastQuoteAt=quoteClock/1000-60;
    const response=await runtime.POST(request());
    expect((await response.json()).updates[0]).toMatchObject({action:"MOVE_STOP_TO_BREAKEVEN",current_price:106,new_stop:100});
    expect(state.indicators).toBe(1);expect(state.commentary).toBe(1);
    expect(state.inserts).toHaveLength(1);
    expect(state.inserts[0]).toMatchObject({owner_user_id:"synthetic-owner",position_id:"synthetic-position"});
    expect(state.stops).toEqual([{current_stop:100}]);
    expect(state.filters).toContainEqual(["owner_user_id","synthetic-owner"]);
    expect(state.calls).toBe(5);
    expect((await runtime.POST(request("http://wrong-origin"))).status).toBe(403);
    state.authenticated=false;
    expect((await runtime.POST(request())).status).toBe(401);
    expect(state.calls).toBe(5);expect(state.inserts).toHaveLength(1);expect(state.stops).toHaveLength(1);
  });
});

test.describe("dynamic discovery admission", () => {
  test("retains fetched movers but selects none when their allocated budget is zero", () => {
    for (const limits of [
      { selectedBudget: 0 },
      { selectedBudget: scheduledBudget, dynamicBudgetShare: 0 },
      { selectedBudget: scheduledBudget, maxDynamicTickers: 0 },
      { selectedBudget: scheduledBudget, maxDynamicTickers: -1 },
      { selectedBudget: scheduledBudget, maxDynamicTickers: 0.5 },
    ]) {
      const selection = buildDynamicMarketMoversSelection({
        scanWindow: "midday",
        ...limits,
        now: rotationStart,
        providerResult: {
          provider: "synthetic_closed_fixture",
          status: "available",
          fetched_at: rotationStart.toISOString(),
          movers: [{ ticker: "NEWM", source: "top_gainer", tradable: true }],
        },
      });

      expect(selection.fetched_movers.map((mover) => mover.ticker)).toEqual(["NEWM"]);
      expect(selection.selected_movers).toEqual([]);
      expect(selection.summary).toMatchObject({
        fetched_count: 1,
        selected_count: 0,
        selected_tickers: [],
        budget_limit: 0,
      });
    }
  });

  test("keeps malformed and fractional dynamic caps inside the allocated whole slots", () => {
    for (const [maxDynamicTickers, expectedCount] of [
      [1, 1], [2.9, 2], [100, 4], [Number.NaN, 4], [Number.POSITIVE_INFINITY, 4],
    ]) {
      const selection = buildDynamicMarketMoversSelection({
        scanWindow: "midday",
        selectedBudget: scheduledBudget,
        maxDynamicTickers,
        now: rotationStart,
        providerResult: {
          provider: "synthetic_closed_fixture",
          status: "available",
          fetched_at: rotationStart.toISOString(),
          movers: Array.from({ length: 25 }, (_, index) => ({
            ticker: `MOVER${index}`,
            source: "top_gainer" as const,
            source_rank: index + 1,
            tradable: true,
          })),
        },
      });
      expect(selection.fetched_movers).toHaveLength(25);
      expect(selection.selected_movers).toHaveLength(expectedCount);
      expect(selection.summary.budget_limit).toBe(expectedCount);
    }
  });

  test("applies the current allow/block lists to an already selected dynamic population", () => {
    const dynamicMovers = buildDynamicMarketMoversSelection({
      scanWindow: "midday",
      selectedBudget: scheduledBudget,
      now: rotationStart,
      providerResult: {
        provider: "synthetic_closed_fixture",
        status: "available",
        fetched_at: rotationStart.toISOString(),
        movers: ["DROP", "OUTSIDE", "NEWM"].map((ticker, index) => ({
          ticker,
          source: "top_gainer" as const,
          source_rank: index + 1,
          tradable: true,
        })),
      },
    });
    const originalSelection = structuredClone(dynamicMovers);
    const selection = selectScannerUniverse({
      scanWindow: "midday",
      requestedScanBudget: scheduledBudget,
      dynamicMovers,
      riskControlsSettings: {
        allowed_tickers: [" drop ", "newm", "aapl"],
        blocked_tickers: ["drop"],
      },
      now: rotationStart,
    });

    expect(scannerUniverseSelectionToBaseCandidates(selection).map((candidate) => candidate.ticker))
      .toEqual(["NEWM", "AAPL"]);
    expect(selection.coverage_summary).toMatchObject({
      selected_ticker_symbols: ["NEWM", "AAPL"],
      selected_tickers: 2,
      dynamic_mover_selected_count: 1,
      dynamic_mover_source_breakdown: { top_gainer: 1 },
      scan_budget: { effective_tickers: scheduledBudget, selected_tickers: 2 },
      risk_controls: { allowed_tickers_matched: 3, blocked_tickers_removed: 1 },
    });
    // The upstream receipt is retained, not rewritten to erase excluded inputs.
    expect(dynamicMovers).toEqual(originalSelection);
    expect(selection.coverage_summary.dynamic_movers?.selected_tickers)
      .toEqual(["DROP", "OUTSIDE", "NEWM"]);
    expect(Object.values(selection.coverage_summary.dynamic_mover_source_breakdown)
      .reduce((total, count) => total + count, 0)).toBe(1);

    for (const window of ["midday", "closed", "unknown"] as const) {
      const empty = selectScannerUniverse({
        scanWindow: window,
        requestedScanBudget: window === "midday" ? 0 : scheduledBudget,
        dynamicMovers,
        now: rotationStart,
      });
      expect(empty.selected_tickers).toEqual([]);
      expect(Object.values(empty.coverage_summary.dynamic_mover_source_breakdown)
        .reduce((total, count) => total + count, 0)).toBe(0);
      expect(empty.coverage_summary.dynamic_movers).toEqual(dynamicMovers.summary);
    }
  });
});

test("scheduled generation cannot spend unreserved dynamic-mover quote credits", async () => {
  const directory = mkdtempSync(resolve(tmpdir(), "ture-scheduled-movers-"));
  const output = resolve(directory, "dynamic-movers.cjs");
  const priorEnabled = process.env.TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED;
  const priorKey = process.env.TWELVE_DATA_API_KEY;
  const quoteCounter = globalThis as typeof globalThis & {
    __tureMoverQuoteCalls?: number;
  };

  try {
    await build({
      entryPoints: [resolve(process.cwd(), "lib/dynamic-movers-discovery.ts")],
      outfile: output,
      bundle: true,
      platform: "node",
      format: "cjs",
      conditions: ["react-server"],
      plugins: [
        {
          name: "no-provider-test-double",
          setup(builder) {
            builder.onResolve(
              { filter: /^@\/lib\/market-data$/ },
              () => ({ path: "market-data", namespace: "test-double" }),
            );
            builder.onLoad(
              { filter: /^market-data$/, namespace: "test-double" },
              () => ({
                contents: `export async function getQuote() {
                  globalThis.__tureMoverQuoteCalls += 1;
                  return {
                    current_price: 102, open: 100, previous_close: 99,
                    high: 103, low: 98, percent_change: 3, volume: 1000000
                  };
                }`,
                loader: "js",
              }),
            );
          },
        },
      ],
    });

    const runtime = (await import(pathToFileURL(output).href)) as {
      discoverDynamicMoversDiagnostics: (input: {
        source: "manual" | "scheduled";
        candidates: Array<{ ticker: string }>;
      }) => Promise<{
        discovery_enabled: boolean;
        provider_attempted: string | null;
        provider_error_type: string;
        returned_count: number;
      }>;
    };
    quoteCounter.__tureMoverQuoteCalls = 0;
    process.env.TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED = "true";
    process.env.TWELVE_DATA_API_KEY = "test-only-never-used";

    const scheduled = await runtime.discoverDynamicMoversDiagnostics({
      source: "scheduled",
      candidates: [{ ticker: "AAPL" }, { ticker: "MSFT" }],
    });
    expect(scheduled).toMatchObject({
      discovery_enabled: false,
      provider_attempted: null,
      provider_error_type: "disabled",
      returned_count: 0,
    });
    expect(quoteCounter.__tureMoverQuoteCalls).toBe(0);

    const manual = await runtime.discoverDynamicMoversDiagnostics({
      source: "manual",
      candidates: [{ ticker: "AAPL" }],
    });
    expect(manual).toMatchObject({
      discovery_enabled: true,
      provider_attempted: "twelve_data",
      returned_count: 1,
    });
    expect(quoteCounter.__tureMoverQuoteCalls).toBe(1);

    const generator = readFileSync(
      resolve(process.cwd(), "lib/recommendation-generator.ts"),
      "utf8",
    );
    expect(generator).toMatch(
      /discoverDynamicMoversDiagnostics\(\{\s*source,\s*candidates: scannerBaseCandidates/,
    );
  } finally {
    if (priorEnabled === undefined) {
      delete process.env.TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED;
    } else {
      process.env.TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED = priorEnabled;
    }
    if (priorKey === undefined) {
      delete process.env.TWELVE_DATA_API_KEY;
    } else {
      process.env.TWELVE_DATA_API_KEY = priorKey;
    }
    delete quoteCounter.__tureMoverQuoteCalls;
    rmSync(directory, { recursive: true, force: true });
  }
});
