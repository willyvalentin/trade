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
import { createServer } from "node:http";

const root = process.cwd(), directory = mkdtempSync(join(tmpdir(), "ture-relative-plan-charter-proof-"));
const finalizedMode = process.argv.includes("--finalized-result");
const rankedCount = process.argv.includes("--full-eight-member-population") ? 8 : 4;
const partitionPopulation = 30 * rankedCount;
const db = `ture-relative-plan-charter-db-${process.pid}`, api = `ture-relative-plan-charter-api-${process.pid}`;
const network = `ture-relative-plan-charter-net-${process.pid}`;
const docker = (...args) => execFileSync("docker", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const sql = query => execFileSync("docker", ["exec", "-i", db, "psql", "-h", "127.0.0.1", "-U", "postgres", "-d", "postgres",
  "-At", "-v", "ON_ERROR_STOP=1"], { input: query, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
const originalFetch = globalThis.fetch, originalEnvironment = { ...process.env };
let dbCreated = false, apiCreated = false, networkCreated = false, blockedExternalRequests = 0;
let finalizedHttpBytes = null, resultPrewriteGuardsVerified = false;
let originalDecodedHttpBytes = null, actualHttpReadbackVerified = false, transportEncoding = null;
let newTrainingRetainedCoverageVerified = false, sealedModelIgnoresMutableCandles = false;
// Real local socket + client decompression, not Response.json() pretending to
// decode compressed bytes. This is NOT a hosted Netlify behavior attestation.
async function verifyHttp(readers, body) {
  let wireBytes = null, encoding = null;
  const server = createServer(async (request, response) => {
    try {
      const result = readers.relativePlanCompleteHttpResponse(body, { status: 200, headers: { "Cache-Control": "no-store" },
        acceptEncoding: request.headers["accept-encoding"] });
      const bytes = Buffer.from(await result.arrayBuffer());
      wireBytes = bytes.length; encoding = result.headers.get("content-encoding");
      assert(bytes.length <= (encoding === "gzip" ? 4 : 5) * 1048576);
      if (encoding === "gzip") assert(bytes.toString("base64").length < 6_000_000);
      response.writeHead(result.status, Object.fromEntries(result.headers)); response.end(bytes);
    } catch (error) { response.writeHead(500); response.end(String(error)); }
  });
  try {
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    const response = await originalFetch(`http://127.0.0.1:${server.address().port}/complete`, {
      headers: { "accept-encoding": "gzip" }, signal: AbortSignal.timeout(20000),
    });
    assert.equal(response.status, 200); assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("vary"), "Accept-Encoding");
    assert.deepEqual(await response.json(), JSON.parse(JSON.stringify(body)));
    actualHttpReadbackVerified = true;
    return { wireBytes, encoding, decodedBytes: Buffer.byteLength(JSON.stringify(body), "utf8") };
  } finally {
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
  }
}
try {
  await build({ bundle: true, platform: "node", format: "cjs", conditions: ["react-server"], alias: { "@": root },
    plugins: [{ name: "real-fixture-expect", setup(builder) { builder.onResolve({ filter: /^@playwright\/test$/ }, () => ({
      path: resolve(root, "node_modules/@playwright/test/index.js"), external: true })); } }], logLevel: "silent",
    stdin: { resolveDir: root, contents: `
      export { prospectiveInput, prospectiveOwner } from './tests/fixtures/relative-plan-prospective';
      export { prospectiveSource } from './tests/fixtures/relative-plan-prospective-source';
      export { charterRuntimeRows } from './tests/fixtures/relative-plan-charter-runtime';
      export { buildRelativePlanProspectivePlan } from './lib/server/relative-plan-prospective-comparison';
      export { relativePlanProspectiveStore } from './lib/server/relative-plan-prospective-store';
      export { createRelativePlanTrainedProbabilityService } from './lib/server/relative-plan-trained-probability-service';
      export { createRelativePlanProspectiveService } from './lib/server/relative-plan-prospective-service';
      export { createRelativePlanCharterResultService } from './lib/server/relative-plan-charter-result-service';
      export { relativePlanCharterResultStore } from './lib/server/relative-plan-charter-result-store';
      export { decodeRelativePlanRetainedSource } from './lib/server/relative-plan-charter-result';
      export { buildRelativePlanTrainedProbabilityModel } from './lib/server/relative-plan-trained-probability-model';
      export { relativePlanCompleteHttpResponse } from './lib/server/relative-plan-complete-http-response';
      export { getUsEquityMarketSession } from './lib/us-equity-market-calendar';
      export { readRelativePlanCharterRuntimeSource } from './lib/server/relative-plan-charter-runtime-source';
      export { summarizeRelativePlanCharterOperational } from './lib/server/relative-plan-charter-operational';
      export { buildRelativePlanCharterObservations } from './lib/server/relative-plan-charter-observations';
      export { readRecommendationLearningBaselineSource } from './lib/server/application-data-access';
      export { parseRecommendationLearningBaselineSource } from './lib/recommendation-learning-baseline-source';
      export { getServerSupabaseClient } from './lib/supabase-server';
      export { persistRecommendationScanRun } from './lib/server/recommendation-scan-run-persistence';
      export { persistRecommendationSnapshot } from './lib/server/recommendation-snapshot-persistence';
      export { persistRecommendationOutcome } from './lib/server/recommendation-outcome-persistence';
      export { computeRecommendationOutcome } from './lib/recommendation-outcome-tracker';
      export { recommendationOutcomeEvaluationAnchorFromSnapshot } from './lib/recommendation-outcome-evaluation-anchor';
      export { buildCanonicalOutcomeProviderCoverageReceipt } from './lib/recommendation-outcome-canonical-coverage';` }, outfile: join(directory, "reader.cjs") });
  const readers = createRequire(import.meta.url)(join(directory, "reader.cjs"));
  docker("network", "create", network); networkCreated = true;
  // Fresh Draft runners do not have the ordinary foundation shard's image
  // cache. Fetch only these named test images if absent, never a market API.
  docker("run", "--pull=missing", "--rm", "-d", "--name", db, "--network", network,
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
  sql(readFileSync(resolve(root, "supabase/migrations/20261002233358_if4_relative_plan_trained_probability_model.sql"), "utf8"));
  sql(readFileSync(resolve(root, "supabase/migrations/20261003015239_if4_relative_plan_charter_result.sql"), "utf8"));
  const key = "closed-proof-jwt-only-0123456789012345678901234567890123456789";
  const encoded = value => Buffer.from(JSON.stringify(value)).toString("base64url");
  const body = `${encoded({ alg: "HS256", typ: "JWT" })}.${encoded({ role: "service_role", exp: Math.floor(Date.now() / 1000) + 3600 })}`;
  const token = `${body}.${createHmac("sha256", key).update(body).digest("base64url")}`;
  docker("run", "--pull=missing", "--rm", "-d", "--name", api, "--network", network, "-p", "127.0.0.1::3000",
    "-e", `PGRST_DB_URI=postgresql://authenticator:closed-proof-only@${db}:5432/postgres`,
    // Official v16.1: the immutable multi-platform digest is byte-identical to
    // the former ECR tag. No version fallback or weakened native assertion.
    "-e", "PGRST_DB_SCHEMAS=public", "-e", "PGRST_DB_ANON_ROLE=anon", "-e", `PGRST_JWT_SECRET=${key}`,
    "ghcr.io/postgrest/postgrest@sha256:5922bde07147b82b1c9d8f749e48c1e5b99ebb233f3888bb7ab65f07cf4ac82d"); apiCreated = true;
  const endpoint = `http://${docker("port", api, "3000/tcp")}`;
  globalThis.fetch = async (input, options) => { const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
    if (url.origin !== endpoint) { blockedExternalRequests++; throw new Error("external_request_forbidden"); }
    url.pathname = url.pathname.replace(/^\/rest\/v1\//, "/");
    if (finalizedMode && !resultPrewriteGuardsVerified && url.pathname === "/rpc/finalize_relative_plan_charter_result_v1") {
      // Real SQL-clock/model/owner rejection BEFORE the first result insert.
      // These are isolated synthetic fixtures, not production route calls.
      const request = JSON.parse(options.body), candidate = request.p_result;
      const rpc = (who, result) => JSON.parse(sql(`select public.finalize_relative_plan_charter_result_v1(
        '${who}','${candidate.prospective_freeze_id}','${JSON.stringify(result).replaceAll("'","''")}'::jsonb,
        'relative_plan_charter_result_receipt_v1')`));
      const future = structuredClone(candidate);
      future.source_as_of = new Date(Date.now()+86400000).toISOString();
      future.measurement.read_as_of = future.source_as_of;
      assert.equal(rpc(owner,future).status,"not_ready");
      assert.equal(rpc(other,candidate).status,"unavailable");
      const drifted = structuredClone(candidate);
      drifted.trained_model_receipt.committed_read_at = new Date(Date.parse(drifted.trained_model_receipt.committed_read_at)+1).toISOString();
      assert.equal(rpc(owner,drifted).status,"unavailable");
      assert.equal(sql("select count(*) from public.relative_plan_charter_results"),"0");
      resultPrewriteGuardsVerified = true;
    }
    return originalFetch(url, options); };
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(endpoint)).ok) break; } catch { /* bounded startup only */ }
    if (i === 39) throw new Error("isolated_postgrest_not_ready"); await delay(250);
  }
  process.env.NEXT_PUBLIC_SUPABASE_URL = endpoint; process.env.SUPABASE_SERVICE_ROLE_KEY = token;
  for (const name of ["SUPABASE_SERVICE_ROLE", "SUPABASE_SERVICE_ROLE_SECRET"]) delete process.env[name];
  process.env.TURE_APPLICATION_OWNER_USER_ID = owner;
  const { client } = readers.getServerSupabaseClient(); assert(client);
  const session = day => readers.getUsEquityMarketSession(day.toISOString().slice(0, 10));
  const fullDay = day => { const s = session(day); return s.session_open && Date.parse(s.session_close) - Date.parse(s.session_open) >= 6 * 3600000; };
  const jobAt = new Date(), days = [], cursor = new Date(jobAt); cursor.setUTCHours(0, 0, 0, 0);
  while (days.length < (finalizedMode ? 9 : 3)) { cursor.setUTCDate(cursor.getUTCDate() - 1); if (fullDay(cursor)) days.unshift(new Date(cursor)); }
  const futureDays = [];
  cursor.setTime(jobAt.getTime()); cursor.setUTCHours(0, 0, 0, 0);
  if (finalizedMode) futureDays.push(...days.splice(3));
  else while (futureDays.length < 6) { cursor.setUTCDate(cursor.getUTCDate() + 1); if (fullDay(cursor)) futureDays.push(new Date(cursor)); }
  const windows = { training: { start_at: session(days[0]).session_open, end_at: session(days[2]).session_close },
    held_out: { start_at: session(futureDays[0]).session_open, end_at: session(futureDays[2]).session_close },
    walk_forward: { start_at: session(futureDays[3]).session_open, end_at: session(futureDays[5]).session_close } };
  // Past plan is explicitly isolated admin fixture setup, NEVER backdated
  // production acceptance. Default-mode model sealing uses actual DB time;
  // finalized mode uses a disclosed historical synthetic model fixture.
  const frozenAt = new Date(Date.parse(windows.training.start_at) - 86400000).toISOString();
  const plan = readers.buildRelativePlanProspectivePlan({ ...readers.prospectiveInput, windows }, frozenAt); assert(plan);
  const literal = value => `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
  sql(`insert into public.relative_plan_prospective_comparisons(id,owner_user_id,model_version,plan_fingerprint,plan_json,frozen_at)
    values('22222222-2222-4222-8222-222222222222','${owner}','${plan.model_version}','${plan.plan_fingerprint}',${literal(plan)},'${frozenAt}');`);
  const freeze = (await readers.relativePlanProspectiveStore().read(owner)).receipt; assert(freeze);
  const persist = async (part, omittedId = null) => {
    for (const run of part.scanRuns) assert.equal((await readers.persistRecommendationScanRun(run, { supabaseClient: client, server: true })).status, "saved");
    for (const snapshot of part.snapshots) assert.equal((await readers.persistRecommendationSnapshot(snapshot, { supabaseClient: client, server: true })).status, "saved");
    for (const outcome of part.outcomes.filter(row => row.id !== omittedId)) assert.equal((await readers.persistRecommendationOutcome(outcome, { supabaseClient: client, server: true })).status, "saved");
  };
  for (const day of days) for (let n = 0; n < 4; n++) {
    await persist(await readers.prospectiveSource({ now: new Date(Date.parse(session(day).session_open) + 3.5 * 3600000 + n * 300000), rankedCount }));
  }
  let training, validRetainedTrainingOutcome = null, contradictoryRetainedTrainingOutcome = null;
  if (!finalizedMode) {
    const physical = await readers.readRecommendationLearningBaselineSource(owner);
    assert.equal(physical.status, "available");
    const original = readers.parseRecommendationLearningBaselineSource(physical.data); assert(original);
    const outcome = original.outcomes[0], snapshot = original.snapshots.find(row => row.snapshot_fingerprint === outcome.snapshot_fingerprint);
    assert(snapshot);
    const anchor = readers.recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot); assert(anchor);
    const start = Date.parse(anchor.evaluation_anchor_start_at);
    const complete = Array.from({ length: 12 }, (_, index) => ({ timestamp: new Date(start + index * 300000).toISOString(),
      open: 100, high: 101, low: 99, close: 100, volume: 1000 }));
    const legacy = fault => {
      const event = { ...complete[1], ...(fault === "stop" ? { low: 95 } : { high: 109 }) };
      const candles = fault === "aligned_target" ? complete.map((row, index) => index === 1 ? event : row)
        : [...complete, { ...event, timestamp: new Date(start + 301000).toISOString() }];
      const computed = readers.computeRecommendationOutcome({ snapshot, horizon: "60m", candles,
        evaluated_at: new Date(start + 3900000), current_price: 100, provider: "twelve_data",
        source: "intraday_candles", data_completeness: "complete" }).outcome;
      assert.equal(computed.id, outcome.id);
      const coverage = readers.buildCanonicalOutcomeProviderCoverageReceipt({ candles,
        request: { interval: "5min", horizon: "60m", start_at: anchor.evaluation_anchor_start_at,
          end_at: computed.evaluated_at, ...anchor }, result: { status: "available", provider: "twelve_data" } });
      // Disclosed synthetic pre-fix retained claim, not new v2 acquisition.
      return { ...computed, payload_json: { ...computed.payload_json,
        canonical_provider_coverage: { ...coverage, candle_validation_policy_version: "positive_coherent_original_horizon_ohlc_v1",
          freshness: "fresh", observed_candle_count: 12, malformed_candle_count: 0, blockers: [] },
        counterfactual_candles: candles, counterfactual_candle_source: "horizon_filtered_intraday_candles",
        retained_candles_available: true, retained_candle_count: candles.length } };
    };
    for (const fault of ["target", "stop"]) {
      const bad = legacy(fault);
      assert.equal((await readers.persistRecommendationOutcome(bad, { supabaseClient: client, server: true })).status, "saved");
      const before = await readers.readRecommendationLearningBaselineSource(owner);
      assert.equal(before.data.recommendation_outcomes.length, 12 * rankedCount);
      const rejected = await readers.createRelativePlanTrainedProbabilityService().train(owner, {});
      assert.equal(rejected.status, "unavailable", rejected.blocker);
      assert.equal(rejected.blocker, "trained_probability_retained_candle_coverage_conflicting");
      assert.equal(rejected.receipt, null);
      assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, before.data);
      assert.equal(sql("select count(*) from public.relative_plan_trained_probability_models"), "0");
      assert.equal(sql("select count(*) from public.relative_plan_trained_probability_confirmations"), "0");
      contradictoryRetainedTrainingOutcome = bad;
    }
    validRetainedTrainingOutcome = legacy("aligned_target");
    assert.equal((await readers.persistRecommendationOutcome(validRetainedTrainingOutcome, { supabaseClient: client, server: true })).status, "saved");
    const restored = readers.parseRecommendationLearningBaselineSource((await readers.readRecommendationLearningBaselineSource(owner)).data);
    assert.deepEqual(restored.outcomes.filter(row => row.id !== outcome.id), original.outcomes.filter(row => row.id !== outcome.id));
    newTrainingRetainedCoverageVerified = true;
  }
  if (finalizedMode) {
    // Explicit HISTORICAL SYNTHETIC admin fixture only, not an actual
    // pre-forward model seal. The default proof above separately proves actual
    // DB sealing before future windows. Here only finalization uses REAL time.
    const sourceRead = await readers.readRecommendationLearningBaselineSource(owner);
    const source = readers.parseRecommendationLearningBaselineSource(sourceRead.data); assert(source);
    const modelAt = new Date(Date.parse(windows.training.end_at) + 3600001).toISOString();
    const model = readers.buildRelativePlanTrainedProbabilityModel({ owner,freeze,source,now: new Date(modelAt) }).trained_model;
    assert(model);
    sql(`insert into public.relative_plan_trained_probability_models(id,owner_user_id,prospective_freeze_id,plan_fingerprint,
      model_binding_fingerprint,trained_model_json,materialized_at,materialization_txid) values(
      '44444444-4444-4444-8444-444444444444','${owner}','${freeze.freeze_id}','${plan.plan_fingerprint}',
      '${model.model_binding_fingerprint}',${literal(model)},'${modelAt}',txid_current());
      insert into public.relative_plan_trained_probability_confirmations values(
      '44444444-4444-4444-8444-444444444444','${modelAt}');`);
    training = { status: "materialized",receipt: (await readers.createRelativePlanTrainedProbabilityService().read(owner)).receipt };
  } else training = await readers.createRelativePlanTrainedProbabilityService().train(owner, {});
  assert.equal(training.status, "materialized", training.blocker); const sealed = training.receipt;
  assert.equal(sealed.trained_model.original_population_count, 12 * rankedCount);
  assert(Date.parse(sealed.committed_read_at) < Date.parse(windows.held_out.start_at));
  if (newTrainingRetainedCoverageVerified) {
    assert.equal(sealed.trained_model.canonical_outcome_count, 12 * rankedCount);
    assert.equal(sealed.trained_model.missing_outcome_count, 0);
    assert.equal(sealed.trained_model.model.sample_count, 12 * rankedCount);
    assert.equal((await readers.persistRecommendationOutcome(contradictoryRetainedTrainingOutcome,
      { supabaseClient: client, server: true })).status, "saved");
    assert.deepEqual((await readers.createRelativePlanTrainedProbabilityService().read(owner)).receipt, sealed);
    const repeated = await readers.createRelativePlanTrainedProbabilityService().train(owner, {});
    assert.equal(repeated.status, "already_materialized"); assert.deepEqual(repeated.receipt, sealed);
    assert.equal(sql("select count(*) from public.relative_plan_trained_probability_models"), "1");
    assert.equal((await readers.persistRecommendationOutcome(validRetainedTrainingOutcome,
      { supabaseClient: client, server: true })).status, "saved");
    sealedModelIgnoresMutableCandles = true;
  }
  const unrelatedPriorDecisions = finalizedMode && rankedCount === 8 ? 12 : 0;
  if (unrelatedPriorDecisions) {
    const priorDay = new Date(Date.parse(windows.training.start_at) - 4 * 86400000);
    for (let previous = 0; !fullDay(priorDay); previous++) {
      assert(previous < 10, "synthetic_prior_regular_session_not_found");
      priorDay.setUTCDate(priorDay.getUTCDate() - 1);
    }
    // Actual persisted prior history, not a shortened input fixture or mocked
    // readSource. It remains in the owned database after result finalization.
    for (let n = 0; n < unrelatedPriorDecisions; n++) await persist(await readers.prospectiveSource({
      now: new Date(Date.parse(session(priorDay).session_open) + 2.5 * 3600000 + n * 300000), rankedCount }));
  }
  const parts = [], runtimeRows = [];
  for (const day of futureDays) for (let n = 0; n < 10; n++) {
    const at = new Date(Date.parse(session(day).session_open) + 2.5 * 3600000 + n * 900000);
    const part = await readers.prospectiveSource({ now: at, rankedCount });
    const context = { contract_version: "market_regime_decision_context_v1", classifier_version: "market_regime_v1",
      captured_at: at.toISOString(), regime: "risk_on" };
    Object.assign(part.scanRuns[0].payload_json, { market_regime: "risk_on", market_regime_context: context });
    for (const snapshot of part.snapshots) Object.assign(snapshot.payload_json, {
      setup_type: "BREAKOUT_CONTINUATION", market_regime: "risk_on", market_regime_context: context });
    parts.push(part); runtimeRows.push(readers.charterRuntimeRows({ at: at.toISOString(), fingerprint: part.scanRuns[0].run_fingerprint }));
  }
  const pending = parts[0].outcomes[0];
  for (const part of parts) await persist(part, pending.id);
  const failed = readers.charterRuntimeRows({ at: new Date(Date.parse(session(futureDays[0]).session_open) + 5 * 3600000).toISOString(), fingerprint: null, failed: true });
  runtimeRows.push(failed);
  for (const row of runtimeRows) {
    assert.equal((await client.from("scheduled_scan_attempts").insert(row.attempt)).error, null);
    assert.equal((await client.from("observation_cycle_receipts").insert(row.cycle)).error, null);
  }
  // Future evaluation clocks and source rows are explicit CLOSED fixtures,
  // not evidence that a real forward market cohort has already completed.
  const now = finalizedMode ? new Date() : new Date(Date.parse(windows.walk_forward.end_at) + 3600000);
  const read = async () => {
    const result = await readers.createRelativePlanProspectiveService().read(owner, now);
    assert.equal(result.status, "available", result.blocker); assert.deepEqual(result.learning.trained_probability_model, sealed);
    assert.equal(result.learning.terminal_quality_decision, null); assert(Object.values(result.learning.authority).every(value => value === false));
    const charter = result.learning.full_charter; assert(charter);
    assert.equal(charter.terminal_quality_decision, null); assert.equal(charter.context_triage, null);
    assert.equal(charter.quality_improvement_claimed, false);
    for (const partition of charter.partitions) {
      assert.equal(partition.enrolled_decision_count, 30); assert.equal(partition.original_population_count, partitionPopulation);
      assert.deepEqual(partition.probability.model, sealed.trained_model.model);
      assert.equal(partition.thresholds.checks.length, 11);
    }
    return result;
  };
  const missing = await read(); assert.equal(missing.learning.full_charter.computed_disposition, "evidence_incomplete");
  assert.equal(missing.learning.full_charter.partitions[0].quality.original_population_count, partitionPopulation);
  assert.equal(missing.learning.full_charter.partitions[0].quality.outcome_coverage.value, (partitionPopulation - 1) / partitionPopulation);
  assert.equal((await readers.persistRecommendationOutcome(pending, { supabaseClient: client, server: true })).status, "saved");
  const full = await read(), charter = full.learning.full_charter;
  assert.equal(charter.evidence_complete, true); assert.equal(charter.computed_disposition, "reject");
  assert.deepEqual(charter.missing_dimensions, []);
  assert(charter.measured_limit_failures.includes("held_out_sector_concentration_charter_limit_not_met"));
  const held = charter.partitions[0].operational;
  assert.equal(held.reliability.value.value, 30 / 31); assert.equal(held.reliability.terminal_failure_count, 1);
  assert.equal(held.cost.credits_per_decision, 8); assert.equal(held.cost.reserved_provider_credits, 248);
  assert.equal(charter.partitions[1].operational.reliability.value.value, 1);
  const fullTransport = await verifyHttp(readers, full);
  const httpBytes = fullTransport.wireBytes;
  originalDecodedHttpBytes = fullTransport.decodedBytes; transportEncoding = fullTransport.encoding;
  assert.deepEqual(await read(), full); // restarted service and actual fresh SDK reads, not cached source
  // The mutable current label can have old evaluation/creation clocks but a
  // revision not yet observed at this read's as-of boundary. Verify through
  // the actual writer, SDK, SQL and restarted consumers, not a fake hash.
  const revisionSourceRead = await readers.readRecommendationLearningBaselineSource(owner);
  assert.equal(revisionSourceRead.status, "available");
  const revisionSource = readers.parseRecommendationLearningBaselineSource(revisionSourceRead.data);
  assert(revisionSource);
  const originalRevision = revisionSource.outcomes[0];
  const unchangedOtherOutcomes = JSON.stringify(revisionSource.outcomes.slice(1));
  for (const updated_at of [new Date(now.getTime() + 86400000).toISOString(),
    new Date(Date.parse(originalRevision.evaluated_at) - 1).toISOString()]) {
    assert.equal((await readers.persistRecommendationOutcome({ ...originalRevision, updated_at },
      { supabaseClient: client, server: true })).status, "saved");
    const physical = await readers.readRecommendationLearningBaselineSource(owner);
    const changed = readers.parseRecommendationLearningBaselineSource(physical.data); assert(changed);
    assert.equal(changed.outcomes.length, revisionSource.outcomes.length);
    assert.equal(changed.outcomes[0].updated_at, updated_at);
    assert.equal(JSON.stringify(changed.outcomes.slice(1)), unchangedOtherOutcomes);
    const rejected = await readers.createRelativePlanProspectiveService().read(owner, now);
    assert.equal(rejected.status, "unavailable");
    assert.equal(rejected.blocker, "prospective_outcome_revision_times_invalid");
    assert.equal(rejected.learning, null);
    if (finalizedMode) {
      const terminal = await readers.createRelativePlanCharterResultService().finalize(owner, {});
      assert.equal(terminal.status, "unavailable");
      assert.equal(terminal.blocker, "relative_plan_result_outcome_revision_times_invalid");
      assert.equal(terminal.terminal_quality_decision, null);
    }
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
  }
  assert.equal((await readers.persistRecommendationOutcome(originalRevision,
    { supabaseClient: client, server: true })).status, "saved");
  assert.deepEqual(await read(), full);
  let durable = null;
  if (finalizedMode) {
    const beforeFinalization = Date.now();
    durable = await readers.createRelativePlanCharterResultService().finalize(owner,{});
    assert.equal(durable.status,"finalized",durable.blocker);
    assert.equal(durable.terminal_quality_decision.disposition,"reject");
    assert(durable.receipt.result.measurement.evidence_complete);
    if (unrelatedPriorDecisions) {
      const retained = readers.decodeRelativePlanRetainedSource(durable.receipt.result.retained_source); assert(retained);
      assert.equal(retained.scanRuns.length, 72);
      assert.equal(sql(`select count(*) from public.recommendation_scan_runs where owner_user_id='${owner}'`), "84");
    }
    assert(Date.parse(durable.receipt.finalized_at) >= beforeFinalization);
    assert(Date.parse(durable.receipt.finalized_at) <= Date.now());
    assert.deepEqual((await readers.createRelativePlanCharterResultService().read(owner)).receipt,durable.receipt);
    assert.equal((await readers.createRelativePlanCharterResultService().finalize(owner,{})).status,"already_finalized");
    const persisted = await readers.createRelativePlanProspectiveService().read(owner,now);
    assert.equal(persisted.learning.status,"evaluated");
    assert.equal(persisted.learning.terminal_quality_decision.result_fingerprint,durable.receipt.result.result_fingerprint);
    // A terminal capsule owns its original as-of evidence. The new mutable
    // revision gate must not reinterpret or rewrite an already finalized result.
    assert.equal((await readers.persistRecommendationOutcome({ ...originalRevision,
      updated_at: new Date(Date.now() + 86400000).toISOString() },
      { supabaseClient: client, server: true })).status, "saved");
    assert.deepEqual(await readers.createRelativePlanProspectiveService().read(owner, now), persisted);
    const sealedRepeat = await readers.createRelativePlanCharterResultService().finalize(owner, {});
    assert.equal(sealedRepeat.status, "already_finalized");
    assert.deepEqual(sealedRepeat.receipt, durable.receipt);
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "1");
    assert.equal((await readers.persistRecommendationOutcome(originalRevision,
      { supabaseClient: client, server: true })).status, "saved");
    for (const body of [durable,persisted]) {
      const transported = await verifyHttp(readers, body);
      finalizedHttpBytes = Math.max(finalizedHttpBytes ?? 0, transported.wireBytes);
    }
    for (const role of ["anon","authenticated","service_role"]) for (const privilege of ["select","insert","update","delete","truncate","references","trigger"]) {
      assert.equal(sql(`select has_table_privilege('${role}','public.relative_plan_charter_results','${privilege}')`),"f");
    }
    for (const role of ["anon","authenticated","service_role"]) for (const rpc of [
      "read_relative_plan_charter_result_v1(uuid,uuid,text)","finalize_relative_plan_charter_result_v1(uuid,uuid,jsonb,text)"]) {
      assert.equal(sql(`select has_function_privilege('${role}','public.${rpc}','execute')`),role === "service_role" ? "t" : "f");
    }
    const conflicting = structuredClone(durable.receipt.result); conflicting.result_fingerprint = "c".repeat(64);
    assert.equal(JSON.parse(sql(`select public.finalize_relative_plan_charter_result_v1('${owner}','${freeze.freeze_id}',
      ${literal(conflicting)},'relative_plan_charter_result_receipt_v1')`)).status,"conflicting");
    assert.throws(() => sql("update public.relative_plan_charter_results set finalized_at=now()"),/immutable/);
    assert.throws(() => sql("delete from public.relative_plan_charter_results"),/immutable/);
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"),"1");
  } else {
    assert.equal((await readers.createRelativePlanCharterResultService().finalize(owner,{})).status,"not_ready");
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"),"0");
  }
  const payload = structuredClone(failed.attempt.payload_json);
  Object.assign(payload.basic_free_scheduled_scan_credit_reservation, { finalization_status: "reservation_unavailable",
    finalization_proven: false, safe_blocker: "basic_free_credit_reservation_unavailable" });
  assert.equal((await client.from("scheduled_scan_attempts").update({ payload_json: payload }).eq("attempt_fingerprint", failed.attempt.attempt_fingerprint)).error, null);
  // The diagnostic computation remains available independently; terminal
  // reads in finalized mode MUST stay on their retained immutable source.
  const missingCost = finalizedMode ? (await readers.createRelativePlanCharterResultService().read(owner)).receipt.result.measurement
    : (await read()).learning.full_charter;
  if (!finalizedMode) {
  assert.equal(missingCost.computed_disposition, "evidence_incomplete");
  assert.equal(missingCost.partitions[0].operational.cost.credits_per_decision, null);
  assert.equal(missingCost.partitions[0].operational.reliability.value.value, 30 / 31);
  assert.equal(missingCost.partitions[0].operational.reliability.terminal_failure_count, 1);
  } else assert.equal(missingCost.computed_disposition,"reject");
  assert.equal((await client.from("scheduled_scan_attempts").update({ payload_json: failed.attempt.payload_json }).eq("attempt_fingerprint", failed.attempt.attempt_fingerprint)).error, null);
  // Corrected unfavorable forward labels change errors, never the immutable
  // fitting job, original first thirty or thresholds.
  for (const part of [parts[0], parts[30]]) {
    const losses = await readers.prospectiveSource({ now: new Date(part.snapshots[0].recommended_at), allLosses: true, rankedCount });
    for (const outcome of losses.outcomes) assert.equal((await readers.persistRecommendationOutcome(outcome, { supabaseClient: client, server: true })).status, "saved");
  }
  const corrected = (await readers.createRelativePlanProspectiveService().read(owner,now)).learning.full_charter;
  assert.deepEqual(corrected.partitions.map(row => row.original_membership_fingerprint), charter.partitions.map(row => row.original_membership_fingerprint));
  if (!finalizedMode) assert.notDeepEqual(corrected.partitions[0].probability.forward.baseline, charter.partitions[0].probability.forward.baseline);
  else {
    assert.deepEqual(corrected,durable.receipt.result.measurement);
    assert.deepEqual((await readers.createRelativePlanCharterResultService().read(owner)).receipt,durable.receipt);
    assert.equal((await readers.createRelativePlanCharterResultService().read(other)).status,"not_found");
  }
  assert.equal((await readers.createRelativePlanProspectiveService().read(other, now)).status, "not_found");
  const otherRuntime = await readers.readRelativePlanCharterRuntimeSource({ owner: other, freeze, now }); assert.equal(otherRuntime.status, "unavailable");
  // Two independently persisted attempts may not reuse one completed original
  // decision to improve reliability. The physical schema allows this shape;
  // retain BOTH attempts and all original members, but reject qualification.
  const sourceBeforeDuplicate = await readers.readRecommendationLearningBaselineSource(owner);
  const duplicate = readers.charterRuntimeRows({
    at: new Date(Date.parse(session(futureDays[0]).session_open) + 5.25 * 3600000).toISOString(),
    fingerprint: parts[0].scanRuns[0].run_fingerprint,
  });
  assert.equal((await client.from("scheduled_scan_attempts").insert(duplicate.attempt)).error, null);
  assert.equal((await client.from("observation_cycle_receipts").insert(duplicate.cycle)).error, null);
  // The actual producer finalizes a historical receipt at its real creation
  // time. Observe this later injection AFTER that time; never backdate it into
  // the earlier immutable result or weaken the runtime's as-of clock guard.
  const duplicateNow = finalizedMode ? new Date() : now;
  const duplicateRuntime = await readers.readRelativePlanCharterRuntimeSource({ owner, freeze, now: duplicateNow });
  assert.equal(duplicateRuntime.status, "available", duplicateRuntime.blocker);
  assert.equal(duplicateRuntime.partitions[0].evidence.length, 32);
  const duplicateSource = await readers.readRecommendationLearningBaselineSource(owner);
  assert.deepEqual(duplicateSource, sourceBeforeDuplicate);
  const duplicateSummary = readers.summarizeRelativePlanCharterOperational({ owner, freeze, now: duplicateNow,
    partition: "held_out", runtime: duplicateRuntime,
    source: readers.parseRecommendationLearningBaselineSource(duplicateSource.data),
    enrolledFingerprints: parts.slice(0, 30).map(part => part.scanRuns[0].run_fingerprint),
  });
  assert.equal(duplicateSummary.reliability.admitted_attempt_count, 32);
  assert.equal(duplicateSummary.reliability.completed_attempt_count, 31);
  assert.equal(duplicateSummary.reliability.value, null);
  assert.equal(duplicateSummary.cost.credits_per_decision, null);
  assert(duplicateSummary.blockers.includes("relative_plan_operational_original_decision_duplicated"));
  assert.equal(sql(`select count(*) from public.observation_cycle_receipts
    where scan_run_fingerprint='${parts[0].scanRuns[0].run_fingerprint}'`), "2");
  if (finalizedMode) {
    assert.deepEqual((await readers.createRelativePlanCharterResultService().read(owner)).receipt, durable.receipt);
  } else {
    const unqualified = (await readers.createRelativePlanProspectiveService().read(owner, now)).learning.full_charter;
    assert.equal(unqualified.computed_disposition, "evidence_incomplete");
    assert(unqualified.missing_dimensions.includes("held_out_relative_plan_operational_original_decision_duplicated"));
    assert.deepEqual(unqualified.partitions.map(row => row.original_membership_fingerprint),
      charter.partitions.map(row => row.original_membership_fingerprint));
  }
  assert.equal(blockedExternalRequests, 0);
  console.log(JSON.stringify({ status: "pass", environment: "isolated_postgres_postgrest_actual_sdk",
    evidence: finalizedMode ? "historical_synthetic_model_fixture_actual_database_finalization_not_market_alpha" : "synthetic_closed_not_market_alpha",
    immutable_actual_database_training_members: finalizedMode ? null : 12 * rankedCount,
    new_training_rejects_contradictory_retained_candles_before_storage: newTrainingRetainedCoverageVerified,
    valid_legacy_candles_keep_complete_training_population: newTrainingRetainedCoverageVerified,
    sealed_model_ignores_later_mutable_candles: sealedModelIgnoresMutableCandles,
    original_held_out_decisions: 30, original_walk_forward_decisions: 30, original_candidates_per_forward_partition: partitionPopulation,
    held_out_admitted_attempts: 31, terminal_failures: 1, held_out_reserved_fixture_credits: 248,
    duplicate_completed_original_decision_preserves_population_but_cannot_qualify: true,
    unknown_cost_retains_failure: !finalizedMode, missing_label_retains_original_denominator: true,
    actual_restarted_full_charter_consumer_verified: true, eleven_charter_checks_per_partition: true,
    known_concentration_failure_separate_from_missing_evidence: true, forward_losses_never_refit_model: true,
    unobserved_current_revision_rejected_without_population_reduction: true,
    current_revision_cannot_finalize: finalizedMode,
    finalized_capsule_ignores_later_mutable_revision: finalizedMode,
    durable_terminal_result_verified: finalizedMode, actual_database_finalization_clock_verified: finalizedMode,
    historical_model_clock_fixture: finalizedMode, quality_improvement_verified: false,
    unrelated_pre_window_decisions_persisted_and_preserved: unrelatedPriorDecisions,
    complete_original_product_http_bytes: httpBytes,
    complete_original_product_decoded_http_bytes: originalDecodedHttpBytes,
    actual_loopback_http_readback_verified: actualHttpReadbackVerified,
    full_population_transport_encoding: transportEncoding,
    complete_finalized_product_http_bytes: finalizedHttpBytes, result_prewrite_guards_verified: resultPrewriteGuardsVerified,
    provider_requests: 0, production_writes: 0, broker_actions: 0 }));
} finally {
  globalThis.fetch = originalFetch;
  for (const name of Object.keys(process.env)) if (!Object.hasOwn(originalEnvironment, name)) delete process.env[name];
  Object.assign(process.env, originalEnvironment);
  if (apiCreated) { try { docker("rm", "-f", api); } catch { /* this proof owns this exact container */ } }
  if (dbCreated) { try { docker("rm", "-f", db); } catch { /* this proof owns this exact container */ } }
  if (networkCreated) { try { docker("network", "rm", network); } catch { /* only this proof network */ } }
  rmSync(directory, { recursive: true, force: true });
}
