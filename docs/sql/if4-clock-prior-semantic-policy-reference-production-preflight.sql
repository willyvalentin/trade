-- Read-only preflight for the additive IF-4 clock-prior semantic policy
-- reference and v2 forward-plan/result receipt migration.
begin read only;

select
  to_regclass('public.recommendation_evaluation_charters') as charter_relation,
  to_regclass('public.scanner_clock_prior_shadow_forward_decision_plans_v2')
    as existing_v2_plan_relation,
  to_regclass('public.scanner_clock_prior_shadow_forward_decision_results_v2')
    as existing_v2_result_relation;

select
  to_regprocedure(
    'public.record_scanner_clock_prior_shadow_forward_decision_plan_v2(uuid,text,jsonb,text)'
  ) as existing_v2_plan_writer,
  to_regprocedure(
    'public.read_scanner_clock_prior_shadow_forward_decision_plans_v2(uuid,text)'
  ) as existing_v2_plan_reader,
  to_regprocedure(
    'public.record_scanner_clock_prior_shadow_forward_decision_result_v2(uuid,uuid,text,text,jsonb,text)'
  ) as existing_v2_result_writer,
  to_regprocedure(
    'public.read_scanner_clock_prior_shadow_forward_decision_results_v2(uuid,text)'
  ) as existing_v2_result_reader;

select version, name
from supabase_migrations.schema_migrations
where version = '20260927090000';

rollback;
