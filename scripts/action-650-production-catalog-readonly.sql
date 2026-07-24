-- Action 650 production pre-apply catalog inspection.
-- Read-only: returns metadata, privileges, and policy expressions only.
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
), table_catalog as (
  select
    targets.table_name,
    pg_get_userbyid(classes.relowner) as table_owner,
    classes.relrowsecurity as rls_enabled,
    classes.relforcerowsecurity as force_rls_enabled,
    exists (
      select 1
      from aclexplode(coalesce(classes.relacl, acldefault('r', classes.relowner))) acl
      where acl.grantee = 0
        and acl.privilege_type = 'SELECT'
    ) as public_select,
    coalesce(has_table_privilege('anon', classes.oid, 'select'), false) as anon_select,
    coalesce(has_table_privilege('anon', classes.oid, 'insert'), false) as anon_insert,
    coalesce(has_table_privilege('anon', classes.oid, 'update'), false) as anon_update,
    coalesce(has_table_privilege('anon', classes.oid, 'delete'), false) as anon_delete,
    coalesce(has_table_privilege('authenticated', classes.oid, 'select'), false) as authenticated_select,
    coalesce(has_table_privilege('authenticated', classes.oid, 'insert'), false) as authenticated_insert,
    coalesce(has_table_privilege('authenticated', classes.oid, 'update'), false) as authenticated_update,
    coalesce(has_table_privilege('authenticated', classes.oid, 'delete'), false) as authenticated_delete,
    coalesce(has_table_privilege('service_role', classes.oid, 'select'), false) as service_role_select,
    coalesce(has_table_privilege('service_role', classes.oid, 'insert'), false) as service_role_insert,
    coalesce(has_table_privilege('service_role', classes.oid, 'update'), false) as service_role_update,
    coalesce(has_table_privilege('service_role', classes.oid, 'delete'), false) as service_role_delete
  from target_tables targets
  left join pg_class classes
    on classes.oid = format('public.%I', targets.table_name)::regclass
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
  catalog.public_select,
  catalog.anon_select,
  catalog.anon_insert,
  catalog.anon_update,
  catalog.anon_delete,
  catalog.authenticated_select,
  catalog.authenticated_insert,
  catalog.authenticated_update,
  catalog.authenticated_delete,
  catalog.service_role_select,
  catalog.service_role_insert,
  catalog.service_role_update,
  catalog.service_role_delete
order by catalog.table_name;
