-- SV-D1: minimum read-only observer for the brokerless C1-C4 paper lifecycle.
--
-- This additive source migration creates no account, schedule, job, provider
-- request, recommendation, fill or broker path. It exposes one sanitized,
-- owner/account-bound read model to service_role only. Mark-to-market equity is
-- deliberately unavailable until current, attributable price evidence exists.

create or replace function public.app_read_internal_paper_observer_v1(
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
