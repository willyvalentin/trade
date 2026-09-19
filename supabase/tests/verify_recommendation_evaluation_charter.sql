begin;

do $$
declare
  owner_id uuid := '7d2e0f9a-43db-4f62-9a78-aec2ae34c6d0';
  segment text := '["selective_policy_test_v1","engine_test_v1"]';
  policy jsonb := '{
    "recommendation_publish_policy_version":"selective_policy_test_v1",
    "canonical_evaluation_versions":{
      "engine_version":"ture_engine_test_v1",
      "scoring_version":"score_test_v1",
      "ranking_version":"ranking_test_v1",
      "setup_taxonomy_version":"setup_taxonomy_test_v1",
      "confidence_contract_version":"confidence_test_v1",
      "evaluator_version":"evaluator_test_v1",
      "provider_contract_version":"provider_test_v1",
      "git_commit":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "build_identity":"test-build-v1"
    }
  }'::jsonb;
  charter jsonb := '{
    "contract_version":"recommendation_evaluation_charter_v1",
    "hypothesis":"The declared policy improves precision without hiding no-trade decisions.",
    "eligible_universe":"US common stocks captured in the point-in-time decision record.",
    "setup_slices":["breakout"],
    "regime_slices":["risk_on"],
    "outcome_rules":{"primary_horizon":"60m","diagnostic_horizons":["15m","30m","60m"],"semantics":"One decision-bound canonical outcome after a valid entry trigger."},
    "evaluation_window":{"minimum_complete_decisions":40,"held_out_decision_count":20,"walk_forward_decision_count":20},
    "thresholds":{"minimum_precision_at_k":0.55,"minimum_expectancy_r":0.2,"maximum_calibration_error":0.15,"minimum_outcome_coverage":0.9,"maximum_missingness":0.1,"maximum_provider_credits_per_decision":1,"minimum_reliability":0.95},
    "concentration_limits":{"maximum_single_ticker_share":0.2,"maximum_single_sector_share":0.35,"maximum_single_setup_share":0.6,"maximum_single_regime_share":0.7},
    "feasibility_inputs":{"spread":"required","liquidity":"required","volatility":"required","halt_risk":"unavailable_disclosed","trigger_attainment":"required","conservative_slippage":"unavailable_disclosed"}
  }'::jsonb;
  plan jsonb;
  write_result record;
  idempotent_result record;
  different_result record;
  freeze_result record;
  mismatch_result record;
begin
  if not (select relrowsecurity from pg_class where oid = 'public.recommendation_evaluation_charters'::regclass) then
    raise exception 'evaluation charter table must enable RLS';
  end if;
  if has_table_privilege('anon', 'public.recommendation_evaluation_charters', 'select,insert,update,delete')
     or has_table_privilege('authenticated', 'public.recommendation_evaluation_charters', 'select,insert,update,delete')
     or has_table_privilege('service_role', 'public.recommendation_evaluation_charters', 'select,insert,update,delete') then
    raise exception 'evaluation charter table must remain server-only';
  end if;
  if has_function_privilege('anon', 'public.record_recommendation_evaluation_charter(text,uuid,text,jsonb,jsonb,text)', 'execute')
     or has_function_privilege('authenticated', 'public.record_recommendation_evaluation_charter(text,uuid,text,jsonb,jsonb,text)', 'execute')
     or not has_function_privilege('service_role', 'public.record_recommendation_evaluation_charter(text,uuid,text,jsonb,jsonb,text)', 'execute') then
    raise exception 'charter writer execution grants are incorrect';
  end if;

  select * into write_result
  from public.record_recommendation_evaluation_charter(
    repeat('a', 64), owner_id, segment, policy, charter,
    'recommendation_evaluation_charter_v1'
  );
  if write_result.write_status <> 'evaluation_charter_recorded' or write_result.idempotent then
    raise exception 'first charter write must create exactly one immutable receipt';
  end if;

  select * into idempotent_result
  from public.record_recommendation_evaluation_charter(
    repeat('a', 64), owner_id, segment, policy, charter,
    'recommendation_evaluation_charter_v1'
  );
  if idempotent_result.write_status <> 'evaluation_charter_already_recorded'
     or not idempotent_result.idempotent then
    raise exception 'exact charter retry must be idempotent';
  end if;

  select * into different_result
  from public.record_recommendation_evaluation_charter(
    repeat('b', 64), owner_id, segment, policy,
    jsonb_set(charter, '{hypothesis}', '"A materially different hypothesis."'::jsonb),
    'recommendation_evaluation_charter_v1'
  );
  if different_result.write_status <> 'different_evaluation_charter_already_recorded'
     or different_result.blocker <> 'different_evaluation_charter_already_recorded' then
    raise exception 'a segment charter must never be replaced';
  end if;

  insert into public.recommendation_scan_runs (run_fingerprint, owner_user_id)
  values ('scan-fingerprint-one', owner_id);
  plan := jsonb_build_object(
    'contract_version', 'recommendation_learning_evaluation_plan_v1',
    'status', 'ready_for_explicit_freeze',
    'segment_key', segment,
    'policy_attribution', policy,
    'decision_records', jsonb_build_object(
      'scan_run_fingerprints', jsonb_build_array('scan-fingerprint-one'),
      'count', 1
    ),
    'metrics', '{}'::jsonb
  );
  select * into freeze_result
  from public.freeze_recommendation_learning_baseline_with_charter(
    repeat('c', 64), owner_id, segment, array['scan-fingerprint-one'], plan,
    repeat('a', 64), 'recommendation_learning_baseline_freeze_v1'
  );
  if freeze_result.freeze_status <> 'baseline_frozen'
     or freeze_result.evaluation_charter_fingerprint <> repeat('a', 64) then
    raise exception 'baseline must durably bind its matching charter';
  end if;

  select * into mismatch_result
  from public.freeze_recommendation_learning_baseline_with_charter(
    repeat('d', 64), owner_id,
    '["different-policy","engine_test_v1"]', array['scan-fingerprint-one'],
    jsonb_set(
      plan,
      '{segment_key}',
      to_jsonb('["different-policy","engine_test_v1"]'::text)
    ),
    repeat('a', 64), 'recommendation_learning_baseline_freeze_v1'
  );
  if mismatch_result.freeze_status <> 'unavailable'
     or mismatch_result.blocker <> 'baseline_freeze_evaluation_charter_missing_or_mismatched' then
    raise exception 'baseline must reject an absent or mismatched charter';
  end if;
end;
$$;

rollback;
