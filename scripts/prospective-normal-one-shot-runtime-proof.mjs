// Prospective date/slot parameterisation of the existing integrated CLOSED
// prepared-first-scan harness. Product modules and assertions are unchanged.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = process.cwd();
const boundedSeries = process.argv.includes('--bounded-original-series');
assert(process.argv.slice(2).every(value => value === '--bounded-original-series'), 'Only the declared CLOSED scenario is allowed');
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
if (boundedSeries) {
  // A distinct synthetic feasibility question, not an alternative Oct8 test
  // or a live card. Keep the original normal-one-shot scenario unchanged.
  replaceOne('TURE_OBSERVATION_SERIES_ENABLED: "false"', 'TURE_OBSERVATION_SERIES_ENABLED: "true"');
  replaceOne('TURE_NORMAL_SCAN_ONE_SHOT_ENABLED: "true"', 'TURE_NORMAL_SCAN_ONE_SHOT_ENABLED: "false"');
  replaceOne('TURE_OBSERVATION_SERIES_DATE: contract.trading_date,', 'TURE_OBSERVATION_SERIES_DATE: slot.slice(0,10),');
  replaceOne('assert.equal(control.status, "disabled");', 'assert.equal(control.status, "ready",JSON.stringify(control));');
  replaceOne('process.env.TURE_OBSERVATION_SERIES_STARTS_AT_UTC=sourceSlot;',
    'process.env.TURE_OBSERVATION_SERIES_START_SLOT_UTC=sourceSlot;');
  replaceOne('process.env.TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC=followingSlot;',
    'process.env.TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC="2026-10-08T17:00:00.000Z";');
  replaceOne('process.env.TURE_OBSERVATION_SERIES_MAX_ATTEMPTS="1";',
    'process.env.TURE_OBSERVATION_SERIES_MAX_ATTEMPTS="8";');
  replaceOne('process.env.TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS="8";',
    'process.env.TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS="64";');
  replaceOne('grant usage on schema public to service_role; grant all on all tables in schema public to service_role;',
    `grant usage on schema public to service_role; grant all on all tables in schema public to service_role;
    revoke all on public.relative_plan_prospective_comparisons,public.relative_plan_trained_probability_models,
      public.relative_plan_trained_probability_confirmations,public.relative_plan_charter_results
      from public,anon,authenticated,service_role;`);
  replaceOne('    const sourceDigest=sql(', `    const seriesScanEvidence=[{slot:sourceSlot,original_members:8,assessed_members:8,requests:8}];
    delete process.env.TURE_NORMAL_SCAN_ONE_SHOT_DATE;
    delete process.env.TURE_NORMAL_SCAN_ONE_SHOT_SLOT_UTC;
    for(let index=1;index<8;index++) {
      const target=new OriginalDate(OriginalDate.parse(sourceSlot)+index*900000).toISOString();
      const next=new OriginalDate(OriginalDate.parse(target)+900000).toISOString();
      clock=OriginalDate.parse(target)+20000;
      const before=externalRequests;
      const response=await scheduler(new Request("http://closed-scheduler",{method:"POST",body:JSON.stringify({next_run:next})}),
        {deploy:{id:identity.deploy_id,context:"production",published:true}});
      assert.equal(response.status,200,JSON.stringify(await response.clone().json()));
      assert.equal(externalRequests-before,8,"Every declared original set has its complete bounded input acquisition");
      assert.equal(Number(sql("select count(*) from recommendation_scan_runs;")),index+1);
      const stored=JSON.parse(sql("select row_to_json(t) from recommendation_scan_runs t order by observed_at desc,run_fingerprint desc limit 1;"));
      const record=restarted.candidateDecisionRecordFromScanRun(stored);
      assert(record && restarted.decisionLineageReceiptFromScanRun(stored,record));
      const assessed=restarted.buildRelativePlanContextShadow(record);
      assert.equal(record.candidates.length,8);assert.equal(assessed.assessed_count,8,JSON.stringify(assessed));
      assert.equal(record.candidates.filter(member=>member.data.freshness==="fresh").length,8);
      seriesScanEvidence.push({slot:target,original_members:8,assessed_members:8,requests:externalRequests-before});
      const after=externalRequests;
      const duplicate=await scheduler(new Request("http://closed-scheduler",{method:"POST",body:JSON.stringify({next_run:next})}),
        {deploy:{id:identity.deploy_id,context:"production",published:true}});
      assert.equal(duplicate.status,204,"The series suppresses a repeated observed slot before backend/provider work");
      assert.equal(externalRequests,after,"Completed native slot cannot repeat provider work");
    }
    assert.equal(externalRequests,64);assert.equal(externalBenchmarkRequests,0);
    assert.equal(Number(sql("select count(*) from recommendation_scan_runs;")),8);
    assert.equal(Number(sql("select count(*) from recommendation_snapshots;")),64);
    process.env.TURE_OBSERVATION_SERIES_ENABLED="false";
    originalLog(JSON.stringify({bounded_original_scan_series_evidence:true,slots:seriesScanEvidence,
      original_population:64,complete_assessed_members:64,synthetic_requests:64,actual_provider_requests:0}));
    const sourceDigest=sql(`);
  const begin = source.indexOf('} else if(preparedFirstScan) {');
  const end = source.indexOf('} else if(rotationDay) {', begin);
  assert(begin >= 0 && end > begin);
  let prepared = source.slice(begin, end);
  const partOne = (before, after) => {
    assert.equal(prepared.split(before).length, 2, before);
    prepared = prepared.replace(before, after);
  };
  partOne('assert.equal(Number(sql("select count(*) from recommendation_snapshots;")),8);',
    'assert.equal(Number(sql("select count(*) from recommendation_snapshots;")),64);');
  partOne('process.env.TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED="true";',
    'process.env.TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED="false";');
  partOne('process.env.TURE_OUTCOME_EVALUATION_SERIES_ENABLED="false";', `process.env.TURE_OUTCOME_EVALUATION_SERIES_ENABLED="true";
    process.env.TURE_OUTCOME_EVALUATION_SERIES_DATE="2026-10-08";
    process.env.TURE_OUTCOME_EVALUATION_SERIES_START_SLOT_UTC="2026-10-08T17:15:00.000Z";
    process.env.TURE_OUTCOME_EVALUATION_SERIES_EXPIRES_AT_UTC="2026-10-08T21:15:00.000Z";
    process.env.TURE_OUTCOME_EVALUATION_SERIES_MAX_ATTEMPTS="16";
    process.env.TURE_OUTCOME_EVALUATION_SERIES_MAX_PROVIDER_CREDITS="64";`);
  partOne('for(const target of ["2026-10-08T16:15:00.000Z","2026-10-08T16:30:00.000Z"]) {',
    'for(const target of Array.from({length:16},(_,index)=>new OriginalDate(OriginalDate.parse("2026-10-08T17:15:00.000Z")+index*900000).toISOString())) {');
  prepared = prepared.replaceAll('assert.equal(externalRequests,16);', 'assert.equal(externalRequests,128);')
    .replaceAll('assert.equal(owned.data.recommendation_scan_runs.length,1);', 'assert.equal(owned.data.recommendation_scan_runs.length,8);')
    .replaceAll('assert.equal(owned.data.recommendation_outcomes.length,24);', 'assert.equal(owned.data.recommendation_outcomes.length,192);')
    .replaceAll('assert.equal(Number(sql("select count(*) from scheduled_scan_attempts;")),1);',
      'assert.equal(Number(sql("select count(*) from scheduled_scan_attempts;")),8);');
  partOne('assert.equal(Number(sql("select count(*) from recommendation_outcomes;")),24);',
    'assert.equal(Number(sql("select count(*) from recommendation_outcomes;")),192);');
  partOne('assert.equal(outcomeClaims.length,2);', 'assert.equal(outcomeClaims.length,16);');
  partOne('assert.equal(Number(sql("select count(*) from scheduled_outcome_evaluation_attempts;")),2);',
    'assert.equal(Number(sql("select count(*) from scheduled_outcome_evaluation_attempts;")),16);');
  partOne('clock=OriginalDate.parse("2026-10-08T16:45:20.000Z");', 'clock=OriginalDate.parse("2026-10-08T21:15:20.000Z");');
  partOne('body:JSON.stringify({next_run:"2026-10-08T17:00:00.000Z"})', 'body:JSON.stringify({next_run:"2026-10-08T21:30:00.000Z"})');
  partOne('    const owned=await restarted.readRecommendationLearningBaselineSource(owner);',
    '    process.env.TURE_OUTCOME_EVALUATION_SERIES_ENABLED="false";\n    const owned=await restarted.readRecommendationLearningBaselineSource(owner);');
  partOne('    const wrongOutcomes=await restarted.readRecommendationLearningBaselineSource(', `    // Same existing controlled-clock charter fixture basis. These isolated
    // metadata are NOT an actual pre-forward production DB/model seal.
    for(const table of ["relative_plan_prospective_comparisons","relative_plan_trained_probability_models",
      "relative_plan_trained_probability_confirmations","relative_plan_charter_results"]) {
      assert.equal(sql("select relrowsecurity from pg_class where oid='public."+table+"'::regclass;"),"t");
      for(const role of ["anon","authenticated","service_role"])
        assert.equal(sql("select has_table_privilege('"+role+"','public."+table+"','SELECT,INSERT,UPDATE,DELETE');"),"f");
    }
    for(const signature of ["read_relative_plan_prospective_comparison_v1(uuid,text)",
      "read_relative_plan_trained_probability_model_v1(uuid,uuid,text)","read_relative_plan_charter_result_v1(uuid,uuid,text)"]) {
      assert.equal(sql("select has_function_privilege('service_role','public."+signature+"','EXECUTE');"),"t");
      for(const role of ["anon","authenticated"])
        assert.equal(sql("select has_function_privilege('"+role+"','public."+signature+"','EXECUTE');"),"f");
    }
    const frozenAt="2026-09-25T12:00:00.000Z";
    const plan=restarted.buildRelativePlanProspectivePlan({owner_user_id:owner,
      source_revision:{commit_ref:identity.commit_ref,build_identity:restarted.relativePlanCanonicalBuildIdentity,
        deploy_id:identity.deploy_id},windows:{
        training:{start_at:"2026-10-05T13:30:00.000Z",end_at:"2026-10-07T20:00:00.000Z"},
        held_out:{start_at:sourceSlot,end_at:"2026-10-08T20:00:00.000Z"},
        walk_forward:{start_at:"2026-10-12T15:00:00.000Z",end_at:"2026-10-16T20:00:00.000Z"},
      }},frozenAt);assert(plan);
    sql(\`insert into relative_plan_prospective_comparisons(id,owner_user_id,model_version,plan_fingerprint,plan_json,frozen_at)
      values('22222222-2222-4222-8222-222222222222','\${owner}','\${plan.model_version}','\${plan.plan_fingerprint}',
        '\${JSON.stringify(plan).replaceAll("'","''")}'::jsonb,'\${frozenAt}');\`);
    delete require.cache[require.resolve(join(generated,"reader.cjs"))];
    const charterReader=require(join(generated,"reader.cjs"));
    const asOf=new OriginalDate(clock+1000);
    const charter=await charterReader.createRelativePlanProspectiveService().read(owner,asOf);
    assert.equal(charter.status,"available",charter.blocker);
    const held=charter.learning.partitions.find(value=>value.partition==="held_out");
    assert.equal(held.enrolled_decision_count,8);assert.equal(held.original_population_count,64);
    assert.equal(held.canonical_outcome_count,64);assert.equal(held.missing_outcome_count,0);
    const measured=charter.learning.full_charter.partitions.find(value=>value.partition==="held_out");
    assert.equal(measured.operational.reliability.admitted_attempt_count,8);
    assert.equal(measured.operational.cost.reserved_provider_credits,64);
    assert.equal(charter.learning.full_charter.computed_disposition,"evidence_incomplete");
    assert.equal(charter.learning.trained_probability_model,null);
    assert.equal(charter.learning.terminal_quality_decision,null);
    assert.equal(charter.learning.quality_improvement_claimed,false);
    assert.equal((await charterReader.createRelativePlanProspectiveService().read("00000000-0000-4000-8000-000000000002",asOf)).learning,null);
    assert.equal(sql("select md5(string_agg(row_to_json(t)::text,'|' order by id)) from recommendation_snapshots t;"),sourceDigest);
    assert.equal(sql("select md5(string_agg(row_to_json(t)::text,'|' order by id)) from recommendation_scan_runs t;"),runDigest);
    assert.equal(externalRequests,128,"Charter readback cannot acquire data");
    assert.equal(syntheticRequestEvidence.length,225,"Include all97 prepared histories plus64 scan and64 outcome requests");
    const perMinute=new Map();
    for(const request of syntheticRequestEvidence) {
      const bucket=Math.floor(OriginalDate.parse(request.requested_at)/60000);
      perMinute.set(bucket,(perMinute.get(bucket)??0)+1);
    }
    const maxMinuteCredits=Math.max(...perMinute.values());
    assert.equal(maxMinuteCredits,8,"No acquisition/scan/outcome overlap may exceed unchanged Basic8/minute");
    assert.equal(Number(sql("select count(*) from basic_free_discovery_credit_reservations;")),121);
    assert.equal(Number(sql("select sum(requested_credits) from basic_free_discovery_credit_reservations;")),225);
    assert.equal(Number(sql("select count(*) from basic_free_discovery_credit_reservations where status <> 'completed' or not provider_attempted or finalized_at is null;")),0);
    originalLog(JSON.stringify({bounded_original_series_charter_evidence:true,
      evidence_scope:"synthetic_native_original_rows_and_SQL_SDK_charter_read_not_pre_forward_DB_seal",
      enrolled_original_decisions:8,original_population:64,canonical_60m_outcomes:64,missing_outcomes:0,
      operational_attempts:8,reserved_scan_credits:64,disposition:"evidence_incomplete",trained_model:null,
      terminal_quality_decision:null,quality_improvement_claimed:false,actual_provider_requests:0,
      charter_private_tables_direct_access_denied:true,service_only_read_RPCS:true,
      full_chain_synthetic_requests:225,max_minute_credits:maxMinuteCredits,
      terminal_finalized_claims:121,reserved_all_phase_credits:225}));
    const wrongOutcomes=await restarted.readRecommendationLearningBaselineSource(`);
  partOne('oct8_outcome_evidence:true,original_population:8,canonical_60m_outcomes:8,',
    'bounded_original_outcome_series_evidence:true,original_population:64,canonical_60m_outcomes:64,');
  partOne('label_rows:24,native_one_shot_phases:outcomePhases,', 'label_rows:192,native_series_slots:outcomePhases,');
  partOne('automatic_expiry:true,provider_requests:8,', 'automatic_expiry:true,provider_requests:64,');
  source = source.slice(0, begin) + prepared + source.slice(end);
  source = source.replace('scenario:"oct8_1700_normal_one_shot_positive"', 'scenario:"prospective_bounded_original_series_positive"')
    .replace('exact_scan_mode:"normal_one_shot", observation_series_enabled:false,',
      'exact_scan_mode:"bounded_observation_series", observation_series_enabled:true,')
    .replace('backend_evaluation_reached:true, full_original_denominator:8',
      'backend_evaluation_reached:true, full_original_denominator:64')
    .replaceAll('2026-10-08', '2026-10-09').replaceAll('2026-10-07', '2026-10-08');
}
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
