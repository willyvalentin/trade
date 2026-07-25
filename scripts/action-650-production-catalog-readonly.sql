-- Action 650 production pre-apply catalog inspection.
-- Read-only: returns metadata, the full seven-privilege matrix, and policies.
-- Do not run this script through a write-capable migration command.

with target_tables(table_name) as (
  values
    ('recommendations'), ('positions'), ('position_updates'), ('user_settings'),
    ('scanner_cache'), ('market_calendar_cache'), ('market_regime_snapshots'),
    ('recommendation_batches'), ('recommendation_outcomes'),
    ('recommendation_scan_runs'), ('recommendation_snapshots'),
    ('scheduled_scan_runs'), ('scheduled_scan_attempts'), ('symbol_metadata'),
    ('execution_records'), ('execution_agent_runs'),
    ('execution_agent_progress_events'), ('execution_lifecycle_events'),
    ('execution_record_audit_events')
), role_matrix(role_name) as (
  values ('PUBLIC'), ('anon'), ('authenticated'), ('service_role')
), privilege_matrix(privilege_name) as (
  values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'), ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')
), matrix as (
  select
    targets.table_name,
    roles.role_name,
    privileges.privilege_name,
    case
      when roles.role_name = 'PUBLIC' then exists (
        select 1
        from pg_class classes
        cross join lateral aclexplode(coalesce(classes.relacl, acldefault('r', classes.relowner))) acl
        where classes.oid = format('public.%I', targets.table_name)::regclass
          and acl.grantee = 0
          and acl.privilege_type = privileges.privilege_name
      )
      else coalesce(
        has_table_privilege(roles.role_name, format('public.%I', targets.table_name), lower(privileges.privilege_name)),
        false
      )
    end as granted
  from target_tables targets
  cross join role_matrix roles
  cross join privilege_matrix privileges
), table_catalog as (
  select
    targets.table_name,
    pg_get_userbyid(classes.relowner) as table_owner,
    classes.relrowsecurity as rls_enabled,
    classes.relforcerowsecurity as force_rls_enabled,
    coalesce(jsonb_object_agg(
      matrix.role_name || ':' || lower(matrix.privilege_name),
      matrix.granted
    ) filter (where matrix.privilege_name is not null), '{}'::jsonb) as privilege_matrix
  from target_tables targets
  left join pg_class classes on classes.oid = format('public.%I', targets.table_name)::regclass
  left join matrix on matrix.table_name = targets.table_name
  group by targets.table_name, classes.relowner, classes.relrowsecurity, classes.relforcerowsecurity
)
select
  catalog.*,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'policy_name', policies.policyname,
        'command', policies.cmd,
        'roles', policies.roles,
        'using_expression', policies.qual,
        'with_check_expression', policies.with_check
      ) order by policies.policyname
    ) filter (where policies.policyname is not null),
    '[]'::jsonb
  ) as policies
from table_catalog catalog
left join pg_policies policies
  on policies.schemaname = 'public'
  and policies.tablename = catalog.table_name
group by
  catalog.table_name,
  catalog.table_owner,
  catalog.rls_enabled,
  catalog.force_rls_enabled,
  catalog.privilege_matrix
order by catalog.table_name;
