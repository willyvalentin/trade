-- SV-C7: atomic, service-owned provisioning for the first internal-paper
-- pilot account and its immutable operating policy.
--
-- This migration is inert after application. It creates no account, policy,
-- heartbeat, job, schedule, provider request or broker path. Provisioning is
-- possible only when an exact C6 provider-rights record is already admitted;
-- the account is always created paused and cannot execute work until a later,
-- separately reviewed activation changes that state.

set lock_timeout = '5s';
set statement_timeout = '60s';

do $$
declare
  v_freeze_function oid := pg_catalog.to_regprocedure(
    'public.app_freeze_internal_paper_pilot_policy_v1(uuid,uuid,text,text,text,integer,bigint,timestamptz)'
  );
  v_rights_reader oid := pg_catalog.to_regprocedure(
    'public.app_read_internal_paper_provider_rights_evidence_v1(text,text)'
  );
begin
  if pg_catalog.to_regclass('public.internal_paper_accounts') is null
    or pg_catalog.to_regclass('public.internal_paper_entry_intents') is null
    or pg_catalog.to_regclass('public.internal_paper_fills') is null
    or pg_catalog.to_regclass('public.internal_paper_positions') is null
    or pg_catalog.to_regclass('public.internal_paper_ledger_entries') is null
    or pg_catalog.to_regclass('public.internal_paper_exit_intents') is null
    or pg_catalog.to_regclass('public.internal_paper_exit_fills') is null
    or pg_catalog.to_regclass('public.internal_paper_worker_jobs') is null
    or pg_catalog.to_regclass('public.internal_paper_pilot_policies') is null
    or pg_catalog.to_regclass('public.internal_paper_worker_heartbeats') is null
    or pg_catalog.to_regclass(
      'public.internal_paper_provider_rights_evidence'
    ) is null
    or v_freeze_function is null
    or v_rights_reader is null
  then
    raise exception 'sv_c7_required_c1_c2_c3_c5_c6_contract_missing';
  end if;

  if exists (select 1 from public.internal_paper_accounts)
    or exists (select 1 from public.internal_paper_entry_intents)
    or exists (select 1 from public.internal_paper_fills)
    or exists (select 1 from public.internal_paper_positions)
    or exists (select 1 from public.internal_paper_ledger_entries)
    or exists (select 1 from public.internal_paper_exit_intents)
    or exists (select 1 from public.internal_paper_exit_fills)
    or exists (select 1 from public.internal_paper_worker_jobs)
    or exists (select 1 from public.internal_paper_pilot_policies)
    or exists (select 1 from public.internal_paper_worker_heartbeats)
  then
    raise exception 'sv_c7_requires_empty_internal_paper_state';
  end if;

  if pg_catalog.to_regprocedure(
    'public.app_provision_internal_paper_pilot_v1(uuid,uuid,text,text,text,text,text,text,text,text[],text,numeric,numeric,numeric,numeric,numeric,numeric,text,integer,bigint,timestamptz,text)'
  ) is not null then
    raise exception 'sv_c7_preexisting_pilot_provisioning_contract';
  end if;

  if exists (
    select 1
    from (values (v_freeze_function), (v_rights_reader)) required(function_oid)
    where not exists (
      select 1
      from pg_catalog.pg_proc procedure_record
      where procedure_record.oid = required.function_oid
        and procedure_record.prokind = 'f'
        and procedure_record.prosecdef
        and procedure_record.proconfig @>
          array['search_path=pg_catalog, public']::text[]
    )
      or not pg_catalog.has_function_privilege(
        'service_role', required.function_oid, 'EXECUTE'
      )
      or pg_catalog.has_function_privilege(
        'anon', required.function_oid, 'EXECUTE'
      )
      or pg_catalog.has_function_privilege(
        'authenticated', required.function_oid, 'EXECUTE'
      )
  ) then
    raise exception 'sv_c7_unexpected_provider_rights_boundary';
  end if;
end;
$$;

create function public.app_provision_internal_paper_pilot_v1(
  p_owner_user_id uuid,
  p_account_id uuid,
  p_account_key text,
  p_strategy_id text,
  p_strategy_version text,
  p_strategy_rollback_identity text,
  p_symbol_selection_policy_id text,
  p_symbol_selection_policy_version text,
  p_observed_universe_version text,
  p_eligible_symbols text[],
  p_config_version text,
  p_starting_cash numeric,
  p_per_trade_risk_cap numeric,
  p_daily_loss_cap numeric,
  p_spread_bps numeric,
  p_slippage_bps numeric,
  p_commission_per_order numeric,
  p_provider_rights_evidence_id text,
  p_derived_evidence_retention_days integer,
  p_max_derived_evidence_bytes bigint,
  p_frozen_at timestamptz,
  p_provisioning_version text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_rights public.internal_paper_provider_rights_evidence%rowtype;
  v_account public.internal_paper_accounts%rowtype;
  v_policy_receipt jsonb;
  v_symbols text[];
  v_symbol_count integer;
  v_distinct_symbol_count integer;
  v_disposition text := 'created';
begin
  if p_provisioning_version is distinct from
      'internal_paper_pilot_provisioning_v1'
    or p_owner_user_id is null
    or p_account_id is null
    or p_account_key is null
    or length(p_account_key) not between 1 and 120
    or btrim(p_account_key) is distinct from p_account_key
    or p_account_key !~ '^[a-z0-9][a-z0-9_-]*$'
    or p_strategy_id is null or length(p_strategy_id) not between 1 and 120
    or p_strategy_version is null
      or length(p_strategy_version) not between 1 and 120
    or p_strategy_rollback_identity is null
      or length(p_strategy_rollback_identity) not between 1 and 240
    or p_symbol_selection_policy_id is null
      or length(p_symbol_selection_policy_id) not between 1 and 120
    or p_symbol_selection_policy_version is null
      or length(p_symbol_selection_policy_version) not between 1 and 120
    or p_observed_universe_version is null
      or length(p_observed_universe_version) not between 1 and 120
    or p_config_version is null or length(p_config_version) not between 1 and 120
    or p_provider_rights_evidence_id is null
      or length(p_provider_rights_evidence_id) not between 1 and 120
    or p_eligible_symbols is null
      or pg_catalog.cardinality(p_eligible_symbols) not between 1 and 10
    or p_starting_cash is null or p_starting_cash <= 0
    or p_per_trade_risk_cap is null or p_per_trade_risk_cap <= 0
    or p_daily_loss_cap is null or p_daily_loss_cap <= 0
    or p_per_trade_risk_cap > p_daily_loss_cap
    or p_daily_loss_cap > p_starting_cash
    or p_spread_bps is null or p_spread_bps < 0
    or p_slippage_bps is null or p_slippage_bps < 0
    or p_commission_per_order is null or p_commission_per_order < 0
    or p_derived_evidence_retention_days is null
      or p_derived_evidence_retention_days not between 1 and 3650
    or p_max_derived_evidence_bytes is null
      or p_max_derived_evidence_bytes not between 1048576 and 10737418240
    or p_frozen_at is null
  then
    raise exception 'invalid_internal_paper_pilot_provisioning';
  end if;

  select
    pg_catalog.array_agg(canonical.symbol order by canonical.symbol),
    pg_catalog.count(*),
    pg_catalog.count(distinct canonical.symbol)
  into v_symbols, v_symbol_count, v_distinct_symbol_count
  from (
    select upper(btrim(raw.symbol)) as symbol
    from pg_catalog.unnest(p_eligible_symbols) raw(symbol)
  ) canonical;

  if v_symbol_count <> pg_catalog.cardinality(p_eligible_symbols)
    or v_distinct_symbol_count <> v_symbol_count
    or exists (
      select 1
      from pg_catalog.unnest(v_symbols) symbol
      where symbol is null or symbol !~ '^[A-Z][A-Z0-9.]{0,15}$'
    )
  then
    raise exception 'invalid_internal_paper_pilot_symbols';
  end if;

  select * into v_rights
  from public.internal_paper_provider_rights_evidence rights
  where rights.evidence_id = p_provider_rights_evidence_id
    and rights.provider_plan = 'twelve_data_basic_free'
  for share;
  if not found or v_rights.admission_status <> 'admitted' then
    raise exception 'internal_paper_provider_rights_not_admitted';
  end if;
  if v_rights.max_exact_price_evidence_retention_days is null
    or p_derived_evidence_retention_days >
      v_rights.max_exact_price_evidence_retention_days
  then
    raise exception 'internal_paper_provider_rights_retention_exceeded';
  end if;

  insert into public.internal_paper_accounts(
    id, owner_user_id, account_key, status, base_currency, strategy_id,
    strategy_version, strategy_rollback_identity,
    symbol_selection_policy_id, symbol_selection_policy_version,
    observed_universe_version, eligible_symbols, config_version,
    fill_model_version, starting_cash, cash_balance, per_trade_risk_cap,
    daily_loss_cap, spread_bps, slippage_bps, commission_per_order,
    max_open_positions, state_version
  ) values (
    p_account_id, p_owner_user_id, p_account_key, 'paused', 'USD', p_strategy_id,
    p_strategy_version, p_strategy_rollback_identity,
    p_symbol_selection_policy_id, p_symbol_selection_policy_version,
    p_observed_universe_version, v_symbols, p_config_version,
    'internal_paper_immediate_costed_fill_v1', p_starting_cash,
    p_starting_cash, p_per_trade_risk_cap, p_daily_loss_cap, p_spread_bps,
    p_slippage_bps, p_commission_per_order, 1, 0
  )
  on conflict (owner_user_id, account_key) do nothing
  returning * into v_account;

  if not found then
    v_disposition := 'reused';
    select * into v_account
    from public.internal_paper_accounts account
    where account.owner_user_id = p_owner_user_id
      and account.account_key = p_account_key
    for update;
    if not found then
      raise exception 'internal_paper_pilot_provisioning_concurrency_conflict';
    end if;

    if v_account.status <> 'paused'
      or v_account.id is distinct from p_account_id
      or v_account.base_currency <> 'USD'
      or v_account.strategy_id is distinct from p_strategy_id
      or v_account.strategy_version is distinct from p_strategy_version
      or v_account.strategy_rollback_identity is distinct from
        p_strategy_rollback_identity
      or v_account.symbol_selection_policy_id is distinct from
        p_symbol_selection_policy_id
      or v_account.symbol_selection_policy_version is distinct from
        p_symbol_selection_policy_version
      or v_account.observed_universe_version is distinct from
        p_observed_universe_version
      or v_account.eligible_symbols is distinct from v_symbols
      or v_account.config_version is distinct from p_config_version
      or v_account.fill_model_version <>
        'internal_paper_immediate_costed_fill_v1'
      or v_account.starting_cash is distinct from p_starting_cash
      or v_account.cash_balance is distinct from p_starting_cash
      or v_account.per_trade_risk_cap is distinct from p_per_trade_risk_cap
      or v_account.daily_loss_cap is distinct from p_daily_loss_cap
      or v_account.spread_bps is distinct from p_spread_bps
      or v_account.slippage_bps is distinct from p_slippage_bps
      or v_account.commission_per_order is distinct from p_commission_per_order
      or v_account.max_open_positions <> 1
      or v_account.state_version <> 0
      or exists (
        select 1 from public.internal_paper_entry_intents entry_intent
        where entry_intent.account_id = v_account.id
      )
      or exists (
        select 1 from public.internal_paper_fills fill_record
        where fill_record.account_id = v_account.id
      )
      or exists (
        select 1 from public.internal_paper_positions position_record
        where position_record.account_id = v_account.id
      )
      or exists (
        select 1 from public.internal_paper_ledger_entries ledger_entry
        where ledger_entry.account_id = v_account.id
      )
      or exists (
        select 1 from public.internal_paper_exit_intents exit_intent
        where exit_intent.account_id = v_account.id
      )
      or exists (
        select 1 from public.internal_paper_exit_fills exit_fill
        where exit_fill.account_id = v_account.id
      )
      or exists (
        select 1 from public.internal_paper_worker_jobs job
        where job.account_id = v_account.id
      )
      or exists (
        select 1 from public.internal_paper_worker_heartbeats heartbeat
        where heartbeat.account_id = v_account.id
      )
    then
      raise exception 'internal_paper_pilot_provisioning_conflict';
    end if;
  end if;

  v_policy_receipt := public.app_freeze_internal_paper_pilot_policy_v1(
    p_owner_user_id,
    v_account.id,
    'internal_paper_pilot_operating_policy_2026_09_22_v1',
    v_rights.entitlement_evidence_reference,
    v_rights.retention_rights_evidence_reference,
    p_derived_evidence_retention_days,
    p_max_derived_evidence_bytes,
    p_frozen_at
  );

  return jsonb_build_object(
    'provisioning_version', p_provisioning_version,
    'disposition', v_disposition,
    'owner_user_id', v_account.owner_user_id,
    'account_id', v_account.id,
    'account_key', v_account.account_key,
    'account_status', v_account.status,
    'account_config_version', v_account.config_version,
    'eligible_symbols', to_jsonb(v_account.eligible_symbols),
    'provider_rights_evidence_id', p_provider_rights_evidence_id,
    'policy_version', v_policy_receipt ->> 'policy_version',
    'policy_disposition', v_policy_receipt ->> 'disposition',
    'frozen_at', v_policy_receipt ->> 'frozen_at'
  );
end;
$$;

revoke all on function public.app_provision_internal_paper_pilot_v1(
  uuid, uuid, text, text, text, text, text, text, text, text[], text, numeric,
  numeric, numeric, numeric, numeric, numeric, text, integer, bigint,
  timestamptz, text
) from public, anon, authenticated;
grant execute on function public.app_provision_internal_paper_pilot_v1(
  uuid, uuid, text, text, text, text, text, text, text, text[], text, numeric,
  numeric, numeric, numeric, numeric, numeric, text, integer, bigint,
  timestamptz, text
) to service_role;

comment on function public.app_provision_internal_paper_pilot_v1(
  uuid, uuid, text, text, text, text, text, text, text, text[], text, numeric,
  numeric, numeric, numeric, numeric, numeric, text, integer, bigint,
  timestamptz, text
) is
  'SV-C7 atomic service-role provisioning. Creates only a paused account plus immutable C5 policy after exact C6 rights admission; never activates work.';
