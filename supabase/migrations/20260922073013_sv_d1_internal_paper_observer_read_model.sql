-- SV-D1: minimum read-only observer for the brokerless C1-C4 paper lifecycle.
--
-- This additive source migration creates no account, schedule, job, provider
-- request, recommendation, fill or broker path. It exposes one sanitized,
-- owner/account-bound read model to service_role only. Mark-to-market equity is
-- deliberately unavailable until current, attributable price evidence exists.

set lock_timeout = '5s';
set statement_timeout = '60s';

-- Production admission is deliberately empty-state only. D.1 exposes a
-- read-only projection over the exact C.1-C.4 schema; durable paper state or
-- predecessor/catalog drift requires a separately reviewed migration.
do $$
declare
  v_handoff_function oid := pg_catalog.to_regprocedure(
    'public.app_read_internal_paper_handoff_context_v1(uuid,uuid,text)'
  );
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
    raise exception 'sv_d1_required_c1_c2_c3_c4_contract_missing';
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
    raise exception 'sv_d1_requires_empty_c1_c2_c3_state';
  end if;

  if exists (
    select 1
    from (values
      ('public.internal_paper_accounts', 'id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'owner_user_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'status', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'base_currency', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'config_version', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'state_version', 'bigint'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'strategy_id', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'strategy_version', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'strategy_rollback_identity', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'symbol_selection_policy_id', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'symbol_selection_policy_version', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'observed_universe_version', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'eligible_symbols', 'text[]'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'updated_at', 'timestamptz'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'starting_cash', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'cash_balance', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'realized_gross_pnl', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'realized_net_pnl', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'total_commission_paid', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'owner_user_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'account_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'work_kind', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'payload', 'jsonb'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'priority', 'smallint'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'status', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'available_at', 'timestamptz'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'lease_expires_at', 'timestamptz'::pg_catalog.regtype, false),
      ('public.internal_paper_worker_jobs', 'attempt_count', 'integer'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'max_attempts', 'integer'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'last_failure_code', 'text'::pg_catalog.regtype, false),
      ('public.internal_paper_worker_jobs', 'created_at', 'timestamptz'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'updated_at', 'timestamptz'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'completed_at', 'timestamptz'::pg_catalog.regtype, false),
      ('public.internal_paper_positions', 'id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'owner_user_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'account_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'ticker', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'side', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'status', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'quantity', 'bigint'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'remaining_quantity', 'bigint'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'average_entry_price', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'remaining_cost_basis', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'stop_price', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'target_price', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'realized_gross_pnl', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'realized_net_pnl', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'entry_commission', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'exit_commission_total', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'opened_at', 'timestamptz'::pg_catalog.regtype, true),
      ('public.internal_paper_positions', 'last_exit_at', 'timestamptz'::pg_catalog.regtype, false),
      ('public.internal_paper_positions', 'closed_at', 'timestamptz'::pg_catalog.regtype, false),
      ('public.internal_paper_positions', 'updated_at', 'timestamptz'::pg_catalog.regtype, true),
      ('public.internal_paper_ledger_entries', 'owner_user_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_ledger_entries', 'account_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_ledger_entries', 'amount', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_intents', 'id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_intents', 'owner_user_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_intents', 'account_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_intents', 'ticker', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_intents', 'exit_reason', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_fills', 'id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_fills', 'owner_user_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_fills', 'account_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_fills', 'position_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_fills', 'intent_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_fills', 'quantity', 'bigint'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_fills', 'fill_price', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_fills', 'gross_pnl', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_fills', 'net_pnl', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_fills', 'commission', 'numeric'::pg_catalog.regtype, true),
      ('public.internal_paper_exit_fills', 'filled_at', 'timestamptz'::pg_catalog.regtype, true)
    ) as expected(relation_name, column_name, type_oid, must_be_not_null)
    where not exists (
      select 1
      from pg_catalog.pg_attribute attribute
      where attribute.attrelid = pg_catalog.to_regclass(expected.relation_name)
        and attribute.attname = expected.column_name
        and attribute.atttypid = expected.type_oid
        and (not expected.must_be_not_null or attribute.attnotnull)
        and attribute.attnum > 0
        and not attribute.attisdropped
    )
  ) then
    raise exception 'sv_d1_unexpected_projection_contract';
  end if;

  if v_handoff_function is null or not exists (
    select 1
    from pg_catalog.pg_proc procedure_record
    where procedure_record.oid = v_handoff_function
      and procedure_record.prokind = 'f'
      and procedure_record.provolatile = 's'
      and procedure_record.prosecdef
      and procedure_record.proconfig @>
        array['search_path=pg_catalog, public']::text[]
  ) or not pg_catalog.has_function_privilege(
    'service_role', v_handoff_function, 'EXECUTE'
  ) or pg_catalog.has_function_privilege(
    'anon', v_handoff_function, 'EXECUTE'
  ) or pg_catalog.has_function_privilege(
    'authenticated', v_handoff_function, 'EXECUTE'
  ) then
    raise exception 'sv_d1_unexpected_handoff_function_contract';
  end if;

  select last_value, is_called
  into v_sequence_last_value, v_sequence_is_called
  from public.internal_paper_ledger_global_sequence;
  if v_sequence_last_value <> 1 or v_sequence_is_called then
    raise exception 'sv_d1_requires_unconsumed_ledger_sequence';
  end if;

  if pg_catalog.to_regprocedure(
    'public.app_read_internal_paper_observer_v1(uuid,uuid,text)'
  ) is not null then
    raise exception 'sv_d1_preexisting_observer_contract';
  end if;
end;
$$;

create function public.app_read_internal_paper_observer_v1(
  p_owner_user_id uuid,
  p_account_id uuid,
  p_observer_version text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  v_account public.internal_paper_accounts%rowtype;
  v_observed_at timestamptz := statement_timestamp();
  v_latest_activity_at timestamptz;
  v_queued_count bigint := 0;
  v_leased_count bigint := 0;
  v_completed_count bigint := 0;
  v_no_trade_count bigint := 0;
  v_blocked_count bigint := 0;
  v_ledger_entry_count bigint := 0;
  v_ledger_balance numeric := 0;
  v_open_position_cost_basis numeric := 0;
  v_engine_status text;
  v_latest_decision jsonb;
  v_latest_result jsonb;
  v_pending_orders jsonb := '[]'::jsonb;
  v_positions jsonb := '[]'::jsonb;
begin
  if p_observer_version is distinct from 'internal_paper_observer_v1'
    or p_owner_user_id is null
    or p_account_id is null
  then
    raise exception 'invalid_internal_paper_observer_command';
  end if;

  select * into v_account
  from public.internal_paper_accounts account
  where account.id = p_account_id
    and account.owner_user_id = p_owner_user_id;

  if not found then
    raise exception 'internal_paper_account_not_found';
  end if;

  select
    count(*) filter (where job.status = 'queued'),
    count(*) filter (where job.status = 'leased'),
    count(*) filter (where job.status = 'completed'),
    count(*) filter (where job.status = 'no_trade'),
    count(*) filter (where job.status = 'blocked'),
    max(job.updated_at)
  into
    v_queued_count,
    v_leased_count,
    v_completed_count,
    v_no_trade_count,
    v_blocked_count,
    v_latest_activity_at
  from public.internal_paper_worker_jobs job
  where job.account_id = p_account_id
    and job.owner_user_id = p_owner_user_id;

  v_latest_activity_at := greatest(
    v_account.updated_at,
    coalesce(v_latest_activity_at, v_account.updated_at)
  );

  v_engine_status := case
    when v_account.status = 'killed' then 'killed'
    when v_account.status = 'paused' then 'paused'
    when v_blocked_count > 0 then 'blocked'
    when v_leased_count > 0 then 'working'
    when v_queued_count > 0 then 'backlog'
    else 'idle'
  end;

  select jsonb_build_object(
    'job_id', job.id,
    'decision_kind', case
      when job.work_kind = 'entry' then 'recommendation'
      else 'no_trade'
    end,
    'work_kind', job.work_kind,
    'status', job.status,
    'scan_run_id', job.payload ->> 'scan_run_id',
    'scan_run_fingerprint', job.payload ->> 'scan_run_fingerprint',
    'ticker', case when job.work_kind = 'entry' then job.payload ->> 'ticker' end,
    'no_trade_reason', case
      when job.work_kind = 'no_trade' then job.payload ->> 'no_trade_reason'
    end,
    'attempt_count', job.attempt_count,
    'max_attempts', job.max_attempts,
    'last_failure_code', job.last_failure_code,
    'created_at', job.created_at,
    'updated_at', job.updated_at,
    'completed_at', job.completed_at
  ) into v_latest_decision
  from public.internal_paper_worker_jobs job
  where job.account_id = p_account_id
    and job.owner_user_id = p_owner_user_id
    and job.work_kind in ('entry', 'no_trade')
  order by job.created_at desc, job.id desc
  limit 1;

  select coalesce(jsonb_agg(jsonb_build_object(
    'job_id', pending.id,
    'work_kind', pending.work_kind,
    'status', pending.status,
    'ticker', pending.payload ->> 'ticker',
    'scan_run_id', pending.payload ->> 'scan_run_id',
    'attempt_count', pending.attempt_count,
    'max_attempts', pending.max_attempts,
    'available_at', pending.available_at,
    'lease_expires_at', pending.lease_expires_at,
    'created_at', pending.created_at,
    'updated_at', pending.updated_at
  ) order by pending.priority, pending.available_at, pending.created_at, pending.id), '[]'::jsonb)
  into v_pending_orders
  from (
    select job.*
    from public.internal_paper_worker_jobs job
    where job.account_id = p_account_id
      and job.owner_user_id = p_owner_user_id
      and job.status in ('queued', 'leased')
    order by job.priority, job.available_at, job.created_at, job.id
    limit 20
  ) pending;

  select coalesce(jsonb_agg(jsonb_build_object(
    'position_id', position.id,
    'ticker', position.ticker,
    'side', position.side,
    'status', position.status,
    'quantity', position.quantity,
    'remaining_quantity', position.remaining_quantity,
    'average_entry_price', position.average_entry_price,
    'remaining_cost_basis', position.remaining_cost_basis,
    'stop_price', position.stop_price,
    'target_price', position.target_price,
    'realized_gross_pnl', position.realized_gross_pnl,
    'realized_net_pnl', position.realized_net_pnl,
    'entry_commission', position.entry_commission,
    'exit_commission_total', position.exit_commission_total,
    'opened_at', position.opened_at,
    'last_exit_at', position.last_exit_at,
    'closed_at', position.closed_at,
    'updated_at', position.updated_at
  ) order by position.opened_at desc, position.id desc), '[]'::jsonb)
  into v_positions
  from public.internal_paper_positions position
  where position.account_id = p_account_id
    and position.owner_user_id = p_owner_user_id;

  select
    count(*),
    coalesce(sum(ledger.amount), 0)
  into v_ledger_entry_count, v_ledger_balance
  from public.internal_paper_ledger_entries ledger
  where ledger.account_id = p_account_id
    and ledger.owner_user_id = p_owner_user_id;

  select coalesce(sum(position.remaining_cost_basis), 0)
  into v_open_position_cost_basis
  from public.internal_paper_positions position
  where position.account_id = p_account_id
    and position.owner_user_id = p_owner_user_id
    and position.status = 'open';

  select jsonb_build_object(
    'exit_fill_id', fill.id,
    'position_id', fill.position_id,
    'ticker', intent.ticker,
    'exit_reason', intent.exit_reason,
    'quantity', fill.quantity,
    'fill_price', fill.fill_price,
    'gross_pnl', fill.gross_pnl,
    'net_pnl', fill.net_pnl,
    'commission', fill.commission,
    'filled_at', fill.filled_at
  ) into v_latest_result
  from public.internal_paper_exit_fills fill
  join public.internal_paper_exit_intents intent
    on intent.id = fill.intent_id
    and intent.account_id = fill.account_id
    and intent.owner_user_id = fill.owner_user_id
  where fill.account_id = p_account_id
    and fill.owner_user_id = p_owner_user_id
  order by fill.filled_at desc, fill.id desc
  limit 1;

  return jsonb_build_object(
    'observer_version', 'internal_paper_observer_v1',
    'observed_at', v_observed_at,
    'owner_user_id', v_account.owner_user_id,
    'account_id', v_account.id,
    'account', jsonb_build_object(
      'status', v_account.status,
      'base_currency', v_account.base_currency,
      'config_version', v_account.config_version,
      'state_version', v_account.state_version,
      'strategy_id', v_account.strategy_id,
      'strategy_version', v_account.strategy_version,
      'strategy_rollback_identity', v_account.strategy_rollback_identity,
      'symbol_selection_policy_id', v_account.symbol_selection_policy_id,
      'symbol_selection_policy_version', v_account.symbol_selection_policy_version,
      'observed_universe_version', v_account.observed_universe_version,
      'eligible_symbols', to_jsonb(v_account.eligible_symbols),
      'updated_at', v_account.updated_at
    ),
    'engine_health', jsonb_build_object(
      'status', v_engine_status,
      'queued_count', v_queued_count,
      'leased_count', v_leased_count,
      'completed_count', v_completed_count,
      'no_trade_count', v_no_trade_count,
      'blocked_count', v_blocked_count,
      'latest_activity_at', v_latest_activity_at
    ),
    'freshness', jsonb_build_object(
      'latest_activity_at', v_latest_activity_at,
      'age_seconds', greatest(
        0,
        floor(extract(epoch from (v_observed_at - v_latest_activity_at)))::bigint
      ),
      'classification', 'unclassified',
      'threshold_seconds', null
    ),
    'latest_decision', v_latest_decision,
    'pending_orders', v_pending_orders,
    'positions', v_positions,
    'accounting', jsonb_build_object(
      'currency', v_account.base_currency,
      'starting_cash', v_account.starting_cash,
      'cash_balance', v_account.cash_balance,
      'open_position_cost_basis', v_open_position_cost_basis,
      'book_value', v_account.cash_balance + v_open_position_cost_basis,
      'marked_equity', null,
      'equity_status', 'unavailable_without_current_mark',
      'realized_gross_pnl', v_account.realized_gross_pnl,
      'realized_net_pnl', v_account.realized_net_pnl,
      'total_commission_paid', v_account.total_commission_paid,
      'ledger_entry_count', v_ledger_entry_count,
      'ledger_balance', v_ledger_balance
    ),
    'latest_realized_result', v_latest_result
  );
end;
$$;

revoke all on function public.app_read_internal_paper_observer_v1(
  uuid, uuid, text
) from public, anon, authenticated;
grant execute on function public.app_read_internal_paper_observer_v1(
  uuid, uuid, text
) to service_role;

comment on function public.app_read_internal_paper_observer_v1(
  uuid, uuid, text
) is
  'SV-D1 sanitized, owner-bound and read-only observer over the C1-C4 internal-paper lifecycle; never invents marked equity.';
