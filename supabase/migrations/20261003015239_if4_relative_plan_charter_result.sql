-- One complete immutable original forward evaluation per prospective freeze.
-- No ranking, publication, collection or execution privilege. Database clock
-- and original committed training capsule remain authoritative.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
create table public.relative_plan_charter_results (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  prospective_freeze_id uuid not null unique references public.relative_plan_prospective_comparisons(id) on delete restrict,
  training_materialization_id uuid not null references public.relative_plan_trained_probability_models(id) on delete restrict,
  result_fingerprint text not null check (result_fingerprint ~ '^[a-f0-9]{64}$'),
  result_json jsonb not null check (jsonb_typeof(result_json) = 'object' and octet_length(result_json::text) <= 8388608),
  finalized_at timestamptz not null,
  constraint relative_plan_result_owner_check check ((result_json->>'owner_user_id' = owner_user_id::text) is true),
  constraint relative_plan_result_freeze_check check ((result_json->>'prospective_freeze_id' = prospective_freeze_id::text) is true),
  constraint relative_plan_result_binding_check check ((result_json->>'result_fingerprint' = result_fingerprint) is true),
  constraint relative_plan_result_model_check check ((result_json#>>'{trained_model_receipt,materialization_id}' = training_materialization_id::text) is true)
);
create index relative_plan_charter_result_owner_index on public.relative_plan_charter_results(owner_user_id);
create index relative_plan_charter_result_model_index on public.relative_plan_charter_results(training_materialization_id);
alter table public.relative_plan_charter_results enable row level security;
revoke all on public.relative_plan_charter_results from public, anon, authenticated, service_role;
create function public.relative_plan_charter_result_immutable_v1() returns trigger
language plpgsql set search_path = '' as $$
begin raise exception 'relative_plan_original_charter_result_is_immutable'; end;
$$;
create trigger relative_plan_charter_result_immutable_v1 before update or delete
on public.relative_plan_charter_results for each row execute function public.relative_plan_charter_result_immutable_v1();
revoke all on function public.relative_plan_charter_result_immutable_v1() from public, anon, authenticated, service_role;

create function public.read_relative_plan_charter_result_v1(
  p_owner_user_id uuid, p_prospective_freeze_id uuid, p_expected_contract_version text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare stored public.relative_plan_charter_results%rowtype;
begin
  if p_owner_user_id is null or p_prospective_freeze_id is null or
    p_expected_contract_version is distinct from 'relative_plan_charter_result_receipt_v1' then
    return jsonb_build_object('status','unavailable','receipt',null);
  end if;
  select * into stored from public.relative_plan_charter_results
    where owner_user_id = p_owner_user_id and prospective_freeze_id = p_prospective_freeze_id;
  if not found then return jsonb_build_object('status','not_found','receipt',null); end if;
  return jsonb_build_object('status','available','receipt',jsonb_build_object(
    'contract_version',p_expected_contract_version,'result_id',stored.id,'owner_user_id',stored.owner_user_id,
    'finalized_at',stored.finalized_at,'result',stored.result_json));
end;
$$;
create function public.finalize_relative_plan_charter_result_v1(
  p_owner_user_id uuid, p_prospective_freeze_id uuid, p_result jsonb, p_expected_contract_version text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  comparison public.relative_plan_prospective_comparisons%rowtype;
  model_receipt jsonb; stored public.relative_plan_charter_results%rowtype;
  authoritative_time timestamptz; as_of timestamptz;
  part jsonb; expected_name text; n integer;
begin
  if p_owner_user_id is null or p_prospective_freeze_id is null or
    p_expected_contract_version is distinct from 'relative_plan_charter_result_receipt_v1' or
    jsonb_typeof(p_result) is distinct from 'object' or octet_length(p_result::text) > 8388608 then
    return jsonb_build_object('status','unavailable','receipt',null);
  end if;
  if (select count(*) from jsonb_object_keys(p_result)) <> 12 or not (p_result ?& array[
    'contract_version','owner_user_id','prospective_freeze_id','plan_fingerprint','charter_fingerprint','source_as_of',
    'retained_source','retained_runtime','trained_model_receipt','measurement','authority','result_fingerprint']) or
    p_result->>'contract_version' is distinct from 'relative_plan_charter_result_v1' or
    p_result->>'owner_user_id' is distinct from p_owner_user_id::text or
    p_result->>'prospective_freeze_id' is distinct from p_prospective_freeze_id::text or
    coalesce(p_result->>'result_fingerprint','') !~ '^[a-f0-9]{64}$' or
    coalesce(p_result->>'source_as_of','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[.][0-9]{3}Z$' or
    p_result->'authority' is distinct from '{"collection":false,"provider":false,"ranking":false,"publication":false,"promotion":false,"broker":false}'::jsonb or
    jsonb_typeof(p_result->'retained_source') is distinct from 'object' or
    jsonb_typeof(p_result->'retained_runtime') is distinct from 'object' or
    jsonb_typeof(p_result->'measurement') is distinct from 'object' then
    return jsonb_build_object('status','unavailable','receipt',null);
  end if;
  if (select count(*) from jsonb_object_keys(p_result->'retained_source')) <> 4 or
    p_result#>>'{retained_source,encoding}' is distinct from 'canonical_json_gzip_base64_v1' or
    coalesce(p_result#>>'{retained_source,source_fingerprint}','') !~ '^[a-f0-9]{64}$' or
    jsonb_typeof(p_result#>'{retained_source,payload}') is distinct from 'string' or
    jsonb_typeof(p_result#>'{retained_source,decoded_byte_length}') is distinct from 'number' or
    (p_result#>>'{retained_source,decoded_byte_length}')::numeric not between 1 and 8388608 then
    return jsonb_build_object('status','unavailable','receipt',null);
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('relative_plan_result_v1:' || p_prospective_freeze_id::text,0));
  select * into comparison from public.relative_plan_prospective_comparisons
    where id = p_prospective_freeze_id and owner_user_id = p_owner_user_id;
  if not found or p_result->>'plan_fingerprint' is distinct from comparison.plan_fingerprint or
    p_result->>'charter_fingerprint' is distinct from comparison.plan_json->>'charter_fingerprint' then
    return jsonb_build_object('status','unavailable','receipt',null);
  end if;
  model_receipt := public.read_relative_plan_trained_probability_model_v1(p_owner_user_id,p_prospective_freeze_id,
    'relative_plan_trained_probability_receipt_v1');
  -- JSON timestamp serialization may differ (Postgres offset versus JS UTC).
  -- Compare the clocks as timestamptz, never drop them from the binding.
  if model_receipt->>'status' is distinct from 'available' or
    ((model_receipt->'receipt') - 'materialized_at'::text - 'committed_read_at'::text) is distinct from
      ((p_result->'trained_model_receipt') - 'materialized_at'::text - 'committed_read_at'::text) or
    (model_receipt#>>'{receipt,materialized_at}')::timestamptz is distinct from
      (p_result#>>'{trained_model_receipt,materialized_at}')::timestamptz or
    (model_receipt#>>'{receipt,committed_read_at}')::timestamptz is distinct from
      (p_result#>>'{trained_model_receipt,committed_read_at}')::timestamptz then
    return jsonb_build_object('status','unavailable','receipt',null);
  end if;
  select * into stored from public.relative_plan_charter_results
    where prospective_freeze_id = p_prospective_freeze_id and owner_user_id = p_owner_user_id;
  if found then
    if stored.result_json is distinct from p_result then return jsonb_build_object('status','conflicting','receipt',null); end if;
    return public.read_relative_plan_charter_result_v1(p_owner_user_id,p_prospective_freeze_id,p_expected_contract_version)
      || jsonb_build_object('status','already_finalized');
  end if;
  authoritative_time := date_trunc('milliseconds',clock_timestamp());
  as_of := (p_result->>'source_as_of')::timestamptz;
  if as_of > authoritative_time or
    as_of < (comparison.plan_json#>>'{windows,held_out,end_at}')::timestamptz + interval '60 minutes' or
    as_of < (comparison.plan_json#>>'{windows,walk_forward,end_at}')::timestamptz + interval '60 minutes' then
    return jsonb_build_object('status','not_ready','receipt',null);
  end if;
  if p_result#>>'{measurement,contract_version}' is distinct from 'relative_plan_charter_evaluation_v1' or
    p_result#>>'{measurement,owner_user_id}' is distinct from p_owner_user_id::text or
    p_result#>>'{measurement,prospective_freeze_id}' is distinct from p_prospective_freeze_id::text or
    p_result#>>'{measurement,plan_fingerprint}' is distinct from comparison.plan_fingerprint or
    p_result#>>'{measurement,charter_fingerprint}' is distinct from p_result->>'charter_fingerprint' or
    p_result#>>'{measurement,model_binding_fingerprint}' is distinct from p_result#>>'{trained_model_receipt,trained_model,model_binding_fingerprint}' or
    p_result#>>'{measurement,read_as_of}' is distinct from p_result->>'source_as_of' or
    p_result#>'{measurement,authority}' is distinct from p_result->'authority' or
    p_result#>'{measurement,quality_improvement_claimed}' is distinct from 'false'::jsonb or
    p_result#>'{measurement,terminal_quality_decision}' is distinct from 'null'::jsonb or
    p_result#>>'{measurement,evidence_scope}' is distinct from 'read_only_reproduction_not_durable_terminal_result' or
    coalesce(p_result#>>'{measurement,computed_disposition}','') not in ('continue','narrow','reject','evidence_incomplete') or
    jsonb_typeof(p_result#>'{measurement,partitions}') is distinct from 'array' then
    return jsonb_build_object('status','unavailable','receipt',null);
  end if;
  if jsonb_array_length(p_result#>'{measurement,partitions}') <> 2 then return jsonb_build_object('status','unavailable','receipt',null); end if;
  for n in 0..1 loop
    expected_name := case when n=0 then 'held_out' else 'walk_forward' end;
    part := p_result#>'{measurement,partitions}'->n;
    if part->>'partition' is distinct from expected_name or
      part->'original_window' is distinct from comparison.plan_json#>array['windows',expected_name] then
      return jsonb_build_object('status','unavailable','receipt',null);
    end if;
  end loop;
  insert into public.relative_plan_charter_results(owner_user_id,prospective_freeze_id,training_materialization_id,
    result_fingerprint,result_json,finalized_at) values(p_owner_user_id,p_prospective_freeze_id,
      (p_result#>>'{trained_model_receipt,materialization_id}')::uuid,p_result->>'result_fingerprint',p_result,authoritative_time);
  return public.read_relative_plan_charter_result_v1(p_owner_user_id,p_prospective_freeze_id,p_expected_contract_version)
    || jsonb_build_object('status','finalized');
exception when invalid_datetime_format or datetime_field_overflow or invalid_text_representation or numeric_value_out_of_range then
  return jsonb_build_object('status','unavailable','receipt',null);
end;
$$;
revoke all on function public.read_relative_plan_charter_result_v1(uuid,uuid,text) from public,anon,authenticated;
revoke all on function public.finalize_relative_plan_charter_result_v1(uuid,uuid,jsonb,text) from public,anon,authenticated;
grant execute on function public.read_relative_plan_charter_result_v1(uuid,uuid,text) to service_role;
grant execute on function public.finalize_relative_plan_charter_result_v1(uuid,uuid,jsonb,text) to service_role;
notify pgrst,'reload schema';
commit;
