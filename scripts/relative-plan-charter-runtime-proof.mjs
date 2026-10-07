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
const contextRegressionMode = process.argv.includes("--terminal-context-regression");
assert(!contextRegressionMode || finalizedMode, "terminal_context_requires_finalized_native_mode");
const rankedCount = process.argv.includes("--full-eight-member-population") ? 8 : 4;
const originalInputs = process.argv.includes("--complete-original-archives");
const currentFeatureBasis = process.argv.includes("--current-feature-basis");
assert(!currentFeatureBasis || originalInputs, "current_feature_basis_requires_complete_original_archives");
const featureVectorVersion = currentFeatureBasis ? "recommendation_decision_feature_vector_v3" : undefined;
function verifyCurrentFeatureBasis(source) {
  if (!currentFeatureBasis) return;
  assert(source.snapshots.length > 0);
  for (const snapshot of source.snapshots) {
    const vector = snapshot.payload_json.decision_feature_vector;
    assert.equal(vector.contract_version, featureVectorVersion);
    assert(Number.isFinite(vector.feature_values.daily_average_range_percent));
    assert(!Object.hasOwn(vector.feature_values, "intraday_average_range_percent"));
  }
}
assert(!originalInputs || rankedCount === 8, "original_capacity_proof_requires_unchanged_eight_member_population");
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
let newTrainingOriginalInputVerified = false, newResultOriginalInputVerified = false;
let sealedModelIgnoresMutableInputs = false, sealedResultIgnoresMutableInputs = false;
let actualTrainingClockVerified = false, separateCommittedWitnessVerified = false;
let sourceCapacitySqlVerified = false, negotiatedPrewriteVerified = false;
let finalizedDecodedHttpBytes = null, finalizedTransportEncoding = null;
let newResultRetainedCandlesVerified = false, sealedResultIgnoresMutableCandles = false;
let newResultRetainedHorizonRVerified = false;
let newResultRetainedFallbackHorizonRVerified = false;
let newTrainingExactCandleGridVerified = false, newResultExactCandleGridVerified = false;
let sealedResultIgnoresMutableCandleGrid = false;
let newTrainingExactEventClockVerified = false, newResultExactEventClockVerified = false;
let newTrainingRegimeTimeVerified = false, newResultRegimeTimeVerified = false;
let observedOffsetRegimeTimeVerified = false, sealedResultIgnoresMutableRegimeTime = false;
let newTrainingSnapshotClocksVerified = false, newResultSnapshotClocksVerified = false;
let sealedModelIgnoresMutableSnapshotClocks = false, sealedResultIgnoresMutableSnapshotClocks = false;
let newTrainingRunClocksVerified = false, newResultRunClocksVerified = false;
let sealedModelIgnoresMutableRunClocks = false, sealedResultIgnoresMutableRunClocks = false;
let currentRuntimeClocksVerified = false, runtimeClockSourcePreserved = false;
let newResultRuntimeClocksVerified = false, sealedResultIgnoresMutableRuntimeClocks = false;
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
      export { appendSyntheticOriginalArchives } from './tests/fixtures/original-input-archive-evidence';
      export { buildDecisionLineageReceipt } from './lib/decision-lineage-receipt';
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
  docker("run", "--pull=missing", "--rm", "-d", "--name", db, "--network", network, "-p", "127.0.0.1::5432",
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
  sql(readFileSync(resolve(root, "supabase/migrations/20261005190805_if4_publication_identity_compatibility.sql"), "utf8"));
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
      if (originalInputs) {
        assert(candidate.retained_source.decoded_byte_length > 16 * 1048576);
        assert.equal(rpc(owner, candidate).status, "unavailable", "original 16 MiB SQL must reject the complete source");
        assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
        const definition = sql("select pg_get_functiondef('public.finalize_relative_plan_charter_result_v1(uuid,uuid,jsonb,text)'::regprocedure)");
        const attributes = sql("select proowner::text,proacl::text,prosecdef,proconfig::text from pg_proc where oid='public.finalize_relative_plan_charter_result_v1(uuid,uuid,jsonb,text)'::regprocedure");
        const capacityMigration = readFileSync(resolve(root, "supabase/migrations/20261004054424_if4_complete_original_archive_source_capacity.sql"), "utf8");
        // Direct SQL iteration on this disposable DB only; no migration history.
        sql(capacityMigration);
        const expected = definition.replace("not between 1 and 16777216", "not between 1 and 33554432");
        assert.notEqual(expected, definition);
        assert.equal(sql("select pg_get_functiondef('public.finalize_relative_plan_charter_result_v1(uuid,uuid,jsonb,text)'::regprocedure)"), expected);
        assert.equal(sql("select proowner::text,proacl::text,prosecdef,proconfig::text from pg_proc where oid='public.finalize_relative_plan_charter_result_v1(uuid,uuid,jsonb,text)'::regprocedure"), attributes);
        sql(capacityMigration); // safe idempotent readback, not a data rewrite
        for (const length of [0, 32 * 1048576 + 1]) {
          const oversized = structuredClone(candidate);
          oversized.retained_source.decoded_byte_length = length;
          assert.equal(rpc(owner, oversized).status, "unavailable", "decoded source bounds must remain strict");
        }
        assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
        sourceCapacitySqlVerified = true;
      }
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
  // Isolated synthetic fault setup only. The ordinary producer deliberately
  // ignores duplicate scan inserts; do not alter that immutable behavior just
  // to inject a test contradiction. Change this fixture through the real SDK
  // with exact owner/id predicates, then exercise the actual command/readback.
  const replaceIsolatedRunPayload = async run => {
    const response = await client.from("recommendation_scan_runs").update({ payload_json: run.payload_json })
      .eq("owner_user_id", owner).eq("id", run.id).select("id").single();
    assert.equal(response.error, null); assert.equal(response.data.id, run.id);
  };
  // Exact owner/id-bound synthetic fault injection in this disposable database
  // only. The real snapshot producer ignores duplicate inserts; do not weaken
  // that behavior to test NEW consumer admission of a contradictory raw row.
  const replaceIsolatedSnapshotClocks = async (snapshot, clocks) => {
    const response = await client.from("recommendation_snapshots").update(clocks)
      .eq("owner_user_id", owner).eq("id", snapshot.id).select("id").single();
    assert.equal(response.error, null); assert.equal(response.data.id, snapshot.id);
  };
  const replaceIsolatedSnapshotPayload = async snapshot => {
    const response = await client.from("recommendation_snapshots").update({ payload_json: snapshot.payload_json })
      .eq("owner_user_id", owner).eq("id", snapshot.id).select("id,payload_json").single();
    assert.equal(response.error, null); assert.equal(response.data.id, snapshot.id);
    assert.deepEqual(response.data.payload_json, snapshot.payload_json);
  };
  const replaceIsolatedRunClocks = async (run, clocks) => {
    const response = await client.from("recommendation_scan_runs").update(clocks)
      .eq("owner_user_id", owner).eq("id", run.id).select("id").single();
    assert.equal(response.error, null); assert.equal(response.data.id, run.id);
  };
  const injectOriginalConflict = async run => {
    if (!originalInputs) return readers.appendSyntheticOriginalArchives(run);
    const record = run.payload_json.candidate_decision_record;
    record.candidates[0].data.input_snapshot.features.session_high += 1;
    run.payload_json.decision_lineage_receipt = readers.buildDecisionLineageReceipt(record);
  };
  for (const day of days) for (let n = 0; n < 4; n++) {
    await persist(await readers.prospectiveSource({ now: new Date(Date.parse(session(day).session_open) + 3.5 * 3600000 + n * 300000), rankedCount, originalInputs, featureVectorVersion }));
  }
  let training, validRetainedTrainingOutcome = null, contradictoryRetainedTrainingOutcome = null;
  if (!finalizedMode) {
    const physical = await readers.readRecommendationLearningBaselineSource(owner);
    assert.equal(physical.status, "available");
    const original = readers.parseRecommendationLearningBaselineSource(physical.data); assert(original);
    const originalSnapshot = original.snapshots[rankedCount - 1];
    const future = new Date(Date.now() + 86400000).toISOString();
    await replaceIsolatedSnapshotClocks(originalSnapshot, { created_at: future, updated_at: future });
    const snapshotBefore = await readers.readRecommendationLearningBaselineSource(owner);
    const snapshotRejected = await readers.createRelativePlanTrainedProbabilityService().train(owner, {});
    assert.equal(snapshotRejected.status, "unavailable");
    assert.equal(snapshotRejected.blocker, "trained_probability_snapshot_recording_times_invalid");
    assert.equal(snapshotRejected.receipt, null);
    assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, snapshotBefore.data);
    assert.equal(snapshotBefore.data.recommendation_snapshots.length, 12 * rankedCount);
    assert.equal(sql("select count(*) from public.relative_plan_trained_probability_models"), "0");
    assert.equal(sql("select count(*) from public.relative_plan_trained_probability_confirmations"), "0");
    await replaceIsolatedSnapshotClocks(originalSnapshot, {
      created_at: originalSnapshot.created_at, updated_at: originalSnapshot.updated_at });
    newTrainingSnapshotClocksVerified = true;
    const originalRun = original.scanRuns[0], conflictingRun = structuredClone(originalRun);
    await replaceIsolatedRunClocks(originalRun, { created_at: future, updated_at: future });
    const runBefore = await readers.readRecommendationLearningBaselineSource(owner);
    const runRejected = await readers.createRelativePlanTrainedProbabilityService().train(owner, {});
    assert.equal(runRejected.status, "unavailable");
    assert.equal(runRejected.blocker, "trained_probability_scan_run_recording_times_invalid");
    assert.equal(runRejected.receipt, null);
    assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, runBefore.data);
    assert.equal(runBefore.data.recommendation_scan_runs.length, 12);
    assert.equal(sql("select count(*) from public.relative_plan_trained_probability_models"), "0");
    assert.equal(sql("select count(*) from public.relative_plan_trained_probability_confirmations"), "0");
    await replaceIsolatedRunClocks(originalRun, { created_at: originalRun.created_at, updated_at: originalRun.updated_at });
    newTrainingRunClocksVerified = true;
    await injectOriginalConflict(conflictingRun);
    await replaceIsolatedRunPayload(conflictingRun);
    const inputBefore = await readers.readRecommendationLearningBaselineSource(owner);
    const inputRejected = await readers.createRelativePlanTrainedProbabilityService().train(owner, {});
    assert.equal(inputRejected.status, "unavailable");
    assert.equal(inputRejected.blocker, "trained_probability_original_input_arithmetic_conflicting");
    assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, inputBefore.data);
    assert.equal(sql("select count(*) from public.relative_plan_trained_probability_models"), "0");
    assert.equal(sql("select count(*) from public.relative_plan_trained_probability_confirmations"), "0");
    assert.equal(inputBefore.data.recommendation_scan_runs.length, 12);
    assert.equal(inputBefore.data.recommendation_snapshots.length, 12 * rankedCount);
    await replaceIsolatedRunPayload(originalRun);
    newTrainingOriginalInputVerified = true;
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
    for (const index of [0, 11]) {
      const misaligned = structuredClone(validRetainedTrainingOutcome);
      const bar = misaligned.payload_json.counterfactual_candles[index];
      bar.timestamp = bar.timestamp.replace(".000Z", ".000001Z");
      assert.equal((await readers.persistRecommendationOutcome(misaligned, { supabaseClient: client, server: true })).status, "saved");
      const beforeGrid = await readers.readRecommendationLearningBaselineSource(owner);
      const rejectedGrid = await readers.createRelativePlanTrainedProbabilityService().train(owner, {});
      assert.equal(rejectedGrid.blocker, "trained_probability_retained_candle_coverage_conflicting");
      assert.equal(rejectedGrid.status, "unavailable"); assert.equal(rejectedGrid.receipt, null);
      assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, beforeGrid.data);
      assert.equal(beforeGrid.data.recommendation_outcomes.length, 12 * rankedCount);
      assert.equal(sql("select count(*) from public.relative_plan_trained_probability_models"), "0");
      assert.equal(sql("select count(*) from public.relative_plan_trained_probability_confirmations"), "0");
    }
    newTrainingExactCandleGridVerified = true;
    for (const key of ["entry_triggered_at", "target_hit_at"]) {
      const misaligned = structuredClone(validRetainedTrainingOutcome);
      assert.equal(typeof misaligned[key], "string");
      misaligned[key] = misaligned[key].replace(".000Z", ".000001Z");
      assert.equal((await readers.persistRecommendationOutcome(misaligned, { supabaseClient: client, server: true })).status, "saved");
      const beforeEvent = await readers.readRecommendationLearningBaselineSource(owner);
      const rejectedEvent = await readers.createRelativePlanTrainedProbabilityService().train(owner, {});
      assert.equal(rejectedEvent.blocker, "trained_probability_retained_candle_outcome_conflicting");
      assert.equal(rejectedEvent.status, "unavailable"); assert.equal(rejectedEvent.receipt, null);
      assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, beforeEvent.data);
      assert.equal(sql("select count(*) from public.relative_plan_trained_probability_models"), "0");
      assert.equal(sql("select count(*) from public.relative_plan_trained_probability_confirmations"), "0");
    }
    newTrainingExactEventClockVerified = true;
    assert.equal((await readers.persistRecommendationOutcome(validRetainedTrainingOutcome, { supabaseClient: client, server: true })).status, "saved");
    const restored = readers.parseRecommendationLearningBaselineSource((await readers.readRecommendationLearningBaselineSource(owner)).data);
    assert.deepEqual(restored.outcomes.filter(row => row.id !== outcome.id), original.outcomes.filter(row => row.id !== outcome.id));
    newTrainingRetainedCoverageVerified = true;
    const contextRun = original.scanRuns[0];
    const contextSnapshots = original.snapshots.filter(row => row.scan_run_id === contextRun.run_fingerprint);
    const decisionAt = contextRun.payload_json.candidate_decision_record.decision_timestamp;
    assert(decisionAt.endsWith(".000Z"));
    assert.equal(contextSnapshots.length, rankedCount);
    for (const fault of ["run_future", "snapshot_future", "both_offset"]) {
      const futureAt = decisionAt.replace(".000Z", fault === "both_offset" ? ".000001+00:00" : ".000001Z");
      const context = { contract_version: "market_regime_decision_context_v1", classifier_version: "market_regime_v1",
        regime: "risk_on", captured_at: fault === "snapshot_future" ? decisionAt : futureAt };
      const badRun = structuredClone(contextRun);
      Object.assign(badRun.payload_json, { market_regime: "risk_on", market_regime_context: context });
      await replaceIsolatedRunPayload(badRun);
      for (const snapshot of contextSnapshots) {
        const bad = structuredClone(snapshot);
        Object.assign(bad.payload_json, { market_regime: "risk_on", market_regime_context: {
          ...context, captured_at: fault === "run_future" ? decisionAt : futureAt } });
        await replaceIsolatedSnapshotPayload(bad);
      }
      const beforeContext = await readers.readRecommendationLearningBaselineSource(owner);
      const rejectedContext = await readers.createRelativePlanTrainedProbabilityService().train(owner, {});
      assert.equal(rejectedContext.status, "unavailable");
      assert.equal(rejectedContext.blocker, "trained_probability_original_regime_context_clock_conflicting");
      assert.equal(rejectedContext.receipt, null);
      assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, beforeContext.data);
      assert.equal(sql("select count(*) from public.relative_plan_trained_probability_models"), "0");
      assert.equal(sql("select count(*) from public.relative_plan_trained_probability_confirmations"), "0");
    }
    await replaceIsolatedRunPayload(contextRun);
    for (const snapshot of contextSnapshots) await replaceIsolatedSnapshotPayload(snapshot);
    newTrainingRegimeTimeVerified = true;
  }
  const beforeTraining = Date.now();
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
  verifyCurrentFeatureBasis(sealed.trained_model.retained_training_source);
  assert(Date.parse(sealed.committed_read_at) < Date.parse(windows.held_out.start_at));
  if (!finalizedMode) {
    const afterTraining = Date.now();
    // Observe the existing real SQL job, not an injected/backdated model. Both
    // database instants must lie inside the actual request interval, and the
    // committed witness must have been inserted in another transaction.
    const stored = JSON.parse(sql(`select jsonb_build_object(
      'materialized_at', model.materialized_at, 'committed_read_at', witness.committed_read_at,
      'materialization_txid', model.materialization_txid::text,
      'model_insert_txid', model.xmin::text, 'witness_insert_txid', witness.xmin::text)
      from public.relative_plan_trained_probability_models model
      join public.relative_plan_trained_probability_confirmations witness on witness.materialization_id=model.id
      where model.owner_user_id='${owner}' and model.prospective_freeze_id='${freeze.freeze_id}'`));
    for (const instant of [sealed.materialized_at, sealed.committed_read_at]) {
      assert(Date.parse(instant) >= beforeTraining);
      assert(Date.parse(instant) <= afterTraining);
    }
    assert.equal(Date.parse(stored.materialized_at), Date.parse(sealed.materialized_at));
    assert.equal(Date.parse(stored.committed_read_at), Date.parse(sealed.committed_read_at));
    assert(Date.parse(sealed.committed_read_at) >= Date.parse(sealed.materialized_at));
    // PL/pgSQL EXCEPTION creates a subtransaction: model.xmin can be a
    // child XID, not txid_current() stored by the parent. The confirmation
    // function has no such handler; compare its insertion with BOTH IDs.
    assert.notEqual(stored.witness_insert_txid, stored.materialization_txid);
    assert.notEqual(stored.witness_insert_txid, stored.model_insert_txid);
    assert.equal(sql("select count(*) from public.relative_plan_trained_probability_models"), "1");
    assert.equal(sql("select count(*) from public.relative_plan_trained_probability_confirmations"), "1");
    actualTrainingClockVerified = true; separateCommittedWitnessVerified = true;
  }
  if (newTrainingOriginalInputVerified) {
    const physical = await readers.readRecommendationLearningBaselineSource(owner);
    const source = readers.parseRecommendationLearningBaselineSource(physical.data);
    const originalRun = source.scanRuns[0], conflictingRun = structuredClone(originalRun);
    await injectOriginalConflict(conflictingRun);
    await replaceIsolatedRunPayload(conflictingRun);
    assert.deepEqual((await readers.createRelativePlanTrainedProbabilityService().read(owner)).receipt, sealed);
    const repeated = await readers.createRelativePlanTrainedProbabilityService().train(owner, {});
    assert.equal(repeated.status, "already_materialized"); assert.deepEqual(repeated.receipt, sealed);
    assert.equal(sql("select count(*) from public.relative_plan_trained_probability_models"), "1");
    await replaceIsolatedRunPayload(originalRun);
    sealedModelIgnoresMutableInputs = true;
  }
  if (newTrainingSnapshotClocksVerified) {
    const source = readers.parseRecommendationLearningBaselineSource((await readers.readRecommendationLearningBaselineSource(owner)).data);
    const originalSnapshot = source.snapshots[rankedCount - 1];
    const future = new Date(Date.now() + 86400000).toISOString();
    await replaceIsolatedSnapshotClocks(originalSnapshot, { created_at: future, updated_at: future });
    const originalRun = source.scanRuns[0];
    assert(newTrainingRunClocksVerified);
    await replaceIsolatedRunClocks(originalRun, { created_at: future, updated_at: future });
    const repeated = await readers.createRelativePlanTrainedProbabilityService().train(owner, {});
    assert.equal(repeated.status, "already_materialized"); assert.deepEqual(repeated.receipt, sealed);
    assert.equal(sql("select count(*) from public.relative_plan_trained_probability_models"), "1");
    await replaceIsolatedSnapshotClocks(originalSnapshot, {
      created_at: originalSnapshot.created_at, updated_at: originalSnapshot.updated_at });
    sealedModelIgnoresMutableSnapshotClocks = true;
    await replaceIsolatedRunClocks(originalRun, { created_at: originalRun.created_at, updated_at: originalRun.updated_at });
    sealedModelIgnoresMutableRunClocks = true;
  }
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
      now: new Date(Date.parse(session(priorDay).session_open) + 2.5 * 3600000 + n * 300000), rankedCount, originalInputs, featureVectorVersion }));
  }
  const parts = [], runtimeRows = [];
  for (const day of futureDays) for (let n = 0; n < 10; n++) {
    const at = new Date(Date.parse(session(day).session_open) + 2.5 * 3600000 + n * 900000);
    const part = await readers.prospectiveSource({ now: at, rankedCount, originalInputs, featureVectorVersion,
      positiveTickers: contextRegressionMode ? ["AAA"] : undefined });
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
  verifyCurrentFeatureBasis((await readers.createRelativePlanTrainedProbabilityService().read(owner)).receipt.trained_model.retained_training_source);
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
  // Only NEW isolated rows are faulted. Terminal cycle receipts are immutable;
  // never weaken that writer/trigger just to alter an existing test receipt.
  const originalRuntime = await readers.readRelativePlanCharterRuntimeSource({ owner, freeze, now });
  assert.equal(originalRuntime.status, "available");
  const sourceBeforeRuntimeFault = await readers.readRecommendationLearningBaselineSource(owner);
  assert.equal(sourceBeforeRuntimeFault.status, "available");
  let runtimeFaultSequence = 0;
  const insertRuntimeClockFault = async (kind, field) => {
    const at = new Date(Date.parse(session(futureDays[0]).session_open) + 6 * 3600000 + runtimeFaultSequence++ * 60000);
    const fixture = structuredClone(readers.charterRuntimeRows({ at: at.toISOString(), fingerprint: null, failed: true }));
    fixture[kind][field] = new Date(now.getTime() + 86400000).toISOString();
    const inserted = [];
    const restore = () => {
      for (const [table, id] of inserted.reverse()) {
        assert(/^[0-9a-f-]{36}$/.test(id));
        sql(`delete from public.${table} where id='${id}'`);
      }
    };
    try {
      for (const [table, row] of [["scheduled_scan_attempts", fixture.attempt], ["observation_cycle_receipts", fixture.cycle]]) {
        const response = await client.from(table).insert(row).select("id").single();
        assert.equal(response.error, null); inserted.push([table, response.data.id]);
      }
      // The historic event fixture's actual producer generates a fresh receipt
      // clock. Sample AFTER insertion, so the new raw-clock guard, not the
      // existing event/generated-time guard, is the dimension under test.
      return { restore, asOf: finalizedMode ? new Date() : now };
    } catch (error) { restore(); throw error; }
  };
  for (const kind of ["cycle", "attempt"]) for (const field of ["created_at", "updated_at"]) {
    const fault = await insertRuntimeClockFault(kind, field);
    try {
      const invalid = await readers.readRelativePlanCharterRuntimeSource({ owner, freeze, now: fault.asOf });
      assert.equal(invalid.status, "unavailable");
      assert.equal(invalid.blocker, "relative_plan_runtime_source_recording_times_invalid");
      if (kind === "attempt" && field === "updated_at") {
        const incomplete = await readers.createRelativePlanProspectiveService().read(owner, fault.asOf);
        assert.equal(incomplete.status, "available", incomplete.blocker);
        assert.equal(incomplete.learning.full_charter.computed_disposition, "evidence_incomplete");
        assert.equal(incomplete.learning.full_charter.evidence_complete, false);
        assert(incomplete.learning.full_charter.missing_dimensions.some(value =>
          value.includes("relative_plan_runtime_source_recording_times_invalid")));
        assert.deepEqual(incomplete.learning.full_charter.partitions.map(row => row.original_membership_fingerprint),
          charter.partitions.map(row => row.original_membership_fingerprint));
        assert.deepEqual(incomplete.learning.full_charter.partitions.map(row => row.original_population_count),
          [partitionPopulation, partitionPopulation]);
        if (finalizedMode) {
          const refused = await readers.createRelativePlanCharterResultService().finalize(owner, {},
            { acceptEncoding: originalInputs ? "gzip" : null });
          assert.equal(refused.status, "unavailable");
          assert.equal(refused.blocker, "relative_plan_runtime_source_recording_times_invalid");
          assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
          newResultRuntimeClocksVerified = true;
        }
      }
    } finally { fault.restore(); }
    assert.deepEqual(await readers.readRelativePlanCharterRuntimeSource({ owner, freeze, now }), originalRuntime);
  }
  currentRuntimeClocksVerified = true;
  assert.deepEqual(await readers.readRecommendationLearningBaselineSource(owner), sourceBeforeRuntimeFault);
  assert.deepEqual(await read(), full);
  runtimeClockSourcePreserved = true;
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
    const physical = await readers.readRecommendationLearningBaselineSource(owner);
    const source = readers.parseRecommendationLearningBaselineSource(physical.data);
    const originalRun = source.scanRuns.find(run => Date.parse(run.observed_at) >= Date.parse(windows.held_out.start_at));
    assert(originalRun);
    const nonTopSnapshot = source.snapshots.find(row => row.scan_run_id === originalRun.run_fingerprint &&
      originalRun.payload_json.candidate_decision_record.candidates.some(candidate =>
        candidate.candidate_id === row.payload_json.candidate_id && candidate.ranking?.rank > 3));
    assert(nonTopSnapshot);
    const future = new Date(Date.now() + 86400000).toISOString();
    await replaceIsolatedSnapshotClocks(nonTopSnapshot, { created_at: future, updated_at: future });
    const snapshotBefore = await readers.readRecommendationLearningBaselineSource(owner);
    const snapshotRejected = await readers.createRelativePlanCharterResultService().finalize(owner, {});
    assert.equal(snapshotRejected.status, "unavailable");
    assert.equal(snapshotRejected.blocker, "relative_plan_result_snapshot_recording_times_invalid");
    assert.equal(snapshotRejected.receipt, null);
    assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, snapshotBefore.data);
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
    await replaceIsolatedSnapshotClocks(nonTopSnapshot, {
      created_at: nonTopSnapshot.created_at, updated_at: nonTopSnapshot.updated_at });
    newResultSnapshotClocksVerified = true;
    await replaceIsolatedRunClocks(originalRun, { created_at: future, updated_at: future });
    const runBefore = await readers.readRecommendationLearningBaselineSource(owner);
    const runRejected = await readers.createRelativePlanCharterResultService().finalize(owner, {});
    assert.equal(runRejected.status, "unavailable");
    assert.equal(runRejected.blocker, "relative_plan_result_scan_run_recording_times_invalid");
    assert.equal(runRejected.receipt, null);
    assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, runBefore.data);
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
    await replaceIsolatedRunClocks(originalRun, { created_at: originalRun.created_at, updated_at: originalRun.updated_at });
    newResultRunClocksVerified = true;
    const conflictingRun = structuredClone(originalRun);
    await injectOriginalConflict(conflictingRun);
    await replaceIsolatedRunPayload(conflictingRun);
    const before = await readers.readRecommendationLearningBaselineSource(owner);
    const rejected = await readers.createRelativePlanCharterResultService().finalize(owner, {});
    assert.equal(rejected.status, "unavailable");
    assert.equal(rejected.blocker, "relative_plan_result_original_input_arithmetic_conflicting");
    assert.equal(rejected.terminal_quality_decision, null);
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
    assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, before.data);
    await replaceIsolatedRunPayload(originalRun);
    newResultOriginalInputVerified = true;
    // Keep a complete, original non-top-three forward member. The real
    // producer + writer retain a coherent target outcome and its twelve bars;
    // remove only the target touches to reproduce a NEW-result admission fault.
    const nonTop = originalRun.payload_json.candidate_decision_record.candidates.find(row => row.ranking?.rank > 3);
    assert(nonTop);
    const forwardSnapshot = source.snapshots.find(row => row.scan_run_id === originalRun.run_fingerprint &&
      row.payload_json.candidate_id === nonTop.candidate_id);
    assert(forwardSnapshot);
    const originalOutcome = source.outcomes.find(row => row.snapshot_fingerprint === forwardSnapshot.snapshot_fingerprint && row.horizon === "60m");
    assert(originalOutcome);
    const anchor = readers.recommendationOutcomeEvaluationAnchorFromSnapshot(forwardSnapshot);
    assert(anchor);
    const start = Date.parse(anchor.evaluation_anchor_start_at), midpoint = forwardSnapshot.entry;
    const bars = Array.from({ length: 12 }, (_, index) => ({ timestamp: new Date(start + index * 300000).toISOString(),
      open: midpoint, high: forwardSnapshot.target + 1, low: midpoint, close: forwardSnapshot.target, volume: 1000 }));
    const replay = readers.computeRecommendationOutcome({ snapshot: forwardSnapshot, horizon: "60m",
      evaluated_at: originalOutcome.evaluated_at, candles: bars, current_price: forwardSnapshot.target,
      provider: "twelve_data", source: "intraday_candles", data_completeness: "complete" }).outcome;
    assert.equal(replay.target_hit, true);
    const coverage = readers.buildCanonicalOutcomeProviderCoverageReceipt({ candles: bars, request: {
      interval: "5min", horizon: "60m", ...anchor, start_at: anchor.evaluation_anchor_start_at,
      end_at: new Date(start + 3600000).toISOString(),
    }, result: { status: "available", provider: "twelve_data" } });
    const validRetained = { ...originalOutcome, ...replay, id: originalOutcome.id,
      created_at: originalOutcome.created_at, updated_at: originalOutcome.updated_at,
      payload_json: { ...originalOutcome.payload_json, ...replay.payload_json, canonical_provider_coverage: coverage,
        counterfactual_candles: bars, counterfactual_candle_source: "horizon_filtered_intraday_candles",
        retained_candles_available: true, retained_candle_count: bars.length } };
    for (const index of [0, 11]) {
      const misaligned = structuredClone(validRetained);
      const bar = misaligned.payload_json.counterfactual_candles[index];
      bar.timestamp = bar.timestamp.replace(".000Z", ".000001Z");
      assert.equal((await readers.persistRecommendationOutcome(misaligned, { supabaseClient: client, server: true })).status, "saved");
      const beforeGrid = await readers.readRecommendationLearningBaselineSource(owner);
      const rejectedGrid = await readers.createRelativePlanCharterResultService().finalize(owner, {});
      assert.equal(rejectedGrid.blocker, "relative_plan_result_retained_candle_coverage_conflicting");
      assert.equal(rejectedGrid.status, "unavailable"); assert.equal(rejectedGrid.receipt, null);
      assert.equal(rejectedGrid.terminal_quality_decision, null);
      assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, beforeGrid.data);
      assert.equal(beforeGrid.data.recommendation_snapshots.length, (72 + unrelatedPriorDecisions) * rankedCount);
      assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
    }
    newResultExactCandleGridVerified = true;
    for (const key of ["entry_triggered_at", "target_hit_at"]) {
      const misaligned = structuredClone(validRetained);
      assert.equal(typeof misaligned[key], "string");
      misaligned[key] = misaligned[key].replace(".000Z", ".000001Z");
      assert.equal((await readers.persistRecommendationOutcome(misaligned, { supabaseClient: client, server: true })).status, "saved");
      const beforeEvent = await readers.readRecommendationLearningBaselineSource(owner);
      const rejectedEvent = await readers.createRelativePlanCharterResultService().finalize(owner, {});
      assert.equal(rejectedEvent.blocker, "relative_plan_result_retained_candle_outcome_conflicting");
      assert.equal(rejectedEvent.status, "unavailable"); assert.equal(rejectedEvent.receipt, null);
      assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, beforeEvent.data);
      assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
    }
    newResultExactEventClockVerified = true;
    const conflictingRetained = structuredClone(validRetained);
    for (const bar of conflictingRetained.payload_json.counterfactual_candles) Object.assign(bar, { high: midpoint + 0.01, close: midpoint });
    assert.equal((await readers.persistRecommendationOutcome(conflictingRetained, { supabaseClient: client, server: true })).status, "saved");
    const beforeCandles = await readers.readRecommendationLearningBaselineSource(owner);
    const rejectedCandles = await readers.createRelativePlanCharterResultService().finalize(owner, {});
    assert.equal(rejectedCandles.status, "unavailable");
    assert.equal(rejectedCandles.blocker, "relative_plan_result_retained_candle_outcome_conflicting");
    assert.equal(rejectedCandles.terminal_quality_decision, null);
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
    assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, beforeCandles.data);
    // The original neither-hit horizon return must not be replaced by a
    // contradictory scalar before NEW immutable quality finalization.
    const neitherBars = bars.map(bar => ({ ...bar, high: midpoint + 0.1,
      low: midpoint - 0.1, close: midpoint + 0.05 }));
    const neither = readers.computeRecommendationOutcome({ snapshot: forwardSnapshot, horizon: "60m",
      evaluated_at: originalOutcome.evaluated_at, candles: neitherBars, current_price: midpoint + 0.05,
      provider: "twelve_data", source: "intraday_candles", data_completeness: "complete" }).outcome;
    assert.equal(neither.status, "neither_hit");
    const honestNeither = { ...validRetained, ...neither, id: originalOutcome.id,
      created_at: originalOutcome.created_at, updated_at: originalOutcome.updated_at,
      payload_json: { ...validRetained.payload_json, ...neither.payload_json, counterfactual_candles: neitherBars } };
    assert.equal((await readers.persistRecommendationOutcome({ ...honestNeither, current_r: 9 },
      { supabaseClient: client, server: true })).status, "saved");
    const beforeR = await readers.readRecommendationLearningBaselineSource(owner);
    const rejectedR = await readers.createRelativePlanCharterResultService().finalize(owner, {});
    assert.equal(rejectedR.blocker, "relative_plan_result_retained_candle_realized_r_conflicting");
    assert.equal(rejectedR.terminal_quality_decision, null);
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
    assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, beforeR.data);
    assert.equal((await readers.persistRecommendationOutcome(honestNeither, { supabaseClient: client, server: true })).status, "saved");
    const honestR = readers.parseRecommendationLearningBaselineSource(
      (await readers.readRecommendationLearningBaselineSource(owner)).data).outcomes.find(row => row.id === originalOutcome.id);
    assert.equal(honestR.current_r, neither.current_r);
    assert.equal(honestR.current_price, midpoint + 0.05);
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
    newResultRetainedHorizonRVerified = true;
    // Exercise the actual persisted EOD fallback selected when current R is
    // absent; it must agree with the same original sixty-minute close.
    const fallbackNeither = { ...honestNeither, current_price: null, current_r: null,
      eod_price: midpoint + 0.05, eod_r: 9 };
    assert.equal((await readers.persistRecommendationOutcome(fallbackNeither,
      { supabaseClient: client, server: true })).status, "saved");
    const beforeFallbackR = await readers.readRecommendationLearningBaselineSource(owner);
    const rejectedFallbackR = await readers.createRelativePlanCharterResultService().finalize(owner, {});
    assert.equal(rejectedFallbackR.blocker, "relative_plan_result_retained_candle_realized_r_conflicting");
    assert.equal(rejectedFallbackR.terminal_quality_decision, null);
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
    assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, beforeFallbackR.data);
    assert.equal((await readers.persistRecommendationOutcome({ ...fallbackNeither, eod_r: neither.current_r },
      { supabaseClient: client, server: true })).status, "saved");
    const honestFallbackR = readers.parseRecommendationLearningBaselineSource(
      (await readers.readRecommendationLearningBaselineSource(owner)).data).outcomes.find(row => row.id === originalOutcome.id);
    assert.equal(honestFallbackR.current_r, null);
    assert.equal(honestFallbackR.current_price, null);
    assert.equal(honestFallbackR.eod_r, neither.current_r);
    assert.equal(honestFallbackR.eod_price, midpoint + 0.05);
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
    newResultRetainedFallbackHorizonRVerified = true;
    assert.equal((await readers.persistRecommendationOutcome(validRetained, { supabaseClient: client, server: true })).status, "saved");
    newResultRetainedCandlesVerified = true;
    const decisionAt = originalRun.payload_json.candidate_decision_record.decision_timestamp;
    assert(decisionAt.endsWith(".000Z"));
    for (const fault of ["run_future", "snapshot_future", "both_offset"]) {
      const badRun = structuredClone(originalRun), badSnapshot = structuredClone(forwardSnapshot);
      const futureAt = decisionAt.replace(".000Z", fault === "both_offset" ? ".000001+00:00" : ".000001Z");
      badRun.payload_json.market_regime_context.captured_at = fault === "snapshot_future" ? decisionAt : futureAt;
      badSnapshot.payload_json.market_regime_context.captured_at = fault === "run_future" ? decisionAt : futureAt;
      await replaceIsolatedRunPayload(badRun);
      await replaceIsolatedSnapshotPayload(badSnapshot);
      const beforeContext = await readers.readRecommendationLearningBaselineSource(owner);
      const rejectedContext = await readers.createRelativePlanCharterResultService().finalize(owner, {});
      assert.equal(rejectedContext.status, "unavailable");
      assert.equal(rejectedContext.blocker, "relative_plan_result_original_regime_context_clock_conflicting");
      assert.equal(rejectedContext.receipt, null);
      assert.deepEqual((await readers.readRecommendationLearningBaselineSource(owner)).data, beforeContext.data);
      assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
    }
    await replaceIsolatedRunPayload(originalRun);
    const offsetSnapshot = structuredClone(forwardSnapshot);
    offsetSnapshot.payload_json.market_regime_context.captured_at = new Date(Date.parse(decisionAt) + 120 * 60000)
      .toISOString().replace(".000Z", ".000000+02:00");
    await replaceIsolatedSnapshotPayload(offsetSnapshot);
    newResultRegimeTimeVerified = true; observedOffsetRegimeTimeVerified = true;
    if (originalInputs) {
      const unsupported = await readers.createRelativePlanCharterResultService().finalize(owner, {});
      assert.equal(unsupported.status, "not_ready");
      assert.equal(unsupported.blocker, "relative_plan_complete_result_response_too_large");
      assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "0");
      negotiatedPrewriteVerified = true;
    }
    const beforeFinalization = Date.now();
    durable = await readers.createRelativePlanCharterResultService().finalize(owner,{}, { acceptEncoding: originalInputs ? "gzip" : null });
    assert.equal(durable.status,"finalized",durable.blocker);
    assert.equal(durable.terminal_quality_decision.disposition,"reject");
    assert(durable.receipt.result.measurement.evidence_complete);
    const retainedRegimeSource = readers.decodeRelativePlanRetainedSource(durable.receipt.result.retained_source);
    assert(retainedRegimeSource);
    assert.equal(retainedRegimeSource.snapshots.find(row => row.snapshot_fingerprint === forwardSnapshot.snapshot_fingerprint)
      .payload_json.market_regime_context.captured_at, offsetSnapshot.payload_json.market_regime_context.captured_at);
    const contextDiagnostic = durable.terminal_quality_decision.context_diagnostic;
    assert(contextDiagnostic);
    assert.equal(contextDiagnostic.source.result_id, durable.receipt.result_id);
    assert.equal(contextDiagnostic.source.result_fingerprint, durable.receipt.result.result_fingerprint);
    assert.equal(contextDiagnostic.status, contextRegressionMode ? "conservative_regression_detected" : "no_conservative_regression");
    if (contextRegressionMode) {
      assert.equal(contextDiagnostic.priority_context.dimension, "setup");
      assert.equal(contextDiagnostic.priority_context.key, "BREAKOUT_CONTINUATION");
      assert.equal(contextDiagnostic.priority_context.baseline.resolved_outcome_count, 180);
      assert.equal(contextDiagnostic.priority_context.challenger.resolved_outcome_count, 180);
      assert(contextDiagnostic.priority_context.baseline.precision.lower > contextDiagnostic.priority_context.challenger.precision.upper);
    }
    assert(Object.values(contextDiagnostic.authority).every(value => value === false));
    if (unrelatedPriorDecisions) {
      const retained = readers.decodeRelativePlanRetainedSource(durable.receipt.result.retained_source); assert(retained);
      assert.equal(retained.scanRuns.length, 72);
      verifyCurrentFeatureBasis(retained);
      assert.equal(sql(`select count(*) from public.recommendation_scan_runs where owner_user_id='${owner}'`), "84");
    }
    assert(Date.parse(durable.receipt.finalized_at) >= beforeFinalization);
    assert(Date.parse(durable.receipt.finalized_at) <= Date.now());
    const restartedTerminal = await readers.createRelativePlanCharterResultService().read(owner);
    assert.deepEqual(restartedTerminal.receipt,durable.receipt);
    assert.deepEqual(restartedTerminal.terminal_quality_decision.context_diagnostic,contextDiagnostic);
    assert.equal((await readers.createRelativePlanCharterResultService().finalize(owner,{})).status,"already_finalized");
    await replaceIsolatedSnapshotClocks(nonTopSnapshot, { created_at: future, updated_at: future });
    assert(newResultRunClocksVerified);
    await replaceIsolatedRunClocks(originalRun, { created_at: future, updated_at: future });
    const runtimeFault = await insertRuntimeClockFault("attempt", "updated_at");
    try {
      const invalidRuntime = await readers.readRelativePlanCharterRuntimeSource({ owner, freeze, now: runtimeFault.asOf });
      assert.equal(invalidRuntime.blocker, "relative_plan_runtime_source_recording_times_invalid");
      const snapshotRepeated = await readers.createRelativePlanCharterResultService().finalize(owner, {});
      assert.equal(snapshotRepeated.status, "already_finalized"); assert.deepEqual(snapshotRepeated.receipt, durable.receipt);
      assert.deepEqual((await readers.createRelativePlanCharterResultService().read(owner)).receipt, durable.receipt);
      assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "1");
      sealedResultIgnoresMutableRuntimeClocks = true;
    } finally { runtimeFault.restore(); }
    await replaceIsolatedSnapshotClocks(nonTopSnapshot, {
      created_at: nonTopSnapshot.created_at, updated_at: nonTopSnapshot.updated_at });
    sealedResultIgnoresMutableSnapshotClocks = true;
    await replaceIsolatedRunClocks(originalRun, { created_at: originalRun.created_at, updated_at: originalRun.updated_at });
    sealedResultIgnoresMutableRunClocks = true;
    const laterMisaligned = structuredClone(validRetained);
    laterMisaligned.payload_json.counterfactual_candles[11].timestamp =
      laterMisaligned.payload_json.counterfactual_candles[11].timestamp.replace(".000Z", ".000001Z");
    assert.equal((await readers.persistRecommendationOutcome(laterMisaligned, { supabaseClient: client, server: true })).status, "saved");
    assert.deepEqual((await readers.createRelativePlanCharterResultService().read(owner)).receipt, durable.receipt);
    const gridRetry = await readers.createRelativePlanCharterResultService().finalize(owner, {});
    assert.equal(gridRetry.status, "already_finalized"); assert.deepEqual(gridRetry.receipt, durable.receipt);
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "1");
    sealedResultIgnoresMutableCandleGrid = true;
    assert.equal((await readers.persistRecommendationOutcome(validRetained, { supabaseClient: client, server: true })).status, "saved");
    const laterRunContext = structuredClone(originalRun), laterSnapshotContext = structuredClone(forwardSnapshot);
    const laterContextAt = decisionAt.replace(".000Z", ".000001Z");
    laterRunContext.payload_json.market_regime_context.captured_at = laterContextAt;
    laterSnapshotContext.payload_json.market_regime_context.captured_at = laterContextAt;
    await replaceIsolatedRunPayload(laterRunContext);
    await replaceIsolatedSnapshotPayload(laterSnapshotContext);
    assert.deepEqual((await readers.createRelativePlanCharterResultService().read(owner)).receipt, durable.receipt);
    const contextRetry = await readers.createRelativePlanCharterResultService().finalize(owner, {});
    assert.equal(contextRetry.status, "already_finalized"); assert.deepEqual(contextRetry.receipt, durable.receipt);
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "1");
    await replaceIsolatedRunPayload(originalRun);
    await replaceIsolatedSnapshotPayload(forwardSnapshot);
    sealedResultIgnoresMutableRegimeTime = true;
    assert.equal((await readers.persistRecommendationOutcome(conflictingRetained, { supabaseClient: client, server: true })).status, "saved");
    assert.deepEqual((await readers.createRelativePlanCharterResultService().read(owner)).receipt, durable.receipt);
    const repeatCandles = await readers.createRelativePlanCharterResultService().finalize(owner, {});
    assert.equal(repeatCandles.status, "already_finalized"); assert.deepEqual(repeatCandles.receipt, durable.receipt);
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "1");
    assert.equal((await readers.persistRecommendationOutcome(originalOutcome, { supabaseClient: client, server: true })).status, "saved");
    sealedResultIgnoresMutableCandles = true;
    await replaceIsolatedRunPayload(conflictingRun);
    assert.deepEqual((await readers.createRelativePlanCharterResultService().read(owner)).receipt, durable.receipt);
    const repeatedInput = await readers.createRelativePlanCharterResultService().finalize(owner, {});
    assert.equal(repeatedInput.status, "already_finalized"); assert.deepEqual(repeatedInput.receipt, durable.receipt);
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "1");
    await replaceIsolatedRunPayload(originalRun);
    sealedResultIgnoresMutableInputs = true;
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
    assert.deepEqual(sealedRepeat.terminal_quality_decision.context_diagnostic, contextDiagnostic);
    assert.equal(sql("select count(*) from public.relative_plan_charter_results"), "1");
    assert.equal((await readers.persistRecommendationOutcome(originalRevision,
      { supabaseClient: client, server: true })).status, "saved");
    for (const body of [durable,persisted]) {
      const transported = await verifyHttp(readers, body);
      finalizedHttpBytes = Math.max(finalizedHttpBytes ?? 0, transported.wireBytes);
      finalizedDecodedHttpBytes = Math.max(finalizedDecodedHttpBytes ?? 0, transported.decodedBytes);
      finalizedTransportEncoding = transported.encoding;
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
    const losses = await readers.prospectiveSource({ now: new Date(part.snapshots[0].recommended_at), allLosses: true, rankedCount, originalInputs, featureVectorVersion });
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
    current_feature_basis_verified: currentFeatureBasis,
    original_feature_basis: featureVectorVersion ?? "recommendation_decision_feature_vector_v2",
    evidence: finalizedMode ? "historical_synthetic_model_fixture_actual_database_finalization_not_market_alpha" : "synthetic_closed_not_market_alpha",
    current_runtime_rejects_unobserved_recording_times: currentRuntimeClocksVerified,
    runtime_clock_admission_preserves_complete_original_source: runtimeClockSourcePreserved,
    new_result_rejects_unobserved_runtime_clocks_before_storage: newResultRuntimeClocksVerified,
    sealed_result_ignores_later_mutable_runtime_clocks: sealedResultIgnoresMutableRuntimeClocks,
    new_training_rejects_unobserved_snapshot_clocks_before_storage: newTrainingSnapshotClocksVerified,
    new_result_rejects_unobserved_snapshot_clocks_before_storage: newResultSnapshotClocksVerified,
    sealed_model_ignores_later_mutable_snapshot_clocks: sealedModelIgnoresMutableSnapshotClocks,
    sealed_result_ignores_later_mutable_snapshot_clocks: sealedResultIgnoresMutableSnapshotClocks,
    new_training_rejects_unobserved_scan_clocks_before_storage: newTrainingRunClocksVerified,
    new_result_rejects_unobserved_scan_clocks_before_storage: newResultRunClocksVerified,
    sealed_model_ignores_later_mutable_scan_clocks: sealedModelIgnoresMutableRunClocks,
    sealed_result_ignores_later_mutable_scan_clocks: sealedResultIgnoresMutableRunClocks,
    immutable_actual_database_training_members: finalizedMode ? null : 12 * rankedCount,
    actual_database_training_clock_verified: actualTrainingClockVerified,
    separate_transaction_committed_model_witness_verified: separateCommittedWitnessVerified,
    model_materialized_at: sealed.materialized_at, model_committed_read_at: sealed.committed_read_at,
    first_synthetic_forward_window_start_at: windows.held_out.start_at,
    new_training_rejects_original_input_conflict_before_storage: newTrainingOriginalInputVerified,
    new_result_rejects_original_input_conflict_before_storage: newResultOriginalInputVerified,
    sealed_model_ignores_later_mutable_original_inputs: sealedModelIgnoresMutableInputs,
    sealed_result_ignores_later_mutable_original_inputs: sealedResultIgnoresMutableInputs,
    new_result_rejects_contradictory_retained_forward_candles_before_storage: newResultRetainedCandlesVerified,
    new_training_rejects_submillisecond_candle_grid_before_storage: newTrainingExactCandleGridVerified,
    new_result_rejects_submillisecond_candle_grid_before_storage: newResultExactCandleGridVerified,
    new_training_rejects_submillisecond_event_clock_before_storage: newTrainingExactEventClockVerified,
    new_result_rejects_submillisecond_event_clock_before_storage: newResultExactEventClockVerified,
    sealed_result_ignores_later_mutable_candle_grid: sealedResultIgnoresMutableCandleGrid,
    new_training_rejects_future_original_regime_context_before_storage: newTrainingRegimeTimeVerified,
    new_result_rejects_future_original_regime_context_before_storage: newResultRegimeTimeVerified,
    valid_observed_offset_regime_context_keeps_original_population: observedOffsetRegimeTimeVerified,
    sealed_result_ignores_later_mutable_regime_context: sealedResultIgnoresMutableRegimeTime,
    new_result_rejects_contradictory_retained_horizon_r_before_storage: newResultRetainedHorizonRVerified,
    new_result_rejects_contradictory_retained_fallback_horizon_r_before_storage: newResultRetainedFallbackHorizonRVerified,
    valid_retained_forward_candles_keep_complete_result_population: newResultRetainedCandlesVerified,
    sealed_result_ignores_later_mutable_forward_candles: sealedResultIgnoresMutableCandles,
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
    terminal_context_readback_verified: finalizedMode,
    terminal_context_regression_fixture: contextRegressionMode,
    durable_terminal_result_verified: finalizedMode, actual_database_finalization_clock_verified: finalizedMode,
    historical_model_clock_fixture: finalizedMode, quality_improvement_verified: false,
    unrelated_pre_window_decisions_persisted_and_preserved: unrelatedPriorDecisions,
    complete_original_product_http_bytes: httpBytes,
    complete_original_product_decoded_http_bytes: originalDecodedHttpBytes,
    actual_loopback_http_readback_verified: actualHttpReadbackVerified,
    full_population_transport_encoding: transportEncoding,
    complete_finalized_product_http_bytes: finalizedHttpBytes, result_prewrite_guards_verified: resultPrewriteGuardsVerified,
    complete_original_archives: originalInputs, full_original_source_decoded_bytes: durable?.receipt.result.retained_source.decoded_byte_length ?? null,
    full_original_source_sql_capacity_verified: sourceCapacitySqlVerified,
    supported_transport_required_before_result_insert: negotiatedPrewriteVerified,
    complete_finalized_product_decoded_http_bytes: finalizedDecodedHttpBytes,
    finalized_product_transport_encoding: finalizedTransportEncoding,
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
