// CLOSED synthetic database/SDK proof. Past prospective plans below are
// explicitly isolated fixture setup, NOT backdated production acceptance.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build } from "esbuild";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd(), directory = mkdtempSync(join(tmpdir(), "ture-trained-probability-proof-"));
const db = `ture-trained-probability-db-${process.pid}`, api = `ture-trained-probability-api-${process.pid}`;
const network = `ture-trained-probability-net-${process.pid}`;
const docker = (...args) => execFileSync("docker", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const sql = query => execFileSync("docker", ["exec", "-i", db, "psql", "-h", "127.0.0.1", "-U", "postgres", "-d", "postgres",
  "-At", "-v", "ON_ERROR_STOP=1"], { input: query, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
const literal = value => `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
const originalFetch = globalThis.fetch, originalEnvironment = { ...process.env };
let dbCreated = false, apiCreated = false, networkCreated = false, blockedExternalRequests = 0;
try {
  await build({ bundle: true, platform: "node", format: "cjs", conditions: ["react-server"], alias: { "@": root },
    plugins: [{ name: "real-fixture-assertions", setup(builder) { builder.onResolve({ filter: /^@playwright\/test$/ }, () => ({
      path: resolve(root, "node_modules/@playwright/test/index.js"), external: true })); } }], logLevel: "silent",
    stdin: { resolveDir: root, contents: `
      export { prospectiveInput, prospectiveOwner } from './tests/fixtures/relative-plan-prospective';
      export { prospectiveSource } from './tests/fixtures/relative-plan-prospective-source';
      export { buildRelativePlanProspectivePlan, RELATIVE_PLAN_PROSPECTIVE_RECEIPT_VERSION } from './lib/server/relative-plan-prospective-comparison';
      export { buildRelativePlanTrainedProbabilityModel } from './lib/server/relative-plan-trained-probability-model';
      export { relativePlanTrainedProbabilityStore } from './lib/server/relative-plan-trained-probability-store';
      export { createRelativePlanTrainedProbabilityService } from './lib/server/relative-plan-trained-probability-service';
      export { createRelativePlanProspectiveService } from './lib/server/relative-plan-prospective-service';
      export { relativePlanProspectiveStore } from './lib/server/relative-plan-prospective-store';
      export { readRecommendationLearningBaselineSource } from './lib/server/application-data-access';
      export { parseRecommendationLearningBaselineSource } from './lib/recommendation-learning-baseline-source';
      export { getServerSupabaseClient } from './lib/supabase-server';
      export { getUsEquityMarketSession } from './lib/us-equity-market-calendar';
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
  const prematureOwner = "55555555-5555-4555-8555-555555555555", resumeOwner = "66666666-6666-4666-8666-666666666666";
  sql(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create role authenticator login noinherit password 'closed-proof-only';
    grant anon, authenticated, service_role to authenticator; grant usage on schema public to service_role;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$;
    insert into auth.users values('${owner}'),('${other}'),('${prematureOwner}'),('${resumeOwner}');`);
  for (const file of ["20260519000000_create_legacy_baseline_schema_draft.sql", "20260528000000_create_recommendation_snapshots.sql",
    "20260528001000_create_recommendation_outcomes.sql", "20260605000000_add_recommendation_outcomes_snapshot_horizon_unique_index.sql",
    "20260528002000_create_recommendation_scan_runs.sql", "20260528003000_create_recommendation_batches.sql",
    "20260614000000_create_execution_records.sql", "20260724001500_create_transactional_open_position_command.sql",
    "20260811163228_add_fail_closed_application_owner_foundation.sql"]) sql(readFileSync(resolve(root, "supabase/migrations", file), "utf8"));
  sql("grant all on all tables in schema public to service_role;");
  for (const file of ["20261002213547_if4_relative_plan_prospective_comparison.sql", "20261002233358_if4_relative_plan_trained_probability_model.sql", "20261003015239_if4_relative_plan_charter_result.sql"])
    sql(readFileSync(resolve(root, "supabase/migrations", file), "utf8"));
  const key = "closed-proof-jwt-only-0123456789012345678901234567890123456789";
  const encoded = value => Buffer.from(JSON.stringify(value)).toString("base64url");
  const tokenFor = role => { const body = `${encoded({ alg: "HS256", typ: "JWT" })}.${encoded({ role, exp: Math.floor(Date.now() / 1000) + 3600 })}`;
    return `${body}.${createHmac("sha256", key).update(body).digest("base64url")}`; };
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
  process.env.NEXT_PUBLIC_SUPABASE_URL = endpoint; process.env.SUPABASE_SERVICE_ROLE_KEY = tokenFor("service_role");
  for (const name of ["SUPABASE_SERVICE_ROLE", "SUPABASE_SERVICE_ROLE_SECRET"]) delete process.env[name];
  process.env.TURE_APPLICATION_OWNER_USER_ID = owner;
  const jobAt = new Date(), days = [], cursor = new Date(jobAt); cursor.setUTCHours(0, 0, 0, 0);
  // Completed prior trading dates only. The past frozen plan is deliberately
  // synthetic fixture setup by the isolated admin, never a production freeze.
  while (days.length < 3) { cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (readers.getUsEquityMarketSession(cursor.toISOString().slice(0, 10)).session_open) days.unshift(new Date(cursor)); }
  const nextSession = after => {
    const date = new Date(after); date.setUTCHours(0, 0, 0, 0);
    do { date.setUTCDate(date.getUTCDate() + 1); } while (!readers.getUsEquityMarketSession(date.toISOString().slice(0, 10)).session_open);
    return readers.getUsEquityMarketSession(date.toISOString().slice(0, 10));
  };
  const heldSession = nextSession(jobAt), walkSession = nextSession(heldSession.session_open);
  const windows = { training: { start_at: new Date(days[0].getTime() + 13.5 * 3600000).toISOString(),
    end_at: new Date(days[2].getTime() + 21 * 3600000).toISOString() },
    held_out: { start_at: heldSession.session_open, end_at: heldSession.session_close },
    walk_forward: { start_at: walkSession.session_open, end_at: walkSession.session_close } };
  const frozenAt = new Date(days[0].getTime() - 86400000).toISOString();
  const plan = readers.buildRelativePlanProspectivePlan({ ...readers.prospectiveInput, windows }, frozenAt); assert(plan);
  const freezeId = "22222222-2222-4222-8222-222222222222";
  sql(`insert into public.relative_plan_prospective_comparisons(id,owner_user_id,model_version,plan_fingerprint,plan_json,frozen_at)
    values('${freezeId}','${owner}','${plan.model_version}','${plan.plan_fingerprint}',${literal(plan)},'${frozenAt}');`);
  const freeze = (await readers.relativePlanProspectiveStore().read(owner)).receipt; assert(freeze);
  const { client } = readers.getServerSupabaseClient(); assert(client);
  const sources = [];
  for (const day of days) for (let n = 0; n < 4; n++) {
    const decisionAt = new Date(day.getTime() + 17 * 3600000 + n * 300000);
    const source = await readers.prospectiveSource({ now: decisionAt }); sources.push({ source, decisionAt });
    for (const run of source.scanRuns) assert.equal((await readers.persistRecommendationScanRun(run, { supabaseClient: client, server: true })).status, "saved");
    for (const snapshot of source.snapshots) assert.equal((await readers.persistRecommendationSnapshot(snapshot, { supabaseClient: client, server: true })).status, "saved");
    for (const outcome of source.outcomes) assert.equal((await readers.persistRecommendationOutcome(outcome, { supabaseClient: client, server: true })).status, "saved");
  }
  const readSource = async (sourceOwner = owner) => { const result = await readers.readRecommendationLearningBaselineSource(sourceOwner); assert.equal(result.status, "available");
    const source = readers.parseRecommendationLearningBaselineSource(result.data); assert(source); return source; };
  const request = { owner, freeze, source: await readSource(), now: new Date() };
  let model = readers.buildRelativePlanTrainedProbabilityModel(request).trained_model; assert(model);
  assert.equal(model.original_population_count, 48); assert.equal(model.model.sample_count, 48);
  assert.equal((await readers.relativePlanTrainedProbabilityStore().read(freeze, owner)).status, "not_found");
  const version = "relative_plan_trained_probability_receipt_v1";
  const firstTransaction = sql(`begin; set local role service_role;
    select public.materialize_relative_plan_trained_probability_model_v1('${owner}','${freezeId}',${literal(model)},'${version}')->>'status';
    select public.confirm_relative_plan_trained_probability_model_v1('${owner}','${freezeId}','${version}')->>'status'; rollback;`);
  assert(firstTransaction.includes("pending_confirmation")); assert(firstTransaction.includes("not_ready"));
  assert.equal(sql("select count(*) from public.relative_plan_trained_probability_models"), "0");
  const concurrent = await Promise.all(Array.from({ length: 6 }, () => readers.createRelativePlanTrainedProbabilityService().train(owner, {})));
  assert(concurrent.every(result => ["materialized", "already_materialized"].includes(result.status)),
    JSON.stringify(concurrent.map(result => ({ status: result.status, blocker: result.blocker, id: result.receipt?.materialization_id }))));
  assert.equal(concurrent.filter(result => result.status === "materialized").length, 1);
  assert.equal(new Set(concurrent.map(result => result.receipt.materialization_id)).size, 1);
  const sealed = concurrent.find(result => result.status === "materialized").receipt;
  model = sealed.trained_model;
  assert(Date.parse(sealed.committed_read_at) >= Date.parse(sealed.materialized_at));
  assert(Date.parse(sealed.committed_read_at) < Date.parse(windows.held_out.start_at));
  assert.deepEqual((await readers.relativePlanTrainedProbabilityStore().read(freeze, owner)).receipt, sealed);
  assert.deepEqual((await readers.createRelativePlanTrainedProbabilityService().read(owner)).receipt, sealed);
  assert.equal((await readers.relativePlanTrainedProbabilityStore().materialize(model, freeze, owner,
    new Date(Date.parse(windows.walk_forward.end_at) + 1))).status, "already_materialized");
  // Simulate an acknowledged-loss after a committed first write, before its
  // separate confirmation. This second owner is isolated synthetic setup.
  const resumeFreezeId = "66666666-6666-4666-8666-666666666667";
  const resumePlan = readers.buildRelativePlanProspectivePlan({ ...readers.prospectiveInput, owner_user_id: resumeOwner, windows }, frozenAt);
  assert(resumePlan);
  sql(`insert into public.relative_plan_prospective_comparisons(id,owner_user_id,model_version,plan_fingerprint,plan_json,frozen_at)
    values('${resumeFreezeId}','${resumeOwner}','${resumePlan.model_version}','${resumePlan.plan_fingerprint}',${literal(resumePlan)},'${frozenAt}');`);
  const resumeFreeze = (await readers.relativePlanProspectiveStore().read(resumeOwner)).receipt; assert(resumeFreeze);
  // The pending model retains this SECOND owner's actual persisted source,
  // not borrowed first-owner evidence with a substituted owner field.
  const resumeSources = [];
  process.env.TURE_APPLICATION_OWNER_USER_ID = resumeOwner;
  try {
    for (const day of days) for (let n = 0; n < 4; n++) {
      const decisionAt = new Date(day.getTime() + 17 * 3600000 + (n + 4) * 300000);
      const part = await readers.prospectiveSource({ now: decisionAt }); resumeSources.push({ decisionAt });
      for (const run of part.scanRuns) assert.equal((await readers.persistRecommendationScanRun(run, { supabaseClient: client, server: true })).status, "saved");
      for (const snapshot of part.snapshots) assert.equal((await readers.persistRecommendationSnapshot(snapshot, { supabaseClient: client, server: true })).status, "saved");
      for (const outcome of part.outcomes) assert.equal((await readers.persistRecommendationOutcome(outcome, { supabaseClient: client, server: true })).status, "saved");
    }
  } finally { process.env.TURE_APPLICATION_OWNER_USER_ID = owner; }
  const resumeModel = readers.buildRelativePlanTrainedProbabilityModel({ ...request, owner: resumeOwner, freeze: resumeFreeze,
    source: await readSource(resumeOwner), now: new Date() }).trained_model;
  assert(resumeModel);
  assert.equal(sql(`set role service_role; select public.materialize_relative_plan_trained_probability_model_v1(
    '${resumeOwner}','${resumeFreezeId}',${literal(resumeModel)},'${version}')->>'status';`), "SET\npending_confirmation");
  assert.equal((await readers.relativePlanTrainedProbabilityStore().read(resumeFreeze, resumeOwner)).status, "pending_confirmation");
  // Actual original-outcome UPSERTS can change mutable history, never a sealed model.
  for (const { decisionAt } of sources) {
    const losses = await readers.prospectiveSource({ now: decisionAt, allLosses: true });
    for (const outcome of losses.outcomes) assert.equal((await readers.persistRecommendationOutcome(outcome, { supabaseClient: client, server: true })).status, "saved");
  }
  process.env.TURE_APPLICATION_OWNER_USER_ID = resumeOwner;
  try {
    for (const { decisionAt } of resumeSources) {
      const losses = await readers.prospectiveSource({ now: decisionAt, allLosses: true });
      for (const outcome of losses.outcomes) assert.equal((await readers.persistRecommendationOutcome(outcome, { supabaseClient: client, server: true })).status, "saved");
    }
  } finally { process.env.TURE_APPLICATION_OWNER_USER_ID = owner; }
  assert.deepEqual((await readers.relativePlanTrainedProbabilityStore().read(freeze, owner)).receipt, sealed);
  const resumed = await readers.createRelativePlanTrainedProbabilityService().train(resumeOwner, {});
  assert.equal(resumed.status, "materialized"); assert.deepEqual(resumed.receipt.trained_model, resumeModel);
  assert.equal((await readers.createRelativePlanTrainedProbabilityService().train(owner, {})).status, "already_materialized");
  const changed = readers.buildRelativePlanTrainedProbabilityModel({ ...request, source: await readSource(), now: new Date() }).trained_model;
  assert(changed); assert.notEqual(changed.model_binding_fingerprint, model.model_binding_fingerprint);
  assert.equal((await readers.relativePlanTrainedProbabilityStore().materialize(changed, freeze, owner, new Date())).status, "conflicting");
  // Future times here are explicit CLOSED fixtures, never market evidence or
  // backdated jobs. Forward writes go through actual source writers and the
  // restarted production consumer must reuse the already committed model.
  const forwardSources = await Promise.all([heldSession, walkSession].flatMap(session => [0, 1, 2].map(n => {
    const at = new Date(session.session_open); at.setUTCHours(17, n * 5, 0, 0);
    return readers.prospectiveSource({ now: at });
  })));
  const pending = forwardSources[0].outcomes[0];
  for (const part of forwardSources) {
    for (const run of part.scanRuns) assert.equal((await readers.persistRecommendationScanRun(run, { supabaseClient: client, server: true })).status, "saved");
    for (const snapshot of part.snapshots) assert.equal((await readers.persistRecommendationSnapshot(snapshot, { supabaseClient: client, server: true })).status, "saved");
    for (const outcome of part.outcomes.filter(row => row.id !== pending.id)) assert.equal((await readers.persistRecommendationOutcome(outcome, { supabaseClient: client, server: true })).status, "saved");
  }
  const forwardReadAt = new Date(Date.parse(windows.walk_forward.end_at) + 3600000);
  const readForward = async () => {
    const result = await readers.createRelativePlanProspectiveService().read(owner, forwardReadAt);
    assert.equal(result.status, "available", result.blocker); assert.equal(result.learning.status, "evidence_incomplete");
    assert.equal(result.learning.terminal_quality_decision, null);
    assert.deepEqual(result.learning.trained_probability_model, sealed);
    assert(!result.learning.blockers.includes("durably_frozen_training_probability_model_required"));
    assert(result.learning.blockers.includes("full_charter_forward_scorecard_required"));
    assert(Object.values(result.learning.authority).every(value => value === false));
    for (const partition of result.learning.partitions.slice(1)) {
      assert.deepEqual(partition.probability_measurement.model, sealed.trained_model.model);
      assert.equal(partition.probability_measurement.training.model_materialization, "immutable_database_attested_pre_forward_training_capsule");
      assert.equal(partition.probability_measurement.forward.original_population_count, 12);
    }
    return result;
  };
  const missingForward = await readForward();
  assert.equal(missingForward.learning.partitions[1].probability_measurement.forward.missing_outcome_count, 1);
  assert.equal(missingForward.learning.partitions[1].probability_measurement.forward.baseline, null);
  assert.equal((await readers.persistRecommendationOutcome(pending, { supabaseClient: client, server: true })).status, "saved");
  const completeForward = await readForward();
  for (const partition of completeForward.learning.partitions.slice(1)) assert.equal(partition.probability_measurement.status, "measured");
  const originalMembership = completeForward.learning.partitions[1].probability_measurement.forward.original_membership_fingerprint;
  for (const part of forwardSources) {
    const at = new Date(part.snapshots[0].recommended_at);
    const losses = await readers.prospectiveSource({ now: at, allLosses: true });
    for (const outcome of losses.outcomes) assert.equal((await readers.persistRecommendationOutcome(outcome, { supabaseClient: client, server: true })).status, "saved");
  }
  const losingForward = await readForward();
  assert.equal(losingForward.learning.partitions[1].probability_measurement.forward.original_membership_fingerprint, originalMembership);
  assert.notDeepEqual(losingForward.learning.partitions[1].probability_measurement.forward.baseline,
    completeForward.learning.partitions[1].probability_measurement.forward.baseline);
  const rpc = (role, name, body) => fetch(`${endpoint}/rpc/${name}`, { method: "POST", headers: {
    authorization: `Bearer ${tokenFor(role)}`, "content-type": "application/json" }, body: JSON.stringify(body) });
  const readBody = { p_owner_user_id: other, p_prospective_freeze_id: freezeId, p_expected_contract_version: version };
  assert.equal((await (await rpc("service_role", "read_relative_plan_trained_probability_model_v1", readBody)).json()).status, "not_found");
  // These are synthetic fixture plans/caller clocks. The unchanged production
  // SQL must reject them against its ACTUAL database clock, not the fake clock.
  for (const [testOwner, testFreezeId, testWindows, fakeClock] of [
    [other, "33333333-3333-4333-8333-333333333334", { ...windows,
      held_out: { start_at: new Date(jobAt.getTime() - 3600000).toISOString(), end_at: new Date(jobAt.getTime() - 1800000).toISOString() } },
      new Date(jobAt.getTime() - 7200000)],
    [prematureOwner, "55555555-5555-4555-8555-555555555556", {
      training: { ...windows.training, end_at: new Date(jobAt.getTime() + 3600000).toISOString() },
      held_out: { start_at: new Date(jobAt.getTime() + 10800000).toISOString(), end_at: new Date(jobAt.getTime() + 14400000).toISOString() },
      walk_forward: { start_at: new Date(jobAt.getTime() + 21600000).toISOString(), end_at: new Date(jobAt.getTime() + 25200000).toISOString() } },
      new Date(jobAt.getTime() + 7200000)],
  ]) {
    const testPlan = readers.buildRelativePlanProspectivePlan({ ...readers.prospectiveInput, owner_user_id: testOwner,
      windows: testWindows }, frozenAt); assert(testPlan);
    const testFreeze = { contract_version: readers.RELATIVE_PLAN_PROSPECTIVE_RECEIPT_VERSION,
      freeze_id: testFreezeId, owner_user_id: testOwner, frozen_at: frozenAt, plan: testPlan };
    sql(`insert into public.relative_plan_prospective_comparisons(id,owner_user_id,model_version,plan_fingerprint,plan_json,frozen_at)
      values('${testFreezeId}','${testOwner}','${testPlan.model_version}','${testPlan.plan_fingerprint}',${literal(testPlan)},'${frozenAt}');`);
    const testModel = readers.buildRelativePlanTrainedProbabilityModel({ owner: testOwner, freeze: testFreeze,
      source: request.source, now: fakeClock }).trained_model; assert(testModel);
    assert.equal((await readers.relativePlanTrainedProbabilityStore().materialize(testModel, testFreeze, testOwner, fakeClock)).status, "not_ready");
  }
  for (const role of ["anon", "authenticated"]) for (const name of ["read", "confirm"])
    assert.equal((await rpc(role, `${name}_relative_plan_trained_probability_model_v1`, { ...readBody, p_owner_user_id: owner })).ok, false);
  for (const relation of ["relative_plan_trained_probability_models", "relative_plan_trained_probability_confirmations"]) {
    for (const role of ["anon", "authenticated", "service_role"]) assert.equal((await fetch(`${endpoint}/${relation}`, {
      method: "DELETE", headers: { authorization: `Bearer ${tokenFor(role)}` } })).ok, false);
    assert.throws(() => sql(`delete from public.${relation}`), /Command failed/);
  }
  assert.equal(sql("select count(*) from public.relative_plan_trained_probability_models"), "2");
  assert.equal(sql("select count(*) from public.relative_plan_trained_probability_confirmations"), "2");
  assert.equal(blockedExternalRequests, 0);
  console.log(JSON.stringify({ status: "pass", environment: "isolated_closed_synthetic_postgres_postgrest_sdk",
    past_prospective_plan_is_explicit_fixture_setup: true, original_training_members: 48, immutable_fitted_sample: 48,
    database_attested_seal_and_separate_committed_read: true, same_transaction_confirmation_rejected: true,
    concurrent_single_materialization: true, exact_restarted_model: true, later_mutable_outcome_upserts_do_not_refit: true,
    actual_server_owned_training_job_verified: true, lost_acknowledgement_resumes_original_capsule: true,
    actual_database_rejects_backdated_and_premature_jobs: true,
    owner_and_client_rpc_isolation: true, direct_mutation_denied: true, actual_forward_product_consumer_verified: true,
    forward_original_members_per_partition: 12, missing_forward_label_remains_unknown: true,
    later_forward_losses_change_errors_not_model: true,
    full_charter_decision: "evidence_incomplete", provider_requests: 0, production_changes: 0, broker_actions: 0,
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
