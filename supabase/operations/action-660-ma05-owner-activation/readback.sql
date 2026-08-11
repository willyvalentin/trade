-- READ-ONLY production readback. Edit only the UUID value below.

with operator_input as (
  select 'REPLACE_WITH_EXPLICITLY_CONFIRMED_AUTH_USER_UUID'::uuid as owner_user_id
), table_state as (
  select 'recommendations' as table_name, count(*)::bigint as row_count,
    count(*) filter (where record.owner_user_id is null)::bigint as null_owner_count,
    count(*) filter (where record.owner_user_id <> input.owner_user_id)::bigint as foreign_owner_count
  from public.recommendations record cross join operator_input input
  union all select 'positions', count(*)::bigint,
    count(*) filter (where record.owner_user_id is null)::bigint,
    count(*) filter (where record.owner_user_id <> input.owner_user_id)::bigint
  from public.positions record cross join operator_input input
  union all select 'position_updates', count(*)::bigint,
    count(*) filter (where record.owner_user_id is null)::bigint,
    count(*) filter (where record.owner_user_id <> input.owner_user_id)::bigint
  from public.position_updates record cross join operator_input input
  union all select 'user_settings', count(*)::bigint,
    count(*) filter (where record.owner_user_id is null)::bigint,
    count(*) filter (where record.owner_user_id <> input.owner_user_id)::bigint
  from public.user_settings record cross join operator_input input
  union all select 'recommendation_snapshots', count(*)::bigint,
    count(*) filter (where record.owner_user_id is null)::bigint,
    count(*) filter (where record.owner_user_id <> input.owner_user_id)::bigint
  from public.recommendation_snapshots record cross join operator_input input
  union all select 'recommendation_scan_runs', count(*)::bigint,
    count(*) filter (where record.owner_user_id is null)::bigint,
    count(*) filter (where record.owner_user_id <> input.owner_user_id)::bigint
  from public.recommendation_scan_runs record cross join operator_input input
  union all select 'recommendation_batches', count(*)::bigint,
    count(*) filter (where record.owner_user_id is null)::bigint,
    count(*) filter (where record.owner_user_id <> input.owner_user_id)::bigint
  from public.recommendation_batches record cross join operator_input input
  union all select 'recommendation_outcomes', count(*)::bigint,
    count(*) filter (where record.owner_user_id is null)::bigint,
    count(*) filter (where record.owner_user_id <> input.owner_user_id)::bigint
  from public.recommendation_outcomes record cross join operator_input input
  union all select 'execution_records', count(*)::bigint,
    count(*) filter (where record.user_id is null)::bigint,
    count(*) filter (where record.user_id <> input.owner_user_id)::bigint
  from public.execution_records record cross join operator_input input
)
select
  table_name,
  row_count,
  null_owner_count,
  foreign_owner_count,
  null_owner_count = 0 and foreign_owner_count = 0 as owner_data_valid
from table_state
order by table_name;

with expected_columns(relation_oid, column_name) as (values
  ('public.recommendations'::regclass, 'owner_user_id'),
  ('public.positions'::regclass, 'owner_user_id'),
  ('public.position_updates'::regclass, 'owner_user_id'),
  ('public.user_settings'::regclass, 'owner_user_id'),
  ('public.recommendation_snapshots'::regclass, 'owner_user_id'),
  ('public.recommendation_scan_runs'::regclass, 'owner_user_id'),
  ('public.recommendation_batches'::regclass, 'owner_user_id'),
  ('public.recommendation_outcomes'::regclass, 'owner_user_id'),
  ('public.execution_records'::regclass, 'user_id')
)
select
  relation_oid::regclass::text as table_name,
  column_name,
  attribute_record.attnotnull as physical_not_null,
  class_record.relrowsecurity as rls_enabled,
  not has_table_privilege('anon', relation_oid, 'select') as anon_select_revoked,
  not has_table_privilege('authenticated', relation_oid, 'select')
    as authenticated_select_revoked
from expected_columns
join pg_attribute attribute_record
  on attribute_record.attrelid = relation_oid
 and attribute_record.attname = column_name
 and not attribute_record.attisdropped
join pg_class class_record on class_record.oid = relation_oid
order by table_name;

with expected_constraints(relation_oid, constraint_name) as (values
  ('public.recommendations'::regclass, 'recommendations_owner_user_id_fkey'),
  ('public.positions'::regclass, 'positions_owner_user_id_fkey'),
  ('public.position_updates'::regclass, 'position_updates_owner_user_id_fkey'),
  ('public.user_settings'::regclass, 'user_settings_owner_user_id_fkey'),
  ('public.recommendation_snapshots'::regclass, 'recommendation_snapshots_owner_user_id_fkey'),
  ('public.recommendation_scan_runs'::regclass, 'recommendation_scan_runs_owner_user_id_fkey'),
  ('public.recommendation_batches'::regclass, 'recommendation_batches_owner_user_id_fkey'),
  ('public.recommendation_outcomes'::regclass, 'recommendation_outcomes_owner_user_id_fkey'),
  ('public.execution_records'::regclass, 'execution_records_user_id_fkey'),
  ('public.recommendations'::regclass, 'recommendations_owner_required_check'),
  ('public.positions'::regclass, 'positions_owner_required_check'),
  ('public.position_updates'::regclass, 'position_updates_owner_required_check'),
  ('public.user_settings'::regclass, 'user_settings_owner_required_check'),
  ('public.recommendation_snapshots'::regclass, 'recommendation_snapshots_owner_required_check'),
  ('public.recommendation_scan_runs'::regclass, 'recommendation_scan_runs_owner_required_check'),
  ('public.recommendation_batches'::regclass, 'recommendation_batches_owner_required_check'),
  ('public.recommendation_outcomes'::regclass, 'recommendation_outcomes_owner_required_check'),
  ('public.execution_records'::regclass, 'execution_records_user_required_check'),
  ('public.positions'::regclass, 'positions_recommendation_owner_fkey'),
  ('public.position_updates'::regclass, 'position_updates_position_owner_fkey')
)
select
  expected.relation_oid::regclass::text as table_name,
  expected.constraint_name,
  constraint_record.oid is not null as constraint_exists,
  coalesce(constraint_record.convalidated, false) as constraint_validated
from expected_constraints expected
left join pg_constraint constraint_record
  on constraint_record.conrelid = expected.relation_oid
 and constraint_record.conname = expected.constraint_name
order by table_name, constraint_name;

select
  not exists (
    select 1
    from pg_proc procedure_record
    cross join lateral aclexplode(
      coalesce(
        procedure_record.proacl,
        acldefault('f', procedure_record.proowner)
      )
    ) privilege_record
    where procedure_record.oid = to_regprocedure(
      'public.app_open_owned_position_transaction(uuid,uuid,text,text,numeric,numeric,numeric,numeric,numeric,jsonb,text)'
    )
      and privilege_record.grantee = 0
      and privilege_record.privilege_type = 'EXECUTE'
  ) as public_rpc_execute_revoked,
  not has_function_privilege(
    'anon',
    'public.app_open_owned_position_transaction(uuid,uuid,text,text,numeric,numeric,numeric,numeric,numeric,jsonb,text)',
    'execute'
  ) as anon_rpc_execute_revoked,
  not has_function_privilege(
    'authenticated',
    'public.app_open_owned_position_transaction(uuid,uuid,text,text,numeric,numeric,numeric,numeric,numeric,jsonb,text)',
    'execute'
  ) as authenticated_rpc_execute_revoked,
  has_function_privilege(
    'service_role',
    'public.app_open_owned_position_transaction(uuid,uuid,text,text,numeric,numeric,numeric,numeric,numeric,jsonb,text)',
    'execute'
  ) as service_role_rpc_execute_granted;
