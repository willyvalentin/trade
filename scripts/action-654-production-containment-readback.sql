-- Action 654 read-only post-apply verification for Action 650.
-- Returns exactly one status value. It reads only catalog and migration history.
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
), required_privileges(privilege_name) as (
  values ('select'), ('insert'), ('update'), ('delete')
), denied_privileges(privilege_name) as (
  values ('truncate'), ('references'), ('trigger')
), history_ok as (
  select exists (
    select 1 from supabase_migrations.schema_migrations
    where version = '20260724002000'
      and name = 'contain_production_trading_data_access'
      and cardinality(statements) = 6
  ) as ok
), tables_ok as (
  select count(*) = 19
    and bool_and(to_regclass(format('public.%I', table_name)) is not null)
    and bool_and((select relrowsecurity from pg_class where oid = format('public.%I', table_name)::regclass))
  as ok
  from target_tables
), policies_ok as (
  select not exists (
    select 1 from target_tables targets
    join pg_policies policies
      on policies.schemaname = 'public' and policies.tablename = targets.table_name
  ) as ok
), denied_ok as (
  select not exists (
    select 1
    from target_tables targets
    cross join (values ('anon'), ('authenticated')) roles(role_name)
    cross join (select privilege_name from required_privileges union all select privilege_name from denied_privileges) privileges
    where has_table_privilege(roles.role_name, format('public.%I', targets.table_name), privileges.privilege_name)
  ) and not exists (
    select 1
    from target_tables targets
    join pg_class classes on classes.oid = format('public.%I', targets.table_name)::regclass
    cross join (select privilege_name from required_privileges union all select privilege_name from denied_privileges) privileges
    cross join lateral aclexplode(coalesce(classes.relacl, acldefault('r', classes.relowner))) acl
    where acl.grantee = 0 and acl.privilege_type = upper(privileges.privilege_name)
  ) as ok
), service_role_ok as (
  select not exists (
    select 1 from target_tables targets cross join required_privileges privileges
    where not has_table_privilege('service_role', format('public.%I', targets.table_name), privileges.privilege_name)
  ) and not exists (
    select 1 from target_tables targets cross join denied_privileges privileges
    where has_table_privilege('service_role', format('public.%I', targets.table_name), privileges.privilege_name)
  ) as ok
), function_trigger_ok as (
  select
    to_regprocedure('public.action_650_reject_execution_audit_mutation()') is not null
    and (select count(*) from pg_trigger triggers join pg_class classes on classes.oid = triggers.tgrelid join pg_namespace namespaces on namespaces.oid = classes.relnamespace where namespaces.nspname = 'public' and classes.relname in ('execution_record_audit_events', 'execution_lifecycle_events', 'execution_agent_progress_events') and triggers.tgname = 'action_650_append_only' and not triggers.tgisinternal and triggers.tgenabled = 'O') = 3
  as ok
), action_652_ok as (
  select exists (select 1 from pg_proc where oid = to_regprocedure('public.app_open_position_transaction(uuid,text,text,numeric,numeric,numeric,numeric,numeric,jsonb,text)'))
    and exists (select 1 from pg_proc where oid = to_regprocedure('public.app_login_abuse_reserve(text)'))
    and exists (select 1 from pg_proc where oid = to_regprocedure('public.app_login_abuse_finalize_success(text)'))
  as ok
), forbidden_ok as (
  select not exists (
    select 1 from supabase_migrations.schema_migrations
    where version in ('20260708000000', '20260708001000', '20260710000000')
  ) as ok
)
select case
  when not (select ok from history_ok) then 'blocked_by_history_contract'
  when not (select ok from tables_ok) then 'blocked_by_table_or_rls_contract'
  when not (select ok from policies_ok) then 'blocked_by_policy_contract'
  when not (select ok from denied_ok) then 'blocked_by_browser_role_privilege_contract'
  when not (select ok from service_role_ok) then 'blocked_by_service_role_privilege_contract'
  when not (select ok from function_trigger_ok) then 'blocked_by_append_only_contract'
  when not (select ok from action_652_ok) then 'blocked_by_action_652_contract'
  when not (select ok from forbidden_ok) then 'blocked_by_forbidden_migration'
  else 'action_650_containment_verified'
end as status;
