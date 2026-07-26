-- Action 661B incident-only readback for the 19 Action 650 containment targets.
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
), runtime_roles(role_oid) as (
  select oid from pg_roles where rolname in ('anon', 'authenticated', 'service_role')
), history_state as (
  select
    exists (select 1 from supabase_migrations.schema_migrations where version = '20260724002000' and name = 'contain_production_trading_data_access' and cardinality(statements) = 6) as containment,
    exists (select 1 from supabase_migrations.schema_migrations where version = '20260724003000' and name = 'repair_contained_trading_data_access_acl_rls' and cardinality(statements) = 1) as recovery
), table_state as (
  select count(*) = 19
    and bool_and(to_regclass(format('public.%I', table_name)) is not null)
    and bool_and((select relkind from pg_class where oid = format('public.%I', table_name)::regclass) = 'r')
    and bool_and((select pg_get_userbyid(relowner) from pg_class where oid = format('public.%I', table_name)::regclass) = 'postgres')
  as ok from target_tables
), target_relation_scope_state as (
  select count(*) = 19
    and bool_and(to_regclass(format('public.%I', table_name)) is not null)
    and bool_and((select relkind from pg_class where oid = format('public.%I', table_name)::regclass) = 'r')
    and bool_and((select pg_get_userbyid(relowner) from pg_class where oid = format('public.%I', table_name)::regclass) = 'postgres')
  as ok from target_tables
), unknown_acl_state as (
  select not exists (
    select 1
    from target_tables targets
    join pg_class classes on classes.oid = format('public.%I', targets.table_name)::regclass
    cross join lateral aclexplode(coalesce(classes.relacl, acldefault('r', classes.relowner))) acl
    where acl.grantee <> 0
      and acl.grantee <> classes.relowner
      and acl.grantee not in (select role_oid from runtime_roles)
    union all
    select 1
    from target_tables targets
    join pg_class classes on classes.oid = format('public.%I', targets.table_name)::regclass
    join pg_attribute attributes on attributes.attrelid = classes.oid
    cross join lateral aclexplode(attributes.attacl) acl
    where attributes.attnum > 0
      and not attributes.attisdropped
      and acl.grantee <> 0
      and acl.grantee <> classes.relowner
      and acl.grantee not in (select role_oid from runtime_roles)
  ) as ok
), platform_membership_state as (
  select not exists (
    select 1
    from pg_auth_members memberships
    join pg_roles member_role on member_role.oid = memberships.member
    join pg_roles runtime_role on runtime_role.oid = memberships.roleid
    where memberships.roleid in (select role_oid from runtime_roles)
      and not (
        member_role.rolname = 'authenticator'
        and runtime_role.rolname in ('anon', 'authenticated', 'service_role')
        and not memberships.inherit_option
        and memberships.set_option
        and not memberships.admin_option
      )
      and not (
        member_role.rolname = 'postgres'
        and runtime_role.rolname in ('anon', 'authenticated', 'service_role')
        and memberships.inherit_option
        and memberships.set_option
        and memberships.admin_option
      )
  ) as ok
), direct_column_acl_state as (
  select not exists (
    select 1
    from target_tables targets
    join pg_class classes on classes.oid = format('public.%I', targets.table_name)::regclass
    join pg_attribute attributes on attributes.attrelid = classes.oid
    cross join lateral aclexplode(attributes.attacl) acl
    where attributes.attnum > 0
      and not attributes.attisdropped
      and acl.grantee <> classes.relowner
  ) as ok
), policies_state as (
  select not exists (select 1 from target_tables targets join pg_policies policies on policies.schemaname = 'public' and policies.tablename = targets.table_name) as ok
), contained_state as (
  select not exists (
    select 1 from target_tables targets
    where not (select relrowsecurity from pg_class where oid = format('public.%I', targets.table_name)::regclass)
      or exists (select 1 from pg_class classes cross join lateral aclexplode(coalesce(classes.relacl, acldefault('r', classes.relowner))) acl where classes.oid = format('public.%I', targets.table_name)::regclass and acl.grantee = 0)
      or exists (select 1 from required_privileges privileges where has_table_privilege('anon', format('public.%I', targets.table_name), privileges.privilege_name) or has_table_privilege('authenticated', format('public.%I', targets.table_name), privileges.privilege_name) or not has_table_privilege('service_role', format('public.%I', targets.table_name), privileges.privilege_name))
      or exists (select 1 from denied_privileges privileges where has_table_privilege('anon', format('public.%I', targets.table_name), privileges.privilege_name) or has_table_privilege('authenticated', format('public.%I', targets.table_name), privileges.privilege_name) or has_table_privilege('service_role', format('public.%I', targets.table_name), privileges.privilege_name))
  ) as ok
), expected_append_only_body(body) as (
  values ($action_650_body$
begin
  raise exception 'Action 650 append-only containment rejects % on %.%', tg_op, tg_table_schema, tg_table_name
    using errcode = '55000';
end;
$action_650_body$)
), append_only_function_state as (
  select exists (
    select 1 from pg_proc procs join pg_namespace namespaces on namespaces.oid = procs.pronamespace
    where procs.oid = to_regprocedure('public.action_650_reject_execution_audit_mutation()')
      and namespaces.nspname = 'public'
      and pg_get_function_identity_arguments(procs.oid) = ''
      and pg_get_userbyid(procs.proowner) = 'postgres'
      and procs.prolang = (select oid from pg_language where lanname = 'plpgsql')
      and procs.prorettype = 'trigger'::regtype
      and not procs.prosecdef
      and procs.provolatile = 'v'
      and not procs.proisstrict
      and procs.proparallel = 'u'
      and procs.proconfig = array['search_path=pg_catalog']
      and regexp_replace(procs.prosrc, '[[:space:]]+', '', 'g') = (select regexp_replace(body, '[[:space:]]+', '', 'g') from expected_append_only_body)
      and has_function_privilege('service_role', procs.oid, 'execute')
      and not exists (select 1 from aclexplode(coalesce(procs.proacl, acldefault('f', procs.proowner))) acl where acl.grantee = 0 or (acl.grantee <> procs.proowner and acl.grantee <> (select oid from pg_roles where rolname = 'service_role')) or acl.privilege_type <> 'EXECUTE')
  ) as ok
), append_only_trigger_state as (
  select not exists (
    select 1 from (values ('execution_record_audit_events'), ('execution_lifecycle_events'), ('execution_agent_progress_events')) audit_tables(table_name)
    left join pg_class classes on classes.oid = format('public.%I', audit_tables.table_name)::regclass
    left join pg_trigger triggers on triggers.tgrelid = classes.oid and not triggers.tgisinternal
    group by audit_tables.table_name
    having count(triggers.oid) <> 1 or bool_or(triggers.tgname <> 'action_650_append_only' or triggers.tgfoid <> to_regprocedure('public.action_650_reject_execution_audit_mutation()') or triggers.tgenabled <> 'O' or triggers.tgtype <> 27)
  ) as ok
), action_652_state as (
  select (select count(*) from pg_proc where oid in (to_regprocedure('public.app_open_position_transaction(uuid,text,text,numeric,numeric,numeric,numeric,numeric,jsonb,text)'), to_regprocedure('public.app_login_abuse_reserve(text)'), to_regprocedure('public.app_login_abuse_finalize_success(text)')) and prosecdef and pg_get_userbyid(proowner) = 'postgres' and coalesce(array_to_string(proconfig, ','), '') like '%search_path=pg_catalog, public%') = 3 as ok
)
select case
  when not (select containment from history_state) then 'blocked_by_containment_history'
  when not (select ok from table_state) then 'blocked_by_unknown_table_state'
  when not (select ok from target_relation_scope_state) then 'blocked_by_target_relation_scope'
  when not (select ok from unknown_acl_state) then 'blocked_by_unknown_acl_grantee'
  when not (select ok from platform_membership_state) then 'blocked_by_platform_membership'
  when not (select ok from direct_column_acl_state) then 'blocked_by_direct_column_acl'
  when not (select ok from policies_state) then 'blocked_by_policy_drift'
  when not (select ok from append_only_function_state) then 'blocked_by_append_only_function_drift'
  when not (select ok from append_only_trigger_state) then 'blocked_by_append_only_trigger_drift'
  when not (select ok from action_652_state) then 'blocked_by_action_652_drift'
  when (select recovery from history_state) and (select ok from contained_state) then 'action_659b_recovery_verified'
  when (select recovery from history_state) then 'blocked_by_recovery_postcondition'
  when (select ok from contained_state) then 'action_659b_recovery_not_required'
  else 'action_659b_acl_rls_recovery_ready'
end as status;
