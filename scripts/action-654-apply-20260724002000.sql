-- Action 654 reviewed SQL Editor bundle for Action 650.
-- One-time, transaction-scoped execution only. No psql commands, placeholders,
-- connection strings, or secrets are present in this bundle.

begin;
select pg_advisory_xact_lock(65420260724002000);

do $action_650_bundle$
declare
  statement_1 text := $action_650_statement_1$
-- Action 650: emergency containment for production trading and execution data.
--
-- This is deliberately server-only until Action 651 establishes a reviewed
-- authenticated ownership model. It removes legacy browser/PostgREST access;
-- it does not create a replacement client policy.
--
-- Operational note: apply only through the separately approved production
-- rollout. This migration makes no data changes and does not invoke providers,
-- brokers, or application routes.

-- Preconditions run before the containment body. Existing legacy policies are
-- intentionally removed below, but Action 650's own named objects must never
-- be replaced, dropped, or silently reused.
do $$
declare
  target_table text;
  target_tables constant text[] := array[
    'recommendations',
    'positions',
    'position_updates',
    'user_settings',
    'scanner_cache',
    'market_calendar_cache',
    'market_regime_snapshots',
    'recommendation_batches',
    'recommendation_outcomes',
    'recommendation_scan_runs',
    'recommendation_snapshots',
    'scheduled_scan_runs',
    'scheduled_scan_attempts',
    'symbol_metadata',
    'execution_records',
    'execution_agent_runs',
    'execution_agent_progress_events',
    'execution_lifecycle_events',
    'execution_record_audit_events'
  ];
  audit_table text;
  audit_tables constant text[] := array[
    'execution_record_audit_events',
    'execution_lifecycle_events',
    'execution_agent_progress_events'
  ];
  conflicting_function_identities text;
  conflicting_function_owners text;
  conflicting_trigger_definition text;
  conflicting_trigger_enabled "char";
begin
  foreach target_table in array target_tables loop
    if to_regclass(format('public.%I', target_table)) is null then
      raise exception 'Action 650 expected containment table public.% is missing', target_table;
    end if;

    -- Legacy policies are intentionally removed below. A policy claiming an
    -- Action 650 name is an unexpected partial rollout and must stop here.
    if exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = target_table
        and policyname like 'action_650_%'
    ) then
      raise exception 'Action 650 conflicting named policy exists on public.%', target_table;
    end if;
  end loop;

  select
    string_agg(pg_get_function_identity_arguments(procs.oid), ', ' order by procs.oid),
    string_agg(pg_get_userbyid(procs.proowner), ', ' order by procs.oid)
  into conflicting_function_identities, conflicting_function_owners
  from pg_proc procs
  join pg_namespace namespaces on namespaces.oid = procs.pronamespace
  where namespaces.nspname = 'public'
    and procs.proname = 'action_650_reject_execution_audit_mutation';

  if conflicting_function_identities is not null then
    raise exception
      'Action 650 conflicting function public.action_650_reject_execution_audit_mutation(%) owned by % exists',
      conflicting_function_identities,
      conflicting_function_owners;
  end if;

  foreach audit_table in array audit_tables loop
    select pg_get_triggerdef(triggers.oid), triggers.tgenabled
    into conflicting_trigger_definition, conflicting_trigger_enabled
    from pg_trigger triggers
    join pg_class classes on classes.oid = triggers.tgrelid
    join pg_namespace namespaces on namespaces.oid = classes.relnamespace
    where namespaces.nspname = 'public'
      and classes.relname = audit_table
      and triggers.tgname = 'action_650_append_only'
      and not triggers.tgisinternal;

    if found then
      raise exception
        'Action 650 conflicting trigger public.%.action_650_append_only (enabled %, definition %) exists',
        audit_table,
        conflicting_trigger_enabled,
        conflicting_trigger_definition;
    end if;
  end loop;
end
$$;
$action_650_statement_1$;
  statement_2 text := $action_650_statement_2$
do $$
declare
  target_table text;
  target_tables constant text[] := array[
    'recommendations',
    'positions',
    'position_updates',
    'user_settings',
    'scanner_cache',
    'market_calendar_cache',
    'market_regime_snapshots',
    'recommendation_batches',
    'recommendation_outcomes',
    'recommendation_scan_runs',
    'recommendation_snapshots',
    'scheduled_scan_runs',
    'scheduled_scan_attempts',
    'symbol_metadata',
    'execution_records',
    'execution_agent_runs',
    'execution_agent_progress_events',
    'execution_lifecycle_events',
    'execution_record_audit_events'
  ];
  policy_name text;
begin
  foreach target_table in array target_tables loop
    -- Remove both direct grants and any legacy permissive RLS policy.
    execute format(
      'revoke all privileges on table public.%I from public, anon, authenticated',
      target_table
    );
    -- Runtime service-role callers require data access only. Remove legacy
    -- schema-changing grants before restoring the bounded DML contract.
    execute format('revoke all privileges on table public.%I from service_role', target_table);
    execute format(
      'grant select, insert, update, delete on table public.%I to service_role',
      target_table
    );
    execute format('alter table public.%I enable row level security', target_table);

    for policy_name in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = target_table
    loop
      execute format('drop policy %I on public.%I', policy_name, target_table);
    end loop;
  end loop;
end
$$;
$action_650_statement_2$;
  statement_3 text := $action_650_statement_3$
-- These tables represent immutable execution evidence. Reject UPDATE and
-- DELETE even from the service writer so an audit event cannot be rewritten.
create function public.action_650_reject_execution_audit_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  raise exception 'Action 650 append-only containment rejects % on %.%', tg_op, tg_table_schema, tg_table_name
    using errcode = '55000';
end;
$$;
$action_650_statement_3$;
  statement_4 text := $action_650_statement_4$
revoke all on function public.action_650_reject_execution_audit_mutation() from public, anon, authenticated;
$action_650_statement_4$;
  statement_5 text := $action_650_statement_5$
grant execute on function public.action_650_reject_execution_audit_mutation() to service_role;
$action_650_statement_5$;
  statement_6 text := $action_650_statement_6$
do $$
declare
  audit_table text;
  audit_tables constant text[] := array[
    'execution_record_audit_events',
    'execution_lifecycle_events',
    'execution_agent_progress_events'
  ];
begin
  foreach audit_table in array audit_tables loop
    execute format(
      'create trigger action_650_append_only before update or delete on public.%I for each row execute function public.action_650_reject_execution_audit_mutation()',
      audit_table
    );
  end loop;
end
$$;
$action_650_statement_6$;
  target_table text;
  target_tables constant text[] := array[
    'recommendations', 'positions', 'position_updates', 'user_settings',
    'scanner_cache', 'market_calendar_cache', 'market_regime_snapshots',
    'recommendation_batches', 'recommendation_outcomes', 'recommendation_scan_runs',
    'recommendation_snapshots', 'scheduled_scan_runs', 'scheduled_scan_attempts',
    'symbol_metadata', 'execution_records', 'execution_agent_runs',
    'execution_agent_progress_events', 'execution_lifecycle_events',
    'execution_record_audit_events'
  ];
begin
  if to_regclass('supabase_migrations.schema_migrations') is null then
    raise exception 'Action 654 migration history table is unavailable';
  end if;
  if exists (
    select 1 from supabase_migrations.schema_migrations
    where version = '20260724002000'
  ) then
    raise exception 'Action 650 migration history already contains version 20260724002000';
  end if;
  if exists (
    select 1 from supabase_migrations.schema_migrations
    where version in ('20260708000000', '20260708001000', '20260710000000')
  ) then
    raise exception 'Action 654 forbidden migration history is present';
  end if;
  if not exists (select 1 from supabase_migrations.schema_migrations where version = '20260724001500')
    or not exists (select 1 from supabase_migrations.schema_migrations where version = '20260724001600') then
    raise exception 'Action 654 requires Action 652 migrations 01500 and 01600';
  end if;
  execute statement_1;
  execute statement_2;
  execute statement_3;
  execute statement_4;
  execute statement_5;
  execute statement_6;
  foreach target_table in array target_tables loop
    if not exists (
      select 1 from pg_class classes
      where classes.oid = format('public.%I', target_table)::regclass
        and classes.relrowsecurity
    ) then
      raise exception 'Action 654 postcondition RLS failed for public.%', target_table;
    end if;
    if exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = target_table
    ) then
      raise exception 'Action 654 postcondition policy removal failed for public.%', target_table;
    end if;
  end loop;
  insert into supabase_migrations.schema_migrations(version, statements, name)
  values ('20260724002000', array[statement_1, statement_2, statement_3, statement_4, statement_5, statement_6], 'contain_production_trading_data_access');
end
$action_650_bundle$;

commit;
