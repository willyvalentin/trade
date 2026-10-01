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
      export { recommendationScanRunFromPersistenceRow } from './lib/recommendation-scan-run';
      export { candidateDecisionRecordFromScanRun } from './lib/candidate-decision-readback';
      export { decisionLineageReceiptFromScanRun } from './lib/decision-lineage-receipt';
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
    TURE_OBSERVATION_SERIES_START_SLOT_UTC: "2026-10-01T17:30:00.000Z",
    TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC: "2026-10-01T17:45:00.000Z",
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
  clock = OriginalDate.parse("2026-10-01T17:30:20.000Z");
  const response = await scheduler(new Request("http://closed-scheduler", {method:"POST", body:JSON.stringify({next_run:"2026-10-01T17:45:00.000Z"})}), {deploy:{id:identity.deploy_id,context:"production",published:true}});
  const body = await response.json();
  const rows = JSON.parse(sql("select coalesce(jsonb_agg(t), '[]') from scheduled_scan_attempts t;"));
  const receipts = JSON.parse(sql("select coalesce(jsonb_agg(t), '[]') from observation_cycle_receipts t;"));
  const scanRuns = JSON.parse(sql("select coalesce(jsonb_agg(t), '[]') from recommendation_scan_runs t;"));
  const record = scanRuns[0]?.payload_json.candidate_decision_record;
  const lineage = scanRuns[0]?.payload_json.decision_lineage_receipt;
  const claims=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from basic_free_discovery_credit_reservations t;"));
  const researchSnapshots=JSON.parse(sql("select coalesce(jsonb_agg(t),'[]') from recommendation_snapshots t;"));
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
    const duplicate=await scheduler(new Request("http://closed-scheduler",{method:"POST",
      body:JSON.stringify({next_run:"2026-10-01T17:45:00.000Z"})}),{deploy:{id:identity.deploy_id,context:"production",published:true}});
    assert.equal(duplicate.status,204);
    assert.equal(externalRequests,8);
  }
  assert.equal(Number(sql("select count(*) from recommendations;")),0);
  assert.equal(Number(sql("select count(*) from positions;")),0);
  // Disable/expiry are exercised by the real scheduled entrypoint, not a mock.
  process.env.TURE_OBSERVATION_SERIES_ENABLED="false";
  clock=OriginalDate.parse("2026-10-01T17:45:20Z");
  const cleanup=await scheduler(new Request("http://closed-scheduler",{method:"POST",
    body:JSON.stringify({next_run:"2026-10-01T18:00:00.000Z"})}),{deploy:{id:identity.deploy_id,context:"production",published:true}});
  assert.equal(cleanup.status,204);
  assert.equal(Number(sql("select count(*) from scheduled_scan_attempts;")),1);
  originalLog(JSON.stringify({evidence_mode:"synthetic_closed_packaged_input_runtime_actual_source_schema",
    scenario:wrongPolicy?"invalid_policy":cold?"cold_history":"warm_history_restart",
    setup_synthetic_requests:setupRequests,scheduled_synthetic_requests:externalRequests,
    attempts:rows.length,cycles:receipts.length,claims:claims.length,decision_version:record?.record_version,
    fresh_inputs:record?.candidates.filter(c=>c.data.freshness==="fresh").length,
    ...(diagnoseOutcomes ? {outcome_chain_diagnostic:{learning_acceleration_enabled:true,
      candidate_population:record?.candidates.length,
      research_snapshot_count:researchSnapshots.length,
      research_snapshots:researchSnapshots.map(row=>({ticker:row.ticker,
        candidate_id:row.payload_json?.candidate_id??null,
        input_policy_version:row.payload_json?.scanner_input_policy_version??null,
        research_purpose:row.payload_json?.research_purpose??null,
        decision_input_snapshot_present:row.payload_json?.scanner_decision_input_snapshot!==undefined,
        source_timestamp:row.payload_json?.data_timestamp??null,
        freshness:row.payload_json?.freshness??null}))}} : {}),
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
