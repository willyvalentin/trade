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
const directory = mkdtempSync(join(tmpdir(), "ture-allocation-stop-proof-"));
const database = `ture-allocation-stop-db-${process.pid}`;
const api = `ture-allocation-stop-api-${process.pid}`;
const network = `ture-allocation-stop-net-${process.pid}`;
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
const literal = (value) => `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;

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
      export { SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT as contract } from './lib/scanner-provider-credit-allocation-live-experiment';`,
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
    TURE_OBSERVATION_SERIES_START_SLOT_UTC: contract.slots[0].slot_utc,
    TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC: contract.expires_at_utc,
    TURE_OBSERVATION_SERIES_MAX_ATTEMPTS: String(contract.max_attempts),
    TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: String(contract.max_total_provider_credits),
    TURE_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED: "true",
    TURE_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ID: contract.experiment_id,
    TURE_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_EXPECTED_REVISION: identity.commit_ref,
    TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED: "false",
    TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED: "false",
    TURE_NORMAL_SCAN_ONE_SHOT_ENABLED: "false", TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED: "false",
    TURE_INTERNAL_PAPER_WORKER_ENABLED: "false",
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
  docker("run", "--pull=never", "--rm", "-d", "--name", database, "--network", network, "-e", "POSTGRES_PASSWORD=closed-proof-only", "postgres:17-alpine");
  for (let attempt = 0; ; attempt++) {
    try { sql("select 1;"); break; } catch (error) {
      if (attempt >= 60) throw error;
      await new Promise((done) => setTimeout(done, 250));
    }
  }
  sql(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create role authenticator login password 'closed-proof-only'; grant anon, service_role to authenticator;
    ${readFileSync(resolve(root, "supabase/migrations/20260625000000_create_scheduled_scan_attempts.sql"), "utf8")}
    ${readFileSync(resolve(root, "supabase/migrations/20260926091134_sv_a2_observation_cycle_receipts.sql"), "utf8")}
    create table recommendation_scan_runs(id uuid, owner_user_id uuid, observed_at timestamptz);
    create table recommendation_batches(id uuid); create table recommendation_snapshots(id uuid); create table recommendation_outcomes(id uuid);
    create table recommendations(id uuid, owner_user_id uuid, archived boolean, status text, created_at timestamptz);
    create table scheduled_scan_runs(id uuid default gen_random_uuid(), created_at timestamptz default now(), scan_date date, session_type text, status text, recommendations_created integer, message text);
    create table market_calendar_cache(cache_date date, provider text, is_open_day boolean, reason text, day_type text, market_open_time text, market_close_time text, raw jsonb, updated_at timestamptz);
    grant usage on schema public to service_role; grant all on all tables in schema public to service_role;
    insert into market_calendar_cache values('${contract.trading_date}', 'polygon', true, 'Synthetic CLOSED calendar fixture', 'trading_day', '09:30', '16:00', '{}', '${contract.slots[2].slot_utc}');`);
  globalThis.Date = class extends OriginalDate {
    constructor(...args) { super(...(args.length ? args : [clock])); }
    static now() { return clock; }
  };
  for (const [index, slotEntry] of contract.slots.slice(0, 2).entries()) {
    const slot = slotEntry.slot_utc;
    clock = OriginalDate.parse(slot);
    const fingerprint = `closed_stop_prior_attempt_${index}`;
    const payload = { scheduled_slot_started_at_utc: slot, scheduled_slot_identity_source: "netlify_event_next_run", build_deployment_identity: identity,
      observation_series_control: control, observation_series_slot_admission: readers.buildObservationSeriesSlotAdmission({ control, scheduledSlotStartedAtUtc: slot }) };
    // Populate via Postgres defaults, not jsonb_populate_record's missing NULLs.
    sql(`insert into scheduled_scan_attempts(attempt_fingerprint,source,mode,scheduled_function_fired_at,utc_timestamp,payload_json) values('${fingerprint}','netlify_scheduled_function','scheduled','${slot}','${slot}',${literal(payload)});`);
    const record = readers.buildObservationCycleReceipt({ ownerUserId: owner, attemptFingerprint: fingerprint,
      source: "netlify_scheduled_function", mode: "scheduled", outcome: "failed", allowed: false,
      routeReceivedAtUtc: slot, scheduledFunctionFiredAtUtc: slot, orchestrationDecision: null, skipReason: "synthetic_closed_operational_failure",
      scanLog: null, activeScanTrace: null, scanRunFingerprint: null,
      scheduledInvocationReceipt: { receipt_version: "scheduled_scan_invocation_receipt_v1", scheduled_slot_started_at_utc: slot,
        scheduled_slot_identity_source: "netlify_event_next_run", build_deployment_identity: identity, durable_invocation_payload: payload } });
    assert.equal(record.cycle_status, "failed");
    const columns = Object.keys(record).join(",");
    sql(`insert into observation_cycle_receipts(${columns}) select ${columns} from jsonb_populate_record(null::observation_cycle_receipts,${literal(record)});`);
  }
  docker("run", "--pull=never", "--rm", "-d", "--name", api, "--network", network, "-p", "127.0.0.1::3000",
    "-e", `PGRST_DB_URI=postgres://authenticator:closed-proof-only@${database}:5432/postgres`,
    "-e", "PGRST_DB_ANON_ROLE=anon", "-e", `PGRST_JWT_SECRET=${jwtSecret}`, "public.ecr.aws/supabase/postgrest:v14.5");
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
    if (url.origin !== environment.NEXT_PUBLIC_SUPABASE_URL) { externalRequests++; throw new Error(`Unexpected external boundary: ${url.hostname}`); }
    if (url.pathname === `/auth/v1/admin/users/${owner}`) return Response.json({ user: { id: owner, aud: "authenticated", role: "authenticated" } });
    if (!url.pathname.startsWith("/rest/v1/")) throw new Error("Unexpected fixture API path");
    return originalFetch(`${apiOrigin}${url.pathname.slice("/rest/v1".length)}${url.search}`, init);
  };
  console.log = (...items) => logs.push(items);
  globalThis.Netlify = { env: { get: (name) => process.env[name] } };
  const scheduler = require(join(directory, "functions/scheduled.cjs")).default;
  for (const entry of contract.slots.slice(2, 4)) {
    clock = OriginalDate.parse(entry.slot_utc) + 20_000;
    const response = await scheduler(new Request("http://closed-scheduler", { method: "POST", body: JSON.stringify({ next_run: new OriginalDate(clock + 15 * 60_000 - 20_000).toISOString() }) }),
      { deploy: { id: identity.deploy_id, context: "production", published: true } });
    assert.equal(response.status, 200, `scheduler_status=${response.status}; logs=${JSON.stringify(logs).slice(-7000)}`);
    const body = await response.json();
    assert.equal(body.status, "skipped", JSON.stringify(body).slice(0, 1000));
    assert.equal(body.automation_diagnostics.observation_series_admission.status, "series_failure_stop_reached");
    assert.equal(body.automation_diagnostics.observation_series_admission.facts.max_consecutive_failures, 2);
  }
  const rows = JSON.parse(sql("select coalesce(jsonb_agg(t), '[]') from scheduled_scan_attempts t;"));
  const receiptRows = JSON.parse(sql("select coalesce(jsonb_agg(t), '[]') from observation_cycle_receipts t;"));
  assert.equal(rows.length, 4);
  const readback = readers.buildObservationCycleReadback(receiptRows);
  assert.equal(readback.status, "available", JSON.stringify(readback.reason_codes));
  const evidence = readers.buildObservationSeriesEvidenceReadback({ ownerUserId: owner, control, scheduledAttemptRows: rows, observationCycleReadback: readback, now: new OriginalDate(clock) });
  assert.equal(evidence.series.operational.terminal_reason, "failure_stop_reached");
  assert.equal(evidence.series.counts.reserved_provider_credits, 0);
  assert.equal(evidence.series.counts.published_recommendations, 0);
  assert.equal(externalRequests, 0);
  originalLog(JSON.stringify({ evidence_mode: "synthetic_closed_packaged_runtime_with_isolated_postgres", scheduler_slots: 2, seeded_operational_failures: 2,
    scheduled_attempts: rows.length, terminal_receipts: receiptRows.length, terminal_reason: evidence.series.operational.terminal_reason,
    provider_requests: externalRequests, reserved_credits: 0, publications: 0, broker_actions: 0, production_actions: 0 }));
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
