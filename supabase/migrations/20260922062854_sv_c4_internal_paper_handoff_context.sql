-- SV-C4: service-role-only frozen account context for decision-to-worker handoff.
--
-- This is inert after migration: it creates no account, schedule, queue job,
-- provider request, candidate publication or broker path.

create or replace function public.app_read_internal_paper_handoff_context_v1(
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
