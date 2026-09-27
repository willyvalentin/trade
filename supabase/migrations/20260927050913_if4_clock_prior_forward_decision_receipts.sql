-- IF-4: retain the predeclared clock-prior held-out/walk-forward plan and its
-- one terminal advisory decision as immutable, owner-bound evidence. The
-- receipts cannot fetch provider data, alter ranking/publication, promote a
-- policy or execute a broker action.
begin;

create table public.scanner_clock_prior_shadow_forward_decision_plans (
  id uuid primary key default gen_random_uuid(),
  receipt_contract_version text not null,
  plan_fingerprint text not null unique,
  owner_user_id uuid not null,
  segment_key text not null,
  evaluation_charter_id uuid not null references public.recommendation_evaluation_charters(id),
  evaluation_charter_fingerprint text not null,
  baseline_id uuid not null references public.recommendation_learning_baseline_freezes(id),
  baseline_fingerprint text not null,
  baseline_ranking_version text not null,
  candidate_ranking_version text not null,
  plan_json jsonb not null,
  recorded_at timestamptz not null default now(),
  constraint scanner_clock_prior_forward_plan_receipt_contract_check
    check (receipt_contract_version = 'scanner_clock_prior_shadow_forward_decision_receipt_v1'),
  constraint scanner_clock_prior_forward_plan_fingerprint_check
    check (plan_fingerprint ~ '^[a-f0-9]{64}$'),
  constraint scanner_clock_prior_forward_plan_charter_fingerprint_check
    check (evaluation_charter_fingerprint ~ '^[a-f0-9]{64}$'),
  constraint scanner_clock_prior_forward_plan_baseline_fingerprint_check
    check (baseline_fingerprint ~ '^[a-f0-9]{64}$'),
  constraint scanner_clock_prior_forward_plan_segment_check
    check (length(segment_key) between 1 and 16384),
  constraint scanner_clock_prior_forward_plan_versions_check
    check (
      length(baseline_ranking_version) between 1 and 512
      and length(candidate_ranking_version) between 1 and 512
      and baseline_ranking_version <> candidate_ranking_version
    ),
  constraint scanner_clock_prior_forward_plan_json_check
    check (
      jsonb_typeof(plan_json) = 'object'
      and pg_column_size(plan_json) <= 262144
      and plan_json->>'contract_version' = 'scanner_clock_prior_shadow_forward_decision_plan_v1'
      and plan_json->>'plan_fingerprint' = plan_fingerprint
      and plan_json->>'owner_user_id' = owner_user_id::text
      and plan_json->>'segment_key' = segment_key
      and plan_json->>'evaluation_charter_id' = evaluation_charter_id::text
      and plan_json->>'evaluation_charter_fingerprint' = evaluation_charter_fingerprint
      and plan_json->>'baseline_id' = baseline_id::text
      and plan_json->>'baseline_fingerprint' = baseline_fingerprint
      and plan_json->>'baseline_ranking_version' = baseline_ranking_version
      and plan_json->>'candidate_ranking_version' = candidate_ranking_version
    ),
  constraint scanner_clock_prior_forward_plan_experiment_key
    unique (owner_user_id, baseline_id, candidate_ranking_version)
);

create index scanner_clock_prior_forward_plans_owner_recorded_idx
  on public.scanner_clock_prior_shadow_forward_decision_plans
  (owner_user_id, recorded_at desc, id desc);

create table public.scanner_clock_prior_shadow_forward_decision_results (
  id uuid primary key default gen_random_uuid(),
  receipt_contract_version text not null,
  result_fingerprint text not null unique,
  owner_user_id uuid not null,
  plan_id uuid not null unique references public.scanner_clock_prior_shadow_forward_decision_plans(id),
  plan_fingerprint text not null,
  decision_result jsonb not null,
  recorded_at timestamptz not null default now(),
  constraint scanner_clock_prior_forward_result_receipt_contract_check
    check (receipt_contract_version = 'scanner_clock_prior_shadow_forward_decision_receipt_v1'),
  constraint scanner_clock_prior_forward_result_fingerprint_check
    check (result_fingerprint ~ '^[a-f0-9]{64}$'),
  constraint scanner_clock_prior_forward_result_plan_fingerprint_check
    check (plan_fingerprint ~ '^[a-f0-9]{64}$'),
  constraint scanner_clock_prior_forward_result_json_check
    check (
      jsonb_typeof(decision_result) = 'object'
      and pg_column_size(decision_result) <= 262144
      and decision_result->>'contract_version' = 'scanner_clock_prior_shadow_forward_decision_v1'
      and decision_result->>'status' = 'decision_ready'
      and decision_result->>'decision' in ('continue', 'narrow', 'reject')
      and decision_result->>'plan_fingerprint' = plan_fingerprint
      and decision_result#>>'{evidence_binding,owner_user_id}' = owner_user_id::text
      and decision_result->>'shadow_only' = 'true'
      and decision_result->>'live_ranking_effect' = 'false'
      and decision_result->>'publication_effect' = 'false'
      and decision_result->>'causal_improvement_claimed' = 'false'
      and decision_result#>>'{authority,can_change_ranking_or_publication}' = 'false'
      and decision_result#>>'{authority,can_promote_policy}' = 'false'
      and decision_result#>>'{authority,can_request_provider_data}' = 'false'
      and decision_result#>>'{authority,can_execute_broker_action}' = 'false'
    )
);

create index scanner_clock_prior_forward_results_owner_recorded_idx
  on public.scanner_clock_prior_shadow_forward_decision_results
  (owner_user_id, recorded_at desc, id desc);

alter table public.scanner_clock_prior_shadow_forward_decision_plans enable row level security;
alter table public.scanner_clock_prior_shadow_forward_decision_results enable row level security;
revoke all on table public.scanner_clock_prior_shadow_forward_decision_plans
  from public, anon, authenticated, service_role;
revoke all on table public.scanner_clock_prior_shadow_forward_decision_results
  from public, anon, authenticated, service_role;

create function public.reject_scanner_clock_prior_forward_receipt_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'clock-prior forward-decision receipts are immutable: % rejected', tg_op
    using errcode = '55000';
end;
$$;

create trigger scanner_clock_prior_forward_plans_immutable
  before update or delete on public.scanner_clock_prior_shadow_forward_decision_plans
  for each row execute function public.reject_scanner_clock_prior_forward_receipt_mutation();

create trigger scanner_clock_prior_forward_results_immutable
  before update or delete on public.scanner_clock_prior_shadow_forward_decision_results
  for each row execute function public.reject_scanner_clock_prior_forward_receipt_mutation();

create function public.record_scanner_clock_prior_shadow_forward_decision_plan(
  p_owner_user_id uuid,
  p_plan_fingerprint text,
  p_plan_json jsonb,
  p_expected_receipt_contract_version text
)
returns table (
  write_status text,
  plan_id uuid,
  plan_fingerprint text,
  owner_user_id uuid,
  plan_json jsonb,
  recorded_at timestamptz,
  idempotent boolean,
  blocker text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing public.scanner_clock_prior_shadow_forward_decision_plans%rowtype;
  charter public.recommendation_evaluation_charters%rowtype;
  baseline public.recommendation_learning_baseline_freezes%rowtype;
  plan_created_at timestamptz;
  held_out_start_at timestamptz;
  held_out_end_at timestamptz;
  walk_forward_start_at timestamptz;
  baseline_ranking text;
  candidate_ranking text;
  plan_segment text;
  plan_charter_id uuid;
  plan_baseline_id uuid;
  continue_threshold numeric;
  reject_threshold numeric;
  held_out_minimum_opportunity_sets integer;
  held_out_minimum_ranked_candidates integer;
  held_out_minimum_trading_days integer;
  walk_forward_minimum_opportunity_sets integer;
  walk_forward_minimum_ranked_candidates integer;
  walk_forward_minimum_trading_days integer;
begin
  if p_expected_receipt_contract_version <>
       'scanner_clock_prior_shadow_forward_decision_receipt_v1'
     or p_owner_user_id is null
     or p_plan_fingerprint is null
     or p_plan_fingerprint !~ '^[a-f0-9]{64}$'
     or p_plan_json is null
     or jsonb_typeof(p_plan_json) <> 'object'
     or pg_column_size(p_plan_json) > 262144
     or p_plan_json->>'contract_version' <>
       'scanner_clock_prior_shadow_forward_decision_plan_v1'
     or p_plan_json->>'plan_fingerprint' <> p_plan_fingerprint
     or p_plan_json->>'owner_user_id' <> p_owner_user_id::text
     or length(coalesce(p_plan_json->>'segment_key', '')) not between 1 and 16384
     or length(coalesce(p_plan_json->>'hypothesis', '')) not between 20 and 2800
     or length(coalesce(p_plan_json->>'baseline_ranking_version', '')) not between 1 and 512
     or length(coalesce(p_plan_json->>'candidate_ranking_version', '')) not between 1 and 512
     or p_plan_json->>'baseline_ranking_version' = p_plan_json->>'candidate_ranking_version'
     or coalesce(p_plan_json->>'primary_k', '') not in ('1', '3', '5')
     or coalesce(p_plan_json#>>'{windows,held_out,minimum_opportunity_sets}', '') !~ '^[0-9]+$'
     or coalesce(p_plan_json#>>'{windows,held_out,minimum_ranked_candidates}', '') !~ '^[0-9]+$'
     or coalesce(p_plan_json#>>'{windows,held_out,minimum_trading_days}', '') !~ '^[0-9]+$'
     or coalesce(p_plan_json#>>'{windows,walk_forward,minimum_opportunity_sets}', '') !~ '^[0-9]+$'
     or coalesce(p_plan_json#>>'{windows,walk_forward,minimum_ranked_candidates}', '') !~ '^[0-9]+$'
     or coalesce(p_plan_json#>>'{windows,walk_forward,minimum_trading_days}', '') !~ '^[0-9]+$'
     then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::jsonb, null::timestamptz, false,
      'clock_prior_forward_decision_plan_contract_invalid'::text;
    return;
  end if;

  begin
    plan_created_at := (p_plan_json->>'created_at')::timestamptz;
    held_out_start_at := (p_plan_json#>>'{windows,held_out,start_at}')::timestamptz;
    held_out_end_at := (p_plan_json#>>'{windows,held_out,end_at}')::timestamptz;
    walk_forward_start_at := (p_plan_json#>>'{windows,walk_forward,start_at}')::timestamptz;
    plan_charter_id := (p_plan_json->>'evaluation_charter_id')::uuid;
    plan_baseline_id := (p_plan_json->>'baseline_id')::uuid;
    continue_threshold := (p_plan_json#>>'{thresholds,continue_minimum_precision_delta}')::numeric;
    reject_threshold := (p_plan_json#>>'{thresholds,reject_maximum_precision_delta}')::numeric;
    held_out_minimum_opportunity_sets :=
      (p_plan_json#>>'{windows,held_out,minimum_opportunity_sets}')::integer;
    held_out_minimum_ranked_candidates :=
      (p_plan_json#>>'{windows,held_out,minimum_ranked_candidates}')::integer;
    held_out_minimum_trading_days :=
      (p_plan_json#>>'{windows,held_out,minimum_trading_days}')::integer;
    walk_forward_minimum_opportunity_sets :=
      (p_plan_json#>>'{windows,walk_forward,minimum_opportunity_sets}')::integer;
    walk_forward_minimum_ranked_candidates :=
      (p_plan_json#>>'{windows,walk_forward,minimum_ranked_candidates}')::integer;
    walk_forward_minimum_trading_days :=
      (p_plan_json#>>'{windows,walk_forward,minimum_trading_days}')::integer;
  exception when others then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::jsonb, null::timestamptz, false,
      'clock_prior_forward_decision_plan_contract_invalid'::text;
    return;
  end;

  if plan_created_at > statement_timestamp()
     or plan_created_at >= held_out_start_at
     or held_out_start_at >= held_out_end_at
     or held_out_end_at > walk_forward_start_at
     or held_out_minimum_opportunity_sets < 2
     or held_out_minimum_ranked_candidates < 10
     or held_out_minimum_trading_days < 3
     or walk_forward_minimum_opportunity_sets < 2
     or walk_forward_minimum_ranked_candidates < 10
     or walk_forward_minimum_trading_days < 3
     or continue_threshold < -1 or continue_threshold > 1
     or reject_threshold < -1 or reject_threshold > 1
     or reject_threshold >= continue_threshold then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::jsonb, null::timestamptz, false,
      'clock_prior_forward_decision_plan_timing_or_threshold_invalid'::text;
    return;
  end if;

  plan_segment := p_plan_json->>'segment_key';
  baseline_ranking := p_plan_json->>'baseline_ranking_version';
  candidate_ranking := p_plan_json->>'candidate_ranking_version';

  select * into charter
  from public.recommendation_evaluation_charters as stored_charter
  where stored_charter.id = plan_charter_id
    and stored_charter.owner_user_id = p_owner_user_id
    and stored_charter.segment_key = plan_segment
    and stored_charter.charter_fingerprint = p_plan_json->>'evaluation_charter_fingerprint'
    and stored_charter.charter_json->>'hypothesis' = p_plan_json->>'hypothesis'
    and stored_charter.policy_attribution#>>'{canonical_evaluation_versions,ranking_version}' = baseline_ranking
    and stored_charter.created_at <= plan_created_at;

  if not found then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::jsonb, null::timestamptz, false,
      'clock_prior_forward_decision_charter_missing_or_mismatched'::text;
    return;
  end if;

  select * into baseline
  from public.recommendation_learning_baseline_freezes as stored_baseline
  where stored_baseline.id = plan_baseline_id
    and stored_baseline.owner_user_id = p_owner_user_id
    and stored_baseline.segment_key = plan_segment
    and stored_baseline.baseline_fingerprint = p_plan_json->>'baseline_fingerprint'
    and stored_baseline.evaluation_charter_fingerprint = charter.charter_fingerprint
    and stored_baseline.evaluation_plan#>>'{policy_attribution,canonical_evaluation_versions,ranking_version}' = baseline_ranking
    and stored_baseline.frozen_at <= plan_created_at;

  if not found then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::jsonb, null::timestamptz, false,
      'clock_prior_forward_decision_baseline_missing_or_mismatched'::text;
    return;
  end if;

  perform pg_advisory_xact_lock(
    hashtext('clock_prior_forward_plan:' || p_owner_user_id::text || ':' ||
      plan_baseline_id::text || ':' || candidate_ranking)
  );

  select * into existing
  from public.scanner_clock_prior_shadow_forward_decision_plans as stored_plan
  where stored_plan.owner_user_id = p_owner_user_id
    and stored_plan.baseline_id = plan_baseline_id
    and stored_plan.candidate_ranking_version = candidate_ranking
  for update;

  if found then
    if existing.plan_fingerprint = p_plan_fingerprint
       and existing.plan_json = p_plan_json then
      return query select 'plan_already_recorded'::text, existing.id,
        existing.plan_fingerprint, existing.owner_user_id, existing.plan_json,
        existing.recorded_at, true, null::text;
      return;
    end if;
    return query select 'different_plan_already_recorded'::text, null::uuid,
      null::text, null::uuid, null::jsonb, null::timestamptz, false,
      'different_clock_prior_forward_decision_plan_already_recorded'::text;
    return;
  end if;

  insert into public.scanner_clock_prior_shadow_forward_decision_plans (
    receipt_contract_version, plan_fingerprint, owner_user_id, segment_key,
    evaluation_charter_id, evaluation_charter_fingerprint, baseline_id,
    baseline_fingerprint, baseline_ranking_version, candidate_ranking_version,
    plan_json
  ) values (
    p_expected_receipt_contract_version, p_plan_fingerprint, p_owner_user_id,
    plan_segment, plan_charter_id,
    p_plan_json->>'evaluation_charter_fingerprint', plan_baseline_id,
    p_plan_json->>'baseline_fingerprint', baseline_ranking, candidate_ranking,
    p_plan_json
  ) returning * into existing;

  return query select 'plan_recorded'::text, existing.id,
    existing.plan_fingerprint, existing.owner_user_id, existing.plan_json,
    existing.recorded_at, false, null::text;
end;
$$;

create function public.read_scanner_clock_prior_shadow_forward_decision_plans(
  p_owner_user_id uuid,
  p_expected_receipt_contract_version text
)
returns table (
  readback_status text,
  plan_id uuid,
  plan_fingerprint text,
  owner_user_id uuid,
  plan_json jsonb,
  recorded_at timestamptz,
  blocker text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_owner_user_id is null or p_expected_receipt_contract_version <>
       'scanner_clock_prior_shadow_forward_decision_receipt_v1' then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::jsonb, null::timestamptz,
      'clock_prior_forward_decision_plan_read_contract_invalid'::text;
    return;
  end if;
  if not exists (
    select 1 from public.scanner_clock_prior_shadow_forward_decision_plans as plan
    where plan.owner_user_id = p_owner_user_id
  ) then
    return query select 'not_found'::text, null::uuid, null::text,
      null::uuid, null::jsonb, null::timestamptz,
      'clock_prior_forward_decision_plan_not_found'::text;
    return;
  end if;
  return query
  select 'available'::text, plan.id, plan.plan_fingerprint,
    plan.owner_user_id, plan.plan_json, plan.recorded_at, null::text
  from public.scanner_clock_prior_shadow_forward_decision_plans as plan
  where plan.owner_user_id = p_owner_user_id
    and plan.receipt_contract_version = p_expected_receipt_contract_version
  order by plan.recorded_at desc, plan.id desc
  limit 50;
end;
$$;

create function public.record_scanner_clock_prior_shadow_forward_decision_result(
  p_owner_user_id uuid,
  p_plan_id uuid,
  p_plan_fingerprint text,
  p_result_fingerprint text,
  p_decision_result jsonb,
  p_expected_receipt_contract_version text
)
returns table (
  write_status text,
  result_id uuid,
  result_fingerprint text,
  owner_user_id uuid,
  plan_id uuid,
  plan_fingerprint text,
  decision_result jsonb,
  recorded_at timestamptz,
  idempotent boolean,
  blocker text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  plan public.scanner_clock_prior_shadow_forward_decision_plans%rowtype;
  existing public.scanner_clock_prior_shadow_forward_decision_results%rowtype;
  walk_forward_end_at timestamptz;
  partition_count integer;
begin
  if p_expected_receipt_contract_version <>
       'scanner_clock_prior_shadow_forward_decision_receipt_v1'
     or p_owner_user_id is null or p_plan_id is null
     or p_plan_fingerprint is null or p_plan_fingerprint !~ '^[a-f0-9]{64}$'
     or p_result_fingerprint is null or p_result_fingerprint !~ '^[a-f0-9]{64}$'
     or p_decision_result is null or jsonb_typeof(p_decision_result) <> 'object'
     or pg_column_size(p_decision_result) > 262144
     or p_decision_result->>'contract_version' <>
       'scanner_clock_prior_shadow_forward_decision_v1'
     or p_decision_result->>'status' <> 'decision_ready'
     or p_decision_result->>'decision' not in ('continue', 'narrow', 'reject')
     or p_decision_result->>'plan_fingerprint' <> p_plan_fingerprint
     or p_decision_result#>>'{evidence_binding,owner_user_id}' <> p_owner_user_id::text
     or p_decision_result->>'shadow_only' <> 'true'
     or p_decision_result->>'live_ranking_effect' <> 'false'
     or p_decision_result->>'publication_effect' <> 'false'
     or p_decision_result->>'causal_improvement_claimed' <> 'false'
     or p_decision_result#>>'{authority,can_change_ranking_or_publication}' <> 'false'
     or p_decision_result#>>'{authority,can_promote_policy}' <> 'false'
     or p_decision_result#>>'{authority,can_request_provider_data}' <> 'false'
     or p_decision_result#>>'{authority,can_execute_broker_action}' <> 'false'
     or jsonb_typeof(p_decision_result->'reason_codes') <> 'array'
     or jsonb_array_length(p_decision_result->'reason_codes') <> 0
     or jsonb_typeof(p_decision_result->'partitions') <> 'array'
     or jsonb_array_length(p_decision_result->'partitions') <> 2 then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::uuid, null::text, null::jsonb, null::timestamptz,
      false, 'clock_prior_forward_decision_result_contract_invalid'::text;
    return;
  end if;

  select count(*) into partition_count
  from jsonb_array_elements(p_decision_result->'partitions') as partition
  where partition->>'partition' in ('held_out', 'walk_forward')
    and partition->>'evidence_complete' = 'true'
    and partition->'precision_delta' is not null
    and jsonb_typeof(partition->'reason_codes') = 'array'
    and jsonb_array_length(partition->'reason_codes') = 0;
  if partition_count <> 2 or (
    select count(distinct partition->>'partition')
    from jsonb_array_elements(p_decision_result->'partitions') as partition
  ) <> 2 then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::uuid, null::text, null::jsonb, null::timestamptz,
      false, 'clock_prior_forward_decision_result_partitions_invalid'::text;
    return;
  end if;

  select * into plan
  from public.scanner_clock_prior_shadow_forward_decision_plans as stored_plan
  where stored_plan.id = p_plan_id
    and stored_plan.owner_user_id = p_owner_user_id
    and stored_plan.plan_fingerprint = p_plan_fingerprint
    and stored_plan.receipt_contract_version = p_expected_receipt_contract_version;
  if not found
     or p_decision_result#>>'{evidence_binding,segment_key}' <> plan.segment_key
     or p_decision_result#>>'{evidence_binding,evaluation_charter_id}' <>
       plan.evaluation_charter_id::text
     or p_decision_result#>>'{evidence_binding,evaluation_charter_fingerprint}' <>
       plan.evaluation_charter_fingerprint
     or p_decision_result#>>'{evidence_binding,baseline_id}' <> plan.baseline_id::text
     or p_decision_result#>>'{evidence_binding,baseline_fingerprint}' <>
       plan.baseline_fingerprint then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::uuid, null::text, null::jsonb, null::timestamptz,
      false, 'clock_prior_forward_decision_result_plan_binding_invalid'::text;
    return;
  end if;

  begin
    walk_forward_end_at := (plan.plan_json#>>'{windows,walk_forward,end_at}')::timestamptz;
  exception when others then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::uuid, null::text, null::jsonb, null::timestamptz,
      false, 'clock_prior_forward_decision_result_plan_timing_invalid'::text;
    return;
  end;
  if statement_timestamp() < walk_forward_end_at then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::uuid, null::text, null::jsonb, null::timestamptz,
      false, 'clock_prior_forward_decision_result_window_not_complete'::text;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext('clock_prior_forward_result:' || p_plan_id::text));
  select * into existing
  from public.scanner_clock_prior_shadow_forward_decision_results as stored_result
  where stored_result.plan_id = p_plan_id
  for update;
  if found then
    if existing.result_fingerprint = p_result_fingerprint
       and existing.decision_result = p_decision_result then
      return query select 'result_already_recorded'::text, existing.id,
        existing.result_fingerprint, existing.owner_user_id, existing.plan_id,
        existing.plan_fingerprint, existing.decision_result,
        existing.recorded_at, true, null::text;
      return;
    end if;
    return query select 'different_result_already_recorded'::text, null::uuid,
      null::text, null::uuid, null::uuid, null::text, null::jsonb,
      null::timestamptz, false,
      'different_clock_prior_forward_decision_result_already_recorded'::text;
    return;
  end if;

  insert into public.scanner_clock_prior_shadow_forward_decision_results (
    receipt_contract_version, result_fingerprint, owner_user_id, plan_id,
    plan_fingerprint, decision_result
  ) values (
    p_expected_receipt_contract_version, p_result_fingerprint,
    p_owner_user_id, p_plan_id, p_plan_fingerprint, p_decision_result
  ) returning * into existing;
  return query select 'result_recorded'::text, existing.id,
    existing.result_fingerprint, existing.owner_user_id, existing.plan_id,
    existing.plan_fingerprint, existing.decision_result,
    existing.recorded_at, false, null::text;
end;
$$;

create function public.read_scanner_clock_prior_shadow_forward_decision_results(
  p_owner_user_id uuid,
  p_expected_receipt_contract_version text
)
returns table (
  readback_status text,
  result_id uuid,
  result_fingerprint text,
  owner_user_id uuid,
  plan_id uuid,
  plan_fingerprint text,
  decision_result jsonb,
  recorded_at timestamptz,
  blocker text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_owner_user_id is null or p_expected_receipt_contract_version <>
       'scanner_clock_prior_shadow_forward_decision_receipt_v1' then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::uuid, null::text, null::jsonb, null::timestamptz,
      'clock_prior_forward_decision_result_read_contract_invalid'::text;
    return;
  end if;
  if not exists (
    select 1 from public.scanner_clock_prior_shadow_forward_decision_results as result
    where result.owner_user_id = p_owner_user_id
  ) then
    return query select 'not_found'::text, null::uuid, null::text,
      null::uuid, null::uuid, null::text, null::jsonb, null::timestamptz,
      'clock_prior_forward_decision_result_not_found'::text;
    return;
  end if;
  return query
  select 'available'::text, result.id, result.result_fingerprint,
    result.owner_user_id, result.plan_id, result.plan_fingerprint,
    result.decision_result, result.recorded_at, null::text
  from public.scanner_clock_prior_shadow_forward_decision_results as result
  where result.owner_user_id = p_owner_user_id
    and result.receipt_contract_version = p_expected_receipt_contract_version
  order by result.recorded_at desc, result.id desc
  limit 50;
end;
$$;

revoke all on function public.reject_scanner_clock_prior_forward_receipt_mutation()
  from public, anon, authenticated, service_role;
revoke all on function public.record_scanner_clock_prior_shadow_forward_decision_plan(
  uuid, text, jsonb, text
) from public, anon, authenticated;
revoke all on function public.read_scanner_clock_prior_shadow_forward_decision_plans(
  uuid, text
) from public, anon, authenticated;
revoke all on function public.record_scanner_clock_prior_shadow_forward_decision_result(
  uuid, uuid, text, text, jsonb, text
) from public, anon, authenticated;
revoke all on function public.read_scanner_clock_prior_shadow_forward_decision_results(
  uuid, text
) from public, anon, authenticated;
grant execute on function public.record_scanner_clock_prior_shadow_forward_decision_plan(
  uuid, text, jsonb, text
) to service_role;
grant execute on function public.read_scanner_clock_prior_shadow_forward_decision_plans(
  uuid, text
) to service_role;
grant execute on function public.record_scanner_clock_prior_shadow_forward_decision_result(
  uuid, uuid, text, text, jsonb, text
) to service_role;
grant execute on function public.read_scanner_clock_prior_shadow_forward_decision_results(
  uuid, text
) to service_role;

comment on table public.scanner_clock_prior_shadow_forward_decision_plans is
  'Server-only immutable IF-4 predeclared held-out/walk-forward plans. Each plan is owner-bound to one durable charter and baseline and has no provider, ranking, publication, promotion or broker authority.';
comment on table public.scanner_clock_prior_shadow_forward_decision_results is
  'Server-only immutable IF-4 advisory terminal decisions. Continue means continue shadow validation only; no result can change ranking, publish, promote or execute.';

commit;
