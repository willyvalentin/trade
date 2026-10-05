-- Exact publication-policy successor for the existing prospective freeze.
-- Preserve every owner, authority, immutable-row, charter and clock guard.
-- No existing plan, source, model, result or fingerprint is updated.
-- One short transactional function/ACL replacement; no table scan or rewrite.
-- Failure rolls back the whole migration. The isolated upgrade proof verifies
-- predecessor-body restoration and reapplication without changing stored rows.
-- Keep scheduling inert during release; never rewrite a plan as recovery.
begin;
create or replace function public.freeze_relative_plan_prospective_comparison_v1(
  p_owner_user_id uuid, p_plan jsonb, p_expected_contract_version text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  stored public.relative_plan_prospective_comparisons%rowtype;
  authoritative_time timestamptz;
  training_start timestamptz; training_end timestamptz;
  held_start timestamptz; held_end timestamptz;
  forward_start timestamptz; forward_end timestamptz;
begin
  if p_owner_user_id is null or p_expected_contract_version is distinct from 'relative_plan_prospective_freeze_receipt_v1'
    or coalesce(jsonb_typeof(p_plan), '') <> 'object' or pg_column_size(p_plan) > 65536
    or p_plan->>'owner_user_id' is distinct from p_owner_user_id::text
    or p_plan->>'contract_version' is distinct from 'relative_plan_prospective_comparison_v1'
    or p_plan->>'model_version' is distinct from 'relative_plan_context_shadow_v1'
    or p_plan->>'reproduction_basis' is distinct from 'retained_normalized_inputs_and_original_geometry_only'
    or p_plan->>'upstream_provider_version' is distinct from 'unavailable_disclosed'
    or coalesce(p_plan->>'plan_fingerprint', '') !~ '^[a-f0-9]{64}$'
    or coalesce(p_plan->>'model_fingerprint', '') !~ '^[a-f0-9]{64}$'
    or coalesce(p_plan->>'charter_fingerprint', '') !~ '^[a-f0-9]{64}$'
    or p_plan->>'model_fingerprint' is distinct from 'd125f6eb25b2ded614cd98c682c6952ad95e3123e51fd350b45f4790e8e0be82'
    or p_plan->>'charter_fingerprint' is distinct from 'd125599f6f20e8bf3044b5def75b6d19666b058659c62f749d0ef91463f8a035'
    or coalesce(p_plan#>>'{source_revision,commit_ref}', '') !~ '^[a-f0-9]{40}$'
    or coalesce(p_plan#>>'{source_revision,deploy_id}', '') !~ '^[a-f0-9]{24}$'
    or coalesce(p_plan#>>'{source_revision,build_identity}', '') not in (
      'action_148_publish_path_v1:selective_top_3_strong_valid_v3_preserve_explicit_no_trade:selective_top_3_v3_2026_09_17',
      'action_148_publish_path_v1:selective_top_3_strong_valid_v4_preserve_no_trade_original_plan:selective_top_3_v4_2026_10_05'
    )
    or p_plan->'authority' is distinct from '{"collection":false,"provider":false,"ranking":false,"publication":false,"promotion":false,"broker":false}'::jsonb
    or p_plan->'comparison' is distinct from '{"minimum_precision_lift":0.03,"reject_maximum_precision_lift":0}'::jsonb
    or p_plan#>'{charter,thresholds}' is distinct from '{"minimum_precision_at_k":0.55,"minimum_expectancy_r":0.2,"maximum_calibration_error":0.15,"minimum_outcome_coverage":0.9,"maximum_missingness":0.1,"maximum_provider_credits_per_decision":8,"minimum_reliability":0.95}'::jsonb
    or p_plan#>'{charter,evaluation_window}' is distinct from '{"minimum_complete_decisions":60,"held_out_decision_count":30,"walk_forward_decision_count":30}'::jsonb
    or p_plan#>'{charter,concentration_limits}' is distinct from '{"maximum_single_ticker_share":0.2,"maximum_single_sector_share":0.35,"maximum_single_setup_share":0.6,"maximum_single_regime_share":0.7}'::jsonb
    or p_plan#>'{charter,feasibility_inputs}' is distinct from '{"spread":"unavailable_disclosed","liquidity":"required","volatility":"required","halt_risk":"unavailable_disclosed","trigger_attainment":"required","conservative_slippage":"unavailable_disclosed"}'::jsonb
    or p_plan#>>'{charter,outcome_rules,primary_horizon}' is distinct from '60m'
    or p_plan#>>'{enrollment,eligibility_basis}' is distinct from 'original_complete_assessed_point_in_time_population_before_outcomes'
    or p_plan#>>'{enrollment,missing_outcomes}' is distinct from 'retained_in_enrolled_denominator'
    or p_plan#>>'{enrollment,primary_k}' is distinct from '3'
    or p_plan#>>'{enrollment,held_out_decisions}' is distinct from '30'
    or p_plan#>>'{enrollment,walk_forward_decisions}' is distinct from '30' then
    return jsonb_build_object('status', 'unavailable', 'receipt', null);
  end if;
  if (select count(*) from jsonb_object_keys(p_plan)) <> 15
    or jsonb_typeof(p_plan->'source_revision') is distinct from 'object'
    or (select count(*) from jsonb_object_keys(p_plan->'source_revision')) <> 3
    or not ((p_plan->'source_revision') ?& array['commit_ref','build_identity','deploy_id'])
    or not (p_plan ?& array['owner_user_id','source_revision','windows','contract_version','plan_fingerprint',
      'model_version','model_fingerprint','charter','charter_fingerprint','reproduction_basis','upstream_provider_version',
      'enrollment','calibration','comparison','authority'])
    or p_plan->'enrollment' is distinct from '{"contract_version":"relative_plan_decision_time_enrollment_v1","primary_k":3,"held_out_decisions":30,"walk_forward_decisions":30,"ordering":"decision_timestamp_then_run_fingerprint","eligibility_basis":"original_complete_assessed_point_in_time_population_before_outcomes","missing_outcomes":"retained_in_enrolled_denominator","historical_decisions":"excluded_not_retroactively_admitted","overflow":"retained_diagnostic_not_reselected_after_outcomes"}'::jsonb
    or p_plan->'calibration' is distinct from '{"policy_version":"fixed_score_bucket_beta_binomial_v1","minimum_sample":30,"minimum_bucket_sample":10,"fitting_basis":"training_decisions_and_mature_outcomes_before_held_out_start","ordinal_scores_are_probabilities":false}'::jsonb
    or exists (
      select 1 from (values ('training'), ('held_out'), ('walk_forward')) as partition(name)
      cross join (values ('start_at'), ('end_at')) as boundary(name)
      where coalesce(p_plan#>>array['windows', partition.name, boundary.name], '') !~
        '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[.][0-9]{3}Z$'
    ) then return jsonb_build_object('status', 'unavailable', 'receipt', null); end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('relative_plan_prospective_v1:' || p_owner_user_id::text, 0));
  select * into stored from public.relative_plan_prospective_comparisons
    where owner_user_id = p_owner_user_id and model_version = 'relative_plan_context_shadow_v1' for update;
  if found then
    if stored.plan_json is distinct from p_plan then
      return jsonb_build_object('status', 'conflicting', 'receipt', null);
    end if;
    return public.read_relative_plan_prospective_comparison_v1(p_owner_user_id, p_expected_contract_version)
      || jsonb_build_object('status', 'already_frozen');
  end if;
  -- The database, not a supplied request clock, defines the prospective boundary.
  authoritative_time := clock_timestamp();
  begin
    training_start := (p_plan#>>'{windows,training,start_at}')::timestamptz;
    training_end := (p_plan#>>'{windows,training,end_at}')::timestamptz;
    held_start := (p_plan#>>'{windows,held_out,start_at}')::timestamptz;
    held_end := (p_plan#>>'{windows,held_out,end_at}')::timestamptz;
    forward_start := (p_plan#>>'{windows,walk_forward,start_at}')::timestamptz;
    forward_end := (p_plan#>>'{windows,walk_forward,end_at}')::timestamptz;
  exception when invalid_datetime_format or datetime_field_overflow then
    return jsonb_build_object('status', 'unavailable', 'receipt', null);
  end;
  if training_start is null or training_end is null or held_start is null or held_end is null
    or forward_start is null or forward_end is null or training_start <= authoritative_time
    or training_start >= training_end or held_start >= held_end or forward_start >= forward_end
    or training_end + interval '60 minutes' > held_start or held_end + interval '60 minutes' > forward_start
    or forward_end - authoritative_time > interval '180 days' then
    return jsonb_build_object('status', 'unavailable', 'receipt', null);
  end if;
  insert into public.relative_plan_prospective_comparisons (owner_user_id, model_version, plan_fingerprint, plan_json, frozen_at)
    values (p_owner_user_id, p_plan->>'model_version', p_plan->>'plan_fingerprint', p_plan, authoritative_time);
  return public.read_relative_plan_prospective_comparison_v1(p_owner_user_id, p_expected_contract_version)
    || jsonb_build_object('status', 'frozen');
end;
$$;
revoke all on function public.freeze_relative_plan_prospective_comparison_v1(uuid, jsonb, text) from public, anon, authenticated, service_role;
grant execute on function public.freeze_relative_plan_prospective_comparison_v1(uuid, jsonb, text) to service_role;
notify pgrst, 'reload schema';
commit;
