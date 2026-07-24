-- Action 650: emergency containment for production trading and execution data.
--
-- This is deliberately server-only until Action 651 establishes a reviewed
-- authenticated ownership model. It removes legacy browser/PostgREST access;
-- it does not create a replacement client policy.
--
-- Operational note: apply only through the separately approved production
-- rollout. This migration makes no data changes and does not invoke providers,
-- brokers, or application routes.

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
    if to_regclass(format('public.%I', target_table)) is null then
      raise exception 'Action 650 expected containment table public.% is missing', target_table;
    end if;

    -- Remove both direct grants and any legacy permissive RLS policy.
    execute format(
      'revoke all privileges on table public.%I from public, anon, authenticated',
      target_table
    );
    execute format('grant all privileges on table public.%I to service_role', target_table);
    execute format('alter table public.%I enable row level security', target_table);

    for policy_name in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = target_table
    loop
      execute format('drop policy %I on public.%I', policy_name, target_table);
    end loop;

    execute format(
      'comment on table public.%I is %L',
      target_table,
      'Action 650 containment: direct PUBLIC, anon, and authenticated access is revoked. Server/service-role access only until Action 651 establishes reviewed ownership-scoped policies.'
    );
  end loop;
end
$$;

-- These tables represent immutable execution evidence. Reject UPDATE and
-- DELETE even from the service writer so an audit event cannot be rewritten.
create or replace function public.action_650_reject_execution_audit_mutation()
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

revoke all on function public.action_650_reject_execution_audit_mutation() from public, anon, authenticated;
grant execute on function public.action_650_reject_execution_audit_mutation() to service_role;

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
    execute format('drop trigger if exists action_650_append_only on public.%I', audit_table);
    execute format(
      'create trigger action_650_append_only before update or delete on public.%I for each row execute function public.action_650_reject_execution_audit_mutation()',
      audit_table
    );
  end loop;
end
$$;

comment on function public.action_650_reject_execution_audit_mutation() is
  'Action 650 structural append-only containment for execution audit/event tables.';
