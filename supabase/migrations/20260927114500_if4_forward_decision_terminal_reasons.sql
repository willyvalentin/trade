begin;

alter table public.scanner_clock_prior_shadow_forward_decision_results_v2
  drop constraint scanner_clock_prior_forward_result_v2_json_check;

alter table public.scanner_clock_prior_shadow_forward_decision_results_v2
  add constraint scanner_clock_prior_forward_result_v2_json_check
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
    and decision_result->'reason_codes' is not distinct from jsonb_build_array(
      case decision_result->>'decision'
        when 'continue' then 'both_partitions_clear_continue_boundary'
        when 'narrow' then
          'complete_evidence_does_not_clear_continue_or_reject_boundary'
        when 'reject' then 'at_least_one_partition_clears_reject_boundary'
      end
    )
  );

create or replace function
  public.record_scanner_clock_prior_shadow_forward_decision_result_v2(
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
  expected_reason text;
begin
  expected_reason := case p_decision_result->>'decision'
    when 'continue' then 'both_partitions_clear_continue_boundary'
    when 'narrow' then
      'complete_evidence_does_not_clear_continue_or_reject_boundary'
    when 'reject' then 'at_least_one_partition_clears_reject_boundary'
    else null
  end;
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
     or coalesce(
       p_decision_result#>>'{evidence_binding,policy_reference_fingerprint}',
       ''
     ) !~ '^[a-f0-9]{64}$'
     or p_decision_result->>'shadow_only' <> 'true'
     or p_decision_result->>'live_ranking_effect' <> 'false'
     or p_decision_result->>'publication_effect' <> 'false'
     or p_decision_result->>'causal_improvement_claimed' <> 'false'
     or p_decision_result#>>'{authority,can_change_ranking_or_publication}' <>
       'false'
     or p_decision_result#>>'{authority,can_promote_policy}' <> 'false'
     or p_decision_result#>>'{authority,can_request_provider_data}' <> 'false'
     or p_decision_result#>>'{authority,can_execute_broker_action}' <> 'false'
     or p_decision_result->'reason_codes' is distinct from
       jsonb_build_array(expected_reason)
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

revoke all on function
  public.record_scanner_clock_prior_shadow_forward_decision_result_v2(
    uuid, uuid, text, text, jsonb, text)
  from public, anon, authenticated;
grant execute on function
  public.record_scanner_clock_prior_shadow_forward_decision_result_v2(
    uuid, uuid, text, text, jsonb, text) to service_role;

comment on constraint scanner_clock_prior_forward_result_v2_json_check
  on public.scanner_clock_prior_shadow_forward_decision_results_v2 is
  'A terminal advisory decision must retain its exact server-owned decision reason; arbitrary or missing decision reasons fail closed.';

commit;
