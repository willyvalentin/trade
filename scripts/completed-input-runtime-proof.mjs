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
import { buildSync } from "esbuild";

const root = process.cwd();
const cold = process.argv.includes("--cold");
const wrongPolicy = process.argv.includes("--wrong-policy");
const diagnoseOutcomes = process.argv.includes("--diagnose-outcomes");
const opening = process.argv.includes("--opening");
assert(!opening || cold, "Opening proof has no pre-session warm-history acquisition");
const slot = opening ? "2026-10-01T13:45:00.000Z" : "2026-10-01T17:30:00.000Z";
const expiry = new Date(Date.parse(slot) + 900000).toISOString();
const nextSlot = new Date(Date.parse(expiry) + 900000).toISOString();
const futureBoundary = new Date(Date.parse(slot) + 1800000).toISOString();
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
let clock = 0;
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
  buildSync({ ...options, entryPoints: [resolve(root, "app/api/automation/run-scan/route.ts")], outfile: join(generated, "scheduled-scan-runtime.cjs") });
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
      export { buildRealScannerBaseCandidateSelection } from './lib/real-scanner-candidate-generation';
      export { getUsEquityMarketSession } from './lib/us-equity-market-calendar';
      export { getIntradayScanWindow } from './lib/intraday-scan-window';
      export { readRecommendationLearningBaselineSource } from './lib/server/application-data-access';
      export { parseRecommendationLearningBaselineSource } from './lib/recommendation-learning-baseline-source';
      export { buildRecommendationLearningBaselineReadiness } from './lib/recommendation-learning-baseline-readiness';
      export { buildRecommendationLearningBaselineSegmentation } from './lib/recommendation-learning-baseline-segments';
      export { buildRecommendationLearningEvaluationPlans } from './lib/recommendation-learning-evaluation-plan';
      export { recommendationDecisionSourceProvenanceFromSnapshot } from './lib/recommendation-decision-source-provenance';
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
    TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC: expiry,
    TURE_OBSERVATION_SERIES_MAX_ATTEMPTS: "1",
    TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: "8",
    TURE_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED: "false",
    TURE_SCANNER_INPUT_POLICY_VERSION: wrongPolicy ? "unknown_input_policy" : "completed_daily_intraday_input_v1",
    TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED: "false",
    TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED: "false",
    TURE_NORMAL_SCAN_ONE_SHOT_ENABLED: "false", TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED: "false",
    TURE_INTERNAL_PAPER_WORKER_ENABLED: "false",
    TURE_LEARNING_ACCELERATION_ENABLED: diagnoseOutcomes ? "true" : "false",
    TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET: "800", TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET: "8",
    TWELVE_DATA_API_KEY: "synthetic-boundary-only",
    OPENAI_API_KEY: "synthetic-boundary-only-no-ai-calls-permitted",
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
      values('2026-10-01','polygon',true,'Synthetic CLOSED calendar','trading_day','09:30','16:00','{}','2026-10-01T17:30:00Z');
    insert into user_settings(owner_user_id) values('${owner}');`);
  globalThis.Date = class extends OriginalDate {
    constructor(...args) { super(...(args.length ? args : [clock])); }
    static now() { return clock; }
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
      const interval = url.searchParams.get("interval");
      const intraday = interval !== "1day";
      const values = [];
      if (intraday) {
        assert.equal(interval,"5min");
        for (let time=OriginalDate.parse("2026-10-01T13:30:00Z"); time<clock; time+=300000) {
          const datetime=new Intl.DateTimeFormat("sv-SE",{timeZone:"America/New_York",
            year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new OriginalDate(time));
          values.unshift({datetime,open:"100",high:"101",low:"99",close:"100",volume:"1000"});
        }
      } else {
        const day=new OriginalDate("2026-09-30T00:00:00Z");
        while(values.length<60) {
          const date=day.toISOString().slice(0,10);
          if(readers.getUsEquityMarketSession(date).session_close) values.unshift({datetime:date,open:"100",high:"103",low:"99",close:"101",volume:"1000"});
          day.setUTCDate(day.getUTCDate()-1);
        }
      }
      return Response.json({meta:{symbol:url.searchParams.get("symbol"),interval,exchange_timezone:"America/New_York"},values});
    }
    if (url.origin !== environment.NEXT_PUBLIC_SUPABASE_URL) throw new Error(`Unexpected external boundary: ${url.hostname}`);
    if (url.pathname === `/auth/v1/admin/users/${owner}`) return Response.json({ user: { id: owner, aud: "authenticated", role: "authenticated" } });
    if (!url.pathname.startsWith("/rest/v1/")) throw new Error("Unexpected fixture API path");
    const request=new Request(input,init);
    return originalFetch(`${apiOrigin}${url.pathname.slice("/rest/v1".length)}${url.search}`, {
      method:request.method,headers:request.headers,
      ...(!["GET","HEAD"].includes(request.method)?{body:await request.text()}:{})
    });
  };
  console.log = (...items) => logs.push(items);
  globalThis.Netlify = { env: { get: (name) => process.env[name] } };
  // Warm history is acquired by the actual scanner/SDK, not seeded JSON.
  // Its sixteen synthetic requests are separate setup, never hidden in scan cost.
  clock=OriginalDate.parse("2026-10-01T17:00:00Z");
  let setupRequests=0;
  if(!cold && !wrongPolicy) {
    const selected=readers.buildRealScannerBaseCandidateSelection({scanWindow:readers.getIntradayScanWindow(new Date("2026-10-01T17:30:00Z")),requestedScanBudget:8,
      selectionMode:"scheduled_rotating",now:new OriginalDate("2026-10-01T17:30:00Z")}).candidates;
    assert.equal(selected.length,8);
    for(const candidate of selected) await readers.scanMarket([candidate],{source:"scheduled",maxFreshProviderCalls:2,
      freshProviderCallPacingMs:0,completedDailyContextPolicyVersion:"completed_daily_intraday_input_v1"});
    setupRequests=externalRequests;
    assert.equal(setupRequests,16);
  }
  externalRequests=0;
  const scheduler = require(join(directory, "functions/scheduled.cjs")).default;
  clock = OriginalDate.parse(slot) + 20000;
  const response = await scheduler(new Request("http://closed-scheduler", {method:"POST", body:JSON.stringify({next_run:expiry})}), {deploy:{id:identity.deploy_id,context:"production",published:true}});
  const body = await response.json();
  const rows = JSON.parse(sql("select coalesce(jsonb_agg(t), '[]') from scheduled_scan_attempts t;"));
  const receipts = JSON.parse(sql("select coalesce(jsonb_agg(t), '[]') from observation_cycle_receipts t;"));
  const scanRuns = JSON.parse(sql("select coalesce(jsonb_agg(t), '[]') from recommendation_scan_runs t;"));
  const record = scanRuns[0]?.payload_json.candidate_decision_record;
  const lineage = scanRuns[0]?.payload_json.decision_lineage_receipt;
  const claims=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from basic_free_discovery_credit_reservations t;"));
  const researchSnapshots=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_snapshots t;"));
  let outcomeChainEvidence = null;
  if(wrongPolicy) {
    assert.equal(response.status,503);
    assert.equal(externalRequests,0);
    assert.equal(claims.length,0);
    assert.equal(scanRuns.length,0);
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
    const cycle=readers.buildObservationCycleReadback(receipts);
    assert.equal(cycle.status,"available");
    assert.equal(cycle.invalid_row_count,0);
    assert.equal(record.record_version,"candidate_decision_record_v4");
    assert.equal(record.candidates.length,8);
    assert.equal(record.versions.input_policy_version,"completed_daily_intraday_input_v1");
    assert.equal(record.final_decision.disposition,"no_trade");
    assert.equal(scanRuns[0].payload_json.scanner_clock_prior_shadow_comparison ?? null,null);
    assert.equal(scanRuns[0].payload_json.scanner_intraday_liquidity_shadow_comparison ?? null,null);
    assert.equal(record.candidates.filter(c=>c.data.freshness==="fresh").length,cold?3:6);
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
        body:JSON.stringify({mode:"official_live_today",horizons:["15m"],max_candle_requests:4,max_batches:1}),
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
        assert.equal((await learningEvidence()).readiness.counterfactual_coverage.research_candidate_outcomes_collected,0);
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
        canonical_research_outcomes:researchSnapshots.length,
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
  assert.equal(Number(sql("select count(*) from recommendations;")),0);
  assert.equal(Number(sql("select count(*) from positions;")),0);
  // Disable/expiry are exercised by the real scheduled entrypoint, not a mock.
  process.env.TURE_OBSERVATION_SERIES_ENABLED="false";
  clock=OriginalDate.parse(expiry)+20000;
  const cleanup=await scheduler(new Request("http://closed-scheduler",{method:"POST",
    body:JSON.stringify({next_run:nextSlot})}),{deploy:{id:identity.deploy_id,context:"production",published:true}});
  assert.equal(cleanup.status,204);
  assert.equal(Number(sql("select count(*) from scheduled_scan_attempts;")),1);
  originalLog(JSON.stringify({evidence_mode:"synthetic_closed_packaged_input_runtime_actual_source_schema",
    scenario:wrongPolicy?"invalid_policy":opening?"opening_cold_history":cold?"cold_history":"warm_history_restart",
    setup_synthetic_requests:setupRequests,scheduled_synthetic_requests:externalRequests,
    attempts:rows.length,cycles:receipts.length,claims:claims.length,decision_version:record?.record_version,
    fresh_inputs:record?.candidates.filter(c=>c.data.freshness==="fresh").length,
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
    actual_provider_requests:0,production_actions:0,publications:0,broker_actions:0,cleanup:"inert"}));
  if(diagnoseOutcomes && !wrongPolicy) {
    assert.equal(researchSnapshots.length,cold?3:6,
      "Fresh, non-published versioned inputs must retain research outcome sources during a regular afternoon session");
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
