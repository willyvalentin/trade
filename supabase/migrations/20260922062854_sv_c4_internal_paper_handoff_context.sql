-- SV-C4: service-role-only frozen account context for decision-to-worker handoff.
--
-- This is inert after migration: it creates no account, schedule, queue job,
-- provider request, candidate publication or broker path.

set lock_timeout = '5s';
set statement_timeout = '60s';

-- Production admission is deliberately empty-state only. C.4 exposes the
-- frozen C.1 account contract to the C.3 worker boundary; any durable paper
-- state or predecessor drift requires a separately reviewed migration.
do $$
declare
  v_sequence_last_value bigint;
  v_sequence_is_called boolean;
begin
  if pg_catalog.to_regclass('public.internal_paper_accounts') is null
    or pg_catalog.to_regclass('public.internal_paper_entry_intents') is null
    or pg_catalog.to_regclass('public.internal_paper_fills') is null
    or pg_catalog.to_regclass('public.internal_paper_positions') is null
    or pg_catalog.to_regclass('public.internal_paper_ledger_entries') is null
    or pg_catalog.to_regclass('public.internal_paper_exit_intents') is null
    or pg_catalog.to_regclass('public.internal_paper_exit_fills') is null
    or pg_catalog.to_regclass('public.internal_paper_worker_jobs') is null
    or pg_catalog.to_regclass('public.internal_paper_ledger_global_sequence') is null
  then
    raise exception 'sv_c4_required_c1_c2_c3_contract_missing';
  end if;

  if exists (select 1 from public.internal_paper_accounts)
    or exists (select 1 from public.internal_paper_entry_intents)
    or exists (select 1 from public.internal_paper_fills)
    or exists (select 1 from public.internal_paper_positions)
    or exists (select 1 from public.internal_paper_ledger_entries)
    or exists (select 1 from public.internal_paper_exit_intents)
    or exists (select 1 from public.internal_paper_exit_fills)
    or exists (select 1 from public.internal_paper_worker_jobs)
  then
    raise exception 'sv_c4_requires_empty_c1_c2_c3_state';
  end if;

  if exists (
    select 1
    from (values
      ('id', 'uuid'::pg_catalog.regtype),
      ('owner_user_id', 'uuid'::pg_catalog.regtype),
      ('status', 'text'::pg_catalog.regtype),
      ('config_version', 'text'::pg_catalog.regtype),
      ('strategy_id', 'text'::pg_catalog.regtype),
      ('strategy_version', 'text'::pg_catalog.regtype),
      ('strategy_rollback_identity', 'text'::pg_catalog.regtype),
      ('symbol_selection_policy_id', 'text'::pg_catalog.regtype),
      ('symbol_selection_policy_version', 'text'::pg_catalog.regtype),
      ('observed_universe_version', 'text'::pg_catalog.regtype),
      ('eligible_symbols', 'text[]'::pg_catalog.regtype),
      ('cash_balance', 'numeric'::pg_catalog.regtype),
      ('per_trade_risk_cap', 'numeric'::pg_catalog.regtype),
      ('spread_bps', 'numeric'::pg_catalog.regtype),
      ('slippage_bps', 'numeric'::pg_catalog.regtype),
      ('commission_per_order', 'numeric'::pg_catalog.regtype)
    ) as expected(column_name, type_oid)
    where not exists (
      select 1
      from pg_catalog.pg_attribute attribute
      where attribute.attrelid = 'public.internal_paper_accounts'::pg_catalog.regclass
        and attribute.attname = expected.column_name
        and attribute.atttypid = expected.type_oid
        and attribute.attnotnull
        and attribute.attnum > 0
        and not attribute.attisdropped
    )
  ) or not exists (
    select 1
    from pg_catalog.pg_constraint constraint_record
    where constraint_record.conrelid = 'public.internal_paper_accounts'::pg_catalog.regclass
      and constraint_record.contype = 'u'
      and constraint_record.convalidated
      and pg_catalog.pg_get_constraintdef(constraint_record.oid, true) =
        'UNIQUE (id, owner_user_id)'
  ) then
    raise exception 'sv_c4_unexpected_account_contract';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_class relation_record
    where relation_record.oid = 'public.internal_paper_worker_jobs'::pg_catalog.regclass
      and relation_record.relkind = 'r'
      and relation_record.relrowsecurity
  ) or pg_catalog.has_table_privilege(
    'anon', 'public.internal_paper_worker_jobs', 'SELECT'
  ) or pg_catalog.has_table_privilege(
    'anon', 'public.internal_paper_worker_jobs', 'INSERT'
  ) or pg_catalog.has_table_privilege(
    'authenticated', 'public.internal_paper_worker_jobs', 'SELECT'
  ) or pg_catalog.has_table_privilege(
    'authenticated', 'public.internal_paper_worker_jobs', 'INSERT'
  ) or pg_catalog.has_table_privilege(
    'service_role', 'public.internal_paper_worker_jobs', 'SELECT'
  ) or pg_catalog.has_table_privilege(
    'service_role', 'public.internal_paper_worker_jobs', 'INSERT'
  ) then
    raise exception 'sv_c4_unexpected_worker_table_contract';
  end if;

  if exists (
    select 1
    from (values
      (pg_catalog.to_regprocedure(
        'public.app_enqueue_internal_paper_worker_job_v1(uuid,uuid,text,jsonb,text)'
      )),
      (pg_catalog.to_regprocedure(
        'public.app_claim_internal_paper_worker_job_v1(text,timestamptz,integer,text)'
      )),
      (pg_catalog.to_regprocedure(
        'public.app_execute_internal_paper_worker_job_v1(uuid,uuid,timestamptz,text)'
      )),
      (pg_catalog.to_regprocedure(
        'public.app_release_internal_paper_worker_job_v1(uuid,uuid,timestamptz,timestamptz,text,text)'
      )),
      (pg_catalog.to_regprocedure(
        'public.app_read_internal_paper_worker_v1(uuid,uuid,text)'
      ))
    ) as required(procedure_oid)
    where required.procedure_oid is null
      or not exists (
        select 1
        from pg_catalog.pg_proc procedure_record
        where procedure_record.oid = required.procedure_oid
          and procedure_record.prokind = 'f'
          and procedure_record.prosecdef
          and procedure_record.proconfig @>
            array['search_path=pg_catalog, public']::text[]
      )
      or not pg_catalog.has_function_privilege(
        'service_role', required.procedure_oid, 'EXECUTE'
      )
      or pg_catalog.has_function_privilege(
        'anon', required.procedure_oid, 'EXECUTE'
      )
      or pg_catalog.has_function_privilege(
        'authenticated', required.procedure_oid, 'EXECUTE'
      )
  ) then
    raise exception 'sv_c4_unexpected_worker_function_contract';
  end if;

  select last_value, is_called
  into v_sequence_last_value, v_sequence_is_called
  from public.internal_paper_ledger_global_sequence;
  if v_sequence_last_value <> 1 or v_sequence_is_called then
    raise exception 'sv_c4_requires_unconsumed_ledger_sequence';
  end if;

  if pg_catalog.to_regprocedure(
    'public.app_read_internal_paper_handoff_context_v1(uuid,uuid,text)'
  ) is not null then
    raise exception 'sv_c4_preexisting_handoff_contract';
  end if;
end;
$$;

create function public.app_read_internal_paper_handoff_context_v1(
  p_owner_user_id uuid,
  p_account_id uuid,
  p_context_version text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  v_result jsonb;
begin
  if p_context_version <> 'internal_paper_handoff_context_v1'
    or p_owner_user_id is null
    or p_account_id is null
  then
    raise exception 'invalid_internal_paper_handoff_context_command';
  end if;

  select jsonb_build_object(
    'context_version', 'internal_paper_handoff_context_v1',
    'owner_user_id', a.owner_user_id,
    'account_id', a.id,
    'status', a.status,
    'config_version', a.config_version,
    'strategy_id', a.strategy_id,
    'strategy_version', a.strategy_version,
    'strategy_rollback_identity', a.strategy_rollback_identity,
    'symbol_selection_policy_id', a.symbol_selection_policy_id,
    'symbol_selection_policy_version', a.symbol_selection_policy_version,
    'observed_universe_version', a.observed_universe_version,
    'eligible_symbols', to_jsonb(a.eligible_symbols),
    'cash_balance', a.cash_balance,
    'per_trade_risk_cap', a.per_trade_risk_cap,
    'spread_bps', a.spread_bps,
    'slippage_bps', a.slippage_bps,
    'commission_per_order', a.commission_per_order
  ) into v_result
  from public.internal_paper_accounts a
  where a.owner_user_id = p_owner_user_id
    and a.id = p_account_id;

  if v_result is null then
    raise exception 'internal_paper_handoff_account_not_found';
  end if;

  return v_result;
end;
$$;

revoke all on function public.app_read_internal_paper_handoff_context_v1(
  uuid, uuid, text
) from public, anon, authenticated;
grant execute on function public.app_read_internal_paper_handoff_context_v1(
  uuid, uuid, text
) to service_role;

comment on function public.app_read_internal_paper_handoff_context_v1(
  uuid, uuid, text
) is
  'SV-C4 exact frozen account context for the provider-free decision-to-worker handoff.';
