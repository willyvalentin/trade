-- IF-4 durable-learning baseline freeze production preflight.
--
-- This is one read-only transaction. It returns one aggregate JSON object and
-- never reads application-row contents or identifiers. Apply the reviewed
-- migration only when every required prerequisite is true and every target
-- object is absent; a partial prior application is deliberately ineligible.
begin read only;

with
  freeze_rpc as (
    select procedure.oid
    from pg_catalog.pg_proc as procedure
    where procedure.oid = to_regprocedure(
      'public.freeze_recommendation_learning_baseline(text,uuid,text,text[],jsonb,text)'
    )
  ),
  read_rpc as (
    select procedure.oid
    from pg_catalog.pg_proc as procedure
    where procedure.oid = to_regprocedure(
      'public.read_recommendation_learning_baseline_freeze(uuid,text)'
    )
  ),
  scan_run_columns as (
    select
      count(*) filter (
        where column_name = 'owner_user_id'
          and data_type = 'uuid'
          and is_nullable = 'NO'
      ) = 1 as owner_user_id_present,
      count(*) filter (where column_name = 'run_fingerprint') = 1
        as run_fingerprint_present
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'recommendation_scan_runs'
  )
select jsonb_build_object(
  'baseline_table_absent',
    to_regclass('public.recommendation_learning_baseline_freezes') is null,
  'baseline_owner_index_absent',
    to_regclass('public.recommendation_learning_baseline_freezes_owner_frozen_idx') is null,
  'freeze_rpc_absent', not exists(select 1 from freeze_rpc),
  'read_rpc_absent', not exists(select 1 from read_rpc),
  'scan_runs_exists', to_regclass('public.recommendation_scan_runs') is not null,
  'scan_runs_owner_user_id_present',
    coalesce((select owner_user_id_present from scan_run_columns), false),
  'scan_runs_fingerprint_present',
    coalesce((select run_fingerprint_present from scan_run_columns), false),
  'gen_random_uuid_available', to_regprocedure('gen_random_uuid()') is not null,
  'service_role_exists', to_regrole('service_role') is not null,
  'anon_exists', to_regrole('anon') is not null,
  'authenticated_exists', to_regrole('authenticated') is not null,
  'eligible_for_exact_additive_apply', (
    to_regclass('public.recommendation_learning_baseline_freezes') is null
    and to_regclass('public.recommendation_learning_baseline_freezes_owner_frozen_idx') is null
    and not exists(select 1 from freeze_rpc)
    and not exists(select 1 from read_rpc)
    and to_regclass('public.recommendation_scan_runs') is not null
    and coalesce((select owner_user_id_present from scan_run_columns), false)
    and coalesce((select run_fingerprint_present from scan_run_columns), false)
    and to_regprocedure('gen_random_uuid()') is not null
    and to_regrole('service_role') is not null
    and to_regrole('anon') is not null
    and to_regrole('authenticated') is not null
  )
) as aggregate_preflight;

rollback;
