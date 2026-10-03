-- Immutable training capsule plus a separate-transaction committed read.
-- A write-statement clock is NOT a commit clock. Confirmation must observe
-- the already committed capsule before held-out begins; no backdating.
-- Service-only owner-bound measurement, never collection or execution.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

create table public.relative_plan_trained_probability_models (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  prospective_freeze_id uuid not null unique references public.relative_plan_prospective_comparisons(id) on delete restrict,
  plan_fingerprint text not null check (plan_fingerprint ~ '^[a-f0-9]{64}$'),
  model_binding_fingerprint text not null check (model_binding_fingerprint ~ '^[a-f0-9]{64}$'),
  trained_model_json jsonb not null check (jsonb_typeof(trained_model_json) = 'object' and
    octet_length(trained_model_json::text) <= 8388608),
  materialized_at timestamptz not null,
  materialization_txid bigint not null,
  constraint relative_plan_training_capsule_owner_check check ((trained_model_json->>'owner_user_id' = owner_user_id::text) is true),
  constraint relative_plan_training_capsule_freeze_check check ((trained_model_json->>'prospective_freeze_id' = prospective_freeze_id::text) is true),
  constraint relative_plan_training_capsule_plan_check check ((trained_model_json->>'plan_fingerprint' = plan_fingerprint) is true),
  constraint relative_plan_training_capsule_binding_check check ((trained_model_json->>'model_binding_fingerprint' = model_binding_fingerprint) is true)
);
create index relative_plan_training_capsule_owner_index on public.relative_plan_trained_probability_models(owner_user_id);
create table public.relative_plan_trained_probability_confirmations (
  materialization_id uuid primary key references public.relative_plan_trained_probability_models(id) on delete restrict,
  committed_read_at timestamptz not null
);
alter table public.relative_plan_trained_probability_models enable row level security;
alter table public.relative_plan_trained_probability_confirmations enable row level security;
revoke all on public.relative_plan_trained_probability_models from public, anon, authenticated, service_role;
revoke all on public.relative_plan_trained_probability_confirmations from public, anon, authenticated, service_role;
create function public.relative_plan_trained_probability_immutable_v1() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'relative_plan_trained_probability_evidence_is_immutable';
end;
$$;
create trigger relative_plan_training_capsule_immutable_v1 before update or delete
on public.relative_plan_trained_probability_models for each row execute function public.relative_plan_trained_probability_immutable_v1();
create trigger relative_plan_training_confirmation_immutable_v1 before update or delete
on public.relative_plan_trained_probability_confirmations for each row execute function public.relative_plan_trained_probability_immutable_v1();
revoke all on function public.relative_plan_trained_probability_immutable_v1() from public, anon, authenticated, service_role;

create function public.read_relative_plan_trained_probability_model_v1(
  p_owner_user_id uuid, p_prospective_freeze_id uuid, p_expected_contract_version text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  stored public.relative_plan_trained_probability_models%rowtype;
  confirmed_at timestamptz;
begin
  if p_owner_user_id is null or p_prospective_freeze_id is null or
    p_expected_contract_version is distinct from 'relative_plan_trained_probability_receipt_v1' then
    return jsonb_build_object('status', 'unavailable', 'receipt', null);
  end if;
  select * into stored from public.relative_plan_trained_probability_models
    where owner_user_id = p_owner_user_id and prospective_freeze_id = p_prospective_freeze_id;
  if not found then return jsonb_build_object('status', 'not_found', 'receipt', null); end if;
  select committed_read_at into confirmed_at from public.relative_plan_trained_probability_confirmations
    where materialization_id = stored.id;
  if not found then return jsonb_build_object('status', 'pending_confirmation', 'receipt', null); end if;
  return jsonb_build_object('status', 'available', 'receipt', jsonb_build_object(
    'contract_version', p_expected_contract_version, 'materialization_id', stored.id,
    'owner_user_id', stored.owner_user_id, 'materialized_at', stored.materialized_at,
    'committed_read_at', confirmed_at, 'trained_model', stored.trained_model_json));
end;
$$;

create function public.materialize_relative_plan_trained_probability_model_v1(
  p_owner_user_id uuid, p_prospective_freeze_id uuid, p_trained_model jsonb, p_expected_contract_version text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  comparison public.relative_plan_prospective_comparisons%rowtype;
  stored public.relative_plan_trained_probability_models%rowtype;
  authoritative_time timestamptz;
  training_start timestamptz; training_end timestamptz; cutoff timestamptz;
  row_data jsonb; decided timestamptz; evaluated timestamptz; recorded timestamptz;
  total_count integer; binary_count integer; non_binary_count integer; missing_count integer;
begin
  if p_owner_user_id is null or p_prospective_freeze_id is null or
    p_expected_contract_version is distinct from 'relative_plan_trained_probability_receipt_v1' or
    jsonb_typeof(p_trained_model) is distinct from 'object' or octet_length(p_trained_model::text) > 8388608 or
    p_trained_model->>'contract_version' is distinct from 'relative_plan_trained_probability_model_v1' or
    p_trained_model->>'owner_user_id' is distinct from p_owner_user_id::text or
    p_trained_model->>'prospective_freeze_id' is distinct from p_prospective_freeze_id::text or
    p_trained_model->>'fitting_boundary_semantics' is distinct from 'declared_data_cutoff_not_training_job_execution_time' or
    p_trained_model->'authority' is distinct from '{"collection":false,"provider":false,"ranking":false,"publication":false,"promotion":false,"broker":false}'::jsonb or
    jsonb_typeof(p_trained_model->'original_training_receipts') is distinct from 'array' or
    jsonb_typeof(p_trained_model->'model') is distinct from 'object' then
    return jsonb_build_object('status', 'unavailable', 'receipt', null);
  end if;
  if jsonb_typeof(p_trained_model->'retained_training_source') is distinct from 'object' then
    return jsonb_build_object('status', 'unavailable', 'receipt', null);
  end if;
  if (select count(*) from jsonb_object_keys(p_trained_model)) <> 19 or
    not (p_trained_model ?& array['contract_version','owner_user_id','prospective_freeze_id','plan_fingerprint','training_window',
      'forward_cutoff','fitting_boundary_semantics','training_source_as_of','retained_training_source','model','original_training_receipts','original_training_membership_fingerprint',
      'fitting_input_fingerprint','original_population_count','canonical_outcome_count','missing_outcome_count',
      'non_binary_outcome_count','model_binding_fingerprint','authority']) or
    (select count(*) from jsonb_object_keys(p_trained_model->'retained_training_source')) <> 3 or
    jsonb_typeof(p_trained_model#>'{retained_training_source,scanRuns}') is distinct from 'array' or
    jsonb_typeof(p_trained_model#>'{retained_training_source,snapshots}') is distinct from 'array' or
    jsonb_typeof(p_trained_model#>'{retained_training_source,outcomes}') is distinct from 'array' or
    coalesce(p_trained_model->>'training_source_as_of', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[.][0-9]{3}Z$' or
    exists (select 1 from (values ('plan_fingerprint'),('model_binding_fingerprint'),('original_training_membership_fingerprint'),
      ('fitting_input_fingerprint')) as field(name) where coalesce(p_trained_model->>field.name, '') !~ '^[a-f0-9]{64}$') or
    p_trained_model#>>'{model,contract_version}' is distinct from 'scanner_score_probability_calibration_model_v1' or
    p_trained_model#>>'{model,policy_version}' is distinct from 'fixed_score_bucket_beta_binomial_v1' or
    p_trained_model#>'{model,minimum_sample}' is distinct from '30'::jsonb or
    p_trained_model#>'{model,minimum_bucket_sample}' is distinct from '10'::jsonb or
    p_trained_model#>'{model,live_ranking_effect}' is distinct from 'false'::jsonb or
    p_trained_model#>'{model,publication_effect}' is distinct from 'false'::jsonb or
    p_trained_model#>'{model,provider_effect}' is distinct from 'false'::jsonb or
    p_trained_model#>'{model,broker_effect}' is distinct from 'false'::jsonb then
    return jsonb_build_object('status', 'unavailable', 'receipt', null);
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('relative_plan_training_v1:' || p_prospective_freeze_id::text, 0));
  select * into comparison from public.relative_plan_prospective_comparisons
    where id = p_prospective_freeze_id and owner_user_id = p_owner_user_id;
  if not found or p_trained_model->>'plan_fingerprint' is distinct from comparison.plan_fingerprint or
    p_trained_model->'training_window' is distinct from comparison.plan_json#>'{windows,training}' or
    p_trained_model->>'forward_cutoff' is distinct from comparison.plan_json#>>'{windows,held_out,start_at}' or
    p_trained_model#>>'{model,fitted_at}' is distinct from p_trained_model->>'forward_cutoff' or
    p_trained_model#>>'{model,training_window,start_at}' is distinct from comparison.plan_json#>>'{windows,training,start_at}' or
    p_trained_model#>>'{model,training_window,end_at}' is distinct from p_trained_model->>'forward_cutoff' then
    return jsonb_build_object('status', 'unavailable', 'receipt', null);
  end if;
  select * into stored from public.relative_plan_trained_probability_models
    where prospective_freeze_id = p_prospective_freeze_id and owner_user_id = p_owner_user_id;
  if found then
    if stored.trained_model_json is distinct from p_trained_model then
      return jsonb_build_object('status', 'conflicting', 'receipt', null);
    end if;
    if exists (select 1 from public.relative_plan_trained_probability_confirmations where materialization_id = stored.id) then
      return public.read_relative_plan_trained_probability_model_v1(p_owner_user_id, p_prospective_freeze_id, p_expected_contract_version)
        || jsonb_build_object('status', 'already_materialized');
    end if;
    return jsonb_build_object('status', 'pending_confirmation', 'receipt', null);
  end if;
  authoritative_time := date_trunc('milliseconds', clock_timestamp());
  training_start := (comparison.plan_json#>>'{windows,training,start_at}')::timestamptz;
  training_end := (comparison.plan_json#>>'{windows,training,end_at}')::timestamptz;
  cutoff := (comparison.plan_json#>>'{windows,held_out,start_at}')::timestamptz;
  if authoritative_time < training_end + interval '60 minutes' or authoritative_time >= cutoff or
    (p_trained_model->>'training_source_as_of')::timestamptz < training_end + interval '60 minutes' or
    (p_trained_model->>'training_source_as_of')::timestamptz > authoritative_time then
    return jsonb_build_object('status', 'not_ready', 'receipt', null);
  end if;
  total_count := jsonb_array_length(p_trained_model->'original_training_receipts');
  binary_count := 0; non_binary_count := 0; missing_count := 0;
  if total_count < 30 or total_count <> (select count(distinct row->>'candidate_id')
    from jsonb_array_elements(p_trained_model->'original_training_receipts') as rows(row)) then
    return jsonb_build_object('status', 'unavailable', 'receipt', null);
  end if;
  for row_data in select value from jsonb_array_elements(p_trained_model->'original_training_receipts') loop
    if jsonb_typeof(row_data) is distinct from 'object' then
      return jsonb_build_object('status', 'unavailable', 'receipt', null);
    end if;
    if (select count(*) from jsonb_object_keys(row_data)) <> 14 or
      not (row_data ?& array['run_fingerprint','decision_at','candidate_id','ticker','baseline_score','candidate_score',
        'snapshot_fingerprint','outcome_id','evaluated_at','recorded_at','terminal_outcome','binary_label','outcome_reason','resolution']) or
      coalesce(row_data->>'decision_at', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[.][0-9]{3}Z$' or
      coalesce(row_data->>'candidate_id', '') = '' or coalesce(row_data->>'run_fingerprint', '') = '' or
      coalesce(row_data->>'ticker', '') = '' or jsonb_typeof(row_data->'baseline_score') is distinct from 'number' or
      jsonb_typeof(row_data->'candidate_score') is distinct from 'number' then
      return jsonb_build_object('status', 'unavailable', 'receipt', null);
    end if;
    decided := (row_data->>'decision_at')::timestamptz;
    if decided < training_start or decided >= training_end or (row_data->>'baseline_score')::numeric not between 0 and 100 or
      (row_data->>'candidate_score')::numeric not between 0 and 100 then
      return jsonb_build_object('status', 'unavailable', 'receipt', null);
    end if;
    if row_data->>'resolution' = 'missing_or_conflicting' then
      if row_data->'binary_label' is distinct from 'null'::jsonb or row_data->'terminal_outcome' is distinct from 'null'::jsonb or
        row_data->>'outcome_reason' is distinct from 'canonical_label_unavailable_at_training_job' then
        return jsonb_build_object('status', 'unavailable', 'receipt', null);
      end if;
      missing_count := missing_count + 1;
    else
      if coalesce(row_data->>'snapshot_fingerprint', '') = '' or coalesce(row_data->>'outcome_id', '') = '' or
        coalesce(row_data->>'evaluated_at', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[.][0-9]{3}Z$' or
        coalesce(row_data->>'recorded_at', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[.][0-9]{3}Z$' then
        return jsonb_build_object('status', 'unavailable', 'receipt', null);
      end if;
      evaluated := (row_data->>'evaluated_at')::timestamptz; recorded := (row_data->>'recorded_at')::timestamptz;
      if evaluated < decided + interval '60 minutes' or recorded < evaluated or recorded > authoritative_time or
        evaluated > authoritative_time or recorded >= cutoff or evaluated >= cutoff then
        return jsonb_build_object('status', 'unavailable', 'receipt', null);
      end if;
      if row_data->>'resolution' = 'binary' then
        if ((row_data->'binary_label' = '1'::jsonb and row_data->>'terminal_outcome' = 'target_before_stop') or
          (row_data->'binary_label' = '0'::jsonb and row_data->>'terminal_outcome' = 'stop_before_target')) is not true then
          return jsonb_build_object('status', 'unavailable', 'receipt', null);
        end if;
        binary_count := binary_count + 1;
      elsif row_data->>'resolution' = 'non_binary' and row_data->'binary_label' = 'null'::jsonb and
        row_data->>'terminal_outcome' in ('no_entry','neither') then non_binary_count := non_binary_count + 1;
      else return jsonb_build_object('status', 'unavailable', 'receipt', null);
      end if;
    end if;
  end loop;
  if p_trained_model->'original_population_count' is distinct from to_jsonb(total_count) or
    p_trained_model->'canonical_outcome_count' is distinct from to_jsonb(binary_count + non_binary_count) or
    p_trained_model->'missing_outcome_count' is distinct from to_jsonb(missing_count) or
    p_trained_model->'non_binary_outcome_count' is distinct from to_jsonb(non_binary_count) or
    p_trained_model#>'{model,sample_count}' is distinct from to_jsonb(binary_count) or binary_count < 30 or
    (select count(distinct row->>'ticker') from jsonb_array_elements(p_trained_model->'original_training_receipts') as rows(row)
      where row->>'resolution' = 'binary') < 3 or
    (select count(distinct left(row->>'decision_at', 10)) from jsonb_array_elements(p_trained_model->'original_training_receipts') as rows(row)
      where row->>'resolution' = 'binary') < 3 then
    return jsonb_build_object('status', 'unavailable', 'receipt', null);
  end if;
  insert into public.relative_plan_trained_probability_models(owner_user_id, prospective_freeze_id, plan_fingerprint,
    model_binding_fingerprint, trained_model_json, materialized_at, materialization_txid)
    values (p_owner_user_id, p_prospective_freeze_id, comparison.plan_fingerprint, p_trained_model->>'model_binding_fingerprint',
      p_trained_model, authoritative_time, txid_current());
  return jsonb_build_object('status', 'pending_confirmation', 'receipt', null);
exception when invalid_datetime_format or datetime_field_overflow or invalid_text_representation or numeric_value_out_of_range then
  return jsonb_build_object('status', 'unavailable', 'receipt', null);
end;
$$;

create function public.confirm_relative_plan_trained_probability_model_v1(
  p_owner_user_id uuid, p_prospective_freeze_id uuid, p_expected_contract_version text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  stored public.relative_plan_trained_probability_models%rowtype;
  authoritative_time timestamptz;
begin
  if p_owner_user_id is null or p_prospective_freeze_id is null or
    p_expected_contract_version is distinct from 'relative_plan_trained_probability_receipt_v1' then
    return jsonb_build_object('status', 'unavailable', 'receipt', null);
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('relative_plan_training_v1:' || p_prospective_freeze_id::text, 0));
  select * into stored from public.relative_plan_trained_probability_models
    where owner_user_id = p_owner_user_id and prospective_freeze_id = p_prospective_freeze_id;
  if not found then return jsonb_build_object('status', 'not_found', 'receipt', null); end if;
  if exists (select 1 from public.relative_plan_trained_probability_confirmations where materialization_id = stored.id) then
    return public.read_relative_plan_trained_probability_model_v1(p_owner_user_id, p_prospective_freeze_id, p_expected_contract_version)
      || jsonb_build_object('status', 'already_materialized');
  end if;
  authoritative_time := date_trunc('milliseconds', clock_timestamp());
  if stored.materialization_txid = txid_current() or authoritative_time < stored.materialized_at or
    authoritative_time >= (stored.trained_model_json->>'forward_cutoff')::timestamptz then
    return jsonb_build_object('status', 'not_ready', 'receipt', null);
  end if;
  insert into public.relative_plan_trained_probability_confirmations(materialization_id, committed_read_at)
    values (stored.id, authoritative_time);
  return public.read_relative_plan_trained_probability_model_v1(p_owner_user_id, p_prospective_freeze_id, p_expected_contract_version)
    || jsonb_build_object('status', 'materialized');
end;
$$;
revoke all on function public.read_relative_plan_trained_probability_model_v1(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.materialize_relative_plan_trained_probability_model_v1(uuid, uuid, jsonb, text) from public, anon, authenticated;
revoke all on function public.confirm_relative_plan_trained_probability_model_v1(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.read_relative_plan_trained_probability_model_v1(uuid, uuid, text) to service_role;
grant execute on function public.materialize_relative_plan_trained_probability_model_v1(uuid, uuid, jsonb, text) to service_role;
grant execute on function public.confirm_relative_plan_trained_probability_model_v1(uuid, uuid, text) to service_role;
notify pgrst, 'reload schema';
commit;
