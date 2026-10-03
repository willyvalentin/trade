// CLOSED, isolated Postgres/PostgREST/real-SDK proof. No production credentials,
// provider, scheduled function or broker are used. Generated files are ephemeral.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build } from "esbuild";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd();
const directory = mkdtempSync(join(tmpdir(), "ture-relative-plan-prospective-proof-"));
const db = `ture-relative-plan-prospective-db-${process.pid}`;
const api = `ture-relative-plan-prospective-api-${process.pid}`;
const network = `ture-relative-plan-prospective-net-${process.pid}`;
const docker = (...args) => execFileSync("docker", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
// The image briefly starts a UNIX-socket-only initialization server, then
// stops it. Require the final TCP server so schema work cannot hit that gap.
const sql = text => execFileSync("docker", ["exec", "-i", db, "psql", "-h", "127.0.0.1", "-U", "postgres", "-d", "postgres", "-At", "-v", "ON_ERROR_STOP=1"],
  { input: text, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
const originalFetch = globalThis.fetch;
const originalEnvironment = { ...process.env };
let blockedExternalRequests = 0;
let dbCreated = false, apiCreated = false, networkCreated = false;
try {
  await build({ bundle: true, platform: "node", format: "cjs", conditions: ["react-server"], alias: { "@": root },
    plugins: [{ name: "real-test-fixture-expect", setup(builder) {
      builder.onResolve({ filter: /^@playwright\/test$/ }, () => ({
        path: resolve(root, "node_modules/@playwright/test/index.js"), external: true }));
    } }],
    logLevel: "silent", stdin: { resolveDir: root, contents: `
      export { prospectiveInput, prospectiveOwner } from './tests/fixtures/relative-plan-prospective';
      export { relativePlanProspectiveStore } from './lib/server/relative-plan-prospective-store';
      export { createRelativePlanProspectiveService } from './lib/server/relative-plan-prospective-service';
      export { prospectiveSource } from './tests/fixtures/relative-plan-prospective-source';
      export { getServerSupabaseClient } from './lib/supabase-server';
      export { getUsEquityMarketSession } from './lib/us-equity-market-calendar';
      export { persistRecommendationScanRun } from './lib/server/recommendation-scan-run-persistence';
      export { persistRecommendationSnapshot } from './lib/server/recommendation-snapshot-persistence';
      export { persistRecommendationOutcome } from './lib/server/recommendation-outcome-persistence';` },
    outfile: join(directory, "reader.cjs") });
  const readers = createRequire(import.meta.url)(join(directory, "reader.cjs"));
  docker("network", "create", network); networkCreated = true;
  docker("run", "--pull=missing", "--rm", "-d", "--name", db, "--network", network,
    "-e", "POSTGRES_PASSWORD=closed-proof-only", "postgres:16-alpine"); dbCreated = true;
  for (let i = 0; i < 40; i++) {
    try { sql("select 1"); break; } catch { if (i === 39) throw new Error("isolated_database_not_ready"); await delay(250); }
  }
  sql(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create role authenticator login noinherit password 'closed-proof-only';
    grant anon, authenticated, service_role to authenticator; grant usage on schema public to service_role;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$;
    insert into auth.users values('${readers.prospectiveOwner}'),('44444444-4444-4444-8444-444444444444');`);
  for (const file of ["20260519000000_create_legacy_baseline_schema_draft.sql",
    "20260528000000_create_recommendation_snapshots.sql", "20260528001000_create_recommendation_outcomes.sql",
    "20260605000000_add_recommendation_outcomes_snapshot_horizon_unique_index.sql",
    "20260528002000_create_recommendation_scan_runs.sql", "20260528003000_create_recommendation_batches.sql",
    "20260614000000_create_execution_records.sql", "20260724001500_create_transactional_open_position_command.sql",
    "20260811163228_add_fail_closed_application_owner_foundation.sql"]) {
    sql(readFileSync(resolve(root, "supabase/migrations", file), "utf8"));
  }
  // Existing source tables retain their normal service writer permissions;
  // the NEW immutable comparison table below deliberately grants none.
  sql("grant all on all tables in schema public to service_role;");
  sql(readFileSync(resolve(root, "supabase/migrations/20261002213547_if4_relative_plan_prospective_comparison.sql"), "utf8"));
  sql(readFileSync(resolve(root, "supabase/migrations/20261002233358_if4_relative_plan_trained_probability_model.sql"), "utf8"));
  sql(readFileSync(resolve(root, "supabase/migrations/20261003015239_if4_relative_plan_charter_result.sql"), "utf8"));
  const key = "closed-proof-jwt-only-0123456789012345678901234567890123456789";
  const encoded = value => Buffer.from(JSON.stringify(value)).toString("base64url");
  const tokenFor = role => {
    const body = `${encoded({ alg: "HS256", typ: "JWT" })}.${encoded({ role, exp: Math.floor(Date.now() / 1000) + 3600 })}`;
    return `${body}.${createHmac("sha256", key).update(body).digest("base64url")}`;
  };
  docker("run", "--pull=missing", "--rm", "-d", "--name", api, "--network", network, "-p", "127.0.0.1::3000",
    "-e", `PGRST_DB_URI=postgresql://authenticator:closed-proof-only@${db}:5432/postgres`,
    "-e", "PGRST_DB_SCHEMAS=public", "-e", "PGRST_DB_ANON_ROLE=anon", "-e", `PGRST_JWT_SECRET=${key}`,
    "public.ecr.aws/supabase/postgrest:v16.1"); apiCreated = true;
  const endpoint = `http://${docker("port", api, "3000/tcp")}`;
  globalThis.fetch = async (input, options) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
    assert.equal(url.origin, endpoint, "CLOSED proof must never call a remote service");
    if (url.origin !== endpoint) blockedExternalRequests++;
    return originalFetch(input, options);
  };
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(endpoint)).ok) break; } catch { /* bounded startup only */ }
    if (i === 39) throw new Error("isolated_postgrest_not_ready"); await delay(250);
  }
  // SDK adds /rest/v1 to a Supabase origin. Rewrite only this local proof's
  // prefix; all other production client/persistence/readback code is unchanged.
  globalThis.fetch = async (input, options) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
    if (url.origin !== endpoint) { blockedExternalRequests++; throw new Error("external_request_forbidden"); }
    url.pathname = url.pathname.replace(/^\/rest\/v1\//, "/");
    return originalFetch(url, options);
  };
  process.env.NEXT_PUBLIC_SUPABASE_URL = endpoint;
  process.env.SUPABASE_SERVICE_ROLE_KEY = tokenFor("service_role");
  // Do not inherit any alternative production service-role alias.
  for (const name of ["SUPABASE_SERVICE_ROLE", "SUPABASE_SERVICE_ROLE_SECRET"]) delete process.env[name];
  const owner = readers.prospectiveOwner;
  process.env.TURE_APPLICATION_OWNER_USER_ID = owner;
  const at = Date.now();
  const window = (startDay, endDay) => ({ start_at: new Date(at + startDay * 86400000).toISOString(),
    end_at: new Date(at + endDay * 86400000).toISOString() });
  const heldDay = new Date(at + 10 * 86400000); heldDay.setUTCHours(0, 0, 0, 0);
  while (!readers.getUsEquityMarketSession(heldDay.toISOString().slice(0, 10)).session_open) heldDay.setUTCDate(heldDay.getUTCDate() + 1);
  const input = { ...readers.prospectiveInput, windows: { training: window(1, 8),
    held_out: { start_at: heldDay.toISOString(), end_at: new Date(heldDay.getTime() + 86400000).toISOString() },
    walk_forward: { start_at: new Date(heldDay.getTime() + 14 * 86400000).toISOString(),
      end_at: new Date(heldDay.getTime() + 15 * 86400000).toISOString() } } };
  assert.equal((await readers.relativePlanProspectiveStore().read(owner)).status, "not_found");
  const result = await readers.relativePlanProspectiveStore().freeze(input, owner, new Date());
  assert.equal(result.status, "frozen");
  const restarted = readers.relativePlanProspectiveStore();
  assert.deepEqual((await restarted.read(owner)).receipt, result.receipt);
  assert.equal((await restarted.freeze(input, owner, new Date(at + 180 * 86400000))).status, "already_frozen");
  assert.equal((await restarted.read("33333333-3333-4333-8333-333333333333")).status, "not_found");
  assert.equal((await restarted.freeze({ ...input, source_revision: { ...input.source_revision, commit_ref: "c".repeat(40) } }, owner, new Date())).status, "conflicting");
  const receipts = await Promise.all(Array.from({ length: 6 }, () => readers.relativePlanProspectiveStore().freeze(input, owner, new Date())));
  assert(receipts.every(row => row.status === "already_frozen" && row.receipt.freeze_id === result.receipt.freeze_id));
  assert.equal(sql("select count(*) from public.relative_plan_prospective_comparisons"), "1");
  const concurrentOwner = "44444444-4444-4444-8444-444444444444";
  const concurrentInput = { ...input, owner_user_id: concurrentOwner };
  const concurrent = await Promise.all(Array.from({ length: 6 }, () => readers.relativePlanProspectiveStore().freeze(concurrentInput, concurrentOwner, new Date())));
  assert.equal(concurrent.filter(row => row.status === "frozen").length, 1);
  assert.equal(concurrent.filter(row => row.status === "already_frozen").length, 5);
  assert.equal(new Set(concurrent.map(row => row.receipt?.freeze_id)).size, 1);
  assert.equal(sql("select count(*) from public.relative_plan_prospective_comparisons"), "2");
  // Actual original-source writers -> SDK/PostgREST -> complete stable owner
  // reader -> new restarted prospective learner. Labels arrive AFTER input
  // enrollment, and missing/loss labels never change the membership identity.
  const decisionAt = new Date(heldDay.getTime() + 17 * 3600000);
  const source = await readers.prospectiveSource({ now: decisionAt });
  const { client } = readers.getServerSupabaseClient(); assert(client);
  for (const run of source.scanRuns) assert.equal((await readers.persistRecommendationScanRun(run, { supabaseClient: client, server: true })).status, "saved");
  for (const snapshot of source.snapshots) assert.equal((await readers.persistRecommendationSnapshot(snapshot, { supabaseClient: client, server: true })).status, "saved");
  const readAt = new Date(decisionAt.getTime() + 75 * 60000);
  const before = await readers.createRelativePlanProspectiveService().read(owner, readAt);
  assert.equal(before.status, "available");
  const enrolledBefore = before.learning.partitions[1];
  assert.equal(enrolledBefore.enrolled_decision_count, 1); assert.equal(enrolledBefore.original_population_count, 4);
  assert.equal(enrolledBefore.missing_outcome_count, 4); assert.equal(enrolledBefore.precision_delta, null);
  for (const outcome of source.outcomes.slice(1)) assert.equal((await readers.persistRecommendationOutcome(outcome, { supabaseClient: client, server: true })).status, "saved");
  const partial = await readers.createRelativePlanProspectiveService().read(owner, readAt);
  assert.equal(partial.learning.partitions[1].canonical_outcome_count, 3,
    JSON.stringify(partial.learning.partitions[1].decisions[0].comparison.candidates.map(row => ({
      ticker: row.ticker, status: row.outcome_status, reason: row.outcome_reason }))));
  assert.equal(partial.learning.partitions[1].missing_outcome_count, 1);
  assert.equal(partial.learning.partitions[1].original_membership_fingerprint, enrolledBefore.original_membership_fingerprint);
  assert.equal(partial.learning.partitions[1].precision_delta, null);
  assert.equal((await readers.persistRecommendationOutcome(source.outcomes[0], { supabaseClient: client, server: true })).status, "saved");
  const complete = await readers.createRelativePlanProspectiveService().read(owner, readAt);
  const held = complete.learning.partitions[1];
  assert.equal(held.canonical_outcome_count, 4); assert.equal(held.missing_outcome_count, 0);
  assert.equal(held.baseline.precision_at_3, 2 / 3); assert.equal(held.challenger.precision_at_3, 1);
  assert.equal(held.original_membership_fingerprint, enrolledBefore.original_membership_fingerprint);
  assert.equal(complete.learning.status, "evidence_incomplete"); assert.equal(complete.learning.terminal_quality_decision, null);
  assert(Object.values(complete.learning.authority).every(value => value === false));
  assert.equal(complete.learning.legacy_baseline_readiness.status, "not_ready");
  assert(complete.learning.legacy_baseline_readiness.blockers.includes("completed_input_research_requires_prospective_baseline_contract"));
  assert.deepEqual(await readers.createRelativePlanProspectiveService().read(owner, readAt), complete);
  assert.equal((await readers.createRelativePlanProspectiveService().read(concurrentOwner, readAt)).learning.partitions[1].enrolled_decision_count, 0);
  // Actual persisted inputs -> canonical outcome adapter -> restarted product
  // learner. Neither a numerical-only helper nor a substituted source reader.
  const trainingDays = [];
  const trainingDay = new Date(at + 86400000); trainingDay.setUTCHours(0, 0, 0, 0);
  while (trainingDays.length < 3) {
    if (readers.getUsEquityMarketSession(trainingDay.toISOString().slice(0, 10)).session_open) trainingDays.push(new Date(trainingDay));
    trainingDay.setUTCDate(trainingDay.getUTCDate() + 1);
  }
  const sourceAt = (day, ordinal, allLosses = false) => readers.prospectiveSource({
    now: new Date(day.getTime() + 17 * 3600000 + ordinal * 5 * 60000), allLosses });
  const trainingSources = await Promise.all(trainingDays.flatMap(day => [0, 1, 2].map(n => sourceAt(day, n))));
  const heldSources = [source, ...await Promise.all([1, 2].map(n => sourceAt(heldDay, n)))];
  const walkDay = new Date(input.windows.walk_forward.start_at);
  const walkSources = await Promise.all([0, 1, 2].map(n => sourceAt(walkDay, n, true)));
  const pending = heldSources[2].outcomes[3];
  for (const part of [...trainingSources, ...heldSources.slice(1), ...walkSources]) {
    for (const run of part.scanRuns) assert.equal((await readers.persistRecommendationScanRun(run, { supabaseClient: client, server: true })).status, "saved");
    for (const snapshot of part.snapshots) assert.equal((await readers.persistRecommendationSnapshot(snapshot, { supabaseClient: client, server: true })).status, "saved");
    for (const outcome of part.outcomes.filter(row => row.id !== pending.id)) assert.equal((await readers.persistRecommendationOutcome(outcome, { supabaseClient: client, server: true })).status, "saved");
  }
  const probabilityReadAt = new Date(Date.parse(input.windows.walk_forward.end_at) + 3600000);
  const measurement = async partitionIndex => {
    const restart = await readers.createRelativePlanProspectiveService().read(owner, probabilityReadAt);
    assert.equal(restart.status, "available");
    assert.equal(restart.learning.status, "evidence_incomplete");
    assert.equal(restart.learning.terminal_quality_decision, null);
    assert(Object.values(restart.learning.authority).every(value => value === false));
    const result = restart.learning.partitions[partitionIndex].probability_measurement;
    assert(result); return { result, restart };
  };
  const missingProbability = await measurement(1);
  assert.equal(missingProbability.result.status, "evidence_incomplete");
  assert.equal(missingProbability.result.forward.original_population_count, 12);
  assert.equal(missingProbability.result.forward.missing_outcome_count, 1);
  assert.equal(missingProbability.result.forward.baseline, null);
  assert.equal((await readers.persistRecommendationOutcome(pending, { supabaseClient: client, server: true })).status, "saved");
  const underfilledProbability = await measurement(1);
  assert.equal(underfilledProbability.result.status, "evidence_incomplete");
  assert.equal(underfilledProbability.result.model.sample_count, 36);
  assert.equal(underfilledProbability.result.forward.missing_probability_count, 3);
  assert.equal(underfilledProbability.result.forward.baseline, null);
  const extraTraining = await Promise.all(trainingDays.map(day => sourceAt(day, 3)));
  for (const part of extraTraining) {
    for (const run of part.scanRuns) assert.equal((await readers.persistRecommendationScanRun(run, { supabaseClient: client, server: true })).status, "saved");
    for (const snapshot of part.snapshots) assert.equal((await readers.persistRecommendationSnapshot(snapshot, { supabaseClient: client, server: true })).status, "saved");
    for (const outcome of part.outcomes) assert.equal((await readers.persistRecommendationOutcome(outcome, { supabaseClient: client, server: true })).status, "saved");
  }
  const calibratedHeld = await measurement(1), calibratedWalk = await measurement(2);
  assert.equal(calibratedHeld.result.status, "measured", JSON.stringify(calibratedHeld.result.blockers));
  assert.equal(calibratedWalk.result.status, "measured");
  assert.equal(calibratedHeld.result.model.sample_count, 48);
  assert.equal(calibratedHeld.result.model.trading_day_count, 3);
  assert.equal(calibratedHeld.result.model.ticker_count, 4);
  assert.deepEqual(calibratedWalk.result.model, calibratedHeld.result.model);
  assert.equal(calibratedHeld.result.forward.original_population_count, 12);
  assert.equal(calibratedWalk.result.forward.original_population_count, 12);
  assert.equal(calibratedHeld.result.forward.original_membership_fingerprint, missingProbability.result.forward.original_membership_fingerprint);
  assert(!calibratedHeld.restart.learning.blockers.includes("training_only_probability_calibration_required"));
  assert(calibratedHeld.restart.learning.blockers.includes("full_charter_forward_scorecard_required"));
  const unfavorableForward = await Promise.all([0, 1, 2].map(n => sourceAt(heldDay, n, true)));
  for (const part of unfavorableForward) for (const outcome of part.outcomes) {
    assert.equal((await readers.persistRecommendationOutcome(outcome, { supabaseClient: client, server: true })).status, "saved");
  }
  const changedProbability = await measurement(1);
  assert.equal(changedProbability.result.status, "measured");
  assert.deepEqual(changedProbability.result.model, calibratedHeld.result.model);
  assert.equal(changedProbability.result.forward.original_membership_fingerprint, calibratedHeld.result.forward.original_membership_fingerprint);
  assert.notDeepEqual(changedProbability.result.forward.baseline, calibratedHeld.result.forward.baseline);
  assert.deepEqual(await measurement(1), changedProbability);
  // Persisted late training evidence and future-recorded forward evidence are
  // evaluated through the same product path, not merely numerical fixtures.
  const lateTraining = { ...extraTraining[0].outcomes[0], created_at: input.windows.held_out.start_at };
  assert.equal((await readers.persistRecommendationOutcome(lateTraining, { supabaseClient: client, server: true })).status, "saved");
  const lateMeasurement = await measurement(1);
  assert.equal(lateMeasurement.result.training.original_population_count, 48);
  assert.equal(lateMeasurement.result.training.binary_fitting_sample_count, 47);
  assert.equal(lateMeasurement.result.training.late_label_count, 1);
  assert.equal(lateMeasurement.result.forward.original_membership_fingerprint, changedProbability.result.forward.original_membership_fingerprint);
  const futureForward = { ...unfavorableForward[0].outcomes[0], created_at: new Date(probabilityReadAt.getTime() + 1).toISOString() };
  assert.equal((await readers.persistRecommendationOutcome(futureForward, { supabaseClient: client, server: true })).status, "saved");
  const futureMeasurement = await measurement(1);
  assert.equal(futureMeasurement.restart.learning.partitions[1].canonical_outcome_count, 11);
  assert.equal(futureMeasurement.restart.learning.partitions[1].precision_delta, null);
  assert.equal(futureMeasurement.result.forward.original_population_count, 12);
  assert.equal(futureMeasurement.result.forward.missing_outcome_count, 1);
  assert.equal(futureMeasurement.result.forward.baseline, null);
  assert.deepEqual(futureMeasurement.result.model, lateMeasurement.result.model);
  assert.equal(futureMeasurement.result.forward.original_membership_fingerprint, changedProbability.result.forward.original_membership_fingerprint);
  const unrelatedRead = await readers.createRelativePlanProspectiveService().read(concurrentOwner, probabilityReadAt);
  assert.equal(unrelatedRead.learning.partitions[1].original_population_count, 0);
  assert.equal(unrelatedRead.learning.partitions[1].probability_measurement.forward.original_population_count, 0);
  const rpc = (role, name, body) => fetch(`${endpoint}/rpc/${name}`, { method: "POST", headers: {
    authorization: `Bearer ${tokenFor(role)}`, "content-type": "application/json" }, body: JSON.stringify(body) });
  for (const role of ["anon", "authenticated"]) {
    assert.equal((await rpc(role, "read_relative_plan_prospective_comparison_v1", {
      p_owner_user_id: owner, p_expected_contract_version: result.receipt.contract_version })).ok, false);
  }
  for (const role of ["anon", "authenticated", "service_role"]) {
    const dml = await fetch(`${endpoint}/relative_plan_prospective_comparisons`, { method: "DELETE",
      headers: { authorization: `Bearer ${tokenFor(role)}` } });
    assert.equal(dml.ok, false);
  }
  assert.throws(() => sql("update public.relative_plan_prospective_comparisons set plan_fingerprint = repeat('d',64)"), /Command failed/);
  const retroactivePlan = { ...result.receipt.plan, owner_user_id: "33333333-3333-4333-8333-333333333333",
    plan_fingerprint: "d".repeat(64), windows: { ...input.windows,
      training: { start_at: "2026-09-01T13:30:00.000Z", end_at: "2026-09-05T20:00:00.000Z" } } };
  const invalid = await rpc("service_role", "freeze_relative_plan_prospective_comparison_v1", {
    p_owner_user_id: retroactivePlan.owner_user_id, p_plan: retroactivePlan, p_expected_contract_version: result.receipt.contract_version });
  assert.equal((await invalid.json()).status, "unavailable");
  assert.equal(sql("select count(*) from public.relative_plan_prospective_comparisons"), "2");
  assert.equal(blockedExternalRequests, 0);
  console.log(JSON.stringify({ status: "pass", environment: "isolated_closed_synthetic_postgres_postgrest_sdk",
    actual_product_probability_consumer_verified: true,
    calibration_training_population: 48, held_out_probability_population: 12, walk_forward_probability_population: 12,
    calibration_model_fingerprint: calibratedHeld.result.model.model_fingerprint,
    held_out_brier: calibratedHeld.result.forward.baseline.brier_score,
    walk_forward_brier: calibratedWalk.result.forward.baseline.brier_score,
    prior_36_sample_incomplete_with_three_unknown_probabilities: true,
    missing_label_retained_in_12_original_population: true,
    later_forward_labels_never_fit_model: true,
    persisted_late_training_label_excluded: true, persisted_future_forward_recording_retained_as_missing: true,
    durable_freeze_count: 2, restarted_exact_readback: true, idempotent_repeats: 7, concurrent_single_owner_freeze: true, retroactive_rejected: true,
    actual_source_persistence_and_restarted_learner: true, retained_original_population: 4,
    missing_outcome_progression: [4, 1, 0], mixed_canonical_outcomes: 4, baseline_precision_at_3: held.baseline.precision_at_3,
    challenger_precision_at_3: held.challenger.precision_at_3, full_charter_decision: "evidence_incomplete",
    model_fingerprint: result.receipt.plan.model_fingerprint, charter_fingerprint: result.receipt.plan.charter_fingerprint,
    client_rpc_and_direct_mutation_denied: true, provider_requests: 0, production_changes: 0, broker_actions: 0,
    quality_improvement_verified: false }));
} finally {
  globalThis.fetch = originalFetch;
  for (const name of Object.keys(process.env)) if (!Object.hasOwn(originalEnvironment, name)) delete process.env[name];
  Object.assign(process.env, originalEnvironment);
  if (apiCreated) spawnSync("docker", ["rm", "-f", api], { stdio: "ignore" });
  if (dbCreated) spawnSync("docker", ["rm", "-f", db], { stdio: "ignore" });
  if (networkCreated) spawnSync("docker", ["network", "rm", network], { stdio: "ignore" });
  rmSync(directory, { recursive: true, force: true });
}
