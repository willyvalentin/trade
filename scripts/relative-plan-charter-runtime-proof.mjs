// CLOSED synthetic isolated PostgreSQL/PostgREST/SDK proof. Never production
// credentials, a scheduled invocation, provider data or broker activity.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { build } from "esbuild";

const root = process.cwd(), directory = mkdtempSync(join(tmpdir(), "ture-relative-plan-charter-proof-"));
const db = `ture-relative-plan-charter-db-${process.pid}`, api = `ture-relative-plan-charter-api-${process.pid}`;
const network = `ture-relative-plan-charter-net-${process.pid}`;
const docker = (...args) => execFileSync("docker", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const sql = query => execFileSync("docker", ["exec", "-i", db, "psql", "-h", "127.0.0.1", "-U", "postgres", "-d", "postgres",
  "-At", "-v", "ON_ERROR_STOP=1"], { input: query, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
const originalFetch = globalThis.fetch, originalEnvironment = { ...process.env };
let dbCreated = false, apiCreated = false, networkCreated = false, blockedExternalRequests = 0;
try {
  await build({ bundle: true, platform: "node", format: "cjs", conditions: ["react-server"], alias: { "@": root },
    plugins: [{ name: "real-fixture-expect", setup(builder) { builder.onResolve({ filter: /^@playwright\/test$/ }, () => ({
      path: resolve(root, "node_modules/@playwright/test/index.js"), external: true })); } }], logLevel: "silent",
    stdin: { resolveDir: root, contents: `
      export { prospectiveInput, prospectiveOwner } from './tests/fixtures/relative-plan-prospective';
      export { prospectiveSource } from './tests/fixtures/relative-plan-prospective-source';
      export { charterRuntimeRows } from './tests/fixtures/relative-plan-charter-runtime';
      export { relativePlanProspectiveStore } from './lib/server/relative-plan-prospective-store';
      export { readRelativePlanCharterRuntimeSource } from './lib/server/relative-plan-charter-runtime-source';
      export { summarizeRelativePlanCharterOperational } from './lib/server/relative-plan-charter-operational';
      export { buildRelativePlanCharterObservations } from './lib/server/relative-plan-charter-observations';
      export { readRecommendationLearningBaselineSource } from './lib/server/application-data-access';
      export { parseRecommendationLearningBaselineSource } from './lib/recommendation-learning-baseline-source';
      export { getServerSupabaseClient } from './lib/supabase-server';
      export { persistRecommendationScanRun } from './lib/server/recommendation-scan-run-persistence';
      export { persistRecommendationSnapshot } from './lib/server/recommendation-snapshot-persistence';
      export { persistRecommendationOutcome } from './lib/server/recommendation-outcome-persistence';` }, outfile: join(directory, "reader.cjs") });
  const readers = createRequire(import.meta.url)(join(directory, "reader.cjs"));
  docker("network", "create", network); networkCreated = true;
  docker("run", "--pull=never", "--rm", "-d", "--name", db, "--network", network,
    "-e", "POSTGRES_PASSWORD=closed-proof-only", "postgres:16-alpine"); dbCreated = true;
  for (let i = 0; i < 40; i++) {
    try { sql("select 1"); break; } catch { if (i === 39) throw new Error("isolated_database_not_ready"); await delay(250); }
  }
  const owner = readers.prospectiveOwner, other = "33333333-3333-4333-8333-333333333333";
  sql(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create role authenticator login noinherit password 'closed-proof-only';
    grant anon, authenticated, service_role to authenticator; grant usage on schema public to service_role;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$;
    insert into auth.users values('${owner}'),('${other}');`);
  for (const file of ["20260519000000_create_legacy_baseline_schema_draft.sql", "20260528000000_create_recommendation_snapshots.sql",
    "20260528001000_create_recommendation_outcomes.sql", "20260605000000_add_recommendation_outcomes_snapshot_horizon_unique_index.sql",
    "20260528002000_create_recommendation_scan_runs.sql", "20260528003000_create_recommendation_batches.sql",
    "20260614000000_create_execution_records.sql", "20260724001500_create_transactional_open_position_command.sql",
    "20260811163228_add_fail_closed_application_owner_foundation.sql", "20260625000000_create_scheduled_scan_attempts.sql",
    "20260926091134_sv_a2_observation_cycle_receipts.sql"]) sql(readFileSync(resolve(root, "supabase/migrations", file), "utf8"));
  sql("grant all on all tables in schema public to service_role;");
  sql(readFileSync(resolve(root, "supabase/migrations/20261002213547_if4_relative_plan_prospective_comparison.sql"), "utf8"));
  const key = "closed-proof-jwt-only-0123456789012345678901234567890123456789";
  const encoded = value => Buffer.from(JSON.stringify(value)).toString("base64url");
  const body = `${encoded({ alg: "HS256", typ: "JWT" })}.${encoded({ role: "service_role", exp: Math.floor(Date.now() / 1000) + 3600 })}`;
  const token = `${body}.${createHmac("sha256", key).update(body).digest("base64url")}`;
  docker("run", "--pull=never", "--rm", "-d", "--name", api, "--network", network, "-p", "127.0.0.1::3000",
    "-e", `PGRST_DB_URI=postgresql://authenticator:closed-proof-only@${db}:5432/postgres`,
    "-e", "PGRST_DB_SCHEMAS=public", "-e", "PGRST_DB_ANON_ROLE=anon", "-e", `PGRST_JWT_SECRET=${key}`, "public.ecr.aws/supabase/postgrest:v16.1"); apiCreated = true;
  const endpoint = `http://${docker("port", api, "3000/tcp")}`;
  globalThis.fetch = async (input, options) => { const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
    if (url.origin !== endpoint) { blockedExternalRequests++; throw new Error("external_request_forbidden"); }
    url.pathname = url.pathname.replace(/^\/rest\/v1\//, "/"); return originalFetch(url, options); };
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(endpoint)).ok) break; } catch { /* bounded startup only */ }
    if (i === 39) throw new Error("isolated_postgrest_not_ready"); await delay(250);
  }
  process.env.NEXT_PUBLIC_SUPABASE_URL = endpoint; process.env.SUPABASE_SERVICE_ROLE_KEY = token;
  for (const name of ["SUPABASE_SERVICE_ROLE", "SUPABASE_SERVICE_ROLE_SECRET"]) delete process.env[name];
  process.env.TURE_APPLICATION_OWNER_USER_ID = owner;
  const { client } = readers.getServerSupabaseClient(); assert(client);
  const freezeResult = await readers.relativePlanProspectiveStore().freeze(readers.prospectiveInput, owner, new Date());
  assert.equal(freezeResult.status, "frozen"); const freeze = freezeResult.receipt;
  const fixture = await readers.prospectiveSource(); fixture.scanRuns[0].status = "completed";
  for (const run of fixture.scanRuns) assert.equal((await readers.persistRecommendationScanRun(run, { supabaseClient: client, server: true })).status, "saved");
  for (const snapshot of fixture.snapshots) assert.equal((await readers.persistRecommendationSnapshot(snapshot, { supabaseClient: client, server: true })).status, "saved");
  for (const outcome of fixture.outcomes) assert.equal((await readers.persistRecommendationOutcome(outcome, { supabaseClient: client, server: true })).status, "saved");
  const completed = readers.charterRuntimeRows({ at: "2026-10-12T17:00:00.000Z", fingerprint: fixture.scanRuns[0].run_fingerprint });
  const failed = readers.charterRuntimeRows({ at: "2026-10-12T17:15:00.000Z", fingerprint: null, failed: true });
  for (const row of [completed, failed]) {
    assert.equal((await client.from("scheduled_scan_attempts").insert(row.attempt)).error, null);
    assert.equal((await client.from("observation_cycle_receipts").insert(row.cycle)).error, null);
  }
  const now = new Date("2026-10-12T19:00:00.000Z");
  const sourceResult = await readers.readRecommendationLearningBaselineSource(owner); assert.equal(sourceResult.status, "available");
  const source = readers.parseRecommendationLearningBaselineSource(sourceResult.data); assert(source);
  const read = async () => {
    const runtime = await readers.readRelativePlanCharterRuntimeSource({ owner, freeze, now }); assert.equal(runtime.status, "available");
    return readers.summarizeRelativePlanCharterOperational({ owner, freeze, now, runtime, source,
      partition: "held_out", enrolledFingerprints: [fixture.scanRuns[0].run_fingerprint] });
  };
  const full = await read(); assert.equal(full.reliability.value.value, 0.5); assert.equal(full.cost.credits_per_decision, 8);
  assert.equal(full.reliability.terminal_failure_count, 1); assert.equal(full.cost.reserved_provider_credits, 16);
  const observations = readers.buildRelativePlanCharterObservations({ scanRun: source.scanRuns[0], source, now });
  assert.equal(observations.retained_original_population_count, 4); assert.equal(observations.rows.every(row => row.trigger_attainment === true), true);
  assert.equal(observations.rows.every(row => row.setup === null && row.regime === null), true);
  assert.deepEqual(await read(), full); // new SDK query and consumer, no in-memory result reuse
  const payload = structuredClone(failed.attempt.payload_json);
  Object.assign(payload.basic_free_scheduled_scan_credit_reservation, { finalization_status: "reservation_unavailable",
    finalization_proven: false, safe_blocker: "basic_free_credit_reservation_unavailable" });
  assert.equal((await client.from("scheduled_scan_attempts").update({ payload_json: payload }).eq("attempt_fingerprint", failed.attempt.attempt_fingerprint)).error, null);
  const missingCost = await read(); assert.equal(missingCost.cost.credits_per_decision, null);
  assert.equal(missingCost.reliability.value.value, 0.5); assert.equal(missingCost.reliability.terminal_failure_count, 1);
  const otherRuntime = await readers.readRelativePlanCharterRuntimeSource({ owner: other, freeze, now }); assert.equal(otherRuntime.status, "unavailable");
  assert.equal(blockedExternalRequests, 0);
  console.log(JSON.stringify({ status: "pass", environment: "isolated_postgres_postgrest_actual_sdk",
    evidence: "synthetic_closed_not_market_alpha", original_candidates: 4, admitted_attempts: 2,
    terminal_failures: 1, reserved_fixture_credits: 16, unknown_cost_retains_failure: true,
    full_charter_consumer_verified: false, provider_requests: 0, production_writes: 0, broker_actions: 0 }));
} finally {
  globalThis.fetch = originalFetch;
  for (const name of Object.keys(process.env)) if (!Object.hasOwn(originalEnvironment, name)) delete process.env[name];
  Object.assign(process.env, originalEnvironment);
  if (apiCreated) { try { docker("rm", "-f", api); } catch { /* this proof owns this exact container */ } }
  if (dbCreated) { try { docker("rm", "-f", db); } catch { /* this proof owns this exact container */ } }
  if (networkCreated) { try { docker("network", "rm", network); } catch { /* only this proof network */ } }
  rmSync(directory, { recursive: true, force: true });
}
