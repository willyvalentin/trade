// CLOSED disposable PostgreSQL/PostgREST/installed-SDK regression proof.
// No production credentials, provider, scan, scheduler or broker is used.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHmac, createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { build } from 'esbuild';

const root = process.cwd(), directory = mkdtempSync(join(tmpdir(),'ture-history-preflight-proof-'));
const db = `ture-history-preflight-db-${process.pid}`, api = `ture-history-preflight-api-${process.pid}`;
const network = `ture-history-preflight-net-${process.pid}`;
const docker = (...args) => execFileSync('docker',args,{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:30000}).trim();
const sql = query => execFileSync('docker',['exec','-i',db,'psql','-h','127.0.0.1','-U','postgres','-d','postgres','-At','-v','ON_ERROR_STOP=1'],
  {input:query,encoding:'utf8',stdio:['pipe','pipe','pipe'],timeout:30000}).trim();
const originalFetch = globalThis.fetch, originalEnvironment = {...process.env};
let dbCreated=false, apiCreated=false, networkCreated=false, externalRequests=0, endpoint;
let downgradeRpcVersion=false;
const rpcRequestPaths=[];
const owner = '11111111-1111-4111-8111-111111111111', other='33333333-3333-4333-8333-333333333333';
const date='2026-10-06', start='2026-10-06T13:45:00.000Z', end='2026-10-06T14:00:00.000Z';
const migrationPath='supabase/migrations/20261006090639_history_credit_preflight_compatibility.sql';
const migration=readFileSync(resolve(root,migrationPath),'utf8');
const oldAttributes=()=>sql(`select jsonb_agg(jsonb_build_object('name',proname,'oid',oid,'owner',proowner,
  'acl',proacl,'config',proconfig,'body_md5',md5(prosrc),'definer',prosecdef,'volatility',provolatile) order by proname)
  from pg_proc where pronamespace='public'::regnamespace and proname in
  ('read_basic_free_scheduled_scan_preflight_v2','read_basic_free_observation_series_preflight_v1');`);
const rowsDigest=()=>sql(`select md5(jsonb_build_object(
  'reservations',(select coalesce(jsonb_agg(row_to_json(t) order by claim_id),'[]'::jsonb)
    from public.basic_free_discovery_credit_reservations t),
  'attempts',(select coalesce(jsonb_agg(row_to_json(t) order by attempt_fingerprint),'[]'::jsonb)
    from public.scheduled_scan_attempts t))::text);`);
const oneSql=who=>JSON.parse(sql(`select row_to_json(t) from public.read_basic_free_scheduled_scan_preflight_v3('${who}','${date}','${start}') t;`));
const seriesSql=who=>JSON.parse(sql(`select row_to_json(t) from public.read_basic_free_observation_series_preflight_v2('${who}','${date}','${start}','${end}',1::smallint,8::smallint) t;`));
const control={control_version:'observation_series_control_v1',requested:true,status:'ready',series_id:'observation_series_1234567890abcdef',
  trading_date:date,starts_at_utc:start,expires_at_utc:end,max_attempts:1,max_provider_credits:8,stop_on_publication:true,
  max_consecutive_failures:3,reason_codes:['observation_series_ready'],
  authority:{arms_scheduler:false,calls_provider:false,reserves_provider_credits:false,changes_ranking:false,publishes_candidate:false,executes_broker_order:false}};
try {
  await build({bundle:true,platform:'node',format:'cjs',conditions:['react-server'],alias:{'@':root},logLevel:'silent',
    stdin:{resolveDir:root,contents:`
      export { buildBasicFreeDiscoveryCreditReservationClaimId } from './lib/basic-free-discovery-credit-reservation-store';
      export { basicFreeScheduledScanPreflightReadbackFromUnknown, evaluateBasicFreeScheduledScanPreflight } from './lib/basic-free-scheduled-scan-preflight-readback';
      export { observationSeriesActivationPreflightReadbackFromUnknown, evaluateObservationSeriesActivationDatabasePreflight } from './lib/observation-series-activation-preflight';
      export { readBasicFreeScheduledScanPreflight } from './lib/server/basic-free-scheduled-scan-preflight-readback';
      export { readObservationSeriesActivationPreflight } from './lib/server/observation-series-activation-preflight-readback';
      export { getServerSupabaseClient } from './lib/supabase-server';`},outfile:join(directory,'readers.cjs')});
  const readers=createRequire(import.meta.url)(join(directory,'readers.cjs'));
  const insert=(who,execution,credits=1,status='completed',catalog=false,bucket='2026-10-06T08:00:00Z')=>{
    assert(/^[a-f0-9-]{36}$/.test(who)); assert(/^[A-Za-z0-9|._:-]+$/.test(execution));
    const claim=readers.buildBasicFreeDiscoveryCreditReservationClaimId({trading_date:date,execution_fingerprint:execution});
    sql(`insert into public.basic_free_discovery_credit_reservations
      (claim_id,execution_fingerprint,owner_user_id,trading_date,minute_bucket,requested_credits,
       declared_daily_credit_budget,declared_per_minute_credit_budget,status,provider_attempted,finalized_at,catalog_observation)
      values('${claim}','${execution}','${who}','${date}','${bucket}',${credits},800,8,'${status}',true,
      ${['completed','failed'].includes(status)?"'2026-10-06T14:01:00Z'":'null'},${catalog});`);
  };
  const history=(who,ticker,options={})=>insert(who,`completed_session_history_preparation_v1|${who}|${date}|${ticker}`,
    1,options.status??'completed',false,options.bucket??'2026-10-06T08:00:00Z');
  docker('network','create',network); networkCreated=true;
  docker('run','--pull=missing','--rm','-d','--name',db,'--network',network,
    '-e','POSTGRES_PASSWORD=closed-proof-only','postgres:16-alpine'); dbCreated=true;
  for(let i=0;i<40;i++){try{sql('select 1');break;}catch{if(i===39)throw new Error('isolated_db_not_ready');await delay(250);}}
  sql(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create role authenticator login noinherit password 'closed-proof-only'; grant anon,authenticated,service_role to authenticator;
    grant usage on schema public to anon,authenticated,service_role;`);
  for(const file of ['20260625000000_create_scheduled_scan_attempts.sql','20260915222537_basic_free_discovery_credit_reservations.sql',
    '20260917135646_if2_basic_free_daily_observation_claim.sql','20260925171512_a2_multi_slot_scan_preflight.sql',
    '20260926163715_a2_observation_series_activation_preflight.sql']) sql(readFileSync(resolve(root,'supabase/migrations',file),'utf8'));
  for(const ticker of ['SPY','QQQ','SLB','NVO','BABA','IONQ','RIVN','ASML']) history(owner,ticker);
  history(other,'AAPL');
  const beforeRows=rowsDigest(), beforeAttributes=oldAttributes();
  const predecessor=JSON.parse(sql(`select row_to_json(t) from public.read_basic_free_observation_series_preflight_v1(
    '${owner}','${date}','${start}','${end}',1::smallint,8::smallint) t;`));
  assert.equal(predecessor.normal_scan_reservation_count,8); assert.equal(predecessor.normal_scan_reserved_credits,8);
  assert.equal(readers.observationSeriesActivationPreflightReadbackFromUnknown(predecessor,control).status,'unavailable');
  sql(migration);
  assert.equal(rowsDigest(),beforeRows); assert.equal(oldAttributes(),beforeAttributes);
  for(const row of [oneSql(owner),seriesSql(owner)]) {
    assert.equal(row.total_reservation_count,8); assert.equal(row.total_reserved_credits,8);
    assert.equal(row.normal_scan_reservation_count,0); assert.equal(row.completed_history_reservation_count,8);
    assert.equal(row.completed_history_reserved_credits,8); assert.equal(row.unclassified_reservation_count,0);
  }
  const acl=JSON.parse(sql(`select jsonb_agg(jsonb_build_object('name',proname,'owner',pg_get_userbyid(proowner),'stable',provolatile='s',
    'definer',prosecdef,'config',proconfig,'anon',has_function_privilege('anon',oid,'execute'),
    'authenticated',has_function_privilege('authenticated',oid,'execute'),'service',has_function_privilege('service_role',oid,'execute'),
    'public',coalesce((select bool_or(grantee=0 and privilege_type='EXECUTE') from aclexplode(proacl)),false)) order by proname)
    from pg_proc where pronamespace='public'::regnamespace and proname in
    ('read_basic_free_scheduled_scan_preflight_v3','read_basic_free_observation_series_preflight_v2');`));
  assert.equal(acl.length,2); for(const row of acl)assert.deepEqual({...row,name:undefined},
    {name:undefined,owner:'postgres',stable:true,definer:true,config:['search_path=""'],anon:false,authenticated:false,service:true,public:false});
  const jwtSecret='closed-proof-jwt-only-0123456789012345678901234567890123456789';
  const encoded=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
  const tokenFor=role=>{const data=`${encoded({alg:'HS256',typ:'JWT'})}.${encoded({role,exp:Math.floor(Date.now()/1000)+3600})}`;
    return `${data}.${createHmac('sha256',jwtSecret).update(data).digest('base64url')}`;};
  docker('run','--pull=missing','--rm','-d','--name',api,'--network',network,'-p','127.0.0.1::3000',
    '-e',`PGRST_DB_URI=postgresql://authenticator:closed-proof-only@${db}:5432/postgres`,'-e','PGRST_DB_SCHEMAS=public',
    '-e','PGRST_DB_ANON_ROLE=anon','-e',`PGRST_JWT_SECRET=${jwtSecret}`,
    'ghcr.io/postgrest/postgrest@sha256:5922bde07147b82b1c9d8f749e48c1e5b99ebb233f3888bb7ab65f07cf4ac82d'); apiCreated=true;
  const readEndpoint=()=>{
    const address=docker('port',api,'3000/tcp');
    assert(/^127\.0\.0\.1:\d+$/.test(address),'Only the isolated loopback API is permitted');
    return `http://${address}`;
  };
  endpoint=readEndpoint();
  globalThis.fetch=async(input,options)=>{const url=new URL(typeof input==='string'||input instanceof URL?input:input.url);
    if(url.origin!==endpoint){externalRequests++;throw new Error('external_request_forbidden');}
    url.pathname=url.pathname.replace(/^\/rest\/v1\//,'/');
    if(url.pathname.startsWith('/rpc/'))rpcRequestPaths.push(url.pathname);
    const response=await originalFetch(url,options);
    if(!downgradeRpcVersion||!response.ok||!url.pathname.startsWith('/rpc/'))return response;
    const rows=await response.json();
    for(const row of rows){
      row.preflight_version=url.pathname.endsWith('scheduled_scan_preflight_v3')
        ? 'basic_free_scheduled_scan_preflight_v2' : 'observation_series_activation_preflight_v1';
      for(const field of ['completed_history_reservation_count','completed_history_reserved_credits',
        'unclassified_reservation_count','unclassified_reserved_credits'])delete row[field];
    }
    return new Response(JSON.stringify(rows),{status:response.status,headers:response.headers});
  };
  const ready=async()=>{for(let i=0;i<40;i++){try{if((await fetch(endpoint)).ok)return;}catch{}await delay(250);}throw new Error('isolated_api_not_ready');};
  await ready();
  process.env.NEXT_PUBLIC_SUPABASE_URL=endpoint; process.env.SUPABASE_SERVICE_ROLE_KEY=tokenFor('service_role');
  delete process.env.SUPABASE_SERVICE_ROLE; delete process.env.SUPABASE_SERVICE_ROLE_SECRET;
  const check=async(who)=>{
    const one=await readers.readBasicFreeScheduledScanPreflight({owner_user_id:who,trading_date:date,target_slot_utc:start});
    const series=await readers.readObservationSeriesActivationPreflight({owner_user_id:who,control});
    assert.equal(one.status,'available'); assert.equal(series.status,'available');
    return {one:readers.evaluateBasicFreeScheduledScanPreflight(one),series:readers.evaluateObservationSeriesActivationDatabasePreflight(series)};
  };
  assert.equal((await check(owner)).one.status,'ready'); assert.equal((await check(owner)).series.status,'ready');
  assert.equal((await check(other)).one.readback.snapshot.completed_history_reservation_count,1);
  const empty='77777777-7777-4777-8777-777777777777';
  assert.equal((await check(empty)).one.status,'ready');assert.equal((await check(empty)).series.status,'ready');
  const beforeDowngradeRequests=rpcRequestPaths.length;
  downgradeRpcVersion=true;
  assert.equal((await readers.readBasicFreeScheduledScanPreflight({owner_user_id:empty,trading_date:date,target_slot_utc:start})).status,'unavailable');
  assert.equal((await readers.readObservationSeriesActivationPreflight({owner_user_id:empty,control})).status,'unavailable');
  downgradeRpcVersion=false;
  assert.deepEqual(rpcRequestPaths.slice(beforeDowngradeRequests),[
    '/rpc/read_basic_free_scheduled_scan_preflight_v3','/rpc/read_basic_free_observation_series_preflight_v2']);
  for(const role of ['anon','authenticated']) {
    process.env.SUPABASE_SERVICE_ROLE_KEY=tokenFor(role);
    assert.equal((await readers.readBasicFreeScheduledScanPreflight({owner_user_id:owner,trading_date:date,target_slot_utc:start})).status,'unavailable');
    assert.equal((await readers.readObservationSeriesActivationPreflight({owner_user_id:owner,control})).status,'unavailable');
  }
  process.env.SUPABASE_SERVICE_ROLE_KEY=tokenFor('service_role');
  const client=readers.getServerSupabaseClient().client; assert(client);
  assert((await client.from('basic_free_discovery_credit_reservations').select('claim_id')).error,'No direct table reader grant');
  assert.equal((await client.rpc('read_basic_free_scheduled_scan_preflight_v3',{p_owner_user_id:owner,p_trading_date:date,p_target_slot_utc:'2026-10-06T13:46:00Z'})).data.length,0);
  assert.equal((await client.rpc('read_basic_free_observation_series_preflight_v2',{p_owner_user_id:owner,p_trading_date:date,p_starts_at_utc:start,p_expires_at_utc:end,p_max_attempts:1,p_max_provider_credits:7})).data.length,0);
  assert.equal(rowsDigest(),beforeRows);
  // Distinct immutable fixture owners avoid changing/deleting the original
  // eight source claims when testing unknown, mixed, active and budget cases.
  const unknown='22222222-2222-4222-8222-222222222222';
  for(const execution of [`wrong_namespace|${unknown}|${date}|AAPL`,
    `completed_session_history_preparation_v1|${owner}|${date}|AAPL`,
    `completed_session_history_preparation_v1|${unknown}|2026-10-05|AAPL`,
    `completed_session_history_preparation_v1|${unknown}|${date}|lowercase`]) insert(unknown,execution);
  for(const row of [oneSql(unknown),seriesSql(unknown)])assert.equal(row.unclassified_reserved_credits,4);
  assert.equal((await readers.readBasicFreeScheduledScanPreflight({owner_user_id:unknown,trading_date:date,target_slot_utc:start})).status,'unavailable');
  assert.equal((await readers.readObservationSeriesActivationPreflight({owner_user_id:unknown,control})).status,'unavailable');
  insert(owner,'normal_fixture_terminal_scan',8,'failed'); insert(owner,'catalog_fixture',1,'completed',true);
  const mixed=await check(owner); assert.equal(mixed.one.status,'ready');
  assert.equal(mixed.one.readback.snapshot.total_reserved_credits,17);
  assert.equal(mixed.one.readback.snapshot.normal_scan_reserved_credits,8);
  assert.equal(mixed.one.readback.snapshot.completed_history_reserved_credits,8);
  const budget='44444444-4444-4444-8444-444444444444';
  for(let i=0;i<98;i++)insert(budget,`budget_scan_${i}`,8,'completed');
  for(const ticker of ['SPY','QQQ','SLB','NVO','BABA','IONQ','RIVN','ASML'])history(budget,ticker);
  insert(budget,'budget_catalog',1,'completed',true);
  const exhausted=await check(budget); assert.equal(exhausted.one.status,'blocked');assert.equal(exhausted.series.status,'blocked');
  assert(exhausted.one.reason_codes.includes('daily_basic_free_credit_capacity_unavailable'));
  assert(exhausted.series.reason_codes.includes('series_daily_credit_capacity_unavailable'));
  const active='55555555-5555-4555-8555-555555555555'; history(active,'SPY',{status:'attempted'});
  const activeResult=await check(active);for(const kind of [activeResult.one,activeResult.series]){
    assert.equal(kind.status,'blocked');assert(kind.reason_codes.includes('active_basic_free_reservation_exists'));}
  const overlap='66666666-6666-4666-8666-666666666666';history(overlap,'SPY',{bucket:start});
  const overlapResult=await check(overlap);assert(overlapResult.one.reason_codes.includes('target_slot_reservation_already_exists'));
  assert(overlapResult.series.reason_codes.includes('series_window_reservation_already_exists'));
  const retained=rowsDigest(); docker('restart',api);
  // Docker may assign a new ephemeral host port on restart. Read that exact
  // loopback mapping and give the real SDK the restarted API identity.
  endpoint=readEndpoint();process.env.NEXT_PUBLIC_SUPABASE_URL=endpoint;await ready();
  assert.equal((await check(owner)).one.status,'ready');assert.equal(rowsDigest(),retained);assert.equal(oldAttributes(),beforeAttributes);
  sql(`insert into public.scheduled_scan_attempts (attempt_fingerprint,trading_date,source,mode,outcome,payload_json)
    values ('closed_proof_unresolved','${date}','netlify_scheduled_function','scheduled','route_received',
      '{"scheduled_slot_started_at_utc":"${start}"}'),
      ('closed_proof_duplicate','${date}','netlify_scheduled_function','scheduled','completed',
      '{"scheduled_slot_started_at_utc":"${start}"}'),
      ('closed_proof_unattributed','${date}','netlify_scheduled_function','scheduled','completed','{}');`);
  const inherited=row=>Object.fromEntries(Object.entries(row).filter(([key])=>key!=='preflight_version'
    &&!key.startsWith('normal_scan_')&&!key.startsWith('catalog_observation_')
    &&!key.startsWith('completed_history_')&&!key.startsWith('unclassified_')));
  const oldOne=JSON.parse(sql(`select row_to_json(t) from public.read_basic_free_scheduled_scan_preflight_v2('${owner}','${date}','${start}') t;`));
  const oldSeries=JSON.parse(sql(`select row_to_json(t) from public.read_basic_free_observation_series_preflight_v1(
    '${owner}','${date}','${start}','${end}',1::smallint,8::smallint) t;`));
  assert.deepEqual(inherited(oneSql(owner)),inherited(oldOne));
  assert.deepEqual(inherited(seriesSql(owner)),inherited(oldSeries));
  const lineage=await check(owner);assert.equal(lineage.one.status,'blocked');assert.equal(lineage.series.status,'blocked');
  assert(lineage.one.reason_codes.includes('unresolved_scheduled_attempt_exists'));
  for(const reason of ['unresolved_scheduled_attempt_exists','unattributed_scheduled_attempt_exists',
    'series_window_attempt_already_exists','series_window_duplicate_attempt_exists'])assert(lineage.series.reason_codes.includes(reason));
  const retainedWithAttempts=rowsDigest();
  sql(`drop function public.read_basic_free_scheduled_scan_preflight_v3(uuid,date,timestamptz);
    drop function public.read_basic_free_observation_series_preflight_v2(uuid,date,timestamptz,timestamptz,smallint,smallint);`);
  assert.equal(oldAttributes(),beforeAttributes);assert.equal(rowsDigest(),retainedWithAttempts);
  sql(migration);assert.equal(oldAttributes(),beforeAttributes);assert.equal(rowsDigest(),retainedWithAttempts);
  console.log(JSON.stringify({status:'pass',environment:'isolated_postgres_postgrest_actual_sdk_http',
    migration_sha256:createHash('sha256').update(migration).digest('hex'),
    predecessor_misclassification_reproduced:true,eight_history_credits_remain_charged:true,
    strict_scan_and_catalog_costs_preserved:true,unknown_owner_date_namespace_symbols_rejected:true,
    mixed_failed_scan_charges_preserved:true,daily_800_active_target_window_guards_preserved:true,
    predecessor_bodies_oids_acls_preserved:true,existing_rows_preserved:true,
    empty_search_path_service_only_acl_verified:true,anonymous_authenticated_and_direct_table_denied:true,
    installed_sdk_and_restarted_http_readback_verified:true,local_additive_rollback_reapply_verified:true,
    server_adapters_reject_legacy_transport_without_rpc_fallback:true,
    exact_predecessor_facts_and_unresolved_duplicate_unattributed_attempt_guards_preserved:true,
    external_requests:externalRequests,production_provider_scan_activation_broker_actions:0}));
} finally {
  globalThis.fetch=originalFetch;
  for(const key of Object.keys(process.env))if(!(key in originalEnvironment))delete process.env[key];
  Object.assign(process.env,originalEnvironment);
  if(apiCreated)try{docker('rm','-f',api);}catch{}
  if(dbCreated)try{docker('rm','-f',db);}catch{}
  if(networkCreated)try{docker('network','rm',network);}catch{}
  rmSync(directory,{recursive:true,force:true});
}
