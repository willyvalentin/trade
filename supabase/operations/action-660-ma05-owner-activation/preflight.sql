-- READ-ONLY production preflight. Edit only the two values below.
-- The invalid UUID placeholder makes an unedited run fail closed.

with operator_input as (
  select
    'REPLACE_WITH_EXPLICITLY_CONFIRMED_AUTH_USER_UUID'::uuid as owner_user_id,
    false::boolean as writers_paused
), readiness as (
  select
    input.writers_paused,
    (select count(*) = 1 from auth.users where id = input.owner_user_id)
      as exact_auth_user_exists,
    to_regclass('public.recommendations') is not null
      and to_regclass('public.positions') is not null
      and to_regclass('public.position_updates') is not null
      and to_regclass('public.user_settings') is not null
      and to_regclass('public.recommendation_snapshots') is not null
      and to_regclass('public.recommendation_scan_runs') is not null
      and to_regclass('public.recommendation_batches') is not null
      and to_regclass('public.recommendation_outcomes') is not null
      and to_regclass('public.execution_records') is not null
      as all_target_tables_exist
  from operator_input input
)
select
  writers_paused and exact_auth_user_exists and all_target_tables_exist
    as ready_for_migration,
  writers_paused,
  exact_auth_user_exists,
  all_target_tables_exist
from readiness;

select 'recommendations' as table_name, count(*)::bigint as row_count from public.recommendations
union all select 'positions', count(*)::bigint from public.positions
union all select 'position_updates', count(*)::bigint from public.position_updates
union all select 'user_settings', count(*)::bigint from public.user_settings
union all select 'recommendation_snapshots', count(*)::bigint from public.recommendation_snapshots
union all select 'recommendation_scan_runs', count(*)::bigint from public.recommendation_scan_runs
union all select 'recommendation_batches', count(*)::bigint from public.recommendation_batches
union all select 'recommendation_outcomes', count(*)::bigint from public.recommendation_outcomes
union all select 'execution_records', count(*)::bigint from public.execution_records
order by table_name;
