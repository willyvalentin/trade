// CLOSED proof: packaged scheduler -> real route -> real PostgREST/Postgres ->
// production receipt parser/readback. Auth/calendar inputs are synthetic; no
// external market provider, production database or broker may be contacted.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build, buildSync } from "esbuild";
import { setTimeout as syntheticDelay } from "node:timers/promises";

const root = process.cwd();
const cold = process.argv.includes("--cold");
const rotationDay = process.argv.includes("--rotation-day");
const benchmarkReuse = process.argv.includes("--benchmark-reuse");
const mixedHistory = process.argv.includes("--mixed-history");
const invalidMixedHistory = process.argv.includes("--mixed-history-invalid");
const acquisitionBaseline = process.argv.includes("--acquisition-baseline");
const minimumOrderBaseline = process.argv.includes("--minimum-order-baseline");
const firstObservationBaseline = process.argv.includes("--first-observation-baseline");
const firstObservationBaselineRevision = "e54c9cf36baf31d5548e307fc7ff7b2c5c06a5a7";
const fairOrderBaseline = process.argv.includes("--fair-order-baseline");
const fairOrderBaselineRevision = "bdb3da00";
const minimumOrderBaselineRevision = "6726ba67a9aaa276bfa9cfde7b246354bebcf872";
const acquisitionBaselineRevision = "43fa089e2c7410f10834e148179dda1564765e46";
assert(!mixedHistory || benchmarkReuse && !cold);
assert(!acquisitionBaseline || mixedHistory || rotationDay);
assert(!minimumOrderBaseline || (mixedHistory || rotationDay) && !acquisitionBaseline);
assert(!firstObservationBaseline || rotationDay && !acquisitionBaseline && !minimumOrderBaseline);
assert(!fairOrderBaseline || rotationDay && !acquisitionBaseline && !minimumOrderBaseline && !firstObservationBaseline);
assert(!invalidMixedHistory || mixedHistory && !acquisitionBaseline);
const invalidBenchmarkReuse = process.argv.includes("--benchmark-reuse-invalid");
const baselineBenchmarkReuse = process.argv.includes("--benchmark-reuse-baseline");
// Branch ancestor with the exact verified predecessor tree 640df041; unlike
// the original local cherry-pick source, this commit travels with this branch.
const reuseBaselineRevision = "92374a300f986a4241ba41a1a35a83b5335caf2e";
assert(!(invalidBenchmarkReuse && baselineBenchmarkReuse) &&
  (!(invalidBenchmarkReuse || baselineBenchmarkReuse) || benchmarkReuse));
const wrongPolicy = process.argv.includes("--wrong-policy");
const diagnoseOutcomes = process.argv.includes("--diagnose-outcomes");
const relativePlan60m = process.argv.includes("--relative-plan-60m");
assert(!relativePlan60m || diagnoseOutcomes && !process.argv.includes("--opening") && !wrongPolicy,
  "Mature relative-plan outcomes require their own unchanged original-input CLOSED scenario");
const opening = process.argv.includes("--opening");
const closing = process.argv.includes("--closing");
assert(!closing || cold && !opening && !wrongPolicy && !diagnoseOutcomes,
  "Closing analysis is one isolated cold input path, not outcome/forward acceptance");
const publicationClock = process.argv.includes("--publication-clock");
const contextLatency = process.argv.includes("--context-latency");
const contextBudgetTimeout = process.argv.includes("--context-budget-timeout");
const staleBenchmark = process.argv.includes("--benchmark-stale");
const partialBenchmark = process.argv.includes("--benchmark-partial");
assert(!(staleBenchmark && partialBenchmark) && (!(staleBenchmark || partialBenchmark) ||
  cold && !wrongPolicy && !opening && !closing && !diagnoseOutcomes && !contextLatency),
  "Benchmark fitness is one isolated cold original-input scenario");
const scannerRateLimit = process.argv.includes("--scanner-rate-limit");
const expectContextTimeout = process.argv.includes("--expect-context-timeout") || contextBudgetTimeout;
assert(!contextLatency || publicationClock && cold,
  "Context latency exercises the isolated normal cold publication path");
assert(!expectContextTimeout || contextLatency);
assert(!scannerRateLimit || contextLatency && !expectContextTimeout);
const benchmarkDelayMs = contextBudgetTimeout || scannerRateLimit ? 30000 : 9000;
assert(!publicationClock || cold && !opening && !wrongPolicy && !diagnoseOutcomes,
  "Publication clock proof is one isolated cold normal scanner path");
assert(!opening || cold, "Opening proof has no pre-session warm-history acquisition");
const slot = rotationDay ? "2026-10-01T13:30:00.000Z" : closing ? "2026-10-01T19:45:00.000Z" : opening ? "2026-10-01T13:45:00.000Z" : "2026-10-01T17:30:00.000Z";
const expiry = rotationDay ? "2026-10-01T20:00:00.000Z" : new Date(Date.parse(slot) + 900000).toISOString();
const nextSlot = new Date(Date.parse(expiry) + 900000).toISOString();
const futureBoundary = new Date(Date.parse(slot) + (relativePlan60m ? 4500000 : 1800000)).toISOString();
const zeroLatestVolume = process.argv.includes("--zero-latest-volume");
assert(!zeroLatestVolume || cold && !wrongPolicy, "Zero-volume proof requires the cold valid-input scenario");
const missingLatestVolume = process.argv.includes("--missing-latest-volume");
assert(!missingLatestVolume || cold && !wrongPolicy && !zeroLatestVolume && !diagnoseOutcomes,
  "Missing-volume proof requires its own cold acquisition scenario");
assert(!benchmarkReuse || !wrongPolicy && !opening && !closing && !diagnoseOutcomes &&
  !publicationClock && !contextLatency && !staleBenchmark && !partialBenchmark && !zeroLatestVolume && !missingLatestVolume,
  "Benchmark reuse is a separately frozen cold/warm two-slot acquisition proof");
assert(!rotationDay || cold && !benchmarkReuse && !mixedHistory && !invalidMixedHistory &&
  !wrongPolicy && !opening && !closing && !diagnoseOutcomes && !publicationClock &&
  !contextLatency && !staleBenchmark && !partialBenchmark && !zeroLatestVolume && !missingLatestVolume,
  "Full-day rotation keeps its own zero-setup original population and unchanged flat provider fixture");
const directory = mkdtempSync(join(tmpdir(), "ture-input-runtime-proof-"));
const database = `ture-input-runtime-db-${process.pid}`;
const api = `ture-input-runtime-api-${process.pid}`;
const network = `ture-input-runtime-net-${process.pid}`;
const owner = "00000000-0000-4000-8000-000000000001";
const identity = {
  schema_version: "scheduled_scan_deployment_identity_v1",
  deploy_id: "a".repeat(24), deploy_context: "production",
  commit_ref: "a".repeat(40), site_id: "2b582e03-ac97-4371-8051-558d9980fb94",
};
const OriginalDate = globalThis.Date;
const originalFetch = globalThis.fetch;
const originalLog = console.log;
const originalEnvironment = { ...process.env };
let externalRequests = 0;
let externalBenchmarkRequests = 0;
let syntheticPublicationCount = 0;
let clock = 0;
let durationStartedAt = null;
let pendingSyntheticTransports = 0;
let futureOutcomePlans = [];
let benchmarkReuseEvidence = null;
const fixtureNow = () => clock + (durationStartedAt === null ? 0 : Math.round(performance.now() - durationStartedAt));
const logs = [];
const docker = (...args) => execFileSync("docker", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const dockerLogs = (name) => {
  const result = spawnSync("docker", ["logs", name], { encoding: "utf8" });
  return `${result.stdout ?? ""}${result.stderr ?? ""}`.slice(-6000);
};
const sql = (statement) => execFileSync("docker", ["exec", "-i", database, "psql", "-h", "127.0.0.1", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-At"], { input: statement, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();

try {
  const generated = join(directory, ".generated");
  mkdirSync(generated);
  mkdirSync(join(directory, "functions"));
  writeFileSync(join(generated, "scheduled-scan-deployment-identity.json"), JSON.stringify(identity));
  const options = { bundle: true, platform: "node", format: "cjs", conditions: ["react-server"], alias: { "@": root }, logLevel: "silent" };
  // Before/after comparison uses the exact original committed product modules
  // in memory; neither product checkout nor fixtures/cohort are rewritten.
  const baselinePlugin = { name: "frozen-original-benchmark-allocation", setup(builder) {
    builder.onLoad({ filter: /\/lib\/(scanner|recommendation-generator|market-regime|completed-benchmark-reuse)\.ts$/ }, args => ({
      contents: execFileSync("git", ["show", `${fairOrderBaseline ? fairOrderBaselineRevision : firstObservationBaseline ? firstObservationBaselineRevision : minimumOrderBaseline ? minimumOrderBaselineRevision : acquisitionBaseline ? acquisitionBaselineRevision : reuseBaselineRevision}:${args.path.slice(root.length + 1)}`], {cwd:root,encoding:"utf8"}),
      loader:"ts", resolveDir:join(root,"lib") }));
  } };
  await build({ ...options, ...(baselineBenchmarkReuse || acquisitionBaseline || minimumOrderBaseline || firstObservationBaseline || fairOrderBaseline ? {plugins:[baselinePlugin]} : {}),
    entryPoints: [resolve(root, "app/api/automation/run-scan/route.ts")], outfile: join(generated, "scheduled-scan-runtime.cjs") });
  if (diagnoseOutcomes) buildSync({ ...options, entryPoints: [resolve(root, "app/api/recommendations/evaluate-outcomes/route.ts")], outfile: join(generated, "outcome-route.cjs") });
  buildSync({ ...options, entryPoints: [resolve(root, "netlify/functions/scheduled-scan.ts")], outfile: join(directory, "functions/scheduled.cjs") });
  buildSync({ ...options, stdin: {
    resolveDir: root,
    contents: `export { observationSeriesControlFromEnvironment, buildObservationSeriesSlotAdmission } from './lib/observation-series-control';
      export { buildObservationCycleReceipt, buildObservationCycleReadback } from './lib/observation-cycle-receipt';
      export { buildObservationSeriesEvidenceReadback } from './lib/server/observation-series-evidence-builder';
      export { SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT as contract } from './lib/scanner-provider-credit-allocation-live-experiment';
      export { buildScannerProviderCreditAllocationRuntimeAdmission } from './lib/scanner-provider-credit-allocation-runtime-admission';
      export { buildScannerProviderCreditAllocationExecutionPlan } from './lib/scanner-provider-credit-allocation-plan';
      export { scannerUniverseTickers } from './lib/scanner-universe';
      export { scanMarket } from './lib/scanner';
      export { readOwnedCompletedBenchmarkReuse, isValidCompletedBenchmarkReuse } from './lib/completed-benchmark-reuse';
      export { readCompletedMarketRegime } from './lib/market-regime';
      export { buildRealScannerBaseCandidateSelection } from './lib/real-scanner-candidate-generation';
      export { getUsEquityMarketSession } from './lib/us-equity-market-calendar';
      export { getIntradayScanWindow } from './lib/intraday-scan-window';
      export { readRecommendationLearningBaselineSource } from './lib/server/application-data-access';
      export { parseRecommendationLearningBaselineSource } from './lib/recommendation-learning-baseline-source';
      export { buildRecommendationLearningBaselineReadiness } from './lib/recommendation-learning-baseline-readiness';
      export { buildRecommendationLearningBaselineSegmentation } from './lib/recommendation-learning-baseline-segments';
      export { buildRecommendationLearningEvaluationPlans } from './lib/recommendation-learning-evaluation-plan';
      export { recommendationDecisionSourceProvenanceFromSnapshot } from './lib/recommendation-decision-source-provenance';
      export { buildRecommendationIntakeQualityProvenance } from './lib/recommendation-intake-quality-provenance';
      export { recommendationScanRunFromPersistenceRow } from './lib/recommendation-scan-run';
      export { candidateDecisionRecordFromScanRun } from './lib/candidate-decision-readback';
      export { decisionLineageReceiptFromScanRun } from './lib/decision-lineage-receipt';
      export { selectCompletedInputResearchSamples } from './lib/completed-input-research-selection';
      export { buildScannerProviderCreditAllocationReconciliation } from './lib/scanner-provider-credit-allocation-reconciliation';`,
  }, outfile: join(generated, "reader.cjs") });
  const require = createRequire(import.meta.url);
  const readers = require(join(generated, "reader.cjs"));
  const contract = readers.contract;
  const environment = {
    SITE_ID: identity.site_id, AUTOMATION_SECRET: "closed-fixture-automation-only",
    NEXT_PUBLIC_SUPABASE_URL: "https://closed-fixture.supabase.invalid",
    TURE_APPLICATION_OWNER_USER_ID: owner, TWELVE_DATA_PLAN_MODE: "free",
    TURE_DISABLE_SCHEDULED_FUNCTIONS: "true", TURE_OBSERVATION_SERIES_ENABLED: "true",
    TURE_OBSERVATION_SERIES_DATE: contract.trading_date,
    TURE_OBSERVATION_SERIES_START_SLOT_UTC: slot,
    TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC: benchmarkReuse ? nextSlot : expiry,
    TURE_OBSERVATION_SERIES_MAX_ATTEMPTS: rotationDay ? "26" : benchmarkReuse ? "2" : "1",
    TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: rotationDay ? "208" : benchmarkReuse ? "16" : "8",
    TURE_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED: "false",
    TURE_SCANNER_INPUT_POLICY_VERSION: wrongPolicy ? "unknown_input_policy" : "completed_daily_intraday_input_v1",
    TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED: "false",
    TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED: "false",
    TURE_NORMAL_SCAN_ONE_SHOT_ENABLED: "false", TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED: "false",
    TURE_INTERNAL_PAPER_WORKER_ENABLED: "false",
    TURE_LEARNING_ACCELERATION_ENABLED: diagnoseOutcomes || closing || rotationDay ? "true" : "false",
    TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET: "800", TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET: "8",
    TWELVE_DATA_API_KEY: "synthetic-boundary-only",
    OPENAI_API_KEY: "synthetic-boundary-only-no-ai-calls-permitted",
    ...(publicationClock ? { TURE_SCHEDULED_SCAN_SKIP_OPENAI: "true" } : {}),
  };
  // No credentials from the invoking environment may leak into this runtime.
  for (const name of Object.keys(process.env)) {
    if (/SUPABASE|POLYGON|TWELVE_DATA|OPENAI|TURE_|PROVIDER_PLAN|AUTOMATION_SECRET/.test(name)) delete process.env[name];
  }
  Object.assign(process.env, environment);
  const jwtSecret = "local-proof-signing-secret-not-a-production-credential";
  const basis = [Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"), Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")].join(".");
  process.env.SUPABASE_SERVICE_ROLE_KEY = `${basis}.${createHmac("sha256", jwtSecret).update(basis).digest("base64url")}`;
  const control = readers.observationSeriesControlFromEnvironment({ get: (name) => process.env[name] });
  assert.equal(control.status, "ready");
  // An internal Docker Desktop network suppresses published host ports. Use a
  // dedicated bridge without outbound masquerading; the Node fetch boundary
  // additionally refuses every origin except this fixture's local Data API.
  docker("network", "create", "--driver", "bridge", "--opt", "com.docker.network.bridge.enable_ip_masquerade=false", network);
  docker("run", "--pull=missing", "--rm", "-d", "--name", database, "--network", network, "-e", "POSTGRES_PASSWORD=closed-proof-only", "postgres:16-alpine");
  for (let attempt = 0; ; attempt++) {
    try { sql("select 1;"); break; } catch (error) {
      if (attempt >= 60) throw error;
      await new Promise((done) => setTimeout(done, 250));
    }
  }
  const migrations = [
    "20260519000000_create_legacy_baseline_schema_draft.sql",
    "20260528000000_create_recommendation_snapshots.sql",
    "20260528001000_create_recommendation_outcomes.sql",
    ...(diagnoseOutcomes ? ["20260605000000_add_recommendation_outcomes_snapshot_horizon_unique_index.sql"] : []),
    "20260528002000_create_recommendation_scan_runs.sql",
    "20260528003000_create_recommendation_batches.sql",
    "20260614000000_create_execution_records.sql",
    "20260724001500_create_transactional_open_position_command.sql",
    "20260811163228_add_fail_closed_application_owner_foundation.sql",
    "20260625000000_create_scheduled_scan_attempts.sql",
    "20260926091134_sv_a2_observation_cycle_receipts.sql",
    "20260915222537_basic_free_discovery_credit_reservations.sql",
    "20260917135646_if2_basic_free_daily_observation_claim.sql",
  ];
  // Source schema/owner constraints and real reservation functions, all isolated.
  sql(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create role authenticator login password 'closed-proof-only'; grant anon, service_role to authenticator;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$;
    insert into auth.users values('${owner}'),('00000000-0000-4000-8000-000000000002');
    ${migrations.map(file=>readFileSync(resolve(root,"supabase/migrations",file),"utf8")).join("\n")}
    grant usage on schema public to service_role; grant all on all tables in schema public to service_role;
    insert into market_calendar_cache(cache_date,provider,is_open_day,reason,day_type,market_open_time,market_close_time,raw,updated_at)
      values('2026-10-01','polygon',true,'Synthetic CLOSED calendar','trading_day','09:30','16:00','{}',
        '${rotationDay ? "2026-10-01T13:00:00Z" : "2026-10-01T17:30:00Z"}');
    insert into user_settings(owner_user_id) values('${owner}');`);
  globalThis.Date = class extends OriginalDate {
    constructor(...args) { super(...(args.length ? args : [fixtureNow()])); }
    static now() { return fixtureNow(); }
  };
  docker("run", "--pull=missing", "--rm", "-d", "--name", api, "--network", network, "-p", "127.0.0.1::3000",
    "-e", `PGRST_DB_URI=postgres://authenticator:closed-proof-only@${database}:5432/postgres`,
    "-e", "PGRST_DB_ANON_ROLE=anon", "-e", `PGRST_JWT_SECRET=${jwtSecret}`, "public.ecr.aws/supabase/postgrest:v16.1");
  const port = docker("port", api, "3000/tcp").split(":").at(-1);
  const apiOrigin = `http://127.0.0.1:${port}`;
  for (let attempt = 0; ; attempt++) {
    try { const response = await originalFetch(apiOrigin); if (!response.ok) throw new Error(`api_not_ready:${await response.text()}`); break; } catch (error) {
      if (attempt >= 60) throw error;
      await new Promise((done) => setTimeout(done, 250));
    }
  }
  globalThis.fetch = async (input, init) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
    if (url.origin === "https://api.twelvedata.com" && url.pathname === "/time_series") {
      externalRequests++;
      if (["SPY", "QQQ"].includes(url.searchParams.get("symbol"))) externalBenchmarkRequests++;
      if(contextLatency) {
        pendingSyntheticTransports++;
        try { await syntheticDelay(
          ["SPY","QQQ"].includes(url.searchParams.get("symbol")) ? benchmarkDelayMs : 1800,
          undefined, {signal:init?.signal});
        } finally { pendingSyntheticTransports--; }
      }
      if(scannerRateLimit && !["SPY","QQQ"].includes(url.searchParams.get("symbol"))) {
        return Response.json({status:"error",code:429,message:"Synthetic API credits rate limit"},{status:429});
      }
      const interval = url.searchParams.get("interval");
      const benchmark = ["SPY", "QQQ"].includes(url.searchParams.get("symbol"));
      if (benchmark) assert.equal(url.searchParams.get("adjust"), "splits");
      const intraday = interval !== "1day";
      const values = [];
      if (intraday) {
        assert.equal(interval,"5min");
        for (let time=OriginalDate.parse("2026-10-01T13:30:00Z"); time<clock; time+=300000) {
          const datetime=new Intl.DateTimeFormat("sv-SE",{timeZone:"America/New_York",
            year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new OriginalDate(time));
          const latestClosed = time + 300000 <= clock && time + 600000 > clock;
          const volume = missingLatestVolume && latestClosed ? " " : zeroLatestVolume && latestClosed ? "0" : "1000";
          const index=(time-OriginalDate.parse("2026-10-01T13:30:00Z"))/300000;
          const close=100+index*0.06;
          const futurePlan=relativePlan60m ? futureOutcomePlans.find(plan=>plan.ticker===url.searchParams.get("symbol")) : null;
          const anchor=futurePlan ? Math.ceil(OriginalDate.parse(futurePlan.payload_json.decision_timestamp)/300000)*300000 : null;
          if(futurePlan && time>=anchor) {
            // Explicitly synthetic future bars, supplied only at the provider
            // boundary after the unchanged original plans have been persisted.
            // One entry-only candle precedes each favorable/unfavorable terminal.
            const entry=Number(futurePlan.entry), stop=Number(futurePlan.stop), target=Number(futurePlan.target);
            const risk=entry-stop, terminal=time>=anchor+300000;
            assert(risk>0 && target>entry);
            values.unshift({datetime,open:String(entry),volume:"1000",
              high:String(terminal && futurePlan.synthetic_win ? target+risk*0.1 : entry+risk*0.1),
              low:String(terminal && !futurePlan.synthetic_win ? stop-risk*0.1 : entry-risk*0.1),
              close:String(terminal ? futurePlan.synthetic_win ? target : stop : entry)});
          } else values.unshift(publicationClock
            ? {datetime,open:String(close-0.05),high:String(close+0.1),low:String(close-0.1),close:String(close),volume:String(1000+index*40)}
            : {datetime,open:"100",high:"101",low:"99",close:"100",volume});
        }
      } else {
        const day=new OriginalDate(staleBenchmark && benchmark ? "2026-05-26T00:00:00Z" : "2026-09-30T00:00:00Z");
        while(values.length<60) {
          const date=day.toISOString().slice(0,10);
          if(readers.getUsEquityMarketSession(date).session_close) values.unshift({datetime:date,open:"100",high:"103",low:"99",close:"101",volume:"1000"});
          day.setUTCDate(day.getUTCDate()-1);
        }
        if (partialBenchmark && benchmark) {
          values.shift();
          values.push({datetime:"2026-10-01",open:"100",high:"1001",low:"99",close:"1000",volume:"1000"});
        }
      }
      return Response.json({meta:{symbol:url.searchParams.get("symbol"),interval,exchange_timezone:"America/New_York"},values});
    }
    if (url.origin !== environment.NEXT_PUBLIC_SUPABASE_URL) throw new Error(`Unexpected external boundary: ${url.hostname}`);
    if (url.pathname === `/auth/v1/admin/users/${owner}`) return Response.json({ user: { id: owner, aud: "authenticated", role: "authenticated" } });
    if (!url.pathname.startsWith("/rest/v1/")) throw new Error("Unexpected fixture API path");
    const request=new Request(input,init);
    let requestBody=!["GET","HEAD"].includes(request.method)?await request.text():null;
    const isPublication=publicationClock && url.pathname==="/rest/v1/recommendations" && request.method==="POST";
    if(isPublication) {
      // Only the isolated database boundary models persistence's later clock.
      // Scanner, gates, generator, SDK, actual insert and readback are real.
      clock+=200;
      const payload=JSON.parse(requestBody);
      requestBody=JSON.stringify(payload.map(row=>({...row,created_at:new Date().toISOString()})));
      // supabase-js's explicit insert column list otherwise omits the added
      // fixture database-clock value and invokes the real wall-clock default.
      const columns=url.searchParams.get("columns");
      if(columns) url.searchParams.set("columns",columns+',"created_at"');
    }
    const response=await originalFetch(`${apiOrigin}${url.pathname.slice("/rest/v1".length)}${url.search}`, {
      method:request.method,headers:request.headers,
      ...(requestBody!==null?{body:requestBody}:{})
    });
    if(isPublication) clock+=236;
    return response;
  };
  console.log = (...items) => logs.push(items);
  globalThis.Netlify = { env: { get: (name) => process.env[name] } };
  // Warm history is acquired by the actual scanner/SDK, not seeded JSON.
  // Its sixteen (two-slot proof: thirty-two) synthetic requests are separate
  // setup, never hidden in scan cost or treated as free historical coverage.
  clock=OriginalDate.parse("2026-10-01T17:00:00Z");
  let setupRequests=0;
  if(!cold && !wrongPolicy) {
    const selected=readers.buildRealScannerBaseCandidateSelection({scanWindow:readers.getIntradayScanWindow(new Date("2026-10-01T17:30:00Z")),requestedScanBudget:8,
      selectionMode:"scheduled_rotating",now:new OriginalDate("2026-10-01T17:30:00Z")}).candidates;
    assert.equal(selected.length,8);
    const secondSelected=benchmarkReuse ? readers.buildRealScannerBaseCandidateSelection({scanWindow:readers.getIntradayScanWindow(new OriginalDate(expiry)),requestedScanBudget:8,
      selectionMode:"scheduled_rotating",now:new OriginalDate(expiry)}).candidates : [];
    if(benchmarkReuse) assert.equal(secondSelected.length,8);
    const setupPopulation=[...new Map([...(mixedHistory ? selected.slice(4) : selected),
      ...(mixedHistory ? secondSelected.slice(4) : secondSelected)].map(candidate=>[candidate.ticker,candidate])).values()];
    for(const candidate of setupPopulation) await readers.scanMarket([candidate],{source:"scheduled",maxFreshProviderCalls:2,
      freshProviderCallPacingMs:0,completedDailyContextPolicyVersion:"completed_daily_intraday_input_v1"});
    setupRequests=externalRequests;
    assert.equal(setupRequests,setupPopulation.length*2);
    if(invalidMixedHistory) sql(`update scanner_cache set raw=jsonb_set(raw,
      '{completed_daily_context,content_sha256}','"invalid-fixture-history-digest"');`);
  }
  externalRequests=0;
  externalBenchmarkRequests=0;
  const scheduler = require(join(directory, "functions/scheduled.cjs")).default;
  if(rotationDay) {
    assert.equal(setupRequests,0);
    const slots=[];
    const observations=new Map();
    const eligible=readers.scannerUniverseTickers.filter(ticker=>ticker.enabled && ticker.tradable).map(ticker=>ticker.ticker).sort();
    const runFingerprints=new Set();
    const attemptFingerprints=new Set();
    let previousOriginalRun=null;
    for(let index=0;index<26;index++) {
      const sourceSlot=new OriginalDate(OriginalDate.parse(slot)+index*900000).toISOString();
      const followingSlot=new OriginalDate(OriginalDate.parse(sourceSlot)+900000).toISOString();
      clock=OriginalDate.parse(sourceSlot)+20000;
      const selected=readers.buildRealScannerBaseCandidateSelection({
        scanWindow:readers.getIntradayScanWindow(new OriginalDate(sourceSlot)),requestedScanBudget:8,
        selectionMode:"scheduled_rotating",now:new OriginalDate(sourceSlot)}).candidates;
      assert.equal(selected.length,8);
      const before=externalRequests, benchmarkBefore=externalBenchmarkRequests;
      const attemptedBefore=Number(sql("select count(*) from scheduled_scan_attempts;"));
      const runsBefore=Number(sql("select count(*) from recommendation_scan_runs;"));
      const claimCountBefore=Number(sql("select count(*) from basic_free_discovery_credit_reservations;"));
      const reusePreflight=previousOriginalRun?{
        original_status:previousOriginalRun.status,
        original_window:previousOriginalRun.window,
        original_observed_at:previousOriginalRun.observed_at,
        completed_benchmark_capsules_valid:!!await readers.readCompletedMarketRegime(previousOriginalRun.payload_json.market_regime,new OriginalDate(clock)),
        owned_reuse_admitted:!!await readers.readOwnedCompletedBenchmarkReuse({row:previousOriginalRun,owner,now:new OriginalDate(clock)}),
      }:null;
      const result=await scheduler(new Request("http://closed-scheduler",{method:"POST",body:JSON.stringify({next_run:followingSlot})}),
        {deploy:{id:identity.deploy_id,context:"production",published:true}});
      const resultBody=result.status===204?null:await result.json();
      const requestCount=externalRequests-before, benchmarkCalls=externalBenchmarkRequests-benchmarkBefore;
      assert(requestCount<=8,"No slot may exceed the unchanged whole-scan cap");
      const attemptCount=Number(sql("select count(*) from scheduled_scan_attempts;"))-attemptedBefore;
      const runCount=Number(sql("select count(*) from recommendation_scan_runs;"))-runsBefore;
      const claimCount=Number(sql("select count(*) from basic_free_discovery_credit_reservations;"))-claimCountBefore;
      assert(attemptCount<=1 && runCount<=1 && claimCount<=1,"One attributable attempt/run/reservation per original slot");
      const attempt=attemptCount?JSON.parse(sql("select row_to_json(t) from scheduled_scan_attempts t order by utc_timestamp desc,id desc limit 1;")):null;
      const run=runCount?JSON.parse(sql("select row_to_json(t) from recommendation_scan_runs t order by observed_at desc,id desc limit 1;")):null;
      const claim=claimCount?JSON.parse(sql("select row_to_json(t) from basic_free_discovery_credit_reservations t order by created_at desc,id desc limit 1;")):null;
      if(attempt) {
        assert(!attemptFingerprints.has(attempt.attempt_fingerprint));
        attemptFingerprints.add(attempt.attempt_fingerprint);
      }
      if(claim) {
        assert.equal(claim.requested_credits,8); assert(claim.finalized_at);
        assert(["completed","failed"].includes(claim.status));
      }
      const decision=run?readers.candidateDecisionRecordFromScanRun(run):null;
      if(run) {
        assert(decision && readers.decisionLineageReceiptFromScanRun(run,decision),
          `Missing/mismatched original decision lineage at ${sourceSlot}`);
        assert(!runFingerprints.has(run.run_fingerprint)); runFingerprints.add(run.run_fingerprint);
        assert.equal(attempt.scan_run_fingerprint,run.run_fingerprint);
        assert.equal(decision.candidates.length,8);
        assert.deepEqual(decision.candidates.map(candidate=>candidate.ticker).sort(),selected.map(candidate=>candidate.ticker).sort());
        assert(OriginalDate.parse(run.observed_at)<=OriginalDate.parse(decision.decision_timestamp));
        assert(OriginalDate.parse(decision.decision_timestamp)<=OriginalDate.parse(run.completed_at));
        const acquisition=run.payload_json.active_scan_trace.market_data_fetch.completed_input_acquisition;
        if(acquisitionBaseline || !minimumOrderBaseline && !firstObservationBaseline && !fairOrderBaseline) assert.equal(acquisition,undefined);
        else {
          assert.equal(acquisition.policy_version,firstObservationBaseline?"completed_input_first_observation_guard_v1":minimumOrderBaseline?"completed_input_minimum_requests_first_v1":"completed_input_fair_cost_ties_v1");
          assert.deepEqual(acquisition.original_members.map(member=>member.ticker),selected.map(candidate=>candidate.ticker));
        }
        for(const candidate of decision.candidates.filter(candidate=>candidate.data.freshness==="fresh")) {
          assert(OriginalDate.parse(candidate.data.input_snapshot.current_session.captured_at)<=OriginalDate.parse(decision.decision_timestamp));
          assert(OriginalDate.parse(candidate.data.input_snapshot.historical_context.captured_at)<=OriginalDate.parse(decision.decision_timestamp));
        }
      }
      const members=selected.map(candidate=>{
        const original=decision?.candidates.find(member=>member.ticker===candidate.ticker);
        const fresh=original?.data.freshness==="fresh";
        const previous=observations.get(candidate.ticker)??{ticker:candidate.ticker,selected:0,fresh:0,missing:0,revisit_missing:0,first_complete_slot:null};
        if(!fresh && previous.selected>0) previous.revisit_missing++;
        previous.selected++; previous.fresh+=Number(fresh); previous.missing+=Number(!fresh);
        if(fresh && previous.first_complete_slot===null) previous.first_complete_slot=sourceSlot;
        observations.set(candidate.ticker,previous);
        return {ticker:candidate.ticker,freshness:original?.data.freshness??"no_decision",gap_codes:original?.data.gap_codes??[]};
      });
      slots.push({slot:sourceSlot,http_status:result.status,attempts:attemptCount,runs:runCount,reservations:claimCount,
        outcome:attempt?.outcome??null,skip_reason:attempt?.skip_reason??null,
        decision_disposition:decision?.final_decision.disposition??null,no_trade_reason:decision?.final_decision.no_trade_reason??null,
        requests:requestCount,benchmark_requests:benchmarkCalls,stock_requests:requestCount-benchmarkCalls,
        fresh_members:members.filter(member=>member.freshness==="fresh").length,members,
        acquisition:run?.payload_json.active_scan_trace.market_data_fetch.completed_input_acquisition??null,
        benchmark_reuse_preflight:reusePreflight,
        ...(attemptCount===0 || runCount===0 ? {bounded_result:resultBody} : {})});
      previousOriginalRun=run;
    }
    const totalClaims=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from basic_free_discovery_credit_reservations t;"));
    const cycles=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from observation_cycle_receipts t;"));
    const cycleReadback=readers.buildObservationCycleReadback(cycles);
    assert.equal(cycleReadback.invalid_row_count,0);
    assert(totalClaims.reduce((sum,claim)=>sum+claim.requested_credits,0)<=208);
    assert(totalClaims.every(claim=>claim.status!=="reserved" && claim.finalized_at));
    assert.equal(Number(sql("select count(*) from recommendations;")),0);
    assert.equal(Number(sql("select count(*) from positions;")),0);
    delete require.cache[require.resolve(join(generated,"reader.cjs"))];
    const restarted=require(join(generated,"reader.cjs"));
    const owned=await restarted.readRecommendationLearningBaselineSource(owner);
    assert.equal(owned.status,"available","Actual full-population SDK read must not truncate or silently exclude a row");
    const source=restarted.parseRecommendationLearningBaselineSource(owned.data);
    assert(source && source.scanRuns.length===runFingerprints.size);
    assert.deepEqual(source.scanRuns.map(run=>run.run_fingerprint).sort(),[...runFingerprints].sort());
    for(const run of source.scanRuns) {
      const decision=restarted.candidateDecisionRecordFromScanRun(run);
      assert(decision && restarted.decisionLineageReceiptFromScanRun(run,decision));
    }
    const wrongOwner=await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002");
    assert.equal(wrongOwner.data.recommendation_scan_runs.length,0);
    const beforeCleanup=externalRequests;
    clock=OriginalDate.parse(expiry)+20000;
    // First exercise automatic expiry while the fixture's series flag is still on.
    const expired=await scheduler(new Request("http://closed-scheduler",{method:"POST",body:JSON.stringify({next_run:nextSlot})}),
      {deploy:{id:identity.deploy_id,context:"production",published:true}});
    assert.equal(expired.status,204);
    process.env.TURE_OBSERVATION_SERIES_ENABLED="false";
    const disabled=await scheduler(new Request("http://closed-scheduler",{method:"POST",body:JSON.stringify({next_run:nextSlot})}),
      {deploy:{id:identity.deploy_id,context:"production",published:true}});
    assert.equal(disabled.status,204); assert.equal(externalRequests,beforeCleanup);
    assert.equal(Number(sql("select count(*) from scheduled_scan_attempts;")),attemptFingerprints.size);
    const tickerCoverage=[...observations.values()].sort((a,b)=>a.ticker.localeCompare(b.ticker));
    originalLog(JSON.stringify({evidence_mode:"synthetic_closed_packaged_input_runtime_actual_source_schema",
      scenario:"full_session_cold_rotation",acquisition_mode:acquisitionBaseline?"original_order":firstObservationBaseline?"first_observation_guard":minimumOrderBaseline?"minimum_requests_first":fairOrderBaseline?"fair_cost_ties":"original_order_regular_session_reuse",
      baseline_revision:acquisitionBaselineRevision,minimum_order_baseline_revision:minimumOrderBaselineRevision,
      original_slots:26,original_member_observations:26*8,eligible_tickers:eligible,slots,ticker_coverage:tickerCoverage,
      selected_unique_tickers:tickerCoverage.length,ever_complete_tickers:tickerCoverage.filter(ticker=>ticker.fresh>0).length,
      never_complete_tickers:tickerCoverage.filter(ticker=>ticker.fresh===0).map(ticker=>ticker.ticker),
      unselected_eligible_tickers:eligible.filter(ticker=>!observations.has(ticker)),
      fresh_member_observations:slots.reduce((sum,item)=>sum+item.fresh_members,0),
      revisit_missing_observations:tickerCoverage.reduce((sum,item)=>sum+item.revisit_missing,0),
      attempts:attemptFingerprints.size,cycles:cycles.length,scan_runs:runFingerprints.size,
      reservations:totalClaims.length,reserved_credits:totalClaims.reduce((sum,claim)=>sum+claim.requested_credits,0),
      setup_synthetic_requests:setupRequests,scheduled_synthetic_requests:externalRequests,
      synthetic_benchmark_requests:externalBenchmarkRequests,restarted_owner_read:true,wrong_owner_runs:0,
      actual_provider_requests:0,production_actions:0,publications:0,broker_actions:0,cleanup:"inert"}));
  } else {
  clock = OriginalDate.parse(slot) + 20000;
  if(contextLatency) durationStartedAt = performance.now();
  const response = await scheduler(new Request("http://closed-scheduler", {method:"POST", body:JSON.stringify({next_run:expiry})}), {deploy:{id:identity.deploy_id,context:"production",published:true}});
  const boundedDurationMs = durationStartedAt === null ? null : Math.round(performance.now() - durationStartedAt);
  durationStartedAt = null;
  const body = await response.json();
  assert.equal(pendingSyntheticTransports,0,"All owned transports must settle before terminal readback");
  const rows = JSON.parse(sql("select coalesce(jsonb_agg(t), '[]') from scheduled_scan_attempts t;"));
  const receipts = JSON.parse(sql("select coalesce(jsonb_agg(t), '[]') from observation_cycle_receipts t;"));
  const scanRuns = JSON.parse(sql("select coalesce(jsonb_agg(t), '[]') from recommendation_scan_runs t;"));
  const record = scanRuns[0]?.payload_json.candidate_decision_record;
  const lineage = scanRuns[0]?.payload_json.decision_lineage_receipt;
  const claims=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from basic_free_discovery_credit_reservations t;"));
  const researchSnapshots=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_snapshots t;"));
  if(relativePlan60m) futureOutcomePlans=researchSnapshots.map((snapshot,index)=>({...snapshot,synthetic_win:index%2===0}));
  let outcomeChainEvidence = null;
  if(wrongPolicy) {
    assert.equal(response.status,503);
    assert.equal(externalRequests,0);
    assert.equal(claims.length,0);
    assert.equal(scanRuns.length,0);
  } else if(staleBenchmark) {
    assert.equal(response.status,500,JSON.stringify({body,logs:logs.slice(-15)}));
    assert.equal(rows.length,1); assert.equal(receipts.length,1);
    assert.notEqual(rows[0].outcome,"scanned");
    assert.equal(scanRuns.length,0); assert.equal(researchSnapshots.length,0);
    assert.equal(claims.length,1); assert.equal(claims[0].requested_credits,8);
    assert.equal(claims[0].status,"failed"); assert(claims[0].finalized_at);
    assert.equal(externalRequests,8);
    assert.equal(Number(sql("select count(*) from recommendations;")),0);
    assert(logs.some(items=>JSON.stringify(items).includes("market_regime_completed_daily_input_unavailable")));
  } else if(scannerRateLimit) {
    assert.equal(response.status,500);
    assert.equal(rows.length,1); assert.equal(receipts.length,1);
    assert.equal(rows[0].skip_reason,"provider_rate_limited");
    assert.equal(scanRuns.length,0); assert.equal(researchSnapshots.length,0);
    assert.equal(claims.length,1); assert.equal(claims[0].requested_credits,8);
    assert.equal(claims[0].status,"failed"); assert(claims[0].finalized_at);
    assert.equal(externalRequests,3);
    assert(boundedDurationMs < 10000,"Early scanner failure must not wait for the route deadline");
    assert.equal(Number(sql("select count(*) from recommendations;")),0);
  } else if(expectContextTimeout) {
    assert.equal(response.status,200);
    assert.equal(rows.length,1); assert.equal(receipts.length,1);
    assert.equal(rows[0].skip_reason,"timeout_budget_exceeded");
    assert.equal(receipts[0].cycle_status,"failed");
    assert.equal(receipts[0].receipt_json.discovery_evaluation.raw_candidate_count,3);
    assert.equal(receipts[0].receipt_json.discovery_evaluation.ranked_count,0);
    assert.equal(scanRuns.length,0); assert.equal(researchSnapshots.length,0);
    assert.equal(claims.length,1); assert.equal(claims[0].requested_credits,8);
    assert.equal(claims[0].status,"failed"); assert(claims[0].finalized_at);
    assert.equal(externalRequests,8);
    assert.equal(Number(sql("select count(*) from recommendations;")),0);
  } else {
    assert.equal(response.status,200,JSON.stringify({body,logs:logs.slice(-15)}).slice(-12000));
    assert.equal(rows.length,1);
    assert.equal(receipts.length,1);
    assert.equal(receipts[0].cycle_status,"completed");
    assert.equal(scanRuns.length,1);
    assert.equal(claims.length,1);
    assert.equal(claims[0].requested_credits,8);
    assert.equal(claims[0].status,"completed");
    assert(claims[0].finalized_at);
    assert.equal(externalRequests,8);
    const regimeEvidence=scanRuns[0].payload_json.market_regime?.input_evidence;
    assert.equal(regimeEvidence?.policy_version,"completed_daily_market_regime_input_v1",
      "Original benchmark source policy must survive actual database persistence");
    for (const symbol of ["spy","qqq"]) {
      assert.equal(regimeEvidence[symbol].latest_completed_market_date,"2026-09-30");
      assert.equal(regimeEvidence[symbol].latest_completed_at,"2026-09-30T20:00:00.000Z");
      assert(regimeEvidence[symbol].response_identity.payload_byte_length>0);
      assert.match(regimeEvidence[symbol].content_sha256,/^sha256:[a-f0-9]{64}$/);
      assert(OriginalDate.parse(regimeEvidence[symbol].captured_at)<=OriginalDate.parse(record.decision_timestamp));
    }
    if (partialBenchmark) {
      assert.equal(scanRuns[0].payload_json.market_regime.spy.close,101);
      assert.equal(scanRuns[0].payload_json.market_regime.regime,"risk_off");
      assert.equal(regimeEvidence.spy.candles.length,59);
    }
    // Actual restarted SDK + owner decoder, not only direct SQL inspection.
    delete require.cache[require.resolve(join(generated,"reader.cjs"))];
    const benchmarkReader=require(join(generated,"reader.cjs"));
    const benchmarkRead=await benchmarkReader.readRecommendationLearningBaselineSource(owner);
    const benchmarkSource=benchmarkReader.parseRecommendationLearningBaselineSource(benchmarkRead.data);
    assert(benchmarkSource && benchmarkSource.scanRuns.length===1);
    assert.deepEqual(benchmarkSource.scanRuns[0].payload_json.market_regime.input_evidence,regimeEvidence);
    const benchmarkWrongOwner=await benchmarkReader.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002");
    assert.equal(benchmarkWrongOwner.data.recommendation_scan_runs.length,0);
    const cycle=readers.buildObservationCycleReadback(receipts);
    assert.equal(cycle.status,"available");
    assert.equal(cycle.invalid_row_count,0);
    assert.equal(record.record_version,"candidate_decision_record_v4");
    assert.equal(record.candidates.length,8);
    assert.equal(record.versions.input_policy_version,"completed_daily_intraday_input_v1");
    assert.equal(record.final_decision.disposition,publicationClock && !closing?"recommendations_published":"no_trade");
    if(closing) {
      assert.equal(scanRuns[0].payload_json.analysis_policy_version,"regular_session_analysis_v1");
      assert.equal(scanRuns[0].payload_json.power_hour_publish_allowed,false);
      assert.equal(record.final_decision.no_trade_reason,"power_hour_publication_withheld");
      assert.equal(Number(sql("select count(*) from recommendations;")),0);
      assert.equal(researchSnapshots.length,3);
      assert.deepEqual(readers.candidateDecisionRecordFromScanRun(scanRuns[0]),record);
      assert.deepEqual(readers.decisionLineageReceiptFromScanRun(scanRuns[0],record),lineage);
      for(const row of researchSnapshots) {
        assert.equal(row.source_mode,"research_only");
        assert.equal(row.status,"hidden");
        assert.equal(row.recommendation_id,null);
        const candidate=record.candidates.find(c=>c.candidate_id===row.payload_json.candidate_id);
        assert(candidate && candidate.data.freshness==="fresh");
        assert.deepEqual(row.payload_json.scanner_decision_input_snapshot,candidate.data.input_snapshot);
      }
      delete require.cache[require.resolve(join(generated,"reader.cjs"))];
      const restarted=require(join(generated,"reader.cjs"));
      const read=await restarted.readRecommendationLearningBaselineSource(owner);
      const source=restarted.parseRecommendationLearningBaselineSource(read.data);
      assert(source);
      assert.equal(source.snapshots.length,3);
      assert.equal(source.outcomes.length,0,"Late inputs cannot fabricate complete future horizons");
      assert.equal(source.scanRuns.length,1);
      assert.deepEqual(restarted.candidateDecisionRecordFromScanRun(source.scanRuns[0]),record);
      const readiness=restarted.buildRecommendationLearningBaselineReadiness(source);
      assert.equal(readiness.status,"not_ready");
      assert.equal(Object.values(readiness.decision_population).slice(0,4).reduce((sum,count)=>sum+count,0),8);
      const wrongOwner=await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002");
      assert.equal(wrongOwner.data.recommendation_snapshots.length,0);
      assert.equal(wrongOwner.data.recommendation_scan_runs.length,0);
    }
    if(publicationClock && !closing) {
      const published=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendations t;"));
      assert(published.length>0,JSON.stringify({body,logs:logs.slice(-30)}).slice(-16000));
      syntheticPublicationCount=published.length;
      assert.deepEqual(readers.candidateDecisionRecordFromScanRun(scanRuns[0]),record);
      assert.deepEqual(readers.decisionLineageReceiptFromScanRun(scanRuns[0],record),lineage);
      assert.equal(record.decision_clock?.contract_version,"pre_publication_decision_clock_v1");
      for(const row of published) {
        const candidate=record.candidates.find(c=>c.ticker===row.ticker && c.disposition==="published");
        assert(candidate?.data.input_snapshot);
        assert.equal(candidate.data.freshness,"fresh");
        assert.deepEqual(candidate.data.gap_codes,[]);
        for(const [column,feature] of [["entry_low","proposed_entry_low"],["entry_high","proposed_entry_high"],
          ["stop_loss","proposed_stop_loss"],["target_1","proposed_target_1"]]) {
          assert.equal(Number(row[column]),candidate.data.input_snapshot.features[feature]);
        }
        assert(OriginalDate.parse(record.decision_timestamp)<=OriginalDate.parse(row.created_at),
          `Explicit decision must precede publication: decision=${record.decision_timestamp}, published=${row.created_at}`);
        assert(OriginalDate.parse(row.created_at)<=OriginalDate.parse(scanRuns[0].completed_at),
          `Publication precedes completion: published=${row.created_at}, completed=${scanRuns[0].completed_at}, modeled=${new Date().toISOString()}`);
      }
      assert(OriginalDate.parse(record.decision_clock.input_capture_timestamp)<=OriginalDate.parse(record.decision_timestamp));
      assert.equal(record.coverage.pre_truncation_capture_evidence.point_in_time_cutoff,record.decision_timestamp);
      for(const key of ["input_capture_timestamp","decision_timestamp","contract_version"]) {
        const changed=structuredClone(scanRuns[0]);
        changed.payload_json.candidate_decision_record.decision_clock[key]="untrusted-clock";
        assert.equal(readers.candidateDecisionRecordFromScanRun(changed),null);
      }
      originalLog(JSON.stringify({publication_clock_proof:"passed",synthetic_publication_count:published.length,
        decision_timestamp:record.decision_timestamp,published_at:published.map(row=>row.created_at),
        completed_at:scanRuns[0].completed_at,actual_provider_requests:0,production_actions:0}));
    }
    assert.equal(scanRuns[0].payload_json.scanner_clock_prior_shadow_comparison ?? null,null);
    assert.equal(scanRuns[0].payload_json.scanner_intraday_liquidity_shadow_comparison ?? null,null);
    assert.equal(record.candidates.filter(c=>c.data.freshness==="fresh").length,
      missingLatestVolume?0:mixedHistory?(minimumOrderBaseline&&!invalidMixedHistory?5:3):cold?3:6);
    if(missingLatestVolume) {
      assert.equal(researchSnapshots.length,0,"A missing provider volume cannot create completed-input research sources");
      assert(record.candidates.every(candidate => !candidate.data.input_snapshot ||
        candidate.data.input_snapshot.current_session === null &&
        candidate.data.input_snapshot.intraday_indicators === null &&
        candidate.data.input_snapshot.features.latest_close === null),
        "Missing volume must not be normalized into a complete decision input");
    }
    assert(record.candidates.every(c=>c.data.source_timestamp===null || Date.parse(c.data.source_timestamp)<=Date.parse(record.decision_timestamp)));
    assert.equal(lineage.scan_run_fingerprint,scanRuns[0].run_fingerprint);
    if(diagnoseOutcomes) {
      assert.equal(researchSnapshots.length,cold?3:6,
        "Fresh, non-published versioned inputs must retain research sources throughout the regular session");
      for(const row of researchSnapshots) {
        const payload=row.payload_json, decision=record.candidates.find(c=>c.candidate_id===payload.candidate_id);
        assert(decision);
        assert.equal(OriginalDate.parse(row.recommended_at),OriginalDate.parse(record.decision_timestamp));
        assert.equal(row.status,"hidden");
        assert.equal(row.source_mode,"research_only");
        assert.equal(row.recommendation_id,null);
        assert.equal(payload.research_capture_version,"completed_input_research_capture_v1");
        assert.equal(payload.scanner_input_policy_version,"completed_daily_intraday_input_v1");
        assert.deepEqual(payload.scanner_decision_input_snapshot,decision.data.input_snapshot);
        assert.equal(payload.data_timestamp,decision.data.source_timestamp);
        assert.notEqual(payload.clock_prior_shadow_evidence_sample,true);
        assert.notEqual(payload.intraday_liquidity_shadow_evidence_sample,true);
        const quality=row.intake_quality_json;
        assert.equal(quality?.result_kind,"recommendation_intake_quality");
        assert.equal(quality.result_version,"1.2");
        assert.equal(quality.status,"incomplete");
        assert.equal(quality.grade,"unknown");
        assert.equal(quality.accepted_for_visible_list,false);
        assert.equal(quality.checks.find(check=>check.check_id==="liquidity_spread")?.status,"incomplete");
        assert(quality.warnings.some(warning=>warning.reason_id==="spread_unavailable"),
          "Absent original spread must remain unknown, never a passing research liquidity assessment");
        assert.equal(quality.result_id,`recommendation-intake-research-${payload.candidate_id}`);
        assert.equal(quality.recommendation_id,null);
        assert.equal(quality.internal_only,true);
        assert.equal(quality.ticker,row.ticker);
        assert.equal(quality.direction,"long");
        assert.equal(quality.evaluated_at,record.decision_timestamp);
        assert.equal(quality.data_age_minutes,
          Math.max(0,Math.round((OriginalDate.parse(record.decision_timestamp)-OriginalDate.parse(payload.data_timestamp))/60000)),
          "Intake diagnostics retain whole-minute age semantics; source timestamps remain exact");
        assert.equal(quality.risk_reward_ratio,(row.target-row.entry)/(row.entry-row.stop));
        assert.equal(quality.checks.find(check=>check.check_id==="duplicate_risk")?.status,"not_applicable");
        assert.equal(quality.checks.find(check=>check.check_id==="risk_controls_context")?.status,"not_applicable");
        const average=payload.scanner_decision_input_snapshot.intraday_indicators.averageVolume;
        if(average!==null && average>0 && average<50000)
          assert(quality.warnings.some(warning=>warning.reason_id==="volume_low"),"Original low-volume evidence must survive assessment");
        if(zeroLatestVolume)
          assert(quality.warnings.some(warning=>warning.reason_id==="volume_contracting"),
            "Original latest zero must reach intake as weak current volume, not an older positive bar");
      }
      // Adversarial source admission on the actual persisted v4 decision, not
      // a parallel fabricated decision schema. Full runtime happy path above.
      const candidateInputs=researchSnapshots.map(row=>{
        const p=row.payload_json,f=p.scanner_decision_input_snapshot.features;
        return {ticker:row.ticker,company_name:row.company_name,sector:p.sector,
          setup_type:p.setup_type,tier:p.tier,score:{value:row.score,reasons:[],warnings:[],tier:p.tier},signals:[],warnings:[],
          data_source:p.market_data_source,provider_source:p.provider_source,market_data_timestamp:p.data_timestamp,
          reference_price_timestamp:p.data_timestamp,stale:false,intraday_indicator_response_identity:p.intraday_indicator_response_identity,
          decision_feature_vector:p.decision_feature_vector,
          entry_low:f.proposed_entry_low,entry_high:f.proposed_entry_high,stop_loss:f.proposed_stop_loss,
          target_1:f.proposed_target_1,target_2:f.proposed_target_2,risk_reward:f.proposed_risk_reward};
      });
      const select=(r=record,c=candidateInputs,excluded=[])=>readers.selectCompletedInputResearchSamples({record:r,candidates:c,excludedTickers:excluded,maxSamples:8});
      assert.equal(select().length,researchSnapshots.length);
      assert.equal(select(record,candidateInputs,[candidateInputs[0].ticker]).length,researchSnapshots.length-1);
      const mutations=[
        r=>{r.candidates.find(c=>c.ticker===candidateInputs[0].ticker).candidate_id="wrong";},
        r=>{r.candidates.find(c=>c.ticker===candidateInputs[0].ticker).data.input_snapshot.current_session.symbol="OTHER";},
        r=>{r.candidates.find(c=>c.ticker===candidateInputs[0].ticker).data.freshness="stale";},
        r=>{r.candidates.find(c=>c.ticker===candidateInputs[0].ticker).data.source_timestamp="2026-10-01T18:00:00.000Z";},
        r=>{r.candidates.find(c=>c.ticker===candidateInputs[0].ticker).data.input_snapshot.features.proposed_stop_loss=1;},
        r=>{r.candidates.push(structuredClone(r.candidates.find(c=>c.ticker===candidateInputs[0].ticker)));},
      ];
      for(const mutate of mutations) {const r=structuredClone(record);mutate(r);assert.equal(select(r).length,researchSnapshots.length-1);}
      for(const mutate of [c=>{c[0].stale=true;},c=>{c[0].reference_price_timestamp="2026-10-01T17:20:00.000Z";},
        c=>{c[0].stop_loss=1;},c=>{c[0].decision_feature_vector.feature_values.latest_price=1;},
        c=>{c[0].intraday_indicator_response_identity.payload_sha256=`sha256:${"f".repeat(64)}`;},
        c=>{c.push(structuredClone(c[0]));}]) {
        const c=structuredClone(candidateInputs);mutate(c);assert.equal(select(record,c).length,researchSnapshots.length-1);
      }
      assert.deepEqual(select({...record,record_version:"candidate_decision_record_v3"}),[]);
      assert.deepEqual(select({...record,decision_timestamp:"2026-10-01T20:00:00.000Z"}),[]);
    }
    if (zeroLatestVolume) {
      const fresh = record.candidates.filter(candidate => candidate.data.freshness === "fresh");
      assert.equal(fresh.length, 3);
      for (const candidate of fresh) {
        const indicators = candidate.data.input_snapshot.intraday_indicators;
        assert.equal(indicators.latestVolume, 0, "Original latest zero volume must survive persisted decision inputs");
        // The opening slot has only three closed bars; later slots have the
        // full twelve-bar descriptive window. Neither implies a 24-bar ratio.
        const meanBars = opening ? 3 : 12;
        assert.equal(indicators.averageVolume, Math.round(1000 * (meanBars - 1) / meanBars),
          "The mean must retain zero and the actual opening/later observation count");
        assert.equal(indicators.recentVolumeRatio, null);
        assert.equal(indicators.volumeTrend, "unknown");
      }
    }
    // Restart the actual owner reader independently of mutable scanner caches.
    delete require.cache[require.resolve(join(generated,"reader.cjs"))];
    const restarted=require(join(generated,"reader.cjs"));
    const ownerRead=await restarted.readRecommendationLearningBaselineSource(owner);
    assert.equal(ownerRead.status,"available");
    assert.equal(ownerRead.data.recommendation_scan_runs.length,1);
    const restored=restarted.recommendationScanRunFromPersistenceRow(ownerRead.data.recommendation_scan_runs[0]);
    assert.deepEqual(restarted.candidateDecisionRecordFromScanRun(restored),record);
    assert.deepEqual(restarted.decisionLineageReceiptFromScanRun(restored,record),lineage);
    const otherRead=await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002");
    assert.equal(otherRead.status,"available");
    assert.equal(otherRead.data.recommendation_scan_runs.length,0);
    if(diagnoseOutcomes) {
      assert.equal(ownerRead.data.recommendation_snapshots.length,researchSnapshots.length);
      assert.equal(otherRead.data.recommendation_snapshots.length,0);
      // A separate, explicit synthetic future boundary supplies outcome bars.
      // Exercise the real authenticated route, eligibility, runner, provider
      // adapter, persistence and owner readback; never flip stored visibility.
      clock=OriginalDate.parse(futureBoundary);
      const before=externalRequests;
      const evaluate=()=>require(join(generated,"outcome-route.cjs")).POST(new Request("http://closed-fixture/api/recommendations/evaluate-outcomes",{
        method:"POST",headers:{"x-automation-secret":environment.AUTOMATION_SECRET,"Content-Type":"application/json"},
        body:JSON.stringify({mode:"official_live_today",horizons:[relativePlan60m ? "60m" : "15m"],max_candle_requests:4,max_batches:1}),
      }));
      // Persist a conflicting source timestamp, then exercise the real loader.
      // No provider call or outcome may occur; restore only these isolated rows.
      sql("update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{data_timestamp}','\"2026-10-01T20:00:00.000Z\"'::jsonb);");
      const rejected=await evaluate();
      const rejectedBody=await rejected.json();
      assert.equal(rejected.status,200);
      assert.equal(rejectedBody.eligible_snapshot_count,0);
      assert.equal(externalRequests,before);
      assert.equal(Number(sql("select count(*) from recommendation_outcomes;")),0);
      for(const row of researchSnapshots) sql(`update recommendation_snapshots set payload_json='${JSON.stringify(row.payload_json).replaceAll("'","''")}'::jsonb where id='${row.id}';`);
      // Persisted execution geometry must remain the original decision plan,
      // not merely keep its midpoint while changing its entry bounds or R.
      for(const field of ["entry_low","entry_high","risk_per_share","reward_per_share","risk_reward"]) {
        if(field==="risk_reward") sql("update recommendation_snapshots set risk_reward=risk_reward+1;");
        else sql(`update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{${field}}',to_jsonb(coalesce((payload_json->>'${field}')::numeric,0)+1));`);
        const drifted=await evaluate(),driftedBody=await drifted.json();
        assert.equal(drifted.status,200);
        assert.equal(driftedBody.eligible_snapshot_count,0,`Stored ${field} drift must reject sources before outcome acquisition`);
        assert.equal(externalRequests,before);
        assert.equal(Number(sql("select count(*) from recommendation_outcomes;")),0);
        for(const row of researchSnapshots) sql(`update recommendation_snapshots set risk_reward=${row.risk_reward},payload_json='${JSON.stringify(row.payload_json).replaceAll("'","''")}'::jsonb where id='${row.id}';`);
      }
      // A valid source without its exact durable lineage is not attributable.
      // Missing or cross-run lineage must stop before future candle acquisition.
      const originalRunPayload=scanRuns[0].payload_json;
      for(const invalidRunPayload of [
        Object.fromEntries(Object.entries(originalRunPayload).filter(([name])=>name!=="decision_lineage_receipt")),
        {...originalRunPayload,decision_lineage_receipt:{...originalRunPayload.decision_lineage_receipt,scan_run_fingerprint:"wrong_run"}},
      ]) {
        sql(`update recommendation_scan_runs set payload_json='${JSON.stringify(invalidRunPayload).replaceAll("'","''")}'::jsonb where id='${scanRuns[0].id}';`);
        const noLineage=await evaluate(),noLineageBody=await noLineage.json();
        assert.equal(noLineage.status,200);
        assert.equal(noLineageBody.eligible_snapshot_count,0,"Missing or wrong-run lineage must reject all input-attributed research sources");
        assert.equal(externalRequests,before);
        assert.equal(Number(sql("select count(*) from recommendation_outcomes;")),0);
      }
      sql(`update recommendation_scan_runs set payload_json='${JSON.stringify(originalRunPayload).replaceAll("'","''")}'::jsonb where id='${scanRuns[0].id}';`);
      const outcomeResponse=await evaluate();
      const outcomeBody=await outcomeResponse.json();
      assert.equal(outcomeResponse.status,200,JSON.stringify({outcomeBody,logs:logs.slice(-5)}));
      const outcomes=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;"));
      assert.equal(outcomes.length,Math.min(4,researchSnapshots.length),JSON.stringify({status:outcomeBody.status,
        summary:outcomeBody.summary,eligible:outcomeBody.eligible_snapshot_count,reasons:outcomeBody.ineligible_reasons,
        batches:JSON.parse(sql("select coalesce(jsonb_agg(jsonb_build_object('id',id,'batch_type',batch_type,'status',status,'capture_version',payload_json->>'completed_input_research_capture_version')),'[]') from recommendation_batches;"))}));
      assert.equal(externalRequests-before,Math.min(4,researchSnapshots.length));
      assert(outcomes.every(row=>researchSnapshots.some(snapshot=>snapshot.snapshot_fingerprint===row.snapshot_fingerprint)));
      const futureRead=await restarted.readRecommendationLearningBaselineSource(owner);
      assert.equal(futureRead.data.recommendation_outcomes.length,outcomes.length);
      const otherFuture=await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002");
      assert.equal(otherFuture.data.recommendation_outcomes.length,0);
      assert.equal(Number(sql("select count(*) from recommendation_snapshots where status <> 'hidden';")),0);
      outcomeChainEvidence={synthetic_future_boundary:futureBoundary,
        research_sources:researchSnapshots.length,persisted_outcomes:outcomes.length,
        separate_synthetic_outcome_requests:externalRequests-before,
        unobservable_population_members:8-researchSnapshots.length,
        outcome_budget_pending_sources:researchSnapshots.length-outcomes.length};
      // The counts above describe the first four-request pass. Resume after a
      // route restart: finish only deferred sources, retaining the original
      // completed rows. A third pass must perform no acquisition or rewrite.
      delete require.cache[require.resolve(join(generated,"outcome-route.cjs"))];
      const resumedResponse=await evaluate(),resumedBody=await resumedResponse.json();
      assert.equal(resumedResponse.status,200,JSON.stringify(resumedBody));
      const resumedRows=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;"));
      assert.equal(resumedRows.length,researchSnapshots.length,"Budget-deferred sources must resume");
      assert.equal(externalRequests-before,researchSnapshots.length,"Completed sources must not acquire data again");
      for(const initial of outcomes) assert.deepEqual(resumedRows.find(row=>row.id===initial.id),initial);
      const completedRows=resumedRows.sort((a,b)=>a.id.localeCompare(b.id));
      delete require.cache[require.resolve(join(generated,"outcome-route.cjs"))];
      const repeatedResponse=await evaluate(),repeatedBody=await repeatedResponse.json();
      assert.equal(repeatedResponse.status,200,JSON.stringify(repeatedBody));
      assert.equal(externalRequests-before,researchSnapshots.length);
      const repeatedRows=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;"));
      assert.deepEqual(repeatedRows.sort((a,b)=>a.id.localeCompare(b.id)),completedRows);
      const resumedRead=await restarted.readRecommendationLearningBaselineSource(owner);
      assert.equal(resumedRead.data.recommendation_outcomes.length,researchSnapshots.length);
      assert.equal((await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002")).data.recommendation_outcomes.length,0);
      outcomeChainEvidence.resumption={persisted_outcomes:resumedRows.length,
        additional_synthetic_outcome_requests:resumedRows.length-outcomes.length,
        completed_repeat_requests:0,prior_outcomes_unchanged:true};
      // Restarted owner read -> actual decoder -> actual baseline/evaluation
      // consumers. No source-version fabrication or readiness promotion.
      const learningEvidence=async()=>{
        const read=await restarted.readRecommendationLearningBaselineSource(owner);
        const source=restarted.parseRecommendationLearningBaselineSource(read.data);
        assert(source,"Actual owner read must decode all retained research rows");
        const readiness=restarted.buildRecommendationLearningBaselineReadiness(source);
        const segmentation=restarted.buildRecommendationLearningBaselineSegmentation(source);
        const plans=restarted.buildRecommendationLearningEvaluationPlans({...source,segmentation});
        assert.equal(plans.plans.length,1);
        assert.equal(plans.plans[0].outcome_population.research_primary_outcome_count,
          readiness.counterfactual_coverage.research_candidate_outcomes_collected);
        assert.equal(readiness.status,"not_ready");
        assert.equal(plans.plans[0].status,"not_freeze_eligible");
        assert.equal(plans.plans[0].metrics,null);
        assert(readiness.blockers.includes("completed_input_research_requires_prospective_baseline_contract"));
        assert.equal(readiness.decision_population.not_evaluated_candidate_count,
          record.candidates.filter(candidate=>candidate.disposition==="not_evaluated").length);
        assert.equal(Object.values(readiness.decision_population).slice(0,4).reduce((sum,count)=>sum+count,0),8,
          "The full candidate denominator survives; stale rejections are not mislabeled unobserved members");
        assert.equal(readiness.visible_outcomes.primary_outcome_count,0);
        assert.equal(readiness.confidence_calibration.numeric_probability_sample_count,0);
        return {source,readiness,plans};
      };
      const learning=await learningEvidence();
      const outcomeLink=learning.readiness.relative_plan_context_outcomes;
      assert.equal(outcomeLink.length,1);
      assert.equal(outcomeLink[0].contract_version,"relative_plan_context_canonical_outcomes_v1");
      assert.equal(outcomeLink[0].scan_run_fingerprint,record.scan_run_fingerprint);
      assert.equal(outcomeLink[0].original_population_count,8);
      assert.equal(outcomeLink[0].candidates.length,8);
      assert.equal(outcomeLink[0].selected_60m_receipt_count,relativePlan60m ? researchSnapshots.length : 0);
      assert.equal(outcomeLink[0].canonical_outcome_count,relativePlan60m ? researchSnapshots.length : 0,
        "A retained fifteen-minute outcome cannot replace the frozen sixty-minute primary horizon");
      assert.equal(outcomeLink[0].missing_outcome_count,relativePlan60m ? 8-researchSnapshots.length : 8);
      assert.equal(outcomeLink[0].status,"evidence_incomplete");
      assert.equal(outcomeLink[0].population_complete,false);
      assert.equal(outcomeLink[0].baseline.precision_at_3.value,null);
      assert.equal(outcomeLink[0].challenger.expectancy_r.value,null);
      assert.equal(outcomeLink[0].precision_delta,null);
      assert.equal(outcomeLink[0].quality_improvement_claimed,false);
      if(relativePlan60m) {
        assert(outcomeLink[0].candidates.some(row=>row.terminal_outcome==="target_before_stop" && row.r_result>0));
        assert(outcomeLink[0].candidates.some(row=>row.terminal_outcome==="stop_before_target" && row.r_result===-1));
        assert(outcomeLink[0].candidates.filter(row=>row.outcome_status==="missing").every(row=>row.r_result===null && row.positive_outcome===null));
      }
      assert.deepEqual((await learningEvidence()).readiness.relative_plan_context_outcomes,outcomeLink);
      const shadow=learning.readiness.relative_plan_context_shadow;
      assert.equal(shadow.length,1,"Actual persisted owner read exposes the original decision's shadow diagnostic");
      assert.equal(shadow[0].comparison_version,"relative_plan_context_shadow_v1");
      assert.equal(shadow[0].scan_run_fingerprint,record.scan_run_fingerprint);
      assert.equal(shadow[0].decision_timestamp,record.decision_timestamp);
      assert.equal(shadow[0].original_population_count,8);
      assert.equal(shadow[0].candidates.length,8,"Unobserved original members survive Postgres/SDK/learning restart");
      assert.equal(shadow[0].assessed_count+shadow[0].unassessed_count,8);
      assert.equal(shadow[0].live_ranking_effect,false);
      assert.equal(shadow[0].publication_effect,false);
      assert.equal(shadow[0].quality_improvement_claimed,false);
      assert.notEqual(shadow[0].status,"conflicting");
      const expectedAssessed=opening?0:researchSnapshots.length;
      assert.equal(shadow[0].status,opening?"unavailable":"partial");
      assert.equal(shadow[0].assessed_count,expectedAssessed,
        "Every complete original 60m context is assessed; an opening window is never rescaled into an hour");
      assert.equal(shadow[0].unassessed_count,8-expectedAssessed,
        "Missing or short-window original members remain explicit, never dropped or imputed");
      if(opening) assert.equal(shadow[0].candidates.filter(c=>c.reason==="short_closed_range_window").length,
        researchSnapshots.length,"Valid short-window sources keep their precise unassessed reason");
      assert.deepEqual((await learningEvidence()).readiness.relative_plan_context_shadow,shadow,
        "Repeated actual durable read cannot recompute the original plan/input from mutable cache");
      assert.equal(learning.source.snapshots.filter(snapshot=>snapshot.intake_quality_json?.result_kind==="recommendation_intake_quality").length,researchSnapshots.length,
        "Each retained completed-input research source must keep its original intake assessment through owner readback");
      assert.equal(learning.readiness.intake_quality_provenance.status,"complete");
      assert.equal(learning.readiness.intake_quality_provenance.valid_receipt_count,researchSnapshots.length);
      const reordered = learning.source.snapshots.map(snapshot=>({ ...snapshot,
        intake_quality_json:Object.fromEntries(Object.entries(snapshot.intake_quality_json).reverse()) }));
      assert.equal(restarted.buildRecommendationIntakeQualityProvenance(reordered).status,"complete",
        "JSONB key order must not invalidate the same assessment");
      const mixed = restarted.buildRecommendationIntakeQualityProvenance([
        ...learning.source.snapshots,
        {intake_quality_json:{...researchSnapshots[0].intake_quality_json,result_version:"1.1"}},
      ]);
      assert.equal(mixed.status,"mixed");
      assert.deepEqual(mixed.result_versions,["1.1","1.2"]);
      for(const snapshot of learning.source.snapshots)
        assert.deepEqual(snapshot.intake_quality_json,researchSnapshots.find(row=>row.id===snapshot.id).intake_quality_json,
          "Outcome evaluation and restart may not recompute or upgrade the original assessment");
      // Missing or malformed diagnostics remain measurement gaps, not a reason
      // to hide canonical outcomes or grant publication/freeze authority.
      for(const [value,status,blocker] of [
        ["null","not_recorded","outcome_sample_intake_quality_not_recorded"],
        ["'{}'::jsonb","incomplete","outcome_sample_intake_quality_incomplete"],
        ["intake_quality_json || '{\"status\":\"accepted\",\"grade\":\"A\",\"accepted_for_visible_list\":true}'::jsonb",
          "incomplete","outcome_sample_intake_quality_incomplete"],
        ["intake_quality_json || '{\"evaluated_at\":\"2026-10-01T20:00:00.000Z\"}'::jsonb",
          "incomplete","outcome_sample_intake_quality_incomplete"],
        ["intake_quality_json || '{\"result_id\":\"recommendation-intake-research-wrong-candidate\"}'::jsonb",
          "incomplete","outcome_sample_intake_quality_incomplete"],
        ["intake_quality_json || '{\"warnings\":[],\"checks\":[]}'::jsonb",
          "incomplete","outcome_sample_intake_quality_incomplete"],
        ["intake_quality_json || '{\"risk_reward_ratio\":99}'::jsonb",
          "incomplete","outcome_sample_intake_quality_incomplete"],
      ]){
        sql(`update recommendation_snapshots set intake_quality_json=${value};`);
        const missing=await learningEvidence();
        assert.equal(missing.readiness.intake_quality_provenance.status,status);
        assert.equal(missing.readiness.intake_quality_provenance.accepted_for_visible_list_count,0);
        assert(missing.readiness.blockers.includes(blocker));
        assert.equal(missing.readiness.counterfactual_coverage.research_candidate_outcomes_collected,researchSnapshots.length);
        for(const row of researchSnapshots)
          sql(`update recommendation_snapshots set intake_quality_json='${JSON.stringify(row.intake_quality_json).replaceAll("'","''")}'::jsonb where id='${row.id}';`);
      }
      assert.equal(learning.readiness.counterfactual_coverage.research_candidate_outcomes_collected,researchSnapshots.length,
        "Retained exact-input canonical research outcomes must reach learning without an invented upstream version");
      assert.equal(learning.readiness.decision_time_source_provenance.upstream_provider_version_unavailable_count,researchSnapshots.length);
      assert(learning.source.snapshots.every(snapshot=>snapshot.payload_json.provider_version===null));
      assert(learning.source.snapshots.every(snapshot=>restarted.recommendationDecisionSourceProvenanceFromSnapshot(snapshot).status==="incomplete"),
        "Legacy v1 provenance must remain strict");
      // Persist tampering after outcomes exist, then use actual owner readback.
      // Stored outcomes cannot re-authorize corrupted original inputs/lineage.
      const negativeUpdates=[
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{is_demo}', 'true'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{is_mock}', 'true'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{provider_source}', '\"wrong_provider\"'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{provider_version}', '\"invented_upstream_version\"'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{intraday_indicator_response_identity}', 'null'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{decision_feature_vector,feature_values,latest_price}', '999999'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{decision_feature_vector,feature_values,intraday_vwap}', '999999'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{decision_feature_vector,contract_version}', '\"recommendation_decision_feature_vector_v1\"'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{build_marker}', '\"wrong_build\"'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{market_data_adapter_version}', '\"wrong_adapter\"'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{data_timestamp}', '\"2026-10-01T20:00:00.000Z\"'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{scanner_decision_input_snapshot,features,proposed_entry_low}', '999999'::jsonb);",
        "update recommendation_snapshots set payload_json=jsonb_set(payload_json,'{research_capture_version}', '\"wrong_capture_version\"'::jsonb);",
      ];
      for(const update of negativeUpdates){
        sql(update);
        const rejectedLearning=await learningEvidence();
        assert.equal(rejectedLearning.readiness.counterfactual_coverage.research_candidate_outcomes_collected,0);
        assert.equal(rejectedLearning.readiness.relative_plan_context_outcomes[0].canonical_outcome_count,0);
        for(const row of researchSnapshots) sql(`update recommendation_snapshots set payload_json='${JSON.stringify(row.payload_json).replaceAll("'","''")}'::jsonb where id='${row.id}';`);
      }
      for(const invalidRunPayload of [
        Object.fromEntries(Object.entries(originalRunPayload).filter(([name])=>name!=="decision_lineage_receipt")),
        {...originalRunPayload,decision_lineage_receipt:{...originalRunPayload.decision_lineage_receipt,scan_run_fingerprint:"wrong_run"}},
      ]){
        sql(`update recommendation_scan_runs set payload_json='${JSON.stringify(invalidRunPayload).replaceAll("'","''")}'::jsonb where id='${scanRuns[0].id}';`);
        assert.equal((await learningEvidence()).readiness.counterfactual_coverage.research_candidate_outcomes_collected,0);
      }
      sql(`update recommendation_scan_runs set payload_json='${JSON.stringify(originalRunPayload).replaceAll("'","''")}'::jsonb where id='${scanRuns[0].id}';`);
      const restoredLearning=await learningEvidence();
      assert.equal(restoredLearning.readiness.counterfactual_coverage.research_candidate_outcomes_collected,researchSnapshots.length);
      const duplicateSources={...learning.source,scanRuns:[...learning.source.scanRuns,...learning.source.scanRuns]};
      assert.equal(restarted.buildRecommendationLearningBaselineReadiness(duplicateSources).counterfactual_coverage.research_candidate_outcomes_collected,0);
      const duplicateOutcomes={...learning.source,outcomes:[...learning.source.outcomes,...learning.source.outcomes]};
      assert.equal(restarted.buildRecommendationLearningBaselineReadiness(duplicateOutcomes).counterfactual_coverage.research_candidate_outcomes_collected,0);
      const otherSource=restarted.parseRecommendationLearningBaselineSource((await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002")).data);
      assert(otherSource);
      assert.equal(restarted.buildRecommendationLearningBaselineReadiness(otherSource).decision_records.attributable_count,0);
      assert.equal(externalRequests-before,researchSnapshots.length);
      assert.deepEqual(JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_outcomes t;")).sort((a,b)=>a.id.localeCompare(b.id)),completedRows);
      outcomeChainEvidence.learning_admission={
        readiness_version:learning.readiness.contract_version,
        plan_version:learning.plans.contract_version,
        relative_plan_context_shadow:{
          comparison_version:shadow[0].comparison_version,
          status:shadow[0].status,
          original_population_count:shadow[0].original_population_count,
          assessed_count:shadow[0].assessed_count,
          unassessed_count:shadow[0].unassessed_count,
          restart_stable:true,
          actual_provider_requests:0,
          live_ranking_effect:false,
          publication_effect:false,
          quality_improvement_claimed:false,
        },
        relative_plan_context_outcomes:{
          contract_version:outcomeLink[0].contract_version,
          primary_horizon:outcomeLink[0].primary_horizon,status:outcomeLink[0].status,
          original_population_count:outcomeLink[0].original_population_count,
          selected_60m_receipt_count:outcomeLink[0].selected_60m_receipt_count,
          resolved_60m_outcomes:outcomeLink[0].canonical_outcome_count,
          missing_outcomes:outcomeLink[0].missing_outcome_count,
          positive_labels:outcomeLink[0].candidates.filter(row=>row.positive_outcome===true).length,
          negative_terminal_labels:outcomeLink[0].candidates.filter(row=>row.terminal_outcome==="stop_before_target").length,
          precision_delta:outcomeLink[0].precision_delta,
          baseline_precision:outcomeLink[0].baseline.precision_at_3.value,
          challenger_expectancy_r:outcomeLink[0].challenger.expectancy_r.value,
          restart_stable:true,full_charter_accepted:false,
          actual_provider_requests:0,live_ranking_effect:false,publication_effect:false,
          quality_improvement_claimed:false,
        },
        canonical_research_outcomes:researchSnapshots.length,
        retained_intake_assessments:learning.readiness.intake_quality_provenance.valid_receipt_count,
        intake_assessment_provenance:learning.readiness.intake_quality_provenance.status,
        intake_assessment_versions:learning.readiness.intake_quality_provenance.result_versions,
        intake_assessment_statuses:learning.readiness.intake_quality_provenance.result_statuses,
        intake_assessment_grades:learning.readiness.intake_quality_provenance.grades,
        original_intake_assessments_unchanged:true,
        contradictory_intake_assessments_rejected:true,
        assessment_key_order_preserved:true,
        mixed_assessment_versions_segmented:true,
        upstream_provider_version_unavailable:researchSnapshots.length,
        unresolved_population_members:8-researchSnapshots.length,
        freeze_status:learning.readiness.status,
        actual_provider_requests:0,
        legacy_source_gate_unchanged:true,
        tampered_source_and_lineage_admitted:0,
      };
      externalRequests=before;
      clock=OriginalDate.parse(slot)+20000;
    }
    const duplicate=await scheduler(new Request("http://closed-scheduler",{method:"POST",
      body:JSON.stringify({next_run:expiry})}),{deploy:{id:identity.deploy_id,context:"production",published:true}});
    assert.equal(duplicate.status,204);
    assert.equal(externalRequests,8);
  }
  if(benchmarkReuse) {
    assert.equal(record.candidates.length,8); // The first complete original population is never replaced.
    const firstFresh=record.candidates.filter(candidate=>candidate.data.freshness==="fresh").length;
    assert.equal(firstFresh,mixedHistory?(minimumOrderBaseline&&!invalidMixedHistory?5:3):cold?3:6);
    const originalRegime=scanRuns[0].payload_json.market_regime;
    if(invalidBenchmarkReuse) sql(`update recommendation_scan_runs set payload_json=jsonb_set(payload_json,
      '{market_regime,input_evidence,qqq,content_sha256}','"invalid-fixture-digest"') where id='${scanRuns[0].id}';`);
    const firstRequests=externalRequests;
    assert.equal(externalBenchmarkRequests,2);
    clock=OriginalDate.parse(expiry)+20000;
    externalRequests=0;
    externalBenchmarkRequests=0;
    const second=await scheduler(new Request("http://closed-scheduler",{method:"POST",body:JSON.stringify({next_run:nextSlot})}),
      {deploy:{id:identity.deploy_id,context:"production",published:true}});
    assert.equal(second.status,200,JSON.stringify({body:await second.json(),logs:logs.slice(-15)}).slice(-12000));
    const allRuns=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_scan_runs t;"));
    assert.equal(allRuns.length,2);
    const secondRun=allRuns.find(run=>run.id!==scanRuns[0].id);
    const secondDecision=readers.candidateDecisionRecordFromScanRun(secondRun);
    assert(secondDecision && readers.decisionLineageReceiptFromScanRun(secondRun,secondDecision));
    assert.equal(secondDecision.candidates.length,8);
    for (const [source,decision,sourceSlot] of [[scanRuns[0],record,slot],[secondRun,secondDecision,expiry]]) {
      const originalSelection=readers.buildRealScannerBaseCandidateSelection({
        scanWindow:readers.getIntradayScanWindow(new OriginalDate(sourceSlot)),requestedScanBudget:8,
        selectionMode:"scheduled_rotating",now:new OriginalDate(sourceSlot)}).candidates;
      assert.deepEqual(decision.candidates.map(candidate=>candidate.ticker).sort(),
        originalSelection.map(candidate=>candidate.ticker).sort());
      if(mixedHistory) {
        const plan=source.payload_json.active_scan_trace.market_data_fetch.completed_input_acquisition;
        if(!minimumOrderBaseline) assert.equal(plan,undefined);
        else {
          assert.equal(plan.policy_version,minimumOrderBaseline?"completed_input_minimum_requests_first_v1":"completed_input_fair_cost_ties_v1");
          assert.equal(plan.provider_call_cap,sourceSlot===slot?6:8);
          assert.deepEqual(plan.original_members.map(member=>member.ticker),originalSelection.map(candidate=>candidate.ticker));
          assert.deepEqual(plan.original_members.map(member=>member.ticker_index),[0,1,2,3,4,5,6,7]);
          const offset=Math.floor(OriginalDate.parse(sourceSlot)/900000)%8;
          const costs=invalidMixedHistory?[2,2,2,2,2,2,2,2]:[2,2,2,2,1,1,1,1];
          const expectedOrder=[0,1,2,3,4,5,6,7].sort((a,b)=>costs[a]-costs[b] ||
            (minimumOrderBaseline?a-b:(a-offset+8)%8-(b-offset+8)%8));
          assert.deepEqual(plan.acquisition_order,expectedOrder);
          if(!minimumOrderBaseline) assert.equal(plan.cost_tie_offset,offset);
          assert.deepEqual(plan.original_members.map(member=>member.estimated_requests),invalidMixedHistory?[2,2,2,2,2,2,2,2]:[2,2,2,2,1,1,1,1]);
          for(const member of plan.original_members) {
            assert.equal(member.current_context_sha256,null);
            assert.equal(member.historical_captured_at,member.estimated_requests===1?"2026-10-01T17:00:00.000Z":null);
            if(member.estimated_requests===1) {
              const original=decision.candidates.find(candidate=>candidate.ticker===member.ticker);
              assert.equal(original.data.input_snapshot.historical_context.content_sha256,member.historical_context_sha256);
              assert.equal(original.data.input_snapshot.historical_context.captured_at,member.historical_captured_at);
            } else assert.equal(member.historical_context_sha256,null);
          }
        }
      }
      assert(OriginalDate.parse(source.observed_at)<=OriginalDate.parse(decision.decision_timestamp));
      assert(OriginalDate.parse(decision.decision_timestamp)<=OriginalDate.parse(source.completed_at));
    }
    const expectReuse=!invalidBenchmarkReuse && !baselineBenchmarkReuse;
    const fresh=secondDecision.candidates.filter(candidate=>candidate.data.freshness==="fresh").length;
    assert.equal(fresh,mixedHistory?(minimumOrderBaseline&&!invalidMixedHistory?6:4):cold?(expectReuse?4:3):(expectReuse?8:6),JSON.stringify({
      selected:secondDecision.candidates.map(candidate=>({ticker:candidate.ticker,freshness:candidate.data.freshness,
        daily:candidate.data.input_snapshot?.historical_context?.captured_at,
        current:candidate.data.input_snapshot?.current_session?.latest_bar_started_at,gaps:candidate.data.gap_codes})),
      trace:logs.filter(items=>JSON.stringify(items).includes("fresh_call_admission")),
    }).slice(-6000));
    assert.equal(externalRequests,8);
    assert.equal(externalBenchmarkRequests,expectReuse?0:2);
    const retained=secondRun.payload_json.market_regime.input_evidence;
    if(expectReuse) {
      assert.equal(retained.reuse.source_scan_run_id,scanRuns[0].id);
      assert.equal(retained.reuse.source_scan_run_fingerprint,scanRuns[0].run_fingerprint);
      assert.equal(retained.reuse.original_classified_at,originalRegime.input_evidence.evaluated_at);
      assert.equal(retained.reuse.scanner_provider_call_cap,8);
      assert.equal(retained.reuse.benchmark_provider_calls,0);
      assert.deepEqual(retained.spy,originalRegime.input_evidence.spy);
      assert.deepEqual(retained.qqq,originalRegime.input_evidence.qqq);
    } else assert.equal(retained.reuse,undefined);
    const allClaims=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from basic_free_discovery_credit_reservations t;"));
    assert.equal(allClaims.length,2);
    assert(allClaims.every(claim=>claim.requested_credits===8 && claim.status==="completed" && claim.finalized_at));
    const allAttempts=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from scheduled_scan_attempts t;"));
    const allCycles=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from observation_cycle_receipts t;"));
    assert.equal(allAttempts.length,2);
    assert.equal(allCycles.length,2);
    assert(allCycles.every(cycle=>cycle.cycle_status==="completed"));
    const cycleReadback=readers.buildObservationCycleReadback(allCycles);
    assert.equal(cycleReadback.status,"available"); assert.equal(cycleReadback.invalid_row_count,0);
    delete require.cache[require.resolve(join(generated,"reader.cjs"))];
    const restarted=require(join(generated,"reader.cjs"));
    const owned=await restarted.readRecommendationLearningBaselineSource(owner);
    const source=restarted.parseRecommendationLearningBaselineSource(owned.data);
    assert(source && source.scanRuns.length===2);
    assert.deepEqual(source.scanRuns.find(run=>run.id===secondRun.id).payload_json.market_regime.input_evidence,retained);
    const latestOwned=owned.data.recommendation_scan_runs.find(run=>run.id===secondRun.id);
    const restartedReuse=await restarted.readOwnedCompletedBenchmarkReuse({row:latestOwned,owner,now:new OriginalDate(clock)});
    assert(restartedReuse && await restarted.isValidCompletedBenchmarkReuse(restartedReuse,new OriginalDate(clock)),
      JSON.stringify({data_mode:latestOwned?.data_mode,status:latestOwned?.status,owner:latestOwned?.owner_user_id,
        input_policy:secondDecision.versions.input_policy_version,observed_at:latestOwned?.observed_at,
        completed_at:latestOwned?.completed_at,decision_timestamp:secondDecision.decision_timestamp}));
    assert.equal(await restarted.isValidCompletedBenchmarkReuse(structuredClone(restartedReuse),new OriginalDate(clock)),false);
    assert.deepEqual(restartedReuse.market_regime.input_evidence.spy,retained.spy);
    assert.deepEqual(restartedReuse.market_regime.input_evidence.qqq,retained.qqq);
    const other=await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002");
    assert.equal(other.data.recommendation_scan_runs.length,0);
    const secondDuplicate=await scheduler(new Request("http://closed-scheduler",{method:"POST",body:JSON.stringify({next_run:nextSlot})}),
      {deploy:{id:identity.deploy_id,context:"production",published:true}});
    assert.equal(secondDuplicate.status,204); assert.equal(externalRequests,8);
    benchmarkReuseEvidence={mode:baselineBenchmarkReuse?"original_committed_baseline":invalidBenchmarkReuse?"invalid_original_falls_back":"validated_owner_reuse",
      baseline_revision:mixedHistory?acquisitionBaselineRevision:reuseBaselineRevision,
      history_start:mixedHistory?"mixed":cold?"cold":"prewarmed",
      ...(mixedHistory ? {acquisition_mode:minimumOrderBaseline?"minimum_requests_first":"original_order"} : {}),
      ...(mixedHistory ? {historical_context_integrity:invalidMixedHistory?"tampered":"valid"} : {}),
      first_scan_requests:firstRequests,second_scan_requests:externalRequests,
      first_fresh_inputs:firstFresh,second_fresh_inputs:fresh,original_members_per_decision:8,
      attempts:allAttempts.length,cycles:allCycles.length,reservations:allClaims.length,
      reserved_credits:allClaims.reduce((sum,claim)=>sum+claim.requested_credits,0),benchmark_calls_second:externalBenchmarkRequests,
      original_source_clocks_unchanged:expectReuse,restarted_owner_read:true,wrong_owner_runs:0};
  }
  assert.equal(Number(sql("select count(*) from recommendations;")),syntheticPublicationCount);
  assert.equal(Number(sql("select count(*) from positions;")),0);
  // Disable/expiry are exercised by the real scheduled entrypoint, not a mock.
  process.env.TURE_OBSERVATION_SERIES_ENABLED="false";
  clock=OriginalDate.parse(expiry)+20000;
  const cleanup=await scheduler(new Request("http://closed-scheduler",{method:"POST",
    body:JSON.stringify({next_run:nextSlot})}),{deploy:{id:identity.deploy_id,context:"production",published:true}});
  assert.equal(cleanup.status,204);
  assert.equal(Number(sql("select count(*) from scheduled_scan_attempts;")),benchmarkReuse?2:1);
  assert.equal(Number(sql("select count(*) from recommendations;")),syntheticPublicationCount);
  originalLog(JSON.stringify({evidence_mode:"synthetic_closed_packaged_input_runtime_actual_source_schema",
    scenario:benchmarkReuse?"retained_benchmark_two_slot":closing?"closing_research_only":wrongPolicy?"invalid_policy":opening?"opening_cold_history":cold?"cold_history":"warm_history_restart",
    ...(closing?{late_publication_withheld:true,original_research_sources:researchSnapshots.length}:{}),
    setup_synthetic_requests:setupRequests,scheduled_synthetic_requests:benchmarkReuse?
      benchmarkReuseEvidence.first_scan_requests+benchmarkReuseEvidence.second_scan_requests:externalRequests,
    ...(benchmarkReuse ? {benchmark_reuse_evidence:benchmarkReuseEvidence} : {}),
    attempts:benchmarkReuse?benchmarkReuseEvidence.attempts:rows.length,
    cycles:benchmarkReuse?benchmarkReuseEvidence.cycles:receipts.length,
    claims:benchmarkReuse?benchmarkReuseEvidence.reservations:claims.length,decision_version:record?.record_version,
    fresh_inputs:benchmarkReuse?benchmarkReuseEvidence.second_fresh_inputs:record?.candidates.filter(c=>c.data.freshness==="fresh").length,
    ...(diagnoseOutcomes ? {outcome_chain_evidence:outcomeChainEvidence,outcome_chain_diagnostic:{learning_acceleration_enabled:true,
      candidate_population:record?.candidates.length,
      research_snapshot_count:researchSnapshots.length,
      research_snapshots:researchSnapshots.map(row=>({ticker:row.ticker,
        candidate_id:row.payload_json?.candidate_id??null,
        input_policy_version:row.payload_json?.scanner_input_policy_version??null,
        research_purpose:row.payload_json?.research_purpose??null,
        decision_input_snapshot_present:row.payload_json?.scanner_decision_input_snapshot!==undefined,
        source_timestamp:row.payload_json?.data_timestamp??null,
        freshness:record?.candidates.find(candidate=>candidate.candidate_id===row.payload_json?.candidate_id)?.data.freshness??null}))}} : {}),
    ...(zeroLatestVolume ? { zero_latest_volume_inputs:record.candidates.filter(candidate=>candidate.data.input_snapshot?.intraday_indicators?.latestVolume===0).length } : {}),
    ...(missingLatestVolume ? {missing_volume_research_sources:researchSnapshots.length} : {}),
    ...((staleBenchmark || partialBenchmark) ? {benchmark_input_fitness:staleBenchmark?"stale_rejected_not_no_trade":"partial_current_bar_discarded",
      retained_market_regime_input_policy:scanRuns[0]?.payload_json.market_regime?.input_evidence?.policy_version??null,
      terminal_reservation_status:claims[0]?.status,decision_count:scanRuns.length} : {}),
    ...(contextLatency ? {context_latency_proof:scannerRateLimit?"preserved_scanner_rate_limit":expectContextTimeout?"reproduced_timeout":"completed",
      bounded_duration_ms:boundedDurationMs,route_budget_ms:23000,cleanup_reserve_ms:3000,
      synthetic_scanner_delay_ms:1800,synthetic_benchmark_delay_ms:benchmarkDelayMs,
      pending_synthetic_transports:pendingSyntheticTransports} : {}),
    actual_provider_requests:0,production_actions:0,publications:syntheticPublicationCount,
    production_publications:0,broker_actions:0,cleanup:"inert"}));
  if(diagnoseOutcomes && !wrongPolicy) {
    assert.equal(researchSnapshots.length,cold?3:6,
      "Fresh, non-published versioned inputs must retain research outcome sources during a regular afternoon session");
  }
  }

} catch (error) {
  try { originalLog(docker("inspect", "--format", "{{json .HostConfig.PortBindings}} {{json .NetworkSettings.Ports}} {{.State.Status}} {{.State.Error}}", api)); } catch { /* May not exist. */ }
  originalLog(dockerLogs(api));
  throw error;
} finally {
  globalThis.Date = OriginalDate; globalThis.fetch = originalFetch; console.log = originalLog;
  Reflect.deleteProperty(globalThis, "Netlify");
  for (const name of Object.keys(process.env)) if (!(name in originalEnvironment)) delete process.env[name];
  Object.assign(process.env, originalEnvironment);
  for (const name of [api, database]) { try { docker("stop", name); } catch { /* May not have started. */ } }
  try { docker("network", "rm", network); } catch { /* May not have been created. */ }
  rmSync(directory, { recursive: true, force: true });
}
