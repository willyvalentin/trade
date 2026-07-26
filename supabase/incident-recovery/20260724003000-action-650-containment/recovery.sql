-- Incident recovery 20260724003000: narrowly repair known post-02000 ACL/RLS drift.
--
-- This is forward recovery, not rollback. It never recreates browser grants or
-- policies, rewrites migration history, or replaces a function or trigger.

begin;
select pg_advisory_xact_lock(65920260724003000);

do $action_659b$
declare
  target_table text;
  target_tables constant text[] := array[
    'recommendations', 'positions', 'position_updates', 'user_settings',
    'scanner_cache', 'market_calendar_cache', 'market_regime_snapshots',
    'recommendation_batches', 'recommendation_outcomes',
    'recommendation_scan_runs', 'recommendation_snapshots',
    'scheduled_scan_runs', 'scheduled_scan_attempts', 'symbol_metadata',
    'execution_records', 'execution_agent_runs',
    'execution_agent_progress_events', 'execution_lifecycle_events',
    'execution_record_audit_events'
  ];
  audit_tables constant text[] := array[
    'execution_record_audit_events', 'execution_lifecycle_events',
    'execution_agent_progress_events'
  ];
  required_privileges constant text[] := array['select', 'insert', 'update', 'delete'];
  denied_privileges constant text[] := array['truncate', 'references', 'trigger'];
  expected_append_only_body constant text := $action_650_body$
begin
  raise exception 'Action 650 append-only containment rejects % on %.%', tg_op, tg_table_schema, tg_table_name
    using errcode = '55000';
end;
$action_650_body$;
  permitted_role_oids oid[];
  privilege_name text;
  repair_required boolean := false;
  recovery_history_exists boolean;
begin
  select array_agg(oid order by oid)
  into permitted_role_oids
  from pg_roles
  where rolname in ('anon', 'authenticated', 'service_role');
  if cardinality(permitted_role_oids) <> 3 then
    raise exception 'Action 659B rejects missing runtime roles';
  end if;
  select exists (
    select 1
    from supabase_migrations.schema_migrations
    where version = '20260724002000'
      and name = 'contain_production_trading_data_access'
      and cardinality(statements) = 6
  ) into recovery_history_exists;
  if not recovery_history_exists then
    raise exception 'Action 659B requires exact Action 650 migration history';
  end if;

  if exists (
    select 1
    from supabase_migrations.schema_migrations
    where version = '20260724003000'
  ) then
    raise exception 'Action 659B recovery history already exists';
  end if;

  if exists (
    select 1
    from supabase_migrations.schema_migrations
    where version in ('20260708000000', '20260708001000', '20260710000000')
  ) then
    raise exception 'Action 659B forbidden migration history is present';
  end if;

  foreach target_table in array target_tables loop
    if not exists (
      select 1 from pg_class classes
      where classes.oid = to_regclass(format('public.%I', target_table))
        and classes.relkind = 'r'
        and pg_get_userbyid(classes.relowner) = 'postgres'
    ) then
      raise exception 'Action 659B rejects unknown table state for public.%', target_table;
    end if;

    if exists (
      select 1
      from pg_class classes
      cross join lateral aclexplode(coalesce(classes.relacl, acldefault('r', classes.relowner))) acl
      where classes.oid = format('public.%I', target_table)::regclass
        and acl.grantee <> 0
        and acl.grantee <> classes.relowner
        and not (acl.grantee = any(permitted_role_oids))
    ) or exists (
      select 1
      from pg_attribute attributes
      cross join lateral aclexplode(attributes.attacl) acl
      where attributes.attrelid = format('public.%I', target_table)::regclass
        and attributes.attnum > 0
        and not attributes.attisdropped
        and acl.grantee <> 0
        and acl.grantee <> (select relowner from pg_class where oid = attributes.attrelid)
        and not (acl.grantee = any(permitted_role_oids))
    ) then
      raise exception 'Action 659B rejects unknown ACL grantee on public.%', target_table;
    end if;

    if exists (
      select 1
      from pg_attribute attributes
      cross join lateral aclexplode(attributes.attacl) acl
      where attributes.attrelid = format('public.%I', target_table)::regclass
        and attributes.attnum > 0
        and not attributes.attisdropped
        and acl.grantee <> (select relowner from pg_class where oid = attributes.attrelid)
    ) then
      raise exception 'Action 659B rejects direct column ACL state on public.%', target_table;
    end if;

    if exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = target_table
    ) then
      raise exception 'Action 659B rejects policy drift on public.%', target_table;
    end if;

    if not (select relrowsecurity from pg_class where oid = format('public.%I', target_table)::regclass) then
      repair_required := true;
    end if;

    foreach privilege_name in array required_privileges loop
      if has_table_privilege('anon', format('public.%I', target_table), privilege_name)
        or has_table_privilege('authenticated', format('public.%I', target_table), privilege_name)
        or not has_table_privilege('service_role', format('public.%I', target_table), privilege_name) then
        repair_required := true;
      end if;
    end loop;

    foreach privilege_name in array denied_privileges loop
      if has_table_privilege('anon', format('public.%I', target_table), privilege_name)
        or has_table_privilege('authenticated', format('public.%I', target_table), privilege_name)
        or has_table_privilege('service_role', format('public.%I', target_table), privilege_name) then
        repair_required := true;
      end if;
    end loop;

    if exists (
      select 1
      from pg_class classes
      cross join lateral aclexplode(coalesce(classes.relacl, acldefault('r', classes.relowner))) acl
      where classes.oid = format('public.%I', target_table)::regclass
        and acl.grantee = 0
    ) then
      repair_required := true;
    end if;
  end loop;

  if exists (
    select 1
    from pg_auth_members memberships
    join pg_roles member_role on member_role.oid = memberships.member
    join pg_roles runtime_role on runtime_role.oid = memberships.roleid
    where memberships.roleid = any(permitted_role_oids)
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
  ) then
    raise exception 'Action 661B rejects unallowlisted platform membership into a runtime role';
  end if;

  if not exists (
    select 1
    from pg_proc procs
    join pg_namespace namespaces on namespaces.oid = procs.pronamespace
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
      and regexp_replace(procs.prosrc, '[[:space:]]+', '', 'g') = regexp_replace(expected_append_only_body, '[[:space:]]+', '', 'g')
      and has_function_privilege('service_role', procs.oid, 'execute')
      and not exists (
        select 1
        from aclexplode(coalesce(procs.proacl, acldefault('f', procs.proowner))) acl
        where acl.grantee = 0
          or (acl.grantee <> procs.proowner and acl.grantee <> (select oid from pg_roles where rolname = 'service_role'))
          or acl.privilege_type <> 'EXECUTE'
      )
  ) or exists (
    select 1 from pg_proc procs join pg_namespace namespaces on namespaces.oid = procs.pronamespace
    where namespaces.nspname = 'public'
      and procs.proname = 'action_650_reject_execution_audit_mutation'
      and procs.oid <> to_regprocedure('public.action_650_reject_execution_audit_mutation()')
  ) then
    raise exception 'Action 659B rejects unknown Action 650 function state';
  end if;

  if exists (
      select 1
      from unnest(audit_tables) audit_tables(table_name)
      left join pg_class classes on classes.oid = format('public.%I', audit_tables.table_name)::regclass
      left join pg_trigger triggers on triggers.tgrelid = classes.oid and not triggers.tgisinternal
      group by audit_tables.table_name
      having count(triggers.oid) <> 1
        or bool_or(triggers.tgname <> 'action_650_append_only'
          or triggers.tgfoid <> to_regprocedure('public.action_650_reject_execution_audit_mutation()')
          or triggers.tgenabled <> 'O'
          or triggers.tgtype <> 27)
    ) then
    raise exception 'Action 659B rejects unknown Action 650 trigger state';
  end if;

  if (select count(*) from pg_proc where oid in (
      to_regprocedure('public.app_open_position_transaction(uuid,text,text,numeric,numeric,numeric,numeric,numeric,jsonb,text)'),
      to_regprocedure('public.app_login_abuse_reserve(text)'),
      to_regprocedure('public.app_login_abuse_finalize_success(text)')
    ) and prosecdef and pg_get_userbyid(proowner) = 'postgres'
      and coalesce(array_to_string(proconfig, ','), '') like '%search_path=pg_catalog, public%') <> 3 then
    raise exception 'Action 659B rejects Action 652 RPC drift';
  end if;

  if not repair_required then
    raise exception 'Action 659B recovery is not required for the contained contract';
  end if;

  foreach target_table in array target_tables loop
    execute format('revoke all privileges on table public.%I from public, anon, authenticated, service_role', target_table);
    execute format('grant select, insert, update, delete on table public.%I to service_role', target_table);
    execute format('alter table public.%I enable row level security', target_table);
  end loop;

  foreach target_table in array target_tables loop
    if not (select relrowsecurity from pg_class where oid = format('public.%I', target_table)::regclass)
      or exists (select 1 from pg_policies where schemaname = 'public' and tablename = target_table) then
      raise exception 'Action 659B postcondition failed for public.%', target_table;
    end if;
    if exists (
      select 1
      from pg_class classes
      cross join lateral aclexplode(coalesce(classes.relacl, acldefault('r', classes.relowner))) acl
      where classes.oid = format('public.%I', target_table)::regclass
        and acl.grantee = 0
    ) then
      raise exception 'Action 659B PUBLIC privilege postcondition failed for public.%', target_table;
    end if;
    foreach privilege_name in array required_privileges loop
      if has_table_privilege('anon', format('public.%I', target_table), privilege_name)
        or has_table_privilege('authenticated', format('public.%I', target_table), privilege_name)
        or not has_table_privilege('service_role', format('public.%I', target_table), privilege_name) then
        raise exception 'Action 659B required privilege postcondition failed for public.%', target_table;
      end if;
    end loop;
    foreach privilege_name in array denied_privileges loop
      if has_table_privilege('anon', format('public.%I', target_table), privilege_name)
        or has_table_privilege('authenticated', format('public.%I', target_table), privilege_name)
        or has_table_privilege('service_role', format('public.%I', target_table), privilege_name) then
        raise exception 'Action 659B denied privilege postcondition failed for public.%', target_table;
      end if;
    end loop;
  end loop;
end
$action_659b$;

commit;
