// Prospective date/slot parameterisation of the existing integrated CLOSED
// prepared-first-scan harness. Product modules and assertions are unchanged.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = process.cwd();
const pin = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
assert.equal(execFileSync('git', ['diff', '--name-only', '--', 'app', 'lib', 'netlify/functions', 'supabase', 'package.json', 'package-lock.json'], { encoding: 'utf8' }).trim(), '', 'Product bytes must match the declared HEAD');
const harness = resolve(root, 'scripts/completed-input-runtime-proof.mjs');
const require = createRequire(harness);
let source = readFileSync(harness, 'utf8');
const replaceOne = (before, after) => {
  assert.equal(source.split(before).length, 2, before);
  source = source.replace(before, after);
};
// Only synthetic fixture dates change. Do not transform any compiled product
// module, original population, quality threshold or persisted real source.
source = source.replaceAll('2026-10-01', '2026-10-08').replaceAll('2026-09-30', '2026-10-07');
source = source.replaceAll('2026-10-08T14:30:20.000001Z', '2026-10-08T15:00:20.000001Z');
replaceOne('from "esbuild"', `from ${JSON.stringify(pathToFileURL(require.resolve('esbuild')).href)}`);
source = source.replaceAll('createRequire(import.meta.url)', `createRequire(${JSON.stringify(harness)})`);
replaceOne('TURE_OBSERVATION_SERIES_ENABLED: closingNormalOneShot ? "false" : "true"', 'TURE_OBSERVATION_SERIES_ENABLED: "false"');
replaceOne('TURE_NORMAL_SCAN_ONE_SHOT_ENABLED: closingNormalOneShot ? "true" : "false"', 'TURE_NORMAL_SCAN_ONE_SHOT_ENABLED: "true"');
replaceOne('Object.assign(process.env, environment);', `Object.assign(process.env, environment, {
  TURE_NORMAL_SCAN_ONE_SHOT_DATE: '2026-10-08',
  TURE_NORMAL_SCAN_ONE_SHOT_SLOT_UTC: '2026-10-08T15:00:00.000Z',
  TURE_GROW_MAX_LEARNING_MODE: 'true',
});`);
replaceOne('assert.equal(control.status, closingNormalOneShot ? "disabled" : "ready");', 'assert.equal(control.status, "disabled");');
const outcomeCondition = source.includes('if(nextSessionOutcomes || retainedBatchOneShot) {')
  ? 'nextSessionOutcomes || retainedBatchOneShot' : 'nextSessionOutcomes';
replaceOne(`if(${outcomeCondition}) {
    await build({ ...options, entryPoints: [resolve(root, "netlify/functions/scheduled-outcome-evaluation.ts")],`,
  `if(${outcomeCondition} || preparedFirstScan) {
    await build({ ...options, entryPoints: [resolve(root, "netlify/functions/scheduled-outcome-evaluation.ts")],`);
replaceOne(`...(${outcomeCondition} ? ["20260918233411_if4_after_market_outcome_evaluation_receipts.sql"] : []),`,
  `...(${outcomeCondition} || preparedFirstScan ? ["20260918233411_if4_after_market_outcome_evaluation_receipts.sql"] : []),`);
replaceOne('grant usage on schema public to service_role; grant all on all tables in schema public to service_role;',
  `grant usage on schema public to service_role; grant all on all tables in schema public to service_role;
    revoke all on public.scheduled_outcome_evaluation_attempts, public.recommendation_batches,
      public.recommendation_scan_runs, public.recommendation_snapshots, public.recommendation_outcomes,
      public.scanner_cache, public.scheduled_scan_attempts from public,anon,authenticated,service_role;
    grant select,insert,update on public.scheduled_outcome_evaluation_attempts to service_role;
    grant select,insert,update,delete on public.recommendation_batches,public.recommendation_scan_runs,
      public.recommendation_snapshots,public.recommendation_outcomes,public.scanner_cache,
      public.scheduled_scan_attempts to service_role;`);
replaceOne('const sourceSlot = "2026-10-08T14:30:00.000Z";', 'const sourceSlot = "2026-10-08T15:00:00.000Z";');
replaceOne('const followingSlot = "2026-10-08T14:45:00.000Z";', 'const followingSlot = "2026-10-08T15:15:00.000Z";');
replaceOne(`clock=OriginalDate.parse(followingSlot)+20000;
    const cleanup=await scheduler(new Request("http://closed-scheduler",{method:"POST",body:JSON.stringify({next_run:followingSlot})}),`,
  `clock=OriginalDate.parse(followingSlot)+20000;
    const cleanup=await scheduler(new Request("http://closed-scheduler",{method:"POST",body:JSON.stringify({next_run:new OriginalDate(OriginalDate.parse(followingSlot)+900000).toISOString()})}),`);
replaceOne(`    const owned=await restarted.readRecommendationLearningBaselineSource(owner);
    assert.equal(owned.data.recommendation_scan_runs.length,1);`,
  `    const sourceDigest=sql("select md5(string_agg(row_to_json(t)::text,'|' order by id)) from recommendation_snapshots t;");
    const runDigest=sql("select md5(string_agg(row_to_json(t)::text,'|' order by id)) from recommendation_scan_runs t;");
    const batchDigest=sql("select md5(string_agg(row_to_json(t)::text,'|' order by id)) from recommendation_batches t;");
    const paidHistoryDigest=sql("select md5(string_agg(row_to_json(t)::text,'|' order by claim_id)) from basic_free_discovery_credit_reservations t where execution_fingerprint like 'completed_session_history_preparation_v1|%';");
    assert.equal(Number(sql("select count(*) from recommendation_snapshots;")),8);
    process.env.TURE_NORMAL_SCAN_ONE_SHOT_ENABLED="false";
    process.env.TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED="true";
    process.env.TURE_OUTCOME_EVALUATION_ONE_SHOT_DATE="2026-10-08";
    process.env.TURE_OUTCOME_EVALUATION_SERIES_ENABLED="false";
    const outcomeScheduler=require(join(directory,"functions/scheduled-outcomes.cjs")).default;
    const outcomePhases=[];
    for(const target of ["2026-10-08T16:15:00.000Z","2026-10-08T16:30:00.000Z"]) {
      process.env.TURE_OUTCOME_EVALUATION_ONE_SHOT_SLOT_UTC=target;
      clock=OriginalDate.parse(target)+20000;
      const before=externalRequests;
      const eventNext=new OriginalDate(OriginalDate.parse(target)+900000).toISOString();
      const event=()=>new Request("http://closed-outcome-scheduler",{method:"POST",body:JSON.stringify({next_run:eventNext})});
      const result=await outcomeScheduler(event(),{deploy:{id:identity.deploy_id,context:"production",published:true}});
      const body=await result.json();
      assert.equal(result.status,200,JSON.stringify(body));
      assert.equal(body.persistence_status,"success",JSON.stringify(body));
      assert.equal(externalRequests-before,4,JSON.stringify(body));
      const unique60=Number(sql("select count(distinct snapshot_fingerprint) from recommendation_outcomes where horizon='60m';"));
      assert.equal(unique60,(outcomePhases.length+1)*4);
      const attempt=JSON.parse(sql(\`select row_to_json(t) from scheduled_outcome_evaluation_attempts t where scheduled_slot_at='\${target}';\`));
      assert.equal(attempt.status,"completed");assert(attempt.finalized_at);
      assert.equal(attempt.receipt_json.persistence.status,"success");
      assert.equal(attempt.receipt_json.failures.first_blocker,null);
      assert.equal(attempt.receipt_json.cost.provider_budget_limit,4);
      assert.equal(attempt.receipt_json.cost.candle_requests_executed,4);
      const after=externalRequests;
      const replay=await outcomeScheduler(event(),{deploy:{id:identity.deploy_id,context:"production",published:true}});
      assert.equal(replay.status,200);assert.equal(externalRequests,after,"Finalized slot retry cannot call the provider");
      outcomePhases.push({target_slot_utc:target,scheduled_next_run_utc:eventNext,provider_requests:4,
        cumulative_canonical_60m:unique60,completed_retry_requests:0,native_attempt_status:attempt.status,
        claim_and_persistence_terminal_success:true});
    }
    assert.equal(externalRequests,16);
    assert.equal(Number(sql("select count(*) from recommendation_outcomes;")),24);
    assert.equal(sql("select md5(string_agg(row_to_json(t)::text,'|' order by id)) from recommendation_snapshots t;"),sourceDigest);
    assert.equal(sql("select md5(string_agg(row_to_json(t)::text,'|' order by id)) from recommendation_scan_runs t;"),runDigest);
    assert.equal(sql("select md5(string_agg(row_to_json(t)::text,'|' order by id)) from recommendation_batches t;"),batchDigest);
    assert.equal(sql("select md5(string_agg(row_to_json(t)::text,'|' order by claim_id)) from basic_free_discovery_credit_reservations t where execution_fingerprint like 'completed_session_history_preparation_v1|%';"),paidHistoryDigest);
    const outcomeClaims=JSON.parse(sql("select jsonb_agg(t) from basic_free_discovery_credit_reservations t where requested_credits=4;"));
    assert.equal(outcomeClaims.length,2);assert(outcomeClaims.every(t=>t.status==="completed"&&t.provider_attempted&&t.finalized_at));
    assert.equal(Number(sql("select count(*) from scheduled_outcome_evaluation_attempts;")),2);
    clock=OriginalDate.parse("2026-10-08T16:45:20.000Z");
    const expired=await outcomeScheduler(new Request("http://closed-outcome-scheduler",{method:"POST",body:JSON.stringify({next_run:"2026-10-08T17:00:00.000Z"})}),
      {deploy:{id:identity.deploy_id,context:"production",published:true}});
    assert.equal(expired.status,204);assert.equal(externalRequests,16);
    process.env.TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED="false";
    const owned=await restarted.readRecommendationLearningBaselineSource(owner);
    assert.equal(owned.data.recommendation_scan_runs.length,1);
    assert.equal(owned.data.recommendation_outcomes.length,24);
    const wrongOutcomes=await restarted.readRecommendationLearningBaselineSource("00000000-0000-4000-8000-000000000002");
    assert.equal(wrongOutcomes.data.recommendation_outcomes.length,0);
    originalLog(JSON.stringify({oct8_outcome_evidence:true,original_population:8,canonical_60m_outcomes:8,
      label_rows:24,native_one_shot_phases:outcomePhases,unchanged_original_sources:true,
      restarted_owner_read:true,wrong_owner_empty:true,automatic_expiry:true,provider_requests:8,
      actual_provider_requests:0,production_actions:0,affected_table_privileges_matched:true}));`);
replaceOne('scenario:"first_owner_prepared_context_scan"', `scenario:"oct8_1700_normal_one_shot_positive",
      exact_scan_mode:"normal_one_shot", observation_series_enabled:false,
      source_date:"2026-10-08", target_slot_utc:"2026-10-08T15:00:00.000Z",
      acceptance_revision:${JSON.stringify(pin)},
      snapshot_count:Number(sql("select count(*) from recommendation_snapshots;")),
      snapshot_tickers:JSON.parse(sql("select coalesce(jsonb_agg(ticker),'[]') from recommendation_snapshots;")),
      backend_evaluation_reached:true, full_original_denominator:8`);
process.argv = [process.execPath, harness, '--cold', '--rotation-day', '--prospective-enrollment',
  '--full-original-history-setup', '--budgeted-history-setup', '--history-preparation-app',
  '--prepared-first-scan', '--production-claim-acl'];
try {
  await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
} catch (error) {
  console.error(JSON.stringify({ status: 'closed_proof_failed', name: error.name,
    message: String(error.message).slice(0, 1800) }));
  process.exitCode = 1;
}
