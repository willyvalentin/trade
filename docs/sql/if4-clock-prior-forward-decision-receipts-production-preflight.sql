-- Read-only production preflight for the exact additive IF-4 clock-prior
-- forward-plan/result migration. Run before applying the migration.
begin read only;

select
  to_regclass('public.recommendation_evaluation_charters') as charter_relation,
  to_regclass('public.recommendation_learning_baseline_freezes') as baseline_relation,
  to_regclass('public.scanner_clock_prior_shadow_forward_decision_plans') as existing_plan_relation,
  to_regclass('public.scanner_clock_prior_shadow_forward_decision_results') as existing_result_relation;

select
  to_regprocedure('public.record_scanner_clock_prior_shadow_forward_decision_plan(uuid,text,jsonb,text)') as existing_plan_writer,
  to_regprocedure('public.read_scanner_clock_prior_shadow_forward_decision_plans(uuid,text)') as existing_plan_reader,
  to_regprocedure('public.record_scanner_clock_prior_shadow_forward_decision_result(uuid,uuid,text,text,jsonb,text)') as existing_result_writer,
  to_regprocedure('public.read_scanner_clock_prior_shadow_forward_decision_results(uuid,text)') as existing_result_reader;

select version, name
from supabase_migrations.schema_migrations
where version = '20260927041020';

rollback;
