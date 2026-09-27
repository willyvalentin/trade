-- IF-4: supersede the result-dependent clock-prior experiment start with an
-- immutable semantic policy reference. This freezes what is compared before
-- observation, including no_trade observations, without claiming quality or
-- relaxing the separate generic learning-baseline gate required for promotion.
begin;

create table public.scanner_clock_prior_shadow_forward_decision_plans_v2 (
  id uuid primary key default gen_random_uuid(),
  receipt_contract_version text not null,
  plan_fingerprint text not null unique,
  owner_user_id uuid not null,
  segment_key text not null,
  evaluation_charter_id uuid not null
    references public.recommendation_evaluation_charters(id),
  evaluation_charter_fingerprint text not null,
  policy_reference_fingerprint text not null,
  baseline_ranking_version text not null,
  candidate_ranking_version text not null,
  plan_json jsonb not null,
  recorded_at timestamptz not null default now(),
  constraint scanner_clock_prior_forward_plan_v2_receipt_contract_check
    check (receipt_contract_version =
      'scanner_clock_prior_shadow_forward_decision_receipt_v2'),
  constraint scanner_clock_prior_forward_plan_v2_fingerprint_check
    check (plan_fingerprint ~ '^[a-f0-9]{64}$'),
  constraint scanner_clock_prior_forward_plan_v2_charter_fingerprint_check
    check (evaluation_charter_fingerprint ~ '^[a-f0-9]{64}$'),
  constraint scanner_clock_prior_forward_plan_v2_policy_fingerprint_check
    check (policy_reference_fingerprint ~ '^[a-f0-9]{64}$'),
  constraint scanner_clock_prior_forward_plan_v2_segment_check
    check (length(segment_key) between 1 and 16384),
  constraint scanner_clock_prior_forward_plan_v2_versions_check
    check (
      baseline_ranking_version = 'scanner_candidate_ranking_v1.2'
      and candidate_ranking_version =
        'scanner_candidate_ranking_clock_neutral_v1'
    ),
  constraint scanner_clock_prior_forward_plan_v2_json_check
    check (
      jsonb_typeof(plan_json) = 'object'
      and pg_column_size(plan_json) <= 262144
      and plan_json->>'contract_version' =
        'scanner_clock_prior_shadow_forward_decision_plan_v2'
      and plan_json->>'plan_fingerprint' = plan_fingerprint
      and plan_json->>'owner_user_id' = owner_user_id::text
      and plan_json->>'segment_key' = segment_key
      and plan_json->>'evaluation_charter_id' = evaluation_charter_id::text
      and plan_json->>'evaluation_charter_fingerprint' =
        evaluation_charter_fingerprint
      and plan_json#>>'{policy_reference,reference_fingerprint}' =
        policy_reference_fingerprint
      and plan_json->>'baseline_ranking_version' = baseline_ranking_version
      and plan_json->>'candidate_ranking_version' = candidate_ranking_version
    ),
  constraint scanner_clock_prior_forward_plan_v2_experiment_key
    unique (owner_user_id, policy_reference_fingerprint,
      candidate_ranking_version)
);

create index scanner_clock_prior_forward_plans_v2_owner_recorded_idx
  on public.scanner_clock_prior_shadow_forward_decision_plans_v2
  (owner_user_id, recorded_at desc, id desc);

create table public.scanner_clock_prior_shadow_forward_decision_results_v2 (
  id uuid primary key default gen_random_uuid(),
  receipt_contract_version text not null,
  result_fingerprint text not null unique,
  owner_user_id uuid not null,
  plan_id uuid not null unique
    references public.scanner_clock_prior_shadow_forward_decision_plans_v2(id),
  plan_fingerprint text not null,
  decision_result jsonb not null,
  recorded_at timestamptz not null default now(),
  constraint scanner_clock_prior_forward_result_v2_receipt_contract_check
    check (receipt_contract_version =
      'scanner_clock_prior_shadow_forward_decision_receipt_v2'),
  constraint scanner_clock_prior_forward_result_v2_fingerprint_check
    check (result_fingerprint ~ '^[a-f0-9]{64}$'),
  constraint scanner_clock_prior_forward_result_v2_plan_fingerprint_check
    check (plan_fingerprint ~ '^[a-f0-9]{64}$'),
  constraint scanner_clock_prior_forward_result_v2_json_check
    check (
      jsonb_typeof(decision_result) = 'object'
      and pg_column_size(decision_result) <= 262144
      and decision_result->>'contract_version' =
        'scanner_clock_prior_shadow_forward_decision_v2'
      and decision_result->>'status' = 'decision_ready'
      and decision_result->>'decision' in ('continue', 'narrow', 'reject')
      and decision_result->>'plan_fingerprint' = plan_fingerprint
      and decision_result#>>'{evidence_binding,owner_user_id}' =
        owner_user_id::text
      and decision_result->>'shadow_only' = 'true'
      and decision_result->>'live_ranking_effect' = 'false'
      and decision_result->>'publication_effect' = 'false'
      and decision_result->>'causal_improvement_claimed' = 'false'
      and decision_result#>>'{authority,can_change_ranking_or_publication}' =
        'false'
      and decision_result#>>'{authority,can_promote_policy}' = 'false'
      and decision_result#>>'{authority,can_request_provider_data}' = 'false'
      and decision_result#>>'{authority,can_execute_broker_action}' = 'false'
    )
);

create index scanner_clock_prior_forward_results_v2_owner_recorded_idx
  on public.scanner_clock_prior_shadow_forward_decision_results_v2
  (owner_user_id, recorded_at desc, id desc);

alter table public.scanner_clock_prior_shadow_forward_decision_plans_v2
  enable row level security;
alter table public.scanner_clock_prior_shadow_forward_decision_results_v2
  enable row level security;
revoke all on table public.scanner_clock_prior_shadow_forward_decision_plans_v2
  from public, anon, authenticated, service_role;
revoke all on table public.scanner_clock_prior_shadow_forward_decision_results_v2
  from public, anon, authenticated, service_role;

create function public.reject_scanner_clock_prior_forward_v2_receipt_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'clock-prior v2 forward-decision receipts are immutable: % rejected', tg_op
    using errcode = '55000';
end;
$$;

create trigger scanner_clock_prior_forward_plans_v2_immutable
  before update or delete
  on public.scanner_clock_prior_shadow_forward_decision_plans_v2
  for each row execute function
    public.reject_scanner_clock_prior_forward_v2_receipt_mutation();
create trigger scanner_clock_prior_forward_results_v2_immutable
  before update or delete
  on public.scanner_clock_prior_shadow_forward_decision_results_v2
  for each row execute function
    public.reject_scanner_clock_prior_forward_v2_receipt_mutation();

create function public.record_scanner_clock_prior_shadow_forward_decision_plan_v2(
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
  existing public.scanner_clock_prior_shadow_forward_decision_plans_v2%rowtype;
  charter public.recommendation_evaluation_charters%rowtype;
  plan_created_at timestamptz;
  reference_created_at timestamptz;
  held_out_start_at timestamptz;
  held_out_end_at timestamptz;
  walk_forward_start_at timestamptz;
  plan_charter_id uuid;
  continue_threshold numeric;
  reject_threshold numeric;
  v_policy_reference jsonb;
begin
  v_policy_reference := p_plan_json->'policy_reference';
  if p_expected_receipt_contract_version <>
       'scanner_clock_prior_shadow_forward_decision_receipt_v2'
     or p_owner_user_id is null
     or p_plan_fingerprint is null
     or p_plan_fingerprint !~ '^[a-f0-9]{64}$'
     or p_plan_json is null or jsonb_typeof(p_plan_json) <> 'object'
     or pg_column_size(p_plan_json) > 262144
     or p_plan_json->>'contract_version' <>
       'scanner_clock_prior_shadow_forward_decision_plan_v2'
     or p_plan_json->>'plan_fingerprint' <> p_plan_fingerprint
     or p_plan_json->>'owner_user_id' <> p_owner_user_id::text
     or length(coalesce(p_plan_json->>'segment_key', '')) not between 1 and 16384
     or length(coalesce(p_plan_json->>'hypothesis', '')) not between 20 and 2800
     or p_plan_json->>'baseline_ranking_version' <>
       'scanner_candidate_ranking_v1.2'
     or p_plan_json->>'candidate_ranking_version' <>
       'scanner_candidate_ranking_clock_neutral_v1'
     or coalesce(p_plan_json->>'primary_k', '') not in ('1', '3', '5')
     or coalesce(p_plan_json#>>'{windows,held_out,minimum_opportunity_sets}', '') !~ '^[0-9]+$'
     or coalesce(p_plan_json#>>'{windows,held_out,minimum_ranked_candidates}', '') !~ '^[0-9]+$'
     or coalesce(p_plan_json#>>'{windows,held_out,minimum_trading_days}', '') !~ '^[0-9]+$'
     or coalesce(p_plan_json#>>'{windows,walk_forward,minimum_opportunity_sets}', '') !~ '^[0-9]+$'
     or coalesce(p_plan_json#>>'{windows,walk_forward,minimum_ranked_candidates}', '') !~ '^[0-9]+$'
     or coalesce(p_plan_json#>>'{windows,walk_forward,minimum_trading_days}', '') !~ '^[0-9]+$'
     or jsonb_typeof(v_policy_reference) <> 'object'
     or v_policy_reference->>'contract_version' <>
       'scanner_clock_prior_shadow_policy_reference_v1'
     or coalesce(v_policy_reference->>'reference_fingerprint', '') !~
       '^[a-f0-9]{64}$'
     or v_policy_reference->>'owner_user_id' <> p_owner_user_id::text
     or v_policy_reference->>'segment_key' <> p_plan_json->>'segment_key'
     or v_policy_reference->>'evaluation_charter_id' <>
       p_plan_json->>'evaluation_charter_id'
     or v_policy_reference->>'evaluation_charter_fingerprint' <>
       p_plan_json->>'evaluation_charter_fingerprint'
     or v_policy_reference->>'evidence_classification' <>
       'semantic_identity_not_quality_baseline'
     or v_policy_reference->>'quality_evidence_status' <> 'not_evaluated'
     or v_policy_reference->>'generic_learning_baseline_required_for_promotion' <>
       'true'
     or v_policy_reference->>'shadow_only' <> 'true'
     or v_policy_reference->>'live_ranking_effect' <> 'false'
     or v_policy_reference->>'publication_effect' <> 'false'
     or v_policy_reference->>'promotion_effect' <> 'false'
     or v_policy_reference->>'provider_effect' <> 'false'
     or v_policy_reference->>'broker_effect' <> 'false'
     or v_policy_reference#>>'{baseline_version_tuple,ranking_version}' <>
       'scanner_candidate_ranking_v1.2'
     or v_policy_reference#>>'{candidate_version_tuple,ranking_version}' <>
       'scanner_candidate_ranking_clock_neutral_v1'
     or v_policy_reference#>'{version_difference_set,differences}' <>
       '["ranking_version"]'::jsonb
     or v_policy_reference#>>'{version_difference_set,baseline_version_tuple_digest}' <>
       v_policy_reference#>>'{baseline_version_tuple,semantic_digest}'
     or v_policy_reference#>>'{version_difference_set,candidate_version_tuple_digest}' <>
       v_policy_reference#>>'{candidate_version_tuple,semantic_digest}'
     or coalesce(v_policy_reference#>>'{baseline_version_tuple,semantic_digest}', '') !~
       '^[a-f0-9]{64}$'
     or coalesce(v_policy_reference#>>'{candidate_version_tuple,semantic_digest}', '') !~
       '^[a-f0-9]{64}$'
     or coalesce(v_policy_reference#>>'{version_difference_set,semantic_digest}', '') !~
       '^[a-f0-9]{64}$'
     then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::jsonb, null::timestamptz, false,
      'clock_prior_forward_decision_plan_v2_contract_invalid'::text;
    return;
  end if;

  if v_policy_reference#>>'{baseline_version_tuple,engine_version}' <>
       v_policy_reference#>>'{candidate_version_tuple,engine_version}'
     or v_policy_reference#>>'{baseline_version_tuple,scoring_version}' <>
       v_policy_reference#>>'{candidate_version_tuple,scoring_version}'
     or v_policy_reference#>>'{baseline_version_tuple,threshold_policy_version}' <>
       v_policy_reference#>>'{candidate_version_tuple,threshold_policy_version}'
     or v_policy_reference#>>'{baseline_version_tuple,setup_taxonomy_version}' <>
       v_policy_reference#>>'{candidate_version_tuple,setup_taxonomy_version}'
     or v_policy_reference#>>'{baseline_version_tuple,confidence_contract_version}' <>
       v_policy_reference#>>'{candidate_version_tuple,confidence_contract_version}'
     or v_policy_reference#>>'{baseline_version_tuple,evaluator_version}' <>
       v_policy_reference#>>'{candidate_version_tuple,evaluator_version}'
     or v_policy_reference#>>'{baseline_version_tuple,provider_contract_version}' <>
       v_policy_reference#>>'{candidate_version_tuple,provider_contract_version}' then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::jsonb, null::timestamptz, false,
      'clock_prior_forward_decision_policy_reference_not_ranking_only'::text;
    return;
  end if;

  begin
    plan_created_at := (p_plan_json->>'created_at')::timestamptz;
    reference_created_at := (v_policy_reference->>'created_at')::timestamptz;
    held_out_start_at :=
      (p_plan_json#>>'{windows,held_out,start_at}')::timestamptz;
    held_out_end_at :=
      (p_plan_json#>>'{windows,held_out,end_at}')::timestamptz;
    walk_forward_start_at :=
      (p_plan_json#>>'{windows,walk_forward,start_at}')::timestamptz;
    plan_charter_id := (p_plan_json->>'evaluation_charter_id')::uuid;
    continue_threshold :=
      (p_plan_json#>>'{thresholds,continue_minimum_precision_delta}')::numeric;
    reject_threshold :=
      (p_plan_json#>>'{thresholds,reject_maximum_precision_delta}')::numeric;
  exception when others then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::jsonb, null::timestamptz, false,
      'clock_prior_forward_decision_plan_v2_contract_invalid'::text;
    return;
  end;

  if plan_created_at > statement_timestamp()
     or reference_created_at > plan_created_at
     or plan_created_at >= held_out_start_at
     or held_out_start_at >= held_out_end_at
     or held_out_end_at > walk_forward_start_at
     or (p_plan_json#>>'{windows,held_out,minimum_opportunity_sets}')::integer < 2
     or (p_plan_json#>>'{windows,held_out,minimum_ranked_candidates}')::integer < 10
     or (p_plan_json#>>'{windows,held_out,minimum_trading_days}')::integer < 3
     or (p_plan_json#>>'{windows,walk_forward,minimum_opportunity_sets}')::integer < 2
     or (p_plan_json#>>'{windows,walk_forward,minimum_ranked_candidates}')::integer < 10
     or (p_plan_json#>>'{windows,walk_forward,minimum_trading_days}')::integer < 3
     or continue_threshold < -1 or continue_threshold > 1
     or reject_threshold < -1 or reject_threshold > 1
     or reject_threshold >= continue_threshold then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::jsonb, null::timestamptz, false,
      'clock_prior_forward_decision_plan_v2_timing_or_threshold_invalid'::text;
    return;
  end if;

  select * into charter
  from public.recommendation_evaluation_charters as stored_charter
  where stored_charter.id = plan_charter_id
    and stored_charter.owner_user_id = p_owner_user_id
    and stored_charter.segment_key = p_plan_json->>'segment_key'
    and stored_charter.charter_fingerprint =
      p_plan_json->>'evaluation_charter_fingerprint'
    and stored_charter.charter_json->>'hypothesis' = p_plan_json->>'hypothesis'
    and stored_charter.policy_attribution->>'recommendation_publish_policy_version' =
      v_policy_reference#>>'{source_revision,recommendation_publish_policy_version}'
    and stored_charter.policy_attribution#>>'{canonical_evaluation_versions,git_commit}' =
      v_policy_reference#>>'{source_revision,git_commit}'
    and stored_charter.policy_attribution#>>'{canonical_evaluation_versions,build_identity}' =
      v_policy_reference#>>'{source_revision,build_identity}'
    and stored_charter.policy_attribution#>>'{canonical_evaluation_versions,ranking_version}' =
      'scanner_candidate_ranking_v1.2'
    and stored_charter.created_at = reference_created_at
    and stored_charter.created_at <= plan_created_at;
  if not found then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::jsonb, null::timestamptz, false,
      'clock_prior_forward_decision_charter_or_policy_reference_mismatched'::text;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext(
    'clock_prior_forward_plan_v2:' || p_owner_user_id::text || ':' ||
    (p_plan_json#>>'{policy_reference,reference_fingerprint}')
  ));
  select * into existing
  from public.scanner_clock_prior_shadow_forward_decision_plans_v2 as stored_plan
  where stored_plan.owner_user_id = p_owner_user_id
    and stored_plan.policy_reference_fingerprint =
      p_plan_json#>>'{policy_reference,reference_fingerprint}'
    and stored_plan.candidate_ranking_version =
      p_plan_json->>'candidate_ranking_version'
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

  insert into public.scanner_clock_prior_shadow_forward_decision_plans_v2 (
    receipt_contract_version, plan_fingerprint, owner_user_id, segment_key,
    evaluation_charter_id, evaluation_charter_fingerprint,
    policy_reference_fingerprint, baseline_ranking_version,
    candidate_ranking_version, plan_json
  ) values (
    p_expected_receipt_contract_version, p_plan_fingerprint, p_owner_user_id,
    p_plan_json->>'segment_key', plan_charter_id,
    p_plan_json->>'evaluation_charter_fingerprint',
    p_plan_json#>>'{policy_reference,reference_fingerprint}',
    p_plan_json->>'baseline_ranking_version',
    p_plan_json->>'candidate_ranking_version', p_plan_json
  ) returning * into existing;
  return query select 'plan_recorded'::text, existing.id,
    existing.plan_fingerprint, existing.owner_user_id, existing.plan_json,
    existing.recorded_at, false, null::text;
end;
$$;

create function public.read_scanner_clock_prior_shadow_forward_decision_plans_v2(
  p_owner_user_id uuid,
  p_expected_receipt_contract_version text
)
returns table (
  readback_status text, plan_id uuid, plan_fingerprint text,
  owner_user_id uuid, plan_json jsonb, recorded_at timestamptz, blocker text
)
language plpgsql security definer set search_path = ''
as $$
begin
  if p_owner_user_id is null or p_expected_receipt_contract_version <>
       'scanner_clock_prior_shadow_forward_decision_receipt_v2' then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::jsonb, null::timestamptz,
      'clock_prior_forward_decision_plan_v2_read_contract_invalid'::text;
    return;
  end if;
  if not exists (
    select 1 from public.scanner_clock_prior_shadow_forward_decision_plans_v2 p
    where p.owner_user_id = p_owner_user_id
  ) then
    return query select 'not_found'::text, null::uuid, null::text,
      null::uuid, null::jsonb, null::timestamptz,
      'clock_prior_forward_decision_plan_not_found'::text;
    return;
  end if;
  return query select 'available'::text, p.id, p.plan_fingerprint,
    p.owner_user_id, p.plan_json, p.recorded_at, null::text
  from public.scanner_clock_prior_shadow_forward_decision_plans_v2 p
  where p.owner_user_id = p_owner_user_id
    and p.receipt_contract_version = p_expected_receipt_contract_version
  order by p.recorded_at desc, p.id desc limit 50;
end;
$$;

create function public.record_scanner_clock_prior_shadow_forward_decision_result_v2(
  p_owner_user_id uuid, p_plan_id uuid, p_plan_fingerprint text,
  p_result_fingerprint text, p_decision_result jsonb,
  p_expected_receipt_contract_version text
)
returns table (
  write_status text, result_id uuid, result_fingerprint text,
  owner_user_id uuid, plan_id uuid, plan_fingerprint text,
  decision_result jsonb, recorded_at timestamptz, idempotent boolean,
  blocker text
)
language plpgsql security definer set search_path = ''
as $$
declare
  plan public.scanner_clock_prior_shadow_forward_decision_plans_v2%rowtype;
  existing public.scanner_clock_prior_shadow_forward_decision_results_v2%rowtype;
  walk_forward_end_at timestamptz;
  partition_count integer;
begin
  if p_expected_receipt_contract_version <>
       'scanner_clock_prior_shadow_forward_decision_receipt_v2'
     or p_owner_user_id is null or p_plan_id is null
     or coalesce(p_plan_fingerprint, '') !~ '^[a-f0-9]{64}$'
     or coalesce(p_result_fingerprint, '') !~ '^[a-f0-9]{64}$'
     or jsonb_typeof(p_decision_result) <> 'object'
     or pg_column_size(p_decision_result) > 262144
     or p_decision_result->>'contract_version' <>
       'scanner_clock_prior_shadow_forward_decision_v2'
     or p_decision_result->>'status' <> 'decision_ready'
     or p_decision_result->>'decision' not in ('continue', 'narrow', 'reject')
     or p_decision_result->>'plan_fingerprint' <> p_plan_fingerprint
     or p_decision_result#>>'{evidence_binding,owner_user_id}' <>
       p_owner_user_id::text
     or coalesce(p_decision_result#>>'{evidence_binding,policy_reference_fingerprint}', '') !~
       '^[a-f0-9]{64}$'
     or p_decision_result->>'shadow_only' <> 'true'
     or p_decision_result->>'live_ranking_effect' <> 'false'
     or p_decision_result->>'publication_effect' <> 'false'
     or p_decision_result->>'causal_improvement_claimed' <> 'false'
     or p_decision_result#>>'{authority,can_change_ranking_or_publication}' <>
       'false'
     or p_decision_result#>>'{authority,can_promote_policy}' <> 'false'
     or p_decision_result#>>'{authority,can_request_provider_data}' <> 'false'
     or p_decision_result#>>'{authority,can_execute_broker_action}' <> 'false'
     or jsonb_typeof(p_decision_result->'reason_codes') <> 'array'
     or jsonb_array_length(p_decision_result->'reason_codes') <> 0
     or jsonb_typeof(p_decision_result->'partitions') <> 'array'
     or jsonb_array_length(p_decision_result->'partitions') <> 2 then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::uuid, null::text, null::jsonb, null::timestamptz,
      false, 'clock_prior_forward_decision_result_v2_contract_invalid'::text;
    return;
  end if;
  select count(*) into partition_count
  from jsonb_array_elements(p_decision_result->'partitions') partition
  where partition->>'partition' in ('held_out', 'walk_forward')
    and partition->>'evidence_complete' = 'true'
    and partition->'precision_delta' is not null
    and jsonb_typeof(partition->'reason_codes') = 'array'
    and jsonb_array_length(partition->'reason_codes') = 0;
  if partition_count <> 2 or (
    select count(distinct partition->>'partition')
    from jsonb_array_elements(p_decision_result->'partitions') partition
  ) <> 2 then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::uuid, null::text, null::jsonb, null::timestamptz,
      false, 'clock_prior_forward_decision_result_v2_partitions_invalid'::text;
    return;
  end if;
  select * into plan
  from public.scanner_clock_prior_shadow_forward_decision_plans_v2 stored_plan
  where stored_plan.id = p_plan_id
    and stored_plan.owner_user_id = p_owner_user_id
    and stored_plan.plan_fingerprint = p_plan_fingerprint
    and stored_plan.receipt_contract_version =
      p_expected_receipt_contract_version;
  if not found
     or p_decision_result#>>'{evidence_binding,segment_key}' <> plan.segment_key
     or p_decision_result#>>'{evidence_binding,evaluation_charter_id}' <>
       plan.evaluation_charter_id::text
     or p_decision_result#>>'{evidence_binding,evaluation_charter_fingerprint}' <>
       plan.evaluation_charter_fingerprint
     or p_decision_result#>>'{evidence_binding,policy_reference_fingerprint}' <>
       plan.policy_reference_fingerprint then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::uuid, null::text, null::jsonb, null::timestamptz,
      false, 'clock_prior_forward_decision_result_v2_plan_binding_invalid'::text;
    return;
  end if;
  begin
    walk_forward_end_at :=
      (plan.plan_json#>>'{windows,walk_forward,end_at}')::timestamptz;
  exception when others then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::uuid, null::text, null::jsonb, null::timestamptz,
      false, 'clock_prior_forward_decision_result_v2_plan_timing_invalid'::text;
    return;
  end;
  if statement_timestamp() < walk_forward_end_at then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::uuid, null::text, null::jsonb, null::timestamptz,
      false, 'clock_prior_forward_decision_result_window_not_complete'::text;
    return;
  end if;
  perform pg_advisory_xact_lock(hashtext(
    'clock_prior_forward_result_v2:' || p_plan_id::text));
  select * into existing
  from public.scanner_clock_prior_shadow_forward_decision_results_v2 r
  where r.plan_id = p_plan_id for update;
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
  insert into public.scanner_clock_prior_shadow_forward_decision_results_v2 (
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

create function public.read_scanner_clock_prior_shadow_forward_decision_results_v2(
  p_owner_user_id uuid, p_expected_receipt_contract_version text
)
returns table (
  readback_status text, result_id uuid, result_fingerprint text,
  owner_user_id uuid, plan_id uuid, plan_fingerprint text,
  decision_result jsonb, recorded_at timestamptz, blocker text
)
language plpgsql security definer set search_path = ''
as $$
begin
  if p_owner_user_id is null or p_expected_receipt_contract_version <>
       'scanner_clock_prior_shadow_forward_decision_receipt_v2' then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::uuid, null::text, null::jsonb, null::timestamptz,
      'clock_prior_forward_decision_result_v2_read_contract_invalid'::text;
    return;
  end if;
  if not exists (
    select 1 from public.scanner_clock_prior_shadow_forward_decision_results_v2 r
    where r.owner_user_id = p_owner_user_id
  ) then
    return query select 'not_found'::text, null::uuid, null::text,
      null::uuid, null::uuid, null::text, null::jsonb, null::timestamptz,
      'clock_prior_forward_decision_result_not_found'::text;
    return;
  end if;
  return query select 'available'::text, r.id, r.result_fingerprint,
    r.owner_user_id, r.plan_id, r.plan_fingerprint, r.decision_result,
    r.recorded_at, null::text
  from public.scanner_clock_prior_shadow_forward_decision_results_v2 r
  where r.owner_user_id = p_owner_user_id
    and r.receipt_contract_version = p_expected_receipt_contract_version
  order by r.recorded_at desc, r.id desc limit 50;
end;
$$;

revoke all on function
  public.reject_scanner_clock_prior_forward_v2_receipt_mutation()
  from public, anon, authenticated, service_role;
revoke all on function
  public.record_scanner_clock_prior_shadow_forward_decision_plan_v2(
    uuid, text, jsonb, text)
  from public, anon, authenticated;
revoke all on function
  public.read_scanner_clock_prior_shadow_forward_decision_plans_v2(uuid, text)
  from public, anon, authenticated;
revoke all on function
  public.record_scanner_clock_prior_shadow_forward_decision_result_v2(
    uuid, uuid, text, text, jsonb, text)
  from public, anon, authenticated;
revoke all on function
  public.read_scanner_clock_prior_shadow_forward_decision_results_v2(uuid, text)
  from public, anon, authenticated;
grant execute on function
  public.record_scanner_clock_prior_shadow_forward_decision_plan_v2(
    uuid, text, jsonb, text) to service_role;
grant execute on function
  public.read_scanner_clock_prior_shadow_forward_decision_plans_v2(uuid, text)
  to service_role;
grant execute on function
  public.record_scanner_clock_prior_shadow_forward_decision_result_v2(
    uuid, uuid, text, text, jsonb, text) to service_role;
grant execute on function
  public.read_scanner_clock_prior_shadow_forward_decision_results_v2(uuid, text)
  to service_role;

comment on table public.scanner_clock_prior_shadow_forward_decision_plans_v2 is
  'Immutable owner-bound IF-4 plans with a semantic policy reference. The reference freezes comparison identity, is not a quality baseline, and grants no provider, ranking, publication, promotion or broker authority.';
comment on table public.scanner_clock_prior_shadow_forward_decision_results_v2 is
  'Immutable advisory IF-4 terminal decisions. Promotion still requires the separate generic learning baseline and governed evidence gates.';

commit;
